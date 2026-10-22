export interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'color'> {
  /** Element to render. 'a' (default) navigates; 'button' is an action that looks like a link. */
  as?: 'a' | 'button';
  /** For as="button": the native disabled state. For an anchor it removes the href and sets aria-disabled. */
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
  type?: 'button' | 'submit' | 'reset';
  children?: React.ReactNode;
  className?: string;
}
export declare const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement & HTMLButtonElement>>;
