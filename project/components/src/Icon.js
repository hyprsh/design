/* Lucide paths drawn on Geist's grid: 16px by default with a 1.5px stroke at any size. */
function Icon(props) {
  var size = props.size || 16;
  var markup = ICONS[props.name];
  if (!markup) return null;
  var label = props['aria-label'] || props.label;
  return h('svg', {
    className: cx('hy-icon', props.className), width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: props.color || 'currentColor', strokeWidth: (props.strokeWidth || 1.5) * 24 / size,
    strokeLinecap: 'round', strokeLinejoin: 'round', focusable: 'false', style: props.style,
    role: label ? 'img' : undefined, 'aria-label': label || undefined, 'aria-hidden': label ? undefined : 'true',
    dangerouslySetInnerHTML: { __html: markup }
  });
}
Icon.names = Object.keys(ICONS);

define('Icon', Icon);
