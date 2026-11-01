/* QueryBar: a QueryInput with a row of FilterMenus that read and write the same
   query, like GitHub's issue filters. <QueryBar value onChange qualifiers placeholder><QueryBar.Menu qualifier="label" label="Labels"/></QueryBar>.
   The query text is the only state: each menu reads its value off it and writes back with the helpers in _query.js
   (queryMenu, withQueryMenu, querySingle, withQuerySingle), which touch only that qualifier's terms. The announcements
   come from FilterMenu itself. The menus wrap onto more rows when they don't fit (wrap, default true); wrap={false}
   keeps them on one row in a Scroller that scrolls sideways.
   help: true (default) keeps the "?" button beside the field, false hides it, 'menus' puts it last in the menu row. */
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
  var rest = omit(props, ['value', 'defaultValue', 'onChange', 'qualifiers', 'size', 'className', 'children', 'wrap', 'help']);
  var ctx = { value: value, onChange: vs[1], qualifiers: qualifiers, size: size };
  var menus = React.Children.toArray(props.children);
  var wrap = props.wrap !== false;

  /* help="menus" moves the button into the menu row, after the menus; with no menus (or no qualifiers) it stays beside the field. */
  var inMenus = props.help === 'menus' && menus.length > 0;
  var helpButton = inMenus && qualifiers.length > 0 ? h(HY.QueryHelpButton, { key: 'help', qualifiers: qualifiers, size: size }) : null;

  var menuGroup = null;
  if (menus.length) {
    var bound = [h(QueryBarContext.Provider, { key: 'menus', value: ctx }, menus), helpButton];
    menuGroup = h('div', { className: 'hy-querybar__menus', role: 'group', 'aria-label': 'Filters' },
      wrap ? h('div', { className: 'hy-querybar__row' }, bound)
        : h(HY.Scroller, { overflow: 'x', childrenContainerClassName: 'hy-querybar__row' }, bound));
  }

  return h('div', { className: cx('hy-querybar', props.className) },
    h('div', { className: 'hy-querybar__bar' },
      h('div', { className: 'hy-querybar__field' },
        h(HY.QueryInput, Object.assign({}, rest, { value: value, onChange: vs[1], qualifiers: qualifiers, size: size, help: inMenus ? false : props.help === 'menus' ? true : props.help }))),
      menuGroup));
}
QueryBar.Menu = QueryBarMenu;

define('QueryBar', QueryBar);
define('QueryBarMenu', QueryBarMenu);
