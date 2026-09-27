/* =====================================================================
   Banco · Física 1 · S11 · Planos inclinados y dinámica circular.
   100 preguntas propias. g = 9.81 m/s², SI.
   ===================================================================== */
(function () {
  var K = window.CBBankKit('f1', '11'), C = K.C;
  var g = 9.81, RAD = Math.PI / 180, DEG = 180 / Math.PI;
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
  function sn(t) { return Math.sin(t * RAD); }
  function cs(t) { return Math.cos(t * RAD); }
  var TH = [10, 50, 5], MU = [0.05, 0.6, 0.05], ANG = { abs: 0.3 };
  var not45 = function (v) { return v.th !== 45; };

  var Q = [
    /* ---------------- Descomposición del peso ---------------- */
    N('cp-par', 'componentes', 1, { m: [1, 50, 1], th: TH }, function (v) { return 'Un bloque de $' + v.m + '\\ \\text{kg}$ está sobre un plano de $' + v.th + '^\\circ$. ¿Cuánto vale la componente de su peso a lo largo del plano?'; },
      function (v) { return v.m * g * sn(v.th); }, '$mg\\sin\\theta$.', { unit: 'N', where: not45, mistakes: { usedCos: function (v) { return v.m * g * cs(v.th); } }, feedback: fb('usedCos', 'A lo largo del plano va el seno: con $\\theta = 0$ debe dar cero.') }),
    N('cp-perp', 'componentes', 1, { m: [1, 50, 1], th: TH }, function (v) { return 'Un bloque de $' + v.m + '\\ \\text{kg}$ descansa en un plano de $' + v.th + '^\\circ$. ¿Cuánto vale la normal?'; },
      function (v) { return v.m * g * cs(v.th); }, '$N = mg\\cos\\theta$.', { unit: 'N', where: not45, mistakes: { usedSin: function (v) { return v.m * g * sn(v.th); }, usedMg: function (v) { return v.m * g; } }, feedback: [{ when: 'usedSin', say: 'Contra el plano va el coseno.' }, { when: 'usedMg', say: 'En un plano inclinado la normal es menor que $mg$.' }] }),
    N('cp-N-horiz', 'componentes', 2, { m: [1, 30, 1], th: TH, F: [10, 150, 10] }, function (v) { return 'Empujas horizontalmente con $' + v.F + '\\ \\text{N}$ un bloque de $' + v.m + '\\ \\text{kg}$ contra un plano de $' + v.th + '^\\circ$. ¿Cuánto vale la normal?'; },
      function (v) { return v.m * g * cs(v.th) + v.F * sn(v.th); }, 'La fuerza horizontal aprieta con $F\\sin\\theta$: $N = mg\\cos\\theta + F\\sin\\theta$.', { unit: 'N', mistakes: { onlyWeight: function (v) { return v.m * g * cs(v.th); } }, feedback: fb('onlyWeight', 'La fuerza horizontal también tiene componente contra el plano.') }),
    N('cp-a', 'componentes', 1, { th: [5, 60, 5] }, function (v) { return 'Un bloque baja por un plano sin fricción de $' + v.th + '^\\circ$. ¿Qué aceleración tiene?'; },
      function (v) { return g * sn(v.th); }, '$a = g\\sin\\theta$, sin importar la masa.', { unit: 'm/s²', where: not45, mistakes: { usedCos: function (v) { return g * cs(v.th); } }, feedback: fb('usedCos', 'Es $g\\sin\\theta$: con $\\theta = 90^\\circ$ debe dar caída libre.') }),
    N('cp-N-par', 'componentes', 2, { m: [1, 30, 1], th: TH, F: [10, 150, 10] }, function (v) { return 'Empujas con $' + v.F + '\\ \\text{N}$, paralelo al plano, un bloque de $' + v.m + '\\ \\text{kg}$ en un plano de $' + v.th + '^\\circ$. ¿Cuánto vale la normal?'; },
      function (v) { return v.m * g * cs(v.th); }, 'Una fuerza paralela al plano no cambia la normal.', { unit: 'N' }),
    N('cp-v', 'componentes', 2, { th: [10, 60, 5], L: [1, 20, 1] }, function (v) { return 'Un carrito se suelta en una rampa sin fricción de $' + v.th + '^\\circ$ y recorre $' + v.L + '\\ \\text{m}$. ¿Con qué rapidez llega abajo?'; },
      function (v) { return Math.sqrt(2 * g * sn(v.th) * v.L); }, '$v^2 = 2(g\\sin\\theta)L$.', { unit: 'm/s' }),
    N('cp-t', 'componentes', 2, { th: [10, 60, 5], L: [1, 20, 1] }, function (v) { return 'Un bloque se suelta en una rampa lisa de $' + v.th + '^\\circ$ y $' + v.L + '\\ \\text{m}$ de largo. ¿Cuánto tarda en bajar?'; },
      function (v) { return Math.sqrt(2 * v.L / (g * sn(v.th))); }, '$L = \\tfrac{1}{2}(g\\sin\\theta)t^2$.', { unit: 's' }),
    N('cp-cuerda', 'componentes', 1, { mb: [1, 50, 1], tb: TH }, function (v) { return 'Una cuerda paralela a un plano liso de $' + v.tb + '^\\circ$ sostiene en reposo un bloque de $' + v.mb + '\\ \\text{kg}$. ¿Cuánto vale la tensión?'; },
      function (v) { return v.mb * g * sn(v.tb); }, 'La tensión equilibra $mg\\sin\\theta$.', { unit: 'N' }),
    N('cp-horiz-sostener', 'componentes', 2, { m: [1, 30, 1], th: TH }, function (v) { return '¿Qué fuerza horizontal mantiene en reposo un bloque de $' + v.m + '\\ \\text{kg}$ sobre un plano liso de $' + v.th + '^\\circ$?'; },
      function (v) { return v.m * g * Math.tan(v.th * RAD); }, 'A lo largo del plano: $F\\cos\\theta = mg\\sin\\theta$.', { unit: 'N', where: not45, mistakes: { parallel: function (v) { return v.m * g * sn(v.th); } }, feedback: fb('parallel', 'Esa sería una fuerza paralela; siendo horizontal, solo $F\\cos\\theta$ va a lo largo.') }),

    /* ---------------- Ángulo crítico y fricción estática ---------------- */
    N('cr-angulo', 'critico', 1, { mus: [0.1, 1.2, 0.05] }, function (v) { return '¿A qué ángulo empieza a resbalar un bloque sobre una tabla con $\\mu_s = ' + v.mus + '$?'; },
      function (v) { return Math.atan(v.mus) * DEG; }, '$\\tan\\theta_c = \\mu_s$.', { unit: '°', tol: ANG, where: function (v) { return Math.abs(v.mus - 1) > 0.1; }, mistakes: { inverted: function (v) { return Math.atan(1 / v.mus) * DEG; } }, feedback: fb('inverted', 'Es $\\tan\\theta = \\mu_s$.') }),
    N('cr-mu', 'critico', 1, { th: [10, 50, 1] }, function (v) { return 'Una moneda empieza a resbalar cuando inclinas un libro $' + v.th + '^\\circ$. ¿Cuánto vale $\\mu_s$?'; },
      function (v) { return Math.tan(v.th * RAD); }, '$\\mu_s = \\tan\\theta_c$.', { tol: { abs: 0.005 }, where: function (v) { return v.th !== 45; }, mistakes: { usedSin: function (v) { return sn(v.th); } }, feedback: fb('usedSin', 'Es la tangente: $\\mu_s = \\sin\\theta/\\cos\\theta$.') }),
    N('cr-fs', 'critico', 1, { m: [1, 30, 1], th: [5, 30, 5], mus: [0.6, 1, 0.05] }, function (v) { return 'Un bloque de $' + v.m + '\\ \\text{kg}$ está en reposo en un plano de $' + v.th + '^\\circ$ ($\\mu_s = ' + v.mus + '$). ¿Cuánto vale la fricción estática?'; },
      function (v) { return v.m * g * sn(v.th); }, 'En reposo, la fricción equilibra $mg\\sin\\theta$.', { unit: 'N', mistakes: { maxS: function (v) { return v.mus * v.m * g * cs(v.th); } }, feedback: fb('maxS', 'Ese es el máximo; en reposo basta con igualar $mg\\sin\\theta$.') }),
    N('cr-subir', 'critico', 2, { m: [1, 30, 1], th: TH, mus: MU }, function (v) { return '¿Qué fuerza mínima, paralela al plano, empieza a subir un bloque de $' + v.m + '\\ \\text{kg}$ por una rampa de $' + v.th + '^\\circ$ con $\\mu_s = ' + v.mus + '$?'; },
      function (v) { return v.m * g * (sn(v.th) + v.mus * cs(v.th)); }, 'Hay que vencer $mg\\sin\\theta$ y la fricción, que ahora apunta plano abajo.', { unit: 'N', mistakes: { noFriction: function (v) { return v.m * g * sn(v.th); } }, feedback: fb('noFriction', 'También hay que vencer la fricción estática.') }),
    N('cr-sostener', 'critico', 3, { m: [1, 30, 1], th: [20, 60, 5], mus: [0.05, 0.4, 0.05] }, function (v) { return 'Un bloque de $' + v.m + '\\ \\text{kg}$ tiende a resbalar por una rampa de $' + v.th + '^\\circ$ ($\\mu_s = ' + v.mus + '$). ¿Qué fuerza mínima paralela al plano, hacia arriba, lo mantiene quieto?'; },
      function (v) { return v.m * g * (sn(v.th) - v.mus * cs(v.th)); }, 'La fricción ayuda a sostenerlo: $F = mg(\\sin\\theta - \\mu_s\\cos\\theta)$.', { unit: 'N', where: function (v) { return Math.tan(v.th * RAD) > v.mus + 0.1; }, mistakes: { plus: function (v) { return v.m * g * (sn(v.th) + v.mus * cs(v.th)); } }, feedback: fb('plus', 'Para sostenerlo, la fricción apunta plano arriba y te ayuda: se resta.') }),
    N('cr-fsmax', 'critico', 2, { m: [1, 30, 1], th: TH, mus: MU }, function (v) { return '¿Cuál es la fricción estática máxima sobre un bloque de $' + v.m + '\\ \\text{kg}$ en un plano de $' + v.th + '^\\circ$ con $\\mu_s = ' + v.mus + '$?'; },
      function (v) { return v.mus * v.m * g * cs(v.th); }, '$\\mu_sN$ con $N = mg\\cos\\theta$.', { unit: 'N', where: not45, mistakes: { usedMg: function (v) { return v.mus * v.m * g; } }, feedback: fb('usedMg', 'En el plano, $N = mg\\cos\\theta$.') }),

    /* ---------------- Movimiento con fricción ---------------- */
    N('mo-baja', 'movimiento', 2, { th: [20, 60, 5], muk: MU }, function (v) { return 'Un bloque baja deslizando por un plano de $' + v.th + '^\\circ$ con $\\mu_k = ' + v.muk + '$. ¿Qué aceleración tiene?'; },
      function (v) { return g * (sn(v.th) - v.muk * cs(v.th)); }, '$a = g(\\sin\\theta - \\mu_k\\cos\\theta)$.', { unit: 'm/s²', where: function (v) { return sn(v.th) - v.muk * cs(v.th) > 0.1 && not45(v); }, mistakes: { noFriction: function (v) { return g * sn(v.th); } }, feedback: fb('noFriction', 'Te faltó la fricción.') }),
    N('mo-sube', 'movimiento', 2, { th: TH, muk: MU }, function (v) { return 'Un bloque sube deslizando por un plano de $' + v.th + '^\\circ$ con $\\mu_k = ' + v.muk + '$. ¿Cuánto vale su desaceleración?'; },
      function (v) { return g * (sn(v.th) + v.muk * cs(v.th)); }, 'Al subir, peso y fricción apuntan plano abajo.', { unit: 'm/s²', mistakes: { wrongSide: function (v) { return Math.abs(g * (sn(v.th) - v.muk * cs(v.th))); } }, feedback: fb('wrongSide', 'Al subir, la fricción apunta plano abajo: se suma.') }),
    N('mo-d-sube', 'movimiento', 3, { v0: [2, 15, 1], th: TH, muk: MU }, function (v) { return 'Lanzas un bloque plano arriba a $' + v.v0 + '\\ \\text{m/s}$ en una rampa de $' + v.th + '^\\circ$ ($\\mu_k = ' + v.muk + '$). ¿Qué distancia sube hasta detenerse?'; },
      function (v) { return v.v0 * v.v0 / (2 * g * (sn(v.th) + v.muk * cs(v.th))); }, 'Desaceleración $g(\\sin\\theta + \\mu_k\\cos\\theta)$; luego $d = v_0^2/2a$.', { unit: 'm' }),
    N('mo-par-a', 'movimiento', 2, { m: [1, 20, 1], th: TH, F: [20, 200, 10], muk: MU }, function (v) { return 'Empujas con $' + v.F + '\\ \\text{N}$, paralelo al plano y hacia arriba, un bloque de $' + v.m + '\\ \\text{kg}$ que sube por una rampa de $' + v.th + '^\\circ$ ($\\mu_k = ' + v.muk + '$). ¿Qué aceleración tiene?'; },
      function (v) { return (v.F - v.m * g * (sn(v.th) + v.muk * cs(v.th))) / v.m; }, '$F - mg\\sin\\theta - \\mu_k mg\\cos\\theta = ma$.', { unit: 'm/s²', where: function (v) { return (v.F - v.m * g * (sn(v.th) + v.muk * cs(v.th))) / v.m > 0.3; }, mistakes: { noFriction: function (v) { return (v.F - v.m * g * sn(v.th)) / v.m; } }, feedback: fb('noFriction', 'Te faltó la fricción.') }),
    N('mo-hor-a', 'movimiento', 3, { m: [1, 20, 1], th: TH, F: [20, 300, 10], muk: MU }, function (v) { return 'Empujas horizontalmente con $' + v.F + '\\ \\text{N}$ un bloque de $' + v.m + '\\ \\text{kg}$ que sube por una rampa de $' + v.th + '^\\circ$ ($\\mu_k = ' + v.muk + '$). ¿Qué aceleración tiene?'; },
      function (v) { var Nn = v.m * g * cs(v.th) + v.F * sn(v.th); return (v.F * cs(v.th) - v.m * g * sn(v.th) - v.muk * Nn) / v.m; }, 'Descompón $F$ y usa $N = mg\\cos\\theta + F\\sin\\theta$.', { unit: 'm/s²', where: function (v) { var Nn = v.m * g * cs(v.th) + v.F * sn(v.th); return (v.F * cs(v.th) - v.m * g * sn(v.th) - v.muk * Nn) / v.m > 0.3; }, mistakes: { asParallel: function (v) { return (v.F - v.m * g * (sn(v.th) + v.muk * cs(v.th))) / v.m; } }, feedback: fb('asParallel', 'La fuerza es horizontal, no paralela al plano.') }),
    N('mo-const-sube', 'movimiento', 2, { m: [1, 30, 1], th: TH, muk: MU }, function (v) { return '¿Qué fuerza paralela al plano sube a velocidad constante un bloque de $' + v.m + '\\ \\text{kg}$ por una rampa de $' + v.th + '^\\circ$ con $\\mu_k = ' + v.muk + '$?'; },
      function (v) { return v.m * g * (sn(v.th) + v.muk * cs(v.th)); }, 'Velocidad constante: fuerza neta cero.', { unit: 'N' }),
    N('mo-const-baja', 'movimiento', 3, { m: [1, 30, 1], th: [20, 60, 5], muk: [0.05, 0.4, 0.05] }, function (v) { return 'Un bloque de $' + v.m + '\\ \\text{kg}$ baja por una rampa de $' + v.th + '^\\circ$ ($\\mu_k = ' + v.muk + '$). ¿Qué fuerza paralela al plano, hacia arriba, lo hace bajar a velocidad constante?'; },
      function (v) { return v.m * g * (sn(v.th) - v.muk * cs(v.th)); }, 'Al bajar, la fricción ya ayuda a frenar: $F = mg(\\sin\\theta - \\mu_k\\cos\\theta)$.', { unit: 'N', where: function (v) { return sn(v.th) - v.muk * cs(v.th) > 0.1; } }),
    N('mo-v', 'movimiento', 3, { th: [20, 60, 5], muk: MU, L: [1, 20, 1] }, function (v) { return 'Un trineo se suelta en una ladera de $' + v.th + '^\\circ$ ($\\mu_k = ' + v.muk + '$) y recorre $' + v.L + '\\ \\text{m}$. ¿Con qué rapidez llega abajo?'; },
      function (v) { return Math.sqrt(2 * g * (sn(v.th) - v.muk * cs(v.th)) * v.L); }, '$a = g(\\sin\\theta - \\mu_k\\cos\\theta)$ y $v^2 = 2aL$.', { unit: 'm/s', where: function (v) { return sn(v.th) - v.muk * cs(v.th) > 0.1; } }),
    N('mo-mu', 'movimiento', 3, { th: [20, 60, 5], a: [0.5, 5, 0.5] }, function (v) { return 'Un bloque baja por un plano de $' + v.th + '^\\circ$ con aceleración de $' + v.a + '\\ \\text{m/s}^2$. ¿Cuánto vale $\\mu_k$?'; },
      function (v) { return (g * sn(v.th) - v.a) / (g * cs(v.th)); }, 'Despeja de $a = g(\\sin\\theta - \\mu_k\\cos\\theta)$.', { tol: { abs: 0.005 }, where: function (v) { var m = (g * sn(v.th) - v.a) / (g * cs(v.th)); return m > 0.05 && m < 1; } }),

    /* ---------------- Plano con polea ---------------- */
    N('po-a', 'polea', 2, { m1: [1, 10, 0.5], m2: [1, 10, 0.5], th: TH }, function (v) { return 'Un bloque de $' + v.m1 + '\\ \\text{kg}$ en un plano liso de $' + v.th + '^\\circ$ está unido por una polea a una masa colgante de $' + v.m2 + '\\ \\text{kg}$ que baja. ¿Qué aceleración tienen?'; },
      function (v) { return (v.m2 - v.m1 * sn(v.th)) * g / (v.m1 + v.m2); }, 'Peso colgante contra $m_1g\\sin\\theta$, dividido entre la masa total.', { unit: 'm/s²', where: function (v) { return (v.m2 - v.m1 * sn(v.th)) * g / (v.m1 + v.m2) > 0.3; }, mistakes: { fullWeight: function (v) { return (v.m2 - v.m1) * g / (v.m1 + v.m2); } }, feedback: fb('fullWeight', 'Del bloque en el plano solo cuenta $m_1g\\sin\\theta$.') }),
    N('po-T', 'polea', 2, { m1: [1, 10, 0.5], m2: [1, 10, 0.5], th: TH }, function (v) { return 'Un bloque de $' + v.m1 + '\\ \\text{kg}$ en un plano liso de $' + v.th + '^\\circ$ está unido a una masa colgante de $' + v.m2 + '\\ \\text{kg}$ que baja. ¿Cuánto vale la tensión?'; },
      function (v) { var a = (v.m2 - v.m1 * sn(v.th)) * g / (v.m1 + v.m2); return v.m2 * (g - a); }, '$T = m_2(g - a)$.', { unit: 'N', where: function (v) { return (v.m2 - v.m1 * sn(v.th)) * g / (v.m1 + v.m2) > 0.3; }, mistakes: { weight: function (v) { return v.m2 * g; } }, feedback: fb('weight', 'Como la masa colgante acelera hacia abajo, la tensión es menor que su peso.') }),
    N('po-a-mu', 'polea', 3, { m1: [1, 10, 0.5], m2: [1, 10, 0.5], th: TH, mu: [0.05, 0.3, 0.05] }, function (v) { return 'Bloque de $' + v.m1 + '\\ \\text{kg}$ en un plano de $' + v.th + '^\\circ$ con $\\mu_k = ' + v.mu + '$, unido a una masa colgante de $' + v.m2 + '\\ \\text{kg}$ que baja. ¿Qué aceleración tienen?'; },
      function (v) { return ((v.m2 - v.m1 * sn(v.th)) * g - v.mu * v.m1 * g * cs(v.th)) / (v.m1 + v.m2); }, 'Resta también la fricción $\\mu_k m_1g\\cos\\theta$.', { unit: 'm/s²', where: function (v) { return ((v.m2 - v.m1 * sn(v.th)) * g - v.mu * v.m1 * g * cs(v.th)) / (v.m1 + v.m2) > 0.3; }, mistakes: { noFriction: function (v) { return (v.m2 - v.m1 * sn(v.th)) * g / (v.m1 + v.m2); } }, feedback: fb('noFriction', 'Te faltó la fricción del bloque en el plano.') }),
    N('po-equilibrio', 'polea', 2, { m1: [1, 20, 1], th: TH }, function (v) { return 'Un bloque de $' + v.m1 + '\\ \\text{kg}$ está en un plano liso de $' + v.th + '^\\circ$, unido por una polea a una masa colgante. ¿Qué masa colgante lo mantiene en reposo?'; },
      function (v) { return v.m1 * sn(v.th); }, '$m_2g = m_1g\\sin\\theta$.', { unit: 'kg', where: not45, mistakes: { usedCos: function (v) { return v.m1 * cs(v.th); } }, feedback: fb('usedCos', 'La que tira a lo largo del plano es $m_1g\\sin\\theta$.') }),
    N('po-baja', 'polea', 2, { m1: [2, 10, 0.5], m2: [0.5, 5, 0.5], th: [30, 60, 5] }, function (v) { return 'Un bloque de $' + v.m1 + '\\ \\text{kg}$ en un plano liso de $' + v.th + '^\\circ$ está unido a una masa colgante de $' + v.m2 + '\\ \\text{kg}$. El bloque resbala plano abajo y sube la masa. ¿Qué aceleración tienen?'; },
      function (v) { return (v.m1 * sn(v.th) - v.m2) * g / (v.m1 + v.m2); }, 'Ahora gana $m_1g\\sin\\theta$.', { unit: 'm/s²', where: function (v) { return (v.m1 * sn(v.th) - v.m2) * g / (v.m1 + v.m2) > 0.3; } }),

    /* ---------------- Dinámica circular ---------------- */
    N('ci-plana', 'circular', 1, { r: [10, 200, 10], mu: [0.2, 1, 0.05] }, function (v) { return '¿A qué velocidad máxima se puede tomar una curva plana de $' + v.r + '\\ \\text{m}$ de radio con $\\mu_s = ' + v.mu + '$?'; },
      function (v) { return Math.sqrt(v.mu * g * v.r); }, '$\\mu_s mg = mv^2/r$.', { unit: 'm/s', mistakes: { noSqrt: function (v) { return v.mu * g * v.r; } }, feedback: fb('noSqrt', 'Ese es $v^2$: saca la raíz.') }),
    N('ci-mu', 'circular', 2, { r: [10, 200, 10], v: [5, 30, 1] }, function (v) { return '¿Qué $\\mu_s$ mínimo necesita un auto para tomar una curva plana de $' + v.r + '\\ \\text{m}$ a $' + v.v + '\\ \\text{m/s}$?'; },
      function (v) { return v.v * v.v / (g * v.r); }, '$\\mu_s = v^2/(gr)$.', { tol: { abs: 0.005 }, where: function (v) { return v.v * v.v / (g * v.r) < 1.2; } }),
    N('ci-F', 'circular', 1, { m: [0.5, 1500, 0.5], v: [2, 30, 1], r: [1, 100, 1] }, function (v) { return '¿Qué fuerza neta hacia el centro necesita un cuerpo de $' + v.m + '\\ \\text{kg}$ para girar a $' + v.v + '\\ \\text{m/s}$ en un círculo de $' + v.r + '\\ \\text{m}$?'; },
      function (v) { return v.m * v.v * v.v / v.r; }, '$F = mv^2/r$.', { unit: 'N', mistakes: { noSquare: function (v) { return v.m * v.v / v.r; } }, feedback: fb('noSquare', 'Falta el cuadrado de la rapidez.') }),
    N('ci-omega', 'circular', 1, { m: [0.1, 5, 0.1], w: [1, 20, 1], r: [0.2, 2, 0.1] }, function (v) { return 'Una piedra de $' + v.m + '\\ \\text{kg}$ gira en un círculo horizontal de $' + v.r + '\\ \\text{m}$ a $' + v.w + '\\ \\text{rad/s}$ (ignora la gravedad). ¿Qué tensión tiene la cuerda?'; },
      function (v) { return v.m * v.w * v.w * v.r; }, '$T = m\\omega^2 r$.', { unit: 'N' }),
    N('ci-peralte', 'circular', 2, { r: [30, 300, 10], v: [10, 35, 1] }, function (v) { return '¿Qué peralte necesita una curva de $' + v.r + '\\ \\text{m}$ para tomarla a $' + v.v + '\\ \\text{m/s}$ sin fricción?'; },
      function (v) { return Math.atan(v.v * v.v / (v.r * g)) * DEG; }, '$\\tan\\theta = v^2/(rg)$.', { unit: '°', tol: ANG, where: function (v) { return v.v * v.v / (v.r * g) < 1.5; } }),
    N('ci-peralte-v', 'circular', 2, { r: [30, 300, 10], th: [5, 35, 1] }, function (v) { return 'Una curva de $' + v.r + '\\ \\text{m}$ tiene un peralte de $' + v.th + '^\\circ$. ¿A qué velocidad se toma sin necesitar fricción?'; },
      function (v) { return Math.sqrt(v.r * g * Math.tan(v.th * RAD)); }, '$v = \\sqrt{rg\\tan\\theta}$.', { unit: 'm/s' }),
    N('ci-peralte-max', 'circular', 3, { r: [30, 300, 10], th: [5, 30, 1], mu: [0.1, 0.8, 0.05] }, function (v) { return 'Una curva de $' + v.r + '\\ \\text{m}$ con peralte de $' + v.th + '^\\circ$ tiene $\\mu_s = ' + v.mu + '$. ¿Cuál es la velocidad máxima segura?'; },
      function (v) { return Math.sqrt(v.r * g * (sn(v.th) + v.mu * cs(v.th)) / (cs(v.th) - v.mu * sn(v.th))); }, 'Con la fricción apuntando hacia abajo del peralte: $v^2 = rg(\\sin\\theta + \\mu\\cos\\theta)/(\\cos\\theta - \\mu\\sin\\theta)$.', { unit: 'm/s', where: function (v) { return cs(v.th) - v.mu * sn(v.th) > 0.2; } }),
    N('ci-rizo-min', 'circular', 2, { r: [1, 20, 0.5] }, function (v) { return '¿Qué rapidez mínima necesita un carrito en la parte más alta de un rizo de $' + v.r + '\\ \\text{m}$ de radio para no despegarse?'; },
      function (v) { return Math.sqrt(g * v.r); }, 'Arriba, con $N = 0$, solo el peso da la fuerza al centro: $mg = mv^2/r$.', { unit: 'm/s' }),
    N('ci-rizo-N', 'circular', 3, { m: [100, 800, 50], v: [8, 25, 1], r: [4, 15, 1] }, function (v) { return 'Un carro de montaña rusa de $' + v.m + '\\ \\text{kg}$ pasa por lo más alto de un rizo de $' + v.r + '\\ \\text{m}$ a $' + v.v + '\\ \\text{m/s}$. ¿Qué normal ejerce el riel (hacia abajo)?'; },
      function (v) { return v.m * (v.v * v.v / v.r - g); }, 'Arriba, peso y normal apuntan al centro: $N + mg = mv^2/r$.', { unit: 'N', where: function (v) { return v.v * v.v / v.r - g > 1; }, mistakes: { plusG: function (v) { return v.m * (v.v * v.v / v.r + g); } }, feedback: fb('plusG', 'En lo alto, el peso ayuda a girar: se resta.') }),
    N('ci-loma', 'circular', 3, { m: [500, 2000, 100], v: [3, 15, 1], r: [20, 80, 5] }, function (v) { return 'Un auto de $' + v.m + '\\ \\text{kg}$ pasa por la cima de una loma de $' + v.r + '\\ \\text{m}$ de radio a $' + v.v + '\\ \\text{m/s}$. ¿Cuánto vale la normal?'; },
      function (v) { return v.m * (g - v.v * v.v / v.r); }, 'En la cima: $mg - N = mv^2/r$. Se siente más ligero.', { unit: 'N', where: function (v) { return g - v.v * v.v / v.r > 1; }, mistakes: { plus: function (v) { return v.m * (g + v.v * v.v / v.r); } }, feedback: fb('plus', 'En una loma el centro está abajo: la normal es menor que el peso.') }),
    N('ci-bache', 'circular', 2, { m: [500, 2000, 100], v: [3, 20, 1], r: [10, 80, 5] }, function (v) { return 'Un auto de $' + v.m + '\\ \\text{kg}$ pasa por el fondo de un bache de $' + v.r + '\\ \\text{m}$ de radio a $' + v.v + '\\ \\text{m/s}$. ¿Cuánto vale la normal?'; },
      function (v) { return v.m * (g + v.v * v.v / v.r); }, 'Abajo el centro está arriba: $N - mg = mv^2/r$.', { unit: 'N', mistakes: { usedMg: function (v) { return v.m * g; } }, feedback: fb('usedMg', 'Al girar, la normal debe superar al peso.') }),
    N('ci-vmax-cuerda', 'circular', 2, { Tmax: [20, 500, 10], r: [0.3, 2, 0.1], m: [0.1, 3, 0.1] }, function (v) { return 'Una cuerda de $' + v.r + '\\ \\text{m}$ aguanta $' + v.Tmax + '\\ \\text{N}$. ¿A qué rapidez máxima puede girar en un círculo horizontal una piedra de $' + v.m + '\\ \\text{kg}$ (ignora la gravedad)?'; },
      function (v) { return Math.sqrt(v.Tmax * v.r / v.m); }, '$T = mv^2/r$.', { unit: 'm/s' }),
    N('ci-periodo', 'circular', 3, { Tmax: [20, 500, 10], r: [0.3, 2, 0.1], m: [0.1, 3, 0.1] }, function (v) { return 'Una piedra de $' + v.m + '\\ \\text{kg}$ gira en un círculo horizontal de $' + v.r + '\\ \\text{m}$ con una tensión de $' + v.Tmax + '\\ \\text{N}$ (ignora la gravedad). ¿Cuánto tarda en dar una vuelta?'; },
      function (v) { return 2 * Math.PI * Math.sqrt(v.m * v.r / v.Tmax); }, 'De $T = m\\omega^2 r$ sale $\\omega$; el periodo es $2\\pi/\\omega$.', { unit: 's' }),

    /* ---------------- Más práctica ---------------- */
    N('ci-ac', 'circular', 1, { v: [2, 30, 1], r: [1, 100, 1] }, function (v) { return 'Un auto recorre una glorieta de $' + v.r + '\\ \\text{m}$ de radio a $' + v.v + '\\ \\text{m/s}$. ¿Cuánto vale su aceleración hacia el centro?'; },
      function (v) { return v.v * v.v / v.r; }, '$a_c = v^2/r$ (S07).', { unit: 'm/s²' }),
    N('ci-rpm', 'circular', 2, { m: [0.1, 3, 0.1], rpm: [30, 300, 10], r: [0.2, 1.5, 0.1] }, function (v) { return 'Una piedra de $' + v.m + '\\ \\text{kg}$ atada a una cuerda de $' + v.r + '\\ \\text{m}$ gira horizontalmente a $' + v.rpm + '$ rpm (ignora la gravedad). ¿Cuánto vale la tensión?'; },
      function (v) { var w = v.rpm * 2 * Math.PI / 60; return v.m * w * w * v.r; }, 'Pasa a rad/s y usa $T = m\\omega^2 r$.', { unit: 'N', mistakes: { no2pi: function (v) { var w = v.rpm / 60; return v.m * w * w * v.r; } }, feedback: fb('no2pi', 'Te faltó el $2\\pi$ al pasar de rpm a rad/s.') }),
    N('ci-despega', 'circular', 2, { rl: [5, 100, 5] }, function (v) { return '¿A qué rapidez un auto pierde contacto con el piso en la cima de una loma de $' + v.rl + '\\ \\text{m}$ de radio?'; },
      function (v) { return Math.sqrt(g * v.rl); }, 'Con $N = 0$: $mg = mv^2/r$.', { unit: 'm/s' }),
    N('po-T-mu', 'polea', 2, { m1: [1, 10, 0.5], m2: [1, 10, 0.5], th: TH, mu: [0.05, 0.3, 0.05] }, function (v) { return 'Un bloque de $' + v.m1 + '\\ \\text{kg}$ en un plano de $' + v.th + '^\\circ$ ($\\mu_k = ' + v.mu + '$) está unido a una masa colgante de $' + v.m2 + '\\ \\text{kg}$ que baja. ¿Cuánto vale la tensión?'; },
      function (v) { var a = ((v.m2 - v.m1 * sn(v.th)) * g - v.mu * v.m1 * g * cs(v.th)) / (v.m1 + v.m2); return v.m2 * (g - a); }, 'Con la aceleración, $T = m_2(g - a)$.', { unit: 'N', where: function (v) { return ((v.m2 - v.m1 * sn(v.th)) * g - v.mu * v.m1 * g * cs(v.th)) / (v.m1 + v.m2) > 0.3; } }),
    N('po-v', 'polea', 2, { m1: [1, 10, 0.5], m2: [1, 10, 0.5], th: TH, d: [0.5, 3, 0.5] }, function (v) { return 'Un bloque de $' + v.m1 + '\\ \\text{kg}$ en un plano liso de $' + v.th + '^\\circ$, unido a una masa colgante de $' + v.m2 + '\\ \\text{kg}$, parte del reposo. ¿Qué rapidez tienen cuando se han movido $' + v.d + '\\ \\text{m}$?'; },
      function (v) { return Math.sqrt(2 * (v.m2 - v.m1 * sn(v.th)) * g / (v.m1 + v.m2) * v.d); }, '$v^2 = 2ad$ con la aceleración del sistema.', { unit: 'm/s', where: function (v) { return (v.m2 - v.m1 * sn(v.th)) * g / (v.m1 + v.m2) > 0.3; } }),
    N('cr-horiz-subir', 'critico', 2, { m: [1, 30, 1], th: [10, 35, 5], mus: [0.05, 0.5, 0.05] }, function (v) { return '¿Qué fuerza horizontal mínima empieza a subir un bloque de $' + v.m + '\\ \\text{kg}$ por una rampa de $' + v.th + '^\\circ$ con $\\mu_s = ' + v.mus + '$?'; },
      function (v) { return v.m * g * (sn(v.th) + v.mus * cs(v.th)) / (cs(v.th) - v.mus * sn(v.th)); }, 'A lo largo: $F\\cos\\theta = mg\\sin\\theta + \\mu_s(mg\\cos\\theta + F\\sin\\theta)$.', { unit: 'N', where: function (v) { return cs(v.th) - v.mus * sn(v.th) > 0.3; } }),
    N('mo-t-sube', 'movimiento', 2, { v0: [2, 15, 1], th: TH, muk: MU }, function (v) { return 'Lanzas un bloque plano arriba a $' + v.v0 + '\\ \\text{m/s}$ en una rampa de $' + v.th + '^\\circ$ ($\\mu_k = ' + v.muk + '$). ¿Cuánto tarda en detenerse?'; },
      function (v) { return v.v0 / (g * (sn(v.th) + v.muk * cs(v.th))); }, '$t = v_0/a$ con $a = g(\\sin\\theta + \\mu_k\\cos\\theta)$.', { unit: 's' }),
    N('cp-F-comp', 'componentes', 2, { F: [10, 200, 10], th: TH }, function (v) { return 'Empujas horizontalmente con $' + v.F + '\\ \\text{N}$ un bloque que está en una rampa de $' + v.th + '^\\circ$. ¿Qué parte de tu fuerza empuja a lo largo del plano?'; },
      function (v) { return v.F * cs(v.th); }, 'La componente paralela al plano de una fuerza horizontal es $F\\cos\\theta$.', { unit: 'N', where: not45, mistakes: { usedSin: function (v) { return v.F * sn(v.th); } }, feedback: fb('usedSin', 'Esa es la componente contra el plano.') }),
    N('mo-x-t', 'movimiento', 2, { th: [20, 60, 5], muk: MU, t: [0.5, 4, 0.5] }, function (v) { return 'Un bloque se suelta en una rampa de $' + v.th + '^\\circ$ ($\\mu_k = ' + v.muk + '$) y resbala. ¿Qué distancia recorre en $' + v.t + '\\ \\text{s}$?'; },
      function (v) { return g * (sn(v.th) - v.muk * cs(v.th)) * v.t * v.t / 2; }, '$x = \\tfrac{1}{2}at^2$ con $a = g(\\sin\\theta - \\mu_k\\cos\\theta)$.', { unit: 'm', where: function (v) { return sn(v.th) - v.muk * cs(v.th) > 0.1; } }),

    /* ---------------- Conceptuales ---------------- */
    C('k-par', 'componentes', 1, 'En un plano de ángulo $\\theta$, la componente del peso a lo largo del plano es…', '$mg\\sin\\theta$', [['$mg\\cos\\theta$'], ['$mg$'], ['$mg\\tan\\theta$']], 'Con $\\theta = 0$ debe dar cero.'),
    C('k-perp', 'componentes', 1, 'La componente del peso perpendicular al plano es…', '$mg\\cos\\theta$', [['$mg\\sin\\theta$'], ['$mg$'], ['cero']], 'Con $\\theta = 0$ debe dar $mg$.'),
    C('k-N', 'componentes', 1, 'Sin otras fuerzas perpendiculares, la normal sobre un bloque en un plano inclinado es…', '$mg\\cos\\theta$', [['$mg$'], ['$mg\\sin\\theta$'], ['cero']], 'Equilibra la componente perpendicular.'),
    C('k-theta0', 'componentes', 2, 'Para revisar tus componentes, con $\\theta = 0^\\circ$ el plano es horizontal y debe salir…', '$mg\\sin\\theta = 0$ y $N = mg$', [['$mg\\cos\\theta = 0$'], ['$N = 0$'], ['$a = g$']], 'Caso límite fácil de comprobar.'),
    C('k-theta90', 'componentes', 2, 'Con $\\theta = 90^\\circ$ (plano vertical) y sin fricción, el bloque…', 'cae libremente con $a = g$', [['no se mueve'], ['baja con $a = 0$'], ['tiene $N = mg$']], '$g\\sin 90^\\circ = g$ y $N = 0$.'),
    C('k-peso-vertical', 'componentes', 1, 'En un plano inclinado, el peso del bloque apunta…', 'verticalmente hacia abajo', [['perpendicular al plano'], ['a lo largo del plano'], ['hacia arriba del plano']], 'La gravedad siempre es vertical; se descompone.'),
    C('k-ejes', 'componentes', 2, 'En un plano inclinado conviene poner los ejes…', 'a lo largo y perpendicular al plano', [['horizontal y vertical siempre'], ['a $45^\\circ$'], ['sin ejes']], 'La aceleración queda en un solo eje.'),
    C('k-masa-a', 'componentes', 2, 'Sin fricción, un bloque pesado y uno ligero bajan por el mismo plano con…', 'la misma aceleración', [['más aceleración el pesado'], ['más aceleración el ligero'], ['aceleración cero']], '$a = g\\sin\\theta$.'),
    C('k-N-menor', 'componentes', 1, 'En un plano inclinado, la normal es…', 'menor que el peso', [['mayor que el peso'], ['igual al peso'], ['cero']], '$\\cos\\theta < 1$.'),
    C('k-mas-inclinado', 'componentes', 2, 'Si aumentas la inclinación de la rampa, la normal…', 'disminuye', [['aumenta'], ['no cambia'], ['se duplica']], '$\\cos\\theta$ baja al crecer $\\theta$.'),
    C('k-horiz-N', 'componentes', 3, 'Empujar un bloque con una fuerza horizontal contra una rampa…', 'aumenta la normal', [['disminuye la normal'], ['no cambia la normal'], ['anula el peso']], 'Su componente $F\\sin\\theta$ aprieta contra el plano.'),
    C('k-angulo-igual', 'componentes', 3, 'El ángulo entre el peso y la perpendicular al plano es…', 'igual al ángulo del plano, $\\theta$', [['$90^\\circ - \\theta$'], ['$90^\\circ$'], ['$2\\theta$']], 'Lados perpendiculares forman ángulos iguales.'),
    C('k-critico', 'critico', 1, 'El ángulo al que un bloque empieza a resbalar cumple…', '$\\tan\\theta_c = \\mu_s$', [['$\\sin\\theta_c = \\mu_s$'], ['$\\cos\\theta_c = \\mu_s$'], ['$\\theta_c = 45^\\circ$ siempre']], '$mg\\sin\\theta = \\mu_s mg\\cos\\theta$.'),
    C('k-critico-masa', 'critico', 2, 'El ángulo crítico de un bloque…', 'no depende de su masa', [['es mayor si el bloque pesa más'], ['es menor si el bloque pesa más'], ['depende de $g$']], 'La masa se cancela.'),
    C('k-medir', 'critico', 2, 'Una forma de medir $\\mu_s$ es…', 'inclinar la superficie hasta que el objeto resbale y usar $\\tan\\theta$', [['pesar el objeto'], ['medir su velocidad al caer'], ['medir el área de contacto']], '$\\mu_s = \\tan\\theta_c$.'),
    C('k-reposo-fs', 'critico', 1, 'Un bloque en reposo en un plano inclinado tiene una fricción estática igual a…', '$mg\\sin\\theta$', [['$\\mu_s mg\\cos\\theta$'], ['$mg$'], ['cero']], 'Lo necesario para equilibrar.'),
    C('k-pasa', 'critico', 1, 'Si inclinas la rampa más allá del ángulo crítico…', 'el bloque resbala', [['el bloque se queda quieto'], ['la fricción crece sin límite'], ['la normal aumenta']], '$mg\\sin\\theta$ supera la fricción máxima.'),
    C('k-mas-mu', 'critico', 1, 'Con un $\\mu_s$ mayor, el ángulo crítico…', 'es mayor', [['es menor'], ['no cambia'], ['es cero']], '$\\theta_c = \\arctan\\mu_s$.'),
    C('k-fs-dir', 'critico', 2, 'Un bloque está en reposo en una rampa, sin otras fuerzas. La fricción estática apunta…', 'plano arriba', [['plano abajo'], ['perpendicular al plano'], ['no hay fricción']], 'Impide que resbale hacia abajo.'),
    C('k-resbala-acelera', 'critico', 3, 'Un bloque empieza a resbalar justo en el ángulo crítico. Como $\\mu_k < \\mu_s$, después…', 'acelera plano abajo', [['baja a velocidad constante'], ['se detiene'], ['sube']], 'La fricción cinética ya no alcanza a equilibrar $mg\\sin\\theta$.'),
    C('k-45', 'critico', 1, 'Si $\\mu_s = 1$, el ángulo crítico es…', '$45^\\circ$', [['$30^\\circ$'], ['$60^\\circ$'], ['$90^\\circ$']], '$\\arctan 1$.'),
    C('k-baja-f', 'movimiento', 1, 'Si un bloque baja deslizando, la fricción apunta…', 'plano arriba', [['plano abajo'], ['perpendicular al plano'], ['hacia el piso']], 'Contra el movimiento.'),
    C('k-sube-f', 'movimiento', 1, 'Si un bloque sube deslizando, la fricción apunta…', 'plano abajo', [['plano arriba'], ['perpendicular al plano'], ['no hay fricción']], 'Contra el movimiento.'),
    C('k-sube-baja', 'movimiento', 2, 'Con fricción, la desaceleración al subir comparada con la aceleración al bajar es…', 'mayor', [['menor'], ['igual'], ['cero']], 'Subiendo, peso y fricción suman; bajando, se restan.'),
    C('k-masa-mov', 'movimiento', 2, 'La aceleración de un bloque que desliza con fricción por un plano…', 'no depende de su masa', [['aumenta con la masa'], ['disminuye con la masa'], ['es cero para masas grandes']], 'Todos los términos tienen $m$.'),
    C('k-par-vs-hor', 'movimiento', 2, 'Para subir un bloque por una rampa, con la misma fuerza conviene empujar…', 'paralelo al plano', [['horizontal'], ['vertical'], ['da lo mismo']], 'La horizontal pierde componente y aumenta la fricción.'),
    C('k-const-baja', 'movimiento', 3, 'Un bloque baja por un plano a velocidad constante sin que nadie lo empuje. Entonces…', '$\\tan\\theta = \\mu_k$', [['no hay fricción'], ['$\\mu_k = 0$'], ['$\\theta = 45^\\circ$']], 'Fuerza neta cero: $\\sin\\theta = \\mu_k\\cos\\theta$.'),
    C('k-tiempos', 'movimiento', 3, 'Lanzas un bloque plano arriba y luego baja al punto de partida (con fricción). El tiempo de bajada comparado con el de subida es…', 'mayor', [['menor'], ['igual'], ['cero']], 'La aceleración al bajar es menor que la desaceleración al subir.'),
    C('k-se-queda', 'movimiento', 2, 'Lanzas un bloque plano arriba y se detiene. ¿Se queda ahí?', 'Solo si $\\tan\\theta \\le \\mu_s$', [['Siempre'], ['Nunca'], ['Solo si no hay fricción']], 'Si la estática alcanza, se queda.'),
    C('k-empujar-const', 'movimiento', 2, 'Para subir un bloque a velocidad constante por una rampa con fricción, tu fuerza paralela debe ser…', '$mg\\sin\\theta + \\mu_k mg\\cos\\theta$', [['$mg\\sin\\theta$'], ['$mg$'], ['$\\mu_k mg$']], 'Fuerza neta cero.'),
    C('k-despreciar', 'movimiento', 1, 'Un bloque baja por un plano sin fricción. Su aceleración vale…', '$g\\sin\\theta$', [['$g$'], ['$g\\cos\\theta$'], ['cero']], 'Solo la componente del peso a lo largo.'),
    C('k-po-sentido', 'polea', 2, 'En el sistema de plano liso con polea, la masa colgante baja si…', '$m_2g > m_1g\\sin\\theta$', [['$m_2 > m_1$'], ['$m_2g > m_1g\\cos\\theta$'], ['siempre']], 'Compara las fuerzas a lo largo de la cuerda.'),
    C('k-po-T', 'polea', 2, 'Si la masa colgante baja acelerando, la tensión es…', 'menor que su peso', [['mayor que su peso'], ['igual a su peso'], ['cero']], '$m_2g - T = m_2a > 0$.'),
    C('k-po-eq', 'polea', 1, 'Sin fricción, el sistema de plano con polea está en equilibrio si…', '$m_2 = m_1\\sin\\theta$', [['$m_2 = m_1$'], ['$m_2 = m_1\\cos\\theta$'], ['$m_2 = 0$']], 'Las fuerzas a lo largo de la cuerda se igualan.'),
    C('k-po-misma', 'polea', 1, 'El bloque del plano y la masa colgante tienen…', 'la misma aceleración en magnitud', [['aceleraciones distintas'], ['la misma velocidad pero distinta aceleración'], ['aceleración cero siempre']], 'Los une la misma cuerda.'),
    C('k-po-friccion', 'polea', 3, 'En el sistema de plano con polea, la fricción sobre el bloque apunta…', 'contra el sentido en que se mueve el bloque', [['siempre plano abajo'], ['siempre plano arriba'], ['hacia la polea']], 'Depende de si el bloque sube o baja.'),
    C('k-po-reposo', 'polea', 3, 'Con fricción estática, el sistema de plano y polea puede quedar en reposo…', 'para un rango de masas colgantes', [['solo si $m_2 = m_1\\sin\\theta$'], ['nunca'], ['solo si no hay polea']], 'La fricción estática se ajusta entre $-\\mu_sN$ y $+\\mu_sN$.'),
    C('k-po-T-misma', 'polea', 2, 'La tensión en el tramo de cuerda paralelo al plano y en el tramo vertical es…', 'la misma', [['mayor en el vertical'], ['mayor en el paralelo'], ['cero en el paralelo']], 'Cuerda y polea ideales.'),
    C('k-centripeta', 'circular', 2, 'La "fuerza centrípeta" en un DCL…', 'no se dibuja aparte: es la suma de fuerzas reales hacia el centro', [['se dibuja como una fuerza más'], ['apunta hacia afuera'], ['es el peso siempre']], 'La hace la fricción, la normal o una tensión.'),
    C('k-plana', 'circular', 1, 'En una curva plana, la fuerza que hace girar al auto es…', 'la fricción estática de las llantas', [['la fricción cinética'], ['la normal'], ['el motor']], 'Las llantas no derrapan hacia el centro.'),
    C('k-peralte', 'circular', 2, 'En una curva peraltada sin fricción, la fuerza hacia el centro la da…', 'la componente horizontal de la normal', [['el peso'], ['la fricción'], ['el motor']], 'La normal está inclinada.'),
    C('k-plana-masa', 'circular', 2, 'La velocidad máxima en una curva plana…', 'no depende de la masa del auto', [['es mayor para autos pesados'], ['es mayor para autos ligeros'], ['depende del motor']], '$v = \\sqrt{\\mu_s gr}$.'),
    C('k-mojado', 'circular', 1, 'Si el pavimento está mojado (menor $\\mu_s$), la velocidad segura en una curva plana…', 'disminuye', [['aumenta'], ['no cambia'], ['se vuelve cero']], '$v \\propto \\sqrt{\\mu_s}$.'),
    C('k-rizo-arriba', 'circular', 2, 'En lo más alto de un rizo, las fuerzas sobre el carrito que apuntan al centro son…', 'el peso y la normal', [['solo la normal'], ['solo el peso'], ['ninguna']], 'Las dos apuntan hacia abajo, al centro.'),
    C('k-rizo-min', 'circular', 3, 'En la rapidez mínima en lo alto de un rizo…', 'la normal vale cero', [['la normal vale $mg$'], ['el peso vale cero'], ['la velocidad es cero']], 'Solo el peso da la fuerza al centro.'),
    C('k-loma', 'circular', 1, 'Al pasar rápido por la cima de una loma, te sientes…', 'más ligero', [['más pesado'], ['igual'], ['sin fuerzas']], 'La normal disminuye: $N = m(g - v^2/r)$.'),
    C('k-bache', 'circular', 1, 'Al pasar por el fondo de un bache, te sientes…', 'más pesado', [['más ligero'], ['igual'], ['sin peso']], '$N = m(g + v^2/r)$.'),
    C('k-cuerda-rota', 'circular', 2, 'Si se rompe la cuerda de una piedra que gira en círculo, la piedra sale…', 'tangente al círculo', [['hacia afuera en línea radial'], ['hacia el centro'], ['girando en espiral']], 'Sigue con su velocidad, que era tangente.'),
    C('k-peralte-masa', 'circular', 3, 'El peralte ideal para una curva y una velocidad dadas…', 'no depende de la masa del vehículo', [['es mayor para camiones'], ['es mayor para motos'], ['depende del motor']], '$\\tan\\theta = v^2/(rg)$.')
  ];

  K.register({
    'f1.S11.componentes': 'Descomposición del peso',
    'f1.S11.critico': 'Ángulo crítico y fricción estática',
    'f1.S11.movimiento': 'Movimiento con fricción en el plano',
    'f1.S11.polea': 'Plano con polea',
    'f1.S11.circular': 'Dinámica circular'
  }, Q);
})();
