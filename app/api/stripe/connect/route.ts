// app/api/stripe/connect/route.ts
// Stripe Connect OAuth — lets dealers connect their own Stripe account
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// GET — redirect dealer to Stripe Connect OAuth
export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));

  const { data: site } = await supabase
    .from('sites')
    .select('id, slug')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!site) return NextResponse.redirect(new URL('/dashboard', request.url));

  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/stripe/connect/callback`;

  const url = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${process.env.STRIPE_CONNECT_CLIENT_ID}&scope=read_write&redirect_uri=${encodeURIComponent(redirectUri)}&state=${site.id}`;

  return NextResponse.redirect(url);
}

// POST — save connected account ID after OAuth callback
export async function POST(request: NextRequest) {
  try {
    const { siteId, stripeAccountId } = await request.json();
    if (!siteId || !stripeAccountId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
    );

    await supabase.from('sites').update({ stripe_account_id: stripeAccountId }).eq('id', siteId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
