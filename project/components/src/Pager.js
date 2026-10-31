/* Pager: previous / next buttons and a "51–100 of 240" range that change the page of a long set of results in place.
   Controlled only. The pure parts (range maths, label, announcement) hang off the component so tests can reach them. */

/* The range on screen for a page, or null when there is nothing to show. A page beyond the end shows the last page. */
function pagerRange(page, pageSize, total) {
  if (!(total > 0) || !(pageSize > 0)) return null;
  var lastPage = Math.max(1, Math.ceil(total / pageSize));
  var p = Math.floor(page);
  if (!(p >= 1)) p = 1;
  if (p > lastPage) p = lastPage;
  return {
    page: p, lastPage: lastPage,
    first: (p - 1) * pageSize + 1, last: Math.min(p * pageSize, total), total: total,
    paged: total > pageSize,
    prevDisabled: p <= 1, nextDisabled: p >= lastPage
  };
}

function pagerLabel(r, fmt) {
  return fmt.format(r.first) + '–' + fmt.format(r.last) + ' of ' + fmt.format(r.total);
}

/* The announcement after a render: silent on the first one, "Showing …" when the shown page changes, otherwise unchanged,
   so a new total alone never re-announces. `prev` is the previous result ({ page, text }) or null. */
function pagerLive(prev, r, fmt) {
  if (!r) return prev || { page: null, text: '' };
  if (!prev) return { page: r.page, text: '' };
  if (prev.page === r.page) return prev;
  return { page: r.page, text: 'Showing ' + pagerLabel(r, fmt) };
}

function Pager(props) {
  var fmt = useMemo(function () {
    try { return new Intl.NumberFormat(undefined); } catch (e) { return { format: function (n) { return String(n); } }; }
  }, []);
  var live = useRef(null);
  var r = pagerRange(props.page, props.pageSize, props.total);
  live.current = pagerLive(live.current, r, fmt);
  if (!r) return null;

  var busy = !!props.loading;
  function go(delta) { return function () { props.onPageChange(r.page + delta); }; }
  return h('nav', { 'aria-label': props['aria-label'] || 'Pages', className: cx('hy-pager', props.className), style: props.style },
    h('span', { className: 'hy-pager__range', 'aria-hidden': 'true' }, pagerLabel(r, fmt)),
    r.paged ? h('div', { className: 'hy-pager__buttons' },
      h(HY.Button, { variant: 'tertiary', size: 'small', svgOnly: true, 'aria-label': 'Previous Page', disabled: busy || r.prevDisabled, onClick: go(-1) },
        h(HY.Icon, { name: 'chevron-left' })),
      h(HY.Button, { variant: 'tertiary', size: 'small', svgOnly: true, 'aria-label': 'Next Page', disabled: busy || r.nextDisabled, onClick: go(1) },
        h(HY.Icon, { name: 'chevron-right' }))) : null,
    h('div', { className: 'hy-sr', 'aria-live': 'polite', 'aria-atomic': 'true' }, live.current.text));
}

Pager.range = pagerRange;
Pager.label = pagerLabel;
Pager.live = pagerLive;

define('Pager', Pager);
