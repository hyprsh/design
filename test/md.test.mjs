// Tests for the docs site's markdown converter (scripts/md.mjs). Run with `npm test` (node --test).
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { md, inline, sections, slug } from '../scripts/md.mjs';

describe('inline markdown', () => {
  it('renders bold, both italics, code and links', () => {
    assert.equal(inline('**Must:** use *one* _accent_ and `var(--gray-1000)`, see [the guide](guide.md).'),
      '<strong>Must:</strong> use <em>one</em> <em>accent</em> and <code>var(--gray-1000)</code>, see <a href="guide.md">the guide</a>.');
  });

  it('escapes HTML outside and inside code, and leaves curly quotes and ellipses alone', () => {
    assert.equal(inline('a <b> & “quoted” … `<Button prefix={x}>` `10&nbsp;MB`'),
      'a &lt;b&gt; &amp; “quoted” … <code>&lt;Button prefix={x}&gt;</code> <code>10&amp;nbsp;MB</code>');
  });

  it('keeps asterisks and underscores inside code and words as they are', () => {
    assert.equal(inline('`top-*`, `left-*` and snake_case_name, 2 * 3 * 4'), '<code>top-*</code>, <code>left-*</code> and snake_case_name, 2 * 3 * 4');
  });

  it('reads backslash escapes and double-backtick code', () => {
    assert.equal(inline('\\*not italic\\* and ``a ` b``'), '*not italic* and <code>a ` b</code>');
  });

  it('passes every link through the link option', () => {
    assert.equal(inline('[Logo](../Logo/README.md#sizes)', { link: (h) => h.toUpperCase() }), '<a href="../LOGO/README.MD#SIZES">Logo</a>');
  });
});

describe('blocks', () => {
  it('gives headings unique ids, classes and an optional level shift', () => {
    const html = md('# Title\n\n## Materials: radius and shadow\n\n## Notes\n\n## Notes', { classes: { h2: 'heading-24' } });
    assert.match(html, /<h1 id="title">Title<\/h1>/);
    assert.match(html, /<h2 id="materials-radius-and-shadow" class="heading-24">Materials: radius and shadow<\/h2>/);
    assert.match(html, /<h2 id="notes-1" class="heading-24">Notes<\/h2>/);
    assert.match(md('## Usage', { shift: 1 }), /<h3 id="usage">/);
  });

  it('joins paragraph lines and splits paragraphs at blank lines', () => {
    assert.equal(md('one\ntwo\n\nthree', { classes: { p: 'copy-16' } }), '<p class="copy-16">one\ntwo</p>\n<p class="copy-16">three</p>\n');
  });

  it('renders fenced code escaped, with its language, and keeps markdown inside it literal', () => {
    assert.equal(md('```bash\nnpm run build && echo "<ok>"\n# not a heading\n```'),
      '<pre data-lang="bash"><code>npm run build &amp;&amp; echo &quot;&lt;ok&gt;&quot;\n# not a heading</code></pre>\n');
    assert.equal(md('```\nplain **text**\n```'), '<pre><code>plain **text**</code></pre>\n');
  });

  it('nests bullet lists and keeps tight items free of <p>', () => {
    assert.equal(md('- Use the named styles:\n  - **Headings** are 600.\n  - Labels are single lines.\n- Next'),
      '<ul><li>Use the named styles:\n<ul><li><strong>Headings</strong> are 600.</li><li>Labels are single lines.</li></ul></li><li>Next</li></ul>\n');
  });

  it('renders numbered lists and keeps their start', () => {
    assert.equal(md('1. Build\n2. Check'), '<ol><li>Build</li><li>Check</li></ol>\n');
    assert.match(md('3. Third\n4. Fourth'), /^<ol start="3">/);
  });

  it('keeps an indented fence and a lazy line inside a list item', () => {
    const html = md('- Pad the scroll area:\n\n  ```css\n  .screen { padding: 0; }\n  ```\n- Tab moves\n  on.\n\nAfter');
    assert.match(html, /<li>Pad the scroll area:\n<pre data-lang="css"><code>\.screen \{ padding: 0; \}<\/code><\/pre><\/li>/);
    assert.match(html, /<li>Tab moves\non\.<\/li><\/ul>\n<p>After<\/p>/);
  });

  it('renders tables with alignment, inline markdown and escaped pipes inside code', () => {
    const html = md('| Prop | Type |\n|---|:--:|\n| `size` | `\'small\' \\| \'large\'` |\n| **b** | x |');
    assert.equal(html, '<div class="table-wrap"><table><thead><tr><th>Prop</th><th style="text-align:center">Type</th></tr></thead>' +
      '<tbody><tr><td><code>size</code></td><td style="text-align:center"><code>\'small\' | \'large\'</code></td></tr>' +
      '<tr><td><strong>b</strong></td><td style="text-align:center">x</td></tr></tbody></table></div>\n');
  });

  it('ends a paragraph where a list, heading or fence starts', () => {
    assert.equal(md('Intro:\n- one\n## Next'), '<p>Intro:</p>\n<ul><li>one</li></ul>\n<h2 id="next">Next</h2>\n');
  });
});

describe('sections and slugs', () => {
  it('splits at one heading level, ignoring headings inside fences', () => {
    const s = sections('Intro\n\n## One\ntext\n```md\n## Not one\n```\n### Sub\n## Two\n', 2);
    assert.deepEqual(s.map((x) => x.title), [null, 'One', 'Two']);
    assert.equal(s[0].body, 'Intro\n');
    assert.match(s[1].body, /^## One\n[\s\S]*## Not one[\s\S]*### Sub\n$/);
  });

  it('slugs heading text without its markup', () => {
    assert.equal(slug('Materials: radius and shadow'), 'materials-radius-and-shadow');
    assert.equal(slug('`Icon` and [links](x.md)'), 'icon-and-links');
  });
});
