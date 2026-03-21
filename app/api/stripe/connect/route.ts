// app/api/stripe/connect/route.ts
// Creates a Stripe Connect account + Account Link for dealer onboarding
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.redirect(new URL('/login', request.url));

    const { data: site } = await supabase
      .from('sites')
      .select('id, slug, stripe_account_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!site) return NextResponse.redirect(new URL('/dashboard', request.url));

    const origin = new URL(request.url).origin;
    let accountId = site.stripe_account_id;

    if (!accountId) {
      // Create a new Express account for the dealer
      const account = await stripe.accounts.create({
        type: 'express',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: { site_id: site.id, site_slug: site.slug },
      });
      accountId = account.id;

      // Save immediately so onboarding can resume if interrupted
      const serviceSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
      );
      await serviceSupabase.from('sites').update({ stripe_account_id: accountId }).eq('id', site.id);
    }

    // Create Account Link — hosted onboarding flow
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/api/stripe/connect`,
      return_url: `${origin}/dashboard?stripe_connect=success`,
      type: 'account_onboarding',
    });

    return NextResponse.redirect(accountLink.url);
  } catch (err: any) {
    console.error('Stripe Connect error:', err);
    return NextResponse.redirect(new URL('/dashboard?stripe_connect=error', request.url));
  }
}
