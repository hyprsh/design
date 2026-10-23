/* Lucide paths drawn at 16px by default with a 1.5px stroke at any size. */
function Icon(props) {
  var size = props.size || 16;
  var label = props['aria-label'] || props.label;
  /* An icon component, such as one from lucide-react, drawn with the same size and constant stroke. */
  if (props.icon) return h(props.icon, {
    className: cx('hy-icon', props.className), size: size, color: props.color || 'currentColor',
    strokeWidth: props.strokeWidth || 1.5, absoluteStrokeWidth: true, focusable: 'false', style: props.style,
    role: label ? 'img' : undefined, 'aria-label': label || undefined, 'aria-hidden': label ? undefined : 'true'
  });
  var markup = ICONS[props.name];
  if (!markup) return null;
  return h('svg', {
    className: cx('hy-icon', props.className), width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: props.color || 'currentColor', strokeWidth: (props.strokeWidth || 1.5) * 24 / size,
    strokeLinecap: 'round', strokeLinejoin: 'round', focusable: 'false', style: props.style,
    role: label ? 'img' : undefined, 'aria-label': label || undefined, 'aria-hidden': label ? undefined : 'true',
    dangerouslySetInnerHTML: { __html: markup }
  });
}
Icon.names = Object.keys(ICONS);
/* Adds icons by name ({ 'git-branch': '<path …/>' }): the npm build ships only the icons the components use. */
Icon.register = function (map) { Object.assign(ICONS, map); Icon.names = Object.keys(ICONS); };

define('Icon', Icon);
