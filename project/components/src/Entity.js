/* A row for one thing (a member, token, domain): left slot, content, right-side controls.
   Inside EntityList rows render as <li>. as="button" makes the whole row clickable with a stretched button.
   With `detail` the row is one disclosure button that opens a detail region under it. */
var EntityListContext = React.createContext(false);

function EntityContent(props) {
  var rest = omit(props, ['title', 'description', 'fill', 'className', 'children']);
  return h('div', Object.assign({}, rest, { className: cx('hy-entity__content', props.fill && 'hy-entity__content--fill', props.className) }),
    props.title !== undefined ? h('div', { className: 'hy-entity__title' }, props.title) : null,
    props.description !== undefined ? h('div', { className: 'hy-entity__description' }, props.description) : null,
    props.children);
}

var ENTITY_OWN = ['as', 'left', 'right', 'leftClassName', 'rightClassName', 'className', 'children', 'onClick', 'disabled', 'current', 'detail', 'expanded', 'defaultExpanded', 'onExpandedChange'];

function hasDetail(props) { return props.detail !== undefined && props.detail !== null && props.detail !== false; }

/* An expandable row: item (<li> in a list) > div.hy-entity (the row) > button (left, right, chevron), then the detail region.
   The row keeps current; the detail sits outside it, so the tint and marker don't spread. The detail is `hidden` while
   collapsed, which also takes it out of the Tab order. */
function EntityExpandable(props) {
  var inList = React.useContext(EntityListContext);
  var uid = useId();
  var ctl = useControllable(props.expanded, props.defaultExpanded || false, props.onExpandedChange);
  var open = !!ctl[0];
  var labelId = uid + '-label', detailId = uid + '-detail';
  var tag = props.as === 'li' || (inList && props.as !== 'div') ? 'li' : 'div';
  var rest = omit(props, ENTITY_OWN);
  var state = props.current ? { 'aria-current': 'true' } : {};
  return h(tag, Object.assign(state, rest, { className: cx('hy-entity-item', open && 'is-open', props.className) }),
    h('div', { className: cx('hy-entity', 'hy-entity--expandable', props.current && 'is-current', props.disabled && 'hy-entity--disabled') },
      h('button', {
        type: 'button', className: 'hy-entity__toggle', disabled: props.disabled,
        'aria-expanded': open, 'aria-controls': detailId, 'aria-labelledby': labelId,
        onClick: function (e) { if (props.onClick) props.onClick(e); ctl[1](!open); }
      },
        h('div', { id: labelId, className: cx('hy-entity__left', props.leftClassName) }, props.left, props.children),
        props.right ? h('div', { className: cx('hy-entity__right', props.rightClassName) }, props.right) : null,
        h('span', { className: 'hy-entity__chev', 'aria-hidden': 'true' }, h(Glyph, { name: 'chevron', size: 16 })))),
    h('div', { id: detailId, role: 'region', 'aria-labelledby': labelId, hidden: !open, className: 'hy-entity__detail' },
      h('div', { className: 'hy-entity__detail-body' }, props.detail)));
}

function Entity(props) {
  if (hasDetail(props)) return h(EntityExpandable, props);
  var inList = React.useContext(EntityListContext);
  var rowRef = useRef(null);
  var labelId = useId();
  var hasControls = useState(false);
  var asButton = props.as === 'button';
  useLayoutEffect(function () {
    if (!asButton || !rowRef.current) return;
    var found = rowRef.current.querySelector('.hy-entity__left a[href], .hy-entity__left button, .hy-entity__left input, .hy-entity__left select, .hy-entity__left textarea, .hy-entity__right a[href], .hy-entity__right button, .hy-entity__right input, .hy-entity__right select');
    if (!!found !== hasControls[0]) hasControls[1](!!found);
  });
  var tag = props.as === 'li' || (inList && props.as !== 'div') ? 'li' : 'div';
  var rest = omit(props, ENTITY_OWN);
  /* current is the keyboard cursor of a j/k list, like TableRow current; an explicit aria-current wins. */
  var state = props.current ? { 'aria-current': 'true' } : {};
  return h(tag, Object.assign(state, rest, { ref: rowRef, className: cx('hy-entity', asButton && 'hy-entity--button', props.current && 'is-current', props.disabled && 'hy-entity--disabled', props.className) }),
    asButton ? h('button', {
      type: 'button', className: 'hy-entity__cover', onClick: props.onClick, disabled: props.disabled,
      'aria-labelledby': hasControls[0] ? undefined : labelId,
      'aria-hidden': hasControls[0] ? 'true' : undefined, tabIndex: hasControls[0] ? -1 : undefined
    }) : null,
    h('div', { id: labelId, className: cx('hy-entity__left', props.leftClassName) }, props.left, props.children),
    props.right ? h('div', { className: cx('hy-entity__right', props.rightClassName) }, props.right) : null);
}

function EntityList(props) {
  var rest = omit(props, ['className', 'children']);
  return h(EntityListContext.Provider, { value: true },
    h('ul', Object.assign({ role: 'list' }, rest, { className: cx('hy-entity-list', props.className) }), props.children));
}

Entity.Content = EntityContent;
Entity.List = EntityList;

define('Entity', Entity);
define('EntityContent', EntityContent);
define('EntityList', EntityList);
