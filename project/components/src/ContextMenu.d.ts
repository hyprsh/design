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
export interface ContextMenuContentProps {
  /** ContextMenuItem elements, plus MenuSection and MenuDivider if needed. */
  children: React.ReactNode;
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
