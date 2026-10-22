export interface DescriptionProps extends Omit<React.HTMLAttributes<HTMLDListElement>, 'title' | 'content'> {
  /** The key: a short Title Case noun. */
  title: React.ReactNode;
  /** The value. `children` works too. */
  content?: React.ReactNode;
  /** One-sentence definition shown from an info button next to the title. */
  tooltip?: React.ReactNode;
  /** 'horizontal' puts the title and value on one row (`term  value`). Default 'vertical' stacks them. */
  layout?: 'vertical' | 'horizontal';
  /** Horizontal layout: minimum width of the title column (px or any CSS length), so stacked descriptions line up. It sets `--hy-description-term`, which a wrapper can set once for all of them. */
  termWidth?: number | string;
  /** Right-align title and content, for the trailing column of a detail header. */
  right?: boolean;
  /** Truncate the content to one line; a string value is kept in the native title. */
  ellipsis?: boolean;
}
export declare function Description(props: DescriptionProps): React.ReactElement;
