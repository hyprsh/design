import type * as React from 'react';

type Size = 'small' | 'medium' | 'large';
type Hue = 'gray' | 'blue' | 'purple' | 'amber' | 'red' | 'pink' | 'green' | 'teal';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'prefix'> {
  /** Default 'secondary'. 'default' and 'primary' are the same solid fill: one per view. */
  variant?: 'default' | 'primary' | 'secondary' | 'tertiary' | 'error' | 'warning';
  /** tiny 24px (icon only), small 32px, medium 36px (default), large 40px. */
  size?: 'tiny' | Size;
  /** 'rounded' is a pill; 'circle' is for svgOnly buttons. */
  shape?: 'square' | 'rounded' | 'circle';
  /** Raised look (shadow-small), usually with shape="rounded" on marketing pages. */
  shadow?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** Shows a spinner in place of the prefix, keeps the label and disables the button. */
  loading?: boolean;
  /** Icon-only button: pass the icon as children and an aria-label. */
  svgOnly?: boolean;
  /** HTML type ('button' by default). */
  typeName?: 'button' | 'submit' | 'reset';
  /** HTML type, or a visual variant name (the older API). Prefer `variant` + `typeName`. */
  type?: 'button' | 'submit' | 'reset' | 'default' | 'primary' | 'secondary' | 'tertiary' | 'error' | 'warning';
  /** Renders an `<a>` instead of a `<button>`, as ButtonLink does. */
  href?: string;
  width?: number | string;
  /** A badge pinned to the button's corner: `true` is a dot, a number a count ("99+" above 99, nothing for 0), a node is rendered as given. Same as on `TabBar.Item`. */
  badge?: boolean | number | React.ReactNode;
  /** The colour of a dot or count badge: `'accent'` (default), `'error'` (red) or `'warning'` (amber). It is visual only and a node badge ignores it, so say the tone in `badgeLabel` ("2 blocking"). */
  badgeTone?: 'accent' | 'error' | 'warning';
  /** Accessible text for the badge ("3 need attention"). It joins the button's accessible name; a count with no `badgeLabel` adds its number. */
  badgeLabel?: string;
}
export interface ButtonLinkProps extends Omit<ButtonProps, 'href'>, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'type' | 'prefix'> {
  href: string;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>> & {
  Link: React.ForwardRefExoticComponent<ButtonLinkProps & React.RefAttributes<HTMLAnchorElement>>;
};
export declare const ButtonLink: React.ForwardRefExoticComponent<ButtonLinkProps & React.RefAttributes<HTMLAnchorElement>>;

export interface CopyButtonProps extends Omit<ButtonProps, 'children' | 'svgOnly' | 'prefix' | 'suffix'> {
  /** The text written to the clipboard. */
  textToCopy: string;
  /** Accessible name; say what is copied, such as 'Copy Deployment URL'. Default 'Copy to Clipboard'. */
  label?: string;
  /** Called with the text after it reaches the clipboard. */
  onCopy?: (text: string) => void;
}
export declare function CopyButton(props: CopyButtonProps): React.ReactElement;

export interface LoadMoreButtonProps extends ButtonProps {
  /** The label. Default 'Load More'. */
  children?: React.ReactNode;
  /** Shows a spinner and blocks repeat clicks while the next page loads. */
  loading?: boolean;
  /** Removes the 16px space above the button, for when it sits flush under a list. */
  noGap?: boolean;
  /** Square corners, for when it forms the bottom edge of a bordered container. */
  noBorderRadius?: boolean;
}
export declare function LoadMoreButton(props: LoadMoreButtonProps): React.ReactElement;

export interface SplitButtonMenuItemProps {
  title: React.ReactNode;
  /** One short line under the title, explaining the difference from the default action. */
  description?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Passed to the underlying MenuItem: onClick, href, className, type. */
  menuItemProps?: Partial<MenuItemProps>;
}
export interface SplitButtonProps {
  /** The default action's label. */
  children: React.ReactNode;
  /** Props for the default action: onClick, size, variant ('default' | 'secondary'), disabled, and other Button props. */
  buttonProps?: Omit<ButtonProps, 'variant'> & { variant?: 'default' | 'secondary' };
  /** Accessible name of the chevron button. Default 'More Options'. */
  menuButtonLabel?: string;
  /** SplitButtonMenuItem elements (or a fragment of them), or plain item objects. */
  menuItems: React.ReactNode | SplitButtonMenuItemProps[];
  /** Props for the Menu popup, such as width. */
  menuProps?: { width?: number; className?: string };
  /** Which edge the menu lines up with. Default 'bottom-start'. */
  menuAlignment?: 'bottom-start' | 'bottom-end';
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}
export declare function SplitButton(props: SplitButtonProps): React.ReactElement;
export declare namespace SplitButton {
  const MenuItem: typeof SplitButtonMenuItem;
}
export declare function SplitButtonMenuItem(props: SplitButtonMenuItemProps): React.ReactElement;

export interface AddressValue {
  /** ISO 3166-1 alpha-2 code, e.g. 'US', 'DE'. */
  country?: string;
  line1?: string;
  line2?: string;
  city?: string;
  /** State, province or emirate code for countries that have a list (US 'CA', CA 'ON', …). */
  region?: string;
  postalCode?: string;
}

export type AddressErrors = Partial<Record<keyof AddressValue, string>>;

export interface AddressProvider {
  /** Look up suggestions for typed text, optionally within a country. */
  search: (query: string, country?: string) => Promise<AddressValue[]>;
  /** Optional: turn a picked suggestion into a full address. */
  details?: (suggestion: AddressValue) => Promise<AddressValue>;
}

export interface AddressInputProps {
  value?: AddressValue;
  defaultValue?: AddressValue;
  onChange?: (address: AddressValue) => void;
  /** Local suggestions for the street search: a list (filtered as you type) or a function returning a list or a Promise. */
  suggestions?: AddressValue[] | ((query: string, country?: string) => AddressValue[] | Promise<AddressValue[]>);
  /** Async lookup you supply; AddressInput itself never touches the network. */
  provider?: AddressProvider;
  /** Limit the country list to these codes. All countries by default. */
  countries?: string[];
  /** Messages per field, e.g. from getAddressErrors(address). */
  errors?: AddressErrors;
  /** Prefix for input names: name.country, name.line1, … Default 'address'. */
  name?: string;
  /** Visible group heading; read by screen readers either way (default "Address"). */
  label?: string;
  /** Placeholder for the street search. */
  placeholder?: string;
  /** BCP 47 locale for country names. */
  locale?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Returns a message for each missing field, worded for the address's country. */
export declare function getAddressErrors(address: AddressValue): AddressErrors;

export declare const AddressInput: ((props: AddressInputProps) => React.ReactElement) & {
  getAddressErrors: typeof getAddressErrors;
  /** A few made-up addresses for demos. */
  demoSuggestions: AddressValue[];
};

export interface CalendarRange { start: Date | null; end: Date | null; }
export interface CalendarPreset { key?: string; text: string; start: Date | string; end: Date | string; }

export interface CalendarProps {
  /** 'range' (default) picks a start and end; 'single' picks one day. */
  mode?: 'range' | 'single';
  /** A { start, end } range, or a Date in single mode. */
  value?: CalendarRange | Date | null;
  defaultValue?: CalendarRange | Date | null;
  onChange?: (value: CalendarRange | Date | null) => void;
  /** Shows a clear button in the trigger once dates are set. */
  allowClear?: boolean;
  /** Earliest and latest selectable days. */
  minValue?: Date;
  maxValue?: Date;
  /** Start and end time fields in the popover (range mode). Default true. */
  showTimeInput?: boolean;
  /** Timezone menu under Apply when time fields show. Default true. */
  showTimezone?: boolean;
  /** Calendar and fields side by side. */
  horizontalLayout?: boolean;
  /** Where the popover lines up with the trigger. Default 'start'. */
  popoverAlignment?: 'start' | 'center' | 'end';
  /** small 32px, medium 40px (default). */
  size?: 'small' | 'medium';
  /** Quick ranges shown in a "Select Period" select, as a keyed object or an array. */
  presets?: Record<string, CalendarPreset> | CalendarPreset[];
  /** Preset to show selected while no value is set. */
  presetIndex?: number;
  onPresetChange?: (key: string) => void;
  /** Presets as a chevron after the trigger. */
  compact?: boolean;
  /** Presets above the trigger. */
  stacked?: boolean;
  /** Extra timezone offered in the menu, e.g. 'America/Los_Angeles'; also the default choice. */
  pinnedTimezone?: string;
  timezone?: string;
  defaultTimezone?: string;
  onTimezoneChange?: (timezone: string) => void;
  /** 0 = Sunday (default) … 6 = Saturday. */
  firstDayOfWeek?: number;
  /** BCP 47 locale for month and weekday names; the user's by default. */
  locale?: string;
  placeholder?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Calendar(props: CalendarProps): React.ReactElement;

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'type'> {
  /** Controlled state. 'indeterminate' is the older spelling of `indeterminate`. */
  checked?: boolean | 'indeterminate';
  /** Shows a dash in an empty box and reports "mixed" to assistive tech. A visual state only: clicking still toggles `checked`. */
  indeterminate?: boolean;
  /** A hint line under the label (13px, grey), linked to the input with `aria-describedby`: what the setting does or sends. Clicking it toggles the box. With it, `className` and `style` go on the wrapper around both. */
  description?: React.ReactNode;
  /** The label, 13px. Without it, pass aria-label (e.g. "Select acme-web" for a table row). */
  children?: React.ReactNode;
}
export declare function Checkbox(props: CheckboxProps): React.ReactElement;

export interface ChoiceboxProps {
  /** Group name, read by screen readers; shown only with showLabel. */
  label?: string;
  showLabel?: boolean;
  /** 'radio' (default): pick one, value is a string. 'checkbox': pick many, value is a string[]. */
  type?: 'radio' | 'checkbox';
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[], event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Disables every tile. */
  disabled?: boolean;
  /** Lay tiles out side by side ('row') or stacked ('column', default). */
  direction?: 'row' | 'column';
  /** Extra class for the tile list; "flex-row" is read as direction="row". */
  listClassName?: string;
  /** Input name; generated if left out. */
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export type ChoiceboxGroupProps = ChoiceboxProps;

export interface ChoiceboxGroupItemProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  value: string;
  disabled?: boolean;
  /** Native title text, e.g. why the tile is disabled. */
  tooltip?: string;
  /** Extra content shown below the header while the tile is selected. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ChoiceboxGroupItem: (props: ChoiceboxGroupItemProps) => React.ReactElement;
export declare const ChoiceboxGroup: (props: ChoiceboxGroupProps) => React.ReactElement;
export declare const Choicebox: ((props: ChoiceboxProps) => React.ReactElement) & {
  Group: typeof ChoiceboxGroup;
  Item: typeof ChoiceboxGroupItem;
};

export interface ClearableInputProps extends InputProps {
  /** Called after the field is cleared (Esc key button or Escape). onChange also fires, with an empty value. */
  onClear?: () => void;
  /** Shows ⌘ K while the field is empty, for a search that a global shortcut focuses. */
  cmdk?: boolean;
}
export declare const ClearableInput: React.ForwardRefExoticComponent<ClearableInputProps & React.RefAttributes<HTMLInputElement>>;

export interface ComboboxOptionData {
  value: string;
  label?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Id of the text field, for an outside <label htmlFor>. */
  id?: string;
  /** Selected option value; null when nothing is picked. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** Called with the typed text. */
  onInputChange?: (text: string) => void;
  /** Shortcut for ComboboxList + ComboboxOption children. */
  options?: Array<ComboboxOptionData | string>;
  placeholder?: string;
  /** small 32px, medium 36px (default), large 40px. */
  size?: 'small' | 'medium' | 'large';
  /** CSS width of the field; full width by default. */
  width?: number | string;
  /** Shows a clear button once something is picked. */
  clearable?: boolean;
  /** Red ring and aria-invalid. */
  errored?: boolean;
  disabled?: boolean;
  /** Shows a spinner instead of the options while results load. */
  loading?: boolean;
  /** Shown when nothing matches; a function gets the typed text. */
  emptyMessage?: React.ReactNode | ((query: string) => React.ReactNode);
  /** Submit the value in forms under this name. */
  name?: string;
  /** Start with the list open. */
  defaultOpen?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  children?: React.ReactNode;
}

export interface ComboboxInputProps { onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void; }
export interface ComboboxListProps {
  emptyMessage?: React.ReactNode | ((query: string) => React.ReactNode);
  maxWidth?: number | string;
  width?: number | string;
  children?: React.ReactNode;
}
export interface ComboboxOptionProps {
  value: string;
  /** Text used for filtering when children aren't plain text. */
  textValue?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  disabled?: boolean;
  children?: React.ReactNode;
}

export declare const ComboboxInput: (props: ComboboxInputProps) => null;
export declare const ComboboxList: (props: ComboboxListProps) => null;
export declare const ComboboxOption: (props: ComboboxOptionProps) => null;
export declare const Combobox: ((props: ComboboxProps) => React.ReactElement) & {
  Input: typeof ComboboxInput;
  List: typeof ComboboxList;
  Option: typeof ComboboxOption;
};

export type FeedbackEmotion = 'hate' | 'meh' | 'okay' | 'love';
export interface FeedbackPayload {
  emotion: FeedbackEmotion | null;
  text: string;
  topic?: string;
  metadata?: Record<string, unknown>;
}
export interface FeedbackProps {
  /** 'popover' (default) opens a panel from a trigger button; 'inline' is a pill that expands in place. */
  type?: 'popover' | 'inline';
  /** Trigger text (popover) or form name (inline). Title Case, no question mark. Default “Feedback”. */
  label?: string;
  /** The question, in sentence case. Default “Was this helpful?”. Shown beside the reactions when inline; in the popover it only names the dialog for assistive tech. */
  copy?: string;
  /** Called on Send. Return a Promise to show a loading state; a rejection shows a retry message. Nothing is sent over the network for you. */
  onSubmit?: (payload: FeedbackPayload) => void | Promise<unknown>;
  /** Extra context passed through to onSubmit (page, release). Never put personal data here. */
  metadata?: Record<string, unknown>;
  /** Show a topic select above the text box. */
  showTopics?: boolean;
  topics?: Array<string | { value: string; label: string }>;
  /** Skip onSubmit and go straight to the success state. */
  dryRun?: boolean;
  /** Start open (popover) or expanded (inline). Doesn't move focus. */
  defaultOpen?: boolean;
  /** Icons on the trigger button. */
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  className?: string;
}
export declare function Feedback(props: FeedbackProps): React.ReactElement;

export interface FieldsetProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tints the border and footer red or amber and adds an icon to the footer status. */
  type?: 'error' | 'warning';
  children?: React.ReactNode;
}
export interface FieldsetContentProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /** Disables every control inside (native fieldset) and grays the title and subtitle. */
  disabled?: boolean;
}
export interface FieldsetPartProps { className?: string; children?: React.ReactNode; id?: string }
export interface FieldsetTitleProps extends FieldsetPartProps {
  /** Heading level; h4 by default. Pick the one that fits the page outline. */
  as?: 'h2' | 'h3' | 'h4' | 'h5';
}
export interface FieldsetFooterProps extends FieldsetPartProps {
  /** A lighter gray footer. */
  highlight?: boolean;
}
export declare function FieldsetContent(props: FieldsetContentProps): React.ReactElement;
export declare function FieldsetTitle(props: FieldsetTitleProps): React.ReactElement;
export declare function FieldsetSubtitle(props: FieldsetPartProps): React.ReactElement;
export declare function FieldsetFooterStatus(props: FieldsetPartProps): React.ReactElement;
export declare function FieldsetFooterActions(props: FieldsetPartProps): React.ReactElement;
/** A small Button, primary unless you pass another variant. */
export declare const FieldsetFooterAction: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export declare const FieldsetFooter: ((props: FieldsetFooterProps) => React.ReactElement) & {
  Status: typeof FieldsetFooterStatus;
  Actions: typeof FieldsetFooterActions;
  Action: typeof FieldsetFooterAction;
};
export declare const Fieldset: ((props: FieldsetProps) => React.ReactElement) & {
  Fieldset: (props: FieldsetProps) => React.ReactElement;
  Content: typeof FieldsetContent;
  Title: typeof FieldsetTitle;
  Subtitle: typeof FieldsetSubtitle;
  Footer: typeof FieldsetFooter;
  FooterStatus: typeof FieldsetFooterStatus;
  FooterActions: typeof FieldsetFooterActions;
  FooterAction: typeof FieldsetFooterAction;
};

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
 * A filter menu that starts empty and adds values.
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

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** Visible label, Title Case. Without it, pass aria-label or aria-labelledby. */
  label?: React.ReactNode;
  /** One sentence under the field, wired up with aria-describedby. */
  hint?: React.ReactNode;
  /** Error text under the field, announced with role="alert"; also sets aria-invalid. `true` shows the red ring only. */
  error?: React.ReactNode;
  /** Text or an icon before the value: `https://`, a search icon. */
  prefix?: React.ReactNode;
  /** Text or an icon after the value: `.hyprsh.dev`, a kbd. */
  suffix?: React.ReactNode;
  /** false drops the gray background and divider behind the prefix (use for icons). */
  prefixStyling?: boolean;
  suffixStyling?: boolean;
  /** false renders the prefix with no wrapper at all, for a node that brings its own layout. */
  prefixContainer?: boolean;
  suffixContainer?: boolean;
  /** small 32px, medium 36px (default), large 40px. */
  size?: Size;
  /** Pill corners. */
  rounded?: boolean;
  /** HTML type; an alias for `type`, matching Button. */
  typeName?: string;
  /** 'inline' puts the label beside the field instead of above it, for toolbars (“Monitor [select]”). The hint and error stay under the field. Needs `label`. Default 'top'. */
  labelPosition?: 'top' | 'inline';
  /** Geist Mono in the value, the placeholder and the error line, for paths, keys and hashes. Default false. */
  mono?: boolean;
  /** Class for the bordered frame; `className` goes on the outer field. */
  wrapperClassName?: string;
}
export declare const Input: React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;

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

export interface MultiSelectItem { value: string; label?: string; disabled?: boolean; }

/** Shortcut props (with `items`), or MultiSelectRoot props (without). */
export interface MultiSelectProps {
  /** Renders the whole control: a trigger plus one row per item. */
  items?: Array<MultiSelectItem | string>;
  /** Selected values; every item is selected by default. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** Plural noun for the trigger and popover name, e.g. "Environments". */
  label?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  align?: 'start' | 'end';
  width?: number | string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface MultiSelectRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export interface MultiSelectTriggerProps {
  /** Button text; name the selection, e.g. "All Environments" or "Preview". */
  children?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
export interface MultiSelectContentProps {
  align?: 'start' | 'end';
  'aria-label'?: string;
  width?: number | string;
  /** Focus the first checkbox when opened from the trigger. Default true. */
  autoFocus?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export interface MultiSelectRowProps {
  /** Item name; also the checkbox's accessible name. */
  name: string;
  label?: React.ReactNode;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  /** Called by the row's "Only" action. */
  onSelectOnly?: () => void;
  /** Called by the row's "Select All" action. */
  onSelectAll?: () => void;
  selectedCount?: number;
  totalCount?: number;
  className?: string;
}

export declare const MultiSelectRoot: (props: MultiSelectRootProps) => React.ReactElement;
export declare const MultiSelectTrigger: (props: MultiSelectTriggerProps) => React.ReactElement;
export declare const MultiSelectContent: (props: MultiSelectContentProps) => React.ReactElement | null;
export declare const MultiSelectRow: (props: MultiSelectRowProps) => React.ReactElement;
export declare const MultiSelect: ((props: MultiSelectProps) => React.ReactElement) & {
  Root: typeof MultiSelectRoot;
  Trigger: typeof MultiSelectTrigger;
  Content: typeof MultiSelectContent;
  Row: typeof MultiSelectRow;
};

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

export interface QueryHelpButtonProps {
  /** The qualifiers to explain: one line each, from their `help`. */
  qualifiers: readonly Qualifier[];
  /** Sizes the button to match a field or menus beside it. Default medium. */
  size?: 'small' | 'medium' | 'large';
}

/**
 * The "?" icon button that opens the Query Help popover: each qualifier's `help` line and the rules of the query syntax. `QueryInput` draws it beside the
 * field; use it on its own to place it elsewhere, with `help={false}` on the field (or in a `QueryBar`, `help="menus"` for the menu row).
 */
export declare function QueryHelpButton(props: QueryHelpButtonProps): React.ReactElement;

/** One qualifier an app understands in a query: `label:bug`. */
export interface Qualifier {
  /** The word before the colon, lowercase: `label`. */
  name: string;
  /** One line for the help popover and the description under the qualifier's name in the suggestions. */
  help: string;
  /** The values it takes, offered as you type. Without them any value is accepted, and a value not listed is a problem. */
  values?: readonly string[];
  /** Values offered as you type when any value is accepted, such as a list of people. */
  suggestions?: readonly string[];
  /** Whether `-name:` (exclude) is allowed. */
  excludable?: boolean;
  /** Whether `no:name` (nothing has this qualifier) is allowed. */
  none?: boolean;
}

/** A qualifier as typed. `span` is where it sits in the text. `no:label` is a term named `no` whose values are qualifier names. */
export interface Term {
  name: string;
  values: string[];
  excluded: boolean;
  span: [start: number, end: number];
}

/** What a query says: its terms, its free text (the other words joined by single spaces) and what was left out. */
export interface Query {
  terms: Term[];
  text: string;
  /** Why part of the query at `span` was left out: a value the qualifier does not take, an exclude it does not allow. */
  problems: Array<{ message: string; span: [start: number, end: number] }>;
}

/** A completion for the word at the caret. */
export interface QuerySuggestion {
  /** The row's text. */
  label: string;
  /** The whole query after picking it. */
  text: string;
  /** Where the caret goes afterwards, an index into `text`. */
  caret: number;
  /** A range of `label` drawn highlighted. */
  match?: [start: number, end: number];
  /** A muted second line. */
  description?: string;
  /** Reopens the list at the new caret after picking, for a name that is followed by its values. */
  keepOpen?: boolean;
}

/**
 * Reads a query. Unknown qualifiers (`error:disk`) are free text, and an unfinished term (`label:`) is ignored. Values a
 * qualifier does not take, and excludes it does not allow, are dropped and named in `problems`. `no:name` is a term
 * (named `no`, with the qualifier names as values) for qualifiers with `none: true`; it is a problem for any other
 * qualifier, and wherever no qualifier has `none`. Names are case-insensitive, values are not.
 */
export declare function parseQuery(text: string, qualifiers: readonly Qualifier[]): Query;
/**
 * The suggestions for the word ending at `caret`: qualifier names (as `name:`, with `keepOpen`) while it has no colon,
 * and the values of `name:` or `-name:` after it, best match first and without the values already chosen. An empty
 * query lists every name; an empty word in the middle of a query lists nothing. `match` is set on every suggestion.
 */
export declare function suggestQuery(text: string, caret: number, qualifiers: readonly Qualifier[]): QuerySuggestion[];
/** A term as it would be typed, such as `-label:bug,docs` or `title:"Breaking Bad"`. */
export declare function termText(term: Pick<Term, 'name' | 'values' | 'excluded'>): string;
/** The query with `value` added: OR-ed into the `name:` term already there, or as a new term at the end. */
export declare function withValue(text: string, name: string, value: string, qualifiers: readonly Qualifier[]): string;
/** The query with `value` taken out of each `name:` term that has it. A term left with no value goes. */
export declare function withoutValue(text: string, name: string, value: string, qualifiers: readonly Qualifier[]): string;
/** The query without its `index`th term, and the space before it (or else after it). */
export declare function withoutTerm(text: string, index: number, qualifiers: readonly Qualifier[]): string;
/**
 * What the `name:` terms that are not excluded ask for. A term's values are alternatives and the same qualifier typed
 * twice must match both, so an empty list means nothing can match. Null when there is no such term. `each` maps a
 * term's values first, such as a group to its members.
 */
export declare function valuesOf<T = string>(query: Query, name: string, each?: (values: string[]) => T[]): T[] | null;

export interface QueryInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'onChange' | 'prefix' | 'defaultValue'> {
  /** The query. The text is the value, and typing is never reverted. Leave it out to let the field keep the text. */
  value?: string;
  /** The text to start with when `value` is left out. */
  defaultValue?: string;
  /** Called with the whole text on every edit. */
  onChange?: (text: string) => void;
  /** Suggestions for the word at the caret, computed by the app. Synchronous. Wins over `qualifiers`. */
  suggestions?: (text: string, caret: number) => QuerySuggestion[];
  /** The qualifiers the app understands: suggested with `suggestQuery`, explained in the help popover, and checked with `parseQuery` (problems show under the field). */
  qualifiers?: readonly Qualifier[];
  /** false hides the "?" button that opens the help popover. Needs `qualifiers`. Default true. To place the button yourself, hide it and render `QueryHelpButton`. */
  help?: boolean;
  /** small 32px, medium 36px (default), large 40px. */
  size?: 'small' | 'medium' | 'large';
  /**
   * A single key, with no modifiers, such as `"/"`. Pressing it anywhere on the page focuses the field (and the key is not typed), unless focus is already in an
   * editable element or the field is disabled. While the field is empty a key cap shows the key inside it (not on touch-only devices), and the input gets
   * `aria-keyshortcuts`, which an `aria-keyshortcuts` prop overrides. Not for modifier combinations.
   */
  shortcut?: string;
  /** Keys the field leaves alone: Enter, Escape and Tab whenever the list is closed, and every other key. While the list is open it owns Up, Down, Enter, Tab and Escape. */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  /** Class for the outer element. */
  className?: string;
}
/**
 * A text field whose text is the value, with suggestions that complete the word at the caret, for search and filter
 * queries such as `is:open label:bug,docs crash`. Give it `qualifiers` for
 * the built-in syntax (`parseQuery`, `suggestQuery`) or `suggestions` for your own. The ARIA 1.2 combobox pattern.
 */
export declare function QueryInput(props: QueryInputProps): React.ReactElement;

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'value'> {
  /** The option's value. Inside a RadioGroup it is compared with the group's value. */
  value?: string;
  /** Standalone use only; inside a RadioGroup the group decides. */
  checked?: boolean;
  /** The label, 13px. Without it, pass aria-label. */
  children?: React.ReactNode;
}
export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Names the group for assistive tech (visually hidden). Or pass aria-label. */
  label?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  /** Called with the picked option's value. */
  onChange?: (value: string) => void;
  /** The shared input name; generated when omitted. Set it when the group posts with a form. */
  name?: string;
  disabled?: boolean;
  /** Marks every option required, so a native form asks for one. */
  required?: boolean;
  /** Lays the options out in a row. */
  horizontal?: boolean;
  children?: React.ReactNode;
}
export interface RadioGroupItemProps extends RadioProps { value: string }
export interface UseRadioOptions { value: string; disabled?: boolean; id?: string; 'aria-label'?: string }
export declare function RadioGroup(props: RadioGroupProps): React.ReactElement;
export declare function RadioGroupItem(props: RadioGroupItemProps): React.ReactElement;
/** Inside a RadioGroup: the bare radio for a custom layout, and whether it is selected. */
export declare function useRadio(options: UseRadioOptions): { component: React.ReactElement; checked: boolean };
export declare function Radio(props: RadioProps): React.ReactElement;
export declare namespace Radio {
  const Group: typeof RadioGroup;
  const GroupItem: typeof RadioGroupItem;
  const useRadio: (options: UseRadioOptions) => { component: React.ReactElement; checked: boolean };
}

export interface SearchInputProps extends ClearableInputProps {
  /** Swaps the search icon for a spinner and sets aria-busy, while results load. */
  loading?: boolean;
  /** Replaces the search icon. */
  prefix?: React.ReactNode;
}
export declare const SearchInput: React.ForwardRefExoticComponent<SearchInputProps & React.RefAttributes<HTMLInputElement>>;

export interface SelectOption { value: string; label: React.ReactNode; disabled?: boolean }

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'prefix'> {
  /** Visible label, Title Case. Without it, pass aria-label. */
  label?: React.ReactNode;
  /** One sentence under the field, wired up with aria-describedby. */
  hint?: React.ReactNode;
  /** Error text under the field, announced with role="alert"; also sets aria-invalid. `true` shows the red ring only. */
  error?: React.ReactNode;
  /** Options as data. Or pass `<option>` / `<optgroup>` children. */
  options?: Array<string | SelectOption>;
  /** A disabled first option shown in gray until something is picked: "Select a region". */
  placeholder?: string;
  /** An icon before the value (decorative). */
  prefix?: React.ReactNode;
  /** Replaces the chevron (decorative). */
  suffix?: React.ReactNode;
  /** small 32px, medium 36px (default), large 40px. */
  size?: Size;
  /** 'inline' puts the label beside the field instead of above it, for toolbars (“Monitor [select]”). The hint and error stay under the field. Needs `label`. Default 'top'. */
  labelPosition?: 'top' | 'inline';
  /** Class for the bordered frame; `className` goes on the outer field. */
  wrapperClassName?: string;
}
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLSelectElement>>;

export interface SliderProps {
  /** One number, or [start, end] for a range. A single-value [50] also works. */
  value?: number | number[];
  defaultValue?: number | number[];
  /** Called while dragging or typing, with the same shape as value. */
  onValueChange?: (value: number | number[]) => void;
  /** Alias of onValueChange. */
  onChange?: (value: number | number[]) => void;
  /** Called once a drag, key press or typed value is finished. */
  onValueCommitted?: (value: number | number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Visible label above the track; also the accessible name. */
  label?: React.ReactNode;
  'aria-label'?: string;
  /** Show a number field before the track (bound to the first value). */
  showStartInput?: boolean;
  /** Show a number field after the track (bound to the last value). */
  showEndInput?: boolean;
  /** Text for screen readers, e.g. v => v + '%'. */
  formatValue?: (value: number) => string;
  disabled?: boolean;
  /** Track width; default 216px. */
  width?: number | string;
  /** Form field name; a range submits name[0] and name[1]. */
  name?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Slider(props: SliderProps): React.ReactElement;

export interface SwitchProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> {
  /** Radio group name; a unique one is generated when left out. */
  name?: string;
  /** small 32px, medium 36px (default), large 40px. */
  size?: 'small' | 'medium' | 'large';
  /** Controlled selected value. */
  value?: string;
  /** Uncontrolled starting value (or put defaultChecked on one SwitchControl). */
  defaultValue?: string;
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Disables every control. */
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export interface SwitchControlProps {
  /** Visible text; with `icon` it becomes the screen-reader name. Always required. */
  label: string;
  /** Submitted value; defaults to the label. */
  value?: string;
  /** Shows only this icon (label read by screen readers). Pair with a Tooltip. */
  icon?: React.ReactNode;
  /** With `icon`, the label is read by screen readers only. Set `false` to show it next to the icon. Default true. */
  hideLabel?: boolean;
  defaultChecked?: boolean;
  checked?: boolean;
  disabled?: boolean;
  /** Overrides the group size for this control. */
  size?: 'small' | 'medium' | 'large';
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export declare const SwitchControl: (props: SwitchControlProps) => React.ReactElement;
export declare const Switch: ((props: SwitchProps) => React.ReactElement) & { Control: typeof SwitchControl };

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label, Title Case. Without it, pass aria-label. */
  label?: React.ReactNode;
  /** One sentence under the field, wired up with aria-describedby. */
  hint?: React.ReactNode;
  /** Error text under the field, announced with role="alert"; also sets aria-invalid. `true` shows the red ring only. */
  error?: React.ReactNode;
  /** small and medium are 14px text, large is 16px. */
  size?: Size;
  /** Geist Mono in the value, the placeholder and the error line, for paths, keys and hashes. Default false. */
  mono?: boolean;
  /** Class for the bordered frame; `className` goes on the outer field. */
  wrapperClassName?: string;
}
export declare const Textarea: React.ForwardRefExoticComponent<TextareaProps & React.RefAttributes<HTMLTextAreaElement>>;

export type ThemeSwitcherValue = 'system' | 'light' | 'dark';

export type ThemeSwitcherAttribute = 'data-theme' | 'class' | 'both' | Array<'data-theme' | 'class'>;

export interface ThemeSwitcherProps {
  /** Controlled choice. */
  value?: ThemeSwitcherValue;
  /** Uncontrolled starting choice. Default: the stored choice, else the <html> data-theme, else 'system'. */
  defaultValue?: ThemeSwitcherValue;
  /** Called with the new choice after it has been applied to <html>. */
  onChange?: (next: ThemeSwitcherValue) => void;
  /** localStorage key the choice is saved under. Default 'theme'; pass null to save nothing. */
  storageKey?: string | null;
  /** What is written on <html>: 'data-theme' (default), 'class' (.dark or .light, the other removed), or 'both' / ['data-theme', 'class']. */
  attribute?: ThemeSwitcherAttribute;
  /** 'radios' (default) shows System, Light and Dark side by side; 'cycle' is one icon button that cycles System, Light, Dark. */
  variant?: 'radios' | 'cycle';
  /** Radios: medium 32px options (default) or small 24px. Cycle: the Button sizes, medium 36px (default) or small 32px. */
  size?: 'small' | 'medium';
  /** Cycle only. Set false to render the bare button with no Tooltip, so the app can wrap it. Default true. */
  tooltip?: boolean;
  /** Cycle only. Which side of the button the Tooltip opens on. Default 'top'. */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  disabled?: boolean;
  /** Names the group for screen readers. Default 'Theme'. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function ThemeSwitcher(props: ThemeSwitcherProps): React.ReactElement;
/** The inline pre-paint script as a string, built from the same code the component applies the theme with. */
export declare function themeScript(options?: { storageKey?: string | null; attribute?: ThemeSwitcherAttribute }): string;

export type ToggleColor = 'accent' | 'blue' | 'amber' | 'red' | 'green' | 'teal' | 'purple' | 'pink' | 'gray';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'defaultChecked' | 'onChange' | 'size' | 'type' | 'color'> {
  checked?: boolean;
  /** Uncontrolled starting state. */
  defaultChecked?: boolean;
  /** Called with the new state; the change event comes second. */
  onChange?: (next: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  /** small 28×14 (default), medium 36×20, large 40×24. */
  size?: 'small' | 'medium' | 'large';
  /** Track colour. Any colour but the accent keeps the track tinted when off. Default 'accent' (blue). */
  color?: ToggleColor;
  /** Icons shown inside the thumb for each state. */
  icon?: { checked?: React.ReactNode; unchecked?: React.ReactNode };
  /** 'label-first' (default) or 'switch-first'. */
  direction?: 'label-first' | 'switch-first';
  /** 'title' (default) capitalises each word of the label; 'normal' leaves it alone. */
  labelCasing?: 'title' | 'normal';
  /** The label: a noun phrase naming the "on" state. */
  children?: React.ReactNode;
  'aria-label'?: string;
  className?: string;
}
export declare function Toggle(props: ToggleProps): React.ReactElement;

export interface BreadcrumbsProps {
  /** BreadcrumbItem elements, from the top level to the current page. */
  children: React.ReactNode;
  /** 'text' (default) is a path with chevrons; 'menu' shows compact chips with no separators. */
  type?: 'text' | 'menu';
  /** Name of the nav landmark. Default 'Breadcrumb'. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export interface BreadcrumbItemProps extends Omit<React.HTMLAttributes<HTMLElement>, 'prefix'> {
  children: React.ReactNode;
  /** Makes the step a link. Ignored when disabled. */
  href?: string;
  /** The current page: marked with aria-current="page". */
  active?: boolean;
  /** A step that exists but can't be opened, such as a team you can't access. */
  disabled?: boolean;
  /** An icon or avatar before the text. */
  prefix?: React.ReactNode;
}
export declare function Breadcrumbs(props: BreadcrumbsProps): React.ReactElement;
export declare namespace Breadcrumbs {
  const Item: typeof BreadcrumbItem;
}
/** Alias for Breadcrumbs. */
export declare const Breadcrumb: typeof Breadcrumbs;
export declare function BreadcrumbItem(props: BreadcrumbItemProps): React.ReactElement;

export interface CommandMenuTriggerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'prefix' | 'type'> {
  /** The label, also the accessible name. Default "Search…". */
  children?: React.ReactNode;
  /** medium 36px (default), small 32px. Matches Input; both are 44px under touch sizing. */
  size?: 'small' | 'medium';
  /** Before the label. Defaults to the search icon; null or false hides it. */
  prefix?: React.ReactNode;
  /** After the label, hidden from screen readers. Defaults to a ⌘K key; false hides it, any node replaces it. */
  shortcut?: React.ReactNode;
}
export declare const CommandMenuTrigger: React.ForwardRefExoticComponent<CommandMenuTriggerProps & React.RefAttributes<HTMLButtonElement>>;

export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'color'> {
  /** Element to render. 'a' (default) navigates; 'button' is an action that looks like a link. */
  as?: 'a' | 'button';
  /** For as="button": the native disabled state. For an anchor it removes the href and sets aria-disabled. */
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
  className?: string;
}
export declare const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement & HTMLButtonElement>>;

export interface NavListProps extends React.HTMLAttributes<HTMLElement> {
  /** Names the navigation landmark. Give this or `aria-labelledby`: NavList warns in development without one. */
  'aria-label'?: string;
  children: React.ReactNode;
}
export interface NavGroupProps {
  /** Visible heading. It labels the group's list. */
  title: React.ReactNode;
  children: React.ReactNode;
}
export interface NavItemProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement> & React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'children'> {
  /** Leading node. Decorative: hidden from assistive tech. */
  icon?: React.ReactNode;
  /** Right-aligned node. A number is shown as a count and joins the accessible name ("Downloads, 3"). */
  trailing?: React.ReactNode;
  /** Text that joins the accessible name for a `trailing` node that isn't a number, such as a StatusDot ("Health, Failing"). */
  trailingLabel?: string;
  /** Marks the selected row: draws the secondary-button look and sets `aria-current` (`"page"` for `true`, or the token given). */
  current?: boolean | 'page' | 'step' | 'location' | 'true';
  /** Renders an `<a>`, so Cmd/Ctrl-click and middle-click work. Without it the item is a `<button type="button">`. */
  href?: string;
  onClick?: (event: React.MouseEvent) => void;
  /** Buttons only: sets `aria-disabled` and ignores clicks. */
  disabled?: boolean;
  children: React.ReactNode;
}
export declare function NavGroup(props: NavGroupProps): React.ReactElement;
export declare function NavItem(props: NavItemProps): React.ReactElement;
export declare const NavList: ((props: NavListProps) => React.ReactElement) & { Group: typeof NavGroup; Item: typeof NavItem };

export interface PagerProps {
  /** The page on screen, starting at 1. A page beyond the last one shows the last page's range with next disabled, and never calls `onPageChange`. */
  page: number;
  /** Rows per page. */
  pageSize: number;
  /** All the results, across every page. 0 renders nothing; a total that fits one page shows the range with no buttons. */
  total: number;
  /** The previous or next button was used, with the page to show. Only called after the user acted. Slice or fetch the rows yourself. */
  onPageChange: (page: number) => void;
  /** Disables both buttons and keeps the last range shown. */
  loading?: boolean;
  /** Name of the nav landmark. Default 'Pages'. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Pager(props: PagerProps): React.ReactElement | null;

export interface PaginationLinkData {
  /** Title of the neighbouring page. */
  title: string;
  href: string;
  /** Small label above the title. Default 'Previous' / 'Next'. */
  label?: string;
  /** For client-side routing; call preventDefault to stop the default navigation. */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}
export interface PaginationProps {
  /** The page before this one. Omit on the first page: that side stays empty. */
  previous?: PaginationLinkData;
  /** The page after this one. Omit on the last page. */
  next?: PaginationLinkData;
  /** Name of the nav landmark. Default 'Pagination'. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Pagination(props: PaginationProps): React.ReactElement;

export interface TabBarAccessory {
  /** The accessible name; the accessory shows an icon only. */
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  /** Renders a link instead of a button. */
  href?: string;
}

export interface TabBarItemProps {
  /** Selects the item on press. Leave it off for an action item such as More. */
  value?: string;
  label: string;
  icon: React.ReactNode;
  /** `true`: a dot. A number: a count bubble ("99+" above 99, nothing for 0). Any other node is rendered as given. */
  badge?: boolean | number | React.ReactNode;
  /**
   * The colour of a dot or count badge: `'accent'` (default), `'error'` (red) or `'warning'` (amber). It is visual only
   * and a node badge ignores it, so say the tone in `badgeLabel` ("2 blocking").
   */
  badgeTone?: 'accent' | 'error' | 'warning';
  /** Added to the item's accessible name, such as "3 need attention". */
  badgeLabel?: string;
  /** Takes aria-current and the selected pill: while any item has `current`, no item is selected by `value`. */
  current?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  /** Renders a link instead of a button. */
  href?: string;
  /** The item opens a dialog or sheet (aria-haspopup="dialog"). */
  haspopup?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
/** One destination or action in a TabBar. */
export declare const TabBarItem: (props: TabBarItemProps) => React.ReactElement;

/**
 * The floating pill tab bar for phones. Fixed to the bottom and out of
 * layout; while one is visible, the CSS variable `--tab-bar-height` holds its height (safe area included).
 */
export interface TabBarProps {
  /** The accessible name of the `<nav>`. */
  label: string;
  /** The selected item's value (controlled). */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Same as onChange; both are called. */
  onValueChange?: (value: string) => void;
  /** A round button beside the capsule, for an action that isn't a screen. */
  accessory?: TabBarAccessory;
  /** Shrinks the capsule to the selected item while content scrolls down; scrolling up or a tap expands it. */
  minimizeOnScroll?: boolean;
  /** Watch this container instead of every scrolling element in the document. */
  scrollRef?: React.RefObject<HTMLElement>;
  /** 'sm' (default): hidden from 640px up. false: shown at every width. */
  hideFrom?: 'sm' | false;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare const TabBar: ((props: TabBarProps) => React.ReactElement) & { Item: typeof TabBarItem };

export interface TabItem {
  value: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Tooltip on the tab, such as why it is disabled. */
  tooltip?: React.ReactNode;
  /** hyprsh: the panel for this tab; Tabs renders it when the tab is selected. */
  content?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  /** The selected value (controlled). */
  selected?: string;
  defaultSelected?: string;
  /** Change handler. */
  setSelected?: (value: string) => void;
  /** Same as setSelected; both are called. */
  onChange?: (value: string) => void;
  /** Disables every tab. */
  disabled?: boolean;
  /** 'primary' (default): underlined tabs for page sections. 'secondary': compact pills inside a card or toolbar. */
  variant?: 'primary' | 'secondary';
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Tabs(props: TabsProps): React.ReactElement;

export interface BadgeProps {
  /** Default 'gray'. Solid for the one key status; '-subtle' (or contrast="low") in dense UI. */
  variant?: Hue | `${Hue}-subtle` | 'inverted' | 'pill';
  /** 'low' turns a solid hue into its subtle tint. */
  contrast?: 'low' | 'high';
  /** sm 20px, md 24px (default), lg 32px. small | medium | large also work. */
  size?: 'sm' | 'md' | 'lg' | Size;
  /** Leading icon; sized to the badge (12/14/16px). */
  icon?: React.ReactNode;
  /** Accessible description for ambiguous or icon-led badges. */
  title?: string;
  translate?: 'yes' | 'no';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): React.ReactElement;

export interface PillProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'> {
  /** Renders an <a>. Without href, onClick renders a <button>; neither renders a static <span>. */
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** sm 20px, md 24px (default), lg 32px. small | medium | large also work. */
  size?: 'sm' | 'md' | 'lg' | Size;
  /** Leading icon or logo; sized to the pill (12/14/16px). */
  icon?: React.ReactNode;
  /** Makes the pill a toggle chip: a <button> with `aria-pressed`. Controlled state. Several chips can be on at once. */
  pressed?: boolean;
  /** Toggle chip, uncontrolled initial state. */
  defaultPressed?: boolean;
  /** Toggle chip: called with the next state when it is clicked. Giving this, `pressed` or `defaultPressed` makes a toggle. */
  onPressedChange?: (pressed: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}
export declare function Pill(props: PillProps): React.ReactElement;

type StatusDotDeploymentState = 'queued' | 'building' | 'ready' | 'error' | 'canceled' | 'deleted';
type StatusDotSemanticState = 'success' | 'warning' | 'error' | 'neutral' | 'pending' | 'info';
type StatusDotState = StatusDotDeploymentState | StatusDotSemanticState;
export interface StatusDotProps {
  /**
   * A semantic state for any health or status (`success` green, `warning` amber, `error` red, `neutral` grey, `pending` grey and pulsing, `info` blue)
   * or a deployment state (`queued`, `building`, `ready`, `error`, `canceled`, `deleted`), in either case. Default 'ready'.
   */
  state?: StatusDotState | Uppercase<StatusDotState>;
  /** Shown by default (the state word). true shows it, a node replaces it ("Healthy", "Idle"), false hides it (the accessible name stays). */
  label?: React.ReactNode | boolean;
  /**
   * `filled` (default) is a solid dot. `outline` is a ring in the state's colour with a transparent centre, and `dashed` is the same ring dashed.
   * All three are the same size. Visual only: the label, title and accessible name don't change, so say what an outline means in `label` or `title`.
   */
  variant?: 'filled' | 'outline' | 'dashed';
  /**
   * Noun phrase for the title and accessible name. Deployment states: default 'This deployment' → “This deployment is ready.”
   * Semantic states: optional; “api: Success”.
   */
  titlePrefix?: string;
  /**
   * The whole title and accessible name, replacing the generated one. Use it for a dot without a label.
   * `null` drops the native tooltip (no `title` attribute) and keeps the accessible name, so a row of dots can be named once.
   */
  title?: string | null;
  'aria-hidden'?: boolean | 'true' | 'false';
  className?: string;
}
export declare function StatusDot(props: StatusDotProps): React.ReactElement;

export interface BannerButton {
  /** Where the link goes. */
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /** The link text: a Title Case verb, such as “Read More”. */
  content: React.ReactNode;
}
export interface BannerProps {
  /** The announcement: a <b> lead and one short clause, such as <b>Build Cache</b> – Now shared across branches. */
  children: React.ReactNode;
  /** The single call to action, shown as a small rounded secondary button with a chevron. */
  button?: BannerButton;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Banner(props: BannerProps): React.ReactElement;

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Title Case heading, e.g. “No Deployments Yet”. */
  title?: React.ReactNode;
  /** One or two sentences: why it's empty and what to do. */
  description?: React.ReactNode;
  /** A Lucide icon name, or any node. Drawn in a bordered tile. */
  icon?: string | React.ReactNode;
  /** 'small' is one line of text with no border, icon or heading: the `title` (then `description` and actions) inline, for a section of a dense page. `icon` and `headingLevel` are ignored. Default is the bordered block. */
  size?: 'small' | 'default';
  /** Heading level for the title. Default 3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Actions: one primary CTA, at most one secondary (often a link). */
  children?: React.ReactNode;
}
export interface EmptyStateIconProps {
  icon?: string | React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}
export declare function EmptyStateIcon(props: EmptyStateIconProps): React.ReactElement;
export declare const EmptyState: ((props: EmptyStateProps) => React.ReactElement) & { Icon: typeof EmptyStateIcon };

export interface ErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** small 13px, medium 14px (default), large 16px. */
  size?: Size;
  /** Bold prefix, default 'Error'. false hides it (screen readers still hear “Error”). */
  label?: string | false;
  /** Structured form: a message plus an optional recovery link. Replaces children. */
  error?: { message: React.ReactNode; action?: React.ReactNode; link?: string };
  children?: React.ReactNode;
}
/** Exported as `Error`; implemented as `ErrorMessage` so the global constructor is never shadowed at runtime. */
export declare function Error(props: ErrorProps): React.ReactElement;

export interface ErrorCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Names what failed, in Title Case: “Couldn’t Load Usage”. Rendered as an h3. */
  title?: React.ReactNode;
  /** One or two sentences: what happened and what to do next. */
  message?: React.ReactNode;
  /** Optional recovery actions, such as a Try Again button. */
  children?: React.ReactNode;
}
export declare function ErrorCard(props: ErrorCardProps): React.ReactElement;

export interface LoadingDotsProps {
  /** Dot diameter: sm 2px, md 3px (default), lg 4px, or a number of px. */
  size?: 'sm' | 'md' | 'lg' | 'small' | 'medium' | 'large' | number;
  /** Text before the dots, such as “Deploying”. It is announced politely. */
  children?: React.ReactNode;
  /** Screen-reader text when there are no children. Default “Loading”. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function LoadingDots(props: LoadingDotsProps): React.ReactElement;

export interface NoteProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
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
  /** Defaults to 'status' for `success` and 'alert' for `error` (none for the other variants, or when disabled). Pass any role to replace it. `aria-*`, `id` and `data-*` pass through to the note. */
  role?: React.AriaRole;
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

export interface ProgressStop {
  /** Position on the same scale as value. */
  value: number;
  /** Shown on hover and focus. */
  tooltip?: React.ReactNode;
  /** Accessible name of the marker; defaults to the tooltip text. */
  ariaLabel?: string;
}
export interface ProgressSegment {
  value: number;
  /** Colour of StatusDot's state of the same name. */
  tone: 'success' | 'info' | 'warning' | 'error' | 'neutral';
}
interface ProgressBase {
  /** Default 100. */
  max?: number;
  /** Marked points along the bar, each with an optional tooltip. */
  stops?: ProgressStop[];
  /** Bar width (number = px). Default 100%. */
  width?: number | string;
  /** Bar height in px. Default 10. */
  height?: number;
  /** hyprsh: a label row above the bar, with the percentage on the right (none for segments). Names the bar. */
  label?: React.ReactNode;
  /** Accessible name when there is no label. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
/** The value form. With segments, use ProgressSegmentsProps; the Progress component accepts either. */
export interface ProgressProps extends ProgressBase {
  value: number;
  /** Fill colour. success is blue. Default 'default' (gray-1000). */
  type?: 'default' | 'secondary' | 'success' | 'warning' | 'error';
  /** Threshold → colour, e.g. { 0: 'var(--gray-1000)', 80: 'var(--amber-700)', 95: 'var(--red-700)' }. Overrides type. */
  colors?: Record<number, string>;
  /** Older name for type: blue → success, amber → warning, red → error; green stays green. */
  variant?: 'default' | 'blue' | 'green' | 'amber' | 'red';
  segments?: never;
  gap?: never;
}
export interface ProgressSegmentsProps extends ProgressBase {
  /** One bar split into tones, drawn left to right and cut off at max. Replaces value, colors and type. */
  segments: ProgressSegment[];
  /** A 1px gap in the page colour between segments. Default false. */
  gap?: boolean;
  value?: never;
  colors?: never;
  type?: never;
  variant?: never;
}
export declare function Progress(props: ProgressProps | ProgressSegmentsProps): React.ReactElement;

export interface ProjectBannerCallToAction {
  /** A Title Case verb and noun, such as “Update Billing”. */
  label: React.ReactNode;
  /** Renders a link. */
  href?: string;
  /** Without href, renders a button styled as a link. */
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /** Shows a spinner before the label, keeps the label and ignores clicks (aria-disabled, aria-busy), like Button's loading. */
  loading?: boolean;
}
export interface ProjectBannerProps {
  /** Default 'gray'. success is blue. */
  variant?: 'gray' | 'success' | 'warning' | 'error';
  /** The message: one sentence about the whole project. */
  label?: React.ReactNode;
  /** Same as label. */
  children?: React.ReactNode;
  /** Replaces the variant's icon; null hides it. */
  icon?: React.ReactNode | null;
  /** The one action that resolves the message. Always give one. */
  callToAction?: ProjectBannerCallToAction;
  /** Landmark name. Defaults to the variant (“Warning”). */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function ProjectBanner(props: ProjectBannerProps): React.ReactElement;

export interface SkeletonProps {
  /** CSS width (number = px). Default: full width, or the children's width when wrapping. */
  width?: number | string;
  /** Minimum height (number = px). Default 24, or the children's height when wrapping. */
  height?: number | string;
  /** The height of the real content's box, when the placeholder is shorter: the rest becomes bottom margin. */
  boxHeight?: number;
  /** Fully rounded ends, for avatars and pills. */
  pill?: boolean;
  /** Fully rounded (radius-full), like pill. */
  rounded?: boolean;
  /** Square corners. */
  squared?: boolean;
  /** Shimmer. Default true; false leaves a static gray block. */
  animated?: boolean;
  /** Placeholder over a Button: extends past its border ring and uses its radius. */
  button?: boolean;
  /** Default true. false renders the children instead. */
  show?: boolean;
  /** The real content: hidden but sizing the placeholder while loading, shown when show={false}. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}
export declare function Skeleton(props: SkeletonProps): React.ReactElement | null;

export interface SpinnerProps {
  /** sm 12px, md 16px (default), lg 20px, xl 24px, 2xl 32px, 3xl 40px, 4xl 56px. A number of px still works and scales the nearest size. */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | number;
  /** Accessible name. With it the spinner is a status region; without it, it is decorative. */
  label?: string;
  'aria-label'?: string;
  /** Colour comes from `color`: gray-700 by default, e.g. style={{ color: 'var(--red-700)' }}. */
  className?: string;
  style?: React.CSSProperties;
}
export declare function Spinner(props: SpinnerProps): React.ReactElement;

export interface ToastOptions {
  /** One sentence. */
  text: React.ReactNode;
  /** Keep it until dismissed (adds a Dismiss button). */
  preserve?: boolean;
  /** A single action button: its label, plus onAction. */
  action?: string | { label: string; onClick?: () => void };
  onAction?: () => void;
  /** Undo snackbar: Dismiss + Undo buttons under the text; stays 8s. */
  onUndoAction?: () => void;
  /** ms before it dismisses itself. Default 6000; Infinity keeps it. */
  duration?: number;
  id?: string | number;
}
export interface ToastsApi {
  message(o: ToastOptions | string): string | number;
  success(o: ToastOptions | string): string | number;
  warning(o: ToastOptions | string): string | number;
  error(o: ToastOptions | string): string | number;
  dismiss(id: string | number): void;
  clear(): void;
}
/** Imperative API. Renders into a <Toast /> host if one is mounted, otherwise mounts one on document.body. */
export declare function useToasts(): ToastsApi;

export interface ToastData { id: string | number; message?: React.ReactNode; text?: React.ReactNode; type?: 'success' | 'error' | 'warning'; action?: string | { label: string; onClick?: () => void }; onAction?: () => void; onUndoAction?: () => void; preserve?: boolean; duration?: number }

export interface ToastProps {
  /** Controlled list. Omit it to render the useToasts() queue. */
  toasts?: ToastData[];
  onDismiss?: (id: ToastData['id']) => void;
  /** Render in place as a plain column instead of the fixed bottom-right stack. */
  inline?: boolean;
  /** Keep the stack expanded. */
  expanded?: boolean;
  className?: string;
}
export declare const Toast: ((props: ToastProps) => React.ReactElement) & { useToasts: typeof useToasts; toasts: ToastsApi };

export interface BubbleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  /** The message content. */
  children: React.ReactNode;
  /** Default 'received'. A sent bubble sits at the end of its row in the accent fill; a received one at the start in gray-100. */
  direction?: 'sent' | 'received';
  /** Default 'single'. For consecutive messages from one side: the corners on the sender's side are tighter where the bubble meets its neighbours. */
  position?: 'single' | 'first' | 'middle' | 'last';
  /** The time, drawn small and secondary after the content. */
  time?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Bubble(props: BubbleProps): React.ReactElement;

export interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  /** The code. A string with a line break renders as a block. */
  children?: React.ReactNode;
  /** Language label for a block, e.g. 'javascript'. Setting it renders a block (no colouring; use CodeBlock for that). */
  syntax?: string;
  /** Force the block layout for a single line. */
  block?: boolean;
  className?: string;
}
export declare function Code(props: CodeProps): React.ReactElement;

export interface CodeBlockOption { label: string; value: string }
export interface CodeBlockSwitcher { options: CodeBlockOption[]; value: string; onChange?: (value: string) => void }
export interface CodeBlockProps {
  /** The source code as a string. */
  children: string;
  /** js, jsx, ts, tsx, json, bash, css or diff get colour; anything else renders plain. */
  language?: string;
  /** Alias for `language`. */
  syntax?: string;
  /** Shows a header with the file name, a language icon and the copy button. */
  filename?: string;
  /** 1-based line numbers to highlight. */
  highlightedLinesNumbers?: number[];
  /** 1-based line numbers marked as added (+). */
  addedLinesNumbers?: number[];
  /** 1-based line numbers marked as removed (−). They are left out when the block is copied. */
  removedLinesNumbers?: number[];
  hideLineNumbers?: boolean;
  /** A select in the header that switches languages. */
  switcher?: CodeBlockSwitcher;
  /** Tabs above the block that switch languages, instead of the select. */
  tabs?: CodeBlockSwitcher;
  /** Accessible name of the scrollable code region. Defaults to the filename. */
  'aria-label'?: string;
  /** Prefix for line anchors (#id-L4). Generated when omitted. */
  id?: string;
  onCopy?: () => void;
  className?: string;
}
export declare const CodeBlock: ((props: CodeBlockProps) => React.ReactElement) & {
  /** The built-in tokenizer: returns [type, text] pairs. */
  tokenize(code: string, language?: string): Array<[string, string]>;
};

export interface DescriptionProps extends Omit<React.HTMLAttributes<HTMLDListElement>, 'title' | 'content'> {
  /** The key: a short Title Case noun. */
  title: React.ReactNode;
  /** The value. `children` works too. */
  content?: React.ReactNode;
  /** One-sentence definition shown from an info button next to the title. */
  tooltip?: React.ReactNode;
  /** 'horizontal' puts the title and value on one row (`term  value`). Default 'vertical' stacks them. */
  layout?: 'vertical' | 'horizontal';
  /** Horizontal layout: minimum width of the title column (px or any CSS length), so stacked descriptions line up. It sets `--hy-description-term`, which a wrapper can set once for all of them. */
  termWidth?: number | string;
  /** Right-align title and content, for the trailing column of a detail header. */
  right?: boolean;
  /** Truncate the content to one line; a string value is kept in the native title. */
  ellipsis?: boolean;
}
export declare function Description(props: DescriptionProps): React.ReactElement;

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

export interface IconProps {
  /** A Lucide icon name in kebab case: 'arrow-right', 'git-branch', 'circle-check'. Unknown names render nothing. */
  name?: string;
  /** An icon component to draw instead of a name, such as lucide-react's GitBranch. It gets size, color and a constant strokeWidth. */
  icon?: React.ElementType;
  /** Pixel size. Default 16. */
  size?: number;
  /** Visual stroke in px, kept constant across sizes. Default 1.5. */
  strokeWidth?: number;
  /** Stroke colour. Default currentColor. */
  color?: string;
  /** Accessible name. Without it the icon is decorative (aria-hidden). */
  label?: string;
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare const Icon: ((props: IconProps) => React.ReactElement | null) & { names: string[]; register(map: Record<string, string>): void };

export interface KeyboardInputProps {
  /** ⌘ on macOS, Ctrl elsewhere. */
  meta?: boolean;
  /** ⇧ on macOS, Shift elsewhere. */
  shift?: boolean;
  /** ⌥ on macOS, Alt elsewhere. */
  alt?: boolean;
  /** ⌃ on macOS, Ctrl elsewhere. */
  ctrl?: boolean;
  /** 20px tall, for dense rows such as menus and inputs. */
  small?: boolean;
  /** hyprsh: force the modifier set instead of detecting the reader's platform. */
  platform?: 'mac' | 'other';
  /** Keep it visible on touch-only devices (no hover, coarse pointer), where it is hidden by default. For when the key itself is the content, such as a keyboard-shortcuts page. */
  alwaysShow?: boolean;
  /** The one key after the modifiers. */
  children?: React.ReactNode;
  className?: string;
}
export declare function KeyboardInput(props: KeyboardInputProps): React.ReactElement;
/** Alias for the same component. */
export declare const Kbd: typeof KeyboardInput;

export interface MiddleTruncateProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The full text. The middle is replaced with “…” when it doesn't fit its container. */
  value: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function MiddleTruncate(props: MiddleTruncateProps): React.ReactElement;

export interface SnippetProps {
  /** One command, or an array for a short multi-line block. */
  text: string | string[];
  /** '$' by default; false hides it for non-shell content. */
  prompt?: string | false;
  /** Inverted: light text on a dark fill. */
  dark?: boolean;
  /** Tinted variants. 'success' is blue. */
  type?: 'default' | 'success' | 'error' | 'warning';
  /** Width of the snippet, e.g. '300px' or '100%'. Defaults to its content (fit-content). */
  width?: string | number;
  /** Controls the checkmark from outside, e.g. when a parent copies different text. */
  copied?: boolean;
  /** Plain-text clipboard payload, when it should differ from what `text` shows. */
  copyText?: string;
  /** Shown when `text` is empty. Not copied. */
  placeholder?: string;
  onCopy?: () => void;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Snippet(props: SnippetProps): React.ReactElement;

type TableAlign = 'left' | 'center' | 'right';

export interface TableColumn<R> {
  key: string;
  header: React.ReactNode;
  /** Right-aligned tabular digits. */
  numeric?: boolean;
  /** Text alignment of the column. No column aligns right unless it is `numeric` or sets this. */
  align?: TableAlign;
  mono?: boolean;
  /** Normal white-space and no max width: long text wraps (header and cells). */
  wrap?: boolean;
  /** The cells fill the remaining width and end in an ellipsis. Ignored with `wrap`. */
  truncate?: boolean;
  /** Makes the header a sort button. The app sorts `rows` itself; see `sort` and `onSortChange` on the table. */
  sortable?: boolean;
  /** Gives the header a resize handle on its trailing edge. Ignored on a `truncate` column, which takes the rest of the row. See `columnWidths` on the table. */
  resizable?: boolean;
  /** Resizable: the default width in px. Without it, the width the browser gives the column on first render, measured once. */
  width?: number;
  /** Resizable: the narrowest the column can go, in px, in place of the header content's width. Never below 48. */
  minWidth?: number;
  /** Resizable: the widest the column can go, in px. No maximum by default. */
  maxWidth?: number;
  render?: (row: R) => React.ReactNode
}

type TableSortDirection = 'ascending' | 'descending';
export interface TableSort { key: string; direction: TableSortDirection }

/** Column widths in px, keyed by column key. Holds only the columns that differ from their default, so `{}` is the default layout. */
export type TableColumnWidths = Record<string, number>;
export interface TableColumnWidthsChange {
  /** The column that changed. */
  key: string;
  /** `'drag'` while the pointer moves; `'end'` on release, on each keyboard step and on reset. */
  phase: 'drag' | 'end';
}

type TablePart<E> = React.HTMLAttributes<E> & { children?: React.ReactNode };

export interface TableBodyProps extends TablePart<HTMLTableSectionElement> {
  /** Alternate row backgrounds. */
  striped?: boolean;
  /** A divider under every row. */
  bordered?: boolean;
  /** Highlight the hovered row. */
  interactive?: boolean;
  /** Skip rendering off-screen rows (content-visibility). */
  virtualize?: boolean;
}

export interface TableRowProps extends TablePart<HTMLTableRowElement> {
  /** Marks the row as selected: `aria-selected="true"` and the menu-highlight tint. */
  selected?: boolean;
  /** Marks the row as the current one (a j/k cursor): `aria-current="true"` (or the given token) and the same tint. */
  current?: boolean | 'true' | 'page' | 'step' | 'location' | 'date' | 'time';
}
export interface TableCellProps extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: TableAlign;
  /** Normal white-space and no max width: long text wraps. */
  wrap?: boolean;
  /** Fill the remaining width and end in an ellipsis. Ignored with `wrap`. */
  truncate?: boolean;
}
export interface TableHeadProps extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, 'align'> {
  align?: TableAlign;
  wrap?: boolean;
  /** Sets `aria-sort` on the cell. Use `'none'` for a sortable column that isn't the active sort. Without it the cell has no `aria-sort`. */
  sort?: TableSortDirection | 'none';
  /** Makes the label a button that fills the cell and calls this on click, Enter and Space. The arrow is decorative: the direction is announced through `sort`. Right-aligned heads put the arrow before the label. Enter and Space on the native button fire a click whose `event.detail` is `0`, so `event.detail === 0` tells a keyboard press from a pointer click. */
  onSort?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** The truncate column's head in a resizable table: it takes the rest of the row and has no handle. */
  truncate?: boolean;
  /** Gives the head a resize handle on its trailing edge. Needs `columnKey`; the widths live on `Table` (`columnWidths`). */
  resizable?: boolean;
  /** Resizable: the key of the column's width in `columnWidths`. Required with `resizable`. */
  columnKey?: string;
  /** Resizable: the default width in px. Without it, the width the browser gives the column on first render, measured once. */
  width?: number;
  /** Resizable: the narrowest the column can go, in px, in place of the header content's width. Never below 48. */
  minWidth?: number;
  /** Resizable: the widest the column can go, in px. No maximum by default. */
  maxWidth?: number;
}

export interface TableProps<R = Record<string, unknown>> extends Omit<React.TableHTMLAttributes<HTMLTableElement>, 'rows'> {
  /** Data form: column definitions. Omit to compose the parts yourself. */
  columns?: TableColumn<R>[];
  /** Data form: one object per row, with an `id` where you have one. */
  rows?: R[];
  /** Visually hidden caption for screen readers. */
  caption?: string;
  /** Data form: message when `rows` is empty. */
  empty?: React.ReactNode;
  /** Data form: body options. */
  striped?: boolean;
  bordered?: boolean;
  interactive?: boolean;
  /** Data form: mark the rows this returns true for as `selected`. */
  isSelected?: (row: R) => boolean;
  /** Data form: mark the row this returns true for as `current`. */
  isCurrent?: (row: R) => boolean;
  /** Data form: the active sort. The table never reorders `rows`; sort them yourself and pass them back. `null` or `undefined` means no active column. */
  sort?: TableSort | null;
  /** Data form: a sortable column was clicked. A column that isn't active asks for `ascending`; the active one flips. The second argument is the button's click event; Enter and Space fire a click whose `event.detail` is `0`, so `event.detail === 0` tells a keyboard press from a pointer click. */
  onSortChange?: (next: TableSort, event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Data form: draw skeleton rows in the table's shape instead of `rows` or `empty`: `true` for 5, or a number of rows. The header stays, sortable headers go inert, the table gets `aria-busy="true"` and the caption reads "<caption>, loading" (or "Loading"). */
  loading?: boolean | number;
  /** Keep the header row visible while an ancestor scrolls (it sticks to the nearest scrolling ancestor). The wrapper then clips sideways instead of scrolling, so resizing a column stops at the container's width. */
  stickyHeader?: boolean;
  /** Resizable columns, controlled: the widths shown, keyed by column key. Only the columns that differ from their default; `{}` is the default layout. Both forms. */
  columnWidths?: TableColumnWidths;
  /** Resizable columns, uncontrolled: the starting widths. Default `{}`. */
  defaultColumnWidths?: TableColumnWidths;
  /** A column was resized or reset. Fires on every change: `phase: 'drag'` while dragging, `'end'` on release, on each keyboard step and on reset. Save the widths on `'end'`. */
  onColumnWidthsChange?: (widths: TableColumnWidths, change: TableColumnWidthsChange) => void;
  children?: React.ReactNode;
}
export declare function TableRoot(props: TablePart<HTMLDivElement>): React.ReactElement;
export declare function TableColgroup(props: React.ColgroupHTMLAttributes<HTMLTableColElement> & { children?: React.ReactNode }): React.ReactElement;
export declare function TableCol(props: React.ColHTMLAttributes<HTMLTableColElement>): React.ReactElement;
export declare function TableHeader(props: TablePart<HTMLTableSectionElement>): React.ReactElement;
export declare function TableBody(props: TableBodyProps): React.ReactElement;
export declare function TableFooter(props: TablePart<HTMLTableSectionElement>): React.ReactElement;
export interface TableSkeletonRowProps extends TablePart<HTMLTableRowElement> {
  /** Size each cell like its column: numeric columns get a short, right-aligned block, mono and truncate columns a medium one. */
  columns?: TableColumn<any>[];
  /** Without `columns`: draw this many plain cells. */
  count?: number;
  /** The row's position, so the widths of plain columns vary from row to row. Default 0. */
  index?: number;
}
export declare function TableRow(props: TableRowProps): React.ReactElement;
export declare function TableHead(props: TableHeadProps): React.ReactElement;
export declare function TableCell(props: TableCellProps): React.ReactElement;
export declare function TableSkeletonRow(props: TableSkeletonRowProps): React.ReactElement;
export declare const Table: (<R>(props: TableProps<R>) => React.ReactElement) & {
  Root: typeof TableRoot; Colgroup: typeof TableColgroup; Col: typeof TableCol; Header: typeof TableHeader; Body: typeof TableBody;
  Footer: typeof TableFooter; Row: typeof TableRow; Head: typeof TableHead; Cell: typeof TableCell; SkeletonRow: typeof TableSkeletonRow;
};

export interface TextWithCopyButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onCopy'> {
  /** What goes on the clipboard. */
  textToCopy: string;
  /** What is shown, when it differs from `textToCopy` (a shortened ID, a friendly name). Defaults to `textToCopy`. */
  textLabel?: React.ReactNode;
  /** Announced to screen readers after a copy. Defaults to “Copied to clipboard”. */
  successMessage?: string;
  /** Keep the label on one line and truncate it with an ellipsis. The full label shows as a tooltip. */
  ellipsis?: boolean;
  /** hyprsh: called with the copied text after the clipboard write succeeds. */
  onCopy?: (text: string) => void;
}
export declare function TextWithCopyButton(props: TextWithCopyButtonProps): React.ReactElement;

export interface FileTreeProps extends React.HTMLAttributes<HTMLUListElement> {
  /** FileTree.Folder and FileTree.File items. */
  children?: React.ReactNode;
}
export interface FileTreeFolderProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'onChange'> {
  name: string;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}
export interface FileTreeFileProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'type'> {
  name: string;
  /** Makes the row a link. */
  href?: string;
  /** Swaps the file icon for a function, lambda or middleware icon. */
  type?: 'file' | 'edge-function' | 'lambda' | 'middleware';
  /** hyprsh: marks the current file (aria-current="page"). */
  active?: boolean;
}
export declare const FileTree: ((props: FileTreeProps) => React.ReactElement) & {
  Folder: (props: FileTreeFolderProps) => React.ReactElement;
  File: (props: FileTreeFileProps) => React.ReactElement;
};

export type DateRangeValue = { kind: 'preset'; preset: string } | { kind: 'custom'; start: string; end: string };
export interface DateRangePreset {
  label: string;
  /** Stable key written to the URL. Defaults to `label`. */
  value?: string;
  /** Resolve the preset to concrete dates when you query. */
  range?: () => { start: Date; end: Date };
}
export interface FilterParam<V = any> {
  /** Display name, in Title Case: “Environment”. */
  key: string;
  /** URL key used by the default encode/decode. Defaults to `key`. */
  param?: string;
  type: 'select' | 'multi-select' | 'date-range';
  /** Choices for select and multi-select. */
  options?: Array<string | { value: string; label: string }>;
  /** Choices for date-range. */
  presets?: DateRangePreset[];
  /** Pill text for a value; called with undefined for the “all” row. Default “Any {key}”. */
  label?: (value: V | undefined) => string;
  /** List text for one option. */
  optionLabel?: (value: any) => string;
  /** Map a value to the URL keys this filter owns; undefined deletes a key. */
  encode?: (value: V | undefined) => Record<string, string | undefined>;
  /** Read this filter's value back from the URL. */
  decode?: (params: URLSearchParams) => V | undefined;
  /** A useful default shown as a dashed pill while this filter is unset. */
  suggestion?: () => V | undefined;
}
export interface FilterParamsAi {
  isThinking?: boolean;
  onAbort?: () => void;
  /** Called with the typed text. Return (or resolve to) params to merge into the URL. */
  onQuery?: (query: string) => void | URLSearchParams | Record<string, string> | Promise<URLSearchParams | Record<string, string> | void>;
}
export interface FilterParamsProps {
  params: FilterParam[];
  /** Controlled params. Leave unset to read and write `location.search` (other keys are kept). */
  searchParams?: URLSearchParams | string;
  onSearchParamsChange?: (next: URLSearchParams) => void;
  /** Adds a free-text option that hands the query to you. */
  ai?: FilterParamsAi;
  /** Default “Add Filter”. */
  addLabel?: string;
  /** Start with the picker open. Doesn't move focus. */
  defaultOpen?: boolean;
  'aria-label'?: string;
  className?: string;
}
export declare function useSearchParamState(): [URLSearchParams, (next: URLSearchParams) => void];
export declare function encodeDateRangeValue(value: DateRangeValue | undefined): string | undefined;
export declare function decodeDateRangeValue(value: string | null | undefined, presets?: DateRangePreset[]): DateRangeValue | undefined;
export declare function resolveDateRange(value: DateRangeValue | undefined, presets?: DateRangePreset[]): { start: Date; end: Date } | undefined;
export declare const FilterParams: ((props: FilterParamsProps) => React.ReactElement) & {
  useSearchParamState: typeof useSearchParamState;
  encodeDateRangeValue: typeof encodeDateRangeValue;
  decodeDateRangeValue: typeof decodeDateRangeValue;
  resolveDateRange: typeof resolveDateRange;
};
export declare const FilterParamsBar: typeof FilterParams;

export interface GaugeProps {
  /** 0–100. */
  value?: number;
  /** tiny 20px, small 32px, medium 64px (default), large 128px. */
  size?: 'tiny' | 'small' | 'medium' | 'large';
  /** Print the value in the centre (not on tiny). */
  showValue?: boolean;
  /** Threshold → colour ({ 0: 'var(--red-800)', 50: 'var(--green-700)' }), or explicit { primary, secondary }. Default: red below 34, amber to 66, green from 67. */
  colors?: Record<number, string> | { primary?: string; secondary?: string };
  /** 'equal' gives both arcs the same gap at each end. Default: the value arc takes its full length. */
  arcPriority?: 'default' | 'equal';
  /** Value unknown yet: a full gray ring with an activity icon. */
  indeterminate?: boolean;
  /** Replaces the centre with your own content, such as an icon. */
  children?: React.ReactNode;
  /** What the value measures, such as “Performance Score”. Default “Score”. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Gauge(props: GaugeProps): React.ReactElement;

export interface JsonViewProps {
  /** Any JSON-serialisable value. */
  data: unknown;
  /** Levels open on first render. 1 (default) opens the root and keeps its children closed; 0 closes everything. */
  defaultExpandDepth?: number;
  /** Marks matches in keys and values. Build it with makeJsonViewHighlightPattern. */
  highlightPattern?: RegExp | null;
  /** Names the tree. Defaults to “JSON”. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
/** Escapes the terms and joins them into one case-insensitive pattern. Returns null when no term is left. */
export declare function makeJsonViewHighlightPattern(terms: string | string[]): RegExp | null;
export declare const JsonView: ((props: JsonViewProps) => React.ReactElement) & {
  makeJsonViewHighlightPattern: typeof makeJsonViewHighlightPattern;
};

export interface CommandItem { label: string; onSelect?: () => void; keywords?: string[]; shortcut?: React.ReactNode; icon?: React.ReactNode; disabled?: boolean }

/** The event `CommandMenu`'s `onKeyDown` receives: a React keyboard event plus `skipMenu()`. Type-only; write a separate handler as `(e: CommandMenuKeyEvent) => void`. */
export type CommandMenuKeyEvent = React.KeyboardEvent<HTMLDivElement> & { skipMenu: () => void };

export interface CommandMenuProps {
  open: boolean;
  /** Alias for the open setter. */
  setOpen?: (open: boolean) => void;
  /** Alias of setOpen. */
  onOpenChange?: (open: boolean) => void;
  /** Compound content: CommandMenuInput + CommandMenuList. Omit to build from `groups`. */
  children?: React.ReactNode;
  /** Data shorthand, used when there are no children. */
  groups?: Array<{ heading: string; items: CommandItem[] }>;
  /** Placeholder for the shorthand's input. */
  placeholder?: string;
  /** Accessible name of the dialog. Default "Command Menu". */
  label?: string;
  /** Built-in ⌘/Ctrl + K toggle. Default true. */
  hotkey?: boolean;
  /** Render in place instead of in a portal. */
  inline?: boolean;
  /** Controlled search text. Omit for the built-in state. */
  query?: string;
  /** Called with the next search text when the user types (and with "" when the menu closes). */
  onQueryChange?: (query: string) => void;
  /** Set false to show every item in the order you render them, so the app does its own search. Default true. */
  shouldFilter?: boolean;
  /** Replaces the built-in word match. Return true to show an item. `value` is the item's `value` or text. Ignored when shouldFilter is false. */
  filter?: (item: { value: string; keywords: string[] }, query: string) => boolean;
  /**
   * Runs before the built-in arrow, Ctrl+N/P, Enter, Escape and Tab handling, for every key pressed inside the menu.
   * Call `e.skipMenu()` to skip the menu's handling of that key and leave the browser default alone (Enter and Space still
   * press a button, arrows still move between radios). `e.preventDefault()` also skips it, but cancels the default too.
   * Tab is trapped in the menu after `skipMenu()`, but not after `preventDefault()`.
   * Keys from content other than the input and the list (such as a panel in place of the list) are never handled
   * by the menu; this hook still sees them.
   */
  onKeyDown?: (e: CommandMenuKeyEvent) => void;
  /** Receives the search <input> (same element as a ref on CommandMenuInput). Use it to focus the input from outside. */
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
}
export interface CommandMenuInputProps {
  placeholder?: string;
  'aria-label'?: string;
  /** Content before the text field, e.g. a mode badge. */
  prefix?: React.ReactNode;
  /** Drop the Esc button. */
  hideClose?: boolean;
  /** `false` is the same as hideClose. */
  closeButton?: boolean;
  className?: string;
}
export interface CommandMenuListProps {
  children?: React.ReactNode;
  /** Replaces the default empty-state copy, “No results for “query”.” */
  empty?: React.ReactNode;
  /** Show a spinner row (and no empty state) while results load. Marks the list busy and announces the label politely. */
  loading?: boolean;
  /** Text of the loading row. Default "Searching…". */
  loadingLabel?: React.ReactNode;
  className?: string;
}
export interface CommandMenuGroupProps { heading?: React.ReactNode; children?: React.ReactNode; className?: string }
export interface CommandMenuItemProps {
  children: React.ReactNode;
  /** Runs on click or Enter. The menu closes first unless keepOpen. */
  callback?: () => void;
  /** Alias of callback. */
  onSelect?: () => void;
  /** Text to match against; defaults to the children's text. */
  value?: string;
  keywords?: string[];
  prefix?: React.ReactNode;
  /** Right-aligned content, usually a shortcut. */
  suffix?: React.ReactNode;
  disabled?: boolean;
  keepOpen?: boolean;
  className?: string;
}
export declare function CommandMenu(props: CommandMenuProps): React.ReactElement | null;
export declare const CommandMenuInput: React.ForwardRefExoticComponent<CommandMenuInputProps & React.RefAttributes<HTMLInputElement>>;
export declare function CommandMenuList(props: CommandMenuListProps): React.ReactElement;
export declare function CommandMenuGroup(props: CommandMenuGroupProps): React.ReactElement | null;
export declare function CommandMenuItem(props: CommandMenuItemProps): React.ReactElement | null;
export declare function CommandMenuDivider(props: { className?: string }): React.ReactElement | null;

export interface ContextCardProps {
  /** The card content: an entity name, one identifying line and 2–4 Label: value rows. */
  content: React.ReactNode;
  /** Preferred side of the trigger; flips or falls back below when it doesn't fit the screen. Default 'top'. */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Alignment along that side. Default 'center'. */
  align?: 'start' | 'center' | 'end';
  /** Element to merge the trigger behaviour onto (e.g. an <a>); `children` become its content. Default: a <div> around `children`. */
  render?: React.ReactElement;
  /** Entry delay in ms for hover and focus. Default 150. On touch, a tap opens it at once. */
  delay?: number;
  /** Show the arrow. Default true. */
  tip?: boolean;
  /** hyprsh: start open (until the pointer leaves or a tap lands outside); for docs and previews. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  /** Class on the card, which is portaled to <body> while open. */
  contentClassName?: string;
  children?: React.ReactNode;
}
/** Alias for the same component. */
export declare const ContextCardTrigger: typeof ContextCard;
export declare const ContextCard: ((props: ContextCardProps) => React.ReactElement) & { Trigger: (props: ContextCardProps) => React.ReactElement };

export interface ContextMenuProps {
  /** A ContextMenuTrigger and a ContextMenuContent. */
  children: React.ReactNode;
  /** Controlled open state. When given, right-click, long-press, Shift+F10, the Menu key, Escape, an outside click, choosing an item and page scroll only call `onOpenChange`; the menu opens and closes as this says. */
  open?: boolean;
  /** Open on mount in the middle of the trigger (docs and previews). Ignored when `open` is given. */
  defaultOpen?: boolean;
  /** Called with the next state in both modes. */
  onOpenChange?: (open: boolean) => void;
  /** Viewport point (px) the menu opens at, instead of the gesture's point. Without it, an app-opened menu uses the gesture's point, or 8px in from the trigger's top-left corner. */
  anchorPoint?: { x: number; y: number };
  className?: string;
  style?: React.CSSProperties;
}
export interface ContextMenuTriggerProps extends React.HTMLAttributes<HTMLElement> {
  /** The area that responds to right-click, long-press, Shift+F10 and the Menu key. */
  children: React.ReactNode;
  /** Element to render. Default 'div'. */
  as?: keyof JSX.IntrinsicElements;
  /** Leave the browser's own context menu alone. */
  disabled?: boolean;
}
export interface ContextMenuReaction {
  /** Passed to `onReact` when chosen. */
  value: string;
  /** The reaction's accessible name, such as 'Thumbs up'. */
  label: string;
  /** What is drawn, decorative (`aria-hidden`): an icon or a short glyph. */
  emoji: React.ReactNode;
}
export interface ContextMenuContentProps {
  /** ContextMenuItem elements, plus MenuSection and MenuDivider if needed. */
  children: React.ReactNode;
  /** A row of quick reactions drawn above the items, as a group named 'Reactions'. Left/Right move within it; Down goes to the items. */
  reactions?: ContextMenuReaction[];
  /** Called with the chosen reaction's `value`; the menu then closes. */
  onReact?: (value: string) => void;
  /** Width in px. */
  width?: number;
  /** Accessible name of the menu. Default 'Context Menu'. */
  'aria-label'?: string;
  className?: string;
}
export interface ContextMenuItemProps extends MenuItemProps {}

export declare function ContextMenu(props: ContextMenuProps): React.ReactElement;
export declare namespace ContextMenu {
  const Trigger: typeof ContextMenuTrigger;
  const Content: typeof ContextMenuContent;
  const Item: typeof ContextMenuItem;
}
export declare function ContextMenuTrigger(props: ContextMenuTriggerProps): React.ReactElement;
export declare function ContextMenuContent(props: ContextMenuContentProps): React.ReactElement | null;
export declare function ContextMenuItem(props: ContextMenuItemProps): React.ReactElement;

export interface DestructiveActionModalProps {
  open: boolean;
  /** Called by Cancel, Escape and a backdrop click (ignored while loading). */
  onCancel: () => void;
  /** Called on submit once the typed phrase matches. Close the modal yourself after the request settles. */
  onConfirm: () => void;
  /** Title Case Verb + Noun: “Delete Project”. */
  title: React.ReactNode;
  /** Sentence case; names the consequence and the resource. */
  description?: React.ReactNode;
  /** Red band naming what cannot be undone. Omit it for reversible actions. */
  irreversibleDescription?: React.ReactNode;
  /** The exact text to type before submit enables. */
  verificationPhrase?: string;
  /** Names the phrase in the prompt: “project name” → To confirm, type the project name “my-project”. */
  verificationLabel?: string;
  /** Repeats the title: “Delete Project”. */
  confirmLabel: string;
  /** Default “Cancel”. */
  cancelLabel?: string;
  /** Disables both buttons and shows a spinner on confirm. */
  loading?: boolean;
  /** Inline error under the input; the modal stays open for a retry. */
  error?: string | Error | null;
  /** Render in place instead of in a portal. */
  inline?: boolean;
}
export declare function DestructiveActionModal(props: DestructiveActionModalProps): React.ReactElement | null;

export interface DotsMenuProps {
  /** MenuItem, MenuLink, MenuItemLocked, MenuSection and MenuDivider elements. */
  children: React.ReactNode;
  /** Dot icon size in px: 10, 12 or 18 (default). The button keeps the size set by `size`. */
  iconSize?: 10 | 12 | 18;
  /** Button size. Default 'small' (32px). */
  size?: 'tiny' | 'small' | 'medium';
  disabled?: boolean;
  /** Tab order of the button. `-1` takes it out of the Tab sequence; it still opens the menu by click, and by Enter, Space or the arrow keys once focused. */
  tabIndex?: number;
  /** Called when the button receives focus. */
  onFocus?: React.FocusEventHandler<HTMLButtonElement>;
  /** Accessible name of the button; name the thing it acts on, such as 'Deployment Actions'. Default 'More Actions'. */
  'aria-label'?: string;
  /** Same as aria-label. */
  label?: string;
  /** Where the menu opens. Default 'bottom-end'. */
  position?: MenuPosition;
  /** Menu width in px. */
  width?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
}
export declare function DotsMenu(props: DotsMenuProps): React.ReactElement;

export interface DrawerProps {
  /** Whether the drawer is open. */
  show?: boolean;
  /** Alias for show. */
  open?: boolean;
  /** Called on a backdrop tap, Escape or a downward swipe. */
  onDismiss: () => void;
  /** Fixed panel height: a number in px or any CSS length. Default: fits the content, up to 90dvh. */
  height?: number | string;
  /** The panel scrolls inside its frame. Default true. */
  verticalScroll?: boolean;
  /** Name the dialog when it has no DrawerTitle. */
  'aria-label'?: string;
  /** Render in place instead of in a portal. */
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}
export interface DrawerTitleProps { className?: string; children?: React.ReactNode }
/** Labels the drawer (aria-labelledby). */
export declare function DrawerTitle(props: DrawerTitleProps): React.ReactElement;
export declare const Drawer: ((props: DrawerProps) => React.ReactElement | null) & { Title: typeof DrawerTitle };

interface MenuItemDataBase { label: string; description?: React.ReactNode; title?: string; onSelect?: () => void; shortcut?: React.ReactNode; prefix?: React.ReactNode; disabled?: boolean; danger?: boolean }
/** An item of the one-piece `items` API. With `href` it is a link, which can't be checked. */
export type MenuItemData =
  | (MenuItemDataBase & { href?: undefined; checked?: boolean; role?: 'radio' | 'checkbox' })
  | (MenuItemDataBase & { href: string; checked?: never; role?: never });

export type MenuPosition = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end';

export interface MenuProps {
  /** Compound use (inside MenuContainer): the items. */
  children?: React.ReactNode;
  /** Popup width in px. Minimum 150. */
  width?: number;
  /** Older one-piece API: the trigger text. */
  label?: React.ReactNode;
  /** Older one-piece API: the items. */
  items?: Array<MenuItemData | { separator: true }>;
  /** Older API: same as position="bottom-end". */
  align?: 'start' | 'end';
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  defaultOpen?: boolean;
  position?: MenuPosition;
  className?: string;
  'aria-label'?: string;
}
export interface MenuContainerProps {
  children: React.ReactNode;
  /** Where the menu opens; it flips when the window is too small. Default 'bottom-start'. */
  position?: MenuPosition;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Open at a viewport point instead of beside the trigger (ContextMenu uses this). */
  anchorPoint?: { x: number; y: number };
  className?: string;
  style?: React.CSSProperties;
}
export interface MenuButtonProps extends Omit<ButtonProps, 'type'> {
  /** 'unstyled' wraps custom content (an avatar) in a bare button; otherwise a Button variant. */
  type?: 'unstyled' | ButtonProps['variant'];
  showChevron?: boolean;
}
export interface MenuItemProps {
  /** Renders the item as a link. A link can't be checked: use `MenuItem` without `href` for a checked item. */
  href?: string;
  /** Shows a checkmark when true and keeps its space when false. Makes the item a `menuitemcheckbox` (or a `menuitemradio` with `role="radio"`) with `aria-checked`. Undefined: a plain `menuitem`. Ignored with `href`. */
  checked?: boolean;
  /** 'radio' makes a checked item a `menuitemradio`; choosing it closes the menu. A checkbox item (the default) stays open when chosen, with focus on it. Ignored without `checked`. */
  role?: 'radio' | 'checkbox';
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent | React.KeyboardEvent) => void;
  /** Called with `value` when the item is chosen. */
  onSelect?: (value?: string) => void;
  value?: string;
  target?: string;
  rel?: string;
  /** Disabled items can't be activated (`aria-disabled`). One with a `description` still takes focus from the arrow keys, Home/End and typeahead so its reason can be read. */
  disabled?: boolean;
  /** A second line of hint text under the label, linked with aria-describedby. Use it to say why an item is disabled. */
  description?: React.ReactNode;
  /** Native tooltip (the `title` attribute) for the item. */
  title?: string;
  /** 'error' for destructive items. */
  type?: 'default' | 'error';
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  shortcut?: React.ReactNode;
  className?: string;
}
export interface MenuSectionProps { title: React.ReactNode; children: React.ReactNode }

export declare function Menu(props: MenuProps): React.ReactElement;
export declare namespace Menu {
  const Container: typeof MenuContainer;
  const Button: typeof MenuButton;
  const Item: typeof MenuItem;
  const Link: typeof MenuLink;
  const ItemLocked: typeof MenuItemLocked;
  const Section: typeof MenuSection;
  const Divider: typeof MenuDivider;
}
export declare function MenuContainer(props: MenuContainerProps): React.ReactElement;
export declare const MenuButton: React.ForwardRefExoticComponent<MenuButtonProps & React.RefAttributes<HTMLButtonElement>>;
export declare function MenuItem(props: Omit<MenuItemProps, 'href'> & { href?: undefined }): React.ReactElement;
export declare function MenuItem(props: Omit<MenuItemProps, 'checked' | 'role'> & { href: string; checked?: never; role?: never }): React.ReactElement;
export declare function MenuLink(props: Omit<MenuItemProps, 'href' | 'checked' | 'role'> & { href: string; checked?: never; role?: never }): React.ReactElement;
/** A permission-gated item: disabled, with a lock. */
export declare function MenuItemLocked(props: MenuItemProps): React.ReactElement;
export declare function MenuSection(props: MenuSectionProps): React.ReactElement;
export declare function MenuDivider(): React.ReactElement;

export interface ModalProps {
  /** Alias for `open`. */
  active?: boolean;
  /** Alias of `active`. */
  open?: boolean;
  /** Called on a backdrop click (and on Escape when `onClose` is not set). */
  onClickOutside?: () => void;
  /** Called on Escape (and on a backdrop click when `onClickOutside` is not set). */
  onClose?: () => void;
  /** Keeps the header pinned while the body scrolls. The actions are always pinned. */
  sticky?: boolean;
  /** Element to focus on open, e.g. the Cancel action of a destructive modal. */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /** Alias of `initialFocusRef`. */
  initialFocus?: React.RefObject<HTMLElement>;
  /** Shorthand: renders ModalBody > ModalHeader > ModalTitle. */
  title?: React.ReactNode;
  /** Shorthand: renders ModalSubtitle. */
  description?: React.ReactNode;
  /** Shorthand: renders ModalActions around these buttons. */
  actions?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  /** role="alertdialog" for destructive confirmations. */
  alert?: boolean;
  /** Render in place instead of in a portal on document.body. */
  inline?: boolean;
  className?: string;
  'aria-label'?: string;
  children?: React.ReactNode;
}
export interface ModalPartProps { className?: string; children?: React.ReactNode }
export interface ModalInsetProps extends ModalPartProps { /** Flush with the actions footer. */ last?: boolean }
export interface ModalActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Default 'primary'. Use 'secondary' for Cancel. */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'warning';
  fullWidth?: boolean;
  loading?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}
export declare function ModalBody(props: ModalPartProps & React.HTMLAttributes<HTMLDivElement>): React.ReactElement;
export declare function ModalHeader(props: ModalPartProps): React.ReactElement;
export declare function ModalTitle(props: ModalPartProps): React.ReactElement;
export declare function ModalSubtitle(props: ModalPartProps): React.ReactElement;
export declare function ModalInset(props: ModalInsetProps): React.ReactElement;
export declare function ModalActions(props: ModalPartProps): React.ReactElement;
export declare const ModalAction: React.ForwardRefExoticComponent<ModalActionProps & React.RefAttributes<HTMLButtonElement>>;
export declare const Modal: ((props: ModalProps) => React.ReactElement | null) & {
  Body: typeof ModalBody; Header: typeof ModalHeader; Title: typeof ModalTitle; Subtitle: typeof ModalSubtitle;
  Inset: typeof ModalInset; Actions: typeof ModalActions; Action: typeof ModalAction;
};

export interface PopoverProps {
  /** The element that opens the popover, usually a Button. It gets `aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`, a toggling `onClick` and the ref used to place the box. Text becomes a secondary Button. */
  trigger: React.ReactNode;
  /** The content, or a function receiving `{ close }` (closes and returns focus to the trigger). */
  children?: React.ReactNode | ((api: { close: () => void }) => React.ReactNode);
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Side and alignment of the box. It flips when there is no room. Default 'bottom-start'. */
  position?: MenuPosition | 'bottom-center' | 'top-center';
  /** Accessible name of the dialog. Give this or `aria-labelledby`. */
  label?: string;
  'aria-labelledby'?: string;
  /** Box width in px or CSS. Default fits the content, 200 to 360px. */
  width?: number | string;
  /** Element to focus on open. Default: `[data-autofocus]`, else the first focusable element, else the box. */
  initialFocusRef?: React.RefObject<HTMLElement>;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Popover(props: PopoverProps): React.ReactElement;

export interface RelativeTimeCardProps {
  /** The timestamp: Unix ms, a Date or an ISO string. Don't pre-format it. */
  date: number | Date | string;
  /** Side of the trigger. Default 'top'. */
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  /** BCP 47 locale for the Intl formatters. Default: the browser's. */
  locale?: string;
  /** Trigger. Default: the short relative time (2m ago, 5h ago, Yesterday) in a <time>. Use only for non-time labels or a custom trigger. */
  children?: React.ReactNode;
  /** hyprsh: start open; for docs and previews. */
  defaultOpen?: boolean;
  className?: string;
}
export declare function RelativeTimeCard(props: RelativeTimeCardProps): React.ReactElement;

export interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Dims the page, traps focus and locks scroll. Default false: the page stays usable. */
  modal?: boolean;
  /** Render the content in place instead of in a portal. */
  inline?: boolean;
  children?: React.ReactNode;
}
export interface SheetSlotProps {
  /** Merge the behaviour onto the single child element instead of rendering a <button>. */
  asChild?: boolean;
  className?: string;
  children?: React.ReactNode;
}
export interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Edge the panel slides in from. Default 'right'. */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Hide the backdrop of a modal sheet. Default false. */
  noOverlay?: boolean;
  /** hyprsh: inset 12px from the edges with radius-2xl and the fullscreen shadow; the parts get their own padding. */
  floating?: boolean;
}
export interface SheetPartProps { className?: string; children?: React.ReactNode }
export declare function SheetTrigger(props: SheetSlotProps): React.ReactElement;
export declare function SheetClose(props: SheetSlotProps): React.ReactElement;
export declare function SheetContent(props: SheetContentProps): React.ReactElement | null;
export declare function SheetHeader(props: SheetPartProps): React.ReactElement;
export declare function SheetFooter(props: SheetPartProps): React.ReactElement;
export declare function SheetTitle(props: SheetPartProps): React.ReactElement;
export declare function SheetDescription(props: SheetPartProps): React.ReactElement;
export declare const Sheet: ((props: SheetProps) => React.ReactElement) & {
  Trigger: typeof SheetTrigger; Close: typeof SheetClose; Content: typeof SheetContent; Header: typeof SheetHeader;
  Footer: typeof SheetFooter; Title: typeof SheetTitle; Description: typeof SheetDescription;
};

export interface TooltipProps {
  /** The tooltip content: one short sentence or fragment. */
  text: React.ReactNode;
  /** Side of the trigger. Default 'top'. */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Alignment along that side: start, centre or end edge. Default 'center'. */
  boxAlign?: 'left' | 'center' | 'right';
  /** Entry delay: true/undefined = 150ms, false = none, or a number of ms. */
  delay?: boolean | number;
  /** Solid colour variant. */
  type?: 'default' | 'success' | 'error' | 'warning' | 'violet';
  /** Show the arrow. Default true. */
  tip?: boolean;
  /** Centre the text. Default true. */
  center?: boolean;
  /** hyprsh: start open (until the pointer leaves); for docs and previews. */
  defaultOpen?: boolean;
  /** The trigger. A single element gets aria-describedby; plain text is wrapped in a focusable span. */
  children: React.ReactNode;
  className?: string;
}
export declare function Tooltip(props: TooltipProps): React.ReactElement;

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

/** A scalar, or one value per breakpoint (container width: md >= 600px, lg >= 960px). Missing breakpoints fall back to the one below. */
export type GridResponsive<T> = T | { sm?: T; md?: T; lg?: T };

export interface GridSystemProps {
  /** Guide stroke in px. Default 1. */
  guideWidth?: number;
  dashedGuides?: boolean;
  /** Draws the guides in amber, for checking a layout. */
  debug?: boolean;
  /** Accepted for compatibility; Grid always measures its own container. */
  unstable_useContainer?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface GridProps {
  columns?: GridResponsive<number>;
  rows?: GridResponsive<number>;
  /** "preserve-aspect-ratio" makes every track square. */
  height?: 'auto' | 'preserve-aspect-ratio';
  hideGuides?: 'row' | 'column';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface GridCellProps {
  /** CSS grid-column value, e.g. 2 or "1/3" or "1/-1". Omit to auto-flow. */
  column?: GridResponsive<number | string>;
  row?: GridResponsive<number | string>;
  /** Paints the cell so it hides the guides it overlaps. */
  solid?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface GridCrossProps {
  /** 1-based grid line: a 3-column grid has column lines 1–4. */
  column?: number;
  row?: number;
  className?: string;
}

export declare function GridSystem(props: GridSystemProps): React.ReactElement;
export declare function GridCell(props: GridCellProps): React.ReactElement;
export declare function GridCross(props: GridCrossProps): React.ReactElement;
export declare const Grid: ((props: GridProps) => React.ReactElement) & {
  System: typeof GridSystem;
  Cell: typeof GridCell;
  Cross: typeof GridCross;
};

export interface ScrollerProps {
  /** Scroll axis. Default "y". */
  overflow?: 'x' | 'y' | 'both';
  /** Number (px) or any CSS length. */
  width?: number | string;
  height?: number | string;
  /** Adds buttons that step to the previous or next direct child: up/down above a vertical scroller, left/right below a horizontal one. */
  withButtons?: boolean;
  /** Class for the element that wraps children (it is a flex row for "x", a column for "y"). */
  childrenContainerClassName?: string;
  /** Names the scroll region, and is folded into the button labels (“Scroll Deployments Right”). */
  'aria-label'?: string;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Scroller(props: ScrollerProps): React.ReactElement;

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Default 'horizontal'. A vertical separator stretches to its flex row's height. */
  orientation?: 'horizontal' | 'vertical';
  /** Stronger line, inset 1px, for dividing a framed card edge to edge. */
  inset?: boolean;
  /** Purely visual: drops the separator role (same as aria-hidden). */
  decorative?: boolean;
}
export declare function Separator(props: SeparatorProps): React.ReactElement;

export interface ShowMoreProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Controlled state. Pass it with onClick, or with onChange. */
  expanded?: boolean;
  /** hyprsh: uncontrolled starting state. */
  defaultExpanded?: boolean;
  /** hyprsh: called with the next state on every toggle. */
  onChange?: (expanded: boolean) => void;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Hides the divider lines on either side. */
  noBorder?: boolean;
  /** hyprsh: number of hidden items, shown as “Show 12 More”. */
  count?: number;
  /** hyprsh: replace “Show More” / “Show Less”. */
  moreLabel?: string;
  lessLabel?: string;
  /** Point it at the list it reveals. */
  'aria-controls'?: string;
}
export declare function ShowMore(props: ShowMoreProps): React.ReactElement;

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'title'> {
  /** Diameter in px. Default 32. */
  size?: number;
  /** The entity's name (person, team, project): the accessible name and native tooltip. */
  title?: string;
  /** Handle used as the name when `title` is absent; also seeds the gradient shape. Nothing is fetched. */
  username?: string;
  /** One or two initials, upper-cased. Wins over `placeholder`. */
  letter?: string;
  /** Blank grey shell for loading states. */
  placeholder?: boolean;
  /** An image you host. Without it the avatar shows initials or a generated gradient. */
  src?: string;
  alt?: string;
  /** Draws a status dot in the bottom-right corner and adds the state to the accessible name (“Ada Lovelace, online”). Not supported on `Avatar.Group` or `Avatar.WithIcon`. */
  presence?: 'online' | 'away' | 'offline';
}
export interface AvatarGroupMember { username?: string; title?: string; letter?: string; src?: string; placeholder?: boolean }
export interface AvatarGroupProps {
  members: AvatarGroupMember[];
  /** Diameter of each avatar in px. Default 32. */
  size?: number;
  /** Show at most this many, then a “+N” counter. */
  limit?: number;
  /** Overlap in px, or 'auto' (default) to scale with size. */
  overlap?: number | 'auto';
  /** Put the last member on top instead of the first. */
  reverse?: boolean;
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export interface AvatarWithIconProps extends Omit<AvatarProps, 'presence'> {
  /** Small status icon in the bottom-left corner. */
  icon: React.ReactNode;
  /** Put the icon on a background disc so it reads over the avatar. */
  iconBackground?: boolean;
}
export declare function AvatarGroup(props: AvatarGroupProps): React.ReactElement;
export declare function AvatarWithIcon(props: AvatarWithIconProps): React.ReactElement;
export declare const Avatar: ((props: AvatarProps) => React.ReactElement) & { Group: typeof AvatarGroup; WithIcon: typeof AvatarWithIcon };

export interface BrowserProps {
  /** Full URL. The bar shows it without the protocol or “www.”, and its copy button copies it whole. Omit to hide the address bar. */
  address?: string;
  /** The page inside the frame: usually an <img> or <video> with real alt text. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Browser(props: BrowserProps): React.ReactElement;

export interface LogoProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** lockup (mark + wordmark, default), mark alone, or wordmark alone. */
  variant?: 'lockup' | 'mark' | 'wordmark';
  /** Mark height in px; the wordmark scales with it. Default 24. */
  size?: number;
  /** accent (the blue mark, default) or mono (currentColor, for one-colour print, favicons on tinted chrome and dense UI). 'nebula' is the old name of accent. */
  tone?: 'accent' | 'mono' | 'nebula';
  /** Accessible name. Default "hyprsh". */
  'aria-label'?: string;
}
export declare function Logo(props: LogoProps): React.ReactElement;

export interface PhoneProps {
  /** URL shown in the mobile browser toolbar, without protocol or “www.”. Omit for an app screen with no toolbar. */
  address?: string;
  /** Screen content, usually an <img> or <video> filling the screen. Without it the screen shows a neutral placeholder. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Phone(props: PhoneProps): React.ReactElement;

export interface VideoProps {
  /** URL of the video file. Without it the player draws a placeholder poster and its controls stay disabled. */
  src?: string;
  /** Width in px (number) or any CSS length. With a numeric height too, the pair sets the aspect ratio; otherwise it's 16:9. */
  width?: number | string;
  /** Height in px (number) or any CSS length. */
  height?: number | string;
  /** Load the file only once the player is within 200px of the viewport. Default true. */
  lazy?: boolean;
  /** Default true. */
  loop?: boolean;
  /** Show the play/pause, time and seek bar. Default true. */
  controls?: boolean;
  /** Default true. Autoplay only works muted. */
  muted?: boolean;
  /** Start playing once loaded. Default true, but never when the reader prefers reduced motion. */
  autoPlay?: boolean;
  /** Image shown before the file loads. */
  poster?: string;
  /** Default true, so iOS doesn't open the clip full screen. */
  playsInline?: boolean;
  /** Describes what the clip shows. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Video(props: VideoProps): React.ReactElement;

export interface WaveformProps {
  /** One bar per entry, from 0 (silent, still drawn as a minimal bar) to 1 (loudest). Values outside 0–1 are clamped. */
  levels: number[];
  /** How much has played, 0–1 (clamped). Bars up to that fraction use the played colour. Default 0. */
  progress?: number;
  /** Height in px. Default 32. It always fills the width of its container. */
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Waveform(props: WaveformProps): React.ReactElement;

declare global {
  interface Window {
    Hyprsh: {
      Button: typeof Button;
      CopyButton: typeof CopyButton;
      LoadMoreButton: typeof LoadMoreButton;
      SplitButton: typeof SplitButton;
      AddressInput: typeof AddressInput;
      Calendar: typeof Calendar;
      Checkbox: typeof Checkbox;
      Choicebox: typeof Choicebox;
      ClearableInput: typeof ClearableInput;
      Combobox: typeof Combobox;
      Feedback: typeof Feedback;
      Fieldset: typeof Fieldset;
      FilterMenu: typeof FilterMenu;
      Input: typeof Input;
      Label: typeof Label;
      MultiSelect: typeof MultiSelect;
      QueryBar: typeof QueryBar;
      QueryHelpButton: typeof QueryHelpButton;
      QueryInput: typeof QueryInput;
      Radio: typeof Radio;
      SearchInput: typeof SearchInput;
      Select: typeof Select;
      Slider: typeof Slider;
      Switch: typeof Switch;
      Textarea: typeof Textarea;
      ThemeSwitcher: typeof ThemeSwitcher;
      Toggle: typeof Toggle;
      Breadcrumbs: typeof Breadcrumbs;
      CommandMenuTrigger: typeof CommandMenuTrigger;
      Link: typeof Link;
      NavList: typeof NavList;
      Pager: typeof Pager;
      Pagination: typeof Pagination;
      TabBar: typeof TabBar;
      Tabs: typeof Tabs;
      Badge: typeof Badge;
      Pill: typeof Pill;
      StatusDot: typeof StatusDot;
      Banner: typeof Banner;
      EmptyState: typeof EmptyState;
      Error: typeof Error;
      ErrorCard: typeof ErrorCard;
      LoadingDots: typeof LoadingDots;
      Note: typeof Note;
      Progress: typeof Progress;
      ProjectBanner: typeof ProjectBanner;
      Skeleton: typeof Skeleton;
      Spinner: typeof Spinner;
      Toast: typeof Toast;
      Bubble: typeof Bubble;
      Code: typeof Code;
      CodeBlock: typeof CodeBlock;
      Description: typeof Description;
      Entity: typeof Entity;
      Icon: typeof Icon;
      KeyboardInput: typeof KeyboardInput;
      MiddleTruncate: typeof MiddleTruncate;
      Snippet: typeof Snippet;
      Table: typeof Table;
      TextWithCopyButton: typeof TextWithCopyButton;
      FileTree: typeof FileTree;
      FilterParams: typeof FilterParams;
      Gauge: typeof Gauge;
      JsonView: typeof JsonView;
      CommandMenu: typeof CommandMenu;
      ContextCard: typeof ContextCard;
      ContextMenu: typeof ContextMenu;
      DestructiveActionModal: typeof DestructiveActionModal;
      DotsMenu: typeof DotsMenu;
      Drawer: typeof Drawer;
      Menu: typeof Menu;
      Modal: typeof Modal;
      Popover: typeof Popover;
      RelativeTimeCard: typeof RelativeTimeCard;
      Sheet: typeof Sheet;
      Tooltip: typeof Tooltip;
      Collapse: typeof Collapse;
      Grid: typeof Grid;
      Scroller: typeof Scroller;
      Separator: typeof Separator;
      ShowMore: typeof ShowMore;
      Avatar: typeof Avatar;
      Browser: typeof Browser;
      Logo: typeof Logo;
      Phone: typeof Phone;
      Video: typeof Video;
      Waveform: typeof Waveform;
    };
  }
}

