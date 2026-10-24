// Tests that the Toast host's bottom offset follows --tab-bar-height (hyprsh/design#33).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../project/components/src/Toast.css'), 'utf8');
const bottoms = [...css.matchAll(/\.hy-toaster \{[^}]*?bottom: ([^;]+);/g)].map((m) => m[1]);

describe('the Toast host offset', () => {
  it('sets a bottom offset for desktop and for phones', () => assert.equal(bottoms.length, 2));
  it('lifts both by --tab-bar-height, which is 0px when unset', () => {
    for (const b of bottoms) assert.match(b, /var\(--tab-bar-height, 0px\)/);
  });
  it('keeps the safe-area inset and the original margins as the floor', () => {
    assert.match(bottoms[0], /24px/);
    assert.match(bottoms[1], /16px/);
    for (const b of bottoms) assert.match(b, /env\(safe-area-inset-bottom\)/);
  });
  it('leaves the inline host static', () => {
    assert.match(css, /\.hy-toaster--inline \{ position: static;/);
  });
});
