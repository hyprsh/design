/* Labelled horizontal bars for ranking amounts: one row per item, in the order given, scaled to `max` or the largest value.
   The bar is decorative (aria-hidden): each row reads "label, value unit". An item with `href` is a link, and with `onOpen`
   a button (a link that also calls `onOpen`). With `columns` the list is an ARIA table with a header row and extra figures
   per row, and narrows by hiding extra columns in `priority` order. One series, so no legend. The pure parts (blHiddenKeys)
   are module-private functions: tests read them from the vm context. */
var BL_COL = 88, BL_GAP = 12, BL_BASE = 320;

/* The keys of the extra columns that don't fit in `width` px, hidden one by one until the rest do: the largest `priority`
   number first, ties from the right, and a column without a `priority` before any column with one. The label, bar and
   value never hide. A width of 0 (not measured yet) hides nothing. */
function blHiddenKeys(columns, width) {
  var hidden = {};
  if (!(width > 0)) return hidden;
  var order = columns.map(function (c, i) {
    return { key: c.key, i: i, p: typeof c.priority === 'number' && isFinite(c.priority) ? c.priority : Infinity };
  }).sort(function (a, b) { return a.p !== b.p ? (a.p > b.p ? -1 : 1) : b.i - a.i; });
  var shown = columns.length;
  for (var n = 0; n < order.length && BL_BASE + shown * (BL_COL + BL_GAP) > width; n++) {
    hidden[order[n].key] = true;
    shown--;
  }
  return hidden;
}

function BarList(props) {
  var warned = useRef(false);
  if (!warned.current && !props['aria-label'] && !props['aria-labelledby']) {
    warned.current = true;
    var prod = false;
    try { prod = process.env.NODE_ENV === 'production'; } catch (e) { /* no process: not a production build */ }
    if (!prod && typeof console !== 'undefined') console.warn('hyprsh: BarList needs an accessible name. Pass aria-label or aria-labelledby.');
  }
  var items = props.items || [];
  var cols = props.columns && props.columns.length ? props.columns : null;
  var listRef = useRef(null);
  var widthState = useState(0), width = widthState[0], setWidth = widthState[1];
  useLayoutEffect(function () {
    var el = listRef.current;
    if (!el || !cols) return;
    function measure() { setWidth(el.clientWidth); }
    measure();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', measure); return function () { window.removeEventListener('resize', measure); }; }
    var ro = new ResizeObserver(measure);
    ro.observe(el);
    return function () { ro.disconnect(); };
  }, [!!cols, items.length > 0]);
  if (!items.length) return props.empty === undefined ? null : props.empty;
  var scaleMax = props.max;
  if (typeof scaleMax !== 'number' || !(scaleMax > 0)) {
    scaleMax = 0;
    items.forEach(function (it) { if (it.value > scaleMax) scaleMax = it.value; });
  }
  var format = props.valueFormatter || new Intl.NumberFormat().format;
  var rest = omit(props, ['items', 'max', 'valueFormatter', 'unit', 'mono', 'empty', 'className', 'columns', 'labelHeader', 'valueHeader', 'onOpen']);
  function fillOf(it) {
    var pct = it.value > 0 && scaleMax > 0 ? Math.min(100, it.value / scaleMax * 100) : 0;
    return pct > 0 ? h('span', { className: 'hy-bar-list__fill', style: { width: pct + '%', minWidth: '2px' } }) : null;
  }
  /* A link (it also calls onOpen, with the click event, so an app can preventDefault) or a button; else null. */
  function opener(it, attrs, children) {
    if (props.onOpen) attrs.onClick = function (e) { props.onOpen(it, e); };
    if (it.href !== undefined) return h('a', Object.assign({ href: it.href }, attrs), children);
    if (props.onOpen) return h('button', Object.assign({ type: 'button' }, attrs), children);
    return null;
  }

  if (cols) {
    var hiddenKeys = blHiddenKeys(cols, width);
    var shown = cols.filter(function (c) { return !hiddenKeys[c.key]; }).length;
    var template = 'minmax(0, 1fr) minmax(0, 2fr)' + (shown ? ' repeat(' + shown + ', ' + BL_COL + 'px)' : '');
    var cell = function (c, role, content, extra) {
      return h('div', { key: c.key, role: role, className: cx('hy-bar-list__cell', 'hy-bar-list__cell--figure', hiddenKeys[c.key] && 'is-hidden', extra) }, content);
    };
    return h('div', Object.assign({}, rest, {
      ref: listRef, className: cx('hy-bar-list', 'hy-bar-list--table', props.mono && 'hy-bar-list--mono', props.className),
      role: 'table', style: Object.assign({ '--hy-bar-list-cols': template }, props.style)
    }),
      h('div', { role: 'row', className: 'hy-bar-list__head' },
        h('div', { role: 'columnheader', className: 'hy-bar-list__cell' }, props.labelHeader !== undefined ? props.labelHeader : 'Label'),
        h('div', { role: 'columnheader', className: 'hy-bar-list__cell hy-bar-list__cell--value' }, props.valueHeader !== undefined ? props.valueHeader : 'Value'),
        cols.map(function (c) { return cell(c, 'columnheader', c.label); })),
      items.map(function (it) {
        var label = h('span', { className: 'hy-bar-list__label', title: it.label }, it.label);
        var target = opener(it, { className: 'hy-bar-list__target' }, label);
        return h('div', { key: it.key || it.label, role: 'row', className: cx('hy-bar-list__item', 'hy-bar-list__row', target && 'hy-bar-list__row--open') },
          h('div', { role: 'cell', className: 'hy-bar-list__cell' }, target || label),
          h('div', { role: 'cell', className: 'hy-bar-list__cell hy-bar-list__cell--value' },
            h('span', { className: 'hy-bar-list__bar', 'aria-hidden': 'true' }, fillOf(it)),
            h('span', { className: 'hy-bar-list__value' }, format(it.value), props.unit ? h('span', { className: 'hy-sr' }, ' ' + props.unit) : null)),
          cols.map(function (c) { return cell(c, 'cell', it.columns ? it.columns[c.key] : null); }));
      }));
  }

  return h('ul', Object.assign({}, rest, { className: cx('hy-bar-list', props.mono && 'hy-bar-list--mono', props.className), role: 'list' }),
    items.map(function (it) {
      var inner = [
        h('span', { key: 'l', className: 'hy-bar-list__label', title: it.label }, it.label),
        h('span', { key: 'a', className: 'hy-sr' }, ', '),
        h('span', { key: 'b', className: 'hy-bar-list__bar', 'aria-hidden': 'true' }, fillOf(it)),
        h('span', { key: 'v', className: 'hy-bar-list__value' }, format(it.value),
          props.unit ? h('span', { className: 'hy-sr' }, ' ' + props.unit) : null)
      ];
      var open = opener(it, { className: 'hy-bar-list__row hy-bar-list__row--link' + (it.href === undefined ? ' hy-bar-list__row--button' : '') }, inner);
      return h('li', { key: it.key || it.label, className: 'hy-bar-list__item' },
        open || h('div', { className: 'hy-bar-list__row' }, inner));
    }));
}

define('BarList', BarList);
