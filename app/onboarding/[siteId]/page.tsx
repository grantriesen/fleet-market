'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import {
  Building2, Phone, Mail, MapPin, Clock, Wrench,
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
  // AI description
  businessDescription: string;
}

const INITIAL_FORM: FormData = {
  businessName: '', phone: '', email: '', address: '', city: '', state: '', zip: '',
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
function getSteps(addons: string[]) {
  const hasInventory = addons.includes('inventory');
  const hasService   = addons.includes('service');
  const hasRentals   = addons.includes('rentals');

  const steps = [
    { id: 'basics',   label: 'Business Info',  icon: Building2 },
    { id: 'hours',    label: 'Hours & Area',   icon: Clock },
    { id: 'services', label: 'Your Services',  icon: Wrench },
    { id: 'brands',   label: 'Brands',         icon: Tag },
  ];

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
  const [brandCategory,  setBrandCategory]  = useState('all');

  const steps = site ? getSteps(site.addons || []) : [];
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
      case 'inventory':return !!(form.inventorySystem && form.posSystem);
      case 'service':  return !!(form.serviceSchedulingSystem);
      case 'rentals':  return !!(form.rentalManagementSystem);
      case 'ai':       return !!(form.businessDescription.trim());
      default:         return true;
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
      const prompt = `You are writing website copy for an outdoor power equipment and landscape contractor dealer.

Here is information about the business:

Business Name: ${form.businessName}
Location: ${form.city}, ${form.state}
Phone: ${form.phone}
Email: ${form.email}
Hours: ${form.weekdayHours}${form.saturdayHours ? ', ' + form.saturdayHours : ''}${form.sundayHours ? ', ' + form.sundayHours : ''}
Years in Business: ${form.yearsInBusiness || 'not specified'}
Service Area: ${form.serviceArea || 'local area'}
Services Offered: ${form.servicesDescription}
Brands Carried: ${form.selectedBrands.join(', ') || 'various brands'}

In their own words: "${form.businessDescription}"

Write website copy for this dealer. Use their voice and the specific details they provided. Keep it professional but approachable — this is a local equipment dealer, not a corporate chain. Be specific where you can — reference their brands, their service area, their specialties.

Return ONLY a valid JSON object with these exact keys. No markdown, no backticks, no extra text before or after the JSON:

{
  "hero.heading": "Homepage hero heading (6-10 words, punchy, reflects their business)",
  "hero.subheading": "Hero subheading (1-2 sentences, what they do and who they serve)",
  "hero.ctaButton.text": "Primary CTA button text (2-4 words, action-oriented)",
  "hero.secondaryButton.text": "Secondary CTA button text (2-4 words)",
  "featured.heading": "Featured equipment section heading (2-4 words)",
  "featured.subheading": "Featured equipment subheading (1 short sentence)",
  "manufacturers.heading": "Brands section heading (3-5 words)",
  "manufacturers.subheading": "Brands section subheading (1 short sentence)",
  "testimonials.heading": "Testimonials section heading (3-5 words)",
  "cta.heading": "Bottom CTA section heading (5-8 words, compelling)",
  "cta.subheading": "Bottom CTA subheading (1-2 sentences encouraging contact)",
  "cta.primaryButton.text": "CTA primary button text (2-4 words)",
  "cta.secondaryButton.text": "CTA secondary button text (2-4 words)",
  "footer.tagline": "Footer tagline (5-8 words, memorable brand statement)",
  "contactPage.heading": "Contact page heading (2-4 words)",
  "contactPage.subheading": "Contact page description (1-2 sentences)",
  "contactPage.formHeading": "Contact form heading (3-5 words)",
  "contactPage.locationHeading": "Location section heading (3-5 words)",
  "manufacturersPage.heading": "Manufacturers page heading (3-5 words)",
  "manufacturersPage.subheading": "Manufacturers page description (1-2 sentences)",
  "manufacturersPage.introText": "Manufacturers page intro paragraph (2-3 sentences about being an authorized dealer)"${addons.includes('inventory') ? `,
  "inventoryPage.heading": "Inventory page heading (2-4 words)",
  "inventoryPage.subheading": "Inventory page description (1 sentence)",
  "inventoryPage.ctaHeading": "Inventory CTA heading for when customer doesn't see what they want (5-8 words)",
  "inventoryPage.ctaText": "Inventory CTA description (1 sentence)",
  "inventoryPage.ctaButton.text": "Inventory CTA button text (2-4 words)",
  "inventoryPage.filterLabel": "Filter label text (2-4 words)"` : ''}${addons.includes('service') ? `,
  "servicePage.heading": "Service page heading (3-5 words)",
  "servicePage.subheading": "Service page description (1-2 sentences)",
  "servicePage.service1Title": "First service offering title (2-4 words, based on their services)",
  "servicePage.service1Description": "First service description (1-2 sentences)",
  "servicePage.service2Title": "Second service offering title (2-4 words)",
  "servicePage.service2Description": "Second service description (1-2 sentences)",
  "servicePage.service3Title": "Third service offering title (2-4 words)",
  "servicePage.service3Description": "Third service description (1-2 sentences)",
  "servicePage.whyChooseHeading": "Why choose our service section heading (3-6 words)",
  "servicePage.why1Title": "First benefit title (2-4 words)",
  "servicePage.why1Description": "First benefit description (1 sentence)",
  "servicePage.why2Title": "Second benefit title (2-4 words)",
  "servicePage.why2Description": "Second benefit description (1 sentence)",
  "servicePage.why3Title": "Third benefit title (2-4 words)",
  "servicePage.why3Description": "Third benefit description (1 sentence)",
  "servicePage.ctaHeading": "Service page CTA heading (4-6 words)",
  "servicePage.urgentHeading": "Urgent service card heading (3-5 words)",
  "servicePage.urgentText": "Urgent service card description (1 sentence)",
  "servicePage.formSubheading": "Service form subheading (1 sentence)"` : ''}${addons.includes('rentals') ? `,
  "rentalsPage.heading": "Rentals page heading (2-4 words)",
  "rentalsPage.subheading": "Rentals page description (1-2 sentences)",
  "rentalsPage.ctaHeading": "Rentals CTA heading (4-6 words)",
  "rentalsPage.ctaText": "Rentals CTA description (1 sentence)",
  "rentalsPage.ctaButton.text": "Rentals CTA button text (2-4 words)",
  "rentalsPage.rentalInfoHeading": "Rental information card heading (2-4 words)",
  "rentalsPage.pricingNote": "Pricing and delivery note (1-2 sentences)",
  "rentalsPage.requirement1": "Rental requirement 1 (short phrase, e.g. Valid driver license)",
  "rentalsPage.requirement2": "Rental requirement 2 (short phrase)",
  "rentalsPage.requirement3": "Rental requirement 3 (short phrase)",
  "rentalsPage.requirement4": "Rental requirement 4 (short phrase)",
  "rentalsPage.policy1": "Rental policy 1 (short phrase)",
  "rentalsPage.policy2": "Rental policy 2 (short phrase)",
  "rentalsPage.policy3": "Rental policy 3 (short phrase)",
  "rentalsPage.policy4": "Rental policy 4 (short phrase)"` : ''}
}`;

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
        { field_key: 'businessInfo.phone',        value: form.phone },
        { field_key: 'businessInfo.email',        value: form.email },
        { field_key: 'businessInfo.address',      value: form.address },
        { field_key: 'businessInfo.city',         value: form.city },
        { field_key: 'businessInfo.state',        value: form.state },
        { field_key: 'businessInfo.zip',          value: form.zip },
        { field_key: 'businessInfo.hours',        value: form.weekdayHours },
        { field_key: 'businessInfo.saturdayHours',value: form.saturdayHours },
        { field_key: 'businessInfo.sundayHours',  value: form.sundayHours },
        { field_key: 'businessInfo.serviceArea',  value: form.serviceArea },
        { field_key: 'businessInfo.yearsInBusiness', value: form.yearsInBusiness },
        // AI generated copy
        ...Object.entries(copy).map(([field_key, value]) => ({ field_key, value: value as string })),
      ].filter(r => r.value);

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
          contentRows,
          manufacturers: manufacturerRows,
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
          error={error}
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
  brandCategory, setBrandCategory, siteName, error }: any) {

  const inputCls = "w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors text-sm";
  const labelCls = "block text-sm font-medium text-slate-300 mb-2";

  switch (step) {
    case 'basics':
      return (
        <div>
          <StepHeader icon={Building2} title="Let's start with the basics" subtitle="This info will appear on your site's contact page and footer." />
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className={labelCls}>Business Name *</label>
              <input className={inputCls} value={form.businessName} onChange={e => update('businessName', e.target.value)} placeholder="Green Valley Equipment Co." />
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
          <textarea
            className={`${inputCls} resize-none`}
            rows={6}
            value={form.servicesDescription}
            onChange={e => update('servicesDescription', e.target.value)}
            placeholder="We sell and service commercial and residential outdoor power equipment. We specialize in zero-turn mowers, chainsaws, trimmers, and blowers. We also have a full-service repair shop for all major brands, including warranty work..."
          />
          <p className="text-xs text-slate-500 mt-2">The more detail you give, the better your website copy will be.</p>
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

    case 'ai':
      return (
        <div>
          <StepHeader
            icon={Sparkles}
            title="Tell us about your business"
            subtitle="Describe your dealership in your own words — your story, what makes you different, who you serve. Our AI will use this to write all the copy for your website."
          />
          <textarea
            className={`${inputCls} resize-none`}
            rows={8}
            value={form.businessDescription}
            onChange={e => update('businessDescription', e.target.value)}
            placeholder="We've been serving farmers and landscapers in the Platte Valley for over 30 years. What sets us apart is our service department — we have four factory-trained techs and most repairs are done in 48 hours or less. We're not a big box store, we're your neighbors. We stock parts for everything we sell and stand behind every piece of equipment we put out the door..."
          />
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
