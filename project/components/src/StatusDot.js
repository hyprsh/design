var STATUS_LABEL = { ready: 'Ready', building: 'Building', error: 'Error', queued: 'Queued', canceled: 'Canceled', deleted: 'Deleted' };
var STATUS_MESSAGE = { ready: 'is ready', building: 'is building', error: 'had an error', queued: 'is queued', canceled: 'was canceled', deleted: 'was deleted' };

/* state takes Geist's QUEUED | BUILDING | READY | ERROR | CANCELED | DELETED, in any case. */
function StatusDot(props) {
  var state = String(props.state || 'ready').toLowerCase();
  if (!STATUS_LABEL[state]) state = 'queued';
  /* The brand book shows status with a word as well as a colour, so the label is on unless label={false}. */
  var label = props.label === false ? null : (props.label === true || props.label == null ? STATUS_LABEL[state] : props.label);
  var message = (props.titlePrefix || 'This deployment') + ' ' + STATUS_MESSAGE[state] + '.';
  return h('span', {
    className: cx('hy-status', 'hy-status--' + state, props.className),
    title: message,
    role: label ? undefined : 'img',
    'aria-label': label ? undefined : message.slice(0, -1),
    'aria-hidden': props['aria-hidden']
  },
    h('span', { className: 'hy-status__dot', 'aria-hidden': 'true' }),
    label ? h('span', { className: 'hy-status__label' }, label) : null);
}

define('StatusDot', StatusDot);
