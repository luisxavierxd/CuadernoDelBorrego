// Ejecuta archivos de data/ (que cuelgan de window.*) en un sandbox de Node.
'use strict';
const fs = require('fs');
const vm = require('vm');

function loadData(files, win) {
  const window = win || {};
  const ctx = vm.createContext({ window, console, Math, JSON, String, Number, Array, Object });
  for (const f of [].concat(files)) {
    vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });
  }
  return window;
}

module.exports = { loadData };
