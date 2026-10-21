export interface DestructiveActionModalProps {
  open: boolean;
  /** Called by Cancel, Escape and a backdrop click (ignored while loading). */
  onCancel: () => void;
  /** Called on submit once the typed phrase matches. Close the modal yourself after the request settles. */
  onConfirm: () => void;
  /** Title Case Verb + Noun: “Delete Project”. */
  title: React.ReactNode;
  /** Sentence case; names the consequence and the resource. */
  description?: React.ReactNode;
  /** Red band naming what cannot be undone. Omit it for reversible actions. */
  irreversibleDescription?: React.ReactNode;
  /** The exact text to type before submit enables. */
  verificationPhrase?: string;
  /** Names the phrase in the prompt: “project name” → To confirm, type the project name “my-project”. */
  verificationLabel?: string;
  /** Repeats the title: “Delete Project”. */
  confirmLabel: string;
  /** Default “Cancel”. */
  cancelLabel?: string;
  /** Disables both buttons and shows a spinner on confirm. */
  loading?: boolean;
  /** Inline error under the input; the modal stays open for a retry. */
  error?: string | Error | null;
  /** Render in place instead of in a portal. */
  inline?: boolean;
}
export declare function DestructiveActionModal(props: DestructiveActionModalProps): React.ReactElement | null;
