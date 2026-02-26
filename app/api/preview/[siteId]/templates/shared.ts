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
