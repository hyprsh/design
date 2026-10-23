// Writes the GitHub release notes for a tag from the commit subjects since the previous tag, grouped by conventional-commit type.
// Usage: node scripts/release-notes.mjs v0.11.0 > notes.md   (the Pages workflow runs it after a tag deploys)
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO = 'hyprsh/design';
const DOCS = 'https://hyprsh.github.io/design/';
const GROUPS = [['breaking', 'Breaking changes'], ['feat', 'Features'], ['fix', 'Fixes'], ['docs', 'Docs'], ['other', 'Other']];

export function releaseNotes({ tag, subjects }) {
  const items = Object.fromEntries(GROUPS.map(([k]) => [k, []]));
  for (const s of subjects) {
    const m = /^(\w+)(?:\(([^)]+)\))?(!)?: (.+)$/.exec(s);
    if (m && m[1] === 'chore' && /^release\b/.test(m[4])) continue;
    if (!m) { items.other.push(s); continue; }
    const [, type, scope, bang, text] = m;
    const group = bang ? 'breaking' : type in items ? type : 'other';
    items[group].push((scope ? `**${scope}:** ` : '') + text);
  }
  const sections = GROUPS.filter(([k]) => items[k].length).map(([k, title]) => `## ${title}\n\n${items[k].map((t) => '- ' + t).join('\n')}\n`);
  return [...sections, `## Install\n\n\`\`\`bash\nnpm install github:${REPO}#${tag}\n\`\`\`\n\nDocs, with live examples: ${DOCS}\n`].join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const tag = process.argv[2];
  if (!tag) { console.error('Usage: node scripts/release-notes.mjs <tag>'); process.exit(1); }
  const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
  let prev = '';
  try { prev = git('describe', '--tags', '--abbrev=0', '--match', 'v*', `${tag}^`); } catch { /* the first tag: every commit */ }
  const subjects = git('log', '--no-merges', '--format=%s', prev ? `${prev}..${tag}` : tag).split('\n').filter(Boolean).reverse();
  process.stdout.write(releaseNotes({ tag, subjects }));
}
