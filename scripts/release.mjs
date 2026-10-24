// Cuts a release: checks the repo is ready, bumps every version in the sources, writes the changelog section, commits and tags.
// Usage: node scripts/release.mjs 0.15.0 [--push] [--dry-run] [--skip-ci-check]   (vX.Y.Z works too)
//          refuses unless the tree is clean, the branch is main and level with origin/main, the version is greater than package.json's,
//          the tag is new, and CI on origin/main's HEAD is green (--skip-ci-check to go ahead without that last check);
//          then bumps package.json and the install tags (README.md, docs/getting-started.md), moves the README's Releasing example
//          to the next minor, runs release-notes.mjs --changelog, commits "chore: release X.Y.Z" and tags vX.Y.Z;
//          --push also pushes main and the tag (which deploys the docs and publishes the GitHub release), otherwise prints that command;
//          --dry-run prints the plan and the diff and changes nothing (failed checks are listed, not fatal)
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { changelogSection, addToChangelog } from './release-notes.mjs';

export const parseVersion = (s) => {
  const m = /^v?(\d+\.\d+\.\d+)$/.exec(s || '');
  if (!m) throw new Error(`${s} is not a version like 0.15.0 or v0.15.0`);
  return m[1];
};
export const compareVersions = (a, b) => {
  const [x, y] = [a, b].map((v) => v.split('.').map(Number));
  return x.reduce((d, n, i) => d || n - y[i], 0);
};
export const nextMinor = (v) => { const [major, minor] = v.split('.').map(Number); return `${major}.${minor + 1}.0`; };

// package.json with the top-level "version" moved; the rest stays byte for byte.
export function bumpPackageJson(text, version) {
  const re = /^(  "version": ")[^"]*(",?)$/m;
  if (!re.test(text)) throw new Error('package.json has no top-level "version" line');
  return text.replace(re, `$1${version}$2`);
}
// Every `github:hyprsh/design#vX.Y.Z` moved to the version; count says how many there were.
export function bumpInstallTags(text, version) {
  let count = 0;
  const out = text.replace(/(github:hyprsh\/design#v)\d+\.\d+\.\d+/g, (_, p) => { count++; return p + version; });
  return { text: out, count };
}
// The README's "### Releasing" section with every version in it (the example) moved to the given one.
export function bumpReleasingExample(readme, version) {
  const start = readme.search(/^### Releasing\s*$/m);
  if (start < 0) throw new Error('README.md has no "### Releasing" section');
  const body = readme.indexOf('\n', start) + 1;
  const rest = readme.slice(body).search(/^#{1,3} /m);
  const end = rest < 0 ? readme.length : body + rest;
  return readme.slice(0, start) + readme.slice(start, end).replace(/\d+\.\d+\.\d+/g, version) + readme.slice(end);
}
// What `gh run list --json status,conclusion` (newest first) says about CI: { state: 'green' | 'failed' | 'running' | 'none', message }.
export function ciVerdict(runs) {
  const run = runs[0];
  if (!run) return { state: 'none', message: 'CI has no run for origin/main\'s HEAD (yet); wait for it to start, or pass --skip-ci-check' };
  if (run.status !== 'completed') return { state: 'running', message: 'CI is still running on origin/main; try again when it has finished' };
  if (run.conclusion === 'success') return { state: 'green', message: 'CI is green on origin/main' };
  return { state: 'failed', message: `CI on origin/main did not pass (${run.conclusion}); fix main first, or pass --skip-ci-check` };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const usage = 'Usage: node scripts/release.mjs <X.Y.Z> [--push] [--dry-run] [--skip-ci-check]';
  const args = process.argv.slice(2);
  const take = (name) => { const at = args.indexOf(name); if (at >= 0) args.splice(at, 1); return at >= 0; };
  const [push, dry, skipCi] = ['--push', '--dry-run', '--skip-ci-check'].map(take);
  const die = (msg) => { console.error(msg); process.exit(1); };
  if (args.length !== 1 || args[0].startsWith('--')) die(usage);
  let version;
  try { version = parseVersion(args[0]); } catch (e) { die(`${e.message}\n${usage}`); }
  const tag = `v${version}`;
  const run = (cmd, ...a) => execFileSync(cmd, a, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const git = (...a) => run('git', ...a);
  const read = (f) => readFileSync(join(root, f), 'utf8');

  // Checks: each may add a problem; a real run stops if there are any, a dry run lists them and carries on.
  const problems = [];
  const check = (fn) => { try { const msg = fn(); if (msg) problems.push(msg); } catch (e) { problems.push((e.stderr || e.message).toString().trim()); } };
  const current = JSON.parse(read('package.json')).version;
  check(() => git('status', '--porcelain') && 'the working tree is not clean; commit or stash first');
  check(() => { const b = git('rev-parse', '--abbrev-ref', 'HEAD'); return b !== 'main' && `on branch ${b}, releases are cut from main`; });
  check(() => compareVersions(version, current) <= 0 && `${version} is not greater than package.json's ${current}`);
  check(() => {
    if (git('tag', '-l', tag)) return `the tag ${tag} already exists`;
    if (git('ls-remote', '--tags', 'origin', `refs/tags/${tag}`)) return `the tag ${tag} already exists on origin`;
  });
  let sha = '';
  check(() => {
    git('fetch', 'origin', 'main');
    sha = git('rev-parse', 'origin/main');
    if (git('rev-parse', 'HEAD') === sha) return;
    const [ahead, behind] = git('rev-list', '--left-right', '--count', 'HEAD...origin/main').split(/\s+/).map(Number);
    return `HEAD is not level with origin/main (${ahead} ahead, ${behind} behind); ${behind ? 'pull' : 'push'} first`;
  });
  if (!skipCi && sha) {
    check(() => {
      const runs = JSON.parse(run('gh', 'run', 'list', '--workflow', 'ci.yml', '--branch', 'main', '--commit', sha, '--json', 'status,conclusion'));
      const v = ciVerdict(runs);
      return v.state !== 'green' && v.message;
    });
  }
  if (problems.length && !dry) die(`Not releasing ${tag}:\n${problems.map((p) => '  - ' + p).join('\n')}`);

  // The rewrites, in memory.
  const files = {};
  const next = nextMinor(version);
  files['package.json'] = bumpPackageJson(read('package.json'), version);
  for (const f of ['README.md', 'docs/getting-started.md']) {
    const { text, count } = bumpInstallTags(read(f), version);
    if (!count) die(`${f} has no github:hyprsh/design#v… install tag to bump`);
    files[f] = text;
  }
  files['README.md'] = bumpReleasingExample(files['README.md'], next);

  console.log(`${dry ? 'Plan (dry run)' : 'Releasing'}: ${current} -> ${version}`);
  if (dry && problems.length) console.log(`Would refuse now:\n${problems.map((p) => '  - ' + p).join('\n')}`);
  console.log(`  1. package.json, README.md and docs/getting-started.md to ${version}; the README's Releasing example to ${next}`);
  console.log(`  2. node scripts/release-notes.mjs --changelog ${tag}  (CHANGELOG.md)`);
  console.log(`  3. git commit -m "chore: release ${version}"`);
  console.log(`  4. git tag ${tag}`);
  console.log(`  5. ${push ? 'push main and the tag' : 'print the push command'}`);

  if (dry) {
    const prev = git('describe', '--tags', '--abbrev=0', '--match', 'v*', 'HEAD');
    const subjects = git('log', '--no-merges', '--format=%s', `${prev}..HEAD`).split('\n').filter(Boolean).reverse();
    files['CHANGELOG.md'] = addToChangelog(read('CHANGELOG.md'), changelogSection({ tag, date: new Date().toLocaleDateString('en-CA'), subjects }));
    const tmp = mkdtempSync(join(tmpdir(), 'release-dry-'));
    try {
      for (const [f, text] of Object.entries(files)) {
        mkdirSync(dirname(join(tmp, f)), { recursive: true });
        writeFileSync(join(tmp, f), text);
        // git diff --no-index exits 1 when the files differ
        const r = spawnSync('git', ['diff', '--no-index', '--no-color', '--', join(root, f), join(tmp, f)], { encoding: 'utf8' });
        process.stdout.write(r.stdout.split(join(root, f)).join(f).split(join(tmp, f)).join(f));
      }
    } finally { rmSync(tmp, { recursive: true, force: true }); }
    console.log('Dry run: nothing was changed.');
    process.exit(0);
  }

  // Changelog first: it refuses a version that already has a section, before anything else is touched.
  const cl = spawnSync('node', [join(root, 'scripts/release-notes.mjs'), '--changelog', tag], { cwd: root, encoding: 'utf8' });
  process.stderr.write(cl.stderr);
  if (cl.status !== 0) die('The changelog step failed; nothing else was changed.');
  for (const [f, text] of Object.entries(files)) writeFileSync(join(root, f), text);
  git('add', 'package.json', 'README.md', 'docs/getting-started.md', 'CHANGELOG.md');
  git('commit', '-m', `chore: release ${version}`);
  git('tag', tag);
  console.log(`Committed "chore: release ${version}" and tagged ${tag}.`);
  if (push) {
    execFileSync('git', ['push', 'origin', 'main', tag], { cwd: root, stdio: 'inherit' });
    console.log('Pushed; the tag runs the Pages workflow, which deploys and publishes the GitHub release.');
  } else {
    console.log(`Review it, then push:\n  git push origin main ${tag}`);
  }
}
