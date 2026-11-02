// Tests for MonthView's pure parts (hyprsh/design#90): the day layout, the entry grouping and the day names. MonthView.js
// runs in a vm context with stub hooks, so the helper functions can be called without the DOM. The keyboard, narrow form
// and rendering are in month-view-dom.test.mjs.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const src = join(dirname(fileURLToPath(import.meta.url)), '../project/components/src');
const context = vm.createContext({ h: () => null, cx: () => '', define: () => {} });
vm.runInContext(readFileSync(join(src, 'MonthView.js'), 'utf8'), context, { filename: 'MonthView.js' });
const { mvLayout, mvWeekdays, mvGroup, mvVisible, mvDayName, mvKey } = context;

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const flat = (weeks) => weeks.flat();

describe('mvLayout', () => {
  it('starts on firstDayOfWeek and pads with the neighbouring months', () => {
    // November 2025 starts on a Saturday and has 30 days.
    const sun = mvLayout(new Date(2025, 10, 15), 0);
    assert.equal(sun.length, 6);
    assert.ok(sun.every((w) => w.length === 7));
    assert.equal(iso(sun[0][0].date), '2025-10-26');
    assert.equal(iso(sun[0][6].date), '2025-11-01');
    assert.equal(iso(sun[5][6].date), '2025-12-06');
    const mon = mvLayout(new Date(2025, 10, 1), 1);
    assert.equal(iso(mon[0][0].date), '2025-10-27');
    assert.equal(mon.length, 5);
    assert.equal(iso(mon[4][6].date), '2025-11-30');
  });

  it('marks only the days of the month as inMonth', () => {
    const days = flat(mvLayout(new Date(2025, 10, 1), 0));
    assert.equal(days.filter((d) => d.inMonth).length, 30);
    assert.ok(days.filter((d) => d.inMonth).every((d) => d.date.getMonth() === 10));
    assert.ok(days.filter((d) => !d.inMonth).every((d) => d.date.getMonth() !== 10));
  });

  it('has no leading days when the month starts on the first column, and four rows for a 28-day February', () => {
    // February 2026 starts on a Sunday and has 28 days.
    const feb = mvLayout(new Date(2026, 1, 1), 0);
    assert.equal(feb.length, 4);
    assert.equal(iso(feb[0][0].date), '2026-02-01');
    assert.ok(flat(feb).every((d) => d.inMonth));
  });

  it('handles leap years, year boundaries and every firstDayOfWeek', () => {
    assert.equal(flat(mvLayout(new Date(2024, 1, 10), 0)).filter((d) => d.inMonth).length, 29);
    const dec = flat(mvLayout(new Date(2025, 11, 1), 0));
    assert.equal(iso(dec[dec.length - 1].date).slice(0, 4), '2026');
    for (let f = 0; f < 7; f++) {
      for (let m = 0; m < 12; m++) {
        const weeks = mvLayout(new Date(2025, m, 1), f);
        assert.equal(weeks[0][0].date.getDay(), f);
        const days = flat(weeks);
        assert.equal(days.length % 7, 0);
        for (let i = 1; i < days.length; i++) assert.equal(days[i].date - days[i - 1].date >= 23 * 36e5, true, 'consecutive days');
        assert.ok(days.some((d) => d.inMonth && d.date.getDate() === 1));
        assert.equal(weeks[weeks.length - 1].some((d) => d.inMonth), true, 'no empty last row');
      }
    }
  });

  it('wraps and defaults firstDayOfWeek like Calendar (Sunday)', () => {
    assert.equal(iso(mvLayout(new Date(2025, 10, 1))[0][0].date), '2025-10-26');
    assert.equal(iso(mvLayout(new Date(2025, 10, 1), 7)[0][0].date), '2025-10-26');
    assert.equal(iso(mvLayout(new Date(2025, 10, 1), -6)[0][0].date), '2025-10-27');
  });
});

describe('mvWeekdays', () => {
  it('lists seven days from firstDayOfWeek', () => {
    const w = mvWeekdays(1);
    assert.equal(w.length, 7);
    assert.deepEqual(Array.from(w, (d) => d.getDay()), [1, 2, 3, 4, 5, 6, 0]);
  });
});

describe('mvGroup and mvVisible', () => {
  const e = (key, y, m, d, extra) => Object.assign({ key, date: new Date(y, m, d, 14, 30), label: key }, extra);
  it('groups entries by local day in the given order', () => {
    const g = mvGroup([e('a', 2025, 10, 4), e('b', 2025, 10, 5), e('c', 2025, 10, 4)]);
    assert.deepEqual(Array.from(g[mvKey(new Date(2025, 10, 4))], (x) => x.key), ['a', 'c']);
    assert.deepEqual(Array.from(g[mvKey(new Date(2025, 10, 5))], (x) => x.key), ['b']);
    assert.equal(g[mvKey(new Date(2025, 10, 6))], undefined);
  });
  it('shows up to max entries and counts the rest', () => {
    const list = [1, 2, 3, 4, 5].map((n) => ({ key: 'k' + n }));
    assert.deepEqual(Array.from(mvVisible(list, 3).shown, (x) => x.key), ['k1', 'k2', 'k3']);
    assert.equal(mvVisible(list, 3).more, 2);
    assert.equal(mvVisible(list.slice(0, 3), 3).more, 0);
    assert.equal(mvVisible(list, 0).shown.length, 0);
    assert.equal(mvVisible(list, 0).more, 5);
    assert.equal(mvVisible(list, undefined).shown.length, 3);
    assert.equal(mvVisible(undefined, 3).more, 0);
  });
});

describe('mvDayName', () => {
  it('is the full date plus the entry count', () => {
    const fmt = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    assert.equal(mvDayName(fmt, new Date(2025, 10, 4), 3, false), 'Tuesday 4 November, 3 entries');
    assert.equal(mvDayName(fmt, new Date(2025, 10, 4), 1, false), 'Tuesday 4 November, 1 entry');
    assert.equal(mvDayName(fmt, new Date(2025, 10, 4), 0, true), 'Tuesday 4 November, 0 entries, today');
  });
});
