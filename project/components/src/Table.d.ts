type TableAlign = 'left' | 'center' | 'right';

export interface TableColumn<R> {
  key: string;
  header: React.ReactNode;
  /** Right-aligned tabular digits. */
  numeric?: boolean;
  /** Text alignment of the column. No column aligns right unless it is `numeric` or sets this. */
  align?: TableAlign;
  mono?: boolean;
  /** Normal white-space and no max width: long text wraps (header and cells). */
  wrap?: boolean;
  /** The cells fill the remaining width and end in an ellipsis. Ignored with `wrap`. */
  truncate?: boolean;
  /** Makes the header a sort button. The app sorts `rows` itself; see `sort` and `onSortChange` on the table. */
  sortable?: boolean;
  render?: (row: R) => React.ReactNode
}

type TableSortDirection = 'ascending' | 'descending';
export interface TableSort { key: string; direction: TableSortDirection }

type TablePart<E> = React.HTMLAttributes<E> & { children?: React.ReactNode };

export interface TableBodyProps extends TablePart<HTMLTableSectionElement> {
  /** Alternate row backgrounds. */
  striped?: boolean;
  /** A divider under every row. */
  bordered?: boolean;
  /** Highlight the hovered row. */
  interactive?: boolean;
  /** Skip rendering off-screen rows (content-visibility). */
  virtualize?: boolean;
}

export interface TableRowProps extends TablePart<HTMLTableRowElement> {
  /** Marks the row as selected: `aria-selected="true"` and the menu-highlight tint. */
  selected?: boolean;
  /** Marks the row as the current one (a j/k cursor): `aria-current="true"` (or the given token) and the same tint. */
  current?: boolean | 'true' | 'page' | 'step' | 'location' | 'date' | 'time';
}
export interface TableCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: TableAlign;
  /** Normal white-space and no max width: long text wraps. */
  wrap?: boolean;
  /** Fill the remaining width and end in an ellipsis. Ignored with `wrap`. */
  truncate?: boolean;
}
export interface TableHeadProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: TableAlign;
  wrap?: boolean;
  /** Sets `aria-sort` on the cell. Use `'none'` for a sortable column that isn't the active sort. Without it the cell has no `aria-sort`. */
  sort?: TableSortDirection | 'none';
  /** Makes the label a button that fills the cell and calls this on click, Enter and Space. The arrow is decorative: the direction is announced through `sort`. Right-aligned heads put the arrow before the label. Enter and Space on the native button fire a click whose `event.detail` is `0`, so `event.detail === 0` tells a keyboard press from a pointer click. */
  onSort?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface TableProps<R = Record<string, unknown>> extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'rows'> {
  /** Data form: column definitions. Omit to compose the parts yourself. */
  columns?: TableColumn<R>[];
  /** Data form: one object per row, with an `id` where you have one. */
  rows?: R[];
  /** Visually hidden caption for screen readers. */
  caption?: string;
  /** Data form: message when `rows` is empty. */
  empty?: React.ReactNode;
  /** Data form: body options. */
  striped?: boolean;
  bordered?: boolean;
  interactive?: boolean;
  /** Data form: mark the rows this returns true for as `selected`. */
  isSelected?: (row: R) => boolean;
  /** Data form: mark the row this returns true for as `current`. */
  isCurrent?: (row: R) => boolean;
  /** Data form: the active sort. The table never reorders `rows`; sort them yourself and pass them back. `null` or `undefined` means no active column. */
  sort?: TableSort | null;
  /** Data form: a sortable column was clicked. A column that isn't active asks for `ascending`; the active one flips. The second argument is the button's click event; Enter and Space fire a click whose `event.detail` is `0`, so `event.detail === 0` tells a keyboard press from a pointer click. */
  onSortChange?: (next: TableSort, event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Data form: draw skeleton rows in the table's shape instead of `rows` or `empty`: `true` for 5, or a number of rows. The header stays, sortable headers go inert, the table gets `aria-busy="true"` and the caption reads "<caption>, loading" (or "Loading"). */
  loading?: boolean | number;
  /** Keep the header row visible while an ancestor scrolls (it sticks to the nearest scrolling ancestor). The wrapper then clips sideways instead of scrolling. */
  stickyHeader?: boolean;
  children?: React.ReactNode;
}
export declare function TableRoot(props: TablePart<HTMLDivElement>): React.ReactElement;
export declare function TableColgroup(props: React.ColgroupHTMLAttributes<HTMLTableColElement> & { children?: React.ReactNode }): React.ReactElement;
export declare function TableCol(props: React.ColHTMLAttributes<HTMLTableColElement>): React.ReactElement;
export declare function TableHeader(props: TablePart<HTMLTableSectionElement>): React.ReactElement;
export declare function TableBody(props: TableBodyProps): React.ReactElement;
export declare function TableFooter(props: TablePart<HTMLTableSectionElement>): React.ReactElement;
export interface TableSkeletonRowProps extends TablePart<HTMLTableRowElement> {
  /** Size each cell like its column: numeric columns get a short, right-aligned block, mono and truncate columns a medium one. */
  columns?: TableColumn<any>[];
  /** Without `columns`: draw this many plain cells. */
  count?: number;
  /** The row's position, so the widths of plain columns vary from row to row. Default 0. */
  index?: number;
}
export declare function TableRow(props: TableRowProps): React.ReactElement;
export declare function TableHead(props: TableHeadProps): React.ReactElement;
export declare function TableCell(props: TableCellProps): React.ReactElement;
export declare function TableSkeletonRow(props: TableSkeletonRowProps): React.ReactElement;
export declare const Table: (<R>(props: TableProps<R>) => React.ReactElement) & {
  Root: typeof TableRoot; Colgroup: typeof TableColgroup; Col: typeof TableCol; Header: typeof TableHeader; Body: typeof TableBody;
  Footer: typeof TableFooter; Row: typeof TableRow; Head: typeof TableHead; Cell: typeof TableCell; SkeletonRow: typeof TableSkeletonRow;
};
