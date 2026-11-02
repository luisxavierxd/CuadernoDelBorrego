/* =====================================================================
   Cálculo 3 · S11 · Homogéneas de orden n: polinomio característico,
   raíces repetidas y complejas (bloque C · No homogéneas y orden superior).
   Fuente: OpenStax, Calculus Volume 3, §7.1 (el caso de orden 2, que aquí se
   generaliza), CC BY-NC-SA 4.0; MIT OCW 18.03SC, Unit II (CC BY-NC-SA 4.0).
   Ejemplos y ejercicios propios. Se comprueban con LabMath.ode (lab ode-compare):
   residuo y condiciones iniciales; los numéricos usan RK4 como oráculo.
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

  var P_DIST = {
    name: "Tres raíces reales: y‴ − 6y″ + 11y′ − 6y = 0", tex: "y''' - 6y'' + 11y' - 6y = 0,\\quad y(0) = 0,\\ y'(0) = 0,\\ y''(0) = 2", iv: 'x', dv: 'y', order: 3,
    rhs: '6*d2y - 11*dy + 6y', scene: 'roots', poly: [1, -6, 11, -6], x0: 0, ics: [0, 0, 2], domain: [-1, 1],
    solution: 'e^x - 2e^(2x) + e^(3x)', solutionTex: 'e^{x} - 2e^{2x} + e^{3x}',
    hint: 'Prueba $r = 1$ en el polinomio: es raíz. Divide y factoriza lo que queda. Luego resuelve un sistema de $3\\times 3$.',
    wrong: [
      { src: 'e^x + 2e^(2x) + e^(3x)', tex: 'e^{x}+2e^{2x}+e^{3x}', key: 'ic' },
      { src: 'e^(-x) - 2e^(-2x) + e^(-3x)', tex: 'e^{-x}-2e^{-2x}+e^{-3x}', key: 'residual' },
      { src: 'e^x - 2e^(2x)', tex: 'e^{x}-2e^{2x}', key: 'ic' }
    ]
  };
  var P_TRIPLE = {
    name: "Raíz triple: y‴ − 3y″ + 3y′ − y = 0", tex: "y''' - 3y'' + 3y' - y = 0,\\quad y(0) = 1,\\ y'(0) = 2,\\ y''(0) = 5", iv: 'x', dv: 'y', order: 3,
    rhs: '3*d2y - 3*dy + y', scene: 'roots', poly: [1, -3, 3, -1], x0: 0, ics: [1, 2, 5], domain: [-1, 1.5],
    solution: '(1 + x + x^2)e^x', solutionTex: '(1 + x + x^2)\\,e^{x}',
    hint: '$r^3 - 3r^2 + 3r - 1 = (r - 1)^3$: la base es $e^x$, $xe^x$, $x^2e^x$.',
    wrong: [
      { src: '(1 + x)e^x', tex: '\\left(1+x\\right)e^{x}', key: 'ic' },
      { src: '(1 + x + x^2)e^(-x)', tex: '\\left(1+x+x^2\\right)e^{-x}', key: 'residual' },
      { src: 'e^x + e^(2x) + e^(3x)', tex: 'e^{x}+e^{2x}+e^{3x}', key: 'residual' }
    ]
  };
  var P_FOUR = {
    name: "Cuarto orden: y⁽⁴⁾ − 16y = 0", tex: "y^{(4)} - 16y = 0,\\quad y(0) = 2,\\ y'(0) = y''(0) = y'''(0) = 0", iv: 'x', dv: 'y', order: 4,
    rhs: '16y', scene: 'roots', poly: [1, 0, 0, 0, -16], x0: 0, ics: [2, 0, 0, 0], domain: [-1.5, 1.5],
    solution: 'cosh(2x) + cos(2x)', solutionTex: '\\cosh 2x + \\cos 2x = \\tfrac{1}{2}e^{2x} + \\tfrac{1}{2}e^{-2x} + \\cos 2x',
    hint: '$r^4 - 16 = (r^2 - 4)(r^2 + 4)$: raíces $\\pm 2$ y $\\pm 2i$. Puedes escribir $\\cosh 2x = \\frac{e^{2x} + e^{-2x}}{2}$.',
    wrong: [
      { src: 'cosh(2x)', tex: '\\cosh\\left(2x\\right)', key: 'ic' },
      { src: '2cos(2x)', tex: '2\\cos\\left(2x\\right)', key: 'ic' },
      { src: 'cosh(4x) + cos(4x)', tex: '\\cosh\\left(4x\\right)+\\cos\\left(4x\\right)', key: 'residual' }
    ]
  };
  var P_ZERO = {
    name: "Con raíz cero: y‴ + y′ = 0", tex: "y''' + y' = 0,\\quad y(0) = 1,\\ y'(0) = 1,\\ y''(0) = 0", iv: 'x', dv: 'y', order: 3,
    rhs: '-dy', scene: 'roots', poly: [1, 0, 1, 0], x0: 0, ics: [1, 1, 0], domain: [0, 6],
    solution: '1 + sin(x)', solutionTex: '1 + \\sin x',
    hint: '$r^3 + r = r(r^2 + 1)$: la raíz $r = 0$ da la constante $e^{0x} = 1$.',
    wrong: [
      { src: 'sin(x)', tex: '\\sin\\left(x\\right)', key: 'ic' },
      { src: '1 + sin(x) + cos(x)', tex: '1+\\sin\\left(x\\right)+\\cos\\left(x\\right)', key: 'ic' },
      { src: 'x + sin(x)', tex: 'x+\\sin\\left(x\\right)', key: 'residual' }
    ]
  };
  var P_RES = {
    name: "Complejas repetidas: y⁽⁴⁾ + 2y″ + y = 0", tex: "y^{(4)} + 2y'' + y = 0,\\quad y(0) = 0,\\ y'(0) = 0,\\ y''(0) = 2,\\ y'''(0) = 0", iv: 'x', dv: 'y', order: 4,
    rhs: '-2*d2y - y', scene: 'roots', poly: [1, 0, 2, 0, 1], x0: 0, ics: [0, 0, 2, 0], domain: [0, 10],
    solution: 'x*sin(x)', solutionTex: 'x\\sin x',
    hint: '$(r^2 + 1)^2 = 0$: $\\pm i$ dobles. La base es $\\cos x$, $\\sin x$, $x\\cos x$, $x\\sin x$.',
    wrong: [
      { src: 'sin(x)', tex: '\\sin\\left(x\\right)', key: 'ic' },
      { src: 'x*sin(2x)', tex: 'x\\sin\\left(2x\\right)', key: 'residual' },
      { src: '2 - 2cos(x)', tex: '2-2\\cos\\left(x\\right)', key: 'residual' }
    ]
  };

  var data = window.SESSION_DATA = {
    slug: 'sesion-11', number: '11', group: 'C · No homogéneas y orden superior',
    title: 'Homogéneas de orden n: polinomio característico, raíces repetidas y complejas', temario: [],
    minutes: 150,
    quote: 'Lo que funcionó para segundo orden funciona para cualquier orden: cada raíz del polinomio característico aporta sus propias soluciones.',
    badges: [
      'Escribir el polinomio característico de una ecuación de orden $n$ con coeficientes constantes.',
      'Factorizarlo (raíces racionales, división sintética, diferencia de cuadrados).',
      'Armar la base de soluciones con raíces repetidas ($x^ke^{rx}$) y complejas.',
      'Resolver un PVI de orden 3 o 4.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Con $y = e^{rx}$, la ecuación $a_ny^{(n)} + \\dots + a_0y = 0$ se vuelve el polinomio $a_nr^n + \\dots + a_0 = 0$. Sus $n$ raíces (contando repeticiones) dan las $n$ funciones de la base.',
        recall: [
          'Los <a href="../sesion-10/">tres casos de raíces</a> de segundo orden (S10).',
          'El <a href="../sesion-09/">conjunto fundamental</a>: orden $n$, $n$ soluciones independientes (S09).',
          'Álgebra: si $r_0$ es raíz de un polinomio, $(r - r_0)$ lo divide; las raíces complejas de un polinomio real vienen en pares conjugados.'
        ],
        why: 'Vigas que se doblan (orden 4), sistemas de varios resortes, circuitos con varias mallas y la teoría de control llevan a ecuaciones de orden mayor que 2.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en un acorde de piano: varias notas suenan juntas y el sonido es su suma. Cada raíz del polinomio característico es una «nota» de la solución: una exponencial que crece o decae, o una oscilación.',
          'Si una nota se repite (raíz doble o triple), no puedes tocarla dos veces igual: hace falta una variante, $x\\,e^{rx}$, luego $x^2e^{rx}$. Así siempre juntas $n$ sonidos distintos para una ecuación de orden $n$.'
        ]
      },
      {
        type: 'concept', heading: 'El polinomio característico', short: 'Polinomio característico',
        body: [
          'Para $a_ny^{(n)} + a_{n-1}y^{(n-1)} + \\dots + a_1y\' + a_0y = 0$ con coeficientes constantes, la sustitución $y = e^{rx}$ da $$a_nr^n + a_{n-1}r^{n-1} + \\dots + a_1r + a_0 = 0$$ Cada derivada se vuelve una potencia de $r$; el término con $y$ queda como constante.',
          'Para factorizar sin calculadora: busca raíces enteras entre los divisores de $a_0$ (si $a_n = 1$), divide con división sintética y repite. Fíjate en patrones: $r^4 - 16 = (r^2 - 4)(r^2 + 4)$, $r^3 - 3r^2 + 3r - 1 = (r - 1)^3$.'
        ]
      },
      {
        type: 'explainer', heading: 'De las raíces a la base', short: 'Raíces y base',
        title: 'Cada raíz aporta tantas funciones como su multiplicidad',
        intro: 'A la izquierda las raíces (con su multiplicidad); a la derecha, las funciones de la base.',
        diagram: 'c3s11-basis',
        steps: [
          { text: '<strong>Raíces reales distintas</strong>: cada $r$ da $e^{rx}$. Tres raíces, tres exponenciales.', state: { p: 0 } },
          { text: '<strong>Raíz real repetida $m$ veces</strong>: $e^{rx}, xe^{rx}, \\dots, x^{m-1}e^{rx}$. Aquí $r = -1$ triple da tres funciones, y $r = 2$ una más.', state: { p: 1 } },
          { text: '<strong>Complejas $\\alpha \\pm \\beta i$ repetidas $m$ veces</strong>: $e^{\\alpha x}\\cos\\beta x$ y $e^{\\alpha x}\\sin\\beta x$, cada una también multiplicada por $x, \\dots, x^{m-1}$. El par $\\pm 2i$ doble da cuatro funciones.', state: { p: 2 } }
        ]
      },
      {
        type: 'recipe', heading: 'Receta: orden n con coeficientes constantes', short: 'Receta',
        steps: [
          { text: 'Escribe el polinomio característico ($y^{(k)} \\to r^k$).', tip: 'No olvides los términos que faltan: en $y\'\'\' + y\' = 0$ es $r^3 + r = 0$, con la raíz $r = 0$.' },
          { text: 'Factorízalo por completo y anota la multiplicidad de cada raíz.' },
          { text: 'Escribe la base: por cada raíz de multiplicidad $m$, $m$ funciones (multiplicando por $1, x, \\dots, x^{m-1}$).', tip: 'Cuenta: debes terminar con exactamente $n$ funciones.' },
          { text: 'La general es la combinación con $n$ constantes. Deriva $n - 1$ veces y aplica las condiciones iniciales.' },
          { text: 'Resuelve el sistema (por eliminación) y escribe $y(x)$.' }
        ]
      },
      {
        type: 'example', heading: 'Tres raíces reales',
        diagram: 'c3s11-notes',
        problem: '<p>Resuelve $y\'\'\' - 6y\'\' + 11y\' - 6y = 0$ con $y(0) = 0$, $y\'(0) = 0$, $y\'\'(0) = 2$.</p>',
        steps: [
          { text: 'Característico: $r^3 - 6r^2 + 11r - 6$. Con $r = 1$ da $0$; dividiendo queda $r^2 - 5r + 6 = (r - 2)(r - 3)$.', math: 'y = c_1e^{x} + c_2e^{2x} + c_3e^{3x}' },
          { text: 'Condiciones en 0 (derivando):', math: 'c_1 + c_2 + c_3 = 0,\\quad c_1 + 2c_2 + 3c_3 = 0,\\quad c_1 + 4c_2 + 9c_3 = 2' },
          { text: 'Restando ecuaciones: $c_2 + 2c_3 = 0$ y $2c_2 + 6c_3 = 2$, así que $c_3 = 1$, $c_2 = -2$, $c_1 = 1$.', math: 'y = e^{x} - 2e^{2x} + e^{3x}' }
        ],
        answer: '$y = e^{x} - 2e^{2x} + e^{3x}$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_DIST, 'e^x - 2e^(2x) + e^(3x)'], value: 1 }
      },
      {
        type: 'example', heading: 'Raíz triple',
        problem: '<p>Resuelve $y\'\'\' - 3y\'\' + 3y\' - y = 0$ con $y(0) = 1$, $y\'(0) = 2$, $y\'\'(0) = 5$.</p>',
        steps: [
          { text: '$r^3 - 3r^2 + 3r - 1 = (r - 1)^3$: raíz $1$ triple.', math: 'y = (c_1 + c_2x + c_3x^2)e^{x}' },
          { text: 'Con $u = c_1 + c_2x + c_3x^2$: $y\' = (u + u\')e^x$, $y\'\' = (u + 2u\' + u\'\')e^x$. En 0:', math: 'c_1 = 1,\\quad c_1 + c_2 = 2,\\quad c_1 + 2c_2 + 2c_3 = 5' },
          { text: 'Así $c_2 = 1$ y $c_3 = 1$.', math: 'y = (1 + x + x^2)e^{x}' }
        ],
        answer: '$y = (1 + x + x^2)e^{x}$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_TRIPLE, '(1 + x + x^2)e^x'], value: 1 }
      },
      {
        type: 'example', heading: 'Reales y complejas juntas',
        diagram: 'c3s11-chord',
        problem: '<p>Resuelve $y^{(4)} - 16y = 0$ con $y(0) = 2$ y $y\'(0) = y\'\'(0) = y\'\'\'(0) = 0$. Calcula $y(1)$.</p>',
        steps: [
          { text: '$r^4 - 16 = (r - 2)(r + 2)(r^2 + 4)$: raíces $2, -2, \\pm 2i$.', math: 'y = c_1e^{2x} + c_2e^{-2x} + c_3\\cos 2x + c_4\\sin 2x' },
          { text: 'Las condiciones impares ($y\'$ y $y\'\'\'$) en 0 dan $c_1 = c_2$ y $c_4 = 0$; las pares dan $2c_1 + c_3 = 2$ y $8c_1 - 4c_3 = 0$.', math: 'c_1 = c_2 = \\tfrac{1}{2},\\quad c_3 = 1,\\quad c_4 = 0' },
          { text: 'Así $y = \\cosh 2x + \\cos 2x$. Evalúa.', math: 'y(1) = \\cosh 2 + \\cos 2 \\approx ' + fx(Math.cosh(2) + Math.cos(2), 3) }
        ],
        answer: '$y(1) \\approx ' + fx(Math.cosh(2) + Math.cos(2), 3) + '$. En el lab puedes escribir $\\cosh$ o las dos exponenciales.',
        verify: { lab: 'call', mod: 'ode', fn: 'solveAt', math: true, args: [P_FOUR, 1], value: Math.cosh(2) + Math.cos(2) }
      },
      {
        type: 'callout', heading: 'La raíz r = 0',
        body: [
          'Si en la ecuación no aparece $y$ (solo sus derivadas), el polinomio no tiene término constante y $r = 0$ es raíz. Su función es $e^{0x} = 1$: la solución incluye una constante suelta. Si $r = 0$ es doble, aparecen $1$ y $x$; por eso $y\'\' = 0$ tiene solución $c_1 + c_2x$.'
        ]
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Y si no encuentro las raíces a mano?', a: 'En tareas y exámenes los polinomios están hechos para factorizarse (raíces enteras, cuadrados, cubos). En la práctica se usan métodos numéricos; el lab dibuja las raíces en el plano complejo.' },
          { q: '¿Cómo sé si ya tengo todas las funciones?', a: 'Cuenta: deben ser exactamente $n$ para una ecuación de orden $n$, contando la multiplicidad de cada raíz.' },
          { q: '¿Por qué $x^k$ y no otra cosa en las repetidas?', a: 'Es lo que da la reducción de orden (S09) aplicada una y otra vez. Puedes comprobarlo sustituyendo $xe^{rx}$ cuando $r$ es raíz doble.' },
          { q: '¿Qué es $\\cosh$?', a: 'El coseno hiperbólico: $\\cosh u = \\frac{e^u + e^{-u}}{2}$. Aparece cuando hay raíces $\\pm a$ reales y simétricas con condiciones pares.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Orden $n$: polinomio característico de grado $n$, cambiando $y^{(k)}$ por $r^k$.',
          'Raíz real de multiplicidad $m$: $e^{rx}, xe^{rx}, \\dots, x^{m-1}e^{rx}$.',
          'Complejas $\\alpha \\pm \\beta i$ de multiplicidad $m$: $x^ke^{\\alpha x}\\cos\\beta x$ y $x^ke^{\\alpha x}\\sin\\beta x$, $k < m$.',
          'El PVI necesita $n$ condiciones y lleva a un sistema de $n\\times n$.'
        ]
      }
    ],

    lab: {
      type: 'ode-compare', title: 'Raíces de grado n y su base',
      intro: 'Cada problema muestra las raíces del polinomio característico en el plano complejo (con cuántas son reales, complejas o repetidas). Escribe la solución del PVI: el lab la sustituye en la ecuación de orden 3 o 4 y revisa todas las condiciones iniciales.',
      cfg: { start: 0, problems: [P_DIST, P_TRIPLE, P_FOUR, P_ZERO, P_RES] }
    },

    formulas: [
      { label: 'Característico', tex: 'a_nr^n + \\dots + a_1r + a_0 = 0' },
      { label: 'Raíz real m veces', tex: 'e^{rx},\\ xe^{rx},\\ \\dots,\\ x^{m-1}e^{rx}' },
      { label: 'Complejas m veces', tex: 'x^ke^{\\alpha x}\\cos\\beta x,\\ x^ke^{\\alpha x}\\sin\\beta x,\\ k < m' }
    ],

    exercises: [
      {
        id: 'c3-s11-cuantas', title: '¿Cuántas constantes?',
        vars: { n: [3, 6, 1] },
        prompt: function (v) { return '<p>La solución general de una ecuación lineal homogénea de orden ' + v.n + ' con coeficientes constantes, ¿cuántas constantes arbitrarias tiene?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.n; },
        mistakes: { less: function (v) { return v.n - 1; }, two: function () { return 2; } },
        where: function (v) { return v.n !== 3; },
        feedback: [
          { when: 'less', say: 'Son tantas como el orden: una por cada raíz, contando multiplicidad.' },
          { when: 'two', say: 'Dos es para segundo orden. En general, el número de constantes es el orden.' }
        ],
        oracle: { lab: 'value', value: function (v) { return window.LabMath.ode.polyRoots([1].concat(Array(v.n).fill(0).map(function (z, i) { return i === v.n - 1 ? -1 : 0; }))).length; } },
        hint: 'Una por cada raíz del polinomio de grado $n$.',
        solution: function (v) { return 'El polinomio característico tiene grado ' + v.n + ', con ' + v.n + ' raíces contando multiplicidad: ' + v.n + ' funciones en la base y ' + v.n + ' constantes.'; }
      },
      {
        id: 'c3-s11-base', title: 'La base correcta',
        vars: { r: [1, 3, 1], b: [2, 4, 1] },
        prompt: function (v) { return '<p>El polinomio característico de una ecuación es $(r - ' + v.r + ')^2(r^2 + ' + (v.b * v.b) + ')$. ¿Cuál es una base de soluciones?</p>'; },
        check: 'choice',
        options: function (v) {
          var e = 'e^{' + (v.r === 1 ? '' : v.r) + 'x}';
          return [
            { text: '$' + e + ',\\ x' + e + ',\\ \\cos ' + v.b + 'x,\\ \\sin ' + v.b + 'x$', correct: true },
            { text: '$' + e + ',\\ ' + e + ',\\ \\cos ' + v.b + 'x,\\ \\sin ' + v.b + 'x$', say: 'Repetir la misma función no da dos independientes: para la raíz doble va $x\\,e^{rx}$.' },
            { text: '$' + e + ',\\ x' + e + ',\\ e^{' + v.b + 'x},\\ e^{-' + v.b + 'x}$', say: '$r^2 + ' + (v.b * v.b) + ' = 0$ da $\\pm ' + v.b + 'i$ (imaginarias), no $\\pm ' + v.b + '$.' },
            { text: '$' + e + ',\\ x' + e + ',\\ \\cos ' + (v.b * v.b) + 'x,\\ \\sin ' + (v.b * v.b) + 'x$', say: 'La frecuencia es $\\beta = ' + v.b + '$ (la raíz de ' + (v.b * v.b) + '), no ' + (v.b * v.b) + '.' }
          ];
        },
        answer: function (v) { var e = 'e^{' + (v.r === 1 ? '' : v.r) + 'x}'; return '$' + e + ',\\ x' + e + ',\\ \\cos ' + v.b + 'x,\\ \\sin ' + v.b + 'x$'; },
        hint: 'Raíz doble → multiplica por $x$; $r^2 + \\beta^2$ → seno y coseno de $\\beta x$.',
        solution: function (v) { return '$r = ' + v.r + '$ doble da $e^{' + v.r + 'x}$ y $xe^{' + v.r + 'x}$; $r = \\pm ' + v.b + 'i$ da $\\cos ' + v.b + 'x$ y $\\sin ' + v.b + 'x$.'; }
      },
      {
        id: 'c3-s11-pvi', title: 'PVI de tercer orden',
        vars: { a: [-3, 3, 1], b: [-3, 3, 1], c: [-3, 3, 1] },
        where: function (v) { return v.b !== 0 && (v.b + v.c) % 2 === 0 && (v.c - v.b) % 2 === 0 && v.a - v.c !== 0 && v.c !== 0; },
        prompt: function (v) { return '<p>Resuelve $y\'\'\' - y\' = 0$ con $y(0) = ' + v.a + '$, $y\'(0) = ' + v.b + '$ y $y\'\'(0) = ' + v.c + '$.</p>'; },
        check: 'expr', domain: [-1, 1],
        answer: function (v) { return (v.a - v.c) + ' + ' + ((v.b + v.c) / 2) + '*e^x + ' + ((v.c - v.b) / 2) + '*e^(-x)'; },
        mistakes: {
          noConst: function (v) { return ((v.b + v.c) / 2) + '*e^x + ' + ((v.c - v.b) / 2) + '*e^(-x)'; },
          swapped: function (v) { return (v.a - v.c) + ' + ' + ((v.c - v.b) / 2) + '*e^x + ' + ((v.b + v.c) / 2) + '*e^(-x)'; }
        },
        feedback: [
          { when: 'noConst', say: '$r^3 - r = r(r - 1)(r + 1)$: la raíz $r = 0$ aporta una constante.' },
          { when: 'swapped', say: 'Intercambiaste los coeficientes de $e^{x}$ y $e^{-x}$: de $c_2 - c_3 = y\'(0)$ y $c_2 + c_3 = y\'\'(0)$.' }
        ],
        hint: '$r^3 - r = r(r - 1)(r + 1)$, así que $y = c_1 + c_2e^x + c_3e^{-x}$.',
        solution: function (v) { return '$$c_1 + c_2 + c_3 = ' + v.a + ',\\quad c_2 - c_3 = ' + v.b + ',\\quad c_2 + c_3 = ' + v.c + '$$ $$c_2 = ' + ((v.b + v.c) / 2) + ',\\ c_3 = ' + ((v.c - v.b) / 2) + ',\\ c_1 = ' + (v.a - v.c) + '$$'; }
      },
      {
        id: 'c3-s11-triple', title: 'Raíz triple: un valor',
        vars: { r: [-2, -1, 1], A: [1, 3, 1], B: [-2, 2, 1], C: [-2, 4, 1] },
        prompt: function (v) { var a = -3 * v.r, b = 3 * v.r * v.r, c = -v.r * v.r * v.r; return '<p>Resuelve $y\'\'\' + ' + a + "y'' + " + b + "y' + " + c + 'y = 0$ con $y(0) = ' + v.A + '$, $y\'(0) = ' + v.B + '$, $y\'\'(0) = ' + v.C + '$, y calcula $y(1)$.</p>'; },
        check: 'numeric',
        answer: function (v) { var c1 = v.A, c2 = v.B - v.r * c1, c3 = (v.C - v.r * v.r * c1 - 2 * v.r * c2) / 2; return (c1 + c2 + c3) * Math.exp(v.r); },
        mistakes: {
          noSquare: function (v) { var c1 = v.A, c2 = v.B - v.r * c1; return (c1 + c2) * Math.exp(v.r); },
          noHalf: function (v) { var c1 = v.A, c2 = v.B - v.r * c1, c3 = v.C - v.r * v.r * c1 - 2 * v.r * c2; return (c1 + c2 + c3) * Math.exp(v.r); }
        },
        where: function (v) { var c1 = v.A, c2 = v.B - v.r * c1, c3 = (v.C - v.r * v.r * c1 - 2 * v.r * c2) / 2; return Math.abs(c1 + c2 + c3) > 0.3 && Math.abs(c3) > 0.2; },
        feedback: [
          { when: 'noSquare', say: 'Con raíz triple la base lleva también $x^2e^{rx}$.' },
          { when: 'noHalf', say: 'En $y\'\'(0)$ el término $c_3x^2$ aporta $2c_3$: divide entre 2.' }
        ],
        oracle: { lab: 'value', value: function (v) { var a = -3 * v.r, b = 3 * v.r * v.r, c = -v.r * v.r * v.r; return rk({ order: 3, rhs: '-(' + a + ')*d2y - (' + b + ')*dy - (' + c + ')*y', x0: 0, ics: [v.A, v.B, v.C], domain: [0, 1] }, 1); } },
        hint: 'El polinomio es $(r - r_0)^3$: $y = (c_1 + c_2x + c_3x^2)e^{r_0x}$.',
        solution: function (v) { var c1 = v.A, c2 = v.B - v.r * c1, c3 = (v.C - v.r * v.r * c1 - 2 * v.r * c2) / 2; return '$$r = ' + v.r + '\\ \\text{triple},\\quad c_1 = ' + c1 + ',\\ c_2 = ' + fx(c2, 3) + ',\\ c_3 = ' + fx(c3, 3) + ' \\;\\Rightarrow\\; y(1) = (c_1 + c_2 + c_3)e^{' + v.r + '} \\approx ' + fx((c1 + c2 + c3) * Math.exp(v.r)) + '$$'; }
      },
      {
        id: 'c3-s11-raiz', title: 'Factoriza el polinomio',
        vars: { p: [1, 3, 1], q: [-4, -1, 1] },
        where: function (v) { return v.p + v.q !== 0 && v.p !== -v.q; },
        prompt: function (v) { var s = 1 + v.p + v.q, m = v.p + v.q + v.p * v.q, pr = v.p * v.q; return '<p>El polinomio característico $r^3 ' + (-s < 0 ? '- ' + s : '+ ' + (-s)) + 'r^2 ' + (m < 0 ? '- ' + (-m) : '+ ' + m) + 'r ' + (-pr < 0 ? '- ' + pr : '+ ' + (-pr)) + '$ tiene la raíz $r = 1$. ¿Cuál es la menor de sus otras dos raíces?</p>'.replace('+ 0r', '').replace('- 0r', ''); },
        check: 'numeric',
        answer: function (v) { return Math.min(v.p, v.q); },
        mistakes: { largest: function (v) { return Math.max(v.p, v.q); }, sign: function (v) { return -Math.min(v.p, v.q); } },
        feedback: [
          { when: 'largest', say: 'Esa es la mayor; se pide la menor.' },
          { when: 'sign', say: 'Si el factor es $(r - a)$, la raíz es $a$, no $-a$.' }
        ],
        oracle: { lab: 'value', value: function (v) { var s = 1 + v.p + v.q, m = v.p + v.q + v.p * v.q, pr = v.p * v.q; var R = window.LabMath.ode.polyRoots([1, -s, m, -pr]); return Math.round(R[0][0] * 1e9) / 1e9; } },
        hint: 'Divide entre $(r - 1)$ con división sintética y factoriza la cuadrática que queda.',
        solution: function (v) { return 'Al dividir entre $(r - 1)$ queda $(r - ' + v.p + ')(r ' + (v.q < 0 ? '+ ' + (-v.q) : '- ' + v.q) + ')$: las otras raíces son ' + v.p + ' y ' + v.q + '; la menor es ' + Math.min(v.p, v.q) + '.'; }
      }
    ],

    quiz: { tags: ['c3.S11'], count: 8 },

    errors: [
      'Olvidar los términos que faltan en el polinomio (y con ellos la raíz $r = 0$).',
      'Repetir $e^{rx}$ en lugar de multiplicar por $x$ en las raíces repetidas.',
      'Confundir $r^2 + \\beta^2$ (complejas) con $r^2 - \\beta^2$ (reales).',
      'Usar $\\beta^2$ como frecuencia en lugar de $\\beta$.',
      'Terminar con menos (o más) funciones que el orden.',
      'Equivocar las derivadas de $x^ke^{rx}$ al aplicar las condiciones iniciales.'
    ],

    teacher: {
      plan: [
        'El acorde de piano: cada raíz es una nota.',
        'Factorizar polinomios con raíces enteras (división sintética) en el pizarrón.',
        'Explainer de multiplicidades y los tres ejemplos.',
        'Lab: mirar en el plano complejo las raíces de cada problema antes de resolver.'
      ],
      check: [
        'Que cuenten $n$ funciones en la base.',
        'Que reconozcan la raíz $r = 0$ cuando falta el término en $y$.'
      ],
      note: 'Con esto queda lista la parte homogénea; S12 a S14 agregan el lado derecho $g(x)$.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §7.1 “Second-Order Linear Equations” (base del caso de orden $n$). <a href="https://openstax.org/books/calculus-volume-3/pages/7-1-second-order-linear-equations">openstax.org</a> (CC BY-NC-SA 4.0).',
      'MIT OpenCourseWare. <em>18.03SC Differential Equations</em> (Fall 2011), Unit II. <a href="https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/">ocw.mit.edu</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-10',
    next: 'sesion-12'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
