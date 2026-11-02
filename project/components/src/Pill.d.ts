export interface PillProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'> {
  /** Renders an <a>. Without href, onClick renders a <button>; neither renders a static <span>. */
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** sm 20px, md 24px (default), lg 32px. small | medium | large also work. */
  size?: 'sm' | 'md' | 'lg' | Size;
  /** Leading icon or logo; sized to the pill (12/14/16px). */
  icon?: React.ReactNode;
  /**
   * A state dot before the label, scaled to the pill size (a StatusDot state). It takes the icon's place: with both, `status` wins.
   * The dot is always hidden from assistive tech, so `statusLabel` is the only way the state is spoken.
   */
  status?: StatusDotState;
  /** What the dot means in words, such as `Downloading`. It is part of the pill's accessible name after the label ("STD, Downloading"); the dot itself is always hidden from it. */
  statusLabel?: string;
  /** A figure after the label, in tabular numbers and a quieter colour: `54/56`, `40%`. It is part of the accessible name as text. */
  trailing?: React.ReactNode;
  /** Makes the pill a toggle chip: a <button> with `aria-pressed`. Controlled state. Several chips can be on at once. */
  pressed?: boolean;
  /** Toggle chip, uncontrolled initial state. */
  defaultPressed?: boolean;
  /** Toggle chip: called with the next state when it is clicked. Giving this, `pressed` or `defaultPressed` makes a toggle. */
  onPressedChange?: (pressed: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}
/**
 * Forwards its ref to the rendered `<a>`, `<button>` or `<span>`, so it works as a `Popover` trigger. A pill with `aria-expanded="true"` is drawn in the pressed style, without the check.
 */
export declare const Pill: React.ForwardRefExoticComponent<PillProps & React.RefAttributes<HTMLElement>>;
