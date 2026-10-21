export interface CodeBlockOption { label: string; value: string }
export interface CodeBlockSwitcher { options: CodeBlockOption[]; value: string; onChange?: (value: string) => void }
export interface CodeBlockProps {
  /** The source code as a string. */
  children: string;
  /** js, jsx, ts, tsx, json, bash, css or diff get colour; anything else renders plain. */
  language?: string;
  /** Alias for `language`. */
  syntax?: string;
  /** Shows a header with the file name, a language icon and the copy button. */
  filename?: string;
  /** 1-based line numbers to highlight. */
  highlightedLinesNumbers?: number[];
  /** 1-based line numbers marked as added (+). */
  addedLinesNumbers?: number[];
  /** 1-based line numbers marked as removed (−). They are left out when the block is copied. */
  removedLinesNumbers?: number[];
  hideLineNumbers?: boolean;
  /** A select in the header that switches languages. */
  switcher?: CodeBlockSwitcher;
  /** Tabs above the block that switch languages, instead of the select. */
  tabs?: CodeBlockSwitcher;
  /** Accessible name of the scrollable code region. Defaults to the filename. */
  'aria-label'?: string;
  /** Prefix for line anchors (#id-L4). Generated when omitted. */
  id?: string;
  onCopy?: () => void;
  className?: string;
}
export declare const CodeBlock: ((props: CodeBlockProps) => React.ReactElement) & {
  /** The built-in tokenizer: returns [type, text] pairs. */
  tokenize(code: string, language?: string): Array<[string, string]>;
};
