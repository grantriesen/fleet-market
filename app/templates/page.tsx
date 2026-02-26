'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ============================================
// Template metadata — matched to DEMO_OVERRIDES in route.ts
// ============================================
const TEMPLATES = [
  {
    slug: 'corporate-edge',
    name: 'Corporate Edge',
    description: 'Professional navy & red design with bold typography. Built for established dealerships that want authority and trust.',
    tags: ['Professional', 'Bold', 'Stats Bar'],
    vibe: 'Authoritative',
  },
  {
    slug: 'green-valley-industrial',
    name: 'Green Valley Industrial',
    description: 'Earthy greens and vibrant orange. A natural, grounded feel for dealers who emphasize reliability and outdoor expertise.',
    tags: ['Industrial', 'Organic', 'Split Hero'],
    vibe: 'Grounded',
  },
  {
    slug: 'modern-lawn-solutions',
    name: 'Modern Lawn Solutions',
    description: 'Clean blue gradients with a friendly, modern feel. Great for dealers who want approachable yet professional.',
    tags: ['Modern', 'Friendly', 'Rounded Cards'],
    vibe: 'Approachable',
  },
  {
    slug: 'vibe-dynamics',
    name: 'Vibe Dynamics',
    description: 'Dark mode with purple-pink gradients and glow effects. A forward-thinking design for tech-savvy dealers.',
    tags: ['Dark Mode', 'Edgy', 'Glow Effects'],
    vibe: 'Futuristic',
  },
  {
    slug: 'zenith-lawn',
    name: 'Zenith Lawn',
    description: 'Minimalist luxury with black and amber accents. Serif typography for premium, high-end dealerships.',
    tags: ['Luxury', 'Minimal', 'Serif Type'],
    vibe: 'Premium',
  },
  {
    slug: 'warm-earth-designs',
    name: 'Warm Earth Designs',
    description: 'Warm amber and earth tones with friendly typography. Perfect for family-owned dealers with deep community ties.',
    tags: ['Warm', 'Family', 'Community'],
    vibe: 'Welcoming',
  },
];

const FM = {
  navy: '#0B1B3D',
  navyLight: '#132B5B',
  orange: '#E8472F',
  card: '#0F2341',
  border: '#1C3A6B',
  text: '#94A3B8',
  muted: '#64748B',
  light: '#E2E8F0',
};

export default function TemplatesGalleryPage() {
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState<string>('home');

  // Load Inter font via JS to avoid SSR hydration mismatch with style tag quotes
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const pages = [
    { key: 'home', label: 'Home' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'service', label: 'Service' },
    { key: 'rentals', label: 'Rentals' },
    { key: 'manufacturers', label: 'Manufacturers' },
    { key: 'contact', label: 'Contact' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: FM.navy, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 2rem', borderBottom: `1px solid ${FM.border}`,
        position: 'sticky', top: 0, zIndex: 50, background: FM.navy,
        backdropFilter: 'blur(12px)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `linear-gradient(135deg, ${FM.orange}, #FF6B4A)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '0.875rem', color: 'white',
          }}>FM</div>
          <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'white' }}>Fleet Market</span>
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/login" style={{
            color: FM.text, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
          }}>Sign In</Link>
          <Link href="/register" style={{
            background: FM.orange, color: 'white', padding: '0.5rem 1.25rem',
            borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.875rem',
            fontWeight: 600, transition: 'opacity 0.2s',
          }}>Get Started</Link>
        </div>
      </nav>

      {/* Header */}
      <header style={{ textAlign: 'center', padding: '4rem 2rem 2rem' }}>
        <h1 style={{
          fontSize: '3rem', fontWeight: 900, color: 'white',
          lineHeight: 1.1, marginBottom: '1rem',
          letterSpacing: '-0.02em',
        }}>
          Template <span style={{ color: FM.orange }}>Gallery</span>
        </h1>
        <p style={{
          fontSize: '1.125rem', color: FM.text, maxWidth: 560,
          margin: '0 auto', lineHeight: 1.6,
        }}>
          Six professionally designed templates built for equipment dealers. 
          Every template is fully customizable — colors, fonts, content, and layout.
        </p>
      </header>

      {/* Expanded Full Preview */}
      {expandedSlug && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Top bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 1.5rem', background: FM.navy,
            borderBottom: `1px solid ${FM.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
                {TEMPLATES.find(t => t.slug === expandedSlug)?.name}
              </h3>
              {/* Page Tabs */}
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {pages.map(p => (
                  <button
                    key={p.key}
                    onClick={() => setPreviewPage(p.key)}
                    style={{
                      padding: '0.375rem 0.75rem', borderRadius: '0.375rem',
                      fontSize: '0.8125rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                      background: previewPage === p.key ? FM.orange : 'transparent',
                      color: previewPage === p.key ? 'white' : FM.text,
                      transition: 'all 0.15s',
                    }}
                  >{p.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link href="/register" style={{
                background: FM.orange, color: 'white', padding: '0.4rem 1rem',
                borderRadius: '0.375rem', textDecoration: 'none', fontSize: '0.8125rem',
                fontWeight: 600,
              }}>Use This Template</Link>
              <button
                onClick={() => { setExpandedSlug(null); setPreviewPage('home'); }}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: `1px solid ${FM.border}`,
                  background: FM.card, color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.125rem',
                }}
              >✕</button>
            </div>
          </div>
          {/* Iframe */}
          <div style={{ flex: 1, position: 'relative' }}>
            <iframe
              src={`/api/preview/demo-${expandedSlug}?page=${previewPage}`}
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none',
              }}
            />
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem 4rem',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '1.5rem',
      }}>
        {TEMPLATES.map(t => (
          <div
            key={t.slug}
            style={{
              background: FM.card, borderRadius: '1rem', overflow: 'hidden',
              border: `1px solid ${FM.border}`,
              transition: 'transform 0.2s, border-color 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLDivElement).style.borderColor = FM.orange;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.borderColor = FM.border;
            }}
            onClick={() => setExpandedSlug(t.slug)}
          >
            {/* Preview Iframe (scaled down) */}
            <div style={{
              height: 240, position: 'relative', overflow: 'hidden',
              background: '#0a0a0a',
            }}>
              <iframe
                src={`/api/preview/demo-${t.slug}`}
                loading="lazy"
                style={{
                  width: '200%', height: '200%',
                  transform: 'scale(0.5)', transformOrigin: 'top left',
                  border: 'none', pointerEvents: 'none',
                }}
                title={`${t.name} preview`}
              />
              {/* Hover overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(15,35,65,0.9) 0%, transparent 50%)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                padding: '1.25rem', opacity: 0, transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
              >
                <span style={{
                  background: FM.orange, color: 'white', padding: '0.5rem 1.25rem',
                  borderRadius: '0.5rem', fontWeight: 600, fontSize: '0.875rem',
                }}>View Full Preview →</span>
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.0625rem', margin: 0 }}>{t.name}</h3>
                <span style={{
                  fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px',
                  borderRadius: 4, background: 'rgba(232,71,47,0.12)', color: FM.orange,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>{t.vibe}</span>
              </div>
              <p style={{
                color: FM.text, fontSize: '0.8125rem', lineHeight: 1.5,
                margin: '0 0 0.75rem',
              }}>{t.description}</p>
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                {t.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: '0.6875rem', fontWeight: 600, padding: '3px 8px',
                    borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.03em',
                    background: 'rgba(99,102,241,0.12)', color: '#818cf8',
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div style={{
        textAlign: 'center', padding: '3rem 2rem 5rem',
        borderTop: `1px solid ${FM.border}`,
      }}>
        <h2 style={{ color: 'white', fontWeight: 800, fontSize: '1.75rem', marginBottom: '0.75rem' }}>
          Ready to build your dealer website?
        </h2>
        <p style={{ color: FM.text, fontSize: '1rem', marginBottom: '1.5rem' }}>
          Pick a template, customize it, and go live — all in under 30 minutes.
        </p>
        <Link href="/register" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: FM.orange, color: 'white', padding: '0.875rem 2rem',
          borderRadius: '0.625rem', textDecoration: 'none',
          fontWeight: 700, fontSize: '1rem',
          boxShadow: '0 4px 24px rgba(232,71,47,0.3)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}>
          Get Started →
        </Link>
      </div>
    </div>
  );
}
