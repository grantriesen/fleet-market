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
  siteAddons: string[] = []
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
    case 'home': case 'index': body = zlHome(siteId, getContent, products, vis, colors, baseUrl); break;
    case 'service': body = zlService(siteId, getContent, baseUrl); break;
    case 'contact': body = zlContact(siteId, getContent, hoursLine, baseUrl); break;
    case 'inventory': body = zlInventory(siteId, getContent, products, baseUrl); break;
    case 'rentals': body = await zlRentals(siteId, getContent, baseUrl, supabase, enabledFeatures.has('rental_scheduling') || siteAddons.includes('rentals')); break;
    case 'manufacturers': body = zlManufacturers(siteId, getContent, baseUrl); break;
    default: body = zlHome(siteId, getContent, products, vis, colors, baseUrl); break;
  }

  return zlShell(
    getContent('businessInfo.businessName') || getContent('business.name') || 'Zenith Equipment',
    fonts, colors,
    zlHeader(siteId, currentPage, pages, getContent, baseUrl) + body + zlFooter(siteId, pages, getContent, hoursLine, baseUrl)
  );
}

// ── HTML Shell ──
function zlShell(title: string, fonts: any, colors: any, body: string) {
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
</script></body>
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
        <a href="${baseUrl}index" class="text-lg md:text-xl font-medium tracking-tight text-neutral-900">${name}</a>
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
            <p>${getContent('businessInfo.address') || getContent('business.address') || ''}</p>
            <p>${getContent('businessInfo.phone') || getContent('business.phone') || ''}</p>
            <p>${hoursLine}</p>
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
  baseUrl: string = ''
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
            <a href="${baseUrl}inventory"
              class="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium text-white transition-slow hover:opacity-90"
              style="background-color: ${colors.accent};">
              ${getContent('hero.ctaPrimary') || 'View Inventory'}
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
          <h2 class="text-3xl md:text-4xl font-light tracking-tight">Featured</h2>
          <a href="${baseUrl}inventory" class="text-sm text-neutral-500 hover:text-neutral-900 transition-slow">View all</a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          ${products.slice(0, 4).map((p: any) => zlProductCard(siteId, p)).join('')}
        </div>
      </div>
    </section>`;
  }

  // Brands
  if (vis.manufacturers !== false) {
    const brands = ['John Deere', 'Husqvarna', 'Stihl', 'Honda', 'Toro'];
    const logos: Record<string,string> = { 'Toro': '/images/logos/toro.png', 'John Deere': '/images/logos/john-deere.png', 'Stihl': '/images/logos/Stihl.png', 'Husqvarna': '/images/logos/Husqvarna.png', 'Honda': '/images/logos/Honda.png' };
    html += `
    <section data-section="manufacturers" class="section-spacing border-t border-neutral-200">
      <div class="container-narrow">
        <p class="text-xs text-neutral-400 uppercase tracking-widest text-center mb-12">Authorized Dealer</p>
        <div class="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          ${brands.map(b => `<img src="${logos[b] || ''}" alt="${b}" style="height: 44px; width: auto; opacity: 0.5; transition: opacity 0.4s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.5'">`).join('')}
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
            <blockquote class="text-2xl md:text-3xl font-light leading-relaxed text-neutral-900 mb-8">"${t.quote}"</blockquote>
            <div>
              <p class="text-sm font-medium">${t.name || ''}</p>
              <p class="text-sm text-neutral-500">${t.company || ''}</p>
            </div>
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
  baseUrl: string = ''
) {
  const formHeading = getContent('servicePage.formHeading') || 'Request Service';

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

  return zlPageHero(getContent, 'servicePage', 'Service & Repair', getContent('servicePage.subheading') || '') + `
  <section class="section-spacing">
    <div class="container-narrow">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        <div>
          ${serviceCards.length > 0
            ? `<div class="grid grid-cols-1 sm:grid-cols-${Math.min(serviceCards.length, 3)} gap-6 mb-8">${serviceCards.join('')}</div>`
            : `<div class="space-y-8">
                <div>
                  <h3 class="text-sm font-medium mb-3">Services Offered</h3>
                  <ul class="space-y-2 text-sm text-neutral-500">${defaultServices.map(s => `<li>• ${s}</li>`).join('')}</ul>
                </div>
                <div>
                  <h3 class="text-sm font-medium mb-3">Turnaround Time</h3>
                  <p class="text-sm text-neutral-500">Most routine services completed within 3–5 business days. Priority service available for an additional fee.</p>
                </div>
              </div>`
          }
        </div>
        <div>
          <h2 class="text-xl font-light mb-8">${formHeading}</h2>
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
    </div>
  </section>`;
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
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4">${getContent('inventoryPage.heading') || getContent('inventory.heading') || 'Inventory'}</h1>
        <p class="text-lg text-neutral-500"><span id="zl-count">${products.length}</span> products available</p>
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
              ? `<button onclick="fmOpenRentalModal('${item.id}','${item.title.replace(/'/g, "\\'")}',${item.daily_rate || 0},${item.delivery_available ? 'true' : 'false'},${item.hourly_rate||0},${item.weekly_rate||0},${item.monthly_rate||0})" style="display:block;width:100%;padding:0.625rem;border:1px solid #111827;background:none;border-radius:0.25rem;font-size:0.875rem;font-weight:500;cursor:pointer;">Reserve Equipment</button>`
              : `<button disabled style="display:block;width:100%;padding:0.625rem;border:1px solid #e5e7eb;background:none;border-radius:0.25rem;font-size:0.875rem;color:#9ca3af;cursor:not-allowed;">Currently Unavailable</button>`
            }
          </div>
        </div>`).join('');
      inventorySection = `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:2rem;margin-bottom:2rem;">${cards}</div>
      ${pricingNote ? `<p style="font-size:0.875rem;color:#6b7280;">${pricingNote}</p>` : ''}
      


  <!-- Rental Booking Modal (fm) -->
  <div id="fmRentalModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;align-items:center;justify-content:center;padding:1rem;">
    <div style="background:white;border-radius:0.875rem;max-width:520px;width:100%;max-height:92vh;overflow:hidden;box-shadow:0 24px 48px rgba(0,0,0,0.35);display:flex;flex-direction:column;">

      <!-- Header -->
      <div id="fmModalHeader" style="padding:1.125rem 1.5rem;border-bottom:1px solid #f1f1f1;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <div>
          <h3 id="fmModalTitle" style="font-size:1.125rem;font-weight:700;color:#111827;margin:0;line-height:1.2;"></h3>
          <div id="fmStepIndicator" style="display:flex;gap:0.375rem;margin-top:0.375rem;">
            <span id="fmStep1Dot" style="width:1.5rem;height:3px;border-radius:2px;background:#111827;"></span>
            <span id="fmStep2Dot" style="width:1.5rem;height:3px;border-radius:2px;background:#e5e7eb;"></span>
          </div>
        </div>
        <button type="button" onclick="fmCloseRentalModal()" style="background:none;border:none;color:#9ca3af;cursor:pointer;padding:0.25rem;font-size:1.375rem;line-height:1;">&#x2715;</button>
      </div>

      <!-- Step 1: Date Picker -->
      <div id="fmStep1" style="overflow-y:auto;padding:1.25rem 1.5rem;flex:1;">
        <input type="hidden" id="fmStartDateVal">
        <input type="hidden" id="fmEndDateVal">
        <div id="fmDatePickerEl" style="margin-bottom:1rem;"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
          <div>
            <label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Pickup Time</label>
            <select id="fmPickupTime" onchange="fmCalcTotal()" style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;background:white;box-sizing:border-box;">
              <option value="">Select time</option>
              <option>8:00 AM</option><option>9:00 AM</option><option>10:00 AM</option>
              <option>11:00 AM</option><option>12:00 PM</option><option>1:00 PM</option>
              <option>2:00 PM</option><option>3:00 PM</option><option>4:00 PM</option><option>5:00 PM</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Return Time</label>
            <select id="fmReturnTime" onchange="fmCalcTotal()" style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;background:white;box-sizing:border-box;">
              <option value="">Select time</option>
              <option>8:00 AM</option><option>9:00 AM</option><option>10:00 AM</option>
              <option>11:00 AM</option><option>12:00 PM</option><option>1:00 PM</option>
              <option>2:00 PM</option><option>3:00 PM</option><option>4:00 PM</option><option>5:00 PM</option>
            </select>
          </div>
        </div>
        <!-- Pricing summary -->
        <div id="fmPricingSummary" style="display:none;background:#f9fafb;border-radius:0.5rem;padding:0.875rem;border:1px solid #e5e7eb;margin-bottom:0.25rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span id="fmDurationLabel" style="font-size:0.875rem;color:#6b7280;"></span>
            <span id="fmTotalLabel" style="font-size:1.125rem;font-weight:700;color:#111827;"></span>
          </div>
        </div>
      </div>

      <!-- Step 1 Footer -->
      <div id="fmStep1Footer" style="padding:1rem 1.5rem;border-top:1px solid #f1f1f1;flex-shrink:0;">
        <button type="button" id="fmNextBtn" onclick="fmGoStep2()" disabled style="width:100%;padding:0.75rem;background:#e5e7eb;color:#9ca3af;border:none;border-radius:0.5rem;font-weight:700;font-size:0.9375rem;cursor:not-allowed;">
          Continue to Contact Info →
        </button>
      </div>

      <!-- Step 2: Contact Info -->
      <div id="fmStep2" style="display:none;overflow-y:auto;padding:1.25rem 1.5rem;flex:1;">
        <!-- Booking summary pill -->
        <div id="fmBookingSummary" style="background:#f9fafb;border-radius:0.5rem;padding:0.75rem 1rem;margin-bottom:1rem;border:1px solid #e5e7eb;font-size:0.875rem;color:#374151;">
        </div>
        <form id="fmRentalForm">
          <input type="hidden" name="siteId" value="">
          <input type="hidden" id="fmRentalItemId" name="rentalItemId">
          <input type="hidden" name="rateAmount">
          <input type="hidden" name="hourlyRate">
          <input type="hidden" name="weeklyRate">
          <input type="hidden" name="monthlyRate">
          <input type="hidden" name="startDate">
          <input type="hidden" name="endDate">
          <input type="hidden" name="pickupTime">
          <input type="hidden" name="returnTime">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
            <div><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Name *</label><input type="text" name="customerName" required placeholder="Full name" style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;box-sizing:border-box;"></div>
            <div><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Phone *</label><input type="tel" name="customerPhone" required placeholder="(555) 000-0000" style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;box-sizing:border-box;"></div>
          </div>
          <div style="margin-bottom:0.75rem;"><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Email *</label><input type="email" name="customerEmail" required placeholder="you@email.com" style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;box-sizing:border-box;"></div>
          <div id="fmDeliverySection" style="display:none;margin-bottom:0.75rem;">
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:0.875rem;font-weight:600;color:#374151;">
              <input type="checkbox" name="deliveryRequired" onchange="fmToggleDelivery(this)" style="width:1rem;height:1rem;">Request Delivery
            </label>
          </div>
          <div id="fmDeliveryAddr" style="display:none;margin-bottom:0.75rem;">
            <label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Delivery Address</label>
            <textarea name="deliveryAddress" rows="2" placeholder="Street address, city, state, zip" style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;resize:vertical;box-sizing:border-box;"></textarea>
          </div>
          <div style="margin-bottom:0.25rem;"><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Special Requests</label><textarea name="notes" rows="2" placeholder="Any special requests..." style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;resize:vertical;box-sizing:border-box;"></textarea></div>
        </form>
      </div>

      <!-- Step 2 Footer -->
      <div id="fmStep2Footer" style="display:none;padding:1rem 1.5rem;border-top:1px solid #f1f1f1;flex-shrink:0;display:none;">
        <div style="display:flex;gap:0.625rem;">
          <button type="button" onclick="fmGoStep1()" style="padding:0.75rem 1rem;background:#f9fafb;color:#374151;border:1px solid #e5e7eb;border-radius:0.5rem;font-weight:600;font-size:0.875rem;cursor:pointer;">← Back</button>
          <button type="button" id="fmSubmitBtn" onclick="fmSubmitRental()" style="flex:1;padding:0.75rem;border:none;border-radius:0.5rem;font-weight:700;font-size:0.9375rem;cursor:pointer;color:white;">Submit Request</button>
        </div>
      </div>

    </div>
  </div>
  <script>
  (function() {

    var fmRentalState = {
      itemId: '', dailyRate: 0, hourlyRate: 0, weeklyRate: 0, monthlyRate: 0,
      deliveryAvailable: false, primaryColor: '#1e3a6e'
    };
  
    var fmParseTime = function(t) {
      var m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!m) return null;
      var h = parseInt(m[1]), mn = parseInt(m[2]), mer = m[3].toUpperCase();
      if (mer === 'PM' && h !== 12) h += 12;
      if (mer === 'AM' && h === 12) h = 0;
      return h + mn / 60;
    };
  
    function fmCalcTotal() {
      var s = document.getElementById('fmStartDateVal').value;
      var e = document.getElementById('fmEndDateVal').value;
      var st = fmRentalState;
      if (!s || !e) { document.getElementById('fmPricingSummary').style.display = 'none'; return; }
      var days = Math.ceil((new Date(e) - new Date(s)) / 86400000) + 1;
      if (days <= 0) return;
      var total, label;
      var pickup = document.getElementById('fmPickupTime').value;
      var ret = document.getElementById('fmReturnTime').value;
      if (days === 1 && st.hourlyRate && pickup && ret) {
        var pHr = fmParseTime(pickup), rHr = fmParseTime(ret);
        if (pHr !== null && rHr !== null && rHr > pHr) {
          var dur = rHr - pHr;
          if (dur < 4) {
            total = (dur * st.hourlyRate).toFixed(2);
            label = dur.toFixed(1) + ' hr @ $' + st.hourlyRate + '/hr';
          } else {
            total = st.dailyRate.toFixed(2);
            label = '1 day @ $' + st.dailyRate + '/day';
          }
        }
      }
      if (!total) {
        if (days >= 28 && st.monthlyRate) {
          var mo = Math.ceil(days / 30);
          total = (mo * st.monthlyRate).toFixed(2);
          label = mo + ' mo @ $' + st.monthlyRate + '/mo';
        } else if (days >= 7 && st.weeklyRate) {
          var wk = Math.ceil(days / 7);
          total = (wk * st.weeklyRate).toFixed(2);
          label = wk + ' wk @ $' + st.weeklyRate + '/wk';
        } else {
          total = (days * st.dailyRate).toFixed(2);
          label = days + ' day' + (days > 1 ? 's' : '') + ' @ $' + st.dailyRate + '/day';
        }
      }
      document.getElementById('fmDurationLabel').textContent = label;
      document.getElementById('fmTotalLabel').textContent = '$' + total;
      document.getElementById('fmPricingSummary').style.display = 'block';
      // Enable next button if dates selected
      var btn = document.getElementById('fmNextBtn');
      btn.disabled = false;
      btn.style.background = fmRentalState.primaryColor;
      btn.style.color = 'white';
      btn.style.cursor = 'pointer';
    }
  
    function fmOpenRentalModal(itemId, itemTitle, dailyRate, deliveryAvailable, hourlyRate, weeklyRate, monthlyRate) {
      var st = fmRentalState;
      st.itemId = itemId; st.dailyRate = dailyRate || 0; st.hourlyRate = hourlyRate || 0;
      st.weeklyRate = weeklyRate || 0; st.monthlyRate = monthlyRate || 0;
      st.deliveryAvailable = deliveryAvailable;
      st.primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#1e3a6e';
      // Header
      document.getElementById('fmModalTitle').textContent = itemTitle;
      // Reset step 1
      document.getElementById('fmStartDateVal').value = '';
      document.getElementById('fmEndDateVal').value = '';
      document.getElementById('fmPickupTime').value = '';
      document.getElementById('fmReturnTime').value = '';
      document.getElementById('fmPricingSummary').style.display = 'none';
      var btn = document.getElementById('fmNextBtn');
      btn.disabled = true; btn.style.background = '#e5e7eb'; btn.style.color = '#9ca3af'; btn.style.cursor = 'not-allowed';
      // Show step 1
      fmGoStep1();
      document.getElementById('fmRentalModal').style.display = 'flex';
      document.body.style.overflow = 'hidden';
      // Init date picker
      fmRentalDatePicker.init('fmDatePickerEl', document.querySelector('[name="siteId"]')?.value || '', itemId, function(start, end) {
        document.getElementById('fmStartDateVal').value = start;
        document.getElementById('fmEndDateVal').value = end;
        fmCalcTotal();
      }, st.primaryColor);
    }
  
    function fmGoStep1() {
      document.getElementById('fmStep1').style.display = 'block';
      document.getElementById('fmStep1Footer').style.display = 'block';
      document.getElementById('fmStep2').style.display = 'none';
      document.getElementById('fmStep2Footer').style.display = 'none';
      document.getElementById('fmStep1Dot').style.background = '#111827';
      document.getElementById('fmStep2Dot').style.background = '#e5e7eb';
    }
  
    function fmGoStep2() {
      var s = document.getElementById('fmStartDateVal').value;
      var e = document.getElementById('fmEndDateVal').value;
      if (!s || !e) { alert('Please select your rental dates first.'); return; }
      // Populate booking summary
      var sd = new Date(s), ed = new Date(e);
      var days = Math.ceil((ed - sd) / 86400000) + 1;
      var total = document.getElementById('fmTotalLabel').textContent;
      var pickup = document.getElementById('fmPickupTime').value;
      var ret = document.getElementById('fmReturnTime').value;
      var summary = sd.toLocaleDateString('en-US',{month:'short',day:'numeric'}) + ' → ' + ed.toLocaleDateString('en-US',{month:'short',day:'numeric'});
      if (pickup) summary += ' · ' + pickup;
      summary += ' &nbsp;·&nbsp; ' + total;
      document.getElementById('fmBookingSummary').innerHTML = '<strong>' + document.getElementById('fmModalTitle').textContent + '</strong><br><span style="color:#6b7280;">' + summary + '</span>';
      // Show delivery if available
      var st = fmRentalState;
      document.getElementById('fmDeliverySection').style.display = st.deliveryAvailable ? 'block' : 'none';
      document.getElementById('fmDeliveryAddr').style.display = 'none';
      // Set submit button color
      document.getElementById('fmSubmitBtn').style.background = st.primaryColor;
      // Show step 2
      document.getElementById('fmStep1').style.display = 'none';
      document.getElementById('fmStep1Footer').style.display = 'none';
      document.getElementById('fmStep2').style.display = 'block';
      document.getElementById('fmStep2Footer').style.display = 'flex';
      document.getElementById('fmStep1Dot').style.background = '#e5e7eb';
      document.getElementById('fmStep2Dot').style.background = '#111827';
    }
  
    function fmCloseRentalModal() {
      document.getElementById('fmRentalModal').style.display = 'none';
      document.body.style.overflow = '';
    }
  
    function fmToggleDelivery(cb) {
      document.getElementById('fmDeliveryAddr').style.display = cb.checked ? 'block' : 'none';
    }
  
    function fmSubmitRental() {
      var form = document.getElementById('fmRentalForm');
      var st = fmRentalState;
      var name = form.querySelector('[name="customerName"]').value.trim();
      var email = form.querySelector('[name="customerEmail"]').value.trim();
      var phone = form.querySelector('[name="customerPhone"]').value.trim();
      if (!name || !email || !phone) { alert('Please fill in your name, email, and phone.'); return; }
      // Populate hidden fields
      form.querySelector('[name="siteId"]').value = document.querySelector('[name="siteId"]')?.value || '';
      form.querySelector('[name="rentalItemId"]').value = st.itemId;
      form.querySelector('[name="rateAmount"]').value = st.dailyRate;
      form.querySelector('[name="hourlyRate"]').value = st.hourlyRate;
      form.querySelector('[name="weeklyRate"]').value = st.weeklyRate;
      form.querySelector('[name="monthlyRate"]').value = st.monthlyRate;
      form.querySelector('[name="startDate"]').value = document.getElementById('fmStartDateVal').value;
      form.querySelector('[name="endDate"]').value = document.getElementById('fmEndDateVal').value;
      form.querySelector('[name="pickupTime"]').value = document.getElementById('fmPickupTime').value;
      form.querySelector('[name="returnTime"]').value = document.getElementById('fmReturnTime').value;
      var btn = document.getElementById('fmSubmitBtn');
      btn.textContent = 'Submitting...'; btn.disabled = true;
      var fd = new FormData(form); var data = {};
      fd.forEach(function(v,k) { data[k]=v; });
      data.totalAmount = document.getElementById('fmTotalLabel') ? document.getElementById('fmTotalLabel').textContent.replace('$','') : '0';
      fetch('/api/rental/book/' + data.siteId, {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data)
      })
      .then(function(r) { return r.json(); })
      .then(function(res) {
        if (res.error) { alert(res.error); btn.textContent = 'Submit Request'; btn.disabled = false; }
        else {
          document.getElementById('fmStep2').innerHTML = '<div style="text-align:center;padding:3rem 1.5rem;"><div style="width:4rem;height:4rem;background:' + st.primaryColor + ';border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"white\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 6 9 17l-5-5\"/></svg></div><h3 style=\"color:' + st.primaryColor + ';font-size:1.375rem;font-weight:700;margin-bottom:0.75rem;\">Request Submitted!</h3><p style=\"color:#6b7280;\">We will contact you to confirm your booking within 1 business day.</p></div>';
          document.getElementById('fmStep2Footer').style.display = 'none';
        }
      })
      .catch(function() { alert('Something went wrong. Please try again.'); btn.textContent = 'Submit Request'; btn.disabled = false; });
    }
  
    // Expose for onclick handlers
    window.fmOpenRentalModal = fmOpenRentalModal;
    window.fmCloseRentalModal = fmCloseRentalModal;
    window.fmGoStep1 = fmGoStep1;
    window.fmGoStep2 = fmGoStep2;
    window.fmCalcTotal = fmCalcTotal;
    window.fmToggleDelivery = fmToggleDelivery;
    window.fmSubmitRental = fmSubmitRental;
  })();
  // Inline date range picker
  // Shared inline date range picker for all Fleet Market rental modals
  // Injected into both gv-prefixed (GVI) and fm-prefixed (other templates) modals
  // Usage: fmRentalDatePicker.init(containerId, siteId, itemId, onRangeSelected, primaryColor)
  
  (function() {
    var DP = window.fmRentalDatePicker = {};
    
    DP.state = {
      bookedDates: [],
      startDate: null,
      endDate: null,
      hoverDate: null,
      viewYear: new Date().getFullYear(),
      viewMonth: new Date().getMonth(),
      containerId: null,
      onSelect: null,
      primaryColor: '#1e3a6e'
    };
  
    var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  
    function dateStr(d) {
      return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }
    function parseDate(s) { var p = s.split('-'); return new Date(+p[0], +p[1]-1, +p[2]); }
    function today() { return dateStr(new Date()); }
  
    DP.init = function(containerId, siteId, itemId, onSelect, primaryColor) {
      DP.state.containerId = containerId;
      DP.state.onSelect = onSelect;
      DP.state.primaryColor = primaryColor || '#1e3a6e';
      DP.state.startDate = null;
      DP.state.endDate = null;
      DP.state.hoverDate = null;
      DP.state.bookedDates = [];
      DP.state.viewYear = new Date().getFullYear();
      DP.state.viewMonth = new Date().getMonth();
      DP.render();
      // Fetch booked dates
      if (siteId && itemId) {
        fetch('/api/rental/availability/' + siteId + '?itemId=' + itemId)
          .then(function(r) { return r.json(); })
          .then(function(data) {
            DP.state.bookedDates = (data.bookedRanges && data.bookedRanges[itemId]) || [];
            DP.render();
          })
          .catch(function() {});
      }
    };
  
    DP.render = function() {
      var el = document.getElementById(DP.state.containerId);
      if (!el) return;
      var s = DP.state;
      var pc = s.primaryColor;
      var today_str = today();
  
      // Build calendar days
      var firstDay = new Date(s.viewYear, s.viewMonth, 1).getDay();
      var daysInMonth = new Date(s.viewYear, s.viewMonth + 1, 0).getDate();
      var prevMonthDays = new Date(s.viewYear, s.viewMonth, 0).getDate();
  
      var cells = '';
      var totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  
      for (var i = 0; i < totalCells; i++) {
        var day, inMonth = true;
        if (i < firstDay) { day = prevMonthDays - firstDay + i + 1; inMonth = false; }
        else if (i >= firstDay + daysInMonth) { day = i - firstDay - daysInMonth + 1; inMonth = false; }
        else { day = i - firstDay + 1; }
  
        if (!inMonth) { cells += '<div style="padding:0.375rem;"></div>'; continue; }
  
        var ds = s.viewYear + '-' + String(s.viewMonth+1).padStart(2,'0') + '-' + String(day).padStart(2,'0');
        var isPast = ds < today_str;
        var isBooked = s.bookedDates.indexOf(ds) !== -1;
        var isStart = ds === s.startDate;
        var isEnd = ds === s.endDate;
        var isToday = ds === today_str;
        var inRange = s.startDate && s.endDate && ds > s.startDate && ds < s.endDate;
        var inHover = s.startDate && !s.endDate && s.hoverDate && ds > s.startDate && ds <= s.hoverDate;
  
        var bg = 'transparent', color = '#111827', cursor = 'pointer', border = 'none', textDec = 'none';
        var borderRadius = '50%';
  
        if (isPast || isBooked) {
          bg = isBooked ? '#fee2e2' : 'transparent';
          color = '#9ca3af';
          cursor = 'not-allowed';
          textDec = isBooked ? 'line-through' : 'none';
        } else if (isStart || isEnd) {
          bg = pc;
          color = 'white';
        } else if (inRange || inHover) {
          bg = pc + '20';
          color = '#111827';
          borderRadius = '0';
        }
        if (isToday && !isStart && !isEnd) { border = '2px solid ' + pc; }
  
        var disabled = isPast || isBooked ? 'data-disabled="1"' : '';
        cells += '<div ' + disabled + ' data-date="' + ds + '" onclick="fmRentalDatePicker.pick(this)" onmouseover="fmRentalDatePicker.hover(this)" style="padding:0.375rem;text-align:center;font-size:0.8125rem;font-weight:' + (isStart||isEnd?'700':'400') + ';border-radius:' + borderRadius + ';background:' + bg + ';color:' + color + ';cursor:' + cursor + ';border:' + border + ';text-decoration:' + textDec + ';user-select:none;line-height:1.75rem;">' + day + '</div>';
      }
  
      // Selected range display
      var rangeLabel = '';
      if (s.startDate && s.endDate) {
        var sd = parseDate(s.startDate), ed = parseDate(s.endDate);
        var days = Math.ceil((ed - sd) / 86400000) + 1;
        rangeLabel = '<div style="margin-top:0.75rem;padding:0.625rem 0.875rem;background:' + pc + '15;border-radius:0.5rem;font-size:0.875rem;color:' + pc + ';font-weight:600;text-align:center;">' +
          sd.toLocaleDateString('en-US',{month:'short',day:'numeric'}) + ' → ' + ed.toLocaleDateString('en-US',{month:'short',day:'numeric'}) + ' &nbsp;·&nbsp; ' + days + ' day' + (days>1?'s':'') +
          '</div>';
      } else if (s.startDate) {
        rangeLabel = '<div style="margin-top:0.75rem;padding:0.5rem;text-align:center;font-size:0.8125rem;color:#6b7280;">Select your end date</div>';
      } else {
        rangeLabel = '<div style="margin-top:0.75rem;padding:0.5rem;text-align:center;font-size:0.8125rem;color:#6b7280;">Click a start date</div>';
      }
  
      // Legend
      var legend = '<div style="display:flex;gap:1rem;margin-top:0.625rem;font-size:0.75rem;color:#6b7280;">' +
        '<span style="display:flex;align-items:center;gap:0.25rem;"><span style="width:0.75rem;height:0.75rem;background:#fee2e2;border-radius:2px;text-decoration:line-through;display:inline-flex;align-items:center;justify-content:center;font-size:0.5rem;color:#9ca3af;">X</span>Unavailable</span>' +
        '<span style="display:flex;align-items:center;gap:0.25rem;"><span style="width:0.75rem;height:0.75rem;background:' + pc + ';border-radius:50%;display:inline-block;"></span>Selected</span>' +
        '</div>';
  
      el.innerHTML = '<div style="user-select:none;">' +
        // Header
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.625rem;">' +
          '<button type="button" onclick="fmRentalDatePicker.prevMonth()" style="background:none;border:1px solid #e5e7eb;border-radius:0.375rem;padding:0.25rem 0.5rem;cursor:pointer;font-size:1rem;color:#374151;">‹</button>' +
          '<span style="font-weight:700;font-size:0.9375rem;color:#111827;">' + MONTHS[s.viewMonth] + ' ' + s.viewYear + '</span>' +
          '<button type="button" onclick="fmRentalDatePicker.nextMonth()" style="background:none;border:1px solid #e5e7eb;border-radius:0.375rem;padding:0.25rem 0.5rem;cursor:pointer;font-size:1rem;color:#374151;">›</button>' +
        '</div>' +
        // Day headers
        '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;margin-bottom:2px;">' +
          DAYS.map(function(d) { return '<div style="text-align:center;font-size:0.6875rem;font-weight:600;color:#9ca3af;padding:0.25rem 0;">' + d + '</div>'; }).join('') +
        '</div>' +
        // Day cells
        '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;" onmouseleave="fmRentalDatePicker.clearHover()">' + cells + '</div>' +
        rangeLabel + legend +
      '</div>';
    };
  
    DP.pick = function(el) {
      if (el.getAttribute('data-disabled')) return;
      var ds = el.getAttribute('data-date');
      var s = DP.state;
      if (!s.startDate || (s.startDate && s.endDate) || ds < s.startDate) {
        s.startDate = ds; s.endDate = null;
      } else {
        s.endDate = ds;
        if (s.onSelect) s.onSelect(s.startDate, s.endDate);
      }
      DP.render();
    };
  
    DP.hover = function(el) {
      if (el.getAttribute('data-disabled')) return;
      var s = DP.state;
      if (s.startDate && !s.endDate) {
        var ds = el.getAttribute('data-date');
        if (ds > s.startDate) { s.hoverDate = ds; DP.render(); }
      }
    };
  
    DP.clearHover = function() { DP.state.hoverDate = null; DP.render(); };
    DP.prevMonth = function() { var s = DP.state; s.viewMonth--; if (s.viewMonth < 0) { s.viewMonth = 11; s.viewYear--; } DP.render(); };
    DP.nextMonth = function() { var s = DP.state; s.viewMonth++; if (s.viewMonth > 11) { s.viewMonth = 0; s.viewYear++; } DP.render(); };
    DP.getStart = function() { return DP.state.startDate || ''; };
    DP.getEnd   = function() { return DP.state.endDate   || ''; };
  })();
  
  </script>`;
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
        <p>• Security deposit required for all rentals</p>
        <p>• Delivery and pickup available for additional fee</p>
        <p>• Long-term rates available for rentals exceeding 30 days</p>
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
        <a href="${baseUrl}inventory" class="block py-8 group ${i < brands.length - 1 ? 'border-b border-neutral-200' : ''}">
          <div class="flex items-center justify-between gap-8">
            <div class="flex items-center gap-6">
              <img src="${logos[b.name] || ''}" alt="${b.name}" style="height: 40px; width: auto;">
              <div>
                <h3 class="text-xl font-light mb-1 group-hover:opacity-70 transition-slow">${b.name}</h3>
                <p class="text-sm text-neutral-500">${b.desc}</p>
              </div>
            </div>
            <span class="text-sm text-neutral-400 group-hover:text-neutral-900 transition-slow whitespace-nowrap">View products →</span>
          </div>
        </a>`).join('')}
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

