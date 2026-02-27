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
export function renderZenithLawnPage(
  siteId: string,
  currentPage: string,
  pages: any[],
  products: any[],
  config: any,
  customizations: any,
  enabledFeatures: Set<string>,
  vis: Record<string, boolean>,
) {
  const getContent = (key: string) => customizations?.content?.[key] || config?.content?.[key] || '';
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
  try { hours = JSON.parse(getContent('business.hours') || '{}'); } catch {}
  const fmt = (t: string) => { if (!t) return ''; const [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; return `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, '0')} ${ap}`; };
  const fmtRange = (d: any) => (!d?.open || !d?.close) ? 'Closed' : `${fmt(d.open)} – ${fmt(d.close)}`;
  const hoursLine = `Mon–Fri: ${fmtRange(hours.monday)} | Sat: ${fmtRange(hours.saturday)} | Sun: ${fmtRange(hours.sunday)}`;

  let body = '';
  switch (currentPage) {
    case 'home': case 'index': body = zlHome(siteId, getContent, products, vis, colors); break;
    case 'service': body = zlService(siteId, getContent); break;
    case 'contact': body = zlContact(siteId, getContent, hoursLine); break;
    case 'inventory': body = zlInventory(siteId, getContent, products); break;
    case 'rentals': body = zlRentals(siteId, getContent); break;
    case 'manufacturers': body = zlManufacturers(siteId, getContent); break;
    default: body = zlHome(siteId, getContent, products, vis, colors); break;
  }

  return zlShell(
    getContent('business.name') || 'Zenith Equipment',
    fonts, colors,
    zlHeader(siteId, currentPage, pages, getContent) + body + zlFooter(siteId, pages, getContent, hoursLine)
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
<body>${body}</body>
</html>`;
}

// ── Header ──
function zlHeader(siteId: string, currentPage: string, pages: any[], getContent: Function) {
  const name = getContent('business.name') || 'Zenith Equipment';
  const links = pages.map(p => {
    const active = p.slug === currentPage || (p.slug === 'index' && (currentPage === 'home' || currentPage === 'index'));
    return `<a href="/api/preview/${siteId}?page=${p.slug}" class="text-sm transition-slow ${active ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-900'}">${p.name}</a>`;
  }).join('\n');

  return `
  <header class="fixed top-0 left-0 right-0 z-50 border-b border-neutral-200" style="background: rgba(250,250,250,0.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);">
    <nav class="container-narrow">
      <div class="flex items-center justify-between h-16 md:h-20">
        <a href="/api/preview/${siteId}?page=index" class="text-lg md:text-xl font-medium tracking-tight text-neutral-900">${name}</a>
        <div class="hidden md:flex items-center gap-8">${links}</div>
        <!-- Mobile: scrollable row below -->
        <div class="md:hidden">
          <a href="/api/preview/${siteId}?page=contact" class="text-sm text-neutral-400 hover:text-neutral-900 transition-slow">Contact</a>
        </div>
      </div>
      <div class="md:hidden overflow-x-auto pb-3 -mx-6 px-6">
        <div class="flex items-center gap-6 min-w-max">
          ${pages.map(p => {
            const active = p.slug === currentPage || (p.slug === 'index' && (currentPage === 'home' || currentPage === 'index'));
            return `<a href="/api/preview/${siteId}?page=${p.slug}" class="text-xs whitespace-nowrap transition-slow ${active ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-900'}">${p.name}</a>`;
          }).join('\n')}
        </div>
      </div>
    </nav>
  </header>
  <div style="height: 80px;"></div>`;
}

// ── Footer ──
function zlFooter(siteId: string, pages: any[], getContent: Function, hoursLine: string) {
  const name = getContent('business.name') || 'Zenith Equipment';
  const tagline = getContent('footer.tagline') || '';
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
              `<a href="/api/preview/${siteId}?page=${p.slug}" class="text-sm text-neutral-500 transition-slow hover:text-neutral-900">${p.name}</a>`
            ).join('\n')}
          </div>
        </div>
        <div>
          <h4 class="text-sm font-medium mb-4">Contact</h4>
          <div class="flex flex-col gap-3 text-sm text-neutral-500">
            <p>${getContent('business.address') || ''}</p>
            <p>${getContent('business.phone') || ''}</p>
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
function zlHome(siteId: string, getContent: Function, products: any[], vis: Record<string, boolean>, colors: any) {
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
            <a href="/api/preview/${siteId}?page=inventory"
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
          <a href="/api/preview/${siteId}?page=inventory" class="text-sm text-neutral-500 hover:text-neutral-900 transition-slow">View all</a>
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
function zlProductCard(siteId: string, p: any) {
  const imgUrl = p.image_url || p.primary_image || '';
  const hasImage = imgUrl && !imgUrl.includes('placeholder');
  const productName = p.name || p.title || '';
  const price = p.sale_price || p.price;
  return `
  <a href="/api/preview/${siteId}?page=contact" class="group block">
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
      <p class="text-sm text-neutral-500">
        ${p.sale_price ? `<span class="line-through text-neutral-300 mr-2">$${Number(p.price).toLocaleString()}</span>` : ''}$${Number(price).toLocaleString()}
        ${p.condition === 'used' ? ` <span class="text-xs text-neutral-400">· Used${p.hours ? ` ${p.hours}hrs` : ''}</span>` : ''}
      </p>
    </div>
  </a>`;
}

// ── Service ──
function zlService(siteId: string, getContent: Function) {
  return `
  <section class="section-spacing">
    <div class="container-narrow">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        <div>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6">${getContent('services.heading') || 'Service & Repair'}</h1>
          <p class="text-lg text-neutral-500 mb-8">${getContent('services.description') || ''}</p>
          <div class="space-y-8">
            <div>
              <h3 class="text-sm font-medium mb-3">Services Offered</h3>
              <ul class="space-y-2 text-sm text-neutral-500">
                <li>• Routine maintenance & tune-ups</li>
                <li>• Engine diagnostics & repair</li>
                <li>• Blade sharpening & replacement</li>
                <li>• Electrical system repair</li>
                <li>• Seasonal winterization</li>
                <li>• Warranty service for authorized brands</li>
              </ul>
            </div>
            <div>
              <h3 class="text-sm font-medium mb-3">Turnaround Time</h3>
              <p class="text-sm text-neutral-500">Most routine services completed within 3–5 business days. Priority service available for an additional fee.</p>
            </div>
          </div>
        </div>
        <div>
          <h2 class="text-xl font-light mb-8">Request Service</h2>
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
function zlContact(siteId: string, getContent: Function, hoursLine: string) {
  const infoItems = [
    { label: 'Address', value: getContent('business.address') },
    { label: 'Phone', value: getContent('business.phone') },
    { label: 'Email', value: getContent('business.email') },
    { label: 'Hours', value: hoursLine },
  ].filter(i => i.value);

  return `
  <section class="section-spacing">
    <div class="container-narrow">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
        <div>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-6">${getContent('contact.heading') || 'Contact Us'}</h1>
          <p class="text-lg text-neutral-500 mb-12">${getContent('contact.description') || ''}</p>
          <div class="space-y-8">
            ${infoItems.map(i => `
            <div>
              <h3 class="text-xs uppercase tracking-wider text-neutral-400 mb-3">${i.label}</h3>
              <p class="text-sm">${i.value}</p>
            </div>`).join('')}
          </div>
        </div>
        <div>
          <h2 class="text-xl font-light mb-8">Send a Message</h2>
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
function zlInventory(siteId: string, getContent: Function, products: any[]) {
  const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))];
  const brands = [...new Set(products.map((p: any) => p.brand).filter(Boolean))];

  return `
  <section class="section-spacing">
    <div class="container-narrow">
      <div class="mb-16">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4">${getContent('inventory.heading') || 'Inventory'}</h1>
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
function zlRentals(siteId: string, getContent: Function) {
  const rentals = [
    { name: 'Walk-Behind Mowers', daily: 45, weekly: 180, monthly: 550 },
    { name: 'Riding Mowers', daily: 95, weekly: 400, monthly: 1200 },
    { name: 'Zero-Turn Mowers', daily: 150, weekly: 625, monthly: 1800 },
    { name: 'Compact Tractors', daily: 200, weekly: 850, monthly: 2500 },
    { name: 'String Trimmers', daily: 25, weekly: 100, monthly: 300 },
    { name: 'Leaf Blowers', daily: 30, weekly: 120, monthly: 350 },
  ];

  return `
  <section class="section-spacing">
    <div class="container-narrow">
      <div class="max-w-2xl mb-16">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4">${getContent('rentals.heading') || 'Equipment Rentals'}</h1>
        <p class="text-lg text-neutral-500">${getContent('rentals.description') || 'Professional-grade equipment available for short or long-term rental. All rentals include safety orientation and fuel for first use.'}</p>
      </div>
      <div class="border border-neutral-200">
        <div class="grid grid-cols-4 gap-4 p-6 border-b border-neutral-200 bg-neutral-50">
          <div class="text-xs uppercase tracking-wider text-neutral-400">Equipment</div>
          <div class="text-xs uppercase tracking-wider text-neutral-400 text-right">Daily</div>
          <div class="text-xs uppercase tracking-wider text-neutral-400 text-right">Weekly</div>
          <div class="text-xs uppercase tracking-wider text-neutral-400 text-right">Monthly</div>
        </div>
        ${rentals.map((r, i) => `
        <div class="grid grid-cols-4 gap-4 p-6 ${i < rentals.length - 1 ? 'border-b border-neutral-200' : ''}">
          <div class="text-sm font-medium">${r.name}</div>
          <div class="text-sm text-right text-neutral-500">$${r.daily}</div>
          <div class="text-sm text-right text-neutral-500">$${r.weekly}</div>
          <div class="text-sm text-right text-neutral-500">$${r.monthly.toLocaleString()}</div>
        </div>`).join('')}
      </div>
      <div class="mt-12 space-y-3 text-sm text-neutral-500">
        <p>• Security deposit required for all rentals</p>
        <p>• Delivery and pickup available for additional fee</p>
        <p>• Long-term rates available for rentals exceeding 30 days</p>
      </div>
      <div class="mt-16">
        <a href="/api/preview/${siteId}?page=contact" class="inline-flex items-center gap-2 px-6 py-3 rounded text-sm font-medium text-white transition-slow hover:opacity-90 bg-green-500">Reserve Equipment</a>
      </div>
    </div>
  </section>`;
}

// ── Manufacturers ──
function zlManufacturers(siteId: string, getContent: Function) {
  const logos: Record<string,string> = { 'Toro': '/images/logos/toro.png', 'John Deere': '/images/logos/john-deere.png', 'Stihl': '/images/logos/Stihl.png', 'Husqvarna': '/images/logos/Husqvarna.png', 'Honda': '/images/logos/Honda.png' };
  const brands = [
    { name: 'John Deere', desc: 'Industry leader in agricultural and turf equipment since 1837.' },
    { name: 'Husqvarna', desc: 'Swedish manufacturer of outdoor power products and robotic mowers.' },
    { name: 'Stihl', desc: 'German manufacturer of handheld power equipment and trimmers.' },
    { name: 'Honda', desc: 'Renowned for reliable engines and premium lawn mowers.' },
    { name: 'Toro', desc: 'Leading provider of turf maintenance equipment since 1914.' },
  ];

  return `
  <section class="section-spacing">
    <div class="container-narrow">
      <div class="max-w-2xl mb-20">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight mb-4">${getContent('manufacturers.heading') || 'Our Manufacturers'}</h1>
        <p class="text-lg text-neutral-500">${getContent('manufacturers.description') || ''}</p>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-8 md:gap-12 mb-24">
        ${brands.map(b => `<img src="${logos[b.name] || ''}" alt="${b.name}" style="height: 50px; width: auto; opacity: 0.45; transition: opacity 0.4s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.45'">`).join('')}
      </div>
      <div class="border-t border-neutral-200">
        ${brands.map((b, i) => `
        <a href="/api/preview/${siteId}?page=inventory" class="block py-8 group ${i < brands.length - 1 ? 'border-b border-neutral-200' : ''}">
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
  let html = `<form class="space-y-6" onsubmit="event.preventDefault();">`;
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
    <p class="text-xs text-neutral-400 text-center">This form is for demonstration purposes only.</p>
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
