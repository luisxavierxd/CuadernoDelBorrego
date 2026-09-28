/* =====================================================================
   Cálculo 1 · S14 · Longitud de arco y áreas (bloque C · temas 5.3–5.4).
   Fuente: OpenStax, Calculus Volume 2, §2.1 y §2.4 (CC BY-NC-SA 4.0).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 4 : d)).toString(); }
  var OS = 'https://openstax.org/books/calculus-volume-2/pages/';
  var ARC32 = (80 * Math.sqrt(10) - 8) / 27;

  window.SESSION_DATA = {
    slug: 'sesion-14', number: '14', group: 'C · Integral',
    title: 'Longitud de arco y áreas', temario: ['5.3', '5.4'],
    minutes: 200,
    quote: 'Para medir un área o una curva, pártela en pedazos rectos y súmalos: la integral hace el resto.',
    badges: [
      'Calcular el área entre dos curvas con $\\int_a^b (f - g)\\,dx$.',
      'Encontrar los límites con las intersecciones.',
      'Partir la integral cuando las curvas se cruzan.',
      'Calcular la longitud de una curva con $\\int_a^b \\sqrt{1 + (f\')^2}\\,dx$.'
    ],

    lesson: [
      {
        "type": "warmup",
        "heading": "Antes de empezar",
        "short": "Antes de empezar",
        "idea": "La integral también sirve para medir el <strong>área entre dos curvas</strong> y la <strong>longitud</strong> de una curva.",
        "recall": [
          "Integrales definidas y el TFC (S09).",
          "Encontrar dónde se cortan dos gráficas: igualarlas.",
          "Pitágoras, para la longitud de un segmento."
        ],
        "why": "Sirve para calcular superficies de terrenos, cantidad de material en perfiles curvos o el largo de un cable o camino curvo."
      },
      {
        "type": "concept",
        "heading": "Imagínalo así",
        "short": "Imagínalo así",
        "body": [
          "El área entre dos curvas se piensa con tiras verticales delgadas: cada tira mide de alto \"la de arriba menos la de abajo\" y de ancho $dx$. Sumarlas todas es integrar $(\\text{arriba} - \\text{abajo})$.",
          "Para la longitud, imagina aproximar la curva con muchos segmentos rectos pequeños. Cada uno mide $\\sqrt{dx^2 + dy^2}$ por Pitágoras. Al sumarlos e ir haciéndolos más pequeños sale la fórmula $L = \\int\\sqrt{1 + (y')^2}\\,dx$.",
          "En los dos casos, lo más importante es el dibujo: saber qué curva está arriba, dónde se cortan y entre qué valores se integra."
        ]
      },
      {
        type: 'concept', heading: 'Área entre dos curvas', short: 'Área entre curvas',
        body: [
          'Si $f(x) \\geq g(x)$ en $[a, b]$, el área de la región entre ellas es $$A = \\int_a^b \\big(f(x) - g(x)\\big)\\,dx.$$',
          'Se lee “arriba menos abajo”. No importa si las curvas están bajo el eje $x$: la altura de cada tira sigue siendo $f - g$.',
          'Si las curvas se cruzan dentro de $[a, b]$, parte la integral en cada cruce y en cada tramo resta la de abajo a la de arriba.'
        ]
      },
      {
        type: 'explainer', heading: 'Tiras verticales', short: 'Tiras verticales',
        title: 'Entre y = x + 2 y y = x²',
        intro: 'La región está entre las intersecciones: $x + 2 = x^2$ da $x = -1$ y $x = 2$.',
        diagram: 'area-strip',
        steps: [
          { text: 'Cerca de $x = -1$ la tira es bajita: las curvas casi se tocan.', state: { x: -0.8 } },
          { text: 'En medio la tira es alta: su altura es $f(x) - g(x) = x + 2 - x^2$.', state: { x: 0.5 } },
          { text: 'Sumar todas las tiras es integrar: $\\int_{-1}^{2}(x + 2 - x^2)\\,dx = 4.5$.', state: { x: 1.6 } }
        ]
      },
      {
        "type": "recipe",
        "heading": "Receta: área entre curvas",
        "short": "Receta",
        "steps": [
          {
            "text": "Dibuja las dos curvas (aunque sea a mano)."
          },
          {
            "text": "Encuentra dónde se cortan: iguala las funciones y resuelve. Esos son tus límites."
          },
          {
            "text": "Decide cuál está arriba en cada tramo: evalúa ambas en un punto intermedio.",
            "tip": "Si se cruzan dentro del intervalo, parte la integral en tramos."
          },
          {
            "text": "Integra $(\\text{arriba} - \\text{abajo})$ en cada tramo y suma."
          },
          {
            "text": "Revisa: un área siempre es positiva."
          }
        ],
        "note": "Para longitud de arco: deriva, eleva al cuadrado, suma 1, saca raíz e integra. Muchas veces $1 + (y')^2$ resulta ser un cuadrado perfecto; revísalo antes de integrar."
      },
      {
        type: 'example', heading: 'Parábola y recta',
        problem: '<p>Calcula el área entre $y = x + 2$ y $y = x^2$.</p>',
        steps: [
          { text: 'Intersecciones: $x^2 - x - 2 = (x - 2)(x + 1) = 0$, así que $x = -1$ y $x = 2$. Arriba va la recta.' },
          { text: 'Integra arriba menos abajo.', math: '\\int_{-1}^{2}(x + 2 - x^2)\\,dx = \\left[\\tfrac{x^2}{2} + 2x - \\tfrac{x^3}{3}\\right]_{-1}^{2}' },
          { text: 'Evalúa.', math: '\\left(2 + 4 - \\tfrac{8}{3}\\right) - \\left(\\tfrac{1}{2} - 2 + \\tfrac{1}{3}\\right) = \\tfrac{10}{3} + \\tfrac{7}{6} = 4.5' }
        ],
        answer: '$A = 4.5$',
        verify: { lab: 'area', f: 'x + 2', g: 'x^2', a: -1, b: 2, value: 4.5 }
      },
      {
        type: 'example', heading: 'Seno y coseno',
        problem: '<p>Calcula el área entre $y = \\sin x$ y $y = \\cos x$ de $x = \\tfrac{\\pi}{4}$ a $x = \\tfrac{5\\pi}{4}$.</p>',
        steps: [
          { text: 'En ese intervalo el seno va arriba (se cruzan justo en los extremos).', math: '\\int_{\\pi/4}^{5\\pi/4}(\\sin x - \\cos x)\\,dx = \\left[-\\cos x - \\sin x\\right]_{\\pi/4}^{5\\pi/4}' },
          { text: 'Evalúa.', math: '\\left(\\tfrac{\\sqrt{2}}{2} + \\tfrac{\\sqrt{2}}{2}\\right) - \\left(-\\tfrac{\\sqrt{2}}{2} - \\tfrac{\\sqrt{2}}{2}\\right) = 2\\sqrt{2}' }
        ],
        answer: '$A = 2\\sqrt{2} \\approx ' + fx(2 * Math.SQRT2) + '$',
        verify: { lab: 'area', f: 'sin(x)', g: 'cos(x)', a: Math.PI / 4, b: 5 * Math.PI / 4, value: 2 * Math.SQRT2 }
      },
      {
        type: 'example', heading: 'Cuando se cruzan adentro',
        problem: '<p>Calcula el área entre $y = x^3$ y $y = x$ en $[-1, 1]$.</p>',
        steps: [
          { text: 'Se cruzan en $x = 0$. En $[-1, 0]$ arriba va $x^3$; en $[0, 1]$, arriba va $x$.' },
          { text: 'Parte la integral.', math: '\\int_{-1}^{0}(x^3 - x)\\,dx + \\int_{0}^{1}(x - x^3)\\,dx = \\tfrac{1}{4} + \\tfrac{1}{4}' },
          { text: 'Si no partes, $\\int_{-1}^{1}(x - x^3)\\,dx = 0$: las dos áreas se cancelan, aunque la región sí tiene área.' }
        ],
        answer: '$A = \\tfrac{1}{2}$ (y el área neta sería 0).',
        verify: { lab: 'area', f: 'x^3', g: 'x', a: -1, b: 1, value: 0.5 }
      },
      {
        type: 'concept', heading: 'Longitud de arco', short: 'Longitud de arco',
        body: [
          'Un pedacito de curva mide casi lo que la hipotenusa de un triángulo con catetos $\\Delta x$ y $\\Delta y$: $\\sqrt{\\Delta x^2 + \\Delta y^2} = \\sqrt{1 + (\\Delta y/\\Delta x)^2}\\,\\Delta x$.',
          'Al sumar y hacer $\\Delta x \\to 0$: $$L = \\int_a^b \\sqrt{1 + \\big(f\'(x)\\big)^2}\\,dx.$$',
          'La raíz casi nunca tiene antiderivada elemental; los ejemplos de libro se eligen para que sí la tenga. En la práctica, se calcula numéricamente.'
        ]
      },
      {
        type: 'explainer', heading: 'La poligonal se acerca a la curva', short: 'Poligonal',
        title: 'Segmentos inscritos en y = x²/2',
        intro: 'Aproxima el arco de $y = \\tfrac{x^2}{2}$ entre 0 y 2 con segmentos rectos.',
        diagram: 'arc-polyline',
        steps: [
          { text: 'Con un solo segmento mides la cuerda: se queda corta.', state: { n: 1 } },
          { text: 'Con 2 segmentos ya abrazas mejor la curva.', state: { n: 2 } },
          { text: 'Con 4…', state: { n: 4 } },
          { text: 'Con 16 la poligonal casi coincide con la curva; en el límite obtienes la integral.', state: { n: 16 } }
        ]
      },
      {
        type: 'example', heading: 'Un arco con fórmula',
        problem: '<p>Calcula la longitud de $y = x^{3/2}$ entre $x = 0$ y $x = 4$.</p>',
        steps: [
          { text: 'Deriva y arma la raíz.', math: 'y\' = \\tfrac{3}{2}x^{1/2},\\qquad 1 + (y\')^2 = 1 + \\tfrac{9}{4}x' },
          { text: 'Cambio de variable $u = 1 + \\tfrac{9}{4}x$, $du = \\tfrac{9}{4}\\,dx$.', math: 'L = \\int_0^4 \\sqrt{1 + \\tfrac{9}{4}x}\\,dx = \\tfrac{4}{9}\\cdot\\tfrac{2}{3}\\left[u^{3/2}\\right]_1^{10}' },
          { text: 'Evalúa.', math: 'L = \\tfrac{8}{27}\\left(10\\sqrt{10} - 1\\right)' }
        ],
        answer: '$L = \\tfrac{8}{27}(10\\sqrt{10} - 1) \\approx ' + fx(ARC32) + '$',
        verify: { lab: 'arc', f: 'x^(3/2)', a: 0, b: 4, value: ARC32 }
      },
      {
        type: 'example', heading: 'Comprobación con una recta',
        problem: '<p>Calcula la longitud de $y = 2x + 1$ entre $x = 0$ y $x = 3$.</p>',
        steps: [
          { text: '$y\' = 2$, así que la raíz es constante.', math: 'L = \\int_0^3 \\sqrt{1 + 4}\\,dx = 3\\sqrt{5}' },
          { text: 'Coincide con Pitágoras: del punto $(0, 1)$ al $(3, 7)$ hay $\\sqrt{9 + 36} = \\sqrt{45} = 3\\sqrt{5}$.' }
        ],
        answer: '$L = 3\\sqrt{5} \\approx ' + fx(3 * Math.sqrt(5)) + '$',
        verify: { lab: 'arc', f: '2x + 1', a: 0, b: 3, value: 3 * Math.sqrt(5) }
      },
      {
        type: 'callout', heading: 'Dibuja antes de integrar',
        body: 'Un bosquejo te dice qué curva va arriba y si se cruzan dentro del intervalo. Si te sale un área negativa o cero, casi siempre restaste al revés o no partiste la integral en un cruce.'
      },
      {
        "type": "faq",
        "heading": "Dudas comunes",
        "short": "Dudas comunes",
        "items": [
          {
            "q": "¿Qué pasa si resto al revés?",
            "a": "El resultado sale negativo. Es la señal de que la de abajo era la de arriba: cambia el orden (o toma el valor absoluto si ya revisaste el tramo)."
          },
          {
            "q": "¿Por qué la longitud de arco es tan difícil de integrar?",
            "a": "Porque la raíz rara vez se simplifica. En los ejercicios del curso se eligen curvas donde sí se simplifica; en la vida real se aproxima numéricamente."
          },
          {
            "q": "¿Puedo usar tiras horizontales?",
            "a": "Sí, a veces conviene: integras en $y$ con \"derecha menos izquierda\"."
          }
        ]
      },
      {
        "type": "recap",
        "heading": "Lo que te llevas",
        "short": "Resumen",
        "points": [
          "Área entre curvas: $\\int_a^b(\\text{arriba} - \\text{abajo})\\,dx$.",
          "Los cortes dan los límites; si se cruzan adentro, parte la integral.",
          "Longitud: $\\int_a^b\\sqrt{1 + (y')^2}\\,dx$.",
          "Siempre dibuja primero."
        ]
      }
    ],

    lab: {
      type: 'area-between', title: 'Área entre curvas y longitud de arco',
      intro: 'Escribe dos curvas: el lab encuentra sus intersecciones, sombrea la región y compara tu área. En modo longitud de arco, mueve los segmentos de la poligonal.',
      cfg: {}
    },

    formulas: [
      { label: 'Área entre curvas', tex: 'A = \\int_a^b \\big(f(x) - g(x)\\big)\\,dx,\\quad f \\geq g' },
      { label: 'Si se cruzan', tex: 'A = \\int_a^b |f(x) - g(x)|\\,dx' },
      { label: 'Longitud de arco', tex: 'L = \\int_a^b \\sqrt{1 + \\big(f\'(x)\\big)^2}\\,dx' }
    ],

    exercises: [
      {
        id: 'c1-s14-recta-parabola', title: 'Recta y parábola',
        vars: { k: [1, 6, 1] },
        prompt: function (v) { return '<p>Calcula el área entre $y = ' + (v.k === 1 ? '' : v.k) + 'x$ y $y = x^2$.</p>'; },
        check: 'numeric', tol: { rel: 0.005 },
        answer: function (v) { return Math.pow(v.k, 3) / 6; },
        mistakes: { neg: function (v) { return -Math.pow(v.k, 3) / 6; } },
        feedback: [{ when: 'neg', say: 'Restaste al revés: en $[0, k]$ la recta va arriba.' }],
        oracle: { lab: 'area', f: function (v) { return v.k + 'x'; }, g: function () { return 'x^2'; }, a: function () { return 0; }, b: function (v) { return v.k; } },
        hint: 'Se cruzan en $x = 0$ y $x = k$.',
        solution: function (v) { return '$\\int_0^{' + v.k + '}(' + v.k + 'x - x^2)\\,dx = \\tfrac{' + v.k + '^3}{2} - \\tfrac{' + v.k + '^3}{3} = ' + fx(Math.pow(v.k, 3) / 6) + '$.'; }
      },
      {
        id: 'c1-s14-bajo-parabola', title: 'Bajo una parábola',
        vars: { a: [1, 5, 1] },
        prompt: function (v) { return '<p>Calcula el área entre $y = ' + v.a * v.a + ' - x^2$ y el eje $x$.</p>'; },
        check: 'numeric', tol: { rel: 0.005 },
        answer: function (v) { return 4 * Math.pow(v.a, 3) / 3; },
        mistakes: { half: function (v) { return 2 * Math.pow(v.a, 3) / 3; } },
        feedback: [{ when: 'half', say: 'Esa es solo la mitad: la parábola cruza el eje en $\\pm a$.' }],
        oracle: { lab: 'area', f: function (v) { return v.a * v.a + ' - x^2'; }, g: function () { return '0'; }, a: function (v) { return -v.a; }, b: function (v) { return v.a; } },
        hint: 'Los límites son $x = \\pm a$.',
        solution: function (v) { return '$\\int_{-' + v.a + '}^{' + v.a + '}(' + v.a * v.a + ' - x^2)\\,dx = ' + fx(4 * Math.pow(v.a, 3) / 3) + '$.'; }
      },
      {
        id: 'c1-s14-raiz', title: 'Raíz y parábola',
        vars: {},
        prompt: function () { return '<p>Calcula el área entre $y = \\sqrt{x}$ y $y = x^2$.</p>'; },
        check: 'numeric', tol: { rel: 0.005 },
        answer: function () { return 1 / 3; },
        oracle: { lab: 'value', value: function () { return 2 / 3 - 1 / 3; } },
        hint: 'Se cruzan en 0 y 1; arriba va $\\sqrt{x}$.',
        solution: function () { return '$\\int_0^1(\\sqrt{x} - x^2)\\,dx = \\tfrac{2}{3} - \\tfrac{1}{3} = \\tfrac{1}{3}$.'; }
      },
      {
        id: 'c1-s14-cruce', title: 'Curvas que se cruzan',
        vars: { a: [1, 3, 1] },
        prompt: function (v) { return '<p>Calcula el área entre $y = x^3$ y $y = ' + (v.a * v.a === 1 ? '' : v.a * v.a) + 'x$ en $[-' + v.a + ', ' + v.a + ']$.</p>'; },
        check: 'numeric', tol: { rel: 0.005 },
        answer: function (v) { return Math.pow(v.a, 4) / 2; },
        mistakes: { net: function () { return 0; } },
        feedback: [{ when: 'net', say: 'Ese es el área neta: las curvas se cruzan en 0 y hay que partir la integral.' }],
        oracle: { lab: 'area', f: function () { return 'x^3'; }, g: function (v) { return v.a * v.a + 'x'; }, a: function (v) { return -v.a; }, b: function (v) { return v.a; } },
        hint: 'Parte en $x = 0$; cada lado aporta lo mismo.',
        solution: function (v) { return '$2\\int_0^{' + v.a + '}(' + v.a * v.a + 'x - x^3)\\,dx = 2\\left(\\tfrac{' + Math.pow(v.a, 4) + '}{2} - \\tfrac{' + Math.pow(v.a, 4) + '}{4}\\right) = ' + fx(Math.pow(v.a, 4) / 2) + '$.'; }
      },
      {
        id: 'c1-s14-arco-recta', title: 'Longitud de un segmento',
        vars: { m: [1, 5, 1], L: [1, 6, 1] },
        prompt: function (v) { return '<p>Usa la fórmula de longitud de arco para $y = ' + (v.m === 1 ? '' : v.m) + 'x$ entre $x = 0$ y $x = ' + v.L + '$.</p>'; },
        check: 'numeric', tol: { rel: 0.002 },
        answer: function (v) { return v.L * Math.sqrt(1 + v.m * v.m); },
        oracle: { lab: 'arc', f: function (v) { return v.m + 'x'; }, a: function () { return 0; }, b: function (v) { return v.L; } },
        hint: '$y\' = m$ es constante.',
        solution: function (v) { return '$\\int_0^{' + v.L + '}\\sqrt{1 + ' + v.m * v.m + '}\\,dx = ' + v.L + '\\sqrt{' + (1 + v.m * v.m) + '} \\approx ' + fx(v.L * Math.sqrt(1 + v.m * v.m)) + '$.'; }
      },
      {
        id: 'c1-s14-arco', title: 'Arco de x^(3/2)',
        vars: { b: [1, 5, 1] },
        prompt: function (v) { return '<p>Calcula la longitud de $y = x^{3/2}$ entre $x = 0$ y $x = ' + v.b + '$.</p>'; },
        check: 'numeric', tol: { rel: 0.002 },
        answer: function (v) { return 8 / 27 * (Math.pow(1 + 9 * v.b / 4, 1.5) - 1); },
        mistakes: { chord: function (v) { return Math.hypot(v.b, Math.pow(v.b, 1.5)); } },
        feedback: [{ when: 'chord', say: 'Esa es la cuerda (línea recta entre los extremos); el arco es un poco más largo.' }],
        oracle: { lab: 'arc', f: function () { return 'x^(3/2)'; }, a: function () { return 0; }, b: function (v) { return v.b; } },
        hint: '$1 + (y\')^2 = 1 + \\tfrac{9}{4}x$; usa $u = 1 + \\tfrac{9}{4}x$.',
        solution: function (v) { return '$L = \\tfrac{8}{27}\\left[\\left(1 + \\tfrac{9\\cdot ' + v.b + '}{4}\\right)^{3/2} - 1\\right] \\approx ' + fx(8 / 27 * (Math.pow(1 + 9 * v.b / 4, 1.5) - 1)) + '$.'; }
      },
      {
        id: 'c1-s14-orden', title: 'Arriba menos abajo',
        vars: {},
        prompt: function () { return '<p>Al calcular el área entre $y = 4$ y $y = x^2$ con $\\int_{-2}^{2}(x^2 - 4)\\,dx$, alguien obtiene $-\\tfrac{32}{3}$. ¿Qué pasó?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Restó al revés: la recta $y = 4$ va arriba', correct: true },
            { text: 'Los límites están mal', say: 'Los límites $\\pm 2$ sí son las intersecciones.' },
            { text: 'Así debe salir: el área es negativa', say: 'Un área siempre es positiva.' },
            { text: 'Faltó multiplicar por 2', say: 'El problema es el signo, no un factor.' }
          ];
        },
        answer: function () { return 'Restó al revés: la recta $y = 4$ va arriba'; },
        hint: '¿Qué curva está más alta en $x = 0$?',
        solution: function () { return '$\\int_{-2}^{2}(4 - x^2)\\,dx = \\tfrac{32}{3}$.'; }
      }
    ],

    quiz: { tags: ['c1.S14'], count: 8 },

    errors: [
      'Restar abajo menos arriba y obtener un área negativa.',
      'No partir la integral cuando las curvas se cruzan dentro del intervalo.',
      'Olvidar el 1 dentro de la raíz: $\\sqrt{1 + (f\')^2}$, no $\\sqrt{(f\')^2}$.',
      'Usar $f$ en lugar de $f\'$ en la fórmula de longitud de arco.'
    ],

    teacher: {
      plan: ['Bosquejar las curvas y marcar intersecciones.', 'Explainer de tiras y lab en modo área.', 'Pitágoras con segmentos pequeños para la longitud de arco; explainer de la poligonal.'],
      check: ['Que indiquen qué curva va arriba antes de integrar.'],
      note: 'La idea de rebanar en tiras vuelve en S15 con discos y capas.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 2</em>, §2.1 “Areas between Curves”. <a href="' + OS + '2-1-areas-between-curves">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 2</em>, §2.4 “Arc Length of a Curve and Surface Area”. <a href="' + OS + '2-4-arc-length-of-a-curve-and-surface-area">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-13',
    next: 'sesion-15'
  };
})();
