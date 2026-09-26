#!/usr/bin/env node
// WCAG AA de los pares texto/fondo y gráfico/fondo, en ambos temas y por materia.
// Uso: node scripts/contrast.js [--verbose]
'use strict';
const { resolveEnv, parseColor, over, ratio } = require('./lib/tokens');

const TEXT = 4.5, GRAPHIC = 3;
const verbose = process.argv.includes('--verbose');

// [primer plano, fondo, mínimo, etiqueta]
const BACKGROUNDS = ['--page', '--panel'];
const PAIRS = [];
for (const bg of BACKGROUNDS) {
  for (const fg of ['--text', '--text-muted', '--pen', '--accent']) PAIRS.push([fg, bg, TEXT]);
  for (const fg of ['--ok', '--warn', '--bad']) PAIRS.push([fg, bg, TEXT]);
  for (const fg of ['--plot-ref', '--plot-student', '--plot-error', '--plot-aux', '--plot-trace', '--plot-axis'])
    PAIRS.push([fg, bg, GRAPHIC]);
  PAIRS.push(['--line-strong', bg, GRAPHIC, 'borde de control']);
  PAIRS.push(['--focus', bg, GRAPHIC, 'anillo de foco']);
  // Tarjetas "próximamente" del hub: el tono del nivel solo se usa como marca gráfica.
  for (const fg of ['--mat-n2', '--fis-n2', '--fis-n3']) PAIRS.push([fg, bg, GRAPHIC, 'marca de nivel soon (gráfico)', ['hub']]);
}
PAIRS.push(['--on-accent', '--accent', TEXT, 'botón primario']);
PAIRS.push(['--accent', '--accent-soft', TEXT, 'chip']);
PAIRS.push(['--text', '--accent-soft', TEXT, 'chip']);
PAIRS.push(['--ok', '--ok-bg', TEXT, 'estado']);
PAIRS.push(['--warn', '--warn-bg', TEXT, 'estado']);
PAIRS.push(['--bad', '--bad-bg', TEXT, 'estado']);
PAIRS.push(['--text', '--ok-bg', TEXT, 'estado']);
PAIRS.push(['--text', '--warn-bg', TEXT, 'estado']);
PAIRS.push(['--text', '--bad-bg', TEXT, 'estado']);

let fails = 0, total = 0;
for (const theme of ['light', 'dark']) {
  for (const subject of ['hub', 'mat', 'fis']) {
    const env = resolveEnv(theme, subject);
    const page = parseColor(env.get('--page'));
    for (const [fgName, bgName, min, label, only] of PAIRS) {
      if (only && !only.includes(subject)) continue;
      const bgRaw = parseColor(env.get(bgName));
      const fgRaw = parseColor(env.get(fgName));
      if (!bgRaw || !fgRaw) {
        console.error(`✗ ${theme}/${subject}: no pude leer ${fgName} (${env.get(fgName)}) o ${bgName} (${env.get(bgName)})`);
        fails++; continue;
      }
      const bg = over(bgRaw, page);
      const fg = over(fgRaw, bg);
      const r = ratio(fg, bg);
      total++;
      const ok = r >= min;
      if (!ok) fails++;
      if (!ok || verbose) {
        console.log(`${ok ? '✓' : '✗'} ${theme.padEnd(5)} ${subject.padEnd(3)} ${fgName.padEnd(16)} sobre ${bgName.padEnd(14)} ${r.toFixed(2).padStart(6)}:1  (mín ${min}${label ? ' · ' + label : ''})`);
      }
    }
  }
}
console.log(`\ncontrast.js: ${total - fails}/${total} pares cumplen WCAG AA.`);
process.exit(fails ? 1 : 0);
