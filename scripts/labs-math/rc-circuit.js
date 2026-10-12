// Pruebas de LabMath.rc (lab rc-circuit, Física 2 · S15) con oráculos independientes:
// el integrador RK4 contra la solución analítica en carga y descarga con R y C variados;
// ∫i²R dt por cuadratura de Simpson (y por el RK4) = ½Cε² para cualquier R; q(τ)/Q_f = 1 − 1/e;
// V_C + V_R = ε; el tiempo para llegar a un voltaje contra bisección sobre el RK4; el juego
// kΩ–μF–ms contra SI; el diagnóstico del reto; y el banco de S15 recalculado por otra ruta (alt).
'use strict';
const path = require('path');
const fs = require('fs');
const { loadData } = require('../lib/load');

module.exports = ({ test, eq, near, LM }) => {
  const O = LM.rc;
  const rel = (a, b, tol, msg) => near(a, b, tol * Math.max(Math.abs(b), 1e-30), msg);
  let seed = 31;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const pick = (lo, hi) => lo + (hi - lo) * rnd();
  // Simpson compuesto (n par).
  const simpson = (f, a, b, n) => {
    const hh = (b - a) / n;
    let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * hh);
    return s * hh / 3;
  };

  test('rc: valores a mano', () => {
    // 10 kΩ y 100 μF: τ = 1 s; con 12 V, Q_f = 1.2 mC e I₀ = 1.2 mA.
    rel(O.tau(10e3, 100e-6), 1, 1e-12);
    const s = O.charge(10e3, 100e-6, 12, 1);
    rel(s.Qf, 1.2e-3, 1e-12); rel(s.I0, 1.2e-3, 1e-12);
    rel(s.q, 1.2e-3 * (1 - Math.exp(-1)), 1e-12);
    rel(O.fraction(5), 0.993262053, 1e-8);
    rel(O.timeTo('c', 10e3, 100e-6, 12, 6), Math.LN2, 1e-12);
    rel(O.timeTo('d', 10e3, 100e-6, 12, 6), Math.LN2, 1e-12);
    const f = O.fullCharge(100e-6, 12);
    rel(f.Ubat, 0.0144, 1e-12); rel(f.Uc, 0.0072, 1e-12); rel(f.Ur, 0.0072, 1e-12);
  });

  test('rc: RK4 propio contra la solución analítica (carga y descarga)', () => {
    for (let t = 0; t < 120; t++) {
      const R = pick(100, 2e5), C = pick(1e-6, 1e-3), eps = pick(1, 48), T = R * C, tt = pick(0.05, 6) * T;
      ['c', 'd'].forEach((m) => {
        const a = O.state(m, R, C, eps, tt), r = O.rk4(m, R, C, eps, tt, 2000);
        rel(r.q, a.q, 1e-9, `${m} q R=${R} C=${C} t=${tt}`);
        rel(r.i, a.i, 1e-8, `${m} i`);
        rel(r.VC, a.VC, 1e-9, `${m} V_C`);
        rel(r.Wr, a.Ur, 1e-8, `${m} energía disipada`);
        rel(r.Wbat, a.Ubat, 1e-8, `${m} energía de la batería`);
      });
    }
    // Con pocos pasos el RK4 ya se acerca (orden 4): el error baja ~16 veces al duplicar n.
    const e1 = Math.abs(O.rk4('c', 1, 1, 1, 3, 20).q - O.charge(1, 1, 1, 3).q);
    const e2 = Math.abs(O.rk4('c', 1, 1, 1, 3, 40).q - O.charge(1, 1, 1, 3).q);
    if (!(e1 / e2 > 12 && e1 / e2 < 20)) throw new Error(`orden del RK4: razón ${e1 / e2}`);
  });

  test('rc: ∫i²R dt = ½Cε² para cualquier R (Simpson y RK4)', () => {
    for (let t = 0; t < 60; t++) {
      const C = pick(1e-6, 1e-3), eps = pick(1, 48), want = 0.5 * C * eps * eps;
      [pick(10, 100), pick(1e3, 1e4), pick(1e5, 1e6)].forEach((R) => {
        const T = R * C;
        const heat = simpson((x) => { const i = O.charge(R, C, eps, x).i; return i * i * R; }, 0, 40 * T, 8000);
        rel(heat, want, 1e-9, `Simpson R=${R}`);
        rel(O.rk4('c', R, C, eps, 40 * T, 8000).Wr, want, 1e-9, `RK4 R=${R}`);
        // La batería entregó Qε: el doble.
        rel(simpson((x) => eps * O.charge(R, C, eps, x).i, 0, 40 * T, 8000), C * eps * eps, 1e-9, 'Qε');
        // En la descarga, todo lo guardado se va en R.
        rel(simpson((x) => { const i = O.discharge(R, C, eps, x).i; return i * i * R; }, 0, 40 * T, 8000), want, 1e-9, 'descarga');
      });
    }
  });

  test('rc: q(τ)/Q_f = 1 − 1/e y el 99 % en 5τ', () => {
    for (let t = 0; t < 50; t++) {
      const R = pick(10, 1e6), C = pick(1e-9, 1e-2), eps = pick(0.5, 300), T = O.tau(R, C);
      rel(O.charge(R, C, eps, T).q / (C * eps), 1 - 1 / Math.E, 1e-12);
      rel(O.discharge(R, C, eps, T).q / (C * eps), 1 / Math.E, 1e-12);
      if (!(O.charge(R, C, eps, 5 * T).frac > 0.99)) throw new Error('5τ debe pasar del 99 %');
      // La tangente en t = 0 llega a Q_f justo en τ: Q_f / I₀ = τ.
      rel(O.charge(R, C, eps, 0).Qf / O.charge(R, C, eps, 0).I0, T, 1e-12);
    }
  });

  test('rc: los voltajes suman ε al cargar y son iguales al descargar', () => {
    for (let t = 0; t < 200; t++) {
      const R = pick(10, 1e6), C = pick(1e-9, 1e-2), eps = pick(0.5, 300), tt = pick(0, 8) * R * C;
      const c = O.charge(R, C, eps, tt), d = O.discharge(R, C, eps, tt);
      rel(c.VC + c.VR, eps, 1e-12, 'carga');
      rel(d.VC, d.VR, 1e-12, 'descarga');
      rel(c.Ubat, c.Uc + c.Ur, 1e-12, 'balance de energía');
      if (!(d.i <= 0)) throw new Error('en la descarga la corriente va al revés');
    }
  });

  test('rc: tiempo para un voltaje contra bisección sobre el RK4', () => {
    for (let t = 0; t < 40; t++) {
      const R = pick(1, 100), C = pick(10, 470), eps = pick(2, 24), V = pick(0.05, 0.95) * eps, T = R * C;
      ['c', 'd'].forEach((m) => {
        let lo = 0, hi = 20 * T;
        const up = m === 'c';
        for (let k = 0; k < 60; k++) {
          const mid = (lo + hi) / 2, vc = O.rk4(m, R, C, eps, mid, 2000).VC;
          if ((vc < V) === up) lo = mid; else hi = mid;
        }
        rel(O.timeTo(m, R, C, eps, V), (lo + hi) / 2, 1e-7, `${m} V=${V}`);
        rel(O.state(m, R, C, eps, O.timeTo(m, R, C, eps, V)).VC, V, 1e-10, 'ida y vuelta');
      });
    }
  });

  test('rc: kΩ, μF y ms son un juego coherente con SI', () => {
    for (let t = 0; t < 50; t++) {
      const Rk = pick(1, 100), Cu = pick(10, 470), eps = pick(1, 24), tms = pick(0, 5) * Rk * Cu;
      const a = O.charge(Rk, Cu, eps, tms), b = O.charge(Rk * 1e3, Cu * 1e-6, eps, tms * 1e-3);
      rel(a.tau * 1e-3, b.tau, 1e-12, 'τ en ms');
      rel(a.q * 1e-6, b.q, 1e-12, 'q en μC');
      rel(a.i * 1e-3, b.i, 1e-12, 'i en mA');
      rel(a.Ur * 1e-6, b.Ur, 1e-12, 'energía en μJ');
    }
  });

  test('rc: el diagnóstico reconoce cada error típico', () => {
    const cases = [
      ['tau', 'c', { R: 10, C: 100, eps: 12, t: 500, V: 9 }],
      ['q', 'c', { R: 22, C: 47, eps: 9, t: 800, V: 6 }],
      ['q', 'd', { R: 15, C: 220, eps: 12, t: 2500, V: 6 }],
      ['i', 'c', { R: 4.7, C: 330, eps: 24, t: 900, V: 6 }],
      ['i', 'd', { R: 33, C: 100, eps: 6, t: 4000, V: 3 }],
      ['tV', 'c', { R: 10, C: 100, eps: 12, t: 0, V: 9 }],
      ['tV', 'd', { R: 47, C: 22, eps: 18, t: 0, V: 4.5 }]
    ];
    cases.forEach(([k, m, p]) => {
      const r = O.answers(k, m, p);
      eq(O.diagnose(k, m, p, r.truth), 'ok', `${k} ${m}`);
      eq(O.diagnose(k, m, p, r.truth * 1.004), 'ok', `${k} ${m} redondeado`);
      let seen = 0;
      Object.keys(r).filter((x) => x !== 'truth').forEach((mk) => {
        if (!isFinite(r[mk]) || Math.abs(r[mk] - r.truth) <= 0.02 * Math.abs(r.truth)) return;
        seen++;
        eq(O.diagnose(k, m, p, r[mk]), mk, `${k} ${m} ${mk}`);
      });
      if (seen < 2) throw new Error(`${k} ${m}: muy pocos errores distinguibles`);
      eq(O.diagnose(k, m, p, r.truth * 3.7), 'bad', `${k} ${m} otro`);
      eq(O.diagnose(k, m, p, NaN), 'bad');
    });
    // Los valores reales salen de otra cuenta.
    rel(O.answers('q', 'c', { R: 22, C: 47, eps: 9, t: 800 }).truth, 47 * 9 * (1 - Math.exp(-800 / 1034)), 1e-12);
    rel(O.answers('tV', 'c', { R: 10, C: 100, eps: 12, V: 9 }).truth, 1000 * Math.log(4), 1e-12);
  });

  // Banco de S15: cada pregunta numérica con `alt` se recalcula por otra ruta (LabMath.rc).
  const ROOT = path.join(__dirname, '..', '..');
  const bankFile = path.join(ROOT, 'data/fisica-2/bank/sesion-15.js');
  if (fs.existsSync(bankFile)) {
    test('rc: el banco de S15 coincide con las rutas alternas (alt)', () => {
      const W = loadData([path.join(ROOT, 'shared/js/quiz/bank-kit.js'), bankFile], { LabMath: LM });
      const Q = W.CB_BANK.f2.S15.questions.filter((q) => typeof q.alt === 'function');
      if (Q.length < 30) throw new Error(`solo ${Q.length} preguntas con alt`);
      Q.forEach((q) => {
        let n = 0;
        for (let i = 0; i < 400 && n < 40; i++) {
          const v = {};
          Object.entries(q.vars || {}).forEach(([k, r]) => { const st = r[2] || 1, m = Math.round((r[1] - r[0]) / st); v[k] = +(r[0] + st * Math.floor(rnd() * (m + 1))).toFixed(10); });
          if (q.where && !q.where(v)) continue;
          n++;
          const a = q.answer(v), b = q.alt(v, LM);
          if (!(Math.abs(a - b) <= 1e-6 * Math.max(Math.abs(b), 1e-30))) throw new Error(`${q.id} ${JSON.stringify(v)}: ${a} contra ${b}`);
        }
        if (!n) throw new Error(`${q.id}: ninguna instancia cumple where`);
      });
    });
  }
};
