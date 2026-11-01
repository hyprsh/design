/** One qualifier an app understands in a query: `label:bug`. */
export interface Qualifier {
  /** The word before the colon, lowercase: `label`. */
  name: string;
  /** One line for the help popover and the description under the qualifier's name in the suggestions. */
  help: string;
  /** The values it takes, offered as you type. Without them any value is accepted, and a value not listed is a problem. */
  values?: readonly string[];
  /** Values offered as you type when any value is accepted, such as a list of people. */
  suggestions?: readonly string[];
  /** Whether `-name:` (exclude) is allowed. */
  excludable?: boolean;
  /** Whether `no:name` (nothing has this qualifier) is allowed. */
  none?: boolean;
}

/** A qualifier as typed. `span` is where it sits in the text. `no:label` is a term named `no` whose values are qualifier names. */
export interface Term {
  name: string;
  values: string[];
  excluded: boolean;
  span: [start: number, end: number];
}

/** What a query says: its terms, its free text (the other words joined by single spaces) and what was left out. */
export interface Query {
  terms: Term[];
  text: string;
  /** Why part of the query at `span` was left out: a value the qualifier does not take, an exclude it does not allow. */
  problems: Array<{ message: string; span: [start: number, end: number] }>;
}

/** A completion for the word at the caret. */
export interface QuerySuggestion {
  /** The row's text. */
  label: string;
  /** The whole query after picking it. */
  text: string;
  /** Where the caret goes afterwards, an index into `text`. */
  caret: number;
  /** A range of `label` drawn highlighted. */
  match?: [start: number, end: number];
  /** A muted second line. */
  description?: string;
  /** Reopens the list at the new caret after picking, for a name that is followed by its values. */
  keepOpen?: boolean;
}

/**
 * Reads a query. Unknown qualifiers (`error:disk`) are free text, and an unfinished term (`label:`) is ignored. Values a
 * qualifier does not take, and excludes it does not allow, are dropped and named in `problems`. `no:name` is a term
 * (named `no`, with the qualifier names as values) for qualifiers with `none: true`; it is a problem for any other
 * qualifier, and wherever no qualifier has `none`. Names are case-insensitive, values are not.
 */
export declare function parseQuery(text: string, qualifiers: readonly Qualifier[]): Query;
/**
 * The suggestions for the word ending at `caret`: qualifier names (as `name:`, with `keepOpen`) while it has no colon,
 * and the values of `name:` or `-name:` after it, best match first and without the values already chosen. An empty
 * query lists every name; an empty word in the middle of a query lists nothing. `match` is set on every suggestion.
 */
export declare function suggestQuery(text: string, caret: number, qualifiers: readonly Qualifier[]): QuerySuggestion[];
/** A term as it would be typed, such as `-label:bug,docs` or `title:"Breaking Bad"`. */
export declare function termText(term: Pick<Term, 'name' | 'values' | 'excluded'>): string;
/** The query with `value` added: OR-ed into the `name:` term already there, or as a new term at the end. */
export declare function withValue(text: string, name: string, value: string, qualifiers: readonly Qualifier[]): string;
/** The query with `value` taken out of each `name:` term that has it. A term left with no value goes. */
export declare function withoutValue(text: string, name: string, value: string, qualifiers: readonly Qualifier[]): string;
/** The query without its `index`th term, and the space before it (or else after it). */
export declare function withoutTerm(text: string, index: number, qualifiers: readonly Qualifier[]): string;
/**
 * What the `name:` terms that are not excluded ask for. A term's values are alternatives and the same qualifier typed
 * twice must match both, so an empty list means nothing can match. Null when there is no such term. `each` maps a
 * term's values first, such as a group to its members.
 */
export declare function valuesOf<T = string>(query: Query, name: string, each?: (values: string[]) => T[]): T[] | null;

export interface QueryInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'onChange' | 'prefix' | 'defaultValue'> {
  /** The query. The text is the value, and typing is never reverted. Leave it out to let the field keep the text. */
  value?: string;
  /** The text to start with when `value` is left out. */
  defaultValue?: string;
  /** Called with the whole text on every edit. */
  onChange?: (text: string) => void;
  /** Suggestions for the word at the caret, computed by the app. Synchronous. Wins over `qualifiers`. */
  suggestions?: (text: string, caret: number) => QuerySuggestion[];
  /** The qualifiers the app understands: suggested with `suggestQuery`, explained in the help popover, and checked with `parseQuery` (problems show under the field). */
  qualifiers?: readonly Qualifier[];
  /** false hides the "?" button that opens the help popover. Needs `qualifiers`. Default true. To place the button yourself, hide it and render `QueryHelpButton`. */
  help?: boolean;
  /** small 32px, medium 36px (default), large 40px. */
  size?: 'small' | 'medium' | 'large';
  /**
   * A single key, with no modifiers, such as `"/"`. Pressing it anywhere on the page focuses the field (and the key is not typed), unless focus is already in an
   * editable element or the field is disabled. While the field is empty a key cap shows the key inside it (not on touch-only devices), and the input gets
   * `aria-keyshortcuts`, which an `aria-keyshortcuts` prop overrides. Not for modifier combinations.
   */
  shortcut?: string;
  /** Keys the field leaves alone: Enter, Escape and Tab whenever the list is closed, and every other key. While the list is open it owns Up, Down, Enter, Tab and Escape. */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Class for the outer element. */
  className?: string;
}
/**
 * A text field whose text is the value, with suggestions that complete the word at the caret, for search and filter
 * queries such as `is:open label:bug,docs crash`. Give it `qualifiers` for
 * the built-in syntax (`parseQuery`, `suggestQuery`) or `suggestions` for your own. The ARIA 1.2 combobox pattern.
 */
export declare function QueryInput(props: QueryInputProps): React.ReactElement;
