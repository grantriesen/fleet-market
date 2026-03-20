// ============================================
// templates/shared.ts
// Shared utilities for all Fleet Market templates
// ============================================

/**
 * Shared <script> block for analytics tracking and
 * customizer iframe communication (postMessage).
 * Every template's HTML shell includes this before </body>.
 */
export function sharedPreviewScript(siteId: string, page: string): string {
  return `
  <script>
    // ── Page View Tracking ──
    (function() {
      try {
        var siteId = '${siteId}';
        var page = '${page}';
        var sessionId = sessionStorage.getItem('sf_sid');
        if (!sessionId) {
          sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
          sessionStorage.setItem('sf_sid', sessionId);
        }
        var isInCustomizer = false;
        try { isInCustomizer = window.self !== window.top && document.referrer.includes('/customize'); } catch(e) {}
        if (!isInCustomizer) {
          fetch('/api/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteId: siteId, page: page, referrer: document.referrer, sessionId: sessionId }),
            keepalive: true
          }).catch(function() {});
        }
      } catch(e) {}
    })();

    console.log('🎨 [Preview] REALTIME UPDATES VERSION LOADED - Debug mode active');
    
    const sections = document.querySelectorAll('section[data-section]');
    let currentSection = '';

    function detectSection() {
      const scrollPos = window.scrollY + window.innerHeight / 3;
      sections.forEach((section) => {
        const sectionId = section.getAttribute('data-section');
        if (section.offsetTop <= scrollPos && section.offsetTop + section.offsetHeight > scrollPos) {
          if (currentSection !== sectionId) {
            currentSection = sectionId;
          }
        }
      });
    }

    function reloadPreview() {
      clearTimeout(window.reloadTimer);
      window.reloadTimer = setTimeout(() => {
        window.location.reload();
      }, 300);
    }
    
    window.addEventListener('message', (event) => {
      if (event.data.type === 'scrollToSection') {
        const sectionId = event.data.section;
        
        // Handle scroll to top
        if (sectionId === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        
        // Map subsection config keys to template data-section IDs
        const subsectionMap = {
          '_heroHeading': null, // resolved dynamically below
          '_servicesHeading': 'serviceTypes',
          '_ctaHeading': 'serviceCta',
          '_whyChooseHeading': 'whyChoose',
          '_formHeading': 'contactForm',
          '_filtersHeading': 'inventoryGrid',
          '_rentalInfoHeading': 'rentalInfo',
          '_contentHeading': 'manufacturersList',
        };
        
        let mappedId = subsectionMap[sectionId] !== undefined ? subsectionMap[sectionId] : sectionId;
        
        // For hero headings, find the first section on the page (it's the hero)
        if (sectionId === '_heroHeading' || mappedId === null) {
          const firstSection = document.querySelector('section[data-section]');
          if (firstSection) {
            firstSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            return;
          }
        }
        
        // Also handle home page section keys directly
        if (!mappedId) mappedId = sectionId;
        
        const section = document.querySelector(\`[data-section="\${mappedId}"]\`);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Fallback: scroll to top if section not found (e.g. clicking hero)
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
      
      if (event.data.type === 'updateContent' || event.data.type === 'updateColor' || event.data.type === 'updateFont') {
        reloadPreview();
      }
    });
  </script>
  `;
}

/**
 * Reusable page hero for sub-pages (not home).
 * Dark primary background with optional background image overlay.
 */
export function pageHero(
  heading: string,
  subheading: string,
  backgroundImage?: string,
  dataSectionId?: string
): string {
  return `
  <section data-section="${dataSectionId || 'pageHero'}" class="relative overflow-hidden bg-primary">
    ${backgroundImage ? `
      <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image: url('${backgroundImage}');"></div>
      <div class="absolute inset-0 bg-primary" style="opacity: 0.75;"></div>
    ` : ''}
    <div class="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <h1 class="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight">
        ${heading}
      </h1>
      <p class="text-lg text-white/80 mt-2">
        ${subheading}
      </p>
    </div>
  </section>
  `;
}

/**
 * Optional content section below page hero.
 * Heading + body text on muted background.
 */
export function contentSection(contentHeading: string, contentText: string): string {
  if (!contentHeading && !contentText) return '';
  return `
  <section class="py-12 bg-muted">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
      ${contentHeading ? `<h2 class="section-heading mb-4">${contentHeading}</h2>` : ''}
      ${contentText ? `<div class="text-lg text-foreground leading-relaxed">${contentText}</div>` : ''}
    </div>
  </section>
  `;
}

// ============================================
// SHARED FORM GENERATORS
// Used by all templates to render the correct
// service form based on the dealer's addon status.
// ============================================

/**
 * Basic contact/service request form.
 * Shown on the service page when the dealer does NOT have
 * the Service Scheduling add-on.
 * Collects: name, email, phone, message.
 * Submits as form_type='contact'.
 */
export function basicServiceFormHtml(
  siteId: string,
  inputClass: string,
  buttonClass: string,
  labelClass: string = 'block text-sm font-medium text-gray-700 mb-1'
): string {
  return `
    <form class="space-y-6" onsubmit="event.preventDefault(); fmSubmitForm(this, '${siteId}', 'contact', null);">
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="${labelClass}">First Name *</label>
          <input type="text" class="${inputClass}" placeholder="John" required>
        </div>
        <div>
          <label class="${labelClass}">Last Name *</label>
          <input type="text" class="${inputClass}" placeholder="Smith" required>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="${labelClass}">Email *</label>
          <input type="email" class="${inputClass}" placeholder="john@company.com" required>
        </div>
        <div>
          <label class="${labelClass}">Phone *</label>
          <input type="tel" class="${inputClass}" placeholder="(555) 123-4567" required>
        </div>
      </div>
      <div>
        <label class="${labelClass}">Message *</label>
        <textarea rows="4" class="${inputClass} resize-y" placeholder="How can we help you?" required></textarea>
      </div>
      <div data-fm-success style="display:none;" class="p-4 bg-green-50 border border-green-200 rounded text-green-800 text-center font-medium">
        ✓ Message sent! We'll be in touch soon.
      </div>
      <button type="submit" class="${buttonClass}">Send Message</button>
    </form>`;
}

/**
 * Full service scheduling form.
 * Shown on the service page when the dealer HAS the
 * Service Scheduling add-on.
 * Collects: name, email, phone, equipment type, service type,
 * preferred date, and additional notes.
 * Submits as form_type='service' with extra_data.
 */
export function fullServiceFormHtml(
  siteId: string,
  inputClass: string,
  buttonClass: string,
  selectClass: string = '',
  labelClass: string = 'block text-sm font-medium text-gray-700 mb-1'
): string {
  const sc = selectClass || inputClass;
  return `
    <form class="space-y-6" onsubmit="event.preventDefault(); fmSubmitForm(this, '${siteId}', 'service', function(f){
      return {
        equipment_type: (f.querySelector('[name=equipment_type]') || {}).value || null,
        service_type:   (f.querySelector('[name=service_type]') || {}).value || null,
        preferred_date: (f.querySelector('[name=preferred_date]') || {}).value || null,
      };
    });">
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="${labelClass}">First Name *</label>
          <input type="text" class="${inputClass}" placeholder="John" required>
        </div>
        <div>
          <label class="${labelClass}">Last Name *</label>
          <input type="text" class="${inputClass}" placeholder="Smith" required>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="${labelClass}">Email *</label>
          <input type="email" class="${inputClass}" placeholder="john@company.com" required>
        </div>
        <div>
          <label class="${labelClass}">Phone *</label>
          <input type="tel" class="${inputClass}" placeholder="(555) 123-4567" required>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="${labelClass}">Equipment Type *</label>
          <select name="equipment_type" class="${sc}" required>
            <option value="">Select equipment type...</option>
            <option>Zero-Turn Mower</option>
            <option>Walk-Behind Mower</option>
            <option>Stand-On Mower</option>
            <option>Riding Tractor</option>
            <option>String Trimmer</option>
            <option>Chainsaw</option>
            <option>Blower / Vacuum</option>
            <option>Compact Utility Tractor</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label class="${labelClass}">Service Type *</label>
          <select name="service_type" class="${sc}" required>
            <option value="">Select service type...</option>
            <option>Annual Tune-Up / Maintenance</option>
            <option>Repair / Diagnosis</option>
            <option>Blade Sharpening</option>
            <option>Oil Change</option>
            <option>Belt / Filter Replacement</option>
            <option>Warranty Work</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <div>
        <label class="${labelClass}">Preferred Service Date</label>
        <input type="date" name="preferred_date" class="${inputClass}" min="${new Date().toISOString().split('T')[0]}">
      </div>
      <div>
        <label class="${labelClass}">Equipment Make / Model</label>
        <input type="text" class="${inputClass}" placeholder="e.g. Toro TimeCutter 54&quot;">
      </div>
      <div>
        <label class="${labelClass}">Additional Notes</label>
        <textarea rows="4" class="${inputClass} resize-y" placeholder="Describe the issue or any additional details..."></textarea>
      </div>
      <div data-fm-success style="display:none;" class="p-4 bg-green-50 border border-green-200 rounded text-green-800 text-center font-medium">
        ✓ Service request submitted! We'll confirm your appointment within one business day.
      </div>
      <button type="submit" class="${buttonClass}">Schedule Service</button>
    </form>`;
}

/**
 * Convenience wrapper — returns the correct form based on
 * whether the dealer has the 'service' add-on enabled.
 *
 * Usage in any template:
 *   serviceFormHtml(siteId, enabledFeatures, inputCls, btnCls, selectCls, labelCls)
 */
export function serviceFormHtml(
  siteId: string,
  enabledFeatures: Set<string>,
  inputClass: string,
  buttonClass: string,
  selectClass: string = '',
  labelClass: string = 'block text-sm font-medium text-gray-700 mb-1'
): string {
  return enabledFeatures.has('service_scheduling') || enabledFeatures.has('service')
    ? fullServiceFormHtml(siteId, inputClass, buttonClass, selectClass, labelClass)
    : basicServiceFormHtml(siteId, inputClass, buttonClass, labelClass);
}
