// math.js para las pruebas en Node: la misma versión que carga el sitio por CDN (15.2.0),
// instalada como devDependency exacta en package.json.
'use strict';
const SITE_VERSION = '15.2.0';

async function loadMathjs() {
  const math = require('mathjs');
  if (math.version !== SITE_VERSION) {
    throw new Error(`math.js ${math.version} instalado; el sitio usa ${SITE_VERSION}. Corre npm install.`);
  }
  return math;
}

module.exports = { loadMathjs };
