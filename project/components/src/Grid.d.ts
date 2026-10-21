/** A scalar, or one value per breakpoint (container width: md >= 600px, lg >= 960px). Missing breakpoints fall back to the one below. */
export type GridResponsive<T> = T | { sm?: T; md?: T; lg?: T };

export interface GridSystemProps {
  /** Guide stroke in px. Default 1. */
  guideWidth?: number;
  dashedGuides?: boolean;
  /** Draws the guides in amber, for checking a layout. */
  debug?: boolean;
  /** Accepted for Geist parity; Grid always measures its own container. */
  unstable_useContainer?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface GridProps {
  columns?: GridResponsive<number>;
  rows?: GridResponsive<number>;
  /** "preserve-aspect-ratio" makes every track square. */
  height?: 'auto' | 'preserve-aspect-ratio';
  hideGuides?: 'row' | 'column';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface GridCellProps {
  /** CSS grid-column value, e.g. 2 or "1/3" or "1/-1". Omit to auto-flow. */
  column?: GridResponsive<number | string>;
  row?: GridResponsive<number | string>;
  /** Paints the cell so it hides the guides it overlaps. */
  solid?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface GridCrossProps {
  /** 1-based grid line: a 3-column grid has column lines 1–4. */
  column?: number;
  row?: number;
  className?: string;
}

export declare function GridSystem(props: GridSystemProps): React.ReactElement;
export declare function GridCell(props: GridCellProps): React.ReactElement;
export declare function GridCross(props: GridCrossProps): React.ReactElement;
export declare const Grid: ((props: GridProps) => React.ReactElement) & {
  System: typeof GridSystem;
  Cell: typeof GridCell;
  Cross: typeof GridCross;
};
