export interface MenuItemData { label: string; onSelect?: () => void; shortcut?: React.ReactNode; prefix?: React.ReactNode; disabled?: boolean; danger?: boolean; href?: string }

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
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent | React.KeyboardEvent) => void;
  /** Called with `value` when the item is chosen. */
  onSelect?: (value?: string) => void;
  value?: string;
  /** Renders the item as a link. */
  href?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
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
export declare function MenuItem(props: MenuItemProps): React.ReactElement;
export declare function MenuLink(props: MenuItemProps & { href: string }): React.ReactElement;
/** A permission-gated item: disabled, with a lock. */
export declare function MenuItemLocked(props: MenuItemProps): React.ReactElement;
export declare function MenuSection(props: MenuSectionProps): React.ReactElement;
export declare function MenuDivider(): React.ReactElement;
