export interface ModalProps {
  /** Alias for `open`. */
  active?: boolean;
  /** Alias of `active`. */
  open?: boolean;
  /** Called on a backdrop click (and on Escape when `onClose` is not set). */
  onClickOutside?: () => void;
  /** Called on Escape (and on a backdrop click when `onClickOutside` is not set). */
  onClose?: () => void;
  /** Keeps the header pinned while the body scrolls. The actions are always pinned. */
  sticky?: boolean;
  /** Element to focus on open, e.g. the Cancel action of a destructive modal. */
  initialFocusRef?: React.RefObject<HTMLElement>;
  /** Alias of `initialFocusRef`. */
  initialFocus?: React.RefObject<HTMLElement>;
  /** Shorthand: renders ModalBody > ModalHeader > ModalTitle. */
  title?: React.ReactNode;
  /** Shorthand: renders ModalSubtitle. */
  description?: React.ReactNode;
  /** Shorthand: renders ModalActions around these buttons. */
  actions?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  /** role="alertdialog" for destructive confirmations. */
  alert?: boolean;
  /** Render in place instead of in a portal on document.body. */
  inline?: boolean;
  className?: string;
  'aria-label'?: string;
  children?: React.ReactNode;
}
export interface ModalPartProps { className?: string; children?: React.ReactNode }
export interface ModalInsetProps extends ModalPartProps { /** Flush with the actions footer. */ last?: boolean }
export interface ModalActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Default 'primary'. Use 'secondary' for Cancel. */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'warning';
  fullWidth?: boolean;
  loading?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}
export declare function ModalBody(props: ModalPartProps & React.HTMLAttributes<HTMLDivElement>): React.ReactElement;
export declare function ModalHeader(props: ModalPartProps): React.ReactElement;
export declare function ModalTitle(props: ModalPartProps): React.ReactElement;
export declare function ModalSubtitle(props: ModalPartProps): React.ReactElement;
export declare function ModalInset(props: ModalInsetProps): React.ReactElement;
export declare function ModalActions(props: ModalPartProps): React.ReactElement;
export declare const ModalAction: React.ForwardRefExoticComponent<ModalActionProps & React.RefAttributes<HTMLButtonElement>>;
export declare const Modal: ((props: ModalProps) => React.ReactElement | null) & {
  Body: typeof ModalBody; Header: typeof ModalHeader; Title: typeof ModalTitle; Subtitle: typeof ModalSubtitle;
  Inset: typeof ModalInset; Actions: typeof ModalActions; Action: typeof ModalAction;
};
