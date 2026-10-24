// Tests for the GitHub release notes that scripts/release-notes.mjs writes from the commit subjects since the previous tag.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { releaseNotes, changelogSection, addToChangelog, CHANGELOG_HEAD } from '../scripts/release-notes.mjs';

describe('releaseNotes', () => {
  it('groups conventional commits by type, with the scope in bold', () => {
    const md = releaseNotes({ tag: 'v0.11.0', subjects: [
      'feat(table): a loading state with skeleton rows',
      'fix(toast): mount the fallback host',
      'fix: tighten the work after review',
      'docs: examples for 20 more components',
      'test: smoke-test the npm entry',
    ] });
    assert.match(md, /## Features\n\n- \*\*table:\*\* a loading state with skeleton rows\n/);
    assert.match(md, /## Fixes\n\n- \*\*toast:\*\* mount the fallback host\n- tighten the work after review\n/);
    assert.match(md, /## Docs\n\n- examples for 20 more components\n/);
    assert.match(md, /## Other\n\n- smoke-test the npm entry\n/);
  });

  it('puts breaking changes first, whatever their type', () => {
    const md = releaseNotes({ tag: 'v0.10.0', subjects: ['fix: a fix', 'feat!: a blue accent', 'feat(book)!: remove the Book component'] });
    assert.ok(md.indexOf('## Breaking changes') < md.indexOf('## Fixes'));
    assert.match(md, /## Breaking changes\n\n- a blue accent\n- \*\*book:\*\* remove the Book component\n/);
    assert.doesNotMatch(md, /## Features/);
  });

  it('leaves out the release commit, and keeps subjects that are not conventional', () => {
    const md = releaseNotes({ tag: 'v0.11.0', subjects: ['chore: release 0.11.0', 'Initial import'] });
    assert.doesNotMatch(md, /release 0\.11\.0/);
    assert.match(md, /## Other\n\n- Initial import\n/);
  });

  it('ends with how to install the tag and where the docs are', () => {
    const md = releaseNotes({ tag: 'v0.11.0', subjects: ['fix: a fix'] });
    assert.match(md, /npm install github:hyprsh\/design#v0\.11\.0/);
    assert.match(md, /https:\/\/hyprsh\.github\.io\/design\//);
  });
});

describe('changelogSection', () => {
  const subjects = ['feat(table): a loading state', 'fix: a fix', 'feat!: a blue accent', 'chore: release 0.13.0'];

  it('is a ## version heading, the tag date, then the groups one level deeper and no Install block', () => {
    const md = changelogSection({ tag: 'v0.13.0', date: '2026-11-01', subjects });
    assert.ok(md.startsWith('## v0.13.0\n\n2026-11-01\n\n### Breaking changes\n\n- a blue accent\n\n### Features\n'));
    assert.match(md, /### Fixes\n\n- a fix\n$/);
    assert.doesNotMatch(md, /Install|npm install/);
  });

  it('lists the same items as the release notes', () => {
    const items = (md) => md.split('\n').filter((l) => l.startsWith('- '));
    assert.deepEqual(items(changelogSection({ tag: 'v0.13.0', date: '2026-11-01', subjects })), items(releaseNotes({ tag: 'v0.13.0', subjects })));
  });
});

describe('addToChangelog', () => {
  const old = `${CHANGELOG_HEAD}## v0.12.0\n\n2026-10-24\n\n### Fixes\n\n- one\n\n## v0.11.0\n\n2026-10-23\n\n### Fixes\n\n- two\n`;
  const section = '## v0.13.0\n\n2026-11-01\n\n### Fixes\n\n- three\n';

  it('puts the new section first and leaves every existing byte alone', () => {
    const out = addToChangelog(old, section);
    assert.ok(out.startsWith(CHANGELOG_HEAD + section + '\n## v0.12.0'));
    assert.ok(out.endsWith(old.slice(CHANGELOG_HEAD.length)));
    assert.equal(out.length, old.length + section.length + 1);
  });

  it('starts a file that does not exist yet', () => {
    assert.equal(addToChangelog('', section), CHANGELOG_HEAD + section);
  });

  it('refuses a version that is already there', () => {
    assert.throws(() => addToChangelog(old, '## v0.12.0\n\n2026-10-24\n'), /v0\.12\.0/);
  });
});
