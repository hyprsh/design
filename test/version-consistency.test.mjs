// The version in package.json, the install tags in the docs and the newest CHANGELOG.md section must agree, so a release can't half-land.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compareVersions } from '../scripts/release.mjs';

const read = (f) => readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const version = JSON.parse(read('package.json')).version;

describe('version consistency', () => {
  for (const file of ['README.md', 'docs/getting-started.md']) {
    it(`${file}: every install tag is v${version}`, () => {
      const tags = [...read(file).matchAll(/github:hyprsh\/design#(v[^\s`'")]*)/g)].map((m) => m[1]);
      assert.ok(tags.length > 0, `${file} has no github:hyprsh/design#v… install tag`);
      for (const tag of tags) assert.equal(tag, `v${version}`, `${file} installs ${tag}, package.json is ${version}`);
    });
  }

  it('CHANGELOG.md has no section newer than package.json', () => {
    const newest = /^## v(\d+\.\d+\.\d+)\s*$/m.exec(read('CHANGELOG.md'));
    assert.ok(newest, 'CHANGELOG.md has no "## vX.Y.Z" section');
    assert.ok(compareVersions(newest[1], version) <= 0, `CHANGELOG.md's newest section is v${newest[1]}, newer than package.json's ${version}`);
  });
});
