// Writes the GitHub release notes for a tag from the commit subjects since the previous tag, grouped by conventional-commit type,
// and adds the same notes to CHANGELOG.md.
// Usage: node scripts/release-notes.mjs v0.11.0 > notes.md   (the Pages workflow runs it after a tag deploys)
//        node scripts/release-notes.mjs --changelog v0.13.0 [--date 2026-11-01]
//          adds a "## v0.13.0" section to CHANGELOG.md for the commits since the latest tag up to HEAD, dated today unless --date;
//          run it before the release commit, never on a version that has a section already
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = 'hyprsh/design';
const DOCS = 'https://hyprsh.github.io/design/';
const GROUPS = [['breaking', 'Breaking changes'], ['feat', 'Features'], ['fix', 'Fixes'], ['docs', 'Docs'], ['other', 'Other']];

// The grouping, shared by the release notes and the changelog, without the release commit: [[title, [item…]]…] for the non-empty groups.
function grouped(subjects) {
  const items = Object.fromEntries(GROUPS.map(([k]) => [k, []]));
  for (const s of subjects) {
    const m = /^(\w+)(?:\(([^)]+)\))?(!)?: (.+)$/.exec(s);
    if (m && m[1] === 'chore' && /^release\b/.test(m[4])) continue;
    if (!m) { items.other.push(s); continue; }
    const [, type, scope, bang, text] = m;
    const group = bang ? 'breaking' : type in items ? type : 'other';
    items[group].push((scope ? `**${scope}:** ` : '') + text);
  }
  return GROUPS.filter(([k]) => items[k].length).map(([k, title]) => [title, items[k]]);
}
const block = (level, title, list) => `${level} ${title}\n\n${list.map((t) => '- ' + t).join('\n')}\n`;

export function releaseNotes({ tag, subjects }) {
  const sections = grouped(subjects).map(([title, list]) => block('##', title, list));
  return [...sections, `## Install\n\n\`\`\`bash\nnpm install github:${REPO}#${tag}\n\`\`\`\n\nDocs, with live examples: ${DOCS}\n`].join('\n');
}

// The top of CHANGELOG.md, above the newest version.
export const CHANGELOG_HEAD = `# Changelog

What changed in each version, newest first; the same notes are on the [GitHub releases](https://github.com/${REPO}/releases). To use a version, install its tag: \`npm install github:${REPO}#<tag>\`.

`;

// One version's section of CHANGELOG.md: the tag, its date, then the release notes' groups one level deeper and without the Install block.
export function changelogSection({ tag, date, subjects }) {
  return [`## ${tag}\n\n${date}\n`, ...grouped(subjects).map(([title, list]) => block('###', title, list))].join('\n');
}

// The changelog with a new section first. Everything after the head is kept byte for byte.
export function addToChangelog(changelog, section) {
  const tag = /^## (\S+)/.exec(section)[1];
  if (new RegExp(`^## ${tag.replace(/\./g, '\\.')}\\s*$`, 'm').test(changelog)) throw new Error(`CHANGELOG.md already has a section for ${tag}`);
  if (!changelog) return CHANGELOG_HEAD + section;
  const at = changelog.search(/^## /m);
  if (at < 0) return changelog.replace(/\n*$/, '\n\n') + section;
  return changelog.slice(0, at) + section + '\n' + changelog.slice(at);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const flag = (name) => { const at = args.indexOf(name); return at < 0 ? undefined : args.splice(at, at === args.length - 1 ? 1 : 2)[1]; };
  const changelog = args.includes('--changelog') && (args.splice(args.indexOf('--changelog'), 1), true);
  const date = flag('--date');
  const tag = args[0];
  if (!tag || args.length > 1 || (date && !changelog)) { console.error('Usage: node scripts/release-notes.mjs <tag>\n       node scripts/release-notes.mjs --changelog <new-tag> [--date YYYY-MM-DD]'); process.exit(1); }
  const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
  const log = (range) => git('log', '--no-merges', '--format=%s', range).split('\n').filter(Boolean).reverse();
  if (changelog) {
    if (!/^v\d+\.\d+\.\d+$/.test(tag)) { console.error(`${tag} is not a version tag like v0.13.0`); process.exit(1); }
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) { console.error('--date wants YYYY-MM-DD'); process.exit(1); }
    const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'CHANGELOG.md');
    const prev = git('describe', '--tags', '--abbrev=0', '--match', 'v*', 'HEAD');
    const section = changelogSection({ tag, date: date || new Date().toISOString().slice(0, 10), subjects: log(`${prev}..HEAD`) });
    writeFileSync(file, addToChangelog(existsSync(file) ? readFileSync(file, 'utf8') : '', section));
    console.error(`CHANGELOG.md: added ${tag} (the commits since ${prev})`);
  } else {
    let prev = '';
    try { prev = git('describe', '--tags', '--abbrev=0', '--match', 'v*', `${tag}^`); } catch { /* the first tag: every commit */ }
    process.stdout.write(releaseNotes({ tag, subjects: log(prev ? `${prev}..${tag}` : tag) }));
  }
}
