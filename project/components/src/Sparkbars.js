/* Sparkbars: one bar per run, oldest first. Height is the value, colour is the run's outcome (Progress segments' tones).
   The row is one Tab stop (a listbox driven with aria-activedescendant); the tooltip follows hover and focus. */
var SPARKBARS_TONES = ['success', 'info', 'warning', 'error', 'neutral'];
var SPARKBARS_STEP = 8; /* 6px bar + 2px gap */

/* "27 success, 2 warning, 1 error": counts per tone, in tone order, skipping tones with no runs. */
function sparkbarsSummary(runs) {
  var counts = {};
  runs.forEach(function (r) { counts[r.tone] = (counts[r.tone] || 0) + 1; });
  return SPARKBARS_TONES.filter(function (t) { return counts[t]; }).map(function (t) { return counts[t] + ' ' + t; }).join(', ');
}

/* The tooltip box, placed 8px above the bar. Keyed by run, so it is placed afresh whenever the emphasis moves. */
function SparkbarsTip(p) {
  var boxRef = useRef(null);
  var pos = useFloating(true, p.anchorRef, boxRef, { side: 'top', align: 'center', offset: 8 });
  return portal(h('span', {
    ref: boxRef, role: 'tooltip', className: 'hy-tooltip__box hy-tooltip__box--top hy-sparkbars__tip',
    style: floatingStyle(pos, { zIndex: 'var(--z-tooltip)', maxWidth: 'min(250px, calc(100vw - 16px))' })
  }, p.text));
}

function Sparkbars(props) {
  var runs = (props.runs || []).map(function (r) {
    return { value: Math.max(0, Number(r && r.value) || 0), tone: SPARKBARS_TONES.indexOf(r && r.tone) >= 0 ? r.tone : 'neutral', label: String((r && r.label) || '') };
  });
  var box = props.height !== undefined ? props.height : 24;
  var max = props.max;
  if (!(max > 0)) max = runs.reduce(function (m, r) { return Math.max(m, r.value); }, 0);
  var id = useId();
  var hoverSt = useState(-1), hover = hoverSt[0], setHover = hoverSt[1];
  var focusSt = useState(-1), focus = focusSt[0], setFocus = focusSt[1]; /* -1: the row does not have focus */
  var lastRef = useRef(0);
  var anchorRef = useRef(null);
  var count = runs.length;
  var active = hover >= 0 && hover < count ? hover : (focus >= 0 && focus < count ? focus : -1);

  function move(i) { i = Math.max(0, Math.min(count - 1, i)); lastRef.current = i; setFocus(i); }
  function onKeyDown(e) {
    if (!count || e.altKey || e.ctrlKey || e.metaKey) return;
    var cur = focus >= 0 ? focus : lastRef.current;
    var next = e.key === 'ArrowRight' ? cur + 1 : e.key === 'ArrowLeft' ? cur - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? count - 1 : null;
    if (next === null) return;
    e.preventDefault();
    setHover(-1);
    move(next);
  }
  /* Bars are 6px with a 2px gap, so the run under the pointer comes from its position: the gaps don't flicker. */
  function onMove(e) {
    var r = e.currentTarget.getBoundingClientRect();
    setHover(Math.max(0, Math.min(count - 1, Math.floor((e.clientX - r.left) / SPARKBARS_STEP))));
  }

  var name = props['aria-label'] ? props['aria-label'] + ': ' + sparkbarsSummary(runs) : sparkbarsSummary(runs);
  var bars = runs.map(function (r, i) {
    var ratio = max > 0 ? Math.min(1, r.value / max) : 0;
    return h('div', {
      key: i, id: id + '-' + i, role: 'option', 'aria-label': r.label, 'aria-selected': i === active ? 'true' : 'false',
      className: cx('hy-sparkbars__bar', 'hy-sparkbars__bar--' + r.tone, i === active && 'is-active'),
      style: { height: Math.max(4, ratio * box) },
      ref: i === active ? function (el) { anchorRef.current = el; } : undefined
    });
  });

  return h('div', {
    role: 'listbox', 'aria-orientation': 'horizontal', tabIndex: 0, 'aria-label': name,
    'aria-activedescendant': active >= 0 ? id + '-' + active : undefined,
    className: cx('hy-sparkbars', active >= 0 && 'has-active', props.className),
    style: Object.assign({ height: box }, props.style),
    onKeyDown: onKeyDown,
    onFocus: function () { if (focus < 0) setFocus(Math.min(lastRef.current, Math.max(0, count - 1))); },
    onBlur: function () { setFocus(-1); },
    onMouseMove: onMove, onMouseLeave: function () { setHover(-1); }, onClick: onMove
  }, bars, active >= 0 ? h(SparkbarsTip, { key: active, anchorRef: anchorRef, text: runs[active].label }) : null);
}

define('Sparkbars', Sparkbars);
