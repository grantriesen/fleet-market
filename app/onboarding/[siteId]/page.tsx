'use client';

import { useEffect, useState, useRef } from 'react';
import ImageUpload from '@/components/ImageUpload';
import { buildOnboardingPrompt } from '@/lib/template-prompts';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Building2, Phone, Mail, MapPin, Clock, Wrench, BarChart3,
  ChevronRight, ChevronLeft, Check, Loader2, Sparkles,
  Package, Calendar, Tag, AlertCircle, Info
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Site {
  id: string;
  site_name: string;
  slug: string;
  addons: string[];
  template: { slug: string; config_json: any };
  templateSlug: string;
}

interface LibraryBrand {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  website_url: string;
}

interface FormData {
  // Business basics
  businessName: string;
  logoImage: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  // Hours
  weekdayHours: string;
  saturdayHours: string;
  sundayHours: string;
  yearsInBusiness: string;
  serviceArea: string;
  // Services
  servicesDescription: string;
  // Brands (slugs)
  selectedBrands: string[];
  // Inventory addon
  inventorySystem: string;
  inventorySystemName: string;
  posSystem: string;
  posSystemName: string;
  // Service addon
  serviceSchedulingSystem: string;
  serviceSchedulingSystemName: string;
  // Rentals addon
  rentalManagementSystem: string;
  rentalManagementSystemName: string;
  // CE-specific stats
  machinesServiced: string;
  customerSatisfaction: string;
  // Brand colors
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  // AI description
  businessDescription: string;
}

const INITIAL_FORM: FormData = {
  businessName: '', logoImage: '', phone: '', email: '', address: '', city: '', state: '', zip: '',
  weekdayHours: 'Mon–Fri: 8:00 AM – 5:00 PM',
  saturdayHours: 'Sat: 8:00 AM – 12:00 PM',
  sundayHours: 'Closed',
  yearsInBusiness: '', serviceArea: '',
  servicesDescription: '',
  selectedBrands: [],
  inventorySystem: '', inventorySystemName: '',
  posSystem: '', posSystemName: '',
  serviceSchedulingSystem: '', serviceSchedulingSystemName: '',
  rentalManagementSystem: '', rentalManagementSystemName: '',
  machinesServiced: '',
  customerSatisfaction: '98%',
  colorPrimary: '#2D5016',
  colorSecondary: '#F97316',
  colorAccent: '#059669',
  businessDescription: '',
};

const CATEGORY_LABELS: Record<string, string> = {
  'outdoor-power': 'Outdoor Power', 'commercial-mowers': 'Commercial Mowers',
  'tractors': 'Tractors', 'compact-equipment': 'Compact Equipment',
  'turf-tools': 'Turf Tools', 'attachments': 'Attachments',
  'irrigation': 'Irrigation', 'spreaders-sprayers': 'Spreaders & Sprayers',
  'pressure-washers': 'Pressure Washers', 'generators': 'Generators',
  'engines': 'Engines', 'golf-turf': 'Golf & Turf',
  'trailers': 'Trailers', 'utility-vehicles': 'Utility Vehicles',
  'parts-accessories': 'Parts & Accessories', 'lawn-care': 'Lawn Care', 'safety': 'Safety',
};

// ─── Step Config ──────────────────────────────────────────────────────────────
function getSteps(addons: string[], templateSlug?: string) {
  const hasInventory = addons.includes('inventory');
  const hasService   = addons.includes('service');
  const hasRentals   = addons.includes('rentals');
  const isCE = templateSlug === 'corporate-edge';

  const steps = [
    { id: 'basics',   label: 'Business Info',  icon: Building2 },
    { id: 'hours',    label: 'Hours & Area',   icon: Clock },
    { id: 'services', label: 'Your Services',  icon: Wrench },
    { id: 'brands',   label: 'Brands',         icon: Tag },
  ];

  if (isCE) steps.push({ id: 'ce-stats', label: 'Your Stats', icon: BarChart3 });
  if (hasInventory) steps.push({ id: 'inventory', label: 'Inventory',  icon: Package });
  if (hasService)   steps.push({ id: 'service',   label: 'Service',    icon: Wrench });
  if (hasRentals)   steps.push({ id: 'rentals',   label: 'Rentals',    icon: Calendar });

  steps.push({ id: 'ai', label: 'About You', icon: Sparkles });
  return steps;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OnboardingPage({ params }: { params: { siteId: string } }) {
  const router = useRouter();
  const supabase = createClient();

  const [loading,        setLoading]        = useState(true);
  const [site,           setSite]           = useState<Site | null>(null);
  const [brands,         setBrands]         = useState<LibraryBrand[]>([]);
  const [brandsLoading,  setBrandsLoading]  = useState(false);
  const [form,           setForm]           = useState<FormData>(INITIAL_FORM);
  const [step,           setStep]           = useState(0);
  const [generating,     setGenerating]     = useState(false);
  const [genStatus,      setGenStatus]      = useState('');
  const [error,          setError]          = useState('');
  const [brandSearch,    setBrandSearch]    = useState('');
  const [aiAssisting,    setAiAssisting]    = useState<'services' | 'about' | null>(null);
  const [brandCategory,  setBrandCategory]  = useState('all');

  const steps = site ? getSteps(site.addons || [], site.template?.slug) : [];
  const currentStep = steps[step];
  const isLast = step === steps.length - 1;

  useEffect(() => { loadSite(); }, []);
  useEffect(() => { if (step === steps.findIndex(s => s.id === 'brands') && brands.length === 0) loadBrands(); }, [step]);

  async function loadSite() {
    try {
      const { data } = await supabase.from('sites').select(`
        id, site_name, slug, addons,
        template:templates(slug, config_json)
      `).eq('id', params.siteId).single();
      if (data) setSite(data as any);
    } finally { setLoading(false); }
  }

  async function loadBrands() {
    setBrandsLoading(true);
    const { data } = await supabase.from('manufacturer_library')
      .select('id, name, slug, category, description, website_url')
      .eq('is_active', true).order('name');
    setBrands(data || []);
    setBrandsLoading(false);
  }

  function update(key: keyof FormData, value: any) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function toggleBrand(slug: string) {
    setForm(prev => ({
      ...prev,
      selectedBrands: prev.selectedBrands.includes(slug)
        ? prev.selectedBrands.filter(s => s !== slug)
        : [...prev.selectedBrands, slug],
    }));
  }

  function canAdvance(): boolean {
    if (!currentStep) return false;
    switch (currentStep.id) {
      case 'basics':   return !!(form.businessName.trim() && form.phone.trim() && form.email.trim());
      case 'hours':    return !!(form.weekdayHours.trim());
      case 'services': return !!(form.servicesDescription.trim());
      case 'brands':   return true; // optional
      case 'ce-stats':  return true; // optional — AI fills what's missing
      case 'inventory':return !!(form.inventorySystem && form.posSystem);
      case 'service':  return !!(form.serviceSchedulingSystem);
      case 'rentals':  return !!(form.rentalManagementSystem);
      case 'ce-stats':
      return (
        <div>
          <StepHeader icon={BarChart3} title="Let's add some credibility numbers" subtitle="These stats appear prominently on your homepage. Fill in what you know — the AI will fill in anything you leave blank." />
          <div className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Machines Serviced</label>
                <input className={inputCls} value={form.machinesServiced} onChange={e => update('machinesServiced', e.target.value)} placeholder="e.g. 500+" />
                <p className="text-xs text-slate-500 mt-1">Approx. total units your shop has serviced</p>
              </div>
              <div>
                <label className={labelCls}>Customer Satisfaction</label>
                <input className={inputCls} value={form.customerSatisfaction} onChange={e => update('customerSatisfaction', e.target.value)} placeholder="e.g. 98%" />
                <p className="text-xs text-slate-500 mt-1">Your satisfaction rate or review score</p>
              </div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl flex gap-3">
              <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">Years in business and brand count are pulled from your earlier answers automatically.</p>
            </div>
          </div>
        </div>
      );

    case 'ai':       return !!(form.businessDescription.trim());
      default:         return true;
    }
  }

  async function handleAiAssist(field: 'services' | 'about') {
    setAiAssisting(field);
    try {
      const templateSlug = site?.template?.slug || 'green-valley-industrial';
      const toneMap: Record<string, string> = {
        'green-valley-industrial': 'professional and direct, sentence case',
        'corporate-edge': 'polished B2B professional, title case',
        'modern-lawn-solutions': 'clean and approachable, sentence case',
        'vibe-dynamics': 'HIGH ENERGY with ALL CAPS for emphasis, punchy and exciting',
        'warm-earth-designs': 'warm and community-focused, personal and grounded',
        'zenith-lawn': 'minimalist and premium, refined and understated',
      };
      const tone = toneMap[templateSlug] || 'professional';
      const isServices = field === 'services';
      const hasExisting = isServices ? form.servicesDescription.trim() : form.businessDescription.trim();

      const prompt = isServices
        ? hasExisting
          ? `You are helping a local outdoor power equipment dealer improve their services description for their website onboarding form.

Business: ${form.businessName || 'an equipment dealer'}
Location: ${form.city || ''}, ${form.state || ''}
Brands: ${form.selectedBrands.join(', ') || 'various brands'}

Their draft: "${form.servicesDescription}"

Enhance this description to be more compelling and specific while keeping their voice. Keep it to 3-5 sentences. Return only the enhanced text, no quotes, no preamble.`
          : `You are helping a local outdoor power equipment dealer write a services description for their website onboarding form.

Business: ${form.businessName || 'an equipment dealer'}
Location: ${form.city || ''}, ${form.state || ''}
Brands: ${form.selectedBrands.join(', ') || 'various brands'}
Hours: ${form.weekdayHours || ''}

Write a natural, specific 3-5 sentence description of what services a dealer like this would typically offer — equipment sales, service/repair, parts, and anything else relevant. Write it in first person plural (we/our). Return only the description text, no quotes, no preamble.`
        : hasExisting
          ? `You are helping a local outdoor power equipment dealer improve their business description for their website.

Business: ${form.businessName || 'an equipment dealer'}
Location: ${form.city || ''}, ${form.state || ''}
Years in business: ${form.yearsInBusiness || 'established'}
Service area: ${form.serviceArea || 'local area'}
Services: ${form.servicesDescription || ''}
Brands: ${form.selectedBrands.join(', ') || 'various brands'}

Their draft: "${form.businessDescription}"

Enhance this to be more compelling and personal while keeping their authentic voice. Keep it to 4-6 sentences. Return only the enhanced text, no quotes, no preamble.`
          : `You are helping a local outdoor power equipment dealer write an "about us" description for their website.

Business: ${form.businessName || 'an equipment dealer'}
Location: ${form.city || ''}, ${form.state || ''}
Years in business: ${form.yearsInBusiness || 'established'}
Service area: ${form.serviceArea || 'local area'}
Services: ${form.servicesDescription || ''}
Brands: ${form.selectedBrands.join(', ') || 'various brands'}
Hours: ${form.weekdayHours || ''}

Write a warm, authentic 4-6 sentence "about us" description in first person plural (we/our) that captures what makes a local equipment dealer trustworthy and community-focused. Reference their specific details where possible. Return only the description text, no quotes, no preamble.`;

      const response = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, siteId: params.siteId, rawText: true }),
      });

      if (!response.ok) throw new Error('AI assist failed');
      const data = await response.json();
      const text = data.copy || data.text || '';

      if (isServices) {
        update('servicesDescription', text);
      } else {
        update('businessDescription', text);
      }
    } catch (err) {
      console.error('AI assist error:', err);
    } finally {
      setAiAssisting(null);
    }
  }

  async function handleFinish() {
    if (!site) return;
    setGenerating(true);
    setGenStatus('Analyzing your business...');
    setError('');

    try {
      // ── Build AI prompt ──────────────────────────────────────────────────
      const addons = site.addons || [];
      const prompt = buildOnboardingPrompt(
        site.template?.slug || 'green-valley-industrial',
        {
          businessName: form.businessName,
          city: form.city,
          state: form.state,
          phone: form.phone,
          email: form.email,
          weekdayHours: form.weekdayHours,
          saturdayHours: form.saturdayHours,
          sundayHours: form.sundayHours,
          yearsInBusiness: form.yearsInBusiness,
          serviceArea: form.serviceArea,
          servicesDescription: form.servicesDescription,
          selectedBrands: form.selectedBrands,
          businessDescription: form.businessDescription,
          machinesServiced: form.machinesServiced,
          customerSatisfaction: form.customerSatisfaction,
        },
        site.addons || []
      );

      // ── Call Claude API ──────────────────────────────────────────────────
      setGenStatus('Generating your website copy...');
      const response = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, siteId: site.id }),
      });

      if (!response.ok) throw new Error('Failed to generate copy');
      const { copy } = await response.json();

      setGenStatus('Saving your content...');

      // ── Build content rows ────────────────────────────────────────────────
      const contentRows = [
        { field_key: 'businessInfo.businessName', value: form.businessName },
        { field_key: 'businessInfo.logoImage',    value: form.logoImage },
        { field_key: 'businessInfo.phone',        value: form.phone },
        { field_key: 'businessInfo.email',        value: form.email },
        { field_key: 'businessInfo.address',      value: form.address },
        { field_key: 'businessInfo.city',         value: form.city },
        { field_key: 'businessInfo.state',        value: form.state },
        { field_key: 'businessInfo.zip',          value: form.zip },
        { field_key: 'businessInfo.hours',        value: form.weekdayHours },
        // ZL uses a single combined hours field
        ...(site.template?.slug === 'zenith-lawn' ? [
          { field_key: 'hours.hours', value: [form.weekdayHours, form.saturdayHours, form.sundayHours].filter(Boolean).join(' | ') },
        ] : []),
        // VD uses hours.weekdays/saturday/sunday
        ...(site.template?.slug === 'vibe-dynamics' ? [
          { field_key: 'hours.weekdays', value: form.weekdayHours },
          { field_key: 'hours.saturday', value: form.saturdayHours },
          { field_key: 'hours.sunday',   value: form.sundayHours },
        ] : []),
        // MLS uses individual day fields
        ...(site.template?.slug === 'modern-lawn-solutions' ? [
          { field_key: 'hours.monday',    value: form.weekdayHours },
          { field_key: 'hours.tuesday',   value: form.weekdayHours },
          { field_key: 'hours.wednesday', value: form.weekdayHours },
          { field_key: 'hours.thursday',  value: form.weekdayHours },
          { field_key: 'hours.friday',    value: form.weekdayHours },
          { field_key: 'hours.saturday',  value: form.saturdayHours },
          { field_key: 'hours.sunday',    value: form.sundayHours },
        ] : []),
        { field_key: 'businessInfo.saturdayHours',value: form.saturdayHours },
        { field_key: 'businessInfo.sundayHours',  value: form.sundayHours },
        { field_key: 'businessInfo.serviceArea',  value: form.serviceArea },
        { field_key: 'businessInfo.yearsInBusiness', value: form.yearsInBusiness },
        // CE-specific stats (saved directly, not AI-generated)
        ...(site.template?.slug === 'corporate-edge' ? [
          { field_key: 'stats.stat1Number', value: form.yearsInBusiness ? form.yearsInBusiness + '+' : '' },
          { field_key: 'stats.stat1Label',  value: 'Years in Business' },
          { field_key: 'stats.stat2Number', value: form.machinesServiced || '' },
          { field_key: 'stats.stat2Label',  value: 'Machines Serviced' },
          { field_key: 'stats.stat3Number', value: form.selectedBrands.length > 0 ? form.selectedBrands.length + '+' : '' },
          { field_key: 'stats.stat3Label',  value: 'Brand Partners' },
          { field_key: 'stats.stat4Number', value: form.customerSatisfaction || '' },
          { field_key: 'stats.stat4Label',  value: 'Customer Satisfaction' },
        ] : []),
        // AI generated copy
        ...Object.entries(copy).map(([field_key, value]) => ({ field_key, value: value as string })),
      ].filter(r => r.value);

      // Deduplicate — if same field_key appears twice, last one wins
      const deduped = Object.values(
        contentRows.reduce((acc: any, r: any) => { acc[r.field_key] = r; return acc; }, {})
      ) as typeof contentRows;
      const contentRows2 = deduped;

      // ── Build manufacturer rows ───────────────────────────────────────────
      const selectedLibraryBrands = brands.filter((b: LibraryBrand) => form.selectedBrands.includes(b.slug));
      const manufacturerRows = selectedLibraryBrands.map((b: LibraryBrand) => ({
        name: b.name,
        description: b.description || null,
        website_url: b.website_url || null,
      }));

      // ── Save everything via server-side API (bypasses RLS) ────────────────
      const saveResponse = await fetch('/api/save-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: site.id,
          contentRows: contentRows2,
          manufacturers: manufacturerRows,
          colors: {
            primary: form.colorPrimary,
            secondary: form.colorSecondary,
            accent: form.colorAccent,
          },
        }),
      });

      if (!saveResponse.ok) {
        const err = await saveResponse.json();
        throw new Error(err.error || 'Failed to save content');
      }

      setGenStatus('Almost done...');
      await new Promise(r => setTimeout(r, 800));

      // ── Redirect to customizer ────────────────────────────────────────────
      router.push(`/customize/${site.id}?onboarded=1`);

    } catch (err: any) {
      console.error('Onboarding error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setGenerating(false);
      setGenStatus('');
    }
  }

  // ─── Filtered brands ────────────────────────────────────────────────────────
  const filteredBrands = brands.filter(b => {
    const matchSearch = !brandSearch || b.name.toLowerCase().includes(brandSearch.toLowerCase());
    const matchCat = brandCategory === 'all' || b.category === brandCategory;
    return matchSearch && matchCat;
  });

  const brandsByCategory = filteredBrands.reduce((acc, b) => {
    const cat = b.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(b);
    return acc;
  }, {} as Record<string, LibraryBrand[]>);

  // ─── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <p>Site not found.</p>
      </div>
    );
  }

  // ─── Generating overlay ───────────────────────────────────────────────────────
  if (generating) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Building Your Site</h2>
          <p className="text-slate-400">{genStatus}</p>
        </div>
        <div className="flex gap-1.5 mt-4">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-100">Fleet Market</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 text-sm">Site Setup</span>
          </div>
          <div className="text-sm text-slate-500">{site.site_name}</div>
        </div>
      </div>

      {/* Progress */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isDone    = i < step;
              const isCurrent = i === step;
              return (
                <div key={s.id} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => i < step && setStep(i)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      isCurrent ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : isDone  ? 'text-slate-400 hover:text-slate-200 cursor-pointer'
                      : 'text-slate-600 cursor-default'
                    }`}
                  >
                    {isDone
                      ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                      : <Icon className="w-3.5 h-3.5" />
                    }
                    <span className="hidden sm:block">{s.label}</span>
                  </button>
                  {i < steps.length - 1 && (
                    <div className={`w-6 h-px mx-1 flex-shrink-0 ${i < step ? 'bg-emerald-500/40' : 'bg-slate-700'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <StepContent
          step={currentStep?.id || ''}
          form={form}
          update={update}
          toggleBrand={toggleBrand}
          brands={brands}
          brandsLoading={brandsLoading}
          filteredBrands={filteredBrands}
          brandsByCategory={brandsByCategory}
          brandSearch={brandSearch}
          setBrandSearch={setBrandSearch}
          brandCategory={brandCategory}
          setBrandCategory={setBrandCategory}
          siteName={site.site_name}
          siteId={params.siteId}
          error={error}
          aiAssisting={aiAssisting}
          handleAiAssist={handleAiAssist}
          templateSlug={site?.template?.slug}
        />

        {/* Nav */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-800">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="text-xs text-slate-600">{step + 1} of {steps.length}</div>

          {isLast ? (
            <button
              onClick={handleFinish}
              disabled={!canAdvance()}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-sm font-bold rounded-xl transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Build My Site
            </button>
          ) : (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 text-sm font-bold rounded-xl transition-colors"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step Content Component ────────────────────────────────────────────────────
function StepContent({ step, form, update, toggleBrand, brands, brandsLoading,
  filteredBrands, brandsByCategory, brandSearch, setBrandSearch,
  brandCategory, setBrandCategory, siteName, siteId, error,
  aiAssisting, handleAiAssist, templateSlug }: any) {

  const inputCls = "w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm";
  const labelCls = "block text-sm font-medium text-slate-300 mb-2";

  switch (step) {
    case 'basics':
      return (
        <div>
          <StepHeader icon={Building2} title="Let's set up your brand" subtitle="Start with your business name, logo, and brand colors — these appear throughout your site." />
          <div className="grid grid-cols-1 gap-6">

            {/* Business Name */}
            <div>
              <label className={labelCls}>Business Name *</label>
              <input className={inputCls} value={form.businessName} onChange={e => update('businessName', e.target.value)} placeholder="Green Valley Equipment Co." />
            </div>

            {/* Logo Upload */}
            {siteName && (
              <div>
                <label className={labelCls}>Logo</label>
                <p className="text-xs text-slate-500 mb-3">Recommended: transparent PNG, 200×60px. You can update this anytime.</p>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                  <ImageUpload
                    value={form.logoImage}
                    onChange={url => update('logoImage', url)}
                    siteId={siteId}
                    fieldKey="businessInfo.logoImage"
                    label=""
                    helpText=""
                  />
                </div>
              </div>
            )}

            {/* Brand Colors */}
            <div>
              <label className={labelCls}>Brand Colors</label>
              <p className="text-xs text-slate-500 mb-3">Pick colors that match your brand. You can fine-tune these in the customizer.</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border-2 border-slate-600 overflow-hidden">
                    <input type="color" value={form.colorPrimary} onChange={e => update('colorPrimary', e.target.value)}
                      className="w-full h-full cursor-pointer border-0 p-0 bg-transparent" style={{width:'100%',height:'100%'}} />
                  </div>
                  <span className="text-xs font-medium text-slate-400">Primary</span>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border-2 border-slate-600 overflow-hidden">
                    <input type="color" value={form.colorSecondary} onChange={e => update('colorSecondary', e.target.value)}
                      className="w-full h-full cursor-pointer border-0 p-0 bg-transparent" style={{width:'100%',height:'100%'}} />
                  </div>
                  <span className="text-xs font-medium text-slate-400">Secondary</span>
                </div>
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl border-2 border-slate-600 overflow-hidden">
                    <input type="color" value={form.colorAccent} onChange={e => update('colorAccent', e.target.value)}
                      className="w-full h-full cursor-pointer border-0 p-0 bg-transparent" style={{width:'100%',height:'100%'}} />
                  </div>
                  <span className="text-xs font-medium text-slate-400">Accent</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-800 pt-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Contact Information</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Phone *</label>
                <input className={inputCls} value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="(555) 555-5555" />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input className={inputCls} type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="info@yourshop.com" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Street Address</label>
              <input className={inputCls} value={form.address} onChange={e => update('address', e.target.value)} placeholder="123 Main Street" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className={labelCls}>City</label>
                <input className={inputCls} value={form.city} onChange={e => update('city', e.target.value)} placeholder="Omaha" />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input className={inputCls} value={form.state} onChange={e => update('state', e.target.value)} placeholder="NE" maxLength={2} />
              </div>
              <div>
                <label className={labelCls}>ZIP</label>
                <input className={inputCls} value={form.zip} onChange={e => update('zip', e.target.value)} placeholder="68102" />
              </div>
            </div>
          </div>
        </div>
      );

    case 'hours':
      return (
        <div>
          <StepHeader icon={Clock} title="Hours & Service Area" subtitle="Let customers know when you're open and where you operate." />
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className={labelCls}>Weekday Hours</label>
              <input className={inputCls} value={form.weekdayHours} onChange={e => update('weekdayHours', e.target.value)} placeholder="Mon–Fri: 8:00 AM – 5:00 PM" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Saturday Hours</label>
                <input className={inputCls} value={form.saturdayHours} onChange={e => update('saturdayHours', e.target.value)} placeholder="Sat: 8:00 AM – 12:00 PM" />
              </div>
              <div>
                <label className={labelCls}>Sunday Hours</label>
                <input className={inputCls} value={form.sundayHours} onChange={e => update('sundayHours', e.target.value)} placeholder="Closed" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Years in Business</label>
                <input className={inputCls} value={form.yearsInBusiness} onChange={e => update('yearsInBusiness', e.target.value)} placeholder="e.g. 15" />
              </div>
              <div>
                <label className={labelCls}>Service Area</label>
                <input className={inputCls} value={form.serviceArea} onChange={e => update('serviceArea', e.target.value)} placeholder="e.g. Greater Omaha Metro" />
              </div>
            </div>
          </div>
        </div>
      );

    case 'services':
      return (
        <div>
          <StepHeader icon={Wrench} title="What services do you offer?" subtitle="Describe what you do — sales, service, rentals, installations, anything. The AI will use this to write your website copy." />
          <div className="relative">
            <textarea
              className={`${inputCls} resize-none`}
              rows={6}
              value={form.servicesDescription}
              onChange={e => update('servicesDescription', e.target.value)}
              placeholder="We sell and service commercial and residential outdoor power equipment. We specialize in zero-turn mowers, chainsaws, trimmers, and blowers. We also have a full-service repair shop for all major brands, including warranty work..."
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-slate-500">The more detail you give, the better your website copy will be.</p>
            <button
              onClick={() => handleAiAssist('services')}
              disabled={aiAssisting === 'services'}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 disabled:opacity-50"
            >
              {aiAssisting === 'services' ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Writing...</>
              ) : form.servicesDescription.trim() ? (
                <><Sparkles className="w-3.5 h-3.5" /> Enhance with AI</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" /> Write with AI</>
              )}
            </button>
          </div>
        </div>
      );

    case 'brands':
      const categories = ['all', ...Array.from(new Set(brands.map((b: LibraryBrand) => b.category)))];
      return (
        <div>
          <StepHeader icon={Tag} title="Which brands do you carry?" subtitle="Select all the brands you're an authorized dealer for. You can add more later." />

          {/* Search + filter */}
          <div className="flex gap-3 mb-5">
            <input
              className={`${inputCls} flex-1`}
              value={brandSearch}
              onChange={e => setBrandSearch(e.target.value)}
              placeholder="Search brands..."
            />
            <select
              value={brandCategory}
              onChange={e => setBrandCategory(e.target.value)}
              className="px-3 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map((c: string) => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : (CATEGORY_LABELS[c] || c)}</option>
              ))}
            </select>
          </div>

          {form.selectedBrands.length > 0 && (
            <div className="mb-4 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400">
              {form.selectedBrands.length} brand{form.selectedBrands.length !== 1 ? 's' : ''} selected
            </div>
          )}

          {brandsLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-slate-500" /></div>
          ) : (
            <div className="space-y-5 max-h-[420px] overflow-y-auto pr-1">
              {Object.entries(brandsByCategory).map(([cat, catBrands]: [string, any]) => (
                <div key={cat}>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{CATEGORY_LABELS[cat] || cat}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {catBrands.map((brand: LibraryBrand) => {
                      const isSelected = form.selectedBrands.includes(brand.slug);
                      return (
                        <button
                          key={brand.slug}
                          onClick={() => toggleBrand(brand.slug)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                              : 'border-slate-700 hover:border-slate-500 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'}`}>
                            {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className="truncate font-medium">{brand.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case 'inventory':
      return (
        <div>
          <StepHeader icon={Package} title="Inventory & Point of Sale" subtitle="Help us understand your current setup so we can get your inventory integration running smoothly." />
          <div className="space-y-6">
            <AddonQuestion
              question="Do you already use an inventory management system, or will you be managing inventory through Fleet Market?"
              value={form.inventorySystem}
              onChange={v => update('inventorySystem', v)}
              options={[
                { value: 'fleet_market', label: "I'll use Fleet Market" },
                { value: 'existing', label: 'I have an existing system' },
              ]}
              conditionalLabel="What system do you use?"
              conditionalValue={form.inventorySystemName}
              onConditionalChange={v => update('inventorySystemName', v)}
              conditionalPlaceholder="e.g. Lightspeed, DMS, Acumatica..."
              inputCls={inputCls}
            />
            <AddonQuestion
              question="Do you process sales through your own POS system, or would you like Fleet Market to handle checkout?"
              value={form.posSystem}
              onChange={v => update('posSystem', v)}
              options={[
                { value: 'fleet_market', label: "I'll use Fleet Market checkout" },
                { value: 'existing', label: 'I have an existing POS' },
              ]}
              conditionalLabel="What POS system do you use?"
              conditionalValue={form.posSystemName}
              onConditionalChange={v => update('posSystemName', v)}
              conditionalPlaceholder="e.g. Square, Clover, CDK..."
              inputCls={inputCls}
            />
          </div>
        </div>
      );

    case 'service':
      return (
        <div>
          <StepHeader icon={Wrench} title="Service Scheduling" subtitle="Tell us how you currently manage service appointments." />
          <AddonQuestion
            question="Do you use a service scheduling or work order system, or will you be using Fleet Market's service scheduling?"
            value={form.serviceSchedulingSystem}
            onChange={v => update('serviceSchedulingSystem', v)}
            options={[
              { value: 'fleet_market', label: "I'll use Fleet Market scheduling" },
              { value: 'existing', label: 'I have an existing system' },
            ]}
            conditionalLabel="What system do you use?"
            conditionalValue={form.serviceSchedulingSystemName}
            onConditionalChange={v => update('serviceSchedulingSystemName', v)}
            conditionalPlaceholder="e.g. ServiceTitan, Jobber, RepairShopr..."
            inputCls={inputCls}
          />
        </div>
      );

    case 'rentals':
      return (
        <div>
          <StepHeader icon={Calendar} title="Rental Management" subtitle="Tell us about your current rental operations." />
          <AddonQuestion
            question="Do you manage rentals through an existing system, or will you be using Fleet Market's rental management?"
            value={form.rentalManagementSystem}
            onChange={v => update('rentalManagementSystem', v)}
            options={[
              { value: 'fleet_market', label: "I'll use Fleet Market rentals" },
              { value: 'existing', label: 'I have an existing system' },
            ]}
            conditionalLabel="What rental management system do you use?"
            conditionalValue={form.rentalManagementSystemName}
            onConditionalChange={v => update('rentalManagementSystemName', v)}
            conditionalPlaceholder="e.g. Point of Rental, Rentman, EZRentOut..."
            inputCls={inputCls}
          />
        </div>
      );

    case 'ce-stats':
      return (
        <div>
          <StepHeader icon={BarChart3} title="Let's add some credibility numbers" subtitle="These stats appear prominently on your homepage. Fill in what you know — the AI will fill in anything you leave blank." />
          <div className="grid grid-cols-1 gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Machines Serviced</label>
                <input className={inputCls} value={form.machinesServiced} onChange={e => update('machinesServiced', e.target.value)} placeholder="e.g. 500+" />
                <p className="text-xs text-slate-500 mt-1">Approx. total units your shop has serviced</p>
              </div>
              <div>
                <label className={labelCls}>Customer Satisfaction</label>
                <input className={inputCls} value={form.customerSatisfaction} onChange={e => update('customerSatisfaction', e.target.value)} placeholder="e.g. 98%" />
                <p className="text-xs text-slate-500 mt-1">Your satisfaction rate or review score</p>
              </div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl flex gap-3">
              <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400">Years in business and brand count are pulled from your earlier answers automatically.</p>
            </div>
          </div>
        </div>
      );

    case 'ai':
      return (
        <div>
          <StepHeader
            icon={Sparkles}
            title="Tell us about your business"
            subtitle="Describe your dealership in your own words — your story, what makes you different, who you serve. Our AI will use this to write all the copy for your website."
          />
          <div className="relative">
            <textarea
              className={`${inputCls} resize-none`}
              rows={8}
              value={form.businessDescription}
              onChange={e => update('businessDescription', e.target.value)}
              placeholder="We've been serving farmers and landscapers in the Platte Valley for over 30 years. What sets us apart is our service department — we have four factory-trained techs and most repairs are done in 48 hours or less. We're not a big box store, we're your neighbors. We stock parts for everything we sell and stand behind every piece of equipment we put out the door..."
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-slate-500">The AI uses everything you've entered to generate your site copy.</p>
            <button
              onClick={() => handleAiAssist('about')}
              disabled={aiAssisting === 'about'}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 disabled:opacity-50"
            >
              {aiAssisting === 'about' ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Writing...</>
              ) : form.businessDescription.trim() ? (
                <><Sparkles className="w-3.5 h-3.5" /> Enhance with AI</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" /> Write with AI</>
              )}
            </button>
          </div>
          <div className="mt-4 p-4 bg-slate-900 border border-slate-700 rounded-xl flex gap-3">
            <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              After you click "Build My Site", our AI will generate your homepage headlines, section copy, page headings, and more — all in your voice. You can edit everything in the customizer afterward.
            </p>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}

// ─── Helper Components ────────────────────────────────────────────────────────
function StepHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
      </div>
      <p className="text-slate-400 leading-relaxed pl-[52px]">{subtitle}</p>
    </div>
  );
}

function AddonQuestion({ question, value, onChange, options, conditionalLabel,
  conditionalValue, onConditionalChange, conditionalPlaceholder, inputCls }: any) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-300 mb-3">{question}</p>
      <div className="flex flex-col gap-2 mb-4">
        {options.map((opt: any) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all ${
              value === opt.value
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                : 'border-slate-700 hover:border-slate-500 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${value === opt.value ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'}`}>
              {value === opt.value && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            {opt.label}
          </button>
        ))}
      </div>
      {value === 'existing' && (
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">{conditionalLabel}</label>
          <input
            className={inputCls}
            value={conditionalValue}
            onChange={(e: any) => onConditionalChange(e.target.value)}
            placeholder={conditionalPlaceholder}
          />
        </div>
      )}
    </div>
  );
}
