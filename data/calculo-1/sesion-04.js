/* =====================================================================
   Cálculo 1 · S04 · Regla del cociente (bloque A · tema 3.3).
   Fuentes: OpenStax, Calculus Volume 1, §3.3 y §3.5 (CC BY 4.0).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 4 : d)).toString(); }

  window.SESSION_DATA = {
    slug: 'sesion-04', number: '04', group: 'A · Derivada',
    title: 'Regla del cociente', temario: ['3.3'],
    minutes: 150,
    quote: 'En el cociente sí importa el orden: abajo por la derivada de arriba, menos arriba por la derivada de abajo, entre abajo al cuadrado.',
    badges: [
      'Aplicar $\\left(\\dfrac{u}{v}\\right)\' = \\dfrac{u\'v - uv\'}{v^2}$.',
      'Deducir $(\\tan x)\' = \\sec^2 x$ con la regla.',
      'Encontrar tangentes horizontales de funciones racionales.',
      'Decidir cuándo conviene reescribir en lugar de usar la regla.'
    ],

    lesson: [
      {
        type: 'concept', heading: 'La regla', short: 'La regla del cociente',
        body: [
          'Si $v(x) \\neq 0$, $$\\left(\\frac{u}{v}\\right)\' = \\frac{u\'\\,v - u\\,v\'}{v^2}.$$',
          'A diferencia del producto, aquí el orden del numerador importa: al invertirlo cambia el signo de todo.',
          'La gráfica de $f(x) = \\dfrac{x}{x^2 + 1}$ muestra lo que dice su derivada, $f\'(x) = \\dfrac{1 - x^2}{(x^2 + 1)^2}$: tangentes horizontales en $x = \\pm 1$ y pendiente 1 en el origen.'
        ],
        diagram: 'quotient-graph',
        caption: 'Donde $f\'(x) = 0$, en $x = \\pm 1$, la tangente es horizontal.'
      },
      {
        type: 'example', heading: 'Una función racional',
        problem: '<p>Deriva $y = \\dfrac{x^2 + 1}{x - 1}$.</p>',
        steps: [
          { text: 'Arriba $u = x^2 + 1$, $u\' = 2x$; abajo $v = x - 1$, $v\' = 1$.' },
          { text: 'Aplica la regla.', math: 'y\' = \\frac{2x(x - 1) - (x^2 + 1)(1)}{(x - 1)^2}' },
          { text: 'Simplifica el numerador.', math: 'y\' = \\frac{x^2 - 2x - 1}{(x - 1)^2}' }
        ],
        answer: '$y\' = \\dfrac{x^2 - 2x - 1}{(x - 1)^2}$',
        verify: { lab: 'derivative', f: '(x^2 + 1)/(x - 1)', d: '(x^2 - 2x - 1)/(x - 1)^2', a: 1.3, b: 4 }
      },
      {
        type: 'example', heading: 'La derivada de la tangente',
        problem: '<p>Usa $\\tan x = \\dfrac{\\sin x}{\\cos x}$ para deducir $(\\tan x)\'$.</p>',
        steps: [
          { text: 'Regla del cociente.', math: '(\\tan x)\' = \\frac{\\cos x\\cdot\\cos x - \\sin x\\cdot(-\\sin x)}{\\cos^2 x}' },
          { text: 'Usa $\\sin^2 x + \\cos^2 x = 1$.', math: '= \\frac{\\cos^2 x + \\sin^2 x}{\\cos^2 x} = \\frac{1}{\\cos^2 x} = \\sec^2 x' }
        ],
        answer: '$(\\tan x)\' = \\sec^2 x$',
        verify: { lab: 'derivative', f: 'sin(x)/cos(x)', d: 'sec(x)^2', a: -1.2, b: 1.2 }
      },
      {
        type: 'example', heading: 'Exponencial entre potencia',
        problem: '<p>Deriva $y = \\dfrac{e^x}{x^2}$.</p>',
        steps: [
          { text: 'Regla del cociente.', math: 'y\' = \\frac{e^x\\cdot x^2 - e^x\\cdot 2x}{x^4}' },
          { text: 'Factoriza $x\\,e^x$ y simplifica.', math: 'y\' = \\frac{x\\,e^x(x - 2)}{x^4} = \\frac{e^x(x - 2)}{x^3}' }
        ],
        answer: '$y\' = \\dfrac{e^x(x - 2)}{x^3}$',
        verify: { lab: 'derivative', f: 'e^x/x^2', d: 'e^x*(x - 2)/x^3', a: 0.4, b: 3 }
      },
      {
        type: 'example', heading: 'Tangentes horizontales',
        problem: '<p>¿En qué puntos tiene tangente horizontal $f(x) = \\dfrac{x}{x^2 + 4}$?</p>',
        steps: [
          { text: 'Deriva con la regla del cociente.', math: 'f\'(x) = \\frac{(x^2 + 4) - x(2x)}{(x^2 + 4)^2} = \\frac{4 - x^2}{(x^2 + 4)^2}' },
          { text: 'Un cociente vale cero cuando su numerador vale cero (y el denominador no).', math: '4 - x^2 = 0 \\Rightarrow x = \\pm 2' }
        ],
        answer: 'En $x = 2$ y $x = -2$, es decir en $(2, \\tfrac{1}{4})$ y $(-2, -\\tfrac{1}{4})$.',
        verify: { lab: 'derivative-at', f: 'x/(x^2 + 4)', a: 2, value: 0 }
      },
      {
        type: 'callout', heading: 'A veces conviene reescribir',
        body: 'Si el denominador es una sola potencia, divide primero: $\\dfrac{x^3 + 2x}{x} = x^2 + 2$, o $\\dfrac{5}{x^2} = 5x^{-2}$. Te ahorras la regla y los errores de signo.'
      }
    ],

    lab: {
      type: 'derivative-check', title: '¿Es tu derivada?',
      intro: 'Prueba tus derivadas de cocientes. El primer ejemplo trae el numerador al revés; mira cómo el lab detecta el signo invertido.',
      cfg: {
        presets: [
          { name: 'Cociente · orden invertido', f: 'x/(x^2 + 1)', d: '(x^2 - 1)/(x^2 + 1)^2', x: [-3, 3], a: 0.5 },
          { name: 'Racional', f: '(x^2 + 1)/(x - 1)', d: '(x^2 - 2x - 1)/(x - 1)^2', x: [1.3, 4], a: 2 },
          { name: 'Exponencial entre potencia', f: 'e^x/x^2', d: 'e^x*(x - 2)/x^3', x: [0.5, 3], a: 2 },
          { name: 'sen x / x', f: 'sin(x)/x', d: '(x*cos(x) - sin(x))/x^2', x: [0.3, 8], a: 2 }
        ]
      }
    },

    formulas: [
      { label: 'Cociente', tex: '\\left(\\frac{u}{v}\\right)\' = \\frac{u\'v - uv\'}{v^2}' },
      { label: 'Tangente', tex: '(\\tan x)\' = \\sec^2 x' },
      { label: 'Recíproco', tex: '\\left(\\frac{1}{v}\\right)\' = -\\frac{v\'}{v^2}' }
    ],

    exercises: [
      {
        id: 'c1-s04-lineal', title: 'Cociente de lineales',
        vars: { a: [1, 6, 1], b: [1, 9, 1], c: [1, 6, 1] },
        where: function (v) { return v.a * v.c !== v.b; },
        prompt: function (v) { return '<p>Deriva $f(x) = \\dfrac{' + v.a + 'x + ' + v.b + '}{x + ' + v.c + '}$.</p>'; },
        check: 'expr',
        derivativeOf: function (v) { return '(' + v.a + 'x + ' + v.b + ')/(x + ' + v.c + ')'; },
        answer: function (v) { return (v.a * v.c - v.b) + '/(x + ' + v.c + ')^2'; },
        mistakes: { swapped: function (v) { return (v.b - v.a * v.c) + '/(x + ' + v.c + ')^2'; } },
        feedback: [{ when: 'swapped', say: 'Invertiste el orden del numerador: es $u\'v - uv\'$, no $uv\' - u\'v$.' }],
        hint: 'Arriba $u = ax + b$, abajo $v = x + c$.',
        solution: function (v) { return '$$f\'(x) = \\frac{' + v.a + '(x + ' + v.c + ') - (' + v.a + 'x + ' + v.b + ')(1)}{(x + ' + v.c + ')^2} = \\frac{' + (v.a * v.c - v.b) + '}{(x + ' + v.c + ')^2}$$'; }
      },
      {
        id: 'c1-s04-trig', title: 'Seno entre polinomio',
        vars: { k: [1, 5, 1] },
        prompt: function (v) { return '<p>Deriva $f(x) = \\dfrac{\\sin x}{x + ' + v.k + '}$.</p>'; },
        check: 'expr',
        derivativeOf: function (v) { return 'sin(x)/(x + ' + v.k + ')'; },
        answer: function (v) { return '((x + ' + v.k + ')*cos(x) - sin(x))/(x + ' + v.k + ')^2'; },
        mistakes: { noSquare: function (v) { return '((x + ' + v.k + ')*cos(x) - sin(x))/(x + ' + v.k + ')'; } },
        feedback: [{ when: 'noSquare', say: 'El denominador va al cuadrado: $v^2$.' }],
        hint: '$u = \\sin x$, $v = x + k$.',
        solution: function (v) { return '$$f\'(x) = \\frac{(x + ' + v.k + ')\\cos x - \\sin x}{(x + ' + v.k + ')^2}$$'; }
      },
      {
        id: 'c1-s04-tabla', title: 'Con valores de una tabla',
        vars: { u: [-4, 6, 1], du: [-3, 5, 1], w: [1, 5, 1], dw: [-3, 4, 1] },
        where: function (v) {
          var ans = (v.du * v.w - v.u * v.dw) / (v.w * v.w), sw = (v.u * v.dw - v.du * v.w) / (v.w * v.w), ns = (v.du * v.w - v.u * v.dw) / v.w;
          return Math.abs(ans) > 0.05 && Math.abs(ans - sw) > 0.05 && Math.abs(ans - ns) > 0.05 && Math.abs(sw - ns) > 0.05;
        },
        prompt: function (v) { return '<p>Sabes que $u(1) = ' + v.u + '$, $u\'(1) = ' + v.du + '$, $w(1) = ' + v.w + '$ y $w\'(1) = ' + v.dw + '$. Si $f = u/w$, ¿cuánto vale $f\'(1)$?</p>'; },
        check: 'numeric', tol: { abs: 0.01 },
        answer: function (v) { return (v.du * v.w - v.u * v.dw) / (v.w * v.w); },
        mistakes: {
          swapped: function (v) { return (v.u * v.dw - v.du * v.w) / (v.w * v.w); },
          noSquare: function (v) { return (v.du * v.w - v.u * v.dw) / v.w; }
        },
        feedback: [
          { when: 'swapped', say: 'Invertiste el orden del numerador; el signo sale al revés.' },
          { when: 'noSquare', say: 'Te faltó elevar al cuadrado el denominador.' }
        ],
        oracle: { lab: 'value', value: function (v) { return v.du / v.w - v.u * v.dw / (v.w * v.w); } },
        hint: 'Sustituye en $\\dfrac{u\'w - uw\'}{w^2}$.',
        solution: function (v) { return '$f\'(1) = \\dfrac{(' + v.du + ')(' + v.w + ') - (' + v.u + ')(' + v.dw + ')}{' + v.w + '^2} = ' + fx((v.du * v.w - v.u * v.dw) / (v.w * v.w)) + '$'; }
      },
      {
        id: 'c1-s04-horizontal', title: 'Tangente horizontal',
        vars: { k: [1, 16, 1] },
        prompt: function (v) { return '<p>$f(x) = \\dfrac{x}{x^2 + ' + v.k + '}$ tiene tangente horizontal en un $x > 0$. ¿En cuál?</p>'; },
        check: 'numeric',
        answer: function (v) { return Math.sqrt(v.k); },
        mistakes: { noSqrt: function (v) { return v.k; } },
        where: function (v) { return v.k !== 1; },
        feedback: [{ when: 'noSqrt', say: 'Al despejar $k - x^2 = 0$ falta sacar la raíz: $x = \\sqrt{k}$.' }],
        oracle: { lab: 'value', value: function (v) { return Math.sqrt(v.k); } },
        hint: 'El numerador de $f\'$ es $k - x^2$.',
        solution: function (v) { return '$f\'(x) = \\dfrac{' + v.k + ' - x^2}{(x^2 + ' + v.k + ')^2} = 0 \\Rightarrow x = \\sqrt{' + v.k + '} \\approx ' + fx(Math.sqrt(v.k)) + '$'; }
      },
      {
        id: 'c1-s04-concepto', title: 'Concepto',
        vars: {},
        prompt: function () { return '<p>¿Cuál es la derivada de $\\dfrac{u}{v}$?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: '$\\dfrac{u\'v - uv\'}{v^2}$', correct: true },
            { text: '$\\dfrac{uv\' - u\'v}{v^2}$', say: 'Ese es el orden invertido: da la derivada con el signo cambiado.' },
            { text: '$\\dfrac{u\'}{v\'}$', say: 'Como en el producto, no se derivan “por separado”.' },
            { text: '$\\dfrac{u\'v + uv\'}{v^2}$', say: 'El numerador lleva resta, no suma.' }
          ];
        },
        answer: function () { return '$\\dfrac{u\'v - uv\'}{v^2}$'; },
        hint: 'Abajo por la derivada de arriba, menos arriba por la derivada de abajo.',
        solution: function () { return '$\\left(\\dfrac{u}{v}\\right)\' = \\dfrac{u\'v - uv\'}{v^2}$.'; }
      }
    ],

    quiz: { tags: ['c1.S04'], count: 8 },

    errors: [
      'Invertir el orden del numerador: $uv\' - u\'v$ da la derivada con signo contrario.',
      'Olvidar elevar al cuadrado el denominador.',
      'Derivar numerador y denominador por separado: $(u/v)\' \\neq u\'/v\'$.',
      'Usar la regla cuando bastaba reescribir: $\\dfrac{3}{x^2} = 3x^{-2}$.'
    ],

    teacher: {
      plan: ['Repasa la regla del producto y muestra que $u/v = u\\cdot v^{-1}$.', 'Deduce $(\\tan x)\'$ en el pizarrón.', 'Ejercicios de tangentes horizontales.'],
      check: ['Que escriban $u$, $u\'$, $v$, $v\'$ antes de sustituir.', 'Que no simplifiquen “cancelando” términos de sumas.'],
      note: 'La combinación con la cadena llega en S05.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 1</em>, §3.3 “Differentiation Rules” (The Quotient Rule). <a href="https://openstax.org/books/calculus-volume-1/pages/3-3-differentiation-rules">openstax.org</a> (CC BY 4.0).',
      'OpenStax. <em>Calculus Volume 1</em>, §3.5 “Derivatives of Trigonometric Functions”. <a href="https://openstax.org/books/calculus-volume-1/pages/3-5-derivatives-of-trigonometric-functions">openstax.org</a> (CC BY 4.0).'
    ],

    prev: 'sesion-03',
    next: 'sesion-05'
  };
})();
