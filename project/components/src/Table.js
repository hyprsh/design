/* Compound table: TableRoot > Table > TableColgroup/TableHeader/TableBody/TableFooter > TableRow > TableHead/TableCell.
   The data form (columns + rows) still works and renders the same parts. */
function partProps(props, base, extra) {
  return Object.assign({}, omit(props, ['className', 'children'].concat(extra || [])), { className: cx(base, props.className) });
}

function TableRoot(props) {
  return h('div', partProps(props, 'hy-table'), props.children);
}
/* Once the widths are measured, a resizable table is laid out fixed with a <col> per column, inserted after the caption
   (the slot is always there, so the other children keep their positions), and is as wide as layoutTable says. */
function TableEl(props) {
  var ctx = React.useContext(widthsContext());
  var lay = ctx && ctx.ready ? ctx.layout : null;
  var base = partProps(props, cx('hy-table__table', props.stickyHeader && 'hy-table__table--sticky', lay && 'hy-table__table--resizable', lay && ctx.dragging != null && 'is-resizing'), ['stickyHeader']);
  if (ctx) base.ref = ctx.tableRef;
  if (lay) base.style = Object.assign({}, props.style, { width: lay.css });
  var kids = Array.isArray(props.children) ? props.children.slice() : [props.children];
  var at = kids[0] == null || kids[0].type === 'caption' ? 1 : 0;
  kids.splice(at, 0, lay ? h('colgroup', { className: 'hy-table__cols' }, lay.widths.map(function (w, i) {
    return h('col', { key: i, style: w == null ? undefined : { width: w + 'px' } });
  })) : null);
  return h.apply(null, ['table', base].concat(kids));
}
/* In a resizable table the generated <col>s replace the app's: their widths were measured as the defaults. */
function TableColgroup(props) {
  var ctx = React.useContext(widthsContext());
  if (ctx && ctx.ready) return null;
  return h('colgroup', partProps(props, null), props.children);
}
function TableCol(props) { return h('col', partProps(props, null)); }
function TableHeader(props) { return h('thead', partProps(props, 'hy-table__header'), props.children); }
function TableBody(props) {
  return h('tbody', partProps(props, cx('hy-table__body',
    props.striped && 'hy-table__body--striped',
    props.bordered && 'hy-table__body--bordered',
    props.interactive && 'hy-table__body--interactive',
    props.virtualize && 'hy-table__body--virtualize'), ['striped', 'bordered', 'interactive', 'virtualize']), props.children);
}
function TableFooter(props) { return h('tfoot', partProps(props, 'hy-table__footer'), props.children); }
/* selected -> aria-selected, current -> aria-current; an explicit aria-* prop wins. */
function TableRow(props) {
  var state = {};
  if (props.selected) state['aria-selected'] = true;
  if (props.current) state['aria-current'] = props.current === true ? 'true' : props.current;
  return h('tr', Object.assign(state, partProps(props, cx('hy-table__row', props.selected && 'is-selected', props.current && 'is-current'), ['selected', 'current'])), props.children);
}
/* sort -> aria-sort on the th. onSort -> the label becomes a full-cell button with a decorative arrow (before the label when right-aligned). */
/* resizable + columnKey -> a resize handle on the trailing edge, outside the sort button, once Table has measured the widths.
   The head registers its declared width and limits with Table, and its element so Table can find it in the header row. */
function TableHead(props) {
  var ctx = React.useContext(widthsContext());
  var uid = useId();
  var key = props.columnKey;
  var resizable = !!(ctx && props.resizable && key != null);
  var labelId = resizable ? uid + '-label' : undefined;
  var state = { scope: 'col' };
  if (props.sort) state['aria-sort'] = props.sort;
  if (resizable) {
    ctx.heads[key] = { width: props.width, minWidth: props.minWidth, maxWidth: props.maxWidth };
    state.ref = function (el) { if (el) ctx.els[key] = el; };
  }
  var label = props.children;
  if (props.onSort) {
    label = h('button', { type: 'button', className: 'hy-table__sort', disabled: props.sortDisabled || undefined, onClick: function (e) { props.onSort(e); } },
      h('span', { className: 'hy-table__sort-label', id: labelId }, props.children),
      h('svg', { className: cx('hy-table__sort-arrow', props.sort === 'descending' && 'is-desc'), width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', focusable: 'false' },
        h('path', { d: 'M8 13V3M4 7l4-4 4 4' })));
  } else if (resizable) {
    label = h('span', { className: 'hy-table__head-label', id: labelId }, props.children);
  }
  var th = Object.assign(state, partProps(props, cx('hy-table__head', props.onSort && 'hy-table__head--sortable', props.onSort && props.sort && props.sort !== 'none' && 'is-sorted', resizable && 'hy-table__head--resizable', cellClass(props)),
    ['align', 'wrap', 'truncate', 'sort', 'onSort', 'sortDisabled', 'resizable', 'columnKey', 'minWidth', 'maxWidth'].concat(resizable ? ['width'] : [])));
  if (!(resizable && ctx.ready)) return h('th', th, label);
  /* Sticky heads are stacking contexts and the handle overhangs the next head, so each sits above the heads after it. */
  if (ctx.sticky) th.style = Object.assign({}, props.style, { zIndex: ctx.stack(key) });
  return h('th', th, label, resizeHandle(ctx, key, labelId));
}
/* The resize handle: a focusable vertical separator named by the header label. Pointer and keys go to Table; while loading
   it stays visible but inert, like the sort button. Its events never reach the sort button or the row. */
function resizeHandle(ctx, key, labelId) {
  var lim = ctx.limits(key);
  var inert = ctx.loading;
  function stop(e) { e.stopPropagation(); }
  return h('div', {
    className: cx('hy-table__resize', ctx.dragging === key && 'is-dragging'),
    role: 'separator', 'aria-orientation': 'vertical', 'aria-labelledby': labelId,
    'aria-valuenow': ctx.width(key), 'aria-valuemin': lim.min, 'aria-valuemax': lim.max,
    'aria-disabled': inert ? 'true' : undefined, tabIndex: inert ? undefined : 0,
    onPointerDown: function (e) {
      e.stopPropagation();
      if (inert || e.button !== 0) return;
      e.preventDefault();
      ctx.startDrag(key, e);
    },
    onClick: stop,
    onDoubleClick: function (e) { e.stopPropagation(); if (!inert) ctx.reset(key); },
    onKeyDown: function (e) { if (!inert) ctx.keyDown(key, e); },
  });
}
function TableCell(props) { return h('td', partProps(props, cx('hy-table__cell', cellClass(props)), ['align', 'wrap', 'truncate']), props.children); }

/* align: 'left' | 'center' | 'right'. wrap: normal white-space, no max width. truncate: fill the column, end in an ellipsis. */
function cellClass(c) {
  return cx(c.align && 'hy-table__cell--' + c.align, c.wrap && 'hy-table__cell--wrap', c.truncate && !c.wrap && 'hy-table__cell--truncate');
}
function alignOf(c) { return c.align || (c.numeric ? 'right' : undefined); }
/* Data form: the app owns the order. Clicking a new column asks for ascending, the active one flips. */
function sortClick(props, key) {
  var cur = props.sort;
  return function (event) {
    props.onSortChange && props.onSortChange({ key: key, direction: cur && cur.key === key && cur.direction === 'ascending' ? 'descending' : 'ascending' }, event);
  };
}

/* One decorative placeholder row. columns sizes each cell like its column, count draws that many plain cells; index (the row's
   position) shifts the widths of the plain columns so repeated rows don't look stamped. aria-hidden: the table announces loading. */
var SKELETON_WIDTHS = ['72%', '56%', '84%', '64%', '48%'];
function skeletonWidth(c, row, col) {
  if (c && c.numeric) return '35%';
  if (c && (c.mono || c.truncate)) return '60%';
  return SKELETON_WIDTHS[(row + col * 2) % SKELETON_WIDTHS.length];
}
function TableSkeletonRow(props) {
  var cols = props.columns || Array.apply(null, Array(props.count || 0));
  var row = props.index || 0;
  return h('tr', Object.assign({}, partProps(props, cx('hy-table__row', 'hy-table__row--skeleton'), ['columns', 'count', 'index']), { 'aria-hidden': 'true' }),
    cols.map(function (c, i) {
      var align = c ? alignOf(c) : undefined;
      var style = align === 'right' ? { marginLeft: 'auto' } : align === 'center' ? { marginLeft: 'auto', marginRight: 'auto' } : undefined;
      return h(TableCell, { key: c ? c.key : i, align: align, wrap: c && c.wrap, truncate: c && c.truncate },
        h(HY.Skeleton, { width: skeletonWidth(c, row, i), height: 16, style: style }));
    }));
}

/* ---- Resizable columns (ADR 0002) ----
   Pure width maths first, then TableWidths, which owns the widths for both forms and hands them to the parts through
   a context. A column, as measured once on first render:
   { key, resizable, truncate, def (default px), min, max }. Truncate columns have no width of their own: they share
   what is left of the row, down to their min, after which the table grows. Columns that aren't resizable keep the
   width the browser gave them (def = min = max). Measured widths stay fractional, so the row still adds up; the widths
   a drag or a key stores are whole px. widths holds only the columns that differ from their default. */
var MIN_COLUMN = 48, STEP = 8, BIG_STEP = 32;
function columnMin(measured, minWidth) { return Math.max(MIN_COLUMN, minWidth != null ? minWidth : Math.ceil(measured || 0)); }
function columnMax(min, maxWidth) { return maxWidth != null ? Math.max(min, maxWidth) : Infinity; }
function clampWidth(w, lo, hi) { return Math.min(Math.max(w, lo), Math.max(lo, hi)); }
function hasWidth(widths, key) { return !!widths && Object.prototype.hasOwnProperty.call(widths, key) && typeof widths[key] === 'number'; }
function resolveWidth(c, widths) {
  if (c.truncate) return null;
  return clampWidth(c.resizable && hasWidth(widths, c.key) ? widths[c.key] : c.def, c.min, c.max);
}
/* widths: px per column (null for truncate); tableWidth and truncateWidth for a container width; css for the table's width,
   so the browser follows the container on its own: at least 100% with a truncate column, else the sum of the columns. */
function layoutTable(cols, widths, container) {
  var fixed = 0, truncMin = 0, n = 0;
  var ws = cols.map(function (c) {
    if (c.truncate) { truncMin += c.min; n++; return null; }
    var w = resolveWidth(c, widths);
    fixed += w;
    return w;
  });
  var need = fixed + truncMin;
  var tableWidth = n ? Math.max(container || 0, need) : fixed;
  return { widths: ws, tableWidth: tableWidth, truncateWidth: n ? (tableWidth - fixed) / n : null, css: n ? 'max(100%, ' + need + 'px)' : fixed + 'px' };
}
/* min and the drag's cap (dragMax: maxWidth, or null for none). With stickyHeader the table must stay inside its container,
   so the cap is also what the other columns and the truncate minimums leave. max is what End jumps to and aria-valuemax:
   the cap, or the container's width when there is none. */
function columnLimits(cols, widths, key, opts) {
  var c = cols.filter(function (x) { return x.key === key && x.resizable; })[0];
  if (!c) return { min: MIN_COLUMN, max: MIN_COLUMN, dragMax: MIN_COLUMN };
  var dragMax = c.max === Infinity ? null : c.max;
  if (opts.sticky && opts.container) {
    var rest = 0;
    cols.forEach(function (o) { if (o !== c) rest += o.truncate ? o.min : resolveWidth(o, widths); });
    var room = Math.max(c.min, opts.container - rest);
    dragMax = dragMax == null ? room : Math.min(dragMax, room);
  }
  /* With no cap, a column already dragged past the container keeps its width under the arrow keys. */
  return { min: c.min, max: dragMax != null ? dragMax : Math.max(c.min, opts.container || 0, Math.round(resolveWidth(c, widths))), dragMax: dragMax };
}
/* A key on the handle: the new width in whole px, 'reset' for Enter, or null when the key isn't the handle's. */
function keyWidth(e, w, lim) {
  var step = e.shiftKey ? BIG_STEP : STEP;
  switch (e.key) {
    case 'ArrowLeft': return Math.floor(clampWidth(Math.round(w) - step, lim.min, lim.max));
    case 'ArrowRight': return Math.floor(clampWidth(Math.round(w) + step, lim.min, lim.max));
    case 'Home': return Math.ceil(lim.min);
    case 'End': return Math.floor(Math.max(lim.min, lim.max));
    case 'Enter': return 'reset';
    default: return null;
  }
}
/* Stored widths are whole px and a measured default may not be, so back at the rounded default the key goes. */
function withWidth(widths, key, w, def) {
  var next = Object.assign({}, widths);
  if (w === Math.round(def)) delete next[key]; else next[key] = w;
  return next;
}
/* The resize behaviour without the DOM. emit(widths, { key, phase }) fires on every change: 'drag' while the pointer moves,
   'end' on release (only after a move), on each keyboard step and on reset. c is { key, width, def, min, max, dragMax }. */
function columnWidthEditor(o) {
  function commit(c, w, phase) {
    var next = withWidth(o.getWidths() || {}, c.key, w, c.def);
    o.emit(next, { key: c.key, phase: phase });
    return next;
  }
  function reset(key) {
    var cur = o.getWidths() || {};
    if (!Object.prototype.hasOwnProperty.call(cur, key)) return;
    var next = Object.assign({}, cur);
    delete next[key];
    o.emit(next, { key: key, phase: 'end' });
  }
  return {
    start: function (c, x0) {
      var prev = c.width, last = null;
      return {
        move: function (x) {
          var w = Math.floor(clampWidth(Math.round(c.width + x - x0), c.min, c.dragMax == null ? Infinity : c.dragMax));
          if (w === prev) return;
          prev = w;
          last = commit(c, w, 'drag');
        },
        end: function () {
          if (last) o.emit(last, { key: c.key, phase: 'end' });
          last = null;
        },
      };
    },
    key: function (c, e) {
      var w = keyWidth(e, c.width, c);
      if (w == null) return false;
      if (w === 'reset') reset(c.key);
      else if (w !== c.width) commit(c, w, 'end');
      return true;
    },
    reset: reset,
  };
}

/* Created on first use, so the pure parts above run without React (see test/table-resize.test.mjs). */
var widthsCtx = null;
function widthsContext() { return widthsCtx || (widthsCtx = React.createContext(null)); }

/* The header content's width: the head's children copied into an invisible probe (one line, or the longest word for a
   wrap column), plus the cell's padding. */
function measureHeadMin(cell) {
  var probe = document.createElement('span');
  var wrap = cell.classList.contains('hy-table__cell--wrap');
  probe.style.cssText = 'position:absolute;top:0;left:0;visibility:hidden;pointer-events:none;white-space:' + (wrap ? 'normal;width:min-content' : 'nowrap;width:max-content');
  Array.prototype.forEach.call(cell.childNodes, function (n) {
    if (n.nodeType === 1 && n.classList.contains('hy-table__resize')) return;
    var copy = n.cloneNode(true);
    if (copy.nodeType === 1) { copy.removeAttribute('id'); Array.prototype.forEach.call(copy.querySelectorAll('[id]'), function (x) { x.removeAttribute('id'); }); }
    probe.appendChild(copy);
  });
  cell.appendChild(probe);
  var cs = getComputedStyle(cell);
  var w = probe.getBoundingClientRect().width + (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
  cell.removeChild(probe);
  return w;
}

/* Owns the widths for both forms (controlled through columnWidths, else defaultColumnWidths). The first render is the plain
   auto layout; a layout effect then measures each header cell once (its width as the default, its content as the minimum)
   and switches the table to the fixed layout. It measures again only when the header's columns change. It waits while
   `pending` (loading, or the data form has no rows yet), so the defaults come from real content, not skeletons. */
function TableWidths(props) {
  var ctl = useControllable(props.columnWidths, props.defaultColumnWidths || {});
  var widths = ctl[0] || {};
  var ms = useState(null), measured = ms[0], setMeasured = ms[1];
  var ds = useState(null), dragging = ds[0], setDragging = ds[1];
  var cs = useState(0), container = cs[0], setContainer = cs[1];
  var tableRef = useRef(null);
  var reg = useRef({ heads: {}, els: {} }).current;
  var live = useRef({});
  live.current = { widths: widths, set: ctl[1], onChange: props.onColumnWidthsChange };
  var editor = useMemo(function () {
    return columnWidthEditor({
      getWidths: function () { return live.current.widths; },
      emit: function (next, meta) {
        live.current.widths = next;
        live.current.set(next);
        if (live.current.onChange) live.current.onChange(next, meta);
      },
    });
  }, []);

  useLayoutEffect(function () {
    if (props.pending && !measured) return;
    var table = tableRef.current;
    var row = table && table.tHead && table.tHead.rows[0];
    var info = [], any = false;
    if (row) Array.prototype.forEach.call(row.cells, function (cell) {
      var key = null;
      Object.keys(reg.els).forEach(function (k) { if (reg.els[k] === cell) key = k; });
      var truncate = key == null && cell.classList.contains('hy-table__cell--truncate');
      if (key != null) any = true;
      info.push({ cell: cell, key: key, truncate: truncate });
    });
    if (!any) { if (measured) setMeasured(null); return; }
    var sig = info.map(function (i) { return i.key != null ? 'k:' + i.key : i.truncate ? 't' : '-'; }).join('|');
    if (measured && measured.sig === sig) return;
    if (measured) { setMeasured(null); return; }
    setContainer(table.parentNode ? table.parentNode.clientWidth : 0);
    setMeasured({ sig: sig, cols: info.map(function (i) {
      return { key: i.key, resizable: i.key != null, truncate: i.truncate, width: i.cell.getBoundingClientRect().width,
        min: i.key != null || i.truncate ? measureHeadMin(i.cell) : 0 };
    }) });
  });
  var ready = !!measured;
  useEffect(function () {
    var parent = ready && tableRef.current && tableRef.current.parentNode;
    if (!parent || typeof ResizeObserver === 'undefined') return;
    var ro = new ResizeObserver(function () { setContainer(parent.clientWidth); });
    ro.observe(parent);
    return function () { ro.disconnect(); };
  }, [ready]);

  var cols = measured ? measured.cols.map(function (m) {
    if (m.resizable) {
      var d = reg.heads[m.key] || {};
      var min = columnMin(m.min, d.minWidth);
      return { key: m.key, resizable: true, truncate: false, def: d.width != null ? d.width : m.width, min: min, max: columnMax(min, d.maxWidth) };
    }
    if (m.truncate) return { key: null, resizable: false, truncate: true, def: 0, min: columnMin(m.min), max: Infinity };
    return { key: null, resizable: false, truncate: false, def: m.width, min: m.width, max: m.width };
  }) : null;
  function colOf(key) { return cols.filter(function (c) { return c.key === key; })[0]; }
  function currentContainer() {
    var p = tableRef.current && tableRef.current.parentNode;
    return p ? p.clientWidth : container;
  }
  function limits(key, box) { return columnLimits(cols, widths, key, { sticky: !!props.stickyHeader, container: box == null ? container : box }); }
  function session(key) {
    var c = colOf(key), lim = limits(key, currentContainer());
    return { key: key, width: resolveWidth(c, widths), def: c.def, min: lim.min, max: lim.max, dragMax: lim.dragMax };
  }

  var ctx = {
    ready: ready && !!cols && cols.some(function (c) { return c.resizable; }),
    heads: reg.heads, els: reg.els, tableRef: tableRef, loading: !!props.loading, dragging: dragging, sticky: !!props.stickyHeader,
    stack: function (key) { return 1 + cols.length - cols.indexOf(colOf(key)); },
    layout: cols ? layoutTable(cols, widths, container) : null,
    width: function (key) { var c = colOf(key); return c ? Math.round(resolveWidth(c, widths)) : 0; },
    limits: function (key) { var l = limits(key); return { min: Math.round(l.min), max: Math.round(l.max) }; },
    startDrag: function (key, e) {
      var el = e.currentTarget, id = e.pointerId, done = false;
      var s = editor.start(session(key), e.clientX);
      function move(ev) { s.move(ev.clientX); }
      function end() {
        if (done) return;
        done = true;
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', end);
        el.removeEventListener('pointercancel', end);
        el.removeEventListener('lostpointercapture', end);
        s.end();
        setDragging(null);
      }
      try { el.setPointerCapture(id); } catch (err) { /* not capturable: the listeners still see moves over the handle */ }
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
      el.addEventListener('lostpointercapture', end);
      setDragging(key);
    },
    keyDown: function (key, e) { if (editor.key(session(key), e)) e.preventDefault(); },
    reset: function (key) { editor.reset(key); },
  };
  return h(widthsContext().Provider, { value: ctx }, props.children);
}

function Table(props) {
  if (!props.columns) {
    return h(TableWidths, { columnWidths: props.columnWidths, defaultColumnWidths: props.defaultColumnWidths, onColumnWidthsChange: props.onColumnWidthsChange, stickyHeader: props.stickyHeader, loading: props.loading, pending: !!props.loading },
      h(TableEl, omit(props, ['caption', 'empty', 'rows', 'isSelected', 'isCurrent', 'sort', 'onSortChange', 'loading', 'columnWidths', 'defaultColumnWidths', 'onColumnWidthsChange']),
        props.caption ? h('caption', { className: 'hy-sr' }, props.caption) : null, props.children));
  }
  var cols = props.columns;
  var rows = props.rows || [];
  var skeletons = props.loading === true ? 5 : typeof props.loading === 'number' && props.loading > 0 ? Math.floor(props.loading) : 0;
  var loading = skeletons > 0;
  var caption = loading ? (props.caption ? props.caption + ', loading' : 'Loading') : props.caption;
  var resizable = cols.some(function (c) { return c.resizable && !c.truncate; });
  var tree = h(TableRoot, { className: props.className },
    h(TableEl, { stickyHeader: props.stickyHeader, 'aria-busy': loading ? 'true' : undefined },
      caption ? h('caption', { className: 'hy-sr' }, caption) : null,
      h(TableHeader, null, h(TableRow, null, cols.map(function (c) {
        var active = props.sort && props.sort.key === c.key ? props.sort.direction : 'none';
        var head = { key: c.key, align: alignOf(c), wrap: c.wrap, sort: c.sortable ? active : undefined, onSort: c.sortable ? sortClick(props, c.key) : undefined, sortDisabled: loading };
        if (resizable) Object.assign(head, { truncate: c.truncate, resizable: !!c.resizable && !c.truncate, columnKey: c.key, width: c.width, minWidth: c.minWidth, maxWidth: c.maxWidth });
        return h(TableHead, head, c.header);
      }))),
      h(TableBody, { striped: props.striped, bordered: props.bordered, interactive: props.interactive }, loading ? Array.apply(null, Array(skeletons)).map(function (_, i) {
        return h(TableSkeletonRow, { key: i, columns: cols, index: i });
      }) : rows.length ? rows.map(function (r, i) {
        return h(TableRow, { key: r.id || i, selected: props.isSelected ? props.isSelected(r) : undefined, current: props.isCurrent ? props.isCurrent(r) : undefined }, cols.map(function (c) {
          var v = c.render ? c.render(r) : r[c.key];
          return h(TableCell, { key: c.key, align: alignOf(c), wrap: c.wrap, truncate: c.truncate, className: cx(c.numeric && 'hy-num', c.mono && 'hy-mono') }, v);
        }));
      }) : h(TableRow, null, h(TableCell, { colSpan: cols.length, className: 'hy-table__empty' }, props.empty || 'Nothing here yet.')))));
  if (!resizable) return tree;
  return h(TableWidths, { columnWidths: props.columnWidths, defaultColumnWidths: props.defaultColumnWidths, onColumnWidthsChange: props.onColumnWidthsChange, stickyHeader: props.stickyHeader, loading: loading, pending: loading || !rows.length }, tree);
}

Table.Root = TableRoot;
Table.Colgroup = TableColgroup;
Table.Col = TableCol;
Table.Header = TableHeader;
Table.Body = TableBody;
Table.Footer = TableFooter;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;
Table.SkeletonRow = TableSkeletonRow;

define('Table', Table);
define('TableRoot', TableRoot);
define('TableColgroup', TableColgroup);
define('TableCol', TableCol);
define('TableHeader', TableHeader);
define('TableBody', TableBody);
define('TableFooter', TableFooter);
define('TableRow', TableRow);
define('TableHead', TableHead);
define('TableCell', TableCell);
define('TableSkeletonRow', TableSkeletonRow);
