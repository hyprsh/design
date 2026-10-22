/* Compound table: TableRoot > Table > TableColgroup/TableHeader/TableBody/TableFooter > TableRow > TableHead/TableCell.
   The data form (columns + rows) still works and renders the same parts. */
function partProps(props, base, extra) {
  return Object.assign({}, omit(props, ['className', 'children'].concat(extra || [])), { className: cx(base, props.className) });
}

function TableRoot(props) {
  return h('div', partProps(props, 'hy-table'), props.children);
}
function TableEl(props) {
  return h('table', partProps(props, cx('hy-table__table', props.stickyHeader && 'hy-table__table--sticky'), ['stickyHeader']), props.children);
}
function TableColgroup(props) { return h('colgroup', partProps(props, null), props.children); }
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
function TableHead(props) {
  var state = { scope: 'col' };
  if (props.sort) state['aria-sort'] = props.sort;
  var label = props.children;
  if (props.onSort) {
    label = h('button', { type: 'button', className: 'hy-table__sort', onClick: function () { props.onSort(); } },
      h('span', { className: 'hy-table__sort-label' }, props.children),
      h('svg', { className: cx('hy-table__sort-arrow', props.sort === 'descending' && 'is-desc'), width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true', focusable: 'false' },
        h('path', { d: 'M8 13V3M4 7l4-4 4 4' })));
  }
  return h('th', Object.assign(state, partProps(props, cx('hy-table__head', props.onSort && 'hy-table__head--sortable', props.onSort && props.sort && props.sort !== 'none' && 'is-sorted', cellClass(props)), ['align', 'wrap', 'truncate', 'sort', 'onSort'])), label);
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
  return function () {
    props.onSortChange && props.onSortChange({ key: key, direction: cur && cur.key === key && cur.direction === 'ascending' ? 'descending' : 'ascending' });
  };
}

function Table(props) {
  if (!props.columns) {
    return h(TableEl, omit(props, ['caption', 'empty', 'rows', 'isSelected', 'isCurrent', 'sort', 'onSortChange']),
      props.caption ? h('caption', { className: 'hy-sr' }, props.caption) : null, props.children);
  }
  var cols = props.columns;
  var rows = props.rows || [];
  return h(TableRoot, { className: props.className },
    h(TableEl, { stickyHeader: props.stickyHeader },
      props.caption ? h('caption', { className: 'hy-sr' }, props.caption) : null,
      h(TableHeader, null, h(TableRow, null, cols.map(function (c) {
        var active = props.sort && props.sort.key === c.key ? props.sort.direction : 'none';
        return h(TableHead, { key: c.key, align: alignOf(c), wrap: c.wrap, sort: c.sortable ? active : undefined, onSort: c.sortable ? sortClick(props, c.key) : undefined }, c.header);
      }))),
      h(TableBody, { striped: props.striped, bordered: props.bordered, interactive: props.interactive }, rows.length ? rows.map(function (r, i) {
        return h(TableRow, { key: r.id || i, selected: props.isSelected ? props.isSelected(r) : undefined, current: props.isCurrent ? props.isCurrent(r) : undefined }, cols.map(function (c) {
          var v = c.render ? c.render(r) : r[c.key];
          return h(TableCell, { key: c.key, align: alignOf(c), wrap: c.wrap, truncate: c.truncate, className: cx(c.numeric && 'hy-num', c.mono && 'hy-mono') }, v);
        }));
      }) : h(TableRow, null, h(TableCell, { colSpan: cols.length, className: 'hy-table__empty' }, props.empty || 'Nothing here yet.')))));
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
