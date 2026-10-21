/* SearchInput: a ClearableInput with a search icon (or a spinner while loading) and type="search". */
var SearchInput = React.forwardRef(function SearchInput(props, ref) {
  var icon = props.prefix != null ? props.prefix
    : props.loading ? h(HY.Spinner, { size: 16 })
    : h(Glyph, { name: 'search', size: 16 });
  return h(HY.ClearableInput, Object.assign({ type: 'search', autoComplete: 'off', spellCheck: false }, omit(props, ['loading', 'prefix', 'className']), {
    ref: ref,
    className: cx('hy-search', props.className),
    prefix: icon,
    prefixStyling: false,
    'aria-busy': props.loading ? 'true' : undefined
  }));
});

define('SearchInput', SearchInput);
