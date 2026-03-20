'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowRight, Building2, ExternalLink } from 'lucide-react';

/* ── Brand ── */
const FM = {
  orange: '#E85525', orangeGlow: 'rgba(232,85,37,0.15)',
  dark: '#0C1B33', card: '#132444', border: '#1E3A6E',
  borderMuted: '#253D6A', muted: '#7B8FAD', text: '#A3B4CC',
  navy: '#1E3A6E', navyLight: '#264A8A', navyDark: '#152C54',
};

const TEMPLATE_META: Record<string, { tagline: string; style: string }> = {
  'corporate-edge':          { tagline: 'Professional & authoritative', style: 'Trust badges, stats, and a corporate feel'     },
  'green-valley-industrial': { tagline: 'Rugged & industrial',          style: 'Bold typography with a clean industrial layout' },
  'modern-lawn-solutions':   { tagline: 'Clean & modern',               style: 'Sleek minimalism with strong visuals'           },
  'vibe-dynamics':           { tagline: 'Bold & energetic',             style: 'Vibrant gradients and dynamic animations'       },
  'zenith-lawn':             { tagline: 'Minimal & refined',            style: 'Ultra-clean with generous whitespace'           },
  'warm-earth-designs':      { tagline: 'Organic & warm',               style: 'Earthy tones with a handcrafted feel'           },
};

interface Template { id: string; name: string; slug: string; }

function OnboardingContent() {
  const router   = useRouter();
  const params   = useSearchParams();
  const supabase = createClient();

  const addonsParam    = params.get('addons') || '';
  const selectedAddons = addonsParam ? addonsParam.split(',').filter(Boolean) : [];

  const [step,               setStep]               = useState<1 | 2>(1);
  const [loading,            setLoading]            = useState(true);
  const [submitting,         setSubmitting]          = useState(false);
  const [error,              setError]              = useState('');
  const [templates,          setTemplates]          = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedSlug,       setSelectedSlug]       = useState('');
  const [businessName,       setBusinessName]       = useState('');
  const [previewLoading,     setPreviewLoading]     = useState(true);

  // Load auth + templates on mount
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // Redirect if they already have a site
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

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  async function handleFinish() {
    if (!businessName.trim() || !selectedTemplateId) return;
    setSubmitting(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const slug = generateSlug(businessName);

      // Create site
      const { data: newSite, error: siteError } = await supabase
        .from('sites')
        .insert({
          user_id:           user.id,
          site_name:         businessName.trim(),
          slug,
          template_id:       selectedTemplateId,
          subscription_tier: 'base',
          subscription_status: 'pending',
          deployment_status: 'draft',
          published:         false,
          onboarded:         false,
          onboarding_tour_completed: false,
          addons:            selectedAddons,
        })
        .select()
        .single();

      if (siteError) throw new Error(siteError.message);
      if (!newSite)  throw new Error('Site creation failed');

      // Save business name to site_content
      await supabase.from('site_content').insert({
        site_id:    newSite.id,
        field_key:  'businessInfo.businessName',
        value:      businessName.trim(),
        field_type: 'text',
      });

      // Hit Stripe checkout
      const res = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ site_id: newSite.id, addons: selectedAddons }),
      });
      const { url, error: checkoutError } = await res.json();
      if (checkoutError) throw new Error(checkoutError);
      if (url) window.location.href = url;

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: FM.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: 32, height: 32, color: FM.orange }} className="animate-spin" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: FM.dark, display: 'flex', flexDirection: 'column' }}>

      {/* ── Progress header ── */}
      <header style={{ background: FM.card, borderBottom: `1px solid ${FM.border}`, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'white', background: FM.orange, padding: '4px 10px', borderRadius: 6 }}>FM</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[
            { n: 1, label: 'Business Info' },
            { n: 2, label: 'Choose Template' },
            { n: 3, label: 'Payment' },
          ].map(({ n, label }, i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && <div style={{ width: 32, height: 1, background: FM.border }} />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
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
              <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: 8 }}>
                What's your business called?
              </h1>
              <p style={{ color: FM.text, fontSize: '1rem', lineHeight: 1.6 }}>
                This will be the name displayed on your dealer website.
              </p>
            </div>

            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && businessName.trim() && setStep(2)}
              placeholder="e.g. Green Valley Equipment Co."
              autoFocus
              style={{
                width: '100%', padding: '1rem 1.25rem', fontSize: '1.125rem',
                background: FM.card, border: `2px solid ${businessName.trim() ? FM.orange : FM.border}`,
                borderRadius: 12, color: 'white', outline: 'none', marginBottom: 24,
                transition: 'border-color 0.2s', boxSizing: 'border-box',
              }}
            />

            {error && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: '0.875rem', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              disabled={!businessName.trim()}
              style={{
                width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700,
                background: businessName.trim() ? FM.orange : FM.border,
                border: 'none', borderRadius: 12, color: 'white', cursor: businessName.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}
            >
              Continue <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Template picker with iframe preview ── */}
      {step === 2 && (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Left: template list */}
          <div style={{ width: 340, flexShrink: 0, background: FM.card, borderRight: `1px solid ${FM.border}`, overflowY: 'auto', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: 4 }}>Choose a Template</h2>
            <p style={{ color: FM.muted, fontSize: '0.8125rem', marginBottom: 20 }}>
              You can customize colors, fonts, and content after setup.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {templates.map(tpl => {
                const meta      = TEMPLATE_META[tpl.slug];
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => selectTemplate(tpl)}
                    style={{
                      padding: '1rem', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                      background: isSelected ? FM.orangeGlow : 'transparent',
                      border: `2px solid ${isSelected ? FM.orange : FM.borderMuted}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9375rem' }}>{tpl.name}</span>
                      {isSelected && (
                        <span style={{ width: 20, height: 20, borderRadius: '50%', background: FM.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>✓</span>
                      )}
                    </div>
                    <p style={{ color: FM.orange, fontSize: '0.75rem', fontWeight: 600, marginBottom: 2 }}>{meta?.tagline}</p>
                    <p style={{ color: FM.muted, fontSize: '0.75rem', lineHeight: 1.4 }}>{meta?.style}</p>
                  </button>
                );
              })}
            </div>

            {/* Bottom actions */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${FM.border}` }}>
              {error && (
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: '0.8125rem', marginBottom: 12 }}>
                  {error}
                </div>
              )}
              <button
                onClick={handleFinish}
                disabled={submitting || !selectedTemplateId}
                style={{
                  width: '100%', padding: '0.875rem', fontSize: '0.9375rem', fontWeight: 700,
                  background: selectedTemplateId ? FM.orange : FM.border,
                  border: 'none', borderRadius: 10, color: 'white',
                  cursor: selectedTemplateId && !submitting ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginBottom: 10,
                }}
              >
                {submitting
                  ? <><Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> Setting up your site...</>
                  : <>Continue to Payment <ArrowRight style={{ width: 16, height: 16 }} /></>}
              </button>
              <button
                onClick={() => setStep(1)}
                style={{ width: '100%', padding: '0.625rem', fontSize: '0.875rem', background: 'transparent', border: `1px solid ${FM.border}`, borderRadius: 8, color: FM.text, cursor: 'pointer' }}
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Right: iframe preview */}
          <div style={{ flex: 1, position: 'relative', background: FM.navyDark, display: 'flex', flexDirection: 'column' }}>
            {/* Preview toolbar */}
            <div style={{ padding: '0.75rem 1rem', background: FM.card, borderBottom: `1px solid ${FM.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ef4444','#f59e0b','#22c55e'].map(c => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                ))}
              </div>
              <div style={{ flex: 1, background: FM.navyDark, borderRadius: 6, padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: FM.muted }}>
                Live Preview — {templates.find(t => t.id === selectedTemplateId)?.name}
              </div>
              <a
                href={`/api/preview/demo-${selectedSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 4, color: FM.muted, fontSize: '0.75rem', textDecoration: 'none' }}
              >
                <ExternalLink style={{ width: 12, height: 12 }} /> Open
              </a>
            </div>

            {/* Loading overlay */}
            {previewLoading && (
              <div style={{ position: 'absolute', inset: 0, top: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: FM.navyDark, zIndex: 10 }}>
                <div style={{ textAlign: 'center' }}>
                  <Loader2 style={{ width: 32, height: 32, color: FM.orange, margin: '0 auto 12px' }} className="animate-spin" />
                  <p style={{ color: FM.muted, fontSize: '0.875rem' }}>Loading preview...</p>
                </div>
              </div>
            )}

            <iframe
              key={selectedSlug}
              src={`/api/preview/demo-${selectedSlug}`}
              style={{ flex: 1, border: 'none', width: '100%' }}
              onLoad={() => setPreviewLoading(false)}
              title={`Preview: ${selectedSlug}`}
            />
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
