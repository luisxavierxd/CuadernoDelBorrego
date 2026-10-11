/* =====================================================================
   Problemas de examen · Física 2. Propios y parametrizados.
   part.answer(v, prev): prev son las respuestas DEL ALUMNO en los incisos
   anteriores, para dar crédito por arrastre de error.
   k = 8.99 × 10⁹ N·m²/C², e = 1.60 × 10⁻¹⁹ C, mₑ = 9.11 × 10⁻³¹ kg,
   mₚ = 1.67 × 10⁻²⁷ kg (los mismos valores que las sesiones y los labs).
   ε₀ = 8.85 × 10⁻¹² C²/(N·m²) en el bloque B.
   Bloque A (S01–S05): 8 problemas. Bloque B (S06–S10): 8 problemas.
   Las unidades de cada inciso se eligen para que las respuestas queden,
   casi siempre, entre 0.1 y 10⁴.
   ===================================================================== */
(function () {
  var ex = (window.CB_EXAMS = window.CB_EXAMS || {});
  var k = 8.99e9, e = 1.60e-19, me = 9.11e-31, mp = 1.67e-27, DEG = 180 / Math.PI;
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  // Número en LaTeX: notación científica con 3 cifras si es muy grande o muy chico.
  function sci(v, d) {
    d = d == null ? 2 : d;
    if (v === 0) return '0';
    var p = Math.floor(Math.log10(Math.abs(v)));
    if (p >= -1 && p <= 3) return fx(v, d);
    var m = v / Math.pow(10, p);
    if (Math.abs(+m.toFixed(d)) >= 10) { m /= 10; p += 1; }
    return m.toFixed(d) + ' \\times 10^{' + p + '}';
  }
  function sg(n) { return n > 0 ? '+' + n : '-' + Math.abs(n); }
  function n360(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  var KTXT = '$k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$';
  var ANG = { abs: 0.5 };

  /* ---------- Cálculos de referencia (los usan answer y solution) ---------- */
  // Esferas que se tocan: q en μC, d en cm.
  function esf(v) {
    var Q = (v.q1 + v.q2) / 2, r = v.d / 100;
    return { Q: Q, n: (v.q1 - Q) * 1e-6 / e, F: k * Q * Q * 1e-12 / (r * r), F0: k * Math.abs(v.q1 * v.q2) * 1e-12 / (r * r) };
  }
  // Triángulo: q1 = +a μC en el origen, q2 en (dx, 0) cm, q3 en (0, dy) cm. s2, s3 = 1 si es positiva.
  function tri(v) {
    var F2 = k * v.a * v.b * 1e-12 / Math.pow(v.dx / 100, 2), F3 = k * v.a * v.c * 1e-12 / Math.pow(v.dy / 100, 2);
    var Fx = (v.s2 ? -1 : 1) * F2, Fy = (v.s3 ? -1 : 1) * F3;   // se repelen: hacia −x / −y
    return { F2: F2, F3: F3, Fx: Fx, Fy: Fy, F: Math.hypot(Fx, Fy), ang: n360(Math.atan2(Fy, Fx) * DEG) };
  }
  // Recta: q1 = +a nC en x = 0, q2 = ±b nC en x = d cm, P en x = p cm. E en kN/C, F en μN.
  function lin(v) {
    var E1 = k * v.a * 1e-9 / Math.pow(v.p / 100, 2) / 1e3, E2 = k * v.b * 1e-9 / Math.pow((v.d - v.p) / 100, 2) / 1e3;
    var Ex = E1 + (v.s ? -1 : 1) * E2;
    return { E1: E1, E2: E2, Ex: Ex, F: v.c * Math.abs(Ex) };
  }
  // Placas: E en 10³ N/C, v0 en 10⁶ m/s, L en cm. a en m/s², t en ns, y en mm, energía en eV.
  function plc(v) {
    var a = e * v.E * 1e3 / me, t = (v.L / 100) / (v.v0 * 1e6), y = 0.5 * a * t * t;
    return { a: a, t: t * 1e9, y: y * 1e3, eV: v.E * 1e3 * y };
  }
  // Varilla: Q en nC, L y d en cm. λ en nC/m, E en kN/C, F en μN.
  function rod(v) {
    var lam = v.Q / (v.L / 100), d = v.d / 100, L = v.L / 100;
    var E = k * lam * 1e-9 * (1 / d - 1 / (d + L)) / 1e3, Ec = k * v.Q * 1e-9 / Math.pow(d + L / 2, 2) / 1e3;
    return { lam: lam, E: E, F: v.c * E, Ec: Ec, ratio: E / Ec };
  }
  // Anillo: Q en nC, R y z en cm, cuenta de c nC y m mg. r en cm, E en kN/C, F en μN, a en m/s².
  function rng(v) {
    var r = Math.hypot(v.R, v.z), E = k * v.Q * 1e-9 * (v.z / 100) / Math.pow(r / 100, 3) / 1e3;
    return { r: r, E: E, F: v.c * E, a: v.c * E / v.m };
  }
  // Potencial de Q = +a nC; q = ±b nC va de rA a rB (cm). F en μN, E en kN/C, V en kV, W en μJ.
  function pot(v) {
    var q = (v.s ? 1 : -1) * v.b, E = k * v.a * 1e-9 / Math.pow(v.rA / 100, 2) / 1e3;
    var VA = k * v.a * 1e-9 / (v.rA / 100) / 1e3, VB = k * v.a * 1e-9 / (v.rB / 100) / 1e3;
    return { q: q, F: v.b * E, E: E, VA: VA, VB: VB, W: q * (VA - VB) };
  }
  // Protón que se suelta: Q en nC, rA y rB en cm. V en kV, ΔK en keV y J, v en m/s.
  function prt(v) {
    var VA = k * v.Q * 1e-9 / (v.rA / 100) / 1e3, VB = k * v.Q * 1e-9 / (v.rB / 100) / 1e3, keV = VA - VB, J = keV * 1e3 * e;
    return { VA: VA, VB: VB, keV: keV, J: J, v: Math.sqrt(2 * J / mp) };
  }

  /* ---------- Bloque B ---------- */
  var EPS0 = 8.85e-12, PI = Math.PI;
  var E0TXT = '$\\varepsilon_0 = 8.85 \\times 10^{-12}\\ \\text{C}^2/(\\text{N·m}^2)$';
  // Disco: Q en nC, R y z en cm, carga c nC. σ en μC/m², V en kV, E en kN/C, U en μJ.
  function dsk(v) {
    var R = v.R / 100, z = v.z / 100, sig = v.Q * 1e-9 / (PI * R * R), s = Math.hypot(R, z);
    var V = 2 * PI * k * sig * (s - z) / 1e3, E = 2 * PI * k * sig * (1 - z / s) / 1e3;
    return { sig: sig * 1e6, s: s, V: V, E: E, U: v.c * V };
  }
  // V(x, y) = A x² y + B y (V, m). E en V/m, F sobre q μC en μN.
  function grd(v) {
    var Ex = -2 * v.A * v.x * v.y, Ey = -(v.A * v.x * v.x + v.B), E = Math.hypot(Ex, Ey);
    return { V: v.A * v.x * v.x * v.y + v.B * v.y, Ex: Ex, Ey: Ey, E: E, F: v.q * E };
  }
  // Cubo en E = c x î: c en kN/(C·m), a y x0 en cm. Φ en N·m²/C, q en pC.
  function cub(v) {
    var a = v.a / 100, x0 = v.x0 / 100, c = v.c * 1e3, R = c * (x0 + a) * a * a, L = -c * x0 * a * a;
    return { R: R, L: L, net: R + L, q: EPS0 * (R + L) * 1e12 };
  }
  // Prisma: E en N/C a al° sobre +x (plano xz); b, h, w en cm. A en cm², θ en °, Φ en N·m²/C.
  function psm(v) {
    var A = v.w * Math.hypot(v.b, v.h), th = Math.abs(Math.atan2(v.b, v.h) * DEG - v.al);
    return { A: A, nAng: Math.atan2(v.b, v.h) * DEG, th: th, inc: v.E * A * 1e-4 * Math.cos(th / DEG),
      base: -v.E * Math.sin(v.al / DEG) * v.b * v.w * 1e-4, wall: -v.E * Math.cos(v.al / DEG) * v.h * v.w * 1e-4 };
  }
  // Esfera aislante: Q en nC, R y r en cm. q en nC, Φ en N·m²/C, E en kN/C, V en kV.
  function sph(v) {
    var q = v.Q * Math.pow(v.r / v.R, 3), F = q * 1e-9 / EPS0, E = F / (4 * PI * Math.pow(v.r / 100, 2)) / 1e3, ER = E * v.R / v.r;
    return { q: q, F: F, E: E, ER: ER, V: ER * v.R / 100 };
  }
  // Placas: A en cm², d en mm, V en volts. C en pF, Q en nC, E en kN/C, U en nJ.
  function cpl(v) {
    var C = EPS0 * v.A * 1e-4 / (v.d * 1e-3) * 1e12, Q = C * v.V * 1e-3;
    return { C: C, Q: Q, E: Q * 1e-9 / (EPS0 * v.A * 1e-4) / 1e3, U: 0.5 * Q * v.V, Qk: v.kap * Q };
  }
  // Coaxial: a, b, r en mm; L en m; V en volts. C/L en pF/m, C en nF, Q en nC, E en kN/C.
  function cox(v) {
    var cl = 2 * PI * EPS0 / Math.log(v.b / v.a) * 1e12, C = cl * v.L * 1e-3, Q = C * v.V;
    return { cl: cl, C: C, Q: Q, lam: Q / v.L, E: Q * 1e-9 / v.L / (2 * PI * EPS0 * v.r * 1e-3) / 1e3 };
  }
  // Red: C1 en serie con (C2 ∥ C3); C en μF, V en volts. Q en μC, U en μJ.
  function cnet(v) {
    var Cp = v.C2 + v.C3, Ce = v.C1 * Cp / (v.C1 + Cp), Q = Ce * v.V, V2 = Q / Cp;
    return { Cp: Cp, Ce: Ce, Q: Q, V1: Q / v.C1, V2: V2, U2: 0.5 * v.C2 * V2 * V2 };
  }

  ex.f2 = (ex.f2 || []).concat([
    /* ---------------- S01 + S02 · Contacto y Coulomb ---------------- */
    {
      id: 'f2-ex-esferas', tags: ['f2.S01', 'f2.S02'], block: 'A', title: 'Dos esferas que se tocan',
      vars: { q1: [2, 9, 1], q2: [-8, -1, 1], d: [5, 30, 5] },
      where: function (v) { var s = esf(v); return v.q1 + v.q2 >= 1 && s.F >= 0.2 && s.F / s.F0 >= 0.1; },
      statement: function (v) {
        return '<p>Dos esferas metálicas idénticas tienen cargas $q_1 = +' + v.q1 + '\\ \\mu\\text{C}$ y $q_2 = ' + sg(v.q2) + '\\ \\mu\\text{C}$. Se tocan, se reparten la carga y luego se separan hasta que sus centros quedan a $' + v.d + '$ cm. Trátalas como cargas puntuales. Usa ' + KTXT + ' y $e = 1.60 \\times 10^{-19}$ C.</p>';
      },
      diagram: { id: 'f2exam-esferas', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'μC',
          prompt: function () { return '¿Con cuánta carga queda cada esfera después de tocarse?'; },
          answer: function (v) { return (v.q1 + v.q2) / 2; },
          solution: function (v) { return 'Son idénticas, así que se reparten la carga total a partes iguales: $Q = \\dfrac{q_1 + q_2}{2} = \\dfrac{(' + v.q1 + ') + (' + v.q2 + ')}{2} = ' + fx(esf(v).Q) + '\\ \\mu\\text{C}$.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'electrones',
          prompt: function () { return 'Con tu carga de a), ¿cuántos electrones pasaron de la esfera 2 a la esfera 1?'; },
          answer: function (v, prev) { return (v.q1 - prev[0]) * 1e-6 / e; },
          solution: function (v) {
            var s = esf(v);
            return 'La esfera 1 baja de $+' + v.q1 + '$ a $+' + fx(s.Q) + '\\ \\mu\\text{C}$: le llegaron $' + fx(v.q1 - s.Q) + '\\ \\mu\\text{C}$ de electrones. $$n = \\frac{' + fx(v.q1 - s.Q) + ' \\times 10^{-6}\\ \\text{C}}{1.60 \\times 10^{-19}\\ \\text{C}} = ' + sci(s.n) + '$$';
          } },
        { label: 'c', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return 'Con tu carga de a), ¿qué magnitud tiene la fuerza entre las esferas ya separadas?'; },
          answer: function (v, prev) { return k * prev[0] * prev[0] * 1e-12 / Math.pow(v.d / 100, 2); },
          solution: function (v) { var s = esf(v); return 'Las dos tienen la misma carga, así que se repelen: $$F = \\frac{kQ^2}{r^2} = \\frac{(8.99 \\times 10^9)(' + fx(s.Q) + ' \\times 10^{-6})^2}{(' + fx(v.d / 100) + ')^2} = ' + sci(s.F) + '\\ \\text{N}$$'; } },
        { label: 'd', type: 'numeric', points: 3,
          prompt: function () { return 'Con tu fuerza de c), ¿cuántas veces es la fuerza que había entre ellas antes de tocarse, a la misma distancia? (Da $F_{\\text{después}}/F_{\\text{antes}}$.)'; },
          answer: function (v, prev) { return prev[2] / esf(v).F0; },
          solution: function (v) {
            var s = esf(v);
            return 'Antes: $F_0 = \\dfrac{k|q_1 q_2|}{r^2} = \\dfrac{(8.99 \\times 10^9)(' + v.q1 + ' \\times 10^{-6})(' + Math.abs(v.q2) + ' \\times 10^{-6})}{(' + fx(v.d / 100) + ')^2} = ' + sci(s.F0) + '$ N (se atraían). $$\\frac{F}{F_0} = \\frac{' + sci(s.F) + '}{' + sci(s.F0) + '} = ' + fx(s.F / s.F0, 3) + '$$';
          } }
      ]
    },

    /* ---------------- S02 · Superposición en un triángulo ---------------- */
    {
      id: 'f2-ex-triangulo', tags: ['f2.S02'], block: 'A', title: 'Fuerza neta en una esquina',
      vars: { a: [1, 6, 1], b: [1, 9, 1], c: [1, 9, 1], s2: [0, 1, 1], s3: [0, 1, 1], dx: [3, 10, 1], dy: [3, 10, 1] },
      where: function (v) { var t = tri(v), r = t.F2 / t.F3; return r >= 0.2 && r <= 5 && v.dx / v.dy >= 0.5 && v.dx / v.dy <= 2; },
      statement: function (v) {
        return '<p>La carga $q_1 = +' + v.a + '\\ \\mu\\text{C}$ está en el origen, $q_2 = ' + sg((v.s2 ? 1 : -1) * v.b) + '\\ \\mu\\text{C}$ en $(' + v.dx + ', 0)$ cm y $q_3 = ' + sg((v.s3 ? 1 : -1) * v.c) + '\\ \\mu\\text{C}$ en $(0, ' + v.dy + ')$ cm. Usa ' + KTXT + '.</p>';
      },
      diagram: { id: 'f2exam-triangulo', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return '¿Qué magnitud tiene la fuerza que $q_2$ ejerce sobre $q_1$?'; },
          answer: function (v) { return tri(v).F2; },
          solution: function (v) { return '$$F_2 = \\frac{k|q_1q_2|}{r^2} = \\frac{(8.99 \\times 10^9)(' + v.a + ' \\times 10^{-6})(' + v.b + ' \\times 10^{-6})}{(' + fx(v.dx / 100) + ')^2} = ' + sci(tri(v).F2) + '\\ \\text{N}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'N',
          prompt: function () { return '¿Qué magnitud tiene la fuerza que $q_3$ ejerce sobre $q_1$?'; },
          answer: function (v) { return tri(v).F3; },
          solution: function (v) { return '$$F_3 = \\frac{(8.99 \\times 10^9)(' + v.a + ' \\times 10^{-6})(' + v.c + ' \\times 10^{-6})}{(' + fx(v.dy / 100) + ')^2} = ' + sci(tri(v).F3) + '\\ \\text{N}$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'N',
          prompt: function () { return 'Con tus fuerzas de a) y b), ¿qué magnitud tiene la fuerza neta sobre $q_1$?'; },
          answer: function (v, prev) { return Math.hypot(prev[0], prev[1]); },
          solution: function (v) { var t = tri(v); return '$\\vec F_2$ va sobre el eje $x$ y $\\vec F_3$ sobre el eje $y$: son perpendiculares. $$|\\vec F| = \\sqrt{F_2^2 + F_3^2} = \\sqrt{' + sci(t.F2) + '^2 + ' + sci(t.F3) + '^2} = ' + sci(t.F) + '\\ \\text{N}$$'; } },
        { label: 'd', type: 'numeric', points: 3, unit: '°', tol: ANG,
          prompt: function () { return 'Con tus fuerzas de a) y b), ¿hacia qué ángulo apunta la fuerza neta sobre $q_1$? (Desde $+x$, antihorario, entre $0^\\circ$ y $360^\\circ$.)'; },
          answer: function (v, prev) { return n360(Math.atan2((v.s3 ? -1 : 1) * prev[1], (v.s2 ? -1 : 1) * prev[0]) * DEG); },
          solution: function (v) {
            var t = tri(v);
            return '$q_2$ ' + (v.s2 ? 'repele a $q_1$ hacia $-x$' : 'atrae a $q_1$ hacia $+x$') + ' y $q_3$ ' + (v.s3 ? 'la repele hacia $-y$' : 'la atrae hacia $+y$') + ': $F_x = ' + sci(t.Fx) + '$ N y $F_y = ' + sci(t.Fy) + '$ N. Con el cuadrante corregido, $\\theta = ' + fx(t.ang, 1) + '^\\circ$.';
          } }
      ]
    },

    /* ---------------- S03 + S02 · Campo en un punto de la recta ---------------- */
    {
      id: 'f2-ex-campo-recta', tags: ['f2.S03', 'f2.S02'], block: 'A', title: 'Campo entre dos cargas',
      vars: { a: [1, 9, 1], b: [1, 9, 1], s: [0, 1, 1], d: [6, 14, 2], p: [2, 12, 1], c: [1, 5, 1] },
      where: function (v) { var l = lin(v); return v.p <= v.d - 2 && Math.abs(l.Ex) >= 0.2 * (l.E1 + l.E2) && l.E1 >= 0.1 * l.E2 && l.E2 >= 0.1 * l.E1; },
      statement: function (v) {
        return '<p>Una carga $q_1 = +' + v.a + '\\ \\text{nC}$ está en $x = 0$ y otra $q_2 = ' + sg((v.s ? 1 : -1) * v.b) + '\\ \\text{nC}$ en $x = ' + v.d + '$ cm. El punto P está entre ellas, en $x = ' + v.p + '$ cm. Usa ' + KTXT + '.</p>';
      },
      diagram: { id: 'f2exam-recta', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'kN/C',
          prompt: function () { return '¿Qué magnitud tiene en P el campo de $q_1$? Da el resultado en kN/C.'; },
          answer: function (v) { return lin(v).E1; },
          solution: function (v) { return '$$E_1 = \\frac{kq_1}{r_1^2} = \\frac{(8.99 \\times 10^9)(' + v.a + ' \\times 10^{-9})}{(' + fx(v.p / 100) + ')^2} = ' + sci(lin(v).E1 * 1e3) + '\\ \\text{N/C} = ' + fx(lin(v).E1) + '\\ \\text{kN/C}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'kN/C',
          prompt: function () { return '¿Qué magnitud tiene en P el campo de $q_2$? En kN/C.'; },
          answer: function (v) { return lin(v).E2; },
          solution: function (v) { return 'P está a $' + (v.d - v.p) + '$ cm de $q_2$: $$E_2 = \\frac{(8.99 \\times 10^9)(' + v.b + ' \\times 10^{-9})}{(' + fx((v.d - v.p) / 100) + ')^2} = ' + fx(lin(v).E2) + '\\ \\text{kN/C}$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'kN/C',
          prompt: function () { return 'Con tus resultados de a) y b), ¿cuánto vale el campo neto $E_x$ en P? (Positivo si apunta a la derecha, hacia $+x$.)'; },
          answer: function (v, prev) { return prev[0] + (v.s ? -1 : 1) * prev[1]; },
          solution: function (v) {
            var l = lin(v);
            return '$\\vec E_1$ se aleja de $q_1$ (positiva): apunta a $+x$. $\\vec E_2$ ' + (v.s ? 'se aleja de $q_2$ (positiva): apunta a $-x$' : 'apunta hacia $q_2$ (negativa): también a $+x$') + '. $$E_x = ' + fx(l.E1) + (v.s ? ' - ' : ' + ') + fx(l.E2) + ' = ' + fx(l.Ex) + '\\ \\text{kN/C}$$';
          } },
        { label: 'd', type: 'numeric', points: 3, unit: 'μN',
          prompt: function (v) { return 'Con tu campo de c), ¿qué magnitud tiene la fuerza sobre una carga de $-' + v.c + '\\ \\text{nC}$ colocada en P? Da el resultado en μN.'; },
          answer: function (v, prev) { return v.c * Math.abs(prev[2]); },
          solution: function (v) { var l = lin(v); return '$$F = |q|E = (' + v.c + ' \\times 10^{-9})(' + fx(Math.abs(l.Ex)) + ' \\times 10^{3}) = ' + sci(l.F * 1e-6) + '\\ \\text{N} = ' + fx(l.F) + '\\ \\mu\\text{N}$$ Por ser negativa, la fuerza apunta al revés que $\\vec E$.'; } }
      ]
    },

    /* ---------------- S03 + S05 · Electrón entre placas ---------------- */
    {
      id: 'f2-ex-placas', tags: ['f2.S03', 'f2.S05'], block: 'A', title: 'El electrón entre placas',
      vars: { E: [0.5, 3, 0.5], v0: [2, 6, 0.5], L: [2, 6, 1] },
      where: function (v) { var y = plc(v).y; return y >= 1 && y <= 8; },
      statement: function (v) {
        return '<p>Un electrón entra horizontalmente, a la mitad de la separación, entre dos placas paralelas de $' + v.L + '$ cm de largo separadas $2$ cm, con $v_0 = ' + v.v0 + ' \\times 10^6$ m/s. Entre las placas hay un campo uniforme de $' + v.E + ' \\times 10^3$ N/C, vertical. Usa $e = 1.60 \\times 10^{-19}$ C y $m_e = 9.11 \\times 10^{-31}$ kg; ignora la gravedad.</p>';
      },
      diagram: { id: 'f2exam-placas', state: function (v) { return { L: v.L, y: plc(v).y }; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'm/s²',
          prompt: function () { return '¿Qué magnitud tiene la aceleración del electrón entre las placas?'; },
          answer: function (v) { return plc(v).a; },
          solution: function (v) { return '$$a = \\frac{eE}{m_e} = \\frac{(1.60 \\times 10^{-19})(' + v.E + ' \\times 10^3)}{9.11 \\times 10^{-31}} = ' + sci(plc(v).a) + '\\ \\text{m/s}^2$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'ns',
          prompt: function () { return '¿Cuánto tiempo pasa entre las placas? Da el resultado en nanosegundos.'; },
          answer: function (v) { return plc(v).t; },
          solution: function (v) { return 'En $x$ no hay fuerza: $$t = \\frac{L}{v_0} = \\frac{' + fx(v.L / 100) + '}{' + v.v0 + ' \\times 10^6} = ' + sci(plc(v).t * 1e-9) + '\\ \\text{s} = ' + fx(plc(v).t) + '\\ \\text{ns}$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'mm',
          prompt: function () { return 'Con tus resultados de a) y b), ¿cuántos milímetros se desvía al salir de las placas?'; },
          answer: function (v, prev) { var t = prev[1] * 1e-9; return 0.5 * prev[0] * t * t * 1e3; },
          solution: function (v) { var p = plc(v); return 'Parte sin velocidad vertical: $$y = \\tfrac{1}{2}at^2 = \\tfrac{1}{2}(' + sci(p.a) + ')(' + sci(p.t * 1e-9) + ')^2 = ' + sci(p.y * 1e-3) + '\\ \\text{m} = ' + fx(p.y) + '\\ \\text{mm}$$'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'eV',
          prompt: function () { return 'Con tu desviación de c), ¿cuánta energía cinética ganó el electrón dentro de las placas? Da el resultado en electronvolts.'; },
          answer: function (v, prev) { return v.E * 1e3 * prev[2] * 1e-3; },
          solution: function (v) { var p = plc(v); return 'El campo hace trabajo $W = eEy$, y ese trabajo es la energía que gana. En eV basta con $E\\,y$ en volts: $$\\Delta K = eEy = e\\,(' + v.E + ' \\times 10^3)(' + sci(p.y * 1e-3) + ') = ' + fx(p.eV) + '\\ \\text{eV}$$ Atraviesa una diferencia de potencial $\\Delta V = Ey$ hacia la placa positiva.'; } }
      ]
    },

    /* ---------------- S04 + S02 · Varilla cargada ---------------- */
    {
      id: 'f2-ex-varilla', tags: ['f2.S04', 'f2.S02'], block: 'A', title: 'La varilla y la carga de prueba',
      vars: { Q: [2, 20, 2], L: [4, 20, 2], d: [2, 10, 1], c: [1, 5, 1] },
      statement: function (v) {
        return '<p>Una varilla delgada de $' + v.L + '$ cm tiene una carga de $+' + v.Q + '\\ \\text{nC}$ repartida uniformemente. El punto P está sobre la línea de la varilla, a $' + v.d + '$ cm de su extremo. Usa ' + KTXT + '.</p>';
      },
      diagram: { id: 'f2exam-varilla', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'nC/m',
          prompt: function () { return '¿Cuánto vale la densidad lineal de carga $\\lambda$? En nC/m.'; },
          answer: function (v) { return rod(v).lam; },
          solution: function (v) { return '$\\lambda = Q/L = ' + v.Q + '\\ \\text{nC} / ' + fx(v.L / 100) + '\\ \\text{m} = ' + fx(rod(v).lam) + '\\ \\text{nC/m}$.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'kN/C',
          prompt: function () { return 'Con tu $\\lambda$ de a), ¿qué magnitud tiene el campo en P? En kN/C.'; },
          answer: function (v, prev) { var d = v.d / 100, L = v.L / 100; return k * prev[0] * 1e-9 * (1 / d - 1 / (d + L)) / 1e3; },
          solution: function (v) {
            var r = rod(v), d = v.d / 100, L = v.L / 100;
            return 'Cada trozo $dq = \\lambda\\,dx$ está a su propia distancia de P; al integrar: $$E = k\\lambda\\left(\\frac{1}{d} - \\frac{1}{d + L}\\right) = (8.99 \\times 10^9)(' + fx(r.lam) + ' \\times 10^{-9})\\left(\\frac{1}{' + fx(d) + '} - \\frac{1}{' + fx(d + L) + '}\\right) = ' + fx(r.E) + '\\ \\text{kN/C}$$';
          } },
        { label: 'c', type: 'numeric', points: 2, unit: 'μN',
          prompt: function (v) { return 'Con tu campo de b), ¿qué fuerza siente una carga de $+' + v.c + '\\ \\text{nC}$ colocada en P? En μN.'; },
          answer: function (v, prev) { return v.c * prev[1]; },
          solution: function (v) { var r = rod(v); return '$$F = qE = (' + v.c + ' \\times 10^{-9})(' + fx(r.E) + ' \\times 10^3) = ' + fx(r.F) + '\\ \\mu\\text{N}$$ alejándose de la varilla.'; } },
        { label: 'd', type: 'numeric', points: 3,
          prompt: function () { return 'Con tu campo de b), ¿cuántas veces es el campo que darías si pusieras toda la carga en el centro de la varilla? (Da $E/E_{\\text{centro}}$.)'; },
          answer: function (v, prev) { return prev[1] / rod(v).Ec; },
          solution: function (v) {
            var r = rod(v);
            return 'Con toda la carga en el centro, a $' + fx(v.d + v.L / 2, 1) + '$ cm de P: $E_{\\text{centro}} = \\dfrac{kQ}{(d + L/2)^2} = ' + fx(r.Ec) + '$ kN/C. $$\\frac{E}{E_{\\text{centro}}} = \\frac{' + fx(r.E) + '}{' + fx(r.Ec) + '} = ' + fx(r.ratio, 3) + '$$ Es mayor que 1: los trozos cercanos pesan más que los lejanos porque el campo va con $1/r^2$.';
          } }
      ]
    },

    /* ---------------- S04 + S03 · Anillo: campo, fuerza y aceleración ---------------- */
    {
      id: 'f2-ex-anillo', tags: ['f2.S04', 'f2.S03'], block: 'A', title: 'La cuenta en el eje del anillo',
      vars: { Q: [5, 50, 5], R: [2, 10, 1], z: [2, 15, 1], c: [1, 9, 1], m: [10, 90, 10] },
      where: function (v) { var t = rng(v); return v.z / v.R >= 0.4 && v.z / v.R <= 3 && t.a >= 0.2; },
      statement: function (v) {
        return '<p>Un anillo de radio $' + v.R + '$ cm tiene una carga de $+' + v.Q + '\\ \\text{nC}$ repartida uniformemente. Por su eje pasa una varilla horizontal sin fricción, y en ella hay una cuenta de $' + v.m + '$ mg con carga $+' + v.c + '\\ \\text{nC}$, a $' + v.z + '$ cm del centro del anillo. Usa ' + KTXT + '.</p>';
      },
      diagram: { id: 'f2exam-anillo', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'cm',
          prompt: function () { return '¿A qué distancia de la cuenta está cada trozo $dq$ del anillo?'; },
          answer: function (v) { return rng(v).r; },
          solution: function (v) { return 'Todos los trozos están a la misma distancia: $r = \\sqrt{R^2 + z^2} = \\sqrt{' + v.R + '^2 + ' + v.z + '^2} = ' + fx(rng(v).r, 3) + '$ cm.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'kN/C',
          prompt: function () { return 'Con tu distancia de a), ¿qué magnitud tiene el campo del anillo donde está la cuenta? En kN/C.'; },
          answer: function (v, prev) { return k * v.Q * 1e-9 * (v.z / 100) / Math.pow(prev[0] / 100, 3) / 1e3; },
          solution: function (v) {
            var t = rng(v);
            return 'Las componentes perpendiculares al eje se cancelan; queda la suma de $dE\\cos\\theta$ con $\\cos\\theta = z/r$: $$E = \\frac{kQz}{r^3} = \\frac{(8.99 \\times 10^9)(' + v.Q + ' \\times 10^{-9})(' + fx(v.z / 100) + ')}{(' + fx(t.r / 100, 4) + ')^3} = ' + fx(t.E) + '\\ \\text{kN/C}$$';
          } },
        { label: 'c', type: 'numeric', points: 2, unit: 'μN',
          prompt: function () { return 'Con tu campo de b), ¿qué fuerza eléctrica siente la cuenta? En μN.'; },
          answer: function (v, prev) { return v.c * prev[1]; },
          solution: function (v) { var t = rng(v); return '$$F = qE = (' + v.c + ' \\times 10^{-9})(' + fx(t.E) + ' \\times 10^3) = ' + fx(t.F) + '\\ \\mu\\text{N}$$ a lo largo del eje, alejándose del anillo.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'm/s²',
          prompt: function () { return 'Con tu fuerza de c), ¿qué aceleración tiene la cuenta en ese instante?'; },
          answer: function (v, prev) { return prev[2] / v.m; },
          solution: function (v) { var t = rng(v); return 'El peso lo equilibra la varilla; la fuerza eléctrica es la neta: $$a = \\frac{F}{m} = \\frac{' + fx(t.F) + ' \\times 10^{-6}\\ \\text{N}}{' + v.m + ' \\times 10^{-6}\\ \\text{kg}} = ' + fx(t.a) + '\\ \\text{m/s}^2$$'; } }
      ]
    },

    /* ---------------- S05 + S03 + S02 · De la fuerza al trabajo ---------------- */
    {
      id: 'f2-ex-trabajo', tags: ['f2.S05', 'f2.S03', 'f2.S02'], block: 'A', title: 'De la fuerza al trabajo',
      vars: { a: [10, 90, 10], b: [1, 9, 1], s: [0, 1, 1], rA: [2, 10, 1], rB: [3, 15, 1] },
      where: function (v) { return Math.abs(v.rA - v.rB) >= 2; },
      statement: function (v) {
        return '<p>Una carga $Q = +' + v.a + '\\ \\text{nC}$ está fija en el origen. Una carga $q = ' + sg((v.s ? 1 : -1) * v.b) + '\\ \\text{nC}$ se mueve sobre el eje $x$ del punto A, a $' + v.rA + '$ cm de $Q$, al punto B, a $' + v.rB + '$ cm. Usa ' + KTXT + '.</p>';
      },
      diagram: { id: 'f2exam-trabajo', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'μN',
          prompt: function () { return '¿Qué magnitud tiene la fuerza sobre $q$ cuando está en A? En μN.'; },
          answer: function (v) { return pot(v).F; },
          solution: function (v) { return '$$F = \\frac{k|Qq|}{r_A^2} = \\frac{(8.99 \\times 10^9)(' + v.a + ' \\times 10^{-9})(' + v.b + ' \\times 10^{-9})}{(' + fx(v.rA / 100) + ')^2} = ' + sci(pot(v).F * 1e-6) + '\\ \\text{N} = ' + fx(pot(v).F) + '\\ \\mu\\text{N}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'kN/C',
          prompt: function () { return 'Con tu fuerza de a), ¿qué magnitud tiene el campo de $Q$ en A? En kN/C.'; },
          answer: function (v, prev) { return prev[0] / v.b; },
          solution: function (v) { return '$$E = \\frac{F}{|q|} = \\frac{' + fx(pot(v).F) + ' \\times 10^{-6}\\ \\text{N}}{' + v.b + ' \\times 10^{-9}\\ \\text{C}} = ' + fx(pot(v).E) + '\\ \\text{kN/C}$$'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'kV',
          prompt: function () { return 'Con tu campo de b), ¿cuánto vale el potencial en A? En kV. (Para una carga puntual, $V = kQ/r = E\\,r$.)'; },
          answer: function (v, prev) { return prev[1] * v.rA / 100; },
          solution: function (v) { return '$$V_A = \\frac{kQ}{r_A} = E\\,r_A = (' + fx(pot(v).E) + '\\ \\text{kN/C})(' + fx(v.rA / 100) + '\\ \\text{m}) = ' + fx(pot(v).VA) + '\\ \\text{kV}$$'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'kV',
          prompt: function () { return 'Con tu potencial de c), ¿cuánto vale el potencial en B? En kV.'; },
          answer: function (v, prev) { return prev[2] * v.rA / v.rB; },
          solution: function (v) { return 'El potencial va con $1/r$: $$V_B = V_A\\,\\frac{r_A}{r_B} = ' + fx(pot(v).VA) + '\\cdot\\frac{' + v.rA + '}{' + v.rB + '} = ' + fx(pot(v).VB) + '\\ \\text{kV}$$'; } },
        { label: 'e', type: 'numeric', points: 3, unit: 'μJ',
          prompt: function () { return 'Con tus potenciales de c) y d), ¿cuánto trabajo hace el campo de $Q$ sobre $q$ de A a B? En μJ, con su signo.'; },
          answer: function (v, prev) { return (v.s ? 1 : -1) * v.b * (prev[2] - prev[3]); },
          solution: function (v) {
            var p = pot(v);
            return '$$W = -q\\,(V_B - V_A) = -(' + p.q + '\\ \\text{nC})(' + fx(p.VB) + ' - ' + fx(p.VA) + ')\\ \\text{kV} = ' + fx(p.W) + '\\ \\mu\\text{J}$$ (nC por kV da μJ). ' + (p.W > 0 ? 'Es positivo: el campo ayuda al movimiento.' : 'Es negativo: hay que empujar a $q$ contra el campo.');
          } }
      ]
    },

    /* ---------------- S05 · Protón que se suelta ---------------- */
    {
      id: 'f2-ex-proton', tags: ['f2.S05'], block: 'A', title: 'El protón que sale disparado',
      vars: { Q: [5, 50, 5], rA: [1, 5, 0.5], rB: [6, 20, 2] },
      statement: function (v) {
        return '<p>Una carga $Q = +' + v.Q + '\\ \\text{nC}$ está fija. Un protón se suelta desde el reposo en el punto A, a $' + v.rA + '$ cm de $Q$, y la repulsión lo aleja hasta el punto B, a $' + v.rB + '$ cm. Usa ' + KTXT + ', $e = 1.60 \\times 10^{-19}$ C y $m_p = 1.67 \\times 10^{-27}$ kg.</p>';
      },
      diagram: { id: 'f2exam-proton', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'kV',
          prompt: function () { return '¿Cuánto vale el potencial de $Q$ en A? En kV.'; },
          answer: function (v) { return prt(v).VA; },
          solution: function (v) { return '$$V_A = \\frac{kQ}{r_A} = \\frac{(8.99 \\times 10^9)(' + v.Q + ' \\times 10^{-9})}{' + fx(v.rA / 100, 3) + '} = ' + fx(prt(v).VA) + '\\ \\text{kV}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'kV',
          prompt: function () { return '¿Cuánto vale el potencial de $Q$ en B? En kV.'; },
          answer: function (v) { return prt(v).VB; },
          solution: function (v) { return '$$V_B = \\frac{(8.99 \\times 10^9)(' + v.Q + ' \\times 10^{-9})}{' + fx(v.rB / 100) + '} = ' + fx(prt(v).VB) + '\\ \\text{kV}$$'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'keV',
          prompt: function () { return 'Con tus potenciales de a) y b), ¿cuánta energía cinética gana el protón de A a B? En keV.'; },
          answer: function (v, prev) { return prev[0] - prev[1]; },
          solution: function (v) { var p = prt(v); return 'La energía se conserva: $\\Delta K = -q\\Delta V = e\\,(V_A - V_B)$. Con $q = e$, cada kV de bajada da 1 keV: $$\\Delta K = ' + fx(p.VA) + ' - ' + fx(p.VB) + ' = ' + fx(p.keV) + '\\ \\text{keV}$$'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'J',
          prompt: function () { return 'Con tu energía de c), ¿cuánto es en joules?'; },
          answer: function (v, prev) { return prev[2] * 1e3 * e; },
          solution: function (v) { var p = prt(v); return '$1\\ \\text{eV} = 1.60 \\times 10^{-19}$ J: $$\\Delta K = (' + fx(p.keV) + ' \\times 10^3)(1.60 \\times 10^{-19}) = ' + sci(p.J) + '\\ \\text{J}$$'; } },
        { label: 'e', type: 'numeric', points: 3, unit: 'm/s',
          prompt: function () { return 'Con tu energía de d), ¿con qué rapidez pasa el protón por B?'; },
          answer: function (v, prev) { return Math.sqrt(2 * prev[3] / mp); },
          solution: function (v) { var p = prt(v); return 'Partió del reposo, así que $\\tfrac{1}{2}m_pv^2 = \\Delta K$: $$v = \\sqrt{\\frac{2\\Delta K}{m_p}} = \\sqrt{\\frac{2(' + sci(p.J) + ')}{1.67 \\times 10^{-27}}} = ' + sci(p.v) + '\\ \\text{m/s}$$'; } }
      ]
    },

    /* ================= Bloque B (S06–S10) ================= */

    /* ---------------- S06 + S05 · Disco: V en el eje y E = −dV/dz ---------------- */
    {
      id: 'f2-ex-disco', tags: ['f2.S06', 'f2.S05'], block: 'B', title: 'El disco cargado: de V a E',
      vars: { Q: [5, 50, 5], R: [2, 10, 1], z: [1, 15, 1], c: [1, 9, 1] },
      where: function (v) { return v.z / v.R >= 0.3 && v.z / v.R <= 3; },
      statement: function (v) {
        return '<p>Un disco delgado de radio $' + v.R + '$ cm tiene una carga de $+' + v.Q + '\\ \\text{nC}$ repartida uniformemente en su superficie. El punto P está sobre su eje, a $z = ' + v.z + '$ cm del centro. Toma $V = 0$ en el infinito y usa ' + KTXT + '.</p>';
      },
      diagram: { id: 'f2exam-disco', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'μC/m²',
          prompt: function () { return '¿Cuánto vale la densidad superficial de carga $\\sigma$ del disco? En μC/m².'; },
          answer: function (v) { return dsk(v).sig; },
          solution: function (v) { return '$$\\sigma = \\frac{Q}{\\pi R^2} = \\frac{' + v.Q + ' \\times 10^{-9}\\ \\text{C}}{\\pi(' + fx(v.R / 100) + '\\ \\text{m})^2} = ' + sci(dsk(v).sig * 1e-6) + '\\ \\text{C/m}^2 = ' + fx(dsk(v).sig) + '\\ \\mu\\text{C/m}^2$$'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'kV',
          prompt: function () { return 'Con tu $\\sigma$ de a), ¿cuánto vale el potencial en P? En kV.'; },
          answer: function (v, prev) { var R = v.R / 100, z = v.z / 100; return 2 * PI * k * prev[0] * 1e-6 * (Math.hypot(R, z) - z) / 1e3; },
          solution: function (v) {
            var d = dsk(v);
            return 'Partes el disco en anillos de radio $r$ y ancho $dr$, con $dq = \\sigma\\,2\\pi r\\,dr$; cada uno aporta $k\\,dq/\\sqrt{z^2 + r^2}$. Al integrar de $0$ a $R$: $$V = 2\\pi k\\sigma\\left(\\sqrt{z^2 + R^2} - z\\right) = 2\\pi(8.99 \\times 10^9)(' + sci(d.sig * 1e-6) + ')(' + fx(d.s, 4) + ' - ' + fx(v.z / 100) + ') = ' + fx(d.V) + '\\ \\text{kV}$$';
          } },
        { label: 'c', type: 'numeric', points: 3, unit: 'kN/C',
          prompt: function () { return 'Con tu $\\sigma$ de a), ¿qué magnitud tiene el campo en P? Obténlo como $E_z = -dV/dz$. En kN/C.'; },
          answer: function (v, prev) { var R = v.R / 100, z = v.z / 100; return 2 * PI * k * prev[0] * 1e-6 * (1 - z / Math.hypot(R, z)) / 1e3; },
          solution: function (v) {
            var d = dsk(v);
            return 'Derivas $V(z)$: la derivada de $\\sqrt{z^2 + R^2}$ es $z/\\sqrt{z^2 + R^2}$ y la de $z$ es 1. $$E_z = -\\frac{dV}{dz} = 2\\pi k\\sigma\\left(1 - \\frac{z}{\\sqrt{z^2 + R^2}}\\right) = 2\\pi(8.99 \\times 10^9)(' + sci(d.sig * 1e-6) + ')\\left(1 - \\frac{' + fx(v.z / 100) + '}{' + fx(d.s, 4) + '}\\right) = ' + fx(d.E) + '\\ \\text{kN/C}$$ Es positivo: el campo se aleja del disco, hacia donde $V$ baja.';
          } },
        { label: 'd', type: 'numeric', points: 2, unit: 'μJ',
          prompt: function (v) { return 'Con tu potencial de b), ¿cuánto trabajo hay que hacer para traer una carga de $+' + v.c + '\\ \\text{nC}$ desde muy lejos hasta P, sin cambiar su rapidez? En μJ.'; },
          answer: function (v, prev) { return v.c * prev[1]; },
          solution: function (v) { var d = dsk(v); return 'Tu trabajo es el aumento de energía potencial: $W = q\\,(V_P - 0)$. Con nC por kV salen μJ: $$W = (' + v.c + '\\ \\text{nC})(' + fx(d.V) + '\\ \\text{kV}) = ' + fx(d.U) + '\\ \\mu\\text{J}$$'; } }
      ]
    },

    /* ---------------- S06 + S03 · El campo a partir de V(x, y) ---------------- */
    {
      id: 'f2-ex-gradiente', tags: ['f2.S06', 'f2.S03'], block: 'B', title: 'El campo a partir del potencial',
      vars: { A: [1, 5, 1], B: [2, 20, 2], x: [0.5, 3, 0.5], y: [0.5, 3, 0.5], q: [1, 9, 1] },
      where: function (v) { var g = grd(v); return Math.abs(g.Ey) >= 5 && Math.abs(g.Ey) >= 0.5 * Math.abs(g.Ex); },
      statement: function (v) {
        return '<p>En cierta región el potencial eléctrico es $V(x, y) = ' + v.A + 'x^2y + ' + v.B + 'y$, con $V$ en volts y $x$, $y$ en metros. El punto P está en $(' + v.x + ', ' + v.y + ')$ m. La figura muestra la equipotencial que pasa por P.</p>';
      },
      diagram: { id: 'f2exam-gradiente', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'V/m',
          prompt: function () { return '¿Cuánto vale la componente $E_y$ del campo en P? Con su signo.'; },
          answer: function (v) { return grd(v).Ey; },
          solution: function (v) { return 'Derivas respecto a $y$ con $x$ fija: $\\dfrac{\\partial V}{\\partial y} = ' + v.A + 'x^2 + ' + v.B + '$. $$E_y = -\\frac{\\partial V}{\\partial y} = -\\left(' + v.A + '(' + v.x + ')^2 + ' + v.B + '\\right) = ' + fx(grd(v).Ey) + '\\ \\text{V/m}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'V/m',
          prompt: function () { return '¿Cuánto vale la componente $E_x$ del campo en P? Con su signo.'; },
          answer: function (v) { return grd(v).Ex; },
          solution: function (v) { return 'Ahora con $y$ fija: $\\dfrac{\\partial V}{\\partial x} = ' + (2 * v.A) + 'xy$. $$E_x = -\\frac{\\partial V}{\\partial x} = -' + (2 * v.A) + '(' + v.x + ')(' + v.y + ') = ' + fx(grd(v).Ex) + '\\ \\text{V/m}$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'V/m',
          prompt: function () { return 'Con tus componentes de a) y b), ¿qué magnitud tiene el campo en P?'; },
          answer: function (v, prev) { return Math.hypot(prev[0], prev[1]); },
          solution: function (v) { var g = grd(v); return '$$|\\vec E| = \\sqrt{E_x^2 + E_y^2} = \\sqrt{(' + fx(g.Ex) + ')^2 + (' + fx(g.Ey) + ')^2} = ' + fx(g.E) + '\\ \\text{V/m}$$ Es perpendicular a la equipotencial que pasa por P y apunta hacia donde $V$ baja.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'μN',
          prompt: function (v) { return 'Con tu campo de c), ¿qué magnitud tiene la fuerza sobre una carga de $-' + v.q + '\\ \\mu\\text{C}$ colocada en P? En μN.'; },
          answer: function (v, prev) { return v.q * prev[2]; },
          solution: function (v) { var g = grd(v); return '$$F = |q|E = (' + v.q + ' \\times 10^{-6}\\ \\text{C})(' + fx(g.E) + '\\ \\text{V/m}) = ' + sci(g.F * 1e-6) + '\\ \\text{N} = ' + fx(g.F) + '\\ \\mu\\text{N}$$ Por ser negativa, la fuerza apunta al revés que $\\vec E$: hacia donde $V$ sube.'; } }
      ]
    },

    /* ---------------- S07 + S08 · Cubo en un campo que crece con x ---------------- */
    {
      id: 'f2-ex-cubo', tags: ['f2.S07', 'f2.S08'], block: 'B', title: 'El cubo en un campo que crece',
      vars: { c: [1, 20, 1], a: [10, 50, 5], x0: [10, 60, 10] },
      statement: function (v) {
        return '<p>En una región el campo eléctrico es $\\vec E = c\\,x\\,\\hat\\imath$, con $c = ' + v.c + ' \\times 10^3\\ \\text{N/(C·m)}$ y $x$ en metros: apunta en $+x$ y crece al alejarse del plano $x = 0$. Un cubo imaginario de lado $' + v.a + '$ cm tiene sus caras paralelas a los planos coordenados; su cara izquierda está en $x = ' + v.x0 + '$ cm y la derecha en $x = ' + (v.x0 + v.a) + '$ cm. Usa ' + E0TXT + '.</p>';
      },
      diagram: { id: 'f2exam-cubo', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'N·m²/C',
          prompt: function () { return '¿Cuánto flujo eléctrico pasa por la cara derecha del cubo (normal hacia afuera)?'; },
          answer: function (v) { return cub(v).R; },
          solution: function (v) { return 'En esa cara $x = ' + fx((v.x0 + v.a) / 100) + '$ m en todos los puntos, así que $E$ es uniforme ahí y paralelo a la normal $+\\hat\\imath$: $$\\Phi_{der} = c\\,x\\,a^2 = (' + v.c + ' \\times 10^3)(' + fx((v.x0 + v.a) / 100) + ')(' + fx(v.a / 100) + ')^2 = ' + fx(cub(v).R) + '\\ \\text{N·m}^2/\\text{C}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'N·m²/C',
          prompt: function () { return '¿Cuánto flujo pasa por la cara izquierda (normal hacia afuera)? Con su signo.'; },
          answer: function (v) { return cub(v).L; },
          solution: function (v) { return 'Ahí $x = ' + fx(v.x0 / 100) + '$ m y la normal hacia afuera es $-\\hat\\imath$: el campo entra. $$\\Phi_{izq} = -c\\,x\\,a^2 = -(' + v.c + ' \\times 10^3)(' + fx(v.x0 / 100) + ')(' + fx(v.a / 100) + ')^2 = ' + fx(cub(v).L) + '\\ \\text{N·m}^2/\\text{C}$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'N·m²/C',
          prompt: function () { return 'Con tus flujos de a) y b), ¿cuánto vale el flujo neto por todo el cubo?'; },
          answer: function (v, prev) { return prev[0] + prev[1]; },
          solution: function (v) { var c = cub(v); return 'En las otras cuatro caras $\\vec E$ es paralelo a la superficie: no aportan. $$\\Phi_{neto} = ' + fx(c.R) + ' + (' + fx(c.L) + ') = ' + fx(c.net) + '\\ \\text{N·m}^2/\\text{C}$$ Sale más de lo que entra porque el campo es más fuerte a la derecha.'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'pC',
          prompt: function () { return 'Con tu flujo neto de c), ¿cuánta carga hay dentro del cubo? En pC.'; },
          answer: function (v, prev) { return EPS0 * prev[2] * 1e12; },
          solution: function (v) { var c = cub(v); return 'Por la ley de Gauss, $\\Phi_{neto} = q_{enc}/\\varepsilon_0$: $$q_{enc} = \\varepsilon_0\\,\\Phi_{neto} = (8.85 \\times 10^{-12})(' + fx(c.net) + ') = ' + sci(c.q * 1e-12) + '\\ \\text{C} = ' + fx(c.q) + '\\ \\text{pC}$$'; } }
      ]
    },

    /* ---------------- S07 + S08 · Prisma en un campo inclinado ---------------- */
    {
      id: 'f2-ex-prisma', tags: ['f2.S07', 'f2.S08'], block: 'B', title: 'El flujo por un prisma',
      vars: { E: [100, 1000, 100], al: [10, 60, 5], b: [10, 40, 5], h: [10, 40, 5], w: [10, 40, 5] },
      where: function (v) { return psm(v).th <= 70; },
      statement: function (v) {
        return '<p>Un prisma cerrado tiene corte de triángulo rectángulo: base $b = ' + v.b + '$ cm en el piso, pared vertical de altura $h = ' + v.h + '$ cm y una cara inclinada que une sus extremos; mide $w = ' + v.w + '$ cm de fondo. Está en un campo uniforme de $' + v.E + '$ N/C que apunta $' + v.al + '^\\circ$ arriba de la horizontal, hacia la cara inclinada (ve la figura, que es la vista de canto).</p>';
      },
      diagram: { id: 'f2exam-prisma', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'cm²',
          prompt: function () { return '¿Qué área tiene la cara inclinada? En cm².'; },
          answer: function (v) { return psm(v).A; },
          solution: function (v) { return 'Es un rectángulo de $w$ por la hipotenusa: $$A = w\\sqrt{b^2 + h^2} = ' + v.w + '\\sqrt{' + v.b + '^2 + ' + v.h + '^2} = ' + fx(psm(v).A) + '\\ \\text{cm}^2$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: '°', tol: ANG,
          prompt: function () { return '¿Qué ángulo $\\theta$ forma el campo con la normal (hacia afuera) de la cara inclinada?'; },
          answer: function (v) { return psm(v).th; },
          solution: function (v) { var p = psm(v); return 'La cara inclinada sube con pendiente $h/b$; su normal hacia afuera es perpendicular a ella y apunta $\\arctan(b/h) = \\arctan(' + v.b + '/' + v.h + ') = ' + fx(p.nAng, 1) + '^\\circ$ sobre la horizontal. El campo apunta a $' + v.al + '^\\circ$: $$\\theta = |' + fx(p.nAng, 1) + '^\\circ - ' + v.al + '^\\circ| = ' + fx(p.th, 1) + '^\\circ$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'N·m²/C',
          prompt: function () { return 'Con tus resultados de a) y b), ¿cuánto flujo pasa por la cara inclinada?'; },
          answer: function (v, prev) { return v.E * prev[0] * 1e-4 * Math.cos(prev[1] / DEG); },
          solution: function (v) { var p = psm(v); return '$$\\Phi_{incl} = EA\\cos\\theta = (' + v.E + ')(' + sci(p.A * 1e-4, 4) + '\\ \\text{m}^2)\\cos ' + fx(p.th, 1) + '^\\circ = ' + fx(p.inc) + '\\ \\text{N·m}^2/\\text{C}$$ Es positivo: por esa cara el campo sale.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'N·m²/C',
          prompt: function () { return '¿Cuánto flujo pasa por la base (la cara del piso)? Con su signo.'; },
          answer: function (v) { return psm(v).base; },
          solution: function (v) { var p = psm(v); return 'La normal de la base apunta hacia abajo; el campo tiene componente vertical $E\\sin ' + v.al + '^\\circ$ hacia arriba, así que entra: $$\\Phi_{base} = -E\\sin\\alpha\\;bw = -(' + v.E + ')\\sin ' + v.al + '^\\circ\\,(' + fx(v.b / 100) + ')(' + fx(v.w / 100) + ') = ' + fx(p.base) + '\\ \\text{N·m}^2/\\text{C}$$'; } },
        { label: 'e', type: 'numeric', points: 3, unit: 'N·m²/C',
          prompt: function () { return 'Con tus flujos de c) y d), y sabiendo que el prisma no encierra carga, ¿cuánto flujo pasa por la pared vertical?'; },
          answer: function (v, prev) { return -(prev[2] + prev[3]); },
          solution: function (v) { var p = psm(v); return 'Los dos triángulos de los lados son paralelos al campo: flujo cero. Sin carga adentro, la ley de Gauss pide flujo total cero: $$\\Phi_{pared} = -(\\Phi_{incl} + \\Phi_{base}) = -(' + fx(p.inc) + ' + (' + fx(p.base) + ')) = ' + fx(p.wall) + '\\ \\text{N·m}^2/\\text{C}$$ Coincide con $-E\\cos\\alpha\\;hw$: por la pared el campo entra.'; } }
      ]
    },

    /* ---------------- S08 + S07 + S06 · Esfera aislante con Gauss ---------------- */
    {
      id: 'f2-ex-esfera-solida', tags: ['f2.S08', 'f2.S07', 'f2.S06'], block: 'B', title: 'Gauss dentro de una esfera',
      vars: { Q: [10, 90, 10], R: [3, 10, 1], r: [1, 9, 1] },
      where: function (v) { return v.r <= v.R - 1 && v.r / v.R >= 0.25; },
      statement: function (v) {
        return '<p>Una esfera aislante de radio $R = ' + v.R + '$ cm tiene una carga de $+' + v.Q + '\\ \\text{nC}$ repartida uniformemente en todo su volumen. Imagina una superficie gaussiana esférica de radio $r = ' + v.r + '$ cm, concéntrica con ella. Usa ' + E0TXT + '.</p>';
      },
      diagram: { id: 'f2exam-esfera', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'nC',
          prompt: function () { return '¿Cuánta carga encierra la superficie gaussiana? En nC.'; },
          answer: function (v) { return sph(v).q; },
          solution: function (v) { return 'La carga es uniforme: la fracción encerrada es la fracción del volumen, $(r/R)^3$. $$q_{enc} = Q\\left(\\frac{r}{R}\\right)^3 = ' + v.Q + '\\left(\\frac{' + v.r + '}{' + v.R + '}\\right)^3 = ' + fx(sph(v).q, 3) + '\\ \\text{nC}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'N·m²/C',
          prompt: function () { return 'Con tu carga de a), ¿cuánto flujo eléctrico atraviesa la superficie gaussiana?'; },
          answer: function (v, prev) { return prev[0] * 1e-9 / EPS0; },
          solution: function (v) { var s = sph(v); return '$$\\Phi = \\frac{q_{enc}}{\\varepsilon_0} = \\frac{' + fx(s.q, 3) + ' \\times 10^{-9}}{8.85 \\times 10^{-12}} = ' + fx(s.F) + '\\ \\text{N·m}^2/\\text{C}$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'kN/C',
          prompt: function () { return 'Con tu flujo de b), ¿qué magnitud tiene el campo a $r$ del centro? En kN/C.'; },
          answer: function (v, prev) { return prev[1] / (4 * PI * Math.pow(v.r / 100, 2)) / 1e3; },
          solution: function (v) { var s = sph(v); return 'Por simetría, $E$ es radial y vale lo mismo en toda la superficie: $\\Phi = E\\,4\\pi r^2$. $$E = \\frac{\\Phi}{4\\pi r^2} = \\frac{' + fx(s.F) + '}{4\\pi(' + fx(v.r / 100) + ')^2} = ' + fx(s.E) + '\\ \\text{kN/C}$$'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'kN/C',
          prompt: function () { return 'Con tu campo de c), ¿qué magnitud tiene el campo en la superficie de la esfera? En kN/C.'; },
          answer: function (v, prev) { return prev[2] * v.R / v.r; },
          solution: function (v) { var s = sph(v); return 'Adentro, $E = \\dfrac{Q\\,r}{4\\pi\\varepsilon_0 R^3}$ crece en proporción a $r$: $$E(R) = E(r)\\,\\frac{R}{r} = ' + fx(s.E) + '\\cdot\\frac{' + v.R + '}{' + v.r + '} = ' + fx(s.ER) + '\\ \\text{kN/C}$$'; } },
        { label: 'e', type: 'numeric', points: 3, unit: 'kV',
          prompt: function () { return 'Con tu campo de d), ¿cuánto vale el potencial en la superficie de la esfera ($V = 0$ en el infinito)? En kV.'; },
          answer: function (v, prev) { return prev[3] * v.R / 100; },
          solution: function (v) { var s = sph(v); return 'Afuera la esfera es como una carga puntual: $E = kQ/r^2$. Al integrar desde el infinito, $V(R) = \\displaystyle\\int_R^\\infty E\\,dr = \\frac{kQ}{R} = E(R)\\,R$: $$V(R) = (' + fx(s.ER) + '\\ \\text{kN/C})(' + fx(v.R / 100) + '\\ \\text{m}) = ' + fx(s.V) + '\\ \\text{kV}$$'; } }
      ]
    },

    /* ---------------- S09 + S08 + S10 · Capacitor de placas con batería ---------------- */
    {
      id: 'f2-ex-capacitor', tags: ['f2.S09', 'f2.S08', 'f2.S10'], block: 'B', title: 'Placas, batería y dieléctrico',
      vars: { A: [50, 400, 50], d: [0.5, 5, 0.5], V: [10, 200, 10], kap: [2, 6, 0.5] },
      statement: function (v) {
        return '<p>Un capacitor de placas paralelas tiene placas de $' + v.A + '\\ \\text{cm}^2$ separadas $' + v.d + '$ mm, con aire entre ellas, y está conectado a una batería de $' + v.V + '$ V. Usa ' + E0TXT + '.</p>';
      },
      diagram: { id: 'f2exam-capacitor', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'pF',
          prompt: function () { return '¿Cuál es su capacitancia? En pF.'; },
          answer: function (v) { return cpl(v).C; },
          solution: function (v) { return 'Con $A$ en m² y $d$ en m: $$C = \\frac{\\varepsilon_0 A}{d} = \\frac{(8.85 \\times 10^{-12})(' + sci(v.A * 1e-4) + ')}{' + sci(v.d * 1e-3) + '} = ' + sci(cpl(v).C * 1e-12) + '\\ \\text{F} = ' + fx(cpl(v).C) + '\\ \\text{pF}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'nC',
          prompt: function () { return 'Con tu capacitancia de a), ¿cuánta carga hay en la placa positiva? En nC.'; },
          answer: function (v, prev) { return prev[0] * v.V * 1e-3; },
          solution: function (v) { var c = cpl(v); return '$$Q = CV = (' + fx(c.C) + ' \\times 10^{-12})(' + v.V + ') = ' + sci(c.Q * 1e-9) + '\\ \\text{C} = ' + fx(c.Q) + '\\ \\text{nC}$$'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'kN/C',
          prompt: function () { return 'Con tu carga de b), ¿qué magnitud tiene el campo entre las placas? Usa la ley de Gauss. En kN/C.'; },
          answer: function (v, prev) { return prev[1] * 1e-9 / (EPS0 * v.A * 1e-4) / 1e3; },
          solution: function (v) { var c = cpl(v); return 'Una caja gaussiana con una tapa dentro del metal da $E = \\sigma/\\varepsilon_0 = Q/(\\varepsilon_0 A)$: $$E = \\frac{' + sci(c.Q * 1e-9) + '}{(8.85 \\times 10^{-12})(' + sci(v.A * 1e-4) + ')} = ' + fx(c.E) + '\\ \\text{kN/C}$$ Comprueba: $V/d = ' + v.V + '/' + sci(v.d * 1e-3) + '$ da lo mismo.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'nJ',
          prompt: function () { return 'Con tu carga de b), ¿cuánta energía guarda el capacitor? En nJ.'; },
          answer: function (v, prev) { return 0.5 * prev[1] * v.V; },
          solution: function (v) { var c = cpl(v); return 'Con nC por V salen nJ: $$U = \\tfrac{1}{2}QV = \\tfrac{1}{2}(' + fx(c.Q) + '\\ \\text{nC})(' + v.V + '\\ \\text{V}) = ' + fx(c.U) + '\\ \\text{nJ}$$'; } },
        { label: 'e', type: 'numeric', points: 2, unit: 'nC',
          prompt: function (v) { return 'Sin desconectar la batería, se llena el espacio entre las placas con un dieléctrico de $\\kappa = ' + v.kap + '$. Con tu carga de b), ¿cuánta carga hay ahora en la placa positiva? En nC.'; },
          answer: function (v, prev) { return v.kap * prev[1]; },
          solution: function (v) { var c = cpl(v); return 'La batería mantiene el mismo $V$ y la capacitancia se multiplica por $\\kappa$, así que la carga también: $$Q\' = \\kappa Q = ' + v.kap + '(' + fx(c.Q) + ') = ' + fx(c.Qk) + '\\ \\text{nC}$$'; } }
      ]
    },

    /* ---------------- S09 + S08 · Cable coaxial ---------------- */
    {
      id: 'f2-ex-coaxial', tags: ['f2.S09', 'f2.S08'], block: 'B', title: 'El cable coaxial',
      vars: { a: [0.5, 2, 0.5], b: [2, 10, 1], L: [5, 50, 5], V: [10, 100, 10], r: [1, 9, 0.5] },
      where: function (v) { return v.b / v.a >= 2 && v.r >= v.a + 0.5 && v.r <= v.b - 0.5; },
      statement: function (v) {
        return '<p>Un cable coaxial de $' + v.L + '$ m tiene un alambre central de radio $a = ' + v.a + '$ mm y un forro conductor de radio $b = ' + v.b + '$ mm, con aire entre ellos. Se conecta a una diferencia de potencial de $' + v.V + '$ V entre el alambre y el forro. Usa ' + E0TXT + '.</p>';
      },
      diagram: { id: 'f2exam-coaxial', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'pF/m',
          prompt: function () { return '¿Cuál es su capacitancia por metro de largo? En pF/m.'; },
          answer: function (v) { return cox(v).cl; },
          solution: function (v) { return 'Las unidades de los radios se cancelan en el cociente: $$\\frac{C}{L} = \\frac{2\\pi\\varepsilon_0}{\\ln(b/a)} = \\frac{2\\pi(8.85 \\times 10^{-12})}{\\ln(' + v.b + '/' + v.a + ')} = ' + sci(cox(v).cl * 1e-12) + '\\ \\text{F/m} = ' + fx(cox(v).cl) + '\\ \\text{pF/m}$$'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'nF',
          prompt: function () { return 'Con tu resultado de a), ¿cuál es la capacitancia de todo el cable? En nF.'; },
          answer: function (v, prev) { return prev[0] * v.L * 1e-3; },
          solution: function (v) { var c = cox(v); return '$$C = \\frac{C}{L}\\cdot L = (' + fx(c.cl) + '\\ \\text{pF/m})(' + v.L + '\\ \\text{m}) = ' + fx(c.cl * v.L) + '\\ \\text{pF} = ' + fx(c.C, 3) + '\\ \\text{nF}$$'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'nC',
          prompt: function () { return 'Con tu capacitancia de b), ¿cuánta carga hay en el alambre central? En nC.'; },
          answer: function (v, prev) { return prev[1] * v.V; },
          solution: function (v) { var c = cox(v); return '$$Q = CV = (' + fx(c.C, 3) + '\\ \\text{nF})(' + v.V + '\\ \\text{V}) = ' + fx(c.Q) + '\\ \\text{nC}$$'; } },
        { label: 'd', type: 'numeric', points: 3, unit: 'kN/C',
          prompt: function (v) { return 'Con tu carga de c), ¿qué magnitud tiene el campo entre el alambre y el forro, a $' + v.r + '$ mm del eje? En kN/C.'; },
          answer: function (v, prev) { return prev[2] * 1e-9 / v.L / (2 * PI * EPS0 * v.r * 1e-3) / 1e3; },
          solution: function (v) { var c = cox(v); return 'Con un cilindro gaussiano de radio $r$ y largo $\\ell$: $E\\,2\\pi r\\ell = \\lambda\\ell/\\varepsilon_0$, con $\\lambda = Q/L = ' + fx(c.lam, 3) + '\\ \\text{nC/m}$. $$E = \\frac{\\lambda}{2\\pi\\varepsilon_0 r} = \\frac{' + fx(c.lam, 3) + ' \\times 10^{-9}}{2\\pi(8.85 \\times 10^{-12})(' + sci(v.r * 1e-3) + ')} = ' + fx(c.E) + '\\ \\text{kN/C}$$'; } }
      ]
    },

    /* ---------------- S10 + S09 · Red de capacitores ---------------- */
    {
      id: 'f2-ex-red', tags: ['f2.S10', 'f2.S09'], block: 'B', title: 'Una red mixta',
      vars: { C1: [1, 12, 1], C2: [1, 12, 1], C3: [1, 12, 1], V: [6, 48, 6] },
      statement: function (v) {
        return '<p>El capacitor $C_1 = ' + v.C1 + '\\ \\mu\\text{F}$ está en serie con el par formado por $C_2 = ' + v.C2 + '\\ \\mu\\text{F}$ y $C_3 = ' + v.C3 + '\\ \\mu\\text{F}$, que están en paralelo entre sí. La red se conecta a una batería de $' + v.V + '$ V. Los capacitores estaban descargados.</p>';
      },
      diagram: { id: 'f2exam-red', state: function (v) { return v; } },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'μF',
          prompt: function () { return '¿Cuál es la capacitancia equivalente del par $C_2$, $C_3$?'; },
          answer: function (v) { return cnet(v).Cp; },
          solution: function (v) { return 'En paralelo las capacitancias se suman: $C_{23} = ' + v.C2 + ' + ' + v.C3 + ' = ' + cnet(v).Cp + '\\ \\mu\\text{F}$.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: 'μF',
          prompt: function () { return 'Con tu resultado de a), ¿cuál es la capacitancia equivalente de toda la red?'; },
          answer: function (v, prev) { return v.C1 * prev[0] / (v.C1 + prev[0]); },
          solution: function (v) { var n = cnet(v); return '$C_1$ y $C_{23}$ están en serie: se suman los inversos. $$C_{eq} = \\frac{C_1C_{23}}{C_1 + C_{23}} = \\frac{(' + v.C1 + ')(' + n.Cp + ')}{' + v.C1 + ' + ' + n.Cp + '} = ' + fx(n.Ce, 3) + '\\ \\mu\\text{F}$$'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'μC',
          prompt: function () { return 'Con tu resultado de b), ¿cuánta carga entrega la batería?'; },
          answer: function (v, prev) { return prev[1] * v.V; },
          solution: function (v) { var n = cnet(v); return '$$Q = C_{eq}V = (' + fx(n.Ce, 3) + '\\ \\mu\\text{F})(' + v.V + '\\ \\text{V}) = ' + fx(n.Q) + '\\ \\mu\\text{C}$$ Es también la carga de $C_1$, que está en serie con la batería.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'V',
          prompt: function () { return 'Con tus resultados de a) y c), ¿qué voltaje tiene $C_2$?'; },
          answer: function (v, prev) { return prev[2] / prev[0]; },
          solution: function (v) { var n = cnet(v); return 'Toda la carga $Q$ pasa al par en paralelo, que tiene un solo voltaje: $$V_2 = V_{23} = \\frac{Q}{C_{23}} = \\frac{' + fx(n.Q) + '}{' + n.Cp + '} = ' + fx(n.V2) + '\\ \\text{V}$$ Comprueba: $V_1 = Q/C_1 = ' + fx(n.V1) + '$ V, y $V_1 + V_{23} = ' + v.V + '$ V.'; } },
        { label: 'e', type: 'numeric', points: 2, unit: 'μJ',
          prompt: function () { return 'Con tu voltaje de d), ¿cuánta energía guarda $C_2$?'; },
          answer: function (v, prev) { return 0.5 * v.C2 * prev[3] * prev[3]; },
          solution: function (v) { var n = cnet(v); return 'Con μF por V² salen μJ: $$U_2 = \\tfrac{1}{2}C_2V_2^2 = \\tfrac{1}{2}(' + v.C2 + ')(' + fx(n.V2) + ')^2 = ' + fx(n.U2) + '\\ \\mu\\text{J}$$'; } }
      ]
    }
  ]);
})();
