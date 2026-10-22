// Tests for the query syntax helper. Run with `npm test` (node --test).
// The first four groups are hyprsh/kestrel's query.test.ts, ported with its renames (negatable → excludable,
// negated → excluded, parse → parseQuery, suggest → suggestQuery, Suggestion's value/input → label/text);
// the groups after them cover what is new: no:name, qualifier-name suggestions and match.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseQuery, queryMenu, querySingle, suggestQuery, termText, valuesOf, withoutTerm, withoutValue, withQueryMenu, withQuerySingle, withValue } from './load-query.mjs';

const qualifiers = [
  { name: 'kind', help: 'what happened', values: ['grab', 'grab_failed', 'import_rejected', 'health_raised'], excludable: true },
  { name: 'slot', help: 'the Slot', values: ['standard', '4k'] },
  { name: 'title', help: 'a Title by name' },
];

// Compares only the keys `expected` names, so a test can ignore a term's span.
const matches = (actual, expected) => assert.deepEqual(actual.map((a, i) => Object.fromEntries(Object.keys(expected[i]).map((k) => [k, a[k]]))), expected);

describe('parsing a query', () => {
  it('reads qualifiers with comma-separated values, quoted values and the free text around them', () => {
    const q = parseQuery('kind:grab_failed,import_rejected heat slot:4k title:"Breaking Bad"  wave', qualifiers);
    matches(q.terms, [
      { name: 'kind', values: ['grab_failed', 'import_rejected'], excluded: false },
      { name: 'slot', values: ['4k'], excluded: false },
      { name: 'title', values: ['Breaking Bad'], excluded: false },
    ]);
    assert.equal(q.text, 'heat wave');
  });

  it('reads a leading - as exclusion, and leaves unknown qualifiers and unfinished ones out of the terms', () => {
    const q = parseQuery('-kind:health_raised error:disk kind: Kind:grab', qualifiers);
    matches(q.terms, [
      { name: 'kind', values: ['health_raised'], excluded: true },
      { name: 'kind', values: ['grab'], excluded: false },
    ]);
    assert.equal(q.text, 'error:disk');
    assert.deepEqual(q.problems, []);
  });

  it('names the values a qualifier does not take and the qualifiers that cannot exclude, and drops them', () => {
    const q = parseQuery('slot:xl,4k -slot:standard kind:nope title:anything', qualifiers);
    matches(q.terms, [
      { name: 'slot', values: ['4k'], excluded: false },
      { name: 'title', values: ['anything'], excluded: false },
    ]);
    assert.deepEqual(q.problems, [
      { message: 'slot: takes standard or 4k, not “xl”', span: [0, 10] },
      { message: 'slot: cannot be excluded', span: [11, 25] },
      { message: 'kind: takes grab, grab_failed, import_rejected or health_raised, not “nope”', span: [26, 35] },
    ]);
  });
});

describe('reading what a qualifier asks for', () => {
  it('ORs the values of one term and ANDs the same qualifier typed twice, leaving exclusions out', () => {
    const q = parseQuery('kind:grab,grab_failed kind:grab_failed,import_rejected -kind:grab slot:4k', qualifiers);
    assert.deepEqual(valuesOf(q, 'kind'), ['grab_failed']);
    assert.deepEqual(valuesOf(q, 'slot'), ['4k']);
    assert.equal(valuesOf(q, 'title'), null);
  });

  it('says nothing can match when the repeats share no value, and maps each term first when asked', () => {
    const q = parseQuery('kind:grab kind:import_rejected', qualifiers);
    assert.deepEqual(valuesOf(q, 'kind'), []);
    assert.deepEqual(valuesOf(q, 'kind', (vs) => vs.flatMap((v) => (v === 'grab' ? ['grab', 'import_rejected'] : [v]))), ['import_rejected']);
  });
});

describe('suggesting values', () => {
  const titled = [...qualifiers.slice(0, 2), { name: 'title', help: 'a Title', suggestions: ['Breaking Bad', 'Better Call Saul', 'Paddington'] }];
  const labels = (text, caret) => suggestQuery(text, caret, titled).map((s) => s.label);

  it('offers the values of the qualifier being typed, best match first, without the ones already chosen', () => {
    assert.deepEqual(labels('heat kind:', 10), ['grab', 'grab_failed', 'import_rejected', 'health_raised']);
    assert.deepEqual(labels('kind:grab,', 10), ['grab_failed', 'import_rejected', 'health_raised']);
    assert.deepEqual(labels('kind:rab', 8), ['grab', 'grab_failed']);
    assert.deepEqual(labels('title:b', 7), ['Breaking Bad', 'Better Call Saul']);
    assert.deepEqual(labels('heat', 4), []);
    assert.deepEqual(labels('kind:grab heat', 14), []);
  });

  it('completes the value under the caret, quoting it, and puts the caret after it', () => {
    const [first] = suggestQuery('slot:4k title:"bre heat', 18, titled);
    assert.equal(first.label, 'Breaking Bad');
    assert.equal(first.text, 'slot:4k title:"Breaking Bad" heat');
    assert.equal(first.caret, 28);
    const [excl] = suggestQuery('-kind:grab,he', 13, titled);
    assert.equal(excl.text, '-kind:grab,health_raised');
    assert.equal(excl.caret, 24);
  });
});

describe('editing a query', () => {
  it('adds a value to the qualifier already there, as an OR, or as a new qualifier, quoting it when needed', () => {
    assert.equal(withValue('heat', 'kind', 'grab', qualifiers), 'heat kind:grab');
    assert.equal(withValue('kind:grab heat', 'kind', 'grab_failed', qualifiers), 'kind:grab,grab_failed heat');
    assert.equal(withValue('kind:grab', 'kind', 'grab', qualifiers), 'kind:grab');
    assert.equal(withValue('-kind:grab', 'kind', 'grab_failed', qualifiers), '-kind:grab kind:grab_failed');
    assert.equal(withValue('', 'title', 'Breaking Bad', qualifiers), 'title:"Breaking Bad"');
    assert.equal(withValue('title:"Breaking Bad"', 'title', 'Better Call Saul', qualifiers), 'title:"Breaking Bad","Better Call Saul"');
  });

  it('removes one term and leaves the rest as typed', () => {
    const input = 'kind:grab heat  slot:4k title:"Breaking Bad"';
    assert.equal(withoutTerm(input, 1, qualifiers), 'kind:grab heat title:"Breaking Bad"');
    assert.equal(withoutTerm(input, 0, qualifiers), 'heat  slot:4k title:"Breaking Bad"');
    assert.equal(withoutTerm(input, 2, qualifiers), 'kind:grab heat  slot:4k');
  });

  it('takes one value out of every term of that qualifier that has it, and the term with its last value', () => {
    assert.equal(withoutValue('kind:grab,grab_failed heat', 'kind', 'grab', qualifiers), 'kind:grab_failed heat');
    assert.equal(withoutValue('heat kind:grab slot:4k', 'kind', 'grab', qualifiers), 'heat slot:4k');
    assert.equal(withoutValue('kind:grab kind:grab,health_raised', 'kind', 'grab', qualifiers), 'kind:health_raised');
    assert.equal(withoutValue('-kind:grab heat', 'kind', 'grab', qualifiers), '-kind:grab heat');
    assert.equal(withoutValue('heat', 'kind', 'grab', qualifiers), 'heat');
  });

  it('writes a term as it would be typed', () => {
    assert.equal(termText({ name: 'kind', values: ['grab', 'import_rejected'], excluded: true }), '-kind:grab,import_rejected');
    assert.equal(termText({ name: 'title', values: ['Breaking Bad'], excluded: false }), 'title:"Breaking Bad"');
  });
});

describe('no:name', () => {
  const issues = [
    { name: 'label', help: 'a label', values: ['bug', 'docs'], excludable: true, none: true },
    { name: 'assignee', help: 'who it is assigned to', none: true },
    { name: 'is', help: 'open or closed', values: ['open', 'closed'] },
  ];

  it('is a term named no, with the qualifiers that can be empty as its values', () => {
    const q = parseQuery('no:label crash no:assignee', issues);
    matches(q.terms, [
      { name: 'no', values: ['label'], excluded: false, span: [0, 8] },
      { name: 'no', values: ['assignee'], excluded: false, span: [15, 26] },
    ]);
    assert.equal(q.text, 'crash');
    assert.deepEqual(q.problems, []);
  });

  it('takes several names at once, and an unfinished no: is ignored', () => {
    matches(parseQuery('no:label,assignee no:', issues).terms, [{ name: 'no', values: ['label', 'assignee'] }]);
    assert.deepEqual(parseQuery('no:', issues).terms, []);
    assert.deepEqual(parseQuery('no:', issues).problems, []);
  });

  it('is a problem for a qualifier that is not marked none, or that does not exist, and drops it', () => {
    const q = parseQuery('no:is no:label,nope', issues);
    matches(q.terms, [{ name: 'no', values: ['label'] }]);
    assert.deepEqual(q.problems, [
      { message: 'no: takes label or assignee, not “is”', span: [0, 5] },
      { message: 'no: takes label or assignee, not “nope”', span: [6, 19] },
    ]);
  });

  it('cannot be excluded', () => {
    const q = parseQuery('-no:label', issues);
    assert.deepEqual(q.terms, []);
    assert.deepEqual(q.problems, [{ message: 'no: cannot be excluded', span: [0, 9] }]);
  });

  it('is free text when no qualifier can be empty, and a real qualifier called no wins', () => {
    assert.equal(parseQuery('no:label', qualifiers).text, 'no:label');
    const own = [...issues, { name: 'no', help: 'a real one' }];
    matches(parseQuery('no:anything', own).terms, [{ name: 'no', values: ['anything'] }]);
  });

  it('round-trips through termText and the editing functions', () => {
    const [term] = parseQuery('no:label', issues).terms;
    assert.equal(termText(term), 'no:label');
    assert.equal(withoutTerm('crash no:label', 0, issues), 'crash');
    assert.equal(withoutValue('no:label,assignee', 'no', 'label', issues), 'no:assignee');
  });
});

describe('suggesting qualifier names', () => {
  const issues = [
    { name: 'label', help: 'Has this label', values: ['bug', 'docs'], excludable: true },
    { name: 'assignee', help: 'Assigned to', suggestions: ['ada', 'grace'] },
    { name: 'is', help: 'Open or closed', values: ['open', 'closed'] },
  ];
  const names = (text, caret) => suggestQuery(text, caret, issues).map((s) => s.label);

  it('lists every qualifier name for an empty query, and nothing for an empty word in the middle of one', () => {
    assert.deepEqual(names('', 0), ['label:', 'assignee:', 'is:']);
    assert.deepEqual(names('is:open ', 8), []);
    assert.deepEqual(names('crash ', 6), []);
    assert.deepEqual(names('is:open crash', 9), []);
  });

  it('completes the word to name: and keeps the list open, with the caret after the colon', () => {
    const [s] = suggestQuery('crash la', 8, issues);
    assert.deepEqual(s, { label: 'label:', text: 'crash label:', caret: 12, match: [0, 2], description: 'Has this label', keepOpen: true });
  });

  it('puts names that start with the word first, then names that contain it', () => {
    assert.deepEqual(names('l', 1), ['label:']);
    assert.deepEqual(names('e', 1), ['label:', 'assignee:']);
    assert.deepEqual(suggestQuery('s', 1, issues).map((s) => [s.label, s.match]), [['assignee:', [1, 2]], ['is:', [1, 2]]]);
    assert.deepEqual(names('is', 2), ['is:']);
  });

  it('replaces the whole word under the caret, including a colon that was already there', () => {
    const [s] = suggestQuery('la:bug', 2, issues);
    assert.equal(s.text, 'label:bug');
    assert.equal(s.caret, 6);
  });

  it('offers only the qualifiers that can be excluded after a -, and keeps the - in the label and text', () => {
    const got = suggestQuery('-l', 2, issues);
    assert.deepEqual(got.map((s) => s.label), ['-label:']);
    assert.equal(got[0].text, '-label:');
    assert.equal(got[0].caret, 7);
    assert.deepEqual(got[0].match, [1, 2]);
    assert.deepEqual(names('-', 1), ['-label:']);
  });

  it('is case-insensitive and offers nothing for a word that no name contains', () => {
    assert.deepEqual(names('LA', 2), ['label:']);
    assert.deepEqual(names('zzz', 3), []);
  });

  it('does not suggest names for a word with a colon whose qualifier is unknown', () => {
    assert.deepEqual(names('title:x', 7), []);
  });
});

describe('suggestion details', () => {
  const issues = [{ name: 'label', help: 'Has this label', values: ['bug', 'docs', 'good first issue'], excludable: true }];

  it('walks la → label: → bug', () => {
    const [name] = suggestQuery('la', 2, issues);
    assert.equal(name.text, 'label:');
    const values = suggestQuery(name.text, name.caret, issues);
    assert.deepEqual(values.map((s) => s.label), ['bug', 'docs', 'good first issue']);
    assert.equal(values[0].text, 'label:bug');
    assert.equal(values[0].caret, 9);
    assert.equal(values[0].keepOpen, undefined);
  });

  it('suggests docs and not bug for label:bug,d, and picking it gives label:bug,docs', () => {
    const got = suggestQuery('label:bug,d', 11, [{ name: 'label', help: 'Has this label', values: ['bug', 'docs'] }]);
    assert.deepEqual(got.map((s) => s.label), ['docs']);
    assert.equal(got[0].text, 'label:bug,docs');
    assert.equal(got[0].caret, 14);
  });

  it('sets match on every suggestion, to where the typed text sits in the label', () => {
    assert.deepEqual(suggestQuery('label:oo', 8, issues).map((s) => s.match), [[1, 3]]);
    assert.deepEqual(suggestQuery('label:', 6, issues).map((s) => s.match), [[0, 0], [0, 0], [0, 0]]);
    assert.deepEqual(suggestQuery('label:"good f', 13, issues)[0].match, [0, 6]);
  });

  it('quotes values with spaces and keeps the text after the caret', () => {
    const [s] = suggestQuery('label:good crash', 10, issues);
    assert.equal(s.text, 'label:"good first issue" crash');
    assert.equal(s.caret, 24);
  });
});

describe('reading a query as a filter menu value', () => {
  const issues = [
    { name: 'is', help: 'Open or closed', values: ['open', 'closed'] },
    { name: 'label', help: 'Has this label', excludable: true, none: true },
    { name: 'assignee', help: 'Assigned to', none: true },
    { name: 'sort', help: 'Order', values: ['newest', 'oldest'] },
  ];

  it('collects the included and the excluded values, and whether no:label is there', () => {
    assert.deepEqual(queryMenu('is:open label:bug -label:wontfix', 'label', issues), { include: ['bug'], exclude: ['wontfix'], none: false });
    assert.deepEqual(queryMenu('no:label', 'label', issues), { include: [], exclude: [], none: true });
    assert.deepEqual(queryMenu('no:assignee,label', 'label', issues), { include: [], exclude: [], none: true });
    assert.deepEqual(queryMenu('is:open', 'label', issues), { include: [], exclude: [], none: false });
  });

  it('shows every value of every term of the qualifier, once', () => {
    assert.deepEqual(queryMenu('label:bug,docs crash label:docs,perf -label:a -label:b,a', 'label', issues),
      { include: ['bug', 'docs', 'perf'], exclude: ['a', 'b'], none: false });
  });

  it('keeps values that match no row, and ignores no: when no qualifier takes none', () => {
    assert.deepEqual(queryMenu('label:nope', 'label', issues).include, ['nope']);
    assert.deepEqual(queryMenu('no:label', 'label', [{ name: 'label', help: '' }]).none, false);
  });

  it('reads a single option from the sort term, or the default', () => {
    assert.equal(querySingle('is:open sort:oldest', 'sort', 'newest', issues), 'oldest');
    assert.equal(querySingle('is:open', 'sort', 'newest', issues), 'newest');
    assert.equal(querySingle('sort:oldest sort:newest', 'sort', 'newest', issues), 'newest');
    assert.equal(querySingle('is:open', 'sort', undefined, issues), '');
  });
});

describe('writing a filter menu value into a query', () => {
  const issues = [
    { name: 'is', help: 'Open or closed', values: ['open', 'closed'] },
    { name: 'label', help: 'Has this label', excludable: true, none: true },
    { name: 'assignee', help: 'Assigned to', none: true },
    { name: 'sort', help: 'Order', values: ['newest', 'oldest'] },
  ];
  const write = (text, next) => withQueryMenu(text, 'label', { include: [], exclude: [], none: false, ...next }, issues);

  it('adds an included value to the label term, or a new term at the end', () => {
    assert.equal(write('is:open label:bug sort:newest', { include: ['bug', 'docs'] }), 'is:open label:bug,docs sort:newest');
    assert.equal(write('is:open sort:newest', { include: ['bug'] }), 'is:open sort:newest label:bug');
    assert.equal(write('', { include: ['bug'] }), 'label:bug');
  });

  it('removes a value from the term, and the term when it has no values left', () => {
    assert.equal(write('is:open label:bug,docs sort:newest', { include: ['docs'] }), 'is:open label:docs sort:newest');
    assert.equal(write('is:open label:bug sort:newest', {}), 'is:open sort:newest');
    assert.equal(write('label:bug,docs label:bug', { include: ['docs'] }), 'label:docs');
  });

  it('excludes and un-excludes the same way on -label:', () => {
    assert.equal(write('is:open label:bug sort:newest', { include: ['bug'], exclude: ['wontfix'] }), 'is:open label:bug sort:newest -label:wontfix');
    assert.equal(write('label:bug -label:wontfix', { include: ['bug'], exclude: ['wontfix', 'dup'] }), 'label:bug -label:wontfix,dup');
    assert.equal(write('label:bug -label:wontfix', { include: ['bug'] }), 'label:bug');
    assert.equal(write('label:bug', { exclude: ['bug'] }), '-label:bug');
    assert.equal(write('-label:bug', { include: ['bug'] }), 'label:bug');
  });

  it('writes no:label and drops the qualifier\'s own terms, then clears no:label when a value is chosen', () => {
    assert.equal(write('is:open label:bug -label:x sort:newest', { none: true }), 'is:open sort:newest no:label');
    assert.equal(write('no:assignee', { none: true }), 'no:assignee,label');
    assert.equal(write('is:open no:label sort:newest', { include: ['bug'] }), 'is:open sort:newest label:bug');
    assert.equal(write('no:label,assignee', { exclude: ['bug'] }), 'no:assignee -label:bug');
    assert.equal(write('is:open no:label', {}), 'is:open');
  });

  it('leaves other terms and free text alone, and returns the same text when nothing changed', () => {
    const text = 'crash is:open  label:bug  sort:newest "a b"';
    assert.equal(write(text, { include: ['bug'] }), text);
    assert.equal(write('crash is:open no:label', { none: true }), 'crash is:open no:label');
    assert.equal(write('crash is:open label:docs', { include: ['bug', 'docs'] }), 'crash is:open label:docs,bug');
  });

  it('replaces a single-valued term, and removes it for the default option', () => {
    assert.equal(withQuerySingle('is:open label:bug sort:newest', 'sort', 'oldest', 'newest', issues), 'is:open label:bug sort:oldest');
    assert.equal(withQuerySingle('is:open label:bug sort:oldest', 'sort', 'newest', 'newest', issues), 'is:open label:bug');
    assert.equal(withQuerySingle('is:open', 'sort', 'oldest', 'newest', issues), 'is:open sort:oldest');
    assert.equal(withQuerySingle('sort:oldest is:open sort:newest', 'sort', 'oldest', 'newest', issues), 'sort:oldest is:open');
    assert.equal(withQuerySingle('is:open sort:oldest', 'sort', 'oldest', 'newest', issues), 'is:open sort:oldest');
  });
});
