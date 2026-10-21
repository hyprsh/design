var FileTreeDepth = React.createContext(0);
var FT_TYPE_ICON = { 'edge-function': 'square-function', lambda: 'lambda', middleware: 'square-m' };
var FT_TYPE_LABEL = { 'edge-function': 'Edge Function', lambda: 'Function', middleware: 'Middleware' };

function ftGuides(depth) {
  var out = [];
  for (var i = 0; i < depth; i++) out.push(h('span', { key: i, className: 'hy-ft__guide', style: { '--hy-ft-level': i }, 'aria-hidden': 'true' }));
  return out;
}

function FileTree(props) {
  var rest = omit(props, ['children', 'className']);
  return h(FileTreeDepth.Provider, { value: 0 },
    h('ul', Object.assign({}, rest, { className: cx('hy-ft', props.className), translate: 'no' }), props.children));
}

function FileTreeFolder(props) {
  var depth = React.useContext(FileTreeDepth);
  var c = useControllable(props.open, !!props.defaultOpen, props.onOpenChange);
  var open = c[0], setOpen = c[1];
  var id = useId();
  var rest = omit(props, ['name', 'open', 'defaultOpen', 'onOpenChange', 'children', 'className']);
  return h('li', Object.assign({}, rest, { className: cx('hy-ft__item', props.className) }),
    h('button', { type: 'button', className: 'hy-ft__row', style: { '--hy-ft-depth': depth }, 'aria-expanded': open, 'aria-controls': open ? id : undefined, onClick: function () { setOpen(!open); } },
      ftGuides(depth),
      h(HY.Icon, { name: open ? 'folder-open' : 'folder', className: 'hy-ft__icon' }),
      h('span', { className: 'hy-ft__name' }, props.name)),
    open ? h(FileTreeDepth.Provider, { value: depth + 1 }, h('ul', { id: id, className: 'hy-ft__group' }, props.children)) : null);
}

function FileTreeFile(props) {
  var depth = React.useContext(FileTreeDepth);
  var icon = FT_TYPE_ICON[props.type] || 'file';
  var rest = omit(props, ['name', 'href', 'type', 'active', 'className', 'children']);
  var inner = [
    ftGuides(depth),
    h(HY.Icon, { key: 'i', name: icon, className: 'hy-ft__icon' }),
    h('span', { key: 'n', className: 'hy-ft__name' }, props.name),
    FT_TYPE_LABEL[props.type] ? h('span', { key: 't', className: 'hy-sr' }, ', ' + FT_TYPE_LABEL[props.type]) : null
  ];
  var rowProps = { className: cx('hy-ft__row', props.active && 'is-active'), style: { '--hy-ft-depth': depth } };
  return h('li', { className: cx('hy-ft__item', props.className) },
    props.href
      ? h('a', Object.assign(rowProps, rest, { href: props.href, 'aria-current': props.active ? 'page' : undefined }), inner)
      : h('div', Object.assign(rowProps, rest), inner));
}

FileTree.Folder = FileTreeFolder;
FileTree.File = FileTreeFile;

define('FileTree', FileTree);
