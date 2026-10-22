export interface CommandItem { label: string; onSelect?: () => void; keywords?: string[]; shortcut?: React.ReactNode; icon?: React.ReactNode; disabled?: boolean }

/** The event `CommandMenu`'s `onKeyDown` receives: a React keyboard event plus `skipMenu()`. Type-only; write a separate handler as `(e: CommandMenuKeyEvent) => void`. */
export type CommandMenuKeyEvent = React.KeyboardEvent<HTMLDivElement> & { skipMenu: () => void };

export interface CommandMenuProps {
  open: boolean;
  /** Geist name for the open setter. */
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
