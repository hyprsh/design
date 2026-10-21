/* Inline code by default. A multi-line string, `block` or `syntax` renders the bordered block Geist shows. */
function Code(props) {
  var text = props.children;
  var block = !!props.block || props.syntax != null || (typeof text === 'string' && text.indexOf('\n') >= 0);
  var rest = omit(props, ['children', 'block', 'syntax', 'className']);
  if (!block) return h('code', Object.assign({}, rest, { className: cx('hy-code', props.className), translate: 'no' }), text);
  return h('pre', Object.assign({ tabIndex: 0 }, rest, { className: cx('hy-code-block', props.className), translate: 'no', 'data-syntax': props.syntax }),
    h('code', null, text));
}

define('Code', Code);
