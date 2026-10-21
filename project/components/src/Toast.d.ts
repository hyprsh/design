export interface ToastOptions {
  /** One sentence. */
  text: React.ReactNode;
  /** Keep it until dismissed (adds a Dismiss button). */
  preserve?: boolean;
  /** A single action button: its label, plus onAction. */
  action?: string | { label: string; onClick?: () => void };
  onAction?: () => void;
  /** Undo snackbar: Dismiss + Undo buttons under the text; stays 8s. */
  onUndoAction?: () => void;
  /** ms before it dismisses itself. Default 6000; Infinity keeps it. */
  duration?: number;
  id?: string | number;
}
export interface ToastsApi {
  message(o: ToastOptions | string): string | number;
  success(o: ToastOptions | string): string | number;
  warning(o: ToastOptions | string): string | number;
  error(o: ToastOptions | string): string | number;
  dismiss(id: string | number): void;
  clear(): void;
}
/** Imperative API. Renders into a <Toast /> host if one is mounted, otherwise mounts one on document.body. */
export declare function useToasts(): ToastsApi;

export interface ToastData { id: string | number; message?: React.ReactNode; text?: React.ReactNode; type?: 'success' | 'error' | 'warning'; action?: string | { label: string; onClick?: () => void }; onAction?: () => void; onUndoAction?: () => void; preserve?: boolean; duration?: number }

export interface ToastProps {
  /** Controlled list. Omit it to render the useToasts() queue. */
  toasts?: ToastData[];
  onDismiss?: (id: ToastData['id']) => void;
  /** Render in place as a plain column instead of the fixed bottom-right stack. */
  inline?: boolean;
  /** Keep the stack expanded. */
  expanded?: boolean;
  className?: string;
}
export declare const Toast: ((props: ToastProps) => React.ReactElement) & { useToasts: typeof useToasts; toasts: ToastsApi };
