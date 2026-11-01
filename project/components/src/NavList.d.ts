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
