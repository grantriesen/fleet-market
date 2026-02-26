// app/dashboard/service/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import {
  Calendar, Clock, User, Phone, Mail, Wrench, AlertCircle,
  ChevronLeft, ChevronRight, Check, X, MessageSquare, Filter,
  Plus, Settings, Loader2, ArrowRight, MoreVertical, Search,
  UserCheck, Ban, ChevronDown
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
type Status = 'pending' | 'contact_needed' | 'confirmed' | 'in_progress' | 'completed' | 'canceled';
type ViewMode = 'queue' | 'calendar' | 'services' | 'availability';

interface Appointment {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  service_type_name: string;
  is_custom_request: boolean;
  custom_description: string | null;
  equipment_type: string | null;
  equipment_make: string | null;
  equipment_model: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  duration_minutes: number | null;
  status: Status;
  technician: string | null;
  internal_notes: string | null;
  customer_notes: string | null;
  contacted_at: string | null;
  created_at: string;
}

interface ServiceType {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_estimate: string;
  category: string;
  is_active: boolean;
  sort_order: number;
}

interface AvailabilityDay {
  id?: string;
  day_of_week: number;
  is_available: boolean;
  start_time: string;
  end_time: string;
  max_concurrent: number;
}

interface BlockedDate {
  id: string;
  blocked_date: string;
  reason: string | null;
}

interface Counts {
  pending: number;
  contact_needed: number;
  confirmed: number;
  in_progress: number;
  completed: number;
  canceled: number;
  today: number;
  this_week: number;
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; border: string }> = {
  pending:        { label: 'Pending',         color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  contact_needed: { label: 'Contact Needed',  color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  confirmed:      { label: 'Confirmed',       color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  in_progress:    { label: 'In Progress',     color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
  completed:      { label: 'Completed',       color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  canceled:       { label: 'Canceled',        color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

const FM = { navy: '#1E3A6E', navyDark: '#152C54', orange: '#E85525', orangeGlow: 'rgba(232,85,37,0.1)' };
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Parse scheduled time as LOCAL time regardless of timezone suffix from DB
// Supabase timestamptz returns "2026-03-02T08:00:00+00:00" but we stored local time
function parseLocal(dateStr: string): Date {
  // Strip any timezone suffix and parse as local
  const clean = dateStr.replace(/[+-]\d{2}:\d{2}$/, '').replace(/Z$/, '');
  const [datePart, timePart] = clean.split('T');
  const [y, m, d] = datePart.split('-').map(Number);
  const [h, min, s] = (timePart || '00:00:00').split(':').map(Number);
  return new Date(y, m - 1, d, h, min, s || 0);
}
function fmtTime(dateStr: string): string {
  return parseLocal(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function fmtDateLocal(dateStr: string, opts?: Intl.DateTimeFormatOptions): string {
  return parseLocal(dateStr).toLocaleDateString('en-US', opts);
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ServiceDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('queue');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [counts, setCounts] = useState<Counts>({ pending: 0, contact_needed: 0, confirmed: 0, in_progress: 0, completed: 0, canceled: 0, today: 0, this_week: 0 });
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [saving, setSaving] = useState(false);
  const [site, setSite] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTechnician, setFilterTechnician] = useState('');

  // Calendar state
  const [calDate, setCalDate] = useState(new Date());

  // Scheduling modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleDuration, setScheduleDuration] = useState(60);

  // Technician state
  const [showTechDropdown, setShowTechDropdown] = useState(false);
  const [techInput, setTechInput] = useState('');

  // Manual booking modal state
  const [showManualBooking, setShowManualBooking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [manualForm, setManualForm] = useState({
    customerName: '', customerEmail: '', customerPhone: '',
    serviceType: '', equipmentType: '', equipmentMake: '', equipmentModel: '',
    scheduledDate: '', scheduledTime: '09:00', duration: 60,
    technician: '', notes: '',
  });
  const [manualSaving, setManualSaving] = useState(false);

  // Availability state
  const [availability, setAvailability] = useState<AvailabilityDay[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  // settingsTab removed - now separate main tabs

  useEffect(() => { setMounted(true); loadData(); }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: userSite } = await supabase.from('sites').select('*').eq('user_id', user.id).maybeSingle();
      if (!userSite) { router.push('/onboarding'); return; }
      setSite(userSite);

      // Load appointments
      const res = await fetch('/api/service/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
        setCounts(data.counts || counts);
      }

      // Load service types
      const { data: types } = await supabase
        .from('service_types')
        .select('*')
        .eq('site_id', userSite.id)
        .order('sort_order');
      setServiceTypes(types || []);

      // Load availability
      const { data: avail } = await supabase
        .from('service_availability')
        .select('*')
        .eq('site_id', userSite.id)
        .order('day_of_week');

      if (avail && avail.length > 0) {
        setAvailability(avail);
      } else {
        // Seed defaults
        const defaults: AvailabilityDay[] = DAY_NAMES.map((_, i) => ({
          day_of_week: i,
          is_available: i >= 1 && i <= 5, // Mon-Fri
          start_time: '08:00',
          end_time: '17:00',
          max_concurrent: 2,
        }));
        setAvailability(defaults);
      }

      // Load blocked dates
      const { data: blocked } = await supabase
        .from('service_blocked_dates')
        .select('*')
        .eq('site_id', userSite.id)
        .gte('blocked_date', new Date().toISOString().split('T')[0])
        .order('blocked_date');
      setBlockedDates(blocked || []);

    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  }

  // ---- Appointment actions ----

  async function updateAppointment(id: string, updates: any) {
    setSaving(true);
    try {
      const res = await fetch('/api/service/appointments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: id, ...updates }),
      });
      if (res.ok) {
        const { appointment } = await res.json();
        // Update both lists in sync to prevent stale data
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...appointment } : a));
        setSelectedAppt(prev => prev?.id === id ? { ...prev, ...appointment } : prev);

        // Refresh counts without resetting the whole list
        const countsRes = await fetch('/api/service/appointments?countsOnly=true');
        if (countsRes.ok) {
          const countsData = await countsRes.json();
          if (countsData.counts) setCounts(countsData.counts);
        }
      }
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setSaving(false);
    }
  }

  async function scheduleAppointment(id: string) {
    if (!scheduleDate || !scheduleTime) return;
    // Calculate end time as naive local time string
    const [h, m] = scheduleTime.split(':').map(Number);
    const totalMin = h * 60 + m + scheduleDuration;
    const endH = Math.floor(totalMin / 60) % 24;
    const endM = totalMin % 60;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    await updateAppointment(id, {
      scheduledStart: `${scheduleDate}T${scheduleTime}:00`,
      scheduledEnd: `${scheduleDate}T${endTimeStr}:00`,
      durationMinutes: scheduleDuration,
      status: 'confirmed',
    });
    setShowScheduleModal(false);
    setScheduleDate('');
    setScheduleTime('');
  }

  async function assignTechnician(id: string, tech: string) {
    await updateAppointment(id, { technician: tech });
    setShowTechDropdown(false);
    setTechInput('');
  }

  // Manual booking
  async function submitManualBooking() {
    if (!site || !manualForm.customerName || !manualForm.scheduledDate || !manualForm.scheduledTime) return;
    setManualSaving(true);
    try {
      const [h, m] = manualForm.scheduledTime.split(':').map(Number);
      const totalMin = h * 60 + m + manualForm.duration;
      const endH = Math.floor(totalMin / 60) % 24;
      const endM = totalMin % 60;
      const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      const supabaseAdmin = createClient();
      const { error } = await supabaseAdmin.from('service_appointments').insert({
        site_id: site.id,
        customer_name: manualForm.customerName,
        customer_email: manualForm.customerEmail || null,
        customer_phone: manualForm.customerPhone || null,
        service_type: manualForm.serviceType || 'Walk-in / Phone Booking',
        service_type_name: manualForm.serviceType || 'Walk-in / Phone Booking',
        is_custom_request: false,
        equipment_type: manualForm.equipmentType || null,
        equipment_make: manualForm.equipmentMake || null,
        equipment_brand: manualForm.equipmentMake || null,
        equipment_model: manualForm.equipmentModel || null,
        scheduled_start: `${manualForm.scheduledDate}T${manualForm.scheduledTime}:00`,
        scheduled_end: `${manualForm.scheduledDate}T${endTimeStr}:00`,
        duration_minutes: manualForm.duration,
        preferred_date: manualForm.scheduledDate,
        preferred_time: manualForm.scheduledTime,
        assigned_technician: manualForm.technician || null,
        customer_notes: manualForm.notes || null,
        status: 'confirmed',
      });
      if (error) throw error;

      setShowManualBooking(false);
      setManualForm({ customerName: '', customerEmail: '', customerPhone: '', serviceType: '', equipmentType: '', equipmentMake: '', equipmentModel: '', scheduledDate: '', scheduledTime: '09:00', duration: 60, technician: '', notes: '' });
      // Reload everything
      const res = await fetch('/api/service/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
        setCounts(data.counts || counts);
      }
    } catch (err: any) {
      console.error('Manual booking error:', err);
      alert('Failed to create appointment: ' + (err.message || 'Unknown error'));
    } finally {
      setManualSaving(false);
    }
  }

  // ---- Capacity calculation ----
  function getCapacityForDate(dateStr: string): { booked: number; total: number; percent: number } {
    const date = new Date(dateStr + 'T12:00:00');
    const dayOfWeek = date.getDay();
    const avail = availability.find(a => a.day_of_week === dayOfWeek);
    if (!avail || !avail.is_available) return { booked: 0, total: 0, percent: 0 };

    // Total slots = hours available × max concurrent
    const [startH, startM] = avail.start_time.split(':').map(Number);
    const [endH, endM] = avail.end_time.split(':').map(Number);
    const totalHours = (endH * 60 + endM - startH * 60 - startM) / 60;
    const totalSlots = Math.floor(totalHours) * avail.max_concurrent;

    // Booked = active appointments on that date
    const booked = appointments.filter(a => {
      if (['canceled', 'completed'].includes(a.status)) return false;
      if (a.scheduled_start) return a.scheduled_start.startsWith(dateStr);
      if (a.preferred_date) return a.preferred_date === dateStr;
      return false;
    }).length;

    const percent = totalSlots > 0 ? Math.min(Math.round((booked / totalSlots) * 100), 100) : 0;
    return { booked, total: totalSlots, percent };
  }

  // Today and this week capacity
  const todayDate = new Date();
  const todayStr = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  const todayCapacity = getCapacityForDate(todayStr);

  // Next 5 business days capacity
  const weekCapacity: { date: string; label: string; cap: ReturnType<typeof getCapacityForDate> }[] = [];
  {
    const now = new Date();
    let added = 0;
    let offset = 0;
    while (added < 5 && offset < 14) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayOfWeek = d.getDay();
      const avail = availability.find(a => a.day_of_week === dayOfWeek);
      if (avail?.is_available) {
        weekCapacity.push({
          date: ds,
          label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
          cap: getCapacityForDate(ds),
        });
        added++;
      }
      offset++;
    }
  }

  // ---- Service Types ----

  async function saveServiceType(type: Partial<ServiceType> & { id?: string }) {
    setSaving(true);
    try {
      if (type.id) {
        await supabase.from('service_types').update({
          name: type.name, description: type.description,
          duration_minutes: type.duration_minutes, price_estimate: type.price_estimate,
          category: type.category, is_active: type.is_active, sort_order: type.sort_order,
        }).eq('id', type.id);
      } else {
        await supabase.from('service_types').insert({
          site_id: site.id, name: type.name, description: type.description,
          duration_minutes: type.duration_minutes || 60, price_estimate: type.price_estimate || '',
          category: type.category || 'general', sort_order: serviceTypes.length,
        });
      }
      const { data: types } = await supabase.from('service_types').select('*').eq('site_id', site.id).order('sort_order');
      setServiceTypes(types || []);
    } catch (err) {
      console.error('Save type error:', err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteServiceType(id: string) {
    if (!confirm('Delete this service type? Existing appointments won\'t be affected.')) return;
    await supabase.from('service_types').delete().eq('id', id);
    setServiceTypes(prev => prev.filter(t => t.id !== id));
  }

  // ---- Availability ----

  async function saveAvailability() {
    setSaving(true);
    try {
      for (const day of availability) {
        await supabase.from('service_availability').upsert({
          site_id: site.id,
          day_of_week: day.day_of_week,
          is_available: day.is_available,
          start_time: day.start_time,
          end_time: day.end_time,
          max_concurrent: day.max_concurrent,
        }, { onConflict: 'site_id,day_of_week' });
      }
    } catch (err) {
      console.error('Availability save error:', err);
    } finally {
      setSaving(false);
    }
  }

  async function addBlockedDate() {
    if (!newBlockedDate || !site) return;
    setSaving(true);
    try {
      const { data, error } = await supabase.from('service_blocked_dates').insert({
        site_id: site.id,
        blocked_date: newBlockedDate,
        reason: newBlockedReason || null,
      }).select().single();
      if (data) setBlockedDates(prev => [...prev, data].sort((a, b) => a.blocked_date.localeCompare(b.blocked_date)));
      setNewBlockedDate('');
      setNewBlockedReason('');
    } catch (err) {
      console.error('Block date error:', err);
    } finally {
      setSaving(false);
    }
  }

  async function removeBlockedDate(id: string) {
    await supabase.from('service_blocked_dates').delete().eq('id', id);
    setBlockedDates(prev => prev.filter(d => d.id !== id));
  }

  // ---- Filtering ----

  const filtered = appointments.filter(a => {
    // Status filter
    const statusMatch = filterStatus === 'active'
      ? !['completed', 'canceled'].includes(a.status)
      : filterStatus === 'all'
        ? true
        : a.status === filterStatus;

    // Search filter
    const searchMatch = !searchQuery || [
      a.customer_name,
      a.customer_email,
      a.customer_phone,
      a.service_type_name,
      a.technician,
      a.equipment_type,
      a.equipment_make,
      a.equipment_model,
    ].some(field => field?.toLowerCase().includes(searchQuery.toLowerCase()));

    // Technician filter
    const techMatch = !filterTechnician
      || (filterTechnician === 'unassigned' ? !a.technician : a.technician === filterTechnician);

    return statusMatch && searchMatch && techMatch;
  });

  // ---- Calendar helpers ----

  const calMonth = calDate.getMonth();
  const calYear = calDate.getFullYear();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const monthName = calDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getApptForDate = (day: number) => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter(a => {
      const dateMatch = a.scheduled_start ? a.scheduled_start.startsWith(dateStr) : a.preferred_date === dateStr;
      const techMatch = !filterTechnician
        || (filterTechnician === 'unassigned' ? !a.technician : a.technician === filterTechnician);
      return dateMatch && techMatch;
    });
  };

  // Get unique technician names from existing appointments
  const existingTechnicians = [...new Set(appointments.map(a => a.technician).filter(Boolean))] as string[];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* MANUAL BOOKING MODAL */}
      {mounted && showManualBooking && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '2rem', paddingBottom: '2rem', overflowY: 'auto' }}>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => !manualSaving && setShowManualBooking(false)} />
          <div style={{ position: 'relative', background: 'white', borderRadius: 16, boxShadow: '0 25px 50px rgba(0,0,0,0.25)', width: '100%', maxWidth: 512, margin: '0 1rem' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Add Appointment</h2>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 }}>For phone bookings, walk-ins, or internal scheduling</p>
              </div>
              <button onClick={() => !manualSaving && setShowManualBooking(false)} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer' }}><X className="w-5 h-5" style={{ color: '#94a3b8' }} /></button>
            </div>
            <div style={{ padding: '1.25rem 1.5rem', maxHeight: 'calc(100vh - 14rem)', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {/* Customer Info */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Customer Name *</label>
                  <input type="text" value={manualForm.customerName} onChange={e => setManualForm(p => ({ ...p, customerName: e.target.value }))} placeholder="John Smith"
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Email</label>
                    <input type="email" value={manualForm.customerEmail} onChange={e => setManualForm(p => ({ ...p, customerEmail: e.target.value }))} placeholder="john@email.com"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Phone</label>
                    <input type="tel" value={manualForm.customerPhone} onChange={e => setManualForm(p => ({ ...p, customerPhone: e.target.value }))} placeholder="402-555-1234"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem' }} />
                  </div>
                </div>
                {/* Service */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Service Type</label>
                  <select value={manualForm.serviceType} onChange={e => {
                    const st = serviceTypes.find(s => s.name === e.target.value);
                    setManualForm(p => ({ ...p, serviceType: e.target.value, duration: st?.duration_minutes || p.duration }));
                  }} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem' }}>
                    <option value="">— Select or leave blank —</option>
                    {serviceTypes.filter(s => s.is_active).map(s => <option key={s.id} value={s.name}>{s.name} ({s.duration_minutes} min)</option>)}
                    <option value="Walk-in / Phone Booking">Walk-in / Phone Booking</option>
                  </select>
                </div>
                {/* Equipment */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Equipment</label>
                    <input type="text" value={manualForm.equipmentType} onChange={e => setManualForm(p => ({ ...p, equipmentType: e.target.value }))} placeholder="Mower"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Make</label>
                    <input type="text" value={manualForm.equipmentMake} onChange={e => setManualForm(p => ({ ...p, equipmentMake: e.target.value }))} placeholder="Toro"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Model</label>
                    <input type="text" value={manualForm.equipmentModel} onChange={e => setManualForm(p => ({ ...p, equipmentModel: e.target.value }))} placeholder="TimeCutter"
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem' }} />
                  </div>
                </div>
                {/* Schedule */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Date *</label>
                    <input type="date" value={manualForm.scheduledDate} onChange={e => setManualForm(p => ({ ...p, scheduledDate: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Time *</label>
                    <input type="time" value={manualForm.scheduledTime} onChange={e => setManualForm(p => ({ ...p, scheduledTime: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Duration (min)</label>
                    <select value={manualForm.duration} onChange={e => setManualForm(p => ({ ...p, duration: parseInt(e.target.value) }))}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem' }}>
                      <option value={30}>30 min</option><option value={60}>1 hour</option><option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option><option value={180}>3 hours</option><option value={240}>4 hours</option>
                      <option value={480}>Full day</option>
                    </select>
                  </div>
                </div>
                {/* Technician */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Assign Technician</label>
                  <select value={manualForm.technician} onChange={e => setManualForm(p => ({ ...p, technician: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem' }}>
                    <option value="">— None —</option>
                    {existingTechnicians.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {/* Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: 4 }}>Notes</label>
                  <textarea value={manualForm.notes} onChange={e => setManualForm(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Any details about the job..."
                    style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem', resize: 'none' }} />
                </div>
                {/* Capacity indicator */}
                {manualForm.scheduledDate && (() => {
                  const cap = getCapacityForDate(manualForm.scheduledDate);
                  return cap.total > 0 ? (
                    <div style={{ padding: '0.75rem', borderRadius: 8, background: cap.percent >= 80 ? '#fef2f2' : cap.percent >= 50 ? '#fffbeb' : '#f0fdf4', border: '1px solid', borderColor: cap.percent >= 80 ? '#fca5a5' : cap.percent >= 50 ? '#fde68a' : '#bbf7d0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: cap.percent >= 80 ? '#dc2626' : cap.percent >= 50 ? '#d97706' : '#16a34a' }}>
                          {cap.percent >= 80 ? 'Near capacity' : cap.percent >= 50 ? 'Filling up' : 'Plenty of room'} — {cap.booked}/{cap.total} slots
                        </span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: cap.percent >= 80 ? '#dc2626' : cap.percent >= 50 ? '#d97706' : '#16a34a' }}>{cap.percent}%</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.6)', borderRadius: 3 }}>
                        <div style={{ width: `${cap.percent}%`, height: '100%', borderRadius: 3, background: cap.percent >= 80 ? '#dc2626' : cap.percent >= 50 ? '#d97706' : '#16a34a' }} />
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setShowManualBooking(false)} disabled={manualSaving}
                style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={submitManualBooking} disabled={manualSaving || !manualForm.customerName || !manualForm.scheduledDate || !manualForm.scheduledTime}
                style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', background: FM.orange, color: 'white', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', opacity: (manualSaving || !manualForm.customerName || !manualForm.scheduledDate || !manualForm.scheduledTime) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {manualSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900"><ChevronLeft className="w-4 h-4" /><span className="text-sm font-medium">Dashboard</span></button>
            <div className="h-5 w-px bg-slate-300" />
            <div className="flex items-center gap-2"><Wrench className="w-5 h-5" style={{ color: FM.orange }} /><h1 className="text-lg font-bold text-slate-800">Service Scheduling</h1></div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Stats + Capacity */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Today', value: counts.today, sub: `${counts.this_week} this week`, icon: Calendar, color: FM.navy },
            { label: 'Pending', value: counts.pending, sub: '', icon: Clock, color: '#d97706' },
            { label: 'In Progress', value: counts.in_progress, sub: '', icon: Wrench, color: FM.orange },
            { label: 'Completed', value: counts.completed, sub: '', icon: Check, color: '#16a34a' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}><s.icon className="w-5 h-5" style={{ color: s.color }} /></div>
              <div><p className="text-2xl font-bold text-slate-800">{s.value}</p><p className="text-xs text-slate-500">{s.label}{s.sub ? ` · ${s.sub}` : ''}</p></div>
            </div>
          ))}
          {/* Capacity gauge */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: todayCapacity.percent >= 80 ? '#fef2f2' : todayCapacity.percent >= 50 ? '#fffbeb' : '#f0fdf4' }}>
                <ArrowRight className="w-5 h-5" style={{ color: todayCapacity.percent >= 80 ? '#dc2626' : todayCapacity.percent >= 50 ? '#d97706' : '#16a34a' }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{todayCapacity.percent}%</p>
                <p className="text-xs text-slate-500">Today's Capacity</p>
              </div>
            </div>
            <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${todayCapacity.percent}%`, height: '100%', borderRadius: 3, background: todayCapacity.percent >= 80 ? '#dc2626' : todayCapacity.percent >= 50 ? '#d97706' : '#16a34a', transition: 'width 0.3s' }} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{todayCapacity.booked} of {todayCapacity.total} slots filled</p>
          </div>
        </div>

        {/* Week capacity bar */}
        {weekCapacity.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Upcoming Capacity</p>
            <div className="grid grid-cols-5 gap-3">
              {weekCapacity.map(({ date, label, cap }) => (
                <div key={date}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600">{label}</span>
                    <span className="text-xs font-bold" style={{ color: cap.percent >= 80 ? '#dc2626' : cap.percent >= 50 ? '#d97706' : '#16a34a' }}>{cap.percent}%</span>
                  </div>
                  <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${cap.percent}%`, height: '100%', borderRadius: 4, background: cap.percent >= 80 ? '#dc2626' : cap.percent >= 50 ? '#d97706' : '#16a34a', transition: 'width 0.3s' }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{cap.booked}/{cap.total} slots</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs + Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit">
            {([
              { key: 'queue' as ViewMode, label: 'Queue', icon: MessageSquare },
              { key: 'calendar' as ViewMode, label: 'Calendar', icon: Calendar },
              { key: 'services' as ViewMode, label: 'Services', icon: Wrench },
              { key: 'availability' as ViewMode, label: 'Availability', icon: Clock },
            ]).map(v => (
              <button key={v.key} onClick={() => setView(v.key)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${view === v.key ? 'text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`} style={view === v.key ? { background: FM.navy } : {}}>
                <v.icon className="w-4 h-4" />{v.label}
              </button>
            ))}
          </div>
          <button onClick={() => { console.log('CLICK - setting showManualBooking to true'); setShowManualBooking(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 text-white font-semibold rounded-lg text-sm" style={{ background: FM.orange }}>
            <Plus className="w-4 h-4" />Add Appointment
          </button>
        </div>

        {/* Alert Chip */}
        {counts.contact_needed > 0 && (
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl cursor-pointer" onClick={() => { setFilterStatus('contact_needed'); setView('queue'); }}>
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-semibold text-red-800">{counts.contact_needed} need{counts.contact_needed === 1 ? 's' : ''} contact</span>
          </div>
        )}

      {/* ========== QUEUE VIEW ========== */}
      {view === 'queue' && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedAppt ? '1fr 420px' : '1fr', gap: '1.5rem' }}>
          {/* Appointment List */}
          <div>
            {/* Search + Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
                <Search className="w-4 h-4" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Search customers, equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.8125rem', outline: 'none' }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'active', label: 'Active' },
                  { key: 'contact_needed', label: 'Contact Needed' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'confirmed', label: 'Confirmed' },
                  { key: 'in_progress', label: 'In Progress' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'all', label: 'All' },
                ].map(f => (
                  <button key={f.key} onClick={() => setFilterStatus(f.key)}
                    style={{ padding: '0.375rem 0.625rem', borderRadius: 6, border: '1px solid', borderColor: filterStatus === f.key ? '#3b82f6' : '#e2e8f0', background: filterStatus === f.key ? '#eff6ff' : 'white', color: filterStatus === f.key ? '#2563eb' : '#64748b', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {f.label}
                    {f.key !== 'active' && f.key !== 'all' && counts[f.key as keyof Counts] ? ` (${counts[f.key as keyof Counts]})` : ''}
                  </button>
                ))}
              </div>
              {existingTechnicians.length > 0 && (
                <select
                  value={filterTechnician}
                  onChange={(e) => setFilterTechnician(e.target.value)}
                  style={{ padding: '0.375rem 0.625rem', borderRadius: 6, border: '1px solid', borderColor: filterTechnician ? '#3b82f6' : '#e2e8f0', background: filterTechnician ? '#eff6ff' : 'white', color: filterTechnician ? '#2563eb' : '#64748b', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', appearance: 'auto' as any }}
                >
                  <option value="">All Technicians</option>
                  <option value="unassigned">Unassigned</option>
                  {existingTechnicians.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              )}
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
                <Wrench className="w-10 h-10 mx-auto mb-2" style={{ color: '#cbd5e1' }} />
                <p style={{ fontWeight: 500 }}>
                  {searchQuery ? `No results for "${searchQuery}"` : 'No appointments found'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filtered.map(appt => {
                  const sc = STATUS_CONFIG[appt.status];
                  const isSelected = selectedAppt?.id === appt.id;
                  return (
                    <button key={appt.id} onClick={() => setSelectedAppt(isSelected ? null : appt)}
                      style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', background: isSelected ? '#f8fafc' : 'white', borderRadius: 12, border: isSelected ? '2px solid #3b82f6' : '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'border-color 0.15s' }}>
                      {/* Status dot */}
                      <div style={{ width: 10, height: 10, borderRadius: 999, background: sc.color, flexShrink: 0 }} />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9375rem' }}>{appt.customer_name}</span>
                          {appt.is_custom_request && (
                            <span style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: '#fef2f2', color: '#dc2626' }}>CUSTOM</span>
                          )}
                          {appt.technician && (
                            <span style={{ fontSize: '0.6875rem', fontWeight: 500, padding: '2px 6px', borderRadius: 4, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 2 }}>
                              <UserCheck className="w-3 h-3" /> {appt.technician}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem', color: '#64748b' }}>
                          <span>{appt.service_type_name}</span>
                          {appt.scheduled_start && (
                            <>
                              <span>·</span>
                              <span>{fmtDateLocal(appt.scheduled_start!, { month: 'short', day: 'numeric' })} at {fmtTime(appt.scheduled_start!)}</span>
                            </>
                          )}
                          {!appt.scheduled_start && appt.preferred_date && (
                            <>
                              <span>·</span>
                              <span style={{ fontStyle: 'italic' }}>Requested: {appt.preferred_date}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, whiteSpace: 'nowrap' }}>
                        {sc.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ========== DETAIL PANEL ========== */}
          {selectedAppt && (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.5rem', position: 'sticky', top: '1.5rem', maxHeight: 'calc(100vh - 3rem)', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.125rem' }}>{selectedAppt.customer_name}</h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: STATUS_CONFIG[selectedAppt.status].bg, color: STATUS_CONFIG[selectedAppt.status].color, border: `1px solid ${STATUS_CONFIG[selectedAppt.status].border}` }}>
                    {STATUS_CONFIG[selectedAppt.status].label}
                  </span>
                </div>
                <button onClick={() => setSelectedAppt(null)} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#94a3b8', borderRadius: 6, padding: '0.25rem' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contact */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                <a href={`mailto:${selectedAppt.customer_email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', textDecoration: 'none' }}>
                  <Mail className="w-3.5 h-3.5" /> {selectedAppt.customer_email}
                </a>
                {selectedAppt.customer_phone && (
                  <a href={`tel:${selectedAppt.customer_phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', textDecoration: 'none' }}>
                    <Phone className="w-3.5 h-3.5" /> {selectedAppt.customer_phone}
                  </a>
                )}
              </div>

              {/* Service Info */}
              <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 10, marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>{selectedAppt.service_type_name}</div>
                {selectedAppt.is_custom_request && selectedAppt.custom_description && (
                  <p style={{ fontSize: '0.875rem', color: '#475569', fontStyle: 'italic', marginTop: '0.5rem' }}>"{selectedAppt.custom_description}"</p>
                )}
                {selectedAppt.customer_notes && !selectedAppt.is_custom_request && (
                  <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.375rem' }}>Note: {selectedAppt.customer_notes}</p>
                )}
                {selectedAppt.duration_minutes && (
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Duration: {selectedAppt.duration_minutes} min</span>
                )}
              </div>

              {/* Schedule Info / Schedule Action */}
              <div style={{ padding: '1rem', background: selectedAppt.scheduled_start ? '#eff6ff' : '#fffbeb', borderRadius: 10, marginBottom: '1rem', border: `1px solid ${selectedAppt.scheduled_start ? '#bfdbfe' : '#fde68a'}` }}>
                <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Calendar className="w-3.5 h-3.5" /> Schedule
                </div>
                {selectedAppt.scheduled_start ? (
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#1e40af' }}>
                      {fmtDateLocal(selectedAppt.scheduled_start!, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#3b82f6' }}>
                      {fmtTime(selectedAppt.scheduled_start!)}
                      {selectedAppt.scheduled_end && ` – ${fmtTime(selectedAppt.scheduled_end)}`}
                    </div>
                    {!['completed', 'canceled'].includes(selectedAppt.status) && (
                      <button onClick={() => { setShowScheduleModal(true); setScheduleDate(selectedAppt.scheduled_start!.split('T')[0]); setScheduleTime(selectedAppt.scheduled_start!.split('T')[1]?.substring(0, 5) || ''); setScheduleDuration(selectedAppt.duration_minutes || 60); }}
                        style={{ marginTop: '0.5rem', padding: '0.25rem 0.625rem', borderRadius: 6, border: '1px solid #bfdbfe', background: 'white', color: '#3b82f6', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                        Reschedule
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    {selectedAppt.preferred_date && (
                      <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem' }}>
                        Customer requested: {selectedAppt.preferred_date}
                        {selectedAppt.preferred_time && ` at ${selectedAppt.preferred_time}`}
                      </div>
                    )}
                    {!selectedAppt.preferred_date && (
                      <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem' }}>No date/time set</div>
                    )}
                    {!['completed', 'canceled'].includes(selectedAppt.status) && (
                      <button onClick={() => {
                        setShowScheduleModal(true);
                        setScheduleDate(selectedAppt.preferred_date || '');
                        setScheduleTime(selectedAppt.preferred_time || '09:00');
                        setScheduleDuration(selectedAppt.duration_minutes || 60);
                      }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem', borderRadius: 6, border: 'none', background: '#2563eb', color: 'white', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                        <CalendarPlus className="w-3.5 h-3.5" /> Schedule Appointment
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Scheduling Modal */}
              {showScheduleModal && (
                <div style={{ padding: '1rem', background: '#f0f9ff', borderRadius: 10, marginBottom: '1rem', border: '2px solid #3b82f6' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                    {selectedAppt.scheduled_start ? 'Reschedule' : 'Schedule'} Appointment
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Date</label>
                      <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.8125rem' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Time</label>
                      <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.8125rem' }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Duration (minutes)</label>
                    <select value={scheduleDuration} onChange={(e) => setScheduleDuration(parseInt(e.target.value))}
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.8125rem' }}>
                      {[30, 45, 60, 90, 120, 180, 240].map(m => (
                        <option key={m} value={m}>{m} min ({m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setShowScheduleModal(false)}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '0.8125rem', cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button onClick={() => scheduleAppointment(selectedAppt.id)} disabled={!scheduleDate || !scheduleTime}
                      style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: 'none', background: '#2563eb', color: 'white', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', opacity: (!scheduleDate || !scheduleTime) ? 0.5 : 1 }}>
                      Confirm Schedule
                    </button>
                  </div>
                </div>
              )}

              {/* Equipment */}
              {(selectedAppt.equipment_type || selectedAppt.equipment_make) && (
                <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: 10, marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Equipment</div>
                  <div style={{ color: '#475569' }}>
                    {[selectedAppt.equipment_type, selectedAppt.equipment_make, selectedAppt.equipment_model].filter(Boolean).join(' · ')}
                  </div>
                </div>
              )}

              {/* Technician Assignment */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Technician
                </label>
                {selectedAppt.technician && !showTechDropdown ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.75rem', background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
                      <UserCheck className="w-4 h-4" style={{ color: '#16a34a' }} />
                      <span style={{ fontWeight: 600, color: '#15803d', fontSize: '0.875rem' }}>{selectedAppt.technician}</span>
                    </div>
                    {!['completed', 'canceled'].includes(selectedAppt.status) && (
                      <>
                        <button onClick={() => { setShowTechDropdown(true); setTechInput(selectedAppt.technician || ''); }}
                          style={{ padding: '0.375rem 0.625rem', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer' }}>
                          Change
                        </button>
                        <button onClick={() => updateAppointment(selectedAppt.id, { technician: null })}
                          style={{ padding: '0.375rem 0.625rem', borderRadius: 6, border: '1px solid #fca5a5', background: 'white', color: '#dc2626', fontSize: '0.75rem', cursor: 'pointer' }}>
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Type or select technician..."
                      value={techInput}
                      onChange={(e) => { setTechInput(e.target.value); setShowTechDropdown(true); }}
                      onFocus={() => setShowTechDropdown(true)}
                      onBlur={(e) => {
                        // Delay closing so dropdown button clicks can register
                        setTimeout(() => setShowTechDropdown(false), 200);
                      }}
                      onKeyDown={(e) => { if (e.key === 'Enter' && techInput.trim()) { assignTechnician(selectedAppt.id, techInput.trim()); } }}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.8125rem' }}
                    />
                    {showTechDropdown && existingTechnicians.length > 0 && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: 160, overflowY: 'auto' }}>
                        {existingTechnicians
                          .filter(t => !techInput || t.toLowerCase().includes(techInput.toLowerCase()))
                          .map(tech => (
                            <button key={tech}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => assignTechnician(selectedAppt.id, tech)}
                              style={{ display: 'block', width: '100%', padding: '0.5rem 0.75rem', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8125rem', color: '#0f172a' }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}>
                              {tech}
                            </button>
                          ))}
                        {techInput.trim() && !existingTechnicians.includes(techInput.trim()) && (
                          <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => assignTechnician(selectedAppt.id, techInput.trim())}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', width: '100%', padding: '0.5rem 0.75rem', textAlign: 'left', border: 'none', borderTop: '1px solid #f1f5f9', background: '#f0fdf4', cursor: 'pointer', fontSize: '0.8125rem', color: '#16a34a', fontWeight: 600 }}>
                            <Plus className="w-3.5 h-3.5" /> Assign "{techInput.trim()}"
                          </button>
                        )}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem' }}>
                      {techInput.trim() && (
                        <button onClick={() => assignTechnician(selectedAppt.id, techInput.trim())}
                          style={{ padding: '0.25rem 0.5rem', borderRadius: 6, border: 'none', background: '#2563eb', color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                          Assign
                        </button>
                      )}
                      {(showTechDropdown || selectedAppt.technician) && (
                        <button onClick={() => { setShowTechDropdown(false); setTechInput(''); }}
                          style={{ padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer' }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Actions */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Update Status</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {selectedAppt.is_custom_request && selectedAppt.status === 'contact_needed' && (
                    <button onClick={() => updateAppointment(selectedAppt.id, { status: 'contact_needed', contactedAt: new Date().toISOString() })}
                      style={{ padding: '0.375rem 0.75rem', borderRadius: 6, border: '1px solid #fca5a5', background: '#fef2f2', color: '#dc2626', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Phone className="w-3.5 h-3.5" /> Mark Contacted
                    </button>
                  )}
                  {['pending', 'contact_needed'].includes(selectedAppt.status) && (
                    <button onClick={() => updateAppointment(selectedAppt.id, { status: 'confirmed' })}
                      style={{ padding: '0.375rem 0.75rem', borderRadius: 6, border: 'none', background: '#2563eb', color: 'white', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                      Confirm
                    </button>
                  )}
                  {['confirmed'].includes(selectedAppt.status) && (
                    <button onClick={() => updateAppointment(selectedAppt.id, { status: 'in_progress' })}
                      style={{ padding: '0.375rem 0.75rem', borderRadius: 6, border: 'none', background: '#7c3aed', color: 'white', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                      Start Work
                    </button>
                  )}
                  {['confirmed', 'in_progress'].includes(selectedAppt.status) && (
                    <button onClick={() => updateAppointment(selectedAppt.id, { status: 'completed' })}
                      style={{ padding: '0.375rem 0.75rem', borderRadius: 6, border: 'none', background: '#16a34a', color: 'white', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>
                      Complete
                    </button>
                  )}
                  {!['completed', 'canceled'].includes(selectedAppt.status) && (
                    <button onClick={() => { if (confirm('Cancel this appointment?')) updateAppointment(selectedAppt.id, { status: 'canceled' }); }}
                      style={{ padding: '0.375rem 0.75rem', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', color: '#6b7280', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Internal Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Internal Notes</label>
                <textarea
                  defaultValue={selectedAppt.internal_notes || ''}
                  key={selectedAppt.id} // Reset when switching appointments
                  onBlur={(e) => {
                    if (e.target.value !== (selectedAppt.internal_notes || '')) {
                      updateAppointment(selectedAppt.id, { internalNotes: e.target.value });
                    }
                  }}
                  rows={3}
                  placeholder="Add notes about this appointment..."
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: '0.875rem', resize: 'vertical' }}
                />
              </div>

              {/* Timeline */}
              <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', fontSize: '0.8125rem', color: '#94a3b8' }}>
                <div>Created: {new Date(selectedAppt.created_at).toLocaleString()}</div>
                {selectedAppt.contacted_at && <div>Contacted: {new Date(selectedAppt.contacted_at).toLocaleString()}</div>}
                {selectedAppt.scheduled_start && <div>Scheduled: {fmtDateLocal(selectedAppt.scheduled_start, { month: 'short', day: 'numeric' })} at {fmtTime(selectedAppt.scheduled_start)}</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== CALENDAR VIEW ========== */}
      {view === 'calendar' && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <button onClick={() => setCalDate(new Date(calYear, calMonth - 1, 1))} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer' }}>
              <ChevronLeft className="w-5 h-5" style={{ color: '#475569' }} />
            </button>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>{monthName}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginTop: '0.25rem' }}>
                <button onClick={() => setCalDate(new Date())} style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Today</button>
                {existingTechnicians.length > 0 && (
                  <select
                    value={filterTechnician}
                    onChange={(e) => setFilterTechnician(e.target.value)}
                    style={{ padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid', borderColor: filterTechnician ? '#3b82f6' : '#e2e8f0', background: filterTechnician ? '#eff6ff' : 'white', color: filterTechnician ? '#2563eb' : '#64748b', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer' }}
                  >
                    <option value="">All Technicians</option>
                    <option value="unassigned">Unassigned</option>
                    {existingTechnicians.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                )}
              </div>
            </div>
            <button onClick={() => setCalDate(new Date(calYear, calMonth + 1, 1))} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, padding: '0.5rem', cursor: 'pointer' }}>
              <ChevronRight className="w-5 h-5" style={{ color: '#475569' }} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '1px' }}>
            {DAY_SHORT.map(d => (
              <div key={d} style={{ textAlign: 'center', padding: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: '#e2e8f0' }}>
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} style={{ background: '#f8fafc', minHeight: 100, padding: '0.5rem' }} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayAppts = getApptForDate(day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === calMonth && new Date().getFullYear() === calYear;

              return (
                <div key={day} style={{ background: 'white', minHeight: 100, padding: '0.5rem' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: isToday ? 700 : 500, color: isToday ? '#2563eb' : '#475569', marginBottom: '0.25rem' }}>
                    {isToday ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 999, background: '#2563eb', color: 'white', fontSize: '0.75rem' }}>{day}</span>
                    ) : day}
                  </div>
                  {dayAppts.slice(0, 3).map(a => {
                    const sc = STATUS_CONFIG[a.status];
                    return (
                      <button key={a.id} onClick={() => { setSelectedAppt(a); setView('queue'); }}
                        style={{ display: 'block', width: '100%', padding: '2px 4px', marginBottom: 2, borderRadius: 4, background: sc.bg, border: 'none', cursor: 'pointer', fontSize: '0.6875rem', color: sc.color, fontWeight: 500, textAlign: 'left', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                        {a.scheduled_start && fmtTime(a.scheduled_start)} {a.customer_name.split(' ')[0]}
                      </button>
                    );
                  })}
                  {dayAppts.length > 3 && (
                    <div style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 500 }}>+{dayAppts.length - 3} more</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========== SETTINGS VIEW ========== */}
      {view === 'services' && (
        <ServiceTypeManager
          types={serviceTypes}
          onSave={saveServiceType}
          onDelete={deleteServiceType}
          saving={saving}
        />
      )}

      {view === 'availability' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Business Hours Section */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Business Hours</h2>
                  <p style={{ color: '#64748b', fontSize: '0.8125rem' }}>Set when customers can book appointments online.</p>
                </div>
                <button onClick={saveAvailability} disabled={saving}
                  style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : 'Save Hours'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {availability.map((day, idx) => (
                  <div key={day.day_of_week} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'white', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ width: 100 }}>
                      <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>{DAY_NAMES[day.day_of_week]}</span>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={day.is_available}
                        onChange={(e) => {
                          const updated = [...availability];
                          updated[idx] = { ...updated[idx], is_available: e.target.checked };
                          setAvailability(updated);
                        }}
                        style={{ width: 16, height: 16, accentColor: '#2563eb' }}
                      />
                      <span style={{ fontSize: '0.8125rem', color: day.is_available ? '#16a34a' : '#94a3b8', fontWeight: 500 }}>
                        {day.is_available ? 'Open' : 'Closed'}
                      </span>
                    </label>

                    {day.is_available && (
                      <>
                        <input type="time" value={day.start_time}
                          onChange={(e) => {
                            const updated = [...availability];
                            updated[idx] = { ...updated[idx], start_time: e.target.value };
                            setAvailability(updated);
                          }}
                          style={{ padding: '0.375rem 0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.8125rem' }}
                        />
                        <span style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>to</span>
                        <input type="time" value={day.end_time}
                          onChange={(e) => {
                            const updated = [...availability];
                            updated[idx] = { ...updated[idx], end_time: e.target.value };
                            setAvailability(updated);
                          }}
                          style={{ padding: '0.375rem 0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.8125rem' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <label style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>Max slots:</label>
                          <input type="number" min={1} max={10} value={day.max_concurrent}
                            onChange={(e) => {
                              const updated = [...availability];
                              updated[idx] = { ...updated[idx], max_concurrent: parseInt(e.target.value) || 1 };
                              setAvailability(updated);
                            }}
                            style={{ width: 50, padding: '0.375rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.8125rem', textAlign: 'center' }}
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.8125rem', color: '#64748b' }}>
                <strong style={{ color: '#475569' }}>Max concurrent slots</strong> controls how many appointments can overlap in the same time window. Set to 2 if you have two service bays, 3 for three, etc.
              </div>
            </div>
          </div>

          {/* Blocked Dates Section */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Blocked Dates</h2>
                <p style={{ color: '#64748b', fontSize: '0.8125rem' }}>Block specific dates from online booking (holidays, closures, etc).</p>
              </div>

              {/* Add blocked date */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Date</label>
                  <input type="date" value={newBlockedDate} onChange={(e) => setNewBlockedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.8125rem' }} />
                </div>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Reason (optional)</label>
                  <input type="text" value={newBlockedReason} onChange={(e) => setNewBlockedReason(e.target.value)}
                    placeholder="e.g. Holiday, Staff Training"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, fontSize: '0.8125rem' }} />
                </div>
                <button onClick={addBlockedDate} disabled={!newBlockedDate || saving}
                  style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: '#0f172a', color: 'white', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', opacity: (!newBlockedDate || saving) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Ban className="w-4 h-4" /> Block Date
                </button>
              </div>

              {/* Blocked dates list */}
              {blockedDates.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', background: '#f8fafc', borderRadius: 12 }}>
                  <Calendar className="w-8 h-8 mx-auto mb-1" style={{ color: '#cbd5e1' }} />
                  <p style={{ fontWeight: 500 }}>No blocked dates. Customers can book any available day.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  {blockedDates.map(bd => (
                    <div key={bd.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'white', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Ban className="w-4 h-4" style={{ color: '#dc2626' }} />
                        <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>
                          {new Date(bd.blocked_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                        {bd.reason && <span style={{ color: '#64748b', fontSize: '0.8125rem' }}>— {bd.reason}</span>}
                      </div>
                      <button onClick={() => removeBlockedDate(bd.id)}
                        style={{ padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid #fca5a5', background: 'white', color: '#dc2626', fontSize: '0.75rem', cursor: 'pointer' }}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
      )}
      </div>
    </div>
  );
}


// ============================================
// SERVICE TYPE MANAGER COMPONENT
// ============================================
function ServiceTypeManager({ types, onSave, onDelete, saving }: {
  types: ServiceType[];
  onSave: (type: any) => void;
  onDelete: (id: string) => void;
  saving: boolean;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [newType, setNewType] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', duration_minutes: 60, price_estimate: '', category: 'general' });

  const startEdit = (type: ServiceType) => {
    setEditing(type.id);
    setForm({ name: type.name, description: type.description || '', duration_minutes: type.duration_minutes, price_estimate: type.price_estimate || '', category: type.category });
    setNewType(false);
  };

  const startNew = () => {
    setEditing(null);
    setNewType(true);
    setForm({ name: '', description: '', duration_minutes: 60, price_estimate: '', category: 'general' });
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave(editing ? { id: editing, ...form } : form);
    setEditing(null);
    setNewType(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Service Types</h2>
          <p style={{ color: '#64748b', fontSize: '0.8125rem' }}>Define the services you offer. Customers will pick from this list, plus an "Other" option.</p>
        </div>
        <button onClick={startNew} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: '#0f172a', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}>
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {newType && (
        <div style={{ background: '#eff6ff', borderRadius: 12, border: '2px solid #3b82f6', padding: '1.25rem', marginBottom: '1rem' }}>
          <ServiceTypeForm form={form} setForm={setForm} onSave={handleSave} onCancel={() => setNewType(false)} saving={saving} />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {types.map(type => (
          <div key={type.id} style={{ background: 'white', borderRadius: 12, border: editing === type.id ? '2px solid #3b82f6' : '1px solid #e2e8f0', padding: '1.25rem' }}>
            {editing === type.id ? (
              <ServiceTypeForm form={form} setForm={setForm} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: type.is_active ? '#f0fdf4' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Wrench className="w-5 h-5" style={{ color: type.is_active ? '#16a34a' : '#94a3b8' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{type.name}</span>
                    {!type.is_active && <span style={{ fontSize: '0.6875rem', padding: '2px 6px', borderRadius: 4, background: '#f1f5f9', color: '#94a3b8' }}>Inactive</span>}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#64748b', display: 'flex', gap: '0.75rem' }}>
                    <span>{type.duration_minutes} min</span>
                    {type.price_estimate && <span>· {type.price_estimate}</span>}
                    <span>· {type.category}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button onClick={() => startEdit(type)} style={{ padding: '0.375rem 0.75rem', borderRadius: 6, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: '0.8125rem', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => onDelete(type.id)} style={{ padding: '0.375rem 0.75rem', borderRadius: 6, border: '1px solid #fca5a5', background: 'white', color: '#dc2626', fontSize: '0.8125rem', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {types.length === 0 && !newType && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: '#f8fafc', borderRadius: 12 }}>
          <Wrench className="w-8 h-8 mx-auto mb-1" style={{ color: '#cbd5e1' }} />
          <p style={{ fontWeight: 500 }}>No service types yet. Add your first one!</p>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: '0.8125rem', color: '#64748b' }}>
        <strong style={{ color: '#475569' }}>How it works:</strong> Customers will see these service options when booking on your website. Each service type has a set duration that determines which time slots are available. There's always an "Other" option that creates a contact request instead of a direct booking.
      </div>

    </div>
  );
}


// ============================================
// SERVICE TYPE EDIT FORM
// ============================================
function ServiceTypeForm({ form, setForm, onSave, onCancel, saving }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Service Name *</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Full Tune-Up"
            style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Category</label>
          <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem' }}>
            <option value="maintenance">Maintenance</option>
            <option value="repair">Repair</option>
            <option value="warranty">Warranty</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Description</label>
        <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description shown to customers"
          style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Duration (minutes) *</label>
          <input type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 60 })} min={15} step={15}
            style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Price Estimate</label>
          <input type="text" value={form.price_estimate} onChange={e => setForm({ ...form, price_estimate: e.target.value })} placeholder="$75-$100"
            style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: 8, fontSize: '0.875rem' }} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: '0.8125rem', cursor: 'pointer' }}>Cancel</button>
        <button onClick={onSave} disabled={saving || !form.name.trim()} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: 'none', background: '#2563eb', color: 'white', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}
