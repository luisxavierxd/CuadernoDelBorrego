/* =====================================================================
   Cálculo 1 · S01 · Razón de cambio y la derivada (bloque A · temas 1.1–1.2).
   Fuentes: OpenStax, Calculus Volume 1, §3.1, §3.2 y §3.4 (CC BY-NC-SA 4.0).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 4 : d)).toString(); }

  window.SESSION_DATA = {
    slug: 'sesion-01', number: '01', group: 'A · Derivada',
    title: 'Razón de cambio y la derivada', temario: ['1.1', '1.2'],
    minutes: 150,
    quote: 'La derivada responde una sola pregunta: ¿qué tan rápido cambia algo justo en este instante?',
    badges: [
      'Calcular una razón de cambio promedio como pendiente de una secante.',
      'Entender la derivada como el límite de esas pendientes cuando h → 0.',
      'Escribir la ecuación de la recta tangente en un punto.',
      'Leer la derivada con sus unidades: metros por segundo, pesos por pieza…'
    ],

    lesson: [
      {
        "type": "warmup",
        "heading": "Antes de empezar",
        "short": "Antes de empezar",
        "idea": "La derivada mide <strong>qué tan rápido cambia</strong> algo en un instante preciso, no en promedio.",
        "recall": [
          "La pendiente de una recta: $m = \\dfrac{y_2 - y_1}{x_2 - x_1}$ (cuánto sube por cada paso a la derecha).",
          "Evaluar una función: si $f(x) = x^2$, entonces $f(3) = 9$ y $f(3 + h) = (3 + h)^2$.",
          "Desarrollar $(a + b)^2 = a^2 + 2ab + b^2$ para simplificar."
        ],
        "why": "Todo lo que cambia tiene una razón de cambio: la velocidad de un auto, el crecimiento de una población, lo que cuesta producir una pieza más. La derivada es la herramienta para medirlo en el momento exacto que te interesa."
      },
      {
        "type": "concept",
        "heading": "Imagínalo así",
        "short": "Imagínalo así",
        "body": [
          "Piensa en el velocímetro de un auto. Si recorres 120 km en 2 horas, tu velocidad <em>promedio</em> fue 60 km/h, pero en algún momento ibas a 80 y en otro estabas parado en un semáforo. El velocímetro no te da el promedio: te dice qué tan rápido vas <em>justo ahora</em>.",
          "La razón de cambio promedio es como el cálculo de 120 km entre 2 h: mira dos momentos separados. Si acercas cada vez más esos dos momentos (1 hora, 1 minuto, 1 segundo…), el promedio se parece cada vez más a lo que marca el velocímetro. Ese valor al que te acercas es la derivada.",
          "En la gráfica pasa lo mismo: la recta que une dos puntos se llama <strong>secante</strong>; si el segundo punto se acerca al primero, la secante gira hasta convertirse en la <strong>tangente</strong>, la recta que apenas \"roza\" la curva. La pendiente de esa tangente es la derivada."
        ]
      },
      {
        type: 'concept', heading: 'Razón de cambio promedio', short: 'Razón promedio',
        body: [
          'Si una cantidad $y = f(x)$ pasa de $f(a)$ a $f(b)$, su <strong>razón de cambio promedio</strong> en $[a, b]$ es $$\\frac{\\Delta y}{\\Delta x} = \\frac{f(b) - f(a)}{b - a}.$$',
          'En la gráfica es la pendiente de la <strong>recta secante</strong> que une los dos puntos. Si $s(t)$ es la posición de un carrito, esa razón es su rapidez media en metros por segundo.'
        ],
        diagram: 'rate-of-change',
        caption: 'La rapidez media entre dos instantes es la pendiente de la secante: $\\Delta s / \\Delta t$.'
      },
      {
        type: 'explainer', heading: 'De la secante a la tangente', short: 'Secante → tangente',
        title: '$f(x) = \\tfrac{x^2}{2} + 1$ en $a = 1$',
        intro: 'Acerca el segundo punto al primero y mira qué pasa con la pendiente de la secante.',
        diagram: 'secant-to-tangent',
        steps: [
          { text: 'Con $h = 2$ la secante une $x = 1$ con $x = 3$; su pendiente es $2$.', state: { h: 2 } },
          { text: 'Con $h = 1$ la pendiente baja a $1.5$.', state: { h: 1 } },
          { text: 'Con $h = 0.3$ ya casi toca la curva en un solo punto: pendiente $1.15$.', state: { h: 0.3 } },
          { text: 'Cuando $h \\to 0$ la pendiente tiende a $1$: esa es la pendiente de la <strong>tangente</strong>, la derivada $f\'(1) = 1$.', state: { h: 0.02 } }
        ]
      },
      {
        type: 'concept', heading: 'La derivada', short: 'La derivada',
        body: [
          'La <strong>derivada</strong> de $f$ en $a$ es el límite de las pendientes de las secantes: $$f\'(a) = \\lim_{h \\to 0} \\frac{f(a + h) - f(a)}{h}.$$',
          'Si el límite existe, la <strong>recta tangente</strong> en $(a, f(a))$ es $$y = f(a) + f\'(a)\\,(x - a).$$',
          'Haciendo lo mismo en cada $x$ obtienes una función nueva, $f\'(x)$, que también se escribe $\\dfrac{dy}{dx}$. Sus unidades son las de $y$ entre las de $x$: si $s$ está en metros y $t$ en segundos, $s\'(t)$ es una velocidad en m/s.'
        ],
        teacher: 'Insiste en que $h = 0$ directo da $0/0$: primero se simplifica el cociente y luego se toma el límite.'
      },
      {
        "type": "recipe",
        "heading": "Receta: derivar con la definición",
        "short": "Receta",
        "intro": "Cuando te pidan la derivada \"usando la definición\", sigue siempre estos pasos:",
        "steps": [
          {
            "text": "Escribe $f(x + h)$: cambia cada $x$ por $(x + h)$, con paréntesis.",
            "tip": "Si $f(x) = 3x^2$, entonces $f(x + h) = 3(x + h)^2$, no $3x^2 + h$."
          },
          {
            "text": "Resta $f(x + h) - f(x)$ y simplifica. Todo lo que no tenga $h$ se debe cancelar.",
            "tip": "Si te quedan términos sin $h$, revisa el desarrollo: es la señal de un error."
          },
          {
            "text": "Divide entre $h$. Como todos los términos tienen al menos una $h$, se puede sacar como factor y cancelar."
          },
          {
            "text": "Ahora sí, haz $h \\to 0$: sustituye $h = 0$ en lo que quedó."
          },
          {
            "text": "Si te piden la derivada en un punto (por ejemplo $x = 2$), sustituye al final."
          }
        ],
        "note": "La recta tangente en $x = a$ se escribe con la pendiente que obtuviste: $y = f(a) + f'(a)(x - a)$."
      },
      {
        type: 'example', heading: 'Razón de cambio promedio',
        problem: '<p>Calcula la razón de cambio promedio de $f(x) = x^2$ en el intervalo $[1, 3]$.</p>',
        steps: [
          { text: 'Evalúa en los extremos: $f(1) = 1$ y $f(3) = 9$.' },
          { text: 'Divide el cambio en $y$ entre el cambio en $x$.', math: '\\frac{f(3) - f(1)}{3 - 1} = \\frac{9 - 1}{2} = 4' }
        ],
        answer: 'La razón promedio es $4$: en promedio, $f$ sube 4 unidades por cada unidad de $x$.',
        verify: { lab: 'secant', f: 'x^2', a: 1, h: 2, value: 4 }
      },
      {
        type: 'example', heading: 'Derivada con la definición',
        problem: '<p>Usa la definición para calcular $f\'(3)$ si $f(x) = x^2$.</p>',
        steps: [
          { text: 'Escribe el cociente de diferencias.', math: '\\frac{f(3 + h) - f(3)}{h} = \\frac{(3 + h)^2 - 9}{h}' },
          { text: 'Desarrolla y simplifica antes de tomar el límite.', math: '\\frac{9 + 6h + h^2 - 9}{h} = \\frac{h(6 + h)}{h} = 6 + h' },
          { text: 'Ahora sí, $h \\to 0$.', math: 'f\'(3) = \\lim_{h \\to 0} (6 + h) = 6' }
        ],
        answer: '$f\'(3) = 6$.',
        verify: { lab: 'derivative-at', f: 'x^2', a: 3, value: 6 }
      },
      {
        type: 'example', heading: 'Recta tangente',
        problem: '<p>Encuentra la recta tangente a $f(x) = \\sqrt{x}$ en $x = 4$, sabiendo que $f\'(x) = \\dfrac{1}{2\\sqrt{x}}$.</p>',
        steps: [
          { text: 'El punto de tangencia es $(4, f(4)) = (4, 2)$.' },
          { text: 'La pendiente es la derivada en 4.', math: 'f\'(4) = \\frac{1}{2\\sqrt{4}} = \\frac{1}{4}' },
          { text: 'Sustituye en $y = f(a) + f\'(a)(x - a)$.', math: 'y = 2 + \\tfrac{1}{4}(x - 4) = \\tfrac{1}{4}x + 1' }
        ],
        answer: 'La tangente es $y = \\tfrac{1}{4}x + 1$.',
        verify: { lab: 'tangent', f: 'sqrt(x)', a: 4, m: 0.25, b: 1 }
      },
      {
        type: 'example', heading: 'Velocidad instantánea',
        problem: '<p>Un robot avanza sobre un riel y su posición es $s(t) = 5t^2$ metros. ¿Qué velocidad tiene en $t = 2$ s?</p>',
        steps: [
          { text: 'La velocidad instantánea es $s\'(2)$.', math: '\\frac{s(2 + h) - s(2)}{h} = \\frac{5(4 + 4h + h^2) - 20}{h} = 20 + 5h' },
          { text: 'Toma el límite.', math: 's\'(2) = \\lim_{h \\to 0}(20 + 5h) = 20\\ \\text{m/s}' }
        ],
        answer: 'En $t = 2$ s va a $20$ m/s.',
        verify: { lab: 'derivative-at', f: '5x^2', a: 2, value: 20 }
      },
      {
        type: 'callout', heading: 'Promedio contra instantáneo',
        body: 'La razón promedio necesita dos puntos; la derivada, uno solo. La derivada es el límite de las razones promedio en intervalos cada vez más cortos.'
      },
      {
        "type": "faq",
        "heading": "Dudas comunes",
        "short": "Dudas comunes",
        "items": [
          {
            "q": "¿Por qué no puedo poner $h = 0$ desde el principio?",
            "a": "Porque quedaría $\\tfrac{0}{0}$, que no significa nada. Primero simplificas para quitar la $h$ del denominador y después ya puedes sustituir $h = 0$."
          },
          {
            "q": "¿Qué diferencia hay entre $f(a)$ y $f'(a)$?",
            "a": "$f(a)$ es la <em>altura</em> de la gráfica en $x = a$; $f'(a)$ es la <em>inclinación</em> ahí. Uno dice dónde está el punto y el otro hacia dónde va la curva."
          },
          {
            "q": "¿Una derivada negativa significa que algo salió mal?",
            "a": "No. Significa que la función va bajando en ese punto: por ejemplo, un tanque que se vacía o una temperatura que baja."
          },
          {
            "q": "¿En qué unidades está la derivada?",
            "a": "En unidades de \"lo de arriba entre lo de abajo\". Si $h(t)$ está en metros y $t$ en segundos, $h'(t)$ está en metros por segundo."
          }
        ]
      },
      {
        "type": "recap",
        "heading": "Lo que te llevas",
        "short": "Resumen",
        "points": [
          "Razón de cambio promedio: pendiente de la secante entre dos puntos.",
          "Derivada: el límite de ese promedio cuando los puntos se juntan; es la pendiente de la tangente.",
          "Con la definición: $f(x + h)$, restar, dividir entre $h$ y hacer $h \\to 0$.",
          "La derivada tiene unidades y signo: te dice qué tan rápido y hacia dónde cambia algo."
        ]
      }
    ],

    lab: {
      type: 'secant-tangent', title: 'La secante se vuelve tangente',
      intro: 'Elige una función y un punto $a$. Al mover $h$ hacia cero, la tabla muestra cómo la pendiente de la secante se acerca a la derivada.',
      cfg: {}
    },

    formulas: [
      { label: 'Razón promedio', tex: '\\frac{f(b) - f(a)}{b - a}' },
      { label: 'Derivada en a', tex: 'f\'(a) = \\lim_{h \\to 0} \\frac{f(a+h) - f(a)}{h}' },
      { label: 'Recta tangente', tex: 'y = f(a) + f\'(a)(x - a)' },
      { label: 'Notación', tex: 'f\'(x) = \\frac{dy}{dx}' }
    ],

    exercises: [
      {
        id: 'c1-s01-promedio', title: 'Razón promedio',
        vars: { a: [2, 6, 1], b: [1, 9, 1], p: [0, 3, 1], q: [4, 7, 1] },
        // con q − p = 1, no dividir da lo mismo que dividir
        where: function (v) { return v.q - v.p > 1; },
        prompt: function (v) { return '<p>Calcula la razón de cambio promedio de $f(x) = ' + v.a + 'x^2 + ' + v.b + '$ en el intervalo $[' + v.p + ', ' + v.q + ']$.</p>'; },
        check: 'numeric',
        answer: function (v) { return v.a * (v.p + v.q); },
        mistakes: { noDivide: function (v) { return v.a * (v.q * v.q - v.p * v.p); } },
        feedback: [{ when: 'noDivide', say: 'Calculaste el cambio en y, pero falta dividir entre el cambio en x.' }],
        oracle: { lab: 'value', value: function (v) { var f = function (x) { return v.a * x * x + v.b; }; return (f(v.q) - f(v.p)) / (v.q - v.p); } },
        hint: 'Evalúa f en los dos extremos y divide la diferencia entre $q - p$.',
        solution: function (v) {
          var fq = v.a * v.q * v.q + v.b, fp = v.a * v.p * v.p + v.b;
          return '$$\\frac{f(' + v.q + ') - f(' + v.p + ')}{' + v.q + ' - ' + v.p + '} = \\frac{' + fq + ' - ' + fp + '}{' + (v.q - v.p) + '} = ' + v.a * (v.p + v.q) + '$$';
        }
      },
      {
        id: 'c1-s01-definicion', title: 'Derivada con la definición',
        vars: { c: [2, 9, 1], a: [1, 6, 1] },
        prompt: function (v) { return '<p>Si $f(x) = ' + v.c + 'x^2$, usa la definición para calcular $f\'(' + v.a + ')$.</p>'; },
        check: 'numeric',
        answer: function (v) { return 2 * v.c * v.a; },
        mistakes: { usedH1: function (v) { return v.c * (2 * v.a + 1); } },
        feedback: [{ when: 'usedH1', say: 'Esa es la pendiente de una secante con h = 1. La derivada es el límite cuando h → 0.' }],
        oracle: { lab: 'derivative-at', f: function (v) { return v.c + 'x^2'; }, a: function (v) { return v.a; } },
        hint: 'Desarrolla $' + '(a+h)^2' + '$, cancela lo que no tiene h, divide entre h y después toma el límite.',
        solution: function (v) {
          return '$$\\frac{' + v.c + '(' + v.a + '+h)^2 - ' + v.c + '\\cdot' + (v.a * v.a) + '}{h} = ' + (2 * v.c * v.a) + ' + ' + v.c + 'h \\;\\xrightarrow{h \\to 0}\\; ' + (2 * v.c * v.a) + '$$';
        }
      },
      {
        id: 'c1-s01-secante', title: 'Pendiente de una secante',
        vars: { a: [1, 3, 1], h: [0.1, 1, 0.1] },
        prompt: function (v) { return '<p>Para $f(x) = x^3$, calcula la pendiente de la secante entre $x = ' + v.a + '$ y $x = ' + fx(v.a + v.h) + '$.</p>'; },
        check: 'numeric',
        answer: function (v) { return (Math.pow(v.a + v.h, 3) - Math.pow(v.a, 3)) / v.h; },
        oracle: { lab: 'value', value: function (v) { return 3 * v.a * v.a + 3 * v.a * v.h + v.h * v.h; } },
        hint: 'Es $\\dfrac{f(a+h) - f(a)}{h}$ con los números dados.',
        solution: function (v) { return '$$\\frac{' + fx(v.a + v.h) + '^3 - ' + v.a + '^3}{' + v.h + '} = ' + fx((Math.pow(v.a + v.h, 3) - Math.pow(v.a, 3)) / v.h) + '$$ Cuando $h \\to 0$ se acercaría a $f\'(' + v.a + ') = ' + 3 * v.a * v.a + '$.'; }
      },
      {
        id: 'c1-s01-tangente', title: 'Recta tangente',
        vars: { a: [-4, 4, 1] },
        where: function (v) { return v.a !== 0; },
        prompt: function (v) { return '<p>La recta tangente a $f(x) = x^2$ en $x = ' + v.a + '$ es $y = mx + b$. Sabiendo que $f\'(x) = 2x$, ¿cuánto vale $b$?</p>'; },
        check: 'numeric', tol: { abs: 0.01 },
        answer: function (v) { return -v.a * v.a; },
        mistakes: { plusSign: function (v) { return v.a * v.a; } },
        feedback: [{ when: 'plusSign', say: 'Revisa el signo: $y = a^2 + 2a(x - a) = 2a\\,x - a^2$.' }],
        oracle: { lab: 'value', value: function (v) { return v.a * v.a - 2 * v.a * v.a; } },
        hint: 'Usa $y = f(a) + f\'(a)(x - a)$ y desarrolla.',
        solution: function (v) { return '$$y = ' + (v.a * v.a) + ' + ' + (2 * v.a) + '(x - (' + v.a + ')) = ' + (2 * v.a) + 'x ' + (-v.a * v.a < 0 ? '- ' + v.a * v.a : '+ ' + (-v.a * v.a)) + '$$ Así que $b = ' + (-v.a * v.a) + '$.'; }
      },
      {
        id: 'c1-s01-velocidad', title: 'Velocidad instantánea',
        vars: { k: [1, 6, 1], v0: [0, 8, 1], T: [1, 5, 1] },
        prompt: function (v) { return '<p>La posición de un robot es $s(t) = ' + v.k + 't^2 + ' + v.v0 + 't$ metros. Sabiendo que $s\'(t) = ' + (2 * v.k) + 't + ' + v.v0 + '$, ¿qué velocidad lleva en $t = ' + v.T + '$ s?</p>'; },
        check: 'numeric', unit: 'm/s',
        answer: function (v) { return 2 * v.k * v.T + v.v0; },
        mistakes: { position: function (v) { return v.k * v.T * v.T + v.v0 * v.T; } },
        feedback: [{ when: 'position', say: 'Esa es la posición $s(T)$. La velocidad es la derivada $s\'(T)$.' }],
        where: function (v) { return Math.abs((v.k * v.T * v.T + v.v0 * v.T) - (2 * v.k * v.T + v.v0)) > 0.05 * (2 * v.k * v.T + v.v0); },
        oracle: { lab: 'derivative-at', f: function (v) { return v.k + 'x^2 + ' + v.v0 + 'x'; }, a: function (v) { return v.T; } },
        hint: 'Evalúa la derivada, no la posición.',
        solution: function (v) { return '$s\'(' + v.T + ') = ' + (2 * v.k) + '(' + v.T + ') + ' + v.v0 + ' = ' + (2 * v.k * v.T + v.v0) + '$ m/s.'; }
      },
      {
        id: 'c1-s01-significado', title: 'Qué significa f′(a)',
        vars: { a: [1, 9, 1], m: [2, 6, 1] },
        prompt: function (v) { return '<p>Si $C(x)$ es el costo en pesos de fabricar $x$ piezas y $C\'(' + (v.a * 100) + ') = ' + v.m + '$, ¿qué significa?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: 'Cerca de ' + v.a * 100 + ' piezas, cada pieza extra cuesta unos ' + v.m + ' pesos', correct: true },
            { text: 'Fabricar ' + v.a * 100 + ' piezas cuesta ' + v.m + ' pesos', say: 'Eso sería $C(' + v.a * 100 + ')$, no su derivada.' },
            { text: 'El costo promedio por pieza es ' + v.m + ' pesos', say: 'El promedio es $C(x)/x$; la derivada es el costo de la siguiente pieza.' },
            { text: 'El costo baja ' + v.m + ' pesos por pieza', say: 'Una derivada positiva indica que el costo sube.' }
          ];
        },
        answer: function (v) { return 'Cerca de ' + v.a * 100 + ' piezas, cada pieza extra cuesta unos ' + v.m + ' pesos'; },
        hint: 'Las unidades de $C\'$ son pesos por pieza.',
        solution: function (v) { return 'La derivada es una razón de cambio: pesos por pieza. Cerca de $x = ' + v.a * 100 + '$, producir una pieza más cuesta aproximadamente $' + v.m + '$ pesos.'; }
      }
    ],

    quiz: { tags: ['c1.S01'], count: 8 },

    errors: [
      'Sustituir $h = 0$ antes de simplificar: sale $0/0$, que no dice nada.',
      'Confundir la razón promedio (dos puntos) con la derivada (un punto).',
      'Usar $f\'(a)$ como ordenada de la tangente: la tangente pasa por $(a, f(a))$, no por $(a, f\'(a))$.',
      'Olvidar las unidades: si $s$ está en metros y $t$ en segundos, $s\'$ está en m/s.'
    ],

    teacher: {
      plan: [
        'Empieza con una tabla de posiciones de un carrito y calcula rapideces medias.',
        'Usa el explainer y el lab para que vean la pendiente de la secante acercarse a un número.',
        'Formaliza la definición y haz dos derivadas a mano antes de mostrar atajos (S02).'
      ],
      check: ['Que simplifiquen el cociente antes de tomar el límite.', 'Que escriban unidades en los problemas de velocidad.'],
      note: 'En S02 llegan las fórmulas; aquí conviene que la definición quede clara.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 1</em>, §3.1 “Defining the Derivative”. <a href="https://openstax.org/books/calculus-volume-1/pages/3-1-defining-the-derivative">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 1</em>, §3.2 “The Derivative as a Function”. <a href="https://openstax.org/books/calculus-volume-1/pages/3-2-the-derivative-as-a-function">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 1</em>, §3.4 “Derivatives as Rates of Change”. <a href="https://openstax.org/books/calculus-volume-1/pages/3-4-derivatives-as-rates-of-change">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: null,
    next: 'sesion-02'
  };
})();
