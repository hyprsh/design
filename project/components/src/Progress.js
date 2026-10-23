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

function Progress(props) {
  var max = props.max || 100;
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

  var bar = h('div', { className: 'hy-progress__bar', style: { height: height } },
    h('div', {
      className: 'hy-progress__track', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': max, 'aria-valuenow': value,
      'aria-valuetext': fmt.format(pct), 'aria-labelledby': props.label ? id : undefined, 'aria-label': props.label ? undefined : (props['aria-label'] || 'Progress')
    },
      h('span', { className: 'hy-progress__fill', style: { transform: 'translateX(' + ((pct - 1) * 100) + '%)', background: color } })),
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
      h('span', { className: 'hy-progress__value' }, fmt.format(pct))) : null,
    bar);
}

define('Progress', Progress);
