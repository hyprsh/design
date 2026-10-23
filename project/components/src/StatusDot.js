var STATUS_LABEL = { ready: 'Ready', building: 'Building', error: 'Error', queued: 'Queued', canceled: 'Canceled', deleted: 'Deleted' };
var STATUS_MESSAGE = { ready: 'is ready', building: 'is building', error: 'had an error', queued: 'is queued', canceled: 'was canceled', deleted: 'was deleted' };
/* Semantic states for any health or status, not only deployments. `error` belongs to both sets. */
var STATUS_SEMANTIC = { success: 'Success', warning: 'Warning', neutral: 'Neutral', pending: 'Pending', info: 'Info' };

/* The rings are SVG so the dash pattern is ours, not the browser's. A 10px box, r = 4.25 and a 1.5px stroke put the outer edge at 10px.
   pathLength 16 with dasharray "1 1" gives exactly 8 equal dashes and 8 equal gaps; the -101.25deg turn (-90 to start at the top, -11.25 to centre half a dash) puts a dash on each axis. */
function ring(dashed) {
  return h('svg', { className: 'hy-status__ring', width: 10, height: 10, viewBox: '0 0 10 10', 'aria-hidden': 'true', focusable: 'false' },
    h('circle', dashed
      ? { cx: 5, cy: 5, r: 4.25, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, pathLength: 16, strokeDasharray: '1 1', transform: 'rotate(-101.25 5 5)' }
      : { cx: 5, cy: 5, r: 4.25, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 }));
}

/* state takes the semantic states (success | warning | error | neutral | pending) or deployment states
   (QUEUED | BUILDING | READY | ERROR | CANCELED | DELETED), in any case. variant is filled (default), outline or dashed. */
function StatusDot(props) {
  var state = String(props.state || 'ready').toLowerCase();
  if (!STATUS_LABEL[state] && !STATUS_SEMANTIC[state]) state = 'queued';
  var variant = props.variant === 'outline' || props.variant === 'dashed' ? props.variant : 'filled';
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
    className: cx('hy-status', 'hy-status--' + state, variant !== 'filled' && 'hy-status--' + variant, props.className),
    title: general || props.title ? name : name + '.',
    role: label ? undefined : 'img',
    'aria-label': label ? undefined : name,
    'aria-hidden': props['aria-hidden']
  },
    h('span', { className: 'hy-status__dot', 'aria-hidden': 'true' }, variant === 'filled' ? null : ring(variant === 'dashed')),
    label ? h('span', { className: 'hy-status__label' }, label) : null);
}

define('StatusDot', StatusDot);
