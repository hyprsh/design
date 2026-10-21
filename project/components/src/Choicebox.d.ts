export interface ChoiceboxProps {
  /** Group name, read by screen readers; shown only with showLabel. */
  label?: string;
  showLabel?: boolean;
  /** 'radio' (default): pick one, value is a string. 'checkbox': pick many, value is a string[]. */
  type?: 'radio' | 'checkbox';
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[], event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Disables every tile. */
  disabled?: boolean;
  /** Lay tiles out side by side ('row') or stacked ('column', default). */
  direction?: 'row' | 'column';
  /** Extra class for the tile list; Geist's "flex-row" is read as direction="row". */
  listClassName?: string;
  /** Input name; generated if left out. */
  name?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export type ChoiceboxGroupProps = ChoiceboxProps;

export interface ChoiceboxGroupItemProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  value: string;
  disabled?: boolean;
  /** Native title text, e.g. why the tile is disabled. */
  tooltip?: string;
  /** Extra content shown below the header while the tile is selected. */
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export declare const ChoiceboxGroupItem: (props: ChoiceboxGroupItemProps) => React.ReactElement;
export declare const ChoiceboxGroup: (props: ChoiceboxGroupProps) => React.ReactElement;
export declare const Choicebox: ((props: ChoiceboxProps) => React.ReactElement) & {
  Group: typeof ChoiceboxGroup;
  Item: typeof ChoiceboxGroupItem;
};
