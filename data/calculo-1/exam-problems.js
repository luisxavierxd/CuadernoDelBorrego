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
})();
