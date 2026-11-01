/* Labelled horizontal bars for ranking amounts: one row per item, in the order given, scaled to `max` or the largest value.
   The bar is decorative (aria-hidden): each row reads "label, value unit". An item with `href` is a link. One series, so no legend. */
function BarList(props) {
  var warned = useRef(false);
  if (!warned.current && !props['aria-label'] && !props['aria-labelledby']) {
    warned.current = true;
    var prod = false;
    try { prod = process.env.NODE_ENV === 'production'; } catch (e) { /* no process: not a production build */ }
    if (!prod && typeof console !== 'undefined') console.warn('hyprsh: BarList needs an accessible name. Pass aria-label or aria-labelledby.');
  }
  var items = props.items || [];
  if (!items.length) return props.empty === undefined ? null : props.empty;
  var scaleMax = props.max;
  if (typeof scaleMax !== 'number' || !(scaleMax > 0)) {
    scaleMax = 0;
    items.forEach(function (it) { if (it.value > scaleMax) scaleMax = it.value; });
  }
  var format = props.valueFormatter || new Intl.NumberFormat().format;
  var rest = omit(props, ['items', 'max', 'valueFormatter', 'unit', 'mono', 'empty', 'className']);
  return h('ul', Object.assign({}, rest, { className: cx('hy-bar-list', props.mono && 'hy-bar-list--mono', props.className), role: 'list' }),
    items.map(function (it) {
      var pct = it.value > 0 && scaleMax > 0 ? Math.min(100, it.value / scaleMax * 100) : 0;
      var inner = [
        h('span', { key: 'l', className: 'hy-bar-list__label', title: it.label }, it.label),
        h('span', { key: 'a', className: 'hy-sr' }, ', '),
        h('span', { key: 'b', className: 'hy-bar-list__bar', 'aria-hidden': 'true' },
          pct > 0 ? h('span', { className: 'hy-bar-list__fill', style: { width: pct + '%', minWidth: '2px' } }) : null),
        h('span', { key: 'v', className: 'hy-bar-list__value' }, format(it.value),
          props.unit ? h('span', { className: 'hy-sr' }, ' ' + props.unit) : null)
      ];
      var link = it.href !== undefined;
      return h('li', { key: it.key || it.label, className: 'hy-bar-list__item' },
        link ? h('a', { className: 'hy-bar-list__row hy-bar-list__row--link', href: it.href }, inner)
          : h('div', { className: 'hy-bar-list__row' }, inner));
    }));
}

define('BarList', BarList);
