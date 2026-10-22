/* QueryBar: a hyprsh original (no Geist page). A QueryInput with a row of FilterMenus that read and write the same
   query, like GitHub's issue filters. <QueryBar value onChange qualifiers placeholder><QueryBar.Menu qualifier="label" label="Labels"/></QueryBar>.
   The query text is the only state: each menu reads its value off it and writes back with the helpers in _query.js
   (queryMenu, withQueryMenu, querySingle, withQuerySingle), which touch only that qualifier's terms. The announcements
   come from FilterMenu itself. */
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
  var value = props.value == null ? '' : String(props.value);
  var size = props.size === 'small' || props.size === 'large' ? props.size : 'medium';
  var qualifiers = props.qualifiers || [];
  var rest = omit(props, ['value', 'onChange', 'qualifiers', 'size', 'className', 'children']);
  var ctx = { value: value, onChange: props.onChange, qualifiers: qualifiers, size: size };
  var menus = React.Children.toArray(props.children);

  return h('div', { className: cx('hy-querybar', props.className) },
    h('div', { className: 'hy-querybar__bar' },
      h('div', { className: 'hy-querybar__field' },
        h(HY.QueryInput, Object.assign({}, rest, { value: value, onChange: props.onChange, qualifiers: qualifiers, size: size }))),
      menus.length ? h('div', { className: 'hy-querybar__menus', role: 'group', 'aria-label': 'Filters' },
        h(HY.Scroller, { overflow: 'x', childrenContainerClassName: 'hy-querybar__row' },
          h(QueryBarContext.Provider, { value: ctx }, menus))) : null));
}
QueryBar.Menu = QueryBarMenu;

define('QueryBar', QueryBar);
define('QueryBarMenu', QueryBarMenu);
