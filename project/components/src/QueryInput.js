/* QueryInput: a text field whose text is the value, with suggestions that complete the word at the caret. <QueryInput value onChange qualifiers /> (or `defaultValue` to let it keep the text), or give it `suggestions(text, caret)`.
   A suggestion carries the whole query after picking it, so the field knows no syntax: the helper in _query.js
   (suggestQuery, parseQuery) is what `qualifiers` turns into suggestions and problems.
   Keys: the field owns Up, Down, Enter, Tab and Escape only while the list is open; otherwise the app's onKeyDown gets
   them. It never reverts the text and never blurs the field. */
function queryHighlight(label, match) {
  var a = match ? Math.max(0, Math.min(match[0], label.length)) : 0;
  var b = match ? Math.max(a, Math.min(match[1], label.length)) : 0;
  if (b <= a) return label;
  return [label.slice(0, a), h('mark', { key: 'm', className: 'hy-query__match' }, label.slice(a, b)), label.slice(b)];
}

function QueryInput(props) {
  var auto = useId();
  var id = props.id || auto;
  var listId = id + '-list';
  var size = props.size === 'small' || props.size === 'large' ? props.size : 'medium';
  var vs = useControllable(props.value, props.defaultValue == null ? '' : String(props.defaultValue), props.onChange);
  var value = vs[0] == null ? '' : String(vs[0]);
  var qualifiers = props.qualifiers;
  var cs = useState(null), caret = cs[0], setCaret = cs[1];
  var as = useState(0), active = as[0], setActive = as[1];
  var ds = useState(false), dismissed = ds[0], setDismissed = ds[1];
  var input = useRef(null), field = useRef(null), listRef = useRef(null);
  var shortcut = typeof props.shortcut === 'string' && props.shortcut ? props.shortcut : null;
  /* Where the caret goes once a picked suggestion is in the field. */
  var placeCaret = useRef(null);

  var suggestions = caret === null || dismissed || props.disabled ? []
    : props.suggestions ? props.suggestions(value, caret)
    : qualifiers ? suggestQuery(value, caret, qualifiers) : [];
  var open = suggestions.length > 0;
  var current = Math.min(active, suggestions.length - 1);

  useLayoutEffect(function () {
    if (placeCaret.current === null) return;
    if (input.current) input.current.setSelectionRange(placeCaret.current, placeCaret.current);
    placeCaret.current = null;
  });
  useEffect(function () {
    if (!open || !listRef.current) return;
    var el = listRef.current.querySelector('[data-index="' + current + '"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [current, open]);
  /* useFloating re-measures on any scroll: nudge it when the list's height or the field's width changes. */
  var fieldWidth = open && field.current ? field.current.offsetWidth : undefined;
  useLayoutEffect(function () {
    if (open && listRef.current) listRef.current.dispatchEvent(new Event('scroll'));
  }, [open, suggestions.length, fieldWidth]);
  /* The shortcut key focuses the field from anywhere on the page, unless focus is already in something editable (this field too). */
  useEffect(function () {
    if (!shortcut || props.disabled) return;
    function onKey(e) {
      if (e.key !== shortcut || e.metaKey || e.ctrlKey || e.altKey || e.isComposing || e.keyCode === 229) return;
      var t = e.target;
      if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName || ''))) return;
      if (!input.current) return;
      e.preventDefault();
      input.current.focus();
    }
    window.addEventListener('keydown', onKey);
    return function () { window.removeEventListener('keydown', onKey); };
  }, [shortcut, props.disabled]);
  var pos = useFloating(open, field, listRef, { side: 'bottom', align: 'start', offset: 4 });

  function edit(text, at, close) {
    vs[1](text);
    setCaret(at);
    setActive(0);
    setDismissed(close);
  }
  function pick(i) {
    var s = suggestions[i];
    if (!s) return;
    placeCaret.current = s.caret;
    edit(s.text, s.caret, !s.keepOpen);
    if (input.current) input.current.focus();
  }
  function onKeyDown(e) {
    var n = suggestions.length;
    if (open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      setActive((current + (e.key === 'ArrowDown' ? 1 : n - 1)) % n);
    } else if (open && (e.key === 'Enter' || e.key === 'Tab') && !e.shiftKey && !(e.nativeEvent && e.nativeEvent.isComposing)) {
      e.preventDefault();
      pick(current);
    } else if (open && e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setDismissed(true);
    } else if (props.onKeyDown) props.onKeyDown(e);
  }

  /* Problems of terms that are finished: the one the caret is in is still being typed. */
  var problems = qualifiers ? parseQuery(value, qualifiers).problems.filter(function (p) {
    return caret === null || caret < p.span[0] || caret > p.span[1];
  }) : [];
  var problemsId = id + '-problems';
  var showHelp = props.help !== false && qualifiers && qualifiers.length > 0;
  var rest = omit(props, ['value', 'defaultValue', 'onChange', 'suggestions', 'qualifiers', 'help', 'size', 'className', 'id', 'onKeyDown', 'style', 'shortcut']);

  return h('div', { className: cx('hy-query', props.className), style: props.style },
    h('div', { className: 'hy-query__row' },
      h('div', { ref: field, className: 'hy-query__field' },
        h(HY.Input, Object.assign({}, rest, {
          'aria-keyshortcuts': props['aria-keyshortcuts'] || shortcut || undefined,
          suffix: shortcut && value === '' ? h(HY.KeyboardInput, { small: true, 'aria-hidden': 'true' }, shortcut) : undefined, suffixStyling: shortcut ? false : undefined,
          ref: input, id: id, size: size, value: value, role: 'combobox', autoComplete: 'off', spellCheck: false,
          'aria-autocomplete': 'list', 'aria-expanded': open, 'aria-controls': open ? listId : undefined,
          'aria-activedescendant': open ? id + '-opt-' + current : undefined,
          'aria-describedby': cx(props['aria-describedby'], problems.length ? problemsId : null) || undefined,
          onChange: function (e) { edit(e.target.value, e.target.selectionStart == null ? e.target.value.length : e.target.selectionStart, false); },
          onSelect: function (e) { if (document.activeElement === e.currentTarget) setCaret(e.currentTarget.selectionStart); },
          onFocus: function (e) { setCaret(e.currentTarget.selectionStart); setDismissed(false); },
          onBlur: function () { setCaret(null); },
          onKeyDown: onKeyDown
        }))),
      showHelp ? h(HY.QueryHelpButton, { qualifiers: qualifiers, size: size }) : null),
    problems.length ? h(HY.Note, { id: problemsId, variant: 'warning', size: 'small', role: 'status' }, problems.map(function (p) { return p.message; }).join(' · ')) : null,
    open ? portal(h('ul', {
      ref: listRef, id: listId, role: 'listbox', 'aria-label': 'Suggestions',
      className: cx('hy-query__list', pos && 'hy-query__list--' + pos.side),
      style: floatingStyle(pos, { width: fieldWidth, minWidth: 'min(200px, calc(100vw - 16px))' }),
      onMouseDown: function (e) { e.preventDefault(); }
    }, suggestions.map(function (s, i) {
      return h('li', {
        key: i + ':' + s.text, id: id + '-opt-' + i, role: 'option', 'data-index': i, 'aria-selected': i === current,
        className: cx('hy-query__option', i === current && 'is-active'),
        onMouseMove: function () { if (active !== i) setActive(i); },
        onClick: function () { pick(i); }
      },
        h('span', { className: 'hy-query__label' }, queryHighlight(s.label, s.match)),
        s.description ? h('span', { className: 'hy-query__desc' }, s.description) : null);
    }))) : null,
    h('span', { className: 'hy-sr', 'aria-live': 'polite' }, open ? suggestions.length + (suggestions.length === 1 ? ' suggestion' : ' suggestions') : ''));
}

define('QueryInput', QueryInput);
