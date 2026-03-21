// app/api/inventory/shipping-tax/[siteId]/route.ts
// Public endpoint: calculates applicable shipping + tax for a given destination
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

function createSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
  );
}

interface ShippingZone {
  id: string;
  label: string;
  zone_type: string;
  zone_values: string[];
  rate_type: string;
  rate_amount: number;
  min_order_amount: number | null;
  per_item_amount: number | null;
  estimated_days: string | null;
}

interface TaxRule {
  id: string;
  label: string;
  rate: number;
  applies_to: string;
  scope_values: string[];
}

function zoneMatchesDestination(zone: ShippingZone, destination: any): boolean {
  if (zone.zone_type === 'everywhere') return true;

  const values = (zone.zone_values || []).map(v => v.toLowerCase().trim());

  if (zone.zone_type === 'country') {
    return values.includes((destination.country || '').toLowerCase().trim());
  }
  if (zone.zone_type === 'state') {
    return values.includes((destination.state || '').toLowerCase().trim());
  }
  if (zone.zone_type === 'city') {
    return values.includes((destination.city || '').toLowerCase().trim());
  }
  if (zone.zone_type === 'zip') {
    return values.includes((destination.zip || '').toLowerCase().trim());
  }
  return false;
}

function taxRuleMatchesDestination(rule: TaxRule, destination: any): boolean {
  if (rule.applies_to === 'all') return true;

  const values = (rule.scope_values || []).map(v => v.toLowerCase().trim());

  if (rule.applies_to === 'country') return values.includes((destination.country || '').toLowerCase().trim());
  if (rule.applies_to === 'state') return values.includes((destination.state || '').toLowerCase().trim());
  if (rule.applies_to === 'city') return values.includes((destination.city || '').toLowerCase().trim());
  if (rule.applies_to === 'zip') return values.includes((destination.zip || '').toLowerCase().trim());
  return false;
}

function calculateShipping(zone: ShippingZone, orderTotal: number, itemCount: number): number {
  switch (zone.rate_type) {
    case 'free':
      return 0;
    case 'flat':
      return zone.rate_amount || 0;
    case 'per_item':
      return (zone.per_item_amount || zone.rate_amount || 0) * itemCount;
    case 'percentage':
      return Math.round(orderTotal * (zone.rate_amount / 100) * 100) / 100;
    case 'free_over':
      return orderTotal >= (zone.min_order_amount || 0) ? 0 : (zone.rate_amount || 0);
    default:
      return 0;
  }
}

// GET — calculate shipping + tax for a destination
export async function GET(request: NextRequest, { params }: { params: { siteId: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const zip     = searchParams.get('zip') || '';
    const city    = searchParams.get('city') || '';
    const state   = searchParams.get('state') || '';
    const country = searchParams.get('country') || 'US';
    const orderTotal = parseFloat(searchParams.get('total') || '0');
    const itemCount  = parseInt(searchParams.get('items') || '1');

    const destination = { zip, city, state, country };
    const supabase = createSupabase();

    // Load active shipping zones
    const { data: zones } = await supabase
      .from('shipping_zones')
      .select('*')
      .eq('site_id', params.siteId)
      .eq('is_active', true)
      .order('display_order');

    // Load active tax rules
    const { data: taxRules } = await supabase
      .from('tax_rules')
      .select('*')
      .eq('site_id', params.siteId)
      .eq('is_active', true);

    // Find matching shipping zones (most specific wins)
    const priority = ['zip', 'city', 'state', 'country', 'everywhere'];
    let matchedZones: ShippingZone[] = [];

    for (const zoneType of priority) {
      const matches = (zones || []).filter(z =>
        z.zone_type === zoneType && zoneMatchesDestination(z, destination)
      );
      if (matches.length > 0) {
        matchedZones = matches;
        break;
      }
    }

    // Calculate shipping options
    const shippingOptions = matchedZones.map(zone => ({
      id: zone.id,
      label: zone.label,
      amount: calculateShipping(zone, orderTotal, itemCount),
      estimated_days: zone.estimated_days,
      rate_type: zone.rate_type,
    }));

    // Calculate tax (sum all matching rules)
    const matchedTaxRules = (taxRules || []).filter(r => taxRuleMatchesDestination(r, destination));
    const totalTaxRate = matchedTaxRules.reduce((sum, r) => sum + Number(r.rate), 0);
    const taxAmount = Math.round(orderTotal * totalTaxRate * 100) / 100;

    const taxBreakdown = matchedTaxRules.map(r => ({
      label: r.label,
      rate: Number(r.rate),
      amount: Math.round(orderTotal * Number(r.rate) * 100) / 100,
    }));

    return NextResponse.json({
      shipping: shippingOptions,
      tax: {
        rate: totalTaxRate,
        amount: taxAmount,
        breakdown: taxBreakdown,
      },
      destination,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — get shipping + tax zones for site (used by dashboard)
export async function POST(request: NextRequest, { params }: { params: { siteId: string } }) {
  try {
    const supabase = createSupabase();
    const [{ data: zones }, { data: taxRules }] = await Promise.all([
      supabase.from('shipping_zones').select('*').eq('site_id', params.siteId).order('display_order'),
      supabase.from('tax_rules').select('*').eq('site_id', params.siteId).order('created_at'),
    ]);
    return NextResponse.json({ zones: zones || [], taxRules: taxRules || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
