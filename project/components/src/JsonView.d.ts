export interface JsonViewProps {
  /** Any JSON-serialisable value. */
  data: unknown;
  /** Levels open on first render. 1 (default) opens the root and keeps its children closed; 0 closes everything. */
  defaultExpandDepth?: number;
  /** Marks matches in keys and values. Build it with makeJsonViewHighlightPattern. */
  highlightPattern?: RegExp | null;
  /** Names the tree. Defaults to “JSON”. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
/** Escapes the terms and joins them into one case-insensitive pattern. Returns null when no term is left. */
export declare function makeJsonViewHighlightPattern(terms: string | string[]): RegExp | null;
export declare const JsonView: ((props: JsonViewProps) => React.ReactElement) & {
  makeJsonViewHighlightPattern: typeof makeJsonViewHighlightPattern;
};
