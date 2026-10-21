export interface NoteProps {
  /** Default 'default' (info icon). success is blue: the accent stays the accent. */
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'violet' | 'cyan';
  /** Older name for `variant`. With `type`, a leading word (“Warning:”) is added unless label={false}. */
  type?: NoteProps['variant'];
  /** Tinted background. */
  fill?: boolean;
  size?: 'small' | 'medium' | 'large';
  /** Greys the note out and disables the controls in its action. */
  disabled?: boolean;
  /** Replaces the variant's icon; null shows no icon. */
  icon?: React.ReactNode | null;
  /** Short Title Case prefix such as “Region Change”; rendered as “Region Change:”. Or use <Note.Label>. */
  label?: string | false;
  /** One inline control, such as a small Button. Or use <Note.Action>. */
  action?: React.ReactNode;
  /** Plain content, or <Note.Content> and <Note.Action> parts. */
  children?: React.ReactNode;
  className?: string;
}
export interface NotePartProps { children?: React.ReactNode; className?: string }
export declare const Note: ((props: NoteProps) => React.ReactElement) & {
  Content: (props: NotePartProps) => React.ReactElement;
  Action: (props: NotePartProps) => React.ReactElement;
  Label: (props: NotePartProps) => React.ReactElement;
};
export declare function NoteContent(props: NotePartProps): React.ReactElement;
export declare function NoteAction(props: NotePartProps): React.ReactElement;
export declare function NoteLabel(props: NotePartProps): React.ReactElement;
