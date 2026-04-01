'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, Package, Wrench, Truck, ArrowRight } from 'lucide-react';
import { MarketingHeader, MarketingFooter } from '@/components/MarketingLayout';

const ADDONS = [
  { key: 'inventory', label: 'Inventory Management', icon: Package, description: 'Full equipment catalog with search, filters, pricing, and lead capture on every product page.' },
  { key: 'service',   label: 'Service Scheduling',   icon: Wrench,  description: 'Online booking, service queue management, technician assignment, and availability control.' },
  { key: 'rentals',   label: 'Rental Management',    icon: Truck,   description: 'Live availability calendar, Stripe deposit collection, fleet tracking, and booking history.' },
];

const BASE_FEATURES = [
  'Professional dealer website', 'All 6 templates included',
  'Real-time visual customizer', 'Contact forms & lead capture',
  'Analytics & visitor tracking', 'Custom domain support',
  'SSL certificate included',    'Mobile optimized',
  'Manufacturer logo showcase',  'Testimonials section',
  'Business hours & location',   'Email notifications',
];

const MONTHLY   = { base: 230, addon: 130, bundle2: 215, bundle3: 280 };
const ANNUAL_MO = { base: 192, addon: 108, bundle2: 179, bundle3: 233 };

function addonPrice(count: number, billing: 'monthly' | 'annual') {
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
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);

  const toggleAddon = (key: string) =>
    setSelectedAddons(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]);

  const basePrice   = billing === 'annual' ? ANNUAL_MO.base : MONTHLY.base;
  const addonsPrice = addonPrice(selectedAddons.length, billing);
  const discount    = bundleDiscount(selectedAddons.length, billing);
  const totalMo     = basePrice + addonsPrice;

  function handleGetStarted() {
    setLoading(true);
    const addonParam = selectedAddons.length > 0 ? `&addons=${selectedAddons.join(',')}` : '';
    router.push(`/register?billing=${billing}${addonParam}`);
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <MarketingHeader activePath="/pricing" />

      {/* ── Above-the-fold pricing section ── */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 border-b-2 border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Top bar: label + billing toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E8472F]/10 border-l-4 border-[#E8472F] mb-2">
                <Zap className="w-3.5 h-3.5 text-[#E8472F]" />
                <span className="text-[#E8472F] font-bold uppercase tracking-wide text-xs">Simple, Transparent Pricing</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Build your plan</h1>
              <p className="text-gray-400 mt-1">Base plan + optional add-ons. Bundle discounts applied automatically.</p>
            </div>
            {/* Billing toggle */}
            <div className="inline-flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1 gap-1 flex-shrink-0">
              {(['monthly', 'annual'] as const).map(b => (
                <button key={b} onClick={() => setBilling(b)}
                  className={`px-5 py-2 rounded text-sm font-semibold transition-all flex items-center gap-2 ${
                    billing === b ? 'bg-[#E8472F] text-white' : 'text-gray-400 hover:text-white'
                  }`}>
                  {b === 'monthly' ? 'Monthly' : <><span>Annual</span><span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded font-bold">Save ~17%</span></>}
                </button>
              ))}
            </div>
          </div>

          {/* Main grid: left=config, right=summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left: Base + Addons ── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Base plan — compact */}
              <div className="bg-slate-800 rounded-2xl border-2 border-[#E8472F] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Base Plan</h2>
                    <p className="text-gray-400 text-sm">Full dealer website — everything included</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-3xl font-bold text-white">${basePrice}<span className="text-base font-normal text-gray-400">/mo</span></div>
                    {billing === 'annual' && <div className="text-[#E8472F] text-xs font-semibold">2 months free</div>}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                  {BASE_FEATURES.map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-gray-400">
                      <Check className="w-3 h-3 text-[#E8472F] flex-shrink-0" />{f}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-white">Add-Ons <span className="text-gray-500 text-sm font-normal">— optional</span></h3>
                  <span className="text-xs text-gray-500">Bundle 2+ and save</span>
                </div>
                {ADDONS.map(addon => {
                  const selected = selectedAddons.includes(addon.key);
                  const Icon = addon.icon;
                  return (
                    <button key={addon.key} onClick={() => toggleAddon(addon.key)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        selected ? 'border-[#E8472F] bg-[#E8472F]/5' : 'border-slate-700 bg-slate-800 hover:border-slate-500'
                      }`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? 'bg-[#E8472F]' : 'bg-slate-700'}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm">{addon.label}</p>
                        <p className="text-xs text-gray-400 truncate">{addon.description}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-bold text-gray-300">+${billing === 'annual' ? ANNUAL_MO.addon : MONTHLY.addon}/mo</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected ? 'bg-[#E8472F] border-[#E8472F]' : 'border-slate-600'}`}>
                          {selected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
                {selectedAddons.length >= 2 && (
                  <div className="flex items-center gap-3 bg-[#E8472F]/10 border border-[#E8472F]/30 rounded-xl px-4 py-3">
                    <Zap className="w-4 h-4 text-[#E8472F] flex-shrink-0" />
                    <p className="text-sm text-gray-300">
                      <span className="text-white font-semibold">Bundle discount applied —</span> saving <span className="text-[#E8472F] font-bold">${discount}/mo</span> vs individual pricing.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Summary ── */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 sticky top-6">
                <h3 className="font-bold text-white text-lg mb-1">Your Plan</h3>
                <p className="text-xs text-gray-500 mb-5">{billing === 'annual' ? 'Billed annually' : 'Billed monthly · No contract'}</p>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Base plan</span>
                    <span className="text-white font-medium">${basePrice}/mo</span>
                  </div>
                  {selectedAddons.length === 0 && (
                    <div className="text-xs text-gray-600 italic">No add-ons selected</div>
                  )}
                  {selectedAddons.map(key => {
                    const addon = ADDONS.find(a => a.key === key);
                    return (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-400">{addon?.label}</span>
                        <span className="text-gray-300">+${billing === 'annual' ? ANNUAL_MO.addon : MONTHLY.addon}/mo</span>
                      </div>
                    );
                  })}
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-[#E8472F]">
                      <span>Bundle discount</span>
                      <span className="font-semibold">−${discount}/mo</span>
                    </div>
                  )}
                  <div className="border-t border-slate-700 pt-4 flex justify-between items-end">
                    <span className="font-bold text-white">Total</span>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-white">${totalMo}<span className="text-base font-normal text-gray-400">/mo</span></div>
                      {billing === 'annual' && <div className="text-xs text-gray-500">${totalMo * 12}/yr</div>}
                    </div>
                  </div>
                </div>

                <button onClick={handleGetStarted} disabled={loading}
                  className="w-full py-4 bg-[#E8472F] text-white font-bold rounded-lg hover:bg-[#d13d25] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base">
                  {loading ? 'Loading...' : <><span>Get Started</span><ArrowRight className="w-4 h-4" /></>}
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">Secure payment via Stripe · No hidden fees</p>

                <div className="mt-5 pt-5 border-t border-slate-700 space-y-2">
                  {['No setup fees', 'Cancel anytime', 'Go live in 30 minutes'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-gray-400">
                      <Check className="w-3 h-3 text-[#E8472F] flex-shrink-0" />{f}
                    </div>
                  ))}
                </div>

                {/* Quick reference */}
                <div className="mt-5 pt-5 border-t border-slate-700">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Add-on pricing</p>
                  <div className="space-y-1.5 text-xs text-gray-400">
                    <div className="flex justify-between"><span>1 add-on</span><span className="text-gray-300">+${billing === 'annual' ? ANNUAL_MO.addon : MONTHLY.addon}/mo</span></div>
                    <div className="flex justify-between"><span>2 add-ons (bundle)</span><span className="text-gray-300">+${billing === 'annual' ? ANNUAL_MO.bundle2 : MONTHLY.bundle2}/mo</span></div>
                    <div className="flex justify-between"><span>3 add-ons (bundle)</span><span className="text-gray-300">+${billing === 'annual' ? ANNUAL_MO.bundle3 : MONTHLY.bundle3}/mo</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-800 border-t-2 border-slate-700 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Common questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I add or remove add-ons after I sign up?', a: 'Yes. You can add new features from your dashboard at any time. Removing add-ons is handled through your account settings.' },
              { q: 'What happens when I cancel?', a: 'Your site stays live until the end of your billing period. After that it goes offline. You can export your data at any time.' },
              { q: 'Do I need to connect my own domain?', a: 'No — your site works instantly on a Fleet Market subdomain. Connecting your own domain is optional and takes just a few minutes.' },
              { q: 'Is Stripe required for the Rentals add-on?', a: 'Stripe Connect is required to collect deposits online. Setting it up takes about 5 minutes from inside your dashboard.' },
              { q: 'Can I switch templates after I launch?', a: 'Yes. You can change your template from the customizer at any time. Your content migrates automatically.' },
            ].map(item => (
              <div key={item.q} className="bg-slate-900 rounded-xl border border-slate-700 p-5">
                <h4 className="font-semibold text-white mb-2">{item.q}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#2C3E7D] to-[#1a2647] py-16 border-t-2 border-[#E8472F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Build your dealer website today. No contracts, no setup fees, go live in 30 minutes.
          </p>
          <button onClick={handleGetStarted} disabled={loading}
            className="px-10 py-4 bg-[#E8472F] text-white font-bold text-lg rounded hover:bg-[#d13d25] transition-all inline-flex items-center gap-3 disabled:opacity-50">
            {loading ? 'Loading...' : <><span>Get Started</span><ArrowRight className="w-5 h-5" /></>}
          </button>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
