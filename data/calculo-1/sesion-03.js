/* =====================================================================
   Cálculo 1 · S03 · Regla del producto (bloque A · tema 3.2).
   Fuente: OpenStax, Calculus Volume 1, §3.3 (CC BY-NC-SA 4.0).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 4 : d)).toString(); }

  window.SESSION_DATA = {
    slug: 'sesion-03', number: '03', group: 'A · Derivada',
    title: 'Regla del producto', temario: ['3.2'],
    minutes: 150,
    quote: 'La derivada de un producto no es el producto de las derivadas. Cada factor cambia mientras el otro se queda quieto, y los dos cambios se suman.',
    badges: [
      'Aplicar $(uv)\' = u\'v + uv\'$ a productos de dos funciones.',
      'Reconocer cuándo conviene desarrollar en lugar de usar la regla.',
      'Extender la regla a tres factores.',
      'Evaluar la derivada de un producto con valores de una tabla.'
    ],

    lesson: [
      {
        type: 'concept', heading: 'La regla', short: 'La regla del producto',
        body: [
          'Si $u$ y $v$ son derivables, $$\\big(u\\,v\\big)\' = u\'\\,v + u\\,v\'.$$',
          'Se lee: “la derivada del primero por el segundo, más el primero por la derivada del segundo”. El orden de los dos sumandos no importa.',
          'Ojo: $(uv)\' \\neq u\'v\'$. Con $u = v = x$: $(x\\cdot x)\' = (x^2)\' = 2x$, pero $u\'v\' = 1$.'
        ]
      },
      {
        type: 'explainer', heading: 'Por qué funciona: el área de un rectángulo', short: 'La regla como área',
        title: 'Un rectángulo que crece',
        intro: 'Piensa en $u\\,v$ como el área de un rectángulo de lados $u$ y $v$.',
        diagram: 'product-area',
        steps: [
          { text: 'El área es $u\\,v$.', state: { step: 0 } },
          { text: 'Si $u$ crece en $du$, el área gana una franja de $v\\,du$.', state: { step: 1 } },
          { text: 'Si $v$ crece en $dv$, gana otra franja de $u\\,dv$.', state: { step: 2 } },
          { text: 'La esquina $du\\,dv$ es un producto de dos cambios pequeños: se desprecia. Queda $d(uv) = v\\,du + u\\,dv$.', state: { step: 3 } }
        ]
      },
      {
        type: 'example', heading: 'Polinomio por trigonométrica',
        problem: '<p>Deriva $y = x^2 \\sin x$.</p>',
        steps: [
          { text: 'Identifica los factores y sus derivadas.', math: 'u = x^2,\\ u\' = 2x \\qquad v = \\sin x,\\ v\' = \\cos x' },
          { text: 'Aplica la regla.', math: 'y\' = 2x\\sin x + x^2\\cos x' }
        ],
        answer: '$y\' = 2x\\sin x + x^2\\cos x$',
        verify: { lab: 'derivative', f: 'x^2*sin(x)', d: '2x*sin(x) + x^2*cos(x)' }
      },
      {
        type: 'example', heading: 'Con una exponencial',
        problem: '<p>Deriva $y = x\\,e^x$ y encuentra dónde la tangente es horizontal.</p>',
        steps: [
          { text: 'Regla del producto.', math: 'y\' = 1\\cdot e^x + x\\,e^x = e^x(1 + x)' },
          { text: 'Como $e^x > 0$ siempre, $y\' = 0$ solo cuando $1 + x = 0$.', math: 'x = -1' }
        ],
        answer: '$y\' = e^x(1 + x)$; la tangente es horizontal en $x = -1$.',
        verify: { lab: 'derivative', f: 'x*e^x', d: 'e^x*(1 + x)' }
      },
      {
        type: 'example', heading: 'Polinomio por logaritmo',
        problem: '<p>Deriva $y = (x^3 + 1)\\ln x$.</p>',
        steps: [
          { text: 'Regla del producto.', math: 'y\' = 3x^2\\ln x + (x^3 + 1)\\cdot\\frac{1}{x}' },
          { text: 'Simplifica el segundo término.', math: 'y\' = 3x^2\\ln x + x^2 + \\frac{1}{x}' }
        ],
        answer: '$y\' = 3x^2\\ln x + x^2 + \\dfrac{1}{x}$',
        verify: { lab: 'derivative', f: '(x^3 + 1)*ln(x)', d: '3x^2*ln(x) + x^2 + 1/x' }
      },
      {
        type: 'example', heading: 'Tres factores',
        problem: '<p>Deriva $y = x\\,e^x\\sin x$.</p>',
        steps: [
          { text: 'Con tres factores, cada uno se deriva una vez mientras los otros dos se quedan igual.', math: '(uvw)\' = u\'vw + uv\'w + uvw\'' },
          { text: 'Sustituye.', math: 'y\' = e^x\\sin x + x\\,e^x\\sin x + x\\,e^x\\cos x' }
        ],
        answer: '$y\' = e^x\\big(\\sin x + x\\sin x + x\\cos x\\big)$',
        verify: { lab: 'derivative', f: 'x*e^x*sin(x)', d: 'e^x*(sin(x) + x*sin(x) + x*cos(x))' }
      },
      {
        type: 'callout', heading: '¿Regla o desarrollo?',
        body: 'Si el producto es de dos polinomios, a veces es más rápido desarrollar: $(x^2 + 1)(x - 3) = x^3 - 3x^2 + x - 3$. La regla del producto es indispensable cuando hay exponenciales, logaritmos o trigonométricas.'
      }
    ],

    lab: {
      type: 'derivative-check', title: '¿Es tu derivada?',
      intro: 'Prueba tus derivadas de productos. El ejemplo que abre trae el error más común: multiplicar las derivadas.',
      cfg: {
        presets: [
          { name: 'Producto · error típico', f: 'x^2*sin(x)', d: '2x*cos(x)', x: [-1, 4], a: 1.5 },
          { name: 'x·eˣ', f: 'x*e^x', d: 'e^x*(1 + x)', x: [-3, 1.5], a: -1 },
          { name: 'Polinomio por logaritmo', f: '(x^3 + 1)*ln(x)', d: '3x^2*ln(x) + x^2 + 1/x', x: [0.2, 2], a: 1 },
          { name: 'Seno por coseno', f: 'sin(x)*cos(x)', d: 'cos(x)^2 - sin(x)^2', x: [-1, 4], a: 0.5 }
        ]
      }
    },

    formulas: [
      { label: 'Producto', tex: '(uv)\' = u\'v + uv\'' },
      { label: 'Tres factores', tex: '(uvw)\' = u\'vw + uv\'w + uvw\'' },
      { label: 'Diferencial', tex: 'd(uv) = v\\,du + u\\,dv' }
    ],

    exercises: [
      {
        id: 'c1-s03-polyexp', title: 'Potencia por exponencial',
        vars: { n: [2, 6, 1] },
        prompt: function (v) { return '<p>Deriva $f(x) = x^{' + v.n + '}e^x$.</p>'; },
        check: 'expr',
        derivativeOf: function (v) { return 'x^' + v.n + '*e^x'; },
        answer: function (v) { return v.n + 'x^' + (v.n - 1) + '*e^x + x^' + v.n + '*e^x'; },
        mistakes: { productOfDerivs: function (v) { return v.n + 'x^' + (v.n - 1) + '*e^x'; } },
        feedback: [{ when: 'productOfDerivs', say: 'Multiplicaste las derivadas: $(uv)\' \\neq u\'v\'$. Falta el término $u\\,v\'$.' }],
        hint: '$u = x^n$ y $v = e^x$; recuerda que $(e^x)\' = e^x$.',
        solution: function (v) { return '$$f\'(x) = ' + v.n + 'x^{' + (v.n - 1) + '}e^x + x^{' + v.n + '}e^x = x^{' + (v.n - 1) + '}e^x(' + v.n + ' + x)$$'; }
      },
      {
        id: 'c1-s03-trig', title: 'Polinomio por seno',
        vars: { a: [2, 9, 1] },
        prompt: function (v) { return '<p>Deriva $f(x) = ' + v.a + 'x\\sin x$.</p>'; },
        check: 'expr',
        derivativeOf: function (v) { return v.a + 'x*sin(x)'; },
        answer: function (v) { return v.a + '*sin(x) + ' + v.a + 'x*cos(x)'; },
        mistakes: { productOfDerivs: function (v) { return v.a + '*cos(x)'; } },
        feedback: [{ when: 'productOfDerivs', say: 'Eso es $u\'v\'$. La regla es $u\'v + uv\'$.' }],
        hint: '$u = ' + 'ax' + '$, $u\' = a$; $v = \\sin x$, $v\' = \\cos x$.',
        solution: function (v) { return '$$f\'(x) = ' + v.a + '\\sin x + ' + v.a + 'x\\cos x$$'; }
      },
      {
        id: 'c1-s03-pendiente', title: 'Pendiente de la tangente',
        vars: { a: [-2, 2, 0.5] },
        prompt: function (v) { return '<p>¿Cuál es la pendiente de la tangente a $y = x\\,e^x$ en $x = ' + v.a + '$?</p>'; },
        check: 'numeric', tol: { abs: 0.005 },
        answer: function (v) { return Math.exp(v.a) * (1 + v.a); },
        mistakes: { productOfDerivs: function (v) { return Math.exp(v.a); } },
        where: function (v) { return v.a !== 0 && v.a !== -1; },
        feedback: [{ when: 'productOfDerivs', say: 'Eso es $u\'v\' = e^x$. Te falta el término $x\\,e^x$.' }],
        oracle: { lab: 'derivative-at', f: function () { return 'x*e^x'; }, a: function (v) { return v.a; } },
        hint: '$y\' = e^x(1 + x)$; evalúa.',
        solution: function (v) { return '$y\'(' + v.a + ') = e^{' + v.a + '}(1 + ' + v.a + ') \\approx ' + fx(Math.exp(v.a) * (1 + v.a)) + '$'; }
      },
      {
        id: 'c1-s03-tabla', title: 'Con valores de una tabla',
        vars: { u: [-4, 5, 1], du: [-3, 6, 1], w: [1, 6, 1], dw: [-4, 5, 1] },
        where: function (v) { return Math.abs(v.du * v.w + v.u * v.dw) > 0 && v.du * v.dw !== v.du * v.w + v.u * v.dw; },
        prompt: function (v) { return '<p>Sabes que $u(2) = ' + v.u + '$, $u\'(2) = ' + v.du + '$, $w(2) = ' + v.w + '$ y $w\'(2) = ' + v.dw + '$. Si $f = u\\,w$, ¿cuánto vale $f\'(2)$?</p>'; },
        check: 'numeric', tol: { abs: 0.01 },
        answer: function (v) { return v.du * v.w + v.u * v.dw; },
        mistakes: { productOfDerivs: function (v) { return v.du * v.dw; } },
        feedback: [{ when: 'productOfDerivs', say: 'Multiplicaste $u\'(2)\\,w\'(2)$. La regla es $u\'w + uw\'$.' }],
        oracle: { lab: 'value', value: function (v) { return v.u * v.dw + v.w * v.du; } },
        hint: 'Sustituye los cuatro valores en $u\'w + uw\'$.',
        solution: function (v) { return '$f\'(2) = (' + v.du + ')(' + v.w + ') + (' + v.u + ')(' + v.dw + ') = ' + (v.du * v.w + v.u * v.dw) + '$'; }
      },
      {
        id: 'c1-s03-concepto', title: 'Concepto',
        vars: {},
        prompt: function () { return '<p>¿Cuál es la derivada de $u(x)\\,v(x)$?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: '$u\'v + uv\'$', correct: true },
            { text: '$u\'v\'$', say: 'Con $u = v = x$ darías $1$, pero $(x^2)\' = 2x$.' },
            { text: '$u\'v - uv\'$', say: 'El signo menos aparece en el cociente, no en el producto.' },
            { text: '$\\dfrac{u\'v + uv\'}{v^2}$', say: 'Eso mezcla la regla del producto con la del cociente.' }
          ];
        },
        answer: function () { return '$u\'v + uv\'$'; },
        hint: 'Cada factor se deriva una vez mientras el otro queda igual.',
        solution: function () { return '$(uv)\' = u\'v + uv\'$.'; }
      }
    ],

    quiz: { tags: ['c1.S03'], count: 8 },

    errors: [
      'Escribir $(uv)\' = u\'v\'$.',
      'Derivar un factor y olvidar copiar el otro sin derivar.',
      'En tres factores, derivar dos a la vez en el mismo término.',
      'Aplicar la regla cuando uno de los factores es constante: $(5x^3)\' = 15x^2$ sale directo.'
    ],

    teacher: {
      plan: ['Muestra el contraejemplo $(x\\cdot x)\'$ antes de dar la regla.', 'Explainer del área y luego los cuatro ejemplos.', 'Cierra con el lab y su ejemplo equivocado.'],
      check: ['Que escriban $u$, $u\'$, $v$, $v\'$ antes de armar la derivada.'],
      note: 'S04 usa la misma idea para el cociente.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 1</em>, §3.3 “Differentiation Rules” (The Product Rule). <a href="https://openstax.org/books/calculus-volume-1/pages/3-3-differentiation-rules">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-02',
    next: 'sesion-04'
  };
})();
