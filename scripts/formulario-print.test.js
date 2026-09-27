#!/usr/bin/env node
// Impresión de los formularios (formularios/<curso>/): hoja carta, a lo más 2 páginas
// (una hoja por ambos lados) y ninguna fórmula más ancha que su columna.
// Si Chromium empuja las columnas a otra hoja (primera página en blanco), sube el conteo.
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');
const cdn = require('./lib/cdn-cache');

const ROOT = path.join(__dirname, '..');
const MAX_PAGES = 2;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
function serve() {
  const server = http.createServer((req, res) => {
    let file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

(async () => {
  const courses = fs.readdirSync(path.join(ROOT, 'formularios'), { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(ROOT, 'formularios', e.name, 'index.html'))).map((e) => e.name);
  const server = await serve();
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  let fail = 0;
  try {
    for (const c of courses) {
      const ctx = await browser.newContext();
      await cdn.attach(ctx);
      const page = await ctx.newPage();
      await page.goto(base + '/formularios/' + c + '/');
      await page.waitForSelector('.form-grid .katex', { timeout: 30000 });
      await page.evaluate(() => document.fonts.ready);
      await page.emulateMedia({ media: 'print' });
      const buf = await page.pdf({ preferCSSPageSize: true, printBackground: true });
      if (process.env.PDF_OUT) fs.writeFileSync(process.env.PDF_OUT, buf);
      const pdf = buf.toString('latin1');
      const pages = (pdf.match(/\/Type\s*\/Page[^s]/g) || []).length;
      const box = (pdf.match(/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)/) || []).slice(1).map(Number);
      const wide = await page.evaluate(() => [...document.querySelectorAll('.form-tex')].filter((n) => n.scrollWidth > n.clientWidth + 1).length);
      const letter = Math.abs(box[0] - 612) < 1 && Math.abs(box[1] - 792) < 1;
      const bad = [];
      if (!letter) bad.push('no es carta (' + box.join('×') + ' pt)');
      if (pages > MAX_PAGES) bad.push(pages + ' páginas (máx. ' + MAX_PAGES + ')');
      if (wide) bad.push(wide + ' fórmulas más anchas que su columna');
      if (bad.length) { fail++; console.log('✗ ' + c + ': ' + bad.join('; ')); }
      else console.log('✓ ' + c + ': carta, ' + pages + (pages === 1 ? ' página' : ' páginas'));
      await ctx.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  console.log('\nformulario-print: ' + (fail ? fail + ' con problemas' : 'todo bien'));
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
