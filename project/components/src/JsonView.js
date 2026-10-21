function makeJsonViewHighlightPattern(terms) {
  var list = (Array.isArray(terms) ? terms : [terms]).filter(function (t) { return t != null && String(t).trim() !== ''; });
  if (!list.length) return null;
  return new RegExp('(' + list.map(function (t) { return String(t).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'gi');
}

var JV_IDENT = /^[A-Za-z_$][\w$]*$/;
function jvKind(v) {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v === 'object' ? 'object' : typeof v;
}
function jvEntries(v) {
  return Array.isArray(v) ? v.map(function (x, i) { return [i, x]; }) : Object.keys(v).map(function (k) { return [k, v[k]]; });
}
function jvText(v) {
  var k = jvKind(v);
  if (k === 'string') return JSON.stringify(v);
  if (k === 'undefined') return 'undefined';
  return String(v);
}
function jvIsContainer(v) { var k = jvKind(v); return k === 'object' || k === 'array'; }
/* one short primitive entry stays on one line: { name: "web" } */
function jvInline(v) {
  if (!jvIsContainer(v)) return false;
  var e = jvEntries(v);
  if (!e.length) return true;
  if (e.length > 1 || jvIsContainer(e[0][1])) return false;
  return String(e[0][0]).length + jvText(e[0][1]).length <= 32;
}

function JsonView(props) {
  var data = props.data;
  var depthDefault = props.defaultExpandDepth == null ? 1 : props.defaultExpandDepth;
  var pattern = props.highlightPattern;
  var ov = useState({}), overrides = ov[0], setOverrides = ov[1];
  var fs = useState('$'), focused = fs[0], setFocused = fs[1];
  var refs = useRef({});

  function isOpen(path, depth) { return Object.prototype.hasOwnProperty.call(overrides, path) ? overrides[path] : depth < depthDefault; }
  function setOpen(path, open) { setOverrides(function (o) { var n = Object.assign({}, o); n[path] = open; return n; }); }

  /* flat list of visible items, in reading order, for the keyboard */
  var visible = [];
  function walk(v, path, depth, parent) {
    var expandable = jvIsContainer(v) && !jvInline(v);
    var open = expandable && isOpen(path, depth);
    visible.push({ path: path, parent: parent, expandable: expandable, open: open });
    if (open) jvEntries(v).forEach(function (e) { walk(e[1], path + '\u0000' + e[0], depth + 1, path); });
  }
  walk(data, '$', 0, null);
  var focusPath = visible.some(function (n) { return n.path === focused; }) ? focused : '$';

  function move(path) {
    setFocused(path);
    var el = refs.current[path];
    if (el) el.focus();
  }
  function onKeyDown(e) {
    var i = -1;
    for (var j = 0; j < visible.length; j++) if (visible[j].path === focusPath) i = j;
    var n = visible[i];
    if (!n) return;
    var k = e.key;
    if (k === 'ArrowDown') { if (i < visible.length - 1) move(visible[i + 1].path); }
    else if (k === 'ArrowUp') { if (i > 0) move(visible[i - 1].path); }
    else if (k === 'Home') move(visible[0].path);
    else if (k === 'End') move(visible[visible.length - 1].path);
    else if (k === 'ArrowRight') {
      if (n.expandable && !n.open) setOpen(n.path, true);
      else if (n.open && visible[i + 1]) move(visible[i + 1].path);
    } else if (k === 'ArrowLeft') {
      if (n.open) setOpen(n.path, false);
      else if (n.parent) move(n.parent);
    } else if (k === 'Enter' || k === ' ') { if (n.expandable) setOpen(n.path, !n.open); }
    else return;
    e.preventDefault();
  }

  function hl(text) {
    if (!pattern) return text;
    var re = new RegExp(pattern.source, pattern.flags.indexOf('g') < 0 ? pattern.flags + 'g' : pattern.flags);
    var out = [], last = 0, m, key = 0;
    while ((m = re.exec(text))) {
      if (!m[0]) { re.lastIndex++; continue; }
      if (m.index > last) out.push(text.slice(last, m.index));
      out.push(h('mark', { key: key++, className: 'hy-jv__mark' }, m[0]));
      last = m.index + m[0].length;
    }
    if (!out.length) return text;
    if (last < text.length) out.push(text.slice(last));
    return out;
  }
  function keyNode(k) {
    if (k == null || typeof k === 'number') return null;
    return h(React.Fragment, null, h('span', { className: 'hy-jv__key' }, hl(JV_IDENT.test(k) ? k : JSON.stringify(k))), h('span', { className: 'hy-jv__punct' }, ': '));
  }
  function prim(v) { return h('span', { className: 'hy-jv__' + jvKind(v) }, hl(jvText(v))); }
  function inlineValue(v) {
    var arr = Array.isArray(v), e = jvEntries(v);
    if (!e.length) return h('span', { className: 'hy-jv__punct' }, arr ? '[]' : '{}');
    return h(React.Fragment, null, h('span', { className: 'hy-jv__punct' }, arr ? '[ ' : '{ '), keyNode(arr ? null : e[0][0]), prim(e[0][1]), h('span', { className: 'hy-jv__punct' }, arr ? ' ]' : ' }'));
  }
  function describe(k, v) {
    var kind = jvKind(v), name;
    if (kind === 'object' || kind === 'array') {
      var n = jvEntries(v).length;
      name = kind + ', ' + n + (kind === 'array' ? (n === 1 ? ' item' : ' items') : (n === 1 ? ' key' : ' keys'));
    } else name = kind === 'string' ? v : String(v);
    if (k == null) return (kind === 'object' || kind === 'array' ? 'JSON ' : '') + name;
    return k + ': ' + name;
  }

  function item(k, v, path, depth, pos, size) {
    var expandable = jvIsContainer(v) && !jvInline(v);
    var open = expandable && isOpen(path, depth);
    var arr = Array.isArray(v);
    var comma = pos < size ? h('span', { className: 'hy-jv__punct' }, ',') : null;
    function toggle(e) {
      var sel = window.getSelection && window.getSelection();
      if (sel && String(sel).length) return;
      e.stopPropagation();
      move(path);
      if (expandable) setOpen(path, !open);
    }
    var value = expandable
      ? (open ? h('span', { className: 'hy-jv__punct' }, arr ? '[' : '{')
        : h(React.Fragment, null, h('span', { className: 'hy-jv__punct' }, arr ? '[' : '{'), h('span', { className: 'hy-jv__more' }, '…'), h('span', { className: 'hy-jv__punct' }, arr ? ']' : '}'), comma))
      : h(React.Fragment, null, jvIsContainer(v) ? inlineValue(v) : prim(v), comma);
    return h('div', {
      key: path, role: 'treeitem', className: 'hy-jv__item',
      'aria-level': depth + 1, 'aria-setsize': size, 'aria-posinset': pos,
      'aria-expanded': expandable ? open : undefined, 'aria-label': describe(typeof k === 'number' ? String(k) : k, v),
      tabIndex: path === focusPath ? 0 : -1,
      ref: function (el) { refs.current[path] = el; },
      onFocus: function (e) { if (e.target === e.currentTarget) setFocused(path); }
    },
      h('div', { className: cx('hy-jv__row', expandable && 'is-expandable'), onClick: toggle },
        expandable ? h('span', { className: cx('hy-jv__toggle', open && 'is-open'), 'aria-hidden': 'true' }, h(Glyph, { name: 'chevron', size: 12 })) : null,
        keyNode(k), value),
      open ? h('div', { role: 'group', className: 'hy-jv__group' }, jvEntries(v).map(function (e, i, all) {
        return item(arr ? i : e[0], e[1], path + '\u0000' + e[0], depth + 1, i + 1, all.length);
      })) : null,
      open ? h('div', { className: 'hy-jv__close', 'aria-hidden': 'true' }, h('span', { className: 'hy-jv__punct' }, arr ? ']' : '}'), comma) : null);
  }

  var rest = omit(props, ['data', 'defaultExpandDepth', 'highlightPattern', 'className', 'aria-label']);
  return h('div', Object.assign({}, rest, {
    role: 'tree', 'aria-label': props['aria-label'] || 'JSON', translate: 'no',
    className: cx('hy-jv', props.className), onKeyDown: onKeyDown
  }), item(null, data, '$', 0, 1, 1));
}
JsonView.makeJsonViewHighlightPattern = makeJsonViewHighlightPattern;

define('JsonView', JsonView);
define('makeJsonViewHighlightPattern', makeJsonViewHighlightPattern);
