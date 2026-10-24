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
