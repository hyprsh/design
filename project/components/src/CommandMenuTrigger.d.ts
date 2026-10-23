export interface CommandMenuTriggerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'prefix' | 'type'> {
  /** The label, also the accessible name. Default "Search…". */
  children?: React.ReactNode;
  /** medium 36px (default), small 32px. Matches Input; both are 44px under touch sizing. */
  size?: 'small' | 'medium';
  /** Before the label. Defaults to the search icon; null or false hides it. */
  prefix?: React.ReactNode;
  /** After the label, hidden from screen readers. Defaults to a ⌘K key; false hides it, any node replaces it. */
  shortcut?: React.ReactNode;
}
export declare const CommandMenuTrigger: React.ForwardRefExoticComponent<CommandMenuTriggerProps & React.RefAttributes<HTMLButtonElement>>;
