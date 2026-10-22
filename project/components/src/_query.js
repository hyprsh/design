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

/* What a token is: a term of a known qualifier, or free text. `no:` is a term too while some qualifier has `none`,
   unless the app has a qualifier of that name itself. */
function queryTermOf(t, qualifiers) {
  var m = /^(-?)([a-z_]+):(.*)$/i.exec(t.raw);
  if (!m) return null;
  var name = m[2].toLowerCase();
  if (!queryFind(qualifiers, name) && !(name === 'no' && queryNones(qualifiers).length)) return null;
  return { name: name, values: querySplit(m[3]), excluded: m[1] === '-', span: [t.start, t.end] };
}

function parseQuery(input, qualifiers) {
  var terms = [], text = [], problems = [];
  queryTokens(input).forEach(function (t) {
    var term = queryTermOf(t, qualifiers);
    if (!term) { text.push(t.raw); return; }
    var q = queryFind(qualifiers, term.name) || { name: 'no', values: queryNones(qualifiers) };
    if (term.excluded && !q.excludable) {
      problems.push({ message: q.name + ': cannot be excluded', span: term.span });
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

/* The names to complete the word `typed` to (`name:`, or `-name:` after a dash, which only excludable ones take). */
function queryNameSuggestions(input, caret, start, dash, typed, qualifiers) {
  var pool = qualifiers.filter(function (q) { return (!dash || q.excludable) && q.name.toLowerCase().indexOf(typed) >= 0; });
  var ranked = pool.filter(function (q) { return q.name.toLowerCase().indexOf(typed) === 0; })
    .concat(pool.filter(function (q) { return q.name.toLowerCase().indexOf(typed) !== 0; }));
  /* The rest of the word goes too, with a colon already after the caret. */
  var end = caret + /^[a-z_]*:?/i.exec(input.slice(caret))[0].length;
  return ranked.map(function (q) {
    var label = dash + q.name + ':';
    var at = dash.length + q.name.toLowerCase().indexOf(typed);
    var head = input.slice(0, start) + label;
    return { label: label, text: head + input.slice(end), caret: head.length, match: [at, at + typed.length], description: q.help, keepOpen: true };
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

function withValue(input, name, value, qualifiers) {
  var term = parseQuery(input, qualifiers).terms.filter(function (t) { return t.name === name && !t.excluded; })[0];
  if (!term) return (input.replace(/\s+$/, '') + ' ' + termText({ name: name, values: [value], excluded: false })).replace(/^\s+/, '');
  if (term.values.indexOf(value) >= 0) return input;
  var next = termText({ name: term.name, values: term.values.concat([value]), excluded: term.excluded });
  return input.slice(0, term.span[0]) + next + input.slice(term.span[1]);
}

function withoutValue(input, name, value, qualifiers) {
  var terms = parseQuery(input, qualifiers).terms, out = input;
  /* Right to left, so the spans of the terms still to edit stay where they were. */
  for (var i = terms.length - 1; i >= 0; i--) {
    var t = terms[i];
    if (t.name !== name || t.excluded || t.values.indexOf(value) < 0) continue;
    if (t.values.length === 1) out = withoutTerm(out, i, qualifiers);
    else out = out.slice(0, t.span[0]) + termText({ name: t.name, excluded: t.excluded, values: t.values.filter(function (v) { return v !== value; }) }) + out.slice(t.span[1]);
  }
  return out;
}

function withoutTerm(input, index, qualifiers) {
  var term = parseQuery(input, qualifiers).terms[index];
  if (!term) return input;
  var start = term.span[0], end = term.span[1];
  var before = /\s+$/.exec(input.slice(0, start));
  if (before) start -= before[0].length;
  else end += /^\s*/.exec(input.slice(end))[0].length;
  return input.slice(0, start) + input.slice(end);
}

Object.assign(HY, { parseQuery: parseQuery, suggestQuery: suggestQuery, termText: termText, withValue: withValue, withoutValue: withoutValue, withoutTerm: withoutTerm, valuesOf: valuesOf });
