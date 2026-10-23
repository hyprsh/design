// Tests for the shared agent docs step (scripts/docs.mjs): README splitting, examples and props from .d.ts.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { splitReadme, parseProps, propsMarkdown, kebab } from '../scripts/docs.mjs';

const readme = `# Toggle

An on/off control
for one setting.

**You provide:** the label.

- Name the “on” state.

## Examples

### Default
A toggle with a label.

\`\`\`jsx
import { Toggle } from '@hyprsh/design';

<Toggle>Auto-Assign Domains</Toggle>
\`\`\`

### No Description

\`\`\`jsx
export default function Example() { return null; }
\`\`\`

## Class-based dark mode

Pass \`attribute="class"\`.
`;

describe('component READMEs', () => {
  it('splits the summary, the examples and the remaining guidance', () => {
    const r = splitReadme(readme);
    assert.equal(r.title, 'Toggle');
    assert.equal(r.summary, 'An on/off control for one setting.');
    assert.deepEqual(r.examples, [
      { title: 'Default', description: 'A toggle with a label.', code: "import { Toggle } from '@hyprsh/design';\n\n<Toggle>Auto-Assign Domains</Toggle>" },
      { title: 'No Description', description: '', code: 'export default function Example() { return null; }' },
    ]);
    assert.equal(r.guidance, '**You provide:** the label.\n\n- Name the “on” state.\n\n## Class-based dark mode\n\nPass `attribute="class"`.');
  });

  it('has no examples without an Examples section', () => {
    assert.deepEqual(splitReadme('# A\n\nSummary.\n').examples, []);
  });

  it('turns names into page names', () => {
    assert.deepEqual(['Button', 'SplitButton', 'JsonView', 'TextWithCopyButton'].map(kebab), ['button', 'split-button', 'json-view', 'text-with-copy-button']);
  });
});

const dts = `type TablePart<E> = React.HTMLAttributes<E> & { children?: React.ReactNode };
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'prefix'> {
  /** Default 'secondary'. */
  variant?: 'default' | 'secondary';
  /**
   * Called with the new state;
   * the event comes second.
   */
  onChange?: (next: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: { checked?: React.ReactNode; unchecked?: React.ReactNode };
  'aria-label'?: string;
  href: string;
}
export interface ButtonLinkProps extends Omit<ButtonProps, 'href'>, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'type'> {
  href: string;
}
export interface RowProps extends TablePart<HTMLTableRowElement> {}
export interface PartProps { className?: string; children?: React.ReactNode }
export interface NotProps2 { x: string }
export interface CalendarRange { start: Date | null; }
`;

describe('props from .d.ts', () => {
  const props = parseProps(dts);

  it('finds every exported …Props interface', () => {
    assert.deepEqual(props.map((p) => p.name), ['ButtonProps', 'ButtonLinkProps', 'RowProps', 'PartProps']);
  });

  it('reads each prop with its type, whether it is optional and its JSDoc', () => {
    assert.deepEqual(props[0].props, [
      { name: 'variant', type: "'default' | 'secondary'", optional: true, description: "Default 'secondary'." },
      { name: 'onChange', type: '(next: boolean, event: React.ChangeEvent<HTMLInputElement>) => void', optional: true, description: 'Called with the new state; the event comes second.' },
      { name: 'icon', type: '{ checked?: React.ReactNode; unchecked?: React.ReactNode }', optional: true, description: '' },
      { name: 'aria-label', type: 'string', optional: true, description: '' },
      { name: 'href', type: 'string', optional: false, description: '' },
    ]);
    assert.deepEqual(props[3].props.map((p) => p.name), ['className', 'children']);
  });

  it('says what an interface extends', () => {
    assert.equal(props[0].note, 'Also takes the attributes of `<button>` except `type` and `prefix`.');
    assert.equal(props[1].note, 'Also takes the props of `ButtonProps` except `href`, and the attributes of `<a>` except `type`.');
    assert.equal(props[2].note, 'Also takes the attributes of `<tr>`.');
    assert.equal(props[3].note, '');
  });

  it('writes a markdown table with pipes escaped', () => {
    const out = propsMarkdown(props.slice(0, 1));
    assert.match(out, /^## Props\n\n### ButtonProps\n\nAlso takes the attributes of `<button>`/);
    assert.match(out, /\| `variant` \| `'default' \\\| 'secondary'` \| No \| Default 'secondary'\. \|/);
    assert.match(out, /\| `href` \| `string` \| Yes \|  \|/);
  });
});
