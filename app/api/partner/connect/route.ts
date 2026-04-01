// app/api/partner/connect/route.ts
// Called when a manufacturer clicks "Connect Stripe Account" in the admin view
// Creates a Stripe Connect OAuth link for them to onboard

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { partnerId } = await request.json();
    if (!partnerId) return NextResponse.json({ error: 'partnerId required' }, { status: 400 });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: partner } = await supabase
      .from('manufacturer_partners')
      .select('id, name, slug')
      .eq('id', partnerId)
      .single();

    if (!partner) return NextResponse.json({ error: 'Partner not found' }, { status: 404 });

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL;

    // Create Stripe Connect account link
    const account = await stripe.accounts.create({
      type: 'express',
      metadata: { partner_id: partnerId, partner_slug: partner.slug },
    });

    // Save the account ID immediately
    await supabase
      .from('manufacturer_partners')
      .update({ stripe_account_id: account.id })
      .eq('id', partnerId);

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${origin}/admin/partners?connect=refresh&partner=${partnerId}`,
      return_url:  `${origin}/admin/partners?connect=success&partner=${partnerId}`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });

  } catch (err: any) {
    console.error('Partner connect error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
