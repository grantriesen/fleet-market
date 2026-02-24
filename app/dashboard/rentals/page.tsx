'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Truck, Plus, Search, ChevronLeft, ChevronRight, Edit2, Trash2, Star, StarOff,
  X, Upload, Image as ImageIcon, DollarSign, ArrowUpDown, ArrowUp, ArrowDown,
  AlertCircle, Loader2, Grid, List, FileUp, Download, Calendar, Clock,
  CheckCircle, XCircle, User, Mail, Phone, Eye
} from 'lucide-react';

interface RentalItem {
  id: string; site_id: string; title: string; description: string | null;
  category: string | null; manufacturer_id: string | null; model: string | null;
  year: number | null; specifications: Record<string, string>;
  image_gallery: string[]; primary_image: string | null;
  hourly_rate: number | null; daily_rate: number | null;
  weekly_rate: number | null; monthly_rate: number | null;
  deposit_required: number | null; quantity_available: number;
  location: string | null; status: string; featured: boolean;
  display_order: number; minimum_rental_period: string | null;
  requires_training: boolean; requires_license: boolean;
  created_at: string; updated_at: string;
}

interface Booking {
  id: string; site_id: string; rental_item_id: string;
  customer_name: string; customer_email: string; customer_phone: string;
  start_date: string; end_date: string; rental_period: string;
  quantity: number; rate_amount: number; total_amount: number;
  status: string; notes: string | null;
  created_at: string; updated_at: string;
  pickup_time: string | null; return_time: string | null;
  delivery_required: boolean; delivery_address: string | null;
  rental_item?: RentalItem;
}

const FM = { navy: '#1E3A6E', navyDark: '#152C54', orange: '#E85525', orangeGlow: 'rgba(232,85,37,0.1)' };
const CATEGORIES = ['Mowers','Tractors','Utility Vehicles','Trimmers','Blowers','Chainsaws','Aerators','Sprayers','Attachments','Other'];
const BOOKING_STATUSES: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#d97706', bg: '#fffbeb' },
  confirmed: { label: 'Confirmed', color: '#2563eb', bg: '#eff6ff' },
  active: { label: 'Active', color: '#16a34a', bg: '#f0fdf4' },
  returned: { label: 'Returned', color: '#6b7280', bg: '#f9fafb' },
  completed: { label: 'Completed', color: '#059669', bg: '#ecfdf5' },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: '#fef2f2' },
};

function StatusBadge({ status, map }: { status: string; map: Record<string, { label: string; color: string; bg: string }> }) {
  const s = map[status] || { label: status, color: '#6b7280', bg: '#f9fafb' };
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ color: s.color, background: s.bg }}>{s.label}</span>;
}

function fmtPrice(v: number | null): string {
  if (v === null || v === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
}
function fmtDate(d: string): string { return new Date(d).toLocaleDateString(); }
function generateSlug(t: string): string { return t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

const EMPTY_ITEM = {
  title: '', description: '', category: 'Mowers', manufacturer: '', model: '', year: new Date().getFullYear(),
  specifications: {} as Record<string, string>, images: [] as string[], primary_image: null as string | null,
  hourly_rate: null as number | null, daily_rate: null as number | null,
  weekly_rate: null as number | null, monthly_rate: null as number | null,
  deposit_required: null as number | null, quantity_available: 1, location: '',
  status: 'available', featured: false, display_order: 0,
  minimum_rental_period: '1 day', requires_training: false, requires_license: false,
};

export default function RentalsDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const [siteId, setSiteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'fleet' | 'bookings' | 'calendar'>('fleet');

  // Fleet state
  const [items, setItems] = useState<RentalItem[]>([]);
  const [manufacturers, setManufacturers] = useState<{id: string; name: string}[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RentalItem | null>(null);
  const [form, setForm] = useState({ ...EMPTY_ITEM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [activeFormTab, setActiveFormTab] = useState<'details' | 'rates' | 'images'>('details');
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Calendar state
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // CSV import state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvMapping, setCsvMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0, errors: 0 });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3000);
  }, []);
  const uf = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  // Stats
  const totalFleet = items.length;
  const availableCount = items.filter(i => i.status === 'available').length;
  const activeBookings = bookings.filter(b => b.status === 'active').length;
  const revenue = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.total_amount || 0), 0);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      const { data: site } = await supabase.from('sites').select('id').eq('user_id', user.id).single();
      if (!site) { router.push('/onboarding'); return; }
      setSiteId(site.id);
      const { data: mfrs } = await supabase.from('manufacturers').select('id, name').eq('site_id', site.id).order('name');
      setManufacturers(mfrs || []);
      setLoading(false);
    }
    init();
  }, []);

  // Load fleet
  const loadItems = useCallback(async () => {
    if (!siteId) return; setItemsLoading(true);
    let query = supabase.from('rental_inventory').select('*').eq('site_id', siteId);
    if (searchQuery.trim()) query = query.or(`title.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%,manufacturer_id.ilike.%${searchQuery}%`);
    if (filterCategory) query = query.eq('category', filterCategory);
    if (filterStatus) query = query.eq('status', filterStatus);
    query = query.order('display_order');
    const { data, error } = await query;
    if (error) showToast('Failed to load fleet', 'error');
    else setItems(data || []);
    setItemsLoading(false);
  }, [siteId, searchQuery, filterCategory, filterStatus]);

  useEffect(() => { loadItems(); }, [loadItems]);

  // Load bookings
  const loadBookings = useCallback(async () => {
    if (!siteId) return; setBookingsLoading(true);
    let query = supabase.from('rental_bookings').select('*, rental_item:rental_inventory(id, title, primary_image)').eq('site_id', siteId);
    if (bookingFilter) query = query.eq('status', bookingFilter);
    query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) showToast('Failed to load bookings', 'error');
    else setBookings(data || []);
    setBookingsLoading(false);
  }, [siteId, bookingFilter]);

  useEffect(() => { if (activeTab === 'bookings' || activeTab === 'calendar') loadBookings(); }, [loadBookings, activeTab]);

  // Fleet CRUD
  const openAddModal = () => { setEditingItem(null); setForm({ ...EMPTY_ITEM }); setActiveFormTab('details'); setFormError(''); setModalOpen(true); };
  const openEditModal = (item: RentalItem) => {
    setEditingItem(item);
    setForm({ title: item.title||'', description: item.description||'', category: item.category||'Mowers', manufacturer: item.manufacturer_id||'', model: item.model||'', year: item.year||new Date().getFullYear(), specifications: item.specifications||{}, images: item.image_gallery||[], primary_image: item.primary_image, hourly_rate: item.hourly_rate, daily_rate: item.daily_rate, weekly_rate: item.weekly_rate, monthly_rate: item.monthly_rate, deposit_required: item.deposit_required, quantity_available: item.quantity_available||1, location: item.location||'', status: item.status||'available', featured: item.featured||false, display_order: item.display_order||0, minimum_rental_period: item.minimum_rental_period||'1 day', requires_training: item.requires_training||false, requires_license: item.requires_license||false });
    setActiveFormTab('details'); setFormError(''); setModalOpen(true);
  };
  const handleSave = async () => {
    if (!siteId || !form.title.trim()) { setFormError('Title is required'); return; }
    setSaving(true); setFormError('');
    const record = { site_id: siteId, title: form.title.trim(), description: form.description?.trim()||null, category: form.category, manufacturer_id: (form.manufacturer && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(form.manufacturer)) ? form.manufacturer : null, model: form.model?.trim()||null, year: form.year, specifications: form.specifications, image_gallery: form.images, primary_image: form.primary_image||(form.images.length>0?form.images[0]:null), hourly_rate: form.hourly_rate, daily_rate: form.daily_rate, weekly_rate: form.weekly_rate, monthly_rate: form.monthly_rate, deposit_required: form.deposit_required, quantity_available: form.quantity_available, location: form.location?.trim()||null, status: form.status, featured: form.featured, display_order: form.display_order, minimum_rental_period: form.minimum_rental_period, requires_training: form.requires_training, requires_license: form.requires_license, updated_at: new Date().toISOString() };
    try {
      if (editingItem) { const { error } = await supabase.from('rental_inventory').update(record).eq('id', editingItem.id); if (error) throw error; showToast('Equipment updated'); }
      else { const { error } = await supabase.from('rental_inventory').insert(record); if (error) throw error; showToast('Equipment added'); }
      setModalOpen(false); loadItems();
    } catch (err: any) { setFormError(err.message || 'Failed to save'); }
    setSaving(false);
  };
  const handleDelete = async (id: string) => { await supabase.from('rental_inventory').delete().eq('id', id); showToast('Equipment deleted'); setDeleteConfirm(null); loadItems(); };
  const toggleFeatured = async (item: RentalItem) => { await supabase.from('rental_inventory').update({ featured: !item.featured }).eq('id', item.id); setItems(prev => prev.map(i => i.id === item.id ? { ...i, featured: !i.featured } : i)); };

  // Image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files || !siteId) return; setUploading(true); const newImgs: string[] = [];
    for (const file of Array.from(files)) { const ext = file.name.split('.').pop(); const path = `${siteId}/rentals/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`; const { error } = await supabase.storage.from('inventory-images').upload(path, file, { cacheControl: '3600', upsert: false }); if (!error) { const { data: u } = supabase.storage.from('inventory-images').getPublicUrl(path); if (u) newImgs.push(u.publicUrl); } }
    if (newImgs.length > 0) setForm(p => ({ ...p, images: [...p.images, ...newImgs], primary_image: p.primary_image || newImgs[0] }));
    setUploading(false); if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const removeImage = (url: string) => { setForm(p => ({ ...p, images: p.images.filter(i => i !== url), primary_image: p.primary_image === url ? p.images.filter(i => i !== url)[0] || null : p.primary_image })); };

  // Booking status updates
  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const updates: any = { status: newStatus, updated_at: new Date().toISOString() };
    const { error } = await supabase.from('rental_bookings').update(updates).eq('id', bookingId);
    if (error) showToast('Failed to update', 'error');
    else { showToast(`Booking ${newStatus}`); loadBookings(); if (selectedBooking?.id === bookingId) setSelectedBooking(prev => prev ? { ...prev, ...updates } : null); }
  };

  // CSV Import
  const CSV_FIELDS = [
    { key: 'title', label: 'Title', required: true }, { key: 'description', label: 'Description' },
    { key: 'category', label: 'Category' }, { key: 'manufacturer', label: 'Manufacturer' },
    { key: 'model', label: 'Model' }, { key: 'year', label: 'Year' },
    { key: 'daily_rate', label: 'Daily Rate' }, { key: 'weekly_rate', label: 'Weekly Rate' },
    { key: 'monthly_rate', label: 'Monthly Rate' }, { key: 'deposit_required', label: 'Deposit' },
    { key: 'quantity_available', label: 'Quantity' }, { key: 'location', label: 'Location' },
  ];
  const handleCSVFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) return;
      const delim = lines[0].includes('\t') ? '\t' : ',';
      const headers = lines[0].split(delim).map(h => h.trim().replace(/^"|"$/g, ''));
      const rows = lines.slice(1).map(line => { const vals = line.split(delim).map(v => v.trim().replace(/^"|"$/g, '')); const row: Record<string, string> = {}; headers.forEach((h, i) => { row[h] = vals[i] || ''; }); return row; });
      setCsvHeaders(headers); setCsvData(rows);
      const autoMap: Record<string, string> = {};
      CSV_FIELDS.forEach(f => { const match = headers.find(h => h.toLowerCase().replace(/[^a-z]/g, '') === f.key.replace(/_/g, '')); if (match) autoMap[f.key] = match; });
      setCsvMapping(autoMap); setImportModalOpen(true);
    };
    reader.readAsText(file); if (csvInputRef.current) csvInputRef.current.value = '';
  };
  const runImport = async () => {
    if (!siteId || csvData.length === 0) return; setImporting(true); setImportProgress({ done: 0, total: csvData.length, errors: 0 }); let errors = 0;
    const BATCH = 50;
    for (let i = 0; i < csvData.length; i += BATCH) {
      const batch = csvData.slice(i, i + BATCH);
      const records = batch.map(row => { const get = (key: string) => csvMapping[key] ? (row[csvMapping[key]] || '').trim() : ''; const title = get('title'); if (!title) return null; return { site_id: siteId, title, description: get('description') || null, category: get('category') || 'Other', manufacturer: get('manufacturer') || null, model: get('model') || null, year: get('year') ? parseInt(get('year')) : null, daily_rate: get('daily_rate') ? parseFloat(get('daily_rate').replace(/[$,]/g, '')) : null, weekly_rate: get('weekly_rate') ? parseFloat(get('weekly_rate').replace(/[$,]/g, '')) : null, monthly_rate: get('monthly_rate') ? parseFloat(get('monthly_rate').replace(/[$,]/g, '')) : null, deposit_required: get('deposit_required') ? parseFloat(get('deposit_required').replace(/[$,]/g, '')) : null, quantity_available: get('quantity_available') ? parseInt(get('quantity_available')) : 1, location: get('location') || null, specifications: {}, image_gallery: [], featured: false, display_order: 0, status: 'available', updated_at: new Date().toISOString() }; }).filter(Boolean);
      if (records.length > 0) { const { error } = await supabase.from('rental_inventory').insert(records); if (error) errors += records.length; }
      setImportProgress({ done: Math.min(i + BATCH, csvData.length), total: csvData.length, errors });
    }
    setImporting(false); setImportModalOpen(false); setCsvData([]); setCsvHeaders([]); setCsvMapping({});
    showToast(errors > 0 ? `Imported with ${errors} error(s)` : `Imported ${csvData.length} items!`, errors > 0 ? 'error' : 'success'); loadItems();
  };
  const downloadTemplate = () => {
    const csv = [CSV_FIELDS.map(f => f.label).join(','), ['Toro Dingo TX 1000', 'Compact utility loader', 'Utility Vehicles', 'Toro', 'TX 1000', '2025', '250', '1200', '3500', '500', '2', 'Main Lot'].join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'rental-fleet-template.csv'; a.click(); URL.revokeObjectURL(url);
  };

  // Calendar helpers
  const calendarDays = (() => {
    const y = calendarMonth.getFullYear(), m = calendarMonth.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  })();
  const getBookingsForDay = (day: number) => {
    const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => b.start_date <= dateStr && b.end_date >= dateStr && b.status !== 'cancelled');
  };

  if (loading) return (<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>);

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && (<div className={`fixed top-4 right-4 z-[200] flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}><span>{toast.type === 'success' ? '✓' : '✕'}</span><span className="font-medium text-sm">{toast.message}</span></div>)}

      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900"><ChevronLeft className="w-4 h-4" /><span className="text-sm font-medium">Dashboard</span></button>
            <div className="h-5 w-px bg-slate-300" />
            <div className="flex items-center gap-2"><Truck className="w-5 h-5" style={{ color: FM.orange }} /><h1 className="text-lg font-bold text-slate-800">Rental Management</h1></div>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'fleet' && <>
              <button onClick={() => csvInputRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-600 font-medium rounded-lg text-xs hover:bg-slate-50"><FileUp className="w-4 h-4" />Import CSV</button>
              <input ref={csvInputRef} type="file" accept=".csv,.tsv,.txt" onChange={handleCSVFile} className="hidden" />
              <button onClick={openAddModal} className="inline-flex items-center gap-2 px-4 py-2 text-white font-semibold rounded-lg text-sm" style={{ background: FM.orange }}><Plus className="w-4 h-4" />Add Equipment</button>
            </>}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Fleet', value: totalFleet, icon: Truck, color: FM.navy },
            { label: 'Available', value: availableCount, icon: CheckCircle, color: '#16a34a' },
            { label: 'Active Rentals', value: activeBookings, icon: Clock, color: FM.orange },
            { label: 'Revenue', value: fmtPrice(revenue), icon: DollarSign, color: '#7c3aed' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}><s.icon className="w-5 h-5" style={{ color: s.color }} /></div>
              <div><p className="text-2xl font-bold text-slate-800">{s.value}</p><p className="text-xs text-slate-500">{s.label}</p></div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-slate-200 p-1 w-fit">
          {([['fleet', 'Fleet', Truck], ['bookings', 'Bookings', Calendar], ['calendar', 'Calendar', Eye]] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => setActiveTab(key as any)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === key ? 'text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`} style={activeTab === key ? { background: FM.navy } : {}}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* FLEET TAB */}
        {activeTab === 'fleet' && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
              <div className="px-5 py-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search fleet..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white"><option value="">All Categories</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white"><option value="">All Statuses</option><option value="available">Available</option><option value="rented">Rented</option><option value="maintenance">Maintenance</option></select>
              </div>
            </div>
            {itemsLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-20 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: FM.orangeGlow }}><Truck className="w-8 h-8" style={{ color: FM.orange }} /></div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No rental equipment yet</h3>
                <p className="text-slate-500 text-sm mb-6">Add your first rental item to start managing your fleet.</p>
                <button onClick={openAddModal} className="inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-lg text-sm" style={{ background: FM.orange }}><Plus className="w-4 h-4" />Add Equipment</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map(item => (
                  <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md cursor-pointer" onClick={() => openEditModal(item)}>
                    <div className="relative aspect-[4/3] bg-slate-100">
                      {item.primary_image ? <img src={item.primary_image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Truck className="w-10 h-10 text-slate-200" /></div>}
                      {item.featured && <div className="absolute top-2 left-2 bg-amber-400 text-white p-1 rounded-md"><Star className="w-3 h-3 fill-white" /></div>}
                      <div className="absolute top-2 right-2"><StatusBadge status={item.status} map={{ available: { label: 'Available', color: '#16a34a', bg: '#f0fdf4' }, rented: { label: 'Rented', color: '#d97706', bg: '#fffbeb' }, maintenance: { label: 'Maintenance', color: '#6b7280', bg: '#f9fafb' } }} /></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-slate-800 truncate">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{[manufacturers.find(m => m.id === item.manufacturer_id)?.name, item.model, item.year].filter(Boolean).join(' · ')}</p>
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                        {item.daily_rate && <div className="text-xs"><span className="font-bold" style={{ color: FM.navy }}>{fmtPrice(item.daily_rate)}</span><span className="text-slate-400">/day</span></div>}
                        {item.weekly_rate && <div className="text-xs"><span className="font-bold" style={{ color: FM.navy }}>{fmtPrice(item.weekly_rate)}</span><span className="text-slate-400">/wk</span></div>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400">{item.quantity_available} available</span>
                        <div className="flex gap-1">
                          <button onClick={(e) => { e.stopPropagation(); toggleFeatured(item); }} className="p-1 rounded hover:bg-slate-100">{item.featured ? <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> : <StarOff className="w-3.5 h-3.5 text-slate-300" />}</button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(item.id); }} className="p-1 rounded hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-slate-300 hover:text-red-500" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6">
              <div className="px-5 py-4 flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-500">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</span>
                <div className="flex gap-1 ml-auto">
                  {['', 'pending', 'confirmed', 'active', 'returned', 'completed', 'cancelled'].map(s => (
                    <button key={s} onClick={() => setBookingFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${bookingFilter === s ? 'text-white' : 'text-slate-600 hover:bg-slate-50 border border-slate-200'}`} style={bookingFilter === s ? { background: FM.navy } : {}}>{s || 'All'}</button>
                  ))}
                </div>
              </div>
            </div>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm py-20 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-800 mb-2">{bookingFilter ? 'No bookings match this filter' : 'No bookings yet'}</h3>
                <p className="text-slate-500 text-sm">Bookings will appear here when customers request rentals.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map(booking => (
                  <div key={booking.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm cursor-pointer" onClick={() => setSelectedBooking(booking)}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {(booking as any).rental_item?.primary_image ? <img src={(booking as any).rental_item.primary_image} alt="" className="w-full h-full object-cover" /> : <Truck className="w-6 h-6 text-slate-300 m-auto mt-3" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{(booking as any).rental_item?.title || 'Unknown Item'}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{booking.customer_name}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{fmtDate(booking.start_date)} — {fmtDate(booking.end_date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold" style={{ color: FM.navy }}>{fmtPrice(booking.total_amount)}</span>
                        <StatusBadge status={booking.status} map={BOOKING_STATUSES} />
                      </div>
                    </div>
                    {/* Quick actions */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                      {booking.status === 'pending' && <>
                        <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking.id, 'confirmed'); }} className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">Confirm</button>
                        <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking.id, 'cancelled'); }} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100">Cancel</button>
                      </>}
                      {booking.status === 'confirmed' && <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking.id, 'active'); }} className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100">Mark Picked Up</button>}
                      {booking.status === 'active' && <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking.id, 'returned'); }} className="px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100">Mark Returned</button>}
                      {booking.status === 'returned' && <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(booking.id, 'completed'); }} className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100">Complete</button>}
                      <span className="ml-auto text-xs text-slate-400">Created {fmtDate(booking.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
              <h2 className="text-lg font-bold text-slate-800">{calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
              <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-7">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="px-2 py-3 text-center text-xs font-semibold text-slate-400 border-b border-slate-100">{d}</div>)}
              {calendarDays.map((day, i) => {
                const dayBookings = day ? getBookingsForDay(day) : [];
                const isToday = day && new Date().toDateString() === new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day).toDateString();
                return (
                  <div key={i} className={`min-h-[100px] border-b border-r border-slate-100 p-1.5 ${!day ? 'bg-slate-50/50' : ''}`}>
                    {day && (
                      <>
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium ${isToday ? 'text-white' : 'text-slate-600'}`} style={isToday ? { background: FM.orange } : {}}>{day}</span>
                        <div className="mt-1 space-y-0.5">
                          {dayBookings.slice(0, 3).map(b => (
                            <div key={b.id} onClick={() => setSelectedBooking(b)} className="px-1.5 py-0.5 rounded text-[10px] font-medium truncate cursor-pointer" style={{ background: BOOKING_STATUSES[b.status]?.bg || '#f9fafb', color: BOOKING_STATUSES[b.status]?.color || '#6b7280' }}>
                              {(b as any).rental_item?.title || b.customer_name}
                            </div>
                          ))}
                          {dayBookings.length > 3 && <span className="text-[10px] text-slate-400 pl-1">+{dayBookings.length - 3} more</span>}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-8 pb-8 overflow-y-auto">
          <div className="fixed inset-0 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
            <div className="sticky top-0 bg-white border-b border-slate-100 rounded-t-2xl px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-slate-800">{editingItem ? 'Edit Equipment' : 'Add Rental Equipment'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-md hover:bg-slate-100"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="border-b border-slate-100 px-6 flex">
              {(['details', 'rates', 'images'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveFormTab(tab)} className={`px-4 py-3 text-sm font-medium border-b-2 capitalize ${activeFormTab === tab ? '' : 'border-transparent text-slate-400 hover:text-slate-600'}`} style={activeFormTab === tab ? { borderColor: FM.navy, color: FM.navy } : {}}>{tab}</button>
              ))}
            </div>
            <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
              {formError && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{formError}</div>}

              {activeFormTab === 'details' && (
                <div className="space-y-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Title <span className="text-red-500">*</span></label><input type="text" value={form.title} onChange={(e) => uf('title', e.target.value)} placeholder="e.g. Toro Dingo TX 1000" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Category</label><select value={form.category} onChange={(e) => uf('category', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white">{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Status</label><select value={form.status} onChange={(e) => uf('status', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"><option value="available">Available</option><option value="rented">Rented</option><option value="maintenance">Maintenance</option></select></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Manufacturer</label><select value={form.manufacturer} onChange={(e) => uf('manufacturer', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"><option value="">— None —</option>{manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Model</label><input type="text" value={form.model} onChange={(e) => uf('model', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Year</label><input type="number" value={form.year || ''} onChange={(e) => uf('year', e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Quantity Available</label><input type="number" value={form.quantity_available} onChange={(e) => uf('quantity_available', parseInt(e.target.value) || 1)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Location</label><input type="text" value={form.location} onChange={(e) => uf('location', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Min Rental Period</label><select value={form.minimum_rental_period || '1 day'} onChange={(e) => uf('minimum_rental_period', e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"><option value="1 hour">1 Hour</option><option value="4 hours">4 Hours</option><option value="1 day">1 Day</option><option value="1 week">1 Week</option></select></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label><textarea value={form.description || ''} onChange={(e) => uf('description', e.target.value)} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm resize-none" /></div>
                  <div className="flex gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={(e) => uf('featured', e.target.checked)} className="rounded border-slate-300" /><span className="text-sm text-slate-700">Featured</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.requires_training} onChange={(e) => uf('requires_training', e.target.checked)} className="rounded border-slate-300" /><span className="text-sm text-slate-700">Requires training</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.requires_license} onChange={(e) => uf('requires_license', e.target.checked)} className="rounded border-slate-300" /><span className="text-sm text-slate-700">Requires license</span></label>
                  </div>
                </div>
              )}

              {activeFormTab === 'rates' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Set rental rates for different time periods. Leave blank if not offered.</p>
                  {([['hourly_rate', 'Hourly Rate'], ['daily_rate', 'Daily Rate'], ['weekly_rate', 'Weekly Rate'], ['monthly_rate', 'Monthly Rate'], ['deposit_required', 'Security Deposit']] as [string, string][]).map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                      <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="number" value={(form as any)[key] ?? ''} onChange={(e) => uf(key, e.target.value ? parseFloat(e.target.value) : null)} placeholder="0.00" className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm" /></div>
                    </div>
                  ))}
                </div>
              )}

              {activeFormTab === 'images' && (
                <div className="space-y-4">
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-slate-300">
                    {uploading ? <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-2" /> : <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />}
                    <p className="text-sm font-medium text-slate-600">{uploading ? 'Uploading...' : 'Click to upload images'}</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  {form.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">{form.images.map((url, i) => (
                      <div key={i} className={`relative rounded-lg overflow-hidden border-2 ${form.primary_image === url ? 'border-amber-400' : 'border-transparent'}`}>
                        <img src={url} alt="" className="w-full aspect-square object-cover" />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                          <button onClick={() => uf('primary_image', url)} className="p-1.5 bg-white rounded-md"><Star className={`w-4 h-4 ${form.primary_image === url ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} /></button>
                          <button onClick={() => removeImage(url)} className="p-1.5 bg-white rounded-md"><Trash2 className="w-4 h-4 text-red-500" /></button>
                        </div>
                        {form.primary_image === url && <div className="absolute top-1 left-1 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">PRIMARY</div>}
                      </div>
                    ))}</div>
                  )}
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-white border-t border-slate-100 rounded-b-2xl px-6 py-4 flex items-center justify-between">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-50 flex items-center gap-2" style={{ background: FM.orange }}>{saving && <Loader2 className="w-4 h-4 animate-spin" />}{editingItem ? 'Update' : 'Add Equipment'}</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm mx-4">
            <h3 className="font-bold text-slate-800 mb-2">Delete Equipment?</h3>
            <p className="text-sm text-slate-500 mb-5">This will also remove any associated bookings.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* BOOKING DETAIL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-8 pb-8 overflow-y-auto">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSelectedBooking(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="p-1 hover:bg-slate-100 rounded-md"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">{(selectedBooking as any).rental_item?.title || 'Unknown Item'}</h3>
                <StatusBadge status={selectedBooking.status} map={BOOKING_STATUSES} />
              </div>
              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-slate-400" /><span className="font-medium">{selectedBooking.customer_name}</span></div>
                <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-slate-400" /><a href={`mailto:${selectedBooking.customer_email}`} className="text-blue-600">{selectedBooking.customer_email}</a></div>
                <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-slate-400" /><a href={`tel:${selectedBooking.customer_phone}`} className="text-blue-600">{selectedBooking.customer_phone}</a></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500 block">Dates</span><span className="font-medium">{fmtDate(selectedBooking.start_date)} — {fmtDate(selectedBooking.end_date)}</span></div>
                <div><span className="text-slate-500 block">Rate</span><span className="font-medium">{fmtPrice(selectedBooking.rate_amount)} / {selectedBooking.rental_period}</span></div>
                <div><span className="text-slate-500 block">Total Cost</span><span className="font-bold text-lg" style={{ color: FM.navy }}>{fmtPrice(selectedBooking.total_amount)}</span></div>
                <div><span className="text-slate-500 block">Delivery Required</span><span className="font-medium">{selectedBooking.delivery_required ? 'Yes' : 'No'}</span></div>
              </div>
              {selectedBooking.notes && <div className="text-sm"><span className="text-slate-500 block mb-1">Notes</span><p className="text-slate-700 bg-slate-50 rounded-lg p-3">{selectedBooking.notes}</p></div>}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                {selectedBooking.status === 'pending' && <>
                  <button onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')} className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">Confirm Booking</button>
                  <button onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')} className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 rounded-lg hover:bg-red-100">Cancel</button>
                </>}
                {selectedBooking.status === 'confirmed' && <button onClick={() => updateBookingStatus(selectedBooking.id, 'active')} className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700">Mark Picked Up</button>}
                {selectedBooking.status === 'active' && <button onClick={() => updateBookingStatus(selectedBooking.id, 'returned')} className="px-4 py-2 text-sm font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700">Mark Returned</button>}
                {selectedBooking.status === 'returned' && <button onClick={() => updateBookingStatus(selectedBooking.id, 'completed')} className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Complete & Close</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {importModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-8 pb-8 overflow-y-auto">
          <div className="fixed inset-0 bg-black/40" onClick={() => { if (!importing) { setImportModalOpen(false); setCsvData([]); setCsvHeaders([]); setCsvMapping({}); } }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div><h2 className="text-lg font-bold text-slate-800">Import Rental Fleet</h2><p className="text-sm text-slate-500 mt-0.5">{csvData.length} row{csvData.length !== 1 ? 's' : ''} found</p></div>
              <div className="flex items-center gap-2">
                <button onClick={downloadTemplate} className="text-xs font-medium px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-1"><Download className="w-3 h-3" />Template</button>
                {!importing && <button onClick={() => { setImportModalOpen(false); setCsvData([]); setCsvHeaders([]); setCsvMapping({}); }} className="p-1 hover:bg-slate-100 rounded-md"><X className="w-5 h-5 text-slate-400" /></button>}
              </div>
            </div>
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              {importing ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: FM.orange }} />
                  <p className="font-semibold text-slate-800 mb-1">Importing...</p>
                  <p className="text-sm text-slate-500">{importProgress.done} of {importProgress.total}</p>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-4 max-w-xs mx-auto"><div className="h-2 rounded-full transition-all" style={{ width: `${(importProgress.done / importProgress.total) * 100}%`, background: FM.orange }} /></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {CSV_FIELDS.map(field => (
                    <div key={field.key} className="flex items-center gap-3">
                      <label className="w-28 text-sm font-medium text-slate-700 flex-shrink-0">{field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}</label>
                      <select value={csvMapping[field.key] || ''} onChange={(e) => setCsvMapping(prev => ({ ...prev, [field.key]: e.target.value }))} className={`flex-1 px-3 py-2 border rounded-lg text-sm bg-white ${csvMapping[field.key] ? 'border-slate-300' : 'border-slate-200 text-slate-400'}`}>
                        <option value="">— Skip —</option>
                        {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {!importing && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <button onClick={() => { setImportModalOpen(false); setCsvData([]); }} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                <button onClick={runImport} disabled={!csvMapping.title || csvData.length === 0} className="px-6 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-40" style={{ background: FM.orange }}>Import {csvData.length} Item{csvData.length !== 1 ? 's' : ''}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
