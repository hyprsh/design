export interface BarListItem {
  /** Row label. It truncates with an ellipsis and its full text is in `title`. */
  label: string;
  /** A non-negative amount. Zero draws no bar. */
  value: number;
  /** Renders the row as a link, so Cmd/Ctrl-click works. */
  href?: string;
  /** React key. Defaults to `label`. */
  key?: string;
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
  /** Shown when `items` is empty. Without it an empty list renders nothing. */
  empty?: React.ReactNode;
  /** Names the list. Give this or `aria-labelledby`: BarList warns in development without one. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
}
export declare function BarList(props: BarListProps): React.ReactElement | null;
