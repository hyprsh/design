export interface BarListItem {
  /** Row label. It truncates with an ellipsis and its full text is in `title`. */
  label: string;
  /** A non-negative amount. Zero draws no bar. */
  value: number;
  /** Renders the row as a link, so Cmd/Ctrl-click works. */
  href?: string;
  /** React key. Defaults to `label`. */
  key?: string;
  /** Figures for the extra `columns`, by column key, as text or nodes. A missing figure is an empty cell. */
  columns?: Record<string, React.ReactNode>;
}
export interface BarListColumn {
  /** Key into each item's `columns`. */
  key: string;
  /** The visible header of the column. */
  label: string;
  /** Which column survives longest when the list is too narrow: the largest number hides first, ties from the right, and a column without a priority before any with one. */
  priority?: number;
}
export interface BarListProps {
  /** One row per item, in the order given. BarList never sorts. */
  items: BarListItem[];
  /** The value a full-width bar stands for. Defaults to the largest value. */
  max?: number;
  /** Formats each value. Defaults to `Intl.NumberFormat`. */
  valueFormatter?: (v: number) => string;
  /** Spoken after each value ("api-gateway, 318 minutes"). Not shown. */
  unit?: string;
  /** Sets labels in Geist Mono, for identifiers. */
  mono?: boolean;
  /** Extra figures per row, shown right-aligned under a header row. The list is then read as a table. Narrow lists hide columns by `priority`; their figures stay available to assistive technology. */
  columns?: BarListColumn[];
  /** Header over the labels when `columns` is set. Default 'Label'. */
  labelHeader?: string;
  /** Header over the bars and values when `columns` is set. Default 'Value'. */
  valueHeader?: string;
  /** Opens a row. A row with an `href` stays a link and calls this too, with the click event as the second argument, so an app can `preventDefault` and route in-app. Without an `href` the row is a button. */
  onOpen?: (item: BarListItem, event?: React.MouseEvent) => void;
  /** Shown when `items` is empty. Without it an empty list renders nothing. */
  empty?: React.ReactNode;
  /** Names the list. Give this or `aria-labelledby`: BarList warns in development without one. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
}
export declare function BarList(props: BarListProps): React.ReactElement | null;
