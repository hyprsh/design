export interface ColumnChartSeries {
  /** Key into each column's `values`. */
  key: string;
  /** Names the series in the legend, tooltip, table and each column's accessible name. */
  label: string;
  /** Colour of StatusDot's state of the same name, as Progress segments map it. Without one the series uses `--chart-series`. */
  tone?: 'success' | 'info' | 'warning' | 'error' | 'neutral';
}
export interface ColumnChartDatum {
  /** The x label, for example "Oct 28". */
  label: string;
  /** Amounts by series key. A missing value counts as 0. */
  values: Record<string, number>;
}
export interface ColumnChartProps {
  /** The stacked series, bottom first. */
  series: ColumnChartSeries[];
  /** The columns, in x order. */
  data: ColumnChartDatum[];
  /** Plot height in px. Default 200. */
  height?: number;
  /** A legend shows for two or more series; `false` hides it. */
  legend?: boolean;
  /** Formats values in the tooltip, the table and the accessible names. Default `Intl.NumberFormat`. */
  valueFormatter?: (value: number) => string;
  /** The view on screen when controlled: the plot or its table. */
  view?: 'chart' | 'table';
  /** The view on first render when uncontrolled. Default 'chart'. */
  defaultView?: 'chart' | 'table';
  /** The "View as Table" / "View as Chart" toggle was used. */
  onViewChange?: (view: 'chart' | 'table') => void;
  /** Opens a column (`onOpen(datum)`) or, with two or more series, one series' mark in it (`onOpen(datum, seriesKey)`). Setting it makes every column and mark a button, or a link where `href` returns a URL. A link calls it too, with the click event as the third argument, so an app can `preventDefault` and route in-app. When a column's slot is narrower than the target size (24px, or the touch target under touch sizing), the chart fits its width and picks, then opens: a tap or drag pins a column's tooltip, whose Open control and series rows are those buttons or links. Below 4px a slot it scrolls, opening at the last column. */
  onOpen?: (datum: ColumnChartDatum, seriesKey?: string, event?: React.MouseEvent) => void;
  /** The URL a column (`href(datum)`) or mark (`href(datum, seriesKey)`) opens, or `undefined` for none. A column or mark with a URL is a link. Without `onOpen`, one without a URL is not a target. */
  href?: (datum: ColumnChartDatum, seriesKey?: string) => string | undefined;
  /** Shown when `data` is empty. Default 'No Data'. */
  empty?: React.ReactNode;
  /** Accessible name of the chart (required: this or `aria-labelledby`). */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function ColumnChart(props: ColumnChartProps): React.ReactElement;
