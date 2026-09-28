/* =====================================================================
   Física 1 · S06 · Tiro parabólico (bloque B · Cinemática).
   Fuentes: OpenStax, University Physics Volume 1, §3.5 y §4.3 (CC BY-NC-SA 4.0).
   Sin resistencia del aire; g = 9.81 m/s², unidades SI.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.projectile (verify / oracle).
   ===================================================================== */
(function () {
  var g = 9.81, RAD = Math.PI / 180;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function R(v0, th) { return v0 * v0 * Math.sin(2 * th * RAD) / g; }
  function H(v0, th) { var s = Math.sin(th * RAD); return v0 * v0 * s * s / (2 * g); }
  function T(v0, th) { return 2 * v0 * Math.sin(th * RAD) / g; }
  function horizontalT(h0) { return Math.sqrt(2 * h0 / g); }

  // Ejemplo 1: balón de fútbol
  var e1 = { v0: 18, theta: 35 };
  e1.vx = e1.v0 * Math.cos(e1.theta * RAD);
  e1.vy = e1.v0 * Math.sin(e1.theta * RAD);
  e1.T = 2 * e1.vy / g;
  e1.H = e1.vy * e1.vy / (2 * g);
  e1.R = e1.vx * e1.T;
  // Ejemplo 2: robot que lanza desde una mesa
  var e2 = { v0: 3, h0: 0.9 };
  e2.T = horizontalT(e2.h0);
  e2.R = e2.v0 * e2.T;

  // La respuesta y cada error típico deben diferir al menos 3 % entre sí,
  // para que el mensaje "casi" nunca sea ambiguo.
  function distinct(ex) {
    return function (v) {
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]))) return false;
      }
      return true;
    };
  }

  var data = window.SESSION_DATA = {
    slug: 'sesion-06', number: '06', group: 'B · Cinemática',
    title: 'Tiro parabólico', temario: [],
    minutes: 180,
    quote: 'Un tiro parabólico son dos movimientos a la vez: uno uniforme hacia adelante y una caída libre hacia arriba y hacia abajo.',
    badges: [
      'Descomponer $v_0$ en sus componentes horizontal y vertical.',
      'Escribir $x(t)$ y $y(t)$ y usarlas para cualquier pregunta del tiro.',
      'Calcular tiempo de vuelo, altura máxima y alcance.',
      'Resolver un tiro horizontal desde cierta altura.'
    ],

    lesson: [
      {
        "type": "warmup",
        "heading": "Antes de empezar",
        "short": "Antes de empezar",
        "idea": "Un proyectil hace <strong>dos movimientos a la vez</strong>: uno horizontal con velocidad constante y uno vertical en caída libre.",
        "recall": [
          "Componentes de un vector (S02).",
          "Las fórmulas de caída libre (S05)."
        ],
        "why": "Balones, chorros de agua, proyectiles y saltos siguen parábolas. Saber separarlas en dos movimientos permite predecir dónde cae algo."
      },
      {
        "type": "concept",
        "heading": "Imagínalo así",
        "short": "Imagínalo así",
        "body": [
          "Si sueltas una pelota y al mismo tiempo lanzas otra horizontalmente desde la misma altura, las dos llegan al piso <strong>al mismo tiempo</strong>. La velocidad horizontal no cambia qué tan rápido cae.",
          "Por eso se analiza por separado: en horizontal no hay aceleración (sin aire), así que $x = v_{0x}t$; en vertical es caída libre con $v_{0y}$. El tiempo $t$ es el mismo para ambos: es el hilo que los une.",
          "La trayectoria resulta una parábola porque $x$ crece de forma lineal con $t$ y $y$ de forma cuadrática."
        ]
      },
      {
        type: 'concept', heading: 'Dos movimientos independientes', short: 'Movimientos independientes',
        body: [
          'Sin resistencia del aire, la única aceleración del proyectil es la gravedad: $g = 9.81\\ \\text{m/s}^2$ hacia abajo. No hay nada que lo empuje o lo frene de lado.',
          'Por eso el movimiento se separa en dos: <strong>horizontal</strong>, con velocidad constante $v_x = v_0\\cos\\theta$ (MRU), y <strong>vertical</strong>, con aceleración $-g$ (MRUA, como en S05). Los une el tiempo $t$: $$x(t) = v_0\\cos\\theta\\;t \\qquad y(t) = h_0 + v_0\\sin\\theta\\;t - \\tfrac{1}{2}g\\,t^2$$'
        ],
        diagram: 'projectile-components',
        caption: 'Las flechas verdes son las componentes de la velocidad. $v_x$ es igual en todos los instantes; $v_y$ disminuye hasta 0 en la cima y luego apunta hacia abajo.'
      },
      {
        type: 'explainer', heading: 'Del lanzamiento al alcance', short: 'Tiempo, altura y alcance',
        title: 'Un tiro paso a paso',
        intro: 'Sigue el proyectil. En cada paso sale una de las fórmulas que vas a usar.',
        diagram: 'projectile-explainer',
        steps: [
          { text: 'Descompón la velocidad inicial: $v_{0x} = v_0\\cos\\theta$ y $v_{0y} = v_0\\sin\\theta$.', state: { u: 0, show: 'launch' } },
          { text: 'En la cima $v_y = 0$: $v_0\\sin\\theta - g\\,t = 0$, así que sube durante $t = \\frac{v_0\\sin\\theta}{g}$ y llega a $H = \\frac{v_0^2\\sin^2\\theta}{2g}$.', state: { u: 0.5, show: 'apex' } },
          { text: 'Si cae a la misma altura de la que salió, baja en el mismo tiempo que subió: $T = \\frac{2v_0\\sin\\theta}{g}$.', state: { u: 1, show: 'land' } },
          { text: 'Mientras tanto avanzó a $v_{0x}$ constante: $R = v_{0x}\\,T = \\frac{v_0^2\\sin 2\\theta}{g}$, porque $2\\sin\\theta\\cos\\theta = \\sin 2\\theta$.', state: { u: 1, show: 'range' } }
        ]
      },
      {
        "type": "recipe",
        "heading": "Receta: tiro parabólico",
        "short": "Receta",
        "steps": [
          {
            "text": "Descompón la velocidad inicial: $v_{0x} = v_0\\cos\\theta$, $v_{0y} = v_0\\sin\\theta$."
          },
          {
            "text": "Movimiento vertical: usa caída libre para encontrar el tiempo (de vuelo, de subida o hasta cierta altura).",
            "tip": "Casi siempre el tiempo sale del movimiento vertical."
          },
          {
            "text": "Movimiento horizontal: con ese tiempo, $x = v_{0x}t$."
          },
          {
            "text": "Si te piden la velocidad al final, combina componentes: $v = \\sqrt{v_x^2 + v_y^2}$."
          }
        ]
      },
      {
        type: 'example', heading: 'Un balón de fútbol',
        problem: '<p>Pateas un balón desde el piso con $v_0 = ' + e1.v0 + '\\ \\text{m/s}$ a $' + e1.theta + '^\\circ$ sobre la horizontal. Sin contar el aire, ¿cuánto tiempo vuela, qué altura máxima alcanza y a qué distancia cae?</p>',
        steps: [
          { text: 'Componentes de la velocidad inicial.', math: 'v_{0x} = ' + e1.v0 + '\\cos ' + e1.theta + '^\\circ = ' + fx(e1.vx) + '\\ \\text{m/s} \\qquad v_{0y} = ' + e1.v0 + '\\sin ' + e1.theta + '^\\circ = ' + fx(e1.vy) + '\\ \\text{m/s}' },
          { text: 'Tiempo de vuelo: sube y baja a la misma altura.', math: 'T = \\frac{2v_{0y}}{g} = \\frac{2(' + fx(e1.vy) + ')}{9.81} = ' + fx(e1.T) + '\\ \\text{s}' },
          { text: 'Altura máxima: en la cima $v_y = 0$.', math: 'H = \\frac{v_{0y}^2}{2g} = \\frac{(' + fx(e1.vy) + ')^2}{2(9.81)} = ' + fx(e1.H) + '\\ \\text{m}' },
          { text: 'Alcance: avanza a $v_{0x}$ durante todo el vuelo.', math: 'R = v_{0x}\\,T = (' + fx(e1.vx) + ')(' + fx(e1.T) + ') = ' + fx(e1.R, 1) + '\\ \\text{m}' }
        ],
        answer: '$T \\approx ' + fx(e1.T) + '\\ \\text{s}$, $H \\approx ' + fx(e1.H) + '\\ \\text{m}$ y $R \\approx ' + fx(e1.R, 1) + '\\ \\text{m}$.',
        verify: { lab: 'projectile', p: { v0: e1.v0, theta: e1.theta }, values: { T: e1.T, H: e1.H, R: e1.R } }
      },
      {
        type: 'callout', heading: '¿Qué ángulo llega más lejos?',
        body: [
          'En suelo plano, el alcance máximo es a $45^\\circ$, porque ahí $\\sin 2\\theta = 1$.',
          'Dos ángulos complementarios, como $30^\\circ$ y $60^\\circ$, caen en el mismo punto: el de $60^\\circ$ sube más y tarda más, pero avanza más lento. Compruébalo en el lab.'
        ]
      },
      {
        type: 'example', heading: 'Tiro horizontal desde una mesa',
        problem: '<p>Un robot lanza una pelota <strong>horizontalmente</strong> desde el borde de una mesa de $h_0 = ' + e2.h0 + '\\ \\text{m}$ con $v_0 = ' + fx(e2.v0, 1) + '\\ \\text{m/s}$. ¿Cuánto tarda en llegar al piso y a qué distancia de la mesa cae?</p>',
        steps: [
          { text: 'Al salir horizontal, $\\theta = 0$: no hay velocidad vertical inicial. En $y$ es una caída libre desde $h_0$.', math: '0 = h_0 - \\tfrac{1}{2}g\\,t^2 \\;\\Rightarrow\\; t = \\sqrt{\\frac{2h_0}{g}} = \\sqrt{\\frac{2(' + e2.h0 + ')}{9.81}} = ' + fx(e2.T, 3) + '\\ \\text{s}' },
          { text: 'En $x$ avanza a velocidad constante durante ese tiempo.', math: 'x = v_0\\,t = (' + fx(e2.v0, 1) + ')(' + fx(e2.T, 3) + ') = ' + fx(e2.R) + '\\ \\text{m}' },
          { text: 'Aquí no sirve $R = v_0^2\\sin 2\\theta/g$: esa fórmula supone que sale y cae a la misma altura.' }
        ],
        answer: 'Tarda $' + fx(e2.T, 3) + '\\ \\text{s}$ y cae a $' + fx(e2.R) + '\\ \\text{m}$ de la mesa.',
        verify: { lab: 'projectile', p: { v0: e2.v0, theta: 0, h0: e2.h0 }, values: { T: e2.T, R: e2.R } }
      },
      {
        "type": "faq",
        "heading": "Dudas comunes",
        "short": "Dudas comunes",
        "items": [
          {
            "q": "¿Qué ángulo llega más lejos?",
            "a": "En terreno plano y sin aire, $45^\\circ$. Ángulos complementarios (como $30^\\circ$ y $60^\\circ$) llegan igual de lejos."
          },
          {
            "q": "¿En la altura máxima la velocidad es cero?",
            "a": "No: solo la componente vertical. La horizontal sigue igual."
          },
          {
            "q": "¿Y si se lanza horizontal desde una mesa?",
            "a": "Entonces $\\theta = 0$: $v_{0y} = 0$ y el tiempo de caída solo depende de la altura."
          }
        ]
      },
      {
        "type": "recap",
        "heading": "Lo que te llevas",
        "short": "Resumen",
        "points": [
          "Horizontal: velocidad constante, $x = v_{0x}t$.",
          "Vertical: caída libre con $v_{0y}$.",
          "El tiempo une los dos movimientos.",
          "Arriba solo se anula $v_y$."
        ]
      }
    ],

    lab: {
      type: 'projectile-check', title: 'Comprueba tu tiro',
      intro: 'Elige $v_0$ y $\\theta$, calcula a mano el alcance (o escribe tu $y(x)$) y compáralo con el tiro real. El lab detecta si usaste $\\sin\\theta$ en lugar de $\\sin 2\\theta$ o si te faltó el factor 2.',
      cfg: { start: { v0: 18, theta: 35, mode: 'range' } }
    },

    formulas: [
      { label: 'Componentes', tex: 'v_{0x} = v_0\\cos\\theta,\\ \\ v_{0y} = v_0\\sin\\theta' },
      { label: 'Posición', tex: 'x = v_{0x}t,\\ \\ y = h_0 + v_{0y}t - \\tfrac{1}{2}gt^2' },
      { label: 'Velocidad vertical', tex: 'v_y = v_{0y} - gt' },
      { label: 'Tiempo de vuelo*', tex: 'T = \\frac{2v_0\\sin\\theta}{g}' },
      { label: 'Altura máxima', tex: 'H = \\frac{v_0^2\\sin^2\\theta}{2g}' },
      { label: 'Alcance*', tex: 'R = \\frac{v_0^2\\sin 2\\theta}{g}' },
      { label: 'Trayectoria', tex: 'y = x\\tan\\theta - \\frac{g\\,x^2}{2v_0^2\\cos^2\\theta}' },
      { label: '*Solo si cae a la misma altura de la que salió', tex: 'g = 9.81\\ \\text{m/s}^2' }
    ],

    exercises: [
      {
        id: 'f1-s06-alcance', title: 'Alcance',
        vars: { v0: [10, 25, 1], theta: [20, 70, 5] },
        prompt: function (v) { return '<p>Un proyectil sale del piso con $v_0 = ' + v.v0 + '\\ \\text{m/s}$ a $' + v.theta + '^\\circ$ y cae a la misma altura. ¿Cuál es su alcance?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return R(v.v0, v.theta); },
        mistakes: {
          usedSinTheta: function (v) { return v.v0 * v.v0 * Math.sin(v.theta * RAD) / g; },
          forgotTwo: function (v) { return R(v.v0, v.theta) / 2; }
        },
        feedback: [
          { when: 'usedSinTheta', say: 'Usaste sin θ en lugar de sin 2θ.' },
          { when: 'forgotTwo', say: 'Te falta un factor de 2: el tiempo de vuelo es el doble del tiempo de subida.' }
        ],
        oracle: { lab: 'projectile', field: 'R', p: function (v) { return { v0: v.v0, theta: v.theta }; } },
        hint: '$R = v_{0x}\\,T$ con $T = \\frac{2v_0\\sin\\theta}{g}$, o directo $R = \\frac{v_0^2\\sin 2\\theta}{g}$.',
        solution: function (v) { return '$$R = \\frac{v_0^2\\sin 2\\theta}{g} = \\frac{' + v.v0 + '^2\\sin ' + (2 * v.theta) + '^\\circ}{9.81} = ' + fx(R(v.v0, v.theta)) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s06-altura', title: 'Altura máxima',
        vars: { v0: [10, 25, 1], theta: [20, 70, 5] },
        prompt: function (v) { return '<p>Con $v_0 = ' + v.v0 + '\\ \\text{m/s}$ y $\\theta = ' + v.theta + '^\\circ$, ¿qué altura máxima alcanza el proyectil sobre su punto de salida?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return H(v.v0, v.theta); },
        mistakes: {
          forgotHalf: function (v) { return 2 * H(v.v0, v.theta); },
          noSquare: function (v) { return v.v0 * v.v0 * Math.sin(v.theta * RAD) / (2 * g); },
          usedCos: function (v) { var c = Math.cos(v.theta * RAD); return v.v0 * v.v0 * c * c / (2 * g); }
        },
        feedback: [
          { when: 'forgotHalf', say: 'Te falta el 2 del denominador: $H = \\frac{v_{0y}^2}{2g}$.' },
          { when: 'noSquare', say: 'Es $v_{0y}^2 = v_0^2\\sin^2\\theta$: el seno también va al cuadrado.' },
          { when: 'usedCos', say: 'La altura depende de la componente vertical, $v_0\\sin\\theta$, no de $v_0\\cos\\theta$.' }
        ],
        oracle: { lab: 'projectile', field: 'H', p: function (v) { return { v0: v.v0, theta: v.theta }; } },
        hint: 'En la cima $v_y = 0$. Usa $v_y^2 = v_{0y}^2 - 2g\\,\\Delta y$.',
        solution: function (v) { return '$$H = \\frac{(v_0\\sin\\theta)^2}{2g} = \\frac{(' + v.v0 + '\\sin ' + v.theta + '^\\circ)^2}{2(9.81)} = ' + fx(H(v.v0, v.theta)) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s06-tiempo', title: 'Tiempo de vuelo',
        vars: { v0: [10, 25, 1], theta: [20, 70, 5] },
        prompt: function (v) { return '<p>Un proyectil sale del piso con $v_0 = ' + v.v0 + '\\ \\text{m/s}$ a $' + v.theta + '^\\circ$. ¿Cuánto tiempo pasa en el aire?</p>'; },
        check: 'numeric', unit: 's',
        answer: function (v) { return T(v.v0, v.theta); },
        mistakes: {
          onlyUp: function (v) { return T(v.v0, v.theta) / 2; },
          usedCos: function (v) { return 2 * v.v0 * Math.cos(v.theta * RAD) / g; }
        },
        feedback: [
          { when: 'onlyUp', say: 'Ese es solo el tiempo de subida. Baja en el mismo tiempo: multiplica por 2.' },
          { when: 'usedCos', say: 'El tiempo en el aire depende de la componente vertical, $v_0\\sin\\theta$.' }
        ],
        oracle: { lab: 'projectile', field: 'T', p: function (v) { return { v0: v.v0, theta: v.theta }; } },
        hint: 'Resuelve $y(T) = 0$: $v_0\\sin\\theta\\,T - \\tfrac{1}{2}gT^2 = 0$.',
        solution: function (v) { return '$$T = \\frac{2v_0\\sin\\theta}{g} = \\frac{2(' + v.v0 + ')\\sin ' + v.theta + '^\\circ}{9.81} = ' + fx(T(v.v0, v.theta)) + '\\ \\text{s}$$'; }
      },
      {
        id: 'f1-s06-horizontal', title: 'Tiro horizontal',
        vars: { h0: [0.8, 2, 0.1], v0: [2, 6, 0.5] },
        prompt: function (v) { return '<p>Una pelota sale <strong>horizontalmente</strong> de una repisa a $' + v.h0 + '\\ \\text{m}$ del piso con $v_0 = ' + v.v0 + '\\ \\text{m/s}$. ¿A qué distancia horizontal de la repisa cae?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return v.v0 * horizontalT(v.h0); },
        mistakes: {
          forgotTwo: function (v) { return v.v0 * Math.sqrt(v.h0 / g); },
          noSqrt: function (v) { return v.v0 * 2 * v.h0 / g; }
        },
        feedback: [
          { when: 'forgotTwo', say: 'De $h_0 = \\tfrac{1}{2}gt^2$ sale $t = \\sqrt{2h_0/g}$: te faltó el 2.' },
          { when: 'noSqrt', say: 'Te faltó la raíz: $t^2 = 2h_0/g$, así que $t = \\sqrt{2h_0/g}$.' }
        ],
        oracle: { lab: 'projectile', field: 'R', p: function (v) { return { v0: v.v0, theta: 0, h0: v.h0 }; } },
        hint: 'Primero el tiempo de caída con el movimiento vertical ($v_{0y} = 0$); luego, $x = v_0\\,t$.',
        solution: function (v) {
          var t = horizontalT(v.h0);
          return '$$t = \\sqrt{\\frac{2(' + v.h0 + ')}{9.81}} = ' + fx(t, 3) + '\\ \\text{s} \\qquad x = (' + v.v0 + ')(' + fx(t, 3) + ') = ' + fx(v.v0 * t) + '\\ \\text{m}$$';
        }
      },
      {
        id: 'f1-s06-cima', title: 'Concepto: la cima',
        vars: {},
        prompt: function () { return '<p>En el punto más alto de su trayectoria, ¿cómo es la velocidad de un proyectil lanzado a un ángulo $\\theta$ entre 0° y 90°?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Horizontal, igual a $v_0\\cos\\theta$', correct: true },
            { text: 'Cero', say: 'Solo $v_y$ vale cero en la cima; $v_x$ no cambia en todo el vuelo.' },
            { text: 'Vertical, hacia abajo', say: 'En la cima $v_y = 0$: no hay componente vertical todavía.' },
            { text: 'Igual a $v_0$', say: 'En la cima la rapidez es mínima: solo queda $v_x = v_0\\cos\\theta$.' }
          ];
        },
        answer: function () { return 'Horizontal, igual a $v_0\\cos\\theta$'; },
        hint: 'Piensa en cada componente por separado.',
        solution: function () { return '$v_x = v_0\\cos\\theta$ es constante y $v_y = 0$ en la cima, así que la velocidad es horizontal y vale $v_0\\cos\\theta$.'; }
      },
      {
        id: 'f1-s06-complementarios', title: 'Concepto: ángulos complementarios',
        vars: { a: [15, 40, 5] },
        prompt: function (v) { return '<p>Dos proyectiles salen del piso con la misma rapidez, uno a $' + v.a + '^\\circ$ y otro a $' + (90 - v.a) + '^\\circ$. Sin aire, ¿cuál cae más lejos?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: 'Caen en el mismo punto', correct: true },
            { text: 'El de ' + (90 - v.a) + '°', say: 'Sube más y tarda más, pero avanza más lento: $\\sin 2\\theta$ es igual para los dos.' },
            { text: 'El de ' + v.a + '°', say: 'Avanza más rápido, pero está menos tiempo en el aire. Compara $\\sin 2\\theta$.' },
            { text: 'Depende de la rapidez', say: 'La rapidez es la misma para los dos, así que el factor $v_0^2/g$ es igual.' }
          ];
        },
        answer: function () { return 'Caen en el mismo punto'; },
        hint: 'Compara $\\sin 2\\theta$ para los dos ángulos.',
        solution: function (v) { return '$\\sin(2\\cdot' + v.a + '^\\circ) = \\sin ' + (2 * v.a) + '^\\circ$ y $\\sin(2\\cdot' + (90 - v.a) + '^\\circ) = \\sin ' + (180 - 2 * v.a) + '^\\circ$ son iguales, así que $R = v_0^2\\sin 2\\theta/g$ es el mismo.'; }
      }
    ],

    quiz: { tags: ['f1.S06'], count: 8 },

    errors: [
      'Usar $\\sin\\theta$ en lugar de $\\sin 2\\theta$ en el alcance.',
      'Pensar que en la cima la velocidad es cero: solo lo es $v_y$.',
      'Usar $R = v_0^2\\sin 2\\theta/g$ o $T = 2v_0\\sin\\theta/g$ cuando el proyectil no cae a la misma altura de la que salió.',
      'Tener la calculadora en radianes con ángulos en grados.',
      'Poner $+g$ en $y(t)$ con el eje $y$ hacia arriba: la aceleración es $-g$.'
    ],

    teacher: {
      plan: [
        'Empieza con el diagrama de componentes: que noten que $v_x$ no cambia.',
        'Explainer paso a paso, derivando cada fórmula en el pizarrón antes de avanzar.',
        'Ejemplos 1 y 2; luego el lab con el error de $\\sin\\theta$ que ya trae cargado.'
      ],
      check: [
        'Que escriban $x(t)$ y $y(t)$ antes de usar fórmulas de alcance.',
        'Que revisen si el proyectil cae a la misma altura antes de usar $R$ y $T$.'
      ],
      note: 'La resistencia del aire queda fuera del curso; el lab lo aclara en su descripción.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 1</em>, §4.3 “Projectile Motion”. <a href="https://openstax.org/books/university-physics-volume-1/pages/4-3-projectile-motion">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §3.5 “Free Fall”. <a href="https://openstax.org/books/university-physics-volume-1/pages/3-5-free-fall">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-05',
    next: 'sesion-07'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
