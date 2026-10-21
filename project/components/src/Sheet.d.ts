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
