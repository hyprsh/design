/* A bar of URL-backed filters: "Add Filter" opens a two-step combobox (pick a filter, then a value),
   active filters show as removable pills, and suggested defaults show as dashed pills.
   Controlled through searchParams/onSearchParamsChange, or synced to location.search when uncontrolled. */
var FP_EVENT = 'hy-searchparams';

function toSearchParams(v) { return v instanceof URLSearchParams ? v : new URLSearchParams(v || ''); }

function useSearchParamState() {
  var st = useState(function () { return new URLSearchParams(typeof location === 'undefined' ? '' : location.search); });
  useEffect(function () {
    function sync() { st[1](new URLSearchParams(location.search)); }
    window.addEventListener('popstate', sync);
    window.addEventListener(FP_EVENT, sync);
    return function () { window.removeEventListener('popstate', sync); window.removeEventListener(FP_EVENT, sync); };
  }, []);
  function set(next) {
    var s = toSearchParams(next).toString();
    history.replaceState(history.state, '', location.pathname + (s ? '?' + s : '') + location.hash);
    window.dispatchEvent(new Event(FP_EVENT));
  }
  return [st[0], set];
}

function fpDay(d) { return typeof d === 'string' ? d : d.toISOString().slice(0, 10); }
function encodeDateRangeValue(v) {
  if (!v) return undefined;
  return v.kind === 'preset' ? v.preset : fpDay(v.start) + '..' + fpDay(v.end);
}
function decodeDateRangeValue(str, presets) {
  if (!str) return undefined;
  var hit = (presets || []).filter(function (p) { return (p.value || p.label) === str; })[0];
  if (hit) return { kind: 'preset', preset: str };
  var m = /^(\d{4}-\d{2}-\d{2})\.\.(\d{4}-\d{2}-\d{2})$/.exec(str);
  return m ? { kind: 'custom', start: m[1], end: m[2] } : undefined;
}
function resolveDateRange(v, presets) {
  if (!v) return undefined;
  if (v.kind === 'custom') return { start: new Date(v.start), end: new Date(v.end) };
  var p = (presets || []).filter(function (x) { return (x.value || x.label) === v.preset; })[0];
  return p && p.range ? p.range() : undefined;
}

function fpOptions(param) {
  if (param.type === 'date-range') return (param.presets || []).map(function (p) { return { value: { kind: 'preset', preset: p.value || p.label }, label: p.label }; });
  return (param.options || []).map(function (o) { return typeof o === 'string' ? { value: o, label: o } : o; });
}
function fpKey(param, v) { return param.type === 'date-range' ? encodeDateRangeValue(v) : String(v); }
function fpEmpty(v) { return v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length); }
function fpEncode(param, v) {
  if (param.encode) return param.encode(fpEmpty(v) ? undefined : v);
  var o = {}, k = param.param || param.key;
  if (fpEmpty(v)) o[k] = undefined;
  else if (param.type === 'multi-select') o[k] = v.join(',');
  else if (param.type === 'date-range') o[k] = encodeDateRangeValue(v);
  else o[k] = String(v);
  return o;
}
function fpDecode(param, sp) {
  if (param.decode) return param.decode(sp);
  var raw = sp.get(param.param || param.key);
  if (raw === null || raw === '') return undefined;
  if (param.type === 'multi-select') return raw.split(',').filter(Boolean);
  if (param.type === 'date-range') return decodeDateRangeValue(raw, param.presets);
  return raw;
}
function fpOptionLabel(param, v) {
  if (param.optionLabel) return param.optionLabel(v);
  var k = fpKey(param, v);
  var o = fpOptions(param).filter(function (x) { return fpKey(param, x.value) === k; })[0];
  if (o) return o.label;
  return v && v.kind === 'custom' ? v.start + ' – ' + v.end : String(v);
}
function fpLabel(param, v) {
  if (param.label) return param.label(fpEmpty(v) ? undefined : v);
  if (fpEmpty(v)) return 'Any ' + param.key;
  if (Array.isArray(v)) return v.length > 2 ? fpOptionLabel(param, v[0]) + ' +' + (v.length - 1) : v.map(function (x) { return fpOptionLabel(param, x); }).join(', ');
  return fpOptionLabel(param, v);
}

/* The open popover: portalled and placed under its anchor by useFloating (flips, stays 8px inside the screen).
   Keyed by the anchor, so it re-places when another pill opens it. Calls onPlaced once it is visible. */
function FilterParamsFloat(props) {
  var pos = useFloating(true, props.anchorRef, props.floatRef, { side: 'bottom', align: 'start', offset: 8 });
  var placed = !!pos;
  useLayoutEffect(function () {
    props.placedRef.current = placed;
    if (placed) props.onPlaced();
    return function () { props.placedRef.current = false; };
  }, [placed]);
  return portal(h('div', {
    ref: props.floatRef, className: cx('hy-filter-params__popover', pos && pos.side === 'top' && 'hy-filter-params__popover--top'),
    style: floatingStyle(pos)
  }, props.children));
}

function FilterParamsBar(props) {
  var params = props.params || [];
  var urlState = useSearchParamState();
  var controlled = props.searchParams !== undefined;
  var sp = controlled ? toSearchParams(props.searchParams) : urlState[0];
  function setSp(next) { if (controlled) { if (props.onSearchParamsChange) props.onSearchParamsChange(next); } else urlState[1](next); }

  var open = useState(!!props.defaultOpen);
  var step = useState(null);     /* null = choose a filter, else index into params */
  var query = useState('');
  var active = useState(0);
  var anchor = useState('add');  /* 'add' or a param index whose pill opened the popover */
  var barRef = useRef(null), addRef = useRef(null), inputRef = useRef(null), pillRefs = useRef({});
  var popRef = useRef(null), placedRef = useRef(false);
  var focusInput = useRef(false);
  var uid = useId();
  var listId = uid + '-list';

  var values = params.map(function (p) { return fpDecode(p, sp); });

  function anchorEl(a) { return a === 'add' ? addRef.current : pillRefs.current[a]; }
  /* Read when the popover is placed: the anchor's ref is attached after the popover's first layout effect. */
  var anchorNow = useRef(null);
  anchorNow.current = anchor[0];
  var floatAnchor = useMemo(function () {
    return { get current() { return anchorEl(anchorNow.current) || addRef.current; } };
  }, []);
  /* Focus the search input when asked to, but only once the popover is placed (it is hidden until then). */
  function focusIfAsked() {
    if (focusInput.current && inputRef.current && placedRef.current) {
      inputRef.current.focus({ preventScroll: true });
      focusInput.current = false;
    }
  }
  useEffect(function () {
    if (open[0]) focusIfAsked(); else focusInput.current = false;
  }, [open[0], step[0]]);

  function openAt(a, s) {
    focusInput.current = true;
    anchor[1](a); step[1](s); query[1](''); active[1](0); open[1](true);
  }
  function close(returnFocus) {
    var a = anchorNow.current; /* useDismiss keeps the first close it was given, so read the anchor from a ref */
    open[1](false); step[1](null); query[1](''); active[1](0);
    if (returnFocus) { var el = anchorEl(a) || addRef.current; if (el) el.focus({ preventScroll: true }); }
  }
  useDismiss(open[0], [barRef, popRef], function (why) { close(why === 'escape'); });

  function apply(param, v) {
    var next = new URLSearchParams(sp.toString());
    var enc = fpEncode(param, v);
    Object.keys(enc).forEach(function (k) { if (enc[k] === undefined || enc[k] === '') next.delete(k); else next.set(k, enc[k]); });
    setSp(next);
  }
  function merge(extra) {
    var next = new URLSearchParams(sp.toString());
    toSearchParams(extra).forEach(function (val, k) { next.set(k, val); });
    setSp(next);
  }

  var q = query[0].trim().toLowerCase();
  var items = [];
  if (step[0] === null) {
    if (props.ai && q) items.push({ kind: 'ai', label: query[0].trim() });
    params.forEach(function (p, i) { if (!q || p.key.toLowerCase().indexOf(q) !== -1) items.push({ kind: 'param', index: i, label: p.key }); });
  } else {
    var param = params[step[0]];
    if (!q) items.push({ kind: 'clear', label: fpLabel(param, undefined) });
    fpOptions(param).forEach(function (o) {
      var label = param.optionLabel ? param.optionLabel(o.value) : o.label;
      if (!q || String(label).toLowerCase().indexOf(q) !== -1) items.push({ kind: 'option', value: o.value, label: label });
    });
  }
  var act = Math.min(active[0], Math.max(0, items.length - 1));

  function isSelected(item) {
    if (step[0] === null) return false;
    var p = params[step[0]], v = values[step[0]];
    if (item.kind === 'clear') return fpEmpty(v);
    if (fpEmpty(v)) return false;
    var k = fpKey(p, item.value);
    return Array.isArray(v) ? v.some(function (x) { return fpKey(p, x) === k; }) : fpKey(p, v) === k;
  }
  function choose(item) {
    if (!item) return;
    if (item.kind === 'param') { focusInput.current = true; step[1](item.index); query[1](''); active[1](0); return; }
    if (item.kind === 'ai') {
      var res = props.ai.onQuery && props.ai.onQuery(item.label);
      if (res && typeof res.then === 'function') res.then(function (out) { if (out) merge(out); close(false); }, function () {});
      else { if (res) merge(res); close(true); }
      return;
    }
    var p = params[step[0]];
    if (item.kind === 'clear') { apply(p, undefined); if (p.type !== 'multi-select') close(anchor[0] === 'add'); return; }
    if (p.type === 'multi-select') {
      var cur = values[step[0]] || [], k = fpKey(p, item.value);
      var has = cur.some(function (x) { return fpKey(p, x) === k; });
      apply(p, has ? cur.filter(function (x) { return fpKey(p, x) !== k; }) : cur.concat([item.value]));
      return;
    }
    apply(p, item.value);
    close(true);
  }
  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); active[1]((act + 1) % Math.max(1, items.length)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active[1]((act - 1 + items.length) % Math.max(1, items.length)); }
    else if (e.key === 'Home' && !query[0]) { e.preventDefault(); active[1](0); }
    else if (e.key === 'End' && !query[0]) { e.preventDefault(); active[1](items.length - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(items[act]); }
    else if (e.key === 'Backspace' && !query[0] && step[0] !== null && anchor[0] === 'add') { e.preventDefault(); step[1](null); active[1](0); }
    else if (e.key === 'Tab') {
      if (e.shiftKey && stepParam) return; /* to the Back chip, still inside the popover */
      /* The popover lives at the end of <body>: continue tabbing from the element that opened it. */
      var from = anchorEl(anchor[0]) || addRef.current;
      if (from) { if (e.shiftKey) e.preventDefault(); from.focus({ preventScroll: true }); }
      close(false);
    }
  }

  var suggestions = [];
  params.forEach(function (p, i) {
    if (!fpEmpty(values[i]) || !p.suggestion) return;
    var s = p.suggestion();
    if (!fpEmpty(s)) suggestions.push({ index: i, value: s });
  });
  var stepParam = step[0] === null ? null : params[step[0]];
  var thinking = props.ai && props.ai.isThinking;

  var popover = open[0] ? h(FilterParamsFloat, { key: String(anchor[0]), anchorRef: floatAnchor, floatRef: popRef, placedRef: placedRef, onPlaced: focusIfAsked },
    h('div', { className: 'hy-filter-params__search' },
      stepParam ? h('button', {
        type: 'button', className: 'hy-filter-params__chip', 'aria-label': 'Back to filters (' + stepParam.key + ')',
        onClick: function () { focusInput.current = true; step[1](null); query[1](''); active[1](0); }
      }, stepParam.key, h(HY.Icon, { name: 'chevron-down', size: 14 })) : h(HY.Icon, { name: props.ai ? 'sparkles' : 'list-filter', size: 16, className: 'hy-filter-params__search-icon' }),
      h('input', {
        ref: inputRef, type: 'text', role: 'combobox', 'aria-expanded': 'true', 'aria-controls': listId, 'aria-autocomplete': 'list',
        'aria-activedescendant': items.length ? listId + '-' + act : undefined, autoComplete: 'off', spellCheck: false,
        'aria-label': stepParam ? 'Filter ' + stepParam.key + ' to' : 'Filter by',
        placeholder: stepParam ? 'Filter to…' : (props.ai ? 'Filter by, or describe what you want…' : 'Filter by…'),
        value: query[0], onChange: function (e) { query[1](e.target.value); active[1](0); }, onKeyDown: onKeyDown
      })),
    thinking ? h('div', { className: 'hy-filter-params__thinking', role: 'status' },
      h(HY.Spinner, { size: 'sm' }), h('span', null, 'Thinking…'),
      props.ai.onAbort ? h('button', { type: 'button', className: 'hy-filter-params__stop', onClick: props.ai.onAbort }, 'Stop') : null) : null,
    h('ul', { id: listId, role: 'listbox', className: 'hy-filter-params__list', 'aria-label': stepParam ? stepParam.key : 'Filters',
      'aria-multiselectable': stepParam && stepParam.type === 'multi-select' ? 'true' : undefined },
      items.length ? items.map(function (it, i) {
        var sel = isSelected(it);
        return h('li', {
          key: it.kind + ':' + (it.index !== undefined ? it.index : it.label), id: listId + '-' + i, role: 'option',
          'aria-selected': stepParam ? sel : i === act, className: cx('hy-filter-params__option', i === act && 'hy-filter-params__option--active'),
          onMouseDown: function (e) { e.preventDefault(); }, onMouseMove: function () { if (i !== act) active[1](i); },
          onClick: function () { choose(it); }
        },
          it.kind === 'ai' ? h(HY.Icon, { name: 'sparkles', size: 16, className: 'hy-filter-params__affix' }) : null,
          h('span', { className: 'hy-filter-params__text' }, it.label),
          it.kind === 'param' ? h(HY.Icon, { name: 'chevron-right', size: 16, className: 'hy-filter-params__affix hy-filter-params__affix--end' }) : null,
          stepParam && sel ? h(HY.Icon, { name: 'check', size: 16, className: 'hy-filter-params__affix hy-filter-params__affix--end' }) : null);
      }) : h('li', { className: 'hy-filter-params__none', role: 'presentation' }, 'No matches'))) : null;

  return h('div', { ref: barRef, className: cx('hy-filter-params', props.className), role: 'group', 'aria-label': props['aria-label'] || 'Filters' },
    h(HY.Button, {
      ref: addRef, size: 'small', variant: 'secondary', shape: 'rounded', prefix: h(HY.Icon, { name: 'list-filter', size: 16 }),
      'aria-haspopup': 'listbox', 'aria-expanded': open[0] && anchor[0] === 'add',
      onClick: function () { if (open[0] && anchor[0] === 'add') close(false); else openAt('add', null); }
    }, props.addLabel || 'Add Filter'),
    params.map(function (p, i) {
      if (fpEmpty(values[i])) return null;
      return h('span', { key: 'a' + i, className: 'hy-filter-pill' },
        h('button', {
          type: 'button', ref: function (el) { pillRefs.current[i] = el; }, className: 'hy-filter-pill__main',
          'aria-haspopup': 'listbox', 'aria-expanded': open[0] && anchor[0] === i,
          onClick: function () { if (open[0] && anchor[0] === i) close(false); else openAt(i, i); }
        }, h('span', { className: 'hy-filter-pill__key' }, p.key), h('span', { className: 'hy-filter-pill__value' }, fpLabel(p, values[i]))),
        h('button', {
          type: 'button', className: 'hy-filter-pill__remove', 'aria-label': 'Remove ' + p.key + ' filter',
          onClick: function () { apply(p, undefined); if (open[0]) close(false); if (addRef.current) addRef.current.focus(); }
        }, h(HY.Icon, { name: 'x', size: 14 })));
    }),
    suggestions.map(function (s) {
      var p = params[s.index];
      return h('button', { key: 's' + s.index, type: 'button', className: 'hy-filter-suggestion',
        onClick: function () { apply(p, s.value); } },
        h(HY.Icon, { name: 'plus', size: 14 }),
        h('span', { className: 'hy-filter-pill__key' }, p.key), h('span', { className: 'hy-filter-pill__value' }, fpLabel(p, s.value)));
    }),
    popover);
}

FilterParamsBar.useSearchParamState = useSearchParamState;
FilterParamsBar.encodeDateRangeValue = encodeDateRangeValue;
FilterParamsBar.decodeDateRangeValue = decodeDateRangeValue;
FilterParamsBar.resolveDateRange = resolveDateRange;

define('FilterParams', FilterParamsBar);
define('FilterParamsBar', FilterParamsBar);
