export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'title'> {
  /** Diameter in px. Default 32. */
  size?: number;
  /** The entity's name (person, team, project): the accessible name and native tooltip. */
  title?: string;
  /** Handle used as the name when `title` is absent; also seeds the gradient shape. Nothing is fetched. */
  username?: string;
  /** One or two initials, upper-cased. Wins over `placeholder`. */
  letter?: string;
  /** Blank grey shell for loading states. */
  placeholder?: boolean;
  /** An image you host. Without it the avatar shows initials or a generated gradient. */
  src?: string;
  alt?: string;
}
export interface AvatarGroupMember { username?: string; title?: string; letter?: string; src?: string; placeholder?: boolean }
export interface AvatarGroupProps {
  members: AvatarGroupMember[];
  /** Diameter of each avatar in px. Default 32. */
  size?: number;
  /** Show at most this many, then a “+N” counter. */
  limit?: number;
  /** Overlap in px, or 'auto' (default) to scale with size. */
  overlap?: number | 'auto';
  /** Put the last member on top instead of the first. */
  reverse?: boolean;
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export interface AvatarWithIconProps extends AvatarProps {
  /** Small status icon in the bottom-left corner. */
  icon: React.ReactNode;
  /** Put the icon on a background disc so it reads over the avatar. */
  iconBackground?: boolean;
}
export declare function AvatarGroup(props: AvatarGroupProps): React.ReactElement;
export declare function AvatarWithIcon(props: AvatarWithIconProps): React.ReactElement;
export declare const Avatar: ((props: AvatarProps) => React.ReactElement) & { Group: typeof AvatarGroup; WithIcon: typeof AvatarWithIcon };
