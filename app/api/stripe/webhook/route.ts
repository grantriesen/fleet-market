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

    // ── Invoice paid — calculate and pay partner commission ──
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeCustomerId = invoice.customer as string;

      if (!invoice.amount_paid || invoice.amount_paid === 0) break;

      const { data: site } = await supabase
        .from('sites')
        .select('id, partner_id')
        .eq('stripe_customer_id', stripeCustomerId)
        .maybeSingle();

      if (!site || !site.partner_id) break;

      const { data: partner } = await supabase
        .from('manufacturer_partners')
        .select('id, stripe_account_id, commission_rate')
        .eq('id', site.partner_id)
        .single();

      if (!partner || !partner.stripe_account_id) break;

      // Use subtotal (pretax) for commission calculation
      const subtotalCents   = (invoice as any).subtotal ?? invoice.amount_paid;
      const commissionRate  = Number(partner.commission_rate) || 0.15;
      const commissionCents = Math.round(subtotalCents * commissionRate);

      if (commissionCents <= 0) break;

      // Idempotency check
      const { data: existing } = await supabase
        .from('partner_commissions')
        .select('id')
        .eq('stripe_invoice_id', invoice.id as string)
        .maybeSingle();

      if (existing) break;

      let transferId: string | null = null;
      let status = 'pending';

      try {
        const transfer = await stripe.transfers.create({
          amount:      commissionCents,
          currency:    'usd',
          destination: partner.stripe_account_id,
          metadata:    { partner_id: partner.id, site_id: site.id, invoice_id: invoice.id as string },
        });
        transferId = transfer.id;
        status = 'paid';
        console.log(`✓ Commission $${(commissionCents/100).toFixed(2)} paid to partner ${partner.id}`);
      } catch (transferErr: any) {
        console.error('Commission transfer failed:', transferErr.message);
        status = 'failed';
      }

      await supabase.from('partner_commissions').insert({
        partner_id:            partner.id,
        site_id:               site.id,
        stripe_invoice_id:     invoice.id,
        invoice_amount_cents:  subtotalCents,
        commission_cents:      commissionCents,
        status,
        stripe_transfer_id:    transferId,
        period_start:          (invoice as any).period_start ? new Date((invoice as any).period_start * 1000).toISOString() : null,
        period_end:            (invoice as any).period_end   ? new Date((invoice as any).period_end   * 1000).toISOString() : null,
      });

      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}

