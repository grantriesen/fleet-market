import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { renderGreenValleyPage } from '../../api/preview/[siteId]/templates/green-valley-industrial';
import { renderVibeDynamicsPage } from '../../api/preview/[siteId]/templates/vibe-dynamics';
import { renderCorporateEdgePage } from '../../api/preview/[siteId]/templates/corporate-edge';
import { renderZenithLawnPage } from '../../api/preview/[siteId]/templates/zenith-lawn';
import { renderModernLawnPage } from '../../api/preview/[siteId]/templates/modern-lawn-solutions';
import { renderWarmEarthPage } from '../../api/preview/[siteId]/templates/warm-earth-designs';

// ── Password protection cookie name ──
const PASSWORD_COOKIE = 'fm_site_auth';

// ── Coming soon / password page ──
function renderPasswordPage(slug: string, error = false) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Site Access</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem; }
    .card { background: white; border-radius: 1rem; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 2.5rem; width: 100%; max-width: 400px; text-align: center; }
    .icon { font-size: 2.5rem; margin-bottom: 1rem; }
    h1 { font-size: 1.5rem; font-weight: 700; color: #111827; margin-bottom: 0.5rem; }
    p { color: #6b7280; font-size: 0.9375rem; margin-bottom: 1.5rem; line-height: 1.6; }
    input { width: 100%; padding: 0.75rem 1rem; border: 1.5px solid ${error ? '#ef4444' : '#e5e7eb'}; border-radius: 0.5rem; font-size: 1rem; outline: none; margin-bottom: 0.75rem; transition: border-color 0.2s; }
    input:focus { border-color: #3b82f6; }
    button { width: 100%; padding: 0.75rem 1rem; background: #1e40af; color: white; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    button:hover { background: #1d4ed8; }
    .error { color: #ef4444; font-size: 0.875rem; margin-bottom: 0.75rem; }
    .powered { margin-top: 1.5rem; font-size: 0.75rem; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🔒</div>
    <h1>Password Required</h1>
    <p>This site is password protected. Enter the password to continue.</p>
    <form method="POST" action="/site/${slug}/auth">
      <input type="password" name="password" placeholder="Enter password" autofocus required>
      ${error ? '<p class="error">Incorrect password. Please try again.</p>' : ''}
      <button type="submit">Access Site</button>
    </form>
    <p class="powered">Powered by <strong>Fleet Market</strong></p>
  </div>
</body>
</html>`;
}

function createSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { get() { return undefined; }, set() {}, remove() {} },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

async function loadAndRender(site: any, page: string, supabase: any): Promise<string> {
  const siteId = site.id;
  const template = site.template;
  const config = template.config_json;
  const templateSlug = template.slug;

  // Load content
  const { data: contentData } = await supabase
    .from('site_content').select('field_key, value').eq('site_id', siteId);
  const content: Record<string, string> = {};
  contentData?.forEach((item: any) => { content[item.field_key] = item.value || ''; });

  // Load customizations
  const { data: customData } = await supabase
    .from('site_customizations').select('customization_type, config_json').eq('site_id', siteId);
  const customizations: any = {};
  customData?.forEach((item: any) => { customizations[item.customization_type] = item.config_json; });

  const sectionVisibility = customizations.section_visibility || {};
  const pageVisibility = customizations.page_visibility || {};

  // Hide premium sections for basic tier
  if (site.subscription_tier === 'basic' || !site.subscription_tier) {
    if (sectionVisibility.featured === undefined) sectionVisibility.featured = false;
  }

  // Load manufacturers
  const { data: manufacturers } = await supabase
    .from('manufacturers').select('*').eq('site_id', siteId).order('display_order');

  // Load featured inventory
  const { data: featuredItems } = await supabase
    .from('inventory_items')
    .select('id, title, description, category, condition, price, sale_price, model, year, primary_image, slug, featured, status')
    .eq('site_id', siteId).eq('featured', true).eq('status', 'available')
    .order('display_order').limit(8);

  const colors = {
    primary: customizations.colors?.primary || config.colors?.primary?.default || '#2D5016',
    secondary: customizations.colors?.secondary || config.colors?.secondary?.default || '#F97316',
    accent: customizations.colors?.accent || config.colors?.accent?.default || '#059669',
  };

  const fonts = {
    heading: customizations.fonts?.heading || config.fonts?.heading?.default || 'Inter',
    body: customizations.fonts?.body || config.fonts?.body?.default || 'Inter',
  };

  // Build pages list from template config (matching preview route)
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

  const isRealProducts = (featuredItems?.length || 0) > 0;
  const displayProducts = isRealProducts
    ? featuredItems!.slice(0, 4)
    : [1, 2, 3, 4].map(i => ({
        id: `placeholder-${i}`, title: `Featured Product ${i}`,
        description: 'Professional-grade equipment', price: null, sale_price: null,
        primary_image: null, category: 'Equipment', condition: 'new', slug: null,
      }));

  const fmtPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'Call for Price';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  };

  // getContent helper (matching preview route)
  const getContent = (key: string) => {
    if (content[key]) return content[key];
    const parts = key.split('.');
    if (parts.length === 2) {
      const [section, field] = parts;
      return config.sections?.[section]?.[field]?.default || '';
    }
    return '';
  };

  // Load enabled features
  const enabledFeatures = new Set<string>();
  try {
    const { data: features } = await supabase
      .from('site_features').select('feature_key').eq('site_id', siteId).eq('is_enabled', true);
    if (features) features.forEach((f: any) => enabledFeatures.add(f.feature_key));
  } catch {}

  const vis: Record<string, boolean> = {};
  Object.entries(sectionVisibility).forEach(([k, v]) => { vis[k] = v as boolean; });

  // ── Route to correct template — matching preview route signatures exactly ──
  if (templateSlug === 'green-valley-industrial') {
    return await renderGreenValleyPage(
      getContent, colors, fonts, manufacturers || [], sectionVisibility,
      siteId, site.site_name, displayProducts, isRealProducts, fmtPrice,
      availablePages, page, googleFontsUrl, supabase
    );
  }
  if (templateSlug === 'vibe-dynamics') {
    return await renderVibeDynamicsPage(
      getContent, colors, fonts, manufacturers || [], sectionVisibility,
      siteId, site.site_name, displayProducts, isRealProducts, fmtPrice,
      availablePages, page, googleFontsUrl, supabase
    );
  }
  if (templateSlug === 'corporate-edge') {
    return renderCorporateEdgePage(
      siteId, page, availablePages, displayProducts,
      config, customizations, enabledFeatures, vis, content, manufacturers || []
    );
  }
  if (templateSlug === 'zenith-lawn') {
    return renderZenithLawnPage(
      siteId, page, availablePages, displayProducts,
      config, customizations, enabledFeatures, vis, content
    );
  }
  if (templateSlug === 'modern-lawn-solutions') {
    return await renderModernLawnPage(
      siteId, page, availablePages, displayProducts,
      config, customizations, enabledFeatures, vis, content, supabase, manufacturers || []
    );
  }
  if (templateSlug === 'warm-earth-designs') {
    return renderWarmEarthPage(
      siteId, page, availablePages, displayProducts,
      config, customizations, enabledFeatures, vis, content, manufacturers || []
    );
  }
  throw new Error(`Unknown template: ${templateSlug}`);
}

// ── GET: Render the public site ──
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'home';
    const supabase = createSupabase();

    // Load site by slug OR custom domain
    // When middleware rewrites a custom domain, params.slug = the full hostname
    const isCustomDomain = params.slug.includes('.');
    
    let siteQuery = supabase
      .from('sites')
      .select(`
        id, site_name, slug, subscription_tier,
        published, custom_domain, site_password,
        template:templates ( name, slug, config_json )
      `);

    if (isCustomDomain) {
      siteQuery = siteQuery.eq('custom_domain', params.slug);
    } else {
      siteQuery = siteQuery.eq('slug', params.slug);
    }

    const { data: site } = await siteQuery.single();

    if (!site) {
      return new NextResponse('Site not found', { status: 404 });
    }

    // Check if published
    if (!site.published) {
      return new NextResponse('This site is not yet published.', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Check password protection
    if (site.site_password) {
      const cookieStore = cookies();
      const authCookie = cookieStore.get(`${PASSWORD_COOKIE}_${site.id}`)?.value;
      if (authCookie !== site.site_password) {
        const hasError = searchParams.get('auth_error') === '1';
        return new NextResponse(renderPasswordPage(params.slug, hasError), {
          status: 401,
          headers: { 'Content-Type': 'text/html' },
        });
      }
    }

    let html: string;
    try {
      html = await loadAndRender(site, page, supabase);
    } catch (renderError: any) {
      console.error('Render error details:', {
        message: renderError?.message,
        stack: renderError?.stack,
        template: site?.template?.slug,
        page,
        siteSlug: params.slug,
      });
      throw renderError;
    }

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });

  } catch (error: any) {
    console.error('Public site error:', error);
    return new NextResponse(`Site unavailable: ${error?.message || 'Unknown error'}`, { status: 500 });
  }
}

// ── POST: Handle password form submission ──
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  // This route handles /site/[slug] POST — but password auth posts to /site/[slug]/auth
  // Redirect to auth handler
  return NextResponse.redirect(new URL(`/site/${params.slug}/auth`, request.url));
}
