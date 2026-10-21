/* Geist's sizes: box px, bar count, bar width and height, cycle ms. */
var SPINNER_SIZES = {
  sm: [12, 8, 3, 1.5, 1000], md: [16, 10, 4, 1.5, 1000], lg: [20, 12, 5, 2, 1200], xl: [24, 12, 6, 2.5, 1200],
  '2xl': [32, 15, 8, 2.5, 1200], '3xl': [40, 15, 10, 3, 1200], '4xl': [56, 18, 14, 3.5, 1300]
};
var SPINNER_ORDER = ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'];

/* A numeric size (the older API, still used by Button) takes the nearest named size and scales it. */
function spinnerSpec(size) {
  if (typeof size !== 'number') return { spec: SPINNER_SIZES[size] || SPINNER_SIZES.md, scale: 1 };
  var best = 'md';
  SPINNER_ORDER.forEach(function (k) { if (Math.abs(SPINNER_SIZES[k][0] - size) < Math.abs(SPINNER_SIZES[best][0] - size)) best = k; });
  return { spec: SPINNER_SIZES[best], scale: size / SPINNER_SIZES[best][0] };
}

function Spinner(props) {
  var s = spinnerSpec(props.size);
  var box = s.spec[0] * s.scale, n = s.spec[1], w = s.spec[2] * s.scale, ht = s.spec[3] * s.scale, dur = s.spec[4];
  var bars = [];
  for (var i = 0; i < n; i++) {
    bars.push(h('span', { key: i, style: {
      width: w, height: ht, marginLeft: -w / 2, marginTop: -ht / 2,
      transform: 'rotate(' + (i * 360 / n) + 'deg) translate(146%)',
      animationDuration: dur + 'ms', animationDelay: Math.round(-dur + (i + 1) * dur / n) + 'ms'
    } }));
  }
  var name = props.label || props['aria-label'];
  return h('span', {
    className: cx('hy-spinner', props.className), style: Object.assign({ width: box, height: box }, props.style),
    role: name ? 'status' : undefined, 'aria-label': name || undefined, 'aria-hidden': name ? undefined : 'true'
  }, bars);
}

define('Spinner', Spinner);
