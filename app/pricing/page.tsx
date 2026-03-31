'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Zap, Package, Wrench, Truck, ArrowRight, Menu, X } from 'lucide-react';

const ADDONS = [
  { key: 'inventory', label: 'Inventory Management', icon: Package, description: 'Full equipment catalog with search, filters, pricing, and lead capture on every product page.' },
  { key: 'service',   label: 'Service Scheduling',   icon: Wrench,  description: 'Online booking, service queue management, technician assignment, and availability control.' },
  { key: 'rentals',   label: 'Rental Management',    icon: Truck,   description: 'Live availability calendar, Stripe deposit collection, fleet tracking, and booking history.' },
];

const BASE_FEATURES = [
  'Professional dealer website',
  'All 6 templates included',
  'Real-time visual customizer',
  'Contact forms & lead capture',
  'Analytics & visitor tracking',
  'Custom domain support',
  'SSL certificate included',
  'Mobile optimized',
  'Manufacturer logo showcase',
  'Testimonials section',
  'Business hours & location',
  'Email notifications',
];

const MONTHLY   = { base: 230, addon: 130, bundle2: 215, bundle3: 280 };
const ANNUAL_MO = { base: 192, addon: 108, bundle2: 179, bundle3: 233 };
const ANNUAL_YR = { base: 2300, addon: 1300, bundle2: 2150, bundle3: 2800 };

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
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleAddon = (key: string) =>
    setSelectedAddons(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]);

  const basePrice  = billing === 'annual' ? ANNUAL_MO.base : MONTHLY.base;
  const addonsPrice = addonPrice(selectedAddons.length, billing);
  const discount   = bundleDiscount(selectedAddons.length, billing);
  const totalMo    = basePrice + addonsPrice;

  function handleGetStarted() {
    setLoading(true);
    const addonParam = selectedAddons.length > 0 ? `&addons=${selectedAddons.join(',')}` : '';
    router.push(`/register?billing=${billing}${addonParam}`);
  }

  return (
    <div className="min-h-screen bg-slate-900">

      {/* Header */}
      <header className="bg-[#2C3E7D] border-b-2 border-[#E8472F] relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <img src="/fmlogo3.jpg" alt="Fleet Market" className="h-10" onError={(e) => {
                e.currentTarget.style.display = 'none';
                (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
              }} />
              <span className="text-2xl font-bold text-white uppercase tracking-tight hidden">
                <span className="text-[#E8472F]">Fleet</span>Market
              </span>
            </a>
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="/site-builder" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Site Builder</a>
              <a href="/templates" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Templates</a>
              <a href="/features" className="text-gray-300 hover:text-white text-sm font-medium transition-colors">Additional Features</a>
              <a href="/pricing" className="text-white text-sm font-semibold border-b border-[#E8472F] pb-0.5">Pricing</a>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <a href="/auth/login" className="px-5 py-2 text-gray-300 hover:text-white font-semibold transition-colors">Sign In</a>
              <a href="/register" className="px-6 py-3 bg-[#E8472F] text-white font-bold rounded hover:bg-[#d13d25] transition-all">Get Started</a>
            </div>
            {/* Mobile hamburger */}
            <button className="md:hidden p-2 text-white hover:text-[#E8472F] transition-colors" onClick={() => setMobileOpen(p => !p)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute top-0 right-0 h-full w-72 bg-[#1a2647] border-l-2 border-[#E8472F] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700">
              <span className="text-white font-bold text-lg">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex flex-col px-6 py-8 gap-1 flex-1">
              {[
                { href: '/site-builder', label: 'Site Builder' },
                { href: '/templates', label: 'Templates' },
                { href: '/features', label: 'Additional Features' },
                { href: '/pricing', label: 'Pricing' },
                { href: '/auth/login', label: 'Sign In' },
              ].map(link => (
                <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                  className="py-3 px-4 text-gray-300 hover:text-white hover:bg-slate-700/50 rounded font-medium transition-all">
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="px-6 pb-8">
              <a href="/register" onClick={() => setMobileOpen(false)}
                className="block w-full py-4 bg-[#E8472F] text-white font-bold rounded text-center hover:bg-[#d13d25] transition-all">
                Get Started
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 pt-20 pb-16 text-center border-b-2 border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8472F]/10 border-l-4 border-[#E8472F] mb-8">
            <Zap className="w-4 h-4 text-[#E8472F]" />
            <span className="text-[#E8472F] font-bold uppercase tracking-wide text-sm">Simple, Transparent Pricing</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            One plan. Add what you need.
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Start with a fully-featured dealer website for $230/mo. Add Inventory, Service Scheduling, and Rental Management as your business grows — individually or bundled.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center bg-slate-800 border border-slate-700 rounded-lg p-1 gap-1">
            {(['monthly', 'annual'] as const).map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className={`px-6 py-2.5 rounded text-sm font-semibold transition-all flex items-center gap-2 ${
                  billing === b
                    ? 'bg-[#E8472F] text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}>
                {b === 'monthly' ? 'Monthly' : (
                  <><span>Annual</span><span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded font-bold">Save ~17%</span></>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Configurator */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Config */}
          <div className="lg:col-span-2 space-y-6">

            {/* Base plan */}
            <div className="bg-slate-800 rounded-2xl border-2 border-[#E8472F] p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Base Plan</h2>
                  <p className="text-gray-400">Everything you need to get your dealership online</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-4xl font-bold text-white">${basePrice}</div>
                  <div className="text-gray-400 text-sm">/mo{billing === 'annual' ? ', billed annually' : ''}</div>
                  {billing === 'annual' && (
                    <div className="text-[#E8472F] text-xs font-semibold mt-1">2 months free</div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BASE_FEATURES.map(f => (
                  <div key={f} className="flex items-center gap-3 text-sm text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-[#E8472F]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#E8472F]" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xl font-bold text-white">Add-Ons</h3>
                <span className="text-gray-500 text-sm font-normal">Optional — add any combination</span>
              </div>
              <div className="space-y-3">
                {ADDONS.map(addon => {
                  const selected = selectedAddons.includes(addon.key);
                  const Icon = addon.icon;
                  return (
                    <button key={addon.key} onClick={() => toggleAddon(addon.key)}
                      className={`w-full flex items-center gap-5 p-6 rounded-xl border-2 transition-all text-left ${
                        selected
                          ? 'border-[#E8472F] bg-[#E8472F]/5'
                          : 'border-slate-700 bg-slate-800 hover:border-slate-500'
                      }`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        selected ? 'bg-[#E8472F]' : 'bg-slate-700'
                      }`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-white">{addon.label}</p>
                        </div>
                        <p className="text-sm text-gray-400">{addon.description}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-bold text-gray-300">
                          +${billing === 'annual' ? ANNUAL_MO.addon : MONTHLY.addon}/mo
                        </span>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selected ? 'bg-[#E8472F] border-[#E8472F]' : 'border-slate-600'
                        }`}>
                          {selected && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bundle discount notice */}
              {selectedAddons.length >= 2 && (
                <div className="mt-4 flex items-center gap-3 bg-[#E8472F]/10 border border-[#E8472F]/30 rounded-xl px-5 py-4">
                  <Zap className="w-5 h-5 text-[#E8472F] flex-shrink-0" />
                  <p className="text-sm text-gray-300">
                    <span className="text-white font-semibold">Bundle discount applied —</span> saving <span className="text-[#E8472F] font-bold">${discount}/mo</span> vs buying add-ons separately.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 sticky top-6">
              <h3 className="font-bold text-white text-lg mb-1">Your Plan</h3>
              <p className="text-xs text-gray-500 mb-6">{billing === 'annual' ? 'Billed annually' : 'Billed monthly · No contract'}</p>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Base plan</span>
                  <span className="text-white font-medium">${basePrice}/mo</span>
                </div>
                {selectedAddons.map(key => {
                  const addon = ADDONS.find(a => a.key === key);
                  return (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-400">{addon?.label}</span>
                      <span className="text-gray-300 font-medium">+${billing === 'annual' ? ANNUAL_MO.addon : MONTHLY.addon}/mo</span>
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
              <p className="text-xs text-gray-500 text-center mt-3">
                Secure payment via Stripe · No hidden fees
              </p>

              <div className="mt-6 pt-6 border-t border-slate-700 space-y-2">
                {['No setup fees', 'Cancel anytime', 'Go live in 30 minutes'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="w-4 h-4 rounded-full bg-[#E8472F]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-[#E8472F]" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-800 border-t-2 border-slate-700 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Common questions</h2>
          <div className="space-y-6">
            {[
              { q: 'Can I add or remove add-ons after I sign up?', a: 'Yes. You can add new features from your dashboard at any time. Removing add-ons is handled through your account settings.' },
              { q: 'What happens when I cancel?', a: 'Your site stays live until the end of your billing period. After that it goes offline. You can export your data at any time.' },
              { q: 'Do I need to connect my own domain?', a: 'No — your site works instantly on a Fleet Market subdomain. Connecting your own domain is optional and takes just a few minutes.' },
              { q: 'Is Stripe required for the Rentals add-on?', a: 'Stripe Connect is required to collect deposits online. Setting it up takes about 5 minutes from inside your dashboard.' },
              { q: 'Can I switch templates after I launch?', a: 'Yes. You can change your template from the customizer at any time. Your content migrates automatically.' },
            ].map(item => (
              <div key={item.q} className="bg-slate-900 rounded-xl border border-slate-700 p-6">
                <h4 className="font-semibold text-white mb-2">{item.q}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#2C3E7D] to-[#1a2647] py-20 border-t-2 border-[#E8472F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to get started?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Build your dealer website today. No contracts, no setup fees, go live in 30 minutes.
          </p>
          <button onClick={handleGetStarted} disabled={loading}
            className="px-10 py-5 bg-[#E8472F] text-white font-bold text-lg rounded hover:bg-[#d13d25] transition-all inline-flex items-center gap-3 disabled:opacity-50">
            {loading ? 'Loading...' : <><span>Get Started</span><ArrowRight className="w-5 h-5" /></>}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <img src="/fmlogo3.jpg" alt="Fleet Market" className="h-8" onError={(e) => {
              e.currentTarget.style.display = 'none';
              (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
            }} />
            <span className="text-xl font-bold text-gray-400 hidden"><span className="text-[#E8472F]">Fleet</span>Market</span>
            <p className="text-sm text-gray-500">© 2026 FleetMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
