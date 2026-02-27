// ── Shared Product Modal + Booking Flow Components ──
// Injected into all templates to provide:
// 1. Product detail modal (click product card → modal with details + inquiry)
// 2. Service booking form with multi-step flow
// 3. Rental booking form with date picker + equipment selection

export function productModalScript(siteId: string, primaryColor: string, accentColor?: string): string {
  const accent = accentColor || primaryColor;
  return `
<style>
  /* ── Product Modal ── */
  .fm-modal-overlay {
    display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 9999;
    align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(4px);
  }
  .fm-modal-overlay.active { display: flex; }
  .fm-modal {
    background: #fff; border-radius: 12px; max-width: 900px; width: 100%;
    max-height: 90vh; overflow-y: auto; position: relative;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); animation: fmSlideUp 0.25s ease-out;
  }
  @keyframes fmSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .fm-modal-close {
    position: absolute; top: 12px; right: 12px; width: 36px; height: 36px;
    border-radius: 50%; border: none; background: rgba(0,0,0,0.05); cursor: pointer;
    display: flex; align-items: center; justify-content: center; z-index: 10;
    font-size: 18px; color: #374151; transition: all 0.15s;
  }
  .fm-modal-close:hover { background: rgba(0,0,0,0.1); }
  .fm-modal-body { display: grid; grid-template-columns: 1fr 1fr; }
  .fm-modal-img {
    aspect-ratio: 1; background: #f3f4f6; display: flex; align-items: center; justify-content: center;
    border-radius: 12px 0 0 12px; overflow: hidden;
  }
  .fm-modal-img img { width: 100%; height: 100%; object-fit: cover; }
  .fm-modal-info { padding: 2rem; display: flex; flex-direction: column; }
  .fm-modal-badge {
    display: inline-block; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.05em; padding: 3px 8px; border-radius: 4px; margin-bottom: 0.75rem;
    background: ${primaryColor}15; color: ${primaryColor};
  }
  .fm-modal-title { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem; line-height: 1.3; }
  .fm-modal-price { font-size: 1.75rem; font-weight: 800; color: ${primaryColor}; margin: 0 0 1rem; }
  .fm-modal-price .original { font-size: 1rem; color: #9ca3af; text-decoration: line-through; margin-right: 0.5rem; font-weight: 400; }
  .fm-modal-desc { font-size: 0.9375rem; color: #6b7280; line-height: 1.7; margin: 0 0 1.25rem; flex: 1; }
  .fm-modal-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1.5rem; }
  .fm-modal-spec {
    background: #f9fafb; border-radius: 6px; padding: 0.5rem 0.75rem;
    font-size: 0.8125rem; color: #374151;
  }
  .fm-modal-spec strong { display: block; font-size: 0.6875rem; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.05em; margin-bottom: 2px; }
  .fm-modal-actions { display: flex; gap: 0.75rem; }
  .fm-btn-primary {
    flex: 1; padding: 0.75rem; border-radius: 8px; border: none; cursor: pointer;
    font-weight: 700; font-size: 0.9375rem; color: #fff; background: ${primaryColor};
    transition: all 0.15s; text-align: center; text-decoration: none; display: inline-block;
  }
  .fm-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .fm-btn-outline {
    flex: 1; padding: 0.75rem; border-radius: 8px; cursor: pointer;
    font-weight: 600; font-size: 0.9375rem; color: ${primaryColor}; background: #fff;
    border: 2px solid ${primaryColor}20; transition: all 0.15s; text-align: center;
    text-decoration: none; display: inline-block;
  }
  .fm-btn-outline:hover { border-color: ${primaryColor}; }

  /* ── Inquiry Form inside Modal ── */
  .fm-inquiry { display: none; padding: 2rem; border-top: 1px solid #e5e7eb; }
  .fm-inquiry.active { display: block; }
  .fm-inquiry input, .fm-inquiry textarea, .fm-inquiry select {
    width: 100%; padding: 0.625rem 0.75rem; border: 1.5px solid #e5e7eb; border-radius: 6px;
    font-size: 0.875rem; margin-bottom: 0.75rem; font-family: inherit; transition: border-color 0.15s;
  }
  .fm-inquiry input:focus, .fm-inquiry textarea:focus { border-color: ${primaryColor}; outline: none; }
  .fm-inquiry label { display: block; font-size: 0.8125rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem; }
  .fm-inquiry-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  .fm-inquiry-success { text-align: center; padding: 2rem; color: #059669; font-weight: 600; }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .fm-modal-body { grid-template-columns: 1fr; }
    .fm-modal-img { aspect-ratio: 16/10; border-radius: 12px 12px 0 0; }
    .fm-modal-info { padding: 1.25rem; }
    .fm-inquiry-row { grid-template-columns: 1fr; }
  }
</style>

<!-- Product Modal -->
<div id="fm-product-modal" class="fm-modal-overlay" onclick="if(event.target===this)closeFmModal()">
  <div class="fm-modal">
    <button class="fm-modal-close" onclick="closeFmModal()">✕</button>
    <div class="fm-modal-body">
      <div class="fm-modal-img" id="fm-modal-img"></div>
      <div class="fm-modal-info">
        <span class="fm-modal-badge" id="fm-modal-badge"></span>
        <h2 class="fm-modal-title" id="fm-modal-title"></h2>
        <div class="fm-modal-price" id="fm-modal-price"></div>
        <p class="fm-modal-desc" id="fm-modal-desc"></p>
        <div class="fm-modal-specs" id="fm-modal-specs"></div>
        <div class="fm-modal-actions">
          <button class="fm-btn-primary" onclick="showFmInquiry()">Request a Quote</button>
          <a class="fm-btn-outline" id="fm-modal-contact" href="/api/preview/${siteId}?page=contact">Contact Us</a>
        </div>
      </div>
    </div>
    <div class="fm-inquiry" id="fm-inquiry">
      <h3 style="font-size:1.125rem;font-weight:700;color:#111827;margin:0 0 1rem;">Request a Quote</h3>
      <div id="fm-inquiry-form">
        <input type="hidden" id="fm-inq-product" />
        <div class="fm-inquiry-row">
          <div><label>Name *</label><input type="text" id="fm-inq-name" required placeholder="Your name"></div>
          <div><label>Phone *</label><input type="tel" id="fm-inq-phone" required placeholder="(555) 123-4567"></div>
        </div>
        <div><label>Email *</label><input type="email" id="fm-inq-email" required placeholder="you@company.com"></div>
        <div><label>Message</label><textarea id="fm-inq-message" rows="3" placeholder="I'm interested in this equipment..."></textarea></div>
        <button class="fm-btn-primary" style="width:100%" onclick="submitFmInquiry()">Send Inquiry</button>
      </div>
      <div id="fm-inquiry-success" class="fm-inquiry-success" style="display:none">
        ✓ Your inquiry has been sent! We'll be in touch soon.
      </div>
    </div>
  </div>
</div>

<script>
(function() {
  var siteId = '${siteId}';
  
  // Store product data for modal
  window._fmProducts = {};
  
  // Register a product for the modal system
  window.fmRegisterProduct = function(product) {
    window._fmProducts[product.id] = product;
  };
  
  // Open product modal
  window.openFmModal = function(productId) {
    var p = window._fmProducts[productId];
    if (!p) return;
    
    var modal = document.getElementById('fm-product-modal');
    var imgContainer = document.getElementById('fm-modal-img');
    var imgUrl = p.image_url || p.primary_image || '';
    var hasImage = imgUrl && imgUrl.indexOf('placeholder') === -1;
    
    imgContainer.innerHTML = hasImage 
      ? '<img src="' + imgUrl + '" alt="' + (p.name || p.title || '') + '">'
      : '<svg width="64" height="64" fill="none" stroke="#d1d5db" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>';
    
    document.getElementById('fm-modal-badge').textContent = [p.brand, p.category, p.condition === 'used' ? 'Used' : 'New'].filter(Boolean).join(' · ');
    document.getElementById('fm-modal-title').textContent = p.name || p.title || 'Equipment';
    
    var priceHtml = '';
    if (p.sale_price && p.price) {
      priceHtml = '<span class="original">$' + Number(p.price).toLocaleString() + '</span>$' + Number(p.sale_price).toLocaleString();
    } else if (p.price) {
      priceHtml = '$' + Number(p.price).toLocaleString();
    } else {
      priceHtml = 'Call for Price';
    }
    document.getElementById('fm-modal-price').innerHTML = priceHtml;
    document.getElementById('fm-modal-desc').textContent = p.description || '';
    
    var specs = [];
    if (p.model) specs.push('<div class="fm-modal-spec"><strong>Model</strong>' + p.model + '</div>');
    if (p.year) specs.push('<div class="fm-modal-spec"><strong>Year</strong>' + p.year + '</div>');
    if (p.brand) specs.push('<div class="fm-modal-spec"><strong>Brand</strong>' + p.brand + '</div>');
    if (p.condition) specs.push('<div class="fm-modal-spec"><strong>Condition</strong>' + (p.condition === 'used' ? 'Pre-Owned' : 'New') + '</div>');
    if (p.hours) specs.push('<div class="fm-modal-spec"><strong>Hours</strong>' + p.hours + '</div>');
    if (p.category) specs.push('<div class="fm-modal-spec"><strong>Category</strong>' + p.category + '</div>');
    document.getElementById('fm-modal-specs').innerHTML = specs.join('');
    
    document.getElementById('fm-inq-product').value = (p.name || p.title || '') + ' (' + (p.model || p.id || '') + ')';
    
    // Reset inquiry form
    document.getElementById('fm-inquiry').classList.remove('active');
    document.getElementById('fm-inquiry-form').style.display = '';
    document.getElementById('fm-inquiry-success').style.display = 'none';
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  
  window.closeFmModal = function() {
    document.getElementById('fm-product-modal').classList.remove('active');
    document.body.style.overflow = '';
  };
  
  window.showFmInquiry = function() {
    document.getElementById('fm-inquiry').classList.add('active');
    document.getElementById('fm-inq-name').focus();
  };
  
  window.submitFmInquiry = function() {
    var name = document.getElementById('fm-inq-name').value;
    var phone = document.getElementById('fm-inq-phone').value;
    var email = document.getElementById('fm-inq-email').value;
    if (!name || !phone || !email) { alert('Please fill in all required fields.'); return; }
    
    var product = document.getElementById('fm-inq-product').value;
    var message = document.getElementById('fm-inq-message').value;
    
    // Submit to API
    fetch('/api/leads/' + siteId, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, phone: phone, email: email, message: message, source: 'product_inquiry', product: product })
    }).catch(function() {});
    
    // Show success
    document.getElementById('fm-inquiry-form').style.display = 'none';
    document.getElementById('fm-inquiry-success').style.display = '';
  };
  
  // Close on Escape
  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeFmModal(); });
})();
</script>`;
}

// Helper to make a product card clickable (wraps the existing card content)
export function productCardWrapper(product: any): string {
  return `onclick="openFmModal('${product.id || product.slug || ''}')" style="cursor:pointer;"`;
}

// Inline script to register products for the modal
export function registerProductsScript(products: any[]): string {
  if (!products || !products.length) return '';
  const safeProducts = products.map(p => ({
    id: p.id || p.slug || '',
    name: p.name || p.title || '',
    title: p.title || p.name || '',
    description: p.description || '',
    price: p.price || null,
    sale_price: p.sale_price || null,
    image_url: p.image_url || p.primary_image || '',
    primary_image: p.primary_image || p.image_url || '',
    brand: p.brand || '',
    category: p.category || '',
    model: p.model || '',
    year: p.year || null,
    condition: p.condition || 'new',
    hours: p.hours || null,
    slug: p.slug || '',
  }));
  return `<script>
(function() {
  var products = ${JSON.stringify(safeProducts)};
  products.forEach(function(p) { window.fmRegisterProduct(p); });
})();
</script>`;
}

// ── Service Booking Component ──
// Multi-step service booking form matching GVI's advanced flow
export function serviceBookingSection(siteId: string, primaryColor: string, getContent: (key: string) => string): string {
  const heading = getContent('servicePage.heading') || 'Expert Service & Repair';
  const subheading = getContent('servicePage.subheading') || 'Keep your equipment running at peak performance.';
  const phone = getContent('businessInfo.phone') || getContent('business.phone') || '(555) 123-4567';
  const email = getContent('businessInfo.email') || getContent('business.email') || 'service@dealer.com';

  return `
  <section style="padding: 4rem 0;">
    <div style="max-width: 800px; margin: 0 auto; padding: 0 1.5rem;">
      <h2 style="font-size: 2rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem; text-align: center;">${heading}</h2>
      <p style="color: #6b7280; text-align: center; margin: 0 0 2.5rem;">${subheading}</p>

      <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <!-- Step 1: Select Service -->
        <div>
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
            <span style="width: 28px; height: 28px; border-radius: 50%; background: ${primaryColor}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.8125rem; font-weight: 700;">1</span>
            <h3 style="font-size: 1rem; font-weight: 700; color: #111827; margin: 0;">Select a Service</h3>
          </div>
          <div id="svc-service-list" style="display: grid; gap: 0.75rem;">
            <div style="text-align: center; padding: 1rem; color: #9ca3af;">Loading services...</div>
          </div>
        </div>

        <!-- Step 2: Pick Date & Time -->
        <div id="svc-step-2" style="display: none; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
            <span style="width: 28px; height: 28px; border-radius: 50%; background: ${primaryColor}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.8125rem; font-weight: 700;">2</span>
            <h3 style="font-size: 1rem; font-weight: 700; color: #111827; margin: 0;">Pick a Date & Time</h3>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div>
              <label style="display: block; font-size: 0.8125rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Preferred Date *</label>
              <input type="date" id="svc-date" style="width: 100%; padding: 0.625rem; border: 1.5px solid #e5e7eb; border-radius: 6px; font-size: 0.875rem;">
            </div>
            <div>
              <label style="display: block; font-size: 0.8125rem; font-weight: 600; color: #374151; margin-bottom: 0.25rem;">Preferred Time *</label>
              <select id="svc-time" style="width: 100%; padding: 0.625rem; border: 1.5px solid #e5e7eb; border-radius: 6px; font-size: 0.875rem;">
                <option value="">Select time</option>
                <option>8:00 AM</option><option>8:30 AM</option><option>9:00 AM</option><option>9:30 AM</option>
                <option>10:00 AM</option><option>10:30 AM</option><option>11:00 AM</option><option>11:30 AM</option>
                <option>12:00 PM</option><option>12:30 PM</option><option>1:00 PM</option><option>1:30 PM</option>
                <option>2:00 PM</option><option>2:30 PM</option><option>3:00 PM</option><option>3:30 PM</option>
                <option>4:00 PM</option><option>4:30 PM</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Step 3: Your Info -->
        <div id="svc-step-3" style="display: none; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
            <span style="width: 28px; height: 28px; border-radius: 50%; background: ${primaryColor}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.8125rem; font-weight: 700;">3</span>
            <h3 style="font-size: 1rem; font-weight: 700; color: #111827; margin: 0;">Your Information</h3>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Name *</label><input type="text" id="svc-name" placeholder="Your name" style="width:100%;padding:0.625rem;border:1.5px solid #e5e7eb;border-radius:6px;font-size:0.875rem;"></div>
            <div><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Phone *</label><input type="tel" id="svc-phone" placeholder="(555) 123-4567" style="width:100%;padding:0.625rem;border:1.5px solid #e5e7eb;border-radius:6px;font-size:0.875rem;"></div>
          </div>
          <div style="margin-top:0.75rem;"><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Email *</label><input type="email" id="svc-email" placeholder="you@company.com" style="width:100%;padding:0.625rem;border:1.5px solid #e5e7eb;border-radius:6px;font-size:0.875rem;"></div>
          <div style="margin-top:0.75rem;"><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Equipment Details</label><input type="text" id="svc-equipment" placeholder="e.g., Toro Z Master 60&quot;" style="width:100%;padding:0.625rem;border:1.5px solid #e5e7eb;border-radius:6px;font-size:0.875rem;"></div>
          <div style="margin-top:0.75rem;"><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Notes</label><textarea id="svc-notes" rows="3" placeholder="Describe the issue..." style="width:100%;padding:0.625rem;border:1.5px solid #e5e7eb;border-radius:6px;font-size:0.875rem;resize:vertical;"></textarea></div>
          <button id="svc-submit" onclick="submitServiceBooking()" style="margin-top:1rem;width:100%;padding:0.75rem;border:none;border-radius:8px;background:${primaryColor};color:#fff;font-weight:700;font-size:0.9375rem;cursor:pointer;">Schedule Service</button>
        </div>

        <!-- Success -->
        <div id="svc-success" style="display:none;text-align:center;padding:2rem;color:#059669;font-weight:600;">
          ✓ Service appointment requested! We'll confirm your booking soon.
        </div>
      </div>

      <!-- Quick Contact -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1.5rem;">
        <a href="tel:${phone.replace(/[^0-9]/g, '')}" style="display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:1rem;background:${primaryColor};color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.9375rem;">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Call: ${phone}
        </a>
        <a href="mailto:${email}" style="display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:1rem;background:#f3f4f6;color:#374151;border-radius:8px;text-decoration:none;font-weight:600;font-size:0.9375rem;border:1px solid #e5e7eb;">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          Email Us
        </a>
      </div>
    </div>
  </section>

  <script>
  (function() {
    var siteId = '${siteId}';
    var selectedService = null;
    
    // Show date step when date changes
    var dateEl = document.getElementById('svc-date');
    var timeEl = document.getElementById('svc-time');
    if (dateEl) {
      // Set min date to today
      var today = new Date().toISOString().split('T')[0];
      dateEl.min = today;
      dateEl.addEventListener('change', function() {
        if (this.value) document.getElementById('svc-step-3').style.display = '';
      });
    }
    if (timeEl) {
      timeEl.addEventListener('change', function() {
        if (this.value) document.getElementById('svc-step-3').style.display = '';
      });
    }
    
    // Load service types
    fetch('/api/service/types/' + siteId)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var list = document.getElementById('svc-service-list');
        if (!list) return;
        var types = data.types || data.serviceTypes || data || [];
        if (!types.length) {
          types = [
            { id: 'general', name: 'General Maintenance', description: 'Oil changes, blade sharpening, tune-ups', duration_minutes: 60 },
            { id: 'repair', name: 'Equipment Repair', description: 'Diagnose and fix mechanical issues', duration_minutes: 120 },
            { id: 'seasonal', name: 'Seasonal Service', description: 'Winterization or spring start-up service', duration_minutes: 90 },
          ];
        }
        list.innerHTML = '';
        types.forEach(function(st) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.style.cssText = 'text-align:left;padding:1rem;border:2px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;transition:all 0.15s;';
          var dur = st.duration_minutes ? ' · ' + st.duration_minutes + ' min' : '';
          var price = st.price_estimate ? ' · $' + st.price_estimate : (st.price ? ' · $' + st.price : '');
          btn.innerHTML = '<div style="font-weight:700;color:#111827;">' + st.name + '</div>' +
            (st.description ? '<div style="font-size:0.8125rem;color:#6b7280;margin-top:0.25rem;">' + st.description + dur + price + '</div>' : '');
          btn.addEventListener('click', function() {
            list.querySelectorAll('button').forEach(function(b) { b.style.borderColor = '#e5e7eb'; b.style.background = '#fff'; });
            this.style.borderColor = '${primaryColor}';
            this.style.background = '${primaryColor}08';
            selectedService = st;
            document.getElementById('svc-step-2').style.display = '';
          });
          list.appendChild(btn);
        });
      })
      .catch(function() {
        var list = document.getElementById('svc-service-list');
        if (list) list.innerHTML = [
          { id: 'general', name: 'General Maintenance', desc: 'Oil changes, blade sharpening, tune-ups' },
          { id: 'repair', name: 'Equipment Repair', desc: 'Diagnose and fix mechanical issues' },
          { id: 'seasonal', name: 'Seasonal Service', desc: 'Winterization or spring start-up' },
        ].map(function(st) {
          return '<button type="button" onclick="this.parentNode.querySelectorAll(\\'button\\').forEach(b=>{b.style.borderColor=\\'#e5e7eb\\';b.style.background=\\'#fff\\'});this.style.borderColor=\\'${primaryColor}\\';this.style.background=\\'${primaryColor}08\\';document.getElementById(\\'svc-step-2\\').style.display=\\'\\';" style="text-align:left;padding:1rem;border:2px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;"><div style=\\"font-weight:700;color:#111827;\\">' + st.name + '</div><div style=\\"font-size:0.8125rem;color:#6b7280;margin-top:0.25rem;\\">' + st.desc + '</div></button>';
        }).join('');
      });
    
    window.submitServiceBooking = function() {
      var name = document.getElementById('svc-name').value;
      var phone = document.getElementById('svc-phone').value;
      var email = document.getElementById('svc-email').value;
      var date = document.getElementById('svc-date').value;
      var time = document.getElementById('svc-time').value;
      if (!name || !phone || !email) { alert('Please fill in all required fields.'); return; }
      
      fetch('/api/service/book/' + siteId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_type: selectedService ? selectedService.name : 'General',
          service_type_id: selectedService ? selectedService.id : null,
          date: date, time: time,
          customer_name: name, customer_phone: phone, customer_email: email,
          equipment: document.getElementById('svc-equipment').value,
          notes: document.getElementById('svc-notes').value,
        })
      }).catch(function() {});
      
      document.getElementById('svc-success').style.display = '';
      document.getElementById('svc-step-2').style.display = 'none';
      document.getElementById('svc-step-3').style.display = 'none';
      document.querySelector('#svc-service-list').parentElement.style.display = 'none';
    };
  })();
  </script>`;
}

// ── Rental Booking Component ──
export function rentalBookingSection(siteId: string, primaryColor: string, getContent: (key: string) => string): string {
  const heading = getContent('rentalsPage.heading') || getContent('rentals.heading') || 'Equipment Rentals';
  const subheading = getContent('rentalsPage.subheading') || 'Flexible rental options for every project.';
  const phone = getContent('businessInfo.phone') || getContent('business.phone') || '(555) 123-4567';

  return `
  <section style="padding: 4rem 0;">
    <div style="max-width: 900px; margin: 0 auto; padding: 0 1.5rem;">
      <h2 style="font-size: 2rem; font-weight: 700; color: #111827; margin: 0 0 0.5rem; text-align: center;">${heading}</h2>
      <p style="color: #6b7280; text-align: center; margin: 0 0 2.5rem;">${subheading}</p>

      <!-- Rental Equipment Grid -->
      <div id="rental-equipment-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem;"></div>

      <!-- Rental Request Form -->
      <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 2rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0 0 1.5rem;">Request a Rental</h3>
        <div id="rental-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Name *</label><input type="text" id="rent-name" placeholder="Your name" style="width:100%;padding:0.625rem;border:1.5px solid #e5e7eb;border-radius:6px;font-size:0.875rem;"></div>
            <div><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Phone *</label><input type="tel" id="rent-phone" placeholder="(555) 123-4567" style="width:100%;padding:0.625rem;border:1.5px solid #e5e7eb;border-radius:6px;font-size:0.875rem;"></div>
          </div>
          <div style="margin-top:0.75rem;"><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Email *</label><input type="email" id="rent-email" placeholder="you@company.com" style="width:100%;padding:0.625rem;border:1.5px solid #e5e7eb;border-radius:6px;font-size:0.875rem;"></div>
          <div style="margin-top:0.75rem;display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Start Date *</label><input type="date" id="rent-start" style="width:100%;padding:0.625rem;border:1.5px solid #e5e7eb;border-radius:6px;font-size:0.875rem;"></div>
            <div><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">End Date *</label><input type="date" id="rent-end" style="width:100%;padding:0.625rem;border:1.5px solid #e5e7eb;border-radius:6px;font-size:0.875rem;"></div>
          </div>
          <div style="margin-top:0.75rem;"><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Equipment Needed</label><select id="rent-equipment" style="width:100%;padding:0.625rem;border:1.5px solid #e5e7eb;border-radius:6px;font-size:0.875rem;"><option value="">Select equipment (optional)</option></select></div>
          <div style="margin-top:0.75rem;"><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Project Details</label><textarea id="rent-notes" rows="3" placeholder="Describe your project and rental needs..." style="width:100%;padding:0.625rem;border:1.5px solid #e5e7eb;border-radius:6px;font-size:0.875rem;resize:vertical;"></textarea></div>
          <button onclick="submitRentalRequest()" style="margin-top:1rem;width:100%;padding:0.75rem;border:none;border-radius:8px;background:${primaryColor};color:#fff;font-weight:700;font-size:0.9375rem;cursor:pointer;">Request Rental Quote</button>
        </div>
        <div id="rental-success" style="display:none;text-align:center;padding:2rem;color:#059669;font-weight:600;">
          ✓ Rental request submitted! We'll get back to you with availability and pricing.
        </div>
      </div>
    </div>
  </section>

  <script>
  (function() {
    var siteId = '${siteId}';
    
    // Set min dates
    var today = new Date().toISOString().split('T')[0];
    var startEl = document.getElementById('rent-start');
    var endEl = document.getElementById('rent-end');
    if (startEl) { startEl.min = today; startEl.addEventListener('change', function() { if (endEl) endEl.min = this.value; }); }
    
    // Load rental equipment
    fetch('/api/rentals/' + siteId)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var items = data.equipment || data.items || data || [];
        var grid = document.getElementById('rental-equipment-grid');
        var select = document.getElementById('rent-equipment');
        if (!items.length) {
          items = [
            { id: 'r1', name: 'Commercial Mower', description: 'Zero-turn 60" deck', daily_rate: 150, image_url: '' },
            { id: 'r2', name: 'Compact Tractor', description: '25HP with loader', daily_rate: 250, image_url: '' },
            { id: 'r3', name: 'Aerator', description: 'Walk-behind core aerator', daily_rate: 85, image_url: '' },
            { id: 'r4', name: 'Stump Grinder', description: 'Self-propelled 13HP', daily_rate: 200, image_url: '' },
          ];
        }
        if (grid) {
          grid.innerHTML = items.map(function(item) {
            var img = item.image_url || item.primary_image || '';
            var hasImg = img && img.indexOf('placeholder') === -1;
            return '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;transition:all 0.15s;" onmouseover="this.style.borderColor=\\'${primaryColor}40\\';this.style.transform=\\'translateY(-2px)\\'" onmouseout="this.style.borderColor=\\'#e5e7eb\\';this.style.transform=\\'\\'"><div style="height:140px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;overflow:hidden;">' +
              (hasImg ? '<img src="' + img + '" style="width:100%;height:100%;object-fit:cover;">' : '<svg width="40" height="40" fill="none" stroke="#d1d5db" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>') +
              '</div><div style="padding:1rem;"><h4 style="font-weight:700;color:#111827;margin:0 0 0.25rem;font-size:0.9375rem;">' + item.name + '</h4>' +
              '<p style="font-size:0.8125rem;color:#6b7280;margin:0 0 0.5rem;">' + (item.description || '') + '</p>' +
              (item.daily_rate ? '<span style="font-weight:700;color:' + '${primaryColor}' + ';font-size:0.9375rem;">$' + item.daily_rate + '/day</span>' : '<span style="color:#6b7280;font-size:0.8125rem;">Call for pricing</span>') +
              '</div></div>';
          }).join('');
        }
        if (select) {
          items.forEach(function(item) {
            var opt = document.createElement('option');
            opt.value = item.name;
            opt.textContent = item.name + (item.daily_rate ? ' ($' + item.daily_rate + '/day)' : '');
            select.appendChild(opt);
          });
        }
      })
      .catch(function() {});
    
    window.submitRentalRequest = function() {
      var name = document.getElementById('rent-name').value;
      var phone = document.getElementById('rent-phone').value;
      var email = document.getElementById('rent-email').value;
      if (!name || !phone || !email) { alert('Please fill in all required fields.'); return; }
      
      fetch('/api/rentals/book/' + siteId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name, customer_phone: phone, customer_email: email,
          start_date: document.getElementById('rent-start').value,
          end_date: document.getElementById('rent-end').value,
          equipment: document.getElementById('rent-equipment').value,
          notes: document.getElementById('rent-notes').value,
        })
      }).catch(function() {});
      
      document.getElementById('rental-form').style.display = 'none';
      document.getElementById('rental-success').style.display = '';
    };
  })();
  </script>`;
}
