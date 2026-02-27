// ─── Modern Lawn Solutions ── Standalone Template ────────────────────────
// Design: Emerald green primary (#10b981), clean minimalist, rounded cards.
//         Inter headings (700), Inter body (400). Split-layout hero,
//         shadcn-inspired card system, muted gray backgrounds.
// ─────────────────────────────────────────────────────────────────────────

import { sharedPreviewScript } from './shared';

/* ── DEMO overrides ── */
export const MODERN_LAWN_DEMO_OVERRIDES = {
  'business.name': 'Modern Lawn Solutions',
  'business.phone': '(512) 555-0198',
  'business.email': 'hello@modernlawn.com',
  'business.address': '900 Tech Row, Austin, TX 78701',
  'business.hours': JSON.stringify({
    monday: { open: '08:00', close: '18:00' }, tuesday: { open: '08:00', close: '18:00' },
    wednesday: { open: '08:00', close: '18:00' }, thursday: { open: '08:00', close: '18:00' },
    friday: { open: '08:00', close: '18:00' }, saturday: { open: '09:00', close: '16:00' },
    sunday: { open: '', close: '' },
  }),
  'social.facebook': 'https://facebook.com/modernlawn',
  'social.instagram': 'https://instagram.com/modernlawn',
  'social.youtube': 'https://youtube.com/modernlawn',
  'hero.heading': 'MODERN LAWN SOLUTIONS',
  'hero.subheading': 'Premium equipment for professional landscapers and homeowners alike.',
  'hero.ctaPrimary': 'Browse Equipment',
  'hero.ctaSecondary': 'Contact Us',
  'hero.image': '/images/hero-mower.jpg',
  'featured.heading': 'Featured Equipment',
  'featured.subheading': 'Top picks for this season',
  'manufacturers.heading': 'Authorized Dealer',
  'manufacturers.subheading': 'We carry the industry\'s leading brands',
  'testimonials.heading': 'What Our Customers Say',
  'cta.heading': 'Ready to Upgrade Your Equipment?',
  'cta.subheading': 'Visit our showroom or contact us for expert advice on the right equipment for your needs.',
  'cta.button': 'Contact Us Today',
  'footer.tagline': 'Your trusted partner in outdoor equipment',
  'services.heading': 'Equipment Service',
  'services.description': 'Professional maintenance and repair services for all major brands.',
  'services.items': JSON.stringify([
    { icon: '🔧', title: 'Expert Technicians', description: 'Our factory-trained technicians have years of experience servicing all major brands.' },
    { icon: '⏱', title: 'Quick Turnaround', description: 'We understand downtime costs money. Most repairs completed within 48-72 hours.' },
    { icon: '🛡', title: 'Warranty Service', description: 'Authorized warranty repair center for John Deere, Toro, Stihl, and more.' },
  ]),
  'contact.heading': 'Contact Us',
  'contact.description': 'We\'d love to hear from you. Get in touch with our team for sales, service, or any questions.',
  'inventory.heading': 'Equipment Inventory',
  'inventory.description': 'Browse our complete selection of lawn care equipment from the industry\'s leading manufacturers.',
  'rentals.heading': 'Equipment Rentals',
  'rentals.description': 'Professional equipment available for daily, weekly, and monthly rental.',
  'rentals.items': JSON.stringify([
    { name: 'Commercial Zero-Turn 60"', category: 'Mowers', daily: 150, weekly: 600, monthly: 1800, available: true, description: 'Professional zero-turn mower for large properties' },
    { name: 'Stump Grinder', category: 'Specialty', daily: 200, weekly: 800, monthly: 2400, available: true, description: 'Heavy-duty stump grinder for tree removal' },
    { name: 'Aerator - Walk Behind', category: 'Lawn Care', daily: 75, weekly: 300, monthly: 900, available: false, description: 'Core aerator for lawn health improvement' },
    { name: 'Dethatcher', category: 'Lawn Care', daily: 65, weekly: 260, monthly: 780, available: true, description: 'Power dethatcher for removing lawn thatch' },
    { name: 'Chipper/Shredder', category: 'Specialty', daily: 125, weekly: 500, monthly: 1500, available: true, description: 'Wood chipper for branch and debris cleanup' },
    { name: 'Overseed & Spreader', category: 'Lawn Care', daily: 45, weekly: 180, monthly: 540, available: true, description: 'Professional spreader for seed and fertilizer' },
  ]),
  'manufacturers.pageHeading': 'Our Manufacturers',
  'manufacturers.pageDescription': 'Trusted brands we proudly represent.',
  'testimonials.items': JSON.stringify([
    { name: 'Mike Johnson', role: 'Landscaping Business Owner', content: 'The team helped me find the perfect zero-turn mower for my business. Their expertise saved me time and money. Highly recommend!', rating: 5 },
    { name: 'Sarah Williams', role: 'Homeowner', content: 'I was overwhelmed by all the options, but the staff here took the time to understand my needs. Now I have the perfect setup for my 2-acre property.', rating: 5 },
    { name: 'David Chen', role: 'Property Manager', content: 'We\'ve been buying equipment here for over 5 years. Their service department is top-notch and keeps our fleet running smoothly.', rating: 5 },
  ]),
};

export const MODERN_LAWN_SAMPLE_PRODUCTS = [
  { id: 'demo-p1', title: 'TimeCutter\u00ae MyRIDE\u00ae 54" Zero Turn Mower', description: '54 in. TimeCutter MyRIDE Zero Turn Mower with Smart Speed technology.', price: 5199, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/75757-1.jpeg', model: '75757', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-timecutter-myride-54', featured: true, status: 'available' },
  { id: 'demo-p2', title: 'Z Master Revolution 60" Commercial Mower', description: 'Commercial zero-turn with 60 in. TURBO FORCE deck and Horizon Technology.', price: 44443, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/1-22.png', model: 'Z Master Revolution', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-z-master-revolution-60', featured: true, status: 'available' },
  { id: 'demo-p3', title: 'GrandStand\u00ae 52" Stand-On Mower', description: '52 in. stand-on mower with 22 HP Kohler engine and TURBO FORCE deck.', price: 13443, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/74513.jpeg', model: 'GrandStand 74513', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-grandstand-52', featured: true, status: 'available' },
  { id: 'demo-p4', title: '30" TurfMaster\u00ae HDX Walk-Behind', description: '30 in. commercial walk-behind with Kawasaki engine and blade brake clutch.', price: 3110, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/22215-1.jpeg', model: 'TurfMaster HDX 22215', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-turfmaster-hdx-30', featured: true, status: 'available' },
  { id: 'demo-p5', title: '60V Brushless String Trimmer', description: '14/16 in. dual-line trimmer head with brushless motor. 2.5Ah battery included.', price: 229, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/1-4.png', model: '51836T', year: 2025, category: 'Trimmers', condition: 'new', slug: 'toro-60v-string-trimmer', featured: false, status: 'available' },
  { id: 'demo-p6', title: '60V MAX Brushless Leaf Blower', description: '120 mph max air speed brushless handheld blower. 2.5Ah battery included.', price: 229, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/120.png', model: '51820', year: 2025, category: 'Blowers', condition: 'new', slug: 'toro-60v-leaf-blower', featured: false, status: 'available' },
];

// ── Main Render Function ──
export function renderModernLawnPage(
  siteId: string,
  currentPage: string,
  pages: any[],
  products: any[],
  config: any,
  customizations: any,
  enabledFeatures: Set<string>,
  vis: Record<string, boolean>,
  content?: Record<string, string>,
) {
  // Content resolution: passed content (from route) > customizations > config > demo overrides
  const getContent = (key: string) => {
    if (content?.[key]) return content[key];
    if (customizations?.content?.[key]) return customizations.content[key];
    if (config?.content?.[key]) return config.content[key];
    // Fall back to sections config
    const parts = key.split('.');
    if (parts.length === 2) {
      const [section, field] = parts;
      const val = config?.sections?.[section]?.[field]?.default;
      if (val) return val;
    }
    // Fall back to baked-in demo overrides
    return MODERN_LAWN_DEMO_OVERRIDES[key as keyof typeof MODERN_LAWN_DEMO_OVERRIDES] as string || '';
  };

  const colors = {
    primary: customizations?.colors?.primary || config?.colors?.primary?.default || '#10b981',
    secondary: customizations?.colors?.secondary || config?.colors?.secondary?.default || '#ef4444',
    accent: customizations?.colors?.accent || config?.colors?.accent?.default || '#6366f1',
  };

  const fonts = {
    heading: customizations?.fonts?.heading || config?.fonts?.heading?.default || 'Inter',
    body: customizations?.fonts?.body || config?.fonts?.body?.default || 'Inter',
  };

  // Parse hours
  let hours: any = {};
  try { hours = JSON.parse(getContent('business.hours') || '{}'); } catch { hours = {}; }
  const formatHours = (day: any) => {
    if (!day?.open || !day?.close) return 'Closed';
    const fmt = (t: string) => { const [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; return `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, '0')} ${ap}`; };
    return `${fmt(day.open)} – ${fmt(day.close)}`;
  };
  const weekdayHours = formatHours(hours.monday);
  const saturdayHours = formatHours(hours.saturday);
  const sundayHours = formatHours(hours.sunday);

  const fmtPrice = (p: number | null) => p != null ? `$${Number(p).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '';

  let body = '';
  switch (currentPage) {
    case 'home': case 'index': body = mlsHome(siteId, getContent, products, vis, colors, fmtPrice); break;
    case 'service': body = mlsServicePage(siteId, getContent); break;
    case 'contact': body = mlsContactPage(siteId, getContent, weekdayHours, saturdayHours, sundayHours); break;
    case 'inventory': body = mlsInventoryPage(siteId, getContent, products, fmtPrice); break;
    case 'rentals': body = mlsRentalsPage(siteId, getContent); break;
    case 'manufacturers': body = mlsManufacturersPage(siteId, getContent); break;
    default: body = mlsHome(siteId, getContent, products, vis, colors, fmtPrice); break;
  }

  return mlsHtmlShell(
    getContent('business.name') || 'Modern Lawn Solutions',
    fonts,
    colors,
    siteId,
    currentPage,
    mlsHeader(siteId, currentPage, pages, getContent, colors) +
    body +
    mlsFooter(siteId, pages, getContent, weekdayHours, saturdayHours, sundayHours)
  );
}

// ── HTML Shell ──
function mlsHtmlShell(title: string, fonts: any, colors: any, siteId: string, page: string, body: string) {
  const fontFamilies = new Set([fonts.heading, fonts.body]);
  const googleFontsUrl = Array.from(fontFamilies)
    .map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700;800`)
    .join('&');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?${googleFontsUrl}&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script>
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          heading: ['${fonts.heading}', 'system-ui', 'sans-serif'],
          body: ['${fonts.body}', 'system-ui', 'sans-serif'],
        },
        colors: {
          primary: '${colors.primary}',
          secondary: '${colors.secondary}',
          accent: '${colors.accent}',
        },
      }
    }
  }
  <\/script>
  <style>
    body { font-family: '${fonts.body}', system-ui, sans-serif; background: #ffffff; color: #1a1a2e; margin: 0; }
    .font-heading { font-family: '${fonts.heading}', system-ui, sans-serif; }
    .container-mls { max-width: 80rem; margin: 0 auto; padding-left: 1rem; padding-right: 1rem; }
    @media(min-width:640px){ .container-mls { padding-left: 1.5rem; padding-right: 1.5rem; } }
    @media(min-width:1024px){ .container-mls { padding-left: 2rem; padding-right: 2rem; } }
    .card-mls { background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden; transition: box-shadow 0.3s; }
    .card-mls:hover { box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
    .btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; background: ${colors.primary}; color: #fff; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.9375rem; border: none; cursor: pointer; transition: opacity 0.2s; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-outline { display: inline-flex; align-items: center; gap: 0.5rem; background: transparent; color: ${colors.primary}; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; font-size: 0.9375rem; border: 2px solid ${colors.primary}; cursor: pointer; transition: all 0.2s; }
    .btn-outline:hover { background: ${colors.primary}; color: #fff; }
    .page-header-mls { background: #f9fafb; padding: 3rem 0; text-align: center; }
    .page-header-mls h1 { font-size: 2.25rem; font-weight: 700; color: #111827; margin: 0; }
    .page-header-mls p { color: #6b7280; margin-top: 0.5rem; font-size: 1.0625rem; }
    input, textarea, select { font-family: '${fonts.body}', system-ui, sans-serif; }
    .form-input { width: 100%; padding: 0.625rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.9375rem; transition: border-color 0.2s; background-color: #fff; color: #111827; }
    .form-input:focus { outline: none; border-color: ${colors.primary}; box-shadow: 0 0 0 3px ${colors.primary}20; }
    select.form-input { appearance: none; -webkit-appearance: none; -moz-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%236b7280' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; background-size: 1rem; padding-right: 2.5rem; cursor: pointer; }
    select.form-input:hover { border-color: #9ca3af; }
    select.form-input option { padding: 0.5rem; }
    .form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.375rem; }

    /* ── Mobile Responsive ── */
    @media (max-width: 768px) {
      [style*="grid-template-columns: 1fr 1fr"],
      [style*="grid-template-columns:1fr 1fr"] { grid-template-columns: 1fr !important; }
      [style*="grid-template-columns: repeat(3"],
      [style*="grid-template-columns: repeat(4"],
      [style*="grid-template-columns: repeat(5"],
      [style*="grid-template-columns: repeat(6"] { grid-template-columns: 1fr 1fr !important; }
      [style*="grid-template-columns: 2fr 1fr"] { grid-template-columns: 1fr !important; }
      [style*="min-height: 600px"] { min-height: auto !important; padding: 3rem 0 !important; }
      [data-section="hero"] [style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
      [data-section="hero"] { min-height: auto !important; }
      header nav { display: none !important; }
      header a[href^="tel"] { display: none !important; }
      .page-header-mls h1 { font-size: 1.75rem !important; }
      .page-header-mls p { font-size: 1rem !important; }
      section h2 { font-size: 1.5rem !important; }
      section h1 { font-size: 2rem !important; }
      footer [style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr 1fr !important; gap: 1.5rem !important; }
    }
    @media (max-width: 480px) {
      [style*="grid-template-columns: repeat(3"],
      [style*="grid-template-columns: repeat(4"],
      [style*="grid-template-columns: repeat(5"],
      [style*="grid-template-columns: repeat(6"] { grid-template-columns: 1fr !important; }
      footer [style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
      [style*="padding: 3rem"] { padding: 1.5rem !important; }
    }
  </style>
</head>
<body>
  ${body}
  ${sharedPreviewScript(siteId, page)}
</body>
</html>`;
}

// ── Header ──
function mlsHeader(siteId: string, currentPage: string, pages: any[], getContent: (k: string) => string, colors: any) {
  const businessName = getContent('business.name') || 'Modern Lawn Solutions';
  const phone = getContent('business.phone');

  const navItems = [
    { label: 'Home', slug: 'home' },
    { label: 'Inventory', slug: 'inventory' },
    { label: 'Rentals', slug: 'rentals' },
    { label: 'Service', slug: 'service' },
    { label: 'Manufacturers', slug: 'manufacturers' },
    { label: 'Contact', slug: 'contact' },
  ].filter(n => {
    if (n.slug === 'home') return true;
    return pages.some(p => p.slug === n.slug && p.is_visible !== false);
  });

  return `
  <header style="position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,0.95); backdrop-filter: blur(8px); border-bottom: 1px solid #e5e7eb;">
    <div class="container-mls" style="display: flex; align-items: center; justify-content: space-between; height: 4rem;">
      <a href="/api/preview/${siteId}?page=home" style="text-decoration: none; font-size: 1.25rem; font-weight: 700; color: ${colors.primary};" class="font-heading">
        ${businessName}
      </a>
      <nav class="mls-desktop-nav" style="display: flex; align-items: center; gap: 1.5rem;">
        ${navItems.map(n => {
          const isActive = currentPage === n.slug || (currentPage === 'index' && n.slug === 'home');
          return `<a href="/api/preview/${siteId}?page=${n.slug}" style="font-size: 0.875rem; font-weight: 500; text-decoration: none; color: ${isActive ? colors.primary : '#6b7280'}; transition: color 0.2s;" onmouseover="this.style.color='${colors.primary}'" onmouseout="this.style.color='${isActive ? colors.primary : '#6b7280'}'">${n.label}</a>`;
        }).join('')}
      </nav>
      <button class="mls-mobile-btn" onclick="document.getElementById('mlsMobileMenu').classList.toggle('mls-mobile-open')" style="display:none;background:none;border:none;cursor:pointer;padding:0.5rem;">
        <svg width="24" height="24" fill="none" stroke="${colors.primary}" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
      ${phone ? `
      <a class="mls-desktop-nav" href="tel:${phone}" style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600; color: ${colors.primary}; text-decoration: none;">
        <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
        ${phone}
      </a>` : ''}
    </div>
    <div id="mlsMobileMenu" style="display:none;padding:0.75rem 1rem;border-top:1px solid #e5e7eb;">
      ${navItems.map(n => {
        const isActive = currentPage === n.slug || (currentPage === 'index' && n.slug === 'home');
        return `<a href="/api/preview/${siteId}?page=${n.slug}" style="display:block;padding:0.5rem 0;font-size:0.9375rem;font-weight:500;text-decoration:none;color:${isActive ? colors.primary : '#374151'};">${n.label}</a>`;
      }).join('')}
      ${phone ? `<a href="tel:${phone}" style="display:block;padding:0.75rem 0;font-weight:600;color:${colors.primary};text-decoration:none;">📞 ${phone}</a>` : ''}
    </div>
  </header>
  <style>
    @media(max-width:768px){ .mls-desktop-nav { display:none !important; } .mls-mobile-btn { display:block !important; } }
    .mls-mobile-open { display:block !important; }
  </style>`;
}

// ── Footer ──
function mlsFooter(siteId: string, pages: any[], getContent: (k: string) => string, weekday: string, saturday: string, sunday: string) {
  const name = getContent('business.name') || 'Modern Lawn Solutions';
  const phone = getContent('business.phone');
  const email = getContent('business.email');
  const address = getContent('business.address');
  const tagline = getContent('footer.tagline');
  const fb = getContent('social.facebook');
  const ig = getContent('social.instagram');
  const yt = getContent('social.youtube');

  const navLinks = ['home', 'inventory', 'rentals', 'service', 'manufacturers', 'contact'];

  return `
  <footer style="background: #111827; color: #e5e7eb;">
    <div class="container-mls" style="padding: 3rem 0;">
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem;">
        <!-- Business Info -->
        <div>
          <h3 class="font-heading" style="font-size: 1.25rem; font-weight: 700; color: #fff; margin: 0 0 1rem;">${name}</h3>
          ${tagline ? `<p style="font-size: 0.875rem; color: #9ca3af; margin: 0 0 1.25rem;">${tagline}</p>` : ''}
          <div style="display: flex; gap: 1rem;">
            ${fb ? `<a href="${fb}" target="_blank" rel="noopener" style="color: #9ca3af; transition: color 0.2s;" aria-label="Facebook"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>` : ''}
            ${ig ? `<a href="${ig}" target="_blank" rel="noopener" style="color: #9ca3af; transition: color 0.2s;" aria-label="Instagram"><svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>` : ''}
            ${yt ? `<a href="${yt}" target="_blank" rel="noopener" style="color: #9ca3af; transition: color 0.2s;" aria-label="YouTube"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#111827"/></svg></a>` : ''}
          </div>
        </div>
        <!-- Quick Links -->
        <div>
          <h4 style="font-size: 1rem; font-weight: 600; color: #fff; margin: 0 0 1rem;">Quick Links</h4>
          <nav style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${navLinks.map(slug => `<a href="/api/preview/${siteId}?page=${slug}" style="font-size: 0.875rem; color: #9ca3af; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#9ca3af'">${slug.charAt(0).toUpperCase() + slug.slice(1)}</a>`).join('')}
          </nav>
        </div>
        <!-- Contact Info -->
        <div>
          <h4 style="font-size: 1rem; font-weight: 600; color: #fff; margin: 0 0 1rem;">Contact Us</h4>
          <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.875rem; color: #9ca3af;">
            ${phone ? `<a href="tel:${phone}" style="color: #9ca3af; text-decoration: none; display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>${phone}</a>` : ''}
            ${email ? `<a href="mailto:${email}" style="color: #9ca3af; text-decoration: none; display: flex; align-items: center; gap: 0.5rem;"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>${email}</a>` : ''}
            ${address ? `<span style="display: flex; align-items: flex-start; gap: 0.5rem;"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="flex-shrink:0; margin-top:2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>${address}</span>` : ''}
          </div>
        </div>
        <!-- Hours -->
        <div>
          <h4 style="font-size: 1rem; font-weight: 600; color: #fff; margin: 0 0 1rem;">Business Hours</h4>
          <div style="font-size: 0.875rem; color: #9ca3af; display: flex; flex-direction: column; gap: 0.25rem;">
            <div style="display: flex; justify-content: space-between;"><span>Mon - Fri</span><span>${weekday}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Saturday</span><span>${saturday}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Sunday</span><span>${sunday}</span></div>
          </div>
        </div>
      </div>
      <div style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #1f2937; text-align: center; font-size: 0.8125rem; color: #6b7280;">
        © ${new Date().getFullYear()} ${name}. All rights reserved.
      </div>
    </div>
  </footer>`;
}

// ══════════════════════════════════════════════════
//  HOME PAGE
// ══════════════════════════════════════════════════
function mlsHome(siteId: string, gc: (k: string) => string, products: any[], vis: Record<string, boolean>, colors: any, fmtPrice: (p: number | null) => string): string {
  let html = '';

  // ── Hero: Split Layout ──
  if (vis.hero !== false) {
    const heroImg = gc('hero.image') || '/images/hero-mower.jpg';
    html += `
    <section data-section="hero" style="background: #f9fafb;">
      <div class="container-mls">
        <div style="display: grid; grid-template-columns: 1fr 1fr; min-height: 600px; align-items: center; gap: 2rem; padding: 3rem 0;">
          <div style="max-width: 540px;">
            <h1 class="font-heading" style="font-size: 3.25rem; font-weight: 700; line-height: 1.1; margin: 0 0 1.5rem; color: #111827;">${gc('hero.heading')}</h1>
            <p style="font-size: 1.125rem; color: #6b7280; margin: 0 0 2rem; line-height: 1.7;">${gc('hero.subheading')}</p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <a href="/api/preview/${siteId}?page=inventory" class="btn-primary">${gc('hero.ctaPrimary') || 'Browse Equipment'} <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
              <a href="/api/preview/${siteId}?page=contact" class="btn-outline">${gc('hero.ctaSecondary') || 'Contact Us'}</a>
            </div>
          </div>
          <div style="border-radius: 0.75rem; overflow: hidden; height: 500px;">
            <img src="${heroImg}" alt="Lawn care equipment" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        </div>
      </div>
    </section>`;
  }

  // ── Featured Products ──
  if (vis.featured !== false) {
    const featured = products.filter((p: any) => p.featured).slice(0, 4);
    const displayList = featured.length > 0 ? featured : products.slice(0, 4);
    html += `
    <section data-section="featured" style="padding: 5rem 0;">
      <div class="container-mls">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 class="font-heading" style="font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem; color: #111827;">${gc('featured.heading')}</h2>
          <p style="color: #6b7280; font-size: 1.0625rem; margin: 0;">${gc('featured.subheading')}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem;">
          ${displayList.map((p: any) => `
          <div class="card-mls">
            <div style="height: 200px; overflow: hidden;">
              ${p.primary_image ? `<img src="${p.primary_image}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">` : `<div style="width:100%;height:100%;background:linear-gradient(135deg,${colors.primary},${colors.accent});"></div>`}
            </div>
            <div style="padding: 1.25rem;">
              <p style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin: 0 0 0.25rem;">${p.category || ''}</p>
              <h3 style="font-size: 1rem; font-weight: 600; margin: 0 0 0.375rem; color: #111827;">${p.title}</h3>
              <p style="font-size: 0.875rem; color: #6b7280; margin: 0 0 1rem; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${p.description || ''}</p>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                ${p.price ? `<span style="font-size: 1.125rem; font-weight: 700; color: ${colors.primary};">${fmtPrice(p.price)}</span>` : '<span></span>'}
                <a href="/api/preview/${siteId}?page=inventory" style="font-size: 0.8125rem; font-weight: 600; color: ${colors.primary}; text-decoration: none;">View Details</a>
              </div>
            </div>
          </div>`).join('')}
        </div>
        <div style="text-align: center; margin-top: 2.5rem;">
          <a href="/api/preview/${siteId}?page=inventory" class="btn-outline">View All Equipment <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
        </div>
      </div>
    </section>`;
  }

  // ── Manufacturers ──
  if (vis.manufacturers !== false) {
    const logos: Record<string,string> = { 'Toro': '/images/logos/toro.png', 'Exmark': '/images/logos/exmark.png', 'ECHO': '/images/logos/Echo.png', 'Honda': '/images/logos/Honda.png', 'Husqvarna': '/images/logos/Husqvarna.png', 'Kubota': '/images/logos/kubota.jpg' };
    html += `
    <section data-section="manufacturers" style="padding: 5rem 0; background: #f9fafb;">
      <div class="container-mls">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 class="font-heading" style="font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem; color: #111827;">${gc('manufacturers.heading')}</h2>
          <p style="color: #6b7280; margin: 0;">${gc('manufacturers.subheading')}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem;">
          ${['Toro', 'Exmark', 'ECHO', 'Honda', 'Husqvarna', 'Kubota'].map(brand => `
          <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; transition: box-shadow 0.3s;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow='none'">
            <img src="${logos[brand] || ''}" alt="${brand}" style="height: 44px; width: auto; margin-bottom: 0.5rem;">
          </div>`).join('')}
        </div>
        <div style="text-align: center; margin-top: 2.5rem;">
          <a href="/api/preview/${siteId}?page=manufacturers" class="btn-outline">View All Brands <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
        </div>
      </div>
    </section>`;
  }

  // ── Testimonials ──
  if (vis.testimonials !== false) {
    let testimonials: any[] = [];
    try { testimonials = JSON.parse(gc('testimonials.items') || '[]'); } catch {}
    if (testimonials.length === 0) {
      testimonials = [
        { name: 'Mike J.', role: 'Landscaping Business Owner', content: 'The team helped me find the perfect zero-turn mower. Expertise saved me time and money!', rating: 5 },
        { name: 'Sarah W.', role: 'Homeowner', content: 'Staff took the time to understand my needs. Now I have the perfect setup for my property.', rating: 5 },
        { name: 'David C.', role: 'Property Manager', content: 'We\'ve been buying equipment here for over 5 years. Service department is top-notch.', rating: 5 },
      ];
    }
    html += `
    <section data-section="testimonials" style="padding: 5rem 0;">
      <div class="container-mls">
        <h2 class="font-heading" style="font-size: 2rem; font-weight: 700; text-align: center; margin: 0 0 3rem; color: #111827;">${gc('testimonials.heading')}</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
          ${testimonials.map(t => `
          <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; display: flex; flex-direction: column; height: 100%;">
            <div style="display: flex; gap: 2px; margin-bottom: 1rem;">
              ${Array.from({length: 5}).map((_, i) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="${i < (t.rating || 5) ? colors.primary : '#e5e7eb'}" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`).join('')}
            </div>
            <blockquote style="flex: 1; color: #6b7280; font-size: 0.9375rem; line-height: 1.7; margin: 0 0 1.25rem; font-style: italic;">"${t.content}"</blockquote>
            <div style="border-top: 1px solid #e5e7eb; padding-top: 1rem;">
              <p style="font-weight: 600; color: #111827; margin: 0; font-size: 0.9375rem;">${t.name}</p>
              <p style="font-size: 0.8125rem; color: #6b7280; margin: 0.125rem 0 0;">${t.role}</p>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </section>`;
  }

  // ── CTA ──
  if (vis.cta !== false) {
    html += `
    <section data-section="cta" style="padding: 5rem 0; background: ${colors.primary}; color: #fff;">
      <div class="container-mls" style="text-align: center;">
        <h2 class="font-heading" style="font-size: 2rem; font-weight: 700; margin: 0 0 1rem; color: #fff;">${gc('cta.heading')}</h2>
        <p style="font-size: 1.0625rem; color: rgba(255,255,255,0.85); max-width: 600px; margin: 0 auto 2rem; line-height: 1.7;">${gc('cta.subheading')}</p>
        <a href="/api/preview/${siteId}?page=contact" style="display: inline-block; background: #fff; color: ${colors.primary}; padding: 0.875rem 2rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">${gc('cta.button')}</a>
      </div>
    </section>`;
  }

  return html;
}

// ══════════════════════════════════════════════════
//  INVENTORY PAGE
// ══════════════════════════════════════════════════
function mlsInventoryPage(siteId: string, gc: (k: string) => string, products: any[], fmtPrice: (p: number | null) => string): string {
  const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))];

  return `
  <section data-section="inventoryHero" class="page-header-mls">
    <div class="container-mls">
      <h1>${gc('inventory.heading') || 'Equipment Inventory'}</h1>
      <p>${gc('inventory.description') || 'Browse our complete selection of lawn care equipment.'}</p>
    </div>
  </section>

  <section data-section="inventoryGrid" style="padding: 2rem 0 4rem;">
    <div class="container-mls">
      <!-- Filters Row -->
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; align-items: center;">
        <div style="position: relative; flex: 1; max-width: 400px;">
          <svg width="16" height="16" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24" style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search equipment..." class="form-input" style="padding-left: 2.25rem;" id="mls-search">
        </div>
        ${categories.length > 0 ? `
        <select class="form-input" style="width: auto; min-width: 180px;" id="mls-cat-filter">
          <option value="">All Categories</option>
          ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>` : ''}
      </div>

      <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 1.5rem;">Showing ${products.length} products</p>

      <!-- Products Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem;">
        ${products.map((p: any) => `
        <div class="card-mls" data-category="${p.category || ''}" data-title="${(p.title || '').toLowerCase()}">
          <div style="height: 200px; overflow: hidden;">
            ${p.primary_image ? `<img src="${p.primary_image}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">` : `<div style="width:100%;height:100%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af;">No Image</div>`}
          </div>
          <div style="padding: 1.25rem;">
            <p style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin: 0 0 0.25rem;">${p.category || ''}</p>
            <h3 style="font-size: 1rem; font-weight: 600; margin: 0 0 0.375rem; color: #111827;">${p.title}</h3>
            <p style="font-size: 0.875rem; color: #6b7280; margin: 0 0 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${p.description || ''}</p>
            ${p.price ? `<span style="font-size: 1.125rem; font-weight: 700; color: #111827;">${fmtPrice(p.price)}</span>` : ''}
          </div>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <script>
    (function(){
      const search = document.getElementById('mls-search');
      const catFilter = document.getElementById('mls-cat-filter');
      const cards = document.querySelectorAll('[data-category]');
      function filter(){
        const q = (search?.value||'').toLowerCase();
        const cat = catFilter?.value||'';
        cards.forEach(c=>{
          const matchQ = !q || (c.getAttribute('data-title')||'').includes(q);
          const matchC = !cat || c.getAttribute('data-category')===cat;
          c.style.display = matchQ && matchC ? '' : 'none';
        });
      }
      search?.addEventListener('input', filter);
      catFilter?.addEventListener('change', filter);
    })();
  <\/script>`;
}

// ══════════════════════════════════════════════════
//  SERVICE PAGE
// ══════════════════════════════════════════════════
function mlsServicePage(siteId: string, gc: (k: string) => string): string {
  let serviceItems: any[] = [];
  try { serviceItems = JSON.parse(gc('services.items') || '[]'); } catch {}
  if (serviceItems.length === 0) {
    serviceItems = [
      { icon: '🔧', title: 'Expert Technicians', description: 'Factory-trained technicians with years of experience servicing all major brands.' },
      { icon: '⏱', title: 'Quick Turnaround', description: 'Most repairs completed within 48-72 hours to minimize your downtime.' },
      { icon: '🛡', title: 'Warranty Service', description: 'Authorized warranty repair center for all major equipment brands.' },
    ];
  }

  return `
  <section data-section="serviceHero" class="page-header-mls">
    <div class="container-mls">
      <h1>${gc('services.heading') || 'Equipment Service'}</h1>
      <p>${gc('services.description') || 'Professional maintenance and repair services.'}</p>
    </div>
  </section>

  <section data-section="serviceTypes" style="padding: 3rem 0;">
    <div class="container-mls">
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        ${serviceItems.map(s => `
        <div class="card-mls" style="padding: 2rem;">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">${s.icon || '🔧'}</div>
          <h3 class="font-heading" style="font-size: 1.25rem; font-weight: 600; margin: 0 0 0.75rem; color: #111827;">${s.title}</h3>
          <p style="color: #6b7280; margin: 0; line-height: 1.7; font-size: 0.9375rem;">${s.description}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <section data-section="serviceForm" style="padding: 3rem 0 4rem; background: #f9fafb;">
    <div class="container-mls">
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
        <div class="card-mls" style="padding: 2rem;">
          <h3 class="font-heading" style="font-size: 1.25rem; font-weight: 600; margin: 0 0 1.5rem; color: #111827;">Request Service</h3>
          <form onsubmit="event.preventDefault(); this.reset(); alert('Service request submitted!');">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div><label class="form-label">Name *</label><input class="form-input" required placeholder="Your name"></div>
              <div><label class="form-label">Email *</label><input class="form-input" type="email" required placeholder="your@email.com"></div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div><label class="form-label">Phone *</label><input class="form-input" type="tel" required placeholder="(555) 123-4567"></div>
              <div><label class="form-label">Equipment Type *</label>
                <select class="form-input" required>
                  <option value="">Select type</option>
                  <option>Mower</option><option>Trimmer</option><option>Blower</option><option>Chainsaw</option><option>Tractor</option><option>Other</option>
                </select>
              </div>
            </div>
            <div style="margin-bottom: 1rem;"><label class="form-label">Description of Issue *</label><textarea class="form-input" rows="5" required placeholder="Please describe the issue or service needed..."></textarea></div>
            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">Submit Service Request</button>
          </form>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          ${mlsContactSidebar(gc)}
        </div>
      </div>
    </div>
  </section>`;
}

// ══════════════════════════════════════════════════
//  CONTACT PAGE
// ══════════════════════════════════════════════════
function mlsContactPage(siteId: string, gc: (k: string) => string, weekday: string, saturday: string, sunday: string): string {
  return `
  <section data-section="contactHero" class="page-header-mls">
    <div class="container-mls">
      <h1>${gc('contact.heading') || 'Contact Us'}</h1>
      <p>${gc('contact.description') || 'We\'d love to hear from you.'}</p>
    </div>
  </section>

  <section data-section="contactForm" style="padding: 3rem 0 4rem;">
    <div class="container-mls">
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
        <div class="card-mls" style="padding: 2rem;">
          <h3 class="font-heading" style="font-size: 1.25rem; font-weight: 600; margin: 0 0 1.5rem; color: #111827;">Send Us a Message</h3>
          <form onsubmit="event.preventDefault(); this.reset(); alert('Message sent! We\\'ll be in touch.');">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div><label class="form-label">Name *</label><input class="form-input" required placeholder="Your name"></div>
              <div><label class="form-label">Email *</label><input class="form-input" type="email" required placeholder="your@email.com"></div>
            </div>
            <div style="margin-bottom: 1rem;"><label class="form-label">Phone</label><input class="form-input" type="tel" placeholder="(555) 123-4567"></div>
            <div style="margin-bottom: 1rem;"><label class="form-label">Message *</label><textarea class="form-input" rows="5" required placeholder="How can we help you?"></textarea></div>
            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">Send Message</button>
          </form>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          ${mlsContactSidebarFull(gc, weekday, saturday, sunday)}
        </div>
      </div>
    </div>
  </section>`;
}

// ══════════════════════════════════════════════════
//  RENTALS PAGE
// ══════════════════════════════════════════════════
function mlsRentalsPage(siteId: string, gc: (k: string) => string): string {
  let rentals: any[] = [];
  try { rentals = JSON.parse(gc('rentals.items') || '[]'); } catch {}
  if (rentals.length === 0) {
    rentals = [
      { name: 'Commercial Zero-Turn 60"', category: 'Mowers', daily: 150, weekly: 600, monthly: 1800, available: true, description: 'Professional zero-turn mower for large properties' },
      { name: 'Stump Grinder', category: 'Specialty', daily: 200, weekly: 800, monthly: 2400, available: true, description: 'Heavy-duty stump grinder for tree removal' },
      { name: 'Aerator - Walk Behind', category: 'Lawn Care', daily: 75, weekly: 300, monthly: 900, available: false, description: 'Core aerator for lawn health improvement' },
      { name: 'Dethatcher', category: 'Lawn Care', daily: 65, weekly: 260, monthly: 780, available: true, description: 'Power dethatcher for removing lawn thatch' },
      { name: 'Chipper/Shredder', category: 'Specialty', daily: 125, weekly: 500, monthly: 1500, available: true, description: 'Wood chipper for branch and debris cleanup' },
      { name: 'Overseed & Spreader', category: 'Lawn Care', daily: 45, weekly: 180, monthly: 540, available: true, description: 'Professional spreader for seed and fertilizer' },
    ];
  }

  return `
  <section data-section="rentalsHero" class="page-header-mls">
    <div class="container-mls">
      <h1>${gc('rentals.heading') || 'Equipment Rentals'}</h1>
      <p>${gc('rentals.description') || 'Professional equipment available for rent.'}</p>
    </div>
  </section>

  <section data-section="rentalGrid" style="padding: 2rem 0 4rem;">
    <div class="container-mls">
      <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 1.5rem;">Showing ${rentals.length} rental items</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
        ${rentals.map(r => `
        <div class="card-mls">
          <div style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <div>
                <p style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin: 0 0 0.25rem;">${r.category}</p>
                <h3 style="font-size: 1.0625rem; font-weight: 600; margin: 0; color: #111827;">${r.name}</h3>
              </div>
              <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background: ${r.available ? '#dcfce7' : '#f3f4f6'}; color: ${r.available ? '#166534' : '#6b7280'};">
                ${r.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            <p style="font-size: 0.875rem; color: #6b7280; margin: 0 0 1.25rem; line-height: 1.6;">${r.description}</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; margin-bottom: 1.25rem;">
              <div style="background: #f9fafb; border-radius: 0.5rem; padding: 0.75rem; text-align: center;">
                <p style="font-size: 1rem; font-weight: 700; color: #111827; margin: 0;">$${r.daily}</p>
                <p style="font-size: 0.75rem; color: #6b7280; margin: 0.125rem 0 0;">Daily</p>
              </div>
              <div style="background: #f9fafb; border-radius: 0.5rem; padding: 0.75rem; text-align: center;">
                <p style="font-size: 1rem; font-weight: 700; color: #111827; margin: 0;">$${r.weekly}</p>
                <p style="font-size: 0.75rem; color: #6b7280; margin: 0.125rem 0 0;">Weekly</p>
              </div>
              <div style="background: #f9fafb; border-radius: 0.5rem; padding: 0.75rem; text-align: center;">
                <p style="font-size: 1rem; font-weight: 700; color: #111827; margin: 0;">$${r.monthly}</p>
                <p style="font-size: 0.75rem; color: #6b7280; margin: 0.125rem 0 0;">Monthly</p>
              </div>
            </div>
            <button class="btn-primary" style="width: 100%; justify-content: center; ${!r.available ? 'opacity:0.5; cursor:not-allowed;' : ''}" ${!r.available ? 'disabled' : ''}>
              ${r.available ? 'Inquire Now' : 'Not Available'}
            </button>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </section>`;
}

// ══════════════════════════════════════════════════
//  MANUFACTURERS PAGE
// ══════════════════════════════════════════════════
function mlsManufacturersPage(siteId: string, gc: (k: string) => string): string {
  const logos: Record<string,string> = { 'Toro': '/images/logos/toro.png', 'Exmark': '/images/logos/exmark.png', 'ECHO': '/images/logos/Echo.png', 'Honda': '/images/logos/Honda.png', 'Husqvarna': '/images/logos/Husqvarna.png', 'Kubota': '/images/logos/kubota.jpg' };
  const brands = [
    { name: 'Toro', tagline: 'Count on it' },
    { name: 'Exmark', tagline: 'The next cut above' },
    { name: 'ECHO', tagline: 'Professional-grade outdoor power' },
    { name: 'Honda', tagline: 'The power of dreams' },
    { name: 'Husqvarna', tagline: 'Rethink the outdoors' },
    { name: 'Kubota', tagline: 'For Earth, For Life' },
  ];

  return `
  <section data-section="mfgHero" class="page-header-mls">
    <div class="container-mls">
      <h1>${gc('manufacturers.pageHeading') || 'Our Manufacturers'}</h1>
      <p>${gc('manufacturers.pageDescription') || 'Trusted brands we proudly represent.'}</p>
    </div>
  </section>

  <section data-section="manufacturersList" style="padding: 3rem 0 4rem;">
    <div class="container-mls">
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem;">
        ${brands.map(b => `
        <div class="card-mls" style="padding: 2rem; text-align: center;">
          <div style="height: 4rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
            <img src="${logos[b.name] || ''}" alt="${b.name}" style="height: 48px; width: auto;">
          </div>
          ${b.tagline ? `<p style="color: #6b7280; font-size: 0.875rem; margin: 0;">${b.tagline}</p>` : ''}
        </div>`).join('')}
      </div>
    </div>
  </section>`;
}

// ── Shared Sidebar Helpers ──
function mlsContactSidebar(gc: (k: string) => string): string {
  const phone = gc('business.phone');
  const email = gc('business.email');
  const address = gc('business.address');
  return `
  <div class="card-mls" style="padding: 1.5rem;">
    <h4 class="font-heading" style="font-size: 1.0625rem; font-weight: 600; margin: 0 0 1rem; color: #111827;">Contact Information</h4>
    <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9375rem; color: #6b7280;">
      ${phone ? `<a href="tel:${phone}" style="display:flex;align-items:center;gap:0.5rem;color:#6b7280;text-decoration:none;"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>${phone}</a>` : ''}
      ${email ? `<a href="mailto:${email}" style="display:flex;align-items:center;gap:0.5rem;color:#6b7280;text-decoration:none;"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>${email}</a>` : ''}
      ${address ? `<span style="display:flex;align-items:flex-start;gap:0.5rem;"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="flex-shrink:0;margin-top:2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>${address}</span>` : ''}
    </div>
  </div>`;
}

function mlsContactSidebarFull(gc: (k: string) => string, weekday: string, saturday: string, sunday: string): string {
  const name = gc('business.name') || 'Modern Lawn Solutions';
  const phone = gc('business.phone');
  const email = gc('business.email');
  const address = gc('business.address');
  return `
  <div class="card-mls" style="padding: 1.5rem;">
    <h4 class="font-heading" style="font-size: 1.0625rem; font-weight: 600; margin: 0 0 1rem; color: #111827;">${name}</h4>
    <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.9375rem; color: #6b7280;">
      ${phone ? `<a href="tel:${phone}" style="display:flex;align-items:center;gap:0.5rem;color:#6b7280;text-decoration:none;"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>${phone}</a>` : ''}
      ${email ? `<a href="mailto:${email}" style="display:flex;align-items:center;gap:0.5rem;color:#6b7280;text-decoration:none;"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>${email}</a>` : ''}
      ${address ? `<span style="display:flex;align-items:flex-start;gap:0.5rem;"><svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="flex-shrink:0;margin-top:2px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>${address}</span>` : ''}
    </div>
  </div>
  <div class="card-mls" style="padding: 1.5rem;">
    <h4 class="font-heading" style="font-size: 1.0625rem; font-weight: 600; margin: 0 0 1rem; color: #111827; display: flex; align-items: center; gap: 0.5rem;">
      <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      Business Hours
    </h4>
    <div style="font-size: 0.875rem; color: #6b7280; display: flex; flex-direction: column; gap: 0.375rem;">
      <div style="display: flex; justify-content: space-between;"><span>Mon - Fri</span><span style="font-weight:500;color:#111827;">${weekday}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>Saturday</span><span style="font-weight:500;color:#111827;">${saturday}</span></div>
      <div style="display: flex; justify-content: space-between;"><span>Sunday</span><span style="font-weight:500;color:#111827;">${sunday}</span></div>
    </div>
  </div>
  <div class="card-mls" style="padding: 0;">
    <div style="height: 200px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border-radius: 0.75rem;">
      <div style="text-align: center; color: #9ca3af;">
        <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin: 0 auto 0.5rem;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <p style="font-size: 0.875rem; margin: 0;">Map placeholder</p>
      </div>
    </div>
  </div>`;
}
