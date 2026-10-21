function browserHost(address) {
  return String(address || '').replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');
}

function Browser(props) {
  var copied = useState(false);
  var timer = useRef(null);
  useEffect(function () { return function () { clearTimeout(timer.current); }; }, []);
  function copy() {
    copyText(props.address).then(function () {
      copied[1](true);
      clearTimeout(timer.current);
      timer.current = setTimeout(function () { copied[1](false); }, 2000);
    }, function () {});
  }
  var rest = omit(props, ['address', 'children', 'className']);
  return h('div', Object.assign({}, rest, { className: cx('hy-browser', props.className) }),
    h('div', { className: 'hy-browser__bar' },
      h('div', { className: 'hy-browser__side', 'aria-hidden': 'true' },
        h('span', { className: 'hy-browser__dots' },
          h('span', { className: 'hy-browser__dot hy-browser__dot--close' }),
          h('span', { className: 'hy-browser__dot hy-browser__dot--min' }),
          h('span', { className: 'hy-browser__dot hy-browser__dot--max' })),
        h('span', { className: 'hy-browser__controls' },
          h(HY.Icon, { name: 'arrow-left', size: 14 }),
          h(HY.Icon, { name: 'arrow-right', size: 14 }),
          h(HY.Icon, { name: 'rotate-cw', size: 14 }))),
      h('div', { className: 'hy-browser__center' },
        props.address ? h('div', { className: 'hy-browser__address' },
          h('span', { className: 'hy-browser__url', title: props.address, translate: 'no' }, browserHost(props.address)),
          h('button', { type: 'button', className: 'hy-browser__copy', onClick: copy, 'aria-label': copied[0] ? 'Copied URL' : 'Copy URL' },
            h(Glyph, { name: copied[0] ? 'check' : 'copy', size: 14 })),
          h('span', { className: 'hy-sr', 'aria-live': 'polite' }, copied[0] ? 'URL copied' : '')) : null),
      h('div', { className: 'hy-browser__side hy-browser__side--end', 'aria-hidden': 'true' })),
    h('div', { className: 'hy-browser__view' }, props.children));
}

define('Browser', Browser);
