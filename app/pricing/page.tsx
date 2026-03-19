'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, Package, Wrench, Truck } from 'lucide-react';

const ADDONS = [
  { key: 'inventory', label: 'Inventory', icon: Package, description: 'Full equipment listings with categories, pricing, and featured items.' },
  { key: 'service',   label: 'Service Scheduling', icon: Wrench, description: 'Online service requests, calendar management, and queue views.' },
  { key: 'rentals',  label: 'Rental Management', icon: Truck, description: 'Rental listings, availability tracking, and inquiry capture.' },
];

const BASE_FEATURES = [
  'Dealer website (all templates)',
  'Leads & contact forms',
  'Analytics dashboard',
  'Custom domain',
  'Email notifications',
  'Mobile responsive',
  'SSL included',
  'Unlimited form submissions',
];

function getAddonPrice(count: number): number {
  if (count === 0) return 0;
  if (count === 1) return 130;
  if (count === 2) return 240;
  return 280;
}

function getSavings(count: number): number {
  if (count <= 1) return 0;
  return count * 130 - getAddonPrice(count);
}

export default function PricingPage() {
  const router = useRouter();
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function toggleAddon(key: string) {
    setSelectedAddons(prev =>
      prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]
    );
  }

  const addonPrice = getAddonPrice(selectedAddons.length);
  const savings = getSavings(selectedAddons.length);
  const total = 230 + addonPrice;

  async function handleGetStarted() {
    setLoading(true);
    // Redirect to register/onboarding — checkout happens after account creation
    router.push(`/register?addons=${selectedAddons.join(',')}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            One plan. Add what you need.
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Start with a fully-featured dealer website, then add inventory, service scheduling, and rental management as your business grows.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Configurator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Base plan */}
            <div className="bg-white rounded-2xl border-2 border-green-500 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Base Plan</h2>
                  <p className="text-gray-500 text-sm mt-1">Everything you need to get online</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">$230</p>
                  <p className="text-sm text-gray-500">/month</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BASE_FEATURES.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
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
                    <button
                      key={addon.key}
                      onClick={() => toggleAddon(addon.key)}
                      className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left ${
                        selected
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selected ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Icon className={`w-5 h-5 ${selected ? 'text-green-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold ${selected ? 'text-green-700' : 'text-gray-900'}`}>
                          {addon.label}
                        </p>
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
                <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                  <Zap className="w-4 h-4 shrink-0" />
                  Bundle discount applied — you're saving <strong>${savings}/mo</strong> vs buying separately.
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">Your plan</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base plan</span>
                  <span className="font-medium">$230/mo</span>
                </div>

                {selectedAddons.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {selectedAddons.length === 1
                        ? ADDONS.find(a => a.key === selectedAddons[0])?.label
                        : `${selectedAddons.length} add-on bundle`}
                    </span>
                    <span className="font-medium">+${addonPrice}/mo</span>
                  </div>
                )}

                {savings > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Bundle savings</span>
                    <span>−${savings}/mo</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">${total}/mo</span>
                </div>
              </div>

              <button
                onClick={handleGetStarted}
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Get Started'}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                No contracts. Cancel anytime.
              </p>

              <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                {[
                  'Secure payment via Stripe',
                  'Setup in minutes',
                  'No hidden fees',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-gray-500">
                    <Check className="w-3 h-3 text-green-500" />
                    {f}
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
