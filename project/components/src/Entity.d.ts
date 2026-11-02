export interface EntityProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  /** Leading slot: avatar, icon, checkbox, skeleton. */
  left?: React.ReactNode;
  /** Trailing slot: one or two controls, or meta text. */
  right?: React.ReactNode;
  /** Element to render. Rows inside EntityList default to 'li'. 'button' makes the whole row clickable. */
  as?: 'div' | 'li' | 'button';
  /** Row click handler, used with as="button". */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  /** Marks the row that holds the keyboard cursor of a j/k list: sets `aria-current="true"` and draws the same tint and 2px marker as `TableRow current`. */
  current?: boolean;
  /** Makes the row expandable: `left`, the content and `right` become one disclosure button (`aria-expanded`, `aria-controls`) that opens this region under the row, inside the same list item. The button is named by the left and content text. Put controls in the detail, not in `left` or `right`. `as="button"` is ignored. */
  detail?: React.ReactNode;
  /** Controlled open state of the detail. */
  expanded?: boolean;
  /** Initial open state when uncontrolled. */
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  leftClassName?: string;
  rightClassName?: string;
  children?: React.ReactNode;
}
export interface EntityContentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Take the remaining width, so columns line up across rows. */
  fill?: boolean;
}
export interface EntityListProps extends React.HTMLAttributes<HTMLUListElement> {}
export declare function EntityContent(props: EntityContentProps): React.ReactElement;
export declare function EntityList(props: EntityListProps): React.ReactElement;
export declare const Entity: ((props: EntityProps) => React.ReactElement) & { Content: typeof EntityContent; List: typeof EntityList };
