export interface BannerButton {
  /** Where the link goes. */
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  /** The link text: a Title Case verb, such as “Read More”. */
  content: React.ReactNode;
}
export interface BannerProps {
  /** The announcement: a <b> lead and one short clause, such as <b>Build Cache</b> – Now shared across branches. */
  children: React.ReactNode;
  /** The single call to action, shown as a small rounded secondary button with a chevron. */
  button?: BannerButton;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Banner(props: BannerProps): React.ReactElement;
