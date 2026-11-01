export interface QueryBarProps extends Omit<QueryInputProps, 'suggestions' | 'help' | 'qualifiers' | 'size' | 'value' | 'defaultValue' | 'onChange'> {
  /** The query: the field and every menu read it. Leave it out to let the bar keep the query, starting from `defaultValue`. */
  value?: string;
  /** The query to start with when `value` is left out. */
  defaultValue?: string;
  /** Called once per edit with the whole new query: a keystroke in the field or a change in a menu. */
  onChange?: (query: string) => void;
  /** The qualifiers the field understands. The menus read them too: `QueryBar.Menu` is excludable, and takes a none row, only where its qualifier allows. */
  qualifiers: readonly Qualifier[];
  /** Sizes the field and its menus. Default medium. */
  size?: 'small' | 'medium' | 'large';
  /** Class for the outer element. */
  className?: string;
  /** The "?" button that opens the help popover: `true` (default) beside the field, `false` hidden, `'menus'` last in the menu row after the `QueryBar.Menu` elements (beside the field when there are no menus). Needs `qualifiers`. */
  help?: boolean | 'menus';
  /** The menus wrap onto more rows when they don't fit, so a Sort menu at the end stays visible (default true). `false` keeps them on one row that scrolls sideways. */
  wrap?: boolean;
  /** `QueryBar.Menu` elements, shown in a row after the field. */
  children?: React.ReactNode;
}

/** Every `FilterMenu` prop except the value, which comes from the query. */
export interface QueryBarMenuProps extends Omit<FilterMenuProps, 'value' | 'defaultValue' | 'onChange'> {
  /** The qualifier it edits, such as `label`. With `single` it edits that qualifier's one term, such as `sort`. */
  qualifier: string;
}

export declare function QueryBarMenu(props: QueryBarMenuProps): React.ReactElement | null;
/**
 * A query field with a row of filter menus that read and write the same query, like GitHub's issue filters. `<QueryBar.Menu qualifier="label" label="Labels">` is checked from the `label:`
 * terms and writes them back; `qualifier="sort" single defaultOption="newest"` is a sort menu. Terms no menu owns, and
 * free text, are left alone.
 */
export declare const QueryBar: ((props: QueryBarProps) => React.ReactElement) & {
  Menu: typeof QueryBarMenu;
};
