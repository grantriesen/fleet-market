// app/api/stripe/disconnect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: site } = await supabase
      .from('sites')
      .select('id, stripe_account_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    if (!site.stripe_account_id) return NextResponse.json({ error: 'No Stripe account connected' }, { status: 400 });

    // Deauthorize the connected account from the platform
    try {
      await stripe.oauth.deauthorize({
        client_id: process.env.STRIPE_CONNECT_CLIENT_ID!,
        stripe_user_id: site.stripe_account_id,
      });
    } catch (stripeErr: any) {
      // If already deauthorized or account deleted, still clear from our DB
      console.warn('Stripe deauthorize warning:', stripeErr.message);
    }

    // Clear from our database and revert to quote_only
    const serviceSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
    );

    await serviceSupabase
      .from('sites')
      .update({
        stripe_account_id: null,
        checkout_mode: 'quote_only',
      })
      .eq('id', site.id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Stripe disconnect error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
