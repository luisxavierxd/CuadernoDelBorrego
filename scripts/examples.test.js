#!/usr/bin/env node
// Ejemplos y ejercicios de cada sesión (§7.3, §9, §11): las respuestas calculadas en los datos
// deben coincidir con LabMath, y el motor de ejercicios debe calificarlas bien.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadData } = require('./lib/load');
const { loadMathjs } = require('./lib/vendor');

const ROOT = path.join(__dirname, '..');
const LIBS = ['labs/registry', 'labs/antiderivative-check', 'labs/projectile-check', 'labs/secant-tangent', 'labs/derivative-check', 'labs/chain-composition', 'labs/implicit-tangent', 'exercises']
  .map((n) => path.join(ROOT, 'shared/js', n + '.js'));
const N_FAST = 200, N_EXPR = 50;

let pass = 0, fail = 0;
const fails = [];
function ok(cond, msg) { if (cond) pass++; else { fail++; fails.push(msg); } }
const relClose = (a, b, tol) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
function rng(seed) {                                   // mulberry32: instancias reproducibles
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function sessionFiles() {
  const out = [];
  for (const course of ['calculo-1', 'fisica-1']) {
    const dir = path.join(ROOT, 'data', course);
    for (const f of fs.readdirSync(dir)) if (/^sesion-\d\d\.js$/.test(f)) out.push(path.join(dir, f));
  }
  return out;
}

function checkExample(where, b, LM, math) {
  const v = b.verify;
  ok(v && v.lab, `${where}: el ejemplo necesita verify`);
  if (!v) return;
  if (v.lab === 'antiderivative') {
    const r = LM.antiderivative.verify(math, v.f, v.F, v.a, v.b);
    ok(r.reason === 'correct', `${where}: F′ ≠ f (${r.reason})`);
    if (v.value != null) {
      ok(relClose(r.I, v.value, 1e-6), `${where}: Simpson ${r.I} ≠ ${v.value}`);
      ok(relClose(r.D, v.value, 1e-9), `${where}: F(b) − F(a) ${r.D} ≠ ${v.value}`);
    }
  } else if (v.lab === 'projectile') {
    const f = LM.projectile.flight(v.p);
    for (const k of Object.keys(v.values)) ok(relClose(v.values[k], f[k], 1e-9), `${where}: ${k} = ${v.values[k]} y LabMath da ${f[k]}`);
  } else if (v.lab === 'derivative') {
    const r = LM.derivative.verify(math, v.f, v.d, v.a != null ? v.a : 0.3, v.b != null ? v.b : 2.2);
    ok(r.reason === 'correct', `${where}: d/dx ${v.f} ≠ ${v.d} (${r.reason})`);
  } else if (v.lab === 'derivative-at') {
    const want = LM.secant.tangentSlope(LM.core.build(math, v.f).fn, v.a);
    ok(relClose(v.value, want, 1e-6), `${where}: f′(${v.a}) = ${v.value} y numéricamente da ${want}`);
  } else if (v.lab === 'tangent') {
    const L = LM.secant.tangentLine(LM.core.build(math, v.f).fn, v.a);
    ok(relClose(v.m, L.m, 1e-6) && relClose(v.b, L.b, 1e-6), `${where}: tangente y = ${v.m}x + ${v.b}; numérica ${L.m}x + ${L.b}`);
  } else if (v.lab === 'secant') {
    const want = LM.secant.slope(LM.core.build(math, v.f).fn, v.a, v.h);
    ok(relClose(v.value, want, 1e-9), `${where}: pendiente secante ${v.value} ≠ ${want}`);
  } else if (v.lab === 'implicit') {
    const r = LM.implicit.verify(math, v.eq, v.d, v.x0, v.y0);
    ok(r.reason === 'correct', `${where}: dy/dx de ${v.eq} ≠ ${v.d} (${r.reason})`);
    if (v.slope != null) ok(relClose(v.slope, r.trueSlope, 1e-6), `${where}: pendiente ${v.slope} ≠ ${r.trueSlope}`);
  } else ok(false, `${where}: verify.lab desconocido ${v.lab}`);
}

function textOk(s) { return typeof s === 'string' && s.length > 0 && !/undefined|NaN|Infinity/.test(s); }

function checkExercise(where, ex, W, LM, math) {
  const E = W.CBExercises;
  const keys = Object.keys(ex.mistakes || {});
  (ex.feedback || []).forEach((f) => ok(keys.includes(f.when) || f.when === 'sign' || f.when === 'factor',
    `${where}: feedback "${f.when}" no tiene mistake`));
  keys.forEach((k) => ok((ex.feedback || []).some((f) => f.when === k), `${where}: el error típico "${k}" no tiene mensaje`));
  ok(typeof ex.hint === 'string' || typeof ex.hint === 'function', `${where}: falta hint`);

  const n = ex.check === 'expr' ? N_EXPR : N_FAST;
  const rand = rng(1234);
  for (let i = 0; i < n; i++) {
    let v;
    try { v = E.instance(ex, rand); } catch (e) { ok(false, `${where}: ${e.message}`); return; }
    const at = `${where} [${JSON.stringify(v)}]`;
    for (const [k, r] of Object.entries(ex.vars || {})) {
      const step = r[2] || 1;
      ok(v[k] >= r[0] - 1e-9 && v[k] <= r[1] + 1e-9 && Math.abs((v[k] - r[0]) / step - Math.round((v[k] - r[0]) / step)) < 1e-6, `${at}: ${k} fuera de rango o de paso`);
    }
    if (ex.where) ok(ex.where(v), `${at}: no cumple where`);
    ok(textOk(ex.prompt(v)), `${at}: prompt vacío o con NaN`);
    ok(textOk(ex.solution(v)), `${at}: solución vacía o con NaN`);

    if (ex.check === 'choice') {
      const opts = ex.options(v);
      const texts = opts.map((o) => o.text);
      ok(new Set(texts).size === texts.length, `${at}: opciones repetidas`);
      ok(opts.filter((o) => o.correct).length === 1, `${at}: debe haber exactamente una correcta`);
      const right = opts.find((o) => o.correct);
      ok(right && ex.answer(v) === right.text, `${at}: answer no coincide con la opción correcta`);
      ok(E.grade(ex, v, right.text, { math }).kind === 'ok', `${at}: la correcta no califica ok`);
      opts.filter((o) => !o.correct).forEach((o) => {
        ok(E.grade(ex, v, o.text, { math }).kind === 'bad', `${at}: "${o.text}" debería calificar mal`);
        ok(textOk(o.say), `${at}: el distractor "${o.text}" necesita explicación`);
      });
      continue;
    }

    const ans = ex.answer(v);
    const input = ex.check === 'numeric' ? String(ans) : ans;
    if (ex.check === 'numeric') {
      ok(isFinite(ans), `${at}: respuesta no finita`);
      const o = ex.oracle;
      ok(!!o, `${at}: un ejercicio numérico necesita oracle`);
      if (o && o.lab === 'projectile') {
        const want = LM.projectile.flight(o.p(v))[o.field];
        ok(relClose(ans, want, 1e-9), `${at}: respuesta ${ans} y LabMath da ${want}`);
      } else if (o && o.lab === 'derivative-at') {
        const want = LM.secant.tangentSlope(LM.core.build(math, o.f(v)).fn, o.a(v));
        ok(relClose(ans, want, 1e-6), `${at}: respuesta ${ans} y f′ numérica da ${want}`);
      } else if (o && o.lab === 'implicit-slope') {
        const F = LM.implicit.build(math, o.eq(v));
        const want = LM.implicit.slope(F, o.x0(v), o.y0(v));
        ok(Math.abs(F(o.x0(v), o.y0(v))) < 1e-9, `${at}: el punto no está sobre la curva`);
        ok(relClose(ans, want, 1e-6), `${at}: respuesta ${ans} y −F_x/F_y da ${want}`);
      } else if (o && o.lab === 'value') {
        const want = o.value(v);
        ok(relClose(ans, want, 1e-9), `${at}: respuesta ${ans} y el cálculo independiente da ${want}`);
      } else if (o && o.lab === 'integral') {
        const f = LM.antiderivative.build(math, o.f(v)).fn;
        const want = LM.antiderivative.simpson(f, o.a(v), o.b(v), 400);
        ok(relClose(ans, want, 1e-6), `${at}: respuesta ${ans} y Simpson da ${want}`);
      }
    }
    const g = E.grade(ex, v, input, { math });
    ok(g.kind === 'ok', `${at}: la respuesta correcta califica "${g.kind}"`);
    for (const k of keys) {
      const m = ex.mistakes[k](v);
      const r = E.grade(ex, v, ex.check === 'numeric' ? String(m) : m, { math });
      ok(r.kind === 'warn' && r.key === k && textOk(r.say), `${at}: el error "${k}" califica ${r.kind}/${r.key}`);
    }
  }
}

(async () => {
  const math = await loadMathjs();
  const files = sessionFiles();
  for (const file of files) {
    const W = loadData(LIBS, {});
    W.math = math;
    loadData(file, W);
    const d = W.SESSION_DATA;
    const name = path.relative(ROOT, file).split(path.sep).join('/');
    const before = pass + fail;
    (d.lesson || []).filter((b) => b.type === 'example').forEach((b, i) => checkExample(`${name} ejemplo ${i + 1}`, b, W.LabMath, math));
    (d.exercises || []).forEach((ex) => checkExercise(`${name} ${ex.id}`, ex, W, W.LabMath, math));
    console.log(`${name}: ${pass + fail - before} comprobaciones`);
  }
  fails.slice(0, 40).forEach((f) => console.log('✗ ' + f));
  if (fails.length > 40) console.log(`… y ${fails.length - 40} más`);
  console.log(`\nexamples.test.js: ${files.length} sesiones · ${pass} ok, ${fail} fallan.`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
