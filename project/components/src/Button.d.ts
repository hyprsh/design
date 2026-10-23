export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'prefix'> {
  /** Default 'secondary'. 'default' and 'primary' are the same solid fill: one per view. */
  variant?: 'default' | 'primary' | 'secondary' | 'tertiary' | 'error' | 'warning';
  /** tiny 24px (icon only), small 32px, medium 36px (default), large 40px. */
  size?: 'tiny' | Size;
  /** 'rounded' is a pill; 'circle' is for svgOnly buttons. */
  shape?: 'square' | 'rounded' | 'circle';
  /** Raised look (shadow-small), usually with shape="rounded" on marketing pages. */
  shadow?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** Shows a spinner in place of the prefix, keeps the label and disables the button. */
  loading?: boolean;
  /** Icon-only button: pass the icon as children and an aria-label. */
  svgOnly?: boolean;
  /** HTML type ('button' by default). */
  typeName?: 'button' | 'submit' | 'reset';
  /** HTML type, or a visual variant name (the older API). Prefer `variant` + `typeName`. */
  type?: 'button' | 'submit' | 'reset' | 'default' | 'primary' | 'secondary' | 'tertiary' | 'error' | 'warning';
  /** Renders an `<a>` instead of a `<button>`, as ButtonLink does. */
  href?: string;
  width?: number | string;
}
export interface ButtonLinkProps extends Omit<ButtonProps, 'href'>, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'type' | 'prefix'> {
  href: string;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>> & {
  Link: React.ForwardRefExoticComponent<ButtonLinkProps & React.RefAttributes<HTMLAnchorElement>>;
};
export declare const ButtonLink: React.ForwardRefExoticComponent<ButtonLinkProps & React.RefAttributes<HTMLAnchorElement>>;
