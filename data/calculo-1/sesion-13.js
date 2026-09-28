/* =====================================================================
   Cálculo 1 · S13 · Fracciones parciales (bloque C · tema 5.6).
   Fuente: OpenStax, Calculus Volume 2, §3.4 (CC BY-NC-SA 4.0).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 4 : d)).toString(); }
  var OS = 'https://openstax.org/books/calculus-volume-2/pages/';

  window.SESSION_DATA = {
    slug: 'sesion-13', number: '13', group: 'C · Integral',
    title: 'Fracciones parciales', temario: ['5.6'],
    minutes: 180,
    quote: 'Una fracción difícil de integrar suele ser la suma de varias fáciles.',
    badges: [
      'Descomponer un cociente de polinomios en fracciones simples.',
      'Encontrar los coeficientes evaluando en las raíces (“tapar”).',
      'Manejar factores repetidos y dividir primero cuando el grado de arriba no es menor.',
      'Integrar cada fracción como un logaritmo o una potencia.'
    ],

    lesson: [
      {
        "type": "warmup",
        "heading": "Antes de empezar",
        "short": "Antes de empezar",
        "idea": "Una fracción de polinomios difícil se <strong>parte en fracciones sencillas</strong> que ya sabes integrar.",
        "recall": [
          "Sumar fracciones con denominador común.",
          "Factorizar polinomios: $x^2 - 1 = (x - 1)(x + 1)$.",
          "$\\int \\dfrac{dx}{x - a} = \\ln|x - a| + C$."
        ],
        "why": "Aparece en modelos de crecimiento con límite (logístico), en circuitos eléctricos y en la transformada de Laplace que verás en ecuaciones diferenciales."
      },
      {
        "type": "concept",
        "heading": "Imagínalo así",
        "short": "Imagínalo así",
        "body": [
          "Sumar fracciones es fácil: $\\tfrac{1}{x - 1} - \\tfrac{1}{x + 1} = \\tfrac{2}{x^2 - 1}$. Fracciones parciales hace el camino de regreso: a partir de $\\tfrac{2}{x^2 - 1}$, recupera las dos fracciones sencillas.",
          "Esas fracciones sencillas se integran con logaritmos. Así, una integral que parecía imposible se vuelve una suma de logaritmos.",
          "Las constantes ($A$, $B$…) se encuentran igualando: multiplicas todo por el denominador y le das valores convenientes a $x$ (los que hacen cero algún factor)."
        ]
      },
      {
        type: 'concept', heading: 'La idea', short: 'La idea',
        body: [
          'Si el denominador se factoriza, la fracción se reparte: $$\\frac{1}{x(x + 1)} = \\frac{1}{x} - \\frac{1}{x + 1}.$$ Cada pedazo se integra como un logaritmo.',
          'Receta, cuando el grado de arriba es menor que el de abajo:'
        ],
        list: [
          '<strong>Factor lineal</strong> $(x - r)$: aporta $\\dfrac{A}{x - r}$.',
          '<strong>Factor repetido</strong> $(x - r)^2$: aporta $\\dfrac{A}{x - r} + \\dfrac{B}{(x - r)^2}$.',
          '<strong>Cuadrático sin raíces</strong> $x^2 + c$: aporta $\\dfrac{Ax + B}{x^2 + c}$.',
          'Si el grado de arriba es mayor o igual, <strong>divide primero</strong>.'
        ]
      },
      {
        type: 'explainer', heading: 'Dos fáciles hacen una difícil', short: 'La suma',
        title: '1/x − 1/(x + 1) = 1/(x(x + 1))',
        intro: 'Grafica las dos fracciones simples y súmalas punto por punto.',
        diagram: 'partial-fractions',
        steps: [
          { text: 'Dos curvas que sabes integrar: $\\tfrac{1}{x}$ y $-\\tfrac{1}{x + 1}$.', state: { stage: 0 } },
          { text: 'Su suma, punto por punto, es exactamente $\\tfrac{1}{x(x + 1)}$.', state: { stage: 1 } },
          { text: 'Integrar la suma es integrar cada pedazo: $\\ln|x| - \\ln|x + 1| + C$.', state: { stage: 2 } }
        ]
      },
      {
        "type": "recipe",
        "heading": "Receta: fracciones parciales",
        "short": "Receta",
        "steps": [
          {
            "text": "Si el grado de arriba es mayor o igual que el de abajo, primero divide los polinomios."
          },
          {
            "text": "Factoriza el denominador."
          },
          {
            "text": "Escribe la forma: un $\\dfrac{A}{x - a}$ por cada factor lineal; si un factor se repite, $\\dfrac{A}{x - a} + \\dfrac{B}{(x - a)^2}$; un cuadrático sin raíces lleva $\\dfrac{Bx + C}{x^2 + \\ldots}$."
          },
          {
            "text": "Multiplica por el denominador y encuentra las constantes dando valores a $x$.",
            "tip": "Usa las raíces de cada factor: hacen cero todo menos un término."
          },
          {
            "text": "Integra cada fracción: casi siempre salen logaritmos (y a veces un arcotangente)."
          }
        ]
      },
      {
        type: 'example', heading: 'El caso básico',
        problem: '<p>Calcula $\\displaystyle\\int \\frac{dx}{x(x + 1)}$.</p>',
        steps: [
          { text: 'Plantea $\\dfrac{1}{x(x + 1)} = \\dfrac{A}{x} + \\dfrac{B}{x + 1}$, o sea $1 = A(x + 1) + Bx$.' },
          { text: 'Evalúa en las raíces: con $x = 0$, $A = 1$; con $x = -1$, $B = -1$.' },
          { text: 'Integra cada pedazo.', math: '\\int \\left(\\frac{1}{x} - \\frac{1}{x + 1}\\right)dx = \\ln|x| - \\ln|x + 1| + C' }
        ],
        answer: '$\\ln|x| - \\ln|x + 1| + C = \\ln\\left|\\dfrac{x}{x + 1}\\right| + C$',
        verify: { lab: 'antiderivative', f: '1/(x*(x + 1))', F: 'ln(x) - ln(x + 1)', a: 0.5, b: 3 }
      },
      {
        type: 'example', heading: 'Con coeficientes',
        problem: '<p>Calcula $\\displaystyle\\int \\frac{3x + 5}{(x + 1)(x + 3)}\\,dx$.</p>',
        steps: [
          { text: '$3x + 5 = A(x + 3) + B(x + 1)$.' },
          { text: 'Con $x = -1$: $2 = 2A$, $A = 1$. Con $x = -3$: $-4 = -2B$, $B = 2$.' },
          { text: 'Integra.', math: '\\int \\left(\\frac{1}{x + 1} + \\frac{2}{x + 3}\\right)dx = \\ln|x + 1| + 2\\ln|x + 3| + C' }
        ],
        answer: '$\\ln|x + 1| + 2\\ln|x + 3| + C$',
        verify: { lab: 'antiderivative', f: '(3x + 5)/((x + 1)*(x + 3))', F: 'ln(x + 1) + 2*ln(x + 3)', a: 0, b: 3 }
      },
      {
        type: 'example', heading: 'Un factor repetido',
        problem: '<p>Calcula $\\displaystyle\\int \\frac{dx}{x(x + 1)^2}$.</p>',
        steps: [
          { text: 'Con el factor repetido: $\\dfrac{1}{x(x + 1)^2} = \\dfrac{A}{x} + \\dfrac{B}{x + 1} + \\dfrac{C}{(x + 1)^2}$.' },
          { text: '$1 = A(x + 1)^2 + Bx(x + 1) + Cx$. Con $x = 0$: $A = 1$. Con $x = -1$: $C = -1$. Comparando los $x^2$: $A + B = 0$, así que $B = -1$.' },
          { text: 'Integra; el último término es una potencia.', math: '\\ln|x| - \\ln|x + 1| + \\frac{1}{x + 1} + C' }
        ],
        answer: '$\\ln|x| - \\ln|x + 1| + \\dfrac{1}{x + 1} + C$',
        verify: { lab: 'antiderivative', f: '1/(x*(x + 1)^2)', F: 'ln(x) - ln(x + 1) + 1/(x + 1)', a: 0.5, b: 3 }
      },
      {
        type: 'example', heading: 'Primero divide',
        problem: '<p>Calcula $\\displaystyle\\int \\frac{x^2}{x + 1}\\,dx$.</p>',
        steps: [
          { text: 'El grado de arriba (2) no es menor que el de abajo (1): divide.', math: '\\frac{x^2}{x + 1} = x - 1 + \\frac{1}{x + 1}' },
          { text: 'Integra término a término.', math: '\\frac{x^2}{2} - x + \\ln|x + 1| + C' }
        ],
        answer: '$\\dfrac{x^2}{2} - x + \\ln|x + 1| + C$',
        verify: { lab: 'antiderivative', f: 'x^2/(x + 1)', F: 'x^2/2 - x + ln(x + 1)', a: 0, b: 3 }
      },
      {
        type: 'example', heading: 'Integral definida',
        problem: '<p>Calcula $\\displaystyle\\int_1^2 \\frac{dx}{x(x + 1)}$.</p>',
        steps: [
          { text: 'Con la antiderivada del primer ejemplo.', math: '\\left[\\ln\\frac{x}{x + 1}\\right]_1^2 = \\ln\\frac{2}{3} - \\ln\\frac{1}{2} = \\ln\\frac{4}{3}' }
        ],
        answer: '$\\ln\\tfrac{4}{3} \\approx ' + fx(Math.log(4 / 3)) + '$',
        verify: { lab: 'antiderivative', f: '1/(x*(x + 1))', F: 'ln(x) - ln(x + 1)', a: 1, b: 2, value: Math.log(4 / 3) }
      },
      {
        type: 'callout', heading: 'Revisa antes si es un cambio de variable',
        body: '$\\displaystyle\\int \\frac{2x + 3}{x^2 + 3x}\\,dx$ se podría descomponer, pero el numerador es justo la derivada del denominador: con $u = x^2 + 3x$ sale $\\ln|x^2 + 3x| + C$ en un paso.'
      },
      {
        "type": "faq",
        "heading": "Dudas comunes",
        "short": "Dudas comunes",
        "items": [
          {
            "q": "¿Cómo compruebo mis constantes?",
            "a": "Suma las fracciones que obtuviste: debe salir la fracción original."
          },
          {
            "q": "¿Por qué hay que dividir primero?",
            "a": "Las fracciones parciales solo funcionan si el grado de arriba es menor que el de abajo. Si no, la división te da un polinomio (fácil de integrar) más una fracción que sí cumple."
          },
          {
            "q": "¿Y si el denominador no se puede factorizar?",
            "a": "Un cuadrático sin raíces reales se queda como está; su parte se integra con logaritmo y arcotangente."
          }
        ]
      },
      {
        "type": "recap",
        "heading": "Lo que te llevas",
        "short": "Resumen",
        "points": [
          "Factoriza el denominador (divide antes si hace falta).",
          "Una fracción sencilla por factor; los repetidos llevan varias.",
          "Constantes: multiplica y evalúa en las raíces.",
          "Cada fracción sencilla se integra con $\\ln$."
        ]
      }
    ],

    lab: {
      type: 'antiderivative-check', title: '¿Es tu antiderivada?',
      intro: 'Escribe tu suma de logaritmos (y potencias, si hubo factor repetido). Si olvidaste un coeficiente, el lab te dice que “te sobra un factor”.',
      cfg: {
        presets: [
          { name: '1/(x(x + 1))', f: '1/(x*(x + 1))', F: 'ln(x) - ln(x + 1)', a: 0.5, b: 3 },
          { name: '(3x + 5)/((x + 1)(x + 3))', f: '(3x + 5)/((x + 1)*(x + 3))', F: 'ln(x + 1) + 2*ln(x + 3)', a: 0, b: 3 },
          { name: '1/(x² − 4) · error típico', f: '1/(x^2 - 4)', F: 'ln(x - 2) - ln(x + 2)', a: 2.5, b: 5 },
          { name: 'Factor repetido', f: '1/(x*(x + 1)^2)', F: 'ln(x) - ln(x + 1) + 1/(x + 1)', a: 0.5, b: 3 },
          { name: 'Primero divide', f: 'x^2/(x + 1)', F: 'x^2/2 - x + ln(x + 1)', a: 0, b: 3 }
        ]
      }
    },

    formulas: [
      { label: 'Lineales distintos', tex: '\\frac{P(x)}{(x - r)(x - s)} = \\frac{A}{x - r} + \\frac{B}{x - s}' },
      { label: 'Repetido', tex: '\\frac{A}{x - r} + \\frac{B}{(x - r)^2}' },
      { label: 'Logaritmo', tex: '\\int \\frac{dx}{x - r} = \\ln|x - r| + C' },
      { label: 'Potencia', tex: '\\int \\frac{dx}{(x - r)^2} = -\\frac{1}{x - r} + C' }
    ],

    exercises: [
      {
        id: 'c1-s13-basica', title: 'Dos factores lineales',
        vars: { k: [2, 6, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int \\frac{dx}{x(x + ' + v.k + ')}$ para $x > 0$.</p>'; },
        check: 'expr', domain: [0.5, 3],
        integrand: function (v) { return '1/(x*(x + ' + v.k + '))'; },
        answer: function (v) { return '(ln(x) - ln(x + ' + v.k + '))/' + v.k; },
        mistakes: { noCoef: function (v) { return 'ln(x) - ln(x + ' + v.k + ')'; } },
        feedback: [{ when: 'noCoef', say: function (v) { return 'Los coeficientes son $A = \\tfrac{1}{' + v.k + '}$ y $B = -\\tfrac{1}{' + v.k + '}$, no 1 y −1.'; } }],
        hint: '$1 = A(x + k) + Bx$; evalúa en $x = 0$ y en $x = -k$.',
        solution: function (v) { return '$A = \\tfrac{1}{' + v.k + '}$, $B = -\\tfrac{1}{' + v.k + '}$: $$\\frac{1}{' + v.k + '}\\big(\\ln x - \\ln(x + ' + v.k + ')\\big) + C$$'; }
      },
      {
        id: 'c1-s13-coef', title: 'Encuentra un coeficiente',
        vars: { p: [1, 6, 1], q: [1, 9, 1] },
        where: function (v) { return (v.p + v.q) % 3 === 0 && (v.q - 2 * v.p) % 3 === 0 && v.p + v.q !== 2 * v.p - v.q; },
        prompt: function (v) { return '<p>Si $\\dfrac{' + v.p + 'x + ' + v.q + '}{(x - 1)(x + 2)} = \\dfrac{A}{x - 1} + \\dfrac{B}{x + 2}$, ¿cuánto vale $A$?</p>'; },
        check: 'numeric', tol: { abs: 0.01 },
        answer: function (v) { return (v.p + v.q) / 3; },
        mistakes: { gaveB: function (v) { return (2 * v.p - v.q) / 3; } },
        feedback: [{ when: 'gaveB', say: 'Ese es $B$ (evaluar en $x = -2$). Para $A$, evalúa en $x = 1$.' }],
        oracle: { lab: 'value', value: function (v) { var e = 1e-7, x = 1 + e; return Math.round(((v.p * x + v.q) / ((x - 1) * (x + 2))) * e * 1e6) / 1e6; } },
        hint: 'Multiplica todo por $(x - 1)(x + 2)$ y evalúa en $x = 1$.',
        solution: function (v) { return '$' + v.p + 'x + ' + v.q + ' = A(x + 2) + B(x - 1)$. Con $x = 1$: $' + (v.p + v.q) + ' = 3A$, $A = ' + (v.p + v.q) / 3 + '$.'; }
      },
      {
        id: 'c1-s13-definida', title: 'Integral definida',
        vars: { b: [2, 9, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int_1^{' + v.b + '} \\frac{dx}{x(x + 1)}$.</p>'; },
        check: 'numeric', tol: { rel: 0.001 },
        answer: function (v) { return Math.log(2 * v.b / (v.b + 1)); },
        oracle: { lab: 'integral', f: function () { return '1/(x*(x + 1))'; }, a: function () { return 1; }, b: function (v) { return v.b; } },
        hint: '$F(x) = \\ln\\dfrac{x}{x + 1}$.',
        solution: function (v) { return '$\\ln\\tfrac{' + v.b + '}{' + (v.b + 1) + '} - \\ln\\tfrac{1}{2} = \\ln\\tfrac{' + 2 * v.b + '}{' + (v.b + 1) + '} \\approx ' + fx(Math.log(2 * v.b / (v.b + 1))) + '$.'; }
      },
      {
        id: 'c1-s13-diferencia', title: 'Diferencia de cuadrados',
        vars: { a: [1, 4, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int \\frac{dx}{x^2 - ' + v.a * v.a + '}$ para $x > ' + v.a + '$.</p>'; },
        check: 'expr', domain: [5, 8],
        integrand: function (v) { return '1/(x^2 - ' + v.a * v.a + ')'; },
        answer: function (v) { return '(ln(x - ' + v.a + ') - ln(x + ' + v.a + '))/' + 2 * v.a; },
        mistakes: { noCoef: function (v) { return 'ln(x - ' + v.a + ') - ln(x + ' + v.a + ')'; } },
        feedback: [{ when: 'noCoef', say: function (v) { return 'Los coeficientes son $\\pm\\tfrac{1}{' + 2 * v.a + '}$.'; } }],
        hint: '$x^2 - a^2 = (x - a)(x + a)$.',
        solution: function (v) { return '$A = \\tfrac{1}{' + 2 * v.a + '}$, $B = -\\tfrac{1}{' + 2 * v.a + '}$: $$\\frac{1}{' + 2 * v.a + '}\\ln\\frac{x - ' + v.a + '}{x + ' + v.a + '} + C$$'; }
      },
      {
        id: 'c1-s13-divide', title: 'Primero divide',
        vars: { k: [1, 5, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int \\frac{x + ' + (v.k + 1) + '}{x + 1}\\,dx$ para $x > -1$.</p>'; },
        check: 'expr', domain: [0, 3],
        integrand: function (v) { return '(x + ' + (v.k + 1) + ')/(x + 1)'; },
        answer: function (v) { return 'x + ' + v.k + '*ln(x + 1)'; },
        hint: '$\\dfrac{x + k + 1}{x + 1} = 1 + \\dfrac{k}{x + 1}$.',
        solution: function (v) { return '$$\\int\\left(1 + \\frac{' + v.k + '}{x + 1}\\right)dx = x + ' + v.k + '\\ln|x + 1| + C$$'; }
      },
      {
        id: 'c1-s13-forma', title: 'Plantear la descomposición',
        vars: {},
        prompt: function () { return '<p>¿Cuál es la forma correcta para descomponer $\\dfrac{5}{x(x - 1)^2}$?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: '$\\dfrac{A}{x} + \\dfrac{B}{x - 1} + \\dfrac{C}{(x - 1)^2}$', correct: true },
            { text: '$\\dfrac{A}{x} + \\dfrac{B}{(x - 1)^2}$', say: 'Un factor repetido necesita las dos potencias: $(x - 1)$ y $(x - 1)^2$.' },
            { text: '$\\dfrac{A}{x} + \\dfrac{B}{x - 1}$', say: 'Falta el término del factor repetido.' },
            { text: '$\\dfrac{Ax + B}{x(x - 1)^2}$', say: 'Eso no separa nada.' }
          ];
        },
        answer: function () { return '$\\dfrac{A}{x} + \\dfrac{B}{x - 1} + \\dfrac{C}{(x - 1)^2}$'; },
        hint: 'Cada potencia del factor repetido aporta un término.',
        solution: function () { return 'Con $5 = A(x - 1)^2 + Bx(x - 1) + Cx$: $A = 5$, $C = 5$, $B = -5$.'; }
      }
    ],

    quiz: { tags: ['c1.S13'], count: 8 },

    errors: [
      'Olvidar el término $\\dfrac{B}{(x - r)^2}$ en un factor repetido.',
      'Descomponer sin dividir primero cuando el grado de arriba no es menor.',
      'Escribir $\\int \\dfrac{2}{x + 3}dx = \\ln|x + 3|$: el coeficiente se queda.',
      'Olvidar el valor absoluto del logaritmo cuando $x$ puede ser negativo.'
    ],

    teacher: {
      plan: ['Sumar fracciones al revés: de dos simples a una compuesta.', 'Explainer de la suma de curvas.', 'Método de “tapar” para los coeficientes.', 'Factor repetido y división previa.'],
      check: ['Que verifiquen la descomposición sumando de nuevo las fracciones.'],
      note: 'Estas integrales aparecen en S15 y en ecuaciones diferenciales (Cálculo 3).'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 2</em>, §3.4 “Partial Fractions”. <a href="' + OS + '3-4-partial-fractions">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-12',
    next: 'sesion-14'
  };
})();
