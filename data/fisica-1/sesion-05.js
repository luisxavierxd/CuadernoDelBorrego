/* =====================================================================
   Física 1 · S05 · MRUA · caída libre y tiro vertical (bloque B · Cinemática).
   Fuente: OpenStax, University Physics Volume 1, §3.4–3.5 (CC BY-NC-SA 4.0).
   Eje y hacia arriba, g = 9.81 m/s², sin resistencia del aire. Las cuentas
   se comprueban contra LabMath.kinematics (lab kinematics-check).
   ===================================================================== */
(function () {
  var g = 9.81;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function tGround(v0, h0) { return (v0 + Math.sqrt(v0 * v0 + 2 * g * h0)) / g; }

  // Ejemplo 1: frenado
  var e1 = { v0: 25, a: 5 };
  e1.t = e1.v0 / e1.a; e1.d = e1.v0 * e1.v0 / (2 * e1.a);
  // Ejemplo 2: pelota lanzada desde una azotea
  var e2 = { v0: 15, h0: 20 };
  e2.tTop = e2.v0 / g; e2.H = e2.h0 + e2.v0 * e2.v0 / (2 * g); e2.T = tGround(e2.v0, e2.h0);
  e2.vImp = -Math.sqrt(e2.v0 * e2.v0 + 2 * g * e2.h0);
  // Ejemplo 3: se suelta desde un puente
  var e3 = { h0: 45 };
  e3.T = Math.sqrt(2 * e3.h0 / g); e3.v = -g * e3.T;

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
    slug: 'sesion-05', number: '05', group: 'B · Cinemática',
    title: 'MRUA · caída libre y tiro vertical', temario: [],
    minutes: 150,
    quote: 'Con aceleración constante bastan cuatro ecuaciones; lo difícil es elegir la que no necesita el dato que te falta.',
    badges: [
      'Usar las cuatro ecuaciones del MRUA y elegir la adecuada.',
      'Calcular tiempos y distancias de frenado.',
      'Resolver caída libre y tiro vertical con el eje $y$ hacia arriba.',
      'Resolver un lanzamiento desde una altura con la fórmula cuadrática.'
    ],

    lesson: [
      {
        type: 'concept', heading: 'Movimiento con aceleración constante', short: 'MRUA',
        body: [
          'Si la aceleración $a$ es constante, la velocidad cambia lo mismo cada segundo y la gráfica $v$-$t$ es una recta. De ahí salen cuatro ecuaciones: $$v = v_0 + at \\qquad x = x_0 + v_0t + \\tfrac{1}{2}at^2$$ $$v^2 = v_0^2 + 2a\\,\\Delta x \\qquad \\Delta x = \\tfrac{1}{2}(v_0 + v)\\,t$$',
          'Cada una deja fuera una cantidad: la tercera no usa el tiempo y la cuarta no usa la aceleración. Escribe qué conoces y qué buscas, y elige la ecuación que no incluye lo que no te dan.',
          'Las dos primeras son la integral de $a$ constante: $v = \\int a\\,dt$ y $x = \\int v\\,dt$.'
        ],
        diagram: 'mrua-vt',
        caption: 'El área bajo la recta $v$-$t$ es un trapecio: de ahí sale $\\Delta x = \\tfrac{1}{2}(v_0 + v)\\,t$.'
      },
      {
        type: 'example', heading: 'Distancia de frenado',
        problem: '<p>Un auto va a $' + e1.v0 + '\\ \\text{m/s}$ (90 km/h) y frena con una aceleración constante de $' + e1.a + '\\ \\text{m/s}^2$. ¿Cuánto tarda en detenerse y qué distancia recorre mientras frena?</p>',
        steps: [
          { text: 'Con el sentido del movimiento positivo, frenar es $a = -' + e1.a + '\\ \\text{m/s}^2$. Al final $v = 0$.', math: '0 = ' + e1.v0 + ' - ' + e1.a + 't \\;\\Rightarrow\\; t = ' + e1.t + '\\ \\text{s}' },
          { text: 'La distancia sin usar el tiempo: $v^2 = v_0^2 + 2a\\,\\Delta x$.', math: '0 = ' + e1.v0 + '^2 - 2(' + e1.a + ')\\Delta x \\;\\Rightarrow\\; \\Delta x = \\frac{' + (e1.v0 * e1.v0) + '}{' + (2 * e1.a) + '} = ' + e1.d + '\\ \\text{m}' },
          { text: 'La distancia crece con el cuadrado de la rapidez: al doble de velocidad, cuatro veces la distancia.' }
        ],
        answer: 'Tarda $' + e1.t + '\\ \\text{s}$ y recorre $' + e1.d + '\\ \\text{m}$.',
        verify: { lab: 'call', mod: 'kinematics', fn: 'stop', args: [e1.v0, -e1.a], values: { t: e1.t, d: e1.d } }
      },
      {
        type: 'concept', heading: 'Caída libre', short: 'Caída libre',
        body: [
          'Sin aire, todos los objetos cerca de la Tierra caen con la misma aceleración, $g = 9.81\\ \\text{m/s}^2$, sin importar su masa. Es un MRUA en vertical.',
          'Con el eje $y$ hacia <strong>arriba</strong>, la aceleración es $a = -g$ siempre: al subir, al bajar y en la cima. Las ecuaciones quedan $$v = v_0 - gt \\qquad y = h_0 + v_0t - \\tfrac{1}{2}gt^2 \\qquad v^2 = v_0^2 - 2g\\,\\Delta y$$',
          '"Soltar" significa $v_0 = 0$; "lanzar hacia abajo" significa $v_0 < 0$.'
        ]
      },
      {
        type: 'explainer', heading: 'Tiro vertical paso a paso', short: 'Tiro vertical',
        title: 'Sube, se detiene y baja',
        intro: 'Sigue la pelota y su gráfica $y(t)$. La flecha roja, $g$, nunca cambia.',
        diagram: 'vertical-explainer',
        steps: [
          { text: 'Sale hacia arriba con $v_0$. La gravedad le quita $9.81$ m/s cada segundo.', state: { u: 0.2, show: 'launch' } },
          { text: 'En la cima $v = 0$: de $0 = v_0 - gt$ sale $t_{sub} = v_0/g$ y la altura que sube es $v_0^2/2g$. La aceleración sigue siendo $-g$.', state: { u: 0.5, show: 'top' } },
          { text: 'Si vuelve a la misma altura, tarda lo mismo en bajar ($T = 2v_0/g$) y llega con la misma rapidez, hacia abajo.', state: { u: 1, show: 'back' } }
        ]
      },
      {
        type: 'example', heading: 'Lanzada desde una azotea',
        problem: '<p>Desde una azotea de $' + e2.h0 + '\\ \\text{m}$ lanzas una pelota verticalmente hacia arriba a $' + e2.v0 + '\\ \\text{m/s}$. ¿Cuánto tarda en llegar a la cima, qué altura máxima alcanza sobre el piso, cuándo llega al piso y con qué velocidad?</p>',
        steps: [
          { text: 'Cima: $v = 0$.', math: 't_{sub} = \\frac{v_0}{g} = \\frac{' + e2.v0 + '}{9.81} = ' + fx(e2.tTop, 3) + '\\ \\text{s} \\qquad H = h_0 + \\frac{v_0^2}{2g} = ' + e2.h0 + ' + ' + fx(e2.v0 * e2.v0 / (2 * g), 2) + ' = ' + fx(e2.H, 2) + '\\ \\text{m}' },
          { text: 'Llega al piso cuando $y = 0$. Aquí <strong>no</strong> vale $T = 2v_0/g$ porque no regresa a la altura de salida: resuelve la cuadrática.', math: '0 = ' + e2.h0 + ' + ' + e2.v0 + 't - 4.905t^2 \\;\\Rightarrow\\; t = \\frac{' + e2.v0 + ' + \\sqrt{' + e2.v0 + '^2 + 2(9.81)(' + e2.h0 + ')}}{9.81} = ' + fx(e2.T, 3) + '\\ \\text{s}' },
          { text: 'La otra raíz es negativa y no tiene sentido físico. Velocidad al llegar:', math: 'v = v_0 - gT = ' + e2.v0 + ' - 9.81(' + fx(e2.T, 3) + ') = ' + fx(e2.vImp, 2) + '\\ \\text{m/s}' },
          { text: 'Comprobación con $v^2 = v_0^2 - 2g\\,\\Delta y$ y $\\Delta y = -' + e2.h0 + '$ m: $v = -\\sqrt{' + e2.v0 + '^2 + 2(9.81)(' + e2.h0 + ')}$, el mismo valor.' }
        ],
        answer: '$t_{sub} = ' + fx(e2.tTop, 2) + '\\ \\text{s}$, $H = ' + fx(e2.H, 2) + '\\ \\text{m}$, llega en $' + fx(e2.T, 2) + '\\ \\text{s}$ a $' + fx(e2.vImp, 2) + '\\ \\text{m/s}$ (hacia abajo).',
        verify: { lab: 'call', mod: 'kinematics', fn: 'vertical', args: [{ h0: e2.h0, v0: e2.v0 }], values: { tTop: e2.tTop, H: e2.H, T: e2.T, vImpact: e2.vImp } }
      },
      {
        type: 'example', heading: 'Soltar desde un puente',
        problem: '<p>Sueltas una piedra desde un puente a $' + e3.h0 + '\\ \\text{m}$ sobre el agua. ¿Cuánto tarda en caer y con qué velocidad llega?</p>',
        steps: [
          { text: 'Soltar: $v_0 = 0$. De $0 = h_0 - \\tfrac{1}{2}gt^2$:', math: 't = \\sqrt{\\frac{2h_0}{g}} = \\sqrt{\\frac{2(' + e3.h0 + ')}{9.81}} = ' + fx(e3.T, 3) + '\\ \\text{s}' },
          { text: 'Velocidad al llegar.', math: 'v = -gt = -9.81(' + fx(e3.T, 3) + ') = ' + fx(e3.v, 2) + '\\ \\text{m/s}' },
          { text: 'Cuidado: si olvidas el 2, $\\sqrt{h_0/g}$ da un tiempo $\\sqrt{2}$ veces menor.' }
        ],
        answer: 'Tarda $' + fx(e3.T, 2) + '\\ \\text{s}$ y llega a $' + fx(-e3.v, 1) + '\\ \\text{m/s}$ hacia abajo.',
        verify: { lab: 'call', mod: 'kinematics', fn: 'vertical', args: [{ h0: e3.h0, v0: 0 }], values: { T: e3.T, vImpact: e3.v } }
      },
      {
        type: 'callout', heading: 'En la cima la velocidad es cero, la aceleración no',
        body: [
          'Si en la cima $a$ fuera cero, la pelota se quedaría flotando. Es $v$ la que vale cero en ese instante; un momento después ya baja porque $a = -g$.',
          'Revisa también los signos: con el eje hacia arriba, una velocidad hacia abajo es negativa.'
        ]
      }
    ],

    lab: {
      type: 'kinematics-check', title: 'Comprueba tu y(t)',
      intro: 'Elige la altura inicial y la velocidad de lanzamiento, escribe tu $y(t)$ y compárala con la real. Abajo ves el error en el tiempo. El lab detecta si pusiste $+g$, si te faltó el $\\tfrac{1}{2}$, si olvidaste $h_0$ o si el signo de $v_0$ está al revés.',
      cfg: { start: { h0: 20, v0: 15 } }
    },

    formulas: [
      { label: 'Velocidad', tex: 'v = v_0 + at' },
      { label: 'Posición', tex: 'x = x_0 + v_0t + \\tfrac{1}{2}at^2' },
      { label: 'Sin tiempo', tex: 'v^2 = v_0^2 + 2a\\,\\Delta x' },
      { label: 'Sin aceleración', tex: '\\Delta x = \\tfrac{1}{2}(v_0 + v)\\,t' },
      { label: 'Caída libre (y hacia arriba)', tex: 'y = h_0 + v_0t - \\tfrac{1}{2}gt^2' },
      { label: 'Tiro vertical*', tex: 't_{sub} = \\frac{v_0}{g},\\ \\ H = \\frac{v_0^2}{2g}' },
      { label: '*Sobre el punto de salida', tex: 'g = 9.81\\ \\text{m/s}^2' }
    ],

    exercises: [
      {
        id: 'f1-s05-frenado', title: 'Distancia de frenado',
        vars: { v0: [10, 35, 1], a: [3, 9, 0.5] },
        prompt: function (v) { return '<p>Un auto va a $' + v.v0 + '\\ \\text{m/s}$ y frena con $' + v.a + '\\ \\text{m/s}^2$ constantes. ¿Qué distancia recorre hasta detenerse?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return v.v0 * v.v0 / (2 * v.a); },
        mistakes: { noTwo: function (v) { return v.v0 * v.v0 / v.a; } },
        feedback: [{ when: 'noTwo', say: 'Te falta el 2: de $0 = v_0^2 - 2a\\,\\Delta x$ sale $\\Delta x = v_0^2/2a$.' }],
        oracle: { lab: 'call', mod: 'kinematics', fn: 'stop', field: 'd', args: function (v) { return [v.v0, -v.a]; } },
        hint: 'No te dan el tiempo: usa $v^2 = v_0^2 + 2a\\,\\Delta x$ con $v = 0$ y $a$ negativa.',
        solution: function (v) { return '$$\\Delta x = \\frac{v_0^2}{2a} = \\frac{' + v.v0 + '^2}{2(' + v.a + ')} = ' + fx(v.v0 * v.v0 / (2 * v.a), 3) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s05-caida', title: 'Tiempo de caída',
        vars: { h: [2, 80, 1] },
        prompt: function (v) { return '<p>Se suelta una herramienta desde $' + v.h + '\\ \\text{m}$ de altura. Sin aire, ¿cuánto tarda en llegar al suelo?</p>'; },
        check: 'numeric', unit: 's',
        answer: function (v) { return Math.sqrt(2 * v.h / g); },
        mistakes: {
          forgotTwo: function (v) { return Math.sqrt(v.h / g); },
          noSqrt: function (v) { return 2 * v.h / g; }
        },
        feedback: [
          { when: 'forgotTwo', say: 'De $h = \\tfrac{1}{2}gt^2$ sale $t = \\sqrt{2h/g}$: te faltó el 2.' },
          { when: 'noSqrt', say: 'Ese es $t^2$: falta sacar la raíz.' }
        ],
        oracle: { lab: 'call', mod: 'kinematics', fn: 'vertical', field: 'T', args: function (v) { return [{ h0: v.h, v0: 0 }]; } },
        hint: 'Soltar es $v_0 = 0$: $0 = h - \\tfrac{1}{2}gt^2$.',
        solution: function (v) { return '$$t = \\sqrt{\\frac{2(' + v.h + ')}{9.81}} = ' + fx(Math.sqrt(2 * v.h / g), 3) + '\\ \\text{s}$$'; }
      },
      {
        id: 'f1-s05-altura', title: 'Altura máxima',
        vars: { v0: [5, 30, 1] },
        prompt: function (v) { return '<p>Lanzas una pelota verticalmente hacia arriba a $' + v.v0 + '\\ \\text{m/s}$. ¿Cuánto sube sobre tu mano?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return v.v0 * v.v0 / (2 * g); },
        mistakes: { forgotTwo: function (v) { return v.v0 * v.v0 / g; } },
        feedback: [{ when: 'forgotTwo', say: 'Falta el 2 del denominador: $H = v_0^2/2g$.' }],
        oracle: { lab: 'call', mod: 'kinematics', fn: 'vertical', field: 'H', args: function (v) { return [{ h0: 0, v0: v.v0 }]; } },
        hint: 'En la cima $v = 0$: usa $v^2 = v_0^2 - 2g\\,\\Delta y$.',
        solution: function (v) { return '$$H = \\frac{v_0^2}{2g} = \\frac{' + v.v0 + '^2}{2(9.81)} = ' + fx(v.v0 * v.v0 / (2 * g), 3) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s05-azotea', title: 'Desde una azotea',
        vars: { v0: [5, 20, 1], h0: [5, 40, 1] },
        prompt: function (v) { return '<p>Desde una azotea de $' + v.h0 + '\\ \\text{m}$ lanzas una piedra hacia arriba a $' + v.v0 + '\\ \\text{m/s}$. ¿Cuánto tarda en llegar al piso?</p>'; },
        check: 'numeric', unit: 's',
        answer: function (v) { return tGround(v.v0, v.h0); },
        mistakes: { ignoredH0: function (v) { return 2 * v.v0 / g; } },
        feedback: [{ when: 'ignoredH0', say: 'Ese es el tiempo para volver a la altura de la azotea. Falta caer los ' + 'metros de la azotea: resuelve $0 = h_0 + v_0t - \\tfrac{1}{2}gt^2$.' }],
        oracle: { lab: 'call', mod: 'kinematics', fn: 'vertical', field: 'T', args: function (v) { return [{ h0: v.h0, v0: v.v0 }]; } },
        hint: 'Iguala $y(t) = 0$ y usa la fórmula general; quédate con la raíz positiva.',
        solution: function (v) { return '$$0 = ' + v.h0 + ' + ' + v.v0 + 't - 4.905t^2 \\;\\Rightarrow\\; t = \\frac{' + v.v0 + ' + \\sqrt{' + v.v0 + '^2 + 2(9.81)(' + v.h0 + ')}}{9.81} = ' + fx(tGround(v.v0, v.h0), 3) + '\\ \\text{s}$$'; }
      },
      {
        id: 'f1-s05-impacto', title: 'Rapidez al llegar al piso',
        vars: { v0: [5, 20, 1], h0: [5, 40, 1] },
        prompt: function (v) { return '<p>Una pelota se lanza hacia arriba a $' + v.v0 + '\\ \\text{m/s}$ desde $' + v.h0 + '\\ \\text{m}$ de altura. ¿Con qué rapidez llega al piso?</p>'; },
        check: 'numeric', unit: 'm/s',
        answer: function (v) { return Math.sqrt(v.v0 * v.v0 + 2 * g * v.h0); },
        mistakes: { ignoredV0: function (v) { return Math.sqrt(2 * g * v.h0); } },
        feedback: [{ when: 'ignoredV0', say: 'Así llegaría si la soltaras. Salió con $v_0$: usa $v^2 = v_0^2 + 2gh_0$.' }],
        oracle: { lab: 'call', mod: 'kinematics', fn: 'speedAfter', args: function (v) { return [v.v0, g, v.h0]; } },
        hint: 'No necesitas el tiempo: $v^2 = v_0^2 - 2g\\,\\Delta y$ con $\\Delta y = -h_0$.',
        solution: function (v) { return '$$v = \\sqrt{' + v.v0 + '^2 + 2(9.81)(' + v.h0 + ')} = ' + fx(Math.sqrt(v.v0 * v.v0 + 2 * g * v.h0), 3) + '\\ \\text{m/s}$$'; }
      },
      {
        id: 'f1-s05-arranque', title: 'Distancia al acelerar',
        vars: { v0: [0, 15, 1], a: [1, 5, 0.5], t: [2, 10, 1] },
        prompt: function (v) { return '<p>Un robot va a $' + v.v0 + '\\ \\text{m/s}$ y acelera a $' + v.a + '\\ \\text{m/s}^2$ durante $' + v.t + '$ s. ¿Cuánto avanza en ese tiempo?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return v.v0 * v.t + v.a * v.t * v.t / 2; },
        mistakes: { noHalf: function (v) { return v.v0 * v.t + v.a * v.t * v.t; } },
        feedback: [{ when: 'noHalf', say: 'Te falta el $\\tfrac{1}{2}$: $\\Delta x = v_0t + \\tfrac{1}{2}at^2$.' }],
        oracle: { lab: 'call', mod: 'kinematics', fn: 'pos', args: function (v) { return [{ h0: 0, v0: v.v0, a: v.a }, v.t]; } },
        hint: 'Tienes $v_0$, $a$ y $t$: usa la ecuación de posición.',
        solution: function (v) { return '$$\\Delta x = (' + v.v0 + ')(' + v.t + ') + \\tfrac{1}{2}(' + v.a + ')(' + v.t + ')^2 = ' + fx(v.v0 * v.t + v.a * v.t * v.t / 2, 3) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s05-cima', title: 'Concepto: la aceleración en la cima',
        vars: {},
        prompt: function () { return '<p>Lanzas una pelota verticalmente hacia arriba. Sin aire, ¿cuál es su aceleración en el punto más alto? (Eje $y$ hacia arriba.)</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: '$-9.81\\ \\text{m/s}^2$', correct: true },
            { text: '$0$', say: 'En la cima vale cero la velocidad, no la aceleración.' },
            { text: '$+9.81\\ \\text{m/s}^2$', say: 'La gravedad apunta hacia abajo; con el eje hacia arriba es negativa.' },
            { text: 'Depende de con qué rapidez se lanzó', say: 'La aceleración de caída libre es la misma para cualquier lanzamiento.' }
          ];
        },
        answer: function () { return '$-9.81\\ \\text{m/s}^2$'; },
        hint: '¿Qué pasaría un instante después si la aceleración fuera cero?',
        solution: function () { return 'La única fuerza es el peso, así que $a = -g = -9.81\\ \\text{m/s}^2$ en todo momento, también arriba.'; }
      }
    ],

    quiz: { tags: ['f1.S05'], count: 8 },

    errors: [
      'Decir que en la cima la aceleración es cero.',
      'Usar $+g$ en $y(t)$ con el eje hacia arriba.',
      'Olvidar el $\\tfrac{1}{2}$ en $\\tfrac{1}{2}at^2$ o el 2 en $v_0^2/2a$.',
      'Usar $T = 2v_0/g$ cuando el objeto no regresa a la altura de la que salió.',
      'Dar las dos raíces de la cuadrática sin descartar la negativa.'
    ],

    teacher: {
      plan: [
        'Las cuatro ecuaciones desde la gráfica $v$-$t$ (pendiente y área).',
        'Ejemplo de frenado: elegir la ecuación sin tiempo.',
        'Explainer del tiro vertical y el lab con el error del ½ que trae cargado.'
      ],
      check: [
        'Que escriban el sistema de referencia (eje y signo de $g$) antes de sustituir.',
        'Que listen datos e incógnita para elegir la ecuación.'
      ],
      note: 'El tiro vertical es el movimiento en $y$ del tiro parabólico de S06: conviene cerrar la sesión mencionándolo.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 1</em>, §3.4 “Motion with Constant Acceleration”. <a href="https://openstax.org/books/university-physics-volume-1/pages/3-4-motion-with-constant-acceleration">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §3.5 “Free Fall”. <a href="https://openstax.org/books/university-physics-volume-1/pages/3-5-free-fall">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-04',
    next: 'sesion-06'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
