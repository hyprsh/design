/* CommandMenu: Geist's compound API (CommandMenu + CommandMenuInput/List/Group/Item/Divider)
   plus the original data shorthand (groups/open/onOpenChange/inline). */
var CmdCtx = React.createContext(null);

function cmdText(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(cmdText).join(' ');
  if (node.props) return cmdText(node.props.children);
  return '';
}
/* ctx.filter (a function) replaces the built-in word match; ctx.needle is '' when filtering is off. */
function cmdMatches(props, ctx) {
  var needle = ctx.needle;
  if (!needle) return true;
  if (ctx.filter) {
    return !!ctx.filter({ value: props.value != null ? props.value : cmdText(props.children), keywords: props.keywords || [] }, ctx.query.trim());
  }
  var hay = [props.value != null ? props.value : cmdText(props.children)].concat(props.keywords || []).join(' ').toLowerCase();
  return needle.split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
}

/* Forwards its ref to the <input>; CommandMenu's inputRef prop points at the same element. */
var CommandMenuInput = React.forwardRef(function CommandMenuInput(props, ref) {
  var ctx = React.useContext(CmdCtx);
  var hideClose = props.hideClose || props.closeButton === false;
  return h('div', { className: cx('hy-cmd__search', props.className) },
    props.prefix ? h('span', { className: 'hy-cmd__prefix' }, props.prefix) : null,
    h('input', {
      className: 'hy-cmd__input', type: 'text', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': ctx.listId,
      'aria-activedescendant': ctx.active || undefined, 'aria-autocomplete': 'list', 'aria-label': props['aria-label'] || ctx.label,
      ref: function (el) {
        if (typeof ref === 'function') ref(el); else if (ref) ref.current = el;
        if (ctx.inputRef) { if (typeof ctx.inputRef === 'function') ctx.inputRef(el); else ctx.inputRef.current = el; }
      },
      autoComplete: 'off', autoCorrect: 'off', spellCheck: false, 'data-autofocus': true,
      placeholder: props.placeholder || 'Search for a command or page…',
      value: ctx.query, onChange: function (e) { ctx.setQuery(e.target.value); }
    }),
    hideClose ? null : h('button', { type: 'button', className: 'hy-cmd__esc', 'aria-label': 'Close', onClick: ctx.close },
      h('span', { className: 'hy-cmd__esc-key', 'aria-hidden': 'true' }, 'Esc'), h('span', { className: 'hy-cmd__esc-x', 'aria-hidden': 'true' }, h(Glyph, { name: 'x', size: 14 }))));
});
CommandMenuInput.displayName = 'CommandMenuInput';

function CommandMenuList(props) {
  var ctx = React.useContext(CmdCtx);
  var q = ctx.query.trim();
  var loading = !!props.loading;
  return h('div', { ref: ctx.listRef, id: ctx.listId, role: 'listbox', 'aria-label': 'Results', 'aria-busy': loading || undefined, className: cx('hy-cmd__list', props.className) },
    props.children,
    loading ? h('div', { className: 'hy-cmd__loading', 'aria-live': 'polite' },
      h(HY.Spinner, { size: 16 }), h('span', null, props.loadingLabel || 'Searching…')) : null,
    !loading && ctx.count === 0 && q ? h('div', { className: 'hy-cmd__empty' }, props.empty || 'No results for “' + q + '”.') : null);
}

function CommandMenuGroup(props) {
  var ctx = React.useContext(CmdCtx);
  var needle = ctx.needle;
  var gid = useId();
  if (needle) {
    var any = false;
    (function walk(nodes) {
      React.Children.forEach(nodes, function (c) {
        if (any || !c || !c.type) return;
        if (c.type === CommandMenuItem) { if (cmdMatches(c.props, ctx)) any = true; }
        else if (c.type === React.Fragment) walk(c.props.children);
        else any = true;
      });
    })(props.children);
    if (!any) return null;
  }
  return h('div', { role: 'group', 'aria-labelledby': props.heading ? gid : undefined, className: cx('hy-cmd__group', props.className) },
    props.heading ? h('div', { id: gid, className: 'hy-cmd__heading', 'aria-hidden': 'true' }, props.heading) : null,
    props.children);
}

function CommandMenuItem(props) {
  var ctx = React.useContext(CmdCtx);
  var id = useId();
  if (!cmdMatches(props, ctx)) return null;
  var isActive = ctx.active === id;
  function select() {
    if (props.disabled) return;
    var keep = props.keepOpen;
    var fn = props.callback || props.onSelect;
    if (!keep) ctx.close();
    if (fn) fn();
  }
  return h('div', {
    id: id, role: 'option', 'aria-selected': isActive, 'aria-disabled': props.disabled || undefined,
    className: cx('hy-cmd__item', isActive && 'is-active', props.disabled && 'is-disabled', props.className),
    onMouseMove: function () { if (!isActive && !props.disabled) ctx.setActive(id); },
    onClick: select
  },
    props.prefix ? h('span', { className: 'hy-cmd__icon', 'aria-hidden': 'true' }, props.prefix) : null,
    h('span', { className: 'hy-cmd__label' }, props.children),
    props.suffix ? h('span', { className: 'hy-cmd__suffix' }, props.suffix) : null);
}

function CommandMenuDivider(props) {
  var ctx = React.useContext(CmdCtx);
  if (ctx.needle) return null;
  return h('div', { role: 'separator', className: cx('hy-cmd__divider', props.className) });
}

function cmdFromGroups(groups) {
  return (groups || []).map(function (g) {
    return h(CommandMenuGroup, { key: g.heading, heading: g.heading },
      g.items.map(function (it) {
        return h(CommandMenuItem, { key: it.label, value: it.label, keywords: it.keywords, callback: it.onSelect, prefix: it.icon, suffix: it.shortcut, disabled: it.disabled }, it.label);
      }));
  });
}

function CommandMenu(props) {
  var q = useControllable(props.query, '', props.onQueryChange);
  var act = useState(null);
  var cnt = useState(-1);
  var box = useRef(null), listRef = useRef(null), sigRef = useRef('');
  var lid = useId();
  var open = !!props.open;
  var setOpen = props.setOpen || props.onOpenChange;
  useOverlayFocus(open, box);
  useEffect(function () {
    if (props.hotkey === false) return;
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (setOpen) setOpen(!open);
      }
    }
    window.addEventListener('keydown', onKey);
    return function () { window.removeEventListener('keydown', onKey); };
  }, [open, props.hotkey, setOpen]);
  useEffect(function () { if (!open) { if (q[0] !== '') q[1](''); act[1](null); } }, [open]);

  function options() {
    return listRef.current ? Array.prototype.slice.call(listRef.current.querySelectorAll('[role="option"]:not([aria-disabled="true"])')) : [];
  }
  /* After every render: keep the result count current and the active option valid. */
  useLayoutEffect(function () {
    if (!open) return;
    var opts = options();
    if (cnt[0] !== opts.length) cnt[1](opts.length);
    var ids = opts.map(function (o) { return o.id; });
    /* The item set changed (new results, new order): start again from the first option. */
    var sig = ids.join(' ');
    var changed = sigRef.current !== sig;
    sigRef.current = sig;
    if (ids.indexOf(act[0]) < 0 || (changed && act[0] !== ids[0])) act[1](ids[0] || null);
  });
  useLayoutEffect(function () { act[1](function () { var o = options(); return o[0] ? o[0].id : null; }); }, [q[0]]);
  useLayoutEffect(function () {
    var el = act[0] && document.getElementById(act[0]);
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [act[0]]);

  if (!open) return null;
  function close() { if (setOpen) setOpen(false); }
  function move(delta) {
    var opts = options();
    if (!opts.length) return;
    var i = opts.map(function (o) { return o.id; }).indexOf(act[0]);
    var next = delta === Infinity ? opts.length - 1 : delta === -Infinity ? 0 : (i + delta + opts.length) % opts.length;
    act[1](opts[next].id);
  }
  /* The menu's own keys come from the dialog itself, the search input or the list. A key from
     anything else, such as the Esc button or a panel the app renders in place of the list, is left to the app and the browser. */
  function ownTarget(t) {
    return t === box.current || !!(t && t.closest && t.closest('.hy-cmd__search') && !t.closest('.hy-cmd__esc')) || !!(listRef.current && listRef.current.contains(t));
  }
  function onKey(e) {
    var skipped = false;
    e.skipMenu = function () { skipped = true; };
    if (props.onKeyDown) props.onKeyDown(e);
    if (e.defaultPrevented) return;
    /* Tab stays trapped for every target; skipMenu() and foreign targets only skip the other keys. */
    if (skipped || !ownTarget(e.target)) { trapTab(e, box.current); return; }
    var ctrlNP = e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey;
    if (e.key === 'ArrowDown' || (ctrlNP && (e.key === 'n' || e.key === 'N'))) { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp' || (ctrlNP && (e.key === 'p' || e.key === 'P'))) { e.preventDefault(); move(-1); }
    else if (e.key === 'Home' && e.ctrlKey) { e.preventDefault(); move(-Infinity); }
    else if (e.key === 'End' && e.ctrlKey) { e.preventDefault(); move(Infinity); }
    else if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      var el = act[0] && document.getElementById(act[0]);
      if (el) el.click();
    }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); }
    trapTab(e, box.current);
  }
  var filtering = props.shouldFilter !== false;
  var needle = filtering ? q[0].trim().toLowerCase() : '';
  var ctx = {
    query: q[0], needle: needle, filter: filtering && typeof props.filter === 'function' ? props.filter : null, setQuery: q[1], active: act[0], setActive: act[1],
    listId: lid, listRef: listRef, inputRef: props.inputRef, count: cnt[0], close: close, label: props.label || 'Command Menu'
  };
  var body = props.children !== undefined ? props.children : [
    h(CommandMenuInput, { key: 'i', placeholder: props.placeholder }),
    h(CommandMenuList, { key: 'l' }, cmdFromGroups(props.groups))
  ];
  var live = q[0].trim() && cnt[0] >= 0 ? (cnt[0] === 1 ? '1 result' : cnt[0] + ' results') : '';
  var node = h(CmdCtx.Provider, { value: ctx },
    h('div', { className: 'hy-overlay hy-overlay--top hy-cmd-overlay', onMouseDown: function (e) { if (e.target === e.currentTarget) close(); } },
      h('div', { ref: box, role: 'dialog', 'aria-modal': 'true', 'aria-label': ctx.label, tabIndex: -1, className: cx('hy-cmd', props.className), onKeyDown: onKey },
        body,
        h('div', { className: 'hy-sr', 'aria-live': 'polite', 'aria-atomic': 'true' }, live))));
  return props.inline ? node : portal(node);
}

CommandMenu.Input = CommandMenuInput;
CommandMenu.List = CommandMenuList;
CommandMenu.Group = CommandMenuGroup;
CommandMenu.Item = CommandMenuItem;
CommandMenu.Divider = CommandMenuDivider;

define('CommandMenuInput', CommandMenuInput);
define('CommandMenuList', CommandMenuList);
define('CommandMenuGroup', CommandMenuGroup);
define('CommandMenuItem', CommandMenuItem);
define('CommandMenuDivider', CommandMenuDivider);
define('CommandMenu', CommandMenu);
