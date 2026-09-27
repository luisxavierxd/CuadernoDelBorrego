/* =====================================================================
   Física 1 · S11 · Planos inclinados y dinámica circular (bloque C).
   Fuente: OpenStax, University Physics Volume 1, §6.1–6.3 (CC BY-NC-SA 4.0).
   g = 9.81 m/s². Las cuentas se comprueban contra LabMath.incline (lab incline).
   ===================================================================== */
(function () {
  var g = 9.81, RAD = Math.PI / 180, DEG = 180 / Math.PI;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function sn(t) { return Math.sin(t * RAD); }
  function cs(t) { return Math.cos(t * RAD); }
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

  var e1 = { m: 5, th: 35, mus: 0.3, muk: 0.25 }; e1.N = e1.m * g * cs(e1.th); e1.a = g * (sn(e1.th) - e1.muk * cs(e1.th));
  var e2 = { mus: 0.6 }; e2.th = Math.atan(e2.mus) * DEG;
  var e3 = { m: 10, th: 25, muk: 0.2, F: 120 };
  e3.Nh = e3.m * g * cs(e3.th) + e3.F * sn(e3.th); e3.ah = (e3.F * cs(e3.th) - e3.m * g * sn(e3.th) - e3.muk * e3.Nh) / e3.m;
  e3.Np = e3.m * g * cs(e3.th); e3.ap = (e3.F - e3.m * g * sn(e3.th) - e3.muk * e3.Np) / e3.m;
  var e4 = { m1: 4, m2: 3, th: 30, mu: 0.1 };
  e4.a = ((e4.m2 - e4.m1 * sn(e4.th)) * g - e4.mu * e4.m1 * g * cs(e4.th)) / (e4.m1 + e4.m2); e4.T = e4.m2 * (g - e4.a);
  var e5 = { r: 50, mu: 0.8 }; e5.v = Math.sqrt(e5.mu * g * e5.r);
  var e6 = { r: 120, v: 20 }; e6.th = Math.atan(e6.v * e6.v / (e6.r * g)) * DEG;

  var data = window.SESSION_DATA = {
    slug: 'sesion-11', number: '11', group: 'C · Dinámica',
    title: 'Planos inclinados y dinámica circular', temario: [],
    minutes: 180,
    quote: 'En un plano inclinado, gira los ejes: que uno apunte a lo largo del plano y el otro contra él.',
    badges: [
      'Descomponer el peso en un plano inclinado.',
      'Encontrar el ángulo crítico y la aceleración al subir o bajar con fricción.',
      'Comparar una fuerza paralela al plano con una horizontal.',
      'Resolver curvas planas y peraltadas con $F = mv^2/r$.'
    ],

    lesson: [
      {
        type: 'explainer', heading: 'Descomponer el peso en un plano', short: 'Plano inclinado',
        title: 'Ejes a lo largo y contra el plano',
        intro: 'Conviene poner el eje $x$ a lo largo del plano: así la aceleración queda en un solo eje y solo hay que descomponer el peso.',
        diagram: 'incline-explainer',
        steps: [
          { text: 'Un bloque sobre un plano de ángulo $\\theta$.', state: { step: 0 } },
          { text: 'El peso $mg$ apunta vertical hacia abajo, no contra el plano.', state: { step: 1 } },
          { text: 'Componentes: $mg\\sin\\theta$ a lo largo del plano (hacia abajo) y $mg\\cos\\theta$ contra el plano. El ángulo entre $mg$ y la perpendicular al plano es $\\theta$.', state: { step: 2 } },
          { text: 'La normal equilibra la componente perpendicular: $N = mg\\cos\\theta$ (si no hay otras fuerzas perpendiculares).', state: { step: 3 } },
          { text: 'La fricción va a lo largo del plano, contra el movimiento: $f_k = \\mu_k mg\\cos\\theta$.', state: { step: 4 } }
        ]
      },
      {
        type: 'example', heading: 'Un bloque que baja con fricción',
        problem: '<p>Un bloque de $' + e1.m + '\\ \\text{kg}$ se suelta en un plano de $' + e1.th + '^\\circ$ ($\\mu_s = ' + e1.mus + '$, $\\mu_k = ' + e1.muk + '$). ¿Se mueve? ¿Con qué aceleración?</p>',
        steps: [
          { text: '¿Resbala? Compara $mg\\sin\\theta$ con $\\mu_s mg\\cos\\theta$, o sea $\\tan\\theta$ con $\\mu_s$.', math: '\\tan ' + e1.th + '^\\circ = ' + fx(Math.tan(e1.th * RAD), 3) + ' > 0.3 \\;\\Rightarrow\\; \\text{sí resbala}' },
          { text: 'Normal.', math: 'N = mg\\cos\\theta = ' + fx(e1.N) + '\\ \\text{N}' },
          { text: 'A lo largo del plano, positivo hacia abajo.', math: 'a = g(\\sin\\theta - \\mu_k\\cos\\theta) = 9.81(' + fx(sn(e1.th), 4) + ' - 0.25\\cdot ' + fx(cs(e1.th), 4) + ') = ' + fx(e1.a, 3) + '\\ \\text{m/s}^2' },
          { text: 'La masa se cancela: un bloque más pesado bajaría con la misma aceleración.' }
        ],
        answer: 'Sí resbala, con $a \\approx ' + fx(e1.a) + '\\ \\text{m/s}^2$ plano abajo.',
        verify: { lab: 'call', mod: 'incline', fn: 'slope', args: [{ m: e1.m, th: e1.th, mus: e1.mus, muk: e1.muk, motion: 'rest' }], values: { N: e1.N, a: -e1.a } }
      },
      {
        type: 'example', heading: 'El ángulo crítico',
        problem: '<p>Un bloque descansa sobre una tabla que inclinas poco a poco ($\\mu_s = ' + e2.mus + '$). ¿A qué ángulo empieza a resbalar?</p>',
        steps: [
          { text: 'Justo antes de resbalar, la fricción estática está en su máximo.', math: 'mg\\sin\\theta = \\mu_s mg\\cos\\theta' },
          { text: 'La masa y $g$ se cancelan.', math: '\\tan\\theta_c = \\mu_s \\;\\Rightarrow\\; \\theta_c = \\arctan 0.6 = ' + fx(e2.th, 2) + '^\\circ' },
          { text: 'Así se mide $\\mu_s$ en el laboratorio: inclinando hasta que resbala.' }
        ],
        answer: '$\\theta_c \\approx ' + fx(e2.th, 1) + '^\\circ$.',
        verify: { lab: 'call', mod: 'incline', fn: 'critical', args: [e2.mus], value: e2.th }
      },
      {
        type: 'example', heading: 'Empujar plano arriba: horizontal o paralela',
        problem: '<p>Empujas una caja de $' + e3.m + '\\ \\text{kg}$ plano arriba sobre una rampa de $' + e3.th + '^\\circ$ ($\\mu_k = ' + e3.muk + '$) con $' + e3.F + '\\ \\text{N}$. Compara la aceleración si la fuerza es <strong>horizontal</strong> o <strong>paralela al plano</strong>.</p>',
        steps: [
          { text: 'Horizontal: su componente perpendicular aprieta la caja contra la rampa.', math: 'N = mg\\cos\\theta + F\\sin\\theta = ' + fx(e3.Nh) + '\\ \\text{N}' },
          { text: 'A lo largo del plano (positivo hacia arriba).', math: 'a = \\frac{F\\cos\\theta - mg\\sin\\theta - \\mu_kN}{m} = ' + fx(e3.ah, 3) + '\\ \\text{m/s}^2' },
          { text: 'Paralela: toda la fuerza empuja plano arriba y la normal es solo $mg\\cos\\theta = ' + fx(e3.Np) + '$ N.', math: 'a = \\frac{F - mg\\sin\\theta - \\mu_kN}{m} = ' + fx(e3.ap, 3) + '\\ \\text{m/s}^2' },
          { text: 'Con la misma fuerza, empujar paralelo al plano acelera más.' }
        ],
        answer: 'Horizontal: $a \\approx ' + fx(e3.ah) + '\\ \\text{m/s}^2$. Paralela: $a \\approx ' + fx(e3.ap) + '\\ \\text{m/s}^2$.',
        verify: { lab: 'call', mod: 'incline', fn: 'slope', args: [{ m: e3.m, th: e3.th, mus: e3.muk, muk: e3.muk, motion: 'up', F: e3.F, Fmode: 'horizontal' }], values: { N: e3.Nh, a: e3.ah } }
      },
      {
        type: 'example', heading: 'Dos bloques: uno en el plano y otro colgando',
        problem: '<p>Un bloque de $' + e4.m1 + '\\ \\text{kg}$ está en un plano de $' + e4.th + '^\\circ$ ($\\mu_k = ' + e4.mu + '$), unido por una cuerda que pasa por una polea en lo alto a una masa de $' + e4.m2 + '\\ \\text{kg}$ que cuelga. ¿Qué aceleración tienen y cuál es la tensión?</p>',
        steps: [
          { text: 'Sentido del movimiento: $m_2g = ' + fx(e4.m2 * g) + '$ N contra $m_1g\\sin\\theta = ' + fx(e4.m1 * g * sn(e4.th)) + '$ N. Gana la masa que cuelga: el bloque sube.' },
          { text: 'Ecuaciones de cada cuerpo.', math: 'm_2g - T = m_2a \\qquad T - m_1g\\sin\\theta - \\mu_k m_1g\\cos\\theta = m_1a' },
          { text: 'Súmalas.', math: 'a = \\frac{m_2g - m_1g\\sin\\theta - \\mu_k m_1g\\cos\\theta}{m_1 + m_2} = ' + fx(e4.a, 3) + '\\ \\text{m/s}^2' },
          { text: 'Tensión.', math: 'T = m_2(g - a) = ' + fx(e4.T) + '\\ \\text{N}' }
        ],
        answer: '$a \\approx ' + fx(e4.a, 2) + '\\ \\text{m/s}^2$ y $T \\approx ' + fx(e4.T, 1) + '\\ \\text{N}$.',
        verify: { lab: 'call', mod: 'incline', fn: 'twoBlocks', args: [e4.m1, e4.m2, e4.th, e4.mu], values: { a: e4.a, T: e4.T } }
      },
      {
        type: 'concept', heading: 'Dinámica circular', short: 'Dinámica circular',
        body: [
          'En S07 viste que un cuerpo que gira a rapidez constante tiene aceleración centrípeta $a_c = v^2/r$. Por la segunda ley, alguna fuerza real debe apuntar al centro: $$\\Sigma F_{centro} = \\frac{mv^2}{r}$$',
          'Esa fuerza puede ser la tensión de una cuerda, la fricción de las llantas en una curva plana o la componente horizontal de la normal en una curva peraltada. No hay una "fuerza centrípeta" extra en el DCL.',
          'Curva plana: la fricción estática da la fuerza al centro: $\\mu_s mg \\ge mv^2/r$, así que $v_{máx} = \\sqrt{\\mu_s g r}$.'
        ],
        diagram: 'banked-curve',
        caption: 'En una curva peraltada, la normal ayuda a girar: sin fricción, $\\tan\\theta = v^2/(rg)$.'
      },
      {
        type: 'example', heading: 'La velocidad máxima en una curva plana',
        problem: '<p>Un auto toma una curva plana de $' + e5.r + '\\ \\text{m}$ de radio. Si $\\mu_s = ' + e5.mu + '$ entre llantas y pavimento, ¿a qué velocidad máxima puede tomarla sin derrapar?</p>',
        steps: [
          { text: 'La fricción estática es la única fuerza horizontal: apunta al centro.', math: '\\mu_s mg = \\frac{mv^2}{r}' },
          { text: 'La masa se cancela.', math: 'v_{máx} = \\sqrt{\\mu_s g r} = \\sqrt{0.8(9.81)(50)} = ' + fx(e5.v) + '\\ \\text{m/s}' },
          { text: 'Son unos ' + fx(e5.v * 3.6, 0) + ' km/h. Con pavimento mojado ($\\mu_s$ menor) la velocidad segura baja.' }
        ],
        answer: '$v_{máx} \\approx ' + fx(e5.v, 1) + '\\ \\text{m/s}$.',
        verify: { lab: 'call', mod: 'incline', fn: 'flatCurve', args: [e5.r, e5.mu], value: e5.v }
      },
      {
        type: 'example', heading: 'El peralte ideal',
        problem: '<p>¿Qué peralte debe tener una curva de $' + e6.r + '\\ \\text{m}$ de radio para que un auto la tome a $' + e6.v + '\\ \\text{m/s}$ sin necesitar fricción?</p>',
        steps: [
          { text: 'Sin fricción, la normal hace todo: su componente vertical equilibra el peso y la horizontal da la fuerza al centro.', math: 'N\\cos\\theta = mg \\qquad N\\sin\\theta = \\frac{mv^2}{r}' },
          { text: 'Divide una entre otra.', math: '\\tan\\theta = \\frac{v^2}{rg} = \\frac{400}{1177.2} \\;\\Rightarrow\\; \\theta = ' + fx(e6.th, 2) + '^\\circ' }
        ],
        answer: '$\\theta \\approx ' + fx(e6.th, 1) + '^\\circ$.',
        verify: { lab: 'call', mod: 'incline', fn: 'banked', args: [e6.r, e6.th, 0], values: { ideal: e6.v } }
      },
      {
        type: 'callout', heading: 'Revisa tus ángulos',
        body: [
          'Comprueba con casos extremos: con $\\theta = 0$ el plano es horizontal y $mg\\sin\\theta$ debe ser cero; con $\\theta = 90^\\circ$ el bloque cae libre y $N$ debe ser cero.',
          'La fricción siempre se opone al deslizamiento: cambia de lado según el bloque suba o baje.'
        ]
      }
    ],

    lab: {
      type: 'incline', title: 'Plano inclinado y curva peraltada',
      intro: 'Cambia el ángulo, la fricción y la fuerza aplicada, y compara tu $|a|$ con la real; en la curva peraltada, tu velocidad máxima. El lab detecta si intercambiaste seno y coseno, si olvidaste la fricción o si la pusiste del lado equivocado.',
      cfg: { start: { mode: 'plane', th: 30, m: 5, mus: 0.4, muk: 0.3, motion: 'rest', F: 0, Fmode: 'parallel', r: 60, bank: 15, mu: 0.3 } }
    },

    formulas: [
      { label: 'Componentes del peso', tex: 'mg\\sin\\theta\\ (\\parallel),\\ \\ mg\\cos\\theta\\ (\\perp)' },
      { label: 'Normal en el plano', tex: 'N = mg\\cos\\theta' },
      { label: 'Baja con fricción', tex: 'a = g(\\sin\\theta - \\mu_k\\cos\\theta)' },
      { label: 'Sube frenando', tex: 'a = -g(\\sin\\theta + \\mu_k\\cos\\theta)' },
      { label: 'Ángulo crítico', tex: '\\tan\\theta_c = \\mu_s' },
      { label: 'Circular', tex: '\\Sigma F_{centro} = \\frac{mv^2}{r}' },
      { label: 'Curva plana', tex: 'v_{máx} = \\sqrt{\\mu_s g r}' },
      { label: 'Peralte sin fricción', tex: '\\tan\\theta = \\frac{v^2}{rg}' }
    ],

    exercises: [
      {
        id: 'f1-s11-critico', title: 'Ángulo crítico',
        vars: { mus: [0.1, 1.2, 0.05] },
        prompt: function (v) { return '<p>Un bloque está sobre una tabla con $\\mu_s = ' + v.mus + '$. ¿A qué ángulo empieza a resbalar si inclinas la tabla?</p>'; },
        check: 'numeric', unit: '°', tol: { abs: 0.3 },
        answer: function (v) { return Math.atan(v.mus) * DEG; },
        baseWhere: function (v) { return Math.abs(v.mus - 1) > 0.1; },
        mistakes: { inverted: function (v) { return Math.atan(1 / v.mus) * DEG; } },
        feedback: [{ when: 'inverted', say: 'Invertiste la razón: $\\tan\\theta_c = \\mu_s$, no $1/\\mu_s$.' }],
        oracle: { lab: 'call', mod: 'incline', fn: 'critical', args: function (v) { return [v.mus]; } },
        hint: 'Justo antes de resbalar: $mg\\sin\\theta = \\mu_s mg\\cos\\theta$.',
        solution: function (v) { return '$$\\theta_c = \\arctan ' + v.mus + ' = ' + fx(Math.atan(v.mus) * DEG, 2) + '^\\circ$$'; }
      },
      {
        id: 'f1-s11-baja', title: 'Bloque que baja con fricción',
        vars: { th: [20, 60, 5], muk: [0.05, 0.5, 0.05] },
        prompt: function (v) { return '<p>Un bloque baja deslizando por un plano de $' + v.th + '^\\circ$ con $\\mu_k = ' + v.muk + '$. ¿Qué aceleración tiene?</p>'; },
        check: 'numeric', unit: 'm/s²',
        answer: function (v) { return g * (sn(v.th) - v.muk * cs(v.th)); },
        baseWhere: function (v) { return sn(v.th) - v.muk * cs(v.th) > 0.1 && v.th !== 45; },
        mistakes: { noFriction: function (v) { return g * sn(v.th); }, swapped: function (v) { return g * (cs(v.th) - v.muk * sn(v.th)); } },
        feedback: [
          { when: 'noFriction', say: 'Te faltó la fricción: resta $\\mu_k g\\cos\\theta$.' },
          { when: 'swapped', say: 'Intercambiaste seno y coseno: a lo largo del plano va $\\sin\\theta$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return -window.LabMath.incline.slope({ m: 1, th: v.th, mus: 0, muk: v.muk, motion: 'down' }).a; } },
        hint: 'A lo largo del plano: $mg\\sin\\theta - \\mu_k mg\\cos\\theta = ma$.',
        solution: function (v) { return '$$a = g(\\sin\\theta - \\mu_k\\cos\\theta) = 9.81(' + fx(sn(v.th), 4) + ' - ' + v.muk + '\\cdot ' + fx(cs(v.th), 4) + ') = ' + fx(g * (sn(v.th) - v.muk * cs(v.th)), 3) + '\\ \\text{m/s}^2$$'; }
      },
      {
        id: 'f1-s11-sube', title: 'Bloque que sube frenando',
        vars: { th: [15, 50, 5], muk: [0.05, 0.5, 0.05] },
        prompt: function (v) { return '<p>Lanzas un bloque plano arriba en una rampa de $' + v.th + '^\\circ$ ($\\mu_k = ' + v.muk + '$). Mientras sube, ¿cuánto vale la magnitud de su desaceleración?</p>'; },
        check: 'numeric', unit: 'm/s²',
        answer: function (v) { return g * (sn(v.th) + v.muk * cs(v.th)); },
        mistakes: { frictionWrongSide: function (v) { return Math.abs(g * (sn(v.th) - v.muk * cs(v.th))); } },
        feedback: [{ when: 'frictionWrongSide', say: 'Mientras sube, la fricción apunta plano abajo, igual que $mg\\sin\\theta$: se suman.' }],
        oracle: { lab: 'value', value: function (v) { return -window.LabMath.incline.slope({ m: 1, th: v.th, mus: 0, muk: v.muk, motion: 'up' }).a; } },
        hint: 'Al subir, el peso y la fricción frenan juntos.',
        solution: function (v) { return '$$|a| = g(\\sin\\theta + \\mu_k\\cos\\theta) = ' + fx(g * (sn(v.th) + v.muk * cs(v.th)), 3) + '\\ \\text{m/s}^2$$'; }
      },
      {
        id: 'f1-s11-horizontal', title: 'Empujar plano arriba con fuerza horizontal',
        vars: { m: [2, 20, 1], th: [10, 40, 5], F: [40, 250, 10], muk: [0.05, 0.4, 0.05] },
        prompt: function (v) { return '<p>Empujas horizontalmente con $' + v.F + '\\ \\text{N}$ una caja de $' + v.m + '\\ \\text{kg}$ que sube por una rampa de $' + v.th + '^\\circ$ ($\\mu_k = ' + v.muk + '$). ¿Qué aceleración tiene plano arriba?</p>'; },
        check: 'numeric', unit: 'm/s²',
        answer: function (v) { var N = v.m * g * cs(v.th) + v.F * sn(v.th); return (v.F * cs(v.th) - v.m * g * sn(v.th) - v.muk * N) / v.m; },
        baseWhere: function (v) { var N = v.m * g * cs(v.th) + v.F * sn(v.th); return (v.F * cs(v.th) - v.m * g * sn(v.th) - v.muk * N) / v.m > 0.3; },
        mistakes: { normalMgCos: function (v) { return (v.F * cs(v.th) - v.m * g * sn(v.th) - v.muk * v.m * g * cs(v.th)) / v.m; }, asParallel: function (v) { return (v.F - v.m * g * sn(v.th) - v.muk * v.m * g * cs(v.th)) / v.m; } },
        feedback: [
          { when: 'normalMgCos', say: 'La fuerza horizontal también aprieta la caja contra la rampa: $N = mg\\cos\\theta + F\\sin\\theta$.' },
          { when: 'asParallel', say: 'Tomaste la fuerza como paralela al plano. Es horizontal: solo $F\\cos\\theta$ va a lo largo.' }
        ],
        oracle: { lab: 'call', mod: 'incline', fn: 'slope', field: 'a', args: function (v) { return [{ m: v.m, th: v.th, mus: v.muk, muk: v.muk, motion: 'up', F: v.F, Fmode: 'horizontal' }]; } },
        hint: 'Descompón la fuerza horizontal: $F\\cos\\theta$ a lo largo y $F\\sin\\theta$ contra el plano.',
        solution: function (v) { var N = v.m * g * cs(v.th) + v.F * sn(v.th), a = (v.F * cs(v.th) - v.m * g * sn(v.th) - v.muk * N) / v.m; return '$$N = ' + fx(N) + '\\ \\text{N} \\qquad a = \\frac{F\\cos\\theta - mg\\sin\\theta - \\mu_kN}{m} = ' + fx(a, 3) + '\\ \\text{m/s}^2$$'; }
      },
      {
        id: 'f1-s11-polea', title: 'Bloque en el plano con polea',
        vars: { m1: [1, 8, 0.5], m2: [1, 8, 0.5], th: [15, 45, 5], mu: [0, 0.3, 0.05] },
        prompt: function (v) { return '<p>Un bloque de $' + v.m1 + '\\ \\text{kg}$ en un plano de $' + v.th + '^\\circ$ ($\\mu_k = ' + v.mu + '$) está unido por una polea en lo alto a una masa de $' + v.m2 + '\\ \\text{kg}$ que cuelga y baja. ¿Qué aceleración tienen?</p>'; },
        check: 'numeric', unit: 'm/s²',
        answer: function (v) { return ((v.m2 - v.m1 * sn(v.th)) * g - v.mu * v.m1 * g * cs(v.th)) / (v.m1 + v.m2); },
        baseWhere: function (v) { return ((v.m2 - v.m1 * sn(v.th)) * g - v.mu * v.m1 * g * cs(v.th)) / (v.m1 + v.m2) > 0.3 && v.mu > 0; },
        mistakes: { noFriction: function (v) { return (v.m2 - v.m1 * sn(v.th)) * g / (v.m1 + v.m2); }, fullWeight: function (v) { return ((v.m2 - v.m1) * g - v.mu * v.m1 * g * cs(v.th)) / (v.m1 + v.m2); } },
        feedback: [
          { when: 'noFriction', say: 'Te faltó la fricción sobre el bloque del plano.' },
          { when: 'fullWeight', say: 'Del bloque en el plano solo frena la componente $m_1g\\sin\\theta$, no todo su peso.' }
        ],
        oracle: { lab: 'call', mod: 'incline', fn: 'twoBlocks', field: 'a', args: function (v) { return [v.m1, v.m2, v.th, v.mu]; } },
        hint: 'Una ecuación por cuerpo y súmalas para eliminar $T$.',
        solution: function (v) { var a = ((v.m2 - v.m1 * sn(v.th)) * g - v.mu * v.m1 * g * cs(v.th)) / (v.m1 + v.m2); return '$$a = \\frac{m_2g - m_1g\\sin\\theta - \\mu_k m_1g\\cos\\theta}{m_1 + m_2} = ' + fx(a, 3) + '\\ \\text{m/s}^2$$'; }
      },
      {
        id: 'f1-s11-curva', title: 'Velocidad máxima en una curva plana',
        vars: { r: [10, 200, 10], mu: [0.2, 1, 0.05] },
        prompt: function (v) { return '<p>¿A qué velocidad máxima puede tomar un auto una curva plana de $' + v.r + '\\ \\text{m}$ de radio si $\\mu_s = ' + v.mu + '$?</p>'; },
        check: 'numeric', unit: 'm/s',
        answer: function (v) { return Math.sqrt(v.mu * g * v.r); },
        mistakes: { noSqrt: function (v) { return v.mu * g * v.r; } },
        feedback: [{ when: 'noSqrt', say: 'Ese es $v^2$: falta sacar la raíz.' }],
        oracle: { lab: 'call', mod: 'incline', fn: 'flatCurve', args: function (v) { return [v.r, v.mu]; } },
        hint: 'La fricción estática da la fuerza hacia el centro: $\\mu_s mg = mv^2/r$.',
        solution: function (v) { return '$$v = \\sqrt{\\mu_s g r} = \\sqrt{' + v.mu + '(9.81)(' + v.r + ')} = ' + fx(Math.sqrt(v.mu * g * v.r), 3) + '\\ \\text{m/s}$$'; }
      },
      {
        id: 'f1-s11-peralte', title: 'Peralte sin fricción',
        vars: { r: [30, 300, 10], v: [10, 35, 1] },
        prompt: function (v) { return '<p>¿Qué peralte necesita una curva de $' + v.r + '\\ \\text{m}$ de radio para tomarla a $' + v.v + '\\ \\text{m/s}$ sin depender de la fricción?</p>'; },
        check: 'numeric', unit: '°', tol: { abs: 0.3 },
        answer: function (v) { return Math.atan(v.v * v.v / (v.r * g)) * DEG; },
        baseWhere: function (v) { return v.v * v.v / (v.r * g) < 1.5; },
        mistakes: { inverted: function (v) { return Math.atan(v.r * g / (v.v * v.v)) * DEG; } },
        feedback: [{ when: 'inverted', say: 'Invertiste la razón: $\\tan\\theta = v^2/(rg)$.' }],
        oracle: { lab: 'value', value: function (v) { var s = 0, e = 89; for (var i = 0; i < 80; i++) { var mid = (s + e) / 2; if (window.LabMath.incline.banked(v.r, mid, 0).ideal < v.v) s = mid; else e = mid; } return (s + e) / 2; } },
        hint: 'Sin fricción: $N\\cos\\theta = mg$ y $N\\sin\\theta = mv^2/r$.',
        solution: function (v) { return '$$\\tan\\theta = \\frac{v^2}{rg} = \\frac{' + (v.v * v.v) + '}{' + fx(v.r * g, 1) + '} \\;\\Rightarrow\\; \\theta = ' + fx(Math.atan(v.v * v.v / (v.r * g)) * DEG, 2) + '^\\circ$$'; }
      },
      {
        id: 'f1-s11-concepto', title: 'Concepto: la fuerza hacia el centro',
        vars: {},
        prompt: function () { return '<p>Un auto toma una curva plana a rapidez constante. ¿Qué fuerza lo mantiene girando?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'La fricción estática de las llantas, hacia el centro', correct: true },
            { text: 'La fuerza centrífuga', say: 'En el DCL no existe; es la sensación de que tu cuerpo quiere seguir recto.' },
            { text: 'El motor, hacia adelante', say: 'El motor compensa la resistencia; no dobla la trayectoria.' },
            { text: 'Ninguna: a rapidez constante no hace falta fuerza', say: 'La dirección cambia, así que hay aceleración centrípeta y hace falta una fuerza.' }
          ];
        },
        answer: function () { return 'La fricción estática de las llantas, hacia el centro'; },
        hint: '¿Qué toca al auto y puede empujarlo de lado?',
        solution: function () { return 'Solo el pavimento puede empujar al auto hacia el centro: la fricción estática (las llantas no derrapan) da $mv^2/r$.'; }
      }
    ],

    quiz: { tags: ['f1.S11'], count: 8 },

    errors: [
      'Intercambiar $\\sin\\theta$ y $\\cos\\theta$ al descomponer el peso.',
      'Usar $N = mg\\cos\\theta$ cuando hay una fuerza con componente perpendicular al plano.',
      'Dejar la fricción del mismo lado al subir y al bajar.',
      'Agregar una "fuerza centrípeta" o una "fuerza centrífuga" al DCL.',
      'Olvidar sacar la raíz al despejar la velocidad de $v^2 = \\mu_s g r$.'
    ],

    teacher: {
      plan: [
        'Explainer de descomposición del peso; comprobar con θ = 0 y θ = 90°.',
        'Ejemplos de plano: bajar, ángulo crítico, fuerza horizontal y el sistema con polea.',
        'Dinámica circular: ¿quién da la fuerza al centro? Curva plana y peralte en el lab.'
      ],
      check: [
        'Que roten los ejes a lo largo del plano.',
        'Que identifiquen la fuerza real que apunta al centro en cada problema circular.'
      ],
      note: 'Cierra el bloque C: los problemas de examen combinan S08 a S11.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 1</em>, §6.1 “Solving Problems with Newton’s Laws”. <a href="https://openstax.org/books/university-physics-volume-1/pages/6-1-solving-problems-with-newtons-laws">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §6.2 “Friction”. <a href="https://openstax.org/books/university-physics-volume-1/pages/6-2-friction">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §6.3 “Centripetal Force”. <a href="https://openstax.org/books/university-physics-volume-1/pages/6-3-centripetal-force">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-10',
    next: 'sesion-12'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
