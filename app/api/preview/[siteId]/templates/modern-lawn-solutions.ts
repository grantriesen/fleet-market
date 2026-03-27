// ─── Modern Lawn Solutions ── Standalone Template ────────────────────────
// Design: Emerald green primary (#10b981), clean minimalist, rounded cards.
//         Inter headings (700), Inter body (400). Split-layout hero,
//         shadcn-inspired card system, muted gray backgrounds.
// ─────────────────────────────────────────────────────────────────────────

import { sharedPreviewScript, injectCartSystem, serviceFormHtml } from './shared';
import { rentalModalBlock, rentalReserveButton } from './shared-rental';

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
export async function renderModernLawnPage(
  siteId: string,
  currentPage: string,
  pages: any[],
  products: any[],
  config: any,
  customizations: any,
  enabledFeatures: Set<string>,
  vis: Record<string, boolean>,
  content?: Record<string, string>,
  supabase?: any,
  baseUrl: string = '',
  siteAddons: string[] = [],
  checkoutMode: string = 'quote_only',
  stripeConnected: boolean = false,
  manufacturers: any[] = []
) {
  // Content resolution: passed content (from route) > customizations > config > demo overrides
  const MLS_KEY_ALIASES: Record<string,string> = {
    'business.name':    'businessInfo.businessName',
    'business.phone':   'businessInfo.phone',
    'business.email':   'businessInfo.email',
    'business.address': 'businessInfo.address',
    'business.tagline': 'businessInfo.tagline',
    'business.hours':   'hours.hours',
  };
  const getContent = (key: string): string => {
    if (content?.[key]) return content[key];
    const alias = MLS_KEY_ALIASES[key];
    if (alias && content?.[alias]) return content[alias];
    if (customizations?.content?.[key]) return customizations.content[key];
    if (config?.content?.[key]) return config.content[key];
    const parts = key.split('.');
    if (parts.length === 2) {
      const [section, field] = parts;
      const val = config?.sections?.[section]?.[field]?.default;
      if (val) return val;
    }
    if (alias) { const ap = alias.split('.'); if (ap.length === 2) { const v = config?.sections?.[ap[0]]?.[ap[1]]?.default; if (v) return v; } }
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
    case 'home': case 'index': body = await mlsHome(siteId, getContent, products, vis, colors, fmtPrice, supabase, baseUrl, manufacturers || []); break;
    case 'service': body = mlsServicePage(siteId, getContent, baseUrl); break;
    case 'contact': body = mlsContactPage(siteId, getContent, weekdayHours, saturdayHours, sundayHours, baseUrl); break;
    case 'inventory': body = mlsInventoryPage(siteId, getContent, products, fmtPrice, baseUrl); break;
    case 'rentals': body = await mlsRentalsPage(siteId, getContent, baseUrl, supabase, enabledFeatures.has('rental_scheduling') || siteAddons.includes('rentals')); break;
    case 'manufacturers': body = mlsManufacturersPage(siteId, getContent, baseUrl, manufacturers || []); break;
    default: body = await mlsHome(siteId, getContent, products, vis, colors, fmtPrice, supabase, baseUrl, manufacturers || []); break;
  }

  return mlsHtmlShell(
    getContent('business.name') || 'Modern Lawn Solutions',
    fonts,
    colors,
    siteId,
    currentPage,
    mlsHeader(siteId, currentPage, pages, getContent, colors, baseUrl) +
    body +
    mlsFooter(siteId, pages, getContent, weekdayHours, saturdayHours, sundayHours, baseUrl),
    enabledFeatures,
    checkoutMode,
    stripeConnected
  );
}

// ── HTML Shell ──
function mlsHtmlShell(title: string, fonts: any, colors: any, siteId: string, page: string, body: string, enabledFeatures?: Set<string>, checkoutMode: string = 'quote_only', stripeConnected: boolean = false) {
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
  ${enabledFeatures?.has('rental_scheduling') ? rentalModalBlock('fm', siteId) : ''}
  ${injectCartSystem(siteId, checkoutMode, colors.primary)}
</body>
</html>`;
}

// ── Header ──
function mlsHeader(siteId: string, currentPage: string, pages: any[], getContent: (k: string) => string, colors: any,
  baseUrl: string = ''
) {
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
      <a href="${baseUrl}home" style="text-decoration: none; font-size: 1.25rem; font-weight: 700; color: ${colors.primary};" class="font-heading">
        ${businessName}
      </a>
      <nav class="mls-desktop-nav" style="display: flex; align-items: center; gap: 1.5rem;">
        ${navItems.map(n => {
          const isActive = currentPage === n.slug || (currentPage === 'index' && n.slug === 'home');
          return `<a href="${baseUrl}${n.slug}" style="font-size: 0.875rem; font-weight: 500; text-decoration: none; color: ${isActive ? colors.primary : '#6b7280'}; transition: color 0.2s;" onmouseover="this.style.color='${colors.primary}'" onmouseout="this.style.color='${isActive ? colors.primary : '#6b7280'}'">${n.label}</a>`;
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
        return `<a href="${baseUrl}${n.slug}" style="display:block;padding:0.5rem 0;font-size:0.9375rem;font-weight:500;text-decoration:none;color:${isActive ? colors.primary : '#374151'};">${n.label}</a>`;
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
function mlsFooter(siteId: string, pages: any[], getContent: (k: string) => string, weekday: string, saturday: string, sunday: string,
  baseUrl: string = ''
) {
  const name = getContent('business.name') || 'Modern Lawn Solutions';
  const phone = getContent('business.phone');
  const email = getContent('business.email');
  const address = getContent('business.address');
  const tagline = getContent('footer.tagline');
  const fb = getContent('social.facebook');
  const ig = getContent('social.instagram');
  const yt = getContent('social.youtube');

  // Use available pages array so footer respects page visibility

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
            ${pages.map((p: any) => `<a href="${baseUrl}${p.slug}" style="font-size: 0.875rem; color: #9ca3af; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#9ca3af'">${p.name}</a>`).join('')}
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
            ${['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => {
              const h = getContent('hours.' + day);
              if (!h) return '';
              const label = day.charAt(0).toUpperCase() + day.slice(1);
              return '<div style="display: flex; justify-content: space-between; gap: 1rem;"><span>' + label + '</span><span>' + h + '</span></div>';
            }).filter(Boolean).join('')}
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
async function mlsHome(siteId: string, gc: (k: string) => string, products: any[], vis: Record<string, boolean>, colors: any, fmtPrice: (p: number | null) => string, supabase?: any,
  baseUrl: string = '',
  manufacturers: any[] = []
): Promise<string> {
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
              <a href="${gc('hero.button1.destination') === '__custom' ? gc('hero.button1.destination_url') : `${baseUrl}${gc('hero.button1.destination') || 'inventory'}`}" class="btn-primary">${gc('hero.button1.text') || 'Browse Equipment'} <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
              <a href="${gc('hero.button2.destination') === '__custom' ? gc('hero.button2.destination_url') : `${baseUrl}${gc('hero.button2.destination') || 'contact'}`}" class="btn-outline">${gc('hero.button2.text') || 'Contact Us'}</a>
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
                <a href="${baseUrl}inventory" style="font-size: 0.8125rem; font-weight: 600; color: ${colors.primary}; text-decoration: none;">View Details</a>
              </div>
            </div>
          </div>`).join('')}
        </div>
        <div style="text-align: center; margin-top: 2.5rem;">
          <a href="${gc('featured.button1.destination') === '__custom' ? gc('featured.button1.destination_url') : `${baseUrl}${gc('featured.button1.destination') || 'inventory'}`}" class="btn-outline">${gc('featured.button1.text') || 'View All Equipment'} <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
        </div>
      </div>
    </section>`;
  }

  // ── Manufacturers ──
  if (vis.manufacturers !== false) {
    const mfgToShow = manufacturers.length > 0 ? manufacturers.slice(0, 6) : [];
    if (mfgToShow.length > 0) {
      html += `
    <section data-section="manufacturers" style="padding: 5rem 0; background: #f9fafb;">
      <div class="container-mls">
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 class="font-heading" style="font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem; color: #111827;">${gc('manufacturers.heading') || 'Authorized Dealer'}</h2>
          <p style="color: #6b7280; margin: 0;">${gc('manufacturers.subheading') || "We carry the industry's leading brands"}</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 1rem;">
          ${mfgToShow.map((m: any) => {
            const logoSrc = m.logo_url || m.logoUrl || m.logo || m.image_url || '';
            return `
          <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; transition: box-shadow 0.3s;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow='none'">
            ${logoSrc ? `<img src="${logoSrc}" alt="${m.name}" loading="lazy" style="height: 44px; width: auto; margin-bottom: 0.5rem;">` : `<span style="font-weight: 600; color: #374151; font-size: 0.875rem;">${m.name}</span>`}
          </div>`;
          }).join('')}
        </div>
        <div style="text-align: center; margin-top: 2.5rem;">
          <a href="${baseUrl}manufacturers" class="btn-outline">View All Brands <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
        </div>
      </div>
    </section>`;
    }
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
        <div style="text-align: center; margin-bottom: 3rem;">
          <h2 class="font-heading" style="font-size: 2rem; font-weight: 700; margin: 0 0 0.5rem; color: #111827;">${gc('testimonials.heading') || 'What Our Customers Say'}</h2>
        </div>
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
        <a href="${baseUrl}${gc('cta.button.destination') || gc('cta.ctaLink') || 'contact'}" style="display: inline-block; background: #fff; color: ${colors.primary}; padding: 0.875rem 2rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600;">${gc('cta.button.text') || gc('cta.ctaText') || gc('cta.button') || 'Contact Us Today'}</a>
      </div>
    </section>`;
  }

  return html;
}

// ══════════════════════════════════════════════════
//  INVENTORY PAGE
// ══════════════════════════════════════════════════
function mlsInventoryPage(siteId: string, gc: (k: string) => string, products: any[], fmtPrice: (p: number | null) => string,
  baseUrl: string = ''
): string {
  const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))];

  return `
  ${(() => {
    const _img = gc('inventoryPage.heroImage');
    return _img
      ? `<section data-section="inventoryHero" style="padding:3rem 0;text-align:center;position:relative;background-image:url('${_img}');background-size:cover;background-position:center;"><div style="position:absolute;inset:0;background:rgba(17,24,39,0.65);"></div><div class="container-mls" style="position:relative;z-index:1;"><h1 style="font-size:2.25rem;font-weight:700;color:#fff;margin:0;">${gc('inventoryPage.heading') || gc('inventory.heading') || 'Equipment Inventory'}</h1><p style="color:rgba(255,255,255,0.85);margin-top:0.5rem;font-size:1.0625rem;">${gc('inventoryPage.subheading') || gc('inventory.description') || 'Browse our complete selection of lawn care equipment.'}</p></div></section>`
      : `<section data-section="inventoryHero" class="page-header-mls"><div class="container-mls"><h1>${gc('inventoryPage.heading') || gc('inventory.heading') || 'Equipment Inventory'}</h1><p>${gc('inventoryPage.subheading') || gc('inventory.description') || 'Browse our complete selection of lawn care equipment.'}</p></div></section>`;
  })()}

  <section data-section="inventoryGrid" style="padding: 2rem 0 4rem;">
    <div class="container-mls">
      ${gc('inventoryPage.contentHeading') ? `<h2 style="font-size: 1.5rem; font-weight: 700; margin: 0 0 0.75rem; color: #111827;">${gc('inventoryPage.contentHeading')}</h2>` : ''}
      ${gc('inventoryPage.contentText') ? `<p style="color: #6b7280; margin: 0 0 1.5rem; line-height: 1.7;">${gc('inventoryPage.contentText')}</p>` : ''}
      <!-- Filters Row -->
      <div style="display: flex; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; align-items: center;">
        <div style="position: relative; flex: 1; max-width: 400px;">
          <svg width="16" height="16" fill="none" stroke="#9ca3af" stroke-width="2" viewBox="0 0 24 24" style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search equipment..." class="form-input" style="padding-left: 2.25rem;" id="mls-search">
        </div>
        ${categories.length > 0 ? `
        <select class="form-input" style="width: auto; min-width: 180px;" id="mls-cat-filter">
          <option value="">${gc('inventoryPage.filterLabel') || 'All Categories'}</option>
          ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
        </select>` : ''}
      </div>

      <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 1.5rem;">Showing ${products.length} products</p>

      <!-- Products Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem;">
        ${products.map((p: any) => `
        <div class="card-mls" data-category="${p.category || ''}" data-title="${(p.title || '').toLowerCase()}" style="cursor:pointer;" onclick="fmOpenProduct(${JSON.stringify({id:p.id,title:p.title,description:p.description,price:p.price,sale_price:p.sale_price,primary_image:p.primary_image,category:p.category,model:p.model,slug:p.slug}).replace(/"/g,'&quot;')})">
          <div style="height: 200px; overflow: hidden;">
            ${p.primary_image ? `<img src="${p.primary_image}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;" loading="lazy">` : `<div style="width:100%;height:100%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#9ca3af;">No Image</div>`}
          </div>
          <div style="padding: 1.25rem;">
            <p style="font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin: 0 0 0.25rem;">${p.category || ''}</p>
            <h3 style="font-size: 1rem; font-weight: 600; margin: 0 0 0.375rem; color: #111827;">${p.title}</h3>
            <p style="font-size: 0.875rem; color: #6b7280; margin: 0 0 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${p.description || ''}</p>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              ${p.price ? `<span style="font-size: 1.125rem; font-weight: 700; color: #111827;">${fmtPrice(p.price)}</span>` : '<span style="font-size:0.875rem;color:#6b7280;">Call for Price</span>'}
              <span style="font-size:0.8125rem;font-weight:600;color:var(--color-primary, #16a34a);">View Details →</span>
            </div>
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
function mlsServicePage(siteId: string, gc: (k: string) => string,
  baseUrl: string = ''
): string {
  let serviceItems: any[] = [];
  const ms1t = gc('servicePage.service1Title'); const ms1d = gc('servicePage.service1Text') || gc('servicePage.service1Description');
  const ms2t = gc('servicePage.service2Title'); const ms2d = gc('servicePage.service2Text') || gc('servicePage.service2Description');
  const ms3t = gc('servicePage.service3Title'); const ms3d = gc('servicePage.service3Text') || gc('servicePage.service3Description');
  if (ms1t || ms2t || ms3t) {
    serviceItems = [
      ms1t ? { icon: '🔧', title: ms1t, description: ms1d } : null,
      ms2t ? { icon: '⏱', title: ms2t, description: ms2d } : null,
      ms3t ? { icon: '🛡', title: ms3t, description: ms3d } : null,
    ].filter(Boolean);
  } else {
    try { serviceItems = JSON.parse(gc('services.items') || '[]'); } catch {}
    if (serviceItems.length === 0) {
      serviceItems = [
        { icon: '🔧', title: 'Expert Technicians', description: 'Factory-trained technicians with years of experience servicing all major brands.' },
        { icon: '⏱', title: 'Quick Turnaround', description: 'Most repairs completed within 48-72 hours to minimize your downtime.' },
        { icon: '🛡', title: 'Warranty Service', description: 'Authorized warranty repair center for all major equipment brands.' },
      ];
    }
  }

  return `
  ${(() => {
    const _img = gc('servicePage.heroImage');
    return _img
      ? `<section data-section="serviceHero" style="padding:3rem 0;text-align:center;position:relative;background-image:url('${_img}');background-size:cover;background-position:center;"><div style="position:absolute;inset:0;background:rgba(17,24,39,0.65);"></div><div class="container-mls" style="position:relative;z-index:1;"><h1 style="font-size:2.25rem;font-weight:700;color:#fff;margin:0;">${gc('servicePage.heading') || gc('services.heading') || 'Equipment Service'}</h1><p style="color:rgba(255,255,255,0.85);margin-top:0.5rem;font-size:1.0625rem;">${gc('servicePage.subheading') || gc('services.description') || 'Professional maintenance and repair services.'}</p></div></section>`
      : `<section data-section="serviceHero" class="page-header-mls"><div class="container-mls"><h1>${gc('servicePage.heading') || gc('services.heading') || 'Equipment Service'}</h1><p>${gc('servicePage.subheading') || gc('services.description') || 'Professional maintenance and repair services.'}</p></div></section>`;
  })()}

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
          <form onsubmit="event.preventDefault(); fmSubmitForm(this, '${siteId}', 'service', function(f){var s=f.querySelector('select');return s?{equipment_type:s.value}:null;});">
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
function mlsContactPage(siteId: string, gc: (k: string) => string, weekday: string, saturday: string, sunday: string,
  baseUrl: string = ''
): string {
  return `
  ${(() => {
    const _img = gc('contactPage.heroImage');
    return _img
      ? `<section data-section="contactHero" style="padding:3rem 0;text-align:center;position:relative;background-image:url('${_img}');background-size:cover;background-position:center;"><div style="position:absolute;inset:0;background:rgba(17,24,39,0.65);"></div><div class="container-mls" style="position:relative;z-index:1;"><h1 style="font-size:2.25rem;font-weight:700;color:#fff;margin:0;">${gc('contactPage.heading') || gc('contact.heading') || 'Contact Us'}</h1><p style="color:rgba(255,255,255,0.85);margin-top:0.5rem;font-size:1.0625rem;">${gc('contactPage.subheading') || gc('contact.description') || "We'd love to hear from you."}</p></div></section>`
      : `<section data-section="contactHero" class="page-header-mls"><div class="container-mls"><h1>${gc('contactPage.heading') || gc('contact.heading') || 'Contact Us'}</h1><p>${gc('contactPage.subheading') || gc('contact.description') || "We'd love to hear from you."}</p></div></section>`;
  })()}

  <section data-section="contactForm" style="padding: 3rem 0 4rem;">
    <div class="container-mls">
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
        <div class="card-mls" style="padding: 2rem;">
          <h3 class="font-heading" style="font-size: 1.25rem; font-weight: 600; margin: 0 0 1.5rem; color: #111827;">${gc('contactPage.formHeading') || 'Send Us a Message'}</h3>
          <form onsubmit="event.preventDefault(); fmSubmitForm(this, '${siteId}', 'contact', null);">>
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
      ${gc('contactPage.mapEmbed') ? `<div style="margin-top: 2rem; border-radius: 0.75rem; overflow: hidden; border: 1px solid #e5e7eb;">${gc('contactPage.mapEmbed')}</div>` : ''}
    </div>
  </section>`;
}

// ══════════════════════════════════════════════════
//  RENTALS PAGE
// ══════════════════════════════════════════════════
async function mlsRentalsPage(
  siteId: string,
  gc: (k: string) => string,
  baseUrl: string = '',
  supabase?: any,
  hasRentalFeature: boolean = false
): Promise<string> {
  const heading = gc('rentalsPage.heading') || gc('rentals.heading') || 'Equipment Rentals';
  const subheading = gc('rentalsPage.subheading') || gc('rentals.description') || 'Professional equipment available for rent.';

  let inventorySection = '';
  if (supabase && hasRentalFeature) {
    const { data: rentals } = await supabase
      .from('rental_inventory').select('*').eq('site_id', siteId)
      .eq('status', 'available').order('display_order');
    if (rentals && rentals.length > 0) {
      inventorySection = `
      <section data-section="rentalGrid" style="padding:2rem 0 4rem;">
        <div class="container-mls">
          <p style="font-size:0.875rem;color:#6b7280;margin-bottom:1.5rem;">Showing ${rentals.length} rental item${rentals.length !== 1 ? 's' : ''}</p>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem;">
            ${rentals.map((item: any) => `
        <div style="border:1px solid #e5e7eb;border-radius:0.5rem;overflow:hidden;background:white;">
          <div style="aspect-ratio:4/3;overflow:hidden;position:relative;background:#f3f4f6;">
            ${item.primary_image ? `<img src="${item.primary_image}" alt="${item.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;">&#x1F69C;</div>`}
            ${!item.quantity_available || item.quantity_available === 0 ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;"><span style="background:#dc2626;color:white;padding:0.375rem 1rem;font-weight:700;font-size:0.875rem;">Currently Rented</span></div>` : `<span style="position:absolute;top:0.75rem;right:0.75rem;background:#16a34a;color:white;font-size:0.75rem;font-weight:700;padding:0.25rem 0.5rem;border-radius:0.25rem;">${item.quantity_available} Available</span>`}
          </div>
          <div style="padding:1.25rem;">
            <p style="font-size:0.75rem;font-weight:600;text-transform:uppercase;color:#6b7280;margin:0 0 0.375rem;">${item.category || 'Rental'}</p>
            <h3 style="font-size:1rem;font-weight:700;color:#111827;margin:0 0 0.375rem;">${item.title}</h3>
            ${item.description ? `<p style="font-size:0.875rem;color:#6b7280;margin:0 0 0.75rem;line-height:1.5;">${item.description.substring(0,100)}</p>` : ''}
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin-bottom:0.75rem;text-align:center;background:#f9fafb;border-radius:0.375rem;padding:0.625rem;">
              ${item.daily_rate ? `<div><p style="font-size:0.7rem;color:#6b7280;text-transform:uppercase;margin:0;">Daily</p><p style="font-weight:700;color:#16a34a;margin:0;">$${item.daily_rate}</p></div>` : ''}
              ${item.weekly_rate ? `<div><p style="font-size:0.7rem;color:#6b7280;text-transform:uppercase;margin:0;">Weekly</p><p style="font-weight:700;color:#16a34a;margin:0;">$${item.weekly_rate}</p></div>` : ''}
              ${item.monthly_rate ? `<div><p style="font-size:0.7rem;color:#6b7280;text-transform:uppercase;margin:0;">Monthly</p><p style="font-weight:700;color:#16a34a;margin:0;">$${item.monthly_rate}</p></div>` : ''}
            </div>
            ${item.quantity_available > 0
              ? rentalReserveButton(item, 'fm', 'block w-full text-center cta-button rounded-md text-sm py-2 cursor-pointer border-0')
              : `<button disabled style="display:block;width:100%;padding:0.625rem;background:#e5e7eb;color:#9ca3af;border:none;border-radius:0.375rem;font-weight:600;cursor:not-allowed;">Currently Unavailable</button>`
            }
          </div>
        </div>`).join('')}
          </div>
        </div>
      </section>
      

  <!-- Rental Booking Modal (fm) -->
  <script src="/fm-rental-datepicker.js"></script>
`;
    }
  }

  const _img = gc('rentalsPage.heroImage');
  const heroSection = _img
    ? `<section data-section="rentalsHero" style="padding:3rem 0;text-align:center;position:relative;background-image:url('${_img}');background-size:cover;background-position:center;"><div style="position:absolute;inset:0;background:rgba(17,24,39,0.65);"></div><div class="container-mls" style="position:relative;z-index:1;"><h1 style="font-size:2.25rem;font-weight:700;color:#fff;margin:0;">${heading}</h1><p style="color:rgba(255,255,255,0.85);margin-top:0.5rem;font-size:1.0625rem;">${subheading}</p></div></section>`
    : `<section data-section="rentalsHero" class="page-header-mls"><div class="container-mls"><h1>${heading}</h1><p>${subheading}</p></div></section>`;

  const fallback = !inventorySection ? `
  <section data-section="rentalGrid" style="padding:4rem 0;text-align:center;">
    <div class="container-mls">
      <p style="color:#6b7280;margin-bottom:1.5rem;">Contact us for current rental availability and pricing.</p>
      <a href="${baseUrl}contact" class="btn-primary">Contact Us for Rentals</a>
    </div>
  </section>` : '';

  return heroSection + (inventorySection || fallback);
}
// ══════════════════════════════════════════════════
//  MANUFACTURERS PAGE
// ══════════════════════════════════════════════════
function mlsManufacturersPage(siteId: string, gc: (k: string) => string,
  baseUrl: string = '',
  manufacturers: any[] = []
): string {
  const brandsToShow = manufacturers.length > 0 ? manufacturers : [];

  return `
  ${(() => {
    const _img = gc('manufacturersPage.heroImage');
    return _img
      ? `<section data-section="mfgHero" style="padding:3rem 0;text-align:center;position:relative;background-image:url('${_img}');background-size:cover;background-position:center;"><div style="position:absolute;inset:0;background:rgba(17,24,39,0.65);"></div><div class="container-mls" style="position:relative;z-index:1;"><h1 style="font-size:2.25rem;font-weight:700;color:#fff;margin:0;">${gc('manufacturersPage.heading') || gc('manufacturers.pageHeading') || 'Our Manufacturers'}</h1><p style="color:rgba(255,255,255,0.85);margin-top:0.5rem;font-size:1.0625rem;">${gc('manufacturersPage.subheading') || gc('manufacturers.pageDescription') || 'Trusted brands we proudly represent.'}</p></div></section>`
      : `<section data-section="mfgHero" class="page-header-mls"><div class="container-mls"><h1>${gc('manufacturersPage.heading') || gc('manufacturers.pageHeading') || 'Our Manufacturers'}</h1><p>${gc('manufacturersPage.subheading') || gc('manufacturers.pageDescription') || 'Trusted brands we proudly represent.'}</p></div></section>`;
  })()}

  <section data-section="manufacturersList" style="padding: 3rem 0 4rem;">
    <div class="container-mls">
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem;">
        ${brandsToShow.map((b: any) => {
          const logoSrc = b.logo_url || b.logoUrl || b.logo || b.image_url || '';
          return `
        <div class="card-mls" style="padding: 2rem; text-align: center;">
          <div style="height: 4rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
            ${logoSrc
              ? `<img src="${logoSrc}" alt="${b.name}" loading="lazy" style="max-height: 48px; max-width: 120px; width: auto; object-fit: contain;">`
              : `<span style="font-weight: 700; color: #111827; font-size: 1rem;">${b.name}</span>`}
          </div>
          ${b.tagline || b.description ? `<p style="color: #6b7280; font-size: 0.875rem; margin: 0 0 1rem;">${b.tagline || b.description}</p>` : ''}
          <a href="${baseUrl}contact" style="display:inline-flex;align-items:center;gap:0.25rem;font-size:0.875rem;font-weight:600;color:var(--color-primary);text-decoration:none;">Learn More →</a>
        </div>`;
        }).join('')}
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
