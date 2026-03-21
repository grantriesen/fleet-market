import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

// Maps form_type to a human-friendly label
const FORM_LABELS: Record<string, string> = {
  contact: 'Contact Form',
  service: 'Service Request',
  rental: 'Rental Inquiry',
};

// Maps form_type to a lead source label that matches the dashboard filter options
const SOURCE_MAP: Record<string, string> = {
  contact: 'contact_form',
  service: 'quote_request',
  rental: 'quote_request',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { site_id, form_type, name, email, phone, message, extra_data } = body;

    if (!site_id || !form_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: { get() { return undefined; }, set() {}, remove() {} },
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );

    // ----------------------------------------------------------------
    // 1. Save to form_submissions (existing behaviour)
    // ----------------------------------------------------------------
    const { error: submissionError } = await supabase.from('form_submissions').insert({
      site_id,
      form_type,
      name: name || null,
      email: email || null,
      phone: phone || null,
      message: message || null,
      extra_data: extra_data || null,
    });

    if (submissionError) {
      console.error('Form submission error:', submissionError);
      return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 });
    }

    // ----------------------------------------------------------------
    // 2. Sync to lead_captures so the dashboard Leads page shows it
    // ----------------------------------------------------------------
    const { error: leadError } = await supabase.from('lead_captures').insert({
      site_id,
      name: name || null,
      email: email || null,
      phone: phone || null,
      message: message || null,
      source: SOURCE_MAP[form_type] ?? 'contact_form',
      tags: [form_type],
      extra_data: extra_data || null,
    });

    if (leadError) {
      console.error('lead_captures sync error:', leadError);
    }

    // ----------------------------------------------------------------
    // 3. If service form — also create a service_appointments row
    //    so it appears immediately in the dealer's service dashboard
    // ----------------------------------------------------------------
    if (form_type === 'service') {
      const ed = extra_data || {};
      // full_name comes from extra_data when first+last are separate fields
      const customerName = ed.full_name || name || null;
      const { error: apptError } = await supabase.from('service_appointments').insert({
        site_id,
        customer_name:     customerName,
        customer_email:    email || null,
        customer_phone:    phone || null,
        service_type_name: ed.service_type || null,
        is_custom_request: !ed.service_type,
        custom_description: message || ed.notes || null,
        equipment_type:    ed.equipment_type || null,
        equipment_make:    ed.equipment_make || null,
        equipment_model:   ed.equipment_model || null,
        preferred_date:    ed.preferred_date || null,
        preferred_time:    null,
        customer_notes:    message || ed.notes || null,
        status:            'pending',
      });

      if (apptError) {
        // Non-fatal — log but don't fail
        console.error('service_appointments sync error:', apptError);
      }
    }

    // ----------------------------------------------------------------
    // 3. Fetch the dealer's notification email from the sites table
    // ----------------------------------------------------------------
    const { data: site } = await supabase
      .from('sites')
      .select('site_name, notification_email, user_id')
      .eq('id', site_id)
      .single();

    // Fall back to the owner's auth email if no notification_email is set
    let dealerEmail = site?.notification_email ?? null;

    if (!dealerEmail && site?.user_id) {
      const { data: userData } = await supabase.auth.admin.getUserById(site.user_id);
      dealerEmail = userData?.user?.email ?? null;
    }

    // ----------------------------------------------------------------
    // 4. Send Resend notification to the dealer
    // ----------------------------------------------------------------
    if (dealerEmail) {
      const formLabel = FORM_LABELS[form_type] ?? form_type;
      const siteName = site?.site_name ?? 'Your Fleet Market Site';

      // Build a readable extra_data block if present
      const extraLines = extra_data && typeof extra_data === 'object'
        ? Object.entries(extra_data)
            .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;font-size:14px;">${k}</td><td style="padding:4px 0;font-size:14px;">${v}</td></tr>`)
            .join('')
        : '';

      await resend.emails.send({
        from: `Fleet Market <notifications@fleetmarket.us>`,
        to: dealerEmail,
        replyTo: email || undefined,
        subject: `New ${formLabel} submission — ${siteName}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111827;">
            <div style="background:#16a34a;padding:24px 32px;border-radius:8px 8px 0 0;">
              <h1 style="color:#fff;margin:0;font-size:20px;">New ${formLabel}</h1>
              <p style="color:#dcfce7;margin:6px 0 0;font-size:14px;">${siteName}</p>
            </div>

            <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:4px 12px 4px 0;color:#6b7280;font-size:14px;">Name</td>
                  <td style="padding:4px 0;font-size:14px;font-weight:600;">${name || '—'}</td>
                </tr>
                <tr>
                  <td style="padding:4px 12px 4px 0;color:#6b7280;font-size:14px;">Email</td>
                  <td style="padding:4px 0;font-size:14px;">${email ? `<a href="mailto:${email}" style="color:#16a34a;">${email}</a>` : '—'}</td>
                </tr>
                <tr>
                  <td style="padding:4px 12px 4px 0;color:#6b7280;font-size:14px;">Phone</td>
                  <td style="padding:4px 0;font-size:14px;">${phone ? `<a href="tel:${phone}" style="color:#16a34a;">${phone}</a>` : '—'}</td>
                </tr>
                ${extraLines}
              </table>

              ${message ? `
              <div style="margin-top:24px;padding:16px;background:#f9fafb;border-radius:8px;border-left:3px solid #16a34a;">
                <p style="margin:0 0 6px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Message</p>
                <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${message}</p>
              </div>` : ''}

              <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e7eb;text-align:center;">
                <a href="https://app.fleetmarket.us${form_type === 'service' ? '/dashboard/service' : '/dashboard/leads'}"
                   style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;">
                  View in Dashboard →
                </a>
              </div>

              <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;text-align:center;">
                Sent by Fleet Market · <a href="https://app.fleetmarket.us" style="color:#9ca3af;">app.fleetmarket.us</a>
              </p>
            </div>
          </div>
        `,
      });
    } else {
      console.warn(`No notification email found for site ${site_id} — skipping Resend.`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Submit form error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
