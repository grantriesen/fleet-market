// ============================================
// templates/green-valley-industrial.ts
// Full template module for Green Valley Industrial
//
// Single entry point: renderGreenValleyPage()
// Returns complete HTML from <body> through </body>
// (caller provides <head> shell and closing tags)
// ============================================

import { sharedPreviewScript, pageHero } from './shared';
import { productModalScript, registerProductsScript, rentalBookingSection } from './product-modal';

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
// Called from route.ts for ALL green-valley-industrial pages.
// Returns the full HTML document as a string.
// ============================================

export async function renderGreenValleyPage(
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
  supabase?: any
): Promise<string> {
  // Load site features (add-ons) from DB
  let enabledFeatures: Set<string> = new Set();
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

  const header = gvHeader(getContent, colors, availablePages, siteId, page);
  const footer = gvFooter(getContent, colors, availablePages, siteId);

  let body = '';

  switch (page) {
    case 'home':
    case 'index':
      body = gvHomeSections(getContent, colors, manufacturers, sectionVisibility, siteId, displayProducts, isRealProducts, fmtPrice, enabledFeatures);
      break;
    case 'contact':
      body = gvContactPage(getContent, colors, siteId, sectionVisibility);
      break;
    case 'manufacturers':
      body = gvManufacturersPage(getContent, colors, manufacturers, siteId, sectionVisibility);
      break;
    case 'service':
      body = gvServicePage(getContent, colors, siteId, enabledFeatures.has('service_scheduling'), sectionVisibility);
      break;
    case 'inventory':
      body = await gvInventoryPage(getContent, colors, siteId, supabase, displayProducts, isRealProducts, fmtPrice, sectionVisibility);
      break;
    case 'rentals':
      body = await gvRentalsPage(getContent, colors, siteId, supabase, enabledFeatures.has('rental_scheduling'), sectionVisibility);
      break;
    default:
      body = gvHomeSections(getContent, colors, manufacturers, sectionVisibility, siteId, displayProducts, isRealProducts, fmtPrice, enabledFeatures);
  }

  return gvHtmlShell(colors, fonts, siteName, googleFontsUrl)
    + header
    + body
    + footer
    + productModalScript(siteId, colors.primary)
    + registerProductsScript(displayProducts)
    + sharedPreviewScript(siteId, page)
    + '\n</body>\n</html>';
}


// ============================================
// HTML SHELL (<head> with Tailwind config)
// ============================================

function gvHtmlShell(
  colors: Colors,
  fonts: Fonts,
  siteName: string,
  googleFontsUrl: string
): string {
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
            accent:    { DEFAULT: 'var(--color-accent)',    foreground: '#ffffff' },
            muted:     { DEFAULT: 'hsl(40, 10%, 93%)',     foreground: 'hsl(30, 5%, 45%)' },
            card:      { DEFAULT: '#ffffff',                foreground: 'hsl(20, 5%, 15%)' },
            border:    'hsl(30, 10%, 82%)',
            background:'hsl(40, 20%, 98%)',
            foreground:'hsl(20, 5%, 15%)',
          },
          fontFamily: {
            heading: ['var(--font-heading)', 'sans-serif'],
            body:    ['var(--font-body)', 'sans-serif'],
          },
        },
      },
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
      color: hsl(20, 5%, 15%);
      line-height: 1.7;
      background-color: hsl(40, 20%, 98%);
    }
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-heading);
      font-weight: 700;
      line-height: 1.15;
    }
    img { max-width: 100%; height: auto; }

    /* Industrial design utilities */
    .industrial-card {
      background: #ffffff;
      border: 2px solid hsl(30, 10%, 82%);
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      transition: box-shadow 0.3s ease, border-color 0.3s ease;
    }
    .industrial-card:hover {
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    .cta-button {
      display: inline-block;
      background: var(--color-secondary);
      color: #ffffff;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.875rem 2rem;
      text-decoration: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
      cursor: pointer;
      border: none;
      font-size: 0.9375rem;
    }
    .cta-button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    .section-heading {
      font-size: 1.875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: -0.01em;
      color: hsl(20, 5%, 15%);
    }
    .group-hover-scale {
      transition: transform 0.3s ease;
    }
    .group:hover .group-hover-scale {
      transform: scale(1.05);
    }

    @media (max-width: 768px) {
      .section-heading { font-size: 1.5rem; }
    }
  </style>
</head>
<body>
  `.trim();
}


// ============================================
// HEADER — Dark green sticky nav
// ============================================

function gvHeader(
  getContent: GetContent,
  colors: Colors,
  availablePages: any[],
  siteId: string,
  currentPage: string
): string {
  const businessName = getContent('businessInfo.businessName');
  const logoImage = getContent('businessInfo.logoImage');
  const phone = getContent('businessInfo.phone');

  const navLinks = availablePages.map((p: any) => {
    const isActive = p.slug === currentPage || (p.slug === 'index' && (currentPage === 'home' || currentPage === 'index'));
    return `
      <a href="/api/preview/${siteId}?page=${p.slug}"
        class="hidden md:block text-sm font-semibold uppercase tracking-wide transition-colors ${isActive ? 'text-secondary' : 'text-white/80 hover:text-white'}">
        ${p.name}
      </a>
    `;
  }).join('');

  const mobileLinks = availablePages.map((p: any) => {
    const isActive = p.slug === currentPage || (p.slug === 'index' && (currentPage === 'home' || currentPage === 'index'));
    return `
      <a href="/api/preview/${siteId}?page=${p.slug}"
        class="block py-2 text-sm font-semibold uppercase tracking-wide ${isActive ? 'text-secondary' : 'text-white/80'}">
        ${p.name}
      </a>
    `;
  }).join('');

  return `
  <nav class="bg-primary sticky top-0 z-50 shadow-lg">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">

        <!-- Logo -->
        <a href="/api/preview/${siteId}?page=home" class="flex items-center gap-3 flex-shrink-0">
          ${logoImage
            ? `<img src="${logoImage}" alt="${businessName}" class="h-10 w-auto object-contain">`
            : `<div class="w-10 h-10 bg-secondary rounded flex items-center justify-center">
                <span class="text-white font-bold text-lg">${businessName.charAt(0)}</span>
              </div>
              <span class="text-white font-bold text-lg hidden sm:block">${businessName}</span>`
          }
        </a>

        <!-- Desktop Nav -->
        <div class="hidden md:flex items-center gap-6">
          ${navLinks}
        </div>

        <!-- Phone CTA (desktop) -->
        ${phone ? `
          <a href="tel:${phone.replace(/[^0-9]/g, '')}"
            class="hidden lg:inline-flex items-center gap-2 bg-secondary text-white font-bold text-sm px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            ${phone}
          </a>
        ` : ''}

        <!-- Mobile hamburger -->
        <button onclick="document.getElementById('gvMobileMenu').classList.toggle('hidden')"
          class="md:hidden text-white p-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div id="gvMobileMenu" class="hidden md:hidden pb-4 border-t border-white/20 mt-2 pt-3">
        ${mobileLinks}
        ${phone ? `
          <a href="tel:${phone.replace(/[^0-9]/g, '')}"
            class="block mt-3 text-center bg-secondary text-white font-bold text-sm px-4 py-2 rounded-md">
            Call: ${phone}
          </a>
        ` : ''}
      </div>
    </div>
  </nav>
  `;
}


// ============================================
// FOOTER — 4-column with social icons
// ============================================

function gvFooter(
  getContent: GetContent,
  colors: Colors,
  availablePages: any[],
  siteId: string
): string {
  const businessName = getContent('businessInfo.businessName');
  const tagline = getContent('footer.tagline') || getContent('businessInfo.tagline');
  const phone = getContent('businessInfo.phone');
  const email = getContent('businessInfo.email');
  const address = getContent('businessInfo.address');
  const city = getContent('businessInfo.city');
  const state = getContent('businessInfo.state');
  const zip = getContent('businessInfo.zip');
  const facebook = getContent('social.facebook');
  const instagram = getContent('social.instagram');
  const youtube = getContent('social.youtube');

  return `
  <footer class="bg-primary text-white">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        <!-- Brand -->
        <div>
          <h3 class="text-xl font-bold mb-3">${businessName}</h3>
          ${tagline ? `<p class="text-white/60 text-sm leading-relaxed mb-4">${tagline}</p>` : ''}
          <div class="flex gap-3">
            ${facebook ? `
              <a href="${facebook}" target="_blank" rel="noopener noreferrer" class="w-9 h-9 bg-white/10 rounded flex items-center justify-center hover:bg-secondary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            ` : ''}
            ${instagram ? `
              <a href="${instagram}" target="_blank" rel="noopener noreferrer" class="w-9 h-9 bg-white/10 rounded flex items-center justify-center hover:bg-secondary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            ` : ''}
            ${youtube ? `
              <a href="${youtube}" target="_blank" rel="noopener noreferrer" class="w-9 h-9 bg-white/10 rounded flex items-center justify-center hover:bg-secondary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            ` : ''}
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-sm font-bold uppercase tracking-wide mb-3 text-white/90">Quick Links</h4>
          <div class="space-y-2">
            ${availablePages.map((p: any) => `
              <a href="/api/preview/${siteId}?page=${p.slug}" class="block text-sm text-white/60 hover:text-secondary transition-colors">${p.name}</a>
            `).join('')}
          </div>
        </div>

        <!-- Contact -->
        <div>
          <h4 class="text-sm font-bold uppercase tracking-wide mb-3 text-white/90">Contact</h4>
          <div class="space-y-2 text-sm text-white/60">
            ${phone ? `<p><a href="tel:${phone.replace(/[^0-9]/g, '')}" class="hover:text-secondary transition-colors">${phone}</a></p>` : ''}
            ${email ? `<p><a href="mailto:${email}" class="hover:text-secondary transition-colors">${email}</a></p>` : ''}
            ${address ? `<p>${address}<br>${city}, ${state} ${zip}</p>` : ''}
          </div>
        </div>

        <!-- Hours -->
        <div>
          <h4 class="text-sm font-bold uppercase tracking-wide mb-3 text-white/90">Hours</h4>
          <div class="space-y-1 text-sm text-white/60">
            <p>Mon-Fri: ${getContent('hours.monday') || '8am - 5pm'}</p>
            <p>Saturday: ${getContent('hours.saturday') || '9am - 1pm'}</p>
            <p>Sunday: ${getContent('hours.sunday') || 'Closed'}</p>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-10 pt-6 border-t border-white/15 text-center text-white/40 text-xs">
        <p>&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
      </div>
    </div>
  </footer>
  `;
}


// ============================================
// HOME PAGE SECTIONS
// ============================================

function gvHomeSections(
  getContent: GetContent,
  colors: Colors,
  manufacturers: any[],
  sectionVisibility: Record<string, boolean>,
  siteId: string,
  displayProducts: any[],
  isRealProducts: boolean,
  fmtPrice: FmtPrice,
  enabledFeatures: Set<string> = new Set()
): string {
  let html = '';

  // ── Hero ──
  if (sectionVisibility.hero !== false) {
    const bgImage = getContent('hero.backgroundImage') || getContent('hero.image');
    html += `
    <section data-section="hero" class="relative overflow-hidden">
      ${bgImage ? `
        <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('${bgImage}');"></div>
        <div class="absolute inset-0 bg-primary" style="opacity: 0.78;"></div>
      ` : `
        <div class="absolute inset-0 bg-primary"></div>
      `}
      <div class="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-40">
        <div class="max-w-3xl">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white uppercase tracking-tight mb-6">
            ${getContent('hero.heading')}
          </h1>
          <p class="text-lg md:text-xl text-white/80 mb-8 max-w-2xl">
            ${getContent('hero.subheading')}
          </p>
          <div class="flex flex-wrap gap-4">
            <a href="${getContent('hero.ctaLink') || `/api/preview/${siteId}?page=inventory`}"
              class="cta-button rounded-md">
              ${getContent('hero.ctaButton') || 'View Inventory'}
            </a>
            <a href="/api/preview/${siteId}?page=contact"
              class="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-bold uppercase tracking-wider px-8 py-3 rounded-md transition-colors text-sm">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Badges Bar -->
    ${(() => {
      const badges: { icon: string; label: string }[] = [
        {
          icon: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
          label: 'Quality Equipment'
        },
      ];

      if (enabledFeatures.has('rental_scheduling')) {
        badges.push({
          icon: '<rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5a2 2 0 0 1-2 2h-1"/><path d="M6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M18 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/><path d="M1 16h6m8 0h8"/>',
          label: 'Equipment Rentals'
        });
      }

      badges.push({
        icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
        label: 'Expert Support'
      });
      
      return `
    <div class="bg-secondary py-4">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap justify-center md:justify-between gap-6 text-white font-bold text-sm uppercase tracking-wide">
          ${badges.map(b => `
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${b.icon}</svg>
            ${b.label}
          </div>
          `).join('')}
        </div>
      </div>
    </div>`;
    })()}
    `;
  }

  // ── Featured Products ──
  if (sectionVisibility.featured !== false) {
    html += `
    <section data-section="featured" class="py-12 md:py-16 bg-background">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="section-heading text-center mb-2">${getContent('featured.heading') || 'Featured Equipment'}</h2>
        ${getContent('featured.subheading') ? `<p class="text-center text-muted-foreground text-lg mb-8">${getContent('featured.subheading')}</p>` : '<div class="mb-8"></div>'}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${displayProducts.map((item: any) => `
            <div class="industrial-card group overflow-hidden rounded-lg cursor-pointer" onclick="openFmModal('${item.id || item.slug || ''}')">
              <div class="aspect-[4/3] bg-muted overflow-hidden relative">
                ${item.primary_image
                  ? `<img src="${item.primary_image}" alt="${item.title}" loading="lazy" class="w-full h-full object-cover group-hover-scale">`
                  : `<div class="w-full h-full" style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); opacity: 0.7;"></div>`
                }
                ${item.featured ? `<span class="absolute top-3 left-3 bg-secondary text-white text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-sm">Featured</span>` : ''}
              </div>
              <div class="p-4">
                <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  ${[item.category, item.model].filter(Boolean).join(' · ')}
                </p>
                <h3 class="font-bold text-lg text-foreground mb-2">${item.title}</h3>
                <div class="flex items-center justify-between pt-3 border-t border-border">
                  <span class="text-xl font-bold text-primary">${fmtPrice(item.price)}</span>
                  <span class="text-secondary font-semibold text-sm uppercase tracking-wide group-hover:underline">Details →</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    `;
  }

  // ── Manufacturers ──
  if (sectionVisibility.manufacturers !== false && manufacturers.length > 0) {
    html += `
    <section data-section="manufacturers" class="py-12 md:py-16 bg-muted">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="section-heading text-center mb-8">${getContent('manufacturers.heading') || 'Our Brands'}</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          ${manufacturers.slice(0, 6).map(m => `
            <a href="/api/preview/${siteId}?page=manufacturers"
              class="bg-card p-6 border-2 border-border hover:border-secondary transition-colors rounded-lg flex flex-col items-center justify-center text-center group">
              ${m.logo_url
                ? `<img src="${m.logo_url}" alt="${m.name}" class="max-h-12 w-auto opacity-70 group-hover:opacity-100 transition-opacity mb-2">`
                : `<div class="w-12 h-12 bg-muted rounded mb-2"></div>`
              }
              <span class="text-sm font-semibold uppercase tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">${m.name}</span>
            </a>
          `).join('')}
        </div>
      </div>
    </section>
    `;
  }

  // ── Testimonial ──
  if (sectionVisibility.testimonials !== false) {
    let testimonials: any[] = [];
    try { testimonials = JSON.parse(getContent('testimonials.items') || '[]'); } catch {}
    if (!testimonials.length) testimonials = [
      { quote: 'Valley Power has been our go-to equipment dealer for 8 years. Their Bobcat and Toro expertise is unmatched.', name: 'Mark Henderson', title: 'Fleet Manager', company: 'Henderson Landscaping' },
      { quote: 'When our Ventrac went down mid-season, they had us back up the same day. Priceless.', name: 'Lisa Ramirez', title: 'Owner', company: 'Rocky Mountain Turf Care' },
      { quote: 'The rental program helped us test equipment before committing to a purchase. Smart way to do business.', name: 'Tom Bradley', title: 'Operations Director', company: 'Front Range Property Services' },
    ];
    html += `
    <section data-section="testimonials" class="py-12 md:py-16 bg-background">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        ${getContent('testimonials.heading') ? `<h2 class="section-heading text-center mb-8">${getContent('testimonials.heading')}</h2>` : ''}
        <div class="grid md:grid-cols-3 gap-6">
          ${testimonials.map(t => `
          <div class="bg-primary text-white rounded-lg p-6 md:p-8">
            <div class="flex mb-3"><span class="text-secondary text-xl">★★★★★</span></div>
            <blockquote class="text-base italic mb-4 leading-relaxed">"${t.quote}"</blockquote>
            <div>
              <p class="font-bold">${t.name}</p>
              <p class="text-white/60 text-sm">${t.title || ''}${t.company ? `, ${t.company}` : ''}</p>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </section>
    `;
  }

  // ── CTA ──
  if (sectionVisibility.cta !== false) {
    html += `
    <section data-section="cta" class="py-16 md:py-24 bg-secondary">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mb-4">
          ${getContent('cta.heading')}
        </h2>
        <p class="text-lg text-white/80 max-w-2xl mx-auto mb-8">
          ${getContent('cta.subheading')}
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <a href="${getContent('cta.primaryLink') || `/api/preview/${siteId}?page=inventory`}"
            class="bg-primary text-white font-bold uppercase tracking-wider px-8 py-4 rounded-md hover:opacity-90 transition-opacity">
            ${getContent('cta.primaryButton') || 'Browse Inventory'}
          </a>
          <a href="${getContent('cta.secondaryLink') || `/api/preview/${siteId}?page=contact`}"
            class="bg-transparent border-2 border-white text-white hover:bg-white hover:text-secondary font-bold uppercase tracking-wider px-8 py-4 rounded-md transition-colors">
            ${getContent('cta.secondaryButton') || 'Contact Us'}
          </a>
        </div>
      </div>
    </section>
    `;
  }

  return html;
}


// ============================================
// CONTACT PAGE
// ============================================

function gvContactPage(
  getContent: GetContent,
  colors: Colors,
  siteId: string,
  vis: Record<string, boolean> = {}
): string {
  const heading = getContent('contactPage.heading') || 'Get In Touch';
  const subheading = getContent('contactPage.subheading') || 'Have questions? We are here to help.';
  const heroImage = getContent('contactPage.heroImage');
  const formHeading = getContent('contactPage.formHeading') || 'Send Us a Message';
  const locationHeading = getContent('contactPage.locationHeading') || 'Visit Our Showroom';
  const mapEmbed = getContent('contactPage.mapEmbed');
  const phone = getContent('businessInfo.phone');
  const email = getContent('businessInfo.email');
  const address = getContent('businessInfo.address');
  const city = getContent('businessInfo.city');
  const state = getContent('businessInfo.state');
  const zip = getContent('businessInfo.zip');
  const fullAddress = `${address}, ${city}, ${state} ${zip}`;

  return `
  ${vis['contactPage._heroHeading'] !== false ? pageHero(heading, subheading, heroImage, 'contactPage') : ''}

  ${vis['contactPage._formHeading'] !== false ? `
  <section data-section="contactForm" class="py-12 bg-background">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Contact Form -->
        <div>
          <h2 class="section-heading mb-6">${formHeading}</h2>
          <div class="industrial-card rounded-lg">
            <div class="p-6">
              <form class="space-y-4" method="POST" action="/api/contact/${siteId}" id="contactForm">
                <input type="hidden" name="siteId" value="${siteId}">
                <div>
                  <label class="block text-sm font-semibold text-foreground mb-1">Name *</label>
                  <input type="text" name="name" required placeholder="Your name"
                    class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-foreground mb-1">Email *</label>
                  <input type="email" name="email" required placeholder="your@email.com"
                    class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-foreground mb-1">Phone</label>
                  <input type="tel" name="phone" placeholder="(555) 123-4567"
                    class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-foreground mb-1">Message *</label>
                  <textarea name="message" required rows="5" placeholder="How can we help you?"
                    class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none resize-y"></textarea>
                </div>
                <button type="submit" class="w-full cta-button rounded-md text-center">Send Message</button>
              </form>
            </div>
          </div>
        </div>

        <!-- Business Info Sidebar -->
        <div class="space-y-4">
          <!-- Phone -->
          <div class="industrial-card rounded-lg">
            <div class="p-4 flex items-center gap-4">
              <div class="w-12 h-12 bg-secondary rounded flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </div>
              <div>
                <h3 class="font-bold text-sm uppercase tracking-wide text-muted-foreground">Phone</h3>
                <a href="tel:${phone.replace(/[^0-9]/g, '')}" class="text-lg font-bold text-primary hover:text-secondary transition-colors">${phone}</a>
              </div>
            </div>
          </div>
          <!-- Email -->
          <div class="industrial-card rounded-lg">
            <div class="p-4 flex items-center gap-4">
              <div class="w-12 h-12 bg-secondary rounded flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <div>
                <h3 class="font-bold text-sm uppercase tracking-wide text-muted-foreground">Email</h3>
                <a href="mailto:${email}" class="text-lg font-bold text-primary hover:text-secondary transition-colors">${email}</a>
              </div>
            </div>
          </div>
          <!-- Address -->
          <div class="industrial-card rounded-lg">
            <div class="p-4 flex items-center gap-4">
              <div class="w-12 h-12 bg-secondary rounded flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div>
                <h3 class="font-bold text-sm uppercase tracking-wide text-muted-foreground">Address</h3>
                <p class="text-lg font-bold text-primary">${fullAddress}</p>
              </div>
            </div>
          </div>
          <!-- Hours -->
          <div class="industrial-card rounded-lg">
            <div class="p-6">
              <div class="flex items-center gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <h3 class="font-bold text-xl uppercase tracking-wide">Business Hours</h3>
              </div>
              <dl class="space-y-2">
                <div class="flex justify-between"><dt class="font-semibold">Monday</dt><dd class="text-muted-foreground">${getContent('hours.monday')}</dd></div>
                <div class="flex justify-between"><dt class="font-semibold">Tuesday</dt><dd class="text-muted-foreground">${getContent('hours.tuesday')}</dd></div>
                <div class="flex justify-between"><dt class="font-semibold">Wednesday</dt><dd class="text-muted-foreground">${getContent('hours.wednesday')}</dd></div>
                <div class="flex justify-between"><dt class="font-semibold">Thursday</dt><dd class="text-muted-foreground">${getContent('hours.thursday')}</dd></div>
                <div class="flex justify-between"><dt class="font-semibold">Friday</dt><dd class="text-muted-foreground">${getContent('hours.friday')}</dd></div>
                <div class="flex justify-between"><dt class="font-semibold">Saturday</dt><dd class="text-muted-foreground">${getContent('hours.saturday')}</dd></div>
                <div class="flex justify-between"><dt class="font-semibold">Sunday</dt><dd class="text-muted-foreground">${getContent('hours.sunday')}</dd></div>
              </dl>
            </div>
          </div>
          <!-- Map -->
          <div class="industrial-card rounded-lg overflow-hidden">
            ${mapEmbed
              ? `<div class="aspect-video">${mapEmbed}</div>`
              : `<div class="aspect-video bg-muted flex items-center justify-center">
                  <div class="text-center text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <p>Map will display here</p>
                    <p class="text-sm">${fullAddress}</p>
                  </div>
                </div>`
            }
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Visit CTA -->
  <section class="py-12 bg-primary">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-4">${locationHeading}</h2>
      <p class="text-lg text-white/80 max-w-2xl mx-auto mb-6">Come see our full inventory in person. Our knowledgeable staff is ready to help you find the right equipment.</p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}" target="_blank" rel="noopener noreferrer" class="cta-button rounded-md inline-flex items-center gap-2">Get Directions</a>
        <a href="tel:${phone.replace(/[^0-9]/g, '')}" class="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary font-bold uppercase tracking-wider px-8 py-4 rounded-md transition-colors inline-flex items-center gap-2">${phone}</a>
      </div>
    </div>
  </section>

  <script>
    var cform = document.getElementById('contactForm');
    if (cform) {
      cform.addEventListener('submit', function(e) {
        e.preventDefault();
        var fd = new FormData(cform);
        var data = {};
        fd.forEach(function(v, k) { data[k] = v; });
        var btn = cform.querySelector('button[type=submit]');
        btn.textContent = 'Sending...'; btn.disabled = true;
        fetch(cform.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function(r) { return r.json(); })
        .then(function(res) {
          if (res.error) { alert('Error: ' + res.error); btn.textContent = 'Send Message'; btn.disabled = false; }
          else { cform.innerHTML = '<div class="text-center py-8"><div class="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg></div><h3 class="text-2xl font-bold mb-2">Message Sent!</h3><p class="text-muted-foreground">We will get back to you within 1 business day.</p></div>'; }
        })
        .catch(function() { alert('Something went wrong.'); btn.textContent = 'Send Message'; btn.disabled = false; });
      });
    }
  </script>
  ` : ''}
  `;
}


// ============================================
// MANUFACTURERS PAGE
// ============================================

function gvManufacturersPage(
  getContent: GetContent,
  colors: Colors,
  manufacturers: any[],
  siteId: string,
  vis: Record<string, boolean> = {}
): string {
  const heading = getContent('manufacturersPage.heading') || 'Our Partner Manufacturers';
  const subheading = getContent('manufacturersPage.subheading') || 'We partner with industry-leading manufacturers.';
  const heroImage = getContent('manufacturersPage.heroImage');
  const introText = getContent('manufacturersPage.introText');

  return `
  ${vis['manufacturersPage._heroHeading'] !== false ? pageHero(heading, subheading, heroImage, 'manufacturersPage') : ''}

  ${vis['manufacturersPage._contentHeading'] !== false ? `
  <section data-section="manufacturersList" class="py-12 bg-background">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      ${introText ? `<div class="text-center mb-12 max-w-3xl mx-auto"><p class="text-lg text-muted-foreground">${introText}</p></div>` : ''}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${manufacturers.length > 0 ? manufacturers.map(m => `
          <div class="industrial-card group overflow-hidden rounded-lg h-full">
            <div class="aspect-video bg-muted flex items-center justify-center p-8">
              ${m.logo_url
                ? `<img src="${m.logo_url}" alt="${m.name}" class="max-h-20 w-auto opacity-70 group-hover:opacity-100 transition-opacity">`
                : `<span class="text-2xl font-bold text-muted-foreground">${m.name}</span>`
              }
            </div>
            <div class="p-5">
              <h3 class="font-bold text-xl text-foreground mb-2">${m.name}</h3>
              ${m.description ? `<p class="text-sm text-muted-foreground mb-4 leading-relaxed">${m.description}</p>` : ''}
              <div class="flex items-center gap-3 pt-3 border-t border-border">
                ${m.website_url ? `<a href="${m.website_url}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-secondary font-semibold text-sm hover:underline">Visit Website <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg></a>` : ''}
                <a href="/api/preview/${siteId}?page=inventory" class="inline-flex items-center gap-1 text-primary font-semibold text-sm hover:underline ml-auto">Learn More →</a>
              </div>
            </div>
          </div>
        `).join('') : `
          <div class="col-span-full text-center py-16">
            <div class="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center"><span class="text-3xl">🏭</span></div>
            <h2 class="text-2xl font-bold text-foreground mb-2">No Manufacturers Added Yet</h2>
            <p class="text-muted-foreground">Add manufacturers in the customizer to display them here.</p>
          </div>
        `}
      </div>
    </div>
  </section>
  ` : ''}

  `;
}


// ============================================
// SERVICE PAGE
// ============================================

function gvServicePage(
  getContent: GetContent,
  colors: Colors,
  siteId: string,
  hasServiceFeature: boolean = false,
  vis: Record<string, boolean> = {}
): string {
  const heading = getContent('servicePage.heading') || 'Expert Service & Repair';
  const subheading = getContent('servicePage.subheading') || 'Keep your equipment running at peak performance.';
  const heroImage = getContent('servicePage.heroImage');
  const phone = getContent('businessInfo.phone');
  const email = getContent('businessInfo.email');

  const services = [1, 2, 3].map(i => ({
    title: getContent(`servicePage.service${i}Title`),
    description: getContent(`servicePage.service${i}Description`),
    image: getContent(`servicePage.service${i}Image`),
  })).filter(s => s.title);

  const icons = [
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    '<circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2m8.66-15.66l-1.42 1.42M4.76 19.24l-1.42 1.42M23 12h-2M3 12H1m18.66 7.66l-1.42-1.42M4.76 4.76L3.34 3.34"/>',
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/>',
  ];

  // Why Choose Us — 3 editable cards
  const whyChooseHeading = getContent('servicePage.whyChooseHeading') || 'Why Choose Our Service?';
  const whyCards = [
    {
      title: getContent('servicePage.why1Title') || 'Factory-Trained Techs',
      desc: getContent('servicePage.why1Description') || 'Our technicians are certified and trained by the manufacturers we represent.',
      icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>',
    },
    {
      title: getContent('servicePage.why2Title') || 'Quick Turnaround',
      desc: getContent('servicePage.why2Description') || 'We understand downtime costs money. We work to get your equipment back fast.',
      icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    },
    {
      title: getContent('servicePage.why3Title') || 'OEM Parts',
      desc: getContent('servicePage.why3Description') || 'We use genuine OEM parts to keep your warranty intact and equipment reliable.',
      icon: '<path d="m9 12 2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>',
    },
  ];

  return `
  ${vis['servicePage._heroHeading'] !== false ? pageHero(heading, subheading, heroImage, 'servicePage') : ''}

  ${vis['servicePage._servicesHeading'] !== false && services.length > 0 ? `
  <section data-section="serviceTypes" class="py-12 bg-muted">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="section-heading text-center mb-8">Our Services</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${services.length} gap-6">
        ${services.map((s, idx) => `
          <div class="industrial-card rounded-lg overflow-hidden h-full">
            ${s.image ? `<div class="aspect-video bg-muted overflow-hidden"><img src="${s.image}" alt="${s.title}" class="w-full h-full object-cover"></div>` : ''}
            <div class="p-6">
              <div class="w-12 h-12 bg-secondary rounded flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[idx % icons.length]}</svg>
              </div>
              <h3 class="font-bold text-lg mb-2">${s.title}</h3>
              <p class="text-sm text-muted-foreground leading-relaxed">${s.description}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  ${vis['servicePage._whyChooseHeading'] !== false ? `
  <!-- Why Choose Us (editable) -->
  <section data-section="whyChoose" class="py-12 bg-background">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 class="section-heading text-center mb-8">${whyChooseHeading}</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${whyCards.map(card => `
        <div class="text-center p-6">
          <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">${card.icon}</svg>
          </div>
          <h3 class="font-bold text-lg mb-2 uppercase tracking-wide">${card.title}</h3>
          <p class="text-sm text-muted-foreground">${card.desc}</p>
        </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  ${vis['servicePage._ctaHeading'] !== false ? `
  ${hasServiceFeature ? `
  <!-- Service Scheduler (Premium) -->
  <section data-section="serviceCta" class="py-12 bg-muted">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
      <h2 class="section-heading text-center mb-2">Schedule Service Online</h2>
      <p class="text-center text-muted-foreground mb-8">Pick a service, choose your time, and we'll take care of the rest.</p>

      <div id="sf-booking-form" class="industrial-card rounded-lg p-6 md:p-8">
        <!-- Step 1: Choose Service -->
        <div id="sf-step-1">
          <h3 class="text-sm font-bold text-primary uppercase tracking-wider mb-4">1. Select a Service</h3>
          <div id="sf-service-list" class="flex flex-col gap-2">
            <div class="text-center py-6 text-muted-foreground">Loading services...</div>
          </div>
        </div>

        <!-- Step 2: Date & Time (hidden until service selected) -->
        <div id="sf-step-2" style="display:none" class="mt-6 pt-6 border-t border-border">
          <h3 class="text-sm font-bold text-primary uppercase tracking-wider mb-4">2. Choose Date & Time</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-foreground mb-1">Preferred Date *</label>
              <input type="date" id="sf-date" required class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none">
            </div>
            <div>
              <label class="block text-sm font-semibold text-foreground mb-1">Preferred Time *</label>
              <select id="sf-time" required class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none">
                <option value="">Select time</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Step 3: Your Info (hidden until date selected) -->
        <div id="sf-step-3" style="display:none" class="mt-6 pt-6 border-t border-border">
          <h3 class="text-sm font-bold text-primary uppercase tracking-wider mb-4">3. Your Information</h3>
          <div class="space-y-3">
            <div class="grid md:grid-cols-2 gap-3">
              <div><label class="block text-sm font-semibold text-foreground mb-1">Name *</label><input type="text" id="sf-name" required class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none"></div>
              <div><label class="block text-sm font-semibold text-foreground mb-1">Phone *</label><input type="tel" id="sf-phone" required placeholder="(555) 123-4567" class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none"></div>
            </div>
            <div><label class="block text-sm font-semibold text-foreground mb-1">Email *</label><input type="email" id="sf-email" required class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none"></div>
            <div><label class="block text-sm font-semibold text-foreground mb-1">Equipment Details</label><input type="text" id="sf-equipment" placeholder="e.g., Toro Grandstand 52&quot;" class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none"></div>
            <div><label class="block text-sm font-semibold text-foreground mb-1">Notes</label><textarea id="sf-notes" rows="3" placeholder="Describe the issue..." class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none resize-y"></textarea></div>
            <button id="sf-submit" class="w-full cta-button rounded-md text-center">${getContent('servicePage.ctaButton') || 'Schedule Service'}</button>
          </div>
        </div>
      </div>

      <!-- Urgent Service & Contact -->
      <div class="grid md:grid-cols-2 gap-4 mt-6">
        <div class="bg-primary text-white rounded-lg p-5">
          <h3 class="font-bold text-lg mb-1 uppercase tracking-wide">Need Urgent Service?</h3>
          <p class="text-white/80 text-sm mb-3">For emergency repairs, give us a call.</p>
          <a href="tel:${phone.replace(/[^0-9]/g, '')}" class="block w-full cta-button rounded-md text-center text-sm">Call: ${phone}</a>
        </div>
        <div class="industrial-card rounded-lg p-5 flex items-center gap-4">
          <div class="w-12 h-12 bg-secondary rounded flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <div>
            <h3 class="font-bold text-sm uppercase tracking-wide text-muted-foreground">Email Us</h3>
            <a href="mailto:${email}" class="text-lg font-bold text-primary hover:text-secondary transition-colors">${email}</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <script>
    (function() {
      var siteId = '${siteId}';
      var ctaLabel = '${(getContent('servicePage.ctaButton') || 'Schedule Service').replace(/'/g, "\\'")}';
      var appUrl = '';
      var selectedService = null;

      // Load service types from API
      fetch('/api/service/types/' + siteId)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var list = document.getElementById('sf-service-list');
          if (!list) return;
          var types = data.types || data.serviceTypes || data || [];
          if (!types.length) {
            list.innerHTML = '<div class="text-center py-4 text-muted-foreground">No services configured yet. Please contact us directly.</div>';
            return;
          }
          list.innerHTML = '';
          types.forEach(function(st) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'sf-svc-btn text-left p-4 border-2 border-border rounded-lg hover:border-primary transition-colors bg-background';
            btn.setAttribute('data-id', st.id);
            var dur = st.duration_minutes ? ' · ' + st.duration_minutes + ' min' : '';
            var price = (st.price_estimate || st.price) ? ' · ' + (st.price_estimate || st.price) : '';
            btn.innerHTML = '<div class="font-bold text-foreground">' + st.name + '</div>' +
              (st.description ? '<div class="text-xs text-muted-foreground mt-1">' + st.description + dur + price + '</div>' : '');
            btn.addEventListener('click', function() {
              document.querySelectorAll('.sf-svc-btn').forEach(function(b) { b.classList.remove('border-primary','bg-primary/5'); b.classList.add('border-border'); });
              this.classList.remove('border-border'); this.classList.add('border-primary','bg-primary/5');
              selectedService = st;
              document.getElementById('sf-step-2').style.display = '';
              loadTimeSlots(st);
            });
            list.appendChild(btn);
          });
        })
        .catch(function() {
          var list = document.getElementById('sf-service-list');
          if (list) list.innerHTML = '<div class="text-center py-4 text-muted-foreground">Unable to load services. Please call us directly.</div>';
        });

      // Load available time slots
      function loadTimeSlots(serviceType) {
        var sel = document.getElementById('sf-time');
        sel.innerHTML = '<option value="">Select time</option>';
        // Generate standard business hour slots
        var times = ['8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
                     '12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM'];
        times.forEach(function(t) { var o = document.createElement('option'); o.value = t; o.textContent = t; sel.appendChild(o); });
      }

      // Show step 3 when date & time selected
      var dateInput = document.getElementById('sf-date');
      var timeInput = document.getElementById('sf-time');
      if (dateInput) dateInput.addEventListener('change', checkStep3);
      if (timeInput) timeInput.addEventListener('change', checkStep3);
      function checkStep3() {
        if (dateInput.value && timeInput.value) {
          document.getElementById('sf-step-3').style.display = '';
        }
      }

      // Set min date to today
      if (dateInput) {
        var today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
      }

      // Submit booking
      var submitBtn = document.getElementById('sf-submit');
      if (submitBtn) {
        submitBtn.addEventListener('click', function() {
          var name = document.getElementById('sf-name').value;
          var phone = document.getElementById('sf-phone').value;
          var email = document.getElementById('sf-email').value;
          if (!name || !phone || !email || !selectedService) { alert('Please fill in all required fields.'); return; }
          submitBtn.textContent = 'Scheduling...'; submitBtn.disabled = true;
          fetch('/api/service/book/' + siteId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              siteId: siteId,
              serviceTypeId: selectedService.id,
              serviceTypeName: selectedService.name,
              date: dateInput.value,
              time: timeInput.value,
              customerName: name,
              customerPhone: phone,
              customerEmail: email,
              equipmentDetails: document.getElementById('sf-equipment').value,
              customerNotes: document.getElementById('sf-notes').value
            })
          })
          .then(function(r) { return r.json(); })
          .then(function(res) {
            if (res.error) { alert('Error: ' + res.error); submitBtn.textContent = ctaLabel; submitBtn.disabled = false; }
            else {
              document.getElementById('sf-booking-form').innerHTML = '<div class="text-center py-12"><div class="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg></div><h3 class="text-2xl font-bold mb-2">Service Scheduled!</h3><p class="text-muted-foreground">We will confirm your appointment within 1 business day.</p></div>';
            }
          })
          .catch(function() { alert('Something went wrong.'); submitBtn.textContent = ctaLabel; submitBtn.disabled = false; });
        });
      }
    })();
  </script>
  ` : `
  <!-- Basic Service Request Form -->
  <section data-section="serviceCta" class="py-12 bg-muted">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
      <h2 class="section-heading text-center mb-2">Request Service</h2>
      <p class="text-center text-muted-foreground mb-8">Fill out the form below and we'll get back to you within 1 business day.</p>
      <div class="industrial-card rounded-lg">
        <div class="p-6">
          <form class="space-y-4" method="POST" action="/api/service/book/${siteId}" id="serviceBasicForm">
            <input type="hidden" name="siteId" value="${siteId}">
            <div class="grid md:grid-cols-2 gap-4">
              <div><label class="block text-sm font-semibold text-foreground mb-1">Name *</label><input type="text" name="customerName" required class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none"></div>
              <div><label class="block text-sm font-semibold text-foreground mb-1">Phone *</label><input type="tel" name="customerPhone" required placeholder="(555) 123-4567" class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none"></div>
            </div>
            <div><label class="block text-sm font-semibold text-foreground mb-1">Email *</label><input type="email" name="customerEmail" required class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none"></div>
            <div><label class="block text-sm font-semibold text-foreground mb-1">Describe the Issue *</label><textarea name="customerNotes" required rows="4" placeholder="Please describe the problem..." class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none resize-y"></textarea></div>
            <button type="submit" class="w-full cta-button rounded-md text-center">${getContent('servicePage.ctaButton') || 'Submit Service Request'}</button>
          </form>
        </div>
      </div>

      <!-- Urgent + Email -->
      <div class="grid md:grid-cols-2 gap-4 mt-6">
        <div class="bg-primary text-white rounded-lg p-5">
          <h3 class="font-bold text-lg mb-1 uppercase tracking-wide">Need Urgent Service?</h3>
          <p class="text-white/80 text-sm mb-3">For emergency repairs, give us a call.</p>
          <a href="tel:${phone.replace(/[^0-9]/g, '')}" class="block w-full cta-button rounded-md text-center text-sm">Call: ${phone}</a>
        </div>
        <div class="industrial-card rounded-lg p-5 flex items-center gap-4">
          <div class="w-12 h-12 bg-secondary rounded flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </div>
          <div>
            <h3 class="font-bold text-sm uppercase tracking-wide text-muted-foreground">Email Us</h3>
            <a href="mailto:${email}" class="text-lg font-bold text-primary hover:text-secondary transition-colors">${email}</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <script>
    var sbform = document.getElementById('serviceBasicForm');
    if (sbform) {
      sbform.addEventListener('submit', function(e) {
        e.preventDefault();
        var fd = new FormData(sbform); var data = {};
        fd.forEach(function(v, k) { data[k] = v; });
        var btn = sbform.querySelector('button[type=submit]');
        btn.textContent = 'Submitting...'; btn.disabled = true;
        fetch(sbform.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function(r) { return r.json(); })
        .then(function(res) {
          if (res.error) { alert('Error: ' + res.error); btn.textContent = 'Submit Service Request'; btn.disabled = false; }
          else { sbform.innerHTML = '<div class="text-center py-8"><div class="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg></div><h3 class="text-2xl font-bold mb-2">Service Request Submitted!</h3><p class="text-muted-foreground">We will contact you within 1 business day.</p></div>'; }
        })
        .catch(function() { alert('Something went wrong.'); btn.textContent = 'Submit Service Request'; btn.disabled = false; });
      });
    }
  </script>
  `}
  ` : ''}
  `;
}


// ============================================

function gvInventoryPageStatic(
  getContent: GetContent,
  colors: Colors,
  siteId: string,
  displayProducts: any[],
  isRealProducts: boolean,
  fmtPrice: FmtPrice,
  vis: Record<string, boolean> = {}
): string {
  const heading = getContent('inventoryPage.heading') || 'Equipment Inventory';
  const subheading = getContent('inventoryPage.subheading') || 'Browse our complete selection of equipment.';
  const heroImage = getContent('inventoryPage.heroImage');

  const categories = [...new Set(displayProducts.map((p: any) => p.category).filter(Boolean))];

  const conditions = [...new Set(displayProducts.map((p: any) => p.condition).filter(Boolean))];

  const showFilters = vis['inventoryPage._filtersHeading'] !== false;

  return `
  ${vis['inventoryPage._heroHeading'] !== false ? pageHero(heading, subheading, heroImage, 'inventoryPage') : ''}

  ${showFilters && (categories.length > 1 || conditions.length > 1) ? `
  <section class="bg-muted py-4 border-b-2 border-border sticky top-16 z-30">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-wrap gap-4 items-center">
        ${categories.length > 1 ? `
        <div class="flex items-center gap-2">
          <label class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Category</label>
          <div class="relative">
            <select id="catFilter" class="appearance-none pl-4 pr-9 py-2.5 font-semibold text-sm bg-card text-foreground border-2 border-border rounded-lg shadow-sm hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer transition-all">
              <option value="all">All Equipment</option>
              ${categories.map((cat: string) => `<option value="${cat}">${cat}</option>`).join('')}
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
        ` : ''}
        ${conditions.length > 1 ? `
        <div class="flex items-center gap-2">
          <label class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Condition</label>
          <div class="relative">
            <select id="condFilter" class="appearance-none pl-4 pr-9 py-2.5 font-semibold text-sm bg-card text-foreground border-2 border-border rounded-lg shadow-sm hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer transition-all">
              <option value="all">All Conditions</option>
              ${conditions.map((c: string) => `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</option>`).join('')}
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    </div>
  </section>
  ` : ''}

  ${showFilters ? `
  <section data-section="inventoryGrid" class="py-8 bg-background">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      ${displayProducts.length === 0 ? `
        <div class="text-center py-16">
          <div class="w-20 h-20 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center"><span class="text-3xl">📦</span></div>
          <h2 class="text-2xl font-bold text-foreground mb-2">No Equipment Listed Yet</h2>
          <p class="text-muted-foreground mb-4">Check back soon — we're adding inventory regularly.</p>
          <a href="/api/preview/${siteId}?page=contact" class="cta-button rounded-md inline-block">Contact Us for Availability</a>
        </div>
      ` : `
        <div class="flex items-center justify-between mb-6">
          <p class="text-muted-foreground" id="invCount">Showing <strong>${displayProducts.length}</strong> items</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="invGrid">
          ${displayProducts.map((item: any) => `
            <div class="inv-card industrial-card group overflow-hidden rounded-lg cursor-pointer" data-category="${item.category || ''}" data-condition="${item.condition || ''}" onclick="openFmModal('${item.id || item.slug || ''}')">
              <div class="aspect-[4/3] bg-muted overflow-hidden relative">
                ${item.primary_image
                  ? `<img src="${item.primary_image}" alt="${item.title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">`
                  : `<div class="w-full h-full flex items-center justify-center" style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); opacity: 0.7;"></div>`
                }
                ${item.featured ? `<span class="absolute top-3 left-3 bg-secondary text-white text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-sm shadow-md">Featured</span>` : ''}
                ${item.condition && item.condition !== 'new' ? `<span class="absolute top-3 right-3 bg-foreground/70 text-white text-xs font-semibold px-3 py-1 rounded-sm capitalize">${item.condition}</span>` : ''}
              </div>
              <div class="p-4">
                <p class="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">${[item.category, item.model, item.year].filter(Boolean).join(' · ')}</p>
                <h3 class="font-bold text-lg text-foreground mb-1 leading-tight">${item.title}</h3>
                ${item.hours ? `<p class="text-xs text-muted-foreground mb-2">${item.hours} hours</p>` : ''}
                <div class="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <span class="text-xl font-bold text-primary">${fmtPrice(item.price)}</span>
                    ${item.sale_price ? `<span class="text-sm text-red-500 line-through ml-2">${fmtPrice(item.sale_price)}</span>` : ''}
                  </div>
                  <span class="text-secondary font-semibold text-sm uppercase tracking-wide group-hover:underline flex-shrink-0">Details →</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `}

      <div class="mt-12 bg-muted rounded-lg p-6 md:p-8 text-center">
        <h2 class="text-2xl font-bold text-primary uppercase tracking-tight mb-2">Don't see what you're looking for?</h2>
        <p class="text-muted-foreground mb-4">Contact us and we'll help you find the right equipment for your needs.</p>
        <a href="/api/preview/${siteId}?page=contact" class="inline-flex items-center gap-2 cta-button rounded-md">Contact Us</a>
      </div>
    </div>
  </section>

  <script>
    (function() {
      var catFilter = document.getElementById('catFilter');
      var condFilter = document.getElementById('condFilter');
      var cards = document.querySelectorAll('.inv-card');
      var countEl = document.getElementById('invCount');
      function applyFilters() {
        var cat = catFilter ? catFilter.value : 'all';
        var cond = condFilter ? condFilter.value : 'all';
        var shown = 0;
        cards.forEach(function(card) {
          var matchCat = (cat === 'all' || card.getAttribute('data-category') === cat);
          var matchCond = (cond === 'all' || card.getAttribute('data-condition') === cond);
          if (matchCat && matchCond) { card.style.display = ''; shown++; } else { card.style.display = 'none'; }
        });
        if (countEl) countEl.innerHTML = 'Showing <strong>' + shown + '</strong> items';
      }
      if (catFilter) catFilter.addEventListener('change', applyFilters);
      if (condFilter) condFilter.addEventListener('change', applyFilters);
    })();
  </script>
  ` : ''}
  `;
}

async function gvInventoryPage(
  getContent: GetContent,
  colors: Colors,
  siteId: string,
  supabase: any,
  displayProducts: any[],
  isRealProducts: boolean,
  fmtPrice: FmtPrice,
  vis: Record<string, boolean> = {}
): Promise<string> {
  let inventory = displayProducts;
  if (supabase) {
    const { data } = await supabase
      .from('inventory_items')
      .select('id, title, description, category, condition, price, sale_price, model, year, primary_image, slug, featured, status, hours')
      .eq('site_id', siteId)
      .eq('status', 'available')
      .order('featured', { ascending: false })
      .order('display_order')
      .limit(50);
    if (data && data.length > 0) inventory = data;
  }
  return gvInventoryPageStatic(getContent, colors, siteId, inventory, inventory.length > 0, fmtPrice, vis);
}


// ============================================
// RENTALS PAGE (static + async)
// ============================================

function gvRentalsPageStatic(
  getContent: GetContent,
  colors: Colors,
  siteId: string,
  vis: Record<string, boolean> = {}
): string {
  const heading = getContent('rentalsPage.heading') || 'Equipment Rentals';
  const subheading = getContent('rentalsPage.subheading') || 'Professional-grade equipment for daily, weekly, or monthly rental.';
  const heroImage = getContent('rentalsPage.heroImage');
  const pricingNote = getContent('rentalsPage.pricingNote');
  const phone = getContent('businessInfo.phone');

  // Editable rental info card
  const rentalInfoHeading = getContent('rentalsPage.rentalInfoHeading') || 'Rental Information';
  const req1 = getContent('rentalsPage.requirement1') || 'Valid driver\'s license or state ID';
  const req2 = getContent('rentalsPage.requirement2') || 'Credit card for deposit';
  const req3 = getContent('rentalsPage.requirement3') || 'Signed rental agreement';
  const req4 = getContent('rentalsPage.requirement4') || 'Proof of insurance (for towed equipment)';
  const pol1 = getContent('rentalsPage.policy1') || '24-hour minimum rental';
  const pol2 = getContent('rentalsPage.policy2') || 'Fuel must be returned at same level';
  const pol3 = getContent('rentalsPage.policy3') || 'Late returns billed at daily rate';
  const pol4 = getContent('rentalsPage.policy4') || 'Delivery available for additional fee';

  return `
  ${vis['rentalsPage._heroHeading'] !== false ? pageHero(heading, subheading, heroImage, 'rentalsPage') : ''}

  ${vis['rentalsPage._rentalInfoHeading'] !== false ? `
  <section data-section="rentalsList" class="py-12 bg-background">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center py-12">
        <div class="w-20 h-20 mx-auto mb-6 bg-primary rounded-full flex items-center justify-center"><span class="text-3xl">🚜</span></div>
        <h2 class="text-2xl font-bold text-foreground mb-2">Rental Equipment</h2>
        <p class="text-muted-foreground mb-6">Contact us for current rental availability and rates.</p>
        <a href="tel:${phone.replace(/[^0-9]/g, '')}" class="cta-button rounded-md inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Call: ${phone}
        </a>
      </div>

      <!-- Rental Info -->
      <div data-section="rentalInfo" class="mt-8 bg-muted rounded-lg p-6 md:p-8">
        <h2 class="text-2xl font-bold text-primary uppercase tracking-tight mb-4">${rentalInfoHeading}</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-bold mb-3 uppercase tracking-wide text-sm">Requirements</h3>
            <div class="space-y-2 text-sm text-foreground">
              <div class="flex items-start gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2" class="flex-shrink-0 mt-0.5"><path d="m9 12 2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg><span>${req1}</span></div>
              <div class="flex items-start gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2" class="flex-shrink-0 mt-0.5"><path d="m9 12 2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg><span>${req2}</span></div>
              <div class="flex items-start gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2" class="flex-shrink-0 mt-0.5"><path d="m9 12 2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg><span>${req3}</span></div>
              <div class="flex items-start gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2" class="flex-shrink-0 mt-0.5"><path d="m9 12 2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg><span>${req4}</span></div>
            </div>
          </div>
          <div>
            <h3 class="font-bold mb-3 uppercase tracking-wide text-sm">Policies</h3>
            <div class="space-y-2 text-sm text-foreground">
              <p>• ${pol1}</p>
              <p>• ${pol2}</p>
              <p>• ${pol3}</p>
              <p>• ${pol4}</p>
            </div>
          </div>
        </div>
        ${pricingNote ? `<p class="mt-6 text-sm text-muted-foreground italic border-t border-border pt-4">${pricingNote}</p>` : ''}
      </div>
    </div>
  </section>

  <!-- Rental Request Form -->
  <section class="py-12 bg-muted">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
      <h2 class="section-heading text-center mb-6">Request a Rental Quote</h2>
      <div class="industrial-card rounded-lg">
        <div class="p-6">
          <form class="space-y-4" method="POST" action="/api/contact/${siteId}" id="rentalForm">
            <input type="hidden" name="siteId" value="${siteId}">
            <input type="hidden" name="subject" value="Rental Inquiry">
            <div class="grid md:grid-cols-2 gap-4">
              <div><label class="block text-sm font-semibold text-foreground mb-1">Name *</label><input type="text" name="name" required class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none"></div>
              <div><label class="block text-sm font-semibold text-foreground mb-1">Phone *</label><input type="tel" name="phone" required placeholder="(555) 123-4567" class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none"></div>
            </div>
            <div><label class="block text-sm font-semibold text-foreground mb-1">Email *</label><input type="email" name="email" required class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none"></div>
            <div><label class="block text-sm font-semibold text-foreground mb-1">What equipment do you need?</label><input type="text" name="equipment" placeholder="e.g., Ride-on mower, skid steer" class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none"></div>
            <div class="grid md:grid-cols-2 gap-4">
              <div><label class="block text-sm font-semibold text-foreground mb-1">Start Date</label><input type="date" name="startDate" class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none"></div>
              <div><label class="block text-sm font-semibold text-foreground mb-1">Duration</label><select name="duration" class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none"><option value="">Select</option><option value="1 day">1 Day</option><option value="2-3 days">2-3 Days</option><option value="1 week">1 Week</option><option value="2 weeks">2 Weeks</option><option value="1 month">1 Month</option><option value="1+ months">1+ Months</option></select></div>
            </div>
            <div><label class="block text-sm font-semibold text-foreground mb-1">Additional Details</label><textarea name="message" rows="3" placeholder="Any special requirements, delivery needs, etc." class="w-full px-3 py-2 border-2 border-border rounded-md bg-background text-foreground focus:border-primary focus:outline-none resize-y"></textarea></div>
            <button type="submit" class="w-full cta-button rounded-md text-center">Request Rental Quote</button>
          </form>
        </div>
      </div>
    </div>
  </section>

  <script>
    var rform = document.getElementById('rentalForm');
    if (rform) {
      rform.addEventListener('submit', function(e) {
        e.preventDefault();
        var fd = new FormData(rform); var data = {};
        fd.forEach(function(v, k) { data[k] = v; });
        var btn = rform.querySelector('button[type=submit]');
        btn.textContent = 'Submitting...'; btn.disabled = true;
        fetch(rform.action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function(r) { return r.json(); })
        .then(function(res) {
          if (res.error) { alert('Error: ' + res.error); btn.textContent = 'Request Rental Quote'; btn.disabled = false; }
          else { rform.innerHTML = '<div class="text-center py-8"><div class="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg></div><h3 class="text-2xl font-bold mb-2">Quote Request Sent!</h3><p class="text-muted-foreground">We will get back to you within 1 business day with availability and pricing.</p></div>'; }
        })
        .catch(function() { alert('Something went wrong.'); btn.textContent = 'Request Rental Quote'; btn.disabled = false; });
      });
    }
  </script>
  ` : ''}
  `;
}

async function gvRentalsPage(
  getContent: GetContent,
  colors: Colors,
  siteId: string,
  supabase: any,
  hasRentalFeature: boolean,
  vis: Record<string, boolean> = {}
): Promise<string> {
  if (!supabase || !hasRentalFeature) return gvRentalsPageStatic(getContent, colors, siteId, vis);

  const { data: rentals } = await supabase
    .from('rental_inventory')
    .select('*')
    .eq('site_id', siteId)
    .eq('status', 'available')
    .order('display_order');

  if (!rentals || rentals.length === 0) {
    return gvRentalsPageStatic(getContent, colors, siteId, vis);
  }

  const heading = getContent('rentalsPage.heading') || 'Equipment Rentals';
  const subheading = getContent('rentalsPage.subheading') || 'Professional-grade equipment available now.';
  const heroImage = getContent('rentalsPage.heroImage');
  const phone = getContent('businessInfo.phone');

  return `
  ${vis['rentalsPage._heroHeading'] !== false ? pageHero(heading, subheading, heroImage, 'rentalsPage') : ''}

  ${vis['rentalsPage._rentalInfoHeading'] !== false ? `
  <section data-section="rentalsList" class="py-8 bg-background">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        ${rentals.map((item: any) => `
          <div class="industrial-card group overflow-hidden rounded-lg">
            <div class="aspect-[4/3] bg-muted overflow-hidden relative">
              ${item.primary_image
                ? `<img src="${item.primary_image}" alt="${item.title}" loading="lazy" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105">`
                : `<div class="w-full h-full flex items-center justify-center bg-muted"><span class="text-4xl">🚜</span></div>`
              }
              ${!item.quantity_available || item.quantity_available === 0
                ? `<div class="absolute inset-0 bg-foreground/60 flex items-center justify-center"><span class="bg-red-600 text-white px-4 py-2 font-bold uppercase text-sm rounded-sm">Currently Rented</span></div>`
                : `<span class="absolute top-3 right-3 bg-accent text-white text-xs font-bold px-2 py-1 rounded-sm">${item.quantity_available} Available</span>`
              }
            </div>
            <div class="p-4">
              <span class="inline-block bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-sm mb-2">${item.category || 'Rental'}</span>
              <h3 class="font-bold text-lg text-foreground mb-1">${item.title}</h3>
              ${item.description ? `<p class="text-sm text-muted-foreground mb-3 line-clamp-2">${item.description}</p>` : ''}
              <div class="bg-muted rounded-lg p-3 mb-3">
                <div class="grid grid-cols-3 gap-2 text-center">
                  ${item.daily_rate ? `<div><p class="text-xs text-muted-foreground uppercase">Daily</p><p class="font-bold text-primary text-lg">$${item.daily_rate}</p></div>` : ''}
                  ${item.weekly_rate ? `<div><p class="text-xs text-muted-foreground uppercase">Weekly</p><p class="font-bold text-primary text-lg">$${item.weekly_rate}</p></div>` : ''}
                  ${item.monthly_rate ? `<div><p class="text-xs text-muted-foreground uppercase">Monthly</p><p class="font-bold text-primary text-lg">$${item.monthly_rate}</p></div>` : ''}
                </div>
              </div>
              <a href="tel:${phone.replace(/[^0-9]/g, '')}" class="block w-full text-center cta-button rounded-md text-sm py-2">Reserve Now</a>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Rental Info Card -->
      <div data-section="rentalInfo" class="mt-8 bg-muted rounded-lg p-6 md:p-8">
        <h2 class="text-2xl font-bold text-primary uppercase tracking-tight mb-4">${getContent('rentalsPage.rentalInfoHeading') || 'Rental Information'}</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-bold mb-3 uppercase tracking-wide text-sm">Requirements</h3>
            <div class="space-y-2 text-sm text-foreground">
              <div class="flex items-start gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2" class="flex-shrink-0 mt-0.5"><path d="m9 12 2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg><span>${getContent('rentalsPage.requirement1') || "Valid driver's license or state ID"}</span></div>
              <div class="flex items-start gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2" class="flex-shrink-0 mt-0.5"><path d="m9 12 2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg><span>${getContent('rentalsPage.requirement2') || 'Credit card for deposit'}</span></div>
              <div class="flex items-start gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2" class="flex-shrink-0 mt-0.5"><path d="m9 12 2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg><span>${getContent('rentalsPage.requirement3') || 'Signed rental agreement'}</span></div>
              <div class="flex items-start gap-2"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2" class="flex-shrink-0 mt-0.5"><path d="m9 12 2 2 4-4"/><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg><span>${getContent('rentalsPage.requirement4') || 'Proof of insurance (for towed equipment)'}</span></div>
            </div>
          </div>
          <div>
            <h3 class="font-bold mb-3 uppercase tracking-wide text-sm">Policies</h3>
            <div class="space-y-2 text-sm text-foreground">
              <p>• ${getContent('rentalsPage.policy1') || '24-hour minimum rental'}</p>
              <p>• ${getContent('rentalsPage.policy2') || 'Fuel must be returned at same level'}</p>
              <p>• ${getContent('rentalsPage.policy3') || 'Late returns billed at daily rate'}</p>
              <p>• ${getContent('rentalsPage.policy4') || 'Delivery available for additional fee'}</p>
            </div>
          </div>
        </div>
        ${getContent('rentalsPage.pricingNote') ? `<p class="mt-6 text-sm text-muted-foreground italic border-t border-border pt-4">${getContent('rentalsPage.pricingNote')}</p>` : ''}
      </div>
    </div>
  </section>
  ` : ''}
  `;
}
