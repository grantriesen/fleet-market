// app/api/stripe/subscription-update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const MONTHLY_PRICES: Record<string, string> = {
  base:        process.env.STRIPE_PRICE_BASE!,
  inventory:   process.env.STRIPE_PRICE_ADDON_INVENTORY!,
  service:     process.env.STRIPE_PRICE_ADDON_SERVICE!,
  rentals:     process.env.STRIPE_PRICE_ADDON_RENTALS!,
  bundle_2:    process.env.STRIPE_PRICE_BUNDLE_2!,
  bundle_3:    process.env.STRIPE_PRICE_BUNDLE_3!,
};

function getAddonPriceIds(addons: string[]): string[] {
  if (addons.length === 3) return [MONTHLY_PRICES.bundle_3];
  if (addons.length === 2) return [MONTHLY_PRICES.bundle_2];
  if (addons.length === 1) return [MONTHLY_PRICES[addons[0]]].filter(Boolean);
  return [];
}

export async function POST(request: NextRequest) {
  try {
    const { site_id, addons }: { site_id: string; addons: string[] } = await request.json();

    if (!site_id) return NextResponse.json({ error: 'Missing site_id' }, { status: 400 });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data: site } = await supabase
      .from('sites')
      .select('id, stripe_subscription_id, addons')
      .eq('id', site_id)
      .single();

    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    if (!site.stripe_subscription_id) return NextResponse.json({ error: 'No active subscription' }, { status: 400 });

    // Get current subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(site.stripe_subscription_id);
    const existingItems = subscription.items.data;

    // Build the new desired set of price IDs
    const newAddonPriceIds = getAddonPriceIds(addons);
    const desiredPriceIds = new Set([MONTHLY_PRICES.base, ...newAddonPriceIds]);

    // Build items array for the update:
    // - Keep base item (always present)
    // - Remove old addon items not in new set
    // - Add new addon items not already present
    const existingPriceIds = new Set(existingItems.map(i => i.price.id));
    const updateItems: Stripe.SubscriptionUpdateParams.Item[] = [];

    // Keep or remove existing items
    for (const item of existingItems) {
      if (desiredPriceIds.has(item.price.id)) {
        // Keep as-is
      } else {
        // Remove this item (old addon no longer needed)
        updateItems.push({ id: item.id, deleted: true });
      }
    }

    // Add new items that don't exist yet
    for (const priceId of desiredPriceIds) {
      if (!existingPriceIds.has(priceId)) {
        updateItems.push({ price: priceId, quantity: 1 });
      }
    }

    if (updateItems.length === 0) {
      return NextResponse.json({ error: 'No changes to make' }, { status: 400 });
    }

    // Update the subscription with proration — dealer only pays for new addons
    // from today to end of billing period, not the full month
    await stripe.subscriptions.update(site.stripe_subscription_id, {
      items: updateItems,
      proration_behavior: 'create_prorations',
    });

    // Update Supabase immediately — webhook will also fire but this ensures instant access
    await supabase
      .from('sites')
      .update({ addons })
      .eq('id', site_id);

    // Update site_features
    const featureKeyMap: Record<string, string[]> = {
      inventory: ['inventory_management', 'inventory', 'inventory_sync'],
      service:   ['service_scheduling', 'service'],
      rentals:   ['rental_management', 'rentals', 'rental_scheduling'],
    };

    // Remove all addon features then re-add the current set
    await supabase.from('site_features')
      .delete()
      .eq('site_id', site_id)
      .in('feature_key', ['inventory_management', 'inventory', 'inventory_sync', 'service_scheduling', 'service', 'rental_management', 'rentals', 'rental_scheduling']);

    if (addons.length > 0) {
      const featureRows: { site_id: string; feature_key: string; enabled: boolean }[] = [];
      addons.forEach(a => {
        (featureKeyMap[a] || []).forEach(key => {
          featureRows.push({ site_id, feature_key: key, enabled: true });
        });
      });
      await supabase.from('site_features').upsert(featureRows, { onConflict: 'site_id,feature_key' });
    }

    // Seed service types if service newly added
    if (addons.includes('service') && !(site.addons || []).includes('service')) {
      const { data: existing } = await supabase.from('service_types').select('id').eq('site_id', site_id).limit(1);
      if (!existing || existing.length === 0) {
        await supabase.from('service_types').insert([
          { site_id, name: 'Routine Maintenance', description: 'Oil change, filter replacement, blade sharpening, and general tune-up.', duration_minutes: 60, price_estimate: 'Call for pricing', display_order: 1, is_active: true },
          { site_id, name: 'Equipment Repair',    description: 'Diagnosis and repair of mechanical or electrical issues.',              duration_minutes: 120, price_estimate: 'Call for pricing', display_order: 2, is_active: true },
          { site_id, name: 'Blade Service',       description: 'Blade removal, sharpening, balancing, and reinstallation.',            duration_minutes: 30, price_estimate: 'Call for pricing', display_order: 3, is_active: true },
          { site_id, name: 'Seasonal Prep',       description: 'Full seasonal inspection and preparation for storage or operation.',    duration_minutes: 90, price_estimate: 'Call for pricing', display_order: 4, is_active: true },
        ]);
      }
    }

    return NextResponse.json({ success: true, addons });

  } catch (err: any) {
    console.error('Subscription update error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
