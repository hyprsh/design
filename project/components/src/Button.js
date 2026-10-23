/* The `variant` values plus our older names. 'default' and 'primary' are the same solid fill. */
var BTN_VARIANTS = ['default', 'primary', 'secondary', 'tertiary', 'error', 'warning'];
var BTN_SIZES = ['tiny', 'small', 'medium', 'large'];

/* `type` is a visual variant when it names one (the older API) and the HTML type otherwise; `typeName` is always the HTML type. */
function btnVariant(props) {
  var v = props.variant || (BTN_VARIANTS.indexOf(props.type) >= 0 ? props.type : null) || 'secondary';
  return v === 'default' ? 'primary' : v;
}
function btnHtmlType(props) {
  if (props.typeName) return props.typeName;
  if (props.type && BTN_VARIANTS.indexOf(props.type) < 0) return props.type;
  return 'button';
}

var BTN_OWN = ['variant', 'size', 'shape', 'shadow', 'loading', 'prefix', 'suffix', 'svgOnly', 'className', 'children', 'disabled', 'type', 'typeName', 'href', 'width', 'style'];

function renderButton(props, ref, asLink) {
  var variant = btnVariant(props);
  var size = BTN_SIZES.indexOf(props.size) >= 0 ? props.size : 'medium';
  var loading = !!props.loading;
  var disabled = !!props.disabled || loading;
  var shape = props.shape;
  var rest = omit(props, BTN_OWN);
  var style = props.width !== undefined ? Object.assign({ width: props.width }, props.style) : props.style;
  var className = cx('hy-btn', 'hy-btn--' + variant, 'hy-btn--' + size,
    shape === 'rounded' && 'hy-btn--rounded', shape === 'circle' && 'hy-btn--circle',
    props.shadow && 'hy-btn--shadow', props.svgOnly && 'hy-btn--icon', props.className);
  var lead = loading
    ? h('span', { className: 'hy-btn__affix' }, h(HY.Spinner, { size: size === 'tiny' ? 12 : 16 }))
    : (props.prefix ? h('span', { className: 'hy-btn__affix', 'aria-hidden': 'true' }, props.prefix) : null);
  var body = props.svgOnly ? (loading ? null : props.children) : h('span', { className: 'hy-btn__label' }, props.children);
  var tail = !loading && props.suffix ? h('span', { className: 'hy-btn__affix', 'aria-hidden': 'true' }, props.suffix) : null;
  var common = { ref: ref, className: className, style: style, 'aria-busy': loading || undefined };
  if (asLink) {
    /* A disabled link has no href, so it can't be followed or focused, and says so to assistive tech. */
    return h('a', Object.assign({}, rest, common, {
      href: disabled ? undefined : props.href,
      'aria-disabled': disabled || undefined,
      onClick: disabled ? function (e) { e.preventDefault(); } : rest.onClick
    }), lead, body, tail);
  }
  return h('button', Object.assign({}, rest, common, { type: btnHtmlType(props), disabled: disabled }), lead, body, tail);
}

/* Button forwards its ref (Menu focuses its trigger). With `href` it renders a link, like ButtonLink. */
var Button = React.forwardRef(function Button(props, ref) {
  return renderButton(props, ref, props.href !== undefined);
});
Button.displayName = 'Button';

/* ButtonLink: a link that looks like a Button. Same props, plus `href`. */
var ButtonLink = React.forwardRef(function ButtonLink(props, ref) {
  return renderButton(props, ref, true);
});
ButtonLink.displayName = 'ButtonLink';
Button.Link = ButtonLink;

define('Button', Button);
define('ButtonLink', ButtonLink);
