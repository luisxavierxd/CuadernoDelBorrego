/* =====================================================================
   Banco · Física 2 · S14 · Leyes de Kirchhoff II: varias mallas como sistema de ecuaciones.
   100 preguntas propias. Unidades: V, Ω, A, W; capacitancia en μF y carga en μC.
   Circuitos descritos en el enunciado:
     dos nodos  tres ramas entre a (arriba) y b (abajo): izquierda ε₁ y R₁, en medio R₂,
                derecha ε₂ y R₃ (fem con su + hacia a); corrientes I₁ ↑, I₂ ↓, I₃ ↑.
     tres mallas  corrientes de malla en horario; izquierda ε₁ (empuja en horario) y R₁,
                R₂ compartida por las mallas 1 y 2, R₃ arriba de la malla 2, R₄ compartida
                por las mallas 2 y 3, derecha R₅ y ε₂ (se opone al horario) o un capacitor.
   Las respuestas se calculan aquí con Cramer o sustitución. Las numéricas con `alt` se
   recalculan por otra ruta (el solver nodal: LabMath.kirchsys.solveNodal → LabMath.capnet.nodal)
   en scripts/labs-math/kirchhoff-solve.js.
   ===================================================================== */
(function () {
  var KIT = window.CBBankKit('f2', '14'), C = KIT.C;
  function N(id, sub, d, vars, prompt, answer, why, o) {
    o = o || {};
    var q = KIT.N(id, sub, d, vars, prompt, answer, why, o);
    var base = o.where;
    q.where = function (v) {
      if (base && !base(v)) return false;
      var a = answer(v);
      if (!isFinite(a) || (o.min !== 0 && Math.abs(a) < (o.min || 0.1))) return false;
      if (!o.mistakes) return true;
      var vals = [a].concat(Object.keys(o.mistakes).map(function (m) { return o.mistakes[m](v); }));
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) {
          if (Math.abs(vals[i] - vals[j]) <= Math.max(0.05, 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j])))) return false;
        }
      }
      return true;
    };
    if (o.alt) q.alt = o.alt;
    return q;
  }
  function fb(key, say) { return [{ when: key, say: say }]; }
  function det3(m) {
    return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  }
  function cramer(A, b) {
    var D = det3(A);
    return [0, 1, 2].map(function (j) { return det3(A.map(function (r, i) { return r.map(function (x, k) { return k === j ? b[i] : x; }); })) / D; });
  }
  // Dos nodos (I₁ ↑, I₂ ↓, I₃ ↑): I₁ − I₂ + I₃ = 0; R₁I₁ + R₂I₂ = ε₁ − ε_m; R₂I₂ + R₃I₃ = ε₂ − ε_m  (ε_m: fem de en medio, + hacia a).
  function two(v, em) { em = em || 0; return cramer([[1, -1, 1], [v.r1, v.r2, 0], [0, v.r2, v.r3]], [0, v.e1 - em, v.e2 - em]); }
  function two2(v) { return two(v, v.em); }
  function spec2(v, em) { return { topo: 'two', R: [v.r1, v.r2, v.r3], E: [v.e1, em || 0, v.e2] }; }
  function nod2(LM, v, em) { return LM.kirchsys.solveNodal(spec2(v, em), [1, -1, 1]); }
  function desc2(v, em) {
    return 'Tres ramas unen el nodo $a$ (arriba) con el nodo $b$ (abajo). La izquierda tiene $\\varepsilon_1 = ' + v.e1 + '\\ \\text{V}$ y $R_1 = ' + v.r1 + '\\ \\Omega$; la de en medio, ' +
      (em ? '$\\varepsilon_3 = ' + em + '\\ \\text{V}$ y ' : '') + '$R_2 = ' + v.r2 + '\\ \\Omega$; la derecha, $\\varepsilon_2 = ' + v.e2 + '\\ \\text{V}$ y $R_3 = ' + v.r3 + '\\ \\Omega$. Todas las fem tienen su terminal $+$ hacia $a$.';
  }
  var ARR = ' Flechas: $I_1$ hacia arriba en la izquierda, $I_2$ hacia abajo en medio e $I_3$ hacia arriba en la derecha.';
  // Tres mallas (horario): diagonal = suma de la malla; fuera, −R compartida.
  function meshA(v) { return [[v.r1 + v.r2, -v.r2, 0], [-v.r2, v.r2 + v.r3 + v.r4, -v.r4], [0, -v.r4, v.r4 + v.r5]]; }
  function three(v, s2) { return cramer(meshA(v), [v.e1, 0, -(s2 == null ? v.e2 : s2)]); }
  function spec3(v) { return { topo: 'three', R: [v.r1, v.r2, v.r3, v.r4, v.r5], E: [v.e1, 0, 0, 0, -v.e2] }; }
  function nod3(LM, v) { return LM.kirchsys.solveNodal(spec3(v)); }
  function desc3(v) {
    return 'En un circuito de tres mallas, con corrientes de malla en sentido horario: la rama izquierda tiene $\\varepsilon_1 = ' + v.e1 + '\\ \\text{V}$ (empuja en horario) y $R_1 = ' + v.r1 + '\\ \\Omega$; $R_2 = ' + v.r2 + '\\ \\Omega$ la comparten las mallas 1 y 2; $R_3 = ' + v.r3 + '\\ \\Omega$ está arriba en la malla 2; $R_4 = ' + v.r4 + '\\ \\Omega$ la comparten las mallas 2 y 3; la rama derecha tiene $R_5 = ' + v.r5 + '\\ \\Omega$ y $\\varepsilon_2 = ' + v.e2 + '\\ \\text{V}$, que se opone al horario.';
  }
  // Con capacitor en la rama derecha (en lugar de ε₂): estado estable, la malla 3 vale 0.
  function capI(v) { var a = v.r1 + v.r2, d = v.r2 + v.r3 + v.r4, D = a * d - v.r2 * v.r2; return { I1: v.e1 * d / D, I2: v.e1 * v.r2 / D }; }
  function specC(v) { return { topo: 'three', R: [v.r1, v.r2, v.r3, v.r4, v.r5], E: [v.e1, 0, 0, 0, 0], C: v.c }; }
  function descC(v) {
    return 'En un circuito de tres mallas: la rama izquierda tiene $\\varepsilon = ' + v.e1 + '\\ \\text{V}$ y $R_1 = ' + v.r1 + '\\ \\Omega$; $R_2 = ' + v.r2 + '\\ \\Omega$ la comparten las mallas 1 y 2; $R_3 = ' + v.r3 + '\\ \\Omega$ está arriba en la malla 2; $R_4 = ' + v.r4 + '\\ \\Omega$ la comparten las mallas 2 y 3; la rama derecha tiene $R_5 = ' + v.r5 + '\\ \\Omega$ en serie con un capacitor de $' + v.c + '\\ \\mu\\text{F}$.';
  }
  // Una batería ε con R₁ en serie alimenta a R₂; el capacitor C (con R₃ en su rama) está en paralelo con R₂.
  function nodalCap(LM, v) {
    // Batería ε con R₁ de b hacia a (Norton: ε/R₁ inyectada en a), R₂ entre a y b; la rama del capacitor está abierta.
    var pot = LM.capnet.nodal({ nodes: ['b', 'a'], fixed: { b: 0 }, inject: { a: v.e / v.r1 },
      branches: [{ a: 'a', b: 'b', value: 1 / v.r1 }, { a: 'a', b: 'b', value: 1 / v.r2 }] });
    return pot.a;
  }
  function descS(v) { return 'Una batería de $' + v.e + '\\ \\text{V}$ en serie con $R_1 = ' + v.r1 + '\\ \\Omega$ alimenta a $R_2 = ' + v.r2 + '\\ \\Omega$. En paralelo con $R_2$ hay una rama con $R_3 = ' + v.r3 + '\\ \\Omega$ y un capacitor de $' + v.c + '\\ \\mu\\text{F}$ en serie.'; }
  var LS = ' Después de mucho tiempo,';

  var T2 = { e1: [6, 24, 3], e2: [3, 18, 3], r1: [1, 10, 1], r2: [1, 10, 1], r3: [1, 10, 1] };
  var T3 = { e1: [6, 24, 3], e2: [3, 15, 3], r1: [1, 6, 1], r2: [1, 8, 1], r3: [1, 6, 1], r4: [1, 8, 1], r5: [1, 6, 1] };
  var TC = { e1: [6, 24, 3], r1: [1, 6, 1], r2: [1, 8, 1], r3: [1, 6, 1], r4: [1, 8, 1], r5: [1, 6, 1], c: [2, 20, 2] };
  var TS = { e: [6, 24, 3], r1: [1, 10, 1], r2: [1, 10, 1], r3: [1, 10, 1], c: [1, 20, 1] };

  var Q = [
    /* ---------------- Planteamiento ---------------- */
    N('pl-nodos', 'planteamiento', 1, { n: [2, 8, 1] },
      function (v) { return 'Un circuito tiene $' + v.n + '$ nodos. ¿Cuántas ecuaciones de nodo independientes puedes escribir?'; },
      function (v) { return v.n - 1; }, 'Son $n - 1$: la del último nodo es la suma de las demás.',
      { mistakes: { all: function (v) { return v.n; } }, feedback: fb('all', 'Una sobra: si sumas las ecuaciones de todos los nodos sale $0 = 0$.') }),
    N('pl-mallas', 'planteamiento', 1, { n: [2, 6, 1], b: [3, 10, 1] },
      function (v) { return 'Un circuito sin capacitores tiene $' + v.n + '$ nodos y $' + v.b + '$ ramas. ¿Cuántas ecuaciones de malla independientes necesitas?'; },
      function (v) { return v.b - v.n + 1; }, 'Mallas independientes: $b - n + 1$.',
      { where: function (v) { return v.b >= v.n; }, mistakes: { bn: function (v) { return v.b - v.n; } }, feedback: fb('bn', 'Te faltó el $+1$: son $b - n + 1$.') }),
    N('pl-ramas', 'planteamiento', 2, { n: [2, 6, 1], m: [1, 5, 1] },
      function (v) { return 'Un circuito tiene $' + v.n + '$ nodos y $' + v.m + '$ ventanas (mallas independientes). ¿Cuántas ramas tiene?'; },
      function (v) { return v.m + v.n - 1; }, 'De $m = b - n + 1$: $b = m + n - 1$.',
      { mistakes: { mn: function (v) { return v.m + v.n; } }, feedback: fb('mn', 'Despeja bien: $b = m + n - 1$.') }),
    N('pl-total', 'planteamiento', 2, { n: [3, 7, 1], m: [2, 4, 1] },
      function (v) { return 'Con corrientes de rama, un circuito de $' + v.n + '$ nodos y $' + v.m + '$ mallas independientes, ¿cuántas ecuaciones escribes en total?'; },
      function (v) { return v.m + v.n - 1; }, 'Una por incógnita: $(n - 1) + m$, que es el número de ramas.',
      { mistakes: { extra: function (v) { return v.m + v.n; } }, feedback: fb('extra', 'Contaste la ecuación de todos los nodos; una sobra.') }),
    N('pl-nodo', 'planteamiento', 1, { a: [0.5, 5, 0.5], b: [0.5, 5, 0.5] },
      function (v) { return 'A un nodo llegan $I_1 = ' + v.a + '\\ \\text{A}$ e $I_3 = ' + v.b + '\\ \\text{A}$, y sale solo $I_2$. ¿Cuánto vale $I_2$, en A?'; },
      function (v) { return v.a + v.b; }, 'Lo que entra es lo que sale: $I_2 = I_1 + I_3$.',
      { mistakes: { diff: function (v) { return Math.abs(v.a - v.b); } }, feedback: fb('diff', 'Las dos entran: se suman.') }),
    N('pl-malla', 'planteamiento', 1, { e1: [6, 24, 3], r1: [1, 8, 1], r2: [1, 8, 1], i1: [0.5, 2, 0.5] },
      function (v) { return 'La malla izquierda de un circuito da $' + v.r1 + 'I_1 + ' + v.r2 + 'I_2 = ' + v.e1 + '$ (en A). Si ya sabes que $I_1 = ' + v.i1 + '\\ \\text{A}$, ¿cuánto vale $I_2$, en A?'; },
      function (v) { return (v.e1 - v.r1 * v.i1) / v.r2; }, 'Despeja: $I_2 = (\\varepsilon_1 - R_1I_1)/R_2$.',
      { where: function (v) { return v.e1 > v.r1 * v.i1 + 0.5; }, mistakes: { add: function (v) { return (v.e1 + v.r1 * v.i1) / v.r2; } }, feedback: fb('add', 'Pasa $R_1I_1$ restando al otro lado.') }),
    N('pl-diag', 'planteamiento', 1, { r1: [1, 10, 1], r2: [1, 10, 1], r3: [1, 10, 1], r4: [1, 10, 1] },
      function (v) { return 'Con corrientes de malla en horario, la malla 2 de un circuito de tres mallas tiene $R_2 = ' + v.r2 + '\\ \\Omega$ (compartida con la malla 1), $R_3 = ' + v.r3 + '\\ \\Omega$ (solo suya) y $R_4 = ' + v.r4 + '\\ \\Omega$ (compartida con la malla 3); $R_1 = ' + v.r1 + '\\ \\Omega$ está solo en la malla 1. ¿Cuánto vale el coeficiente de $I_2$ en la ecuación de la malla 2, en Ω?'; },
      function (v) { return v.r2 + v.r3 + v.r4; }, 'En la diagonal va la suma de todas las resistencias de la malla.',
      { mistakes: { own: function (v) { return v.r3; } }, feedback: fb('own', 'Por $R_2$ y $R_4$ también pasa $I_2$: entran en la suma.') }),
    N('pl-fuera', 'planteamiento', 2, { r1: [1, 10, 1], r2: [1, 10, 1], r3: [1, 10, 1] },
      function (v) { return 'Con corrientes de malla en horario, las mallas 1 y 2 comparten $R_2 = ' + v.r2 + '\\ \\Omega$; la malla 1 además tiene $R_1 = ' + v.r1 + '\\ \\Omega$ y la 2, $R_3 = ' + v.r3 + '\\ \\Omega$. En la ecuación de la malla 1, ¿cuál es el coeficiente de $I_2$, en Ω?'; },
      function (v) { return -v.r2; }, 'Por la rama compartida pasa $I_1 - I_2$: el término es $-R_2(I_1 - I_2)$ y el coeficiente de $I_2$ es $-R_2$.',
      { mistakes: { pos: function (v) { return v.r2; } }, feedback: fb('pos', 'En horario las dos corrientes cruzan la rama compartida en sentidos contrarios: el coeficiente es negativo.') }),

    /* ---------------- Sistemas ---------------- */
    N('si-i1', 'sistemas', 2, T2,
      function (v) { return desc2(v) + ARR + ' ¿Cuánto vale $I_1$, en A?'; },
      function (v) { return two(v)[0]; }, 'Nodo $a$: $I_1 - I_2 + I_3 = 0$; mallas: $R_1I_1 + R_2I_2 = \\varepsilon_1$ y $R_2I_2 + R_3I_3 = \\varepsilon_2$.',
      { unit: 'A', mistakes: { flip: function (v) { return cramer([[1, -1, 1], [v.r1, v.r2, 0], [0, v.r2, v.r3]], [0, v.e1, -v.e2])[0]; } }, feedback: fb('flip', 'El signo de $\\varepsilon_2$ en la malla derecha está al revés.'),
        alt: function (v, LM) { return nod2(LM, v).x[0]; } }),
    N('si-i2', 'sistemas', 2, T2,
      function (v) { return desc2(v) + ARR + ' ¿Cuánto vale $I_2$ (la corriente de en medio), en A?'; },
      function (v) { return two(v)[1]; }, 'Resuelve el sistema de 3 ecuaciones; $I_2$ siempre baja si las dos fem empujan hacia $a$.',
      { unit: 'A', mistakes: { alone: function (v) { return v.e1 / (v.r1 + v.r2); } }, feedback: fb('alone', 'Resolviste la malla izquierda como si estuviera sola; la derecha también manda corriente por $R_2$.'),
        alt: function (v, LM) { return nod2(LM, v).x[1]; } }),
    N('si-i3', 'sistemas', 3, T2,
      function (v) { return desc2(v) + ARR + ' ¿Cuánto vale $I_3$, con su signo, en A?'; },
      function (v) { return two(v)[2]; }, 'Resuelve el sistema; si sale negativa, la corriente baja por la derecha.',
      { unit: 'A', mistakes: { abs: function (v) { return -two(v)[2]; } }, feedback: fb('abs', 'El signo está al revés: con la flecha hacia arriba, negativo significa que baja.'),
        alt: function (v, LM) { return nod2(LM, v).x[2]; } }),
    N('si-vab', 'sistemas', 2, T2,
      function (v) { return desc2(v) + ' ¿Cuánto vale el voltaje $V_{ab}$, en V?'; },
      function (v) { return v.r2 * two(v)[1]; }, '$V_{ab} = R_2I_2$, con $I_2$ del sistema.',
      { unit: 'V', mistakes: { e1: function (v) { return v.e1; } }, feedback: fb('e1', '$V_{ab}$ no es la fem: $R_1$ también tiene caída.'),
        alt: function (v, LM) { return nod2(LM, v).pot.A; } }),
    N('si-medio', 'sistemas', 3, { e1: [6, 24, 3], e2: [3, 18, 3], em: [3, 12, 3], r1: [1, 8, 1], r2: [1, 8, 1], r3: [1, 8, 1] },
      function (v) { return desc2(v, v.em) + ARR + ' ¿Cuánto vale $I_2$, con su signo, en A?'; },
      function (v) { return two2(v)[1]; }, 'Ahora cada malla cruza también $\\varepsilon_3$: $R_1I_1 + R_2I_2 = \\varepsilon_1 - \\varepsilon_3$ y $R_2I_2 + R_3I_3 = \\varepsilon_2 - \\varepsilon_3$.',
      { unit: 'A', mistakes: { noMid: function (v) { return two(v)[1]; } }, feedback: fb('noMid', 'Olvidaste la fem de en medio: aparece en las dos mallas.'),
        alt: function (v, LM) { return nod2(LM, v, v.em).x[1]; } }),
    N('si-det2', 'sistemas', 1, { a: [1, 9, 1], b: [1, 9, 1], c: [1, 9, 1], d: [1, 9, 1] },
      function (v) { return 'Calcula el determinante de la matriz $\\begin{pmatrix}' + v.a + ' & -' + v.b + ' \\\\ -' + v.c + ' & ' + v.d + '\\end{pmatrix}$.'; },
      function (v) { return v.a * v.d - v.b * v.c; }, '$\\det = ad - bc$, cuidando los signos.',
      { min: 0, where: function (v) { return v.a * v.d !== v.b * v.c; }, mistakes: { plus: function (v) { return v.a * v.d + v.b * v.c; } }, feedback: fb('plus', 'Los dos de fuera son negativos, pero su producto es positivo: $ad - (-b)(-c) = ad - bc$.') }),
    N('si-det3', 'sistemas', 2, { a: [2, 9, 1], b: [1, 5, 1], c: [2, 9, 1], d: [1, 5, 1], e: [2, 9, 1] },
      function (v) { return 'Calcula el determinante de $\\begin{pmatrix}' + v.a + ' & -' + v.b + ' & 0 \\\\ -' + v.b + ' & ' + v.c + ' & -' + v.d + ' \\\\ 0 & -' + v.d + ' & ' + v.e + '\\end{pmatrix}$.'; },
      function (v) { return det3([[v.a, -v.b, 0], [-v.b, v.c, -v.d], [0, -v.d, v.e]]); }, 'Desarrolla por el primer renglón: $a(ce - d^2) - (-b)(-be) = a(ce - d^2) - b^2e$.',
      { min: 0, where: function (v) { return det3([[v.a, -v.b, 0], [-v.b, v.c, -v.d], [0, -v.d, v.e]]) !== 0 && v.c * v.e !== v.d * v.d; }, mistakes: { diag: function (v) { return v.a * v.c * v.e; } }, feedback: fb('diag', 'El producto de la diagonal solo es el determinante si la matriz es triangular.'),
        alt: function (v, LM) {
          // Gauss: el determinante es el producto de los pivotes (sin intercambios, la matriz es diagonal dominante o se pivotea).
          var A = [[v.a, -v.b, 0], [-v.b, v.c, -v.d], [0, -v.d, v.e]];
          var x = LM.kirchsys.gauss(A, [1, 0, 0]);
          return 1 / x[0] * (v.c * v.e - v.d * v.d);          // (A⁻¹)₁₁ = cofactor₁₁ / det
        } }),
    N('si-cramer2', 'sistemas', 1, { a: [2, 9, 1], b: [1, 5, 1], c: [2, 9, 1], e: [6, 24, 3] },
      function (v) { return 'Resuelve $' + v.a + 'I_1 - ' + v.b + 'I_2 = ' + v.e + '$ y $-' + v.b + 'I_1 + ' + v.c + 'I_2 = 0$. ¿Cuánto vale $I_1$, en A?'; },
      function (v) { return v.e * v.c / (v.a * v.c - v.b * v.b); }, 'Cramer: $I_1 = \\dfrac{\\varepsilon c}{ac - b^2}$.',
      { where: function (v) { return v.a * v.c > v.b * v.b; }, mistakes: { noB: function (v) { return v.e / v.a; } }, feedback: fb('noB', 'No ignores $I_2$: las dos ecuaciones van juntas.'),
        alt: function (v, LM) { return LM.kirchsys.gauss([[v.a, -v.b, 0], [-v.b, v.c, 0], [0, 0, 1]], [v.e, 0, 0])[0]; } }),
    N('si-cramer2b', 'sistemas', 2, { a: [2, 9, 1], b: [1, 5, 1], c: [2, 9, 1], e: [6, 24, 3], f: [3, 12, 3] },
      function (v) { return 'Resuelve el sistema $' + v.a + 'I_1 - ' + v.b + 'I_2 = ' + v.e + '$, $-' + v.b + 'I_1 + ' + v.c + 'I_2 = ' + v.f + '$. ¿Cuánto vale $I_2$, en A?'; },
      function (v) { return (v.a * v.f + v.b * v.e) / (v.a * v.c - v.b * v.b); }, 'Cramer: $I_2 = \\dfrac{a f - (-b)e}{ac - b^2}$.',
      { where: function (v) { return v.a * v.c > v.b * v.b; }, mistakes: { sign: function (v) { return (v.a * v.f - v.b * v.e) / (v.a * v.c - v.b * v.b); } }, feedback: fb('sign', 'Revisa el signo del producto cruzado en el numerador.'),
        alt: function (v, LM) { return LM.kirchsys.gauss([[v.a, -v.b, 0], [-v.b, v.c, 0], [0, 0, 1]], [v.e, v.f, 0])[1]; } }),
    N('si-gauss3', 'sistemas', 2, { a: [2, 6, 1], b: [1, 4, 1], c: [2, 6, 1], e: [6, 24, 6] },
      function (v) { return 'Resuelve $I_1 - I_2 + I_3 = 0$, $' + v.a + 'I_1 + ' + v.b + 'I_2 = ' + v.e + '$ y $' + v.b + 'I_2 + ' + v.c + 'I_3 = 0$. ¿Cuánto vale $I_2$, en A?'; },
      function (v) { return cramer([[1, -1, 1], [v.a, v.b, 0], [0, v.b, v.c]], [0, v.e, 0])[1]; }, 'Elimina $I_1$ con el primer renglón, luego $I_3$; despeja.',
      { mistakes: { two: function (v) { return v.e / (v.a + v.b); } }, feedback: fb('two', 'Ese sería el resultado sin la tercera rama: aquí $I_3 \\neq 0$.'),
        alt: function (v, LM) { return LM.kirchsys.gauss([[1, -1, 1], [v.a, v.b, 0], [0, v.b, v.c]], [0, v.e, 0])[1]; } }),
    N('si-paso', 'sistemas', 1, { a: [2, 9, 1], b: [1, 9, 1] },
      function (v) { return 'En la matriz aumentada, el renglón 1 es $(1,\\ -1,\\ 1 \\mid 0)$ y el renglón 2 es $(' + v.a + ',\\ ' + v.b + ',\\ 0 \\mid 12)$. Para eliminar $I_1$ del renglón 2 le restas $' + v.a + '$ veces el renglón 1. ¿Cuál es el nuevo coeficiente de $I_2$?'; },
      function (v) { return v.b + v.a; }, '$' + 'b - a(-1) = b + a$.',
      { mistakes: { minus: function (v) { return v.b - v.a; } }, feedback: fb('minus', 'Restas $a$ veces $-1$: eso suma.') }),

    /* ---------------- Tres mallas ---------------- */
    N('tm-i1', 'tres-mallas', 2, T3,
      function (v) { return desc3(v) + ' ¿Cuánto vale la corriente de malla $I_1$, en A?'; },
      function (v) { return three(v)[0]; }, 'Tres ecuaciones de malla: diagonal con la suma de cada malla y $-R$ compartida fuera de ella.',
      { unit: 'A', mistakes: { flip: function (v) { return three(v, -v.e2)[0]; } }, feedback: fb('flip', '$\\varepsilon_2$ se opone al horario: su término es $-\\varepsilon_2$.'),
        alt: function (v, LM) { return nod3(LM, v).x[0]; } }),
    N('tm-i3', 'tres-mallas', 3, T3,
      function (v) { return desc3(v) + ' ¿Cuánto vale la corriente de malla $I_3$, con su signo, en A?'; },
      function (v) { return three(v)[2]; }, 'Si sale negativa, la malla 3 gira en antihorario.',
      { unit: 'A', mistakes: { flip: function (v) { return three(v, -v.e2)[2]; }, abs: function (v) { return -three(v)[2]; } },
        feedback: [{ when: 'flip', say: 'El signo de $\\varepsilon_2$ en la malla 3 está al revés.' }, { when: 'abs', say: 'El signo está al revés.' }],
        alt: function (v, LM) { return nod3(LM, v).x[2]; } }),
    N('tm-r2', 'tres-mallas', 2, T3,
      function (v) { return desc3(v) + ' ¿Cuánta corriente pasa por $R_2$, en A? (Su magnitud.)'; },
      function (v) { var x = three(v); return Math.abs(x[0] - x[1]); }, 'Por la rama compartida pasa $I_1 - I_2$.',
      { unit: 'A', mistakes: { mesh: function (v) { return Math.abs(three(v)[0]); } }, feedback: fb('mesh', 'Por $R_2$ pasa la diferencia $I_1 - I_2$, no solo $I_1$.'),
        alt: function (v, LM) { return Math.abs(nod3(LM, v).i[1]); } }),
    N('tm-r4', 'tres-mallas', 3, T3,
      function (v) { return desc3(v) + ' ¿Qué corriente circula por el resistor $R_4$ (magnitud, en A)?'; },
      function (v) { var x = three(v); return Math.abs(x[1] - x[2]); }, 'Por $R_4$ pasa $I_2 - I_3$.',
      { unit: 'A', mistakes: { sum: function (v) { var x = three(v); return Math.abs(x[1] + x[2]); } }, feedback: fb('sum', 'Las dos mallas cruzan $R_4$ en sentidos contrarios: es la diferencia.'),
        alt: function (v, LM) { return Math.abs(nod3(LM, v).i[3]); } }),
    N('tm-vr3', 'tres-mallas', 2, T3,
      function (v) { return desc3(v) + ' ¿Qué voltaje tiene $R_3$, en V? (Su magnitud.)'; },
      function (v) { return v.r3 * Math.abs(three(v)[1]); }, '$R_3$ solo está en la malla 2: $V = R_3|I_2|$.',
      { unit: 'V', mistakes: { r2: function (v) { return v.r2 * Math.abs(three(v)[1]); } }, feedback: fb('r2', 'Usa la resistencia de $R_3$.'),
        alt: function (v, LM) { var s = nod3(LM, v); return Math.abs(s.pot.T1 - s.pot.T2); } }),
    N('tm-vac', 'tres-mallas', 3, T3,
      function (v) { return desc3(v) + ' ¿Qué voltaje hay entre el extremo de arriba y el de abajo de $R_2$, en V? (Su magnitud.)'; },
      function (v) { var x = three(v); return v.r2 * Math.abs(x[0] - x[1]); }, '$V = R_2|I_1 - I_2|$.',
      { unit: 'V', mistakes: { mesh: function (v) { return v.r2 * Math.abs(three(v)[0]); } }, feedback: fb('mesh', 'Por $R_2$ pasa $I_1 - I_2$.'),
        alt: function (v, LM) { return Math.abs(nod3(LM, v).pot.T1); } }),
    N('tm-dif', 'tres-mallas', 1, { a: [1, 6, 0.5], b: [0.5, 4, 0.5] },
      function (v) { return 'Las corrientes de malla (en horario) de dos mallas vecinas son $I_1 = ' + v.a + '\\ \\text{A}$ e $I_2 = ' + v.b + '\\ \\text{A}$. ¿Cuánta corriente pasa por la rama que comparten, en A? (Su magnitud.)'; },
      function (v) { return Math.abs(v.a - v.b); }, 'En la rama compartida pasa $I_1 - I_2$.',
      { where: function (v) { return v.a !== v.b; }, mistakes: { sum: function (v) { return v.a + v.b; } }, feedback: fb('sum', 'En horario, las dos cruzan esa rama en sentidos contrarios: se restan.') }),
    N('tm-dif2', 'tres-mallas', 1, { a: [1, 6, 0.5], b: [0.5, 4, 0.5], r: [1, 10, 1] },
      function (v) { return 'Dos mallas vecinas (las dos en horario) llevan $I_1 = ' + v.a + '\\ \\text{A}$ e $I_2 = -' + v.b + '\\ \\text{A}$. Comparten un resistor de $' + v.r + '\\ \\Omega$. ¿Cuánta corriente pasa por él, en A?'; },
      function (v) { return v.a + v.b; }, 'Por la rama compartida pasa $I_1 - I_2$, cada una con su signo: restar una negativa es sumar.',
      { mistakes: { diff: function (v) { return Math.abs(v.a - v.b); } }, feedback: fb('diff', 'Cuida el signo: $I_1 - (-I) = I_1 + I$.') }),
    N('tm-diag1', 'tres-mallas', 1, { r1: [1, 10, 1], r2: [1, 10, 1], r3: [1, 10, 1] },
      function (v) { return 'Con corrientes de malla en horario, la malla 1 tiene $R_1 = ' + v.r1 + '\\ \\Omega$ y comparte $R_2 = ' + v.r2 + '\\ \\Omega$ con la malla 2, que además tiene $R_3 = ' + v.r3 + '\\ \\Omega$. ¿Cuánto vale el coeficiente de $I_1$ en la ecuación de la malla 1, en Ω?'; },
      function (v) { return v.r1 + v.r2; }, 'Diagonal: suma de las resistencias de la malla 1.',
      { where: function (v) { return v.r1 + v.r2 !== v.r2 + v.r3; }, mistakes: { own: function (v) { return v.r1; }, other: function (v) { return v.r2 + v.r3; } },
        feedback: [{ when: 'own', say: 'Por $R_2$ también pasa $I_1$: entra en la suma.' }, { when: 'other', say: 'Esa es la diagonal de la malla 2.' }] }),
    N('tm-p1', 'tres-mallas', 3, T3,
      function (v) { return desc3(v) + ' ¿Qué potencia entrega $\\varepsilon_1$, en W? (Con su signo.)'; },
      function (v) { return v.e1 * three(v)[0]; }, '$\\varepsilon_1$ está solo en la malla 1: $P = \\varepsilon_1I_1$.',
      { unit: 'W', mistakes: { flip: function (v) { return v.e1 * three(v, -v.e2)[0]; } }, feedback: fb('flip', 'El signo de $\\varepsilon_2$ en la malla 3 está al revés.'),
        alt: function (v, LM) { return nod3(LM, v).P[0]; } }),

    /* ---------------- Independencia ---------------- */
    N('in-todos', 'independencia', 1, { n: [3, 9, 1] },
      function (v) { return 'Escribes la regla de nodos en los $' + v.n + '$ nodos de un circuito. ¿Cuántas de esas ecuaciones son independientes?'; },
      function (v) { return v.n - 1; }, 'La suma de todas da $0 = 0$: una depende de las demás.',
      { mistakes: { all: function (v) { return v.n; } }, feedback: fb('all', 'Si sumas todas, sale $0 = 0$: una es la suma de las otras.') }),
    N('in-grande', 'independencia', 2, { e1: [6, 24, 3], e2: [3, 18, 3], r1: [1, 10, 1], r3: [1, 10, 1] },
      function (v) { return 'Las ventanas de un circuito de dos nodos dan $R_1I_1 + R_2I_2 = ' + v.e1 + '$ y $-R_2I_2 - R_3I_3 = -' + v.e2 + '$ (las dos en horario). Si las sumas, sale la malla grande. ¿Cuánto vale su lado derecho, en V?'; },
      function (v) { return v.e1 - v.e2; }, 'Se suman los lados derechos: $\\varepsilon_1 - \\varepsilon_2$. El término de $R_2$ se cancela.',
      { min: 0, where: function (v) { return v.e1 !== v.e2; }, mistakes: { plus: function (v) { return v.e1 + v.e2; } }, feedback: fb('plus', 'El segundo lado derecho es negativo.') }),
    N('in-k', 'independencia', 2, { a: [1, 6, 1], b: [1, 6, 1], c: [1, 6, 1], k: [2, 5, 1] },
      function (v) { return 'Las ecuaciones 1 y 2 de un sistema son $(' + v.a + ',\\ 0,\\ ' + v.b + ' \\mid 6)$ y $(0,\\ 1,\\ ' + v.c + ' \\mid 2)$. La ecuación 3 es $(' + v.a + ',\\ ' + v.k + ',\\ ' + (v.b + v.k * v.c) + ' \\mid ' + (6 + 2 * v.k) + ')$. Es la 1 más $k$ veces la 2. ¿Cuánto vale $k$?'; },
      function (v) { return v.k; }, 'Compara la columna de $I_2$: $0 + k(1) = k$. Es dependiente: el sistema no tiene solución única.',
      { min: 0 }),
    N('in-ventanas', 'independencia', 1, { m: [2, 6, 1] },
      function (v) { return 'Un circuito dibujado en un plano tiene $' + v.m + '$ ventanas (huecos encerrados por cables). ¿Cuántas ecuaciones de malla independientes tiene?'; },
      function (v) { return v.m; }, 'Las ventanas son exactamente las mallas independientes.',
      { mistakes: { more: function (v) { return v.m + 1; } }, feedback: fb('more', 'El borde de afuera no cuenta: es la suma de las ventanas.') }),
    N('in-det', 'independencia', 2, { a: [1, 9, 1], b: [1, 9, 1], k: [2, 4, 1] },
      function (v) { return 'Un sistema de dos ecuaciones tiene la matriz $\\begin{pmatrix}' + v.a + ' & ' + v.b + ' \\\\ ' + v.k * v.a + ' & x\\end{pmatrix}$. ¿Para qué valor de $x$ las ecuaciones son dependientes?'; },
      function (v) { return v.k * v.b; }, 'Dependientes si $\\det = 0$: $' + 'ax - kab = 0$, así que $x = kb$.',
      { mistakes: { inv: function (v) { return v.b / v.k; } }, feedback: fb('inv', 'El segundo renglón es $k$ veces el primero: $x = kb$.') }),

    /* ---------------- Capacitores ---------------- */
    N('ca-q', 'capacitores', 2, TC,
      function (v) { return descC(v) + LS + ' ¿cuánta carga tiene el capacitor, en μC?'; },
      function (v) { return v.c * v.r4 * capI(v).I2; }, 'Rama del capacitor abierta; resuelve las mallas 1 y 2; $V_C = I_2R_4$ y $Q = CV_C$.',
      { unit: 'μC', mistakes: { emf: function (v) { return v.c * v.e1; }, wire: function (v) { var x = three(v, 0); return v.c * v.r4 * Math.abs(x[1] - x[2]); } },
        feedback: [{ when: 'emf', say: 'El capacitor tiene el voltaje de $R_4$, no el de la batería.' }, { when: 'wire', say: 'Lo trataste como cable: en estado estable por su rama no pasa corriente.' }],
        alt: function (v, LM) { return LM.kirchsys.solveNodal(specC(v)).Q; } }),
    N('ca-v', 'capacitores', 2, TC,
      function (v) { return descC(v) + LS + ' ¿qué voltaje tiene el capacitor, en V?'; },
      function (v) { return v.r4 * capI(v).I2; }, 'El capacitor está entre los mismos nodos que $R_4$ y $R_5$ no tiene caída: $V_C = I_2R_4$.',
      { unit: 'V', mistakes: { emf: function (v) { return v.e1; } }, feedback: fb('emf', 'No tiene todo el voltaje de la batería: tiene el de $R_4$.'),
        alt: function (v, LM) { return Math.abs(LM.kirchsys.solveNodal(specC(v)).VC); } }),
    N('ca-i1', 'capacitores', 2, TC,
      function (v) { return descC(v) + LS + ' ¿qué corriente entrega la batería, en A?'; },
      function (v) { return capI(v).I1; }, 'Con la malla 3 en cero quedan dos mallas: $I_1$ es la corriente de la batería.',
      { unit: 'A', mistakes: { wire: function (v) { return three(v, 0)[0]; } }, feedback: fb('wire', 'Dejaste pasar corriente por la rama del capacitor; en estado estable vale 0.'),
        alt: function (v, LM) { return LM.kirchsys.solveNodal(specC(v)).x[0]; } }),
    N('ca-u', 'capacitores', 3, TC,
      function (v) { return descC(v) + LS + ' ¿cuánta energía guarda el capacitor, en μJ?'; },
      function (v) { var V = v.r4 * capI(v).I2; return 0.5 * v.c * V * V; }, '$U = \\tfrac{1}{2}CV_C^2$ con $V_C = I_2R_4$ (μF × V² = μJ).',
      { unit: 'μJ', mistakes: { noHalf: function (v) { var V = v.r4 * capI(v).I2; return v.c * V * V; } }, feedback: fb('noHalf', 'Te faltó el $\\tfrac{1}{2}$.'),
        alt: function (v, LM) { var s = LM.kirchsys.solveNodal(specC(v)); return 0.5 * s.Q * Math.abs(s.VC); } }),
    N('ca-par', 'capacitores', 1, TS,
      function (v) { return descS(v) + LS + ' ¿qué voltaje tiene el capacitor, en V?'; },
      function (v) { return v.e * v.r2 / (v.r1 + v.r2); }, 'Por la rama del capacitor no pasa corriente: $R_1$ y $R_2$ quedan en serie y el capacitor tiene el voltaje de $R_2$ ($R_3$ no tiene caída).',
      { unit: 'V', mistakes: { emf: function (v) { return v.e; }, r3: function (v) { return v.e * (v.r2 + v.r3) / (v.r1 + v.r2 + v.r3); } },
        feedback: [{ when: 'emf', say: '$R_1$ se queda con parte del voltaje.' }, { when: 'r3', say: 'Por $R_3$ no pasa corriente: no entra en el divisor.' }],
        alt: function (v, LM) { return nodalCap(LM, v); } }),
    N('ca-parq', 'capacitores', 2, TS,
      function (v) { return descS(v) + LS + ' ¿cuánta carga tiene el capacitor, en μC?'; },
      function (v) { return v.c * v.e * v.r2 / (v.r1 + v.r2); }, '$Q = CV_C$ con $V_C$ = el voltaje de $R_2$.',
      { unit: 'μC', mistakes: { emf: function (v) { return v.c * v.e; } }, feedback: fb('emf', 'El capacitor no tiene todo el voltaje de la batería.'),
        alt: function (v, LM) { return v.c * nodalCap(LM, v); } }),
    N('ca-pari', 'capacitores', 1, TS,
      function (v) { return descS(v) + LS + ' ¿qué corriente entrega la batería, en A?'; },
      function (v) { return v.e / (v.r1 + v.r2); }, 'Sin corriente por la rama del capacitor, quedan $R_1$ y $R_2$ en serie.',
      { unit: 'A', mistakes: { par: function (v) { return v.e / (v.r1 + v.r2 * v.r3 / (v.r2 + v.r3)); } }, feedback: fb('par', 'Pusiste $R_3$ en paralelo con $R_2$: por esa rama no pasa corriente.'),
        alt: function (v, LM) { return (v.e - nodalCap(LM, v)) / v.r1; } }),
    N('ca-serie', 'capacitores', 1, { e: [3, 24, 1], r: [1, 20, 1], c: [1, 20, 1] },
      function (v) { return 'Un capacitor de $' + v.c + '\\ \\mu\\text{F}$ en serie con $R = ' + v.r + '\\ \\Omega$ se conecta a una batería de $' + v.e + '\\ \\text{V}$.' + LS + ' ¿cuánta carga tiene, en μC?'; },
      function (v) { return v.c * v.e; }, 'Sin corriente, $R$ no tiene caída: el capacitor tiene todo el voltaje.',
      { unit: 'μC', mistakes: { ir: function (v) { return v.c * v.e / v.r; } }, feedback: fb('ir', 'No hay corriente en estado estable: el voltaje del capacitor es el de la batería.') }),
    N('ca-r5', 'capacitores', 1, TC,
      function (v) { return descC(v) + LS + ' ¿qué voltaje tiene $R_5$, en V? (Escribe 0 si no tiene.)'; },
      function (v) { return 0; }, 'Por la rama del capacitor no pasa corriente: $V = IR_5 = 0$.',
      { unit: 'V', min: 0 }),

    /* ---------------- Potencias ---------------- */
    N('po-p1', 'potencias', 2, T2,
      function (v) { return desc2(v) + ' ¿Qué potencia entrega $\\varepsilon_1$, en W?'; },
      function (v) { return v.e1 * two(v)[0]; }, '$P_1 = \\varepsilon_1I_1$ con $I_1$ del sistema.',
      { unit: 'W', where: function (v) { return two(v)[0] > 0; }, mistakes: { heat: function (v) { var I = two(v)[0]; return I * I * v.r1; } }, feedback: fb('heat', 'Eso es lo que disipa $R_1$.'),
        alt: function (v, LM) { var s = nod2(LM, v); return s.Pdis - s.P[2]; } }),
    N('po-p2', 'potencias', 3, T2,
      function (v) { return desc2(v) + ' ¿Qué potencia entrega $\\varepsilon_2$, en W? Si la recibe (se está cargando), escríbela negativa.'; },
      function (v) { return v.e2 * two(v)[2]; }, '$P_2 = \\varepsilon_2I_3$ con $I_3$ hacia arriba: si $I_3 < 0$, la batería se carga.',
      { unit: 'W', mistakes: { abs: function (v) { return -v.e2 * two(v)[2]; } }, feedback: fb('abs', 'El signo está al revés: revisa hacia dónde va $I_3$.'),
        alt: function (v, LM) { return nod2(LM, v).P[2]; } }),
    N('po-r2', 'potencias', 2, T2,
      function (v) { return desc2(v) + ' ¿Qué potencia disipa $R_2$, en W?'; },
      function (v) { var I = two(v)[1]; return I * I * v.r2; }, '$P = I_2^2R_2$.',
      { unit: 'W', mistakes: { noSq: function (v) { return two(v)[1] * v.r2; } }, feedback: fb('noSq', 'Eso es el voltaje: la potencia es $I^2R$.'),
        alt: function (v, LM) { var s = nod2(LM, v); return s.pot.A * s.pot.A / v.r2; } }),
    N('po-tot', 'potencias', 2, T2,
      function (v) { return desc2(v) + ' ¿Cuánta potencia disipan en total los tres resistores, en W?'; },
      function (v) { var x = two(v); return x[0] * x[0] * v.r1 + x[1] * x[1] * v.r2 + x[2] * x[2] * v.r3; }, '$\\sum I^2R$, que debe ser igual a $\\sum \\varepsilon I$.',
      { unit: 'W', mistakes: { sup: function (v) { var x = two(v); return v.e1 * x[0] + v.e2 * Math.abs(x[2]); } }, feedback: fb('sup', 'Cuida el signo de la potencia de $\\varepsilon_2$: si se carga, resta.'),
        alt: function (v, LM) { return nod2(LM, v).Psup; } }),
    N('po-bal', 'potencias', 1, { p1: [10, 60, 5], p2: [-10, 30, 5], a: [2, 20, 1], b: [2, 20, 1] },
      function (v) { return 'En un circuito, una batería entrega $' + v.p1 + '\\ \\text{W}$ y otra $' + v.p2 + '\\ \\text{W}$ (negativo: se está cargando). Dos de los tres resistores disipan $' + v.a + '\\ \\text{W}$ y $' + v.b + '\\ \\text{W}$. ¿Cuánto disipa el tercero, en W?'; },
      function (v) { return v.p1 + v.p2 - v.a - v.b; }, 'Balance: $\\sum \\varepsilon I = \\sum I^2R$.',
      { where: function (v) { return v.p2 !== 0 && v.p1 + v.p2 - v.a - v.b > 0; }, mistakes: { abs: function (v) { return v.p1 + Math.abs(v.p2) - v.a - v.b; } }, feedback: fb('abs', 'La batería que se carga resta: usa su potencia con signo.') }),
    N('po-ei', 'potencias', 1, { e: [3, 24, 3], i: [0.5, 5, 0.5] },
      function (v) { return 'Por una batería de $' + v.e + '\\ \\text{V}$ pasan $' + v.i + '\\ \\text{A}$ de su terminal $-$ a su terminal $+$ (por dentro). ¿Qué potencia entrega, en W?'; },
      function (v) { return v.e * v.i; }, '$P = \\varepsilon I$, positiva porque la corriente la cruza de $-$ a $+$.',
      { mistakes: { neg: function (v) { return -v.e * v.i; } }, feedback: fb('neg', 'De $-$ a $+$ por dentro, la batería entrega energía: positiva.') }),
    N('po-carga', 'potencias', 1, { e: [3, 24, 3], i: [0.5, 5, 0.5] },
      function (v) { return 'Una batería de $' + v.e + '\\ \\text{V}$ se está cargando: la cruzan $' + v.i + '\\ \\text{A}$ de su terminal $+$ a su terminal $-$. ¿Qué potencia entrega, con su signo, en W?'; },
      function (v) { return -v.e * v.i; }, 'Al revés de como entrega: recibe energía, $P = -\\varepsilon I$.',
      { mistakes: { pos: function (v) { return v.e * v.i; } }, feedback: fb('pos', 'Se está cargando: entrega una potencia negativa.') }),
    N('po-energia', 'potencias', 2, T2,
      function (v) { return desc2(v) + ' ¿Cuánta energía entrega $\\varepsilon_1$ en un minuto, en J?'; },
      function (v) { return 60 * v.e1 * two(v)[0]; }, '$E = Pt = \\varepsilon_1I_1(60\\ \\text{s})$.',
      { unit: 'J', where: function (v) { return two(v)[0] > 0; }, mistakes: { sec: function (v) { return v.e1 * two(v)[0]; } }, feedback: fb('sec', 'Eso es la potencia (por segundo); multiplica por 60 s.'),
        alt: function (v, LM) { var s = nod2(LM, v); return 60 * (s.Pdis - s.P[2]); } }),

    /* ---------------- Más numéricas (con ruta alterna) ---------------- */
    N('si-vr1', 'sistemas', 2, T2,
      function (v) { return desc2(v) + ARR + ' ¿Qué voltaje tiene $R_1$, en V? (Su magnitud.)'; },
      function (v) { return v.r1 * Math.abs(two(v)[0]); }, '$V_1 = R_1|I_1|$, con $I_1$ del sistema.',
      { unit: 'V', mistakes: { emf: function (v) { return v.e1 - v.r1 * Math.abs(two(v)[0]); } }, feedback: fb('emf', 'Eso es $V_{ab}$; el voltaje de $R_1$ es $R_1I_1$.'),
        alt: function (v, LM) { return Math.abs(v.e1 - nod2(LM, v).pot.A); } }),
    N('si-i3m', 'sistemas', 3, { e1: [6, 24, 3], e2: [3, 18, 3], em: [3, 12, 3], r1: [1, 8, 1], r2: [1, 8, 1], r3: [1, 8, 1] },
      function (v) { return desc2(v, v.em) + ARR + ' Calcula $I_1$ con su signo (en A).'; },
      function (v) { return two2(v)[0]; }, 'La fem de en medio aparece en las dos mallas: $R_1I_1 + R_2I_2 = \\varepsilon_1 - \\varepsilon_3$ y $R_2I_2 + R_3I_3 = \\varepsilon_2 - \\varepsilon_3$.',
      { unit: 'A', mistakes: { noMid: function (v) { return two(v)[0]; } }, feedback: fb('noMid', 'Olvidaste $\\varepsilon_3$, que está en la rama de en medio.'),
        alt: function (v, LM) { return nod2(LM, v, v.em).x[0]; } }),
    N('tm-i2', 'tres-mallas', 2, T3,
      function (v) { return desc3(v) + ' Halla la corriente de malla $I_2$ (en A).'; },
      function (v) { return three(v)[1]; }, 'La malla 2 no tiene fem: $-R_2I_1 + (R_2 + R_3 + R_4)I_2 - R_4I_3 = 0$, junto con las otras dos.',
      { unit: 'A', mistakes: { flip: function (v) { return three(v, -v.e2)[1]; } }, feedback: fb('flip', 'El signo de $\\varepsilon_2$ en la malla 3 está al revés.'),
        alt: function (v, LM) { return nod3(LM, v).x[1]; } }),
    N('tm-vr5', 'tres-mallas', 3, T3,
      function (v) { return desc3(v) + ' ¿Cuál es la caída de voltaje en $R_5$ (magnitud, en V)?'; },
      function (v) { return v.r5 * Math.abs(three(v)[2]); }, '$R_5$ solo está en la malla 3: $V = R_5|I_3|$.',
      { unit: 'V', mistakes: { flip: function (v) { return v.r5 * Math.abs(three(v, -v.e2)[2]); } }, feedback: fb('flip', 'El signo de $\\varepsilon_2$ está al revés en la malla 3.'),
        alt: function (v, LM) { return v.r5 * Math.abs(nod3(LM, v).i[4]); } }),
    N('tm-pdis', 'tres-mallas', 3, T3,
      function (v) { return desc3(v) + ' ¿Cuánta potencia disipan en total los cinco resistores, en W?'; },
      function (v) { var x = three(v), i = [x[0], x[0] - x[1], x[1], x[1] - x[2], x[2]], R = [v.r1, v.r2, v.r3, v.r4, v.r5]; return i.reduce(function (s, c, k) { return s + c * c * R[k]; }, 0); },
      '$\\sum I^2R$ con la corriente real de cada rama ($I_1 - I_2$ y $I_2 - I_3$ en las compartidas).',
      { unit: 'W', mistakes: { mesh: function (v) { var x = three(v); return x[0] * x[0] * (v.r1 + v.r2) + x[1] * x[1] * (v.r2 + v.r3 + v.r4) + x[2] * x[2] * (v.r4 + v.r5); } }, feedback: fb('mesh', 'En las ramas compartidas pasa la diferencia; no sumes $I^2R$ de cada malla por separado.'),
        alt: function (v, LM) { return nod3(LM, v).Psup; } }),
    N('ca-vr2', 'capacitores', 2, TC,
      function (v) { return descC(v) + LS + ' ¿qué voltaje tiene $R_2$, en V?'; },
      function (v) { var s = capI(v); return v.r2 * Math.abs(s.I1 - s.I2); }, 'Por $R_2$ pasa $I_1 - I_2$; la malla 3 vale 0.',
      { unit: 'V', mistakes: { mesh: function (v) { return v.r2 * capI(v).I1; } }, feedback: fb('mesh', 'Por $R_2$ pasa $I_1 - I_2$, no solo $I_1$.'),
        alt: function (v, LM) { return Math.abs(LM.kirchsys.solveNodal(specC(v)).pot.T1); } }),
    N('ca-i2', 'capacitores', 2, TC,
      function (v) { return descC(v) + LS + ' ¿qué corriente pasa por $R_3$, en A?'; },
      function (v) { return capI(v).I2; }, '$R_3$ solo está en la malla 2: lleva $I_2$.',
      { unit: 'A', mistakes: { wire: function (v) { return Math.abs(three(v, 0)[1]); } }, feedback: fb('wire', 'En estado estable por la rama del capacitor no pasa corriente; no la cuentes como malla.'),
        alt: function (v, LM) { return LM.kirchsys.solveNodal(specC(v)).i[2]; } }),
    N('po-r1', 'potencias', 2, T2,
      function (v) { return desc2(v) + ' ¿Cuánto calor por segundo produce $R_1$, en W?'; },
      function (v) { var I = two(v)[0]; return I * I * v.r1; }, '$P = I_1^2R_1$.',
      { unit: 'W', mistakes: { ei: function (v) { return v.e1 * Math.abs(two(v)[0]); } }, feedback: fb('ei', 'Eso es lo que entrega la batería; $R_1$ disipa $I_1^2R_1$.'),
        alt: function (v, LM) { var d = v.e1 - nod2(LM, v).pot.A; return d * d / v.r1; } }),

    /* ---------------- Conceptuales: planteamiento ---------------- */
    C('k-pl-sentido', 'planteamiento', 1, 'Antes de plantear, eliges el sentido de cada corriente. Si eliges uno al revés…',
      'la corriente sale negativa y el resultado sigue siendo correcto', [['tienes que volver a empezar', 'No: el signo te avisa y el valor sirve igual.'], ['el sistema no tiene solución', 'El sentido no afecta que haya solución.'], ['cambian las magnitudes de todas las corrientes', 'Solo cambia el signo de esa corriente.']],
      'El sentido es una suposición; el signo la corrige.'),
    C('k-pl-rama', 'planteamiento', 1, '¿Qué es una rama de un circuito?',
      'Un tramo entre dos nodos, donde todos los elementos llevan la misma corriente', [['Cualquier cable', 'Varios cables y elementos pueden formar una sola rama.'], ['Una malla', 'Una malla es un camino cerrado.'], ['Un resistor', 'Una rama puede tener varios elementos.']],
      'Una corriente por rama.'),
    C('k-pl-nodo', 'planteamiento', 1, '¿Qué es un nodo?',
      'Un punto donde se unen tres cables o más', [['Cualquier punto de un cable', 'Solo cuentan los puntos donde la corriente se reparte.'], ['Una esquina del dibujo', 'Una esquina sin bifurcación no es nodo.'], ['La terminal de una batería', 'Puede o no ser nodo.']],
      'Ahí la corriente se reparte.'),
    C('k-pl-convencion', 'planteamiento', 2, 'Recorres una malla y cruzas un resistor en contra de la flecha de su corriente. Su término es…',
      '$+IR$', [['$-IR$', 'Eso es a favor de la corriente.'], ['$0$', 'Hay caída aunque la recorras al revés.'], ['depende del signo final de $I$', 'El signo del término sale de la flecha, no del resultado.']],
      'En contra de la corriente el potencial sube (convención de la S13).'),
    C('k-pl-fem', 'planteamiento', 2, 'Al pasar el sistema a forma matricial, las fem van…',
      'al lado derecho, con el signo que les toca al cruzarlas', [['en la diagonal de la matriz', 'La matriz lleva resistencias y $\\pm 1$.'], ['con las corrientes, multiplicadas por $R$', 'Las fem no multiplican a ninguna corriente.'], ['siempre positivas', 'Su signo depende de cómo las cruzas.']],
      '$A\\vec{I} = \\vec{b}$: $\\vec{b}$ lleva las fem.'),
    C('k-pl-orden', 'planteamiento', 2, '¿Qué debes cuidar al escribir la matriz $A$?',
      'Que cada columna sea siempre la misma corriente, en el mismo orden', [['Que la diagonal sea positiva', 'Ayuda, pero no es obligatorio.'], ['Que no haya ceros', 'Los ceros son normales: esa corriente no aparece en esa ecuación.'], ['Que todos los renglones sumen cero', 'No tiene por qué.']],
      'Columna $j$ = coeficientes de $I_j$.'),
    C('k-pl-malla-mas', 'planteamiento', 3, 'Con corrientes de malla, ¿por qué ya no escribes ecuaciones de nodo?',
      'Porque cada corriente de malla entra y sale de cada nodo: la regla de nodos se cumple sola', [['Porque los nodos desaparecen', 'Los nodos siguen ahí.'], ['Porque no hay corriente en los nodos', 'Sí pasa corriente.'], ['Porque solo valen en circuitos de una malla', 'La regla de nodos vale siempre.']],
      'Por eso tres mallas son solo tres ecuaciones.'),

    /* ---------------- Conceptuales: sistemas ---------------- */
    C('k-si-det', 'sistemas', 1, 'Si $\\det A \\neq 0$, el sistema $A\\vec{I} = \\vec{b}$…',
      'tiene una sola solución', [['no tiene solución', 'Eso puede pasar si $\\det A = 0$.'], ['tiene infinitas soluciones', 'Eso puede pasar si $\\det A = 0$.'], ['depende de $\\vec{b}$', 'Con $\\det A \\neq 0$, siempre una sola.']],
      'Ecuaciones independientes.'),
    C('k-si-cramer', 'sistemas', 1, 'En la regla de Cramer, $D_2$ es el determinante de $A$…',
      'con la columna 2 cambiada por $\\vec{b}$', [['con el renglón 2 cambiado por $\\vec{b}$', 'Se cambia la columna, no el renglón.'], ['sin la columna 2', 'Sigue siendo una matriz cuadrada completa.'], ['multiplicado por $I_2$', 'No: $I_2 = D_2/D$.']],
      '$I_j = D_j/D$.'),
    C('k-si-gauss', 'sistemas', 2, 'En la eliminación de Gauss, ¿qué buscas?',
      'Que el último renglón tenga una sola incógnita, para despejar de abajo hacia arriba', [['Que todos los coeficientes sean 1', 'No hace falta.'], ['Sumar todas las ecuaciones', 'Se combinan renglones para eliminar incógnitas.'], ['Que la matriz sea simétrica', 'La simetría no es el objetivo.']],
      'Triangular y luego sustituir hacia atrás.'),
    C('k-si-calc', 'sistemas', 2, 'Tu calculadora resolvió el sistema sin problema, pero el balance de potencias no cierra. Lo más probable es que…',
      'un signo esté mal en alguna ecuación', [['la calculadora se equivocó', 'La calculadora resuelve bien lo que le das.'], ['falta una ecuación', 'Si faltara, no habría podido resolver.'], ['el balance no aplica a varias mallas', 'Aplica siempre.']],
      'La calculadora resuelve con precisión un sistema mal planteado.'),
    C('k-si-renglon', 'sistemas', 1, 'Multiplicar una ecuación del sistema por $-1$…',
      'no cambia la solución', [['cambia el signo de todas las corrientes', 'La ecuación dice lo mismo.'], ['vuelve dependiente al sistema', 'Sigue siendo la misma ecuación.'], ['solo se permite en las de nodo', 'Se permite en cualquiera.']],
      'Es la misma igualdad.'),
    C('k-si-cero', 'sistemas', 2, 'En la matriz de un circuito, un coeficiente es $0$. Eso significa que…',
      'esa corriente no aparece en esa ecuación', [['esa corriente vale cero', 'El valor de la corriente sale al resolver.'], ['el circuito está abierto', 'No necesariamente.'], ['hay un error', 'Es muy común.']],
      'Por ejemplo, una malla que no toca esa rama.'),
    C('k-si-unidades', 'sistemas', 3, 'En una ecuación de malla del tipo $A\\vec{I} = \\vec{b}$, los coeficientes de $A$ y las entradas de $\\vec{b}$ tienen unidades de…',
      'ohms y volts', [['volts y amperes', 'Las corrientes son las incógnitas.'], ['amperes y ohms', 'Al revés no da volts.'], ['no tienen unidades', '$R \\cdot I$ = volts.']],
      'Cada término es $RI$ (V) o $\\varepsilon$ (V).'),

    /* ---------------- Conceptuales: tres mallas ---------------- */
    C('k-tm-compartida', 'tres-mallas', 1, 'Con corrientes de malla en horario, por una rama compartida por las mallas 1 y 2 pasa…',
      '$I_1 - I_2$', [['$I_1 + I_2$', 'En horario las dos la cruzan en sentidos contrarios.'], ['$I_1$', 'También pasa la de la malla 2.'], ['cero', 'Solo si $I_1 = I_2$.']],
      'La diferencia de las dos.'),
    C('k-tm-ventaja', 'tres-mallas', 1, '¿Qué ventaja tienen las corrientes de malla?',
      'Menos incógnitas: una por ventana en vez de una por rama', [['Siempre dan corrientes positivas', 'Pueden salir negativas.'], ['No necesitan convención de signos', 'Sí la necesitan.'], ['Funcionan sin la regla de mallas', 'Justo usan la regla de mallas.']],
      'Tres mallas: 3 ecuaciones en vez de 5.'),
    C('k-tm-diag', 'tres-mallas', 2, 'En la matriz de corrientes de malla (todas en horario), los números de la diagonal son…',
      'la suma de las resistencias de cada malla', [['las resistencias compartidas', 'Esas van fuera de la diagonal, con signo menos.'], ['las fem', 'Las fem van del lado derecho.'], ['siempre 1', 'Eso es en las ecuaciones de nodo.']],
      'Fuera de la diagonal: $-R$ compartida.'),
    C('k-tm-simetrica', 'tres-mallas', 3, 'Con corrientes de malla, todas en horario y sin fuentes dependientes, la matriz resulta…',
      'simétrica: el coeficiente de $I_2$ en la malla 1 es igual al de $I_1$ en la malla 2', [['diagonal', 'Las mallas vecinas comparten resistencias.'], ['con ceros en la diagonal', 'La diagonal es la suma de cada malla.'], ['triangular', 'Hay términos arriba y abajo de la diagonal.']],
      'Los dos son $-R$ de la rama que comparten.'),
    C('k-tm-negativa', 'tres-mallas', 2, 'Te sale $I_3 = -1.5\\ \\text{A}$ (corriente de malla en horario). Eso significa que…',
      'la malla 3 gira en antihorario con 1.5 A', [['hay un error', 'Las corrientes de malla pueden salir negativas.'], ['por la malla 3 no pasa corriente', 'Pasa, en sentido contrario.'], ['las otras dos también son negativas', 'Cada una tiene su propio signo.']],
      'El signo compara con el sentido supuesto.'),
    C('k-tm-real', 'tres-mallas', 2, 'Las corrientes de malla, ¿son las corrientes que mide un amperímetro?',
      'En una rama que no se comparte sí; en una compartida mide la diferencia', [['Siempre', 'En las ramas compartidas no.'], ['Nunca', 'En las ramas propias de una malla sí.'], ['Solo si todas son positivas', 'El signo no es el problema.']],
      'Son una herramienta de cálculo.'),
    C('k-tm-frontera', 'tres-mallas', 3, 'Una batería está en la rama compartida por las mallas 1 y 2. En las ecuaciones de malla aparece…',
      'en las dos, con signos opuestos', [['solo en la malla 1', 'Las dos mallas la cruzan.'], ['en las dos con el mismo signo', 'Las mallas la cruzan en sentidos contrarios.'], ['en ninguna', 'Las fem siempre aparecen en las mallas que las cruzan.']],
      'Cada malla la cruza en su propio sentido.'),

    /* ---------------- Conceptuales: independencia ---------------- */
    C('k-in-grande', 'independencia', 1, 'Escribes las dos ventanas de un circuito y además la malla grande. La malla grande…',
      'es la suma de las dos ventanas: no aporta información', [['es indispensable', 'Sobra: es combinación de las otras.'], ['contradice a las otras', 'Es consistente con ellas.'], ['es la única que hace falta', 'Las ventanas son las independientes.']],
      'Usa las ventanas.'),
    C('k-in-nodos', 'independencia', 1, '¿Por qué se usan $n - 1$ ecuaciones de nodo y no $n$?',
      'Porque la del último nodo es la suma de las demás', [['Porque un nodo no tiene corriente', 'Todos tienen.'], ['Por convención', 'Hay una razón: es dependiente.'], ['Porque el nodo de tierra no cuenta', 'Cuenta; solo que su ecuación sobra.']],
      'Sumando todas sale $0 = 0$.'),
    C('k-in-faltan', 'independencia', 2, 'Tienes 3 corrientes desconocidas y escribiste 2 ecuaciones independientes. Entonces…',
      'hay infinitas soluciones: te falta una ecuación', [['puedes resolver dos y adivinar la tercera', 'No hay forma de fijarla.'], ['el circuito no tiene solución', 'El circuito sí; tu sistema está incompleto.'], ['la tercera corriente vale cero', 'No se sigue de nada.']],
      'Tantas independientes como incógnitas.'),
    C('k-in-det0', 'independencia', 2, 'Tu calculadora marca error (determinante cero) al resolver tu sistema. ¿Qué pasó?',
      'Una de tus ecuaciones es combinación de las otras', [['Una corriente vale cero', 'Eso no hace cero el determinante.'], ['Elegiste mal un sentido', 'El sentido nunca vuelve dependiente al sistema.'], ['Hay demasiadas resistencias', 'El número de resistencias no importa.']],
      'Cambia esa ecuación por la de otro nodo o ventana.'),
    C('k-in-mas', 'independencia', 2, 'Si escribes más ecuaciones de las que necesitas (todas correctas)…',
      'las sobrantes son combinaciones de las otras y no cambian la solución', [['el sistema da otra solución', 'Las ecuaciones correctas no cambian la solución.'], ['el sistema no tiene solución', 'Si todas son correctas, son consistentes.'], ['tienes que promediar', 'No se promedia nada.']],
      'Solo importan las independientes.'),
    C('k-in-dos-nodos', 'independencia', 3, 'En un circuito de dos nodos escribes la regla de nodos en $a$ y en $b$. ¿Qué relación tienen?',
      'Una es la otra multiplicada por $-1$', [['Son independientes', 'Dicen lo mismo.'], ['Se contradicen', 'Son consistentes.'], ['Su suma da la malla grande', 'Su suma da $0 = 0$.']],
      'Lo que entra en $a$ es lo que sale de $b$.'),

    /* ---------------- Conceptuales: capacitores ---------------- */
    C('k-ca-estable', 'capacitores', 1, 'En estado estable (mucho tiempo después de conectar), por un capacitor…',
      'no pasa corriente', [['pasa la corriente máxima', 'Eso es justo al conectar, si estaba descargado.'], ['pasa la mitad de la corriente', 'No hay un reparto así.'], ['pasa la corriente de la batería', 'Entre sus placas hay un aislante.']],
      '$I = dQ/dt = 0$ cuando $Q$ ya no cambia.'),
    C('k-ca-rama', 'capacitores', 1, 'Para resolver un circuito en estado estable, la rama del capacitor se trata como…',
      'una rama abierta (cortada)', [['un cable', 'Su voltaje no es cero.'], ['un resistor de 0 Ω', 'Eso sería un cable.'], ['una batería de voltaje conocido', 'Su voltaje es lo que buscas.']],
      'Se resuelve sin ella y luego $Q = CV$.'),
    C('k-ca-voltaje', 'capacitores', 2, 'En estado estable, un capacitor tiene en serie un resistor $R$. El voltaje del capacitor es…',
      'el voltaje entre los dos nodos de su rama, porque $R$ no tiene caída', [['cero', 'Tiene el voltaje de los nodos.'], ['el de la batería siempre', 'Depende de dónde esté conectado.'], ['el voltaje de los nodos menos $IR$, con la corriente de la batería', 'Por $R$ no pasa corriente.']],
      'Sin corriente, $IR = 0$.'),
    C('k-ca-mallas', 'capacitores', 2, 'Un circuito de tres mallas tiene un capacitor en una rama que solo está en la malla 3. En estado estable…',
      'la corriente de malla $I_3$ vale cero y quedan dos mallas', [['la malla 3 se resuelve igual que las otras', 'No puedes recorrerla: el voltaje del capacitor es desconocido.'], ['todas las corrientes valen cero', 'Las otras mallas siguen con corriente.'], ['el capacitor tiene el voltaje de la batería', 'Tiene el de los nodos a los que se conecta.']],
      'Su rama abierta obliga $I_3 = 0$.'),
    C('k-ca-cable', 'capacitores', 2, 'Un compañero recorre una malla que cruza el capacitor como si fuera un cable. ¿Cuál es el error?',
      'El capacitor tiene un voltaje desconocido (no cero) y por su rama no pasa corriente', [['Ninguno, en estado estable es un cable', 'Es al revés: es una rama abierta.'], ['Debió poner $-IR$ en el capacitor', 'No es un resistor.'], ['Debió usar $Q = CV$ con la fem', 'El voltaje no es la fem.']],
      'Esa malla no se usa; se usa $I = 0$.'),
    C('k-ca-carga', 'capacitores', 2, 'Si en estado estable aumentas la resistencia que está en serie con el capacitor, su carga…',
      'no cambia', [['aumenta', 'Esa resistencia no tiene caída.'], ['disminuye', 'Esa resistencia no tiene caída.'], ['se vuelve cero', 'El capacitor sigue con su voltaje.']],
      'Sin corriente, esa resistencia no afecta el voltaje.'),
    C('k-ca-inicio', 'capacitores', 3, '¿Por qué el estado estable no es lo mismo que el momento de conectar?',
      'Al conectar el capacitor se está cargando y por su rama sí pasa corriente', [['Al conectar ya está cargado', 'Empieza descargado (o con otra carga).'], ['Las resistencias cambian con el tiempo', 'Las resistencias son las mismas.'], ['En el estado estable la batería se apaga', 'La batería sigue igual.']],
      'La transición se estudia en la S15 (circuito RC).'),

    /* ---------------- Conceptuales: potencias ---------------- */
    C('k-po-balance', 'potencias', 1, 'En cualquier circuito de baterías y resistores se cumple que…',
      'la potencia que entregan las baterías es igual a la que disipan los resistores', [['cada batería entrega lo que disipa su resistor', 'Solo vale para el total.'], ['las baterías entregan más de lo que se disipa', 'La energía se conserva.'], ['la potencia de cada resistor es la misma', 'Depende de $I^2R$ de cada uno.']],
      '$\\sum \\varepsilon I = \\sum I^2R$.'),
    C('k-po-signo', 'potencias', 1, 'Una batería con potencia $\\varepsilon I$ negativa…',
      'se está cargando: recibe energía', [['está descompuesta', 'Es normal cuando otra fuente más fuerte la empuja.'], ['entrega más energía', 'Negativa es que recibe.'], ['tiene resistencia interna cero', 'No tiene relación.']],
      'La corriente la cruza de $+$ a $-$.'),
    C('k-po-resistor', 'potencias', 1, 'La potencia que disipa un resistor…',
      'siempre es positiva, $I^2R$', [['puede ser negativa si la corriente va al revés', '$I^2$ no cambia de signo.'], ['es $IR$', 'Eso es el voltaje.'], ['depende del sentido de recorrido', 'No depende de cómo lo recorres.']],
      'Los resistores solo convierten energía en calor.'),
    C('k-po-comprobar', 'potencias', 2, '¿Por qué el balance de potencias es buena comprobación?',
      'Porque no depende de cómo planteaste el sistema: si no cierra, hay un signo mal', [['Porque es más fácil que resolver', 'Necesitas las corrientes para hacerlo.'], ['Porque siempre cierra aunque haya errores', 'Justo no cierra si hay errores.'], ['Porque solo usa las fem', 'Usa fem, corrientes y resistencias.']],
      'Es la conservación de la energía.'),
    C('k-po-dos', 'potencias', 2, 'Dos baterías empujan una contra otra en una malla. La más fuerte…',
      'entrega energía y la más débil la recibe', [['las dos entregan', 'La corriente cruza a la débil de $+$ a $-$.'], ['las dos reciben', 'Alguien tiene que entregar.'], ['ninguna, se cancelan', 'Si son distintas, hay corriente.']],
      'La débil se está cargando.'),
    C('k-po-unidades', 'potencias', 2, 'Un volt por un ampere es…',
      'un watt', [['un joule', 'Un joule es un watt por un segundo.'], ['un ohm', 'Un ohm es un volt entre un ampere.'], ['un coulomb', 'Un coulomb es un ampere por un segundo.']],
      '$P = \\varepsilon I$ en W.'),
    C('k-po-cap', 'potencias', 3, 'En estado estable, ¿cuánta potencia recibe un capacitor?',
      'Cero: no pasa corriente por él', [['$\\tfrac{1}{2}CV^2$ por segundo', 'Esa es la energía que guarda, y ya no cambia.'], ['$CV^2$', 'No es una potencia.'], ['La misma que la batería', 'La batería alimenta a los resistores.']],
      '$P = VI$ con $I = 0$.')
  ];

  KIT.register({
    'f2.S14.planteamiento': 'Plantear: nodos, ramas y signos',
    'f2.S14.sistemas': 'Sistemas: matriz, Gauss y Cramer',
    'f2.S14.tres-mallas': 'Tres mallas y corrientes de malla',
    'f2.S14.independencia': 'Ecuaciones independientes',
    'f2.S14.capacitores': 'Capacitores en estado estable',
    'f2.S14.potencias': 'Balance de potencias'
  }, Q);
})();
