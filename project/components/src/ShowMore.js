function ShowMore(props) {
  var c = useControllable(props.expanded, !!props.defaultExpanded, props.onChange);
  var expanded = c[0], setExpanded = c[1];
  function onClick(e) {
    if (props.onClick) props.onClick(e);
    if (!e.defaultPrevented) setExpanded(!expanded);
  }
  var label = expanded ? (props.lessLabel || 'Show Less')
    : (props.moreLabel || (props.count ? 'Show ' + props.count + ' More' : 'Show More'));
  var rest = omit(props, ['expanded', 'defaultExpanded', 'onChange', 'onClick', 'noBorder', 'count', 'moreLabel', 'lessLabel', 'className', 'style']);
  return h('div', { className: cx('hy-showmore', props.noBorder && 'hy-showmore--plain', props.className), style: props.style },
    h('button', Object.assign({ type: 'button' }, rest, { className: 'hy-showmore__btn', 'aria-expanded': expanded, onClick: onClick }),
      h('span', null, label),
      h('span', { className: cx('hy-showmore__chev', expanded && 'is-up'), 'aria-hidden': 'true' }, h(Glyph, { name: 'chevron' }))));
}

define('ShowMore', ShowMore);
