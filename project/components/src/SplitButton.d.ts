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
