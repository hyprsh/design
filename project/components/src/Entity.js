/* A row for one thing (a member, token, domain): left slot, content, right-side controls.
   Inside EntityList rows render as <li>. as="button" makes the whole row clickable with a stretched button.
   With `detail` the row is one disclosure button that opens a detail region under it. With `onReorder` on the list, each row
   gets a drag handle that is also a menu button. */
var EntityListContext = React.createContext(false);
/* What a reorderable list tells each of its rows: { index, count, drag, act, key, startDrag }. null outside one. */
var EntityRowContext = React.createContext(null);

function EntityContent(props) {
  var rest = omit(props, ['title', 'description', 'fill', 'className', 'children']);
  return h('div', Object.assign({}, rest, { className: cx('hy-entity__content', props.fill && 'hy-entity__content--fill', props.className) }),
    props.title !== undefined ? h('div', { className: 'hy-entity__title' }, props.title) : null,
    props.description !== undefined ? h('div', { className: 'hy-entity__description' }, props.description) : null,
    props.children);
}

var ENTITY_OWN = ['as', 'left', 'right', 'leftClassName', 'rightClassName', 'className', 'children', 'onClick', 'disabled', 'current', 'detail', 'expanded', 'defaultExpanded', 'onExpandedChange', 'reorderLabel'];

/* ---- Reordering (hyprsh/design#92): the pure parts first, then the handle and the list ---- */

/* -1 for Alt+Up, 1 for Alt+Down (no other modifier), else 0. */
function entityStep(e) {
  if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return 0;
  return e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0;
}
/* Where a menu action puts the row at `index` of `count`: an index, or null when it doesn't apply (the item is disabled). */
function reorderTarget(index, count, action) {
  var last = count - 1;
  if (action === 'up') return index > 0 ? index - 1 : null;
  if (action === 'down') return index < last ? index + 1 : null;
  if (action === 'top') return index > 0 ? 0 : null;
  if (action === 'bottom') return index < last ? last : null;
  return null;
}
function reorderMessage(name, to, count) { return (name || 'Row') + ' moved to position ' + (to + 1) + ' of ' + count; }
/* The text of a polite live region, with a no-break space on every other message so that repeating it is announced again. */
function entityLiveText(said) { return said.text ? said.text + (said.n % 2 ? '' : '\u00a0') : ''; }
/* A drag starts after this many px of movement, so a click on the handle still opens its menu. */
var ENTITY_DRAG_SLOP = 4;
function dragStarted(dx, dy) { return Math.sqrt(dx * dx + dy * dy) >= ENTITY_DRAG_SLOP; }
/* The edge of the target row the dragged row will arrive at. */
function dropSide(from, over) { return over > from ? 'after' : 'before'; }
/* The behaviour without the DOM. emit(from, to, name) fires on every move; indexes count rows only. key() reports whether the key
   was Alt+Up or Alt+Down, moved or not, so the browser's own shortcut stays out of it. */
function entityReorderEditor(o) {
  function go(from, to, name) {
    var n = o.getCount();
    if (to === null || to === undefined || from === to || from < 0 || to < 0 || from >= n || to >= n) return false;
    o.emit(from, to, name);
    return true;
  }
  return {
    act: function (from, action, name) { return go(from, reorderTarget(from, o.getCount(), action), name); },
    drop: function (from, over, name) { return go(from, over, name); },
    key: function (from, e, name) {
      var step = entityStep(e);
      if (!step) return false;
      go(from, from + step, name);
      return true;
    }
  };
}
/* The text of a row's left and content, for its name: blocks are separated by a space, aria-hidden parts are skipped. */
var ENTITY_BLOCK = /^(DIV|P|LI|UL|OL|H[1-6]|BR|TR|TD|TH|SECTION|ARTICLE|HEADER|FOOTER)$/;
function entityDomText(node) {
  var out = '';
  function walk(n) {
    if (n.nodeType === 3) { out += n.textContent; return; }
    if (n.nodeType !== 1 || (n.getAttribute && n.getAttribute('aria-hidden') === 'true')) return;
    var block = ENTITY_BLOCK.test(String(n.nodeName).toUpperCase());
    if (block) out += ' ';
    for (var i = 0; i < n.childNodes.length; i++) walk(n.childNodes[i]);
    if (block) out += ' ';
  }
  if (node) walk(node);
  return out.replace(/\s+/g, ' ').trim();
}

/* A row's default name: the Entity.Content title when it has one, else the whole left and content text. */
function entityRowName(el) {
  var t = el && el.querySelector ? el.querySelector('.hy-entity__title') : null;
  return (t ? entityDomText(t) : '') || entityDomText(el);
}

/* The leading handle: a menu button named "Move {row name}". Drag it, press Alt+Up or Alt+Down on it, or open its menu. */
function EntityHandle(props) {
  var rc = props.rc, i = rc.index, n = rc.count;
  var ref = useRef(null);
  var read = useState('');
  useLayoutEffect(function () {
    if (props.label != null) return;
    var t = entityRowName(document.getElementById(props.labelId));
    if (t !== read[0]) read[1](t);
  });
  var name = props.label != null ? props.label : read[0];
  var title = 'Move ' + (name || 'Row');
  var items = [['up', 'Move Up'], ['down', 'Move Down'], ['top', 'Move to Top'], ['bottom', 'Move to Bottom']].map(function (a) {
    return h(HY.MenuItem, { key: a[0], disabled: props.disabled || reorderTarget(i, n, a[0]) === null, onSelect: function () { rc.act(a[0], name, ref.current); } }, a[1]);
  });
  return h(HY.MenuContainer, { position: 'bottom-start', className: 'hy-entity__reorder' },
    h(HY.MenuButton, {
      type: 'unstyled', ref: ref, className: 'hy-entity__handle', disabled: props.disabled, 'aria-label': title, 'aria-keyshortcuts': 'Alt+ArrowUp Alt+ArrowDown',
      onKeyDown: function (e) { if (!props.disabled && rc.key(e, name, e.currentTarget)) e.preventDefault(); },
      onPointerDown: function (e) { if (!props.disabled && e.button === 0) rc.startDrag(e, name); }
    },
      h('svg', { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': 'true', focusable: 'false' },
        [5, 11].map(function (x) { return [3, 8, 13].map(function (y) { return h('circle', { key: x + '-' + y, cx: x, cy: y, r: 1.25 }); }); }))),
    h(HY.Menu, { 'aria-label': title }, items));
}

/* What a row adds when its list is reorderable: its index, and the drag classes and transform. */
function reorderRow(rc, style) {
  if (!rc) return { attrs: {}, cls: '' };
  var d = rc.drag, attrs = { 'data-entity-index': rc.index }, cls = '';
  if (d && d.from === rc.index) {
    cls = 'is-dragging';
    attrs.style = Object.assign({}, style, { transform: 'translateY(' + d.dy + 'px)' });
  } else if (d && d.target === rc.index) cls = 'is-drop-' + d.side;
  return { attrs: attrs, cls: cls };
}

function hasDetail(props) { return props.detail !== undefined && props.detail !== null && props.detail !== false; }

/* An expandable row: item (<li> in a list) > div.hy-entity (the row, with a stretched cover button like as="button") and the detail
   region. The cover button is the disclosure button, named by the left and content; left and right hold content only. The row
   keeps current; the detail sits outside it, so the tint and marker don't spread. The detail is `hidden` while collapsed, which
   also takes it out of the Tab order. */
function EntityExpandable(props) {
  var inList = React.useContext(EntityListContext);
  var rc = React.useContext(EntityRowContext);
  var uid = useId();
  var ctl = useControllable(props.expanded, props.defaultExpanded || false, props.onExpandedChange);
  var open = !!ctl[0];
  var labelId = uid + '-label', detailId = uid + '-detail';
  var tag = props.as === 'li' || (inList && props.as !== 'div') ? 'li' : 'div';
  var rest = omit(props, ENTITY_OWN);
  var state = props.current ? { 'aria-current': 'true' } : {};
  var ro = reorderRow(rc, props.style);
  return h(tag, Object.assign(state, rest, ro.attrs, { className: cx('hy-entity-item', open && 'is-open', ro.cls, props.className) }),
    h('div', { className: cx('hy-entity', 'hy-entity--button', 'hy-entity--expandable', props.current && 'is-current', props.disabled && 'hy-entity--disabled') },
      rc ? h(EntityHandle, { rc: rc, labelId: labelId, label: props.reorderLabel, disabled: props.disabled }) : null,
      h('button', {
        type: 'button', className: 'hy-entity__cover', disabled: props.disabled,
        'aria-expanded': open, 'aria-controls': detailId, 'aria-labelledby': labelId,
        onClick: function (e) { if (props.onClick) props.onClick(e); ctl[1](!open); }
      }),
      h('div', { id: labelId, className: cx('hy-entity__left', props.leftClassName) }, props.left, props.children),
      props.right ? h('div', { className: cx('hy-entity__right', props.rightClassName) }, props.right) : null,
      h('span', { className: 'hy-entity__chev', 'aria-hidden': 'true' }, h(Glyph, { name: 'chevron', size: 16 }))),
    h('div', { id: detailId, hidden: !open, className: 'hy-entity__detail' },
      h('div', { className: 'hy-entity__detail-body' }, props.detail)));
}

/* Entity has no hooks of its own, so `detail` can come and go on a mounted row: each form is its own component. */
function Entity(props) {
  return h(hasDetail(props) ? EntityExpandable : EntityRow, props);
}

function EntityRow(props) {
  var inList = React.useContext(EntityListContext);
  var rc = React.useContext(EntityRowContext);
  var rowRef = useRef(null);
  var labelId = useId();
  var hasControls = useState(false);
  var asButton = props.as === 'button';
  useLayoutEffect(function () {
    if (!asButton || !rowRef.current) return;
    var found = rowRef.current.querySelector('.hy-entity__left a[href], .hy-entity__left button, .hy-entity__left input, .hy-entity__left select, .hy-entity__left textarea, .hy-entity__right a[href], .hy-entity__right button, .hy-entity__right input, .hy-entity__right select');
    if (!!found !== hasControls[0]) hasControls[1](!!found);
  });
  var tag = props.as === 'li' || (inList && props.as !== 'div') ? 'li' : 'div';
  var rest = omit(props, ENTITY_OWN);
  /* current is the keyboard cursor of a j/k list, like TableRow current; an explicit aria-current wins. */
  var state = props.current ? { 'aria-current': 'true' } : {};
  var ro = reorderRow(rc, props.style);
  return h(tag, Object.assign(state, rest, ro.attrs, { ref: rowRef, className: cx('hy-entity', asButton && 'hy-entity--button', props.current && 'is-current', props.disabled && 'hy-entity--disabled', ro.cls, props.className) }),
    rc ? h(EntityHandle, { rc: rc, labelId: labelId, label: props.reorderLabel, disabled: props.disabled }) : null,
    asButton ? h('button', {
      type: 'button', className: 'hy-entity__cover', onClick: props.onClick, disabled: props.disabled,
      'aria-labelledby': hasControls[0] ? undefined : labelId,
      'aria-hidden': hasControls[0] ? 'true' : undefined, tabIndex: hasControls[0] ? -1 : undefined
    }) : null,
    h('div', { id: labelId, className: cx('hy-entity__left', props.leftClassName) }, props.left, props.children),
    props.right ? h('div', { className: cx('hy-entity__right', props.rightClassName) }, props.right) : null);
}

/* The list's children as { el, key }, with a Fragment's children in its place (a Fragment of rows is rows, not one row). */
function entityRows(children, prefix, out) {
  React.Children.toArray(children).forEach(function (c) {
    if (React.isValidElement(c) && c.type === React.Fragment) entityRows(c.props.children, prefix + c.key + '/', out);
    else out.push({ el: c, key: prefix + (React.isValidElement(c) && c.key != null ? c.key : out.length) });
  });
  return out;
}

/* A list whose rows can be reordered. It never reorders itself: onReorder(from, to) tells the app, which moves the item in its
   data and re-renders the rows. A moved row's handle keeps focus: the keyed DOM move can drop it, so it is given back after the render. */
function EntityReorderList(props) {
  var rest = omit(props, ['className', 'children', 'onReorder']);
  var ds = useState(null), drag = ds[0], setDrag = ds[1];
  var ms = useState({ text: '', n: 0 }), said = ms[0], setSaid = ms[1];
  var rows = entityRows(props.children, '', []);
  var count = rows.filter(function (r) { return React.isValidElement(r.el); }).length;
  var live = useRef({});
  var focusEl = useRef(null);
  live.current = { count: count, onReorder: props.onReorder };
  var editor = useMemo(function () {
    return entityReorderEditor({
      getCount: function () { return live.current.count; },
      emit: function (from, to, name) {
        if (live.current.onReorder) live.current.onReorder(from, to);
        setSaid(function (s) { return { text: reorderMessage(name, to, live.current.count), n: s.n + 1 }; });
      }
    });
  }, []);
  useLayoutEffect(function () {
    var el = focusEl.current;
    focusEl.current = null;
    if (el && el.isConnected && document.activeElement !== el) el.focus();
  });

  function startDrag(from, e, name) {
    var handle = e.currentTarget, listEl = handle.closest('.hy-entity-list'), rowEl = handle.closest('[data-entity-index]');
    var x0 = e.clientX, y0 = e.clientY, active = false, done = false, target = null;
    function rowAt(ev) {
      var el = document.elementFromPoint(ev.clientX, ev.clientY);
      var row = el && el.closest('[data-entity-index]');
      return row && row.closest('.hy-entity-list') === listEl ? parseInt(row.getAttribute('data-entity-index'), 10) : null;
    }
    function move(ev) {
      if (!active) {
        if (!dragStarted(ev.clientX - x0, ev.clientY - y0)) return;
        active = true;
        /* The dragged row is inert while it is carried; the handle gets focus back when it lands or the drag is cancelled. */
        if (rowEl) rowEl.setAttribute('inert', '');
        if (window.getSelection) window.getSelection().removeAllRanges();
      }
      var over = rowAt(ev);
      target = over != null && over !== from ? over : null;
      setDrag({ from: from, target: target, side: target == null ? null : dropSide(from, target), dy: ev.clientY - y0 });
    }
    function finish(commit) {
      if (done) return;
      done = true;
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      document.removeEventListener('pointercancel', cancel);
      document.removeEventListener('keydown', esc, true);
      if (active) {
        if (rowEl) rowEl.removeAttribute('inert');
        focusEl.current = handle;
        /* The release that ends a drag must not also open the handle's menu. */
        var swallow = function (ev) { ev.stopPropagation(); ev.preventDefault(); };
        document.addEventListener('click', swallow, true);
        setTimeout(function () { document.removeEventListener('click', swallow, true); }, 0);
        if (commit && target != null) editor.drop(from, target, name);
      }
      setDrag(null);
    }
    function up() { finish(true); }
    function cancel() { finish(false); }
    function esc(ev) { if (ev.key === 'Escape') { ev.stopPropagation(); finish(false); } }
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
    document.addEventListener('pointercancel', cancel);
    document.addEventListener('keydown', esc, true);
  }

  var at = 0;
  var wrapped = rows.map(function (item) {
    var child = item.el;
    if (!React.isValidElement(child)) return child;
    var index = at++;
    return h(EntityRowContext.Provider, {
      key: item.key,
      value: {
        index: index, count: count, drag: drag,
        act: function (action, name, el) { focusEl.current = el; editor.act(index, action, name); },
        key: function (e, name, el) { var ok = editor.key(index, e, name); if (ok) focusEl.current = el; return ok; },
        startDrag: function (e, name) { startDrag(index, e, name); }
      }
    }, child);
  });
  return h(React.Fragment, null,
    h(EntityListContext.Provider, { value: true },
      h('ul', Object.assign({ role: 'list' }, rest, { className: cx('hy-entity-list', drag && 'is-reordering', props.className) }), wrapped)),
    h('div', { className: 'hy-sr', 'aria-live': 'polite', 'aria-atomic': 'true' }, entityLiveText(said)));
}

function EntityList(props) {
  if (props.onReorder) return h(EntityReorderList, props);
  var rest = omit(props, ['className', 'children']);
  return h(EntityListContext.Provider, { value: true },
    h('ul', Object.assign({ role: 'list' }, rest, { className: cx('hy-entity-list', props.className) }), props.children));
}

Entity.Content = EntityContent;
Entity.List = EntityList;

define('Entity', Entity);
define('EntityContent', EntityContent);
define('EntityList', EntityList);
