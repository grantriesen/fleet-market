import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { renderGreenValleyPage } from './templates/green-valley-industrial';
import { renderVibeDynamicsPage } from './templates/vibe-dynamics';
import { renderCorporateEdgePage } from './templates/corporate-edge';
import { renderZenithLawnPage } from './templates/zenith-lawn';
import { renderModernLawnPage } from './templates/modern-lawn-solutions';
import { renderWarmEarthPage } from './templates/warm-earth-designs';
import { injectCartSystem } from './templates/shared';

export async function GET(
  request: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'home';
    
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

    // Load site data
    const { data: site } = await supabase
      .from('sites')
      .select(`
        id,
        site_name,
        slug,
        subscription_tier,
        addons,
        checkout_mode,
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

    // Load featured inventory (same as live site)
    const { data: featuredItems } = await supabase
      .from('inventory_items')
      .select('id, title, description, category, condition, price, sale_price, model, year, primary_image, slug, featured, status')
      .eq('site_id', params.siteId).eq('featured', true).eq('status', 'available')
      .order('display_order').limit(8);

    // Use the same render pipeline as the live site
    const html = await generateTemplateHTML(
      site,
      content,
      customizations,
      manufacturers || [],
      featuredItems || [],
      sectionVisibility,
      pageVisibility,
      page,
      supabase,
      params.siteId
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
  featuredItems: any[],
  sectionVisibility: Record<string, boolean>,
  pageVisibility: Record<string, boolean>,
  page: string,
  supabase: any,
  siteId: string
): Promise<string> {
  const template = site.template;
  const config = template.config_json;
  const templateSlug = template.slug;

  const getContent = (key: string) => {
    if (content[key]) return content[key];
    const parts = key.split('.');
    if (parts.length === 2) { const [section, field] = parts; return config.sections?.[section]?.[field]?.default || ''; }
    return '';
  };

  const colors = {
    primary: customizations.colors?.primary || config.colors?.primary?.default || '#2D5016',
    secondary: customizations.colors?.secondary || config.colors?.secondary?.default || '#F97316',
    accent: customizations.colors?.accent || config.colors?.accent?.default || '#059669',
  };
  const fonts = {
    heading: customizations.fonts?.heading || config.fonts?.heading?.default || 'Inter',
    body: customizations.fonts?.body || config.fonts?.body?.default || 'Inter',
  };

  const availablePages = (config.pages || []).filter((p: any) => {
    const isVisible = pageVisibility[p.slug] !== false;
    if (!isVisible) return false;
    if (!p.premium) return true;
    return site.subscription_tier !== 'basic';
  });

  const fontFamilies = new Set([fonts.heading, fonts.body]);
  const googleFontsUrl = Array.from(fontFamilies)
    .map((f: any) => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900`)
    .join('&');

  const isRealProducts = featuredItems.length > 0;
  const displayProducts = isRealProducts
    ? featuredItems.slice(0, 4)
    : [1,2,3,4].map(i => ({ id: `placeholder-${i}`, title: `Featured Product ${i}`, description: 'Professional-grade equipment', price: null, sale_price: null, primary_image: null, category: 'Equipment', condition: 'new', slug: null }));

  const fmtPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'Call for Price';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  };

  // Build enabled features
  const enabledFeatures = new Set<string>();
  const addonToFeatureMap: Record<string, string[]> = {
    'inventory': ['inventory', 'inventory_sync'],
    'service':   ['service', 'service_scheduling'],
    'rentals':   ['rentals', 'rental_scheduling'],
  };
  (site.addons || []).forEach((addon: string) => {
    enabledFeatures.add(addon);
    addonToFeatureMap[addon]?.forEach((f: string) => enabledFeatures.add(f));
  });
  try {
    const { data: features } = await supabase.from('site_features').select('feature_key').eq('site_id', siteId).eq('enabled', true);
    if (features) features.forEach((f: any) => enabledFeatures.add(f.feature_key));
  } catch {}

  const vis: Record<string, boolean> = {};
  Object.entries(sectionVisibility).forEach(([k, v]) => { vis[k] = v as boolean; });

  // Use preview base URL so nav links stay within the preview iframe
  const previewBase = `/api/preview/${siteId}?page=`;

  // ── Route to the SAME template functions used by the live site ──
  let html = '';
  if (templateSlug === 'green-valley-industrial') {
    html = await renderGreenValleyPage(getContent, colors, fonts, manufacturers, sectionVisibility, siteId, site.site_name, displayProducts, isRealProducts, fmtPrice, availablePages, page, googleFontsUrl, supabase, previewBase, site.addons || [], site.checkout_mode || 'quote_only');
  } else if (templateSlug === 'vibe-dynamics') {
    html = await renderVibeDynamicsPage(getContent, colors, fonts, manufacturers, sectionVisibility, siteId, site.site_name, displayProducts, isRealProducts, fmtPrice, availablePages, page, googleFontsUrl, supabase, previewBase, site.addons || [], site.checkout_mode || 'quote_only');
  } else if (templateSlug === 'corporate-edge') {
    html = renderCorporateEdgePage(siteId, page, availablePages, displayProducts, config, customizations, enabledFeatures, vis, content, manufacturers, previewBase, supabase, site.addons || []);
  } else if (templateSlug === 'zenith-lawn') {
    html = await renderZenithLawnPage(siteId, page, availablePages, displayProducts, config, customizations, enabledFeatures, vis, content, previewBase, supabase, site.addons || []);
  } else if (templateSlug === 'modern-lawn-solutions') {
    html = await renderModernLawnPage(siteId, page, availablePages, displayProducts, config, customizations, enabledFeatures, vis, content, supabase, previewBase, site.addons || []);
  } else if (templateSlug === 'warm-earth-designs') {
    html = await renderWarmEarthPage(siteId, page, availablePages, displayProducts, config, customizations, enabledFeatures, vis, content, manufacturers, previewBase, supabase, site.addons || []);
  } else {
    // Fallback for unknown templates
    html = '<p style="padding:2rem;">Preview not available for this template.</p>';
  }

  // Inject cart system if needed
  if (
    (enabledFeatures.has('inventory') || enabledFeatures.has('inventory_sync')) &&
    !html.includes('fm-product-modal')
  ) {
    const cartHtml = injectCartSystem(siteId, site.checkout_mode || 'quote_only', colors.primary);
    html = html.includes('</body>') ? html.replace('</body>', cartHtml + '\n</body>') : html + cartHtml;
  }

  return html;


}


// ============================================
// TEMPLATE #1: GREEN VALLEY INDUSTRIAL
// ============================================
function getCtaSectionStyle(getContent: (key: string) => string, fallbackBg: string): string {
  const bgImage = getContent('cta.backgroundImage');
  if (bgImage) {
    return `padding: 6rem 0; background-image: linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url('${bgImage}'); background-size: cover; background-position: center; color: white; text-align: center; position: relative;`;
  }
  return `padding: 5rem 0; ${fallbackBg} color: white; text-align: center;`;
}

// ── Helper: resolve a buttonField destination to a preview URL ──────────────
function resolveButtonHref(
  getContent: (key: string) => string,
  fieldKey: string,
  defaultPage: string,
  siteId: string
): string {
  const dest = getContent(`${fieldKey}.destination`);
  if (!dest) return `/api/preview/${siteId}?page=${defaultPage}`;
  if (dest === '__custom') return getContent(`${fieldKey}.destination_url`) || `/api/preview/${siteId}?page=${defaultPage}`;
  return `/api/preview/${siteId}?page=${dest}`;
}

function renderGreenValleyHome(
  getContent: (key: string) => string,
  colors: any,
  manufacturers: any[],
  sectionVisibility: Record<string, boolean>,
  siteId: string
): string {
  let html = '';

  // Hero - Full-width with overlay
  if (sectionVisibility.hero !== false) {
    html += `
    <section data-section="hero" style="position: relative; min-height: 600px; display: flex; align-items: center; background-image: url('${getContent('hero.image')}'); background-size: cover; background-position: center;">
      <div class="hero-overlay" style="position: absolute; inset: 0; background: linear-gradient(135deg, var(--color-primary) 0%, rgba(0,0,0,0.7) 100%); opacity: 0.85;"></div>
      <div class="container" style="position: relative; z-index: 10;">
        <div style="max-width: 700px; color: white;">
          <h1 style="color: white; font-size: 3.5rem; margin-bottom: 1.5rem; font-weight: 900;">${getContent('hero.heading')}</h1>
          <p style="font-size: 1.25rem; margin-bottom: 2rem; color: rgba(255,255,255,0.9);">${getContent('hero.subheading')}</p>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <a href="${resolveButtonHref(getContent, 'hero.ctaButton', 'contact', siteId)}" style="background-color: var(--color-secondary); color: white; padding: 1rem 2rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">${getContent('hero.ctaButton.text') || getContent('hero.ctaButton')}</a>
          </div>
        </div>
      </div>
    </section>
    `;
  }

  // Featured Section
  if (sectionVisibility.featured !== false) {
    html += `
    <section data-section="featured" style="padding: 5rem 0; background-color: #f9fafb;">
      <div class="container">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--color-primary);">${getContent('featured.heading')}</h2>
          <p style="color: #6b7280; font-size: 1.125rem;">${getContent('featured.subheading')}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem;">
          ${[1, 2, 3, 4].map(i => `
            <div style="background: white; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.3s;">
              <div style="height: 200px; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));"></div>
              <div style="padding: 1.5rem;">
                <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: #1f2937;">Featured Product ${i}</h3>
                <p style="color: #6b7280; margin-bottom: 1rem;">Professional-grade equipment</p>
                <a href="/api/preview/${siteId}?page=inventory" style="display: inline-block; background-color: var(--color-primary); color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; text-decoration: none; font-weight: 600;">Learn More</a>
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
    <section data-section="manufacturers" style="padding: 5rem 0;">
      <div class="container">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 style="font-size: 2.5rem; margin-bottom: 1rem; color: var(--color-primary);">${getContent('manufacturers.heading')}</h2>
          <p style="color: #6b7280; font-size: 1.125rem;">${getContent('manufacturers.subheading')}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 2rem;">
          ${manufacturers.length > 0 ? manufacturers.map(m => `
            <div style="background: white; padding: 2rem; border: 2px solid #e5e7eb; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; min-height: 120px;">
              ${m.logo_url ? `<img src="${m.logo_url}" alt="${m.name}" style="max-height: 60px; max-width: 100%;">` : `<span style="font-weight: 600; color: #4b5563; font-size: 1.125rem;">${m.name}</span>`}
            </div>
          `).join('') : '<div style="grid-column: 1 / -1; text-align: center; color: #9ca3af; padding: 3rem;">No manufacturers added yet</div>'}
        </div>
      </div>
    </section>
    `;
  }

  // Testimonials
  if (sectionVisibility.testimonials !== false) {
    html += `
    <section data-section="testimonials" style="padding: 5rem 0; background-color: #f9fafb;">
      <div class="container">
        <h2 style="font-size: 2.5rem; text-align: center; margin-bottom: 3rem; color: var(--color-primary);">${getContent('testimonials.heading')}</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
          ${[1, 2, 3].map(i => `
            <div style="background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="color: var(--color-secondary); font-size: 3rem; line-height: 1; margin-bottom: 1rem;">"</div>
              <p style="font-style: italic; color: #4b5563; margin-bottom: 1.5rem;">Outstanding service and quality equipment. Highly recommend for any serious landscaping operation!</p>
              <p style="font-weight: 600; color: #1f2937;">Professional Client ${i}</p>
              <p style="color: #6b7280; font-size: 0.875rem;">Landscape Contractor</p>
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
    <section data-section="cta" style="padding: 5rem 0; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: white; text-align: center;">
      <div class="container">
        <h2 style="color: white; font-size: 2.5rem; margin-bottom: 1.5rem;">${getContent('cta.heading')}</h2>
        <p style="font-size: 1.25rem; margin-bottom: 2rem; color: rgba(255,255,255,0.9); max-width: 700px; margin-left: auto; margin-right: auto;">${getContent('cta.subheading')}</p>
        <a href="${resolveButtonHref(getContent, 'cta.primaryButton', 'inventory', siteId)}" style="display: inline-block; background: white; color: var(--color-primary); padding: 1rem 2rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 1.125rem;">${getContent('cta.primaryButton.text') || getContent('cta.primaryButton') || getContent('cta.button')}</a>
      </div>
    </section>
    `;
  }

  return html;
}

// ============================================
// TEMPLATE #2: MODERN LAWN SOLUTIONS
// ============================================
function renderModernLawnHome(
  getContent: (key: string) => string,
  colors: any,
  manufacturers: any[],
  sectionVisibility: Record<string, boolean>,
  siteId: string
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
          <a href="${resolveButtonHref(getContent, 'hero.ctaButton', 'contact', siteId)}" style="display: inline-block; background-color: var(--color-primary); color: white; padding: 1rem 2rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">${getContent('hero.ctaButton.text') || getContent('hero.ctaButton')}</a>
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
          ${[1, 2, 3, 4].map(i => `
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden; transition: all 0.3s;">
              <div style="height: 200px; background: linear-gradient(to bottom right, var(--color-primary), var(--color-secondary));"></div>
              <div style="padding: 1.5rem;">
                <h3 style="font-size: 1.125rem; margin-bottom: 0.5rem; font-weight: 600;">Product ${i}</h3>
                <p style="color: #6b7280; margin-bottom: 1rem; font-size: 0.875rem;">Modern equipment solution</p>
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
        <a href="${resolveButtonHref(getContent, 'cta.primaryButton', 'inventory', siteId)}" style="display: inline-block; background: white; color: var(--color-primary); padding: 1rem 2.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">${getContent('cta.primaryButton.text') || getContent('cta.primaryButton') || getContent('cta.button')}</a>
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
  siteId: string
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
          ${[1, 2, 3, 4].map(i => `
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; overflow: hidden;">
              <div style="height: 200px; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));"></div>
              <div style="padding: 1.75rem;">
                <h3 style="font-size: 1.0625rem; margin-bottom: 0.5rem; font-weight: 600; color: #0f172a;">Professional Equipment ${i}</h3>
                <p style="color: #64748b; margin-bottom: 1.25rem; font-size: 0.9375rem; line-height: 1.6;">Commercial-grade quality and reliability</p>
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
        <a href="${resolveButtonHref(getContent, 'cta.primaryButton', 'inventory', siteId)}" style="display: inline-block; background: var(--color-secondary); color: white; padding: 1rem 2.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 1rem;">${getContent('cta.primaryButton.text') || getContent('cta.primaryButton') || getContent('cta.button')}</a>
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
  siteId: string
): string {
  let html = '';

  // Hero - Bold with Diagonal
  if (sectionVisibility.hero !== false) {
    html += `
    <section data-section="hero" style="position: relative; min-height: 650px; overflow: hidden;">
      <div style="position: absolute; top: 0; left: 0; right: 40%; bottom: 0; background-color: var(--color-primary); transform: skewX(-10deg); transform-origin: top left;"></div>
      <div style="position: absolute; top: 0; left: 60%; right: 0; bottom: 0; background-image: url('${getContent('hero.image')}'); background-size: cover; background-position: center;"></div>
      <div class="container" style="position: relative; z-index: 10; height: 650px; display: flex; align-items: center;">
        <div style="max-width: 600px; color: white;">
          <h1 style="color: white; font-size: 4rem; margin-bottom: 1rem; font-weight: 900; line-height: 1.1;">${getContent('hero.title')}</h1>
          <h2 style="color: var(--color-accent); font-size: 2rem; margin-bottom: 1rem; font-weight: 700;">${getContent('hero.subtitle')}</h2>
          <p style="font-size: 1.125rem; margin-bottom: 2rem; color: rgba(255,255,255,0.9);">${getContent('hero.description')}</p>
          <div style="display: flex; gap: 1rem;">
            <a href="${resolveButtonHref(getContent, 'hero.ctaButton', 'contact', siteId)}" style="background: linear-gradient(135deg, var(--color-secondary), var(--color-accent)); color: white; padding: 1.25rem 2.5rem; border-radius: 9999px; text-decoration: none; font-weight: 700; font-size: 1.125rem;">${getContent('hero.ctaButton.text') || getContent('hero.ctaPrimary') || getContent('hero.ctaButton')}</a>
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
                <div style="font-size: 4rem; font-weight: 900; color: var(--color-accent); margin-bottom: 0.5rem;">${value}</div>
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
          ${[1, 2, 3, 4].map(i => `
            <div style="background: white; border: 3px solid; border-image: linear-gradient(135deg, var(--color-primary), var(--color-secondary)) 1; border-radius: 1rem; overflow: hidden; transform: rotate(${i % 2 === 0 ? '2' : '-2'}deg); transition: transform 0.3s;">
              <div style="height: 200px; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent));"></div>
              <div style="padding: 1.5rem; transform: rotate(${i % 2 === 0 ? '-2' : '2'}deg);">
                <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; font-weight: 800; color: var(--color-primary);">HOT DEAL ${i}</h3>
                <p style="color: #6b7280; margin-bottom: 1rem; font-weight: 600;">PREMIUM EQUIPMENT</p>
                <a href="/api/preview/${siteId}?page=inventory" style="display: inline-block; background-color: var(--color-secondary); color: white; padding: 0.75rem 1.5rem; border-radius: 9999px; text-decoration: none; font-weight: 700;">GRAB IT!</a>
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
                <h3 style="color: var(--color-accent); margin-bottom: 1rem; font-size: 1.5rem; font-weight: 800;">${title}</h3>
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
        <a href="${resolveButtonHref(getContent, 'cta.primaryButton', 'inventory', siteId)}" style="display: inline-block; background: white; color: var(--color-primary); padding: 1.25rem 3rem; border-radius: 9999px; text-decoration: none; font-weight: 900; font-size: 1.25rem; text-transform: uppercase; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">${getContent('cta.primaryButton.text') || getContent('cta.primaryButton') || getContent('cta.button')}</a>
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
  siteId: string
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
          <a href="${resolveButtonHref(getContent, 'hero.ctaButton', 'contact', siteId)}" style="display: inline-block; color: #171717; padding: 1rem 2rem; text-decoration: none; font-weight: 400; border: 1px solid #d4d4d4; transition: all 0.3s;">${getContent('hero.ctaButton.text') || getContent('hero.ctaButton')}</a>
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
          ${[1, 2, 3, 4].map(i => `
            <div>
              <div style="height: 300px; background-color: #fafafa; margin-bottom: 1.5rem;"></div>
              <h3 style="font-size: 1rem; margin-bottom: 0.5rem; color: #171717; font-weight: 400;">Product ${i}</h3>
              <p style="color: #a3a3a3; font-size: 0.875rem; font-weight: 300;">From $999</p>
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
        <a href="${resolveButtonHref(getContent, 'cta.primaryButton', 'inventory', siteId)}" style="display: inline-block; color: #171717; padding: 1rem 2rem; text-decoration: none; font-weight: 400; border: 1px solid #d4d4d4;">${getContent('cta.primaryButton.text') || getContent('cta.primaryButton') || getContent('cta.button')}</a>
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
  siteId: string
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
            <a href="${resolveButtonHref(getContent, 'hero.ctaButton', 'contact', siteId)}" style="background-color: var(--color-accent); color: white; padding: 1rem 2rem; border-radius: 9999px; text-decoration: none; font-weight: 600;">${getContent('hero.ctaButton.text') || getContent('hero.ctaPrimary') || getContent('hero.ctaButton')}</a>
            <a href="${resolveButtonHref(getContent, 'hero.secondaryButton', 'inventory', siteId)}" style="background-color: transparent; border: 2px solid var(--color-accent); color: var(--color-accent); padding: 1rem 2rem; border-radius: 9999px; text-decoration: none; font-weight: 600;">${getContent('hero.secondaryButton.text') || getContent('hero.ctaSecondary') || getContent('hero.secondaryButton')}</a>
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
          ${[1, 2, 3, 4].map(i => `
            <div style="background: white; border-radius: 1.5rem; overflow: hidden; box-shadow: 0 4px 6px rgba(120, 53, 15, 0.1);">
              <div style="height: 200px; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));"></div>
              <div style="padding: 1.5rem;">
                <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem; color: var(--color-primary); font-family: 'Merriweather', serif;">Equipment ${i}</h3>
                <p style="color: #78350f; margin-bottom: 1rem;">Hand-picked for your property</p>
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
        <a href="${resolveButtonHref(getContent, 'cta.primaryButton', 'inventory', siteId)}" style="display: inline-block; background: var(--color-accent); color: white; padding: 1rem 2.5rem; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 1.125rem;">${getContent('cta.primaryButton.text') || getContent('cta.primaryButton') || getContent('cta.button')}</a>
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
  siteId: string
): string {
  return renderGreenValleyHome(getContent, colors, manufacturers, sectionVisibility, siteId);
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
async function renderServicePageWithIntegration(
  siteId: string,
  config: any,
  getContent: (key: string) => string,
  colors: any,
  supabase: any,
  subscriptionTier: string = 'basic',
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

  // Premium add-on: online scheduling (Calendly or built-in dynamic form)
  const isPremium = subscriptionTier && subscriptionTier !== 'basic';
  let schedulingSection = '';

  if (isPremium) {
    let integration = null;
    try {
      const { data } = await supabase
        .from('site_integrations')
        .select('*')
        .eq('site_id', siteId)
        .eq('integration_type', 'service')
        .single();
      integration = data;
    } catch (e) {
      // No integration configured — use built-in form
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
      </section>`;
    } else {
      // Template-aware dynamic booking form
      schedulingSection = renderServiceBookingSection(
        siteId,
        colors,
        templateSlug,
        getContent('servicePage.ctaButton') || 'Schedule Service'
      );
    }
  }

  return `
  ${renderPageHero(heading, subheading, colors, heroImage, 'servicePage')}
  ${renderPageContentSection(contentHeading, contentText, colors)}
  ${servicesGridHTML}
  ${schedulingSection}
  ${emailCTA}
  `;
}

// Rentals Page with Integration Support
async function renderInventoryPageWithIntegration(
  siteId: string,
  config: any,
  getContent: (key: string) => string,
  colors: any,
  supabase: any
): Promise<string> {
  const heading    = getContent('inventoryPage.heading')    || 'Equipment Inventory';
  const subheading = getContent('inventoryPage.subheading') || 'Browse our complete selection of equipment.';
  const heroImage  = getContent('inventoryPage.heroImage');
  const ctaHeading = getContent('inventoryPage.ctaHeading') || "Don\'t see what you\'re looking for?";
  const ctaText    = getContent('inventoryPage.ctaText')    || "Contact us and we\'ll help you find the right equipment.";
  const ctaButton  = getContent('inventoryPage.ctaButton.text') || getContent('inventoryPage.ctaButton') || 'Contact Us';
  const ctaDest    = getContent('inventoryPage.ctaButton.destination') || getContent('inventoryPage.ctaLink') || 'contact';
  const ctaHref    = ctaDest === '__custom' ? getContent('inventoryPage.ctaButton.destination_url') : ctaDest;

  const { data: inventory } = await supabase
    .from('inventory_items')
    .select('id, title, description, category, condition, price, sale_price, model, year, primary_image, slug, featured, status, hours')
    .eq('site_id', siteId)
    .eq('status', 'available')
    .order('featured', { ascending: false })
    .order('display_order')
    .limit(50);

  const items = inventory || [];

  const fmtPrice = (v: number | null) => {
    if (!v) return 'Contact for Price';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);
  };

  const categories = [...new Set(items.map((p: any) => p.category).filter(Boolean))] as string[];
  const conditions  = [...new Set(items.map((p: any) => p.condition).filter(Boolean))] as string[];

  const itemCards = items.map((item: any) => {
    const pd = JSON.stringify({
      id: item.id, title: item.title || '', description: item.description || '',
      price: item.price || null, sale_price: item.sale_price || null,
      primary_image: item.primary_image || null, category: item.category || '',
      model: item.model || '', slug: item.slug || ''
    }).replace(/"/g, '&quot;');
    return `
      <div class="inv-card" data-category="${item.category || ''}" data-condition="${item.condition || ''}"
        style="background:white;border-radius:0.75rem;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);cursor:pointer;"
        onclick="fmOpenProduct(${pd})">
        ${item.primary_image
          ? `<div style="aspect-ratio:4/3;overflow:hidden;"><img src="${item.primary_image}" alt="${item.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;"></div>`
          : `<div style="aspect-ratio:4/3;background:linear-gradient(135deg,${colors.primary},${colors.accent});opacity:0.7;"></div>`
        }
        <div style="padding:1rem;">
          <p style="font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;margin-bottom:0.25rem;">${[item.category, item.model, item.year].filter(Boolean).join(' · ')}</p>
          <h3 style="font-size:1.125rem;font-weight:700;color:#111827;margin-bottom:0.5rem;line-height:1.3;">${item.title}</h3>
          ${item.hours ? `<p style="font-size:0.75rem;color:#9ca3af;margin-bottom:0.5rem;">${item.hours} hours</p>` : ''}
          <div style="display:flex;align-items:center;justify-content:space-between;padding-top:0.75rem;border-top:1px solid #f3f4f6;">
            <span style="font-size:1.25rem;font-weight:700;color:${colors.primary};">${fmtPrice(item.price)}</span>
            <span style="font-size:0.875rem;font-weight:600;color:${colors.secondary};">Details →</span>
          </div>
        </div>
      </div>`;
  }).join('');

  return `
    ${renderPageHero(heading, subheading, colors, heroImage, 'inventoryPage')}

    ${categories.length > 1 || conditions.length > 1 ? `
    <section style="padding:1rem 0;background:#f9fafb;border-bottom:2px solid #e5e7eb;position:sticky;top:64px;z-index:30;">
      <div class="container" style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center;">
        ${categories.length > 1 ? `
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <label style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:#6b7280;">Category</label>
          <select id="catFilter" style="padding:0.5rem 0.75rem;border:2px solid #e5e7eb;border-radius:0.5rem;font-size:0.875rem;">
            <option value="all">All Equipment</option>
            ${categories.map((cat: string) => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
        </div>` : ''}
        ${conditions.length > 1 ? `
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <label style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:#6b7280;">Condition</label>
          <select id="condFilter" style="padding:0.5rem 0.75rem;border:2px solid #e5e7eb;border-radius:0.5rem;font-size:0.875rem;">
            <option value="all">All Conditions</option>
            ${conditions.map((c: string) => `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</option>`).join('')}
          </select>
        </div>` : ''}
      </div>
    </section>` : ''}

    <section style="padding:4rem 0;">
      <div class="container">
        ${items.length === 0 ? `
          <div style="text-align:center;padding:4rem;color:#9ca3af;">
            <div style="font-size:4rem;margin-bottom:1rem;">📦</div>
            <h2 style="font-size:1.5rem;font-weight:700;color:#374151;margin-bottom:0.5rem;">No Equipment Listed Yet</h2>
            <p style="margin-bottom:1.5rem;">Check back soon — we\'re adding inventory regularly.</p>
            <a href="contact" style="display:inline-block;background-color:${colors.primary};color:white;padding:0.75rem 1.5rem;border-radius:0.375rem;font-weight:600;text-decoration:none;">Contact Us</a>
          </div>
        ` : `
          <p style="color:#6b7280;margin-bottom:1.5rem;" id="invCount">Showing <strong>${items.length}</strong> items</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;" id="invGrid">
            ${itemCards}
          </div>
        `}
        <div style="margin-top:3rem;background:#f9fafb;border-radius:0.75rem;padding:2rem;text-align:center;">
          <h2 style="font-size:1.5rem;font-weight:700;color:${colors.primary};margin-bottom:0.5rem;">${ctaHeading}</h2>
          <p style="color:#6b7280;margin-bottom:1.5rem;">${ctaText}</p>
          <a href="${ctaHref}" style="display:inline-block;background-color:${colors.primary};color:white;padding:0.75rem 1.5rem;border-radius:0.375rem;font-weight:600;text-decoration:none;">${ctaButton}</a>
        </div>
      </div>
    </section>

    <script>
      (function(){
        var cat  = document.getElementById('catFilter');
        var cond = document.getElementById('condFilter');
        var cards = document.querySelectorAll('.inv-card');
        var countEl = document.getElementById('invCount');
        function filter(){
          var c = cat ? cat.value : 'all';
          var d = cond ? cond.value : 'all';
          var n = 0;
          cards.forEach(function(el){
            var ok = (c==='all'||el.getAttribute('data-category')===c) && (d==='all'||el.getAttribute('data-condition')===d);
            el.style.display = ok ? '' : 'none';
            if(ok) n++;
          });
          if(countEl) countEl.innerHTML = 'Showing <strong>'+n+'</strong> items';
        }
        if(cat)  cat.addEventListener('change', filter);
        if(cond) cond.addEventListener('change', filter);
      })();
    </script>
  `;
}

async function renderRentalsPageWithIntegration(
  siteId: string,
  config: any,
  getContent: (key: string) => string,
  colors: any,
  supabase: any
): Promise<string> {
  const { data: integration } = await supabase
    .from('site_integrations')
    .select('*')
    .eq('site_id', siteId)
    .eq('integration_type', 'rentals')
    .single();

  const heading = getContent('rentalsPage.heading') || 'Equipment Rentals';
  const subheading = getContent('rentalsPage.subheading') || 'Flexible rental options for any project';
  const heroImage = getContent('rentalsPage.heroImage');
  const contentHeading = getContent('rentalsPage.contentHeading') || '';
  const contentText = getContent('rentalsPage.contentText') || '';

  if (integration?.integration_id === 'siteforge_rentals') {
    const { data: rentals } = await supabase
      .from('rental_inventory')
      .select('*')
      .eq('site_id', siteId)
      .eq('status', 'available')
      .order('display_order');

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
}// ============================================
// TEMPLATE STYLE CONFIGS + SHARED SERVICE BOOKING FORM
// ============================================
// This is a REPLACEMENT for the scheduling section inside
// renderServicePageWithIntegration(). Paste these functions
// at the bottom of your route.ts, then update the main function.
// ============================================

// Template style tokens — each template gets its own look
interface TemplateStyle {
  borderRadius: string;       // Card/input corners
  buttonRadius: string;       // Button corners
  fontFamily: string;         // Heading font-family
  headingWeight: string;      // Heading font-weight
  labelWeight: string;        // Form label weight
  inputBorder: string;        // Input border color
  inputBg: string;            // Input background
  cardBg: string;             // Card/form background
  cardBorder: string;         // Card border
  cardShadow: string;         // Card shadow
  sectionBg: string;          // Section background
  textMuted: string;          // Muted text color
  textBody: string;           // Body text color
  accentGlow: boolean;        // Button glow/shadow effect
  pillButtons: boolean;       // Use pill-shaped buttons
  uppercase: boolean;         // Uppercase headings
  letterSpacing: string;      // Heading letter-spacing
}

const TEMPLATE_STYLES: Record<string, TemplateStyle> = {
  'corporate-edge': {
    borderRadius: '0.75rem',
    buttonRadius: '0.5rem',
    fontFamily: 'inherit',
    headingWeight: '800',
    labelWeight: '600',
    inputBorder: '#d1d5db',
    inputBg: 'white',
    cardBg: 'white',
    cardBorder: '1px solid #e2e8f0',
    cardShadow: '0 4px 12px rgba(0,0,0,0.06)',
    sectionBg: '#f8fafc',
    textMuted: '#64748b',
    textBody: '#475569',
    accentGlow: false,
    pillButtons: false,
    uppercase: false,
    letterSpacing: '-0.02em',
  },
  'green-valley-industrial': {
    borderRadius: '0.5rem',
    buttonRadius: '0.375rem',
    fontFamily: 'inherit',
    headingWeight: '700',
    labelWeight: '600',
    inputBorder: '#d1d5db',
    inputBg: 'white',
    cardBg: 'white',
    cardBorder: '1px solid #e5e7eb',
    cardShadow: '0 2px 8px rgba(0,0,0,0.08)',
    sectionBg: '#f9fafb',
    textMuted: '#6b7280',
    textBody: '#4b5563',
    accentGlow: false,
    pillButtons: false,
    uppercase: true,
    letterSpacing: '0.025em',
  },
  'modern-lawn-solutions': {
    borderRadius: '0.75rem',
    buttonRadius: '0.5rem',
    fontFamily: 'inherit',
    headingWeight: '700',
    labelWeight: '500',
    inputBorder: '#e5e7eb',
    inputBg: '#f9fafb',
    cardBg: 'white',
    cardBorder: '1px solid #e5e7eb',
    cardShadow: '0 1px 3px rgba(0,0,0,0.05)',
    sectionBg: '#ffffff',
    textMuted: '#9ca3af',
    textBody: '#6b7280',
    accentGlow: false,
    pillButtons: false,
    uppercase: false,
    letterSpacing: '-0.01em',
  },
  'vibe-dynamics': {
    borderRadius: '1.5rem',
    buttonRadius: '9999px',
    fontFamily: 'inherit',
    headingWeight: '800',
    labelWeight: '600',
    inputBorder: '#e5e7eb',
    inputBg: 'white',
    cardBg: 'white',
    cardBorder: '2px solid #e5e7eb',
    cardShadow: '0 8px 24px rgba(0,0,0,0.08)',
    sectionBg: '#fafafa',
    textMuted: '#9ca3af',
    textBody: '#6b7280',
    accentGlow: true,
    pillButtons: true,
    uppercase: true,
    letterSpacing: '0.05em',
  },
  'zenith-lawn': {
    borderRadius: '0rem',
    buttonRadius: '0rem',
    fontFamily: 'inherit',
    headingWeight: '300',
    labelWeight: '400',
    inputBorder: '#d4d4d4',
    inputBg: 'white',
    cardBg: 'white',
    cardBorder: '1px solid #e5e5e5',
    cardShadow: 'none',
    sectionBg: '#fafafa',
    textMuted: '#a3a3a3',
    textBody: '#525252',
    accentGlow: false,
    pillButtons: false,
    uppercase: true,
    letterSpacing: '0.1em',
  },
  'warm-earth-designs': {
    borderRadius: '1rem',
    buttonRadius: '9999px',
    fontFamily: 'inherit',
    headingWeight: '700',
    labelWeight: '600',
    inputBorder: '#d6cfc4',
    inputBg: '#fdfbf7',
    cardBg: '#fdfbf7',
    cardBorder: '2px solid var(--color-accent)',
    cardShadow: '0 2px 4px rgba(120,53,15,0.1)',
    sectionBg: '#faf5ee',
    textMuted: '#92856b',
    textBody: '#5c4d38',
    accentGlow: false,
    pillButtons: true,
    uppercase: false,
    letterSpacing: '-0.01em',
  },
};

function getTemplateStyle(slug: string): TemplateStyle {
  return TEMPLATE_STYLES[slug] || TEMPLATE_STYLES['corporate-edge'];
}


// ============================================
// DYNAMIC SERVICE BOOKING FORM
// ============================================
// Fetches dealer's service types from API, shows time slots,
// handles "Other" as a contact-needed request.
// All powered by inline JS (no React — this is rendered HTML).
// ============================================

function renderServiceBookingSection(
  siteId: string,
  colors: any,
  templateSlug: string,
  ctaLabel: string = 'Schedule Service'
): string {
  const s = getTemplateStyle(templateSlug);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  return `
  <section id="book-service" style="padding: 5rem 0; background: ${s.sectionBg};">
    <div class="container" style="max-width: 780px;">
      <h2 style="font-size: 2rem; font-weight: ${s.headingWeight}; text-align: center; margin-bottom: 0.5rem; color: var(--color-primary); letter-spacing: ${s.letterSpacing}; ${s.uppercase ? 'text-transform: uppercase;' : ''}">
        Schedule Service Online
      </h2>
      <p style="text-align: center; color: ${s.textMuted}; margin-bottom: 2.5rem; font-size: 1rem;">
        Pick a service, choose your time, and we'll take care of the rest.
      </p>

      <div id="sf-booking-form" style="background: ${s.cardBg}; border-radius: ${s.borderRadius}; border: ${s.cardBorder}; box-shadow: ${s.cardShadow}; padding: 2.5rem; ${s.accentGlow ? 'box-shadow: 0 8px 32px rgba(0,0,0,0.1);' : ''}">

        <!-- STEP 1: Choose Service -->
        <div id="sf-step-1">
          <h3 style="font-size: 1.125rem; font-weight: ${s.headingWeight}; color: var(--color-primary); margin-bottom: 1.25rem; ${s.uppercase ? 'text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.875rem;' : ''}">
            1. Select a Service
          </h3>
          <div id="sf-service-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="text-align: center; padding: 2rem; color: ${s.textMuted};">Loading services...</div>
          </div>
        </div>

        <!-- STEP 2: Date & Time (hidden until service selected) -->
        <div id="sf-step-2" style="display: none; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid ${s.inputBorder};">
          <h3 style="font-size: 1.125rem; font-weight: ${s.headingWeight}; color: var(--color-primary); margin-bottom: 1.25rem; ${s.uppercase ? 'text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.875rem;' : ''}">
            2. Pick a Date & Time
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.375rem; font-weight: ${s.labelWeight}; color: ${s.textBody}; font-size: 0.875rem;">Date</label>
              <input type="date" id="sf-date" min="${new Date().toISOString().split('T')[0]}"
                style="width: 100%; padding: 0.75rem; border: 1px solid ${s.inputBorder}; border-radius: ${s.borderRadius}; background: ${s.inputBg}; font-size: 0.9375rem;" />
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.375rem; font-weight: ${s.labelWeight}; color: ${s.textBody}; font-size: 0.875rem;">Available Times</label>
              <div id="sf-slots" style="display: flex; flex-wrap: wrap; gap: 0.5rem; min-height: 44px; align-items: center;">
                <span style="color: ${s.textMuted}; font-size: 0.8125rem;">Select a date first</span>
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 2-ALT: "Other" description (hidden until Other selected) -->
        <div id="sf-step-other" style="display: none; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid ${s.inputBorder};">
          <h3 style="font-size: 1.125rem; font-weight: ${s.headingWeight}; color: var(--color-primary); margin-bottom: 0.75rem; ${s.uppercase ? 'text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.875rem;' : ''}">
            Tell Us What You Need
          </h3>
          <p style="color: ${s.textMuted}; font-size: 0.875rem; margin-bottom: 1rem;">
            Describe your situation and we'll reach out to schedule the right appointment for you.
          </p>
          <textarea id="sf-other-desc" rows="4" placeholder="Describe the issue or service you need..."
            style="width: 100%; padding: 0.75rem; border: 1px solid ${s.inputBorder}; border-radius: ${s.borderRadius}; background: ${s.inputBg}; font-size: 0.9375rem; resize: vertical;"></textarea>
        </div>

        <!-- STEP 3: Contact Info -->
        <div id="sf-step-3" style="display: none; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid ${s.inputBorder};">
          <h3 style="font-size: 1.125rem; font-weight: ${s.headingWeight}; color: var(--color-primary); margin-bottom: 1.25rem; ${s.uppercase ? 'text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.875rem;' : ''}">
            <span id="sf-step3-label">3</span>. Your Information
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label style="display: block; margin-bottom: 0.375rem; font-weight: ${s.labelWeight}; color: ${s.textBody}; font-size: 0.875rem;">Name *</label>
              <input type="text" id="sf-name" required
                style="width: 100%; padding: 0.75rem; border: 1px solid ${s.inputBorder}; border-radius: ${s.borderRadius}; background: ${s.inputBg}; font-size: 0.9375rem;" />
            </div>
            <div>
              <label style="display: block; margin-bottom: 0.375rem; font-weight: ${s.labelWeight}; color: ${s.textBody}; font-size: 0.875rem;">Phone</label>
              <input type="tel" id="sf-phone"
                style="width: 100%; padding: 0.75rem; border: 1px solid ${s.inputBorder}; border-radius: ${s.borderRadius}; background: ${s.inputBg}; font-size: 0.9375rem;" />
            </div>
          </div>
          <div style="margin-top: 1rem;">
            <label style="display: block; margin-bottom: 0.375rem; font-weight: ${s.labelWeight}; color: ${s.textBody}; font-size: 0.875rem;">Email *</label>
            <input type="email" id="sf-email" required
              style="width: 100%; padding: 0.75rem; border: 1px solid ${s.inputBorder}; border-radius: ${s.borderRadius}; background: ${s.inputBg}; font-size: 0.9375rem;" />
          </div>

          <!-- Equipment info (collapsible) -->
          <details style="margin-top: 1.25rem;">
            <summary style="cursor: pointer; font-weight: ${s.labelWeight}; color: ${s.textBody}; font-size: 0.875rem; user-select: none;">
              + Equipment Details (optional)
            </summary>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.75rem;">
              <div>
                <label style="display: block; margin-bottom: 0.25rem; font-size: 0.8125rem; color: ${s.textMuted};">Equipment Type</label>
                <input type="text" id="sf-equip-type" placeholder="e.g. Mower, Tractor"
                  style="width: 100%; padding: 0.625rem; border: 1px solid ${s.inputBorder}; border-radius: ${s.borderRadius}; background: ${s.inputBg}; font-size: 0.875rem;" />
              </div>
              <div>
                <label style="display: block; margin-bottom: 0.25rem; font-size: 0.8125rem; color: ${s.textMuted};">Make / Model</label>
                <input type="text" id="sf-equip-model" placeholder="e.g. John Deere X350"
                  style="width: 100%; padding: 0.625rem; border: 1px solid ${s.inputBorder}; border-radius: ${s.borderRadius}; background: ${s.inputBg}; font-size: 0.875rem;" />
              </div>
            </div>
          </details>

          <button id="sf-submit" type="button" onclick="sfSubmit()"
            style="width: 100%; margin-top: 2rem; background-color: var(--color-primary); color: white; padding: 1rem; border: none; border-radius: ${s.buttonRadius}; font-weight: 700; font-size: 1rem; cursor: pointer; ${s.accentGlow ? 'box-shadow: 0 4px 14px rgba(0,0,0,0.2);' : ''} ${s.uppercase ? 'text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.875rem;' : ''}">
            ${ctaLabel}
          </button>
        </div>

        <!-- Success Message -->
        <div id="sf-success" style="display: none; text-align: center; padding: 3rem 1rem;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: #f0fdf4; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 1rem;">
            <span style="font-size: 1.5rem;">✓</span>
          </div>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;" id="sf-success-title">Appointment Confirmed!</h3>
          <p style="color: ${s.textMuted}; font-size: 0.9375rem;" id="sf-success-msg">We'll see you then.</p>
        </div>

        <!-- Error Message -->
        <div id="sf-error" style="display: none; padding: 1rem; margin-top: 1rem; background: #fef2f2; border: 1px solid #fca5a5; border-radius: ${s.borderRadius}; color: #991b1b; font-size: 0.875rem;"></div>
      </div>
    </div>
  </section>

  <!-- Booking Form JavaScript -->
  <script>
  (function() {
    const SITE_ID = '${siteId}';
    const API_BASE = '${appUrl}';
    let selectedTypeId = null;
    let selectedTypeName = '';
    let isOther = false;
    let selectedTime = null;
    let selectedDate = null;

    // Load service types
    fetch(API_BASE + '/api/service/types/' + SITE_ID)
      .then(r => r.json())
      .then(data => {
        const list = document.getElementById('sf-service-list');
        if (!data.types || data.types.length === 0) {
          list.innerHTML = '<p style="color: #94a3b8;">No services available for online booking. Please call us directly.</p>';
          return;
        }
        let html = '';
        data.types.forEach(function(t) {
          html += '<button type="button" onclick="sfSelectType(\\'' + t.id + '\\',\\'' + t.name.replace(/'/g, "\\\\'") + '\\',' + t.duration_minutes + ',false)" class="sf-type-btn" data-id="' + t.id + '" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border: 1px solid ${s.inputBorder}; border-radius: ${s.borderRadius}; background: ${s.inputBg}; cursor: pointer; text-align: left; transition: border-color 0.15s, background 0.15s;">'
            + '<div><strong style="color: #0f172a;">' + t.name + '</strong>'
            + (t.description ? '<br><span style="font-size: 0.8125rem; color: ${s.textMuted};">' + t.description + '</span>' : '')
            + '</div>'
            + '<div style="text-align: right; white-space: nowrap;">'
            + (t.price_estimate ? '<span style="font-weight: 600; color: #0f172a; font-size: 0.875rem;">' + t.price_estimate + '</span><br>' : '')
            + '<span style="font-size: 0.75rem; color: ${s.textMuted};">' + t.duration_minutes + ' min</span>'
            + '</div></button>';
        });
        // "Other" button
        html += '<button type="button" onclick="sfSelectType(null,\\'Other\\',0,true)" class="sf-type-btn" data-id="other" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border: 1px dashed ${s.inputBorder}; border-radius: ${s.borderRadius}; background: transparent; cursor: pointer; text-align: left; transition: border-color 0.15s;">'
          + '<div><strong style="color: #0f172a;">Other / Not Sure</strong>'
          + '<br><span style="font-size: 0.8125rem; color: ${s.textMuted};">Describe your needs and we\\'ll contact you to schedule</span></div>'
          + '<span style="font-size: 1.25rem;">→</span></button>';
        list.innerHTML = html;
      })
      .catch(function() {
        document.getElementById('sf-service-list').innerHTML = '<p style="color: #dc2626;">Unable to load services. Please try again.</p>';
      });

    // Select service type
    window.sfSelectType = function(typeId, name, duration, other) {
      selectedTypeId = typeId;
      selectedTypeName = name;
      isOther = other;
      selectedTime = null;

      // Highlight selected
      document.querySelectorAll('.sf-type-btn').forEach(function(btn) {
        const isActive = (other && btn.dataset.id === 'other') || (!other && btn.dataset.id === typeId);
        btn.style.borderColor = isActive ? 'var(--color-primary)' : '${s.inputBorder}';
        btn.style.background = isActive ? 'rgba(59,130,246,0.04)' : '${s.inputBg}';
      });

      if (other) {
        document.getElementById('sf-step-2').style.display = 'none';
        document.getElementById('sf-step-other').style.display = 'block';
        document.getElementById('sf-step-3').style.display = 'block';
        document.getElementById('sf-step3-label').textContent = '3';
      } else {
        document.getElementById('sf-step-2').style.display = 'block';
        document.getElementById('sf-step-other').style.display = 'none';
        document.getElementById('sf-step-3').style.display = 'block';
        document.getElementById('sf-step3-label').textContent = '3';
        // Clear slots
        document.getElementById('sf-slots').innerHTML = '<span style="color: ${s.textMuted}; font-size: 0.8125rem;">Select a date</span>';
        document.getElementById('sf-date').value = '';
      }
    };

    // Date change → load slots
    var dateInput = document.getElementById('sf-date');
    if (dateInput) {
      dateInput.addEventListener('change', function() {
        selectedDate = this.value;
        selectedTime = null;
        if (!selectedDate || !selectedTypeId) return;

        var slotsDiv = document.getElementById('sf-slots');
        slotsDiv.innerHTML = '<span style="color: ${s.textMuted}; font-size: 0.8125rem;">Loading...</span>';

        fetch(API_BASE + '/api/service/slots/' + SITE_ID + '?date=' + selectedDate + '&typeId=' + selectedTypeId)
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.blocked || data.closed) {
              slotsDiv.innerHTML = '<span style="color: #dc2626; font-size: 0.875rem;">' + (data.message || 'Unavailable') + '</span>';
              return;
            }
            var available = (data.slots || []).filter(function(s) { return s.available; });
            if (available.length === 0) {
              slotsDiv.innerHTML = '<span style="color: #dc2626; font-size: 0.875rem;">No available times on this date</span>';
              return;
            }
            slotsDiv.innerHTML = available.map(function(slot) {
              return '<button type="button" onclick="sfSelectSlot(this,\\'' + slot.time + '\\')" class="sf-slot-btn" style="padding: 0.5rem 0.875rem; border: 1px solid ${s.inputBorder}; border-radius: ${s.buttonRadius}; background: ${s.inputBg}; cursor: pointer; font-size: 0.8125rem; font-weight: 500; transition: all 0.15s;">' + slot.display + '</button>';
            }).join('');
          })
          .catch(function() {
            slotsDiv.innerHTML = '<span style="color: #dc2626; font-size: 0.875rem;">Error loading times</span>';
          });
      });
    }

    // Select time slot
    window.sfSelectSlot = function(btn, time) {
      selectedTime = time;
      document.querySelectorAll('.sf-slot-btn').forEach(function(b) {
        b.style.borderColor = '${s.inputBorder}';
        b.style.background = '${s.inputBg}';
        b.style.color = '#0f172a';
      });
      btn.style.borderColor = 'var(--color-primary)';
      btn.style.background = 'var(--color-primary)';
      btn.style.color = 'white';
    };

    // Submit
    window.sfSubmit = function() {
      var name = document.getElementById('sf-name').value.trim();
      var email = document.getElementById('sf-email').value.trim();
      var phone = document.getElementById('sf-phone').value.trim();

      if (!name || !email) {
        showError('Please fill in your name and email.');
        return;
      }
      if (!isOther && !selectedTime) {
        showError('Please select a time slot.');
        return;
      }

      var btn = document.getElementById('sf-submit');
      btn.disabled = true;
      btn.textContent = 'Submitting...';

      var body = {
        customerName: name,
        customerEmail: email,
        customerPhone: phone || null,
        serviceTypeId: selectedTypeId,
        customDescription: isOther ? (document.getElementById('sf-other-desc').value || '') : null,
        equipmentType: document.getElementById('sf-equip-type') ? document.getElementById('sf-equip-type').value : null,
        equipmentMake: document.getElementById('sf-equip-model') ? document.getElementById('sf-equip-model').value : null,
        preferredDate: selectedDate || null,
        preferredTime: selectedTime || null,
      };

      fetch(API_BASE + '/api/service/book/' + SITE_ID, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) {
          document.getElementById('sf-step-1').style.display = 'none';
          document.getElementById('sf-step-2').style.display = 'none';
          document.getElementById('sf-step-other').style.display = 'none';
          document.getElementById('sf-step-3').style.display = 'none';
          document.getElementById('sf-error').style.display = 'none';

          var title = isOther ? "We'll Be in Touch!" : 'Appointment Confirmed!';
          document.getElementById('sf-success-title').textContent = title;
          document.getElementById('sf-success-msg').textContent = data.message;
          document.getElementById('sf-success').style.display = 'block';
        } else {
          showError(data.error || 'Something went wrong. Please try again.');
          btn.disabled = false;
          btn.textContent = '${ctaLabel}';
        }
      })
      .catch(function() {
        showError('Connection error. Please try again.');
        btn.disabled = false;
        btn.textContent = '${ctaLabel}';
      });
    };

    function showError(msg) {
      var el = document.getElementById('sf-error');
      el.textContent = msg;
      el.style.display = 'block';
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  })();
  </script>
  `;
}
