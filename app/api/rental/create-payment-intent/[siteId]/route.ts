// app/api/rental/create-payment-intent/[siteId]/route.ts
// Creates a Stripe PaymentIntent for a rental deposit on the dealer's connected account
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest, { params }: { params: { siteId: string } }) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { siteId } = params;
    const body = await request.json();
    const { rentalItemId, depositAmount } = body;

    if (!rentalItemId || !depositAmount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get dealer's connected Stripe account
    const { data: site } = await supabase
      .from('sites')
      .select('stripe_account_id, site_name')
      .eq('id', siteId)
      .single();

    if (!site?.stripe_account_id) {
      return NextResponse.json({ error: 'Dealer payment processing not configured' }, { status: 400 });
    }

    // Verify the deposit amount matches the inventory item
    const { data: item } = await supabase
      .from('rental_inventory')
      .select('deposit_required, title')
      .eq('id', rentalItemId)
      .eq('site_id', siteId)
      .single();

    if (!item) {
      return NextResponse.json({ error: 'Rental item not found' }, { status: 404 });
    }

    const expectedDeposit = item.deposit_required || 0;
    if (Math.abs(expectedDeposit - depositAmount) > 0.01) {
      return NextResponse.json({ error: 'Invalid deposit amount' }, { status: 400 });
    }

    // Create PaymentIntent on the dealer's connected account
    // Platform takes no fee on deposits — dealer gets full amount
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: Math.round(depositAmount * 100), // cents
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        description: `Rental deposit — ${item.title}`,
        metadata: {
          site_id: siteId,
          rental_item_id: rentalItemId,
          deposit_type: 'rental_deposit',
        },
      },
      {
        stripeAccount: site.stripe_account_id,
      }
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      depositAmount,
    });
  } catch (err: any) {
    console.error('Payment intent error:', err);
    return NextResponse.json({ error: err.message || 'Failed to initialize payment' }, { status: 500 });
  }
}
