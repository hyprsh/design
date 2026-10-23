// Tests for the GitHub release notes that scripts/release-notes.mjs writes from the commit subjects since the previous tag.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { releaseNotes } from '../scripts/release-notes.mjs';

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
