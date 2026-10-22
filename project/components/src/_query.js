/* The query syntax behind QueryInput, GitHub-style: `name:a,b` qualifiers next to free text. Commas mean OR, the same
   qualifier twice must match both, a leading `-` excludes, double quotes protect spaces and commas, and unknown
   qualifiers are free text. Ported from hyprsh/kestrel's filter/query.ts. Pure functions, no DOM and no React, so
   test/query.test.mjs runs this file in a vm. The bundle puts them on the registry (window.Hyprsh.parseQuery …) and
   the package exports them by name (scripts/package.mjs lists them in QUERY_EXPORTS). */

/* Splits on spaces outside double quotes: [{ raw, start, end }]. */
function queryTokens(input) {
  var out = [], start = -1, quoted = false;
  for (var i = 0; i <= input.length; i++) {
    var c = input.charAt(i);
    if (i === input.length || (!quoted && /\s/.test(c))) {
      if (start >= 0) out.push({ raw: input.slice(start, i), start: start, end: i });
      start = -1;
      continue;
    }
    if (start < 0) start = i;
    if (c === '"') quoted = !quoted;
  }
  return out;
}

/* Splits a qualifier's value on commas outside quotes, and drops the quotes. */
function querySplit(raw) {
  var out = [], cur = '', quoted = false;
  for (var i = 0; i < raw.length; i++) {
    var c = raw.charAt(i);
    if (c === '"') quoted = !quoted;
    else if (c === ',' && !quoted) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map(function (v) { return v.trim(); }).filter(Boolean);
}

function queryQuoted(v) { return /[\s,]/.test(v) ? '"' + v.replace(/"/g, '') + '"' : v; }
function queryEither(v) { return v.length < 2 ? v.join('') : v.slice(0, -1).join(', ') + ' or ' + v[v.length - 1]; }
function queryFind(qualifiers, name) {
  for (var i = 0; i < qualifiers.length; i++) if (qualifiers[i].name === name) return qualifiers[i];
  return null;
}

/* The names of the qualifiers `no:` can name. */
function queryNones(qualifiers) { return qualifiers.filter(function (q) { return q.none; }).map(function (q) { return q.name; }); }

/* What a token is: a term of a known qualifier, or free text. `no:` is always a term, so it is flagged where nothing can
   be empty, unless the app has a qualifier of that name itself. */
function queryTermOf(t, qualifiers) {
  var m = /^(-?)([a-z_]+):(.*)$/i.exec(t.raw);
  if (!m) return null;
  var name = m[2].toLowerCase();
  if (!queryFind(qualifiers, name) && name !== 'no') return null;
  return { name: name, values: querySplit(m[3]), excluded: m[1] === '-', span: [t.start, t.end] };
}

function parseQuery(input, qualifiers) {
  var terms = [], text = [], problems = [];
  queryTokens(input).forEach(function (t) {
    var term = queryTermOf(t, qualifiers);
    if (!term) { text.push(t.raw); return; }
    var own = queryFind(qualifiers, term.name);
    var q = own || { name: 'no', values: queryNones(qualifiers) };
    if (term.excluded && !q.excludable) {
      problems.push({ message: q.name + ': cannot be excluded', span: term.span });
      return;
    }
    if (!own && !q.values.length) {
      if (term.values.length) problems.push({ message: 'no: no qualifier here can be empty', span: term.span });
      return;
    }
    var known = q.values;
    if (known) {
      term.values.filter(function (v) { return known.indexOf(v) < 0; }).forEach(function (v) {
        problems.push({ message: q.name + ': takes ' + queryEither(known) + ', not “' + v + '”', span: term.span });
      });
      term.values = term.values.filter(function (v) { return known.indexOf(v) >= 0; });
    }
    if (term.values.length > 0) terms.push(term);
  });
  return { terms: terms, text: text.join(' '), problems: problems };
}

function valuesOf(q, name, each) {
  var sets = q.terms.filter(function (t) { return t.name === name && !t.excluded; }).map(function (t) {
    var vs = each ? each(t.values) : t.values, seen = [];
    vs.forEach(function (v) { if (seen.indexOf(v) < 0) seen.push(v); });
    return seen;
  });
  if (sets.length === 0) return null;
  return sets.reduce(function (a, b) { return a.filter(function (x) { return b.indexOf(x) >= 0; }); });
}

var QUERY_MAX_SUGGESTIONS = 8;

/* The names to complete the word `typed` to (`name:`, or `-name:` after a dash, which only excludable ones take). A name is
   suggested only when it starts with the word, so a free-text word that is no name's start opens nothing. */
function queryNameSuggestions(input, caret, start, dash, typed, qualifiers) {
  var matching = qualifiers.filter(function (q) { return (!dash || q.excludable) && q.name.toLowerCase().indexOf(typed) === 0; });
  /* The rest of the word goes too, with a colon already after the caret. */
  var end = caret + /^[a-z_]*:?/i.exec(input.slice(caret))[0].length;
  return matching.map(function (q) {
    var label = dash + q.name + ':';
    var head = input.slice(0, start) + label;
    return { label: label, text: head + input.slice(end), caret: head.length, match: [dash.length, dash.length + typed.length], description: q.help, keepOpen: true };
  });
}

function suggestQuery(input, caret, qualifiers) {
  var toks = queryTokens(input.slice(0, caret));
  var token = toks[toks.length - 1];
  /* Nothing is typed yet: the names, but only when the whole query is empty. */
  if (input === '') token = { raw: '', start: 0, end: 0 };
  if (!token || token.end !== caret) return [];
  var m = /^(-?[a-z_]+:)(.*)$/i.exec(token.raw);
  if (!m) {
    var w = /^(-?)([a-z_]*)$/i.exec(token.raw);
    return w ? queryNameSuggestions(input, caret, token.start, w[1], w[2].toLowerCase(), qualifiers) : [];
  }
  var q = queryFind(qualifiers, m[1].replace(/^-/, '').slice(0, -1).toLowerCase());
  if (!q) return [];
  var rest = m[2];
  /* The value being typed starts after the last comma outside quotes. */
  var from = 0, open = false;
  for (var i = 0; i < rest.length; i++) {
    if (rest.charAt(i) === '"') open = !open;
    else if (rest.charAt(i) === ',' && !open) from = i + 1;
  }
  var typed = rest.slice(from).replace(/^"/, '').toLowerCase();
  var chosen = querySplit(rest.slice(0, from));
  var start = token.start + m[1].length + from;
  var end = caret + /^[^\s,]*/.exec(input.slice(caret))[0].length;
  var pool = (q.values || q.suggestions || []).filter(function (v) { return chosen.indexOf(v) < 0 && v.toLowerCase().indexOf(typed) >= 0; });
  var ranked = pool.filter(function (v) { return v.toLowerCase().indexOf(typed) === 0; })
    .concat(pool.filter(function (v) { return v.toLowerCase().indexOf(typed) !== 0; }));
  return ranked.slice(0, QUERY_MAX_SUGGESTIONS).map(function (value) {
    var head = input.slice(0, start) + queryQuoted(value);
    var at = value.toLowerCase().indexOf(typed);
    return { label: value, text: head + input.slice(end), caret: head.length, match: [at, at + typed.length] };
  });
}

function termText(t) { return (t.excluded ? '-' : '') + t.name + ':' + t.values.map(queryQuoted).join(','); }

/* Adds `value` to the term of `name` that is excluded or not, as the call says; a new term goes at the end. */
function queryAdd(input, name, value, excluded, qualifiers) {
  var term = parseQuery(input, qualifiers).terms.filter(function (t) { return t.name === name && t.excluded === excluded; })[0];
  if (!term) return (input.replace(/\s+$/, '') + ' ' + termText({ name: name, values: [value], excluded: excluded })).replace(/^\s+/, '');
  if (term.values.indexOf(value) >= 0) return input;
  var next = termText({ name: term.name, values: term.values.concat([value]), excluded: term.excluded });
  return input.slice(0, term.span[0]) + next + input.slice(term.span[1]);
}

function queryRemove(input, name, value, excluded, qualifiers) {
  var terms = parseQuery(input, qualifiers).terms, out = input;
  /* Right to left, so the spans of the terms still to edit stay where they were. */
  for (var i = terms.length - 1; i >= 0; i--) {
    var t = terms[i];
    if (t.name !== name || t.excluded !== excluded || t.values.indexOf(value) < 0) continue;
    if (t.values.length === 1) out = withoutTerm(out, i, qualifiers);
    else out = out.slice(0, t.span[0]) + termText({ name: t.name, excluded: t.excluded, values: t.values.filter(function (v) { return v !== value; }) }) + out.slice(t.span[1]);
  }
  return out;
}

function withValue(input, name, value, qualifiers) { return queryAdd(input, name, value, false, qualifiers); }
function withoutValue(input, name, value, qualifiers) { return queryRemove(input, name, value, false, qualifiers); }

function withoutTerm(input, index, qualifiers) {
  var term = parseQuery(input, qualifiers).terms[index];
  if (!term) return input;
  var start = term.span[0], end = term.span[1];
  var before = /\s+$/.exec(input.slice(0, start));
  if (before) start -= before[0].length;
  else end += /^\s*/.exec(input.slice(end))[0].length;
  return input.slice(0, start) + input.slice(end);
}

/* The two-way mapping between a query and one filter menu (QueryBar), pure so the tests run it. It is registered on HY but
   not exported by the package. A menu value is { include, exclude, none }: the values of the `name:` terms, of the
   `-name:` terms, and whether `no:name` is there. */
function queryAll(q, name, excluded) {
  var seen = [];
  q.terms.forEach(function (t) {
    if (t.name === name && t.excluded === excluded) t.values.forEach(function (v) { if (seen.indexOf(v) < 0) seen.push(v); });
  });
  return seen;
}

/* A menu owns only a `no:` term that names its qualifier alone: values after one qualifier are alternatives, so
   `no:label,assignee` (no label or no assignee) is not "no label" and stays the query's own. */
function queryIsNone(t, name) { return t.name === 'no' && !t.excluded && t.values.length === 1 && t.values[0] === name; }

function queryMenu(input, name, qualifiers) {
  var q = parseQuery(input, qualifiers);
  return { include: queryAll(q, name, false), exclude: queryAll(q, name, true), none: q.terms.some(function (t) { return queryIsNone(t, name); }) };
}

/* The query after the menu for `name` changed to `next`: only that qualifier's terms are touched, and only where they differ.
   Switching between none and values swaps the terms in place, so the query keeps its order. */
function withQueryMenu(input, name, next, qualifiers) {
  var now = queryMenu(input, name, qualifiers), out = input, terms, first = -1, i;
  if (next.none) {
    var own = queryFind(qualifiers, name);
    if (!own || !own.none) return input;
    /* Everything else this qualifier says goes: nothing has a value for it. no:name takes the first term's place. */
    terms = parseQuery(out, qualifiers).terms;
    for (i = 0; i < terms.length && first < 0; i++) if (terms[i].name === name) first = i;
    for (i = terms.length - 1; i > first; i--) if (terms[i].name === name) out = withoutTerm(out, i, qualifiers);
    if (first >= 0 && now.none) return withoutTerm(out, first, qualifiers);
    var none = termText({ name: 'no', values: [name], excluded: false });
    if (first >= 0) return out.slice(0, terms[first].span[0]) + none + out.slice(terms[first].span[1]);
    return now.none ? out : (out.replace(/\s+$/, '') + ' ' + none).replace(/^\s+/, '');
  }
  if (now.none) {
    /* The values chosen in place of none go where no:name was, unless the qualifier already has terms of its own. */
    terms = parseQuery(out, qualifiers).terms;
    for (i = 0; i < terms.length && first < 0; i++) if (queryIsNone(terms[i], name)) first = i;
    for (i = terms.length - 1; i > first; i--) if (queryIsNone(terms[i], name)) out = withoutTerm(out, i, qualifiers);
    var put = [];
    if (!now.include.length && !now.exclude.length) {
      if (next.include.length) put.push(termText({ name: name, values: next.include, excluded: false }));
      if (next.exclude.length) put.push(termText({ name: name, values: next.exclude, excluded: true }));
    }
    if (put.length) return out.slice(0, terms[first].span[0]) + put.join(' ') + out.slice(terms[first].span[1]);
    out = withoutTerm(out, first, qualifiers);
  }
  [false, true].forEach(function (excluded) {
    var from = excluded ? now.exclude : now.include, to = excluded ? next.exclude : next.include;
    from.forEach(function (v) { if (to.indexOf(v) < 0) out = queryRemove(out, name, v, excluded, qualifiers); });
    to.forEach(function (v) { if (from.indexOf(v) < 0) out = queryAdd(out, name, v, excluded, qualifiers); });
  });
  return out;
}

/* A single-valued qualifier such as `sort:`: the last term's first value, or `fallback`. */
function querySingle(input, name, fallback, qualifiers) {
  var terms = parseQuery(input, qualifiers).terms.filter(function (t) { return t.name === name && !t.excluded; });
  return terms.length ? terms[terms.length - 1].values[0] : (fallback == null ? '' : String(fallback));
}

/* Picking the default removes every `name:` term; any other value takes the first one's place and the rest go. */
function withQuerySingle(input, name, value, fallback, qualifiers) {
  var terms = parseQuery(input, qualifiers).terms, out = input, first = -1, i;
  for (i = 0; i < terms.length; i++) if (terms[i].name === name && !terms[i].excluded) { first = i; break; }
  if (value === fallback) {
    for (i = terms.length - 1; i >= 0; i--) if (terms[i].name === name && !terms[i].excluded) out = withoutTerm(out, i, qualifiers);
    return out;
  }
  if (first < 0) return queryAdd(out, name, value, false, qualifiers);
  for (i = terms.length - 1; i > first; i--) if (terms[i].name === name && !terms[i].excluded) out = withoutTerm(out, i, qualifiers);
  var t = terms[first];
  if (t.values.length === 1 && t.values[0] === value) return out;
  return out.slice(0, t.span[0]) + termText({ name: name, values: [value], excluded: false }) + out.slice(t.span[1]);
}

Object.assign(HY, { parseQuery: parseQuery, suggestQuery: suggestQuery, termText: termText, withValue: withValue, withoutValue: withoutValue, withoutTerm: withoutTerm, valuesOf: valuesOf,
  queryMenu: queryMenu, withQueryMenu: withQueryMenu, querySingle: querySingle, withQuerySingle: withQuerySingle });
