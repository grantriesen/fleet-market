// app/api/create-checkout-session/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Price IDs for your Stripe products
const PRICE_IDS = {
  // Monthly prices
  monthly: {
    base_plus_1: process.env.STRIPE_PRICE_MONTHLY_BASE_PLUS_1!, // $300/month
    base_plus_2: process.env.STRIPE_PRICE_MONTHLY_BASE_PLUS_2!, // $375/month
    base_plus_3: process.env.STRIPE_PRICE_MONTHLY_BASE_PLUS_3!, // $430/month
  },
  // Annual prices
  annual: {
    base_plus_1: process.env.STRIPE_PRICE_ANNUAL_BASE_PLUS_1!, // $3,100/year
    base_plus_2: process.env.STRIPE_PRICE_ANNUAL_BASE_PLUS_2!, // $3,925/year
    base_plus_3: process.env.STRIPE_PRICE_ANNUAL_BASE_PLUS_3!, // $4,530/year
  }
};

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { siteId, features, billingInterval = 'month' } = await request.json();

    // Validate features
    if (!Array.isArray(features) || features.length === 0) {
      return NextResponse.json({ error: 'Must select at least one feature' }, { status: 400 });
    }

    const validFeatures = ['inventory_sync', 'rental_scheduling', 'service_scheduling'];
    const invalidFeatures = features.filter((f: string) => !validFeatures.includes(f));
    
    if (invalidFeatures.length > 0) {
      return NextResponse.json({ error: 'Invalid features selected' }, { status: 400 });
    }

    // Get site to check ownership
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id, site_name, user_id, stripe_customer_id')
      .eq('id', siteId)
      .single();

    if (siteError || !site || site.user_id !== user.id) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // Determine which plan based on feature count and billing interval
    let priceId: string;
    let tierKey: string;
    const prices = billingInterval === 'year' ? PRICE_IDS.annual : PRICE_IDS.monthly;
    
    if (features.length === 1) {
      priceId = prices.base_plus_1;
      tierKey = 'base_plus_1';
    } else if (features.length === 2) {
      priceId = prices.base_plus_2;
      tierKey = 'base_plus_2';
    } else {
      priceId = prices.base_plus_3;
      tierKey = 'base_plus_3';
    }

    // Get or create Stripe customer
    let customerId = site.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
          site_id: siteId,
        },
      });
      customerId = customer.id;

      // Save customer ID
      await supabase
        .from('sites')
        .update({ stripe_customer_id: customerId })
        .eq('id', siteId);
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?upgrade=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/customize/${siteId}?upgrade=canceled`,
      metadata: {
        site_id: siteId,
        user_id: user.id,
        tier_key: tierKey,
        features: features.join(','), // Store selected features
        billing_interval: billingInterval,
      },
      subscription_data: {
        metadata: {
          site_id: siteId,
          user_id: user.id,
          tier_key: tierKey,
          features: features.join(','),
          billing_interval: billingInterval,
        },
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
