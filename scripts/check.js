#!/usr/bin/env node
// Validación estática del sitio (§11).
//   node scripts/check.js            todo, incluidos links externos (HEAD)
//   node scripts/check.js --offline  sin red
'use strict';
const fs = require('fs');
const path = require('path');
const { loadData } = require('./lib/load');

const ROOT = path.join(__dirname, '..');
const OFFLINE = process.argv.includes('--offline');
const COURSE_DIRS = require('./lib/courses').courses();
const FOOTER = 'Proyecto de alumnos, no oficial';
const IGNORE_DIRS = new Set(['.git', 'node_modules', 'docs', 'notes', 'scripts', 'reference', '.claude', 'design-system', 'test-results']);

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const pad = (n) => String(n).padStart(2, '0');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const FILES = walk(ROOT);
const HTML = FILES.filter((f) => f.endsWith('.html'));
const tokensCss = fs.readFileSync(path.join(ROOT, 'shared/css/tokens.css'), 'utf8');
const hasToken = (name) => new RegExp('--' + name + '\\s*:').test(tokensCss);

/* ---------- 1. Datos del hub ---------- */
function checkCourses() {
  const w = loadData(path.join(ROOT, 'data/courses.js'));
  const where = 'data/courses.js';
  if (!Array.isArray(w.COURSES) || !w.COURSES.length) return err(where, 'window.COURSES debe ser un arreglo no vacío');
  w.COURSES.forEach((c, i) => {
    const at = `${where} [${i}]`;
    if (!['mat', 'fis'].includes(c.subject)) err(at, `subject inválido "${c.subject}"`);
    if (!c.label) err(at, 'falta label');
    if (!Array.isArray(c.levels) || !c.levels.length) return err(at, 'faltan levels');
    c.levels.forEach((lv) => {
      const lat = `${at} ${lv.level}`;
      if (!/^N[1-3]$/.test(lv.level)) err(lat, 'level debe ser N1, N2 o N3');
      if (!lv.title) err(lat, 'falta title');
      if (!['live', 'soon'].includes(lv.status)) err(lat, `status inválido "${lv.status}"`);
      if (!lv.tone || !hasToken(lv.tone)) err(lat, `tone "${lv.tone}" no existe en tokens.css`);
      if (lv.status === 'live') {
        if (!lv.url) err(lat, 'un curso live necesita url');
        else if (!fs.existsSync(path.join(ROOT, lv.url, 'index.html'))) err(lat, `url "${lv.url}" no tiene index.html`);
      }
    });
  });
}

function checkPresets() {
  const w = loadData(path.join(ROOT, 'data/quiz-presets.js'));
  const where = 'data/quiz-presets.js';
  const P = w.QUIZ_PRESETS;
  if (!P || !Array.isArray(P.presets)) return err(where, 'window.QUIZ_PRESETS.presets debe ser un arreglo');
  if (!/sugerido/.test(P.note || '')) err(where, 'la nota debe decir "sugerido" (§10.2)');
  const ids = new Set();
  P.presets.forEach((p) => {
    if (ids.has(p.id)) err(where, `id repetido ${p.id}`);
    ids.add(p.id);
    if (!['quiz', 'exam'].includes(p.kind)) err(where, `${p.id}: kind inválido`);
    if (!(p.week >= 1 && p.week <= 15)) err(where, `${p.id}: week fuera de 1–15`);
    if (!p.sessions.length || p.sessions.some((n) => !(n >= 1 && n <= 15))) err(where, `${p.id}: sesiones fuera de 1–15`);
  });
}

/* ---------- 2. Cursos y sesiones ---------- */
const SESSION_REQUIRED = ['slug', 'number', 'group', 'title', 'lesson', 'exercises', 'quiz', 'bibliography'];

function checkSession(course, meta, s, file) {
  const where = rel(file);
  const w = loadData(file);
  const d = w.SESSION_DATA;
  if (!d) return err(where, 'no define window.SESSION_DATA');
  SESSION_REQUIRED.forEach((k) => { if (d[k] === undefined) err(where, `falta ${k}`); });
  if (d.slug !== `sesion-${pad(s.n)}`) err(where, `slug "${d.slug}" no coincide con sesion-${pad(s.n)}`);
  if (d.number !== pad(s.n)) err(where, `number "${d.number}" no coincide con ${pad(s.n)}`);
  const lesson = d.lesson || [];
  if (!lesson.some((b) => b.type === 'example')) err(where, 'necesita ≥ 1 ejemplo resuelto');
  if (!((d.exercises || []).length >= 3)) err(where, 'necesita ≥ 3 ejercicios');
  if (!d.lab && !lesson.some((b) => b.type === 'explainer')) err(where, 'necesita lab o explicación gráfica');
  if (!(d.bibliography || []).length) err(where, 'necesita bibliografía');
  const prev = s.n > 1 ? `sesion-${pad(s.n - 1)}` : null;
  const next = s.n < meta.sessions ? `sesion-${pad(s.n + 1)}` : null;
  const slugOf = (x) => (x && typeof x === 'object' ? x.slug : x) || null;
  if (slugOf(d.prev) !== prev) err(where, `prev debe ser ${prev}`);
  if (slugOf(d.next) !== next) err(where, `next debe ser ${next}`);
  const shell = path.join(ROOT, course, 'sesiones', `sesion-${pad(s.n)}`, 'index.html');
  if (!fs.existsSync(shell)) err(where, `falta el shell ${rel(shell)}`);
}

function checkCourse(course) {
  const file = path.join(ROOT, 'data', course, 'course-meta.js');
  const where = rel(file);
  if (!fs.existsSync(file)) return err(where, 'no existe');
  const m = loadData(file).COURSE_META;
  if (!m) return err(where, 'no define window.COURSE_META');
  if (m.slug !== course) err(where, `slug "${m.slug}" ≠ ${course}`);
  if (!['mat', 'fis'].includes(m.subject)) err(where, 'subject debe ser mat o fis');
  if (!/^N[1-3]$/.test(m.level)) err(where, 'level debe ser N1, N2 o N3');
  if (m.sessions !== 15) err(where, 'sessions debe ser 15');
  if (!m.code) err(where, 'falta code (prefijo de etiquetas)');
  const all = (m.groups || []).flatMap((g) => {
    if (!g.id || !g.label) err(where, 'cada grupo necesita id y label');
    return g.sessions || [];
  });
  all.forEach((s, i) => {
    if (s.n !== i + 1) err(where, `las sesiones deben ir de 1 a 15 en orden (encontré ${s.n} en la posición ${i + 1})`);
    if (!s.title) err(where, `S${pad(s.n)} sin título`);
    if (s.lab !== null && typeof s.lab !== 'string') err(where, `S${pad(s.n)}: lab debe ser un tipo o null`);
  });
  if (all.length !== m.sessions) err(where, `hay ${all.length} sesiones y se declaran ${m.sessions}`);
  if (!fs.existsSync(path.join(ROOT, course, 'index.html'))) err(course, 'falta la portada index.html');

  for (const s of all) {
    const bankFile = path.join(ROOT, 'data', course, 'bank', `sesion-${pad(s.n)}.js`);
    if (s.bank && !fs.existsSync(bankFile)) err(where, `S${pad(s.n)} marcada bank pero falta ${rel(bankFile)}`);
    if (!s.bank && fs.existsSync(bankFile)) warnings.push(`${rel(bankFile)} existe pero S${pad(s.n)} no está marcada bank en course-meta`);
    const data = path.join(ROOT, 'data', course, `sesion-${pad(s.n)}.js`);
    const exists = fs.existsSync(data);
    if (s.ready && !exists) err(where, `S${pad(s.n)} marcada ready pero falta ${rel(data)}`);
    if (exists) {
      if (!s.ready) warnings.push(`${rel(data)} existe pero S${pad(s.n)} no está marcada ready en course-meta`);
      checkSession(course, m, s, data);
    }
  }
}

/* ---------- 2b. Versiones: lo que prueba Node = lo que carga el sitio ---------- */
function checkVersions() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const dev = pkg.devDependencies || {};
  const reg = fs.readFileSync(path.join(ROOT, 'shared/js/labs/registry.js'), 'utf8');
  const cdn = (reg.match(/mathjs@([\d.]+)/) || [])[1];
  if (!cdn) err('shared/js/labs/registry.js', 'no encontré la URL de math.js');
  else if (dev.mathjs !== cdn) err('package.json', `mathjs ${dev.mathjs} para pruebas, pero el sitio carga ${cdn}`);
}

/* ---------- 3. Colores fuera de tokens.css ---------- */
function checkColors() {
  const hex = /(?<![&\w])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])/g;
  const fn = /\b(?:rgba?|hsla?)\s*\(/g;
  for (const f of FILES) {
    const r = rel(f);
    if (!/\.(css|js|html|svg)$/.test(f)) continue;
    if (r === 'shared/css/tokens.css' || r.startsWith('shared/img/')) continue;
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    lines.forEach((line, i) => {
      const hits = [...(line.match(hex) || []), ...(line.match(fn) || [])];
      if (hits.length) err(`${r}:${i + 1}`, `color fuera de tokens.css: ${hits.join(', ')}`);
    });
  }
}

/* ---------- 4. Páginas: pie, tema, links ---------- */
function attrs(html, name) {
  const out = [];
  const re = new RegExp(`\\s${name}\\s*=\\s*"([^"]*)"`, 'g');
  let m;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

function checkPages(external) {
  for (const f of HTML) {
    const r = rel(f);
    // Los preconnect no son links navegables.
    const html = fs.readFileSync(f, 'utf8').replace(/<link[^>]+rel="preconnect"[^>]*>/g, '');
    const isShell = /sesiones\/sesion-\d+\/index\.html$/.test(r);
    if (!isShell && !html.includes(FOOTER)) err(r, `falta el pie "${FOOTER}"`);
    const themeAt = html.indexOf("localStorage.getItem('cb-theme')");
    const cssAt = html.indexOf('rel="stylesheet"');
    if (themeAt < 0 || (cssAt >= 0 && themeAt > cssAt)) err(r, 'falta el script inline de tema antes de las hojas de estilo');
    if (!/<html lang="es/.test(html)) err(r, 'falta lang="es-MX"');
    // Toda página que califica respuestas (exercises.js) necesita los tres calificadores:
    // sin ellos, una pregunta de derivada o implícita falla con "LM.derivative is undefined".
    if (/shared\/js\/exercises\.js/.test(html)) {
      ['registry', 'antiderivative-check', 'derivative-check', 'implicit-tangent'].forEach((m) => {
        if (!html.includes('shared/js/labs/' + m + '.js')) err(r, `califica respuestas pero no carga labs/${m}.js`);
      });
    }

    const ids = new Set(attrs(html, 'id'));
    for (const url of [...attrs(html, 'href'), ...attrs(html, 'src')]) {
      if (/^(mailto:|tel:|data:|javascript:)/.test(url)) continue;
      if (/^https?:\/\//.test(url)) { external.add(url); continue; }
      if (url.startsWith('#')) {
        // En los shells de sesión, los ids los crea session-template.js al renderizar.
        if (!isShell && url.length > 1 && !ids.has(url.slice(1))) err(r, `ancla ${url} no existe en la página`);
        continue;
      }
      const clean = url.split('#')[0].split('?')[0];
      if (!clean) continue;
      let target = path.resolve(path.dirname(f), clean);
      if (clean.endsWith('/') || (fs.existsSync(target) && fs.statSync(target).isDirectory())) target = path.join(target, 'index.html');
      if (!fs.existsSync(target)) err(r, `link roto: ${url}`);
    }
  }
}

async function checkExternal(urls) {
  const list = [...urls];
  const bad = [];
  let i = 0;
  async function worker() {
    while (i < list.length) {
      const url = list[i++];
      try {
        let res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(12000) });
        if (res.status === 405 || res.status === 403 || res.status === 400) {
          res = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(12000) });
        }
        if (res.status >= 400) bad.push(`${res.status} ${url}`);
      } catch (e) {
        bad.push(`sin respuesta (${e.name}) ${url}`);
      }
    }
  }
  await Promise.all([1, 2, 3, 4, 5, 6].map(worker));
  bad.forEach((b) => err('link externo', b));
  return list.length;
}

(async () => {
  checkCourses();
  checkPresets();
  COURSE_DIRS.forEach(checkCourse);
  checkVersions();
  checkColors();
  const external = new Set();
  checkPages(external);
  let n = 0;
  if (!OFFLINE) n = await checkExternal(external);

  warnings.forEach((w) => console.log('⚠ ' + w));
  errors.forEach((e) => console.log('✗ ' + e));
  console.log(`\ncheck.js: ${HTML.length} páginas, ${FILES.length} archivos, ` +
    (OFFLINE ? 'links externos omitidos (--offline)' : `${n} links externos`) +
    ` · ${errors.length} errores, ${warnings.length} avisos.`);
  process.exit(errors.length ? 1 : 0);
})();
