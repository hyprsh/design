export interface DotsMenuProps {
  /** MenuItem, MenuLink, MenuItemLocked, MenuSection and MenuDivider elements. */
  children: React.ReactNode;
  /** Dot icon size in px: 10, 12 or 18 (default). The button stays 32px. */
  iconSize?: 10 | 12 | 18;
  /** Button size. Default 'small' (32px). */
  size?: 'tiny' | 'small' | 'medium';
  disabled?: boolean;
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
