export interface CommandItem { label: string; onSelect?: () => void; keywords?: string[]; shortcut?: React.ReactNode; icon?: React.ReactNode; disabled?: boolean }

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
  className?: string;
}
export interface CommandMenuInputProps { placeholder?: string; 'aria-label'?: string; className?: string }
export interface CommandMenuListProps { children?: React.ReactNode; /** Replaces the default empty-state copy. */ empty?: React.ReactNode; className?: string }
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
export declare function CommandMenuInput(props: CommandMenuInputProps): React.ReactElement;
export declare function CommandMenuList(props: CommandMenuListProps): React.ReactElement;
export declare function CommandMenuGroup(props: CommandMenuGroupProps): React.ReactElement | null;
export declare function CommandMenuItem(props: CommandMenuItemProps): React.ReactElement | null;
export declare function CommandMenuDivider(props: { className?: string }): React.ReactElement | null;
