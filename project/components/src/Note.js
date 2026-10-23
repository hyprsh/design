var NOTE_GLYPH = { default: 'info', secondary: 'info', success: 'success', error: 'error', warning: 'warning', violet: 'info', cyan: 'info' };
var NOTE_WORD = { default: 'Note', secondary: 'Note', success: 'Success', error: 'Error', warning: 'Warning', violet: 'New', cyan: 'Note' };

function NoteLabel(props) {
  return h('strong', { className: cx('hy-note__label', props.className) }, props.children);
}
function NoteContent(props) {
  return h('div', { className: cx('hy-note__body', props.className) }, props.children);
}
function NoteAction(props) {
  return h('div', { className: cx('hy-note__action', props.className) }, props.children);
}

/* A disabled note disables the controls in its action slot as well. */
function disableAll(children) {
  return React.Children.map(children, function (c) {
    return React.isValidElement(c) && typeof c.type !== 'string' ? React.cloneElement(c, { disabled: true }) : c;
  });
}

function Note(props) {
  /* `variant` is the current name; the older `type` still works and keeps its leading word (“Warning:”). */
  var variant = props.variant || props.type || 'default';
  if (!NOTE_GLYPH[variant]) variant = 'default';
  var legacyWord = !props.variant && props.type ? NOTE_WORD[variant] : null;
  var label = props.label === false ? null : (props.label || legacyWord);
  var size = props.size === 'small' || props.size === 'large' ? props.size : 'medium';
  var rest = omit(props, ['variant', 'type', 'fill', 'size', 'disabled', 'icon', 'label', 'action', 'children', 'className']);

  var kids = React.Children.toArray(props.children);
  var compound = kids.some(function (c) { return c && (c.type === NoteContent || c.type === NoteAction); });
  var body, action;
  if (compound) {
    body = kids.map(function (c) {
      if (props.disabled && c && c.type === NoteAction) return React.cloneElement(c, { children: disableAll(c.props.children) });
      return c;
    });
  } else {
    body = h(NoteContent, null, label ? h(NoteLabel, null, label + ':') : null, props.children);
  }
  if (props.action) action = h(NoteAction, null, props.disabled ? disableAll(props.action) : props.action);
  var hasAction = !!props.action || kids.some(function (c) { return c && c.type === NoteAction; });

  var icon = props.icon === null ? null
    : props.icon !== undefined ? h('span', { className: 'hy-note__icon', 'aria-hidden': 'true' }, props.icon)
    : h(Glyph, { name: NOTE_GLYPH[variant], className: 'hy-note__icon' });

  /* role and aria-* pass through. Unless you set a role: success is a polite status and error an alert, so they are announced. */
  var role = props.role !== undefined ? props.role
    : props.disabled ? undefined : variant === 'error' ? 'alert' : variant === 'success' ? 'status' : undefined;
  return h('div', Object.assign({}, rest, {
    className: cx('hy-note', 'hy-note--' + variant, 'hy-note--' + size, props.fill && 'hy-note--fill', props.disabled && 'is-disabled', hasAction && 'hy-note--has-action', props.className),
    role: role,
    'aria-disabled': props.disabled || rest['aria-disabled'] || undefined
  }), icon, body, action);
}

Note.Content = NoteContent;
Note.Action = NoteAction;
Note.Label = NoteLabel;

define('Note', Note);
define('NoteContent', NoteContent);
define('NoteAction', NoteAction);
define('NoteLabel', NoteLabel);
