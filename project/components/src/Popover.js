/* Popover: a click-opened floating panel with interactive content. Non-modal dialog: focus moves in and Tab stays
   inside, Escape or a click outside closes it, and Escape (or the content's close()) returns focus to the trigger.
   Placed with useFloating like Menu and Tooltip, so it flips and stays on screen. */
var POPOVER_SIDES = ['bottom', 'top', 'left', 'right'];
function popoverPosition(pos) {
  var parts = String(pos || 'bottom-start').split('-');
  return { side: POPOVER_SIDES.indexOf(parts[0]) >= 0 ? parts[0] : 'bottom', align: parts[1] === 'end' ? 'end' : parts[1] === 'center' ? 'center' : 'start' };
}

function Popover(props) {
  var c = useControllable(props.open, !!props.defaultOpen, props.onOpenChange);
  var open = c[0], setOpen = c[1];
  var triggerRef = useRef(null), boxRef = useRef(null);
  var id = useId();
  var where = popoverPosition(props.position);
  var pos = useFloating(open, triggerRef, boxRef, { side: where.side, align: where.align, offset: 8 });
  var placed = !!pos;

  function close(refocus) {
    setOpen(false);
    if (refocus && triggerRef.current && triggerRef.current.focus) triggerRef.current.focus({ preventScroll: true });
  }
  useDismiss(open, [triggerRef, boxRef], function (why) { close(why === 'escape'); });

  /* Move focus in once the box is placed and visible. */
  useLayoutEffect(function () {
    if (!placed) return;
    var root = boxRef.current;
    if (!root) return;
    var target = (props.initialFocusRef && props.initialFocusRef.current) || root.querySelector('[data-autofocus]') || root.querySelector(FOCUSABLE) || root;
    target.focus({ preventScroll: true });
  }, [placed]);

  function onKeyDown(e) {
    if (e.key === 'Escape') { e.stopPropagation(); close(true); return; }
    if (e.key === 'Tab') e.stopPropagation();
    trapTab(e, boxRef.current);
  }
  function toggle() { open ? close(false) : setOpen(true); }

  var trigger = props.trigger;
  if (!React.isValidElement(trigger)) trigger = h(HY.Button, { variant: 'secondary' }, trigger);
  var own = trigger.ref;
  var triggerNode = React.cloneElement(trigger, {
    ref: function (el) {
      triggerRef.current = el;
      if (typeof own === 'function') own(el); else if (own) own.current = el;
    },
    'aria-haspopup': 'dialog', 'aria-expanded': open, 'aria-controls': open ? id : undefined,
    onClick: function (e) {
      if (trigger.props.onClick) trigger.props.onClick(e);
      if (!e.defaultPrevented) toggle();
    }
  });
  var side = pos ? pos.side : where.side;
  var style = floatingStyle(pos, Object.assign({ maxWidth: 'min(360px, calc(100vw - 16px))' }, props.width !== undefined ? { width: props.width } : null, props.style));
  var content = typeof props.children === 'function' ? props.children({ close: function () { close(true); } }) : props.children;
  return h(React.Fragment, null, triggerNode,
    open ? portal(h('div', {
      ref: boxRef, id: id, role: 'dialog', tabIndex: -1, 'aria-label': props.label, 'aria-labelledby': props['aria-labelledby'],
      className: cx('hy-popover', 'hy-popover--' + side, props.className), style: style, onKeyDown: onKeyDown
    }, content)) : null);
}

define('Popover', Popover);
