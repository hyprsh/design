export interface TabItem {
  value: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Tooltip on the tab, such as why it is disabled. */
  tooltip?: React.ReactNode;
  /** hyprsh: the panel for this tab; Tabs renders it when the tab is selected. */
  content?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  /** The selected value (controlled). */
  selected?: string;
  defaultSelected?: string;
  /** Change handler. */
  setSelected?: (value: string) => void;
  /** Same as setSelected; both are called. */
  onChange?: (value: string) => void;
  /** Disables every tab. */
  disabled?: boolean;
  /** 'primary' (default): underlined tabs for page sections. 'secondary': compact pills inside a card or toolbar. */
  variant?: 'primary' | 'secondary';
  'aria-label'?: string;
  className?: string;
  style?: React.CSSProperties;
}
export declare function Tabs(props: TabsProps): React.ReactElement;
