/* ContextCard (Geist: ContextCardTrigger): a floating card with richer content than a tooltip,
   shown on hover or focus of its trigger. */
function ContextCardTip() {
  return h('svg', { className: 'hy-ctx__tip', width: 14, height: 7, viewBox: '0 0 14 7', 'aria-hidden': 'true', focusable: 'false' },
    h('path', { className: 'hy-ctx__tip-fill', d: 'M0 0h14L8.4 6.1a1.9 1.9 0 0 1-2.8 0z' }),
    h('path', { className: 'hy-ctx__tip-stroke', d: 'M0 .5h.6l5 5.4a1.9 1.9 0 0 0 2.8 0l5-5.4h.6', fill: 'none' }));
}

function ContextCard(props) {
  var st = useState(!!props.defaultOpen);
  var open = st[0], setOpen = st[1];
  var id = useId();
  var timer = useRef(null);
  var root = useRef(null);
  var side = props.side || 'top';
  var align = props.align || 'center';
  var delay = typeof props.delay === 'number' ? props.delay : 150;
  useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);
  useEffect(function () { if (props.onOpenChange) props.onOpenChange(open); }, [open]);
  function show() { clearTimeout(timer.current); timer.current = setTimeout(function () { setOpen(true); }, delay); }
  function hideSoon() { clearTimeout(timer.current); timer.current = setTimeout(function () { setOpen(false); }, 100); }
  function onBlur(e) { if (!root.current || !root.current.contains(e.relatedTarget)) hideSoon(); }
  function onKey(e) {
    if (e.key === 'Escape' && open) {
      e.stopPropagation(); clearTimeout(timer.current); setOpen(false);
      var tr = root.current && root.current.firstChild;
      if (tr && root.current.contains(document.activeElement) && tr !== document.activeElement && tr.focus) tr.focus();
    }
  }
  var triggerProps = { 'aria-describedby': open ? id : undefined, 'aria-expanded': undefined };
  var trigger = props.render && React.isValidElement(props.render)
    ? React.cloneElement(props.render, Object.assign({}, triggerProps, { className: cx(props.render.props.className, 'hy-ctx__trigger') }), props.children)
    : h('div', Object.assign({}, triggerProps, { className: 'hy-ctx__trigger' }), props.children);
  return h('span', {
    ref: root, className: cx('hy-ctx', props.className),
    onMouseEnter: show, onMouseLeave: hideSoon, onFocus: show, onBlur: onBlur, onKeyDown: onKey
  },
    trigger,
    h('div', {
      id: id, role: 'tooltip',
      className: cx('hy-ctx__card', 'hy-ctx__card--' + side, 'hy-ctx__card--' + align, open && 'is-open', props.contentClassName)
    }, h('div', { className: 'hy-ctx__body' }, props.content), props.tip === false ? null : h(ContextCardTip)));
}

ContextCard.Trigger = ContextCard;
define('ContextCard', ContextCard);
define('ContextCardTrigger', ContextCard);
