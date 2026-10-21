export type DateRangeValue = { kind: 'preset'; preset: string } | { kind: 'custom'; start: string; end: string };
export interface DateRangePreset {
  label: string;
  /** Stable key written to the URL. Defaults to `label`. */
  value?: string;
  /** Resolve the preset to concrete dates when you query. */
  range?: () => { start: Date; end: Date };
}
export interface FilterParam<V = any> {
  /** Display name, in Title Case: “Environment”. */
  key: string;
  /** URL key used by the default encode/decode. Defaults to `key`. */
  param?: string;
  type: 'select' | 'multi-select' | 'date-range';
  /** Choices for select and multi-select. */
  options?: Array<string | { value: string; label: string }>;
  /** Choices for date-range. */
  presets?: DateRangePreset[];
  /** Pill text for a value; called with undefined for the “all” row. Default “Any {key}”. */
  label?: (value: V | undefined) => string;
  /** List text for one option. */
  optionLabel?: (value: any) => string;
  /** Map a value to the URL keys this filter owns; undefined deletes a key. */
  encode?: (value: V | undefined) => Record<string, string | undefined>;
  /** Read this filter's value back from the URL. */
  decode?: (params: URLSearchParams) => V | undefined;
  /** A useful default shown as a dashed pill while this filter is unset. */
  suggestion?: () => V | undefined;
}
export interface FilterParamsAi {
  isThinking?: boolean;
  onAbort?: () => void;
  /** Called with the typed text. Return (or resolve to) params to merge into the URL. */
  onQuery?: (query: string) => void | URLSearchParams | Record<string, string> | Promise<URLSearchParams | Record<string, string> | void>;
}
export interface FilterParamsProps {
  params: FilterParam[];
  /** Controlled params. Leave unset to read and write `location.search` (other keys are kept). */
  searchParams?: URLSearchParams | string;
  onSearchParamsChange?: (next: URLSearchParams) => void;
  /** Adds a free-text option that hands the query to you. */
  ai?: FilterParamsAi;
  /** Default “Add Filter”. */
  addLabel?: string;
  /** Start with the picker open. Doesn't move focus. */
  defaultOpen?: boolean;
  'aria-label'?: string;
  className?: string;
}
export declare function useSearchParamState(): [URLSearchParams, (next: URLSearchParams) => void];
export declare function encodeDateRangeValue(value: DateRangeValue | undefined): string | undefined;
export declare function decodeDateRangeValue(value: string | null | undefined, presets?: DateRangePreset[]): DateRangeValue | undefined;
export declare function resolveDateRange(value: DateRangeValue | undefined, presets?: DateRangePreset[]): { start: Date; end: Date } | undefined;
export declare const FilterParams: ((props: FilterParamsProps) => React.ReactElement) & {
  useSearchParamState: typeof useSearchParamState;
  encodeDateRangeValue: typeof encodeDateRangeValue;
  decodeDateRangeValue: typeof decodeDateRangeValue;
  resolveDateRange: typeof resolveDateRange;
};
export declare const FilterParamsBar: typeof FilterParams;
