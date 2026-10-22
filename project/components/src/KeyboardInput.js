var KBD_IS_MAC = (function () {
  if (typeof navigator === 'undefined') return true;
  var p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || navigator.userAgent || '';
  return /mac|iphone|ipad|ipod/i.test(p);
})();
var KBD_MAC = { meta: ['⌘', 'Command'], shift: ['⇧', 'Shift'], alt: ['⌥', 'Option'], ctrl: ['⌃', 'Control'] };
var KBD_PC = { meta: ['Ctrl', 'Control'], shift: ['Shift', 'Shift'], alt: ['Alt', 'Alt'], ctrl: ['Ctrl', 'Control'] };
function KeyboardInput(props) {
  var mac = props.platform ? props.platform === 'mac' : KBD_IS_MAC;
  var map = mac ? KBD_MAC : KBD_PC;
  var order = mac ? ['ctrl', 'alt', 'shift', 'meta'] : ['meta', 'ctrl', 'alt', 'shift'];
  var parts = [], names = [], seen = {};
  order.forEach(function (m) {
    if (!props[m] || seen[map[m][0]]) return;
    seen[map[m][0]] = true;
    parts.push({ text: map[m][0], mod: mac && m === 'meta' ? 'cmd' : null });
    names.push(map[m][1]);
  });
  var child = props.children;
  if (child != null && child !== false && child !== '') { parts.push({ text: child }); names.push(child); }
  var labelled = names.every(function (n) { return typeof n === 'string' || typeof n === 'number'; });
  var rest = omit(props, ['meta', 'shift', 'alt', 'ctrl', 'small', 'platform', 'alwaysShow', 'children', 'className']);
  return h('kbd', Object.assign({ 'aria-label': labelled && names.length ? names.join(' ') : undefined }, rest, {
    className: cx('hy-kbd', props.small && 'hy-kbd--small', props.alwaysShow && 'hy-kbd--always', !mac && parts.length > 1 && 'hy-kbd--words', props.className)
  }), parts.map(function (p, i) {
    return h('span', { key: i, className: p.mod ? 'hy-kbd__cmd' : undefined, 'aria-hidden': labelled ? 'true' : undefined }, p.text);
  }));
}

define('KeyboardInput', KeyboardInput);
define('Kbd', KeyboardInput);
