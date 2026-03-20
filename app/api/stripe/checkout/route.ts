import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Monthly price IDs
const MONTHLY: Record<string, string> = {
  base:            process.env.STRIPE_PRICE_BASE!,
  addon_inventory: process.env.STRIPE_PRICE_ADDON_INVENTORY!,
  addon_service:   process.env.STRIPE_PRICE_ADDON_SERVICE!,
  addon_rentals:   process.env.STRIPE_PRICE_ADDON_RENTALS!,
  bundle_2:        process.env.STRIPE_PRICE_BUNDLE_2!,
  bundle_3:        process.env.STRIPE_PRICE_BUNDLE_3!,
};

// Annual price IDs
const ANNUAL: Record<string, string> = {
  base:            process.env.STRIPE_PRICE_BASE_ANNUAL!,
  addon_inventory: process.env.STRIPE_PRICE_ADDON_INVENTORY_ANNUAL!,
  addon_service:   process.env.STRIPE_PRICE_ADDON_SERVICE_ANNUAL!,
  addon_rentals:   process.env.STRIPE_PRICE_ADDON_RENTALS_ANNUAL!,
  bundle_2:        process.env.STRIPE_PRICE_BUNDLE_2_ANNUAL!,
  bundle_3:        process.env.STRIPE_PRICE_BUNDLE_3_ANNUAL!,
};

export async function POST(request: NextRequest) {
  try {
    const {
      site_id,
      addons = [],
      billing = 'monthly', // 'monthly' | 'annual'
    }: { site_id: string; addons: string[]; billing?: string } = await request.json();

    if (!site_id) {
      return NextResponse.json({ error: 'Missing site_id' }, { status: 400 });
    }

    const prices = billing === 'annual' ? ANNUAL : MONTHLY;

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: { get() { return undefined; }, set() {}, remove() {} },
        auth: { persistSession: false, autoRefreshToken: false },
      }
    );

    const { data: site } = await supabase
      .from('sites')
      .select('id, site_name, stripe_customer_id')
      .eq('id', site_id)
      .single();

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Base is always included
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: prices.base, quantity: 1 },
    ];

    // Use bundle price for 2-3 add-ons, individual price for 1
    const addonCount = addons.length;
    if (addonCount === 3) {
      lineItems.push({ price: prices.bundle_3, quantity: 1 });
    } else if (addonCount === 2) {
      lineItems.push({ price: prices.bundle_2, quantity: 1 });
    } else if (addonCount === 1) {
      const addonKey = `addon_${addons[0]}`;
      lineItems.push({ price: prices[addonKey], quantity: 1 });
    }

    const origin = request.headers.get('origin') || 'https://app.fleetmarket.us';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: lineItems,
      success_url: `${origin}/dashboard?subscribed=true`,
      cancel_url:  `${origin}/pricing?cancelled=true`,
      metadata: {
        site_id,
        addons:  JSON.stringify(addons),
        billing,
      },
      subscription_data: {
        metadata: {
          site_id,
          addons:  JSON.stringify(addons),
          billing,
        },
      },
    };

    if (site.stripe_customer_id) {
      sessionParams.customer = site.stripe_customer_id;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
