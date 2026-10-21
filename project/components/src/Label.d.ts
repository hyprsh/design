export interface LabelProps extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'id'> {
  /** The id of the control this labels (sets `for`). The label itself gets no id. */
  id?: string;
  /** The label text. When set, `children` render under it, inside the label. */
  value?: React.ReactNode;
  /** The label wraps its control: pass the control as children, 8px under the text. */
  withInput?: boolean;
  /** Keep the text's own casing instead of capitalizing each word. */
  bypassCasing?: boolean;
  children?: React.ReactNode;
}
export declare function Label(props: LabelProps): React.ReactElement;
