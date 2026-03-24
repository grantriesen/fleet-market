// app/api/preview/[siteId]/templates/shared-rental.ts
// ============================================================
// Shared rental modal, date picker, and calculator for all
// Fleet Market dealer website templates.
//
// Usage in any template:
//
//   import { rentalModalBlock, rentalInventoryCard } from './shared-rental';
//
//   // In page assembly, add rental block before </body>:
//   return html + rentalModalBlock('gv', siteId, colors.primary);
//   // or for fm-prefixed templates:
//   return html + rentalModalBlock('fm', siteId, colors.primary);
//
//   // Reserve Now button on each inventory card:
//   const btn = rentalInventoryCard(item, 'gv');
// ============================================================

// ── Time parser (shared) ──────────────────────────────────────────────────
function parseTimeToHours(t: string): number | null {
  const m = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1]);
  const mn = parseInt(m[2]);
  const mer = m[3].toUpperCase();
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return h + mn / 60;
}

// ── Blended billing calculator ────────────────────────────────────────────
// Exported for standalone use / testing
export interface RentalRates {
  hourly?: number;
  daily?: number;
  weekly?: number;
  monthly?: number;
}

export interface RentalCalcResult {
  total: number;
  label: string;
}

export function calcRentalTotal(
  days: number,
  rates: RentalRates,
  pickupTime?: string,
  returnTime?: string
): RentalCalcResult | null {
  if (days <= 0) return null;
  const hourly  = rates.hourly  || 0;
  const daily   = rates.daily   || 0;
  const weekly  = rates.weekly  || 0;
  const monthly = rates.monthly || 0;

  // Same-day hourly: < 4 hrs uses hourly rate, >= 4 hrs uses daily
  if (days === 1 && hourly && pickupTime && returnTime) {
    const pHr = parseTimeToHours(pickupTime);
    const rHr = parseTimeToHours(returnTime);
    if (pHr !== null && rHr !== null && rHr > pHr) {
      const dur = rHr - pHr;
      if (dur < 4) {
        return { total: +(dur * hourly).toFixed(2), label: `${dur.toFixed(1)} hr @ $${hourly}/hr` };
      }
      return { total: +daily.toFixed(2), label: `1 day @ $${daily}/day` };
    }
  }

  // Monthly tier: 28+ days, blended (full months + remaining weeks + remaining days)
  if (days >= 28 && monthly) {
    const fullMo   = Math.max(1, Math.floor(days / 30));
    const remDays  = days - fullMo * 30;
    const remWk    = (remDays >= 7 && weekly) ? Math.floor(remDays / 7) : 0;
    const leftDays = remDays - remWk * 7;
    const total    = +(fullMo * monthly + remWk * (weekly || 0) + leftDays * (daily || 0)).toFixed(2);
    let label      = `${fullMo} mo`;
    if (remWk)    label += ` + ${remWk} wk`;
    if (leftDays) label += ` + ${leftDays} day${leftDays > 1 ? 's' : ''}`;
    return { total, label };
  }

  // Weekly tier: 7+ days, blended (full weeks + remaining days)
  if (days >= 7 && weekly) {
    const fullWk   = Math.floor(days / 7);
    const leftDays = days - fullWk * 7;
    const total    = +(fullWk * weekly + leftDays * (daily || 0)).toFixed(2);
    const label    = `${fullWk} wk${leftDays ? ` + ${leftDays} day${leftDays > 1 ? 's' : ''}` : ''}`;
    return { total, label };
  }

  // Daily tier
  if (daily) {
    return { total: +(days * daily).toFixed(2), label: `${days} day${days > 1 ? 's' : ''} @ $${daily}/day` };
  }

  return null;
}

// ── Inventory card Reserve Now button ─────────────────────────────────────
export function rentalReserveButton(item: any, prefix: string, classes?: string): string {
  const p = prefix;
  const fnName = `${p}OpenRentalModal`;
  const titleEsc = item.title ? item.title.replace(/'/g, "\\'") : '';
  const args = [
    `'${item.id}'`,
    `'${titleEsc}'`,
    item.daily_rate  || 0,
    item.delivery_available ? 'true' : 'false',
    item.hourly_rate  || 0,
    item.weekly_rate  || 0,
    item.monthly_rate || 0,
    item.deposit_required || 0,
  ].join(', ');
  if (item.quantity_available === 0) {
    return `<button disabled style="cursor:not-allowed;opacity:0.5;${classes || ''}">Currently Unavailable</button>`;
  }
  return `<button onclick="${fnName}(${args})" class="${classes || ''}" style="cursor:pointer;">Reserve Now</button>`;
}

// ── Date picker JS ─────────────────────────────────────────────────────────
// Inlined to avoid Next.js static file routing issues with /public assets.
// This is the canonical version — edit here, it propagates to all templates.
function datepickerScript(): string {
  return '<script>\n' + String.raw`
// Fleet Market Rental Date Picker
(function() {
  var DP = window.fmRentalDatePicker = {};

  DP.state = {
    bookedDates: [], startDate: null, endDate: null, hoverDate: null,
    viewYear: new Date().getFullYear(), viewMonth: new Date().getMonth(),
    containerId: null, onSelect: null, primaryColor: '#1e3a6e'
  };

  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  function pad(n) { return String(n).padStart(2,'0'); }
  function dateStr(d) { return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function parseDate(s) { var p=s.split('-'); return new Date(+p[0],+p[1]-1,+p[2]); }
  function today() { return dateStr(new Date()); }

  DP.init = function(containerId, siteId, itemId, onSelect, primaryColor) {
    var s = DP.state;
    s.containerId = containerId; s.onSelect = onSelect;
    s.primaryColor = primaryColor || '#1e3a6e';
    s.startDate = null; s.endDate = null; s.hoverDate = null; s.bookedDates = [];
    s.viewYear = new Date().getFullYear(); s.viewMonth = new Date().getMonth();
    DP.render();
    // Delegated click handler on container - survives innerHTML rebuilds
    var el = document.getElementById(containerId);
    if (el && !el._dpBound) {
      el._dpBound = true;
      el.addEventListener('click', function(e) {
        var cell = e.target;
        while (cell && cell !== el) {
          if (cell.getAttribute && cell.getAttribute('data-date')) break;
          cell = cell.parentNode;
        }
        if (!cell || cell === el || !cell.getAttribute('data-date')) return;
        if (cell.getAttribute('data-disabled')) return;
        var ds = cell.getAttribute('data-date');
        var st = DP.state;
        if (!st.startDate || (st.startDate && st.endDate) || ds < st.startDate) {
          st.startDate = ds; st.endDate = null;
        } else {
          st.endDate = ds;
          if (st.onSelect) st.onSelect(st.startDate, st.endDate);
        }
        DP.render();
      });
    }
    if (siteId && itemId) {
      fetch('/api/rental/availability/'+siteId+'?itemId='+itemId)
        .then(function(r){return r.json();})
        .then(function(data){
          s.bookedDates = (data.bookedRanges && data.bookedRanges[itemId]) || [];
          DP.render();
        }).catch(function(){});
    }
  };

  DP.render = function() {
    var el = document.getElementById(DP.state.containerId);
    if (!el) return;
    var s = DP.state, pc = s.primaryColor, today_str = today();
    var firstDay = new Date(s.viewYear, s.viewMonth, 1).getDay();
    var daysInMonth = new Date(s.viewYear, s.viewMonth+1, 0).getDate();
    var prevDays = new Date(s.viewYear, s.viewMonth, 0).getDate();
    var total = Math.ceil((firstDay+daysInMonth)/7)*7;

    var bothSet = s.startDate && s.endDate;
    var startOnly = s.startDate && !s.endDate;
    var s1bg = (startOnly||bothSet) ? pc : '#f3f4f6';
    var s1c = (startOnly||bothSet) ? 'white' : '#9ca3af';
    var s1lbl = s.startDate ? parseDate(s.startDate).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : 'Pick-up date';
    var s2bg = bothSet ? pc : (startOnly ? '#eff6ff' : '#f3f4f6');
    var s2c = bothSet ? 'white' : (startOnly ? pc : '#9ca3af');
    var s2lbl = s.endDate ? parseDate(s.endDate).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : (startOnly ? 'Click to select' : 'Return date');
    var s2bdr = startOnly ? ('2px dashed '+pc) : '2px solid transparent';

    var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">'
      +'<div style="padding:8px;border-radius:6px;background:'+s1bg+';text-align:center;">'
        +'<div style="font-size:10px;font-weight:600;text-transform:uppercase;color:'+s1c+';">Pick-up</div>'
        +'<div style="font-size:13px;font-weight:700;color:'+s1c+';margin-top:2px;">'+s1lbl+'</div>'
      +'</div>'
      +'<div style="padding:8px;border-radius:6px;background:'+s2bg+';border:'+s2bdr+';text-align:center;">'
        +'<div style="font-size:10px;font-weight:600;text-transform:uppercase;color:'+s2c+';">Return</div>'
        +'<div style="font-size:13px;font-weight:700;color:'+s2c+';margin-top:2px;">'+s2lbl+'</div>'
      +'</div>'
    +'</div>';

    if (bothSet) {
      var days = Math.ceil((parseDate(s.endDate)-parseDate(s.startDate))/86400000)+1;
      html += '<div style="text-align:center;margin-bottom:8px;"><span style="padding:3px 12px;background:'+pc+'18;border-radius:20px;font-size:12px;font-weight:600;color:'+pc+';">'+days+' day'+(days>1?'s':'')+'</span></div>';
    }

    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
      +'<button type="button" onclick="fmRentalDatePicker.prevMonth()" style="background:none;border:1px solid #e5e7eb;border-radius:6px;width:28px;height:28px;cursor:pointer;font-size:16px;color:#374151;line-height:1;">&#8249;</button>'
      +'<span style="font-weight:700;font-size:14px;color:#111827;">'+MONTHS[s.viewMonth]+' '+s.viewYear+'</span>'
      +'<button type="button" onclick="fmRentalDatePicker.nextMonth()" style="background:none;border:1px solid #e5e7eb;border-radius:6px;width:28px;height:28px;cursor:pointer;font-size:16px;color:#374151;line-height:1;">&#8250;</button>'
    +'</div>';

    html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:2px;">'
      + DAYS.map(function(d){return '<div style="text-align:center;font-size:11px;font-weight:600;color:#9ca3af;padding:2px 0;">'+d+'</div>';}).join('')
    +'</div>';

    html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);">';
    for (var i=0; i<total; i++) {
      var day, inMonth=true;
      if (i<firstDay){day=prevDays-firstDay+i+1;inMonth=false;}
      else if (i>=firstDay+daysInMonth){day=i-firstDay-daysInMonth+1;inMonth=false;}
      else{day=i-firstDay+1;}
      if (!inMonth){html+='<div></div>';continue;}
      var ds = s.viewYear+'-'+pad(s.viewMonth+1)+'-'+pad(day);
      var isPast=ds<today_str, isBooked=s.bookedDates.indexOf(ds)!==-1;
      var isStart=ds===s.startDate, isEnd=ds===s.endDate, isToday=ds===today_str;
      var inRange=s.startDate&&s.endDate&&ds>s.startDate&&ds<s.endDate;
      var st='padding:2px;text-align:center;font-size:13px;line-height:28px;user-select:none;';
      if (isPast){st+='color:#d1d5db;cursor:not-allowed;';}
      else if (isBooked){st+='background:#fee2e2;color:#9ca3af;cursor:not-allowed;text-decoration:line-through;border-radius:4px;';}
      else if (isStart){st+='background:'+pc+';color:white;font-weight:700;cursor:pointer;border-radius:'+(s.endDate?'6px 0 0 6px':'6px')+';';}
      else if (isEnd){st+='background:'+pc+';color:white;font-weight:700;cursor:pointer;border-radius:0 6px 6px 0;';}
      else if (inRange){st+='background:'+pc+'25;color:#111827;cursor:pointer;border-radius:0;';}
      else{st+='color:#111827;cursor:pointer;'+(isToday?'font-weight:700;border-bottom:2px solid '+pc+';':'');}
      var dis=(isPast||isBooked)?'data-disabled="1"':'';
      html+='<div '+dis+' data-date="'+ds+'" style="'+st+'">'+day+'</div>';
    }
    html += '</div>';
    html += '<div style="display:flex;gap:12px;margin-top:8px;font-size:11px;color:#9ca3af;">'
      +'<span><span style="display:inline-block;width:10px;height:10px;background:#fee2e2;border-radius:2px;vertical-align:middle;margin-right:3px;"></span>Unavailable</span>'
      +'<span><span style="display:inline-block;width:10px;height:10px;background:'+pc+';border-radius:50%;vertical-align:middle;margin-right:3px;"></span>Selected</span>'
    +'</div>';
    el.innerHTML = html;
  };

  DP.pick = function(el) {
    if (el.getAttribute('data-disabled')) return;
    var ds = el.getAttribute('data-date'), s = DP.state;
    if (!s.startDate || (s.startDate && s.endDate) || ds < s.startDate) {
      s.startDate = ds; s.endDate = null;
    } else {
      s.endDate = ds;
      if (s.onSelect) s.onSelect(s.startDate, s.endDate);
    }
    DP.render();
  };

  DP.clearHover = function() { DP.state.hoverDate = null; DP.render(); };
  DP.prevMonth = function() { var s=DP.state; s.viewMonth--; if(s.viewMonth<0){s.viewMonth=11;s.viewYear--;} DP.render(); };
  DP.nextMonth = function() { var s=DP.state; s.viewMonth++; if(s.viewMonth>11){s.viewMonth=0;s.viewYear++;} DP.render(); };
})();
` + '\n</script>';
}

// ── Time options HTML ──────────────────────────────────────────────────────
const TIME_OPTIONS = [
  '8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM',
  '1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM',
].map(t => `<option>${t}</option>`).join('');

// ── Modal HTML ─────────────────────────────────────────────────────────────
function modalHtml(p: string): string {
  return `
  <div id="${p}RentalModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;align-items:center;justify-content:center;padding:1rem;">
    <div style="background:white;border-radius:0.875rem;max-width:520px;width:100%;max-height:92vh;overflow:hidden;box-shadow:0 24px 48px rgba(0,0,0,0.35);display:flex;flex-direction:column;">

      <!-- Header -->
      <div style="padding:1.125rem 1.5rem;border-bottom:1px solid #f1f1f1;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
        <div>
          <h3 id="${p}ModalTitle" style="font-size:1.125rem;font-weight:700;color:#111827;margin:0;line-height:1.2;"></h3>
          <div style="display:flex;gap:0.375rem;margin-top:0.375rem;">
            <span id="${p}Step1Dot" style="width:1.5rem;height:3px;border-radius:2px;background:#111827;"></span>
            <span id="${p}Step2Dot" style="width:1.5rem;height:3px;border-radius:2px;background:#e5e7eb;"></span>
            <span id="${p}Step3Dot" style="width:1.5rem;height:3px;border-radius:2px;background:#e5e7eb;"></span>
          </div>
        </div>
        <button type="button" onclick="${p}CloseRentalModal()" style="background:none;border:none;color:#9ca3af;cursor:pointer;font-size:1.375rem;line-height:1;padding:0.25rem;">&#x2715;</button>
      </div>

      <!-- Step 1: Date Picker -->
      <div id="${p}Step1" style="overflow-y:auto;padding:1.25rem 1.5rem;flex:1;">
        <input type="hidden" id="${p}StartDateVal">
        <input type="hidden" id="${p}EndDateVal">
        <div id="${p}DatePickerEl" style="margin-bottom:1rem;"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1rem;">
          <div>
            <label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Pickup Time</label>
            <select id="${p}PickupTime" style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;background:white;box-sizing:border-box;">
              <option value="">Select time</option>${TIME_OPTIONS}
            </select>
          </div>
          <div>
            <label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Return Time</label>
            <select id="${p}ReturnTime" style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;background:white;box-sizing:border-box;">
              <option value="">Select time</option>${TIME_OPTIONS}
            </select>
          </div>
        </div>
        <div id="${p}PricingSummary" style="display:none;background:#f9fafb;border-radius:0.5rem;padding:0.875rem;border:1px solid #e5e7eb;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span id="${p}DurationLbl" style="font-size:0.875rem;color:#6b7280;"></span>
            <span id="${p}TotalLbl" style="font-size:1.125rem;font-weight:700;color:#111827;"></span>
          </div>
        </div>
      </div>

      <!-- Step 1 Footer -->
      <div id="${p}Step1Footer" style="padding:1rem 1.5rem;border-top:1px solid #f1f1f1;flex-shrink:0;">
        <button type="button" id="${p}NextBtn" onclick="${p}GoStep2()" disabled
          style="width:100%;padding:0.75rem;background:#e5e7eb;color:#9ca3af;border:none;border-radius:0.5rem;font-weight:700;font-size:0.9375rem;cursor:not-allowed;">
          Continue to Contact Info →
        </button>
      </div>

      <!-- Step 2: Contact Info -->
      <div id="${p}Step2" style="display:none;overflow-y:auto;padding:1.25rem 1.5rem;flex:1;">
        <div id="${p}BookingSummary" style="background:#f9fafb;border-radius:0.5rem;padding:0.75rem 1rem;margin-bottom:1rem;border:1px solid #e5e7eb;font-size:0.875rem;color:#374151;"></div>
        <form id="${p}RentalForm">
          <input type="hidden" name="rentalItemId">
          <input type="hidden" name="rateAmount">
          <input type="hidden" name="hourlyRate">
          <input type="hidden" name="weeklyRate">
          <input type="hidden" name="monthlyRate">
          <input type="hidden" name="startDate">
          <input type="hidden" name="endDate">
          <input type="hidden" name="pickupTime">
          <input type="hidden" name="returnTime">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">
            <div><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Name *</label>
              <input type="text" name="customerName" required placeholder="Full name" style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;box-sizing:border-box;"></div>
            <div><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Phone *</label>
              <input type="tel" name="customerPhone" required placeholder="(555) 000-0000" style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;box-sizing:border-box;"></div>
          </div>
          <div style="margin-bottom:0.75rem;"><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Email *</label>
            <input type="email" name="customerEmail" required placeholder="you@email.com" style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;box-sizing:border-box;"></div>
          <div id="${p}DeliverySection" style="display:none;margin-bottom:0.75rem;">
            <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:0.875rem;font-weight:600;color:#374151;">
              <input type="checkbox" name="deliveryRequired" onchange="${p}ToggleDelivery(this)">Request Delivery
            </label>
          </div>
          <div id="${p}DeliveryAddr" style="display:none;margin-bottom:0.75rem;">
            <label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Delivery Address</label>
            <textarea name="deliveryAddress" rows="2" placeholder="Street address, city, state, zip" style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;resize:vertical;box-sizing:border-box;"></textarea>
          </div>
          <div><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Special Requests</label>
            <textarea name="notes" rows="2" placeholder="Any special requests..." style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;resize:vertical;box-sizing:border-box;"></textarea></div>
        </form>
      </div>

      <!-- Step 2 Footer -->
      <div id="${p}Step2Footer" style="display:none;padding:1rem 1.5rem;border-top:1px solid #f1f1f1;flex-shrink:0;">
        <div style="display:flex;gap:0.625rem;">
          <button type="button" onclick="${p}GoStep1()" style="padding:0.75rem 1rem;background:#f9fafb;color:#374151;border:1px solid #e5e7eb;border-radius:0.5rem;font-weight:600;font-size:0.875rem;cursor:pointer;">← Back</button>
          <button type="button" id="${p}ToStep3Btn" onclick="${p}GoStep3()" style="flex:1;padding:0.75rem;background:var(--color-primary);color:white;border:none;border-radius:0.5rem;font-weight:700;font-size:0.9375rem;cursor:pointer;">Continue →</button>
        </div>
      </div>

      <!-- Step 3: Deposit Payment -->
      <div id="${p}Step3" style="display:none;overflow-y:auto;padding:1.25rem 1.5rem;flex:1;">
        <div id="${p}DepositSummary" style="background:#f9fafb;border-radius:0.5rem;padding:0.75rem 1rem;margin-bottom:1rem;border:1px solid #e5e7eb;font-size:0.875rem;color:#374151;"></div>
        <div id="${p}StripeElements" style="margin-bottom:1rem;"></div>
        <div id="${p}PaymentError" style="display:none;color:#dc2626;font-size:0.875rem;margin-bottom:0.75rem;padding:0.625rem;background:#fef2f2;border-radius:0.375rem;"></div>
      </div>

      <!-- Step 3 Footer -->
      <div id="${p}Step3Footer" style="display:none;padding:1rem 1.5rem;border-top:1px solid #f1f1f1;flex-shrink:0;">
        <div style="display:flex;gap:0.625rem;">
          <button type="button" onclick="${p}GoStep2()" style="padding:0.75rem 1rem;background:#f9fafb;color:#374151;border:1px solid #e5e7eb;border-radius:0.5rem;font-weight:600;font-size:0.875rem;cursor:pointer;">← Back</button>
          <button type="button" id="${p}PayBtn" onclick="${p}ConfirmPayment()" style="flex:1;padding:0.75rem;background:var(--color-primary);color:white;border:none;border-radius:0.5rem;font-weight:700;font-size:0.9375rem;cursor:pointer;">Pay Deposit & Confirm</button>
        </div>
      </div>

    </div>
  </div>`;
}

// ── Modal JS ───────────────────────────────────────────────────────────────
function modalScript(p: string, siteId: string): string {
  return `
  <script>
  (function() {

  var ${p}RentalState = {
    itemId: '', dailyRate: 0, hourlyRate: 0, weeklyRate: 0, monthlyRate: 0,
    deliveryAvailable: false, primaryColor: 'var(--color-primary)',
    depositAmount: 0, stripeClientSecret: null, paymentIntentId: null, stripeElements: null, stripeInstance: null
  };

  var ${p}ParseTime = function(t) {
    var m = t.match(/(\\d+):(\\d+)\\s*(AM|PM)/i);
    if (!m) return null;
    var h=parseInt(m[1]),mn=parseInt(m[2]),mer=m[3].toUpperCase();
    if(mer==='PM'&&h!==12)h+=12; if(mer==='AM'&&h===12)h=0;
    return h+mn/60;
  };

  function ${p}CalcTotal() {
    var s = document.getElementById('${p}StartDateVal').value;
    var e = document.getElementById('${p}EndDateVal').value;
    var st = ${p}RentalState;
    if (!s || !e) { document.getElementById('${p}PricingSummary').style.display='none'; return; }
    var days = Math.ceil((new Date(e) - new Date(s)) / 86400000) + 1;
    if (days <= 0) return;
    var total, label;
    var pickup = document.getElementById('${p}PickupTime').value;
    var ret    = document.getElementById('${p}ReturnTime').value;
    // Hourly (same-day, < 4hrs)
    if (days === 1 && st.hourlyRate && pickup && ret) {
      var pHr = ${p}ParseTime(pickup), rHr = ${p}ParseTime(ret);
      if (pHr !== null && rHr !== null && rHr > pHr) {
        var dur = rHr - pHr;
        if (dur < 4) { total=(dur*st.hourlyRate).toFixed(2); label=dur.toFixed(1)+' hr @ $'+st.hourlyRate+'/hr'; }
        else          { total=st.dailyRate.toFixed(2); label='1 day @ $'+st.dailyRate+'/day'; }
      }
    }
    if (!total) {
      // Monthly blended
      if (days >= 28 && st.monthlyRate) {
        var fullMo=Math.max(1,Math.floor(days/30)), remDays=days-fullMo*30;
        var remWk=(remDays>=7&&st.weeklyRate)?Math.floor(remDays/7):0, leftDays=remDays-remWk*7;
        total=(fullMo*st.monthlyRate+remWk*(st.weeklyRate||0)+leftDays*(st.dailyRate||0)).toFixed(2);
        label=fullMo+' mo'+(remWk?' + '+remWk+' wk':'')+(leftDays?' + '+leftDays+' day'+(leftDays>1?'s':''):'');
      }
      // Weekly blended
      else if (days >= 7 && st.weeklyRate) {
        var fullWk=Math.floor(days/7), leftDays=days-fullWk*7;
        total=(fullWk*st.weeklyRate+leftDays*(st.dailyRate||0)).toFixed(2);
        label=fullWk+' wk'+(leftDays?' + '+leftDays+' day'+(leftDays>1?'s':''):'');
      }
      // Daily
      else if (st.dailyRate) {
        total=(days*st.dailyRate).toFixed(2);
        label=days+' day'+(days>1?'s':'')+' @ $'+st.dailyRate+'/day';
      }
      else { return; }
    }
    document.getElementById('${p}DurationLbl').textContent = label;
    document.getElementById('${p}TotalLbl').textContent = '$' + total;
    document.getElementById('${p}PricingSummary').style.display = 'block';
    var btn = document.getElementById('${p}NextBtn');
    btn.disabled=false; btn.style.background='var(--color-primary)'; btn.style.color='white'; btn.style.cursor='pointer';
  }

  function ${p}OpenRentalModal(itemId, itemTitle, dailyRate, deliveryAvailable, hourlyRate, weeklyRate, monthlyRate, depositAmount) {
    var st = ${p}RentalState;
    st.itemId=itemId; st.dailyRate=dailyRate||0; st.hourlyRate=hourlyRate||0;
    st.weeklyRate=weeklyRate||0; st.monthlyRate=monthlyRate||0; st.deliveryAvailable=!!deliveryAvailable;
    st.depositAmount=depositAmount||0; st.stripeClientSecret=null; st.paymentIntentId=null;
    document.getElementById('${p}ModalTitle').textContent = itemTitle;
    document.getElementById('${p}StartDateVal').value = '';
    document.getElementById('${p}EndDateVal').value = '';
    document.getElementById('${p}PickupTime').value = '';
    document.getElementById('${p}ReturnTime').value = '';
    document.getElementById('${p}PricingSummary').style.display = 'none';
    // Reset step 2 in case a previous booking left the success message there
    var step2 = document.getElementById('${p}Step2');
    if (step2) step2.innerHTML = '<div id="${p}BookingSummary" style="background:#f9fafb;border-radius:0.5rem;padding:0.75rem 1rem;margin-bottom:1rem;border:1px solid #e5e7eb;font-size:0.875rem;color:#374151;"></div>'
      + '<form id="${p}RentalForm">'
      + '<input type="hidden" name="rentalItemId"><input type="hidden" name="rateAmount">'
      + '<input type="hidden" name="hourlyRate"><input type="hidden" name="weeklyRate">'
      + '<input type="hidden" name="monthlyRate"><input type="hidden" name="startDate">'
      + '<input type="hidden" name="endDate"><input type="hidden" name="pickupTime">'
      + '<input type="hidden" name="returnTime">'
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:0.75rem;">'
      + '<div><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Name *</label><input type="text" name="customerName" required placeholder="Full name" style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;box-sizing:border-box;"></div>'
      + '<div><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Phone *</label><input type="tel" name="customerPhone" required placeholder="(555) 000-0000" style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;box-sizing:border-box;"></div>'
      + '</div>'
      + '<div style="margin-bottom:0.75rem;"><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Email *</label><input type="email" name="customerEmail" required placeholder="you@email.com" style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;box-sizing:border-box;"></div>'
      + '<div id="${p}DeliverySection" style="display:none;margin-bottom:0.75rem;"><label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;font-size:0.875rem;font-weight:600;color:#374151;"><input type="checkbox" name="deliveryRequired" onchange="${p}ToggleDelivery(this)">Request Delivery</label></div>'
      + '<div id="${p}DeliveryAddr" style="display:none;margin-bottom:0.75rem;"><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Delivery Address</label><textarea name="deliveryAddress" rows="2" placeholder="Street address, city, state, zip" style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;resize:vertical;box-sizing:border-box;"></textarea></div>'
      + '<div><label style="display:block;font-size:0.8125rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">Special Requests</label><textarea name="notes" rows="2" placeholder="Any special requests..." style="width:100%;padding:0.5rem 0.625rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;resize:vertical;box-sizing:border-box;"></textarea></div>'
      + '</form>';
    var btn = document.getElementById('${p}NextBtn');
    btn.disabled=true; btn.style.background='#e5e7eb'; btn.style.color='#9ca3af'; btn.style.cursor='not-allowed';
    ${p}GoStep1();
    document.getElementById('${p}RentalModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    var pc = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#1e3a6e';
    fmRentalDatePicker.init('${p}DatePickerEl', '${siteId}', itemId, function(start, end) {
      document.getElementById('${p}StartDateVal').value = start;
      document.getElementById('${p}EndDateVal').value = end;
      ${p}CalcTotal();
    }, pc);
    document.getElementById('${p}PickupTime').onchange = ${p}CalcTotal;
    document.getElementById('${p}ReturnTime').onchange = ${p}CalcTotal;
  }

  function ${p}GoStep1() {
    document.getElementById('${p}Step1').style.display = 'block';
    document.getElementById('${p}Step1Footer').style.display = 'block';
    document.getElementById('${p}Step2').style.display = 'none';
    document.getElementById('${p}Step2Footer').style.display = 'none';
    document.getElementById('${p}Step1Dot').style.background = '#111827';
    document.getElementById('${p}Step2Dot').style.background = '#e5e7eb';
  }

  function ${p}GoStep2() {
    var s = document.getElementById('${p}StartDateVal').value;
    var e = document.getElementById('${p}EndDateVal').value;
    if (!s || !e) { alert('Please select your rental dates first.'); return; }
    var sd = new Date(s), ed = new Date(e);
    var total = document.getElementById('${p}TotalLbl').textContent;
    var pickup = document.getElementById('${p}PickupTime').value;
    var summary = sd.toLocaleDateString('en-US',{month:'short',day:'numeric'}) + ' → ' + ed.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    if (pickup) summary += ' · ' + pickup;
    summary += ' &nbsp;·&nbsp; ' + total;
    document.getElementById('${p}BookingSummary').innerHTML = '<strong>' + document.getElementById('${p}ModalTitle').textContent + '</strong><br><span style="color:#6b7280;">' + summary + '</span>';
    document.getElementById('${p}DeliverySection').style.display = ${p}RentalState.deliveryAvailable ? 'block' : 'none';
    document.getElementById('${p}DeliveryAddr').style.display = 'none';
    document.getElementById('${p}Step1').style.display = 'none';
    document.getElementById('${p}Step1Footer').style.display = 'none';
    document.getElementById('${p}Step2').style.display = 'block';
    document.getElementById('${p}Step2Footer').style.display = 'flex';
    // Update continue button label
    var toStep3Btn = document.getElementById('${p}ToStep3Btn');
    if (toStep3Btn) toStep3Btn.textContent = ${p}RentalState.depositAmount > 0 ? 'Continue to Payment →' : 'Submit Request →';
    document.getElementById('${p}Step1Dot').style.background = '#e5e7eb';
    document.getElementById('${p}Step2Dot').style.background = '#111827';
    document.getElementById('${p}Step3Dot').style.background = '#e5e7eb';
  }

  function ${p}CloseRentalModal() {
    document.getElementById('${p}RentalModal').style.display = 'none';
    document.body.style.overflow = '';
  }

  function ${p}ToggleDelivery(cb) {
    document.getElementById('${p}DeliveryAddr').style.display = cb.checked ? 'block' : 'none';
  }

  function ${p}SubmitRental(paymentIntentId) {
    var form = document.getElementById('${p}RentalForm');
    var name  = form.querySelector('[name="customerName"]').value.trim();
    var email = form.querySelector('[name="customerEmail"]').value.trim();
    var phone = form.querySelector('[name="customerPhone"]').value.trim();
    if (!name || !email || !phone) { alert('Please fill in your name, email, and phone.'); return; }
    var st = ${p}RentalState;
    form.querySelector('[name="rentalItemId"]').value  = st.itemId;
    form.querySelector('[name="rateAmount"]').value    = st.dailyRate;
    form.querySelector('[name="hourlyRate"]').value    = st.hourlyRate;
    form.querySelector('[name="weeklyRate"]').value    = st.weeklyRate;
    form.querySelector('[name="monthlyRate"]').value   = st.monthlyRate;
    form.querySelector('[name="startDate"]').value     = document.getElementById('${p}StartDateVal').value;
    form.querySelector('[name="endDate"]').value       = document.getElementById('${p}EndDateVal').value;
    form.querySelector('[name="pickupTime"]').value    = document.getElementById('${p}PickupTime').value;
    form.querySelector('[name="returnTime"]').value    = document.getElementById('${p}ReturnTime').value;
    var btn = document.getElementById('${p}SubmitBtn');
    btn.textContent = 'Submitting...'; btn.disabled = true;
    var fd = new FormData(form), data = {};
    fd.forEach(function(v,k){ data[k]=v; });
    data.siteId = '${siteId}';
    data.totalAmount = document.getElementById('${p}TotalLbl') ? document.getElementById('${p}TotalLbl').textContent.replace('$','') : '0';
    if (paymentIntentId) { data.paymentIntentId = paymentIntentId; data.depositAmount = ${p}RentalState.depositAmount; }
    fetch('/api/rental/book/${siteId}', {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data)
    })
    .then(function(r){ return r.json(); })
    .then(function(res){
      if (res.error) { alert(res.error); btn.textContent='Submit Request'; btn.disabled=false; }
      else {
        var pc = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#1e3a6e';
        document.getElementById('${p}Step2').innerHTML = '<div style="text-align:center;padding:3rem 1.5rem;">'
          + '<div style="width:4rem;height:4rem;background:'+pc+';border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">'
          + '<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'28\\' height=\\'28\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'white\\' stroke-width=\\'2.5\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'>'
          + '<path d=\\'M20 6 9 17l-5-5\\'/></svg></div>'
          + '<h3 style=\\'color:'+pc+';font-size:1.375rem;font-weight:700;margin-bottom:0.75rem;\\'>Request Submitted!</h3>'
          + '<p style=\\'color:#6b7280;\\'>We will contact you to confirm your booking within 1 business day.</p></div>';
        document.getElementById('${p}Step2Footer').style.display = 'none';
      }
    })
    .catch(function(){ alert('Something went wrong. Please try again.'); btn.textContent='Submit Request'; btn.disabled=false; });
  }

  function ${p}GoStep2FromStep3() {
    document.getElementById('${p}Step3').style.display = 'none';
    document.getElementById('${p}Step3Footer').style.display = 'none';
    document.getElementById('${p}Step2').style.display = 'block';
    document.getElementById('${p}Step2Footer').style.display = 'flex';
    document.getElementById('${p}Step2Dot').style.background = '#111827';
    document.getElementById('${p}Step3Dot').style.background = '#e5e7eb';
  }

  function ${p}GoStep3() {
    var form = document.getElementById('${p}RentalForm');
    var name  = form.querySelector('[name="customerName"]').value.trim();
    var email = form.querySelector('[name="customerEmail"]').value.trim();
    var phone = form.querySelector('[name="customerPhone"]').value.trim();
    if (!name || !email || !phone) { alert('Please fill in your name, email, and phone.'); return; }
    var st = ${p}RentalState;
    // If no deposit required, submit directly
    if (!st.depositAmount || st.depositAmount <= 0) { ${p}SubmitRental(null); return; }
    // Show step 3
    document.getElementById('${p}Step2').style.display = 'none';
    document.getElementById('${p}Step2Footer').style.display = 'none';
    document.getElementById('${p}Step3').style.display = 'block';
    document.getElementById('${p}Step3Footer').style.display = 'flex';
    document.getElementById('${p}Step2Dot').style.background = '#e5e7eb';
    document.getElementById('${p}Step3Dot').style.background = '#111827';
    // Update back button in step 3 to go back to step 2
    var step3Footer = document.getElementById('${p}Step3Footer');
    if (step3Footer) {
      var backBtn = step3Footer.querySelector('button');
      if (backBtn) backBtn.onclick = ${p}GoStep2FromStep3;
    }
    // Set deposit summary
    document.getElementById('${p}DepositSummary').innerHTML =
      '<strong>Deposit Required</strong><br>'
      + '<span style="color:#6b7280;">A $' + st.depositAmount.toFixed(2) + ' deposit is required to confirm your reservation.</span>';
    // Load Stripe and create payment intent
    var stripeEl = document.getElementById('${p}StripeElements');
    stripeEl.innerHTML = '<div style="text-align:center;padding:1rem;color:#6b7280;font-size:0.875rem;">Loading payment form...</div>';
    fetch('/api/rental/create-payment-intent/${siteId}', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ rentalItemId: st.itemId, depositAmount: st.depositAmount })
    })
    .then(function(r){ return r.json(); })
    .then(function(res){
      if (res.error) {
        stripeEl.innerHTML = '<div style="color:#dc2626;padding:0.75rem;background:#fef2f2;border-radius:0.375rem;">'+res.error+'</div>';
        return;
      }
      st.stripeClientSecret = res.clientSecret;
      st.paymentIntentId = res.paymentIntentId;
      // Load Stripe.js dynamically
      if (!window.Stripe) {
        var s = document.createElement('script');
        s.src = 'https://js.stripe.com/v3/';
        s.onload = function() { ${p}MountStripeElements(res.clientSecret); };
        document.head.appendChild(s);
      } else {
        ${p}MountStripeElements(res.clientSecret);
      }
    })
    .catch(function(){ stripeEl.innerHTML = '<div style="color:#dc2626;padding:0.75rem;">Failed to load payment form. Please try again.</div>'; });
  }

  function ${p}MountStripeElements(clientSecret) {
    var st = ${p}RentalState;
    var stripe = window.Stripe('${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""}');
    st.stripeInstance = stripe;
    var elements = stripe.elements({ clientSecret: clientSecret, appearance: { theme: 'stripe', variables: { colorPrimary: st.primaryColor } } });
    st.stripeElements = elements;
    var paymentEl = elements.create('payment');
    document.getElementById('${p}StripeElements').innerHTML = '';
    paymentEl.mount('#${p}StripeElements');
  }

  function ${p}ConfirmPayment() {
    var st = ${p}RentalState;
    var btn = document.getElementById('${p}PayBtn');
    if (!st.stripeInstance || !st.stripeElements) { alert('Payment form not ready. Please wait.'); return; }
    btn.textContent = 'Processing...'; btn.disabled = true;
    st.stripeInstance.confirmPayment({
      elements: st.stripeElements,
      redirect: 'if_required',
    })
    .then(function(result){
      if (result.error) {
        document.getElementById('${p}PaymentError').textContent = result.error.message;
        document.getElementById('${p}PaymentError').style.display = 'block';
        btn.textContent = 'Pay Deposit & Confirm'; btn.disabled = false;
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        ${p}SubmitRental(result.paymentIntent.id);
      }
    });
  }

  window.${p}OpenRentalModal  = ${p}OpenRentalModal;
  window.${p}CloseRentalModal = ${p}CloseRentalModal;
  window.${p}GoStep1          = ${p}GoStep1;
  window.${p}GoStep2          = ${p}GoStep2;
  window.${p}GoStep3          = ${p}GoStep3;
  window.${p}ConfirmPayment   = ${p}ConfirmPayment;
  window.${p}GoStep2FromStep3 = ${p}GoStep2FromStep3;
  window.${p}CalcTotal        = ${p}CalcTotal;
  window.${p}ToggleDelivery   = ${p}ToggleDelivery;
  window.${p}SubmitRental     = ${p}SubmitRental;

  })();
  </script>`;
}

// ── Main export ────────────────────────────────────────────────────────────
// Returns complete rental block: datepicker script + modal HTML + modal JS
// Drop this into any template's page assembly before </body>
export function rentalModalBlock(
  prefix: 'gv' | 'fm',
  siteId: string,
): string {
  return datepickerScript() + modalHtml(prefix) + modalScript(prefix, siteId);
}
