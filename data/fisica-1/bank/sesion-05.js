/* =====================================================================
   Banco · Física 1 · S05 · MRUA · caída libre y tiro vertical.
   100 preguntas propias. g = 9.81 m/s², eje y hacia arriba, sin aire.
   ===================================================================== */
(function () {
  var K = window.CBBankKit('f1', '05'), C = K.C;
  var g = 9.81;
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
  function tGround(v0, h0) { return (v0 + Math.sqrt(v0 * v0 + 2 * g * h0)) / g; }
  var EX = { abs: 0.02 };

  var Q = [
    /* ---------------- Ecuaciones del MRUA ---------------- */
    N('ec-v', 'ecuaciones', 1, { v0: [0, 20, 1], a: [0.5, 5, 0.5], t: [1, 12, 1] }, function (v) { return 'Un carro va a $' + v.v0 + '\\ \\text{m/s}$ y acelera a $' + v.a + '\\ \\text{m/s}^2$. ¿Qué velocidad tiene $' + v.t + '\\ \\text{s}$ después?'; },
      function (v) { return v.v0 + v.a * v.t; }, '$v = v_0 + at$.', { unit: 'm/s' }),
    N('ec-x', 'ecuaciones', 1, { v0: [0, 20, 1], a: [0.5, 5, 0.5], t: [1, 12, 1] }, function (v) { return 'Un carro va a $' + v.v0 + '\\ \\text{m/s}$ y acelera a $' + v.a + '\\ \\text{m/s}^2$ durante $' + v.t + '\\ \\text{s}$. ¿Cuánto avanza?'; },
      function (v) { return v.v0 * v.t + v.a * v.t * v.t / 2; }, '$\\Delta x = v_0t + \\tfrac{1}{2}at^2$.', { unit: 'm', mistakes: { noHalf: function (v) { return v.v0 * v.t + v.a * v.t * v.t; } }, feedback: fb('noHalf', 'Falta el $\\tfrac{1}{2}$ del término $\\tfrac{1}{2}at^2$.') }),
    N('ec-v2', 'ecuaciones', 2, { v0: [0, 15, 1], a: [0.5, 5, 0.5], dx: [10, 200, 10] }, function (v) { return 'Una moto a $' + v.v0 + '\\ \\text{m/s}$ acelera a $' + v.a + '\\ \\text{m/s}^2$ a lo largo de $' + v.dx + '\\ \\text{m}$. ¿Con qué rapidez termina?'; },
      function (v) { return Math.sqrt(v.v0 * v.v0 + 2 * v.a * v.dx); }, 'Sin tiempo: $v^2 = v_0^2 + 2a\\,\\Delta x$.', { unit: 'm/s', mistakes: { noSqrt: function (v) { return v.v0 * v.v0 + 2 * v.a * v.dx; } }, feedback: fb('noSqrt', 'Ese es $v^2$: falta la raíz.') }),
    N('ec-a', 'ecuaciones', 1, { v0: [0, 15, 1], vf: [16, 40, 1], t: [2, 15, 1] }, function (v) { return 'Un tren pasa de $' + v.v0 + '$ a $' + v.vf + '\\ \\text{m/s}$ en $' + v.t + '\\ \\text{s}$ con aceleración constante. ¿Cuánto vale esa aceleración?'; },
      function (v) { return (v.vf - v.v0) / v.t; }, '$a = \\Delta v/\\Delta t$.', { unit: 'm/s²' }),
    N('ec-a-dx', 'ecuaciones', 2, { v0: [0, 15, 1], vf: [16, 40, 1], dx: [20, 400, 20] }, function (v) { return 'Un auto pasa de $' + v.v0 + '$ a $' + v.vf + '\\ \\text{m/s}$ en $' + v.dx + '\\ \\text{m}$. ¿Cuál fue su aceleración (constante)?'; },
      function (v) { return (v.vf * v.vf - v.v0 * v.v0) / (2 * v.dx); }, '$a = \\frac{v^2 - v_0^2}{2\\Delta x}$.', { unit: 'm/s²', mistakes: { noTwo: function (v) { return (v.vf * v.vf - v.v0 * v.v0) / v.dx; } }, feedback: fb('noTwo', 'Falta el 2: $v^2 = v_0^2 + 2a\\,\\Delta x$.') }),
    N('ec-t-dx', 'ecuaciones', 2, { v0: [0, 15, 1], vf: [16, 40, 1], D: [20, 400, 20] }, function (v) { return 'Una patineta pasa de $' + v.v0 + '$ a $' + v.vf + '\\ \\text{m/s}$ a lo largo de $' + v.D + '\\ \\text{m}$ con aceleración constante. ¿Cuánto tarda?'; },
      function (v) { return 2 * v.D / (v.v0 + v.vf); }, 'Sin aceleración: $\\Delta x = \\tfrac{1}{2}(v_0 + v)t$.', { unit: 's' }),
    N('ec-dx-media', 'ecuaciones', 2, { v0: [0, 15, 1], vf: [16, 40, 1], t: [2, 15, 1] }, function (v) { return 'Un auto acelera uniformemente de $' + v.v0 + '$ a $' + v.vf + '\\ \\text{m/s}$ en $' + v.t + '\\ \\text{s}$. ¿Cuánto avanza?'; },
      function (v) { return (v.v0 + v.vf) * v.t / 2; }, 'Con $a$ constante, la velocidad media es $\\tfrac{1}{2}(v_0 + v)$.', { unit: 'm', mistakes: { finalV: function (v) { return v.vf * v.t; } }, feedback: fb('finalV', 'No fue todo el tiempo a la velocidad final: usa la media, $\\tfrac{1}{2}(v_0 + v)$.') }),
    N('ec-t-reposo', 'ecuaciones', 2, { ac: [0.5, 5, 0.5], D: [10, 300, 10] }, function (v) { return 'Un robot parte del reposo con $a = ' + v.ac + '\\ \\text{m/s}^2$. ¿Cuánto tarda en recorrer $' + v.D + '\\ \\text{m}$?'; },
      function (v) { return Math.sqrt(2 * v.D / v.ac); }, '$D = \\tfrac{1}{2}at^2$.', { unit: 's', mistakes: { forgotTwo: function (v) { return Math.sqrt(v.D / v.ac); } }, feedback: fb('forgotTwo', 'De $D = \\tfrac{1}{2}at^2$ sale $t = \\sqrt{2D/a}$: te faltó el 2.') }),
    N('ec-v-reposo', 'ecuaciones', 1, { ac: [0.5, 5, 0.5], D: [10, 300, 10] }, function (v) { return 'Un carrito parte del reposo y acelera a $' + v.ac + '\\ \\text{m/s}^2$ durante $' + v.D + '\\ \\text{m}$. ¿Qué rapidez alcanza?'; },
      function (v) { return Math.sqrt(2 * v.ac * v.D); }, '$v^2 = 2a\\,\\Delta x$.', { unit: 'm/s' }),
    N('ec-pista', 'ecuaciones', 2, { vt: [50, 90, 5], ac: [1.5, 5, 0.5] }, function (v) { return 'Un avión necesita $' + v.vt + '\\ \\text{m/s}$ para despegar y acelera a $' + v.ac + '\\ \\text{m/s}^2$ desde el reposo. ¿Qué largo mínimo de pista necesita?'; },
      function (v) { return v.vt * v.vt / (2 * v.ac); }, '$L = v^2/2a$.', { unit: 'm' }),
    N('ec-segundo-n', 'ecuaciones', 3, { ac: [1, 6, 0.5], n: [2, 10, 1] }, function (v) { return 'Un objeto parte del reposo con $a = ' + v.ac + '\\ \\text{m/s}^2$. ¿Cuántos metros recorre durante el segundo número ' + v.n + ' (entre $t = ' + (v.n - 1) + '$ y $t = ' + v.n + '$ s)?'; },
      function (v) { return v.ac * (2 * v.n - 1) / 2; }, '$x(n) - x(n - 1) = \\tfrac{1}{2}a[n^2 - (n-1)^2]$.', { unit: 'm', mistakes: { total: function (v) { return v.ac * v.n * v.n / 2; } }, feedback: fb('total', 'Eso es lo que lleva desde el inicio; se pide solo ese segundo.') }),
    N('ec-dos-etapas', 'ecuaciones', 3, { ac: [0.5, 4, 0.5], t1: [2, 10, 1], t2: [2, 20, 1] }, function (v) { return 'Un tren arranca del reposo con $a = ' + v.ac + '\\ \\text{m/s}^2$ durante $' + v.t1 + '\\ \\text{s}$ y luego sigue a velocidad constante $' + v.t2 + '\\ \\text{s}$. ¿Cuánto avanza en total?'; },
      function (v) { return v.ac * v.t1 * v.t1 / 2 + v.ac * v.t1 * v.t2; }, 'Primera etapa: $\\tfrac{1}{2}at_1^2$; segunda: $(at_1)t_2$.', { unit: 'm' }),
    N('ec-vmedia', 'ecuaciones', 1, { v0: [0, 15, 1], vf: [16, 40, 1] }, function (v) { return 'Con aceleración constante, un auto pasa de $' + v.v0 + '$ a $' + v.vf + '\\ \\text{m/s}$. ¿Cuál fue su velocidad media?'; },
      function (v) { return (v.v0 + v.vf) / 2; }, 'Con $a$ constante, la media es el promedio de la inicial y la final.', { unit: 'm/s' }),

    /* ---------------- Frenado ---------------- */
    N('fr-distancia', 'frenado', 1, { v0: [8, 35, 1], a: [2, 9, 0.5] }, function (v) { return 'Un auto a $' + v.v0 + '\\ \\text{m/s}$ frena con $' + v.a + '\\ \\text{m/s}^2$. ¿Qué distancia necesita para detenerse?'; },
      function (v) { return v.v0 * v.v0 / (2 * v.a); }, '$d = v_0^2/2a$.', { unit: 'm', mistakes: { noTwo: function (v) { return v.v0 * v.v0 / v.a; } }, feedback: fb('noTwo', 'Falta el 2 del denominador.') }),
    N('fr-tiempo', 'frenado', 1, { v0: [8, 35, 1], a: [2, 9, 0.5] }, function (v) { return 'Un camión a $' + v.v0 + '\\ \\text{m/s}$ frena con $' + v.a + '\\ \\text{m/s}^2$. ¿Cuánto tarda en detenerse?'; },
      function (v) { return v.v0 / v.a; }, '$0 = v_0 - at$.', { unit: 's' }),
    N('fr-a', 'frenado', 2, { v0: [8, 35, 1], d: [10, 150, 5] }, function (v) { return 'Un auto a $' + v.v0 + '\\ \\text{m/s}$ se detiene en $' + v.d + '\\ \\text{m}$. ¿Qué desaceleración tuvo (en magnitud)?'; },
      function (v) { return v.v0 * v.v0 / (2 * v.d); }, 'Despeja de $0 = v_0^2 - 2ad$.', { unit: 'm/s²', where: function (v) { return v.v0 * v.v0 / (2 * v.d) < 12; } }),
    N('fr-kmh', 'frenado', 2, { vk: [36, 126, 9], a: [3, 9, 0.5] }, function (v) { return 'Un auto va a $' + v.vk + '\\ \\text{km/h}$ y frena con $' + v.a + '\\ \\text{m/s}^2$. ¿Cuántos metros recorre hasta parar?'; },
      function (v) { return Math.pow(v.vk / 3.6, 2) / (2 * v.a); }, 'Pasa la rapidez a m/s antes de usar $v_0^2/2a$.', { unit: 'm', mistakes: { noConvert: function (v) { return v.vk * v.vk / (2 * v.a); } }, feedback: fb('noConvert', 'Usaste km/h con m/s²: divide entre 3.6 primero.') }),
    N('fr-reaccion', 'frenado', 3, { v0: [10, 30, 1], a: [4, 8, 0.5], tr: [0.5, 1.5, 0.1] }, function (v) { return 'Un conductor va a $' + v.v0 + '\\ \\text{m/s}$, tarda $' + v.tr + '\\ \\text{s}$ en reaccionar y luego frena con $' + v.a + '\\ \\text{m/s}^2$. ¿Qué distancia total recorre desde que ve el peligro hasta detenerse?'; },
      function (v) { return v.v0 * v.tr + v.v0 * v.v0 / (2 * v.a); }, 'Durante la reacción sigue a $v_0$; luego frena.', { unit: 'm', mistakes: { noReaction: function (v) { return v.v0 * v.v0 / (2 * v.a); } }, feedback: fb('noReaction', 'Falta lo que avanza durante el tiempo de reacción: $v_0 t_r$.') }),
    N('fr-doble', 'frenado', 1, {}, function () { return 'Si un auto va al doble de rapidez y frena con la misma desaceleración, ¿por qué factor se multiplica su distancia de frenado?'; },
      function () { return 4; }, '$d = v_0^2/2a$: la distancia va con el cuadrado.', { tol: { abs: 0.01 } }),
    N('fr-mitad', 'frenado', 3, { v0: [10, 40, 1] }, function (v) { return 'Un tren a $' + v.v0 + '\\ \\text{m/s}$ frena uniformemente. ¿Qué rapidez lleva cuando ha recorrido la mitad de su distancia de frenado?'; },
      function (v) { return v.v0 / Math.SQRT2; }, 'Con $v^2 = v_0^2 - 2a\\,(d/2)$ y $d = v_0^2/2a$: $v = v_0/\\sqrt{2}$.', { unit: 'm/s', mistakes: { half: function (v) { return v.v0 / 2; } }, feedback: fb('half', 'La mitad de la rapidez se alcanza a la mitad del tiempo, no de la distancia.') }),
    N('fr-v-dist', 'frenado', 2, { v0: [10, 35, 1], a: [2, 8, 0.5], d: [5, 60, 5] }, function (v) { return 'Un auto a $' + v.v0 + '\\ \\text{m/s}$ frena con $' + v.a + '\\ \\text{m/s}^2$. ¿Qué rapidez lleva después de recorrer $' + v.d + '\\ \\text{m}$?'; },
      function (v) { return Math.sqrt(v.v0 * v.v0 - 2 * v.a * v.d); }, '$v^2 = v_0^2 - 2ad$.', { unit: 'm/s', where: function (v) { return v.v0 * v.v0 - 2 * v.a * v.d > 4; } }),
    N('fr-t-dist', 'frenado', 2, { v0: [8, 35, 1], d: [10, 150, 5] }, function (v) { return 'Una bicicleta a $' + v.v0 + '\\ \\text{m/s}$ frena uniformemente y se detiene en $' + v.d + '\\ \\text{m}$. ¿Cuánto tardó?'; },
      function (v) { return 2 * v.d / v.v0; }, '$d = \\tfrac{1}{2}(v_0 + 0)\\,t$.', { unit: 's', mistakes: { noHalf: function (v) { return v.d / v.v0; } }, feedback: fb('noHalf', 'No frenó a $v_0$ todo el tiempo: su velocidad media es $v_0/2$.') }),

    /* ---------------- Caída libre ---------------- */
    N('ca-t', 'caida', 1, { h: [2, 90, 1] }, function (v) { return 'Sueltas una piedra desde $' + v.h + '\\ \\text{m}$. ¿Cuánto tarda en llegar al suelo?'; },
      function (v) { return Math.sqrt(2 * v.h / g); }, '$t = \\sqrt{2h/g}$.', { unit: 's', mistakes: { forgotTwo: function (v) { return Math.sqrt(v.h / g); }, noSqrt: function (v) { return 2 * v.h / g; } }, feedback: [{ when: 'forgotTwo', say: 'Falta el 2 dentro de la raíz.' }, { when: 'noSqrt', say: 'Ese es $t^2$: falta la raíz.' }] }),
    N('ca-v', 'caida', 1, { h: [2, 90, 1] }, function (v) { return 'Una maceta cae desde $' + v.h + '\\ \\text{m}$ partiendo del reposo. ¿Con qué rapidez llega al suelo?'; },
      function (v) { return Math.sqrt(2 * g * v.h); }, '$v = \\sqrt{2gh}$.', { unit: 'm/s', mistakes: { noTwo: function (v) { return Math.sqrt(g * v.h); } }, feedback: fb('noTwo', 'Falta el 2: $v^2 = 2gh$.') }),
    N('ca-h-t', 'caida', 1, { t: [0.5, 5, 0.5] }, function (v) { return 'Una piedra soltada tarda $' + v.t + '\\ \\text{s}$ en llegar al fondo de un barranco. ¿Qué profundidad tiene? (Ignora el tiempo del sonido.)'; },
      function (v) { return g * v.t * v.t / 2; }, '$h = \\tfrac{1}{2}gt^2$.', { unit: 'm', mistakes: { noHalf: function (v) { return g * v.t * v.t; } }, feedback: fb('noHalf', 'Falta el $\\tfrac{1}{2}$.') }),
    N('ca-v-t', 'caida', 2, { t: [0.5, 5, 0.5] }, function (v) { return 'Un objeto cae desde el reposo. ¿Qué rapidez tiene a los $' + v.t + '\\ \\text{s}$?'; },
      function (v) { return g * v.t; }, 'Gana $9.81$ m/s cada segundo: $v = gt$.', { unit: 'm/s' }),
    N('ca-h-v', 'caida', 2, { vv: [5, 40, 1] }, function (v) { return '¿Desde qué altura hay que soltar un objeto para que llegue al suelo a $' + v.vv + '\\ \\text{m/s}$?'; },
      function (v) { return v.vv * v.vv / (2 * g); }, '$h = v^2/2g$.', { unit: 'm', mistakes: { noTwo: function (v) { return v.vv * v.vv / g; } }, feedback: fb('noTwo', 'Falta el 2 del denominador.') }),
    N('ca-ultimo', 'caida', 3, { h: [20, 120, 5] }, function (v) { return 'Una piedra cae desde $' + v.h + '\\ \\text{m}$. ¿Cuántos metros recorre en su último segundo de caída?'; },
      function (v) { var t = Math.sqrt(2 * v.h / g); return v.h - g * (t - 1) * (t - 1) / 2; }, 'Calcula el tiempo total $T$ y resta a $h$ lo que había caído en $T - 1$.', { unit: 'm' }),
    N('ca-mitad', 'caida', 2, { h: [4, 90, 2] }, function (v) { return 'Un objeto se suelta desde $' + v.h + '\\ \\text{m}$. ¿Cuánto tarda en caer la primera mitad de esa altura?'; },
      function (v) { return Math.sqrt(v.h / g); }, 'Caer $h/2$: $\\tfrac{h}{2} = \\tfrac{1}{2}gt^2$.', { unit: 's', mistakes: { halfTime: function (v) { return Math.sqrt(2 * v.h / g) / 2; } }, feedback: fb('halfTime', 'Cae más lento al principio: la mitad de la altura toma más de la mitad del tiempo.') }),
    N('ca-dos-piedras', 'caida', 2, { t: [0.5, 4, 0.5] }, function (v) { return 'Sueltas una piedra y 1 s después otra desde el mismo punto. ¿A qué distancia están entre sí $' + v.t + '\\ \\text{s}$ después de soltar la segunda?'; },
      function (v) { return g * (v.t + 1) * (v.t + 1) / 2 - g * v.t * v.t / 2; }, 'Resta lo que cayó cada una: la primera lleva 1 s de ventaja.', { unit: 'm' }),
    N('ca-luna', 'caida', 2, { h: [1, 20, 1] }, function (v) { return 'En la Luna ($g = 1.62\\ \\text{m/s}^2$) un astronauta suelta una herramienta desde $' + v.h + '\\ \\text{m}$. ¿Cuánto tarda en caer?'; },
      function (v) { return Math.sqrt(2 * v.h / 1.62); }, 'Misma fórmula con otra $g$.', { unit: 's' }),
    N('ca-y-t', 'caida', 2, { h: [20, 100, 5], t: [0.5, 2, 0.5] }, function (v) { return 'Una piedra se suelta desde $' + v.h + '\\ \\text{m}$ de altura. ¿A qué altura sobre el suelo está a los $' + v.t + '\\ \\text{s}$?'; },
      function (v) { return v.h - g * v.t * v.t / 2; }, '$y = h - \\tfrac{1}{2}gt^2$.', { unit: 'm', mistakes: { fallen: function (v) { return g * v.t * v.t / 2; } }, feedback: fb('fallen', 'Eso es lo que ha caído; la altura es $h$ menos eso.') }),
    N('ca-marte', 'caida', 2, { h: [2, 50, 1] }, function (v) { return 'En Marte ($g = 3.71\\ \\text{m/s}^2$) un robot deja caer una roca desde $' + v.h + '\\ \\text{m}$. ¿Con qué rapidez llega al suelo?'; },
      function (v) { return Math.sqrt(2 * 3.71 * v.h); }, '$v = \\sqrt{2gh}$ con la $g$ de Marte.', { unit: 'm/s' }),

    /* ---------------- Tiro vertical ---------------- */
    N('vt-H', 'vertical', 1, { v0: [5, 30, 1] }, function (v) { return 'Lanzas una pelota hacia arriba a $' + v.v0 + '\\ \\text{m/s}$. ¿Qué altura sube sobre tu mano?'; },
      function (v) { return v.v0 * v.v0 / (2 * g); }, '$H = v_0^2/2g$.', { unit: 'm', mistakes: { noTwo: function (v) { return v.v0 * v.v0 / g; } }, feedback: fb('noTwo', 'Falta el 2 del denominador.') }),
    N('vt-tsub', 'vertical', 2, { v0: [5, 30, 1] }, function (v) { return 'Una pelota sale hacia arriba a $' + v.v0 + '\\ \\text{m/s}$. ¿Cuánto tarda en llegar a lo más alto?'; },
      function (v) { return v.v0 / g; }, 'En la cima $v = 0$: $t = v_0/g$.', { unit: 's' }),
    N('vt-T', 'vertical', 1, { v0: [5, 30, 1] }, function (v) { return 'Lanzas una llave hacia arriba a $' + v.v0 + '\\ \\text{m/s}$ y la atrapas a la misma altura. ¿Cuánto tiempo estuvo en el aire?'; },
      function (v) { return 2 * v.v0 / g; }, 'Sube y baja en el mismo tiempo: $T = 2v_0/g$.', { unit: 's', mistakes: { onlyUp: function (v) { return v.v0 / g; } }, feedback: fb('onlyUp', 'Ese es solo el tiempo de subida.') }),
    N('vt-v0-H', 'vertical', 2, { H: [1, 40, 1] }, function (v) { return '¿Con qué rapidez hay que lanzar una pelota hacia arriba para que suba $' + v.H + '\\ \\text{m}$?'; },
      function (v) { return Math.sqrt(2 * g * v.H); }, '$v_0 = \\sqrt{2gH}$.', { unit: 'm/s' }),
    N('vt-v0-T', 'vertical', 2, { Tv: [1, 6, 0.5] }, function (v) { return 'Una pelota lanzada hacia arriba vuelve a tu mano $' + v.Tv + '\\ \\text{s}$ después. ¿Con qué rapidez la lanzaste?'; },
      function (v) { return g * v.Tv / 2; }, '$T = 2v_0/g$.', { unit: 'm/s', mistakes: { noHalf: function (v) { return g * v.Tv; } }, feedback: fb('noHalf', 'La mitad del tiempo sube y la otra mitad baja: $v_0 = gT/2$.') }),
    N('vt-y-t', 'vertical', 2, { v0: [10, 30, 1], t: [0.5, 4, 0.5] }, function (v) { return 'Un cohete de agua sale hacia arriba a $' + v.v0 + '\\ \\text{m/s}$. ¿A qué altura está a los $' + v.t + '\\ \\text{s}$?'; },
      function (v) { return v.v0 * v.t - g * v.t * v.t / 2; }, '$y = v_0t - \\tfrac{1}{2}gt^2$.', { unit: 'm', where: function (v) { return v.t < 1.9 * v.v0 / g; }, mistakes: { plusG: function (v) { return v.v0 * v.t + g * v.t * v.t / 2; } }, feedback: fb('plusG', 'Con el eje hacia arriba la gravedad resta: $-\\tfrac{1}{2}gt^2$.') }),
    N('vt-v-t', 'vertical', 2, { v0: [5, 30, 1], t: [0.5, 4, 0.5] }, function (v) { return 'Una pelota sale hacia arriba a $' + v.v0 + '\\ \\text{m/s}$. ¿Cuánto vale su velocidad a los $' + v.t + '\\ \\text{s}$? (Positiva hacia arriba.)'; },
      function (v) { return v.v0 - g * v.t; }, '$v = v_0 - gt$: se vuelve negativa al bajar.', { unit: 'm/s', tol: EX, where: function (v) { return Math.abs(v.v0 - g * v.t) > 0.5 && v.t < 2 * v.v0 / g; } }),
    N('vt-v-h', 'vertical', 2, { v0: [10, 30, 1], h: [1, 30, 1] }, function (v) { return 'Una pelota sale hacia arriba a $' + v.v0 + '\\ \\text{m/s}$. ¿Qué rapidez tiene al pasar por $' + v.h + '\\ \\text{m}$ de altura?'; },
      function (v) { return Math.sqrt(v.v0 * v.v0 - 2 * g * v.h); }, '$v^2 = v_0^2 - 2gh$: la misma al subir y al bajar.', { unit: 'm/s', where: function (v) { return v.v0 * v.v0 - 2 * g * v.h > 4; } }),
    N('vt-t-bajando', 'vertical', 3, { v0: [10, 30, 1], h: [1, 30, 1] }, function (v) { return 'Lanzas una pelota hacia arriba a $' + v.v0 + '\\ \\text{m/s}$. ¿En qué instante pasa por $' + v.h + '\\ \\text{m}$ de altura, ya de bajada?'; },
      function (v) { return (v.v0 + Math.sqrt(v.v0 * v.v0 - 2 * g * v.h)) / g; }, 'De las dos raíces de $h = v_0t - \\tfrac{1}{2}gt^2$, la mayor es la de bajada.', { unit: 's', where: function (v) { return v.v0 * v.v0 - 2 * g * v.h > 4; } }),
    N('vt-t-subiendo', 'vertical', 3, { v0: [10, 30, 1], h: [1, 30, 1] }, function (v) { return 'Una pelota sale hacia arriba a $' + v.v0 + '\\ \\text{m/s}$. ¿En qué instante pasa por primera vez a $' + v.h + '\\ \\text{m}$ de altura?'; },
      function (v) { return (v.v0 - Math.sqrt(v.v0 * v.v0 - 2 * g * v.h)) / g; }, 'La raíz menor de $h = v_0t - \\tfrac{1}{2}gt^2$ es la de subida.', { unit: 's', where: function (v) { return v.v0 * v.v0 - 2 * g * v.h > 4; } }),
    N('vt-doble', 'vertical', 1, {}, function () { return 'Si lanzas una pelota hacia arriba con el doble de rapidez, ¿por qué factor se multiplica la altura que alcanza?'; },
      function () { return 4; }, '$H \\propto v_0^2$.', { tol: { abs: 0.01 } }),
    N('vt-arriba-de', 'vertical', 3, { v0: [10, 30, 1], h: [1, 30, 1] }, function (v) { return 'Lanzas un balón hacia arriba a $' + v.v0 + '\\ \\text{m/s}$. ¿Cuánto tiempo pasa por encima de $' + v.h + '\\ \\text{m}$ de altura?'; },
      function (v) { return 2 * Math.sqrt(v.v0 * v.v0 - 2 * g * v.h) / g; }, 'Es la diferencia entre las dos raíces de $h = v_0t - \\tfrac{1}{2}gt^2$.', { unit: 's', where: function (v) { return v.v0 * v.v0 - 2 * g * v.h > 4; } }),

    /* ---------------- Lanzamientos desde una altura ---------------- */
    N('al-T', 'altura', 2, { v0: [5, 20, 1], h0: [5, 50, 1] }, function (v) { return 'Desde una azotea de $' + v.h0 + '\\ \\text{m}$ lanzas una piedra hacia arriba a $' + v.v0 + '\\ \\text{m/s}$. ¿Cuánto tarda en llegar al suelo?'; },
      function (v) { return tGround(v.v0, v.h0); }, 'Resuelve $0 = h_0 + v_0t - \\tfrac{1}{2}gt^2$ y toma la raíz positiva.', { unit: 's', mistakes: { ignoredH0: function (v) { return 2 * v.v0 / g; } }, feedback: fb('ignoredH0', 'Ese es el tiempo para volver a la azotea; todavía le falta caer $h_0$.') }),
    N('al-v', 'altura', 2, { v0: [5, 20, 1], h0: [5, 50, 1] }, function (v) { return 'Una pelota se lanza hacia arriba a $' + v.v0 + '\\ \\text{m/s}$ desde $' + v.h0 + '\\ \\text{m}$ de altura. ¿Con qué rapidez llega al suelo?'; },
      function (v) { return Math.sqrt(v.v0 * v.v0 + 2 * g * v.h0); }, '$v^2 = v_0^2 + 2gh_0$.', { unit: 'm/s', mistakes: { ignoredV0: function (v) { return Math.sqrt(2 * g * v.h0); } }, feedback: fb('ignoredV0', 'Así llegaría si la soltaras; salió con $v_0$.') }),
    N('al-H', 'altura', 1, { v0: [5, 20, 1], h0: [5, 50, 1] }, function (v) { return 'Desde un balcón a $' + v.h0 + '\\ \\text{m}$ lanzas una pelota hacia arriba a $' + v.v0 + '\\ \\text{m/s}$. ¿A qué altura sobre el suelo llega en la cima?'; },
      function (v) { return v.h0 + v.v0 * v.v0 / (2 * g); }, 'Altura del balcón más lo que sube.', { unit: 'm', mistakes: { noH0: function (v) { return v.v0 * v.v0 / (2 * g); } }, feedback: fb('noH0', 'Eso es lo que sube sobre el balcón; súmale la altura del balcón.') }),
    N('al-abajo-t', 'altura', 3, { vd: [2, 15, 1], h0: [5, 50, 1] }, function (v) { return 'Desde $' + v.h0 + '\\ \\text{m}$ lanzas una piedra verticalmente hacia abajo a $' + v.vd + '\\ \\text{m/s}$. ¿Cuánto tarda en llegar al suelo?'; },
      function (v) { return (-v.vd + Math.sqrt(v.vd * v.vd + 2 * g * v.h0)) / g; }, 'Con $v_0 = -v_d$: $0 = h_0 - v_dt - \\tfrac{1}{2}gt^2$.', { unit: 's', mistakes: { dropped: function (v) { return Math.sqrt(2 * v.h0 / g); } }, feedback: fb('dropped', 'Ese es el tiempo si la soltaras; al lanzarla hacia abajo tarda menos.') }),
    N('al-abajo-v', 'altura', 2, { vd: [2, 15, 1], h0: [5, 50, 1] }, function (v) { return 'Desde $' + v.h0 + '\\ \\text{m}$ lanzas una piedra hacia abajo a $' + v.vd + '\\ \\text{m/s}$. ¿Con qué rapidez llega al suelo?'; },
      function (v) { return Math.sqrt(v.vd * v.vd + 2 * g * v.h0); }, '$v^2 = v_0^2 + 2gh_0$; el signo de $v_0$ no importa al elevar al cuadrado.', { unit: 'm/s' }),
    N('al-globo', 'altura', 3, { u: [1, 8, 1], hb: [10, 80, 5] }, function (v) { return 'Un globo sube a $' + v.u + '\\ \\text{m/s}$ y, a $' + v.hb + '\\ \\text{m}$ de altura, suelta un saco de arena. ¿Cuánto tarda el saco en llegar al suelo?'; },
      function (v) { return tGround(v.u, v.hb); }, 'El saco sale con la velocidad del globo, $+u$: primero sube un poco.', { unit: 's', mistakes: { fromRest: function (v) { return Math.sqrt(2 * v.hb / g); } }, feedback: fb('fromRest', 'El saco no sale del reposo: tiene la velocidad del globo hacia arriba.') }),
    N('al-cruce', 'altura', 3, { v0: [10, 30, 1], h: [5, 40, 1] }, function (v) { return 'Al mismo tiempo, desde el suelo lanzas una pelota hacia arriba a $' + v.v0 + '\\ \\text{m/s}$ y desde $' + v.h + '\\ \\text{m}$ sueltas otra justo encima. ¿En qué instante se cruzan?'; },
      function (v) { return v.h / v.v0; }, 'Iguala $v_0t - \\tfrac{1}{2}gt^2 = h - \\tfrac{1}{2}gt^2$: la gravedad se cancela.', { unit: 's' }),
    N('al-y-t', 'altura', 2, { v0: [5, 20, 1], h0: [5, 50, 1], t: [0.5, 2, 0.5] }, function (v) { return 'Desde $' + v.h0 + '\\ \\text{m}$ lanzas una pelota hacia arriba a $' + v.v0 + '\\ \\text{m/s}$. ¿A qué altura sobre el suelo está a los $' + v.t + '\\ \\text{s}$?'; },
      function (v) { return v.h0 + v.v0 * v.t - g * v.t * v.t / 2; }, '$y = h_0 + v_0t - \\tfrac{1}{2}gt^2$.', { unit: 'm', where: function (v) { return v.t < tGround(v.v0, v.h0); } }),

    N('al-regresa', 'altura', 2, { v0: [5, 20, 1], h0: [5, 50, 1] }, function (v) { return 'Desde una azotea de $' + v.h0 + '\\ \\text{m}$ lanzas una pelota hacia arriba a $' + v.v0 + '\\ \\text{m/s}$. ¿Cuánto tarda en volver a pasar por la altura de la azotea?'; },
      function (v) { return 2 * v.v0 / g; }, 'Hasta regresar al nivel de salida es un tiro simétrico: $2v_0/g$, sin importar $h_0$.', { unit: 's', mistakes: { toGround: function (v) { return tGround(v.v0, v.h0); } }, feedback: fb('toGround', 'Ese es el tiempo hasta el suelo; se pide cuando pasa por la azotea.') }),
    N('ca-rapidez-media', 'caida', 2, { h: [2, 90, 1] }, function (v) { return 'Una piedra cae $' + v.h + '\\ \\text{m}$ desde el reposo. ¿Cuál es su rapidez media durante la caída?'; },
      function (v) { return v.h / Math.sqrt(2 * v.h / g); }, 'Distancia entre tiempo; también es la mitad de la rapidez final.', { unit: 'm/s', mistakes: { finalV: function (v) { return Math.sqrt(2 * g * v.h); } }, feedback: fb('finalV', 'Esa es la rapidez al llegar; la media es la mitad.') }),

    /* ---------------- Conceptuales ---------------- */
    C('k-mrua', 'ecuaciones', 1, 'En el MRUA…', 'la aceleración es constante', [['la velocidad es constante'], ['la posición es constante'], ['la aceleración crece']], 'Uniformemente acelerado.'),
    C('k-vt', 'ecuaciones', 1, 'La gráfica $v$-$t$ de un MRUA es…', 'una recta', [['una parábola'], ['una línea horizontal siempre'], ['una curva exponencial']], '$v = v_0 + at$ es lineal en $t$.'),
    C('k-xt', 'ecuaciones', 2, 'La gráfica $x$-$t$ de un MRUA con $a \\ne 0$ es…', 'una parábola', [['una recta'], ['una línea horizontal'], ['una hipérbola']], '$x = x_0 + v_0t + \\tfrac{1}{2}at^2$ es cuadrática.'),
    C('k-sin-t', 'ecuaciones', 2, 'Si no te dan el tiempo ni te lo piden, conviene usar…', '$v^2 = v_0^2 + 2a\\,\\Delta x$', [['$v = v_0 + at$'], ['$x = x_0 + v_0t + \\tfrac{1}{2}at^2$'], ['$\\Delta x = vt$']], 'Es la única de las cuatro sin $t$.'),
    C('k-sin-a', 'ecuaciones', 3, 'Si no te dan la aceleración ni te la piden, conviene usar…', '$\\Delta x = \\tfrac{1}{2}(v_0 + v)\\,t$', [['$v^2 = v_0^2 + 2a\\,\\Delta x$'], ['$v = v_0 + at$'], ['$x = x_0 + v_0t + \\tfrac{1}{2}at^2$']], 'Es la única sin $a$.'),
    C('k-reposo', 'ecuaciones', 1, '"Parte del reposo" significa…', '$v_0 = 0$', [['$a = 0$'], ['$x_0 = 0$'], ['$v = 0$ todo el tiempo']], 'Empieza detenido.'),
    C('k-raices', 'ecuaciones', 2, 'Al despejar $t$ de una cuadrática sale un tiempo negativo y uno positivo. ¿Qué haces?', 'Descarto el negativo: el movimiento empieza en $t = 0$', [['Me quedo con los dos'], ['Uso el negativo, porque es el primero'], ['Promedio los dos']], 'Un tiempo negativo describe un instante antes del lanzamiento.'),
    C('k-frena-signo', 'ecuaciones', 2, 'Si la aceleración apunta en sentido contrario a la velocidad, el objeto…', 'frena', [['acelera'], ['se detiene al instante'], ['va a velocidad constante']], 'La aceleración le quita rapidez.'),
    C('k-media', 'ecuaciones', 2, 'Con aceleración constante, la velocidad media entre dos instantes es…', 'el promedio de la velocidad inicial y la final', [['la velocidad final'], ['la velocidad a la mitad de la distancia'], ['cero']], 'Porque $v$ crece en línea recta con el tiempo.'),
    C('k-doble-t', 'ecuaciones', 3, 'Desde el reposo con aceleración constante, en el doble de tiempo el objeto recorre…', 'cuatro veces la distancia', [['el doble de distancia'], ['la misma distancia'], ['ocho veces la distancia']], '$x = \\tfrac{1}{2}at^2$.'),
    C('k-frenar-a', 'frenado', 1, 'Un auto que va hacia $+x$ y frena tiene aceleración…', 'negativa', [['positiva'], ['cero'], ['igual a su velocidad']], 'Apunta en contra del movimiento.'),
    C('k-frenado-doble', 'frenado', 2, 'Si vas al doble de rapidez, tu distancia de frenado (con la misma desaceleración) es…', 'cuatro veces mayor', [['el doble'], ['la misma'], ['la mitad']], '$d = v_0^2/2a$.'),
    C('k-reaccion', 'frenado', 2, 'Durante el tiempo de reacción del conductor, el auto…', 'sigue a velocidad constante', [['ya empezó a frenar'], ['está detenido'], ['acelera']], 'Todavía no pisa el freno.'),
    C('k-mas-freno', 'frenado', 1, 'Con una desaceleración mayor, la distancia de frenado…', 'es menor', [['es mayor'], ['no cambia'], ['depende solo de la masa']], '$d = v_0^2/2a$.'),
    C('k-detenerse', 'frenado', 1, 'En el instante en que un auto se detiene…', '$v = 0$', [['$a = 0$'], ['$x = 0$'], ['$t = 0$']], 'Por eso se usa $v = 0$ como condición final.'),
    C('k-mitad-dist', 'frenado', 3, 'A la mitad de su distancia de frenado, un auto lleva…', 'más de la mitad de su rapidez inicial', [['exactamente la mitad de su rapidez inicial'], ['menos de la mitad'], ['la rapidez inicial']], 'Recorre más metros cuando va rápido: $v = v_0/\\sqrt{2}$.'),
    C('k-vt-frenado', 'frenado', 2, 'En la gráfica $v$-$t$ de un frenado uniforme, la recta…', 'baja hasta tocar $v = 0$', [['sube'], ['es horizontal'], ['baja y sigue por debajo del eje']], 'Cuando llega a cero, el auto ya no se mueve.'),
    C('k-frenado-tiempo', 'frenado', 3, 'Si vas al doble de rapidez, el tiempo que tardas en frenar (misma desaceleración)…', 'se duplica', [['se cuadruplica'], ['no cambia'], ['se reduce a la mitad']], '$t = v_0/a$ es lineal en $v_0$.'),
    C('k-masa', 'caida', 1, 'Sin aire, sueltas al mismo tiempo una piedra pesada y una ligera desde la misma altura. ¿Cuál llega primero?', 'Llegan juntas', [['La pesada'], ['La ligera'], ['Depende de la altura']], 'La aceleración de caída no depende de la masa.'),
    C('k-g', 'caida', 1, 'Cerca de la superficie de la Tierra, $g$ vale aproximadamente…', '$9.81\\ \\text{m/s}^2$', [['$9.81\\ \\text{m/s}$'], ['$98.1\\ \\text{m/s}^2$'], ['$1\\ \\text{m/s}^2$']], 'Es una aceleración: m/s².'),
    C('k-signo-g', 'caida', 1, 'Con el eje $y$ hacia arriba, la aceleración de caída libre es…', '$-g$', [['$+g$'], ['0'], ['$-g$ solo al bajar']], 'Siempre hacia abajo.'),
    C('k-soltar', 'caida', 2, '"Se suelta" desde cierta altura significa…', '$v_0 = 0$', [['$a = 0$'], ['$v_0 = g$'], ['que se lanza hacia abajo']], 'No se le da ninguna velocidad.'),
    C('k-crece', 'caida', 2, 'En caída libre, la rapidez aumenta…', 'unos 9.81 m/s cada segundo', [['9.81 m cada segundo'], ['al doble cada segundo'], ['lo mismo que la altura']], 'Eso significa $a = 9.81\\ \\text{m/s}^2$.'),
    C('k-distancias', 'caida', 2, 'En caída libre, la distancia que cae en cada segundo…', 'es mayor cada segundo', [['es la misma cada segundo'], ['es menor cada segundo'], ['es cero en el primer segundo']], 'Va cada vez más rápido.'),
    C('k-pluma', 'caida', 2, 'En la Luna, sin aire, un astronauta suelta un martillo y una pluma. ¿Qué pasa?', 'Caen juntos', [['El martillo llega primero'], ['La pluma flota'], ['La pluma llega primero']], 'Sin aire, todo cae con la misma $g$.'),
    C('k-cuadruple', 'caida', 3, 'Para caer desde el cuádruple de altura, un objeto tarda…', 'el doble', [['el cuádruple'], ['lo mismo'], ['la mitad']], '$t = \\sqrt{2h/g}$.'),
    C('k-v-doble-h', 'caida', 3, 'Si sueltas un objeto desde el doble de altura, llega al suelo con…', '$\\sqrt{2}$ veces la rapidez', [['el doble de rapidez'], ['cuatro veces la rapidez'], ['la misma rapidez']], '$v = \\sqrt{2gh}$.'),
    C('k-aire', 'caida', 2, 'En la realidad, con aire, una hoja de papel extendida cae…', 'más lento que una piedra', [['igual que una piedra'], ['más rápido que una piedra'], ['hacia arriba']], 'El aire la frena mucho: este curso lo ignora.'),
    C('k-cima-v', 'vertical', 1, 'En la cima de un tiro vertical, la velocidad es…', 'cero', [['$-g$'], ['máxima'], ['igual a $v_0$']], 'Deja de subir y aún no baja.'),
    C('k-cima-a', 'vertical', 1, 'En la cima de un tiro vertical, la aceleración es…', '$-g$', [['cero'], ['$+g$'], ['$-v_0$']], 'La gravedad no se apaga en la cima.'),
    C('k-simetria-t', 'vertical', 1, 'Si la pelota regresa a la altura de donde salió, el tiempo de subida comparado con el de bajada es…', 'igual', [['mayor'], ['menor'], ['el doble']], 'El movimiento es simétrico.'),
    C('k-simetria-v', 'vertical', 2, 'Al regresar a tu mano, una pelota lanzada hacia arriba tiene…', 'la misma rapidez con la que salió, hacia abajo', [['más rapidez que al salir'], ['menos rapidez que al salir'], ['rapidez cero']], '$v^2 = v_0^2 - 2g(0)$.'),
    C('k-subiendo', 'vertical', 1, 'Mientras sube, la rapidez de una pelota lanzada hacia arriba…', 'disminuye', [['aumenta'], ['es constante'], ['es cero']], 'La gravedad apunta en contra.'),
    C('k-y-parabola', 'vertical', 2, 'La gráfica $y$-$t$ de un tiro vertical es…', 'una parábola que abre hacia abajo', [['una recta'], ['una parábola que abre hacia arriba'], ['una línea horizontal']], '$y = v_0t - \\tfrac{1}{2}gt^2$.'),
    C('k-v-recta', 'vertical', 2, 'La gráfica $v$-$t$ de un tiro vertical es…', 'una recta con pendiente $-g$', [['una parábola'], ['una recta horizontal'], ['una recta con pendiente $+g$']], '$v = v_0 - gt$.'),
    C('k-misma-altura', 'vertical', 2, 'Al pasar por la misma altura de subida y de bajada, la pelota tiene…', 'la misma rapidez, en sentidos opuestos', [['la misma velocidad'], ['más rapidez al bajar'], ['más rapidez al subir']], 'La ecuación $v^2 = v_0^2 - 2gh$ da el mismo valor.'),
    C('k-doble-v0-t', 'vertical', 2, 'Si duplicas $v_0$ en un tiro vertical, el tiempo que la pelota pasa en el aire…', 'se duplica', [['se cuadruplica'], ['no cambia'], ['aumenta $\\sqrt{2}$ veces']], '$T = 2v_0/g$.'),
    C('k-doble-v0-h', 'vertical', 3, 'Una pelota lanzada a $v_0$ sube $H$. Para que suba $2H$ hay que lanzarla a…', '$\\sqrt{2}\\,v_0$', [['$2v_0$'], ['$4v_0$'], ['$v_0/2$']], '$H \\propto v_0^2$.'),
    C('k-azotea', 'altura', 2, 'Si lanzas una piedra hacia arriba desde una azotea, ¿sirve $T = 2v_0/g$ para saber cuándo llega al suelo?', 'No: esa es solo hasta volver a la altura de la azotea', [['Sí, siempre'], ['Sí, si la azotea es baja'], ['No: hay que usar $T = v_0/g$']], 'Después aún le falta caer desde la azotea.'),
    C('k-arriba-abajo', 'altura', 3, 'Desde una azotea lanzas una piedra hacia arriba y otra hacia abajo, con la misma rapidez. ¿Cuál llega al suelo más rápido (mayor rapidez)?', 'Llegan con la misma rapidez', [['La que lanzaste hacia abajo'], ['La que lanzaste hacia arriba'], ['Depende de la altura']], '$v^2 = v_0^2 + 2gh_0$: el signo de $v_0$ no importa.'),
    C('k-arriba-abajo-t', 'altura', 2, 'En la misma situación, ¿cuál tarda más en llegar al suelo?', 'La que lanzaste hacia arriba', [['La que lanzaste hacia abajo'], ['Tardan lo mismo'], ['Depende de la masa']], 'Primero sube y baja; luego hace el mismo recorrido que la otra.'),
    C('k-abajo-signo', 'altura', 1, 'Con el eje $y$ hacia arriba, lanzar algo hacia abajo significa…', '$v_0 < 0$', [['$v_0 > 0$'], ['$a > 0$'], ['$v_0 = 0$']], 'El signo de $v_0$ da su sentido.'),
    C('k-globo', 'altura', 3, 'Un globo sube a velocidad constante y suelta un saco. Justo después de soltarlo, el saco…', 'sigue subiendo un poco y luego cae', [['cae de inmediato desde el reposo'], ['sube para siempre'], ['queda flotando']], 'Sale con la velocidad del globo hacia arriba.'),
    C('k-y-cero', 'altura', 1, 'Si el suelo es $y = 0$, el objeto llega al suelo cuando…', '$y(t) = 0$', [['$v(t) = 0$'], ['$a = 0$'], ['$t = v_0/g$']], 'Se iguala la posición a cero.'),
    C('k-cuadratica', 'altura', 2, 'Para saber cuándo llega al suelo algo lanzado hacia arriba desde una altura, hay que…', 'resolver una ecuación cuadrática en $t$', [['dividir la altura entre $g$'], ['usar $t = v_0/g$'], ['multiplicar $v_0$ por $g$']], '$0 = h_0 + v_0t - \\tfrac{1}{2}gt^2$.')
  ];

  K.register({
    'f1.S05.ecuaciones': 'Ecuaciones del MRUA',
    'f1.S05.frenado': 'Arranque y frenado',
    'f1.S05.caida': 'Caída libre',
    'f1.S05.vertical': 'Tiro vertical',
    'f1.S05.altura': 'Lanzamientos desde una altura'
  }, Q);
})();
