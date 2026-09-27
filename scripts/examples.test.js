#!/usr/bin/env node
// Ejemplos y ejercicios de cada sesión (§7.3, §9, §11): las respuestas calculadas en los datos
// deben coincidir con LabMath, y el motor de ejercicios debe calificarlas bien.
// Una sesión que ya pasó no se revisa de nuevo mientras no cambien ella, los labs ni esta
// prueba (caché en node_modules/.cache/cuaderno); `--all` o VALIDATE_ALL=1 revisa todo.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadData } = require('./lib/load');
const { loadMathjs } = require('./lib/vendor');
const cache = require('./lib/cache');

const ROOT = path.join(__dirname, '..');
const LIBS = ['labs/registry', 'labs/antiderivative-check', 'labs/projectile-check', 'labs/secant-tangent', 'labs/derivative-check', 'labs/chain-composition', 'labs/implicit-tangent', 'labs/f-fprime-fsecond', 'labs/optimize-slider', 'labs/riemann', 'labs/area-between', 'labs/solid-revolution', 'exercises']
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
  } else if (v.lab === 'extrema') {
    const r = LM.extrema.analyze(LM.core.build(math, v.f).fn, v.a, v.b);
    ok(r.crit.length === v.crit.length, `${where}: ${r.crit.length} críticos y el ejemplo dice ${v.crit.length}`);
    v.crit.forEach((c, i) => ok(r.crit[i] && Math.abs(r.crit[i].x - c[0]) < 1e-4 && r.crit[i].kind === c[1], `${where}: crítico ${i} (${c}) ≠ ${JSON.stringify(r.crit[i])}`));
    ok(r.infl.length === (v.infl || []).length, `${where}: ${r.infl.length} inflexiones y el ejemplo dice ${(v.infl || []).length}`);
    (v.infl || []).forEach((x, i) => ok(r.infl[i] && Math.abs(r.infl[i].x - x) < 1e-3, `${where}: inflexión ${x} ≠ ${r.infl[i] && r.infl[i].x}`));
  } else if (v.lab === 'optimum') {
    const r = LM.optimize.optimum(LM.core.build(math, v.f).fn, v.a, v.b, v.kind);
    ok(relClose(r.x, v.x, 1e-6), `${where}: óptimo en ${r.x} y el ejemplo dice ${v.x}`);
    if (v.value != null) ok(relClose(r.value, v.value, 1e-8), `${where}: valor óptimo ${r.value} ≠ ${v.value}`);
  } else if (v.lab === 'riemann') {
    const got = LM.riemann.sum(LM.core.build(math, v.f).fn, v.a, v.b, v.n, v.type);
    ok(relClose(got, v.value, 1e-9), `${where}: suma ${v.type} = ${got} y el ejemplo dice ${v.value}`);
  } else if (v.lab === 'ftc1') {
    const f = LM.core.build(math, v.f).fn, e = 1e-4;
    const G = (x) => LM.riemann.simpson(f, v.a, x, 400);
    const want = (G(v.x + e) - G(v.x - e)) / (2 * e);
    ok(relClose(v.value, want, 1e-6), `${where}: d/dx ∫ = ${v.value} y numéricamente ${want}`);
  } else if (v.lab === 'area' || v.lab === 'arc' || v.lab === 'volume') {
    const got = geo(LM, math, v);
    ok(relClose(got, v.value, 1e-6), `${where}: ${v.lab} = ${got} y el ejemplo dice ${v.value}`);
  } else ok(false, `${where}: verify.lab desconocido ${v.lab}`);
}

// Área entre curvas, longitud de arco o volumen, calculados con LabMath.
function geo(LM, math, o) {
  const f = LM.core.build(math, o.f).fn, g = LM.core.build(math, o.g || '0').fn;
  if (o.lab === 'area') return LM.area.between(f, g, o.a, o.b);
  if (o.lab === 'arc') return LM.area.arcLength(f, o.a, o.b);
  return o.method === 'shell' ? LM.solid.shells(f, g, o.a, o.b) : LM.solid.disks(f, g, o.a, o.b);
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
      } else if (o && (o.lab === 'extremum' || o.lab === 'inflection')) {
        const r = LM.extrema.analyze(LM.core.build(math, o.f(v)).fn, o.a(v), o.b(v));
        const hit = o.lab === 'extremum' ? r.crit.find((c) => c.kind === o.kind) : r.infl[0];
        ok(hit && Math.abs(ans - (o.field === 'value' ? hit.y : hit.x)) < 1e-4 * (1 + Math.abs(ans)), `${at}: respuesta ${ans} y el análisis da ${JSON.stringify(hit)}`);
      } else if (o && o.lab === 'optimum') {
        const r = LM.optimize.optimum(LM.core.build(math, o.f(v)).fn, o.a(v), o.b(v), o.kind);
        ok(relClose(ans, o.field === 'value' ? r.value : r.x, 1e-6), `${at}: respuesta ${ans} y el óptimo numérico da ${JSON.stringify(r)}`);
      } else if (o && (o.lab === 'area' || o.lab === 'arc' || o.lab === 'volume')) {
        const want = geo(LM, math, { lab: o.lab, method: o.method, f: o.f(v), g: o.g ? o.g(v) : '0', a: o.a(v), b: o.b(v) });
        ok(relClose(ans, want, 1e-6), `${at}: respuesta ${ans} y LabMath da ${want}`);
      } else if (o && o.lab === 'riemann') {
        const want = LM.riemann.sum(LM.core.build(math, o.f(v)).fn, o.a(v), o.b(v), o.n(v), o.type);
        ok(relClose(ans, want, 1e-9), `${at}: respuesta ${ans} y la suma da ${want}`);
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
  const shared = LIBS.concat([__filename, path.join(__dirname, 'lib/load.js'), path.join(__dirname, 'lib/vendor.js'), path.join(ROOT, 'node_modules/mathjs/package.json')]);
  const store = cache.store('examples');
  let cached = 0;
  for (const file of files) {
    const id = path.relative(ROOT, file).split(path.sep).join('/');
    const key = cache.fingerprint(shared.concat([file]));
    const hit = store.get(id, key);
    if (hit) { cached++; pass += hit.n; console.log(`${id}: ${hit.n} comprobaciones · sin cambios`); continue; }
    const failsBefore = fail;
    const W = loadData(LIBS, {});
    W.math = math;
    loadData(file, W);
    const d = W.SESSION_DATA;
    const name = path.relative(ROOT, file).split(path.sep).join('/');
    const before = pass + fail;
    (d.lesson || []).filter((b) => b.type === 'example').forEach((b, i) => checkExample(`${name} ejemplo ${i + 1}`, b, W.LabMath, math));
    (d.exercises || []).forEach((ex) => checkExercise(`${name} ${ex.id}`, ex, W, W.LabMath, math));
    console.log(`${name}: ${pass + fail - before} comprobaciones`);
    if (fail === failsBefore) store.set(id, key, { n: pass + fail - before }); else store.drop(id);
  }
  store.save();
  fails.slice(0, 40).forEach((f) => console.log('✗ ' + f));
  if (fails.length > 40) console.log(`… y ${fails.length - 40} más`);
  console.log(`\nexamples.test.js: ${files.length} sesiones (${cached} sin cambios) · ${pass} ok, ${fail} fallan.`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
