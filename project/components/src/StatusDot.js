var STATUS_LABEL = { ready: 'Ready', building: 'Building', error: 'Error', queued: 'Queued', canceled: 'Canceled', deleted: 'Deleted' };
var STATUS_MESSAGE = { ready: 'is ready', building: 'is building', error: 'had an error', queued: 'is queued', canceled: 'was canceled', deleted: 'was deleted' };
/* Semantic states for any health or status, not only deployments. `error` belongs to both sets. */
var STATUS_SEMANTIC = { success: 'Success', warning: 'Warning', neutral: 'Neutral', pending: 'Pending' };

/* state takes the semantic states (success | warning | error | neutral | pending) or Geist's deployment states
   (QUEUED | BUILDING | READY | ERROR | CANCELED | DELETED), in any case. */
function StatusDot(props) {
  var state = String(props.state || 'ready').toLowerCase();
  if (!STATUS_LABEL[state] && !STATUS_SEMANTIC[state]) state = 'queued';
  var word = STATUS_SEMANTIC[state] || STATUS_LABEL[state];
  /* The brand book shows status with a word as well as a colour, so the label is on unless label={false}. */
  var label = props.label === false ? null : (props.label === true || props.label == null ? word : props.label);
  /* Semantic states name the status itself; so does `error` once it has a custom label. Deployment states say what happened to a deployment. */
  var general = !!STATUS_SEMANTIC[state] || (state === 'error' && props.label != null && props.label !== true && props.label !== false);
  var name;
  if (props.title) name = props.title;
  else if (general) {
    var text = typeof label === 'string' ? label : word;
    name = props.titlePrefix ? props.titlePrefix + ': ' + text : text;
  } else name = (props.titlePrefix || 'This deployment') + ' ' + STATUS_MESSAGE[state];
  return h('span', {
    className: cx('hy-status', 'hy-status--' + state, props.className),
    title: general || props.title ? name : name + '.',
    role: label ? undefined : 'img',
    'aria-label': label ? undefined : name,
    'aria-hidden': props['aria-hidden']
  },
    h('span', { className: 'hy-status__dot', 'aria-hidden': 'true' }),
    label ? h('span', { className: 'hy-status__label' }, label) : null);
}

define('StatusDot', StatusDot);
