'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Users, Truck, DollarSign, ArrowRight, Loader2 } from 'lucide-react';

const FM = { navy: '#1E3A6E', orange: '#E85525' };

export default function ManufacturerHome() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ dealerCount: 0, shipmentsThisMonth: 0, pendingCommissions: 0 });
  const [recentDealers, setRecentDealers] = useState<any[]>([]);
  const [recentShipments, setRecentShipments] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch('/api/manufacturer/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentDealers(data.recentDealers || []);
        setRecentShipments(data.recentShipments || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const kpis = [
    { label: 'Active Dealers', value: stats.dealerCount, icon: Users, color: '#3b82f6' },
    { label: 'Shipments This Month', value: stats.shipmentsThisMonth, icon: Truck, color: '#8b5cf6' },
    { label: 'Pending Commissions', value: `$${stats.pendingCommissions.toLocaleString()}`, icon: DollarSign, color: '#059669' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your dealer network and activity</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {kpis.map(kpi => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: kpi.color + '15' }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
            </div>
            <p className="text-3xl font-bold text-slate-800">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Recent Dealers</h2>
            <a href="/manufacturer/dealers" className="text-xs font-medium flex items-center gap-1" style={{ color: FM.orange }}>View All <ArrowRight className="w-3 h-3" /></a>
          </div>
          <div className="divide-y divide-slate-50">
            {recentDealers.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Users className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No dealers tagged yet</p>
                <p className="text-xs text-slate-300 mt-1">Dealers appear here when they select your brand during signup</p>
              </div>
            ) : recentDealers.map((d: any, i: number) => (
              <a key={d.site?.id || i} href={`/manufacturer/dealers/${d.site?.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-800">{d.site?.site_name || 'Unknown Dealer'}</p>
                  <p className="text-xs text-slate-400">{d.site?.slug ? `${d.site.slug}.fleetmarket.us` : ''}</p>
                </div>
                <span className="text-xs text-slate-400">{new Date(d.tagged_at).toLocaleDateString()}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Recent Shipments</h2>
            <a href="/manufacturer/shipments" className="text-xs font-medium flex items-center gap-1" style={{ color: FM.orange }}>View All <ArrowRight className="w-3 h-3" /></a>
          </div>
          <div className="divide-y divide-slate-50">
            {recentShipments.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Truck className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No shipments yet</p>
                <p className="text-xs text-slate-300 mt-1">Create a shipment to get started</p>
              </div>
            ) : recentShipments.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{s.shipment_code}</p>
                  <p className="text-xs text-slate-400">{s.site?.site_name || 'Unknown'} · {s.item_count} items</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  s.status === 'received' ? 'bg-green-50 text-green-700' :
                  s.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                  'bg-slate-50 text-slate-500'
                }`}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
