// app/api/inventory/webhook/route.ts
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

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_INVENTORY_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Inventory webhook signature error:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createSupabase();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const siteId = session.metadata?.site_id;
    const fmSessionId = session.metadata?.fm_session_id;

    if (siteId) {
      // Mark order as paid
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          stripe_payment_intent_id: session.payment_intent as string,
          customer_email: session.customer_email || undefined,
          customer_name: session.customer_details?.name || null,
          customer_phone: session.customer_details?.phone || null,
          customer_address: session.customer_details?.address
            ? [
                session.customer_details.address.line1,
                session.customer_details.address.city,
                session.customer_details.address.state,
                session.customer_details.address.postal_code,
              ].filter(Boolean).join(', ')
            : null,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_session_id', session.id)
        .eq('site_id', siteId);

      // Clear the cart
      if (fmSessionId) {
        await supabase
          .from('carts')
          .update({ items: [], updated_at: new Date().toISOString() })
          .eq('site_id', siteId)
          .eq('session_id', fmSessionId);
      }

      console.log(`✓ Order paid for site ${siteId}, session ${session.id}`);
    }
  }

  return NextResponse.json({ received: true });
}
