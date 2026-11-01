/* QueryHelpButton: the "?" button that opens the Query Help popover, a list of a query's qualifiers and its rules.
   QueryInput draws it beside the field; a QueryBar can move it into its menu row (help="menus"), and an app can place it anywhere. */
function QueryHelpButton(p) {
  var qualifiers = p.qualifiers;
  var hasNone = qualifiers.some(function (q) { return q.none; });
  var code = function (t) { return h('code', { className: 'hy-query__code' }, t); };
  return h(HY.Popover, {
    trigger: h(HY.Button, { svgOnly: true, variant: 'tertiary', size: p.size, 'aria-label': 'Query Help', className: 'hy-query__help' }, h(HY.Icon, { name: 'circle-help' })),
    label: 'Query Help', position: 'bottom-end', width: 320
  },
    h('div', { className: 'hy-query__guide' },
      h('dl', { className: 'hy-query__qualifiers' }, qualifiers.map(function (q) {
        return h(React.Fragment, { key: q.name }, h('dt', null, q.name + ':'), h('dd', null, q.help));
      })),
      h('p', null, code('a,b'), ' matches either value. Different qualifiers must all match, and so must the same one typed twice. A leading ', code('-'), ' leaves values out, where a qualifier allows it. Double quotes keep spaces and commas in a value.',
        hasNone ? h(React.Fragment, null, ' ', code('no:name'), ' matches what has no value for that qualifier.') : null, ' Other words are free text.')));
}

define('QueryHelpButton', QueryHelpButton);
