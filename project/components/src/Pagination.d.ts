export interface PaginationLinkData {
  /** Title of the neighbouring page. */
  title: string;
  href: string;
  /** Small label above the title. Default 'Previous' / 'Next'. */
  label?: string;
  /** For client-side routing; call preventDefault to stop the default navigation. */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}
export interface PaginationProps {
  /** The page before this one. Omit on the first page: that side stays empty. */
  previous?: PaginationLinkData;
  /** The page after this one. Omit on the last page. */
  next?: PaginationLinkData;
  /** Name of the nav landmark. Default 'Pagination'. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Pagination(props: PaginationProps): React.ReactElement;
