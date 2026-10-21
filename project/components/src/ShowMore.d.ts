export interface ShowMoreProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  /** Controlled state. Pass it with onClick, as in Geist, or with onChange. */
  expanded?: boolean;
  /** hyprsh: uncontrolled starting state. */
  defaultExpanded?: boolean;
  /** hyprsh: called with the next state on every toggle. */
  onChange?: (expanded: boolean) => void;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Hides the divider lines on either side. */
  noBorder?: boolean;
  /** hyprsh: number of hidden items, shown as “Show 12 More”. */
  count?: number;
  /** hyprsh: replace “Show More” / “Show Less”. */
  moreLabel?: string;
  lessLabel?: string;
  /** Point it at the list it reveals. */
  'aria-controls'?: string;
}
export declare function ShowMore(props: ShowMoreProps): React.ReactElement;
