export interface FieldsetProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tints the border and footer red or amber and adds an icon to the footer status. */
  type?: 'error' | 'warning';
  children?: React.ReactNode;
}
export interface FieldsetContentProps extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  /** Disables every control inside (native fieldset) and grays the title and subtitle. */
  disabled?: boolean;
}
export interface FieldsetPartProps { className?: string; children?: React.ReactNode; id?: string }
export interface FieldsetTitleProps extends FieldsetPartProps {
  /** Heading level; h4 by default, as in Geist. Pick the one that fits the page outline. */
  as?: 'h2' | 'h3' | 'h4' | 'h5';
}
export interface FieldsetFooterProps extends FieldsetPartProps {
  /** A lighter gray footer. */
  highlight?: boolean;
}
export declare function FieldsetContent(props: FieldsetContentProps): React.ReactElement;
export declare function FieldsetTitle(props: FieldsetTitleProps): React.ReactElement;
export declare function FieldsetSubtitle(props: FieldsetPartProps): React.ReactElement;
export declare function FieldsetFooterStatus(props: FieldsetPartProps): React.ReactElement;
export declare function FieldsetFooterActions(props: FieldsetPartProps): React.ReactElement;
/** A small Button, primary unless you pass another variant. */
export declare const FieldsetFooterAction: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;
export declare const FieldsetFooter: ((props: FieldsetFooterProps) => React.ReactElement) & {
  Status: typeof FieldsetFooterStatus;
  Actions: typeof FieldsetFooterActions;
  Action: typeof FieldsetFooterAction;
};
export declare const Fieldset: ((props: FieldsetProps) => React.ReactElement) & {
  Fieldset: (props: FieldsetProps) => React.ReactElement;
  Content: typeof FieldsetContent;
  Title: typeof FieldsetTitle;
  Subtitle: typeof FieldsetSubtitle;
  Footer: typeof FieldsetFooter;
  FooterStatus: typeof FieldsetFooterStatus;
  FooterActions: typeof FieldsetFooterActions;
  FooterAction: typeof FieldsetFooterAction;
};
