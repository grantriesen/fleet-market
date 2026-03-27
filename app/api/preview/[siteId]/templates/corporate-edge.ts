// ─── Corporate Edge ── Standalone Template ───────────────────────────────
// Design: Deep navy primary, red CTA, green accent. Sharp corners.
//         Roboto headings (600), Open Sans body. Clean professional cards,
//         utility bar in header, bottom wave on hero.
// ──────────────────────────────────────────────────────────────────────────

import { rentalModalBlock, rentalReserveButton } from './shared-rental';
import { productCardOnclick, injectCartSystem } from './shared';

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
export async function renderCorporateEdgePage(
  siteId: string,
  currentPage: string,
  pages: any[],
  products: any[],
  config: any,
  customizations: any,
  enabledFeatures: Set<string>,
  vis: Record<string, boolean>,
  content: Record<string, string> = {},
  manufacturers: any[] = [],
  baseUrl: string = `/api/preview/${siteId}?page=`,
  supabase?: any,
  siteAddons: string[] = [],
  checkoutMode: string = 'quote_only',
  stripeConnected: boolean = false
) {
  const CE_KEY_ALIASES: Record<string,string> = {
    'business.name':    'businessInfo.businessName',
    'business.phone':   'businessInfo.phone',
    'business.email':   'businessInfo.email',
    'business.address': 'businessInfo.address',
    'business.tagline': 'businessInfo.tagline',
    'business.hours':   'hours.hours',
  };
  const getContent = (key: string): string => {
    if (content[key]) return content[key];
    const alias = CE_KEY_ALIASES[key];
    if (alias && content[alias]) return content[alias];
    const parts = key.split('.');
    if (parts.length === 2) {
      const [section, field] = parts;
      const val = config?.sections?.[section]?.[field]?.default;
      if (val) return val;
    }
    if (alias) { const ap = alias.split('.'); if (ap.length === 2) { const v = config?.sections?.[ap[0]]?.[ap[1]]?.default; if (v) return v; } }
    return '';
  };

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
  const hoursRawCE = getContent('business.hours');
  if (hoursRawCE && hoursRawCE.startsWith('{')) {
    try { hours = JSON.parse(hoursRawCE); } catch { hours = {}; }
  }
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
    case 'home': case 'index': body = ceHomeSections(siteId, getContent, products, enabledFeatures, vis, colors, manufacturers, baseUrl); break;
    case 'service': body = ceServicePage(siteId, getContent, baseUrl, enabledFeatures, supabase, colors.primary); break;
    case 'contact': body = ceContactPage(siteId, getContent, weekdayHours, saturdayHours, sundayHours, baseUrl, colors.primary); break;
    case 'inventory': body = ceInventoryPage(siteId, getContent, products, baseUrl, colors.primary); break;
    case 'rentals': body = await ceRentalsPage(siteId, getContent, baseUrl, supabase, enabledFeatures.has('rental_scheduling') || siteAddons.includes('rentals'), colors.primary); break;
    case 'manufacturers': body = ceManufacturersPage(siteId, getContent, baseUrl, manufacturers, colors.primary); break;
    default: body = ceHomeSections(siteId, getContent, products, enabledFeatures, vis, colors, manufacturers, baseUrl); break;
  }

  const shell = ceHtmlShell(
    getContent('business.name') || 'Premier Equipment',
    fonts,
    colors,
    ceHeader(siteId, currentPage, pages, getContent, weekdayHours, colors, baseUrl) +
    body +
    ceFooter(siteId, pages, getContent, weekdayHours, saturdayHours, sundayHours, colors, manufacturers, baseUrl),
    enabledFeatures,
    siteId,
    checkoutMode,
    stripeConnected
  );

  return shell
    + (enabledFeatures && enabledFeatures.has('rental_scheduling') ? rentalModalBlock('fm', siteId) : '')
    + injectCartSystem(siteId, checkoutMode, colors.primary)
    + '\n</body>\n</html>';
}

// ── HTML Shell ──
function ceHtmlShell(title: string, fonts: any, colors: any, body: string, enabledFeatures?: Set<string>, siteId?: string, checkoutMode: string = 'quote_only', stripeConnected: boolean = false) {
  const fontFamilies = new Set([fonts.heading, fonts.body]);
  const googleFontsUrl = Array.from(fontFamilies)
    .map(f => `family=${f.replace(/ /g, '+')}:wght@400;600;700`)
    .join('&');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?${googleFontsUrl}&display=swap" rel="stylesheet">
  <style>*,:after,:before{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }::backdrop{--tw-border-spacing-x:0;--tw-border-spacing-y:0;--tw-translate-x:0;--tw-translate-y:0;--tw-rotate:0;--tw-skew-x:0;--tw-skew-y:0;--tw-scale-x:1;--tw-scale-y:1;--tw-pan-x: ;--tw-pan-y: ;--tw-pinch-zoom: ;--tw-scroll-snap-strictness:proximity;--tw-gradient-from-position: ;--tw-gradient-via-position: ;--tw-gradient-to-position: ;--tw-ordinal: ;--tw-slashed-zero: ;--tw-numeric-figure: ;--tw-numeric-spacing: ;--tw-numeric-fraction: ;--tw-ring-inset: ;--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(59,130,246,.5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000;--tw-shadow-colored:0 0 #0000;--tw-blur: ;--tw-brightness: ;--tw-contrast: ;--tw-grayscale: ;--tw-hue-rotate: ;--tw-invert: ;--tw-saturate: ;--tw-sepia: ;--tw-drop-shadow: ;--tw-backdrop-blur: ;--tw-backdrop-brightness: ;--tw-backdrop-contrast: ;--tw-backdrop-grayscale: ;--tw-backdrop-hue-rotate: ;--tw-backdrop-invert: ;--tw-backdrop-opacity: ;--tw-backdrop-saturate: ;--tw-backdrop-sepia: ;--tw-contain-size: ;--tw-contain-layout: ;--tw-contain-paint: ;--tw-contain-style: }/*! tailwindcss v3.4.19 | MIT License | https://tailwindcss.com*/*,:after,:before{box-sizing:border-box;border:0 solid #e5e7eb}:after,:before{--tw-content:""}:host,html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,Courier New,monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}button,input:where([type=button]),input:where([type=reset]),input:where([type=submit]){-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type=search]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0}fieldset,legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::-moz-placeholder,textarea::-moz-placeholder{opacity:1;color:#9ca3af}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}[role=button],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden=until-found])){display:none}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}.not-sr-only{position:static;width:auto;height:auto;padding:0;margin:0;overflow:visible;clip:auto;white-space:normal}.absolute{position:absolute}.relative{position:relative}.sticky{position:sticky}.inset-0{inset:0}.bottom-0{bottom:0}.left-0{left:0}.left-3{left:.75rem}.right-0{right:0}.right-3{right:.75rem}.top-0{top:0}.top-3{top:.75rem}.top-\[104px\]{top:104px}.z-40{z-index:40}.z-50{z-index:50}.-mx-4{margin-left:-1rem;margin-right:-1rem}.mx-auto{margin-left:auto;margin-right:auto}.mb-1{margin-bottom:.25rem}.mb-10{margin-bottom:2.5rem}.mb-12{margin-bottom:3rem}.mb-2{margin-bottom:.5rem}.mb-3{margin-bottom:.75rem}.mb-4{margin-bottom:1rem}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}.mr-2{margin-right:.5rem}.mt-1{margin-top:.25rem}.mt-10{margin-top:2.5rem}.mt-6{margin-top:1.5rem}.line-clamp-2{overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2}.block{display:block}.flex{display:flex}.inline-flex{display:inline-flex}.grid{display:grid}.hidden{display:none}.aspect-\[3\/2\]{aspect-ratio:3/2}.aspect-\[4\/3\]{aspect-ratio:4/3}.aspect-square{aspect-ratio:1/1}.aspect-video{aspect-ratio:16/9}.h-10{height:2.5rem}.h-12{height:3rem}.h-16{height:4rem}.h-3{height:.75rem}.h-4{height:1rem}.h-5{height:1.25rem}.h-auto{height:auto}.h-full{height:100%}.w-10{width:2.5rem}.w-12{width:3rem}.w-16{width:4rem}.w-3{width:.75rem}.w-4{width:1rem}.w-5{width:1.25rem}.w-full{width:100%}.min-w-max{min-width:-moz-max-content;min-width:max-content}.max-w-2xl{max-width:42rem}.max-w-3xl{max-width:48rem}.max-w-4xl{max-width:56rem}.shrink-0{flex-shrink:0}.cursor-not-allowed{cursor:not-allowed}.cursor-pointer{cursor:pointer}.resize-y{resize:vertical}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.flex-col{flex-direction:column}.flex-wrap{flex-wrap:wrap}.items-start{align-items:flex-start}.items-center{align-items:center}.justify-center{justify-content:center}.justify-between{justify-content:space-between}.gap-1{gap:.25rem}.gap-12{gap:3rem}.gap-2{gap:.5rem}.gap-3{gap:.75rem}.gap-4{gap:1rem}.gap-6{gap:1.5rem}.gap-8{gap:2rem}.space-y-1>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.25rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.25rem*var(--tw-space-y-reverse))}.space-y-2>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.5rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.5rem*var(--tw-space-y-reverse))}.space-y-3>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(.75rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(.75rem*var(--tw-space-y-reverse))}.space-y-4>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(1rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1rem*var(--tw-space-y-reverse))}.space-y-6>:not([hidden])~:not([hidden]){--tw-space-y-reverse:0;margin-top:calc(1.5rem*(1 - var(--tw-space-y-reverse)));margin-bottom:calc(1.5rem*var(--tw-space-y-reverse))}.overflow-hidden{overflow:hidden}.overflow-x-auto{overflow-x:auto}.overflow-y-auto{overflow-y:auto}.truncate{overflow:hidden;text-overflow:ellipsis}.truncate,.whitespace-nowrap{white-space:nowrap}.rounded{border-radius:.25rem}.rounded-full{border-radius:9999px}.rounded-md{border-radius:.375rem}.border{border-width:1px}.border-0{border-width:0}.border-2{border-width:2px}.border-b{border-bottom-width:1px}.border-t{border-top-width:1px}.border-gray-200{--tw-border-opacity:1;border-color:rgb(229 231 235/var(--tw-border-opacity,1))}.border-gray-300{--tw-border-opacity:1;border-color:rgb(209 213 219/var(--tw-border-opacity,1))}.border-gray-900{--tw-border-opacity:1;border-color:rgb(17 24 39/var(--tw-border-opacity,1))}.border-green-200{--tw-border-opacity:1;border-color:rgb(187 247 208/var(--tw-border-opacity,1))}.border-red-200{--tw-border-opacity:1;border-color:rgb(254 202 202/var(--tw-border-opacity,1))}.border-white{--tw-border-opacity:1;border-color:rgb(255 255 255/var(--tw-border-opacity,1))}.border-white\/10{border-color:hsla(0,0%,100%,.1)}.bg-amber-500{--tw-bg-opacity:1;background-color:rgb(245 158 11/var(--tw-bg-opacity,1))}.bg-blue-50{--tw-bg-opacity:1;background-color:rgb(239 246 255/var(--tw-bg-opacity,1))}.bg-blue-900{--tw-bg-opacity:1;background-color:rgb(30 58 138/var(--tw-bg-opacity,1))}.bg-emerald-50{--tw-bg-opacity:1;background-color:rgb(236 253 245/var(--tw-bg-opacity,1))}.bg-emerald-500{--tw-bg-opacity:1;background-color:rgb(16 185 129/var(--tw-bg-opacity,1))}.bg-gray-100{--tw-bg-opacity:1;background-color:rgb(243 244 246/var(--tw-bg-opacity,1))}.bg-gray-200{--tw-bg-opacity:1;background-color:rgb(229 231 235/var(--tw-bg-opacity,1))}.bg-gray-50{--tw-bg-opacity:1;background-color:rgb(249 250 251/var(--tw-bg-opacity,1))}.bg-green-50{--tw-bg-opacity:1;background-color:rgb(240 253 244/var(--tw-bg-opacity,1))}.bg-red-50{--tw-bg-opacity:1;background-color:rgb(254 242 242/var(--tw-bg-opacity,1))}.bg-white{--tw-bg-opacity:1;background-color:rgb(255 255 255/var(--tw-bg-opacity,1))}.bg-white\/10{background-color:hsla(0,0%,100%,.1)}.bg-white\/20{background-color:hsla(0,0%,100%,.2)}.bg-gradient-to-br{background-image:linear-gradient(to bottom right,var(--tw-gradient-stops))}.from-gray-100{--tw-gradient-from:#f3f4f6 var(--tw-gradient-from-position);--tw-gradient-to:rgba(243,244,246,0) var(--tw-gradient-to-position);--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to)}.to-gray-200{--tw-gradient-to:#e5e7eb var(--tw-gradient-to-position)}.bg-cover{background-size:cover}.bg-center{background-position:50%}.bg-no-repeat{background-repeat:no-repeat}.object-contain{-o-object-fit:contain;object-fit:contain}.object-cover{-o-object-fit:cover;object-fit:cover}.p-2{padding:.5rem}.p-3{padding:.75rem}.p-4{padding:1rem}.p-5{padding:1.25rem}.p-6{padding:1.5rem}.p-8{padding:2rem}.px-2{padding-left:.5rem;padding-right:.5rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-4{padding-left:1rem;padding-right:1rem}.px-5{padding-left:1.25rem;padding-right:1.25rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.px-8{padding-left:2rem;padding-right:2rem}.py-1{padding-top:.25rem;padding-bottom:.25rem}.py-12{padding-top:3rem;padding-bottom:3rem}.py-16{padding-top:4rem;padding-bottom:4rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-20{padding-top:5rem;padding-bottom:5rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}.py-4{padding-top:1rem;padding-bottom:1rem}.py-6{padding-top:1.5rem;padding-bottom:1.5rem}.pb-2{padding-bottom:.5rem}.pt-6{padding-top:1.5rem}.text-left{text-align:left}.text-center{text-align:center}.text-2xl{font-size:1.5rem;line-height:2rem}.text-3xl{font-size:1.875rem;line-height:2.25rem}.text-base{font-size:1rem;line-height:1.5rem}.text-lg{font-size:1.125rem;line-height:1.75rem}.text-sm{font-size:.875rem;line-height:1.25rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-xs{font-size:.75rem;line-height:1rem}.font-bold{font-weight:700}.font-medium{font-weight:500}.font-semibold{font-weight:600}.uppercase{text-transform:uppercase}.leading-relaxed{line-height:1.625}.leading-tight{line-height:1.25}.tracking-wider{letter-spacing:.05em}.text-blue-700{--tw-text-opacity:1;color:rgb(29 78 216/var(--tw-text-opacity,1))}.text-blue-900{--tw-text-opacity:1;color:rgb(30 58 138/var(--tw-text-opacity,1))}.text-emerald-700{--tw-text-opacity:1;color:rgb(4 120 87/var(--tw-text-opacity,1))}.text-gray-300{--tw-text-opacity:1;color:rgb(209 213 219/var(--tw-text-opacity,1))}.text-gray-400{--tw-text-opacity:1;color:rgb(156 163 175/var(--tw-text-opacity,1))}.text-gray-500{--tw-text-opacity:1;color:rgb(107 114 128/var(--tw-text-opacity,1))}.text-gray-600{--tw-text-opacity:1;color:rgb(75 85 99/var(--tw-text-opacity,1))}.text-gray-700{--tw-text-opacity:1;color:rgb(55 65 81/var(--tw-text-opacity,1))}.text-gray-900{--tw-text-opacity:1;color:rgb(17 24 39/var(--tw-text-opacity,1))}.text-green-800{--tw-text-opacity:1;color:rgb(22 101 52/var(--tw-text-opacity,1))}.text-red-500{--tw-text-opacity:1;color:rgb(239 68 68/var(--tw-text-opacity,1))}.text-red-700{--tw-text-opacity:1;color:rgb(185 28 28/var(--tw-text-opacity,1))}.text-white{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity,1))}.text-white\/50{color:hsla(0,0%,100%,.5)}.text-white\/60{color:hsla(0,0%,100%,.6)}.text-white\/70{color:hsla(0,0%,100%,.7)}.text-white\/80{color:hsla(0,0%,100%,.8)}.line-through{text-decoration-line:line-through}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.opacity-20{opacity:.2}.shadow-lg{--tw-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);--tw-shadow-colored:0 10px 15px -3px var(--tw-shadow-color),0 4px 6px -4px var(--tw-shadow-color)}.shadow-lg,.shadow-sm{box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.shadow-sm{--tw-shadow:0 1px 2px 0 rgba(0,0,0,.05);--tw-shadow-colored:0 1px 2px 0 var(--tw-shadow-color)}.outline-none{outline:2px solid transparent;outline-offset:2px}.transition-all{transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.hover\:-translate-y-1:hover{--tw-translate-y:-0.25rem}.hover\:-translate-y-1:hover,.hover\:scale-105:hover{transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.hover\:scale-105:hover{--tw-scale-x:1.05;--tw-scale-y:1.05}.hover\:gap-3:hover{gap:.75rem}.hover\:border-blue-200:hover{--tw-border-opacity:1;border-color:rgb(191 219 254/var(--tw-border-opacity,1))}.hover\:bg-gray-100:hover{--tw-bg-opacity:1;background-color:rgb(243 244 246/var(--tw-bg-opacity,1))}.hover\:bg-gray-200:hover{--tw-bg-opacity:1;background-color:rgb(229 231 235/var(--tw-bg-opacity,1))}.hover\:bg-gray-900:hover{--tw-bg-opacity:1;background-color:rgb(17 24 39/var(--tw-bg-opacity,1))}.hover\:bg-white:hover{--tw-bg-opacity:1;background-color:rgb(255 255 255/var(--tw-bg-opacity,1))}.hover\:bg-white\/10:hover{background-color:hsla(0,0%,100%,.1)}.hover\:text-white:hover{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity,1))}.hover\:underline:hover{text-decoration-line:underline}.hover\:shadow-lg:hover{--tw-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);--tw-shadow-colored:0 10px 15px -3px var(--tw-shadow-color),0 4px 6px -4px var(--tw-shadow-color)}.hover\:shadow-lg:hover,.hover\:shadow-md:hover{box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.hover\:shadow-md:hover{--tw-shadow:0 4px 6px -1px rgba(0,0,0,.1),0 2px 4px -2px rgba(0,0,0,.1);--tw-shadow-colored:0 4px 6px -1px var(--tw-shadow-color),0 2px 4px -2px var(--tw-shadow-color)}.hover\:brightness-110:hover{--tw-brightness:brightness(1.1);filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.focus\:not-sr-only:focus{position:static;width:auto;height:auto;padding:0;margin:0;overflow:visible;clip:auto;white-space:normal}.focus\:absolute:focus{position:absolute}.focus\:left-4:focus{left:1rem}.focus\:top-4:focus{top:1rem}.focus\:z-\[9999\]:focus{z-index:9999}.focus\:rounded:focus{border-radius:.25rem}.focus\:border-blue-500:focus{--tw-border-opacity:1;border-color:rgb(59 130 246/var(--tw-border-opacity,1))}.focus\:bg-white:focus{--tw-bg-opacity:1;background-color:rgb(255 255 255/var(--tw-bg-opacity,1))}.focus\:px-4:focus{padding-left:1rem;padding-right:1rem}.focus\:py-2:focus{padding-top:.5rem;padding-bottom:.5rem}.focus\:font-semibold:focus{font-weight:600}.focus\:text-blue-900:focus{--tw-text-opacity:1;color:rgb(30 58 138/var(--tw-text-opacity,1))}.focus\:shadow-lg:focus{--tw-shadow:0 10px 15px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);--tw-shadow-colored:0 10px 15px -3px var(--tw-shadow-color),0 4px 6px -4px var(--tw-shadow-color);box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.focus\:outline-none:focus{outline:2px solid transparent;outline-offset:2px}.focus\:ring-2:focus{--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000)}.focus\:ring-blue-200:focus{--tw-ring-opacity:1;--tw-ring-color:rgb(191 219 254/var(--tw-ring-opacity,1))}.group:hover .group-hover\:scale-105{--tw-scale-x:1.05;--tw-scale-y:1.05;transform:translate(var(--tw-translate-x),var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y))}.group:hover .group-hover\:border-blue-900{--tw-border-opacity:1;border-color:rgb(30 58 138/var(--tw-border-opacity,1))}.group:hover .group-hover\:bg-blue-900{--tw-bg-opacity:1;background-color:rgb(30 58 138/var(--tw-bg-opacity,1))}.group:hover .group-hover\:text-white{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity,1))}@media (min-width:640px){.sm\:block{display:block}.sm\:inline{display:inline}.sm\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.sm\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.sm\:flex-row{flex-direction:row}}@media (min-width:768px){.md\:col-span-2{grid-column:span 2/span 2}.md\:flex{display:flex}.md\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}.md\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.md\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.md\:flex-row{flex-direction:row}.md\:gap-8{gap:2rem}.md\:py-16{padding-top:4rem;padding-bottom:4rem}.md\:text-4xl{font-size:2.25rem;line-height:2.5rem}.md\:text-5xl{font-size:3rem;line-height:1}.md\:text-base{font-size:1rem;line-height:1.5rem}.md\:text-lg{font-size:1.125rem;line-height:1.75rem}.md\:text-xl{font-size:1.25rem;line-height:1.75rem}}@media (min-width:1024px){.lg\:col-span-2{grid-column:span 2/span 2}.lg\:block{display:block}.lg\:flex{display:flex}.lg\:hidden{display:none}.lg\:grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}.lg\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.lg\:flex-row{flex-direction:row}.lg\:items-center{align-items:center}.lg\:py-32{padding-top:8rem;padding-bottom:8rem}.lg\:text-4xl{font-size:2.25rem;line-height:2.5rem}.lg\:text-5xl{font-size:3rem;line-height:1}.lg\:text-6xl{font-size:3.75rem;line-height:1}}@media (min-width:1280px){.xl\:grid-cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}.xl\:grid-cols-6{grid-template-columns:repeat(6,minmax(0,1fr))}}
    .sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0; }
    .focus\:not-sr-only:focus { position:static;width:auto;height:auto;padding:0;margin:0;overflow:visible;clip:auto;white-space:normal; }
    body { font-family: '${fonts.body}', sans-serif; background: #f8fafc; color: #1e293b; }
    .font-heading { font-family: '${fonts.heading}', sans-serif; }
    .transition-corporate { transition: all 0.3s ease-in-out; }
    .container-corporate { max-width: 80rem; margin: 0 auto; padding-left: 1rem; padding-right: 1rem; }
    @media(min-width:640px){ .container-corporate { padding-left: 1.5rem; padding-right: 1.5rem; } }
    @media(min-width:1024px){ .container-corporate { padding-left: 2rem; padding-right: 2rem; } }
    :root {
      --color-primary: ${colors.primary};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
    }
  </style>
</head>
<body class="antialiased">
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-white focus:text-blue-900 focus:font-semibold focus:rounded focus:shadow-lg">Skip to main content</a>
<script>
function fmSubmitForm(form,siteId,formType,extraFn){
  var btn=form.querySelector('button[type="submit"]');
  var orig=btn?btn.innerHTML:'';
  if(btn){btn.disabled=true;btn.innerHTML='Submitting...';}
  var data={site_id:siteId,form_type:formType,
    name:(form.querySelector('input[type=text]')||{}).value||null,
    email:(form.querySelector('input[type=email]')||{}).value||null,
    phone:(form.querySelector('input[type=tel]')||{}).value||null,
    message:(form.querySelector('textarea')||{}).value||null,
    extra_data:extraFn?extraFn(form):null};
  fetch('/api/submit-form',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
  .then(function(r){return r.json();}).then(function(res){
    if(res.success){var suc=form.parentElement?form.parentElement.querySelector('[data-fm-success]'):null;if(suc){form.style.display='none';suc.style.display='block';}else{form.reset();if(btn){btn.innerHTML='\u2713 Submitted!';btn.style.background='#16a34a';}}}
    else{if(btn){btn.disabled=false;btn.innerHTML=orig;}alert('Something went wrong. Please try again.');}
  }).catch(function(){if(btn){btn.disabled=false;btn.innerHTML=orig;}alert('Something went wrong. Please try again.');});
}
// Override fmBuyNow after cart system loads to ensure cart drawer opens
window.addEventListener('load', function() {
  var _origBuyNow = window.fmBuyNow;
  window.fmBuyNow = function(product) {
    // Open the cart drawer first so the shipping step is visible
    var overlay = document.getElementById('fm-cart-overlay');
    var drawer = document.getElementById('fm-cart-drawer');
    if (overlay) overlay.classList.add('fm-open');
    if (drawer) drawer.classList.add('fm-open');
    document.body.style.overflow = 'hidden';
    if (_origBuyNow) _origBuyNow(product);
  };
});
</script>
<main id="main-content">${body}</main>`;
}

// ── Header ──
function ceHeader(siteId: string, currentPage: string, pages: any[], getContent: Function, weekdayHours: string, colors: any,
  baseUrl: string = ''
) {
  const businessName = getContent('businessInfo.businessName') || getContent('business.name') || 'Premier Equipment';
  const logoImage = getContent('businessInfo.logoImage');
  const phone = getContent('businessInfo.phone') || getContent('business.phone') || '';
  const initials = businessName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  // Read weekday hours directly from plain text config fields (fallback to parsed JSON hours)
  const mondayHours = getContent('hours.monday') || weekdayHours;

  const navLinks = pages
    .filter((p: any) => p.is_visible !== false)
    .map(p => {
      const isActive = p.slug === currentPage || (p.slug === 'index' && (currentPage === 'home' || currentPage === 'index'));
      return `<a href="${baseUrl}${p.slug}"
        class="px-4 py-2 text-sm font-medium rounded transition-corporate ${isActive
          ? 'bg-white/20 text-white'
          : 'text-white/80 hover:text-white hover:bg-white/10'}"
        ${isActive ? 'aria-current="page"' : ''}
      >${p.name || p.title}</a>`;
    }).join('\n');

  return `
  <header class="sticky top-0 z-50 shadow-lg" style="background-color: ${colors.primary};">
    <!-- Utility bar -->
    <div class="border-b border-white/10" style="background-color: ${colors.primary}; filter: brightness(0.9);">
      <div class="container-corporate py-2">
        <div class="flex justify-between items-center text-sm text-white/80">
          ${mondayHours ? `<span class="hidden sm:inline">Mon–Fri: ${mondayHours}</span>` : '<span></span>'}
          ${phone ? `<a href="tel:${phone}" class="flex items-center gap-2 hover:text-white transition-corporate">
            <svg class="w-4 h-4" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            ${phone}
          </a>` : ''}
        </div>
      </div>
    </div>

    <!-- Main nav -->
    <nav class="container-corporate" aria-label="Main navigation">
      <div class="flex items-center justify-between h-16">
        <a href="${baseUrl}index" class="flex items-center gap-3">
          ${logoImage
            ? `<img src="${logoImage}" alt="${businessName}" style="max-height:48px;max-width:160px;object-fit:contain;">`
            : `<div class="bg-white rounded p-2"><span class="font-heading font-bold text-lg" style="color: ${colors.primary};">${initials}</span></div>`
          }
          <span class="hidden sm:block font-heading font-bold text-white text-lg">${businessName}</span>
        </a>

        <div class="hidden lg:flex items-center gap-1">
          ${navLinks}
        </div>

        <div class="hidden lg:block">
          <a href="${baseUrl}contact"
            class="inline-flex items-center px-5 py-2 rounded text-sm font-semibold text-white transition-corporate hover:brightness-110"
            style="background-color: ${colors.secondary};">
            Get a Quote
          </a>
        </div>

        <!-- Mobile: simplified -->
        <div class="lg:hidden flex items-center gap-3">
          <a href="tel:${phone}" class="text-white/80 hover:text-white" aria-label="Call us at ${phone}">
            <svg class="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
          </a>
          <a href="${baseUrl}contact"
            class="inline-flex items-center px-4 py-1.5 rounded text-xs font-semibold text-white"
            style="background-color: ${colors.secondary};">Quote</a>
        </div>
      </div>

      <!-- Mobile nav row -->
      <div class="lg:hidden overflow-x-auto pb-2 -mx-4 px-4">
        <div class="flex items-center gap-1 min-w-max">
          ${pages.map(p => {
            const isActive = p.slug === currentPage || (p.slug === 'index' && (currentPage === 'home' || currentPage === 'index'));
            return `<a href="${baseUrl}${p.slug}"
              class="px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-corporate ${isActive
                ? 'bg-white/20 text-white'
                : 'text-white/70 hover:text-white hover:bg-white/10'}"
              ${isActive ? 'aria-current="page"' : ''}
            >${p.name || p.title}</a>`;
          }).join('\n')}
        </div>
      </div>
    </nav>
  </header>`;
}

// ── Footer ──
function ceFooter(siteId: string, pages: any[], getContent: Function, weekdayHours: string, saturdayHours: string, sundayHours: string, colors: any = {}, manufacturers: any[] = [],
  baseUrl: string = ''
) {
  const businessName = getContent('businessInfo.businessName') || getContent('business.name') || 'Premier Equipment';
  const logoImage = getContent('businessInfo.logoImage');
  const phone = getContent('businessInfo.phone') || getContent('business.phone') || '';
  const email = getContent('businessInfo.email') || getContent('business.email') || '';
  const address = getContent('businessInfo.address') || getContent('business.address') || '';
  const city = getContent('businessInfo.city');
  const state = getContent('businessInfo.state');
  const zip = getContent('businessInfo.zip');
  const tagline = getContent('footer.tagline') || getContent('businessInfo.tagline') || getContent('business.tagline') || '';
  const primary = colors.primary || '#1e3a8a';
  const initials = businessName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const socialLinks = ['facebook', 'linkedin', 'youtube'].map(platform => {
    const url = getContent(`social.${platform}`);
    if (!url) return '';
    const icons: Record<string,string> = {
      facebook: '<path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>',
      linkedin: '<path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>',
      youtube: '<path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/><polygon points="9.75,15.02 15.5,11.75 9.75,8.48"/>',
    };
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${platform.charAt(0).toUpperCase() + platform.slice(1)}" class="text-white/50 hover:text-white transition-corporate">
      <svg class="w-5 h-5" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${icons[platform]}</svg>
    </a>`;
  }).filter(Boolean).join('');

  const quickLinks = pages
    .filter((p: any) => p.is_visible !== false)
    .map((p: any) => `<li><a href="${baseUrl}${p.slug}" class="text-white/70 hover:text-white transition-corporate">${p.name || p.title}</a></li>`)
    .join('\n');

  const brandList = manufacturers.length > 0
    ? manufacturers.slice(0, 6).map((m: any) => `<li>${m.name}</li>`).join('')
    : '<li>John Deere</li><li>Exmark</li><li>Stihl</li><li>Husqvarna</li><li>Kubota</li><li>Scag</li>';

  const fullAddress = [address, city, state, zip].filter(Boolean).join(', ');

  return `
  <footer style="background-color: ${primary};" class="text-white" aria-label="Site footer">
    <div class="container-corporate py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div>
          <div class="flex items-center gap-3 mb-6">
            ${logoImage
              ? `<img src="${logoImage}" alt="${businessName}" style="max-height:48px;max-width:160px;object-fit:contain;">`
              : `<div class="bg-white rounded p-2"><span class="font-heading font-bold text-lg" style="color:${primary};">${initials}</span></div>`
            }
            <span class="font-heading font-bold text-xl">${businessName}</span>
          </div>
          <p class="text-white/70 mb-6 leading-relaxed">${tagline}</p>
          <div class="flex gap-4">${socialLinks}</div>
        </div>
        <div>
          <h3 class="font-heading font-semibold text-lg mb-6">Quick Links</h3>
          <ul class="space-y-3">${quickLinks}</ul>
        </div>
        <div>
          <h3 class="font-heading font-semibold text-lg mb-6">Brands We Carry</h3>
          <ul class="space-y-3 text-white/70">${brandList}</ul>
        </div>
        <div>
          <h3 class="font-heading font-semibold text-lg mb-6">Contact Us</h3>
          <ul class="space-y-4 text-white/70">
            ${phone ? `<li class="flex items-start gap-3"><svg class="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg><a href="tel:${phone}" class="hover:text-white">${phone}</a></li>` : ''}
            ${email ? `<li class="flex items-start gap-3"><svg class="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg><a href="mailto:${email}" class="hover:text-white">${email}</a></li>` : ''}
            ${fullAddress ? `<li class="flex items-start gap-3"><svg class="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg><span>${fullAddress}</span></li>` : ''}
          </ul>
          <div class="mt-6 pt-6 border-t border-white/10">
            <h4 class="font-semibold mb-2">Business Hours</h4>
            <div class="text-white/70 text-sm space-y-1">
              ${['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => {
                const h = getContent('hours.' + day);
                if (!h) return '';
                return `<p>${day.charAt(0).toUpperCase() + day.slice(1)}: ${h}</p>`;
              }).filter(Boolean).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="border-t border-white/10">
      <div class="container-corporate py-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
          <p>&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
          <div class="flex gap-6">
            <a href="${baseUrl}contact" class="hover:text-white transition-corporate">Privacy Policy</a>
            <a href="${baseUrl}contact" class="hover:text-white transition-corporate">Terms of Service</a>
          </div>
        </div>
      </div>
    </div>
  </footer>`;
}


function ceHomeSections(siteId: string, getContent: Function, products: any[], enabledFeatures: Set<string>, vis: Record<string, boolean>, colors: any, manufacturers: any[] = [],
  baseUrl: string = ''
) {
  let html = '';

  // ── Hero ──
  if (vis.hero !== false) {
    const heroImg = getContent('hero.image') || getContent('hero.backgroundImage') || '/images/hero-mower.jpg';
    html += `
    <section data-section="hero" class="relative overflow-hidden flex items-center" style="min-height: 550px;">
      <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('${heroImg}');"></div>
      <div class="absolute inset-0" style="background: linear-gradient(to right, ${colors.primary}f2, ${colors.primary}d9, ${colors.primary}b3);"></div>
      <div class="relative container-corporate py-20 lg:py-32">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            ${getContent('hero.heading') || getContent('hero.headline') || getContent('hero.title') || 'Professional Equipment You Can Trust'}
          </h1>
          <p class="text-base md:text-xl text-white/80 mb-10 leading-relaxed">
            ${getContent('hero.subheading') || getContent('hero.subheadline') || getContent('hero.subtitle') || ''}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="${baseUrl}${getContent('hero.button1.destination') || getContent('hero.ctaPrimaryLink') || 'inventory'}"
              class="inline-flex items-center justify-center px-8 py-3.5 rounded font-semibold text-lg text-white transition-corporate hover:brightness-110"
              style="background-color: ${colors.secondary};">
              ${getContent('hero.button1.text') || getContent('hero.ctaPrimary') || getContent('hero.primaryCta') || 'Browse Inventory'}
            </a>
            <a href="${baseUrl}${getContent('hero.button2.destination') || getContent('hero.ctaSecondaryLink') || 'contact'}"
              class="inline-flex items-center justify-center px-8 py-3.5 rounded font-semibold text-lg text-white border-2 border-white hover:bg-white transition-corporate"
              style="hover:color: ${colors.primary};">
              ${getContent('hero.button2.text') || getContent('hero.ctaSecondary') || getContent('hero.secondaryCta') || 'Schedule Consultation'}
            </a>
          </div>
        </div>
      </div>
      <!-- Bottom wave -->
      <div class="absolute bottom-0 left-0 right-0" style="margin-bottom: -2px;">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto" preserveAspectRatio="none" style="display: block;">
          <path d="M0 60L1440 60L1440 30C1440 30 1320 0 720 0C120 0 0 30 0 30L0 60Z" fill="#f3f4f6"/>
        </svg>
      </div>
    </section>`;
  }

  // ── Trust Badges (Why Choose Us) ──
  if (vis.trustBadges !== false) {
    const b1t = getContent('trustBadges.badge1Title'), b1i = getContent('trustBadges.badge1Icon'), b1d = getContent('trustBadges.badge1Text');
    const b2t = getContent('trustBadges.badge2Title'), b2i = getContent('trustBadges.badge2Icon'), b2d = getContent('trustBadges.badge2Text');
    const b3t = getContent('trustBadges.badge3Title'), b3i = getContent('trustBadges.badge3Icon'), b3d = getContent('trustBadges.badge3Text');
    const b4t = getContent('trustBadges.badge4Title'), b4i = getContent('trustBadges.badge4Icon'), b4d = getContent('trustBadges.badge4Text');
    const badges = [
      b1t ? { icon: b1i || '✓', title: b1t, description: b1d } : null,
      b2t ? { icon: b2i || '🔧', title: b2t, description: b2d } : null,
      b3t ? { icon: b3i || '📦', title: b3t, description: b3d } : null,
      b4t ? { icon: b4i || '💳', title: b4t, description: b4d } : null,
    ].filter(Boolean);
    if (badges.length > 0) {
      html += `
      <section data-section="trustBadges" class="py-16 bg-gray-100">
        <div class="container-corporate">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            ${badges.map((b: any) => `
            <div class="bg-white p-6 rounded shadow-sm border border-gray-200 text-center transition-corporate hover:shadow-md hover:-translate-y-1">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style="background-color: ${colors.primary}15;">
                <span class="text-2xl">${b.icon}</span>
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
    const s1v = getContent('stats.stat1Number'), s1l = getContent('stats.stat1Label');
    const s2v = getContent('stats.stat2Number'), s2l = getContent('stats.stat2Label');
    const s3v = getContent('stats.stat3Number'), s3l = getContent('stats.stat3Label');
    const s4v = getContent('stats.stat4Number'), s4l = getContent('stats.stat4Label');
    const stats = [
      s1v ? { value: s1v, label: s1l } : null,
      s2v ? { value: s2v, label: s2l } : null,
      s3v ? { value: s3v, label: s3l } : null,
      s4v ? { value: s4v, label: s4l } : null,
    ].filter(Boolean);
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
            <h2 class="font-heading text-3xl lg:text-4xl font-bold text-gray-900 mb-2">${getContent('featured.heading') || 'Featured Equipment'}</h2>
            <p class="text-gray-500">${getContent('featured.subheading') || 'Explore our selection of premium lawn care equipment'}</p>
          </div>
          <a href="${baseUrl}inventory" class="inline-flex items-center gap-2 font-semibold hover:gap-3 transition-all" style="color: ${colors.primary};">
            View All Inventory
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
          </a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          ${featured.map((p: any) => {
            const imgUrl = p.image_url || p.primary_image || ''; const hasImage = imgUrl && !imgUrl.includes('placeholder');
            const displayPrice = p.sale_price || p.price;
            const onclick = productCardOnclick(p);
            return `
          <div class="group overflow-hidden border border-gray-200 rounded shadow-sm transition-corporate hover:shadow-lg bg-white cursor-pointer" onclick="${onclick}">
            <div class="aspect-square relative overflow-hidden bg-gray-100">
              ${hasImage
                ? `<img src="${imgUrl}" alt="${p.name || p.title}" loading="lazy" class="w-full h-full object-cover transition-corporate group-hover:scale-105"/>`
                : `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                  </div>`}
              <span class="absolute top-3 left-3 px-2.5 py-1 rounded text-xs font-semibold text-white" style="background-color: ${colors.primary};">${p.brand || p.category || 'Equipment'}</span>
              ${p.condition === 'used' ? `<span class="absolute top-3 right-3 px-2 py-1 rounded text-xs font-semibold bg-amber-500 text-white">Used${p.hours ? ` · ${p.hours}hrs` : ''}</span>` : ''}
            </div>
            <div class="p-5">
              <p class="text-sm text-gray-500 mb-1">${p.category || ''}</p>
              <h3 class="font-heading font-semibold text-gray-900 mb-2 truncate">${p.name || p.title}</h3>
              <p class="text-gray-500 text-sm mb-4 line-clamp-2">${p.description || ''}</p>
              <div class="flex items-center justify-between">
                <div>
                  ${p.sale_price ? `<span class="text-gray-400 line-through text-sm mr-2">$${Number(p.price).toLocaleString()}</span>` : ''}
                  <span class="font-heading font-bold text-lg" style="color: ${colors.primary};">${displayPrice ? `$${Number(displayPrice).toLocaleString()}` : 'Call for Price'}</span>
                </div>
                <span class="text-sm font-semibold hover:underline" style="color: ${colors.primary};">View Details →</span>
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
    const mfgList = manufacturers.length > 0 ? manufacturers : [
      { name: 'John Deere', logo_url: '' }, { name: 'Exmark', logo_url: '' },
      { name: 'Stihl', logo_url: '' }, { name: 'Husqvarna', logo_url: '' },
      { name: 'Kubota', logo_url: '' }, { name: 'Toro', logo_url: '' },
    ];
    html += `
    <section data-section="manufacturers" class="py-20 bg-gray-100">
      <div class="container-corporate">
        <div class="text-center mb-12">
          <h2 class="font-heading text-3xl lg:text-4xl font-bold text-gray-900 mb-4">${getContent('manufacturers.heading') || 'Authorized Dealer'}</h2>
          <p class="text-gray-500 max-w-2xl mx-auto">${getContent('manufacturers.subheading') || "We're proud to be an authorized dealer for the industry's leading brands"}</p>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          ${mfgList.slice(0, 6).map((m: any) => `
          <a href="${baseUrl}manufacturers" class="group bg-white p-6 rounded border border-gray-200 transition-corporate hover:shadow-md hover:border-blue-200 text-center">
            ${(m.logo_url || m.logoUrl || m.logo || m.image_url) ? `<img src="${m.logo_url || m.logoUrl || m.logo || m.image_url}" alt="${m.name}" style="max-height: 48px; width: auto; margin: 0 auto 0.75rem auto; display: block;">` : `<div style="height:48px;display:flex;align-items:center;justify-content:center;margin-bottom:0.75rem;"><span class="font-bold text-gray-700 text-sm">${m.name}</span></div>`}
            <p class="font-semibold text-gray-900 text-sm">${m.name}</p>
            <div class="flex items-center justify-center gap-1 mt-1">
              <svg class="w-3 h-3" style="color: ${colors.accent};" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              <span class="text-xs" style="color: ${colors.accent};">Authorized</span>
            </div>
          </a>`).join('')}
        </div>
        <div class="text-center mt-10">
          <a href="${baseUrl}manufacturers" class="inline-flex items-center gap-2 font-semibold hover:gap-3 transition-all" style="color: ${colors.primary};">
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
    // Fall back to demo items if none saved yet
    if (testimonials.length === 0) {
      try { testimonials = JSON.parse(getContent('testimonials.items') || '[]'); } catch {}
    }
    if (testimonials.length === 0) {
      testimonials = [
        { quote: "Premier Equipment has been our go-to dealer for over 15 years. Their service department is second to none.", name: 'Michael Thompson', title: 'Operations Manager', company: 'GreenScape Landscaping' },
        { quote: "When we expanded our fleet, the team at Premier helped us choose the right equipment for our needs.", name: 'Sarah Martinez', title: 'Owner', company: 'Martinez Lawn Care' },
        { quote: "The financing options and trade-in program made upgrading our equipment painless.", name: 'David Chen', title: 'Fleet Manager', company: 'ProCut Commercial Services' },
      ];
    }
    if (testimonials.length > 0) {
      html += `
      <section data-section="testimonials" class="py-20 bg-white">
        <div class="container-corporate">
          <div class="text-center mb-12">
            <h2 class="font-heading text-3xl lg:text-4xl font-bold text-gray-900 mb-4">${getContent('testimonials.heading') || 'What Our Customers Say'}</h2>
            <p class="text-gray-500 max-w-2xl mx-auto">${getContent('testimonials.subheading') || "Don't just take our word for it — hear from the professionals who trust us"}</p>
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
          <h2 class="font-heading text-3xl lg:text-4xl font-bold text-white mb-4">${getContent('cta.heading') || getContent('cta.headline') || 'Ready to Upgrade Your Equipment?'}</h2>
          <p class="text-white/80 text-lg mb-8 leading-relaxed">${getContent('cta.description') || getContent('cta.subheadline') || getContent('cta.subheading') || ''}</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="${baseUrl}${getContent('cta.button1.destination') || getContent('cta.ctaLink') || 'contact'}"
              class="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded font-semibold text-lg text-white transition-corporate hover:brightness-110"
              style="background-color: ${colors.secondary};">
              ${getContent('cta.button1.text') || getContent('cta.button') || 'Schedule Consultation'}
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </a>
            ${(getContent('cta.button2.text') || getContent('cta.secondaryButton')) ? `
            <a href="${baseUrl}${getContent('cta.button2.destination') || 'inventory'}"
              class="inline-flex items-center justify-center px-8 py-3.5 rounded font-semibold text-lg text-white border-2 border-white hover:bg-white transition-corporate">
              ${getContent('cta.button2.text') || getContent('cta.secondaryButton')}
            </a>` : `
            <a href="${baseUrl}inventory"
              class="inline-flex items-center justify-center px-8 py-3.5 rounded font-semibold text-lg text-white border-2 border-white hover:bg-white transition-corporate">
              Browse Equipment
            </a>`}
          </div>
        </div>
      </div>
    </section>`;
  }

  return html;
}

// ── Service Page ──
function ceServicePage(siteId: string, getContent: Function,
  baseUrl: string = '',
  enabledFeatures: Set<string> = new Set(),
  supabase?: any,
  primaryColor: string = '#1e3a8a'
) {
  let services: any[] = [];
  // Build from config fields first, then fall back to JSON items
  const ces1t = getContent('servicePage.service1Title'); const ces1d = getContent('servicePage.service1Text') || getContent('servicePage.service1Description');
  const ces2t = getContent('servicePage.service2Title'); const ces2d = getContent('servicePage.service2Text') || getContent('servicePage.service2Description');
  const ces3t = getContent('servicePage.service3Title'); const ces3d = getContent('servicePage.service3Text') || getContent('servicePage.service3Description');
  if (ces1t || ces2t || ces3t) {
    services = [
      ces1t ? { icon: '🔧', title: ces1t, description: ces1d, image: getContent('servicePage.service1Image') } : null,
      ces2t ? { icon: '⏱', title: ces2t, description: ces2d, image: getContent('servicePage.service2Image') } : null,
      ces3t ? { icon: '🛡', title: ces3t, description: ces3d, image: getContent('servicePage.service3Image') } : null,
    ].filter(Boolean);
  } else {
    try { services = JSON.parse(getContent('services.items') || '[]'); } catch {}
  }

  const inputCls = 'w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none';
  const hasScheduling = enabledFeatures.has('service_scheduling') || enabledFeatures.has('service');

  return `
  ${cePageHeader(getContent('servicePage.heading') || getContent('services.heading') || 'Service Department', getContent('servicePage.subheading') || getContent('services.description') || '', primaryColor, getContent('servicePage.heroImage'))}

  <section class="py-16 bg-white">
    <div class="container-corporate">
      <div class="text-center mb-12">
        <h2 class="font-heading text-3xl font-bold text-gray-900 mb-4">${getContent('servicePage.gridHeading') || 'Our Services'}</h2>
        <p class="text-gray-500 max-w-2xl mx-auto">${getContent('servicePage.gridSubheading') || 'From routine maintenance to complex repairs, our certified technicians keep your equipment running at peak performance.'}</p>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        ${services.map((s: any) => `
        <div class="border border-gray-200 rounded transition-corporate hover:shadow-lg bg-white overflow-hidden">
          ${s.image ? `<div class="aspect-video overflow-hidden"><img src="${s.image}" alt="${s.title}" loading="lazy" class="w-full h-full object-cover"></div>` : ''}
          <div class="p-6 text-center">
            <div class="w-12 h-12 bg-blue-50 rounded flex items-center justify-center mb-4 mx-auto">
              <span class="text-xl">${s.icon || '🔧'}</span>
            </div>
            <h3 class="font-heading font-semibold text-xl text-gray-900 mb-3">${s.title}</h3>
            <p class="text-gray-500 mb-4 text-sm leading-relaxed">${s.description}</p>
            ${s.features ? `<ul class="space-y-2 text-left">${s.features.map((f: string) => `<li class="flex items-center gap-2 text-sm"><div class="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>${f}</li>`).join('')}</ul>` : ''}
          </div>
        </div>`).join('')}
      </div>
    </div>
  </section>

  <section data-section="serviceCta" class="py-16 bg-gray-100">
    <div class="container-corporate max-w-3xl">
      <div class="text-center mb-10">
        <h2 class="font-heading text-3xl font-bold text-gray-900 mb-4">${getContent('servicePage.formHeading') || getContent('servicePage.ctaHeading') || 'Schedule a Service Consultation'}</h2>
        <p class="text-gray-500">${getContent('servicePage.formSubheading') || 'Fill out the form below and our service team will contact you within one business day.'}</p>
      </div>
      <div class="border border-gray-200 rounded bg-white p-8">
        ${hasScheduling ? cePremiumServiceForm(siteId, inputCls) : ceBasicServiceForm(siteId, inputCls)}
      </div>
    </div>
  </section>`;
}

// ── Premium Service Scheduler (loads service types from API) ──
function cePremiumServiceForm(siteId: string, inputCls: string): string {
  return `
  <!-- Step 1: Select Service -->
  <div id="ce-sf-step1">
    <p class="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">1. Select a Service</p>
    <div id="ce-sf-service-list" class="flex flex-col gap-2">
      <div class="text-center py-6 text-gray-400 text-sm">Loading services...</div>
    </div>
  </div>

  <!-- Step 2: Date & Time -->
  <div id="ce-sf-step2" style="display:none;" class="mt-6 pt-6 border-t border-gray-200">
    <p class="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">2. Choose Date & Time</p>
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
        <input type="date" id="ce-sf-date" aria-label="Preferred service date" class="${inputCls}" min="${new Date().toISOString().split('T')[0]}">
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Available Times</label>
        <div id="ce-sf-slots" class="flex flex-wrap gap-2 mt-1">
          <span class="text-sm text-gray-400">Select a date first</span>
        </div>
        <input type="hidden" id="ce-sf-time" value="">
      </div>
    </div>
  </div>

  <!-- Step 3: Your Info -->
  <div id="ce-sf-step3" style="display:none;" class="mt-6 pt-6 border-t border-gray-200">
    <p class="text-xs font-bold text-blue-900 uppercase tracking-wider mb-3">3. Your Information</p>
    <div class="space-y-4">
      <div class="grid md:grid-cols-2 gap-4">
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" id="ce-sf-name" aria-label="Your full name" class="${inputCls}" placeholder="John Smith" required></div>
        <div><label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input type="tel" id="ce-sf-phone" aria-label="Your phone number" class="${inputCls}" placeholder="(555) 123-4567" required></div>
      </div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" id="ce-sf-email" aria-label="Your email address" class="${inputCls}" placeholder="john@company.com" required></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Equipment Make / Model</label><input type="text" id="ce-sf-equip" aria-label="Equipment make and model" class="${inputCls}" placeholder='e.g. Toro TimeCutter 54"'></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label><textarea id="ce-sf-notes" aria-label="Additional notes" rows="3" class="${inputCls} resize-y" placeholder="Describe the issue or any additional details..."></textarea></div>
      <div id="ce-sf-error" style="display:none;" class="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm"></div>
      <div id="ce-sf-success" style="display:none;" class="p-4 bg-green-50 border border-green-200 rounded text-green-800 text-center font-medium">
        ✓ Service request submitted! We'll confirm your appointment within one business day.
      </div>
      <button id="ce-sf-submit" onclick="ceSfSubmit()" class="w-full py-3 rounded font-semibold text-white bg-blue-900 transition-corporate hover:brightness-110">Schedule Service</button>
    </div>
  </div>

  <script>
  (function() {
    var SITE_ID = '${siteId}';
    var selectedService = null;
    var selectedTime = null;
    var selectedDate = null;

    // Load service types
    fetch('/api/service/types/' + SITE_ID)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var list = document.getElementById('ce-sf-service-list');
        if (!list) return;
        var types = data.types || data.serviceTypes || data || [];
        if (!Array.isArray(types) || !types.length) {
          list.innerHTML = '<p class="text-sm text-gray-500 py-4 text-center">No services configured yet. Please contact us directly.</p>';
          return;
        }
        list.innerHTML = '';
        types.forEach(function(st) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.style.cssText = 'display:flex;justify-content:space-between;align-items:center;width:100%;padding:0.875rem 1rem;border:2px solid #e5e7eb;border-radius:0.5rem;background:#fff;cursor:pointer;text-align:left;transition:border-color 0.15s,background 0.15s;';
          btn.setAttribute('data-id', st.id);
          var dur = st.duration_minutes ? st.duration_minutes + ' min' : '';
          var price = st.price_estimate || st.price || '';
          btn.innerHTML = '<div><strong style="color:#111827;font-size:0.9375rem;">' + st.name + '</strong>'
            + (st.description ? '<br><span style="font-size:0.8125rem;color:#6b7280;">' + st.description + '</span>' : '')
            + '</div>'
            + '<div style="text-align:right;white-space:nowrap;flex-shrink:0;margin-left:1rem;">'
            + (price ? '<span style="font-weight:600;color:#111827;font-size:0.875rem;">' + price + '</span><br>' : '')
            + (dur ? '<span style="font-size:0.75rem;color:#6b7280;">' + dur + '</span>' : '')
            + '</div>';
          btn.addEventListener('click', function() {
            document.querySelectorAll('#ce-sf-service-list button').forEach(function(b) {
              b.style.borderColor = '#e5e7eb';
              b.style.background = '#fff';
            });
            btn.style.borderColor = '#1e3a8a';
            btn.style.background = '#eff6ff';
            selectedService = st;
            document.getElementById('ce-sf-step2').style.display = '';
            // Reset slots
            selectedTime = null;
            document.getElementById('ce-sf-time').value = '';
            document.getElementById('ce-sf-slots').innerHTML = '<span style="font-size:0.875rem;color:#9ca3af;">Select a date</span>';
            document.getElementById('ce-sf-date').value = '';
            document.getElementById('ce-sf-step3').style.display = 'none';
          });
          list.appendChild(btn);
        });
      })
      .catch(function() {
        var list = document.getElementById('ce-sf-service-list');
        if (list) list.innerHTML = '<p class="text-sm text-red-500 py-4 text-center">Unable to load services. Please call us directly.</p>';
      });

    // Date change → load slots
    var dateInput = document.getElementById('ce-sf-date');
    if (dateInput) {
      dateInput.addEventListener('change', function() {
        selectedDate = this.value;
        selectedTime = null;
        document.getElementById('ce-sf-time').value = '';
        if (!selectedDate || !selectedService) return;
        var slotsDiv = document.getElementById('ce-sf-slots');
        slotsDiv.innerHTML = '<span style="font-size:0.875rem;color:#9ca3af;">Loading...</span>';

        fetch('/api/service/slots/' + SITE_ID + '?date=' + selectedDate + '&typeId=' + selectedService.id)
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.blocked || data.closed) {
              slotsDiv.innerHTML = '<span style="font-size:0.875rem;color:#dc2626;">' + (data.message || 'Not available on this date') + '</span>';
              return;
            }
            var available = (data.slots || []).filter(function(s) { return s.available; });
            if (!available.length) {
              slotsDiv.innerHTML = '<span style="font-size:0.875rem;color:#dc2626;">No available times on this date</span>';
              return;
            }
            slotsDiv.innerHTML = '';
            available.forEach(function(slot) {
              var b = document.createElement('button');
              b.type = 'button';
              b.textContent = slot.display;
              b.style.cssText = 'padding:0.375rem 0.875rem;border:2px solid #e5e7eb;border-radius:0.375rem;background:#fff;cursor:pointer;font-size:0.8125rem;font-weight:500;transition:all 0.15s;';
              b.addEventListener('click', function() {
                slotsDiv.querySelectorAll('button').forEach(function(x) { x.style.borderColor='#e5e7eb';x.style.background='#fff';x.style.color='#111827'; });
                b.style.borderColor='#16a34a'; b.style.background='#f0fdf4'; b.style.color='#15803d';
                selectedTime = slot.time;
                document.getElementById('ce-sf-time').value = slot.time;
                document.getElementById('ce-sf-step3').style.display = '';
              });
              slotsDiv.appendChild(b);
            });
          })
          .catch(function() {
            slotsDiv.innerHTML = '<span style="font-size:0.875rem;color:#dc2626;">Error loading times. Please try again.</span>';
          });
      });
    }

    window.ceSfSubmit = function() {
      var name = (document.getElementById('ce-sf-name') || {}).value || '';
      var email = (document.getElementById('ce-sf-email') || {}).value || '';
      var phone = (document.getElementById('ce-sf-phone') || {}).value || '';
      var equip = (document.getElementById('ce-sf-equip') || {}).value || '';
      var notes = (document.getElementById('ce-sf-notes') || {}).value || '';
      var errEl = document.getElementById('ce-sf-error');
      var btn = document.getElementById('ce-sf-submit');

      if (!name || !email || !phone) { errEl.textContent='Please fill in your name, email, and phone.'; errEl.style.display=''; return; }
      if (!selectedService) { errEl.textContent='Please select a service.'; errEl.style.display=''; return; }
      if (!selectedDate || !selectedTime) { errEl.textContent='Please select a date and time.'; errEl.style.display=''; return; }
      errEl.style.display='none';
      if (btn) { btn.textContent='Submitting...'; btn.disabled=true; }

      fetch('/api/service/book/' + SITE_ID, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          customerName: name, customerEmail: email, customerPhone: phone,
          serviceTypeId: selectedService.id,
          equipmentType: equip || null,
          preferredDate: selectedDate, preferredTime: selectedTime,
          customDescription: notes || null,
        })
      })
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d.success) {
          document.getElementById('ce-sf-step1').style.display='none';
          document.getElementById('ce-sf-step2').style.display='none';
          document.getElementById('ce-sf-step3').querySelector('button').style.display='none';
          document.getElementById('ce-sf-success').style.display='';
        } else {
          errEl.textContent = d.error || 'Something went wrong. Please try again.';
          errEl.style.display='';
          if (btn) { btn.textContent='Schedule Service'; btn.disabled=false; }
        }
      })
      .catch(function() {
        errEl.textContent='Connection error. Please try again.';
        errEl.style.display='';
        if (btn) { btn.textContent='Schedule Service'; btn.disabled=false; }
      });
    };
  })();
  </script>`;
}

// ── Basic Service Form (no scheduling addon) ──
function ceBasicServiceForm(siteId: string, inputCls: string): string {
  return `
  <form class="space-y-6" onsubmit="event.preventDefault(); fmSubmitForm(this, '${siteId}', 'service', function(f){return null;});">
    <div class="grid md:grid-cols-2 gap-6">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label><input type="text" class="${inputCls}" placeholder="John" required></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label><input type="text" class="${inputCls}" placeholder="Smith" required></div>
    </div>
    <div class="grid md:grid-cols-2 gap-6">
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" class="${inputCls}" placeholder="john@company.com" required></div>
      <div><label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input type="tel" class="${inputCls}" placeholder="(555) 123-4567" required></div>
    </div>
    <div><label class="block text-sm font-medium text-gray-700 mb-1">Message *</label><textarea rows="4" class="${inputCls} resize-y" placeholder="Describe what you need..." required></textarea></div>
    <div data-fm-success style="display:none;" class="p-4 bg-green-50 border border-green-200 rounded text-green-800 text-center font-medium">✓ Message sent! We'll be in touch soon.</div>
    <button type="submit" class="w-full py-3 rounded font-semibold text-white bg-blue-900 transition-corporate hover:brightness-110">Send Request</button>
  </form>`;
}

// ── Contact Page ──
function ceContactPage(siteId: string, getContent: Function, weekdayHours: string, saturdayHours: string, sundayHours: string,
  baseUrl: string = '',
  primaryColor: string = '#1e3a8a'
) {
  const phone = getContent('business.phone') || '';
  const email = getContent('business.email') || '';
  const address = getContent('business.address') || '';

  return `
  ${cePageHeader(getContent('contactPage.heading') || getContent('contact.heading') || 'Contact Us', getContent('contactPage.subheading') || getContent('contact.description') || '', primaryColor, getContent('contactPage.heroImage'))}

  <section class="py-16 bg-white">
    <div class="container-corporate">
      <div class="grid lg:grid-cols-3 gap-12">
        <!-- Form -->
        <div class="lg:col-span-2">
          <div class="border border-gray-200 rounded bg-white p-8">
            <h2 class="font-heading text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            <form class="space-y-6" onsubmit="event.preventDefault(); fmSubmitForm(this, '${siteId}', 'contact', null);">
              <div class="grid md:grid-cols-2 gap-6">
                <div><label for="ce-cf-first" class="block text-sm font-medium text-gray-700 mb-1">First Name *</label><input id="ce-cf-first" type="text" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" placeholder="John" required aria-required="true"></div>
                <div><label for="ce-cf-last" class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label><input id="ce-cf-last" type="text" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" placeholder="Smith" required aria-required="true"></div>
              </div>
              <div><label for="ce-cf-company" class="block text-sm font-medium text-gray-700 mb-1">Company Name</label><input id="ce-cf-company" type="text" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" placeholder="Your Company LLC"></div>
              <div class="grid md:grid-cols-2 gap-6">
                <div><label for="ce-cf-email" class="block text-sm font-medium text-gray-700 mb-1">Email *</label><input id="ce-cf-email" type="email" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" placeholder="john@company.com" required aria-required="true"></div>
                <div><label for="ce-cf-phone" class="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input id="ce-cf-phone" type="tel" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" placeholder="(555) 123-4567" required aria-required="true"></div>
              </div>
              <div><label for="ce-cf-subject" class="block text-sm font-medium text-gray-700 mb-1">Subject *</label><input id="ce-cf-subject" type="text" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" placeholder="How can we help you?" required aria-required="true"></div>
              <div><label for="ce-cf-message" class="block text-sm font-medium text-gray-700 mb-1">Message *</label><textarea id="ce-cf-message" rows="6" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none resize-y" placeholder="Please provide details about your inquiry..." required aria-required="true"></textarea></div>
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
function ceInventoryPage(siteId: string, getContent: Function, products: any[],
  baseUrl: string = '',
  primaryColor: string = '#1e3a8a'
) {
  const categories = ['All', ...new Set(products.map((p: any) => p.category).filter(Boolean))];

  return `
  ${cePageHeader(getContent('inventoryPage.heading') || getContent('inventory.heading') || 'Equipment Inventory', getContent('inventoryPage.subheading') || getContent('inventory.description') || '', primaryColor, getContent('inventoryPage.heroImage'))}

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
        <div class="ce-product group overflow-hidden border border-gray-200 rounded shadow-sm transition-corporate hover:shadow-lg bg-white cursor-pointer" data-category="${p.category || ''}" onclick="${productCardOnclick(p)}">
          <div class="aspect-square relative overflow-hidden bg-gray-100">
            ${hasImage
              ? `<img src="${imgUrl}" alt="${p.name || p.title}" loading="lazy" class="w-full h-full object-cover transition-corporate group-hover:scale-105"/>`
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
                <span class="font-heading font-bold text-lg text-blue-900">${displayPrice ? '$' + Number(displayPrice).toLocaleString() : 'Call for Price'}</span>
              </div>
              <span class="text-sm font-semibold text-blue-900">View Details →</span>
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
async function ceRentalsPage(
  siteId: string,
  getContent: Function,
  baseUrl: string = '',
  supabase?: any,
  hasRentalFeature: boolean = false,
  primaryColor: string = '#1e3a8a'
): Promise<string> {
  const heading = getContent('rentalsPage.heading') || getContent('rentals.heading') || 'Equipment Rentals';
  const subheading = getContent('rentalsPage.subheading') || getContent('rentals.description') || 'Professional equipment for daily, weekly, or monthly rental.';
  const today = new Date().toISOString().split('T')[0];

  let inventoryHtml = '';
  if (supabase && hasRentalFeature) {
    const { data: rentals } = await supabase
      .from('rental_inventory')
      .select('*')
      .eq('site_id', siteId)
      .eq('status', 'available')
      .order('display_order');

    if (rentals && rentals.length > 0) {
      inventoryHtml = `
      <section class="py-16 bg-white">
        <div class="container-corporate">
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.5rem;">
            ${rentals.map((item: any) => `
            <div style="border:1px solid #e5e7eb;border-radius:0.5rem;overflow:hidden;background:white;">
              <div style="aspect-ratio:4/3;overflow:hidden;position:relative;background:#f3f4f6;">
                ${item.primary_image ? `<img src="${item.primary_image}" alt="${item.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;">🚜</div>`}
                ${!item.quantity_available || item.quantity_available === 0 ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;"><span style="background:#dc2626;color:white;padding:0.375rem 1rem;font-weight:700;font-size:0.875rem;">Currently Rented</span></div>` : `<span style="position:absolute;top:0.75rem;right:0.75rem;background:#16a34a;color:white;font-size:0.75rem;font-weight:700;padding:0.25rem 0.5rem;border-radius:0.25rem;">${item.quantity_available} Available</span>`}
              </div>
              <div style="padding:1.25rem;">
                <span style="display:inline-block;background:#f3f4f6;color:#374151;font-size:0.75rem;font-weight:600;text-transform:uppercase;padding:0.2rem 0.6rem;border-radius:0.25rem;margin-bottom:0.5rem;">${item.category || 'Rental'}</span>
                <h3 style="font-size:1.0625rem;font-weight:700;color:#111827;margin:0 0 0.25rem;">${item.title}</h3>
                ${item.description ? `<p style="font-size:0.875rem;color:#6b7280;margin:0 0 0.75rem;line-height:1.5;">${item.description.substring(0,100)}</p>` : ''}
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;margin-bottom:0.75rem;text-align:center;">
                  ${item.daily_rate ? `<div style="background:#f9fafb;padding:0.5rem;border-radius:0.25rem;"><p style="font-weight:700;color:#1e3a6e;margin:0;font-size:0.9375rem;">$${item.daily_rate}</p><p style="font-size:0.7rem;color:#6b7280;margin:0;">Daily</p></div>` : ''}
                  ${item.weekly_rate ? `<div style="background:#f9fafb;padding:0.5rem;border-radius:0.25rem;"><p style="font-weight:700;color:#1e3a6e;margin:0;font-size:0.9375rem;">$${item.weekly_rate}</p><p style="font-size:0.7rem;color:#6b7280;margin:0;">Weekly</p></div>` : ''}
                  ${item.monthly_rate ? `<div style="background:#f9fafb;padding:0.5rem;border-radius:0.25rem;"><p style="font-weight:700;color:#1e3a6e;margin:0;font-size:0.9375rem;">$${item.monthly_rate}</p><p style="font-size:0.7rem;color:#6b7280;margin:0;">Monthly</p></div>` : ''}
                </div>
                ${item.quantity_available > 0
                  ? rentalReserveButton(item, 'fm', 'block w-full text-center cta-button rounded-md text-sm py-2 cursor-pointer border-0')
                  : `<button disabled class="inline-flex w-full items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-400 rounded cursor-not-allowed">Currently Unavailable</button>`
                }
              </div>
            </div>`).join('')}
          </div>
        </div>
      </section>`;
    }
  }

  const staticFallback = !inventoryHtml ? `
  <section class="py-16 bg-white">
    <div class="container-corporate text-center" style="max-width:600px;">
      <div style="width:5rem;height:5rem;margin:0 auto 1.5rem;background:#f3f4f6;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2rem;">🚜</div>
      <h2 class="font-heading text-2xl font-bold text-gray-900 mb-4">Rental Equipment Available</h2>
      <p class="text-gray-600 mb-8">Contact us for current inventory, pricing, and availability.</p>
      <a href="${baseUrl}contact" class="inline-flex items-center px-6 py-3 border border-gray-900 text-sm font-medium text-gray-900 hover:bg-gray-900 hover:text-white transition-corporate rounded">Contact Us for Rentals</a>
    </div>
  </section>` : '';

  return `
  ${cePageHeader(heading, subheading, primaryColor, getContent('rentalsPage.heroImage'))}
  ${inventoryHtml || staticFallback}
  <!-- Rental Terms -->
  <section class="py-16 bg-gray-100">
    <div class="container-corporate">
      <h2 class="font-heading text-3xl font-bold text-gray-900 mb-8 text-center">${getContent('rentalsPage.termsHeading') || 'Rental Terms & Conditions'}</h2>
      <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div class="border border-gray-200 rounded bg-white p-6">
          <h3 class="font-heading font-semibold text-lg text-gray-900 mb-4">${getContent('rentalsPage.includedHeading') || "What's Included"}</h3>
          <ul class="space-y-2 text-gray-600 text-sm">
            <li>• ${getContent('rentalsPage.included1') || 'Equipment orientation and training'}</li>
            <li>• ${getContent('rentalsPage.included2') || 'Regular maintenance during rental period'}</li>
            <li>• ${getContent('rentalsPage.included3') || 'Breakdown support and replacement'}</li>
          </ul>
        </div>
        <div class="border border-gray-200 rounded bg-white p-6">
          <h3 class="font-heading font-semibold text-lg text-gray-900 mb-4">${getContent('rentalsPage.requirementsHeading') || 'Requirements'}</h3>
          <ul class="space-y-2 text-gray-600 text-sm">
            <li>• ${getContent('rentalsPage.requirement1') || 'Valid government-issued ID'}</li>
            <li>• ${getContent('rentalsPage.requirement2') || 'Security deposit required'}</li>
            <li>• ${getContent('rentalsPage.requirement3') || 'Signed rental agreement'}</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
  ${inventoryHtml ? `` : ''}
  `;
}
// ── Manufacturers Page ──
function ceManufacturersPage(siteId: string, getContent: Function,
  baseUrl: string = '',
  manufacturers: any[] = [],
  primaryColor: string = '#1e3a8a'
) {
  const fallbackLogos: Record<string,string> = { 'Toro': '/images/logos/toro.png', 'John Deere': '/images/logos/john-deere.png', 'Exmark': '/images/logos/exmark.png', 'Stihl': '/images/logos/Stihl.png', 'Husqvarna': '/images/logos/Husqvarna.png', 'Kubota': '/images/logos/kubota.jpg', 'Scag': '/images/logos/Scag.png', 'Echo': '/images/logos/Echo.png' };
  const fallbackDescriptions: Record<string,string> = {
    'John Deere': 'World-leading manufacturer of agricultural and turf equipment.',
    'Exmark': 'Premium commercial mowing equipment for landscape professionals.',
    'Stihl': 'The #1 selling brand of gasoline-powered handheld outdoor power equipment.',
    'Husqvarna': 'Innovative outdoor power products for forest, park, and garden care.',
    'Kubota': 'Compact tractors and utility vehicles built for performance.',
    'Scag': 'Simply the best commercial mowers in the industry.',
    'Toro': 'Trusted by golf courses, sports fields, and landscape contractors.',
    'Echo': 'Professional-grade outdoor power equipment since 1972.',
  };
  const mfgList = manufacturers.length > 0 ? manufacturers : Object.keys(fallbackDescriptions).map(name => ({ name, logo_url: fallbackLogos[name] || '', description: fallbackDescriptions[name] }));

  return `
  ${cePageHeader(getContent('manufacturersPage.heading') || getContent('manufacturers.heading') || 'Our Manufacturers', getContent('manufacturersPage.subheading') || getContent('manufacturers.description') || '', primaryColor, getContent('manufacturersPage.heroImage'))}

  <section class="py-16 bg-white">
    <div class="container-corporate">
      <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        ${mfgList.map((m: any) => {
          const logoSrc = m.logo_url || m.logoUrl || m.logo || m.image_url || fallbackLogos[m.name] || '';
          const description = m.description || fallbackDescriptions[m.name] || '';
          return `
        <div class="border border-gray-200 rounded transition-corporate hover:shadow-lg hover:border-blue-200 group bg-white p-6">
          <div class="aspect-[3/2] flex items-center justify-center bg-gray-50 rounded mb-4 p-4">
            ${logoSrc
              ? `<img src="${logoSrc}" alt="${m.name}" loading="lazy" style="max-height: 60px; max-width: 80%; object-fit: contain;">`
              : `<span class="font-bold text-gray-400 text-lg">${m.name}</span>`
            }
          </div>
          <div class="flex items-center gap-2 mb-3">
            <h3 class="font-heading font-semibold text-lg text-gray-900">${m.name}</h3>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              Authorized
            </span>
          </div>
          <p class="text-gray-500 text-sm mb-4 line-clamp-2">${description}</p>
          <a href="${baseUrl}contact" class="inline-flex items-center gap-2 w-full justify-center px-4 py-2 rounded border border-gray-300 text-sm font-medium text-gray-700 group-hover:bg-blue-900 group-hover:text-white group-hover:border-blue-900 transition-corporate">
            Learn More →
          </a>
        </div>`}).join('')}
      </div>
    </div>
  </section>

  <!-- Why Authorized -->
  <section class="py-16 bg-gray-100">
    <div class="container-corporate text-center max-w-4xl mx-auto">
      <h2 class="font-heading text-3xl font-bold text-gray-900 mb-6">${getContent('manufacturersPage.whyHeading') || 'Why Buy From an Authorized Dealer?'}</h2>
      <p class="text-gray-500 text-lg mb-10 leading-relaxed">${getContent('manufacturersPage.whySubheading') || 'When you purchase from an authorized dealer, you get factory-backed warranties, genuine parts, and service from certified technicians.'}</p>
      <div class="grid sm:grid-cols-3 gap-6">
        <div class="bg-white border border-gray-200 rounded p-6">
          <div class="text-3xl mb-3">🛡️</div>
          <h3 class="font-heading font-semibold text-gray-900 mb-2">${getContent('manufacturersPage.benefit1Title') || 'Full Warranty'}</h3>
          <p class="text-gray-500 text-sm">${getContent('manufacturersPage.benefit1Text') || 'Factory warranty coverage on all new equipment'}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded p-6">
          <div class="text-3xl mb-3">⚙️</div>
          <h3 class="font-heading font-semibold text-gray-900 mb-2">${getContent('manufacturersPage.benefit2Title') || 'Genuine Parts'}</h3>
          <p class="text-gray-500 text-sm">${getContent('manufacturersPage.benefit2Text') || 'OEM parts that meet manufacturer specifications'}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded p-6">
          <div class="text-3xl mb-3">🏆</div>
          <h3 class="font-heading font-semibold text-gray-900 mb-2">${getContent('manufacturersPage.benefit3Title') || 'Certified Service'}</h3>
          <p class="text-gray-500 text-sm">${getContent('manufacturersPage.benefit3Text') || 'Factory-trained technicians you can trust'}</p>
        </div>
      </div>
    </div>
  </section>`;
}

// ── Shared Helpers ──
function cePageHeader(title: string, description: string, primaryColor: string = '#1e3a8a', heroImage: string = '') {
  return `
  <section class="py-12 md:py-16 relative overflow-hidden" style="background-color: ${primaryColor};">
    ${heroImage ? `<div class="absolute inset-0 bg-cover bg-center" style="background-image:url('${heroImage}');opacity:0.2;"></div>` : ''}
    <div class="relative container-corporate">
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
        <form class="space-y-6" onsubmit="event.preventDefault(); fmSubmitForm(this, '${siteId}', 'service', function(f){var s=f.querySelector('select');return s?{equipment_type:s.value}:null;}); ">
          <div class="grid md:grid-cols-2 gap-6">
            <div><label for="ce-svc-first" class="block text-sm font-medium text-gray-700 mb-1">First Name *</label><input id="ce-svc-first" type="text" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" required aria-required="true"></div>
            <div><label for="ce-svc-last" class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label><input id="ce-svc-last" type="text" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" required aria-required="true"></div>
          </div>
          <div class="grid md:grid-cols-2 gap-6">
            <div><label for="ce-svc-email" class="block text-sm font-medium text-gray-700 mb-1">Email *</label><input id="ce-svc-email" type="email" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" required aria-required="true"></div>
            <div><label for="ce-svc-phone" class="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input id="ce-svc-phone" type="tel" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none" required aria-required="true"></div>
          </div>
          <div><label for="ce-svc-message" class="block text-sm font-medium text-gray-700 mb-1">Message *</label><textarea id="ce-svc-message" rows="4" class="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none resize-y" required aria-required="true"></textarea></div>
          <button type="submit" class="w-full py-3 rounded font-semibold text-white bg-blue-900 transition-corporate hover:brightness-110">Submit Request</button>
        </form>
      </div>
    </div>
  </section>`;
}
