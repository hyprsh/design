export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  /** The code. A string with a line break renders as a block. */
  children?: React.ReactNode;
  /** Language label for a block, e.g. 'javascript'. Setting it renders a block (no colouring; use CodeBlock for that). */
  syntax?: string;
  /** Force the block layout for a single line. */
  block?: boolean;
  className?: string;
}
export declare function Code(props: CodeProps): React.ReactElement;
