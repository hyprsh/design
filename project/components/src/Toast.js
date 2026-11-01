/* Toast: an imperative useToasts() API plus the original controlled
   <Toast toasts onDismiss> component. Toasts stack at the bottom right and expand on hover. */
var TOAST_GAP = 8, TOAST_PEEK = 12, TOAST_VISIBLE = 3;
var TOAST_WORD = { success: 'Success', error: 'Error', warning: 'Warning' };
var toastStore = { list: [], subs: [], seq: 0, hosts: 0, auto: false };

function toastAction(action, onAction) {
  if (typeof action === 'string') action = { label: action, onClick: onAction };
  return action && action.label ? action : null;
}
function toastDuration(o, undo) {
  return o.preserve ? Infinity : (o.duration !== undefined ? o.duration : (o.timeout !== undefined ? o.timeout : (undo ? 8000 : 6000)));
}
function toastNormalize(input, type) {
  var o = typeof input === 'string' || React.isValidElement(input) ? { text: input } : Object.assign({}, input);
  var undo = typeof o.onUndoAction === 'function';
  var duration = toastDuration(o, undo);
  return {
    id: o.id !== undefined ? o.id : 'toast-' + (++toastStore.seq),
    text: o.text !== undefined ? o.text : o.message,
    type: type || o.type,
    action: toastAction(o.action, o.onAction),
    onUndoAction: undo ? o.onUndoAction : null,
    duration: duration,
    progress: o.progress || null,
    restarts: 0
  };
}
function toastEmit() { toastStore.subs.forEach(function (fn) { fn(toastStore.list); }); }
/* Mounts a <Toast /> of its own for useToasts() when the app has none. React 19's react-dom has no createRoot (it is
   only in react-dom/client), so the package entry imports a `createRoot` binding from there; the browser bundle has no
   such binding and takes it off the ReactDOM global. Without either the toast is queued but nothing shows, so say so once.
   Bundlers replace `process.env.NODE_ENV` as text, so it is read bare: a typeof process guard would be undefined in
   their browser builds and keep the warning in production. Where nothing replaces it, the throw means development. */
function toastMountHost() {
  if (typeof document === 'undefined') return;
  var mount = typeof createRoot === 'function' ? createRoot : ReactDOM && ReactDOM.createRoot;
  if (typeof mount !== 'function') {
    toastStore.auto = true;
    var prod = false;
    try { prod = process.env.NODE_ENV === 'production'; } catch (e) { /* no process: not a production build */ }
    if (!prod && typeof console !== 'undefined') console.warn('hyprsh: useToasts() could not mount a toast host, so toasts will not show. Mount <Toast /> once at the app root.');
    return;
  }
  toastStore.auto = true;
  var el = document.createElement('div');
  el.setAttribute('data-hy-toaster', '');
  document.body.appendChild(el);
  mount(el).render(h(HY.Toast));
}
function toastAdd(input, type) {
  var t = toastNormalize(input, type);
  if (!toastStore.hosts && !toastStore.auto) toastMountHost();
  toastStore.list = toastStore.list.filter(function (x) { return x.id !== t.id; }).concat(t);
  toastEmit();
  return t.id;
}
function toastRemove(id) {
  toastStore.list = toastStore.list.filter(function (x) { return x.id !== id; });
  toastEmit();
}
/* Changes a shown toast in place: same slot in the stack, same component, so it neither moves nor enters again.
   `restarts` counts the restarts: it changes only when the update carries duration or preserve, and ToastItem restarts
   its dismiss timer when it does. */
function toastUpdate(id, changes) {
  var at = -1;
  toastStore.list.forEach(function (x, i) { if (x.id === id) at = i; });
  if (at < 0) return false;
  var c = changes || {}, next = Object.assign({}, toastStore.list[at]);
  if (c.text !== undefined || c.message !== undefined) next.text = c.text !== undefined ? c.text : c.message;
  if (c.type !== undefined) next.type = c.type || undefined;
  if (c.action !== undefined) next.action = toastAction(c.action, c.onAction);
  else if (c.onAction !== undefined && next.action) next.action = { label: next.action.label, onClick: c.onAction };
  if (c.onUndoAction !== undefined) next.onUndoAction = typeof c.onUndoAction === 'function' ? c.onUndoAction : null;
  if (c.progress !== undefined) next.progress = c.progress || null;
  var undo = !!next.onUndoAction;
  var timeout = c.duration !== undefined ? c.duration : c.timeout;
  if (c.preserve !== undefined || timeout !== undefined) {
    var wasPreserved = next.duration === Infinity;
    next.duration = toastDuration({ preserve: c.preserve !== undefined ? c.preserve : (timeout === undefined && wasPreserved), duration: timeout }, undo);
    next.restarts = next.restarts + 1;
  }
  toastStore.list = toastStore.list.map(function (x, i) { return i === at ? next : x; });
  toastEmit();
  return true;
}
var toastApi = {
  message: function (o) { return toastAdd(o); },
  success: function (o) { return toastAdd(o, 'success'); },
  error: function (o) { return toastAdd(o, 'error'); },
  warning: function (o) { return toastAdd(o, 'warning'); },
  update: toastUpdate,
  dismiss: toastRemove,
  clear: function () { toastStore.list = []; toastEmit(); }
};
function useToasts() { return toastApi; }

/* The plain text of a node, to name the progress bar after the toast's text. */
function toastPlain(node) {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(toastPlain).join('');
  return node.props ? toastPlain(node.props.children) : '';
}

function ToastItem(p) {
  var t = p.toast;
  var ref = useRef(null);
  var left = useRef(t.duration);
  var restartSeen = useRef(t.restarts);
  var entered = useState(!!p.inline);
  useEffect(function () {
    if (entered[0]) return;
    var t0 = setTimeout(function () { entered[1](true); }, 20);
    return function () { clearTimeout(t0); };
  }, []);
  /* Measure the inner box so a collapsed toast, forced to the front toast's height, still reports its own. */
  useLayoutEffect(function () { if (ref.current && p.onHeight) p.onHeight(t.id, ref.current.offsetHeight); });
  useEffect(function () {
    /* An update that carries duration or preserve starts the timer over; any other leaves what is left. */
    if (restartSeen.current !== t.restarts) { restartSeen.current = t.restarts; left.current = t.duration; }
    if (p.paused || left.current === Infinity) return;
    var start = Date.now();
    var timer = setTimeout(function () { p.onDismiss(t.id); }, left.current);
    return function () { clearTimeout(timer); left.current -= Date.now() - start; };
  }, [t.id, p.paused, t.restarts]);
  var glyph = TOAST_WORD[t.type] ? t.type : null;
  function dismiss() { p.onDismiss(t.id); }
  var style = p.inline ? undefined : (entered[0] ? p.style : Object.assign({}, p.style, { transform: 'translateY(100%)', opacity: 0 }));
  return h('li', { className: cx('hy-toast', t.type && 'hy-toast--' + t.type, t.onUndoAction && 'hy-toast--undo', p.behind && 'is-behind'), style: style, 'aria-hidden': p.behind || undefined },
    h('div', { ref: ref, className: 'hy-toast__inner' },
    h('div', { className: 'hy-toast__main' },
      glyph ? h(Glyph, { name: glyph, className: 'hy-toast__glyph' }) : null,
      h('div', { className: 'hy-toast__text', 'aria-atomic': 'true' }, glyph ? h('span', { className: 'hy-sr' }, TOAST_WORD[glyph] + ': ') : null, t.text),
      t.action && !t.onUndoAction ? h(HY.Button, { size: 'small', variant: 'secondary', onClick: function () { if (t.action.onClick) t.action.onClick(); dismiss(); } }, t.action.label) : null,
      !t.onUndoAction && t.duration === Infinity ? h('button', { type: 'button', className: 'hy-toast__close', 'aria-label': 'Dismiss', onClick: dismiss }, h(Glyph, { name: 'x', size: 14 })) : null),
    t.progress ? h('div', { className: 'hy-toast__progress' },
      h(HY.Progress, { value: t.progress.value, max: t.progress.max, height: 4, 'aria-label': toastPlain(t.text) || undefined })) : null,
    t.onUndoAction ? h('div', { className: 'hy-toast__actions' },
      h(HY.Button, { size: 'small', variant: 'tertiary', onClick: dismiss }, 'Dismiss'),
      h(HY.Button, { size: 'small', variant: 'primary', onClick: function () { t.onUndoAction(); dismiss(); } }, (t.action && t.action.label) || 'Undo')) : null));
}

function Toast(props) {
  var controlled = props.toasts !== undefined;
  var storeSt = useState(toastStore.list);
  var heights = useState({});
  var hover = useState(false);
  useEffect(function () {
    if (controlled) return;
    toastStore.hosts++;
    toastStore.subs.push(storeSt[1]);
    storeSt[1](toastStore.list);
    return function () { toastStore.hosts--; toastStore.subs = toastStore.subs.filter(function (f) { return f !== storeSt[1]; }); };
  }, [controlled]);
  var list = (controlled ? props.toasts : storeSt[0]).map(function (t) { return t.text !== undefined && t.duration !== undefined && 'onUndoAction' in t ? t : toastNormalize(t); });
  var onDismiss = controlled ? (props.onDismiss || function () {}) : toastRemove;
  function onHeight(id, hgt) {
    if (heights[0][id] !== hgt) heights[1](function (m) { var n = Object.assign({}, m); n[id] = hgt; return n; });
  }
  var expanded = hover[0] || props.expanded;
  var items, olStyle;
  if (props.inline) {
    items = list.map(function (t) { return h(ToastItem, { key: t.id, toast: t, inline: true, onDismiss: onDismiss }); });
  } else {
    var newest = list.slice().reverse();
    var frontH = heights[0][newest.length ? newest[0].id : ''] || 56;
    var offset = 0;
    items = newest.map(function (t, i) {
      var hgt = heights[0][t.id] || 56;
      var y = expanded ? offset : i * TOAST_PEEK;
      offset += hgt + TOAST_GAP;
      var style = {
        transform: 'translateY(' + (-y) + 'px) scale(' + (expanded ? 1 : Math.max(0, 1 - i * 0.05)) + ')',
        opacity: i >= TOAST_VISIBLE ? 0 : 1, zIndex: newest.length - i,
        height: !expanded && i > 0 ? frontH : undefined
      };
      return h(ToastItem, { key: t.id, toast: t, style: style, behind: !expanded && i > 0, paused: expanded, onDismiss: onDismiss, onHeight: onHeight });
    }).reverse();
    olStyle = { height: expanded ? Math.max(0, offset - TOAST_GAP) : frontH + Math.min(Math.max(newest.length - 1, 0), TOAST_VISIBLE - 1) * TOAST_PEEK };
    if (!newest.length) olStyle.height = 0;
  }
  var region = h('section', {
    className: cx('hy-toaster', props.inline && 'hy-toaster--inline', props.className), 'aria-label': 'Notifications',
    onMouseEnter: function () { hover[1](true); }, onMouseLeave: function () { hover[1](false); },
    onFocus: function () { hover[1](true); }, onBlur: function (e) { if (!e.currentTarget.contains(e.relatedTarget)) hover[1](false); }
  },
    h('ol', { className: 'hy-toaster__list', style: olStyle, 'aria-live': 'polite', 'aria-relevant': 'additions text' }, items));
  return props.inline ? region : portal(region);
}

Toast.useToasts = useToasts;
Toast.toasts = toastApi;
define('Toast', Toast);
define('useToasts', useToasts);
