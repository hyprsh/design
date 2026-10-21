export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Title Case heading, e.g. “No Deployments Yet”. */
  title?: React.ReactNode;
  /** One or two sentences: why it's empty and what to do. */
  description?: React.ReactNode;
  /** A Lucide icon name, or any node. Drawn in a bordered tile. */
  icon?: string | React.ReactNode;
  /** Heading level for the title. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Actions: one primary CTA, at most one secondary (often a link). */
  children?: React.ReactNode;
}
export interface EmptyStateIconProps {
  icon?: string | React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}
export declare function EmptyStateIcon(props: EmptyStateIconProps): React.ReactElement;
export declare const EmptyState: ((props: EmptyStateProps) => React.ReactElement) & { Icon: typeof EmptyStateIcon };
