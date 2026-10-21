export interface TableColumn<R> { key: string; header: React.ReactNode; numeric?: boolean; align?: 'left' | 'right'; mono?: boolean; render?: (row: R) => React.ReactNode }

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
  children?: React.ReactNode;
}
export declare function TableRoot(props: TablePart<HTMLDivElement>): React.ReactElement;
export declare function TableColgroup(props: React.ColgroupHTMLAttributes<HTMLTableColElement> & { children?: React.ReactNode }): React.ReactElement;
export declare function TableCol(props: React.ColHTMLAttributes<HTMLTableColElement>): React.ReactElement;
export declare function TableHeader(props: TablePart<HTMLTableSectionElement>): React.ReactElement;
export declare function TableBody(props: TableBodyProps): React.ReactElement;
export declare function TableFooter(props: TablePart<HTMLTableSectionElement>): React.ReactElement;
export declare function TableRow(props: TablePart<HTMLTableRowElement>): React.ReactElement;
export declare function TableHead(props: React.ThHTMLAttributes<HTMLTableCellElement>): React.ReactElement;
export declare function TableCell(props: React.TdHTMLAttributes<HTMLTableCellElement>): React.ReactElement;
export declare const Table: (<R>(props: TableProps<R>) => React.ReactElement) & {
  Root: typeof TableRoot; Colgroup: typeof TableColgroup; Col: typeof TableCol; Header: typeof TableHeader; Body: typeof TableBody;
  Footer: typeof TableFooter; Row: typeof TableRow; Head: typeof TableHead; Cell: typeof TableCell;
};
