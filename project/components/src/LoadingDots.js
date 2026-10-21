var DOT_PX = { sm: 2, md: 3, lg: 4, small: 2, medium: 3, large: 4 };

/* Three pulsing dots for a short wait, optionally after a word (“Deploying”). */
function LoadingDots(props) {
  var px = typeof props.size === 'number' ? props.size : (DOT_PX[props.size] || 3);
  var dot = { width: px, height: px };
  return h('span', { className: cx('hy-dots', props.className), style: props.style, role: 'status', 'aria-live': 'polite' },
    props.children ? h('span', { className: 'hy-dots__text' }, props.children) : h('span', { className: 'hy-sr' }, props['aria-label'] || 'Loading'),
    h('span', { className: 'hy-dots__row', 'aria-hidden': 'true' },
      h('span', { className: 'hy-dots__dot', style: dot }),
      h('span', { className: 'hy-dots__dot', style: dot }),
      h('span', { className: 'hy-dots__dot', style: dot })));
}

define('LoadingDots', LoadingDots);
