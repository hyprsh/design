export interface SpinnerProps {
  /** sm 12px, md 16px (default), lg 20px, xl 24px, 2xl 32px, 3xl 40px, 4xl 56px. A number of px still works and scales the nearest size. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | number;
  /** Accessible name. With it the spinner is a status region; without it, it is decorative. */
  label?: string;
  'aria-label'?: string;
  /** Colour comes from `color`: gray-700 by default, e.g. style={{ color: 'var(--red-700)' }}. */
  className?: string;
  style?: React.CSSProperties;
}
export declare function Spinner(props: SpinnerProps): React.ReactElement;
