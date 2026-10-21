export interface BadgeProps {
  /** Default 'gray'. Solid for the one key status; '-subtle' (or contrast="low") in dense UI. */
  variant?: Hue | `${Hue}-subtle` | 'inverted' | 'trial' | 'turbo' | 'pill';
  /** 'low' turns a solid hue into its subtle tint. */
  contrast?: 'low' | 'high';
  /** sm 20px, md 24px (default), lg 32px. small | medium | large also work. */
  size?: 'sm' | 'md' | 'lg' | Size;
  /** Leading icon; sized to the badge (12/14/16px). */
  icon?: React.ReactNode;
  /** Accessible description for ambiguous or icon-led badges. */
  title?: string;
  translate?: 'yes' | 'no';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): React.ReactElement;
