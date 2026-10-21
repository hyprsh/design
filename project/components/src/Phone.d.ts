export interface PhoneProps {
  /** URL shown in the mobile browser toolbar, without protocol or “www.”. Omit for an app screen with no toolbar. */
  address?: string;
  /** Screen content, usually an <img> or <video> filling the screen. Without it the screen shows a neutral placeholder. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Phone(props: PhoneProps): React.ReactElement;
