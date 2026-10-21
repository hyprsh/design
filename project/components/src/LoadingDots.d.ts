export interface LoadingDotsProps {
  /** Dot diameter: sm 2px, md 3px (default), lg 4px, or a number of px. */
  size?: 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large' | number;
  /** Text before the dots, such as “Deploying”. It is announced politely. */
  children?: React.ReactNode;
  /** Screen-reader text when there are no children. Default “Loading”. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function LoadingDots(props: LoadingDotsProps): React.ReactElement;
