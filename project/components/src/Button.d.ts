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
  /** A badge pinned to the button's corner: `true` is a dot, a number a count ("99+" above 99, nothing for 0), a node is rendered as given. Same as on `TabBar.Item`. */
  badge?: boolean | number | React.ReactNode;
  /** The colour of a dot or count badge: `'accent'` (default), `'error'` (red) or `'warning'` (amber). It is visual only and a node badge ignores it, so say the tone in `badgeLabel` ("2 blocking"). */
  badgeTone?: 'accent' | 'error' | 'warning';
  /** Accessible text for the badge ("3 need attention"). It joins the button's accessible name; a count with no `badgeLabel` adds its number. */
  badgeLabel?: string;
}
export interface ButtonLinkProps extends Omit<ButtonProps, 'href'>, Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'type' | 'prefix'> {
  href: string;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>> & {
  Link: React.ForwardRefExoticComponent<ButtonLinkProps & React.RefAttributes<HTMLAnchorElement>>;
};
export declare const ButtonLink: React.ForwardRefExoticComponent<ButtonLinkProps & React.RefAttributes<HTMLAnchorElement>>;
