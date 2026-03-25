'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Mail, User, Phone, Calendar, Search,
  Loader2, MessageSquare, Wrench, ShoppingBag, ExternalLink,
  ChevronRight, Filter, X, CheckCircle
} from 'lucide-react';

type ActivityType = 'lead' | 'rental' | 'service' | 'order';

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

const TYPE_CONFIG: Record<ActivityType, { label: string; icon: any; bg: string; color: string; border: string; iconBg: string; iconColor: string; badgeBg: string }> = {
  lead:    { label: 'Lead',           icon: Mail,        bg: 'bg-blue-50',   color: 'text-blue-700',   border: 'border-blue-200', iconBg: 'bg-blue-600',   iconColor: 'text-white', badgeBg: 'bg-blue-600'   },
  rental:  { label: 'Rental Booking', icon: Wrench,      bg: 'bg-purple-50', color: 'text-purple-700', border: 'border-purple-200', iconBg: 'bg-purple-600', iconColor: 'text-white', badgeBg: 'bg-purple-600' },
  service: { label: 'Service Request',icon: Calendar,    bg: 'bg-orange-50', color: 'text-orange-700', border: 'border-orange-200', iconBg: 'bg-orange-500', iconColor: 'text-white', badgeBg: 'bg-orange-500' },
  order:   { label: 'Order',          icon: ShoppingBag, bg: 'bg-green-50',  color: 'text-green-700',  border: 'border-green-200', iconBg: 'bg-emerald-600',iconColor: 'text-white', badgeBg: 'bg-emerald-600'},
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
          id: l.id, type: 'lead',
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
          id: o.id, type: 'order',
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
    // Leads: update DB read flag. Everything else: localStorage
    if (type === 'lead') {
      await supabase.from('lead_captures').update({ read: true }).eq('id', id);
    } else {
      const key = 'fm_read_items';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      if (!existing.includes(id)) {
        localStorage.setItem(key, JSON.stringify([...existing, id]));
      }
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
    const nonLeadIds = items.filter(i => i.type !== 'lead' && !i.read).map(i => i.id);
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([...new Set([...existing, ...nonLeadIds])]));
    items.filter(i => i.type === 'lead' && !i.read).forEach(i => {
      supabase.from('lead_captures').update({ read: true }).eq('id', i.id);
    });
    setItems(prev => prev.map(i => ({ ...i, read: true })));
  };

  const counts = {
    all:     items.length,
    lead:    items.filter(i => i.type === 'lead').length,
    rental:  items.filter(i => i.type === 'rental').length,
    service: items.filter(i => i.type === 'service').length,
    order:   items.filter(i => i.type === 'order').length,
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
          {(['all', 'lead', 'rental', 'service', 'order'] as const).map(t => {
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
                      {isUnread && (
                        <button
                          onClick={() => markRead(item.id, item.type)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-800 rounded-lg whitespace-nowrap"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => router.push(item.href)}
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
      </div>
    </div>
  );
}
