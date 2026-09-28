/* =====================================================================
   Cálculo 1 · S11 · Integración por partes (bloque C · tema 5.6).
   Fuente: OpenStax, Calculus Volume 2, §3.1 (CC BY-NC-SA 4.0).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 4 : d)).toString(); }
  var OS = 'https://openstax.org/books/calculus-volume-2/pages/';

  window.SESSION_DATA = {
    slug: 'sesion-11', number: '11', group: 'C · Integral',
    title: 'Integración por partes', temario: ['5.6'],
    minutes: 180,
    quote: 'Por partes es la regla del producto leída al revés: cambias una integral difícil por otra más fácil.',
    badges: [
      'Aplicar $\\int u\\,dv = uv - \\int v\\,du$.',
      'Elegir $u$ y $dv$ con la regla LIATE.',
      'Aplicar partes dos veces o combinarla con cambio de variable.',
      'Evaluar integrales definidas por partes.'
    ],

    lesson: [
      {
        "type": "warmup",
        "heading": "Antes de empezar",
        "short": "Antes de empezar",
        "idea": "Integración <strong>por partes</strong> sirve para productos donde un factor se simplifica al derivarlo.",
        "recall": [
          "La regla del producto (S03): $(uv)' = u'v + uv'$.",
          "Integrales directas (S10)."
        ],
        "why": "Aparece con $x\\,e^x$, $x\\sin x$, $\\ln x$ o $\\arctan x$: productos que el cambio de variable no puede resolver. Es común en probabilidad, física y señales."
      },
      {
        "type": "concept",
        "heading": "Imagínalo así",
        "short": "Imagínalo así",
        "body": [
          "Integrar por partes es la regla del producto leída al revés. De $(uv)' = u'v + uv'$ se despeja $\\int u\\,dv = uv - \\int v\\,du$: cambias una integral difícil por otra, ojalá más fácil.",
          "El chiste es elegir bien cuál factor derivar ($u$) y cuál integrar ($dv$). Conviene derivar el que se <strong>simplifica</strong> al derivarlo ($x$ se vuelve 1, $\\ln x$ se vuelve $\\tfrac{1}{x}$) e integrar el que no se complica ($e^x$, $\\sin x$).",
          "La regla LIATE ayuda: Logaritmo, Inversa trigonométrica, Algebraica, Trigonométrica, Exponencial. El que aparece primero en esa lista suele ser $u$."
        ]
      },
      {
        type: 'concept', heading: 'De dónde sale', short: 'La fórmula',
        body: [
          'La regla del producto dice $(uv)\' = u\'v + uv\'$. Integrando ambos lados y despejando: $$\\int u\\,dv = uv - \\int v\\,du.$$',
          'La idea: tienes un producto de dos funciones. Una la <strong>derivas</strong> ($u$) y la otra la <strong>integras</strong> ($dv$). Si eliges bien, la integral que queda, $\\int v\\,du$, es más fácil que la original.',
          'Para elegir $u$, usa el orden <strong>LIATE</strong> (la primera que aparezca es $u$):'
        ],
        list: [
          '<strong>L</strong>ogarítmicas: $\\ln x$',
          '<strong>I</strong>nversas trigonométricas: $\\arctan x$, $\\arcsin x$',
          '<strong>A</strong>lgebraicas: $x$, $x^2$, polinomios',
          '<strong>T</strong>rigonométricas: $\\sin x$, $\\cos x$',
          '<strong>E</strong>xponenciales: $e^x$'
        ]
      },
      {
        type: 'explainer', heading: 'Una imagen de la fórmula', short: 'Por qué funciona',
        title: 'Dos áreas que forman un rectángulo',
        intro: 'Dibuja la curva que une los puntos $(u, v)$. Las dos integrales son dos áreas.',
        diagram: 'parts-area',
        steps: [
          { text: 'Cuando $u$ y $v$ cambian juntos, trazan una curva en el plano $u$-$v$.', state: { stage: 0 } },
          { text: 'El área bajo la curva (hacia el eje $u$) es $\\int v\\,du$.', state: { stage: 1 } },
          { text: 'El área a la izquierda (hacia el eje $v$) es $\\int u\\,dv$. Juntas llenan el rectángulo: $\\int u\\,dv + \\int v\\,du = uv$ (menos el pedacito de la esquina inicial).', state: { stage: 2 } }
        ]
      },
      {
        "type": "recipe",
        "heading": "Receta: integración por partes",
        "short": "Receta",
        "steps": [
          {
            "text": "Elige $u$ con LIATE; lo demás (incluido el $dx$) es $dv$."
          },
          {
            "text": "Calcula $du$ (derivando $u$) y $v$ (integrando $dv$).",
            "tip": "Haz una tablita con $u$, $dv$, $du$ y $v$."
          },
          {
            "text": "Aplica $\\int u\\,dv = uv - \\int v\\,du$."
          },
          {
            "text": "Resuelve la integral nueva. Si también es un producto, puede que tengas que aplicar partes otra vez."
          },
          {
            "text": "Suma $+C$ (o evalúa en los límites) y comprueba derivando."
          }
        ]
      },
      {
        type: 'example', heading: 'El caso clásico: $x\\,e^x$',
        problem: '<p>Calcula $\\displaystyle\\int x\\,e^x\\,dx$.</p>',
        steps: [
          { text: 'LIATE: $x$ es algebraica y va antes que la exponencial.', math: 'u = x,\\quad dv = e^x\\,dx \\quad\\Rightarrow\\quad du = dx,\\quad v = e^x' },
          { text: 'Aplica la fórmula.', math: '\\int x\\,e^x\\,dx = x\\,e^x - \\int e^x\\,dx = x\\,e^x - e^x + C' }
        ],
        answer: '$\\displaystyle\\int x\\,e^x\\,dx = e^x(x - 1) + C$',
        verify: { lab: 'antiderivative', f: 'x*e^x', F: 'x*e^x - e^x', a: -1, b: 2 }
      },
      {
        type: 'example', heading: 'Con coseno',
        problem: '<p>Calcula $\\displaystyle\\int x\\cos x\\,dx$.</p>',
        steps: [
          { text: 'Elige $u = x$ y $dv = \\cos x\\,dx$.', math: 'du = dx,\\quad v = \\sin x' },
          { text: 'Aplica la fórmula.', math: '\\int x\\cos x\\,dx = x\\sin x - \\int \\sin x\\,dx = x\\sin x + \\cos x + C' }
        ],
        answer: '$\\displaystyle\\int x\\cos x\\,dx = x\\sin x + \\cos x + C$',
        verify: { lab: 'antiderivative', f: 'x*cos(x)', F: 'x*sin(x) + cos(x)', a: 0, b: 4 }
      },
      {
        type: 'example', heading: 'Cuando no hay producto: $\\ln x$',
        problem: '<p>Calcula $\\displaystyle\\int \\ln x\\,dx$.</p>',
        steps: [
          { text: 'Truco: el otro factor es 1. Toma $u = \\ln x$ y $dv = dx$.', math: 'du = \\tfrac{1}{x}\\,dx,\\quad v = x' },
          { text: 'Aplica la fórmula.', math: '\\int \\ln x\\,dx = x\\ln x - \\int x\\cdot\\tfrac{1}{x}\\,dx = x\\ln x - x + C' }
        ],
        answer: '$\\displaystyle\\int \\ln x\\,dx = x\\ln x - x + C$',
        verify: { lab: 'antiderivative', f: 'ln(x)', F: 'x*ln(x) - x', a: 0.5, b: 3 }
      },
      {
        type: 'example', heading: 'Dos veces por partes',
        problem: '<p>Calcula $\\displaystyle\\int x^2 e^x\\,dx$.</p>',
        steps: [
          { text: 'Primera vez: $u = x^2$, $dv = e^x\\,dx$.', math: '\\int x^2 e^x\\,dx = x^2 e^x - \\int 2x\\,e^x\\,dx' },
          { text: 'La integral que queda es el caso clásico (por partes otra vez).', math: '\\int 2x\\,e^x\\,dx = 2(x\\,e^x - e^x)' },
          { text: 'Junta todo.', math: '\\int x^2 e^x\\,dx = e^x(x^2 - 2x + 2) + C' }
        ],
        answer: '$\\displaystyle\\int x^2 e^x\\,dx = e^x(x^2 - 2x + 2) + C$',
        verify: { lab: 'antiderivative', f: 'x^2*e^x', F: 'e^x*(x^2 - 2x + 2)', a: -1, b: 2 }
      },
      {
        type: 'example', heading: 'Integral definida',
        problem: '<p>Calcula $\\displaystyle\\int_0^{\\pi} x\\sin x\\,dx$.</p>',
        steps: [
          { text: 'Con $u = x$, $dv = \\sin x\\,dx$: $v = -\\cos x$.', math: '\\int x\\sin x\\,dx = -x\\cos x + \\sin x' },
          { text: 'Evalúa en los límites.', math: '\\left[-x\\cos x + \\sin x\\right]_0^{\\pi} = -\\pi\\cos\\pi - 0 = \\pi' }
        ],
        answer: '$\\pi \\approx ' + fx(Math.PI) + '$',
        verify: { lab: 'antiderivative', f: 'x*sin(x)', F: '-x*cos(x) + sin(x)', a: 0, b: Math.PI, value: Math.PI }
      },
      {
        type: 'callout', heading: 'Si la integral empeora, cambia la elección',
        body: 'Con $\\int x\\,e^x\\,dx$, si eliges $u = e^x$ y $dv = x\\,dx$ te queda $\\int \\tfrac{x^2}{2}e^x\\,dx$: más difícil que la original. Esa es la señal de que $u$ y $dv$ van al revés. Y siempre puedes comprobar derivando: el lab lo hace por ti.'
      },
      {
        "type": "faq",
        "heading": "Dudas comunes",
        "short": "Dudas comunes",
        "items": [
          {
            "q": "¿Y si la integral nueva sale más difícil?",
            "a": "Elegiste al revés. Cambia cuál es $u$ y cuál $dv$."
          },
          {
            "q": "¿Cómo integro $\\ln x$ si no es un producto?",
            "a": "Úsalo como producto con 1: $u = \\ln x$, $dv = dx$. Sale $x\\ln x - x + C$."
          },
          {
            "q": "¿En una definida dónde evalúo?",
            "a": "El término $uv$ se evalúa en los límites igual que la integral que queda: $[uv]_a^b - \\int_a^b v\\,du$."
          }
        ]
      },
      {
        "type": "recap",
        "heading": "Lo que te llevas",
        "short": "Resumen",
        "points": [
          "$\\int u\\,dv = uv - \\int v\\,du$ (la regla del producto al revés).",
          "LIATE para elegir $u$.",
          "Si empeora, cambia la elección.",
          "A veces hay que aplicarla dos veces."
        ]
      }
    ],

    lab: {
      type: 'antiderivative-check', title: '¿Es tu antiderivada?',
      intro: 'Escribe la $F(x)$ que obtuviste por partes. El lab la deriva y la compara con $f(x)$; si no coincide, la gráfica muestra dónde se separan (el error más común es el signo de $-\\cos x$).',
      cfg: {
        presets: [
          { name: 'x·eˣ', f: 'x*e^x', F: 'x*e^x - e^x', a: -1, b: 2 },
          { name: 'x·cos x · error típico', f: 'x*cos(x)', F: 'x*sin(x) - cos(x)', a: 0, b: 4 },
          { name: 'ln x', f: 'ln(x)', F: 'x*ln(x) - x', a: 0.5, b: 3 },
          { name: 'x²·eˣ (dos veces)', f: 'x^2*e^x', F: 'e^x*(x^2 - 2x + 2)', a: -1, b: 2 },
          { name: 'arctan x', f: 'atan(x)', F: 'x*atan(x) - ln(1 + x^2)/2', a: -2, b: 2 },
          { name: 'x·ln x', f: 'x*ln(x)', F: 'x^2*ln(x)/2 - x^2/4', a: 0.5, b: 3 }
        ]
      }
    },

    formulas: [
      { label: 'Por partes', tex: '\\int u\\,dv = uv - \\int v\\,du' },
      { label: 'Definida', tex: '\\int_a^b u\\,dv = \\big[uv\\big]_a^b - \\int_a^b v\\,du' },
      { label: 'LIATE', tex: '\\text{Log} \\to \\text{Inv} \\to \\text{Alg} \\to \\text{Trig} \\to \\text{Exp}' }
    ],

    exercises: [
      {
        id: 'c1-s11-xekx', title: 'Algebraica por exponencial',
        vars: { k: [2, 5, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int x\\,e^{' + v.k + 'x}\\,dx$.</p>'; },
        check: 'expr', domain: [-1, 0.6],
        integrand: function (v) { return 'x*e^(' + v.k + 'x)'; },
        answer: function (v) { return 'x*e^(' + v.k + 'x)/' + v.k + ' - e^(' + v.k + 'x)/' + v.k * v.k; },
        mistakes: { noSquare: function (v) { return 'x*e^(' + v.k + 'x)/' + v.k + ' - e^(' + v.k + 'x)/' + v.k; } },
        feedback: [{ when: 'noSquare', say: function (v) { return 'Al integrar $e^{' + v.k + 'x}/' + v.k + '$ otra vez se divide entre ' + v.k + ' de nuevo: queda $/' + v.k * v.k + '$.'; } }],
        hint: '$u = x$, $dv = e^{kx}\\,dx$, así que $v = \\tfrac{1}{k}e^{kx}$.',
        solution: function (v) { return '$$\\int x\\,e^{' + v.k + 'x}\\,dx = \\frac{x\\,e^{' + v.k + 'x}}{' + v.k + '} - \\frac{e^{' + v.k + 'x}}{' + v.k * v.k + '} + C$$'; }
      },
      {
        id: 'c1-s11-xsin', title: 'Algebraica por seno',
        vars: { k: [2, 6, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int x\\sin(' + v.k + 'x)\\,dx$.</p>'; },
        check: 'expr', domain: [0.1, 1.5],
        integrand: function (v) { return 'x*sin(' + v.k + 'x)'; },
        answer: function (v) { return '-x*cos(' + v.k + 'x)/' + v.k + ' + sin(' + v.k + 'x)/' + v.k * v.k; },
        hint: '$u = x$, $dv = \\sin(kx)\\,dx$, $v = -\\tfrac{1}{k}\\cos(kx)$.',
        solution: function (v) { return '$$-\\frac{x\\cos(' + v.k + 'x)}{' + v.k + '} + \\frac{\\sin(' + v.k + 'x)}{' + v.k * v.k + '} + C$$'; }
      },
      {
        id: 'c1-s11-xlnx', title: 'Algebraica por logaritmo',
        vars: { n: [1, 4, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int x^{' + v.n + '}\\ln x\\,dx$.</p>'; },
        check: 'expr', domain: [0.5, 3],
        integrand: function (v) { return 'x^' + v.n + '*ln(x)'; },
        answer: function (v) { var m = v.n + 1; return 'x^' + m + '*ln(x)/' + m + ' - x^' + m + '/' + m * m; },
        hint: 'LIATE: el logaritmo es $u$; $dv = x^n\\,dx$.',
        solution: function (v) { var m = v.n + 1; return '$u = \\ln x$, $v = \\tfrac{x^{' + m + '}}{' + m + '}$: $$\\frac{x^{' + m + '}\\ln x}{' + m + '} - \\frac{x^{' + m + '}}{' + m * m + '} + C$$'; }
      },
      {
        id: 'c1-s11-definida', title: 'Por partes con límites',
        vars: { b: [1, 3, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int_0^{' + v.b + '} x\\,e^x\\,dx$.</p>'; },
        check: 'numeric', tol: { rel: 0.001 },
        answer: function (v) { return (v.b - 1) * Math.exp(v.b) + 1; },
        mistakes: { noLower: function (v) { return (v.b - 1) * Math.exp(v.b); } },
        feedback: [{ when: 'noLower', say: 'Olvidaste restar el valor en 0: $F(0) = e^0(0 - 1) = -1$.' }],
        oracle: { lab: 'integral', f: function () { return 'x*e^x'; }, a: function () { return 0; }, b: function (v) { return v.b; } },
        where: function (v) { return v.b !== 1; },
        hint: '$F(x) = e^x(x - 1)$.',
        solution: function (v) { return '$\\left[e^x(x - 1)\\right]_0^{' + v.b + '} = ' + (v.b - 1) + 'e^{' + v.b + '} - (-1) \\approx ' + fx((v.b - 1) * Math.exp(v.b) + 1) + '$.'; }
      },
      {
        id: 'c1-s11-pi', title: 'Un área con seno',
        vars: { k: [1, 3, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int_0^{' + (v.k === 1 ? '' : v.k) + '\\pi} x\\sin x\\,dx$.</p>'; },
        check: 'numeric', tol: { rel: 0.001 },
        answer: function (v) { return v.k % 2 ? v.k * Math.PI : -v.k * Math.PI; },
        oracle: { lab: 'integral', f: function () { return 'x*sin(x)'; }, a: function () { return 0; }, b: function (v) { return v.k * Math.PI; } },
        hint: '$F(x) = -x\\cos x + \\sin x$.',
        solution: function (v) { return '$F(' + v.k + '\\pi) - F(0) = -' + v.k + '\\pi\\cos(' + v.k + '\\pi) = ' + (v.k % 2 ? '' : '-') + v.k + '\\pi$.'; }
      },
      {
        id: 'c1-s11-liate', title: 'Elegir u',
        vars: {},
        prompt: function () { return '<p>Para $\\displaystyle\\int x^2\\ln x\\,dx$, ¿qué conviene tomar como $u$?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: '$u = \\ln x$', correct: true },
            { text: '$u = x^2$', say: 'Entonces tendrías que integrar $\\ln x$, que es más difícil. LIATE pone al logaritmo primero.' },
            { text: '$u = x^2\\ln x$', say: 'Entonces $dv = dx$ y la integral que queda es peor.' },
            { text: 'No se puede por partes', say: 'Sí se puede: con $u = \\ln x$ sale en un paso.' }
          ];
        },
        answer: function () { return '$u = \\ln x$'; },
        hint: 'LIATE: Logarítmica va primero.',
        solution: function () { return '$u = \\ln x$, $dv = x^2\\,dx$: $\\tfrac{x^3}{3}\\ln x - \\int \\tfrac{x^2}{3}\\,dx = \\tfrac{x^3}{3}\\ln x - \\tfrac{x^3}{9} + C$.'; }
      }
    ],

    quiz: { tags: ['c1.S11'], count: 8 },

    errors: [
      'Elegir $u$ y $dv$ al revés, de modo que la integral que queda es más difícil.',
      'Olvidar el signo menos de $-\\int v\\,du$.',
      'Equivocarse al integrar $dv$: $\\int \\sin x\\,dx = -\\cos x$.',
      'En una integral definida, evaluar solo $uv$ y olvidar $\\int_a^b v\\,du$.'
    ],

    teacher: {
      plan: ['Derivar la fórmula a partir de la regla del producto.', 'Explainer de las dos áreas.', 'Ejemplos en orden: $x e^x$, $x\\cos x$, $\\ln x$, dos veces.', 'Lab: que prueben el error de signo de $x\\cos x$.'],
      check: ['Que escriban $u$, $du$, $v$ y $dv$ en una tabla antes de sustituir.'],
      note: 'La elección de $u$ es lo que más se practica: pide que justifiquen con LIATE.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 2</em>, §3.1 “Integration by Parts”. <a href="' + OS + '3-1-integration-by-parts">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-10',
    next: 'sesion-12'
  };
})();
