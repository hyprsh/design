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
