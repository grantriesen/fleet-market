'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Mail, User, Phone, Calendar, Search,
  Loader2, MessageSquare, Wrench, ShoppingBag, ExternalLink,
  ChevronRight, Filter, X, CheckCircle, Clock, DollarSign, Tag
} from 'lucide-react';

type ActivityType = 'contact' | 'service' | 'inventory' | 'rental';

interface UnifiedActivity {
  id: string;
  type: ActivityType;
  title: string;
  name: string;
  email: string;
  phone: string;
  detail: string;
  amount?: number;
  status: string;
  created_at: string;
  href: string;
  read?: boolean;
}

// Maps source values to activity buckets
function sourceToType(source: string | null): ActivityType {
  if (!source) return 'contact';
  if (['quote_request', 'service', 'service_request', 'service_scheduling'].includes(source)) return 'service';
  if (['product_quote_request', 'order', 'inventory'].includes(source)) return 'inventory';
  return 'contact';
}

const TYPE_CONFIG: Record<ActivityType, { label: string; icon: any; bg: string; color: string; border: string; iconBg: string; iconColor: string; badgeBg: string }> = {
  contact:   { label: 'Contact Form',    icon: Mail,        bg: 'bg-blue-50',   color: 'text-blue-700',   border: 'border-blue-200',  iconBg: 'bg-blue-600',   iconColor: 'text-white', badgeBg: 'bg-blue-600'   },
  service:   { label: 'Service Request', icon: Calendar,    bg: 'bg-orange-50', color: 'text-orange-700', border: 'border-orange-200', iconBg: 'bg-orange-500', iconColor: 'text-white', badgeBg: 'bg-orange-500' },
  inventory: { label: 'Inventory Lead',  icon: ShoppingBag, bg: 'bg-green-50',  color: 'text-green-700',  border: 'border-green-200',  iconBg: 'bg-emerald-600',iconColor: 'text-white', badgeBg: 'bg-emerald-600'},
  rental:    { label: 'Rental Booking',  icon: Wrench,      bg: 'bg-purple-50', color: 'text-purple-700', border: 'border-purple-200', iconBg: 'bg-purple-600', iconColor: 'text-white', badgeBg: 'bg-purple-600' },
};

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  active:    'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-600',
  new:       'bg-blue-100 text-blue-700',
  read:      'bg-slate-100 text-slate-500',
};

function timeAgo(dateStr: string) {
  const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (s < 60)    return 'Just now';
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function LeadsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading]       = useState(true);
  const [site, setSite]             = useState<any>(null);
  const [items, setItems]           = useState<UnifiedActivity[]>([]);
  const [filtered, setFiltered]     = useState<UnifiedActivity[]>([]);
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<UnifiedActivity | null>(null);

  const load = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: userSite } = await supabase.from('sites').select('*').eq('user_id', user.id).single();
      if (!userSite) { router.push('/onboarding'); return; }
      setSite(userSite);
      const sid = userSite.id;

      const [
        { data: leads },
        { data: rentals },
        { data: services },
        { data: orders },
      ] = await Promise.all([
        supabase.from('lead_captures').select('*').eq('site_id', sid).order('created_at', { ascending: false }),
        supabase.from('rental_bookings').select('*').eq('site_id', sid).order('created_at', { ascending: false }),
        supabase.from('service_requests').select('*').eq('site_id', sid).order('created_at', { ascending: false }),
        supabase.from('orders').select('*').eq('site_id', sid).order('created_at', { ascending: false }),
      ]);

      const unified: UnifiedActivity[] = [
        ...(leads || []).map((l: any): UnifiedActivity => ({
          id: l.id, type: sourceToType(l.source),
          title: l.source ? l.source.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'Contact Form',
          name: l.name || 'Unknown', email: l.email || '', phone: l.phone || '',
          detail: l.message || l.source || '',
          status: l.read ? 'read' : 'new',
          created_at: l.created_at,
          href: '/dashboard/leads',
          read: l.read || false,
        })),
        ...(rentals || []).map((r: any): UnifiedActivity => ({
          id: r.id, type: 'rental',
          title: 'Rental Booking',
          name: r.customer_name || 'Unknown', email: r.customer_email || '', phone: r.customer_phone || '',
          detail: `${new Date(r.start_date).toLocaleDateString('en-US',{month:'short',day:'numeric'})} → ${new Date(r.end_date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}`,
          amount: r.total_amount,
          status: r.status || 'pending',
          created_at: r.created_at,
          href: `/dashboard/rentals?highlight=${r.id}`,
        })),
        ...(services || []).map((s: any): UnifiedActivity => ({
          id: s.id, type: 'service',
          title: 'Service Request',
          name: s.customer_name || s.name || 'Unknown', email: s.customer_email || s.email || '', phone: s.customer_phone || s.phone || '',
          detail: s.service_type || s.message || '',
          status: s.status || 'pending',
          created_at: s.created_at,
          href: `/dashboard/service?highlight=${s.id}`,
        })),
        ...(orders || []).map((o: any): UnifiedActivity => ({
          id: o.id, type: 'inventory',
          title: 'Order',
          name: o.customer_name || 'Unknown', email: o.customer_email || '', phone: o.customer_phone || '',
          detail: o.product_name || `Order #${o.id.slice(0,8)}`,
          amount: o.total_amount,
          status: o.status || 'pending',
          created_at: o.created_at,
          href: `/dashboard/orders?highlight=${o.id}`,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Apply localStorage read state for non-lead items
      const readItems = new Set(JSON.parse(localStorage.getItem('fm_read_items') || '[]'));
      const withRead = unified.map(i => ({
        ...i,
        read: i.type === 'lead' ? (i.read || false) : readItems.has(i.id),
      }));
      setItems(withRead);
      setFiltered(withRead);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Mark all lead_captures as read when this page is visited
  useEffect(() => {
    if (!site) return;
    console.log('[read] site.id =', site.id);
    supabase
      .from('lead_captures')
      .update({ read: true })
      .eq('site_id', site.id)
      .eq('read', false)
      .then(({ data, error, count }) => {
        console.log('[read] update result:', { data, error, count });
      });
  }, [site]);

  useEffect(() => {
    let f = [...items];
    if (typeFilter !== 'all') f = f.filter(i => i.type === typeFilter);
    if (search) f = f.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.email.toLowerCase().includes(search.toLowerCase()) ||
      i.detail.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
  }, [search, typeFilter, items]);

  const markRead = async (id: string, type: ActivityType) => {
    // contact/service/inventory come from lead_captures — update DB
    // rental comes from rental_bookings — track in localStorage
    if (type === 'rental') {
      const key = 'fm_read_items';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      if (!existing.includes(id)) {
        localStorage.setItem(key, JSON.stringify([...existing, id]));
      }
    } else {
      await supabase.from('lead_captures').update({ read: true }).eq('id', id);
    }
    setItems(prev => prev.map(i => i.id === id ? {
      ...i,
      read: true,
      // Preserve meaningful statuses (pending/confirmed/etc), only reset 'new'
      status: i.status === 'new' ? 'read' : i.status,
    } : i));
  };

  const markAllRead = () => {
    const key = 'fm_read_items';
    const rentalIds = items.filter(i => i.type === 'rental' && !i.read).map(i => i.id);
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([...new Set([...existing, ...rentalIds])]));
    items.filter(i => i.type !== 'rental' && !i.read).forEach(i => {
      supabase.from('lead_captures').update({ read: true }).eq('id', i.id);
    });
    setItems(prev => prev.map(i => ({ ...i, read: true })));
  };

  const counts = {
    all:       items.length,
    contact:   items.filter(i => i.type === 'contact').length,
    service:   items.filter(i => i.type === 'service').length,
    inventory: items.filter(i => i.type === 'inventory').length,
    rental:    items.filter(i => i.type === 'rental').length,
  };
  const unread = items.filter(i => !i.read).length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">Activity Feed</h1>
            <p className="text-sm text-slate-500">{counts.all} total{unread > 0 ? ` · ${unread} unread` : ''}</p>
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <CheckCircle className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(['all', 'contact', 'service', 'inventory', 'rental'] as const).map(t => {
            const cfg = t === 'all' ? null : TYPE_CONFIG[t];
            const count = counts[t];
            const active = typeFilter === t;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  active
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {cfg && <cfg.icon className="w-3.5 h-3.5" />}
                {t === 'all' ? 'All' : TYPE_CONFIG[t].label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-slate-100'}`}>
                  {count}
                </span>
              </button>
            );
          })}
          <div className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search..." className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white w-48"
              />
              {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-slate-400" /></button>}
            </div>
          </div>
        </div>

        {/* Activity list */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(item => {
              const cfg = TYPE_CONFIG[item.type];
              const Icon = cfg.icon;
              const isUnread = !item.read;
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  id={`activity-${item.id}`}
                  className={`bg-white rounded-xl border transition-all ${isUnread ? 'border-blue-200 shadow-sm' : 'border-slate-200'}`}
                >
                  <div className="p-4 flex items-start gap-4">
                    {/* Type icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${cfg.iconBg}`}>
                      <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white tracking-wide ${cfg.badgeBg}`}>
                          {cfg.label}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status] || 'bg-slate-100 text-slate-600'}`}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </span>
                        {isUnread && <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />}
                        <span className="text-xs text-slate-400 ml-auto">{timeAgo(item.created_at)}</span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-slate-800">{item.name}</span>
                        {item.amount != null && item.amount > 0 && (
                          <span className="text-sm font-medium text-green-600">${item.amount.toFixed(2)}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1 flex-wrap text-sm text-slate-500">
                        {item.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{item.email}</span>}
                        {item.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{item.phone}</span>}
                        {item.detail && <span className="truncate max-w-xs">{item.detail}</span>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">

                      <button
                        onClick={() => { setSelectedItem(item); if (isUnread) markRead(item.id, item.type); }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                      >
                        View <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      {/* ── Detail Modal ── */}
      {selectedItem && (() => {
        const cfg = TYPE_CONFIG[selectedItem.type];
        const Icon = cfg.icon;
        const statusOptions: Record<ActivityType, string[]> = {
          contact:   ['new', 'read'],
          service:   ['new', 'pending', 'confirmed', 'completed', 'cancelled'],
          inventory: ['new', 'pending', 'confirmed', 'completed', 'cancelled'],
          rental:    ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
        };
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">

              {/* Header */}
              <div className={`px-6 py-4 flex items-center gap-3 ${cfg.iconBg}`}>
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">{cfg.label}</p>
                  <p className="font-bold text-white truncate">{selectedItem.name}</p>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">

                {/* Contact */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</p>
                  {selectedItem.email && (
                    <a href={`mailto:${selectedItem.email}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors group">
                      <Mail className="w-4 h-4 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 truncate">{selectedItem.email}</span>
                    </a>
                  )}
                  {selectedItem.phone && (
                    <a href={`tel:${selectedItem.phone}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-green-50 transition-colors group">
                      <Phone className="w-4 h-4 text-slate-400 group-hover:text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-green-600">{selectedItem.phone}</span>
                    </a>
                  )}
                </div>

                {/* Details */}
                {(selectedItem.detail || (selectedItem.amount != null && selectedItem.amount > 0)) && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Details</p>
                    {selectedItem.amount != null && selectedItem.amount > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                        <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-semibold text-green-700">${selectedItem.amount.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedItem.detail && (
                      <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                        <MessageSquare className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700 leading-relaxed">{selectedItem.detail}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Meta */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Info</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                      <Tag className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400">Source</p>
                        <p className="text-sm font-medium text-slate-700">{selectedItem.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                      <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-slate-400">Received</p>
                        <p className="text-sm font-medium text-slate-700">{timeAgo(selectedItem.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</p>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions[selectedItem.type].map(s => (
                      <button
                        key={s}
                        onClick={async () => {
                          if (selectedItem.type !== 'rental') {
                            await supabase.from('lead_captures').update({ read: s !== 'new', status: s }).eq('id', selectedItem.id);
                          } else {
                            await supabase.from('rental_bookings').update({ status: s }).eq('id', selectedItem.id);
                          }
                          setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, status: s, read: s !== 'new' } : i));
                          setSelectedItem(prev => prev ? { ...prev, status: s, read: s !== 'new' } : prev);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                          selectedItem.status === s
                            ? `${cfg.iconBg} text-white`
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center gap-3">
                {!selectedItem.read && (
                  <button
                    onClick={async () => {
                      await markRead(selectedItem.id, selectedItem.type);
                      setSelectedItem(prev => prev ? { ...prev, read: true } : prev);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => setSelectedItem(null)}
                  className="ml-auto px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      </div>
    </div>
  );
}
