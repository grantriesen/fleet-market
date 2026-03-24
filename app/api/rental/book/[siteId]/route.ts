// app/api/rental/book/[siteId]/route.ts
// Public endpoint: customers submit rental booking requests
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest, { params }: { params: { siteId: string } }) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
    );

    const body = await request.json();
    const { siteId } = params;

    // Validate required fields
    if (!body.customerName || !body.customerEmail || !body.customerPhone || !body.startDate || !body.endDate || !body.rentalItemId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Calculate rental period and total
    const start = new Date(body.startDate);
    const end = new Date(body.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const dailyRate   = parseFloat(body.rateAmount)   || 0;
    const hourlyRate  = parseFloat(body.hourlyRate)   || 0;
    const weeklyRate  = parseFloat(body.weeklyRate)   || 0;
    const monthlyRate = parseFloat(body.monthlyRate)  || 0;
    // Use frontend-calculated total if provided (already accounts for blended billing)
    // Fall back to server-side blended calc if not
    let totalAmount = parseFloat(body.totalAmount) || 0;
    if (!totalAmount) {
      if (days >= 28 && monthlyRate) {
        const fullMo = Math.max(1, Math.floor(days / 30));
        const remDays = days - fullMo * 30;
        const remWk = (remDays >= 7 && weeklyRate) ? Math.floor(remDays / 7) : 0;
        totalAmount = fullMo * monthlyRate + remWk * (weeklyRate || 0) + (remDays - remWk * 7) * (dailyRate || 0);
      } else if (days >= 7 && weeklyRate) {
        const fullWk = Math.floor(days / 7);
        totalAmount = fullWk * weeklyRate + (days - fullWk * 7) * (dailyRate || 0);
      } else {
        totalAmount = days * dailyRate;
      }
    }

    // ── Availability check ──────────────────────────────────────────────────
    // Count existing bookings that overlap the requested date range
    const { data: item } = await supabase
      .from('rental_inventory')
      .select('quantity_available')
      .eq('id', body.rentalItemId)
      .eq('site_id', siteId)
      .single();

    if (!item) {
      return NextResponse.json({ error: 'Rental item not found' }, { status: 404 });
    }

    const { data: overlapping } = await supabase
      .from('rental_bookings')
      .select('quantity')
      .eq('rental_item_id', body.rentalItemId)
      .in('status', ['pending', 'confirmed', 'active'])
      .lte('start_date', body.endDate)
      .gte('end_date', body.startDate);

    const bookedQty = (overlapping || []).reduce((sum: number, b: any) => sum + (b.quantity || 1), 0);
    if (bookedQty >= (item.quantity_available || 1)) {
      return NextResponse.json({ error: 'Sorry, this equipment is not available for the selected dates.' }, { status: 409 });
    }
    // ────────────────────────────────────────────────────────────────────────

    const { data, error } = await supabase
      .from('rental_bookings')
      .insert({
        site_id: siteId,
        rental_item_id: body.rentalItemId,
        customer_name: body.customerName.trim(),
        customer_email: body.customerEmail.trim(),
        customer_phone: body.customerPhone.trim(),
        start_date: body.startDate,
        end_date: body.endDate,
        rental_period: 'daily',
        rate_amount: dailyRate,
        total_amount: totalAmount,
        quantity: 1,
        status: 'pending',
        pickup_time: body.pickupTime || null,
        return_time: body.returnTime || null,
        delivery_required: body.deliveryRequired === 'on' || body.deliveryRequired === true,
        delivery_address: body.deliveryAddress || null,
        notes: body.notes || null,
        payment_intent_id: body.paymentIntentId || null,
        deposit_amount: body.depositAmount ? parseFloat(body.depositAmount) : null,
        deposit_status: body.paymentIntentId ? 'paid' : 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Rental booking error:', error);
      return NextResponse.json({ error: 'Failed to submit booking request' }, { status: 500 });
    }

    return NextResponse.json({ success: true, booking: data });
  } catch (error: any) {
    console.error('Rental booking error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
