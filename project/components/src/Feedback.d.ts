export type FeedbackEmotion = 'hate' | 'meh' | 'okay' | 'love';
export interface FeedbackPayload {
  emotion: FeedbackEmotion | null;
  text: string;
  topic?: string;
  metadata?: Record<string, unknown>;
}
export interface FeedbackProps {
  /** 'popover' (default) opens a panel from a trigger button; 'inline' is a pill that expands in place. */
  type?: 'popover' | 'inline';
  /** Trigger text (popover) or form name (inline). Title Case, no question mark. Default “Feedback”. */
  label?: string;
  /** The question, in sentence case. Default “Was this helpful?”. Shown beside the reactions when inline; in the popover it only names the dialog for assistive tech. */
  copy?: string;
  /** Called on Send. Return a Promise to show a loading state; a rejection shows a retry message. Nothing is sent over the network for you. */
  onSubmit?: (payload: FeedbackPayload) => void | Promise<unknown>;
  /** Extra context passed through to onSubmit (page, release). Never put personal data here. */
  metadata?: Record<string, unknown>;
  /** Show a topic select above the text box. */
  showTopics?: boolean;
  topics?: Array<string | { value: string; label: string }>;
  /** Skip onSubmit and go straight to the success state. */
  dryRun?: boolean;
  /** Start open (popover) or expanded (inline). Doesn't move focus. */
  defaultOpen?: boolean;
  /** Icons on the trigger button. */
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  className?: string;
}
export declare function Feedback(props: FeedbackProps): React.ReactElement;
