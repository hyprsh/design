/* Slider: pick a number (one thumb) or a range (two thumbs) on a track, with optional number fields.
   Each thumb is a native <input type="range">, so keyboard, screen-reader and form behaviour come for free;
   the visible rail, fill and thumbs are drawn on top and follow the inputs.
   Values may be a number or an array (Geist passes [50]); onValueChange returns the same shape. */
var SLIDER_HIT = 16; /* width of the native thumb hit area, in px */

function sliderSnap(v, min, max, step) {
  if (isNaN(v)) return min;
  var s = step > 0 ? Math.round((v - min) / step) * step + min : v;
  var dec = String(step).split('.')[1];
  if (dec) s = Number(s.toFixed(dec.length));
  return Math.min(max, Math.max(min, s));
}

function Slider(props) {
  var auto = useId();
  var id = props.id || auto;
  var min = props.min != null ? props.min : 0;
  var max = props.max != null ? props.max : 100;
  var step = props.step != null ? props.step : 1;
  var source = props.value !== undefined ? props.value : props.defaultValue;
  var asArray = Array.isArray(source);
  var st = useState(function () {
    var d = props.defaultValue !== undefined ? props.defaultValue : min;
    return Array.isArray(d) ? d.slice() : [d];
  });
  var values = props.value !== undefined ? (Array.isArray(props.value) ? props.value : [props.value]) : st[0];
  var latest = useRef(values);
  latest.current = values;
  var ds = useState({});
  var drafts = ds[0], setDrafts = ds[1];
  var range = values.length > 1;
  var label = props.label;
  var labelId = id + '-label';

  function emit(next) {
    if (props.value === undefined) st[1](next);
    latest.current = next;
    if (props.onValueChange) props.onValueChange(asArray ? next : next[0]);
    if (props.onChange) props.onChange(asArray ? next : next[0]);
  }
  function commit() {
    if (props.onValueCommitted) props.onValueCommitted(asArray ? latest.current : latest.current[0]);
  }
  function setAt(i, raw) {
    var v = sliderSnap(Number(raw), min, max, step);
    var next = values.slice();
    if (range) {
      if (i === 0) v = Math.min(v, next[1]);
      else v = Math.max(v, next[0]);
    }
    if (next[i] === v) return;
    next[i] = v;
    emit(next);
  }
  function pct(v) { return max === min ? 0 : (v - min) / (max - min) * 100; }
  function pos(v) {
    var p = pct(v);
    return 'calc(' + p + '% + ' + ((0.5 - p / 100) * SLIDER_HIT) + 'px)';
  }
  var lo = range ? values[0] : min;
  var hi = range ? values[values.length - 1] : values[0];
  var thumbNames = range ? ['Minimum', 'Maximum'] : [null];

  function numField(i, which) {
    var key = String(i);
    var shown = drafts[key] !== undefined ? drafts[key] : String(values[i]);
    function done() {
      if (drafts[key] === undefined) return;
      var n = drafts[key] === '' ? values[i] : Number(drafts[key]);
      setDrafts(omit(drafts, [key]));
      setAt(i, n);
      commit();
    }
    return h('input', {
      type: 'text', inputMode: 'decimal', className: 'hy-slider__num', value: shown, disabled: props.disabled,
      'aria-label': (label || props['aria-label'] || 'Value') + (range ? ' ' + thumbNames[i].toLowerCase() : ''),
      onChange: function (e) { var o = {}; o[key] = e.target.value; setDrafts(Object.assign({}, drafts, o)); },
      onBlur: done,
      onKeyDown: function (e) {
        if (e.key === 'Enter') { e.preventDefault(); done(); }
        else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          setAt(i, values[i] + (e.key === 'ArrowUp' ? step : -step) * (e.shiftKey ? 10 : 1));
          setDrafts(omit(drafts, [key]));
        }
      },
      'data-which': which
    });
  }

  return h('div', {
    className: cx('hy-slider', range && 'hy-slider--range', props.disabled && 'hy-slider--disabled', props.className),
    style: props.style
  },
    label ? h('div', { className: 'hy-slider__label', id: labelId }, label) : null,
    h('div', { className: 'hy-slider__row' },
      props.showStartInput ? numField(0, 'start') : null,
      h('div', { className: 'hy-slider__track', style: { width: props.width != null ? props.width : 216 } },
        h('span', { className: 'hy-slider__rail', 'aria-hidden': 'true' },
          h('span', { className: 'hy-slider__fill', style: { left: range ? pos(lo) : 0, right: 'calc(100% - ' + pos(hi) + ')' } })),
        values.map(function (v, i) {
          var valueText = props.formatValue ? props.formatValue(v) : String(v);
          return h(React.Fragment, { key: i },
            h('input', {
              type: 'range', className: 'hy-slider__range', id: i === 0 ? id : undefined,
              min: min, max: max, step: step, value: v, disabled: props.disabled,
              name: props.name ? (range ? props.name + '[' + i + ']' : props.name) : undefined,
              'aria-labelledby': label && !range ? labelId : undefined,
              'aria-label': range ? ((label || props['aria-label'] || 'Range') + ' ' + thumbNames[i].toLowerCase()) : (label ? undefined : props['aria-label']),
              'aria-valuetext': props.formatValue ? valueText : undefined,
              onChange: function (e) { setAt(i, e.target.value); },
              onPointerUp: commit,
              onKeyUp: function (e) { if (/Arrow|Page|Home|End/.test(e.key)) commit(); }
            }),
            h('span', { className: 'hy-slider__thumb', style: { left: pos(v) }, 'aria-hidden': 'true' }));
        })),
      props.showEndInput ? numField(values.length - 1, 'end') : null));
}

define('Slider', Slider);
