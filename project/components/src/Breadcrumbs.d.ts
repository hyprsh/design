export interface BreadcrumbsProps {
  /** BreadcrumbItem elements, from the top level to the current page. */
  children: React.ReactNode;
  /** 'text' (default) is a path with chevrons; 'menu' shows compact chips with no separators. */
  type?: 'text' | 'menu';
  /** Name of the nav landmark. Default 'Breadcrumb'. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export interface BreadcrumbItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'prefix'> {
  children: React.ReactNode;
  /** Makes the step a link. Ignored when disabled. */
  href?: string;
  /** The current page: marked with aria-current="page". */
  active?: boolean;
  /** A step that exists but can't be opened, such as a team you can't access. */
  disabled?: boolean;
  /** An icon or avatar before the text. */
  prefix?: React.ReactNode;
}
export declare function Breadcrumbs(props: BreadcrumbsProps): React.ReactElement;
export declare namespace Breadcrumbs {
  const Item: typeof BreadcrumbItem;
}
/** Alias for Breadcrumbs. */
export declare const Breadcrumb: typeof Breadcrumbs;
export declare function BreadcrumbItem(props: BreadcrumbItemProps): React.ReactElement;
