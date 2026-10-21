export interface BookProps {
  title: React.ReactNode;
  /** "stripe" (default): a colour band over a neutral body with the title and icon. "simple": one colour, title on top, illustration below. */
  variant?: 'stripe' | 'simple';
  /** Cover colour; pass a token such as "var(--red-800)". Default amber-600 for stripe, gray-100 for simple. */
  color?: string;
  /** Title colour. Default gray-1000. */
  textColor?: string;
  /** Small mark under the title (stripe). Default a book glyph; pass null for none. */
  icon?: React.ReactNode;
  /** Art for the band (stripe) or under the title (simple). */
  illustration?: React.ReactNode;
  /** Cover width in px (number or CSS length), or per breakpoint { sm, md, lg } (viewport md >= 600px, lg >= 960px). Default 196. Height follows at 49:60. */
  width?: number | string | { sm?: number | string; md?: number | string; lg?: number | string };
  /** Adds a cloth weave to the cover. */
  textured?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Book(props: BookProps): React.ReactElement;
