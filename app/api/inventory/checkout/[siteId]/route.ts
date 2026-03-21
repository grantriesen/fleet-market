// app/api/inventory/checkout/[siteId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function createSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function POST(request: NextRequest, { params }: { params: { siteId: string } }) {
  try {
    const { sessionId, items, customerEmail } = await request.json();
    if (!sessionId || !items?.length) {
      return NextResponse.json({ error: 'Missing sessionId or items' }, { status: 400 });
    }

    const supabase = createSupabase();

    const { data: site } = await supabase
      .from('sites')
      .select('id, site_name, slug, checkout_mode, stripe_account_id')
      .eq('id', params.siteId)
      .single();

    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    if (site.checkout_mode !== 'online') return NextResponse.json({ error: 'Online checkout not enabled' }, { status: 403 });
    if (!site.stripe_account_id) return NextResponse.json({ error: 'Dealer has not connected Stripe' }, { status: 400 });

    const origin = request.headers.get('origin') || `https://${site.slug}.fleetmarket.us`;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          images: item.primary_image ? [item.primary_image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity || 1,
    }));

    // Create session directly on the dealer's connected account
    // Money never touches Fleet Market — goes straight to dealer
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: lineItems,
        customer_email: customerEmail || undefined,
        success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/inventory`,
        metadata: {
          site_id: params.siteId,
          fm_session_id: sessionId,
        },
        payment_intent_data: {
          metadata: {
            site_id: params.siteId,
            fm_session_id: sessionId,
          },
        },
      },
      {
        stripeAccount: site.stripe_account_id, // runs entirely on dealer's account
      }
    );

    // Save pending order on our side for dealer's dashboard
    const total = items.reduce((sum: number, i: any) => sum + i.price * (i.quantity || 1), 0);
    await supabase.from('orders').insert({
      site_id: params.siteId,
      customer_email: customerEmail || null,
      items,
      subtotal: Math.round(total * 100),
      total: Math.round(total * 100),
      stripe_session_id: session.id,
      status: 'pending',
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
