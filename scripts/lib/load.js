// Ejecuta archivos de data/ y de labs (que cuelgan de window.*) sin DOM.
// Corren en el mismo realm que Node (con new Function) para que sus objetos
// sean compatibles con librerías como math.js, igual que en el navegador.
'use strict';
const fs = require('fs');

function loadData(files, win) {
  const window = win || {};
  for (const f of [].concat(files)) {
    const src = fs.readFileSync(f, 'utf8') + '\n//# sourceURL=' + f;
    new Function('window', 'document', src)(window, undefined);
  }
  return window;
}

module.exports = { loadData };
