import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

function createSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { get() { return undefined; }, set() {}, remove() {} },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { user_id, full_name, company_name, email, phone } = await request.json();

    if (!user_id || !company_name || !email) {
      return NextResponse.json({ error: 'user_id, company_name, and email are required' }, { status: 400 });
    }

    const supabase = createSupabase();

    // Check if a manufacturer_partners record already exists for this company
    const slug = company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    
    let partnerId: string;

    const { data: existingPartner } = await supabase
      .from('manufacturer_partners')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existingPartner) {
      partnerId = existingPartner.id;
    } else {
      // Create new manufacturer_partners record
      const referralCode = company_name.toUpperCase().replace(/[^A-Z0-9]+/g, '').slice(0, 8) + new Date().getFullYear();

      const { data: newPartner, error: partnerError } = await supabase
        .from('manufacturer_partners')
        .insert({
          name: company_name,
          slug,
          referral_code: referralCode,
          contact_email: email,
          commission_rate: 15,
          commission_enabled: false,
          early_adopter_slots: 0,
          early_adopter_enabled: false,
          active: true,
        })
        .select('id')
        .single();

      if (partnerError || !newPartner) {
        console.error('Partner creation error:', partnerError);
        return NextResponse.json({ error: 'Failed to create manufacturer account' }, { status: 500 });
      }

      partnerId = newPartner.id;
    }

    // Check if user is already linked to this partner
    const { data: existingMembership } = await supabase
      .from('manufacturer_users')
      .select('id')
      .eq('user_id', user_id)
      .eq('partner_id', partnerId)
      .maybeSingle();

    if (existingMembership) {
      return NextResponse.json({ success: true, partner_id: partnerId, message: 'Already registered' });
    }

    // Create manufacturer_users record (first user is admin)
    const { error: memberError } = await supabase
      .from('manufacturer_users')
      .insert({
        user_id,
        partner_id: partnerId,
        role: 'admin',
        full_name,
        email,
        phone: phone || null,
        active: true,
      });

    if (memberError) {
      console.error('Manufacturer user creation error:', memberError);
      return NextResponse.json({ error: 'Failed to link user to manufacturer' }, { status: 500 });
    }

    // Try to link to manufacturer_library if a matching entry exists
    const { data: libMatch } = await supabase
      .from('manufacturer_library')
      .select('id, partner_id')
      .ilike('name', company_name)
      .maybeSingle();

    if (libMatch && !libMatch.partner_id) {
      await supabase
        .from('manufacturer_library')
        .update({ partner_id: partnerId })
        .eq('id', libMatch.id);
    }

    return NextResponse.json({ success: true, partner_id: partnerId });

  } catch (error: any) {
    console.error('Manufacturer register error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
