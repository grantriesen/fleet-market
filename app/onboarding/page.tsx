'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { getReferralCode, clearReferralCode } from '@/lib/referral';
import ReferralBanner from '@/components/ReferralBanner';
import {
  ChevronRight, ChevronLeft, Check, Loader2, Package,
  Wrench, Calendar, CreditCard, Sparkles, ArrowRight,
  Monitor, ShieldCheck, X
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
type TemplateSlug =
  | 'green-valley-industrial'
  | 'corporate-edge'
  | 'zenith-lawn'
  | 'modern-lawn-solutions'
  | 'warm-earth-designs'
  | 'vibe-dynamics';

interface Template {
  slug: TemplateSlug;
  name: string;
  tagline: string;
  vibe: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
  badgeColor: string;
}

// ─── Template Definitions ──────────────────────────────────────────────────────
const TEMPLATES: Template[] = [
  {
    slug: 'green-valley-industrial',
    name: 'Green Valley Industrial',
    tagline: 'Bold. Rugged. Built for dealers who mean business.',
    vibe: 'Industrial / No-nonsense',
    accentColor: '#4ade80',
    bgColor: '#0f1a0f',
    textColor: '#bbf7d0',
    badgeColor: '#166534',
  },
  {
    slug: 'corporate-edge',
    name: 'Corporate Edge',
    tagline: 'Stats-driven design for enterprise-grade dealerships.',
    vibe: 'B2B Professional',
    accentColor: '#60a5fa',
    bgColor: '#0f172a',
    textColor: '#bfdbfe',
    badgeColor: '#1e3a5f',
  },
  {
    slug: 'zenith-lawn',
    name: 'Zenith Lawn',
    tagline: 'Refined minimalism for the premium dealer.',
    vibe: 'Luxury / Minimal',
    accentColor: '#a3e635',
    bgColor: '#0a0f07',
    textColor: '#d9f99d',
    badgeColor: '#1a2e05',
  },
  {
    slug: 'modern-lawn-solutions',
    name: 'Modern Lawn Solutions',
    tagline: 'Clean and approachable for everyday dealers.',
    vibe: 'Clean & Friendly',
    accentColor: '#34d399',
    bgColor: '#022c22',
    textColor: '#a7f3d0',
    badgeColor: '#064e3b',
  },
  {
    slug: 'warm-earth-designs',
    name: 'Warm Earth Designs',
    tagline: 'Community-first design for neighborhood dealers.',
    vibe: 'Warm & Local',
    accentColor: '#fb923c',
    bgColor: '#1c0f07',
    textColor: '#fed7aa',
    badgeColor: '#431407',
  },
  {
    slug: 'vibe-dynamics',
    name: 'Vibe Dynamics',
    tagline: 'HIGH ENERGY. Built to convert. Zero apologies.',
    vibe: 'Bold / High Energy',
    accentColor: '#f472b6',
    bgColor: '#0f0014',
    textColor: '#f5d0fe',
    badgeColor: '#3b0764',
  },
];

// ─── Pricing ───────────────────────────────────────────────────────────────────
const BASE_PRICE = 230;
const ADDON_PRICES: Record<number, number> = { 1: 130, 2: 215, 3: 280 };

function calcAddonPrice(count: number): number {
  return ADDON_PRICES[count] ?? 0;
}

function calcTotal(addonCount: number): number {
  return BASE_PRICE + calcAddonPrice(addonCount);
}

// ─── Steps ─────────────────────────────────────────────────────────────────────
type Step = 'template' | 'inventory' | 'service' | 'rentals' | 'payment' | 'creating';

const STEP_ORDER: Step[] = ['template', 'inventory', 'service', 'rentals', 'payment', 'creating'];

// ─── Main Component ────────────────────────────────────────────────────────────
function OnboardingPreflightInner() {
  const router       = useRouter();
  const searchParams  = useSearchParams();
  const supabase      = createClient();

  const addonsParam  = searchParams.get('addons') || '';
  const preselected  = addonsParam ? addonsParam.split(',').filter(Boolean) : [];
  const refParam     = searchParams.get('ref') || getReferralCode() || '';

  const [step, setStep]                     = useState<Step>('template');
  const [selectedTemplate, setTemplate]     = useState<TemplateSlug | null>(null);
  const [hasInventory, setHasInventory]     = useState<boolean | null>(preselected.includes('inventory') ? true : null);
  const [hasService, setHasService]         = useState<boolean | null>(preselected.includes('service')   ? true : null);
  const [hasRentals, setHasRentals]         = useState<boolean | null>(preselected.includes('rentals')   ? true : null);
  const [creating, setCreating]             = useState(false);
  const [error, setError]                   = useState('');
  const [userId, setUserId]                 = useState<string | null>(null);

  // Grab user on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return; }
      setUserId(data.user.id);
    });
  }, []);

  const selectedAddons = [
    hasInventory && 'inventory',
    hasService   && 'service',
    hasRentals   && 'rentals',
  ].filter(Boolean) as string[];

  const addonCount  = selectedAddons.length;
  const addonPrice  = calcAddonPrice(addonCount);
  const totalPrice  = calcTotal(addonCount);

  // ─── Navigation ────────────────────────────────────────────────────────────
  function canAdvance(): boolean {
    switch (step) {
      case 'template':   return selectedTemplate !== null;
      case 'inventory':  return hasInventory !== null;
      case 'service':    return hasService !== null;
      case 'rentals':    return hasRentals !== null;
      case 'payment':    return true;
      default:           return false;
    }
  }

  const skippedSteps = new Set<Step>([
    ...(preselected.includes('inventory') ? ['inventory' as Step] : []),
    ...(preselected.includes('service')   ? ['service'   as Step] : []),
    ...(preselected.includes('rentals')   ? ['rentals'   as Step] : []),
  ]);

  function advance() {
    let idx = STEP_ORDER.indexOf(step);
    do { idx++; } while (idx < STEP_ORDER.length - 1 && skippedSteps.has(STEP_ORDER[idx]));
    if (idx < STEP_ORDER.length) setStep(STEP_ORDER[idx]);
  }

  function back() {
    let idx = STEP_ORDER.indexOf(step);
    do { idx--; } while (idx > 0 && skippedSteps.has(STEP_ORDER[idx]));
    if (idx >= 0) setStep(STEP_ORDER[idx]);
  }

  // ─── Site Creation ─────────────────────────────────────────────────────────
  async function handleCreateSite() {
    if (!selectedTemplate || !userId) return;
    setCreating(true);
    setError('');

    try {
      // 1. Look up template_id
      const { data: templateData, error: tErr } = await supabase
        .from('templates')
        .select('id')
        .eq('slug', selectedTemplate)
        .single();

      if (tErr || !templateData) throw new Error('Template not found. Please contact support.');

      // 2. Check for existing pending site — reuse to avoid duplicate key violation
      const { data: existingSite } = await supabase
        .from('sites')
        .select('id')
        .eq('user_id', userId)
        .eq('subscription_status', 'pending')
        .maybeSingle();

      let siteId: string;

      if (existingSite) {
        // Reuse and update template/addons
        siteId = existingSite.id;
        await supabase.from('sites').update({
          template_id: templateData.id,
          addons:      selectedAddons,
        }).eq('id', siteId);
      } else {
        // 3. Create the site record
        const timestamp = Date.now().toString(36);
        const siteSlug  = `dealer-${timestamp}`;

        const { data: siteData, error: siteErr } = await supabase
          .from('sites')
          .insert({
            user_id:     userId,
            template_id: templateData.id,
            slug:        siteSlug,
            site_name:   'My Dealership',
            addons:      selectedAddons,
            onboarded:   false,
            subscription_status: 'pending',
          })
          .select('id')
          .single();

        if (siteErr || !siteData) throw new Error(siteErr?.message || 'Failed to create site.');
        siteId = siteData.id;
      }


      // 2. Apply referral code if present
      if (refParam) {
        try {
          await fetch('/api/partner/apply-referral', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              siteId,
              referralCode: refParam,
              billingInterval: 'monthly',
            }),
          });
          clearReferralCode();
        } catch (refErr) {
          console.warn('Referral apply failed (non-blocking):', refErr);
        }
      }

      // 3. Redirect to Stripe checkout — site activates via webhook on success
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site_id: siteId,
          addons:  selectedAddons,
          billing: 'monthly',
          success_url: `${window.location.origin}/onboarding/${siteId}`,
          cancel_url:  `${window.location.origin}/onboarding?addons=${selectedAddons.join(',')}`,
        }),
      });

      const checkoutData = await res.json();
      if (!res.ok) throw new Error(checkoutData.error || 'Failed to create checkout session');

      window.location.href = checkoutData.url;

    } catch (err: any) {
      console.error('Site creation error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setCreating(false);
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  if (step === 'creating') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Setting Up Your Account</h2>
          <p className="text-slate-400">Creating your site and configuring your add-ons…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <ReferralBanner />
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#E8472F] font-bold text-lg tracking-tight">Fleet</span>
            <span className="text-white font-bold text-lg tracking-tight">Market</span>
          </div>
          <StepIndicator current={step} />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        {step === 'template'  && <TemplateStep selected={selectedTemplate} onSelect={setTemplate} />}
        {step === 'inventory' && <AddonStep
          icon={Package}
          title="Do you have inventory you'd like to sell on your site?"
          description="The Inventory add-on gives you a full product catalog with search, filters, specs, and lead capture — all synced to your dealership."
          yesLabel="Yes, I want to list and sell inventory online"
          noLabel="No, I don't need inventory right now"
          value={hasInventory}
          onChange={setHasInventory}
          price={130}
          currentAddons={selectedAddons}
        />}
        {step === 'service'   && <AddonStep
          icon={Wrench}
          title="Do you offer equipment service and repairs?"
          description="The Service add-on lets customers book appointments online, and gives you a queue to manage your shop schedule and assign technicians."
          yesLabel="Yes, I want online service scheduling"
          noLabel="No, I don't need service scheduling"
          value={hasService}
          onChange={setHasService}
          price={130}
          currentAddons={selectedAddons}
        />}
        {step === 'rentals'   && <AddonStep
          icon={Calendar}
          title="Do you rent out equipment?"
          description="The Rentals add-on gives you an availability calendar, online reservation system, Stripe-powered deposits, and a fleet utilization dashboard."
          yesLabel="Yes, I want to manage rentals online"
          noLabel="No, I don't rent out equipment"
          value={hasRentals}
          onChange={setHasRentals}
          price={130}
          currentAddons={selectedAddons}
        />}
        {step === 'payment'   && <PaymentStep
          selectedTemplate={selectedTemplate!}
          selectedAddons={selectedAddons}
          addonPrice={addonPrice}
          totalPrice={totalPrice}
          onPay={() => handleCreateSite()}
          error={error}
          creating={creating}
        />}
      </div>

      {/* Footer Nav — not shown on payment (it has its own CTA) */}
      {step !== 'payment' && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950/90 backdrop-blur">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={back}
              disabled={step === 'template'}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white disabled:opacity-0 transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={advance}
              disabled={!canAdvance()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step Indicator ────────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: 'template',  label: 'Template' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'service',   label: 'Service' },
    { id: 'rentals',   label: 'Rentals' },
    { id: 'payment',   label: 'Payment' },
  ];
  const currentIdx = STEP_ORDER.indexOf(current);

  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => {
        const stepIdx = STEP_ORDER.indexOf(s.id);
        const done    = stepIdx < currentIdx;
        const active  = s.id === current;
        return (
          <div key={s.id} className="flex items-center gap-1">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
              done   ? 'text-emerald-500' : 'text-slate-600'
            }`}>
              {done
                ? <Check className="w-3 h-3" />
                : <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${active ? 'border-emerald-500 text-emerald-400' : 'border-slate-700 text-slate-600'}`}>{i + 1}</span>
              }
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`w-4 h-px ${stepIdx < currentIdx ? 'bg-emerald-500/40' : 'bg-slate-800'}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Template Step ─────────────────────────────────────────────────────────────
function TemplateStep({ selected, onSelect }: { selected: TemplateSlug | null; onSelect: (s: TemplateSlug) => void }) {
  return (
    <div className="pb-24">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">Choose your template</h1>
        <p className="text-slate-400 text-lg">Pick the look and feel that best fits your dealership. You can customize colors, content, and branding after setup.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map(t => (
          <button
            key={t.slug}
            onClick={() => onSelect(t.slug)}
            className={`relative text-left rounded-2xl border-2 overflow-hidden transition-all group ${
              selected === t.slug
                ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                : 'border-slate-800 hover:border-slate-600'
            }`}
          >
            {/* Thumbnail */}
            <div className="w-full h-44 relative overflow-hidden bg-slate-800">
              <img
                src={`/templates/${t.slug}.jpg`}
                alt={t.name}
                className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
              {/* Fallback if screenshot not yet uploaded */}
              <div
                className="hidden absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: t.bgColor }}
              >
                <Monitor className="w-8 h-8" style={{ color: t.accentColor }} />
              </div>
            </div>

            {/* Info */}
            <div className="p-4 bg-slate-900">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-white text-sm leading-tight">{t.name}</h3>
                {selected === t.slug && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-slate-950" />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-2">{t.vibe}</p>
              <p className="text-xs text-slate-400 leading-relaxed">{t.tagline}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Add-on Step ───────────────────────────────────────────────────────────────
function AddonStep({
  icon: Icon, title, description, yesLabel, noLabel, value, onChange, price, currentAddons,
}: {
  icon: any; title: string; description: string;
  yesLabel: string; noLabel: string;
  value: boolean | null; onChange: (v: boolean) => void;
  price: number; currentAddons: string[];
}) {
  const countAfterYes = currentAddons.length + (value === true ? 0 : 1);
  const bundleMsg =
    countAfterYes === 2 ? 'Bundle discount applied — 2 add-ons for $215/mo instead of $260' :
    countAfterYes === 3 ? 'Best value — all 3 add-ons for $280/mo instead of $390' : null;

  return (
    <div className="pb-24 max-w-2xl">
      <div className="mb-10">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
          <Icon className="w-6 h-6 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>
        <p className="text-slate-400 leading-relaxed">{description}</p>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <button
          onClick={() => onChange(true)}
          className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all ${
            value === true
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-slate-700 hover:border-slate-500 hover:bg-slate-900'
          }`}
        >
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${value === true ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'}`}>
            {value === true && <div className="w-2 h-2 bg-white rounded-full" />}
          </div>
          <div className="flex-1">
            <p className="font-medium text-white text-sm">{yesLabel}</p>
          </div>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            +${price}/mo
          </span>
        </button>

        <button
          onClick={() => onChange(false)}
          className={`flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all ${
            value === false
              ? 'border-slate-500 bg-slate-800/50'
              : 'border-slate-700 hover:border-slate-500 hover:bg-slate-900'
          }`}
        >
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${value === false ? 'border-slate-400 bg-slate-400' : 'border-slate-600'}`}>
            {value === false && <X className="w-2.5 h-2.5 text-slate-950" />}
          </div>
          <p className="font-medium text-slate-300 text-sm">{noLabel}</p>
        </button>
      </div>

      {/* Bundle nudge */}
      {value === true && bundleMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-300">{bundleMsg}</p>
        </div>
      )}
    </div>
  );
}

// ─── Payment Step ──────────────────────────────────────────────────────────────
function PaymentStep({
  selectedTemplate, selectedAddons, addonPrice, totalPrice,
  onPay, error, creating,
}: {
  selectedTemplate: TemplateSlug;
  selectedAddons: string[];
  addonPrice: number;
  totalPrice: number;
  onPay: () => void;
  error: string;
  creating: boolean;
}) {
  const template = TEMPLATES.find(t => t.slug === selectedTemplate);
  const addonLabels: Record<string, string> = {
    inventory: 'Inventory Management',
    service:   'Service Scheduling',
    rentals:   'Rental Management',
  };
  const bundleLabel =
    selectedAddons.length === 3 ? 'All 3 Add-ons Bundle' :
    selectedAddons.length === 2 ? '2 Add-on Bundle' : null;

  return (
    <div className="pb-12 max-w-2xl">
      <div className="mb-10">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
          <CreditCard className="w-6 h-6 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Review your plan</h1>
        <p className="text-slate-400">Here's what you've selected. You can add or remove features anytime from your dashboard.</p>
      </div>

      {/* Order summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Order Summary</h3>

        <div className="space-y-3 mb-5">
          {/* Template */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: template?.bgColor }}>
                <Monitor className="w-4 h-4" style={{ color: template?.accentColor }} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{template?.name}</p>
                <p className="text-xs text-slate-500">Dealer website — all pages included</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-white">${BASE_PRICE}/mo</span>
          </div>

          {/* Add-ons */}
          {selectedAddons.length > 0 && (
            <div className="pt-3 border-t border-slate-800">
              {bundleLabel ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-300">{bundleLabel}</p>
                    <p className="text-xs text-slate-500">{selectedAddons.map(a => addonLabels[a]).join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-400">+${addonPrice}/mo</p>
                    {selectedAddons.length === 2 && <p className="text-xs text-slate-500 line-through">$260/mo</p>}
                    {selectedAddons.length === 3 && <p className="text-xs text-slate-500 line-through">$390/mo</p>}
                  </div>
                </div>
              ) : (
                selectedAddons.map(a => (
                  <div key={a} className="flex items-center justify-between py-1">
                    <p className="text-sm text-slate-300">{addonLabels[a]}</p>
                    <span className="text-sm text-white">+$130/mo</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <span className="font-semibold text-white">Monthly Total</span>
          <span className="text-2xl font-bold text-white">${totalPrice}<span className="text-sm font-normal text-slate-400">/mo</span></span>
        </div>
      </div>

      {/* Trust note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 mb-6">
        <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400">No contract. Cancel anytime. Billing is month-to-month. Your card won't be charged until you complete setup.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <button
          onClick={onPay}
          disabled={creating}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 transition-all text-base"
        >
          {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-5 h-5" /> Continue to Payment</>}
        </button>

      </div>
    </div>
  );
}

export default function OnboardingPreflightPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    }>
      <OnboardingPreflightInner />
    </Suspense>
  );
}
