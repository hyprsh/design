export interface TitleBarBack {
  /** The back button's accessible name. @default 'Back' */
  label?: string;
  onClick?: () => void;
  /** Renders the back button as a link. */
  href?: string;
}

/**
 * The header of a phone-width screen: a centred, truncating title drawn as the screen's heading, an optional back
 * button and trailing actions. Sticky at the top of its scroll container, with `env(safe-area-inset-top)` padding.
 * Its surface is translucent like TabBar's (a blurred, see-through `background-100`), and solid under
 * `prefers-reduced-transparency: reduce`, without `backdrop-filter`, or with `opaque`.
 */
export interface TitleBarProps {
  /** The screen's title, drawn as a heading. It is truncated with an ellipsis when it doesn't fit. */
  title: React.ReactNode;
  /** A chevron icon button on the leading side. */
  back?: TitleBarBack;
  /** Icon buttons on the trailing side. Each is at least `--touch-target` in both directions. */
  actions?: React.ReactNode;
  /**
   * Restores the solid surface: a plain `background-100` fill with no blur. The bar also falls back to solid under
   * `prefers-reduced-transparency: reduce` and without `backdrop-filter` support, whatever this is.
   * @default false
   */
  opaque?: boolean;
  /** 'sm' (default): hidden from 640px up. false: shown at every width. */
  hideFrom?: 'sm' | false;
  /** The title's heading level. @default 1 */
  headingLevel?: 1 | 2 | 3;
  className?: string;
  style?: React.CSSProperties;
}
export declare const TitleBar: (props: TitleBarProps) => React.ReactElement;
