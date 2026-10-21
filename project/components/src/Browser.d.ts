export interface BrowserProps {
  /** Full URL. The bar shows it without the protocol or “www.”, and its copy button copies it whole. Omit to hide the address bar. */
  address?: string;
  /** The page inside the frame: usually an <img> or <video> with real alt text. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Browser(props: BrowserProps): React.ReactElement;
