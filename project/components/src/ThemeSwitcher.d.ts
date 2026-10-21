export type ThemeSwitcherValue = 'system' | 'light' | 'dark';

export interface ThemeSwitcherProps {
  /** Controlled choice. */
  value?: ThemeSwitcherValue;
  /** Uncontrolled starting choice. Default: the stored choice, else the <html> data-theme, else 'system'. */
  defaultValue?: ThemeSwitcherValue;
  /** Called with the new choice after it has been applied to <html>. */
  onChange?: (next: ThemeSwitcherValue) => void;
  /** localStorage key the choice is saved under. Default 'theme'; pass null to save nothing. */
  storageKey?: string | null;
  /** medium 32px options (default) or small 24px. */
  size?: 'small' | 'medium';
  disabled?: boolean;
  /** Names the group for screen readers. Default 'Theme'. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function ThemeSwitcher(props: ThemeSwitcherProps): React.ReactElement;
