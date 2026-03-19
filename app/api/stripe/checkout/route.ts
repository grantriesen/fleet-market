import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Maps addon keys to Stripe price IDs
const ADDON_PRICES: Record<string, string> = {
  inventory: process.env.STRIPE_PRICE_ADDON_INVENTORY!,
  service:   process.env.STRIPE_PRICE_ADDON_SERVICE!,
  rentals:   process.env.STRIPE_PRICE_ADDON_RENTALS!,
};

const BUNDLE_PRICES: Record<number, string> = {
  2: process.env.STRIPE_PRICE_BUNDLE_2!,
  3: process.env.STRIPE_PRICE_BUNDLE_3!,
};

export async function POST(request: NextRequest) {
  try {
    const { site_id, addons = [] }: { site_id: string; addons: string[] } = await request.json();

    if (!site_id) {
      return NextResponse.json({ error: 'Missing site_id' }, { status: 400 });
    }

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

    // Build line items — base is always included
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: process.env.STRIPE_PRICE_BASE!, quantity: 1 },
    ];

    // Use bundle price if 2 or 3 add-ons selected, otherwise price individually
    const addonCount = addons.length;
    if (addonCount >= 2 && BUNDLE_PRICES[addonCount]) {
      lineItems.push({ price: BUNDLE_PRICES[addonCount], quantity: 1 });
    } else if (addonCount === 1) {
      lineItems.push({ price: ADDON_PRICES[addons[0]], quantity: 1 });
    }

    const origin = request.headers.get('origin') || 'https://app.fleetmarket.us';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      line_items: lineItems,
      success_url: `${origin}/dashboard?subscribed=true`,
      cancel_url: `${origin}/pricing?cancelled=true`,
      metadata: {
        site_id,
        addons: JSON.stringify(addons),
      },
      subscription_data: {
        metadata: {
          site_id,
          addons: JSON.stringify(addons),
        },
      },
    };

    // Re-use existing Stripe customer if available
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
