/* =====================================================================
   Física 1 · S14 · Equilibrio de la partícula: fuerzas, tensiones en cables
   y resortes (bloque E · Estática).
   Fuente: OpenStax, University Physics Volume 1, §5.7 y §12.1 (CC BY-NC-SA 4.0).
   g = 9.81 m/s². Las cuentas se comprueban contra LabMath.equilibrium
   (lab particle-equilibrium).
   ===================================================================== */
(function () {
  var g = 9.81, RAD = Math.PI / 180;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function sn(t) { return Math.sin(t * RAD); }
  function cs(t) { return Math.cos(t * RAD); }
  function tn(t) { return Math.tan(t * RAD); }
  function T1(m, a, b) { return m * g * cs(b) / sn(a + b); }
  function T2(m, a, b) { return m * g * cs(a) / sn(a + b); }
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

  var e1 = { m: 10, a: 30, b: 60 }; e1.T1 = T1(e1.m, e1.a, e1.b); e1.T2 = T2(e1.m, e1.a, e1.b);
  var e2 = { m: 5, th: 20 }; e2.T = e2.m * g / (2 * sn(e2.th));
  var e3 = { m: 20, th: 50 }; e3.S = e3.m * g / sn(e3.th); e3.H = e3.m * g / tn(e3.th);
  var e4 = { m: 8, th: 25 }; e4.T = e4.m * g * sn(e4.th); e4.N = e4.m * g * cs(e4.th);
  var e5 = { m: 3, phi: 30, k: 500 }; e5.S = e5.m * g / cs(e5.phi); e5.F = e5.m * g * tn(e5.phi); e5.x = e5.S / e5.k;

  var data = window.SESSION_DATA = {
    slug: 'sesion-14', number: '14', group: 'E · Estática',
    title: 'Equilibrio de la partícula: fuerzas, tensiones en cables y resortes', temario: [],
    minutes: 180,
    quote: 'En equilibrio las fuerzas se cancelan: dibujadas punta con cola, cierran un polígono.',
    badges: [
      'Plantear $\\Sigma F_x = 0$ y $\\Sigma F_y = 0$ en un nudo o una partícula.',
      'Resolver tensiones en cables simétricos y asimétricos.',
      'Resolver casos con un cable horizontal, un plano inclinado o un resorte.',
      'Explicar por qué un cable casi horizontal soporta tensiones enormes.'
    ],

    lesson: [
      {
        type: 'concept', heading: 'Equilibrio de una partícula', short: 'Equilibrio',
        body: [
          'Un cuerpo está en <strong>equilibrio</strong> si su aceleración es cero: en reposo (equilibrio estático) o con velocidad constante. Por la segunda ley, $$\\Sigma \\vec F = 0 \\quad\\Longleftrightarrow\\quad \\Sigma F_x = 0,\\ \\ \\Sigma F_y = 0$$',
          'Si todas las fuerzas pasan por un punto (un nudo, una partícula) basta con esas dos ecuaciones: dos incógnitas como máximo.',
          'Receta: aísla el nudo, dibuja su DCL, descompón cada fuerza con su ángulo y resuelve el sistema de 2 × 2.'
        ]
      },
      {
        type: 'explainer', heading: 'Un peso colgado de dos cables', short: 'Dos cables',
        title: 'El nudo es la partícula',
        intro: 'El peso cuelga de un nudo; el nudo está en equilibrio bajo tres fuerzas.',
        diagram: 'knot-explainer',
        steps: [
          { text: 'Dos cables sostienen el peso. Cada uno forma su propio ángulo con el techo (la horizontal).', state: { step: 0 } },
          { text: 'Aísla el nudo: $\\vec T_1$ y $\\vec T_2$ a lo largo de cada cable y el peso $mg$ hacia abajo (el cable vertical transmite el peso).', state: { step: 1 } },
          { text: 'Horizontal: las componentes se cancelan. $$T_1\\cos\\theta_1 = T_2\\cos\\theta_2$$', state: { step: 2 } },
          { text: 'Vertical: entre las dos sostienen el peso. $$T_1\\sin\\theta_1 + T_2\\sin\\theta_2 = mg$$ Resolviendo: $T_1 = \\frac{mg\\cos\\theta_2}{\\sin(\\theta_1 + \\theta_2)}$ y $T_2 = \\frac{mg\\cos\\theta_1}{\\sin(\\theta_1 + \\theta_2)}$.', state: { step: 3 } }
        ]
      },
      {
        type: 'example', heading: 'Cables con ángulos distintos',
        problem: '<p>Una maceta de $' + e1.m + '\\ \\text{kg}$ cuelga de dos cables que forman $' + e1.a + '^\\circ$ (izquierdo) y $' + e1.b + '^\\circ$ (derecho) con el techo. ¿Qué tensión tiene cada cable?</p>',
        steps: [
          { text: 'Ecuaciones del nudo.', math: 'T_1\\cos 30^\\circ = T_2\\cos 60^\\circ \\qquad T_1\\sin 30^\\circ + T_2\\sin 60^\\circ = 98.1' },
          { text: 'De la primera, $T_2 = T_1\\cos 30^\\circ/\\cos 60^\\circ = 1.732\\,T_1$. Sustituye en la segunda.', math: 'T_1(0.5 + 1.732 \\cdot 0.866) = 98.1 \\;\\Rightarrow\\; T_1 = ' + fx(e1.T1, 2) + '\\ \\text{N}' },
          { text: 'Y la otra.', math: 'T_2 = ' + fx(e1.T2, 2) + '\\ \\text{N}' },
          { text: 'El cable más inclinado (más cercano a la vertical) carga más. Ninguno es $mg/2$.' }
        ],
        answer: '$T_1 \\approx ' + fx(e1.T1, 1) + '\\ \\text{N}$ y $T_2 \\approx ' + fx(e1.T2, 1) + '\\ \\text{N}$.',
        verify: { lab: 'call', mod: 'equilibrium', fn: 'tensions', args: [e1.m, e1.a, e1.b], values: { T1: e1.T1, T2: e1.T2 } }
      },
      {
        type: 'example', heading: 'Cables simétricos',
        problem: '<p>Una lámpara de $' + e2.m + '\\ \\text{kg}$ cuelga del centro de un cable; cada mitad forma $' + e2.th + '^\\circ$ con la horizontal. ¿Cuál es la tensión?</p>',
        steps: [
          { text: 'Por simetría las dos tensiones son iguales y las horizontales se cancelan solas.', math: '2T\\sin\\theta = mg' },
          { text: 'Despeja.', math: 'T = \\frac{mg}{2\\sin\\theta} = \\frac{49.05}{2\\sin 20^\\circ} = ' + fx(e2.T, 2) + '\\ \\text{N}' },
          { text: 'Con ángulos pequeños, $\\sin\\theta$ es chico y la tensión crece mucho. Por eso los cables de luz nunca quedan tensos del todo.' }
        ],
        answer: '$T \\approx ' + fx(e2.T, 1) + '\\ \\text{N}$.',
        verify: { lab: 'call', mod: 'equilibrium', fn: 'symmetric', args: [e2.m, e2.th], value: e2.T }
      },
      {
        type: 'concept', heading: 'Un cable casi horizontal', short: 'Cable tenso',
        body: [
          'De $T = mg/(2\\sin\\theta)$: con $\\theta = 30^\\circ$, $T = mg$; con $\\theta = 5^\\circ$, $T \\approx 5.7\\,mg$; con $\\theta = 1^\\circ$, $T \\approx 29\\,mg$.',
          'Un cable perfectamente horizontal no puede sostener nada: no tiene componente vertical. Siempre cede un poco.'
        ],
        diagram: 'sag-cable',
        caption: 'Mientras menor es el ángulo, mayor la tensión necesaria para sostener el mismo peso.'
      },
      {
        type: 'example', heading: 'Un cable horizontal y otro inclinado',
        problem: '<p>Un letrero de $' + e3.m + '\\ \\text{kg}$ cuelga de un nudo sostenido por un cable horizontal atado a la pared y otro cable a $' + e3.th + '^\\circ$ sobre la horizontal atado al techo. Encuentra las dos tensiones.</p>',
        steps: [
          { text: 'Vertical: solo el cable inclinado sostiene el peso.', math: 'T_{incl}\\sin 50^\\circ = mg \\;\\Rightarrow\\; T_{incl} = ' + fx(e3.S, 2) + '\\ \\text{N}' },
          { text: 'Horizontal: el cable horizontal equilibra la componente horizontal del inclinado.', math: 'T_{hor} = T_{incl}\\cos 50^\\circ = \\frac{mg}{\\tan 50^\\circ} = ' + fx(e3.H, 2) + '\\ \\text{N}' },
          { text: 'Ordena primero la ecuación que tiene una sola incógnita.' }
        ],
        answer: '$T_{incl} \\approx ' + fx(e3.S, 1) + '\\ \\text{N}$ y $T_{hor} \\approx ' + fx(e3.H, 1) + '\\ \\text{N}$.',
        verify: { lab: 'call', mod: 'equilibrium', fn: 'horizontalAndSlanted', args: [e3.m, e3.th], values: { slanted: e3.S, horizontal: e3.H } }
      },
      {
        type: 'example', heading: 'Un bloque sostenido en un plano liso',
        problem: '<p>Un bloque de $' + e4.m + '\\ \\text{kg}$ está quieto en un plano liso de $' + e4.th + '^\\circ$, sostenido por una cuerda paralela al plano. ¿Qué tensión tiene la cuerda y cuánto vale la normal?</p>',
        steps: [
          { text: 'Ejes a lo largo y contra el plano (como en S11), con $a = 0$.', math: 'T = mg\\sin\\theta = ' + fx(e4.T, 2) + '\\ \\text{N} \\qquad N = mg\\cos\\theta = ' + fx(e4.N, 2) + '\\ \\text{N}' },
          { text: 'Visto como un nudo: $T$ forma $' + e4.th + '^\\circ$ con la horizontal y $N$ forma $' + (90 - e4.th) + '^\\circ$ del otro lado. Son dos "cables" perpendiculares entre sí, así que $\\sin(\\theta_1 + \\theta_2) = 1$.' }
        ],
        answer: '$T \\approx ' + fx(e4.T, 1) + '\\ \\text{N}$ y $N \\approx ' + fx(e4.N, 1) + '\\ \\text{N}$.',
        verify: { lab: 'call', mod: 'equilibrium', fn: 'tensions', args: [e4.m, 90 - e4.th, e4.th], values: { T1: e4.N, T2: e4.T } }
      },
      {
        type: 'example', heading: 'Un resorte desviado',
        problem: '<p>Una masa de $' + e5.m + '\\ \\text{kg}$ cuelga de un resorte ($k = ' + e5.k + '\\ \\text{N/m}$). La jalas horizontalmente hasta que el resorte forma $' + e5.phi + '^\\circ$ con la vertical y la sostienes quieta. ¿Qué fuerza aplicas y cuánto se estira el resorte?</p>',
        steps: [
          { text: 'El resorte forma $' + (90 - e5.phi) + '^\\circ$ con la horizontal. Vertical: su componente sostiene el peso.', math: 'S\\cos 30^\\circ = mg \\;\\Rightarrow\\; S = ' + fx(e5.S, 2) + '\\ \\text{N}' },
          { text: 'Horizontal: tu fuerza equilibra la componente horizontal del resorte.', math: 'F = S\\sin 30^\\circ = mg\\tan 30^\\circ = ' + fx(e5.F, 2) + '\\ \\text{N}' },
          { text: 'Estiramiento: ley de Hooke con la fuerza total del resorte.', math: 'x = \\frac{S}{k} = ' + fx(e5.x, 4) + '\\ \\text{m}' },
          { text: 'Se estira más que colgando derecho ($mg/k = ' + fx(e5.m * g / e5.k, 4) + '$ m).' }
        ],
        answer: '$F \\approx ' + fx(e5.F, 1) + '\\ \\text{N}$ y $x \\approx ' + fx(e5.x * 100, 1) + '\\ \\text{cm}$.',
        verify: { lab: 'call', mod: 'equilibrium', fn: 'horizontalAndSlanted', args: [e5.m, 90 - e5.phi], values: { slanted: e5.S, horizontal: e5.F } }
      },
      {
        type: 'callout', heading: 'Comprueba tus tensiones',
        body: [
          'Casos límite: si un cable se vuelve vertical, debe cargar todo el peso y el otro nada.',
          'La suma de las tensiones casi nunca es $mg$: las componentes verticales sí suman $mg$.'
        ]
      }
    ],

    lab: {
      type: 'particle-equilibrium', title: 'Tensiones en dos cables',
      intro: 'Mueve la masa y los ángulos de los cables; el lab dibuja el nudo y el polígono de fuerzas, que se cierra en equilibrio. Escribe tus dos tensiones: detecta si repartiste el peso a la mitad, si intercambiaste $T_1$ y $T_2$ o si cambiaste seno por coseno.',
      cfg: { start: { m: 10, th1: 30, th2: 60 } }
    },

    formulas: [
      { label: 'Equilibrio', tex: '\\Sigma F_x = 0,\\ \\ \\Sigma F_y = 0' },
      { label: 'Dos cables', tex: 'T_1 = \\frac{mg\\cos\\theta_2}{\\sin(\\theta_1 + \\theta_2)},\\ \\ T_2 = \\frac{mg\\cos\\theta_1}{\\sin(\\theta_1 + \\theta_2)}' },
      { label: 'Simétricos', tex: 'T = \\frac{mg}{2\\sin\\theta}' },
      { label: 'Horizontal e inclinado', tex: 'T_{incl} = \\frac{mg}{\\sin\\theta},\\ \\ T_{hor} = \\frac{mg}{\\tan\\theta}' },
      { label: 'Plano liso', tex: 'T = mg\\sin\\theta,\\ \\ N = mg\\cos\\theta' }
    ],

    exercises: [
      {
        id: 'f1-s14-t1', title: 'Tensión del cable izquierdo',
        vars: { m: [2, 50, 1], a: [15, 75, 5], b: [15, 75, 5] },
        prompt: function (v) { return '<p>Una masa de $' + v.m + '\\ \\text{kg}$ cuelga de dos cables que forman $' + v.a + '^\\circ$ (izquierdo) y $' + v.b + '^\\circ$ (derecho) con el techo. ¿Qué tensión tiene el cable izquierdo?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return T1(v.m, v.a, v.b); },
        baseWhere: function (v) { return v.a !== v.b && v.a + v.b !== 90; },
        mistakes: { swapped: function (v) { return T2(v.m, v.a, v.b); }, half: function (v) { return v.m * g / 2; }, sinCos: function (v) { return T1(v.m, 90 - v.a, 90 - v.b); } },
        feedback: [
          { when: 'swapped', say: 'Esa es la tensión del otro cable. El izquierdo lleva $\\cos\\theta_2$ en el numerador.' },
          { when: 'half', say: 'El peso no se reparte a la mitad: plantea $\\Sigma F_x = 0$ y $\\Sigma F_y = 0$.' },
          { when: 'sinCos', say: 'Los ángulos se miden desde el techo (horizontal): la componente vertical es $T\\sin\\theta$.' }
        ],
        oracle: { lab: 'call', mod: 'equilibrium', fn: 'tensions', field: 'T1', args: function (v) { return [v.m, v.a, v.b]; } },
        hint: '$T_1\\cos\\theta_1 = T_2\\cos\\theta_2$ y $T_1\\sin\\theta_1 + T_2\\sin\\theta_2 = mg$.',
        solution: function (v) { return '$$T_1 = \\frac{mg\\cos\\theta_2}{\\sin(\\theta_1 + \\theta_2)} = \\frac{' + fx(v.m * g, 2) + '\\cos ' + v.b + '^\\circ}{\\sin ' + (v.a + v.b) + '^\\circ} = ' + fx(T1(v.m, v.a, v.b), 3) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f1-s14-t2', title: 'El cable que más carga',
        vars: { m: [2, 50, 1], a: [15, 75, 5], b: [15, 75, 5] },
        prompt: function (v) { return '<p>Un costal de $' + v.m + '\\ \\text{kg}$ cuelga de dos cuerdas con ángulos de $' + v.a + '^\\circ$ y $' + v.b + '^\\circ$ respecto a la horizontal. ¿Cuánto vale la tensión de la cuerda de $' + v.b + '^\\circ$?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return T2(v.m, v.a, v.b); },
        baseWhere: function (v) { return v.a !== v.b && v.a + v.b !== 90; },
        mistakes: { swapped: function (v) { return T1(v.m, v.a, v.b); }, weightOverSin: function (v) { return v.m * g / sn(v.b); } },
        feedback: [
          { when: 'swapped', say: 'Esa es la tensión de la otra cuerda.' },
          { when: 'weightOverSin', say: 'Esa cuerda no sostiene sola el peso: la otra también tiene componente vertical.' }
        ],
        oracle: { lab: 'call', mod: 'equilibrium', fn: 'tensions', field: 'T2', args: function (v) { return [v.m, v.a, v.b]; } },
        hint: 'Resuelve el sistema de 2 × 2 del nudo.',
        solution: function (v) { return '$$T_2 = \\frac{mg\\cos\\theta_1}{\\sin(\\theta_1 + \\theta_2)} = ' + fx(T2(v.m, v.a, v.b), 3) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f1-s14-simetrico', title: 'Cable que cuelga por el centro',
        vars: { m: [1, 40, 1], th: [3, 45, 1] },
        prompt: function (v) { return '<p>Una masa de $' + v.m + '\\ \\text{kg}$ cuelga del centro de un cable. Cada mitad del cable forma $' + v.th + '^\\circ$ con la horizontal. ¿Qué tensión tiene el cable?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return v.m * g / (2 * sn(v.th)); },
        mistakes: { noTwo: function (v) { return v.m * g / sn(v.th); }, cosInstead: function (v) { return v.m * g / (2 * cs(v.th)); }, half: function (v) { return v.m * g / 2; } },
        feedback: [
          { when: 'noTwo', say: 'Son dos mitades del cable: $2T\\sin\\theta = mg$.' },
          { when: 'cosInstead', say: 'El ángulo es con la horizontal: la componente vertical es $T\\sin\\theta$.' },
          { when: 'half', say: 'Solo la componente vertical sostiene: $T$ es mayor que $mg/2$.' }
        ],
        oracle: { lab: 'call', mod: 'equilibrium', fn: 'symmetric', args: function (v) { return [v.m, v.th]; } },
        hint: 'Por simetría: $2T\\sin\\theta = mg$.',
        solution: function (v) { return '$$T = \\frac{mg}{2\\sin\\theta} = \\frac{' + fx(v.m * g, 2) + '}{2\\sin ' + v.th + '^\\circ} = ' + fx(v.m * g / (2 * sn(v.th)), 3) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f1-s14-horizontal', title: 'Cable horizontal',
        vars: { m: [2, 60, 2], th: [20, 70, 5] },
        prompt: function (v) { return '<p>Un peso de $' + v.m + '\\ \\text{kg}$ cuelga de un nudo; un cable sube a $' + v.th + '^\\circ$ sobre la horizontal y otro va horizontal a la pared. ¿Qué tensión tiene el cable horizontal?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return v.m * g / tn(v.th); },
        baseWhere: function (v) { return v.th !== 45; },
        mistakes: { tanInverted: function (v) { return v.m * g * tn(v.th); }, slanted: function (v) { return v.m * g / sn(v.th); } },
        feedback: [
          { when: 'tanInverted', say: 'Invertiste la tangente: $T_{hor} = mg/\\tan\\theta$.' },
          { when: 'slanted', say: 'Esa es la tensión del cable inclinado. La horizontal es su componente $T\\cos\\theta$.' }
        ],
        oracle: { lab: 'call', mod: 'equilibrium', fn: 'horizontalAndSlanted', field: 'horizontal', args: function (v) { return [v.m, v.th]; } },
        hint: 'Primero la vertical (solo el cable inclinado), luego la horizontal.',
        solution: function (v) { return '$$T_{incl} = \\frac{mg}{\\sin\\theta} = ' + fx(v.m * g / sn(v.th), 3) + '\\ \\text{N} \\qquad T_{hor} = T_{incl}\\cos\\theta = ' + fx(v.m * g / tn(v.th), 3) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f1-s14-plano', title: 'Cuerda que sostiene un bloque en un plano liso',
        vars: { m: [1, 40, 1], th: [10, 60, 5] },
        prompt: function (v) { return '<p>Un bloque de $' + v.m + '\\ \\text{kg}$ se sostiene quieto en un plano liso de $' + v.th + '^\\circ$ con una cuerda paralela al plano. ¿Qué tensión tiene la cuerda?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return v.m * g * sn(v.th); },
        baseWhere: function (v) { return v.th !== 45; },
        mistakes: { cosInstead: function (v) { return v.m * g * cs(v.th); }, weight: function (v) { return v.m * g; } },
        feedback: [
          { when: 'cosInstead', say: 'Eso es la normal. A lo largo del plano va $mg\\sin\\theta$.' },
          { when: 'weight', say: 'La cuerda solo equilibra la componente del peso a lo largo del plano.' }
        ],
        oracle: { lab: 'call', mod: 'equilibrium', fn: 'tensions', field: 'T2', args: function (v) { return [v.m, 90 - v.th, v.th]; } },
        hint: 'A lo largo del plano: $T - mg\\sin\\theta = 0$.',
        solution: function (v) { return '$$T = mg\\sin\\theta = ' + fx(v.m * g, 2) + '\\sin ' + v.th + '^\\circ = ' + fx(v.m * g * sn(v.th), 3) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f1-s14-resorte', title: 'Resorte desviado de la vertical',
        vars: { m: [0.5, 10, 0.5], phi: [10, 60, 5], k: [100, 2000, 100] },
        prompt: function (v) { return '<p>Una masa de $' + v.m + '\\ \\text{kg}$ cuelga de un resorte de $k = ' + v.k + '\\ \\text{N/m}$. Una fuerza horizontal la sostiene de modo que el resorte forma $' + v.phi + '^\\circ$ con la vertical. ¿Cuánto se estira el resorte?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return v.m * g / (cs(v.phi) * v.k); },
        baseWhere: function (v) { return v.phi !== 45; },
        mistakes: { straight: function (v) { return v.m * g / v.k; }, sinInstead: function (v) { return v.m * g / (sn(v.phi) * v.k); } },
        feedback: [
          { when: 'straight', say: 'Así se estiraría colgando derecho. Inclinado, el resorte tira más: $S\\cos\\varphi = mg$.' },
          { when: 'sinInstead', say: 'El ángulo es con la vertical: la componente vertical es $S\\cos\\varphi$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return window.LabMath.equilibrium.horizontalAndSlanted(v.m, 90 - v.phi).slanted / v.k; } },
        hint: 'Vertical: $S\\cos\\varphi = mg$; luego $x = S/k$.',
        solution: function (v) { var S = v.m * g / cs(v.phi); return '$$S = \\frac{mg}{\\cos\\varphi} = ' + fx(S, 3) + '\\ \\text{N} \\qquad x = \\frac{S}{k} = ' + fx(S / v.k, 4) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s14-concepto', title: 'Concepto: tensar un cable',
        vars: {},
        prompt: function () { return '<p>Cuelgas una bolsa del centro de un tendedero. Si tensas más el tendedero para que quede casi horizontal, ¿qué pasa con la tensión?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Aumenta mucho: con un ángulo pequeño hace falta más tensión para sostener el mismo peso', correct: true },
            { text: 'Disminuye, porque el cable queda más derecho', say: 'Más derecho significa menos componente vertical: hace falta más tensión.' },
            { text: 'No cambia: siempre es igual al peso de la bolsa', say: 'De $2T\\sin\\theta = mg$, $T$ depende del ángulo.' },
            { text: 'Se vuelve cero cuando el cable queda horizontal', say: 'Al revés: un cable horizontal necesitaría tensión infinita.' }
          ];
        },
        answer: function () { return 'Aumenta mucho: con un ángulo pequeño hace falta más tensión para sostener el mismo peso'; },
        hint: 'Mira $T = mg/(2\\sin\\theta)$ cuando $\\theta \\to 0$.',
        solution: function () { return 'Con $2T\\sin\\theta = mg$, si $\\theta$ se hace pequeño, $\\sin\\theta$ también y $T$ crece sin límite.'; }
      }
    ],

    quiz: { tags: ['f1.S14'], count: 8 },

    errors: [
      'Repartir el peso a la mitad entre dos cables con ángulos distintos.',
      'Confundir el ángulo con la horizontal y con la vertical (seno por coseno).',
      'Intercambiar las tensiones: el cable más vertical carga más.',
      'Pensar que las tensiones suman el peso; lo que suma el peso son sus componentes verticales.',
      'Usar el estiramiento de colgar derecho cuando el resorte está inclinado.'
    ],

    teacher: {
      plan: [
        'Equilibrio como caso de la segunda ley con $a = 0$.',
        'Explainer del nudo y los casos simétrico, asimétrico y con cable horizontal.',
        'El cable casi horizontal: por qué nunca queda tenso del todo.',
        'Plano y resorte como problemas de nudo; lab con el polígono de fuerzas.'
      ],
      check: [
        'Que aíslen el nudo, no la masa ni el techo.',
        'Que prueben casos límite: un cable vertical carga todo.'
      ],
      note: 'La siguiente sesión agrega torques: cuerpos que pueden girar.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 1</em>, §5.7 “Drawing Free-Body Diagrams”. <a href="https://openstax.org/books/university-physics-volume-1/pages/5-7-drawing-free-body-diagrams">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §6.1 “Solving Problems with Newton’s Laws”. <a href="https://openstax.org/books/university-physics-volume-1/pages/6-1-solving-problems-with-newtons-laws">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §12.1 “Conditions for Static Equilibrium”. <a href="https://openstax.org/books/university-physics-volume-1/pages/12-1-conditions-for-static-equilibrium">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-13',
    next: 'sesion-15'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
