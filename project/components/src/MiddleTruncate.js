function mtCut(value, keep) {
  if (keep >= value.length) return value;
  var chars = Array.from(value);
  var head = Math.ceil(keep / 2), tail = Math.floor(keep / 2);
  return chars.slice(0, head).join('') + '…' + (tail ? chars.slice(chars.length - tail).join('') : '');
}

function MiddleTruncate(props) {
  var value = props.value == null ? '' : String(props.value);
  var st = useState(value), shown = st[0], setShown = st[1];
  var boxRef = useRef(null), measureRef = useRef(null);

  useLayoutEffect(function () {
    var box = boxRef.current, probe = measureRef.current;
    if (!box || !probe) return;
    var chars = Array.from(value);
    function fit() {
      var avail = box.clientWidth;
      probe.textContent = value;
      if (!avail || probe.getBoundingClientRect().width <= avail + 0.5) { setShown(value); return; }
      var lo = 0, hi = chars.length - 1, best = 0;
      while (lo <= hi) {
        var mid = (lo + hi) >> 1;
        probe.textContent = mtCut(value, mid);
        if (probe.getBoundingClientRect().width <= avail + 0.5) { best = mid; lo = mid + 1; } else hi = mid - 1;
      }
      setShown(mtCut(value, best));
    }
    fit();
    var ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fit) : null;
    if (ro) ro.observe(box);
    var alive = true;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (alive) fit(); });
    return function () { alive = false; if (ro) ro.disconnect(); };
  }, [value]);

  function onCopy(e) {
    var sel = window.getSelection && window.getSelection();
    if (!sel || !boxRef.current || !boxRef.current.contains(sel.anchorNode)) return;
    if (shown === value || !e.clipboardData) return;
    e.preventDefault();
    e.clipboardData.setData('text/plain', value);
  }

  var rest = omit(props, ['value', 'className', 'style']);
  return h('span', Object.assign({}, rest, {
    ref: boxRef, className: cx('hy-mt', props.className), style: props.style,
    title: shown !== value ? value : undefined, onCopy: onCopy
  }),
    h('span', { className: 'hy-mt__full', 'aria-hidden': 'true' }, value),
    h('span', { className: 'hy-mt__shown', 'aria-hidden': 'true' }, shown),
    h('span', { className: 'hy-sr' }, value),
    h('span', { ref: measureRef, className: 'hy-mt__probe', 'aria-hidden': 'true' }));
}

define('MiddleTruncate', MiddleTruncate);
