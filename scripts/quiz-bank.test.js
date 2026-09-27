#!/usr/bin/env node
// Bancos de preguntas (§10.1, §11): por sesión, ≥ 100 preguntas, todos los subtemas cubiertos,
// mezcla de dificultad ≈ 30/50/20, ≥ 30 % conceptuales, `source` válido y sin duplicados.
// Por pregunta, 200 instancias: respuesta finita, opciones únicas, la correcta entre las
// opciones, restricciones de `vars` cumplidas y la respuesta calificada como correcta.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadData } = require('./lib/load');
const { loadMathjs } = require('./lib/vendor');

const ROOT = path.join(__dirname, '..');
const LIBS = ['labs/registry', 'labs/antiderivative-check', 'labs/projectile-check', 'labs/secant-tangent', 'labs/derivative-check', 'labs/chain-composition', 'labs/implicit-tangent', 'exercises', 'quiz/engine'].map((n) => path.join(ROOT, 'shared/js', n + '.js'));
const N = 200, N_EXPR = 40, N_DUP = 20;
const MIN = 100, MIX = { 1: 30, 2: 50, 3: 20 }, MIX_TOL = 6, MIN_CONCEPT = 30, MIN_PER_SUB = 5;

let pass = 0, fail = 0;
const fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); } }
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

(async () => {
  const math = await loadMathjs();
  const ids = new Set();
  let files = 0;
  for (const course of ['calculo-1', 'fisica-1']) {
    const dir = path.join(ROOT, 'data', course, 'bank');
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((x) => /^sesion-\d\d\.js$/.test(x))) {
      files++;
      const W = loadData(LIBS, {});
      loadData(path.join(dir, f), W);
      const where = `${course}/bank/${f}`;
      const NN = f.match(/\d\d/)[0];
      const codes = Object.keys(W.CB_BANK || {});
      ok(codes.length === 1, `${where}: debe registrar un solo curso en CB_BANK`);
      const code = codes[0];
      const S = (W.CB_BANK[code] || {})['S' + NN];
      ok(!!S, `${where}: falta CB_BANK.${code}.S${NN}`);
      if (!S) continue;
      const Q = S.questions || [];
      const subs = Object.keys(S.subtopics || {});
      ok(Q.length >= MIN, `${where}: ${Q.length} preguntas (mínimo ${MIN})`);

      const perDiff = { 1: 0, 2: 0, 3: 0 }, perSub = {};
      let concept = 0;
      const byPrompt = new Map(), byAnswers = new Map();
      for (const q of Q) {
        const at = `${where} ${q.id}`;
        ok(q.id && !ids.has(q.id), `${at}: id vacío o repetido`);
        ids.add(q.id);
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
          if (i === 0) {
            const key = norm(prompt);
            ok(!byPrompt.has(key), `${at}: mismo enunciado que ${byPrompt.get(key)}`);
            byPrompt.set(key, q.id);
          }
          if (q.type === 'choice') {
            const opts = q.options(v), texts = opts.map((o) => o.text);
            ok(opts.length >= 3, `${vi}: pocas opciones`);
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
        ok(q.type === 'choice' || !byAnswers.has(akey), `${at}: mismas respuestas que ${byAnswers.get(akey)} (¿duplicado?)`);
        byAnswers.set(akey, q.id);
      }
      const total = Q.length || 1;
      for (const d of [1, 2, 3]) {
        const pct = perDiff[d] / total * 100;
        ok(Math.abs(pct - MIX[d]) <= MIX_TOL, `${where}: dificultad ${d} = ${pct.toFixed(0)} % (objetivo ${MIX[d]} %)`);
      }
      ok(concept / total * 100 >= MIN_CONCEPT, `${where}: ${concept} conceptuales (mínimo ${MIN_CONCEPT} %)`);
      subs.forEach((s) => ok((perSub[s] || 0) >= MIN_PER_SUB, `${where}: el subtema ${s} tiene ${perSub[s] || 0} preguntas (mínimo ${MIN_PER_SUB})`));
      console.log(`${where}: ${Q.length} preguntas · dificultad ${perDiff[1]}/${perDiff[2]}/${perDiff[3]} · ${concept} conceptuales · subtemas ${subs.map((s) => perSub[s] || 0).join('/')}`);
    }
  }
  ok(files > 0, 'no encontré bancos');
  fails.slice(0, 50).forEach((f) => console.log('✗ ' + f));
  if (fails.length > 50) console.log(`… y ${fails.length - 50} más`);
  console.log(`\nquiz-bank.test.js: ${files} bancos · ${pass} ok, ${fail} fallan.`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
