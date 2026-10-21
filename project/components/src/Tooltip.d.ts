export interface TooltipProps {
  /** The tooltip content: one short sentence or fragment. */
  text: React.ReactNode;
  /** Side of the trigger. Default 'top'. */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Alignment along that side: start, centre or end edge. Default 'center'. */
  boxAlign?: 'left' | 'center' | 'right';
  /** Entry delay: true/undefined = 150ms, false = none, or a number of ms. */
  delay?: boolean | number;
  /** Solid colour variant. */
  type?: 'default' | 'success' | 'error' | 'warning' | 'violet';
  /** Show the arrow. Default true. */
  tip?: boolean;
  /** Centre the text. Default true. */
  center?: boolean;
  /** hyprsh: start open (until the pointer leaves); for docs and previews. */
  defaultOpen?: boolean;
  /** The trigger. A single element gets aria-describedby; plain text is wrapped in a focusable span. */
  children: React.ReactNode;
  className?: string;
}
export declare function Tooltip(props: TooltipProps): React.ReactElement;
