import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { renderGreenValleyPage } from './templates/green-valley-industrial';
import { renderVibeDynamicsPage } from './templates/vibe-dynamics';
import { renderCorporateEdgePage } from './templates/corporate-edge';

// ── Brand Logos (place in public/images/logos/) ──
const BRAND_LOGOS: Record<string, string> = {
  'Toro':       '/images/logos/toro.png',
  'John Deere': '/images/logos/john-deere.png',
  'Exmark':     '/images/logos/exmark.png',
  'Stihl':      '/images/logos/stihl.png',
  'STIHL':      '/images/logos/stihl.png',
  'Husqvarna':  '/images/logos/husqvarna.png',
  'Kubota':     '/images/logos/kubota.jpg',
  'Scag':       '/images/logos/scag.png',
  'Echo':       '/images/logos/echo.png',
  'ECHO':       '/images/logos/echo.png',
  'Honda':      '/images/logos/honda.png',
  'Bobcat':     '/images/logos/bobcat.png',
  'Ventrac':    '/images/logos/ventrac.png',
  'Walker':     '/images/logos/walker.avif',
  'EGO':        '/images/logos/ego.png',
  'Cub Cadet':  '/images/logos/cub-cadet.png',
};
function getBrandLogo(name: string): string | null { return BRAND_LOGOS[name] || null; }
import { renderZenithLawnPage } from './templates/zenith-lawn';
import { renderModernLawnPage } from './templates/modern-lawn-solutions';
import { renderWarmEarthPage } from './templates/warm-earth-designs';

// CORS preflight for demo previews (used by beta landing page)
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'home';
    
    // ============================================
    // DEMO MODE — for template previews
    // Loads the real template config_json from DB
    // and uses its defaults for content
    // ============================================
    if (params.siteId.startsWith('demo-')) {
      const templateSlug = params.siteId.replace('demo-', '');
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: { get() { return undefined; }, set() {}, remove() {} },
          auth: { persistSession: false, autoRefreshToken: false },
        }
      );

      // Load real template from DB
      const { data: template } = await supabase
        .from('templates')
        .select('name, slug, config_json')
        .eq('slug', templateSlug)
        .single();

      if (!template) {
        return new NextResponse('Demo template not found', { status: 404 });
      }

      // Get demo-specific overrides (business name, etc.)
      const demoOverrides = DEMO_OVERRIDES[templateSlug] || {};

      // Build fake site object
      const site = {
        id: `demo-${templateSlug}`,
        site_name: demoOverrides.businessName || 'Demo Dealer',
        slug: templateSlug,
        subscription_tier: 'full', // show all pages in demo
        template: template,
      };

      // Build content from overrides — getContent will fallback to config_json defaults
      const content: Record<string, string> = {
        'businessInfo.businessName': demoOverrides.businessName || 'Demo Equipment Co.',
        'businessInfo.phone': demoOverrides.phone || '(555) 123-4567',
        'businessInfo.email': demoOverrides.email || 'info@demoequip.com',
        'businessInfo.address': demoOverrides.address || '123 Main St',
        ...(demoOverrides.extraContent || {}),
      };

      // Build demo manufacturers with brand logos
      const mfgNames = demoOverrides.manufacturers || ['Toro', 'Exmark', 'Stihl', 'Honda', 'Husqvarna', 'Kubota'];
      const manufacturers = mfgNames.map((name: string, i: number) => ({
        id: `demo-mfg-${i}`, name, logo_url: getBrandLogo(name), website_url: null,
        description: `Authorized ${name} dealer`, display_order: i,
      }));

      // Colors from overrides or let generateTemplateHTML use config defaults
      const customizations: any = demoOverrides.colors ? {
        colors: demoOverrides.colors,
      } : {};

      const sectionVisibility: Record<string, boolean> = {
        hero: true, trustBadges: true, stats: true, services: true,
        featured: true, manufacturers: true, cta: true, testimonials: true,
      };

      const pageVisibility: Record<string, boolean> = {
        index: true, service: true, inventory: true,
        rentals: true, manufacturers: true, contact: true,
      };

      const demoHtml = await generateTemplateHTML(
        site, content, customizations, manufacturers,
        sectionVisibility, pageVisibility, page,
        supabase, // pass supabase for sub-pages (will return empty results for demo siteId)
        demoOverrides.sampleProducts || []
      );
      return new NextResponse(demoHtml, { headers: { 'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*', 'X-Frame-Options': 'ALLOWALL' } });
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get() { return undefined; },
          set() {},
          remove() {},
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Load site data with subscription_tier
    const { data: site } = await supabase
      .from('sites')
      .select(`
        id,
        site_name,
        slug,
        subscription_tier,
        template:templates (
          name,
          slug,
          config_json
        )
      `)
      .eq('id', params.siteId)
      .single();

    if (!site) {
      return new NextResponse('Site not found', { status: 404 });
    }

    // Load site content
    const { data: contentData } = await supabase
      .from('site_content')
      .select('field_key, value')
      .eq('site_id', params.siteId);

    const content: Record<string, string> = {};
    contentData?.forEach((item) => {
      content[item.field_key] = item.value || '';
    });

    // Load customizations
    const { data: customData } = await supabase
      .from('site_customizations')
      .select('customization_type, config_json')
      .eq('site_id', params.siteId);

    const customizations: any = {};
    customData?.forEach((item) => {
      customizations[item.customization_type] = item.config_json;
    });

    // Get section visibility and page visibility settings
    const sectionVisibility = customizations.section_visibility || {};
    const pageVisibility = customizations.page_visibility || {};
    
    // Default premium sections to hidden for basic tier if not explicitly set
    if (site.subscription_tier === 'basic' || !site.subscription_tier) {
      if (sectionVisibility.featured === undefined) {
        sectionVisibility.featured = false;
      }
    }

    // Load manufacturers
    const { data: manufacturers } = await supabase
      .from('manufacturers')
      .select('*')
      .eq('site_id', params.siteId)
      .order('display_order');

    // Load featured inventory items
    const { data: featuredItems } = await supabase
      .from('inventory_items')
      .select('id, title, description, category, condition, price, sale_price, model, year, primary_image, slug, featured, status')
      .eq('site_id', params.siteId)
      .eq('featured', true)
      .eq('status', 'available')
      .order('display_order')
      .limit(8);

    // Generate HTML based on template
    const html = await generateTemplateHTML(
      site, 
      content, 
      customizations, 
      manufacturers || [], 
      sectionVisibility,
      pageVisibility,
      page,
      supabase,
      featuredItems || []
    );

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    console.error('Preview error:', error);
    console.error('Stack:', error?.stack);
    return new NextResponse(`Preview generation failed: ${error?.message || 'Unknown error'}`, { status: 500 });
  }
}

async function generateTemplateHTML(
  site: any,
  content: Record<string, string>,
  customizations: any,
  manufacturers: any[],
  sectionVisibility: Record<string, boolean>,
  pageVisibility: Record<string, boolean>,
  page: string,
  supabase: any,
  featuredItems: any[]
): Promise<string> {
  const template = site.template;
  const config = template.config_json;
  const templateSlug = template.slug;
  const siteId = site.id;
  
  // Helper to get content value
  const getContent = (key: string) => {
    if (content[key]) return content[key];
    
    // Try to get default from config
    const parts = key.split('.');
    if (parts.length === 2) {
      const [section, field] = parts;
      return config.sections?.[section]?.[field]?.default || '';
    }
    return '';
  };

  // Helper to format price
  const fmtPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'Call for Price';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  };

  // Build featured products array — real items or placeholders
  const displayProducts = featuredItems.length > 0
    ? featuredItems.slice(0, 4)
    : [1, 2, 3, 4].map(i => ({
        id: `placeholder-${i}`,
        title: `Featured Product ${i}`,
        description: 'Professional-grade equipment',
        price: null,
        sale_price: null,
        primary_image: null,
        model: null,
        year: null,
        category: 'Equipment',
        condition: 'new',
        slug: null,
      }));

  const isRealProducts = featuredItems.length > 0;

  // Get colors
  const colors = {
    primary: customizations.colors?.primary || config.colors?.primary?.default || '#2D5016',
    secondary: customizations.colors?.secondary || config.colors?.secondary?.default || '#F97316',
    accent: customizations.colors?.accent || config.colors?.accent?.default || '#059669',
  };

  // Get fonts
  const fonts = {
    heading: customizations.fonts?.heading || config.fonts?.heading?.default || 'Inter',
    body: customizations.fonts?.body || config.fonts?.body?.default || 'Inter',
  };

  // Get available pages
  const availablePages = (config.pages || []).filter((p: any) => {
    const isVisible = pageVisibility[p.slug] !== false;
    if (!isVisible) return false;
    if (!p.premium) return true;
    return site.subscription_tier !== 'basic';
  });

  // Build Google Fonts URL
  const fontFamilies = new Set([fonts.heading, fonts.body]);
  const googleFontsUrl = Array.from(fontFamilies)
    .map(font => `family=${font.replace(' ', '+')}:wght@300;400;500;600;700;800;900`)
    .join('&');

// ── Green Valley Industrial: Full custom layout ──
  // This template owns its own <head>, header, footer, and all page renderers.
  // It early-returns here, bypassing the shared nav/footer below.
  if (templateSlug === 'green-valley-industrial') {
    return await renderGreenValleyPage(
      getContent,
      colors,
      fonts,
      manufacturers,
      sectionVisibility,
      siteId,
      site.site_name,
      displayProducts,
      isRealProducts,
      fmtPrice,
      availablePages,
      page,
      googleFontsUrl,
      supabase
    );
  }

  // ── Vibe Dynamics: Full custom layout ──
  if (templateSlug === 'vibe-dynamics') {
    return await renderVibeDynamicsPage(
      getContent,
      colors,
      fonts,
      manufacturers,
      sectionVisibility,
      siteId,
      site.site_name,
      displayProducts,
      isRealProducts,
      fmtPrice,
      availablePages,
      page,
      googleFontsUrl,
      supabase
    );
  }

  // ── Corporate Edge: Full custom layout ──
  if (templateSlug === 'corporate-edge') {
    const ceVis: Record<string, boolean> = {};
    Object.entries(sectionVisibility).forEach(([k, v]) => { ceVis[k] = v as boolean; });
    const ceEnabledFeatures = new Set<string>();
    try {
      const { data: features } = await supabase
        .from('site_features').select('feature_key').eq('site_id', site.id).eq('is_enabled', true);
      if (features) features.forEach((f: any) => ceEnabledFeatures.add(f.feature_key));
    } catch {}
    return renderCorporateEdgePage(
      siteId,
      page,
      availablePages,
      displayProducts,
      config,
      customizations,
      ceEnabledFeatures,
      ceVis,
    );
  }

  // ── Zenith Lawn: Full custom layout ──
  if (templateSlug === 'zenith-lawn') {
    const zlVis: Record<string, boolean> = {};
    Object.entries(sectionVisibility).forEach(([k, v]) => { zlVis[k] = v as boolean; });
    const zlFeatures = new Set<string>();
    try {
      const { data: features } = await supabase
        .from('site_features').select('feature_key').eq('site_id', site.id).eq('is_enabled', true);
      if (features) features.forEach((f: any) => zlFeatures.add(f.feature_key));
    } catch {}
    return renderZenithLawnPage(
      siteId, page, availablePages, displayProducts,
      config, customizations, zlFeatures, zlVis,
    );
  }

  if (templateSlug === 'modern-lawn-solutions') {
    const mlsVis: Record<string, boolean> = {};
    Object.entries(sectionVisibility).forEach(([k, v]) => { mlsVis[k] = v as boolean; });
    const mlsFeatures = new Set<string>();
    try {
      const { data: features } = await supabase
        .from('site_features').select('feature_key').eq('site_id', site.id).eq('is_enabled', true);
      if (features) features.forEach((f: any) => mlsFeatures.add(f.feature_key));
    } catch {}
    return renderModernLawnPage(
      siteId, page, availablePages, displayProducts,
      config, customizations, mlsFeatures, mlsVis, content,
    );
  }

  if (templateSlug === 'warm-earth-designs') {
    const weVis: Record<string, boolean> = {};
    Object.entries(sectionVisibility).forEach(([k, v]) => { weVis[k] = v as boolean; });
    const weFeatures = new Set<string>();
    try {
      const { data: features } = await supabase
        .from('site_features').select('feature_key').eq('site_id', site.id).eq('is_enabled', true);
      if (features) features.forEach((f: any) => weFeatures.add(f.feature_key));
    } catch {}
    return renderWarmEarthPage(
      siteId, page, availablePages, displayProducts,
      config, customizations, weFeatures, weVis, content,
    );
  }

 // Route to template-specific renderer
  // Note: All 6 standalone templates (GVI, Vibe, CE, Zenith, MLS, WE) 
  // early-return above. This section only runs for unknown/future templates.
  let pageContent = '';
  
  if (page === 'home' || page === 'index') {
    pageContent = renderGenericHome(getContent, colors, manufacturers, sectionVisibility, siteId, displayProducts, isRealProducts, fmtPrice);
  } else if (page === 'manufacturers') {
    pageContent = renderManufacturersPageContent(config, getContent, colors, manufacturers, templateSlug);
  } else if (page === 'contact') {
    pageContent = renderContactPageContent(config, getContent, colors, templateSlug);
  } else if (page === 'service') {
    pageContent = await renderServicePageWithIntegration(site.id, config, getContent, colors, supabase, templateSlug);
  } else if (page === 'inventory') {
    if (site.subscription_tier === 'basic') {
      pageContent = renderPremiumPlaceholder('Inventory', config, getContent, colors);
    } else {
      pageContent = await renderInventoryPageWithIntegration(site.id, config, getContent, colors, supabase);
    }
  } else if (page === 'rentals') {
    pageContent = await renderRentalsPageWithIntegration(site.id, config, getContent, colors, supabase);
  } else {
    pageContent = renderGenericHome(getContent, colors, manufacturers, sectionVisibility, siteId, displayProducts, isRealProducts, fmtPrice);
  }

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${site.site_name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?${googleFontsUrl}&display=swap" rel="stylesheet">
  <style>
    :root {
      --color-primary: ${colors.primary};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
      --font-heading: '${fonts.heading}', sans-serif;
      --font-body: '${fonts.body}', sans-serif;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html {
      scroll-behavior: smooth;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    body {
      font-family: var(--font-body);
      color: #1f2937;
      line-height: 1.7;
      font-size: 1rem;
      background-color: #ffffff;
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-heading);
      font-weight: 700;
      line-height: 1.15;
    }

    img {
      max-width: 100%;
      height: auto;
    }

    a {
      transition: opacity 0.2s ease, color 0.2s ease;
    }

    a:hover {
      opacity: 0.85;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    @media (max-width: 768px) {
      .container { padding: 0 1.25rem; }
      [style*="grid-template-columns: 1fr 1fr"],
      [style*="grid-template-columns:1fr 1fr"] { grid-template-columns: 1fr !important; }
      [style*="grid-template-columns: 2fr 1fr"],
      [style*="grid-template-columns:2fr 1fr"] { grid-template-columns: 1fr !important; }
      [data-section="hero"] { min-height: auto !important; }
      [data-section="hero"][style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
      nav .container > div:last-child { display: none; }
      section h1 { font-size: 2rem !important; }
      section h2 { font-size: 1.5rem !important; }
      [style*="font-size: 3rem"] { font-size: 2rem !important; }
      [style*="font-size: 2.5rem"] { font-size: 1.75rem !important; }
      [style*="padding: 5rem 0"] { padding: 3rem 0 !important; }
      [style*="padding: 6rem 0"] { padding: 3rem 0 !important; }
      [style*="padding: 8rem 0"] { padding: 3rem 0 !important; }
      [style*="min-height: 600px"] { min-height: auto !important; }
      [style*="min-height: 650px"] { min-height: auto !important; }
    }
    @media (max-width: 480px) {
      [style*="grid-template-columns: repeat(auto"] { grid-template-columns: 1fr !important; }
      [style*="gap: 3rem"] { gap: 1.5rem !important; }
      [style*="gap: 4rem"] { gap: 1.5rem !important; }
    }
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav style="background-color: white; box-shadow: 0 1px 2px rgba(0,0,0,0.06); position: sticky; top: 0; z-index: 50; border-bottom: 1px solid #f1f5f9;">
    <div class="container" style="display: flex; justify-content: space-between; align-items: center; padding-top: 1.25rem; padding-bottom: 1.25rem;">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        ${getContent('businessInfo.logoImage') ? 
          `<img src="${getContent('businessInfo.logoImage')}" alt="${getContent('businessInfo.businessName')}" style="max-height: 60px; max-width: 200px; object-fit: contain;">` :
          `<span style="font-size: 1.5rem; font-weight: 700; color: var(--color-primary);">${getContent('businessInfo.businessName')}</span>`
        }
      </div>
      <div style="display: flex; gap: 2.5rem; align-items: center;">
        ${availablePages.map((p: any) => `
          <a href="/api/preview/${siteId}?page=${p.slug}" style="color: ${p.slug === page || (p.slug === 'index' && (page === 'home' || page === 'index')) ? colors.primary : '#64748b'}; text-decoration: none; font-weight: ${p.slug === page || (p.slug === 'index' && (page === 'home' || page === 'index')) ? '600' : '500'}; font-size: 0.9375rem; letter-spacing: 0.01em;">
            ${p.name}
          </a>
        `).join('')}
      </div>
    </div>
  </nav>
  
  ${pageContent}

  <!-- Footer -->
  <footer style="background-color: ${colors.primary}; color: white; padding: 4rem 0 2rem;">
    <div class="container">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 3rem;">
        <div>
          <h3 style="color: white; margin-bottom: 1rem; font-size: 1.125rem;">${getContent('businessInfo.businessName')}</h3>
          <p style="color: rgba(255,255,255,0.65); font-size: 0.9375rem; line-height: 1.7;">${getContent('businessInfo.tagline')}</p>
        </div>
        <div>
          <h4 style="color: white; margin-bottom: 1rem; font-size: 0.9375rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Contact</h4>
          <p style="color: rgba(255,255,255,0.65); font-size: 0.9375rem; line-height: 2;">${getContent('businessInfo.phone')}</p>
          <p style="color: rgba(255,255,255,0.65); font-size: 0.9375rem; line-height: 2;">${getContent('businessInfo.email')}</p>
        </div>
        <div>
          <h4 style="color: white; margin-bottom: 1rem; font-size: 0.9375rem; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600;">Hours</h4>
          <p style="color: rgba(255,255,255,0.65); font-size: 0.9375rem; line-height: 2;">${getContent('hours.weekdays') || getContent('hours.hours') || 'Mon-Fri: 8am-6pm'}</p>
          <p style="color: rgba(255,255,255,0.65); font-size: 0.9375rem; line-height: 2;">${getContent('hours.saturday') || 'Sat: 9am-4pm'}</p>
          <p style="color: rgba(255,255,255,0.65); font-size: 0.9375rem; line-height: 2;">${getContent('hours.sunday') || 'Sun: Closed'}</p>
        </div>
      </div>
      <div style="margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.15); text-align: center; color: rgba(255,255,255,0.45); font-size: 0.8125rem;">
        <p>&copy; ${new Date().getFullYear()} ${getContent('businessInfo.businessName')}. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <script>
    // ── Page View Tracking ──
    (function() {
      try {
        var siteId = '${siteId}';
        var page = '${page}';
        var sessionId = sessionStorage.getItem('sf_sid');
        if (!sessionId) {
          sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
          sessionStorage.setItem('sf_sid', sessionId);
        }
        // Only track if not in customizer iframe
        var isInCustomizer = false;
        try { isInCustomizer = window.self !== window.top && document.referrer.includes('/customize'); } catch(e) {}
        if (!isInCustomizer) {
          fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteId: siteId, page: page, referrer: document.referrer, sessionId: sessionId }),
            keepalive: true
          }).catch(function() {});
        }
      } catch(e) {}
    })();

    console.log('🎨 [Preview] REALTIME UPDATES VERSION LOADED - Debug mode active');
    
    const sections = document.querySelectorAll('section[data-section]');
    let currentSection = '';

    function detectSection() {
      const scrollPos = window.scrollY + window.innerHeight / 3;
      sections.forEach((section) => {
        const sectionId = section.getAttribute('data-section');
        if (section.offsetTop <= scrollPos && section.offsetTop + section.offsetHeight > scrollPos) {
          if (currentSection !== sectionId) {
            currentSection = sectionId;
            // REMOVED: This was causing snap-back issues in customizer
            // window.parent.postMessage({ type: 'scroll', section: sectionId }, '*');
          }
        }
      });
    }

    // Simple approach: Reload iframe on any change for instant preview
    // This is fast enough and ensures accuracy
    function reloadPreview() {
      // Small delay to batch multiple rapid changes
      clearTimeout(window.reloadTimer);
      window.reloadTimer = setTimeout(() => {
        window.location.reload();
      }, 300); // 300ms debounce
    }

    // DISABLED: Scroll detection was causing snap-back issues
    // window.addEventListener('scroll', detectSection);
    
    window.addEventListener('message', (event) => {
      console.log('📨 [Preview] Received message:', event.data);
      
      if (event.data.type === 'scrollToSection') {
        const sectionId = event.data.section;
        
        // Handle scroll to top
        if (sectionId === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        
        // Map subsection config keys to template data-section IDs
        const subsectionMap = {
          '_heroHeading': null,
          '_servicesHeading': 'serviceTypes',
          '_ctaHeading': 'serviceCta',
          '_whyChooseHeading': 'whyChoose',
          '_formHeading': 'contactForm',
          '_filtersHeading': 'inventoryGrid',
          '_rentalInfoHeading': 'rentalInfo',
          '_contentHeading': 'manufacturersList',
        };
        
        let mappedId = subsectionMap[sectionId] !== undefined ? subsectionMap[sectionId] : sectionId;
        
        if (sectionId === '_heroHeading' || mappedId === null) {
          const firstSection = document.querySelector('section[data-section]');
          if (firstSection) {
            firstSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
          }
        }
        
        if (!mappedId) mappedId = sectionId;
        
        const section = document.querySelector(\`[data-section="\${mappedId}"]\`);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      
      // Handle real-time updates - reload preview
      if (event.data.type === 'updateContent' || event.data.type === 'updateColor' || event.data.type === 'updateFont') {
        console.log('[Preview] Triggering reload for:', event.data.type);
        reloadPreview();
      }
    });
    
    // DISABLED: detectSection() call removed
    // detectSection();
  </script>
</body>
</html>
  `.trim();
}

// ============================================
// TEMPLATE #2: MODERN LAWN SOLUTIONS
// ============================================
function renderModernLawnHome(
  getContent: (key: string) => string,
  colors: any,
  manufacturers: any[],
  sectionVisibility: Record<string, boolean>,
  siteId: string,
  displayProducts: any[],
  isRealProducts: boolean,
  fmtPrice: (p: number | null) => string
): string {
  let html = '';

  // Hero - Split Screen
  if (sectionVisibility.hero !== false) {
    html += `
    <section data-section="hero" style="display: grid; grid-template-columns: 1fr 1fr; min-height: 600px;">
      <!-- Left Side - Content -->
      <div style="display: flex; align-items: center; padding: 3rem; background-color: #f9fafb;">
        <div style="max-width: 500px;">
          <h1 style="font-size: 3rem; margin-bottom: 1.5rem; color: var(--color-primary); font-weight: 700;">${getContent('hero.heading')}</h1>
          <p style="font-size: 1.125rem; margin-bottom: 2rem; color: #6b7280;">${getContent('hero.subheading')}</p>
          <a href="/api/preview/${siteId}?page=contact" style="display: inline-block; background-color: var(--color-primary); color: white; padding: 1rem 2rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">${getContent('hero.ctaButton')}</a>
        </div>
      </div>
      <!-- Right Side - Image -->
      <div style="background-image: url('${getContent('hero.image')}'); background-size: cover; background-position: center;"></div>
    </section>
    `;
  }

  // Featured
  if (sectionVisibility.featured !== false) {
    html += `
    <section data-section="featured" style="padding: 5rem 0;">
      <div class="container">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--color-primary);">${getContent('featured.heading')}</h2>
          <p style="color: #6b7280; font-size: 1.125rem;">${getContent('featured.subheading')}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
          ${displayProducts.map(item => `
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden; transition: all 0.3s;">
              <div style="height: 200px; ${item.primary_image ? `background: url('${item.primary_image}') center/cover no-repeat;` : `background: linear-gradient(to bottom right, var(--color-primary), var(--color-secondary));`}"></div>
              <div style="padding: 1.5rem;">
                <h3 style="font-size: 1.125rem; margin-bottom: 0.5rem; font-weight: 600;">${item.title}</h3>
                <p style="color: #6b7280; margin-bottom: 0.5rem; font-size: 0.875rem;">${item.description || item.category || 'Modern equipment solution'}</p>
                ${isRealProducts && item.price ? `<p style="font-size: 1rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.75rem;">${fmtPrice(item.price)}</p>` : ''}
                <a href="/api/preview/${siteId}?page=inventory" style="color: var(--color-primary); text-decoration: none; font-weight: 600; font-size: 0.875rem;">View Details →</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    `;
  }

  // Manufacturers
  if (sectionVisibility.manufacturers !== false) {
    html += `
    <section data-section="manufacturers" style="padding: 5rem 0; background-color: #f9fafb;">
      <div class="container">
        <div style="text-align: center; margin-bottom: 3rem;">
          <p style="text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">${getContent('manufacturers.heading')}</p>
          <h2 style="font-size: 2rem; color: #1f2937;">${getContent('manufacturers.subheading')}</h2>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 2rem; align-items: center;">
          ${manufacturers.length > 0 ? manufacturers.map(m => `
            <div style="text-align: center; opacity: 0.7; transition: opacity 0.3s;">
              ${m.logo_url ? `<img src="${m.logo_url}" alt="${m.name}" style="max-height: 50px; margin: 0 auto; filter: grayscale(100%);">` : `<span style="font-weight: 500; color: #4b5563;">${m.name}</span>`}
            </div>
          `).join('') : '<div style="grid-column: 1 / -1; text-align: center; color: #9ca3af;">No manufacturers added</div>'}
        </div>
      </div>
    </section>
    `;
  }

  // Testimonials
  if (sectionVisibility.testimonials !== false) {
    html += `
    <section data-section="testimonials" style="padding: 5rem 0;">
      <div class="container">
        <h2 style="font-size: 2.5rem; text-align: center; margin-bottom: 3rem; color: var(--color-primary);">${getContent('testimonials.heading')}</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
          ${[1, 2, 3].map(i => `
            <div style="background: #f9fafb; padding: 2rem; border-radius: 0.75rem; border-left: 4px solid var(--color-primary);">
              <p style="font-style: italic; color: #4b5563; margin-bottom: 1.5rem; font-size: 1rem;">"Clean, modern service. Equipment is top-notch and the team is always helpful."</p>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));"></div>
                <div>
                  <p style="font-weight: 600; color: #1f2937;">Customer ${i}</p>
                  <p style="color: #6b7280; font-size: 0.875rem;">Property Owner</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    `;
  }

  // CTA
  if (sectionVisibility.cta !== false) {
    html += `
    <section data-section="cta" style="padding: 5rem 0; background-color: var(--color-primary); color: white;">
      <div class="container" style="text-align: center;">
        <h2 style="color: white; font-size: 2.5rem; margin-bottom: 1.5rem;">${getContent('cta.heading')}</h2>
        <p style="font-size: 1.125rem; margin-bottom: 2rem; color: rgba(255,255,255,0.9); max-width: 600px; margin-left: auto; margin-right: auto;">${getContent('cta.subheading')}</p>
        <a href="/api/preview/${siteId}?page=contact" style="display: inline-block; background: white; color: var(--color-primary); padding: 1rem 2.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">${getContent('cta.button')}</a>
      </div>
    </section>
    `;
  }

  return html;
}

// ============================================
// TEMPLATE #3: CORPORATE EDGE
// ============================================
function renderCorporateEdgeHome(
  getContent: (key: string) => string,
  colors: any,
  manufacturers: any[],
  sectionVisibility: Record<string, boolean>,
  subscriptionTier: string = 'basic',
  siteId: string,
  displayProducts: any[],
  isRealProducts: boolean,
  fmtPrice: (p: number | null) => string
): string {
  let html = '';

  // Hero - Use new Corporate Edge Hero with editable background
  if (sectionVisibility.hero !== false) {
    html += renderCorporateEdgeHero(getContent, colors, subscriptionTier);
  }

  // Trust Badges - Use new render function
  if (sectionVisibility.trustBadges !== false) {
    html += renderTrustBadges(getContent, colors);
  }

  // Stats Section - Use new render function
  if (sectionVisibility.stats !== false) {
    html += renderStats(getContent, colors);
  }

  // Featured
  if (sectionVisibility.featured !== false) {
    html += `
    <section data-section="featured" style="padding: 6rem 0;">
      <div class="container">
        <div style="text-align: center; margin-bottom: 3.5rem;">
          <h2 style="font-size: 2.25rem; margin-bottom: 0.75rem; color: var(--color-primary); letter-spacing: -0.02em;">${getContent('featured.heading')}</h2>
          <p style="color: #64748b; font-size: 1.0625rem; max-width: 560px; margin: 0 auto;">${getContent('featured.subheading')}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
          ${displayProducts.map(item => `
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; overflow: hidden;">
              <div style="height: 200px; ${item.primary_image ? `background: url('${item.primary_image}') center/cover no-repeat;` : `background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));`}"></div>
              <div style="padding: 1.75rem;">
                <h3 style="font-size: 1.0625rem; margin-bottom: 0.5rem; font-weight: 600; color: #0f172a;">${item.title}</h3>
                <p style="color: #64748b; margin-bottom: 0.5rem; font-size: 0.9375rem; line-height: 1.6;">${item.description || item.category || 'Commercial-grade quality and reliability'}</p>
                ${isRealProducts && item.price ? `<p style="font-size: 1rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.75rem;">${fmtPrice(item.price)}</p>` : ''}
                <a href="/api/preview/${siteId}?page=inventory" style="color: var(--color-primary); text-decoration: none; font-weight: 600; font-size: 0.875rem;">Learn More →</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    `;
  }

  // Manufacturers
  if (sectionVisibility.manufacturers !== false) {
    html += `
    <section data-section="manufacturers" style="padding: 6rem 0; background-color: #f8fafc;">
      <div class="container">
        <div style="text-align: center; margin-bottom: 3.5rem;">
          <h2 style="font-size: 2.25rem; margin-bottom: 0.75rem; color: var(--color-primary); letter-spacing: -0.02em;">${getContent('manufacturers.heading')}</h2>
          <p style="color: #64748b; font-size: 1.0625rem;">${getContent('manufacturers.subheading')}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.25rem;">
          ${manufacturers.length > 0 ? manufacturers.map(m => `
            <div style="background: white; padding: 2rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; min-height: 100px;">
              ${m.logo_url ? `<img src="${m.logo_url}" alt="${m.name}" style="max-height: 50px; max-width: 100%;">` : `<span style="font-weight: 600; color: #475569;">${m.name}</span>`}
            </div>
          `).join('') : '<div style="grid-column: 1 / -1; text-align: center; color: #94a3b8; font-size: 0.9375rem;">No manufacturers added</div>'}
        </div>
      </div>
    </section>
    `;
  }

  // Testimonials
  if (sectionVisibility.testimonials !== false) {
    html += `
    <section data-section="testimonials" style="padding: 6rem 0;">
      <div class="container">
        <div style="text-align: center; margin-bottom: 3.5rem;">
          <h2 style="font-size: 2.25rem; color: var(--color-primary); margin-bottom: 0.75rem; letter-spacing: -0.02em;">${getContent('testimonials.heading')}</h2>
          <p style="color: #64748b; font-size: 1.0625rem;">${getContent('testimonials.subheading')}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
          ${[1, 2, 3].map(i => `
            <div style="background: white; padding: 2.25rem; border: 1px solid #e2e8f0; border-radius: 0.75rem;">
              <div style="margin-bottom: 1rem;">
                ${[...Array(5)].map(() => '<span style="color: #fbbf24; font-size: 1.125rem;">★</span>').join('')}
              </div>
              <p style="font-style: italic; color: #475569; margin-bottom: 1.75rem; line-height: 1.7; font-size: 0.9375rem;">"Premier Equipment has been our trusted partner for over a decade. Their professionalism and product quality are unmatched."</p>
              <div>
                <p style="font-weight: 600; color: #0f172a; font-size: 0.9375rem;">Business Owner ${i}</p>
                <p style="color: #94a3b8; font-size: 0.8125rem;">Commercial Landscaping</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    `;
  }

  // CTA
  if (sectionVisibility.cta !== false) {
    html += `
    <section data-section="cta" style="${getCtaSectionStyle(getContent, 'background-color: var(--color-primary);')} text-align: center;">
      <div class="container" style="padding-top: 5rem; padding-bottom: 5rem;">
        <h2 style="color: white; font-size: 2.25rem; margin-bottom: 1.25rem; font-weight: 700; letter-spacing: -0.02em;">${getContent('cta.headline')}</h2>
        <p style="font-size: 1.0625rem; margin-bottom: 2.5rem; color: rgba(255,255,255,0.9); max-width: 640px; margin-left: auto; margin-right: auto; line-height: 1.7;">${getContent('cta.subheadline')}</p>
        <a href="/api/preview/${siteId}?page=contact" style="display: inline-block; background: var(--color-secondary); color: white; padding: 1rem 2.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 1rem;">${getContent('cta.button')}</a>
      </div>
    </section>
    `;
  }

  return html;
}

// ============================================
// TEMPLATE #4: VIBE DYNAMICS
// ============================================
function renderVibeDynamicsHome(
  getContent: (key: string) => string,
  colors: any,
  manufacturers: any[],
  sectionVisibility: Record<string, boolean>,
  siteId: string,
  displayProducts: any[],
  isRealProducts: boolean,
  fmtPrice: (p: number | null) => string
): string {
  let html = '';

  // Hero - Bold with Diagonal
  if (sectionVisibility.hero !== false) {
    html += `
    <section data-section="hero" style="position: relative; min-height: 650px; overflow: hidden;">
      <div style="position: absolute; inset: 0; background-image: url('${getContent('hero.image')}'); background-size: cover; background-position: center;"></div>
      <div style="position: absolute; top: 0; left: 0; right: 35%; bottom: 0; background-color: var(--color-primary); transform: skewX(-10deg); transform-origin: top left;"></div>
      <div class="container" style="position: relative; z-index: 10; height: 650px; display: flex; align-items: center;">
        <div style="max-width: 600px; color: white;">
          <h1 style="color: white; font-size: 4rem; margin-bottom: 1rem; font-weight: 900; line-height: 1.1;">${getContent('hero.title')}</h1>
          <h2 style="font-size: 2rem; margin-bottom: 1rem; font-weight: 700; color: white;">${getContent('hero.subtitle')}</h2>
          <p style="font-size: 1.125rem; margin-bottom: 2rem; color: rgba(255,255,255,0.9);">${getContent('hero.description')}</p>
          <div style="display: flex; gap: 1rem;">
            <a href="/api/preview/${siteId}?page=contact" style="background: linear-gradient(135deg, var(--color-secondary), var(--color-accent)); color: white; padding: 1.25rem 2.5rem; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 1.125rem;">${getContent('hero.ctaPrimary')}</a>
          </div>
        </div>
      </div>
    </section>
    `;
  }

  // Stats
  if (sectionVisibility.stats !== false) {
    html += `
    <section data-section="stats" style="padding: 4rem 0; background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));">
      <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 3rem; text-align: center;">
          ${['1', '2', '3', '4'].map(num => {
            const value = getContent(`stats.stat${num}Value`);
            const label = getContent(`stats.stat${num}Label`);
            if (!value) return '';
            return `
              <div>
                <div style="font-size: 4rem; font-weight: 900; color: white; margin-bottom: 0.5rem;">${value}</div>
                <div style="color: white; font-size: 1.125rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">${label}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>
    `;
  }

  // Featured
  if (sectionVisibility.featured !== false) {
    html += `
    <section data-section="featured" style="padding: 5rem 0;">
      <div class="container">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 3rem; margin-bottom: 1rem; color: var(--color-primary); font-weight: 900;">${getContent('featured.heading')}</h2>
          <p style="color: #6b7280; font-size: 1.25rem; font-weight: 500;">${getContent('featured.subheading')}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
          ${displayProducts.map((item, idx) => {
            const borderColor = idx % 3 === 0 ? 'var(--color-primary)' : idx % 3 === 1 ? 'var(--color-secondary)' : 'var(--color-accent)';
            return `
            <div style="background: white; border: 3px solid ${borderColor}; border-radius: 1rem; overflow: hidden; transition: transform 0.3s;">
              <div style="height: 200px; ${item.primary_image ? `background: url('${item.primary_image}') center/cover no-repeat;` : `background: linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent));`}"></div>
              <div style="padding: 1.5rem;">
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; font-weight: 800; color: var(--color-primary);">${item.title.toUpperCase()}</h3>
                <p style="color: #374151; margin-bottom: 0.5rem; font-weight: 700; font-size: 1.25rem;">${isRealProducts && item.price ? fmtPrice(item.sale_price || item.price) : 'PREMIUM EQUIPMENT'}${isRealProducts && item.sale_price ? ` <span style="text-decoration: line-through; color: #9ca3af; font-size: 1rem;">${fmtPrice(item.price)}</span>` : ''}</p>
                <a href="/api/preview/${siteId}?page=inventory" style="display: inline-block; background-color: var(--color-secondary); color: white; padding: 0.75rem 1.5rem; border-radius: 9999px; text-decoration: none; font-weight: 700;">GRAB IT!</a>
              </div>
            </div>
          `}).join('')}
        </div>
      </div>
    </section>
    `;
  }

  // Manufacturers
  if (sectionVisibility.manufacturers !== false) {
    html += `
    <section data-section="manufacturers" style="padding: 5rem 0; background-color: #fafafa;">
      <div class="container">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 3rem; margin-bottom: 1rem; color: var(--color-primary); font-weight: 900;">${getContent('manufacturers.heading')}</h2>
          <p style="color: #6b7280; font-size: 1.25rem; font-weight: 500;">${getContent('manufacturers.subheading')}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 2rem;">
          ${manufacturers.length > 0 ? manufacturers.map((m, i) => `
            <div style="background: white; padding: 2rem; border: 3px solid var(--color-${i % 3 === 0 ? 'primary' : i % 3 === 1 ? 'secondary' : 'accent'}); border-radius: 50%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center;">
              ${m.logo_url ? `<img src="${m.logo_url}" alt="${m.name}" style="max-height: 50px; max-width: 80%;">` : `<span style="font-weight: 800; color: var(--color-primary); font-size: 1rem; text-align: center;">${m.name}</span>`}
            </div>
          `).join('') : '<div style="grid-column: 1 / -1; text-align: center; color: #9ca3af;">No manufacturers added</div>'}
        </div>
      </div>
    </section>
    `;
  }

  // Services
  if (sectionVisibility.services !== false) {
    html += `
    <section data-section="services" style="padding: 5rem 0;">
      <div class="container">
        <h2 style="font-size: 3rem; text-align: center; margin-bottom: 3rem; color: var(--color-primary); font-weight: 900;">${getContent('services.heading')}</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
          ${['1', '2', '3', '4'].map(num => {
            const title = getContent(`services.service${num}Title`);
            const description = getContent(`services.service${num}Description`);
            if (!title) return '';
            return `
              <div style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); padding: 2rem; border-radius: 1rem; color: white;">
                <h3 style="color: white; margin-bottom: 1rem; font-size: 1.5rem; font-weight: 800;">${title}</h3>
                <p style="color: rgba(255,255,255,0.9); font-weight: 500;">${description}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>
    `;
  }

  // Testimonials
  if (sectionVisibility.testimonials !== false) {
    html += `
    <section data-section="testimonials" style="padding: 5rem 0; background: linear-gradient(135deg, #fafafa, white);">
      <div class="container">
        <h2 style="font-size: 3rem; text-align: center; margin-bottom: 3rem; color: var(--color-primary); font-weight: 900;">${getContent('testimonials.heading')}</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
          ${[1, 2, 3].map(i => `
            <div style="background: white; padding: 2rem; border-radius: 1rem; border-left: 5px solid var(--color-${i % 3 === 0 ? 'primary' : i % 3 === 1 ? 'secondary' : 'accent'}); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="color: var(--color-accent); font-size: 4rem; line-height: 1; margin-bottom: 0.5rem; font-weight: 900;">"</div>
              <p style="font-style: italic; color: #4b5563; margin-bottom: 1.5rem; font-weight: 500; font-size: 1.125rem;">These guys are AMAZING! Best service, best equipment, best vibes!</p>
              <p style="font-weight: 800; color: var(--color-primary); font-size: 1.125rem;">Happy Customer ${i}</p>
              <p style="color: #6b7280; font-weight: 600;">Lawn Enthusiast</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    `;
  }

  // CTA
  if (sectionVisibility.cta !== false) {
    html += `
    <section data-section="cta" style="padding: 5rem 0; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent)); text-align: center; position: relative; overflow: hidden;">
      <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>
      <div class="container" style="position: relative; z-index: 10;">
        <h2 style="color: white; font-size: 3.5rem; margin-bottom: 1.5rem; font-weight: 900; text-transform: uppercase;">${getContent('cta.heading')}</h2>
        <p style="font-size: 1.25rem; margin-bottom: 2rem; color: rgba(255,255,255,0.95); max-width: 600px; margin-left: auto; margin-right: auto; font-weight: 600;">${getContent('cta.subheading')}</p>
        <a href="/api/preview/${siteId}?page=contact" style="display: inline-block; background: white; color: var(--color-primary); padding: 1.25rem 3rem; border-radius: 9999px; text-decoration: none; font-weight: 900; font-size: 1.25rem; text-transform: uppercase; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">${getContent('cta.button')}</a>
      </div>
    </section>
    `;
  }

  return html;
}

// ============================================
// TEMPLATE #5: ZENITH LAWN (Minimalist)
// ============================================
function renderZenithLawnHome(
  getContent: (key: string) => string,
  colors: any,
  manufacturers: any[],
  sectionVisibility: Record<string, boolean>,
  siteId: string,
  displayProducts: any[],
  isRealProducts: boolean,
  fmtPrice: (p: number | null) => string
): string {
  let html = '';

  // Hero - Minimal with Huge Whitespace
  if (sectionVisibility.hero !== false) {
    html += `
    <section data-section="hero" style="min-height: 80vh; display: flex; align-items: center; background: linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0.7)), url('${getContent('hero.image')}'); background-size: cover; background-position: center;">
      <div class="container">
        <div style="max-width: 600px;">
          <h1 style="font-size: 3rem; line-height: 1.3; margin-bottom: 2rem; color: #171717; font-weight: 300; letter-spacing: -0.02em;">${getContent('hero.heading')}</h1>
          <p style="font-size: 1.125rem; margin-bottom: 3rem; color: #737373; font-weight: 300; line-height: 1.8;">${getContent('hero.subheading')}</p>
          <a href="/api/preview/${siteId}?page=contact" style="display: inline-block; color: #171717; padding: 1rem 2rem; text-decoration: none; font-weight: 400; border: 1px solid #d4d4d4; transition: all 0.3s;">${getContent('hero.ctaButton')}</a>
        </div>
      </div>
    </section>
    `;
  }

  // Featured - Minimal
  if (sectionVisibility.featured !== false) {
    html += `
    <section data-section="featured" style="padding: 8rem 0; border-top: 1px solid #e5e5e5;">
      <div class="container">
        <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: #a3a3a3; text-align: center; margin-bottom: 4rem;">${getContent('featured.heading')}</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 4rem;">
          ${displayProducts.map(item => `
            <div>
              <div style="height: 300px; ${item.primary_image ? `background: url('${item.primary_image}') center/cover no-repeat;` : `background-color: #fafafa;`} margin-bottom: 1.5rem;"></div>
              <h3 style="font-size: 1rem; margin-bottom: 0.5rem; color: #171717; font-weight: 400;">${item.title}</h3>
              <p style="color: #a3a3a3; font-size: 0.875rem; font-weight: 300;">${isRealProducts && item.price ? fmtPrice(item.price) : 'From $999'}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    `;
  }

  // Manufacturers - Text Only
  if (sectionVisibility.manufacturers !== false) {
    html += `
    <section data-section="manufacturers" style="padding: 8rem 0; border-top: 1px solid #e5e5e5;">
      <div class="container">
        <p style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: #a3a3a3; text-align: center; margin-bottom: 4rem;">${getContent('manufacturers.heading')}</p>
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 3rem;">
          ${manufacturers.length > 0 ? manufacturers.map(m => `
            <span style="font-size: 1.25rem; color: #a3a3a3; font-weight: 300;">${m.name}</span>
          `).join('') : '<span style="color: #d4d4d4;">No manufacturers</span>'}
        </div>
      </div>
    </section>
    `;
  }

  // Testimonial - Single, Centered
  if (sectionVisibility.testimonials !== false) {
    html += `
    <section data-section="testimonials" style="padding: 8rem 0; border-top: 1px solid #e5e5e5;">
      <div class="container" style="max-width: 800px; text-align: center;">
        <p style="font-size: 1.5rem; line-height: 1.8; color: #525252; font-weight: 300; font-style: italic; margin-bottom: 3rem;">"${getContent('testimonials.quote') || 'GreenField Equipment transformed our commercial landscape operation. Their expertise in matching us with the right equipment has been invaluable.'}"</p>
        <p style="font-weight: 400; color: #171717; margin-bottom: 0.25rem;">${getContent('testimonials.author') || 'Michael Torres'}</p>
        <p style="color: #a3a3a3; font-size: 0.875rem; font-weight: 300;">${getContent('testimonials.company') || 'Torres Landscaping Co.'}</p>
      </div>
    </section>
    `;
  }

  // CTA - Minimal
  if (sectionVisibility.cta !== false) {
    html += `
    <section data-section="cta" style="padding: 8rem 0; border-top: 1px solid #e5e5e5; text-align: center;">
      <div class="container" style="max-width: 600px;">
        <h2 style="font-size: 2rem; margin-bottom: 2rem; color: #171717; font-weight: 300;">${getContent('cta.heading')}</h2>
        <a href="/api/preview/${siteId}?page=contact" style="display: inline-block; color: #171717; padding: 1rem 2rem; text-decoration: none; font-weight: 400; border: 1px solid #d4d4d4;">${getContent('cta.button')}</a>
      </div>
    </section>
    `;
  }

  return html;
}

// ============================================
// TEMPLATE #6: WARM EARTH DESIGNS (Rustic)
// ============================================
function renderWarmEarthHome(
  getContent: (key: string) => string,
  colors: any,
  manufacturers: any[],
  sectionVisibility: Record<string, boolean>,
  siteId: string,
  displayProducts: any[],
  isRealProducts: boolean,
  fmtPrice: (p: number | null) => string
): string {
  let html = '';

  // Hero - Warm with Rounded Elements
  if (sectionVisibility.hero !== false) {
    html += `
    <section data-section="hero" style="position: relative; min-height: 650px; display: flex; align-items: center; background-image: url('${getContent('hero.image')}'); background-size: cover; background-position: center;">
      <div style="position: absolute; inset: 0; background: linear-gradient(135deg, rgba(120, 53, 15, 0.85), rgba(6, 95, 70, 0.7));"></div>
      <div class="container" style="position: relative; z-index: 10;">
        <div style="max-width: 700px; background: rgba(254, 243, 199, 0.15); padding: 3rem; border-radius: 2rem; backdrop-filter: blur(10px);">
          <h1 style="color: #fef3c7; font-size: 3rem; margin-bottom: 1.5rem; font-weight: 700; line-height: 1.2; font-family: 'Merriweather', serif;">${getContent('hero.heading')}</h1>
          <p style="font-size: 1.125rem; margin-bottom: 2rem; color: rgba(254, 243, 199, 0.9); line-height: 1.7;">${getContent('hero.subheading')}</p>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <a href="/api/preview/${siteId}?page=contact" style="background-color: var(--color-accent); color: white; padding: 1rem 2rem; border-radius: 9999px; text-decoration: none; font-weight: 600;">${getContent('hero.ctaPrimary')}</a>
            <a href="/api/preview/${siteId}?page=inventory" style="background-color: transparent; border: 2px solid var(--color-accent); color: var(--color-accent); padding: 1rem 2rem; border-radius: 9999px; text-decoration: none; font-weight: 600;">${getContent('hero.ctaSecondary')}</a>
          </div>
        </div>
      </div>
    </section>
    `;
  }

  // Featured - Rounded Cards
  if (sectionVisibility.featured !== false) {
    html += `
    <section data-section="featured" style="padding: 5rem 0; background-color: #fef3c7;">
      <div class="container">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--color-primary); font-family: 'Merriweather', serif;">${getContent('featured.heading')}</h2>
          <p style="color: #92400e; font-size: 1.125rem;">${getContent('featured.subheading')}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
          ${displayProducts.map(item => `
            <div style="background: white; border-radius: 1.5rem; overflow: hidden; box-shadow: 0 4px 6px rgba(120, 53, 15, 0.1);">
              <div style="height: 200px; ${item.primary_image ? `background: url('${item.primary_image}') center/cover no-repeat;` : `background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));`}"></div>
              <div style="padding: 1.5rem;">
                <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--color-primary); font-family: 'Merriweather', serif;">${item.title}</h3>
                <p style="color: #78350f; margin-bottom: 0.5rem;">${item.description || item.category || 'Hand-picked for your property'}</p>
                ${isRealProducts && item.price ? `<p style="font-size: 1.125rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.75rem;">${fmtPrice(item.price)}</p>` : ''}
                <a href="/api/preview/${siteId}?page=inventory" style="display: inline-block; background-color: var(--color-accent); color: white; padding: 0.75rem 1.5rem; border-radius: 9999px; text-decoration: none; font-weight: 600;">View Details</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    `;
  }

  // Manufacturers - Rounded Badge Style
  if (sectionVisibility.manufacturers !== false) {
    html += `
    <section data-section="manufacturers" style="padding: 5rem 0; background-color: #f5f5f4;">
      <div class="container">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--color-primary); font-family: 'Merriweather', serif;">${getContent('manufacturers.heading')}</h2>
          <p style="color: #78350f; font-size: 1.125rem;">${getContent('manufacturers.subheading')}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 2rem;">
          ${manufacturers.length > 0 ? manufacturers.map(m => `
            <div style="background: white; padding: 2rem; border-radius: 1rem; border: 2px solid var(--color-accent); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 120px; box-shadow: 0 2px 4px rgba(120, 53, 15, 0.1);">
              ${m.logo_url ? `<img src="${m.logo_url}" alt="${m.name}" style="max-height: 50px; max-width: 100%; margin-bottom: 0.5rem;">` : ''}
              <span style="font-weight: 600; color: var(--color-primary); text-align: center;">${m.name}</span>
            </div>
          `).join('') : '<div style="grid-column: 1 / -1; text-align: center; color: #a8a29e;">No manufacturers added</div>'}
        </div>
      </div>
    </section>
    `;
  }

  // Testimonials - Warm Cards
  if (sectionVisibility.testimonials !== false) {
    html += `
    <section data-section="testimonials" style="padding: 5rem 0; background-color: #fef3c7;">
      <div class="container">
        <h2 style="font-size: 2.5rem; text-align: center; margin-bottom: 3rem; color: var(--color-primary); font-family: 'Merriweather', serif;">${getContent('testimonials.heading')}</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
          ${[1, 2, 3].map(i => `
            <div style="background: white; padding: 2rem; border-radius: 1.5rem; border-left: 4px solid var(--color-accent); box-shadow: 0 4px 6px rgba(120, 53, 15, 0.1);">
              <div style="color: var(--color-accent); font-size: 3rem; line-height: 1; margin-bottom: 1rem; font-family: 'Merriweather', serif;">"</div>
              <p style="font-style: italic; color: #78350f; margin-bottom: 1.5rem; line-height: 1.7;">These folks know their equipment and the land. They helped us find perfect solutions for our homestead.</p>
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));"></div>
                <div>
                  <p style="font-weight: 600; color: var(--color-primary);">Community Member ${i}</p>
                  <p style="color: #92400e; font-size: 0.875rem;">Rural Property Owner</p>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    `;
  }

  // CTA - Warm Gradient
  if (sectionVisibility.cta !== false) {
    html += `
    <section data-section="cta" style="padding: 5rem 0; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); text-align: center;">
      <div class="container">
        <h2 style="color: #fef3c7; font-size: 2.5rem; margin-bottom: 1.5rem; font-family: 'Merriweather', serif; font-weight: 700;">${getContent('cta.heading')}</h2>
        <p style="font-size: 1.125rem; margin-bottom: 2rem; color: rgba(254, 243, 199, 0.9); max-width: 700px; margin-left: auto; margin-right: auto; line-height: 1.7;">${getContent('cta.subheading')}</p>
        <a href="/api/preview/${siteId}?page=contact" style="display: inline-block; background: var(--color-accent); color: white; padding: 1rem 2.5rem; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 1.125rem;">${getContent('cta.button')}</a>
      </div>
    </section>
    `;
  }

  return html;
}

// Generic fallback for unknown templates
function renderGenericHome(
  getContent: (key: string) => string,
  colors: any,
  manufacturers: any[],
  sectionVisibility: Record<string, boolean>,
  siteId: string,
  displayProducts: any[],
  isRealProducts: boolean,
  fmtPrice: (p: number | null) => string
): string {
  return renderModernLawnHome(getContent, colors, manufacturers, sectionVisibility, siteId, displayProducts, isRealProducts, fmtPrice);
}

// Shared page renderers
// Contact Page Renderer
function renderContactPageContent(
  config: any,
  getContent: (key: string) => string,
  colors: any,
  templateSlug: string
): string {
  const heading = getContent('contactPage.heading') || 'Contact Us';
  const subheading = getContent('contactPage.subheading') || 'Get in touch with our team';
  const heroImage = getContent('contactPage.heroImage');
  const contentHeading = getContent('contactPage.contentHeading') || '';
  const contentText = getContent('contactPage.contentText') || '';
  const formHeading = getContent('contactPage.formHeading') || 'Send us a message';
  const locationHeading = getContent('contactPage.locationHeading') || 'Visit Us';
  const mapEmbed = getContent('contactPage.mapEmbed');
  
  return `
  ${renderPageHero(heading, subheading, colors, heroImage, 'contactPage')}
  
  ${renderPageContentSection(contentHeading, contentText, colors)}
  
  <section data-section="contactPage" style="padding: 5rem 0;">
    <div class="container">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; max-width: 1000px; margin: 0 auto;">
        <!-- Contact Form -->
        <div>
          <h2 style="font-size: 1.5rem; margin-bottom: 2rem; color: var(--color-primary);">${formHeading}</h2>
          <form style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Name</label>
              <input type="text" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem;" placeholder="Your name">
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Email</label>
              <input type="email" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem;" placeholder="your@email.com">
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Phone</label>
              <input type="tel" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem;" placeholder="(555) 123-4567">
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Message</label>
              <textarea style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; min-height: 120px;" placeholder="How can we help?"></textarea>
            </div>
            <button type="submit" style="background-color: var(--color-primary); color: white; padding: 1rem 2rem; border: none; border-radius: 0.375rem; font-weight: 600; cursor: pointer;">Send Message</button>
          </form>
        </div>
        
        <!-- Contact Info -->
        <div>
          <h2 style="font-size: 1.5rem; margin-bottom: 2rem; color: var(--color-primary);">${locationHeading}</h2>
          <div style="margin-bottom: 2rem;">
            <p style="margin-bottom: 1rem;"><strong style="color: #374151;">Address:</strong><br>${getContent('businessInfo.address')}, ${getContent('businessInfo.city')}, ${getContent('businessInfo.state')} ${getContent('businessInfo.zip')}</p>
            <p style="margin-bottom: 1rem;"><strong style="color: #374151;">Phone:</strong><br>${getContent('businessInfo.phone')}</p>
            <p style="margin-bottom: 1rem;"><strong style="color: #374151;">Email:</strong><br>${getContent('businessInfo.email')}</p>
          </div>
          
          <h3 style="font-size: 1.25rem; margin-bottom: 1rem; color: #374151;">Hours</h3>
          <p style="margin-bottom: 0.5rem;">${getContent('hours.weekdays') || getContent('hours.monday') || 'Mon-Fri: 8am-6pm'}</p>
          <p style="margin-bottom: 0.5rem;">${getContent('hours.saturday') || 'Sat: 9am-4pm'}</p>
          <p>${getContent('hours.sunday') || 'Sun: Closed'}</p>
          
          ${mapEmbed ? `<div style="margin-top: 2rem;">${mapEmbed}</div>` : ''}
        </div>
      </div>
    </div>
  </section>
  `;
}

// Service Page Renderer
function renderServicePageContent(
  config: any,
  getContent: (key: string) => string,
  colors: any,
  templateSlug: string,
  siteId: string
): string {
  const heading = getContent('servicePage.heading') || 'Our Services';
  const subheading = getContent('servicePage.subheading') || 'Expert service and repair';
  const serviceImage = getContent('servicePage.serviceImage') || getContent('servicePage.heroImage');
  const heroImage = getContent('servicePage.heroImage') || serviceImage;
  const contentHeading = getContent('servicePage.contentHeading') || '';
  const contentText = getContent('servicePage.contentText') || '';
  
  return `
  ${renderPageHero(heading, subheading, colors, heroImage, 'servicePage')}
  
  ${renderPageContentSection(contentHeading, contentText, colors)}
  
  <!-- Services Grid -->
  <section style="padding: 5rem 0; background-color: #f9fafb;">
    <div class="container">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 3rem;">
        <!-- Service 1 -->
        <div style="background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="height: 200px; background-image: url('${getContent('servicePage.service1Image')}'); background-size: cover; background-position: center;"></div>
          <div style="padding: 2rem;">
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--color-primary);">${getContent('servicePage.service1Title') || 'Service 1'}</h3>
            <p style="color: #6b7280;">${getContent('servicePage.service1Description') || 'Service description'}</p>
          </div>
        </div>
        
        <!-- Service 2 -->
        <div style="background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="height: 200px; background-image: url('${getContent('servicePage.service2Image')}'); background-size: cover; background-position: center;"></div>
          <div style="padding: 2rem;">
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--color-primary);">${getContent('servicePage.service2Title') || 'Service 2'}</h3>
            <p style="color: #6b7280;">${getContent('servicePage.service2Description') || 'Service description'}</p>
          </div>
        </div>
        
        <!-- Service 3 -->
        <div style="background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="height: 200px; background-image: url('${getContent('servicePage.service3Image')}'); background-size: cover; background-position: center;"></div>
          <div style="padding: 2rem;">
            <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--color-primary);">${getContent('servicePage.service3Title') || 'Service 3'}</h3>
            <p style="color: #6b7280;">${getContent('servicePage.service3Description') || 'Service description'}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- CTA Section -->
  <section style="padding: 5rem 0; background-color: var(--color-primary); color: white; text-align: center;">
    <div class="container">
      <h2 style="font-size: 2.5rem; margin-bottom: 1rem; color: white;">${getContent('servicePage.ctaHeading') || 'Ready to schedule service?'}</h2>
      <a href="/api/preview/${siteId}?page=contact" style="display: inline-block; background: white; color: var(--color-primary); padding: 1rem 2.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; margin-top: 1rem;">${getContent('servicePage.ctaButton') || 'Contact Us'}</a>
    </div>
  </section>
  `;
}

// Manufacturers Page Renderer
function renderManufacturersPageContent(
  config: any,
  getContent: (key: string) => string,
  colors: any,
  manufacturers: any[],
  templateSlug: string
): string {
  const heading = getContent('manufacturersPage.heading') || 'Our Manufacturers';
  const subheading = getContent('manufacturersPage.subheading') || 'We partner with industry-leading brands';
  const heroImage = getContent('manufacturersPage.heroImage');
  const contentHeading = getContent('manufacturersPage.contentHeading') || '';
  const contentText = getContent('manufacturersPage.contentText') || '';
  const introText = getContent('manufacturersPage.introText') || '';
  
  return `
  ${renderPageHero(heading, subheading, colors, heroImage, 'manufacturersPage')}
  
  ${renderPageContentSection(contentHeading, contentText, colors)}
  
  <section data-section="manufacturersPage" style="padding: 5rem 0;">
    <div class="container">
      <div style="text-align: center; margin-bottom: 3rem;">
        ${introText ? `<p style="color: #374151; max-width: 800px; margin: 0 auto;">${introText}</p>` : ''}
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 3rem; margin-top: 3rem;">
        ${manufacturers.length > 0 ? manufacturers.map(m => `
          <div style="border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 2rem; text-align: center; background: white;">
            ${m.logo_url ? `<img src="${m.logo_url}" alt="${m.name}" style="max-height: 80px; margin: 0 auto 1.5rem;">` : ''}
            <h3 style="margin-bottom: 1rem; color: var(--color-primary); font-size: 1.25rem;">${m.name}</h3>
            ${m.description ? `<p style="color: #6b7280; font-size: 0.875rem;">${m.description}</p>` : ''}
          </div>
        `).join('') : `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #9ca3af;">
            <p>No manufacturers added yet. Add manufacturers in the customizer to display them here.</p>
          </div>
        `}
      </div>
    </div>
  </section>
  `;
}

// Premium Placeholder Renderer
function renderPremiumPlaceholder(
  pageName: string,
  config: any,
  getContent: (key: string) => string,
  colors?: any
): string {
  const pageKey = pageName.toLowerCase() + 'Page';
  const heading = getContent(`${pageKey}.heading`) || `${pageName}`;
  const subheading = getContent(`${pageKey}.subheading`) || `Upgrade to enable ${pageName.toLowerCase()}`;
  const heroImage = getContent(`${pageKey}.heroImage`);
  const contentHeading = getContent(`${pageKey}.contentHeading`) || '';
  const contentText = getContent(`${pageKey}.contentText`) || '';
  
  return `
  ${colors ? renderPageHero(heading, subheading, colors, heroImage, pageKey) : ''}
  ${colors ? renderPageContentSection(contentHeading, contentText, colors) : ''}
  <section style="padding: 8rem 0; text-align: center;">
    <div class="container" style="max-width: 600px;">
      <div style="width: 80px; height: 80px; margin: 0 auto 2rem; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 2rem; color: white;">🔒</span>
      </div>
      <h1 style="margin-bottom: 1.5rem; color: var(--color-primary);">${heading}</h1>
      <p style="color: #6b7280; font-size: 1.125rem; margin-bottom: 2rem;">
        ${subheading}
      </p>
      <p style="color: #9ca3af; margin-bottom: 2rem; font-size: 0.875rem;">
        This is a premium feature. Upgrade your plan to enable ${pageName.toLowerCase()}.
      </p>
      <a href="/pricing" style="display: inline-block; background-color: var(--color-primary); color: white; padding: 1rem 2rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">Upgrade Plan</a>
    </div>
  </section>
  `;
}

// =====================================================
// INTEGRATION-BASED PAGE RENDERERS
// =====================================================

// Service Page with Integration Support
async function renderInventoryPageWithIntegration(
  siteId: string,
  config: any,
  getContent: (key: string) => string,
  colors: any,
  supabase: any
): Promise<string> {
  const heading = getContent('inventoryPage.heading') || 'Our Inventory';
  const subheading = getContent('inventoryPage.subheading') || 'Browse our selection of professional equipment';

  // Load all available inventory items
  const items = supabase ? (await supabase
    .from('inventory_items')
    .select('id, title, description, category, condition, price, sale_price, model, year, primary_image, slug, featured, status, hours')
    .eq('site_id', siteId)
    .eq('status', 'available')
    .order('featured', { ascending: false })
    .order('display_order')
    .limit(50)).data : null;

  const inventory = items || [];

  const fmtPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'Call for Price';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  };

  // Get unique categories for filter buttons
  const categories = [...new Set(inventory.map((item: any) => item.category).filter(Boolean))];

  let html = `
    <!-- Inventory Hero -->
    <section data-section="inventoryPage" style="padding: 4rem 0; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: white; text-align: center;">
      <div class="container">
        <h1 style="font-size: 2.5rem; margin-bottom: 1rem; font-weight: 700;">${heading}</h1>
        <p style="font-size: 1.125rem; opacity: 0.9; max-width: 600px; margin: 0 auto;">${subheading}</p>
      </div>
    </section>
  `;

  if (inventory.length === 0) {
    html += `
    <section style="padding: 5rem 0; text-align: center;">
      <div class="container">
        <div style="max-width: 400px; margin: 0 auto;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">📦</div>
          <h2 style="font-size: 1.5rem; color: #1f2937; margin-bottom: 0.5rem;">No Equipment Listed Yet</h2>
          <p style="color: #6b7280;">Check back soon — we're adding inventory regularly.</p>
        </div>
      </div>
    </section>
    `;
  } else {
    // Category filter bar
    if (categories.length > 1) {
      html += `
      <section style="padding: 1.5rem 0; border-bottom: 1px solid #e5e7eb; background: #f9fafb;">
        <div class="container" style="display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center;">
          <span class="inv-filter active" data-filter="all" style="padding: 0.5rem 1.25rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; background: var(--color-primary); color: white; cursor: pointer;">All</span>
          ${categories.map((cat: string) => `
            <span class="inv-filter" data-filter="${cat}" style="padding: 0.5rem 1.25rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 500; background: white; color: #4b5563; border: 1px solid #d1d5db; cursor: pointer;">${cat}</span>
          `).join('')}
        </div>
      </section>
      `;
    }

    // Product grid
    html += `
    <section style="padding: 3rem 0;">
      <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;">
          ${inventory.map((item: any) => `
            <div class="inv-card" data-category="${item.category || ''}" style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden; transition: box-shadow 0.3s;">
              <div style="height: 220px; position: relative; ${item.primary_image ? `background: url('${item.primary_image}') center/cover no-repeat;` : `background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); opacity: 0.8;`}">
                ${item.featured ? `<span style="position: absolute; top: 0.75rem; left: 0.75rem; background: #f59e0b; color: white; font-size: 0.7rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 9999px; text-transform: uppercase;">Featured</span>` : ''}
                ${item.condition !== 'new' ? `<span style="position: absolute; top: 0.75rem; right: 0.75rem; background: rgba(0,0,0,0.6); color: white; font-size: 0.7rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; text-transform: capitalize;">${item.condition}</span>` : ''}
              </div>
              <div style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                  <h3 style="font-size: 1.125rem; font-weight: 600; color: #0f172a; margin: 0;">${item.title}</h3>
                </div>
                <p style="font-size: 0.8rem; color: #6b7280; margin-bottom: 0.75rem;">${[item.category, item.model, item.year].filter(Boolean).join(' · ')}</p>
                ${item.hours ? `<p style="font-size: 0.8rem; color: #6b7280; margin-bottom: 0.75rem;">${item.hours} hours</p>` : ''}
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f1f5f9;">
                  <span style="font-size: 1.25rem; font-weight: 700; color: var(--color-primary);">${fmtPrice(item.price)}</span>
                  ${item.sale_price ? `<span style="font-size: 0.875rem; color: #dc2626; text-decoration: line-through;">${fmtPrice(item.sale_price)}</span>` : ''}
                  <a href="#" style="font-size: 0.875rem; font-weight: 600; color: var(--color-primary); text-decoration: none;">Details →</a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    `;
  }

  // CTA section
  html += `
  <section style="padding: 4rem 0; background: #f9fafb; text-align: center;">
    <div class="container">
      <h2 style="font-size: 1.75rem; color: #1f2937; margin-bottom: 0.75rem;">Don't see what you're looking for?</h2>
      <p style="color: #6b7280; margin-bottom: 1.5rem;">Contact us and we'll help you find the right equipment.</p>
      <a href="/api/preview/${siteId}?page=contact" style="display: inline-block; background: var(--color-primary); color: white; padding: 0.875rem 2rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">Contact Us</a>
    </div>
  </section>
  `;

  // Inventory filter script
  html += `
  <script>
    document.querySelectorAll('.inv-filter').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var filter = this.getAttribute('data-filter');
        document.querySelectorAll('.inv-filter').forEach(function(b) {
          b.classList.remove('active');
          b.style.background = 'white';
          b.style.color = '#4b5563';
          b.style.border = '1px solid #d1d5db';
        });
        this.classList.add('active');
        this.style.background = 'var(--color-primary)';
        this.style.color = 'white';
        this.style.border = 'none';
        document.querySelectorAll('.inv-card').forEach(function(card) {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  </script>
  `;

  return html;
}

async function renderServicePageWithIntegration(
  siteId: string,
  config: any,
  getContent: (key: string) => string,
  colors: any,
  supabase: any,
  templateSlug: string = ''
): Promise<string> {
  const heading = getContent('servicePage.heading') || 'Our Services';
  const subheading = getContent('servicePage.subheading') || 'Expert equipment service and repair';
  const heroImage = getContent('servicePage.heroImage') || getContent('servicePage.serviceImage');
  const contentHeading = getContent('servicePage.contentHeading') || '';
  const contentText = getContent('servicePage.contentText') || '';
  const contactEmail = getContent('businessInfo.email') || '';
  const contactPhone = getContent('businessInfo.phone') || '';
  const businessName = getContent('businessInfo.businessName') || '';

  // Build the services grid from settings (Service 1, 2, 3) — always shown
  const serviceCards = [1, 2, 3].map(num => {
    const title = getContent(`servicePage.service${num}Title`);
    const description = getContent(`servicePage.service${num}Description`);
    const image = getContent(`servicePage.service${num}Image`);
    if (!title && !description) return '';
    return `
      <div style="background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
        ${image ? `<div style="height: 200px; background-image: url('${image}'); background-size: cover; background-position: center;"></div>` : ''}
        <div style="padding: 2rem;">
          <h3 style="font-size: 1.5rem; margin-bottom: 1rem; color: var(--color-primary); font-weight: 700;">${title || `Service ${num}`}</h3>
          <p style="color: #6b7280; line-height: 1.6;">${description || ''}</p>
        </div>
      </div>
    `;
  }).filter(Boolean);

  const servicesGridHTML = serviceCards.length > 0 ? `
  <section style="padding: 5rem 0; background-color: #f9fafb;">
    <div class="container">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
        ${serviceCards.join('')}
      </div>
    </div>
  </section>
  ` : '';

  // Email/Phone CTA — always shown for all tiers
  const ctaBgImage = getContent('cta.backgroundImage');
  const ctaStyle = (templateSlug === 'corporate-edge' && ctaBgImage)
    ? `padding: 6rem 0; background-image: linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('${ctaBgImage}'); background-size: cover; background-position: center; text-align: center;`
    : `padding: 5rem 0; background-color: var(--color-primary); text-align: center;`;
  const emailCTA = `
  <section style="${ctaStyle}">
    <div class="container" style="max-width: 700px;">
      <h2 style="font-size: 2.5rem; margin-bottom: 1rem; color: white; font-weight: 700;">${getContent('servicePage.ctaHeading') || 'Need Service?'}</h2>
      <p style="color: rgba(255,255,255,0.85); font-size: 1.125rem; margin-bottom: 2rem;">${getContent('servicePage.ctaDescription') || 'Get in touch with our team to schedule your service appointment.'}</p>
      <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;">
        ${contactEmail ? `<a href="mailto:${contactEmail}?subject=Service%20Request%20-%20${encodeURIComponent(businessName)}" style="display: inline-flex; align-items: center; gap: 0.5rem; background: white; color: var(--color-primary); padding: 1rem 2.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 700; font-size: 1.125rem;">✉ Email Us</a>` : ''}
        ${contactPhone ? `<a href="tel:${contactPhone.replace(/[^0-9+]/g, '')}" style="display: inline-flex; align-items: center; gap: 0.5rem; background: transparent; color: white; padding: 1rem 2.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 700; font-size: 1.125rem; border: 2px solid white;">📞 ${contactPhone}</a>` : ''}
      </div>
    </div>
  </section>
  `;

  // Check if site has the service_scheduling add-on
  let hasServiceFeature = false;
  if (supabase) {
    const { data: features } = await supabase
      .from('site_features')
      .select('feature_key')
      .eq('site_id', siteId)
      .eq('feature_key', 'service_scheduling')
      .eq('enabled', true)
      .single();
    hasServiceFeature = !!features;
  }

  // Load service types from DB
  const serviceTypesData = supabase ? (await supabase
    .from('service_types')
    .select('id, name, description, duration_minutes, price_estimate, category')
    .eq('site_id', siteId)
    .eq('is_active', true)
    .order('sort_order')).data : null;
  const serviceTypes = serviceTypesData || [];

  // Premium add-on: online scheduling (Calendly or built-in form)
  let schedulingSection = '';

  if (hasServiceFeature) {
    // Check for Calendly integration
    let integration = null;
    if (supabase) {
      try {
        const { data } = await supabase
          .from('site_integrations')
          .select('*')
          .eq('site_id', siteId)
          .eq('integration_type', 'service')
          .single();
        integration = data;
      } catch (e) {
        // No integration configured — will use built-in form
      }
    }

    if (integration?.integration_id === 'calendly') {
      const calendlyUrl = integration.config_json.calendly_url;
      schedulingSection = `
      <section style="padding: 5rem 0;">
        <div class="container">
          <h2 style="font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 2rem; color: var(--color-primary);">Schedule Online</h2>
          <div style="min-height: 700px;">
            <iframe src="${calendlyUrl}" width="100%" height="700" frameborder="0"></iframe>
          </div>
        </div>
      </section>
      `;
    } else {
      schedulingSection = `
      <section style="padding: 5rem 0;">
        <div class="container" style="max-width: 800px;">
          <h2 style="font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 2rem; color: var(--color-primary);">Schedule Service Online</h2>
          <form method="POST" action="/api/service/book/${siteId}" id="serviceBookingForm" style="background: white; padding: 2.5rem; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <input type="hidden" name="siteId" value="${siteId}">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Name *</label>
                <input type="text" name="name" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;">
              </div>
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Phone *</label>
                <input type="tel" name="phone" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;">
              </div>
            </div>
            <div style="margin-top: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Email *</label>
              <input type="email" name="email" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem;">
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Equipment Type</label>
                <select name="equipmentType" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;">
                  <option value="">Select equipment</option>
                  <option value="mower">Mower</option>
                  <option value="tractor">Tractor</option>
                  <option value="trimmer">Trimmer</option>
                  <option value="blower">Blower</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Service Type *</label>
                <select name="serviceType" id="serviceTypeSelect" required onchange="updateServiceInfo()" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;">
                  <option value="">Select service</option>
                  ${serviceTypes.map(st => `<option value="${st.id}" data-duration="${st.duration_minutes}" data-price="${st.price_estimate || ''}">${st.name}${st.price_estimate ? ' (' + st.price_estimate + ')' : ''}</option>`).join('')}
                  <option value="other">Other (describe below)</option>
                </select>
                <input type="hidden" name="serviceTypeName" id="serviceTypeName">
              </div>
            </div>
            <div style="margin-top: 2rem; padding: 1.5rem; background: #f9fafb; border-radius: 0.5rem; border: 1px solid #e5e7eb;">
              <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; color: #111827;">Select Appointment Date & Time</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                <div>
                  <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Preferred Date *</label>
                  <input type="date" name="preferredDate" required min="${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;">
                </div>
                <div>
                  <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Preferred Time *</label>
                  <select name="preferredTime" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;">
                    <option value="">Select time</option>
                    <option value="8:00 AM">8:00 AM</option>
                    <option value="9:00 AM">9:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="12:00 PM">12:00 PM</option>
                    <option value="1:00 PM">1:00 PM</option>
                    <option value="2:00 PM">2:00 PM</option>
                    <option value="3:00 PM">3:00 PM</option>
                    <option value="4:00 PM">4:00 PM</option>
                    <option value="5:00 PM">5:00 PM</option>
                  </select>
                </div>
              </div>
            </div>
            <div style="margin-top: 1.5rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Description *</label>
              <textarea name="description" required rows="4" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;" placeholder="Please describe the issue or service needed"></textarea>
            </div>
            <button type="submit" style="width: 100%; margin-top: 2rem; background-color: var(--color-primary); color: white; padding: 1rem; border: none; border-radius: 0.5rem; font-weight: 600; font-size: 1.125rem; cursor: pointer;">
              ${getContent('servicePage.ctaButton') || 'Request Service Appointment'}
            </button>
          </form>
        </div>
      </section>
      `;
    }
  } else {
    // Basic tier: simple contact form (no scheduling)
    schedulingSection = `
    <section style="padding: 5rem 0;">
      <div class="container" style="max-width: 700px;">
        <h2 style="font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 0.5rem; color: var(--color-primary);">Request Service</h2>
        <p style="text-align: center; color: #6b7280; margin-bottom: 2rem;">Fill out the form below and we'll get back to you within 1 business day.</p>
        <form method="POST" action="/api/service/book/${siteId}" id="serviceContactForm" style="background: white; padding: 2.5rem; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
          <input type="hidden" name="siteId" value="${siteId}">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Name *</label>
              <input type="text" name="customerName" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Phone *</label>
              <input type="tel" name="customerPhone" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;">
            </div>
          </div>
          <div style="margin-top: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Email *</label>
            <input type="email" name="customerEmail" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;">
          </div>
          <div style="margin-top: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Describe the Issue *</label>
            <textarea name="customerNotes" required rows="4" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem;" placeholder="Please describe the problem or service needed..."></textarea>
          </div>
          <button type="submit" style="width: 100%; margin-top: 2rem; background-color: var(--color-primary); color: white; padding: 1rem; border: none; border-radius: 0.5rem; font-weight: 600; font-size: 1.125rem; cursor: pointer;">
            ${getContent('servicePage.ctaButton') || 'Submit Service Request'}
          </button>
        </form>
      </div>
    </section>
    `;
  }

  const serviceBookingScript = `
  <script>
    function updateServiceInfo() {
      var sel = document.getElementById('serviceTypeSelect');
      var nameInput = document.getElementById('serviceTypeName');
      if (sel && nameInput) nameInput.value = sel.options[sel.selectedIndex]?.text || '';
    }
    
    // Premium scheduling form
    var sform = document.getElementById('serviceBookingForm');
    if (sform) {
      sform.addEventListener('submit', function(e) {
        e.preventDefault();
        updateServiceInfo();
        var fd = new FormData(sform);
        var raw = {};
        fd.forEach(function(v, k) { raw[k] = v; });
        
        var isOther = raw.serviceType === 'other';
        var payload = {
          customerName: raw.name,
          customerEmail: raw.email,
          customerPhone: raw.phone,
          serviceTypeId: isOther ? null : raw.serviceType,
          equipmentType: raw.equipmentType,
          preferredDate: raw.preferredDate,
          preferredTime: raw.preferredTime,
          customerNotes: raw.description,
          customDescription: isOther ? raw.description : null
        };
        
        var btn = sform.querySelector('button[type=submit]');
        btn.textContent = 'Submitting...';
        btn.disabled = true;
        
        fetch(sform.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(function(r) { return r.json(); })
        .then(function(res) {
          if (res.error) {
            alert('Error: ' + res.error);
            btn.textContent = 'Request Service Appointment';
            btn.disabled = false;
          } else {
            sform.innerHTML = '<div style="text-align:center;padding:3rem"><h3 style="color:var(--color-primary);font-size:1.5rem;margin-bottom:1rem">\\u2705 Service Request Submitted!</h3><p style="color:#6b7280">' + (res.message || 'We will contact you to confirm your appointment.') + '</p></div>';
          }
        })
        .catch(function() {
          alert('Something went wrong. Please try again.');
          btn.textContent = 'Request Service Appointment';
          btn.disabled = false;
        });
      });
    }

    // Basic contact form
    var cform = document.getElementById('serviceContactForm');
    if (cform) {
      cform.addEventListener('submit', function(e) {
        e.preventDefault();
        var fd = new FormData(cform);
        var data = {};
        fd.forEach(function(v, k) { data[k] = v; });
        var btn = cform.querySelector('button[type=submit]');
        btn.textContent = 'Submitting...';
        btn.disabled = true;
        fetch(cform.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        .then(function(r) { return r.json(); })
        .then(function(res) {
          if (res.error) {
            alert('Error: ' + res.error);
            btn.textContent = 'Submit Service Request';
            btn.disabled = false;
          } else {
            cform.innerHTML = '<div style="text-align:center;padding:3rem"><h3 style="color:var(--color-primary);font-size:1.5rem;margin-bottom:1rem">\\u2705 Service Request Submitted!</h3><p style="color:#6b7280">We will contact you within 1 business day.</p></div>';
          }
        })
        .catch(function() {
          alert('Something went wrong.');
          btn.textContent = 'Submit Service Request';
          btn.disabled = false;
        });
      });
    }
  </script>
  `;

  return `
  ${renderPageHero(heading, subheading, colors, heroImage, 'servicePage')}
  ${renderPageContentSection(contentHeading, contentText, colors)}
  ${servicesGridHTML}
  ${schedulingSection}
  ${emailCTA}
  ${serviceBookingScript}
  `;
}

// Rentals Page with Integration Support
async function renderRentalsPageWithIntegration(
  siteId: string,
  config: any,
  getContent: (key: string) => string,
  colors: any,
  supabase: any
): Promise<string> {
  // Check if site has rental_scheduling add-on
  let hasRentalFeature = false;
  if (supabase) {
    const { data: feature } = await supabase
      .from('site_features')
      .select('feature_key')
      .eq('site_id', siteId)
      .eq('feature_key', 'rental_scheduling')
      .eq('enabled', true)
      .single();
    hasRentalFeature = !!feature;
  }

  const heading = getContent('rentalsPage.heading') || 'Equipment Rentals';
  const subheading = getContent('rentalsPage.subheading') || 'Flexible rental options for any project';
  const heroImage = getContent('rentalsPage.heroImage');
  const contentHeading = getContent('rentalsPage.contentHeading') || '';
  const contentText = getContent('rentalsPage.contentText') || '';

  if (hasRentalFeature) {
    const rentals = supabase ? (await supabase
      .from('rental_inventory')
      .select('*')
      .eq('site_id', siteId)
      .eq('status', 'available')
      .order('display_order')).data : null;

    return `
    ${renderPageHero(heading, subheading, colors, heroImage, 'rentalsPage')}
    ${renderPageContentSection(contentHeading, contentText, colors)}
    <section style="padding: 5rem 0;">
      <div class="container">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem;">
          ${rentals && rentals.length > 0 ? rentals.map(item => `
            <div style="background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: transform 0.2s;">
              ${item.primary_image ? `
                <div style="height: 250px; background-image: url('${item.primary_image}'); background-size: cover; background-position: center;"></div>
              ` : `
                <div style="height: 250px; background-color: #f3f4f6; display: flex; align-items: center; justify-content: center;">
                  <span style="color: #9ca3af; font-size: 4rem;">🚜</span>
                </div>
              `}
              <div style="padding: 1.5rem;">
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--color-primary); font-weight: 700;">${item.title}</h3>
                ${item.model ? `<p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 1rem;">Model: ${item.model}</p>` : ''}
                ${item.description ? `<p style="color: #374151; margin-bottom: 1.5rem; font-size: 0.9375rem; line-height: 1.6;">${item.description.substring(0, 120)}...</p>` : ''}
                
                <!-- Rental Rates -->
                <div style="background: #f9fafb; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; border: 1px solid #e5e7eb;">
                  <h4 style="font-size: 0.875rem; font-weight: 600; color: #374151; margin-bottom: 0.75rem;">Rental Rates</h4>
                  ${item.hourly_rate ? `<p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 0.25rem;">Hourly: <strong style="color: var(--color-primary);">$${item.hourly_rate}</strong></p>` : ''}
                  ${item.daily_rate ? `<p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 0.25rem;">Daily: <strong style="color: var(--color-primary);">$${item.daily_rate}</strong></p>` : ''}
                  ${item.weekly_rate ? `<p style="color: #6b7280; font-size: 0.875rem; margin-bottom: 0.25rem;">Weekly: <strong style="color: var(--color-primary);">$${item.weekly_rate}</strong></p>` : ''}
                  ${item.monthly_rate ? `<p style="color: #6b7280; font-size: 0.875rem;">Monthly: <strong style="color: var(--color-primary);">$${item.monthly_rate}</strong></p>` : ''}
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                  <span style="background-color: #10b981; color: white; padding: 0.375rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">
                    ${item.quantity_available > 0 ? `${item.quantity_available} Available` : 'Currently Rented'}
                  </span>
                  <span style="color: #6b7280; font-size: 0.875rem; font-weight: 500;">${item.condition}</span>
                </div>
                
                <button 
                  onclick="showRentalModal('${item.id}', '${item.title.replace(/'/g, "\\'")}', ${item.daily_rate || 0})"
                  style="width: 100%; background-color: var(--color-primary); color: white; padding: 0.875rem; border: none; border-radius: 0.5rem; font-weight: 600; font-size: 1rem; cursor: pointer; transition: background-color 0.2s;"
                  ${item.quantity_available === 0 ? 'disabled style="background-color: #9ca3af; cursor: not-allowed;"' : ''}
                >
                  ${item.quantity_available > 0 ? 'Book Rental' : 'Currently Unavailable'}
                </button>
              </div>
            </div>
          `).join('') : `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; color: #9ca3af;">
              <p style="font-size: 1.125rem;">No rental equipment available at this time.</p>
            </div>
          `}
        </div>
      </div>
    </section>
    
    <!-- Rental Booking Modal -->
    <div id="rentalModal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center; padding: 1rem;">
      <div style="background: white; border-radius: 0.75rem; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 25px rgba(0,0,0,0.3);">
        <div style="padding: 1.5rem; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
          <h3 id="modalTitle" style="font-size: 1.5rem; font-weight: 700; color: #111827;">Book Rental</h3>
          <button onclick="closeRentalModal()" style="background: none; border: none; font-size: 1.5rem; color: #6b7280; cursor: pointer; padding: 0.25rem;">×</button>
        </div>
        
        <form id="rentalForm" method="POST" action="/api/rental-booking" style="padding: 1.5rem;">
          <input type="hidden" name="siteId" value="${siteId}">
          <input type="hidden" id="rentalItemId" name="rentalItemId">
          <input type="hidden" id="rateAmount" name="rateAmount">
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Name *</label>
              <input type="text" name="customerName" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Phone *</label>
              <input type="tel" name="customerPhone" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
            </div>
          </div>
          
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Email *</label>
            <input type="email" name="customerEmail" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
          </div>
          
          <!-- Rental Period -->
          <div style="background: #f9fafb; padding: 1.25rem; border-radius: 0.5rem; margin-bottom: 1rem; border: 1px solid #e5e7eb;">
            <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: #111827;">📅 Rental Period</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Start Date *</label>
                <input type="date" name="startDate" id="startDate" required min="${new Date().toISOString().split('T')[0]}" onchange="calculateTotal()" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
              </div>
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Pickup Time *</label>
                <select name="pickupTime" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
                  <option value="">Select time</option>
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                </select>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">End Date *</label>
                <input type="date" name="endDate" id="endDate" required min="${new Date().toISOString().split('T')[0]}" onchange="calculateTotal()" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
              </div>
              <div>
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Return Time *</label>
                <select name="returnTime" required style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
                  <option value="">Select time</option>
                  <option value="8:00 AM">8:00 AM</option>
                  <option value="9:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                </select>
              </div>
            </div>
            
            <!-- Total Calculation -->
            <div id="totalCalculation" style="margin-top: 1rem; padding: 0.75rem; background: white; border-radius: 0.375rem; display: none;">
              <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.25rem;">Rental Duration: <span id="rentalDays">0</span> days</p>
              <p style="font-size: 1.125rem; font-weight: 700; color: var(--color-primary);">Estimated Total: $<span id="totalAmount">0</span></p>
            </div>
          </div>
          
          <div style="margin-bottom: 1rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem;">
              <input type="checkbox" name="deliveryRequired" onchange="toggleDelivery(this)">
              <span style="font-weight: 600; color: #374151;">Request Delivery</span>
            </label>
          </div>
          
          <div id="deliveryAddress" style="display: none; margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Delivery Address</label>
            <textarea name="deliveryAddress" rows="2" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;" placeholder="Street address, city, state, zip"></textarea>
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #374151;">Special Requests</label>
            <textarea name="notes" rows="3" style="width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;" placeholder="Any special requests or notes..."></textarea>
          </div>
          
          <button type="submit" style="width: 100%; background-color: var(--color-primary); color: white; padding: 1rem; border: none; border-radius: 0.5rem; font-weight: 600; font-size: 1.125rem; cursor: pointer;">
            Submit Rental Request
          </button>
        </form>
      </div>
    </div>
    
    <script>
      function showRentalModal(itemId, itemTitle, dailyRate) {
        document.getElementById('rentalModal').style.display = 'flex';
        document.getElementById('modalTitle').textContent = 'Book: ' + itemTitle;
        document.getElementById('rentalItemId').value = itemId;
        document.getElementById('rateAmount').value = dailyRate;
        document.body.style.overflow = 'hidden';
      }
      
      function closeRentalModal() {
        document.getElementById('rentalModal').style.display = 'none';
        document.getElementById('rentalForm').reset();
        document.body.style.overflow = 'auto';
      }
      
      function toggleDelivery(checkbox) {
        document.getElementById('deliveryAddress').style.display = checkbox.checked ? 'block' : 'none';
      }
      
      function calculateTotal() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const dailyRate = parseFloat(document.getElementById('rateAmount').value);
        
        if (startDate && endDate && dailyRate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
          
          if (days > 0) {
            const total = days * dailyRate;
            document.getElementById('rentalDays').textContent = days;
            document.getElementById('totalAmount').textContent = total.toFixed(2);
            document.getElementById('totalCalculation').style.display = 'block';
          }
        }
      }
      
      // Handle rental form submission
      document.getElementById('rentalForm').addEventListener('submit', function(e) {
        e.preventDefault();
        var form = this;
        var formData = new FormData(form);
        var data = {};
        formData.forEach(function(value, key) { data[key] = value; });
        data.totalAmount = document.getElementById('totalAmount')?.textContent || '0';
        data.rentalDays = document.getElementById('rentalDays')?.textContent || '0';
        
        var btn = form.querySelector('button[type=submit]');
        btn.textContent = 'Submitting...';
        btn.disabled = true;
        
        fetch('/api/rental/book/' + data.siteId, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        .then(function(res) { return res.json(); })
        .then(function(result) {
          if (result.error) {
            alert('Error: ' + result.error);
            btn.textContent = 'Submit Rental Request';
            btn.disabled = false;
          } else {
            form.closest('#rentalModal').querySelector('form').innerHTML = '<div style="text-align: center; padding: 3rem;"><h3 style="color: var(--color-primary); font-size: 1.5rem; margin-bottom: 1rem;">✅ Rental Request Submitted!</h3><p style="color: #6b7280;">We will contact you to confirm your booking.</p></div>';
          }
        })
        .catch(function() {
          alert('Something went wrong. Please try again.');
          btn.textContent = 'Submit Rental Request';
          btn.disabled = false;
        });
      });
    </script>
    `;
  }

  return `
  ${renderPageHero(heading, subheading, colors, heroImage, 'rentalsPage')}
  ${renderPageContentSection(contentHeading, contentText, colors)}
  <section style="padding: 8rem 0; text-align: center;">
    <div class="container" style="max-width: 600px;">
      <div style="width: 80px; height: 80px; margin: 0 auto 2rem; background: var(--color-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 2rem; color: white;">🚜</span>
      </div>
      <h1 style="margin-bottom: 1rem; color: var(--color-primary);">${heading}</h1>
      <p style="color: #6b7280; font-size: 1.125rem;">
        Rental equipment coming soon. Check back later!
      </p>
    </div>
  </section>
  `;
}

// ============================================
// SHARED PAGE HERO (used on all non-home pages)
// ============================================
function renderPageHero(
  heading: string,
  subheading: string,
  colors: any,
  backgroundImage?: string,
  dataSectionId?: string
): string {
  return `
  <!-- Page Hero Section -->
  <section class="relative overflow-hidden" data-section="${dataSectionId || 'pageHero'}" style="position: relative; overflow: hidden;">
    <!-- Background Image with Color Overlay -->
    ${backgroundImage ? `
    <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('${backgroundImage}'); background-size: cover; background-position: center; background-repeat: no-repeat;"></div>
    <div class="absolute inset-0" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${colors.primary}; opacity: 0.75;"></div>
    ` : `
    <div class="absolute inset-0" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${colors.primary};"></div>
    `}
    
    <!-- Content -->
    <div style="position: relative; max-width: 1200px; margin: 0 auto; padding: 8rem 2rem;">
      <div style="text-align: center; max-width: 48rem; margin: 0 auto;">
        <h1 style="font-size: 3rem; font-weight: 700; color: white; letter-spacing: -0.025em; margin-bottom: 1rem; line-height: 1.15;">
          ${heading}
        </h1>
        <p style="font-size: 1.25rem; color: rgba(255, 255, 255, 0.9); line-height: 1.6;">
          ${subheading}
        </p>
      </div>
    </div>
  </section>
  `;
}

// ============================================
// SHARED CONTENT SECTION (h2 + text block)
// ============================================
function renderPageContentSection(
  contentHeading: string,
  contentText: string,
  colors: any
): string {
  if (!contentHeading && !contentText) return '';
  
  return `
  <!-- Editable Content Section -->
  <section style="padding: 4rem 0; background-color: #f9fafb;">
    <div class="container" style="max-width: 900px; margin: 0 auto;">
      ${contentHeading ? `
      <h2 style="font-size: 2rem; font-weight: 700; color: var(--color-primary); margin-bottom: 1.5rem; line-height: 1.3;">
        ${contentHeading}
      </h2>
      ` : ''}
      ${contentText ? `
      <div style="font-size: 1.125rem; color: #374151; line-height: 1.8;">
        ${contentText}
      </div>
      ` : ''}
    </div>
  </section>
  `;
}

// ============================================
// CORPORATE EDGE SPECIFIC RENDER FUNCTIONS
// ============================================

function renderCorporateEdgeHero(getContent: (key: string) => string, colors: any, subscriptionTier: string = 'basic') {
  const heroHeadline = getContent('hero.headline') || getContent('hero.heading');
  const heroSubheadline = getContent('hero.subheadline') || getContent('hero.subheading');
  const heroCta = getContent('hero.ctaButton');
  const heroBackground = getContent('hero.backgroundImage');

  return `
  <!-- Hero Section with Editable Background -->
  <section class="relative overflow-hidden" data-section="hero" style="position: relative; overflow: hidden;">
    <!-- Background Image with Color Overlay -->
    ${heroBackground ? `
    <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('${heroBackground}'); background-size: cover; background-position: center; background-repeat: no-repeat;"></div>
    <div class="absolute inset-0" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${colors.primary}; opacity: 0.75;"></div>
    ` : `
    <div class="absolute inset-0" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: ${colors.primary};"></div>
    `}
    
    <!-- Content -->
    <div style="position: relative; max-width: 1200px; margin: 0 auto; padding: 10rem 2rem 14rem;">
      <div style="max-width: 44rem;">
        <h1 style="font-size: 3.25rem; font-weight: 800; color: white; letter-spacing: -0.03em; margin-bottom: 1.75rem; line-height: 1.1;">
          ${heroHeadline}
        </h1>
        <p style="font-size: 1.25rem; color: rgba(255, 255, 255, 0.9); margin-bottom: 2.5rem; line-height: 1.7; font-weight: 400;">
          ${heroSubheadline}
        </p>
        ${heroCta ? `
        <button style="background-color: ${colors.secondary}; color: white; padding: 1rem 2.25rem; border-radius: 0.5rem; font-weight: 600; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; border: none; transition: opacity 0.2s;">
          ${heroCta}
        </button>
        ` : ''}
      </div>
    </div>
  </section>
  `;
}

function renderTrustBadges(getContent: (key: string) => string, colors: any) {
  return `
  <section data-section="trustBadges" style="padding: 5rem 0; background-color: #f8fafc;">
    <div style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
        ${[1, 2, 3, 4].map(num => {
          const title = getContent(`trustBadges.badge${num}Title`);
          const text = getContent(`trustBadges.badge${num}Text`);
          const icon = getContent(`trustBadges.badge${num}Icon`) || '✓';
          if (!title) return '';
          
          return `
          <div style="text-align: center; padding: 2.5rem 2rem; background-color: white; border-radius: 0.75rem; border: 1px solid #e2e8f0;">
            <div style="display: inline-flex; align-items: center; justify-content: center; width: 3.5rem; height: 3.5rem; border-radius: 50%; background-color: ${colors.accent}; color: white; font-size: 1.5rem; margin-bottom: 1.25rem;">
              ${icon}
            </div>
            <h3 style="font-size: 1.0625rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">
              ${title}
            </h3>
            <p style="color: #64748b; line-height: 1.6; font-size: 0.9375rem;">
              ${text}
            </p>
          </div>
          `;
        }).join('')}
      </div>
    </div>
  </section>
  `;
}

function renderStats(getContent: (key: string) => string, colors: any) {
  return `
  <section data-section="stats" style="padding: 5rem 0; background: linear-gradient(135deg, ${colors.primary} 0%, #1e40af 100%);">
    <div style="max-width: 1200px; margin: 0 auto; padding: 0 2rem;">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 3rem;">
        ${[1, 2, 3, 4].map(num => {
          const number = getContent(`stats.stat${num}Number`);
          const label = getContent(`stats.stat${num}Label`);
          if (!number) return '';
          
          return `
          <div style="text-align: center;">
            <div style="font-size: 3rem; font-weight: 800; color: white; margin-bottom: 0.5rem; line-height: 1; letter-spacing: -0.02em;">
              ${number}
            </div>
            <div style="color: rgba(255, 255, 255, 0.85); font-size: 0.8125rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em;">
              ${label}
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
  </section>
  `;
}



// ============================================
// DEMO OVERRIDES
// Minimal overrides per template for demo previews.
// All other content comes from each template's
// config_json defaults automatically.
// ============================================

const DEMO_OVERRIDES: Record<string, any> = {
  'corporate-edge': {
    businessName: 'Premier Equipment Co.',
    phone: '(555) 123-4567',
    email: 'info@premierequipment.com',
    address: '1234 Industrial Blvd, Springfield, IL 62701',
    manufacturers: ['John Deere', 'Exmark', 'Stihl', 'Husqvarna', 'Kubota', 'Scag', 'Toro', 'Echo'],
    extraContent: {
      'business.name': 'Premier Equipment Co.',
      'business.phone': '(555) 123-4567',
      'business.email': 'info@premierequipment.com',
      'business.address': '1234 Industrial Blvd, Springfield, IL 62701',
      'business.hours': JSON.stringify({
        monday: { open: '07:00', close: '18:00' }, tuesday: { open: '07:00', close: '18:00' },
        wednesday: { open: '07:00', close: '18:00' }, thursday: { open: '07:00', close: '18:00' },
        friday: { open: '07:00', close: '18:00' }, saturday: { open: '08:00', close: '16:00' },
        sunday: { open: '', close: '' },
      }),
      'social.facebook': 'https://facebook.com/premierequipment',
      'social.linkedin': 'https://linkedin.com/company/premierequipment',
      'social.youtube': 'https://youtube.com/@premierequipment',
      'hero.heading': 'Professional Lawn Care Equipment You Can Trust',
      'hero.subheading': 'Serving commercial landscapers and homeowners for over 25 years with quality equipment, expert service, and unmatched reliability.',
      'hero.ctaPrimary': 'Browse Inventory',
      'hero.ctaSecondary': 'Schedule Consultation',
      'hero.image': '/images/hero-mower.jpg',
      'footer.tagline': 'Your Trusted Partner in Professional Lawn Care Equipment',
      'cta.heading': 'Ready to Upgrade Your Equipment?',
      'cta.description': 'Schedule a consultation with our equipment specialists to find the perfect solution for your needs.',
      'cta.button': 'Schedule Consultation',
      'services.heading': 'Service Department',
      'services.description': 'Factory-trained technicians providing expert repair and maintenance services for all major equipment brands.',
      'services.items': JSON.stringify([
        { icon: '🔧', title: 'Equipment Repair', description: 'Full-service repair for all major brands with certified technicians.', features: ['All major brands', 'Factory parts', 'Quick turnaround'] },
        { icon: '⚙', title: 'Preventive Maintenance', description: 'Scheduled maintenance programs designed for commercial operators.', features: ['Seasonal tune-ups', 'Oil changes', 'Blade sharpening'] },
        { icon: '📦', title: 'Parts Department', description: 'Extensive parts inventory for quick repairs with OEM and aftermarket parts.', features: ['OEM parts', 'Next-day delivery', 'Expert advice'] },
        { icon: '📋', title: 'Warranty Work', description: 'Authorized warranty service center for all major manufacturers.', features: ['Factory authorized', 'No hassle claims', 'Loaner equipment'] },
      ]),
      'contact.heading': 'Contact Us',
      'contact.description': "Get in touch with our team. We're here to help with sales, service, rentals, and any questions.",
      'inventory.heading': 'Equipment Inventory',
      'inventory.description': "Browse our complete selection of professional lawn care equipment.",
      'rentals.heading': 'Equipment Rentals',
      'rentals.description': 'Professional equipment when you need it. Flexible daily, weekly, and monthly rental options.',
      'manufacturers.heading': 'Our Manufacturers',
      'manufacturers.description': "We're proud to be an authorized dealer for the industry's most trusted brands.",
      'whyChoose.heading': 'Why Choose Us',
      'whyChoose.description': "We're committed to providing the highest level of service and support.",
      'whyChoose.items': JSON.stringify([
        { icon: '🛡', title: 'Authorized Dealer', description: 'Factory-authorized for all major brands' },
        { icon: '🏆', title: 'Certified Technicians', description: 'Factory-trained service professionals' },
        { icon: '📋', title: 'Warranty Available', description: 'Extended protection plans offered' },
        { icon: '👥', title: 'Family Owned', description: 'Proudly serving since 1998' },
      ]),
      'stats.items': JSON.stringify([
        { value: '25+', label: 'Years Experience' },
        { value: '10,000+', label: 'Customers Served' },
        { value: '5', label: 'Locations' },
        { value: '50+', label: 'Certified Technicians' },
      ]),
      'testimonials.items': JSON.stringify([
        { quote: "Premier Equipment has been our go-to dealer for over 15 years. Their service department is second to none.", name: 'Michael Thompson', title: 'Operations Manager', company: 'GreenScape Landscaping' },
        { quote: "When we expanded our fleet, the team at Premier helped us choose the right equipment for our needs.", name: 'Sarah Martinez', title: 'Owner', company: 'Martinez Lawn Care' },
        { quote: "The financing options and trade-in program made upgrading our equipment painless.", name: 'David Chen', title: 'Fleet Manager', company: 'ProCut Commercial Services' },
      ]),
    },
sampleProducts: [
      { id: 'demo-1', name: 'TimeCutter MyRIDE 54" Zero Turn Mower', brand: 'Toro', price: 5199, category: 'Mowers', condition: 'new', image_url: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/75757-1.jpeg', description: '54 in. TimeCutter MyRIDE Zero Turn Mower with Smart Speed technology.' },
      { id: 'demo-2', name: 'Z Master Revolution 60" Commercial Mower', brand: 'Toro', price: 44443, category: 'Mowers', condition: 'new', image_url: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/1-22.png', description: 'Commercial zero-turn with 60 in. TURBO FORCE deck and Horizon Technology.' },
      { id: 'demo-3', name: 'GrandStand 52" Stand-On Mower', brand: 'Toro', price: 13443, category: 'Mowers', condition: 'new', image_url: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/74513.jpeg', description: '52 in. stand-on mower with 22 HP Kohler engine and TURBO FORCE deck.' },
      { id: 'demo-4', name: '30" TurfMaster HDX Walk-Behind', brand: 'Toro', price: 3110, category: 'Mowers', condition: 'new', image_url: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/22215-1.jpeg', description: '30 in. commercial walk-behind with Kawasaki engine and blade brake clutch.' },
      { id: 'demo-5', name: '60V Brushless String Trimmer', brand: 'Toro', price: 229, category: 'Trimmers', condition: 'new', image_url: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/1-4.png', description: '14/16 in. dual-line trimmer head with brushless motor. 2.5Ah battery included.' },
      { id: 'demo-6', name: '60V MAX Brushless Leaf Blower', brand: 'Toro', price: 229, category: 'Blowers', condition: 'new', image_url: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/120.png', description: '120 mph max air speed brushless handheld blower. 2.5Ah battery included.' },
    ],
  },
  'green-valley-industrial': {
    businessName: 'Valley Power Equipment',
    phone: '(303) 555-0298',
    email: 'info@valleypower.com',
    address: '1200 Industrial Pkwy, Denver, CO 80221',
    manufacturers: ['Toro', 'Bobcat', 'Ventrac', 'Stihl', 'Scag', 'Walker'],
    extraContent: {
      'businessInfo.city': 'Denver',
      'businessInfo.state': 'CO',
      'businessInfo.zip': '80221',
      'hero.heading': 'Power Your Property',
      'hero.subheading': 'Premium outdoor and turf equipment for professionals and homeowners. Sales, service, and rentals you can count on.',
      'hero.image': '/images/hero-mower.jpg',
      'hero.ctaButton': 'Browse Equipment',
      'featured.heading': 'Featured Equipment',
      'featured.subheading': 'Top picks from our showroom floor',
      'cta.heading': 'Ready to Get Started?',
      'cta.subheading': 'Visit our showroom or give us a call. Our expert team is ready to help you find the right equipment for your needs.',
      'cta.primaryButton': 'Browse Inventory',
      'cta.secondaryButton': 'Contact Us',
      'testimonials.heading': 'What Our Customers Say',
      'testimonials.quote': 'Valley Power Equipment has been instrumental in keeping our fleet running. Their Bobcat service team is the best in Colorado.',
      'testimonials.author': 'Mark Henderson',
      'testimonials.role': 'Fleet Manager, Henderson Landscaping',
      'testimonials.items': JSON.stringify([
        { quote: "Valley Power has been our go-to equipment dealer for 8 years. Their Bobcat and Toro expertise is unmatched.", name: 'Mark Henderson', title: 'Fleet Manager', company: 'Henderson Landscaping' },
        { quote: "When our Ventrac went down mid-season, they had us back up and running the same day. That kind of service is priceless.", name: 'Lisa Ramirez', title: 'Owner', company: 'Rocky Mountain Turf Care' },
        { quote: "The rental program helped us test equipment before committing to a purchase. Smart way to do business.", name: 'Tom Bradley', title: 'Operations Director', company: 'Front Range Property Services' },
      ]),
      'servicePage.heading': 'Expert Service & Repair',
      'servicePage.subheading': 'Keep your equipment running at peak performance with our certified technicians.',
      'servicePage.service1Title': 'Equipment Repair',
      'servicePage.service1Description': 'Complete diagnostic and repair services for all major equipment brands. Factory-trained technicians with OEM parts.',
      'servicePage.service2Title': 'Preventive Maintenance',
      'servicePage.service2Description': 'Regular maintenance programs to extend equipment life and prevent costly breakdowns.',
      'servicePage.service3Title': 'Parts & Accessories',
      'servicePage.service3Description': 'Genuine OEM parts and quality aftermarket options. In-stock or next-day delivery available.',
      'contactPage.heading': 'Get In Touch',
      'contactPage.subheading': 'Have questions about our equipment or services? We are here to help.',
      'contactPage.formHeading': 'Send Us a Message',
      'contactPage.locationHeading': 'Visit Our Showroom',
      'manufacturersPage.heading': 'Our Partner Manufacturers',
      'manufacturersPage.subheading': 'Authorized dealer for industry-leading equipment brands.',
      'manufacturersPage.introText': 'As an authorized dealer, we provide factory-trained service, genuine parts, and warranty support for every brand we carry.',
      'inventoryPage.heading': 'Equipment Inventory',
      'inventoryPage.subheading': 'Browse our complete selection of professional-grade equipment.',
      'rentalsPage.heading': 'Equipment Rentals',
      'rentalsPage.subheading': 'Professional-grade equipment available by the day, week, or month.',
      'footer.tagline': 'Quality equipment. Expert service. Since 1998.',
      'hours.monday': '7:30 AM - 5:30 PM',
      'hours.tuesday': '7:30 AM - 5:30 PM',
      'hours.wednesday': '7:30 AM - 5:30 PM',
      'hours.thursday': '7:30 AM - 5:30 PM',
      'hours.friday': '7:30 AM - 5:30 PM',
      'hours.saturday': '8:00 AM - 3:00 PM',
      'hours.sunday': 'Closed',
      'social.facebook': 'https://facebook.com/valleypower',
      'social.instagram': 'https://instagram.com/valleypower',
    },
sampleProducts: [
      { id: 'demo-p1', title: 'TimeCutter\u00ae MyRIDE\u00ae 54" Zero Turn Mower', description: '54 in. TimeCutter MyRIDE Zero Turn Mower with Smart Speed technology.', price: 5199, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/75757-1.jpeg', model: '75757', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-timecutter-myride-54', featured: true, status: 'available' },
      { id: 'demo-p2', title: 'Z Master Revolution 60" Commercial Mower', description: 'Commercial zero-turn with 60 in. TURBO FORCE deck and Horizon Technology.', price: 44443, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/1-22.png', model: 'Z Master Revolution', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-z-master-revolution-60', featured: true, status: 'available' },
      { id: 'demo-p3', title: 'GrandStand\u00ae 52" Stand-On Mower', description: '52 in. stand-on mower with 22 HP Kohler engine and TURBO FORCE deck.', price: 13443, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/74513.jpeg', model: 'GrandStand 74513', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-grandstand-52', featured: true, status: 'available' },
      { id: 'demo-p4', title: '30" TurfMaster\u00ae HDX Walk-Behind', description: '30 in. commercial walk-behind with Kawasaki engine and blade brake clutch.', price: 3110, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/22215-1.jpeg', model: 'TurfMaster HDX 22215', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-turfmaster-hdx-30', featured: true, status: 'available' },
      { id: 'demo-p5', title: '60V Brushless String Trimmer', description: '14/16 in. dual-line trimmer head with brushless motor. 2.5Ah battery included.', price: 229, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/1-4.png', model: '51836T', year: 2025, category: 'Trimmers', condition: 'new', slug: 'toro-60v-string-trimmer', featured: false, status: 'available' },
      { id: 'demo-p6', title: '60V MAX Brushless Leaf Blower', description: '120 mph max air speed brushless handheld blower. 2.5Ah battery included.', price: 229, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/120.png', model: '51820', year: 2025, category: 'Blowers', condition: 'new', slug: 'toro-60v-leaf-blower', featured: false, status: 'available' },
    ],
  },
  'modern-lawn-solutions': {
    businessName: 'Modern Lawn Solutions',
    phone: '(512) 555-0198',
    email: 'hello@modernlawn.com',
    address: '900 Tech Row, Austin, TX 78701',
    manufacturers: ['Toro', 'Exmark', 'ECHO', 'Honda', 'Husqvarna', 'Kubota'],
    extraContent: {
      'hero.heading': 'Your Trusted Equipment Partner',
      'hero.subheading': 'Premium lawn care equipment, expert service, and everything you need to get the job done right.',
      'hero.image': '/images/hero-mower.jpg',
      'hero.ctaPrimary': 'Shop Equipment',
      'hero.ctaSecondary': 'Book Service',
      'testimonials.heading': 'What Our Customers Say',
      'testimonials.items': JSON.stringify([
        { quote: "Modern Lawn Solutions helped me find the perfect zero-turn for my 3-acre property. Their team really knows their stuff.", name: 'Mike Johnson', title: 'Homeowner', company: '' },
        { quote: "I've been buying equipment here for 5 years. Their service department keeps our fleet running like new.", name: 'Sarah Williams', title: 'Owner', company: 'Williams Landscaping' },
        { quote: "The staff took time to understand our commercial needs. We upgraded our entire fleet and couldn't be happier.", name: 'David Chen', title: 'Property Manager', company: 'Austin Property Group' },
      ]),
    },
    sampleProducts: [
      { id: 'demo-p1', title: 'TimeCutter\u00ae MyRIDE\u00ae 54" Zero Turn Mower', description: '54 in. TimeCutter MyRIDE Zero Turn Mower with Smart Speed technology.', price: 5199, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/75757-1.jpeg', model: '75757', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-timecutter-myride-54', featured: true, status: 'available' },
      { id: 'demo-p2', title: 'Z Master Revolution 60" Commercial Mower', description: 'Commercial zero-turn with 60 in. TURBO FORCE deck and Horizon Technology.', price: 44443, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/1-22.png', model: 'Z Master Revolution', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-z-master-revolution-60', featured: true, status: 'available' },
      { id: 'demo-p3', title: 'GrandStand\u00ae 52" Stand-On Mower', description: '52 in. stand-on mower with 22 HP Kohler engine and TURBO FORCE deck.', price: 13443, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/74513.jpeg', model: 'GrandStand 74513', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-grandstand-52', featured: true, status: 'available' },
      { id: 'demo-p4', title: '30" TurfMaster\u00ae HDX Walk-Behind', description: '30 in. commercial walk-behind with Kawasaki engine and blade brake clutch.', price: 3110, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/22215-1.jpeg', model: 'TurfMaster HDX 22215', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-turfmaster-hdx-30', featured: true, status: 'available' },
      { id: 'demo-p5', title: '60V Brushless String Trimmer', description: '14/16 in. dual-line trimmer head with brushless motor. 2.5Ah battery included.', price: 229, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/1-4.png', model: '51836T', year: 2025, category: 'Trimmers', condition: 'new', slug: 'toro-60v-string-trimmer', featured: false, status: 'available' },
      { id: 'demo-p6', title: '60V MAX Brushless Leaf Blower', description: '120 mph max air speed brushless handheld blower. 2.5Ah battery included.', price: 229, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/120.png', model: '51820', year: 2025, category: 'Blowers', condition: 'new', slug: 'toro-60v-leaf-blower', featured: false, status: 'available' },
    ],
  },
  'vibe-dynamics': {
    businessName: 'VibePower Equipment',
    phone: '(305) 555-0342',
    email: 'hello@vibepower.com',
    address: '200 Neon Ave, Miami, FL 33101',
    manufacturers: ['Toro', 'Bobcat', 'EGO', 'ECHO', 'Husqvarna', 'Honda'],
    extraContent: {
      'businessInfo.city': 'Miami',
      'businessInfo.state': 'FL',
      'businessInfo.zip': '33101',
      'hero.title': 'POWER YOUR LAWN',
      'hero.subtitle': 'Premium Equipment. Expert Service.',
      'hero.image': '/images/hero-mower.jpg',
      'hero.description': 'We\'ve been helping homeowners and professionals get the job done right for over 25 years.',
      'hero.ctaPrimary': 'Shop Equipment',
      'hero.ctaSecondary': 'View Rentals',
      'featured.heading': 'FEATURED EQUIPMENT',
      'featured.subheading': 'Top-rated products from the brands you trust',
      'stats.stat1Value': '25+',
      'stats.stat1Label': 'Years Experience',
      'stats.stat2Value': '5,000+',
      'stats.stat2Label': 'Happy Customers',
      'stats.stat3Value': '500+',
      'stats.stat3Label': 'Products In Stock',
      'stats.stat4Value': '24/7',
      'stats.stat4Label': 'Support Available',
      'services.heading': 'OUR SERVICES',
      'services.service1Title': 'Equipment Repair',
      'services.service1Description': 'Expert repair services for all major brands. Our certified technicians can fix anything.',
      'services.service2Title': 'Scheduled Maintenance',
      'services.service2Description': 'Keep your equipment running smoothly with our preventive maintenance packages.',
      'services.service3Title': 'Parts & Accessories',
      'services.service3Description': 'Genuine OEM parts and quality aftermarket accessories for all your equipment.',
      'services.service4Title': 'Pickup & Delivery',
      'services.service4Description': 'Convenient pickup and delivery service available for service and rentals.',
      'testimonials.heading': 'WHAT PEOPLE SAY',
      'testimonials.items': JSON.stringify([
        { quote: "VibePower is hands down the best equipment dealer in Miami. They set us up with an EGO battery fleet that changed our business.", name: 'Carlos Rivera', title: 'Owner', company: 'Rivera Lawn & Garden' },
        { quote: "These guys are AMAZING! Fast service, great selection, and the staff actually knows what they're talking about.", name: 'Jessica Nguyen', title: 'Operations Manager', company: 'Sunshine Property Care' },
        { quote: "Switched from gas to battery-powered equipment with their help. Lower noise, zero emissions, and our clients love it.", name: 'Derek Williams', title: 'Founder', company: 'GreenWave Landscaping' },
      ]),
      'manufacturers.heading': 'TRUSTED BRANDS',
      'manufacturers.subheading': 'Authorized dealer for the best names in outdoor power',
      'cta.heading': 'READY TO POWER UP?',
      'cta.subheading': 'Visit our showroom or call us today. Let\'s find the perfect equipment for your project.',
      'cta.button': 'LET\'S GO!',
      'cta.primaryButton': 'LET\'S GO!',
      'servicePage.heading': 'Expert Service & Repair',
      'servicePage.subheading': 'Factory-trained technicians keeping your gear in peak condition.',
      'servicePage.service1Title': 'Equipment Repair',
      'servicePage.service1Description': 'Complete diagnostic and repair for all major outdoor power equipment brands.',
      'servicePage.service2Title': 'Tune-Ups & Maintenance',
      'servicePage.service2Description': 'Seasonal maintenance programs to keep your equipment running at its best.',
      'servicePage.service3Title': 'Parts Counter',
      'servicePage.service3Description': 'Huge inventory of OEM and aftermarket parts. Walk-in or order online.',
      'contactPage.heading': 'Get In Touch',
      'contactPage.subheading': 'Drop us a line — we\'re always stoked to help.',
      'inventoryPage.heading': 'Equipment Inventory',
      'inventoryPage.subheading': 'Browse our full lineup of professional-grade equipment.',
      'rentalsPage.heading': 'Equipment Rentals',
      'rentalsPage.subheading': 'Pro-grade equipment available daily, weekly, or monthly.',
      'manufacturersPage.heading': 'Our Partner Brands',
      'manufacturersPage.subheading': 'We proudly carry and service these industry-leading brands.',
      'footer.tagline': 'Your trusted partner for premium lawn care equipment, rentals, and expert service.',
      'hours.monday': '8:00 AM - 6:00 PM',
      'hours.tuesday': '8:00 AM - 6:00 PM',
      'hours.wednesday': '8:00 AM - 6:00 PM',
      'hours.thursday': '8:00 AM - 6:00 PM',
      'hours.friday': '8:00 AM - 6:00 PM',
      'hours.saturday': '9:00 AM - 4:00 PM',
      'hours.sunday': 'Closed',
      'social.facebook': 'https://facebook.com/vibepower',
      'social.instagram': 'https://instagram.com/vibepower',
    },
sampleProducts: [
      { id: 'demo-p1', title: 'TimeCutter\u00ae MyRIDE\u00ae 54" Zero Turn Mower', description: '54 in. TimeCutter MyRIDE Zero Turn Mower with Smart Speed technology.', price: 5199, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/75757-1.jpeg', model: '75757', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-timecutter-myride-54', featured: true, status: 'available' },
      { id: 'demo-p2', title: 'Z Master Revolution 60" Commercial Mower', description: 'Commercial zero-turn with 60 in. TURBO FORCE deck and Horizon Technology.', price: 44443, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/1-22.png', model: 'Z Master Revolution', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-z-master-revolution-60', featured: true, status: 'available' },
      { id: 'demo-p3', title: 'GrandStand\u00ae 52" Stand-On Mower', description: '52 in. stand-on mower with 22 HP Kohler engine and TURBO FORCE deck.', price: 13443, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/74513.jpeg', model: 'GrandStand 74513', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-grandstand-52', featured: true, status: 'available' },
      { id: 'demo-p4', title: '30" TurfMaster\u00ae HDX Walk-Behind', description: '30 in. commercial walk-behind with Kawasaki engine and blade brake clutch.', price: 3110, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/22215-1.jpeg', model: 'TurfMaster HDX 22215', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-turfmaster-hdx-30', featured: true, status: 'available' },
      { id: 'demo-p5', title: '60V Brushless String Trimmer', description: '14/16 in. dual-line trimmer head with brushless motor. 2.5Ah battery included.', price: 229, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/1-4.png', model: '51836T', year: 2025, category: 'Trimmers', condition: 'new', slug: 'toro-60v-string-trimmer', featured: false, status: 'available' },
      { id: 'demo-p6', title: '60V MAX Brushless Leaf Blower', description: '120 mph max air speed brushless handheld blower. 2.5Ah battery included.', price: 229, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/120.png', model: '51820', year: 2025, category: 'Blowers', condition: 'new', slug: 'toro-60v-leaf-blower', featured: false, status: 'available' },
    ],
    colors: {
      primary: '#d97706',
      secondary: '#7c3aed',
      accent: '#ca8a04',
    },
  },
  'zenith-lawn': {
    businessName: 'Zenith Equipment Co.',
    phone: '(555) 246-8100',
    email: 'info@zenithequipment.com',
    address: '782 Garden Lane, Portland, OR 97201',
    manufacturers: ['John Deere', 'Husqvarna', 'Stihl', 'Honda', 'Toro'],
    extraContent: {
      'business.name': 'Zenith Equipment Co.',
      'business.phone': '(555) 246-8100',
      'business.email': 'info@zenithequipment.com',
      'business.address': '782 Garden Lane, Portland, OR 97201',
      'business.hours': JSON.stringify({
        monday: { open: '08:00', close: '18:00' }, tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' }, thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' }, saturday: { open: '09:00', close: '16:00' },
        sunday: { open: '', close: '' },
      }),
      'hero.heading': 'Premium lawn care equipment for professionals.',
      'hero.subheading': "Quality equipment from the world's leading manufacturers. Expert service and support.",
      'hero.ctaPrimary': 'View Inventory',
      'hero.image': '/images/hero-mower.jpg',
      'footer.tagline': 'Premium Lawn Care Solutions',
      'services.heading': 'Service & Repair',
      'services.description': 'Our certified technicians provide expert maintenance and repair services for all major brands.',
      'contact.heading': 'Contact Us',
      'contact.description': "We're here to help with any questions about our equipment, services, or rentals.",
      'inventory.heading': 'Inventory',
      'rentals.heading': 'Equipment Rentals',
      'rentals.description': 'Professional-grade equipment available for short or long-term rental.',
      'manufacturers.heading': 'Our Manufacturers',
      'manufacturers.description': "We are proud to be an authorized dealer for the world's most trusted brands.",
      'testimonials.items': JSON.stringify([
        { quote: "Zenith Equipment transformed our commercial landscape operation. Their expertise in matching us with the right equipment has been invaluable.", name: 'Michael Torres', company: 'Torres Landscaping Co.' },
        { quote: "The minimalist approach extends to their service — no upselling, just honest advice and quality work. Refreshing.", name: 'Anna Kowalski', company: 'Pacific Green Maintenance' },
        { quote: "We spec'd our entire Honda and Husqvarna fleet through Zenith. Impeccable product knowledge and follow-through.", name: 'Ryan Okafor', company: 'Okafor Property Solutions' },
      ]),
    },
sampleProducts: [
      { id: 'demo-1', name: 'TimeCutter MyRIDE 54" Zero Turn Mower', brand: 'Toro', price: 5199, category: 'Mowers', condition: 'new', image_url: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/75757-1.jpeg', description: '54 in. TimeCutter MyRIDE Zero Turn Mower with Smart Speed technology.' },
      { id: 'demo-2', name: 'Z Master Revolution 60" Commercial Mower', brand: 'Toro', price: 44443, category: 'Mowers', condition: 'new', image_url: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/1-22.png', description: 'Commercial zero-turn with 60 in. TURBO FORCE deck and Horizon Technology.' },
      { id: 'demo-3', name: 'GrandStand 52" Stand-On Mower', brand: 'Toro', price: 13443, category: 'Mowers', condition: 'new', image_url: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/74513.jpeg', description: '52 in. stand-on mower with 22 HP Kohler engine and TURBO FORCE deck.' },
      { id: 'demo-4', name: '30" TurfMaster HDX Walk-Behind', brand: 'Toro', price: 3110, category: 'Mowers', condition: 'new', image_url: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/22215-1.jpeg', description: '30 in. commercial walk-behind with Kawasaki engine and blade brake clutch.' },
      { id: 'demo-5', name: '60V Brushless String Trimmer', brand: 'Toro', price: 229, category: 'Trimmers', condition: 'new', image_url: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/1-4.png', description: '14/16 in. dual-line trimmer head with brushless motor. 2.5Ah battery included.' },
      { id: 'demo-6', name: '60V MAX Brushless Leaf Blower', brand: 'Toro', price: 229, category: 'Blowers', condition: 'new', image_url: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/120.png', description: '120 mph max air speed brushless handheld blower. 2.5Ah battery included.' },
    ],
  },
  'warm-earth-designs': {
    businessName: 'Heartland Outdoor Equipment',
    phone: '(217) 555-0183',
    email: 'hello@heartlandoutdoor.com',
    address: '440 Main Street, Springfield, IL 62701',
    manufacturers: ['Toro', 'John Deere', 'Stihl', 'Husqvarna', 'Cub Cadet', 'Honda'],
    extraContent: {
      'hero.heading': 'Equipment You Can Count On',
      'hero.subheading': 'Family-owned and community-trusted since 1985. Sales, service, and rentals for every season.',
      'hero.image': '/images/hero-mower.jpg',
      'hero.ctaPrimary': 'View Equipment',
      'hero.ctaSecondary': 'Contact Us',
      'testimonials.heading': 'From Our Community',
      'testimonials.items': JSON.stringify([
        { quote: "These folks know their equipment. They helped me find the perfect tractor for my 40 acres and have been there for every service since.", name: 'Robert Mitchell', company: 'Timber Creek Ranch' },
        { quote: "The rental program saved us thousands. We tried three different mowers before buying the one that was right for our property.", name: 'Sarah Thompson', company: 'Pine Ridge Farms' },
        { quote: "Family-run businesses like this are rare. They treat us like neighbors, not customers. That means everything out here.", name: 'James Garcia', company: 'Valley View Homestead' },
      ]),
    },
    sampleProducts: [
      { id: 'demo-p1', title: 'TimeCutter\u00ae MyRIDE\u00ae 54" Zero Turn Mower', description: '54 in. TimeCutter MyRIDE Zero Turn Mower with Smart Speed technology.', price: 5199, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/75757-1.jpeg', model: '75757', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-timecutter-myride-54', featured: true, status: 'available' },
      { id: 'demo-p2', title: 'Z Master Revolution 60" Commercial Mower', description: 'Commercial zero-turn with 60 in. TURBO FORCE deck and Horizon Technology.', price: 44443, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/1-22.png', model: 'Z Master Revolution', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-z-master-revolution-60', featured: true, status: 'available' },
      { id: 'demo-p3', title: 'GrandStand\u00ae 52" Stand-On Mower', description: '52 in. stand-on mower with 22 HP Kohler engine and TURBO FORCE deck.', price: 13443, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/74513.jpeg', model: 'GrandStand 74513', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-grandstand-52', featured: true, status: 'available' },
      { id: 'demo-p4', title: '30" TurfMaster\u00ae HDX Walk-Behind', description: '30 in. commercial walk-behind with Kawasaki engine and blade brake clutch.', price: 3110, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/22215-1.jpeg', model: 'TurfMaster HDX 22215', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-turfmaster-hdx-30', featured: true, status: 'available' },
      { id: 'demo-p5', title: '60V Brushless String Trimmer', description: '14/16 in. dual-line trimmer head with brushless motor. 2.5Ah battery included.', price: 229, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/1-4.png', model: '51836T', year: 2025, category: 'Trimmers', condition: 'new', slug: 'toro-60v-string-trimmer', featured: false, status: 'available' },
      { id: 'demo-p6', title: '60V MAX Brushless Leaf Blower', description: '120 mph max air speed brushless handheld blower. 2.5Ah battery included.', price: 229, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/120.png', model: '51820', year: 2025, category: 'Blowers', condition: 'new', slug: 'toro-60v-leaf-blower', featured: false, status: 'available' },
    ],
  },
};
