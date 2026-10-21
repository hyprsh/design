/* Sheet: a side panel (Geist/radix-style compound API). Non-modal by default: the page stays usable. */
var SheetCtx = React.createContext(null);

function useSheetPresence(open, ms) {
  var st = useState(open);
  useEffect(function () {
    if (open) { st[1](true); return; }
    var t = setTimeout(function () { st[1](false); }, ms);
    return function () { clearTimeout(t); };
  }, [open]);
  return open || st[0];
}

function Sheet(props) {
  var ctl = useControllable(props.open, !!props.defaultOpen, props.onOpenChange);
  var tid = useId(), did = useId(), cid = useId();
  var value = { open: !!ctl[0], setOpen: ctl[1], modal: !!props.modal, inline: !!props.inline, titleId: tid, descId: did, contentId: cid };
  return h(SheetCtx.Provider, { value: value }, props.children);
}

/* asChild merges the behaviour onto the single child element. */
function sheetSlot(props, extra) {
  if (props.asChild && React.isValidElement(props.children)) {
    var child = props.children;
    var own = child.props.onClick;
    return React.cloneElement(child, Object.assign({}, extra, {
      onClick: function (e) { if (own) own(e); if (!e.defaultPrevented) extra.onClick(e); }
    }));
  }
  return h('button', Object.assign({ type: 'button', className: props.className }, extra), props.children);
}

function SheetTrigger(props) {
  var ctx = React.useContext(SheetCtx);
  return sheetSlot(props, {
    'aria-haspopup': 'dialog', 'aria-expanded': ctx.open, 'aria-controls': ctx.open ? ctx.contentId : undefined,
    onClick: function () { ctx.setOpen(!ctx.open); }
  });
}

function SheetClose(props) {
  var ctx = React.useContext(SheetCtx);
  return sheetSlot(props, { onClick: function () { ctx.setOpen(false); } });
}

function SheetContent(props) {
  var ctx = React.useContext(SheetCtx);
  var open = ctx.open;
  var mounted = useSheetPresence(open, 150);
  var box = useRef(null);
  var side = props.side || 'right';
  var modal = ctx.modal;
  useOverlayFocus(open, box);
  useScrollLock(open && modal && !ctx.inline);
  useLayoutEffect(function () {
    var el = box.current;
    if (!el) return;
    if (document.getElementById(ctx.titleId)) el.setAttribute('aria-labelledby', ctx.titleId); else el.removeAttribute('aria-labelledby');
    if (document.getElementById(ctx.descId)) el.setAttribute('aria-describedby', ctx.descId); else el.removeAttribute('aria-describedby');
  });
  if (!mounted) return null;
  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); ctx.setOpen(false); }
    if (modal) trapTab(e, box.current);
  }
  var rest = omit(props, ['side', 'noOverlay', 'floating', 'className', 'children']);
  var node = h('div', { className: cx('hy-sheet', !open && 'is-closing', modal && 'hy-sheet--modal') },
    modal && !props.noOverlay ? h('div', { className: 'hy-sheet__overlay', 'aria-hidden': 'true' }) : null,
    h('div', Object.assign({}, rest, {
      ref: box, id: ctx.contentId, role: 'dialog', 'aria-modal': modal ? 'true' : undefined, tabIndex: -1,
      className: cx('hy-sheet__panel', 'hy-sheet__panel--' + side, props.floating && 'hy-sheet__panel--floating', props.className),
      onKeyDown: onKey
    }), props.children));
  return ctx.inline ? node : portal(node);
}

function SheetHeader(props) { return h('div', { className: cx('hy-sheet__header', props.className) }, props.children); }
function SheetFooter(props) { return h('div', { className: cx('hy-sheet__footer', props.className) }, props.children); }
function SheetTitle(props) {
  var ctx = React.useContext(SheetCtx);
  return h('h2', { id: ctx.titleId, className: cx('hy-sheet__title', props.className) }, props.children);
}
function SheetDescription(props) {
  var ctx = React.useContext(SheetCtx);
  return h('div', { id: ctx.descId, className: cx('hy-sheet__desc', props.className) }, props.children);
}

Sheet.Trigger = SheetTrigger;
Sheet.Close = SheetClose;
Sheet.Content = SheetContent;
Sheet.Header = SheetHeader;
Sheet.Footer = SheetFooter;
Sheet.Title = SheetTitle;
Sheet.Description = SheetDescription;

define('SheetTrigger', SheetTrigger);
define('SheetClose', SheetClose);
define('SheetContent', SheetContent);
define('SheetHeader', SheetHeader);
define('SheetFooter', SheetFooter);
define('SheetTitle', SheetTitle);
define('SheetDescription', SheetDescription);
define('Sheet', Sheet);
