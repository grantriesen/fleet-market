import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature error:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createSupabase();

  switch (event.type) {
    // ── Checkout completed — activate subscription ──
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const site_id = session.metadata?.site_id;
      const addons: string[] = JSON.parse(session.metadata?.addons || '[]');

      if (!site_id) break;

      await supabase.from('sites').update({
        subscription_status: 'active',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        addons,
      }).eq('id', site_id);

      console.log(`✓ Activated site ${site_id} with addons: ${addons.join(', ') || 'none'}`);
      break;
    }

    // ── Subscription updated (e.g. add-ons changed) ──
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const site_id = sub.metadata?.site_id;
      const addons: string[] = JSON.parse(sub.metadata?.addons || '[]');

      if (!site_id) break;

      await supabase.from('sites').update({
        subscription_status: sub.status === 'active' ? 'active' : 'inactive',
        addons,
      }).eq('id', site_id);

      break;
    }

    // ── Subscription cancelled or payment failed — deactivate ──
    case 'customer.subscription.deleted':
    case 'invoice.payment_failed': {
      const obj = event.data.object as any;
      const stripeCustomerId = obj.customer as string;

      await supabase.from('sites').update({
        subscription_status: 'inactive',
        addons: [],
      }).eq('stripe_customer_id', stripeCustomerId);

      console.log(`✗ Deactivated site for customer ${stripeCustomerId}`);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

