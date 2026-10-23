// A small markdown to HTML converter for the subset the repo's docs use: headings with ids, paragraphs, **bold**,
// *italic* and _italic_, `code`, [links](…), nested bullet and numbered lists, fenced code, tables and backslash escapes.
// Usage: md(source, { link: (href) => href, classes: { h2: 'heading-24', p: 'copy-16' }, shift: 0 })
//   link     rewrites every link target
//   classes  a class for each tag it writes (h1–h6, p, ul, ol, li, table, pre)
//   shift    adds to every heading level (1 turns ## into <h3>)

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// The id a heading gets: its text without markup, lowercased, runs of anything else as one dash.
export const slug = (s) => s.replace(/`|\*\*|\[([^\]]*)\]\([^)]*\)/g, '$1').toLowerCase()
  .replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const FENCE = /^(\s*)(`{3,}|~{3,})\s*([\w+-]*)\s*$/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const ITEM = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const indentOf = (l) => l.match(/^\s*/)[0].length;
const isTableSep = (l) => /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(l) && l.includes('-');

export function inline(text, opt = {}) {
  const held = [];
  const hold = (html) => `\u0000${held.push(html) - 1}\u0000`;
  let s = text
    .replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_, __, code) => hold(`<code>${esc(code.replace(/^ (.*) $/, '$1'))}</code>`))
    .replace(/\\([\\`*_[\]()#+\-.!|<>{}])/g, (_, c) => hold(esc(c)));
  s = esc(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
      const to = opt.link ? opt.link(href.replace(/&amp;/g, '&')) : href.replace(/&amp;/g, '&');
      return hold(`<a href="${esc(to)}">`) + label + hold('</a>');
    })
    .replace(/\*\*(?!\s)([\s\S]+?)(?<!\s)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w*])\*(?![\s*])([\s\S]+?)(?<![\s*])\*(?![\w*])/g, '$1<em>$2</em>')
    .replace(/(^|[^\w])_(?![\s_])([\s\S]+?)(?<![\s_])_(?!\w)/g, '$1<em>$2</em>');
  for (let i = 0; i < 3 && s.includes('\u0000'); i++) s = s.replace(/\u0000(\d+)\u0000/g, (_, n) => held[+n]);
  return s;
}

// Splits a table row into cells. `\|` is a literal pipe, also inside code, as in GitHub's tables.
function cells(row) {
  const out = [];
  let cur = '';
  const s = row.trim().replace(/^\|/, '').replace(/(?<!\\)\|$/, '');
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && s[i + 1] === '|') { cur += '|'; i++; }
    else if (s[i] === '|') { out.push(cur.trim()); cur = ''; }
    else cur += s[i];
  }
  out.push(cur.trim());
  return out;
}

export function md(src, opt = {}) {
  const ids = new Map();
  const cls = (tag) => (opt.classes?.[tag] ? ` class="${opt.classes[tag]}"` : '');
  const uniq = (id) => { const n = ids.get(id) || 0; ids.set(id, n + 1); return n ? `${id}-${n}` : id; };
  const inl = (t) => inline(t, opt);

  // tight: the first paragraph of a list item renders without <p>, unless the item holds several paragraphs.
  function blocks(lines, tight = false) {
    const out = [];
    let paras = 0;
    for (let i = 0; i < lines.length;) {
      const line = lines[i];
      if (!line.trim()) { i++; continue; }
      let m;
      if ((m = FENCE.exec(line))) {
        const pad = m[1].length, mark = m[2], body = [];
        for (i++; i < lines.length && !(lines[i].trim().startsWith(mark[0].repeat(mark.length)) && !lines[i].trim().slice(mark.length).trim()); i++) {
          body.push(lines[i].slice(Math.min(pad, indentOf(lines[i]))));
        }
        i++;
        out.push(`<pre${cls('pre')}${m[3] ? ` data-lang="${esc(m[3])}"` : ''}><code>${esc(body.join('\n'))}</code></pre>`);
        continue;
      }
      if ((m = HEADING.exec(line))) {
        const level = Math.min(6, m[1].length + (opt.shift || 0));
        out.push(`<h${level} id="${uniq(slug(m[2]))}"${cls('h' + level)}>${inl(m[2])}</h${level}>`);
        i++;
        continue;
      }
      if (line.trim().startsWith('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
        const head = cells(line);
        const align = cells(lines[i + 1]).map((c) => (/^:-+:$/.test(c) ? 'center' : /-:$/.test(c) ? 'right' : ''));
        const td = (tag, c, k) => `<${tag}${align[k] ? ` style="text-align:${align[k]}"` : ''}>${inl(c)}</${tag}>`;
        const rows = [];
        for (i += 2; i < lines.length && lines[i].trim().startsWith('|'); i++) rows.push(cells(lines[i]));
        out.push(`<div class="table-wrap"><table${cls('table')}><thead><tr>${head.map((c, k) => td('th', c, k)).join('')}</tr></thead>` +
          `<tbody>${rows.map((r) => `<tr>${head.map((_, k) => td('td', r[k] ?? '', k)).join('')}</tr>`).join('')}</tbody></table></div>`);
        continue;
      }
      if ((m = ITEM.exec(line))) {
        const base = m[1].length, ordered = /\d/.test(m[2]);
        const items = [];
        const start = ordered ? parseInt(m[2], 10) : 1;
        while (i < lines.length) {
          const im = ITEM.exec(lines[i]);
          if (!im || im[1].length !== base || /\d/.test(im[2]) !== ordered) break;
          const pad = im[0].length - im[3].length; // where the item's text starts: nested lines are dedented by this
          const item = [im[3]];
          for (i++; i < lines.length; i++) {
            const l = lines[i];
            if (!l.trim()) {
              const next = lines.slice(i + 1).find((x) => x.trim());
              if (next !== undefined && indentOf(next) > base) { item.push(''); continue; }
              break;
            }
            if (indentOf(l) > base) { item.push(l.slice(Math.min(pad, indentOf(l)))); continue; }
            if (ITEM.test(l) || FENCE.test(l) || HEADING.test(l) || item[item.length - 1] === '') break;
            item.push(l); // a lazy continuation of the item's paragraph
          }
          while (item.length && !item[item.length - 1].trim()) item.pop();
          items.push(item);
        }
        const tag = ordered ? 'ol' : 'ul';
        out.push(`<${tag}${cls(tag)}${ordered && start !== 1 ? ` start="${start}"` : ''}>` +
          items.map((it) => `<li${cls('li')}>${blocks(it, true)}</li>`).join('') + `</${tag}>`);
        continue;
      }
      const para = [];
      for (; i < lines.length && lines[i].trim(); i++) {
        if (para.length && (FENCE.test(lines[i]) || HEADING.test(lines[i]) || ITEM.test(lines[i]))) break;
        if (para.length && lines[i].trim().startsWith('|') && isTableSep(lines[i + 1] || '')) break;
        para.push(lines[i].trim());
      }
      out.push({ p: inl(para.join('\n')) });
      paras++;
    }
    return out.map((b, k) => (typeof b === 'string' ? b : tight && paras === 1 && k === 0 ? b.p : `<p${cls('p')}>${b.p}</p>`)).join('\n');
  }

  return blocks(src.replace(/\r\n?/g, '\n').split('\n')) + '\n';
}

// Splits markdown at its headings of one level (outside fences): [{ title, slug, body }], the text before the first one
// as { title: null }. body keeps the heading line.
export function sections(src, level = 2) {
  const out = [{ title: null, slug: '', body: [] }];
  let fence = null;
  for (const line of src.split('\n')) {
    const f = FENCE.exec(line);
    if (f && (!fence || line.trim().startsWith(fence))) fence = fence ? null : f[2];
    const m = !fence && !f && HEADING.exec(line);
    if (m && m[1].length === level) out.push({ title: m[2], slug: slug(m[2]), body: [] });
    out[out.length - 1].body.push(line);
  }
  return out.map((s) => ({ ...s, body: s.body.join('\n').trim() + '\n' }));
}
