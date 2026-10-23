/* ContextCard (alias ContextCardTrigger): a floating card with richer content than a tooltip,
   shown on hover or focus of its trigger. On touch screens a tap on the trigger toggles it (the first
   tap on a link opens the card instead of following it) and a tap outside closes it.
   The card is portaled to <body> while open and placed with useFloating, so it stays on screen. */
function ContextCardTip(p) {
  return h('svg', { className: 'hy-ctx__tip', style: p.style, width: 14, height: 7, viewBox: '0 0 14 7', 'aria-hidden': 'true', focusable: 'false' },
    h('path', { className: 'hy-ctx__tip-fill', d: 'M0 0h14L8.4 6.1a1.9 1.9 0 0 1-2.8 0z' }),
    h('path', { className: 'hy-ctx__tip-stroke', d: 'M0 .5h.6l5 5.4a1.9 1.9 0 0 0 2.8 0l5-5.4h.6', fill: 'none' }));
}

function ContextCard(props) {
  var st = useState(!!props.defaultOpen);
  var open = st[0], setOpen = st[1];
  var id = useId();
  var timer = useRef(null);
  var root = useRef(null);
  var card = useRef(null);
  var lastTouch = useRef(0);
  var side = props.side || 'top';
  var align = props.align || 'center';
  var delay = typeof props.delay === 'number' ? props.delay : 150;
  var pos = useFloating(open, root, card, { side: side, align: align, offset: 8 });
  useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);
  useEffect(function () { if (props.onOpenChange) props.onOpenChange(open); }, [open]);
  useDismiss(open, [root, card], function () { clearTimeout(timer.current); setOpen(false); });

  function touched() { return Date.now() - lastTouch.current < 800; }
  function show() { clearTimeout(timer.current); timer.current = setTimeout(function () { setOpen(true); }, delay); }
  function stay() { clearTimeout(timer.current); }
  function hideSoon() { clearTimeout(timer.current); timer.current = setTimeout(function () { setOpen(false); }, 100); }
  function onPointerEnter(e) { if (e.pointerType === 'touch') return; show(); }
  function onPointerLeave(e) { if (e.pointerType === 'touch') return; hideSoon(); }
  function onPointerDown(e) { if (e.pointerType === 'touch') lastTouch.current = Date.now(); }
  function onFocus() { if (!touched()) show(); }
  function within(el) { return !!el && ((root.current && root.current.contains(el)) || (card.current && card.current.contains(el))); }
  function onBlur(e) { if (!within(e.relatedTarget) && !touched()) hideSoon(); }
  /* Touch: a tap toggles the card. The first tap on a link only opens it; a second tap follows the link. */
  function onClickCapture(e) {
    if (!touched() || !root.current || !root.current.contains(e.target)) return;
    var link = e.target.closest && e.target.closest('a[href]');
    clearTimeout(timer.current);
    if (!open) { if (link) e.preventDefault(); setOpen(true); }
    else if (!link) setOpen(false);
  }
  function onKey(e) {
    if (e.key === 'Escape' && open) {
      e.stopPropagation(); clearTimeout(timer.current); setOpen(false);
      var tr = root.current && root.current.firstChild;
      if (tr && within(document.activeElement) && tr !== document.activeElement && tr.focus) tr.focus();
    }
  }
  var triggerProps = { 'aria-describedby': open ? id : undefined, 'aria-expanded': undefined };
  var trigger = props.render && React.isValidElement(props.render)
    ? React.cloneElement(props.render, Object.assign({}, triggerProps, { className: cx(props.render.props.className, 'hy-ctx__trigger') }), props.children)
    : h('div', Object.assign({}, triggerProps, { className: 'hy-ctx__trigger' }), props.children);
  var placed = pos ? pos.side : side;
  var tipStyle = !pos ? null : placed === 'top' || placed === 'bottom' ? { left: pos.arrowX - 7 } : { top: pos.arrowY - 3.5 };
  var box = open ? portal(h('div', {
    ref: card, id: id, role: 'tooltip',
    className: cx('hy-ctx__card', 'hy-ctx__card--' + placed, 'is-open', props.contentClassName),
    style: floatingStyle(pos, { zIndex: 'var(--z-menu)', maxWidth: 'min(360px, calc(100vw - 16px))' }),
    onPointerEnter: function (e) { if (e.pointerType !== 'touch') stay(); },
    onPointerLeave: onPointerLeave
  }, h('div', { className: 'hy-ctx__body' }, props.content), props.tip === false ? null : h(ContextCardTip, { style: tipStyle }))) : null;
  return h('span', {
    ref: root, className: cx('hy-ctx', props.className),
    onPointerEnter: onPointerEnter, onPointerLeave: onPointerLeave, onPointerDown: onPointerDown,
    onFocus: onFocus, onBlur: onBlur, onKeyDown: onKey, onClickCapture: onClickCapture
  }, trigger, box);
}

ContextCard.Trigger = ContextCard;
define('ContextCard', ContextCard);
define('ContextCardTrigger', ContextCard);
