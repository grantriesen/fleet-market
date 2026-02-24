'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  Globe,
  Package,
  Wrench,
  Calendar,
  Mail,
  Loader2,
  ExternalLink,
  TrendingUp,
  Users,
  Eye,
  Activity,
  Crown,
  User
} from 'lucide-react';
import { hasFeature, getPlanById, SubscriptionTier } from '@/lib/pricing-config';
import FeatureUpgradeModal from '@/components/FeatureUpgradeModal';

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
  subscription_tier: string;
  created_at: string;
}

interface ActivityItem {
  id: string;
  type: 'page_view' | 'service_request' | 'lead';
  description: string;
  time: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<Site | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalInventory: 0,
    activeRentals: 0,
    pendingService: 0,
    totalLeads: 0,
    siteViews: 0,
    uniqueVisitors: 0
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<'inventory' | 'service' | 'rentals' | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: userSite, error: siteError } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (siteError || !userSite) {
        router.push('/onboarding');
        return;
      }

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
      const { count: inventoryCount } = await supabase
        .from('inventory_items')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', siteId);

      const { count: rentalsCount } = await supabase
        .from('rental_bookings')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', siteId)
        .eq('status', 'active');

      const { count: serviceCount } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', siteId)
        .eq('status', 'pending');

      // Page views in last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count: viewsCount } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', siteId)
        .gte('created_at', thirtyDaysAgo);

      // Unique visitors (distinct ip_hash) in last 30 days
      const { data: viewsData } = await supabase
        .from('page_views')
        .select('ip_hash')
        .eq('site_id', siteId)
        .gte('created_at', thirtyDaysAgo);
      const uniqueIps = new Set((viewsData || []).map(v => v.ip_hash));

      // Total leads
      const { count: leadsCount } = await supabase
        .from('lead_captures')
        .select('*', { count: 'exact', head: true })
        .eq('site_id', siteId);

      setStats({
        totalInventory: inventoryCount || 0,
        activeRentals: rentalsCount || 0,
        pendingService: serviceCount || 0,
        totalLeads: leadsCount || 0,
        siteViews: viewsCount || 0,
        uniqueVisitors: uniqueIps.size
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  function timeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  async function loadRecentActivity(siteId: string) {
    try {
      const activities: ActivityItem[] = [];

      // Recent page views (grouped by session, last 5)
      const { data: recentViews } = await supabase
        .from('page_views')
        .select('id, page, created_at, ip_hash')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Deduplicate by ip_hash to show unique visitors
      const seenIps = new Set<string>();
      (recentViews || []).forEach(v => {
        if (!seenIps.has(v.ip_hash) && activities.length < 3) {
          seenIps.add(v.ip_hash);
          activities.push({
            id: v.id,
            type: 'page_view',
            description: `New visitor viewed ${v.page === 'index' ? 'homepage' : v.page}`,
            time: timeAgo(v.created_at)
          });
        }
      });

      // Recent service requests
      const { data: recentService } = await supabase
        .from('service_requests')
        .select('id, customer_name, service_type, created_at')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(3);

      (recentService || []).forEach(s => {
        activities.push({
          id: s.id,
          type: 'service_request',
          description: `Service request from ${s.customer_name}`,
          time: timeAgo(s.created_at)
        });
      });

      // Recent leads
      const { data: recentLeads } = await supabase
        .from('lead_captures')
        .select('id, name, customer_name, created_at')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(3);

      (recentLeads || []).forEach(l => {
        activities.push({
          id: l.id,
          type: 'lead',
          description: `New lead: ${l.name || l.customer_name || 'Contact form submission'}`,
          time: timeAgo(l.created_at)
        });
      });

      // Sort all by most recent and take top 5
      activities.sort((a, b) => {
        // timeAgo strings aren't sortable, so we'll just keep insertion order
        // which is already roughly by recency per source
        return 0;
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

  if (!site) {
    return null;
  }

  const tier = site.subscription_tier as SubscriptionTier;

  // Always-visible analytics cards (4 total so we always fill the grid)
  const analyticsCards = [
    { label: 'Site Views', value: stats.siteViews, icon: Eye, bg: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
    { label: 'Unique Visitors', value: stats.uniqueVisitors, icon: Users, bg: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
    { label: 'Total Leads', value: stats.totalLeads, icon: Mail, bg: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
    { label: 'Pages / Visitor', value: stats.uniqueVisitors > 0 ? parseFloat((stats.siteViews / stats.uniqueVisitors).toFixed(1)) : 0, icon: BarChart3, bg: 'linear-gradient(135deg, #22c55e, #16a34a)' },
  ];

  // Premium feature cards — only shown if user has the feature
  const premiumCards = [
    { label: 'Total Inventory', value: stats.totalInventory, icon: Package, bg: 'linear-gradient(135deg, #f97316, #ea580c)', feature: 'inventory' as const },
    { label: 'Active Rentals', value: stats.activeRentals, icon: Wrench, bg: 'linear-gradient(135deg, #a855f7, #9333ea)', feature: 'rentals' as const },
    { label: 'Service Requests', value: stats.pendingService, icon: Calendar, bg: 'linear-gradient(135deg, #ef4444, #dc2626)', feature: 'service' as const },
  ];

  const activePremiumCards = premiumCards.filter(card => hasFeature(tier, card.feature));

  // Build final 4 cards: Site Views first, then premium features, then fill with analytics
  const statCards = [analyticsCards[0]]; // Always show Site Views
  activePremiumCards.forEach(card => statCards.push(card));
  // Fill remaining slots with analytics cards (skip Site Views which is already added)
  let analyticsIndex = 1;
  while (statCards.length < 4 && analyticsIndex < analyticsCards.length) {
    statCards.push(analyticsCards[analyticsIndex]);
    analyticsIndex++;
  }

  const quickActions = [
    { title: 'Analytics', description: 'View detailed analytics', icon: BarChart3, href: '/dashboard/analytics', color: 'bg-blue-500', feature: null },
    { title: 'My Website', description: 'Edit and customize', icon: Globe, href: '/dashboard/website', color: 'bg-green-500', feature: null },
    { title: 'Inventory', description: 'Manage equipment', icon: Package, href: '/dashboard/inventory', color: 'bg-orange-500', feature: 'inventory' as const },
    { title: 'Rentals', description: 'Track bookings', icon: Wrench, href: '/dashboard/rentals', color: 'bg-purple-500', feature: 'rentals' as const },
    { title: 'Service', description: 'Manage requests', icon: Calendar, href: '/dashboard/service', color: 'bg-red-500', feature: 'service' as const },
    { title: 'Leads', description: 'View contacts', icon: Mail, href: '/dashboard/leads', color: 'bg-indigo-500', feature: null }
  ];

  const handleUpgrade = async (newTier: SubscriptionTier, billingCycle: 'monthly' | 'annual') => {
    // TODO: Implement actual upgrade logic with payment processing
    console.log('Upgrading to:', newTier, billingCycle);
    alert(`Upgrade to ${newTier} (${billingCycle}) - Payment processing coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/fmlogo3.jpg" 
                alt="Fleet Market" 
                className="h-10"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="text-2xl font-bold hidden">
                <span className="text-[#E8472F]">Fleet</span>
                <span className="text-slate-800">Market</span>
              </div>
              <div className="h-6 w-px bg-slate-300"></div>
              <span className="text-slate-600 font-medium">{site.site_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full capitalize">
                {site.subscription_tier} Plan
              </div>
              <a
                href={`/preview/${site.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                View Site
              </a>
              <button
                onClick={() => router.push('/account')}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                <User className="w-4 h-4" />
                Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Header */}
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
          {/* Main Content - Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  const isLocked = action.feature && !hasFeature(site.subscription_tier as SubscriptionTier, action.feature);
                  const currentPlan = getPlanById(site.subscription_tier as SubscriptionTier);
                  
                  return (
                    <div key={action.title} className="relative group">
                      <button
                        onClick={() => {
                          if (!isLocked) {
                            router.push(action.href);
                          } else if (action.feature) {
                            setSelectedFeature(action.feature);
                            setShowFeatureModal(true);
                          }
                        }}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          isLocked
                            ? 'border-slate-200 bg-slate-50 opacity-60 cursor-pointer hover:opacity-80'
                            : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50'
                        }`}
                      >
                        <div className={`${action.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${!isLocked && 'group-hover:scale-110'} transition-transform ${isLocked && 'grayscale opacity-50'}`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="font-semibold text-slate-800 mb-1 flex items-center gap-2">
                          {action.title}
                          {isLocked && (
                            <Crown className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{action.description}</div>
                      </button>
                      
                      {/* Tooltip */}
                      {isLocked && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          Upgrade to access {action.title}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">Recent Activity</h2>
              </div>
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Activity className="w-10 h-10 text-slate-300 mb-3" />
                  <p className="text-sm text-slate-500">Activity will appear here as customers interact with your site.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((item) => {
                    const iconConfig = {
                      page_view: { icon: Eye, bgColor: '#dbeafe', iconColor: '#2563eb' },
                      service_request: { icon: Wrench, bgColor: '#fef3c7', iconColor: '#d97706' },
                      lead: { icon: Users, bgColor: '#d1fae5', iconColor: '#059669' },
                    }[item.type];
                    const ItemIcon = iconConfig.icon;
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconConfig.bgColor }}>
                          <ItemIcon className="w-5 h-5" style={{ color: iconConfig.iconColor }} />
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
            {/* Site Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Site Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Site Name</div>
                  <div className="font-semibold text-slate-800">{site.site_name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">URL</div>
                  <div className="font-mono text-sm text-slate-600">{site.slug}.fleetmarket.com</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Plan</div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-full capitalize shadow-sm">
                    {site.subscription_tier}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Created</div>
                  <div className="text-sm text-slate-600">{new Date(site.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Feature-Specific Upgrade Modal */}
      {selectedFeature && (
        <FeatureUpgradeModal
          isOpen={showFeatureModal}
          onClose={() => {
            setShowFeatureModal(false);
            setSelectedFeature(null);
          }}
          feature={selectedFeature}
          currentTier={site.subscription_tier as SubscriptionTier}
          onUpgrade={handleUpgrade}
        />
      )}
    </div>
  );
}
