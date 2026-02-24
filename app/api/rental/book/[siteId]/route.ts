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
    const dailyRate = parseFloat(body.rateAmount) || 0;
    const totalAmount = days * dailyRate;

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
