export interface KeyboardInputProps {
  /** ⌘ on macOS, Ctrl elsewhere. */
  meta?: boolean;
  /** ⇧ on macOS, Shift elsewhere. */
  shift?: boolean;
  /** ⌥ on macOS, Alt elsewhere. */
  alt?: boolean;
  /** ⌃ on macOS, Ctrl elsewhere. */
  ctrl?: boolean;
  /** 20px tall, for dense rows such as menus and inputs. */
  small?: boolean;
  /** hyprsh: force the modifier set instead of detecting the reader's platform. */
  platform?: 'mac' | 'other';
  /** Keep it visible on touch-only devices (no hover, coarse pointer), where it is hidden by default. For when the key itself is the content, such as a keyboard-shortcuts page. */
  alwaysShow?: boolean;
  /** The one key after the modifiers. */
  children?: React.ReactNode;
  className?: string;
}
export declare function KeyboardInput(props: KeyboardInputProps): React.ReactElement;
/** Geist's name for the same component. */
export declare const Kbd: typeof KeyboardInput;
