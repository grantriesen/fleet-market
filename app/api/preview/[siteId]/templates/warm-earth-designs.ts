// ─── Warm Earth Designs ── Standalone Template ───────────────────────────
// Design: Rich brown primary (#78350f), forest green secondary (#065f46),
//         warm amber accent (#d97706), cream background (#fef3c7).
//         Merriweather headings (serif), Lato body. Rounded-2xl cards,
//         wood texture overlays, organic/rustic aesthetic.
// ─────────────────────────────────────────────────────────────────────────

import { sharedPreviewScript, injectCartSystem } from './shared';
import { rentalModalBlock, rentalReserveButton } from './shared-rental';
import { serviceBookingSection } from './product-modal';

// Helper: render emoji OR circular image
function weIcon(val: string, fallback: string, size = '2rem') {
  const isUrl = val && (val.startsWith('http') || val.startsWith('/'));
  const display = val || fallback;
  if (isUrl) return `<img src="${display}" alt="" style="width:${size};height:${size};object-fit:cover;border-radius:9999px;">`;
  return display;
}

/* ── DEMO overrides ── */
export const WARM_EARTH_DEMO_OVERRIDES: Record<string, string> = {
  'business.name': 'Heartland Outdoor Equipment',
  'business.phone': '(217) 555-0183',
  'business.email': 'hello@heartlandoutdoor.com',
  'business.address': '440 Main Street, Springfield, IL 62701',
  'business.hours': JSON.stringify({
    monday: { open: '07:00', close: '17:00' }, tuesday: { open: '07:00', close: '17:00' },
    wednesday: { open: '07:00', close: '17:00' }, thursday: { open: '07:00', close: '17:00' },
    friday: { open: '07:00', close: '17:00' }, saturday: { open: '08:00', close: '16:00' },
    sunday: { open: '', close: '' },
  }),
  'social.facebook': 'https://facebook.com/heartlandoutdoor',
  'social.instagram': 'https://instagram.com/heartlandoutdoor',
  'social.youtube': 'https://youtube.com/heartlandoutdoor',
  'hero.heading': 'OUTDOOR EQUIPMENT FOR THE MODERN HOMESTEADER',
  'hero.subheading': 'Quality tools and equipment for your land, lifestyle, and legacy.',
  'hero.ctaPrimary': 'Shop Equipment',
  'hero.ctaSecondary': 'View Rentals',
  'hero.image': '/images/hero-mower.jpg',
  'hero.badge': 'Family-Owned Since 1985',
  'featured.heading': 'Featured Equipment',
  'featured.subheading': 'Hand-picked essentials for your property',
  'manufacturers.heading': 'Trusted Brands',
  'manufacturers.subheading': 'We partner with manufacturers who share our values',
  'testimonials.heading': 'From Our Community',
  'testimonials.items': JSON.stringify([
    { name: 'Robert Mitchell', location: 'Timber Creek, MT', content: 'These folks know their equipment. They helped me find the perfect tractor for my 40 acres and have been there for every service since.', rating: 5 },
    { name: 'Sarah Thompson', location: 'Pine Ridge, MT', content: 'The rental program saved us thousands. We tried three different mowers before buying the one that was right for our property.', rating: 5 },
    { name: 'James & Maria Garcia', location: 'Valley View, MT', content: 'Family-run businesses like this are rare. They treat us like neighbors, not customers. That means everything out here.', rating: 5 },
  ]),
  'cta.heading': 'Ready to Gear Up?',
  'cta.subheading': 'Visit our showroom and talk with folks who know the land.',
  'cta.button': 'Visit Us Today',
  'footer.tagline': 'Your trusted partner for outdoor living',
  'services.heading': 'Service & Repair',
  'services.description': 'We keep your equipment running strong.',
  'services.items': JSON.stringify([
    { icon: '🔧', title: 'Routine Maintenance', description: 'Oil changes, filter replacements, blade sharpening, and seasonal tune-ups.' },
    { icon: '⚙️', title: 'Engine Repair', description: 'Complete engine diagnostics and repair for all major brands.' },
    { icon: '💧', title: 'Hydraulic Service', description: 'Hydraulic system repair, hose replacement, and fluid service.' },
    { icon: '⚡', title: 'Electrical Diagnostics', description: 'Troubleshooting and repair of electrical systems and components.' },
    { icon: '🔥', title: 'Welding & Fabrication', description: 'Custom fabrication, structural repairs, and implement modifications.' },
    { icon: '🚚', title: 'Pickup & Delivery', description: 'We\'ll pick up your equipment and deliver it when repairs are complete.' },
  ]),
  'contact.heading': 'Get In Touch',
  'contact.description': 'Stop by, call, or drop us a line.',
  'inventory.heading': 'Our Equipment',
  'inventory.description': 'Browse our selection of quality outdoor equipment.',
  'rentals.heading': 'Equipment Rentals',
  'rentals.description': 'Try before you buy, or rent for your next project.',
  'rentals.items': JSON.stringify([
    { name: 'Compact Tractor', category: 'Tractors', daily: 175, weekly: 875, description: '25HP compact tractor with loader attachment' },
    { name: 'Zero-Turn Mower', category: 'Mowers', daily: 125, weekly: 625, description: '54" commercial zero-turn mower' },
    { name: 'Wood Chipper', category: 'Power Equipment', daily: 95, weekly: 475, description: '6" capacity wood chipper/shredder' },
    { name: 'Post Hole Digger', category: 'Attachments', daily: 75, weekly: 375, description: 'Tractor-mounted auger with multiple bit sizes' },
  ]),
  'manufacturers.pageHeading': 'Our Partner Brands',
  'manufacturers.pageDescription': 'Quality manufacturers we\'re proud to represent.',
};

export const WARM_EARTH_SAMPLE_PRODUCTS = [
  { id: 'demo-p1', title: 'TimeCutter\u00ae MyRIDE\u00ae 54" Zero Turn Mower', description: '54 in. TimeCutter MyRIDE Zero Turn Mower with Smart Speed technology.', price: 5199, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/75757-1.jpeg', model: '75757', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-timecutter-myride-54', featured: true, status: 'available' },
  { id: 'demo-p2', title: 'Z Master Revolution 60" Commercial Mower', description: 'Commercial zero-turn with 60 in. TURBO FORCE deck and Horizon Technology.', price: 44443, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/1-22.png', model: 'Z Master Revolution', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-z-master-revolution-60', featured: true, status: 'available' },
  { id: 'demo-p3', title: 'GrandStand\u00ae 52" Stand-On Mower', description: '52 in. stand-on mower with 22 HP Kohler engine and TURBO FORCE deck.', price: 13443, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/74513.jpeg', model: 'GrandStand 74513', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-grandstand-52', featured: true, status: 'available' },
  { id: 'demo-p4', title: '30" TurfMaster\u00ae HDX Walk-Behind', description: '30 in. commercial walk-behind with Kawasaki engine and blade brake clutch.', price: 3110, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/22215-1.jpeg', model: 'TurfMaster HDX 22215', year: 2025, category: 'Mowers', condition: 'new', slug: 'toro-turfmaster-hdx-30', featured: true, status: 'available' },
  { id: 'demo-p5', title: '60V Brushless String Trimmer', description: '14/16 in. dual-line trimmer head with brushless motor. 2.5Ah battery included.', price: 229, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/1-4.png', model: '51836T', year: 2025, category: 'Trimmers', condition: 'new', slug: 'toro-60v-string-trimmer', featured: false, status: 'available' },
  { id: 'demo-p6', title: '60V MAX Brushless Leaf Blower', description: '120 mph max air speed brushless handheld blower. 2.5Ah battery included.', price: 229, sale_price: null, primary_image: 'http://southbayturfequip.turfstar.com/wp-content/uploads/2024/07/120.png', model: '51820', year: 2025, category: 'Blowers', condition: 'new', slug: 'toro-60v-leaf-blower', featured: false, status: 'available' },
];

// ── Main Render ──
export async function renderWarmEarthPage(
  siteId: string, currentPage: string, pages: any[], products: any[],
  config: any, customizations: any, enabledFeatures: Set<string>,
  vis: Record<string, boolean>, content?: Record<string, string>,
  manufacturers: any[] = [],
  baseUrl: string = `/api/preview/${siteId}?page=`,
  supabase?: any,
  siteAddons: string[] = [],
  checkoutMode: string = 'quote_only',
  stripeConnected: boolean = false
) {
  const WE_KEY_ALIASES: Record<string,string> = {
    'business.name':    'businessInfo.businessName',
    'business.phone':   'businessInfo.phone',
    'business.email':   'businessInfo.email',
    'business.address': 'businessInfo.address',
    'business.tagline': 'businessInfo.tagline',
  };
  const gc = (key: string): string => {
    if (content?.[key]) return content[key];
    const alias = WE_KEY_ALIASES[key];
    if (alias && content?.[alias]) return content[alias];
    if (customizations?.content?.[key]) return customizations.content[key];
    if (config?.content?.[key]) return config.content[key];
    const parts = key.split('.');
    if (parts.length === 2) { const v = config?.sections?.[parts[0]]?.[parts[1]]?.default; if (v) return v; }
    if (alias) { const ap = alias.split('.'); if (ap.length === 2) { const v = config?.sections?.[ap[0]]?.[ap[1]]?.default; if (v) return v; } }
    return WARM_EARTH_DEMO_OVERRIDES[key] || '';
  };

  const C = {
    primary: customizations?.colors?.primary || config?.colors?.primary?.default || '#78350f',
    secondary: customizations?.colors?.secondary || config?.colors?.secondary?.default || '#065f46',
    accent: customizations?.colors?.accent || config?.colors?.accent?.default || '#d97706',
    bg: '#fef3c7', card: '#fdf0d5', muted: '#f5e6c8', mutedFg: '#92673a', fg: '#5c2d0e',
  };

  let hours: any = {};
  // Read plain text hours from businessInfo (set during onboarding)
  const hoursWeekdays = gc('businessInfo.hours') || gc('hours.weekdays') || '';
  const hoursSaturday = gc('businessInfo.saturdayHours') || gc('hours.saturday') || '';
  const hoursSunday = gc('businessInfo.sundayHours') || gc('hours.sunday') || '';
  const wkday = hoursWeekdays || 'Mon–Fri: 7:00 AM – 5:00 PM';
  const sat = hoursSaturday || 'Saturday: 8:00 AM – 4:00 PM';
  const sun = hoursSunday || 'Sunday: Closed';
  const fmtPrice = (p: number | null) => p != null ? `$${Number(p).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '';

  let body = '';
  switch (currentPage) {
    case 'home': case 'index': body = weHome(siteId, gc, products, manufacturers, vis, C, fmtPrice, baseUrl); break;
    case 'service': body = weServicePage(siteId, gc, C, enabledFeatures.has('service_scheduling'), baseUrl); break;
    case 'contact': body = weContactPage(siteId, gc, C, wkday, sat, sun, baseUrl); break;
    case 'inventory': body = weInventoryPage(siteId, gc, products, C, fmtPrice, baseUrl); break;
    case 'rentals': body = await weRentalsPage(siteId, gc, C, baseUrl, supabase, enabledFeatures.has('rental_scheduling') || siteAddons.includes('rentals')); break;
    case 'manufacturers': body = weManufacturersPage(siteId, gc, C, manufacturers, baseUrl); break;
    default: body = weHome(siteId, gc, products, manufacturers, vis, C, fmtPrice, baseUrl); break;
  }

  return weShell(gc('business.name') || 'Heartland Outdoor Equipment', C, siteId, currentPage,
    weHeader(siteId, currentPage, pages, gc, C, baseUrl) + body + weFooter(siteId, pages, gc, C, wkday, sat, sun, baseUrl),
    enabledFeatures, checkoutMode
  );
}

// ── HTML Shell ──
function weShell(title: string, C: any, siteId: string, page: string, body: string, enabledFeatures?: Set<string>, checkoutMode: string = 'quote_only') {
  return `<!DOCTYPE html><html lang="en"><head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;600;700;800&family=Lato:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; box-sizing: border-box; }
    body { font-family: 'Lato', sans-serif; background: ${C.bg}; color: ${C.fg}; }
    .font-serif { font-family: 'Merriweather', Georgia, serif; }
    .cw { max-width: 80rem; margin: 0 auto; padding-left: 1rem; padding-right: 1rem; }
    @media(min-width:640px){ .cw { padding-left: 1.5rem; padding-right: 1.5rem; } }
    @media(min-width:1024px){ .cw { padding-left: 2rem; padding-right: 2rem; } }
    .card-we { background: ${C.card}; border: 2px solid #d4b896; border-radius: 1rem; overflow: hidden; transition: all 0.3s; }
    .card-we:hover { box-shadow: 0 10px 25px -5px rgba(217,119,6,0.2), 0 4px 10px -4px rgba(92,45,14,0.15); border-color: ${C.accent}80; }
    .btn-accent { display: inline-flex; align-items: center; gap: 0.5rem; background: ${C.accent}; color: ${C.bg}; padding: 0.875rem 2rem; border-radius: 9999px; text-decoration: none; font-weight: 600; border: none; cursor: pointer; transition: opacity 0.2s; font-size: 1rem; }
    .btn-accent:hover { opacity: 0.9; }
    .btn-outline-we { display: inline-flex; align-items: center; gap: 0.5rem; background: transparent; color: ${C.primary}; padding: 0.875rem 2rem; border-radius: 9999px; text-decoration: none; font-weight: 600; border: 2px solid ${C.primary}; cursor: pointer; transition: all 0.2s; }
    .btn-outline-we:hover { background: ${C.primary}; color: ${C.bg}; }
    .page-hero-we { background: ${C.primary}; color: ${C.bg}; padding: 4rem 0; text-align: center; }
    .page-hero-we h1 { font-family: 'Merriweather', serif; font-size: 2.5rem; font-weight: 700; margin-bottom: 0.75rem; }
    .page-hero-we p { font-size: 1.125rem; opacity: 0.85; max-width: 600px; margin: 0 auto; }
    .form-we { width: 100%; padding: 0.75rem 1rem; border: 2px solid #d4b896; border-radius: 0.75rem; font-size: 0.9375rem; font-family: 'Lato', sans-serif; background: #fff; color: ${C.fg}; transition: border-color 0.2s; }
    .form-we:focus { outline: none; border-color: ${C.accent}; box-shadow: 0 0 0 3px ${C.accent}30; }
    select.form-we { appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2392673a' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 0.75rem center; padding-right: 2.5rem; cursor: pointer; }
    .label-we { display: block; font-size: 0.875rem; font-weight: 600; color: ${C.fg}; margin-bottom: 0.375rem; }
    :root { --color-primary: ${C.primary}; --color-secondary: ${C.secondary}; --color-accent: ${C.accent}; }
    .texture-wood { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"); }

    /* ── Mobile Responsive ── */
    @media (max-width: 768px) {
      [style*="grid-template-columns:1fr 1fr"],
      [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
      [style*="grid-template-columns:repeat(3"],
      [style*="grid-template-columns:repeat(4"],
      [style*="grid-template-columns:repeat(5"] { grid-template-columns: 1fr 1fr !important; }
      [style*="grid-template-columns: 2fr 1fr"],
      [style*="grid-template-columns:2fr 1fr"] { grid-template-columns: 1fr !important; }
      [data-section="hero"] { min-height: auto !important; }
      [data-section="hero"] [style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
      .topbar { display: none !important; }
      header nav { gap: 0.125rem !important; }
      header nav a { font-size: 0.75rem !important; padding: 0.375rem 0.625rem !important; }
      header .btn-accent { display: none !important; }
      section h1 { font-size: 2rem !important; }
      section h2 { font-size: 1.5rem !important; }
      .page-hero-we h1 { font-size: 1.75rem !important; }
      footer [style*="grid-template-columns:repeat(4"] { grid-template-columns: 1fr 1fr !important; gap: 1.5rem !important; }
      [style*="min-height:85vh"] { min-height: auto !important; padding: 3rem 0 !important; }
    }
    @media (max-width: 480px) {
      [style*="grid-template-columns:repeat("],
      [style*="grid-template-columns: repeat("] { grid-template-columns: 1fr !important; }
      footer [style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
      header nav { flex-wrap: wrap !important; justify-content: center !important; }
    }
  </style>
</head><body>${body}${sharedPreviewScript(siteId, page)}<script>
  function fmSubmitForm(form,siteId,formType,extraFn){var btn=form.querySelector('button[type="submit"]');var orig=btn?btn.innerHTML:'';if(btn){btn.disabled=true;btn.innerHTML='Submitting...';}var nameEl=form.querySelector('input[type="text"]');var emailEl=form.querySelector('input[type="email"]');var phoneEl=form.querySelector('input[type="tel"]');var msgEl=form.querySelector('textarea');var data={site_id:siteId,form_type:formType,name:nameEl?nameEl.value:null,email:emailEl?emailEl.value:null,phone:phoneEl?phoneEl.value:null,message:msgEl?msgEl.value:null,extra_data:extraFn?extraFn(form):null};fetch('/api/submit-form',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(function(r){return r.json();}).then(function(res){if(res.success){var suc=form.parentElement?form.parentElement.querySelector('[data-fm-success]'):null;if(suc){form.style.display='none';suc.style.display='block';}else{form.reset();if(btn){btn.innerHTML='\u2713 Submitted!';btn.style.background='#16a34a';}}}else{if(btn){btn.disabled=false;btn.innerHTML=orig;}alert('Something went wrong. Please try again.');}}).catch(function(){if(btn){btn.disabled=false;btn.innerHTML=orig;}alert('Something went wrong. Please try again.');});}
</script>${enabledFeatures?.has('rental_scheduling') ? rentalModalBlock('fm', siteId) : ''}${injectCartSystem(siteId, checkoutMode, C.primary)}
</body></html>`;
}

// ── Header ──
function weHeader(siteId: string, cur: string, pages: any[], gc: (k: string) => string, C: any,
  baseUrl: string = ''
) {
  const name = gc('business.name') || 'Heartland Outdoor Equipment';
  const phone = gc('business.phone');
  const email = gc('business.email');
  const navItems = [
    { label: 'Home', slug: 'home' }, { label: 'Inventory', slug: 'inventory' },
    { label: 'Rentals', slug: 'rentals' }, { label: 'Service', slug: 'service' },
    { label: 'Brands', slug: 'manufacturers' }, { label: 'Contact', slug: 'contact' },
  ].filter(n => n.slug === 'home' || pages.some(p => p.slug === n.slug && p.is_visible !== false));

  return `
  <!-- Top Bar -->
  <div class="topbar" style="background:${C.primary};color:${C.bg};padding:0.5rem 0;font-size:0.8125rem;">
    <div class="cw" style="display:flex;justify-content:space-between;align-items:center;">
      <div style="display:flex;gap:1.5rem;">
        ${phone ? `<a href="tel:${phone}" style="color:${C.bg};text-decoration:none;display:flex;align-items:center;gap:0.375rem;">📞 ${phone}</a>` : ''}
        ${email ? `<a href="mailto:${email}" style="color:${C.bg};text-decoration:none;display:flex;align-items:center;gap:0.375rem;">✉️ ${email}</a>` : ''}
      </div>
      <div style="display:flex;gap:0.75rem;">
        ${gc('social.facebook') ? `<a href="${gc('social.facebook')}" target="_blank" style="color:${C.bg};text-decoration:none;">FB</a>` : ''}
        ${gc('social.instagram') ? `<a href="${gc('social.instagram')}" target="_blank" style="color:${C.bg};text-decoration:none;">IG</a>` : ''}
        ${gc('social.youtube') ? `<a href="${gc('social.youtube')}" target="_blank" style="color:${C.bg};text-decoration:none;">YT</a>` : ''}
      </div>
    </div>
  </div>
  <!-- Main Nav -->
  <header style="position:sticky;top:0;z-index:50;background:rgba(254,243,199,0.95);backdrop-filter:blur(8px);border-bottom:2px solid #d4b896;">
    <div class="cw" style="display:flex;align-items:center;justify-content:space-between;height:5rem;">
      <a href="${baseUrl}home" style="text-decoration:none;display:flex;align-items:center;gap:0.75rem;">
        ${gc('businessInfo.logoImage')
          ? `<img src="${gc('businessInfo.logoImage')}" alt="${name}" style="max-height:48px;max-width:160px;object-fit:contain;">`
          : `<div style="background:${C.secondary};border-radius:1rem;padding:0.5rem;display:flex;align-items:center;justify-content:center;"><span style="font-size:1.5rem;">🌿</span></div>`
        }
        <span class="font-serif" style="font-size:1.25rem;font-weight:700;color:${C.primary};">${name}</span>
      </a>
      <nav class="we-desktop-nav" style="display:flex;align-items:center;gap:0.25rem;">
        ${navItems.map(n => {
          const active = cur === n.slug || (cur === 'index' && n.slug === 'home');
          return `<a href="${baseUrl}${n.slug}" style="padding:0.5rem 1rem;border-radius:9999px;font-weight:500;text-decoration:none;font-size:0.9375rem;transition:all 0.2s;${active ? `background:${C.accent};color:${C.bg};` : `color:${C.fg};`}">${n.label}</a>`;
        }).join('')}
      </nav>
      <a class="we-desktop-nav" href="${baseUrl}contact" class="btn-accent" style="padding:0.625rem 1.5rem;font-size:0.875rem;background:${C.accent};color:${C.bg};border-radius:9999px;text-decoration:none;font-weight:600;">Visit Showroom</a>
      <button class="we-mobile-btn" onclick="document.getElementById('weMobileMenu').classList.toggle('we-mobile-open')" style="display:none;background:none;border:none;cursor:pointer;padding:0.5rem;">
        <svg width="24" height="24" fill="none" stroke="${C.primary}" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </div>
    <div id="weMobileMenu" style="display:none;padding:0.75rem 1rem;border-top:2px solid #d4b896;">
      ${navItems.map(n => {
        const active = cur === n.slug || (cur === 'index' && n.slug === 'home');
        return `<a href="${baseUrl}${n.slug}" style="display:block;padding:0.5rem 0;font-size:0.9375rem;font-weight:500;text-decoration:none;color:${active ? C.accent : C.fg};">${n.label}</a>`;
      }).join('')}
    </div>
  </header>
  <style>
    @media(max-width:768px){ .we-desktop-nav { display:none !important; } .we-mobile-btn { display:block !important; } .topbar { display:none !important; } }
    .we-mobile-open { display:block !important; }
  </style>`;
}

// ── Footer ──
function weFooter(siteId: string, pages: any[], gc: (k: string) => string, C: any, wk: string, sat: string, sun: string,
  baseUrl: string = ''
) {
  const name = gc('business.name') || 'Heartland Outdoor Equipment';
  const navSlugs = ['home', 'inventory', 'rentals', 'service', 'manufacturers', 'contact'];
  return `
  <div style="height:4px;background:linear-gradient(to right,${C.accent},${C.secondary},${C.accent});"></div>
  <footer style="background:${C.primary};color:${C.bg};padding:4rem 0 0;">
    <div class="cw">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:2.5rem;">
        <div>
          <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1.25rem;">
            ${gc('businessInfo.logoImage')
            ? `<img src="${gc('businessInfo.logoImage')}" alt="${name}" style="max-height:40px;max-width:140px;object-fit:contain;">`
            : `<div style="background:${C.accent};border-radius:1rem;padding:0.5rem;"><span style="font-size:1.25rem;">🌿</span></div>`
          }
            <span class="font-serif" style="font-size:1.125rem;font-weight:700;">${name}</span>
          </div>
          <p style="font-size:0.875rem;opacity:0.8;line-height:1.7;">${gc('businessInfo.description') || gc('footer.tagline') || ''}</p>
        </div>
        <div>
          <h4 class="font-serif" style="font-size:1rem;font-weight:600;margin-bottom:1rem;">Quick Links</h4>
          <nav style="display:flex;flex-direction:column;gap:0.5rem;">
            ${navSlugs.map(s => `<a href="${baseUrl}${s}" style="font-size:0.875rem;color:${C.bg};opacity:0.8;text-decoration:none;">${s.charAt(0).toUpperCase() + s.slice(1)}</a>`).join('')}
          </nav>
        </div>
        <div>
          <h4 class="font-serif" style="font-size:1rem;font-weight:600;margin-bottom:1rem;">Visit Us</h4>
          <div style="font-size:0.875rem;opacity:0.8;display:flex;flex-direction:column;gap:0.75rem;">
            <span>${gc('business.address')}</span>
            ${gc('business.phone') ? `<a href="tel:${gc('business.phone')}" style="color:${C.bg};text-decoration:none;">${gc('business.phone')}</a>` : ''}
            ${gc('business.email') ? `<a href="mailto:${gc('business.email')}" style="color:${C.bg};text-decoration:none;">${gc('business.email')}</a>` : ''}
          </div>
        </div>
        <div>
          <h4 class="font-serif" style="font-size:1rem;font-weight:600;margin-bottom:1rem;">Hours</h4>
          <div style="font-size:0.875rem;opacity:0.8;display:flex;flex-direction:column;gap:0.375rem;">
            <div style="display:flex;justify-content:space-between;"><span>Mon-Fri</span><span>${wk}</span></div>
            <div style="display:flex;justify-content:space-between;"><span>Saturday</span><span>${sat}</span></div>
            <div style="display:flex;justify-content:space-between;"><span>Sunday</span><span>${sun}</span></div>
          </div>
        </div>
      </div>
    </div>
    <div style="margin-top:3rem;border-top:1px solid rgba(254,243,199,0.15);padding:1.5rem 0;text-align:center;font-size:0.8125rem;opacity:0.6;">
      © ${new Date().getFullYear()} ${name}. All rights reserved.
    </div>
  </footer>`;
}

// ══════════════════════════════════════════════════
//  HOME
// ══════════════════════════════════════════════════
function weHome(siteId: string, gc: (k: string) => string, products: any[], manufacturers: any[], vis: Record<string, boolean>, C: any, fp: (p: number | null) => string,
  baseUrl: string = ''
): string {
  let h = '';

  // Hero
  if (vis.hero !== false) {
    const img = gc('hero.image') || '/images/hero-mower.jpg';
    h += `
    <section data-section="hero" class="texture-wood" style="min-height:85vh;display:flex;align-items:center;background:linear-gradient(135deg,${C.bg},${C.card});position:relative;overflow:hidden;">
      <div class="cw" style="padding:5rem 0;position:relative;z-index:1;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;align-items:center;">
          <div style="max-width:580px;">
            <div style="display:inline-flex;align-items:center;gap:0.5rem;background:${C.secondary}30;color:${C.secondary};padding:0.5rem 1rem;border-radius:9999px;font-size:0.875rem;font-weight:600;margin-bottom:2rem;">${weIcon(gc('hero.badge.icon') || gc('hero.badgeIcon') || '🏔', '🏔')} ${gc('hero.badge.text') || gc('hero.badgeText') || gc('hero.badge') || 'Family-Owned Since 1985'}</div>
            <h1 class="font-serif" style="font-size:3rem;font-weight:700;line-height:1.15;margin:0 0 1.5rem;color:${C.fg};">${gc('hero.heading')}</h1>
            <p style="font-size:1.25rem;color:${C.mutedFg};margin:0 0 2.5rem;line-height:1.7;">${gc('hero.subheading')}</p>
            <div style="display:flex;gap:1rem;flex-wrap:wrap;">
              ${(() => {
                const btn1Dest = gc('hero.button1.destination');
                const btn1Url = btn1Dest === '__custom' ? gc('hero.button1.destination_url') : `${baseUrl}${btn1Dest || 'inventory'}`;
                const btn1Text = gc('hero.button1.text') || gc('hero.ctaPrimary') || 'Shop Equipment';
                return `<a href="${btn1Url}" class="btn-accent">${btn1Text} →</a>`;
              })()}
              ${(() => {
                const btn2Dest = gc('hero.button2.destination');
                const btn2Url = btn2Dest === '__custom' ? gc('hero.button2.destination_url') : `${baseUrl}${btn2Dest || 'rentals'}`;
                const btn2Text = gc('hero.button2.text') || gc('hero.ctaSecondary') || 'View Rentals';
                return `<a href="${btn2Url}" class="btn-outline-we">${btn2Text}</a>`;
              })()}
            </div>
            <div style="display:flex;gap:1.5rem;margin-top:2rem;font-size:0.875rem;color:${C.mutedFg};">
              <span>🛡 Factory Authorized Dealer</span>
              <span>🔧 Certified Service Center</span>
            </div>
          </div>
          <div style="position:relative;">
            <div style="border-radius:1.5rem;overflow:hidden;box-shadow:0 10px 25px -5px rgba(217,119,6,0.2);">
              <img src="${img}" alt="Equipment" style="width:100%;height:500px;object-fit:cover;">
              <div style="position:absolute;inset:0;background:linear-gradient(to top,${C.primary}60,transparent);border-radius:1.5rem;"></div>
            </div>
            <div style="position:absolute;bottom:-1.5rem;left:-1.5rem;background:${C.card};border-radius:1rem;padding:1.25rem 1.5rem;box-shadow:0 10px 25px -5px rgba(217,119,6,0.2);border:2px solid ${C.accent}40;display:flex;align-items:center;gap:1rem;">
              <div style="background:${C.accent}25;padding:0.75rem;border-radius:0.75rem;font-size:1.5rem;">🚜</div>
              <div><p class="font-serif" style="font-size:1.5rem;font-weight:700;margin:0;color:${C.fg};">${gc('hero.statValue') || '200+'}</p><p style="color:${C.mutedFg};font-size:0.875rem;margin:0;">${gc('hero.statLabel') || 'Equipment In Stock'}</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
  }

  // Value Props
  const vp1Icon = gc('valueProps.valueProp1.icon') || gc('valueProps.valueProp1Icon') || '🚜';
  const vp1Title = gc('valueProps.valueProp1.text') || gc('valueProps.valueProp1Title') || 'Quality Equipment';
  const vp1Desc = gc('valueProps.valueProp1.description') || gc('valueProps.valueProp1Description') || 'Top brands and reliable machines for every job on your property';
  const vp2Icon = gc('valueProps.valueProp2.icon') || gc('valueProps.valueProp2Icon') || '🔧';
  const vp2Title = gc('valueProps.valueProp2.text') || gc('valueProps.valueProp2Title') || 'Expert Service';
  const vp2Desc = gc('valueProps.valueProp2.description') || gc('valueProps.valueProp2Description') || 'Factory-trained technicians keeping your equipment running strong';
  const vp3Icon = gc('valueProps.valueProp3.icon') || gc('valueProps.valueProp3Icon') || '🛡';
  const vp3Title = gc('valueProps.valueProp3.text') || gc('valueProps.valueProp3Title') || 'Local Trust';
  const vp3Desc = gc('valueProps.valueProp3.description') || gc('valueProps.valueProp3Description') || 'Family-owned and operated, serving our community since 1985';
  h += `
  <section data-section="valueProps" style="padding:4rem 0;background:${C.primary};color:${C.bg};">
    <div class="cw">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;text-align:center;">
        ${[
          { icon: vp1Icon, title: vp1Title, desc: vp1Desc },
          { icon: vp2Icon, title: vp2Title, desc: vp2Desc },
          { icon: vp3Icon, title: vp3Title, desc: vp3Desc },
        ].map(v => `
          <div>
            <div style="background:${C.accent};border-radius:9999px;width:4rem;height:4rem;margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;font-size:1.75rem;overflow:hidden;">${weIcon(v.icon, v.icon, '4rem')}</div>
            <h3 class="font-serif" style="font-size:1.25rem;margin:0 0 0.5rem;font-weight:600;">${v.title}</h3>
            <p style="opacity:0.8;font-size:0.9375rem;margin:0;">${v.desc}</p>
          </div>`).join('')}
      </div>
    </div>
  </section>`;

  // Featured
  if (vis.featured !== false) {
    const list = products.slice(0, 6);
    h += `
    <section data-section="featured" style="padding:6rem 0;">
      <div class="cw">
        <div style="text-align:center;margin-bottom:4rem;">
          <h2 class="font-serif" style="font-size:2.5rem;font-weight:700;margin:0 0 0.75rem;color:${C.fg};">${gc('featured.heading')}</h2>
          <p style="font-size:1.125rem;color:${C.mutedFg};margin:0;">${gc('featured.subheading')}</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:2rem;">
          ${list.map((p: any) => `
          <div class="card-we">
            <div style="position:relative;overflow:hidden;">
              ${p.primary_image ? `<img src="${p.primary_image}" alt="${p.title}" style="width:100%;height:220px;object-fit:cover;">` : `<div style="width:100%;height:220px;background:linear-gradient(135deg,${C.primary},${C.secondary});"></div>`}
              <span style="position:absolute;top:1rem;left:1rem;background:${C.secondary};color:${C.bg};padding:0.25rem 0.75rem;border-radius:9999px;font-size:0.75rem;font-weight:600;">${p.category || ''}</span>
            </div>
            <div style="padding:1.5rem;">
              <h3 class="font-serif" style="font-size:1.125rem;font-weight:600;margin:0 0 0.5rem;color:${C.fg};">${p.title}</h3>
              <p style="font-size:0.875rem;color:${C.mutedFg};margin:0 0 1rem;line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.description || ''}</p>
              <div style="display:flex;align-items:center;justify-content:space-between;">
                ${p.price ? `<span class="font-serif" style="font-size:1.375rem;font-weight:700;color:${C.accent};">${fp(p.price)}</span>` : '<span></span>'}
                <a href="${baseUrl}inventory" style="color:${C.primary};font-weight:600;text-decoration:none;font-size:0.875rem;">View Details →</a>
              </div>
            </div>
          </div>`).join('')}
        </div>
        <div style="text-align:center;margin-top:3rem;">
          <a href="${baseUrl}${gc('featured.ctaLink') || 'inventory'}" class="btn-accent">${gc('featured.ctaText') || 'View All Equipment'} →</a>
        </div>
      </div>
    </section>`;
  }

  // Manufacturers
  if (vis.manufacturers !== false) {
    const mfgItems = products.length > 0
      ? manufacturers.map((m: any) => ({ name: m.name, logo: m.logo_url || m.logoUrl || '' }))
      : [{ name: 'Toro', logo: '/images/logos/toro.png' }, { name: 'John Deere', logo: '/images/logos/john-deere.png' }, { name: 'Stihl', logo: '/images/logos/Stihl.png' }, { name: 'Husqvarna', logo: '/images/logos/Husqvarna.png' }, { name: 'Cub Cadet', logo: '/images/logos/cub-cadet.png' }];
    h += `
    <section data-section="manufacturers" style="padding:6rem 0;background:${C.muted};">
      <div class="cw">
        <div style="text-align:center;margin-bottom:4rem;">
          <h2 class="font-serif" style="font-size:2.5rem;font-weight:700;margin:0 0 0.75rem;color:${C.fg};">${gc('manufacturers.heading')}</h2>
          <p style="font-size:1.125rem;color:${C.mutedFg};margin:0;">${gc('manufacturers.subheading')}</p>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:1.25rem;">
          ${mfgItems.map((m: any) => `
          <div class="card-we" style="padding:2rem;text-align:center;">
            <div style="height:3.5rem;display:flex;align-items:center;justify-content:center;margin-bottom:0.75rem;">
              ${m.logo ? `<img src="${m.logo}" alt="${m.name}" style="height:44px;width:auto;">` : `<span style="font-size:0.875rem;font-weight:700;color:${C.secondary};">${m.name}</span>`}
            </div>
            <span style="font-size:0.75rem;color:${C.secondary};font-weight:600;">✦ Trusted Partner</span>
          </div>`).join('')}
        </div>
      </div>
    </section>`;
  }

  // Testimonials
  if (vis.testimonials !== false) {
    let testimonials: any[] = [];
    try { testimonials = JSON.parse(gc('testimonials.items') || '[]'); } catch {}
    if (!testimonials.length) testimonials = [
      { name: 'Robert M.', location: 'Timber Creek', content: 'They helped me find the perfect tractor for my 40 acres.', rating: 5 },
      { name: 'Sarah T.', location: 'Pine Ridge', content: 'The rental program saved us thousands.', rating: 5 },
      { name: 'James G.', location: 'Valley View', content: 'They treat us like neighbors, not customers.', rating: 5 },
    ];
    h += `
    <section data-section="testimonials" style="padding:6rem 0;">
      <div class="cw">
        <h2 class="font-serif" style="font-size:2.5rem;font-weight:700;text-align:center;margin:0 0 4rem;color:${C.fg};">${gc('testimonials.heading')}</h2>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;">
          ${testimonials.map(t => `
          <div class="card-we" style="padding:2rem;display:flex;flex-direction:column;">
            <div style="display:flex;gap:2px;margin-bottom:1rem;">
              ${Array.from({length:5}).map((_,i) => `<span style="color:${i < (t.rating||5) ? C.accent : '#d4b896'};font-size:1rem;">★</span>`).join('')}
            </div>
            <blockquote style="flex:1;font-size:0.9375rem;color:${C.mutedFg};line-height:1.8;margin:0 0 1.5rem;font-style:italic;">"${t.content || t.quote || ''}"</blockquote>
            <div style="border-top:1px solid #d4b896;padding-top:1rem;">
              <p style="font-weight:600;color:${C.fg};margin:0;font-size:0.9375rem;">${t.name || t.author || ''}</p>
              <p style="font-size:0.8125rem;color:${C.mutedFg};margin:0.125rem 0 0;">${t.location || t.title || ''}</p>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </section>`;
  }

  // CTA
  if (vis.cta !== false) {
    const ctaBtn1Dest = gc('cta.button1.destination');
    const ctaBtn1Url = ctaBtn1Dest === '__custom' ? gc('cta.button1.destination_url') : `${baseUrl}${ctaBtn1Dest || 'contact'}`;
    const ctaBtn1Text = gc('cta.button1.text') || gc('cta.ctaText') || gc('cta.button') || 'Visit Us Today';
    h += `
    <section data-section="cta" style="padding:6rem 0;background:${C.secondary};color:${C.bg};position:relative;overflow:hidden;">
      <div class="cw" style="text-align:center;position:relative;z-index:1;">
        <h2 class="font-serif" style="font-size:2.5rem;font-weight:700;margin:0 0 1rem;">${gc('cta.heading')}</h2>
        <p style="font-size:1.125rem;opacity:0.85;max-width:600px;margin:0 auto 2.5rem;">${gc('cta.subheading')}</p>
        <a href="${ctaBtn1Url}" class="btn-accent" style="font-size:1.125rem;padding:1rem 2.5rem;">${ctaBtn1Text} →</a>
      </div>
    </section>`;
  }

  return h;
}

// ═══════ INVENTORY ═══════
function weInventoryPage(siteId: string, gc: (k: string) => string, products: any[], C: any, fp: (p: number|null) => string,
  baseUrl: string = ''
): string {
  const cats = [...new Set(products.map((p: any) => p.category).filter(Boolean))];
  return `
  ${(() => {
    const iImg = gc('inventoryPage.heroImage');
    return iImg
      ? `<section data-section="inventoryHero" style="background-image:url('${iImg}');background-size:cover;background-position:center;padding:4rem 0;text-align:center;position:relative;"><div style="position:absolute;inset:0;background:rgba(92,45,14,0.7);"></div><div class="cw" style="position:relative;z-index:1;"><h1 class="font-serif" style="font-size:2.5rem;font-weight:700;margin:0 0 0.75rem;color:#fef3c7;">${gc('inventoryPage.heading') || gc('inventory.heading')}</h1><p style="font-size:1.125rem;opacity:0.9;max-width:600px;margin:0 auto;color:#fef3c7;">${gc('inventoryPage.subheading') || gc('inventory.description')}</p></div></section>`
      : `<section data-section="inventoryHero" class="page-hero-we texture-wood"><div class="cw"><h1>${gc('inventoryPage.heading') || gc('inventory.heading')}</h1><p>${gc('inventoryPage.subheading') || gc('inventory.description')}</p></div></section>`;
  })()}
  <section data-section="inventoryGrid" style="padding:2.5rem 0 5rem;">
    <div class="cw">
      ${gc('inventoryPage.contentHeading') ? `<h2 class="font-serif" style="font-size:1.75rem;font-weight:700;margin:0 0 1rem;color:${C.fg};">${gc('inventoryPage.contentHeading')}</h2>` : ''}
      ${gc('inventoryPage.contentText') ? `<p style="color:${C.mutedFg};line-height:1.8;margin:0 0 2rem;">${gc('inventoryPage.contentText')}</p>` : ''}
      <div style="display:flex;gap:1rem;margin-bottom:2rem;flex-wrap:wrap;">
        <div style="position:relative;flex:1;max-width:400px;">
          <input type="text" placeholder="Search equipment..." class="form-we" style="padding-left:2.25rem;" id="we-search">
        </div>
        ${cats.length ? `<select class="form-we" style="width:auto;min-width:180px;" id="we-cat"><option value="">${gc('inventoryPage.filterLabel') || 'All Categories'}</option>${cats.map(c => `<option value="${c}">${c}</option>`).join('')}</select>` : ''}
      </div>
      <p style="font-size:0.875rem;color:${C.mutedFg};margin-bottom:1.5rem;">Showing ${products.length} products</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:2rem;">
        ${products.map((p: any) => `
        <div class="card-we" data-cat="${p.category||''}" data-name="${(p.title||'').toLowerCase()}" style="cursor:pointer;" onclick="fmOpenProduct(${JSON.stringify({id:p.id,title:p.title,description:p.description,price:p.price,sale_price:p.sale_price,primary_image:p.primary_image,category:p.category,model:p.model,slug:p.slug}).replace(/"/g,'&quot;')})">
          <div style="overflow:hidden;position:relative;">
            ${p.primary_image ? `<img src="${p.primary_image}" alt="${p.title}" style="width:100%;height:220px;object-fit:cover;" loading="lazy">` : `<div style="width:100%;height:220px;background:${C.muted};display:flex;align-items:center;justify-content:center;color:${C.mutedFg};">No Image</div>`}
            <span style="position:absolute;top:1rem;left:1rem;background:${C.secondary};color:${C.bg};padding:0.25rem 0.75rem;border-radius:9999px;font-size:0.75rem;font-weight:600;">${p.category||''}</span>
          </div>
          <div style="padding:1.5rem;">
            <h3 class="font-serif" style="font-size:1.0625rem;font-weight:600;margin:0 0 0.375rem;color:${C.fg};">${p.title}</h3>
            <p style="font-size:0.875rem;color:${C.mutedFg};margin:0 0 1rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${p.description||''}</p>
            <div style="display:flex;align-items:center;justify-content:space-between;">
              ${p.price ? `<span class="font-serif" style="font-size:1.25rem;font-weight:700;color:${C.accent};">${fp(p.price)}</span>` : `<span style="font-size:0.875rem;color:${C.mutedFg};">Call for Price</span>`}
              <span style="font-size:0.8125rem;font-weight:600;color:${C.primary};">View Details →</span>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </section>
  <script>(function(){var s=document.getElementById('we-search'),c=document.getElementById('we-cat'),cards=document.querySelectorAll('[data-cat]');function f(){var q=(s?s.value:'').toLowerCase(),cat=c?c.value:'';cards.forEach(function(el){var mq=!q||el.getAttribute('data-name').includes(q),mc=!cat||el.getAttribute('data-cat')===cat;el.style.display=mq&&mc?'':'none';});}s&&s.addEventListener('input',f);c&&c.addEventListener('change',f);})();<\/script>`;
}

// ═══════ SERVICE ═══════
function weServicePage(siteId: string, gc: (k: string) => string, C: any, hasScheduler: boolean = false,
  baseUrl: string = ''
): string {
  let items: any[] = [];
  // Build from config fields, fall back to JSON items, then defaults
  const s1t = gc('servicePage.service1Title'); const s1d = gc('servicePage.service1Description');
  const s2t = gc('servicePage.service2Title'); const s2d = gc('servicePage.service2Description');
  const s3t = gc('servicePage.service3Title'); const s3d = gc('servicePage.service3Description');
  if (s1t || s2t || s3t) {
    items = [
      s1t ? { icon: gc('servicePage.service1.icon') || gc('servicePage.service1Icon') || '🔧', title: s1t, description: s1d } : null,
      s2t ? { icon: gc('servicePage.service2.icon') || gc('servicePage.service2Icon') || '⚙️', title: s2t, description: s2d } : null,
      s3t ? { icon: gc('servicePage.service3.icon') || gc('servicePage.service3Icon') || '🚚', title: s3t, description: s3d } : null,
    ].filter(Boolean);
  } else {
    try { items = JSON.parse(gc('services.items') || '[]'); } catch {}
    if (!items.length) items = [
      { icon: gc('servicePage.service1.icon') || gc('servicePage.service1Icon') || '🔧', title: gc('servicePage.service1.text') || gc('servicePage.service1Title') || 'Routine Maintenance', description: gc('servicePage.service1Description') || 'Oil changes, filter replacements, blade sharpening.' },
      { icon: gc('servicePage.service2.icon') || gc('servicePage.service2Icon') || '⚙️', title: gc('servicePage.service2.text') || gc('servicePage.service2Title') || 'Engine Repair', description: gc('servicePage.service2Description') || 'Complete engine diagnostics and repair.' },
      { icon: gc('servicePage.service3.icon') || gc('servicePage.service3Icon') || '🚚', title: gc('servicePage.service3.text') || gc('servicePage.service3Title') || 'Pickup & Delivery', description: gc('servicePage.service3Description') || 'We pick up and deliver when repairs are complete.' },
    ];
  }
  return `
  ${(() => {
    const svcImg = gc('servicePage.heroImage');
    return svcImg
      ? `<section data-section="serviceHero" style="background-image:url('${svcImg}');background-size:cover;background-position:center;padding:4rem 0;text-align:center;position:relative;"><div style="position:absolute;inset:0;background:rgba(92,45,14,0.7);"></div><div class="cw" style="position:relative;z-index:1;"><h1 class="font-serif" style="font-size:2.5rem;font-weight:700;margin:0 0 0.75rem;color:#fef3c7;">${gc('servicePage.heading') || gc('services.heading')}</h1><p style="font-size:1.125rem;opacity:0.9;max-width:600px;margin:0 auto;color:#fef3c7;">${gc('servicePage.subheading') || gc('services.description')}</p></div></section>`
      : `<section data-section="serviceHero" class="page-hero-we texture-wood"><div class="cw"><h1>${gc('servicePage.heading') || gc('services.heading')}</h1><p>${gc('servicePage.subheading') || gc('services.description')}</p></div></section>`;
  })()}
  <section data-section="serviceTypes" style="padding:6rem 0;">
    <div class="cw">
      ${gc('servicePage.contentHeading') ? `<h2 class="font-serif" style="font-size:1.5rem;font-weight:700;margin:0 0 1rem;color:${C.fg};">${gc('servicePage.contentHeading')}</h2>` : ''}
      ${gc('servicePage.contentText') ? `<p style="color:${C.mutedFg};line-height:1.8;margin:0 0 2rem;">${gc('servicePage.contentText')}</p>` : ''}
      <h2 class="font-serif" style="font-size:2rem;font-weight:700;text-align:center;margin:0 0 3rem;color:${C.fg};">${gc('servicePage.gridHeading') || 'What We Service'}</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem;">
        ${items.map(s => `
        <div class="card-we" style="padding:2rem;">
          <div style="background:${C.secondary}20;border-radius:9999px;width:4rem;height:4rem;display:flex;align-items:center;justify-content:center;font-size:2rem;margin-bottom:1rem;overflow:hidden;">${weIcon(s.icon||'🔧','🔧','4rem')}</div>
          <h3 class="font-serif" style="font-size:1.25rem;font-weight:600;margin:0 0 0.75rem;color:${C.fg};">${s.title}</h3>
          <p style="color:${C.mutedFg};margin:0;line-height:1.7;">${s.description}</p>
        </div>`).join('')}
      </div>
    </div>
  </section>
  ${hasScheduler ? serviceBookingSection(siteId, C.accent, gc) : `
  <section data-section="serviceForm" style="padding:6rem 0;background:${C.muted};">
    <div class="cw" style="max-width:680px;">
      <div class="card-we" style="padding:2.5rem;">
        <h3 class="font-serif" style="font-size:1.5rem;font-weight:600;text-align:center;margin:0 0 0.5rem;color:${C.fg};">${gc('servicePage.formHeading') || 'Request Service'}</h3>
        <p style="text-align:center;color:${C.mutedFg};margin:0 0 2rem;">${gc('servicePage.formSubheading') || "Fill out the form below and we'll get back to you within one business day."}</p>
        <form onsubmit="event.preventDefault(); fmSubmitForm(this, '${siteId}', 'service', null);" style="display:flex;flex-direction:column;gap:1rem;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            <div><label class="label-we">Your Name</label><input class="form-we" required placeholder="John Smith"></div>
            <div><label class="label-we">Phone</label><input class="form-we" type="tel" required placeholder="(555) 123-4567"></div>
          </div>
          <div><label class="label-we">Email</label><input class="form-we" type="email" required placeholder="john@example.com"></div>
          <div><label class="label-we">Equipment Type</label><input class="form-we" required placeholder="e.g., John Deere 1025R Tractor"></div>
          <div><label class="label-we">Describe the Issue</label><textarea class="form-we" rows="5" required placeholder="Tell us what's going on..."></textarea></div>
          <button type="submit" class="btn-accent" style="width:100%;justify-content:center;">${gc('servicePage.ctaButton') || 'Submit Request'}</button>
        </form>
      </div>
    </div>
  </section>`}
  ${(gc('servicePage.ctaHeading') || gc('servicePage.contentText')) ? `
  <section style="padding:4rem 0;background:${C.secondary};color:${C.bg};text-align:center;">
    <div class="cw">
      ${gc('servicePage.ctaHeading') ? `<h2 class="font-serif" style="font-size:2rem;font-weight:700;margin:0 0 1rem;">${gc('servicePage.ctaHeading')}</h2>` : ''}
      ${gc('servicePage.contentText') ? `<p style="font-size:1.125rem;opacity:0.85;margin:0 0 2rem;">${gc('servicePage.contentText')}</p>` : ''}
      <a href="${baseUrl}${gc('servicePage.ctaLink') || 'contact'}" class="btn-accent" style="background:${C.bg};color:${C.secondary};">${gc('servicePage.ctaButton') || 'Contact Us'}</a>
    </div>
  </section>` : ''}`;
}

// ═══════ CONTACT ═══════
function weContactPage(siteId: string, gc: (k: string) => string, C: any, wk: string, sat: string, sun: string,
  baseUrl: string = ''
): string {
  return `
  ${(() => {
    const cImg = gc('contactPage.heroImage');
    return cImg
      ? `<section data-section="contactHero" style="background-image:url('${cImg}');background-size:cover;background-position:center;padding:4rem 0;text-align:center;position:relative;"><div style="position:absolute;inset:0;background:rgba(92,45,14,0.7);"></div><div class="cw" style="position:relative;z-index:1;"><h1 class="font-serif" style="font-size:2.5rem;font-weight:700;margin:0 0 0.75rem;color:#fef3c7;">${gc('contactPage.heading') || gc('contact.heading')}</h1><p style="font-size:1.125rem;opacity:0.9;max-width:600px;margin:0 auto;color:#fef3c7;">${gc('contactPage.subheading') || gc('contact.description')}</p></div></section>`
      : `<section data-section="contactHero" class="page-hero-we texture-wood"><div class="cw"><h1>${gc('contactPage.heading') || gc('contact.heading')}</h1><p>${gc('contactPage.subheading') || gc('contact.description')}</p></div></section>`;
  })()}
  <section data-section="contactForm" style="padding:6rem 0;">
    <div class="cw">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3rem;">
        <div>
          ${gc('contactPage.contentHeading') ? `<h2 class="font-serif" style="font-size:1.75rem;font-weight:700;margin:0 0 1rem;color:${C.fg};">${gc('contactPage.contentHeading')}</h2>` : ''}
          ${gc('contactPage.contentText') ? `<p style="color:${C.mutedFg};line-height:1.8;margin:0 0 1.5rem;">${gc('contactPage.contentText')}</p>` : ''}
          <h2 class="font-serif" style="font-size:1.75rem;font-weight:700;margin:0 0 1.5rem;color:${C.fg};">${gc('contactPage.introHeading') || "We'd Love to Hear From You"}</h2>
          <p style="color:${C.mutedFg};line-height:1.8;margin:0 0 2rem;">${gc('contactPage.introText') || "Whether you have questions about equipment, need service, or just want to talk with folks who understand the land, we're here to help."}</p>
          <h3 class="font-serif" style="font-size:1rem;font-weight:600;margin:0 0 1rem;color:${C.fg};">${gc('contactPage.locationHeading') || 'Contact Information'}</h3>
          <div style="display:flex;flex-direction:column;gap:1.25rem;">
            ${[
              { icon: '📞', label: 'Give Us a Call', value: gc('business.phone'), href: `tel:${gc('business.phone')}` },
              { icon: '✉️', label: 'Send an Email', value: gc('business.email'), href: `mailto:${gc('business.email')}` },
              { icon: '📍', label: 'Visit Our Showroom', value: gc('business.address') },
            ].map(c => `
            <div class="card-we" style="padding:1.25rem;display:flex;align-items:center;gap:1rem;">
              <div style="background:${C.accent}20;border-radius:0.75rem;padding:0.75rem;font-size:1.25rem;">${c.icon}</div>
              <div>
                <p style="font-weight:600;color:${C.fg};margin:0;font-size:0.9375rem;">${c.label}</p>
                ${c.href ? `<a href="${c.href}" style="color:${C.accent};text-decoration:none;font-weight:500;">${c.value}</a>` : `<span style="color:${C.mutedFg};">${c.value}</span>`}
              </div>
            </div>`).join('')}
            <div class="card-we" style="padding:1.25rem;display:flex;align-items:center;gap:1rem;">
              <div style="background:${C.secondary}20;border-radius:0.75rem;padding:0.75rem;font-size:1.25rem;">🕐</div>
              <div>
                <p style="font-weight:600;color:${C.fg};margin:0 0 0.25rem;font-size:0.9375rem;">Business Hours</p>
                <div style="font-size:0.8125rem;color:${C.mutedFg};line-height:1.6;">
                  <p style="margin:0;">Mon-Fri: ${wk}</p><p style="margin:0;">Saturday: ${sat}</p><p style="margin:0;">Sunday: ${sun}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div class="card-we" style="padding:2rem;">
            <h3 class="font-serif" style="font-size:1.25rem;font-weight:600;margin:0 0 1.5rem;color:${C.fg};">${gc('contactPage.formHeading') || 'Send a Message'}</h3>
            <form onsubmit="event.preventDefault(); fmSubmitForm(this, '${siteId}', 'contact', null);" style="display:flex;flex-direction:column;gap:1rem;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
                <div><label class="label-we">Your Name</label><input class="form-we" required placeholder="John Smith"></div>
                <div><label class="label-we">Phone</label><input class="form-we" type="tel" placeholder="(555) 123-4567"></div>
              </div>
              <div><label class="label-we">Email</label><input class="form-we" type="email" required placeholder="john@example.com"></div>
              <div><label class="label-we">Subject</label><input class="form-we" required placeholder="How can we help?"></div>
              <div><label class="label-we">Your Message</label><textarea class="form-we" rows="5" required placeholder="Tell us what's on your mind..."></textarea></div>
              <button type="submit" class="btn-accent" style="width:100%;justify-content:center;">Send Message</button>
            </form>
          </div>
        </div>
      </div>
      ${gc('contactPage.mapEmbed') ? `<div style="margin-top:3rem;border-radius:1rem;overflow:hidden;border:2px solid #d4b896;">${gc('contactPage.mapEmbed')}</div>` : ''}
    </div>
  </section>`;
}

// ═══════ RENTALS ═══════
async function weRentalsPage(
  siteId: string,
  gc: (k: string) => string,
  C: any,
  baseUrl: string = '',
  supabase?: any,
  hasRentalFeature: boolean = false
): Promise<string> {
  const heading = gc('rentalsPage.heading') || gc('rentals.heading') || 'Equipment Rentals';
  const subheading = gc('rentalsPage.subheading') || gc('rentals.description') || 'Professional equipment for daily, weekly, or monthly rental.';

  let inventorySection = '';
  if (supabase && hasRentalFeature) {
    const { data: rentals } = await supabase
      .from('rental_inventory').select('*').eq('site_id', siteId)
      .eq('status', 'available').order('display_order');
    if (rentals && rentals.length > 0) {
      inventorySection = `
      <section data-section="rentalGrid" style="padding:4rem 0;">
        <div class="cw">
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:2rem;">
            ${rentals.map((item: any) => `
        <div style="border:1px solid #e5e7eb;border-radius:0.5rem;overflow:hidden;background:white;">
          <div style="aspect-ratio:4/3;overflow:hidden;position:relative;background:#f3f4f6;">
            ${item.primary_image ? `<img src="${item.primary_image}" alt="${item.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;">&#x1F69C;</div>`}
            ${!item.quantity_available || item.quantity_available === 0 ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;"><span style="background:#dc2626;color:white;padding:0.375rem 1rem;font-weight:700;font-size:0.875rem;">Currently Rented</span></div>` : `<span style="position:absolute;top:0.75rem;right:0.75rem;background:#8B5E3C;color:white;font-size:0.75rem;font-weight:700;padding:0.25rem 0.5rem;border-radius:0.25rem;">${item.quantity_available} Available</span>`}
          </div>
          <div style="padding:1.25rem;">
            <p style="font-size:0.75rem;font-weight:600;text-transform:uppercase;color:#6b7280;margin:0 0 0.375rem;">${item.category || 'Rental'}</p>
            <h3 style="font-size:1rem;font-weight:700;color:#111827;margin:0 0 0.375rem;">${item.title}</h3>
            ${item.description ? `<p style="font-size:0.875rem;color:#6b7280;margin:0 0 0.75rem;line-height:1.5;">${item.description.substring(0,100)}</p>` : ''}
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin-bottom:0.75rem;text-align:center;background:#f9fafb;border-radius:0.375rem;padding:0.625rem;">
              ${item.daily_rate ? `<div><p style="font-size:0.7rem;color:#6b7280;text-transform:uppercase;margin:0;">Daily</p><p style="font-weight:700;color:#8B5E3C;margin:0;">$${item.daily_rate}</p></div>` : ''}
              ${item.weekly_rate ? `<div><p style="font-size:0.7rem;color:#6b7280;text-transform:uppercase;margin:0;">Weekly</p><p style="font-weight:700;color:#8B5E3C;margin:0;">$${item.weekly_rate}</p></div>` : ''}
              ${item.monthly_rate ? `<div><p style="font-size:0.7rem;color:#6b7280;text-transform:uppercase;margin:0;">Monthly</p><p style="font-weight:700;color:#8B5E3C;margin:0;">$${item.monthly_rate}</p></div>` : ''}
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

  const rImg = gc('rentalsPage.heroImage');
  const heroSection = rImg
    ? `<section data-section="rentalsHero" style="background-image:url('${rImg}');background-size:cover;background-position:center;padding:4rem 0;text-align:center;position:relative;"><div style="position:absolute;inset:0;background:rgba(6,95,70,0.75);"></div><div class="cw" style="position:relative;z-index:1;"><h1 class="font-serif" style="font-size:2.5rem;font-weight:700;color:white;margin:0 0 0.75rem;">${heading}</h1><p style="font-size:1.125rem;color:rgba(255,255,255,0.9);">${subheading}</p></div></section>`
    : `<section data-section="rentalsHero" style="background:${C.secondary};color:${C.bg};padding:4rem 0;text-align:center;"><div class="cw"><h1 class="font-serif" style="font-size:2.5rem;font-weight:700;margin:0 0 0.75rem;">${heading}</h1><p style="font-size:1.125rem;opacity:0.85;">${subheading}</p></div></section>`;

  const infoSection = `
  <section style="padding:3rem 0;background:${C.muted};">
    <div class="cw">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;text-align:center;">
        ${[
          { icon: '📅', title: gc('rentalsPage.info1Title') || 'Flexible Terms', desc: gc('rentalsPage.info1Description') || 'Daily, weekly, or monthly rentals to fit your project' },
          { icon: '⏱', title: gc('rentalsPage.info2Title') || 'Try Before You Buy', desc: gc('rentalsPage.info2Description') || 'Rental fees applied toward purchase of new equipment' },
          { icon: '🌿', title: gc('rentalsPage.info3Title') || 'Well-Maintained', desc: gc('rentalsPage.info3Description') || 'All equipment serviced and inspected before each use' },
        ].map(v => `<div><div style="background:${C.accent};border-radius:9999px;width:4rem;height:4rem;margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;font-size:1.75rem;">${v.icon}</div><h3 class="font-serif" style="font-size:1.125rem;margin:0 0 0.5rem;font-weight:600;">${v.title}</h3><p style="color:${C.mutedFg};font-size:0.9375rem;margin:0;">${v.desc}</p></div>`).join('')}
      </div>
    </div>
  </section>`;

  const fallback = !inventorySection ? `
  <section style="padding:4rem 0;text-align:center;">
    <div class="cw"><p style="font-size:1.125rem;color:${C.mutedFg};margin-bottom:1.5rem;">Contact us for current rental availability.</p>
    <a href="${baseUrl}contact" class="btn-accent">${gc('rentalsPage.ctaButtonText') || 'Reserve Now'}</a></div>
  </section>` : '';

  return heroSection + infoSection + (inventorySection || fallback);
}
// ═══════ MANUFACTURERS ═══════
function weManufacturersPage(siteId: string, gc: (k: string) => string, C: any, manufacturers: any[] = [],
  baseUrl: string = ''
): string {
  const brands = manufacturers.length > 0 ? manufacturers : [
    { name: 'Toro', description: 'Count on it. Professional equipment trusted by landscapers worldwide.' },
    { name: 'John Deere', description: 'Nothing runs like a Deere. Leader in agricultural and outdoor equipment.' },
    { name: 'Stihl', description: 'The world\'s best-selling brand of chainsaws. German engineering excellence.' },
    { name: 'Husqvarna', description: 'Rethink the outdoors. Innovation in outdoor power equipment.' },
    { name: 'Cub Cadet', description: 'Strong. Reliable. Built to serve. Quality equipment for every property.' },
    { name: 'Honda', description: 'The Power of Dreams. Engines known for reliability and performance.' },
  ];
  return `
  ${(() => {
    const mImg = gc('manufacturersPage.heroImage');
    return mImg
      ? `<section data-section="mfgHero" style="background-image:url('${mImg}');background-size:cover;background-position:center;padding:4rem 0;text-align:center;position:relative;"><div style="position:absolute;inset:0;background:rgba(6,95,70,0.75);"></div>`
      : `<section data-section="mfgHero" style="background:${C.secondary};color:${C.bg};padding:4rem 0;text-align:center;" class="texture-wood">`;
  })()}
    <div class="cw"><h1 class="font-serif" style="font-size:2.5rem;font-weight:700;margin:0 0 0.75rem;">${gc('manufacturersPage.heading') || gc('manufacturers.pageHeading')}</h1><p style="font-size:1.125rem;opacity:0.85;">${gc('manufacturersPage.subheading') || gc('manufacturers.pageDescription')}</p></div>
  </section>
  <section data-section="manufacturersList" style="padding:6rem 0;">
    <div class="cw">
      ${gc('manufacturersPage.contentHeading') ? `<h2 class="font-serif" style="font-size:1.75rem;font-weight:700;margin:0 0 1rem;color:${C.fg};">${gc('manufacturersPage.contentHeading')}</h2>` : ''}
      ${gc('manufacturersPage.contentText') ? `<p style="color:${C.mutedFg};line-height:1.8;margin:0 0 2rem;">${gc('manufacturersPage.contentText')}</p>` : ''}
      ${gc('manufacturersPage.introText') ? `<p style="text-align:center;font-size:1.125rem;color:${C.mutedFg};max-width:700px;margin:0 auto 3rem;">${gc('manufacturersPage.introText')}</p>` : ''}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:2rem;">
        ${brands.map(b => `
        <div class="card-we" style="padding:2rem;text-align:center;">
          <div style="height:5rem;background:${C.muted};border-radius:0.75rem;display:flex;align-items:center;justify-content:center;margin-bottom:1.25rem;padding:0.5rem;">
            ${(b.logo_url || b.logoUrl) ? `<img src="${b.logo_url || b.logoUrl}" alt="${b.name}" style="height:52px;width:auto;">` : `<span style="font-weight:700;color:${C.secondary};">${b.name}</span>`}
          </div>
          <span style="display:inline-block;font-size:0.75rem;color:${C.secondary};font-weight:600;border:1px solid ${C.secondary};padding:0.2rem 0.6rem;border-radius:9999px;margin-bottom:1rem;">✦ Trusted Partner</span>
          ${b.description ? `<p style="color:${C.mutedFg};font-size:0.9375rem;line-height:1.7;margin:0 0 1rem;">${b.description}</p>` : ''}
          <a href="${baseUrl}contact" style="display:inline-flex;align-items:center;gap:0.25rem;font-size:0.875rem;font-weight:600;color:${C.secondary};text-decoration:none;">Learn More →</a>
        </div>`).join('')}
      </div>
    </div>
  </section>
  ${(gc('manufacturersPage.whyHeading') || gc('manufacturersPage.whyText1')) ? `
  <section style="padding:6rem 0;background:${C.muted};">
    <div class="cw" style="max-width:800px;margin:0 auto;">
      ${gc('manufacturersPage.whyHeading') ? `<h2 class="font-serif" style="font-size:2rem;font-weight:700;margin:0 0 2rem;color:${C.fg};">${gc('manufacturersPage.whyHeading')}</h2>` : ''}
      ${gc('manufacturersPage.whyText1') ? `<p style="color:${C.mutedFg};line-height:1.8;margin:0 0 1.5rem;">${gc('manufacturersPage.whyText1')}</p>` : ''}
      ${gc('manufacturersPage.whyText2') ? `<p style="color:${C.mutedFg};line-height:1.8;">${gc('manufacturersPage.whyText2')}</p>` : ''}
    </div>
  </section>` : ''}
  ${(gc('manufacturersPage.ctaHeading') || gc('manufacturersPage.ctaText')) ? `
  <section style="padding:4rem 0;background:${C.secondary};color:${C.bg};text-align:center;">
    <div class="cw">
      ${gc('manufacturersPage.ctaHeading') ? `<h2 class="font-serif" style="font-size:2rem;font-weight:700;margin:0 0 1rem;">${gc('manufacturersPage.ctaHeading')}</h2>` : ''}
      ${gc('manufacturersPage.ctaText') ? `<p style="font-size:1.125rem;opacity:0.85;margin:0 0 2rem;">${gc('manufacturersPage.ctaText')}</p>` : ''}
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        ${gc('manufacturersPage.ctaPrimaryText') ? `<a href="${baseUrl}${gc('manufacturersPage.ctaPrimaryLink') || 'inventory'}" class="btn-accent">${gc('manufacturersPage.ctaPrimaryText')}</a>` : ''}
        ${gc('manufacturersPage.ctaSecondaryText') ? `<a href="${baseUrl}${gc('manufacturersPage.ctaSecondaryLink') || 'contact'}" class="btn-outline-we" style="color:${C.bg};border-color:${C.bg};">${gc('manufacturersPage.ctaSecondaryText')}</a>` : ''}
      </div>
    </div>
  </section>` : ''}`;
}
