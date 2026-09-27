/* =====================================================================
   Problemas de examen · Cálculo 1 (§10.3). Propios y parametrizados.
   part.answer(v, prev): prev son las respuestas DEL ALUMNO en los incisos
   anteriores, para dar crédito por arrastre de error.
   Por ahora: bloque C (piloto S10). Se agregan 6–8 por bloque en F3.
   ===================================================================== */
(function () {
  var ex = (window.CB_EXAMS = window.CB_EXAMS || {});
  function fx(v, d) { return Number((+v).toFixed(d == null ? 3 : d)).toString(); }

  ex.c1 = (ex.c1 || []).concat([
    {
      id: 'c1-ex-tanque', tags: ['c1.S10'], block: 'C', title: 'Llenado de un tanque',
      vars: { c: [2, 8, 1], T: [2, 6, 1] },
      statement: function (v) {
        return '<p>Un tanque recibe agua con un caudal $r(t) = \\dfrac{' + v.c + 't}{t^2 + 1}$ litros por minuto, con $t$ en minutos. El volumen que entra entre $t = 0$ y $t = ' + v.T + '$ es $\\displaystyle V = \\int_0^{' + v.T + '} r(t)\\,dt$.</p>';
      },
      diagram: { id: 'exam-caudal', state: function (v) { return { c: v.c, T: v.T }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2,
          prompt: function (v) { return 'Con la sustitución $u = t^2 + 1$, ¿cuánto vale $u$ en $t = ' + v.T + '$?'; },
          answer: function (v) { return v.T * v.T + 1; },
          solution: function (v) { return '$u(' + v.T + ') = ' + v.T + '^2 + 1 = ' + (v.T * v.T + 1) + '$.'; }
        },
        {
          label: 'b', type: 'numeric', points: 4, unit: 'L',
          prompt: function (v) { return 'Usa tu resultado del inciso a) para calcular el volumen $V$ que entra entre $t = 0$ y $t = ' + v.T + '$.'; },
          answer: function (v, prev) { return v.c / 2 * Math.log(prev[0]); },
          solution: function (v) {
            var u = v.T * v.T + 1;
            return 'Con $du = 2t\\,dt$: $\\displaystyle V = \\frac{' + v.c + '}{2}\\int_1^{' + u + '} \\frac{du}{u} = \\frac{' + v.c + '}{2}\\ln ' + u + ' \\approx ' + fx(v.c / 2 * Math.log(u)) + '$ L.';
          }
        },
        {
          label: 'c', type: 'numeric', points: 3, unit: 'L/min',
          prompt: function (v) { return 'Con tu volumen del inciso b), ¿cuál es el caudal promedio entre $t = 0$ y $t = ' + v.T + '$?'; },
          answer: function (v, prev) { return prev[1] / v.T; },
          solution: function (v) {
            var V = v.c / 2 * Math.log(v.T * v.T + 1);
            return 'Promedio $= V / ' + v.T + ' \\approx ' + fx(V / v.T) + '$ L/min.';
          }
        },
        {
          label: 'd', type: 'numeric', points: 3, unit: 'min',
          prompt: function () { return '¿En qué instante $t > 0$ el caudal $r(t)$ es máximo?'; },
          answer: function () { return 1; },
          solution: function (v) {
            return '$r\'(t) = ' + v.c + '\\,\\dfrac{(t^2 + 1) - 2t^2}{(t^2+1)^2} = ' + v.c + '\\,\\dfrac{1 - t^2}{(t^2+1)^2}$, que se anula en $t = 1$ min (regla del cociente, S04).';
          }
        }
      ]
    },
    {
      id: 'c1-ex-robot', tags: ['c1.S10'], block: 'C', title: 'Un robot que va y regresa',
      vars: { k: [2, 6, 1], T: [1.3, 1.7, 0.1] },
      where: function (v) { return Math.abs(Math.sin(v.T * v.T)) > 0.2; },
      statement: function (v) {
        return '<p>Un robot se mueve sobre una línea con velocidad $v(t) = ' + v.k + 't\\cos(t^2)$ m/s y parte de $s(0) = 0$. Trabaja de $t = 0$ a $t = ' + v.T + '$ s (usa radianes).</p>';
      },
      diagram: { id: 'exam-velocidad', state: function (v) { return { k: v.k, T: v.T }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 4, unit: 'm',
          prompt: function (v) { return 'Calcula su posición final $s(' + v.T + ') = \\int_0^{' + v.T + '} v(t)\\,dt$.'; },
          answer: function (v) { return v.k / 2 * Math.sin(v.T * v.T); },
          solution: function (v) {
            var T2 = +(v.T * v.T).toFixed(2);
            return 'Con $u = t^2$, $du = 2t\\,dt$: $\\displaystyle s = \\frac{' + v.k + '}{2}\\int_0^{' + T2 + '} \\cos u\\,du = \\frac{' + v.k + '}{2}\\sin(' + T2 + ') \\approx ' + fx(v.k / 2 * Math.sin(v.T * v.T)) + '$ m.';
          }
        },
        {
          label: 'b', type: 'numeric', points: 3, unit: 's',
          prompt: function () { return '¿En qué instante $t > 0$ se detiene por primera vez?'; },
          answer: function () { return Math.sqrt(Math.PI / 2); },
          solution: function () { return '$v = 0$ cuando $\\cos(t^2) = 0$, o sea $t^2 = \\pi/2$: $t = \\sqrt{\\pi/2} \\approx ' + fx(Math.sqrt(Math.PI / 2)) + '$ s.'; }
        },
        {
          label: 'c', type: 'numeric', points: 3, unit: 'm/s',
          prompt: function (v) { return 'Con tu posición final del inciso a), ¿cuál fue su velocidad media en los $' + v.T + '$ s?'; },
          answer: function (v, prev) { return prev[0] / v.T; },
          solution: function (v) { return 'Velocidad media $= s(' + v.T + ')/' + v.T + ' \\approx ' + fx(v.k / 2 * Math.sin(v.T * v.T) / v.T) + '$ m/s.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: '%', tol: { abs: 1 },
          prompt: function () { return 'En el instante del inciso b) el robot está en su punto más lejano, $s = k/2$. ¿Qué porcentaje de esa distancia representa tu posición final del inciso a)?'; },
          answer: function (v, prev) { return prev[0] / (v.k / 2) * 100; },
          solution: function (v) { return '$\\dfrac{s(' + v.T + ')}{' + v.k + '/2} \\times 100 = \\sin(' + fx(v.T * v.T, 2) + ') \\times 100 \\approx ' + fx(Math.sin(v.T * v.T) * 100, 1) + '\\,\\%$.'; }
        }
      ]
    }
  ]);
})();
