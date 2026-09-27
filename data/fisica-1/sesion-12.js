/* =====================================================================
   Física 1 · S12 · Trabajo, energía cinética y teorema trabajo-energía (bloque D).
   Fuente: OpenStax, University Physics Volume 1, §7.1–7.4 (CC BY-NC-SA 4.0).
   g = 9.81 m/s². Las cuentas se comprueban contra LabMath.work (lab work-area).
   ===================================================================== */
(function () {
  var g = 9.81, RAD = Math.PI / 180;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function cs(t) { return Math.cos(t * RAD); }
  function sn(t) { return Math.sin(t * RAD); }
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 1)) return false;
      }
      return true;
    };
  }

  var e1 = { F: 50, th: 30, d: 10 }; e1.W = e1.F * e1.d * cs(e1.th);
  var e2 = { m: 20, F: 120, d: 8, mu: 0.3 }; e2.WF = e2.F * e2.d; e2.Wf = -e2.mu * e2.m * g * e2.d; e2.W = e2.WF + e2.Wf; e2.v = Math.sqrt(2 * e2.W / e2.m);
  var e3 = { k: 400, x: 0.15 }; e3.W = 0.5 * e3.k * e3.x * e3.x;
  var e4 = { m: 2, v0: 1 }; e4.W = 64; e4.v = Math.sqrt(e4.v0 * e4.v0 + 2 * e4.W / e4.m);
  var e5 = { m: 500, h: 12, t: 20 }; e5.P = e5.m * g * e5.h / e5.t;
  var e6 = { m: 1200, v: 25, d: 50 }; e6.W = -0.5 * e6.m * e6.v * e6.v; e6.F = -e6.W / e6.d;

  var data = window.SESSION_DATA = {
    slug: 'sesion-12', number: '12', group: 'D · Trabajo y energía',
    title: 'Trabajo, energía cinética y teorema trabajo-energía', temario: [],
    minutes: 180,
    quote: 'El trabajo es cómo una fuerza cambia la energía de un cuerpo: si ayuda al movimiento lo acelera, si se opone lo frena.',
    badges: [
      'Calcular el trabajo de una fuerza constante con $W = Fd\\cos\\theta$.',
      'Obtener el trabajo como área bajo $F(x)$, incluido el resorte.',
      'Usar $W_{neto} = \\Delta K$ para encontrar rapideces sin cinemática.',
      'Calcular potencia media e instantánea.'
    ],

    lesson: [
      {
        type: 'explainer', heading: 'El trabajo de una fuerza constante', short: 'Trabajo con ángulo',
        title: 'Solo cuenta la parte a lo largo del desplazamiento',
        intro: 'Una fuerza hace trabajo cuando empuja o jala a lo largo del desplazamiento. La parte perpendicular no cambia la rapidez.',
        diagram: 'work-angle',
        steps: [
          { text: 'Con la fuerza a lo largo del desplazamiento ($\\theta = 0$), todo cuenta: $W = Fd$.', state: { th: 0 } },
          { text: 'Con ángulo, solo la componente $F\\cos\\theta$ va a lo largo: $$W = Fd\\cos\\theta$$ La unidad es el joule: $1\\ \\text{J} = 1\\ \\text{N·m}$.', state: { th: 35 } },
          { text: 'A $90^\\circ$ la fuerza no trabaja. Así pasa con la normal en un piso plano y con la fuerza centrípeta en un círculo.', state: { th: 90 } },
          { text: 'Si la fuerza apunta en contra del movimiento, $\\cos\\theta < 0$ y el trabajo es negativo: la fricción siempre hace trabajo negativo al deslizar.', state: { th: 150 } }
        ]
      },
      {
        type: 'example', heading: 'Jalar una caja con una cuerda inclinada',
        problem: '<p>Jalas una caja $' + e1.d + '\\ \\text{m}$ por el piso con una cuerda que forma $' + e1.th + '^\\circ$ con la horizontal y una tensión de $' + e1.F + '\\ \\text{N}$. ¿Cuánto trabajo hace la cuerda?</p>',
        steps: [
          { text: 'El desplazamiento es horizontal y la fuerza forma $' + e1.th + '^\\circ$ con él.', math: 'W = Fd\\cos\\theta = (50)(10)\\cos 30^\\circ' },
          { text: 'Calcula.', math: 'W = 500(0.866) = ' + fx(e1.W, 1) + '\\ \\text{J}' },
          { text: 'La componente vertical $F\\sin\\theta$ no trabaja, pero sí cambia la normal (y con ella la fricción, como en S10).' }
        ],
        answer: '$W \\approx ' + fx(e1.W, 1) + '\\ \\text{J}$.',
        verify: { lab: 'call', mod: 'work', fn: 'constant', args: [e1.F, e1.d, e1.th], value: e1.W }
      },
      {
        type: 'concept', heading: 'Energía cinética y el teorema trabajo-energía', short: 'Trabajo-energía',
        body: [
          'La <strong>energía cinética</strong> de un cuerpo de masa $m$ y rapidez $v$ es $$K = \\tfrac{1}{2}mv^2$$ Siempre es positiva y se mide en joules.',
          'El <strong>teorema trabajo-energía</strong> dice que el trabajo de <em>todas</em> las fuerzas (el trabajo neto) es el cambio de energía cinética: $$W_{neto} = \\Delta K = \\tfrac{1}{2}mv_f^2 - \\tfrac{1}{2}mv_0^2$$',
          'Sale de la segunda ley y de $v_f^2 = v_0^2 + 2ad$. Su ventaja: relaciona fuerzas con rapideces sin pasar por el tiempo.'
        ]
      },
      {
        type: 'example', heading: 'Trabajo neto con fricción',
        problem: '<p>Empujas horizontalmente una caja de $' + e2.m + '\\ \\text{kg}$ con $' + e2.F + '\\ \\text{N}$ a lo largo de $' + e2.d + '\\ \\text{m}$ ($\\mu_k = ' + e2.mu + '$). Parte del reposo. ¿Qué rapidez lleva al final?</p>',
        steps: [
          { text: 'Trabajo de cada fuerza. La normal y el peso son perpendiculares: no trabajan.', math: 'W_F = (120)(8) = ' + fx(e2.WF) + '\\ \\text{J} \\qquad W_f = -\\mu_k mg\\,d = -' + fx(-e2.Wf) + '\\ \\text{J}' },
          { text: 'Trabajo neto.', math: 'W_{neto} = ' + fx(e2.WF) + ' - ' + fx(-e2.Wf) + ' = ' + fx(e2.W) + '\\ \\text{J}' },
          { text: 'Teorema trabajo-energía con $v_0 = 0$.', math: '\\tfrac{1}{2}(20)v^2 = ' + fx(e2.W) + ' \\;\\Rightarrow\\; v = ' + fx(e2.v, 3) + '\\ \\text{m/s}' }
        ],
        answer: '$v \\approx ' + fx(e2.v) + '\\ \\text{m/s}$.',
        verify: { lab: 'call', mod: 'work', fn: 'finalSpeed', args: [e2.m, 0, e2.W], value: e2.v }
      },
      {
        type: 'explainer', heading: 'El trabajo es un área', short: 'Área bajo F(x)',
        title: 'Cuando la fuerza cambia con la posición',
        intro: 'Si $F$ depende de $x$, no se puede usar $Fd$. El trabajo es el área bajo la gráfica de $F$ contra $x$: $$W = \\int_{x_1}^{x_2} F(x)\\,dx$$',
        diagram: 'work-area-explainer',
        steps: [
          { text: 'Con $F$ constante el área es un rectángulo: vuelve a salir $W = Fd$.', state: { show: 'const' } },
          { text: 'Un resorte hace $F = kx$ (en magnitud): el área es un triángulo de base $x$ y altura $kx$, así que el trabajo para estirarlo o comprimirlo es $$W = \\tfrac{1}{2}kx^2$$', state: { show: 'spring' } },
          { text: 'Con cualquier otra $F(x)$, el área se obtiene con la integral. Arriba del eje el trabajo es positivo; abajo, negativo.', state: { show: 'var' } }
        ]
      },
      {
        type: 'example', heading: 'Comprimir un resorte',
        problem: '<p>¿Cuánto trabajo hay que hacer para comprimir $' + fx(e3.x * 100, 0) + '\\ \\text{cm}$ un resorte de $k = ' + e3.k + '\\ \\text{N/m}$ desde su largo natural?</p>',
        steps: [
          { text: 'La fuerza que aplicas crece de $0$ a $kx$: el área es un triángulo.', math: 'W = \\tfrac{1}{2}kx^2 = \\tfrac{1}{2}(400)(0.15)^2' },
          { text: 'Calcula.', math: 'W = ' + fx(e3.W, 2) + '\\ \\text{J}' },
          { text: 'Al soltarlo, el resorte hace ese mismo trabajo sobre lo que empuje. Con $kx^2$ (sin el ½) saldría el doble: es el error más común.' }
        ],
        answer: '$W = ' + fx(e3.W, 2) + '\\ \\text{J}$.',
        verify: { lab: 'call', mod: 'work', fn: 'spring', args: [e3.k, e3.x, 0], value: e3.W }
      },
      {
        type: 'example', heading: 'Una fuerza que crece con la posición',
        problem: '<p>Sobre un carrito de $' + e4.m + '\\ \\text{kg}$ que va a $' + e4.v0 + '\\ \\text{m/s}$ actúa una fuerza $F(x) = 3x^2$ (en N, con $x$ en m) de $x = 0$ a $x = 4\\ \\text{m}$. ¿Qué rapidez tiene al final?</p>',
        steps: [
          { text: 'Trabajo: área bajo $F(x)$.', math: 'W = \\int_0^4 3x^2\\,dx = x^3\\Big|_0^4 = 64\\ \\text{J}' },
          { text: 'Teorema trabajo-energía.', math: '\\tfrac{1}{2}(2)v^2 = \\tfrac{1}{2}(2)(1)^2 + 64 = 65 \\;\\Rightarrow\\; v = \\sqrt{65} = ' + fx(e4.v, 3) + '\\ \\text{m/s}' },
          { text: 'Tomar la fuerza final como si fuera constante daría $F(4)\\cdot 4 = 192$ J: el triple.' }
        ],
        answer: '$v = \\sqrt{65} \\approx ' + fx(e4.v) + '\\ \\text{m/s}$.',
        verify: { lab: 'call', mod: 'work', fn: 'work', math: true, args: ['3x^2', 0, 4], value: e4.W }
      },
      {
        type: 'example', heading: 'Frenar un auto',
        problem: '<p>Un auto de $' + e6.m + '\\ \\text{kg}$ va a $' + e6.v + '\\ \\text{m/s}$ y frena hasta detenerse en $' + e6.d + '\\ \\text{m}$. ¿Qué fuerza media hacen los frenos?</p>',
        steps: [
          { text: 'Todo lo que tenía de energía cinética lo quita el trabajo de los frenos.', math: 'W = 0 - \\tfrac{1}{2}(1200)(25)^2 = ' + fx(e6.W) + '\\ \\text{J}' },
          { text: 'La fuerza apunta contra el movimiento: $W = -Fd$.', math: 'F = \\frac{' + fx(-e6.W) + '}{50} = ' + fx(e6.F) + '\\ \\text{N}' },
          { text: 'La distancia de frenado crece con $v^2$: al doble de rapidez, cuatro veces la distancia.' }
        ],
        answer: '$F = ' + fx(e6.F) + '\\ \\text{N}$.',
        verify: { lab: 'call', mod: 'work', fn: 'finalSpeed', args: [e6.m, e6.v, -e6.F * e6.d], value: 0 }
      },
      {
        type: 'example', heading: 'Potencia de un motor',
        problem: '<p>Un montacargas sube $' + e5.m + '\\ \\text{kg}$ a velocidad constante una altura de $' + e5.h + '\\ \\text{m}$ en $' + e5.t + '\\ \\text{s}$. ¿Qué potencia media entrega?</p>',
        steps: [
          { text: 'A velocidad constante la fuerza del motor iguala al peso.', math: 'W = mgh = (500)(9.81)(12) = ' + fx(e5.m * g * e5.h) + '\\ \\text{J}' },
          { text: 'Potencia media: trabajo entre tiempo.', math: 'P = \\frac{W}{t} = ' + fx(e5.P) + '\\ \\text{W}' },
          { text: 'Otra forma: $P = Fv = mg\\cdot(12/20) = ' + fx(e5.m * g * 0.6) + '$ W. Son unos ' + fx(e5.P / 746, 1) + ' hp.' }
        ],
        answer: '$P \\approx ' + fx(e5.P, 0) + '\\ \\text{W}$.',
        verify: { lab: 'call', mod: 'work', fn: 'constant', args: [e5.m * g, e5.h, 0], value: e5.P * e5.t }
      },
      {
        type: 'callout', heading: 'Antes de sumar trabajos',
        body: [
          'Haz el DCL y calcula el trabajo de <em>cada</em> fuerza con su propio ángulo. Las perpendiculares al desplazamiento no trabajan.',
          'El trabajo es un escalar: se suma con signo, no como vector.'
        ]
      }
    ],

    lab: {
      type: 'work-area', title: 'Trabajo como área bajo F(x)',
      intro: 'Escribe una fuerza $F(x)$ y los límites: el lab sombrea el área, calcula el trabajo y la rapidez final con $W = \\Delta K$. Compara tu $W$; detecta si usaste la fuerza final como constante, si te sobra un 2 o si el signo está al revés.',
      cfg: { start: 2 }
    },

    formulas: [
      { label: 'Trabajo de F constante', tex: 'W = Fd\\cos\\theta' },
      { label: 'Trabajo de F(x)', tex: 'W = \\int_{x_1}^{x_2} F(x)\\,dx' },
      { label: 'Resorte', tex: 'W = \\tfrac{1}{2}kx^2' },
      { label: 'Energía cinética', tex: 'K = \\tfrac{1}{2}mv^2' },
      { label: 'Trabajo-energía', tex: 'W_{neto} = \\Delta K' },
      { label: 'Potencia', tex: 'P = \\frac{W}{t} = Fv' }
    ],

    exercises: [
      {
        id: 'f1-s12-angulo', title: 'Trabajo con una fuerza inclinada',
        vars: { F: [20, 200, 10], th: [10, 70, 5], d: [2, 30, 1] },
        prompt: function (v) { return '<p>Una cuerda jala un trineo $' + v.d + '\\ \\text{m}$ por la nieve con $' + v.F + '\\ \\text{N}$ a $' + v.th + '^\\circ$ sobre la horizontal. ¿Cuánto trabajo hace?</p>'; },
        check: 'numeric', unit: 'J',
        answer: function (v) { return v.F * v.d * cs(v.th); },
        baseWhere: function (v) { return v.th !== 45; },
        mistakes: { sinInstead: function (v) { return v.F * v.d * sn(v.th); }, noAngle: function (v) { return v.F * v.d; } },
        feedback: [
          { when: 'sinInstead', say: 'Usaste seno: la componente a lo largo del desplazamiento es $F\\cos\\theta$.' },
          { when: 'noAngle', say: 'Te faltó el ángulo: solo trabaja $F\\cos\\theta$.' }
        ],
        oracle: { lab: 'call', mod: 'work', fn: 'constant', args: function (v) { return [v.F, v.d, v.th]; } },
        hint: '$W = Fd\\cos\\theta$ con $\\theta$ entre la fuerza y el desplazamiento.',
        solution: function (v) { return '$$W = (' + v.F + ')(' + v.d + ')\\cos ' + v.th + '^\\circ = ' + fx(v.F * v.d * cs(v.th), 2) + '\\ \\text{J}$$'; }
      },
      {
        id: 'f1-s12-neto', title: 'Rapidez final con trabajo neto',
        vars: { m: [2, 30, 1], F: [20, 200, 10], d: [2, 15, 1], mu: [0.1, 0.5, 0.05] },
        prompt: function (v) { return '<p>Empujas horizontalmente con $' + v.F + '\\ \\text{N}$ una caja de $' + v.m + '\\ \\text{kg}$ que parte del reposo, a lo largo de $' + v.d + '\\ \\text{m}$ ($\\mu_k = ' + v.mu + '$). ¿Qué rapidez lleva al final?</p>'; },
        check: 'numeric', unit: 'm/s',
        answer: function (v) { return Math.sqrt(2 * (v.F - v.mu * v.m * g) * v.d / v.m); },
        baseWhere: function (v) { return v.F - v.mu * v.m * g > 5; },
        mistakes: { noFriction: function (v) { return Math.sqrt(2 * v.F * v.d / v.m); }, noHalf: function (v) { return Math.sqrt((v.F - v.mu * v.m * g) * v.d / v.m); } },
        feedback: [
          { when: 'noFriction', say: 'Te faltó el trabajo negativo de la fricción, $-\\mu_k mg\\,d$.' },
          { when: 'noHalf', say: 'La energía cinética es $\\tfrac{1}{2}mv^2$: te faltó el ½.' }
        ],
        oracle: { lab: 'value', value: function (v) { var W = window.LabMath.work; return W.finalSpeed(v.m, 0, W.constant(v.F, v.d, 0) + W.constant(v.mu * v.m * g, v.d, 180)); } },
        hint: 'Suma el trabajo del empuje y el de la fricción; iguala a $\\tfrac{1}{2}mv^2$.',
        solution: function (v) { var W = (v.F - v.mu * v.m * g) * v.d; return '$$W_{neto} = (' + v.F + ' - ' + fx(v.mu * v.m * g, 3) + ')(' + v.d + ') = ' + fx(W, 2) + '\\ \\text{J} \\qquad v = \\sqrt{2W/m} = ' + fx(Math.sqrt(2 * W / v.m), 3) + '\\ \\text{m/s}$$'; }
      },
      {
        id: 'f1-s12-resorte', title: 'Trabajo para estirar un resorte',
        vars: { k: [50, 1500, 50], x1: [0, 10, 2], x2: [12, 40, 2] },
        prompt: function (v) { return '<p>Un resorte de $k = ' + v.k + '\\ \\text{N/m}$ ya está estirado $' + v.x1 + '\\ \\text{cm}$. ¿Cuánto trabajo hay que hacer para estirarlo hasta $' + v.x2 + '\\ \\text{cm}$?</p>'; },
        check: 'numeric', unit: 'J',
        answer: function (v) { return 0.5 * v.k * (Math.pow(v.x2 / 100, 2) - Math.pow(v.x1 / 100, 2)); },
        baseWhere: function (v) { return v.x1 > 0; },
        mistakes: { fromZero: function (v) { return 0.5 * v.k * Math.pow(v.x2 / 100, 2); }, diffSquared: function (v) { return 0.5 * v.k * Math.pow((v.x2 - v.x1) / 100, 2); }, noHalf: function (v) { return v.k * (Math.pow(v.x2 / 100, 2) - Math.pow(v.x1 / 100, 2)); } },
        feedback: [
          { when: 'fromZero', say: 'El resorte ya estaba estirado: resta el trabajo de $0$ a $x_1$.' },
          { when: 'diffSquared', say: 'No es $\\tfrac{1}{2}k(x_2 - x_1)^2$: es la diferencia de áreas, $\\tfrac{1}{2}k(x_2^2 - x_1^2)$.' },
          { when: 'noHalf', say: 'El área bajo $kx$ es un triángulo: lleva ½.' }
        ],
        oracle: { lab: 'value', value: function (v) { return -window.LabMath.work.spring(v.k, v.x1 / 100, v.x2 / 100); } },
        hint: 'Área bajo $F = kx$ entre $x_1$ y $x_2$ (en metros).',
        solution: function (v) { return '$$W = \\tfrac{1}{2}k(x_2^2 - x_1^2) = \\tfrac{1}{2}(' + v.k + ')(' + fx(v.x2 / 100, 2) + '^2 - ' + fx(v.x1 / 100, 2) + '^2) = ' + fx(0.5 * v.k * (Math.pow(v.x2 / 100, 2) - Math.pow(v.x1 / 100, 2)), 4) + '\\ \\text{J}$$'; }
      },
      {
        id: 'f1-s12-area', title: 'Trabajo de una fuerza variable',
        vars: { c: [1, 6, 1], n: [1, 3, 1], L: [1, 5, 1] },
        prompt: function (v) { return '<p>Una fuerza $F(x) = ' + v.c + 'x' + (v.n > 1 ? '^' + v.n : '') + '$ (en N, con $x$ en m) empuja un cuerpo de $x = 0$ a $x = ' + v.L + '\\ \\text{m}$. ¿Cuánto trabajo hace?</p>'; },
        check: 'numeric', unit: 'J',
        answer: function (v) { return v.c * Math.pow(v.L, v.n + 1) / (v.n + 1); },
        baseWhere: function (v) { return v.L > 1; },
        mistakes: { endForce: function (v) { return v.c * Math.pow(v.L, v.n) * v.L; } },
        feedback: [{ when: 'endForce', say: 'Tomaste la fuerza final como constante. La fuerza crece: integra $F(x)$.' }],
        oracle: { lab: 'call', mod: 'work', fn: 'work', math: true, args: function (v) { return [v.c + 'x^' + v.n, 0, v.L]; } },
        hint: '$W = \\int_0^L F(x)\\,dx$.',
        solution: function (v) { return '$$W = \\int_0^{' + v.L + '} ' + v.c + 'x^{' + v.n + '}\\,dx = \\frac{' + v.c + '}{' + (v.n + 1) + '}(' + v.L + ')^{' + (v.n + 1) + '} = ' + fx(v.c * Math.pow(v.L, v.n + 1) / (v.n + 1), 3) + '\\ \\text{J}$$'; }
      },
      {
        id: 'f1-s12-frenado', title: 'Distancia de frenado',
        vars: { v: [5, 35, 1], mu: [0.3, 0.9, 0.05] },
        prompt: function (v) { return '<p>Un auto va a $' + v.v + '\\ \\text{m/s}$ y frena con las llantas derrapando ($\\mu_k = ' + v.mu + '$). ¿Qué distancia recorre hasta detenerse?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return v.v * v.v / (2 * v.mu * g); },
        mistakes: { noHalf: function (v) { return v.v * v.v / (v.mu * g); }, noSquare: function (v) { return v.v / (2 * v.mu * g); } },
        feedback: [
          { when: 'noHalf', say: 'La energía cinética es $\\tfrac{1}{2}mv^2$: te sobra un factor de 2.' },
          { when: 'noSquare', say: 'La rapidez va al cuadrado: $\\mu_k mg\\,d = \\tfrac{1}{2}mv^2$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return 0.5 * v.v * v.v / (v.mu * g); } },
        hint: 'La fricción quita toda la energía cinética: $\\mu_k mg\\,d = \\tfrac{1}{2}mv^2$.',
        solution: function (v) { return '$$d = \\frac{v^2}{2\\mu_k g} = \\frac{' + (v.v * v.v) + '}{2(' + v.mu + ')(9.81)} = ' + fx(v.v * v.v / (2 * v.mu * g), 3) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s12-potencia', title: 'Potencia para subir una carga',
        vars: { m: [50, 800, 50], h: [3, 30, 1], t: [5, 60, 5] },
        prompt: function (v) { return '<p>Un motor sube $' + v.m + '\\ \\text{kg}$ a velocidad constante una altura de $' + v.h + '\\ \\text{m}$ en $' + v.t + '\\ \\text{s}$. ¿Qué potencia media entrega?</p>'; },
        check: 'numeric', unit: 'W',
        answer: function (v) { return v.m * g * v.h / v.t; },
        mistakes: { noG: function (v) { return v.m * v.h / v.t; }, energyOnly: function (v) { return v.m * g * v.h; } },
        feedback: [
          { when: 'noG', say: 'La fuerza es el peso, $mg$: te faltó $g$.' },
          { when: 'energyOnly', say: 'Eso es el trabajo. La potencia es trabajo entre tiempo.' }
        ],
        oracle: { lab: 'value', value: function (v) { return window.LabMath.work.constant(v.m * g, v.h, 0) / v.t; } },
        hint: '$P = W/t$ con $W = mgh$.',
        solution: function (v) { return '$$P = \\frac{mgh}{t} = \\frac{(' + v.m + ')(9.81)(' + v.h + ')}{' + v.t + '} = ' + fx(v.m * g * v.h / v.t, 2) + '\\ \\text{W}$$'; }
      },
      {
        id: 'f1-s12-concepto', title: 'Concepto: fuerzas que no trabajan',
        vars: {},
        prompt: function () { return '<p>Una piedra atada a una cuerda gira en un círculo horizontal a rapidez constante. ¿Cuánto trabajo hace la tensión en una vuelta?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Cero: la tensión es perpendicular a la velocidad en todo momento', correct: true },
            { text: 'Positivo: la tensión mantiene a la piedra en movimiento', say: 'La tensión no la empuja a lo largo de la trayectoria; solo la desvía.' },
            { text: 'Negativo: la tensión jala hacia el centro, contra el movimiento', say: 'El centro no está "contra" el movimiento: forma 90° con la velocidad.' },
            { text: 'Tensión por la circunferencia, $T\\cdot 2\\pi r$', say: 'Solo trabaja la componente a lo largo del desplazamiento, y aquí es cero.' }
          ];
        },
        answer: function () { return 'Cero: la tensión es perpendicular a la velocidad en todo momento'; },
        hint: '¿Cambia la energía cinética de la piedra?',
        solution: function () { return 'La rapidez no cambia, así que $\\Delta K = 0$; en cada instante la tensión forma $90^\\circ$ con el desplazamiento y $\\cos 90^\\circ = 0$.'; }
      }
    ],

    quiz: { tags: ['f1.S12'], count: 8 },

    errors: [
      'Usar $F\\sin\\theta$ en vez de $F\\cos\\theta$ (o no usar el ángulo).',
      'Olvidar que la fricción hace trabajo negativo.',
      'Escribir $kx^2$ o $mv^2$ sin el ½.',
      'Multiplicar la fuerza final por la distancia cuando la fuerza cambia.',
      'Sumar los trabajos como vectores: son escalares con signo.'
    ],

    teacher: {
      plan: [
        'Explainer de $W = Fd\\cos\\theta$ con los casos 0°, 90° y 180°.',
        'Teorema trabajo-energía: rehacer un problema de S10 sin tiempo.',
        'Área bajo $F(x)$ en el lab: fuerza constante, resorte y $3x^2$.',
        'Potencia: trabajo por segundo y $P = Fv$.'
      ],
      check: [
        'Que calculen el trabajo de cada fuerza por separado y con signo.',
        'Que identifiquen qué fuerzas no trabajan.'
      ],
      note: 'La siguiente sesión convierte el trabajo del peso y del resorte en energía potencial.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 1</em>, §7.1 “Work”. <a href="https://openstax.org/books/university-physics-volume-1/pages/7-1-work">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §7.2 “Kinetic Energy”. <a href="https://openstax.org/books/university-physics-volume-1/pages/7-2-kinetic-energy">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §7.3 “Work-Energy Theorem”. <a href="https://openstax.org/books/university-physics-volume-1/pages/7-3-work-energy-theorem">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §7.4 “Power”. <a href="https://openstax.org/books/university-physics-volume-1/pages/7-4-power">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-11',
    next: 'sesion-13'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
