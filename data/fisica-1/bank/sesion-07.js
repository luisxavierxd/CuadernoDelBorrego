/* =====================================================================
   Banco · Física 1 · S07 · Movimiento circular y relativo. 100 preguntas propias.
   g = 9.81 m/s², SI.
   ===================================================================== */
(function () {
  var K = window.CBBankKit('f1', '07'), C = K.C;
  var g = 9.81, TAU = 2 * Math.PI, DEG = 180 / Math.PI;
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
  var ANG = { abs: 0.5 };

  var Q = [
    /* ---------------- Cinemática angular ---------------- */
    N('an-rpm', 'angular', 1, { rpm: [30, 3000, 30] }, function (v) { return 'Un motor gira a $' + v.rpm + '$ rpm. ¿Cuánto vale su rapidez angular en rad/s?'; },
      function (v) { return v.rpm * TAU / 60; }, 'Cada vuelta son $2\\pi$ rad y cada minuto 60 s.', { unit: 'rad/s', mistakes: { no2pi: function (v) { return v.rpm / 60; } }, feedback: fb('no2pi', 'Eso son vueltas por segundo; multiplica por $2\\pi$ rad por vuelta.') }),
    N('an-T-rpm', 'angular', 1, { rpm: [30, 3000, 30] }, function (v) { return 'Un ventilador gira a $' + v.rpm + '$ rpm. ¿Cuánto tarda en dar una vuelta?'; },
      function (v) { return 60 / v.rpm; }, 'Da rpm vueltas en 60 s: $T = 60/\\text{rpm}$.', { unit: 's' }),
    N('an-w-T', 'angular', 1, { T: [0.2, 20, 0.2] }, function (v) { return 'Un carrusel da una vuelta cada $' + v.T + '\\ \\text{s}$. ¿Cuál es su rapidez angular?'; },
      function (v) { return TAU / v.T; }, '$\\omega = 2\\pi/T$.', { unit: 'rad/s', mistakes: { invT: function (v) { return 1 / v.T; } }, feedback: fb('invT', 'Esa es la frecuencia en vueltas por segundo; $\\omega = 2\\pi f$.') }),
    N('an-f', 'angular', 2, { Tp: [0.1, 10, 0.1] }, function (v) { return 'Un péndulo cónico da una vuelta cada $' + v.Tp + '\\ \\text{s}$. ¿Cuál es su frecuencia en hertz?'; },
      function (v) { return 1 / v.Tp; }, '$f = 1/T$.', { unit: 'Hz' }),
    N('an-rad', 'angular', 2, { deg: [10, 350, 10] }, function (v) { return '¿Cuántos radianes son $' + v.deg + '^\\circ$?'; },
      function (v) { return v.deg * Math.PI / 180; }, 'Multiplica por $\\pi/180$.', { unit: 'rad', tol: { abs: 0.005 } }),
    N('an-vueltas', 'angular', 2, { w: [1, 30, 1], t: [2, 60, 1] }, function (v) { return 'Una rueda gira a $' + v.w + '\\ \\text{rad/s}$ durante $' + v.t + '\\ \\text{s}$. ¿Cuántas vueltas da?'; },
      function (v) { return v.w * v.t / TAU; }, 'Ángulo $\\omega t$ en rad; divide entre $2\\pi$ para vueltas.', { mistakes: { radians: function (v) { return v.w * v.t; } }, feedback: fb('radians', 'Eso son radianes; cada vuelta son $2\\pi$ rad.') }),
    N('an-theta', 'angular', 2, { w: [1, 30, 1], t: [2, 60, 1] }, function (v) { return 'Un disco gira a $' + v.w + '\\ \\text{rad/s}$. ¿Qué ángulo recorre en $' + v.t + '\\ \\text{s}$ (en rad)?'; },
      function (v) { return v.w * v.t; }, '$\\theta = \\omega t$.', { unit: 'rad' }),
    N('an-a-rpm', 'angular', 2, { w: [1, 300, 1] }, function (v) { return 'Un motor gira a $' + v.w + '\\ \\text{rad/s}$. ¿Cuántas rpm son?'; },
      function (v) { return v.w * 60 / TAU; }, 'Divide entre $2\\pi$ (vueltas) y multiplica por 60 (minutos).', { unit: 'rpm' }),
    N('an-minutero', 'angular', 2, {}, function () { return '¿Cuál es la rapidez angular del minutero de un reloj, en rad/s?'; },
      function () { return TAU / 3600; }, 'Da una vuelta por hora: $2\\pi/3600$.', { unit: 'rad/s' }),
    N('an-tierra', 'angular', 2, {}, function () { return '¿Cuál es la rapidez angular de la Tierra al girar sobre su eje (una vuelta por día), en rad/s?'; },
      function () { return TAU / 86400; }, '$2\\pi/86\\,400\\ \\text{s} \\approx 7.27\\times 10^{-5}$ rad/s.', { unit: 'rad/s' }),
    N('an-hz-rpm', 'angular', 2, { f: [0.5, 50, 0.5] }, function (v) { return 'Un rotor gira a $' + v.f + '\\ \\text{Hz}$. ¿Cuántas rpm son?'; },
      function (v) { return v.f * 60; }, 'Vueltas por segundo por 60.', { unit: 'rpm' }),

    /* ---------------- Rapidez lineal ---------------- */
    N('li-v', 'lineal', 1, { w: [0.5, 20, 0.5], r: [0.1, 5, 0.1] }, function (v) { return 'Un punto a $' + v.r + '\\ \\text{m}$ del eje gira a $' + v.w + '\\ \\text{rad/s}$. ¿Qué rapidez tiene?'; },
      function (v) { return v.w * v.r; }, '$v = \\omega r$.', { unit: 'm/s' }),
    N('li-v-rpm', 'lineal', 2, { rpm: [30, 1200, 30], r: [0.05, 0.6, 0.05] }, function (v) { return 'Una polea de $' + v.r + '\\ \\text{m}$ de radio gira a $' + v.rpm + '$ rpm. ¿A qué rapidez se mueve su borde?'; },
      function (v) { return v.rpm * TAU / 60 * v.r; }, 'Pasa rpm a rad/s y usa $v = \\omega r$.', { unit: 'm/s', mistakes: { no2pi: function (v) { return v.rpm / 60 * v.r; } }, feedback: fb('no2pi', 'Te faltó el $2\\pi$ al pasar de rpm a rad/s.') }),
    N('li-v-T', 'lineal', 1, { r: [0.5, 20, 0.5], T: [1, 30, 1] }, function (v) { return 'Un carrito da una vuelta a una pista circular de $' + v.r + '\\ \\text{m}$ de radio cada $' + v.T + '\\ \\text{s}$. ¿Cuál es su rapidez?'; },
      function (v) { return TAU * v.r / v.T; }, 'Circunferencia entre periodo: $2\\pi r/T$.', { unit: 'm/s', mistakes: { rOverT: function (v) { return v.r / v.T; } }, feedback: fb('rOverT', 'En una vuelta recorre la circunferencia, $2\\pi r$, no el radio.') }),
    N('li-arco', 'lineal', 2, { r: [0.5, 10, 0.5], deg: [15, 330, 15] }, function (v) { return 'Una partícula recorre $' + v.deg + '^\\circ$ de un círculo de $' + v.r + '\\ \\text{m}$ de radio. ¿Qué longitud de arco recorre?'; },
      function (v) { return v.r * v.deg * Math.PI / 180; }, '$s = r\\theta$ con $\\theta$ en radianes.', { unit: 'm', mistakes: { degrees: function (v) { return v.r * v.deg; } }, feedback: fb('degrees', 'Usaste el ángulo en grados; $s = r\\theta$ exige radianes.') }),
    N('li-w-v', 'lineal', 2, { vv: [1, 30, 1], r: [0.5, 10, 0.5] }, function (v) { return 'Un auto recorre una glorieta de $' + v.r + '\\ \\text{m}$ de radio a $' + v.vv + '\\ \\text{m/s}$. ¿Cuál es su rapidez angular?'; },
      function (v) { return v.vv / v.r; }, '$\\omega = v/r$.', { unit: 'rad/s' }),
    N('li-bici', 'lineal', 2, { vv: [2, 12, 0.5], r: [0.25, 0.4, 0.05] }, function (v) { return 'Una bici va a $' + v.vv + '\\ \\text{m/s}$ con ruedas de $' + v.r + '\\ \\text{m}$ de radio. ¿A cuántas rpm giran las ruedas?'; },
      function (v) { return v.vv / v.r * 60 / TAU; }, '$\\omega = v/r$ y luego a rpm: $\\times 60/2\\pi$.', { unit: 'rpm' }),
    N('li-dos-puntos', 'lineal', 2, { v1: [1, 10, 0.5], r1: [0.1, 1, 0.1], r2: [0.2, 2, 0.1] }, function (v) { return 'En un disco que gira, un punto a $' + v.r1 + '\\ \\text{m}$ del eje va a $' + v.v1 + '\\ \\text{m/s}$. ¿Qué rapidez tiene otro punto a $' + v.r2 + '\\ \\text{m}$?'; },
      function (v) { return v.v1 * v.r2 / v.r1; }, 'Los dos tienen la misma $\\omega$: $v \\propto r$.', { unit: 'm/s', where: function (v) { return v.r1 !== v.r2; }, mistakes: { same: function (v) { return v.v1; } }, feedback: fb('same', 'Lo que comparten es $\\omega$, no $v$: $v = \\omega r$.') }),
    N('li-ecuador', 'lineal', 2, {}, function () { return 'Por la rotación de la Tierra (radio $6.37\\times 10^6\\ \\text{m}$, una vuelta al día), ¿qué rapidez tiene un punto del ecuador?'; },
      function () { return TAU * 6.37e6 / 86400; }, '$v = 2\\pi R/T$: unos 463 m/s.', { unit: 'm/s' }),
    N('li-engranes', 'lineal', 3, { w1: [2, 30, 1], r1: [0.02, 0.1, 0.01], r2: [0.03, 0.2, 0.01] }, function (v) { return 'Un engrane de $' + v.r1 + '\\ \\text{m}$ de radio gira a $' + v.w1 + '\\ \\text{rad/s}$ y mueve a otro de $' + v.r2 + '\\ \\text{m}$. ¿Con qué rapidez angular gira el segundo?'; },
      function (v) { return v.w1 * v.r1 / v.r2; }, 'Los bordes tienen la misma rapidez: $\\omega_1 r_1 = \\omega_2 r_2$.', { unit: 'rad/s', where: function (v) { return Math.abs(v.r1 - v.r2) > 0.005; }, mistakes: { inverted: function (v) { return v.w1 * v.r2 / v.r1; } }, feedback: fb('inverted', 'El engrane grande gira más lento: $\\omega_2 = \\omega_1 r_1/r_2$.') }),
    N('li-banda', 'lineal', 3, { n1: [100, 1800, 100], d1: [5, 30, 1], d2: [5, 40, 1] }, function (v) { return 'Una banda une una polea de $' + v.d1 + '\\ \\text{cm}$ de diámetro que gira a $' + v.n1 + '$ rpm con otra de $' + v.d2 + '\\ \\text{cm}$. ¿A cuántas rpm gira la segunda?'; },
      function (v) { return v.n1 * v.d1 / v.d2; }, 'La banda no patina: la rapidez del borde es la misma en las dos.', { unit: 'rpm', where: function (v) { return v.d1 !== v.d2; } }),

    /* ---------------- Aceleración centrípeta ---------------- */
    N('ce-v', 'centripeta', 1, { vv: [2, 30, 1], r: [1, 50, 1] }, function (v) { return 'Un auto toma una curva de $' + v.r + '\\ \\text{m}$ de radio a $' + v.vv + '\\ \\text{m/s}$ constantes. ¿Cuánto vale su aceleración centrípeta?'; },
      function (v) { return v.vv * v.vv / v.r; }, '$a_c = v^2/r$.', { unit: 'm/s²', mistakes: { noSquare: function (v) { return v.vv / v.r; } }, feedback: fb('noSquare', 'Falta el cuadrado: $v^2/r$.') }),
    N('ce-w', 'centripeta', 1, { w: [0.5, 20, 0.5], r: [0.1, 5, 0.1] }, function (v) { return 'Un objeto gira a $' + v.w + '\\ \\text{rad/s}$ a $' + v.r + '\\ \\text{m}$ del eje. ¿Cuál es su aceleración centrípeta?'; },
      function (v) { return v.w * v.w * v.r; }, '$a_c = \\omega^2 r$.', { unit: 'm/s²', mistakes: { gaveV: function (v) { return v.w * v.r; } }, feedback: fb('gaveV', 'Eso es $v = \\omega r$; la aceleración es $\\omega^2 r$.') }),
    N('ce-T', 'centripeta', 2, { r: [0.5, 10, 0.5], T: [0.5, 10, 0.5] }, function (v) { return 'Una piedra atada a un hilo de $' + v.r + '\\ \\text{m}$ da una vuelta cada $' + v.T + '\\ \\text{s}$. ¿Cuál es su aceleración centrípeta?'; },
      function (v) { return 4 * Math.PI * Math.PI * v.r / (v.T * v.T); }, '$\\omega = 2\\pi/T$ y $a_c = \\omega^2 r$.', { unit: 'm/s²', mistakes: { invT: function (v) { return v.r / (v.T * v.T); } }, feedback: fb('invT', 'Usaste $\\omega = 1/T$; es $2\\pi/T$.') }),
    N('ce-rpm', 'centripeta', 2, { rpm: [30, 600, 30], r: [0.05, 0.5, 0.05] }, function (v) { return 'Una lavadora centrifuga a $' + v.rpm + '$ rpm con un tambor de $' + v.r + '\\ \\text{m}$ de radio. ¿Cuál es la aceleración centrípeta de la ropa?'; },
      function (v) { var w = v.rpm * TAU / 60; return w * w * v.r; }, 'Pasa a rad/s y usa $\\omega^2 r$.', { unit: 'm/s²' }),
    N('ce-en-g', 'centripeta', 2, { vv: [10, 60, 5], r: [20, 200, 10] }, function (v) { return 'Un piloto describe una curva de $' + v.r + '\\ \\text{m}$ de radio a $' + v.vv + '\\ \\text{m/s}$. ¿Cuántas "g" siente? ($a_c/g$)'; },
      function (v) { return v.vv * v.vv / v.r / g; }, 'Divide $a_c = v^2/r$ entre $9.81$.', { mistakes: { noG: function (v) { return v.vv * v.vv / v.r; } }, feedback: fb('noG', 'Esa es $a_c$ en m/s²; divídela entre $g$.') }),
    N('ce-vmax', 'centripeta', 2, { amax: [2, 10, 0.5], r: [10, 200, 10] }, function (v) { return 'Para que los pasajeros viajen cómodos, la aceleración centrípeta no debe pasar de $' + v.amax + '\\ \\text{m/s}^2$. ¿A qué rapidez máxima se puede tomar una curva de $' + v.r + '\\ \\text{m}$?'; },
      function (v) { return Math.sqrt(v.amax * v.r); }, 'De $a = v^2/r$: $v = \\sqrt{ar}$.', { unit: 'm/s' }),
    N('ce-rmin', 'centripeta', 2, { vv: [5, 40, 1], amax: [2, 10, 0.5] }, function (v) { return 'Un tren va a $' + v.vv + '\\ \\text{m/s}$ y su aceleración centrípeta no debe pasar de $' + v.amax + '\\ \\text{m/s}^2$. ¿Qué radio mínimo deben tener las curvas?'; },
      function (v) { return v.vv * v.vv / v.amax; }, '$r = v^2/a$.', { unit: 'm' }),
    N('ce-doble-v', 'centripeta', 1, {}, function () { return 'Si un auto toma la misma curva al doble de rapidez, ¿por qué factor se multiplica su aceleración centrípeta?'; },
      function () { return 4; }, '$a_c \\propto v^2$.', { tol: { abs: 0.01 } }),
    N('ce-doble-r', 'centripeta', 2, {}, function () { return 'En un disco que gira, un punto está al doble de distancia del eje que otro. ¿Cuántas veces mayor es su aceleración centrípeta?'; },
      function () { return 2; }, 'Con la misma $\\omega$: $a_c = \\omega^2 r \\propto r$.', { tol: { abs: 0.01 } }),
    N('ce-luna', 'centripeta', 3, {}, function () { return 'La Luna gira alrededor de la Tierra en un círculo de $3.84\\times 10^8\\ \\text{m}$ cada $27.3$ días. ¿Cuál es su aceleración centrípeta?'; },
      function () { var T = 27.3 * 86400; return 4 * Math.PI * Math.PI * 3.84e8 / (T * T); }, '$a_c = 4\\pi^2 r/T^2$ con $T$ en segundos: unos $2.7\\times 10^{-3}$ m/s².', { unit: 'm/s²' }),
    N('ce-centrifuga-g', 'centripeta', 3, { n: [2, 20, 1], r: [0.1, 1, 0.05] }, function (v) { return '¿A cuántas rpm debe girar una centrífuga de $' + v.r + '\\ \\text{m}$ de radio para producir $' + v.n + 'g$ de aceleración centrípeta?'; },
      function (v) { return Math.sqrt(v.n * g / v.r) * 60 / TAU; }, '$\\omega = \\sqrt{ng/r}$ y luego a rpm.', { unit: 'rpm' }),
    N('ce-periodo', 'centripeta', 3, { ac: [1, 50, 1], r: [0.5, 10, 0.5] }, function (v) { return 'Un objeto gira en un círculo de $' + v.r + '\\ \\text{m}$ con $a_c = ' + v.ac + '\\ \\text{m/s}^2$. ¿Cuál es su periodo?'; },
      function (v) { return TAU * Math.sqrt(v.r / v.ac); }, 'De $a_c = 4\\pi^2 r/T^2$: $T = 2\\pi\\sqrt{r/a_c}$.', { unit: 's' }),

    /* ---------------- Circular no uniforme ---------------- */
    N('ta-total', 'tangencial', 2, { vv: [5, 25, 1], r: [10, 100, 5], at: [1, 6, 0.5] }, function (v) { return 'Un auto toma una curva de $' + v.r + '\\ \\text{m}$ a $' + v.vv + '\\ \\text{m/s}$ y acelera a razón de $' + v.at + '\\ \\text{m/s}^2$. ¿Cuánto vale su aceleración total?'; },
      function (v) { var c = v.vv * v.vv / v.r; return Math.sqrt(c * c + v.at * v.at); }, 'Centrípeta y tangencial son perpendiculares.', { unit: 'm/s²', mistakes: { added: function (v) { return v.vv * v.vv / v.r + v.at; } }, feedback: fb('added', 'Son perpendiculares: $\\sqrt{a_c^2 + a_t^2}$.') }),
    N('ta-angulo', 'tangencial', 3, { vv: [5, 25, 1], r: [10, 100, 5], at: [1, 6, 0.5] }, function (v) { return 'Un auto toma una curva de $' + v.r + '\\ \\text{m}$ a $' + v.vv + '\\ \\text{m/s}$ mientras acelera a $' + v.at + '\\ \\text{m/s}^2$. ¿Qué ángulo forma su aceleración total con la dirección hacia el centro?'; },
      function (v) { return Math.atan(v.at / (v.vv * v.vv / v.r)) * DEG; }, '$\\tan\\phi = a_t/a_c$.', { unit: '°', tol: ANG }),
    N('ta-at', 'tangencial', 1, { v1: [2, 15, 1], v2: [16, 40, 1], t: [2, 12, 1] }, function (v) { return 'Una moto en una pista circular pasa de $' + v.v1 + '$ a $' + v.v2 + '\\ \\text{m/s}$ en $' + v.t + '\\ \\text{s}$ de forma uniforme. ¿Cuánto vale su aceleración tangencial?'; },
      function (v) { return (v.v2 - v.v1) / v.t; }, '$a_t = \\Delta v/\\Delta t$: cambia la rapidez.', { unit: 'm/s²' }),
    N('ta-ac-despues', 'tangencial', 3, { v0: [2, 10, 1], at: [0.5, 3, 0.5], t: [1, 8, 1], r: [10, 60, 5] }, function (v) { return 'Un carrito en una pista de $' + v.r + '\\ \\text{m}$ de radio va a $' + v.v0 + '\\ \\text{m/s}$ y acelera a $' + v.at + '\\ \\text{m/s}^2$ (tangencial). ¿Cuánto vale su aceleración centrípeta $' + v.t + '\\ \\text{s}$ después?'; },
      function (v) { var s = v.v0 + v.at * v.t; return s * s / v.r; }, 'Primero la nueva rapidez, $v_0 + a_tt$; luego $v^2/r$.', { unit: 'm/s²', mistakes: { oldV: function (v) { return v.v0 * v.v0 / v.r; } }, feedback: fb('oldV', 'Usaste la rapidez inicial; ya aumentó.') }),
    N('ta-arranque', 'tangencial', 2, { at: [0.5, 4, 0.5], t: [1, 10, 1], r: [5, 50, 5] }, function (v) { return 'Un auto arranca desde el reposo en una pista circular de $' + v.r + '\\ \\text{m}$ con $a_t = ' + v.at + '\\ \\text{m/s}^2$. ¿Cuál es su aceleración centrípeta a los $' + v.t + '\\ \\text{s}$?'; },
      function (v) { var s = v.at * v.t; return s * s / v.r; }, '$v = a_tt$ y $a_c = v^2/r$.', { unit: 'm/s²' }),
    N('ta-iguales', 'tangencial', 3, { at: [0.5, 4, 0.5], r: [5, 50, 5] }, function (v) { return 'Un auto arranca del reposo en una pista circular de $' + v.r + '\\ \\text{m}$ con $a_t = ' + v.at + '\\ \\text{m/s}^2$. ¿En qué instante su aceleración centrípeta iguala a la tangencial?'; },
      function (v) { return Math.sqrt(v.r / v.at); }, '$(a_tt)^2/r = a_t$ da $t = \\sqrt{r/a_t}$.', { unit: 's' }),

    /* ---------------- Velocidad relativa en una dimensión ---------------- */
    N('r1-mismo', 'relativo1d', 1, { vA: [10, 40, 1], vB: [10, 40, 1] }, function (v) { return 'Dos autos van en el mismo sentido por una carretera, a $' + v.vA + '$ y $' + v.vB + '\\ \\text{m/s}$. ¿Con qué rapidez ve uno al otro alejarse o acercarse?'; },
      function (v) { return Math.abs(v.vA - v.vB); }, 'En el mismo sentido se restan.', { unit: 'm/s', where: function (v) { return v.vA !== v.vB; }, mistakes: { added: function (v) { return v.vA + v.vB; } }, feedback: fb('added', 'Van en el mismo sentido: la velocidad relativa es la diferencia.') }),
    N('r1-opuesto', 'relativo1d', 1, { uA: [10, 40, 1], uB: [10, 40, 1] }, function (v) { return 'Dos trenes van en sentidos opuestos a $' + v.uA + '$ y $' + v.uB + '\\ \\text{m/s}$. ¿Con qué rapidez se acerca uno al otro?'; },
      function (v) { return v.uA + v.uB; }, 'En sentidos opuestos se suman.', { unit: 'm/s', where: function (v) { return v.uA !== v.uB; }, mistakes: { subtracted: function (v) { return Math.abs(v.uA - v.uB); } }, feedback: fb('subtracted', 'Van en sentidos opuestos: se suman.') }),
    N('r1-banda', 'relativo1d', 2, { vw: [0.5, 2, 0.1], vb: [0.5, 2, 0.1] }, function (v) { return 'En el aeropuerto caminas a $' + v.vw + '\\ \\text{m/s}$ sobre una banda que avanza a $' + v.vb + '\\ \\text{m/s}$ en el mismo sentido. ¿Qué rapidez tienes respecto al piso?'; },
      function (v) { return v.vw + v.vb; }, '$v_{tú/piso} = v_{tú/banda} + v_{banda/piso}$.', { unit: 'm/s' }),
    N('r1-contra', 'relativo1d', 2, { L: [20, 100, 5], vw: [1.2, 3, 0.1], vb: [0.3, 1, 0.1] }, function (v) { return 'Una banda de $' + v.L + '\\ \\text{m}$ avanza a $' + v.vb + '\\ \\text{m/s}$ y tú caminas sobre ella en sentido contrario a $' + v.vw + '\\ \\text{m/s}$. ¿Cuánto tardas en recorrerla?'; },
      function (v) { return v.L / (v.vw - v.vb); }, 'Respecto al piso avanzas a $v_w - v_b$.', { unit: 's', mistakes: { added: function (v) { return v.L / (v.vw + v.vb); } }, feedback: fb('added', 'Vas contra la banda: tu rapidez respecto al piso es la diferencia.') }),
    N('r1-pasajero', 'relativo1d', 1, { V: [10, 40, 1], w: [1, 3, 0.5] }, function (v) { return 'Un tren va a $' + v.V + '\\ \\text{m/s}$ y un pasajero camina hacia la parte trasera a $' + v.w + '\\ \\text{m/s}$ respecto al tren. ¿Qué rapidez tiene el pasajero respecto a las vías?'; },
      function (v) { return v.V - v.w; }, 'Su velocidad respecto al tren va en contra: $V - w$.', { unit: 'm/s' }),
    N('r1-rebase', 'relativo1d', 3, { Lc: [4, 6, 0.5], Lt: [12, 20, 1], vc: [25, 35, 1], vt: [15, 24, 1] }, function (v) { return 'Un auto de $' + v.Lc + '\\ \\text{m}$ a $' + v.vc + '\\ \\text{m/s}$ rebasa a un camión de $' + v.Lt + '\\ \\text{m}$ que va a $' + v.vt + '\\ \\text{m/s}$. ¿Cuánto tarda el rebase, desde que la defensa del auto llega a la parte trasera del camión hasta que la parte trasera del auto pasa el frente del camión?'; },
      function (v) { return (v.Lc + v.Lt) / (v.vc - v.vt); }, 'Respecto al camión, el auto avanza $L_c + L_t$ a $v_c - v_t$.', { unit: 's', mistakes: { groundSpeed: function (v) { return (v.Lc + v.Lt) / v.vc; } }, feedback: fb('groundSpeed', 'Mídelo desde el camión: lo rebasa a la diferencia de rapideces.') }),
    N('r1-rio-redondo', 'relativo1d', 3, { D: [100, 2000, 100], vb: [3, 10, 0.5], vc: [0.5, 2.5, 0.5] }, function (v) { return 'Una lancha va a $' + v.vb + '\\ \\text{m/s}$ respecto al agua. Sube $' + v.D + '\\ \\text{m}$ río arriba y regresa, en un río que corre a $' + v.vc + '\\ \\text{m/s}$. ¿Cuánto tarda en total?'; },
      function (v) { return v.D / (v.vb - v.vc) + v.D / (v.vb + v.vc); }, 'Río arriba va a $v_b - v_c$ y río abajo a $v_b + v_c$.', { unit: 's', mistakes: { stillWater: function (v) { return 2 * v.D / v.vb; } }, feedback: fb('stillWater', 'La corriente no se cancela: pierde más tiempo de ida del que gana de regreso.') }),
    N('r1-rio-abajo', 'relativo1d', 2, { D: [100, 2000, 100], vb: [3, 10, 0.5], vc: [0.5, 2.5, 0.5] }, function (v) { return 'Una lancha que va a $' + v.vb + '\\ \\text{m/s}$ respecto al agua baja $' + v.D + '\\ \\text{m}$ por un río que corre a $' + v.vc + '\\ \\text{m/s}$. ¿Cuánto tarda?'; },
      function (v) { return v.D / (v.vb + v.vc); }, 'Río abajo, la corriente la ayuda: $v_b + v_c$.', { unit: 's' }),

    /* ---------------- Velocidad relativa en dos dimensiones ---------------- */
    N('r2-deriva', 'relativo2d', 2, { vb: [2, 8, 0.5], vc: [0.5, 4, 0.5], w: [20, 200, 10] }, function (v) { return 'Una lancha cruza un río de $' + v.w + '\\ \\text{m}$ apuntando perpendicular a la orilla a $' + v.vb + '\\ \\text{m/s}$. La corriente va a $' + v.vc + '\\ \\text{m/s}$. ¿Cuántos metros río abajo llega?'; },
      function (v) { return v.vc * v.w / v.vb; }, 'Tiempo de cruce $w/v_b$; arrastre $v_c t$.', { unit: 'm', where: function (v) { return v.vb !== v.vc; }, mistakes: { swapped: function (v) { return v.vb * v.w / v.vc; } }, feedback: fb('swapped', 'Intercambiaste las velocidades: el cruce depende de $v_b$ y el arrastre de $v_c$.') }),
    N('r2-t', 'relativo2d', 2, { vb: [2, 8, 0.5], vc: [0.5, 4, 0.5], w: [20, 200, 10] }, function (v) { return 'Una lancha cruza un río de $' + v.w + '\\ \\text{m}$ de ancho apuntando perpendicular a la orilla a $' + v.vb + '\\ \\text{m/s}$; la corriente va a $' + v.vc + '\\ \\text{m/s}$. ¿Cuánto tarda en cruzar?'; },
      function (v) { return v.w / v.vb; }, 'Solo la velocidad perpendicular a la orilla la hace cruzar.', { unit: 's', mistakes: { resultant: function (v) { return v.w / Math.hypot(v.vb, v.vc); } }, feedback: fb('resultant', 'Usaste la rapidez total; para cruzar solo cuenta la componente perpendicular, $v_b$.') }),
    N('r2-rapidez', 'relativo2d', 1, { vb: [2, 8, 0.5], vc: [0.5, 4, 0.5] }, function (v) { return 'Una lancha va a $' + v.vb + '\\ \\text{m/s}$ perpendicular a la orilla respecto al agua, y el agua corre a $' + v.vc + '\\ \\text{m/s}$. ¿Qué rapidez tiene respecto a la orilla?'; },
      function (v) { return Math.hypot(v.vb, v.vc); }, 'Son perpendiculares: Pitágoras.', { unit: 'm/s', mistakes: { added: function (v) { return v.vb + v.vc; } }, feedback: fb('added', 'Son perpendiculares: se suman como vectores.') }),
    N('r2-angulo', 'relativo2d', 2, { vb: [2, 8, 0.5], vc: [0.5, 4, 0.5] }, function (v) { return 'Una lancha apunta perpendicular a la orilla a $' + v.vb + '\\ \\text{m/s}$ y la corriente va a $' + v.vc + '\\ \\text{m/s}$. ¿Cuántos grados se desvía su trayectoria de la perpendicular?'; },
      function (v) { return Math.atan(v.vc / v.vb) * DEG; }, '$\\tan\\phi = v_c/v_b$.', { unit: '°', tol: ANG, where: function (v) { return v.vb !== v.vc; }, mistakes: { inverted: function (v) { return Math.atan(v.vb / v.vc) * DEG; } }, feedback: fb('inverted', 'Ese ángulo se mide desde la orilla; se pide desde la perpendicular.') }),
    N('r2-recto-angulo', 'relativo2d', 3, { pb: [3, 10, 0.5], pc: [0.5, 2.5, 0.5] }, function (v) { return 'Una lancha va a $' + v.pb + '\\ \\text{m/s}$ respecto al agua en un río que corre a $' + v.pc + '\\ \\text{m/s}$. ¿Cuántos grados contra la corriente debe apuntar para llegar justo enfrente?'; },
      function (v) { return Math.asin(v.pc / v.pb) * DEG; }, '$v_b\\sin\\alpha = v_c$.', { unit: '°', tol: ANG, mistakes: { tan: function (v) { return Math.atan(v.pc / v.pb) * DEG; } }, feedback: fb('tan', 'Usaste la tangente; la lancha es la hipotenusa: $\\sin\\alpha = v_c/v_b$.') }),
    N('r2-recto-t', 'relativo2d', 3, { pb: [3, 10, 0.5], pc: [0.5, 2.5, 0.5], w: [20, 200, 10] }, function (v) { return 'Una lancha a $' + v.pb + '\\ \\text{m/s}$ (respecto al agua) cruza en línea recta un río de $' + v.w + '\\ \\text{m}$ que corre a $' + v.pc + '\\ \\text{m/s}$. ¿Cuánto tarda?'; },
      function (v) { return v.w / Math.sqrt(v.pb * v.pb - v.pc * v.pc); }, 'Su rapidez perpendicular es $\\sqrt{v_b^2 - v_c^2}$.', { unit: 's', mistakes: { direct: function (v) { return v.w / v.pb; } }, feedback: fb('direct', 'Parte de su velocidad se gasta en contrarrestar la corriente.') }),
    N('r2-lluvia', 'relativo2d', 3, { vr: [3, 10, 0.5], vcar: [5, 30, 1] }, function (v) { return 'La lluvia cae vertical a $' + v.vr + '\\ \\text{m/s}$ y tú vas en auto a $' + v.vcar + '\\ \\text{m/s}$. ¿Qué ángulo con la vertical forman las gotas que ves en la ventana lateral?'; },
      function (v) { return Math.atan(v.vcar / v.vr) * DEG; }, 'Respecto al auto, la lluvia tiene una componente horizontal $-v_{auto}$.', { unit: '°', tol: ANG }),
    N('r2-avion', 'relativo2d', 2, { va: [150, 300, 10], vw: [10, 80, 5] }, function (v) { return 'Un avión apunta al norte a $' + v.va + '\\ \\text{km/h}$ respecto al aire, y el viento sopla hacia el este a $' + v.vw + '\\ \\text{km/h}$. ¿Qué rapidez tiene respecto al suelo?'; },
      function (v) { return Math.hypot(v.va, v.vw); }, 'Suma vectorial de dos velocidades perpendiculares.', { unit: 'km/h' }),
    N('r2-avion-rumbo', 'relativo2d', 3, { va: [150, 300, 10], vw: [10, 80, 5] }, function (v) { return 'Un avión que vuela a $' + v.va + '\\ \\text{km/h}$ respecto al aire quiere ir justo al norte, pero el viento sopla hacia el este a $' + v.vw + '\\ \\text{km/h}$. ¿Cuántos grados al oeste del norte debe apuntar?'; },
      function (v) { return Math.asin(v.vw / v.va) * DEG; }, 'Su componente hacia el oeste debe cancelar el viento: $v_a\\sin\\alpha = v_w$.', { unit: '°', tol: ANG }),
    N('r2-barcos', 'relativo2d', 2, { nA: [2, 12, 1], eB: [2, 12, 1] }, function (v) { return 'El barco A va al norte a $' + v.nA + '\\ \\text{m/s}$ y el B al este a $' + v.eB + '\\ \\text{m/s}$. ¿Con qué rapidez se mueve B respecto a A?'; },
      function (v) { return Math.hypot(v.nA, v.eB); }, '$\\vec{v}_{B/A} = \\vec{v}_B - \\vec{v}_A = (v_B,\\ -v_A)$.', { unit: 'm/s', where: function (v) { return v.nA !== v.eB; }, mistakes: { subtracted: function (v) { return Math.abs(v.eB - v.nA); } }, feedback: fb('subtracted', 'Son perpendiculares: la resta es vectorial.') }),
    N('r2-separacion', 'relativo2d', 2, { nA: [2, 12, 1], eB: [2, 12, 1], t: [10, 120, 10] }, function (v) { return 'Dos barcos salen del mismo puerto: uno al norte a $' + v.nA + '\\ \\text{m/s}$ y otro al este a $' + v.eB + '\\ \\text{m/s}$. ¿A qué distancia están después de $' + v.t + '\\ \\text{s}$?'; },
      function (v) { return Math.hypot(v.nA, v.eB) * v.t; }, 'La distancia crece a la rapidez relativa $\\sqrt{v_A^2 + v_B^2}$.', { unit: 'm' }),

    /* ---------------- Conceptuales ---------------- */
    C('k-vuelta', 'angular', 1, 'Una vuelta completa equivale a…', '$2\\pi$ rad', [['$\\pi$ rad'], ['$360$ rad'], ['1 rad']], '$360^\\circ = 2\\pi$ rad.'),
    C('k-radian', 'angular', 2, 'Un radián es el ángulo…', 'cuyo arco mide lo mismo que el radio', [['de $1^\\circ$'], ['de un cuarto de vuelta'], ['cuyo arco mide $2\\pi$ veces el radio']], 'De $s = r\\theta$ con $s = r$.'),
    C('k-w-unidades', 'angular', 1, 'La rapidez angular se mide en…', 'rad/s', [['m/s'], ['m/s²'], ['rad']], 'Ángulo por unidad de tiempo.'),
    C('k-T-f', 'angular', 2, 'El periodo $T$ y la frecuencia $f$ cumplen…', '$f = 1/T$', [['$f = 2\\pi T$'], ['$f = T$'], ['$f = T/2\\pi$']], 'Vueltas por segundo y segundos por vuelta.'),
    C('k-disco-w', 'angular', 2, 'En un disco rígido que gira, dos puntos a distinta distancia del eje tienen…', 'la misma rapidez angular', [['la misma rapidez lineal'], ['la misma aceleración'], ['distinta rapidez angular']], 'Todos barren el mismo ángulo en el mismo tiempo.'),
    C('k-rpm', 'angular', 1, 'Las rpm son…', 'vueltas por minuto', [['radianes por minuto'], ['radianes por segundo'], ['metros por minuto']], 'Revoluciones por minuto.'),
    C('k-arco-rad', 'angular', 2, 'En $s = r\\theta$, el ángulo $\\theta$ debe estar en…', 'radianes', [['grados'], ['vueltas'], ['cualquier unidad']], 'La fórmula sale de la definición del radián.'),
    C('k-v-r', 'lineal', 1, 'En una rueda que gira, los puntos más lejos del eje van…', 'más rápido', [['más lento'], ['igual de rápido'], ['en sentido contrario']], '$v = \\omega r$.'),
    C('k-tangente', 'lineal', 1, 'En movimiento circular, la velocidad apunta…', 'tangente al círculo', [['hacia el centro'], ['hacia afuera'], ['a $45^\\circ$ del radio']], 'Es perpendicular al radio.'),
    C('k-v-w', 'lineal', 1, 'La rapidez lineal y la angular se relacionan por…', '$v = \\omega r$', [['$v = \\omega/r$'], ['$v = \\omega^2 r$'], ['$v = r/\\omega$']], 'Derivada de $s = r\\theta$.'),
    C('k-honda', 'lineal', 2, 'Giras una piedra con una honda y la sueltas. La piedra sale…', 'en línea recta, tangente al círculo', [['hacia afuera, en la dirección del radio'], ['hacia el centro'], ['girando en círculo']], 'Sin la tensión, sigue con su velocidad, que es tangente.'),
    C('k-engranes', 'lineal', 3, 'Dos engranes que se tocan tienen igual…', 'rapidez en el borde', [['rapidez angular'], ['periodo'], ['aceleración centrípeta']], 'Los dientes no patinan: $\\omega_1 r_1 = \\omega_2 r_2$.'),
    C('k-mcu-rapidez', 'lineal', 1, 'En el movimiento circular uniforme, la rapidez…', 'es constante', [['crece'], ['disminuye'], ['es cero']], 'Uniforme se refiere a la rapidez.'),
    C('k-ac-dir', 'centripeta', 1, 'En el movimiento circular uniforme, la aceleración apunta…', 'hacia el centro', [['tangente al círculo'], ['hacia afuera'], ['no hay aceleración']], 'Por eso se llama centrípeta.'),
    C('k-ac-formula', 'centripeta', 1, 'La aceleración centrípeta vale…', '$v^2/r$', [['$v/r$'], ['$vr$'], ['$v^2 r$']], 'También $\\omega^2 r$.'),
    C('k-mcu-acelera', 'centripeta', 2, 'Un objeto gira en círculo con rapidez constante. ¿Tiene aceleración?', 'Sí, porque la dirección de su velocidad cambia', [['No, porque su rapidez es constante'], ['Solo si el círculo es grande'], ['Solo si gira muy rápido']], 'La velocidad es un vector.'),
    C('k-doble-v', 'centripeta', 2, 'Si duplicas la rapidez en la misma curva, la aceleración centrípeta…', 'se cuadruplica', [['se duplica'], ['no cambia'], ['se reduce a la mitad']], '$a_c \\propto v^2$.'),
    C('k-doble-r', 'centripeta', 2, 'A la misma rapidez, en una curva del doble de radio, la aceleración centrípeta…', 'se reduce a la mitad', [['se duplica'], ['se cuadruplica'], ['no cambia']], '$a_c = v^2/r$.'),
    C('k-w-r', 'centripeta', 3, 'Con la misma rapidez angular, al doble de distancia del eje, la aceleración centrípeta…', 'se duplica', [['se reduce a la mitad'], ['se cuadruplica'], ['no cambia']], '$a_c = \\omega^2 r$.'),
    C('k-ac-v-perp', 'centripeta', 2, 'En el movimiento circular uniforme, la aceleración y la velocidad son…', 'perpendiculares', [['paralelas'], ['opuestas'], ['iguales']], 'Una es radial y la otra tangente.'),
    C('k-centrifuga', 'centripeta', 3, 'En una curva sientes que algo te empuja hacia afuera. En realidad…', 'tu cuerpo tiende a seguir en línea recta y el auto gira', [['una fuerza centrífuga te empuja'], ['la aceleración apunta hacia afuera'], ['el auto frena']], 'La aceleración real apunta hacia el centro de la curva.'),
    C('k-curva-cerrada', 'centripeta', 1, 'A la misma rapidez, una curva más cerrada (menor radio) exige…', 'mayor aceleración centrípeta', [['menor aceleración centrípeta'], ['la misma aceleración'], ['aceleración cero']], '$a_c = v^2/r$.'),
    C('k-unidades', 'centripeta', 2, '¿Qué unidades tiene $\\omega^2 r$?', 'm/s²', [['m/s'], ['rad/s'], ['m²/s']], '$(\\text{rad/s})^2\\cdot\\text{m}$; el radián no tiene dimensión.'),
    C('k-at', 'tangencial', 1, 'La aceleración tangencial cambia…', 'la rapidez', [['la dirección de la velocidad'], ['el radio'], ['el periodo sin cambiar la rapidez']], 'Va a lo largo de la velocidad.'),
    C('k-ac-cambia', 'tangencial', 2, 'La aceleración centrípeta cambia…', 'la dirección de la velocidad', [['la rapidez'], ['el radio'], ['la masa']], 'Es perpendicular a la velocidad.'),
    C('k-total', 'tangencial', 2, 'Si la rapidez cambia en una curva, la aceleración total es…', '$\\sqrt{a_c^2 + a_t^2}$', [['$a_c + a_t$'], ['solo $a_c$'], ['solo $a_t$']], 'Son componentes perpendiculares.'),
    C('k-frena-curva', 'tangencial', 3, 'Un auto frena mientras toma una curva. Su aceleración apunta…', 'hacia adentro de la curva y hacia atrás', [['solo hacia el centro'], ['solo hacia atrás'], ['hacia afuera y hacia adelante']], 'Suma de la centrípeta (adentro) y la tangencial (contra el movimiento).'),
    C('k-at-cero', 'tangencial', 1, 'Si la aceleración tangencial es cero, el movimiento circular es…', 'uniforme', [['imposible'], ['acelerado en rapidez'], ['rectilíneo']], 'La rapidez no cambia.'),
    C('k-marco', 'relativo1d', 1, 'La velocidad de un objeto depende de…', 'el marco de referencia desde el que se mide', [['solo del objeto'], ['de su masa'], ['de su aceleración']], 'Un pasajero sentado está quieto para el tren y se mueve para la vía.'),
    C('k-regla', 'relativo1d', 2, 'La regla de suma de velocidades es…', '$\\vec{v}_{A/C} = \\vec{v}_{A/B} + \\vec{v}_{B/C}$', [['$\\vec{v}_{A/C} = \\vec{v}_{A/B} - \\vec{v}_{B/C}$'], ['$\\vec{v}_{A/C} = \\vec{v}_{A/B}\\,\\vec{v}_{B/C}$'], ['$\\vec{v}_{A/C} = \\vec{v}_{C/B} + \\vec{v}_{B/A}$']], 'Los subíndices de en medio se "encadenan".'),
    C('k-inversa', 'relativo1d', 2, '$\\vec{v}_{A/B}$ comparada con $\\vec{v}_{B/A}$…', 'son opuestas', [['son iguales'], ['son perpendiculares'], ['una es el doble de la otra']], 'Si tú me ves ir a la derecha, yo te veo ir a la izquierda.'),
    C('k-mismo', 'relativo1d', 1, 'Dos autos van por la carretera con la misma velocidad. Visto uno desde el otro…', 'están en reposo', [['se alejan'], ['se acercan'], ['van al doble de velocidad']], 'Su velocidad relativa es cero.'),
    C('k-tren-pelota', 'relativo1d', 3, 'Dentro de un tren que va a velocidad constante lanzas una pelota verticalmente hacia arriba. ¿Dónde cae?', 'En tu mano', [['Atrás de ti'], ['Adelante de ti'], ['Depende de la rapidez del tren']], 'La pelota conserva la velocidad del tren; para ti es un tiro vertical.'),
    C('k-opuestos', 'relativo1d', 2, 'Dos trenes van en sentidos opuestos. Un pasajero ve pasar al otro tren con una rapidez…', 'igual a la suma de sus rapideces', [['igual a la diferencia'], ['igual a la del otro tren'], ['cero']], 'En sentidos opuestos se suman.'),
    C('k-rio-arriba', 'relativo1d', 2, 'Río arriba, una lancha va respecto a la orilla a…', '$v_b - v_c$', [['$v_b + v_c$'], ['$v_b$'], ['$\\sqrt{v_b^2 + v_c^2}$']], 'La corriente la frena.'),
    C('k-rio-t', 'relativo2d', 2, 'Si la lancha apunta perpendicular a la orilla, el tiempo de cruce depende…', 'solo del ancho del río y de la rapidez de la lancha', [['también de la corriente'], ['solo de la corriente'], ['de la rapidez respecto a la orilla']], 'La corriente es paralela a la orilla: no ayuda ni estorba a cruzar.'),
    C('k-rio-recto', 'relativo2d', 1, 'Para llegar justo enfrente, la lancha debe…', 'apuntar un poco contra la corriente', [['apuntar perpendicular a la orilla'], ['apuntar a favor de la corriente'], ['ir más lento']], 'Así cancela el arrastre.'),
    C('k-imposible', 'relativo2d', 3, 'Si la corriente es más rápida que la lancha…', 'no puede cruzar en línea recta', [['cruza más rápido'], ['no puede cruzar'], ['cruza igual que en agua quieta']], 'No hay ángulo con $\\sin\\alpha = v_c/v_b > 1$; sí cruza, pero arrastrada.'),
    C('k-rio-rapido', 'relativo2d', 2, '¿De qué forma cruza el río en menos tiempo una lancha?', 'Apuntando perpendicular a la orilla', [['Apuntando contra la corriente'], ['Apuntando a favor de la corriente'], ['Da lo mismo']], 'Así usa toda su velocidad para cruzar.'),
    C('k-lluvia', 'relativo2d', 2, 'La lluvia cae vertical, pero desde un auto en movimiento las gotas se ven…', 'inclinadas, viniendo hacia el frente del auto', [['verticales'], ['inclinadas hacia atrás del auto'], ['horizontales']], 'Respecto al auto, la lluvia tiene una velocidad horizontal hacia atrás.'),
    C('k-viento-cola', 'relativo2d', 1, 'Un avión con viento de cola (a favor) va respecto al suelo…', 'más rápido que respecto al aire', [['más lento'], ['igual'], ['en otra dirección']], 'Se suman las velocidades.'),
    C('k-vectorial', 'relativo2d', 1, 'Las velocidades medidas desde distintos marcos se combinan…', 'como vectores', [['sumando sus magnitudes siempre'], ['multiplicándolas'], ['restando sus magnitudes siempre']], 'Solo en una dimensión basta con los signos.')
  ];

  K.register({
    'f1.S07.angular': 'Cinemática angular',
    'f1.S07.lineal': 'Rapidez lineal y angular',
    'f1.S07.centripeta': 'Aceleración centrípeta',
    'f1.S07.tangencial': 'Circular no uniforme',
    'f1.S07.relativo1d': 'Velocidad relativa en una dimensión',
    'f1.S07.relativo2d': 'Velocidad relativa en dos dimensiones'
  }, Q);
})();
