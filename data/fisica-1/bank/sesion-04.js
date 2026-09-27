/* =====================================================================
   Banco · Física 1 · S04 · Posición, velocidad y aceleración como derivadas
   · MRU. 100 preguntas propias. Metros y segundos salvo que se diga otra cosa.
   ===================================================================== */
(function () {
  var K = window.CBBankKit('f1', '04'), C = K.C;
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
  // Polinomio en t para mostrar: [[coef, potencia], …]
  function P(terms) {
    var out = '';
    terms.forEach(function (tm) {
      var c = tm[0], p = tm[1];
      if (c === 0) return;
      var abs = Math.abs(c), sign = c < 0 ? (out ? ' - ' : '-') : (out ? ' + ' : '');
      out += sign + (abs === 1 && p > 0 ? '' : String(abs)) + (p === 0 ? '' : p === 1 ? 't' : 't^' + p);
    });
    return out || '0';
  }
  var EX = { abs: 0.01 };

  var Q = [
    /* ---------------- Desplazamiento, distancia y velocidad media ---------------- */
    N('de-dx', 'desplazamiento', 1, { x1: [-20, 20, 1], x2: [-20, 20, 1] }, function (v) { return 'Un carrito pasa de $x = ' + v.x1 + '\\ \\text{m}$ a $x = ' + v.x2 + '\\ \\text{m}$. ¿Cuánto vale su desplazamiento? (Con signo.)'; },
      function (v) { return v.x2 - v.x1; }, '$\\Delta x = x_f - x_i$; negativo si termina a la izquierda.', { unit: 'm', tol: EX, where: function (v) { return v.x1 !== v.x2 && v.x1 !== 0; }, mistakes: { reversed: function (v) { return v.x1 - v.x2; } }, feedback: fb('reversed', 'Es final menos inicial: $x_f - x_i$.') }),
    N('de-ida-vuelta', 'desplazamiento', 1, { a: [5, 40, 1], b: [1, 30, 1] }, function (v) { return 'Un robot sale de $x = 0$, avanza hasta $x = ' + v.a + '\\ \\text{m}$ y regresa hasta $x = ' + v.b + '\\ \\text{m}$. ¿Qué distancia recorrió?'; },
      function (v) { return v.a + (v.a - v.b); }, 'Suma lo que avanzó y lo que regresó.', { unit: 'm', where: function (v) { return v.b < v.a; }, mistakes: { displacement: function (v) { return v.b; } }, feedback: fb('displacement', 'Ese es el desplazamiento; la distancia cuenta también el regreso.') }),
    N('de-vmedia', 'desplazamiento', 2, { x1: [-20, 20, 1], x2: [-20, 20, 1], t: [2, 10, 1] }, function (v) { return 'Una partícula pasa de $x = ' + v.x1 + '\\ \\text{m}$ a $x = ' + v.x2 + '\\ \\text{m}$ en $' + v.t + '\\ \\text{s}$. ¿Cuál es su velocidad media?'; },
      function (v) { return (v.x2 - v.x1) / v.t; }, '$\\bar{v} = \\Delta x/\\Delta t$, con signo.', { unit: 'm/s', tol: EX, where: function (v) { return v.x1 !== v.x2; } }),
    N('de-rapidez-media', 'desplazamiento', 2, { a: [5, 40, 1], b: [1, 30, 1], t: [2, 20, 1] }, function (v) { return 'Un perro corre de $x = 0$ a $x = ' + v.a + '\\ \\text{m}$ y regresa a $x = ' + v.b + '\\ \\text{m}$, todo en $' + v.t + '\\ \\text{s}$. ¿Cuál fue su rapidez media?'; },
      function (v) { return (2 * v.a - v.b) / v.t; }, 'Rapidez media = distancia / tiempo.', { unit: 'm/s', where: function (v) { return v.b < v.a; }, mistakes: { velocity: function (v) { return v.b / v.t; } }, feedback: fb('velocity', 'Esa es la velocidad media (desplazamiento entre tiempo). La rapidez media usa la distancia.') }),
    N('de-pista', 'desplazamiento', 2, { L: [200, 800, 100], t: [30, 200, 10] }, function (v) { return 'Das una vuelta completa a una pista de $' + v.L + '\\ \\text{m}$ en $' + v.t + '\\ \\text{s}$. ¿Cuál fue tu rapidez media?'; },
      function (v) { return v.L / v.t; }, 'Distancia entre tiempo; la velocidad media sería cero.', { unit: 'm/s' }),
    N('de-tramos-d', 'desplazamiento', 3, { d1: [100, 900, 100], v1: [2, 20, 1], d2: [100, 900, 100], v2: [2, 20, 1] }, function (v) { return 'Un ciclista recorre $' + v.d1 + '\\ \\text{m}$ a $' + v.v1 + '\\ \\text{m/s}$ y luego $' + v.d2 + '\\ \\text{m}$ a $' + v.v2 + '\\ \\text{m/s}$, en la misma dirección. ¿Cuál es su rapidez media total?'; },
      function (v) { return (v.d1 + v.d2) / (v.d1 / v.v1 + v.d2 / v.v2); }, 'Distancia total entre tiempo total; no es el promedio de las rapideces.', { unit: 'm/s', where: function (v) { return v.v1 !== v.v2; }, mistakes: { mean: function (v) { return (v.v1 + v.v2) / 2; } }, feedback: fb('mean', 'Promediaste las rapideces. Pasa más tiempo en el tramo lento: calcula los tiempos.') }),
    N('de-tramos-t', 'desplazamiento', 3, { t1: [2, 20, 1], v1: [2, 20, 1], t2: [2, 20, 1], v2: [2, 20, 1] }, function (v) { return 'Un tren va $' + v.t1 + '\\ \\text{min}$ a $' + v.v1 + '\\ \\text{m/s}$ y luego $' + v.t2 + '\\ \\text{min}$ a $' + v.v2 + '\\ \\text{m/s}$. ¿Cuál es su rapidez media?'; },
      function (v) { return (v.v1 * v.t1 + v.v2 * v.t2) / (v.t1 + v.t2); }, 'Promedio pesado por el tiempo en cada tramo.', { unit: 'm/s', where: function (v) { return v.t1 !== v.t2 && v.v1 !== v.v2; }, mistakes: { mean: function (v) { return (v.v1 + v.v2) / 2; } }, feedback: fb('mean', 'El promedio simple solo vale si los tiempos son iguales.') }),
    N('de-vmedia-xt', 'desplazamiento', 2, { a: [0.5, 4, 0.5], b: [0, 10, 1], t1: [0, 3, 1], dt: [1, 4, 1] }, function (v) { return 'Si $x(t) = ' + P([[v.a, 2], [v.b, 0]]) + '$, ¿cuál es la velocidad media entre $t = ' + v.t1 + '$ y $t = ' + (v.t1 + v.dt) + '\\ \\text{s}$?'; },
      function (v) { return v.a * (2 * v.t1 + v.dt); }, 'Evalúa $x$ en los dos instantes: $\\bar{v} = \\frac{x(t_2) - x(t_1)}{t_2 - t_1}$.', { unit: 'm/s', tol: EX }),
    N('de-ida-regreso', 'desplazamiento', 3, { u1: [2, 20, 1], u2: [2, 20, 1] }, function (v) { return 'Vas a la escuela a $' + v.u1 + '\\ \\text{m/s}$ y regresas por el mismo camino a $' + v.u2 + '\\ \\text{m/s}$. ¿Cuál fue tu rapidez media en el viaje redondo?'; },
      function (v) { return 2 * v.u1 * v.u2 / (v.u1 + v.u2); }, 'Con la distancia $D$: tiempo total $D/v_1 + D/v_2$; la $D$ se cancela.', { unit: 'm/s', where: function (v) { return v.u1 !== v.u2; }, mistakes: { mean: function (v) { return (v.u1 + v.u2) / 2; } }, feedback: fb('mean', 'El promedio simple no sirve: tardas más en el tramo lento.') }),

    /* ---------------- Derivadas ---------------- */
    N('dv-lineal', 'derivadas', 1, { x0: [-10, 10, 1], vv: [-8, 8, 1] }, function (v) { return 'Si $x(t) = ' + P([[v.vv, 1], [v.x0, 0]]) + '$, ¿cuánto vale la velocidad?'; },
      function (v) { return v.vv; }, 'La derivada de $x_0 + vt$ es $v$: velocidad constante.', { unit: 'm/s', tol: EX, where: function (v) { return v.vv !== 0 && v.x0 !== 0 && v.vv !== v.x0; } }),
    N('dv-cuad-v', 'derivadas', 1, { c: [-4, 4, 0.5], b: [-8, 8, 1], x0: [0, 10, 1], t0: [1, 5, 1] }, function (v) { return 'Con $x(t) = ' + P([[v.c, 2], [v.b, 1], [v.x0, 0]]) + '$, ¿qué velocidad tiene en $t = ' + v.t0 + '\\ \\text{s}$?'; },
      function (v) { return 2 * v.c * v.t0 + v.b; }, '$v = 2ct + b$.', { unit: 'm/s', tol: EX, where: function (v) { return v.c !== 0 && v.b !== 0 && Math.abs(2 * v.c * v.t0 + v.b) >= 1; }, mistakes: { noTwo: function (v) { return v.c * v.t0 + v.b; } }, feedback: fb('noTwo', 'Al derivar $t^2$ baja el 2: $\\frac{d}{dt}(ct^2) = 2ct$.') }),
    N('dv-cuad-a', 'derivadas', 2, { c: [-4, 4, 0.5], b: [-8, 8, 1] }, function (v) { return 'Si $x(t) = ' + P([[v.c, 2], [v.b, 1]]) + '$, ¿cuánto vale la aceleración?'; },
      function (v) { return 2 * v.c; }, 'Deriva dos veces: $a = 2c$, constante.', { unit: 'm/s²', tol: EX, where: function (v) { return v.c !== 0 && v.b !== 0; }, mistakes: { gaveC: function (v) { return v.c; } }, feedback: fb('gaveC', 'Falta el 2 de la derivada: $a = 2c$.') }),
    N('dv-cub-v', 'derivadas', 2, { a: [-2, 2, 0.5], b: [-8, 8, 1], t0: [1, 4, 0.5] }, function (v) { return 'La posición de un pistón es $x(t) = ' + P([[v.a, 3], [v.b, 1]]) + '$. ¿Qué velocidad tiene en $t = ' + v.t0 + '\\ \\text{s}$?'; },
      function (v) { return 3 * v.a * v.t0 * v.t0 + v.b; }, '$v = 3at^2 + b$.', { unit: 'm/s', tol: EX, where: function (v) { return v.a !== 0 && v.b !== 0 && Math.abs(3 * v.a * v.t0 * v.t0 + v.b) >= 1; }, mistakes: { avg: function (v) { return v.a * v.t0 * v.t0 + v.b; } }, feedback: fb('avg', 'Calculaste $x(t)/t$, una velocidad media. Deriva: $3at^2 + b$.') }),
    N('dv-cub-a', 'derivadas', 3, { a: [-2, 2, 0.5], b: [-8, 8, 1], t0: [1, 4, 0.5] }, function (v) { return 'Con $x(t) = ' + P([[v.a, 3], [v.b, 1]]) + '$, ¿cuál es la aceleración en $t = ' + v.t0 + '\\ \\text{s}$?'; },
      function (v) { return 6 * v.a * v.t0; }, '$a = \\frac{d^2x}{dt^2} = 6at$.', { unit: 'm/s²', tol: EX, where: function (v) { return v.a !== 0 && v.b !== 0; } }),
    N('dv-para', 'derivadas', 2, { b: [4, 20, 1], c: [0.5, 5, 0.5] }, function (v) { return 'Una piedra que rueda cuesta arriba tiene $x(t) = ' + P([[v.b, 1], [-v.c, 2]]) + '$. ¿En qué instante se detiene?'; },
      function (v) { return v.b / (2 * v.c); }, '$v = b - 2ct = 0$.', { unit: 's', mistakes: { noTwo: function (v) { return v.b / v.c; } }, feedback: fb('noTwo', 'Ese es el instante en que $x$ vuelve a 0. Iguala $v = b - 2ct$ a cero.') }),
    N('dv-xmax', 'derivadas', 2, { b: [4, 20, 1], c: [0.5, 5, 0.5] }, function (v) { return 'Si $x(t) = ' + P([[v.b, 1], [-v.c, 2]]) + '$, ¿cuál es la posición más lejana que alcanza?'; },
      function (v) { return v.b * v.b / (4 * v.c); }, 'Donde $v = 0$, en $t = b/2c$: $x = b^2/4c$.', { unit: 'm' }),
    N('dv-cub-stop', 'derivadas', 2, { p: [1, 6, 0.5] }, function (v) { return 'Una partícula tiene $x(t) = t^3 - ' + (3 * v.p * v.p) + 't$. ¿En qué instante positivo se detiene?'; },
      function (v) { return v.p; }, '$v = 3t^2 - 3p^2 = 0$ da $t = p$.', { unit: 's', tol: EX }),
    N('dv-sin', 'derivadas', 2, { A: [0.5, 5, 0.5], w: [1, 6, 0.5] }, function (v) { return 'Un pistón oscila con $x(t) = ' + v.A + '\\sin(' + v.w + 't)$. ¿Cuál es su rapidez máxima?'; },
      function (v) { return v.A * v.w; }, '$v = A\\omega\\cos(\\omega t)$: su máximo es $A\\omega$.', { unit: 'm/s', where: function (v) { return v.w !== 1; }, mistakes: { gaveA: function (v) { return v.A; } }, feedback: fb('gaveA', 'Esa es la amplitud de la posición. Por la regla de la cadena sale el factor $\\omega$.') }),
    N('dv-cos', 'derivadas', 3, { A: [0.5, 5, 0.5], w: [1, 4, 0.5], t0: [0.2, 2, 0.2] }, function (v) { return 'Con $x(t) = ' + v.A + '\\cos(' + v.w + 't)$ (ángulo en radianes), ¿cuánto vale $v$ en $t = ' + v.t0 + '\\ \\text{s}$?'; },
      function (v) { return -v.A * v.w * Math.sin(v.w * v.t0); }, '$v = -A\\omega\\sin(\\omega t)$.', { unit: 'm/s', tol: { abs: 0.02 }, where: function (v) { return Math.abs(Math.sin(v.w * v.t0)) > 0.1; } }),
    N('dv-exp', 'derivadas', 3, { A: [1, 10, 1], k: [0.2, 2, 0.2] }, function (v) { return 'Un sensor se acerca a una pared con $x(t) = ' + v.A + 'e^{-' + v.k + 't}$. ¿Cuánto vale su velocidad en $t = 0$?'; },
      function (v) { return -v.A * v.k; }, '$v = -Ake^{-kt}$; en $t = 0$ queda $-Ak$.', { unit: 'm/s', tol: EX }),
    N('dv-v-a', 'derivadas', 1, { p: [0.5, 4, 0.5], q: [0, 10, 1], t0: [1, 5, 1] }, function (v) { return 'La velocidad de un carrito es $v(t) = ' + P([[v.p, 2], [v.q, 0]]) + '$. ¿Cuánto vale su aceleración en $t = ' + v.t0 + '\\ \\text{s}$?'; },
      function (v) { return 2 * v.p * v.t0; }, '$a = dv/dt = 2pt$.', { unit: 'm/s²', tol: EX }),
    N('dv-frena', 'derivadas', 3, { v0: [5, 30, 1], k: [0.5, 3, 0.5] }, function (v) { return 'Un tren frena con $v(t) = ' + v.v0 + ' - ' + v.k + 't^2$. ¿En qué instante se detiene?'; },
      function (v) { return Math.sqrt(v.v0 / v.k); }, '$v_0 - kt^2 = 0$.', { unit: 's', mistakes: { noSqrt: function (v) { return v.v0 / v.k; } }, feedback: fb('noSqrt', 'Ese es $t^2$: falta la raíz.') }),
    N('dv-media-inst', 'derivadas', 2, {}, function () { return 'Si $x = ct^2$, ¿qué fracción de la velocidad en $t = T$ es la velocidad media entre $0$ y $T$? (Da un número.)'; },
      function () { return 0.5; }, 'Media: $cT^2/T = cT$; instantánea: $2cT$.', { tol: EX }),
    N('dv-media-cub', 'derivadas', 3, { a: [0.5, 2, 0.5], b: [-6, 6, 1], t1: [0, 2, 1], dt: [1, 3, 1] }, function (v) { return 'Con $x(t) = ' + P([[v.a, 3], [v.b, 1]]) + '$, ¿cuál es la velocidad media entre $t = ' + v.t1 + '$ y $t = ' + (v.t1 + v.dt) + '\\ \\text{s}$?'; },
      function (v) { var t2 = v.t1 + v.dt, X = function (t) { return v.a * t * t * t + v.b * t; }; return (X(t2) - X(v.t1)) / v.dt; }, 'No es la derivada: es $\\frac{x(t_2) - x(t_1)}{\\Delta t}$.', { unit: 'm/s', tol: EX, where: function (v) { return v.b !== 0; } }),

    /* ---------------- Gráficas ---------------- */
    N('gr-pendiente', 'graficas', 1, { x1: [-10, 10, 1], x2: [-10, 20, 1], t1: [0, 4, 1], t2: [5, 10, 1] }, function (v) { return 'En una gráfica $x$-$t$ recta, el móvil está en $x = ' + v.x1 + '\\ \\text{m}$ en $t = ' + v.t1 + '\\ \\text{s}$ y en $x = ' + v.x2 + '\\ \\text{m}$ en $t = ' + v.t2 + '\\ \\text{s}$. ¿Qué velocidad tiene?'; },
      function (v) { return (v.x2 - v.x1) / (v.t2 - v.t1); }, 'La pendiente de la recta $x$-$t$ es la velocidad.', { unit: 'm/s', tol: EX, where: function (v) { return v.x1 !== v.x2; } }),
    N('gr-rect', 'graficas', 2, { vv: [1, 20, 1], T: [2, 30, 1] }, function (v) { return 'La gráfica $v$-$t$ de un móvil es una línea horizontal en $' + v.vv + '\\ \\text{m/s}$ durante $' + v.T + '\\ \\text{s}$. ¿Cuánto se desplaza?'; },
      function (v) { return v.vv * v.T; }, 'El área de un rectángulo: $v\\,\\Delta t$.', { unit: 'm' }),
    N('gr-trap', 'graficas', 2, { v1: [0, 10, 1], v2: [11, 30, 1], T: [2, 20, 1] }, function (v) { return 'La velocidad de un auto sube en línea recta de $' + v.v1 + '$ a $' + v.v2 + '\\ \\text{m/s}$ en $' + v.T + '\\ \\text{s}$. ¿Cuánto avanza en ese tiempo?'; },
      function (v) { return (v.v1 + v.v2) * v.T / 2; }, 'Área del trapecio bajo la recta $v$-$t$.', { unit: 'm', mistakes: { finalV: function (v) { return v.v2 * v.T; } }, feedback: fb('finalV', 'Usaste la velocidad final todo el tiempo; el área es un trapecio.') }),
    N('gr-triangulo', 'graficas', 2, { vm: [2, 20, 1], T: [4, 40, 2] }, function (v) { return 'Un elevador arranca desde el reposo, llega a $' + v.vm + '\\ \\text{m/s}$ a la mitad del viaje y frena hasta detenerse; todo dura $' + v.T + '\\ \\text{s}$ y la gráfica $v$-$t$ es un triángulo. ¿Cuánto sube?'; },
      function (v) { return v.vm * v.T / 2; }, 'Área del triángulo: base por altura entre 2.', { unit: 'm', mistakes: { noHalf: function (v) { return v.vm * v.T; } }, feedback: fb('noHalf', 'El área de un triángulo lleva el $\\tfrac{1}{2}$.') }),
    N('gr-pend-vt', 'graficas', 1, { va: [0, 15, 1], vb: [-10, 30, 1], T: [2, 10, 1] }, function (v) { return 'En una gráfica $v$-$t$ recta, la velocidad pasa de $' + v.va + '$ a $' + v.vb + '\\ \\text{m/s}$ en $' + v.T + '\\ \\text{s}$. ¿Cuánto vale la aceleración?'; },
      function (v) { return (v.vb - v.va) / v.T; }, 'La pendiente de $v$-$t$ es la aceleración.', { unit: 'm/s²', tol: EX, where: function (v) { return v.va !== v.vb; } }),
    N('gr-area-neg', 'graficas', 3, { w1: [1, 10, 1], s1: [2, 10, 1], w2: [1, 10, 1], s2: [2, 10, 1] }, function (v) { return 'Un carrito va a $+' + v.w1 + '\\ \\text{m/s}$ durante $' + v.s1 + '\\ \\text{s}$ y luego a $-' + v.w2 + '\\ \\text{m/s}$ durante $' + v.s2 + '\\ \\text{s}$. ¿Cuál es su desplazamiento total?'; },
      function (v) { return v.w1 * v.s1 - v.w2 * v.s2; }, 'El área bajo el eje cuenta negativa.', { unit: 'm', tol: EX, where: function (v) { return v.w1 * v.s1 !== v.w2 * v.s2; }, mistakes: { distance: function (v) { return v.w1 * v.s1 + v.w2 * v.s2; } }, feedback: fb('distance', 'Esa es la distancia. Para el desplazamiento, el área bajo el eje se resta.') }),
    N('gr-distancia', 'graficas', 2, { w1: [1, 10, 1], s1: [2, 10, 1], w2: [1, 10, 1], s2: [2, 10, 1] }, function (v) { return 'Un robot va a $+' + v.w1 + '\\ \\text{m/s}$ por $' + v.s1 + '\\ \\text{s}$ y luego regresa a $' + v.w2 + '\\ \\text{m/s}$ por $' + v.s2 + '\\ \\text{s}$. ¿Qué distancia recorre en total?'; },
      function (v) { return v.w1 * v.s1 + v.w2 * v.s2; }, 'La distancia suma las áreas sin signo.', { unit: 'm' }),
    N('gr-x-final', 'graficas', 2, { x0: [-10, 10, 1], vv: [-5, 5, 1], T: [2, 10, 1] }, function (v) { return 'Un móvil parte de $x = ' + v.x0 + '\\ \\text{m}$ y su gráfica $v$-$t$ es horizontal en $' + v.vv + '\\ \\text{m/s}$. ¿Dónde está a los $' + v.T + '\\ \\text{s}$?'; },
      function (v) { return v.x0 + v.vv * v.T; }, 'Posición final = inicial + área bajo $v$-$t$.', { unit: 'm', tol: EX, where: function (v) { return v.vv !== 0 && v.x0 !== 0 && v.x0 + v.vv * v.T !== 0; }, mistakes: { noX0: function (v) { return v.vv * v.T; } }, feedback: fb('noX0', 'Ese es el desplazamiento; súmale la posición inicial.') }),
    N('gr-at', 'graficas', 1, { ac: [0.5, 6, 0.5], T: [2, 12, 1] }, function (v) { return 'La gráfica $a$-$t$ de un carro es horizontal en $' + v.ac + '\\ \\text{m/s}^2$ durante $' + v.T + '\\ \\text{s}$. ¿Cuánto cambia su velocidad?'; },
      function (v) { return v.ac * v.T; }, 'El área bajo $a$-$t$ es el cambio de velocidad.', { unit: 'm/s' }),
    N('gr-lectura', 'graficas', 2, { x0: [0, 10, 1], x1: [11, 40, 1], T: [4, 12, 1], t: [1, 3, 1] }, function (v) { return 'Una gráfica $x$-$t$ recta va de $x = ' + v.x0 + '\\ \\text{m}$ en $t = 0$ a $x = ' + v.x1 + '\\ \\text{m}$ en $t = ' + v.T + '\\ \\text{s}$. ¿Dónde está el móvil en $t = ' + v.t + '\\ \\text{s}$?'; },
      function (v) { return v.x0 + (v.x1 - v.x0) * v.t / v.T; }, '$x = x_0 + vt$ con $v$ = pendiente.', { unit: 'm', tol: { abs: 0.02 } }),

    N('gr-arranque', 'graficas', 3, { vm: [2, 20, 1], t1: [2, 10, 1], t2: [2, 20, 1] }, function (v) { return 'Un tren arranca del reposo y su velocidad sube en línea recta hasta $' + v.vm + '\\ \\text{m/s}$ en $' + v.t1 + '\\ \\text{s}$; luego sigue a esa velocidad $' + v.t2 + '\\ \\text{s}$ más. ¿Cuánto avanzó en total?'; },
      function (v) { return v.vm * v.t1 / 2 + v.vm * v.t2; }, 'Área de un triángulo más un rectángulo bajo la gráfica $v$-$t$.', { unit: 'm', mistakes: { allFlat: function (v) { return v.vm * (v.t1 + v.t2); } }, feedback: fb('allFlat', 'En el arranque no iba a ' + 'velocidad constante: esa parte es un triángulo.') }),

    /* ---------------- MRU ---------------- */
    N('mru-x', 'mru', 1, { x0: [-20, 20, 1], vv: [-6, 6, 1], t: [2, 15, 1] }, function (v) { return 'Un carrito parte de $x = ' + v.x0 + '\\ \\text{m}$ con velocidad constante de $' + v.vv + '\\ \\text{m/s}$. ¿Dónde está a los $' + v.t + '\\ \\text{s}$?'; },
      function (v) { return v.x0 + v.vv * v.t; }, '$x = x_0 + vt$.', { unit: 'm', tol: EX, where: function (v) { return v.vv !== 0 && v.x0 !== 0 && v.x0 + v.vv * v.t !== 0; } }),
    N('mru-t', 'mru', 1, { D: [20, 500, 10], vv: [2, 25, 1] }, function (v) { return '¿Cuánto tarda un robot en recorrer $' + v.D + '\\ \\text{m}$ a $' + v.vv + '\\ \\text{m/s}$ constantes?'; },
      function (v) { return v.D / v.vv; }, '$t = D/v$.', { unit: 's' }),
    N('mru-v', 'mru', 1, { Dm: [20, 500, 10], ts: [2, 60, 1] }, function (v) { return 'Un corredor recorre $' + v.Dm + '\\ \\text{m}$ en $' + v.ts + '\\ \\text{s}$ a ritmo constante. ¿Cuál es su rapidez?'; },
      function (v) { return v.Dm / v.ts; }, '$v = D/t$.', { unit: 'm/s' }),
    N('mru-kmh', 'mru', 2, { Dk: [5, 300, 5], vk: [30, 120, 10] }, function (v) { return 'Un camión recorre $' + v.Dk + '\\ \\text{km}$ a $' + v.vk + '\\ \\text{km/h}$ constantes. ¿Cuántos minutos tarda?'; },
      function (v) { return v.Dk / v.vk * 60; }, '$t = D/v$ en horas; por 60 a minutos.', { unit: 'min' }),
    N('mru-eco', 'mru', 2, { te: [0.5, 6, 0.5] }, function (v) { return 'Gritas frente a un acantilado y oyes el eco $' + v.te + '\\ \\text{s}$ después. Si el sonido va a $343\\ \\text{m/s}$, ¿a qué distancia está el acantilado?'; },
      function (v) { return 343 * v.te / 2; }, 'El sonido va y regresa: recorre el doble de la distancia.', { unit: 'm', mistakes: { noHalf: function (v) { return 343 * v.te; } }, feedback: fb('noHalf', 'El sonido hace el viaje de ida y vuelta: divide entre 2.') }),
    N('mru-origen', 'mru', 2, { x0: [5, 60, 5], vv: [-8, -1, 1] }, function (v) { return 'Un carrito está en $x = ' + v.x0 + '\\ \\text{m}$ y se mueve a $' + v.vv + '\\ \\text{m/s}$. ¿En qué instante pasa por el origen?'; },
      function (v) { return -v.x0 / v.vv; }, '$0 = x_0 + vt$ da $t = -x_0/v$, positivo porque $v < 0$.', { unit: 's' }),
    N('mru-rayo', 'mru', 2, { tr: [1, 12, 0.5] }, function (v) { return 'Ves un relámpago y oyes el trueno $' + v.tr + '\\ \\text{s}$ después. ¿A qué distancia cayó? (Sonido: $343\\ \\text{m/s}$; la luz llega casi al instante.)'; },
      function (v) { return 343 * v.tr; }, 'El sonido viaja una sola vez: $d = vt$.', { unit: 'm' }),
    N('mru-tunel', 'mru', 3, { Lt: [50, 300, 10], Tu: [100, 900, 50], vv: [10, 40, 1] }, function (v) { return 'Un tren de $' + v.Lt + '\\ \\text{m}$ de largo entra a un túnel de $' + v.Tu + '\\ \\text{m}$ a $' + v.vv + '\\ \\text{m/s}$. ¿Cuánto tarda desde que entra la locomotora hasta que sale el último vagón?'; },
      function (v) { return (v.Lt + v.Tu) / v.vv; }, 'La locomotora debe recorrer el túnel más el largo del tren.', { unit: 's', mistakes: { onlyTunnel: function (v) { return v.Tu / v.vv; } }, feedback: fb('onlyTunnel', 'Falta el largo del tren: el último vagón sale cuando la locomotora avanzó $T + L$.') }),
    N('mru-dos-tramos', 'mru', 2, { v1: [1, 8, 1], t1: [2, 10, 1], v2: [1, 8, 1], t2: [2, 10, 1] }, function (v) { return 'Un robot parte del origen, va a $' + v.v1 + '\\ \\text{m/s}$ durante $' + v.t1 + '\\ \\text{s}$ y luego a $-' + v.v2 + '\\ \\text{m/s}$ durante $' + v.t2 + '\\ \\text{s}$. ¿En qué posición termina?'; },
      function (v) { return v.v1 * v.t1 - v.v2 * v.t2; }, 'Suma los desplazamientos con su signo.', { unit: 'm', tol: EX, where: function (v) { return v.v1 * v.t1 !== v.v2 * v.t2; } }),
    N('mru-ciclista', 'mru', 2, { vk: [9, 36, 3], tm: [2, 30, 1] }, function (v) { return 'Una ciclista va a $' + v.vk + '\\ \\text{km/h}$ constantes. ¿Cuántos metros recorre en $' + v.tm + '$ minutos?'; },
      function (v) { return v.vk / 3.6 * v.tm * 60; }, 'Pasa a m/s y a segundos antes de multiplicar.', { unit: 'm', mistakes: { mixed: function (v) { return v.vk * v.tm; } }, feedback: fb('mixed', 'Mezclaste km/h con minutos: convierte todo al SI.') }),
    N('mru-luna', 'mru', 1, {}, function () { return 'La Luna está a unos $3.84\\times 10^8\\ \\text{m}$. ¿Cuánto tarda en llegar un rayo láser a $3.00\\times 10^8\\ \\text{m/s}$?'; },
      function () { return 3.84e8 / 3e8; }, '$t = d/c$.', { unit: 's' }),

    /* ---------------- Encuentros ---------------- */
    N('en-frente', 'encuentro', 1, { D: [100, 900, 50], vA: [2, 30, 1], vB: [2, 30, 1] }, function (v) { return 'Dos corredores están a $' + v.D + '\\ \\text{m}$ y corren uno hacia el otro a $' + v.vA + '$ y $' + v.vB + '\\ \\text{m/s}$. ¿Cuánto tardan en encontrarse?'; },
      function (v) { return v.D / (v.vA + v.vB); }, 'Se acercan a $v_A + v_B$.', { unit: 's', where: function (v) { return v.vA !== v.vB; }, mistakes: { subtracted: function (v) { return v.D / Math.abs(v.vA - v.vB); } }, feedback: fb('subtracted', 'Van uno hacia el otro: las rapideces se suman.') }),
    N('en-frente-x', 'encuentro', 2, { D: [100, 900, 50], vA: [2, 30, 1], vB: [2, 30, 1] }, function (v) { return 'A y B están a $' + v.D + '\\ \\text{m}$ y van uno hacia el otro a $' + v.vA + '$ y $' + v.vB + '\\ \\text{m/s}$. ¿A qué distancia del punto de salida de A se encuentran?'; },
      function (v) { return v.vA * v.D / (v.vA + v.vB); }, 'Primero el tiempo de encuentro; luego lo que avanzó A.', { unit: 'm', where: function (v) { return v.vA !== v.vB; } }),
    N('en-alcance', 'encuentro', 2, { D: [10, 200, 10], vA: [2, 15, 1], vB: [3, 25, 1] }, function (v) { return 'Una patrulla a $' + v.vB + '\\ \\text{m/s}$ persigue a un auto que va $' + v.D + '\\ \\text{m}$ adelante a $' + v.vA + '\\ \\text{m/s}$, en la misma dirección. ¿Cuánto tarda en alcanzarlo?'; },
      function (v) { return v.D / (v.vB - v.vA); }, 'En el mismo sentido se acercan a $v_B - v_A$.', { unit: 's', where: function (v) { return v.vB > v.vA; }, mistakes: { added: function (v) { return v.D / (v.vA + v.vB); } }, feedback: fb('added', 'Van en el mismo sentido: se acercan a la diferencia de rapideces.') }),
    N('en-alcance-x', 'encuentro', 3, { D: [10, 200, 10], vA: [2, 15, 1], vB: [3, 25, 1] }, function (v) { return 'Un auto va $' + v.D + '\\ \\text{m}$ adelante a $' + v.vA + '\\ \\text{m/s}$ y lo persigue una moto a $' + v.vB + '\\ \\text{m/s}$. ¿Cuántos metros recorre la moto hasta alcanzarlo?'; },
      function (v) { return v.vB * v.D / (v.vB - v.vA); }, 'Tiempo de alcance por la rapidez de la moto.', { unit: 'm', where: function (v) { return v.vB > v.vA; } }),
    N('en-retraso', 'encuentro', 3, { vA: [2, 10, 1], vB: [3, 20, 1], t0: [5, 60, 5] }, function (v) { return 'A sale a $' + v.vA + '\\ \\text{m/s}$. Del mismo lugar sale B $' + v.t0 + '\\ \\text{s}$ después a $' + v.vB + '\\ \\text{m/s}$, en la misma dirección. ¿Cuánto tarda B en alcanzar a A, contando desde que B sale?'; },
      function (v) { return v.vA * v.t0 / (v.vB - v.vA); }, 'Cuando B sale, A le lleva $v_A t_0$ de ventaja; se acercan a $v_B - v_A$.', { unit: 's', where: function (v) { return v.vB > v.vA; } }),
    N('en-retraso-x', 'encuentro', 3, { vA: [2, 10, 1], vB: [3, 20, 1], t0: [5, 60, 5] }, function (v) { return 'A sale a $' + v.vA + '\\ \\text{m/s}$ y B sale $' + v.t0 + '\\ \\text{s}$ después del mismo lugar a $' + v.vB + '\\ \\text{m/s}$. ¿A qué distancia del punto de partida alcanza B a A?'; },
      function (v) { return v.vB * v.vA * v.t0 / (v.vB - v.vA); }, 'Distancia que recorre B hasta el encuentro.', { unit: 'm', where: function (v) { return v.vB > v.vA; } }),
    N('en-kmh', 'encuentro', 2, { Dk: [20, 300, 10], ka: [40, 110, 10], kb: [40, 110, 10] }, function (v) { return 'Dos autos están a $' + v.Dk + '\\ \\text{km}$ y viajan uno hacia el otro a $' + v.ka + '$ y $' + v.kb + '\\ \\text{km/h}$. ¿Cuántos minutos tardan en cruzarse?'; },
      function (v) { return v.Dk / (v.ka + v.kb) * 60; }, 'Tiempo en horas por 60.', { unit: 'min' }),
    N('en-separacion', 'encuentro', 2, { u1: [2, 20, 1], u2: [2, 20, 1], t: [2, 30, 1] }, function (v) { return 'Dos amigos salen del mismo punto en sentidos opuestos a $' + v.u1 + '$ y $' + v.u2 + '\\ \\text{m/s}$. ¿A qué distancia están después de $' + v.t + '\\ \\text{s}$?'; },
      function (v) { return (v.u1 + v.u2) * v.t; }, 'Se alejan a $v_1 + v_2$.', { unit: 'm' }),
    N('en-separacion-t', 'encuentro', 2, { S: [50, 900, 50], u1: [2, 20, 1], u2: [2, 20, 1] }, function (v) { return 'Dos drones despegan del mismo punto y vuelan en sentidos opuestos a $' + v.u1 + '$ y $' + v.u2 + '\\ \\text{m/s}$. Su radio solo alcanza $' + v.S + '\\ \\text{m}$. ¿Cuánto tardan en perder la señal?'; },
      function (v) { return v.S / (v.u1 + v.u2); }, 'Se separan a $v_1 + v_2$.', { unit: 's' }),

    /* ---------------- Conceptuales ---------------- */
    C('k-desp', 'desplazamiento', 1, 'El desplazamiento de un móvil en línea recta es…', '$x_f - x_i$', [['la distancia total recorrida'], ['$x_i - x_f$'], ['$x_f + x_i$']], 'Final menos inicial, con signo.'),
    C('k-dist-mayor', 'desplazamiento', 2, 'Comparada con $|\\Delta x|$, la distancia recorrida es…', 'mayor o igual', [['siempre igual'], ['siempre menor'], ['menor o igual']], 'Son iguales solo si el móvil nunca se regresa.'),
    C('k-desp-neg', 'desplazamiento', 1, 'Un desplazamiento negativo significa que el móvil…', 'terminó del lado negativo de donde empezó', [['recorrió una distancia negativa'], ['se movió hacia atrás en el tiempo'], ['frenó']], 'El signo indica sentido, no "menos distancia".'),
    C('k-vuelta-vmedia', 'desplazamiento', 2, 'Das una vuelta completa a una pista. Tu velocidad media es…', 'cero', [['igual a tu rapidez media'], ['la longitud de la pista entre el tiempo'], ['negativa']], 'El desplazamiento de una vuelta completa es cero.'),
    C('k-rapidez-media', 'desplazamiento', 1, 'La rapidez media es…', 'distancia recorrida entre tiempo', [['desplazamiento entre tiempo'], ['el promedio de las rapideces'], ['la rapidez máxima entre dos']], 'Usa la distancia, no el desplazamiento.'),
    C('k-velocimetro', 'desplazamiento', 2, 'El velocímetro de un auto mide…', 'la rapidez instantánea', [['la velocidad media'], ['la rapidez media del viaje'], ['la aceleración']], 'Marca cuánto va en cada instante, sin dirección.'),
    C('k-promedio', 'desplazamiento', 3, 'La velocidad media de un viaje en dos tramos, ¿es el promedio de las dos velocidades?', 'Solo si los dos tramos duran lo mismo', [['Siempre'], ['Nunca'], ['Solo si los dos tramos miden lo mismo']], 'Es un promedio pesado por el tiempo de cada tramo.'),
    C('k-origen', 'desplazamiento', 2, 'Si cambias de lugar el origen del eje $x$…', 'cambian las posiciones pero no los desplazamientos', [['cambian los desplazamientos'], ['cambian las velocidades'], ['no cambia nada']], 'El desplazamiento es una diferencia de posiciones.'),
    C('k-signo-v', 'desplazamiento', 1, 'El signo de la velocidad indica…', 'el sentido del movimiento', [['si acelera o frena'], ['si la posición es positiva'], ['la rapidez']], 'Positiva hacia $+x$; negativa hacia $-x$.'),
    C('k-v-deriv', 'derivadas', 1, 'La velocidad instantánea es…', '$\\frac{dx}{dt}$', [['$\\frac{x}{t}$'], ['$\\int x\\,dt$'], ['$\\frac{d^2x}{dt^2}$']], 'La derivada de la posición.'),
    C('k-a-deriv', 'derivadas', 1, 'La aceleración es…', '$\\frac{dv}{dt}$', [['$\\frac{dx}{dt}$'], ['$\\frac{v}{x}$'], ['$v\\,t$']], 'La derivada de la velocidad.'),
    C('k-segunda', 'derivadas', 2, 'La aceleración también se puede escribir como…', '$\\frac{d^2x}{dt^2}$', [['$\\left(\\frac{dx}{dt}\\right)^2$'], ['$\\frac{dx}{dt}\\cdot t$'], ['$\\frac{x}{t^2}$']], 'Es la segunda derivada de la posición.'),
    C('k-limite', 'derivadas', 2, 'La velocidad instantánea es el límite de…', 'la velocidad media cuando $\\Delta t \\to 0$', [['la posición cuando $t \\to 0$'], ['la rapidez media cuando $t \\to \\infty$'], ['la aceleración cuando $\\Delta t \\to 0$']], 'Es la pendiente de la tangente a $x(t)$.'),
    C('k-v0-a', 'derivadas', 2, 'Si en un instante $v = 0$, la aceleración en ese instante…', 'puede ser distinta de cero', [['es cero'], ['es negativa'], ['no está definida']], 'Una pelota en la cima tiene $v = 0$ y $a = -g$.'),
    C('k-frena', 'derivadas', 2, 'Un objeto frena (su rapidez disminuye) cuando…', '$v$ y $a$ tienen signos opuestos', [['$a$ es negativa'], ['$v$ es negativa'], ['$a$ es cero']], 'La aceleración empuja en contra del movimiento.'),
    C('k-a-neg', 'derivadas', 3, 'Un carro tiene $v = -8$ m/s y $a = -2$ m/s². Su rapidez…', 'aumenta', [['disminuye'], ['no cambia'], ['es negativa']], 'Mismo signo: acelera, aunque la aceleración sea negativa.'),
    C('k-cuad-a', 'derivadas', 2, 'Si $x(t)$ es un polinomio de grado 2, la aceleración es…', 'constante', [['cero'], ['lineal en $t$'], ['cuadrática en $t$']], 'Derivar dos veces una cuadrática deja una constante.'),
    C('k-lineal-a', 'derivadas', 1, 'Si $x(t) = x_0 + vt$, la aceleración es…', 'cero', [['$v$'], ['$x_0$'], ['$v/t$']], 'La velocidad es constante.'),
    C('k-da-vuelta', 'derivadas', 2, 'Un móvil da la vuelta en el instante en que…', '$v$ cambia de signo', [['$a$ cambia de signo'], ['$x$ vale cero'], ['$a$ vale cero']], 'Ahí la velocidad pasa por cero y cambia de sentido.'),
    C('k-pend-xt', 'graficas', 1, 'La pendiente de la gráfica $x$-$t$ es…', 'la velocidad', [['la aceleración'], ['la distancia'], ['el tiempo']], '$v = dx/dt$.'),
    C('k-pend-vt', 'graficas', 1, 'La pendiente de la gráfica $v$-$t$ es…', 'la aceleración', [['la posición'], ['la velocidad media'], ['el desplazamiento']], '$a = dv/dt$.'),
    C('k-area-vt', 'graficas', 1, 'El área bajo la gráfica $v$-$t$ es…', 'el desplazamiento', [['la aceleración'], ['la velocidad media'], ['la posición inicial']], '$\\Delta x = \\int v\\,dt$.'),
    C('k-area-at', 'graficas', 2, 'El área bajo la gráfica $a$-$t$ es…', 'el cambio de velocidad', [['el desplazamiento'], ['la posición'], ['la aceleración media']], '$\\Delta v = \\int a\\,dt$.'),
    C('k-xt-horizontal', 'graficas', 1, 'Si la gráfica $x$-$t$ es una línea horizontal, el objeto…', 'está en reposo', [['va a velocidad constante no cero'], ['acelera'], ['está en el origen']], 'Pendiente cero: $v = 0$.'),
    C('k-xt-recta', 'graficas', 1, 'Si la gráfica $x$-$t$ es una recta inclinada, el objeto…', 'va a velocidad constante', [['acelera de manera constante'], ['está en reposo'], ['frena']], 'Pendiente constante.'),
    C('k-xt-curva', 'graficas', 2, 'Si la gráfica $x$-$t$ se curva y se vuelve cada vez más empinada, el objeto…', 'va cada vez más rápido', [['va cada vez más lento'], ['está en reposo'], ['va a velocidad constante']], 'La pendiente, que es la velocidad, crece.'),
    C('k-vt-horizontal', 'graficas', 1, 'Una gráfica $v$-$t$ horizontal por encima del eje indica…', 'movimiento rectilíneo uniforme', [['reposo'], ['aceleración constante'], ['que el objeto regresa']], 'Velocidad constante y distinta de cero.'),
    C('k-vt-cruza', 'graficas', 2, 'Si la gráfica $v$-$t$ cruza el eje $t$, en ese instante el objeto…', 'se detiene y cambia de sentido', [['regresa al origen'], ['deja de acelerar'], ['alcanza su rapidez máxima']], '$v = 0$ y cambia de signo.'),
    C('k-area-neg', 'graficas', 2, 'El área entre la gráfica $v$-$t$ y el eje, cuando la curva está por debajo del eje, representa…', 'un desplazamiento negativo', [['una distancia negativa'], ['una aceleración negativa'], ['que el objeto está en reposo']], 'Se mueve hacia $-x$.'),
    C('k-altura', 'graficas', 3, 'En una gráfica $x$-$t$, ¿dónde se lee la velocidad en un instante?', 'En la pendiente de la curva en ese punto', [['En la altura de la curva en ese punto'], ['En el área bajo la curva'], ['En el cruce con el eje $x$']], 'La altura es la posición; la pendiente, la velocidad.'),
    C('k-cruce', 'graficas', 2, 'Si dos rectas de una gráfica $x$-$t$ se cruzan, en ese instante los móviles…', 'están en el mismo lugar', [['van a la misma velocidad'], ['están detenidos'], ['tienen la misma aceleración']], 'Tienen la misma $x$ en el mismo $t$.'),
    C('k-pico', 'graficas', 3, 'En el punto más alto de una gráfica $x$-$t$ (un máximo), la velocidad es…', 'cero', [['máxima'], ['negativa'], ['igual a la posición']], 'La tangente es horizontal.'),
    C('k-mru-def', 'mru', 1, 'En un movimiento rectilíneo uniforme…', 'la velocidad es constante', [['la aceleración es constante y no cero'], ['la posición es constante'], ['la velocidad crece']], 'Uniforme = sin cambios en la velocidad.'),
    C('k-mru-a', 'mru', 1, 'En el MRU la aceleración es…', 'cero', [['constante y positiva'], ['igual a la velocidad'], ['negativa']], 'La velocidad no cambia.'),
    C('k-mru-ecuacion', 'mru', 2, 'En el MRU, la posición es…', '$x = x_0 + vt$', [['$x = x_0 + \\tfrac{1}{2}vt^2$'], ['$x = vt^2$'], ['$x = x_0 - vt$ siempre']], 'Una función lineal de $t$.'),
    C('k-mru-xt', 'mru', 2, 'La gráfica $x$-$t$ del MRU es…', 'una recta', [['una parábola'], ['una línea horizontal'], ['una curva que se aplana']], 'Pendiente constante $v$.'),
    C('k-mru-doble', 'mru', 2, 'En un MRU, si duplicas el tiempo, el desplazamiento…', 'se duplica', [['se cuadruplica'], ['no cambia'], ['se reduce a la mitad']], '$\\Delta x = v\\,t$ es proporcional a $t$.'),
    C('k-mru-negativa', 'mru', 2, 'En un MRU con $v < 0$, la posición…', 'disminuye con el tiempo', [['aumenta con el tiempo'], ['es negativa'], ['no cambia']], 'Se mueve hacia $-x$.'),
    C('k-mru-eco', 'mru', 3, 'Al medir una distancia con un eco, se divide el tiempo entre 2 porque…', 'el sonido va y regresa', [['el sonido pierde la mitad de su rapidez'], ['así lo marca el SI'], ['el eco llega dos veces']], 'El tiempo medido es de ida y vuelta.'),
    C('k-en-condicion', 'encuentro', 1, 'Dos móviles se encuentran cuando…', '$x_A = x_B$ en el mismo instante', [['$v_A = v_B$'], ['recorrieron la misma distancia'], ['sus aceleraciones son iguales']], 'Mismo lugar, mismo tiempo.'),
    C('k-en-frente', 'encuentro', 2, 'Si dos móviles van uno hacia el otro, se acercan con rapidez…', '$v_A + v_B$', [['$|v_A - v_B|$'], ['$v_A v_B$'], ['la del más rápido']], 'La separación disminuye con los dos.'),
    C('k-en-mismo', 'encuentro', 2, 'Si B persigue a A en el mismo sentido ($v_B > v_A$), se acercan con rapidez…', '$v_B - v_A$', [['$v_A + v_B$'], ['$v_B$'], ['$v_A$']], 'Solo la diferencia cierra la distancia.'),
    C('k-en-signos', 'encuentro', 1, 'En un problema de encuentro con $+x$ a la derecha, el móvil que va hacia la izquierda tiene…', 'velocidad negativa', [['velocidad positiva'], ['aceleración negativa'], ['posición negativa']], 'El signo de $v$ da el sentido.'),
    C('k-en-igual', 'encuentro', 3, 'Dos autos van en el mismo sentido con la misma rapidez, separados 100 m. ¿Se encuentran?', 'No, la separación no cambia', [['Sí, en 100 s'], ['Sí, cuando uno frene por la fricción'], ['Depende de la rapidez']], 'Con $v_B - v_A = 0$ nunca se acercan.'),
    C('k-en-grafica', 'encuentro', 2, 'En una gráfica $x$-$t$, el encuentro de dos móviles es…', 'el punto donde se cruzan sus rectas', [['el punto donde una recta corta el eje $t$'], ['donde las pendientes son iguales'], ['el origen']], 'Ahí tienen la misma posición al mismo tiempo.')
  ];

  K.register({
    'f1.S04.desplazamiento': 'Desplazamiento, distancia y velocidad media',
    'f1.S04.derivadas': 'Velocidad y aceleración como derivadas',
    'f1.S04.graficas': 'Gráficas x-t, v-t y a-t',
    'f1.S04.mru': 'Movimiento rectilíneo uniforme',
    'f1.S04.encuentro': 'Encuentros de dos móviles'
  }, Q);
})();
