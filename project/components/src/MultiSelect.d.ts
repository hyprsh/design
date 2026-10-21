export interface MultiSelectItem { value: string; label?: string; disabled?: boolean; }

/** Shortcut props (with `items`), or MultiSelectRoot props (without). */
export interface MultiSelectProps {
  /** Renders the whole control: a trigger plus one row per item. */
  items?: Array<MultiSelectItem | string>;
  /** Selected values; every item is selected by default. */
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  /** Plural noun for the trigger and popover name, e.g. "Environments". */
  label?: string;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  align?: 'start' | 'end';
  width?: number | string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface MultiSelectRootProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export interface MultiSelectTriggerProps {
  /** Button text; name the selection, e.g. "All Environments" or "Preview". */
  children?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
export interface MultiSelectContentProps {
  align?: 'start' | 'end';
  'aria-label'?: string;
  width?: number | string;
  /** Focus the first checkbox when opened from the trigger. Default true. */
  autoFocus?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export interface MultiSelectRowProps {
  /** Item name; also the checkbox's accessible name. */
  name: string;
  label?: React.ReactNode;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  /** Called by the row's "Only" action. */
  onSelectOnly?: () => void;
  /** Called by the row's "Select All" action. */
  onSelectAll?: () => void;
  selectedCount?: number;
  totalCount?: number;
  className?: string;
}

export declare const MultiSelectRoot: (props: MultiSelectRootProps) => React.ReactElement;
export declare const MultiSelectTrigger: (props: MultiSelectTriggerProps) => React.ReactElement;
export declare const MultiSelectContent: (props: MultiSelectContentProps) => React.ReactElement | null;
export declare const MultiSelectRow: (props: MultiSelectRowProps) => React.ReactElement;
export declare const MultiSelect: ((props: MultiSelectProps) => React.ReactElement) & {
  Root: typeof MultiSelectRoot;
  Trigger: typeof MultiSelectTrigger;
  Content: typeof MultiSelectContent;
  Row: typeof MultiSelectRow;
};
