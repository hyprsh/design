/* FilterMenu: a hyprsh original (no Geist page). A filter menu that starts empty and adds values: each row is
   included, or excluded with `excludable`; it can search, group rows in sections and offer a "none" row.
   <FilterMenu label="Labels" value onChange items noneLabel excludable searchable/>, or rows as parts:
   <FilterMenu label><FilterMenu.Section title><FilterMenu.Item value label description prefix suffix/></FilterMenu.Section></FilterMenu>.
   `single` makes it a one-of menu ("Sort: Newest"). The parts only carry props: FilterMenu reads them. */
function FilterMenuItem() { return null; }
function FilterMenuSection() { return null; }

var FM_EMPTY = { include: [], exclude: [], none: false };

function fmNormalize(v) {
  return v ? { include: (v.include || []).map(String), exclude: (v.exclude || []).map(String), none: !!v.none } : FM_EMPTY;
}

function fmRow(o) {
  var opt = typeof o === 'object' ? o : { value: o };
  var value = String(opt.value);
  return { value: value, label: opt.label != null ? String(opt.label) : value, description: opt.description, prefix: opt.prefix, suffix: opt.suffix, disabled: !!opt.disabled };
}

/* Rows grouped in the order given: `items` first, then the parts. A group with no title is a run of loose rows. */
function fmGroups(props) {
  var groups = [];
  function loose() {
    var last = groups[groups.length - 1];
    if (!last || last.title != null) { last = { title: null, rows: [] }; groups.push(last); }
    return last;
  }
  (props.items || []).forEach(function (o) { loose().rows.push(fmRow(o)); });
  function walk(children, section) {
    React.Children.forEach(children, function (c) {
      if (!c || !c.type) return;
      if (c.type === React.Fragment) walk(c.props.children, section);
      else if (c.type === FilterMenuSection) {
        var g = { title: c.props.title, rows: [] };
        groups.push(g);
        walk(c.props.children, g);
      } else if (c.type === FilterMenuItem) (section || loose()).rows.push(fmRow(c.props));
    });
  }
  walk(props.children, null);
  return groups;
}

/* 0 when the query starts a word, 1 when it is found elsewhere, -1 when it is not found. */
function fmRank(row, q) {
  var text = (row.label + ' ' + row.value).toLowerCase();
  if (text.indexOf(q) < 0) return -1;
  return text.split(/[\s\-_\/.:]+/).some(function (w) { return w.indexOf(q) === 0; }) ? 0 : 1;
}

function FilterMenu(props) {
  var auto = useId();
  var id = props.id || auto;
  var single = !!props.single;
  var label = props.label || 'Filter';
  var noneLabel = !single ? props.noneLabel : undefined;
  var excludable = !!props.excludable && !single;
  var groups = fmGroups(props);
  var os = useControllable(props.open, !!props.defaultOpen, props.onOpenChange);
  var open = !!os[0];
  var vs = useControllable(props.value, props.defaultValue !== undefined ? props.defaultValue : (single ? (props.defaultOption != null ? props.defaultOption : '') : FM_EMPTY), props.onChange);
  var v = single ? null : fmNormalize(vs[0]);
  var current = single ? (vs[0] == null ? '' : String(vs[0])) : null;
  var qs = useState('');
  var query = qs[0], setQuery = qs[1];
  var as = useState(0);
  var active = as[0], setActive = as[1];
  var ms = useState('');
  var message = ms[0], setMessage = ms[1];
  var trigger = useRef(null);
  var panel = useRef(null);
  var listRef = useRef(null);
  var input = useRef(null);
  var byUser = useRef(false);

  var all = [];
  groups.forEach(function (g) { g.rows.forEach(function (r) { if (!all.some(function (a) { return a.value === r.value; })) all.push(r); }); });
  var searchable = props.searchable !== undefined ? !!props.searchable : all.length > 8;
  function labelOf(val) {
    for (var i = 0; i < all.length; i++) if (all[i].value === val) return all[i].label;
    return val;
  }

  /* Chosen values that match no row are listed first, so they can be unchecked. */
  var strays = [];
  if (!single) v.include.concat(v.exclude).forEach(function (val) { if (!all.some(function (a) { return a.value === val; }) && strays.indexOf(val) < 0) strays.push(val); });

  var q = searchable ? query.trim().toLowerCase() : '';
  var shown = [];
  if (q) {
    /* While searching, sections and the none row are dropped and each match is listed once. */
    var seen = {}, found = [];
    strays.map(fmRow).concat(all).forEach(function (r) {
      var rank = fmRank(r, q);
      if (rank >= 0 && !seen[r.value]) { seen[r.value] = true; found.push({ rank: rank, row: r, at: found.length }); }
    });
    found.sort(function (a, b) { return a.rank - b.rank || a.at - b.at; });
    shown.push({ title: null, entries: found.map(function (f) { return { row: f.row }; }) });
  } else {
    var top = strays.map(function (s) { return { row: fmRow(s) }; });
    if (noneLabel) top.unshift({ none: true, row: { value: '', label: noneLabel } });
    if (top.length) shown.push({ title: null, entries: top });
    groups.forEach(function (g) { if (g.rows.length) shown.push({ title: g.title, entries: g.rows.map(function (r) { return { row: r }; }) }); });
  }
  var flat = [];
  shown.forEach(function (g) { g.entries.forEach(function (e) { e.index = flat.length; flat.push(e); }); });

  /* 'on' (included or the picked option), 'ex' (excluded) or 'off' */
  function stateOf(e) {
    if (single) return current === e.row.value ? 'on' : 'off';
    if (e.none) return v.none ? 'on' : 'off';
    return v.include.indexOf(e.row.value) >= 0 ? 'on' : v.exclude.indexOf(e.row.value) >= 0 ? 'ex' : 'off';
  }

  function setOpen(next) {
    os[1](next);
    if (!next) { setQuery(''); byUser.current = false; }
  }
  function closeToTrigger() { setOpen(false); if (trigger.current) trigger.current.focus(); }
  useDismiss(open, [trigger, panel], function (reason) {
    setOpen(false);
    if (reason === 'escape' && trigger.current) trigger.current.focus();
  });
  var pos = useFloating(open, trigger, panel, { side: 'bottom', align: props.align === 'end' ? 'end' : 'start', offset: 8 });
  var placed = !!pos;

  /* Focus stays in the search box, or in the list when there is no search. Only when opened from the trigger. */
  useEffect(function () {
    if (!open || !placed || !byUser.current) return;
    var el = searchable ? input.current : listRef.current;
    if (el) el.focus({ preventScroll: true });
  }, [open, placed]);

  /* The highlight starts on the first row that can be chosen, and again whenever the search changes. */
  useEffect(function () {
    if (!open) return;
    var i = 0;
    while (i < flat.length && flat[i].row.disabled) i++;
    setActive(i < flat.length ? i : -1);
  }, [open, query]);
  useEffect(function () {
    if (!open || active < 0 || !listRef.current) return;
    var el = listRef.current.querySelector('[data-index="' + active + '"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [active, open]);
  /* useFloating re-measures on any scroll: nudge it when filtering changes the panel's height */
  useLayoutEffect(function () {
    if (open && panel.current) panel.current.dispatchEvent(new Event('scroll'));
  }, [open, flat.length]);

  function emit(next, text) { vs[1](next); setMessage(text); }
  function without(list, val) { return list.filter(function (x) { return x !== val; }); }
  function pick(e) {
    if (!e || e.row.disabled) return;
    var val = e.row.value, name = e.row.label;
    if (single) { emit(val, name + ' selected'); closeToTrigger(); return; }
    if (e.none) {
      if (v.none) emit({ include: [], exclude: [], none: false }, name + ' removed');
      else emit({ include: [], exclude: [], none: true }, name + ' selected');
    } else if (v.include.indexOf(val) >= 0) emit({ include: without(v.include, val), exclude: v.exclude, none: false }, name + ' removed');
    else if (v.exclude.indexOf(val) >= 0) emit({ include: v.include, exclude: without(v.exclude, val), none: false }, name + ' removed');
    else emit({ include: v.include.concat([val]), exclude: v.exclude, none: false }, name + ' included');
  }
  function exclude(e) {
    if (!excludable || !e || e.none || e.row.disabled) return;
    var val = e.row.value, name = e.row.label;
    if (v.exclude.indexOf(val) >= 0) emit({ include: v.include, exclude: without(v.exclude, val), none: false }, name + ' removed');
    else emit({ include: without(v.include, val), exclude: v.exclude.concat([val]), none: false }, name + ' excluded');
  }
  function move(to, dir) {
    var i = to;
    while (i >= 0 && i < flat.length && flat[i].row.disabled) i += dir;
    if (i >= 0 && i < flat.length) setActive(i);
  }
  function onKeyDown(ev) {
    var k = ev.key;
    if (k === 'Tab') {
      /* Closing from the trigger makes the next Tab continue after it, as if the panel sat right behind it. */
      if (trigger.current) trigger.current.focus();
      if (ev.shiftKey) ev.preventDefault();
      setOpen(false);
    } else if (k === 'ArrowDown') { ev.preventDefault(); move(active < 0 ? 0 : active + 1, 1); }
    else if (k === 'ArrowUp') { ev.preventDefault(); move(active < 0 ? flat.length - 1 : active - 1, -1); }
    else if (k === 'Home') { ev.preventDefault(); move(0, 1); }
    else if (k === 'End') { ev.preventDefault(); move(flat.length - 1, -1); }
    else if (k === 'Enter' || (k === ' ' && !searchable)) {
      ev.preventDefault();
      if (ev.shiftKey && k === 'Enter') exclude(flat[active]); else pick(flat[active]);
    }
  }

  /* The trigger says what is chosen: its text is short, its accessible name lists every value. */
  var count = single ? 0 : v.include.length + v.exclude.length;
  var text, name, chosen;
  if (single) {
    text = label + ': ' + labelOf(current);
    name = text;
    chosen = current !== (props.defaultOption != null ? String(props.defaultOption) : '');
  } else {
    var parts = v.include.map(labelOf).concat(v.exclude.map(function (x) { return 'not ' + labelOf(x); }));
    if (v.none) parts = [noneLabel || 'None'];
    chosen = parts.length > 0;
    text = !chosen ? label : v.none ? parts[0] : count === 1 ? (v.include.length ? labelOf(v.include[0]) : 'Not ' + labelOf(v.exclude[0])) : label + ' · ' + count;
    name = chosen ? label + ': ' + parts.join(', ') : label;
  }

  var activeId = open && active >= 0 && flat[active] ? id + '-opt-' + active : undefined;
  var listId = id + '-list';
  var lower = label.toLowerCase();
  var rest = omit(props, ['id', 'label', 'value', 'defaultValue', 'onChange', 'items', 'noneLabel', 'excludable', 'searchable', 'single', 'defaultOption', 'size', 'align', 'width', 'open', 'defaultOpen', 'onOpenChange', 'disabled', 'className', 'style', 'children']);

  return h('div', Object.assign({}, rest, { className: cx('hy-filtermenu', props.className), style: props.style }),
    h(HY.Button, {
      ref: trigger, variant: 'secondary', size: props.size || 'small', disabled: props.disabled,
      className: cx('hy-filtermenu__trigger', chosen && 'is-active'),
      'aria-haspopup': 'listbox', 'aria-expanded': open, 'aria-controls': open ? listId : undefined, 'aria-label': name,
      suffix: h('span', { className: cx('hy-filtermenu__chevron', open && 'is-open') }, h(Glyph, { name: 'chevron', size: 16 })),
      onClick: function () { byUser.current = true; setOpen(!open); }
    }, text),
    open ? portal(h('div', {
      ref: panel,
      className: cx('hy-filtermenu__panel', (pos ? pos.side === 'top' : false) && 'hy-filtermenu__panel--top', props.align === 'end' && 'hy-filtermenu__panel--end'),
      style: floatingStyle(pos, { width: props.width }),
      onKeyDown: onKeyDown,
      onMouseDown: function (e) { if (e.target !== input.current) e.preventDefault(); }
    },
      searchable ? h('div', { className: 'hy-filtermenu__search' },
        h('span', { className: 'hy-filtermenu__searchicon', 'aria-hidden': 'true' }, h(Glyph, { name: 'search', size: 16 })),
        h('input', {
          ref: input, type: 'text', role: 'combobox', autoComplete: 'off', spellCheck: false,
          'aria-label': 'Search ' + lower, 'aria-expanded': true, 'aria-controls': listId, 'aria-autocomplete': 'list', 'aria-activedescendant': activeId,
          placeholder: 'Search…', value: query, onChange: function (e) { setQuery(e.target.value); }
        })) : null,
      h('div', {
        ref: listRef, id: listId, role: 'listbox', className: 'hy-filtermenu__list',
        'aria-label': label, 'aria-multiselectable': single ? undefined : 'true',
        tabIndex: searchable ? undefined : 0, 'aria-activedescendant': searchable ? undefined : activeId
      },
        flat.length === 0
          ? h('div', { className: 'hy-filtermenu__empty', role: 'presentation' }, 'No ' + lower + ' match “' + query.trim() + '”')
          : shown.map(function (g, gi) {
            var head = g.title != null ? id + '-group-' + gi : null;
            var rows = g.entries.map(function (e) {
              var st = stateOf(e);
              var r = e.row;
              var oid = id + '-opt-' + e.index;
              return h('div', {
                key: e.index, id: oid, role: 'option', 'data-index': e.index,
                'aria-selected': st !== 'off', 'aria-disabled': r.disabled ? 'true' : undefined,
                'aria-label': r.label + (st === 'ex' ? ', excluded' : ''),
                'aria-describedby': r.description ? oid + '-desc' : undefined,
                className: cx('hy-filtermenu__option', e.index === active && 'is-active', st === 'ex' && 'is-excluded', r.disabled && 'is-disabled'),
                onMouseMove: function () { if (!r.disabled && active !== e.index) setActive(e.index); },
                onClick: function () { pick(e); }
              },
                h('span', { className: cx('hy-filtermenu__mark', single && 'hy-filtermenu__mark--single', st !== 'off' && 'is-on'), 'aria-hidden': 'true' },
                  st === 'on' ? h(Glyph, { name: 'check', size: 12 }) : st === 'ex' ? h(Glyph, { name: 'minus', size: 12 }) : null),
                r.prefix ? h('span', { className: 'hy-filtermenu__affix', 'aria-hidden': 'true' }, r.prefix) : null,
                h('span', { className: 'hy-filtermenu__text' },
                  h('span', { className: 'hy-filtermenu__label' }, r.label),
                  r.description ? h('span', { id: oid + '-desc', className: 'hy-filtermenu__desc' }, r.description) : null),
                r.suffix ? h('span', { className: 'hy-filtermenu__affix hy-filtermenu__hint', 'aria-hidden': 'true' }, r.suffix) : null,
                /* Mouse and touch only: the keyboard excludes with Shift+Enter, so the button is out of the tab order and the tree */
                excludable && !e.none && !r.disabled && st !== 'ex' ? h('button', {
                  type: 'button', tabIndex: -1, 'aria-hidden': 'true', className: 'hy-filtermenu__exclude',
                  onClick: function (ev) { ev.stopPropagation(); exclude(e); }
                }, 'Exclude') : null);
            });
            return head
              ? h('div', { key: gi, role: 'group', 'aria-labelledby': head, className: 'hy-filtermenu__group' },
                h('div', { id: head, role: 'presentation', className: 'hy-filtermenu__title' }, g.title), rows)
              : h('div', { key: gi, role: 'presentation', className: 'hy-filtermenu__group' }, rows);
          }))
    )) : null,
    h('span', { className: 'hy-sr', 'aria-live': 'polite' }, message));
}

FilterMenu.Item = FilterMenuItem;
FilterMenu.Section = FilterMenuSection;

define('FilterMenu', FilterMenu);
define('FilterMenuItem', FilterMenuItem);
define('FilterMenuSection', FilterMenuSection);
