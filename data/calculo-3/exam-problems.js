/* =====================================================================
   Problemas de examen · Cálculo 3. Propios y parametrizados.
   part.answer(v, prev): prev son las respuestas DEL ALUMNO en los incisos
   anteriores, para dar crédito por arrastre de error.
   Bloque A (S01–S05): 8 problemas de primer orden (separables, homogéneas,
   lineales y Bernoulli) con su modelo físico. Todas las figuras usan el
   graficador genérico exam-fn.
   Las respuestas se comprueban por otro camino en scripts/labs-math/c3-exam.js
   (integrando cada PVI con RK4 de LabMath.ode).
   ===================================================================== */
(function () {
  var ex = (window.CB_EXAMS = window.CB_EXAMS || {});
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }

  ex.c3 = (ex.c3 || []).concat([
    /* ================= Bloque A · Primer orden I (S01–S05) ================= */
    {
      id: 'c3-ex-decaimiento', tags: ['c3.S02'], block: 'A', title: 'Una muestra radiactiva',
      vars: { m0: [40, 200, 10], f: [0.5, 0.9, 0.05], t1: [2, 10, 1], t2: [12, 30, 2], p: [5, 30, 5] },
      where: function (v) { return v.f !== 0.5; },
      statement: function (v) { return '<p>Una muestra de ' + v.m0 + ' mg de un isótopo decae según $m\' = -km$. A los ' + v.t1 + ' días quedan ' + fx(v.m0 * v.f, 1) + ' mg.</p>'; },
      diagram: { id: 'exam-fn', state: function (v) {
        var k = Math.log(1 / v.f) / v.t1;
        return { x: [0, v.t2 * 1.1], fns: [{ f: function (t) { return v.m0 * Math.exp(-k * t); }, cls: 'ref', label: 'm(t)' }],
          pts: [{ x: 0, y: v.m0, label: v.m0 + ' mg' }, { x: v.t1, y: v.m0 * v.f, label: 't = ' + v.t1 }], xlab: 't (días)', ylab: 'm (mg)' };
      } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3, unit: '1/día',
          prompt: function () { return '¿Cuánto vale la constante de decaimiento $k$?'; },
          answer: function (v) { return Math.log(1 / v.f) / v.t1; },
          tol: { rel: 0.01 },
          solution: function (v) { return 'Con $m = m_0e^{-kt}$: $' + fx(v.m0 * v.f, 1) + ' = ' + v.m0 + 'e^{-' + v.t1 + 'k}$, así que $k = \\dfrac{\\ln(' + v.m0 + '/' + fx(v.m0 * v.f, 1) + ')}{' + v.t1 + '} \\approx ' + fx(Math.log(1 / v.f) / v.t1, 4) + '$ por día.'; }
        },
        {
          label: 'b', type: 'numeric', points: 2, unit: 'días',
          prompt: function () { return 'Con tu $k$ del inciso a), ¿cuál es la vida media del isótopo?'; },
          answer: function (v, prev) { return Math.log(2) / prev[0]; },
          solution: function (v) { var k = Math.log(1 / v.f) / v.t1; return '$T_{1/2} = \\dfrac{\\ln 2}{k} \\approx ' + fx(Math.log(2) / k) + '$ días.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: 'mg',
          prompt: function (v) { return 'Con tu $k$, ¿cuántos miligramos quedan a los ' + v.t2 + ' días?'; },
          answer: function (v, prev) { return v.m0 * Math.exp(-prev[0] * v.t2); },
          solution: function (v) { var k = Math.log(1 / v.f) / v.t1; return '$m(' + v.t2 + ') = ' + v.m0 + 'e^{-' + fx(k, 4) + '(' + v.t2 + ')} \\approx ' + fx(v.m0 * Math.exp(-k * v.t2)) + '$ mg.'; }
        },
        {
          label: 'd', type: 'numeric', points: 3, unit: 'días',
          prompt: function (v) { return 'Con tu $k$, ¿en cuántos días queda solo el ' + v.p + ' % de la muestra?'; },
          answer: function (v, prev) { return Math.log(100 / v.p) / prev[0]; },
          solution: function (v) { var k = Math.log(1 / v.f) / v.t1; return '$\\frac{' + v.p + '}{100} = e^{-kt}$, así que $t = \\dfrac{\\ln(100/' + v.p + ')}{k} \\approx ' + fx(Math.log(100 / v.p) / k) + '$ días.'; }
        }
      ]
    },
    {
      id: 'c3-ex-forense', tags: ['c3.S02'], block: 'A', title: '¿A qué hora ocurrió?',
      vars: { Ta: [15, 24, 1], T1: [28, 33, 1], dT: [1, 3, 0.5] },
      where: function (v) { return v.T1 - v.dT > v.Ta + 2; },
      statement: function (v) { return '<p>A las 8:00 se encuentra un cuerpo a ' + v.T1 + ' °C en un cuarto a ' + v.Ta + ' °C. A las 9:00 su temperatura es ' + fx(v.T1 - v.dT, 1) + ' °C. Supón que sigue la ley de enfriamiento de Newton y que al morir estaba a 37 °C. Mide $t$ en horas desde las 8:00.</p>'; },
      diagram: { id: 'exam-fn', state: function (v) {
        var k = Math.log((v.T1 - v.Ta) / (v.T1 - v.dT - v.Ta)), t0 = -Math.log((37 - v.Ta) / (v.T1 - v.Ta)) / k;
        return { x: [t0 - 0.5, 4], y: [v.Ta - 2, 40], fns: [{ f: function (t) { return v.Ta + (v.T1 - v.Ta) * Math.exp(-k * t); }, cls: 'ref', label: 'T(t)' }],
          hlines: [{ y: v.Ta, label: v.Ta + ' °C' }], pts: [{ x: 0, y: v.T1, label: '8:00' }, { x: 1, y: v.T1 - v.dT, label: '9:00' }], xlab: 't (h)', ylab: 'T (°C)' };
      } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3, unit: '1/h',
          prompt: function () { return '¿Cuánto vale la constante $k$ de la ley de enfriamiento?'; },
          answer: function (v) { return Math.log((v.T1 - v.Ta) / (v.T1 - v.dT - v.Ta)); },
          tol: { rel: 0.01 },
          solution: function (v) { return '$T - T_a = (T_1 - T_a)e^{-kt}$: $' + fx(v.T1 - v.dT - v.Ta, 1) + ' = ' + (v.T1 - v.Ta) + 'e^{-k}$, así que $k = \\ln\\dfrac{' + (v.T1 - v.Ta) + '}{' + fx(v.T1 - v.dT - v.Ta, 1) + '} \\approx ' + fx(Math.log((v.T1 - v.Ta) / (v.T1 - v.dT - v.Ta)), 4) + '$ por hora.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3, unit: 'h',
          prompt: function () { return 'Con tu $k$, ¿cuántas horas antes de las 8:00 murió la persona? (Responde un número positivo.)'; },
          answer: function (v, prev) { return Math.log((37 - v.Ta) / (v.T1 - v.Ta)) / prev[0]; },
          solution: function (v) { var k = Math.log((v.T1 - v.Ta) / (v.T1 - v.dT - v.Ta)); return '$37 = ' + v.Ta + ' + ' + (v.T1 - v.Ta) + 'e^{-kt}$ da $t = -\\dfrac{1}{k}\\ln\\dfrac{' + (37 - v.Ta) + '}{' + (v.T1 - v.Ta) + '} \\approx -' + fx(Math.log((37 - v.Ta) / (v.T1 - v.Ta)) / k) + '$ h: murió unas ' + fx(Math.log((37 - v.Ta) / (v.T1 - v.Ta)) / k) + ' horas antes.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2, unit: '°C',
          prompt: function () { return 'Con tu $k$, ¿qué temperatura tendrá el cuerpo a las 11:00?'; },
          answer: function (v, prev) { return v.Ta + (v.T1 - v.Ta) * Math.exp(-3 * prev[0]); },
          solution: function (v) { var k = Math.log((v.T1 - v.Ta) / (v.T1 - v.dT - v.Ta)); return '$T(3) = ' + v.Ta + ' + ' + (v.T1 - v.Ta) + 'e^{-3k} \\approx ' + fx(v.Ta + (v.T1 - v.Ta) * Math.exp(-3 * k)) + '$ °C.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: '°C/h',
          prompt: function () { return 'Con tu temperatura del inciso c), ¿qué tan rápido se está enfriando a las 11:00? (Da $T\'$, que es negativa.)'; },
          answer: function (v, prev) { return -prev[0] * (prev[2] - v.Ta); },
          solution: function (v) { var k = Math.log((v.T1 - v.Ta) / (v.T1 - v.dT - v.Ta)), T3 = v.Ta + (v.T1 - v.Ta) * Math.exp(-3 * k); return 'La propia ecuación da la rapidez: $T\' = -k(T - T_a) \\approx -' + fx(k, 4) + '(' + fx(T3) + ' - ' + v.Ta + ') \\approx ' + fx(-k * (T3 - v.Ta)) + '$ °C/h.'; }
        }
      ]
    },
    {
      id: 'c3-ex-homogenea', tags: ['c3.S03'], block: 'A', title: 'Una homogénea y su tangente',
      vars: { c: [2, 4, 1], x1: [2, 4, 1] },
      statement: function (v) { return '<p>Considera el PVI $y\' = \\dfrac{x^2 + y^2}{2xy}$ con $y(1) = ' + v.c + '$, para $x > 0$. Con $y = ux$ se llega a la familia $y^2 = x^2 + Kx$.</p>'; },
      diagram: { id: 'exam-fn', state: function (v) {
        var K = v.c * v.c - 1, y1 = Math.sqrt(v.x1 * v.x1 + K * v.x1);
        return { x: [0, v.x1 + 1], fns: [{ f: function (x) { return Math.sqrt(x * x + K * x); }, cls: 'ref', label: 'y(x)' }],
          tangent: { f: function (x) { return Math.sqrt(x * x + K * x); }, x0: v.x1, len: 0.8 }, pts: [{ x: 1, y: v.c, label: '(1, ' + v.c + ')' }], xlab: 'x', ylab: 'y' };
      } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3,
          prompt: function () { return '¿Cuánto vale la constante $K$?'; },
          answer: function (v) { return v.c * v.c - 1; },
          solution: function (v) { return 'En $x = 1$: $' + v.c + '^2 = 1 + K$, así que $K = ' + (v.c * v.c - 1) + '$.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3,
          prompt: function (v) { return 'Con tu $K$, ¿cuánto vale $y(' + v.x1 + ')$?'; },
          answer: function (v, prev) { return Math.sqrt(v.x1 * v.x1 + prev[0] * v.x1); },
          solution: function (v) { var K = v.c * v.c - 1; return '$y = \\sqrt{x^2 + ' + K + 'x}$ (raíz positiva porque $y(1) > 0$): $y(' + v.x1 + ') = \\sqrt{' + (v.x1 * v.x1 + K * v.x1) + '} \\approx ' + fx(Math.sqrt(v.x1 * v.x1 + K * v.x1)) + '$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2,
          prompt: function (v) { return 'Con tu $y(' + v.x1 + ')$, ¿cuál es la pendiente de la solución en $x = ' + v.x1 + '$?'; },
          answer: function (v, prev) { return (v.x1 * v.x1 + prev[1] * prev[1]) / (2 * v.x1 * prev[1]); },
          solution: function (v) { var K = v.c * v.c - 1, y = Math.sqrt(v.x1 * v.x1 + K * v.x1); return 'La ecuación da la pendiente: $y\' = \\dfrac{' + (v.x1 * v.x1) + ' + ' + fx(y * y) + '}{2(' + v.x1 + ')(' + fx(y) + ')} \\approx ' + fx((v.x1 * v.x1 + y * y) / (2 * v.x1 * y)) + '$.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2,
          prompt: function (v) { return 'Con tus resultados de b) y c), ¿dónde corta al eje $y$ la recta tangente en $x = ' + v.x1 + '$?'; },
          answer: function (v, prev) { return prev[1] - prev[2] * v.x1; },
          solution: function (v) { var K = v.c * v.c - 1, y = Math.sqrt(v.x1 * v.x1 + K * v.x1), m = (v.x1 * v.x1 + y * y) / (2 * v.x1 * y); return 'Tangente: $y = y_1 + m(x - ' + v.x1 + ')$; en $x = 0$ vale $' + fx(y) + ' - ' + fx(m) + '(' + v.x1 + ') \\approx ' + fx(y - m * v.x1) + '$.'; }
        }
      ]
    },
    {
      id: 'c3-ex-sustitucion', tags: ['c3.S03'], block: 'A', title: 'Sustitución u = x + y',
      vars: { b: [2, 4, 1], x1: [0.1, 0.3, 0.05] },
      where: function (v) { return v.x1 < 1 / v.b - 0.05; },
      statement: function (v) { return '<p>Resuelve $y\' = (x + y)^2 - 1$ con $y(0) = ' + v.b + '$ usando $u = x + y$. Con eso, $u\' = u^2$.</p>'; },
      diagram: { id: 'exam-fn', state: function (v) {
        var xe = 1 / v.b - 0.04;
        return { x: [-1, xe], fns: [{ f: function (x) { return v.b / (1 - v.b * x) - x; }, cls: 'ref', label: 'y(x)' }], pts: [{ x: 0, y: v.b, label: 'y(0) = ' + v.b }], xlab: 'x', ylab: 'y' };
      } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3,
          prompt: function () { return 'De $-\\dfrac{1}{u} = x + C$, ¿cuánto vale $C$?'; },
          answer: function (v) { return -1 / v.b; },
          solution: function (v) { return 'En $x = 0$, $u = 0 + ' + v.b + '$: $-\\frac{1}{' + v.b + '} = C$, así que $C \\approx ' + fx(-1 / v.b, 4) + '$.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3,
          prompt: function (v) { return 'Con tu $C$, ¿cuánto vale $u(' + v.x1 + ')$?'; },
          answer: function (v, prev) { return -1 / (v.x1 + prev[0]); },
          solution: function (v) { return '$u = -\\dfrac{1}{x + C}$, así que $u(' + v.x1 + ') = -\\dfrac{1}{' + v.x1 + ' - ' + fx(1 / v.b, 4) + '} \\approx ' + fx(-1 / (v.x1 - 1 / v.b)) + '$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2,
          prompt: function (v) { return 'Con tu $u(' + v.x1 + ')$, ¿cuánto vale $y(' + v.x1 + ')$?'; },
          answer: function (v, prev) { return prev[1] - v.x1; },
          solution: function (v) { var u = -1 / (v.x1 - 1 / v.b); return 'Regresa: $y = u - x \\approx ' + fx(u) + ' - ' + v.x1 + ' = ' + fx(u - v.x1) + '$.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2,
          prompt: function (v) { return 'Con tu $C$, ¿en qué $x > 0$ explota la solución (su asíntota vertical)?'; },
          answer: function (v, prev) { return -prev[0]; },
          solution: function (v) { return '$u = -\\frac{1}{x + C}$ se va a infinito cuando $x = -C = \\frac{1}{' + v.b + '} \\approx ' + fx(1 / v.b, 4) + '$.'; }
        }
      ]
    },
    {
      id: 'c3-ex-tanque', tags: ['c3.S04'], block: 'A', title: 'Salmuera en un tanque',
      vars: { V: [100, 400, 50], A0: [0, 20, 5], c: [0.2, 1, 0.1], r: [2, 10, 1], t1: [10, 40, 5] },
      where: function (v) { return v.A0 < 0.5 * v.V * v.c; },
      statement: function (v) { return '<p>Un tanque tiene ' + v.V + ' L de agua con ' + v.A0 + ' g de sal. Entra salmuera con ' + v.c + ' g/L a ' + v.r + ' L/min y sale la mezcla a la misma razón. $A(t)$ es la sal en gramos, con $t$ en minutos.</p>'; },
      diagram: { id: 'exam-fn', state: function (v) {
        var S = v.V * v.c, k = v.r / v.V, t9 = Math.log((S - v.A0) / (0.1 * S)) / k;
        return { x: [0, 1.15 * t9], y: [0, 1.15 * S], fns: [{ f: function (t) { return S + (v.A0 - S) * Math.exp(-k * t); }, cls: 'ref', label: 'A(t)' }],
          hlines: [{ y: S, label: fx(S) + ' g' }], xlab: 't (min)', ylab: 'A (g)' };
      } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2, unit: 'g',
          prompt: function () { return '¿A cuántos gramos de sal tiende el tanque cuando $t \\to \\infty$ (estado estacionario)?'; },
          answer: function (v) { return v.V * v.c; },
          solution: function (v) { return 'Con $A\' = 0$: $r c_{in} = r\\frac{A}{V}$, así que $A = Vc_{in} = ' + v.V + '(' + v.c + ') = ' + fx(v.V * v.c) + '$ g.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3, unit: 'g',
          prompt: function (v) { return 'Con tu estado estacionario, ¿cuánta sal hay a los ' + v.t1 + ' minutos?'; },
          answer: function (v, prev) { return prev[0] + (v.A0 - prev[0]) * Math.exp(-v.r * v.t1 / v.V); },
          solution: function (v) { var S = v.V * v.c; return '$A = ' + fx(S) + ' + (' + v.A0 + ' - ' + fx(S) + ')e^{-' + v.r + 't/' + v.V + '}$, así que $A(' + v.t1 + ') \\approx ' + fx(S + (v.A0 - S) * Math.exp(-v.r * v.t1 / v.V)) + '$ g.'; }
        },
        {
          label: 'c', type: 'numeric', points: 3, unit: 'min',
          prompt: function () { return 'Con tu estado estacionario, ¿en cuántos minutos el tanque llega al 90 % de ese valor?'; },
          answer: function (v, prev) { return (v.V / v.r) * Math.log((prev[0] - v.A0) / (0.1 * prev[0])); },
          solution: function (v) { var S = v.V * v.c; return '$0.9S = S + (A_0 - S)e^{-rt/V}$ da $t = \\dfrac{V}{r}\\ln\\dfrac{S - A_0}{0.1S} = \\dfrac{' + v.V + '}{' + v.r + '}\\ln\\dfrac{' + fx(S - v.A0) + '}{' + fx(0.1 * S) + '} \\approx ' + fx((v.V / v.r) * Math.log((S - v.A0) / (0.1 * S))) + '$ min.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: 'g/min',
          prompt: function (v) { return 'Con tu resultado del inciso b), ¿a qué ritmo está entrando sal neta al tanque a los ' + v.t1 + ' minutos ($A\'$)?'; },
          answer: function (v, prev) { return v.r * v.c - v.r * prev[1] / v.V; },
          solution: function (v) { var S = v.V * v.c, A = S + (v.A0 - S) * Math.exp(-v.r * v.t1 / v.V); return '$A\' = r c_{in} - r\\frac{A}{V} = ' + fx(v.r * v.c) + ' - ' + v.r + '\\cdot\\frac{' + fx(A) + '}{' + v.V + '} \\approx ' + fx(v.r * v.c - v.r * A / v.V) + '$ g/min.'; }
        }
      ]
    },
    {
      id: 'c3-ex-rc', tags: ['c3.S04'], block: 'A', title: 'Un capacitor que se carga',
      vars: { R: [1, 5, 1], C: [1, 8, 1], E: [6, 24, 3], t1: [2, 12, 2] },
      statement: function (v) { return '<p>Un circuito RC en serie tiene $R = ' + v.R + '$ kΩ, $C = ' + v.C + '$ μF y una fem de ' + v.E + ' V; el capacitor empieza descargado. Cumple $Rq\' + q/C = \\varepsilon$. Usa milisegundos, microcoulombs y miliamperes (las unidades cuadran).</p>'; },
      diagram: { id: 'exam-fn', state: function (v) {
        var tau = v.R * v.C;
        return { x: [0, 5 * tau], y: [0, 1.15 * v.C * v.E], fns: [{ f: function (t) { return v.C * v.E * (1 - Math.exp(-t / tau)); }, cls: 'ref', label: 'q(t)' }],
          hlines: [{ y: v.C * v.E, label: 'Cε' }], xlab: 't (ms)', ylab: 'q (μC)' };
      } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2, unit: 'ms',
          prompt: function () { return '¿Cuánto vale la constante de tiempo $\\tau = RC$?'; },
          answer: function (v) { return v.R * v.C; },
          solution: function (v) { return '$\\tau = RC = (' + v.R + '\\ \\text{k}\\Omega)(' + v.C + '\\ \\mu\\text{F}) = ' + (v.R * v.C) + '$ ms.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3, unit: 'μC',
          prompt: function (v) { return 'Con tu $\\tau$, ¿qué carga tiene el capacitor a los ' + v.t1 + ' ms?'; },
          answer: function (v, prev) { return v.C * v.E * (1 - Math.exp(-v.t1 / prev[0])); },
          solution: function (v) { var tau = v.R * v.C; return 'Con factor integrante, $q = C\\varepsilon(1 - e^{-t/\\tau})$: $q(' + v.t1 + ') = ' + (v.C * v.E) + '(1 - e^{-' + v.t1 + '/' + tau + '}) \\approx ' + fx(v.C * v.E * (1 - Math.exp(-v.t1 / tau))) + '$ μC.'; }
        },
        {
          label: 'c', type: 'numeric', points: 3, unit: 'mA',
          prompt: function (v) { return 'Con tu carga del inciso b), ¿cuánta corriente circula a los ' + v.t1 + ' ms? (Usa la ecuación: $i = q\' = (\\varepsilon - q/C)/R$.)'; },
          answer: function (v, prev) { return (v.E - prev[1] / v.C) / v.R; },
          solution: function (v) { var tau = v.R * v.C, q = v.C * v.E * (1 - Math.exp(-v.t1 / tau)); return '$i = \\dfrac{' + v.E + ' - ' + fx(q) + '/' + v.C + '}{' + v.R + '} \\approx ' + fx((v.E - q / v.C) / v.R) + '$ mA.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: 'ms',
          prompt: function () { return 'Con tu $\\tau$, ¿en cuánto tiempo llega al 95 % de su carga máxima?'; },
          answer: function (v, prev) { return prev[0] * Math.log(20); },
          solution: function (v) { return '$1 - e^{-t/\\tau} = 0.95$ da $t = \\tau\\ln 20 \\approx ' + fx(v.R * v.C * Math.log(20)) + '$ ms (unas tres constantes de tiempo).'; }
        }
      ]
    },
    {
      id: 'c3-ex-lineal', tags: ['c3.S04', 'c3.S01'], block: 'A', title: 'Factor integrante con potencias',
      vars: { c: [1, 5, 1], x1: [2, 4, 1] },
      statement: function (v) { return '<p>Resuelve $x\\,y\' + 2y = x^2$ con $y(1) = ' + v.c + '$, para $x > 0$. En forma estándar, el factor integrante es $\\mu = x^2$ y queda $x^2y = \\dfrac{x^4}{4} + C$.</p>'; },
      diagram: { id: 'exam-fn', state: function (v) {
        var C = v.c - 0.25;
        return { x: [0.5, v.x1 + 0.5], fns: [{ f: function (x) { return x * x / 4 + C / (x * x); }, cls: 'ref', label: 'y(x)' }], pts: [{ x: 1, y: v.c, label: '(1, ' + v.c + ')' }], xlab: 'x', ylab: 'y' };
      } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 3,
          prompt: function () { return '¿Cuánto vale la constante $C$?'; },
          answer: function (v) { return v.c - 0.25; },
          solution: function (v) { return 'En $x = 1$: $' + v.c + ' = \\frac{1}{4} + C$, así que $C = ' + fx(v.c - 0.25) + '$.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3,
          prompt: function (v) { return 'Con tu $C$, ¿cuánto vale $y(' + v.x1 + ')$?'; },
          answer: function (v, prev) { return v.x1 * v.x1 / 4 + prev[0] / (v.x1 * v.x1); },
          solution: function (v) { var C = v.c - 0.25; return '$y = \\dfrac{x^2}{4} + \\dfrac{C}{x^2}$ (la $C$ también se divide entre $x^2$): $y(' + v.x1 + ') = ' + fx(v.x1 * v.x1 / 4) + ' + \\frac{' + fx(C) + '}{' + (v.x1 * v.x1) + '} \\approx ' + fx(v.x1 * v.x1 / 4 + C / (v.x1 * v.x1)) + '$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 2,
          prompt: function (v) { return 'Con tu $y(' + v.x1 + ')$, ¿cuánto vale $y\'(' + v.x1 + ')$? (Usa la ecuación.)'; },
          answer: function (v, prev) { return (v.x1 * v.x1 - 2 * prev[1]) / v.x1; },
          solution: function (v) { var C = v.c - 0.25, y = v.x1 * v.x1 / 4 + C / (v.x1 * v.x1); return '$y\' = \\dfrac{x^2 - 2y}{x} = \\dfrac{' + (v.x1 * v.x1) + ' - 2(' + fx(y) + ')}{' + v.x1 + '} \\approx ' + fx((v.x1 * v.x1 - 2 * y) / v.x1) + '$.'; }
        }
      ]
    },
    {
      id: 'c3-ex-logistica', tags: ['c3.S05'], block: 'A', title: 'Peces en un lago',
      vars: { K: [400, 2000, 100], P0: [20, 100, 10], r: [0.2, 0.8, 0.05], t1: [3, 10, 1] },
      where: function (v) { return v.P0 < v.K / 5; },
      statement: function (v) { return '<p>Una población de peces sigue la logística $P\' = ' + v.r + 'P\\left(1 - \\dfrac{P}{' + v.K + '}\\right)$, con $t$ en años y $P(0) = ' + v.P0 + '$. Su solución es $P = \\dfrac{K}{1 + Ae^{-rt}}$.</p>'; },
      diagram: { id: 'exam-fn', state: function (v) {
        var A = v.K / v.P0 - 1;
        return { x: [0, 2.2 * Math.log(A) / v.r], y: [0, 1.12 * v.K], fns: [{ f: function (t) { return v.K / (1 + A * Math.exp(-v.r * t)); }, cls: 'ref', label: 'P(t)' }],
          hlines: [{ y: v.K, label: 'K = ' + v.K }], xlab: 't (años)', ylab: 'P' };
      } },
      parts: [
        {
          label: 'a', type: 'numeric', points: 2,
          prompt: function () { return '¿Cuánto vale la constante $A$?'; },
          answer: function (v) { return v.K / v.P0 - 1; },
          solution: function (v) { return 'En $t = 0$: $' + v.P0 + ' = \\frac{' + v.K + '}{1 + A}$, así que $A = \\frac{' + v.K + '}{' + v.P0 + '} - 1 = ' + fx(v.K / v.P0 - 1) + '$.'; }
        },
        {
          label: 'b', type: 'numeric', points: 3,
          prompt: function (v) { return 'Con tu $A$, ¿cuántos peces hay a los ' + v.t1 + ' años? (No redondees a entero.)'; },
          answer: function (v, prev) { return v.K / (1 + prev[0] * Math.exp(-v.r * v.t1)); },
          solution: function (v) { var A = v.K / v.P0 - 1; return '$P(' + v.t1 + ') = \\dfrac{' + v.K + '}{1 + ' + fx(A) + 'e^{-' + v.r + '(' + v.t1 + ')}} \\approx ' + fx(v.K / (1 + A * Math.exp(-v.r * v.t1))) + '$.'; }
        },
        {
          label: 'c', type: 'numeric', points: 3, unit: 'años',
          prompt: function () { return 'Con tu $A$, ¿en qué momento la población llega a $K/2$ (donde crece más rápido)?'; },
          answer: function (v, prev) { return Math.log(prev[0]) / v.r; },
          solution: function (v) { var A = v.K / v.P0 - 1; return '$1 + Ae^{-rt} = 2$ da $t = \\dfrac{\\ln A}{r} = \\dfrac{\\ln ' + fx(A) + '}{' + v.r + '} \\approx ' + fx(Math.log(A) / v.r) + '$ años.'; }
        },
        {
          label: 'd', type: 'numeric', points: 2, unit: 'peces/año',
          prompt: function (v) { return 'Con tu población del inciso b), ¿qué tan rápido crece a los ' + v.t1 + ' años ($P\'$)?'; },
          answer: function (v, prev) { return v.r * prev[1] * (1 - prev[1] / v.K); },
          solution: function (v) { var A = v.K / v.P0 - 1, P = v.K / (1 + A * Math.exp(-v.r * v.t1)); return '$P\' = rP(1 - P/K) = ' + v.r + '(' + fx(P) + ')\\left(1 - \\frac{' + fx(P) + '}{' + v.K + '}\\right) \\approx ' + fx(v.r * P * (1 - P / v.K)) + '$ peces por año.'; }
        }
      ]
    }
  ]);
})();
