/* ---- a small hand-written tokenizer: JS/TS/JSX, JSON, bash, CSS. Output: [[type, text], …] ---- */
var JS_KEYWORDS = ('break case catch class const continue debugger default delete do else export extends finally for from ' +
  'function if import in instanceof let new of return static super switch this throw try typeof var void while with yield ' +
  'async await as type interface enum implements declare readonly public private protected keyof namespace abstract satisfies').split(' ');
var JS_LITERALS = ['true', 'false', 'null', 'undefined', 'NaN', 'Infinity'];
var CLASS_AFTER = ['class', 'new', 'extends', 'implements', 'interface', 'type', 'enum'];
var SH_KEYWORDS = 'if then else elif fi for in do done while until case esac function return export local select'.split(' ');

function lexer(src) {
  var L = { src: src, i: 0, out: [], last: null };
  L.at = function (re) { re.lastIndex = L.i; var m = re.exec(src); return m ? m[0] : null; };
  L.push = function (type, text) {
    if (!text) return;
    L.out.push([type, text]); L.i += text.length;
    if (/\S/.test(text)) L.last = [type, text];
  };
  return L;
}

var RE = {
  ws: /\s+/y,
  lineComment: /\/\/[^\n]*/y,
  blockComment: /\/\*[\s\S]*?(?:\*\/|$)/y,
  dq: /"(?:[^"\\\n]|\\.)*"?/y,
  sq: /'(?:[^'\\\n]|\\.)*'?/y,
  tpl: /`(?:[^`\\]|\\[\s\S])*`?/y,
  num: /(?:0[xXbBoO][\da-fA-F_]+|\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?n?|\.\d+)/y,
  ident: /[A-Za-z_$][\w$]*/y,
  keyAhead: /\s*:(?!:)/y,
  callAhead: /\s*(?:<[\w$.,\s]*>)?\s*\(/y,
  jsxText: /[^<{]+/y,
  jsxName: /[\w$.:-]*/y,
  jsxAttr: /[\w$:-]+/y,
  jsxStr: /"[^"]*"?|'[^']*'?/y,
  jsxClose: /<\/(\s*)([\w$.:-]*)(\s*)(>?)/y
};

function tokenizeJs(src, jsx) {
  var L = lexer(src), n = src.length;
  var stack = [{ m: 'js', depth: 0 }];
  function openTag() {
    L.push('punct', '<');
    var name = L.at(RE.jsxName);
    L.push(/^[A-Z]/.test(name) ? 'class' : 'tag', name);
    stack.push({ m: 'tag' });
  }
  function canStartJsx() {
    if (!jsx || src[L.i] !== '<' || !/[A-Za-z>]/.test(src[L.i + 1] || '')) return false;
    var p = L.last;
    if (!p) return true;
    if (p[0] === 'keyword') return true;
    return p[0] === 'punct' && /[(\[{,;:=?&|!>]$/.test(p[1]);
  }
  while (L.i < n) {
    var top = stack[stack.length - 1], t, c = src[L.i];
    if (top.m === 'children') {
      if ((t = L.at(RE.jsxText))) { L.push('plain', t); continue; }
      if (c === '{') { L.push('punct', '{'); stack.push({ m: 'js', depth: 0 }); continue; }
      RE.jsxClose.lastIndex = L.i;
      var cm = RE.jsxClose.exec(src);
      if (cm) {
        L.push('punct', '</'); L.push('ws', cm[1]);
        L.push(/^[A-Z]/.test(cm[2]) ? 'class' : 'tag', cm[2]);
        L.push('ws', cm[3]); L.push('punct', cm[4]);
        stack.pop();
        continue;
      }
      openTag(); continue;
    }
    if (top.m === 'tag') {
      if ((t = L.at(RE.ws))) { L.push('ws', t); continue; }
      if (src.substr(L.i, 2) === '/>') { L.push('punct', '/>'); stack.pop(); continue; }
      if (c === '>') { L.push('punct', '>'); stack.pop(); stack.push({ m: 'children' }); continue; }
      if (c === '{') { L.push('punct', '{'); stack.push({ m: 'js', depth: 0 }); continue; }
      if ((t = L.at(RE.jsxStr))) { L.push('string', t); continue; }
      if ((t = L.at(RE.jsxAttr))) { L.push('attr', t); continue; }
      L.push('punct', c); continue;
    }
    /* js */
    if ((t = L.at(RE.ws))) { L.push('ws', t); continue; }
    if ((t = L.at(RE.lineComment)) || (t = L.at(RE.blockComment))) { L.push('comment', t); continue; }
    if ((t = L.at(RE.dq)) || (t = L.at(RE.sq)) || (t = L.at(RE.tpl))) {
      var keyStr = t[0] !== '`' && src.slice(L.i + t.length).match(/^\s*:(?!:)/) && L.last && /[{,]$/.test(L.last[1]);
      L.push(keyStr ? 'property' : 'string', t); continue;
    }
    if (canStartJsx()) { openTag(); continue; }
    if (/[\d.]/.test(c) && !/[\w$]/.test(src[L.i - 1] || '') && (t = L.at(RE.num))) { L.push('number', t); continue; }
    if ((t = L.at(RE.ident))) {
      var prev = L.last, after = L.i + t.length, type = 'plain';
      var afterDot = prev && prev[1] === '.';
      RE.keyAhead.lastIndex = after; var isKey = RE.keyAhead.exec(src); isKey = isKey && isKey.index === after;
      RE.callAhead.lastIndex = after; var isCall = RE.callAhead.exec(src); isCall = isCall && isCall.index === after;
      if (!afterDot && JS_KEYWORDS.indexOf(t) >= 0 && !(isKey && prev && /[{,]$/.test(prev[1]))) type = 'keyword';
      else if (!afterDot && JS_LITERALS.indexOf(t) >= 0) type = 'literal';
      else if (isKey && prev && /[{,]$/.test(prev[1])) type = 'property';
      else if (isCall) type = 'function';
      else if (prev && prev[0] === 'keyword' && CLASS_AFTER.indexOf(prev[1]) >= 0) type = 'class';
      else if (prev && prev[0] === 'keyword' && prev[1] === 'function') type = 'function';
      L.push(type, t); continue;
    }
    if (c === '{') { top.depth++; L.push('punct', c); continue; }
    if (c === '}') {
      if (top.depth === 0 && stack.length > 1) { stack.pop(); L.push('punct', c); continue; }
      top.depth = Math.max(0, top.depth - 1); L.push('punct', c); continue;
    }
    L.push('punct', c);
  }
  return L.out;
}

var SH = {
  comment: /#[^\n]*/y,
  variable: /\$\{[^}\n]*\}?|\$[\w@#?$!*-]+/y,
  assign: /[A-Za-z_][\w]*=/y,
  flag: /--?[\w][\w-]*/y,
  word: /[^\s|&;<>()"'$`\\]+/y,
  op: /&&|\|\||[|;&<>()]|\$\(/y
};
function tokenizeSh(src) {
  var L = lexer(src), n = src.length, cmd = true, t;
  while (L.i < n) {
    var c = src[L.i], prev = src[L.i - 1] || '\n';
    if (c === '\\' && src[L.i + 1] === '\n') { L.push('punct', '\\'); L.push('ws', '\n'); continue; }
    if (c === '\n') { L.push('ws', '\n'); cmd = true; continue; }
    if ((t = L.at(/[ \t]+/y))) { L.push('ws', t); continue; }
    if (/\s/.test(prev) && (t = L.at(SH.comment))) { L.push('comment', t); continue; }
    if ((t = L.at(RE.dq)) || (t = L.at(RE.sq))) { L.push('string', t); cmd = false; continue; }
    if ((t = L.at(SH.op))) { L.push('punct', t); cmd = t !== '>' && t !== '<' && t !== ')'; continue; }
    if ((t = L.at(SH.variable))) { L.push('property', t); cmd = false; continue; }
    if (cmd && (t = L.at(SH.assign))) {
      L.push('property', t);
      if ((t = L.at(RE.dq)) || (t = L.at(RE.sq))) L.push('string', t);
      else if ((t = L.at(/[^\s;|&]+/y))) L.push('plain', t);
      continue;
    }
    if (/\s/.test(prev) && (t = L.at(SH.flag))) { L.push('flag', t); continue; }
    if ((t = L.at(SH.word))) {
      if (SH_KEYWORDS.indexOf(t) >= 0) { L.push('keyword', t); cmd = t !== 'in' && t !== 'export' && t !== 'local'; continue; }
      if (cmd) { L.push('function', t); cmd = t === 'sudo'; continue; }
      L.push(/^\d+(\.\d+)?$/.test(t) ? 'number' : 'plain', t); continue;
    }
    L.push('punct', c);
  }
  return L.out;
}

var CSS = {
  comment: /\/\*[\s\S]*?(?:\*\/|$)/y,
  atRule: /@[\w-]+/y,
  prop: /-{0,2}[A-Za-z][\w-]*(?=\s*:[^{};]*(?:;|\}|\)|$))/my,
  hex: /#[\da-fA-F]{3,8}\b/y,
  num: /-?(?:\d+\.?\d*|\.\d+)(?:%|[a-zA-Z]+)?/y,
  fn: /[\w-]+(?=\()/y,
  important: /!important/y,
  custom: /--[\w-]+/y,
  ident: /[\w-]+/y,
  selector: /(?:[.#]?-?[A-Za-z_][\w-]*|::?[\w-]+|\[[^\]]*\]|\*|&)/y
};
function tokenizeCss(src) {
  var L = lexer(src), n = src.length, depth = 0, inValue = false, t;
  while (L.i < n) {
    var c = src[L.i];
    if ((t = L.at(RE.ws))) { L.push('ws', t); continue; }
    if ((t = L.at(CSS.comment))) { L.push('comment', t); continue; }
    if ((t = L.at(RE.dq)) || (t = L.at(RE.sq))) { L.push('string', t); continue; }
    if (c === '{') { depth++; inValue = false; L.push('punct', c); continue; }
    if (c === '}') { depth = Math.max(0, depth - 1); inValue = false; L.push('punct', c); continue; }
    if (c === ';') { inValue = false; L.push('punct', c); continue; }
    if ((t = L.at(CSS.atRule))) {
      L.push('keyword', t);
      /* the prelude: (max-width: 600px) and screen */
      while (L.i < n && !/[{;]/.test(src[L.i])) {
        if ((t = L.at(RE.ws))) L.push('ws', t);
        else if ((t = L.at(RE.dq)) || (t = L.at(RE.sq))) L.push('string', t);
        else if ((t = L.at(CSS.prop))) L.push('property', t);
        else if ((t = L.at(CSS.num))) L.push('number', t);
        else if ((t = L.at(CSS.ident))) L.push('plain', t);
        else L.push('punct', src[L.i]);
      }
      continue;
    }
    if (inValue) {
      if ((t = L.at(CSS.important))) { L.push('keyword', t); continue; }
      if ((t = L.at(CSS.hex)) || (t = L.at(CSS.num))) { L.push('number', t); continue; }
      if ((t = L.at(CSS.fn))) { L.push('function', t); continue; }
      if ((t = L.at(CSS.custom))) { L.push('property', t); continue; }
      if ((t = L.at(CSS.ident))) { L.push('plain', t); continue; }
      L.push('punct', c); continue;
    }
    if (depth > 0 && (t = L.at(CSS.prop))) {
      L.push('property', t);
      if ((t = L.at(/\s*/y))) L.push('ws', t);
      L.push('punct', ':'); inValue = true; continue;
    }
    if ((t = L.at(CSS.selector))) { L.push('class', t); continue; }
    L.push('punct', c);
  }
  return L.out;
}

var LANGS = {
  js: 'js', jsx: 'jsx', javascript: 'jsx', mjs: 'js', cjs: 'js', next: 'jsx',
  ts: 'ts', typescript: 'ts', tsx: 'jsx', json: 'json', jsonc: 'json',
  bash: 'sh', sh: 'sh', shell: 'sh', zsh: 'sh', console: 'sh', css: 'css', scss: 'css', diff: 'diff'
};
function tokenize(code, language) {
  var lang = LANGS[String(language || '').toLowerCase()];
  if (lang === 'js' || lang === 'jsx') return tokenizeJs(code, true);
  if (lang === 'ts' || lang === 'json') return tokenizeJs(code, false);
  if (lang === 'sh') return tokenizeSh(code);
  if (lang === 'css') return tokenizeCss(code);
  return [['plain', code]];
}
/* split a token stream into lines, keeping token types across line breaks */
function toLines(tokens) {
  var lines = [[]];
  tokens.forEach(function (tk) {
    var parts = tk[1].split('\n');
    parts.forEach(function (p, i) {
      if (i > 0) lines.push([]);
      if (p) lines[lines.length - 1].push([tk[0], p]);
    });
  });
  return lines;
}

var LANG_ICON = { jsx: 'file-code', js: 'file-code', ts: 'file-code', json: 'braces', sh: 'terminal', css: 'hash', diff: 'file-diff' };

function CodeBlock(props) {
  var code = String(props.children == null ? '' : props.children).replace(/\n$/, '');
  var language = props.language || props.syntax;
  var lang = LANGS[String(language || '').toLowerCase()];
  var lines = useMemo(function () { return toLines(tokenize(code, language)); }, [code, language]);
  var raw = code.split('\n');
  var rid = useId();
  var id = props.id || 'cb' + rid.replace(/[^\w]/g, '');
  var refSt = useState(null), refLine = refSt[0];
  var copySt = useState('idle');
  var timer = useRef(null);
  useEffect(function () {
    var m = new RegExp('^#' + id + '-L(\\d+)$').exec(window.location.hash || '');
    if (m) refSt[1](+m[1]);
    return function () { clearTimeout(timer.current); };
  }, []);

  var hl = props.highlightedLinesNumbers || [], added = props.addedLinesNumbers || [], removed = props.removedLinesNumbers || [];
  function kind(n, text) {
    if (lang === 'diff') return /^\+/.test(text) ? 'added' : (/^-/.test(text) ? 'removed' : null);
    if (added.indexOf(n) >= 0) return 'added';
    if (removed.indexOf(n) >= 0) return 'removed';
    return null;
  }
  function onCopy() {
    var text = lang === 'diff' ? code : raw.filter(function (l, i) { return removed.indexOf(i + 1) < 0; }).join('\n');
    Promise.resolve(copyText(text)).then(function () { copySt[1]('copied'); if (props.onCopy) props.onCopy(); }, function () { copySt[1]('failed'); });
    clearTimeout(timer.current);
    timer.current = setTimeout(function () { copySt[1]('idle'); }, 2000);
  }
  function onRef(n) {
    var next = refLine === n ? null : n;
    refSt[1](next);
    try { window.history.replaceState(null, '', next ? '#' + id + '-L' + next : window.location.pathname + window.location.search); } catch (e) { /* sandboxed */ }
  }

  var digits = String(lines.length).length;
  var copyBtn = h('button', { type: 'button', className: 'hy-cb__copy', onClick: onCopy, 'aria-label': 'Copy Code' },
    h(Glyph, { name: copySt[0] === 'copied' ? 'check' : 'copy' }));
  var sw = props.switcher;
  var switcher = sw && sw.options ? h('label', { className: 'hy-cb__switch' },
    h('span', { className: 'hy-sr' }, 'Language'),
    h('select', { value: sw.value, onChange: function (e) { if (sw.onChange) sw.onChange(e.target.value); } },
      sw.options.map(function (o) { return h('option', { key: o.value, value: o.value }, o.label); })),
    h(Glyph, { name: 'chevron', size: 16 })) : null;

  var header = props.filename || switcher ? h('div', { className: 'hy-cb__header' },
    h('div', { className: 'hy-cb__file' },
      h(HY.Icon, { name: LANG_ICON[lang] || 'file', size: 16 }),
      props.filename ? h('span', { className: 'hy-cb__filename' }, props.filename) : null),
    switcher, copyBtn) : null;

  var block = h('div', { className: cx('hy-cb', !header && 'hy-cb--bare', props.hideLineNumbers && 'hy-cb--no-numbers', !props.tabs && props.className), id: props.tabs ? undefined : props.id },
    header,
    h('pre', { className: 'hy-cb__pre', tabIndex: 0, role: 'region', 'aria-label': props['aria-label'] || props.filename || 'Code', translate: 'no', 'data-language': language },
      h('code', { className: 'hy-cb__code', style: { '--hy-cb-digits': digits + 'ch' } },
        lines.map(function (toks, i) {
          var n = i + 1, k = kind(n, raw[i] || '');
          var isHl = hl.indexOf(n) >= 0 || refLine === n;
          return h('span', { key: i, id: id + '-L' + n, className: cx('hy-cb__line', isHl && 'is-highlighted', k && 'is-' + k) },
            props.hideLineNumbers ? null : h('button', { type: 'button', tabIndex: -1, 'aria-hidden': 'true', className: 'hy-cb__num', onClick: function () { onRef(n); } },
              k ? h('span', { className: 'hy-cb__mark' }, k === 'added' ? '+' : '-') : null, n),
            h('span', { className: 'hy-cb__text' }, toks.length ? toks.map(function (tk, j) {
              return tk[0] === 'plain' || tk[0] === 'ws' ? tk[1] : h('span', { key: j, className: 'hy-tok-' + tk[0] }, tk[1]);
            }) : '​'),
            k ? h('span', { className: 'hy-sr' }, k === 'added' ? ' (added)' : ' (removed)') : null);
        }))),
    header ? null : copyBtn,
    h('span', { className: 'hy-sr', 'aria-live': 'polite' }, copySt[0] === 'copied' ? 'Copied to clipboard' : (copySt[0] === 'failed' ? 'Copy failed. Select the code and copy it manually.' : '')));

  if (!props.tabs || !props.tabs.options) return block;
  var tb = props.tabs;
  var idx = Math.max(0, tb.options.map(function (o) { return o.value; }).indexOf(tb.value));
  function onTabKey(e) {
    var d = e.key === 'ArrowRight' ? 1 : (e.key === 'ArrowLeft' ? -1 : 0);
    var to = e.key === 'Home' ? 0 : (e.key === 'End' ? tb.options.length - 1 : (idx + d + tb.options.length) % tb.options.length);
    if (!d && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    if (tb.onChange) tb.onChange(tb.options[to].value);
    var btns = e.currentTarget.querySelectorAll('[role=tab]');
    if (btns[to]) btns[to].focus();
  }
  return h('div', { className: cx('hy-cb-tabs', props.className), id: props.id },
    h('div', { className: 'hy-cb-tabs__list', role: 'tablist', 'aria-label': 'Language', onKeyDown: onTabKey },
      tb.options.map(function (o, i) {
        return h('button', { key: o.value, type: 'button', role: 'tab', 'aria-selected': i === idx, tabIndex: i === idx ? 0 : -1,
          className: 'hy-cb-tabs__tab', onClick: function () { if (tb.onChange) tb.onChange(o.value); } }, o.label);
      })),
    block);
}
CodeBlock.tokenize = tokenize;

define('CodeBlock', CodeBlock);
