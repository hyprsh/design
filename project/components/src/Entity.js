/* A row for one thing (a member, token, domain): left slot, content, right-side controls.
   Inside EntityList rows render as <li>. as="button" makes the whole row clickable with a stretched button. */
var EntityListContext = React.createContext(false);

function EntityContent(props) {
  var rest = omit(props, ['title', 'description', 'fill', 'className', 'children']);
  return h('div', Object.assign({}, rest, { className: cx('hy-entity__content', props.fill && 'hy-entity__content--fill', props.className) }),
    props.title !== undefined ? h('div', { className: 'hy-entity__title' }, props.title) : null,
    props.description !== undefined ? h('div', { className: 'hy-entity__description' }, props.description) : null,
    props.children);
}

function Entity(props) {
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
  var rest = omit(props, ['as', 'left', 'right', 'leftClassName', 'rightClassName', 'className', 'children', 'onClick', 'disabled']);
  return h(tag, Object.assign({}, rest, { ref: rowRef, className: cx('hy-entity', asButton && 'hy-entity--button', props.disabled && 'hy-entity--disabled', props.className) }),
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
