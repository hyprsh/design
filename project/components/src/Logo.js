/* Logo: the hyprsh delta starship, alone or with the wordmark.
   tone 'nebula' (default) fills the mark with the indigo → violet → pink gradient; 'mono' uses currentColor. */
var LOGO_PATH = 'M12 1.5 L22.5 20 L15 16.5 L12 22 L9 16.5 L1.5 20 Z M12 7 L10.7 12.5 L12 14.5 L13.3 12.5 Z';

function Logo(props) {
  var variant = props.variant === 'mark' || props.variant === 'wordmark' ? props.variant : 'lockup';
  var size = props.size || 24;
  var mono = props.tone === 'mono';
  var gid = 'hy-logo-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  var label = props['aria-label'] || 'hyprsh';
  var rest = omit(props, ['variant', 'size', 'tone', 'className', 'style', 'aria-label']);
  var mark = variant === 'wordmark' ? null : h('svg', { className: 'hy-logo__mark', viewBox: '0 0 24 24', width: size, height: size, 'aria-hidden': 'true', focusable: 'false' },
    mono ? null : h('defs', null, h('linearGradient', { id: gid, x1: '0', y1: '0', x2: '1', y2: '1' },
      h('stop', { offset: '0', style: { stopColor: 'var(--nebula-start)' } }),
      h('stop', { offset: '0.5', style: { stopColor: 'var(--nebula-mid)' } }),
      h('stop', { offset: '1', style: { stopColor: 'var(--nebula-end)' } }))),
    h('path', { d: LOGO_PATH, fill: mono ? 'currentColor' : 'url(#' + gid + ')' }));
  var word = variant === 'mark' ? null : h('span', { className: 'hy-logo__word', 'aria-hidden': 'true' }, 'hyprsh');
  return h('span', Object.assign(rest, {
    role: 'img', 'aria-label': label,
    className: cx('hy-logo', 'hy-logo--' + variant, mono && 'hy-logo--mono', props.className),
    style: Object.assign({ '--hy-logo-size': size + 'px' }, props.style)
  }), mark, word);
}

define('Logo', Logo);
