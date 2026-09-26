// Librerías de CDN para las pruebas en Node, con la MISMA versión que usa el sitio.
// Se descargan una vez a scripts/.cache (ignorado por git); así las pruebas no dependen de npm.
'use strict';
const fs = require('fs');
const path = require('path');

const CACHE = path.join(__dirname, '..', '.cache');
const LIBS = {
  mathjs: 'https://cdn.jsdelivr.net/npm/mathjs@15.2.0/lib/browser/math.js'
};

async function fetchCached(name) {
  const url = LIBS[name];
  const file = path.join(CACHE, name + '-' + url.match(/@([\d.]+)/)[1] + '.js');
  if (!fs.existsSync(file)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No pude descargar ${url}: ${res.status}`);
    fs.mkdirSync(CACHE, { recursive: true });
    fs.writeFileSync(file, await res.text());
  }
  return fs.readFileSync(file, 'utf8');
}

// Devuelve el objeto `math` de math.js. Se evalúa en el MISMO realm que las pruebas
// (como en el navegador): math.js rechaza objetos creados en otro contexto de vm.
async function loadMathjs() {
  const src = await fetchCached('mathjs');
  const host = {};
  // El bundle UMD se cuelga de `self`; `module`/`exports`/`define` se ocultan para forzar esa rama.
  new Function('self', 'window', 'module', 'exports', 'define', src).call(host, host, host, undefined, undefined, undefined);
  if (!host.math) throw new Error('math.js no definió math');
  return host.math;
}

module.exports = { loadMathjs };
