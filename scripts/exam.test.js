#!/usr/bin/env node
// Problemas de examen (§10.3–10.4, §11). En 200 instancias de cada problema:
// incisos encadenados finitos; crédito por arrastre de error con una respuesta errónea
// inyectada en a); penalización del 70 % por ver la solución; pesos 40/60 que suman 100.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadData } = require('./lib/load');
const { loadMathjs } = require('./lib/vendor');

const ROOT = path.join(__dirname, '..');
const LIBS = ['labs/registry', 'labs/antiderivative-check', 'labs/projectile-check', 'labs/secant-tangent', 'labs/derivative-check', 'labs/chain-composition', 'labs/implicit-tangent', 'exercises', 'quiz/engine'].map((n) => path.join(ROOT, 'shared/js', n + '.js'));
const N = 200;

let pass = 0, fail = 0;
const fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); } }
function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
const clean = (s) => typeof s === 'string' && s.length > 5 && !/undefined|NaN|Infinity/.test(s);

(async () => {
  const math = await loadMathjs();
  let problems = 0;
  // La página del examen carga las figuras de ambos cursos y las comunes: un nombre repetido
  // haría que un curso dibujara la figura del otro (pasó con exam-dron).
  const own = {};
  for (const c of ['calculo-1', 'fisica-1']) own[c] = Object.keys(loadData(path.join(ROOT, 'shared/js/diagrams', c + '.js'), {}).Diagrams || {});
  own['calculo-1'].filter((id) => own['fisica-1'].includes(id)).forEach((id) => ok(false, `la figura ${id} existe en ambos cursos`));
  for (const course of ['calculo-1', 'fisica-1']) {
    const file = path.join(ROOT, 'data', course, 'exam-problems.js');
    if (!fs.existsSync(file)) continue;
    const W = loadData(LIBS, {});
    loadData(file, W);
    const diagrams = loadData(['shared/js/diagrams/' + course + '.js', 'shared/js/diagrams/examen.js'].map((f) => path.join(ROOT, f)), {}).Diagrams || {};
    const Q = W.CBQuiz, E = W.CBExercises;
    for (const [code, list] of Object.entries(W.CB_EXAMS || {})) {
      for (const p of list) {
        problems++;
        const at = `${course} ${p.id}`;
        ok(Array.isArray(p.tags) && p.tags.every((t) => t.startsWith(code + '.S')), `${at}: etiquetas inválidas`);
        ok(p.parts.length >= 3 && p.parts.length <= 5, `${at}: debe tener 3–5 incisos`);
        ok(p.parts.some((part, i) => i > 0 && part.answer.length >= 2), `${at}: ningún inciso usa el resultado anterior`);
        if (p.diagram) ok(typeof diagrams[p.diagram.id] === 'function', `${at}: el diagrama ${p.diagram.id} no existe`);
        const rand = rng(11);
        for (let i = 0; i < N; i++) {
          const v = E.instance(p, rand);
          const vi = `${at} ${JSON.stringify(v)}`;
          ok(clean(p.statement(v)), `${vi}: enunciado inválido`);
          if (p.diagram && diagrams[p.diagram.id]) ok(clean(diagrams[p.diagram.id](p.diagram.state(v))), `${vi}: diagrama inválido`);

          // Cadena real: todas las respuestas correctas.
          const truth = [];
          p.parts.forEach((part) => truth.push(part.answer(v, truth.slice())));
          truth.forEach((t, k) => ok(isFinite(t), `${vi}: inciso ${p.parts[k].label} no finito (${t})`));
          p.parts.forEach((part, k) => {
            ok(clean(part.prompt(v, truth.slice(0, k))), `${vi}: prompt ${part.label}`);
            ok(clean(part.solution(v)), `${vi}: solución ${part.label}`);
            ok(part.points > 0, `${vi}: puntos ${part.label}`);
          });
          const full = Q.gradeProblem(p, v, truth.map(String), truth.map(() => false), { math });
          ok(Math.abs(full.earned - full.total) < 1e-9, `${vi}: todo correcto no da puntos completos (${full.earned}/${full.total})`);

          // Arrastre: a) mal; cada inciso siguiente, correcto CON los valores del alumno.
          const student = [];
          p.parts.forEach((part, k) => {
            student.push(k === 0 ? truth[0] * 1.37 + 1 : part.answer(v, student.slice()));
          });
          const r = Q.gradeProblem(p, v, student.map(String), student.map(() => false), { math });
          ok(r.parts[0].earned === 0, `${vi}: a) mal debería valer 0`);
          r.parts.slice(1).forEach((pr, k) => {
            const part = p.parts[k + 1];
            ok(pr.earned === part.points, `${vi}: ${part.label}) con arrastre debería valer completo (${pr.earned}/${part.points})`);
            const depends = !E.withinTol(part.answer(v, student.slice(0, k + 1)), truth[k + 1], part.tol);
            ok(pr.carried === depends, `${vi}: ${part.label}) carried=${pr.carried} y depende=${depends}`);
          });
          ok(r.parts.some((pr) => pr.carried), `${vi}: ningún inciso marcó arrastre`);

          // Ver la solución de cada inciso deja el 30 %.
          const seen = Q.gradeProblem(p, v, truth.map(String), truth.map(() => true), { math });
          ok(Math.abs(seen.earned - 0.3 * seen.total) < 1e-9, `${vi}: con solución debería quedar 30 % (${seen.earned}/${seen.total})`);
        }
      }
    }
  }
  const W = loadData(LIBS, {});
  ok(W.CBQuiz.WEIGHTS.short + W.CBQuiz.WEIGHTS.exam === 100, 'los pesos 40/60 deben sumar 100');
  ok(W.CBQuiz.WEIGHTS.short === 40 && W.CBQuiz.WEIGHTS.exam === 60, 'pesos distintos de 40/60');
  ok(Math.abs(W.CBQuiz.SOLUTION_KEEPS - 0.3) < 1e-12, 'ver solución debe quitar el 70 %');
  const s = W.CBQuiz.simulacroScore([{ earned: 3, total: 4 }], [{ earned: 18, total: 24 }]);
  ok(Math.abs(s.total - 75) < 1e-9, 'simulacroScore con 75 % en ambos debería dar 75');

  ok(problems > 0, 'no encontré problemas de examen');
  fails.slice(0, 40).forEach((f) => console.log('✗ ' + f));
  if (fails.length > 40) console.log(`… y ${fails.length - 40} más`);
  console.log(`\nexam.test.js: ${problems} problemas · ${pass} ok, ${fail} fallan.`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
