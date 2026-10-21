function videoTime(s) {
  s = isFinite(s) && s > 0 ? Math.floor(s) : 0;
  var hrs = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  var ss = (sec < 10 ? '0' : '') + sec;
  return hrs ? hrs + ':' + (m < 10 ? '0' : '') + m + ':' + ss : m + ':' + ss;
}
function videoSize(v) { return typeof v === 'number' ? v + 'px' : v; }
function videoReduced() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }

/* A muted, looping product clip with a small play/seek bar. The file loads only once the player nears the viewport
   (lazy), and it never autoplays when the reader prefers reduced motion. Without src it draws a placeholder poster. */
function Video(props) {
  var rootRef = useRef(null), vidRef = useRef(null);
  var lazy = props.lazy !== false;
  var inView = useState(!lazy);
  var playing = useState(false);
  var time = useState(0);
  var dur = useState(0);
  var src = props.src;
  var showControls = props.controls !== false;

  useEffect(function () {
    if (inView[0] || !src) return;
    var el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') { inView[1](true); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { inView[1](true); io.disconnect(); }
    }, { rootMargin: '200px' });
    io.observe(el);
    return function () { io.disconnect(); };
  }, [inView[0], src]);

  useEffect(function () {
    var v = vidRef.current;
    if (!v || !inView[0] || !src) return;
    if (props.autoPlay !== false && !videoReduced()) {
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }
  }, [inView[0], src]);

  var ready = !!(src && inView[0]);
  function toggle() {
    var v = vidRef.current;
    if (!v || !ready) return;
    if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    else v.pause();
  }
  function seek(e) {
    var v = vidRef.current, t = Number(e.target.value);
    if (v) v.currentTime = t;
    time[1](t);
  }

  var w = props.width, ht = props.height;
  var style = {};
  if (w !== undefined) style.width = videoSize(w);
  if (typeof w === 'number' && typeof ht === 'number') style.aspectRatio = w + ' / ' + ht;
  else if (ht !== undefined) style.height = videoSize(ht);
  Object.assign(style, props.style);

  var pct = dur[0] ? Math.min(100, (time[0] / dur[0]) * 100) : 0;
  var label = props['aria-label'];
  var rest = omit(props, ['src', 'width', 'height', 'lazy', 'loop', 'controls', 'muted', 'autoPlay', 'poster', 'playsInline', 'className', 'style', 'aria-label']);

  return h('div', Object.assign({}, rest, {
    ref: rootRef, style: style,
    className: cx('hy-video', playing[0] && 'is-playing', !src && 'is-empty', props.className)
  }),
    ready ? h('video', {
      ref: vidRef, className: 'hy-video__media', src: src, poster: props.poster,
      loop: props.loop !== false, muted: props.muted !== false, playsInline: props.playsInline !== false,
      preload: 'metadata', 'aria-label': label,
      onClick: toggle,
      onPlay: function () { playing[1](true); },
      onPause: function () { playing[1](false); },
      onTimeUpdate: function (e) { time[1](e.target.currentTime); },
      onLoadedMetadata: function (e) { dur[1](e.target.duration); },
      onDurationChange: function (e) { dur[1](e.target.duration); }
    }) : props.poster
      ? h('img', { className: 'hy-video__media', src: props.poster, alt: '', 'aria-hidden': 'true' })
      : h('div', { className: 'hy-video__poster', role: label ? 'img' : undefined, 'aria-label': label, 'aria-hidden': label ? undefined : 'true' }),
    showControls ? h('div', { className: 'hy-video__bar' },
      h('button', {
        type: 'button', className: 'hy-video__play', onClick: toggle, disabled: !ready,
        'aria-label': playing[0] ? 'Pause' : 'Play'
      }, h(HY.Icon, { name: playing[0] ? 'pause' : 'play', size: 16 })),
      h('span', { className: 'hy-video__time' }, videoTime(time[0])),
      h('input', {
        type: 'range', className: 'hy-video__seek', min: 0, max: dur[0] || 0, step: 0.1, value: Math.min(time[0], dur[0] || 0),
        disabled: !ready || !dur[0], onChange: seek, style: { '--p': pct + '%' },
        'aria-label': 'Seek', 'aria-valuetext': videoTime(time[0]) + ' of ' + videoTime(dur[0])
      }),
      h('span', { className: 'hy-video__time' }, videoTime(dur[0]))) : null);
}

define('Video', Video);
