/* Pagination: previous / next links between pages in a sequence, such as docs or a guide. */
function PaginationLink(p) {
  var prev = p.dir === 'previous';
  var item = p.item;
  var word = prev ? 'Previous' : 'Next';
  return h('a', {
    href: item.href, onClick: item.onClick, rel: prev ? 'prev' : 'next',
    'aria-label': 'Go to ' + word.toLowerCase() + ' page: ' + (typeof item.title === 'string' ? item.title : ''),
    className: cx('hy-pagination__link', 'hy-pagination__link--' + (prev ? 'prev' : 'next'))
  },
    h('span', { className: 'hy-pagination__icon', 'aria-hidden': 'true' }, h(HY.Icon, { name: prev ? 'chevron-left' : 'chevron-right', size: 20 })),
    h('span', { className: 'hy-pagination__label' }, item.label || word),
    h('span', { className: 'hy-pagination__title' }, item.title));
}

function Pagination(props) {
  return h('nav', { 'aria-label': props['aria-label'] || 'Pagination', className: cx('hy-pagination', props.className), style: props.style },
    props.previous ? h(PaginationLink, { dir: 'previous', item: props.previous }) : h('span'),
    props.next ? h(PaginationLink, { dir: 'next', item: props.next }) : h('span'));
}

define('Pagination', Pagination);
