#!/usr/bin/env node
// QA en navegador (§11): cada página a 360, 1024 y 1440 px, en ambos temas y con reduced-motion
// (más una pasada con animaciones activas): cero errores de consola, cero 4xx/5xx,
// sin scroll horizontal y todos los labs montados.
//   node scripts/qa-browser.js [--base http://127.0.0.1:8123] [--only fisica-1/sesiones]
// Sin --base levanta un servidor estático propio en un puerto libre.
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const IGNORE = new Set(['.git', 'node_modules', 'docs', 'scripts', 'reference', '.claude', 'design-system', 'test-results']);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.json': 'application/json' };

function pages(dir = ROOT, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) pages(p, out);
    else if (e.name === 'index.html') out.push('/' + path.relative(ROOT, dir).split(path.sep).join('/') + (dir === ROOT ? '' : '/'));
  }
  return out.map((u) => u.replace(/^\/\/?/, '/'));
}

function serve() {
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const COMBOS = [];
for (const width of [360, 1024, 1440]) for (const theme of ['light', 'dark']) COMBOS.push({ width, theme, motion: 'reduce' });
COMBOS.push({ width: 1440, theme: 'light', motion: 'no-preference' });

async function checkPage(browser, base, url, c) {
  const ctx = await browser.newContext({ viewport: { width: c.width, height: 900 }, colorScheme: c.theme, reducedMotion: c.motion });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push('consola: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('excepción: ' + e.message));
  page.on('response', (r) => { if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`); });
  page.on('requestfailed', (r) => problems.push(`falló ${r.url()} (${r.failure() && r.failure().errorText})`));
  try {
    await page.goto(base + url, { waitUntil: 'networkidle', timeout: 45000 });
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    if (theme !== c.theme) problems.push(`data-theme="${theme}" y el sistema pide ${c.theme}`);
    // Los labs cargan al entrar en pantalla: se recorren uno por uno.
    const labs = await page.$$('[data-lab]');
    for (const lab of labs) {
      await lab.scrollIntoViewIfNeeded();
      const state = await page.waitForFunction((el) => el.getAttribute('data-lab-ready'), lab, { timeout: 30000 })
        .then((h) => h.jsonValue()).catch(() => 'timeout');
      if (state !== 'true') problems.push(`lab ${await lab.getAttribute('data-lab')}: ${state}`);
    }
    if (labs.length) await page.waitForTimeout(c.motion === 'reduce' ? 800 : 4000);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) problems.push(`scroll horizontal de ${overflow}px`);
  } catch (e) {
    problems.push('no cargó: ' + e.message.split('\n')[0]);
  }
  await ctx.close();
  return problems;
}

(async () => {
  const i = process.argv.indexOf('--base');
  let server = null, base;
  if (i > 0) base = process.argv[i + 1].replace(/\/$/, '');
  else { server = await serve(); base = 'http://127.0.0.1:' + server.address().port; }

  // --only <texto>: revisa solo las páginas cuya ruta contiene ese texto (útil para repetir tras un fallo de red).
  const o = process.argv.indexOf('--only');
  const list = pages().filter((u) => o < 0 || u.includes(process.argv[o + 1]));
  if (!list.length) { console.error('Ninguna página coincide con --only ' + process.argv[o + 1]); process.exit(1); }
  const browser = await chromium.launch();
  let bad = 0, runs = 0;
  for (const url of list) {
    const results = await Promise.all(COMBOS.map((c) => checkPage(browser, base, url, c).then((p) => ({ c, p }))));
    for (const { c, p } of results) {
      runs++;
      if (!p.length) continue;
      bad++;
      console.log(`✗ ${url} · ${c.width}px · ${c.theme} · ${c.motion}`);
      [...new Set(p)].slice(0, 8).forEach((x) => console.log('    ' + x));
    }
    console.log(`${results.every((r) => !r.p.length) ? '✓' : '✗'} ${url}`);
  }
  await browser.close();
  if (server) server.close();
  console.log(`\nqa-browser.js: ${list.length} páginas × ${COMBOS.length} combinaciones · ${runs - bad}/${runs} sin problemas.`);
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
