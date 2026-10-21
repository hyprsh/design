function TextWithCopyButton(props) {
  var st = useState('idle');
  var timer = useRef(null);
  useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);
  var label = props.textLabel != null ? props.textLabel : (props.children != null ? props.children : props.textToCopy);
  var payload = props.textToCopy != null ? props.textToCopy : (typeof label === 'string' ? label : '');
  var success = props.successMessage || 'Copied to clipboard';
  function onClick(e) {
    if (props.onClick) props.onClick(e);
    if (e.defaultPrevented) return;
    Promise.resolve(copyText(payload)).then(function () {
      st[1]('copied'); if (props.onCopy) props.onCopy(payload);
    }, function () { st[1]('failed'); });
    clearTimeout(timer.current);
    timer.current = setTimeout(function () { st[1]('idle'); }, 2000);
  }
  var copied = st[0] === 'copied';
  var saysCopy = typeof label === 'string' && /^copy\b/i.test(label);
  var rest = omit(props, ['textToCopy', 'textLabel', 'successMessage', 'ellipsis', 'onCopy', 'onClick', 'children', 'className']);
  return h('button', Object.assign({ type: 'button', title: props.ellipsis && typeof label === 'string' ? label : undefined }, rest, {
    className: cx('hy-twcb', props.ellipsis && 'hy-twcb--ellipsis', props.className), onClick: onClick
  }),
    h('span', { className: 'hy-twcb__text' }, label),
    saysCopy ? null : h('span', { className: 'hy-sr' }, ', Copy to Clipboard'),
    h('span', { className: 'hy-twcb__icon', 'aria-hidden': 'true' },
      h('span', { className: cx('hy-twcb__glyph', copied && 'is-out') }, h(Glyph, { name: 'copy' })),
      h('span', { className: cx('hy-twcb__glyph', !copied && 'is-out') }, h(Glyph, { name: 'check' }))),
    h('span', { className: 'hy-sr', 'aria-live': 'polite' }, copied ? success : (st[0] === 'failed' ? 'Copy failed' : '')));
}

define('TextWithCopyButton', TextWithCopyButton);
