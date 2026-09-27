// Caché de validación en node_modules/.cache/cuaderno (no se publica).
// - fingerprint(files): hash del contenido de esos archivos; si cambia uno, cambia el hash.
// - passed(name) / markPassed(name, key, data): recuerda qué entradas ya pasaron con ese hash.
// VALIDATE_ALL=1 (o --all) ignora la caché y revisa todo.
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIR = path.join(__dirname, '..', '..', 'node_modules', '.cache', 'cuaderno');
const FORCE = process.env.VALIDATE_ALL === '1' || process.argv.includes('--all');

function fingerprint(files) {
  const h = crypto.createHash('sha1');
  for (const f of files) {
    h.update(f);
    h.update(fs.existsSync(f) ? fs.readFileSync(f) : 'missing');
  }
  return h.digest('hex');
}

function store(name) {
  const file = path.join(DIR, name + '.json');
  let data = {};
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { data = {}; }
  return {
    // Datos guardados si `id` pasó con esta misma huella; null si hay que revisarlo.
    get(id, key) { return !FORCE && data[id] && data[id].key === key ? data[id].data || {} : null; },
    set(id, key, extra) { data[id] = { key, data: extra || {} }; },
    drop(id) { delete data[id]; },
    save() { fs.mkdirSync(DIR, { recursive: true }); fs.writeFileSync(file, JSON.stringify(data)); }
  };
}

module.exports = { DIR, FORCE, fingerprint, store };
