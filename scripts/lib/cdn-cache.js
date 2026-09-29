// Caché en disco de lo que las pruebas en navegador bajan de CDN (KaTeX, math.js, MathLive,
// anime.js, manim-web, Google Fonts). Sin ella cada una de las ~170 cargas de página vuelve
// a pedir todo por red: es lo más lento del QA y la causa de los ERR_CONNECTION_RESET.
// Las URL llevan versión fija, así que lo guardado no caduca. Borrar la carpeta lo renueva.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DIR } = require('./cache');

const CDN = path.join(DIR, 'cdn');
const HOSTS = /^https:\/\/(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com|unpkg\.com|cdnjs\.cloudflare\.com)\//;
const KEEP = ['content-type', 'access-control-allow-origin', 'cache-control'];

async function attach(ctx) {
  fs.mkdirSync(CDN, { recursive: true });
  await ctx.route(HOSTS, async (route) => {
    const url = route.request().url();
    const file = path.join(CDN, crypto.createHash('sha1').update(url).digest('hex'));
    if (fs.existsSync(file + '.json')) {
      try {
        const meta = JSON.parse(fs.readFileSync(file + '.json', 'utf8'));
        return await route.fulfill({ status: meta.status, headers: meta.headers, body: fs.readFileSync(file) });
      } catch (e) { /* guardado roto: se vuelve a bajar */ }
    }
    // Si la página se cierra a media descarga, route.fetch/body/fulfill fallan: se ignora, porque
    // un rechazo sin atrapar aquí tumba todo el proceso de pruebas.
    let res, body;
    try { res = await route.fetch(); body = await res.body(); } catch (e) { return route.abort().catch(() => {}); }
    const headers = {};
    const all = res.headers();
    KEEP.forEach((k) => { if (all[k]) headers[k] = all[k]; });
    if (!headers['access-control-allow-origin']) headers['access-control-allow-origin'] = '*';
    if (res.status() === 200) {
      // Escritura atómica: varias páginas en paralelo pueden bajar la misma URL.
      const tmp = file + '.' + process.pid + '.' + Math.random().toString(36).slice(2);
      fs.writeFileSync(tmp, body);
      fs.renameSync(tmp, file);
      fs.writeFileSync(tmp, JSON.stringify({ url, status: 200, headers }));
      fs.renameSync(tmp, file + '.json');
    }
    return route.fulfill({ status: res.status(), headers, body }).catch(() => {});
  });
}

module.exports = { attach };
