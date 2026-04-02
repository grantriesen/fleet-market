'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Users, Truck, Tag,
  DollarSign, Link2, Settings, LogOut, ChevronLeft, Menu, X
} from 'lucide-react';

const FM = { navy: '#1E3A6E', navyDark: '#152C54', orange: '#E85525', orangeGlow: 'rgba(232,85,37,0.1)' };

const NAV_ITEMS = [
  { href: '/manufacturer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/manufacturer/catalog', label: 'Product Catalog', icon: Package },
  { href: '/manufacturer/dealers', label: 'Dealers', icon: Users },
  { href: '/manufacturer/shipments', label: 'Shipments', icon: Truck },
  { href: '/manufacturer/promos', label: 'Promotions', icon: Tag },
  { href: '/manufacturer/commissions', label: 'Commissions', icon: DollarSign },
  { href: '/manufacturer/settings', label: 'Settings & Links', icon: Settings },
];

interface ManufacturerContext {
  user: any;
  partner: any;
  membership: any;
}

export default function ManufacturerLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [ctx, setCtx] = useState<ManufacturerContext | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Skip auth check for login and register pages
  const isAuthPage = pathname === '/manufacturer/login' || pathname === '/manufacturer/register';

  useEffect(() => {
    if (isAuthPage) { setLoading(false); return; }

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      // Check if user is a manufacturer team member (server-side to bypass RLS)
      const verifyRes = await fetch('/api/manufacturer/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      });

      if (!verifyRes.ok) {
        // Not a manufacturer user — redirect to dealer dashboard
        router.push('/dashboard');
        return;
      }

      const verifyData = await verifyRes.json();
      const membership = verifyData.membership;

      setCtx({
        user,
        partner: membership.partner,
        membership: { id: membership.id, role: membership.role, full_name: membership.full_name || '', territory: membership.territory || '' },
      });
      setLoading(false);
    }
    init();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-slate-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3" style={{ borderTopColor: FM.orange }} />
          <p className="text-sm text-slate-500">Loading manufacturer dashboard...</p>
        </div>
      </div>
    );
  }

  // Auth pages (login/register) render without the dashboard shell
  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!ctx) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo / Brand */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ background: FM.orange }}>FM</div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{ctx.partner.name}</p>
              <p className="text-xs text-slate-400">Manufacturer Portal</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || (item.href !== '/manufacturer' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                style={isActive ? { background: FM.navy } : {}}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: FM.navy }}>
              {(ctx.membership.full_name || ctx.user.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">{ctx.membership.full_name || ctx.user.email}</p>
              <p className="text-xs text-slate-400 capitalize">{ctx.membership.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 mt-1 w-full text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center justify-between">
          <button
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="hidden sm:inline">{ctx.partner.name}</span>
            {ctx.membership.territory && (
              <>
                <span className="text-slate-300">·</span>
                <span>{ctx.membership.territory}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
              <ChevronLeft className="w-3 h-3" /> Dealer View
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
