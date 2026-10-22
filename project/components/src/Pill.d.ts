export interface PillProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'> {
  /** Renders an <a>. Without href, onClick renders a <button>; neither renders a static <span>. */
  href?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
  /** sm 20px, md 24px (default), lg 32px. small | medium | large also work. */
  size?: 'sm' | 'md' | 'lg' | Size;
  /** Leading icon or logo; sized to the pill (12/14/16px). */
  icon?: React.ReactNode;
  /** Makes the pill a toggle chip: a <button> with `aria-pressed`. Controlled state. Several chips can be on at once. */
  pressed?: boolean;
  /** Toggle chip, uncontrolled initial state. */
  defaultPressed?: boolean;
  /** Toggle chip: called with the next state when it is clicked. Giving this, `pressed` or `defaultPressed` makes a toggle. */
  onPressedChange?: (pressed: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}
export declare function Pill(props: PillProps): React.ReactElement;
