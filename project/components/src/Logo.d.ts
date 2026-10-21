export interface LogoProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** lockup (mark + wordmark, default), mark alone, or wordmark alone. */
  variant?: 'lockup' | 'mark' | 'wordmark';
  /** Mark height in px; the wordmark scales with it. Default 24. */
  size?: number;
  /** nebula (gradient mark, default) or mono (currentColor, for one-colour print, favicons on tinted chrome and dense UI). */
  tone?: 'nebula' | 'mono';
  /** Accessible name. Default "hyprsh". */
  'aria-label'?: string;
}
export declare function Logo(props: LogoProps): React.ReactElement;
