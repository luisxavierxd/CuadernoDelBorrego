/* =====================================================================
   Cálculo 3 · S10 · Homogéneas de segundo orden con coeficientes constantes:
   los tres casos de raíces (bloque B · Primer orden II y orden n).
   Fuente: OpenStax, Calculus Volume 3, §7.1 “Second-Order Linear Equations”,
   CC BY-NC-SA 4.0. Ejemplos y ejercicios propios. Se comprueban con LabMath.ode
   (lab ode-compare): residuo y condiciones iniciales; los numéricos usan RK4.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function co(c, s) { return (c === 1 ? '' : c === -1 ? '-' : c) + s; }
  function sg(n, s) { return n === 0 ? '' : (n < 0 ? ' - ' : ' + ') + (Math.abs(n) === 1 && s ? '' : Math.abs(n)) + (s || ''); }

  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 0.5)) return false;
      }
      return true;
    };
  }
  function rk(P, x) { return window.LabMath.ode.solveAt(window.math, P, x); }

  var P_SLIDE = {
    name: 'Mueve a y b: y″ + ay′ + by = 0', tex: "y'' + a\\,y' + b\\,y = 0,\\qquad y(0) = 1,\\ y'(0) = 0", iv: 'x', dv: 'y', order: 2,
    rhs: '-a*dy - b*y', scene: 'roots', roots: ['a', 'b'],
    params: { a: { value: 3, min: -1, max: 4, step: 0.1, label: 'Coeficiente a' }, b: { value: 2, min: 0, max: 10, step: 0.1, label: 'Coeficiente b' } },
    x0: 0, ics: [1, 0], domain: [0, 8], yRange: [-1.2, 1.4],
    solution: '2e^(-x) - e^(-2x)', solutionTex: '2e^{-x} - e^{-2x}\\ \\ (\\text{con } a = 3,\\ b = 2)',
    hint: 'Con los valores de inicio, $r^2 + 3r + 2 = (r + 1)(r + 2)$. Si mueves los deslizadores, cambian las raíces y la forma de la solución: escribe la que corresponda a los valores actuales.',
    wrong: [
      { src: 'e^(-x) + e^(-2x)', tex: 'e^{-x}+e^{-2x}', key: 'ic' },
      { src: '2e^x - e^(2x)', tex: '2e^{x}-e^{2x}', key: 'residual' },
      { src: '2e^(-x) + e^(-2x)', tex: '2e^{-x}+e^{-2x}', key: 'ic' }
    ]
  };
  var P_REAL = {
    name: "Reales distintas: y″ − y′ − 6y = 0", tex: "y'' - y' - 6y = 0,\\qquad y(0) = 1,\\ y'(0) = 8", iv: 'x', dv: 'y', order: 2,
    rhs: '-a*dy - b*y', params: { a: -1, b: -6 }, scene: 'roots', x0: 0, ics: [1, 8], domain: [-1, 1],
    solution: '2e^(3x) - e^(-2x)', solutionTex: '2e^{3x} - e^{-2x}',
    hint: '$r^2 - r - 6 = (r - 3)(r + 2)$. Luego resuelve $c_1 + c_2 = 1$, $3c_1 - 2c_2 = 8$.',
    wrong: [
      { src: 'e^(3x) + 0*e^(-2x)', tex: 'e^{3x}', key: 'ic' },
      { src: '2e^(-3x) - e^(2x)', tex: '2e^{-3x}-e^{2x}', key: 'residual' },
      { src: '-e^(3x) + 2e^(-2x)', tex: '-e^{3x}+2e^{-2x}', key: 'ic' }
    ]
  };
  var P_DOUBLE = {
    name: "Raíz doble: y″ + 4y′ + 4y = 0", tex: "y'' + 4y' + 4y = 0,\\qquad y(0) = 2,\\ y'(0) = -1", iv: 'x', dv: 'y', order: 2,
    rhs: '-a*dy - b*y', params: { a: 4, b: 4 }, scene: 'roots', x0: 0, ics: [2, -1], domain: [0, 4],
    solution: '(2 + 3x)e^(-2x)', solutionTex: '(2 + 3x)\\,e^{-2x}',
    hint: '$r = -2$ doble: la segunda solución es $x\\,e^{-2x}$ (lo viste con reducción de orden en S09).',
    wrong: [
      { src: '2e^(-2x) + 3e^(-2x)', tex: '2e^{-2x}+3e^{-2x}', key: 'ic' },
      { src: '(2 + 3x)e^(2x)', tex: '\\left(2+3x\\right)e^{2x}', key: 'residual' },
      { src: '(2 - x)e^(-2x)', tex: '\\left(2-x\\right)e^{-2x}', key: 'ic' }
    ]
  };
  var P_COMPLEX = {
    name: "Complejas: y″ + 2y′ + 5y = 0", tex: "y'' + 2y' + 5y = 0,\\qquad y(0) = 1,\\ y'(0) = 1", iv: 'x', dv: 'y', order: 2,
    rhs: '-a*dy - b*y', params: { a: 2, b: 5 }, scene: 'roots', x0: 0, ics: [1, 1], domain: [0, 5],
    solution: 'e^(-x)(cos(2x) + sin(2x))', solutionTex: 'e^{-x}(\\cos 2x + \\sin 2x)',
    hint: '$r = -1 \\pm 2i$: $\\alpha = -1$, $\\beta = 2$. Para $c_2$ deriva con la regla del producto.',
    wrong: [
      { src: 'e^x*(cos(2x) + sin(2x))', tex: 'e^{x}\\left(\\cos\\left(2x\\right)+\\sin\\left(2x\\right)\\right)', key: 'residual' },
      { src: 'e^(-x)(cos(2x) + 0.5sin(2x))', tex: 'e^{-x}\\left(\\cos\\left(2x\\right)+0.5\\sin\\left(2x\\right)\\right)', key: 'ic' },
      { src: 'e^(-2x)(cos(x) + sin(x))', tex: 'e^{-2x}\\left(\\cos\\left(x\\right)+\\sin\\left(x\\right)\\right)', key: 'residual' }
    ]
  };
  var P_PURE = {
    name: "Imaginarias puras: y″ + 9y = 0", tex: "y'' + 9y = 0,\\qquad y(0) = 2,\\ y'(0) = 3", iv: 'x', dv: 'y', order: 2,
    rhs: '-a*dy - b*y', params: { a: 0, b: 9 }, scene: 'roots', x0: 0, ics: [2, 3], domain: [0, 6],
    solution: '2cos(3x) + sin(3x)', solutionTex: '2\\cos 3x + \\sin 3x',
    hint: '$r = \\pm 3i$: $\\alpha = 0$, así que no hay exponencial. Ojo con la cadena al derivar $\\sin 3x$.',
    wrong: [
      { src: '2cos(3x) + 3sin(3x)', tex: '2\\cos\\left(3x\\right)+3\\sin\\left(3x\\right)', key: 'ic' },
      { src: '2cos(9x) + sin(9x)', tex: '2\\cos\\left(9x\\right)+\\sin\\left(9x\\right)', key: 'residual' },
      { src: '2e^(3x) + e^(-3x)', tex: '2e^{3x}+e^{-3x}', key: 'residual' }
    ]
  };

  var data = window.SESSION_DATA = {
    slug: 'sesion-10', number: '10', group: 'B · Primer orden II y orden n',
    title: 'Homogéneas de segundo orden con coeficientes constantes: los tres casos de raíces', temario: [],
    minutes: 150,
    quote: 'Una ecuación diferencial de segundo orden con coeficientes constantes es, en el fondo, una ecuación de segundo grado: sus raíces dicen cómo se mueve la solución.',
    badges: [
      'Pasar de $ay\'\' + by\' + cy = 0$ a la ecuación característica $ar^2 + br + c = 0$.',
      'Escribir la solución general en los tres casos: reales distintas, raíz doble y complejas.',
      'Resolver el PVI con $y(0)$ y $y\'(0)$.',
      'Leer en el plano complejo si la solución crece, decae u oscila.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Prueba con $y = e^{rx}$: la ecuación diferencial se vuelve una ecuación de segundo grado en $r$. Sus dos raíces dan las dos soluciones del conjunto fundamental.',
        recall: [
          'El <a href="../sesion-09/">conjunto fundamental y el Wronskiano</a> (S09 de este curso).',
          'La fórmula general $r = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ y los números complejos $\\alpha \\pm \\beta i$.',
          'Derivar $e^{rx}$, $\\cos\\beta x$ y $\\sin\\beta x$ (regla de la cadena).'
        ],
        why: 'Es la ecuación del resorte, del péndulo con ángulos chicos y del circuito RLC. Los tres casos son los tres comportamientos que verás en la sesión 15: sobreamortiguado, crítico y subamortiguado.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Una puerta con cierre hidráulico: si el amortiguador es muy fuerte, la puerta se cierra lento y sin rebotar; si es muy débil, se azota y rebota unas veces antes de quedarse quieta. Hay un punto justo en medio donde se cierra lo más rápido posible sin rebotar.',
          'Esos tres comportamientos son los tres casos de esta sesión: dos raíces reales (lento, sin rebote), una raíz doble (justo en medio) y raíces complejas (rebota). La parte real dice qué tan rápido se apaga; la imaginaria, qué tan rápido oscila.'
        ]
      },
      {
        type: 'concept', heading: 'La ecuación característica', short: 'Ecuación característica',
        body: [
          'Para $ay\'\' + by\' + cy = 0$ con $a, b, c$ constantes, prueba $y = e^{rx}$: $y\' = re^{rx}$, $y\'\' = r^2e^{rx}$. Sustituyendo y dividiendo entre $e^{rx}$ (que nunca es cero): $$ar^2 + br + c = 0$$ Es la <strong>ecuación característica</strong>. Cada raíz $r$ da una solución $e^{rx}$. Según el discriminante $b^2 - 4ac$ hay tres casos.'
        ]
      },
      {
        type: 'explainer', heading: 'Raíces y forma de la solución', short: 'Los tres casos',
        title: 'Del plano complejo a la gráfica',
        intro: 'A la izquierda, las raíces; a la derecha, una solución típica.',
        diagram: 'c3s10-cases',
        steps: [
          { text: '<strong>Reales distintas</strong> ($b^2 - 4ac > 0$): $y = c_1e^{r_1x} + c_2e^{r_2x}$. Si las dos son negativas, la solución se apaga sin oscilar.', state: { c: 0 } },
          { text: '<strong>Raíz doble</strong> ($b^2 - 4ac = 0$): solo hay una exponencial; la segunda solución es $x\\,e^{rx}$. $y = (c_1 + c_2x)e^{rx}$.', state: { c: 1 } },
          { text: '<strong>Complejas</strong> $r = \\alpha \\pm \\beta i$ ($b^2 - 4ac < 0$): $y = e^{\\alpha x}(c_1\\cos\\beta x + c_2\\sin\\beta x)$. Oscila con frecuencia $\\beta$ y la amplitud crece o decae según el signo de $\\alpha$.', state: { c: 2 } }
        ]
      },
      {
        type: 'recipe', heading: 'Receta: coeficientes constantes', short: 'Receta',
        steps: [
          { text: 'Escribe la característica cambiando $y\'\' \\to r^2$, $y\' \\to r$, $y \\to 1$.', tip: 'El término con $y$ da la constante, no $r$: en $y\'\' + 9y = 0$ es $r^2 + 9 = 0$.' },
          { text: 'Resuelve con la fórmula general (o factorizando).' },
          { text: 'Elige la forma según el caso: $c_1e^{r_1x} + c_2e^{r_2x}$, $(c_1 + c_2x)e^{rx}$ o $e^{\\alpha x}(c_1\\cos\\beta x + c_2\\sin\\beta x)$.', tip: 'En el caso complejo usa $\\alpha$ en la exponencial y $\\beta$ (positiva) dentro del seno y el coseno.' },
          { text: 'Deriva la forma general y aplica $y(x_0)$ y $y\'(x_0)$ para encontrar $c_1$ y $c_2$.' },
          { text: 'Comprueba: sustituye o revisa que se cumplan las condiciones.' }
        ]
      },
      {
        type: 'example', heading: 'Raíces reales distintas',
        problem: '<p>Resuelve $y\'\' - y\' - 6y = 0$ con $y(0) = 1$, $y\'(0) = 8$.</p>',
        steps: [
          { text: 'Característica: $r^2 - r - 6 = (r - 3)(r + 2) = 0$, así que $r = 3$ y $r = -2$.', math: "y = c_1e^{3x} + c_2e^{-2x}, \\qquad y' = 3c_1e^{3x} - 2c_2e^{-2x}" },
          { text: 'Condiciones en 0.', math: 'c_1 + c_2 = 1, \\qquad 3c_1 - 2c_2 = 8 \\;\\Rightarrow\\; c_1 = 2,\\ c_2 = -1' }
        ],
        answer: '$y = 2e^{3x} - e^{-2x}$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_REAL, '2e^(3x) - e^(-2x)'], value: 1 }
      },
      {
        type: 'example', heading: 'Raíz doble',
        problem: '<p>Resuelve $y\'\' + 4y\' + 4y = 0$ con $y(0) = 2$, $y\'(0) = -1$.</p>',
        steps: [
          { text: '$r^2 + 4r + 4 = (r + 2)^2$: raíz doble $r = -2$.', math: "y = (c_1 + c_2x)e^{-2x}, \\qquad y' = c_2e^{-2x} - 2(c_1 + c_2x)e^{-2x}" },
          { text: 'En 0: $c_1 = 2$ y $c_2 - 2c_1 = -1$, así que $c_2 = 3$.', math: 'y = (2 + 3x)e^{-2x}' }
        ],
        answer: '$y = (2 + 3x)e^{-2x}$. Si escribes $2e^{-2x} + 3e^{-2x}$ (sin la $x$), solo tienes una solución repetida: el lab te dice que no cumple $y(0) = 2$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_DOUBLE, '(2 + 3x)e^(-2x)'], value: 1 }
      },
      {
        type: 'concept', heading: 'Por qué aparecen seno y coseno', short: 'Fórmula de Euler',
        body: [
          'Con $r = \\alpha \\pm \\beta i$, las soluciones complejas son $e^{(\\alpha \\pm \\beta i)x} = e^{\\alpha x}e^{\\pm\\beta ix}$. La <strong>fórmula de Euler</strong> dice $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$.',
          'Sumando y restando las dos soluciones (superposición, S09) y dividiendo entre 2 o $2i$ salen dos soluciones <strong>reales</strong>: $e^{\\alpha x}\\cos\\beta x$ y $e^{\\alpha x}\\sin\\beta x$. Su Wronskiano es $\\beta e^{2\\alpha x} \\neq 0$, así que forman un conjunto fundamental.'
        ]
      },
      {
        type: 'example', heading: 'Raíces complejas',
        problem: '<p>Resuelve $y\'\' + 2y\' + 5y = 0$ con $y(0) = 1$, $y\'(0) = 1$, y calcula $y(1)$.</p>',
        steps: [
          { text: '$r = \\frac{-2 \\pm \\sqrt{4 - 20}}{2} = -1 \\pm 2i$: $\\alpha = -1$, $\\beta = 2$.', math: 'y = e^{-x}(c_1\\cos 2x + c_2\\sin 2x)' },
          { text: '$y(0) = c_1 = 1$. Derivando con la regla del producto, $y\'(0) = -c_1 + 2c_2 = 1$, así que $c_2 = 1$.', math: 'y = e^{-x}(\\cos 2x + \\sin 2x)' },
          { text: 'Evalúa.', math: 'y(1) = e^{-1}(\\cos 2 + \\sin 2) \\approx ' + fx(Math.exp(-1) * (Math.cos(2) + Math.sin(2)), 3) }
        ],
        answer: '$y(1) \\approx ' + fx(Math.exp(-1) * (Math.cos(2) + Math.sin(2)), 3) + '$. La solución oscila con periodo $2\\pi/\\beta = \\pi$ y se apaga como $e^{-x}$.',
        verify: { lab: 'call', mod: 'ode', fn: 'solveAt', math: true, args: [P_COMPLEX, 1], value: Math.exp(-1) * (Math.cos(2) + Math.sin(2)) }
      },
      {
        type: 'callout', heading: 'El plano complejo lo dice todo',
        body: [
          'Raíces a la izquierda del eje imaginario ($\\text{Re}\\,r < 0$): la solución se apaga. A la derecha: crece. Sobre el eje real: no oscila. Fuera del eje real: oscila, más rápido entre más lejos estén. En el lab mueve $a$ y $b$ y mira cómo viajan las raíces y cambia la forma de la solución.'
        ]
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué en la raíz doble se multiplica por $x$?', a: 'Porque $e^{rx}$ y $e^{rx}$ son la misma solución: te falta una independiente. La reducción de orden (S09) da justo $x\\,e^{rx}$.' },
          { q: '¿Uso $\\beta$ o $-\\beta$?', a: 'Da igual: $\\cos(-\\beta x) = \\cos\\beta x$ y $\\sin(-\\beta x) = -\\sin\\beta x$, y el signo lo absorbe $c_2$. Se acostumbra $\\beta > 0$.' },
          { q: '¿Qué pasa si $\\alpha = 0$?', a: 'No hay exponencial: $y = c_1\\cos\\beta x + c_2\\sin\\beta x$ oscila para siempre con la misma amplitud (un resorte sin fricción).' },
          { q: '¿Y si la ecuación no tiene coeficientes constantes?', a: 'Entonces $e^{rx}$ ya no funciona en general. Para Euler ($x^2y\'\' + \\dots$) se prueba $x^m$; para otras, reducción de orden o series (fuera del curso).' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Característica: $ar^2 + br + c = 0$, al probar $y = e^{rx}$.',
          'Reales distintas: $c_1e^{r_1x} + c_2e^{r_2x}$. Doble: $(c_1 + c_2x)e^{rx}$.',
          'Complejas $\\alpha \\pm \\beta i$: $e^{\\alpha x}(c_1\\cos\\beta x + c_2\\sin\\beta x)$.',
          'El signo de la parte real decide si crece o decae; la parte imaginaria, si oscila.'
        ]
      }
    ],

    lab: {
      type: 'ode-compare', title: 'Raíces en el plano complejo',
      intro: 'En el primer problema mueve $a$ y $b$: las raíces de $r^2 + ar + b = 0$ se mueven en el plano complejo y la solución numérica cambia de forma. Escribe la $y(x)$ que corresponde. En los demás, cada caso de raíces con su PVI. El lab detecta la constante mal despejada y la raíz con el signo equivocado.',
      cfg: { start: 0, problems: [P_SLIDE, P_REAL, P_DOUBLE, P_COMPLEX, P_PURE] }
    },

    formulas: [
      { label: 'Característica', tex: 'ay\'\' + by\' + cy = 0 \\;\\to\\; ar^2 + br + c = 0' },
      { label: 'Reales distintas', tex: 'y = c_1e^{r_1x} + c_2e^{r_2x}' },
      { label: 'Raíz doble', tex: 'y = (c_1 + c_2x)e^{rx}' },
      { label: 'Complejas α ± βi', tex: 'y = e^{\\alpha x}(c_1\\cos\\beta x + c_2\\sin\\beta x)' }
    ],

    exercises: [
      {
        id: 'c3-s10-caso', title: '¿Qué caso es?',
        vars: { a: [0, 6, 1], b: [1, 10, 1] },
        prompt: function (v) { return '<p>¿Qué forma tiene la solución general de $y\'\'' + (v.a ? ' + ' + (v.a === 1 ? '' : v.a) + "y'" : '') + ' + ' + (v.b === 1 ? '' : v.b) + 'y = 0$?</p>'; },
        check: 'choice',
        options: function (v) {
          var d = v.a * v.a - 4 * v.b, right = d > 0 ? 0 : d === 0 ? 1 : 2;
          var txt = ['$c_1e^{r_1x} + c_2e^{r_2x}$ (reales distintas)', '$(c_1 + c_2x)e^{rx}$ (raíz doble)', '$e^{\\alpha x}(c_1\\cos\\beta x + c_2\\sin\\beta x)$ (complejas)'];
          return txt.map(function (t, i) { return i === right ? { text: t, correct: true } : { text: t, say: 'Calcula el discriminante $a^2 - 4b = ' + d + '$: ' + (d > 0 ? 'es positivo.' : d === 0 ? 'es cero.' : 'es negativo.') }; });
        },
        answer: function (v) { var d = v.a * v.a - 4 * v.b; return ['$c_1e^{r_1x} + c_2e^{r_2x}$ (reales distintas)', '$(c_1 + c_2x)e^{rx}$ (raíz doble)', '$e^{\\alpha x}(c_1\\cos\\beta x + c_2\\sin\\beta x)$ (complejas)'][d > 0 ? 0 : d === 0 ? 1 : 2]; },
        hint: 'El discriminante de $r^2 + ar + b$ es $a^2 - 4b$.',
        solution: function (v) { var d = v.a * v.a - 4 * v.b; return 'Discriminante $' + v.a + '^2 - 4(' + v.b + ') = ' + d + '$: ' + (d > 0 ? 'dos raíces reales distintas.' : d === 0 ? 'raíz doble.' : 'raíces complejas.'); }
      },
      {
        id: 'c3-s10-reales', title: 'PVI con raíces reales',
        vars: { r1: [1, 3, 1], r2: [-3, -1, 1], A: [-2, 3, 1], B: [-4, 5, 1] },
        where: function (v) { var c1 = (v.B - v.r2 * v.A) / (v.r1 - v.r2); return Number.isInteger(c1) && c1 !== 0 && v.A - c1 !== 0 && v.A - c1 !== c1 && v.r1 !== -v.r2; },
        prompt: function (v) { var s = v.r1 + v.r2, p = v.r1 * v.r2; return '<p>Resuelve $y\'\'' + sg(-s, "y'") + sg(p, 'y') + ' = 0$ con $y(0) = ' + v.A + '$ y $y\'(0) = ' + v.B + '$.</p>'; },
        check: 'expr', domain: [-1, 1],
        answer: function (v) { var c1 = (v.B - v.r2 * v.A) / (v.r1 - v.r2), c2 = v.A - c1; return c1 + '*e^(' + v.r1 + '*x) + ' + c2 + '*e^(' + v.r2 + '*x)'; },
        mistakes: {
          swapped: function (v) { var c1 = (v.B - v.r2 * v.A) / (v.r1 - v.r2), c2 = v.A - c1; return c2 + '*e^(' + v.r1 + '*x) + ' + c1 + '*e^(' + v.r2 + '*x)'; },
          signRoots: function (v) { var c1 = (v.B - v.r2 * v.A) / (v.r1 - v.r2), c2 = v.A - c1; return c1 + '*e^(' + (-v.r1) + '*x) + ' + c2 + '*e^(' + (-v.r2) + '*x)'; }
        },
        feedback: [
          { when: 'swapped', say: 'Intercambiaste $c_1$ y $c_2$: cada una va con su exponencial.' },
          { when: 'signRoots', say: 'Si $r^2 - sr + p = (r - r_1)(r - r_2)$, las raíces son $r_1$ y $r_2$, no sus negativos.' }
        ],
        hint: 'Factoriza la característica, escribe $c_1e^{r_1x} + c_2e^{r_2x}$ y resuelve el sistema con $y(0)$ y $y\'(0)$.',
        solution: function (v) { var c1 = (v.B - v.r2 * v.A) / (v.r1 - v.r2), c2 = v.A - c1; return '$$r = ' + v.r1 + ',\\ ' + v.r2 + '; \\quad c_1 + c_2 = ' + v.A + ',\\ ' + v.r1 + 'c_1 ' + (v.r2 < 0 ? '- ' + (-v.r2) : '+ ' + v.r2) + 'c_2 = ' + v.B + ' \\Rightarrow c_1 = ' + c1 + ',\\ c_2 = ' + c2 + '$$'; }
      },
      {
        id: 'c3-s10-doble', title: 'Raíz doble: un valor',
        vars: { r: [-3, -1, 1], A: [1, 4, 1], B: [-4, 4, 1] },
        prompt: function (v) { return '<p>Resuelve $y\'\'' + sg(-2 * v.r, "y'") + sg(v.r * v.r, 'y') + ' = 0$ con $y(0) = ' + v.A + '$ y $y\'(0) = ' + v.B + '$, y calcula $y(1)$.</p>'; },
        check: 'numeric',
        answer: function (v) { var c2 = v.B - v.r * v.A; return (v.A + c2) * Math.exp(v.r); },
        mistakes: {
          noX: function (v) { return v.A * Math.exp(v.r); },
          c2isB: function (v) { return (v.A + v.B) * Math.exp(v.r); }
        },
        where: function (v) { return v.B - v.r * v.A !== 0 && v.r * v.A !== 0; },
        feedback: [
          { when: 'noX', say: 'Falta la segunda solución $x\\,e^{rx}$: con raíz doble, $y = (c_1 + c_2x)e^{rx}$.' },
          { when: 'c2isB', say: '$y\'(0) = c_2 + rc_1$, así que $c_2 = y\'(0) - rc_1$, no $y\'(0)$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return rk({ order: 2, rhs: (2 * v.r) + '*dy - ' + (v.r * v.r) + '*y', x0: 0, ics: [v.A, v.B], domain: [0, 1] }, 1); } },
        hint: 'Raíz doble $r$: $y = (c_1 + c_2x)e^{rx}$ y $y\'(0) = c_2 + rc_1$.',
        solution: function (v) { var c2 = v.B - v.r * v.A; return '$$c_1 = ' + v.A + ',\\quad c_2 = ' + v.B + ' - (' + v.r + ')(' + v.A + ') = ' + c2 + ' \\;\\Rightarrow\\; y(1) = (' + v.A + ' + ' + c2 + ')e^{' + v.r + '} \\approx ' + fx((v.A + c2) * Math.exp(v.r)) + '$$'; }
      },
      {
        id: 'c3-s10-compleja', title: 'PVI con raíces complejas',
        vars: { al: [1, 2, 1], be: [1, 3, 1] },
        where: function (v) { return v.al !== v.be; },
        prompt: function (v) { return '<p>Resuelve $y\'\' + ' + (2 * v.al) + "y' + " + (v.al * v.al + v.be * v.be) + 'y = 0$ con $y(0) = 1$ y $y\'(0) = 0$.</p>'; },
        check: 'expr', domain: [0, 3],
        answer: function (v) { return 'e^(-' + v.al + '*x)*(cos(' + v.be + '*x) + ' + (v.al / v.be) + '*sin(' + v.be + '*x))'; },
        mistakes: {
          noSin: function (v) { return 'e^(-' + v.al + '*x)*cos(' + v.be + '*x)'; },
          signAlpha: function (v) { return 'e^(' + v.al + '*x)*(cos(' + v.be + '*x) - ' + (v.al / v.be) + '*sin(' + v.be + '*x))'; },
          swap: function (v) { return 'e^(-' + v.be + '*x)*(cos(' + v.al + '*x) + ' + (v.be / v.al) + '*sin(' + v.al + '*x))'; }
        },
        feedback: [
          { when: 'noSin', say: 'Con $y\'(0) = 0$ igual hay término en seno: $y\'(0) = \\alpha c_1 + \\beta c_2 = 0$ da $c_2 = -\\alpha c_1/\\beta$.' },
          { when: 'signAlpha', say: 'Las raíces son $-' + 'a \\pm bi$: la exponencial lleva el signo negativo.' },
          { when: 'swap', say: 'Intercambiaste $\\alpha$ y $\\beta$: la parte real va en la exponencial y la imaginaria dentro del seno y coseno.' }
        ],
        hint: '$r = -\\alpha \\pm \\beta i$. Deriva $e^{-\\alpha x}(c_1\\cos\\beta x + c_2\\sin\\beta x)$ con la regla del producto.',
        solution: function (v) { return '$$r = -' + v.al + ' \\pm ' + v.be + 'i, \\quad c_1 = 1,\\ -' + v.al + 'c_1 + ' + v.be + 'c_2 = 0 \\Rightarrow c_2 = \\tfrac{' + v.al + '}{' + v.be + '}$$ $$y = e^{-' + v.al + 'x}\\left(\\cos ' + v.be + 'x + \\tfrac{' + v.al + '}{' + v.be + '}\\sin ' + v.be + 'x\\right)$$'; }
      },
      {
        id: 'c3-s10-periodo', title: 'Periodo de oscilación',
        vars: { a: [1, 4, 1], b: [5, 30, 1] },
        where: function (v) { return v.a * v.a < 4 * v.b; },
        prompt: function (v) { return '<p>Las soluciones de $y\'\' + ' + (v.a === 1 ? '' : v.a) + "y' + " + v.b + 'y = 0$ oscilan. ¿Cuál es el periodo de la oscilación (el tiempo entre dos máximos)?</p>'; },
        check: 'numeric',
        answer: function (v) { return 2 * Math.PI / (Math.sqrt(4 * v.b - v.a * v.a) / 2); },
        mistakes: {
          noDamp: function (v) { return 2 * Math.PI / Math.sqrt(v.b); },
          freq: function (v) { return Math.sqrt(4 * v.b - v.a * v.a) / 2; }
        },
        feedback: [
          { when: 'noDamp', say: 'Ese sería sin amortiguamiento. Con $y\'$, la frecuencia es $\\beta = \\frac{\\sqrt{4b - a^2}}{2}$.' },
          { when: 'freq', say: 'Esa es la frecuencia $\\beta$. El periodo es $2\\pi/\\beta$.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          // Dos cruces sucesivos de y = e^(αx)sin βx por cero en la misma dirección, con bisección sobre RK4.
          var P = { order: 2, rhs: '-' + v.a + '*dy - ' + v.b + '*y', x0: 0, ics: [0, 1], domain: [0, 10] };
          var be = Math.sqrt(4 * v.b - v.a * v.a) / 2, lo = 1.5 * Math.PI / be, hi = 2.5 * Math.PI / be;
          for (var i = 0; i < 50; i++) { var m = (lo + hi) / 2; if (rk(P, m) < 0) lo = m; else hi = m; }
          return (lo + hi) / 2;
        } },
        hint: 'Raíces $\\alpha \\pm \\beta i$ con $\\beta = \\frac{\\sqrt{4b - a^2}}{2}$; periodo $2\\pi/\\beta$.',
        solution: function (v) { var be = Math.sqrt(4 * v.b - v.a * v.a) / 2; return '$$\\beta = \\frac{\\sqrt{' + (4 * v.b - v.a * v.a) + '}}{2} \\approx ' + fx(be, 3) + ', \\qquad T = \\frac{2\\pi}{\\beta} \\approx ' + fx(2 * Math.PI / be) + '$$'; }
      }
    ],

    quiz: { tags: ['c3.S10'], count: 8 },

    errors: [
      'Escribir la característica con $r$ en el término de $y$ (en $y\'\' + 9y = 0$ es $r^2 + 9 = 0$).',
      'En raíz doble, dar $c_1e^{rx} + c_2e^{rx}$ sin la $x$.',
      'Intercambiar $\\alpha$ y $\\beta$ en el caso complejo.',
      'Olvidar el signo de la parte real ($r = -1 \\pm 2i$ da $e^{-x}$).',
      'Olvidar la regla del producto al derivar para aplicar $y\'(0)$.',
      'Confundir la frecuencia $\\beta$ con el periodo $2\\pi/\\beta$.'
    ],

    teacher: {
      plan: [
        'La puerta con cierre hidráulico como motivación de los tres casos.',
        'Deducir la característica en el pizarrón con $y = e^{rx}$.',
        'Un ejemplo por caso; fórmula de Euler para el complejo.',
        'Lab con los deslizadores: llevar las raíces de reales a dobles a complejas.'
      ],
      check: [
        'Que identifiquen el caso con el discriminante antes de resolver.',
        'Que relacionen la posición de las raíces con el comportamiento.'
      ],
      note: 'El orden $n$ va en S11. Las aplicaciones (resorte y RLC) se retoman en S15 con estos mismos casos.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §7.1 “Second-Order Linear Equations”. <a href="https://openstax.org/books/calculus-volume-3/pages/7-1-second-order-linear-equations">openstax.org</a> (CC BY-NC-SA 4.0).',
      'MIT OpenCourseWare. <em>18.03SC Differential Equations</em> (Fall 2011), Unit II, “Characteristic Equation, Real and Distinct Roots”, “Complex Roots” y “Repeated Roots”. <a href="https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/">ocw.mit.edu</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-09',
    next: 'sesion-11'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
