/* =====================================================================
   Banco · Física 2 · S02 · Ley de Coulomb y superposición. 100 preguntas propias.
   k = 8.99 × 10⁹ N·m²/C², e = 1.60 × 10⁻¹⁹ C, SI. Ángulos en grados desde +x,
   antihorario, en [0°, 360°). Las respuestas se calculan aquí con fórmulas escalares;
   `setup(v, LabMath.coulomb)` recalcula cada numérica por superposición vectorial y
   scripts/labs-math/coulomb-check.js compara las dos en cientos de instancias.
   ===================================================================== */
(function () {
  var K = window.CBBankKit('f2', '02');
  var k = 8.99e9, e = 1.60e-19, G = 6.67e-11, mp = 1.67e-27, me = 9.11e-31, DEG = 180 / Math.PI;
  var KT = ' Usa $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$.';
  var ET = ' Usa $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$ y $e = 1.60 \\times 10^{-19}\\ \\text{C}$.';

  function N(id, sub, d, vars, prompt, answer, why, o) {
    o = o || {};
    var q = K.N(id, sub, d, vars, prompt, answer, why, o);
    if (o.mistakes) {
      var base = o.where;
      q.where = function (v) {
        if (base && !base(v)) return false;
        var vals = [answer(v)].concat(Object.keys(o.mistakes).map(function (key) { return o.mistakes[key](v); }));
        for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
          if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 1)) return false;
        }
        return true;
      };
    }
    if (o.setup) q.setup = o.setup;
    return q;
  }
  // Opción múltiple: cada distractor lleva su explicación.
  function C(id, sub, d, prompt, correct, wrongs, why, o) { return K.C(id, sub, d, prompt, correct, wrongs, why, o); }
  function fb(key, say) { return [{ when: key, say: say }]; }
  function sg(x) { return (x > 0 ? '+' : '') + String(x).replace('-', '−'); }
  function n360(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  // Magnitud (N) entre cargas q1, q2 (en la unidad u, en C) a r (en m).
  function F(q1, q2, r, u) { u = u || 1e-6; return k * Math.abs(q1 * q2) * u * u / (r * r); }
  // Fuerza sobre t (en (xt, yt)) debida a s (en (xs, ys)); μC y cm.
  function fOn(qs, xs, ys, qt, xt, yt) {
    var dx = (xt - xs) / 100, dy = (yt - ys) / 100, r = Math.hypot(dx, dy), f = k * qs * qt * 1e-12 / (r * r);
    return [f * dx / r, f * dy / r];
  }
  // Búsqueda por bisección de la raíz de f en [lo, hi] (para las preguntas inversas).
  function solve(f, lo, hi) {
    for (var i = 0; i < 200; i++) { var m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; }
    return (lo + hi) / 2;
  }
  // Configuraciones para el oráculo (LabMath.coulomb): cargas en μC y cm.
  function netSI(C2, list, i, unit) { return C2.net(C2.toSI(list, unit || 'uC'), i); }

  var Q6 = [-6, 6, 1], D8 = [2, 8, 1], nz = function () { for (var i = 0; i < arguments.length; i++) if (!arguments[i]) return false; return true; };
  var ANG = { abs: 0.5 };

  // Línea: q1 en 0, q2 en d1, q3 en d1 + d2 (cm, μC).
  function lin(v) {
    var F1 = k * v.q1 * v.q2 * 1e-12 / Math.pow(v.d1 / 100, 2), F3 = -k * v.q3 * v.q2 * 1e-12 / Math.pow(v.d2 / 100, 2);
    return { F1: F1, F3: F3, F: F1 + F3 };
  }
  function linList(v) { return [{ q: v.q1, x: 0, y: 0 }, { q: v.q2, x: v.d1, y: 0 }, { q: v.q3, x: v.d1 + v.d2, y: 0 }]; }
  // Plano: q1 en el origen, q2 en (a, 0) y q3 en (0, b) (cm, μC); neta sobre q1.
  function pla(v) {
    var Fx = -k * v.q1 * v.q2 * 1e-12 / Math.pow(v.a / 100, 2), Fy = -k * v.q1 * v.q3 * 1e-12 / Math.pow(v.b / 100, 2);
    return { Fx: Fx, Fy: Fy, mag: Math.hypot(Fx, Fy), ang: n360(Math.atan2(Fy, Fx) * DEG) };
  }
  function plaList(v) { return [{ q: v.q1, x: 0, y: 0 }, { q: v.q2, x: v.a, y: 0 }, { q: v.q3, x: 0, y: v.b }]; }
  function plaText(v) { return '$q_1 = ' + sg(v.q1) + '\\ \\mu\\text{C}$ en el origen, $q_2 = ' + sg(v.q2) + '\\ \\mu\\text{C}$ en $(' + v.a + ',\\ 0)$ cm y $q_3 = ' + sg(v.q3) + '\\ \\mu\\text{C}$ en $(0,\\ ' + v.b + ')$ cm.'; }
  var PLA = { q1: [1, 6, 1], q2: Q6, q3: Q6, a: D8, b: D8 };
  var plaOk = function (v) { return nz(v.q2, v.q3); };

  var Q = [
    /* ---------------- Magnitud ---------------- */
    N('ma-uc', 'magnitud', 1, { q1: [1, 9, 1], q2: [1, 9, 1], r: [2, 15, 1] },
      function (v) { return 'Dos cargas de $' + v.q1 + '\\ \\mu\\text{C}$ y $' + v.q2 + '\\ \\mu\\text{C}$ están a $' + v.r + '\\ \\text{cm}$. ¿Cuánto vale la fuerza entre ellas?' + KT; },
      function (v) { return F(v.q1, v.q2, v.r / 100); }, '$F = k|q_1q_2|/r^2$ con las cargas en C y $r$ en m.',
      { unit: 'N', mistakes: { cm: function (v) { return F(v.q1, v.q2, v.r); } }, feedback: fb('cm', 'Dejaste $r$ en centímetros: pásalo a metros.'), setup: function (v, C2) { return C2.magnitude(v.q1 * 1e-6, v.q2 * 1e-6, v.r / 100); } }),
    N('ma-nc', 'magnitud', 2, { q1: [1, 9, 1], q2: [1, 9, 1], r: [1, 10, 1] },
      function (v) { return 'Dos esferitas con $' + v.q1 + '\\ \\text{nC}$ y $-' + v.q2 + '\\ \\text{nC}$ están a $' + v.r + '\\ \\text{cm}$. ¿Qué magnitud tiene la fuerza entre ellas? (Usa notación científica.)' + KT; },
      function (v) { return F(v.q1, v.q2, v.r / 100, 1e-9); }, '$1\\ \\text{nC} = 10^{-9}\\ \\text{C}$; con cargas tan chicas la fuerza es de micronewtons a milinewtons.',
      { unit: 'N', mistakes: { prefixMu: function (v) { return F(v.q1, v.q2, v.r / 100, 1e-6); } }, feedback: fb('prefixMu', 'Usaste $10^{-6}$: eso es $\\mu$C. El nano es $10^{-9}$.'), setup: function (v, C2) { return C2.magnitude(v.q1 * 1e-9, -v.q2 * 1e-9, v.r / 100); } }),
    N('ma-metros', 'magnitud', 1, { q1: [1, 9, 1], q2: [1, 9, 1], r: [0.5, 3, 0.5] },
      function (v) { return 'Dos cargas de $' + v.q1 + '\\ \\mu\\text{C}$ y $' + v.q2 + '\\ \\mu\\text{C}$ están a $' + v.r + '\\ \\text{m}$. ¿Cuánto vale la fuerza entre ellas?' + KT; },
      function (v) { return F(v.q1, v.q2, v.r); }, 'Aquí $r$ ya está en metros: solo hay que convertir las cargas.',
      { unit: 'N', mistakes: { noSquare: function (v) { return k * v.q1 * v.q2 * 1e-12 / v.r; } }, feedback: fb('noSquare', 'La distancia va al cuadrado.'), setup: function (v, C2) { return C2.magnitude(v.q1 * 1e-6, v.q2 * 1e-6, v.r); } }),
    N('ma-mm', 'magnitud', 2, { q1: [1, 9, 1], q2: [1, 9, 1], r: [2, 20, 1] },
      function (v) { return 'Dos cargas de $' + v.q1 + '\\ \\text{nC}$ y $' + v.q2 + '\\ \\text{nC}$ están a $' + v.r + '\\ \\text{mm}$. ¿Cuánto vale la fuerza entre ellas?' + KT; },
      function (v) { return F(v.q1, v.q2, v.r / 1000, 1e-9); }, '$1\\ \\text{mm} = 10^{-3}\\ \\text{m}$ y $1\\ \\text{nC} = 10^{-9}\\ \\text{C}$.',
      { unit: 'N', setup: function (v, C2) { return C2.magnitude(v.q1 * 1e-9, v.q2 * 1e-9, v.r / 1000); } }),
    N('ma-r', 'magnitud', 2, { q1: [1, 9, 1], q2: [1, 9, 1], F: [5, 100, 5] },
      function (v) { return 'Dos cargas de $' + v.q1 + '\\ \\mu\\text{C}$ y $' + v.q2 + '\\ \\mu\\text{C}$ se repelen con $' + v.F + '\\ \\text{N}$. ¿A qué distancia están, en cm?' + KT; },
      function (v) { return 100 * Math.sqrt(k * v.q1 * v.q2 * 1e-12 / v.F); }, 'Despeja $r = \\sqrt{k|q_1q_2|/F}$ y pasa a cm.',
      { unit: 'cm', setup: function (v, C2) { return solve(function (r) { return C2.magnitude(v.q1 * 1e-6, v.q2 * 1e-6, r / 100) - v.F; }, 0.01, 1000); } }),
    N('ma-q', 'magnitud', 2, { q1: [1, 9, 1], r: [2, 15, 1], F: [5, 100, 5] },
      function (v) { return 'Una carga de $' + v.q1 + '\\ \\mu\\text{C}$ y otra desconocida, a $' + v.r + '\\ \\text{cm}$, se atraen con $' + v.F + '\\ \\text{N}$. ¿Cuánto vale la carga desconocida, en $\\mu$C (magnitud)?' + KT; },
      function (v) { return v.F * Math.pow(v.r / 100, 2) / (k * v.q1 * 1e-6) * 1e6; }, 'Despeja $|q_2| = F r^2/(k|q_1|)$.',
      { unit: 'μC', setup: function (v, C2) { return solve(function (q) { return C2.magnitude(v.q1 * 1e-6, q * 1e-6, v.r / 100) - v.F; }, 1e-6, 1e6); } }),
    N('ma-iguales', 'magnitud', 2, { r: [2, 20, 1], F: [5, 100, 5] },
      function (v) { return 'Dos cargas iguales a $' + v.r + '\\ \\text{cm}$ se repelen con $' + v.F + '\\ \\text{N}$. ¿Cuánto vale cada carga, en $\\mu$C?' + KT; },
      function (v) { return (v.r / 100) * Math.sqrt(v.F / k) * 1e6; }, 'Con $q_1 = q_2 = q$: $q = r\\sqrt{F/k}$.',
      { unit: 'μC', mistakes: { noSqrt: function (v) { return Math.pow(v.r / 100, 2) * v.F / k * 1e6 * 1e6; } }, feedback: fb('noSqrt', 'Despejaste $q^2$; falta sacar la raíz.'), setup: function (v, C2) { return solve(function (q) { return C2.magnitude(q * 1e-6, q * 1e-6, v.r / 100) - v.F; }, 1e-6, 1e6); } }),
    N('ma-doble', 'magnitud', 1, { F: [4, 200, 4], n: [2, 4, 1] },
      function (v) { return 'Dos cargas se atraen con $' + v.F + '\\ \\text{N}$. Si la distancia entre ellas se multiplica por ' + v.n + ', ¿cuánto vale la nueva fuerza?'; },
      function (v) { return v.F / (v.n * v.n); }, '$F \\propto 1/r^2$: multiplicar $r$ por $n$ divide la fuerza entre $n^2$.',
      { unit: 'N', mistakes: { linear: function (v) { return v.F / v.n; } }, feedback: fb('linear', 'La distancia va al cuadrado: divide entre $n^2$, no entre $n$.'), setup: function (v, C2) { return v.F * C2.magnitude(1, 1, v.n) / C2.magnitude(1, 1, 1); } }),
    N('ma-factor', 'magnitud', 2, { F: [10, 90, 10], a: [2, 5, 1], b: [2, 5, 1] },
      function (v) { return 'Dos cargas se repelen con $' + v.F + '\\ \\text{N}$. Si cada carga se multiplica por ' + v.a + ' y la distancia por ' + v.b + ', ¿cuánto vale la nueva fuerza?'; },
      function (v) { return v.F * v.a * v.a / (v.b * v.b); }, 'El producto de cargas crece $a^2$ veces y $r^2$ crece $b^2$ veces.',
      { unit: 'N', where: function (v) { return v.a !== v.b; }, mistakes: { oneCharge: function (v) { return v.F * v.a / (v.b * v.b); } }, feedback: fb('oneCharge', 'Cambiaron las <strong>dos</strong> cargas: el producto crece $a^2$ veces.'), setup: function (v, C2) { return v.F * C2.magnitude(v.a, v.a, v.b) / C2.magnitude(1, 1, 1); } }),
    N('ma-electrones', 'magnitud', 2, { r: [1, 9, 1] },
      function (v) { return '¿Con qué fuerza se repelen dos electrones separados $' + v.r + ' \\times 10^{-10}\\ \\text{m}$?' + ET; },
      function (v) { return k * e * e / Math.pow(v.r * 1e-10, 2); }, 'Cada uno tiene carga $-e$; la magnitud es $ke^2/r^2$.',
      { unit: 'N', setup: function (v, C2) { return C2.magnitude(-C2.E, -C2.E, v.r * 1e-10); } }),
    N('ma-hidrogeno', 'magnitud', 2, { r: [3, 9, 1] },
      function (v) { return 'Un protón y un electrón están a $' + v.r + ' \\times 10^{-11}\\ \\text{m}$. ¿Qué magnitud tiene la fuerza eléctrica entre ellos?' + ET; },
      function (v) { return k * e * e / Math.pow(v.r * 1e-11, 2); }, 'Las cargas miden $e$; la fuerza es de atracción.',
      { unit: 'N', setup: function (v, C2) { return C2.magnitude(C2.E, -C2.E, v.r * 1e-11); } }),
    N('ma-ratio-pp', 'magnitud', 3, {},
      function () { return '¿Cuántas veces es mayor la repulsión eléctrica entre dos protones que su atracción gravitacional? Usa $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$, $e = 1.60 \\times 10^{-19}\\ \\text{C}$, $G = 6.67 \\times 10^{-11}\\ \\text{N·m}^2/\\text{kg}^2$ y $m_p = 1.67 \\times 10^{-27}\\ \\text{kg}$.'; },
      function () { return k * e * e / (G * mp * mp); }, '$F_e/F_g = ke^2/(Gm_p^2)$; la distancia se cancela.',
      { setup: function (v, C2) { return C2.ratio(C2.E, C2.E, C2.MP, C2.MP, 1e-15); } }),
    N('ma-ratio-pe', 'magnitud', 3, {},
      function () { return 'Para un protón y un electrón, ¿cuánto vale el cociente $F_e/F_g$ entre la fuerza eléctrica y la gravitacional? Usa $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$, $e = 1.60 \\times 10^{-19}\\ \\text{C}$, $G = 6.67 \\times 10^{-11}\\ \\text{N·m}^2/\\text{kg}^2$, $m_p = 1.67 \\times 10^{-27}\\ \\text{kg}$ y $m_e = 9.11 \\times 10^{-31}\\ \\text{kg}$.'; },
      function () { return k * e * e / (G * mp * me); }, 'Como las dos fuerzas van con $1/r^2$, el cociente es $ke^2/(Gm_p m_e)$.',
      { setup: function (v, C2) { return C2.ratio(C2.E, -C2.E, C2.MP, C2.ME, 5.3e-11); } }),
    N('ma-reparto', 'magnitud', 3, { Q: [6, 12, 2], q: [1, 5, 1], r: [3, 12, 1] },
      function (v) { return 'Una carga de $' + v.Q + '\\ \\mu\\text{C}$ se divide en dos partes: $' + v.q + '\\ \\mu\\text{C}$ y el resto. Las partes se separan $' + v.r + '\\ \\text{cm}$. ¿Con qué fuerza se repelen?' + KT; },
      function (v) { return F(v.q, v.Q - v.q, v.r / 100); }, 'La otra parte es $Q - q$; luego Coulomb.',
      { unit: 'N', where: function (v) { return 2 * v.q !== v.Q; }, setup: function (v, C2) { return C2.magnitude(v.q * 1e-6, (v.Q - v.q) * 1e-6, v.r / 100); } }),
    N('ma-exceso', 'magnitud', 3, { n: [1, 9, 1], r: [2, 10, 1] },
      function (v) { return 'Dos esferitas tienen cada una $' + v.n + ' \\times 10^{12}$ electrones de más y están a $' + v.r + '\\ \\text{cm}$. ¿Con qué fuerza se repelen?' + ET; },
      function (v) { var q = v.n * 1e12 * e; return k * q * q / Math.pow(v.r / 100, 2); }, 'Primero la carga de cada una, $q = ne$; luego Coulomb.',
      { unit: 'N', mistakes: { noE: function (v) { var q = v.n * 1e12; return k * q * q / Math.pow(v.r / 100, 2); } }, feedback: fb('noE', 'Usaste el número de electrones como carga. Multiplica por $e$.'), setup: function (v, C2) { return C2.magnitude(-v.n * 1e12 * C2.E, -v.n * 1e12 * C2.E, v.r / 100); } }),

    /* ---------------- Dirección y componentes ---------------- */
    N('di-r', 'direccion', 1, { x1: [-6, 6, 1], y1: [-6, 6, 1], x2: [-6, 6, 1], y2: [-6, 6, 1] },
      function (v) { return 'Una carga está en $(' + v.x1 + ',\\ ' + v.y1 + ')$ cm y otra en $(' + v.x2 + ',\\ ' + v.y2 + ')$ cm. ¿Qué distancia $r$ (en cm) va en la ley de Coulomb?'; },
      function (v) { return Math.hypot(v.x2 - v.x1, v.y2 - v.y1); }, '$r$ es la distancia entre las cargas: $\\sqrt{\\Delta x^2 + \\Delta y^2}$.',
      { unit: 'cm', where: function (v) { return v.x1 !== v.x2 && v.y1 !== v.y2; }, mistakes: { sumAbs: function (v) { return Math.abs(v.x2 - v.x1) + Math.abs(v.y2 - v.y1); } }, feedback: fb('sumAbs', 'Sumaste los catetos. Usa Pitágoras.'), setup: function (v, C2) { return 100 * Math.sqrt(C2.magnitude(1, 1, 1) / C2.magnitude(1, 1, Math.hypot(v.x2 - v.x1, v.y2 - v.y1) / 100)); } }),
    N('di-fx', 'direccion', 2, { q1: Q6, q2: Q6, x: [-8, 8, 1], y: [-8, 8, 1] },
      function (v) { return 'Una carga $q_1 = ' + sg(v.q1) + '\\ \\mu\\text{C}$ está en el origen y $q_2 = ' + sg(v.q2) + '\\ \\mu\\text{C}$ en $(' + v.x + ',\\ ' + v.y + ')$ cm. ¿Cuánto vale la componente $F_x$ de la fuerza sobre $q_2$? (Con signo.)' + KT; },
      function (v) { return fOn(v.q1, 0, 0, v.q2, v.x, v.y)[0]; }, 'Calcula la magnitud, decide si se aleja (repulsión) o se acerca (atracción) al origen y multiplica por $x/r$.',
      { unit: 'N', where: function (v) { return nz(v.q1, v.q2, v.x, v.y) && Math.abs(fOn(v.q1, 0, 0, v.q2, v.x, v.y)[0]) > 0.5; }, mistakes: { flipped: function (v) { return -fOn(v.q1, 0, 0, v.q2, v.x, v.y)[0]; } }, feedback: fb('flipped', 'El signo está al revés: revisa si se atraen o se repelen.'), setup: function (v, C2) { return C2.force({ q: v.q1 * 1e-6, x: 0, y: 0 }, { q: v.q2 * 1e-6, x: v.x / 100, y: v.y / 100 }).x; } }),
    N('di-fy', 'direccion', 2, { q1: Q6, q2: Q6, x: [-8, 8, 1], y: [-8, 8, 1] },
      function (v) { return '$q_1 = ' + sg(v.q1) + '\\ \\mu\\text{C}$ está en el origen y $q_2 = ' + sg(v.q2) + '\\ \\mu\\text{C}$ en $(' + v.x + ',\\ ' + v.y + ')$ cm. ¿Cuánto vale $F_y$, la componente vertical de la fuerza que $q_1$ ejerce sobre $q_2$? (Con signo.)' + KT; },
      function (v) { return fOn(v.q1, 0, 0, v.q2, v.x, v.y)[1]; }, '$F_y = F\\,(y/r)$ con el signo que da atracción o repulsión.',
      { unit: 'N', where: function (v) { return nz(v.q1, v.q2, v.x, v.y) && Math.abs(fOn(v.q1, 0, 0, v.q2, v.x, v.y)[1]) > 0.5; }, mistakes: { usedX: function (v) { return fOn(v.q1, 0, 0, v.q2, v.x, v.y)[0]; } }, feedback: fb('usedX', 'Esa es la componente $x$. Para $y$ usa $y/r$.'), setup: function (v, C2) { return C2.force({ q: v.q1 * 1e-6, x: 0, y: 0 }, { q: v.q2 * 1e-6, x: v.x / 100, y: v.y / 100 }).y; } }),
    N('di-ang', 'direccion', 3, { q1: Q6, q2: Q6, x: [-8, 8, 1], y: [-8, 8, 1] },
      function (v) { return '$q_1 = ' + sg(v.q1) + '\\ \\mu\\text{C}$ está en el origen y $q_2 = ' + sg(v.q2) + '\\ \\mu\\text{C}$ en $(' + v.x + ',\\ ' + v.y + ')$ cm. ¿Qué ángulo (de $0^\\circ$ a $360^\\circ$, desde $+x$) forma la fuerza sobre $q_2$?'; },
      function (v) { var f = fOn(v.q1, 0, 0, v.q2, v.x, v.y); return n360(Math.atan2(f[1], f[0]) * DEG); }, 'Repulsión: la misma dirección que el vector del origen a $q_2$. Atracción: la opuesta ($+180^\\circ$).',
      { unit: '°', tol: ANG, where: function (v) { return nz(v.q1, v.q2, v.x, v.y); }, setup: function (v, C2) { return C2.force({ q: v.q1 * 1e-6, x: 0, y: 0 }, { q: v.q2 * 1e-6, x: v.x / 100, y: v.y / 100 }).ang; } }),
    N('di-fx-eje', 'direccion', 1, { q1: Q6, q2: Q6, d: [2, 10, 1] },
      function (v) { return '$q_1 = ' + sg(v.q1) + '\\ \\mu\\text{C}$ está en $x = ' + v.d + '\\ \\text{cm}$ y $q_2 = ' + sg(v.q2) + '\\ \\mu\\text{C}$ en el origen. ¿Cuánto vale $F_x$ sobre $q_2$? (Positiva hacia $+x$.)' + KT; },
      function (v) { return -k * v.q1 * v.q2 * 1e-12 / Math.pow(v.d / 100, 2); }, 'Si se repelen, $q_1$ empuja a $q_2$ hacia $-x$; si se atraen, hacia $+x$.',
      { unit: 'N', where: function (v) { return nz(v.q1, v.q2); }, mistakes: { flipped: function (v) { return k * v.q1 * v.q2 * 1e-12 / Math.pow(v.d / 100, 2); } }, feedback: fb('flipped', 'Dirección al revés: $q_1$ está a la derecha de $q_2$.'), setup: function (v, C2) { return C2.force({ q: v.q1 * 1e-6, x: v.d / 100, y: 0 }, { q: v.q2 * 1e-6, x: 0, y: 0 }).x; } }),
    N('di-fy-eje', 'direccion', 1, { q1: Q6, q2: Q6, h: [2, 10, 1] },
      function (v) { return '$q_1 = ' + sg(v.q1) + '\\ \\mu\\text{C}$ está en $y = ' + v.h + '\\ \\text{cm}$ (sobre el eje $y$) y $q_2 = ' + sg(v.q2) + '\\ \\mu\\text{C}$ en el origen. ¿Cuánto vale $F_y$ sobre $q_2$? (Positiva hacia $+y$.)' + KT; },
      function (v) { return -k * v.q1 * v.q2 * 1e-12 / Math.pow(v.h / 100, 2); }, 'Si se repelen, la empuja hacia $-y$ (lejos de $q_1$); si se atraen, hacia $+y$.',
      { unit: 'N', where: function (v) { return nz(v.q1, v.q2); }, setup: function (v, C2) { return C2.force({ q: v.q1 * 1e-6, x: 0, y: v.h / 100 }, { q: v.q2 * 1e-6, x: 0, y: 0 }).y; } }),
    N('di-mag-coords', 'direccion', 1, { q1: [1, 6, 1], q2: [1, 6, 1], x: [1, 8, 1], y: [1, 8, 1] },
      function (v) { return '$q_1 = ' + v.q1 + '\\ \\mu\\text{C}$ está en el origen y $q_2 = -' + v.q2 + '\\ \\mu\\text{C}$ en $(' + v.x + ',\\ ' + v.y + ')$ cm. ¿Qué magnitud tiene la fuerza entre ellas?' + KT; },
      function (v) { return F(v.q1, v.q2, Math.hypot(v.x, v.y) / 100); }, '$r^2 = x^2 + y^2$; ya no hace falta sacar la raíz.',
      { unit: 'N', mistakes: { onlyX: function (v) { return F(v.q1, v.q2, v.x / 100); } }, where: function (v) { return v.x !== v.y; }, feedback: fb('onlyX', 'Usaste solo $x$ como distancia. $r = \\sqrt{x^2 + y^2}$.'), setup: function (v, C2) { return C2.force({ q: v.q1 * 1e-6, x: 0, y: 0 }, { q: -v.q2 * 1e-6, x: v.x / 100, y: v.y / 100 }).mag; } }),
    N('di-nc', 'direccion', 2, { q1: [1, 9, 1], q2: [1, 9, 1], x: [1, 6, 1], y: [1, 6, 1] },
      function (v) { return 'Una carga de $+' + v.q1 + '\\ \\text{nC}$ está en el origen y otra de $+' + v.q2 + '\\ \\text{nC}$ en $(-' + v.x + ',\\ ' + v.y + ')$ cm. ¿Cuánto vale $F_x$ sobre la segunda? (Con signo, en notación científica.)' + KT; },
      function (v) { var r = Math.hypot(v.x, v.y) / 100; return -k * v.q1 * v.q2 * 1e-18 / (r * r) * (v.x / 100) / r; }, 'Se repelen: la fuerza apunta del origen hacia la carga, que está a la izquierda, así que $F_x < 0$.',
      { unit: 'N', setup: function (v, C2) { return C2.net(C2.toSI([{ q: v.q1, x: 0, y: 0 }, { q: v.q2, x: -v.x, y: v.y }], 'nC'), 1).x; } }),
    N('di-unit', 'direccion', 2, { x: [-8, 8, 1], y: [-8, 8, 1] },
      function (v) { return 'Una carga positiva está en el origen y otra positiva en $(' + v.x + ',\\ ' + v.y + ')$ cm. ¿Cuánto vale la componente $x$ del vector unitario $\\hat{r}$ que da la dirección de la fuerza sobre la segunda?'; },
      function (v) { return v.x / Math.hypot(v.x, v.y); }, 'Repulsión: $\\hat{r}$ va del origen hacia la carga, $\\hat{r} = (x, y)/r$.',
      { tol: { abs: 0.01 }, where: function (v) { return nz(v.x, v.y); }, setup: function (v, C2) { var f = C2.force({ q: 1, x: 0, y: 0 }, { q: 1, x: v.x, y: v.y }); return f.x / f.mag; } }),

    /* ---------------- En línea ---------------- */
    N('li-medio', 'linea', 2, { q1: Q6, q2: Q6, q3: Q6, d1: D8, d2: D8 },
      function (v) { return 'Sobre el eje $x$: $q_1 = ' + sg(v.q1) + '\\ \\mu\\text{C}$ en $x = 0$, $q_2 = ' + sg(v.q2) + '\\ \\mu\\text{C}$ en $x = ' + v.d1 + '$ cm y $q_3 = ' + sg(v.q3) + '\\ \\mu\\text{C}$ en $x = ' + (v.d1 + v.d2) + '$ cm. ¿Cuánto vale la fuerza neta sobre $q_2$? (Con signo, positiva hacia $+x$.)' + KT; },
      function (v) { return lin(v).F; }, 'Cada fuerza con su signo según empuje o jale a $q_2$, y luego se suman.',
      { unit: 'N', where: function (v) { return nz(v.q1, v.q2, v.q3) && Math.abs(lin(v).F) > 0.5; }, mistakes: { addMags: function (v) { var l = lin(v); return Math.abs(l.F1) + Math.abs(l.F3); } }, feedback: fb('addMags', 'Sumaste magnitudes; ponles signo según su dirección.'), setup: function (v, C2) { return netSI(C2, linList(v), 1).x; } }),
    N('li-extremo', 'linea', 2, { q1: Q6, q2: Q6, q3: Q6, d1: D8, d2: D8 },
      function (v) { return 'Sobre el eje $x$: $q_1 = ' + sg(v.q1) + '\\ \\mu\\text{C}$ en $x = 0$, $q_2 = ' + sg(v.q2) + '\\ \\mu\\text{C}$ en $x = ' + v.d1 + '$ cm y $q_3 = ' + sg(v.q3) + '\\ \\mu\\text{C}$ en $x = ' + (v.d1 + v.d2) + '$ cm. ¿Cuánto vale la fuerza neta sobre $q_3$, la de la derecha? (Con signo.)' + KT; },
      function (v) { return k * v.q3 * 1e-12 * (v.q1 / Math.pow((v.d1 + v.d2) / 100, 2) + v.q2 / Math.pow(v.d2 / 100, 2)); }, 'Las dos cargas están a la izquierda de $q_3$: si repelen, empujan hacia $+x$. Ojo: $r$ de $q_1$ a $q_3$ es $d_1 + d_2$.',
      { unit: 'N', where: function (v) { return nz(v.q1, v.q2, v.q3) && Math.abs(k * v.q3 * 1e-12 * (v.q1 / Math.pow((v.d1 + v.d2) / 100, 2) + v.q2 / Math.pow(v.d2 / 100, 2))) > 0.5; },
        mistakes: { wrongR: function (v) { return k * v.q3 * 1e-12 * (v.q1 / Math.pow(v.d1 / 100, 2) + v.q2 / Math.pow(v.d2 / 100, 2)); } }, feedback: fb('wrongR', 'Usaste $d_1$ como distancia de $q_1$ a $q_3$; es $d_1 + d_2$.'), setup: function (v, C2) { return netSI(C2, linList(v), 2).x; } }),
    N('li-izq', 'linea', 2, { q1: Q6, q2: Q6, q3: Q6, d1: D8, d2: D8 },
      function (v) { return 'En el eje $x$: $q_1 = ' + sg(v.q1) + '\\ \\mu\\text{C}$ en $x = 0$, $q_2 = ' + sg(v.q2) + '\\ \\mu\\text{C}$ en $x = ' + v.d1 + '$ cm y $q_3 = ' + sg(v.q3) + '\\ \\mu\\text{C}$ en $x = ' + (v.d1 + v.d2) + '$ cm. ¿Cuánto vale $F_x$ neta sobre $q_1$?' + KT; },
      function (v) { return -k * v.q1 * 1e-12 * (v.q2 / Math.pow(v.d1 / 100, 2) + v.q3 / Math.pow((v.d1 + v.d2) / 100, 2)); }, 'Las otras dos están a la derecha: si repelen, empujan a $q_1$ hacia $-x$.',
      { unit: 'N', where: function (v) { return nz(v.q1, v.q2, v.q3) && Math.abs(k * v.q1 * 1e-12 * (v.q2 / Math.pow(v.d1 / 100, 2) + v.q3 / Math.pow((v.d1 + v.d2) / 100, 2))) > 0.5; }, setup: function (v, C2) { return netSI(C2, linList(v), 0).x; } }),
    N('li-misma-dir', 'linea', 1, { Q: [1, 5, 1], a: [2, 5, 1], b: [6, 10, 1] },
      function (v) { return 'Una carga de $+' + v.Q + '\\ \\mu\\text{C}$ está en el origen. A su izquierda hay dos cargas de $+2\\ \\mu\\text{C}$, en $x = -' + v.a + '$ cm y $x = -' + v.b + '$ cm. ¿Cuánto vale la fuerza neta sobre la del origen (magnitud)?' + KT; },
      function (v) { return F(v.Q, 2, v.a / 100) + F(v.Q, 2, v.b / 100); }, 'Las dos la empujan hacia $+x$: aquí sí se suman las magnitudes.',
      { unit: 'N', setup: function (v, C2) { return netSI(C2, [{ q: v.Q, x: 0, y: 0 }, { q: 2, x: -v.a, y: 0 }, { q: 2, x: -v.b, y: 0 }], 0).mag; } }),
    N('li-opuestas', 'linea', 1, { Q: [1, 5, 1], q1: [1, 9, 1], q2: [1, 9, 1], d: [2, 10, 1] },
      function (v) { return 'Una carga de $+' + v.Q + '\\ \\mu\\text{C}$ está en el origen, entre $+' + v.q1 + '\\ \\mu\\text{C}$ en $x = -' + v.d + '$ cm y $+' + v.q2 + '\\ \\mu\\text{C}$ en $x = +' + v.d + '$ cm. ¿Qué magnitud tiene la fuerza neta sobre ella?' + KT; },
      function (v) { return k * v.Q * Math.abs(v.q1 - v.q2) * 1e-12 / Math.pow(v.d / 100, 2); }, 'Empujan en sentidos opuestos a la misma distancia: queda la diferencia.',
      { unit: 'N', where: function (v) { return v.q1 !== v.q2; }, mistakes: { added: function (v) { return k * v.Q * (v.q1 + v.q2) * 1e-12 / Math.pow(v.d / 100, 2); } }, feedback: fb('added', 'Las dos repelen pero hacia lados contrarios: se restan.'), setup: function (v, C2) { return netSI(C2, [{ q: v.Q, x: 0, y: 0 }, { q: v.q1, x: -v.d, y: 0 }, { q: v.q2, x: v.d, y: 0 }], 0).mag; } }),
    N('li-tercera', 'linea', 3, { q1: [1, 9, 1], d1: D8, d2: D8 },
      function (v) { return 'En el eje $x$: $q_1 = +' + v.q1 + '\\ \\mu\\text{C}$ en $x = 0$ y una carga $q_2$ cualquiera en $x = ' + v.d1 + '$ cm. ¿Qué carga positiva $q_3$ (en $\\mu$C) hay que poner en $x = ' + (v.d1 + v.d2) + '$ cm para que la fuerza neta sobre $q_2$ sea cero?'; },
      function (v) { return v.q1 * Math.pow(v.d2 / v.d1, 2); }, 'Iguala $kq_1q_2/d_1^2 = kq_3q_2/d_2^2$: $q_3 = q_1(d_2/d_1)^2$. El valor de $q_2$ se cancela.',
      { unit: 'μC', where: function (v) { return v.d1 !== v.d2; }, mistakes: { noSquare: function (v) { return v.q1 * v.d2 / v.d1; } }, feedback: fb('noSquare', 'Las distancias van al cuadrado.'), setup: function (v, C2) { return solve(function (q3) { return C2.lineForce([{ q: v.q1 * 1e-6, x: 0 }, { q: 1e-6, x: v.d1 / 100 }, { q: q3 * 1e-6, x: (v.d1 + v.d2) / 100 }], 1); }, 1e-6, 1e4); } }),
    N('li-cuatro', 'linea', 3, { q1: Q6, q2: Q6, q3: Q6, q4: Q6, d: [2, 5, 1] },
      function (v) { return 'Cuatro cargas en el eje $x$, separadas $' + v.d + '$ cm entre vecinas: $' + sg(v.q1) + '$, $' + sg(v.q2) + '$, $' + sg(v.q3) + '$ y $' + sg(v.q4) + '\\ \\mu\\text{C}$ (de izquierda a derecha). ¿Cuánto vale $F_x$ neta sobre la segunda?' + KT; },
      function (v) { var D = v.d / 100; return k * v.q2 * 1e-12 * (v.q1 / (D * D) - v.q3 / (D * D) - v.q4 / (4 * D * D)); }, 'La de la izquierda empuja hacia $+x$ si repele; las de la derecha, hacia $-x$. La cuarta está a $2d$.',
      { unit: 'N', where: function (v) { var D = v.d / 100; return nz(v.q1, v.q2, v.q3, v.q4) && Math.abs(k * v.q2 * 1e-12 * (v.q1 / (D * D) - v.q3 / (D * D) - v.q4 / (4 * D * D))) > 0.5; }, setup: function (v, C2) { return netSI(C2, [{ q: v.q1, x: 0, y: 0 }, { q: v.q2, x: v.d, y: 0 }, { q: v.q3, x: 2 * v.d, y: 0 }, { q: v.q4, x: 3 * v.d, y: 0 }], 1).x; } }),
    N('li-nc', 'linea', 2, { a: [1, 9, 1], b: [1, 9, 1], c: [1, 9, 1], L: [2, 6, 1] },
      function (v) { return 'Tres cargas en línea, separadas $' + v.L + '$ cm: $+' + v.a + '\\ \\text{nC}$, $-' + v.b + '\\ \\text{nC}$ y $+' + v.c + '\\ \\text{nC}$. ¿Qué magnitud tiene la fuerza neta sobre la de en medio? (Notación científica.)' + KT; },
      function (v) { return k * v.b * Math.abs(v.a - v.c) * 1e-18 / Math.pow(v.L / 100, 2); }, 'Las dos de los extremos la atraen hacia lados opuestos a la misma distancia: queda la diferencia.',
      { unit: 'N', where: function (v) { return v.a !== v.c; }, setup: function (v, C2) { return netSI(C2, [{ q: v.a, x: 0, y: 0 }, { q: -v.b, x: v.L, y: 0 }, { q: v.c, x: 2 * v.L, y: 0 }], 1, 'nC').mag; } }),
    N('li-metros', 'linea', 2, { q1: [1, 9, 1], q2: [1, 9, 1], q3: [1, 9, 1], L1: [0.5, 2, 0.5], L2: [0.5, 2, 0.5] },
      function (v) { return 'En una recta: $+' + v.q1 + '\\ \\mu\\text{C}$ en $x = 0$, $-' + v.q2 + '\\ \\mu\\text{C}$ en $x = ' + v.L1 + '$ m y $-' + v.q3 + '\\ \\mu\\text{C}$ en $x = ' + (v.L1 + v.L2) + '$ m. ¿Cuánto vale $F_x$ neta sobre la carga del medio?' + KT; },
      function (v) { return -k * v.q2 * 1e-12 * (v.q1 / (v.L1 * v.L1) + v.q3 / (v.L2 * v.L2)); }, 'La primera la atrae hacia $-x$ y la tercera la repele hacia $-x$: las dos apuntan igual.',
      { unit: 'N', mistakes: { flipped: function (v) { return k * v.q2 * 1e-12 * (v.q1 / (v.L1 * v.L1) + v.q3 / (v.L2 * v.L2)); } }, feedback: fb('flipped', 'Dirección al revés: las dos fuerzas apuntan hacia $-x$.'), setup: function (v, C2) { return C2.lineForce([{ q: v.q1 * 1e-6, x: 0 }, { q: -v.q2 * 1e-6, x: v.L1 }, { q: -v.q3 * 1e-6, x: v.L1 + v.L2 }], 1); } }),
    N('li-cm', 'linea', 2, { q1: [1, 9, 1], q2: [1, 9, 1], d: [2, 10, 1] },
      function (v) { return 'Una carga de $+' + v.q1 + '\\ \\mu\\text{C}$ está en $x = 0$ y otra de $-' + v.q2 + '\\ \\mu\\text{C}$ en $x = ' + v.d + '$ cm. ¿Cuánto vale $F_x$ sobre la primera?' + KT; },
      function (v) { return F(v.q1, v.q2, v.d / 100); }, 'Se atraen: la de la izquierda es jalada hacia $+x$.',
      { unit: 'N', mistakes: { flipped: function (v) { return -F(v.q1, v.q2, v.d / 100); }, cm: function (v) { return F(v.q1, v.q2, v.d); } }, feedback: [{ when: 'flipped', say: 'Signos opuestos se atraen: la jala hacia la otra carga, hacia $+x$.' }, { when: 'cm', say: 'Pasa los cm a m.' }], setup: function (v, C2) { return C2.lineForce([{ q: v.q1 * 1e-6, x: 0 }, { q: -v.q2 * 1e-6, x: v.d / 100 }], 0); } }),

    /* ---------------- En el plano ---------------- */
    N('pl-mag', 'plano', 2, PLA, function (v) { return plaText(v) + ' ¿Qué magnitud tiene la fuerza neta sobre $q_1$?' + KT; },
      function (v) { return pla(v).mag; }, 'Una fuerza va sobre $x$ y otra sobre $y$: Pitágoras.',
      { unit: 'N', where: plaOk, mistakes: { addMags: function (v) { var p = pla(v); return Math.abs(p.Fx) + Math.abs(p.Fy); } }, feedback: fb('addMags', 'Son perpendiculares: $\\sqrt{F_x^2 + F_y^2}$, no la suma.'), setup: function (v, C2) { return netSI(C2, plaList(v), 0).mag; } }),
    N('pl-fx', 'plano', 2, PLA, function (v) { return plaText(v) + ' ¿Cuánto vale $F_x$ de la fuerza neta sobre $q_1$? (Con signo.)' + KT; },
      function (v) { return pla(v).Fx; }, 'Solo $q_2$, que está sobre el eje $x$, aporta componente $x$.',
      { unit: 'N', where: plaOk, mistakes: { flipped: function (v) { return -pla(v).Fx; } }, feedback: fb('flipped', 'El signo está al revés: ¿$q_2$ jala o empuja a $q_1$?'), setup: function (v, C2) { return netSI(C2, plaList(v), 0).x; } }),
    N('pl-fy', 'plano', 2, PLA, function (v) { return plaText(v) + ' ¿Cuánto vale la componente $y$ de la fuerza neta sobre $q_1$? (Con signo.)' + KT; },
      function (v) { return pla(v).Fy; }, 'Solo $q_3$ aporta componente $y$: si repele, empuja a $q_1$ hacia $-y$.',
      { unit: 'N', where: plaOk, mistakes: { flipped: function (v) { return -pla(v).Fy; } }, feedback: fb('flipped', 'El signo está al revés: $q_3$ está arriba de $q_1$.'), setup: function (v, C2) { return netSI(C2, plaList(v), 0).y; } }),
    N('pl-ang', 'plano', 3, PLA, function (v) { return plaText(v) + ' ¿Qué ángulo forma la fuerza neta sobre $q_1$ con $+x$ (de $0^\\circ$ a $360^\\circ$)?'; },
      function (v) { return pla(v).ang; }, '$\\theta$ con $\\arctan(F_y/F_x)$, corregido según el cuadrante.',
      { unit: '°', tol: ANG, where: plaOk, setup: function (v, C2) { return netSI(C2, plaList(v), 0).ang; } }),
    N('pl-cuadrado', 'plano', 3, { q: [1, 9, 1], a: [2, 10, 1] },
      function (v) { return 'Cuatro cargas iguales de $+' + v.q + '\\ \\mu\\text{C}$ están en las esquinas de un cuadrado de $' + v.a + '$ cm de lado. ¿Qué magnitud tiene la fuerza neta sobre una de ellas?' + KT; },
      function (v) { return F(v.q, v.q, v.a / 100) * (Math.SQRT2 + 0.5); }, 'Las dos vecinas dan $F$ perpendiculares ($\\sqrt{2}F$) y la de la diagonal $F/2$ en la misma dirección.',
      { unit: 'N', mistakes: { noDiag: function (v) { return F(v.q, v.q, v.a / 100) * Math.SQRT2; } }, feedback: fb('noDiag', 'Te faltó la carga de la esquina opuesta, a $a\\sqrt{2}$.'), setup: function (v, C2) { return netSI(C2, [{ q: v.q, x: 0, y: 0 }, { q: v.q, x: v.a, y: 0 }, { q: v.q, x: 0, y: v.a }, { q: v.q, x: v.a, y: v.a }], 0).mag; } }),
    N('pl-equilatero', 'plano', 2, { q: [1, 9, 1], a: [2, 10, 1] },
      function (v) { return 'Tres cargas iguales de $+' + v.q + '\\ \\mu\\text{C}$ están en los vértices de un triángulo equilátero de $' + v.a + '$ cm de lado. ¿Qué magnitud tiene la fuerza neta sobre cada una?' + KT; },
      function (v) { return Math.sqrt(3) * F(v.q, v.q, v.a / 100); }, 'Dos fuerzas iguales a $60^\\circ$: suman $2F\\cos 30^\\circ = \\sqrt{3}F$.',
      { unit: 'N', mistakes: { addMags: function (v) { return 2 * F(v.q, v.q, v.a / 100); } }, feedback: fb('addMags', 'Forman $60^\\circ$: no se suman las magnitudes.'), setup: function (v, C2) { return netSI(C2, [{ q: v.q, x: 0, y: 0 }, { q: v.q, x: v.a, y: 0 }, { q: v.q, x: v.a / 2, y: v.a * Math.sqrt(3) / 2 }], 2).mag; } }),
    N('pl-eq-signos', 'plano', 3, { q: [1, 9, 1], a: [2, 10, 1] },
      function (v) { return 'Un triángulo equilátero de $' + v.a + '$ cm tiene $+' + v.q + '\\ \\mu\\text{C}$ arriba, $+' + v.q + '\\ \\mu\\text{C}$ abajo a la izquierda y $-' + v.q + '\\ \\mu\\text{C}$ abajo a la derecha. ¿Qué magnitud tiene la fuerza neta sobre la de arriba?' + KT; },
      function (v) { return F(v.q, v.q, v.a / 100); }, 'Las componentes verticales se cancelan y las horizontales suman $2F\\cos 60^\\circ = F$.',
      { unit: 'N', mistakes: { sqrt3: function (v) { return Math.sqrt(3) * F(v.q, v.q, v.a / 100); } }, feedback: fb('sqrt3', 'Ese sería el caso con las tres positivas; aquí una atrae y la otra repele.'), setup: function (v, C2) { return netSI(C2, [{ q: v.q, x: 0, y: 0 }, { q: -v.q, x: v.a, y: 0 }, { q: v.q, x: v.a / 2, y: v.a * Math.sqrt(3) / 2 }], 2).mag; } }),
    N('pl-diagonal', 'plano', 2, { q1: [1, 9, 1], q2: [1, 9, 1], a: [2, 8, 1] },
      function (v) { return '$q_1 = +' + v.q1 + '\\ \\mu\\text{C}$ está en el origen y $q_2 = -' + v.q2 + '\\ \\mu\\text{C}$ en $(' + v.a + ',\\ ' + v.a + ')$ cm. ¿Cuánto vale $F_x$ sobre $q_1$?' + KT; },
      function (v) { return F(v.q1, v.q2, v.a * Math.SQRT2 / 100) / Math.SQRT2; }, '$r^2 = 2a^2$ y la fuerza (atracción) va a $45^\\circ$: $F_x = F\\cos 45^\\circ$.',
      { unit: 'N', mistakes: { noDiag: function (v) { return F(v.q1, v.q2, v.a / 100) / Math.SQRT2; } }, feedback: fb('noDiag', 'La distancia es la diagonal, $a\\sqrt{2}$, no $a$.'), setup: function (v, C2) { return netSI(C2, [{ q: v.q1, x: 0, y: 0 }, { q: -v.q2, x: v.a, y: v.a }], 0).x; } }),
    N('pl-general', 'plano', 3, { q2: Q6, q3: Q6, x2: [1, 6, 1], y2: [1, 6, 1], x3: [-6, -1, 1], y3: [1, 6, 1] },
      function (v) { return 'Una carga de $+2\\ \\mu\\text{C}$ está en el origen. Otra de $' + sg(v.q2) + '\\ \\mu\\text{C}$ está en $(' + v.x2 + ',\\ -' + v.y2 + ')$ cm y una tercera de $' + sg(v.q3) + '\\ \\mu\\text{C}$ en $(' + v.x3 + ',\\ ' + v.y3 + ')$ cm. ¿Cuánto vale $F_x$ neta sobre la del origen?' + KT; },
      function (v) { return fOn(v.q2, v.x2, -v.y2, 2, 0, 0)[0] + fOn(v.q3, v.x3, v.y3, 2, 0, 0)[0]; }, 'Para cada carga: magnitud, dirección (unitario de la otra carga al origen) y su componente $x$; luego suma.',
      { unit: 'N', where: function (v) { return nz(v.q2, v.q3) && Math.abs(fOn(v.q2, v.x2, -v.y2, 2, 0, 0)[0] + fOn(v.q3, v.x3, v.y3, 2, 0, 0)[0]) > 0.5; }, setup: function (v, C2) { return netSI(C2, [{ q: 2, x: 0, y: 0 }, { q: v.q2, x: v.x2, y: -v.y2 }, { q: v.q3, x: v.x3, y: v.y3 }], 0).x; } }),
    N('pl-perp', 'plano', 1, { F1: [2, 40, 2], F2: [2, 40, 2] },
      function (v) { return 'Sobre una carga actúan dos fuerzas eléctricas perpendiculares: $' + v.F1 + '\\ \\text{N}$ hacia $+x$ y $' + v.F2 + '\\ \\text{N}$ hacia $+y$. ¿Qué magnitud tiene la fuerza neta?'; },
      function (v) { return Math.hypot(v.F1, v.F2); }, 'Pitágoras: $\\sqrt{F_1^2 + F_2^2}$.',
      { unit: 'N', mistakes: { sum: function (v) { return v.F1 + v.F2; } }, feedback: fb('sum', 'Sumaste magnitudes de fuerzas perpendiculares.'), setup: function (v, C2) { return C2.vec(v.F1, v.F2).mag; } }),
    N('pl-perp-ang', 'plano', 2, { F1: [-40, 40, 4], F2: [-40, 40, 4] },
      function (v) { return 'La fuerza neta sobre una carga tiene $F_x = ' + v.F1 + '\\ \\text{N}$ y $F_y = ' + v.F2 + '\\ \\text{N}$. ¿Qué ángulo forma con $+x$ (de $0^\\circ$ a $360^\\circ$)?'; },
      function (v) { return n360(Math.atan2(v.F2, v.F1) * DEG); }, 'Arco tangente y corrección por cuadrante.',
      { unit: '°', tol: ANG, where: function (v) { return v.F1 < 0 && v.F2 !== 0; }, mistakes: { raw: function (v) { return Math.atan(v.F2 / v.F1) * DEG; } }, feedback: fb('raw', 'Con $F_x < 0$ suma $180^\\circ$ a lo que da la calculadora.'), setup: function (v, C2) { return C2.vec(v.F1, v.F2).ang; } }),
    N('pl-isosceles', 'plano', 3, { Q: [1, 6, 1], q: [1, 6, 1], a: [2, 6, 1], b: [2, 8, 1] },
      function (v) { return 'Dos cargas de $+' + v.q + '\\ \\mu\\text{C}$ están en $(\\pm' + v.a + ',\\ 0)$ cm y una de $+' + v.Q + '\\ \\mu\\text{C}$ en $(0,\\ ' + v.b + ')$ cm. ¿Qué magnitud tiene la fuerza neta sobre esta última?' + KT; },
      function (v) { var r2 = (v.a * v.a + v.b * v.b) / 1e4, r = Math.sqrt(r2); return 2 * k * v.q * v.Q * 1e-12 / r2 * (v.b / 100) / r; }, 'Por simetría las componentes $x$ se cancelan; las $y$ suman $2F\\,(b/r)$.',
      { unit: 'N', mistakes: { noCos: function (v) { return 2 * k * v.q * v.Q * 1e-12 / ((v.a * v.a + v.b * v.b) / 1e4); } }, feedback: fb('noCos', 'Solo sobreviven las componentes $y$: multiplica por $b/r$.'), setup: function (v, C2) { return netSI(C2, [{ q: v.q, x: -v.a, y: 0 }, { q: v.q, x: v.a, y: 0 }, { q: v.Q, x: 0, y: v.b }], 2).mag; } }),
    N('pl-dipolo', 'plano', 3, { Q: [1, 6, 1], q: [1, 6, 1], a: [2, 6, 1], b: [2, 8, 1] },
      function (v) { return 'Hay $+' + v.q + '\\ \\mu\\text{C}$ en $(-' + v.a + ',\\ 0)$ cm, $-' + v.q + '\\ \\mu\\text{C}$ en $(' + v.a + ',\\ 0)$ cm y $+' + v.Q + '\\ \\mu\\text{C}$ en $(0,\\ ' + v.b + ')$ cm. ¿Qué magnitud tiene la fuerza neta sobre esta última?' + KT; },
      function (v) { var r2 = (v.a * v.a + v.b * v.b) / 1e4, r = Math.sqrt(r2); return 2 * k * v.q * v.Q * 1e-12 / r2 * (v.a / 100) / r; }, 'Ahora se cancelan las componentes $y$ y las $x$ suman $2F\\,(a/r)$, hacia la carga negativa.',
      { unit: 'N', setup: function (v, C2) { return netSI(C2, [{ q: v.q, x: -v.a, y: 0 }, { q: -v.q, x: v.a, y: 0 }, { q: v.Q, x: 0, y: v.b }], 2).mag; } }),
    N('pl-nc', 'plano', 2, { q1: [1, 9, 1], q2: [1, 9, 1], q3: [1, 9, 1], a: D8, b: D8 },
      function (v) { return '$+' + v.q1 + '\\ \\text{nC}$ está en el origen, $+' + v.q2 + '\\ \\text{nC}$ en $(' + v.a + ',\\ 0)$ cm y $-' + v.q3 + '\\ \\text{nC}$ en $(0,\\ ' + v.b + ')$ cm. ¿Qué magnitud tiene la fuerza neta sobre la del origen? (Notación científica.)' + KT; },
      function (v) { return Math.hypot(F(v.q1, v.q2, v.a / 100, 1e-9), F(v.q1, v.q3, v.b / 100, 1e-9)); }, 'Las dos fuerzas son perpendiculares; con nC usa $10^{-9}$.',
      { unit: 'N', setup: function (v, C2) { return netSI(C2, [{ q: v.q1, x: 0, y: 0 }, { q: v.q2, x: v.a, y: 0 }, { q: -v.q3, x: 0, y: v.b }], 0, 'nC').mag; } }),

    /* ---------------- Punto de equilibrio ---------------- */
    N('eq-mismo', 'equilibrio', 2, { q1: [1, 9, 1], q2: [1, 9, 1], d: [6, 20, 2] },
      function (v) { return 'Dos cargas positivas, $+' + v.q1 + '\\ \\mu\\text{C}$ en $x = 0$ y $+' + v.q2 + '\\ \\mu\\text{C}$ en $x = ' + v.d + '$ cm. ¿A qué distancia de la primera (en cm) una carga de prueba no siente fuerza?'; },
      function (v) { return v.d / (1 + Math.sqrt(v.q2 / v.q1)); }, '$q_1/x^2 = q_2/(d - x)^2$: saca raíz y despeja.',
      { unit: 'cm', where: function (v) { return v.q1 !== v.q2; }, mistakes: { noSqrt: function (v) { return v.d / (1 + v.q2 / v.q1); } }, feedback: fb('noSqrt', 'Te faltó la raíz: las distancias van al cuadrado.'), setup: function (v, C2) { return 100 * C2.equilibrium(v.q1 * 1e-6, v.q2 * 1e-6, v.d / 100); } }),
    N('eq-iguales', 'equilibrio', 1, { q: [1, 9, 1], L: [4, 30, 2] },
      function (v) { return 'Dos cargas iguales de $+' + v.q + '\\ \\mu\\text{C}$ están a $' + v.L + '$ cm. ¿A qué distancia de cualquiera de ellas (en cm) se anula la fuerza sobre una carga de prueba?'; },
      function (v) { return v.L / 2; }, 'Con cargas iguales, el punto es el de en medio.',
      { unit: 'cm', setup: function (v, C2) { return 100 * C2.equilibrium(v.q * 1e-6, v.q * 1e-6, v.L / 100); } }),
    N('eq-negativas', 'equilibrio', 2, { a: [1, 9, 1], b: [1, 9, 1], L: [10, 40, 5] },
      function (v) { return 'Dos cargas negativas, $-' + v.a + '\\ \\text{nC}$ en $x = 0$ y $-' + v.b + '\\ \\text{nC}$ en $x = ' + v.L + '$ mm. ¿En qué $x$ (en mm) la fuerza neta sobre una carga de prueba es cero?'; },
      function (v) { return v.L / (1 + Math.sqrt(v.b / v.a)); }, 'Mismo signo: entre las dos, más cerca de la más chica. Las unidades se cancelan en la razón.',
      { unit: 'mm', where: function (v) { return v.a !== v.b; }, mistakes: { fromOther: function (v) { return v.L - v.L / (1 + Math.sqrt(v.b / v.a)); } }, feedback: fb('fromOther', 'Quedaste más cerca de la carga grande; debe quedar cerca de la chica.'), setup: function (v, C2) { return 1000 * C2.equilibrium(-v.a * 1e-9, -v.b * 1e-9, v.L / 1000); } }),
    N('eq-opuestas', 'equilibrio', 3, { a: [1, 4, 1], b: [5, 9, 1], d: [4, 12, 2] },
      function (v) { return '$q_1 = +' + v.a + '\\ \\mu\\text{C}$ está en $x = 0$ y $q_2 = -' + v.b + '\\ \\mu\\text{C}$ en $x = ' + v.d + '$ cm. ¿A qué distancia de $q_1$ (en cm), del lado contrario a $q_2$, se anula la fuerza sobre una carga de prueba?'; },
      function (v) { return v.d / (Math.sqrt(v.b / v.a) - 1); }, 'Afuera, del lado de la chica: $a/x^2 = b/(x + d)^2$, así que $x = d/(\\sqrt{b/a} - 1)$.',
      { unit: 'cm', mistakes: { between: function (v) { return v.d / (1 + Math.sqrt(v.b / v.a)); } }, feedback: fb('between', 'Ese punto está entre las cargas; ahí las dos fuerzas apuntan al mismo lado.'), setup: function (v, C2) { return -100 * C2.equilibrium(v.a * 1e-6, -v.b * 1e-6, v.d / 100); } }),
    N('eq-opuestas-q2', 'equilibrio', 3, { a: [5, 9, 1], b: [1, 4, 1], d: [4, 12, 2] },
      function (v) { return '$q_1 = -' + v.a + '\\ \\mu\\text{C}$ está en $x = 0$ y $q_2 = +' + v.b + '\\ \\mu\\text{C}$ en $x = ' + v.d + '$ cm. ¿En qué $x$ (en cm) se anula la fuerza neta sobre una carga de prueba?'; },
      function (v) { return v.d + v.d / (Math.sqrt(v.a / v.b) - 1); }, 'Signos opuestos y $q_2$ más chica: el punto está a la derecha de $q_2$.',
      { unit: 'cm', setup: function (v, C2) { return 100 * C2.equilibrium(-v.a * 1e-6, v.b * 1e-6, v.d / 100); } }),
    N('eq-razon', 'equilibrio', 2, { x: [1, 9, 1], d: [10, 10, 1] },
      function (v) { return 'Dos cargas positivas están en $x = 0$ y $x = 10$ cm. Una carga de prueba queda en equilibrio en $x = ' + v.x + '$ cm. ¿Cuánto vale el cociente $q_2/q_1$?'; },
      function (v) { return Math.pow((v.d - v.x) / v.x, 2); }, 'De $q_1/x^2 = q_2/(d - x)^2$: $q_2/q_1 = ((d - x)/x)^2$.',
      { where: function (v) { return v.x !== 5; }, mistakes: { noSquare: function (v) { return (v.d - v.x) / v.x; } }, feedback: fb('noSquare', 'Las distancias van al cuadrado.'), setup: function (v, C2) { return solve(function (rr) { return C2.equilibrium(1, rr, v.d) - v.x; }, 1e-6, 1e6); } }),
    N('eq-q2', 'equilibrio', 3, { q1: [1, 9, 1], x: [2, 8, 1], d: [10, 20, 2] },
      function (v) { return '$q_1 = +' + v.q1 + '\\ \\mu\\text{C}$ está en $x = 0$ y una carga positiva $q_2$ en $x = ' + v.d + '$ cm. Si la fuerza sobre una carga de prueba se anula en $x = ' + v.x + '$ cm, ¿cuánto vale $q_2$ en $\\mu$C?'; },
      function (v) { return v.q1 * Math.pow((v.d - v.x) / v.x, 2); }, '$q_2 = q_1\\,((d - x)/x)^2$.',
      { unit: 'μC', where: function (v) { return 2 * v.x !== v.d; }, setup: function (v, C2) { return solve(function (q2) { return C2.equilibrium(v.q1, q2, v.d) - v.x; }, 1e-6, 1e6); } }),
    N('eq-medio-fuerza', 'equilibrio', 2, { q1: [1, 9, 1], q2: [1, 9, 1], d: [4, 20, 2] },
      function (v) { return 'Dos cargas positivas, $+' + v.q1 + '\\ \\mu\\text{C}$ en $x = 0$ y $+' + v.q2 + '\\ \\mu\\text{C}$ en $x = ' + v.d + '$ cm. ¿Qué magnitud tiene la fuerza sobre una carga de $+1\\ \\mu\\text{C}$ justo en medio?' + KT; },
      function (v) { return k * Math.abs(v.q1 - v.q2) * 1e-12 / Math.pow(v.d / 200, 2); }, 'En medio las dos repulsiones apuntan a lados opuestos a la misma distancia $d/2$.',
      { unit: 'N', where: function (v) { return v.q1 !== v.q2; }, mistakes: { fullD: function (v) { return k * Math.abs(v.q1 - v.q2) * 1e-12 / Math.pow(v.d / 100, 2); } }, feedback: fb('fullD', 'La distancia a cada carga es $d/2$, no $d$.'), setup: function (v, C2) { return C2.net(C2.toSI([{ q: v.q1, x: 0, y: 0 }, { q: v.q2, x: v.d, y: 0 }, { q: 1, x: v.d / 2, y: 0 }], 'uC'), 2).mag; } }),
    N('eq-cuadrante', 'equilibrio', 2, { q: [1, 9, 1], L: [4, 20, 2] },
      function (v) { return 'Cuatro cargas iguales de $+' + v.q + '\\ \\mu\\text{C}$ están en las esquinas de un cuadrado de $' + v.L + '$ cm. Si pones una carga de prueba en el centro, ¿cuántos newtons de fuerza neta siente? (Escribe 0 si se anula.)'; },
      function () { return 0; }, 'Por simetría, cada fuerza se cancela con la de la esquina opuesta.',
      { setup: function (v, C2) { var L = v.L; return Math.round(1e6 * netSI(C2, [{ q: v.q, x: 0, y: 0 }, { q: v.q, x: L, y: 0 }, { q: v.q, x: 0, y: L }, { q: v.q, x: L, y: L }, { q: 1, x: L / 2, y: L / 2 }], 4).mag) / 1e6; } }),

    N('ma-nc-m', 'magnitud', 1, { a: [1, 9, 1], b: [1, 9, 1], r: [0.1, 1, 0.1] },
      function (v) { return 'Dos cargas de $' + v.a + '\\ \\text{nC}$ y $' + v.b + '\\ \\text{nC}$ están a $' + v.r + '\\ \\text{m}$. ¿Qué fuerza se ejercen? (Notación científica.)' + KT; },
      function (v) { return F(v.a, v.b, v.r, 1e-9); }, 'Con $1\\ \\text{nC} = 10^{-9}\\ \\text{C}$ y $r$ ya en metros.',
      { unit: 'N', setup: function (v, C2) { return C2.magnitude(v.a * 1e-9, v.b * 1e-9, v.r); } }),
    N('di-comp', 'direccion', 1, { Fm: [2, 40, 2], th: [10, 80, 5] },
      function (v) { return 'La fuerza eléctrica sobre una carga mide $' + v.Fm + '\\ \\text{N}$ y apunta a $' + v.th + '^\\circ$ de $+x$. ¿Cuánto vale su componente $x$?'; },
      function (v) { return v.Fm * Math.cos(v.th * Math.PI / 180); }, '$F_x = F\\cos\\theta$, como cualquier vector.',
      { unit: 'N', mistakes: { usedSin: function (v) { return v.Fm * Math.sin(v.th * Math.PI / 180); } }, feedback: fb('usedSin', 'Con el ángulo desde $+x$, la componente $x$ lleva coseno.') }),
    N('li-dos', 'linea', 1, { qa: Q6, qb: Q6, s: [2, 10, 1] },
      function (v) { return '$q_1 = ' + sg(v.qa) + '\\ \\mu\\text{C}$ está en $x = 0$ y $q_2 = ' + sg(v.qb) + '\\ \\mu\\text{C}$ en $x = ' + v.s + '$ cm. ¿Cuánto vale $F_x$ sobre $q_2$? (Positiva hacia $+x$.)' + KT; },
      function (v) { return k * v.qa * v.qb * 1e-12 / Math.pow(v.s / 100, 2); }, 'Si se repelen, $q_2$ es empujada hacia $+x$ (lejos de $q_1$); si se atraen, hacia $-x$.',
      { unit: 'N', where: function (v) { return nz(v.qa, v.qb); }, mistakes: { flipped: function (v) { return -k * v.qa * v.qb * 1e-12 / Math.pow(v.s / 100, 2); } }, feedback: fb('flipped', 'Dirección al revés: revisa si se atraen o se repelen.'), setup: function (v, C2) { return C2.lineForce([{ q: v.qa * 1e-6, x: 0 }, { q: v.qb * 1e-6, x: v.s / 100 }], 1); } }),

    /* ---------------- Conceptuales ---------------- */
    C('k-signos-rep', 'direccion', 1, 'Dos cargas negativas cercanas…', 'se repelen', [['se atraen', 'Solo se atraen las de signo opuesto.'], ['no interactúan', 'Toda carga ejerce fuerza sobre las demás.'], ['se atraen solo si están muy cerca', 'La dirección no depende de la distancia, solo de los signos.']], 'Cargas del mismo signo se repelen, sean positivas o negativas.'),
    C('k-signos-atr', 'direccion', 1, 'Una carga positiva y una negativa…', 'se atraen', [['se repelen', 'Se repelen las del mismo signo.'], ['no se ejercen fuerza', 'Sí: la fuerza solo es cero si una de las cargas lo es.'], ['se repelen si la positiva es mayor', 'El tamaño de las cargas cambia la magnitud, no la dirección.']], 'Signos opuestos se atraen.'),
    C('k-tercera', 'magnitud', 1, 'Una carga de $10\\ \\mu\\text{C}$ y otra de $1\\ \\mu\\text{C}$ están cerca. La fuerza de la grande sobre la chica, comparada con la de la chica sobre la grande, es…', 'igual en magnitud', [['10 veces mayor', 'La fórmula usa el producto $q_1q_2$: es el mismo número para las dos.'], ['10 veces menor', 'Por la tercera ley, el par de fuerzas tiene la misma magnitud.'], ['cero, porque la chica no afecta a la grande', 'Las dos cargas se ejercen fuerza.']], 'Tercera ley de Newton: acción y reacción miden lo mismo.'),
    C('k-doble-r', 'magnitud', 1, 'Si la distancia entre dos cargas se duplica, la fuerza…', 'se reduce a la cuarta parte', [['se reduce a la mitad', 'Eso pasaría si fuera $1/r$; es $1/r^2$.'], ['se duplica', 'Más distancia da menos fuerza.'], ['no cambia', '$r$ está en el denominador.']], '$F \\propto 1/r^2$: $(2r)^2 = 4r^2$.'),
    C('k-doble-q', 'magnitud', 1, 'Si una de las dos cargas se duplica, la fuerza…', 'se duplica', [['se cuadruplica', 'Solo cambió una carga; con las dos sí sería 4 veces.'], ['no cambia', 'La fuerza es proporcional a cada carga.'], ['se reduce a la mitad', 'Más carga da más fuerza.']], '$F \\propto q_1q_2$.'),
    C('k-ambas-q', 'magnitud', 2, 'Si las dos cargas se duplican y la distancia también, la fuerza…', 'no cambia', [['se duplica', 'El numerador crece 4 veces y el denominador también.'], ['se cuadruplica', 'Falta tomar en cuenta que $r^2$ también crece 4 veces.'], ['se reduce a la cuarta parte', 'Las cargas también crecieron.']], '$(2q)(2q)/(2r)^2 = q^2/r^2$.'),
    C('k-unidades-k', 'magnitud', 2, '¿Cuáles son las unidades de $k$?', '$\\text{N·m}^2/\\text{C}^2$', [['$\\text{N·C}^2/\\text{m}^2$', 'Despeja $k = Fr^2/(q_1q_2)$.'], ['$\\text{N/C}$', 'Esas son las del campo eléctrico (S03).'], ['No tiene unidades', 'Convierte $\\text{C}^2/\\text{m}^2$ en newtons: sí tiene.']], '$k = Fr^2/(q_1q_2)$.'),
    C('k-cm', 'magnitud', 1, 'Un alumno sustituye $r = 5$ (en cm) en lugar de $0.05$ m. Su fuerza sale…', '$10^4$ veces más chica', [['100 veces más chica', 'El error de 100 se eleva al cuadrado.'], ['100 veces más grande', 'Un $r$ más grande en el denominador da una fuerza menor.'], ['igual', 'La fórmula solo funciona en SI.']], '$r$ es 100 veces mayor y va al cuadrado: $10^4$.'),
    C('k-micro', 'magnitud', 2, 'Un alumno escribe $q_1 = 3$ y $q_2 = 2$ en lugar de $3\\ \\mu\\text{C}$ y $2\\ \\mu\\text{C}$. Su fuerza sale…', '$10^{12}$ veces más grande', [['$10^{6}$ veces más grande', 'Olvidó el prefijo en las dos cargas: $10^6 \\cdot 10^6$.'], ['$10^{-12}$ veces más chica', 'Sin el prefijo los números son más grandes, no más chicos.'], ['igual', 'Los coulombs y los microcoulombs no son lo mismo.']], 'Cada carga quedó $10^6$ veces más grande.'),
    C('k-gravedad', 'magnitud', 1, 'Entre un protón y un electrón, la fuerza eléctrica comparada con la gravitacional es…', 'unas $10^{39}$ veces mayor', [['casi igual', 'La gravedad es muchísimo más débil entre partículas.'], ['menor', 'Al revés: la eléctrica domina por mucho.'], ['mayor solo si están muy cerca', 'Las dos van como $1/r^2$: el cociente no depende de la distancia.']], '$F_e/F_g = ke^2/(Gm_p m_e) \\approx 2.27 \\times 10^{39}$.'),
    C('k-gravedad-r', 'magnitud', 2, 'El cociente $F_e/F_g$ entre un protón y un electrón, al alejarlos…', 'no cambia', [['aumenta', 'Las dos fuerzas bajan con $1/r^2$.'], ['disminuye', 'Las dos fuerzas bajan con $1/r^2$; el cociente se queda igual.'], ['se vuelve cero', 'Ninguna de las dos fuerzas llega a cero.']], 'Las dos fuerzas dependen de $1/r^2$, así que $r$ se cancela.'),
    C('k-neutra', 'magnitud', 2, 'Si la fuerza eléctrica es tan fuerte, ¿por qué no la notamos entre dos personas?', 'Porque la materia es casi neutra', [['Porque solo actúa dentro del átomo', 'Actúa a cualquier distancia, como $1/r^2$.'], ['Porque la gravedad la cancela', 'La gravedad es muchísimo más débil.'], ['Porque el aire la bloquea', 'El aire la reduce poco; lo importante es que las cargas se cancelan.']], 'Las cargas positivas y negativas se compensan casi exactamente.'),
    C('k-rhat', 'direccion', 2, 'En $\\vec{F}_{12} = k\\,q_1q_2\\,\\hat{r}_{12}/r^2$, el vector $\\hat{r}_{12}$ apunta…', 'de $q_1$ hacia $q_2$', [['de $q_2$ hacia $q_1$', 'Con esa convención el signo de la fórmula quedaría al revés.'], ['siempre hacia $+x$', 'Depende de dónde estén las cargas.'], ['hacia el origen', 'El origen no tiene nada que ver con la fuerza.']], 'Con $q_1q_2 > 0$ la fuerza sobre $q_2$ lo aleja de $q_1$.'),
    C('k-signo-producto', 'direccion', 2, 'En la forma vectorial, si $q_1q_2 < 0$, la fuerza sobre $q_2$…', 'apunta hacia $q_1$', [['apunta lejos de $q_1$', 'Eso pasa con $q_1q_2 > 0$ (repulsión).'], ['es perpendicular a la línea entre ellas', 'La fuerza de Coulomb siempre va sobre la línea que las une.'], ['es cero', 'Un producto negativo no es cero.']], 'Producto negativo: atracción.'),
    C('k-linea-recta', 'direccion', 1, 'La fuerza entre dos cargas puntuales siempre apunta…', 'sobre la línea que las une', [['perpendicular a la línea que las une', 'Eso es más parecido a la fuerza magnética.'], ['hacia abajo', 'No tiene que ver con la gravedad.'], ['hacia el origen de coordenadas', 'La dirección solo depende de las dos cargas.']], 'Es una fuerza central: va de una carga a la otra.'),
    C('k-r-coords', 'direccion', 1, 'Una carga está en $(1,\\ 2)$ cm y otra en $(4,\\ 6)$ cm. ¿Qué $r$ va en Coulomb?', '5 cm', [['7 cm', 'Sumaste $\\Delta x + \\Delta y$; usa Pitágoras.'], ['$\\sqrt{52}$ cm', 'Esa es la distancia del origen a la segunda carga.'], ['$\\sqrt{5}$ cm', 'Esa es la distancia del origen a la primera.']], '$\\sqrt{3^2 + 4^2} = 5$ cm.'),
    C('k-signo-doble', 'direccion', 2, 'Un alumno calcula $F = k\\,q_1q_2/r^2$ con los signos y le sale negativa. Luego dibuja la flecha hacia la otra carga y además le pone el signo menos. ¿Qué pasó?', 'Contó el signo dos veces', [['Todo está bien', 'El signo ya indicaba atracción; ponerlo otra vez invierte la dirección.'], ['La fuerza negativa significa repulsión', 'Un producto negativo es atracción.'], ['Debió usar $1/r$', 'El error es de signo, no de la potencia.']], 'Usa la magnitud con $|q_1q_2|$ y la dirección del dibujo, o la forma vectorial: no las dos a la vez.'),
    C('k-superpos', 'plano', 1, 'El principio de superposición dice que la fuerza neta sobre una carga es…', 'la suma vectorial de las fuerzas de cada carga', [['la suma de las magnitudes', 'Las fuerzas tienen direcciones distintas.'], ['la fuerza de la carga más cercana', 'Todas contribuyen.'], ['la fuerza de la carga más grande', 'Todas contribuyen, cada una con su distancia.']], 'Cada par actúa como si las demás no existieran, y se suman como vectores.'),
    C('k-superpos-indep', 'plano', 2, 'Si agregas una tercera carga cerca de un par, la fuerza que la primera ejerce sobre la segunda…', 'no cambia', [['aumenta', 'La fuerza de un par solo depende de esas dos cargas y su distancia.'], ['disminuye', 'La tercera carga agrega su propia fuerza, pero no modifica la de las otras.'], ['se vuelve cero', 'Nada de eso.']], 'Es la idea de la superposición; lo que cambia es la fuerza <strong>neta</strong>.'),
    C('k-magsum', 'plano', 1, 'Sobre una carga actúan $3$ N hacia $+x$ y $4$ N hacia $+y$. La fuerza neta mide…', '5 N', [['7 N', 'Sumaste magnitudes de fuerzas perpendiculares.'], ['1 N', 'Restaste; eso solo vale si apuntan en sentidos opuestos.'], ['12 N', 'Multiplicaste.']], '$\\sqrt{3^2 + 4^2} = 5$.'),
    C('k-max', 'plano', 2, 'Dos fuerzas de $6$ N y $8$ N actúan sobre una carga. ¿Cuál de estos valores no puede ser la fuerza neta?', '15 N', [['2 N', 'Es posible si apuntan en sentidos opuestos.'], ['10 N', 'Es posible si son perpendiculares.'], ['14 N', 'Es posible si apuntan igual.']], 'La neta está entre $8 - 6 = 2$ y $8 + 6 = 14$ N.'),
    C('k-equilatero', 'plano', 2, 'Tres cargas iguales en un triángulo equilátero: la fuerza neta sobre una de ellas apunta…', 'hacia afuera, alejándose del centro', [['hacia el centro', 'Son del mismo signo: se repelen.'], ['a lo largo de un lado', 'Por simetría apunta por la bisectriz.'], ['no hay fuerza neta', 'Las dos fuerzas no son opuestas: forman $60^\\circ$.']], 'Las dos repulsiones forman $60^\\circ$ y su suma va por la bisectriz, hacia afuera.'),
    C('k-centro-cuadrado', 'equilibrio', 2, 'En el centro de un cuadrado con cuatro cargas iguales en las esquinas, una carga de prueba siente…', 'fuerza neta cero', [['una fuerza hacia la esquina más cercana', 'Todas las esquinas están a la misma distancia del centro.'], ['cuatro veces la fuerza de una esquina', 'Cada fuerza se cancela con la de la esquina opuesta.'], ['una fuerza que depende del signo de la carga de prueba', 'Sea cual sea el signo, las fuerzas opuestas se cancelan.']], 'Simetría: las esquinas opuestas se anulan por pares.'),
    C('k-cuadrante', 'plano', 2, 'Tu fuerza neta tiene $F_x = -3$ N y $F_y = +3$ N. ¿Qué ángulo tiene?', '$135^\\circ$', [['$-45^\\circ$', 'Ese es el de la calculadora; apunta al 4.º cuadrante.'], ['$45^\\circ$', 'Ese apunta a $+x$ y $+y$.'], ['$225^\\circ$', 'Ese tiene las dos componentes negativas.']], '$F_x < 0$, $F_y > 0$: 2.º cuadrante, $-45^\\circ + 180^\\circ$.'),
    C('k-componentes', 'plano', 1, 'Para sumar fuerzas eléctricas en el plano conviene…', 'descomponer cada una en $x$ y $y$ y sumar por separado', [['sumar las magnitudes y promediar los ángulos', 'Los ángulos no se promedian.'], ['quedarse con la más grande', 'Todas cuentan.'], ['multiplicar las magnitudes', 'Las fuerzas se suman, no se multiplican.']], 'Así se suman vectores, igual que en Física 1.'),
    C('k-linea-signo', 'linea', 1, 'En una recta, la fuerza neta sobre una carga se calcula…', 'sumando las fuerzas con su signo', [['sumando las magnitudes', 'Pueden apuntar a lados contrarios.'], ['restando siempre la menor de la mayor', 'Si apuntan igual, se suman.'], ['con la carga más cercana nada más', 'Todas las cargas contribuyen.']], 'En una dimensión, el signo es la dirección.'),
    C('k-linea-medio', 'linea', 2, 'Una carga positiva está entre dos negativas iguales, más cerca de la izquierda. La fuerza neta sobre ella apunta…', 'hacia la izquierda', [['hacia la derecha', 'La de la izquierda está más cerca y jala más fuerte.'], ['es cero', 'Solo sería cero en el punto medio.'], ['hacia arriba', 'Todas las fuerzas van sobre la recta.']], 'Las dos la atraen; gana la más cercana.'),
    C('k-linea-mismo-lado', 'linea', 2, 'Dos cargas positivas están a la izquierda de otra positiva. Sobre esta última, las dos fuerzas…', 'apuntan a la derecha y se suman', [['apuntan a la izquierda', 'Se repelen: la empujan lejos, hacia la derecha.'], ['se cancelan', 'Están del mismo lado y empujan igual.'], ['apuntan hacia arriba', 'Todo pasa sobre la recta.']], 'Repulsiones desde el mismo lado empujan en la misma dirección.'),
    C('k-linea-r', 'linea', 2, 'Tres cargas en línea a $0$, $3$ y $7$ cm. Para la fuerza de la primera sobre la tercera, $r$ vale…', '7 cm', [['4 cm', 'Esa es la distancia de la segunda a la tercera.'], ['3 cm', 'Esa es la distancia de la primera a la segunda.'], ['10 cm', 'Sumaste las posiciones.']], '$r$ es la distancia entre las dos cargas del par.'),
    C('k-linea-cancel', 'linea', 2, '¿Puede ser cero la fuerza neta sobre la carga del medio de tres cargas en línea?', 'Sí, si las fuerzas de las otras dos son iguales y opuestas', [['No, nunca', 'Si las dos la empujan (o jalan) hacia lados opuestos con la misma fuerza, se anula.'], ['Solo si la del medio es cero', 'También hay casos con la del medio cargada.'], ['Solo si las tres son iguales y equidistan', 'Ese es un caso, pero no el único.']], 'Hace falta que las magnitudes coincidan y las direcciones sean opuestas.'),
    C('k-linea-signo-medio', 'linea', 3, 'Tres cargas en línea: $+q$, $Q$ en medio y $-q$, equidistantes. Si $Q > 0$, la fuerza neta sobre $Q$…', 'apunta hacia la carga negativa', [['es cero por simetría', 'Las dos fuerzas apuntan al mismo lado: una empuja y la otra jala.'], ['apunta hacia la carga positiva', 'La positiva la empuja lejos.'], ['depende de la distancia', 'La distancia cambia la magnitud, no la dirección.']], 'La $+q$ la empuja hacia la $-q$ y la $-q$ la jala hacia sí: mismas direcciones.'),
    C('k-eq-mismo', 'equilibrio', 1, 'Con dos cargas positivas fijas, el punto donde una carga de prueba no siente fuerza está…', 'entre las dos, más cerca de la más chica', [['entre las dos, más cerca de la más grande', 'Cerca de la grande, su fuerza ganaría.'], ['afuera, del lado de la más chica', 'Afuera las dos fuerzas apuntan igual.'], ['exactamente en medio, siempre', 'Solo si las cargas son iguales.']], 'La más chica necesita estar más cerca para igualar a la grande.'),
    C('k-eq-opuestas', 'equilibrio', 2, 'Con $+q$ y $-4q$ fijas, el punto de fuerza neta cero está…', 'afuera, del lado de $+q$', [['entre las dos', 'Ahí las dos fuerzas apuntan hacia el mismo lado.'], ['afuera, del lado de $-4q$', 'Ahí siempre gana la carga grande.'], ['no existe', 'Solo no existe si las cargas tienen la misma magnitud.']], 'Hay que estar lejos de la grande y cerca de la chica.'),
    C('k-eq-iguales-op', 'equilibrio', 2, 'Con $+q$ y $-q$ fijas, ¿dónde se anula la fuerza sobre una carga de prueba (en la recta)?', 'En ningún punto', [['En el punto medio', 'En medio las dos fuerzas apuntan igual: hacia la negativa.'], ['Afuera, del lado de $+q$', 'Ahí siempre gana la más cercana, que es $+q$.'], ['Muy lejos, a la derecha', 'Siempre gana la más cercana.']], 'Con magnitudes iguales y signos opuestos, la más cercana siempre gana.'),
    C('k-eq-prueba', 'equilibrio', 1, 'El punto de equilibrio entre dos cargas fijas, ¿depende de la carga de prueba?', 'No, ni de su valor ni de su signo', [['Sí, de su valor', 'Aparece en las dos fuerzas y se cancela.'], ['Sí, de su signo', 'Si cambia el signo, cambian las dos fuerzas a la vez.'], ['Solo si es negativa', 'Tampoco.']], 'La carga de prueba se cancela al igualar.'),
    C('k-eq-raiz', 'equilibrio', 2, 'Para $q_1 = 1$ y $q_2 = 4$ (mismo signo) separadas $d$, el equilibrio está a…', '$d/3$ de $q_1$', [['$d/5$ de $q_1$', 'Olvidaste la raíz: $\\sqrt{4} = 2$, no 4.'], ['$d/2$', 'Eso sería con cargas iguales.'], ['$2d/3$ de $q_1$', 'Esa es la distancia desde $q_2$.']], '$x = d/(1 + \\sqrt{4}) = d/3$.'),
    C('k-eq-estable', 'equilibrio', 3, 'Entre dos cargas positivas fijas, una carga de prueba positiva en el punto de equilibrio se mueve un poco hacia la derecha (sobre la recta). ¿Qué pasa?', 'La empujan de regreso hacia el punto', [['Se aleja cada vez más', 'Al acercarse a la carga de la derecha, esa la repele más fuerte.'], ['Se queda en su nueva posición', 'Fuera del punto, la fuerza neta ya no es cero.'], ['Sale disparada hacia arriba', 'Sobre la recta las fuerzas son horizontales.']], 'Al acercarse a una carga, su repulsión crece y la regresa.'),
    C('k-formula-vec', 'direccion', 3, '¿Cuál expresión da el vector fuerza sobre $q_2$ debido a $q_1$, con $\\vec{r} = \\vec{r}_2 - \\vec{r}_1$?', '$k\\,q_1q_2\\,\\vec{r}/|\\vec{r}|^3$', [['$k\\,q_1q_2\\,\\vec{r}/|\\vec{r}|^2$', 'Así la magnitud quedaría $\\propto 1/r$; hay que dividir otra vez entre $r$ para tener un unitario.'], ['$k\\,|q_1q_2|\\,\\vec{r}/|\\vec{r}|^3$', 'Con valor absoluto siempre saldría repulsión.'], ['$k\\,q_1q_2\\,(-\\vec{r})/|\\vec{r}|^3$', 'Ese signo invierte atracción y repulsión.']], '$\\hat{r} = \\vec{r}/|\\vec{r}|$, así que $\\hat{r}/r^2 = \\vec{r}/r^3$.'),
    C('k-k-eps', 'magnitud', 3, '¿Cómo se relaciona $k$ con $\\varepsilon_0 = 8.85 \\times 10^{-12}\\ \\text{C}^2/(\\text{N·m}^2)$?', '$k = 1/(4\\pi\\varepsilon_0)$', [['$k = 4\\pi\\varepsilon_0$', 'Eso da un número diminuto, no $9 \\times 10^9$.'], ['$k = \\varepsilon_0/(4\\pi)$', 'Las unidades quedarían al revés.'], ['$k = 1/\\varepsilon_0$', 'Falta el $4\\pi$.']], '$1/(4\\pi \\cdot 8.85 \\times 10^{-12}) \\approx 8.99 \\times 10^9$.'),
    C('k-tres-plano', 'plano', 3, 'Una carga $+q$ está en el origen, $-q$ en $(a, 0)$ y $+q$ en $(0, a)$. La fuerza neta sobre la del origen apunta…', 'hacia el 4.º cuadrante ($+x$, $-y$)', [['hacia el 1.er cuadrante', 'La de $(0, a)$ la repele hacia $-y$.'], ['hacia el 2.º cuadrante', 'La de $(a, 0)$ la atrae hacia $+x$.'], ['hacia el 3.er cuadrante', 'La de $(a, 0)$ la atrae, no la repele.']], 'Atracción hacia $+x$ y repulsión hacia $-y$.')
  ];

  K.register({
    'f2.S02.magnitud': 'Magnitud de la fuerza de Coulomb',
    'f2.S02.direccion': 'Dirección y componentes',
    'f2.S02.linea': 'Superposición en una línea',
    'f2.S02.plano': 'Superposición en el plano',
    'f2.S02.equilibrio': 'Punto de equilibrio'
  }, Q);
})();
