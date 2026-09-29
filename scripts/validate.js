#!/usr/bin/env node
// Corre toda la validación en orden, aunque una prueba falle, y al final resume qué pasó
// y cuánto tardó cada una. Sale con 1 si alguna falló.
//   npm run validate            usa la caché (bancos y ejemplos sin cambios no se repiten)
//   npm run validate -- --all   revisa todo desde cero
//   npm run validate -- --offline  check.js sin links externos (lo que corre el CI en push y PR)
'use strict';
const path = require('path');
const { spawnSync } = require('child_process');

const STEPS = [
  'check.js', 'contrast.js', 'labs-math.test.js', 'latex.test.js', 'examples.test.js',
  'quiz-engine.test.js', 'quiz-bank.test.js', 'exam.test.js', 'formulario.test.js',
  'formulario-print.test.js', 'exam-page.test.js', 'qa-browser.js'
];
const OFFLINE = process.argv.includes('--offline');
const env = Object.assign({}, process.env, process.argv.includes('--all') ? { VALIDATE_ALL: '1' } : {});

const rows = [];
const t0 = Date.now();
for (const s of STEPS) {
  const t = Date.now();
  console.log(`\n── ${s} ──`);
  const r = spawnSync(process.execPath, [path.join(__dirname, s)].concat(OFFLINE && s === 'check.js' ? ['--offline'] : []), { stdio: 'inherit', env });
  rows.push({ s, ok: r.status === 0, sec: (Date.now() - t) / 1000 });
}
console.log('\n── Resumen ──');
rows.forEach((r) => console.log(`${r.ok ? '✓' : '✗'} ${r.s.padEnd(26)} ${r.sec.toFixed(1).padStart(6)} s`));
const bad = rows.filter((r) => !r.ok);
console.log(`\nvalidate: ${rows.length - bad.length}/${rows.length} bien en ${((Date.now() - t0) / 1000).toFixed(0)} s` + (bad.length ? ` · fallan: ${bad.map((r) => r.s).join(', ')}` : ''));
process.exit(bad.length ? 1 : 0);
