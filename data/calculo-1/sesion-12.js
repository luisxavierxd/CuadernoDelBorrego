/* =====================================================================
   Cálculo 1 · S12 · Sustitución trigonométrica (bloque C · tema 5.6).
   Fuente: OpenStax, Calculus Volume 2, §3.3 (CC BY-NC-SA 4.0).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 4 : d)).toString(); }
  var OS = 'https://openstax.org/books/calculus-volume-2/pages/';

  window.SESSION_DATA = {
    slug: 'sesion-12', number: '12', group: 'C · Integral',
    title: 'Sustitución trigonométrica', temario: ['5.6'],
    minutes: 180,
    quote: 'Una raíz de la forma √(a² − x²) es un triángulo esperando a ser dibujado.',
    badges: [
      'Reconocer las tres formas: $\\sqrt{a^2 - x^2}$, $\\sqrt{a^2 + x^2}$ y $\\sqrt{x^2 - a^2}$.',
      'Elegir la sustitución $x = a\\sin\\theta$, $a\\tan\\theta$ o $a\\sec\\theta$.',
      'Simplificar la raíz con una identidad pitagórica.',
      'Regresar a $x$ usando el triángulo.'
    ],

    lesson: [
      {
        type: 'concept', heading: 'Tres formas, tres sustituciones', short: 'Las tres formas',
        body: [
          'Las raíces con $x^2$ adentro se simplifican con las identidades $1 - \\sin^2\\theta = \\cos^2\\theta$, $1 + \\tan^2\\theta = \\sec^2\\theta$ y $\\sec^2\\theta - 1 = \\tan^2\\theta$. Según la forma:'
        ],
        list: [
          '$\\sqrt{a^2 - x^2}$: usa $x = a\\sin\\theta$ y queda $a\\cos\\theta$.',
          '$\\sqrt{a^2 + x^2}$: usa $x = a\\tan\\theta$ y queda $a\\sec\\theta$.',
          '$\\sqrt{x^2 - a^2}$: usa $x = a\\sec\\theta$ y queda $a\\tan\\theta$.'
        ]
      },
      {
        type: 'explainer', heading: 'El triángulo guía', short: 'El triángulo',
        title: 'x = 3 sen θ en un triángulo de hipotenusa 3',
        intro: 'Para $\\sqrt{9 - x^2}$, dibuja un triángulo rectángulo con hipotenusa 3 y cateto opuesto $x$.',
        diagram: 'trig-triangle',
        steps: [
          { text: 'Si $x = 3\\sin\\theta$, el cateto opuesto a $\\theta$ es $x$ y la hipotenusa es 3.', state: { theta: 0.4 } },
          { text: 'Por Pitágoras, el cateto adyacente es $\\sqrt{9 - x^2}$, que también es $3\\cos\\theta$.', state: { theta: 0.75 } },
          { text: 'Así la raíz desaparece: $\\sqrt{9 - x^2} = 3\\cos\\theta$. Y para regresar a $x$ lees del triángulo: $\\cos\\theta = \\tfrac{\\sqrt{9 - x^2}}{3}$.', state: { theta: 1.05 } }
        ]
      },
      {
        type: 'example', heading: 'Resulta un arcoseno',
        problem: '<p>Calcula $\\displaystyle\\int \\frac{dx}{\\sqrt{9 - x^2}}$.</p>',
        steps: [
          { text: 'Forma $a^2 - x^2$ con $a = 3$: $x = 3\\sin\\theta$, $dx = 3\\cos\\theta\\,d\\theta$.', math: '\\sqrt{9 - x^2} = 3\\cos\\theta' },
          { text: 'Sustituye y simplifica.', math: '\\int \\frac{3\\cos\\theta\\,d\\theta}{3\\cos\\theta} = \\int d\\theta = \\theta + C' },
          { text: 'Regresa a $x$: $\\theta = \\arcsin(x/3)$.' }
        ],
        answer: '$\\displaystyle\\int \\frac{dx}{\\sqrt{9 - x^2}} = \\arcsin\\frac{x}{3} + C$',
        verify: { lab: 'antiderivative', f: '1/sqrt(9 - x^2)', F: 'arcsin(x/3)', a: -2.5, b: 2.5 }
      },
      {
        type: 'example', heading: 'El área de un cuarto de círculo',
        problem: '<p>Calcula $\\displaystyle\\int_0^2 \\sqrt{4 - x^2}\\,dx$.</p>',
        steps: [
          { text: 'Con $x = 2\\sin\\theta$: $\\sqrt{4 - x^2} = 2\\cos\\theta$ y $dx = 2\\cos\\theta\\,d\\theta$.', math: '\\int 4\\cos^2\\theta\\,d\\theta = 2\\theta + \\sin 2\\theta = 2\\theta + 2\\sin\\theta\\cos\\theta' },
          { text: 'Regresa a $x$ con el triángulo.', math: 'F(x) = 2\\arcsin\\frac{x}{2} + \\frac{x}{2}\\sqrt{4 - x^2}' },
          { text: 'Evalúa: $F(2) - F(0) = 2\\cdot\\tfrac{\\pi}{2} = \\pi$. Tiene sentido: es un cuarto del círculo de radio 2.' }
        ],
        answer: '$\\pi \\approx ' + fx(Math.PI) + '$',
        verify: { lab: 'antiderivative', f: 'sqrt(4 - x^2)', F: '2*arcsin(x/2) + x*sqrt(4 - x^2)/2', a: 0, b: 2 }
      },
      {
        type: 'example', heading: 'Resulta un arcotangente',
        problem: '<p>Calcula $\\displaystyle\\int \\frac{dx}{x^2 + 4}$.</p>',
        steps: [
          { text: 'Forma $a^2 + x^2$: $x = 2\\tan\\theta$, $dx = 2\\sec^2\\theta\\,d\\theta$ y $x^2 + 4 = 4\\sec^2\\theta$.', math: '\\int \\frac{2\\sec^2\\theta}{4\\sec^2\\theta}\\,d\\theta = \\tfrac{1}{2}\\theta + C' },
          { text: 'Regresa: $\\theta = \\arctan(x/2)$.' }
        ],
        answer: '$\\displaystyle\\int \\frac{dx}{x^2 + 4} = \\tfrac{1}{2}\\arctan\\frac{x}{2} + C$',
        verify: { lab: 'antiderivative', f: '1/(x^2 + 4)', F: 'arctan(x/2)/2', a: -3, b: 3 }
      },
      {
        type: 'example', heading: 'Con potencia 3/2',
        problem: '<p>Calcula $\\displaystyle\\int \\frac{dx}{(x^2 + 1)^{3/2}}$.</p>',
        steps: [
          { text: '$x = \\tan\\theta$: $(x^2 + 1)^{3/2} = \\sec^3\\theta$ y $dx = \\sec^2\\theta\\,d\\theta$.', math: '\\int \\frac{\\sec^2\\theta}{\\sec^3\\theta}\\,d\\theta = \\int \\cos\\theta\\,d\\theta = \\sin\\theta + C' },
          { text: 'En el triángulo con cateto opuesto $x$ y adyacente 1, la hipotenusa es $\\sqrt{x^2 + 1}$.', math: '\\sin\\theta = \\frac{x}{\\sqrt{x^2 + 1}}' }
        ],
        answer: '$\\displaystyle\\int \\frac{dx}{(x^2 + 1)^{3/2}} = \\frac{x}{\\sqrt{x^2 + 1}} + C$',
        verify: { lab: 'antiderivative', f: '1/(x^2 + 1)^(3/2)', F: 'x/sqrt(x^2 + 1)', a: -3, b: 3 }
      },
      {
        type: 'callout', heading: 'Antes de sustituir, prueba un cambio de variable',
        body: '$\\int \\dfrac{x\\,dx}{\\sqrt{9 - x^2}}$ tiene la raíz de la primera forma, pero el $x$ de arriba es casi la derivada de lo de adentro: con $u = 9 - x^2$ sale en un paso, $-\\sqrt{9 - x^2} + C$. La sustitución trigonométrica es para cuando no hay ese atajo.'
      }
    ],

    lab: {
      type: 'antiderivative-check', title: '¿Es tu antiderivada?',
      intro: 'Escribe tu resultado ya regresado a $x$ (con $\\arcsin$, $\\arctan$ y raíces). El lab lo deriva y lo compara con el integrando.',
      cfg: {
        presets: [
          { name: '1/√(9 − x²)', f: '1/sqrt(9 - x^2)', F: 'arcsin(x/3)', a: -2.5, b: 2.5 },
          { name: '√(4 − x²) · cuarto de círculo', f: 'sqrt(4 - x^2)', F: '2*arcsin(x/2) + x*sqrt(4 - x^2)/2', a: 0, b: 1.9 },
          { name: '1/(x² + 4) · error típico', f: '1/(x^2 + 4)', F: 'arctan(x/2)', a: -3, b: 3 },
          { name: '1/(x² + 1)^(3/2)', f: '1/(x^2 + 1)^(3/2)', F: 'x/sqrt(x^2 + 1)', a: -3, b: 3 },
          { name: '1/√(x² + 4)', f: '1/sqrt(x^2 + 4)', F: 'ln(x + sqrt(x^2 + 4))', a: -3, b: 3 }
        ]
      }
    },

    formulas: [
      { label: '√(a² − x²)', tex: 'x = a\\sin\\theta,\\ \\ \\sqrt{a^2 - x^2} = a\\cos\\theta' },
      { label: '√(a² + x²)', tex: 'x = a\\tan\\theta,\\ \\ \\sqrt{a^2 + x^2} = a\\sec\\theta' },
      { label: '√(x² − a²)', tex: 'x = a\\sec\\theta,\\ \\ \\sqrt{x^2 - a^2} = a\\tan\\theta' },
      { label: 'Arcoseno', tex: '\\int \\frac{dx}{\\sqrt{a^2 - x^2}} = \\arcsin\\frac{x}{a} + C' },
      { label: 'Arcotangente', tex: '\\int \\frac{dx}{x^2 + a^2} = \\frac{1}{a}\\arctan\\frac{x}{a} + C' }
    ],

    exercises: [
      {
        id: 'c1-s12-arcsin', title: 'Arcoseno',
        vars: { a: [2, 6, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int \\frac{dx}{\\sqrt{' + v.a * v.a + ' - x^2}}$.</p>'; },
        check: 'expr', domain: [-1, 1],
        integrand: function (v) { return '1/sqrt(' + v.a * v.a + ' - x^2)'; },
        answer: function (v) { return 'arcsin(x/' + v.a + ')'; },
        mistakes: { noDivide: function () { return 'arcsin(x)'; } },
        feedback: [{ when: 'noDivide', say: function (v) { return 'Con $x = ' + v.a + '\\sin\\theta$ queda $\\theta = \\arcsin(x/' + v.a + ')$.'; } }],
        hint: '$x = a\\sin\\theta$; la integral se vuelve $\\int d\\theta$.',
        solution: function (v) { return '$$\\int \\frac{dx}{\\sqrt{' + v.a * v.a + ' - x^2}} = \\arcsin\\frac{x}{' + v.a + '} + C$$'; }
      },
      {
        id: 'c1-s12-arctan', title: 'Arcotangente',
        vars: { a: [2, 6, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int \\frac{dx}{x^2 + ' + v.a * v.a + '}$.</p>'; },
        check: 'expr', domain: [-2, 2],
        integrand: function (v) { return '1/(x^2 + ' + v.a * v.a + ')'; },
        answer: function (v) { return 'arctan(x/' + v.a + ')/' + v.a; },
        mistakes: { noFactor: function (v) { return 'arctan(x/' + v.a + ')'; } },
        feedback: [{ when: 'noFactor', say: function (v) { return 'Falta el factor $\\tfrac{1}{' + v.a + '}$: sale de $dx = ' + v.a + '\\sec^2\\theta\\,d\\theta$ entre $' + v.a * v.a + '\\sec^2\\theta$.'; } }],
        hint: '$x = a\\tan\\theta$.',
        solution: function (v) { return '$$\\int \\frac{dx}{x^2 + ' + v.a * v.a + '} = \\frac{1}{' + v.a + '}\\arctan\\frac{x}{' + v.a + '} + C$$'; }
      },
      {
        id: 'c1-s12-cuarto', title: 'Área de un cuarto de círculo',
        vars: { a: [1, 6, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int_0^{' + v.a + '} \\sqrt{' + v.a * v.a + ' - x^2}\\,dx$.</p>'; },
        check: 'numeric', tol: { rel: 0.001 },
        answer: function (v) { return Math.PI * v.a * v.a / 4; },
        mistakes: { half: function (v) { return Math.PI * v.a * v.a / 2; } },
        feedback: [{ when: 'half', say: 'Ese es medio círculo; de 0 a $a$ solo es un cuarto.' }],
        // Simpson pierde precisión con la tangente vertical en x = a: se verifica con F(a) − F(0), F = (a²/2) arcsen(x/a) + (x/2)√(a² − x²).
        oracle: { lab: 'value', value: function (v) { var F = function (x) { return v.a * v.a / 2 * Math.asin(x / v.a) + x / 2 * Math.sqrt(Math.max(0, v.a * v.a - x * x)); }; return F(v.a) - F(0); } },
        hint: 'Es un cuarto del círculo de radio $a$ (o usa $x = a\\sin\\theta$).',
        solution: function (v) { return '$\\tfrac{1}{4}\\pi(' + v.a + ')^2 = ' + fx(Math.PI * v.a * v.a / 4) + '$.'; }
      },
      {
        id: 'c1-s12-arctan-def', title: 'Arcotangente definida',
        vars: { a: [1, 5, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int_0^{' + v.a + '} \\frac{dx}{x^2 + ' + v.a * v.a + '}$.</p>'; },
        check: 'numeric', tol: { rel: 0.001 },
        answer: function (v) { return Math.PI / (4 * v.a); },
        oracle: { lab: 'integral', f: function (v) { return '1/(x^2 + ' + v.a * v.a + ')'; }, a: function () { return 0; }, b: function (v) { return v.a; } },
        hint: '$\\tfrac{1}{a}\\arctan\\tfrac{x}{a}$ evaluada de 0 a $a$.',
        solution: function (v) { return '$\\tfrac{1}{' + v.a + '}(\\arctan 1 - \\arctan 0) = \\tfrac{\\pi}{' + 4 * v.a + '} \\approx ' + fx(Math.PI / (4 * v.a)) + '$.'; }
      },
      {
        id: 'c1-s12-log', title: 'Resulta un logaritmo',
        vars: { a: [1, 5, 1] },
        prompt: function (v) { return '<p>Comprueba derivando y escribe $\\displaystyle\\int \\frac{dx}{\\sqrt{x^2 + ' + v.a * v.a + '}}$.</p>'; },
        check: 'expr', domain: [-2, 2],
        integrand: function (v) { return '1/sqrt(x^2 + ' + v.a * v.a + ')'; },
        answer: function (v) { return 'ln(x + sqrt(x^2 + ' + v.a * v.a + '))'; },
        hint: 'Con $x = a\\tan\\theta$ sale $\\int \\sec\\theta\\,d\\theta = \\ln|\\sec\\theta + \\tan\\theta|$.',
        solution: function (v) { return '$$\\ln\\left(x + \\sqrt{x^2 + ' + v.a * v.a + '}\\right) + C$$ (la constante $-\\ln ' + v.a + '$ se absorbe en $C$).'; }
      },
      {
        id: 'c1-s12-elige', title: 'Elegir la sustitución',
        vars: { a: [2, 6, 1] },
        prompt: function (v) { return '<p>¿Qué sustitución conviene para $\\displaystyle\\int \\frac{\\sqrt{x^2 - ' + v.a * v.a + '}}{x}\\,dx$?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: '$x = ' + v.a + '\\sec\\theta$', correct: true },
            { text: '$x = ' + v.a + '\\sin\\theta$', say: 'Esa es para $\\sqrt{a^2 - x^2}$; aquí el $x^2$ va primero.' },
            { text: '$x = ' + v.a + '\\tan\\theta$', say: 'Esa es para $\\sqrt{a^2 + x^2}$, con suma.' },
            { text: '$u = x^2 - ' + v.a * v.a + '$', say: 'Faltaría un factor $x$ arriba para que $du$ aparezca.' }
          ];
        },
        answer: function (v) { return '$x = ' + v.a + '\\sec\\theta$'; },
        hint: 'Forma $\\sqrt{x^2 - a^2}$: usa $\\sec^2\\theta - 1 = \\tan^2\\theta$.',
        solution: function (v) { return '$x = ' + v.a + '\\sec\\theta$ hace $\\sqrt{x^2 - ' + v.a * v.a + '} = ' + v.a + '\\tan\\theta$.'; }
      }
    ],

    quiz: { tags: ['c1.S12'], count: 8 },

    errors: [
      'Elegir la sustitución de otra forma: $\\sin$ para diferencias $a^2 - x^2$, $\\tan$ para sumas.',
      'Olvidar cambiar $dx$: con $x = a\\sin\\theta$, $dx = a\\cos\\theta\\,d\\theta$.',
      'Dejar la respuesta en $\\theta$ en lugar de regresar a $x$ con el triángulo.',
      'Usar sustitución trigonométrica cuando un cambio de variable simple bastaba.'
    ],

    teacher: {
      plan: ['Repasar las tres identidades pitagóricas.', 'Explainer del triángulo.', 'Ejemplos: arcoseno, cuarto de círculo, arcotangente, potencia 3/2.'],
      check: ['Que dibujen el triángulo antes de regresar a $x$.'],
      note: 'El ejemplo del cuarto de círculo conecta con S09: el área se puede confirmar con geometría.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 2</em>, §3.3 “Trigonometric Substitution”. <a href="' + OS + '3-3-trigonometric-substitution">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-11',
    next: 'sesion-13'
  };
})();
