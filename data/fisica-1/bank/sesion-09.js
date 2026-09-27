/* =====================================================================
   Banco · Física 1 · S09 · Tensiones y poleas. 100 preguntas propias.
   Cuerdas y poleas ideales, g = 9.81 m/s².
   ===================================================================== */
(function () {
  var K = window.CBBankKit('f1', '09'), C = K.C;
  var g = 9.81, RAD = Math.PI / 180;
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
  function atw(v) { return (v.m2 - v.m1) * g / (v.m1 + v.m2); }
  var EX = { abs: 0.01 }, M = [0.5, 10, 0.5];
  var diff = function (v) { return v.m1 !== v.m2; };

  var Q = [
    /* ---------------- Tensión ---------------- */
    N('te-colgado', 'tension', 1, { m: [0.5, 50, 0.5] }, function (v) { return 'Una lámpara de $' + v.m + '\\ \\text{kg}$ cuelga en reposo de un cable vertical. ¿Cuánto vale la tensión?'; },
      function (v) { return v.m * g; }, 'En reposo, la tensión equilibra el peso.', { unit: 'N' }),
    N('te-sube', 'tension', 1, { m: [1, 100, 1], a: [0.5, 5, 0.5] }, function (v) { return 'Una cuerda sube una cubeta de $' + v.m + '\\ \\text{kg}$ con aceleración de $' + v.a + '\\ \\text{m/s}^2$ hacia arriba. ¿Cuánto vale la tensión?'; },
      function (v) { return v.m * (g + v.a); }, '$T - mg = ma$.', { unit: 'N', mistakes: { usedMg: function (v) { return v.m * g; } }, feedback: fb('usedMg', 'Acelerando hacia arriba, la tensión supera al peso.') }),
    N('te-baja', 'tension', 2, { m: [1, 100, 1], a: [0.5, 5, 0.5] }, function (v) { return 'Una cuerda baja una caja de $' + v.m + '\\ \\text{kg}$ que acelera hacia abajo a $' + v.a + '\\ \\text{m/s}^2$. ¿Cuánto vale la tensión?'; },
      function (v) { return v.m * (g - v.a); }, '$mg - T = ma$.', { unit: 'N', mistakes: { plusA: function (v) { return v.m * (g + v.a); } }, feedback: fb('plusA', 'Si baja acelerando, la cuerda la sostiene menos que su peso.') }),
    N('te-constante', 'tension', 1, { m: [1, 100, 1], v: [0.5, 5, 0.5] }, function (v) { return 'Una grúa sube una carga de $' + v.m + '\\ \\text{kg}$ a velocidad constante de $' + v.v + '\\ \\text{m/s}$. ¿Cuánto vale la tensión?'; },
      function (v) { return v.m * g; }, 'Velocidad constante: $a = 0$ y $T = mg$.', { unit: 'N' }),
    N('te-a', 'tension', 2, { T: [50, 2000, 50], m: [5, 150, 5] }, function (v) { return 'Una cuerda jala hacia arriba con $' + v.T + '\\ \\text{N}$ un cuerpo de $' + v.m + '\\ \\text{kg}$. ¿Cuál es su aceleración (positiva hacia arriba)?'; },
      function (v) { return v.T / v.m - g; }, '$a = T/m - g$.', { unit: 'm/s²', tol: EX, where: function (v) { return Math.abs(v.T / v.m - g) > 0.3 && Math.abs(v.T / v.m - g) < 10; } }),
    N('te-max-m', 'tension', 3, { Tmax: [500, 5000, 100], a: [0.5, 4, 0.5] }, function (v) { return 'Una cuerda resiste $' + v.Tmax + '\\ \\text{N}$. ¿Qué masa máxima puede subir con aceleración de $' + v.a + '\\ \\text{m/s}^2$?'; },
      function (v) { return v.Tmax / (g + v.a); }, '$T = m(g + a)$ despejando $m$.', { unit: 'kg', mistakes: { noA: function (v) { return v.Tmax / g; } }, feedback: fb('noA', 'Así solo la sostendría; para acelerarla hace falta más tensión.') }),
    N('te-trineo', 'tension', 2, { T: [5, 200, 5], m: [2, 60, 1] }, function (v) { return 'Una cuerda horizontal jala con $' + v.T + '\\ \\text{N}$ un trineo de $' + v.m + '\\ \\text{kg}$ sobre hielo liso. ¿Qué aceleración tiene?'; },
      function (v) { return v.T / v.m; }, 'La tensión es la única fuerza horizontal.', { unit: 'm/s²' }),
    N('te-angulo', 'tension', 2, { T: [10, 200, 10], th: [10, 60, 5], m: [2, 60, 1] }, function (v) { return 'Una cuerda a $' + v.th + '^\\circ$ sobre la horizontal jala con $' + v.T + '\\ \\text{N}$ un carrito de $' + v.m + '\\ \\text{kg}$ sobre piso liso. ¿Qué aceleración tiene?'; },
      function (v) { return v.T * Math.cos(v.th * RAD) / v.m; }, 'Solo $T\\cos\\theta$ jala hacia adelante.', { unit: 'm/s²', mistakes: { full: function (v) { return v.T / v.m; } }, feedback: fb('full', 'La cuerda está inclinada: usa $T\\cos\\theta$.') }),
    N('te-dos-verticales', 'tension', 1, { mc: [1, 60, 1] }, function (v) { return 'Un letrero de $' + v.mc + '\\ \\text{kg}$ cuelga de dos cables verticales iguales. ¿Cuánto vale la tensión en cada uno?'; },
      function (v) { return v.mc * g / 2; }, 'Los dos cables comparten el peso.', { unit: 'N' }),
    N('te-dos-angulo', 'tension', 3, { m: [1, 60, 1], th: [10, 70, 5] }, function (v) { return 'Una piñata de $' + v.m + '\\ \\text{kg}$ cuelga del centro de dos cuerdas iguales, cada una a $' + v.th + '^\\circ$ de la vertical. ¿Cuánto vale la tensión en cada cuerda?'; },
      function (v) { return v.m * g / (2 * Math.cos(v.th * RAD)); }, 'Las dos componentes verticales suman el peso: $2T\\cos\\theta = mg$.', { unit: 'N', mistakes: { noCos: function (v) { return v.m * g / 2; } }, feedback: fb('noCos', 'Solo la componente vertical $T\\cos\\theta$ sostiene el peso.') }),
    N('te-pozo', 'tension', 2, { m: [2, 20, 1], v: [1, 5, 0.5], t: [1, 4, 0.5] }, function (v) { return 'Una cubeta de $' + v.m + '\\ \\text{kg}$ sube desde el reposo hasta $' + v.v + '\\ \\text{m/s}$ en $' + v.t + '\\ \\text{s}$, con aceleración constante. ¿Cuánto vale la tensión de la cuerda?'; },
      function (v) { return v.m * (g + v.v / v.t); }, 'Primero $a = v/t$; luego $T = m(g + a)$.', { unit: 'N' }),

    /* ---------------- Máquina de Atwood ---------------- */
    N('at-a', 'atwood', 1, { m1: M, m2: M }, function (v) { return 'Una máquina de Atwood tiene masas de $' + v.m1 + '$ y $' + v.m2 + '\\ \\text{kg}$. ¿Cuánto vale la magnitud de la aceleración?'; },
      function (v) { return Math.abs(atw(v)); }, '$a = |m_2 - m_1|g/(m_1 + m_2)$.', { unit: 'm/s²', where: diff, mistakes: { oneMass: function (v) { return Math.abs(v.m2 - v.m1) * g / Math.max(v.m1, v.m2); } }, feedback: fb('oneMass', 'Divide entre la suma de las masas: se mueven juntas.') }),
    N('at-T', 'atwood', 2, { m1: M, m2: M }, function (v) { return '¿Cuánto vale la tensión en una máquina de Atwood con masas de $' + v.m1 + '$ y $' + v.m2 + '\\ \\text{kg}$?'; },
      function (v) { return 2 * v.m1 * v.m2 * g / (v.m1 + v.m2); }, '$T = 2m_1m_2g/(m_1 + m_2)$.', { unit: 'N', where: diff, mistakes: { heavy: function (v) { return Math.max(v.m1, v.m2) * g; } }, feedback: fb('heavy', 'Ese es el peso de la masa que baja; la tensión es menor.') }),
    N('at-iguales', 'atwood', 1, {}, function () { return 'En una máquina de Atwood con dos masas iguales, ¿cuánto vale la aceleración?'; },
      function () { return 0; }, 'Los pesos se equilibran.', { unit: 'm/s²', tol: EX }),
    N('at-t-h', 'atwood', 3, { m1: M, m2: M, h: [0.5, 3, 0.5] }, function (v) { return 'En una máquina de Atwood con $' + v.m1 + '$ y $' + v.m2 + '\\ \\text{kg}$, parten del reposo. ¿Cuánto tarda la masa que baja en recorrer $' + v.h + '\\ \\text{m}$?'; },
      function (v) { return Math.sqrt(2 * v.h / Math.abs(atw(v))); }, 'Con $a$ de Atwood, $h = \\tfrac{1}{2}at^2$.', { unit: 's', where: function (v) { return Math.abs(v.m1 - v.m2) >= 1; } }),
    N('at-v-h', 'atwood', 2, { m1: M, m2: M, h: [0.5, 3, 0.5] }, function (v) { return 'Una máquina de Atwood con $' + v.m1 + '$ y $' + v.m2 + '\\ \\text{kg}$ parte del reposo. ¿Qué rapidez tienen las masas cuando se han movido $' + v.h + '\\ \\text{m}$?'; },
      function (v) { return Math.sqrt(2 * Math.abs(atw(v)) * v.h); }, '$v^2 = 2ah$ con la aceleración de Atwood.', { unit: 'm/s', where: diff, mistakes: { freeFall: function (v) { return Math.sqrt(2 * g * v.h); } }, feedback: fb('freeFall', 'No cae libremente: la aceleración es menor que $g$.') }),
    N('at-m2', 'atwood', 3, { m1: [1, 10, 0.5], a: [0.5, 6, 0.5] }, function (v) { return 'En una máquina de Atwood, una masa es de $' + v.m1 + '\\ \\text{kg}$. ¿Qué masa debe tener la otra para que la más pesada baje con $a = ' + v.a + '\\ \\text{m/s}^2$?'; },
      function (v) { return v.m1 * (g + v.a) / (g - v.a); }, 'De $a = (m_2 - m_1)g/(m_1 + m_2)$ se despeja $m_2 = m_1(g + a)/(g - a)$.', { unit: 'kg' }),
    N('at-razon', 'atwood', 2, { r: [1.5, 6, 0.5] }, function (v) { return 'En una máquina de Atwood, una masa es $' + v.r + '$ veces la otra. ¿Qué fracción de $g$ es la aceleración?'; },
      function (v) { return (v.r - 1) / (v.r + 1); }, 'Con $m_2 = rm_1$: $a/g = (r - 1)/(r + 1)$.', { tol: { abs: 0.002 } }),
    N('at-techo', 'atwood', 3, { m1: M, m2: M }, function (v) { return 'Una máquina de Atwood con $' + v.m1 + '$ y $' + v.m2 + '\\ \\text{kg}$ cuelga de un gancho del techo (polea sin masa). ¿Qué fuerza soporta el gancho mientras las masas se mueven?'; },
      function (v) { return 4 * v.m1 * v.m2 * g / (v.m1 + v.m2); }, 'La polea tiene dos tramos de cuerda jalando hacia abajo: $2T$.', { unit: 'N', where: diff, mistakes: { weights: function (v) { return (v.m1 + v.m2) * g; } }, feedback: fb('weights', 'Mientras aceleran, el gancho no soporta todo el peso: soporta $2T$.') }),

    /* ---------------- Mesa con polea ---------------- */
    N('me-a', 'mesa', 1, { m1: M, m2: M }, function (v) { return 'Un bloque de $' + v.m1 + '\\ \\text{kg}$ en una mesa sin fricción está atado por una polea a una masa colgante de $' + v.m2 + '\\ \\text{kg}$. ¿Qué aceleración tienen?'; },
      function (v) { return v.m2 * g / (v.m1 + v.m2); }, 'El peso colgante acelera a las dos masas.', { unit: 'm/s²', mistakes: { onlyHang: function (v) { return g; } }, feedback: fb('onlyHang', 'No cae libremente: también arrastra al bloque de la mesa.') }),
    N('me-T', 'mesa', 2, { m1: M, m2: M }, function (v) { return 'Con un bloque de $' + v.m1 + '\\ \\text{kg}$ sobre una mesa lisa y una masa colgante de $' + v.m2 + '\\ \\text{kg}$, ¿cuánto vale la tensión?'; },
      function (v) { return v.m1 * v.m2 * g / (v.m1 + v.m2); }, '$T = m_1a$ con $a = m_2g/(m_1 + m_2)$.', { unit: 'N', mistakes: { weight: function (v) { return v.m2 * g; } }, feedback: fb('weight', 'Esa es el peso colgante; la tensión es menor porque la masa acelera.') }),
    N('me-a-mu', 'mesa', 2, { m1: M, m2: M, mu: [0.05, 0.5, 0.05] }, function (v) { return 'Un bloque de $' + v.m1 + '\\ \\text{kg}$ ($\\mu_k = ' + v.mu + '$) sobre una mesa está unido a una masa colgante de $' + v.m2 + '\\ \\text{kg}$. ¿Qué aceleración tienen?'; },
      function (v) { return (v.m2 - v.mu * v.m1) * g / (v.m1 + v.m2); }, 'Resta la fricción $\\mu_k m_1g$ al peso colgante.', { unit: 'm/s²', where: function (v) { return v.m2 - v.mu * v.m1 > 0.3; }, mistakes: { noFriction: function (v) { return v.m2 * g / (v.m1 + v.m2); } }, feedback: fb('noFriction', 'Te faltó la fricción.') }),
    N('me-T-mu', 'mesa', 3, { m1: M, m2: M, mu: [0.05, 0.5, 0.05] }, function (v) { return 'Bloque de $' + v.m1 + '\\ \\text{kg}$ con $\\mu_k = ' + v.mu + '$ en la mesa y masa colgante de $' + v.m2 + '\\ \\text{kg}$. ¿Cuánto vale la tensión?'; },
      function (v) { var a = (v.m2 - v.mu * v.m1) * g / (v.m1 + v.m2); return v.m2 * (g - a); }, 'Con la aceleración, $T = m_2(g - a)$.', { unit: 'N', where: function (v) { return v.m2 - v.mu * v.m1 > 0.3; } }),
    N('me-min', 'mesa', 2, { m1: [1, 20, 1], mus: [0.1, 0.8, 0.05] }, function (v) { return 'Un bloque de $' + v.m1 + '\\ \\text{kg}$ con $\\mu_s = ' + v.mus + '$ está en una mesa, atado a una masa que cuelga. ¿Qué masa colgante mínima lo hace arrancar?'; },
      function (v) { return v.mus * v.m1; }, 'Debe superar la fricción estática máxima: $m_2g > \\mu_s m_1g$.', { unit: 'kg' }),
    N('me-mu-const', 'mesa', 2, { m1: [2, 20, 1], m2: [0.5, 10, 0.5] }, function (v) { return 'Un bloque de $' + v.m1 + '\\ \\text{kg}$ en una mesa y una masa colgante de $' + v.m2 + '\\ \\text{kg}$ se mueven a velocidad constante. ¿Cuánto vale $\\mu_k$?'; },
      function (v) { return v.m2 / v.m1; }, 'Velocidad constante: $m_2g = \\mu_k m_1g$.', { tol: { abs: 0.002 }, where: function (v) { return v.m2 < v.m1; } }),
    N('me-t-d', 'mesa', 3, { m1: M, m2: M, d: [0.2, 2, 0.1] }, function (v) { return 'Un bloque de $' + v.m1 + '\\ \\text{kg}$ en una mesa lisa, unido a una masa colgante de $' + v.m2 + '\\ \\text{kg}$, parte del reposo. ¿Cuánto tarda en recorrer $' + v.d + '\\ \\text{m}$?'; },
      function (v) { return Math.sqrt(2 * v.d * (v.m1 + v.m2) / (v.m2 * g)); }, '$a = m_2g/(m_1 + m_2)$ y $d = \\tfrac{1}{2}at^2$.', { unit: 's' }),
    N('me-f', 'mesa', 1, { m1: M, mu: [0.05, 0.6, 0.05] }, function (v) { return 'Un bloque de $' + v.m1 + '\\ \\text{kg}$ desliza sobre una mesa horizontal con $\\mu_k = ' + v.mu + '$, jalado por una cuerda horizontal. ¿Cuánto vale la fricción?'; },
      function (v) { return v.mu * v.m1 * g; }, '$f_k = \\mu_k N = \\mu_k m_1g$.', { unit: 'N' }),

    /* ---------------- Cuerpos en fila ---------------- */
    N('fi-a', 'fila', 1, { F: [10, 200, 10], m1: M, m2: M }, function (v) { return 'Una fuerza de $' + v.F + '\\ \\text{N}$ jala dos bloques de $' + v.m1 + '$ y $' + v.m2 + '\\ \\text{kg}$ unidos por una cuerda, sobre piso liso. ¿Qué aceleración tienen?'; },
      function (v) { return v.F / (v.m1 + v.m2); }, 'Todo el sistema acelera junto.', { unit: 'm/s²' }),
    N('fi-T', 'fila', 2, { F: [10, 200, 10], m1: M, m2: M }, function (v) { return 'Jalas con $' + v.F + '\\ \\text{N}$ un bloque de $' + v.m1 + '\\ \\text{kg}$ que arrastra, con una cuerda, a otro de $' + v.m2 + '\\ \\text{kg}$ (piso liso). ¿Cuánto vale la tensión de esa cuerda?'; },
      function (v) { return v.m2 * v.F / (v.m1 + v.m2); }, 'La cuerda solo acelera al bloque de atrás: $T = m_2a$.', { unit: 'N', mistakes: { gaveF: function (v) { return v.F; } }, feedback: fb('gaveF', 'La cuerda no transmite toda tu fuerza: solo acelera al de atrás.') }),
    N('fi-T12', 'fila', 2, { F: [10, 200, 10], m1: [1, 6, 1], m2: [1, 6, 1], m3: [1, 6, 1] }, function (v) { return 'Tres carritos de $' + v.m1 + '$ (adelante), $' + v.m2 + '$ y $' + v.m3 + '\\ \\text{kg}$ unidos por cuerdas son jalados con $' + v.F + '\\ \\text{N}$. ¿Tensión entre el primero y el segundo?'; },
      function (v) { return (v.m2 + v.m3) * v.F / (v.m1 + v.m2 + v.m3); }, 'Esa cuerda jala a los dos de atrás.', { unit: 'N' }),
    N('fi-T23', 'fila', 2, { F: [10, 200, 10], m1: [1, 6, 1], m2: [1, 6, 1], m3: [1, 6, 1] }, function (v) { return 'Tres carritos de $' + v.m1 + '$ (adelante), $' + v.m2 + '$ y $' + v.m3 + '\\ \\text{kg}$ son jalados con $' + v.F + '\\ \\text{N}$. ¿Tensión entre el segundo y el tercero?'; },
      function (v) { return v.m3 * v.F / (v.m1 + v.m2 + v.m3); }, 'Esa cuerda solo jala al último.', { unit: 'N' }),
    N('fi-contacto', 'fila', 2, { P: [10, 200, 10], ma: M, mb: M }, function (v) { return 'Empujas con $' + v.P + '\\ \\text{N}$ una caja de $' + v.ma + '\\ \\text{kg}$ que empuja a otra de $' + v.mb + '\\ \\text{kg}$ (piso liso). ¿Con qué fuerza se empujan entre sí?'; },
      function (v) { return v.mb * v.P / (v.ma + v.mb); }, 'La caja de adelante solo recibe la fuerza de contacto: $m_ba$.', { unit: 'N', mistakes: { gaveP: function (v) { return v.P; } }, feedback: fb('gaveP', 'Tu fuerza acelera a las dos cajas.') }),
    N('fi-friccion-T', 'fila', 3, { F: [20, 200, 10], m1: M, m2: M, mu: [0.05, 0.3, 0.05] }, function (v) { return 'Jalas con $' + v.F + '\\ \\text{N}$ dos bloques en fila ($' + v.m1 + '$ kg adelante y $' + v.m2 + '$ kg atrás) sobre un piso con $\\mu_k = ' + v.mu + '$ para los dos. ¿Cuánto vale la tensión de la cuerda que los une?'; },
      function (v) { return v.m2 * v.F / (v.m1 + v.m2); }, 'Con la misma $\\mu_k$ para los dos, la fricción se cancela en la cuenta: $T = m_2F/(m_1 + m_2)$.', { unit: 'N', where: function (v) { return v.F > v.mu * (v.m1 + v.m2) * g + 2; } }),
    N('fi-friccion-a', 'fila', 2, { F: [20, 200, 10], m1: M, m2: M, mu: [0.05, 0.3, 0.05] }, function (v) { return 'Dos bloques en fila de $' + v.m1 + '$ y $' + v.m2 + '\\ \\text{kg}$ son jalados con $' + v.F + '\\ \\text{N}$ sobre un piso con $\\mu_k = ' + v.mu + '$. ¿Qué aceleración tienen?'; },
      function (v) { return v.F / (v.m1 + v.m2) - v.mu * g; }, '$a = [F - \\mu_k(m_1 + m_2)g]/(m_1 + m_2)$.', { unit: 'm/s²', where: function (v) { return v.F / (v.m1 + v.m2) - v.mu * g > 0.3; }, mistakes: { noFriction: function (v) { return v.F / (v.m1 + v.m2); } }, feedback: fb('noFriction', 'Te faltó la fricción de los dos bloques.') }),
    N('fi-vagones', 'fila', 3, { F: [1000, 20000, 1000], Nc: [3, 10, 1], k: [1, 9, 1] }, function (v) { return 'Una locomotora jala con $' + v.F + '\\ \\text{N}$ un tren de $' + v.Nc + '$ vagones iguales (sin fricción). ¿Cuánto vale la tensión en el enganche que está detrás del vagón número ' + v.k + '?'; },
      function (v) { return v.F * (v.Nc - v.k) / v.Nc; }, 'Ese enganche jala a los $N - k$ vagones de atrás.', { unit: 'N', where: function (v) { return v.k < v.Nc; } }),

    /* ---------------- Poleas y cuerdas en serie ---------------- */
    N('po-movil', 'poleas', 2, { mp: [1, 100, 1] }, function (v) { return 'Una carga de $' + v.mp + '\\ \\text{kg}$ cuelga de una polea móvil sostenida por los dos tramos de una misma cuerda. ¿Con qué fuerza hay que jalar el extremo libre para sostenerla?'; },
      function (v) { return v.mp * g / 2; }, 'Dos tramos de cuerda sostienen la polea: cada uno lleva $mg/2$.', { unit: 'N', mistakes: { full: function (v) { return v.mp * g; } }, feedback: fb('full', 'La polea móvil reparte el peso entre dos tramos de cuerda.') }),
    N('po-fija', 'poleas', 1, { mf: [1, 100, 1] }, function (v) { return 'Con una polea fija sostienes en reposo una carga de $' + v.mf + '\\ \\text{kg}$. ¿Con qué fuerza jalas la cuerda?'; },
      function (v) { return v.mf * g; }, 'La polea fija solo cambia la dirección de la cuerda.', { unit: 'N' }),
    N('po-arriba', 'poleas', 1, { m1: M, m2: M }, function (v) { return 'Una caja de $' + v.m2 + '\\ \\text{kg}$ cuelga del techo por una cuerda, y de ella cuelga otra de $' + v.m1 + '\\ \\text{kg}$ con una segunda cuerda. ¿Tensión en la cuerda de arriba?'; },
      function (v) { return (v.m1 + v.m2) * g; }, 'La cuerda de arriba sostiene las dos cajas.', { unit: 'N', mistakes: { onlyTop: function (v) { return v.m2 * g; } }, feedback: fb('onlyTop', 'También sostiene a la caja de abajo.') }),
    N('po-abajo', 'poleas', 1, { m1: M, m2: M }, function (v) { return 'Dos cajas cuelgan en serie del techo: $' + v.m2 + '\\ \\text{kg}$ arriba y $' + v.m1 + '\\ \\text{kg}$ abajo. ¿Tensión en la cuerda de abajo?'; },
      function (v) { return v.m1 * g; }, 'La cuerda de abajo solo sostiene la caja de abajo.', { unit: 'N', where: diff }),
    N('po-arriba-a', 'poleas', 2, { m1: M, m2: M, a: [0.5, 4, 0.5] }, function (v) { return 'Dos cajas en serie ($' + v.m2 + '$ kg arriba, $' + v.m1 + '$ kg abajo) suben con aceleración de $' + v.a + '\\ \\text{m/s}^2$, jaladas por la cuerda de arriba. ¿Cuánto vale su tensión?'; },
      function (v) { return (v.m1 + v.m2) * (g + v.a); }, 'Todo el conjunto: $T - Mg = Ma$.', { unit: 'N' }),
    N('po-abajo-a', 'poleas', 2, { m1: M, m2: M, a: [0.5, 4, 0.5] }, function (v) { return 'Dos cajas en serie ($' + v.m2 + '$ kg arriba, $' + v.m1 + '$ kg abajo) suben acelerando a $' + v.a + '\\ \\text{m/s}^2$. ¿Tensión en la cuerda que une las dos cajas?'; },
      function (v) { return v.m1 * (g + v.a); }, 'Solo acelera a la caja de abajo: $T = m_1(g + a)$.', { unit: 'N', where: diff }),

    /* ---------------- Más práctica ---------------- */
    N('te-frena-bajando', 'tension', 2, { mb: [1, 100, 1], ab: [0.5, 5, 0.5] }, function (v) { return 'Bajas con una cuerda una caja de $' + v.mb + '\\ \\text{kg}$ y la frenas: su aceleración es de $' + v.ab + '\\ \\text{m/s}^2$ hacia arriba mientras baja. ¿Cuánto vale la tensión?'; },
      function (v) { return v.mb * (g + v.ab); }, 'Frenar al bajar es acelerar hacia arriba: $T = m(g + a)$.', { unit: 'N', mistakes: { minusA: function (v) { return v.mb * (g - v.ab); } }, feedback: fb('minusA', 'Aunque baja, la aceleración apunta hacia arriba: la tensión supera al peso.') }),
    N('te-horizontal-ang', 'tension', 2, { mh: [1, 60, 1], al: [10, 60, 5] }, function (v) { return 'Una lámpara de $' + v.mh + '\\ \\text{kg}$ cuelga del centro de un cable; cada mitad forma $' + v.al + '^\\circ$ con la horizontal. ¿Cuánto vale la tensión en cada mitad?'; },
      function (v) { return v.mh * g / (2 * Math.sin(v.al * RAD)); }, 'Con el ángulo desde la horizontal, la componente vertical es $T\\sin\\alpha$: $2T\\sin\\alpha = mg$.', { unit: 'N', mistakes: { usedCos: function (v) { return v.mh * g / (2 * Math.cos(v.al * RAD)); } }, feedback: fb('usedCos', 'El ángulo se mide desde la horizontal: la componente vertical lleva seno.') }),
    N('at-neta-m1', 'atwood', 2, { m1: M, m2: M }, function (v) { return 'En una máquina de Atwood con $' + v.m1 + '$ y $' + v.m2 + '\\ \\text{kg}$, ¿cuánto vale la fuerza neta sobre la masa de $' + v.m1 + '\\ \\text{kg}$ (en magnitud)?'; },
      function (v) { return v.m1 * Math.abs(atw(v)); }, 'La fuerza neta sobre cada masa es su masa por $a$.', { unit: 'N', where: diff }),
    N('at-x-t', 'atwood', 2, { m1: M, m2: M, t: [0.5, 3, 0.5] }, function (v) { return 'Una máquina de Atwood con $' + v.m1 + '$ y $' + v.m2 + '\\ \\text{kg}$ parte del reposo. ¿Cuánto se ha movido cada masa a los $' + v.t + '\\ \\text{s}$?'; },
      function (v) { return Math.abs(atw(v)) * v.t * v.t / 2; }, '$x = \\tfrac{1}{2}at^2$ con la aceleración de Atwood.', { unit: 'm', where: diff }),
    N('at-v-t', 'atwood', 2, { m1: M, m2: M, t: [0.5, 3, 0.5] }, function (v) { return 'Una máquina de Atwood con $' + v.m1 + '$ y $' + v.m2 + '\\ \\text{kg}$ parte del reposo. ¿Qué rapidez tienen a los $' + v.t + '\\ \\text{s}$?'; },
      function (v) { return Math.abs(atw(v)) * v.t; }, '$v = at$.', { unit: 'm/s', where: diff }),
    N('me-v-d', 'mesa', 2, { m1: M, m2: M, d: [0.2, 2, 0.1] }, function (v) { return 'Un bloque de $' + v.m1 + '\\ \\text{kg}$ en una mesa lisa, unido a una masa colgante de $' + v.m2 + '\\ \\text{kg}$, parte del reposo. ¿Qué rapidez tiene tras recorrer $' + v.d + '\\ \\text{m}$?'; },
      function (v) { return Math.sqrt(2 * v.m2 * g / (v.m1 + v.m2) * v.d); }, '$v^2 = 2ad$ con $a = m_2g/(m_1 + m_2)$.', { unit: 'm/s' }),
    N('me-fraccion', 'mesa', 2, { m1: M, m2: M }, function (v) { return 'Con un bloque de $' + v.m1 + '\\ \\text{kg}$ en una mesa lisa y una masa colgante de $' + v.m2 + '\\ \\text{kg}$, ¿qué fracción del peso colgante es la tensión?'; },
      function (v) { return v.m1 / (v.m1 + v.m2); }, '$T/(m_2g) = m_1/(m_1 + m_2)$.', { tol: { abs: 0.002 } }),
    N('fi-contacto-tres', 'fila', 2, { P: [10, 200, 10], ma: [1, 6, 1], mb: [1, 6, 1], mc: [1, 6, 1] }, function (v) { return 'Empujas por detrás con $' + v.P + '\\ \\text{N}$ tres cajas juntas de $' + v.ma + '$, $' + v.mb + '$ y $' + v.mc + '\\ \\text{kg}$ (la de $' + v.ma + '$ kg es la que tocas). ¿Con qué fuerza empuja la primera a la segunda?'; },
      function (v) { return (v.mb + v.mc) * v.P / (v.ma + v.mb + v.mc); }, 'Esa fuerza acelera a las dos cajas de adelante.', { unit: 'N' }),
    N('fi-t-d', 'fila', 2, { F: [10, 200, 10], m1: M, m2: M, d: [1, 10, 1] }, function (v) { return 'Dos bloques en fila de $' + v.m1 + '$ y $' + v.m2 + '\\ \\text{kg}$ son jalados con $' + v.F + '\\ \\text{N}$ desde el reposo (piso liso). ¿Cuánto tardan en recorrer $' + v.d + '\\ \\text{m}$?'; },
      function (v) { return Math.sqrt(2 * v.d * (v.m1 + v.m2) / v.F); }, '$a = F/(m_1 + m_2)$ y $d = \\tfrac{1}{2}at^2$.', { unit: 's' }),
    N('po-movil-a', 'poleas', 2, { mp: [1, 100, 1], a: [0.2, 3, 0.2] }, function (v) { return 'Una carga de $' + v.mp + '\\ \\text{kg}$ cuelga de una polea móvil (dos tramos de cuerda) y sube con $a = ' + v.a + '\\ \\text{m/s}^2$. ¿Cuánto vale la tensión de la cuerda?'; },
      function (v) { return v.mp * (g + v.a) / 2; }, '$2T - mg = ma$.', { unit: 'N' }),
    N('po-cuatro', 'poleas', 2, { mq: [10, 400, 10] }, function (v) { return 'Un polipasto sostiene una carga de $' + v.mq + '\\ \\text{kg}$ con cuatro tramos de la misma cuerda. ¿Con qué fuerza hay que jalar para sostenerla?'; },
      function (v) { return v.mq * g / 4; }, 'Cuatro tramos comparten el peso.', { unit: 'N' }),
    N('po-medio', 'poleas', 2, { m1: [1, 6, 1], m2: [1, 6, 1], m3: [1, 6, 1] }, function (v) { return 'Tres cajas cuelgan en serie del techo: $' + v.m1 + '$ kg arriba, $' + v.m2 + '$ kg en medio y $' + v.m3 + '$ kg abajo. ¿Tensión en la cuerda entre la de arriba y la de en medio?'; },
      function (v) { return (v.m2 + v.m3) * g; }, 'Esa cuerda sostiene las dos cajas de abajo.', { unit: 'N' }),

    /* ---------------- Conceptuales ---------------- */
    C('k-solo-jala', 'tension', 1, 'Una cuerda puede…', 'solo jalar', [['jalar y empujar'], ['solo empujar'], ['ejercer fuerzas perpendiculares a ella']], 'Una cuerda floja no hace fuerza; tensa, jala.'),
    C('k-ideal', 'tension', 1, 'En una cuerda ideal (sin masa, no se estira), la tensión…', 'es la misma en toda la cuerda', [['es mayor cerca del techo'], ['es cero'], ['depende de la longitud']], 'Por eso se escribe una sola $T$.'),
    C('k-polea-ideal', 'tension', 1, 'Una polea ideal (sin masa ni fricción)…', 'solo cambia la dirección de la cuerda', [['duplica la tensión'], ['reduce la tensión a la mitad'], ['frena la cuerda']], 'La tensión es igual a los dos lados.'),
    C('k-no-peso', 'tension', 2, '¿La tensión de una cuerda que sostiene un cuerpo siempre es igual a su peso?', 'No: solo si el cuerpo no acelera', [['Sí, siempre'], ['Solo si la cuerda es larga'], ['Solo si el cuerpo baja']], 'Si acelera, $T = m(g + a)$.'),
    C('k-sube-acel', 'tension', 1, 'Si una cuerda sube un cuerpo acelerando, la tensión es…', 'mayor que el peso', [['menor que el peso'], ['igual al peso'], ['cero']], 'La fuerza neta debe apuntar hacia arriba.'),
    C('k-v-const', 'tension', 2, 'Si una cuerda sube un cuerpo a velocidad constante, la tensión es…', 'igual al peso', [['mayor que el peso'], ['menor que el peso'], ['cero']], 'Sin aceleración, las fuerzas se equilibran.'),
    C('k-caida', 'tension', 2, 'Si un cuerpo atado a una cuerda cae libremente junto con todo, la tensión es…', 'cero', [['igual a su peso'], ['el doble de su peso'], ['negativa']], 'La cuerda no tiene que sostener nada.'),
    C('k-angulo-mas', 'tension', 3, 'Una piñata cuelga de dos cuerdas. Si las cuerdas se ponen más horizontales, la tensión…', 'aumenta', [['disminuye'], ['no cambia'], ['se vuelve cero']], 'Queda menos componente vertical por newton de tensión: $T = mg/(2\\cos\\theta)$.'),
    C('k-horizontal', 'tension', 3, '¿Puede una cuerda perfectamente horizontal sostener algo que cuelga de su centro?', 'No: la tensión tendría que ser infinita', [['Sí, con tensión igual al peso'], ['Sí, con la mitad del peso'], ['Sí, si la cuerda es fuerte']], 'Sin componente vertical no hay fuerza hacia arriba.'),
    C('k-t-unidades', 'tension', 1, 'La tensión se mide en…', 'newtons', [['kilogramos'], ['metros'], ['joules']], 'Es una fuerza.'),
    C('k-at-iguales', 'atwood', 1, 'En una máquina de Atwood con masas iguales, las masas…', 'no aceleran', [['caen con $g$'], ['aceleran a $g/2$'], ['suben las dos']], 'Los pesos se equilibran.'),
    C('k-at-baja', 'atwood', 1, 'En una máquina de Atwood, ¿qué masa baja?', 'La más pesada', [['La más ligera'], ['Las dos'], ['Ninguna']], 'Su peso le gana a la tensión.'),
    C('k-at-menor-g', 'atwood', 2, 'La aceleración de una máquina de Atwood es…', 'siempre menor que $g$', [['siempre igual a $g$'], ['mayor que $g$ si una masa es muy pesada'], ['cero siempre']], 'Una masa frena a la otra.'),
    C('k-at-t', 'atwood', 2, 'En una máquina de Atwood, la tensión queda…', 'entre los pesos de las dos masas', [['mayor que los dos pesos'], ['menor que los dos pesos'], ['igual a la suma de los pesos']], 'Mayor que el peso de la que sube y menor que el de la que baja.'),
    C('k-at-limite', 'atwood', 3, 'Si una masa es muchísimo mayor que la otra, la aceleración tiende a…', '$g$', [['cero'], ['$g/2$'], ['infinito']], 'La masa pesada casi cae libre.'),
    C('k-at-misma', 'atwood', 1, 'Las dos masas de una máquina de Atwood tienen…', 'la misma aceleración en magnitud', [['aceleraciones distintas'], ['la misma velocidad pero distinta aceleración'], ['aceleración cero siempre']], 'Están unidas por la misma cuerda.'),
    C('k-at-sumar', 'atwood', 2, 'Para resolver Atwood conviene sumar las dos ecuaciones porque…', 'la tensión se cancela', [['la gravedad se cancela'], ['las masas se cancelan'], ['así sale la velocidad']], 'La $T$ aparece con signos opuestos.'),
    C('k-at-signo', 'atwood', 2, 'Para cada masa de Atwood, conviene tomar como positivo…', 'el sentido en que se mueve esa masa', [['siempre hacia arriba'], ['siempre hacia abajo'], ['el sentido de la tensión']], 'Así las dos tienen $+a$.'),
    C('k-at-medir-g', 'atwood', 3, 'Atwood usó su máquina para estudiar la caída porque…', 'con masas parecidas la aceleración es pequeña y fácil de medir', [['las masas caen más rápido'], ['elimina la gravedad'], ['duplica la aceleración']], '$a = g(m_2 - m_1)/(m_1 + m_2)$ puede ser mucho menor que $g$.'),
    C('k-at-doble', 'atwood', 2, 'Si duplicas las dos masas de una máquina de Atwood, la aceleración…', 'no cambia', [['se duplica'], ['se reduce a la mitad'], ['se cuadruplica']], 'Depende de la razón entre las masas.'),
    C('k-at-cero', 'atwood', 3, 'Si una de las masas de la máquina de Atwood fuera cero, la otra…', 'caería libremente y la tensión sería cero', [['quedaría en reposo'], ['caería con $g/2$'], ['subiría']], 'Con $m_1 = 0$: $a = g$ y $T = 0$.'),
    C('k-me-sin', 'mesa', 1, 'En la mesa sin fricción con una masa colgante, el sistema…', 'siempre acelera', [['solo acelera si la masa colgante es mayor'], ['nunca acelera'], ['acelera con $g$']], 'Nada se opone al peso colgante.'),
    C('k-me-N', 'mesa', 1, 'La fricción sobre el bloque de la mesa es $\\mu_k$ por…', 'el peso del bloque de la mesa, $m_1g$', [['el peso de la masa colgante'], ['la tensión'], ['la suma de los pesos']], 'La normal sobre el bloque es $m_1g$ (mesa horizontal).'),
    C('k-me-T', 'mesa', 2, 'La tensión en el sistema de mesa y polea, comparada con el peso colgante, es…', 'menor', [['mayor'], ['igual'], ['el doble']], 'La masa colgante acelera hacia abajo.'),
    C('k-me-limite', 'mesa', 3, 'Si el bloque de la mesa tuviera masa casi cero (sin fricción), la masa colgante…', 'caería casi libremente', [['quedaría en reposo'], ['caería con $g/2$'], ['subiría']], '$a = m_2g/(m_1 + m_2) \\to g$.'),
    C('k-me-mu', 'mesa', 1, 'Si aumenta la fricción entre el bloque y la mesa, la aceleración…', 'disminuye', [['aumenta'], ['no cambia'], ['se vuelve $g$']], 'La fricción resta al peso colgante.'),
    C('k-me-const', 'mesa', 2, 'El sistema de mesa y polea va a velocidad constante cuando…', 'el peso colgante iguala a la fricción', [['no hay fricción'], ['la tensión es cero'], ['las masas son iguales']], 'Fuerza neta cero.'),
    C('k-me-reposo', 'mesa', 3, 'Si el bloque de la mesa no se mueve, la fricción estática vale…', 'el peso de la masa colgante', [['$\\mu_s m_1g$'], ['cero'], ['el peso del bloque']], 'Solo lo necesario para equilibrar: $f_s = m_2g$.'),
    C('k-me-misma-T', 'mesa', 1, 'La tensión en el tramo horizontal y en el vertical de la cuerda es…', 'la misma', [['mayor en el vertical'], ['mayor en el horizontal'], ['cero en el horizontal']], 'Cuerda y polea ideales.'),
    C('k-me-ecuaciones', 'mesa', 2, 'Con dos cuerpos unidos por una cuerda hay dos incógnitas, $a$ y $T$, y…', 'una ecuación por cada cuerpo', [['una sola ecuación'], ['cuatro ecuaciones'], ['no hace falta ecuación para la tensión']], 'ΣF = ma para cada uno.'),
    C('k-fi-misma-a', 'fila', 1, 'Varios bloques unidos por cuerdas tensas y jalados juntos tienen…', 'la misma aceleración', [['aceleraciones distintas'], ['aceleración mayor el de adelante'], ['aceleración cero']], 'Las cuerdas no se estiran.'),
    C('k-fi-mayor', 'fila', 2, 'En un tren de bloques jalado desde adelante, la tensión mayor está en…', 'la cuerda de adelante', [['la cuerda de atrás'], ['todas iguales'], ['la cuerda del medio']], 'Jala a más masa.'),
    C('k-fi-depende', 'fila', 2, 'La tensión en una cuerda de un tren de bloques depende de…', 'la masa que va detrás de esa cuerda', [['la masa que va delante'], ['la longitud de la cuerda'], ['la velocidad']], '$T = m_{atrás}\\,a$.'),
    C('k-fi-menor-F', 'fila', 1, 'La tensión de la primera cuerda de un tren jalado con $F$ es…', 'menor que $F$', [['mayor que $F$'], ['igual a $F$'], ['cero']], 'Parte de $F$ acelera al primer bloque.'),
    C('k-fi-agregar', 'fila', 2, 'Si agregas otro vagón al final de un tren jalado con la misma fuerza, la aceleración…', 'disminuye', [['aumenta'], ['no cambia'], ['se vuelve cero']], 'Más masa, misma fuerza.'),
    C('k-fi-sistema', 'fila', 1, 'Para hallar la aceleración de un tren de bloques conviene…', 'tomar todo el tren como un solo cuerpo', [['analizar solo el último bloque'], ['ignorar las masas'], ['sumar las tensiones']], 'Las tensiones internas se cancelan.'),
    C('k-fi-contacto', 'fila', 2, 'Al empujar dos cajas juntas, la caja de adelante recibe…', 'solo la fuerza de contacto de la caja de atrás', [['tu fuerza completa'], ['la mitad de tu fuerza siempre'], ['ninguna fuerza']], 'Tú no la tocas.'),
    C('k-fi-mu', 'fila', 3, 'Dos bloques con la misma $\\mu_k$ son jalados en fila. La tensión entre ellos…', 'no depende de $\\mu_k$', [['aumenta con $\\mu_k$'], ['disminuye con $\\mu_k$'], ['es cero']], 'La fricción de cada bloque es proporcional a su masa y se reparte igual que la fuerza.'),
    C('k-fi-empujar-jalar', 'fila', 3, 'Empujas dos cajas por detrás o las jalas por delante con la misma fuerza. La fuerza entre ellas…', 'depende de cuál caja queda atrás del contacto', [['es igual en los dos casos'], ['es siempre tu fuerza'], ['es cero']], 'Siempre es la masa que queda "del otro lado" por $a$.'),
    C('k-fi-internas', 'fila', 2, 'Las tensiones entre los vagones de un tren, al analizar todo el tren como un cuerpo…', 'se cancelan por pares', [['se suman'], ['se duplican'], ['son iguales a $F$']], 'Son fuerzas internas.'),
    C('k-po-movil', 'poleas', 2, 'Una polea móvil sostenida por dos tramos de cuerda…', 'reduce a la mitad la fuerza para sostener una carga', [['duplica la fuerza necesaria'], ['no cambia la fuerza'], ['elimina la fuerza']], 'Dos tramos comparten el peso.'),
    C('k-po-fija', 'poleas', 1, 'Una polea fija…', 'cambia la dirección de la fuerza pero no su magnitud', [['reduce la fuerza a la mitad'], ['duplica la fuerza'], ['elimina la fricción']], 'Por eso es cómodo jalar hacia abajo.'),
    C('k-po-distancia', 'poleas', 3, 'Con una polea móvil, para subir la carga 1 m hay que jalar la cuerda…', '2 m', [['1 m'], ['0.5 m'], ['4 m']], 'Ahorras fuerza pero jalas más cuerda.'),
    C('k-po-techo', 'poleas', 3, 'Una polea fija con dos tramos de cuerda tensos hacia abajo, cada uno con tensión $T$, jala su soporte con…', '$2T$', [['$T$'], ['$T/2$'], ['cero']], 'Dos tramos jalan hacia abajo.'),
    C('k-po-serie', 'poleas', 1, 'Varias cajas cuelgan en serie del techo. La cuerda que más tensión soporta es…', 'la de arriba', [['la de abajo'], ['todas igual'], ['la del medio']], 'Sostiene todo lo que cuelga debajo.'),
    C('k-po-ideal-masa', 'poleas', 2, 'En los problemas se suele suponer la polea sin masa porque…', 'así la tensión es igual a los dos lados', [['así no hay gravedad'], ['así la cuerda no se mueve'], ['así desaparece la fricción de la mesa']], 'Una polea con masa necesitaría torque (S15).'),
    C('k-po-cambio', 'poleas', 1, 'Una cuerda que pasa por una polea y baja verticalmente, del otro lado…', 'puede jalar horizontalmente con la misma tensión', [['pierde la mitad de su tensión'], ['gana tensión'], ['deja de jalar']], 'La polea cambia la dirección.')
  ];

  K.register({
    'f1.S09.tension': 'Tensión en una cuerda',
    'f1.S09.atwood': 'Máquina de Atwood',
    'f1.S09.mesa': 'Mesa con polea',
    'f1.S09.fila': 'Cuerpos en fila',
    'f1.S09.poleas': 'Poleas y cuerdas en serie'
  }, Q);
})();
