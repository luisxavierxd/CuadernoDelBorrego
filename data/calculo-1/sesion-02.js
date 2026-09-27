/* =====================================================================
   Cálculo 1 · S02 · Fórmulas directas de derivación (bloque A).
   Temas 1.3–1.5, 2.1–2.2, 3.4, 3.6, 3.7.
   Fuentes: OpenStax, Calculus Volume 1, §3.3, §3.5, §3.7 y §3.9 (CC BY 4.0).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 4 : d)).toString(); }

  window.SESSION_DATA = {
    slug: 'sesion-02', number: '02', group: 'A · Derivada',
    title: 'Fórmulas directas: potencia, polinomios, exponencial, logaritmo, trigonométricas y trigonométricas inversas',
    temario: ['1.3', '1.4', '1.5', '2.1', '2.2', '3.4', '3.6', '3.7'],
    minutes: 210,
    quote: 'Derivar con la definición cada vez sería eterno. Estas fórmulas son los atajos, y todas salen de la misma idea.',
    badges: [
      'Derivar potencias con cualquier exponente, incluidas raíces y fracciones.',
      'Usar las reglas de la constante y de la suma para derivar polinomios.',
      'Derivar exponenciales, logaritmos y funciones trigonométricas.',
      'Derivar arcoseno, arcocoseno y arcotangente.'
    ],

    lesson: [
      {
        type: 'concept', heading: 'Reglas básicas y la regla de la potencia', short: 'Potencia y polinomios',
        body: [
          'Tres reglas cubren cualquier polinomio: $$\\frac{d}{dx}c = 0 \\qquad \\frac{d}{dx}x^n = n\\,x^{n-1} \\qquad \\frac{d}{dx}\\big[a\\,f + b\\,g\\big] = a\\,f\' + b\\,g\'.$$',
          'La regla de la potencia vale para <strong>cualquier</strong> exponente real. Por eso conviene reescribir antes de derivar: $\\sqrt{x} = x^{1/2}$ y $\\dfrac{1}{x^3} = x^{-3}$.',
          'Abajo, $f$ y su derivada: donde $f\'$ es positiva, $f$ sube; donde es cero, la tangente es horizontal.'
        ],
        diagram: 'derivative-graph',
        caption: 'Arriba $f(x) = x^3 - 3x$; abajo $f\'(x) = 3x^2 - 3$.'
      },
      {
        type: 'concept', heading: 'Exponenciales y logaritmos', short: 'Exponencial y logaritmo',
        body: ['La exponencial natural es la única función que es su propia derivada. Las demás bases y los logaritmos se deducen de ella:'],
        list: [
          '$\\dfrac{d}{dx}e^x = e^x$ y $\\dfrac{d}{dx}a^x = a^x \\ln a$',
          '$\\dfrac{d}{dx}\\ln x = \\dfrac{1}{x}$ y $\\dfrac{d}{dx}\\log_a x = \\dfrac{1}{x \\ln a}$'
        ]
      },
      {
        type: 'concept', heading: 'Trigonométricas y sus inversas', short: 'Trigonométricas',
        body: ['Con $x$ en radianes:'],
        list: [
          '$(\\sin x)\' = \\cos x$, $\\ (\\cos x)\' = -\\sin x$, $\\ (\\tan x)\' = \\sec^2 x$',
          '$(\\sec x)\' = \\sec x \\tan x$, $\\ (\\csc x)\' = -\\csc x \\cot x$, $\\ (\\cot x)\' = -\\csc^2 x$',
          '$(\\arcsin x)\' = \\dfrac{1}{\\sqrt{1 - x^2}}$, $\\ (\\arccos x)\' = -\\dfrac{1}{\\sqrt{1 - x^2}}$, $\\ (\\arctan x)\' = \\dfrac{1}{1 + x^2}$'
        ],
        teacher: 'Truco para los signos: todas las “co” (coseno, cosecante, cotangente, arcocoseno) llevan signo menos.'
      },
      {
        type: 'example', heading: 'Un polinomio',
        problem: '<p>Deriva $y = 4x^5 - 3x^2 + 7x - 9$.</p>',
        steps: [
          { text: 'Aplica la regla de la potencia término a término; la constante desaparece.', math: 'y\' = 4\\cdot 5x^4 - 3\\cdot 2x + 7 - 0' },
          { text: 'Simplifica.', math: 'y\' = 20x^4 - 6x + 7' }
        ],
        answer: '$y\' = 20x^4 - 6x + 7$',
        verify: { lab: 'derivative', f: '4x^5 - 3x^2 + 7x - 9', d: '20x^4 - 6x + 7' }
      },
      {
        type: 'example', heading: 'Raíces y potencias negativas',
        problem: '<p>Deriva $y = 3\\sqrt{x} + \\dfrac{2}{x^3}$.</p>',
        steps: [
          { text: 'Reescribe como potencias.', math: 'y = 3x^{1/2} + 2x^{-3}' },
          { text: 'Deriva cada potencia.', math: 'y\' = \\tfrac{3}{2}x^{-1/2} - 6x^{-4}' },
          { text: 'Regresa a raíces y fracciones.', math: 'y\' = \\frac{3}{2\\sqrt{x}} - \\frac{6}{x^4}' }
        ],
        answer: '$y\' = \\dfrac{3}{2\\sqrt{x}} - \\dfrac{6}{x^4}$',
        verify: { lab: 'derivative', f: '3sqrt(x) + 2/x^3', d: '3/(2sqrt(x)) - 6/x^4' }
      },
      {
        type: 'example', heading: 'Exponenciales y logaritmos',
        problem: '<p>Deriva $y = 5e^x - 2\\ln x + 3^x$.</p>',
        steps: [
          { text: 'Una fórmula por término.', math: 'y\' = 5e^x - \\frac{2}{x} + 3^x \\ln 3' }
        ],
        answer: '$y\' = 5e^x - \\dfrac{2}{x} + 3^x \\ln 3$',
        verify: { lab: 'derivative', f: '5e^x - 2ln(x) + 3^x', d: '5e^x - 2/x + 3^x*ln(3)' }
      },
      {
        type: 'example', heading: 'Trigonométricas e inversas',
        problem: '<p>Deriva $y = 2\\sin x - \\tan x + \\arctan x$.</p>',
        steps: [
          { text: 'Aplica las tres fórmulas.', math: 'y\' = 2\\cos x - \\sec^2 x + \\frac{1}{1 + x^2}' }
        ],
        answer: '$y\' = 2\\cos x - \\sec^2 x + \\dfrac{1}{1 + x^2}$',
        verify: { lab: 'derivative', f: '2sin(x) - tan(x) + atan(x)', d: '2cos(x) - sec(x)^2 + 1/(1+x^2)', a: -1.2, b: 1.2 }
      },
      {
        type: 'callout', heading: 'Reescribe antes de derivar',
        body: 'Casi todos los errores de esta sesión vienen de derivar raíces o fracciones “como se ven”. Primero pásalas a potencias: $\\sqrt[3]{x^2} = x^{2/3}$ y $\\dfrac{5}{x} = 5x^{-1}$.'
      }
    ],

    lab: {
      type: 'derivative-check', title: '¿Es tu derivada?',
      intro: 'Escribe tu $f\'(x)$ y compárala con la real. El lab te dice si es correcta, si el signo está invertido o si sobra un factor, y te muestra la pendiente de la tangente.',
      cfg: {
        presets: [
          { name: 'Potencia · error típico', f: 'x^4 - 5x', d: '4x^4 - 5', x: [-2, 2], a: 1 },
          { name: 'Raíz', f: '6sqrt(x)', d: '3/sqrt(x)', x: [0.1, 4], a: 1 },
          { name: 'Exponencial y logaritmo', f: 'e^x + ln(x)', d: 'e^x + 1/x', x: [0.2, 2.5], a: 1 },
          { name: 'Coseno · signo', f: 'cos(x)', d: 'sin(x)', x: [-1, 5], a: 1 },
          { name: 'Arcotangente', f: 'atan(x)', d: '1/(1+x^2)', x: [-3, 3], a: 1 }
        ]
      }
    },

    formulas: [
      { label: 'Potencia', tex: '(x^n)\' = n\\,x^{n-1}' },
      { label: 'Exponencial', tex: '(e^x)\' = e^x,\\ (a^x)\' = a^x\\ln a' },
      { label: 'Logaritmo', tex: '(\\ln x)\' = \\tfrac{1}{x}' },
      { label: 'Seno y coseno', tex: '(\\sin x)\' = \\cos x,\\ (\\cos x)\' = -\\sin x' },
      { label: 'Tangente', tex: '(\\tan x)\' = \\sec^2 x' },
      { label: 'Arcoseno', tex: '(\\arcsin x)\' = \\tfrac{1}{\\sqrt{1-x^2}}' },
      { label: 'Arcotangente', tex: '(\\arctan x)\' = \\tfrac{1}{1+x^2}' }
    ],

    exercises: [
      {
        id: 'c1-s02-potencia', title: 'Potencia',
        vars: { a: [2, 9, 1], n: [3, 8, 1], b: [2, 9, 1] },
        prompt: function (v) { return '<p>Deriva $f(x) = ' + v.a + 'x^{' + v.n + '} - ' + v.b + 'x$.</p>'; },
        check: 'expr',
        derivativeOf: function (v) { return v.a + 'x^' + v.n + ' - ' + v.b + 'x'; },
        answer: function (v) { return (v.a * v.n) + 'x^' + (v.n - 1) + ' - ' + v.b; },
        mistakes: { keepExponent: function (v) { return (v.a * v.n) + 'x^' + v.n + ' - ' + v.b; } },
        feedback: [{ when: 'keepExponent', say: 'Bajaste el exponente como factor, pero también hay que restarle 1.' }],
        hint: 'Baja el exponente y réstale 1. La derivada de $bx$ es $b$.',
        solution: function (v) { return '$$f\'(x) = ' + v.a + '\\cdot ' + v.n + 'x^{' + (v.n - 1) + '} - ' + v.b + ' = ' + (v.a * v.n) + 'x^{' + (v.n - 1) + '} - ' + v.b + '$$'; }
      },
      {
        id: 'c1-s02-raiz', title: 'Raíz',
        vars: { c: [2, 12, 2] },
        prompt: function (v) { return '<p>Deriva $f(x) = ' + v.c + '\\sqrt{x}$.</p>'; },
        check: 'expr', domain: [0.3, 3],
        derivativeOf: function (v) { return v.c + 'sqrt(x)'; },
        answer: function (v) { return (v.c / 2) + '/sqrt(x)'; },
        mistakes: { noHalf: function (v) { return v.c + '/sqrt(x)'; } },
        feedback: [{ when: 'noHalf', say: 'Te faltó el $\\tfrac{1}{2}$ que baja del exponente de $x^{1/2}$.' }],
        hint: 'Escribe $\\sqrt{x} = x^{1/2}$.',
        solution: function (v) { return '$$f(x) = ' + v.c + 'x^{1/2} \\Rightarrow f\'(x) = \\frac{' + v.c + '}{2}x^{-1/2} = \\frac{' + (v.c / 2) + '}{\\sqrt{x}}$$'; }
      },
      {
        id: 'c1-s02-explog', title: 'Exponencial y logaritmo',
        vars: { a: [2, 9, 1], b: [2, 9, 1] },
        prompt: function (v) { return '<p>Deriva $f(x) = ' + v.a + 'e^x + ' + v.b + '\\ln x$.</p>'; },
        check: 'expr', domain: [0.3, 3],
        derivativeOf: function (v) { return v.a + 'e^x + ' + v.b + 'ln(x)'; },
        answer: function (v) { return v.a + 'e^x + ' + v.b + '/x'; },
        mistakes: { lnAsIs: function (v) { return v.a + 'e^x + ' + v.b + 'ln(x)'; } },
        feedback: [{ when: 'lnAsIs', say: 'La exponencial se queda igual, pero el logaritmo no: $(\\ln x)\' = 1/x$.' }],
        hint: '$(e^x)\' = e^x$ y $(\\ln x)\' = 1/x$.',
        solution: function (v) { return '$$f\'(x) = ' + v.a + 'e^x + \\frac{' + v.b + '}{x}$$'; }
      },
      {
        id: 'c1-s02-trig', title: 'Seno y coseno',
        vars: { a: [2, 9, 1], b: [2, 9, 1] },
        prompt: function (v) { return '<p>Deriva $f(x) = ' + v.a + '\\sin x + ' + v.b + '\\cos x$.</p>'; },
        check: 'expr',
        derivativeOf: function (v) { return v.a + 'sin(x) + ' + v.b + 'cos(x)'; },
        answer: function (v) { return v.a + 'cos(x) - ' + v.b + 'sin(x)'; },
        mistakes: { cosSign: function (v) { return v.a + 'cos(x) + ' + v.b + 'sin(x)'; } },
        feedback: [{ when: 'cosSign', say: 'La derivada del coseno lleva signo menos: $(\\cos x)\' = -\\sin x$.' }],
        hint: 'Seno pasa a coseno; coseno pasa a menos seno.',
        solution: function (v) { return '$$f\'(x) = ' + v.a + '\\cos x - ' + v.b + '\\sin x$$'; }
      },
      {
        id: 'c1-s02-base', title: 'Pendiente de una exponencial',
        vars: { b: [2, 10, 1] },
        where: function (v) { return v.b !== 3; },
        prompt: function (v) { return '<p>¿Cuál es la pendiente de la tangente a $y = ' + v.b + '^x$ en $x = 0$?</p>'; },
        check: 'numeric',
        answer: function (v) { return Math.log(v.b); },
        mistakes: { noLn: function () { return 1; } },
        feedback: [{ when: 'noLn', say: 'Solo para la base $e$ la pendiente en 0 es 1. Para otra base aparece $\\ln b$.' }],
        oracle: { lab: 'derivative-at', f: function (v) { return v.b + '^x'; }, a: function () { return 0; } },
        hint: '$(b^x)\' = b^x \\ln b$; evalúa en 0.',
        solution: function (v) { return '$y\' = ' + v.b + '^x\\ln ' + v.b + '$, y en $x = 0$: $\\ln ' + v.b + ' \\approx ' + fx(Math.log(v.b)) + '$.'; }
      },
      {
        id: 'c1-s02-inversas', title: 'Trigonométricas inversas',
        vars: {},
        prompt: function () { return '<p>¿Cuál es la derivada de $\\arcsin x$?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: '$\\dfrac{1}{\\sqrt{1 - x^2}}$', correct: true },
            { text: '$\\dfrac{1}{1 + x^2}$', say: 'Esa es la derivada de $\\arctan x$.' },
            { text: '$-\\dfrac{1}{\\sqrt{1 - x^2}}$', say: 'Esa es la de $\\arccos x$ (las “co” llevan menos).' },
            { text: '$\\dfrac{1}{\\cos x}$', say: '$\\arcsin$ no es $1/\\sin$: es la función inversa, no el recíproco.' }
          ];
        },
        answer: function () { return '$\\dfrac{1}{\\sqrt{1 - x^2}}$'; },
        hint: 'Piensa en cuál está definida solo para $|x| < 1$.',
        solution: function () { return '$(\\arcsin x)\' = \\dfrac{1}{\\sqrt{1 - x^2}}$, válida para $-1 < x < 1$.'; }
      }
    ],

    quiz: { tags: ['c1.S02'], count: 10 },

    errors: [
      'Derivar $\\sqrt{x}$ o $1/x^n$ sin reescribir como potencia.',
      'Bajar el exponente y olvidar restarle 1.',
      'Escribir $(\\cos x)\' = \\sin x$: le falta el signo menos.',
      'Pensar que $(a^x)\' = x\\,a^{x-1}$: eso es la regla de la potencia, y aquí la variable está en el exponente.',
      'Tomar $\\arcsin x$ como $1/\\sin x$.'
    ],

    teacher: {
      plan: [
        'Deduce $(x^2)\'$ y $(x^3)\'$ con la definición para que la regla de la potencia no sea magia.',
        'Tabla de derivadas en el pizarrón; que la completen con el lab abierto.',
        'Ronda rápida de 10 derivadas directas antes del quiz.'
      ],
      check: ['Que reescriban raíces y fracciones como potencias.', 'Que usen radianes con las trigonométricas.'],
      note: 'La regla de la cadena llega en S05; aquí todas las funciones van “solas”.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 1</em>, §3.3 “Differentiation Rules”. <a href="https://openstax.org/books/calculus-volume-1/pages/3-3-differentiation-rules">openstax.org</a> (CC BY 4.0).',
      'OpenStax. <em>Calculus Volume 1</em>, §3.5 “Derivatives of Trigonometric Functions”. <a href="https://openstax.org/books/calculus-volume-1/pages/3-5-derivatives-of-trigonometric-functions">openstax.org</a> (CC BY 4.0).',
      'OpenStax. <em>Calculus Volume 1</em>, §3.7 “Derivatives of Inverse Functions”. <a href="https://openstax.org/books/calculus-volume-1/pages/3-7-derivatives-of-inverse-functions">openstax.org</a> (CC BY 4.0).',
      'OpenStax. <em>Calculus Volume 1</em>, §3.9 “Derivatives of Exponential and Logarithmic Functions”. <a href="https://openstax.org/books/calculus-volume-1/pages/3-9-derivatives-of-exponential-and-logarithmic-functions">openstax.org</a> (CC BY 4.0).'
    ],

    prev: 'sesion-01',
    next: 'sesion-03'
  };
})();
