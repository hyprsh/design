/* CopyButton: an icon button that copies `textToCopy`, then shows a check for two seconds. */

/* The async clipboard API can refuse (unfocused frame, no permission); fall back to a hidden textarea. */
function copyWithFallback(text) {
  return copyText(text).catch(function () {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    if (!ok) throw new Error('copy failed');
  });
}
function CopyButton(props) {
  var st = useState(false), copied = st[0], setCopied = st[1];
  var timer = useRef(null);
  useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);
  function onClick(e) {
    if (props.onClick) props.onClick(e);
    if (e.defaultPrevented) return;
    var text = props.textToCopy == null ? '' : String(props.textToCopy);
    copyWithFallback(text).then(function () {
      setCopied(true);
      if (props.onCopy) props.onCopy(text);
      clearTimeout(timer.current);
      timer.current = setTimeout(function () { setCopied(false); }, 2000);
    }, function () { /* clipboard refused: leave the copy icon */ });
  }
  var rest = omit(props, ['textToCopy', 'label', 'onCopy', 'onClick', 'className', 'variant', 'size', 'children']);
  return h(F_COPY, null,
    h(HY.Button, Object.assign(rest, {
      variant: props.variant || 'secondary', size: props.size, svgOnly: true,
      'aria-label': props.label || props['aria-label'] || 'Copy to Clipboard', onClick: onClick,
      className: cx('hy-copy-btn', copied && 'is-copied', props.className)
    }),
      h('span', { className: 'hy-copy-btn__icons', 'aria-hidden': 'true' },
        h('span', { className: 'hy-copy-btn__icon hy-copy-btn__icon--copy' }, h(Glyph, { name: 'copy' })),
        h('span', { className: 'hy-copy-btn__icon hy-copy-btn__icon--check' }, h(Glyph, { name: 'check' })))),
    h('span', { className: 'hy-copy-btn__status', role: 'status' }, copied ? 'Copied' : ''));
}
var F_COPY = React.Fragment;

define('CopyButton', CopyButton);
