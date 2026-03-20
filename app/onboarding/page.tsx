'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowRight, Building2, ExternalLink, Package, Wrench, Truck, Check, Zap } from 'lucide-react';

/* ── Brand ── */
const FM = {
  orange: '#E85525', orangeGlow: 'rgba(232,85,37,0.15)',
  dark: '#0C1B33', card: '#132444', border: '#1E3A6E',
  borderMuted: '#253D6A', muted: '#7B8FAD', text: '#A3B4CC',
  navy: '#1E3A6E', navyLight: '#264A8A', navyDark: '#152C54',
};

const TEMPLATE_META: Record<string, { tagline: string; style: string }> = {
  'corporate-edge':          { tagline: 'Professional & authoritative', style: 'Trust badges, stats, and a corporate feel'      },
  'green-valley-industrial': { tagline: 'Rugged & industrial',          style: 'Bold typography with a clean industrial layout'  },
  'modern-lawn-solutions':   { tagline: 'Clean & modern',               style: 'Sleek minimalism with strong visuals'            },
  'vibe-dynamics':           { tagline: 'Bold & energetic',             style: 'Vibrant gradients and dynamic animations'        },
  'zenith-lawn':             { tagline: 'Minimal & refined',            style: 'Ultra-clean with generous whitespace'            },
  'warm-earth-designs':      { tagline: 'Organic & warm',               style: 'Earthy tones with a handcrafted feel'            },
};

const ADDONS = [
  { key: 'inventory', label: 'Inventory Management',  Icon: Package, description: 'List and manage your full equipment catalog with pricing and categories.' },
  { key: 'service',   label: 'Service Scheduling',    Icon: Wrench,  description: 'Accept service requests online and manage your shop calendar.'           },
  { key: 'rentals',   label: 'Rental Management',     Icon: Truck,   description: 'List rental equipment, track availability, and capture inquiries.'        },
];

const MONTHLY   = { addon: 130, bundle2: 240, bundle3: 280 };
const ANNUAL_MO = { addon: Math.round(1430/12), bundle2: Math.round(2640/12), bundle3: Math.round(3080/12) };

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

interface Template { id: string; name: string; slug: string; }

// Steps: 1=business name, 2=template, 3=addons (only if not pre-selected), 4=never (goes straight to Stripe)
type Step = 1 | 2 | 3;

function OnboardingContent() {
  const router   = useRouter();
  const params   = useSearchParams();
  const supabase = createClient();

  // From URL — set by pricing page or register page
  const addonsParam    = params.get('addons') || '';
  const billingParam   = (params.get('billing') || 'monthly') as 'monthly' | 'annual';
  const preSelectedAddons = addonsParam ? addonsParam.split(',').filter(Boolean) : null;
  // null = not pre-selected (show step 3), [] = came from pricing with no addons (skip step 3), [...] = came with addons (skip step 3)
  const skipAddonStep  = preSelectedAddons !== null;

  const [step,               setStep]               = useState<Step>(1);
  const [loading,            setLoading]            = useState(true);
  const [submitting,         setSubmitting]         = useState(false);
  const [error,              setError]              = useState('');
  const [templates,          setTemplates]          = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedSlug,       setSelectedSlug]       = useState('');
  const [businessName,       setBusinessName]       = useState('');
  const [previewLoading,     setPreviewLoading]     = useState(true);

  // Add-on step state (only used when skipAddonStep === false)
  const [chosenAddons, setChosenAddons] = useState<string[]>([]);
  const [billing,      setBilling]      = useState<'monthly' | 'annual'>(billingParam);

  // Final addons to use at checkout
  const finalAddons  = skipAddonStep ? (preSelectedAddons ?? []) : chosenAddons;
  const finalBilling = billing;

  const totalSteps = skipAddonStep ? 3 : 4; // step 3 = addons, step 4 = payment (Stripe)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data: existingSite } = await supabase
        .from('sites').select('id').eq('user_id', user.id).maybeSingle();
      if (existingSite) { router.push('/dashboard'); return; }

      const { data: tplData } = await supabase
        .from('templates').select('id, name, slug').order('name');

      if (tplData && tplData.length > 0) {
        setTemplates(tplData);
        setSelectedTemplateId(tplData[0].id);
        setSelectedSlug(tplData[0].slug);
      }
      setLoading(false);
    }
    init();
  }, []);

  function selectTemplate(tpl: Template) {
    setSelectedTemplateId(tpl.id);
    setSelectedSlug(tpl.slug);
    setPreviewLoading(true);
  }

  function toggleAddon(key: string) {
    setChosenAddons(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]);
  }

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  async function handleFinish() {
    if (!businessName.trim() || !selectedTemplateId) return;
    setSubmitting(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: newSite, error: siteError } = await supabase
        .from('sites')
        .insert({
          user_id:           user.id,
          site_name:         businessName.trim(),
          slug:              generateSlug(businessName),
          template_id:       selectedTemplateId,
          subscription_tier: 'base',
          subscription_status: 'pending',
          deployment_status: 'draft',
          published:         false,
          onboarded:         false,
          onboarding_tour_completed: false,
          addons:            finalAddons,
        })
        .select().single();

      if (siteError) throw new Error(siteError.message);
      if (!newSite)  throw new Error('Site creation failed');

      await supabase.from('site_content').insert({
        site_id: newSite.id, field_key: 'businessInfo.businessName',
        value: businessName.trim(), field_type: 'text',
      });

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site_id: newSite.id, addons: finalAddons, billing: finalBilling }),
      });
      const { url, error: checkoutError } = await res.json();
      if (checkoutError) throw new Error(checkoutError);
      if (url) window.location.href = url;

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setSubmitting(false);
    }
  }

  // Progress steps shown in header
  const progressSteps = skipAddonStep
    ? [{ n: 1, label: 'Business Info' }, { n: 2, label: 'Choose Template' }, { n: 3, label: 'Payment' }]
    : [{ n: 1, label: 'Business Info' }, { n: 2, label: 'Choose Template' }, { n: 3, label: 'Add-ons' }, { n: 4, label: 'Payment' }];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: FM.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: 32, height: 32, color: FM.orange }} className="animate-spin" />
      </div>
    );
  }

  const addonMo       = addonPrice(chosenAddons.length, billing);
  const discount      = bundleDiscount(chosenAddons.length, billing);
  const baseMo        = billing === 'annual' ? Math.round(2300/12) : 230;
  const totalMo       = baseMo + addonMo;

  return (
    <div style={{ minHeight: '100vh', background: FM.dark, display: 'flex', flexDirection: 'column' }}>

      {/* Progress header */}
      <header style={{ background: FM.card, borderBottom: `1px solid ${FM.border}`, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'white', background: FM.orange, padding: '4px 10px', borderRadius: 6 }}>FM</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {progressSteps.map(({ n, label }, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && <div style={{ width: 24, height: 1, background: FM.border }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700,
                  background: n < step ? FM.orange : n === step ? FM.orange : FM.border,
                  color: n <= step ? 'white' : FM.muted,
                }}>
                  {n < step ? '✓' : n}
                </div>
                <span style={{ fontSize: '0.8125rem', color: n === step ? 'white' : FM.muted, fontWeight: n === step ? 600 : 400 }}>
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ width: 60 }} />
      </header>

      {/* ── Step 1: Business Name ── */}
      {step === 1 && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ width: '100%', maxWidth: 480 }}>
            <div style={{ marginBottom: 40, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: FM.orangeGlow, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Building2 style={{ width: 28, height: 28, color: FM.orange }} />
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: 8 }}>What's your business called?</h1>
              <p style={{ color: FM.text, fontSize: '1rem', lineHeight: 1.6 }}>This will be the name displayed on your dealer website.</p>
            </div>
            <input
              type="text" value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && businessName.trim() && setStep(2)}
              placeholder="e.g. Green Valley Equipment Co."
              autoFocus
              style={{ width: '100%', padding: '1rem 1.25rem', fontSize: '1.125rem', background: FM.card, border: `2px solid ${businessName.trim() ? FM.orange : FM.border}`, borderRadius: 12, color: 'white', outline: 'none', marginBottom: 24, transition: 'border-color 0.2s', boxSizing: 'border-box' }}
            />
            {error && <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: '0.875rem', marginBottom: 16 }}>{error}</div>}
            <button onClick={() => setStep(2)} disabled={!businessName.trim()}
              style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700, background: businessName.trim() ? FM.orange : FM.border, border: 'none', borderRadius: 12, color: 'white', cursor: businessName.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
              Continue <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Template picker ── */}
      {step === 2 && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Template list */}
          <div style={{ width: 340, flexShrink: 0, background: FM.card, borderRight: `1px solid ${FM.border}`, overflowY: 'auto', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>Choose a Template</h2>
            <p style={{ color: FM.muted, fontSize: '0.8125rem', marginBottom: 20 }}>Customize colors, fonts, and content after setup.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {templates.map(tpl => {
                const meta = TEMPLATE_META[tpl.slug];
                const isSel = selectedTemplateId === tpl.id;
                return (
                  <button key={tpl.id} onClick={() => selectTemplate(tpl)}
                    style={{ padding: '1rem', borderRadius: 10, cursor: 'pointer', textAlign: 'left', background: isSel ? FM.orangeGlow : 'transparent', border: `2px solid ${isSel ? FM.orange : FM.borderMuted}`, transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9375rem' }}>{tpl.name}</span>
                      {isSel && <span style={{ width: 20, height: 20, borderRadius: '50%', background: FM.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>✓</span>}
                    </div>
                    <p style={{ color: FM.orange, fontSize: '0.75rem', fontWeight: 600, marginBottom: 2 }}>{meta?.tagline}</p>
                    <p style={{ color: FM.muted, fontSize: '0.75rem', lineHeight: 1.4 }}>{meta?.style}</p>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${FM.border}` }}>
              <button
                onClick={() => skipAddonStep ? handleFinish() : setStep(3)}
                disabled={submitting || !selectedTemplateId}
                style={{ width: '100%', padding: '0.875rem', fontSize: '0.9375rem', fontWeight: 700, background: selectedTemplateId ? FM.orange : FM.border, border: 'none', borderRadius: 10, color: 'white', cursor: selectedTemplateId && !submitting ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                {submitting
                  ? <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Setting up...</>
                  : skipAddonStep
                    ? <>Continue to Payment <ArrowRight style={{ width: 16, height: 16 }} /></>
                    : <>Continue <ArrowRight style={{ width: 16, height: 16 }} /></>}
              </button>
              {error && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: '0.8125rem', marginBottom: 10 }}>{error}</div>}
              <button onClick={() => setStep(1)} style={{ width: '100%', padding: '0.625rem', fontSize: '0.875rem', background: 'transparent', border: `1px solid ${FM.border}`, borderRadius: 8, color: FM.text, cursor: 'pointer' }}>← Back</button>
            </div>
          </div>

          {/* iframe preview */}
          <div style={{ flex: 1, position: 'relative', background: FM.navyDark, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '0.75rem 1rem', background: FM.card, borderBottom: `1px solid ${FM.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              </div>
              <div style={{ flex: 1, background: FM.navyDark, borderRadius: 6, padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: FM.muted }}>
                Live Preview — {templates.find(t => t.id === selectedTemplateId)?.name}
              </div>
              <a href={`/api/preview/demo-${selectedSlug}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 4, color: FM.muted, fontSize: '0.75rem', textDecoration: 'none' }}>
                <ExternalLink style={{ width: 12, height: 12 }} /> Open
              </a>
            </div>
            {previewLoading && (
              <div style={{ position: 'absolute', inset: 0, top: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: FM.navyDark, zIndex: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <Loader2 style={{ width: 32, height: 32, color: FM.orange, margin: '0 auto 12px' }} className="animate-spin" />
                  <p style={{ color: FM.muted, fontSize: '0.875rem' }}>Loading preview...</p>
                </div>
              </div>
            )}
            <iframe key={selectedSlug} src={`/api/preview/demo-${selectedSlug}`} style={{ flex: 1, border: 'none', width: '100%' }} onLoad={() => setPreviewLoading(false)} title={`Preview: ${selectedSlug}`} />
          </div>
        </div>
      )}

      {/* ── Step 3: Add-ons (only shown if NOT pre-selected from pricing page) ── */}
      {step === 3 && !skipAddonStep && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ width: '100%', maxWidth: 560 }}>
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: 8 }}>Supercharge your site</h1>
              <p style={{ color: FM.text, fontSize: '1rem', lineHeight: 1.6 }}>Add powerful features to your plan. You can always add these later from your dashboard.</p>
            </div>

            {/* Billing toggle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', background: FM.card, borderRadius: 12, padding: 4, gap: 4, border: `1px solid ${FM.border}` }}>
                {(['monthly', 'annual'] as const).map(b => (
                  <button key={b} onClick={() => setBilling(b)}
                    style={{ padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, transition: 'all 0.2s', background: billing === b ? FM.orange : 'transparent', color: billing === b ? 'white' : FM.muted, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {b === 'monthly' ? 'Monthly' : (
                      <><span>Annual</span><span style={{ background: 'rgba(255,255,255,0.2)', fontSize: '0.6875rem', padding: '2px 6px', borderRadius: 4 }}>Save up to $460</span></>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Add-on cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {ADDONS.map(({ key, label, Icon, description }) => {
                const on = chosenAddons.includes(key);
                return (
                  <button key={key} onClick={() => toggleAddon(key)}
                    style={{ padding: '1.125rem 1.25rem', borderRadius: 12, cursor: 'pointer', textAlign: 'left', background: on ? FM.orangeGlow : FM.card, border: `2px solid ${on ? FM.orange : FM.borderMuted}`, transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: on ? FM.orange : FM.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon style={{ width: 20, height: 20, color: 'white' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, color: 'white', fontSize: '0.9375rem', marginBottom: 2 }}>{label}</p>
                      <p style={{ color: FM.muted, fontSize: '0.8125rem', lineHeight: 1.4 }}>{description}</p>
                    </div>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${on ? FM.orange : FM.borderMuted}`, background: on ? FM.orange : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {on && <Check style={{ width: 12, height: 12, color: 'white' }} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bundle/savings info */}
            {chosenAddons.length >= 2 && (
              <div style={{ padding: '0.75rem 1rem', background: FM.orangeGlow, border: `1px solid ${FM.orange}`, borderRadius: 10, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap style={{ width: 16, height: 16, color: FM.orange, flexShrink: 0 }} />
                <p style={{ color: FM.text, fontSize: '0.875rem' }}>
                  Bundle discount applied — saving <strong style={{ color: FM.orange }}>${discount}/mo</strong> vs buying separately.
                </p>
              </div>
            )}

            {/* Price summary */}
            {chosenAddons.length > 0 && (
              <div style={{ padding: '1rem 1.25rem', background: FM.card, border: `1px solid ${FM.border}`, borderRadius: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: FM.text, fontSize: '0.875rem' }}>Base plan</span>
                  <span style={{ color: 'white', fontSize: '0.875rem' }}>${baseMo}/mo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: FM.text, fontSize: '0.875rem' }}>
                    {chosenAddons.length === 1 ? ADDONS.find(a => a.key === chosenAddons[0])?.label : `${chosenAddons.length} add-on bundle`}
                  </span>
                  <span style={{ color: 'white', fontSize: '0.875rem' }}>+${addonMo}/mo</span>
                </div>
                <div style={{ borderTop: `1px solid ${FM.border}`, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'white', fontWeight: 700 }}>Total</span>
                  <span style={{ color: FM.orange, fontWeight: 700, fontSize: '1.125rem' }}>${totalMo}/mo</span>
                </div>
              </div>
            )}

            <button onClick={handleFinish} disabled={submitting}
              style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700, background: FM.orange, border: 'none', borderRadius: 12, color: 'white', cursor: submitting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
              {submitting
                ? <><Loader2 style={{ width: 18, height: 18 }} className="animate-spin" /> Setting up your site...</>
                : <>Continue to Payment <ArrowRight style={{ width: 18, height: 18 }} /></>}
            </button>
            {error && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: '0.875rem', marginBottom: 10 }}>{error}</div>}
            <button onClick={() => setStep(2)} style={{ width: '100%', padding: '0.625rem', fontSize: '0.875rem', background: 'transparent', border: `1px solid ${FM.border}`, borderRadius: 8, color: FM.text, cursor: 'pointer' }}>← Back</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0C1B33', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#E85525' }} className="animate-spin" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
