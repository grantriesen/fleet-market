'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, Package, Wrench, Truck } from 'lucide-react';

const ADDONS = [
  { key: 'inventory', label: 'Inventory',         icon: Package, description: 'Full equipment listings with categories, pricing, and featured items.' },
  { key: 'service',   label: 'Service Scheduling', icon: Wrench,  description: 'Online service requests, calendar management, and queue views.'       },
  { key: 'rentals',   label: 'Rental Management',  icon: Truck,   description: 'Rental listings, availability tracking, and inquiry capture.'          },
];

const BASE_FEATURES = [
  'Dealer website (all templates)', 'Leads & contact forms',
  'Analytics dashboard',            'Custom domain',
  'Email notifications',            'Mobile responsive',
  'SSL included',                   'Unlimited form submissions',
];

const MONTHLY  = { base: 230, addon: 130, bundle2: 240, bundle3: 280 };
const ANNUAL_MO = { base: Math.round(2300/12), addon: Math.round(1430/12), bundle2: Math.round(2640/12), bundle3: Math.round(3080/12) };
const ANNUAL_YR = { base: 2300, addon: 1430, bundle2: 2640, bundle3: 3080 };

function addonMoPrice(count: number, billing: 'monthly' | 'annual') {
  const p = billing === 'annual' ? ANNUAL_MO : MONTHLY;
  if (count === 0) return 0;
  if (count === 1) return p.addon;
  if (count === 2) return p.bundle2;
  return p.bundle3;
}

function bundleDiscount(count: number, billing: 'monthly' | 'annual') {
  if (count <= 1) return 0;
  const p = billing === 'annual' ? ANNUAL_MO : MONTHLY;
  return count * p.addon - (count === 2 ? p.bundle2 : p.bundle3);
}

export default function PricingPage() {
  const router = useRouter();
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [billing,        setBilling]        = useState<'monthly' | 'annual'>('monthly');
  const [loading,        setLoading]        = useState(false);

  const toggleAddon = (key: string) =>
    setSelectedAddons(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]);

  const basePrice   = billing === 'annual' ? ANNUAL_MO.base : MONTHLY.base;
  const addonPrice  = addonMoPrice(selectedAddons.length, billing);
  const discount    = bundleDiscount(selectedAddons.length, billing);
  const totalMo     = basePrice + addonPrice;

  // Annual savings vs monthly for summary badge
  const annualSavings = billing === 'annual'
    ? (MONTHLY.base * 12 - ANNUAL_YR.base) + (
        selectedAddons.length === 0 ? 0 :
        selectedAddons.length === 1 ? MONTHLY.addon * 12 - ANNUAL_YR.addon :
        selectedAddons.length === 2 ? MONTHLY.bundle2 * 12 - ANNUAL_YR.bundle2 :
                                      MONTHLY.bundle3 * 12 - ANNUAL_YR.bundle3
      )
    : 0;

  function handleGetStarted() {
    setLoading(true);
    const addonParam = selectedAddons.length > 0 ? `&addons=${selectedAddons.join(',')}` : '';
    router.push(`/register?billing=${billing}${addonParam}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" /> Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">One plan. Add what you need.</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-8">
            Start with a fully-featured dealer website, then add inventory, service scheduling, and rental management as your business grows.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            {(['monthly', 'annual'] as const).map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
                  billing === b ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {b === 'monthly' ? 'Monthly' : (
                  <>Annual <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">Save up to $460</span></>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Configurator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Base plan */}
            <div className="bg-white rounded-2xl border-2 border-green-500 p-8">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Base Plan</h2>
                  <p className="text-gray-500 text-sm mt-1">Everything you need to get online</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">${basePrice}</p>
                  <p className="text-sm text-gray-500">/mo{billing === 'annual' ? ', billed annually' : ''}</p>
                  {billing === 'annual' && (
                    <p className="text-xs text-green-600 font-semibold mt-1">2 months free — save $460/yr</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {BASE_FEATURES.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />{f}
                  </div>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Add-ons <span className="text-gray-400 font-normal text-sm">(optional)</span>
              </h3>
              <div className="space-y-3">
                {ADDONS.map(addon => {
                  const selected = selectedAddons.includes(addon.key);
                  const Icon = addon.icon;
                  return (
                    <button key={addon.key} onClick={() => toggleAddon(addon.key)}
                      className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left ${
                        selected ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                      <div className={`p-2 rounded-lg ${selected ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Icon className={`w-5 h-5 ${selected ? 'text-green-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${selected ? 'text-green-700' : 'text-gray-900'}`}>{addon.label}</p>
                        <p className="text-sm text-gray-500">{addon.description}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selected ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}>
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedAddons.length >= 2 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <Zap className="w-4 h-4 shrink-0" />
                  Bundle discount — saving <strong>${discount}/mo</strong> vs buying separately.
                </div>
              )}
              {billing === 'annual' && selectedAddons.length > 0 && (
                <div className="mt-2 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <Zap className="w-4 h-4 shrink-0" />
                  Annual billing gives you 1 month free on add-ons.
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-1">Your plan</h3>
              <p className="text-xs text-gray-400 mb-4">{billing === 'annual' ? 'Billed annually' : 'Billed monthly'}</p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base plan</span>
                  <span className="font-medium">${basePrice}/mo</span>
                </div>
                {selectedAddons.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {selectedAddons.length === 1 ? ADDONS.find(a => a.key === selectedAddons[0])?.label : `${selectedAddons.length} add-on bundle`}
                    </span>
                    <span className="font-medium">+${addonPrice}/mo</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Bundle discount</span><span>−${discount}/mo</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">${totalMo}/mo</span>
                    {billing === 'annual' && <p className="text-xs text-gray-400">${totalMo * 12}/yr</p>}
                  </div>
                </div>
                {annualSavings > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
                    <p className="text-xs text-green-700 font-semibold">🎉 You save ${annualSavings}/yr with annual billing</p>
                  </div>
                )}
              </div>

              <button onClick={handleGetStarted} disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50">
                {loading ? 'Loading...' : 'Get Started'}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                {billing === 'annual' ? 'Billed once per year. Cancel anytime.' : 'No contracts. Cancel anytime.'}
              </p>
              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                {['Secure payment via Stripe', 'Setup in minutes', 'No hidden fees'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-gray-500">
                    <Check className="w-3 h-3 text-green-500" />{f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
