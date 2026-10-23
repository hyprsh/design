/* Fieldset: a settings card. Content (title, subtitle, controls) over a gray footer with a status line and actions. */
var FieldsetCtx = React.createContext(null);

function FieldsetContent(props) {
  var ctx = React.useContext(FieldsetCtx);
  var box = useRef(null);
  var rest = omit(props, ['className', 'children', 'disabled']);
  useLayoutEffect(function () {
    var el = box.current;
    if (!el || !ctx) return;
    if (!props['aria-labelledby'] && !props['aria-label'] && document.getElementById(ctx.titleId)) el.setAttribute('aria-labelledby', ctx.titleId);
    if (!props['aria-describedby'] && document.getElementById(ctx.subtitleId)) el.setAttribute('aria-describedby', ctx.subtitleId);
  });
  return h('fieldset', Object.assign({}, rest, {
    ref: box,
    disabled: props.disabled,
    className: cx('hy-fieldset__content', props.disabled && 'hy-fieldset__content--disabled', props.className)
  }),
    props.children,
    props.disabled ? h('div', { className: 'hy-fieldset__wall', 'aria-hidden': 'true' }) : null
  );
}
function FieldsetTitle(props) {
  var ctx = React.useContext(FieldsetCtx);
  return h(props.as || 'h4', { id: props.id || (ctx ? ctx.titleId : undefined), className: cx('hy-fieldset__title', props.className) }, props.children);
}
function FieldsetSubtitle(props) {
  var ctx = React.useContext(FieldsetCtx);
  return h('div', { id: props.id || (ctx ? ctx.subtitleId : undefined), className: cx('hy-fieldset__subtitle', props.className) }, props.children);
}
function FieldsetFooter(props) {
  return h('div', { className: cx('hy-fieldset__footer', props.highlight && 'hy-fieldset__footer--highlight', props.className) }, props.children);
}
function FieldsetFooterStatus(props) {
  var ctx = React.useContext(FieldsetCtx);
  var type = ctx && ctx.type;
  return h('div', { className: cx('hy-fieldset__status', props.className) },
    type === 'error' || type === 'warning' ? h(Glyph, { name: type, size: 16, className: 'hy-fieldset__status-icon' }) : null,
    h('div', { className: 'hy-fieldset__status-text' }, props.children));
}
function FieldsetFooterActions(props) {
  return h('div', { className: cx('hy-fieldset__actions', props.className) }, props.children);
}
var FieldsetFooterAction = React.forwardRef(function FieldsetFooterAction(props, ref) {
  return h(HY.Button, Object.assign({ variant: 'primary', size: 'small' }, props, { ref: ref }));
});

function Fieldset(props) {
  var base = useId();
  var ctx = useMemo(function () { return { titleId: base + '-title', subtitleId: base + '-subtitle', type: props.type }; }, [base, props.type]);
  var rest = omit(props, ['className', 'children', 'type']);
  return h(FieldsetCtx.Provider, { value: ctx },
    h('div', Object.assign({}, rest, { className: cx('hy-fieldset', props.type && 'hy-fieldset--' + props.type, props.className) }), props.children));
}

FieldsetFooter.Status = FieldsetFooterStatus;
FieldsetFooter.Actions = FieldsetFooterActions;
FieldsetFooter.Action = FieldsetFooterAction;
Fieldset.Fieldset = Fieldset;
Fieldset.Content = FieldsetContent;
Fieldset.Title = FieldsetTitle;
Fieldset.Subtitle = FieldsetSubtitle;
Fieldset.Footer = FieldsetFooter;
Fieldset.FooterStatus = FieldsetFooterStatus;
Fieldset.FooterActions = FieldsetFooterActions;
Fieldset.FooterAction = FieldsetFooterAction;

define('FieldsetContent', FieldsetContent);
define('FieldsetTitle', FieldsetTitle);
define('FieldsetSubtitle', FieldsetSubtitle);
define('FieldsetFooter', FieldsetFooter);
define('FieldsetFooterStatus', FieldsetFooterStatus);
define('FieldsetFooterActions', FieldsetFooterActions);
define('FieldsetFooterAction', FieldsetFooterAction);
define('Fieldset', Fieldset);
