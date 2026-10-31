export interface WaveformProps {
  /** One bar per entry, from 0 (silent, still drawn as a minimal bar) to 1 (loudest). Values outside 0–1 are clamped. */
  levels: number[];
  /** How much has played, 0–1 (clamped). Bars up to that fraction use the played colour. Default 0. */
  progress?: number;
  /** Height in px. Default 32. It always fills the width of its container. */
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Waveform(props: WaveformProps): React.ReactElement;
