export interface PagerProps {
  /** The page on screen, starting at 1. A page beyond the last one shows the last page's range with next disabled, and never calls `onPageChange`. */
  page: number;
  /** Rows per page. */
  pageSize: number;
  /** All the results, across every page. 0 renders nothing; a total that fits one page shows the range with no buttons. */
  total: number;
  /** The previous or next button was used, with the page to show. Only called after the user acted. Slice or fetch the rows yourself. */
  onPageChange: (page: number) => void;
  /** Disables both buttons and keeps the last range shown. */
  loading?: boolean;
  /** Name of the nav landmark. Default 'Pages'. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Pager(props: PagerProps): React.ReactElement | null;
