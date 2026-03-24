// app/api/rental/availability/[siteId]/route.ts
// Returns booked date ranges per rental item so the frontend can block unavailable dates
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest, { params }: { params: { siteId: string } }) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { siteId } = params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId'); // optional — filter to one item

    // Load all inventory for this site to get quantity_available per item
    const inventoryQuery = supabase
      .from('rental_inventory')
      .select('id, quantity_available')
      .eq('site_id', siteId)
      .eq('status', 'available');
    if (itemId) inventoryQuery.eq('id', itemId);
    const { data: inventory } = await inventoryQuery;

    if (!inventory || inventory.length === 0) {
      return NextResponse.json({ bookedRanges: {} });
    }

    const itemIds = inventory.map((i: any) => i.id);
    const quantityMap: Record<string, number> = {};
    inventory.forEach((i: any) => { quantityMap[i.id] = i.quantity_available || 1; });

    // Load active/confirmed/pending bookings for these items from today forward
    const today = new Date().toISOString().split('T')[0];
    const { data: bookings } = await supabase
      .from('rental_bookings')
      .select('rental_item_id, start_date, end_date, quantity, status')
      .in('rental_item_id', itemIds)
      .gte('end_date', today)
      .in('status', ['pending', 'confirmed', 'active']);

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ bookedRanges: {} });
    }

    // Build a map of itemId -> array of fully-booked date strings
    // A date is fully booked when sum of booking quantities on that date >= quantity_available
    const bookedDates: Record<string, string[]> = {};

    for (const item of inventory) {
      const itemBookings = bookings.filter((b: any) => b.rental_item_id === item.id);
      if (!itemBookings.length) continue;

      // Find date range to check (today to max end_date)
      const maxEnd = itemBookings.reduce((max: string, b: any) => b.end_date > max ? b.end_date : max, today);
      const fullyBooked: string[] = [];

      // Walk each day in range
      const cursor = new Date(today);
      const endBound = new Date(maxEnd);
      while (cursor <= endBound) {
        const dateStr = cursor.toISOString().split('T')[0];
        const bookedQty = itemBookings
          .filter((b: any) => b.start_date <= dateStr && b.end_date >= dateStr)
          .reduce((sum: number, b: any) => sum + (b.quantity || 1), 0);
        if (bookedQty >= item.quantity_available) {
          fullyBooked.push(dateStr);
        }
        cursor.setDate(cursor.getDate() + 1);
      }

      if (fullyBooked.length > 0) {
        bookedDates[item.id] = fullyBooked;
      }
    }

    return NextResponse.json({ bookedRanges: bookedDates });
  } catch (error: any) {
    console.error('Availability check error:', error);
    return NextResponse.json({ bookedRanges: {} });
  }
}
