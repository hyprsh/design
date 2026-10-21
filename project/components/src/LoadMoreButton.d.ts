export interface LoadMoreButtonProps extends ButtonProps {
  /** The label. Default 'Load More'. */
  children?: React.ReactNode;
  /** Shows a spinner and blocks repeat clicks while the next page loads. */
  loading?: boolean;
  /** Removes the 16px space above the button, for when it sits flush under a list. */
  noGap?: boolean;
  /** Square corners, for when it forms the bottom edge of a bordered container. */
  noBorderRadius?: boolean;
}
export declare function LoadMoreButton(props: LoadMoreButtonProps): React.ReactElement;
