/* =====================================================================
   Cálculo 1 · S06 · Derivación implícita (bloque A · tema 3.5).
   Fuente: OpenStax, Calculus Volume 1, §3.8 (CC BY-NC-SA 4.0).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 4 : d)).toString(); }
  // Ternas pitagóricas: puntos con coordenadas enteras sobre círculos x² + y² = r²
  var TRIPLES = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [12, 5, 13]];

  window.SESSION_DATA = {
    slug: 'sesion-06', number: '06', group: 'A · Derivada',
    title: 'Derivación implícita', temario: ['3.5'],
    minutes: 150,
    quote: 'Cuando no puedes despejar y, no hace falta: derivas la ecuación tal cual y recuerdas que y depende de x.',
    badges: [
      'Derivar ambos lados de una ecuación tratando a $y$ como función de $x$.',
      'Aplicar la cadena a términos con $y$: $(y^n)\' = n\\,y^{n-1}y\'$.',
      'Despejar $y\'$ y evaluarla en un punto de la curva.',
      'Escribir la recta tangente a una curva implícita.'
    ],

    lesson: [
      {
        "type": "warmup",
        "heading": "Antes de empezar",
        "short": "Antes de empezar",
        "idea": "Cuando $y$ no está despejada, derivas <strong>ambos lados</strong> de la ecuación y despejas $y'$ al final.",
        "recall": [
          "La regla de la cadena (S05): $y$ depende de $x$, así que $y^2$ deriva a $2y\\,y'$.",
          "La regla del producto (S03), para términos como $xy$.",
          "Despejar una letra de una ecuación lineal."
        ],
        "why": "Muchas curvas no se pueden escribir como $y = f(x)$: círculos, elipses, órbitas. También es la base de las \"razones relacionadas\": una escalera que resbala, un globo que se infla, una sombra que crece."
      },
      {
        "type": "concept",
        "heading": "Imagínalo así",
        "short": "Imagínalo así",
        "body": [
          "En $x^2 + y^2 = 25$ no te dicen cuánto vale $y$, pero sí te dicen cómo están <em>amarradas</em> $x$ y $y$: si te mueves por el círculo, cuando $x$ cambia, $y$ también tiene que cambiar para que la suma siga dando 25.",
          "Por eso tratamos a $y$ como una función de $x$ que no conocemos. Al derivar un término con $y$ aparece la regla de la cadena: la derivada de $y^2$ es $2y$ <em>por</em> $y'$, igual que la derivada de $(\\text{algo})^2$ es $2(\\text{algo})$ por la derivada de ese algo.",
          "Al final, la $y'$ puede depender de $x$ y de $y$. Es normal: para saber la pendiente necesitas saber en qué punto de la curva estás."
        ]
      },
      {
        type: 'concept', heading: 'La idea', short: 'Curvas implícitas',
        body: [
          'Una ecuación como $x^2 + y^2 = 25$ define una curva, pero no una sola función $y(x)$: para cada $x$ hay dos valores de $y$.',
          'La <strong>derivación implícita</strong> evita despejar: derivas los dos lados respecto a $x$ pensando que $y = y(x)$. Cada vez que derivas algo con $y$ aparece un $y\'$ por la regla de la cadena: $$\\frac{d}{dx}\\big(y^2\\big) = 2y\\,y\'.$$',
          'Al final despejas $y\'$. El resultado suele depender de $x$ y de $y$.'
        ]
      },
      {
        type: 'explainer', heading: 'El círculo, punto por punto', short: 'La tangente al círculo',
        title: '$x^2 + y^2 = 25$',
        intro: 'Derivando: $2x + 2y\\,y\' = 0$, así que $y\' = -\\dfrac{x}{y}$. Mira cómo cambia la tangente.',
        diagram: 'implicit-circle',
        steps: [
          { text: 'En $(3, 4)$: $y\' = -\\tfrac{3}{4}$. La tangente baja.', state: { t: 0.9273 } },
          { text: 'En $(0, 5)$, arriba del círculo: $y\' = 0$, tangente horizontal.', state: { t: 1.5708 } },
          { text: 'En $(-3, 4)$: $y\' = \\tfrac{3}{4}$. Del otro lado la tangente sube.', state: { t: 2.2143 } },
          { text: 'Cerca de $(5, 0)$ la tangente es casi vertical: $y \\to 0$ y $-x/y$ se dispara.', state: { t: 0.05 } }
        ]
      },
      {
        "type": "recipe",
        "heading": "Receta: derivación implícita",
        "short": "Receta",
        "steps": [
          {
            "text": "Deriva cada término de ambos lados respecto a $x$."
          },
          {
            "text": "Cada vez que derives algo con $y$, multiplica por $y'$.",
            "tip": "$(y^3)' = 3y^2\\,y'$; $(\\sin y)' = \\cos y\\,y'$; una constante sigue derivando a 0."
          },
          {
            "text": "Los términos con $x$ y $y$ juntos ($xy$, $x^2y$) llevan regla del producto."
          },
          {
            "text": "Pasa todos los términos con $y'$ a un lado y lo demás al otro."
          },
          {
            "text": "Factoriza $y'$ y divide. Si te dan un punto, sustitúyelo al final."
          }
        ]
      },
      {
        type: 'example', heading: 'Tangente a un círculo',
        problem: '<p>Encuentra la recta tangente a $x^2 + y^2 = 25$ en el punto $(3, 4)$.</p>',
        steps: [
          { text: 'Deriva ambos lados respecto a $x$.', math: '2x + 2y\\,y\' = 0' },
          { text: 'Despeja $y\'$.', math: 'y\' = -\\frac{x}{y}' },
          { text: 'Evalúa en $(3, 4)$ y arma la recta.', math: 'y\' = -\\tfrac{3}{4} \\qquad y = 4 - \\tfrac{3}{4}(x - 3)' }
        ],
        answer: 'La tangente es $y = -\\tfrac{3}{4}x + \\tfrac{25}{4}$.',
        verify: { lab: 'implicit', eq: 'x^2 + y^2 = 25', d: '-x/y', x0: 3, y0: 4, slope: -0.75 }
      },
      {
        type: 'example', heading: 'Un término con producto',
        problem: '<p>Encuentra $y\'$ si $x^2 + xy + y^2 = 7$ y evalúala en $(1, 2)$.</p>',
        steps: [
          { text: 'El término $xy$ pide regla del producto: $(xy)\' = y + x\\,y\'$.', math: '2x + y + x\\,y\' + 2y\\,y\' = 0' },
          { text: 'Agrupa los términos con $y\'$ y despeja.', math: 'y\' = -\\frac{2x + y}{x + 2y}' },
          { text: 'En $(1, 2)$.', math: 'y\' = -\\frac{2 + 2}{1 + 4} = -\\frac{4}{5}' }
        ],
        answer: '$y\' = -\\dfrac{2x + y}{x + 2y}$; en $(1, 2)$ vale $-\\tfrac{4}{5}$.',
        verify: { lab: 'implicit', eq: 'x^2 + x*y + y^2 = 7', d: '-(2x + y)/(x + 2y)', x0: 1, y0: 2, slope: -0.8 }
      },
      {
        type: 'example', heading: 'La hoja de Descartes',
        problem: '<p>Encuentra la pendiente de $x^3 + y^3 = 6xy$ en $(3, 3)$.</p>',
        steps: [
          { text: 'Deriva; el lado derecho es un producto.', math: '3x^2 + 3y^2y\' = 6y + 6x\\,y\'' },
          { text: 'Despeja $y\'$.', math: 'y\' = \\frac{2y - x^2}{y^2 - 2x}' },
          { text: 'En $(3, 3)$.', math: 'y\' = \\frac{6 - 9}{9 - 6} = -1' }
        ],
        answer: 'La pendiente es $-1$.',
        verify: { lab: 'implicit', eq: 'x^3 + y^3 = 6x*y', d: '(2y - x^2)/(y^2 - 2x)', x0: 3, y0: 3, slope: -1 }
      },
      {
        type: 'callout', heading: 'No olvides el y′',
        body: 'La derivada de $y^3$ respecto a $x$ no es $3y^2$: es $3y^2y\'$. Si se te olvida, el lab te marca la pendiente equivocada.'
      },
      {
        "type": "faq",
        "heading": "Dudas comunes",
        "short": "Dudas comunes",
        "items": [
          {
            "q": "¿Por qué $x^2$ no lleva $y'$ pero $y^2$ sí?",
            "a": "Porque derivamos respecto a $x$. La derivada de $x$ respecto a $x$ es 1, así que no aparece nada extra; la de $y$ es $y'$."
          },
          {
            "q": "¿Puedo despejar $y$ primero?",
            "a": "A veces sí (en el círculo, $y = \\sqrt{25 - x^2}$), pero sale más largo y solo te da media curva. En otras curvas es imposible despejar."
          },
          {
            "q": "¿Qué significa que $y'$ quede con $x$ y $y$?",
            "a": "Que la pendiente depende del punto. Por eso en los problemas siempre te dan un punto $(x_0, y_0)$ para evaluar."
          }
        ]
      },
      {
        "type": "recap",
        "heading": "Lo que te llevas",
        "short": "Resumen",
        "points": [
          "Deriva ambos lados respecto a $x$.",
          "Todo término con $y$ lleva un $y'$ por la regla de la cadena.",
          "Agrupa los $y'$, factoriza y despeja.",
          "Evalúa en el punto que te dan."
        ]
      }
    ],

    lab: {
      type: 'implicit-tangent', title: 'Tangente a una curva implícita',
      intro: 'Elige una curva, escribe tu $dy/dx$ en términos de $x$ y $y$, y compárala con la real sobre la curva cerca del punto.',
      cfg: {}
    },

    formulas: [
      { label: 'Término con y', tex: '\\frac{d}{dx}\\,y^n = n\\,y^{n-1}y\'' },
      { label: 'Producto xy', tex: '\\frac{d}{dx}(xy) = y + x\\,y\'' },
      { label: 'Círculo', tex: 'x^2 + y^2 = r^2 \\Rightarrow y\' = -\\frac{x}{y}' },
      { label: 'Tangente', tex: 'y - y_0 = y\'(x_0, y_0)(x - x_0)' }
    ],

    exercises: [
      {
        id: 'c1-s06-circulo', title: 'Círculo',
        vars: { k: [0, 5, 1] },
        derive: function (v) { var t = TRIPLES[v.k]; return { a: t[0], b: t[1], r: t[2] }; },
        prompt: function (v) { return '<p>Para $x^2 + y^2 = ' + v.r * v.r + '$, encuentra $\\dfrac{dy}{dx}$ en términos de $x$ y $y$.</p>'; },
        check: 'expr',
        implicit: function (v) { return { eq: 'x^2 + y^2 = ' + v.r * v.r, x0: v.a, y0: v.b }; },
        answer: function () { return '-x/y'; },
        hint: 'Deriva: $2x + 2y\\,y\' = 0$.',
        solution: function () { return '$2x + 2y\\,y\' = 0 \\Rightarrow y\' = -\\dfrac{x}{y}$'; }
      },
      {
        id: 'c1-s06-pendiente', title: 'Pendiente en un punto',
        vars: { p: [1, 4, 1], q: [1, 4, 1] },
        where: function (v) { return v.p !== v.q; },
        derive: function (v) { return { c: v.p * v.p + v.p * v.q + v.q * v.q }; },
        prompt: function (v) { return '<p>El punto $(' + v.p + ', ' + v.q + ')$ está sobre $x^2 + xy + y^2 = ' + v.c + '$. ¿Cuál es la pendiente de la tangente ahí?</p>'; },
        check: 'numeric', tol: { abs: 0.01 },
        answer: function (v) { return -(2 * v.p + v.q) / (v.p + 2 * v.q); },
        mistakes: { productAsY: function (v) { return -(2 * v.p + v.q) / (2 * v.q); } },
        feedback: [{ when: 'productAsY', say: 'Al derivar $xy$ olvidaste el término $x\\,y\'$ de la regla del producto.' }],
        oracle: { lab: 'implicit-slope', eq: function (v) { return 'x^2 + x*y + y^2 = ' + v.c; }, x0: function (v) { return v.p; }, y0: function (v) { return v.q; } },
        hint: '$(xy)\' = y + x\\,y\'$.',
        solution: function (v) { return '$y\' = -\\dfrac{2x + y}{x + 2y} = -\\dfrac{' + (2 * v.p + v.q) + '}{' + (v.p + 2 * v.q) + '} \\approx ' + fx(-(2 * v.p + v.q) / (v.p + 2 * v.q)) + '$'; }
      },
      {
        id: 'c1-s06-hiperbola', title: 'Hipérbola',
        vars: { c: [2, 12, 1] },
        prompt: function (v) { return '<p>Si $xy = ' + v.c + '$, encuentra $\\dfrac{dy}{dx}$ en términos de $x$ y $y$.</p>'; },
        check: 'expr',
        implicit: function (v) { return { eq: 'x*y = ' + v.c, x0: 1, y0: v.c }; },
        answer: function () { return '-y/x'; },
        hint: 'Producto: $y + x\\,y\' = 0$.',
        solution: function () { return '$y + x\\,y\' = 0 \\Rightarrow y\' = -\\dfrac{y}{x}$'; }
      },
      {
        id: 'c1-s06-tangente', title: 'Ordenada de la tangente',
        vars: { k: [0, 5, 1] },
        derive: function (v) { var t = TRIPLES[v.k]; return { a: t[0], b: t[1], r: t[2] }; },
        prompt: function (v) { return '<p>La recta tangente a $x^2 + y^2 = ' + v.r * v.r + '$ en $(' + v.a + ', ' + v.b + ')$ corta al eje $y$ en $(0, b_0)$. ¿Cuánto vale $b_0$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.r * v.r / v.b; },
        mistakes: { usedPoint: function (v) { return v.b; } },
        feedback: [{ when: 'usedPoint', say: 'Esa es la $y$ del punto, no donde la tangente corta al eje $y$.' }],
        oracle: { lab: 'value', value: function (v) { return v.b - (-v.a / v.b) * v.a; } },
        hint: 'Pendiente $-a/b$; la recta es $y = b - \\tfrac{a}{b}(x - a)$. Evalúa en $x = 0$.',
        solution: function (v) { return '$y = ' + v.b + ' - \\tfrac{' + v.a + '}{' + v.b + '}(x - ' + v.a + ')$; en $x = 0$: $b_0 = ' + v.b + ' + \\tfrac{' + v.a * v.a + '}{' + v.b + '} = ' + fx(v.r * v.r / v.b) + '$'; }
      },
      {
        id: 'c1-s06-concepto', title: 'Concepto',
        vars: { n: [3, 6, 1] },
        prompt: function (v) { return '<p>Si $y$ depende de $x$, ¿cuánto vale $\\dfrac{d}{dx}\\big(y^{' + v.n + '}\\big)$?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: '$' + v.n + 'y^{' + (v.n - 1) + '}\\,y\'$', correct: true },
            { text: '$' + v.n + 'y^{' + (v.n - 1) + '}$', say: 'Falta el $y\'$ de la regla de la cadena.' },
            { text: '$' + v.n + 'x^{' + (v.n - 1) + '}$', say: 'La base es $y$, no $x$.' },
            { text: '$0$', say: '$y$ no es constante: cambia con $x$.' }
          ];
        },
        answer: function (v) { return '$' + v.n + 'y^{' + (v.n - 1) + '}\\,y\'$'; },
        hint: 'Es una cadena con adentro $y(x)$.',
        solution: function (v) { return 'Afuera $u^{' + v.n + '}$, adentro $u = y(x)$: $' + v.n + 'y^{' + (v.n - 1) + '}\\,y\'$.'; }
      }
    ],

    quiz: { tags: ['c1.S06'], count: 8 },

    errors: [
      'Olvidar el $y\'$ al derivar términos con $y$.',
      'Derivar $xy$ como $y\'$ o como $1$: es un producto, $(xy)\' = y + x\\,y\'$.',
      'Despejar mal: agrupa todos los términos con $y\'$ de un lado antes de dividir.',
      'Evaluar la pendiente en un punto que no está sobre la curva.'
    ],

    teacher: {
      plan: ['Muestra que el círculo no es gráfica de una función.', 'Explainer del círculo y los tres ejemplos.', 'Lab con curvas raras, como la hoja de Descartes.'],
      check: ['Que marquen con color cada $y\'$ al derivar.'],
      note: 'Aquí termina el bloque A; buen momento para el Parcial 1 sugerido.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 1</em>, §3.8 “Implicit Differentiation”. <a href="https://openstax.org/books/calculus-volume-1/pages/3-8-implicit-differentiation">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-05',
    next: 'sesion-07'
  };
})();
