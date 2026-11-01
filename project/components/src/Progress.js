/* The `type` names; the older `variant` hues map onto them. */
var PROGRESS_TYPES = ['default', 'secondary', 'success', 'warning', 'error'];
var PROGRESS_LEGACY = { blue: 'success', amber: 'warning', red: 'error', green: 'green' };

/* `colors` maps thresholds to colours: the highest threshold at or below the value wins. */
function progressColor(colors, value) {
  if (!colors) return undefined;
  var keys = Object.keys(colors).map(Number).filter(function (k) { return !isNaN(k); }).sort(function (a, b) { return a - b; });
  var pick;
  keys.forEach(function (k) { if (value >= k) pick = colors[k]; });
  return pick === undefined && keys.length ? colors[keys[0]] : pick;
}

/* A segment's tone, as StatusDot's states: success, info, warning, error, neutral. */
var PROGRESS_TONES = ['success', 'info', 'warning', 'error', 'neutral'];

/* Segment spacing in px: the gap between neighbours with `gap`, and the narrowest a segment above zero may be. */
var SEGMENT_GAP = 2;
var SEGMENT_MIN = 2;

function Progress(props) {
  var max = props.max || 100;
  var segmented = Array.isArray(props.segments);
  var value = Math.max(0, Math.min(max, Number(props.value) || 0));
  var pct = value / max;
  var id = useId();
  var type = PROGRESS_TYPES.indexOf(props.type) >= 0 ? props.type : (PROGRESS_LEGACY[props.variant] || 'default');
  var fmt = useMemo(function () {
    try { return new Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 0 }); } catch (e) { return { format: function (n) { return Math.round(n * 100) + '%'; } }; }
  }, []);
  var color = progressColor(props.colors, value);
  var height = props.height !== undefined ? props.height : 10;
  var stops = (props.stops || []).filter(function (s) { return s && s.value > 0 && s.value < max; });

  /* Segments are drawn in order and cut off at max; the run is as wide as what is filled. */
  var runs = [], filled = 0;
  if (segmented) props.segments.forEach(function (s) {
    var v = Math.min(Math.max(0, Number(s && s.value) || 0), max - filled);
    if (v <= 0) return;
    filled += v;
    runs.push({ value: v, tone: PROGRESS_TONES.indexOf(s.tone) >= 0 ? s.tone : 'neutral' });
  });
  /* Every segment is at least SEGMENT_MIN wide; with gap, neighbours are SEGMENT_GAP apart. Shrinking takes the space from the others. */
  var gapPx = props.gap ? SEGMENT_GAP : 0;
  var runMin = runs.length * SEGMENT_MIN + Math.max(0, runs.length - 1) * gapPx;

  var named = { 'aria-labelledby': props.label ? id : undefined, 'aria-label': props.label ? undefined : (props['aria-label'] || 'Progress') };
  var track = segmented ?
    h('div', Object.assign({ className: 'hy-progress__track', role: 'img' }, named),
      runs.length ? h('div', { className: cx('hy-progress__run', props.gap && 'has-gap'), style: { width: (filled / max * 100) + '%', minWidth: runMin } },
        runs.map(function (r, i) {
          return h('span', { key: i, className: cx('hy-progress__segment', 'hy-progress__segment--' + r.tone), style: { flexBasis: (r.value / filled * 100) + '%', minWidth: SEGMENT_MIN, marginLeft: gapPx && i > 0 ? gapPx : undefined } });
        })) : null) :
    h('div', Object.assign({
      className: 'hy-progress__track', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-valuenow': value,
      'aria-valuetext': fmt.format(pct)
    }, named),
      h('span', { className: 'hy-progress__fill', style: { transform: 'translateX(' + ((pct - 1) * 100) + '%)', background: color } }));

  var bar = h('div', { className: 'hy-progress__bar', style: { height: height } },
    track,
    stops.map(function (s, i) {
      var left = (s.value / max * 100) + '%';
      var mark = h('span', { className: 'hy-progress__divider', style: { left: left }, 'aria-hidden': 'true' });
      if (!s.tooltip) return h(React.Fragment, { key: i }, mark);
      var name = s.ariaLabel || (typeof s.tooltip === 'string' ? s.tooltip : 'Stop at ' + s.value);
      return h(React.Fragment, { key: i }, mark,
        h('span', { className: 'hy-progress__stop', style: { left: left } },
          h(HY.Tooltip, { text: s.tooltip, position: 'top' },
            h('button', { type: 'button', className: 'hy-progress__trigger', 'aria-label': name }))));
    }));

  return h('div', { className: cx('hy-progress', 'hy-progress--' + type, props.className), style: Object.assign(props.width !== undefined ? { width: props.width } : {}, props.style) },
    props.label ? h('div', { className: 'hy-progress__head' },
      h('span', { id: id, className: 'hy-progress__label' }, props.label),
      segmented ? null : h('span', { className: 'hy-progress__value' }, fmt.format(pct))) : null,
    bar);
}

define('Progress', Progress);
