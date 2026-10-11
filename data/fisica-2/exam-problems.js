/* =====================================================================
   Problemas de examen · Física 2. Propios y parametrizados.
   part.answer(v, prev): prev son las respuestas DEL ALUMNO en los incisos
   anteriores, para dar crédito por arrastre de error.
   k = 8.99 × 10⁹ N·m²/C², e = 1.60 × 10⁻¹⁹ C, mₑ = 9.11 × 10⁻³¹ kg,
   mₚ = 1.67 × 10⁻²⁷ kg (los mismos valores que las sesiones y los labs).
   Bloque A (S01–S05): 8 problemas. Las unidades de cada inciso se eligen
   para que las respuestas queden, casi siempre, entre 0.1 y 10⁴.
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
    }
  ]);
})();
