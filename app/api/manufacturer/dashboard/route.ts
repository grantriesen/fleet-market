import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

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
  try {
    const { user_id } = await request.json();
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    const supabase = createSupabase();

    // Get partner ID for this user
    const { data: membership } = await supabase
      .from('manufacturer_users')
      .select('partner_id')
      .eq('user_id', user_id)
      .eq('active', true)
      .maybeSingle();

    if (!membership) {
      return NextResponse.json({ error: 'Not a manufacturer' }, { status: 404 });
    }

    const partnerId = membership.partner_id;

    // Get library ID for this partner
    const { data: libEntry } = await supabase
      .from('manufacturer_library')
      .select('id')
      .eq('partner_id', partnerId)
      .maybeSingle();

    // Count tagged dealers (by partner_id or manufacturer_library_id)
    let dealerCountQuery = supabase
      .from('dealer_manufacturer_tags')
      .select('*', { count: 'exact', head: true });
    
    if (libEntry) {
      dealerCountQuery = dealerCountQuery.or(`partner_id.eq.${partnerId},manufacturer_library_id.eq.${libEntry.id}`);
    } else {
      dealerCountQuery = dealerCountQuery.eq('partner_id', partnerId);
    }
    const { count: dealerCount } = await dealerCountQuery;

    // Count shipments this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count: shipmentsThisMonth } = await supabase
      .from('shipments')
      .select('*', { count: 'exact', head: true })
      .eq('partner_id', partnerId)
      .gte('created_at', startOfMonth.toISOString());

    // Pending commissions
    const { data: commissions } = await supabase
      .from('partner_commissions')
      .select('amount')
      .eq('partner_id', partnerId)
      .eq('status', 'pending');
    const pendingCommissions = (commissions || []).reduce((sum: number, c: any) => sum + (c.amount || 0), 0);

    // Recent dealers
    let recentDealersQuery = supabase
      .from('dealer_manufacturer_tags')
      .select('tagged_at, site:sites(id, site_name, slug)');
    
    if (libEntry) {
      recentDealersQuery = recentDealersQuery.or(`partner_id.eq.${partnerId},manufacturer_library_id.eq.${libEntry.id}`);
    } else {
      recentDealersQuery = recentDealersQuery.eq('partner_id', partnerId);
    }
    const { data: recentDealers } = await recentDealersQuery
      .order('tagged_at', { ascending: false })
      .limit(5);

    // Recent shipments
    const { data: recentShipments } = await supabase
      .from('shipments')
      .select('id, shipment_code, status, item_count, created_at, site:sites(site_name)')
      .eq('partner_id', partnerId)
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      stats: {
        dealerCount: dealerCount || 0,
        shipmentsThisMonth: shipmentsThisMonth || 0,
        pendingCommissions,
      },
      recentDealers: recentDealers || [],
      recentShipments: recentShipments || [],
    });

  } catch (error: any) {
    console.error('Manufacturer dashboard data error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}
