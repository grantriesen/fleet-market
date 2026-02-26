// app/api/service/appointments/route.ts
// NOTE: Make sure folder is named "appointments" (not "apointments")
// Protected endpoint: dealer manages their appointments
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: site } = await supabase.from('sites').select('id').eq('user_id', user.id).maybeSingle();
    if (!site) return NextResponse.json({ error: 'No site' }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const countsOnly = searchParams.get('countsOnly');

    // Always get counts
    const { data: counts } = await supabase
      .rpc('get_appointment_counts', { p_site_id: site.id })
      .single();

    // If only counts requested, return early
    if (countsOnly) {
      return NextResponse.json({ counts: counts || { pending: 0, contact_needed: 0, confirmed: 0, in_progress: 0, completed: 0, canceled: 0, today: 0, this_week: 0 } });
    }

    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = supabase
      .from('service_appointments')
      .select('*')
      .eq('site_id', site.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) query = query.eq('status', status);
    if (from) query = query.gte('scheduled_start', from);
    if (to) query = query.lte('scheduled_start', to);

    const { data: appointments, error } = await query;
    if (error) throw error;

    // Normalize column names for the dashboard
    // DB uses different column names than the dashboard interface expects
    const normalized = (appointments || []).map((a: any) => ({
      ...a,
      // Map DB columns to dashboard field names
      service_type_name: a.service_type_name || a.service_type,
      equipment_make: a.equipment_make || a.equipment_brand,
      custom_description: a.custom_description || a.description,
      technician: a.technician || a.assigned_technician,
      internal_notes: a.internal_notes || a.technician_notes,
      customer_notes: a.customer_notes || a.description,
    }));

    return NextResponse.json({
      appointments: normalized,
      counts: counts || { pending: 0, contact_needed: 0, confirmed: 0, in_progress: 0, completed: 0, canceled: 0, today: 0, this_week: 0 },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update an appointment (status, technician, notes, schedule)
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { get(name: string) { return cookieStore.get(name)?.value; }, set() {}, remove() {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: site } = await supabase.from('sites').select('id').eq('user_id', user.id).maybeSingle();
    if (!site) return NextResponse.json({ error: 'No site' }, { status: 404 });

    const body = await request.json();
    const { appointmentId, ...updates } = body;

    if (!appointmentId) return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });

    // Build safe update object
    const safeUpdates: any = { updated_at: new Date().toISOString() };

    if (updates.status) {
      safeUpdates.status = updates.status;
      if (updates.status === 'confirmed') safeUpdates.confirmed_at = new Date().toISOString();
      if (updates.status === 'completed') safeUpdates.completed_at = new Date().toISOString();
      if (updates.status === 'canceled') {
        safeUpdates.canceled_at = new Date().toISOString();
        safeUpdates.cancel_reason = updates.cancelReason || null;
      }
    }
    if (updates.technician !== undefined) safeUpdates.assigned_technician = updates.technician;
    if (updates.internalNotes !== undefined) safeUpdates.technician_notes = updates.internalNotes;
    if (updates.scheduledStart) {
      safeUpdates.scheduled_start = updates.scheduledStart;
      if (updates.scheduledEnd) {
        // Use pre-calculated end time from dashboard (already local naive)
        safeUpdates.scheduled_end = updates.scheduledEnd;
        if (updates.durationMinutes) safeUpdates.duration_minutes = updates.durationMinutes;
      } else if (updates.durationMinutes) {
        // Calculate end time without timezone conversion
        const match = updates.scheduledStart.match(/(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/);
        if (match) {
          const [, datePart, h, m] = match;
          const totalMin = parseInt(h) * 60 + parseInt(m) + updates.durationMinutes;
          const endH = Math.floor(totalMin / 60) % 24;
          const endM = totalMin % 60;
          safeUpdates.scheduled_end = `${datePart}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`;
        }
        safeUpdates.duration_minutes = updates.durationMinutes;
      }
    }
    if (updates.contactedAt) safeUpdates.contacted_at = updates.contactedAt;

    const { data, error } = await supabase
      .from('service_appointments')
      .update(safeUpdates)
      .eq('id', appointmentId)
      .eq('site_id', site.id)
      .select()
      .single();

    if (error) throw error;

    // Normalize column names to match what the dashboard expects
    const normalized = {
      ...data,
      service_type_name: data.service_type_name || data.service_type,
      equipment_make: data.equipment_make || data.equipment_brand,
      custom_description: data.custom_description || data.description,
      technician: data.technician || data.assigned_technician,
      internal_notes: data.internal_notes || data.technician_notes,
      customer_notes: data.customer_notes || data.description,
    };

    return NextResponse.json({ appointment: normalized });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
