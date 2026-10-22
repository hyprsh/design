export interface CollapseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title' | 'onChange'> {
  /** The heading text. Keep it short; it is the button's name. */
  title: React.ReactNode;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  /** Controlled open state. Inside a CollapseGroup the group sets it. */
  expanded?: boolean;
  onChange?: (expanded: boolean) => void;
  /** 'inline' is a light disclosure for use inside a list or a paragraph of UI: a chevron and a label in body type, no border, the content indented under the label. It renders no heading unless `headingLevel` is set. Default is the bordered section. */
  variant?: 'default' | 'inline';
  /** 'small' for a 16px title and 14px body. Default is a 24px title. */
  size?: 'small' | 'default';
  /** Base for the trigger and panel ids. */
  id?: string;
  /** hyprsh: heading level of the title, 2 to 6. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}
export interface CollapseGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Allow several items open at once. Without it, opening one closes the others and the open one stays open. */
  multiple?: boolean;
  children?: React.ReactNode;
}
export declare function CollapseGroup(props: CollapseGroupProps): React.ReactElement;
export declare const Collapse: ((props: CollapseProps) => React.ReactElement) & { Group: typeof CollapseGroup };
