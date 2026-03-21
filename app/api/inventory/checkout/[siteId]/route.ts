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
    const { sessionId, items, customerEmail, destination, shippingZoneId } = await request.json();
    // destination: { zip, city, state, country }
    // shippingZoneId: selected zone id from checkout UI

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
    const orderTotal = items.reduce((sum: number, i: any) => sum + i.price * (i.quantity || 1), 0);
    const itemCount = items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);

    // ── Calculate shipping ──
    let shippingAmount = 0;
    let shippingLabel = 'Shipping';
    let shippingEstimate = '';

    if (shippingZoneId && destination) {
      const { data: zone } = await supabase
        .from('shipping_zones')
        .select('*')
        .eq('id', shippingZoneId)
        .eq('site_id', params.siteId)
        .single();

      if (zone) {
        shippingLabel = zone.label;
        shippingEstimate = zone.estimated_days || '';
        switch (zone.rate_type) {
          case 'free':    shippingAmount = 0; break;
          case 'flat':    shippingAmount = zone.rate_amount || 0; break;
          case 'per_item':shippingAmount = (zone.per_item_amount || zone.rate_amount || 0) * itemCount; break;
          case 'percentage': shippingAmount = Math.round(orderTotal * (zone.rate_amount / 100) * 100) / 100; break;
          case 'free_over':  shippingAmount = orderTotal >= (zone.min_order_amount || 0) ? 0 : (zone.rate_amount || 0); break;
        }
      }
    }

    // ── Calculate tax ──
    let taxAmount = 0;
    if (destination) {
      const { data: taxRules } = await supabase
        .from('tax_rules')
        .select('*')
        .eq('site_id', params.siteId)
        .eq('is_active', true);

      const dest = destination;
      const matchingRules = (taxRules || []).filter((r: any) => {
        if (r.applies_to === 'all') return true;
        const vals = (r.scope_values || []).map((v: string) => v.toLowerCase().trim());
        if (r.applies_to === 'country') return vals.includes((dest.country || '').toLowerCase());
        if (r.applies_to === 'state')   return vals.includes((dest.state || '').toLowerCase());
        if (r.applies_to === 'city')    return vals.includes((dest.city || '').toLowerCase());
        if (r.applies_to === 'zip')     return vals.includes((dest.zip || '').toLowerCase());
        return false;
      });

      const totalRate = matchingRules.reduce((sum: number, r: any) => sum + Number(r.rate), 0);
      taxAmount = Math.round(orderTotal * totalRate * 100) / 100;
    }

    // ── Build Stripe line items ──
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

    // Add shipping as a line item if applicable
    if (shippingAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: shippingLabel + (shippingEstimate ? ` (${shippingEstimate})` : ''),
          },
          unit_amount: Math.round(shippingAmount * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as a line item if applicable
    if (taxAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Sales Tax' },
          unit_amount: Math.round(taxAmount * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: lineItems,
        customer_email: customerEmail || undefined,
        success_url: `${origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/inventory`,
        shipping_address_collection: destination ? undefined : {
          allowed_countries: ['US', 'CA'],
        },
        metadata: {
          site_id: params.siteId,
          fm_session_id: sessionId,
        },
        payment_intent_data: {
          metadata: { site_id: params.siteId, fm_session_id: sessionId },
        },
      },
      { stripeAccount: site.stripe_account_id }
    );

    // Save order
    const total = Math.round((orderTotal + shippingAmount + taxAmount) * 100);
    await supabase.from('orders').insert({
      site_id: params.siteId,
      customer_email: customerEmail || null,
      items,
      subtotal: Math.round(orderTotal * 100),
      total,
      stripe_session_id: session.id,
      status: 'pending',
      notes: [
        shippingAmount > 0 ? `Shipping (${shippingLabel}): $${shippingAmount.toFixed(2)}` : null,
        taxAmount > 0 ? `Tax: $${taxAmount.toFixed(2)}` : null,
      ].filter(Boolean).join(' | ') || null,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
