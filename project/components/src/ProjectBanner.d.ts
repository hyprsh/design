export interface ProjectBannerCallToAction {
  /** A Title Case verb and noun, such as “Update Billing”. */
  label: React.ReactNode;
  /** Renders a link. */
  href?: string;
  /** Without href, renders a button styled as a link. */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /** Shows a spinner before the label, keeps the label and ignores clicks (aria-disabled, aria-busy), like Button's loading. */
  loading?: boolean;
}
export interface ProjectBannerProps {
  /** Default 'gray'. success is blue. */
  variant?: 'gray' | 'success' | 'warning' | 'error';
  /** The message: one sentence about the whole project. */
  label?: React.ReactNode;
  /** Same as label. */
  children?: React.ReactNode;
  /** Replaces the variant's icon; null hides it. */
  icon?: React.ReactNode | null;
  /** The one action that resolves the message. Always give one. */
  callToAction?: ProjectBannerCallToAction;
  /** Landmark name. Defaults to the variant (“Warning”). */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function ProjectBanner(props: ProjectBannerProps): React.ReactElement;
