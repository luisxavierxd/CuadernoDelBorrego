#!/usr/bin/env node
// Crea (o reescribe) el shell mínimo de una sesión: <curso>/sesiones/sesion-NN/index.html.
// No es un paso de build: el shell resultante es HTML estático que se versiona.
//   node scripts/make-shell.js calculo-1 10
'use strict';
const fs = require('fs');
const path = require('path');
const { loadData } = require('./lib/load');

const ROOT = path.join(__dirname, '..');
const [course, num] = process.argv.slice(2);
if (!course || !num) { console.error('Uso: node scripts/make-shell.js <calculo-1|fisica-1> <NN>'); process.exit(1); }
const NN = String(num).padStart(2, '0');
const meta = loadData(path.join(ROOT, 'data', course, 'course-meta.js')).COURSE_META;
const s = meta.groups.flatMap((g) => g.sessions).find((x) => x.n === +num);
if (!s) { console.error(`${course} no tiene la sesión ${NN}`); process.exit(1); }
const dataFile = path.join(ROOT, 'data', course, `sesion-${NN}.js`);
if (!fs.existsSync(dataFile)) { console.error(`Falta ${path.relative(ROOT, dataFile)}`); process.exit(1); }
const lab = loadData(dataFile).SESSION_DATA.lab;
const bankFile = path.join(ROOT, 'data', course, 'bank', `sesion-${NN}.js`);
const hasBank = !!s.bank && fs.existsSync(bankFile);
if (s.bank && !hasBank) { console.error(`S${NN} dice bank: true pero falta ${path.relative(ROOT, bankFile)}`); process.exit(1); }
const labFile = lab && fs.existsSync(path.join(ROOT, 'shared/js/labs', lab.type + '.js')) ? lab.type : null;
// Matemática que los ejercicios y quizzes usan aunque el lab de la sesión sea otro.
const MATH_MODULES = { 'calculo-1': ['derivative-check', 'implicit-tangent'], 'fisica-1': [] };
const extraLabs = (MATH_MODULES[course] || []).filter((m) => m !== labFile);

const R = '../../../';
const KATEX = 'https://cdn.jsdelivr.net/npm/katex@0.16.47/dist/';
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const html = `<!doctype html>
<html lang="es-MX">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>S${NN} · ${esc(s.title)} · ${meta.name} · Cuaderno del Borrego</title>
    <meta name="description" content="${esc(meta.name)}, sesión ${NN}: ${esc(s.title)}. Explicación gráfica, ejemplos resueltos, lab y ejercicios. Proyecto de alumnos, no oficial.">
    <link rel="icon" type="image/svg+xml" href="${R}shared/img/favicon.svg">
    <script>(function(){var t;try{t=localStorage.getItem('cb-theme');}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);})();</script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=IBM+Plex+Mono:wght@500&family=IBM+Plex+Sans:wght@400;500;600&family=Kalam:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${KATEX}katex.min.css">
    <link rel="stylesheet" href="${R}shared/css/tokens.css">
    <link rel="stylesheet" href="${R}shared/css/base.css">
    <link rel="stylesheet" href="${R}shared/css/theme.css">
    <link rel="stylesheet" href="${R}shared/css/sesion.css">
    <link rel="stylesheet" href="${R}shared/css/labs.css">
${hasBank ? `    <link rel="stylesheet" href="${R}shared/css/quiz.css">
` : ''}    <script defer src="${KATEX}katex.min.js"></script>
    <script defer src="${KATEX}contrib/auto-render.min.js"></script>
</head>

<body data-subject="${meta.subject}">
    <a class="visually-hidden skip-link" href="#contenido">Saltar al contenido</a>
    <div id="session-root"></div>

    <script src="https://cdn.jsdelivr.net/npm/animejs@3.2.1/lib/anime.min.js"></script>
    <script src="${R}shared/js/theme.js"></script>
    <script src="${R}shared/js/sketch-filters.js"></script>
    <script src="${R}shared/js/animations.js"></script>
    <script src="${R}shared/js/math-render.js"></script>
    <script src="${R}shared/js/labs/registry.js"></script>
    <script src="${R}shared/js/labs/plot.js"></script>
${labFile ? `    <script src="${R}shared/js/labs/${labFile}.js"></script>\n` : ''}${extraLabs.map((m) => `    <script src="${R}shared/js/labs/${m}.js"></script>\n`).join('')}    <script src="${R}shared/js/diagrams/${course}.js"></script>
    <script src="${R}shared/js/latex-to-math.js"></script>
    <script src="${R}shared/js/math-input.js"></script>
    <script src="${R}shared/js/exercises.js"></script>
${hasBank ? `    <script src="${R}shared/js/quiz/engine.js"></script>
    <script src="${R}shared/js/quiz/ui.js"></script>
    <script src="${R}data/${course}/bank/sesion-${NN}.js"></script>
` : ''}    <script src="${R}data/${course}/course-meta.js"></script>
    <script src="${R}data/${course}/sesion-${NN}.js"></script>
    <script src="${R}shared/js/session-template.js"></script>
    <script>CBTemplate.render(window.SESSION_DATA);</script>
</body>

</html>
`;
const out = path.join(ROOT, course, 'sesiones', `sesion-${NN}`, 'index.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log('escrito', path.relative(ROOT, out).split(path.sep).join('/'));
if (!s.ready) console.log(`Recuerda marcar S${NN} con ready: true en data/${course}/course-meta.js`);
