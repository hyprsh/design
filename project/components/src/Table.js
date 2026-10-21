/* Compound table: TableRoot > Table > TableColgroup/TableHeader/TableBody/TableFooter > TableRow > TableHead/TableCell.
   The data form (columns + rows) still works and renders the same parts. */
function partProps(props, base, extra) {
  return Object.assign({}, omit(props, ['className', 'children'].concat(extra || [])), { className: cx(base, props.className) });
}

function TableRoot(props) {
  return h('div', partProps(props, 'hy-table'), props.children);
}
function TableEl(props) {
  return h('table', partProps(props, 'hy-table__table'), props.children);
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
function TableRow(props) { return h('tr', partProps(props, 'hy-table__row'), props.children); }
function TableHead(props) {
  return h('th', Object.assign({ scope: 'col' }, partProps(props, 'hy-table__head')), props.children);
}
function TableCell(props) { return h('td', partProps(props, 'hy-table__cell'), props.children); }

function alignClass(c) {
  if (c.align === 'right' || (c.numeric && c.align !== 'left')) return 'hy-right';
  if (c.align === 'left') return 'hy-left';
  return null;
}

function Table(props) {
  if (!props.columns) {
    return h(TableEl, omit(props, ['caption', 'empty', 'rows']),
      props.caption ? h('caption', { className: 'hy-sr' }, props.caption) : null, props.children);
  }
  var cols = props.columns;
  var rows = props.rows || [];
  return h(TableRoot, { className: props.className },
    h(TableEl, null,
      props.caption ? h('caption', { className: 'hy-sr' }, props.caption) : null,
      h(TableHeader, null, h(TableRow, null, cols.map(function (c) {
        return h(TableHead, { key: c.key, className: alignClass(c) }, c.header);
      }))),
      h(TableBody, { striped: props.striped, bordered: props.bordered, interactive: props.interactive }, rows.length ? rows.map(function (r, i) {
        return h(TableRow, { key: r.id || i }, cols.map(function (c) {
          var v = c.render ? c.render(r) : r[c.key];
          return h(TableCell, { key: c.key, className: cx(alignClass(c), c.numeric && 'hy-num', c.mono && 'hy-mono') }, v);
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
