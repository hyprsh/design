var PILL_SIZE = { sm: 'small', md: 'medium', lg: 'large', small: 'small', medium: 'medium', large: 'large' };

/* A link styled like a Badge: lighter than a button. Renders <a> with href, <button> with onClick only.
   With pressed / defaultPressed / onPressedChange it is a toggle chip: a <button> with aria-pressed.
   It forwards its ref to the element it renders, so a Popover can use it as its trigger. status draws a leading StatusDot
   (statusLabel is its meaning, read as part of the name) and trailing a quieter figure after the label. */
var Pill = React.forwardRef(function Pill(props, ref) {
  var size = PILL_SIZE[props.size] || 'medium';
  var toggle = props.pressed !== undefined || props.defaultPressed !== undefined || !!props.onPressedChange;
  var pr = useControllable(props.pressed, !!props.defaultPressed, props.onPressedChange);
  var rest = omit(props, ['size', 'icon', 'status', 'statusLabel', 'trailing', 'children', 'className', 'pressed', 'defaultPressed', 'onPressedChange']);
  var tag = toggle ? 'button' : props.href ? 'a' : (props.onClick ? 'button' : 'span');
  if (tag === 'button' && !rest.type) rest.type = 'button';
  if (toggle) {
    rest['aria-pressed'] = pr[0];
    rest.onClick = function (e) {
      if (props.onClick) props.onClick(e);
      if (!e.defaultPrevented) pr[1](!pr[0]);
    };
  }
  var on = toggle && pr[0];
  var lead = props.icon || (on ? h(Glyph, { name: 'check', size: 14 }) : null);
  var named = !!props.statusLabel;
  var dot = props.status ? h('span', { className: 'hy-pill__status' },
    h(HY.StatusDot, { state: props.status, label: false, title: null, 'aria-hidden': named ? 'true' : undefined })) : null;
  if (ref) rest.ref = ref;
  return h(tag, Object.assign(rest, { className: cx('hy-pill', 'hy-pill--' + size, toggle && 'hy-pill--toggle', on && 'is-pressed', props.className) }),
    dot || (lead ? h('span', { className: 'hy-pill__icon', 'aria-hidden': 'true' }, lead) : null),
    h('span', { className: 'hy-pill__label' }, props.children),
    named ? h('span', { className: 'hy-sr' }, ', ' + props.statusLabel) : null,
    props.trailing != null && props.trailing !== false ? h('span', { className: 'hy-pill__trailing' }, props.trailing) : null);
});

define('Pill', Pill);
