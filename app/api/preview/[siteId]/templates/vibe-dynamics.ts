// ============================================
// templates/vibe-dynamics.ts
// Full template module for Vibe Dynamics
//
// Single entry point: renderVibeDynamicsPage()
// Bold, energetic design with diagonal cuts,
// gradient overlays, orange/purple/yellow palette,
// thick borders, and rounded pill shapes.
// ============================================

import { sharedPreviewScript, pageHero } from './shared';
import { rentalModalBlock, rentalReserveButton } from './shared-rental';
import { serviceBookingSection, rentalBookingSection } from './product-modal';
import { injectCartSystem } from './shared';

// ── Types ──
interface Colors {
  primary: string;
  secondary: string;
  accent: string;
}

interface Fonts {
  heading: string;
  body: string;
}

type GetContent = (key: string) => string;
type FmtPrice = (price: number | null) => string;

// ============================================
// MAIN ENTRY POINT
// ============================================

export async function renderVibeDynamicsPage(
  getContent: GetContent,
  colors: Colors,
  fonts: Fonts,
  manufacturers: any[],
  sectionVisibility: Record<string, boolean>,
  siteId: string,
  siteName: string,
  displayProducts: any[],
  isRealProducts: boolean,
  fmtPrice: FmtPrice,
  availablePages: any[],
  page: string,
  googleFontsUrl: string,
  supabase?: any,
  baseUrl: string = '',
  siteAddons: string[] = [],
  checkoutMode: 'online' | 'quote_only' = 'quote_only'
): Promise<string> {
  let enabledFeatures: Set<string> = new Set();
  const addonMap: Record<string, string[]> = {
    'inventory': ['inventory', 'inventory_sync'],
    'service':   ['service', 'service_scheduling'],
    'rentals':   ['rentals', 'rental_scheduling'],
  };
  siteAddons.forEach((addon: string) => {
    enabledFeatures.add(addon);
    addonMap[addon]?.forEach((f: string) => enabledFeatures.add(f));
  });
  if (supabase) {
    const { data: features } = await supabase
      .from('site_features')
      .select('feature_key')
      .eq('site_id', siteId)
      .eq('enabled', true);
    if (features) {
      features.forEach((f: any) => enabledFeatures.add(f.feature_key));
    }
  }

  // Visibility map for subpage subsections
  const vis: Record<string, boolean> = {};

  const header = vdHeader(getContent, colors, availablePages, siteId, page, baseUrl);
  const footer = vdFooter(getContent, colors, availablePages, siteId, baseUrl);

  let body = '';

  switch (page) {
    case 'home':
    case 'index':
      body = vdHomeSections(getContent, colors, manufacturers, sectionVisibility, siteId, displayProducts, isRealProducts, fmtPrice, enabledFeatures, baseUrl);
      break;
    case 'contact':
      body = vdContactPage(getContent, colors, siteId, vis, baseUrl);
      break;
    case 'manufacturers':
      body = vdManufacturersPage(getContent, colors, manufacturers, siteId, vis, baseUrl);
      break;
    case 'service':
      body = vdServicePage(getContent, colors, siteId, enabledFeatures.has('service_scheduling'), vis, baseUrl);
      break;
    case 'inventory':
      body = await vdInventoryPage(getContent, colors, siteId, supabase, displayProducts, isRealProducts, fmtPrice, vis, baseUrl);
      break;
    case 'rentals':
      body = await vdRentalsPage(getContent, colors, siteId, supabase, enabledFeatures.has('rental_scheduling') || siteAddons.includes('rentals'), vis, baseUrl);
      break;
    default:
      body = vdHomeSections(getContent, colors, manufacturers, sectionVisibility, siteId, displayProducts, isRealProducts, fmtPrice, enabledFeatures);
  }

  return vdHtmlShell(colors, fonts, siteName, googleFontsUrl)
    + header
    + body
    + footer
    + injectCartSystem(siteId, checkoutMode, colors.primary)
    + (enabledFeatures && enabledFeatures.has('rental_scheduling') ? rentalModalBlock('fm', siteId) : '')
    + sharedPreviewScript(siteId, page)
    + '\n</body>\n</html>';
}


// ============================================
// HTML SHELL
// ============================================

function vdHtmlShell(colors: Colors, fonts: Fonts, siteName: string, googleFontsUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteName}</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary:   { DEFAULT: 'var(--color-primary)',   foreground: '#ffffff' },
            secondary: { DEFAULT: 'var(--color-secondary)', foreground: '#ffffff' },
            accent:    { DEFAULT: 'var(--color-accent)',    foreground: '#1a1a1a' },
            muted:     { DEFAULT: 'hsl(0, 0%, 96%)',       foreground: 'hsl(0, 0%, 45%)' },
            card:      { DEFAULT: '#ffffff',                foreground: 'hsl(0, 0%, 10%)' },
            border:    'hsl(0, 0%, 90%)',
            background:'#ffffff',
            foreground:'hsl(0, 0%, 10%)',
          },
          fontFamily: {
            heading: ['var(--font-heading)', 'sans-serif'],
            body:    ['var(--font-body)', 'sans-serif'],
          },
        },
      },
    }

  // ── Fleet Market Form Submission ──
  function fmSubmitForm(form, siteId, formType, extraFn) {
    var btn = form.querySelector('button[type="submit"]');
    var orig = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.innerHTML = 'Submitting...'; }
    var nameEl = form.querySelector('input[type="text"]');
    var emailEl = form.querySelector('input[type="email"]');
    var phoneEl = form.querySelector('input[type="tel"]');
    var msgEl = form.querySelector('textarea');
    var data = {
      site_id: siteId, form_type: formType,
      name: nameEl ? nameEl.value : null,
      email: emailEl ? emailEl.value : null,
      phone: phoneEl ? phoneEl.value : null,
      message: msgEl ? msgEl.value : null,
      extra_data: extraFn ? extraFn(form) : null,
    };
    fetch('/api/submit-form', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data)
    }).then(function(r){return r.json();}).then(function(res){
      if (res.success) {
        var suc = form.parentElement ? form.parentElement.querySelector('[data-fm-success]') : null;
        if (suc) { form.style.display='none'; suc.style.display='block'; }
        else { form.reset(); if(btn){btn.innerHTML='\u2713 Submitted!';btn.style.background='#16a34a';} }
      } else {
        if(btn){btn.disabled=false;btn.innerHTML=orig;} alert('Something went wrong. Please try again.');
      }
    }).catch(function(){ if(btn){btn.disabled=false;btn.innerHTML=orig;} alert('Something went wrong. Please try again.'); });
  }
  <\/script>
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

    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
    body {
      font-family: var(--font-body);
      color: hsl(0, 0%, 10%);
      line-height: 1.6;
      background-color: #ffffff;
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-heading);
      font-weight: 900;
      line-height: 1.1;
    }
    img { max-width: 100%; height: auto; }

    /* Vibe Dynamics utilities */
    .btn-gradient {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.875rem 2rem;
      font-weight: 700;
      color: white;
      border-radius: 9999px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      box-shadow: 0 4px 20px color-mix(in srgb, var(--color-primary) 40%, transparent);
      text-decoration: none;
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }
    .btn-gradient:hover { transform: translateY(-3px); box-shadow: 0 8px 30px color-mix(in srgb, var(--color-primary) 50%, transparent); }

    .card-bold {
      background: #ffffff;
      border-radius: 1rem;
      border: 4px solid var(--color-primary);
      transition: all 0.3s ease;
    }
    .card-bold:hover { transform: translateY(-6px); box-shadow: 0 0 30px color-mix(in srgb, var(--color-primary) 30%, transparent); }

    .diagonal-top { clip-path: polygon(0 8%, 100% 0, 100% 100%, 0 100%); }
    .diagonal-bottom { clip-path: polygon(0 0, 100% 0, 100% 92%, 0 100%); }

    .text-gradient {
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  </style>
</head>
<body>
`;
}


// ============================================
// HEADER / NAV
// ============================================

function vdHeader(getContent: GetContent, colors: Colors, pages: any[], siteId: string, currentPage: string,
  baseUrl: string = ''
): string {
  const businessName = getContent('businessInfo.businessName');
  const phone = getContent('businessInfo.phone');

  const navLinks = pages.map(p => {
    const isActive = p.slug === currentPage || (p.slug === 'index' && (currentPage === 'home' || currentPage === 'index'));
    return `<a href="${baseUrl}${p.slug}"
      class="px-4 py-2 rounded-lg font-heading font-bold text-sm transition-all ${isActive ? 'bg-primary text-white' : 'text-gray-800 hover:bg-primary/10 hover:text-primary'}"
    >${p.name}</a>`;
  }).join('\n');

  return `
  <header data-section="header" class="sticky top-0 z-50 bg-white/95 backdrop-blur-sm" style="border-bottom: 4px solid var(--color-primary);">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex items-center justify-between h-20">
        <a href="${baseUrl}index" class="flex items-center gap-3">
          ${getContent('businessInfo.logoImage')
            ? `<img src="${getContent('businessInfo.logoImage')}" alt="${businessName}" style="max-height: 48px; max-width: 160px; object-fit: contain;">`
            : `<div class="w-12 h-12 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent));"><span class="text-2xl">🌿</span></div>`
          }
          <span class="text-xl font-heading font-black text-gray-900">${businessName}</span>
        </a>
        <nav class="hidden lg:flex items-center gap-1">
          ${navLinks}
        </nav>
        <div class="hidden lg:flex items-center gap-4">
          <a href="tel:${phone}" class="flex items-center gap-2 font-heading font-bold text-primary text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 013.09 5.18 2 2 0 015.11 3h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 11.91a16 16 0 006 6l2.27-2.27a2 2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z"/></svg>
            ${phone}
          </a>
          <a href="${baseUrl}contact" class="btn-gradient text-sm" style="padding: 0.625rem 1.25rem;">Get Quote</a>
        </div>
      </div>
    </div>
  </header>`;
}


// ============================================
// FOOTER
// ============================================

function vdFooter(getContent: GetContent, colors: Colors, pages: any[], siteId: string,
  baseUrl: string = ''
): string {
  const businessName = getContent('businessInfo.businessName');
  const phone = getContent('businessInfo.phone');
  const email = getContent('businessInfo.email');
  const address = getContent('businessInfo.address');
  const city = getContent('businessInfo.city');
  const state = getContent('businessInfo.state');
  const zip = getContent('businessInfo.zip');
  const tagline = getContent('footer.tagline') || getContent('footer.description');

  const quickLinks = pages.map(p =>
    `<li><a href="${baseUrl}${p.slug}" class="text-white/70 hover:text-primary transition-colors font-medium">${p.name}</a></li>`
  ).join('\n');

  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const dayLabels: Record<string, string> = { monday:'Mon', tuesday:'Tue', wednesday:'Wed', thursday:'Thu', friday:'Fri', saturday:'Sat', sunday:'Sun' };
  const hoursRows = days.map(d => {
    const h = getContent(`hours.${d}`);
    if (!h) return '';
    return `<div class="flex justify-between py-1"><span class="text-white/70">${dayLabels[d]}</span><span class="text-white font-bold">${h}</span></div>`;
  }).join('');

  return `
  <footer class="bg-gray-900 text-white">
    <div class="h-2" style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent));"></div>
    <div class="max-w-7xl mx-auto px-6 py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <!-- Brand -->
        <div>
          <div class="flex items-center gap-3 mb-6">
            ${getContent('businessInfo.logoImage')
              ? `<img src="${getContent('businessInfo.logoImage')}" alt="${businessName}" style="max-height: 40px; max-width: 140px; object-fit: contain;">`
              : `<div class="w-10 h-10 rounded-xl flex items-center justify-center" style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent));"><span class="text-lg">🌿</span></div>`
            }
            <span class="text-lg font-heading font-black text-white">${businessName}</span>
          </div>
          <p class="text-white/70 text-sm">${tagline}</p>
        </div>
        <!-- Links -->
        <div>
          <h3 class="text-lg font-heading font-black mb-4" style="color: var(--color-primary);">Quick Links</h3>
          <ul class="space-y-2 text-sm">${quickLinks}</ul>
        </div>
        <!-- Contact -->
        <div>
          <h3 class="text-lg font-heading font-black mb-4" style="color: var(--color-secondary);">Contact Us</h3>
          <div class="space-y-3 text-sm">
            <p class="text-white/70">${address}${city ? `, ${city}` : ''}${state ? `, ${state}` : ''} ${zip}</p>
            <p><a href="tel:${phone}" class="text-white/70 hover:text-secondary">${phone}</a></p>
            <p><a href="mailto:${email}" class="text-white/70 hover:text-secondary">${email}</a></p>
          </div>
        </div>
        <!-- Hours -->
        <div>
          <h3 class="text-lg font-heading font-black mb-4" style="color: var(--color-accent);">Hours</h3>
          <div class="text-sm space-y-1">${hoursRows}</div>
        </div>
      </div>
      <div class="mt-12 pt-8 border-t border-white/20 text-center">
        <p class="text-white/50 text-sm">&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
      </div>
    </div>
  </footer>`;
}


// ============================================
// HOME PAGE SECTIONS
// ============================================

function vdHomeSections(
  getContent: GetContent,
  colors: Colors,
  manufacturers: any[],
  vis: Record<string, boolean>,
  siteId: string,
  displayProducts: any[],
  isRealProducts: boolean,
  fmtPrice: FmtPrice,
  enabledFeatures: Set<string>,
  baseUrl: string = ''
): string {
  let html = '';

  // ── Hero ──
  if (vis.hero !== false) {
    html += `
    <section data-section="hero" class="relative overflow-hidden" style="min-height: 500px;">
      <div class="absolute inset-0" style="${getContent('hero.image') || getContent('hero.backgroundImage') ? `background-image: url('${getContent('hero.image') || getContent('hero.backgroundImage')}'); background-size: cover; background-position: center;` : `background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));`}"></div>
      <div class="absolute inset-0 md:hidden" style="background-color: var(--color-primary); opacity: 0.75;"></div>
      <div class="hidden md:block absolute inset-0" style="background: linear-gradient(to right, color-mix(in srgb, var(--color-primary) 85%, transparent) 40%, color-mix(in srgb, var(--color-primary) 50%, transparent) 65%, transparent 100%); right: 0; transform: none;"></div>
      <div class="max-w-7xl mx-auto px-6 relative z-10 flex items-center" style="min-height: 500px;">
        <div class="max-w-xl text-white py-12 md:py-0">
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-white mb-4 leading-none">${getContent('hero.title') || getContent('hero.heading') || 'POWER YOUR LAWN'}</h1>
          <h2 class="text-xl md:text-2xl font-heading font-bold text-white mb-4">${getContent('hero.subtitle') || getContent('hero.subheading') || ''}</h2>
          <p class="text-base md:text-lg text-white/90 mb-8 max-w-lg">${getContent('hero.description') || ''}</p>
          <div class="flex flex-wrap gap-4">
            <a href="${getContent('hero.button1.destination') === '__custom' ? getContent('hero.button1.destination_url') : `${baseUrl}${getContent('hero.button1.destination') || 'inventory'}`}" class="btn-gradient text-base md:text-lg px-6 md:px-8 py-3 md:py-4">${getContent('hero.button1.text') || 'Shop Equipment'}</a>
            <a href="${getContent('hero.button2.destination') === '__custom' ? getContent('hero.button2.destination_url') : `${baseUrl}${getContent('hero.button2.destination') || 'rentals'}`}" class="inline-flex items-center px-6 md:px-8 py-3 md:py-4 rounded-full font-heading font-bold text-base md:text-lg text-white border-3 md:border-4 border-white hover:bg-white hover:text-primary transition-all">${getContent('hero.button2.text') || 'View Rentals'}</a>
          </div>
        </div>
      </div>
    </section>`;
  }

  // ── Stats ──
  if (vis.stats !== false) {
    const stats = ['1','2','3','4'].map(n => ({
      value: getContent(`stats.stat${n}Value`),
      label: getContent(`stats.stat${n}Label`),
    })).filter(s => s.value);

    if (stats.length > 0) {
      html += `
      <section data-section="stats" class="py-16 relative overflow-hidden" style="background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));">
        <div class="max-w-7xl mx-auto px-6">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            ${stats.map(s => `
              <div>
                <div class="text-5xl font-heading font-black text-white mb-2">${s.value}</div>
                <div class="text-white font-heading font-bold text-sm uppercase tracking-wide">${s.label}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>`;
    }
  }

  // ── Featured Products ──
  if (vis.featured !== false) {
    html += `
    <section data-section="featured" class="py-20 relative overflow-hidden" style="background-color: var(--color-primary);">
      <div class="absolute top-10 right-10 w-40 h-40 rounded-full opacity-20" style="background-color: var(--color-accent);"></div>
      <div class="absolute bottom-20 left-20 w-24 h-24 rounded-full opacity-20" style="background-color: var(--color-secondary);"></div>
      <div class="max-w-7xl mx-auto px-6 relative z-10">
        <div class="text-center mb-12">
          <h2 class="text-5xl font-heading font-black text-white mb-4">${getContent('featured.heading')}</h2>
          <p class="text-xl text-white/80">${getContent('featured.subheading')}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${displayProducts.map((item: any, idx: number) => {
            const borderColor = idx % 3 === 0 ? 'var(--color-primary)' : idx % 3 === 1 ? 'var(--color-secondary)' : 'var(--color-accent)';
            const pd = JSON.stringify({id:item.id||item.slug,title:item.title||'',description:item.description||'',price:item.price||null,sale_price:item.sale_price||null,primary_image:item.primary_image||null,category:item.category||'',model:item.model||'',slug:item.slug||''}).replace(/"/g,'&quot;');
            return `
            <div class="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 cursor-pointer" style="border: 4px solid ${borderColor};" onclick="fmOpenProduct(${pd})">
              <div class="h-48" style="${item.primary_image ? `background: url('${item.primary_image}') center/cover no-repeat;` : `background: linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent));`}"></div>
              <div class="p-5">
                <h3 class="font-heading font-black text-lg mb-1" style="color: var(--color-primary);">${item.title.toUpperCase()}</h3>
                <p class="font-heading font-black text-xl text-gray-900 mb-3">
                  ${isRealProducts && item.price ? fmtPrice(item.sale_price || item.price) : 'PREMIUM EQUIPMENT'}
                  ${isRealProducts && item.sale_price ? `<span class="text-sm text-gray-400 line-through ml-2">${fmtPrice(item.price)}</span>` : ''}
                </p>
                <span class="inline-block text-white font-bold text-sm px-5 py-2 rounded-full" style="background-color: var(--color-secondary);">VIEW DETAILS</span>
              </div>
            </div>`;
          }).join('')}
        </div>
        <div class="text-center mt-10">
        </div>
      </div>
    </section>`;
  }

  // ── Manufacturers ──
  if (vis.manufacturers !== false) {
    html += `
    <section data-section="manufacturers" class="py-20 bg-white relative overflow-hidden">
      <div class="absolute top-0 left-0 right-0 h-1" style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent));"></div>
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="text-5xl font-heading font-black text-gray-900 mb-4">${getContent('manufacturers.heading')}</h2>
          <p class="text-xl text-gray-500">${getContent('manufacturers.subheading')}</p>
        </div>
        <div class="flex flex-wrap justify-center gap-8">
          ${manufacturers.map((m, i) => `
            <div class="text-center group">
              <div class="w-28 h-28 rounded-full flex items-center justify-center bg-white mx-auto transition-all group-hover:scale-110" style="border: 3px solid var(--color-primary); box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                ${(m.logo_url || m.logoUrl) ? `<img src="${m.logo_url || m.logoUrl}" alt="${m.name}" class="max-h-12 max-w-20 object-contain">` : `<span class="font-heading font-black text-sm" style="color: var(--color-primary);">${m.name}</span>`}
              </div>
              <p class="mt-3 font-heading font-bold text-gray-800 text-sm group-hover:text-primary transition-colors">${m.name}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`;
  }

  // ── Services ──
  if (vis.services !== false) {
    html += `
    <section data-section="services" class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-6">
        <h2 class="text-5xl font-heading font-black text-center mb-12" style="color: var(--color-primary);">${getContent('services.heading')}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          ${['1','2','3','4'].map(num => {
            const title = getContent(`services.service${num}Title`);
            const desc = getContent(`services.service${num}Description`);
            if (!title) return '';
            return `
            <div class="rounded-2xl p-6 text-white" style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));">
              <h3 class="text-xl font-heading font-black text-white mb-3">${title}</h3>
              <p class="text-white/90 text-sm">${desc}</p>
            </div>`;
          }).join('')}
        </div>
      </div>
    </section>`;
  }

  // ── Testimonials ──
  if (vis.testimonials !== false) {
    const cardBgs = ['var(--color-primary)', 'var(--color-secondary)', 'var(--color-accent)'];
    let testimonials: any[] = [];
    try { testimonials = JSON.parse(getContent('testimonials.items') || '[]'); } catch {}
    if (testimonials.length > 0) html += `
    <section data-section="testimonials" class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-12">
          <h2 class="text-5xl font-heading font-black text-gray-900 mb-4">${getContent('testimonials.heading') || 'WHAT CUSTOMERS SAY'}</h2>
          <p class="text-xl text-gray-500">${getContent('testimonials.subheading') || "Don't just take our word for it"}</p>
        </div>
        <div class="grid md:grid-cols-3 gap-8">
          ${testimonials.map((t, i) => `
            <div class="rounded-3xl p-8 relative overflow-hidden" style="background-color: ${cardBgs[i % 3]};">
              <div class="text-8xl font-black leading-none opacity-10 text-white absolute top-2 left-6">"</div>
              <div class="relative z-10">
                <div class="flex gap-1 mb-4">${'★★★★★'.split('').map(s => `<span class="text-yellow-300 text-xl">${s}</span>`).join('')}</div>
                <p class="text-lg text-white font-medium mb-6">${t.quote}</p>
                <p class="font-heading font-black text-xl text-white">${t.name}</p>
                <p class="text-white/70">${t.title || ''}${t.company ? `, ${t.company}` : ''}</p>
              </div>
              <div class="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>`;
  }

  // ── CTA ──
  if (vis.cta !== false) {
    html += `
    <section data-section="cta" class="py-20 text-center relative overflow-hidden" style="background: linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent));">
      <div class="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/10 -translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/10 translate-x-1/3 translate-y-1/3"></div>
      <div class="max-w-4xl mx-auto px-6 relative z-10">
        <h2 class="text-5xl md:text-6xl font-heading font-black text-white mb-6">${getContent('cta.heading') || 'READY TO GET STARTED?'}</h2>
        <p class="text-xl text-white/90 mb-10 max-w-2xl mx-auto">${getContent('cta.subheading') || ''}</p>
        <div class="flex flex-wrap justify-center gap-6">
          <a href="${getContent('cta.button1.destination') === '__custom' ? getContent('cta.button1.destination_url') : `${baseUrl}${getContent('cta.button1.destination') || 'inventory'}`}" class="inline-block bg-white font-heading font-black text-xl px-10 py-4 rounded-full transition-all hover:-translate-y-1" style="color: var(--color-primary);">${getContent('cta.button1.text') || 'Browse Equipment'}</a>
          <a href="tel:${getContent('businessInfo.phone')}" class="inline-flex items-center px-10 py-4 rounded-full font-heading font-bold text-lg text-white border-4 border-white hover:bg-white hover:text-primary transition-all">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 013.09 5.18 2 2 0 015.11 3h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 11.91a16 16 0 006 6l2.27-2.27a2 2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z"/></svg>
            ${getContent('cta.button2.text') || getContent('cta.secondaryText') || 'Call Now'}
          </a>
        </div>
        <p class="mt-8 text-white/70 text-lg">${getContent('cta.trustLine') || '⭐ Rated 4.9/5 by over 5,000 customers'}</p>
      </div>
    </section>`;
  }

  return html;
}


// ============================================
// SUBPAGE: SERVICE
// ============================================

function vdServicePage(getContent: GetContent, colors: Colors, siteId: string, hasScheduler: boolean, vis: Record<string, boolean>,
  baseUrl: string = ''
): string {
  const serviceHeroImg = getContent('servicePage.heroImage');
  const heroHtml = `
  <section data-section="servicePage" class="relative overflow-hidden py-16 md:py-20" style="${serviceHeroImg ? `background-image: url('${serviceHeroImg}'); background-size: cover; background-position: center;` : `background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));`}">
    ${serviceHeroImg ? `<div class="absolute inset-0" style="background: linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.4));"></div>` : `<div class="absolute top-10 right-10 w-32 h-32 rounded-full opacity-20" style="background-color: var(--color-accent);"></div>`}
    <div class="max-w-7xl mx-auto px-6 text-center relative z-10">
      <h1 class="text-5xl md:text-6xl font-heading font-black text-white mb-4">${getContent('servicePage.heading') || 'SERVICE & REPAIR'}</h1>
      <p class="text-xl text-white/80 max-w-2xl mx-auto">${getContent('servicePage.subheading') || 'Expert service for all your equipment needs'}</p>
    </div>
  </section>`;

  const services = ['1','2','3','4'].map((n, i) => {
    const title = getContent(`servicePage.service${n}Title`);
    const desc = getContent(`servicePage.service${n}Description`);
    if (!title) return '';
    const borderColor = i % 3 === 0 ? 'var(--color-primary)' : i % 3 === 1 ? 'var(--color-secondary)' : 'var(--color-accent)';
    return `
    <div class="card-bold p-8" style="border-color: ${borderColor};">
      <h3 class="text-2xl font-heading font-black text-gray-900 mb-3">${title}</h3>
      <p class="text-gray-600 mb-6">${desc}</p>
      <a href="${baseUrl}${getContent('servicePage.ctaLink') || 'contact'}" class="btn-gradient text-sm">Request Service →</a>
    </div>`;
  }).join('');

  const servicesHtml = `
  <section data-section="serviceTypes" class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid md:grid-cols-3 gap-8">${services}</div>
    </div>
  </section>`;

  const ctaHtml = `
  <section data-section="serviceCta" class="py-16 text-center" style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent));">
    <div class="max-w-3xl mx-auto px-6">
      <h2 class="text-4xl font-heading font-black text-white mb-4">${getContent('servicePage.ctaHeading') || 'Need Service?'}</h2>
      <p class="text-lg text-white/90 mb-8">${getContent('servicePage.contentText') || 'Contact us to schedule a repair or maintenance appointment.'}</p>
      <a href="${baseUrl}${getContent('servicePage.ctaLink') || 'contact'}" class="inline-block bg-white font-heading font-black text-lg px-8 py-4 rounded-full" style="color: var(--color-primary);">${getContent('servicePage.ctaButton') || 'Get In Touch'}</a>
    </div>
  </section>`;

  // Simple request form for all users
  const simpleFormHtml = `
  <section data-section="serviceForm" class="py-16 bg-gray-50">
    <div class="max-w-3xl mx-auto px-6">
      <div class="card-bold p-8">
        <h2 class="text-3xl font-heading font-black text-gray-900 mb-2">${getContent('servicePage.formHeading') || 'Request Service'}</h2>
        <p class="text-gray-500 mb-8">${getContent('servicePage.formSubheading') || 'Fill out the form below and our service team will be in touch within one business day.'}</p>
        <form class="space-y-4" onsubmit="event.preventDefault(); fmSubmitForm(this, '${siteId}', 'service', function(f){var inputs=f.querySelectorAll('input[type=text]');return {first_name:inputs[0]?inputs[0].value:'',last_name:inputs[1]?inputs[1].value:'',equipment:inputs[2]?inputs[2].value:''};});">
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-800 mb-1">First Name *</label>
              <input type="text" required class="w-full px-4 py-3 rounded-xl border-[3px] border-gray-200 focus:border-primary focus:outline-none" placeholder="John">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-800 mb-1">Last Name *</label>
              <input type="text" required class="w-full px-4 py-3 rounded-xl border-[3px] border-gray-200 focus:border-primary focus:outline-none" placeholder="Smith">
            </div>
          </div>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-800 mb-1">Phone *</label>
              <input type="tel" required class="w-full px-4 py-3 rounded-xl border-[3px] border-gray-200 focus:border-primary focus:outline-none" placeholder="(555) 123-4567">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-800 mb-1">Email *</label>
              <input type="email" required class="w-full px-4 py-3 rounded-xl border-[3px] border-gray-200 focus:border-primary focus:outline-none" placeholder="john@example.com">
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-800 mb-1">Equipment Type & Model *</label>
            <input type="text" required class="w-full px-4 py-3 rounded-xl border-[3px] border-gray-200 focus:border-primary focus:outline-none" placeholder="e.g., Toro Z Master 60&quot;">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-800 mb-1">Describe the Issue *</label>
            <textarea rows="4" required class="w-full px-4 py-3 rounded-xl border-[3px] border-gray-200 focus:border-primary focus:outline-none" placeholder="What's going on with your equipment?"></textarea>
          </div>
          <button type="submit" class="btn-gradient w-full text-lg py-4">${getContent('servicePage.ctaButton') || 'Submit Request'}</button>
        </form>
        <div id="vd-svc-success" style="display:none;" class="text-center py-8">
          <div class="text-5xl mb-4">✓</div>
          <h3 class="text-2xl font-heading font-black text-gray-900 mb-2">Request Received!</h3>
          <p class="text-gray-500">We'll be in touch within one business day.</p>
        </div>
      </div>
    </div>
  </section>`;

  // Show premium scheduling form if add-on is enabled, otherwise show simple form
  const formSection = hasScheduler
    ? serviceBookingSection(siteId, colors.primary, getContent)
    : simpleFormHtml;

  return heroHtml + servicesHtml + ctaHtml + formSection;
}


// ============================================
// SUBPAGE: CONTACT
// ============================================

function vdContactPage(getContent: GetContent, colors: Colors, siteId: string, vis: Record<string, boolean>,
  baseUrl: string = ''
): string {
  const contactHeroImg = getContent('contactPage.heroImage');
  const heroHtml = `
  <section data-section="contactPage" class="relative overflow-hidden py-16 md:py-20" style="${contactHeroImg ? `background-image: url('${contactHeroImg}'); background-size: cover; background-position: center;` : `background: linear-gradient(135deg, var(--color-primary), var(--color-accent));`}">
    ${contactHeroImg ? `<div class="absolute inset-0" style="background: linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.4));"></div>` : `<div class="absolute top-10 right-10 w-32 h-32 rounded-full opacity-20" style="background-color: var(--color-secondary);"></div>`}
    <div class="max-w-7xl mx-auto px-6 text-center relative z-10">
      <h1 class="text-5xl md:text-6xl font-heading font-black text-white mb-4">${getContent('contactPage.heading') || 'GET IN TOUCH'}</h1>
      <p class="text-xl text-white/80 max-w-2xl mx-auto">${getContent('contactPage.subheading') || "We're here to help"}</p>
    </div>
  </section>`;

  const phone = getContent('businessInfo.phone');
  const email = getContent('businessInfo.email');
  const address = getContent('businessInfo.address');
  const city = getContent('businessInfo.city');
  const state = getContent('businessInfo.state');

  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const dayLabels: Record<string, string> = { monday:'Monday',tuesday:'Tuesday',wednesday:'Wednesday',thursday:'Thursday',friday:'Friday',saturday:'Saturday',sunday:'Sunday' };
  const hoursRows = days.map(d => {
    const h = getContent(`hours.${d}`);
    if (!h) return '';
    return `<div class="flex justify-between py-2 border-b border-white/20"><span class="font-bold">${dayLabels[d]}</span><span class="text-white font-heading font-bold">${h}</span></div>`;
  }).join('');

  const formHtml = `
  <section data-section="contactForm" class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid lg:grid-cols-2 gap-12">
        <!-- Form -->
        <div class="card-bold p-8">
          <h2 class="text-3xl font-heading font-black text-gray-900 mb-6">${getContent('contactPage.formHeading') || 'Send a Message'}</h2>
          <form class="space-y-4" onsubmit="event.preventDefault(); fmSubmitForm(this, '${siteId}', 'contact', function(f){var sel=f.querySelector('select');return sel?{subject:sel.value}:null;}); return false;">
            <div class="grid md:grid-cols-2 gap-4">
              <div><label class="block text-sm font-bold text-gray-800 mb-1">Your Name *</label><input type="text" class="w-full px-4 py-3 rounded-xl border-[3px] border-gray-200 focus:border-primary focus:outline-none" placeholder="John Doe"></div>
              <div><label class="block text-sm font-bold text-gray-800 mb-1">Email *</label><input type="email" class="w-full px-4 py-3 rounded-xl border-[3px] border-gray-200 focus:border-primary focus:outline-none" placeholder="john@example.com"></div>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
              <div><label class="block text-sm font-bold text-gray-800 mb-1">Phone</label><input type="tel" class="w-full px-4 py-3 rounded-xl border-[3px] border-gray-200 focus:border-primary focus:outline-none" placeholder="(555) 123-4567"></div>
              <div><label class="block text-sm font-bold text-gray-800 mb-1">Subject</label><select class="w-full px-4 py-3 rounded-xl border-[3px] border-gray-200 focus:border-primary focus:outline-none"><option>Sales Inquiry</option><option>Service Question</option><option>Rental Inquiry</option><option>Parts Request</option><option>Other</option></select></div>
            </div>
            <div><label class="block text-sm font-bold text-gray-800 mb-1">Message *</label><textarea rows="4" class="w-full px-4 py-3 rounded-xl border-[3px] border-gray-200 focus:border-primary focus:outline-none" placeholder="How can we help?"></textarea></div>
            <button type="submit" class="btn-gradient w-full text-lg py-4">Send Message</button>
          </form>
        </div>

        <!-- Contact Info -->
        <div class="space-y-6">
          <div class="rounded-3xl p-8 text-white" style="background-color: var(--color-primary);">
            <h2 class="text-2xl font-heading font-black mb-6">Contact Information</h2>
            <div class="space-y-5">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.86 19.86 0 013.09 5.18 2 2 0 015.11 3h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 11.91a16 16 0 006 6l2.27-2.27a2 2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z"/></svg></div>
                <div><p class="text-white/60 text-sm font-bold">Phone</p><p class="text-lg font-heading font-bold">${phone}</p></div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>
                <div><p class="text-white/60 text-sm font-bold">Email</p><p class="text-lg font-heading font-bold">${email}</p></div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0"><svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
                <div><p class="text-white/60 text-sm font-bold">Address</p><p class="text-lg font-heading font-bold">${address}${city ? `, ${city}` : ''}${state ? `, ${state}` : ''}</p></div>
              </div>
            </div>
          </div>
          <div class="rounded-3xl p-8 text-white" style="background-color: var(--color-secondary);">
            <h2 class="text-2xl font-heading font-black mb-4">Business Hours</h2>
            <div class="text-sm">${hoursRows}</div>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  const contactContentHtml = (getContent('contactPage.contentHeading') || getContent('contactPage.contentText')) ? `
  <section data-section="contactContent" class="py-10 bg-gray-50">
    <div class="max-w-3xl mx-auto px-6 text-center">
      ${getContent('contactPage.contentHeading') ? `<h2 class="text-3xl font-heading font-black text-gray-900 mb-3">${getContent('contactPage.contentHeading')}</h2>` : ''}
      ${getContent('contactPage.contentText') ? `<p class="text-gray-600 text-lg leading-relaxed">${getContent('contactPage.contentText')}</p>` : ''}
    </div>
  </section>` : '';

  const mapHtml = (getContent('contactPage.mapEmbed') || address) ? `
  <section data-section="contactMap" class="pb-16 bg-white">
    <div class="max-w-7xl mx-auto px-6">
      <div class="rounded-3xl overflow-hidden" style="height: 400px; border: 3px solid var(--color-primary);">
        ${getContent('contactPage.mapEmbed')
          ? getContent('contactPage.mapEmbed')
          : `<iframe src="https://maps.google.com/maps?q=${encodeURIComponent(address + (city ? ', ' + city : '') + (state ? ', ' + state : ''))}&output=embed" width="100%" height="400" style="border:0;display:block;" allowfullscreen loading="lazy" title="Business location"></iframe>`}
      </div>
    </div>
  </section>` : '';

  return heroHtml + contactContentHtml + formHtml + mapHtml;
}


// ============================================
// SUBPAGE: MANUFACTURERS
// ============================================

function vdManufacturersPage(getContent: GetContent, colors: Colors, manufacturers: any[], siteId: string, vis: Record<string, boolean>,
  baseUrl: string = ''
): string {
  const mfgHeroImg = getContent('manufacturersPage.heroImage');
  const heroHtml = `
  <section data-section="manufacturersPage" class="relative overflow-hidden py-16 md:py-20" style="${mfgHeroImg ? `background-image: url('${mfgHeroImg}'); background-size: cover; background-position: center;` : `background: linear-gradient(135deg, var(--color-primary), var(--color-accent));`}">
    ${mfgHeroImg ? `<div class="absolute inset-0" style="background: linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.4));"></div>` : ''}
    <div class="max-w-7xl mx-auto px-6 text-center relative z-10">
      <h1 class="text-5xl md:text-6xl font-heading font-black text-white mb-4">${getContent('manufacturersPage.heading') || 'OUR BRANDS'}</h1>
      <p class="text-xl text-white/80 max-w-2xl mx-auto">${getContent('manufacturersPage.subheading') || 'Authorized dealer for the best names in outdoor power'}</p>
    </div>
  </section>`;

  const contentHtml = `
  <section data-section="manufacturersList" class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-6">
      ${getContent('manufacturersPage.contentHeading') ? `<h2 class="text-4xl font-heading font-black text-center mb-4" style="color: var(--color-primary);">${getContent('manufacturersPage.contentHeading')}</h2>` : ''}
      ${(getContent('manufacturersPage.contentText') || getContent('manufacturersPage.introText')) ? `<p class="text-center text-gray-600 mb-12 max-w-3xl mx-auto">${getContent('manufacturersPage.contentText') || getContent('manufacturersPage.introText')}</p>` : ''}
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        ${manufacturers.map((m, i) => `
          <div class="text-center group">
            <div class="w-28 h-28 rounded-full flex items-center justify-center bg-white mx-auto transition-all group-hover:scale-110" style="border: 3px solid var(--color-primary); box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              ${(m.logo_url || m.logoUrl) ? `<img src="${m.logo_url || m.logoUrl}" alt="${m.name}" class="max-h-12 max-w-20 object-contain">` : `<span class="font-heading font-black text-sm" style="color: var(--color-primary);">${m.name}</span>`}
            </div>
            <p class="mt-3 font-heading font-bold text-gray-800 text-sm">${m.name}</p>
            ${m.description ? `<p class="text-xs text-gray-500 mt-1 mb-2">${m.description}</p>` : ''}
            <a href="${baseUrl}contact" class="text-xs font-bold mt-1" style="color: var(--color-primary); text-decoration: none;">Learn More →</a>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;

  const mfgCtaHeading = getContent('manufacturersPage.ctaHeading');
  const mfgCtaText = getContent('manufacturersPage.ctaText');
  const mfgCtaBtn = getContent('manufacturersPage.ctaPrimaryText') || 'Contact Us';
  const ctaHtml = (mfgCtaHeading || mfgCtaText) ? `
  <section class="py-16 text-center" style="background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));">
    <div class="max-w-3xl mx-auto px-6">
      ${mfgCtaHeading ? `<h2 class="text-4xl font-heading font-black text-white mb-4">${mfgCtaHeading}</h2>` : ''}
      ${mfgCtaText ? `<p class="text-lg text-white/90 mb-8">${mfgCtaText}</p>` : ''}
      <a href="${getContent('manufacturersPage.button1.destination') === '__custom' ? getContent('manufacturersPage.button1.destination_url') : `${baseUrl}${getContent('manufacturersPage.button1.destination') || 'contact'}`}" class="inline-block bg-white font-heading font-black text-lg px-8 py-4 rounded-full" style="color: var(--color-primary);">${getContent('manufacturersPage.button1.text') || mfgCtaBtn}</a>
    </div>
  </section>` : '';

  return heroHtml + contentHtml + ctaHtml;
}


// ============================================
// SUBPAGE: INVENTORY
// ============================================

async function vdInventoryPage(
  getContent: GetContent,
  colors: Colors,
  siteId: string,
  supabase: any,
  displayProducts: any[],
  isRealProducts: boolean,
  fmtPrice: FmtPrice,
  vis: Record<string, boolean>,
  baseUrl: string = ''
): Promise<string> {
  // Try to load real products
  let products = displayProducts;
  if (supabase && !siteId.startsWith('demo-')) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('site_id', siteId)
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(24);
    if (data && data.length > 0) products = data;
  }

  const invHeroImg = getContent('inventoryPage.heroImage');
  const heroHtml = `
  <section data-section="inventoryPage" class="relative overflow-hidden py-16 md:py-20" style="${invHeroImg ? `background-image: url('${invHeroImg}'); background-size: cover; background-position: center;` : `background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));`}">
    ${invHeroImg ? `<div class="absolute inset-0" style="background: linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.4));"></div>` : ''}
    <div class="max-w-7xl mx-auto px-6 text-center relative z-10">
      <h1 class="text-5xl md:text-6xl font-heading font-black text-white mb-4">${getContent('inventoryPage.heading') || 'EQUIPMENT INVENTORY'}</h1>
      <p class="text-xl text-white/80 max-w-2xl mx-auto">${getContent('inventoryPage.subheading') || 'Browse our complete selection'}</p>
    </div>
  </section>`;

  const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))];
  const filterHtml = categories.length > 0 ? `
    <div class="flex flex-wrap gap-3 mb-8 justify-center">
      <button class="px-6 py-2 rounded-xl font-heading font-bold text-sm bg-primary text-white" onclick="document.querySelectorAll('[data-product]').forEach(el=>el.style.display='')">All</button>
      ${categories.map(c => `<button class="px-6 py-2 rounded-xl font-heading font-bold text-sm bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary" onclick="document.querySelectorAll('[data-product]').forEach(el=>{el.style.display=el.dataset.category==='${c}'?'':'none'})">${c}</button>`).join('')}
    </div>` : '';

  const gridHtml = `
  <section data-section="inventoryGrid" class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-6">
      ${filterHtml}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        ${products.map((item: any, idx: number) => {
          const borderColor = idx % 3 === 0 ? 'var(--color-primary)' : idx % 3 === 1 ? 'var(--color-secondary)' : 'var(--color-accent)';
          return `
          <div data-product data-category="${item.category || ''}" class="bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 cursor-pointer" style="border: 4px solid ${borderColor};" onclick="(function(el){try{fmOpenProduct(JSON.parse(el.getAttribute('data-p')));}catch(e){}})(this)" data-p="${JSON.stringify({id:item.id||item.slug,title:item.title||'',description:item.description||'',price:item.price||null,sale_price:item.sale_price||null,primary_image:item.primary_image||null,category:item.category||'',model:item.model||'',slug:item.slug||''}).replace(/"/g,'&quot;')}">
            <div class="h-52" style="${item.primary_image ? `background: url('${item.primary_image}') center/cover no-repeat;` : `background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));`}"></div>
            <div class="p-5">
              ${item.category ? `<span class="inline-block text-xs font-bold uppercase tracking-wide mb-1" style="color: var(--color-primary);">${item.category}</span>` : ''}
              <h3 class="font-heading font-black text-lg text-gray-900 mb-1">${item.title}</h3>
              ${item.description ? `<p class="text-gray-500 text-sm mb-3 line-clamp-2">${item.description}</p>` : ''}
              <div class="flex items-center justify-between">
                <span class="font-heading font-black text-xl" style="color: var(--color-primary);">
                  ${item.price ? fmtPrice(item.sale_price || item.price) : 'Call for Price'}
                  ${item.sale_price ? `<span class="text-sm text-gray-400 line-through ml-2">${fmtPrice(item.price)}</span>` : ''}
                </span>
                <span class="btn-gradient text-sm" style="padding: 0.5rem 1rem;">Details</span>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
      ${products.length === 0 ? '<p class="text-center text-gray-400 py-12">No products available yet.</p>' : ''}
    </div>
  </section>`;

  const invContentHtml = (getContent('inventoryPage.contentHeading') || getContent('inventoryPage.contentText')) ? `
  <section data-section="inventoryContent" class="py-10 bg-gray-50">
    <div class="max-w-3xl mx-auto px-6 text-center">
      ${getContent('inventoryPage.contentHeading') ? `<h2 class="text-3xl font-heading font-black text-gray-900 mb-3">${getContent('inventoryPage.contentHeading')}</h2>` : ''}
      ${getContent('inventoryPage.contentText') ? `<p class="text-gray-600 text-lg leading-relaxed">${getContent('inventoryPage.contentText')}</p>` : ''}
    </div>
  </section>` : '';

  return heroHtml + invContentHtml + gridHtml;
}


// ============================================
// SUBPAGE: RENTALS
// ============================================

async function vdRentalsPage(
  getContent: GetContent,
  colors: Colors,
  siteId: string,
  supabase: any,
  hasRentalScheduling: boolean,
  vis: Record<string, boolean>,
  baseUrl: string = ''
): Promise<string> {
  const heading = getContent('rentalsPage.heading') || 'EQUIPMENT RENTALS';
  const subheading = getContent('rentalsPage.subheading') || 'Pro-grade equipment available daily, weekly, or monthly';
  const rentalsHeroImg = getContent('rentalsPage.heroImage');

  const heroHtml = `
  <section data-section="rentalsPage" class="relative overflow-hidden py-16 md:py-20" style="${rentalsHeroImg ? `background-image: url('${rentalsHeroImg}'); background-size: cover; background-position: center;` : `background: linear-gradient(135deg, var(--color-primary), var(--color-accent));`}">
    ${rentalsHeroImg ? `<div class="absolute inset-0" style="background: linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.4));"></div>` : ''}
    <div class="max-w-7xl mx-auto px-6 text-center relative z-10">
      <h1 class="text-5xl md:text-6xl font-heading font-black text-white mb-4">${heading}</h1>
      <p class="text-xl text-white/80 max-w-2xl mx-auto">${subheading}</p>
    </div>
  </section>`;

  let inventorySection = '';
  if (supabase && hasRentalScheduling) {
    const { data: rentals } = await supabase
      .from('rental_inventory').select('*').eq('site_id', siteId)
      .eq('status', 'available').order('display_order');
    if (rentals && rentals.length > 0) {
      inventorySection = `
      <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-6">
          <h2 class="text-4xl font-heading font-black text-center mb-12" style="color: var(--color-secondary);">AVAILABLE EQUIPMENT</h2>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;">
            ${rentals.map((item: any) => `
            <div style="border:3px solid var(--color-secondary,#7c3aed);border-radius:1rem;overflow:hidden;background:white;">
              <div style="aspect-ratio:4/3;overflow:hidden;position:relative;background:#f3f4f6;">
                ${item.primary_image ? `<img src="${item.primary_image}" alt="${item.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;">&#x1F69C;</div>`}
                ${!item.quantity_available || item.quantity_available === 0 ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;"><span style="background:#dc2626;color:white;padding:0.375rem 1rem;font-weight:700;font-size:0.875rem;border-radius:0.25rem;">Currently Rented</span></div>` : `<span style="position:absolute;top:0.75rem;right:0.75rem;background:var(--color-accent,#7c3aed);color:white;font-size:0.75rem;font-weight:700;padding:0.25rem 0.5rem;border-radius:9999px;">${item.quantity_available} Available</span>`}
              </div>
              <div style="padding:1.25rem;">
                <span style="display:inline-block;background:rgba(124,58,237,0.1);color:var(--color-secondary,#7c3aed);font-size:0.75rem;font-weight:700;text-transform:uppercase;padding:0.2rem 0.6rem;border-radius:9999px;margin-bottom:0.5rem;">${item.category || 'Rental'}</span>
                <h3 class="font-heading font-black" style="font-size:1rem;color:#111827;margin:0 0 0.375rem;">${item.title}</h3>
                ${item.description ? `<p style="font-size:0.875rem;color:#6b7280;margin:0 0 0.75rem;">${item.description.substring(0,100)}</p>` : ''}
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin-bottom:0.75rem;text-align:center;">
                  ${item.daily_rate ? `<div style="background:#f3f4f6;padding:0.5rem;border-radius:0.5rem;"><p style="font-weight:800;color:var(--color-primary,#6d28d9);margin:0;font-size:0.9375rem;">$${item.daily_rate}</p><p style="font-size:0.7rem;color:#6b7280;margin:0;">Daily</p></div>` : ''}
                  ${item.weekly_rate ? `<div style="background:#f3f4f6;padding:0.5rem;border-radius:0.5rem;"><p style="font-weight:800;color:var(--color-primary,#6d28d9);margin:0;font-size:0.9375rem;">$${item.weekly_rate}</p><p style="font-size:0.7rem;color:#6b7280;margin:0;">Weekly</p></div>` : ''}
                  ${item.monthly_rate ? `<div style="background:#f3f4f6;padding:0.5rem;border-radius:0.5rem;"><p style="font-weight:800;color:var(--color-primary,#6d28d9);margin:0;font-size:0.9375rem;">$${item.monthly_rate}</p><p style="font-size:0.7rem;color:#6b7280;margin:0;">Monthly</p></div>` : ''}
                </div>
                ${item.quantity_available > 0
                  ? rentalReserveButton(item, 'fm', 'block w-full text-center cta-button rounded-md text-sm py-2 cursor-pointer border-0')
                  : `<button disabled style="display:block;width:100%;padding:0.75rem;background:#e5e7eb;color:#9ca3af;border:none;border-radius:0.5rem;font-size:0.9375rem;cursor:not-allowed;">UNAVAILABLE</button>`
                }
              </div>
            </div>`).join('')}
          </div>
        </div>
      </section>
      `;
    }
  }

  const howHeading = getContent('rentalsPage.processHeading') || getContent('rentalsPage.contentHeading') || 'HOW RENTALS WORK';
  const infoHtml = `
  <section data-section="rentalInfo" class="py-16 bg-white">
    <div class="max-w-7xl mx-auto px-6">
      <h2 class="text-4xl font-heading font-black text-center mb-12" style="color: var(--color-secondary);">${howHeading}</h2>
      <div class="grid md:grid-cols-3 gap-8">
        ${[
          { icon: '📋', title: getContent('rentalsPage.step1Title') || '1. Request', desc: getContent('rentalsPage.step1Text') || 'Fill out our rental request form with your project details and preferred dates.' },
          { icon: '✅', title: getContent('rentalsPage.step2Title') || '2. Confirm', desc: getContent('rentalsPage.step2Text') || 'We will confirm availability and send you a rental agreement to review.' },
          { icon: '🚚', title: getContent('rentalsPage.step3Title') || '3. Pickup/Delivery', desc: getContent('rentalsPage.step3Text') || 'Pick up your equipment or schedule delivery to your job site.' },
        ].map(step => `
          <div class="bg-white rounded-2xl p-8 text-center" style="border: 3px solid var(--color-secondary);">
            <span class="text-5xl mb-4 block">${step.icon}</span>
            <h3 class="text-2xl font-heading font-black text-gray-900 mb-2">${step.title}</h3>
            <p class="text-gray-600">${step.desc}</p>
          </div>`).join('')}
      </div>
    </div>
  </section>`;

  const rentalContentHtml = (getContent('rentalsPage.pageContentHeading') || getContent('rentalsPage.pageContentText') || getContent('rentalsPage.pricingNote')) ? `
  <section data-section="rentalContent" class="py-10 bg-gray-50">
    <div class="max-w-3xl mx-auto px-6 text-center">
      ${getContent('rentalsPage.pageContentHeading') ? `<h2 class="text-3xl font-heading font-black text-gray-900 mb-3">${getContent('rentalsPage.pageContentHeading')}</h2>` : ''}
      ${getContent('rentalsPage.pageContentText') ? `<p class="text-gray-600 text-lg leading-relaxed mb-4">${getContent('rentalsPage.pageContentText')}</p>` : ''}
      ${getContent('rentalsPage.pricingNote') ? `<p class="text-sm text-gray-700 bg-white border-2 border-gray-200 rounded-xl px-5 py-3 inline-block">${getContent('rentalsPage.pricingNote')}</p>` : ''}
    </div>
  </section>` : '';

  const ctaHtml = !inventorySection ? `
  <section class="py-16 text-center" style="background-color: var(--color-secondary);">
    <div class="max-w-3xl mx-auto px-6">
      <h2 class="text-4xl font-heading font-black text-white mb-6">${getContent('rentalsPage.ctaHeading') || 'Ready to Rent?'}</h2>
      <a href="${getContent('rentalsPage.button1.destination') === '__custom' ? getContent('rentalsPage.button1.destination_url') : `${baseUrl}${getContent('rentalsPage.button1.destination') || 'contact'}`}" class="inline-block bg-white font-heading font-black text-lg px-8 py-4 rounded-full" style="color: var(--color-secondary);">${getContent('rentalsPage.button1.text') || 'Get a Quote'}</a>
    </div>
  </section>` : '';

  return heroHtml + (inventorySection || (infoHtml + rentalContentHtml + ctaHtml));
}