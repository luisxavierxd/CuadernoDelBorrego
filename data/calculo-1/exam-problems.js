/* =====================================================================
   Problemas de examen · Cálculo 1 (§10.3). Propios y parametrizados.
   part.answer(v, prev): prev son las respuestas DEL ALUMNO en los incisos
   anteriores, para dar crédito por arrastre de error.
   Bloques A (S01–S06), B (S07–S08) y C (S09–S15), con 6–8 problemas por bloque.
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
    },

    /* ================= Bloque B · Optimización (S07–S08) ================= */
    {
      id: 'c1-ex-eficiencia', tags: ['c1.S04', 'c1.S08'], block: 'B', title: 'La velocidad más eficiente',
      vars: { k: [20, 80, 10], s: [2, 6, 1] },
      statement: function (v) { return '<p>La eficiencia de un dron repartidor depende de su velocidad $v$ (m/s) según $E(v) = \\dfrac{' + v.k + 'v}{v^2 + ' + v.s * v.s + '}$ (km por batería).</p>'; },
      diagram: { id: 'exam-grafica', state: function (v) { return { kind: 'eficiencia', k: v.k, c: v.s * v.s }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3, unit: 'm/s',
          prompt: function () { return '¿A qué velocidad es máxima la eficiencia?'; },
          answer: function (v) { return v.s; },
          solution: function (v) { return '$E\'(v) = 0$ cuando $v^2 = ' + v.s * v.s + '$: $v = ' + v.s + '$ m/s (antes $E\' > 0$, después $E\' < 0$).'; }
        },
        {
          label: 'b', type: 'numeric', points: 2, unit: 'km',
          prompt: function () { return 'Con tu velocidad del inciso a), ¿cuál es la eficiencia máxima?'; },
          answer: function (v, prev) { return v.k * prev[0] / (prev[0] * prev[0] + v.s * v.s); },
          solution: function (v) { return '$E(' + v.s + ') = \\dfrac{' + v.k * v.s + '}{' + 2 * v.s * v.s + '} = ' + fx(v.k / (2 * v.s)) + '$ km.'; }
        },
        {
          label: 'c', type: 'numeric', points: 3,
          prompt: function (v) { return 'Con la regla del cociente, calcula $E\'(' + (v.s + 2) + ')$.'; },
          answer: function (v) { var c = v.s * v.s, x = v.s + 2; return v.k * (c - x * x) / Math.pow(x * x + c, 2); },
          solution: function (v) { var c = v.s * v.s, x = v.s + 2; return '$E\'(v) = \\dfrac{' + v.k + '(v^2 + ' + c + ') - ' + v.k + 'v\\cdot 2v}{(v^2 + ' + c + ')^2} = \\dfrac{' + v.k + '(' + c + ' - v^2)}{(v^2 + ' + c + ')^2}$; en $v = ' + x + '$: $\\approx ' + fx(v.k * (c - x * x) / Math.pow(x * x + c, 2), 4) + '$. Negativa: a esa velocidad ya conviene ir más despacio.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: '%',
          prompt: function (v) { return 'Volando a $' + (v.s + 2) + '$ m/s, ¿qué porcentaje de la eficiencia máxima del inciso b) se aprovecha?'; },
          answer: function (v, prev) { var x = v.s + 2; return v.k * x / (x * x + v.s * v.s) / prev[1] * 100; },
          solution: function (v) { var x = v.s + 2, E = v.k * x / (x * x + v.s * v.s); return '$E(' + x + ') \\approx ' + fx(E) + '$, que es el $' + fx(E / (v.k / (2 * v.s)) * 100, 1) + '\\,\\%$ del máximo.'; }
        }
      ]
    },
    {
      id: 'c1-ex-caja', tags: ['c1.S08'], block: 'B', title: 'La caja de lámina',
      vars: { L: [12, 48, 6] },
      statement: function (v) { return '<p>De una lámina cuadrada de ' + v.L + ' cm de lado se recortan cuadros de lado $x$ en las cuatro esquinas y se doblan los lados para formar una caja sin tapa.</p>'; },
      diagram: { id: 'box-cut', state: function (v) { return { L: v.L, x: v.L / 6 }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3, unit: 'cm',
          prompt: function () { return '¿Qué lado $x$ deben tener los cuadros para que el volumen sea máximo?'; },
          answer: function (v) { return v.L / 6; },
          solution: function (v) { return '$V(x) = x(' + v.L + ' - 2x)^2$, $V\'(x) = (' + v.L + ' - 2x)(' + v.L + ' - 6x) = 0$. En el dominio $0 < x < ' + v.L / 2 + '$: $x = ' + fx(v.L / 6) + '$ cm.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3, unit: 'cm³',
          prompt: function () { return 'Con tu $x$ del inciso a), ¿cuál es el volumen máximo?'; },
          answer: function (v, prev) { return prev[0] * Math.pow(v.L - 2 * prev[0], 2); },
          solution: function (v) { var x = v.L / 6; return '$V = ' + fx(x) + '\\,(' + v.L + ' - ' + fx(2 * x) + ')^2 = ' + fx(x * Math.pow(v.L - 2 * x, 2), 2) + '$ cm³.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: 'cm³',
          prompt: function () { return 'Si se recortan cuadros de 2 cm, ¿qué volumen tiene la caja?'; },
          answer: function (v) { return 2 * (v.L - 4) * (v.L - 4); },
          solution: function (v) { return '$V(2) = 2(' + v.L + ' - 4)^2 = ' + 2 * (v.L - 4) * (v.L - 4) + '$ cm³.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: 'cm²',
          prompt: function () { return 'Con ese mismo $x$ del inciso a), ¿cuánta lámina se desperdicia en las cuatro esquinas?'; },
          answer: function (v, prev) { return 4 * prev[0] * prev[0]; },
          solution: function (v) { return '$4x^2 = 4\\,(' + fx(v.L / 6) + ')^2 = ' + fx(4 * v.L * v.L / 36, 2) + '$ cm².'; }
        }
      ]
    },
    {
      id: 'c1-ex-terreno', tags: ['c1.S08'], block: 'B', title: 'Un terreno junto al río',
      diagram: { id: 'exam-river-field', state: function () { return {}; } },
      vars: { B: [1200, 6000, 600], c1: [10, 30, 10], c2: [10, 30, 10] },
      statement: function (v) { return '<p>Se cerca un terreno rectangular junto a un río; el lado del río no lleva cerca. El lado paralelo al río ($y$) cuesta ' + v.c1 + ' pesos/m y cada lado perpendicular ($x$) cuesta ' + v.c2 + ' pesos/m. Hay ' + v.B + ' pesos de presupuesto.</p>'; },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Con $' + '2c_2x + c_1y = B' + '$, ¿qué $x$ maximiza el área?'; },
          answer: function (v) { return v.B / (4 * v.c2); },
          solution: function (v) { return '$y = \\dfrac{' + v.B + ' - ' + 2 * v.c2 + 'x}{' + v.c1 + '}$ y $A(x) = xy$. $A\'(x) = \\dfrac{' + v.B + ' - ' + 4 * v.c2 + 'x}{' + v.c1 + '} = 0 \\Rightarrow x = ' + fx(v.B / (4 * v.c2)) + '$ m.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Con tu $x$ del inciso a), ¿cuánto mide el lado $y$?'; },
          answer: function (v, prev) { return (v.B - 2 * v.c2 * prev[0]) / v.c1; },
          solution: function (v) { return '$y = \\dfrac{' + v.B + ' - ' + 2 * v.c2 + '\\cdot ' + fx(v.B / (4 * v.c2)) + '}{' + v.c1 + '} = ' + fx(v.B / (2 * v.c1)) + '$ m: la mitad del presupuesto va al lado $y$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: 'm²',
          prompt: function () { return 'Con los incisos a) y b), ¿cuál es el área máxima?'; },
          answer: function (v, prev) { return prev[0] * prev[1]; },
          solution: function (v) { return '$A = ' + fx(v.B / (4 * v.c2)) + '\\cdot ' + fx(v.B / (2 * v.c1)) + ' = ' + fx(v.B * v.B / (8 * v.c1 * v.c2), 2) + '$ m².'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: '%',
          prompt: function () { return 'Si el presupuesto sube un 10 %, ¿en qué porcentaje sube el área máxima?'; },
          answer: function () { return 21; },
          solution: function () { return 'El área máxima es $\\tfrac{B^2}{8c_1c_2}$: proporcional a $B^2$. $1.1^2 = 1.21$, sube un 21 %.'; }
        }
      ]
    },
    {
      id: 'c1-ex-cubica-extremos', tags: ['c1.S07'], block: 'B', title: 'Máximos, mínimos e inflexión',
      vars: { a: [1, 3, 1], b: [10, 60, 5] },
      where: function (v) { return v.b !== 4 * Math.pow(v.a, 3); },
      statement: function (v) { return '<p>Considera $f(x) = x^3 - ' + 3 * v.a + 'x^2 + ' + v.b + '$.</p>'; },
      diagram: { id: 'exam-grafica', state: function (v) { return { kind: 'cubica', a: v.a, b: v.b }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3,
          prompt: function () { return 'Además de $x = 0$, ¿en qué $x$ tiene $f$ un punto crítico?'; },
          answer: function (v) { return 2 * v.a; },
          solution: function (v) { return '$f\'(x) = 3x^2 - ' + 6 * v.a + 'x = 3x(x - ' + 2 * v.a + ')$: críticos en 0 y ' + 2 * v.a + '.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3,
          prompt: function () { return 'Evalúa $f$ en tu punto crítico del inciso a).'; },
          answer: function (v, prev) { return Math.pow(prev[0], 3) - 3 * v.a * prev[0] * prev[0] + v.b; },
          solution: function (v) { var x = 2 * v.a; return '$f(' + x + ') = ' + Math.pow(x, 3) + ' - ' + 3 * v.a * x * x + ' + ' + v.b + ' = ' + (v.b - 4 * Math.pow(v.a, 3)) + '$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2,
          prompt: function () { return 'Calcula $f\'\'$ en tu punto crítico del inciso a). (Si es positiva, ahí hay un mínimo.)'; },
          answer: function (v, prev) { return 6 * prev[0] - 6 * v.a; },
          solution: function (v) { return '$f\'\'(x) = 6x - ' + 6 * v.a + '$; en $x = ' + 2 * v.a + '$: $' + 6 * v.a + ' > 0$, mínimo relativo.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2,
          prompt: function () { return '¿En qué $x$ está el punto de inflexión?'; },
          answer: function (v) { return v.a; },
          solution: function (v) { return '$f\'\'(x) = 6x - ' + 6 * v.a + '$ cambia de signo en $x = ' + v.a + '$, justo a la mitad de los dos críticos.'; }
        }
      ]
    },
    {
      id: 'c1-ex-lata', tags: ['c1.S08'], block: 'B', title: 'Una lata con tapas caras',
      diagram: { id: 'exam-can', state: function () { return {}; } },
      vars: { V: [300, 1000, 100], c: [1, 5, 1] },
      statement: function (v) { return '<p>Una lata cilíndrica cerrada debe guardar ' + v.V + ' cm³. La pared cuesta ' + v.c + ' centavos por cm² y las tapas, más gruesas, cuestan el doble. El costo es $C(r) = 2\\cdot(2\\pi r^2)(' + v.c + ') + 2\\pi r h\\,(' + v.c + ')$.</p>'; },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3, unit: 'cm', tol: { rel: 0.005 },
          prompt: function () { return 'Usa $\\pi r^2 h = V$ para dejar $C$ en función de $r$. ¿Qué radio minimiza el costo?'; },
          answer: function (v) { return Math.cbrt(v.V / (4 * Math.PI)); },
          solution: function (v) { return '$C(r) = ' + 4 * v.c + '\\pi r^2 + \\dfrac{' + 2 * v.c * v.V + '}{r}$, $C\'(r) = ' + 8 * v.c + '\\pi r - \\dfrac{' + 2 * v.c * v.V + '}{r^2} = 0 \\Rightarrow r^3 = \\dfrac{' + v.V + '}{4\\pi}$, $r \\approx ' + fx(Math.cbrt(v.V / (4 * Math.PI)), 3) + '$ cm.'; }
        },
        {
          label: 'b', type: 'numeric', points: 2, unit: 'cm', tol: { rel: 0.005 },
          prompt: function () { return 'Con tu radio del inciso a), ¿qué altura tiene la lata?'; },
          answer: function (v, prev) { return v.V / (Math.PI * prev[0] * prev[0]); },
          solution: function (v) { var r = Math.cbrt(v.V / (4 * Math.PI)); return '$h = \\dfrac{' + v.V + '}{\\pi r^2} \\approx ' + fx(v.V / (Math.PI * r * r), 3) + '$ cm.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, tol: { rel: 0.005 },
          prompt: function () { return '¿Cuánto vale el cociente $h/r$ con tus incisos a) y b)?'; },
          answer: function (v, prev) { return prev[1] / prev[0]; },
          solution: function () { return '$h/r = 4$: con tapas al doble de precio, la lata óptima es el doble de alta que la de material uniforme ($h = 2r$).'; }
        },
        {
          label: 'd', type: 'numeric', points: 3, unit: 'centavos', tol: { rel: 0.005 },
          prompt: function () { return 'Con tu radio del inciso a), ¿cuánto cuesta la lata más barata?'; },
          answer: function (v, prev) { return 4 * v.c * Math.PI * prev[0] * prev[0] + 2 * v.c * v.V / prev[0]; },
          solution: function (v) { var r = Math.cbrt(v.V / (4 * Math.PI)); return '$C(r) \\approx ' + fx(4 * v.c * Math.PI * r * r + 2 * v.c * v.V / r, 2) + '$ centavos.'; }
        }
      ]
    },
    {
      id: 'c1-ex-parabola', tags: ['c1.S07', 'c1.S08', 'c1.S05'], block: 'B', title: 'El punto más cercano',
      vars: { m: [1, 4, 1] },
      statement: function (v) { return '<p>Un sensor está en $P = (0, ' + (v.m * v.m + 0.5) + ')$ y un riel sigue la curva $y = x^2$. Se busca el punto del riel, con $x > 0$, más cercano al sensor.</p>'; },
      diagram: { id: 'exam-parabola-dist', state: function (v) { return { m: v.m }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3,
          prompt: function () { return 'Minimiza $d^2(x) = x^2 + (x^2 - k)^2$, con $k$ la altura del sensor. ¿Qué $x$ da la distancia mínima?'; },
          answer: function (v) { return v.m; },
          solution: function (v) { var k = v.m * v.m + 0.5; return '$\\dfrac{d}{dx}d^2 = 2x + 4x(x^2 - ' + k + ') = 2x(2x^2 - ' + (2 * k - 1) + ')$. Con $x > 0$: $x^2 = ' + v.m * v.m + '$, $x = ' + v.m + '$.'; }
        },
        {
          label: 'b', type: 'numeric', points: 2,
          prompt: function () { return '¿Cuál es la coordenada $y$ de ese punto, con tu $x$ del inciso a)?'; },
          answer: function (v, prev) { return prev[0] * prev[0]; },
          solution: function (v) { return '$y = ' + v.m + '^2 = ' + v.m * v.m + '$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 3, tol: { abs: 0.005 },
          prompt: function () { return 'Con los incisos a) y b), ¿cuál es la distancia mínima?'; },
          answer: function (v, prev) { var k = v.m * v.m + 0.5; return Math.sqrt(prev[0] * prev[0] + Math.pow(prev[1] - k, 2)); },
          solution: function (v) { return '$d = \\sqrt{' + v.m * v.m + ' + 0.25} \\approx ' + fx(Math.sqrt(v.m * v.m + 0.25), 3) + '$.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, tol: { abs: 0.005 },
          prompt: function () { return '¿Qué pendiente tiene la recta tangente al riel en ese punto? (Comprueba que es perpendicular al segmento hacia el sensor.)'; },
          answer: function (v, prev) { return 2 * prev[0]; },
          solution: function (v) { return '$y\' = 2x = ' + 2 * v.m + '$. El segmento tiene pendiente $\\dfrac{' + v.m * v.m + ' - ' + (v.m * v.m + 0.5) + '}{' + v.m + '} = -\\dfrac{1}{' + 2 * v.m + '}$: el producto es $-1$.'; }
        }
      ]
    },

    /* ================= Bloque C · S09 ================= */
    {
      id: 'c1-ex-flujo', tags: ['c1.S09'], block: 'C', title: 'Agua que entra a una cisterna',
      vars: { a: [1, 5, 1], T: [4, 12, 4] },
      statement: function (v) { return '<p>Durante ' + v.T + ' minutos entra agua a una cisterna con caudal $r(t) = ' + v.a + 't(' + v.T + ' - t)$ L/min.</p>'; },
      diagram: { id: 'exam-grafica', state: function (v) { return { kind: 'flujo', a: v.a, T: v.T }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3, unit: 'L',
          prompt: function () { return 'Estima el volumen con la suma de punto medio y $n = 4$.'; },
          answer: function (v) { var dx = v.T / 4, s = 0; for (var i = 0; i < 4; i++) { var t = (i + 0.5) * dx; s += v.a * t * (v.T - t) * dx; } return s; },
          solution: function (v) { var dx = v.T / 4, s = 0; for (var i = 0; i < 4; i++) { var t = (i + 0.5) * dx; s += v.a * t * (v.T - t) * dx; } return '$\\Delta t = ' + fx(dx) + '$; las alturas se toman en $t = ' + [0.5, 1.5, 2.5, 3.5].map(function (k) { return fx(k * dx); }).join(',\\ ') + '$. Suma $\\approx ' + fx(s, 3) + '$ L.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3, unit: 'L',
          prompt: function () { return 'Calcula el volumen exacto con el Teorema Fundamental.'; },
          answer: function (v) { return v.a * Math.pow(v.T, 3) / 6; },
          solution: function (v) { return '$\\displaystyle\\int_0^{' + v.T + '} (' + v.a * v.T + 't - ' + v.a + 't^2)\\,dt = \\left[' + fx(v.a * v.T / 2) + 't^2 - ' + fx(v.a / 3) + 't^3\\right]_0^{' + v.T + '} = ' + fx(v.a * Math.pow(v.T, 3) / 6, 3) + '$ L.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: 'L', tol: { abs: 0.05 },
          prompt: function () { return '¿Cuál es el error de tu estimación del inciso a) respecto al valor del inciso b)? (b − a)'; },
          answer: function (v, prev) { return prev[1] - prev[0]; },
          solution: function (v) { var dx = v.T / 4, s = 0; for (var i = 0; i < 4; i++) { var t = (i + 0.5) * dx; s += v.a * t * (v.T - t) * dx; } return 'Exacto menos aproximado: $' + fx(v.a * Math.pow(v.T, 3) / 6 - s, 3) + '$ L. El punto medio se pasa un poco porque la parábola es cóncava hacia abajo.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: 'L/min',
          prompt: function () { return 'Con tu volumen del inciso b), ¿cuál fue el caudal promedio?'; },
          answer: function (v, prev) { return prev[1] / v.T; },
          solution: function (v) { return 'Promedio $= V/' + v.T + ' = ' + fx(v.a * v.T * v.T / 6, 3) + '$ L/min.'; }
        }
      ]
    },
    {
      id: 'c1-ex-ida-vuelta', tags: ['c1.S09', 'c1.S07'], block: 'C', title: 'Un carrito que va y vuelve',
      vars: { k: [1, 4, 1], T: [4, 8, 1] },
      where: function (v) { return v.T >= v.k + 2; },
      statement: function (v) { return '<p>Un carrito se mueve sobre un riel con velocidad $v(t) = t^2 - ' + v.k + 't$ m/s, para $0 \\leq t \\leq ' + v.T + '$ s.</p>'; },
      diagram: { id: 'exam-grafica', state: function (v) { return { kind: 'velocidad', k: v.k, T: v.T }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2, unit: 's',
          prompt: function () { return '¿En qué instante $t > 0$ cambia de sentido?'; },
          answer: function (v) { return v.k; },
          solution: function (v) { return '$v(t) = t(t - ' + v.k + ') = 0$ en $t = ' + v.k + '$; antes es negativa y después positiva.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3, unit: 'm',
          prompt: function (v) { return 'Calcula su desplazamiento entre $t = 0$ y $t = ' + v.T + '$.'; },
          answer: function (v) { return Math.pow(v.T, 3) / 3 - v.k * v.T * v.T / 2; },
          solution: function (v) { return '$\\left[\\tfrac{t^3}{3} - \\tfrac{' + v.k + 't^2}{2}\\right]_0^{' + v.T + '} = ' + fx(Math.pow(v.T, 3) / 3 - v.k * v.T * v.T / 2, 3) + '$ m.'; }
        },
        {
          label: 'c', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Con tus incisos a) y b), ¿qué distancia total recorre? (El retroceso de $0$ a $a)$ mide $\\tfrac{a^3}{6}$ y cuenta dos veces: una por restar y otra por recorrer.)'; },
          answer: function (v, prev) { return prev[1] + Math.pow(prev[0], 3) / 3; },
          solution: function (v) { var disp = Math.pow(v.T, 3) / 3 - v.k * v.T * v.T / 2; return 'De 0 a ' + v.k + ' retrocede $' + fx(Math.pow(v.k, 3) / 6, 3) + '$ m. Distancia $= ' + fx(disp, 3) + ' + 2\\cdot ' + fx(Math.pow(v.k, 3) / 6, 3) + ' = ' + fx(disp + Math.pow(v.k, 3) / 3, 3) + '$ m.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return 'Con tu desplazamiento del inciso b), ¿cuál fue la velocidad media?'; },
          answer: function (v, prev) { return prev[1] / v.T; },
          solution: function (v) { return '$\\bar{v} = \\dfrac{' + fx(Math.pow(v.T, 3) / 3 - v.k * v.T * v.T / 2, 3) + '}{' + v.T + '} = ' + fx((Math.pow(v.T, 3) / 3 - v.k * v.T * v.T / 2) / v.T, 3) + '$ m/s.'; }
        }
      ]
    },

    /* ================= Bloque C · S11–S15 ================= */
    {
      id: 'c1-ex-florero', tags: ['c1.S15', 'c1.S09'], block: 'C', title: 'Un florero torneado',
      vars: { k: [2, 4, 1], L: [10, 30, 10], r: [1, 3, 1] },
      statement: function (v) { return '<p>Un florero se tornea girando la curva $y = ' + v.k + '\\sqrt{x}$, $0 \\leq x \\leq ' + v.L + '$ (en cm), alrededor del eje $x$. Se llena con una llave que da ' + v.r + ' L/min.</p>'; },
      diagram: { id: 'exam-grafica', state: function (v) { return { kind: 'florero', k: v.k, L: v.L }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 4, unit: 'cm³', tol: { rel: 0.005 },
          prompt: function () { return 'Con discos, calcula el volumen del florero.'; },
          answer: function (v) { return Math.PI * v.k * v.k * v.L * v.L / 2; },
          solution: function (v) { return '$V = \\pi\\int_0^{' + v.L + '} ' + v.k * v.k + 'x\\,dx = \\pi\\cdot ' + v.k * v.k + '\\cdot\\tfrac{' + v.L * v.L + '}{2} \\approx ' + fx(Math.PI * v.k * v.k * v.L * v.L / 2, 1) + '$ cm³.'; }
        },
        {
          label: 'b', type: 'numeric', points: 2, unit: 'L', tol: { rel: 0.005 },
          prompt: function () { return 'Con tu volumen del inciso a), ¿cuántos litros caben? (1 L = 1000 cm³)'; },
          answer: function (v, prev) { return prev[0] / 1000; },
          solution: function (v) { return '$' + fx(Math.PI * v.k * v.k * v.L * v.L / 2, 1) + ' / 1000 \\approx ' + fx(Math.PI * v.k * v.k * v.L * v.L / 2000, 3) + '$ L.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: 'min', tol: { rel: 0.005 },
          prompt: function (v) { return 'Con tus litros del inciso b), ¿cuántos minutos tarda en llenarse con ' + v.r + ' L/min?'; },
          answer: function (v, prev) { return prev[1] / v.r; },
          solution: function (v) { return 'Tiempo $= ' + fx(Math.PI * v.k * v.k * v.L * v.L / 2000, 3) + ' / ' + v.r + ' \\approx ' + fx(Math.PI * v.k * v.k * v.L * v.L / (2000 * v.r), 3) + '$ min.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: 'cm', tol: { rel: 0.005 },
          prompt: function (v) { return '¿Qué radio tiene la boca del florero, en $x = ' + v.L + '$?'; },
          answer: function (v) { return v.k * Math.sqrt(v.L); },
          solution: function (v) { return '$y(' + v.L + ') = ' + v.k + '\\sqrt{' + v.L + '} \\approx ' + fx(v.k * Math.sqrt(v.L), 3) + '$ cm.'; }
        }
      ]
    },
    {
      id: 'c1-ex-letrero', tags: ['c1.S14', 'c1.S09'], block: 'C', title: 'Un letrero parabólico',
      vars: { m: [1, 3, 1], c: [100, 500, 100] },
      statement: function (v) { return '<p>Un letrero tiene la forma de la región entre $y = ' + v.m * v.m + ' - x^2$ y el eje $x$ (en metros). La pintura cuesta ' + v.c + ' pesos por m².</p>'; },
      diagram: { id: 'exam-grafica', state: function (v) { return { kind: 'letrero', m: v.m }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return '¿En qué $x > 0$ corta la parábola al eje $x$?'; },
          answer: function (v) { return v.m; },
          solution: function (v) { return '$' + v.m * v.m + ' - x^2 = 0 \\Rightarrow x = ' + v.m + '$.'; }
        },
        {
          label: 'b', type: 'numeric', points: 4, unit: 'm²', tol: { rel: 0.005 },
          prompt: function (v) { return 'Usa tu límite del inciso a) para calcular el área del letrero, $\\int_{-x_0}^{x_0}(' + v.m * v.m + ' - x^2)\\,dx$.'; },
          answer: function (v, prev) { return 2 * (v.m * v.m * prev[0] - Math.pow(prev[0], 3) / 3); },
          solution: function (v) { return '$2\\left[' + v.m * v.m + 'x - \\tfrac{x^3}{3}\\right]_0^{' + v.m + '} = ' + fx(4 * Math.pow(v.m, 3) / 3, 4) + '$ m².'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: 'pesos', tol: { rel: 0.005 },
          prompt: function () { return 'Con tu área del inciso b), ¿cuánto cuesta pintar una cara?'; },
          answer: function (v, prev) { return prev[1] * v.c; },
          solution: function (v) { return '$' + fx(4 * Math.pow(v.m, 3) / 3, 4) + '\\cdot ' + v.c + ' \\approx ' + fx(4 * Math.pow(v.m, 3) / 3 * v.c, 2) + '$ pesos.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: 'm', tol: { rel: 0.005 },
          prompt: function () { return 'Con los incisos a) y b), ¿cuál es la altura promedio del letrero? (área entre el ancho)'; },
          answer: function (v, prev) { return prev[1] / (2 * prev[0]); },
          solution: function (v) { return '$\\bar{h} = \\dfrac{' + fx(4 * Math.pow(v.m, 3) / 3, 4) + '}{' + 2 * v.m + '} = ' + fx(2 * v.m * v.m / 3, 4) + '$ m: dos tercios de la altura máxima.'; }
        }
      ]
    },
    {
      id: 'c1-ex-medicamento', tags: ['c1.S11', 'c1.S07', 'c1.S09'], block: 'C', title: 'Concentración de un medicamento',
      vars: { k: [4, 12, 2], T: [4, 8, 2] },
      statement: function (v) { return '<p>Después de una dosis, la concentración de un medicamento en la sangre es $C(t) = ' + v.k + 't\\,e^{-t}$ mg/L, con $t$ en horas. Se estudian las primeras ' + v.T + ' horas.</p>'; },
      diagram: { id: 'exam-grafica', state: function (v) { return { kind: 'concentracion', k: v.k, T: v.T }; } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 4, unit: 'mg·h/L', tol: { rel: 0.005 },
          prompt: function (v) { return 'Por partes, calcula la exposición total $\\displaystyle\\int_0^{' + v.T + '} C(t)\\,dt$.'; },
          answer: function (v) { return v.k * (1 - (v.T + 1) * Math.exp(-v.T)); },
          solution: function (v) { return '$\\int t\\,e^{-t}dt = -e^{-t}(t + 1)$, así que $' + v.k + '\\left[1 - ' + (v.T + 1) + 'e^{-' + v.T + '}\\right] \\approx ' + fx(v.k * (1 - (v.T + 1) * Math.exp(-v.T)), 4) + '$.'; }
        },
        {
          label: 'b', type: 'numeric', points: 2, unit: 'mg/L', tol: { rel: 0.005 },
          prompt: function (v) { return 'Con tu resultado del inciso a), ¿cuál es la concentración promedio en esas ' + v.T + ' horas?'; },
          answer: function (v, prev) { return prev[0] / v.T; },
          solution: function (v) { return '$\\bar{C} = \\tfrac{1}{' + v.T + '}\\int_0^{' + v.T + '}C \\approx ' + fx(v.k * (1 - (v.T + 1) * Math.exp(-v.T)) / v.T, 4) + '$ mg/L.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: 'h',
          prompt: function () { return '¿En qué instante es máxima la concentración?'; },
          answer: function () { return 1; },
          solution: function (v) { return '$C\'(t) = ' + v.k + 'e^{-t}(1 - t) = 0$ en $t = 1$ h.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: '%', tol: { abs: 0.5 },
          prompt: function () { return 'La concentración máxima es $C(1) = k/e$. ¿Qué porcentaje de ella es tu promedio del inciso b)?'; },
          answer: function (v, prev) { return prev[1] / (v.k / Math.E) * 100; },
          solution: function (v) { var avg = v.k * (1 - (v.T + 1) * Math.exp(-v.T)) / v.T; return '$\\dfrac{' + fx(avg, 4) + '}{' + fx(v.k / Math.E, 4) + '}\\times 100 \\approx ' + fx(avg / (v.k / Math.E) * 100, 1) + '\\,\\%$.'; }
        }
      ]
    }
  ]);

  /* ======== Más problemas por sesión: al menos 2 propios y 3 que la usen (examen de una sesión) ======== */
  var PI = Math.PI;
  ex.c1 = ex.c1.concat([
    /* ---------- S01 · Razón de cambio ---------- */
    {
      id: 'c1-ex-pelota-altura', tags: ['c1.S01'], block: 'A', title: 'La altura de una pelota',
      diagram: { id: 'exam-fn', state: function (v) { var h = function (t) { return v.v0 * t - 4.9 * t * t; }; return { x: [0, v.v0 / 4.9], fns: [{ f: h }], secant: { f: h, x1: 1, x2: 2 }, tangent: { f: h, x0: 1 }, xlab: 't (s)', ylab: 'h (m)', label: 'Altura de la pelota con la secante entre 1 y 2 s y la tangente en 1 s.' }; } },
      vars: { v0: [15, 30, 1] },
      statement: function (v) { return '<p>Una pelota se lanza hacia arriba y su altura es $h(t) = ' + v.v0 + 't - 4.9t^2$ (m, con $t$ en s).</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'm/s',
          prompt: function () { return '¿Cuál es la velocidad promedio entre $t = 1$ y $t = 2$ s?'; },
          answer: function (v) { return v.v0 - 14.7; },
          solution: function (v) { return '$\\dfrac{h(2) - h(1)}{1} = ' + fx(2 * v.v0 - 19.6) + ' - ' + fx(v.v0 - 4.9) + ' = ' + fx(v.v0 - 14.7) + '$ m/s.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'm/s',
          prompt: function () { return '¿Cuál es la velocidad instantánea en $t = 1$ s?'; },
          answer: function (v) { return v.v0 - 9.8; },
          solution: function (v) { return '$h\'(t) = ' + v.v0 + ' - 9.8t$, así que $h\'(1) = ' + fx(v.v0 - 9.8) + '$ m/s.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return 'Con tus resultados de a) y b), ¿cuánto mayor es la instantánea en $t = 1$ que la promedio?'; },
          answer: function (v, prev) { return prev[1] - prev[0]; },
          solution: function () { return '$' + '4.9' + '$ m/s: la pelota va frenando, así que al principio del intervalo va más rápido que en promedio.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return 'Con tu velocidad de b), usa la recta tangente en $t = 1$ para estimar $h(1.5)$.'; },
          answer: function (v, prev) { return (v.v0 - 4.9) + 0.5 * prev[1]; },
          solution: function (v) { return '$h(1) + 0.5\\,h\'(1) = ' + fx(v.v0 - 4.9) + ' + 0.5(' + fx(v.v0 - 9.8) + ') = ' + fx(v.v0 - 4.9 + 0.5 * (v.v0 - 9.8)) + '$ m.'; } }
      ]
    },
    {
      id: 'c1-ex-costo-marginal', tags: ['c1.S01'], block: 'A', title: 'Costo de producir una unidad más',
      diagram: { id: 'exam-fn', state: function (v) { var C = function (q) { return v.F + v.c * q + 0.001 * v.k * q * q * q; }; return { x: [0, 30], fns: [{ f: C }], secant: { f: C, x1: 10, x2: 20 }, tangent: { f: C, x0: 15 }, xlab: 'q', ylab: 'C (pesos)', label: 'Costo con la secante de 10 a 20 y la tangente en 15.' }; } },
      vars: { F: [100, 500, 50], c: [2, 10, 1], k: [1, 9, 1] },
      statement: function (v) { return '<p>Producir $q$ piezas cuesta $C(q) = ' + v.F + ' + ' + v.c + 'q + 0.00' + v.k + 'q^3$ pesos.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'pesos/pieza',
          prompt: function () { return '¿Cuál es la razón de cambio promedio del costo entre $q = 10$ y $q = 20$?'; },
          answer: function (v) { return v.c + 0.001 * v.k * 700; },
          solution: function (v) { return '$\\dfrac{C(20) - C(10)}{10} = ' + v.c + ' + 0.00' + v.k + '\\cdot\\dfrac{8000 - 1000}{10} = ' + fx(v.c + 0.7 * v.k) + '$.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'pesos/pieza',
          prompt: function () { return '¿Cuánto vale el costo marginal $C\'(15)$?'; },
          answer: function (v) { return v.c + 0.003 * v.k * 225; },
          solution: function (v) { return '$C\'(q) = ' + v.c + ' + ' + fx(0.003 * v.k, 4) + 'q^2$; $C\'(15) = ' + fx(v.c + 0.675 * v.k) + '$.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'pesos',
          prompt: function () { return 'Con tu costo marginal de b), estima $C(16)$ a partir de $C(15)$.'; },
          answer: function (v, prev) { return v.F + 15 * v.c + 0.001 * v.k * 3375 + prev[1]; },
          solution: function (v) { var C15 = v.F + 15 * v.c + 3.375 * v.k; return '$C(15) + C\'(15) = ' + fx(C15) + ' + ' + fx(v.c + 0.675 * v.k) + ' = ' + fx(C15 + v.c + 0.675 * v.k) + '$ pesos.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'pesos/pieza',
          prompt: function () { return 'Con tus a) y b), ¿cuánto se aleja la razón promedio del costo marginal en $q = 15$?'; },
          answer: function (v, prev) { return prev[0] - prev[1]; },
          solution: function (v) { return '$' + fx(v.c + 0.7 * v.k) + ' - ' + fx(v.c + 0.675 * v.k) + ' = ' + fx(0.025 * v.k) + '$: casi iguales, porque 15 es el centro del intervalo.'; } }
      ]
    },
    /* ---------- S02 · Fórmulas directas ---------- */
    {
      id: 'c1-ex-poblacion-exp', tags: ['c1.S02'], block: 'A', title: 'Una población que crece',
      diagram: { id: 'exam-fn', state: function (v) { var P = function (t) { return v.P0 * Math.exp(v.r * t); }, td = Math.log(2) / v.r; return { x: [0, Math.max(v.T, td) * 1.25], fns: [{ f: P }], tangent: { f: P, x0: v.T }, hlines: [{ y: 2 * v.P0, label: '2P₀' }], xlab: 't (años)', ylab: 'P', label: 'La población crece exponencialmente.' }; } },
      vars: { P0: [100, 1000, 100], r: [0.02, 0.1, 0.01], T: [5, 20, 5] },
      statement: function (v) { return '<p>Una población crece como $P(t) = ' + v.P0 + 'e^{' + v.r + 't}$ (individuos, $t$ en años).</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'ind/año',
          prompt: function (v) { return '¿A qué ritmo crece en $t = ' + v.T + '$?'; },
          answer: function (v) { return v.r * v.P0 * Math.exp(v.r * v.T); },
          solution: function (v) { return '$P\'(t) = ' + fx(v.r * v.P0) + 'e^{' + v.r + 't}$; en $t = ' + v.T + '$: $' + fx(v.r * v.P0 * Math.exp(v.r * v.T), 2) + '$.'; } },
        { label: 'b', type: 'numeric', points: 2,
          prompt: function (v) { return 'Con tu ritmo de a), divídelo entre $P(' + v.T + ')$. ¿Qué obtienes?'; },
          answer: function (v, prev) { return prev[0] / (v.P0 * Math.exp(v.r * v.T)); },
          solution: function (v) { return '$P\'/P = ' + v.r + '$: la tasa relativa es constante.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'años',
          prompt: function () { return '¿En cuánto tiempo se duplica la población?'; },
          answer: function (v) { return Math.log(2) / v.r; },
          solution: function (v) { return '$e^{' + v.r + 't} = 2 \\Rightarrow t = \\dfrac{\\ln 2}{' + v.r + '} = ' + fx(Math.log(2) / v.r, 2) + '$ años.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'ind/año',
          prompt: function () { return 'Con tu tiempo de c), ¿a qué ritmo crece en ese momento?'; },
          answer: function (v, prev) { return v.r * v.P0 * Math.exp(v.r * Math.abs(prev[2])); },
          solution: function (v) { return 'Ahí $P = ' + 2 * v.P0 + '$, así que $P\' = ' + v.r + '\\cdot ' + 2 * v.P0 + ' = ' + fx(2 * v.r * v.P0) + '$.'; } }
      ]
    },
    {
      id: 'c1-ex-cubica-log', tags: ['c1.S02'], block: 'A', title: 'Una curva con logaritmo',
      diagram: { id: 'exam-fn', state: function (v) { var f = function (x) { return v.a * x * x * x - v.b * Math.log(x); }, m = Math.pow(v.b / (3 * v.a), 1 / 3); return { x: [0.15, Math.max(3, m * 1.8)], fns: [{ f: f }], tangent: { f: f, x0: 2, len: 0.6 }, pts: [{ x: m, y: f(m), label: 'mínimo' }], xlab: 'x', ylab: 'f(x)', label: 'La curva con su tangente en x = 2 y su mínimo.' }; } },
      vars: { a: [1, 5, 1], b: [2, 30, 2] },
      where: function (v) { return Math.pow(v.b / (3 * v.a), 1 / 3) !== 2; },
      statement: function (v) { return '<p>Sea $f(x) = ' + v.a + 'x^3 - ' + v.b + '\\ln x$ para $x > 0$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3,
          prompt: function () { return '¿Cuánto vale $f\'(2)$?'; },
          answer: function (v) { return 12 * v.a - v.b / 2; },
          solution: function (v) { return '$f\'(x) = ' + 3 * v.a + 'x^2 - \\dfrac{' + v.b + '}{x}$; $f\'(2) = ' + fx(12 * v.a - v.b / 2) + '$.'; } },
        { label: 'b', type: 'numeric', points: 2,
          prompt: function () { return 'Con tu pendiente de a), ¿en qué valor corta al eje $y$ la tangente en $x = 2$?'; },
          answer: function (v, prev) { return 8 * v.a - v.b * Math.log(2) - 2 * prev[0]; },
          solution: function (v) { var f2 = 8 * v.a - v.b * Math.log(2); return '$y = f(2) + f\'(2)(x - 2)$; en $x = 0$: $' + fx(f2) + ' - 2(' + fx(12 * v.a - v.b / 2) + ') = ' + fx(f2 - 2 * (12 * v.a - v.b / 2)) + '$.'; } },
        { label: 'c', type: 'numeric', points: 3,
          prompt: function () { return '¿En qué $x$ tiene tangente horizontal?'; },
          answer: function (v) { return Math.pow(v.b / (3 * v.a), 1 / 3); },
          solution: function (v) { return '$' + 3 * v.a + 'x^3 = ' + v.b + ' \\Rightarrow x = \\sqrt[3]{' + fx(v.b / (3 * v.a)) + '} = ' + fx(Math.pow(v.b / (3 * v.a), 1 / 3)) + '$.'; } },
        { label: 'd', type: 'numeric', points: 2,
          prompt: function () { return 'Con tu $x$ de c), ¿cuánto vale $f$ ahí?'; },
          answer: function (v, prev) { var p = Math.abs(prev[2]); return v.a * p * p * p - v.b * Math.log(p); },
          solution: function (v) { var p = Math.pow(v.b / (3 * v.a), 1 / 3); return '$f(' + fx(p) + ') = ' + fx(v.a * p * p * p - v.b * Math.log(p)) + '$ (el mínimo de $f$).'; } }
      ]
    },
    /* ---------- S03 · Regla del producto ---------- */
    {
      id: 'c1-ex-ingreso-producto', tags: ['c1.S03'], block: 'A', title: 'Ingreso con precio y ventas que cambian',
      diagram: { id: 'exam-fn', state: function (v) { var R = function (t) { return (v.p0 + v.al * t) * (v.q0 - v.be * t); }, tm = (v.al * v.q0 - v.be * v.p0) / (2 * v.al * v.be); return { x: [0, tm * 2], fns: [{ f: R }], tangent: { f: R, x0: v.T }, pts: [{ x: tm, y: R(tm), label: 'máximo' }], xlab: 't (semanas)', ylab: 'R (pesos)', label: 'El ingreso sube, llega a un máximo y baja.' }; } },
      vars: { p0: [20, 60, 5], al: [1, 5, 1], q0: [200, 600, 50], be: [2, 10, 1], T: [1, 5, 1] },
      where: function (v) { var t = (v.al * v.q0 - v.be * v.p0) / (2 * v.al * v.be); return t > v.T + 1 && t < 40 && v.q0 - v.be * t > 0; },
      statement: function (v) { return '<p>El precio de un producto sube como $p(t) = ' + v.p0 + ' + ' + v.al + 't$ pesos y las ventas bajan como $q(t) = ' + v.q0 + ' - ' + v.be + 't$ piezas por semana. El ingreso es $R(t) = p(t)\\,q(t)$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'pesos/sem',
          prompt: function (v) { return '¿A qué ritmo cambia el ingreso en $t = ' + v.T + '$?'; },
          answer: function (v) { return v.al * (v.q0 - v.be * v.T) - v.be * (v.p0 + v.al * v.T); },
          solution: function (v) { return '$R\' = p\'q + pq\' = ' + v.al + '(' + (v.q0 - v.be * v.T) + ') - ' + v.be + '(' + (v.p0 + v.al * v.T) + ') = ' + (v.al * (v.q0 - v.be * v.T) - v.be * (v.p0 + v.al * v.T)) + '$.'; } },
        { label: 'b', type: 'numeric', points: 2, unit: '%',
          prompt: function (v) { return 'Con tu ritmo de a), ¿en qué porcentaje del ingreso $R(' + v.T + ')$ cambia por semana en ese momento?'; },
          answer: function (v, prev) { return 100 * prev[0] / ((v.p0 + v.al * v.T) * (v.q0 - v.be * v.T)); },
          solution: function (v) { var R = (v.p0 + v.al * v.T) * (v.q0 - v.be * v.T), d = v.al * (v.q0 - v.be * v.T) - v.be * (v.p0 + v.al * v.T); return '$R(' + v.T + ') = ' + R + '$; $100\\cdot\\dfrac{' + d + '}{' + R + '} = ' + fx(100 * d / R, 2) + '$ %.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'semanas',
          prompt: function () { return '¿En qué semana $t$ es máximo el ingreso?'; },
          answer: function (v) { return (v.al * v.q0 - v.be * v.p0) / (2 * v.al * v.be); },
          solution: function (v) { return '$R\'(t) = ' + v.al + '(' + v.q0 + ' - ' + v.be + 't) - ' + v.be + '(' + v.p0 + ' + ' + v.al + 't) = 0 \\Rightarrow t = ' + fx((v.al * v.q0 - v.be * v.p0) / (2 * v.al * v.be)) + '$.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'pesos',
          prompt: function () { return 'Con tu $t$ de c), ¿cuál es el ingreso máximo?'; },
          answer: function (v, prev) { return (v.p0 + v.al * prev[2]) * (v.q0 - v.be * prev[2]); },
          solution: function (v) { var t = (v.al * v.q0 - v.be * v.p0) / (2 * v.al * v.be); return '$R = (' + fx(v.p0 + v.al * t) + ')(' + fx(v.q0 - v.be * t) + ') = ' + fx((v.p0 + v.al * t) * (v.q0 - v.be * t), 2) + '$ pesos.'; } }
      ]
    },
    {
      id: 'c1-ex-xekx', tags: ['c1.S03'], block: 'A', title: 'Una función por una exponencial',
      diagram: { id: 'exam-fn', state: function (v) { var f = function (x) { return x * Math.exp(-v.k * x); }; return { x: [0, 5 / v.k], fns: [{ f: f }], tangent: { f: f, x0: 0.5, len: 0.5 / v.k }, pts: [{ x: 1 / v.k, y: f(1 / v.k), label: 'máximo' }], xlab: 'x', ylab: 'f(x)', label: 'La función sube hasta su máximo y luego decae.' }; } },
      vars: { k: [0.5, 3, 0.5] },
      statement: function (v) { return '<p>Sea $f(x) = x\\,e^{-' + v.k + 'x}$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3,
          prompt: function () { return '¿Cuánto vale $f\'(0.5)$?'; },
          answer: function (v) { return Math.exp(-v.k * 0.5) * (1 - v.k * 0.5); },
          solution: function (v) { return '$f\'(x) = e^{-' + v.k + 'x}(1 - ' + v.k + 'x)$; $f\'(0.5) = ' + fx(Math.exp(-v.k * 0.5) * (1 - v.k * 0.5)) + '$.'; } },
        { label: 'b', type: 'numeric', points: 3,
          prompt: function () { return '¿En qué $x$ tiene su máximo?'; },
          answer: function (v) { return 1 / v.k; },
          solution: function (v) { return '$1 - ' + v.k + 'x = 0 \\Rightarrow x = ' + fx(1 / v.k) + '$.'; } },
        { label: 'c', type: 'numeric', points: 2,
          prompt: function () { return 'Con tu $x$ de b), ¿cuál es el valor máximo?'; },
          answer: function (v, prev) { return prev[1] * Math.exp(-v.k * prev[1]); },
          solution: function (v) { return '$f(1/k) = \\dfrac{1}{' + v.k + 'e} = ' + fx(1 / (v.k * Math.E)) + '$.'; } },
        { label: 'd', type: 'numeric', points: 2,
          prompt: function () { return 'Con tu $x$ de b), ¿cuánto vale $f\'\'$ ahí? (Debe ser negativo.)'; },
          answer: function (v, prev) { return Math.exp(-v.k * prev[1]) * (v.k * v.k * prev[1] - 2 * v.k); },
          solution: function (v) { return '$f\'\'(x) = e^{-kx}(k^2x - 2k)$; en $1/k$: $-\\dfrac{' + v.k + '}{e} = ' + fx(-v.k / Math.E) + '$.'; } },
        { label: 'e', type: 'numeric', points: 2,
          prompt: function () { return 'Con tu pendiente de a), usa la tangente en $x = 0.5$ para estimar $f(0.7)$.'; },
          answer: function (v, prev) { return 0.5 * Math.exp(-v.k * 0.5) + 0.2 * prev[0]; },
          solution: function (v) { var f = 0.5 * Math.exp(-v.k * 0.5), d = Math.exp(-v.k * 0.5) * (1 - v.k * 0.5); return '$f(0.5) + 0.2f\'(0.5) = ' + fx(f) + ' + ' + fx(0.2 * d) + ' = ' + fx(f + 0.2 * d) + '$.'; } }
      ]
    },
    {
      id: 'c1-ex-x2sen', tags: ['c1.S03'], block: 'A', title: 'La pendiente de x² sen x',
      diagram: { id: 'exam-fn', state: function (v) { var f = function (x) { return x * x * Math.sin(x); }; return { x: [0, 3.4], fns: [{ f: f }], tangent: { f: f, x0: v.x0, len: 0.5 }, xlab: 'x', ylab: 'f(x)', label: 'La curva y su tangente en el punto pedido.' }; } },
      vars: { x0: [0.5, 2.5, 0.5] },
      statement: function (v) { return '<p>Sea $f(x) = x^2\\sin x$ ($x$ en radianes) y el punto $x_0 = ' + v.x0 + '$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3,
          prompt: function () { return '¿Cuánto vale $f\'(x_0)$?'; },
          answer: function (v) { return 2 * v.x0 * Math.sin(v.x0) + v.x0 * v.x0 * Math.cos(v.x0); },
          solution: function (v) { return '$f\'(x) = 2x\\sin x + x^2\\cos x$; en $' + v.x0 + '$: $' + fx(2 * v.x0 * Math.sin(v.x0) + v.x0 * v.x0 * Math.cos(v.x0)) + '$.'; } },
        { label: 'b', type: 'numeric', points: 3,
          prompt: function () { return 'Con tu pendiente de a), usa la tangente para estimar $f(x_0 + 0.1)$.'; },
          answer: function (v, prev) { return v.x0 * v.x0 * Math.sin(v.x0) + 0.1 * prev[0]; },
          solution: function (v) { var f = v.x0 * v.x0 * Math.sin(v.x0), d = 2 * v.x0 * Math.sin(v.x0) + v.x0 * v.x0 * Math.cos(v.x0); return '$f(x_0) + 0.1f\'(x_0) = ' + fx(f) + ' + ' + fx(0.1 * d) + ' = ' + fx(f + 0.1 * d) + '$.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: '°',
          prompt: function () { return 'Con tu pendiente de a), ¿qué ángulo forma la tangente con el eje $x$?'; },
          answer: function (v, prev) { return Math.atan(prev[0]) * 180 / PI; }, tol: { abs: 0.3 },
          solution: function (v) { return '$\\arctan(' + fx(2 * v.x0 * Math.sin(v.x0) + v.x0 * v.x0 * Math.cos(v.x0)) + ') = ' + fx(Math.atan(2 * v.x0 * Math.sin(v.x0) + v.x0 * v.x0 * Math.cos(v.x0)) * 180 / PI, 2) + '^\\circ$.'; } }
      ]
    },
    /* ---------- S04 · Regla del cociente ---------- */
    {
      id: 'c1-ex-concentracion', tags: ['c1.S04'], block: 'A', title: 'Un medicamento en la sangre',
      diagram: { id: 'exam-fn', state: function (v) { var C = function (t) { return v.a * t / (t * t + v.b); }, tm = Math.sqrt(v.b); return { x: [0, tm * 4], fns: [{ f: C }], tangent: { f: C, x0: 1, len: tm * 0.5 }, pts: [{ x: tm, y: C(tm), label: 'máxima' }], xlab: 't (h)', ylab: 'C (mg/L)', label: 'La concentración sube, llega a un máximo y baja.' }; } },
      vars: { a: [5, 20, 1], b: [2, 16, 1] },
      statement: function (v) { return '<p>La concentración de un medicamento es $C(t) = \\dfrac{' + v.a + 't}{t^2 + ' + v.b + '}$ (mg/L, $t$ en horas).</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'mg/L por h',
          prompt: function () { return '¿A qué ritmo cambia en $t = 1$ h?'; },
          answer: function (v) { return v.a * (v.b - 1) / Math.pow(1 + v.b, 2); },
          solution: function (v) { return '$C\'(t) = \\dfrac{' + v.a + '(' + v.b + ' - t^2)}{(t^2 + ' + v.b + ')^2}$; $C\'(1) = ' + fx(v.a * (v.b - 1) / Math.pow(1 + v.b, 2)) + '$.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'h',
          prompt: function () { return '¿A qué hora es máxima la concentración?'; },
          answer: function (v) { return Math.sqrt(v.b); },
          solution: function (v) { return '$' + v.b + ' - t^2 = 0 \\Rightarrow t = \\sqrt{' + v.b + '} = ' + fx(Math.sqrt(v.b)) + '$ h.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'mg/L',
          prompt: function () { return 'Con tu hora de b), ¿cuál es la concentración máxima?'; },
          answer: function (v, prev) { return v.a * prev[1] / (prev[1] * prev[1] + v.b); },
          solution: function (v) { return '$C(\\sqrt b) = \\dfrac{' + v.a + '}{2\\sqrt{' + v.b + '}} = ' + fx(v.a / (2 * Math.sqrt(v.b))) + '$ mg/L.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'mg/L',
          prompt: function () { return 'Con tu ritmo de a), estima la concentración en $t = 1.2$ h con la tangente en $t = 1$.'; },
          answer: function (v, prev) { return v.a / (1 + v.b) + 0.2 * prev[0]; },
          solution: function (v) { var C = v.a / (1 + v.b), d = v.a * (v.b - 1) / Math.pow(1 + v.b, 2); return '$C(1) + 0.2C\'(1) = ' + fx(C) + ' + ' + fx(0.2 * d) + ' = ' + fx(C + 0.2 * d) + '$ mg/L.'; } }
      ]
    },
    {
      id: 'c1-ex-costo-promedio-min', tags: ['c1.S04'], block: 'A', title: 'El costo promedio más bajo',
      diagram: { id: 'exam-fn', state: function (v) { var A = function (q) { return (v.F + v.c * q + v.k * q * q) / q; }, qm = Math.sqrt(v.F / v.k); return { x: [qm * 0.2, qm * 3], fns: [{ f: A }], tangent: { f: A, x0: v.q0, len: qm * 0.35 }, pts: [{ x: qm, y: A(qm), label: 'mínimo' }], xlab: 'q', ylab: 'A (pesos/pieza)', label: 'El costo promedio baja hasta un mínimo y vuelve a subir.' }; } },
      vars: { F: [100, 1000, 100], c: [1, 10, 1], k: [0.1, 2, 0.1], q0: [5, 20, 5] },
      where: function (v) { var d = (v.k * v.q0 * v.q0 - v.F) / (v.q0 * v.q0); return Math.abs(Math.sqrt(v.F / v.k) - v.q0) > 2 && Math.abs(d + 2.7) > 0.4; },
      statement: function (v) { return '<p>El costo total de producir $q$ piezas es $C(q) = ' + v.F + ' + ' + v.c + 'q + ' + v.k + 'q^2$ y el costo promedio es $A(q) = \\dfrac{C(q)}{q}$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3,
          prompt: function (v) { return '¿Cuánto vale $A\'(' + v.q0 + ')$?'; },
          answer: function (v) { return (v.k * v.q0 * v.q0 - v.F) / (v.q0 * v.q0); },
          solution: function (v) { return '$A\'(q) = \\dfrac{C\'(q)\\,q - C(q)}{q^2} = \\dfrac{' + v.k + 'q^2 - ' + v.F + '}{q^2}$; en $' + v.q0 + '$: $' + fx((v.k * v.q0 * v.q0 - v.F) / (v.q0 * v.q0)) + '$.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'piezas',
          prompt: function () { return '¿Qué $q$ minimiza el costo promedio?'; },
          answer: function (v) { return Math.sqrt(v.F / v.k); },
          solution: function (v) { return '$' + v.k + 'q^2 = ' + v.F + ' \\Rightarrow q = ' + fx(Math.sqrt(v.F / v.k)) + '$.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'pesos/pieza',
          prompt: function () { return 'Con tu $q$ de b), ¿cuál es el costo promedio mínimo?'; },
          answer: function (v, prev) { var q = Math.abs(prev[1]); return v.F / q + v.c + v.k * q; },
          solution: function (v) { var q = Math.sqrt(v.F / v.k); return '$A = \\dfrac{' + v.F + '}{' + fx(q) + '} + ' + v.c + ' + ' + v.k + '(' + fx(q) + ') = ' + fx(v.F / q + v.c + v.k * q) + '$.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'pesos',
          prompt: function () { return 'Con tus b) y c), ¿cuánto cuesta en total producir esa cantidad?'; },
          answer: function (v, prev) { return prev[1] * prev[2]; },
          solution: function (v) { var q = Math.sqrt(v.F / v.k); return '$qA = ' + fx(q * (v.F / q + v.c + v.k * q), 2) + '$ pesos.'; } },
        { label: 'e', type: 'numeric', points: 2, unit: 'pesos/pieza',
          prompt: function (v) { return 'Con tu $A\'(' + v.q0 + ')$ de a), ¿cuánto cambia (aprox.) el costo promedio si se producen 5 piezas más?'; },
          answer: function (v, prev) { return 5 * prev[0]; },
          solution: function (v) { return '$\\Delta A \\approx 5A\'(' + v.q0 + ') = ' + fx(5 * (v.k * v.q0 * v.q0 - v.F) / (v.q0 * v.q0)) + '$ (negativo: el promedio baja).'; } }
      ]
    },
    /* ---------- S05 · Regla de la cadena ---------- */
    {
      id: 'c1-ex-resorte-oscila', tags: ['c1.S05'], block: 'A', title: 'Una masa que oscila',
      diagram: { id: 'exam-fn', state: function (v) { var x = function (t) { return v.A * Math.sin(v.w * t); }; return { x: [0, 4 * Math.PI / v.w], fns: [{ f: x }], tangent: { f: x, x0: v.T, len: 0.4 / v.w }, xlab: 't (s)', ylab: 'x (cm)', label: 'La posición oscila; la tangente es la velocidad en el instante pedido.' }; } },
      vars: { A: [2, 10, 1], w: [1, 4, 0.5], T: [0.5, 3, 0.5] },
      statement: function (v) { return '<p>La posición de una masa es $x(t) = ' + v.A + '\\sin(' + v.w + 't)$ (cm, $t$ en s).</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'cm/s',
          prompt: function (v) { return '¿Qué velocidad tiene en $t = ' + v.T + '$ s?'; },
          answer: function (v) { return v.A * v.w * Math.cos(v.w * v.T); },
          solution: function (v) { return '$x\'(t) = ' + fx(v.A * v.w) + '\\cos(' + v.w + 't)$; en $' + v.T + '$: $' + fx(v.A * v.w * Math.cos(v.w * v.T)) + '$ cm/s.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'cm/s²',
          prompt: function (v) { return '¿Qué aceleración tiene en $t = ' + v.T + '$ s?'; },
          answer: function (v) { return -v.A * v.w * v.w * Math.sin(v.w * v.T); },
          solution: function (v) { return '$x\'\'(t) = -' + fx(v.A * v.w * v.w) + '\\sin(' + v.w + 't) = ' + fx(-v.A * v.w * v.w * Math.sin(v.w * v.T)) + '$.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'cm/s',
          prompt: function () { return '¿Cuál es su rapidez máxima?'; },
          answer: function (v) { return v.A * v.w; },
          solution: function (v) { return 'Cuando $\\cos = \\pm 1$: $' + fx(v.A * v.w) + '$ cm/s.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: '%',
          prompt: function () { return 'Con tus a) y c), ¿qué porcentaje de la rapidez máxima lleva en ese instante?'; },
          answer: function (v, prev) { return 100 * Math.abs(prev[0]) / Math.abs(prev[2]); },
          solution: function (v) { return '$100\\,|\\cos(' + fx(v.w * v.T) + ')| = ' + fx(100 * Math.abs(Math.cos(v.w * v.T)), 1) + '$ %.'; } }
      ]
    },
    {
      id: 'c1-ex-globo', tags: ['c1.S05'], block: 'A', title: 'Un globo que se infla',
      diagram: { id: 'exam-balloon', state: function () { return { r0: 55, r1: 95 }; } },
      vars: { r0: [2, 10, 1], k: [5, 50, 5], T: [1, 10, 1] },
      statement: function (v) { return '<p>El radio de un globo es $r(t) = \\sqrt{' + v.r0 * v.r0 + ' + ' + v.k + 't}$ (cm, $t$ en s) y su volumen es $V = \\tfrac{4}{3}\\pi r^3$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'cm',
          prompt: function (v) { return '¿Cuánto mide el radio en $t = ' + v.T + '$ s?'; },
          answer: function (v) { return Math.sqrt(v.r0 * v.r0 + v.k * v.T); },
          solution: function (v) { return '$r = \\sqrt{' + (v.r0 * v.r0 + v.k * v.T) + '} = ' + fx(Math.sqrt(v.r0 * v.r0 + v.k * v.T)) + '$ cm.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'cm/s',
          prompt: function () { return 'Con tu radio de a), ¿a qué ritmo crece el radio en ese instante?'; },
          answer: function (v, prev) { return v.k / (2 * Math.abs(prev[0])); },
          solution: function (v) { return '$r\'(t) = \\dfrac{' + v.k + '}{2\\sqrt{\\cdots}} = \\dfrac{' + v.k + '}{2r} = ' + fx(v.k / (2 * Math.sqrt(v.r0 * v.r0 + v.k * v.T))) + '$ cm/s.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: 'cm³/s',
          prompt: function () { return 'Con tus a) y b), ¿a qué ritmo crece el volumen?'; },
          answer: function (v, prev) { return 4 * PI * prev[0] * prev[0] * prev[1]; },
          solution: function (v) { var r = Math.sqrt(v.r0 * v.r0 + v.k * v.T); return '$V\' = 4\\pi r^2 r\' = 4\\pi(' + fx(r) + ')^2(' + fx(v.k / (2 * r)) + ') = ' + fx(4 * PI * r * r * v.k / (2 * r), 2) + '$ cm³/s.'; } }
      ]
    },
    /* ---------- S06 · Derivación implícita ---------- */
    {
      id: 'c1-ex-circulo-tangente', tags: ['c1.S06'], block: 'A', title: 'La tangente a un círculo',
      diagram: { id: 'exam-fn', state: function (v) { var R = v.R, up = function (x) { return Math.sqrt(R * R - x * x); }, lo = function (x) { return -Math.sqrt(R * R - x * x); }; return { x: [-R * 1.4, R * 1.4], y: [-R * 1.15, R * 1.5], equal: true, curves: [{ xy: function (t) { return [R * Math.cos(t), R * Math.sin(t)]; }, t0: 0, t1: 2 * Math.PI }], tangent: { f: up, x0: v.x0, len: R * 0.7 }, xlab: 'x', ylab: 'y', label: 'El círculo y su tangente en el punto de arriba.' }; } },
      vars: { R: [5, 13, 1], x0: [1, 4, 1] },
      statement: function (v) { return '<p>Considera el círculo $x^2 + y^2 = ' + v.R * v.R + '$ y su punto de la mitad superior con $x = ' + v.x0 + '$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2,
          prompt: function () { return '¿Cuánto vale $y$ en ese punto?'; },
          answer: function (v) { return Math.sqrt(v.R * v.R - v.x0 * v.x0); },
          solution: function (v) { return '$y = \\sqrt{' + (v.R * v.R - v.x0 * v.x0) + '} = ' + fx(Math.sqrt(v.R * v.R - v.x0 * v.x0)) + '$.'; } },
        { label: 'b', type: 'numeric', points: 3,
          prompt: function () { return 'Con tu $y$ de a), ¿cuánto vale $dy/dx$ ahí?'; },
          answer: function (v, prev) { return -v.x0 / prev[0]; },
          solution: function (v) { return '$2x + 2y\\,y\' = 0 \\Rightarrow y\' = -\\dfrac{x}{y} = ' + fx(-v.x0 / Math.sqrt(v.R * v.R - v.x0 * v.x0)) + '$.'; } },
        { label: 'c', type: 'numeric', points: 3,
          prompt: function () { return 'Con tus a) y b), ¿en qué valor corta la tangente al eje $y$?'; },
          answer: function (v, prev) { return prev[0] - prev[1] * v.x0; },
          solution: function (v) { var y = Math.sqrt(v.R * v.R - v.x0 * v.x0); return '$y = y_0 + m(x - x_0)$; en $x = 0$: $\\dfrac{R^2}{y_0} = ' + fx(v.R * v.R / y) + '$.'; } }
      ]
    },
    {
      id: 'c1-ex-escalera', tags: ['c1.S06'], block: 'A', title: 'La escalera que resbala',
      diagram: { id: 'exam-ladder', state: function (v) { return { L: v.L, x: v.x0, u: v.u + ' m/s' }; } },
      vars: { L: [4, 10, 1], x0: [1, 3, 0.5], u: [0.2, 1, 0.1] },
      statement: function (v) { return '<p>Una escalera de ' + v.L + ' m está apoyada en una pared. Su pie se aleja de la pared a ' + v.u + ' m/s. Sea $x$ la distancia del pie a la pared y $y$ la altura de la punta: $x^2 + y^2 = ' + v.L * v.L + '$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'm',
          prompt: function (v) { return '¿A qué altura está la punta cuando $x = ' + v.x0 + '$ m?'; },
          answer: function (v) { return Math.sqrt(v.L * v.L - v.x0 * v.x0); },
          solution: function (v) { return '$y = \\sqrt{' + v.L * v.L + ' - ' + v.x0 * v.x0 + '} = ' + fx(Math.sqrt(v.L * v.L - v.x0 * v.x0)) + '$ m.'; } },
        { label: 'b', type: 'numeric', points: 4, unit: 'm/s',
          prompt: function () { return 'Con tu altura de a), ¿a qué velocidad baja la punta? (Con signo.)'; },
          answer: function (v, prev) { return -v.x0 * v.u / prev[0]; },
          solution: function (v) { return '$2x\\,x\' + 2y\\,y\' = 0 \\Rightarrow y\' = -\\dfrac{x\\,x\'}{y} = ' + fx(-v.x0 * v.u / Math.sqrt(v.L * v.L - v.x0 * v.x0)) + '$ m/s.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 's',
          prompt: function () { return 'Con tu velocidad de b), ¿cuánto tarda (aprox.) la punta en bajar 10 cm?'; },
          answer: function (v, prev) { return 0.1 / Math.abs(prev[1]); },
          solution: function (v) { return '$\\Delta t \\approx \\dfrac{0.1}{|y\'|} = ' + fx(0.1 * Math.sqrt(v.L * v.L - v.x0 * v.x0) / (v.x0 * v.u)) + '$ s.'; } }
      ]
    },
    /* ---------- S07 · Extremos relativos ---------- */
    {
      id: 'c1-ex-cuartica', tags: ['c1.S07'], block: 'B', title: 'Una curva en forma de W',
      diagram: { id: 'exam-fn', state: function (v) { var f = function (x) { return Math.pow(x, 4) - 2 * v.a * v.a * x * x + v.c; }; return { x: [-1.6 * v.a, 1.6 * v.a], fns: [{ f: f }], pts: [{ x: v.a, y: f(v.a), label: 'mínimo' }, { x: v.a / Math.sqrt(3), y: f(v.a / Math.sqrt(3)), label: 'inflexión' }], xlab: 'x', ylab: 'f(x)', label: 'Una curva en forma de W con sus mínimos y su inflexión.' }; } },
      vars: { a: [1, 4, 1], c: [0, 20, 2] },
      statement: function (v) { return '<p>Sea $f(x) = x^4 - ' + 2 * v.a * v.a + 'x^2 + ' + v.c + '$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2,
          prompt: function () { return '¿En qué $x > 0$ tiene un mínimo relativo?'; },
          answer: function (v) { return v.a; },
          solution: function (v) { return '$f\'(x) = 4x(x^2 - ' + v.a * v.a + ') = 0$: $x = 0, \\pm ' + v.a + '$; en $' + v.a + '$, $f\'\' > 0$.'; } },
        { label: 'b', type: 'numeric', points: 3,
          prompt: function () { return 'Con tu $x$ de a), ¿cuánto vale ese mínimo?'; },
          answer: function (v, prev) { var p = prev[0]; return p * p * p * p - 2 * v.a * v.a * p * p + v.c; },
          solution: function (v) { return '$f(' + v.a + ') = ' + (v.c - Math.pow(v.a, 4)) + '$.'; } },
        { label: 'c', type: 'numeric', points: 3,
          prompt: function () { return '¿En qué $x > 0$ tiene un punto de inflexión?'; },
          answer: function (v) { return v.a / Math.sqrt(3); },
          solution: function (v) { return '$f\'\'(x) = 12x^2 - ' + 4 * v.a * v.a + ' = 0 \\Rightarrow x = \\dfrac{' + v.a + '}{\\sqrt 3} = ' + fx(v.a / Math.sqrt(3)) + '$.'; } },
        { label: 'd', type: 'numeric', points: 2,
          prompt: function () { return 'Con tu $x$ de c), ¿cuánto vale $f$ en la inflexión?'; },
          answer: function (v, prev) { var p = prev[2]; return p * p * p * p - 2 * v.a * v.a * p * p + v.c; },
          solution: function (v) { var p = v.a / Math.sqrt(3); return '$f(' + fx(p) + ') = ' + fx(Math.pow(p, 4) - 2 * v.a * v.a * p * p + v.c) + '$.'; } }
      ]
    },
    /* ---------- S09 · La integral y el TFC ---------- */
    {
      id: 'c1-ex-riemann-velocidad', tags: ['c1.S09'], block: 'C', title: 'Distancia con rectángulos',
      diagram: { id: 'exam-fn', state: function (v) { var f = function (t) { return v.a + v.b * t * t; }; return { x: [0, v.T], fns: [{ f: f }], rects: { f: f, a: 0, b: v.T, n: 4 }, xlab: 't (s)', ylab: 'v (m/s)', label: 'La velocidad y cuatro rectángulos de extremo izquierdo.' }; } },
      vars: { a: [1, 5, 1], b: [0.5, 3, 0.5], T: [2, 6, 1] },
      statement: function (v) { return '<p>Un carro va a $v(t) = ' + v.a + ' + ' + v.b + 't^2$ m/s entre $t = 0$ y $t = ' + v.T + '$ s.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return '¿Qué distancia recorre (integral exacta)?'; },
          answer: function (v) { return v.a * v.T + v.b * Math.pow(v.T, 3) / 3; },
          solution: function (v) { return '$\\int_0^{' + v.T + '}(' + v.a + ' + ' + v.b + 't^2)\\,dt = ' + fx(v.a * v.T + v.b * Math.pow(v.T, 3) / 3) + '$ m.'; } },
        { label: 'b', type: 'numeric', points: 3, unit: 'm',
          prompt: function () { return 'Aproxímala con 4 rectángulos de extremo izquierdo.'; },
          answer: function (v) { var h = v.T / 4, s = 0; for (var i = 0; i < 4; i++) { var t = i * h; s += (v.a + v.b * t * t) * h; } return s; },
          solution: function (v) { var h = v.T / 4, s = 0; for (var i = 0; i < 4; i++) { var t = i * h; s += (v.a + v.b * t * t) * h; } return '$\\Delta t = ' + fx(h) + '$; $\\sum v(t_i)\\Delta t = ' + fx(s) + '$ m.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'm',
          prompt: function () { return 'Con tus a) y b), ¿cuánto se equivocan los rectángulos?'; },
          answer: function (v, prev) { return prev[0] - prev[1]; },
          solution: function () { return 'Exacta menos aproximada: la izquierda subestima porque $v$ crece.'; } },
        { label: 'd', type: 'numeric', points: 2, unit: 'm/s',
          prompt: function () { return 'Con tu distancia de a), ¿cuál es la velocidad promedio?'; },
          answer: function (v, prev) { return prev[0] / v.T; },
          solution: function (v) { return '$\\dfrac{' + fx(v.a * v.T + v.b * Math.pow(v.T, 3) / 3) + '}{' + v.T + '} = ' + fx(v.a + v.b * v.T * v.T / 3) + '$ m/s.'; } }
      ]
    },
    /* ---------- S10 · Cambio de variable ---------- */
    {
      id: 'c1-ex-campana', tags: ['c1.S10'], block: 'C', title: 'El área bajo una campana',
      diagram: { id: 'exam-fn', state: function (v) { var f = function (x) { return x * Math.exp(-x * x); }; return { x: [0, 2.6], fns: [{ f: f }], shade: { f: f, a: 0, b: v.b }, xlab: 'x', ylab: 'y', label: 'El área bajo la curva hasta el límite pedido.' }; } },
      vars: { b: [0.5, 2, 0.25] },
      statement: function (v) { return '<p>Considera $\\displaystyle\\int_0^{' + v.b + '} x\\,e^{-x^2}\\,dx$ con el cambio $u = x^2$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2,
          prompt: function () { return '¿Cuál es el nuevo límite superior en $u$?'; },
          answer: function (v) { return v.b * v.b; },
          solution: function (v) { return '$u = (' + v.b + ')^2 = ' + fx(v.b * v.b) + '$.'; } },
        { label: 'b', type: 'numeric', points: 4,
          prompt: function () { return 'Con tu límite de a), ¿cuánto vale la integral?'; },
          answer: function (v, prev) { return (1 - Math.exp(-prev[0])) / 2; },
          solution: function (v) { return '$\\tfrac{1}{2}\\int_0^{' + fx(v.b * v.b) + '} e^{-u}\\,du = \\tfrac{1}{2}(1 - e^{-' + fx(v.b * v.b) + '}) = ' + fx((1 - Math.exp(-v.b * v.b)) / 2, 4) + '$.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: '%',
          prompt: function () { return 'Si el límite superior crece sin fin, la integral tiende a $\\tfrac{1}{2}$. Con tu b), ¿qué porcentaje de ese total llevas?'; },
          answer: function (v, prev) { return 200 * prev[1]; },
          solution: function (v) { return '$100\\,(1 - e^{-b^2}) = ' + fx(100 * (1 - Math.exp(-v.b * v.b)), 1) + '$ %.'; } }
      ]
    },
    /* ---------- S11 · Por partes ---------- */
    {
      id: 'c1-ex-partes-exp', tags: ['c1.S11'], block: 'C', title: 'El tiempo promedio de espera',
      diagram: { id: 'exam-fn', state: function (v) { var f = function (t) { return t * Math.exp(-v.k * t); }; return { x: [0, Math.max(v.T, 6 / v.k) * 1.05], fns: [{ f: f }], shade: { f: f, a: 0, b: v.T }, xlab: 't', ylab: 'y', label: 'El área bajo la curva de 0 a T.' }; } },
      vars: { k: [0.5, 2, 0.5], T: [1, 5, 1] },
      statement: function (v) { return '<p>Considera $\\displaystyle I = \\int_0^{' + v.T + '} t\\,e^{-' + v.k + 't}\\,dt$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 4,
          prompt: function () { return 'Integra por partes. ¿Cuánto vale $I$?'; },
          answer: function (v) { var e = Math.exp(-v.k * v.T); return -v.T * e / v.k - e / (v.k * v.k) + 1 / (v.k * v.k); },
          solution: function (v) { var e = Math.exp(-v.k * v.T); return '$u = t$, $dv = e^{-kt}dt$: $\\left[-\\tfrac{t}{k}e^{-kt} - \\tfrac{1}{k^2}e^{-kt}\\right]_0^{' + v.T + '} = ' + fx(-v.T * e / v.k - e / (v.k * v.k) + 1 / (v.k * v.k), 4) + '$.'; } },
        { label: 'b', type: 'numeric', points: 2,
          prompt: function () { return 'Si el límite superior crece sin fin, ¿a qué valor tiende $I$?'; },
          answer: function (v) { return 1 / (v.k * v.k); },
          solution: function (v) { return 'Los términos con $e^{-kt}$ se van a 0: $\\tfrac{1}{k^2} = ' + fx(1 / (v.k * v.k), 4) + '$.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: '%',
          prompt: function () { return 'Con tus a) y b), ¿qué porcentaje del total representa $I$?'; },
          answer: function (v, prev) { return 100 * prev[0] / prev[1]; },
          solution: function (v) { var e = Math.exp(-v.k * v.T); return '$100\\,(1 - (1 + kT)e^{-kT}) = ' + fx(100 * (1 - (1 + v.k * v.T) * e), 1) + '$ %.'; } }
      ]
    },
    {
      id: 'c1-ex-partes-ln', tags: ['c1.S11'], block: 'C', title: 'El promedio de un logaritmo',
      diagram: { id: 'exam-fn', state: function (v) { var avg = (v.b * Math.log(v.b) - v.b + 1) / (v.b - 1); return { x: [0.4, v.b + 1], fns: [{ f: Math.log }], shade: { f: Math.log, a: 1, b: v.b }, hlines: [{ y: avg, label: 'promedio' }], xlab: 'x', ylab: 'ln x', label: 'El área bajo ln x y su valor promedio.' }; } },
      vars: { b: [2, 8, 1] },
      statement: function (v) { return '<p>Considera $\\displaystyle\\int_1^{' + v.b + '} \\ln x\\,dx$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 4,
          prompt: function () { return 'Integra por partes. ¿Cuánto vale la integral?'; },
          answer: function (v) { return v.b * Math.log(v.b) - v.b + 1; },
          solution: function (v) { return '$u = \\ln x$, $dv = dx$: $[x\\ln x - x]_1^{' + v.b + '} = ' + fx(v.b * Math.log(v.b) - v.b + 1, 4) + '$.'; } },
        { label: 'b', type: 'numeric', points: 3,
          prompt: function () { return 'Con tu integral de a), ¿cuál es el valor promedio de $\\ln x$ en ese intervalo?'; },
          answer: function (v, prev) { return prev[0] / (v.b - 1); },
          solution: function (v) { return '$\\dfrac{1}{' + (v.b - 1) + '}\\int = ' + fx((v.b * Math.log(v.b) - v.b + 1) / (v.b - 1), 4) + '$.'; } },
        { label: 'c', type: 'numeric', points: 3,
          prompt: function () { return 'Con tu promedio de b), ¿en qué $x$ vale $\\ln x$ exactamente ese promedio?'; },
          answer: function (v, prev) { return Math.exp(prev[1]); },
          solution: function (v) { return '$x = e^{\\text{promedio}} = ' + fx(Math.exp((v.b * Math.log(v.b) - v.b + 1) / (v.b - 1))) + '$ (el valor medio del TFC).'; } }
      ]
    },
    /* ---------- S12 · Sustitución trigonométrica ---------- */
    {
      id: 'c1-ex-trig-circulo', tags: ['c1.S12'], block: 'C', title: 'Un pedazo de círculo',
      diagram: { id: 'exam-fn', state: function (v) { var R = v.R, f = function (x) { return Math.sqrt(Math.max(0, R * R - x * x)); }; return { x: [-0.1 * R, R * 1.2], y: [0, R * 1.15], equal: true, curves: [{ xy: function (t) { return [R * Math.cos(t), R * Math.sin(t)]; }, t0: 0, t1: Math.PI / 2 }], shade: { f: f, a: 0, b: R * v.p / 10 }, xlab: 'x', ylab: 'y', label: 'Un cuarto de círculo con la parte sombreada.' }; } },
      vars: { R: [2, 10, 1], p: [2, 9, 1] },
      statement: function (v) { var a = v.R * v.p / 10; return '<p>Considera $\\displaystyle\\int_0^{' + fx(a) + '} \\sqrt{' + v.R * v.R + ' - x^2}\\,dx$ con $x = ' + v.R + '\\sin\\theta$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'rad',
          prompt: function () { return '¿Cuál es el límite superior en $\\theta$?'; },
          answer: function (v) { return Math.asin(v.p / 10); },
          solution: function (v) { return '$\\sin\\theta = ' + v.p / 10 + ' \\Rightarrow \\theta = ' + fx(Math.asin(v.p / 10), 4) + '$ rad.'; } },
        { label: 'b', type: 'numeric', points: 4,
          prompt: function () { return 'Con tu $\\theta$ de a), ¿cuánto vale la integral?'; },
          answer: function (v, prev) { var t = prev[0]; return v.R * v.R / 2 * (t + Math.sin(t) * Math.cos(t)); },
          solution: function (v) { var t = Math.asin(v.p / 10); return '$R^2\\int_0^{\\theta}\\cos^2 = \\tfrac{R^2}{2}(\\theta + \\sin\\theta\\cos\\theta) = ' + fx(v.R * v.R / 2 * (t + Math.sin(t) * Math.cos(t)), 4) + '$.'; } },
        { label: 'c', type: 'numeric', points: 3, unit: '%',
          prompt: function () { return 'Con tu b), ¿qué porcentaje es del cuarto de círculo completo, $\\tfrac{\\pi R^2}{4}$?'; },
          answer: function (v, prev) { return 100 * prev[1] / (PI * v.R * v.R / 4); },
          solution: function (v) { var t = Math.asin(v.p / 10); return '$' + fx(100 * (t + Math.sin(t) * Math.cos(t)) * 2 / PI, 1) + '$ %.'; } }
      ]
    },
    {
      id: 'c1-ex-trig-tan', tags: ['c1.S12'], block: 'C', title: 'Una integral con arcotangente',
      diagram: { id: 'exam-fn', state: function (v) { var f = function (x) { return 1 / (x * x + v.c * v.c); }; return { x: [0, Math.max(v.b * 1.3, 3 * v.c)], fns: [{ f: f }], shade: { f: f, a: 0, b: v.b }, xlab: 'x', ylab: 'y', label: 'El área bajo la curva de 0 a b.' }; } },
      vars: { c: [1, 5, 1], b: [1, 10, 1] },
      where: function (v) { return v.b !== v.c; },
      statement: function (v) { return '<p>Considera $\\displaystyle\\int_0^{' + v.b + '} \\frac{dx}{x^2 + ' + v.c * v.c + '}$ con $x = ' + v.c + '\\tan\\theta$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3, unit: 'rad',
          prompt: function () { return '¿Cuál es el límite superior en $\\theta$?'; },
          answer: function (v) { return Math.atan(v.b / v.c); },
          solution: function (v) { return '$\\tan\\theta = \\dfrac{' + v.b + '}{' + v.c + '} \\Rightarrow \\theta = ' + fx(Math.atan(v.b / v.c), 4) + '$.'; } },
        { label: 'b', type: 'numeric', points: 3,
          prompt: function () { return 'Con tu $\\theta$ de a), ¿cuánto vale la integral?'; },
          answer: function (v, prev) { return prev[0] / v.c; },
          solution: function (v) { return '$\\int_0^\\theta \\tfrac{d\\theta}{' + v.c + '} = ' + fx(Math.atan(v.b / v.c) / v.c, 4) + '$.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: '%',
          prompt: function () { return 'Con el límite superior infinito la integral vale $\\tfrac{\\pi}{2c}$. Con tu b), ¿qué porcentaje llevas?'; },
          answer: function (v, prev) { return 100 * prev[1] / (PI / (2 * v.c)); },
          solution: function (v) { return '$' + fx(200 * Math.atan(v.b / v.c) / PI, 1) + '$ %.'; } }
      ]
    },
    {
      id: 'c1-ex-trig-sec', tags: ['c1.S12'], block: 'C', title: 'Una integral con raíz de x² + c²',
      diagram: { id: 'exam-fn', state: function (v) { var f = function (x) { return 1 / Math.sqrt(x * x + v.c * v.c); }; return { x: [0, Math.max(v.b * 1.3, 3 * v.c)], fns: [{ f: f }], shade: { f: f, a: 0, b: v.b }, xlab: 'x', ylab: 'y', label: 'El área bajo la curva de 0 a b.' }; } },
      vars: { c: [1, 5, 1], b: [1, 10, 1] },
      statement: function (v) { return '<p>Considera $\\displaystyle\\int_0^{' + v.b + '} \\frac{dx}{\\sqrt{x^2 + ' + v.c * v.c + '}}$ con $x = ' + v.c + '\\tan\\theta$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2,
          prompt: function () { return 'En el triángulo del cambio, ¿cuánto mide la hipotenusa cuando $x$ vale el límite superior?'; },
          answer: function (v) { return Math.sqrt(v.b * v.b + v.c * v.c); },
          solution: function (v) { return '$\\sqrt{' + v.b * v.b + ' + ' + v.c * v.c + '} = ' + fx(Math.sqrt(v.b * v.b + v.c * v.c)) + '$.'; } },
        { label: 'b', type: 'numeric', points: 4,
          prompt: function () { return 'Con tu hipotenusa de a), ¿cuánto vale la integral?'; },
          answer: function (v, prev) { return Math.log((v.b + Math.abs(prev[0])) / v.c); },
          solution: function (v) { return '$\\int\\sec\\theta = \\ln|\\sec\\theta + \\tan\\theta| = \\ln\\dfrac{x + \\sqrt{x^2 + c^2}}{c}$; vale $' + fx(Math.log((v.b + Math.sqrt(v.b * v.b + v.c * v.c)) / v.c), 4) + '$.'; } },
        { label: 'c', type: 'numeric', points: 2,
          prompt: function () { return 'Con tu b), ¿cuál es el valor promedio de la función en el intervalo?'; },
          answer: function (v, prev) { return prev[1] / v.b; },
          solution: function (v) { return '$\\dfrac{1}{' + v.b + '}\\int = ' + fx(Math.log((v.b + Math.sqrt(v.b * v.b + v.c * v.c)) / v.c) / v.b, 4) + '$.'; } }
      ]
    },
    /* ---------- S13 · Fracciones parciales ---------- */
    {
      id: 'c1-ex-fp-diferencia', tags: ['c1.S13'], block: 'C', title: 'Una diferencia de cuadrados',
      diagram: { id: 'exam-fn', state: function (v) { var f = function (x) { return 1 / (x * x - v.a * v.a); }; return { x: [v.a + 0.7, v.a + v.d + 1], fns: [{ f: f }], shade: { f: f, a: v.a + 1, b: v.a + v.d }, xlab: 'x', ylab: 'y', label: 'El área bajo la curva entre los límites.' }; } },
      vars: { a: [1, 4, 1], d: [2, 10, 1] },
      statement: function (v) { var L = v.a + 1, b = v.a + v.d; return '<p>Considera $\\displaystyle\\int_{' + L + '}^{' + b + '} \\frac{dx}{x^2 - ' + v.a * v.a + '}$ y escribe $\\dfrac{1}{x^2 - ' + v.a * v.a + '} = \\dfrac{A}{x - ' + v.a + '} - \\dfrac{A}{x + ' + v.a + '}$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3,
          prompt: function () { return '¿Cuánto vale $A$?'; },
          answer: function (v) { return 1 / (2 * v.a); },
          solution: function (v) { return '$1 = A(x + ' + v.a + ') - A(x - ' + v.a + ') = ' + 2 * v.a + 'A \\Rightarrow A = ' + fx(1 / (2 * v.a), 4) + '$.'; } },
        { label: 'b', type: 'numeric', points: 4,
          prompt: function () { return 'Con tu $A$ de a), ¿cuánto vale la integral?'; },
          answer: function (v, prev) { var L = v.a + 1, b = v.a + v.d; return prev[0] * (Math.log((b - v.a) / (b + v.a)) - Math.log((L - v.a) / (L + v.a))); },
          solution: function (v) { var L = v.a + 1, b = v.a + v.d, val = (Math.log((b - v.a) / (b + v.a)) - Math.log((L - v.a) / (L + v.a))) / (2 * v.a); return '$A\\left[\\ln\\left|\\dfrac{x - ' + v.a + '}{x + ' + v.a + '}\\right|\\right]_{' + L + '}^{' + b + '} = ' + fx(val, 4) + '$.'; } },
        { label: 'c', type: 'numeric', points: 3,
          prompt: function () { return 'Con tu $A$ de a), ¿a qué valor tiende la integral si el límite superior crece sin fin?'; },
          answer: function (v, prev) { var L = v.a + 1; return -prev[0] * Math.log((L - v.a) / (L + v.a)); },
          solution: function (v) { var L = v.a + 1; return 'El término de arriba tiende a $\\ln 1 = 0$: $-A\\ln\\dfrac{1}{' + (L + v.a) + '} = ' + fx(Math.log(L + v.a) / (2 * v.a), 4) + '$.'; } }
      ]
    },
    {
      id: 'c1-ex-fp-producto', tags: ['c1.S13'], block: 'C', title: 'Dos factores lineales',
      diagram: { id: 'exam-fn', state: function (v) { var f = function (x) { return 1 / (x * (x + v.k)); }; return { x: [0.6, v.b + 1], fns: [{ f: f }], shade: { f: f, a: 1, b: v.b }, xlab: 'x', ylab: 'y', label: 'El área bajo la curva entre los límites.' }; } },
      vars: { k: [1, 5, 1], b: [2, 10, 1] },
      statement: function (v) { return '<p>Considera $\\displaystyle\\int_1^{' + v.b + '} \\frac{dx}{x(x + ' + v.k + ')}$ y escribe $\\dfrac{1}{x(x + ' + v.k + ')} = \\dfrac{A}{x} - \\dfrac{A}{x + ' + v.k + '}$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 3,
          prompt: function () { return '¿Cuánto vale $A$?'; },
          answer: function (v) { return 1 / v.k; },
          solution: function (v) { return 'Con $x = 0$: $1 = ' + v.k + 'A$, así que $A = ' + fx(1 / v.k, 4) + '$.'; } },
        { label: 'b', type: 'numeric', points: 4,
          prompt: function () { return 'Con tu $A$ de a), ¿cuánto vale la integral?'; },
          answer: function (v, prev) { return prev[0] * Math.log(v.b * (1 + v.k) / (v.b + v.k)); },
          solution: function (v) { return '$A\\left[\\ln\\dfrac{x}{x + ' + v.k + '}\\right]_1^{' + v.b + '} = ' + fx(Math.log(v.b * (1 + v.k) / (v.b + v.k)) / v.k, 4) + '$.'; } },
        { label: 'c', type: 'numeric', points: 3,
          prompt: function () { return 'Con tu $A$ de a), ¿a qué valor tiende si el límite superior crece sin fin?'; },
          answer: function (v, prev) { return prev[0] * Math.log(1 + v.k); },
          solution: function (v) { return '$\\tfrac{x}{x + k} \\to 1$: queda $A\\ln(1 + k) = ' + fx(Math.log(1 + v.k) / v.k, 4) + '$.'; } }
      ]
    },
    {
      id: 'c1-ex-fp-repetido', tags: ['c1.S13'], block: 'C', title: 'Un factor repetido',
      diagram: { id: 'exam-fn', state: function (v) { var f = function (x) { return 1 / (x * x * (x + v.k)); }; return { x: [0.75, v.b + 1], fns: [{ f: f }], shade: { f: f, a: 1, b: v.b }, xlab: 'x', ylab: 'y', label: 'El área bajo la curva entre los límites.' }; } },
      vars: { k: [1, 4, 1], b: [2, 8, 1] },
      statement: function (v) { return '<p>Considera $\\displaystyle\\int_1^{' + v.b + '} \\frac{dx}{x^2(x + ' + v.k + ')}$ con $\\dfrac{1}{x^2(x + ' + v.k + ')} = \\dfrac{A}{x} + \\dfrac{B}{x^2} + \\dfrac{C}{x + ' + v.k + '}$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2,
          prompt: function () { return '¿Cuánto vale $B$?'; },
          answer: function (v) { return 1 / v.k; },
          solution: function (v) { return 'Con $x = 0$: $1 = ' + v.k + 'B$, $B = ' + fx(1 / v.k, 4) + '$.'; } },
        { label: 'b', type: 'numeric', points: 2,
          prompt: function () { return '¿Cuánto vale $C$? ($A = -C$.)'; },
          answer: function (v) { return 1 / (v.k * v.k); },
          solution: function (v) { return 'Con $x = -' + v.k + '$: $1 = ' + v.k * v.k + 'C$, $C = ' + fx(1 / (v.k * v.k), 4) + '$.'; } },
        { label: 'c', type: 'numeric', points: 4,
          prompt: function () { return 'Con tus $B$ y $C$ (y $A = -C$), ¿cuánto vale la integral?'; },
          answer: function (v, prev) { var B = prev[0], C = prev[1]; return -C * Math.log(v.b) + B * (1 - 1 / v.b) + C * Math.log((v.b + v.k) / (1 + v.k)); },
          solution: function (v) { var B = 1 / v.k, C = 1 / (v.k * v.k); return '$\\left[-C\\ln x - \\tfrac{B}{x} + C\\ln(x + ' + v.k + ')\\right]_1^{' + v.b + '} = ' + fx(-C * Math.log(v.b) + B * (1 - 1 / v.b) + C * Math.log((v.b + v.k) / (1 + v.k)), 4) + '$.'; } }
      ]
    },
    /* ---------- S14 · Áreas y arcos ---------- */
    {
      id: 'c1-ex-dos-parabolas', tags: ['c1.S14'], block: 'C', title: 'Entre dos parábolas',
      diagram: { id: 'exam-fn', state: function (v) { var f = function (x) { return v.a - x * x; }, g = function (x) { return x * x - v.a; }, p = Math.sqrt(v.a); return { x: [-1.5 * p, 1.5 * p], fns: [{ f: f }, { f: g, cls: 'aux' }], shade: { f: f, g: g, a: -p, b: p }, xlab: 'x', ylab: 'y', label: 'La región entre las dos parábolas.' }; } },
      vars: { a: [1, 9, 1] },
      where: function (v) { return v.a !== 4 && v.a !== 1; },
      statement: function (v) { return '<p>Considera la región entre $y = ' + v.a + ' - x^2$ y $y = x^2 - ' + v.a + '$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2,
          prompt: function () { return '¿En qué $x > 0$ se cortan?'; },
          answer: function (v) { return Math.sqrt(v.a); },
          solution: function (v) { return '$2x^2 = ' + 2 * v.a + ' \\Rightarrow x = \\sqrt{' + v.a + '} = ' + fx(Math.sqrt(v.a)) + '$.'; } },
        { label: 'b', type: 'numeric', points: 4,
          prompt: function () { return 'Con tu $x$ de a), ¿cuál es el área de la región?'; },
          answer: function (v, prev) { var p = Math.abs(prev[0]); return 4 * (v.a * p - p * p * p / 3); },
          solution: function (v) { var p = Math.sqrt(v.a); return '$\\int_{-p}^{p}(' + 2 * v.a + ' - 2x^2)\\,dx = 4\\left(' + v.a + 'p - \\tfrac{p^3}{3}\\right) = ' + fx(4 * (v.a * p - p * p * p / 3)) + '$.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: '%',
          prompt: function (v) { return 'Con tus a) y b), ¿qué porcentaje ocupa del rectángulo $[-x, x]\\times[-' + v.a + ', ' + v.a + ']$ que la contiene?'; },
          answer: function (v, prev) { return 100 * prev[1] / (4 * Math.abs(prev[0]) * v.a); },
          solution: function () { return 'Siempre $\\tfrac{2}{3}$: $66.67$ %.'; } }
      ]
    },
    {
      id: 'c1-ex-arco-semicubica', tags: ['c1.S14'], block: 'C', title: 'El largo de una curva',
      diagram: { id: 'exam-fn', state: function (v) { var f = function (x) { return 2 / 3 * Math.pow(Math.max(x, 0), 1.5); }, yb = f(v.b); return { x: [0, v.b * 1.1], fns: [{ f: f }, { f: function (x) { return x <= v.b ? yb / v.b * x : NaN; }, cls: 'error', w: 2, dash: '7 5' }], pts: [{ x: 0, y: 0 }, { x: v.b, y: yb }], xlab: 'x', ylab: 'y', label: 'La curva y el segmento que une sus extremos.' }; } },
      vars: { b: [1, 8, 1] },
      statement: function (v) { return '<p>Considera la curva $y = \\tfrac{2}{3}x^{3/2}$ entre $x = 0$ y $x = ' + v.b + '$.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2,
          prompt: function () { return '¿Cuánto vale $y\'$ en el extremo derecho?'; },
          answer: function (v) { return Math.sqrt(v.b); },
          solution: function (v) { return '$y\' = \\sqrt{x}$; en $' + v.b + '$: $' + fx(Math.sqrt(v.b)) + '$.'; } },
        { label: 'b', type: 'numeric', points: 4,
          prompt: function () { return '¿Cuánto mide la curva?'; },
          answer: function (v) { return 2 / 3 * (Math.pow(1 + v.b, 1.5) - 1); },
          solution: function (v) { return '$\\int_0^{' + v.b + '}\\sqrt{1 + x}\\,dx = \\tfrac{2}{3}\\left[(1 + x)^{3/2}\\right]_0^{' + v.b + '} = ' + fx(2 / 3 * (Math.pow(1 + v.b, 1.5) - 1)) + '$.'; } },
        { label: 'c', type: 'numeric', points: 2,
          prompt: function () { return 'Con tu b), ¿cuánto más larga es la curva que el segmento que une sus extremos?'; },
          answer: function (v, prev) { return prev[1] - Math.sqrt(v.b * v.b + Math.pow(2 / 3 * Math.pow(v.b, 1.5), 2)); },
          solution: function (v) { var s = Math.sqrt(v.b * v.b + Math.pow(2 / 3 * Math.pow(v.b, 1.5), 2)); return 'El segmento mide $' + fx(s) + '$; la diferencia es $' + fx(2 / 3 * (Math.pow(1 + v.b, 1.5) - 1) - s) + '$.'; } },
        { label: 'd', type: 'numeric', points: 2,
          prompt: function () { return 'Con tu $y\'$ de a), ¿cuánto vale el integrando de la longitud, $\\sqrt{1 + (y\')^2}$, en el extremo derecho?'; },
          answer: function (v, prev) { return Math.sqrt(1 + prev[0] * prev[0]); },
          solution: function (v) { return '$\\sqrt{1 + ' + v.b + '} = ' + fx(Math.sqrt(1 + v.b)) + '$.'; } }
      ]
    },
    /* ---------- S15 · Sólidos de revolución ---------- */
    {
      id: 'c1-ex-vaso', tags: ['c1.S15'], block: 'C', title: 'Un vaso parabólico',
      diagram: { id: 'exam-fn', state: function (v) { var r = Math.sqrt(v.H / v.k), f = function (x) { return v.k * x * x; }; return { x: [-1.5 * r, 1.5 * r], y: [0, v.H * 1.2], equal: true, fns: [{ f: f }], shade: { f: function () { return v.H; }, g: f, a: -r, b: r }, xlab: 'x', ylab: 'y (cm)', label: 'Corte del vaso: el líquido llena la parábola hasta y = H.' }; } },
      vars: { k: [0.5, 3, 0.5], H: [2, 10, 1] },
      statement: function (v) { return '<p>Un vaso tiene la forma que resulta de girar $y = ' + v.k + 'x^2$ alrededor del eje $y$, lleno hasta $y = ' + v.H + '$ cm.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'cm',
          prompt: function () { return '¿Qué radio tiene el borde del líquido?'; },
          answer: function (v) { return Math.sqrt(v.H / v.k); },
          solution: function (v) { return '$x = \\sqrt{' + v.H + '/' + v.k + '} = ' + fx(Math.sqrt(v.H / v.k)) + '$ cm.'; } },
        { label: 'b', type: 'numeric', points: 4, unit: 'cm³',
          prompt: function () { return '¿Cuánto líquido contiene? (Discos en $y$.)'; },
          answer: function (v) { return PI * v.H * v.H / (2 * v.k); },
          solution: function (v) { return '$\\pi\\int_0^{' + v.H + '}\\dfrac{y}{' + v.k + '}\\,dy = \\dfrac{\\pi(' + v.H + ')^2}{' + 2 * v.k + '} = ' + fx(PI * v.H * v.H / (2 * v.k), 2) + '$ cm³.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'cm³',
          prompt: function () { return 'Con tu radio de a), ¿cuánto cabría en un cilindro de ese radio y la misma altura?'; },
          answer: function (v, prev) { return PI * prev[0] * prev[0] * v.H; },
          solution: function (v) { return '$\\pi r^2 H = ' + fx(PI * v.H * v.H / v.k, 2) + '$ cm³.'; } },
        { label: 'd', type: 'numeric', points: 2,
          prompt: function () { return 'Con tus b) y c), ¿qué fracción del cilindro ocupa el líquido?'; },
          answer: function (v, prev) { return prev[1] / prev[2]; },
          solution: function () { return 'Siempre $\\tfrac{1}{2}$ en un paraboloide.'; } }
      ]
    },
    {
      id: 'c1-ex-dona', tags: ['c1.S15'], block: 'C', title: 'El volumen de una dona',
      diagram: { id: 'exam-fn', state: function (v) { var up = function (x) { return Math.sqrt(Math.max(0, v.r * v.r - (x - v.R) * (x - v.R))); }, lo = function (x) { return -up(x); }; return { x: [-2, v.R + v.r + 2], y: [-(v.r + 2), v.r + 2], equal: true, curves: [{ xy: function (t) { return [v.R + v.r * Math.cos(t), v.r * Math.sin(t)]; }, t0: 0, t1: 2 * Math.PI }], shade: { f: up, g: lo, a: v.R - v.r, b: v.R + v.r }, vlines: [{ x: 0, label: 'eje de giro' }], label: 'Un círculo separado del eje; al girar forma una dona.' }; } },
      vars: { R: [5, 20, 1], r: [1, 4, 1] },
      statement: function (v) { return '<p>Un círculo de radio ' + v.r + ' cm, con centro a ' + v.R + ' cm del eje $y$, gira alrededor de ese eje y forma una dona.</p>'; },
      parts: [
        { label: 'a', type: 'numeric', points: 2, unit: 'cm²',
          prompt: function () { return '¿Cuál es el área del círculo?'; },
          answer: function (v) { return PI * v.r * v.r; },
          solution: function (v) { return '$\\pi r^2 = ' + fx(PI * v.r * v.r, 2) + '$ cm².'; } },
        { label: 'b', type: 'numeric', points: 4, unit: 'cm³',
          prompt: function () { return 'Por capas, $V = 2\\pi\\int x\\,h(x)\\,dx$ da $2\\pi R\\cdot(\\text{área del círculo})$. Con tu a), ¿cuál es el volumen?'; },
          answer: function (v, prev) { return 2 * PI * v.R * prev[0]; },
          solution: function (v) { return '$V = 2\\pi R\\,\\pi r^2 = 2\\pi^2(' + v.R + ')(' + v.r * v.r + ') = ' + fx(2 * PI * PI * v.R * v.r * v.r, 2) + '$ cm³.'; } },
        { label: 'c', type: 'numeric', points: 2, unit: 'L',
          prompt: function () { return 'Con tu b), ¿cuántos litros son?'; },
          answer: function (v, prev) { return prev[1] / 1000; },
          solution: function (v) { return '$1\\ \\text{L} = 1000\\ \\text{cm}^3$: $' + fx(2 * PI * PI * v.R * v.r * v.r / 1000, 4) + '$ L.'; } }
      ]
    }
  ]);

})();
