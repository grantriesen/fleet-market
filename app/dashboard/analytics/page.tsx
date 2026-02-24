'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Eye, 
  MousePointer,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Loader2
} from 'lucide-react';

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  topPages: Array<{ page: string; views: number }>;
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
  trafficSources: Array<{ source: string; visits: number }>;
  dailyViews: Array<{ date: string; views: number }>;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [site, setSite] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    uniqueVisitors: 0,
    topPages: [],
    deviceBreakdown: { desktop: 0, mobile: 0, tablet: 0 },
    trafficSources: [],
    dailyViews: []
  });
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  function getDateRange() {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return start.toISOString();
  }

  async function loadAnalytics() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: userSite } = await supabase
        .from('sites')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!userSite) {
        router.push('/onboarding');
        return;
      }

      setSite(userSite);

      const since = getDateRange();

      // Total page views
      const { data: views } = await supabase
        .from('page_views')
        .select('id, page, referrer, user_agent, ip_hash, session_id, created_at')
        .eq('site_id', userSite.id)
        .gte('created_at', since)
        .order('created_at', { ascending: false });

      const allViews = views || [];

      // Unique visitors by ip_hash
      const uniqueIps = new Set(allViews.map(v => v.ip_hash));

      // Top pages
      const pageCounts: Record<string, number> = {};
      allViews.forEach(v => {
        const p = v.page || '/';
        pageCounts[p] = (pageCounts[p] || 0) + 1;
      });
      const topPages = Object.entries(pageCounts)
        .map(([page, count]) => ({ page, views: count }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      // Device breakdown from user_agent
      let desktop = 0, mobile = 0, tablet = 0;
      allViews.forEach(v => {
        const ua = (v.user_agent || '').toLowerCase();
        if (/tablet|ipad/i.test(ua)) tablet++;
        else if (/mobile|android|iphone/i.test(ua)) mobile++;
        else desktop++;
      });
      const totalDevices = desktop + mobile + tablet || 1;

      // Traffic sources from referrer
      const sourceCounts: Record<string, number> = {};
      allViews.forEach(v => {
        let source = 'Direct';
        if (v.referrer) {
          try {
            const url = new URL(v.referrer);
            const host = url.hostname.replace('www.', '');
            if (host.includes('google')) source = 'Google';
            else if (host.includes('facebook') || host.includes('fb.')) source = 'Facebook';
            else if (host.includes('instagram')) source = 'Instagram';
            else if (host.includes('bing')) source = 'Bing';
            else if (host.includes('yahoo')) source = 'Yahoo';
            else source = host;
          } catch {
            source = 'Direct';
          }
        }
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });
      const trafficSources = Object.entries(sourceCounts)
        .map(([source, visits]) => ({ source, visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 8);

      // Daily views for sparkline
      const dailyCounts: Record<string, number> = {};
      allViews.forEach(v => {
        const date = new Date(v.created_at).toISOString().split('T')[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const dailyViews: Array<{ date: string; views: number }> = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const key = d.toISOString().split('T')[0];
        dailyViews.push({ date: key, views: dailyCounts[key] || 0 });
      }

      setAnalytics({
        totalViews: allViews.length,
        uniqueVisitors: uniqueIps.size,
        topPages,
        deviceBreakdown: {
          desktop: Math.round((desktop / totalDevices) * 100),
          mobile: Math.round((mobile / totalDevices) * 100),
          tablet: Math.round((tablet / totalDevices) * 100),
        },
        trafficSources,
        dailyViews,
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const hasData = analytics.totalViews > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-500">{site?.site_name}</p>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              {[
                { label: '7 Days', value: '7d' },
                { label: '30 Days', value: '30d' },
                { label: '90 Days', value: '90d' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    timeRange === range.value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Views</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Unique Visitors</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.uniqueVisitors.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Pages / Visitor</p>
            <p className="text-3xl font-bold text-gray-900">
              {analytics.uniqueVisitors > 0 ? (analytics.totalViews / analytics.uniqueVisitors).toFixed(1) : '0'}
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-lg">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">Top Pages</p>
            <p className="text-3xl font-bold text-gray-900">{analytics.topPages.length}</p>
          </div>
        </div>

        {!hasData ? (
          /* Empty State */
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No analytics data yet</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Page views will be tracked automatically as visitors browse your site. 
              Check back soon to see your traffic data.
            </p>
          </div>
        ) : (
          <>
            {/* Daily Views Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Daily Views</h2>
              <div className="flex items-end gap-1" style={{ height: 200 }}>
                {analytics.dailyViews.map((day, i) => {
                  const max = Math.max(...analytics.dailyViews.map(d => d.views), 1);
                  const height = (day.views / max) * 100;
                  return (
                    <div key={i} className="flex-1 group relative flex flex-col items-center justify-end" style={{ height: '100%' }}>
                      <div
                        className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors min-h-[2px]"
                        style={{ height: `${Math.max(height, 1)}%` }}
                      />
                      <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {day.date}: {day.views} views
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>{analytics.dailyViews[0]?.date}</span>
                <span>{analytics.dailyViews[analytics.dailyViews.length - 1]?.date}</span>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Pages */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Pages</h2>
                {analytics.topPages.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topPages.map((page) => {
                      const percentage = analytics.totalViews > 0 ? (page.views / analytics.totalViews) * 100 : 0;
                      return (
                        <div key={page.page}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">{page.page}</span>
                            <span className="text-sm text-gray-500">{page.views} views</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-8">No page data yet</p>
                )}
              </div>

              {/* Traffic Sources */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Traffic Sources</h2>
                {analytics.trafficSources.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.trafficSources.map((source) => {
                      const percentage = analytics.totalViews > 0 ? (source.visits / analytics.totalViews) * 100 : 0;
                      return (
                        <div key={source.source}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-700">{source.source}</span>
                            </div>
                            <span className="text-sm text-gray-500">{source.visits} visits</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm text-center py-8">No traffic source data yet</p>
                )}
              </div>
            </div>

            {/* Device Breakdown */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Device Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <Monitor className="w-8 h-8 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Desktop</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.deviceBreakdown.desktop}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Smartphone className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mobile</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.deviceBreakdown.mobile}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <Smartphone className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tablet</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.deviceBreakdown.tablet}%</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
