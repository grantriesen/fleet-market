'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

/* ===========================================
   FLEET MARKET BRAND
   =========================================== */
const FM = {
  navy: '#1E3A6E', navyLight: '#264A8A', navyDark: '#152C54',
  orange: '#E85525', orangeLight: '#F06A3E', orangeDark: '#CC4419',
  orangeGlow: 'rgba(232,85,37,0.15)',
  dark: '#0C1B33', card: '#132444', border: '#1E3A6E',
  borderMuted: '#253D6A', muted: '#7B8FAD', text: '#A3B4CC', light: '#D0D9E8',
};

/* ===========================================
   TEMPLATE THUMBNAILS / METADATA
   =========================================== */
/* ═══════════════════════════════════════════
   PREMIUM ADD-ONS
   ═══════════════════════════════════════════ */
const PREMIUM_ADDONS = [
  { id: 'inventory', stateKey: 'addonInventory', name: 'Inventory Management', price: '$100/mo',
    desc: 'Showcase your equipment catalog with real-time inventory, pricing, specs, and search filters.',
    features: ['Product catalog with images & specs', 'Search & filter by category', 'Inventory sync capabilities', 'Lead capture on equipment pages'] },
  { id: 'serviceScheduling', stateKey: 'addonServiceScheduling', name: 'Service Scheduling', price: '$100/mo',
    desc: 'Let customers book service appointments online. Manage your shop schedule and reduce no-shows.',
    features: ['Online booking widget', 'Automated email confirmations', 'Service type & tech assignment', 'Calendar management dashboard'] },
  { id: 'rentalScheduling', stateKey: 'addonRentalScheduling', name: 'Rental Scheduling', price: '$100/mo',
    desc: 'Manage your rental fleet with availability calendars, online reservations, and automated agreements.',
    features: ['Equipment availability calendar', 'Online reservation system', 'Rental agreement generation', 'Fleet utilization tracking'] },
];

const TEMPLATE_DESCRIPTIONS: Record<string, { tagline: string; style: string }> = {
  'corporate-edge': { tagline: 'Professional & authoritative', style: 'Trust badges, stats, and a corporate feel' },
  'green-valley-industrial': { tagline: 'Rugged & industrial', style: 'Bold typography with a clean industrial layout' },
  'modern-lawn-solutions': { tagline: 'Clean & modern', style: 'Sleek minimalism with strong visuals' },
  'vibe-dynamics': { tagline: 'Bold & energetic', style: 'Vibrant gradients and dynamic animations' },
  'zenith-lawn': { tagline: 'Minimal & refined', style: 'Ultra-clean with generous whitespace' },
  'warm-earth-designs': { tagline: 'Organic & warm', style: 'Earthy tones with a handcrafted feel' },
};

/* ===========================================
   FLEET MARKET LOGO
   =========================================== */
function FMLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size === 'lg' ? 12 : 8 }}>
      <span style={{ fontWeight: 800, fontSize: size === 'lg' ? '1.5rem' : '1rem', color: 'white', background: FM.orange, padding: size === 'lg' ? '0.75rem 1.5rem' : '4px 10px', borderRadius: size === 'lg' ? 8 : 6, lineHeight: 1.2 }}>FM</span>
      <span style={{ fontWeight: 700, fontSize: size === 'lg' ? '1.25rem' : '0.9rem', color: FM.orange, letterSpacing: '0.05em' }}>FLEET MARKET</span>
    </div>
  );
}

/* ===========================================
   MAIN PAGE COMPONENT
   Route: app/onboarding/page.tsx
   =========================================== */
interface Template {
  id: string;
  name: string;
  slug: string;
  thumbnail_url: string;
  description: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0); // 0=welcome, 1=business, 2=template
  const [creating, setCreating] = useState(false);

  // Templates from DB
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Business info form data
  const [d, setD] = useState({
    businessName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    addonInventory: false,
    addonServiceScheduling: false,
    addonRentalScheduling: false,
  });

  const ch = useCallback((f: string) => (e: React.ChangeEvent<HTMLInputElement>) => setD(p => ({ ...p, [f]: e.target.value })), []);

  // ── Load on mount: check auth, check existing site, load templates ──
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      // If user already has a site, redirect appropriately
      const { data: existingSite } = await supabase
        .from('sites')
        .select('id, onboarded, onboarding_tour_completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingSite) {
        if (existingSite.onboarded && existingSite.onboarding_tour_completed) {
          router.push('/dashboard');
        } else if (existingSite.onboarded && !existingSite.onboarding_tour_completed) {
          // Site created but tour not done — go to customizer with tour
          router.push(`/customize/${existingSite.id}?tour=true`);
        } else {
          // Site exists but not onboarded — go to customizer with tour
          router.push(`/customize/${existingSite.id}?tour=true`);
        }
        return;
      }

      // New user — load templates
      const { data: tplData } = await supabase
        .from('templates')
        .select('*')
        .order('name');
      if (tplData) {
        setTemplates(tplData);
        if (tplData.length > 0) setSelectedTemplateId(tplData[0].id);
      }
      setLoading(false);
    }
    init();
  }, []);

  // ── Slug generator ──
  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  // ── Create site + save business info + redirect to customizer ──
  const createSiteAndRedirect = async () => {
    setCreating(true);
    setError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const slug = generateSlug(d.businessName);

      // 1. Create site
      const { data: newSite, error: siteError } = await supabase
        .from('sites')
        .insert({
          user_id: user.id,
          site_name: d.businessName,
          slug,
          template_id: selectedTemplateId,
          subscription_tier: 'base',
          deployment_status: 'draft',
          published: false,
          onboarded: true,
          onboarding_tour_completed: false,
        })
        .select()
        .single();

      if (siteError) throw new Error(siteError.message);
      if (!newSite) throw new Error('Site creation failed');

      // 2. Save business info to site_content
      const contentRecords: { site_id: string; field_key: string; value: string; field_type: string }[] = [];
      const add = (key: string, val: string) => {
        if (val?.trim()) contentRecords.push({ site_id: newSite.id, field_key: key, value: val.trim(), field_type: 'text' });
      };

      add('businessInfo.businessName', d.businessName);
      add('businessInfo.phone', d.phone);
      add('businessInfo.email', d.email);
      add('businessInfo.address', d.address);
      add('businessInfo.city', d.city);
      add('businessInfo.state', d.state);
      add('businessInfo.zip', d.zip);

      if (contentRecords.length > 0) {
        const { error: contentErr } = await supabase
          .from('site_content')
          .upsert(contentRecords, { onConflict: 'site_id,field_key' });
        if (contentErr) throw new Error(`Content save failed: ${contentErr.message}`);
      }

      // 3. Save addon selections to site_features
      const addonMap: Record<string, boolean> = {
        inventory_sync: d.addonInventory,
        service_scheduling: d.addonServiceScheduling,
        rental_scheduling: d.addonRentalScheduling,
      };
      for (const [featureKey, enabled] of Object.entries(addonMap)) {
        if (enabled) {
          await supabase.from('site_features').upsert({
            site_id: newSite.id, feature_key: featureKey, enabled: true,
          }, { onConflict: 'site_id,feature_key' });
        }
      }

      // 4. If addons selected, upgrade tier to professional
      if (addonsCount > 0) {
        await supabase.from('sites').update({ subscription_tier: 'professional' }).eq('id', newSite.id);
      }

      // 5. Redirect to customizer with tour mode
      router.push(`/customize/${newSite.id}?tour=true`);

    } catch (err: any) {
      setError(err.message);
      setCreating(false);
    }
  };

  const addonsCount = [d.addonInventory, d.addonServiceScheduling, d.addonRentalScheduling].filter(Boolean).length;
  const addonsTotal = addonsCount === 3 ? 230 : addonsCount === 2 ? 175 : addonsCount === 1 ? 100 : 0;
  const addonsSavings = addonsCount === 3 ? 70 : addonsCount === 2 ? 25 : 0;
  const up = useCallback((f: Record<string, any>) => setD(p => ({ ...p, ...f })), []);

  // ── Loading state ──
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: FM.dark, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <FMLogo size="lg" />
          <p style={{ color: FM.muted, marginTop: 24, fontSize: '1.125rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const STEPS = [
    { id: 'welcome', label: 'Welcome' },
    { id: 'business', label: 'Business Info' },
    { id: 'template', label: 'Template' },
    { id: 'addons', label: 'Add-Ons' },
  ];

  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return d.businessName.trim().length > 0;
    if (step === 2) return !!selectedTemplateId;
    if (step === 3) return true; // add-ons are optional
    return false;
  };

  const handleNext = () => {
    if (step === 3) {
      createSiteAndRedirect();
    } else {
      setStep(s => s + 1);
    }
  };

  // ===========================================
  // RENDER
  // ===========================================
  return (
    <div style={{ minHeight: '100vh', background: FM.dark, color: FM.light, fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header */}
      <header style={{ padding: '1.25rem 2rem', borderBottom: `1px solid ${FM.borderMuted}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FMLogo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700,
                background: i < step ? FM.orange : i === step ? FM.navyLight : FM.card,
                color: i <= step ? 'white' : FM.muted,
                border: i === step ? `2px solid ${FM.orange}` : '2px solid transparent',
                transition: 'all 0.3s',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: '0.8125rem', fontWeight: i === step ? 600 : 400,
                color: i <= step ? FM.light : FM.muted,
              }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 2rem' }}>

        {/* ─── Step 0: Welcome ─── */}
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 40 }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
                Welcome to <span style={{ color: FM.orange }}>Fleet Market</span>
              </h1>
              <p style={{ fontSize: '1.25rem', color: FM.text, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
                Let's get your equipment dealership online. We'll collect your business info, you'll pick a template, and then you can customize everything live in the editor.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 48 }}>
              {[
                { num: '1', title: 'Business Info', desc: 'Name, contact details, and location' },
                { num: '2', title: 'Pick a Template', desc: "Choose your site's look and feel" },
                { num: '3', title: 'Customize Live', desc: 'Edit every section with a live preview' },
              ].map(item => (
                <div key={item.num} style={{ background: FM.card, border: `1px solid ${FM.border}`, borderRadius: 12, padding: '1.5rem', textAlign: 'left' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: FM.orangeGlow, color: FM.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', marginBottom: 12 }}>
                    {item.num}
                  </div>
                  <h3 style={{ fontWeight: 700, color: 'white', marginBottom: 4, fontSize: '1rem' }}>{item.title}</h3>
                  <p style={{ color: FM.muted, fontSize: '0.875rem', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              style={{
                padding: '1rem 3rem', background: FM.orange, color: 'white', border: 'none', borderRadius: 10,
                fontSize: '1.125rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em',
                boxShadow: `0 4px 20px ${FM.orangeGlow}`, transition: 'all 0.2s',
              }}
            >
              Get Started →
            </button>
          </div>
        )}

        {/* ─── Step 1: Business Info ─── */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: 8 }}>
              Tell us about your business
            </h2>
            <p style={{ color: FM.text, marginBottom: 32, fontSize: '1rem', lineHeight: 1.6 }}>
              This info will populate your site's header, footer, and contact page. You can always change it later in the editor.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Business Name */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: FM.light, marginBottom: 6 }}>
                  Business Name <span style={{ color: FM.orange }}>*</span>
                </label>
                <input
                  type="text" value={d.businessName} onChange={ch('businessName')}
                  placeholder="e.g. Smith's Outdoor Power Equipment"
                  style={{
                    width: '100%', padding: '0.75rem 1rem', background: FM.card, border: `1px solid ${FM.border}`,
                    borderRadius: 8, color: 'white', fontSize: '1rem', outline: 'none',
                  }}
                  autoFocus
                />
              </div>

              {/* Phone + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: FM.light, marginBottom: 6 }}>Phone</label>
                  <input
                    type="tel" value={d.phone} onChange={ch('phone')} placeholder="(555) 123-4567"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: FM.card, border: `1px solid ${FM.border}`, borderRadius: 8, color: 'white', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: FM.light, marginBottom: 6 }}>Email</label>
                  <input
                    type="email" value={d.email} onChange={ch('email')} placeholder="info@yourbusiness.com"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: FM.card, border: `1px solid ${FM.border}`, borderRadius: 8, color: 'white', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: FM.light, marginBottom: 6 }}>Street Address</label>
                <input
                  type="text" value={d.address} onChange={ch('address')} placeholder="1234 Main Street"
                  style={{ width: '100%', padding: '0.75rem 1rem', background: FM.card, border: `1px solid ${FM.border}`, borderRadius: 8, color: 'white', fontSize: '1rem', outline: 'none' }}
                />
              </div>

              {/* City, State, Zip */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: FM.light, marginBottom: 6 }}>City</label>
                  <input
                    type="text" value={d.city} onChange={ch('city')} placeholder="Springfield"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: FM.card, border: `1px solid ${FM.border}`, borderRadius: 8, color: 'white', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: FM.light, marginBottom: 6 }}>State</label>
                  <input
                    type="text" value={d.state} onChange={ch('state')} placeholder="IL" maxLength={2}
                    style={{ width: '100%', padding: '0.75rem 1rem', background: FM.card, border: `1px solid ${FM.border}`, borderRadius: 8, color: 'white', fontSize: '1rem', outline: 'none', textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: FM.light, marginBottom: 6 }}>Zip</label>
                  <input
                    type="text" value={d.zip} onChange={ch('zip')} placeholder="62704"
                    style={{ width: '100%', padding: '0.75rem 1rem', background: FM.card, border: `1px solid ${FM.border}`, borderRadius: 8, color: 'white', fontSize: '1rem', outline: 'none' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 2: Template Selection ─── */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: 8 }}>
              Choose your template
            </h2>
            <p style={{ color: FM.text, marginBottom: 32, fontSize: '1rem', lineHeight: 1.6 }}>
              Pick the look that fits your brand. You can customize colors, content, and layout once you're in the editor.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {templates.map(tpl => {
                const desc = TEMPLATE_DESCRIPTIONS[tpl.slug];
                const isSelected = selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    style={{
                      background: isSelected ? FM.navyLight : FM.card,
                      border: isSelected ? `2px solid ${FM.orange}` : `1px solid ${FM.border}`,
                      borderRadius: 12, padding: 0, cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.2s', overflow: 'hidden',
                      boxShadow: isSelected ? `0 0 20px ${FM.orangeGlow}` : 'none',
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      height: 140, background: FM.navyDark, position: 'relative', overflow: 'hidden',
                      borderBottom: `1px solid ${isSelected ? FM.orange : FM.border}`,
                    }}>
                      {tpl.thumbnail_url ? (
                        <img src={tpl.thumbnail_url} alt={tpl.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: FM.muted, fontSize: '0.875rem' }}>
                          Preview
                        </div>
                      )}
                      {isSelected && (
                        <div style={{
                          position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%',
                          background: FM.orange, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontWeight: 700, fontSize: '0.875rem',
                        }}>✓</div>
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ padding: '1rem' }}>
                      <h3 style={{ fontWeight: 700, color: 'white', fontSize: '1rem', marginBottom: 4 }}>{tpl.name}</h3>
                      <p style={{ color: FM.orange, fontSize: '0.8125rem', fontWeight: 600, marginBottom: 4 }}>{desc?.tagline || ''}</p>
                      <p style={{ color: FM.muted, fontSize: '0.8125rem', lineHeight: 1.4 }}>{desc?.style || tpl.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Step 3: Premium Add-Ons ─── */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', marginBottom: 8 }}>
              Premium Add-Ons
            </h2>
            <p style={{ color: FM.text, marginBottom: 8, fontSize: '1rem', lineHeight: 1.6 }}>
              Supercharge your site with powerful features. These are optional — you can always add them later.
            </p>
            <p style={{ color: FM.muted, fontSize: '0.8125rem', marginBottom: 28 }}>
              $100/mo each, or bundle and save: 2 for <strong style={{ color: FM.orange }}>$175/mo</strong>, all 3 for <strong style={{ color: FM.orange }}>$230/mo</strong>.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {PREMIUM_ADDONS.map(a => {
                const on = d[a.stateKey as keyof typeof d] as boolean;
                return (
                  <div
                    key={a.id}
                    onClick={() => up({ [a.stateKey]: !on })}
                    style={{
                      padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s',
                      background: on ? FM.orangeGlow : FM.card,
                      border: `2px solid ${on ? FM.orange : FM.borderMuted}`,
                      borderRadius: 14,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                      <div>
                        <div style={{ color: 'white', fontWeight: 700, fontSize: '1.0625rem' }}>{a.name}</div>
                        <div style={{ color: FM.orange, fontWeight: 700, fontSize: '0.875rem', marginTop: 2 }}>{a.price}</div>
                      </div>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        border: `2px solid ${on ? FM.orange : FM.borderMuted}`,
                        background: on ? FM.orange : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.875rem', fontWeight: 700,
                      }}>
                        {on && '✓'}
                      </div>
                    </div>
                    <p style={{ color: FM.text, fontSize: '0.8125rem', lineHeight: 1.5, marginBottom: 10 }}>{a.desc}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {a.features.map((f, i) => (
                        <span key={i} style={{
                          padding: '0.25rem 0.625rem', borderRadius: 6, fontSize: '0.6875rem', fontWeight: 500,
                          background: on ? 'rgba(232,85,37,0.12)' : 'rgba(30,58,110,0.5)',
                          color: on ? FM.orangeLight : FM.text,
                        }}>{f}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {addonsCount > 0 && (
              <div style={{
                marginTop: 16, padding: '0.875rem 1.25rem', borderRadius: 12,
                background: `linear-gradient(135deg, ${FM.navy}, ${FM.navyLight})`,
                border: `1px solid ${FM.orange}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9375rem' }}>
                    {addonsCount} add-on{addonsCount > 1 ? 's' : ''} selected
                  </span>
                  {addonsSavings > 0 && (
                    <span style={{ color: FM.orangeLight, fontSize: '0.8125rem', marginLeft: 8 }}>
                      Bundle saves ${addonsSavings}/mo
                    </span>
                  )}
                </div>
                <span style={{ color: FM.orange, fontWeight: 700, fontSize: '1.125rem' }}>+${addonsTotal}/mo</span>
              </div>
            )}
          </div>
        )}

        {/* ─── Error display ─── */}
        {error && (
          <div style={{ marginTop: 20, padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* ─── Navigation Buttons ─── */}
        {step > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 }}>
            <button
              onClick={() => setStep(s => s - 1)}
              style={{
                padding: '0.75rem 1.5rem', background: 'transparent', border: `1px solid ${FM.border}`,
                borderRadius: 8, color: FM.text, fontSize: '0.9375rem', cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed() || creating}
              style={{
                padding: '0.75rem 2rem', background: canProceed() ? FM.orange : FM.borderMuted,
                border: 'none', borderRadius: 8, color: 'white', fontSize: '0.9375rem', fontWeight: 700,
                cursor: canProceed() && !creating ? 'pointer' : 'not-allowed',
                opacity: canProceed() && !creating ? 1 : 0.6,
                boxShadow: canProceed() ? `0 4px 16px ${FM.orangeGlow}` : 'none',
                transition: 'all 0.2s',
              }}
            >
              {creating ? 'Creating your site...' : step === 3 ? 'Create Site & Start Editing →' : 'Continue →'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
