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

const CI = !!process.env.GITHUB_ACTIONS;

function annotate(step, out) {
  const lines = out.split(/\r?\n/);
  const hits = lines.filter((l) => /✗|Error|error|falla|timeout/.test(l));
  const body = (hits.length ? hits : lines.filter(Boolean).slice(-15)).slice(0, 40).join('\n');
  const esc = body.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
  console.log(`::error title=${step}::${esc}`);
}

const rows = [];
const t0 = Date.now();
for (const s of STEPS) {
  const t = Date.now();
  console.log(`\n── ${s} ──`);
  const args = [path.join(__dirname, s)].concat(OFFLINE && s === 'check.js' ? ['--offline'] : []);
  // En GitHub Actions se guarda la salida para anotar los fallos: el log del job pide sesión,
  // pero las anotaciones se ven en la página pública del run.
  const r = spawnSync(process.execPath, args, CI ? { env, encoding: 'utf8', maxBuffer: 64 << 20 } : { stdio: 'inherit', env });
  if (CI) {
    process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || '');
    if (r.status !== 0) annotate(s, (r.stdout || '') + (r.stderr || ''));
  }
  rows.push({ s, ok: r.status === 0, sec: (Date.now() - t) / 1000 });
}
console.log('\n── Resumen ──');
rows.forEach((r) => console.log(`${r.ok ? '✓' : '✗'} ${r.s.padEnd(26)} ${r.sec.toFixed(1).padStart(6)} s`));
const bad = rows.filter((r) => !r.ok);
console.log(`\nvalidate: ${rows.length - bad.length}/${rows.length} bien en ${((Date.now() - t0) / 1000).toFixed(0)} s` + (bad.length ? ` · fallan: ${bad.map((r) => r.s).join(', ')}` : ''));
process.exit(bad.length ? 1 : 0);
