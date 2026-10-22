function Collapse(props) {
  var c = useControllable(props.expanded, !!props.defaultExpanded, props.onChange);
  var open = c[0], setOpen = c[1];
  var auto = useId();
  var base = props.id || auto;
  var btnId = base + '-trigger', panelId = base + '-panel';
  var panelRef = useRef(null);
  var locked = !!props.__locked;
  var setRef = useRef(setOpen);
  setRef.current = setOpen;

  useLayoutEffect(function () {
    var el = panelRef.current;
    if (!el) return;
    if (open) el.removeAttribute('hidden');
    else el.setAttribute('hidden', 'onbeforematch' in document.body ? 'until-found' : '');
  }, [open]);
  useEffect(function () {
    var el = panelRef.current;
    if (!el) return;
    function onMatch() { setRef.current(true); }
    el.addEventListener('beforematch', onMatch);
    return function () { el.removeEventListener('beforematch', onMatch); };
  }, []);

  var inline = props.variant === 'inline';
  /* The inline disclosure is not a section heading, so it has none unless headingLevel asks for one. */
  var Heading = inline && !props.headingLevel ? 'div' : 'h' + Math.min(6, Math.max(2, props.headingLevel || 3));
  var rest = omit(props, ['title', 'children', 'defaultExpanded', 'expanded', 'onChange', 'size', 'variant', 'id', 'className', 'headingLevel', '__locked', '__grouped']);
  return h('div', Object.assign({}, rest, {
    className: cx('hy-collapse', inline && 'hy-collapse--inline', props.size === 'small' && 'hy-collapse--small', props.__grouped && 'is-grouped', open && 'is-open', props.className)
  }),
    h(Heading, { className: 'hy-collapse__heading' },
      h('button', {
        type: 'button', id: btnId, className: 'hy-collapse__trigger',
        'aria-expanded': open, 'aria-controls': panelId, 'aria-disabled': locked || undefined,
        onClick: function () { if (!locked) setOpen(!open); }
      },
        inline ? h('span', { className: 'hy-collapse__chev', 'aria-hidden': 'true' }, h(Glyph, { name: 'chevron', size: 14 })) : null,
        h('span', { className: 'hy-collapse__title' }, props.title),
        inline ? null : h('span', { className: 'hy-collapse__chev', 'aria-hidden': 'true' }, h(Glyph, { name: 'chevron' })))),
    h('div', { ref: panelRef, id: panelId, role: 'region', 'aria-labelledby': btnId, className: 'hy-collapse__panel' },
      h('div', { className: 'hy-collapse__body' }, props.children)));
}

function CollapseGroup(props) {
  var kids = React.Children.toArray(props.children).filter(React.isValidElement);
  var st = useState(function () {
    var init = [];
    kids.forEach(function (k, i) { if (k.props.defaultExpanded && (props.multiple || !init.length)) init.push(i); });
    return init;
  });
  var openSet = st[0], setOpenSet = st[1];
  var rest = omit(props, ['children', 'multiple', 'className']);
  return h('div', Object.assign({}, rest, { className: cx('hy-collapse-group', props.className) }),
    kids.map(function (child, i) {
      var isOpen = openSet.indexOf(i) >= 0;
      return React.cloneElement(child, {
        key: child.key != null ? child.key : i,
        expanded: isOpen,
        __grouped: true,
        __locked: !props.multiple && isOpen,
        onChange: function (next) {
          setOpenSet(function (cur) {
            if (props.multiple) return next ? cur.concat([i]) : cur.filter(function (x) { return x !== i; });
            return next ? [i] : cur.filter(function (x) { return x !== i; });
          });
          if (child.props.onChange) child.props.onChange(next);
        }
      });
    }));
}

Collapse.Group = CollapseGroup;

define('Collapse', Collapse);
define('CollapseGroup', CollapseGroup);
