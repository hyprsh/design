/* Tooltip: hover/focus label. The first one waits `delay`; neighbours opened soon after show instantly. */
var lastTooltipClose = 0;
var TOOLTIP_TYPES = { success: 1, error: 1, warning: 1, violet: 1 };

function TooltipTip() {
  return h('svg', { className: 'hy-tooltip__tip', width: 14, height: 7, viewBox: '0 0 14 7', 'aria-hidden': 'true', focusable: 'false' },
    h('path', { d: 'M0 0h14L8.4 6.1a1.9 1.9 0 0 1-2.8 0z' }));
}

function Tooltip(props) {
  var st = useState(!!props.defaultOpen);
  var open = st[0], setOpen = st[1];
  var id = useId();
  var t = useRef(null);
  var delay = props.delay === false ? 0 : (typeof props.delay === 'number' ? props.delay : 150);
  var position = props.position || 'top';
  var align = props.boxAlign || 'center';
  var type = TOOLTIP_TYPES[props.type] ? props.type : null;
  useEffect(function () { return function () { clearTimeout(t.current); }; }, []);
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
  function onKey(e) { if (e.key === 'Escape' && open) { e.stopPropagation(); hide(); } }
  var child = props.children;
  var trigger = React.isValidElement(child) && React.Children.count(child) === 1
    ? React.cloneElement(child, { 'aria-describedby': open ? id : undefined })
    : h('span', { tabIndex: 0, className: 'hy-tooltip__text', 'aria-describedby': open ? id : undefined }, child);
  return h('span', { className: cx('hy-tooltip', props.className), onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide, onKeyDown: onKey },
    trigger,
    h('span', {
      role: 'tooltip', id: id,
      className: cx('hy-tooltip__box', 'hy-tooltip__box--' + position, 'hy-tooltip__box--align-' + align, type && 'hy-tooltip__box--' + type,
        props.center === false && 'hy-tooltip__box--start', open && 'is-open')
    }, props.text, props.tip === false ? null : h(TooltipTip)));
}

define('Tooltip', Tooltip);
