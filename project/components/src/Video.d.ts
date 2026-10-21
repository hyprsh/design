export interface VideoProps {
  /** URL of the video file. Without it the player draws a placeholder poster and its controls stay disabled. */
  src?: string;
  /** Width in px (number) or any CSS length. With a numeric height too, the pair sets the aspect ratio; otherwise it's 16:9. */
  width?: number | string;
  /** Height in px (number) or any CSS length. */
  height?: number | string;
  /** Load the file only once the player is within 200px of the viewport. Default true. */
  lazy?: boolean;
  /** Default true. */
  loop?: boolean;
  /** Show the play/pause, time and seek bar. Default true. */
  controls?: boolean;
  /** Default true. Autoplay only works muted. */
  muted?: boolean;
  /** Start playing once loaded. Default true, but never when the reader prefers reduced motion. */
  autoPlay?: boolean;
  /** Image shown before the file loads. */
  poster?: string;
  /** Default true, so iOS doesn't open the clip full screen. */
  playsInline?: boolean;
  /** Describes what the clip shows. */
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Video(props: VideoProps): React.ReactElement;
