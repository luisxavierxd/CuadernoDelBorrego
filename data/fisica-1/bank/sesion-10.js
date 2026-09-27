/* =====================================================================
   Banco · Física 1 · S10 · Resortes (ley de Hooke) y fricción.
   100 preguntas propias. g = 9.81 m/s², SI.
   ===================================================================== */
(function () {
  var K = window.CBBankKit('f1', '10'), C = K.C;
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
  var MU = [0.1, 0.8, 0.05];

  var Q = [
    /* ---------------- Ley de Hooke ---------------- */
    N('ho-F', 'hooke', 1, { k: [50, 1000, 50], x: [0.02, 0.4, 0.02] }, function (v) { return 'Un resorte de $k = ' + v.k + '\\ \\text{N/m}$ se estira $' + v.x + '\\ \\text{m}$. ¿Qué fuerza ejerce (magnitud)?'; },
      function (v) { return v.k * v.x; }, '$|F| = kx$.', { unit: 'N' }),
    N('ho-k', 'hooke', 1, { F: [5, 200, 5], x: [0.02, 0.4, 0.02] }, function (v) { return 'Un resorte se comprime $' + v.x + '\\ \\text{m}$ con una fuerza de $' + v.F + '\\ \\text{N}$. ¿Cuánto vale $k$?'; },
      function (v) { return v.F / v.x; }, '$k = F/x$.', { unit: 'N/m', mistakes: { multiplied: function (v) { return v.F * v.x; } }, feedback: fb('multiplied', 'De $F = kx$ se despeja dividiendo.') }),
    N('ho-x', 'hooke', 2, { F: [5, 200, 5], k: [50, 1000, 50] }, function (v) { return '¿Cuánto se estira un resorte de $k = ' + v.k + '\\ \\text{N/m}$ si lo jalas con $' + v.F + '\\ \\text{N}$?'; },
      function (v) { return v.F / v.k; }, '$x = F/k$.', { unit: 'm' }),
    N('ho-colgar-k', 'hooke', 2, { m: [0.1, 5, 0.1], x: [0.01, 0.3, 0.01] }, function (v) { return 'Al colgar $' + v.m + '\\ \\text{kg}$ de un resorte, se estira $' + v.x + '\\ \\text{m}$ y queda en reposo. ¿Cuánto vale $k$?'; },
      function (v) { return v.m * g / v.x; }, 'En equilibrio $kx = mg$.', { unit: 'N/m', mistakes: { noG: function (v) { return v.m / v.x; } }, feedback: fb('noG', 'La fuerza es el peso, $mg$, no la masa.') }),
    N('ho-colgar-x', 'hooke', 2, { m: [0.1, 5, 0.1], k: [20, 500, 10] }, function (v) { return '¿Cuánto se estira un resorte de $k = ' + v.k + '\\ \\text{N/m}$ al colgarle $' + v.m + '\\ \\text{kg}$?'; },
      function (v) { return v.m * g / v.k; }, '$x = mg/k$.', { unit: 'm' }),
    N('ho-paralelo', 'hooke', 3, { m: [0.5, 10, 0.5], k: [50, 500, 25] }, function (v) { return 'Una caja de $' + v.m + '\\ \\text{kg}$ cuelga de dos resortes iguales, uno junto al otro, cada uno de $k = ' + v.k + '\\ \\text{N/m}$. ¿Cuánto se estira cada resorte?'; },
      function (v) { return v.m * g / (2 * v.k); }, 'Los dos comparten el peso: $2kx = mg$.', { unit: 'm', mistakes: { single: function (v) { return v.m * g / v.k; } }, feedback: fb('single', 'Hay dos resortes sosteniendo: cada uno carga la mitad.') }),
    N('ho-a', 'hooke', 2, { k: [100, 1000, 50], x: [0.05, 0.3, 0.05], m: [0.5, 10, 0.5] }, function (v) { return 'Un resorte de $k = ' + v.k + '\\ \\text{N/m}$ comprimido $' + v.x + '\\ \\text{m}$ empuja un bloque de $' + v.m + '\\ \\text{kg}$ sobre una mesa lisa. ¿Con qué aceleración arranca?'; },
      function (v) { return v.k * v.x / v.m; }, '$a = kx/m$.', { unit: 'm/s²' }),
    N('ho-a-mu', 'hooke', 3, { k: [100, 1000, 50], x: [0.05, 0.3, 0.05], m: [0.5, 10, 0.5], muk: [0.1, 0.5, 0.05] }, function (v) { return 'Un resorte de $k = ' + v.k + '\\ \\text{N/m}$ comprimido $' + v.x + '\\ \\text{m}$ empuja un bloque de $' + v.m + '\\ \\text{kg}$ que ya desliza con $\\mu_k = ' + v.muk + '$. ¿Qué aceleración tiene en ese instante?'; },
      function (v) { return (v.k * v.x - v.muk * v.m * g) / v.m; }, '$a = (kx - \\mu_k mg)/m$.', { unit: 'm/s²', where: function (v) { return (v.k * v.x - v.muk * v.m * g) / v.m > 0.5; }, mistakes: { noFriction: function (v) { return v.k * v.x / v.m; } }, feedback: fb('noFriction', 'Te faltó la fricción cinética.') }),
    N('ho-x-min', 'hooke', 2, { m: [0.5, 10, 0.5], mus: MU, k: [100, 1000, 50] }, function (v) { return 'Un resorte de $k = ' + v.k + '\\ \\text{N/m}$ empuja un bloque de $' + v.m + '\\ \\text{kg}$ ($\\mu_s = ' + v.mus + '$). ¿Cuánto hay que comprimirlo, como mínimo, para que el bloque arranque?'; },
      function (v) { return v.mus * v.m * g / v.k; }, '$kx$ debe superar $\\mu_s mg$.', { unit: 'm' }),
    N('ho-cm', 'hooke', 2, { k: [100, 2000, 100], xc: [1, 30, 1] }, function (v) { return 'Un resorte de $k = ' + v.k + '\\ \\text{N/m}$ se comprime $' + v.xc + '\\ \\text{cm}$. ¿Qué fuerza ejerce?'; },
      function (v) { return v.k * v.xc / 100; }, 'Pasa los cm a m antes de multiplicar.', { unit: 'N', mistakes: { noConvert: function (v) { return v.k * v.xc; } }, feedback: fb('noConvert', '$k$ está en N/m: pasa la compresión a metros.') }),

    /* ---------------- Fricción estática ---------------- */
    N('es-max', 'estatica', 1, { m: [1, 80, 1], mus: MU }, function (v) { return '¿Cuál es la fricción estática máxima sobre una caja de $' + v.m + '\\ \\text{kg}$ en un piso horizontal con $\\mu_s = ' + v.mus + '$?'; },
      function (v) { return v.mus * v.m * g; }, '$f_{s,máx} = \\mu_s mg$.', { unit: 'N' }),
    N('es-quieta', 'estatica', 2, { m: [10, 80, 1], mus: [0.3, 0.8, 0.05], F: [5, 100, 5] }, function (v) { return 'Empujas horizontalmente con $' + v.F + '\\ \\text{N}$ una caja de $' + v.m + '\\ \\text{kg}$ ($\\mu_s = ' + v.mus + '$) y no se mueve. ¿Cuánto vale la fricción?'; },
      function (v) { return v.F; }, 'Si no se mueve, la fricción estática iguala tu fuerza.', { unit: 'N', where: function (v) { return v.F < 0.9 * v.mus * v.m * g; }, mistakes: { maxS: function (v) { return v.mus * v.m * g; } }, feedback: fb('maxS', 'Ese es el máximo posible; aquí basta con igualar tu fuerza.') }),
    N('es-mu', 'estatica', 2, { m: [2, 60, 1], F: [10, 300, 10] }, function (v) { return 'Una caja de $' + v.m + '\\ \\text{kg}$ empieza a moverse justo cuando la empujas horizontalmente con $' + v.F + '\\ \\text{N}$. ¿Cuánto vale $\\mu_s$?'; },
      function (v) { return v.F / (v.m * g); }, '$\\mu_s = F/(mg)$.', { tol: { abs: 0.005 }, where: function (v) { return v.F / (v.m * g) < 1.2; }, mistakes: { noG: function (v) { return v.F / v.m; } }, feedback: fb('noG', 'Divide entre la normal, $mg$, no entre la masa.') }),
    N('es-pared', 'estatica', 3, { m: [0.2, 3, 0.1], mus: [0.3, 0.9, 0.05] }, function (v) { return 'Sostienes un libro de $' + v.m + '\\ \\text{kg}$ contra una pared vertical empujándolo horizontalmente ($\\mu_s = ' + v.mus + '$). ¿Con qué fuerza mínima debes empujar para que no caiga?'; },
      function (v) { return v.m * g / v.mus; }, 'Tu empujón es la normal; la fricción $\\mu_sN$ debe igualar el peso.', { unit: 'N', mistakes: { times: function (v) { return v.mus * v.m * g; } }, feedback: fb('times', 'La fricción debe igualar el peso: $\\mu_sF = mg$, así que $F = mg/\\mu_s$.') }),
    N('es-apilada', 'estatica', 2, { m1: [1, 10, 1], m2: [1, 10, 1], mus: MU }, function (v) { return 'Una caja de $' + v.m2 + '\\ \\text{kg}$ va encima de otra de $' + v.m1 + '\\ \\text{kg}$ ($\\mu_s = ' + v.mus + '$ entre ellas); la de abajo está en un piso liso. ¿Con qué fuerza máxima puedes jalar la de abajo sin que la de arriba resbale?'; },
      function (v) { return (v.m1 + v.m2) * v.mus * g; }, 'La de arriba acelera como máximo $\\mu_s g$; las dos juntas necesitan $(m_1 + m_2)\\mu_s g$.', { unit: 'N' }),
    N('es-camion', 'estatica', 2, { mus: MU }, function (v) { return 'Una caja viaja suelta en la caja de un camión ($\\mu_s = ' + v.mus + '$). ¿Cuál es la aceleración máxima del camión para que la caja no resbale?'; },
      function (v) { return v.mus * g; }, 'Solo la fricción estática acelera a la caja: $a_{máx} = \\mu_s g$.', { unit: 'm/s²' }),
    N('es-frenado', 'estatica', 3, { v: [10, 35, 1], mus: [0.4, 1, 0.05] }, function (v) { return 'Con frenos ABS, las llantas no derrapan y la fricción es estática ($\\mu_s = ' + v.mus + '$). ¿Cuál es la distancia mínima de frenado desde $' + v.v + '\\ \\text{m/s}$?'; },
      function (v) { return v.v * v.v / (2 * v.mus * g); }, 'Desaceleración máxima $\\mu_s g$; luego $d = v^2/(2a)$.', { unit: 'm' }),

    /* ---------------- Fricción cinética ---------------- */
    N('ci-f', 'cinetica', 1, { m: [1, 80, 1], muk: MU }, function (v) { return 'Una caja de $' + v.m + '\\ \\text{kg}$ desliza por un piso horizontal con $\\mu_k = ' + v.muk + '$. ¿Cuánto vale la fricción?'; },
      function (v) { return v.muk * v.m * g; }, '$f_k = \\mu_k mg$.', { unit: 'N' }),
    N('ci-a', 'cinetica', 2, { muk: MU }, function (v) { return 'Un disco desliza sin empuje sobre un piso con $\\mu_k = ' + v.muk + '$. ¿Con qué desaceleración frena?'; },
      function (v) { return v.muk * g; }, 'La única fuerza horizontal es la fricción: $a = \\mu_k g$.', { unit: 'm/s²' }),
    N('ci-derrape', 'cinetica', 2, { v: [5, 35, 1], muk: MU }, function (v) { return 'Un auto derrapa con las llantas bloqueadas ($\\mu_k = ' + v.muk + '$) desde $' + v.v + '\\ \\text{m/s}$. ¿Qué distancia recorre hasta parar?'; },
      function (v) { return v.v * v.v / (2 * v.muk * g); }, '$a = \\mu_k g$ y $d = v^2/(2a)$.', { unit: 'm', mistakes: { noTwo: function (v) { return v.v * v.v / (v.muk * g); } }, feedback: fb('noTwo', 'Falta el 2: $v^2 = 2ad$.') }),
    N('ci-empuje', 'cinetica', 1, { F: [20, 300, 10], m: [2, 40, 1], muk: MU }, function (v) { return 'Empujas horizontalmente con $' + v.F + '\\ \\text{N}$ una caja de $' + v.m + '\\ \\text{kg}$ que desliza ($\\mu_k = ' + v.muk + '$). ¿Qué aceleración tiene?'; },
      function (v) { return (v.F - v.muk * v.m * g) / v.m; }, '$a = (F - \\mu_k mg)/m$.', { unit: 'm/s²', where: function (v) { return (v.F - v.muk * v.m * g) / v.m > 0.3; }, mistakes: { noFriction: function (v) { return v.F / v.m; } }, feedback: fb('noFriction', 'Te faltó restar la fricción.') }),
    N('ci-constante', 'cinetica', 1, { mc: [1, 80, 1], mk: MU }, function (v) { return '¿Con qué fuerza horizontal hay que empujar una caja de $' + v.mc + '\\ \\text{kg}$ ($\\mu_k = ' + v.mk + '$) para que deslice a velocidad constante?'; },
      function (v) { return v.mk * v.mc * g; }, 'Velocidad constante: tu fuerza iguala a la fricción cinética.', { unit: 'N' }),
    N('ci-mu', 'cinetica', 3, { v: [5, 30, 1], d: [5, 80, 5] }, function (v) { return 'Un auto derrapa desde $' + v.v + '\\ \\text{m/s}$ y se detiene en $' + v.d + '\\ \\text{m}$. ¿Cuánto vale $\\mu_k$ entre las llantas y el piso?'; },
      function (v) { return v.v * v.v / (2 * g * v.d); }, 'De $v^2 = 2\\mu_k g d$.', { tol: { abs: 0.005 }, where: function (v) { return v.v * v.v / (2 * g * v.d) < 1.2; } }),
    N('ci-t', 'cinetica', 2, { v: [5, 35, 1], muk: MU }, function (v) { return 'Un bloque desliza a $' + v.v + '\\ \\text{m/s}$ sobre un piso con $\\mu_k = ' + v.muk + '$ y nada lo empuja. ¿Cuánto tarda en detenerse?'; },
      function (v) { return v.v / (v.muk * g); }, '$t = v/a$ con $a = \\mu_k g$.', { unit: 's' }),
    N('ci-v-d', 'cinetica', 2, { v0: [5, 20, 1], muk: MU, d: [1, 15, 1] }, function (v) { return 'Un disco sale a $' + v.v0 + '\\ \\text{m/s}$ y desliza $' + v.d + '\\ \\text{m}$ sobre un piso con $\\mu_k = ' + v.muk + '$. ¿Qué rapidez le queda?'; },
      function (v) { return Math.sqrt(v.v0 * v.v0 - 2 * v.muk * g * v.d); }, '$v^2 = v_0^2 - 2\\mu_k g d$.', { unit: 'm/s', where: function (v) { return v.v0 * v.v0 - 2 * v.muk * g * v.d > 4; } }),

    /* ---------------- Fuerza con ángulo ---------------- */
    N('an-push-N', 'angulo', 1, { m: [5, 40, 1], F: [10, 200, 5], th: [10, 60, 5] }, function (v) { return 'Empujas una caja de $' + v.m + '\\ \\text{kg}$ con $' + v.F + '\\ \\text{N}$ a $' + v.th + '^\\circ$ por debajo de la horizontal. ¿Cuánto vale la normal?'; },
      function (v) { return v.m * g + v.F * sn(v.th); }, '$N = mg + F\\sin\\theta$.', { unit: 'N', mistakes: { usedMg: function (v) { return v.m * g; } }, feedback: fb('usedMg', 'Tu fuerza empuja hacia abajo: aumenta la normal.') }),
    N('an-pull-N', 'angulo', 1, { m: [5, 40, 1], F: [10, 200, 5], th: [10, 60, 5] }, function (v) { return 'Jalas una caja de $' + v.m + '\\ \\text{kg}$ con una cuerda de $' + v.F + '\\ \\text{N}$ a $' + v.th + '^\\circ$ sobre la horizontal. ¿Cuánto vale la normal?'; },
      function (v) { return v.m * g - v.F * sn(v.th); }, '$N = mg - F\\sin\\theta$.', { unit: 'N', where: function (v) { return v.m * g - v.F * sn(v.th) > 5; }, mistakes: { usedMg: function (v) { return v.m * g; }, wrongSign: function (v) { return v.m * g + v.F * sn(v.th); } }, feedback: [{ when: 'usedMg', say: 'La cuerda levanta un poco la caja: la normal disminuye.' }, { when: 'wrongSign', say: 'Signo al revés: al jalar hacia arriba, la normal baja.' }] }),
    N('an-push-f', 'angulo', 2, { m: [5, 40, 1], F: [10, 200, 5], th: [10, 60, 5], mu: [0.1, 0.5, 0.05] }, function (v) { return 'Empujas una caja de $' + v.m + '\\ \\text{kg}$ con $' + v.F + '\\ \\text{N}$ a $' + v.th + '^\\circ$ bajo la horizontal mientras desliza ($\\mu_k = ' + v.mu + '$). ¿Cuánto vale la fricción?'; },
      function (v) { return v.mu * (v.m * g + v.F * sn(v.th)); }, '$f_k = \\mu_k(mg + F\\sin\\theta)$.', { unit: 'N', mistakes: { usedMg: function (v) { return v.mu * v.m * g; } }, feedback: fb('usedMg', 'Con $N = mg$ la fricción sale menor; empujar hacia abajo aumenta $N$.') }),
    N('an-pull-a', 'angulo', 2, { m: [5, 40, 1], F: [10, 200, 5], th: [10, 60, 5], mu: [0.1, 0.5, 0.05] }, function (v) { return 'Jalas con $' + v.F + '\\ \\text{N}$ a $' + v.th + '^\\circ$ sobre la horizontal una caja de $' + v.m + '\\ \\text{kg}$ que desliza ($\\mu_k = ' + v.mu + '$). ¿Qué aceleración tiene?'; },
      function (v) { return (v.F * cs(v.th) - v.mu * (v.m * g - v.F * sn(v.th))) / v.m; }, '$a = [F\\cos\\theta - \\mu_k(mg - F\\sin\\theta)]/m$.', { unit: 'm/s²', where: function (v) { var N0 = v.m * g - v.F * sn(v.th); return N0 > 5 && (v.F * cs(v.th) - v.mu * N0) / v.m > 0.3; }, mistakes: { usedMg: function (v) { return (v.F * cs(v.th) - v.mu * v.m * g) / v.m; } }, feedback: fb('usedMg', 'Calculaste la fricción con $N = mg$; al jalar hacia arriba la normal es menor.') }),
    N('an-push-a', 'angulo', 2, { m: [5, 40, 1], F: [10, 200, 5], th: [10, 60, 5], mu: [0.1, 0.5, 0.05] }, function (v) { return 'Empujas con $' + v.F + '\\ \\text{N}$ a $' + v.th + '^\\circ$ bajo la horizontal una caja de $' + v.m + '\\ \\text{kg}$ que desliza ($\\mu_k = ' + v.mu + '$). ¿Qué aceleración tiene?'; },
      function (v) { return (v.F * cs(v.th) - v.mu * (v.m * g + v.F * sn(v.th))) / v.m; }, '$a = [F\\cos\\theta - \\mu_k(mg + F\\sin\\theta)]/m$.', { unit: 'm/s²', where: function (v) { return (v.F * cs(v.th) - v.mu * (v.m * g + v.F * sn(v.th))) / v.m > 0.3; }, mistakes: { usedMg: function (v) { return (v.F * cs(v.th) - v.mu * v.m * g) / v.m; } }, feedback: fb('usedMg', 'Con $N = mg$ ignoras que tu empujón aprieta la caja contra el piso.') }),
    N('an-despega', 'angulo', 3, { m: [1, 20, 1], th: [20, 70, 5] }, function (v) { return 'Jalas una caja de $' + v.m + '\\ \\text{kg}$ con una cuerda a $' + v.th + '^\\circ$ sobre la horizontal. ¿Con qué tensión se despega del piso ($N = 0$)?'; },
      function (v) { return v.m * g / sn(v.th); }, '$N = mg - F\\sin\\theta = 0$.', { unit: 'N' }),
    N('an-no-mueve', 'angulo', 3, { m: [20, 60, 1], F: [10, 80, 5], th: [10, 50, 5], mus: [0.4, 0.8, 0.05] }, function (v) { return 'Empujas con $' + v.F + '\\ \\text{N}$ a $' + v.th + '^\\circ$ bajo la horizontal un mueble de $' + v.m + '\\ \\text{kg}$ ($\\mu_s = ' + v.mus + '$) y no se mueve. ¿Cuánto vale la fricción?'; },
      function (v) { return v.F * cs(v.th); }, 'No se mueve: la fricción iguala a la componente horizontal $F\\cos\\theta$.', { unit: 'N', where: function (v) { return v.F * cs(v.th) < 0.9 * v.mus * (v.m * g + v.F * sn(v.th)); }, mistakes: { maxS: function (v) { return v.mus * (v.m * g + v.F * sn(v.th)); }, fullF: function (v) { return v.F; } }, feedback: [{ when: 'maxS', say: 'Ese es el máximo; como no se mueve, basta igualar $F\\cos\\theta$.' }, { when: 'fullF', say: 'Solo la componente horizontal $F\\cos\\theta$ tiende a moverlo.' }] }),
    N('an-arranca-pull', 'angulo', 2, { m: [2, 40, 1], mus: MU, th: [10, 40, 5] }, function (v) { return '¿Qué fuerza mínima, jalando a $' + v.th + '^\\circ$ sobre la horizontal, arranca una caja de $' + v.m + '\\ \\text{kg}$ con $\\mu_s = ' + v.mus + '$?'; },
      function (v) { return v.mus * v.m * g / (cs(v.th) + v.mus * sn(v.th)); }, '$F\\cos\\theta = \\mu_s(mg - F\\sin\\theta)$.', { unit: 'N', mistakes: { usedMg: function (v) { return v.mus * v.m * g / cs(v.th); } }, feedback: fb('usedMg', 'Con $N = mg$ te sale de más: la cuerda reduce la normal.') }),
    N('an-arranca-push', 'angulo', 3, { m: [2, 40, 1], mus: [0.1, 0.6, 0.05], th: [10, 40, 5] }, function (v) { return '¿Qué fuerza mínima, empujando a $' + v.th + '^\\circ$ bajo la horizontal, arranca una caja de $' + v.m + '\\ \\text{kg}$ con $\\mu_s = ' + v.mus + '$?'; },
      function (v) { return v.mus * v.m * g / (cs(v.th) - v.mus * sn(v.th)); }, '$F\\cos\\theta = \\mu_s(mg + F\\sin\\theta)$.', { unit: 'N', where: function (v) { return cs(v.th) - v.mus * sn(v.th) > 0.2; } }),
    N('an-componente', 'angulo', 2, { F: [10, 200, 5], th: [10, 60, 5] }, function (v) { return 'Una fuerza de $' + v.F + '\\ \\text{N}$ jala una caja a $' + v.th + '^\\circ$ sobre la horizontal. ¿Qué parte de ella empuja la caja hacia adelante?'; },
      function (v) { return v.F * cs(v.th); }, 'La componente horizontal: $F\\cos\\theta$.', { unit: 'N', mistakes: { usedSin: function (v) { return v.F * sn(v.th); } }, feedback: fb('usedSin', 'Esa es la componente vertical; la horizontal lleva coseno.') }),

    /* ---------------- Ángulo óptimo ---------------- */
    N('op-angulo', 'optimo', 1, { mu: [0.1, 1.2, 0.05] }, function (v) { return 'Para arrancar una caja con $\\mu_s = ' + v.mu + '$ jalando con una cuerda, ¿con qué ángulo sobre la horizontal se necesita la menor fuerza?'; },
      function (v) { return Math.atan(v.mu) * DEG; }, '$\\tan\\theta = \\mu_s$.', { unit: '°', tol: { abs: 0.3 }, where: function (v) { return Math.abs(v.mu - 1) > 0.1; }, mistakes: { inverted: function (v) { return Math.atan(1 / v.mu) * DEG; } }, feedback: fb('inverted', 'Es $\\tan\\theta = \\mu_s$, no $1/\\mu_s$.') }),
    N('op-Fmin', 'optimo', 2, { m: [2, 40, 1], mu: [0.1, 1, 0.05] }, function (v) { return 'Jalando con el ángulo óptimo, ¿qué fuerza mínima arranca una caja de $' + v.m + '\\ \\text{kg}$ con $\\mu_s = ' + v.mu + '$?'; },
      function (v) { return v.mu * v.m * g / Math.sqrt(1 + v.mu * v.mu); }, '$F_{mín} = \\mu_s mg/\\sqrt{1 + \\mu_s^2}$.', { unit: 'N', mistakes: { horizontal: function (v) { return v.mu * v.m * g; } }, feedback: fb('horizontal', 'Esa es la fuerza jalando horizontal; con el ángulo óptimo se necesita menos.') }),
    N('op-ahorro', 'optimo', 3, { mu: [0.1, 1, 0.05] }, function (v) { return 'Con $\\mu_s = ' + v.mu + '$, ¿qué fracción de la fuerza horizontal necesaria basta si jalas con el ángulo óptimo?'; },
      function (v) { return 1 / Math.sqrt(1 + v.mu * v.mu); }, 'La razón es $1/\\sqrt{1 + \\mu_s^2}$.', { tol: { abs: 0.002 } }),
    N('op-N', 'optimo', 3, { m: [2, 40, 1], mu: [0.1, 1, 0.05] }, function (v) { return 'Jalando con el ángulo óptimo y la fuerza mínima para arrancar una caja de $' + v.m + '\\ \\text{kg}$ ($\\mu_s = ' + v.mu + '$), ¿cuánto vale la normal?'; },
      function (v) { return v.m * g / (1 + v.mu * v.mu); }, '$N = mg - F_{mín}\\sin\\theta^*$, que simplifica a $mg/(1 + \\mu_s^2)$.', { unit: 'N' }),
    N('op-30', 'optimo', 2, { m: [2, 40, 1], mus: MU }, function (v) { return '¿Qué fuerza mínima arranca una caja de $' + v.m + '\\ \\text{kg}$ ($\\mu_s = ' + v.mus + '$) si la cuerda forma $30^\\circ$ con la horizontal?'; },
      function (v) { return v.mus * v.m * g / (cs(30) + v.mus * sn(30)); }, '$F = \\mu_s mg/(\\cos\\theta + \\mu_s\\sin\\theta)$.', { unit: 'N' }),

    /* ---------------- Más práctica ---------------- */
    N('ho-largo', 'hooke', 2, { L0: [0.1, 0.5, 0.05], m: [0.1, 3, 0.1], k: [20, 500, 10] }, function (v) { return 'Un resorte mide $' + v.L0 + '\\ \\text{m}$ sin carga y tiene $k = ' + v.k + '\\ \\text{N/m}$. ¿Cuánto mide al colgarle $' + v.m + '\\ \\text{kg}$?'; },
      function (v) { return v.L0 + v.m * g / v.k; }, 'Largo natural más el estiramiento $mg/k$.', { unit: 'm', mistakes: { onlyX: function (v) { return v.m * g / v.k; } }, feedback: fb('onlyX', 'Ese es solo el estiramiento; súmale el largo natural.') }),
    N('ho-agregar', 'hooke', 2, { m1: [0.1, 3, 0.1], m2: [0.1, 3, 0.1], k: [20, 500, 10] }, function (v) { return 'De un resorte de $k = ' + v.k + '\\ \\text{N/m}$ cuelgan $' + v.m1 + '\\ \\text{kg}$. ¿Cuánto más se estira si agregas otros $' + v.m2 + '\\ \\text{kg}$?'; },
      function (v) { return v.m2 * g / v.k; }, 'El estiramiento extra solo depende del peso agregado.', { unit: 'm' }),
    N('es-dos-cajas', 'estatica', 2, { m1: [5, 40, 1], m2: [5, 40, 1], mus: MU }, function (v) { return 'Dos cajas de $' + v.m1 + '$ y $' + v.m2 + '\\ \\text{kg}$ están una junto a la otra ($\\mu_s = ' + v.mus + '$ para las dos). ¿Qué fuerza horizontal mínima, aplicada a la primera, las pone en movimiento?'; },
      function (v) { return v.mus * (v.m1 + v.m2) * g; }, 'Hay que vencer la fricción máxima de las dos.', { unit: 'N', mistakes: { onlyFirst: function (v) { return v.mus * v.m1 * g; } }, feedback: fb('onlyFirst', 'La primera empuja a la segunda: hay que vencer la fricción de ambas.') }),
    N('es-dos-personas', 'estatica', 2, { m: [40, 100, 5], mus: [0.4, 0.9, 0.05], F1: [20, 150, 10], F2: [20, 150, 10] }, function (v) { return 'Dos personas empujan en el mismo sentido un mueble de $' + v.m + '\\ \\text{kg}$ ($\\mu_s = ' + v.mus + '$) con $' + v.F1 + '$ y $' + v.F2 + '\\ \\text{N}$, y no se mueve. ¿Cuánto vale la fricción?'; },
      function (v) { return v.F1 + v.F2; }, 'No se mueve: la fricción iguala la suma de los empujones.', { unit: 'N', where: function (v) { return v.F1 + v.F2 < 0.9 * v.mus * v.m * g; } }),
    N('ci-F-a', 'cinetica', 2, { m: [2, 40, 1], a: [0.5, 4, 0.5], muk: MU }, function (v) { return '¿Qué fuerza horizontal acelera a $' + v.a + '\\ \\text{m/s}^2$ una caja de $' + v.m + '\\ \\text{kg}$ que desliza con $\\mu_k = ' + v.muk + '$?'; },
      function (v) { return v.m * (v.a + v.muk * g); }, '$F - \\mu_k mg = ma$.', { unit: 'N', mistakes: { noFriction: function (v) { return v.m * v.a; } }, feedback: fb('noFriction', 'También hay que vencer la fricción.') }),
    N('ci-dos', 'cinetica', 2, { F: [20, 300, 10], m1: [1, 20, 1], m2: [1, 20, 1], muk: [0.1, 0.4, 0.05] }, function (v) { return 'Jalas con $' + v.F + '\\ \\text{N}$ dos cajas en fila de $' + v.m1 + '$ y $' + v.m2 + '\\ \\text{kg}$ que deslizan con $\\mu_k = ' + v.muk + '$. ¿Qué aceleración tienen?'; },
      function (v) { return v.F / (v.m1 + v.m2) - v.muk * g; }, '$a = F/(m_1 + m_2) - \\mu_k g$.', { unit: 'm/s²', where: function (v) { return v.F / (v.m1 + v.m2) - v.muk * g > 0.3; } }),
    N('an-pull-f', 'angulo', 2, { m: [5, 40, 1], F: [10, 200, 5], th: [10, 60, 5], mu: [0.1, 0.5, 0.05] }, function (v) { return 'Jalas con $' + v.F + '\\ \\text{N}$ a $' + v.th + '^\\circ$ sobre la horizontal una caja de $' + v.m + '\\ \\text{kg}$ que desliza ($\\mu_k = ' + v.mu + '$). ¿Cuánto vale la fricción?'; },
      function (v) { return v.mu * (v.m * g - v.F * sn(v.th)); }, '$f_k = \\mu_k(mg - F\\sin\\theta)$.', { unit: 'N', where: function (v) { return v.m * g - v.F * sn(v.th) > 5; }, mistakes: { usedMg: function (v) { return v.mu * v.m * g; } }, feedback: fb('usedMg', 'Al jalar hacia arriba la normal es menor que $mg$.') }),
    N('an-diferencia', 'angulo', 2, { F: [10, 200, 5], th: [10, 60, 5] }, function (v) { return 'Con una fuerza de $' + v.F + '\\ \\text{N}$ a $' + v.th + '^\\circ$, ¿cuánto mayor es la normal al empujar hacia abajo que al jalar hacia arriba?'; },
      function (v) { return 2 * v.F * sn(v.th); }, '$(mg + F\\sin\\theta) - (mg - F\\sin\\theta) = 2F\\sin\\theta$.', { unit: 'N' }),
    N('an-v-t', 'angulo', 2, { m: [5, 40, 1], F: [20, 200, 5], th: [10, 45, 5], mu: [0.1, 0.4, 0.05], t: [1, 6, 1] }, function (v) { return 'Jalas desde el reposo una caja de $' + v.m + '\\ \\text{kg}$ con $' + v.F + '\\ \\text{N}$ a $' + v.th + '^\\circ$ sobre la horizontal ($\\mu_k = ' + v.mu + '$; ya desliza). ¿Qué rapidez tiene a los $' + v.t + '\\ \\text{s}$?'; },
      function (v) { return (v.F * cs(v.th) - v.mu * (v.m * g - v.F * sn(v.th))) / v.m * v.t; }, 'Calcula $a$ con la normal correcta y usa $v = at$.', { unit: 'm/s', where: function (v) { var N0 = v.m * g - v.F * sn(v.th); return N0 > 5 && (v.F * cs(v.th) - v.mu * N0) / v.m > 0.3; } }),
    N('op-45', 'optimo', 2, { m: [2, 40, 1], mus: MU }, function (v) { return '¿Qué fuerza mínima arranca una caja de $' + v.m + '\\ \\text{kg}$ ($\\mu_s = ' + v.mus + '$) si jalas a $45^\\circ$ sobre la horizontal?'; },
      function (v) { return v.mus * v.m * g / (cs(45) + v.mus * sn(45)); }, '$F = \\mu_s mg/(\\cos\\theta + \\mu_s\\sin\\theta)$ con $\\theta = 45^\\circ$.', { unit: 'N' }),

    /* ---------------- Conceptuales ---------------- */
    C('k-ho-prop', 'hooke', 1, 'Según la ley de Hooke, la fuerza de un resorte es…', 'proporcional a su deformación', [['constante'], ['proporcional al cuadrado de la deformación'], ['inversa a la deformación']], '$F = -kx$.'),
    C('k-ho-signo', 'hooke', 1, 'El signo menos en $F = -kx$ significa que la fuerza…', 'apunta en contra de la deformación', [['es negativa siempre'], ['apunta hacia abajo'], ['desaparece al estirarlo']], 'Tiende a regresar el resorte a su largo natural.'),
    C('k-ho-rigido', 'hooke', 1, 'Un resorte con $k$ grande…', 'es más rígido: se deforma poco', [['es más blando'], ['no ejerce fuerza'], ['se estira mucho con poca fuerza']], 'Más N por cada metro.'),
    C('k-ho-unidades', 'hooke', 1, 'La constante $k$ se mide en…', 'N/m', [['N'], ['m/N'], ['kg']], 'Fuerza entre deformación.'),
    C('k-ho-doble', 'hooke', 2, 'Si estiras un resorte el doble, su fuerza…', 'se duplica', [['se cuadruplica'], ['no cambia'], ['se reduce a la mitad']], 'Es lineal en $x$.'),
    C('k-ho-comprimido', 'hooke', 1, 'Un resorte comprimido empuja lo que tiene en su extremo…', 'hacia afuera, para recuperar su largo', [['hacia adentro'], ['no empuja'], ['hacia abajo siempre']], 'La fuerza se opone a la compresión.'),
    C('k-ho-equilibrio', 'hooke', 2, 'Un cuerpo cuelga en reposo de un resorte. Entonces…', '$kx = mg$', [['$kx = 0$'], ['$k = mg$'], ['$x = mg$']], 'La fuerza del resorte equilibra el peso.'),
    C('k-ho-dos', 'hooke', 3, 'Dos resortes iguales lado a lado sostienen una carga. Comparado con un solo resorte, cada uno se estira…', 'la mitad', [['el doble'], ['lo mismo'], ['la cuarta parte']], 'Cada uno carga la mitad del peso.'),
    C('k-fs-desig', 'estatica', 1, 'La expresión $f_s \\le \\mu_sN$ dice que la fricción estática…', 'vale lo necesario para evitar el deslizamiento, hasta un máximo', [['siempre vale $\\mu_sN$'], ['siempre es cero'], ['es mayor que $\\mu_sN$']], 'Solo alcanza $\\mu_sN$ justo antes de deslizar.'),
    C('k-fs-igual', 'estatica', 1, 'Empujas un mueble con 50 N y no se mueve. La fricción vale…', '50 N', [['más de 50 N'], ['$\\mu_s mg$'], ['cero']], 'Equilibrio: la fricción iguala tu fuerza.'),
    C('k-mus-muk', 'estatica', 1, 'Normalmente, $\\mu_s$ comparado con $\\mu_k$ es…', 'mayor', [['menor'], ['igual'], ['cero']], 'Cuesta más arrancar que mantener el movimiento.'),
    C('k-mu-unidades', 'estatica', 1, 'Los coeficientes de fricción…', 'no tienen unidades', [['se miden en N'], ['se miden en N/m'], ['se miden en kg']], 'Son un cociente de fuerzas.'),
    C('k-mu-materiales', 'estatica', 2, 'El coeficiente de fricción depende principalmente de…', 'los materiales de las superficies en contacto', [['el área de contacto'], ['la velocidad'], ['la masa del objeto']], 'Hule sobre asfalto, acero sobre hielo…'),
    C('k-caminar', 'estatica', 3, 'Al caminar, la fricción del piso sobre tu pie apunta…', 'hacia adelante', [['hacia atrás'], ['hacia arriba'], ['no hay fricción']], 'Tu pie empuja el piso hacia atrás; el piso te empuja hacia adelante.'),
    C('k-auto-acelera', 'estatica', 3, 'Un auto acelera en el asfalto sin derrapar. La fuerza que lo impulsa hacia adelante es…', 'la fricción estática del piso sobre las llantas', [['el motor directamente'], ['la fricción cinética'], ['la normal']], 'El motor gira las llantas; el piso las empuja hacia adelante.'),
    C('k-camion-caja', 'estatica', 2, 'Una caja no se desliza en un camión que acelera. ¿Qué la acelera?', 'La fricción estática del piso del camión', [['Nada, se queda quieta'], ['El aire'], ['La fricción cinética']], 'Apunta hacia adelante, igual que la aceleración.'),
    C('k-fs-N', 'estatica', 2, 'La fricción estática máxima depende de…', 'la normal', [['el área de contacto'], ['la velocidad'], ['el tiempo']], '$f_{s,máx} = \\mu_sN$.'),
    C('k-area', 'estatica', 3, 'Una caja se apoya primero en su cara grande y luego en la chica (misma masa). La fricción máxima…', 'es la misma', [['es mayor en la cara grande'], ['es mayor en la cara chica'], ['depende de la velocidad']], 'En este modelo no depende del área.'),
    C('k-arranca', 'estatica', 1, 'Una caja empieza a moverse cuando tu fuerza horizontal…', 'supera $\\mu_sN$', [['supera $\\mu_kN$'], ['supera su peso'], ['es mayor que cero']], 'Hay que vencer la estática máxima.'),
    C('k-pared', 'estatica', 2, 'Sostienes un libro contra la pared. Si empujas más fuerte (sigue sin moverse), la fricción…', 'no cambia: sigue igual al peso', [['aumenta'], ['disminuye'], ['se vuelve cero']], 'Solo aumenta la fricción máxima posible.'),
    C('k-fk-const', 'cinetica', 1, 'En este curso, la fricción cinética…', 'no depende de la velocidad', [['crece con la velocidad'], ['disminuye con la velocidad'], ['es cero a alta velocidad']], '$f_k = \\mu_kN$, constante.'),
    C('k-fk-dir', 'cinetica', 1, 'La fricción cinética apunta…', 'contra el deslizamiento', [['a favor del movimiento'], ['hacia abajo'], ['hacia el centro']], 'Frena el movimiento relativo.'),
    C('k-abs', 'cinetica', 3, 'Los frenos ABS evitan que las llantas se bloqueen porque…', 'la fricción estática máxima es mayor que la cinética', [['la fricción cinética es mayor'], ['así no hay fricción'], ['bloqueadas frenan más']], 'Rodando sin derrapar se aprovecha $\\mu_s$.'),
    C('k-arranque-baja', 'cinetica', 2, 'Empujas un mueble y de pronto arranca. En ese momento, la fuerza necesaria para seguir moviéndolo…', 'baja', [['sube'], ['no cambia'], ['se vuelve cero']], 'Pasa de $\\mu_sN$ a $\\mu_kN$.'),
    C('k-derrape-masa', 'cinetica', 3, 'Dos autos, uno ligero y otro pesado, derrapan desde la misma rapidez con el mismo $\\mu_k$. ¿Cuál recorre más?', 'Recorren lo mismo', [['El pesado'], ['El ligero'], ['Depende del motor']], '$a = \\mu_k g$: la masa se cancela.'),
    C('k-derrape-doble', 'cinetica', 2, 'Si un auto derrapa desde el doble de rapidez, la distancia de derrape…', 'se cuadruplica', [['se duplica'], ['no cambia'], ['se reduce a la mitad']], '$d = v^2/(2\\mu_k g)$.'),
    C('k-hielo', 'cinetica', 1, 'En el hielo, $\\mu_k$ es pequeño; por eso un disco…', 'desliza mucho antes de detenerse', [['se detiene de inmediato'], ['acelera solo'], ['no se puede mover']], 'Poca fricción, poca desaceleración.'),
    C('k-mas-mu', 'cinetica', 1, 'Con un $\\mu_k$ mayor, la distancia de frenado…', 'disminuye', [['aumenta'], ['no cambia'], ['se vuelve infinita']], 'Mayor desaceleración.'),
    C('k-fk-N', 'cinetica', 2, 'La fricción cinética sobre un bloque vale $\\mu_k$ por…', 'la normal', [['el peso siempre'], ['la masa'], ['la fuerza aplicada']], 'Solo es $\\mu_k mg$ si $N = mg$.'),
    C('k-desliza-sin', 'cinetica', 2, 'Un disco desliza por el piso sin que nada lo empuje. Su aceleración…', 'apunta contra su movimiento', [['apunta a favor del movimiento'], ['es cero'], ['es $g$ hacia abajo']], 'Solo la fricción actúa horizontalmente.'),
    C('k-push-N', 'angulo', 1, 'Si empujas una caja hacia abajo con un ángulo, la normal…', 'aumenta', [['disminuye'], ['no cambia'], ['se vuelve cero']], '$N = mg + F\\sin\\theta$.'),
    C('k-pull-N', 'angulo', 1, 'Si jalas una caja con una cuerda inclinada hacia arriba, la normal…', 'disminuye', [['aumenta'], ['no cambia'], ['se duplica']], '$N = mg - F\\sin\\theta$.'),
    C('k-adelante', 'angulo', 1, 'De una fuerza $F$ a un ángulo $\\theta$ de la horizontal, la parte que empuja hacia adelante es…', '$F\\cos\\theta$', [['$F\\sin\\theta$'], ['$F$'], ['$F\\tan\\theta$']], 'La componente horizontal.'),
    C('k-pull-f', 'angulo', 2, 'Jalar con una cuerda inclinada hacia arriba, en lugar de horizontal…', 'reduce la fricción', [['aumenta la fricción'], ['no cambia la fricción'], ['elimina la fricción siempre']], 'Menos normal, menos fricción.'),
    C('k-despega', 'angulo', 2, 'Si jalas hacia arriba con $F\\sin\\theta$ mayor que $mg$, la caja…', 'se despega del piso', [['aprieta más el piso'], ['no cambia'], ['se hunde']], 'La normal no puede ser negativa.'),
    C('k-theta0', 'angulo', 1, 'Con $\\theta = 0$ (fuerza horizontal), la normal es…', '$mg$', [['cero'], ['$mg + F$'], ['$F$']], 'La fuerza no tiene componente vertical.'),
    C('k-trineo', 'angulo', 2, '¿Por qué conviene jalar un trineo con la cuerda un poco inclinada hacia arriba?', 'Porque reduce la normal y la fricción', [['Porque así se usa toda la fuerza hacia adelante'], ['Porque aumenta la normal'], ['Porque elimina el peso']], 'Se pierde algo de componente horizontal, pero se gana en fricción.'),
    C('k-misma-F', 'angulo', 2, 'Con la misma fuerza y el mismo ángulo, ¿qué acelera más la caja?', 'Jalarla hacia arriba', [['Empujarla hacia abajo'], ['Da lo mismo'], ['Depende de la masa']], 'Empujar hacia abajo aumenta la fricción.'),
    C('k-error-N', 'angulo', 1, 'El error más común con fuerzas inclinadas es…', 'usar $N = mg$', [['usar $F\\cos\\theta$'], ['calcular la normal'], ['dibujar el peso']], 'Hay que sumar las fuerzas verticales.'),
    C('k-N-negativa', 'angulo', 3, 'Si tu cuenta de la normal sale negativa, significa que…', 'la caja ya se despegó y el modelo no aplica', [['la normal apunta hacia abajo'], ['hay que cambiar el signo de $g$'], ['la fricción es negativa']], 'Una superficie no puede jalar.'),
    C('k-podadora', 'angulo', 3, 'Empujas una podadora por el mango inclinado. Si bajas el mango (más horizontal)…', 'te cuesta menos moverla', [['te cuesta más'], ['no cambia'], ['la podadora se levanta']], 'Menos componente hacia abajo: menos normal y menos fricción.'),
    C('k-vertical-comp', 'angulo', 2, 'La componente vertical de una fuerza inclinada…', 'cambia la normal pero no empuja hacia adelante', [['empuja hacia adelante'], ['no afecta nada'], ['se suma al peso siempre']], 'Actúa en el eje $y$.'),
    C('k-op-tan', 'optimo', 1, 'Al jalar para arrancar una caja, el ángulo que requiere la menor fuerza cumple…', '$\\tan\\theta = \\mu_s$', [['$\\sin\\theta = \\mu_s$'], ['$\\theta = 45^\\circ$ siempre'], ['$\\theta = 0^\\circ$ siempre']], 'Sale de derivar $F(\\theta)$.'),
    C('k-op-cero', 'optimo', 2, 'Si no hubiera fricción ($\\mu = 0$), el ángulo óptimo para jalar sería…', '$0^\\circ$', [['$45^\\circ$'], ['$90^\\circ$'], ['cualquiera']], 'No hay normal que reducir.'),
    C('k-op-mayor', 'optimo', 2, 'Con un $\\mu_s$ mayor, el ángulo óptimo…', 'es mayor', [['es menor'], ['no cambia'], ['es cero']], '$\\theta^* = \\arctan\\mu_s$ crece con $\\mu_s$.'),
    C('k-op-menor', 'optimo', 2, 'La fuerza mínima con el ángulo óptimo, comparada con jalar horizontal, es…', 'menor', [['mayor'], ['igual'], ['el doble']], '$\\mu_s mg/\\sqrt{1 + \\mu_s^2} < \\mu_s mg$.'),
    C('k-op-derivada', 'optimo', 3, 'El ángulo óptimo se encuentra…', 'igualando a cero la derivada de $F(\\theta)$', [['igualando $F$ a cero'], ['con $\\theta = 45^\\circ$'], ['haciendo $N = 0$']], 'Es un problema de optimización como los de Cálculo.'),
    C('k-op-mucho', 'optimo', 2, 'Si jalas con un ángulo demasiado grande (casi vertical)…', 'casi toda tu fuerza levanta y poca empuja hacia adelante', [['la fricción aumenta'], ['es lo más eficiente'], ['la caja no puede moverse nunca']], 'Por eso hay un óptimo intermedio.'),
    C('k-op-empujar', 'optimo', 3, 'Si empujas hacia abajo, el mejor ángulo para arrancar es…', 'horizontal ($0^\\circ$)', [['$\\arctan\\mu_s$ hacia abajo'], ['$45^\\circ$ hacia abajo'], ['vertical']], 'Cualquier ángulo hacia abajo aumenta la normal.'),
    C('k-op-45', 'optimo', 1, 'Con $\\mu_s = 1$, el ángulo óptimo para jalar es…', '$45^\\circ$', [['$30^\\circ$'], ['$60^\\circ$'], ['$0^\\circ$']], '$\\arctan 1 = 45^\\circ$.')
  ];

  K.register({
    'f1.S10.hooke': 'Ley de Hooke',
    'f1.S10.estatica': 'Fricción estática',
    'f1.S10.cinetica': 'Fricción cinética',
    'f1.S10.angulo': 'Fuerza con ángulo',
    'f1.S10.optimo': 'Fuerza mínima y ángulo óptimo'
  }, Q);
})();
