/* RelativeTimeCard: a relative timestamp whose hover card shows the absolute time in UTC and local time.
   Builds on HY.ContextCard. */
function rtcDate(v) { return v instanceof Date ? v : new Date(v); }
function rtcCap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

/* the short trigger form: 12s ago, 2m ago, 5h ago, Yesterday, 3d ago, then a date */
function rtcShort(date, now, locale) {
  var diff = (date.getTime() - now) / 1000;
  var abs = Math.abs(diff);
  var rtf = new Intl.RelativeTimeFormat(locale, { style: 'narrow', numeric: 'auto' });
  var sign = diff < 0 ? -1 : 1;
  if (abs < 45) return rtcCap(rtf.format(sign * Math.max(1, Math.round(abs)), 'second'));
  if (abs < 3600) return rtcCap(rtf.format(sign * Math.round(abs / 60), 'minute'));
  if (abs < 86400) return rtcCap(rtf.format(sign * Math.round(abs / 3600), 'hour'));
  if (abs < 7 * 86400) return rtcCap(rtf.format(sign * Math.round(abs / 86400), 'day'));
  var sameYear = date.getFullYear() === new Date(now).getFullYear();
  return new Intl.DateTimeFormat(locale, sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

/* the long form at the top of the card: 8 seconds ago, 3 hours ago */
function rtcLong(date, now, locale) {
  var diff = Math.round((date.getTime() - now) / 1000);
  var abs = Math.abs(diff);
  var rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always' });
  var units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1]];
  for (var i = 0; i < units.length; i++) {
    if (abs >= units[i][1] || units[i][0] === 'second') return rtcCap(rtf.format(Math.trunc(diff / units[i][1]), units[i][0]));
  }
}

function rtcRow(date, locale, timeZone) {
  var opts = timeZone ? { timeZone: timeZone } : {};
  var zone = timeZone === 'UTC' ? 'UTC' : (new Intl.DateTimeFormat(locale, { timeZoneName: 'short' }).formatToParts(date)
    .filter(function (p) { return p.type === 'timeZoneName'; }).map(function (p) { return p.value; })[0] || 'Local');
  var day = new Intl.DateTimeFormat(locale, Object.assign({ year: 'numeric', month: 'long', day: 'numeric' }, opts)).format(date);
  var time = new Intl.DateTimeFormat(locale, Object.assign({ hour: '2-digit', minute: '2-digit', second: '2-digit' }, opts)).format(date);
  return h('div', { key: zone, className: 'hy-rtc__row' },
    h('div', { className: 'hy-rtc__day' }, h('span', { className: 'hy-rtc__zone' }, zone), h('span', null, day)),
    h('span', { className: 'hy-rtc__time' }, time));
}

function RelativeTimeCard(props) {
  var date = rtcDate(props.date);
  var locale = props.locale;
  var nowSt = useState(Date.now());
  var openSt = useState(!!props.defaultOpen);
  var open = openSt[0];
  useEffect(function () {
    var t = setInterval(function () { nowSt[1](Date.now()); }, open ? 1000 : 30000);
    return function () { clearInterval(t); };
  }, [open]);
  var now = nowSt[0];
  var valid = !isNaN(date.getTime());
  var content = valid ? h('div', { className: 'hy-rtc' },
    h('span', { className: 'hy-rtc__ago' }, rtcLong(date, now, locale)),
    h('div', { className: 'hy-rtc__rows' }, rtcRow(date, locale, 'UTC'), rtcRow(date, locale))) : '—';
  var trigger = props.children !== undefined && props.children !== null ? props.children
    : h('time', { className: 'hy-rtc__trigger', tabIndex: 0, dateTime: valid ? date.toISOString() : undefined }, valid ? rtcShort(date, now, locale) : '—');
  return h(HY.ContextCard, {
    content: content, side: props.side || 'top', align: props.align, defaultOpen: props.defaultOpen, className: props.className,
    onOpenChange: function (o) { openSt[1](o); if (o) nowSt[1](Date.now()); }
  }, trigger);
}

define('RelativeTimeCard', RelativeTimeCard);
