/* "Was this helpful?" widget. No network: it hands { emotion, text, topic, metadata } to onSubmit,
   which may return a Promise. type="popover" (default) opens a panel from a trigger button; type="inline" is a pill that expands. */
var FEEDBACK_EMOTIONS = [
  { value: 'hate', label: 'Hate It', icon: 'angry' },
  { value: 'meh', label: 'Not Great', icon: 'frown' },
  { value: 'okay', label: 'It’s Okay', icon: 'smile' },
  { value: 'love', label: 'Love It', icon: 'laugh' }
];

function FeedbackEmotions(p) {
  return h('fieldset', { className: 'hy-feedback__emotions' },
    h('legend', { className: 'hy-sr' }, p.legend),
    FEEDBACK_EMOTIONS.map(function (e) {
      return h('label', { key: e.value, className: 'hy-feedback__emotion', title: e.label },
        h('input', { type: 'radio', name: p.name, value: e.value, className: 'hy-sr', checked: p.value === e.value,
          disabled: p.disabled, onChange: function () { p.onChange(e.value); } }),
        h('span', { className: 'hy-feedback__face' }, h(HY.Icon, { name: e.icon, size: 18 })),
        h('span', { className: 'hy-sr' }, e.label));
    }));
}

function useFeedbackForm(props, onDone) {
  var emotion = useState(null);
  var text = useState('');
  var topic = useState('');
  var status = useState('idle'); /* idle | sending | sent | failed */
  var error = useState(null);
  function reset() { emotion[1](null); text[1](''); topic[1](''); error[1](null); status[1]('idle'); }
  function submit() {
    if (status[0] === 'sending') return;
    if (!text[0].trim()) { error[1]('Add a few words before you send.'); return; }
    error[1](null);
    var payload = { emotion: emotion[0], text: text[0].trim(), topic: topic[0] || undefined, metadata: props.metadata };
    var result = props.dryRun || !props.onSubmit ? null : props.onSubmit(payload);
    if (result && typeof result.then === 'function') {
      status[1]('sending');
      result.then(function () { status[1]('sent'); if (onDone) onDone(); }, function () { status[1]('failed'); });
    } else { status[1]('sent'); if (onDone) onDone(); }
  }
  return { emotion: emotion, text: text, topic: topic, status: status, error: error, reset: reset, submit: submit };
}

function FeedbackFields(p) {
  var f = p.form, ids = p.ids;
  var sending = f.status[0] === 'sending';
  return h(React.Fragment, null,
    p.topics ? h('div', { className: 'hy-select hy-input--small hy-feedback__topic' },
      h('select', { 'aria-label': 'Topic', value: f.topic[0], disabled: sending, onChange: function (e) { f.topic[1](e.target.value); } },
        h('option', { value: '', disabled: true }, 'Select a topic…'),
        p.topics.map(function (t) { var v = typeof t === 'string' ? t : t.value; return h('option', { key: v, value: v }, typeof t === 'string' ? t : t.label); })),
      h(Glyph, { name: 'chevron', className: 'hy-select__chevron' })) : null,
    h('div', { className: cx('hy-feedback__field', f.error[0] && 'hy-feedback__field--error') },
      h('label', { htmlFor: ids.text, className: 'hy-sr' }, 'Feedback'),
      h('textarea', {
        id: ids.text, ref: p.textRef, rows: 4, placeholder: 'Your feedback…', value: f.text[0], disabled: sending,
        'aria-invalid': f.error[0] ? 'true' : undefined, 'aria-describedby': f.error[0] ? ids.error : undefined,
        onChange: function (e) { f.text[1](e.target.value); if (f.error[0]) f.error[1](null); },
        onKeyDown: function (e) { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); f.submit(); } }
      })),
    f.error[0] ? h('p', { id: ids.error, className: 'hy-feedback__error' }, h(HY.Icon, { name: 'circle-alert', size: 14 }), f.error[0]) : null,
    f.status[0] === 'failed' ? h('p', { className: 'hy-feedback__error', role: 'alert' }, h(HY.Icon, { name: 'circle-alert', size: 14 }), 'Couldn’t send feedback. Try again.') : null);
}

function FeedbackSend(p) {
  return h(HY.Button, { size: 'small', variant: 'primary', typeName: 'submit', loading: p.form.status[0] === 'sending' }, 'Send');
}

function FeedbackPopover(props) {
  var open = useState(!!props.defaultOpen);
  var wrapRef = useRef(null), triggerRef = useRef(null), panelRef = useRef(null), textRef = useRef(null);
  var userOpened = useRef(false);
  var uid = useId();
  var ids = { panel: uid + '-panel', text: uid + '-text', error: uid + '-error', title: uid + '-title' };
  var form = useFeedbackForm(props);
  function close(returnFocus) {
    open[1](false);
    if (returnFocus !== false && triggerRef.current) triggerRef.current.focus({ preventScroll: true });
  }
  /* Placed with useFloating like Popover, so the panel flips and stays 8px inside the screen. */
  var pos = useFloating(open[0], triggerRef, panelRef, { side: 'bottom', align: 'center', offset: 8 });
  var placed = !!pos;
  useDismiss(open[0], [wrapRef, panelRef], function (why) { close(why === 'escape'); });
  /* Focus the note once the panel is placed: it is hidden until then. */
  useLayoutEffect(function () {
    if (placed && userOpened.current && textRef.current) textRef.current.focus({ preventScroll: true });
  }, [placed]);
  var sent = form.status[0] === 'sent';
  var sentRef = useRef(null);
  useEffect(function () { if (sent && sentRef.current) sentRef.current.focus({ preventScroll: true }); }, [sent]);
  return h('div', { ref: wrapRef, className: cx('hy-feedback', props.className) },
    h(HY.Button, {
      ref: triggerRef, size: 'small', variant: 'secondary', prefix: props.prefix, suffix: props.suffix,
      'aria-expanded': open[0], 'aria-controls': open[0] ? ids.panel : undefined, 'aria-haspopup': 'dialog',
      onClick: function () { if (open[0]) close(false); else { if (form.status[0] === 'sent') form.reset(); userOpened.current = true; open[1](true); } }
    }, props.label || 'Feedback'),
    open[0] ? portal(h('div', {
      ref: panelRef, id: ids.panel, role: 'dialog', 'aria-labelledby': ids.title, className: 'hy-feedback__panel', style: floatingStyle(pos, { width: 340 }),
      onKeyDown: function (e) { if (e.key === 'Escape') { e.stopPropagation(); close(true); return; } if (e.key === 'Tab') e.stopPropagation(); trapTab(e, panelRef.current); }
    },
      sent ? h('div', { ref: sentRef, tabIndex: -1, className: 'hy-feedback__sent', role: 'status' },
        h('span', { className: 'hy-feedback__sent-icon' }, h(HY.Icon, { name: 'check', size: 16 })),
        h('p', { id: ids.title, className: 'hy-feedback__sent-title' }, 'Your feedback has been received!'),
        h('p', { className: 'hy-feedback__sent-copy' }, 'Thank you for your help.'))
      : h('form', { noValidate: true, onSubmit: function (e) { e.preventDefault(); form.submit(); } },
        h('h2', { id: ids.title, className: 'hy-sr' }, props.copy || 'Was this helpful?'),
        h('div', { className: 'hy-feedback__body' }, h(FeedbackFields, { form: form, ids: ids, textRef: textRef, topics: props.showTopics ? props.topics : null })),
        h('div', { className: 'hy-feedback__footer' },
          h(FeedbackEmotions, { name: uid + '-emotion', legend: 'How did it feel?', value: form.emotion[0], onChange: form.emotion[1], disabled: form.status[0] === 'sending' }),
          h(FeedbackSend, { form: form }))))) : null);
}

function FeedbackInline(props) {
  var uid = useId();
  var ids = { text: uid + '-text', error: uid + '-error' };
  var textRef = useRef(null);
  var form = useFeedbackForm(props);
  var expanded = useState(!!props.defaultOpen);
  var sent = form.status[0] === 'sent';
  var formRef = useRef(null);
  useEffect(function () { if (sent && formRef.current && formRef.current.contains(document.activeElement) === false && document.activeElement === document.body) formRef.current.focus({ preventScroll: true }); }, [sent]);
  var copy = props.copy || 'Was this helpful?';
  function pick(v) { form.emotion[1](v); expanded[1](true); }
  return h('form', {
    ref: formRef, tabIndex: -1, noValidate: true, 'aria-label': props.label || 'Feedback',
    className: cx('hy-feedback-inline', expanded[0] && !sent && 'hy-feedback-inline--open', props.className),
    onSubmit: function (e) { e.preventDefault(); form.submit(); }
  },
    h('div', { className: 'hy-feedback-inline__bar', 'aria-live': 'polite' },
      sent ? h('p', { className: 'hy-feedback-inline__copy' }, h(HY.Icon, { name: 'check', size: 16 }), 'Thanks for the feedback.')
        : h(React.Fragment, null,
          h('p', { className: 'hy-feedback-inline__copy', 'aria-hidden': 'true' }, copy),
          h(FeedbackEmotions, { name: uid + '-emotion', legend: copy, value: form.emotion[0], onChange: pick, disabled: form.status[0] === 'sending' }))),
    expanded[0] && !sent ? h('div', { className: 'hy-feedback-inline__body' },
      h(FeedbackFields, { form: form, ids: ids, textRef: textRef, topics: props.showTopics ? props.topics : null }),
      h('div', { className: 'hy-feedback-inline__actions' }, h(FeedbackSend, { form: form }))) : null);
}

function Feedback(props) {
  return props.type === 'inline' ? h(FeedbackInline, props) : h(FeedbackPopover, props);
}

define('Feedback', Feedback);
