export type ThemeSwitcherValue = 'system' | 'light' | 'dark';

export type ThemeSwitcherAttribute = 'data-theme' | 'class' | 'both' | Array<'data-theme' | 'class'>;

export interface ThemeSwitcherProps {
  /** Controlled choice. */
  value?: ThemeSwitcherValue;
  /** Uncontrolled starting choice. Default: the stored choice, else the <html> data-theme, else 'system'. */
  defaultValue?: ThemeSwitcherValue;
  /** Called with the new choice after it has been applied to <html>. */
  onChange?: (next: ThemeSwitcherValue) => void;
  /** localStorage key the choice is saved under. Default 'theme'; pass null to save nothing. */
  storageKey?: string | null;
  /** What is written on <html>: 'data-theme' (default), 'class' (.dark or .light, the other removed), or 'both' / ['data-theme', 'class']. */
  attribute?: ThemeSwitcherAttribute;
  /** 'radios' (default) shows System, Light and Dark side by side; 'cycle' is one icon button that cycles System, Light, Dark. */
  variant?: 'radios' | 'cycle';
  /** medium 32px options (default) or small 24px. */
  size?: 'small' | 'medium';
  disabled?: boolean;
  /** Names the group for screen readers. Default 'Theme'. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function ThemeSwitcher(props: ThemeSwitcherProps): React.ReactElement;
/** The inline pre-paint script as a string, built from the same code the component applies the theme with. */
export declare function themeScript(options?: { storageKey?: string | null; attribute?: ThemeSwitcherAttribute }): string;
