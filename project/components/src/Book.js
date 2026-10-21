function bookPx(v) { return typeof v === 'number' ? v + 'px' : v; }

function BookMark() {
  /* Default art for the simple variant: two interlocking rings in the text colour. */
  return h('svg', { className: 'hy-book__mark', viewBox: '0 0 40 40', fill: 'none', stroke: 'currentColor', strokeWidth: 2, 'aria-hidden': 'true', focusable: 'false' },
    h('circle', { cx: 15, cy: 20, r: 11 }),
    h('circle', { cx: 25, cy: 20, r: 11, opacity: 0.55 }));
}

function Book(props) {
  var variant = props.variant === 'simple' ? 'simple' : 'stripe';
  var w = props.width !== undefined ? props.width : 196;
  var o = w !== null && typeof w === 'object' ? w : { sm: w };
  var sm = o.sm !== undefined ? o.sm : (o.md !== undefined ? o.md : (o.lg !== undefined ? o.lg : 196));
  var md = o.md !== undefined ? o.md : sm;
  var lg = o.lg !== undefined ? o.lg : md;
  var style = Object.assign({ '--hy-book-w-sm': bookPx(sm), '--hy-book-w-md': bookPx(md), '--hy-book-w-lg': bookPx(lg) }, props.style);
  if (props.color) style['--hy-book-color'] = props.color;
  if (props.textColor) style['--hy-book-text'] = props.textColor;

  var title = h('span', { className: 'hy-book__title' }, props.title);
  var cover;
  if (variant === 'stripe') {
    cover = [
      h('div', { key: 'band', className: 'hy-book__band' },
        props.illustration ? h('div', { className: 'hy-book__art', 'aria-hidden': 'true' }, props.illustration) : null,
        h('span', { className: 'hy-book__bind', 'aria-hidden': 'true' })),
      h('div', { key: 'body', className: 'hy-book__body' },
        h('span', { className: 'hy-book__bind hy-book__bind--soft', 'aria-hidden': 'true' }),
        h('div', { className: 'hy-book__text' },
          title,
          h('span', { className: 'hy-book__icon', 'aria-hidden': 'true' },
            props.icon !== undefined ? props.icon : h(HY.Icon, { name: 'book-open', size: 16 }))))
    ];
  } else {
    cover = [
      h('span', { key: 'bind', className: 'hy-book__bind', 'aria-hidden': 'true' }),
      h('div', { key: 'text', className: 'hy-book__text' },
        title,
        h('div', { className: 'hy-book__art', 'aria-hidden': 'true' }, props.illustration !== undefined ? props.illustration : h(BookMark)))
    ];
  }

  return h('div', {
    className: cx('hy-book', 'hy-book--' + variant, props.textured && 'hy-book--textured', props.className),
    style: style
  },
    h('div', { className: 'hy-book__rotate' },
      h('div', { className: 'hy-book__cover' },
        cover,
        props.textured ? h('span', { className: 'hy-book__texture', 'aria-hidden': 'true' }) : null,
        h('span', { className: 'hy-book__sheen', 'aria-hidden': 'true' })),
      h('span', { className: 'hy-book__pages', 'aria-hidden': 'true' }),
      h('span', { className: 'hy-book__back', 'aria-hidden': 'true' })));
}

define('Book', Book);
