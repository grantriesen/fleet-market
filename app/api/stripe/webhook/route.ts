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

      // Activate the site and set addons
      await supabase.from('sites').update({
        subscription_status: 'active',
        stripe_customer_id:     session.customer as string,
        stripe_subscription_id: session.subscription as string,
        addons,
      }).eq('id', site_id);

      // Seed site_features for all addon key variants
      if (addons.length > 0) {
        const featureKeyMap: Record<string, string[]> = {
          inventory: ['inventory_management', 'inventory', 'inventory_sync'],
          service:   ['service_scheduling', 'service'],
          rentals:   ['rental_management', 'rentals', 'rental_scheduling'],
        };
        const featureRows: { site_id: string; feature_key: string; enabled: boolean }[] = [];
        addons.forEach((a: string) => {
          (featureKeyMap[a] || []).forEach((key: string) => {
            featureRows.push({ site_id, feature_key: key, enabled: true });
          });
        });
        if (featureRows.length > 0) {
          await supabase.from('site_features').upsert(featureRows, { onConflict: 'site_id,feature_key' });
        }
      }

      // Seed default service types if service addon purchased
      if (addons.includes('service')) {
        const { data: existing } = await supabase
          .from('service_types')
          .select('id')
          .eq('site_id', site_id)
          .limit(1);
        if (!existing || existing.length === 0) {
          await supabase.from('service_types').insert([
            { site_id, name: 'Routine Maintenance', description: 'Oil change, filter replacement, blade sharpening, and general tune-up.', duration_minutes: 60, price_estimate: 'Call for pricing', display_order: 1, is_active: true },
            { site_id, name: 'Equipment Repair',    description: 'Diagnosis and repair of mechanical or electrical issues.',              duration_minutes: 120, price_estimate: 'Call for pricing', display_order: 2, is_active: true },
            { site_id, name: 'Blade Service',       description: 'Blade removal, sharpening, balancing, and reinstallation.',            duration_minutes: 30, price_estimate: 'Call for pricing', display_order: 3, is_active: true },
            { site_id, name: 'Seasonal Prep',       description: 'Full seasonal inspection and preparation for storage or operation.',    duration_minutes: 90, price_estimate: 'Call for pricing', display_order: 4, is_active: true },
          ]);
        }
      }

      // Create subscription record
      await supabase.from('subscriptions').upsert({
        site_id,
        has_base_package: true,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: 'site_id' });

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

