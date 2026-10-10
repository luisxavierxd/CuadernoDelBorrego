#!/usr/bin/env node
// Formularios (data/<curso>/formulario.js): cada fórmula con comprobación se verifica
// numéricamente con LabMath y math.js 15.2.0 — derivadas, antiderivadas e identidades.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadData } = require('./lib/load');
const { loadMathjs } = require('./lib/vendor');

const ROOT = path.join(__dirname, '..');
const LIBS = ['registry', 'antiderivative-check', 'derivative-check'].map((n) => path.join(ROOT, 'shared/js/labs', n + '.js'));
let pass = 0, fail = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('✗ ' + msg); } }

(async () => {
  const math = await loadMathjs();
  const W = loadData(LIBS, {});
  const LM = W.LabMath;
  for (const course of require('./lib/courses').courses()) {
    const file = path.join(ROOT, 'data', course, 'formulario.js');
    if (!fs.existsSync(file)) continue;
    const F = loadData(file, {}).FORMULARIO;
    ok(F && Array.isArray(F.sections) && F.sections.length, `${course}: formulario sin secciones`);
    let checked = 0, items = 0;
    const meta = loadData(path.join(ROOT, 'data', course, 'course-meta.js'), {}).COURSE_META;
    const sessions = new Set(meta.groups.flatMap((g) => g.sessions.map((s) => s.n)));
    F.sections.forEach((sec, si) => {
      ok(typeof sec.title === 'string' && sec.title.length > 2, `${course} sección ${si}: sin título`);
      (sec.sessions || []).forEach((n) => ok(sessions.has(n), `${course} ${sec.title}: la sesión ${n} no existe`));
      sec.items.forEach((it, ii) => {
        items++;
        const at = `${course} · ${sec.title} · ${ii + 1}`;
        ok(typeof it.tex === 'string' && it.tex.length > 2 && !/[\x00-\x08\x0b-\x1f]/.test(it.tex), `${at}: tex vacío o con una barra perdida`);
        if (it.s != null) ok(sessions.has(it.s), `${at}: la sesión ${it.s} no existe`);
        const c = it.check;
        if (!c) return;
        checked++;
        const a = c.a != null ? c.a : 0.2, b = c.b != null ? c.b : 2.2;
        try {
          if (c.d) ok(LM.derivative.verify(math, c.d[0], c.d[1], a, b).reason === 'correct', `${at}: d/dx ${c.d[0]} ≠ ${c.d[1]}`);
          else if (c.i) ok(LM.antiderivative.verify(math, c.i[0], c.i[1], a, b).reason === 'correct', `${at}: ∫ ${c.i[0]} ≠ ${c.i[1]}`);
          else if (c.eq) {
            const L = LM.core.build(math, c.eq[0]).fn, R = LM.core.build(math, c.eq[1]).fn;
            let worst = 0;
            for (let k = 0; k <= 40; k++) { const x = a + (b - a) * k / 40; worst = Math.max(worst, Math.abs(L(x) - R(x)) / (1 + Math.abs(R(x)))); }
            ok(worst < 1e-9, `${at}: ${c.eq[0]} ≠ ${c.eq[1]} (error ${worst})`);
          } else ok(false, `${at}: comprobación desconocida`);
        } catch (e) { ok(false, `${at}: ${e.message}`); }
      });
    });
    console.log(`${course}/formulario.js: ${items} fórmulas · ${checked} comprobadas numéricamente`);
  }
  console.log(`\nformulario.test.js: ${pass} ok, ${fail} fallan.`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
