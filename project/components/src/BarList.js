/* Labelled horizontal bars for ranking amounts: one row per item, in the order given, scaled to `max` or the largest value.
   The bar is decorative (aria-hidden): each row reads "label, value unit". An item with `href` is a link, and with `onOpen`
   a button (a link that also calls `onOpen`). With `columns` the list is a native table with a header row and extra figures
   per row, and narrows by hiding extra columns in `priority` order. One series, so no legend. The pure parts (blHiddenKeys)
   are module-private functions: tests read them from the vm context. */
/* How narrow a table list may get. The label, bar and value need BL_MIN_CORE px between them (a 120px label, a bar of at
   least 80px and a 80px value, with their gaps and padding). Extra columns size to their content, so each is budgeted
   BL_COL_ESTIMATE px: a typical figure with its gap. */
var BL_MIN_CORE = 320, BL_COL_ESTIMATE = 100;

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
  for (var n = 0; n < order.length && BL_MIN_CORE + shown * BL_COL_ESTIMATE > width; n++) {
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
    var figure = function (c, tag, content, extra) {
      return h(tag, Object.assign({ key: c.key, className: cx('hy-bar-list__cell', 'hy-bar-list__cell--figure', hiddenKeys[c.key] && 'is-hidden') }, extra), content);
    };
    return h('table', Object.assign({}, rest, {
      ref: listRef, className: cx('hy-bar-list', 'hy-bar-list--table', props.mono && 'hy-bar-list--mono', props.className)
    }),
      h('thead', null, h('tr', { className: 'hy-bar-list__head' },
        h('th', { scope: 'col', className: 'hy-bar-list__cell hy-bar-list__cell--label' }, props.labelHeader !== undefined ? props.labelHeader : 'Label'),
        h('th', { scope: 'col', className: 'hy-bar-list__cell hy-bar-list__cell--value' }, props.valueHeader !== undefined ? props.valueHeader : 'Value'),
        cols.map(function (c) { return figure(c, 'th', c.label, { scope: 'col' }); }))),
      h('tbody', null, items.map(function (it) {
        var label = h('span', { className: 'hy-bar-list__label', title: it.label }, it.label);
        var target = opener(it, { className: 'hy-bar-list__target' }, label);
        return h('tr', { key: it.key || it.label, className: cx('hy-bar-list__item', 'hy-bar-list__tr', target && 'hy-bar-list__tr--open') },
          h('th', { scope: 'row', className: 'hy-bar-list__cell hy-bar-list__cell--label' }, target || label),
          h('td', { className: 'hy-bar-list__cell hy-bar-list__cell--value' }, h('div', { className: 'hy-bar-list__valuebox' },
            h('span', { className: 'hy-bar-list__bar', 'aria-hidden': 'true' }, fillOf(it)),
            h('span', { className: 'hy-bar-list__value' }, format(it.value), props.unit ? h('span', { className: 'hy-sr' }, ' ' + props.unit) : null))),
          cols.map(function (c) { return figure(c, 'td', it.columns ? it.columns[c.key] : null); }));
      })));
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
