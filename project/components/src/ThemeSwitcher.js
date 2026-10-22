var THEME_OPTIONS = [
  { value: 'system', label: 'System', icon: 'monitor' },
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' }
];
function themeMql() { return window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null; }
/* Resolve (System follows prefers-color-scheme) and apply in one self-contained function: themeScript() serialises it,
   so it must not use anything outside its own body. `attribute` is 'data-theme', 'class', 'both' or an array of those. */
function themeApply(v, attribute) {
  var list = typeof attribute === 'string' ? [attribute] : (attribute || ['data-theme']);
  var useData = false, useClass = false, i;
  for (i = 0; i < list.length; i++) {
    if (list[i] === 'both') { useData = true; useClass = true; }
    else if (list[i] === 'class') useClass = true;
    else useData = true;
  }
  var r = v;
  if (r !== 'light' && r !== 'dark') {
    var mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    r = mql && mql.matches ? 'dark' : 'light';
  }
  var el = document.documentElement;
  if (useData) el.setAttribute('data-theme', r); else el.removeAttribute('data-theme');
  if (el.classList) {
    el.classList.remove(useClass ? (r === 'dark' ? 'light' : 'dark') : 'dark');
    if (useClass) el.classList.add(r); else el.classList.remove('light');
  }
  el.style.colorScheme = r;
}
function themeValid(v) { return v === 'system' || v === 'light' || v === 'dark'; }
function themeInitial(storageKey) {
  if (storageKey) {
    try { var s = window.localStorage.getItem(storageKey); if (themeValid(s)) return s; } catch (e) { /* storage blocked */ }
  }
  var el = document.documentElement;
  var cur = el.getAttribute('data-theme');
  if (themeValid(cur)) return cur;
  if (el.classList) { if (el.classList.contains('dark')) return 'dark'; if (el.classList.contains('light')) return 'light'; }
  return 'system';
}

/* The inline pre-paint script: apply the saved theme before the page paints so a reload never flashes the wrong one.
   Built from themeApply itself, so it resolves System and writes the attribute/class exactly as the component does. */
function themeScript(options) {
  var o = options || {};
  var key = o.storageKey === undefined ? 'theme' : o.storageKey;
  var attr = o.attribute === undefined ? 'data-theme' : o.attribute;
  var json = function (x) { return JSON.stringify(x).replace(/</g, '\\u003c'); };
  return '(function(){try{var apply=' + themeApply.toString() + ';var v=null;' +
    (key ? 'try{v=window.localStorage.getItem(' + json(key) + ')}catch(e){}' : '') +
    'if(v!=="light"&&v!=="dark")v="system";apply(v,' + json(attr) + ')}catch(e){}})()';
}

/* Three radios (System, Light, Dark), or with variant="cycle" one button that cycles through them, that set data-theme
   and/or the .dark/.light class (attribute) plus color-scheme on <html>. It reads the current theme on
   mount but changes nothing then; after that a pick applies, and while System is the value it follows the OS setting live. */
function ThemeSwitcher(props) {
  var storageKey = props.storageKey === undefined ? 'theme' : props.storageKey;
  var initial = useState(function () { return props.defaultValue || themeInitial(storageKey); })[0];
  var ctl = useControllable(props.value, initial, props.onChange);
  var value = ctl[0];
  var first = useRef(true);
  var name = 'hy-theme-' + useId();

  useEffect(function () {
    if (first.current) { first.current = false; return; }
    themeApply(value, props.attribute);
    if (storageKey) { try { window.localStorage.setItem(storageKey, value); } catch (e) { /* storage blocked */ } }
  }, [value]);

  useEffect(function () {
    var mql = themeMql();
    if (value !== 'system' || !mql) return;
    function onChange() { themeApply('system', props.attribute); }
    if (mql.addEventListener) mql.addEventListener('change', onChange); else mql.addListener(onChange);
    return function () { if (mql.removeEventListener) mql.removeEventListener('change', onChange); else mql.removeListener(onChange); };
  }, [value]);

  if (props.variant === 'cycle') {
    var idx = 0;
    THEME_OPTIONS.forEach(function (o, i) { if (o.value === value) idx = i; });
    var cur = THEME_OPTIONS[idx], label = 'Theme: ' + cur.label;
    return h(HY.Tooltip, { text: label },
      h(HY.Button, {
        variant: 'tertiary', svgOnly: true, size: props.size === 'small' ? 'tiny' : 'small',
        className: cx('hy-theme-cycle', props.className), style: props.style, disabled: props.disabled,
        'aria-label': label, onClick: function () { ctl[1](THEME_OPTIONS[(idx + 1) % THEME_OPTIONS.length].value); }
      }, h(HY.Icon, { name: cur.icon, size: props.size === 'small' ? 14 : 16 })));
  }

  var rest = omit(props, ['value', 'defaultValue', 'onChange', 'storageKey', 'attribute', 'variant', 'size', 'disabled', 'className', 'aria-label']);
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
define('themeScript', themeScript);
