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
