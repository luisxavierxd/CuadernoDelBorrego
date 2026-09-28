#!/usr/bin/env node
// Motor de quizzes y simulacros (shared/js/quiz/engine.js, §10): pruebas con datos sintéticos.
'use strict';
const path = require('path');
const { loadData } = require('./lib/load');
const { loadMathjs } = require('./lib/vendor');

const ROOT = path.join(__dirname, '..');
const LIBS = ['labs/registry', 'labs/antiderivative-check', 'exercises', 'quiz/engine'].map((n) => path.join(ROOT, 'shared/js', n + '.js'));

let pass = 0, fail = 0;
function test(name, fn) {
  try { fn(); pass++; console.log('✓ ' + name); } catch (e) { fail++; console.log('✗ ' + name + '\n    ' + e.message); }
}
function eq(got, want, msg) { if (got !== want) throw new Error(`${msg || ''} esperaba ${JSON.stringify(want)}, obtuve ${JSON.stringify(got)}`); }
function near(got, want, tol, msg) { if (!(Math.abs(got - want) <= tol)) throw new Error(`${msg || ''} esperaba ${want} ± ${tol}, obtuve ${got}`); }
function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

(async () => {
  const math = await loadMathjs();
  const W = loadData(LIBS, {});
  const Q = W.CBQuiz;
  if (!Q) { console.log('✗ window.CBQuiz no existe'); process.exit(1); }

  // Banco sintético: 3 subtemas × 3 dificultades × 4 = 36 preguntas numéricas.
  const questions = [];
  ['a', 'b', 'c'].forEach((sub) => [1, 2, 3].forEach((d) => {
    for (let i = 0; i < 4; i++) {
      questions.push({
        id: `t-${sub}-${d}-${i}`, tags: ['c1.S01', 'c1.S01.' + sub], difficulty: d, type: 'numeric',
        vars: { k: [1, 9, 1] }, prompt: (v) => `k = ${v.k}`, answer: (v) => v.k * (i + 1), why: 'porque sí', source: 'propia'
      });
    }
  }));
  const BANK = { c1: { S01: { subtopics: { 'c1.S01.a': 'A', 'c1.S01.b': 'B', 'c1.S01.c': 'C' }, questions } } };

  test('semáforo: ≥ 80 Listo, 50–79 Casi, < 50 Reforzar', () => {
    eq(Q.state(80), 'ok'); eq(Q.state(79.9), 'warn'); eq(Q.state(50), 'warn'); eq(Q.state(49.9), 'bad');
    eq(Q.STATE_LABEL.ok, 'Listo'); eq(Q.STATE_LABEL.warn, 'Casi'); eq(Q.STATE_LABEL.bad, 'Reforzar');
  });

  test('pool por curso y sesión', () => {
    eq(Q.pool(BANK, [{ code: 'c1', sessions: [1] }]).length, 36);
    eq(Q.pool(BANK, [{ code: 'c1', sessions: [2] }]).length, 0);
  });

  test('pick: sin repetir, respeta N y reparte subtemas', () => {
    const got = Q.pick(Q.pool(BANK, [{ code: 'c1', sessions: [1] }]), 12, rng(7));
    eq(got.length, 12, 'N');
    eq(new Set(got.map((q) => q.id)).size, 12, 'sin repetir');
    const subs = {}; got.forEach((q) => { subs[q.tags[1]] = (subs[q.tags[1]] || 0) + 1; });
    Object.values(subs).forEach((n) => { if (n < 3 || n > 5) throw new Error('subtemas desbalanceados ' + JSON.stringify(subs)); });
  });

  test('pick: mezcla de dificultad ≈ 30/50/20', () => {
    const got = Q.pick(Q.pool(BANK, [{ code: 'c1', sessions: [1] }]), 10, rng(3));
    const d = [0, 0, 0, 0]; got.forEach((q) => d[q.difficulty]++);
    eq(d[1], 3, 'fáciles'); eq(d[2], 5, 'medias'); eq(d[3], 2, 'difíciles');
  });

  test('pick: filtro de dificultad (simulacro: 2 y 3)', () => {
    const got = Q.pick(Q.pool(BANK, [{ code: 'c1', sessions: [1] }]), 4, rng(5), { difficulties: [2, 3] });
    eq(got.length, 4);
    got.forEach((q) => { if (q.difficulty < 2) throw new Error('entró una fácil'); });
  });

  test('pick: si piden más de las que hay, devuelve todas', () => {
    eq(Q.pick(Q.pool(BANK, [{ code: 'c1', sessions: [1] }]), 99, rng(1)).length, 36);
  });

  test('grade de pregunta: correcta, incorrecta y vacía', () => {
    const q = questions[0], v = { k: 4 };
    eq(Q.grade(q, v, '4', { math }).kind, 'ok');
    eq(Q.grade(q, v, '5', { math }).kind, 'bad');
    eq(Q.grade(q, v, '', { math }).kind, 'invalid');
  });

  test('scoreByTag: porcentaje y estado por etiqueta', () => {
    const res = [
      { q: questions[0], score: 1 }, { q: questions[1], score: 1 }, { q: questions[2], score: 0 },   // a: 2/3
      { q: questions[12], score: 1 }                                                                 // b: 1/1
    ];
    const s = Q.scoreByTag(res);
    near(s['c1.S01.a'].pct, 66.67, 0.01); eq(s['c1.S01.a'].state, 'warn');
    eq(s['c1.S01.b'].pct, 100); eq(s['c1.S01.b'].state, 'ok');
    eq(s['c1.S01'].total, 4); near(s['c1.S01'].pct, 75, 1e-9);
  });

  // Problema encadenado: a) = 2k;  b) = a + 1 (usa la respuesta del alumno en a)
  const P = {
    id: 'p1', tags: ['c1.S01'], block: 'A', vars: { k: [2, 9, 1] }, statement: () => 'x',
    parts: [
      { label: 'a', type: 'numeric', points: 4, prompt: () => 'a', answer: (v) => 2 * v.k, solution: () => 's' },
      { label: 'b', type: 'numeric', points: 6, prompt: () => 'b', answer: (v, prev) => prev[0] + 1, solution: () => 's' }
    ]
  };
  test('problema: todo correcto = puntos completos', () => {
    const r = Q.gradeProblem(P, { k: 3 }, ['6', '7'], [false, false], { math });
    eq(r.earned, 10); eq(r.total, 10);
  });
  test('problema: arrastre de error da crédito completo en b', () => {
    const r = Q.gradeProblem(P, { k: 3 }, ['5', '6'], [false, false], { math });   // a mal (5); b = 5 + 1 bien
    eq(r.parts[0].earned, 0); eq(r.parts[1].earned, 6); eq(r.parts[1].carried, true);
    eq(r.parts[1].expectedTrue, 7, 'la cadena real');
  });
  test('problema: b mal aunque a esté bien', () => {
    const r = Q.gradeProblem(P, { k: 3 }, ['6', '9'], [false, false], { math });
    eq(r.parts[1].earned, 0); eq(r.parts[1].carried, false);
  });
  test('ver solución deja máximo el 30 % del inciso', () => {
    const r = Q.gradeProblem(P, { k: 3 }, ['6', '7'], [true, false], { math });
    near(r.parts[0].earned, 4 * 0.3, 1e-12); eq(r.parts[0].withSolution, true); near(r.earned, 1.2 + 6, 1e-12);
    const q = Q.gradeShort(questions[0], { k: 4 }, '4', true, { math });
    near(q.earned, 0.3, 1e-12);
  });
  test('simulacro: 40 % preguntas + 60 % problemas = 100', () => {
    const s = Q.simulacroScore([{ earned: 1, total: 1 }, { earned: 1, total: 1 }], [{ earned: 10, total: 10 }]);
    near(s.total, 100, 1e-12); near(s.short, 40, 1e-12); near(s.exam, 60, 1e-12);
    const h = Q.simulacroScore([{ earned: 0.5, total: 1 }, { earned: 0, total: 1 }], [{ earned: 5, total: 10 }, { earned: 10, total: 10 }]);
    near(h.total, 40 * 0.25 + 60 * 0.75, 1e-12);
    near(Q.WEIGHTS.short + Q.WEIGHTS.exam, 100, 0);
  });
  test('examen personalizado con una sola parte: esa vale 100', () => {
    const a = Q.simulacroScore([{ earned: 3, total: 4 }], []);
    near(a.total, 75, 1e-12); eq(a.weights.short, 100);
    const b = Q.simulacroScore([], [{ earned: 6, total: 12 }]);
    near(b.total, 50, 1e-12); eq(b.weights.exam, 100);
  });
  test('reloj sugerido: 90 min parcial, 120 min final', () => {
    eq(Q.suggestedMinutes('parcial-2'), 90); eq(Q.suggestedMinutes('final'), 120); eq(Q.suggestedMinutes(null), 90);
  });
  test('historial: últimos 10, y sin localStorage no truena', () => {
    const store = {};
    W.localStorage = { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; } };
    for (let i = 0; i < 13; i++) Q.saveHistory('cb-quiz-history', { n: i });
    const h = Q.loadHistory('cb-quiz-history');
    eq(h.length, 10); eq(h[0].n, 12, 'el más reciente primero');
    W.localStorage = { getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('bloqueado'); } };
    Q.saveHistory('cb-quiz-history', { n: 99 });
    eq(Q.loadHistory('cb-quiz-history').length, 0);
  });

  test('números: notación científica en los formatos que escribe un alumno', () => {
    const P = W.CBExercises.parseNumber;
    ['8.3e-5', '8.3E-5', '8.3×10^-5', '8.3x10^-5', '8.3 x 10^(-5)', '8.3*10^-5', '8.3·10⁻⁵', '8.3 × 10 ^ −5']
      .forEach((s) => near(P(s), 8.3e-5, 1e-15, s));
    near(P('1.2×10^3'), 1200, 1e-9); near(P('−2,5x10^4'), -25000, 1e-9); near(P('10^-5'), 1e-5, 1e-15);
    eq(P('3.14'), 3.14); eq(Number.isNaN(P('x10^5')), true);
  });
  test('tolerancia: una centésima de holgura desde 0.1; los resultados chicos siguen con ±1 %', () => {
    const T = W.CBExercises.withinTol;
    eq(T(0.57, 0.567), true); eq(T(0.56, 0.567), true); eq(T(0.55, 0.567), false);
    eq(T(0, 8.3e-5), false); eq(T(8.3e-5, 8.33e-5), true);
  });
  test('aviso numérico: g en Física, π solo si la pregunta lo usa', () => {
    const H = W.CBExercises.numberHint;
    eq(/g = 9\.81/.test(H({ fis: true, parts: ['sin pi'] })), true);
    eq(/g = 9\.81/.test(H({ fis: false, parts: [] })), false);
    eq(/π = 3\.14/.test(H({ fis: false, parts: [function (v) { return Math.PI * v.r; }] })), true);
    eq(/π = 3\.14/.test(H({ fis: false, parts: ['$\\pi r^2$'] })), true);
    eq(/π = 3\.14/.test(H({ fis: true, parts: ['Calcula el trabajo'] })), false);
  });

  console.log(`\nquiz-engine.test.js: ${pass} ok, ${fail} fallan.`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
