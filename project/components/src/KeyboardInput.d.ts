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
  /** The one key after the modifiers. */
  children?: React.ReactNode;
  className?: string;
}
export declare function KeyboardInput(props: KeyboardInputProps): React.ReactElement;
/** Geist's name for the same component. */
export declare const Kbd: typeof KeyboardInput;
