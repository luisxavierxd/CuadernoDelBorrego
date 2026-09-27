/* =====================================================================
   Cálculo 1 · S05 · Regla de la cadena (bloque A · tema 3.1).
   Fuente: OpenStax, Calculus Volume 1, §3.6 (CC BY-NC-SA 4.0).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 4 : d)).toString(); }

  window.SESSION_DATA = {
    slug: 'sesion-05', number: '05', group: 'A · Derivada',
    title: 'Regla de la cadena', temario: ['3.1'],
    minutes: 180,
    quote: 'Una función dentro de otra es como un engrane dentro de otro: las razones de cambio se multiplican.',
    badges: [
      'Reconocer la capa de afuera y la de adentro de una función compuesta.',
      'Aplicar $\\big(f(g(x))\\big)\' = f\'(g(x))\\,g\'(x)$.',
      'Usar la notación de Leibniz: $\\dfrac{dy}{dx} = \\dfrac{dy}{du}\\cdot\\dfrac{du}{dx}$.',
      'Combinar la cadena con el producto y el cociente.'
    ],

    lesson: [
      {
        type: 'concept', heading: 'Funciones compuestas', short: 'Afuera y adentro',
        body: [
          'En $y = \\sin(x^2)$ hay dos capas: <strong>adentro</strong>, $u = x^2$; <strong>afuera</strong>, $y = \\sin u$.',
          'Truco para encontrarlas: evalúa mentalmente en un número. Con $x = 3$ primero calculas $3^2$ (adentro) y luego el seno (afuera).',
          'La regla: $$\\frac{d}{dx}f(g(x)) = f\'(g(x))\\cdot g\'(x).$$ Derivas la capa de afuera sin tocar lo de adentro, y multiplicas por la derivada de adentro.'
        ]
      },
      {
        type: 'explainer', heading: 'Por qué se multiplican', short: 'Las capas se multiplican',
        title: 'Un tramo que se estira dos veces',
        intro: 'Sigue un cambio pequeño $dx$ a través de las dos capas.',
        diagram: 'chain-layers',
        steps: [
          { text: 'Empiezas con un cambio pequeño $dx$ en la entrada.', state: { stage: 0 } },
          { text: 'La capa de adentro lo estira por su razón de cambio: $du = h\'(x)\\,dx$.', state: { stage: 1 } },
          { text: 'La capa de afuera lo vuelve a estirar: $dy = g\'(u)\\,du$. En total $\\dfrac{dy}{dx} = g\'(u)\\cdot h\'(x)$.', state: { stage: 2 } }
        ]
      },
      {
        type: 'example', heading: 'Una potencia de un polinomio',
        problem: '<p>Deriva $y = (3x^2 + 1)^5$.</p>',
        steps: [
          { text: 'Adentro $u = 3x^2 + 1$; afuera $u^5$.' },
          { text: 'Deriva afuera dejando $u$ igual, y multiplica por $u\'$.', math: 'y\' = 5(3x^2 + 1)^4\\cdot 6x' },
          { text: 'Ordena.', math: 'y\' = 30x(3x^2 + 1)^4' }
        ],
        answer: '$y\' = 30x(3x^2 + 1)^4$',
        verify: { lab: 'derivative', f: '(3x^2 + 1)^5', d: '30x*(3x^2 + 1)^4', a: -1, b: 1 }
      },
      {
        type: 'example', heading: 'Exponencial y logaritmo',
        problem: '<p>Deriva $y = e^{x^2}$ y $z = \\ln(\\cos x)$.</p>',
        steps: [
          { text: 'Para $y$: afuera $e^u$, adentro $u = x^2$.', math: 'y\' = e^{x^2}\\cdot 2x' },
          { text: 'Para $z$: afuera $\\ln u$, adentro $u = \\cos x$.', math: 'z\' = \\frac{1}{\\cos x}\\cdot(-\\sin x) = -\\tan x' }
        ],
        answer: '$y\' = 2x\\,e^{x^2}$ y $z\' = -\\tan x$.',
        verify: { lab: 'derivative', f: 'ln(cos(x))', d: '-tan(x)', a: -1.2, b: 1.2 }
      },
      {
        type: 'example', heading: 'Una raíz',
        problem: '<p>Deriva $y = \\sqrt{x^2 + 9}$.</p>',
        steps: [
          { text: 'Escribe la raíz como potencia.', math: 'y = (x^2 + 9)^{1/2}' },
          { text: 'Cadena.', math: 'y\' = \\tfrac{1}{2}(x^2 + 9)^{-1/2}\\cdot 2x = \\frac{x}{\\sqrt{x^2 + 9}}' }
        ],
        answer: '$y\' = \\dfrac{x}{\\sqrt{x^2 + 9}}$',
        verify: { lab: 'derivative', f: 'sqrt(x^2 + 9)', d: 'x/sqrt(x^2 + 9)', a: -3, b: 3 }
      },
      {
        type: 'example', heading: 'Cadena con producto',
        problem: '<p>Deriva $y = x^2 e^{3x}$.</p>',
        steps: [
          { text: 'Es un producto; el segundo factor pide cadena: $(e^{3x})\' = 3e^{3x}$.', math: 'y\' = 2x\\,e^{3x} + x^2\\cdot 3e^{3x}' },
          { text: 'Factoriza.', math: 'y\' = x\\,e^{3x}(2 + 3x)' }
        ],
        answer: '$y\' = x\\,e^{3x}(2 + 3x)$',
        verify: { lab: 'derivative', f: 'x^2*e^(3x)', d: 'x*e^(3x)*(2 + 3x)', a: -1, b: 1 }
      },
      {
        type: 'callout', heading: 'El error más común',
        body: 'Olvidar multiplicar por la derivada de adentro. Si tu resultado de $\\big(e^{5x}\\big)\'$ es $e^{5x}$, te falta el 5. El lab de esta sesión te dice “te falta un factor” cuando pasa.'
      }
    ],

    lab: {
      type: 'chain-composition', title: 'Las capas de la cadena',
      intro: 'Escribe la capa de afuera $g(u)$ y la de adentro $h(x)$. El lab muestra cómo un tramo se estira en cada capa y compara tu derivada con la real.',
      cfg: {}
    },

    formulas: [
      { label: 'Cadena', tex: '\\big(f(g(x))\\big)\' = f\'(g(x))\\,g\'(x)' },
      { label: 'Leibniz', tex: '\\frac{dy}{dx} = \\frac{dy}{du}\\cdot\\frac{du}{dx}' },
      { label: 'Potencia general', tex: '\\big(u^n\\big)\' = n\\,u^{n-1}u\'' },
      { label: 'Exponencial', tex: '\\big(e^{u}\\big)\' = e^{u}u\'' },
      { label: 'Logaritmo', tex: '\\big(\\ln u\\big)\' = \\frac{u\'}{u}' }
    ],

    exercises: [
      {
        id: 'c1-s05-potencia', title: 'Potencia de un binomio',
        vars: { a: [2, 6, 1], b: [1, 9, 1], n: [3, 7, 1] },
        prompt: function (v) { return '<p>Deriva $f(x) = (' + v.a + 'x + ' + v.b + ')^{' + v.n + '}$.</p>'; },
        check: 'expr', domain: [-0.3, 0.6],
        derivativeOf: function (v) { return '(' + v.a + 'x + ' + v.b + ')^' + v.n; },
        answer: function (v) { return (v.n * v.a) + '*(' + v.a + 'x + ' + v.b + ')^' + (v.n - 1); },
        mistakes: { forgotInner: function (v) { return v.n + '*(' + v.a + 'x + ' + v.b + ')^' + (v.n - 1); } },
        feedback: [{ when: 'forgotInner', say: function (v) { return 'Te faltó multiplicar por la derivada de adentro, que es ' + v.a + '.'; } }],
        hint: 'Afuera $u^n$, adentro $u = ax + b$.',
        solution: function (v) { return '$$f\'(x) = ' + v.n + '(' + v.a + 'x + ' + v.b + ')^{' + (v.n - 1) + '}\\cdot ' + v.a + ' = ' + (v.n * v.a) + '(' + v.a + 'x + ' + v.b + ')^{' + (v.n - 1) + '}$$'; }
      },
      {
        id: 'c1-s05-exp', title: 'Exponencial compuesta',
        vars: { k: [2, 5, 1] },
        prompt: function (v) { return '<p>Deriva $f(x) = e^{' + v.k + 'x^2}$.</p>'; },
        check: 'expr', domain: [-0.8, 0.8],
        derivativeOf: function (v) { return 'e^(' + v.k + 'x^2)'; },
        answer: function (v) { return (2 * v.k) + 'x*e^(' + v.k + 'x^2)'; },
        mistakes: { forgotInner: function (v) { return 'e^(' + v.k + 'x^2)'; } },
        feedback: [{ when: 'forgotInner', say: 'La exponencial se queda igual, pero hay que multiplicar por la derivada del exponente.' }],
        hint: 'Afuera $e^u$, adentro $u = kx^2$.',
        solution: function (v) { return '$$f\'(x) = e^{' + v.k + 'x^2}\\cdot ' + (2 * v.k) + 'x$$'; }
      },
      {
        id: 'c1-s05-trig', title: 'Seno compuesto',
        vars: { k: [2, 9, 1] },
        prompt: function (v) { return '<p>Deriva $f(x) = \\sin(' + v.k + 'x)$.</p>'; },
        check: 'expr',
        derivativeOf: function (v) { return 'sin(' + v.k + 'x)'; },
        answer: function (v) { return v.k + '*cos(' + v.k + 'x)'; },
        mistakes: { forgotInner: function (v) { return 'cos(' + v.k + 'x)'; } },
        feedback: [{ when: 'forgotInner', say: function (v) { return 'Falta el factor ' + v.k + ' que sale de derivar lo de adentro.'; } }],
        hint: 'Adentro $u = kx$.',
        solution: function (v) { return '$$f\'(x) = \\cos(' + v.k + 'x)\\cdot ' + v.k + '$$'; }
      },
      {
        id: 'c1-s05-ln', title: 'Logaritmo compuesto',
        vars: { c: [1, 9, 1] },
        prompt: function (v) { return '<p>Deriva $f(x) = \\ln(x^2 + ' + v.c + ')$.</p>'; },
        check: 'expr',
        derivativeOf: function (v) { return 'ln(x^2 + ' + v.c + ')'; },
        answer: function (v) { return '2x/(x^2 + ' + v.c + ')'; },
        mistakes: { forgotInner: function (v) { return '1/(x^2 + ' + v.c + ')'; } },
        feedback: [{ when: 'forgotInner', say: '$(\\ln u)\' = u\'/u$: falta el $2x$ arriba.' }],
        hint: '$(\\ln u)\' = \\dfrac{u\'}{u}$.',
        solution: function (v) { return '$$f\'(x) = \\frac{2x}{x^2 + ' + v.c + '}$$'; }
      },
      {
        id: 'c1-s05-tabla', title: 'Con valores de una tabla',
        vars: { a: [1, 5, 1], b: [-3, 4, 1], c: [-4, 5, 1] },
        where: function (v) { return v.b !== 0 && v.c !== 0 && v.b !== 1 && v.c !== 1 && v.b !== v.c && v.b * v.c !== v.c && v.b * v.c !== v.b; },
        prompt: function (v) { return '<p>Sabes que $g(2) = ' + v.a + '$, $g\'(2) = ' + v.b + '$ y $f\'(' + v.a + ') = ' + v.c + '$. Si $h(x) = f(g(x))$, ¿cuánto vale $h\'(2)$?</p>'; },
        check: 'numeric', tol: { abs: 0.01 },
        answer: function (v) { return v.b * v.c; },
        mistakes: { onlyOuter: function (v) { return v.c; }, onlyInner: function (v) { return v.b; } },
        feedback: [
          { when: 'onlyOuter', say: 'Eso es solo $f\'(g(2))$; falta multiplicar por $g\'(2)$.' },
          { when: 'onlyInner', say: 'Eso es solo $g\'(2)$; falta multiplicar por $f\'(g(2))$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return v.c * v.b; } },
        hint: '$h\'(2) = f\'(g(2))\\cdot g\'(2)$.',
        solution: function (v) { return '$h\'(2) = f\'(' + v.a + ')\\cdot g\'(2) = (' + v.c + ')(' + v.b + ') = ' + v.b * v.c + '$'; }
      },
      {
        id: 'c1-s05-capas', title: 'Identificar las capas',
        vars: { n: [3, 8, 1] },
        prompt: function (v) { return '<p>En $y = \\cos^{' + v.n + '}(x)$, ¿cuál es la capa de afuera?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: '$u^{' + v.n + '}$, con $u = \\cos x$', correct: true },
            { text: '$\\cos u$, con $u = x^{' + v.n + '}$', say: '$\\cos^n x$ significa $(\\cos x)^n$, no $\\cos(x^n)$.' },
            { text: 'No tiene capas; es directa', say: 'Hay una potencia aplicada al coseno: son dos capas.' },
            { text: '$\\cos u$, con $u = x$', say: 'Eso sería solo $\\cos x$, sin la potencia.' }
          ];
        },
        answer: function (v) { return '$u^{' + v.n + '}$, con $u = \\cos x$'; },
        hint: 'Evalúa en un número: ¿qué haces primero y qué al final?',
        solution: function (v) { return 'Primero calculas $\\cos x$ y al final lo elevas a la ' + v.n + '. Afuera $u^{' + v.n + '}$: $y\' = ' + v.n + '\\cos^{' + (v.n - 1) + '}x\\cdot(-\\sin x)$.'; }
      }
    ],

    quiz: { tags: ['c1.S05'], count: 8 },

    errors: [
      'Olvidar multiplicar por la derivada de adentro.',
      'Derivar también lo de adentro dentro de la función de afuera: $(\\sin x^2)\' \\neq \\cos(2x)$.',
      'Confundir $\\sin^2 x = (\\sin x)^2$ con $\\sin(x^2)$.',
      'En productos con cadena, aplicar la cadena a todo el producto en lugar de a un solo factor.'
    ],

    teacher: {
      plan: ['Juego de “evaluar en 3” para identificar capas.', 'Explainer y lab de capas.', 'Ejemplos de menor a mayor: potencia, exponencial, logaritmo, combinados.'],
      check: ['Que escriban $u$ y $u\'$ antes de armar la derivada.'],
      note: 'La cadena al revés es el cambio de variable de S10.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 1</em>, §3.6 “The Chain Rule”. <a href="https://openstax.org/books/calculus-volume-1/pages/3-6-the-chain-rule">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-04',
    next: 'sesion-06'
  };
})();
