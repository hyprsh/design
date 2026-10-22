/** What a multiple-choice FilterMenu holds. `none` is exclusive with `include` and `exclude`. */
export interface FilterMenuValue { include: string[]; exclude: string[]; none: boolean; }

export interface FilterMenuItemProps {
  /** What goes into the value. */
  value: string;
  /** Shown instead of `value`. */
  label?: string;
  /** A muted second line. */
  description?: React.ReactNode;
  /** Before the label: a colour dot, avatar or icon. */
  prefix?: React.ReactNode;
  /** After the label: a hint such as "Recent". */
  suffix?: React.ReactNode;
  disabled?: boolean;
}
export interface FilterMenuSectionProps {
  /** Heading above the rows, e.g. "Suggestions". Sections are dropped while searching. */
  title: string;
  children?: React.ReactNode;
}

/**
 * A filter menu that starts empty and adds values. A hyprsh original: Geist has no page for it.
 * Multiple choice by default: each row is included, or excluded with `excludable`. With `single` it picks one option, like a sort menu.
 */
export interface FilterMenuProps {
  /** Plural noun for the trigger, the list and the search box, e.g. "Labels". */
  label: string;
  /** Multiple choice: the included and excluded values. Empty by default. */
  value?: FilterMenuValue;
  defaultValue?: FilterMenuValue;
  onChange?: (value: FilterMenuValue) => void;
  /** A shortcut for `FilterMenu.Item` rows (strings or item props). Rendered before any children. */
  items?: Array<FilterMenuItemProps | string>;
  /** Adds a row at the top that stands for "no value", e.g. "No labels". It can't be excluded. */
  noneLabel?: string;
  /** Adds an Exclude action to each row, and Shift+Enter on the highlighted row. */
  excludable?: boolean;
  /** Show the search box. On by default when there are more than 8 rows. */
  searchable?: boolean;
  /** One option instead of many: `value` is a string and picking a row closes the menu. No exclude or none row. */
  single?: boolean;
  /** `single`: the value that counts as nothing chosen, so the trigger isn't styled as active. */
  defaultOption?: string;
  size?: 'tiny' | 'small' | 'medium' | 'large';
  align?: 'start' | 'end';
  width?: number | string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  /** `FilterMenu.Item` and `FilterMenu.Section` rows. */
  children?: React.ReactNode;
}
/** With `single`, the value is the chosen option's `value`. */
export interface FilterMenuSingleProps extends Omit<FilterMenuProps, 'value' | 'defaultValue' | 'onChange' | 'single' | 'noneLabel' | 'excludable'> {
  single: true;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export declare const FilterMenuItem: (props: FilterMenuItemProps) => null;
export declare const FilterMenuSection: (props: FilterMenuSectionProps) => null;
export declare const FilterMenu: ((props: FilterMenuProps | FilterMenuSingleProps) => React.ReactElement) & {
  Item: typeof FilterMenuItem;
  Section: typeof FilterMenuSection;
};
