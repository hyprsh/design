export interface ContextCardProps {
  /** The card content: an entity name, one identifying line and 2–4 Label: value rows. */
  content: React.ReactNode;
  /** Side of the trigger. Default 'top'. */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Alignment along that side. Default 'center'. */
  align?: 'start' | 'center' | 'end';
  /** Element to merge the trigger behaviour onto (e.g. an <a>); `children` become its content. Default: a <div> around `children`. */
  render?: React.ReactElement;
  /** Entry delay in ms. Default 150. */
  delay?: number;
  /** Show the arrow. Default true. */
  tip?: boolean;
  /** hyprsh: start open (until the pointer leaves); for docs and previews. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  contentClassName?: string;
  children?: React.ReactNode;
}
/** Geist's name for the same component. */
export declare const ContextCardTrigger: typeof ContextCard;
export declare const ContextCard: ((props: ContextCardProps) => React.ReactElement) & { Trigger: (props: ContextCardProps) => React.ReactElement };
