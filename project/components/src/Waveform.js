/* Clamp a number into 0–1; anything that is not a finite number counts as 0. */
function waveClamp(n) {
  n = Number(n);
  return n > 0 ? (n < 1 ? n : 1) : 0;
}

function Waveform(props) {
  var levels = props.levels || [];
  var played = Math.round(waveClamp(props.progress) * levels.length);
  var height = props.height !== undefined ? props.height : 32;

  return h('div', {
    className: cx('hy-waveform', props.className),
    style: Object.assign({ height: height }, props.style),
    'aria-hidden': 'true'
  }, levels.map(function (level, i) {
    return h('span', {
      key: i,
      className: cx('hy-waveform__bar', i < played && 'is-played'),
      style: { height: (waveClamp(level) * 100) + '%' }
    });
  }));
}

define('Waveform', Waveform);
