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
    <form class="space-y-6" id="fm-service-form-${siteId}" onsubmit="event.preventDefault(); (function(f){
      var firstName = (f.querySelector('[name=first_name]') || {}).value || '';
      var lastName  = (f.querySelector('[name=last_name]') || {}).value || '';
      fmSubmitForm(f, '${siteId}', 'service', function(form){
        return {
          equipment_type: (form.querySelector('[name=equipment_type]') || {}).value || null,
          service_type:   (form.querySelector('[name=service_type]') || {}).value || null,
          preferred_date: (form.querySelector('[name=preferred_date]') || {}).value || null,
          preferred_time: (form.querySelector('[name=preferred_time]') || {}).value || null,
          equipment_make: (form.querySelector('[name=equipment_make]') || {}).value || null,
          full_name:      (firstName + ' ' + lastName).trim() || null,
          notes:          (form.querySelector('[name=notes]') || {}).value || null,
        };
      });
    })(this);">

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="${labelClass}">First Name *</label>
          <input type="text" name="first_name" class="${inputClass}" placeholder="John" required>
        </div>
        <div>
          <label class="${labelClass}">Last Name *</label>
          <input type="text" name="last_name" class="${inputClass}" placeholder="Smith" required>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="${labelClass}">Email *</label>
          <input type="email" name="email" class="${inputClass}" placeholder="john@company.com" required>
        </div>
        <div>
          <label class="${labelClass}">Phone *</label>
          <input type="tel" name="phone" class="${inputClass}" placeholder="(555) 123-4567" required>
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

      <!-- Date picker + live slot availability -->
      <div>
        <label class="${labelClass}">Preferred Service Date</label>
        <input type="date" name="preferred_date" id="fm-date-${siteId}" class="${inputClass}" min="${new Date().toISOString().split('T')[0]}">
      </div>

      <!-- Hidden time field — populated when a slot is selected -->
      <input type="hidden" name="preferred_time" id="fm-time-${siteId}" value="">

      <!-- Slot grid — shown after date is picked -->
      <div id="fm-slots-wrap-${siteId}" style="display:none;">
        <label class="${labelClass}">Available Times</label>
        <div id="fm-slots-${siteId}" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;"></div>
        <p id="fm-slots-msg-${siteId}" style="font-size:0.8125rem;color:#6b7280;margin-top:6px;display:none;"></p>
      </div>

      <div>
        <label class="${labelClass}">Equipment Make / Model</label>
        <input type="text" name="equipment_make" class="${inputClass}" placeholder="e.g. Toro TimeCutter 54&quot;">
      </div>
      <div>
        <label class="${labelClass}">Additional Notes</label>
        <textarea name="notes" rows="4" class="${inputClass} resize-y" placeholder="Describe the issue or any additional details..."></textarea>
      </div>
      <div data-fm-success style="display:none;" class="p-4 bg-green-50 border border-green-200 rounded text-green-800 text-center font-medium">
        ✓ Service request submitted! We'll confirm your appointment within one business day.
      </div>
      <button type="submit" class="${buttonClass}">Schedule Service</button>
    </form>

    <script>
    (function() {
      var dateInput  = document.getElementById('fm-date-${siteId}');
      var slotsWrap  = document.getElementById('fm-slots-wrap-${siteId}');
      var slotsGrid  = document.getElementById('fm-slots-${siteId}');
      var slotsMsg   = document.getElementById('fm-slots-msg-${siteId}');
      var timeHidden = document.getElementById('fm-time-${siteId}');
      if (!dateInput) return;

      dateInput.addEventListener('change', function() {
        var date = dateInput.value;
        if (!date) { slotsWrap.style.display = 'none'; return; }

        // Show loading state
        slotsWrap.style.display = '';
        slotsGrid.innerHTML = '<span style="font-size:0.875rem;color:#9ca3af;">Checking availability...</span>';
        slotsMsg.style.display = 'none';
        timeHidden.value = '';

        fetch('/api/service/slots/${siteId}?date=' + date)
          .then(function(r) { return r.json(); })
          .then(function(data) {
            slotsGrid.innerHTML = '';

            if (data.blocked || data.closed) {
              slotsGrid.innerHTML = '';
              slotsMsg.textContent = data.message || 'Not available on this date.';
              slotsMsg.style.display = '';
              return;
            }

            if (!data.slots || data.slots.length === 0) {
              slotsMsg.textContent = 'No available slots on this date.';
              slotsMsg.style.display = '';
              return;
            }

            data.slots.forEach(function(slot) {
              var btn = document.createElement('button');
              btn.type = 'button';
              btn.textContent = slot.display;
              btn.style.cssText = [
                'padding:6px 14px',
                'border-radius:6px',
                'font-size:0.8125rem',
                'font-weight:500',
                'border:2px solid',
                slot.available
                  ? 'border-color:#d1d5db;background:#fff;color:#111827;cursor:pointer;'
                  : 'border-color:#e5e7eb;background:#f9fafb;color:#9ca3af;cursor:not-allowed;',
              ].join(';');

              if (slot.available) {
                btn.addEventListener('click', function() {
                  // Deselect all
                  slotsGrid.querySelectorAll('button').forEach(function(b) {
                    b.style.borderColor = '#d1d5db';
                    b.style.background = '#fff';
                    b.style.color = '#111827';
                  });
                  // Select this one
                  btn.style.borderColor = '#16a34a';
                  btn.style.background = '#f0fdf4';
                  btn.style.color = '#15803d';
                  timeHidden.value = slot.time;
                });
              }

              slotsGrid.appendChild(btn);
            });
          })
          .catch(function() {
            slotsGrid.innerHTML = '';
            slotsMsg.textContent = 'Unable to load availability. You can still submit without a time.';
            slotsMsg.style.display = '';
          });
      });
    })();
    </script>`;
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

// ============================================
// PRODUCT MODAL + CART SYSTEM
// Injected into every dealer site via injectCartSystem()
// ============================================

/**
 * Returns the full cart + product modal JS/HTML to inject before </body>.
 * checkout_mode: 'online' | 'quote_only'
 * accentColor: template primary color for buttons
 */
export function injectCartSystem(
  siteId: string,
  checkoutMode: 'online' | 'quote_only',
  accentColor: string = '#16a34a'
): string {
  return `
<!-- ── Fleet Market Cart System ── -->
<style>
  .fm-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;display:none;align-items:center;justify-content:center;padding:1rem;}
  .fm-modal-overlay.fm-open{display:flex;}
  .fm-modal{background:#fff;border-radius:12px;max-width:680px;width:100%;max-height:90vh;overflow-y:auto;position:relative;box-shadow:0 20px 60px rgba(0,0,0,0.3);}
  .fm-modal-close{position:absolute;top:12px;right:12px;background:none;border:none;font-size:1.5rem;cursor:pointer;color:#6b7280;z-index:1;}
  .fm-cart-btn{position:fixed;bottom:24px;right:24px;z-index:9997;background:${accentColor};color:#fff;border:none;border-radius:50px;padding:12px 20px;font-size:0.9375rem;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 4px 16px rgba(0,0,0,0.2);transition:transform 0.2s;}
  .fm-cart-btn:hover{transform:translateY(-2px);}
  .fm-cart-badge{background:#ef4444;color:#fff;border-radius:50%;width:20px;height:20px;font-size:0.6875rem;font-weight:700;display:flex;align-items:center;justify-content:center;}
  .fm-cart-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:none;}
  .fm-cart-overlay.fm-open{display:block;}
  .fm-cart-drawer{position:fixed;right:0;top:0;bottom:0;width:100%;max-width:420px;background:#fff;z-index:10000;transform:translateX(100%);transition:transform 0.3s;display:flex;flex-direction:column;}
  .fm-cart-drawer.fm-open{transform:translateX(0);}
</style>

<!-- Product Modal -->
<div class="fm-modal-overlay" id="fm-product-modal">
  <div class="fm-modal">
    <button class="fm-modal-close" onclick="fmCloseModal()">✕</button>
    <div id="fm-modal-content" style="padding:2rem;"></div>
  </div>
</div>

<!-- Cart Overlay + Drawer -->
<div class="fm-cart-overlay" id="fm-cart-overlay" onclick="fmCloseCart()"></div>
<div class="fm-cart-drawer" id="fm-cart-drawer">
  <div style="padding:1.25rem 1.5rem;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;">
    <h2 style="font-size:1.125rem;font-weight:700;margin:0;">Your Cart</h2>
    <button onclick="fmCloseCart()" style="background:none;border:none;font-size:1.25rem;cursor:pointer;color:#6b7280;">✕</button>
  </div>
  <div id="fm-cart-items" style="flex:1;overflow-y:auto;padding:1rem 1.5rem;"></div>
  <div id="fm-cart-footer" style="padding:1.25rem 1.5rem;border-top:1px solid #e5e7eb;"></div>
</div>

<!-- Floating Cart Button -->
<button class="fm-cart-btn" id="fm-cart-trigger" onclick="fmOpenCart()" style="display:none;">
  🛒 Cart <span class="fm-cart-badge" id="fm-cart-count">0</span>
</button>

<script>
(function() {
  var SITE_ID = '${siteId}';
  var CHECKOUT_MODE = '${checkoutMode}';
  var ACCENT = '${accentColor}';

  // ── Session ID ──
  var SESSION_ID = sessionStorage.getItem('fm_cart_sid');
  if (!SESSION_ID) {
    SESSION_ID = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('fm_cart_sid', SESSION_ID);
  }

  // ── Cart state ──
  var cartItems = [];

  // ── Init: load cart from server ──
  fetch('/api/inventory/cart/' + SITE_ID + '?session=' + SESSION_ID)
    .then(function(r) { return r.json(); })
    .then(function(d) { cartItems = d.items || []; renderCartBtn(); })
    .catch(function() {});

  // ── Open/close product modal ──
  window.fmOpenProduct = function(product) {
    var el = document.getElementById('fm-modal-content');
    var inCart = cartItems.find(function(i) { return i.id === product.id; });
    var price = product.sale_price || product.price;
    var priceHtml = price
      ? (product.sale_price
          ? '<span style="text-decoration:line-through;color:#9ca3af;margin-right:8px;">$' + Number(product.price).toLocaleString() + '</span><span style="color:#dc2626;font-weight:700;font-size:1.5rem;">$' + Number(product.sale_price).toLocaleString() + '</span>'
          : '<span style="font-weight:700;font-size:1.5rem;">$' + Number(price).toLocaleString() + '</span>')
      : '<span style="font-weight:600;color:#6b7280;">Call for Price</span>';

    var actionHtml = '';
    if (CHECKOUT_MODE === 'online' && price) {
      actionHtml = inCart
        ? '<button onclick="fmOpenCart();fmCloseModal();" style="width:100%;padding:14px;background:' + ACCENT + ';color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;margin-bottom:10px;">View Cart (' + inCart.quantity + ' in cart)</button>'
        : '<button onclick="fmAddToCart(' + JSON.stringify(product).replace(/"/g, '&quot;') + ')" style="width:100%;padding:14px;background:' + ACCENT + ';color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;margin-bottom:10px;">Add to Cart</button>'
          + '<button onclick="fmBuyNow(' + JSON.stringify(product).replace(/"/g, '&quot;') + ')" style="width:100%;padding:14px;background:#fff;color:' + ACCENT + ';border:2px solid ' + ACCENT + ';border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;">Buy Now</button>';
    } else {
      actionHtml = '<div style="background:#f9fafb;border-radius:8px;padding:1.25rem;margin-top:1rem;">'
        + '<p style="font-weight:600;margin:0 0 12px;font-size:0.9375rem;">Request a Quote</p>'
        + '<form onsubmit="fmSubmitQuote(event, ' + JSON.stringify(product).replace(/"/g, '&quot;') + ')">'
        + '<input name="name" type="text" required placeholder="Your name" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:6px;margin-bottom:8px;font-size:0.9375rem;box-sizing:border-box;">'
        + '<input name="email" type="email" required placeholder="Email address" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:6px;margin-bottom:8px;font-size:0.9375rem;box-sizing:border-box;">'
        + '<input name="phone" type="tel" placeholder="Phone (optional)" style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:6px;margin-bottom:8px;font-size:0.9375rem;box-sizing:border-box;">'
        + '<textarea name="message" rows="3" placeholder="Any questions or details..." style="width:100%;padding:10px;border:1px solid #d1d5db;border-radius:6px;margin-bottom:10px;font-size:0.9375rem;box-sizing:border-box;resize:vertical;"></textarea>'
        + '<button type="submit" style="width:100%;padding:12px;background:' + ACCENT + ';color:#fff;border:none;border-radius:6px;font-size:0.9375rem;font-weight:700;cursor:pointer;">Send Quote Request</button>'
        + '</form></div>';
    }

    el.innerHTML = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">'
      + '<div>' + (product.primary_image ? '<img src="' + product.primary_image + '" style="width:100%;border-radius:8px;object-fit:cover;aspect-ratio:4/3;" />' : '<div style="width:100%;aspect-ratio:4/3;background:#f3f4f6;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#9ca3af;">No image</div>') + '</div>'
      + '<div>'
        + (product.category ? '<p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:.05em;color:#9ca3af;margin:0 0 6px;">' + product.category + '</p>' : '')
        + '<h2 style="font-size:1.25rem;font-weight:700;margin:0 0 8px;">' + product.title + '</h2>'
        + (product.model ? '<p style="font-size:0.875rem;color:#6b7280;margin:0 0 12px;">Model: ' + product.model + '</p>' : '')
        + '<div style="margin-bottom:16px;">' + priceHtml + '</div>'
        + (product.description ? '<p style="font-size:0.9375rem;color:#374151;line-height:1.6;margin:0 0 16px;">' + product.description + '</p>' : '')
        + actionHtml
      + '</div>'
      + '</div>';

    document.getElementById('fm-product-modal').classList.add('fm-open');
    document.body.style.overflow = 'hidden';
  };

  window.fmCloseModal = function() {
    document.getElementById('fm-product-modal').classList.remove('fm-open');
    document.body.style.overflow = '';
  };

  // Close modal on overlay click
  document.getElementById('fm-product-modal').addEventListener('click', function(e) {
    if (e.target === this) fmCloseModal();
  });

  // ── Add to cart ──
  window.fmAddToCart = function(product, qty) {
    var item = {
      id: product.id,
      title: product.title,
      price: product.sale_price || product.price,
      quantity: qty || 1,
      primary_image: product.primary_image || null,
      slug: product.slug || null,
    };

    fetch('/api/inventory/cart/' + SITE_ID, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_ID, item: item }),
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      cartItems = d.items || [];
      renderCartBtn();
      fmCloseModal();
      fmOpenCart();
    })
    .catch(function() {});
  };

  // ── Buy now — add to cart then go straight to checkout ──
  window.fmBuyNow = function(product) {
    var item = {
      id: product.id,
      title: product.title,
      price: product.sale_price || product.price,
      quantity: 1,
      primary_image: product.primary_image || null,
      slug: product.slug || null,
    };
    fetch('/api/inventory/cart/' + SITE_ID, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_ID, item: item }),
    })
    .then(function(r) { return r.json(); })
    .then(function(d) { cartItems = d.items || []; fmCheckout(); })
    .catch(function() {});
  };

  // ── Remove from cart ──
  window.fmRemoveFromCart = function(itemId) {
    fetch('/api/inventory/cart/' + SITE_ID, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_ID, itemId: itemId }),
    })
    .then(function(r) { return r.json(); })
    .then(function(d) { cartItems = d.items || []; renderCartBtn(); renderCartDrawer(); })
    .catch(function() {});
  };

  // ── Checkout ──
  window.fmCheckout = function() {
    if (!cartItems.length) return;
    var btn = document.getElementById('fm-checkout-btn');
    if (btn) { btn.textContent = 'Processing...'; btn.disabled = true; }

    fetch('/api/inventory/checkout/' + SITE_ID, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: SESSION_ID, items: cartItems }),
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.url) window.location.href = d.url;
      else { alert(d.error || 'Checkout unavailable'); if (btn) { btn.textContent = 'Checkout'; btn.disabled = false; } }
    })
    .catch(function() { if (btn) { btn.textContent = 'Checkout'; btn.disabled = false; } });
  };

  // ── Quote request submit ──
  window.fmSubmitQuote = function(e, product) {
    e.preventDefault();
    var form = e.target;
    var btn = form.querySelector('button[type=submit]');
    var orig = btn.textContent;
    btn.textContent = 'Sending...'; btn.disabled = true;

    fetch('/api/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site_id: SITE_ID,
        form_type: 'contact',
        name: form.name.value,
        email: form.email.value,
        phone: form.phone.value || null,
        message: form.message.value || null,
        extra_data: { product_id: product.id, product_title: product.title, inquiry_type: 'quote_request' },
      }),
    })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.success) {
        document.getElementById('fm-modal-content').innerHTML = '<div style="text-align:center;padding:3rem 2rem;"><div style="font-size:3rem;margin-bottom:1rem;">✓</div><h3 style="font-size:1.25rem;font-weight:700;margin:0 0 8px;">Quote Request Sent!</h3><p style="color:#6b7280;">We\'ll be in touch shortly.</p></div>';
      } else {
        btn.textContent = orig; btn.disabled = false;
        alert('Something went wrong. Please try again.');
      }
    })
    .catch(function() { btn.textContent = orig; btn.disabled = false; });
  };

  // ── Cart drawer ──
  window.fmOpenCart = function() {
    renderCartDrawer();
    document.getElementById('fm-cart-overlay').classList.add('fm-open');
    document.getElementById('fm-cart-drawer').classList.add('fm-open');
    document.body.style.overflow = 'hidden';
  };

  window.fmCloseCart = function() {
    document.getElementById('fm-cart-overlay').classList.remove('fm-open');
    document.getElementById('fm-cart-drawer').classList.remove('fm-open');
    document.body.style.overflow = '';
  };

  function renderCartBtn() {
    var count = cartItems.reduce(function(s, i) { return s + (i.quantity || 1); }, 0);
    var btn = document.getElementById('fm-cart-trigger');
    var badge = document.getElementById('fm-cart-count');
    if (btn) btn.style.display = CHECKOUT_MODE === 'online' && count > 0 ? 'flex' : 'none';
    if (badge) badge.textContent = count;
  }

  function renderCartDrawer() {
    var itemsEl = document.getElementById('fm-cart-items');
    var footerEl = document.getElementById('fm-cart-footer');
    if (!itemsEl || !footerEl) return;

    if (!cartItems.length) {
      itemsEl.innerHTML = '<div style="text-align:center;padding:3rem 1rem;color:#9ca3af;"><p style="font-size:2rem;margin-bottom:8px;">🛒</p><p>Your cart is empty</p></div>';
      footerEl.innerHTML = '';
      return;
    }

    itemsEl.innerHTML = cartItems.map(function(item) {
      return '<div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #f3f4f6;">'
        + (item.primary_image ? '<img src="' + item.primary_image + '" style="width:64px;height:64px;object-fit:cover;border-radius:6px;flex-shrink:0;" />' : '<div style="width:64px;height:64px;background:#f3f4f6;border-radius:6px;flex-shrink:0;"></div>')
        + '<div style="flex:1;min-width:0;">'
          + '<p style="font-weight:600;font-size:0.875rem;margin:0 0 4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + item.title + '</p>'
          + '<p style="font-size:0.875rem;color:#374151;margin:0 0 6px;">$' + Number(item.price).toLocaleString() + ' × ' + item.quantity + '</p>'
          + '<button onclick="fmRemoveFromCart(\'' + item.id + '\')" style="font-size:0.75rem;color:#ef4444;background:none;border:none;cursor:pointer;padding:0;">Remove</button>'
        + '</div>'
        + '<p style="font-weight:700;font-size:0.9375rem;flex-shrink:0;">$' + (Number(item.price) * item.quantity).toLocaleString() + '</p>'
        + '</div>';
    }).join('');

    var total = cartItems.reduce(function(s, i) { return s + Number(i.price) * (i.quantity || 1); }, 0);
    footerEl.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:12px;font-weight:700;font-size:1.0625rem;">'
      + '<span>Total</span><span>$' + total.toLocaleString() + '</span></div>'
      + '<button id="fm-checkout-btn" onclick="fmCheckout()" style="width:100%;padding:14px;background:' + ACCENT + ';color:#fff;border:none;border-radius:8px;font-size:1rem;font-weight:700;cursor:pointer;">Checkout →</button>'
      + '<button onclick="fmCloseCart()" style="width:100%;padding:10px;background:none;border:none;font-size:0.875rem;color:#6b7280;cursor:pointer;margin-top:8px;">Continue Shopping</button>';
  }

  renderCartBtn();
})();
</script>`;
}

/**
 * Generates the onclick handler string for a product card.
 * Usage: <div onclick="${productCardOnclick(product)}">
 */
export function productCardOnclick(product: any): string {
  const safe = JSON.stringify({
    id: product.id,
    title: product.title || product.name,
    description: product.description,
    price: product.price,
    sale_price: product.sale_price,
    primary_image: product.primary_image || product.image_url,
    category: product.category,
    model: product.model,
    slug: product.slug,
  }).replace(/"/g, '&quot;').replace(/'/g, "\\'");
  return `fmOpenProduct(${safe})`;
}
