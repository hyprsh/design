/* The docs site's script: theme toggle, phone nav, nav filter, copy buttons and live examples. Copied by scripts/site.mjs. */
(function () {
  var root = document.documentElement, KEY = 'hyprsh-docs-theme';
  var dark = window.matchMedia('(prefers-color-scheme: dark)');
  function saved() { try { var t = localStorage.getItem(KEY); return t === 'light' || t === 'dark' ? t : null; } catch (e) { return null; } }

  /* ---------- Theme ---------- */
  var themeBtn = document.querySelector('.theme-btn');
  function apply(t) {
    root.setAttribute('data-theme', t);
    if (themeBtn) themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
    document.querySelectorAll('iframe.card').forEach(function (f) { try { f.contentWindow.postMessage({ theme: t }, '*'); } catch (e) {} });
  }
  apply(root.getAttribute('data-theme') || 'light');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, t); } catch (e) {}
    apply(t);
  });
  var follow = function () { if (!saved()) apply(dark.matches ? 'dark' : 'light'); };
  if (dark.addEventListener) dark.addEventListener('change', follow); else if (dark.addListener) dark.addListener(follow);
  /* A card that loads after a toggle reads the theme from this page itself; this covers one that loaded before. */
  /* Cards grow to their content, which wraps onto more rows at phone width. */
  document.querySelectorAll('iframe.card').forEach(function (f) {
    function fit() { try { var d = f.contentDocument.documentElement; if (d.scrollHeight > 0) f.style.height = d.scrollHeight + 'px'; } catch (e) {} }
    function ready() {
      try { f.contentWindow.postMessage({ theme: root.getAttribute('data-theme') }, '*'); } catch (e) {}
      fit(); setTimeout(fit, 300);
      try { if (window.ResizeObserver) new ResizeObserver(fit).observe(f.contentDocument.body); } catch (e) {}
    }
    f.addEventListener('load', ready);
    try { if (f.contentDocument && f.contentDocument.readyState === 'complete' && f.contentDocument.body && f.contentDocument.body.children.length) ready(); } catch (e) {}
  });

  /* ---------- Phone nav ---------- */
  var menuBtn = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  function setNav(open) { root.classList.toggle('nav-open', open); if (menuBtn) menuBtn.setAttribute('aria-expanded', String(open)); }
  if (menuBtn) menuBtn.addEventListener('click', function () { setNav(!root.classList.contains('nav-open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('nav-open')) { setNav(false); menuBtn.focus(); } });

  /* ---------- Nav filter ---------- */
  var filter = document.querySelector('.nav-filter');
  if (filter) filter.addEventListener('input', function () {
    var q = filter.value.trim().toLowerCase(), any = false;
    nav.querySelectorAll('[data-group]').forEach(function (g) {
      var shown = 0;
      g.querySelectorAll('a[data-name]').forEach(function (a) {
        var hit = !q || a.getAttribute('data-name').indexOf(q) > -1;
        a.hidden = !hit; if (hit) shown++;
      });
      g.hidden = !shown; if (shown) any = true;
    });
    nav.querySelector('.nav-empty').hidden = any;
  });
  var current = nav && nav.querySelector('[aria-current="page"]');
  if (current && current.scrollIntoView && current.offsetTop > nav.clientHeight - 80) nav.scrollTop = current.offsetTop - nav.clientHeight / 2;

  /* ---------- Copy buttons ---------- */
  document.querySelectorAll('main pre').forEach(function (pre) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'copy label-12'; b.textContent = 'Copy';
    b.setAttribute('aria-label', 'Copy Code');
    b.addEventListener('click', function () {
      var text = pre.querySelector('code').textContent;
      var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { b.textContent = 'Copy Failed'; });
    });
    pre.appendChild(b);
  });

  /* ---------- Live examples ---------- */
  var boxes = document.querySelectorAll('[data-example]');
  if (!boxes.length) return;
  window.__exampleErrors = [];
  var R = window.React, RD = window.ReactDOM, H = window.Hyprsh;

  function iconName(n) {
    var base = n.replace(/^Lucide/, '').replace(/Icon$/, '') || n;
    var k = base.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
    var tries = [k.replace(/([a-z])(\d)/g, '$1-$2'), k, k.replace(/([a-z])(\d)/g, '$1-$2').replace(/(\d)([a-z])/g, '$1-$2')];
    for (var i = 0; i < tries.length; i++) if (H.Icon.names.indexOf(tries[i]) > -1) return tries[i];
    throw new Error('lucide-react: no icon “' + n + '” in the bundled Lucide set');
  }
  /* GitBranch from lucide-react becomes <Icon name="git-branch" {...props}/> from the bundle. */
  function lucide(n) {
    var name = iconName(n);
    var C = function (props) { var p = Object.assign({}, props, { name: name }); delete p.absoluteStrokeWidth; return R.createElement(H.Icon, p); };
    C.displayName = n;
    return C;
  }

  // Strips the imports (only @hyprsh/design, react and lucide-react), binds what they name, compiles with Babel and
  // returns the Example component. Names an example doesn't import are not in scope, so a copied example runs as shown.
  function compile(code) {
    var scope = { React: R };
    var src = code.replace(/^[ \t]*import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"];?[ \t]*$/gm, function (_, what, from) {
      var lib = from === 'react' ? R : from === '@hyprsh/design' ? H : from === 'lucide-react' ? 'lucide' : null;
      if (!lib) throw new Error('Only @hyprsh/design, react and lucide-react can be imported in an example, not “' + from + '”');
      var named = /\{([\s\S]*)\}/.exec(what);
      var rest = what.replace(/\{[\s\S]*\}/, '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      rest.forEach(function (d) {
        var ns = /^\*\s+as\s+(\w+)$/.exec(d);
        if (lib === 'lucide') throw new Error('Import icons from lucide-react by name');
        scope[ns ? ns[1] : d] = lib;
      });
      if (named) named[1].split(',').map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (s) {
        var m = /^(?:type\s+)?(\w+)(?:\s+as\s+(\w+))?$/.exec(s);
        if (!m) throw new Error('Cannot read the import “' + s + '”');
        if (lib === 'lucide') scope[m[2] || m[1]] = lucide(m[1]);
        else if (lib[m[1]] === undefined) throw new Error(from + ' has no export “' + m[1] + '”');
        else scope[m[2] || m[1]] = lib[m[1]];
      });
      return '';
    });
    if (/^\s*import\s/m.test(src)) throw new Error('Unsupported import: ' + /^\s*import\s.*$/m.exec(src)[0].trim());
    var def = /export\s+default\s+function\s*(\w*)\s*\(/.exec(src);
    var body;
    if (def) body = src.replace(def[0], 'function ' + (def[1] || 'Example') + '(') + '\nreturn ' + (def[1] || 'Example') + ';';
    else body = 'return function Example() { return (' + src.trim().replace(/;\s*$/, '') + '\n); };';
    var js = window.Babel.transform(body, { presets: ['react'], parserOpts: { allowReturnOutsideFunction: true } }).code;
    var names = Object.keys(scope);
    return Function.apply(null, names.concat(js)).apply(null, names.map(function (k) { return scope[k]; }));
  }

  function report(box, e) {
    var message = String((e && e.message) || e);
    window.__exampleErrors.push({ component: box.getAttribute('data-component'), title: box.getAttribute('data-title'), message: message });
    return message;
  }
  function showError(box, message) {
    var pre = document.createElement('pre');
    pre.className = 'example-error copy-13-mono';
    pre.setAttribute('role', 'alert');
    pre.textContent = message;
    box.textContent = '';
    box.appendChild(pre);
  }

  var Boundary = null;
  if (R) {
    Boundary = function (props) { R.Component.call(this, props); this.state = { error: null }; };
    Boundary.prototype = Object.create(R.Component.prototype);
    Boundary.prototype.constructor = Boundary;
    Boundary.getDerivedStateFromError = function (error) { return { error: error }; };
    Boundary.prototype.componentDidCatch = function (error) { report(this.props.box, error); };
    Boundary.prototype.render = function () {
      return this.state.error ? R.createElement('pre', { className: 'example-error copy-13-mono', role: 'alert' }, String(this.state.error.message || this.state.error)) : this.props.children;
    };
  }

  boxes.forEach(function (box) {
    try {
      if (!R || !RD || !H) throw new Error('React or the component bundle did not load');
      if (!window.Babel) throw new Error('Babel did not load, so the example cannot be compiled');
      var code = box.parentNode.querySelector('pre code').textContent;
      var Example = compile(code);
      var rootEl = RD.createRoot(box);
      RD.flushSync(function () { rootEl.render(R.createElement(Boundary, { box: box }, R.createElement(Example))); });
    } catch (e) { showError(box, report(box, e)); }
  });
  /* Effects run after the synchronous render; give them a moment before declaring the examples done. */
  setTimeout(function () { window.__examplesDone = true; }, 500);
})();
