/* Labelled horizontal bars for ranking amounts: one row per item, in the order given, scaled to `max` or the largest value.
   The bar is decorative (aria-hidden): each row reads "label, value unit". An item with `href` is a link, and with `onOpen`
   a button (a link that also calls `onOpen`). With `columns` the list is a native table with a header row and extra figures
   per row, and narrows by hiding extra columns in `priority` order (a `hideable: false` column stays), showing a hidden
   column's figures on a second line under the label. One series, so no legend. The pure parts (blHiddenKeys, blCore, blNeed)
   are module-private functions: tests read them from the vm context. */
/* How narrow a table list may get, from measured widths. The core (label, bar and value) needs a label of BL_LABEL_MIN px,
   a bar of BL_BAR_MIN px and the value's own width, with their gaps and padding. Each extra column needs its widest cell
   (header or figure) plus its padding. A column with `hideable: false` never hides: when the rest still don't fit, the
   bar narrows to BL_BAR_FLOOR px and then the label truncates further. Hideable columns hide earlier than that: before the
   label drops below its natural width (the widest label or header), capped at BL_LABEL_CAP px (see blLabelMin). */
var BL_LABEL_MIN = 80, BL_LABEL_CAP = 160, BL_BAR_MIN = 48, BL_BAR_FLOOR = 24;
/* Label cell padding (8 + 6), value cell padding (6 + 8), the gap between bar and value, and 2px of rounding slack. */
var BL_CORE_PAD = 14 + 14 + 12 + 2, BL_COL_PAD = 12;

/* The label width to reserve while deciding which hideable columns fit: the widest label's natural width, at least
   BL_LABEL_MIN and at most BL_LABEL_CAP. */
function blLabelMin(natural) { return Math.max(BL_LABEL_MIN, Math.min(BL_LABEL_CAP, Math.ceil(natural) || 0)); }

/* The width the core needs with a label of `label` px (default BL_LABEL_MIN) and a bar of `bar` px, given the value's own
   width `valueW`. */
function blCore(valueW, bar, label) { return BL_CORE_PAD + (label > 0 ? label : BL_LABEL_MIN) + bar + valueW; }

/* The width the core and the extra columns not in `hidden` need. `colWidths` maps a column key to its widest cell. */
function blNeed(columns, hidden, core, colWidths) {
  var need = core;
  columns.forEach(function (c) { if (!hidden[c.key]) need += (colWidths[c.key] || 0) + BL_COL_PAD; });
  return need;
}

/* The keys of the extra columns that don't fit in `width` px, hidden one by one until the rest do: the largest `priority`
   number first, ties from the right, and a column without a `priority` before any column with one. A column with
   `hideable: false` is skipped. `core` is blCore(...) and `colWidths` the measured widths. The label, bar and value never
   hide. A width of 0 or no measurement (not measured yet) hides nothing. */
function blHiddenKeys(columns, width, core, colWidths) {
  var hidden = {};
  if (!(width > 0) || !(core > 0)) return hidden;
  colWidths = colWidths || {};
  var order = columns.filter(function (c) { return c.hideable !== false; }).map(function (c) {
    return { key: c.key, i: columns.indexOf(c), p: typeof c.priority === 'number' && isFinite(c.priority) ? c.priority : Infinity };
  }).sort(function (a, b) { return a.p !== b.p ? (a.p > b.p ? -1 : 1) : b.i - a.i; });
  for (var n = 0; n < order.length && blNeed(columns, hidden, core, colWidths) > width; n++) hidden[order[n].key] = true;
  return hidden;
}

/* True when a figure is worth showing: not null, undefined, false or an empty string. */
function blHasFigure(f) { return f !== null && f !== undefined && f !== false && f !== ''; }

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
  var warnedFit = useRef(false);
  var measureState = useState({ width: 0, valueW: 0, labelW: 0, colWidths: {} }), m = measureState[0], setM = measureState[1];
  useLayoutEffect(function () {
    var el = listRef.current;
    if (!el || !cols) return;
    /* The list's width, the widest value, the widest label (natural width), and for each extra column its widest cell (header or figure): the natural width
       of the cell's content, which a hidden (collapsed) column still has. */
    function measure() {
      var valueW = 0, labelW = 0, colWidths = {};
      Array.prototype.forEach.call(el.querySelectorAll('.hy-bar-list__label, .hy-bar-list__labelhead'), function (l) { labelW = Math.max(labelW, l.offsetWidth); });
      Array.prototype.forEach.call(el.querySelectorAll('.hy-bar-list__value'), function (v) { valueW = Math.max(valueW, v.offsetWidth); });
      Array.prototype.forEach.call(el.querySelectorAll('.hy-bar-list__fig'), function (f) {
        var k = f.getAttribute('data-key');
        colWidths[k] = Math.max(colWidths[k] || 0, f.offsetWidth);
      });
      var next = { width: el.clientWidth, valueW: valueW, labelW: labelW, colWidths: colWidths };
      setM(function (prev) { return JSON.stringify(prev) === JSON.stringify(next) ? prev : next; });
    }
    measure();
    if (typeof ResizeObserver === 'undefined') { window.addEventListener('resize', measure); return function () { window.removeEventListener('resize', measure); }; }
    var ro = new ResizeObserver(measure);
    ro.observe(el);
    return function () { ro.disconnect(); };
  }, [!!cols, items.length > 0, items, props.columns, props.unit]);
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

  /* A click on a row outside its link or button (the bar, a figure) is passed on to it, with the same modifier keys. A click
     inside another control in a cell, or one that ends a text selection, is left alone. */
  function blOpenRow(e) {
    var target = e.currentTarget.querySelector('.hy-bar-list__target');
    if (!target || target.contains(e.target)) return;
    if (e.target.closest && e.target.closest('a, button, input, select, textarea, [role="button"]')) return;
    var sel = window.getSelection && window.getSelection();
    if (sel && !sel.isCollapsed && e.currentTarget.contains(sel.anchorNode)) return;
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window, button: e.button, ctrlKey: e.ctrlKey, metaKey: e.metaKey, shiftKey: e.shiftKey, altKey: e.altKey }));
  }

  if (cols) {
    var labelMin = blLabelMin(m.labelW);
    var core = m.valueW > 0 ? blCore(m.valueW, BL_BAR_MIN, labelMin) : 0;
    var hiddenKeys = blHiddenKeys(cols, m.width, core, m.colWidths);
    var hiddenCols = cols.filter(function (c) { return hiddenKeys[c.key]; });
    /* With every hideable column hidden the kept ones may not fit beside a natural-width label: the label falls back to its
       80px minimum. If they still don't fit, the bar narrows to its floor, then the label truncates. */
    var labelFits = core > 0 && blNeed(cols, hiddenKeys, core, m.colWidths) <= m.width;
    var labelReserve = labelFits ? labelMin : BL_LABEL_MIN;
    var core80 = m.valueW > 0 ? blCore(m.valueW, BL_BAR_MIN) : 0;
    var tight = core80 > 0 && !labelFits && blNeed(cols, hiddenKeys, core80, m.colWidths) > m.width;
    if (tight && !warnedFit.current && blNeed(cols, hiddenKeys, blCore(m.valueW, BL_BAR_FLOOR), m.colWidths) > m.width) {
      warnedFit.current = true;
      var prodFit = false;
      try { prodFit = process.env.NODE_ENV === 'production'; } catch (e) { /* no process: not a production build */ }
      if (!prodFit && typeof console !== 'undefined') console.warn('hyprsh: BarList columns with hideable: false do not fit in ' + m.width + 'px. The bar and label are squeezed; give the list more width or fewer kept columns.');
    }
    var figure = function (c, tag, content, extra) {
      return h(tag, Object.assign({ key: c.key, className: cx('hy-bar-list__cell', 'hy-bar-list__cell--figure', hiddenKeys[c.key] && 'is-hidden') }, extra),
        h('span', { className: 'hy-bar-list__fig', 'data-key': c.key }, content));
    };
    /* The second line under a row's label: its hidden figures in column order as "Label figure" pairs. */
    var subLine = function (it) {
      var parts = [];
      hiddenCols.forEach(function (c) {
        var f = it.columns ? it.columns[c.key] : null;
        if (!blHasFigure(f)) return;
        if (parts.length) parts.push(' \u00b7 ');
        parts.push(h('span', { key: c.key }, c.label + ' ', h('span', { className: 'hy-bar-list__subfig' }, f)));
      });
      return parts.length ? h('span', { className: 'hy-bar-list__sub', 'aria-hidden': 'true' }, parts) : null;
    };
    return h('table', Object.assign({}, rest, {
      ref: listRef, style: Object.assign({}, props.style, core > 0 ? { '--bl-label': labelReserve + 'px' } : null), className: cx('hy-bar-list', 'hy-bar-list--table', tight && 'is-tight', props.mono && 'hy-bar-list--mono', props.className)
    }),
      h('thead', null, h('tr', { className: 'hy-bar-list__head' },
        h('th', { scope: 'col', className: 'hy-bar-list__cell hy-bar-list__cell--label' }, h('span', { className: 'hy-bar-list__labelhead' }, props.labelHeader !== undefined ? props.labelHeader : 'Label')),
        h('th', { scope: 'col', className: 'hy-bar-list__cell hy-bar-list__cell--value' }, props.valueHeader !== undefined ? props.valueHeader : 'Value'),
        cols.map(function (c) { return figure(c, 'th', c.label, { scope: 'col' }); }))),
      h('tbody', null, items.map(function (it) {
        var label = h('span', { className: 'hy-bar-list__label', title: it.label }, it.label);
        var target = opener(it, { className: 'hy-bar-list__target' }, label);
        var sub = subLine(it);
        return h('tr', { key: it.key || it.label, className: cx('hy-bar-list__item', 'hy-bar-list__tr', target && 'hy-bar-list__tr--open', sub && 'hy-bar-list__tr--sub'), onClick: target ? blOpenRow : undefined },
          h('th', { scope: 'row', className: 'hy-bar-list__cell hy-bar-list__cell--label' }, target || label, sub),
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
