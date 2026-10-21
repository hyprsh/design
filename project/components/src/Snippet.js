function Snippet(props) {
  var text = props.text == null ? '' : props.text;
  var lines = Array.isArray(text) ? text : [text];
  var empty = !lines.some(function (l) { return l !== '' && l != null; });
  var st = useState('idle');
  var timer = useRef(null);
  useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);
  function onCopy() {
    var payload = props.copyText != null ? props.copyText : lines.join('\n');
    Promise.resolve(copyText(payload)).then(function () {
      st[1]('copied'); if (props.onCopy) props.onCopy();
    }, function () { st[1]('failed'); });
    clearTimeout(timer.current);
    timer.current = setTimeout(function () { st[1]('idle'); }, 2000);
  }
  var copied = props.copied !== undefined ? !!props.copied : st[0] === 'copied';
  var prompt = props.prompt === false ? null : (typeof props.prompt === 'string' ? props.prompt : '$');
  var type = props.type && props.type !== 'default' ? props.type : null;
  var width = typeof props.width === 'number' ? props.width + 'px' : props.width;
  return h('div', { className: cx('hy-snippet', props.dark && 'hy-snippet--dark', type && 'hy-snippet--' + type, props.className), translate: 'no', style: Object.assign({ width: width }, props.style) },
    empty && props.placeholder
      ? h('p', { className: 'hy-snippet__placeholder' }, props.placeholder)
      : h('pre', { className: 'hy-snippet__pre' }, lines.map(function (l, i) {
        return h('code', { key: i, className: 'hy-snippet__line' }, prompt ? h('span', { className: 'hy-snippet__prompt', 'aria-hidden': 'true' }, prompt + ' ') : null, l);
      })),
    h('button', { type: 'button', className: 'hy-snippet__copy', onClick: onCopy, disabled: empty && props.copyText == null, 'aria-label': 'Copy to Clipboard' },
      h('span', { className: cx('hy-snippet__icon', copied && 'is-copied'), 'aria-hidden': 'true' }, h(Glyph, { name: 'copy' })),
      h('span', { className: cx('hy-snippet__icon', !copied && 'is-hidden'), 'aria-hidden': 'true' }, h(Glyph, { name: 'check' }))),
    h('span', { className: 'hy-sr', 'aria-live': 'polite' }, copied ? 'Copied to clipboard' : (st[0] === 'failed' ? 'Copy failed. Select the text and copy it manually.' : '')));
}

define('Snippet', Snippet);
