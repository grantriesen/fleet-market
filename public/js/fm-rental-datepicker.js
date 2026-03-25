// Fleet Market Rental Date Picker — put in /public/fm-rental-datepicker.js
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

    // Step boxes
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
        +'<div style="font-size:10px;font-weight:600;text-transform:uppercase;color:'+s1c+';">① Pick-up</div>'
        +'<div style="font-size:13px;font-weight:700;color:'+s1c+';margin-top:2px;">'+s1lbl+'</div>'
      +'</div>'
      +'<div style="padding:8px;border-radius:6px;background:'+s2bg+';border:'+s2bdr+';text-align:center;">'
        +'<div style="font-size:10px;font-weight:600;text-transform:uppercase;color:'+s2c+';">② Return</div>'
        +'<div style="font-size:13px;font-weight:700;color:'+s2c+';margin-top:2px;">'+s2lbl+'</div>'
      +'</div>'
    +'</div>';

    if (bothSet) {
      var days = Math.ceil((parseDate(s.endDate)-parseDate(s.startDate))/86400000)+1;
      html += '<div style="text-align:center;margin-bottom:8px;"><span style="padding:3px 12px;background:'+pc+'18;border-radius:20px;font-size:12px;font-weight:600;color:'+pc+';">'+days+' day'+(days>1?'s':'')+'</span></div>';
    }

    // Month nav
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
      +'<button type="button" onclick="fmRentalDatePicker.prevMonth()" style="background:none;border:1px solid #e5e7eb;border-radius:6px;width:28px;height:28px;cursor:pointer;font-size:16px;color:#374151;line-height:1;">&#8249;</button>'
      +'<span style="font-weight:700;font-size:14px;color:#111827;">'+MONTHS[s.viewMonth]+' '+s.viewYear+'</span>'
      +'<button type="button" onclick="fmRentalDatePicker.nextMonth()" style="background:none;border:1px solid #e5e7eb;border-radius:6px;width:28px;height:28px;cursor:pointer;font-size:16px;color:#374151;line-height:1;">&#8250;</button>'
    +'</div>';

    // Day headers
    html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:2px;">'
      + DAYS.map(function(d){return '<div style="text-align:center;font-size:11px;font-weight:600;color:#9ca3af;padding:2px 0;">'+d+'</div>';}).join('')
    +'</div>';

    // Cells
    html += '<div style="display:grid;grid-template-columns:repeat(7,1fr);" onmouseleave="fmRentalDatePicker.clearHover()">';
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
      var inHover=s.startDate&&!s.endDate&&s.hoverDate&&ds>=s.startDate&&ds<=s.hoverDate;
      var st='padding:2px;text-align:center;font-size:13px;line-height:28px;user-select:none;';
      if (isPast){st+='color:#d1d5db;cursor:not-allowed;';}
      else if (isBooked){st+='background:#fee2e2;color:#9ca3af;cursor:not-allowed;text-decoration:line-through;border-radius:4px;';}
      else if (isStart){st+='background:'+pc+';color:white;font-weight:700;cursor:pointer;border-radius:'+(s.endDate?'50% 0 0 50%':'50%')+';';}
      else if (isEnd){st+='background:'+pc+';color:white;font-weight:700;cursor:pointer;border-radius:0 50% 50% 0;';}
      else if (inRange){st+='background:'+pc+'25;color:#111827;cursor:pointer;border-radius:0;';}
      else if (inHover){st+='background:'+pc+'12;color:#374151;cursor:pointer;border-radius:0;';}
      else{st+='color:#111827;cursor:pointer;'+(isToday?'font-weight:700;border-bottom:2px solid '+pc+';':'');}
      var dis=(isPast||isBooked)?'data-disabled="1"':'';
      html+='<div '+dis+' data-date="'+ds+'" onclick="fmRentalDatePicker.pick(this)" onmouseover="fmRentalDatePicker.hover(this)" style="'+st+'">'+day+'</div>';
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

  DP.hover = function(el) {
    if (el.getAttribute('data-disabled')) return;
    var s = DP.state;
    if (s.startDate && !s.endDate) {
      var ds = el.getAttribute('data-date');
      if (ds >= s.startDate) { s.hoverDate = ds; DP.render(); }
    }
  };

  DP.clearHover = function() { DP.state.hoverDate = null; DP.render(); };
  DP.prevMonth = function() { var s=DP.state; s.viewMonth--; if(s.viewMonth<0){s.viewMonth=11;s.viewYear--;} DP.render(); };
  DP.nextMonth = function() { var s=DP.state; s.viewMonth++; if(s.viewMonth>11){s.viewMonth=0;s.viewYear++;} DP.render(); };
})();
