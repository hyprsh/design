// Tests for the soft link underline: links in the link colour draw their underline at 35% of the text colour at rest
// and solid on hover, in Link, the inline links of EmptyState and Fieldset, and the docs site.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const SOFT = /text-decoration-color: color-mix\(in srgb, currentColor 35%, transparent\)/;
const SOLID = /text-decoration-color: currentColor/;
const block = (css, sel) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = css.match(new RegExp('(?:^|[}\\n])\\s*' + esc + '\\s*\\{([^}]*)\\}'));
  return m ? m[1] : '';
};

const links = [
  ['Link', 'project/components/src/Link.css', '.hy-link', '.hy-link:hover'],
  ['EmptyState', 'project/components/src/EmptyState.css', '.hy-empty-state__actions a:not([class])', '.hy-empty-state__actions a:not([class]):hover'],
  ['Fieldset', 'project/components/src/Fieldset.css', '.hy-fieldset__status a', '.hy-fieldset__status a:hover'],
  ['docs site', 'scripts/site/site.css', 'a', 'a:hover'],
];

describe('soft link underline', () => {
  for (const [name, file, rest, hover] of links) {
    it(`${name}: a 1px underline at 35% at rest, solid on hover`, () => {
      const css = read(file);
      assert.match(block(css, rest), SOFT);
      assert.match(block(css, rest), /text-decoration-thickness: 1px/);
      assert.match(block(css, hover), SOLID);
      assert.doesNotMatch(block(css, hover), /text-decoration-thickness: 2px/);
    });
  }
  it('Link keeps the soft underline when disabled', () => {
    const css = read('project/components/src/Link.css');
    assert.doesNotMatch(block(css, '.hy-link:disabled, .hy-link[aria-disabled="true"]'), SOLID);
  });
});
