'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Package, Wrench, Calendar, Check, Loader2, ArrowLeft, Sparkles } from 'lucide-react';

// ─── Pricing ──────────────────────────────────────────────────────────────────
const BASE_PRICE = 230;
const ADDON_PRICES: Record<number, number> = { 1: 130, 2: 215, 3: 280 };

function addonPrice(count: number) { return ADDON_PRICES[count] ?? 0; }
function totalPrice(count: number) { return BASE_PRICE + addonPrice(count); }

// ─── Addon definitions ────────────────────────────────────────────────────────
const ADDONS = [
  {
    key: 'inventory',
    featureKey: 'inventory_sync',
    icon: Package,
    label: 'Inventory Management',
    description: 'Full product catalog with search, filters, specs, and lead capture on every equipment page.',
    bullets: ['Product catalog with images & specs', 'Search & filter by category', 'Lead capture on equipment pages', 'Featured products on homepage'],
    price: 130,
  },
  {
    key: 'service',
    featureKey: 'service_scheduling',
    icon: Wrench,
    label: 'Service Scheduling',
    description: 'Let customers book service appointments online. Manage your shop schedule from your dashboard.',
    bullets: ['Online booking with time slots', 'Automated confirmations', 'Service type management', 'Queue & calendar dashboard'],
    price: 130,
  },
  {
    key: 'rentals',
    featureKey: 'rental_scheduling',
    icon: Calendar,
    label: 'Rental Management',
    description: 'Availability calendar, online reservations, Stripe-powered deposits, and fleet utilization tracking.',
    bullets: ['Equipment availability calendar', 'Online reservation system', 'Stripe deposit collection', 'Fleet utilization dashboard'],
    price: 130,
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
function UpgradePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [site, setSite]               = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<string[]>([]);
  const [checking, setChecking]       = useState(false);
  const [error, setError]             = useState('');

  // Pre-select the feature from the query param if coming from a locked feature click
  const preselectedFeature = searchParams.get('feature');

  useEffect(() => {
    loadSite();
  }, []);

  async function loadSite() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }

    const { data } = await supabase
      .from('sites')
      .select('id, site_name, addons, stripe_customer_id, stripe_subscription_id')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setSite(data);
      // Pre-select addons they already have + any preselected from URL
      const existing = data.addons || [];
      const initial = [...existing];
      if (preselectedFeature && !initial.includes(preselectedFeature)) {
        initial.push(preselectedFeature);
      }
      setSelected(initial);
    }
    setLoading(false);
  }

  function toggle(key: string) {
    // Can't deselect addons they already have (would require cancellation flow)
    if (site?.addons?.includes(key)) return;
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  // Only the newly selected addons (not already owned)
  const newAddons = selected.filter(k => !(site?.addons || []).includes(k));
  const totalSelected = selected.length;
  const monthlyTotal = totalPrice(totalSelected);
  const currentTotal = totalPrice((site?.addons || []).length);
  const additionalCost = monthlyTotal - currentTotal;

  async function handleCheckout() {
    if (newAddons.length === 0) return;
    setChecking(true);
    setError('');

    try {
      if (site.stripe_subscription_id) {
        // Existing subscriber — update subscription with proration (no double-billing)
        const res = await fetch('/api/stripe/subscription-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            site_id: site.id,
            addons:  selected,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update subscription');
        // Redirect to dashboard — addons are active immediately
        router.push('/dashboard?upgrade=success');
      } else {
        // New subscriber — go through Stripe checkout to collect payment
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            site_id:     site.id,
            addons:      selected,
            billing:     'monthly',
            success_url: `${window.location.origin}/dashboard?upgrade=success`,
            cancel_url:  `${window.location.origin}/dashboard/upgrade`,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Checkout failed');
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message);
      setChecking(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[#E8472F] font-bold text-lg tracking-tight">Fleet</span>
            <span className="text-white font-bold text-lg tracking-tight">Market</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Add Features to {site?.site_name || 'Your Site'}</h1>
          <p className="text-slate-400">Select the add-ons you want. Bundle discounts apply automatically.</p>
        </div>

        {/* Addon cards */}
        <div className="flex flex-col gap-4 mb-10">
          {ADDONS.map(addon => {
            const Icon = addon.icon;
            const owned = (site?.addons || []).includes(addon.key);
            const isSelected = selected.includes(addon.key);

            return (
              <button
                key={addon.key}
                onClick={() => toggle(addon.key)}
                disabled={owned}
                className={`text-left rounded-2xl border-2 p-6 transition-all ${
                  owned
                    ? 'border-emerald-500/50 bg-emerald-500/5 cursor-default'
                    : isSelected
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-slate-700 hover:border-slate-500 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    owned || isSelected ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-slate-800 border border-slate-700'
                  }`}>
                    <Icon className={`w-6 h-6 ${owned || isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-white">{addon.label}</h3>
                        {owned && (
                          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {!owned && (
                          <span className="text-sm font-semibold text-emerald-400">+$130/mo</span>
                        )}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          owned || isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'
                        }`}>
                          {(owned || isSelected) && <Check className="w-3 h-3 text-slate-950" />}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{addon.description}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {addon.bullets.map(b => (
                        <span key={b} className="text-xs text-slate-500 flex items-center gap-1">
                          <span className="text-emerald-500">✓</span> {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Pricing summary */}
        {newAddons.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Summary</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-300">Current plan</span>
                <span className="text-slate-400">${currentTotal}/mo</span>
              </div>
              {newAddons.map(key => {
                const addon = ADDONS.find(a => a.key === key);
                return (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-slate-300">+ {addon?.label}</span>
                    <span className="text-emerald-400">+$130/mo</span>
                  </div>
                );
              })}
              {totalSelected >= 2 && (
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Bundle discount
                  </span>
                  <span className="text-emerald-400">
                    -${(130 * totalSelected) - addonPrice(totalSelected)}/mo
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-700">
              <span className="font-semibold text-white">New monthly total</span>
              <span className="text-2xl font-bold text-white">
                ${monthlyTotal}<span className="text-sm font-normal text-slate-400">/mo</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              +${additionalCost}/mo added to your existing subscription
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={newAddons.length === 0 || checking}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-base"
        >
          {checking
            ? <><Loader2 className="w-5 h-5 animate-spin" /> Redirecting to payment...</>
            : newAddons.length === 0
            ? 'Select at least one new add-on'
            : `Add ${newAddons.length} feature${newAddons.length > 1 ? 's' : ''} — $${monthlyTotal}/mo`
          }
        </button>
        <p className="text-center text-xs text-slate-600 mt-3">
          You'll be redirected to Stripe to complete payment. No contract — cancel anytime.
        </p>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    }>
      <UpgradePageInner />
    </Suspense>
  );
}
