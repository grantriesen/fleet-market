// app/api/partner/apply-referral/route.ts
// Called after site creation to apply referral code, check early adopter slots,
// and set up free addon period if eligible

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  try {
    const { siteId, referralCode, billingInterval = 'monthly' } = await request.json();
    if (!siteId || !referralCode) return NextResponse.json({ error: 'siteId and referralCode required' }, { status: 400 });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
    );

    // Look up the partner by referral code
    const { data: partner } = await supabase
      .from('manufacturer_partners')
      .select('id, name, early_adopter_slots, early_adopter_used, active')
      .eq('referral_code', referralCode.toUpperCase())
      .eq('active', true)
      .maybeSingle();

    if (!partner) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    // Check early adopter slot availability
    const slotsRemaining = partner.early_adopter_slots - partner.early_adopter_used;
    const isEarlyAdopter = slotsRemaining > 0;

    // Free addon months: 3 for monthly, 6 for annual
    const freeMonths = billingInterval === 'annual' ? 6 : 3;
    const freeUntil  = isEarlyAdopter
      ? new Date(Date.now() + freeMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Update the site with partner info
    await supabase
      .from('sites')
      .update({
        partner_id:                partner.id,
        referral_code:             referralCode.toUpperCase(),
        early_adopter:             isEarlyAdopter,
        early_adopter_free_until:  freeUntil,
      })
      .eq('id', siteId);

    // Increment slot usage if early adopter
    if (isEarlyAdopter) {
      await supabase
        .from('manufacturer_partners')
        .update({ early_adopter_used: partner.early_adopter_used + 1 })
        .eq('id', partner.id);
    }

    return NextResponse.json({
      success:        true,
      partnerName:    partner.name,
      isEarlyAdopter,
      freeMonths:     isEarlyAdopter ? freeMonths : 0,
      freeUntil,
      slotsRemaining: Math.max(0, slotsRemaining - 1),
    });

  } catch (err: any) {
    console.error('Apply referral error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
