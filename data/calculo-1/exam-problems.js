/* =====================================================================
   Problemas de examen · Cálculo 1 (§10.3). Propios y parametrizados.
   part.answer(v, prev): prev son las respuestas DEL ALUMNO en los incisos
   anteriores, para dar crédito por arrastre de error.
   Bloque A (S01–S06) y bloque C (piloto S10). Se agregan 6–8 por bloque en F3.
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
    },

    /* ================= Bloque A · Derivada (S01–S06) ================= */
    {
      id: 'c1-ex-dron', tags: ['c1.S01', 'c1.S02'], block: 'A', title: 'Un dron que despega',
      vars: { p: [1, 4, 1], q: [2, 8, 1], T: [2, 5, 1] },
      statement: function (v) { return '<p>Un dron despega y su altura es $h(t) = ' + v.p + 't^2 + ' + v.q + 't$ metros, con $t$ en segundos.</p>'; },
      diagram: { id: 'exam-dron', state: function (v) { return { p: v.p, q: v.q, T: v.T }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2, unit: 'm',
          prompt: function (v) { return '¿A qué altura está el dron en $t = ' + v.T + '$ s?'; },
          answer: function (v) { return v.p * v.T * v.T + v.q * v.T; },
          solution: function (v) { return '$h(' + v.T + ') = ' + v.p + '(' + v.T + ')^2 + ' + v.q + '(' + v.T + ') = ' + (v.p * v.T * v.T + v.q * v.T) + '$ m.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3, unit: 'm/s',
          prompt: function (v) { return 'Con tu altura del inciso a), ¿cuál fue la velocidad promedio entre $t = 0$ y $t = ' + v.T + '$?'; },
          answer: function (v, prev) { return prev[0] / v.T; },
          solution: function (v) { return 'Pendiente de la secante: $\\dfrac{h(' + v.T + ') - h(0)}{' + v.T + '} = ' + fx(v.p * v.T + v.q) + '$ m/s.'; }
        },
        {
          label: 'c', type: 'numeric', points: 3, unit: 'm/s',
          prompt: function (v) { return '¿Cuál es su velocidad instantánea en $t = ' + v.T + '$ s?'; },
          answer: function (v) { return 2 * v.p * v.T + v.q; },
          solution: function (v) { return '$h\'(t) = ' + 2 * v.p + 't + ' + v.q + '$, así que $h\'(' + v.T + ') = ' + (2 * v.p * v.T + v.q) + '$ m/s.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return '¿Cuánto mayor es la velocidad instantánea del inciso c) que la promedio del inciso b)?'; },
          answer: function (v, prev) { return prev[2] - prev[1]; },
          solution: function (v) { return '$' + (2 * v.p * v.T + v.q) + ' - ' + fx(v.p * v.T + v.q) + ' = ' + fx(v.p * v.T) + '$ m/s: el dron acelera, así que al final va más rápido que su promedio.'; }
        }
      ]
    },
    {
      id: 'c1-ex-cubica', tags: ['c1.S01', 'c1.S02'], block: 'A', title: 'La tangente a una cúbica',
      vars: { a: [1, 3, 1], k: [1, 9, 1] },
      where: function (v) { return 3 * v.a * v.a !== v.k; },
      statement: function (v) { return '<p>Considera $f(x) = x^3 - ' + v.k + 'x$ y su recta tangente en $x = ' + v.a + '$.</p>'; },
      diagram: { id: 'exam-tangente', state: function (v) { return { a: v.a, k: v.k }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3,
          prompt: function (v) { return '¿Cuál es la pendiente de la tangente en $x = ' + v.a + '$?'; },
          answer: function (v) { return 3 * v.a * v.a - v.k; },
          solution: function (v) { return '$f\'(x) = 3x^2 - ' + v.k + '$, así que $f\'(' + v.a + ') = ' + (3 * v.a * v.a - v.k) + '$.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3,
          prompt: function () { return 'Con tu pendiente del inciso a), ¿en qué valor corta la tangente al eje $y$?'; },
          answer: function (v, prev) { return (Math.pow(v.a, 3) - v.k * v.a) - prev[0] * v.a; },
          solution: function (v) { var fa = Math.pow(v.a, 3) - v.k * v.a, m = 3 * v.a * v.a - v.k; return '$y = f(' + v.a + ') + m(x - ' + v.a + ')$ con $f(' + v.a + ') = ' + fa + '$; en $x = 0$: $' + fa + ' - (' + m + ')(' + v.a + ') = ' + (fa - m * v.a) + '$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2,
          prompt: function () { return 'Con los incisos a) y b), ¿en qué $x$ corta la tangente al eje $x$?'; },
          answer: function (v, prev) { return -prev[1] / prev[0]; },
          solution: function (v) { var m = 3 * v.a * v.a - v.k, b = -2 * Math.pow(v.a, 3); return '$0 = ' + b + ' + (' + m + ')x \\Rightarrow x = ' + fx(-b / m) + '$.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2,
          prompt: function () { return '¿En qué $x > 0$ tiene $f$ tangente horizontal?'; },
          answer: function (v) { return Math.sqrt(v.k / 3); },
          solution: function (v) { return '$3x^2 - ' + v.k + ' = 0 \\Rightarrow x = \\sqrt{' + v.k + '/3} \\approx ' + fx(Math.sqrt(v.k / 3)) + '$.'; }
        }
      ]
    },
    {
      id: 'c1-ex-costo', tags: ['c1.S02', 'c1.S04'], block: 'A', title: 'Costo promedio de producción',
      vars: { k: [2, 5, 1], b: [5, 20, 5], x0: [50, 150, 50] },
      statement: function (v) { return '<p>Un taller produce $x$ piezas con costo total $C(x) = ' + 100 * v.k * v.k + ' + ' + v.b + 'x + 0.01x^2$ pesos. El costo promedio por pieza es $A(x) = \\dfrac{C(x)}{x}$.</p>'; },
      diagram: { id: 'exam-costo', state: function (v) { return { F: 100 * v.k * v.k, b: v.b, x0: v.x0 }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2, unit: 'pesos/pieza',
          prompt: function (v) { return 'Calcula el costo marginal $C\'(' + v.x0 + ')$.'; },
          answer: function (v) { return v.b + 0.02 * v.x0; },
          solution: function (v) { return '$C\'(x) = ' + v.b + ' + 0.02x$; en $x = ' + v.x0 + '$: $' + fx(v.b + 0.02 * v.x0) + '$.'; }
        },
        {
          label: 'b', type: 'numeric', points: 2, unit: 'pesos/pieza',
          prompt: function (v) { return 'Calcula el costo promedio $A(' + v.x0 + ')$.'; },
          answer: function (v) { return (100 * v.k * v.k + v.b * v.x0 + 0.01 * v.x0 * v.x0) / v.x0; },
          solution: function (v) { var C = 100 * v.k * v.k + v.b * v.x0 + 0.01 * v.x0 * v.x0; return '$A = \\dfrac{' + fx(C) + '}{' + v.x0 + '} = ' + fx(C / v.x0) + '$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 4, unit: 'pesos/pieza²',
          prompt: function (v) { return 'Con la regla del cociente y tus resultados de a) y b), calcula $A\'(' + v.x0 + ')$. (Sugerencia: $A\' = \\dfrac{C\'x - C}{x^2} = \\dfrac{C\' - A}{x}$.)'; },
          answer: function (v, prev) { return (prev[0] - prev[1]) / v.x0; },
          solution: function (v) { var F = 100 * v.k * v.k; return '$A\'(' + v.x0 + ') = 0.01 - \\dfrac{' + F + '}{' + v.x0 + '^2} \\approx ' + fx(0.01 - F / (v.x0 * v.x0), 4) + '$: negativo, el promedio aún baja.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: 'piezas',
          prompt: function () { return '¿Con cuántas piezas el costo promedio es mínimo?'; },
          answer: function (v) { return 100 * v.k; },
          solution: function (v) { return '$A\'(x) = 0.01 - \\dfrac{' + 100 * v.k * v.k + '}{x^2} = 0 \\Rightarrow x = ' + 100 * v.k + '$ piezas.'; }
        }
      ]
    },
    {
      id: 'c1-ex-bacterias', tags: ['c1.S02', 'c1.S05'], block: 'A', title: 'Una colonia que se duplica',
      vars: { N0: [100, 900, 100], d: [2, 6, 1], T: [3, 9, 3] },
      statement: function (v) { return '<p>Una colonia empieza con ' + v.N0 + ' bacterias y se duplica cada ' + v.d + ' horas. Se modela como $N(t) = ' + v.N0 + '\\,e^{kt}$, con $t$ en horas.</p>'; },
      diagram: { id: 'exam-bacterias', state: function (v) { return { N0: v.N0, d: v.d, T: v.T }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2, unit: '1/h',
          prompt: function () { return '¿Cuánto vale la constante $k$?'; },
          answer: function (v) { return Math.log(2) / v.d; },
          solution: function (v) { return '$e^{' + v.d + 'k} = 2 \\Rightarrow k = \\dfrac{\\ln 2}{' + v.d + '} \\approx ' + fx(Math.log(2) / v.d, 4) + '$.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3, unit: 'bacterias',
          prompt: function (v) { return 'Con tu $k$, ¿cuántas bacterias hay en $t = ' + v.T + '$ h?'; },
          answer: function (v, prev) { return v.N0 * Math.exp(prev[0] * v.T); },
          solution: function (v) { return '$N(' + v.T + ') = ' + v.N0 + '\\cdot 2^{' + v.T + '/' + v.d + '} \\approx ' + fx(v.N0 * Math.pow(2, v.T / v.d), 1) + '$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 3, unit: 'bacterias/h',
          prompt: function (v) { return 'Con la regla de la cadena, ¿a qué ritmo crece en $t = ' + v.T + '$ h? Usa tus incisos a) y b).'; },
          answer: function (v, prev) { return prev[0] * prev[1]; },
          solution: function (v) { var k = Math.log(2) / v.d; return '$N\'(t) = k\\,N(t) \\approx ' + fx(k, 4) + '\\cdot ' + fx(v.N0 * Math.pow(2, v.T / v.d), 1) + ' \\approx ' + fx(k * v.N0 * Math.pow(2, v.T / v.d), 1) + '$.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: '% por hora',
          prompt: function () { return '¿Qué porcentaje por hora representa ese ritmo respecto a la población del inciso b)?'; },
          answer: function (v, prev) { return prev[2] / prev[1] * 100; },
          solution: function (v) { return '$\\dfrac{N\'}{N}\\times 100 = 100k \\approx ' + fx(100 * Math.log(2) / v.d, 2) + '\\,\\%$: no depende del instante.'; }
        }
      ]
    },
    {
      id: 'c1-ex-temperatura', tags: ['c1.S02', 'c1.S05'], block: 'A', title: 'La temperatura del día',
      vars: { A: [4, 10, 1], t0: [1, 5, 1] },
      statement: function (v) { return '<p>La temperatura de una ciudad sigue $T(t) = 20 + ' + v.A + '\\sin\\left(\\dfrac{\\pi t}{12}\\right)$ °C, con $t$ en horas desde las 6:00 (usa radianes).</p>'; },
      diagram: { id: 'exam-temperatura', state: function (v) { return { A: v.A, t0: v.t0 }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3, unit: '°C/h',
          prompt: function (v) { return '¿A qué ritmo cambia la temperatura en $t = ' + v.t0 + '$ h?'; },
          answer: function (v) { return v.A * Math.PI / 12 * Math.cos(Math.PI * v.t0 / 12); },
          solution: function (v) { return 'Cadena: $T\'(t) = ' + v.A + '\\cdot\\dfrac{\\pi}{12}\\cos\\left(\\dfrac{\\pi t}{12}\\right)$; en $t = ' + v.t0 + '$: $\\approx ' + fx(v.A * Math.PI / 12 * Math.cos(Math.PI * v.t0 / 12)) + '$ °C/h.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3, unit: '°C',
          prompt: function (v) { return 'Con tu ritmo del inciso a) y la recta tangente, estima $T(' + (v.t0 + 0.5) + ')$.'; },
          answer: function (v, prev) { return 20 + v.A * Math.sin(Math.PI * v.t0 / 12) + 0.5 * prev[0]; },
          solution: function (v) { var T0 = 20 + v.A * Math.sin(Math.PI * v.t0 / 12), m = v.A * Math.PI / 12 * Math.cos(Math.PI * v.t0 / 12); return '$T(' + v.t0 + ') + 0.5\\,T\'(' + v.t0 + ') \\approx ' + fx(T0) + ' + 0.5(' + fx(m) + ') = ' + fx(T0 + 0.5 * m) + '$ °C.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: '°C',
          prompt: function (v) { return '¿Cuál es el valor exacto de $T(' + (v.t0 + 0.5) + ')$? Compáralo con tu estimación.'; },
          answer: function (v) { return 20 + v.A * Math.sin(Math.PI * (v.t0 + 0.5) / 12); },
          solution: function (v) { return '$T(' + (v.t0 + 0.5) + ') \\approx ' + fx(20 + v.A * Math.sin(Math.PI * (v.t0 + 0.5) / 12)) + '$ °C: la tangente aproxima muy bien a media hora de distancia.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: 'h',
          prompt: function () { return '¿En qué $t$ entre 0 y 24 la temperatura es máxima?'; },
          answer: function () { return 6; },
          solution: function () { return '$T\'(t) = 0$ cuando $\\cos(\\pi t/12) = 0$; el máximo es en $\\pi t/12 = \\pi/2$, o sea $t = 6$ h (las 12:00).'; }
        }
      ]
    },
    {
      id: 'c1-ex-elipse', tags: ['c1.S06'], block: 'A', title: 'Una pista elíptica',
      vars: { p: [1, 3, 1], q: [1, 3, 1] },
      statement: function (v) { return '<p>Una pista tiene la forma $x^2 + xy + y^2 = ' + (v.p * v.p + v.p * v.q + v.q * v.q) + '$ (en hectómetros). Un corredor pasa por el punto $(' + v.p + ', ' + v.q + ')$.</p>'; },
      diagram: { id: 'exam-elipse', state: function (v) { return { p: v.p, q: v.q }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3,
          prompt: function (v) { return 'Con derivación implícita, ¿cuál es la pendiente de la pista en $(' + v.p + ', ' + v.q + ')$?'; },
          answer: function (v) { return -(2 * v.p + v.q) / (v.p + 2 * v.q); },
          solution: function (v) { return '$2x + y + x\\,y\' + 2y\\,y\' = 0 \\Rightarrow y\' = -\\dfrac{2x + y}{x + 2y} = -\\dfrac{' + (2 * v.p + v.q) + '}{' + (v.p + 2 * v.q) + '} \\approx ' + fx(-(2 * v.p + v.q) / (v.p + 2 * v.q)) + '$.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3,
          prompt: function () { return 'Si el corredor sale por la tangente, ¿en qué valor cruza el eje $y$? Usa tu pendiente del inciso a).'; },
          answer: function (v, prev) { return v.q - prev[0] * v.p; },
          solution: function (v) { var m = -(2 * v.p + v.q) / (v.p + 2 * v.q); return '$y = ' + v.q + ' + m(x - ' + v.p + ')$; en $x = 0$: $' + v.q + ' - (' + fx(m) + ')(' + v.p + ') \\approx ' + fx(v.q - m * v.p) + '$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2,
          prompt: function () { return '¿Qué pendiente tiene la recta normal (perpendicular a la tangente) en ese punto?'; },
          answer: function (v, prev) { return -1 / prev[0]; },
          solution: function (v) { return '$-\\dfrac{1}{m} = \\dfrac{' + (v.p + 2 * v.q) + '}{' + (2 * v.p + v.q) + '} \\approx ' + fx((v.p + 2 * v.q) / (2 * v.p + v.q)) + '$.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2,
          prompt: function () { return '¿En qué $x > 0$ la pista tiene tangente horizontal?'; },
          answer: function (v) { return Math.sqrt((v.p * v.p + v.p * v.q + v.q * v.q) / 3); },
          solution: function (v) { var c = v.p * v.p + v.p * v.q + v.q * v.q; return 'Horizontal cuando $2x + y = 0$: con $y = -2x$ queda $3x^2 = ' + c + '$, así que $x = \\sqrt{' + c + '/3} \\approx ' + fx(Math.sqrt(c / 3)) + '$.'; }
        }
      ]
    },
    {
      id: 'c1-ex-lampara', tags: ['c1.S04', 'c1.S05'], block: 'A', title: 'La luz de una lámpara',
      vars: { j: [0, 4, 1], c: [100, 900, 100] },
      derive: function (v) { var t = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13]][v.j]; return { h: t[0], x: t[1], d: t[2] }; },
      statement: function (v) { return '<p>Una lámpara cuelga a $h = ' + v.h + '$ m del piso. En un punto del piso a $x$ metros de la base, la iluminación es $I(x) = \\dfrac{' + v.c + '\\cdot ' + v.h + '}{(x^2 + ' + v.h * v.h + ')^{3/2}}$ lux. Estudia el punto con $x = ' + v.x + '$ m.</p>'; },
      diagram: { id: 'exam-lampara', state: function (v) { return { h: v.h, x: v.x }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return '¿A qué distancia $d$ está ese punto de la lámpara?'; },
          answer: function (v) { return v.d; },
          solution: function (v) { return '$d = \\sqrt{' + v.x + '^2 + ' + v.h + '^2} = ' + v.d + '$ m.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3, unit: 'lux',
          prompt: function () { return 'Con tu $d$ del inciso a), ¿cuánta iluminación recibe? (Nota que $(x^2 + h^2)^{3/2} = d^3$.)'; },
          answer: function (v, prev) { return v.c * v.h / Math.pow(prev[0], 3); },
          solution: function (v) { return '$I = \\dfrac{' + v.c * v.h + '}{' + v.d + '^3} \\approx ' + fx(v.c * v.h / Math.pow(v.d, 3)) + '$ lux.'; }
        },
        {
          label: 'c', type: 'numeric', points: 3, unit: 'lux/m',
          prompt: function () { return 'Con la regla de la cadena, $I\'(x) = -\\dfrac{3x\\,I}{d^2}$. Usa tus incisos a) y b) para calcular $I\'$ en ese punto.'; },
          answer: function (v, prev) { return -3 * v.x * prev[1] / (prev[0] * prev[0]); },
          solution: function (v) { var I = v.c * v.h / Math.pow(v.d, 3); return 'Derivando $(x^2 + h^2)^{-3/2}$: $I\' = -\\dfrac{3\\cdot ' + v.x + '\\cdot ' + fx(I) + '}{' + v.d * v.d + '} \\approx ' + fx(-3 * v.x * I / (v.d * v.d), 4) + '$ lux/m.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: '% por m',
          prompt: function () { return '¿Qué porcentaje de la iluminación del inciso b) se pierde por cada metro que te alejas? Da el cambio relativo $I\'/I$ en porcentaje (será negativo).'; },
          answer: function (v, prev) { return prev[2] / prev[1] * 100; },
          solution: function (v) { return '$\\dfrac{I\'}{I}\\times 100 = -\\dfrac{300x}{d^2} = ' + fx(-300 * v.x / (v.d * v.d), 2) + '\\,\\%$ por metro.'; }
        }
      ]
    }
  ]);
})();
