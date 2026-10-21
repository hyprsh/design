/* Avatars show an image you pass, initials, or a generated gradient shape: never a fetched photo. */
var AVATAR_PAIRS = [['blue-700', 'purple-700'], ['teal-700', 'blue-700'], ['pink-700', 'amber-700'], ['green-700', 'teal-700'], ['purple-700', 'pink-700'], ['amber-700', 'red-700'], ['blue-700', 'teal-700'], ['pink-700', 'purple-700']];
function avatarHash(s) {
  var n = 0;
  for (var i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(n);
}

function Avatar(props) {
  var size = props.size || 32;
  var name = props.title || props.username || props.name;
  var letter = props.letter ? String(props.letter).toUpperCase().slice(0, size < 24 ? 1 : 2) : null;
  var kind = props.src ? 'image' : letter ? 'letter' : props.placeholder ? 'placeholder' : 'shape';
  var style = Object.assign({ width: size, height: size }, props.style);
  if (kind === 'letter') style.fontSize = Math.max(12, Math.round(size * 0.375));
  if (kind === 'shape') {
    var pair = AVATAR_PAIRS[avatarHash(String(name || 'hyprsh')) % AVATAR_PAIRS.length];
    style.backgroundImage = 'linear-gradient(135deg, var(--' + pair[0] + '), var(--' + pair[1] + '))';
  }
  var hidden = props['aria-hidden'] === true || props['aria-hidden'] === 'true' || (kind === 'placeholder' && !name);
  var label = name || (letter ? 'Avatar with initials: ' + letter : 'Avatar');
  var rest = omit(props, ['size', 'title', 'username', 'name', 'letter', 'placeholder', 'src', 'alt', 'style', 'className', 'aria-hidden']);
  return h('span', Object.assign({}, rest, {
    className: cx('hy-avatar', 'hy-avatar--' + kind, props.className), style: style,
    role: hidden || kind === 'image' ? undefined : 'img', 'aria-label': hidden || kind === 'image' ? undefined : label,
    'aria-hidden': hidden ? 'true' : undefined, title: name || undefined
  }),
    kind === 'image' ? h('img', { src: props.src, alt: props.alt !== undefined ? props.alt : (name || ''), width: size, height: size, draggable: false }) : null,
    kind === 'letter' ? h('span', { 'aria-hidden': 'true' }, letter) : null);
}

function AvatarGroup(props) {
  var size = props.size || 32;
  var members = props.members || [];
  var limit = props.limit && props.limit < members.length ? props.limit : members.length;
  var shown = members.slice(0, limit);
  var more = members.length - limit;
  var overlap = props.overlap === undefined || props.overlap === 'auto' ? Math.round(size * 0.3125) : props.overlap;
  var count = shown.length + (more > 0 ? 1 : 0);
  var names = members.map(function (m) { return m.title || m.username || m.name || m.letter; }).filter(Boolean);
  var label = props['aria-label'] || (names.length ? names.slice(0, limit).join(', ') + (more > 0 ? ' and ' + more + ' more' : '') : members.length + ' members');
  function z(i) { return props.reverse ? i + 1 : count - i; }
  return h('div', { role: 'group', 'aria-label': label, className: cx('hy-avatar-group', props.className), style: Object.assign({ '--hy-avatar-overlap': overlap + 'px' }, props.style) },
    shown.map(function (m, i) {
      return h('span', { key: (m.username || m.title || m.letter || '') + i, className: 'hy-avatar-group__item', style: { zIndex: z(i) }, 'aria-hidden': 'true' },
        h(Avatar, Object.assign({}, m, { size: size })));
    }),
    more > 0 ? h('span', { className: 'hy-avatar-group__item', style: { zIndex: z(shown.length) }, 'aria-hidden': 'true' },
      h('span', { className: 'hy-avatar hy-avatar-group__more', style: { minWidth: size + Math.round(overlap / 2), height: size, fontSize: size < 32 ? 12 : 13 } }, '+' + more)) : null);
}

function AvatarWithIcon(props) {
  var size = props.size || 32;
  var badge = Math.max(14, Math.round(size * 0.5));
  return h('span', { className: cx('hy-avatar-icon', props.className), style: { width: size, height: size } },
    h(Avatar, omit(props, ['icon', 'iconBackground', 'className'])),
    h('span', { className: cx('hy-avatar-icon__badge', props.iconBackground && 'hy-avatar-icon__badge--bg'), style: { width: badge, height: badge }, 'aria-hidden': 'true' }, props.icon));
}

Avatar.Group = AvatarGroup;
Avatar.WithIcon = AvatarWithIcon;

define('Avatar', Avatar);
define('AvatarGroup', AvatarGroup);
define('AvatarWithIcon', AvatarWithIcon);
