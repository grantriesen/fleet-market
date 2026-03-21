// app/api/stripe/connect/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get('code');
  const state = searchParams.get('state'); // site_id
  const error = searchParams.get('error');

  const origin = new URL(request.url).origin;

  if (error || !code || !state) {
    console.error('Stripe Connect error:', error);
    return NextResponse.redirect(`${origin}/dashboard?stripe_connect=error`);
  }

  try {
    // Exchange code for access token
    const response = await stripe.oauth.token({ grant_type: 'authorization_code', code });
    const stripeAccountId = response.stripe_user_id;

    if (!stripeAccountId) throw new Error('No stripe_user_id in response');

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
    );

    await supabase
      .from('sites')
      .update({ stripe_account_id: stripeAccountId })
      .eq('id', state);

    return NextResponse.redirect(`${origin}/dashboard?stripe_connect=success`);
  } catch (err: any) {
    console.error('Stripe Connect callback error:', err);
    return NextResponse.redirect(`${origin}/dashboard?stripe_connect=error`);
  }
}
