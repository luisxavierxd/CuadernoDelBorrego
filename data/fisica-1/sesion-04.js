/* =====================================================================
   Física 1 · S04 · Posición, velocidad y aceleración como derivadas · MRU
   (bloque B · Cinemática).
   Fuente: OpenStax, University Physics Volume 1, §3.1–3.3 (CC BY-NC-SA 4.0).
   Las cuentas se comprueban contra LabMath.motion (lab motion-graphs), que
   deriva con math.js.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  // Polinomio en t para mostrar: [[coef, potencia], …] → "2t^3 - 9t^2 + 12t".
  function polyTex(terms) {
    var out = '';
    terms.forEach(function (tm) {
      var c = tm[0], p = tm[1];
      if (c === 0) return;
      var abs = Math.abs(c), sign = c < 0 ? (out ? ' - ' : '-') : (out ? ' + ' : '');
      var coef = abs === 1 && p > 0 ? '' : String(abs);
      out += sign + coef + (p === 0 ? '' : p === 1 ? 't' : 't^' + p);
    });
    return out || '0';
  }
  // Mismo polinomio en sintaxis de math.js, para el oráculo.
  function polySrc(terms) { return terms.map(function (tm) { return '(' + tm[0] + ')*t^' + tm[1]; }).join(' + '); }
  function cubic(v) { return [[v.a, 3], [v.b, 2], [v.c, 1]]; }
  function xc(v, t) { return v.a * t * t * t + v.b * t * t + v.c * t; }
  function vc(v, t) { return 3 * v.a * t * t + 2 * v.b * t + v.c; }
  function ac(v, t) { return 6 * v.a * t + 2 * v.b; }

  // Ejemplo 1
  var P1 = '2t^3 - 9t^2 + 12t + 1';
  function x1(t) { return 2 * t * t * t - 9 * t * t + 12 * t + 1; }
  function v1(t) { return 6 * t * t - 18 * t + 12; }
  // Ejemplo 3: x = 8t − t² de 0 a 6 s
  function x3(t) { return 8 * t - t * t; }
  function v3(t) { return 8 - 2 * t; }
  var e3 = { dx: x3(6) - x3(0), top: x3(4) };
  e3.dist = e3.top + (e3.top - x3(6));

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

  var data = window.SESSION_DATA = {
    slug: 'sesion-04', number: '04', group: 'B · Cinemática',
    title: 'Posición, velocidad y aceleración como derivadas · MRU', temario: [],
    minutes: 150,
    quote: 'La velocidad es la pendiente de la posición y la aceleración es la pendiente de la velocidad: la cinemática es cálculo con unidades.',
    badges: [
      'Distinguir desplazamiento de distancia y velocidad de rapidez.',
      'Obtener $v(t)$ y $a(t)$ derivando $x(t)$.',
      'Leer pendientes y áreas en las gráficas $x$-$t$ y $v$-$t$.',
      'Resolver problemas de movimiento rectilíneo uniforme (MRU), incluido el encuentro de dos móviles.'
    ],

    lesson: [
      {
        type: 'concept', heading: 'Posición, desplazamiento y distancia', short: 'Desplazamiento',
        body: [
          'En una línea recta, la <strong>posición</strong> $x$ se mide desde un origen y su signo dice de qué lado está. El <strong>desplazamiento</strong> es el cambio de posición, $\\Delta x = x_f - x_i$: puede ser negativo.',
          'La <strong>distancia recorrida</strong> es todo el camino andado, siempre positiva. Si el móvil se regresa, la distancia es mayor que $|\\Delta x|$.',
          'La <strong>velocidad media</strong> es $\\bar{v} = \\Delta x / \\Delta t$ (con signo) y la <strong>rapidez media</strong> es distancia entre tiempo.'
        ],
        diagram: 'track-displacement',
        caption: 'Ir y volver: el desplazamiento solo compara el inicio con el final.'
      },
      {
        type: 'explainer', heading: 'De la velocidad media a la instantánea', short: 'Velocidad instantánea',
        title: 'La secante se vuelve tangente',
        intro: 'En la gráfica $x$-$t$, la velocidad media entre dos instantes es la pendiente de la recta que los une. Si los acercas, obtienes la velocidad en un instante.',
        diagram: 'xt-secant',
        steps: [
          { text: 'Entre $t = 1.5$ s y $t = 3.5$ s, la velocidad media es la pendiente de la secante verde.', state: { h: 2 } },
          { text: 'Con $\\Delta t = 1$ s, la secante se acerca a la curva y su pendiente cambia.', state: { h: 1 } },
          { text: 'Con $\\Delta t = 0.3$ s ya casi toca la curva en un solo punto.', state: { h: 0.3 } },
          { text: 'En el límite $\\Delta t \\to 0$ la secante es la tangente: $v(t) = \\lim_{\\Delta t \\to 0} \\frac{\\Delta x}{\\Delta t} = \\frac{dx}{dt}$. Aquí $v = 8 - 2t = 5$ m/s.', state: { h: 0.02 } }
        ]
      },
      {
        type: 'concept', heading: 'Aceleración: cómo cambia la velocidad', short: 'Aceleración',
        body: [
          'Igual que la velocidad es la derivada de la posición, la <strong>aceleración</strong> es la derivada de la velocidad: $$v(t) = \\frac{dx}{dt} \\qquad a(t) = \\frac{dv}{dt} = \\frac{d^2x}{dt^2}$$',
          'El signo importa: si $v$ y $a$ tienen el mismo signo, el móvil <strong>acelera</strong> (su rapidez crece); si tienen signos opuestos, <strong>frena</strong>. Una aceleración negativa no significa que el objeto vaya frenando: depende del signo de $v$.',
          'Donde $v = 0$ y cambia de signo, el móvil <strong>da la vuelta</strong>.'
        ]
      },
      {
        type: 'example', heading: 'Derivar la posición',
        problem: '<p>Un carrito se mueve sobre un riel con $x(t) = ' + P1 + '$ (metros y segundos). ¿Qué velocidad y qué aceleración tiene a los 3 s? ¿En qué instantes se detiene?</p>',
        steps: [
          { text: 'Deriva una vez para la velocidad y otra para la aceleración.', math: 'v(t) = 6t^2 - 18t + 12 \\qquad a(t) = 12t - 18' },
          { text: 'Evalúa en $t = 3$ s.', math: 'v(3) = 54 - 54 + 12 = ' + v1(3) + '\\ \\text{m/s} \\qquad a(3) = 36 - 18 = 18\\ \\text{m/s}^2' },
          { text: 'Se detiene cuando $v = 0$.', math: '6(t^2 - 3t + 2) = 6(t - 1)(t - 2) = 0 \\;\\Rightarrow\\; t = 1\\ \\text{s y}\\ t = 2\\ \\text{s}' },
          { text: 'Entre 1 y 2 s la velocidad es negativa: el carrito se regresa. Compruébalo en el lab con este mismo $x(t)$.' }
        ],
        answer: '$v(3) = 12\\ \\text{m/s}$, $a(3) = 18\\ \\text{m/s}^2$; se detiene en $t = 1$ s y $t = 2$ s.',
        verify: { lab: 'call', mod: 'motion', fn: 'at', math: true, args: [P1, 3], values: { x: x1(3), v: v1(3), a: 18 } }
      },
      {
        type: 'concept', heading: 'Movimiento rectilíneo uniforme', short: 'MRU',
        body: [
          'En el MRU la velocidad es constante: $a = 0$ y la posición crece igual cada segundo. $$x(t) = x_0 + v\\,t$$',
          'En la gráfica $x$-$t$ es una recta de pendiente $v$. En la gráfica $v$-$t$ es una línea horizontal, y el <strong>área bajo ella es el desplazamiento</strong>: $\\Delta x = v\\,\\Delta t$.',
          'El área bajo $v(t)$ vale para cualquier movimiento, no solo el MRU: $\\Delta x = \\int v\\,dt$. Es la integral de Cálculo.'
        ],
        diagram: 'mru-graphs',
        caption: 'Pendiente de arriba = valor de abajo; área de abajo = cambio de arriba.'
      },
      {
        type: 'example', heading: 'Dos carros que se encuentran',
        problem: '<p>El carro A sale de $x = 0$ hacia la derecha a $20\\ \\text{m/s}$. Al mismo tiempo, el carro B sale de $x = 300$ m hacia la izquierda a $10\\ \\text{m/s}$. ¿Cuándo y dónde se encuentran?</p>',
        steps: [
          { text: 'Escribe la posición de cada uno con su signo: B va hacia $-x$.', math: 'x_A = 20t \\qquad x_B = 300 - 10t' },
          { text: 'Se encuentran cuando están en el mismo lugar.', math: '20t = 300 - 10t \\;\\Rightarrow\\; 30t = 300 \\;\\Rightarrow\\; t = 10\\ \\text{s}' },
          { text: 'Sustituye en cualquiera de las dos.', math: 'x = 20(10) = 200\\ \\text{m}' },
          { text: 'Atajo: se acercan a $20 + 10 = 30$ m/s, así que cubren los 300 m en 10 s.' }
        ],
        answer: 'Se encuentran a los $10\\ \\text{s}$, en $x = 200\\ \\text{m}$.',
        verify: { lab: 'call', mod: 'motion', fn: 'meet', args: [0, 20, 300, -10], values: { t: 10, x: 200 } }
      },
      {
        type: 'example', heading: 'Distancia contra desplazamiento',
        problem: '<p>Una pelota que rueda cuesta arriba tiene $x(t) = 8t - t^2$. Entre $t = 0$ y $t = 6$ s, ¿cuál es su desplazamiento y qué distancia recorrió?</p>',
        steps: [
          { text: 'Desplazamiento: solo el inicio y el final.', math: '\\Delta x = x(6) - x(0) = 48 - 36 - 0 = ' + e3.dx + '\\ \\text{m}' },
          { text: 'Busca si se regresa: $v = 8 - 2t = 0$ en $t = 4$ s, donde llega a su punto más lejano.', math: 'x(4) = 32 - 16 = ' + e3.top + '\\ \\text{m}' },
          { text: 'Distancia: sube de 0 a 16 m y baja de 16 a 12 m.', math: 'd = 16 + 4 = ' + e3.dist + '\\ \\text{m}' },
          { text: 'Velocidad media: $12/6 = 2$ m/s; rapidez media: $20/6 \\approx 3.33$ m/s.' }
        ],
        answer: '$\\Delta x = ' + e3.dx + '\\ \\text{m}$ y distancia $= ' + e3.dist + '\\ \\text{m}$.',
        verify: { lab: 'call', mod: 'motion', fn: 'distance', args: [x3, v3, 0, 6], value: e3.dist }
      },
      {
        type: 'callout', heading: 'Velocidad no es rapidez',
        body: [
          'La velocidad tiene signo (o dirección); la rapidez es su magnitud. Un carro que da una vuelta completa a un circuito a 100 km/h tiene rapidez media de 100 km/h, pero velocidad media cero.',
          'El velocímetro de un auto mide rapidez instantánea.'
        ]
      }
    ],

    lab: {
      type: 'motion-graphs', title: 'x, v y a enlazadas',
      intro: 'Escribe una posición $x(t)$ y mueve el instante $t$: la pendiente de cada gráfica es el valor de la de abajo, y el área sombreada bajo $v(t)$ es el desplazamiento. Si derivas a mano, escribe tu $v(t)$ para compararla.',
      cfg: { start: 1 }
    },

    formulas: [
      { label: 'Desplazamiento', tex: '\\Delta x = x_f - x_i' },
      { label: 'Velocidad media', tex: '\\bar{v} = \\frac{\\Delta x}{\\Delta t}' },
      { label: 'Velocidad', tex: 'v = \\frac{dx}{dt}' },
      { label: 'Aceleración', tex: 'a = \\frac{dv}{dt} = \\frac{d^2x}{dt^2}' },
      { label: 'Área bajo v(t)', tex: '\\Delta x = \\int v\\,dt' },
      { label: 'MRU', tex: 'x = x_0 + v\\,t' }
    ],

    exercises: [
      {
        id: 'f1-s04-media', title: 'Velocidad media',
        vars: { a: [-3, 3, 0.5], b: [-6, 10, 1], c: [0, 10, 1], t1: [0, 3, 1], dt: [1, 4, 1] },
        prompt: function (v) { return '<p>Si $x(t) = ' + polyTex([[v.a, 2], [v.b, 1], [v.c, 0]]) + '$ (m y s), ¿cuál es la velocidad media entre $t = ' + v.t1 + '$ s y $t = ' + (v.t1 + v.dt) + '$ s?</p>'; },
        check: 'numeric', unit: 'm/s', tol: { abs: 0.01 },
        answer: function (v) { var t2 = v.t1 + v.dt; return v.a * (v.t1 + t2) + v.b; },
        baseWhere: function (v) { return v.a !== 0 && v.t1 > 0; },
        mistakes: { onlyEnd: function (v) { var t2 = v.t1 + v.dt; return (v.a * t2 * t2 + v.b * t2 + v.c) / t2; } },
        feedback: [{ when: 'onlyEnd', say: 'Dividiste la posición final entre el tiempo final. La velocidad media usa el cambio: $\\frac{x(t_2) - x(t_1)}{t_2 - t_1}$.' }],
        oracle: { lab: 'call', mod: 'motion', fn: 'avgVelocity', args: function (v) { return [function (t) { return v.a * t * t + v.b * t + v.c; }, v.t1, v.t1 + v.dt]; } },
        hint: 'Evalúa $x$ en los dos instantes, resta y divide entre $\\Delta t$.',
        solution: function (v) {
          var t2 = v.t1 + v.dt, X = function (t) { return v.a * t * t + v.b * t + v.c; };
          return '$$\\bar{v} = \\frac{x(' + t2 + ') - x(' + v.t1 + ')}{' + t2 + ' - ' + v.t1 + '} = \\frac{' + fx(X(t2)) + ' - (' + fx(X(v.t1)) + ')}{' + v.dt + '} = ' + fx((X(t2) - X(v.t1)) / v.dt, 3) + '\\ \\text{m/s}$$';
        }
      },
      {
        id: 'f1-s04-instantanea', title: 'Velocidad instantánea',
        vars: { a: [-2, 2, 1], b: [-6, 6, 1], c: [-10, 10, 1], t0: [1, 4, 0.5] },
        prompt: function (v) { return '<p>La posición de un robot es $x(t) = ' + polyTex(cubic(v)) + '$ (m y s). ¿Qué velocidad tiene en $t = ' + v.t0 + '$ s?</p>'; },
        check: 'numeric', unit: 'm/s', tol: { abs: 0.01 },
        answer: function (v) { return vc(v, v.t0); },
        baseWhere: function (v) { return v.a !== 0 && v.b !== 0 && Math.abs(vc(v, v.t0)) >= 1; },
        mistakes: { avgFromZero: function (v) { return xc(v, v.t0) / v.t0; } },
        feedback: [{ when: 'avgFromZero', say: 'Calculaste $x(t)/t$, que es una velocidad media desde $t = 0$. La instantánea es $dx/dt$ evaluada en ese instante.' }],
        oracle: { lab: 'call', mod: 'motion', fn: 'at', math: true, field: 'v', args: function (v) { return [polySrc(cubic(v)), v.t0]; } },
        hint: 'Deriva término por término con la regla de la potencia y evalúa.',
        solution: function (v) { return '$$v(t) = ' + polyTex([[3 * v.a, 2], [2 * v.b, 1], [v.c, 0]]) + ' \\;\\Rightarrow\\; v(' + v.t0 + ') = ' + fx(vc(v, v.t0), 3) + '\\ \\text{m/s}$$'; }
      },
      {
        id: 'f1-s04-aceleracion', title: 'Aceleración en un instante',
        vars: { a: [-2, 2, 1], b: [-6, 6, 1], c: [-10, 10, 1], t0: [1, 4, 0.5] },
        prompt: function (v) { return '<p>Con $x(t) = ' + polyTex(cubic(v)) + '$ (m y s), ¿cuál es la aceleración en $t = ' + v.t0 + '$ s?</p>'; },
        check: 'numeric', unit: 'm/s²', tol: { abs: 0.01 },
        answer: function (v) { return ac(v, v.t0); },
        baseWhere: function (v) { return v.a !== 0 && Math.abs(ac(v, v.t0)) >= 1; },
        mistakes: { gaveV: function (v) { return vc(v, v.t0); } },
        feedback: [{ when: 'gaveV', say: 'Esa es la velocidad. La aceleración es la segunda derivada: deriva otra vez.' }],
        oracle: { lab: 'call', mod: 'motion', fn: 'at', math: true, field: 'a', args: function (v) { return [polySrc(cubic(v)), v.t0]; } },
        hint: '$a = \\frac{d^2x}{dt^2}$: deriva dos veces.',
        solution: function (v) { return '$$v(t) = ' + polyTex([[3 * v.a, 2], [2 * v.b, 1], [v.c, 0]]) + ' \\qquad a(t) = ' + polyTex([[6 * v.a, 1], [2 * v.b, 0]]) + ' \\;\\Rightarrow\\; a(' + v.t0 + ') = ' + fx(ac(v, v.t0), 3) + '\\ \\text{m/s}^2$$'; }
      },
      {
        id: 'f1-s04-encuentro', title: 'Encuentro de dos móviles',
        vars: { D: [100, 600, 50], vA: [5, 30, 1], vB: [5, 30, 1] },
        prompt: function (v) { return '<p>Dos robots están a $' + v.D + '$ m uno del otro y avanzan uno hacia el otro a $' + v.vA + '$ m/s y $' + v.vB + '$ m/s. ¿Cuánto tardan en encontrarse?</p>'; },
        check: 'numeric', unit: 's',
        answer: function (v) { return v.D / (v.vA + v.vB); },
        baseWhere: function (v) { return v.vA !== v.vB; },
        mistakes: { subtracted: function (v) { return v.D / Math.abs(v.vA - v.vB); } },
        feedback: [{ when: 'subtracted', say: 'Restaste las rapideces. Van uno hacia el otro: se acercan a $v_A + v_B$.' }],
        oracle: { lab: 'call', mod: 'motion', fn: 'meet', field: 't', args: function (v) { return [0, v.vA, v.D, -v.vB]; } },
        hint: 'Escribe $x_A = v_A t$ y $x_B = D - v_B t$ e iguálalas.',
        solution: function (v) { return '$$' + v.vA + 't = ' + v.D + ' - ' + v.vB + 't \\;\\Rightarrow\\; t = \\frac{' + v.D + '}{' + (v.vA + v.vB) + '} = ' + fx(v.D / (v.vA + v.vB), 3) + '\\ \\text{s}$$'; }
      },
      {
        id: 'f1-s04-distancia', title: 'Distancia recorrida',
        vars: { b: [4, 12, 2], T: [3, 12, 1] },
        prompt: function (v) { return '<p>Un bloque que sube por una rampa tiene $x(t) = ' + v.b + 't - t^2$ (m y s). ¿Qué distancia recorre entre $t = 0$ y $t = ' + v.T + '$ s?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { var tp = v.b / 2, top = v.b * tp - tp * tp; return 2 * top - (v.b * v.T - v.T * v.T); },
        baseWhere: function (v) { return v.T > v.b / 2 + 0.5; },
        mistakes: { displacement: function (v) { return Math.abs(v.b * v.T - v.T * v.T); } },
        feedback: [{ when: 'displacement', say: 'Eso es $|\\Delta x|$. El bloque se regresa en $t = b/2$: suma lo que sube y lo que baja.' }],
        oracle: { lab: 'call', mod: 'motion', fn: 'distance', args: function (v) { return [function (t) { return v.b * t - t * t; }, function (t) { return v.b - 2 * t; }, 0, v.T]; } },
        hint: 'Busca cuándo $v = 0$; hasta ahí sube, después baja.',
        solution: function (v) {
          var tp = v.b / 2, top = v.b * tp - tp * tp, xT = v.b * v.T - v.T * v.T;
          return '$$v = ' + v.b + ' - 2t = 0 \\Rightarrow t = ' + tp + '\\ \\text{s},\\ x = ' + fx(top) + '\\ \\text{m} \\qquad x(' + v.T + ') = ' + fx(xT) + '\\ \\text{m}$$$$d = ' + fx(top) + ' + (' + fx(top) + ' - (' + fx(xT) + ')) = ' + fx(2 * top - xT) + '\\ \\text{m}$$';
        }
      },
      {
        id: 'f1-s04-pendiente', title: 'Concepto: la pendiente de x-t',
        vars: {},
        prompt: function () { return '<p>En una gráfica de posición contra tiempo, ¿qué representa la pendiente de la recta tangente en un instante?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'La velocidad instantánea', correct: true },
            { text: 'La aceleración', say: 'La aceleración es la pendiente de la gráfica $v$-$t$.' },
            { text: 'La distancia recorrida', say: 'La distancia sale de las posiciones, no de una pendiente.' },
            { text: 'La velocidad media desde el inicio', say: 'Esa es la pendiente de la secante desde el inicio, no de la tangente.' }
          ];
        },
        answer: function () { return 'La velocidad instantánea'; },
        hint: 'Pendiente = cambio de lo vertical entre cambio de lo horizontal.',
        solution: function () { return 'La pendiente de la tangente a $x(t)$ es $dx/dt = v(t)$.'; }
      }
    ],

    quiz: { tags: ['f1.S04'], count: 8 },

    errors: [
      'Confundir desplazamiento con distancia cuando el móvil se regresa.',
      'Calcular la velocidad instantánea como $x(t)/t$.',
      'Pensar que $a < 0$ siempre significa que el objeto frena: depende del signo de $v$.',
      'En encuentros, olvidar que el que va hacia la izquierda tiene velocidad negativa.',
      'Leer la velocidad como la altura de la gráfica $x$-$t$ en lugar de su pendiente.'
    ],

    teacher: {
      plan: [
        'Ir y volver sobre una línea: desplazamiento contra distancia.',
        'Explainer de secante a tangente: la conexión con la derivada de Cálculo.',
        'Ejemplos y lab con $x = 8t - t^2$: que muevan el cursor hasta donde $v = 0$.'
      ],
      check: [
        'Que escriban el signo de la velocidad según el sentido de movimiento.',
        'Que verifiquen $v = 0$ antes de calcular una distancia.'
      ],
      note: 'Si el grupo aún no domina la derivada, apóyate en las pendientes de la gráfica; la regla de la potencia basta para esta sesión.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 1</em>, §3.1 “Position, Displacement, and Average Velocity”. <a href="https://openstax.org/books/university-physics-volume-1/pages/3-1-position-displacement-and-average-velocity">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §3.2 “Instantaneous Velocity and Speed”. <a href="https://openstax.org/books/university-physics-volume-1/pages/3-2-instantaneous-velocity-and-speed">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §3.3 “Average and Instantaneous Acceleration”. <a href="https://openstax.org/books/university-physics-volume-1/pages/3-3-average-and-instantaneous-acceleration">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-03',
    next: 'sesion-05'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
