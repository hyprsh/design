export interface BubbleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className'> {
  /** The message content. */
  children: React.ReactNode;
  /** Default 'received'. A sent bubble sits at the end of its row in the accent fill; a received one at the start in gray-100. */
  direction?: 'sent' | 'received';
  /** Default 'single'. For consecutive messages from one side: the corners on the sender's side are tighter where the bubble meets its neighbours. */
  position?: 'single' | 'first' | 'middle' | 'last';
  /** The time, drawn small and secondary after the content. */
  time?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Bubble(props: BubbleProps): React.ReactElement;
