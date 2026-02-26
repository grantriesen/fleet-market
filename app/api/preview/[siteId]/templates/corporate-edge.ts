// ─── Corporate Edge ── Standalone Template ───────────────────────────────
// Design: Deep navy primary, red CTA, green accent. Sharp corners.
//         Roboto headings (600), Open Sans body. Clean professional cards,
//         utility bar in header, bottom wave on hero.
// ──────────────────────────────────────────────────────────────────────────

/* ── DEMO overrides ── */
export const CORPORATE_EDGE_DEMO_OVERRIDES = {
  'business.name': 'Premier Equipment Co.',
  'business.phone': '(555) 123-4567',
  'business.email': 'info@premierequipment.com',
  'business.address': '1234 Industrial Blvd, Springfield, IL 62701',
  'business.hours': JSON.stringify({
    monday: { open: '07:00', close: '18:00' },
    tuesday: { open: '07:00', close: '18:00' },
    wednesday: { open: '07:00', close: '18:00' },
    thursday: { open: '07:00', close: '18:00' },
    friday: { open: '07:00', close: '18:00' },
    saturday: { open: '08:00', close: '16:00' },
    sunday: { open: '', close: '' },
  }),
  'social.facebook': 'https://facebook.com/premierequipment',
  'social.linkedin': 'https://linkedin.com/company/premierequipment',
  'social.youtube': 'https://youtube.com/@premierequipment',
  'hero.heading': 'Professional Lawn Care Equipment You Can Trust',
  'hero.subheading': 'Serving commercial landscapers and homeowners for over 25 years with quality equipment, expert service, and unmatched reliability.',
  'hero.ctaPrimary': 'Browse Inventory',
  'hero.ctaSecondary': 'Schedule Consultation',
  'hero.image': '/images/hero-mower.jpg',
  'services.heading': 'Service Department',
  'services.description': 'Factory-trained technicians providing expert repair and maintenance services for all major equipment brands.',
  'services.items': JSON.stringify([
    { icon: '🔧', title: 'Equipment Repair', description: 'Full-service repair for all major brands. Our certified technicians diagnose and fix issues quickly to minimize your downtime.', features: ['All major brands', 'Factory parts', 'Quick turnaround'] },
    { icon: '⚙', title: 'Preventive Maintenance', description: 'Keep your equipment running at peak performance with our scheduled maintenance programs designed for commercial operators.', features: ['Seasonal tune-ups', 'Oil changes', 'Blade sharpening'] },
    { icon: '📦', title: 'Parts Department', description: 'Extensive parts inventory for quick repairs. We stock OEM and quality aftermarket parts for all equipment we sell.', features: ['OEM parts', 'Next-day delivery', 'Expert advice'] },
    { icon: '📋', title: 'Warranty Work', description: 'Authorized warranty service center for all major manufacturers. We handle all paperwork and get you back to work fast.', features: ['Factory authorized', 'No hassle claims', 'Loaner equipment'] },
  ]),
  'contact.heading': 'Contact Us',
  'contact.description': "Get in touch with our team. We're here to help with sales, service, rentals, and any questions you may have.",
  'inventory.heading': 'Equipment Inventory',
  'inventory.description': "Browse our complete selection of professional lawn care equipment from the industry's leading manufacturers.",
  'rentals.heading': 'Equipment Rentals',
  'rentals.description': 'Professional equipment when you need it. Flexible daily, weekly, and monthly rental options.',
  'manufacturers.heading': 'Our Manufacturers',
  'manufacturers.description': "We're proud to be an authorized dealer for the industry's most trusted brands in professional lawn care equipment.",
  'cta.heading': 'Ready to Upgrade Your Equipment?',
  'cta.description': 'Schedule a consultation with our equipment specialists to find the perfect solution for your needs.',
  'cta.button': 'Schedule Consultation',
  'footer.tagline': 'Your Trusted Partner in Professional Lawn Care Equipment',
  'whyChoose.heading': 'Why Choose Us',
  'whyChoose.description': "We're committed to providing the highest level of service and support to our customers.",
  'whyChoose.items': JSON.stringify([
    { icon: '🛡', title: 'Authorized Dealer', description: 'Factory-authorized for all major brands' },
    { icon: '🏆', title: 'Certified Technicians', description: 'Factory-trained service professionals' },
    { icon: '📋', title: 'Warranty Available', description: 'Extended protection plans offered' },
    { icon: '👥', title: 'Family Owned', description: 'Proudly serving since 1998' },
  ]),
  'stats.items': JSON.stringify([
    { value: '25+', label: 'Years Experience' },
    { value: '10,000+', label: 'Customers Served' },
    { value: '5', label: 'Locations' },
    { value: '50+', label: 'Certified Technicians' },
  ]),
  'testimonials.items': JSON.stringify([
    { quote: "Premier Equipment has been our go-to dealer for over 15 years. Their service department is second to none.", name: 'Michael Thompson', title: 'Operations Manager', company: 'GreenScape Landscaping' },
    { quote: "When we expanded our fleet, the team at Premier helped us choose the right equipment for our needs.", name: 'Sarah Martinez', title: 'Owner', company: 'Martinez Lawn Care' },
    { quote: "The financing options and trade-in program made upgrading our equipment painless.", name: 'David Chen', title: 'Fleet Manager', company: 'ProCut Commercial Services' },
  ]),
};

export const CORPORATE_EDGE_SAMPLE_PRODUCTS = [
  { id: 'demo-1', name: 'Professional Zero-Turn Mower', brand: 'Exmark', price: 12499, category: 'Mowers', condition: 'new', image_url: '', description: 'Commercial-grade 60" deck with 27HP engine for maximum productivity.' },
  { id: 'demo-2', name: 'Compact Utility Tractor', brand: 'John Deere', price: 18999, category: 'Tractors', condition: 'new', image_url: '', description: 'Versatile 25HP compact tractor perfect for landscaping and property maintenance.' },
  { id: 'demo-3', name: 'Professional Chainsaw', brand: 'Stihl', price: 599, category: 'Chainsaws', condition: 'new', image_url: '', description: '20" bar professional chainsaw with advanced anti-vibration technology.' },
  { id: 'demo-4', name: 'Commercial Backpack Blower', brand: 'Echo', price: 549, category: 'Blowers', condition: 'new', image_url: '', description: 'Powerful 79.9cc engine delivers 234 MPH air velocity for tough cleanups.' },
  { id: 'demo-5', name: 'Stand-On Commercial Mower', brand: 'Scag', price: 9899, sale_price: 8999, category: 'Mowers', condition: 'new', image_url: '', description: '52" deck stand-on mower with 25HP Kohler engine.' },
  { id: 'demo-6', name: 'Residential Zero-Turn', brand: 'Husqvarna', price: 5999, category: 'Mowers', condition: 'used', hours: 180, image_url: '', description: '54" residential zero-turn with comfortable high-back seat.' },
];

// ── Main Entry ──
export function renderCorporateEdgePage(
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
    primary: customizations?.colors?.primary || config?.colors?.primary?.default || '#1e3a8a',
    secondary: customizations?.colors?.secondary || config?.colors?.secondary?.default || '#dc2626',
    accent: customizations?.colors?.accent || config?.colors?.accent?.default || '#059669',
  };

  const fonts = {
    heading: customizations?.fonts?.heading || config?.fonts?.heading?.default || 'Roboto',
    body: customizations?.fonts?.body || config?.fonts?.body?.default || 'Open Sans',
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

  let body = '';
  switch (currentPage) {
    case 'home': case 'index': body = ceHomeSections(siteId, getContent, products, enabledFeatures, vis, colors); break;
    case 'service': body = ceServicePage(siteId, getContent); break;
    case 'contact': body = ceContactPage(siteId, getContent, weekdayHours, saturdayHours, sundayHours); break;
    case 'inventory': body = ceInventoryPage(siteId, getContent, products); break;
    case 'rentals': body = ceRentalsPage(siteId, getContent); break;
    case 'manufacturers': body = ceManufacturersPage(siteId, getContent); break;
    default: body = ceHomeSections(siteId, getContent, products, enabledFeatures, vis, colors); break;
  }

  return ceHtmlShell(
    getContent('business.name') || 'Premier Equipment',
    fonts,
    colors,
    ceHeader(siteId, currentPage, pages, getContent, weekdayHours, colors) +
    body +
    ceFooter(siteId, pages, getContent, weekdayHours, saturdayHours, sundayHours)
  );
}

// ── HTML Shell ──
function ceHtmlShell(title: string, fonts: any, colors: any, body: string) {
  const fontFamilies = new Set([fonts.heading, fonts.body]);
  const googleFontsUrl = Array.from(fontFamilies)
    .map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900`)
    .join('&');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?${googleFontsUrl}&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          heading: ['${fonts.heading}', 'sans-serif'],
          body: ['${fonts.body}', 'sans-serif'],
        },
        colors: {
          primary: '${colors.primary}',
          secondary: '${colors.secondary}',
          accent: '${colors.accent}',
        },
        borderRadius: {
          sm: '0.25rem',
        },
      }
    }
  }
  </script>
  <style>
    body { font-family: '${fonts.body}', sans-serif; background: #f8fafc; color: #1e293b; }
    .font-heading { font-family: '${fonts.heading}', sans-serif; }
    .transition-corporate { transition: all 0.3s ease-in-out; }
    .container-corporate { max-width: 80rem; margin: 0 auto; padding-left: 1rem; padding-right: 1rem; }
    @media(min-width:640px){ .container-corporate { padding-left: 1.5rem; padding-right: 1.5rem; } }
    @media(min-width:1024px){ .container-corporate { padding-left: 2rem; padding-right: 2rem; } }
  </style>
</head>
<body class="antialiased">
${body}
</body>
</html>`;
}

// ── Header ──
function ceHeader(siteId: string, currentPage: string, pages: any[], getContent: Function, weekdayHours: string, colors: any) {
  const businessName = getContent('business.name') || 'Premier Equipment';
  const phone = getContent('business.phone') || '(555) 123-4567';
  const initials = businessName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const navLinks = pages.map(p => {
    const isActive = p.slug === currentPage || (p.slug === 'index' && (currentPage === 'home' || currentPage === 'index'));
    return `<a href="/api/preview/${siteId}?page=${p.slug}"
      class="px-4 py-2 text-sm font-medium rounded transition-corporate ${isActive
        ? 'bg-white/20 text-white'
        : 'text-white/80 hover:text-white hover:bg-white/10'}"
    >${p.name || p.title}</a>`;
  }).join('\n');

  return `
  <header class="sticky top-0 z-50 shadow-lg" style="background-color: ${colors.primary};">
    <!-- Utility bar -->
    <div class="border-b border-white/10" style="background-color: ${colors.primary}; filter: brightness(0.9);">
      <div class="container-corporate py-2">
        <div class="flex justify-between items-center text-sm text-white/80">
          <span class="hidden sm:inline">Mon–Fri: ${weekdayHours}</span>
          <a href="tel:${phone}" class="flex items-center gap-2 hover:text-white transition-corporate">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            ${phone}
          </a>
        </div>
      </div>
    </div>

    <!-- Main nav -->
    <nav class="container-corporate">
      <div class="flex items-center justify-between h-16">
        <a href="/api/preview/${siteId}?page=index" class="flex items-center gap-3">
          <div class="bg-white rounded p-2">
            <span class="font-heading font-bold text-lg" style="color: ${colors.primary};">${initials}</span>
          </div>
          <span class="hidden sm:block font-heading font-bold text-white text-lg">${businessName}</span>
        </a>

        <div class="hidden lg:flex items-center gap-1">
          ${navLinks}
        </div>

        <div class="hidden lg:block">
          <a href="/api/preview/${siteId}?page=contact"
            class="inline-flex items-center px-5 py-2 rounded text-sm font-semibold text-white transition-corporate hover:brightness-110"
            style="background-color: ${colors.secondary};">
            Get a Quote
          </a>
        </div>

        <!-- Mobile: simplified -->
        <div class="lg:hidden flex items-center gap-3">
          <a href="tel:${phone}" class="text-white/80 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
          </a>
          <a href="/api/preview/${siteId}?page=contact"
            class="inline-flex items-center px-4 py-1.5 rounded text-xs font-semibold text-white"
            style="background-color: ${colors.secondary};">Quote</a>
        </div>
      </div>

      <!-- Mobile nav row -->
      <div class="lg:hidden overflow-x-auto pb-2 -mx-4 px-4">
        <div class="flex items-center gap-1 min-w-max">
          ${pages.map(p => {
            const isActive = p.slug === currentPage || (p.slug === 'index' && (currentPage === 'home' || currentPage === 'index'));
            return `<a href="/api/preview/${siteId}?page=${p.slug}"
              class="px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-corporate ${isActive
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'}"
            >${p.name || p.title}</a>`;
          }).join('\n')}
        </div>
      </div>
    </nav>
  </header>`;
}

// ── Footer ──
function ceFooter(siteId: string, pages: any[], getContent: Function, weekdayHours: string, saturdayHours: string, sundayHours: string) {
  const businessName = getContent('business.name') || 'Premier Equipment';
  const phone = getContent('business.phone') || '';
  const email = getContent('business.email') || '';
  const address = getContent('business.address') || '';
  const tagline = getContent('footer.tagline') || getContent('business.tagline') || '';
  const initials = businessName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const socialLinks = ['facebook', 'linkedin', 'youtube'].map(platform => {
    const url = getContent(`social.${platform}`);
    if (!url) return '';
    const icons: Record<string,string> = {
      facebook: '<path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>',
      linkedin: '<path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
      youtube: '<path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/><polygon points="9.75,15.02 15.5,11.75 9.75,8.48"/>',
    };
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-white/50 hover:text-white transition-corporate">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${icons[platform]}</svg>
    </a>`;
  }).filter(Boolean).join('');

  const quickLinks = pages.map(p =>
    `<li><a href="/api/preview/${siteId}?page=${p.slug}" class="text-white/70 hover:text-white transition-corporate">${p.name || p.title}</a></li>`
  ).join('\n');

  return `
  <footer style="background-color: var(--ce-primary, #1e3a8a); --ce-primary: ${getContent('_colors_primary') || '#1e3a8a'};" class="text-white">
    <div class="container-corporate py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <!-- Brand -->
        <div>
          <div class="flex items-center gap-3 mb-6">
            <div class="bg-white rounded p-2">
              <span class="font-heading font-bold text-lg" style="color: ${getContent('_colors_primary') || '#1e3a8a'};">${initials}</span>
            </div>
            <span class="font-heading font-bold text-xl">${businessName}</span>
          </div>
          <p class="text-white/70 mb-6 leading-relaxed">${tagline}</p>
          <div class="flex gap-4">${socialLinks}</div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="font-heading font-semibold text-lg mb-6">Quick Links</h3>
          <ul class="space-y-3">${quickLinks}</ul>
        </div>

        <!-- Brands -->
        <div>
          <h3 class="font-heading font-semibold text-lg mb-6">Brands We Carry</h3>
          <ul class="space-y-3 text-white/70">
            <li>John Deere</li><li>Exmark</li><li>Stihl</li><li>Husqvarna</li><li>Kubota</li><li>Scag</li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="font-heading font-semibold text-lg mb-6">Contact Us</h3>
          <ul class="space-y-4 text-white/70">
            ${phone ? `<li class="flex items-start gap-3"><svg class="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg><a href="tel:${phone}" class="hover:text-white">${phone}</a></li>` : ''}
            ${email ? `<li class="flex items-start gap-3"><svg class="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg><a href="mailto:${email}" class="hover:text-white">${email}</a></li>` : ''}
            ${address ? `<li class="flex items-start gap-3"><svg class="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg><span>${address}</span></li>` : ''}
          </ul>
          <div class="mt-6 pt-6 border-t border-white/10">
            <h4 class="font-semibold mb-2">Business Hours</h4>
            <div class="text-white/70 text-sm space-y-1">
              <p>Mon–Fri: ${weekdayHours}</p>
              <p>Saturday: ${saturdayHours}</p>
              <p>Sunday: ${sundayHours}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="border-t border-white/10">
      <div class="container-corporate py-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
          <p>&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
          <div class="flex gap-6">
            <a href="/api/preview/${siteId}?page=contact" class="hover:text-white transition-corporate">Privacy Policy</a>
            <a href="/api/preview/${siteId}?page=contact" class="hover:text-white transition-corporate">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  </footer>`;
}

// ── Home Sections ──
function ceHomeSections(siteId: string, getContent: Function, products: any[], enabledFeatures: Set<string>, vis: Record<string, boolean>, colors: any) {
  let html = '';

  // ── Hero ──
  if (vis.hero !== false) {
    const heroImg = getContent('hero.image') || '/images/hero-mower.jpg';
    html += `
    <section data-section="hero" class="relative overflow-hidden flex items-center" style="min-height: 550px;">
      <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('${heroImg}');"></div>
      <div class="absolute inset-0" style="background: linear-gradient(to right, ${colors.primary}f2, ${colors.primary}d9, ${colors.primary}b3);"></div>
      <div class="relative container-corporate py-20 lg:py-32">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            ${getContent('hero.heading') || getContent('hero.title') || 'Professional Equipment You Can Trust'}
          </h1>
          <p class="text-base md:text-xl text-white/80 mb-10 leading-relaxed">
            ${getContent('hero.subheading') || getContent('hero.subtitle') || ''}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/api/preview/${siteId}?page=inventory"
              class="inline-flex items-center justify-center px-8 py-3.5 rounded font-semibold text-lg text-white transition-corporate hover:brightness-110"
              style="background-color: ${colors.secondary};">
              ${getContent('hero.ctaPrimary') || getContent('hero.ctaButton') || 'Browse Inventory'}
            </a>
            <a href="/api/preview/${siteId}?page=contact"
              class="inline-flex items-center justify-center px-8 py-3.5 rounded font-semibold text-lg text-white border-2 border-white hover:bg-white transition-corporate"
              style="hover:color: ${colors.primary};">
              ${getContent('hero.ctaSecondary') || 'Schedule Consultation'}
            </a>
          </div>
        </div>
      </div>
      <!-- Bottom wave -->
      <div class="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto" preserveAspectRatio="none">
          <path d="M0 60L1440 60L1440 30C1440 30 1320 0 720 0C120 0 0 30 0 30L0 60Z" fill="#f8fafc"/>
        </svg>
      </div>
    </section>`;
  }

  // ── Why Choose Us / Trust Badges ──
  if (vis.whyChoose !== false) {
    let badges: any[] = [];
    try { badges = JSON.parse(getContent('whyChoose.items') || '[]'); } catch {}
    if (badges.length > 0) {
      html += `
      <section data-section="whyChoose" class="py-16 bg-gray-100">
        <div class="container-corporate">
          <div class="text-center mb-12">
            <h2 class="font-heading text-3xl lg:text-4xl font-bold text-gray-900 mb-4">${getContent('whyChoose.heading') || 'Why Choose Us'}</h2>
            <p class="text-gray-500 max-w-2xl mx-auto">${getContent('whyChoose.description') || ''}</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${badges.map((b: any) => `
            <div class="bg-white p-6 rounded shadow-sm border border-gray-200 text-center transition-corporate hover:shadow-md hover:-translate-y-1">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style="background-color: ${colors.primary}15;">
                <span class="text-2xl">${b.icon || '🛡'}</span>
              </div>
              <h3 class="font-heading font-semibold text-lg text-gray-900 mb-2">${b.title}</h3>
              <p class="text-gray-500 text-sm">${b.description}</p>
            </div>`).join('')}
          </div>
        </div>
      </section>`;
    }
  }

  // ── Stats ──
  if (vis.stats !== false) {
    let stats: any[] = [];
    try { stats = JSON.parse(getContent('stats.items') || '[]'); } catch {}
    if (stats.length > 0) {
      html += `
      <section data-section="stats" class="py-16 bg-white">
        <div class="container-corporate">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            ${stats.map((s: any) => `
            <div class="text-center p-6 bg-white rounded shadow-sm border border-gray-200 transition-corporate hover:shadow-md">
              <div class="font-heading text-3xl lg:text-5xl font-bold mb-2" style="color: ${colors.primary};">${s.value}</div>
              <div class="text-gray-500 font-medium text-sm md:text-base">${s.label}</div>
            </div>`).join('')}
          </div>
        </div>
      </section>`;
    }
  }

  // ── Featured Products ──
  if (vis.featuredProducts !== false && products.length > 0) {
    const featured = products.slice(0, 4);
    html += `
    <section data-section="featuredProducts" class="py-20 bg-white">
      <div class="container-corporate">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-12">
          <div>
            <h2 class="font-heading text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Featured Equipment</h2>
            <p class="text-gray-500">Explore our selection of premium lawn care equipment</p>
          </div>
          <a href="/api/preview/${siteId}?page=inventory" class="inline-flex items-center gap-2 font-semibold hover:gap-3 transition-all" style="color: ${colors.primary};">
            View All Inventory
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${featured.map((p: any) => {
            const imgUrl = p.image_url || p.primary_image || ''; const hasImage = imgUrl && !imgUrl.includes('placeholder');
            const displayPrice = p.sale_price || p.price;
            return `
          <div class="group overflow-hidden border border-gray-200 rounded shadow-sm transition-corporate hover:shadow-lg bg-white">
            <div class="aspect-square relative overflow-hidden bg-gray-100">
              ${hasImage
                ? `<img src="${imgUrl}" alt="${p.name || p.title}" class="w-full h-full object-cover transition-corporate group-hover:scale-105"/>`
                : `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                  </div>`}
              <span class="absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-semibold text-white" style="background-color: ${colors.primary};">${p.brand || 'Brand'}</span>
              ${p.condition === 'used' ? `<span class="absolute top-3 right-3 px-2 py-1 rounded text-xs font-semibold bg-amber-500 text-white">Used${p.hours ? ` · ${p.hours}hrs` : ''}</span>` : ''}
            </div>
            <div class="p-5">
              <p class="text-sm text-gray-500 mb-1">${p.category || ''}</p>
              <h3 class="font-heading font-semibold text-gray-900 mb-2 truncate">${p.name || p.title}</h3>
              <p class="text-gray-500 text-sm mb-4 line-clamp-2">${p.description || ''}</p>
              <div class="flex items-center justify-between">
                <div>
                  ${p.sale_price ? `<span class="text-gray-400 line-through text-sm mr-2">$${Number(p.price).toLocaleString()}</span>` : ''}
                  <span class="font-heading font-bold text-lg" style="color: ${colors.primary};">$${Number(displayPrice).toLocaleString()}</span>
                </div>
                <a href="/api/preview/${siteId}?page=contact" class="text-sm font-semibold hover:underline" style="color: ${colors.primary};">Details →</a>
              </div>
            </div>
          </div>`;
          }).join('')}
        </div>
      </div>
    </section>`;
  }

  // ── Manufacturers ──
  if (vis.manufacturers !== false) {
    const brands = ['John Deere', 'Exmark', 'Stihl', 'Husqvarna', 'Kubota', 'Scag', 'Toro', 'Echo'];
    const logos: Record<string,string> = { 'Toro': '/images/logos/toro.png', 'John Deere': '/images/logos/john-deere.png', 'Exmark': '/images/logos/exmark.png', 'Stihl': '/images/logos/stihl.png', 'Husqvarna': '/images/logos/husqvarna.png', 'Kubota': '/images/logos/kubota.jpg', 'Scag': '/images/logos/scag.png', 'Echo': '/images/logos/echo.png' };
    html += `
    <section data-section="manufacturers" class="py-20 bg-gray-100">
      <div class="container-corporate">
        <div class="text-center mb-12">
          <h2 class="font-heading text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Authorized Dealer</h2>
          <p class="text-gray-500 max-w-2xl mx-auto">We're proud to be an authorized dealer for the industry's leading brands</p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          ${brands.slice(0, 6).map(b => `
          <a href="/api/preview/${siteId}?page=manufacturers" class="group bg-white p-6 rounded border border-gray-200 transition-corporate hover:shadow-md hover:border-blue-200 text-center">
            <img src="${logos[b] || ''}" alt="${b}" style="max-height: 48px; width: auto; margin: 0 auto 0.75rem auto; display: block;">
            <p class="font-semibold text-gray-900 text-sm">${b}</p>
            <div class="flex items-center justify-center gap-1 mt-1">
              <svg class="w-3 h-3" style="color: ${colors.accent};" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              <span class="text-xs" style="color: ${colors.accent};">Authorized</span>
            </div>
          </a>`).join('')}
        </div>
        <div class="text-center mt-10">
          <a href="/api/preview/${siteId}?page=manufacturers" class="inline-flex items-center gap-2 font-semibold hover:gap-3 transition-all" style="color: ${colors.primary};">
            View All Manufacturers
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
        </div>
      </div>
    </section>`;
  }

  // ── Testimonials ──
  if (vis.testimonials !== false) {
    let testimonials: any[] = [];
    try { testimonials = JSON.parse(getContent('testimonials.items') || '[]'); } catch {}
    if (testimonials.length > 0) {
      html += `
      <section data-section="testimonials" class="py-20 bg-white">
        <div class="container-corporate">
          <div class="text-center mb-12">
            <h2 class="font-heading text-3xl lg:text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p class="text-gray-500 max-w-2xl mx-auto">Don't just take our word for it — hear from the professionals who trust us</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${testimonials.map((t: any) => `
            <div class="border border-gray-200 rounded transition-corporate hover:shadow-lg p-8 bg-white">
              <svg class="w-10 h-10 mb-4 opacity-20" style="color: ${colors.primary};" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z"/></svg>
              <p class="text-gray-700 mb-6 leading-relaxed">"${t.quote}"</p>
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span class="font-heading font-bold text-sm" style="color: ${colors.primary};">${t.name?.split(' ').map((w: string) => w[0]).join('') || ''}</span>
                </div>
                <div>
                  <p class="font-heading font-semibold text-gray-900">${t.name}</p>
                  <p class="text-sm text-gray-500">${t.title}, ${t.company}</p>
                </div>
              </div>
            </div>`).join('')}
          </div>
        </div>
      </section>`;
    }
  }

  // ── CTA ──
  if (vis.cta !== false) {
    html += `
    <section data-section="cta" class="py-20" style="background-color: ${colors.primary};">
      <div class="container-corporate">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="font-heading text-3xl lg:text-4xl font-bold text-white mb-4">${getContent('cta.heading') || 'Ready to Upgrade Your Equipment?'}</h2>
          <p class="text-white/80 text-lg mb-8 leading-relaxed">${getContent('cta.description') || ''}</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/api/preview/${siteId}?page=contact"
              class="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded font-semibold text-lg text-white transition-corporate hover:brightness-110"
              style="background-color: ${colors.secondary};">
              ${getContent('cta.button') || 'Schedule Consultation'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
            <a href="/api/preview/${siteId}?page=inventory"
              class="inline-flex items-center justify-center px-8 py-3.5 rounded font-semibold text-lg text-white border-2 border-white hover:bg-white transition-corporate">
              Browse Equipment
            </a>
          </div>
        </div>
      </div>
    </section>`;
  }

  return html;
}

// ── Service Page ──
function ceServicePage(siteId: string, getContent: Function) {
  let services: any[] = [];
  try { services = JSON.parse(getContent('services.items') || '[]'); } catch {}

  return `
  ${cePageHeader(getContent('services.heading') || 'Service Department', getContent('services.description') || '')}

  <section class="py-16 bg-white">
    <div class="container-corporate">
      <div class="text-center mb-12">
        <h2 class="font-heading text-3xl font-bold text-gray-900 mb-4">Our Services</h2>
        <p class="text-gray-500 max-w-2xl mx-auto">From routine maintenance to complex repairs, our certified technicians keep your equipment running at peak performance.</p>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${services.map((s: any) => `
        <div class="border border-gray-200 rounded transition-corporate hover:shadow-lg bg-white p-6">
          <div class="w-12 h-12 bg-blue-50 rounded flex items-center justify-center mb-4">
            <span class="text-xl">${s.icon || '🔧'}</span>
          </div>
          <h3 class="font-heading font-semibold text-xl text-gray-900 mb-3">${s.title}</h3>
          <p class="text-gray-500 mb-4 text-sm leading-relaxed">${s.description}</p>
          ${s.features ? `<ul class="space-y-2">${s.features.map((f: string) => `<li class="flex items-center gap-2 text-sm"><div class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>${f}</li>`).join('')}</ul>` : ''}
        </div>`).join('')}
      </div>
    </div>
  </section>

  ${ceFormSection(siteId, 'Schedule a Service Consultation', 'Fill out the form below and our service team will contact you within one business day.')}`;
}

// ── Contact Page ──
function ceContactPage(siteId: string, getContent: Function, weekdayHours: string, saturdayHours: string, sundayHours: string) {
  const phone = getContent('business.phone') || '';
  const email = getContent('business.email') || '';
  const address = getContent('business.address') || '';

  return `
  ${cePageHeader(getContent('contact.heading') || 'Contact Us', getContent('contact.description') || '')}

  <section class="py-16 bg-white">
    <div class="container-corporate">
      <div class="grid lg:grid-cols-3 gap-12">
        <!-- Form -->
        <div class="lg:col-span-2">
          <div class="border border-gray-200 rounded bg-white p-8">
            <h2 class="font-heading text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            <form class="space-y-6" onsubmit="event.preventDefault();">
              <div class="grid md:grid-cols-2 gap-6">
                <div><label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label><input type="text" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" placeholder="John" required></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label><input type="text" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" placeholder="Smith" required></div>
              </div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">Company Name</label><input type="text" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" placeholder="Your Company LLC"></div>
              <div class="grid md:grid-cols-2 gap-6">
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" placeholder="john@company.com" required></div>
                <div><label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input type="tel" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" placeholder="(555) 123-4567" required></div>
              </div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">Subject *</label><input type="text" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" placeholder="How can we help you?" required></div>
              <div><label class="block text-sm font-medium text-gray-700 mb-1">Message *</label><textarea rows="6" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none resize-y" placeholder="Please provide details about your inquiry..." required></textarea></div>
              <button type="submit" class="w-full py-3 rounded font-semibold text-white transition-corporate hover:brightness-110 bg-blue-900">Send Message</button>
            </form>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <div class="border border-gray-200 rounded bg-white p-6">
            <h3 class="font-heading font-semibold text-lg text-gray-900 mb-4">Contact Information</h3>
            <ul class="space-y-4 text-gray-600">
              ${phone ? `<li class="flex items-start gap-3"><svg class="w-5 h-5 mt-0.5 shrink-0 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg><div><p class="font-medium text-gray-900">Phone</p><a href="tel:${phone}" class="text-blue-700 hover:underline">${phone}</a></div></li>` : ''}
              ${email ? `<li class="flex items-start gap-3"><svg class="w-5 h-5 mt-0.5 shrink-0 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg><div><p class="font-medium text-gray-900">Email</p><a href="mailto:${email}" class="text-blue-700 hover:underline">${email}</a></div></li>` : ''}
              ${address ? `<li class="flex items-start gap-3"><svg class="w-5 h-5 mt-0.5 shrink-0 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg><div><p class="font-medium text-gray-900">Address</p><p>${address}</p></div></li>` : ''}
            </ul>
          </div>
          <div class="border border-gray-200 rounded bg-white p-6">
            <h3 class="font-heading font-semibold text-lg text-gray-900 mb-4">Business Hours</h3>
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex justify-between"><span>Monday – Friday</span><span class="font-medium text-gray-900">${weekdayHours}</span></div>
              <div class="flex justify-between"><span>Saturday</span><span class="font-medium text-gray-900">${saturdayHours}</span></div>
              <div class="flex justify-between"><span>Sunday</span><span class="font-medium text-gray-900">${sundayHours}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

// ── Inventory Page ──
function ceInventoryPage(siteId: string, getContent: Function, products: any[]) {
  const categories = ['All', ...new Set(products.map((p: any) => p.category).filter(Boolean))];

  return `
  ${cePageHeader(getContent('inventory.heading') || 'Equipment Inventory', getContent('inventory.description') || '')}

  <!-- Category Filter -->
  <section class="bg-white border-b border-gray-200 sticky top-[104px] z-40">
    <div class="container-corporate py-4">
      <div class="flex flex-wrap gap-2" id="ce-filters">
        ${categories.map((cat, i) => `
        <button onclick="ceFilterCategory('${cat}')"
          class="ce-cat-btn px-4 py-2 rounded text-sm font-medium transition-corporate ${i === 0
            ? 'bg-blue-900 text-white'
            : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}"
          data-category="${cat}">${cat}</button>`).join('')}
      </div>
    </div>
  </section>

  <!-- Products Grid -->
  <section class="py-12 bg-gray-50">
    <div class="container-corporate">
      <p class="text-gray-500 mb-8">Showing <span class="font-semibold text-gray-900" id="ce-count">${products.length}</span> products</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="ce-product-grid">
        ${products.map((p: any) => {
          const imgUrl = p.image_url || p.primary_image || ''; const hasImage = imgUrl && !imgUrl.includes('placeholder');
          const displayPrice = p.sale_price || p.price;
          return `
        <div class="ce-product group overflow-hidden border border-gray-200 rounded shadow-sm transition-corporate hover:shadow-lg bg-white" data-category="${p.category || ''}">
          <div class="aspect-square relative overflow-hidden bg-gray-100">
            ${hasImage
              ? `<img src="${imgUrl}" alt="${p.name || p.title}" class="w-full h-full object-cover transition-corporate group-hover:scale-105"/>`
              : `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                </div>`}
            <span class="absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-semibold text-white bg-blue-900">${p.brand || ''}</span>
            ${p.condition === 'used' ? `<span class="absolute top-3 right-3 px-2 py-1 rounded text-xs font-semibold bg-amber-500 text-white">Used${p.hours ? ` · ${p.hours}hrs` : ''}</span>` : ''}
          </div>
          <div class="p-5">
            <p class="text-sm text-gray-500 mb-1">${p.category || ''}</p>
            <h3 class="font-heading font-semibold text-gray-900 mb-2 truncate">${p.name || p.title}</h3>
            <p class="text-gray-500 text-sm mb-4 line-clamp-2">${p.description || ''}</p>
            <div class="flex items-center justify-between">
              <div>
                ${p.sale_price ? `<span class="text-gray-400 line-through text-sm mr-2">$${Number(p.price).toLocaleString()}</span>` : ''}
                <span class="font-heading font-bold text-lg text-blue-900">$${Number(displayPrice).toLocaleString()}</span>
              </div>
              <a href="/api/preview/${siteId}?page=contact" class="text-sm font-semibold text-blue-900 hover:underline">Details →</a>
            </div>
          </div>
        </div>`;
        }).join('')}
      </div>
    </div>
  </section>

  <script>
  function ceFilterCategory(cat) {
    document.querySelectorAll('.ce-cat-btn').forEach(btn => {
      const isSel = btn.getAttribute('data-category') === cat;
      btn.className = 'ce-cat-btn px-4 py-2 rounded text-sm font-medium transition-corporate ' +
        (isSel ? 'bg-blue-900 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100');
    });
    let count = 0;
    document.querySelectorAll('.ce-product').forEach(el => {
      const show = cat === 'All' || el.getAttribute('data-category') === cat;
      el.style.display = show ? '' : 'none';
      if (show) count++;
    });
    document.getElementById('ce-count').textContent = count;
  }
  </script>`;
}

// ── Rentals Page ──
function ceRentalsPage(siteId: string, getContent: Function) {
  const rentalCategories = [
    {
      name: 'Mowers',
      items: [
        { name: 'Commercial Zero-Turn 60"', daily: '$150', weekly: '$600', monthly: '$1,800' },
        { name: 'Walk-Behind 36"', daily: '$75', weekly: '$300', monthly: '$900' },
        { name: 'Stand-On Mower 52"', daily: '$125', weekly: '$500', monthly: '$1,500' },
      ]
    },
    {
      name: 'Compact Equipment',
      items: [
        { name: 'Compact Tractor w/ Loader', daily: '$200', weekly: '$800', monthly: '$2,400' },
        { name: 'Utility Vehicle', daily: '$100', weekly: '$400', monthly: '$1,200' },
        { name: 'Mini Skid Steer', daily: '$175', weekly: '$700', monthly: '$2,100' },
      ]
    },
    {
      name: 'Handheld Equipment',
      items: [
        { name: 'Chainsaw (Professional)', daily: '$50', weekly: '$175', monthly: '$450' },
        { name: 'Backpack Blower', daily: '$35', weekly: '$120', monthly: '$300' },
        { name: 'String Trimmer', daily: '$30', weekly: '$100', monthly: '$250' },
      ]
    },
  ];

  return `
  ${cePageHeader(getContent('rentals.heading') || 'Equipment Rentals', getContent('rentals.description') || '')}

  <section class="py-16 bg-white">
    <div class="container-corporate space-y-8">
      ${rentalCategories.map(cat => `
      <div class="border border-gray-200 rounded overflow-hidden">
        <div class="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <h3 class="font-heading font-semibold text-xl text-gray-900">${cat.name}</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-50/50">
                <th class="text-left px-6 py-3 text-sm font-semibold text-gray-700">Equipment</th>
                <th class="text-center px-6 py-3 text-sm font-semibold text-gray-700">Daily</th>
                <th class="text-center px-6 py-3 text-sm font-semibold text-gray-700">Weekly</th>
                <th class="text-center px-6 py-3 text-sm font-semibold text-gray-700">Monthly</th>
                <th class="text-right px-6 py-3 text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              ${cat.items.map(item => `
              <tr class="border-t border-gray-100 hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900">${item.name}</td>
                <td class="px-6 py-4 text-center text-gray-600">${item.daily}</td>
                <td class="px-6 py-4 text-center text-gray-600">${item.weekly}</td>
                <td class="px-6 py-4 text-center text-gray-600">${item.monthly}</td>
                <td class="px-6 py-4 text-right">
                  <a href="/api/preview/${siteId}?page=contact" class="inline-flex items-center px-4 py-1.5 rounded border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-corporate">Request Rental</a>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`).join('')}
    </div>
  </section>

  <!-- Terms -->
  <section class="py-16 bg-gray-100">
    <div class="container-corporate">
      <h2 class="font-heading text-3xl font-bold text-gray-900 mb-8 text-center">Rental Terms & Conditions</h2>
      <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div class="border border-gray-200 rounded bg-white p-6">
          <h3 class="font-heading font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            What's Included
          </h3>
          <ul class="space-y-2 text-gray-600 text-sm">
            <li>• Equipment orientation and training</li>
            <li>• Regular maintenance during rental period</li>
            <li>• Breakdown support and replacement</li>
            <li>• Delivery and pickup (within 25 miles)</li>
          </ul>
        </div>
        <div class="border border-gray-200 rounded bg-white p-6">
          <h3 class="font-heading font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
            Requirements
          </h3>
          <ul class="space-y-2 text-gray-600 text-sm">
            <li>• Valid government-issued ID</li>
            <li>• Security deposit required</li>
            <li>• Proof of insurance for heavy equipment</li>
            <li>• Signed rental agreement</li>
          </ul>
        </div>
      </div>
    </div>
  </section>`;
}

// ── Manufacturers Page ──
function ceManufacturersPage(siteId: string, getContent: Function) {
  const logos: Record<string,string> = { 'Toro': '/images/logos/toro.png', 'John Deere': '/images/logos/john-deere.png', 'Exmark': '/images/logos/exmark.png', 'Stihl': '/images/logos/stihl.png', 'Husqvarna': '/images/logos/husqvarna.png', 'Kubota': '/images/logos/kubota.jpg', 'Scag': '/images/logos/scag.png', 'Echo': '/images/logos/echo.png' };
  const manufacturers = [
    { name: 'John Deere', description: 'World-leading manufacturer of agricultural and turf equipment.' },
    { name: 'Exmark', description: 'Premium commercial mowing equipment for landscape professionals.' },
    { name: 'Stihl', description: 'The #1 selling brand of gasoline-powered handheld outdoor power equipment.' },
    { name: 'Husqvarna', description: 'Innovative outdoor power products for forest, park, and garden care.' },
    { name: 'Kubota', description: 'Compact tractors and utility vehicles built for performance.' },
    { name: 'Scag', description: 'Simply the best commercial mowers in the industry.' },
    { name: 'Toro', description: 'Trusted by golf courses, sports fields, and landscape contractors.' },
    { name: 'Echo', description: 'Professional-grade outdoor power equipment since 1972.' },
  ];

  return `
  ${cePageHeader(getContent('manufacturers.heading') || 'Our Manufacturers', getContent('manufacturers.description') || '')}

  <section class="py-16 bg-white">
    <div class="container-corporate">
      <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        ${manufacturers.map(m => `
        <div class="border border-gray-200 rounded transition-corporate hover:shadow-lg hover:border-blue-200 group bg-white p-6">
          <div class="aspect-[3/2] flex items-center justify-center bg-gray-50 rounded mb-4 p-4">
            <img src="${logos[m.name] || ''}" alt="${m.name}" style="max-height: 60px; max-width: 80%; object-fit: contain;">
          </div>
          <div class="flex items-center gap-2 mb-3">
            <h3 class="font-heading font-semibold text-lg text-gray-900">${m.name}</h3>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              Authorized
            </span>
          </div>
          <p class="text-gray-500 text-sm mb-4 line-clamp-2">${m.description}</p>
          <a href="/api/preview/${siteId}?page=inventory" class="inline-flex items-center gap-2 w-full justify-center px-4 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 group-hover:bg-blue-900 group-hover:text-white group-hover:border-blue-900 transition-corporate">
            Shop ${m.name}
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <!-- Why Authorized -->
  <section class="py-16 bg-gray-100">
    <div class="container-corporate text-center max-w-4xl mx-auto">
      <h2 class="font-heading text-3xl font-bold text-gray-900 mb-6">Why Buy From an Authorized Dealer?</h2>
      <p class="text-gray-500 text-lg mb-10 leading-relaxed">When you purchase from an authorized dealer, you get factory-backed warranties, genuine parts, and service from certified technicians.</p>
      <div class="grid sm:grid-cols-3 gap-6">
        <div class="bg-white border border-gray-200 rounded p-6">
          <div class="text-3xl mb-3">🛡️</div>
          <h3 class="font-heading font-semibold text-gray-900 mb-2">Full Warranty</h3>
          <p class="text-gray-500 text-sm">Factory warranty coverage on all new equipment</p>
        </div>
        <div class="bg-white border border-gray-200 rounded p-6">
          <div class="text-3xl mb-3">⚙️</div>
          <h3 class="font-heading font-semibold text-gray-900 mb-2">Genuine Parts</h3>
          <p class="text-gray-500 text-sm">OEM parts that meet manufacturer specifications</p>
        </div>
        <div class="bg-white border border-gray-200 rounded p-6">
          <div class="text-3xl mb-3">🏆</div>
          <h3 class="font-heading font-semibold text-gray-900 mb-2">Certified Service</h3>
          <p class="text-gray-500 text-sm">Factory-trained technicians you can trust</p>
        </div>
      </div>
    </div>
  </section>`;
}

// ── Shared Helpers ──
function cePageHeader(title: string, description: string) {
  return `
  <section class="py-12 md:py-16 bg-blue-900">
    <div class="container-corporate">
      <h1 class="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">${title}</h1>
      <p class="text-white/80 text-base md:text-lg max-w-2xl">${description}</p>
    </div>
  </section>`;
}

function ceFormSection(siteId: string, heading: string, description: string) {
  return `
  <section class="py-16 bg-gray-100">
    <div class="container-corporate max-w-3xl">
      <div class="text-center mb-12">
        <h2 class="font-heading text-3xl font-bold text-gray-900 mb-4">${heading}</h2>
        <p class="text-gray-500">${description}</p>
      </div>
      <div class="border border-gray-200 rounded bg-white p-8">
        <form class="space-y-6" onsubmit="event.preventDefault();">
          <div class="grid md:grid-cols-2 gap-6">
            <div><label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label><input type="text" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" required></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label><input type="text" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" required></div>
          </div>
          <div class="grid md:grid-cols-2 gap-6">
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" required></div>
            <div><label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input type="tel" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" required></div>
          </div>
          <div><label class="block text-sm font-medium text-gray-700 mb-1">Message *</label><textarea rows="4" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none resize-y" required></textarea></div>
          <button type="submit" class="w-full py-3 rounded font-semibold text-white bg-blue-900 transition-corporate hover:brightness-110">Submit Request</button>
        </form>
      </div>
    </div>
  </section>`;
}
