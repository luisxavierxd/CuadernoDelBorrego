#!/usr/bin/env node
// Bancos de preguntas (§10.1, §11): por sesión, ≥ 100 preguntas, todos los subtemas cubiertos,
// mezcla de dificultad ≈ 30/50/20, ≥ 30 % conceptuales, `source` válido y sin duplicados.
// Por pregunta, 200 instancias: respuesta finita, opciones únicas, la correcta entre las
// opciones, restricciones de `vars` cumplidas y la respuesta calificada como correcta.
//
// Rapidez: cada banco se revisa en un hilo aparte (hasta 4 a la vez) y un banco que ya pasó
// no se vuelve a revisar mientras no cambien él, los calificadores ni esta prueba
// (caché en node_modules/.cache/cuaderno). `--all` o VALIDATE_ALL=1 revisa todo.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Worker, isMainThread, parentPort } = require('worker_threads');
const { loadData } = require('./lib/load');
const { loadMathjs } = require('./lib/vendor');
const cache = require('./lib/cache');

const ROOT = path.join(__dirname, '..');
const LIBS = ['labs/registry', 'labs/antiderivative-check', 'labs/projectile-check', 'labs/secant-tangent', 'labs/derivative-check', 'labs/chain-composition', 'labs/implicit-tangent', 'exercises', 'quiz/engine', 'quiz/bank-kit'].map((n) => path.join(ROOT, 'shared/js', n + '.js'));
const N = 200, N_EXPR = 40, N_DUP = 20;
const MIN = 100, MIX = { 1: 30, 2: 50, 3: 20 }, MIX_TOL = 6, MIN_CONCEPT = 30, MIN_PER_SUB = 5;

function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const str = (x, v) => (typeof x === 'function' ? x(v) : x);
const norm = (s) => String(s).toLowerCase().replace(/<[^>]+>/g, '').replace(/-?\d+(\.\d+)?/g, '#').replace(/\s+/g, '');

function validSource(s) {
  return s === 'propia' || (s && typeof s === 'object' && s.work && s.section && s.license && /CC BY|CC0|dominio público/i.test(s.license));
}

// Revisa un banco completo. Devuelve { pass, fail, fails, ids, line }.
function checkBank(math, course, f) {
  let pass = 0, fail = 0;
  const fails = [], ids = [];
  function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); } }
  const dir = path.join(ROOT, 'data', course, 'bank');
  const W = loadData(LIBS, {});
  loadData(path.join(dir, f), W);
  const where = `${course}/bank/${f}`;
  const NN = f.match(/\d\d/)[0];
  const codes = Object.keys(W.CB_BANK || {});
  ok(codes.length === 1, `${where}: debe registrar un solo curso en CB_BANK`);
  const code = codes[0];
  const S = (W.CB_BANK[code] || {})['S' + NN];
  ok(!!S, `${where}: falta CB_BANK.${code}.S${NN}`);
  if (!S) return { pass, fail, fails, ids, line: where + ': sin banco' };
  const Q = S.questions || [];
  const subs = Object.keys(S.subtopics || {});
  ok(Q.length >= MIN, `${where}: ${Q.length} preguntas (mínimo ${MIN})`);

  const perDiff = { 1: 0, 2: 0, 3: 0 }, perSub = {};
  let concept = 0;
  const byPrompt = new Map(), byAnswers = new Map(), seenIds = new Set();
  for (const q of Q) {
    const at = `${where} ${q.id}`;
    const balanced = (t) => ((t || '').match(/(?<!\\)\$/g) || []).length % 2 === 0;
    // Barras de LaTeX perdidas al escribir la plantilla: '\frac' en JS es un salto de página,
    // '\sin' se vuelve 'sin'. Se detectan caracteres de control o comandos sin barra dentro de $…$.
    const CMD = /(^|[^\\a-zA-Z])(sqrt|frac|dfrac|tfrac|left|right|cdot|int|displaystyle|infty|theta|sin|cos|tan|sec|csc|cot|ln|lim|times|neq|leq|geq|approx|circ|arcsin|arctan|arccos|quad|pm|text)(?![a-zA-Z])/;
    const texOk = (t) => !t || (!/[\x00-\x08\x0b-\x1f]/.test(t) && !(t.match(/\$[^$]+\$/g) || []).some((m) => CMD.test(m)));
    ok(q.id && !seenIds.has(q.id), `${at}: id vacío o repetido`);
    seenIds.add(q.id);
    ids.push(q.id);
    ok(Array.isArray(q.tags) && q.tags[0] === `${code}.S${NN}`, `${at}: la primera etiqueta debe ser ${code}.S${NN}`);
    ok(subs.includes(q.tags[1]), `${at}: subtema "${q.tags[1]}" no declarado`);
    perSub[q.tags[1]] = (perSub[q.tags[1]] || 0) + 1;
    ok([1, 2, 3].includes(q.difficulty), `${at}: difficulty debe ser 1, 2 o 3`);
    perDiff[q.difficulty] = (perDiff[q.difficulty] || 0) + 1;
    if (q.concept) { concept++; ok(q.type === 'choice', `${at}: una conceptual debe ser de opción múltiple`); }
    ok(['numeric', 'expr', 'choice'].includes(q.type), `${at}: type inválido`);
    ok(validSource(q.source), `${at}: source inválido`);

    const n = q.type === 'expr' ? N_EXPR : N;
    const rand = rng(99);
    const answers = [];
    for (let i = 0; i < n; i++) {
      let v;
      try { v = W.CBExercises.instance(q, rand); } catch (e) { ok(false, `${at}: ${e.message}`); break; }
      const vi = `${at} ${JSON.stringify(v)}`;
      for (const [k, r] of Object.entries(q.vars || {})) {
        const step = r[2] || 1;
        ok(v[k] >= r[0] - 1e-9 && v[k] <= r[1] + 1e-9 && Math.abs((v[k] - r[0]) / step - Math.round((v[k] - r[0]) / step)) < 1e-6, `${vi}: ${k} fuera de rango o de paso`);
      }
      if (q.where) ok(q.where(v), `${vi}: no cumple where`);
      const prompt = q.prompt(v), why = str(q.why, v);
      ok(typeof prompt === 'string' && prompt.length > 8 && !/undefined|NaN|Infinity/.test(prompt), `${vi}: prompt inválido`);
      ok(typeof why === 'string' && why.length > 8 && !/undefined|NaN/.test(why), `${vi}: falta why`);
      ok(balanced(prompt) && balanced(why), `${vi}: $ sin cerrar en enunciado o why`);
      ok(texOk(prompt) && texOk(why), `${vi}: LaTeX con una barra perdida en enunciado o why`);
      if (i === 0) {
        const key = norm(prompt);
        ok(!byPrompt.has(key), `${at}: mismo enunciado que ${byPrompt.get(key)}`);
        byPrompt.set(key, q.id);
      }
      if (q.type === 'choice') {
        const opts = q.options(v), texts = opts.map((o) => o.text);
        ok(opts.length >= 3, `${vi}: pocas opciones`);
        ok(opts.every((o) => balanced(o.text) && (!o.say || balanced(o.say))), `${vi}: $ sin cerrar en una opción`);
        ok(opts.every((o) => texOk(o.text) && texOk(o.say)), `${vi}: LaTeX con una barra perdida en una opción`);
        ok(new Set(texts).size === texts.length, `${vi}: opciones repetidas: ${texts.join(' | ')}`);
        ok(opts.filter((o) => o.correct).length === 1, `${vi}: debe haber exactamente una correcta`);
        const right = opts.find((o) => o.correct);
        ok(right && q.answer(v) === right.text, `${vi}: answer no coincide con la correcta`);
        if (i < 3) ok(W.CBQuiz.grade(q, v, right.text, { math }).kind === 'ok', `${vi}: la correcta no califica ok`);
        if (i < N_DUP) answers.push(right.text);
        continue;
      }
      const ans = q.answer(v);
      if (q.type === 'numeric') ok(typeof ans === 'number' && isFinite(ans), `${vi}: respuesta no finita (${ans})`);
      if (q.type === 'numeric' ? i < 5 : true) {
        const g = W.CBQuiz.grade(q, v, q.type === 'numeric' ? String(ans) : ans, { math });
        ok(g.kind === 'ok', `${vi}: la respuesta correcta califica "${g.kind}" ${g.say || ''}`);
      }
      for (const [mk, mf] of Object.entries(q.mistakes || {})) {
        if (q.type === 'numeric' && i < 5) {
          const m = mf(v);
          ok(isFinite(m) && !W.CBExercises.withinTol(m, ans, q.tol), `${vi}: el error "${mk}" coincide con la respuesta`);
        }
      }
      if (i < N_DUP) answers.push(typeof ans === 'number' ? +ans.toPrecision(8) : ans);
    }
    const akey = q.type + ':' + JSON.stringify(Object.keys(q.vars || {}).sort()) + ':' + JSON.stringify(answers);
    // Solo en preguntas parametrizadas: dos preguntas fijas pueden tener la misma respuesta
    // con enunciados distintos (esas ya se comparan por enunciado).
    const parametrized = Object.keys(q.vars || {}).length > 0;
    ok(q.type === 'choice' || !parametrized || !byAnswers.has(akey), `${at}: mismas respuestas que ${byAnswers.get(akey)} (¿duplicado?)`);
    byAnswers.set(akey, q.id);
  }
  const total = Q.length || 1;
  for (const d of [1, 2, 3]) {
    const pct = perDiff[d] / total * 100;
    ok(Math.abs(pct - MIX[d]) <= MIX_TOL, `${where}: dificultad ${d} = ${pct.toFixed(0)} % (objetivo ${MIX[d]} %)`);
  }
  ok(concept / total * 100 >= MIN_CONCEPT, `${where}: ${concept} conceptuales (mínimo ${MIN_CONCEPT} %)`);
  subs.forEach((s) => ok((perSub[s] || 0) >= MIN_PER_SUB, `${where}: el subtema ${s} tiene ${perSub[s] || 0} preguntas (mínimo ${MIN_PER_SUB})`));
  const line = `${where}: ${Q.length} preguntas · dificultad ${perDiff[1]}/${perDiff[2]}/${perDiff[3]} · ${concept} conceptuales · subtemas ${subs.map((s) => perSub[s] || 0).join('/')}`;
  return { pass, fail, fails, ids, line };
}

// Hilo de trabajo: carga math.js una vez y revisa los bancos que le mande el principal.
if (!isMainThread) {
  loadMathjs().then((math) => {
    parentPort.on('message', ({ course, f }) => {
      let r;
      try { r = checkBank(math, course, f); } catch (e) { r = { pass: 0, fail: 1, fails: [`${course}/bank/${f}: ${e.message}`], ids: [], line: '' }; }
      parentPort.postMessage(r);
    });
    parentPort.postMessage({ ready: true });
  });
} else {
  (async () => {
    const jobs = [];
    for (const course of ['calculo-1', 'fisica-1']) {
      const dir = path.join(ROOT, 'data', course, 'bank');
      if (!fs.existsSync(dir)) continue;
      fs.readdirSync(dir).filter((x) => /^sesion-\d\d\.js$/.test(x)).forEach((f) => jobs.push({ course, f }));
    }
    // Huella común: calificadores, esta prueba y math.js; más el archivo de cada banco.
    const shared = LIBS.concat([__filename, path.join(__dirname, 'lib/load.js'), path.join(__dirname, 'lib/vendor.js'), path.join(ROOT, 'node_modules/mathjs/package.json')]);
    const store = cache.store('quiz-bank');
    const results = new Map(), todo = [];
    let cached = 0;
    for (const j of jobs) {
      j.id = `${j.course}/${j.f}`;
      j.key = cache.fingerprint(shared.concat([path.join(ROOT, 'data', j.course, 'bank', j.f)]));
      const hit = store.get(j.id, j.key);
      if (hit) { cached++; results.set(j.id, { pass: hit.pass, fail: 0, fails: [], ids: hit.ids, line: hit.line + ' · sin cambios' }); }
      else todo.push(j);
    }

    const size = Math.max(1, Math.min(todo.length, 4, os.cpus().length - 1));
    await Promise.all(Array.from({ length: size }, () => new Promise((resolve, reject) => {
      const w = new Worker(__filename);
      w.on('error', reject);
      const next = () => {
        const j = todo.shift();
        if (!j) { w.terminate(); return resolve(); }
        w.once('message', (r) => {
          results.set(j.id, r);
          if (!r.fail) store.set(j.id, j.key, { pass: r.pass, ids: r.ids, line: r.line });
          else store.drop(j.id);
          next();
        });
        w.postMessage({ course: j.course, f: j.f });
      };
      w.once('message', next);   // { ready }
    })));
    store.save();

    let pass = 0, fail = 0;
    const fails = [], allIds = new Map();
    for (const j of jobs) {
      const r = results.get(j.id);
      console.log(r.line);
      pass += r.pass; fail += r.fail; fails.push(...r.fails);
      // Los id deben ser únicos entre todos los bancos, no solo dentro de uno.
      for (const id of r.ids || []) {
        if (allIds.has(id) && allIds.get(id) !== j.id) { fail++; fails.push(`${j.id} ${id}: id repetido en ${allIds.get(id)}`); }
        else allIds.set(id, j.id);
      }
    }
    if (!jobs.length) { fail++; fails.push('no encontré bancos'); }
    fails.slice(0, 50).forEach((f) => console.log('✗ ' + f));
    if (fails.length > 50) console.log(`… y ${fails.length - 50} más`);
    console.log(`\nquiz-bank.test.js: ${jobs.length} bancos (${cached} sin cambios) · ${pass} ok, ${fail} fallan.`);
    process.exit(fail ? 1 : 0);
  })().catch((e) => { console.error(e); process.exit(1); });
}
