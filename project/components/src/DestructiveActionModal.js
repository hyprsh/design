/* A Modal with a type-to-confirm gate and an optional irreversibility band. Builds on HY.Modal. */
function DestructiveActionModal(props) {
  var open = !!props.open;
  var st = useState('');
  var typed = st[0], setTyped = st[1];
  var inputId = useId();
  var promptId = useId();
  var errId = useId();
  useEffect(function () { if (!open) setTyped(''); }, [open]);
  var phrase = props.verificationPhrase;
  var gated = phrase !== undefined && phrase !== null && phrase !== '';
  var matches = !gated || typed === phrase;
  var loading = !!props.loading;
  var error = props.error ? (props.error instanceof Error ? props.error.message : props.error) : null;
  function cancel() { if (!loading && props.onCancel) props.onCancel(); }
  function submit(e) {
    e.preventDefault();
    if (!matches || loading) return;
    if (props.onConfirm) props.onConfirm();
  }
  var prompt = props.verificationLabel
    ? ['To confirm, type the ', props.verificationLabel, ' ', h('b', { key: 'p', translate: 'no' }, '“' + phrase + '”')]
    : ['To confirm, type ', h('b', { key: 'p', translate: 'no' }, '“' + phrase + '”')];
  return h(HY.Modal, { active: open, onClose: cancel, onClickOutside: cancel, alert: true, inline: props.inline, className: 'hy-dam' },
    h('form', { className: 'hy-dam__form', onSubmit: submit, noValidate: true },
      h(HY.ModalBody, null,
        h(HY.ModalHeader, null,
          h(HY.ModalTitle, null, props.title),
          props.description ? h(HY.ModalSubtitle, null, props.description) : null),
        h('div', { className: 'hy-dam__content' },
          props.irreversibleDescription ? h('div', { className: 'hy-dam__band' },
            h(Glyph, { name: 'warning', className: 'hy-dam__band-glyph' }),
            h('span', null, props.irreversibleDescription)) : null,
          gated ? h('div', { className: 'hy-dam__field' },
            h('label', { id: promptId, htmlFor: inputId, className: 'hy-dam__prompt' }, prompt),
            h('div', { className: cx('hy-input', 'hy-input--small', error && 'hy-input--error') },
              h('input', {
                id: inputId, 'data-autofocus': true, type: 'text', name: 'verification', value: typed,
                autoComplete: 'off', autoCapitalize: 'off', autoCorrect: 'off', spellCheck: false,
                disabled: loading, 'aria-labelledby': promptId,
                'aria-invalid': error ? 'true' : undefined, 'aria-describedby': error ? errId : undefined,
                onChange: function (e) { setTyped(e.target.value); }
              }))) : null,
          error ? h('p', { id: errId, className: 'hy-field__error', role: 'alert' }, h(Glyph, { name: 'error', size: 14 }), h('span', null, error)) : null)),
      h(HY.ModalActions, null,
        h(HY.ModalAction, { type: 'button', variant: 'secondary', disabled: loading, onClick: cancel, 'data-autofocus': gated ? undefined : true }, props.cancelLabel || 'Cancel'),
        h(HY.ModalAction, { type: 'submit', variant: 'error', disabled: !matches, loading: loading }, props.confirmLabel))));
}

define('DestructiveActionModal', DestructiveActionModal);
