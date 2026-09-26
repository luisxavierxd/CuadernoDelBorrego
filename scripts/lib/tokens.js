// Lee shared/css/tokens.css y resuelve las variables de cada combinación
// tema × materia, en el mismo orden de cascada que el navegador.
'use strict';
const fs = require('fs');
const path = require('path');

const TOKENS = path.join(__dirname, '..', '..', 'shared', 'css', 'tokens.css');

function parseBlocks(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const blocks = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(clean))) {
    const decls = {};
    // Los data URI llevan ';' dentro de comillas: separa respetando comillas y paréntesis.
    let depth = 0, quote = null, cur = '';
    const parts = [];
    for (const ch of m[2]) {
      if (quote) { if (ch === quote) quote = null; cur += ch; continue; }
      if (ch === '"' || ch === "'") { quote = ch; cur += ch; continue; }
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ';' && depth === 0) { parts.push(cur); cur = ''; continue; }
      cur += ch;
    }
    parts.push(cur);
    for (const p of parts) {
      const i = p.indexOf(':');
      if (i < 0) continue;
      const name = p.slice(0, i).trim();
      if (name.startsWith('--')) decls[name] = p.slice(i + 1).trim();
    }
    blocks.push({ selector: m[1].trim().replace(/\s+/g, ' '), decls });
  }
  return blocks;
}

// Qué bloques aplican para un tema y una materia dados.
function applies(selector, theme, subject) {
  return selector.split(',').some((sel) => {
    sel = sel.trim();
    const needsDark = sel.includes('[data-theme="dark"]');
    if (needsDark && theme !== 'dark') return false;
    const subj = sel.match(/data-subject="(\w+)"/);
    if (subj && subj[1] !== subject) return false;
    return true;
  });
}

function specificity(selector) {
  return (selector.includes('body') ? 100 : 0) + (selector.match(/\[/g) || []).length * 10;
}

function resolveEnv(theme, subject, css = fs.readFileSync(TOKENS, 'utf8')) {
  const blocks = parseBlocks(css)
    .map((b, i) => ({ ...b, i }))
    .filter((b) => applies(b.selector, theme, subject))
    // body hereda de :root, así que los bloques de body ganan siempre; luego especificidad y orden.
    .sort((a, b) => specificity(a.selector) - specificity(b.selector) || a.i - b.i);
  const env = {};
  for (const b of blocks) Object.assign(env, b.decls);
  const get = (name, seen = new Set()) => {
    if (seen.has(name)) throw new Error('Ciclo en ' + name);
    seen.add(name);
    const raw = env[name];
    if (raw === undefined) return undefined;
    return raw.replace(/var\((--[\w-]+)\)/g, (_, n) => get(n, seen) ?? '');
  };
  return { get, names: Object.keys(env) };
}

function parseColor(s) {
  if (!s) return null;
  s = s.trim();
  let m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
  }
  m = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/i);
  if (m) return { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] };
  if (s === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  return null;
}

function over(fg, bg) {
  const a = fg.a;
  return { r: fg.r * a + bg.r * (1 - a), g: fg.g * a + bg.g * (1 - a), b: fg.b * a + bg.b * (1 - a), a: 1 };
}

function luminance(c) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}

function ratio(a, b) {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

module.exports = { TOKENS, parseBlocks, resolveEnv, parseColor, over, ratio };
