export interface ErrorCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Names what failed, in Title Case: “Couldn’t Load Usage”. Rendered as an h3. */
  title?: React.ReactNode;
  /** One or two sentences: what happened and what to do next. */
  message?: React.ReactNode;
  /** Optional recovery actions, such as a Try Again button. */
  children?: React.ReactNode;
}
export declare function ErrorCard(props: ErrorCardProps): React.ReactElement;
