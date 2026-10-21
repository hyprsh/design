function scrollerSize(v) { return typeof v === 'number' ? v + 'px' : v; }

function Scroller(props) {
  var overflow = props.overflow || 'y';
  var horizontal = overflow === 'x';
  var viewport = useRef(null);
  var st = useState({ top: false, bottom: false, left: false, right: false, any: false });
  var edges = st[0];

  function measure() {
    var el = viewport.current;
    if (!el) return;
    var next = {
      top: el.scrollTop > 1,
      bottom: el.scrollTop + el.clientHeight < el.scrollHeight - 1,
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1
    };
    next.any = next.top || next.bottom || next.left || next.right;
    st[1](function (prev) {
      return prev.top === next.top && prev.bottom === next.bottom && prev.left === next.left && prev.right === next.right ? prev : next;
    });
  }

  useEffect(function () {
    measure();
    var el = viewport.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    var ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstChild) ro.observe(el.firstChild);
    return function () { ro.disconnect(); };
  }, []);

  /* Buttons step to the previous or next direct child of the content container. */
  function step(dir) {
    var el = viewport.current;
    if (!el) return;
    var content = el.firstChild;
    var kids = Array.prototype.slice.call(content.children);
    var vr = el.getBoundingClientRect();
    var pos = horizontal ? el.scrollLeft : el.scrollTop;
    var offsets = kids.map(function (k) {
      var r = k.getBoundingClientRect();
      return horizontal ? r.left - vr.left + el.scrollLeft : r.top - vr.top + el.scrollTop;
    });
    var target = null;
    if (dir > 0) {
      for (var i = 0; i < offsets.length; i++) if (offsets[i] > pos + 1) { target = offsets[i]; break; }
    } else {
      for (var j = offsets.length - 1; j >= 0; j--) if (offsets[j] < pos - 1) { target = offsets[j]; break; }
      if (target === null) target = 0;
    }
    if (target === null) target = horizontal ? el.scrollWidth : el.scrollHeight;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var opts = { behavior: reduce ? 'auto' : 'smooth' };
    opts[horizontal ? 'left' : 'top'] = target;
    el.scrollTo(opts);
  }

  var label = props['aria-label'];
  function btn(dir, name, icon, enabled) {
    return h('button', {
      type: 'button', className: 'hy-scroller__btn', onClick: function () { step(dir); }, disabled: !enabled,
      'aria-label': 'Scroll ' + (label ? label + ' ' : '') + name
    }, h(HY.Icon, { name: icon, size: 16 }));
  }
  var buttons = props.withButtons ? h('div', { className: 'hy-scroller__btns' },
    horizontal ? btn(-1, 'Left', 'chevron-left', edges.left) : btn(-1, 'Up', 'chevron-up', edges.top),
    horizontal ? btn(1, 'Right', 'chevron-right', edges.right) : btn(1, 'Down', 'chevron-down', edges.bottom)) : null;

  var style = Object.assign({}, props.style);
  if (props.width !== undefined) style.width = scrollerSize(props.width);
  if (props.height !== undefined) style.height = scrollerSize(props.height);

  return h('div', {
    className: cx('hy-scroller', 'hy-scroller--' + overflow, props.withButtons && 'hy-scroller--buttons', props.className),
    style: style
  },
    !horizontal ? buttons : null,
    h('div', { className: 'hy-scroller__frame' },
      h('div', {
        ref: viewport, className: 'hy-scroller__viewport', onScroll: measure,
        tabIndex: edges.any ? 0 : undefined,
        role: label ? 'region' : undefined, 'aria-label': label
      },
        h('div', { className: cx('hy-scroller__content', props.childrenContainerClassName) }, props.children)),
      h('div', { className: cx('hy-scroller__fade hy-scroller__fade--top', edges.top && 'is-on'), 'aria-hidden': 'true' }),
      h('div', { className: cx('hy-scroller__fade hy-scroller__fade--bottom', edges.bottom && 'is-on'), 'aria-hidden': 'true' }),
      h('div', { className: cx('hy-scroller__fade hy-scroller__fade--left', edges.left && 'is-on'), 'aria-hidden': 'true' }),
      h('div', { className: cx('hy-scroller__fade hy-scroller__fade--right', edges.right && 'is-on'), 'aria-hidden': 'true' })),
    horizontal ? buttons : null);
}

define('Scroller', Scroller);
