// ─── app/api/beta-signup/route.ts ───
// Handles beta registration: Supabase insert + confirmation email via Resend
import { NextRequest, NextResponse } from 'next/server';

const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { first_name, last_name, email, phone, company, job_title, billing_preference } = body;

    // Validate required fields
    if (!first_name || !last_name || !email || !phone || !company || !job_title) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // 1. Insert into Supabase beta_signups table
    const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/beta_signups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        first_name,
        last_name,
        email,
        phone,
        company,
        job_title,
        billing_preference: billing_preference || 'undecided',
        registered_at: new Date().toISOString(),
      }),
    });

    if (!sbRes.ok) {
      const err = await sbRes.json().catch(() => ({}));
      if (err.code === '23505') {
        return NextResponse.json({ error: 'This email has already been registered for the beta.' }, { status: 409 });
      }
      console.error('Supabase error:', err);
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
    }

    // 2. Send confirmation email via Resend
    try {
      const emailHtml = buildConfirmationEmail(first_name, company);

      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Fleet Market <hello@fleetmarket.us>',
          to: [email],
          subject: `Welcome to Fleet Market Beta, ${first_name}!`,
          html: emailHtml,
        }),
      });

      if (!emailRes.ok) {
        const emailErr = await emailRes.json().catch(() => ({}));
        console.error('Resend error (non-blocking):', emailErr);
        // Don't fail the signup if email fails — they're already registered
      }
    } catch (emailError) {
      console.error('Email send error (non-blocking):', emailError);
    }

    // 3. Return success
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Beta signup error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

// ─── HTML Email Template ───
function buildConfirmationEmail(firstName: string, companyName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Fleet Market Beta</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
    <tr>
      <td align="center">
        <!-- Email Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0C1B33,#1E3A6E);padding:32px 40px;border-radius:12px 12px 0 0;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#1E3A6E;border:2px solid rgba(255,255,255,0.15);border-radius:8px;padding:6px 10px;">
                    <span style="color:#ffffff;font-weight:900;font-size:16px;letter-spacing:0.5px;">FM</span>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="color:#ffffff;font-weight:800;font-size:22px;">Fleet</span><span style="color:#E85525;font-weight:800;font-size:22px;">Market</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Orange accent line -->
          <tr>
            <td style="background:linear-gradient(90deg,#E85525,#F06A3E);height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;">
              <!-- Welcome -->
              <h1 style="margin:0 0 8px;font-size:26px;font-weight:800;color:#0f172a;line-height:1.2;">
                You're in, ${firstName}! 🎉
              </h1>
              <p style="margin:0 0 24px;font-size:16px;color:#64748b;line-height:1.6;">
                Your beta spot for <strong style="color:#0f172a;">${companyName}</strong> has been reserved. Welcome to Fleet Market.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">

              <!-- What's Next -->
              <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#0f172a;">
                What Happens Next
              </h2>

              <!-- Step 1 -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;">
                <tr>
                  <td width="48" valign="top">
                    <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:#fff;font-weight:800;font-size:16px;line-height:40px;text-align:center;">1</div>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0 0 2px;font-size:15px;font-weight:700;color:#0f172a;">March 9 — Dashboard Access Email</p>
                    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.5;">
                      You'll receive an email with your login credentials and a link to the Fleet Market dashboard.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Step 2 -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;">
                <tr>
                  <td width="48" valign="top">
                    <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#E85525,#F06A3E);color:#fff;font-weight:800;font-size:16px;line-height:40px;text-align:center;">2</div>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0 0 2px;font-size:15px;font-weight:700;color:#0f172a;">Select Your Add-Ons</p>
                    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.5;">
                      Choose the premium features you want — Inventory Management, Service Scheduling, Rental Systems — all free during your beta period.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Step 3 -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
                <tr>
                  <td width="48" valign="top">
                    <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#a855f7,#9333ea);color:#fff;font-weight:800;font-size:16px;line-height:40px;text-align:center;">3</div>
                  </td>
                  <td style="padding-left:12px;">
                    <p style="margin:0 0 2px;font-size:15px;font-weight:700;color:#0f172a;">Customize Your Website</p>
                    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.5;">
                      Use the website customizer to add your branding, inventory, manufacturer logos, and content. Our team is here to help.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">

              <!-- Key Date Highlight -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:20px 24px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="48" valign="top">
                          <div style="font-size:28px;line-height:1;">📅</div>
                        </td>
                        <td style="padding-left:12px;">
                          <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#1e40af;">Mark Your Calendar</p>
                          <p style="margin:0;font-size:14px;color:#3b82f6;line-height:1.5;">
                            <strong>March 9</strong> — Dashboard access &amp; add-on selection<br>
                            <strong>March 23</strong> — All beta sites go live<br>
                            <strong>May 1</strong> — First billing begins (not a day sooner)
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0 24px;">

              <!-- CTA -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <p style="margin:0 0 16px;font-size:15px;color:#64748b;">
                      In the meantime, take a look at what your dashboard will look like:
                    </p>
                    <a href="https://www.fleetmarket.us/dashboard-preview" style="display:inline-block;background:linear-gradient(135deg,#E85525,#F06A3E);color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;box-shadow:0 4px 14px rgba(232,85,37,0.3);">
                      Preview Your Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;">
              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;text-align:center;">
                Questions? Reply to this email or reach us at
                <a href="mailto:hello@fleetmarket.us" style="color:#E85525;text-decoration:none;font-weight:600;">hello@fleetmarket.us</a>
              </p>
              <p style="margin:0;font-size:12px;color:#cbd5e1;text-align:center;">
                © 2026 Fleet Market by Good Life Advertising · Blair, NE
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
