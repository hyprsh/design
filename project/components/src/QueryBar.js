/* QueryBar: a hyprsh original (no Geist page). A QueryInput with a row of FilterMenus that read and write the same
   query, like GitHub's issue filters. <QueryBar value onChange qualifiers placeholder><QueryBar.Menu qualifier="label" label="Labels"/></QueryBar>.
   The query text is the only state: each menu reads its value off it and writes back with the helpers in _query.js
   (queryMenu, withQueryMenu, querySingle, withQuerySingle), which touch only that qualifier's terms. The announcements
   come from FilterMenu itself. The menus wrap onto more rows when they don't fit (wrap, default true); wrap={false}
   keeps them on one row in a Scroller that scrolls sideways. */
var QueryBarContext = React.createContext(null);

function QueryBarMenu(props) {
  var bar = React.useContext(QueryBarContext);
  if (!bar) return null;
  var name = props.qualifier;
  var def = null;
  bar.qualifiers.forEach(function (q) { if (q.name === name) def = q; });
  var rest = omit(props, ['qualifier', 'value', 'defaultValue', 'onChange', 'excludable', 'noneLabel', 'size', 'children']);
  var size = props.size || bar.size;
  function write(next) { if (next !== bar.value) bar.onChange(next); }

  if (props.single) {
    var fallback = props.defaultOption == null ? '' : String(props.defaultOption);
    return h(HY.FilterMenu, Object.assign({}, rest, {
      size: size,
      value: querySingle(bar.value, name, fallback, bar.qualifiers),
      onChange: function (v) { write(withQuerySingle(bar.value, name, v, fallback, bar.qualifiers)); }
    }), props.children);
  }
  return h(HY.FilterMenu, Object.assign({}, rest, {
    size: size,
    excludable: !!(def && def.excludable) && props.excludable !== false,
    noneLabel: def && def.none ? props.noneLabel : undefined,
    value: queryMenu(bar.value, name, bar.qualifiers),
    onChange: function (v) { write(withQueryMenu(bar.value, name, v, bar.qualifiers)); }
  }), props.children);
}

function QueryBar(props) {
  var vs = useControllable(props.value, props.defaultValue == null ? '' : String(props.defaultValue), props.onChange);
  var value = vs[0] == null ? '' : String(vs[0]);
  var size = props.size === 'small' || props.size === 'large' ? props.size : 'medium';
  var qualifiers = props.qualifiers || [];
  var rest = omit(props, ['value', 'defaultValue', 'onChange', 'qualifiers', 'size', 'className', 'children', 'wrap']);
  var ctx = { value: value, onChange: vs[1], qualifiers: qualifiers, size: size };
  var menus = React.Children.toArray(props.children);
  var wrap = props.wrap !== false;

  var menuGroup = null;
  if (menus.length) {
    var bound = h(QueryBarContext.Provider, { value: ctx }, menus);
    menuGroup = h('div', { className: 'hy-querybar__menus', role: 'group', 'aria-label': 'Filters' },
      wrap ? h('div', { className: 'hy-querybar__row' }, bound)
        : h(HY.Scroller, { overflow: 'x', childrenContainerClassName: 'hy-querybar__row' }, bound));
  }

  return h('div', { className: cx('hy-querybar', props.className) },
    h('div', { className: 'hy-querybar__bar' },
      h('div', { className: 'hy-querybar__field' },
        h(HY.QueryInput, Object.assign({}, rest, { value: value, onChange: vs[1], qualifiers: qualifiers, size: size }))),
      menuGroup));
}
QueryBar.Menu = QueryBarMenu;

define('QueryBar', QueryBar);
define('QueryBarMenu', QueryBarMenu);
