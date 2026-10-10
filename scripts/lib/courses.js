// Cursos que revisan las pruebas: toda carpeta data/<curso>/ con course-meta.js, en orden fijo
// (los de N1 primero). Agregar un curso nuevo no requiere tocar cada prueba.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const ORDER = ['calculo-1', 'fisica-1', 'calculo-2', 'fisica-2', 'calculo-3', 'fisica-3'];

function courses() {
  const dir = path.join(ROOT, 'data');
  const found = fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(dir, e.name, 'course-meta.js')))
    .map((e) => e.name);
  return found.sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99) || a.localeCompare(b));
}

// Archivos de labs (sin extensión) que no están en la lista explícita: se agregan al final.
function extraLabs(listed) {
  const dir = path.join(ROOT, 'shared/js/labs');
  const known = new Set(listed.concat(['plot']));        // plot.js es la gráfica común, no un lab
  return fs.readdirSync(dir).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3)).filter((n) => !known.has(n)).sort();
}

module.exports = { courses, extraLabs };
