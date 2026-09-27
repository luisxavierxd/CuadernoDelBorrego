/* =====================================================================
   Cálculo 1 · S09 · La integral y el Teorema Fundamental del Cálculo
   (bloque C · temas 5.1–5.2).
   Fuente: OpenStax, Calculus Volume 1, §5.1–5.3 (CC BY 4.0).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 4 : d)).toString(); }
  function left(f, a, b, n) { var s = 0, dx = (b - a) / n; for (var i = 0; i < n; i++) s += f(a + i * dx) * dx; return s; }
  function right(f, a, b, n) { var s = 0, dx = (b - a) / n; for (var i = 1; i <= n; i++) s += f(a + i * dx) * dx; return s; }

  window.SESSION_DATA = {
    slug: 'sesion-09', number: '09', group: 'C · Integral',
    title: 'La integral y el Teorema Fundamental del Cálculo', short: 'La integral y el TFC', temario: ['5.1', '5.2'],
    minutes: 200,
    quote: 'Sumar rectángulos cada vez más delgados da el área; el Teorema Fundamental dice que esa suma se deshace derivando.',
    badges: [
      'Aproximar un área con sumas de Riemann (izquierda, derecha, punto medio).',
      'Interpretar $\\int_a^b f(x)\\,dx$ como área neta con signo.',
      'Calcular integrales con $\\int_a^b f = F(b) - F(a)$.',
      'Derivar funciones de la forma $\\int_a^x f(t)\\,dt$.'
    ],

    lesson: [
      {
        type: 'concept', heading: 'Área con rectángulos', short: 'Sumas de Riemann',
        body: [
          'Para aproximar el área bajo $f$ en $[a, b]$, parte el intervalo en $n$ tiras de ancho $\\Delta x = (b - a)/n$ y pon un rectángulo en cada una.',
          'La altura se toma en el extremo izquierdo, en el derecho o en el punto medio de cada tira: $$S_n = \\sum_{i=1}^{n} f(x_i^*)\\,\\Delta x.$$',
          'Cuando $n \\to \\infty$, todas estas sumas se acercan al mismo número, la <strong>integral definida</strong>: $$\\int_a^b f(x)\\,dx = \\lim_{n\\to\\infty} S_n.$$'
        ]
      },
      {
        type: 'explainer', heading: 'Más rectángulos, menos error', short: 'n → ∞',
        title: 'Rectángulos bajo x² en [0, 2]',
        intro: 'Suma izquierda de $f(x) = x^2$ entre 0 y 2. El área exacta es $\\tfrac{8}{3} \\approx 2.6667$.',
        diagram: 'riemann-rects',
        steps: [
          { text: 'Con 2 rectángulos la suma es 1: se queda muy corta, porque la función crece y tomamos la altura de la izquierda.', state: { n: 2 } },
          { text: 'Con 4 rectángulos: 1.75.', state: { n: 4 } },
          { text: 'Con 8: 2.1875.', state: { n: 8 } },
          { text: 'Con 32 ya casi no se ve el hueco: 2.5427. Si $n \\to \\infty$, la suma tiende a $\\tfrac{8}{3}$.', state: { n: 32 } }
        ]
      },
      {
        type: 'concept', heading: 'Área neta con signo', short: 'Área neta',
        body: [
          'Donde $f < 0$, los rectángulos tienen altura negativa: la integral <strong>resta</strong> esa área. Por eso $\\int_a^b f$ es un área <em>neta</em>.',
          'Propiedades útiles:'
        ],
        list: [
          'Sin ancho no hay área: $\\displaystyle\\int_a^a f = 0$.',
          'Invertir los límites cambia el signo: $\\displaystyle\\int_b^a f = -\\int_a^b f$.',
          'Se reparte en sumas: $\\displaystyle\\int_a^b (f + g) = \\int_a^b f + \\int_a^b g$.',
          'Se parte por tramos: $\\displaystyle\\int_a^b f = \\int_a^c f + \\int_c^b f$.'
        ]
      },
      {
        type: 'explainer', heading: 'El Teorema Fundamental', short: 'TFC',
        title: 'El área acumulada crece con rapidez f(x)',
        intro: 'Sea $A(x) = \\displaystyle\\int_0^x f(t)\\,dt$, el área desde 0 hasta $x$.',
        diagram: 'ftc-accumulate',
        steps: [
          { text: 'Al principio, $A$ es pequeña.', state: { x: 0.4 } },
          { text: 'Si avanzas un poco $dx$, el área gana una tira de altura $f(x)$: $dA \\approx f(x)\\,dx$.', state: { x: 1.2 } },
          { text: 'Donde $f$ es alta, $A$ sube rápido; donde $f$ es baja, sube despacio.', state: { x: 2.2 } },
          { text: 'Conclusión (TFC, parte 1): $A\'(x) = f(x)$. Y como consecuencia (parte 2): $\\int_a^b f = F(b) - F(a)$ para cualquier antiderivada $F$.', state: { x: 3 } }
        ]
      },
      {
        type: 'example', heading: 'Una suma izquierda',
        problem: '<p>Calcula la suma izquierda de $f(x) = x^2$ en $[0, 2]$ con $n = 4$.</p>',
        steps: [
          { text: '$\\Delta x = \\tfrac{2}{4} = 0.5$ y las alturas se toman en $0,\\ 0.5,\\ 1,\\ 1.5$.' },
          { text: 'Suma.', math: 'S_4 = 0.5\\,(0 + 0.25 + 1 + 2.25) = 1.75' }
        ],
        answer: '$S_4 = 1.75$ (el área exacta es $8/3$).',
        verify: { lab: 'riemann', f: 'x^2', a: 0, b: 2, n: 4, type: 'left', value: 1.75 }
      },
      {
        type: 'example', heading: 'La misma área con el TFC',
        problem: '<p>Calcula $\\displaystyle\\int_0^2 x^2\\,dx$.</p>',
        steps: [
          { text: 'Una antiderivada de $x^2$ es $F(x) = \\tfrac{x^3}{3}$.' },
          { text: 'Evalúa en los límites.', math: '\\int_0^2 x^2\\,dx = F(2) - F(0) = \\frac{8}{3} - 0' }
        ],
        answer: '$\\dfrac{8}{3} \\approx 2.6667$',
        verify: { lab: 'antiderivative', f: 'x^2', F: 'x^3/3', a: 0, b: 2, value: 8 / 3 }
      },
      {
        type: 'example', heading: 'Un arco de seno',
        problem: '<p>Calcula $\\displaystyle\\int_0^{\\pi} \\sin x\\,dx$.</p>',
        steps: [
          { text: 'Antiderivada: $F(x) = -\\cos x$.' },
          { text: 'Evalúa.', math: '-\\cos\\pi - (-\\cos 0) = 1 + 1 = 2' }
        ],
        answer: '2',
        verify: { lab: 'antiderivative', f: 'sin(x)', F: '-cos(x)', a: 0, b: Math.PI, value: 2 }
      },
      {
        type: 'example', heading: 'Área neta',
        problem: '<p>Calcula $\\displaystyle\\int_{-1}^{2} x\\,dx$ e interprétala.</p>',
        steps: [
          { text: 'Antiderivada $\\tfrac{x^2}{2}$.', math: '\\frac{4}{2} - \\frac{1}{2} = 1.5' },
          { text: 'El triángulo de $[0, 2]$ aporta $+2$ y el de $[-1, 0]$ resta $0.5$.' }
        ],
        answer: '$1.5$: área neta ($2 - 0.5$). El área total sin signo sería $2.5$.',
        verify: { lab: 'antiderivative', f: 'x', F: 'x^2/2', a: -1, b: 2, value: 1.5 }
      },
      {
        type: 'example', heading: 'Derivar una integral',
        problem: '<p>Si $G(x) = \\displaystyle\\int_1^x \\sin(t^2)\\,dt$, ¿cuánto vale $G\'(1.5)$?</p>',
        steps: [
          { text: 'TFC parte 1: $G\'(x) = \\sin(x^2)$. No hace falta calcular la integral (de hecho, no tiene fórmula elemental).' },
          { text: 'Evalúa.', math: 'G\'(1.5) = \\sin(2.25) \\approx ' + fx(Math.sin(2.25)) }
        ],
        answer: '$G\'(1.5) = \\sin(2.25) \\approx ' + fx(Math.sin(2.25)) + '$',
        verify: { lab: 'ftc1', f: 'sin(x^2)', a: 1, x: 1.5, value: Math.sin(2.25) }
      },
      {
        type: 'callout', heading: 'La constante no importa',
        body: 'En $F(b) - F(a)$ la constante $C$ se cancela, así que en una integral definida puedes usar cualquier antiderivada. Lo que sí importa es el orden: primero el límite de arriba.'
      }
    ],

    lab: {
      type: 'riemann', title: 'Sumas de Riemann',
      intro: 'Cambia $n$ y el tipo de suma. Mira cómo baja el error: con punto medio y trapecios baja mucho más rápido que con izquierda o derecha.',
      cfg: { n: 4 }
    },

    formulas: [
      { label: 'Suma de Riemann', tex: 'S_n = \\sum_{i=1}^{n} f(x_i^*)\\,\\Delta x,\\quad \\Delta x = \\tfrac{b - a}{n}' },
      { label: 'Integral', tex: '\\int_a^b f(x)\\,dx = \\lim_{n\\to\\infty} S_n' },
      { label: 'TFC, parte 1', tex: '\\frac{d}{dx}\\int_a^x f(t)\\,dt = f(x)' },
      { label: 'TFC, parte 2', tex: '\\int_a^b f(x)\\,dx = F(b) - F(a)' },
      { label: 'Con cadena', tex: '\\frac{d}{dx}\\int_a^{g(x)} f(t)\\,dt = f(g(x))\\,g\'(x)' }
    ],

    exercises: [
      {
        id: 'c1-s09-izquierda', title: 'Suma izquierda',
        vars: { b: [1, 4, 1] },
        prompt: function (v) { return '<p>Calcula la suma izquierda de $f(x) = x^2$ en $[0, ' + v.b + ']$ con $n = 4$.</p>'; },
        check: 'numeric', tol: { abs: 0.001 },
        answer: function (v) { return left(function (x) { return x * x; }, 0, v.b, 4); },
        mistakes: { right: function (v) { return right(function (x) { return x * x; }, 0, v.b, 4); } },
        feedback: [{ when: 'right', say: 'Esa es la suma derecha: tomaste la altura al final de cada tira.' }],
        oracle: { lab: 'riemann', type: 'left', f: function () { return 'x^2'; }, a: function () { return 0; }, b: function (v) { return v.b; }, n: function () { return 4; } },
        hint: '$\\Delta x = b/4$; alturas en $0, \\Delta x, 2\\Delta x, 3\\Delta x$.',
        solution: function (v) { var d = v.b / 4; return '$\\Delta x = ' + fx(d) + '$: $S_4 = ' + fx(d) + '\\,(0^2 + ' + fx(d) + '^2 + ' + fx(2 * d) + '^2 + ' + fx(3 * d) + '^2) = ' + fx(left(function (x) { return x * x; }, 0, v.b, 4)) + '$.'; }
      },
      {
        id: 'c1-s09-derecha', title: 'Suma derecha',
        vars: { k: [2, 9, 1], n: [2, 6, 1] },
        prompt: function (v) { return '<p>Calcula la suma derecha de $f(x) = ' + v.k + 'x$ en $[0, 2]$ con $n = ' + v.n + '$.</p>'; },
        check: 'numeric', tol: { abs: 0.001 },
        answer: function (v) { return right(function (x) { return v.k * x; }, 0, 2, v.n); },
        mistakes: { left: function (v) { return left(function (x) { return v.k * x; }, 0, 2, v.n); } },
        feedback: [{ when: 'left', say: 'Esa es la suma izquierda.' }],
        oracle: { lab: 'riemann', type: 'right', f: function (v) { return v.k + 'x'; }, a: function () { return 0; }, b: function () { return 2; }, n: function (v) { return v.n; } },
        hint: '$\\Delta x = 2/n$ y las alturas se toman al final de cada tira.',
        solution: function (v) { return '$\\Delta x = ' + fx(2 / v.n) + '$; $S = ' + fx(right(function (x) { return v.k * x; }, 0, 2, v.n)) + '$ (el área exacta es $' + 2 * v.k + '$).'; }
      },
      {
        id: 'c1-s09-tfc', title: 'Integral con el TFC',
        vars: { b: [2, 6, 1], c: [1, 9, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int_0^{' + v.b + '} (x^2 + ' + v.c + ')\\,dx$.</p>'; },
        check: 'numeric', tol: { abs: 0.01 },
        answer: function (v) { return Math.pow(v.b, 3) / 3 + v.c * v.b; },
        mistakes: { noConst: function (v) { return Math.pow(v.b, 3) / 3 + v.c; } },
        feedback: [{ when: 'noConst', say: 'La antiderivada de la constante $c$ es $c\\,x$, no $c$.' }],
        oracle: { lab: 'integral', f: function (v) { return 'x^2 + ' + v.c; }, a: function () { return 0; }, b: function (v) { return v.b; } },
        hint: '$F(x) = \\tfrac{x^3}{3} + c\\,x$.',
        solution: function (v) { return '$\\left[\\tfrac{x^3}{3} + ' + v.c + 'x\\right]_0^{' + v.b + '} = ' + fx(Math.pow(v.b, 3) / 3) + ' + ' + v.c * v.b + ' = ' + fx(Math.pow(v.b, 3) / 3 + v.c * v.b) + '$.'; }
      },
      {
        id: 'c1-s09-log', title: 'Integral de 1/x',
        vars: { b: [2, 9, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int_1^{' + v.b + '} \\frac{1}{x}\\,dx$.</p>'; },
        check: 'numeric', tol: { abs: 0.001 },
        answer: function (v) { return Math.log(v.b); },
        oracle: { lab: 'integral', f: function () { return '1/x'; }, a: function () { return 1; }, b: function (v) { return v.b; } },
        hint: 'Una antiderivada de $\\tfrac{1}{x}$ es $\\ln x$.',
        solution: function (v) { return '$\\ln ' + v.b + ' - \\ln 1 = \\ln ' + v.b + ' \\approx ' + fx(Math.log(v.b)) + '$.'; }
      },
      {
        id: 'c1-s09-neta', title: 'Área neta simétrica',
        vars: { a: [1, 4, 1], c: [1, 6, 1] },
        where: function (v) { return 4 * v.c !== Math.pow(v.a, 3); },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int_{-' + v.a + '}^{' + v.a + '} (x^3 + ' + v.c + ')\\,dx$.</p>'; },
        check: 'numeric', tol: { abs: 0.01 },
        answer: function (v) { return 2 * v.a * v.c; },
        mistakes: { onlyHalf: function (v) { return Math.pow(v.a, 4) / 4 + v.a * v.c; } },
        feedback: [{ when: 'onlyHalf', say: 'Integraste solo de 0 a $a$; el intervalo empieza en $-a$.' }],
        oracle: { lab: 'integral', f: function (v) { return 'x^3 + ' + v.c; }, a: function (v) { return -v.a; }, b: function (v) { return v.a; } },
        hint: 'El área de $x^3$ a la izquierda cancela la de la derecha.',
        solution: function (v) { return '$x^3$ es impar: su área neta en $[-' + v.a + ', ' + v.a + ']$ es 0. Queda $' + v.c + '\\cdot ' + 2 * v.a + ' = ' + 2 * v.a * v.c + '$.'; }
      },
      {
        id: 'c1-s09-tfc1', title: 'Derivar una integral',
        vars: { c: [1, 9, 1] },
        prompt: function (v) { return '<p>Si $G(x) = \\displaystyle\\int_0^x (t^2 + ' + v.c + ')\\,dt$, encuentra $G\'(x)$.</p>'; },
        check: 'expr',
        derivativeOf: function (v) { return 'x^3/3 + ' + v.c + 'x'; },
        answer: function (v) { return 'x^2 + ' + v.c; },
        mistakes: { integrated: function (v) { return 'x^3/3 + ' + v.c + 'x'; } },
        feedback: [{ when: 'integrated', say: 'Eso es $G(x)$; el TFC dice que $G\'(x)$ es el integrando evaluado en $x$.' }],
        hint: 'TFC parte 1: $\\dfrac{d}{dx}\\int_a^x f(t)\\,dt = f(x)$.',
        solution: function (v) { return '$G\'(x) = x^2 + ' + v.c + '$.'; }
      },
      {
        id: 'c1-s09-tfc1-cadena', title: 'Límite de arriba variable',
        vars: { k: [2, 5, 1] },
        prompt: function (v) { return '<p>Si $H(x) = \\displaystyle\\int_0^{x^{' + v.k + '}} \\cos t\\,dt$, encuentra $H\'(x)$.</p>'; },
        check: 'expr', domain: [0.2, 1.1],
        derivativeOf: function (v) { return 'sin(x^' + v.k + ')'; },
        answer: function (v) { return v.k + 'x^' + (v.k - 1) + '*cos(x^' + v.k + ')'; },
        mistakes: { noChain: function (v) { return 'cos(x^' + v.k + ')'; } },
        feedback: [{ when: 'noChain', say: 'El límite de arriba es $x^k$: falta multiplicar por su derivada (regla de la cadena).' }],
        hint: '$\\dfrac{d}{dx}\\int_0^{g(x)} f(t)\\,dt = f(g(x))\\,g\'(x)$.',
        solution: function (v) { return '$H\'(x) = \\cos(x^{' + v.k + '})\\cdot ' + v.k + 'x^{' + (v.k - 1) + '}$.'; }
      },
      {
        id: 'c1-s09-propiedad', title: 'Invertir los límites',
        vars: { m: [2, 9, 1] },
        prompt: function (v) { return '<p>Si $\\displaystyle\\int_1^4 f(x)\\,dx = ' + v.m + '$, ¿cuánto vale $\\displaystyle\\int_4^1 f(x)\\,dx$?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: '$-' + v.m + '$', correct: true },
            { text: '$' + v.m + '$', say: 'Al invertir los límites la integral cambia de signo.' },
            { text: '$0$', say: 'Solo $\\int_a^a f$ vale cero.' },
            { text: '$\\tfrac{1}{' + v.m + '}$', say: 'Invertir los límites no invierte el número.' }
          ];
        },
        answer: function (v) { return '$-' + v.m + '$'; },
        hint: '$\\int_b^a f = -\\int_a^b f$.',
        solution: function (v) { return '$\\int_4^1 f = -\\int_1^4 f = -' + v.m + '$.'; }
      }
    ],

    quiz: { tags: ['c1.S09'], count: 8 },

    errors: [
      'Olvidar que las áreas bajo el eje $x$ restan.',
      'Restar $F(a) - F(b)$ en lugar de $F(b) - F(a)$.',
      'Confundir la suma izquierda con la derecha.',
      'En $\\frac{d}{dx}\\int_a^{g(x)}$, olvidar multiplicar por $g\'(x)$.'
    ],

    teacher: {
      plan: ['Estimar un área contando cuadritos de la cuadrícula.', 'Explainer de rectángulos y lab de Riemann.', 'Explainer del TFC y ejemplos.'],
      check: ['Que distingan área neta de área total.'],
      note: 'S10 practica las antiderivadas que aquí se usan.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 1</em>, §5.1 “Approximating Areas”. <a href="https://openstax.org/books/calculus-volume-1/pages/5-1-approximating-areas">openstax.org</a> (CC BY 4.0).',
      'OpenStax. <em>Calculus Volume 1</em>, §5.2 “The Definite Integral”. <a href="https://openstax.org/books/calculus-volume-1/pages/5-2-the-definite-integral">openstax.org</a> (CC BY 4.0).',
      'OpenStax. <em>Calculus Volume 1</em>, §5.3 “The Fundamental Theorem of Calculus”. <a href="https://openstax.org/books/calculus-volume-1/pages/5-3-the-fundamental-theorem-of-calculus">openstax.org</a> (CC BY 4.0).'
    ],

    prev: 'sesion-08',
    next: 'sesion-10'
  };
})();
