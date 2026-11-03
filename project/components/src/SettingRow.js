/* SettingRow: a label and help text beside a control, with a changed mark, for rows in a settings card.
   The row ties its <label> to the control and its help (and the changed words) to the control's description. */
function SettingRow(props) {
  var base = useId();
  var child = props.children;
  var isEl = React.isValidElement(child);
  var controlId = (isEl && child.props.id) || base + '-control';
  var labelId = base + '-label';
  var helpId = base + '-help';
  var changedId = base + '-changed';
  var hasHelp = props.help != null && props.help !== false && props.help !== '';
  var changed = !!props.changed;
  /* A group control such as Switch (a radiogroup div) can't be named by <label for>, so it is also labelled by id. */
  var named = isEl && !child.props.label && !child.props['aria-labelledby'] && !child.props['aria-label'];
  var describedBy = cx(isEl && child.props['aria-describedby'], hasHelp && helpId, changed && changedId) || undefined;
  return h('div', { className: cx('hy-setting-row', changed && 'is-changed', props.className) },
    h('div', { className: 'hy-setting-row__text' },
      h('label', { id: labelId, className: 'hy-setting-row__label', htmlFor: controlId }, props.label),
      hasHelp ? h('div', { id: helpId, className: 'hy-setting-row__help' }, props.help) : null),
    h('div', { className: 'hy-setting-row__control' },
      isEl ? React.cloneElement(child, named ? { id: controlId, 'aria-describedby': describedBy, 'aria-labelledby': labelId } : { id: controlId, 'aria-describedby': describedBy }) : child,
      changed ? h('span', { id: changedId, className: 'hy-sr hy-setting-row__changed' }, props.changedLabel || 'Unsaved change') : null));
}

define('SettingRow', SettingRow);
