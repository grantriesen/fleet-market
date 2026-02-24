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
  Crown
} from 'lucide-react';
import { hasFeature, getPlanById, SubscriptionTier } from '@/lib/pricing-config';
import UpgradeModal from '@/components/UpgradeModal';
import FeatureUpgradeModal from '@/components/FeatureUpgradeModal';

interface DashboardStats {
  totalInventory: number;
  activeRentals: number;
  pendingService: number;
  totalLeads: number;
  siteViews: number;
}

interface Site {
  id: string;
  site_name: string;
  slug: string;
  subscription_tier: string;
  created_at: string;
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
    siteViews: 0
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
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

      setStats({
        totalInventory: inventoryCount || 0,
        activeRentals: rentalsCount || 0,
        pendingService: serviceCount || 0,
        totalLeads: 0,
        siteViews: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
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

  const statCards = [
    { label: 'Site Views', value: stats.siteViews, icon: Eye, color: 'from-blue-500 to-blue-600', change: '+12%' },
    { label: 'Total Inventory', value: stats.totalInventory, icon: Package, color: 'from-orange-500 to-orange-600', change: '+8%' },
    { label: 'Active Rentals', value: stats.activeRentals, icon: Wrench, color: 'from-purple-500 to-purple-600', change: '+23%' },
    { label: 'Service Requests', value: stats.pendingService, icon: Calendar, color: 'from-red-500 to-red-600', change: '+5%' }
  ];

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
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
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
                <button className="text-sm text-[#E8472F] font-semibold hover:text-[#D13A24]">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">New service request received</p>
                    <p className="text-xs text-slate-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">Rental booking confirmed</p>
                    <p className="text-xs text-slate-500">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">New lead captured</p>
                    <p className="text-xs text-slate-500">3 hours ago</p>
                  </div>
                </div>
              </div>
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

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg text-white">
              <h3 className="text-lg font-bold mb-4">This Month</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Revenue</span>
                  <span className="text-xl font-bold">$0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">New Customers</span>
                  <span className="text-xl font-bold">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Conversion</span>
                  <span className="text-xl font-bold">0%</span>
                </div>
              </div>
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="w-full mt-4 px-4 py-2 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={site.subscription_tier as SubscriptionTier}
        onUpgrade={handleUpgrade}
      />

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
