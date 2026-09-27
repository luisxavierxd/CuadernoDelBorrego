/* =====================================================================
   Cálculo 1 · S15 · Sólidos de revolución (bloque C · tema 5.5).
   Fuente: OpenStax, Calculus Volume 2, §2.2 y §2.3 (CC BY-NC-SA 4.0).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 4 : d)).toString(); }
  var OS = 'https://openstax.org/books/calculus-volume-2/pages/';

  window.SESSION_DATA = {
    slug: 'sesion-15', number: '15', group: 'C · Integral',
    title: 'Sólidos de revolución', temario: ['5.5'],
    minutes: 200,
    quote: 'Un sólido que gira es una pila de monedas: suma el volumen de cada moneda.',
    badges: [
      'Calcular volúmenes con discos: $V = \\pi\\int_a^b f(x)^2\\,dx$.',
      'Usar arandelas cuando el sólido tiene hueco.',
      'Usar capas cilíndricas al girar alrededor del eje $y$.',
      'Elegir el método más sencillo para cada región.'
    ],

    lesson: [
      {
        type: 'concept', heading: 'Discos y arandelas', short: 'Discos',
        body: [
          'Si la región bajo $y = f(x)$ gira alrededor del eje $x$, cada rebanada delgada es un disco de radio $f(x)$ y grosor $dx$: su volumen es $\\pi f(x)^2\\,dx$. Sumando: $$V = \\pi\\int_a^b f(x)^2\\,dx.$$',
          'Si la región está entre dos curvas, $g(x) \\leq y \\leq f(x)$, cada rebanada es una <strong>arandela</strong> (un disco con hueco): $$V = \\pi\\int_a^b \\big(f(x)^2 - g(x)^2\\big)\\,dx.$$ Ojo: se restan los cuadrados, no se eleva la resta.'
        ]
      },
      {
        type: 'explainer', heading: 'Una pila de discos', short: 'Pila de discos',
        title: 'El cono que forma y = x/2',
        intro: 'La recta $y = x/2$ entre $x = 0$ y $x = 4$ gira alrededor del eje $x$ y forma un cono de radio 2 y altura 4.',
        diagram: 'disk-slice',
        steps: [
          { text: 'Con 2 discos, la aproximación es tosca.', state: { n: 2 } },
          { text: 'Con 4 discos, ya se parece al cono.', state: { n: 4 } },
          { text: 'Con 8…', state: { n: 8 } },
          { text: 'Con 24 discos casi no se distingue. En el límite: $\\pi\\int_0^4 \\tfrac{x^2}{4}\\,dx = \\tfrac{16\\pi}{3}$, justo el $\\tfrac{1}{3}\\pi r^2 h$ de la geometría.', state: { n: 24 } }
        ]
      },
      {
        type: 'concept', heading: 'Capas cilíndricas', short: 'Capas',
        body: [
          'Si la región gira alrededor del eje $y$, a veces conviene usar tiras <strong>verticales</strong>: cada tira en $x$ barre una capa cilíndrica delgada de radio $x$, altura $f(x)$ y grosor $dx$.',
          'Desenrollada, la capa es casi una placa de $2\\pi x$ por $f(x)$ por $dx$: $$V = 2\\pi\\int_a^b x\\,f(x)\\,dx.$$'
        ]
      },
      {
        type: 'explainer', heading: 'Capas alrededor del eje y', short: 'Capas',
        title: 'La región bajo y = x − x² girando',
        intro: 'La región entre $y = x - x^2$ y el eje $x$ ($0 \\leq x \\leq 1$) gira alrededor del eje $y$.',
        diagram: 'shell-slice',
        steps: [
          { text: 'Una tira cerca del eje barre una capa angosta.', state: { x: 0.2 } },
          { text: 'Una tira en medio: radio $x$ y altura $x - x^2$.', state: { x: 0.5 } },
          { text: 'Lejos del eje la capa es ancha pero baja. En total: $2\\pi\\int_0^1 x(x - x^2)\\,dx = \\tfrac{\\pi}{6}$.', state: { x: 0.8 } }
        ]
      },
      {
        type: 'example', heading: 'El cono',
        problem: '<p>Calcula el volumen que genera $y = \\tfrac{x}{2}$, $0 \\leq x \\leq 4$, al girar alrededor del eje $x$.</p>',
        steps: [
          { text: 'Discos de radio $\\tfrac{x}{2}$.', math: 'V = \\pi\\int_0^4 \\frac{x^2}{4}\\,dx = \\frac{\\pi}{4}\\cdot\\frac{64}{3}' },
          { text: 'Compara con $\\tfrac{1}{3}\\pi r^2 h = \\tfrac{1}{3}\\pi(4)(4)$.' }
        ],
        answer: '$V = \\dfrac{16\\pi}{3} \\approx ' + fx(16 * Math.PI / 3) + '$',
        verify: { lab: 'volume', method: 'disk', f: 'x/2', a: 0, b: 4, value: 16 * Math.PI / 3 }
      },
      {
        type: 'example', heading: 'La esfera',
        problem: '<p>Deduce el volumen de una esfera de radio 2 girando $y = \\sqrt{4 - x^2}$ alrededor del eje $x$.</p>',
        steps: [
          { text: 'El radio al cuadrado es $4 - x^2$: la raíz desaparece.', math: 'V = \\pi\\int_{-2}^{2}(4 - x^2)\\,dx = \\pi\\left[4x - \\tfrac{x^3}{3}\\right]_{-2}^{2}' },
          { text: 'Evalúa.', math: 'V = \\pi\\left(\\tfrac{16}{3} + \\tfrac{16}{3}\\right) = \\tfrac{32\\pi}{3}' }
        ],
        answer: '$V = \\dfrac{32\\pi}{3}$, que es $\\tfrac{4}{3}\\pi r^3$ con $r = 2$.',
        verify: { lab: 'volume', method: 'disk', f: 'sqrt(4 - x^2)', a: -2, b: 2, value: 32 * Math.PI / 3 }
      },
      {
        type: 'example', heading: 'Arandelas',
        problem: '<p>La región entre $y = x$ y $y = x^2$ gira alrededor del eje $x$. Calcula el volumen.</p>',
        steps: [
          { text: 'Se cruzan en 0 y 1; en medio $x \\geq x^2$. Radio exterior $x$, interior $x^2$.', math: 'V = \\pi\\int_0^1 (x^2 - x^4)\\,dx = \\pi\\left(\\tfrac{1}{3} - \\tfrac{1}{5}\\right)' }
        ],
        answer: '$V = \\dfrac{2\\pi}{15} \\approx ' + fx(2 * Math.PI / 15) + '$',
        verify: { lab: 'volume', method: 'disk', f: 'x', g: 'x^2', a: 0, b: 1, value: 2 * Math.PI / 15 }
      },
      {
        type: 'example', heading: 'Capas cilíndricas',
        problem: '<p>La región bajo $y = \\sqrt{x}$, $0 \\leq x \\leq 4$, gira alrededor del eje $y$. Calcula el volumen.</p>',
        steps: [
          { text: 'Capas de radio $x$ y altura $\\sqrt{x}$.', math: 'V = 2\\pi\\int_0^4 x\\sqrt{x}\\,dx = 2\\pi\\int_0^4 x^{3/2}\\,dx' },
          { text: 'Integra.', math: '2\\pi\\cdot\\tfrac{2}{5}\\left[x^{5/2}\\right]_0^4 = \\tfrac{4\\pi}{5}\\cdot 32' }
        ],
        answer: '$V = \\dfrac{128\\pi}{5} \\approx ' + fx(128 * Math.PI / 5) + '$',
        verify: { lab: 'volume', method: 'shell', f: 'sqrt(x)', a: 0, b: 4, value: 128 * Math.PI / 5 }
      },
      {
        type: 'callout', heading: '¿Discos o capas?',
        body: 'Si giras alrededor del eje $x$ y la región está descrita como $y = f(x)$, usa discos. Si giras alrededor del eje $y$, las capas evitan despejar $x$ en función de $y$. Los dos métodos dan el mismo volumen; elige el que produce la integral más fácil.'
      }
    ],

    lab: {
      type: 'solid-revolution', title: 'Rebanar el sólido',
      intro: 'Elige discos (eje $x$) o capas (eje $y$), escribe la curva y mueve el número de piezas: la suma se acerca al volumen. Luego escribe tu resultado y compruébalo.',
      cfg: { n: 6 }
    },

    formulas: [
      { label: 'Discos', tex: 'V = \\pi\\int_a^b f(x)^2\\,dx' },
      { label: 'Arandelas', tex: 'V = \\pi\\int_a^b \\big(f(x)^2 - g(x)^2\\big)\\,dx' },
      { label: 'Capas (eje y)', tex: 'V = 2\\pi\\int_a^b x\\,\\big(f(x) - g(x)\\big)\\,dx' }
    ],

    exercises: [
      {
        id: 'c1-s15-paraboloide', title: 'Paraboloide',
        vars: { b: [1, 6, 1] },
        prompt: function (v) { return '<p>La región bajo $y = \\sqrt{x}$, $0 \\leq x \\leq ' + v.b + '$, gira alrededor del eje $x$. Calcula el volumen.</p>'; },
        check: 'numeric', tol: { rel: 0.005 },
        answer: function (v) { return Math.PI * v.b * v.b / 2; },
        mistakes: { noPi: function (v) { return v.b * v.b / 2; } },
        feedback: [{ when: 'noPi', say: 'Falta el factor $\\pi$ del área de cada disco.' }],
        oracle: { lab: 'volume', method: 'disk', f: function () { return 'sqrt(x)'; }, a: function () { return 0; }, b: function (v) { return v.b; } },
        hint: 'El radio al cuadrado es $(\\sqrt{x})^2 = x$.',
        solution: function (v) { return '$\\pi\\int_0^{' + v.b + '} x\\,dx = \\tfrac{\\pi\\cdot ' + v.b * v.b + '}{2} \\approx ' + fx(Math.PI * v.b * v.b / 2) + '$.'; }
      },
      {
        id: 'c1-s15-cono', title: 'Un cono',
        vars: { k: [1, 3, 1], h: [2, 6, 1] },
        prompt: function (v) { return '<p>La recta $y = ' + (v.k === 1 ? '' : v.k) + 'x$, $0 \\leq x \\leq ' + v.h + '$, gira alrededor del eje $x$. Calcula el volumen del cono.</p>'; },
        check: 'numeric', tol: { rel: 0.005 },
        answer: function (v) { return Math.PI * v.k * v.k * Math.pow(v.h, 3) / 3; },
        oracle: { lab: 'volume', method: 'disk', f: function (v) { return v.k + 'x'; }, a: function () { return 0; }, b: function (v) { return v.h; } },
        hint: '$\\pi\\int_0^h (kx)^2\\,dx$.',
        solution: function (v) { return '$\\pi\\,' + v.k * v.k + '\\,\\tfrac{' + v.h + '^3}{3} \\approx ' + fx(Math.PI * v.k * v.k * Math.pow(v.h, 3) / 3) + '$ (radio $' + v.k * v.h + '$, altura $' + v.h + '$).'; }
      },
      {
        id: 'c1-s15-esfera', title: 'Una esfera',
        vars: { R: [1, 5, 1] },
        prompt: function (v) { return '<p>Gira $y = \\sqrt{' + v.R * v.R + ' - x^2}$ alrededor del eje $x$. ¿Qué volumen tiene la esfera?</p>'; },
        check: 'numeric', tol: { rel: 0.005 },
        answer: function (v) { return 4 * Math.PI * Math.pow(v.R, 3) / 3; },
        mistakes: { half: function (v) { return 2 * Math.PI * Math.pow(v.R, 3) / 3; } },
        feedback: [{ when: 'half', say: 'Integraste solo de 0 a $R$: ese es media esfera.' }],
        oracle: { lab: 'volume', method: 'disk', f: function (v) { return 'sqrt(' + v.R * v.R + ' - x^2)'; }, a: function (v) { return -v.R; }, b: function (v) { return v.R; } },
        hint: 'Los límites son $\\pm R$ y el radio al cuadrado es $R^2 - x^2$.',
        solution: function (v) { return '$\\pi\\int_{-' + v.R + '}^{' + v.R + '}(' + v.R * v.R + ' - x^2)\\,dx = \\tfrac{4}{3}\\pi(' + v.R + ')^3 \\approx ' + fx(4 * Math.PI * Math.pow(v.R, 3) / 3) + '$.'; }
      },
      {
        id: 'c1-s15-arandela', title: 'Arandelas',
        vars: { m: [1, 3, 1] },
        prompt: function (v) { return '<p>La región entre $y = ' + (v.m === 1 ? '' : v.m) + 'x$ y $y = x^2$ gira alrededor del eje $x$. Calcula el volumen.</p>'; },
        check: 'numeric', tol: { rel: 0.005 },
        answer: function (v) { return 2 * Math.PI * Math.pow(v.m, 5) / 15; },
        mistakes: { squaredDiff: function (v) { return Math.PI * Math.pow(v.m, 5) / 30; } },
        feedback: [{ when: 'squaredDiff', say: 'Elevaste la resta: una arandela es $\\pi(R^2 - r^2)$, no $\\pi(R - r)^2$.' }],
        oracle: { lab: 'volume', method: 'disk', f: function (v) { return v.m + 'x'; }, g: function () { return 'x^2'; }, a: function () { return 0; }, b: function (v) { return v.m; } },
        hint: 'Se cruzan en 0 y $m$; radio exterior $mx$, interior $x^2$.',
        solution: function (v) { return '$\\pi\\int_0^{' + v.m + '}(' + v.m * v.m + 'x^2 - x^4)\\,dx = \\tfrac{2\\pi\\cdot ' + Math.pow(v.m, 5) + '}{15} \\approx ' + fx(2 * Math.PI * Math.pow(v.m, 5) / 15) + '$.'; }
      },
      {
        id: 'c1-s15-capas', title: 'Capas cilíndricas',
        vars: { b: [1, 4, 1] },
        prompt: function (v) { return '<p>La región bajo $y = x^2$, $0 \\leq x \\leq ' + v.b + '$, gira alrededor del eje $y$. Calcula el volumen.</p>'; },
        check: 'numeric', tol: { rel: 0.005 },
        answer: function (v) { return Math.PI * Math.pow(v.b, 4) / 2; },
        mistakes: { noTwo: function (v) { return Math.PI * Math.pow(v.b, 4) / 4; } },
        feedback: [{ when: 'noTwo', say: 'La circunferencia de cada capa es $2\\pi x$: falta el 2.' }],
        oracle: { lab: 'volume', method: 'shell', f: function () { return 'x^2'; }, a: function () { return 0; }, b: function (v) { return v.b; } },
        hint: '$V = 2\\pi\\int_0^b x\\cdot x^2\\,dx$.',
        solution: function (v) { return '$2\\pi\\int_0^{' + v.b + '} x^3\\,dx = \\tfrac{\\pi\\cdot ' + Math.pow(v.b, 4) + '}{2} \\approx ' + fx(Math.PI * Math.pow(v.b, 4) / 2) + '$.'; }
      },
      {
        id: 'c1-s15-metodo', title: 'Elegir el método',
        vars: {},
        prompt: function () { return '<p>La región bajo $y = \\sin x$, $0 \\leq x \\leq \\pi$, gira alrededor del eje $y$. ¿Qué método da la integral más directa?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Capas: $2\\pi\\int_0^{\\pi} x\\sin x\\,dx$', correct: true },
            { text: 'Discos: $\\pi\\int_0^{\\pi} \\sin^2 x\\,dx$', say: 'Esa fórmula es para girar alrededor del eje $x$.' },
            { text: 'Discos en $y$: hay que despejar $x = \\arcsin y$', say: 'Se puede, pero con dos ramas y mucho más trabajo.' },
            { text: 'No se puede calcular', say: 'Sí se puede: con capas y por partes (S11) da $2\\pi^2$.' }
          ];
        },
        answer: function () { return 'Capas: $2\\pi\\int_0^{\\pi} x\\sin x\\,dx$'; },
        hint: 'Alrededor del eje $y$, con la curva dada como $y = f(x)$.',
        solution: function () { return 'Con capas y por partes: $2\\pi\\left[-x\\cos x + \\sin x\\right]_0^{\\pi} = 2\\pi^2$.'; }
      }
    ],

    quiz: { tags: ['c1.S15'], count: 8 },

    errors: [
      'Olvidar el factor $\\pi$ (o el $2\\pi$ de las capas).',
      'Elevar la resta en arandelas: $\\pi(R - r)^2$ en lugar de $\\pi(R^2 - r^2)$.',
      'Usar discos en $x$ para una región que gira alrededor del eje $y$.',
      'Tomar mal los límites: son los de la región, no los del sólido completo.'
    ],

    teacher: {
      plan: ['Mostrar una pila de monedas o un rollo de papel.', 'Explainer de discos y comparación con el cono de geometría.', 'Arandelas con un ejemplo de hueco.', 'Capas alrededor del eje $y$ y elección del método.'],
      check: ['Que dibujen una rebanada típica y escriban su volumen antes de integrar.'],
      note: 'El ejemplo del seno con capas usa integración por partes (S11): buen repaso integrador.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 2</em>, §2.2 “Determining Volumes by Slicing”. <a href="' + OS + '2-2-determining-volumes-by-slicing">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 2</em>, §2.3 “Volumes of Revolution: Cylindrical Shells”. <a href="' + OS + '2-3-volumes-of-revolution-cylindrical-shells">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-14',
    next: null
  };
})();
