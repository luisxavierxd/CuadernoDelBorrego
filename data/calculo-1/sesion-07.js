/* =====================================================================
   Cálculo 1 · S07 · Extremos relativos (bloque B · tema 4.1).
   Fuente: OpenStax, Calculus Volume 1, §4.3 y §4.5 (CC BY 4.0).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 4 : d)).toString(); }

  window.SESSION_DATA = {
    slug: 'sesion-07', number: '07', group: 'B · Optimización',
    title: 'Extremos relativos', temario: ['4.1'],
    minutes: 180,
    quote: 'Donde una curva deja de subir y empieza a bajar, su tangente se queda un instante plana.',
    badges: [
      'Encontrar puntos críticos: donde $f\'(x) = 0$ o no existe.',
      'Clasificarlos con el signo de $f\'$ (criterio de la primera derivada).',
      'Usar $f\'\'$ para la concavidad y el criterio de la segunda derivada.',
      'Localizar puntos de inflexión.'
    ],

    lesson: [
      {
        type: 'concept', heading: 'Puntos críticos', short: 'Puntos críticos',
        body: [
          'Un <strong>máximo relativo</strong> es un punto más alto que todos sus vecinos cercanos; un <strong>mínimo relativo</strong>, uno más bajo. No tienen que ser los más altos o bajos de toda la gráfica.',
          'Si $f$ tiene un extremo relativo en $c$ y es derivable ahí, la tangente es horizontal: $f\'(c) = 0$.',
          'Por eso buscamos <strong>puntos críticos</strong>: valores $c$ del dominio donde $f\'(c) = 0$ o $f\'(c)$ no existe (como el pico de $|x|$ en 0).'
        ],
        diagram: 'critical-points', caption: 'En el máximo y en el mínimo, la tangente es horizontal.'
      },
      {
        type: 'explainer', heading: 'El signo de f′ decide', short: 'Criterio de f′',
        title: 'Recorre la curva y mira el signo de f′',
        intro: 'Para $f(x) = x^3 - 3x$, $f\'(x) = 3x^2 - 3 = 3(x + 1)(x - 1)$.',
        diagram: 'fprime-sign',
        steps: [
          { text: 'A la izquierda de $-1$, $f\' > 0$: la función sube.', state: { x: -1.8 } },
          { text: 'En $x = -1$, $f\' = 0$ y pasa de $+$ a $-$: es un <strong>máximo relativo</strong>.', state: { x: -1 } },
          { text: 'Entre $-1$ y $1$, $f\' < 0$: la función baja.', state: { x: 0 } },
          { text: 'En $x = 1$, $f\'$ pasa de $-$ a $+$: es un <strong>mínimo relativo</strong>.', state: { x: 1 } },
          { text: 'Después de 1 vuelve a subir. Si $f\'$ no cambia de signo en un crítico, no hay extremo.', state: { x: 1.8 } }
        ]
      },
      {
        type: 'concept', heading: 'Concavidad y segunda derivada', short: 'Concavidad',
        body: [
          'Si $f\'\' > 0$, la pendiente va en aumento: la curva es <strong>cóncava hacia arriba</strong> (∪). Si $f\'\' < 0$, es <strong>cóncava hacia abajo</strong> (∩).',
          'Un <strong>punto de inflexión</strong> es donde la concavidad cambia; ahí $f\'\'$ cambia de signo.',
          '<strong>Criterio de la segunda derivada:</strong> si $f\'(c) = 0$ y $f\'\'(c) < 0$, hay un máximo; si $f\'\'(c) > 0$, un mínimo; si $f\'\'(c) = 0$, el criterio no decide y hay que volver al signo de $f\'$.'
        ],
        diagram: 'concavity', caption: 'La inflexión separa la parte ∩ de la parte ∪.'
      },
      {
        type: 'example', heading: 'Un polinomio de grado 3',
        problem: '<p>Encuentra los extremos relativos y la inflexión de $f(x) = x^3 - 6x^2 + 9x + 1$.</p>',
        steps: [
          { text: 'Deriva y factoriza.', math: 'f\'(x) = 3x^2 - 12x + 9 = 3(x - 1)(x - 3)' },
          { text: 'Críticos: $x = 1$ y $x = 3$. El signo de $f\'$ es $+$, $-$, $+$.' },
          { text: 'Segunda derivada.', math: 'f\'\'(x) = 6x - 12,\\quad f\'\'(1) = -6 < 0,\\quad f\'\'(3) = 6 > 0' },
          { text: 'Máximo en $x = 1$ con $f(1) = 5$; mínimo en $x = 3$ con $f(3) = 1$. La inflexión está donde $f\'\' = 0$: $x = 2$.' }
        ],
        answer: 'Máximo relativo $(1, 5)$, mínimo relativo $(3, 1)$ e inflexión en $x = 2$.',
        verify: { lab: 'extrema', f: 'x^3 - 6x^2 + 9x + 1', a: -1, b: 5, crit: [[1, 'max'], [3, 'min']], infl: [2] }
      },
      {
        type: 'example', heading: 'Una curva en W',
        problem: '<p>Clasifica los puntos críticos de $f(x) = x^4 - 8x^2$.</p>',
        steps: [
          { text: 'Deriva y factoriza.', math: 'f\'(x) = 4x^3 - 16x = 4x(x - 2)(x + 2)' },
          { text: 'Críticos: $-2$, $0$ y $2$.', math: 'f\'\'(x) = 12x^2 - 16' },
          { text: 'Evalúa $f\'\'$.', math: 'f\'\'(\\pm 2) = 32 > 0,\\qquad f\'\'(0) = -16 < 0' },
          { text: 'Inflexiones donde $12x^2 = 16$: $x = \\pm\\tfrac{2}{\\sqrt{3}} \\approx \\pm 1.155$.' }
        ],
        answer: 'Mínimos en $x = \\pm 2$ (valor $-16$), máximo en $x = 0$ (valor 0) e inflexiones en $x = \\pm 2/\\sqrt{3}$.',
        verify: { lab: 'extrema', f: 'x^4 - 8x^2', a: -3, b: 3, crit: [[-2, 'min'], [0, 'max'], [2, 'min']], infl: [-2 / Math.sqrt(3), 2 / Math.sqrt(3)] }
      },
      {
        type: 'example', heading: 'Con una exponencial',
        problem: '<p>Encuentra el extremo y la inflexión de $f(x) = x\\,e^{-x}$.</p>',
        steps: [
          { text: 'Producto y cadena.', math: 'f\'(x) = e^{-x} - x\\,e^{-x} = e^{-x}(1 - x)' },
          { text: 'Como $e^{-x} > 0$, solo importa $1 - x$: pasa de $+$ a $-$ en $x = 1$. Máximo.' },
          { text: 'Segunda derivada.', math: 'f\'\'(x) = e^{-x}(x - 2)' },
          { text: 'Cambia de signo en $x = 2$: inflexión.' }
        ],
        answer: 'Máximo relativo en $(1, 1/e)$ e inflexión en $x = 2$.',
        verify: { lab: 'extrema', f: 'x*e^(-x)', a: -0.8, b: 5, crit: [[1, 'max']], infl: [2] }
      },
      {
        type: 'callout', heading: 'Crítico no siempre es extremo',
        body: '$f(x) = x^3$ tiene $f\'(0) = 0$, pero $f\'$ es positiva a los dos lados: la curva solo se aplana y sigue subiendo. Siempre revisa el signo de $f\'$ alrededor del punto (o $f\'\'$ cuando no es cero).'
      }
    ],

    lab: {
      type: 'f-fprime-fsecond', title: 'f, f′ y f″ lado a lado',
      intro: 'Mueve el cursor: donde $f\'$ cruza el cero, $f$ tiene un extremo; donde $f\'\'$ cruza el cero, $f$ cambia de concavidad. Prueba también tu propia $f(x)$.',
      cfg: {}
    },

    formulas: [
      { label: 'Punto crítico', tex: 'f\'(c) = 0\\ \\text{o}\\ f\'(c)\\ \\text{no existe}' },
      { label: 'Primera derivada', tex: '+\\to - :\\ \\text{máx}\\qquad -\\to + :\\ \\text{mín}' },
      { label: 'Segunda derivada', tex: 'f\'\'(c) < 0:\\ \\text{máx}\\qquad f\'\'(c) > 0:\\ \\text{mín}' },
      { label: 'Concavidad', tex: 'f\'\' > 0:\\ \\cup\\qquad f\'\' < 0:\\ \\cap' }
    ],

    exercises: [
      {
        id: 'c1-s07-maximo', title: 'Dónde está el máximo',
        vars: { a: [1, 5, 1] },
        prompt: function (v) { return '<p>¿En qué $x$ tiene un máximo relativo $f(x) = x^3 - ' + 3 * v.a * v.a + 'x$?</p>'; },
        check: 'numeric', tol: { abs: 0.01 },
        answer: function (v) { return -v.a; },
        mistakes: { minInstead: function (v) { return v.a; } },
        feedback: [{ when: 'minInstead', say: 'Ese es el mínimo: ahí $f\'$ pasa de $-$ a $+$.' }],
        oracle: { lab: 'extremum', kind: 'max', f: function (v) { return 'x^3 - ' + 3 * v.a * v.a + 'x'; }, a: function (v) { return -2 * v.a; }, b: function (v) { return 2 * v.a; } },
        hint: '$f\'(x) = 3x^2 - 3a^2 = 3(x - a)(x + a)$.',
        solution: function (v) { return '$f\'(x) = 3(x - ' + v.a + ')(x + ' + v.a + ')$; el signo es $+, -, +$, así que el máximo está en $x = -' + v.a + '$.'; }
      },
      {
        id: 'c1-s07-valor-min', title: 'Valor mínimo de una parábola',
        vars: { b: [1, 6, 1], c: [1, 40, 1] },
        prompt: function (v) { return '<p>¿Cuál es el valor mínimo de $f(x) = x^2 - ' + 2 * v.b + 'x + ' + v.c + '$?</p>'; },
        check: 'numeric', tol: { abs: 0.01 },
        answer: function (v) { return v.c - v.b * v.b; },
        mistakes: { gaveX: function (v) { return v.b; } },
        feedback: [{ when: 'gaveX', say: 'Ese es el $x$ del mínimo; se pide el valor $f(x)$ ahí.' }],
        where: function (v) { return v.c - v.b * v.b !== v.b; },
        oracle: { lab: 'extremum', kind: 'min', field: 'value', f: function (v) { return 'x^2 - ' + 2 * v.b + 'x + ' + v.c; }, a: function (v) { return v.b - 5; }, b: function (v) { return v.b + 5; } },
        hint: '$f\'(x) = 2x - 2b = 0$ en $x = b$. Evalúa $f(b)$.',
        solution: function (v) { return '$f\'(x) = 0$ en $x = ' + v.b + '$; $f(' + v.b + ') = ' + v.b * v.b + ' - ' + 2 * v.b * v.b + ' + ' + v.c + ' = ' + (v.c - v.b * v.b) + '$.'; }
      },
      {
        id: 'c1-s07-inflexion', title: 'Punto de inflexión',
        vars: { k: [1, 6, 1] },
        prompt: function (v) { return '<p>¿En qué $x$ tiene un punto de inflexión $f(x) = x^3 - ' + 3 * v.k + 'x^2 + 1$?</p>'; },
        check: 'numeric', tol: { abs: 0.01 },
        answer: function (v) { return v.k; },
        mistakes: { critical: function (v) { return 2 * v.k; } },
        feedback: [{ when: 'critical', say: 'Ahí $f\' = 0$ (es un mínimo); la inflexión es donde $f\'\' = 0$.' }],
        oracle: { lab: 'inflection', f: function (v) { return 'x^3 - ' + 3 * v.k + 'x^2 + 1'; }, a: function (v) { return -v.k; }, b: function (v) { return 3 * v.k; } },
        hint: '$f\'\'(x) = 6x - 6k$.',
        solution: function (v) { return '$f\'\'(x) = 6x - ' + 6 * v.k + '$ cambia de signo en $x = ' + v.k + '$.'; }
      },
      {
        id: 'c1-s07-segunda', title: 'Criterio de la segunda derivada',
        vars: { m: [2, 9, 1] },
        prompt: function (v) { return '<p>En $x = c$ se cumple $f\'(c) = 0$ y $f\'\'(c) = -' + v.m + '$. ¿Qué hay en $c$?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Un máximo relativo', correct: true },
            { text: 'Un mínimo relativo', say: 'Con $f\'\' < 0$ la curva es ∩: la tangente plana está arriba.' },
            { text: 'Un punto de inflexión', say: 'Para inflexión $f\'\'$ tendría que cambiar de signo; aquí es negativa.' },
            { text: 'No se puede saber', say: 'El criterio solo falla si $f\'\'(c) = 0$.' }
          ];
        },
        answer: function () { return 'Un máximo relativo'; },
        hint: '¿Cóncava hacia arriba o hacia abajo?',
        solution: function () { return 'Tangente plana y $f\'\' < 0$ (∩): máximo relativo.'; }
      },
      {
        id: 'c1-s07-tabla', title: 'Leer la tabla de signos',
        vars: { p: [1, 4, 1] },
        prompt: function (v) { return '<p>El signo de $f\'$ es: negativo antes de $x = ' + v.p + '$, positivo entre $' + v.p + '$ y $' + (v.p + 3) + '$, y positivo después. ¿Qué pasa en $x = ' + (v.p + 3) + '$?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Nada: no hay extremo', correct: true },
            { text: 'Un máximo relativo', say: '$f\'$ sigue positiva a la derecha: la función no empieza a bajar.' },
            { text: 'Un mínimo relativo', say: 'Para un mínimo, $f\'$ tendría que venir de negativa.' },
            { text: 'Una asíntota', say: 'El signo de $f\'$ no habla de asíntotas.' }
          ];
        },
        answer: function () { return 'Nada: no hay extremo'; },
        hint: 'Solo hay extremo si $f\'$ cambia de signo.',
        solution: function (v) { return 'En $x = ' + v.p + '$ hay un mínimo ($-\\to +$). En $x = ' + (v.p + 3) + '$ el signo no cambia: no hay extremo.'; }
      },
      {
        id: 'c1-s07-exp', title: 'Máximo con exponencial',
        vars: { k: [2, 6, 1] },
        prompt: function (v) { return '<p>¿En qué $x$ tiene su máximo $f(x) = x\\,e^{-x/' + v.k + '}$?</p>'; },
        check: 'numeric', tol: { abs: 0.01 },
        answer: function (v) { return v.k; },
        oracle: { lab: 'extremum', kind: 'max', f: function (v) { return 'x*e^(-x/' + v.k + ')'; }, a: function () { return -1; }, b: function (v) { return 4 * v.k; } },
        hint: '$f\'(x) = e^{-x/k}\\left(1 - \\tfrac{x}{k}\\right)$.',
        solution: function (v) { return '$f\'(x) = e^{-x/' + v.k + '}\\left(1 - \\tfrac{x}{' + v.k + '}\\right) = 0$ en $x = ' + v.k + '$; el signo pasa de $+$ a $-$.'; }
      }
    ],

    quiz: { tags: ['c1.S07'], count: 8 },

    errors: [
      'Decir que todo punto con $f\'(c) = 0$ es un extremo (contraejemplo: $x^3$ en 0).',
      'Olvidar los puntos donde $f\'$ no existe.',
      'Confundir el $x$ del extremo con el valor $f(x)$.',
      'Usar $f\'\'$ para clasificar cuando $f\'\'(c) = 0$: ahí el criterio no decide.'
    ],

    teacher: {
      plan: ['Pedir que dibujen una montaña y marquen dónde la tangente es plana.', 'Explainer del signo de $f\'$.', 'Lab: f, f′ y f″ sincronizadas.', 'Ejemplos de grado 3, grado 4 y exponencial.'],
      check: ['Que armen la tabla de signos antes de concluir.'],
      note: 'S08 usa exactamente esto para resolver problemas de optimización.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 1</em>, §4.3 “Maxima and Minima”. <a href="https://openstax.org/books/calculus-volume-1/pages/4-3-maxima-and-minima">openstax.org</a> (CC BY 4.0).',
      'OpenStax. <em>Calculus Volume 1</em>, §4.5 “Derivatives and the Shape of a Graph”. <a href="https://openstax.org/books/calculus-volume-1/pages/4-5-derivatives-and-the-shape-of-a-graph">openstax.org</a> (CC BY 4.0).'
    ],

    prev: 'sesion-06',
    next: 'sesion-08'
  };
})();
