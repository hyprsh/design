var THEME_OPTIONS = [
  { value: 'system', label: 'System', icon: 'monitor' },
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' }
];
function themeMql() { return window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null; }
function themeResolve(v) {
  if (v === 'light' || v === 'dark') return v;
  var mql = themeMql();
  return mql && mql.matches ? 'dark' : 'light';
}
function themeApply(v) {
  var el = document.documentElement, r = themeResolve(v);
  el.setAttribute('data-theme', r);
  el.style.colorScheme = r;
}
function themeValid(v) { return v === 'system' || v === 'light' || v === 'dark'; }
function themeInitial(storageKey) {
  if (storageKey) {
    try { var s = window.localStorage.getItem(storageKey); if (themeValid(s)) return s; } catch (e) { /* storage blocked */ }
  }
  var cur = document.documentElement.getAttribute('data-theme');
  return themeValid(cur) ? cur : 'system';
}

/* Three radios (System, Light, Dark) that set data-theme and color-scheme on <html>. It reads the current theme on
   mount but changes nothing until the reader picks one; while System is picked it follows the OS setting live. */
function ThemeSwitcher(props) {
  var storageKey = props.storageKey === undefined ? 'theme' : props.storageKey;
  var initial = useState(function () { return props.defaultValue || themeInitial(storageKey); })[0];
  var ctl = useControllable(props.value, initial, props.onChange);
  var value = ctl[0];
  var took = useRef(false);
  var first = useRef(true);
  var name = 'hy-theme-' + useId();

  useEffect(function () {
    if (first.current) { first.current = false; return; }
    took.current = true;
    themeApply(value);
    if (storageKey) { try { window.localStorage.setItem(storageKey, value); } catch (e) { /* storage blocked */ } }
  }, [value]);

  useEffect(function () {
    var mql = themeMql();
    if (value !== 'system' || !mql) return;
    function onChange() { if (took.current) themeApply('system'); }
    if (mql.addEventListener) mql.addEventListener('change', onChange); else mql.addListener(onChange);
    return function () { if (mql.removeEventListener) mql.removeEventListener('change', onChange); else mql.removeListener(onChange); };
  }, [value]);

  var rest = omit(props, ['value', 'defaultValue', 'onChange', 'storageKey', 'size', 'disabled', 'className', 'aria-label']);
  return h('fieldset', Object.assign({}, rest, {
    className: cx('hy-theme', props.size === 'small' && 'hy-theme--small', props.disabled && 'is-disabled', props.className),
    disabled: props.disabled
  }),
    h('legend', { className: 'hy-sr' }, props['aria-label'] || 'Theme'),
    THEME_OPTIONS.map(function (o) {
      var id = name + '-' + o.value;
      return h('span', { key: o.value, className: 'hy-theme__item' },
        h('input', {
          type: 'radio', id: id, name: name, value: o.value, className: 'hy-theme__input',
          checked: value === o.value, onChange: function () { ctl[1](o.value); }
        }),
        h('label', { htmlFor: id, className: 'hy-theme__option', title: o.label },
          h(HY.Icon, { name: o.icon, size: props.size === 'small' ? 14 : 16 }),
          h('span', { className: 'hy-sr' }, o.label)));
    }));
}

define('ThemeSwitcher', ThemeSwitcher);
