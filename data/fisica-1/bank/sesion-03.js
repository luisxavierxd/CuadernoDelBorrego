/* =====================================================================
   Banco · Física 1 · S03 · Vector unitario, producto escalar y producto
   vectorial. 100 preguntas propias.
   ===================================================================== */
(function () {
  var K = window.CBBankKit('f1', '03'), C = K.C;
  var RAD = Math.PI / 180, DEG = 180 / Math.PI;
  function N(id, sub, d, vars, prompt, answer, why, o) {
    o = o || {};
    var q = K.N(id, sub, d, vars, prompt, answer, why, o);
    if (o.mistakes) {
      var base = o.where;
      q.where = function (v) {
        if (base && !base(v)) return false;
        var vals = [answer(v)].concat(Object.keys(o.mistakes).map(function (k) { return o.mistakes[k](v); }));
        for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
          if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 1)) return false;
        }
        return true;
      };
    }
    return q;
  }
  function fb(key, say) { return [{ when: key, say: say }]; }
  function v3(a, b, c) { return '(' + a + ',\\ ' + b + ',\\ ' + c + ')'; }
  function v2(a, b) { return '(' + a + ',\\ ' + b + ')'; }
  function dot3(v) { return v.a1 * v.b1 + v.a2 * v.b2 + v.a3 * v.b3; }
  function m3(a, b, c) { return Math.sqrt(a * a + b * b + c * c); }
  var I9 = [-6, 6, 1], ANG = { abs: 0.5 }, EXACT = { abs: 0.01 };
  var nz3 = function (v) { return v.a1 * v.a2 * v.a3 * v.b1 * v.b2 * v.b3 !== 0; };
  var nz2 = function (v) { return v.ax * v.ay * v.bx * v.by !== 0; };

  var Q = [
    /* ---------------- Vector unitario y magnitud ---------------- */
    N('un-mag3d', 'unitario', 1, { a: [-9, 9, 1], b: [-9, 9, 1], c: [-9, 9, 1] }, function (v) { return '¿Cuánto mide $\\vec{A} = ' + v3(v.a, v.b, v.c) + '$?'; },
      function (v) { return m3(v.a, v.b, v.c); }, '$|\\vec{A}| = \\sqrt{A_x^2 + A_y^2 + A_z^2}$.', { where: function (v) { return v.a * v.b * v.c !== 0; } }),
    N('un-x', 'unitario', 2, { p: [1, 9, 1], q: [1, 9, 1], r: [1, 9, 1] }, function (v) { return '¿Cuánto vale la componente $x$ del vector unitario en la dirección de $' + v3(v.p, v.q, v.r) + '$?'; },
      function (v) { return v.p / m3(v.p, v.q, v.r); }, '$\\hat{A} = \\vec{A}/|\\vec{A}|$: divide cada componente entre la magnitud.',
      { tol: { abs: 0.002 }, where: function (v) { return !(v.p === v.q && v.q === v.r); }, mistakes: { sumNorm: function (v) { return v.p / (v.p + v.q + v.r); } }, feedback: fb('sumNorm', 'Dividiste entre la suma de componentes; hay que dividir entre la magnitud.') }),
    N('un-z', 'unitario', 2, { p: [1, 9, 1], q: [1, 9, 1], r: [1, 9, 1] }, function (v) { return 'Calcula la componente $z$ de $\\hat{A}$ si $\\vec{A} = ' + v3(v.p, v.q, v.r) + '$.'; },
      function (v) { return v.r / m3(v.p, v.q, v.r); }, 'Componente entre magnitud.', { tol: { abs: 0.002 } }),
    N('un-2d', 'unitario', 1, { ux: [1, 12, 1], uy: [1, 12, 1] }, function (v) { return '¿Cuánto vale la componente $y$ del vector unitario en la dirección de $' + v2(v.ux, v.uy) + '$?'; },
      function (v) { return v.uy / Math.hypot(v.ux, v.uy); }, '$\\hat{u}_y = u_y/|\\vec{u}|$.', { tol: { abs: 0.002 } }),
    N('un-escala', 'unitario', 2, { M: [2, 20, 1], a: [1, 9, 1], b: [1, 9, 1] }, function (v) { return 'Un vector mide $' + v.M + '$ y apunta en la dirección de $' + v2(v.a, v.b) + '$. ¿Cuánto vale su componente $x$?'; },
      function (v) { return v.M * v.a / Math.hypot(v.a, v.b); }, 'Primero el unitario de la dirección y luego multiplica por la magnitud.', { mistakes: { noNorm: function (v) { return v.M * v.a; } }, feedback: fb('noNorm', 'Multiplicaste por $(a, b)$ sin normalizar: primero divide entre su magnitud.') }),
    N('un-angulo', 'unitario', 1, { th: [10, 170, 10] }, function (v) { return 'Un vector unitario apunta a $' + v.th + '^\\circ$ del eje $+x$. ¿Cuánto vale su componente $y$?'; },
      function (v) { return Math.sin(v.th * RAD); }, 'Con magnitud 1, la componente $y$ es $\\sin\\theta$.', { tol: { abs: 0.005 } }),
    N('un-distancia', 'unitario', 2, { x1: [-5, 5, 1], y1: [-5, 5, 1], z1: [-5, 5, 1], x2: [-5, 5, 1], y2: [-5, 5, 1], z2: [-5, 5, 1] }, function (v) { return '¿A qué distancia están los puntos $' + v3(v.x1, v.y1, v.z1) + '$ y $' + v3(v.x2, v.y2, v.z2) + '$ (en m)?'; },
      function (v) { return m3(v.x2 - v.x1, v.y2 - v.y1, v.z2 - v.z1); }, 'Es la magnitud del vector que los une: $\\vec{r}_2 - \\vec{r}_1$.', { unit: 'm', where: function (v) { return m3(v.x2 - v.x1, v.y2 - v.y1, v.z2 - v.z1) > 0.5; } }),
    N('un-completar', 'unitario', 3, { s: [0.1, 0.9, 0.1] }, function (v) { return '¿Qué valor positivo de $k$ hace que $(k,\\ ' + v.s + ')$ sea un vector unitario?'; },
      function (v) { return Math.sqrt(1 - v.s * v.s); }, 'Debe cumplir $k^2 + s^2 = 1$.', { tol: { abs: 0.002 }, mistakes: { linear: function (v) { return 1 - v.s; } }, feedback: fb('linear', 'No es $1 - s$: la condición es $k^2 + s^2 = 1$.') }),
    N('un-multiplo', 'unitario', 1, { c: [-5, 5, 1], a: [1, 9, 1], b: [1, 9, 1] }, function (v) { return 'Si $\\vec{A} = ' + v2(v.a, v.b) + '$, ¿cuánto mide $' + v.c + '\\vec{A}$?'; },
      function (v) { return Math.abs(v.c) * Math.hypot(v.a, v.b); }, '$|c\\vec{A}| = |c|\\,|\\vec{A}|$: la magnitud nunca es negativa.', { where: function (v) { return v.c !== 0 && v.c !== 1; } }),

    /* ---------------- Producto escalar ---------------- */
    N('es-2d', 'escalar', 1, { ax: I9, ay: I9, bx: I9, by: I9 }, function (v) { return 'Calcula $' + v2(v.ax, v.ay) + '\\cdot' + v2(v.bx, v.by) + '$.'; },
      function (v) { return v.ax * v.bx + v.ay * v.by; }, 'Multiplica $x$ con $x$, $y$ con $y$, y suma.', { tol: EXACT, where: nz2 }),
    N('es-3d', 'escalar', 1, { a1: I9, a2: I9, a3: I9, b1: I9, b2: I9, b3: I9 }, function (v) { return 'Calcula $\\vec{A}\\cdot\\vec{B}$ con $\\vec{A} = ' + v3(v.a1, v.a2, v.a3) + '$ y $\\vec{B} = ' + v3(v.b1, v.b2, v.b3) + '$.'; },
      dot3, '$A_xB_x + A_yB_y + A_zB_z$.', { tol: EXACT, where: nz3 }),
    N('es-angulo', 'escalar', 1, { A: [2, 20, 1], B: [2, 20, 1], th: [10, 170, 10] }, function (v) { return 'Dos vectores miden $' + v.A + '$ y $' + v.B + '$ y forman $' + v.th + '^\\circ$. ¿Cuánto vale su producto escalar?'; },
      function (v) { return v.A * v.B * Math.cos(v.th * RAD); }, '$\\vec{A}\\cdot\\vec{B} = AB\\cos\\theta$.', { tol: { abs: 0.05 }, where: function (v) { return v.th !== 90; }, mistakes: { usedSin: function (v) { return v.A * v.B * Math.sin(v.th * RAD); } }, feedback: fb('usedSin', 'Usaste el seno: eso es la magnitud del producto vectorial.') }),
    N('es-cuadrado', 'escalar', 2, { a: [-9, 9, 1], b: [-9, 9, 1], c: [-9, 9, 1] }, function (v) { return 'Si $\\vec{A} = ' + v3(v.a, v.b, v.c) + '$, ¿cuánto vale $\\vec{A}\\cdot\\vec{A}$?'; },
      function (v) { return v.a * v.a + v.b * v.b + v.c * v.c; }, '$\\vec{A}\\cdot\\vec{A} = |\\vec{A}|^2$.', { tol: EXACT, where: function (v) { return v.a * v.b * v.c !== 0; } }),
    N('es-distributiva', 'escalar', 2, { ax: I9, ay: I9, bx: I9, by: I9, cx: I9, cy: I9 }, function (v) { return 'Con $\\vec{A} = ' + v2(v.ax, v.ay) + '$, $\\vec{B} = ' + v2(v.bx, v.by) + '$ y $\\vec{C} = ' + v2(v.cx, v.cy) + '$, calcula $\\vec{A}\\cdot(\\vec{B} + \\vec{C})$.'; },
      function (v) { return v.ax * (v.bx + v.cx) + v.ay * (v.by + v.cy); }, 'Suma primero $\\vec{B} + \\vec{C}$, o usa $\\vec{A}\\cdot\\vec{B} + \\vec{A}\\cdot\\vec{C}$.', { tol: EXACT, where: function (v) { return v.ax * v.ay !== 0 && v.ax * (v.bx + v.cx) + v.ay * (v.by + v.cy) !== 0; } }),
    N('es-perp-k', 'escalar', 3, { a: I9, b: I9, c: [1, 6, 1], d: I9, e: I9 }, function (v) { return '¿Qué valor de $k$ hace perpendiculares a $' + v3('k', v.a, v.b) + '$ y $' + v3(v.c, v.d, v.e) + '$?'; },
      function (v) { return -(v.a * v.d + v.b * v.e) / v.c; }, 'Perpendiculares: producto escalar cero, $kc + ad + be = 0$.', { tol: EXACT, where: function (v) { return v.a * v.b * v.d * v.e !== 0 && v.a * v.d + v.b * v.e !== 0; } }),
    N('es-proyeccion', 'escalar', 2, { ax: I9, ay: I9, bx: I9, by: I9 }, function (v) { return '¿Cuánto vale la componente de $\\vec{A} = ' + v2(v.ax, v.ay) + '$ en la dirección de $\\vec{B} = ' + v2(v.bx, v.by) + '$?'; },
      function (v) { return (v.ax * v.bx + v.ay * v.by) / Math.hypot(v.bx, v.by); }, '$A_B = \\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{B}|}$.',
      { tol: { abs: 0.01 }, where: function (v) { return nz2(v) && v.ax * v.bx + v.ay * v.by !== 0 && Math.hypot(v.ax, v.ay) !== Math.hypot(v.bx, v.by); }, mistakes: { byA: function (v) { return (v.ax * v.bx + v.ay * v.by) / Math.hypot(v.ax, v.ay); } }, feedback: fb('byA', 'Dividiste entre $|\\vec{A}|$; para proyectar sobre $\\vec{B}$ se divide entre $|\\vec{B}|$.') }),
    N('es-proy-vec', 'escalar', 3, { ax: I9, ay: I9, bx: I9, by: I9 }, function (v) { return 'Calcula la componente $x$ del vector proyección de $\\vec{A} = ' + v2(v.ax, v.ay) + '$ sobre $\\vec{B} = ' + v2(v.bx, v.by) + '$.'; },
      function (v) { return (v.ax * v.bx + v.ay * v.by) / (v.bx * v.bx + v.by * v.by) * v.bx; }, '$\\vec{A}_{\\parallel} = \\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{B}|^2}\\,\\vec{B}$.', { tol: { abs: 0.01 }, where: function (v) { return nz2(v) && v.ax * v.bx + v.ay * v.by !== 0; } }),
    N('es-perp-comp', 'escalar', 3, { ax: [1, 9, 1], ay: [1, 9, 1], bx: [1, 9, 1], by: [-9, 9, 1] }, function (v) { return '¿Cuánto mide la parte de $\\vec{A} = ' + v2(v.ax, v.ay) + '$ perpendicular a $\\vec{B} = ' + v2(v.bx, v.by) + '$?'; },
      function (v) { return Math.abs(v.ax * v.by - v.ay * v.bx) / Math.hypot(v.bx, v.by); }, 'Es $|\\vec{A}|\\sin\\theta = |\\vec{A}\\times\\vec{B}|/|\\vec{B}|$.', { tol: { abs: 0.01 }, where: function (v) { return v.by !== 0 && Math.abs(v.ax * v.by - v.ay * v.bx) > 0; } }),
    N('es-ang-dot', 'escalar', 2, { A: [2, 12, 1], B: [2, 12, 1], d: [-20, 20, 2] }, function (v) { return 'Si $|\\vec{A}| = ' + v.A + '$, $|\\vec{B}| = ' + v.B + '$ y $\\vec{A}\\cdot\\vec{B} = ' + v.d + '$, ¿qué ángulo forman?'; },
      function (v) { return Math.acos(v.d / (v.A * v.B)) * DEG; }, '$\\cos\\theta = \\frac{\\vec{A}\\cdot\\vec{B}}{AB}$.', { unit: '°', tol: ANG, where: function (v) { return Math.abs(v.d) < 0.95 * v.A * v.B && v.d !== 0; } }),
    N('es-mags-ang', 'escalar', 2, { A: [2, 10, 1], a: [0, 90, 10], B: [2, 10, 1], b: [100, 260, 20] }, function (v) { return '$\\vec{A}$ mide $' + v.A + '$ a $' + v.a + '^\\circ$ y $\\vec{B}$ mide $' + v.B + '$ a $' + v.b + '^\\circ$. ¿Cuánto vale $\\vec{A}\\cdot\\vec{B}$?'; },
      function (v) { return v.A * v.B * Math.cos((v.b - v.a) * RAD); }, 'El ángulo entre ellos es la diferencia de sus direcciones.', { tol: { abs: 0.05 }, where: function (v) { return Math.abs(Math.cos((v.b - v.a) * RAD)) > 0.05; } }),
    N('es-unitarios', 'escalar', 1, { th: [10, 170, 10] }, function (v) { return 'Dos vectores unitarios forman $' + v.th + '^\\circ$. ¿Cuánto vale su producto escalar?'; },
      function (v) { return Math.cos(v.th * RAD); }, 'Con magnitudes 1, $\\hat{u}\\cdot\\hat{w} = \\cos\\theta$.', { tol: { abs: 0.005 }, where: function (v) { return v.th !== 90; } }),
    N('es-suma-cuadrado', 'escalar', 3, { A: [2, 12, 1], B: [2, 12, 1], d: [-20, 20, 2] }, function (v) { return 'Si $|\\vec{A}| = ' + v.A + '$, $|\\vec{B}| = ' + v.B + '$ y $\\vec{A}\\cdot\\vec{B} = ' + v.d + '$, ¿cuánto mide $\\vec{A} + \\vec{B}$?'; },
      function (v) { return Math.sqrt(v.A * v.A + v.B * v.B + 2 * v.d); }, '$|\\vec{A} + \\vec{B}|^2 = (\\vec{A} + \\vec{B})\\cdot(\\vec{A} + \\vec{B}) = A^2 + B^2 + 2\\vec{A}\\cdot\\vec{B}$.', { where: function (v) { return Math.abs(v.d) < 0.95 * v.A * v.B; } }),

    /* ---------------- Ángulo entre vectores ---------------- */
    N('an-2d', 'angulo', 2, { ax: I9, ay: I9, bx: I9, by: I9 }, function (v) { return '¿Qué ángulo forman $' + v2(v.ax, v.ay) + '$ y $' + v2(v.bx, v.by) + '$?'; },
      function (v) { return Math.acos((v.ax * v.bx + v.ay * v.by) / (Math.hypot(v.ax, v.ay) * Math.hypot(v.bx, v.by))) * DEG; }, '$\\cos\\theta = \\frac{\\vec{A}\\cdot\\vec{B}}{AB}$.',
      { unit: '°', tol: ANG, where: function (v) { var c = (v.ax * v.bx + v.ay * v.by) / (Math.hypot(v.ax, v.ay) * Math.hypot(v.bx, v.by)); return nz2(v) && Math.abs(c) < 0.97; },
        mistakes: { radians: function (v) { return Math.acos((v.ax * v.bx + v.ay * v.by) / (Math.hypot(v.ax, v.ay) * Math.hypot(v.bx, v.by))); } }, feedback: fb('radians', 'Ese valor está en radianes; pon la calculadora en grados.') }),
    N('an-3d', 'angulo', 3, { a1: I9, a2: I9, a3: I9, b1: I9, b2: I9, b3: I9 }, function (v) { return '¿Qué ángulo forman $' + v3(v.a1, v.a2, v.a3) + '$ y $' + v3(v.b1, v.b2, v.b3) + '$?'; },
      function (v) { return Math.acos(dot3(v) / (m3(v.a1, v.a2, v.a3) * m3(v.b1, v.b2, v.b3))) * DEG; }, 'Producto escalar entre el producto de magnitudes, y luego $\\arccos$.', { unit: '°', tol: ANG, where: function (v) { return nz3(v) && Math.abs(dot3(v) / (m3(v.a1, v.a2, v.a3) * m3(v.b1, v.b2, v.b3))) < 0.97; } }),
    N('an-eje-x', 'angulo', 2, { a: [-9, 9, 1], b: [-9, 9, 1], c: [-9, 9, 1] }, function (v) { return '¿Qué ángulo forma $\\vec{A} = ' + v3(v.a, v.b, v.c) + '$ con el eje $+x$?'; },
      function (v) { return Math.acos(v.a / m3(v.a, v.b, v.c)) * DEG; }, 'Con $\\hat{\\imath}$: $\\cos\\alpha = A_x/|\\vec{A}|$.', { unit: '°', tol: ANG, where: function (v) { return v.a * v.b * v.c !== 0; } }),
    N('an-coseno', 'angulo', 2, { ax: I9, ay: I9, bx: I9, by: I9 }, function (v) { return 'Calcula el coseno del ángulo entre $' + v2(v.ax, v.ay) + '$ y $' + v2(v.bx, v.by) + '$.'; },
      function (v) { return (v.ax * v.bx + v.ay * v.by) / (Math.hypot(v.ax, v.ay) * Math.hypot(v.bx, v.by)); }, '$\\cos\\theta = \\frac{\\vec{A}\\cdot\\vec{B}}{AB}$, un número entre $-1$ y $1$.', { tol: { abs: 0.005 }, where: nz2 }),
    N('an-direcciones', 'angulo', 2, { a: [0, 170, 10], b: [180, 350, 10] }, function (v) { return 'Un vector apunta a $' + v.a + '^\\circ$ y otro a $' + v.b + '^\\circ$. ¿Qué ángulo forman entre sí (entre $0^\\circ$ y $180^\\circ$)?'; },
      function (v) { var d = Math.abs(v.b - v.a); return d > 180 ? 360 - d : d; }, 'Resta las direcciones; si pasa de $180^\\circ$, toma $360^\\circ$ menos esa diferencia.', { unit: '°', tol: ANG, where: function (v) { return Math.abs(v.b - v.a) !== 180; } }),
    N('an-perp', 'angulo', 1, {}, function () { return 'Usa el producto escalar para decidir cuántos grados hay entre las diagonales $(1,\\ 1,\\ 0)$ y $(1,\\ -1,\\ 0)$ de un cuadrado.'; },
      function () { return 90; }, 'Su producto escalar es $1 - 1 + 0 = 0$.', { unit: '°', tol: ANG }),

    /* ---------------- Producto vectorial ---------------- */
    N('ve-z', 'vectorial', 1, { ax: I9, ay: I9, bx: I9, by: I9 }, function (v) { return '¿Cuánto vale la componente $z$ de $' + v3(v.ax, v.ay, 0) + '\\times' + v3(v.bx, v.by, 0) + '$?'; },
      function (v) { return v.ax * v.by - v.ay * v.bx; }, 'Para vectores en el plano: $A_xB_y - A_yB_x$.', { tol: EXACT, where: function (v) { return nz2(v) && Math.abs(v.ax * v.by - v.ay * v.bx) >= 2; }, mistakes: { reversed: function (v) { return v.ay * v.bx - v.ax * v.by; } }, feedback: fb('reversed', 'Signo contrario: calculaste $\\vec{B}\\times\\vec{A}$.') }),
    N('ve-ba', 'vectorial', 2, { ax: I9, ay: I9, bx: I9, by: I9 }, function (v) { return 'Si $\\vec{A} = ' + v3(v.ax, v.ay, 0) + '$ y $\\vec{B} = ' + v3(v.bx, v.by, 0) + '$, ¿cuánto vale la componente $z$ de $\\vec{B}\\times\\vec{A}$?'; },
      function (v) { return v.bx * v.ay - v.by * v.ax; }, '$\\vec{B}\\times\\vec{A} = -\\vec{A}\\times\\vec{B}$.', { tol: EXACT, where: function (v) { return nz2(v) && Math.abs(v.ax * v.by - v.ay * v.bx) >= 2; } }),
    N('ve-x', 'vectorial', 2, { a1: I9, a2: I9, a3: I9, b1: I9, b2: I9, b3: I9 }, function (v) { return 'Calcula la componente $x$ de $' + v3(v.a1, v.a2, v.a3) + '\\times' + v3(v.b1, v.b2, v.b3) + '$.'; },
      function (v) { return v.a2 * v.b3 - v.a3 * v.b2; }, '$(\\vec{A}\\times\\vec{B})_x = A_yB_z - A_zB_y$.', { tol: EXACT, where: function (v) { return nz3(v) && Math.abs(v.a2 * v.b3 - v.a3 * v.b2) >= 1; } }),
    N('ve-y', 'vectorial', 3, { a1: I9, a2: I9, a3: I9, b1: I9, b2: I9, b3: I9 }, function (v) { return '¿Cuánto vale la componente $y$ de $\\vec{A}\\times\\vec{B}$ si $\\vec{A} = ' + v3(v.a1, v.a2, v.a3) + '$ y $\\vec{B} = ' + v3(v.b1, v.b2, v.b3) + '$?'; },
      function (v) { return v.a3 * v.b1 - v.a1 * v.b3; }, 'Con el signo menos del determinante: $-(A_xB_z - A_zB_x) = A_zB_x - A_xB_z$.',
      { tol: EXACT, where: function (v) { return nz3(v) && Math.abs(v.a3 * v.b1 - v.a1 * v.b3) >= 1; }, mistakes: { jSign: function (v) { return v.a1 * v.b3 - v.a3 * v.b1; } }, feedback: fb('jSign', 'Te faltó el signo menos del término de $\\hat{\\jmath}$.') }),
    N('ve-mag', 'vectorial', 3, { a1: I9, a2: I9, a3: I9, b1: I9, b2: I9, b3: I9 }, function (v) { return '¿Cuánto mide $\\vec{A}\\times\\vec{B}$ con $\\vec{A} = ' + v3(v.a1, v.a2, v.a3) + '$ y $\\vec{B} = ' + v3(v.b1, v.b2, v.b3) + '$?'; },
      function (v) { return m3(v.a2 * v.b3 - v.a3 * v.b2, v.a3 * v.b1 - v.a1 * v.b3, v.a1 * v.b2 - v.a2 * v.b1); }, 'Calcula las tres componentes y su magnitud (o usa $AB\\sin\\theta$).', { where: function (v) { return nz3(v) && m3(v.a2 * v.b3 - v.a3 * v.b2, v.a3 * v.b1 - v.a1 * v.b3, v.a1 * v.b2 - v.a2 * v.b1) > 1; } }),
    N('ve-sin', 'vectorial', 1, { A: [2, 20, 1], B: [2, 20, 1], th: [10, 170, 10] }, function (v) { return '¿Cuánto mide $\\vec{A}\\times\\vec{B}$ si $|\\vec{A}| = ' + v.A + '$, $|\\vec{B}| = ' + v.B + '$ y forman $' + v.th + '^\\circ$?'; },
      function (v) { return v.A * v.B * Math.sin(v.th * RAD); }, '$|\\vec{A}\\times\\vec{B}| = AB\\sin\\theta$.', { where: function (v) { return v.th !== 90; }, mistakes: { usedCos: function (v) { return Math.abs(v.A * v.B * Math.cos(v.th * RAD)); } }, feedback: fb('usedCos', 'El coseno es del producto escalar; el vectorial lleva seno.') }),
    N('ve-triangulo', 'vectorial', 2, { ax: I9, ay: I9, bx: I9, by: I9 }, function (v) { return 'Un triángulo tiene vértices en el origen, en $' + v2(v.ax, v.ay) + '$ y en $' + v2(v.bx, v.by) + '$ (en m). ¿Cuál es su área?'; },
      function (v) { return Math.abs(v.ax * v.by - v.ay * v.bx) / 2; }, 'El triángulo es la mitad del paralelogramo: $\\tfrac{1}{2}|\\vec{A}\\times\\vec{B}|$.', { unit: 'm²', where: function (v) { return nz2(v) && Math.abs(v.ax * v.by - v.ay * v.bx) >= 2; }, mistakes: { noHalf: function (v) { return Math.abs(v.ax * v.by - v.ay * v.bx); } }, feedback: fb('noHalf', 'Ese es el paralelogramo; el triángulo es la mitad.') }),
    N('ve-paralelos', 'vectorial', 3, { m: [1, 6, 1], a: [1, 6, 1], b: [-6, 6, 1] }, function (v) { return '¿Qué valor de $k$ hace que $' + v2(v.m, 'k') + '$ y $' + v2(v.a, v.b) + '$ sean paralelos?'; },
      function (v) { return v.m * v.b / v.a; }, 'Paralelos: la componente $z$ de su producto vectorial es cero, $mb - ka = 0$.', { tol: EXACT, where: function (v) { return v.b !== 0; } }),
    N('ve-mags-ang', 'vectorial', 2, { A: [2, 10, 1], a: [0, 90, 10], B: [2, 10, 1], b: [100, 260, 20] }, function (v) { return 'En el plano, $\\vec{A}$ mide $' + v.A + '$ a $' + v.a + '^\\circ$ y $\\vec{B}$ mide $' + v.B + '$ a $' + v.b + '^\\circ$. ¿Cuánto vale la componente $z$ de $\\vec{A}\\times\\vec{B}$?'; },
      function (v) { return v.A * v.B * Math.sin((v.b - v.a) * RAD); }, 'Es $AB\\sin(\\beta - \\alpha)$: positiva si $\\vec{B}$ está girado antihorario desde $\\vec{A}$ (menos de $180^\\circ$).', { tol: { abs: 0.05 }, where: function (v) { return Math.abs(Math.sin((v.b - v.a) * RAD)) > 0.05; } }),
    N('ve-unitarios', 'vectorial', 1, { phi: [10, 170, 10] }, function (v) { return 'Dos vectores unitarios forman $' + v.phi + '^\\circ$. ¿Cuánto mide su producto vectorial?'; },
      function (v) { return Math.sin(v.phi * RAD); }, '$|\\hat{u}\\times\\hat{w}| = \\sin\\theta$.', { tol: { abs: 0.005 } }),
    N('ve-terreno', 'vectorial', 3, { x2: [2, 12, 1], y2: [-6, 6, 1], x3: [-6, 6, 1], y3: [2, 12, 1] }, function (v) { return 'Un terreno triangular tiene esquinas en $(1,\\ 1)$, $' + v2(v.x2, v.y2) + '$ y $' + v2(v.x3, v.y3) + '$ (en m). ¿Cuál es su área?'; },
      function (v) { return Math.abs((v.x2 - 1) * (v.y3 - 1) - (v.y2 - 1) * (v.x3 - 1)) / 2; }, 'Usa los lados que salen de $(1, 1)$: $\\tfrac{1}{2}|\\vec{u}\\times\\vec{w}|$.', { unit: 'm²', where: function (v) { return Math.abs((v.x2 - 1) * (v.y3 - 1) - (v.y2 - 1) * (v.x3 - 1)) >= 2; } }),

    /* ---------------- Aplicaciones: trabajo y torque ---------------- */
    N('ap-trabajo', 'aplicaciones', 1, { F: [5, 60, 5], d: [1, 20, 1], th: [0, 80, 10] }, function (v) { return 'Jalas una caja con $' + v.F + '\\ \\text{N}$ a $' + v.th + '^\\circ$ de la dirección en que se mueve y la caja avanza $' + v.d + '\\ \\text{m}$. ¿Cuánto trabajo hace tu fuerza? ($W = \\vec{F}\\cdot\\vec{d}$)'; },
      function (v) { return v.F * v.d * Math.cos(v.th * RAD); }, '$W = Fd\\cos\\theta$: solo cuenta la parte de la fuerza en la dirección del movimiento.', { unit: 'J', where: function (v) { return v.th !== 0; }, mistakes: { full: function (v) { return v.F * v.d; } }, feedback: fb('full', 'Usaste toda la fuerza; solo trabaja su componente $F\\cos\\theta$.') }),
    N('ap-trabajo-comp', 'aplicaciones', 2, { fx: I9, fy: I9, dx: [1, 9, 1], dy: I9 }, function (v) { return 'Una fuerza $\\vec{F} = ' + v2(v.fx, v.fy) + '\\ \\text{N}$ actúa durante un desplazamiento $\\vec{d} = ' + v2(v.dx, v.dy) + '\\ \\text{m}$. ¿Cuánto trabajo hace?'; },
      function (v) { return v.fx * v.dx + v.fy * v.dy; }, '$W = F_xd_x + F_yd_y$.', { unit: 'J', tol: EXACT, where: function (v) { return v.fx * v.fy * v.dy !== 0 && v.fx * v.dx + v.fy * v.dy !== 0; } }),
    N('ap-trabajo-neg', 'aplicaciones', 2, { F: [5, 60, 5], d: [1, 20, 1], th2: [100, 170, 10] }, function (v) { return 'Una fuerza de $' + v.F + '\\ \\text{N}$ forma $' + v.th2 + '^\\circ$ con el desplazamiento de $' + v.d + '\\ \\text{m}$. ¿Cuánto trabajo hace? (Con signo.)'; },
      function (v) { return v.F * v.d * Math.cos(v.th2 * RAD); }, 'Con más de $90^\\circ$ el coseno es negativo: la fuerza frena.', { unit: 'J', tol: { abs: 0.1 }, mistakes: { noSign: function (v) { return -v.F * v.d * Math.cos(v.th2 * RAD); } }, feedback: fb('noSign', 'La magnitud está bien, pero la fuerza se opone al movimiento: el trabajo es negativo.') }),
    N('ap-torque', 'aplicaciones', 2, { r: [0.1, 1, 0.05], F: [10, 200, 10], th: [20, 160, 10] }, function (v) { return 'Aplicas $' + v.F + '\\ \\text{N}$ en el extremo de una llave de $' + v.r + '\\ \\text{m}$, formando $' + v.th + '^\\circ$ con la llave. ¿Cuánto mide el torque, $|\\vec{r}\\times\\vec{F}|$?'; },
      function (v) { return v.r * v.F * Math.sin(v.th * RAD); }, '$\\tau = rF\\sin\\theta$.', { unit: 'N·m', where: function (v) { return v.th !== 90; }, mistakes: { usedCos: function (v) { return Math.abs(v.r * v.F * Math.cos(v.th * RAD)); } }, feedback: fb('usedCos', 'El torque lleva seno: cuenta la parte de la fuerza perpendicular a la llave.') }),
    N('ap-torque-z', 'aplicaciones', 2, { x: I9, y: I9, fx: I9, fy: I9 }, function (v) { return 'Una fuerza $\\vec{F} = ' + v2(v.fx, v.fy) + '\\ \\text{N}$ actúa en el punto $\\vec{r} = ' + v2(v.x, v.y) + '\\ \\text{m}$. ¿Cuánto vale la componente $z$ del torque $\\vec{r}\\times\\vec{F}$ respecto al origen?'; },
      function (v) { return v.x * v.fy - v.y * v.fx; }, '$\\tau_z = xF_y - yF_x$.', { unit: 'N·m', tol: EXACT, where: function (v) { return v.x * v.y * v.fx * v.fy !== 0 && Math.abs(v.x * v.fy - v.y * v.fx) >= 2; }, mistakes: { reversed: function (v) { return v.y * v.fx - v.x * v.fy; } }, feedback: fb('reversed', 'Signo contrario: calculaste $\\vec{F}\\times\\vec{r}$.') }),
    N('ap-llave', 'aplicaciones', 1, { L: [0.1, 0.6, 0.05], F: [10, 150, 10] }, function (v) { return 'Empujas perpendicular al extremo de una llave de $' + v.L + '\\ \\text{m}$ con $' + v.F + '\\ \\text{N}$. ¿Cuánto torque haces?'; },
      function (v) { return v.L * v.F; }, 'Perpendicular: $\\sin 90^\\circ = 1$, $\\tau = LF$.', { unit: 'N·m' }),
    N('ap-potencia', 'aplicaciones', 2, { fx: [1, 20, 1], fy: I9, vx: [1, 9, 1], vy: I9 }, function (v) { return 'Un motor aplica $\\vec{F} = ' + v2(v.fx, v.fy) + '\\ \\text{N}$ a un carrito que va a $\\vec{v} = ' + v2(v.vx, v.vy) + '\\ \\text{m/s}$. ¿Qué potencia entrega? ($P = \\vec{F}\\cdot\\vec{v}$)'; },
      function (v) { return v.fx * v.vx + v.fy * v.vy; }, '$P = F_xv_x + F_yv_y$.', { unit: 'W', tol: EXACT, where: function (v) { return v.fy * v.vy !== 0 && v.fx * v.vx + v.fy * v.vy !== 0; } }),

    /* ---------------- Más práctica ---------------- */
    N('an-eje-y', 'angulo', 2, { a: [-9, 9, 1], b: [-9, 9, 1], c: [-9, 9, 1] }, function (v) { return 'Calcula el ángulo entre $' + v3(v.a, v.b, v.c) + '$ y el eje $+y$.'; },
      function (v) { return Math.acos(v.b / m3(v.a, v.b, v.c)) * DEG; }, '$\\cos\\beta = A_y/|\\vec{A}|$.', { unit: '°', tol: ANG, where: function (v) { return v.a * v.b * v.c !== 0; } }),
    N('an-cubo', 'angulo', 3, {}, function () { return '¿Qué ángulo forma la diagonal de un cubo, $(1,\\ 1,\\ 1)$, con una de sus aristas, $(1,\\ 0,\\ 0)$?'; },
      function () { return Math.acos(1 / Math.sqrt(3)) * DEG; }, '$\\cos\\theta = \\frac{1}{\\sqrt{3}\\cdot 1}$: unos $54.7^\\circ$.', { unit: '°', tol: ANG }),
    N('an-cara', 'angulo', 2, {}, function () { return '¿Qué ángulo forman la diagonal de una cara de un cubo, $(1,\\ 1,\\ 0)$, y la diagonal del cubo, $(1,\\ 1,\\ 1)$?'; },
      function () { return Math.acos(2 / (Math.sqrt(2) * Math.sqrt(3))) * DEG; }, '$\\cos\\theta = \\frac{2}{\\sqrt{2}\\sqrt{3}}$: unos $35.3^\\circ$.', { unit: '°', tol: ANG }),
    N('ap-trabajo-3d', 'aplicaciones', 2, { f1: I9, f2: I9, f3: I9, d1: I9, d2: I9, d3: I9 }, function (v) { return 'Un dron recibe una fuerza $\\vec{F} = ' + v3(v.f1, v.f2, v.f3) + '\\ \\text{N}$ mientras se desplaza $\\vec{d} = ' + v3(v.d1, v.d2, v.d3) + '\\ \\text{m}$. ¿Cuánto trabajo hace la fuerza?'; },
      function (v) { return v.f1 * v.d1 + v.f2 * v.d2 + v.f3 * v.d3; }, '$W = \\vec{F}\\cdot\\vec{d}$ en 3D.', { unit: 'J', tol: EXACT, where: function (v) { return v.f1 * v.f2 * v.f3 * v.d1 * v.d2 * v.d3 !== 0 && v.f1 * v.d1 + v.f2 * v.d2 + v.f3 * v.d3 !== 0; } }),
    N('es-proy-3d', 'escalar', 3, { a1: I9, a2: I9, a3: I9, b1: I9, b2: I9, b3: I9 }, function (v) { return '¿Cuánto vale la componente de $' + v3(v.a1, v.a2, v.a3) + '$ a lo largo de $' + v3(v.b1, v.b2, v.b3) + '$?'; },
      function (v) { return dot3(v) / m3(v.b1, v.b2, v.b3); }, '$\\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{B}|}$.', { tol: { abs: 0.01 }, where: function (v) { return nz3(v) && dot3(v) !== 0; } }),
    N('ve-z-3d', 'vectorial', 2, { a1: I9, a2: I9, a3: I9, b1: I9, b2: I9, b3: I9 }, function (v) { return '¿Cuánto vale la componente $\\hat{k}$ de $' + v3(v.a1, v.a2, v.a3) + '\\times' + v3(v.b1, v.b2, v.b3) + '$?'; },
      function (v) { return v.a1 * v.b2 - v.a2 * v.b1; }, '$(\\vec{A}\\times\\vec{B})_z = A_xB_y - A_yB_x$.', { tol: EXACT, where: function (v) { return nz3(v) && Math.abs(v.a1 * v.b2 - v.a2 * v.b1) >= 1; } }),
    N('ve-area-3d', 'vectorial', 3, { a1: I9, a2: I9, a3: I9, b1: I9, b2: I9, b3: I9 }, function (v) { return 'Dos lados de un triángulo son $' + v3(v.a1, v.a2, v.a3) + '$ y $' + v3(v.b1, v.b2, v.b3) + '$ (en m). ¿Cuál es su área?'; },
      function (v) { return m3(v.a2 * v.b3 - v.a3 * v.b2, v.a3 * v.b1 - v.a1 * v.b3, v.a1 * v.b2 - v.a2 * v.b1) / 2; }, '$\\tfrac{1}{2}|\\vec{A}\\times\\vec{B}|$.', { unit: 'm²', where: function (v) { return nz3(v) && m3(v.a2 * v.b3 - v.a3 * v.b2, v.a3 * v.b1 - v.a1 * v.b3, v.a1 * v.b2 - v.a2 * v.b1) > 1; } }),
    N('un-suma-unitarios', 'unitario', 2, { th: [20, 160, 20] }, function (v) { return 'Dos vectores unitarios forman $' + v.th + '^\\circ$. ¿Cuánto mide su suma?'; },
      function (v) { return 2 * Math.cos(v.th / 2 * RAD); }, '$|\\hat{u} + \\hat{w}|^2 = 1 + 1 + 2\\cos\\theta$, que da $2\\cos(\\theta/2)$.', { tol: { abs: 0.005 }, mistakes: { two: function () { return 2; } }, feedback: fb('two', 'Solo suman 2 si apuntan igual.') }),
    N('ap-brazo', 'aplicaciones', 2, { r: [0.2, 2, 0.1], th: [20, 160, 10] }, function (v) { return 'Una fuerza actúa a $' + v.r + '\\ \\text{m}$ del eje, formando $' + v.th + '^\\circ$ con la línea que va del eje al punto. ¿Cuánto mide su brazo de palanca $r\\sin\\theta$?'; },
      function (v) { return v.r * Math.sin(v.th * RAD); }, 'Es la distancia perpendicular del eje a la línea de la fuerza.', { unit: 'm', where: function (v) { return v.th !== 90; } }),
    N('ap-angulo-trabajo', 'aplicaciones', 3, { F: [10, 50, 5], d: [2, 10, 1], f: [0.1, 0.9, 0.1] }, function (v) { return 'Una fuerza de $' + v.F + '\\ \\text{N}$ hace $' + Number((v.f * v.F * v.d).toFixed(2)) + '\\ \\text{J}$ de trabajo en un desplazamiento de $' + v.d + '\\ \\text{m}$. ¿Qué ángulo forma con el desplazamiento?'; },
      function (v) { return Math.acos(Number((v.f * v.F * v.d).toFixed(2)) / (v.F * v.d)) * DEG; }, 'De $W = Fd\\cos\\theta$: $\\theta = \\arccos\\frac{W}{Fd}$.', { unit: '°', tol: ANG }),

    /* ---------------- Conceptuales ---------------- */
    C('k-unit-mag', 'unitario', 1, 'Un vector unitario mide…', '1', [['0'], ['lo mismo que el vector original'], ['depende de la dirección']], 'Por definición su magnitud es 1.'),
    C('k-unit-como', 'unitario', 1, 'Para obtener el vector unitario $\\hat{A}$…', 'se divide $\\vec{A}$ entre $|\\vec{A}|$', [['se resta 1 a cada componente'], ['se divide $\\vec{A}$ entre la suma de sus componentes'], ['se multiplica $\\vec{A}$ por $|\\vec{A}|$']], 'Así conserva la dirección y mide 1.'),
    C('k-unit-dir', 'unitario', 2, '$\\hat{A}$ comparado con $\\vec{A}$…', 'apunta en la misma dirección y mide 1', [['es perpendicular a $\\vec{A}$'], ['apunta en sentido contrario'], ['mide lo mismo que $\\vec{A}$']], 'Solo cambia el tamaño.'),
    C('k-ijk', 'unitario', 1, '$\\hat{\\imath}$, $\\hat{\\jmath}$ y $\\hat{k}$ son…', 'vectores unitarios en $x$, $y$ y $z$', [['las componentes de un vector'], ['tres vectores cualesquiera de magnitud 3'], ['ángulos en radianes']], 'Sirven para escribir $\\vec{A} = A_x\\hat{\\imath} + A_y\\hat{\\jmath} + A_z\\hat{k}$.'),
    C('k-unit-cero', 'unitario', 3, '¿El vector cero tiene vector unitario?', 'No, porque no tiene dirección', [['Sí, es el mismo vector cero'], ['Sí, es $\\hat{\\imath}$'], ['Sí, cualquier vector unitario sirve']], 'Dividir entre $|\\vec{0}| = 0$ no está definido.'),
    C('k-unit-unidades', 'unitario', 2, 'Si $\\vec{F}$ está en newtons, $\\hat{F}$ está en…', 'no tiene unidades', [['newtons'], ['newtons al cuadrado'], ['metros']], 'Se divide N entre N.'),
    C('k-mag-3d', 'unitario', 1, 'En 3D, $|\\vec{A}|$ es…', '$\\sqrt{A_x^2 + A_y^2 + A_z^2}$', [['$A_x + A_y + A_z$'], ['$\\sqrt{A_x^2 + A_y^2}$'], ['$A_x^2 + A_y^2 + A_z^2$']], 'Pitágoras dos veces.'),
    C('k-unit-opuesto', 'unitario', 2, 'El vector unitario de $-\\vec{A}$ es…', '$-\\hat{A}$', [['$\\hat{A}$'], ['el vector cero'], ['$\\hat{A}$ girado $90^\\circ$']], 'Misma línea, sentido contrario.'),
    C('k-dot-da', 'escalar', 1, 'El producto escalar de dos vectores da…', 'un número', [['un vector perpendicular a los dos'], ['un vector paralelo a los dos'], ['un ángulo']], 'Por eso se llama escalar.'),
    C('k-dot-cero', 'escalar', 1, 'Si $\\vec{A}\\cdot\\vec{B} = 0$ y ninguno es cero, entonces…', 'son perpendiculares', [['son paralelos'], ['son iguales'], ['son opuestos']], '$AB\\cos\\theta = 0$ exige $\\cos\\theta = 0$.'),
    C('k-dot-neg', 'escalar', 2, 'Si $\\vec{A}\\cdot\\vec{B} < 0$, el ángulo entre ellos es…', 'mayor que $90^\\circ$', [['menor que $90^\\circ$'], ['exactamente $90^\\circ$'], ['cero']], 'El coseno es negativo entre $90^\\circ$ y $180^\\circ$.'),
    C('k-dot-max', 'escalar', 2, 'Para magnitudes fijas, $\\vec{A}\\cdot\\vec{B}$ es máximo cuando…', 'son paralelos y apuntan igual', [['son perpendiculares'], ['son opuestos'], ['forman $45^\\circ$']], '$\\cos 0^\\circ = 1$.'),
    C('k-ii', 'escalar', 1, '$\\hat{\\imath}\\cdot\\hat{\\imath}$ vale…', '1', [['0'], ['$\\hat{k}$'], ['$-1$']], 'Vector unitario consigo mismo: $1\\cdot 1\\cdot\\cos 0^\\circ$.'),
    C('k-ij-dot', 'escalar', 1, '$\\hat{\\imath}\\cdot\\hat{\\jmath}$ vale…', '0', [['1'], ['$\\hat{k}$'], ['$-\\hat{k}$']], 'Son perpendiculares.'),
    C('k-dot-conm', 'escalar', 2, '$\\vec{A}\\cdot\\vec{B}$ comparado con $\\vec{B}\\cdot\\vec{A}$…', 'son iguales', [['son opuestos'], ['uno es el doble del otro'], ['depende del ángulo']], 'Multiplicar componentes no depende del orden.'),
    C('k-aa', 'escalar', 2, '$\\vec{A}\\cdot\\vec{A}$ es igual a…', '$|\\vec{A}|^2$', [['$|\\vec{A}|$'], ['0'], ['$2|\\vec{A}|$']], '$A_x^2 + A_y^2 + A_z^2$.'),
    C('k-dot-comp', 'escalar', 1, 'Con componentes, $\\vec{A}\\cdot\\vec{B}$ es…', '$A_xB_x + A_yB_y + A_zB_z$', [['$(A_xB_x,\\ A_yB_y,\\ A_zB_z)$'], ['$A_xB_y - A_yB_x$'], ['$|\\vec{A}| + |\\vec{B}|$']], 'Un número: la suma de los productos.'),
    C('k-proy', 'escalar', 3, '$\\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{B}|}$ representa…', 'la componente de $\\vec{A}$ a lo largo de $\\vec{B}$', [['la componente de $\\vec{B}$ a lo largo de $\\vec{A}$'], ['el ángulo entre $\\vec{A}$ y $\\vec{B}$'], ['el área del paralelogramo']], 'Es $A\\cos\\theta$: la sombra de $\\vec{A}$ sobre $\\vec{B}$.'),
    C('k-cos-formula', 'angulo', 1, 'El coseno del ángulo entre $\\vec{A}$ y $\\vec{B}$ es…', '$\\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|}$', [['$\\frac{|\\vec{A}\\times\\vec{B}|}{|\\vec{A}||\\vec{B}|}$'], ['$\\vec{A}\\cdot\\vec{B}$'], ['$\\frac{|\\vec{A}|}{|\\vec{B}|}$']], 'Se despeja de $\\vec{A}\\cdot\\vec{B} = AB\\cos\\theta$.'),
    C('k-rango', 'angulo', 2, 'El ángulo entre dos vectores (como sale del arco coseno) está entre…', '$0^\\circ$ y $180^\\circ$', [['$0^\\circ$ y $90^\\circ$'], ['$-90^\\circ$ y $90^\\circ$'], ['$0^\\circ$ y $360^\\circ$']], '$\\arccos$ devuelve valores en ese rango.'),
    C('k-paralelos', 'angulo', 2, 'Si $\\vec{A}\\cdot\\vec{B} = |\\vec{A}||\\vec{B}|$, el ángulo entre ellos es…', '$0^\\circ$', [['$90^\\circ$'], ['$180^\\circ$'], ['$45^\\circ$']], '$\\cos\\theta = 1$.'),
    C('k-antiparalelos', 'angulo', 2, 'Si $\\vec{A}\\cdot\\vec{B} = -|\\vec{A}||\\vec{B}|$, los vectores…', 'apuntan en sentidos opuestos', [['son perpendiculares'], ['son iguales'], ['uno es cero']], '$\\cos\\theta = -1$: $\\theta = 180^\\circ$.'),
    C('k-proy-signo', 'angulo', 3, 'La componente de $\\vec{A}$ a lo largo de $\\vec{B}$ es negativa cuando…', 'el ángulo entre ellos pasa de $90^\\circ$', [['$\\vec{B}$ es más largo que $\\vec{A}$'], ['$\\vec{A}$ tiene alguna componente negativa'], ['nunca: es una longitud']], 'Tiene el signo de $\\cos\\theta$.'),
    C('k-perp-2d', 'angulo', 2, '¿Cuál de estos vectores es perpendicular a $(3,\\ 4)$?', '$(-4,\\ 3)$', [['$(4,\\ 3)$'], ['$(-3,\\ -4)$'], ['$(6,\\ 8)$']], '$(3)(-4) + (4)(3) = 0$.'),
    C('k-cross-da', 'vectorial', 1, 'El producto vectorial de dos vectores da…', 'un vector perpendicular a los dos', [['un número'], ['un vector paralelo al primero'], ['la suma de los dos']], 'Por eso también se llama producto cruz o producto vectorial.'),
    C('k-cross-mag', 'vectorial', 1, '$|\\vec{A}\\times\\vec{B}|$ es igual a…', '$AB\\sin\\theta$', [['$AB\\cos\\theta$'], ['$AB$'], ['$A + B$']], 'Es máxima cuando son perpendiculares.'),
    C('k-cross-paralelos', 'vectorial', 2, '$\\vec{A}\\times\\vec{B} = \\vec{0}$ cuando $\\vec{A}$ y $\\vec{B}$…', 'son paralelos (o antiparalelos)', [['son perpendiculares'], ['tienen la misma magnitud'], ['están en el plano $xy$']], '$\\sin 0^\\circ = \\sin 180^\\circ = 0$.'),
    C('k-orden', 'vectorial', 1, '$\\vec{B}\\times\\vec{A}$ es igual a…', '$-\\vec{A}\\times\\vec{B}$', [['$\\vec{A}\\times\\vec{B}$'], ['$\\vec{0}$'], ['$\\vec{A}\\cdot\\vec{B}$']], 'El producto vectorial no conmuta: cambia de signo.'),
    C('k-ixj', 'vectorial', 1, '$\\hat{\\imath}\\times\\hat{\\jmath}$ es…', '$\\hat{k}$', [['$-\\hat{k}$'], ['0'], ['1']], 'Mano derecha: de $x$ hacia $y$, el pulgar apunta a $+z$.'),
    C('k-jxi', 'vectorial', 2, '$\\hat{\\jmath}\\times\\hat{\\imath}$ es…', '$-\\hat{k}$', [['$\\hat{k}$'], ['0'], ['$\\hat{\\imath}$']], 'Orden invertido: signo contrario.'),
    C('k-jxk', 'vectorial', 2, '$\\hat{\\jmath}\\times\\hat{k}$ es…', '$\\hat{\\imath}$', [['$-\\hat{\\imath}$'], ['$\\hat{\\jmath}$'], ['0']], 'Ciclo $\\hat{\\imath}\\to\\hat{\\jmath}\\to\\hat{k}\\to\\hat{\\imath}$.'),
    C('k-ixi', 'vectorial', 1, '$\\hat{\\imath}\\times\\hat{\\imath}$ es…', 'el vector cero', [['$\\hat{k}$'], ['1'], ['$\\hat{\\imath}$']], 'Un vector con sí mismo: $\\sin 0^\\circ = 0$.'),
    C('k-mano', 'vectorial', 2, 'Con la mano derecha, si los dedos van de $\\vec{A}$ hacia $\\vec{B}$, el pulgar señala…', '$\\vec{A}\\times\\vec{B}$', [['$\\vec{B}\\times\\vec{A}$'], ['$\\vec{A} + \\vec{B}$'], ['$\\vec{A}\\cdot\\vec{B}$']], 'Es la convención que define el sentido del producto vectorial.'),
    C('k-area', 'vectorial', 2, '$|\\vec{A}\\times\\vec{B}|$ es el área de…', 'el paralelogramo que forman $\\vec{A}$ y $\\vec{B}$', [['el triángulo que forman $\\vec{A}$ y $\\vec{B}$'], ['el cuadrado de lado $A$'], ['el círculo de radio $B$']], 'Base $A$ por altura $B\\sin\\theta$.'),
    C('k-signo-j', 'vectorial', 2, 'En el determinante de $\\vec{A}\\times\\vec{B}$, el término de $\\hat{\\jmath}$…', 'lleva signo menos', [['lleva signo más'], ['siempre es cero'], ['no depende de $A_x$']], 'Los cofactores alternan $+, -, +$.'),
    C('k-plano', 'vectorial', 3, 'Si $\\vec{A}$ y $\\vec{B}$ están en el plano $xy$, $\\vec{A}\\times\\vec{B}$ apunta…', 'a lo largo del eje $z$', [['en el plano $xy$'], ['a lo largo de $\\vec{A}$'], ['a $45^\\circ$ del plano']], 'Es perpendicular al plano que contiene a los dos.'),
    C('k-trabajo', 'aplicaciones', 1, 'El trabajo de una fuerza constante durante un desplazamiento es…', '$\\vec{F}\\cdot\\vec{d}$', [['$\\vec{F}\\times\\vec{d}$'], ['$|\\vec{F}| + |\\vec{d}|$'], ['$\\vec{F}/\\vec{d}$']], 'Es un producto escalar (S12).'),
    C('k-trabajo-perp', 'aplicaciones', 2, 'Una fuerza perpendicular al desplazamiento hace un trabajo…', 'igual a cero', [['máximo'], ['negativo'], ['igual a $Fd$']], '$\\cos 90^\\circ = 0$.'),
    C('k-torque', 'aplicaciones', 2, 'El torque de una fuerza respecto a un punto es…', '$\\vec{r}\\times\\vec{F}$', [['$\\vec{r}\\cdot\\vec{F}$'], ['$\\vec{F}\\times\\vec{r}$'], ['$|\\vec{r}| + |\\vec{F}|$']], 'Es un producto vectorial (S15).'),
    C('k-torque-max', 'aplicaciones', 2, 'Para aflojar un tornillo con la misma fuerza y el mayor torque, empujas…', 'perpendicular a la llave y lo más lejos del tornillo', [['paralelo a la llave'], ['cerca del tornillo'], ['a $45^\\circ$ de la llave']], '$\\tau = rF\\sin\\theta$: máximo con $r$ grande y $\\theta = 90^\\circ$.'),
    C('k-friccion', 'aplicaciones', 3, 'La fricción que se opone al movimiento hace un trabajo…', 'negativo', [['positivo'], ['cero'], ['igual al de la fuerza que empuja']], 'Forma $180^\\circ$ con el desplazamiento.'),
    C('k-perp-test', 'aplicaciones', 3, 'Para saber rápido si dos direcciones son perpendiculares conviene calcular…', 'su producto escalar', [['su producto vectorial'], ['su suma'], ['sus magnitudes']], 'Si da cero, son perpendiculares.'),
    C('k-normal', 'aplicaciones', 2, 'Para obtener un vector perpendicular a otros dos vectores dados se usa…', 'el producto vectorial', [['el producto escalar'], ['la resta'], ['el vector unitario']], '$\\vec{A}\\times\\vec{B}$ es perpendicular a los dos.'),
    C('k-potencia', 'aplicaciones', 3, 'Si la fuerza sobre un objeto es perpendicular a su velocidad, la potencia $P = \\vec{F}\\cdot\\vec{v}$…', 'es cero', [['es máxima'], ['es negativa'], ['es $Fv$']], 'Como en el movimiento circular: la fuerza cambia la dirección, no la rapidez.')
  ];

  K.register({
    'f1.S03.unitario': 'Vector unitario y magnitud',
    'f1.S03.escalar': 'Producto escalar y proyección',
    'f1.S03.angulo': 'Ángulo entre vectores',
    'f1.S03.vectorial': 'Producto vectorial',
    'f1.S03.aplicaciones': 'Trabajo, torque y potencia'
  }, Q);
})();
