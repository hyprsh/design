export interface IconProps {
  /** A Lucide icon name in kebab case: 'arrow-right', 'git-branch', 'circle-check'. Unknown names render nothing. */
  name: string;
  /** Pixel size. Default 16. */
  size?: number;
  /** Visual stroke in px, kept constant across sizes. Default 1.5. */
  strokeWidth?: number;
  /** Stroke colour. Default currentColor. */
  color?: string;
  /** Accessible name. Without it the icon is decorative (aria-hidden). */
  label?: string;
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare const Icon: ((props: IconProps) => React.ReactElement | null) & { names: string[] };
