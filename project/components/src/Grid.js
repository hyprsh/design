/* Responsive values are a scalar or { sm, md, lg }. Each breakpoint falls back to the one below it.
   Breakpoints are container widths of the Grid: md >= 600px, lg >= 960px. */
function gridBp(v, fallback) {
  var o = v !== null && typeof v === 'object' ? v : { sm: v };
  var sm = o.sm !== undefined ? o.sm : (o.md !== undefined ? o.md : (o.lg !== undefined ? o.lg : fallback));
  var md = o.md !== undefined ? o.md : sm;
  var lg = o.lg !== undefined ? o.lg : md;
  return { sm: sm, md: md, lg: lg };
}

function GridSystem(props) {
  var w = props.guideWidth !== undefined ? props.guideWidth : 1;
  var style = Object.assign({ '--hy-guide-w': w + 'px' }, props.style);
  return h('div', {
    className: cx('hy-grid-system', props.dashedGuides && 'hy-grid-system--dashed', props.debug && 'hy-grid-system--debug', props.className),
    style: style
  }, props.children);
}

function GridGuides(p) {
  var cells = [];
  for (var r = 1; r <= p.rows; r++) {
    for (var c = 1; c <= p.columns; c++) {
      cells.push(h('div', {
        key: r + '-' + c,
        className: cx('hy-grid__guide', c === p.columns && 'is-last-col', r === p.rows && 'is-last-row')
      }));
    }
  }
  return h('div', {
    className: cx('hy-grid__guides', p.bp && 'hy-grid__guides--' + p.bp),
    style: { gridTemplateColumns: 'repeat(' + p.columns + ', minmax(0, 1fr))', gridTemplateRows: 'repeat(' + p.rows + ', 1fr)' }
  }, cells);
}

function Grid(props) {
  var cols = gridBp(props.columns, 1);
  var rows = gridBp(props.rows, 1);
  var same = cols.sm === cols.md && cols.md === cols.lg && rows.sm === rows.md && rows.md === rows.lg;
  var style = Object.assign({
    '--hy-cols-sm': cols.sm, '--hy-cols-md': cols.md, '--hy-cols-lg': cols.lg,
    '--hy-rows-sm': rows.sm, '--hy-rows-md': rows.md, '--hy-rows-lg': rows.lg
  }, props.style);
  var guides = same
    ? h(GridGuides, { columns: cols.sm, rows: rows.sm })
    : ['sm', 'md', 'lg'].map(function (b) { return h(GridGuides, { key: b, bp: b, columns: cols[b], rows: rows[b] }); });
  return h('div', {
    className: cx('hy-grid',
      props.height === 'preserve-aspect-ratio' && 'hy-grid--square',
      props.hideGuides === 'row' && 'hy-grid--hide-row',
      props.hideGuides === 'column' && 'hy-grid--hide-column',
      props.className),
    style: style
  },
    h('div', { className: 'hy-grid__inner' },
      h('div', { className: 'hy-grid__decor', 'aria-hidden': 'true' }, guides),
      props.children,
      h('div', { className: 'hy-grid__frame', 'aria-hidden': 'true' })));
}

function GridCell(props) {
  var col = gridBp(props.column, 'auto');
  var row = gridBp(props.row, 'auto');
  var style = Object.assign({
    '--hy-c-sm': String(col.sm), '--hy-c-md': String(col.md), '--hy-c-lg': String(col.lg),
    '--hy-r-sm': String(row.sm), '--hy-r-md': String(row.md), '--hy-r-lg': String(row.lg)
  }, props.style);
  return h('div', { className: cx('hy-grid__cell', props.solid && 'hy-grid__cell--solid', props.className), style: style }, props.children);
}

/* A cross marks a guide intersection. column/row are 1-based grid lines, so a 3-column grid has lines 1–4. */
function GridCross(props) {
  return h('div', {
    className: cx('hy-grid__cross', props.className), 'aria-hidden': 'true',
    style: { '--hy-x': props.column || 1, '--hy-y': props.row || 1 }
  });
}

Grid.System = GridSystem;
Grid.Cell = GridCell;
Grid.Cross = GridCross;

define('GridSystem', GridSystem);
define('GridCell', GridCell);
define('GridCross', GridCross);
define('Grid', Grid);
