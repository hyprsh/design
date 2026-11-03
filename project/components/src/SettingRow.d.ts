export interface SettingRowProps {
  /** The setting's name. It is a `<label for>` tied to the control. */
  label: React.ReactNode;
  /** One line under the label. It becomes part of the control's accessible description. */
  help?: React.ReactNode;
  /**
   * Marks the value as edited and not saved: a 2px accent mark on the row's leading edge, and `changedLabel` added to
   * the control's description so the state doesn't rely on colour. Toggling it doesn't move layout.
   */
  changed?: boolean;
  /** The words added to the control's description while `changed`. Default 'Unsaved change'. */
  changedLabel?: string;
  /**
   * The control, as a single element such as an Input, Select, Switch, Checkbox or Textarea. It gets an `id` if it has
   * none, and the row merges its help and changed ids into its `aria-describedby`.
   */
  children: React.ReactElement;
  className?: string;
}
/** A label and help text beside a control, for the rows of a settings card. Stacked below `sm`. */
export declare function SettingRow(props: SettingRowProps): React.ReactElement;
