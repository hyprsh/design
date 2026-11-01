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
  /** Shown when `data` is empty. Default 'No Data'. */
  empty?: React.ReactNode;
  /** Accessible name of the chart (required: this or `aria-labelledby`). */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function ColumnChart(props: ColumnChartProps): React.ReactElement;
