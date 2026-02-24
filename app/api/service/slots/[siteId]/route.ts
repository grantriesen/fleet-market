// app/api/service/slots/[siteId]/route.ts
// Public endpoint: returns available time slots for a given date + service type
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest, { params }: { params: { siteId: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');           // YYYY-MM-DD
    const serviceTypeId = searchParams.get('typeId'); // uuid
    const durationParam = searchParams.get('duration'); // minutes (fallback)

    if (!date) return NextResponse.json({ error: 'Date required' }, { status: 400 });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get() { return undefined; }, set() {}, remove() {} }, auth: { persistSession: false, autoRefreshToken: false } }
    );

    // Get service duration
    let duration = parseInt(durationParam || '60');
    if (serviceTypeId) {
      const { data: st } = await supabase
        .from('service_types')
        .select('duration_minutes')
        .eq('id', serviceTypeId)
        .single();
      if (st) duration = st.duration_minutes;
    }

    // Check if date is blocked
    const { data: blocked } = await supabase
      .from('service_blocked_dates')
      .select('id')
      .eq('site_id', params.siteId)
      .eq('blocked_date', date)
      .maybeSingle();

    if (blocked) {
      return NextResponse.json({ slots: [], blocked: true, message: 'This date is unavailable' });
    }

    // Get availability for this day of week
    const dayOfWeek = new Date(date + 'T12:00:00').getDay(); // 0=Sun
    const { data: availability } = await supabase
      .from('service_availability')
      .select('*')
      .eq('site_id', params.siteId)
      .eq('day_of_week', dayOfWeek)
      .single();

    if (!availability || !availability.is_available) {
      return NextResponse.json({ slots: [], closed: true, message: 'Closed on this day' });
    }

    // Get existing appointments for this date
    const dateStart = `${date}T00:00:00`;
    const dateEnd = `${date}T23:59:59`;
    const { data: existing } = await supabase
      .from('service_appointments')
      .select('scheduled_start, scheduled_end, duration_minutes')
      .eq('site_id', params.siteId)
      .gte('scheduled_start', dateStart)
      .lte('scheduled_start', dateEnd)
      .in('status', ['confirmed', 'in_progress']);

    const maxConcurrent = availability.max_concurrent || 1;

    // Generate available time slots
    const slots = generateSlots(
      availability.start_time,
      availability.end_time,
      duration,
      existing || [],
      maxConcurrent,
      date
    );

    return NextResponse.json({ slots, duration });
  } catch (error: any) {
    console.error('Slots error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

interface ExistingAppt {
  scheduled_start: string;
  scheduled_end: string;
  duration_minutes: number;
}

function generateSlots(
  startTime: string,   // "08:00"
  endTime: string,     // "17:00"
  duration: number,    // minutes
  existing: ExistingAppt[],
  maxConcurrent: number,
  date: string
): { time: string; display: string; available: boolean }[] {
  const slots: { time: string; display: string; available: boolean }[] = [];
  
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Generate slots in 30-minute increments
  for (let m = startMinutes; m + duration <= endMinutes; m += 30) {
    const slotStart = new Date(`${date}T${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:00`);
    const slotEnd = new Date(slotStart.getTime() + duration * 60000);

    // Count overlapping appointments
    const overlapping = existing.filter(appt => {
      const aStart = new Date(appt.scheduled_start);
      const aEnd = new Date(appt.scheduled_end);
      return slotStart < aEnd && slotEnd > aStart;
    });

    const hour = Math.floor(m / 60);
    const minute = m % 60;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const display = `${displayHour}:${String(minute).padStart(2, '0')} ${ampm}`;
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

    slots.push({
      time: timeStr,
      display,
      available: overlapping.length < maxConcurrent,
    });
  }

  return slots;
}
