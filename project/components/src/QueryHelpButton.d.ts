export interface QueryHelpButtonProps {
  /** The qualifiers to explain: one line each, from their `help`. */
  qualifiers: readonly Qualifier[];
  /** Sizes the button to match a field or menus beside it. Default medium. */
  size?: 'small' | 'medium' | 'large';
}

/**
 * The "?" icon button that opens the Query Help popover: each qualifier's `help` line and the rules of the query syntax. `QueryInput` draws it beside the
 * field; use it on its own to place it elsewhere, with `help={false}` on the field (or in a `QueryBar`, `help="menus"` for the menu row).
 */
export declare function QueryHelpButton(props: QueryHelpButtonProps): React.ReactElement;
