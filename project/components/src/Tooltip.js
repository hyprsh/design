/* Tooltip: hover/focus label. The first one waits `delay`; neighbours opened soon after show instantly.
   The box is portalled to <body> only while open and placed with useFloating, so it flips and stays on screen.
   Touch: a tap toggles it, and a tap outside or moving focus away closes it. */
var lastTooltipClose = 0;
var TOOLTIP_TYPES = { success: 1, error: 1, warning: 1, violet: 1 };
var TOOLTIP_ALIGN = { left: 'start', center: 'center', right: 'end', start: 'start', end: 'end' };

function TooltipTip(p) {
  return h('svg', { className: 'hy-tooltip__tip', style: p.style, width: 14, height: 7, viewBox: '0 0 14 7', 'aria-hidden': 'true', focusable: 'false' },
    h('path', { d: 'M0 0h14L8.4 6.1a1.9 1.9 0 0 1-2.8 0z' }));
}

function Tooltip(props) {
  var st = useState(!!props.defaultOpen);
  var open = st[0], setOpen = st[1];
  var id = useId();
  var t = useRef(null);
  var anchorRef = useRef(null), boxRef = useRef(null);
  var touchAt = useRef(0);
  var delay = props.delay === false ? 0 : (typeof props.delay === 'number' ? props.delay : 150);
  var position = props.position || 'top';
  var align = TOOLTIP_ALIGN[props.boxAlign] || (props.center === false ? 'start' : 'center');
  var type = TOOLTIP_TYPES[props.type] ? props.type : null;
  var pos = useFloating(open, anchorRef, boxRef, { side: position, align: align, offset: 8 });
  useEffect(function () { return function () { clearTimeout(t.current); }; }, []);
  function fromTouch() { return Date.now() - touchAt.current < 800; }
  function show() {
    clearTimeout(t.current);
    var warm = Date.now() - lastTooltipClose < 400;
    if (warm || delay === 0) setOpen(true);
    else t.current = setTimeout(function () { setOpen(true); }, delay);
  }
  function hide() {
    clearTimeout(t.current);
    if (open) lastTooltipClose = Date.now();
    setOpen(false);
  }
  useDismiss(open, [anchorRef, boxRef], hide);
  function onPointerDown(e) {
    if (e.pointerType !== 'touch') return;
    touchAt.current = Date.now();
    clearTimeout(t.current);
    if (open) hide(); else setOpen(true);
  }
  /* Taps also send emulated mouseenter/mouseleave and focus; the tap toggle has already handled those. */
  function onEnter() { if (!fromTouch()) show(); }
  function onLeave() { if (!fromTouch()) hide(); }
  function onFocus() { if (!fromTouch()) show(); }
  function onKey(e) { if (e.key === 'Escape' && open) { e.stopPropagation(); hide(); } }
  var side = pos ? pos.side : position;
  var tipStyle = null;
  if (pos) tipStyle = side === 'top' || side === 'bottom' ? { left: pos.arrowX - 7 } : { top: pos.arrowY - 3.5 };
  var child = props.children;
  var trigger = React.isValidElement(child) && React.Children.count(child) === 1
    ? React.cloneElement(child, { 'aria-describedby': open ? id : undefined })
    : h('span', { tabIndex: 0, className: 'hy-tooltip__text', 'aria-describedby': open ? id : undefined }, child);
  return h('span', { ref: anchorRef, className: cx('hy-tooltip', props.className), onPointerDown: onPointerDown, onMouseEnter: onEnter, onMouseLeave: onLeave, onFocus: onFocus, onBlur: hide, onKeyDown: onKey },
    trigger,
    open ? portal(h('span', {
      ref: boxRef, role: 'tooltip', id: id,
      className: cx('hy-tooltip__box', 'hy-tooltip__box--' + side, type && 'hy-tooltip__box--' + type, props.center === false && 'hy-tooltip__box--start'),
      style: floatingStyle(pos, { zIndex: 'var(--z-tooltip)', maxWidth: 'min(250px, calc(100vw - 16px))' })
    }, props.text, props.tip === false ? null : h(TooltipTip, { style: tipStyle }))) : null);
}

define('Tooltip', Tooltip);
