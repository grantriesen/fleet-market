// app/api/service/book/[siteId]/route.ts
// Public endpoint: creates a new service appointment from customer form
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest, { params }: { params: { siteId: string } }) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      serviceTypeId,    // null for "Other"
      customDescription, // for "Other" requests
      equipmentType,
      equipmentMake,
      equipmentModel,
      equipmentSerial,
      preferredDate,     // YYYY-MM-DD
      preferredTime,     // HH:MM (null for "Other")
      customerNotes,
    } = body;

    if (!customerName || !customerEmail) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
    );

    // Verify site exists
    const { data: site } = await supabase
      .from('sites')
      .select('id')
      .eq('id', params.siteId)
      .single();

    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 404 });

    const isCustom = !serviceTypeId;
    let serviceTypeName = 'Other — Contact Requested';
    let duration = null;

    // Look up service type if provided
    if (serviceTypeId) {
      const { data: st } = await supabase
        .from('service_types')
        .select('name, duration_minutes')
        .eq('id', serviceTypeId)
        .eq('site_id', params.siteId)
        .single();

      if (st) {
        serviceTypeName = st.name;
        duration = st.duration_minutes;
      }
    }

    // Build scheduled start/end if date+time provided
    let scheduledStart = null;
    let scheduledEnd = null;
    if (preferredDate && preferredTime && duration) {
      scheduledStart = `${preferredDate}T${preferredTime}:00`;
      const endTime = new Date(new Date(scheduledStart).getTime() + duration * 60000);
      scheduledEnd = endTime.toISOString();
    }

    const appointment = {
      site_id: params.siteId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || null,
      service_type: serviceTypeName,  // NOT NULL column
      service_type_id: serviceTypeId || null,
      service_type_name: serviceTypeName,
      is_custom_request: isCustom,
      custom_description: isCustom ? (customDescription || customerNotes || '') : null,
      description: isCustom ? (customDescription || customerNotes || '') : (customerNotes || null),
      equipment_type: equipmentType || null,
      equipment_brand: equipmentMake || null,
      equipment_make: equipmentMake || null,
      equipment_model: equipmentModel || null,
      equipment_serial: equipmentSerial || null,
      preferred_date: preferredDate || null,
      preferred_time: preferredTime || null,
      scheduled_start: scheduledStart,
      scheduled_end: scheduledEnd,
      duration_minutes: duration,
      status: isCustom ? 'contact_needed' : (scheduledStart ? 'confirmed' : 'pending'),
      customer_notes: customerNotes || null,
    };

    const { data, error } = await supabase
      .from('service_appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      appointmentId: data.id,
      status: data.status,
      message: isCustom
        ? "We've received your request! Our team will contact you shortly to schedule your appointment."
        : `Your ${serviceTypeName} appointment is confirmed for ${preferredDate} at ${preferredTime}.`,
    });
  } catch (error: any) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: error.message || 'Booking failed' }, { status: 500 });
  }
}
