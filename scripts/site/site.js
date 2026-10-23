/* The docs site's script: theme toggle, phone nav, search, copy buttons and live examples. Copied by scripts/site.mjs. */
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

  /* ---------- Search: a combobox with a listbox popup over search-index.json ---------- */
  var search = document.querySelector('.search'), input = document.getElementById('search-input');
  if (search && input) (function () {
    var base = search.getAttribute('data-base') || '', list = document.getElementById('search-list');
    var status = document.getElementById('search-status'), toggle = search.querySelector('.search-toggle');
    var hint = search.querySelector('.search-hint');
    var index = null, loading = null, results = [], active = -1;
    var mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
    if (hint) hint.textContent = mac ? '⌘K' : 'Ctrl K';

    function load() {
      if (!loading) loading = fetch(base + 'search-index.json').then(function (r) { return r.json(); })
        .then(function (data) { index = data; if (input.value.trim()) update(); }, function () { index = []; });
      return loading;
    }
    // Component name prefix, then name substring, then heading and page title matches, then summaries, then headings
    // whose page title matches.
    var TYPE = { component: 0, page: 1, heading: 2 };
    function rank(e, q) {
      var n = e.name.toLowerCase(), at = n.indexOf(q);
      if (e.type === 'component' && at > -1) return at === 0 ? 0 : 1;
      if (at > -1) return at === 0 ? 2 : 3;
      if (e.summary && e.summary.toLowerCase().indexOf(q) > -1) return 4;
      if (e.page && e.page.toLowerCase().indexOf(q) > -1) return 5;
      return -1;
    }
    function find(q) {
      var hits = [];
      (index || []).forEach(function (e, i) { var r = rank(e, q); if (r > -1) hits.push({ e: e, r: r, i: i }); });
      hits.sort(function (a, b) { return a.r - b.r || TYPE[a.e.type] - TYPE[b.e.type] || a.e.name.length - b.e.name.length || a.i - b.i; });
      return hits.slice(0, 10).map(function (h) { return h.e; });
    }
    function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
    // The name with the matched part in <strong>, built from text nodes so nothing in the index is read as HTML.
    function marked(name, q) {
      var span = el('span', 'hy-menu__text'), at = name.toLowerCase().indexOf(q);
      if (at < 0) { span.textContent = name; return span; }
      span.appendChild(document.createTextNode(name.slice(0, at)));
      span.appendChild(el('strong', null, name.slice(at, at + q.length)));
      span.appendChild(document.createTextNode(name.slice(at + q.length)));
      return span;
    }

    function setOpen(open) {
      list.hidden = !open;
      input.setAttribute('aria-expanded', String(open));
      if (!open) { active = -1; input.removeAttribute('aria-activedescendant'); }
    }
    function setActive(i) {
      active = i;
      list.querySelectorAll('[role="option"]').forEach(function (o, k) { o.setAttribute('aria-selected', String(k === i)); });
      var opt = document.getElementById('search-opt-' + i);
      if (opt) { input.setAttribute('aria-activedescendant', opt.id); opt.scrollIntoView({ block: 'nearest' }); }
      else input.removeAttribute('aria-activedescendant');
    }
    function update() {
      var raw = input.value.trim(), q = raw.toLowerCase();
      list.textContent = '';
      if (!q) { setOpen(false); status.textContent = ''; return; }
      if (!index) { load(); return; }
      results = find(q);
      if (!results.length) {
        list.appendChild(el('li', 'search-empty copy-14', 'No Results for “' + raw + '”')).setAttribute('role', 'presentation');
        status.textContent = 'No results';
        setOpen(true); setActive(-1);
        return;
      }
      var groups = [], bySection = {};
      results.forEach(function (e, i) {
        if (!bySection[e.section]) { bySection[e.section] = []; groups.push(e.section); }
        bySection[e.section].push(i);
      });
      // Groups keep the order of their best result; options are numbered in the order they are shown.
      var order = [];
      groups.forEach(function (g, gi) {
        var li = el('li'); li.setAttribute('role', 'presentation');
        var title = el('div', 'hy-menu__section-title', g); title.id = 'search-g-' + gi; title.setAttribute('role', 'presentation');
        var ul = el('ul', 'hy-menu__group'); ul.setAttribute('role', 'group'); ul.setAttribute('aria-labelledby', title.id);
        bySection[g].forEach(function (ri) {
          var e = results[ri], n = order.length;
          order.push(e);
          var opt = el('li', 'hy-menu__item search-opt');
          opt.id = 'search-opt-' + n; opt.setAttribute('role', 'option'); opt.setAttribute('aria-selected', 'false');
          var stack = el('span', 'hy-menu__stack');
          stack.appendChild(marked(e.name, q));
          stack.appendChild(el('span', 'hy-menu__desc', e.type === 'heading' ? e.page : e.summary));
          opt.appendChild(stack);
          opt.addEventListener('mousedown', function (ev) { ev.preventDefault(); });
          opt.addEventListener('mousemove', function () { if (active !== n) setActive(n); });
          opt.addEventListener('click', function () { go(n); });
          ul.appendChild(opt);
        });
        li.appendChild(title); li.appendChild(ul); list.appendChild(li);
      });
      results = order;
      status.textContent = results.length + (results.length === 1 ? ' result' : ' results');
      setOpen(true); setActive(0);
    }
    function go(i) {
      var e = results[i];
      if (!e) return;
      setOpen(false);
      location.href = base + e.url;
    }
    function openSearch() {
      root.classList.add('search-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'true');
      input.focus(); input.select();
    }
    function closeSearch(refocus) {
      setOpen(false);
      if (!root.classList.contains('search-open')) return;
      root.classList.remove('search-open');
      if (toggle) { toggle.setAttribute('aria-expanded', 'false'); if (refocus && getComputedStyle(toggle).display !== 'none') toggle.focus(); }
    }

    input.addEventListener('focus', function () { load(); if (input.value.trim()) update(); });
    input.addEventListener('input', update);
    input.addEventListener('keydown', function (e) {
      var n = results.length, open = !list.hidden;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!open) { update(); return; }
        if (n) setActive(e.key === 'ArrowDown' ? (active + 1) % n : (active - 1 + n) % n);
      } else if (e.key === 'Home' && open && n) { e.preventDefault(); setActive(0); }
      else if (e.key === 'End' && open && n) { e.preventDefault(); setActive(n - 1); }
      else if (e.key === 'Enter') { if (open && active > -1) { e.preventDefault(); go(active); } }
      else if (e.key === 'Escape') {
        e.preventDefault(); e.stopPropagation();
        if (open) setOpen(false);
        else if (input.value) { input.value = ''; update(); }
        else { closeSearch(true); input.blur(); }
      }
    });
    if (toggle) toggle.addEventListener('click', openSearch);
    search.querySelector('.search-close').addEventListener('click', function () { input.value = ''; update(); closeSearch(true); });
    document.addEventListener('pointerdown', function (e) { if (!search.contains(e.target)) closeSearch(false); });

    // ⌘K / Ctrl+K and / open the search, except while typing in a field (or when the page already handled the key).
    document.addEventListener('keydown', function (e) {
      if (e.defaultPrevented || e.target === input) return;
      var t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      var k = (e.key || '').toLowerCase();
      if (typing) return;
      if ((k === 'k' && (e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey) || (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey)) {
        e.preventDefault();
        openSearch();
      }
    });
  })();

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
