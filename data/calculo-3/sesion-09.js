/* =====================================================================
   Cálculo 3 · S09 · Teoría lineal de orden n: superposición, Wronskiano,
   conjunto fundamental y reducción de orden (bloque B · Primer orden II y orden n).
   Fuente: OpenStax, Calculus Volume 3, §7.1 “Second-Order Linear Equations”,
   CC BY-NC-SA 4.0; teoría como en Boyce, DiPrima y Meade, §3.2 y §3.4 (solo lectura).
   Ejemplos y ejercicios propios. Se comprueban con LabMath.ode (lab ode-compare, modo
   Wronskiano): las dos funciones se sustituyen en la ecuación y W se calcula con
   derivadas simbólicas; los numéricos usan RK4 como oráculo.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }

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

  var P_EXP = {
    name: "y″ + y′ − 6y = 0", tex: "y'' + y' - 6y = 0", kind: 'pair', order: 2, rhs: '-dy + 6y', domain: [-1, 1],
    solution: ['e^(2x)', 'e^(-3x)'], solutionTex: 'y_1 = e^{2x},\\quad y_2 = e^{-3x}',
    hint: 'Prueba con $y = e^{rx}$: sale $r^2 + r - 6 = 0$.',
    wrong: [
      { src: ['e^(2x)', '5e^(2x)'], tex: ['e^{2x}', '5e^{2x}'], key: 'dependent' },
      { src: ['e^(-2x)', 'e^(3x)'], tex: ['e^{-2x}', 'e^{3x}'], key: 'notSolution1' },
      { src: ['e^(2x)', 'e^(3x)'], tex: ['e^{2x}', 'e^{3x}'], key: 'notSolution2' }
    ]
  };
  var P_TRIG = {
    name: 'y″ + 4y = 0', tex: "y'' + 4y = 0", kind: 'pair', order: 2, rhs: '-4y', domain: [0, 6],
    solution: ['cos(2x)', 'sin(2x)'], solutionTex: 'y_1 = \\cos 2x,\\quad y_2 = \\sin 2x',
    hint: 'Busca funciones que, derivadas dos veces, den $-4$ veces ellas mismas.',
    wrong: [
      { src: ['cos(2x)', '3cos(2x)'], tex: ['\\cos\\left(2x\\right)', '3\\cos\\left(2x\\right)'], key: 'dependent' },
      { src: ['cos(x)', 'sin(x)'], tex: ['\\cos\\left(x\\right)', '\\sin\\left(x\\right)'], key: 'notSolution1' },
      { src: ['cos(2x)', 'sin(x)'], tex: ['\\cos\\left(2x\\right)', '\\sin\\left(x\\right)'], key: 'notSolution2' }
    ]
  };
  var P_DOUBLE = {
    name: "y″ − 4y′ + 4y = 0 (raíz doble)", tex: "y'' - 4y' + 4y = 0", kind: 'pair', order: 2, rhs: '4dy - 4y', domain: [-1, 1],
    solution: ['e^(2x)', 'x*e^(2x)'], solutionTex: 'y_1 = e^{2x},\\quad y_2 = x\\,e^{2x}',
    hint: '$e^{2x}$ es solución. La segunda sale por reducción de orden: $y_2 = v\\,e^{2x}$.',
    wrong: [
      { src: ['e^(2x)', '2e^(2x)'], tex: ['e^{2x}', '2e^{2x}'], key: 'dependent' },
      { src: ['e^(2x)', 'e^(-2x)'], tex: ['e^{2x}', 'e^{-2x}'], key: 'notSolution2' },
      { src: ['x*e^(2x)', 'x^2*e^(2x)'], tex: ['xe^{2x}', 'x^2e^{2x}'], key: 'notSolution2' }
    ]
  };
  var P_EULER = {
    name: "x²y″ − 2xy′ + 2y = 0 (x > 0)", tex: "x^2y'' - 2xy' + 2y = 0,\\qquad x > 0", kind: 'pair', order: 2, rhs: '(2x*dy - 2y)/x^2', domain: [0.5, 3],
    solution: ['x', 'x^2'], solutionTex: 'y_1 = x,\\quad y_2 = x^2',
    hint: 'Prueba con potencias $y = x^m$: sale $m(m - 1) - 2m + 2 = 0$.',
    wrong: [
      { src: ['x', '3x'], tex: ['x', '3x'], key: 'dependent' },
      { src: ['1/x', 'x^2'], tex: ['\\frac{1}{x}', 'x^2'], key: 'notSolution1' },
      { src: ['x', 'x^3'], tex: ['x', 'x^3'], key: 'notSolution2' }
    ]
  };
  var P_RED = {
    name: "Reducción de orden: x²y″ − 3xy′ + 4y = 0", tex: "x^2y'' - 3xy' + 4y = 0,\\quad y_1 = x^2", kind: 'pair', order: 2, rhs: '(3x*dy - 4y)/x^2', domain: [0.5, 3],
    solution: ['x^2', 'x^2*log(x)'], solutionTex: 'y_1 = x^2,\\quad y_2 = x^2\\ln x',
    hint: 'Con $P = -3/x$: $y_2 = y_1\\displaystyle\\int \\frac{e^{-\\int P}}{y_1^2}dx = x^2\\int \\frac{x^3}{x^4}dx$.',
    wrong: [
      { src: ['x^2', 'x^3'], tex: ['x^2', 'x^3'], key: 'notSolution2' },
      { src: ['x^2', '5x^2'], tex: ['x^2', '5x^2'], key: 'dependent' },
      { src: ['x^2', 'x*log(x)'], tex: ['x^2', 'x\\ln\\left(x\\right)'], key: 'notSolution2' }
    ]
  };
  // Ejemplo de PVI con conjunto fundamental: y″ − y′ − 2y = 0, y(0) = 4, y′(0) = −1.
  var P_PVI = { order: 2, rhs: 'dy + 2y', x0: 0, ics: [4, -1], domain: [0, 2] };

  var data = window.SESSION_DATA = {
    slug: 'sesion-09', number: '09', group: 'B · Primer orden II y orden n',
    title: 'Teoría lineal de orden n: superposición, Wronskiano, conjunto fundamental y reducción de orden', temario: [],
    minutes: 150,
    quote: 'En una ecuación lineal homogénea las soluciones se suman y se escalan como vectores: basta encontrar unas cuantas para tenerlas todas.',
    badges: [
      'Usar el principio de superposición en ecuaciones lineales homogéneas.',
      'Calcular el Wronskiano y decidir si las soluciones son linealmente independientes.',
      'Escribir la solución general como combinación de un conjunto fundamental y resolver el PVI.',
      'Encontrar una segunda solución por reducción de orden.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Si $y_1$ y $y_2$ resuelven una lineal homogénea de segundo orden y no son múltiplo una de la otra, <strong>todas</strong> las soluciones son $c_1y_1 + c_2y_2$.',
        recall: [
          'Qué es una ecuación lineal y un PVI de orden $n$ (<a href="../sesion-01/">S01 de este curso</a>).',
          'Determinantes de $2\\times 2$: $\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix} = ad - bc$.',
          'La regla del producto (<a href="../../../calculo-1/sesiones/sesion-03/">Cálculo 1, S03</a>) y el factor integrante (<a href="../sesion-04/">S04</a>).'
        ],
        why: 'Es la base del resto del curso: resortes, circuitos RLC y vibraciones son ecuaciones lineales de segundo orden. Con esta teoría sabes cuántas soluciones buscar y cómo armar la general.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en mezclar pintura: con rojo, amarillo y azul haces cualquier color, pero solo si los tres son «distintos de verdad». Si te dan rojo y otro rojo más oscuro, no llegas al verde. Las soluciones de una lineal homogénea funcionan igual: con dos soluciones «independientes» armas cualquier otra.',
          'El Wronskiano es la prueba de que tus colores son distintos de verdad: si da cero, una solución es múltiplo de la otra y te falta un color.'
        ]
      },
      {
        type: 'concept', heading: 'Ecuaciones lineales de orden n', short: 'Forma general',
        body: [
          'Una ecuación lineal de orden $n$ es $$a_n(x)y^{(n)} + \\dots + a_1(x)y\' + a_0(x)y = g(x)$$ Es <strong>homogénea</strong> si $g(x) = 0$. (Otra vez el mismo nombre que en S03, con otro significado.)',
          '<strong>Existencia y unicidad:</strong> si los $a_k$ y $g$ son continuos en un intervalo $I$ y $a_n(x) \\neq 0$ ahí, el PVI con $y(x_0), y\'(x_0), \\dots, y^{(n-1)}(x_0)$ dados tiene una única solución en todo $I$. A diferencia de S01, aquí la solución no explota antes: vive en todo el intervalo.'
        ]
      },
      {
        type: 'concept', heading: 'Principio de superposición', short: 'Superposición',
        body: [
          'Si $y_1, \\dots, y_k$ son soluciones de una lineal <strong>homogénea</strong>, cualquier combinación $c_1y_1 + \\dots + c_ky_k$ también lo es. La razón: la derivada de una suma es la suma de las derivadas, y las constantes salen. Al sustituir, cada término da cero.',
          'Esto falla en ecuaciones no lineales ($y\' = y^2$: si $y_1$ es solución, $2y_1$ no) y en no homogéneas (si $y_1$ y $y_2$ dan $g$, su suma da $2g$).'
        ]
      },
      {
        type: 'explainer', heading: 'Sumar soluciones', short: 'Combinaciones',
        title: 'Soluciones de $y\'\' + y\' + 4.25y = 0$',
        intro: 'Dos soluciones y una combinación de ellas.',
        diagram: 'c3s09-combo',
        steps: [
          { text: '$y_1 = e^{-x/2}\\cos 2x$ y $y_2 = e^{-x/2}\\sin 2x$ son soluciones (lo verás en S10). No son múltiplo una de la otra.', state: { c1: 1, c2: 0, combo: 0 } },
          { text: '$y = 1.0\\,y_1 + 0.5\\,y_2$ también es solución: misma forma de oscilar y decaer, con otra fase.', state: { c1: 1, c2: 0.5, combo: 1 } },
          { text: 'Con otros coeficientes sale cualquier otra solución. Elegir $c_1$ y $c_2$ es elegir las dos condiciones iniciales.', state: { c1: -0.6, c2: 1.2, combo: 1 } }
        ]
      },
      {
        type: 'concept', heading: 'Independencia lineal y Wronskiano', short: 'Wronskiano',
        body: [
          'Las funciones $y_1, \\dots, y_n$ son <strong>linealmente dependientes</strong> en $I$ si alguna combinación $c_1y_1 + \\dots + c_ny_n = 0$ con no todos los $c$ cero vale para todo $x$. Con dos funciones, eso es que una sea múltiplo de la otra. Si no, son <strong>independientes</strong>.',
          'El <strong>Wronskiano</strong> de dos funciones es $$W(y_1, y_2) = \\begin{vmatrix} y_1 & y_2 \\\\ y_1\' & y_2\' \\end{vmatrix} = y_1y_2\' - y_1\'y_2$$ (con $n$ funciones, la matriz lleva hasta la derivada $n - 1$).',
          '<strong>Prueba:</strong> si $y_1$ y $y_2$ son soluciones de una lineal homogénea en $I$, entonces o $W \\equiv 0$ (dependientes) o $W \\neq 0$ en todo $I$ (independientes). Basta evaluarlo en un punto.'
        ]
      },
      {
        type: 'example', heading: 'Un conjunto fundamental',
        problem: '<p>Comprueba que $y_1 = e^{2x}$ y $y_2 = e^{-3x}$ forman un conjunto fundamental de $y\'\' + y\' - 6y = 0$.</p>',
        steps: [
          { text: 'Son solución: con $y = e^{rx}$, $r^2 + r - 6 = (r - 2)(r + 3)$, que se anula en $r = 2$ y $r = -3$.' },
          { text: 'Calcula el Wronskiano.', math: 'W = e^{2x}\\cdot(-3e^{-3x}) - 2e^{2x}\\cdot e^{-3x} = -5e^{-x}' },
          { text: '$-5e^{-x}$ nunca es cero: son independientes.' }
        ],
        answer: 'Sí. La solución general es $y = c_1e^{2x} + c_2e^{-3x}$. En $x = 0$, $W = -5$.',
        verify: { lab: 'call', mod: 'ode', fn: 'wronskianAt', math: true, args: [P_EXP, 'e^(2x)', 'e^(-3x)', 0], value: -5 }
      },
      {
        type: 'concept', heading: 'Conjunto fundamental y solución general', short: 'Solución general',
        body: [
          'Una lineal homogénea de orden $n$ (con $a_n \\neq 0$) tiene exactamente $n$ soluciones independientes: un <strong>conjunto fundamental</strong>. La solución general es $$y_h = c_1y_1 + c_2y_2 + \\dots + c_ny_n$$',
          'Para la <strong>no homogénea</strong>, si $y_p$ es una solución particular cualquiera, la general es $y = y_h + y_p$. Encontrar $y_p$ es el tema de las sesiones 12 a 14.'
        ]
      },
      {
        type: 'example', heading: 'PVI con el conjunto fundamental',
        problem: '<p>Con el conjunto fundamental $\\{e^{2x}, e^{-x}\\}$ de $y\'\' - y\' - 2y = 0$, resuelve el PVI $y(0) = 4$, $y\'(0) = -1$.</p>',
        steps: [
          { text: 'Escribe la general y su derivada.', math: "y = c_1e^{2x} + c_2e^{-x}, \\qquad y' = 2c_1e^{2x} - c_2e^{-x}" },
          { text: 'Evalúa en 0.', math: 'c_1 + c_2 = 4, \\qquad 2c_1 - c_2 = -1' },
          { text: 'Suma las dos: $3c_1 = 3$, así que $c_1 = 1$ y $c_2 = 3$.', math: 'y = e^{2x} + 3e^{-x}' }
        ],
        answer: '$y = e^{2x} + 3e^{-x}$; por ejemplo, $y(1) = e^2 + 3e^{-1} \\approx ' + fx(Math.exp(2) + 3 * Math.exp(-1)) + '$. El sistema siempre tiene solución única porque su determinante es el Wronskiano en 0.',
        verify: { lab: 'call', mod: 'ode', fn: 'solveAt', math: true, args: [P_PVI, 1], value: Math.exp(2) + 3 * Math.exp(-1) }
      },
      {
        type: 'concept', heading: 'Reducción de orden', short: 'Reducción de orden',
        body: [
          'Si ya conoces una solución $y_1$ de $y\'\' + P(x)y\' + Q(x)y = 0$, busca la segunda como $y_2 = v(x)\\,y_1$. Al sustituir, los términos con $v$ se cancelan (porque $y_1$ es solución) y queda una ecuación de primer orden en $w = v\'$. El resultado general es $$y_2 = y_1\\int \\frac{e^{-\\int P\\,dx}}{y_1^2}\\,dx$$',
          'Ojo: la fórmula usa la forma estándar (coeficiente 1 en $y\'\'$). Si te dan $x^2y\'\' - 3xy\' + 4y = 0$, primero divide entre $x^2$: $P = -3/x$.'
        ]
      },
      {
        type: 'example', heading: 'Una segunda solución',
        problem: '<p>$y_1 = x^2$ resuelve $x^2y\'\' - 3xy\' + 4y = 0$ para $x > 0$. Encuentra otra solución independiente.</p>',
        steps: [
          { text: 'Forma estándar: $y\'\' - \\frac{3}{x}y\' + \\frac{4}{x^2}y = 0$, así que $P = -\\frac{3}{x}$ y $e^{-\\int P} = e^{3\\ln x} = x^3$.' },
          { text: 'Aplica la fórmula.', math: 'y_2 = x^2\\int \\frac{x^3}{(x^2)^2}\\,dx = x^2\\int \\frac{dx}{x} = x^2\\ln x' },
          { text: 'Wronskiano: $W = x^2(2x\\ln x + x) - 2x\\cdot x^2\\ln x = x^3 \\neq 0$.' }
        ],
        answer: '$y_2 = x^2\\ln x$, y la general es $y = c_1x^2 + c_2x^2\\ln x$. En el lab (problema 5) puedes comprobarlo.',
        verify: { lab: 'call', mod: 'ode', fn: 'isFundamental', math: true, args: [P_RED, 'x^2', 'x^2*log(x)'], value: 1 }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué basta evaluar $W$ en un punto?', a: 'Para soluciones de una lineal homogénea, la fórmula de Abel dice $W(x) = Ce^{-\\int P\\,dx}$: o es cero siempre ($C = 0$) o nunca. Para funciones cualesquiera (que no son solución) eso no vale.' },
          { q: '¿Cuántas soluciones necesito?', a: 'Tantas como el orden. Para segundo orden, dos independientes. Con tres o más, seguro alguna depende de las otras.' },
          { q: '¿$\\sin^2x$ y $\\cos^2x$ son independientes?', a: 'Sí, ninguna es múltiplo de la otra. Pero $\\{1, \\sin^2x, \\cos^2x\\}$ no lo son: $1 - \\sin^2x - \\cos^2x = 0$.' },
          { q: '¿La superposición sirve para la no homogénea?', a: 'No directamente. Lo que sí vale: la diferencia de dos soluciones de la no homogénea resuelve la homogénea. Por eso $y = y_h + y_p$.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Lineal homogénea: cualquier combinación de soluciones es solución (superposición).',
          'Wronskiano $W = y_1y_2\' - y_1\'y_2$: si no es cero, las soluciones son independientes.',
          'Orden $n$ → $n$ soluciones independientes; la general es su combinación. No homogénea: $y = y_h + y_p$.',
          'Reducción de orden: $y_2 = y_1\\int \\frac{e^{-\\int P}}{y_1^2}\\,dx$.'
        ]
      }
    ],

    lab: {
      type: 'ode-compare', title: 'Wronskiano interactivo',
      intro: 'Escribe dos funciones $y_1$ y $y_2$. El lab revisa que cada una sea solución de la ecuación (sustituyéndola) y grafica su Wronskiano: si las dos son solución y $W \\neq 0$, forman un conjunto fundamental. Prueba con una función y un múltiplo de ella para ver $W \\equiv 0$.',
      cfg: { start: 0, problems: [P_EXP, P_TRIG, P_DOUBLE, P_EULER, P_RED] }
    },

    formulas: [
      { label: 'Wronskiano', tex: 'W = \\begin{vmatrix} y_1 & y_2 \\\\ y_1\' & y_2\' \\end{vmatrix} = y_1y_2\' - y_1\'y_2' },
      { label: 'Solución general', tex: 'y = c_1y_1 + c_2y_2 \\ (+\\,y_p)' },
      { label: 'Reducción de orden', tex: 'y_2 = y_1\\int \\frac{e^{-\\int P\\,dx}}{y_1^2}\\,dx' },
      { label: 'Abel', tex: 'W(x) = C\\,e^{-\\int P\\,dx}' }
    ],

    exercises: [
      {
        id: 'c3-s09-wexp', title: 'Wronskiano de dos exponenciales',
        vars: { a: [-3, 3, 1], b: [-3, 3, 1], x0: [-1, 1, 0.5] },
        where: function (v) { return v.a !== v.b && v.a !== 0 && v.b !== 0; },
        prompt: function (v) { return '<p>Calcula el Wronskiano de $y_1 = e^{' + (v.a === 1 ? '' : v.a === -1 ? '-' : v.a) + 'x}$ y $y_2 = e^{' + (v.b === 1 ? '' : v.b === -1 ? '-' : v.b) + 'x}$ en $x = ' + v.x0 + '$.</p>'; },
        check: 'numeric',
        answer: function (v) { return (v.b - v.a) * Math.exp((v.a + v.b) * v.x0); },
        mistakes: {
          swapped: function (v) { return (v.a - v.b) * Math.exp((v.a + v.b) * v.x0); },
          product: function (v) { return v.a * v.b * Math.exp((v.a + v.b) * v.x0); }
        },
        feedback: [
          { when: 'swapped', say: 'El orden es $y_1y_2\' - y_1\'y_2$: da $(b - a)e^{(a + b)x}$.' },
          { when: 'product', say: 'El Wronskiano es un determinante: $y_1y_2\' - y_1\'y_2$, no el producto de las derivadas.' }
        ],
        // Oráculo: el determinante evaluado con cada función y su derivada por separado.
        oracle: { lab: 'value', value: function (v) { var x = v.x0, y1 = Math.exp(v.a * x), y2 = Math.exp(v.b * x); return y1 * (v.b * y2) - (v.a * y1) * y2; } },
        hint: '$W = y_1y_2\' - y_1\'y_2$.',
        solution: function (v) { var W = (v.b - v.a) * Math.exp((v.a + v.b) * v.x0); return '$$W = e^{' + v.a + 'x}\\cdot ' + v.b + 'e^{' + v.b + 'x} - ' + v.a + 'e^{' + v.a + 'x}\\cdot e^{' + v.b + 'x} = ' + (v.b - v.a) + 'e^{' + (v.a + v.b) + 'x} \\;\\Rightarrow\\; W(' + v.x0 + ') \\approx ' + fx(W) + '$$'; }
      },
      {
        id: 'c3-s09-wtrig', title: 'Wronskiano de seno y coseno',
        vars: { k: [2, 6, 1] },
        prompt: function (v) { return '<p>¿Cuánto vale el Wronskiano $W(\\cos ' + v.k + 'x, \\sin ' + v.k + 'x)$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.k; },
        mistakes: { one: function () { return 1; }, neg: function (v) { return -v.k; } },
        feedback: [
          { when: 'one', say: 'Falta la regla de la cadena: $(\\sin kx)\' = k\\cos kx$. Queda $k(\\cos^2 + \\sin^2) = k$.' },
          { when: 'neg', say: 'Revisa el orden: $y_1y_2\' - y_1\'y_2 = k\\cos^2 kx + k\\sin^2 kx$.' }
        ],
        // Oráculo: el determinante en un punto cualquiera (debe salir igual en todos).
        oracle: { lab: 'value', value: function (v) { var x = 0.37, c = Math.cos(v.k * x), s = Math.sin(v.k * x); return c * (v.k * c) - (-v.k * s) * s; } },
        hint: 'Deriva con regla de la cadena y usa $\\sin^2 + \\cos^2 = 1$.',
        solution: function (v) { return '$$W = \\cos ' + v.k + 'x\\cdot ' + v.k + '\\cos ' + v.k + 'x - (-' + v.k + '\\sin ' + v.k + 'x)\\sin ' + v.k + 'x = ' + v.k + '$$'; }
      },
      {
        id: 'c3-s09-pvi', title: 'Las constantes del PVI',
        vars: { A: [-4, 6, 1], B: [-6, 6, 1] },
        where: function (v) { return (v.A + v.B) % 3 === 0 && v.A + v.B !== 0; },
        prompt: function (v) { return '<p>La solución general de $y\'\' - y\' - 2y = 0$ es $y = c_1e^{2x} + c_2e^{-x}$. Si $y(0) = ' + v.A + '$ y $y\'(0) = ' + v.B + '$, ¿cuánto vale $c_1$?</p>'; },
        check: 'numeric',
        answer: function (v) { return (v.A + v.B) / 3; },
        mistakes: {
          swapped: function (v) { return (2 * v.A - v.B) / 3; },
          noDeriv: function (v) { return (v.A - v.B) / 2; }
        },
        feedback: [
          { when: 'swapped', say: 'Ese es $c_2$. De $c_1 + c_2 = A$ y $2c_1 - c_2 = B$, suma para sacar $c_1$.' },
          { when: 'noDeriv', say: 'La derivada de $e^{2x}$ es $2e^{2x}$ y la de $e^{-x}$ es $-e^{-x}$: $y\'(0) = 2c_1 - c_2$.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          // c₁ = (y(1) − c₂e^(−1))/e²… más simple: resolver con RK4 y usar y(x)e^(−2x) → c₁ cuando x crece.
          var y1 = rk({ order: 2, rhs: 'dy + 2y', x0: 0, ics: [v.A, v.B], domain: [0, 4] }, 4);
          var c2 = v.A - (v.A + v.B) / 3;
          return (y1 - c2 * Math.exp(-4)) / Math.exp(8);
        } },
        hint: 'Evalúa $y$ y $y\'$ en 0 y resuelve el sistema.',
        solution: function (v) { return '$$c_1 + c_2 = ' + v.A + ', \\qquad 2c_1 - c_2 = ' + v.B + ' \\;\\Rightarrow\\; 3c_1 = ' + (v.A + v.B) + ',\\ c_1 = ' + ((v.A + v.B) / 3) + '$$'; }
      },
      {
        id: 'c3-s09-reduccion', title: 'Reducción de orden',
        vars: { a: [1, 4, 1] },
        prompt: function (v) { return '<p>$y_1 = e^{' + (v.a === 1 ? '' : v.a) + 'x}$ resuelve $y\'\' - ' + (2 * v.a) + 'y\' + ' + (v.a * v.a) + 'y = 0$. Usa $y_2 = y_1\\int \\frac{e^{-\\int P}}{y_1^2}dx$ (sin constantes) y escribe $y_2$.</p>'; },
        check: 'expr', domain: [-1, 1],
        answer: function (v) { return 'x*e^(' + v.a + '*x)'; },
        mistakes: {
          inverse: function (v) { return 'e^(-' + v.a + '*x)'; },
          square: function (v) { return 'x^2*e^(' + v.a + '*x)'; },
          onlyV: function () { return 'x'; }
        },
        feedback: [
          { when: 'inverse', say: '$e^{-\\int P} = e^{2ax}$ y $y_1^2 = e^{2ax}$: el cociente es 1, y su integral es $x$.' },
          { when: 'square', say: 'La integral de 1 es $x$, no $x^2$.' },
          { when: 'onlyV', say: 'Esa es $v$. Falta multiplicar por $y_1$: $y_2 = v\\,y_1$.' }
        ],
        hint: '$P = -2a$, así que $e^{-\\int P} = e^{2ax}$.',
        solution: function (v) { return '$$y_2 = e^{' + v.a + 'x}\\int \\frac{e^{' + (2 * v.a) + 'x}}{e^{' + (2 * v.a) + 'x}}dx = x\\,e^{' + v.a + 'x}$$'; }
      },
      {
        id: 'c3-s09-superposicion', title: 'Concepto: superposición',
        vars: { k: [0, 2, 1] },
        prompt: function (v) {
          var eq = ["y'' + 3y' + 2y = 0", "y'' + 3y' + 2y = e^{x}", "y'' + y\\,y' = 0"][v.k];
          return '<p>$y_1$ y $y_2$ son soluciones de $' + eq + '$. ¿Es $y_1 + y_2$ también solución?</p>';
        },
        check: 'choice',
        options: function (v) {
          return [
            { text: 'Sí, siempre', correct: v.k === 0, say: v.k === 0 ? null : (v.k === 1 ? 'No: es no homogénea; la suma da $2e^{x}$ del lado derecho.' : 'No: es no lineal (por $y\\,y\'$); la superposición no aplica.') },
            { text: 'No, en general', correct: v.k !== 0, say: v.k !== 0 ? null : 'Sí lo es: la ecuación es lineal y homogénea.' },
            { text: 'Solo si $y_1 = y_2$', say: 'Eso no tiene que ver: la superposición depende de que la ecuación sea lineal y homogénea.' }
          ];
        },
        answer: function (v) { return v.k === 0 ? 'Sí, siempre' : 'No, en general'; },
        hint: 'La superposición vale para lineales homogéneas.',
        solution: function (v) { return ['Lineal y homogénea: la suma es solución.', 'No homogénea: la suma no da $e^{x}$, da $2e^{x}$.', 'No lineal: la superposición falla.'][v.k]; }
      }
    ],

    quiz: { tags: ['c3.S09'], count: 8 },

    errors: [
      'Usar la superposición en una ecuación no homogénea o no lineal.',
      'Calcular el Wronskiano como $y_1\'y_2\' $ o con el orden de la resta al revés.',
      'Concluir dependencia porque $W = 0$ en un punto, con funciones que no son solución.',
      'Aplicar la fórmula de reducción de orden sin pasar a forma estándar.',
      'Dar $v$ en lugar de $y_2 = v\\,y_1$.',
      'Buscar más (o menos) soluciones independientes que el orden de la ecuación.'
    ],

    teacher: {
      plan: [
        'Pinturas que se mezclan: la idea de base.',
        'Superposición demostrada en el pizarrón con $y\'\' + 4y = 0$.',
        'Wronskiano y su interpretación; ejemplo de exponenciales.',
        'Reducción de orden con la raíz doble; lab con pares dependientes.'
      ],
      check: [
        'Que digan cuántas constantes lleva la solución general según el orden.',
        'Que expliquen por qué el sistema del PVI tiene solución única.'
      ],
      note: 'El caso de orden $n$ con coeficientes constantes es S11; la no homogénea, S12 a S14.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §7.1 “Second-Order Linear Equations”. <a href="https://openstax.org/books/calculus-volume-3/pages/7-1-second-order-linear-equations">openstax.org</a> (CC BY-NC-SA 4.0).',
      'MIT OpenCourseWare. <em>18.03SC Differential Equations</em> (Fall 2011), Unit II: Second Order Constant Coefficient Linear Equations. <a href="https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/">ocw.mit.edu</a> (CC BY-NC-SA 4.0).',
      'Boyce, W. E., DiPrima, R. C. y Meade, D. B. <em>Elementary Differential Equations and Boundary Value Problems</em>, 11th ed., Wiley, §3.2 y §3.4 (lectura de apoyo).'
    ],

    prev: 'sesion-08',
    next: 'sesion-10'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
