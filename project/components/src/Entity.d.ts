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
  /** Makes the row expandable: the row becomes a disclosure button (a stretched cover button with `aria-expanded` and `aria-controls`) that opens this region under the row, inside the same list item. The button is named by the left and content text. Put controls in the detail, not in `left` or `right`. `as="button"` is ignored. */
  detail?: React.ReactNode;
  /** Controlled open state of the detail. */
  expanded?: boolean;
  /** Initial open state when uncontrolled. */
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** Inside an `Entity.List` with `onReorder`: the row name used in the drag handle's name ("Move {name}") and in the announcements. Default: the `Entity.Content` title text, or the text of the row's left and content when there is no title. */
  reorderLabel?: string;
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
export interface EntityListProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Makes the rows reorderable: each gets a leading drag handle that is also a menu button (Move Up, Move Down, Move to Top, Move to Bottom), and Alt+↑/↓ on the handle moves the row a step. Called with the row's index and the index it lands at, counting rows only. The list never reorders itself: move the item in your data and re-render the rows. Every move is announced in a polite live region. */
  onReorder?: (from: number, to: number) => void;
}
export declare function EntityContent(props: EntityContentProps): React.ReactElement;
export declare function EntityList(props: EntityListProps): React.ReactElement;
export declare const Entity: ((props: EntityProps) => React.ReactElement) & { Content: typeof EntityContent; List: typeof EntityList };
