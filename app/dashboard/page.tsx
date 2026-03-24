'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Globe, Package, Wrench, Calendar,
  Mail, Loader2, ExternalLink, TrendingUp, Users,
  Eye, Activity, Lock, User, ShoppingBag
} from 'lucide-react';

interface DashboardStats {
  totalInventory: number;
  activeRentals: number;
  pendingService: number;
  totalLeads: number;
  siteViews: number;
  uniqueVisitors: number;
}

interface Site {
  id: string;
  site_name: string;
  slug: string;
  subscription_status: string;
  addons: string[];
  created_at: string;
}

interface ActivityItem {
  id: string;
  type: 'page_view' | 'service_request' | 'lead';
  description: string;
  time: string;
}

// Simple helper — replaces hasFeature/SubscriptionTier entirely
function hasAddon(site: Site, addon: string): boolean {
  return Array.isArray(site.addons) && site.addons.includes(addon);
}

export default function DashboardPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [loading,        setLoading]        = useState(true);
  const [site,           setSite]           = useState<Site | null>(null);
  const [stats,          setStats]          = useState<DashboardStats>({
    totalInventory: 0, activeRentals: 0, pendingService: 0,
    totalLeads: 0, siteViews: 0, uniqueVisitors: 0,
  });
  const [notifications, setNotifications] = useState({ leads: 0, rentals: 0, service: 0, orders: 0 });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: userSite, error: siteError } = await supabase
        .from('sites').select('*').eq('user_id', user.id).maybeSingle();

      if (siteError || !userSite) { router.push('/onboarding'); return; }

      setSite(userSite);
      await loadStats(userSite.id);
      await loadRecentActivity(userSite.id);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats(siteId: string) {
    try {
      const [
        { count: inventoryCount },
        { count: rentalsCount },
        { count: serviceCount },
        { count: viewsCount },
        { data: viewsData },
        { count: leadsCount },
      ] = await Promise.all([
        supabase.from('inventory_items').select('*', { count: 'exact', head: true }).eq('site_id', siteId),
        supabase.from('rental_bookings').select('*', { count: 'exact', head: true }).eq('site_id', siteId).eq('status', 'active'),
        supabase.from('service_requests').select('*', { count: 'exact', head: true }).eq('site_id', siteId).eq('status', 'pending'),
        supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('site_id', siteId).gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
        supabase.from('page_views').select('ip_hash').eq('site_id', siteId).gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
        supabase.from('lead_captures').select('*', { count: 'exact', head: true }).eq('site_id', siteId),
      ]);

      const uniqueIps = new Set((viewsData || []).map((v: any) => v.ip_hash));

      setStats({
        totalInventory:  inventoryCount  || 0,
        activeRentals:   rentalsCount    || 0,
        pendingService:  serviceCount    || 0,
        totalLeads:      leadsCount      || 0,
        siteViews:       viewsCount      || 0,
        uniqueVisitors:  uniqueIps.size,
      });

      // Notification badge counts
      const [
        { count: newLeads },
        { count: pendingRentals },
        { count: pendingServiceN },
      ] = await Promise.all([
        supabase.from('lead_captures').select('*', { count: 'exact', head: true }).eq('site_id', siteId).eq('read', false),
        supabase.from('rental_bookings').select('*', { count: 'exact', head: true }).eq('site_id', siteId).eq('status', 'pending'),
        supabase.from('service_requests').select('*', { count: 'exact', head: true }).eq('site_id', siteId).eq('status', 'pending'),
      ]);
      setNotifications({
        leads:   newLeads       || 0,
        rentals: pendingRentals || 0,
        service: pendingServiceN || 0,
        orders:  0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  function timeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60)    return 'Just now';
    if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  async function loadRecentActivity(siteId: string) {
    try {
      const activities: ActivityItem[] = [];

      const [{ data: recentViews }, { data: recentService }, { data: recentLeads }] = await Promise.all([
        supabase.from('page_views').select('id, page, created_at, ip_hash').eq('site_id', siteId).order('created_at', { ascending: false }).limit(20),
        supabase.from('service_requests').select('id, customer_name, service_type, created_at').eq('site_id', siteId).order('created_at', { ascending: false }).limit(3),
        supabase.from('lead_captures').select('id, name, created_at').eq('site_id', siteId).order('created_at', { ascending: false }).limit(3),
      ]);

      const seenIps = new Set<string>();
      (recentViews || []).forEach((v: any) => {
        if (!seenIps.has(v.ip_hash) && activities.length < 3) {
          seenIps.add(v.ip_hash);
          activities.push({ id: v.id, type: 'page_view', description: `New visitor viewed ${v.page === 'index' ? 'homepage' : v.page}`, time: timeAgo(v.created_at) });
        }
      });
      (recentService || []).forEach((s: any) => {
        activities.push({ id: s.id, type: 'service_request', description: `Service request from ${s.customer_name}`, time: timeAgo(s.created_at) });
      });
      (recentLeads || []).forEach((l: any) => {
        activities.push({ id: l.id, type: 'lead', description: `New lead: ${l.name || 'Contact form submission'}`, time: timeAgo(l.created_at) });
      });

      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8472F]" />
      </div>
    );
  }

  if (!site) return null;

  // ── Addon-based stat cards ──
  const baseStatCards = [
    { label: 'Site Views',      value: stats.siteViews,      icon: Eye,      bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
    { label: 'Unique Visitors', value: stats.uniqueVisitors, icon: Users,    bg: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
    { label: 'Total Leads',     value: stats.totalLeads,     icon: Mail,     bg: 'linear-gradient(135deg, #14b8a6, #0d9488)'  },
    { label: 'Pages / Visitor', value: stats.uniqueVisitors > 0 ? parseFloat((stats.siteViews / stats.uniqueVisitors).toFixed(1)) : 0, icon: BarChart3, bg: 'linear-gradient(135deg, #22c55e, #16a34a)' },
  ];

  const addonStatCards = [
    { label: 'Total Inventory',   value: stats.totalInventory, icon: Package, bg: 'linear-gradient(135deg, #f97316, #ea580c)', addon: 'inventory' },
    { label: 'Active Rentals',    value: stats.activeRentals,  icon: Wrench,  bg: 'linear-gradient(135deg, #a855f7, #9333ea)', addon: 'rentals'   },
    { label: 'Service Requests',  value: stats.pendingService, icon: Calendar,bg: 'linear-gradient(135deg, #ef4444, #dc2626)', addon: 'service'    },
  ].filter(card => hasAddon(site, card.addon));

  // Always show Site Views, fill with addon cards, then remaining base cards up to 4
  const statCards = [baseStatCards[0], ...addonStatCards];
  let i = 1;
  while (statCards.length < 4 && i < baseStatCards.length) {
    statCards.push(baseStatCards[i++]);
  }

  // ── Quick actions — addon-gated ──
  const quickActions = [
    { title: 'Analytics',  description: 'View detailed analytics', icon: BarChart3,    href: '/dashboard/analytics', color: 'bg-blue-500',    addon: null,        badge: 0 },
    { title: 'My Website', description: 'Edit and customize',      icon: Globe,        href: '/dashboard/website',   color: 'bg-green-500',  addon: null,        badge: 0 },
    { title: 'Leads',      description: 'View contacts',           icon: Mail,         href: '/dashboard/leads',     color: 'bg-indigo-500', addon: null,        badge: notifications.leads },
    { title: 'Orders',     description: 'View purchases',          icon: ShoppingBag,  href: '/dashboard/orders',    color: 'bg-emerald-500',addon: 'inventory', badge: notifications.orders },
    { title: 'Inventory',  description: 'Manage equipment',        icon: Package,      href: '/dashboard/inventory', color: 'bg-orange-500', addon: 'inventory', badge: 0 },
    { title: 'Rentals',    description: 'Track bookings',          icon: Wrench,       href: '/dashboard/rentals',   color: 'bg-purple-500', addon: 'rentals',   badge: notifications.rentals },
    { title: 'Service',    description: 'Manage requests',         icon: Calendar,     href: '/dashboard/service',   color: 'bg-red-500',    addon: 'service',   badge: notifications.service },
  ];

  // Addon badge label
  const addonCount = (site.addons || []).length;
  const planLabel  = addonCount === 0 ? 'Base Plan' : `Base + ${addonCount} Add-on${addonCount > 1 ? 's' : ''}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/fmlogo3.jpg" alt="Fleet Market" className="h-10"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <div className="h-6 w-px bg-slate-300" />
              <span className="text-slate-600 font-medium">{site.site_name}</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Plan badge */}
              <div className="px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-full">
                {planLabel}
              </div>
              <a href={`/api/preview/${site.id}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm">
                <ExternalLink className="w-4 h-4" /> View Site
              </a>
              <button onClick={() => router.push('/account')}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                <User className="w-4 h-4" /> Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome back! 👋</h1>
          <p className="text-slate-600">Here's what's happening with your business today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-lg" style={{ background: stat.bg }}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action) => {
                  const Icon     = action.icon;
                  const isLocked = action.addon !== null && !hasAddon(site, action.addon);
                  return (
                    <button
                      key={action.title}
                      onClick={() => router.push(isLocked ? `/dashboard/upgrade?feature=${action.addon}` : action.href)}
                      className={`relative w-full p-4 rounded-lg border-2 transition-all text-left group ${
                        isLocked
                          ? 'border-slate-200 bg-slate-50 hover:border-slate-300'
                          : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <div className="relative inline-block mb-3">
                        <div className={`${action.color} w-10 h-10 rounded-lg flex items-center justify-center transition-transform ${!isLocked && 'group-hover:scale-110'} ${isLocked && 'grayscale opacity-40'}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        {!isLocked && action.badge > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                            {action.badge > 99 ? '99+' : action.badge}
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                        {action.title}
                        {isLocked && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                      <div className="text-xs text-slate-500">
                        {isLocked ? 'Add-on required' : action.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Recent Activity</h2>
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Activity className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">Activity will appear here as customers interact with your site.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((item) => {
                    const cfg = {
                      page_view:       { icon: Eye,      bg: '#dbeafe', color: '#2563eb' },
                      service_request: { icon: Wrench,   bg: '#fef3c7', color: '#d97706' },
                      lead:            { icon: Users,    bg: '#d1fae5', color: '#059669' },
                    }[item.type];
                    const ItemIcon = cfg.icon;
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cfg.bg }}>
                          <ItemIcon className="w-5 h-5" style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{item.description}</p>
                          <p className="text-xs text-slate-500">{item.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Site Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Site Name</div>
                  <div className="font-semibold text-slate-800">{site.site_name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">URL</div>
                  <div className="font-mono text-sm text-slate-600">{site.slug}.fleetmarket.us</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Plan</div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                    {planLabel}
                  </div>
                </div>
                {(site.addons || []).length > 0 && (
                  <div>
                    <div className="text-sm text-slate-500 mb-2">Active Add-ons</div>
                    <div className="flex flex-wrap gap-2">
                      {(site.addons || []).map(addon => (
                        <span key={addon} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full capitalize">
                          {addon}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-slate-500 mb-1">Created</div>
                  <div className="text-sm text-slate-600">{new Date(site.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
            </div>

            {/* Upgrade prompt if they don't have all add-ons */}
            {(site.addons || []).length < 3 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <h3 className="font-bold text-green-900 mb-2">Unlock More Features</h3>
                <p className="text-sm text-green-700 mb-4">
                  Add Inventory, Service Scheduling, or Rental Management to your plan.
                </p>
                <button
                  onClick={() => router.push('/pricing')}
                  className="w-full py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Add-ons →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
