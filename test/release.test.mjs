// Tests for the pure pieces of scripts/release.mjs: version parsing and the string rewrites of a release.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseVersion, compareVersions, nextMinor, bumpPackageJson, bumpInstallTags, bumpReleasingExample, ciVerdict } from '../scripts/release.mjs';

describe('parseVersion', () => {
  it('accepts X.Y.Z and vX.Y.Z', () => {
    assert.equal(parseVersion('0.15.0'), '0.15.0');
    assert.equal(parseVersion('v0.15.0'), '0.15.0');
  });
  it('rejects anything else', () => {
    for (const bad of ['', '1.2', 'v1.2.3.4', '1.2.3-rc.1', 'latest', 'vv1.2.3']) assert.throws(() => parseVersion(bad), /not a version/);
  });
});

describe('compareVersions', () => {
  it('compares numerically, not as text', () => {
    assert.ok(compareVersions('0.10.0', '0.9.0') > 0);
    assert.ok(compareVersions('0.14.0', '0.14.1') < 0);
    assert.ok(compareVersions('1.0.0', '0.99.99') > 0);
    assert.equal(compareVersions('0.14.0', '0.14.0'), 0);
  });
});

describe('nextMinor', () => {
  it('bumps the minor and resets the patch', () => {
    assert.equal(nextMinor('0.15.0'), '0.16.0');
    assert.equal(nextMinor('0.15.3'), '0.16.0');
    assert.equal(nextMinor('1.9.0'), '1.10.0');
  });
});

describe('bumpPackageJson', () => {
  it('changes only the version line', () => {
    const src = '{\n  "name": "@hyprsh/design",\n  "version": "0.14.0",\n  "x": { "version": "0.14.0" }\n}\n';
    assert.equal(bumpPackageJson(src, '0.15.0'), src.replace('"version": "0.14.0",', '"version": "0.15.0",'));
  });
  it('throws without a top-level version', () => {
    assert.throws(() => bumpPackageJson('{}', '0.15.0'), /version/);
  });
});

describe('bumpInstallTags', () => {
  it('moves every install tag and nothing else', () => {
    const src = 'a `npm install github:hyprsh/design#v0.14.0`\nb github:hyprsh/design#v0.14.0\nsee v0.14.0 and github:other/x#v0.14.0\n';
    const { text, count } = bumpInstallTags(src, '0.15.0');
    assert.equal(count, 2);
    assert.equal(text, 'a `npm install github:hyprsh/design#v0.15.0`\nb github:hyprsh/design#v0.15.0\nsee v0.14.0 and github:other/x#v0.14.0\n');
  });
  it('reports zero when there is no tag', () => {
    assert.equal(bumpInstallTags('nothing', '0.15.0').count, 0);
  });
});

describe('bumpReleasingExample', () => {
  const readme = '## A\n\nv0.1.0 stays.\n\n### Releasing\n\nRun `node scripts/release.mjs 0.15.0 --push`, tag v0.15.0.\n\n### Contributing\n\nv0.15.0 stays too.\n';
  it('moves the versions inside the Releasing section only', () => {
    const out = bumpReleasingExample(readme, '0.16.0');
    assert.match(out, /release\.mjs 0\.16\.0 --push`, tag v0\.16\.0\./);
    assert.match(out, /v0\.1\.0 stays\./);
    assert.match(out, /v0\.15\.0 stays too\./);
  });
  it('throws when the section is missing', () => {
    assert.throws(() => bumpReleasingExample('# x\n', '0.16.0'), /Releasing/);
  });
});

describe('ciVerdict', () => {
  it('is green when the newest run succeeded', () => {
    assert.equal(ciVerdict([{ status: 'completed', conclusion: 'success' }]).state, 'green');
  });
  it('judges by the newest run, so a green re-run clears an old failure', () => {
    assert.equal(ciVerdict([{ status: 'completed', conclusion: 'success' }, { status: 'completed', conclusion: 'failure' }]).state, 'green');
  });
  it('fails on a failed, cancelled or timed-out run', () => {
    for (const conclusion of ['failure', 'cancelled', 'timed_out']) assert.equal(ciVerdict([{ status: 'completed', conclusion }]).state, 'failed');
  });
  it('asks to try again while a run is going', () => {
    for (const status of ['in_progress', 'queued', 'waiting', 'pending']) {
      const v = ciVerdict([{ status, conclusion: '' }]);
      assert.equal(v.state, 'running');
      assert.match(v.message, /try again/);
    }
  });
  it('refuses when there is no run at all', () => {
    assert.equal(ciVerdict([]).state, 'none');
  });
});
