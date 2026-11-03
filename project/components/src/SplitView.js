/*
 * SplitView: a list pane beside a detail pane. From `sm` up the list has a fixed width and the detail fills the rest;
 * below `sm` one pane shows at a time, chosen by `show`. The hidden pane is visibility: hidden, so it is out of the
 * accessibility tree and the Tab order but keeps its layout, and so its scroll position.
 */
function SplitView(props) {
  var kids = React.Children.toArray(props.children);
  var show = props.show === 'detail' ? 'detail' : 'list';
  var w = props.listWidth === undefined || props.listWidth === null ? 320 : props.listWidth;
  var style = Object.assign({ '--hy-split-list-width': typeof w === 'number' ? w + 'px' : w }, props.style);
  return h('div', { className: cx('hy-split-view', 'hy-split-view--show-' + show, props.className), style: style },
    h('div', { className: 'hy-split-view__list' }, kids[0]),
    h('div', { className: 'hy-split-view__detail' }, kids[1]));
}

define('SplitView', SplitView);
