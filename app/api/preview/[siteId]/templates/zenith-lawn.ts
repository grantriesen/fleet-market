// ─── Zenith Lawn ── Standalone Template ──────────────────────────────────
// Design: Ultra-minimalist. Monochrome (black/white/gray) with green accent.
//         Inter font (300-600), massive whitespace, thin 1px borders,
//         text-only brand display, clean product cards, fade-in animations.
// ─────────────────────────────────────────────────────────────────────────

/* ── DEMO overrides ── */
export const ZENITH_LAWN_DEMO_OVERRIDES = {
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
  'hero.subheading': 'Quality equipment from the world\'s leading manufacturers. Expert service and support.',
  'hero.ctaPrimary': 'View Inventory',
  'hero.image': '/images/hero-mower.jpg',
  'services.heading': 'Service & Repair',
  'services.description': 'Our certified technicians provide expert maintenance and repair services for all major brands of lawn care equipment.',
  'contact.heading': 'Contact Us',
  'contact.description': "We're here to help with any questions about our equipment, services, or rentals.",
  'inventory.heading': 'Inventory',
  'rentals.heading': 'Equipment Rentals',
  'rentals.description': 'Professional-grade equipment available for short or long-term rental.',
  'manufacturers.heading': 'Our Manufacturers',
  'manufacturers.description': "We are proud to be an authorized dealer for the world's most trusted lawn care equipment brands.",
  'footer.tagline': 'Premium Lawn Care Solutions',
  'testimonials.items': JSON.stringify([
    { quote: "Zenith Equipment transformed our commercial landscape operation. Their expertise in matching us with the right equipment has been invaluable.", name: 'Michael Torres', company: 'Torres Landscaping Co.' },
  ]),
};

export const ZENITH_LAWN_SAMPLE_PRODUCTS = [
  { id: 'demo-1', name: 'X350 Select Series', brand: 'John Deere', price: 3499, category: 'Tractors', condition: 'new', image_url: '', description: 'Professional-grade lawn tractor with premium comfort features.' },
  { id: 'demo-2', name: 'Automower 450X', brand: 'Husqvarna', price: 4999, category: 'Mowers', condition: 'new', image_url: '', description: 'Intelligent robotic mower with GPS navigation.' },
  { id: 'demo-3', name: 'FS 131 Trimmer', brand: 'Stihl', price: 449, category: 'Trimmers', condition: 'new', image_url: '', description: 'Powerful professional trimmer with low emissions.' },
  { id: 'demo-4', name: 'HRX217VKA', brand: 'Honda', price: 849, sale_price: 749, category: 'Mowers', condition: 'new', image_url: '', description: 'Premium residential mower with Versamow system.' },
  { id: 'demo-5', name: '1025R Compact Tractor', brand: 'John Deere', price: 14999, category: 'Tractors', condition: 'new', image_url: '', description: 'Versatile compact utility tractor.' },
  { id: 'demo-6', name: '525BX Blower', brand: 'Husqvarna', price: 329, category: 'Blowers', condition: 'used', hours: 45, image_url: '', description: 'Commercial-grade handheld blower.' },
];

// ── Main Entry ──
export async function renderZenithLawnPage(
  siteId: string,
  currentPage: string,
  pages: any[],
  products: any[],
  config: any,
  customizations: any,
  enabledFeatures: Set<string>,
  vis: Record<string, boolean>,
  content: Record<string, string> = {},
  baseUrl: string = `/api/preview/${siteId}?page=`,
  supabase?: any,
  siteAddons: string[] = [],
  checkoutMode: string = 'quote_only',
  stripeConnected: boolean = false,
  manufacturers: any[] = []
) {
  const ZL_KEY_ALIASES: Record<string, string> = {
    'business.name':    'businessInfo.businessName',
    'business.phone':   'businessInfo.phone',
    'business.email':   'businessInfo.email',
    'business.address': 'businessInfo.address',
    'business.tagline': 'businessInfo.tagline',
    'business.hours':   'hours.hours',
  };
  const getContent = (key: string): string => {
    // 1. Direct lookup in live content
    if (content[key]) return content[key];
    // 2. Try alias (e.g. business.name -> businessInfo.businessName)
    const aliasKey = ZL_KEY_ALIASES[key];
    if (aliasKey && content[aliasKey]) return content[aliasKey];
    // 3. Fall back to config_json section defaults
    const parts = key.split('.');
    if (parts.length === 2) {
      const [section, field] = parts;
      const def = config?.sections?.[section]?.[field]?.default;
      if (def) return def;
    }
    // 4. Try alias default from config
    if (aliasKey) {
      const ap = aliasKey.split('.');
      if (ap.length === 2) {
        const def = config?.sections?.[ap[0]]?.[ap[1]]?.default;
        if (def) return def;
      }
    }
    return '';
  };
  const colors = {
    primary: customizations?.colors?.primary || config?.colors?.primary?.default || '#171717',
    secondary: customizations?.colors?.secondary || config?.colors?.secondary?.default || '#f5f5f5',
    accent: customizations?.colors?.accent || config?.colors?.accent?.default || '#22c55e',
  };
  const fonts = {
    heading: customizations?.fonts?.heading || config?.fonts?.heading?.default || 'Inter',
    body: customizations?.fonts?.body || config?.fonts?.body?.default || 'Inter',
  };

  let hours: any = {};
  const hoursRaw = getContent('business.hours') || getContent('businessInfo.hours') || '';
  if (hoursRaw.startsWith('{')) {
    try { hours = JSON.parse(hoursRaw); } catch {}
  }
  const fmt = (t: string) => { if (!t) return ''; const [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; return `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, '0')} ${ap}`; };
  const fmtRange = (d: any) => (!d?.open || !d?.close) ? 'Closed' : `${fmt(d.open)} – ${fmt(d.close)}`;
  const hoursLine = `Mon–Fri: ${fmtRange(hours.monday)} | Sat: ${fmtRange(hours.saturday)} | Sun: ${fmtRange(hours.sunday)}`;

  let body = '';
  switch (currentPage) {
    case 'home': case 'index': body = zlHome(siteId, getContent, products, vis, colors, baseUrl, manufacturers || []); break;
    case 'service': body = zlService(siteId, getContent, baseUrl, colors, enabledFeatures.has('service_scheduling')); break;
    case 'contact': body = zlContact(siteId, getContent, hoursLine, baseUrl); break;
    case 'inventory': body = zlInventory(siteId, getContent, products, baseUrl); break;
    case 'rentals': body = await zlRentals(siteId, getContent, baseUrl, supabase, enabledFeatures.has('rental_scheduling') || siteAddons.includes('rentals')); break;
    case 'manufacturers': body = zlManufacturers(siteId, getContent, baseUrl); break;
    default: body = zlHome(siteId, getContent, products, vis, colors, baseUrl, manufacturers || []); break;
  }

  return zlShell(
    getContent('businessInfo.businessName') || getContent('business.name') || 'Zenith Equipment',
    fonts, colors,
    zlHeader(siteId, currentPage, pages, getContent, baseUrl) + body + zlFooter(siteId, pages, getContent, hoursLine, baseUrl),
    siteId,
    enabledFeatures,
    checkoutMode,
    currentPage
  );
}

// ── HTML Shell ──
function zlShell(title: string, fonts: any, colors: any, body: string, siteId: string = '', enabledFeatures?: Set<string>, checkoutMode: string = 'quote_only', currentPage: string = 'home') {
  const fontFamilies = new Set([fonts.heading, fonts.body]);
  const gUrl = Array.from(fontFamilies).map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap`).join('&');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?${gUrl}" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
  tailwind.config = {
    theme: { extend: {
      fontFamily: { sans: ['${fonts.body}','system-ui','sans-serif'] },
      colors: { accent: '${colors.accent}' },
    }}
  }
  </script>
  <style>
    body { font-family: '${fonts.body}',system-ui,sans-serif; background: #fafafa; color: #171717; -webkit-font-smoothing: antialiased; }
    .transition-slow { transition: all 0.5s ease-out; }
    .section-spacing { padding: 5rem 0; }
    @media(min-width:768px){ .section-spacing { padding: 8rem 0; } }
    .container-narrow { max-width: 72rem; margin: 0 auto; padding: 0 1.5rem; }
    @media(min-width:768px){ .container-narrow { padding: 0 3rem; } }
    @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
  </style>
</head>
<body>${body}<script>
  function fmSubmitForm(form,siteId,formType,extraFn){var btn=form.querySelector('button[type="submit"]');var orig=btn?btn.innerHTML:'';if(btn){btn.disabled=true;btn.innerHTML='Submitting...';}var nameEl=form.querySelector('input[type="text"]');var emailEl=form.querySelector('input[type="email"]');var phoneEl=form.querySelector('input[type="tel"]');var msgEl=form.querySelector('textarea');var data={site_id:siteId,form_type:formType,name:nameEl?nameEl.value:null,email:emailEl?emailEl.value:null,phone:phoneEl?phoneEl.value:null,message:msgEl?msgEl.value:null,extra_data:extraFn?extraFn(form):null};fetch('/api/submit-form',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(function(r){return r.json();}).then(function(res){if(res.success){var suc=form.parentElement?form.parentElement.querySelector('[data-fm-success]'):null;if(suc){form.style.display='none';suc.style.display='block';}else{form.reset();if(btn){btn.innerHTML='\u2713 Submitted!';btn.style.background='#16a34a';}}}else{if(btn){btn.disabled=false;btn.innerHTML=orig;}alert('Something went wrong. Please try again.');}}).catch(function(){if(btn){btn.disabled=false;btn.innerHTML=orig;}alert('Something went wrong. Please try again.');});}
</script>${enabledFeatures?.has('rental_scheduling') ? rentalModalBlock('fm', siteId) : ''}
  ${sharedPreviewScript(siteId, currentPage)}
  ${injectCartSystem(siteId, checkoutMode, colors.accent)}
</body>
</html>`;
}

// ── Header ──
function zlHeader(siteId: string, currentPage: string, pages: any[], getContent: Function,
  baseUrl: string = ''
) {
  const name = getContent('businessInfo.businessName') || getContent('business.name') || 'Zenith Equipment';
  const links = pages.map(p => {
    const active = p.slug === currentPage || (p.slug === 'index' && (currentPage === 'home' || currentPage === 'index'));
    return `<a href="${baseUrl}${p.slug}" class="text-sm transition-slow ${active ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-900'}">${p.name}</a>`;
  }).join('\n');

  return `
  <header class="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200" style="background: rgba(250,250,250,0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
    <nav class="container-narrow">
      <div class="flex items-center justify-between h-16 md:h-20">
        <a href="${baseUrl}index" class="flex items-center">
          ${getContent('businessInfo.logoImage')
            ? `<img src="${getContent('businessInfo.logoImage')}" alt="${name}" style="max-height: 44px; max-width: 160px; object-fit: contain;">`
            : `<span class="text-lg md:text-xl font-medium tracking-tight text-neutral-900">${name}</span>`}
        </a>
        <div class="hidden md:flex items-center gap-8">${links}</div>
        <!-- Mobile: scrollable row below -->
        <div class="md:hidden">
          <a href="${baseUrl}contact" class="text-sm text-neutral-400 hover:text-neutral-900 transition-slow">Contact</a>
        </div>
      </div>
      <div class="md:hidden overflow-x-auto pb-3 -mx-6 px-6">
        <div class="flex items-center gap-6 min-w-max">
          ${pages.map(p => {
            const active = p.slug === currentPage || (p.slug === 'index' && (currentPage === 'home' || currentPage === 'index'));
            return `<a href="${baseUrl}${p.slug}" class="text-xs whitespace-nowrap transition-slow ${active ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-900'}">${p.name}</a>`;
          }).join('\n')}
        </div>
      </div>
    </nav>
  </header>
  <div style="height: 80px;"></div>`;
}

// ── Footer ──
function zlFooter(siteId: string, pages: any[], getContent: Function, hoursLine: string,
  baseUrl: string = ''
) {
  const name = getContent('businessInfo.businessName') || getContent('business.name') || 'Zenith Equipment';
  const tagline = getContent('footer.tagline') || getContent('businessInfo.tagline') || '';
  return `
  <footer class="border-t border-neutral-200">
    <div class="container-narrow py-16 md:py-24">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
        <div>
          <h3 class="text-lg font-medium mb-4">${name}</h3>
          <p class="text-sm text-neutral-500 leading-relaxed">${tagline}</p>
        </div>
        <div>
          <h4 class="text-sm font-medium mb-4">Navigation</h4>
          <div class="flex flex-col gap-3">
            ${pages.filter(p => p.slug !== 'index').map(p =>
              `<a href="${baseUrl}${p.slug}" class="text-sm text-neutral-500 transition-slow hover:text-neutral-900">${p.name}</a>`
            ).join('\n')}
          </div>
        </div>
        <div>
          <h4 class="text-sm font-medium mb-4">Contact</h4>
          <div class="flex flex-col gap-3 text-sm text-neutral-500">
            ${(getContent('businessInfo.address') || getContent('business.address')) ? `<p>${getContent('businessInfo.address') || getContent('business.address')}</p>` : ''}
            ${(getContent('businessInfo.phone') || getContent('business.phone')) ? `<p>${getContent('businessInfo.phone') || getContent('business.phone')}</p>` : ''}
            ${(getContent('businessInfo.email') || getContent('business.email')) ? `<p>${getContent('businessInfo.email') || getContent('business.email')}</p>` : ''}
            ${(getContent('businessInfo.hours') || getContent('businessInfo.saturdayHours')) ? `<div style="display:flex;flex-direction:column;gap:0.25rem;">` + (getContent('businessInfo.hours') ? `<p>${getContent('businessInfo.hours')}</p>` : '') + (getContent('businessInfo.saturdayHours') ? `<p>${getContent('businessInfo.saturdayHours')}</p>` : '') + (getContent('businessInfo.sundayHours') ? `<p>${getContent('businessInfo.sundayHours')}</p>` : '') + `</div>` : (getContent('hours.hours') ? `<p>${getContent('hours.hours')}</p>` : '')}
          </div>
        </div>
      </div>
      <div class="mt-16 pt-8 border-t border-neutral-200">
        <p class="text-xs text-neutral-400">&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p>
      </div>
    </div>
  </footer>`;
}

// ── Home ──
function zlHome(siteId: string, getContent: Function, products: any[], vis: Record<string, boolean>, colors: any,
  baseUrl: string = '',
  manufacturers: any[] = []
) {
  let html = '';

  // Hero
  if (vis.hero !== false) {
    const img = getContent('hero.image') || '/images/hero-mower.jpg';
    html += `
    <section data-section="hero" class="relative flex items-center" style="min-height: 80vh;">
      <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('${img}');"></div>
      <div class="absolute inset-0" style="background: linear-gradient(to right, rgba(250,250,250,0.95), rgba(250,250,250,0.8), rgba(250,250,250,0.4));"></div>
      <div class="container-narrow relative z-10 py-20 md:py-32">
        <div class="max-w-2xl">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-neutral-900 mb-6 animate-fade-in">
            ${getContent('hero.heading') || getContent('hero.title') || 'Premium lawn care equipment for professionals.'}
          </h1>
          <p class="text-lg md:text-xl text-neutral-500 mb-10 max-w-xl animate-fade-in" style="animation-delay:0.1s;">
            ${getContent('hero.subheading') || getContent('hero.subtitle') || ''}
          </p>
          <div class="animate-fade-in" style="animation-delay:0.2s;">
            <a href="${getContent('hero.button1.destination') === '__custom' ? getContent('hero.button1.destination_url') : `${baseUrl}${getContent('hero.button1.destination') || 'inventory'}`}"
              class="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium text-white transition-slow hover:opacity-90"
              style="background-color: ${colors.accent};">
              ${getContent('hero.button1.text') || getContent('hero.ctaPrimary') || 'View Inventory'}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>`;
  }

  // Featured Products
  if (vis.featuredProducts !== false && products.length > 0) {
    html += `
    <section data-section="featuredProducts" class="section-spacing border-t border-neutral-200">
      <div class="container-narrow">
        <div class="flex items-end justify-between mb-12">
          <h2 class="text-3xl md:text-4xl font-light tracking-tight">${getContent('featured.heading') || 'Featured'}</h2>
          <a href="${baseUrl}inventory" class="text-sm text-neutral-500 hover:text-neutral-900 transition-slow">View all</a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          ${products.slice(0, 4).map((p: any) => zlProductCard(siteId, p)).join('')}
        </div>
      </div>
    </section>`;
  }

  // Brands
  if (vis.manufacturers !== false && manufacturers && manufacturers.length > 0) {
    html += `
    <section data-section="manufacturers" class="section-spacing border-t border-neutral-200">
      <div class="container-narrow">
        <p class="text-xs text-neutral-400 uppercase tracking-widest text-center mb-12">${getContent('manufacturers.heading') || 'Authorized Dealer'}</p>
        <div class="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          ${manufacturers.slice(0, 8).map((m: any) => {
            const logoSrc = m.logo_url || m.logoUrl || '';
            return logoSrc
              ? `<img src="${logoSrc}" alt="${m.name}" style="height: 44px; width: auto; opacity: 0.5; transition: opacity 0.4s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">`
              : `<span style="font-size: 0.875rem; font-weight: 600; color: #737373; opacity: 0.7;">${m.name}</span>`;
          }).join('')}
        </div>
      </div>
    </section>`;
  }

  // Testimonial
  if (vis.testimonials !== false) {
    let testimonials: any[] = [];
    try { testimonials = JSON.parse(getContent('testimonials.items') || '[]'); } catch {}
    if (testimonials.length > 0) {
      const t = testimonials[0];
      html += `
      <section data-section="testimonials" class="section-spacing border-t border-neutral-200">
        <div class="container-narrow">
          <div class="max-w-3xl mx-auto text-center">
            ${getContent('testimonials.heading') ? `<p class="text-xs text-neutral-400 uppercase tracking-widest mb-12">${getContent('testimonials.heading')}</p>` : ''}
            <blockquote class="text-2xl md:text-3xl font-light leading-relaxed text-neutral-900 mb-8">"${t.content || t.quote || ''}"</blockquote>
            <div>
              <p class="text-sm font-medium">${t.name || t.author || ''}</p>
              <p class="text-sm text-neutral-500">${t.role || t.title || t.company || ''}</p>
            </div>
          </div>
        </div>
      </section>`;
    }
  }

  // CTA
  if (vis.cta !== false) {
    const ctaHeading = getContent('cta.heading');
    const ctaSubheading = getContent('cta.subheading');
    const ctaBtnText = getContent('cta.button1.text') || getContent('cta.button') || getContent('cta.ctaPrimary') || 'Get Started';
    const ctaBtnDest = getContent('cta.button1.destination') === '__custom' ? getContent('cta.button1.destination_url') : `${baseUrl}${getContent('cta.button1.destination') || 'contact'}`;
    if (ctaHeading || ctaSubheading) {
      html += `
      <section data-section="cta" class="section-spacing border-t border-neutral-200">
        <div class="container-narrow">
          <div style="background: linear-gradient(135deg, ${colors.accent}, ${colors.primary}); border-radius: 0.75rem; padding: 5% 10%; margin: 0 auto;">
            ${ctaHeading ? `<h2 class="text-3xl md:text-4xl font-light tracking-tight text-white mb-6">${ctaHeading}</h2>` : ''}
            ${ctaSubheading ? `<p class="text-lg mb-10" style="color: rgba(255,255,255,0.85);">${ctaSubheading}</p>` : ''}
            <a href="${ctaBtnDest}"
              class="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium transition-slow hover:opacity-90"
              style="background-color: #fff; color: ${colors.accent};">
              ${ctaBtnText}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
          </div>
        </div>
      </section>`;
    }
  }

  return html;
}

// ── Product Card ──
function zlProductCard(siteId: string, p: any, baseUrl: string = '') {
  const imgUrl = p.image_url || p.primary_image || '';
  const hasImage = imgUrl && !imgUrl.includes('placeholder');
  const productName = p.name || p.title || '';
  const price = p.sale_price || p.price;
  const productData = JSON.stringify({
    id: p.id, title: productName, description: p.description,
    price: p.price, sale_price: p.sale_price,
    primary_image: imgUrl, category: p.category, model: p.model, slug: p.slug,
  }).replace(/"/g, '&quot;');
  return `
  <div class="group block cursor-pointer" onclick="fmOpenProduct(${productData})">
    <div class="aspect-[4/3] overflow-hidden bg-neutral-100 mb-4">
      ${hasImage
        ? `<img src="${imgUrl}" alt="${productName}" class="w-full h-full object-cover transition-slow group-hover:scale-105 group-hover:opacity-90"/>`
        : `<div class="w-full h-full flex items-center justify-center">
            <svg class="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          </div>`}
    </div>
    <div class="space-y-1">
      <p class="text-xs text-neutral-400 uppercase tracking-wider">${p.brand || ''}</p>
      <h3 class="text-base font-medium group-hover:opacity-70 transition-slow">${productName}</h3>
      <div class="flex items-center justify-between">
        <p class="text-sm text-neutral-500">
          ${p.sale_price ? `<span class="line-through text-neutral-300 mr-2">$${Number(p.price).toLocaleString()}</span>` : ''}
          ${price ? '$' + Number(price).toLocaleString() : 'Call for Price'}
          ${p.condition === 'used' ? ` <span class="text-xs text-neutral-400">· Used${p.hours ? ` ${p.hours}hrs` : ''}</span>` : ''}
        </p>
        <span class="text-xs text-neutral-400 group-hover:text-neutral-900 transition-slow">View →</span>
      </div>
    </div>
  </div>`;
}

// ── Service ──
function zlService(siteId: string, getContent: Function,
  baseUrl: string = '',
  colors: any = {},
  hasScheduler: boolean = false
) {
  const contentHeading = getContent('servicePage.contentHeading');
  const contentText = getContent('servicePage.contentText');
  const ctaHeading = getContent('servicePage.ctaHeading');
  const ctaBtnText = getContent('servicePage.ctaButton.text') || getContent('servicePage.ctaButtonText') || 'Schedule Service';

  // Build service cards from config fields
  const serviceCards = [1, 2, 3].map(i => {
    const title = getContent(`servicePage.service${i}Title`);
    const desc = getContent(`servicePage.service${i}Description`);
    const img = getContent(`servicePage.service${i}Image`);
    if (!title) return '';
    return `
    <div class="border border-neutral-200 rounded overflow-hidden">
      ${img ? `<div class="aspect-[4/3] overflow-hidden"><img src="${img}" alt="${title}" class="w-full h-full object-cover"/></div>` : ''}
      <div class="p-6">
        <h3 class="text-base font-medium mb-2">${title}</h3>
        ${desc ? `<p class="text-sm text-neutral-500">${desc}</p>` : ''}
      </div>
    </div>`;
  }).filter(Boolean);

  const defaultServices = ['Routine maintenance & tune-ups','Engine diagnostics & repair','Blade sharpening & replacement','Electrical system repair','Seasonal winterization','Warranty service for authorized brands'];

  // CTA section — button snap scrolls to form
  const ctaSection = ctaHeading ? `
  <section data-section="serviceCta" class="section-spacing border-t border-neutral-200">
    <div class="container-narrow">
      <div style="background: linear-gradient(135deg, ${colors.accent}, ${colors.primary}); border-radius: 0.75rem; padding: 5% 10%;">
        <h2 class="text-3xl md:text-4xl font-light tracking-tight text-white mb-6">${ctaHeading}</h2>
        <button onclick="document.getElementById('zl-service-form').scrollIntoView({behavior:'smooth'})"
          class="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium transition-slow hover:opacity-90"
          style="background-color: #fff; color: ${colors.accent};">
          ${ctaBtnText}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
        </button>
      </div>
    </div>
  </section>` : '';

  // Premium scheduler (GVI pattern) or simple form
  const formSection = hasScheduler ? `
  <section id="zl-service-form" data-section="serviceForm" class="section-spacing border-t border-neutral-200">
    <div class="container-narrow">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-2xl font-light mb-2">Schedule Service Online</h2>
        <p class="text-neutral-500 mb-8">Pick a service, choose your time, and we'll take care of the rest.</p>
        <div id="zl-sf-booking-form" class="border border-neutral-200 rounded p-8">
          <div id="zl-sf-step-1">
            <p class="text-xs uppercase tracking-widest mb-4" style="color: ${colors.accent};">1. Select a Service</p>
            <div id="zl-sf-service-list" class="flex flex-col gap-2">
              <div class="text-center py-6 text-neutral-400">Loading services...</div>
            </div>
          </div>
          <div id="zl-sf-step-2" style="display:none;" class="mt-6 pt-6 border-t border-neutral-200">
            <p class="text-xs uppercase tracking-widest mb-4" style="color: ${colors.accent};">2. Choose Date & Time</p>
            <div class="grid md:grid-cols-2 gap-4">
              <div><label class="text-xs uppercase tracking-wider text-neutral-400 mb-2 block">Preferred Date *</label><input type="date" id="zl-sf-date" required class="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"></div>
              <div><label class="text-xs uppercase tracking-wider text-neutral-400 mb-2 block">Preferred Time *</label><select id="zl-sf-time" required class="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"><option value="">Select time</option></select></div>
            </div>
          </div>
          <div id="zl-sf-step-3" style="display:none;" class="mt-6 pt-6 border-t border-neutral-200">
            <p class="text-xs uppercase tracking-widest mb-4" style="color: ${colors.accent};">3. Your Information</p>
            <div class="space-y-4">
              <div class="grid md:grid-cols-2 gap-4">
                <div><label class="text-xs uppercase tracking-wider text-neutral-400 mb-2 block">Name *</label><input type="text" id="zl-sf-name" required class="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"></div>
                <div><label class="text-xs uppercase tracking-wider text-neutral-400 mb-2 block">Phone *</label><input type="tel" id="zl-sf-phone" required placeholder="(555) 123-4567" class="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"></div>
              </div>
              <div><label class="text-xs uppercase tracking-wider text-neutral-400 mb-2 block">Email *</label><input type="email" id="zl-sf-email" required class="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"></div>
              <div><label class="text-xs uppercase tracking-wider text-neutral-400 mb-2 block">Equipment Details</label><input type="text" id="zl-sf-equipment" placeholder='e.g., John Deere X350' class="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-900"></div>
              <div><label class="text-xs uppercase tracking-wider text-neutral-400 mb-2 block">Notes</label><textarea id="zl-sf-notes" rows="3" placeholder="Describe the issue..." class="w-full border border-neutral-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 resize-y"></textarea></div>
              <button id="zl-sf-submit" class="w-full px-6 py-3 rounded text-sm font-medium text-white transition-slow hover:opacity-90" style="background-color: ${colors.accent};">Schedule Service</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <script>
    (function() {
      var siteId = '${siteId}';
      var selectedService = null;
      fetch('/api/service/types/' + siteId)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          var list = document.getElementById('zl-sf-service-list');
          if (!list) return;
          var types = data.types || data.serviceTypes || data || [];
          if (!types.length) { list.innerHTML = '<div class="text-center py-4 text-neutral-400">No services configured yet. Please contact us directly.</div>'; return; }
          list.innerHTML = '';
          types.forEach(function(st) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.style.cssText = 'text-align:left;padding:0.75rem 1rem;border:1px solid #e5e5e5;border-radius:0.375rem;background:#fff;cursor:pointer;width:100%;transition:border-color 0.3s;';
            btn.innerHTML = '<div style="font-size:0.9375rem;font-weight:500;color:#171717;">' + st.name + '</div>' + (st.description ? '<div style="font-size:0.8125rem;color:#737373;margin-top:0.25rem;">' + st.description + (st.duration_minutes ? ' · ' + st.duration_minutes + ' min' : '') + '</div>' : '');
            btn.addEventListener('mouseover', function() { if (!this.classList.contains('selected')) this.style.borderColor = '${colors.accent}'; });
            btn.addEventListener('mouseout', function() { if (!this.classList.contains('selected')) this.style.borderColor = '#e5e5e5'; });
            btn.addEventListener('click', function() {
              document.querySelectorAll('#zl-sf-service-list button').forEach(function(b) { b.style.borderColor='#e5e5e5'; b.style.background='#fff'; b.classList.remove('selected'); });
              this.style.borderColor = '${colors.accent}'; this.style.background = '#fafafa'; this.classList.add('selected');
              selectedService = st;
              document.getElementById('zl-sf-step-2').style.display = '';
              var sel = document.getElementById('zl-sf-time');
              sel.innerHTML = '<option value="">Select time</option>';
              ['8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM'].forEach(function(t) { var o=document.createElement('option'); o.value=t; o.textContent=t; sel.appendChild(o); });
            });
            list.appendChild(btn);
          });
        })
        .catch(function() { var l=document.getElementById('zl-sf-service-list'); if(l) l.innerHTML='<div class="text-center py-4 text-neutral-400">Unable to load services. Please call us directly.</div>'; });
      var dateInput = document.getElementById('zl-sf-date');
      var timeInput = document.getElementById('zl-sf-time');
      if (dateInput) { dateInput.min = new Date().toISOString().split('T')[0]; dateInput.addEventListener('change', checkStep3); }
      if (timeInput) timeInput.addEventListener('change', checkStep3);
      function checkStep3() { if (dateInput.value && timeInput.value) document.getElementById('zl-sf-step-3').style.display = ''; }
      var submitBtn = document.getElementById('zl-sf-submit');
      if (submitBtn) {
        submitBtn.addEventListener('click', function() {
          var name=document.getElementById('zl-sf-name').value, phone=document.getElementById('zl-sf-phone').value, email=document.getElementById('zl-sf-email').value;
          if (!name||!phone||!email||!selectedService) { alert('Please fill in all required fields.'); return; }
          submitBtn.textContent='Scheduling...'; submitBtn.disabled=true;
          fetch('/api/service/book/' + siteId, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ siteId:siteId, serviceTypeId:selectedService.id, serviceTypeName:selectedService.name, preferredDate:dateInput.value, preferredTime:timeInput.value, customerName:name, customerPhone:phone, customerEmail:email, equipmentType:document.getElementById('zl-sf-equipment').value, customerNotes:document.getElementById('zl-sf-notes').value }) })
          .then(function(r){return r.json();}).then(function(res){
            if(res.error){alert('Error: '+res.error);submitBtn.textContent='Schedule Service';submitBtn.disabled=false;}
            else{document.getElementById('zl-sf-booking-form').innerHTML='<div style="text-align:center;padding:3rem 0;"><div style="font-size:3rem;margin-bottom:1rem;">✓</div><h3 style="font-size:1.5rem;font-weight:300;margin:0 0 0.5rem;">Service Scheduled!</h3><p style="color:#737373;">We will confirm your appointment within 1 business day.</p></div>';}
          }).catch(function(){alert('Something went wrong.');submitBtn.textContent='Schedule Service';submitBtn.disabled=false;});
        });
      }
    })();
  <\/script>` : `
  <section id="zl-service-form" data-section="serviceForm" class="section-spacing border-t border-neutral-200">
    <div class="container-narrow">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-2xl font-light mb-8">Request Service</h2>
        ${zlForm(siteId, [
          { label: 'First Name', type: 'text', half: true },
          { label: 'Last Name', type: 'text', half: true },
          { label: 'Email', type: 'email' },
          { label: 'Phone', type: 'tel' },
          { label: 'Equipment Type & Model', type: 'text', placeholder: 'e.g., John Deere X350' },
          { label: 'Issue Description', type: 'textarea', placeholder: 'Please describe the issue or service needed...' },
        ], 'Submit Request')}
      </div>
    </div>
  </section>`;

  return zlPageHero(getContent, 'servicePage', 'Service & Repair', getContent('servicePage.subheading') || '') + `
  <section data-section="serviceContent" class="section-spacing">
    <div class="container-narrow">
      ${(contentHeading || contentText) ? `
      <div class="mb-12">
        ${contentHeading ? `<h2 class="text-2xl font-light mb-4">${contentHeading}</h2>` : ''}
        ${contentText ? `<p class="text-neutral-500">${contentText}</p>` : ''}
      </div>` : ''}
      ${serviceCards.length > 0
        ? `<div class="grid grid-cols-1 sm:grid-cols-${Math.min(serviceCards.length, 3)} gap-6">${serviceCards.join('')}</div>`
        : `<div class="space-y-4">
            <h3 class="text-sm font-medium">Services Offered</h3>
            <ul class="space-y-2 text-sm text-neutral-500">${defaultServices.map(s => `<li>• ${s}</li>`).join('')}</ul>
          </div>`
      }
    </div>
  </section>` + formSection + ctaSection;
}

// ── Contact ──
function zlContact(siteId: string, getContent: Function, hoursLine: string,
  baseUrl: string = ''
) {
  const formHeading = getContent('contactPage.formHeading') || 'Send a Message';
  const locationHeading = getContent('contactPage.locationHeading') || 'Information';
  const contentHeading = getContent('contactPage.contentHeading') || '';
  const contentText = getContent('contactPage.contentText') || '';

  const infoItems = [
    { label: 'Address', value: getContent('businessInfo.address') || getContent('business.address') },
    { label: 'Phone', value: getContent('businessInfo.phone') || getContent('business.phone') },
    { label: 'Email', value: getContent('businessInfo.email') || getContent('business.email') },
    { label: 'Hours', value: hoursLine },
  ].filter(i => i.value);

  return zlPageHero(getContent, 'contactPage', 'Contact Us', getContent('contactPage.subheading') || '') + `
  <section class="section-spacing">
    <div class="container-narrow">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        <div>
          ${contentHeading ? `<h2 class="text-2xl font-light mb-4">${contentHeading}</h2>` : ''}
          ${contentText ? `<p class="text-neutral-500 mb-12">${contentText}</p>` : ''}
          <h3 class="text-sm font-medium mb-6">${locationHeading}</h3>
          <div class="space-y-8">
            ${infoItems.map(i => `
            <div>
              <h3 class="text-xs uppercase tracking-wider text-neutral-400 mb-3">${i.label}</h3>
              <p class="text-sm">${i.value}</p>
            </div>`).join('')}
          </div>
        </div>
        <div>
          <h2 class="text-xl font-light mb-8">${formHeading}</h2>
          ${zlForm(siteId, [
            { label: 'Name', type: 'text', half: true },
            { label: 'Email', type: 'email', half: true },
            { label: 'Subject', type: 'text' },
            { label: 'Message', type: 'textarea' },
          ], 'Send Message')}
        </div>
      </div>
    </div>
  </section>`;
}

// ── Inventory ──
function zlInventory(siteId: string, getContent: Function, products: any[],
  baseUrl: string = ''
) {
  const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))];
  const brands = [...new Set(products.map((p: any) => p.brand).filter(Boolean))];

  return zlPageHero(getContent, 'inventoryPage', 'Inventory', getContent('inventoryPage.subheading') || '') + `
  <section class="section-spacing">
    <div class="container-narrow">
      <div class="mb-16">
        ${getContent('inventoryPage.contentHeading') ? `<h2 class="text-2xl font-light text-neutral-700 mb-3">${getContent('inventoryPage.contentHeading')}</h2>` : ''}
        ${getContent('inventoryPage.contentText') ? `<p class="text-lg text-neutral-500 mb-3">${getContent('inventoryPage.contentText')}</p>` : ''}
        <p class="text-sm text-neutral-400"><span id="zl-count">${products.length}</span> products available</p>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-16">
        <!-- Sidebar -->
        <aside class="lg:col-span-1 space-y-10">
          <div>
            <label class="text-xs uppercase tracking-wider text-neutral-400 mb-3 block">Category</label>
            <div class="space-y-2">
              <button onclick="zlFilter('all',null)" class="zl-cat block w-full text-left text-sm py-1 transition-slow text-neutral-900" data-cat="all">All</button>
              ${categories.map(c => `<button onclick="zlFilter('${c}',null)" class="zl-cat block w-full text-left text-sm py-1 transition-slow text-neutral-400 hover:text-neutral-900" data-cat="${c}">${c}</button>`).join('')}
            </div>
          </div>
          <div>
            <label class="text-xs uppercase tracking-wider text-neutral-400 mb-3 block">Brand</label>
            <div class="space-y-2">
              ${brands.map(b => `<button onclick="zlFilter(null,'${b}')" class="zl-brand block w-full text-left text-sm py-1 transition-slow text-neutral-400 hover:text-neutral-900" data-brand="${b}">${b}</button>`).join('')}
            </div>
          </div>
        </aside>
        <!-- Grid -->
        <div class="lg:col-span-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10" id="zl-grid">
            ${products.map((p: any) => `<div class="zl-item" data-category="${p.category || ''}" data-brand="${p.brand || ''}">${zlProductCard(siteId, p)}</div>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </section>
  <script>
  let zlCat='all', zlBrand=null;
  function zlFilter(cat,brand){
    if(cat!==null) zlCat=zlCat===cat&&cat!=='all'?'all':cat;
    if(brand!==null) zlBrand=zlBrand===brand?null:brand;
    let count=0;
    document.querySelectorAll('.zl-item').forEach(el=>{
      const mc=zlCat==='all'||el.dataset.category===zlCat;
      const mb=!zlBrand||el.dataset.brand===zlBrand;
      const show=mc&&mb;
      el.style.display=show?'':'none';
      if(show)count++;
    });
    document.getElementById('zl-count').textContent=count;
    document.querySelectorAll('.zl-cat').forEach(b=>b.className='zl-cat block w-full text-left text-sm py-1 transition-slow '+(b.dataset.cat===zlCat?'text-neutral-900':'text-neutral-400 hover:text-neutral-900'));
    document.querySelectorAll('.zl-brand').forEach(b=>b.className='zl-brand block w-full text-left text-sm py-1 transition-slow '+(b.dataset.brand===zlBrand?'text-neutral-900':'text-neutral-400 hover:text-neutral-900'));
  }
  </script>`;
}

// ── Rentals ──
async function zlRentals(
  siteId: string,
  getContent: Function,
  baseUrl: string = '',
  supabase?: any,
  hasRentalFeature: boolean = false
): Promise<string> {
  const heading = getContent('rentalsPage.heading') || getContent('rentals.heading') || 'Equipment Rentals';
  const subheading = getContent('rentalsPage.subheading') || getContent('rentals.description') || 'Professional-grade equipment for every project.';
  const pricingNote = getContent('rentalsPage.pricingNote') || '';

  let inventorySection = '';
  if (supabase && hasRentalFeature) {
    const { data: rentals } = await supabase
      .from('rental_inventory').select('*').eq('site_id', siteId)
      .eq('status', 'available').order('display_order');
    if (rentals && rentals.length > 0) {
      const cards = rentals.map((item: any) => `
        <div style="border:1px solid #e5e7eb;border-radius:0.5rem;overflow:hidden;">
          <div style="aspect-ratio:4/3;overflow:hidden;position:relative;background:#f3f4f6;">
            ${item.primary_image ? `<img src="${item.primary_image}" alt="${item.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;">🚜</div>`}
            ${!item.quantity_available || item.quantity_available === 0 ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;"><span style="background:#dc2626;color:white;padding:0.375rem 1rem;font-weight:700;font-size:0.875rem;">Currently Rented</span></div>` : `<span style="position:absolute;top:0.75rem;right:0.75rem;background:#2d6a4f;color:white;font-size:0.75rem;font-weight:700;padding:0.25rem 0.5rem;border-radius:0.25rem;">${item.quantity_available} Available</span>`}
          </div>
          <div style="padding:1.25rem;">
            <p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin:0 0 0.375rem;">${item.category || 'Rental'}</p>
            <h3 style="font-size:1rem;font-weight:500;color:#111827;margin:0 0 0.5rem;">${item.title}</h3>
            ${item.description ? `<p style="font-size:0.875rem;color:#6b7280;margin:0 0 0.75rem;">${item.description.substring(0, 100)}</p>` : ''}
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin-bottom:0.75rem;border-top:1px solid #e5e7eb;padding-top:0.75rem;">
              ${item.daily_rate ? `<div><p style="font-size:0.7rem;color:#6b7280;text-transform:uppercase;margin:0;">Daily</p><p style="font-weight:600;color:#2d6a4f;margin:0;">$${item.daily_rate}</p></div>` : ''}
              ${item.weekly_rate ? `<div><p style="font-size:0.7rem;color:#6b7280;text-transform:uppercase;margin:0;">Weekly</p><p style="font-weight:600;color:#2d6a4f;margin:0;">$${item.weekly_rate}</p></div>` : ''}
              ${item.monthly_rate ? `<div><p style="font-size:0.7rem;color:#6b7280;text-transform:uppercase;margin:0;">Monthly</p><p style="font-weight:600;color:#2d6a4f;margin:0;">$${item.monthly_rate}</p></div>` : ''}
            </div>
            ${item.quantity_available > 0
              ? rentalReserveButton(item, 'fm', 'block w-full text-center cta-button rounded-md text-sm py-2 cursor-pointer border-0')
              : `<button disabled style="display:block;width:100%;padding:0.625rem;border:1px solid #e5e7eb;background:none;border-radius:0.25rem;font-size:0.875rem;color:#9ca3af;cursor:not-allowed;">Currently Unavailable</button>`
            }
          </div>
        </div>`).join('');
      inventorySection = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:2rem;margin-bottom:2rem;">${cards}</div>
      ${pricingNote ? `<p style="font-size:0.875rem;color:#6b7280;">${pricingNote}</p>` : ''}
      


  <!-- Rental Booking Modal (fm) -->
  <script src="/fm-rental-datepicker.js"></script>
`;
    }
  }

  return zlPageHero(getContent, 'rentalsPage', 'Equipment Rentals', subheading) + `
  <section class="section-spacing">
    <div class="container-narrow">
      <div class="max-w-2xl mb-12">
        <h1 class="text-4xl md:text-5xl font-light tracking-tight mb-4">${heading}</h1>
        <p class="text-lg text-neutral-500">${subheading}</p>
      </div>
      ${inventorySection || `<div style="text-align:center;padding:3rem 0;"><p style="color:#6b7280;margin-bottom:1.5rem;">Contact us for current rental availability and pricing.</p><a href="${baseUrl}contact" class="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium text-white" style="background:#2d6a4f;">Reserve Equipment</a></div>`}
      <div class="mt-8 space-y-2 text-sm text-neutral-500">
        ${[
          getContent('rentalsPage.disclaimer1') || '• Security deposit required for all rentals',
          getContent('rentalsPage.disclaimer2') || '• Delivery and pickup available for additional fee',
          getContent('rentalsPage.disclaimer3') || '• Long-term rates available for rentals exceeding 30 days',
        ].filter(Boolean).map(d => `<p>${d}</p>`).join('')}
      </div>
    </div>
  </section>`;
}
// ── Manufacturers ──
function zlManufacturers(siteId: string, getContent: Function,
  baseUrl: string = ''
) {
  const logos: Record<string,string> = { 'Toro': '/images/logos/toro.png', 'John Deere': '/images/logos/john-deere.png', 'Stihl': '/images/logos/Stihl.png', 'Husqvarna': '/images/logos/Husqvarna.png', 'Honda': '/images/logos/Honda.png' };
  const brands = [
    { name: 'John Deere', desc: 'Industry leader in agricultural and turf equipment since 1837.' },
    { name: 'Husqvarna', desc: 'Swedish manufacturer of outdoor power products and robotic mowers.' },
    { name: 'Stihl', desc: 'German manufacturer of handheld power equipment and trimmers.' },
    { name: 'Honda', desc: 'Renowned for reliable engines and premium lawn mowers.' },
    { name: 'Toro', desc: 'Leading provider of turf maintenance equipment since 1914.' },
  ];

  return zlPageHero(getContent, 'manufacturersPage', 'Our Manufacturers', getContent('manufacturersPage.subheading') || '') + `
  <section class="section-spacing">
    <div class="container-narrow">
      <div class="max-w-2xl mb-20">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4">${getContent('manufacturersPage.heading') || getContent('manufacturers.heading') || 'Our Manufacturers'}</h1>
        <p class="text-lg text-neutral-500">${getContent('manufacturersPage.subheading') || getContent('manufacturers.description') || ''}</p>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-8 md:gap-12 mb-24">
        ${brands.map(b => `<img src="${logos[b.name] || ''}" alt="${b.name}" style="height: 50px; width: auto; opacity: 0.45; transition: opacity 0.4s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.45'">`).join('')}
      </div>
      <div class="border-t border-neutral-200">
        ${brands.map((b, i) => `
        <div class="block py-8 ${i < brands.length - 1 ? 'border-b border-neutral-200' : ''}">
          <div class="flex items-center justify-between gap-8">
            <div class="flex items-center gap-6">
              <img src="${logos[b.name] || ''}" alt="${b.name}" style="height: 40px; width: auto;">
              <div>
                <h3 class="text-xl font-light mb-1">${b.name}</h3>
                <p class="text-sm text-neutral-500">${b.desc}</p>
              </div>
            </div>
            <a href="${baseUrl}contact" class="text-sm text-neutral-400 hover:text-neutral-900 transition-slow whitespace-nowrap">Learn More →</a>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </section>`;
}

// ── Form Helper ──
function zlForm(siteId: string, fields: any[], buttonText: string) {
  const accent = '#22c55e';
  let html = `<form class="space-y-6" onsubmit="event.preventDefault(); fmSubmitForm(this, '${siteId}', 'service', function(f){var s=f.querySelector('select');return s?{equipment_type:s.value}:null;});">`;
  let i = 0;
  while (i < fields.length) {
    const f = fields[i];
    if (f.half && i + 1 < fields.length && fields[i + 1].half) {
      html += `<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">`;
      html += zlField(fields[i]) + zlField(fields[i + 1]);
      html += `</div>`;
      i += 2;
    } else {
      html += zlField(f);
      i++;
    }
  }
  html += `
    <button type="submit" class="w-full py-3 rounded text-sm font-medium text-white transition-slow hover:opacity-90" style="background-color:${accent};">${buttonText}</button>
  </form>`;
  return html;
}

function zlField(f: any) {
  const label = `<label class="text-xs uppercase tracking-wider text-neutral-400 mb-2 block">${f.label}</label>`;
  if (f.type === 'textarea') {
    return `<div class="space-y-2">${label}<textarea class="w-full px-4 py-2.5 border border-neutral-200 rounded bg-transparent text-sm focus:ring-1 focus:ring-green-300 focus:border-green-400 outline-none resize-y" rows="5" placeholder="${f.placeholder || ''}"></textarea></div>`;
  }
  return `<div class="space-y-2">${label}<input type="${f.type || 'text'}" class="w-full px-4 py-2.5 border border-neutral-200 rounded bg-transparent text-sm focus:ring-1 focus:ring-green-300 focus:border-green-400 outline-none" placeholder="${f.placeholder || ''}"></div>`;
}
// ── Subpage Hero Banner ──
function zlPageHero(getContent: Function, pageKey: string, defaultHeading: string, defaultSubheading: string = '') {
  const img = getContent(`${pageKey}.heroImage`);
  const heading = getContent(`${pageKey}.heading`) || defaultHeading;
  const subheading = getContent(`${pageKey}.subheading`) || defaultSubheading;
  if (!img) {
    // Text-only header — Zenith minimal style
    return `
  <div class="border-b border-neutral-200 section-spacing" style="padding-bottom: 3rem; padding-top: 6rem;">
    <div class="container-narrow">
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4">${heading}</h1>
      ${subheading ? `<p class="text-lg text-neutral-500 max-w-2xl">${subheading}</p>` : ''}
    </div>
  </div>`;
  }
  // Image hero
  return `
  <section class="relative flex items-end" style="min-height: 40vh;">
    <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('${img}');"></div>
    <div class="absolute inset-0" style="background: linear-gradient(to right, rgba(250,250,250,0.95), rgba(250,250,250,0.75), rgba(250,250,250,0.3));"></div>
    <div class="container-narrow relative z-10 py-16 md:py-24">
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-neutral-900 mb-4">${heading}</h1>
      ${subheading ? `<p class="text-lg text-neutral-500 max-w-2xl">${subheading}</p>` : ''}
    </div>
  </section>`;
}

import { rentalModalBlock, rentalReserveButton } from './shared-rental';
import { injectCartSystem, sharedPreviewScript } from './shared';
