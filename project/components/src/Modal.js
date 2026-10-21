/* Modal: Geist's compound API (Modal + ModalBody/Header/Title/Subtitle/Inset/Actions/Action)
   plus the original shorthand props (open/onClose/title/description/actions). */
var ModalCtx = React.createContext(null);

function ModalBody(props) {
  return h('div', Object.assign({}, omit(props, ['className', 'children']), { className: cx('hy-modal__body', props.className) }), props.children);
}
function ModalHeader(props) {
  return h('header', { className: cx('hy-modal__header', props.className) }, props.children);
}
function ModalTitle(props) {
  var ctx = React.useContext(ModalCtx);
  return h('h2', { id: ctx ? ctx.titleId : undefined, className: cx('hy-modal__title', props.className) }, props.children);
}
function ModalSubtitle(props) {
  var ctx = React.useContext(ModalCtx);
  return h('div', { id: ctx ? ctx.descId : undefined, className: cx('hy-modal__desc', props.className) }, props.children);
}
function ModalInset(props) {
  return h('div', { className: cx('hy-modal__inset', props.last && 'hy-modal__inset--last', props.className) }, props.children);
}
function ModalActions(props) {
  return h('footer', { className: cx('hy-modal__actions', props.className) }, props.children);
}
var ModalAction = React.forwardRef(function ModalAction(props, ref) {
  var rest = omit(props, ['fullWidth', 'className']);
  return h(HY.Button, Object.assign({ variant: 'primary', size: 'small' }, rest, {
    ref: ref, className: cx(props.fullWidth && 'hy-modal__action--full', props.className)
  }));
});

var MODAL_PARTS = [ModalBody, ModalActions];
function isModalPart(node) {
  var found = false;
  /* Looks through wrapper elements such as <form> and fragments too. */
  React.Children.forEach(node, function (c) {
    if (found || !c || !c.type) return;
    if (MODAL_PARTS.indexOf(c.type) >= 0) found = true;
    else if ((typeof c.type === 'string' || c.type === React.Fragment) && c.props) found = isModalPart(c.props.children);
  });
  return found;
}

function Modal(props) {
  var box = useRef(null);
  var tid = useId();
  var did = useId();
  var open = !!(props.active !== undefined ? props.active : props.open);
  var onEscape = props.onClose || props.onClickOutside;
  var onOutside = props.onClickOutside || props.onClose;
  useOverlayFocus(open, box, props.initialFocusRef || props.initialFocus);
  useScrollLock(open && !props.inline);
  useLayoutEffect(function () {
    var el = box.current;
    if (!open || !el) return;
    if (document.getElementById(tid)) el.setAttribute('aria-labelledby', tid); else el.removeAttribute('aria-labelledby');
    if (document.getElementById(did)) el.setAttribute('aria-describedby', did); else el.removeAttribute('aria-describedby');
  });
  if (!open) return null;
  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); if (onEscape) onEscape(); }
    trapTab(e, box.current);
  }
  var legacy = props.title || props.description || props.actions || !isModalPart(props.children);
  var content = legacy ? [
    h(ModalBody, { key: 'b' },
      props.title || props.description ? h(ModalHeader, null,
        props.title ? h(ModalTitle, null, props.title) : null,
        props.description ? h(ModalSubtitle, null, props.description) : null) : null,
      props.children),
    props.actions ? h(ModalActions, { key: 'a' }, props.actions) : null
  ] : props.children;
  var size = props.size === 'small' ? 'hy-modal--small' : props.size === 'large' ? 'hy-modal--large' : null;
  var node = h(ModalCtx.Provider, { value: { titleId: tid, descId: did } },
    h('div', { className: 'hy-overlay hy-modal-overlay', onMouseDown: function (e) { if (e.target === e.currentTarget && onOutside) onOutside(); } },
      h('div', {
        ref: box, role: props.alert ? 'alertdialog' : 'dialog', 'aria-modal': 'true', 'aria-label': props['aria-label'], tabIndex: -1,
        className: cx('hy-modal', size, props.sticky && 'hy-modal--sticky', props.className), onKeyDown: onKey
      }, content)));
  return props.inline ? node : portal(node);
}

Modal.Body = ModalBody;
Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Subtitle = ModalSubtitle;
Modal.Inset = ModalInset;
Modal.Actions = ModalActions;
Modal.Action = ModalAction;

define('ModalBody', ModalBody);
define('ModalHeader', ModalHeader);
define('ModalTitle', ModalTitle);
define('ModalSubtitle', ModalSubtitle);
define('ModalInset', ModalInset);
define('ModalActions', ModalActions);
define('ModalAction', ModalAction);
define('Modal', Modal);
