/* =====================================================================
   Cálculo 2 · S09 · Multiplicadores de Lagrange con una restricción
   (bloque B · Gradiente y optimización), con un repaso breve de puntos críticos.
   Fuente: OpenStax, Calculus Volume 3, §4.7 y §4.8 (CC BY-NC-SA 4.0).
   Las respuestas se calculan aquí con fórmulas cerradas; scripts/examples.test.js
   las compara contra LabMath.lagrange (búsqueda densa sobre la restricción
   parametrizada, Newton del sistema de Lagrange y puntos críticos libres).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function sg(v) { return v < 0 ? '(' + v + ')' : String(v); }
  // Polinomio en LaTeX y en math.js: terms = [[coef, 'x^2', 'x^2'], …] (tex, src).
  function polyTex(terms) {
    var s = '';
    terms.forEach(function (t) {
      var k = t[0]; if (!k) return;
      var a = Math.abs(k), body = t[1] ? (a === 1 ? '' : a) + t[1] : String(a);
      s += s ? (k < 0 ? ' - ' : ' + ') + body : (k < 0 ? '-' : '') + body;
    });
    return s || '0';
  }
  function polySrc(terms) {
    return terms.filter(function (t) { return t[0]; }).map(function (t) { return '(' + t[0] + ')' + (t[2] ? '*' + t[2] : ''); }).join(' + ') || '0';
  }
  function quad(v) { return [[v.a, 'x^2', 'x^2'], [v.b, 'xy', 'x*y'], [v.c, 'y^2', 'y^2'], [v.d, 'x', 'x'], [v.e, 'y', 'y']]; }

  // La respuesta y cada error típico deben quedar separados (más que la holgura del calificador).
  function apart(gap) {
    return function (ex) {
      return function (v) {
        var w = Object.assign({}, v, ex.derive ? ex.derive(v) : {});
        if (ex.baseWhere && !ex.baseWhere(w)) return false;
        var vals = [ex.answer(w)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](w); }));
        for (var i = 0; i < vals.length; i++) {
          if (!isFinite(vals[i])) return false;
          for (var j = i + 1; j < vals.length; j++) if (Math.abs(vals[i] - vals[j]) <= gap(vals[i], vals[j])) return false;
        }
        return true;
      };
    };
  }
  var REL = apart(function (p, q) { return 0.02 + 0.015 * Math.max(Math.abs(p), Math.abs(q)); });

  // Ejemplo 5: Cobb-Douglas P = 100 x^0.6 y^0.4 con 10x + 20y = 1000.
  var e5 = { x: 60, y: 20 };
  e5.P = 100 * Math.pow(e5.x, 0.6) * Math.pow(e5.y, 0.4);
  e5.lam = e5.P / 1000;

  var data = window.SESSION_DATA = {
    slug: 'sesion-09', number: '09', group: 'B · Gradiente y optimización',
    title: 'Multiplicadores de Lagrange con una restricción', temario: [],
    minutes: 180,
    quote: 'Si caminas por un sendero que rodea un cerro, el punto más alto de tu camino es donde el sendero apenas roza una curva de nivel. Ahí los dos gradientes apuntan igual.',
    badges: [
      'Encontrar los puntos críticos de $f(x, y)$ y clasificarlos con $D = f_{xx}f_{yy} - f_{xy}^2$.',
      'Explicar por qué en el óptimo con restricción $\\nabla f = \\lambda\\nabla g$.',
      'Plantear y resolver el sistema $f_x = \\lambda g_x$, $f_y = \\lambda g_y$, $g = c$ sin perder candidatos.',
      'Interpretar $\\lambda$ y resolver problemas de áreas, distancias, producción y cajas.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Para optimizar $f(x, y)$ cuando solo puedes moverte sobre una curva $g(x, y) = c$, busca los puntos donde esa curva toca de lado a una curva de nivel de $f$: ahí $\\nabla f = \\lambda\\nabla g$.',
        recall: [
          'Optimización en una variable: derivar, igualar a cero y comparar candidatos (<a href="../../../calculo-1/sesiones/sesion-08/">Cálculo 1, S08</a>).',
          'Derivadas parciales y de segundo orden (S04).',
          'El gradiente $\\nabla f = \\langle f_x, f_y\\rangle$ es perpendicular a las curvas de nivel y apunta hacia donde $f$ crece más rápido (<a href="../sesion-08/">S08</a>).'
        ],
        why: 'Casi nunca optimizas libremente: hay un presupuesto, un material limitado, un camino por el que tienes que ir. Maximizar la producción con un presupuesto fijo, gastar el menor material en una caja de volumen dado o encontrar el punto de una carretera más cercano a tu casa son problemas con restricción. Lagrange los resuelve todos con la misma receta.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Estás en un cerro y no puedes ir a la cima: solo puedes caminar por un sendero que le da la vuelta. ¿Cuál es el punto más alto de tu caminata? No es la cima (no pasas por ahí). Es el punto del sendero donde dejas de subir y empiezas a bajar.',
          'Mira el mapa del cerro con sus curvas de nivel. Mientras el sendero <strong>cruza</strong> curvas de nivel, vas cambiando de altura: todavía puedes subir. En el punto más alto, el sendero <strong>roza</strong> una curva de nivel sin cruzarla: ahí son tangentes.',
          'Lo mismo pasa con dinero: con un presupuesto fijo, la mejor compra es la que toca la curva de «igual satisfacción» más alta que tu presupuesto alcanza. La restricción es el sendero; las curvas de nivel de $f$ son las alturas.'
        ]
      },
      {
        type: 'concept', heading: 'Repaso: puntos críticos en dos variables', short: 'Puntos críticos',
        body: [
          'Sin restricción, los máximos y mínimos locales de $f(x, y)$ están donde el plano tangente es horizontal: $$\\nabla f = \\vec 0 \\quad\\Longleftrightarrow\\quad f_x = 0 \\ \\text{y}\\ f_y = 0.$$ Esos son los <strong>puntos críticos</strong>, como en Cálculo 1 donde $f\'(x) = 0$.',
          'Para clasificarlos se usa el <strong>criterio de la segunda derivada</strong> con $D = f_{xx}f_{yy} - f_{xy}^2$ evaluado en el punto: si $D > 0$ y $f_{xx} > 0$ es un mínimo local; si $D > 0$ y $f_{xx} < 0$, un máximo local; si $D < 0$, un <strong>punto silla</strong>; si $D = 0$, el criterio no decide.',
          'Un punto silla es como una silla de montar: en una dirección sube y en otra baja. Por ejemplo, $f = x^2 - y^2$ tiene $\\nabla f = \\vec 0$ en el origen, pero $D = (2)(-2) - 0 = -4 < 0$: no es ni máximo ni mínimo.'
        ],
        diagram: 'c2s09-critical',
        caption: 'Los tres casos del criterio $D$. El punto marcado tiene $\\nabla f = \\vec 0$ en las tres superficies.'
      },
      {
        type: 'concept', heading: 'El problema con restricción', short: 'Con restricción',
        body: [
          'Ahora quieres el máximo (o mínimo) de $f(x, y)$ pero solo sobre los puntos que cumplen una restricción $g(x, y) = c$: una curva en el plano. La cima libre de $f$ casi nunca está sobre esa curva, así que $\\nabla f = \\vec 0$ ya no sirve.',
          'Una salida es despejar una variable de la restricción y sustituir, como en Cálculo 1. A veces funciona, pero con círculos, elipses o tres variables se complica. Lagrange da una condición que no necesita despejar nada.'
        ]
      },
      {
        type: 'explainer', heading: 'La curva toca una curva de nivel', short: 'La idea geométrica',
        title: 'Rectángulo con $x + 2y = 8$: maximiza $f = xy$',
        intro: 'Sigue el punto $P$ por la recta. Fíjate en la curva de nivel que pasa por $P$ y en las flechas de $\\nabla f$ y $\\nabla g$.',
        diagram: 'c2s09-tangent',
        steps: [
          { text: 'Solo puedes estar sobre la recta $g = x + 2y = 8$. En $P = (1.2, 3.4)$, $f = xy = 4.08$.', state: { t: 1.2, lv: 0, gr: 0 } },
          { text: 'Las curvas de nivel $xy = k$ son hipérbolas. La recta <strong>cruza</strong> la del nivel de $P$: si avanzas por la recta pasas a niveles más altos.', state: { t: 1.2, lv: 1, gr: 0 } },
          { text: 'En $P$, $\\nabla f$ y $\\nabla g$ no son paralelos: $\\nabla f$ tiene una parte a lo largo de la recta, y esa parte te dice hacia dónde subir.', state: { t: 1.2, lv: 1, gr: 1 } },
          { text: 'En $(4, 2)$ la recta solo <strong>roza</strong> la curva $xy = 8$: es tangente. No hay hacia dónde subir sin salirte de la recta.', state: { t: 4, lv: 1, gr: 1 } },
          { text: 'Ahí los dos gradientes son perpendiculares a la misma tangente, así que son paralelos: $\\nabla f = \\lambda\\nabla g$. Con $\\nabla f = \\langle 2, 4\\rangle$ y $\\nabla g = \\langle 1, 2\\rangle$, $\\lambda = 2$.', state: { t: 4, lv: 1, gr: 1 } },
          { text: 'Si te pasas, la recta vuelve a cruzar curvas, ahora hacia niveles más bajos: $f$ baja.', state: { t: 6.6, lv: 1, gr: 1 } }
        ]
      },
      {
        type: 'concept', heading: 'El sistema de Lagrange', short: 'El sistema',
        body: [
          'En un máximo o mínimo de $f$ sobre $g = c$ (con $\\nabla g \\neq \\vec 0$), existe un número $\\lambda$ tal que $$\\nabla f = \\lambda\\,\\nabla g.$$ El número $\\lambda$ se llama <strong>multiplicador de Lagrange</strong>.',
          'Por componentes, junto con la restricción, son tres ecuaciones con tres incógnitas $x$, $y$, $\\lambda$: $$f_x = \\lambda g_x,\\qquad f_y = \\lambda g_y,\\qquad g(x, y) = c.$$ Cada solución es un <strong>candidato</strong>. El sistema no dice cuál es máximo y cuál mínimo: eso lo decides <strong>evaluando $f$ en todos los candidatos</strong>. El mayor valor es el máximo y el menor, el mínimo (si la curva es cerrada y acotada, como un círculo o una elipse, los dos existen).',
          'Si la restricción es solo un tramo (por ejemplo, la parte de una recta con $x, y \\ge 0$), agrega a la lista los extremos del tramo, como hacías con los extremos de un intervalo en Cálculo 1.'
        ]
      },
      {
        type: 'callout', heading: 'Cómo resolver el sistema sin perder candidatos',
        body: [
          'El truco más común: despeja $\\lambda$ de las dos primeras ecuaciones e iguala, $\\dfrac{f_x}{g_x} = \\dfrac{f_y}{g_y}$. Eso da una relación entre $x$ y $y$ que sustituyes en $g = c$.',
          '<strong>Ojo:</strong> dividir entre $x$ (o entre $g_x$) supone que no vale cero. Si $f_x = 2x$ y $g_x = 2x$, la ecuación $2x = \\lambda\\,2x$ se escribe mejor como $2x(1 - \\lambda) = 0$: o $x = 0$ o $\\lambda = 1$. <strong>Factoriza en vez de dividir</strong> y revisa los dos casos. El candidato con $x = 0$ es justo el que más se olvida, y a veces es el óptimo.'
        ]
      },
      {
        type: 'concept', heading: '¿Qué significa λ?', short: 'Significado de λ',
        body: [
          '$\\lambda$ no es solo un ayudante. Si $M(c)$ es el valor óptimo de $f$ sobre $g = c$, entonces $$\\lambda = \\frac{dM}{dc}.$$ Dice cuánto mejora el óptimo por cada unidad que aflojas la restricción.',
          'En economía se le llama <strong>precio sombra</strong>: si la restricción es un presupuesto en pesos, $\\lambda$ es cuánta producción (o utilidad) extra te da un peso más. En el rectángulo del explainer, $\\lambda = 2$: con una unidad más de cerca, el área máxima crece cerca de 2 unidades cuadradas.'
        ],
        diagram: 'c2s09-lambda',
        caption: 'Con $f = 3x + 4y$ en $x^2 + y^2 = c$: el máximo es $5\\sqrt{c}$, así que $\\lambda = \\tfrac{5}{2\\sqrt{c}}$. En $c = 4$, $\\lambda = 1.25$.'
      },
      {
        type: 'concept', heading: 'Tres variables, una restricción', short: 'Tres variables',
        body: [
          'Con $f(x, y, z)$ y una superficie $g(x, y, z) = c$ la idea es la misma: en el óptimo la superficie toca de lado una superficie de nivel de $f$, y $$\\nabla f = \\lambda\\nabla g,\\qquad g(x, y, z) = c.$$ Ahora son cuatro ecuaciones con cuatro incógnitas: $x$, $y$, $z$ y $\\lambda$.',
          'En problemas de cajas casi siempre ayuda la simetría: despeja $\\lambda$ de cada ecuación, iguala de dos en dos y verás relaciones como $x = y$ o $z = \\tfrac{x}{2}$. Recuerda que en cajas las medidas son positivas, así que ahí sí puedes dividir entre $x$, $y$ o $z$.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: Lagrange con una restricción', short: 'Receta',
        steps: [
          { text: 'Identifica qué optimizas ($f$) y la restricción ($g = c$). Escribe $g$ con todo en un lado y el número $c$ en el otro.', tip: 'En problemas de texto, lo que se «fija» (perímetro, presupuesto, volumen) es la restricción; lo que se pide «máximo» o «mínimo» es $f$.' },
          { text: 'Calcula $\\nabla f$ y $\\nabla g$ y escribe el sistema $f_x = \\lambda g_x$, $f_y = \\lambda g_y$, $g = c$.' },
          { text: 'Resuelve: despeja $\\lambda$ e iguala, o factoriza. Sustituye la relación en $g = c$.', tip: 'Antes de dividir entre $x$ o $y$, revisa el caso en que vale cero. Factoriza: $2x(1 - \\lambda) = 0$ da dos casos.' },
          { text: 'Haz la lista de candidatos (más los extremos del tramo si la restricción no es cerrada).' },
          { text: 'Evalúa $f$ en cada candidato: el mayor es el máximo y el menor, el mínimo. Si te lo piden, reporta $\\lambda$ del óptimo.', tip: 'La respuesta es el valor de $f$, no el de $\\lambda$. Y el punto crítico libre ($\\nabla f = \\vec 0$) solo cuenta si cumple $g = c$.' }
        ]
      },
      {
        type: 'example', heading: 'Clasificar puntos críticos',
        problem: '<p>Encuentra y clasifica los puntos críticos de $f(x, y) = x^3 - 3x + y^2 - 2y$.</p>',
        steps: [
          { text: 'Iguala las parciales a cero.', math: 'f_x = 3x^2 - 3 = 0 \\;\\Rightarrow\\; x = \\pm 1 \\qquad f_y = 2y - 2 = 0 \\;\\Rightarrow\\; y = 1' },
          { text: 'Segundas derivadas.', math: 'f_{xx} = 6x \\qquad f_{yy} = 2 \\qquad f_{xy} = 0 \\qquad D = 12x' },
          { text: 'En $(1, 1)$: $D = 12 > 0$ y $f_{xx} = 6 > 0$.', math: '\\text{mínimo local},\\ f(1, 1) = 1 - 3 + 1 - 2 = -3' },
          { text: 'En $(-1, 1)$: $D = -12 < 0$.', math: '\\text{punto silla}' }
        ],
        answer: 'Hay un mínimo local en $(1, 1)$ con $f = -3$ y un punto silla en $(-1, 1)$.',
        verify: { lab: 'call', mod: 'lagrange', fn: 'critical', math: true, args: ['x^3 - 3x + y^2 - 2y', [-3, 3, -3, 3]], values: { n: 2, 'pts.0.x': -1, 'pts.0.y': 1, 'pts.0.D': -12, 'pts.1.x': 1, 'pts.1.D': 12, 'pts.1.f': -3 } }
      },
      {
        type: 'example', heading: 'El rectángulo de perímetro fijo',
        problem: '<p>Con 40 m de cerca quieres encerrar un rectángulo de área máxima. ¿Qué medidas tiene y cuánto vale $\\lambda$?</p>',
        steps: [
          { text: 'Optimizas el área $f = xy$ con la restricción $g = 2x + 2y = 40$.', math: '\\nabla f = \\langle y, x\\rangle \\qquad \\nabla g = \\langle 2, 2\\rangle' },
          { text: 'Sistema de Lagrange.', math: 'y = 2\\lambda \\qquad x = 2\\lambda \\qquad 2x + 2y = 40' },
          { text: 'Las dos primeras dan $x = y$. En la restricción, $4x = 40$.', math: 'x = y = 10 \\qquad \\lambda = 5' },
          { text: 'Los extremos del tramo ($x = 0$ o $y = 0$) dan área 0, así que el máximo es el candidato.', math: 'A = 10 \\cdot 10 = 100\\ \\text{m}^2' }
        ],
        answer: 'Un cuadrado de $10 \\times 10$ m, con área $100\\ \\text{m}^2$ y $\\lambda = 5$: cada metro extra de cerca agrega cerca de $5\\ \\text{m}^2$.',
        verify: { lab: 'call', mod: 'lagrange', fn: 'optimum', math: true, args: ['x*y', { kind: 'line', a: 2, b: 2, c: 40 }], values: { max: 100, xMax: 10, yMax: 10, lambdaMax: 5 } }
      },
      {
        type: 'example', heading: 'El candidato con x = 0',
        problem: '<p>Encuentra el máximo y el mínimo de $f(x, y) = x^2 + 3y^2 - 2y$ sobre la circunferencia $x^2 + y^2 = 4$.</p>',
        steps: [
          { text: 'Gradientes y sistema.', math: '2x = \\lambda(2x) \\qquad 6y - 2 = \\lambda(2y) \\qquad x^2 + y^2 = 4' },
          { text: 'No dividas entre $x$: factoriza la primera ecuación.', math: '2x(1 - \\lambda) = 0 \\;\\Rightarrow\\; x = 0 \\ \\text{o}\\ \\lambda = 1' },
          { text: 'Caso $\\lambda = 1$: $6y - 2 = 2y$, así que $y = \\tfrac{1}{2}$ y $x^2 = \\tfrac{15}{4}$.', math: 'f\\left(\\pm\\tfrac{\\sqrt{15}}{2}, \\tfrac{1}{2}\\right) = \\tfrac{15}{4} + \\tfrac{3}{4} - 1 = 3.5' },
          { text: 'Caso $x = 0$: $y = \\pm 2$.', math: 'f(0, 2) = 12 - 4 = 8 \\qquad f(0, -2) = 12 + 4 = 16' },
          { text: 'Compara los cuatro candidatos.', math: '\\max = 16 \\ \\text{en}\\ (0, -2) \\qquad \\min = 3.5' }
        ],
        answer: 'El máximo es $16$, en $(0, -2)$: salió del caso $x = 0$. El mínimo es $3.5$, en $\\left(\\pm\\tfrac{\\sqrt{15}}{2}, \\tfrac{1}{2}\\right)$. Quien divide entre $x$ se queda con el mínimo y pierde el máximo.',
        verify: { lab: 'call', mod: 'lagrange', fn: 'optimum', math: true, args: ['x^2 + 3y^2 - 2y', { kind: 'circle', c: 4 }], values: { max: 16, min: 3.5, xMax: 0, yMax: -2, yMin: 0.5, lambdaMax: 3.5, lambdaMin: 1 } }
      },
      {
        type: 'example', heading: 'Lo más cerca de un punto',
        problem: '<p>¿Qué tan cerca pasa la parábola $y = x^2$ del punto $(0, 3)$?</p>',
        steps: [
          { text: 'Minimiza la distancia al cuadrado (es más fácil y tiene el mismo mínimo): $f = x^2 + (y - 3)^2$ con $g = y - x^2 = 0$.', math: '\\nabla f = \\langle 2x, 2(y - 3)\\rangle \\qquad \\nabla g = \\langle -2x, 1\\rangle' },
          { text: 'Sistema. Factoriza la primera ecuación.', math: '2x = -2\\lambda x \\;\\Rightarrow\\; 2x(1 + \\lambda) = 0 \\qquad 2(y - 3) = \\lambda' },
          { text: 'Caso $\\lambda = -1$: $y - 3 = -\\tfrac{1}{2}$, así que $y = 2.5$ y $x = \\pm\\sqrt{2.5}$.', math: 'f = 2.5 + 0.25 = 2.75' },
          { text: 'Caso $x = 0$: $y = 0$ y $f = 9$. Ese candidato (el vértice) es un máximo local de la distancia, no el mínimo.', math: 'd_{\\min} = \\sqrt{2.75} \\approx 1.66' }
        ],
        answer: 'Los puntos más cercanos son $(\\pm 1.58, 2.5)$ y la distancia mínima es $\\sqrt{2.75} \\approx 1.66$.',
        verify: { lab: 'call', mod: 'lagrange', fn: 'optimum', math: true, args: ['x^2 + (y - 3)^2', { kind: 'parabola', a: 1, c: 0, t: [-3, 3] }], values: { min: 2.75, yMin: 2.5, lambdaMin: -1 } }
      },
      {
        type: 'example', heading: 'Producción con presupuesto',
        problem: '<p>Una fábrica produce $P = 100\\,x^{0.6}y^{0.4}$ unidades con $x$ horas de trabajo (a 10 pesos la hora) y $y$ horas de máquina (a 20 pesos la hora). Con 1000 pesos, ¿cuánto conviene comprar de cada una y cuánto vale $\\lambda$?</p>',
        steps: [
          { text: 'Restricción: $10x + 20y = 1000$. Parciales de $P$: $P_x = \\dfrac{0.6P}{x}$ y $P_y = \\dfrac{0.4P}{y}$.', math: '\\frac{0.6P}{x} = 10\\lambda \\qquad \\frac{0.4P}{y} = 20\\lambda' },
          { text: 'Divide una entre otra: $\\dfrac{0.6\\,y}{0.4\\,x} = \\dfrac{10}{20}$, así que $x = 3y$.', math: '10(3y) + 20y = 1000 \\;\\Rightarrow\\; y = 20,\\ x = 60' },
          { text: 'Producción.', math: 'P = 100(60)^{0.6}(20)^{0.4} \\approx ' + fx(e5.P) },
          { text: 'De $0.6P/x = 10\\lambda$ sale $\\lambda = \\dfrac{P}{1000}$.', math: '\\lambda \\approx ' + fx(e5.lam) }
        ],
        answer: '$60$ horas de trabajo y $20$ de máquina, para $P \\approx ' + fx(e5.P) + '$ unidades. Con $\\lambda \\approx ' + fx(e5.lam) + '$, cada peso extra de presupuesto da unas ' + fx(e5.lam) + ' unidades más.',
        verify: { lab: 'call', mod: 'lagrange', fn: 'optimum', math: true, args: ['100*x^0.6*y^0.4', { kind: 'line', a: 10, b: 20, c: 1000 }], values: { max: e5.P, xMax: 60, yMax: 20, lambdaMax: e5.lam } }
      },
      {
        type: 'example', heading: 'La caja sin tapa',
        problem: '<p>Una caja sin tapa debe guardar $32\\ \\text{cm}^3$. ¿Qué medidas usan el menor material?</p>',
        steps: [
          { text: 'Material (área): base $xy$ y cuatro paredes. Restricción: el volumen.', math: 'f = xy + 2xz + 2yz \\qquad g = xyz = 32' },
          { text: 'Sistema $\\nabla f = \\lambda\\nabla g$.', math: 'y + 2z = \\lambda yz \\qquad x + 2z = \\lambda xz \\qquad 2x + 2y = \\lambda xy' },
          { text: 'Multiplica la primera por $x$ y la segunda por $y$: los lados derechos quedan iguales, así que $xy + 2xz = xy + 2yz$ y $x = y$. Igual, con la tercera, $z = \\tfrac{x}{2}$.', math: 'x \\cdot x \\cdot \\tfrac{x}{2} = 32 \\;\\Rightarrow\\; x^3 = 64' },
          { text: 'Medidas y material.', math: 'x = y = 4,\\ z = 2 \\qquad f = 16 + 16 + 16 = 48\\ \\text{cm}^2 \\qquad \\lambda = 1' }
        ],
        answer: 'Base de $4 \\times 4$ cm y altura de $2$ cm, con $48\\ \\text{cm}^2$ de material: la altura es la mitad del lado de la base.',
        verify: { lab: 'call', mod: 'lagrange', fn: 'newton3', math: true, args: ['x*y + 2*x*z + 2*y*z', 'x*y*z', 32, [3, 3, 3, 1]], values: { x: 4, y: 4, z: 2, f: 48, lambda: 1 } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿El sistema me dice si es máximo o mínimo?', a: 'No. Solo te da candidatos. Evalúa $f$ en todos y compara: el mayor es el máximo y el menor, el mínimo.' },
          { q: '¿Puedo usar $\\nabla f = \\vec 0$ como siempre?', a: 'Solo si el punto cumple la restricción. Casi siempre la cima libre de $f$ no está sobre la curva $g = c$, y por eso hace falta Lagrange.' },
          { q: '¿Por qué perdí un candidato?', a: 'Seguramente dividiste entre $x$ (o $y$) para despejar $\\lambda$. Si $x$ puede valer cero, factoriza: $2x(1 - \\lambda) = 0$ da dos casos.' },
          { q: '¿La respuesta es $\\lambda$?', a: 'No, $\\lambda$ es el multiplicador: dice cuánto cambia el óptimo si cambia $c$. El máximo o mínimo es el valor de $f$ en el punto.' },
          { q: '¿Por qué minimizo la distancia al cuadrado?', a: 'Porque la raíz complica las derivadas y, como la raíz crece, $d$ y $d^2$ tienen su mínimo en el mismo punto. Al final sacas la raíz.' },
          { q: '¿Qué pasa con el signo de $\\lambda$?', a: 'Puede ser positivo o negativo. Solo dice si $\\nabla f$ y $\\nabla g$ apuntan igual o al revés; los dos casos son candidatos válidos.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Sin restricción: $\\nabla f = \\vec 0$ y $D = f_{xx}f_{yy} - f_{xy}^2$ clasifica (mínimo, máximo, silla).',
          'Con restricción: en el óptimo la curva $g = c$ es tangente a una curva de nivel, así que $\\nabla f = \\lambda\\nabla g$.',
          'Resuelve $f_x = \\lambda g_x$, $f_y = \\lambda g_y$, $g = c$ sin dividir entre algo que puede ser cero, y evalúa $f$ en todos los candidatos.',
          '$\\lambda = \\dfrac{dM}{dc}$: lo que mejora el óptimo por unidad de restricción.'
        ]
      }
    ],

    lab: {
      type: 'lagrange-one', title: 'La restricción toca una curva de nivel',
      intro: 'Elige un problema y mueve el punto por la restricción con el deslizador $t$. Mira el ángulo entre $\\nabla f$ y $\\nabla g$: cuando llega a 0° o 180°, la curva de nivel que pasa por el punto es tangente a la restricción. Luego escribe el máximo (o mínimo) de $f$ y, si quieres, el punto. El lab lo compara contra una búsqueda densa sobre la restricción y te dice si diste un punto crítico libre, el otro extremo, un candidato que no era o el valor de $\\lambda$.',
      cfg: { start: 0 }
    },

    formulas: [
      { label: 'Punto crítico', tex: '\\nabla f = \\vec 0' },
      { label: 'Criterio D', tex: 'D = f_{xx}f_{yy} - f_{xy}^2' },
      { label: 'Lagrange', tex: '\\nabla f = \\lambda\\nabla g,\\ \\ g = c' },
      { label: 'Por componentes', tex: 'f_x = \\lambda g_x,\\ f_y = \\lambda g_y' },
      { label: 'Significado de λ', tex: '\\lambda = \\frac{dM}{dc}' }
    ],

    exercises: [
      {
        id: 'c2-s09-d', title: 'El valor de D',
        vars: { a: [-3, 3, 1], b: [-4, 4, 1], c: [-3, 3, 1], d: [-6, 6, 1], e: [-6, 6, 1] },
        baseWhere: function (v) { return v.a !== 0 && v.c !== 0 && v.b !== 0 && 4 * v.a * v.c - v.b * v.b !== 0; },
        prompt: function (v) { return '<p>La función $f(x, y) = ' + polyTex(quad(v)) + '$ tiene un solo punto crítico. ¿Cuánto vale ahí $D = f_{xx}f_{yy} - f_{xy}^2$?</p>'; },
        check: 'numeric',
        answer: function (v) { return 4 * v.a * v.c - v.b * v.b; },
        mistakes: {
          noTwo: function (v) { return v.a * v.c - v.b * v.b; },
          plus: function (v) { return 4 * v.a * v.c + v.b * v.b; },
          noSq: function (v) { return 4 * v.a * v.c - v.b; }
        },
        feedback: [
          { when: 'noTwo', say: 'Al derivar dos veces $ax^2$ queda $2a$, no $a$: $f_{xx} = 2a$ y $f_{yy} = 2c$.' },
          { when: 'plus', say: 'El término mixto se <em>resta</em>: $D = f_{xx}f_{yy} - f_{xy}^2$.' },
          { when: 'noSq', say: 'Falta elevar al cuadrado la mixta: $f_{xy}^2$.' }
        ],
        oracle: { lab: 'call', mod: 'lagrange', fn: 'critical', math: true, field: 'pts.0.D', args: function (v) { return [polySrc(quad(v)), [-120, 120, -120, 120]]; } },
        hint: 'Para $ax^2 + bxy + cy^2 + \\ldots$: $f_{xx} = 2a$, $f_{yy} = 2c$ y $f_{xy} = b$.',
        solution: function (v) { return '$f_{xx} = ' + 2 * v.a + '$, $f_{yy} = ' + 2 * v.c + '$, $f_{xy} = ' + v.b + '$. $$D = (' + 2 * v.a + ')(' + 2 * v.c + ') - ' + sg(v.b) + '^2 = ' + (4 * v.a * v.c - v.b * v.b) + '$$ En una cuadrática, $D$ vale lo mismo en todo el plano.'; }
      },
      {
        id: 'c2-s09-tipo', title: '¿Mínimo, máximo o silla?',
        vars: { a: [-3, 3, 1], b: [-4, 4, 1], c: [-3, 3, 1], d: [-6, 6, 1], e: [-6, 6, 1] },
        where: function (v) { return v.a !== 0 && v.c !== 0 && 4 * v.a * v.c - v.b * v.b !== 0; },
        prompt: function (v) { return '<p>¿Qué tipo de punto crítico tiene $f(x, y) = ' + polyTex(quad(v)) + '$?</p>'; },
        check: 'choice',
        options: function (v) {
          var D = 4 * v.a * v.c - v.b * v.b, k = D < 0 ? 2 : v.a > 0 ? 0 : 1;
          var T = ['Un mínimo local', 'Un máximo local', 'Un punto silla'];
          var why = [
            D > 0 ? 'Aquí $f_{xx} = ' + 2 * v.a + ' < 0$: con $D > 0$ eso es un máximo.' : 'Con $D = ' + D + ' < 0$ no es extremo: es silla.',
            D > 0 ? 'Aquí $f_{xx} = ' + 2 * v.a + ' > 0$: con $D > 0$ eso es un mínimo.' : 'Con $D = ' + D + ' < 0$ no es extremo: es silla.',
            'Silla requiere $D < 0$, y aquí $D = ' + D + ' > 0$.'
          ];
          var out = T.map(function (t, i) { return i === k ? { text: t, correct: true } : { text: t, say: why[i] }; });
          out.push({ text: 'El criterio no decide', say: 'Solo pasa con $D = 0$; aquí $D = ' + D + '$.' });
          return out;
        },
        answer: function (v) { var D = 4 * v.a * v.c - v.b * v.b; return D < 0 ? 'Un punto silla' : v.a > 0 ? 'Un mínimo local' : 'Un máximo local'; },
        hint: 'Calcula $D = (2a)(2c) - b^2$. Si $D > 0$, el signo de $f_{xx} = 2a$ decide.',
        solution: function (v) { var D = 4 * v.a * v.c - v.b * v.b; return '$D = (' + 2 * v.a + ')(' + 2 * v.c + ') - ' + sg(v.b) + '^2 = ' + D + '$. ' + (D < 0 ? 'Como $D < 0$, es un punto silla.' : 'Como $D > 0$ y $f_{xx} = ' + 2 * v.a + (v.a > 0 ? ' > 0$, es un mínimo local.' : ' < 0$, es un máximo local.')); }
      },
      {
        id: 'c2-s09-circulo', title: 'Máximo en una circunferencia',
        vars: { p: [-6, 6, 1], q: [-6, 6, 1], R: [1, 5, 1] },
        baseWhere: function (v) { return v.p !== 0 && v.q !== 0; },
        prompt: function (v) { return '<p>¿Cuál es el valor máximo de $f(x, y) = ' + polyTex([[v.p, 'x'], [v.q, 'y']]) + '$ sobre la circunferencia $x^2 + y^2 = ' + v.R * v.R + '$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.R * Math.hypot(v.p, v.q); },
        mistakes: {
          min: function (v) { return -v.R * Math.hypot(v.p, v.q); },
          lambda: function (v) { return Math.hypot(v.p, v.q) / (2 * v.R); },
          useC: function (v) { return v.R * v.R * Math.hypot(v.p, v.q); }
        },
        feedback: [
          { when: 'min', say: 'Ese es el mínimo: el punto opuesto. Evalúa $f$ en los dos candidatos y quédate con el mayor.' },
          { when: 'lambda', say: 'Ese número es $\\lambda$. Se pide el valor de $f$ en el punto óptimo.' },
          { when: 'useC', say: 'El radio es la raíz de ' + 'lo que está a la derecha: $R = \\sqrt{c}$, no $c$.' }
        ],
        oracle: { lab: 'call', mod: 'lagrange', fn: 'optimum', math: true, field: 'max', args: function (v) { return [v.p + '*x + ' + sg(v.q) + '*y', { kind: 'circle', c: v.R * v.R }]; } },
        hint: '$\\langle p, q\\rangle = \\lambda\\langle 2x, 2y\\rangle$: el punto óptimo apunta en la dirección de $\\langle p, q\\rangle$, a distancia $R$ del origen.',
        solution: function (v) {
          var m = Math.hypot(v.p, v.q);
          return 'De $p = 2\\lambda x$, $q = 2\\lambda y$: $(x, y) = \\pm\\dfrac{R}{\\sqrt{p^2 + q^2}}(p, q)$. Con el signo $+$: $$f_{\\max} = R\\sqrt{p^2 + q^2} = ' + v.R + '\\sqrt{' + (v.p * v.p + v.q * v.q) + '} \\approx ' + fx(v.R * m) + '$$';
        }
      },
      {
        id: 'c2-s09-cerca', title: 'Cerca y área máxima',
        vars: { L: [40, 400, 20], rio: [0, 1, 1] },
        prompt: function (v) {
          return '<p>Tienes $' + v.L + '$ m de cerca para un terreno rectangular' + (v.rio ? ' junto a un río: el lado del río no lleva cerca (la cerca cubre $2x + y$, con $y$ paralelo al río)' : ' cercado por sus cuatro lados') + '. ¿Cuál es el área máxima?</p>';
        },
        check: 'numeric', unit: 'm²',
        answer: function (v) { return v.rio ? v.L * v.L / 8 : v.L * v.L / 16; },
        mistakes: {
          otherCase: function (v) { return v.rio ? v.L * v.L / 16 : v.L * v.L / 8; },
          lambda: function (v) { return v.rio ? v.L / 4 : v.L / 8; }
        },
        feedback: [
          { when: 'otherCase', say: 'Revisa la restricción: ' + 'con río la cerca cubre $2x + y$; sin río, $2x + 2y$. Con río el óptimo ya no es un cuadrado.' },
          { when: 'lambda', say: 'Ese es $\\lambda$ (los m² extra por metro de cerca). Se pide el área $xy$.' }
        ],
        oracle: { lab: 'call', mod: 'lagrange', fn: 'optimum', math: true, field: 'max', args: function (v) { return ['x*y', { kind: 'line', a: 2, b: v.rio ? 1 : 2, c: v.L }]; } },
        hint: 'Maximiza $f = xy$ con $g = 2x + y = L$ (río) o $2x + 2y = L$. Las ecuaciones $y = 2\\lambda$, $x = \\lambda$ (o $x = 2\\lambda$) dan la relación entre $x$ y $y$.',
        solution: function (v) {
          if (v.rio) return '$y = 2\\lambda$, $x = \\lambda$, así que $y = 2x$. Con $2x + y = ' + v.L + '$: $x = ' + fx(v.L / 4) + '$, $y = ' + fx(v.L / 2) + '$ y $$A = ' + fx(v.L / 4) + ' \\cdot ' + fx(v.L / 2) + ' = ' + fx(v.L * v.L / 8) + '\\ \\text{m}^2$$';
          return '$y = 2\\lambda$, $x = 2\\lambda$: es un cuadrado de lado $' + fx(v.L / 4) + '$ m y $$A = ' + fx(v.L * v.L / 16) + '\\ \\text{m}^2$$';
        }
      },
      {
        id: 'c2-s09-recta', title: 'Distancia a una recta',
        vars: { a: [1, 4, 1], b: [1, 4, 1], c: [2, 12, 1], x0: [-3, 3, 1], y0: [-3, 3, 1] },
        baseWhere: function (v) { return Math.abs(v.a * v.x0 + v.b * v.y0 - v.c) >= 1; },
        prompt: function (v) { return '<p>Con Lagrange, encuentra la distancia mínima del punto $(' + v.x0 + ', ' + v.y0 + ')$ a la recta $' + polyTex([[v.a, 'x'], [v.b, 'y']]) + ' = ' + v.c + '$.</p>'; },
        check: 'numeric',
        answer: function (v) { return Math.abs(v.a * v.x0 + v.b * v.y0 - v.c) / Math.hypot(v.a, v.b); },
        mistakes: {
          squared: function (v) { var s = v.a * v.x0 + v.b * v.y0 - v.c; return s * s / (v.a * v.a + v.b * v.b); },
          noRoot: function (v) { return Math.abs(v.a * v.x0 + v.b * v.y0 - v.c) / (v.a * v.a + v.b * v.b); }
        },
        feedback: [
          { when: 'squared', say: 'Ese es $d^2$, lo que minimizaste. Saca la raíz al final.' },
          { when: 'noRoot', say: 'La longitud del normal es $\\sqrt{a^2 + b^2}$, no $a^2 + b^2$.' }
        ],
        oracle: {
          lab: 'call', mod: 'lagrange', fn: 'optimum', math: true, field: 'min',
          args: function (v) {
            var s = v.a * v.x0 + v.b * v.y0 - v.c, xf = v.x0 - v.a * s / (v.a * v.a + v.b * v.b);
            return ['sqrt((x - ' + sg(v.x0) + ')^2 + (y - ' + sg(v.y0) + ')^2)', { kind: 'line', a: v.a, b: v.b, c: v.c, t: [xf - 15, xf + 15] }];
          }
        },
        hint: 'Minimiza $f = (x - x_0)^2 + (y - y_0)^2$ con $g = ax + by = c$: $2(x - x_0) = \\lambda a$ y $2(y - y_0) = \\lambda b$, así que el punto más cercano es $(x_0, y_0) + \\tfrac{\\lambda}{2}\\langle a, b\\rangle$.',
        solution: function (v) {
          var s = v.a * v.x0 + v.b * v.y0 - v.c, n2 = v.a * v.a + v.b * v.b, l = -2 * s / n2;
          return 'Sustituye $(x, y) = (' + v.x0 + ', ' + v.y0 + ') + \\tfrac{\\lambda}{2}\\langle ' + v.a + ', ' + v.b + '\\rangle$ en la recta: $' + s + ' + \\tfrac{\\lambda}{2}(' + n2 + ') = 0$, así que $\\lambda = ' + fx(l, 4) + '$. La distancia es $$\\tfrac{|\\lambda|}{2}\\sqrt{' + n2 + '} = \\frac{' + Math.abs(s) + '}{\\sqrt{' + n2 + '}} \\approx ' + fx(Math.abs(s) / Math.sqrt(n2)) + '$$';
        }
      },
      {
        id: 'c2-s09-caja', title: 'Caja de volumen máximo',
        vars: { S: [48, 300, 12], open: [0, 1, 1] },
        prompt: function (v) { return '<p>Con $' + v.S + '\\ \\text{cm}^2$ de cartón haces una caja rectangular ' + (v.open ? '<strong>sin tapa</strong>' : '<strong>cerrada</strong>') + '. ¿Cuál es el volumen máximo?</p>'; },
        check: 'numeric', unit: 'cm³',
        answer: function (v) { return v.open ? Math.pow(v.S / 3, 1.5) / 2 : Math.pow(v.S / 6, 1.5); },
        mistakes: {
          otherCase: function (v) { return v.open ? Math.pow(v.S / 6, 1.5) : Math.pow(v.S / 3, 1.5) / 2; }
        },
        feedback: [
          { when: 'otherCase', say: 'Revisa cuántas caras lleva la caja: cerrada, $2xy + 2xz + 2yz$; sin tapa, $xy + 2xz + 2yz$ (y entonces el óptimo no es un cubo).' }
        ],
        oracle: {
          lab: 'call', mod: 'lagrange', fn: 'newton3', math: true, field: 'f',
          args: function (v) {
            var s = Math.sqrt(v.S / (v.open ? 3 : 6)), z = v.open ? s / 2 : s;
            return ['x*y*z', v.open ? 'x*y + 2*x*z + 2*y*z' : '2*x*y + 2*x*z + 2*y*z', v.S, [0.9 * s, 1.1 * s, z, s / 4]];
          }
        },
        hint: 'Maximiza $V = xyz$ con el área como restricción. Igualando las ecuaciones de dos en dos sale $x = y$ y, ' + 'sin tapa, $z = \\tfrac{x}{2}$ (cerrada, $z = x$).',
        solution: function (v) {
          if (v.open) { var x = Math.sqrt(v.S / 3); return '$x = y$, $z = \\tfrac{x}{2}$. Área: $x^2 + 4x\\cdot\\tfrac{x}{2} = 3x^2 = ' + v.S + '$, así que $x = ' + fx(x, 3) + '$ cm y $$V = x^2\\cdot\\tfrac{x}{2} \\approx ' + fx(x * x * x / 2) + '\\ \\text{cm}^3$$'; }
          var c = Math.sqrt(v.S / 6);
          return 'Es un cubo: $6x^2 = ' + v.S + '$, $x = ' + fx(c, 3) + '$ cm y $$V = x^3 \\approx ' + fx(c * c * c) + '\\ \\text{cm}^3$$';
        }
      },
      {
        id: 'c2-s09-lambda', title: 'El precio sombra',
        vars: { p: [2, 10, 1], q: [2, 10, 1], B: [100, 600, 50] },
        baseWhere: function (v) { return v.p !== v.q; },
        prompt: function (v) { return '<p>Compras $x$ kilos de un producto a $' + v.p + '$ pesos el kilo y $y$ kilos de otro a $' + v.q + '$ pesos, con un presupuesto de $' + v.B + '$ pesos. Tu satisfacción es $U = xy$. En la mejor compra, ¿cuánto vale $\\lambda$ (la satisfacción extra por cada peso más)?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.B / (2 * v.p * v.q); },
        mistakes: {
          umax: function (v) { return v.B * v.B / (4 * v.p * v.q); },
          xval: function (v) { return v.B / (2 * v.p); },
          inv: function (v) { return 2 * v.p * v.q / v.B; }
        },
        feedback: [
          { when: 'umax', say: 'Ese es el máximo de $U$. Se pide $\\lambda$: de $y = \\lambda p$, $\\lambda = \\dfrac{y}{p}$.' },
          { when: 'xval', say: 'Esa es la cantidad $x$. Usa $U_y = \\lambda g_y$: $x = \\lambda q$.' },
          { when: 'inv', say: 'Lo invertiste: $\\lambda = \\dfrac{U_x}{g_x} = \\dfrac{y}{p}$.' }
        ],
        oracle: { lab: 'call', mod: 'lagrange', fn: 'optimum', math: true, field: 'lambdaMax', args: function (v) { return ['x*y', { kind: 'line', a: v.p, b: v.q, c: v.B }]; } },
        hint: 'Sistema: $y = \\lambda p$, $x = \\lambda q$, $px + qy = B$. Gastas la mitad del dinero en cada producto.',
        solution: function (v) {
          var x = v.B / (2 * v.p), y = v.B / (2 * v.q);
          return 'Sustituyendo, $2\\lambda pq = B$: $x = ' + fx(x) + '$, $y = ' + fx(y) + '$ y $$\\lambda = \\frac{B}{2pq} = \\frac{' + v.B + '}{' + 2 * v.p * v.q + '} \\approx ' + fx(v.B / (2 * v.p * v.q), 3) + '$$';
        }
      },
      {
        id: 'c2-s09-elipse', title: 'Máximo en una elipse',
        vars: { a: [1, 6, 1], b: [1, 6, 1] },
        baseWhere: function (v) { return v.a !== v.b; },
        prompt: function (v) { return '<p>¿Cuál es el valor máximo de $f(x, y) = xy$ sobre la elipse $\\dfrac{x^2}{' + v.a * v.a + '} + \\dfrac{y^2}{' + v.b * v.b + '} = 1$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.a * v.b / 2; },
        mistakes: {
          ab: function (v) { return v.a * v.b; },
          min: function (v) { return -v.a * v.b / 2; }
        },
        feedback: [
          { when: 'ab', say: 'En el óptimo $x = \\tfrac{a}{\\sqrt 2}$ y $y = \\tfrac{b}{\\sqrt 2}$, no $x = a$, $y = b$ (ese punto ni está en la elipse).' },
          { when: 'min', say: 'Ese es el mínimo (cuadrantes II y IV). Se pide el máximo.' }
        ],
        oracle: { lab: 'call', mod: 'lagrange', fn: 'optimum', math: true, field: 'max', args: function (v) { return ['x*y', { kind: 'ellipse', a: v.a, b: v.b, c: 1 }]; } },
        hint: 'Sistema: $y = \\lambda\\tfrac{2x}{a^2}$ y $x = \\lambda\\tfrac{2y}{b^2}$. Multiplica la primera por $x$ y la segunda por $y$: sale $\\tfrac{x^2}{a^2} = \\tfrac{y^2}{b^2} = \\tfrac{1}{2}$.',
        solution: function (v) { return '$\\tfrac{x^2}{' + v.a * v.a + '} = \\tfrac{y^2}{' + v.b * v.b + '} = \\tfrac{1}{2}$, así que $x = \\tfrac{' + v.a + '}{\\sqrt 2}$, $y = \\tfrac{' + v.b + '}{\\sqrt 2}$ y $$f_{\\max} = \\frac{' + v.a + '\\cdot ' + v.b + '}{2} = ' + fx(v.a * v.b / 2) + '$$ El origen, punto crítico libre de $xy$ (una silla), no está en la elipse.'; }
      },
      {
        id: 'c2-s09-paralelos', title: 'Concepto: los gradientes en el óptimo',
        vars: {},
        prompt: function () { return '<p>En el máximo de $f$ sobre la curva $g(x, y) = c$ (con $\\nabla g \\neq \\vec 0$), ¿cómo son $\\nabla f$ y $\\nabla g$?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Paralelos: $\\nabla f = \\lambda\\nabla g$', correct: true },
            { text: 'Perpendiculares', say: 'Perpendicular a $\\nabla g$ es la tangente de la curva. Si $\\nabla f$ fuera tangente, podrías subir moviéndote por la curva.' },
            { text: '$\\nabla f = \\vec 0$', say: 'Eso es un punto crítico libre; en general no está sobre la restricción.' },
            { text: 'No tienen relación', say: 'Sí la tienen: la curva y la curva de nivel son tangentes, así que sus normales son paralelas.' }
          ];
        },
        answer: function () { return 'Paralelos: $\\nabla f = \\lambda\\nabla g$'; },
        hint: 'Mira el explainer: ¿qué pasa con la curva de nivel en el punto más alto del camino?',
        solution: function () { return 'La restricción toca de lado a la curva de nivel de $f$. Los dos gradientes son perpendiculares a esa misma tangente, así que son paralelos: $\\nabla f = \\lambda\\nabla g$.'; }
      }
    ],

    quiz: { tags: ['c2.S09'], count: 8 },

    errors: [
      'Dividir entre $x$ (o $y$) al despejar $\\lambda$ y perder el candidato con $x = 0$.',
      'Dar el punto crítico libre ($\\nabla f = \\vec 0$) aunque no cumpla la restricción.',
      'Quedarse con el primer candidato sin evaluar $f$ en todos: a veces es el mínimo y no el máximo.',
      'Reportar $\\lambda$ en lugar del valor de $f$.',
      'Olvidar los extremos del tramo cuando la restricción no es una curva cerrada.',
      'En el criterio $D$, sumar $f_{xy}^2$ o no elevarla al cuadrado.'
    ],

    teacher: {
      plan: [
        'Repaso rápido de puntos críticos con la figura de los tres casos; un ejemplo de silla.',
        'El cerro y el sendero: que digan dónde está el punto más alto antes de dar fórmulas.',
        'Explainer de la recta y las hipérbolas; luego el sistema y el ejemplo del caso $x = 0$ en el pizarrón.',
        'Lab: que busquen el punto donde el ángulo llega a 0° y comparen con los candidatos; cierre con $\\lambda$ moviendo $c$.'
      ],
      check: [
        'Que factoricen en vez de dividir y listen todos los candidatos.',
        'Que distingan el valor de $f$ del valor de $\\lambda$.'
      ],
      note: 'Dos o más restricciones ($\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$) se dejan para S10.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §4.7 “Maxima/Minima Problems”. <a href="https://openstax.org/books/calculus-volume-3/pages/4-7-maxima-minima-problems">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 3</em>, §4.8 “Lagrange Multipliers”. <a href="https://openstax.org/books/calculus-volume-3/pages/4-8-lagrange-multipliers">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 1</em>, §4.7 “Applied Optimization Problems”. <a href="https://openstax.org/books/calculus-volume-1/pages/4-7-applied-optimization-problems">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-08',
    next: 'sesion-10'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check !== 'numeric' || !ex.mistakes) return;
    ex.where = REL(ex);
  });
})();
