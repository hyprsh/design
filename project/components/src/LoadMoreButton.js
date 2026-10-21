/* LoadMoreButton: a full-width secondary Button at the end of a list that appends the next page. */
function LoadMoreButton(props) {
  var rest = omit(props, ['noGap', 'noBorderRadius', 'className', 'children', 'variant']);
  return h(HY.Button, Object.assign(rest, {
    variant: props.variant || 'secondary',
    className: cx('hy-load-more', props.noGap && 'hy-load-more--no-gap', props.noBorderRadius && 'hy-load-more--square', props.className)
  }), props.children == null ? 'Load More' : props.children);
}

define('LoadMoreButton', LoadMoreButton);
