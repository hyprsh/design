export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Default 'horizontal'. A vertical separator stretches to its flex row's height. */
  orientation?: 'horizontal' | 'vertical';
  /** Stronger line, inset 1px, for dividing a framed card edge to edge. */
  inset?: boolean;
  /** Purely visual: drops the separator role (same as aria-hidden). */
  decorative?: boolean;
}
export declare function Separator(props: SeparatorProps): React.ReactElement;
