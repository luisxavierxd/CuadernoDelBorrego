/* =====================================================================
   Cálculo 3 · S13 · Coeficientes indeterminados: duplicación (× xˢ) y orden
   superior (bloque C · No homogéneas y orden superior).
   Fuente: OpenStax, Calculus Volume 3, §7.2 “Nonhomogeneous Linear Equations”,
   CC BY-NC-SA 4.0; MIT OCW 18.03SC, Unit II (resonancia), CC BY-NC-SA 4.0.
   Ejemplos y ejercicios propios. Se comprueban con LabMath.ode (lab ode-compare,
   modo de solución particular); los numéricos usan oráculos independientes.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function sg(n, s) { return n === 0 ? '' : (n < 0 ? ' - ' : ' + ') + (Math.abs(n) === 1 && s ? '' : Math.abs(n)) + (s || ''); }

  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 0.5)) return false;
      }
      return true;
    };
  }
  // Bisección de una función monótona en [lo, hi].
  function bisect(f, lo, hi) {
    var up = f(hi) > f(lo);
    for (var i = 0; i < 100; i++) { var m = (lo + hi) / 2; if ((f(m) > 0) === up) hi = m; else lo = m; }
    return (lo + hi) / 2;
  }

  var P_SIMPLE = {
    name: "Raíz simple: y″ − 3y′ + 2y = 4eˣ", tex: "y'' - 3y' + 2y = 4e^{x}", kind: 'yp', iv: 'x', dv: 'y', order: 2,
    rhs: '3dy - 2y + 4e^x', g: '4e^x', domain: [-1, 1.5], yRange: [-20, 4],
    solution: '-4x*e^x', solutionTex: 'y_p = -4x\\,e^{x}',
    hint: 'Las raíces son 1 y 2: $e^{x}$ ya está en $y_h$. Propón $Ax\\,e^{x}$.',
    wrong: [
      { src: '-4e^x', tex: '-4e^{x}', key: 'homog' },
      { src: '4x*e^x', tex: '4xe^{x}', key: 'residual' },
      { src: 'e^(2x)', tex: 'e^{2x}', key: 'homog' }
    ]
  };
  var P_DOUBLE = {
    name: "Raíz doble: y″ − 4y′ + 4y = 6e^(2x)", tex: "y'' - 4y' + 4y = 6e^{2x}", kind: 'yp', iv: 'x', dv: 'y', order: 2,
    rhs: '4dy - 4y + 6e^(2x)', g: '6e^(2x)', domain: [-1.5, 1], yRange: [-1, 25],
    solution: '3x^2*e^(2x)', solutionTex: 'y_p = 3x^2e^{2x}',
    hint: '$r = 2$ es raíz doble: $e^{2x}$ y $xe^{2x}$ están en $y_h$. Multiplica por $x^2$.',
    wrong: [
      { src: '3x*e^(2x)', tex: '3xe^{2x}', key: 'homog' },
      { src: '6e^(2x)', tex: '6e^{2x}', key: 'homog' },
      { src: '3x^2*e^(-2x)', tex: '3x^2e^{-2x}', key: 'residual' }
    ]
  };
  var P_RESON = {
    name: "Resonancia: y″ + 4y = 4 cos 2x", tex: "y'' + 4y = 4\\cos 2x", kind: 'yp', iv: 'x', dv: 'y', order: 2,
    rhs: '-4y + 4cos(2x)', g: '4cos(2x)', domain: [0, 12], yRange: [-13, 13],
    solution: 'x*sin(2x)', solutionTex: 'y_p = x\\sin 2x',
    hint: '$\\pm 2i$ son raíces: $\\cos 2x$ y $\\sin 2x$ están en $y_h$. Propón $x(A\\cos 2x + B\\sin 2x)$.',
    wrong: [
      { src: 'cos(2x)', tex: '\\cos\\left(2x\\right)', key: 'homog' },
      { src: 'x*cos(2x)', tex: 'x\\cos\\left(2x\\right)', key: 'residual' },
      { src: 'sin(2x)', tex: '\\sin\\left(2x\\right)', key: 'homog' }
    ]
  };
  var P_ZERO = {
    name: "Raíz cero: y″ − y′ = 3", tex: "y'' - y' = 3", kind: 'yp', iv: 'x', dv: 'y', order: 2,
    rhs: 'dy + 3', g: '3', domain: [-2, 2], yRange: [-7, 7],
    solution: '-3x', solutionTex: 'y_p = -3x',
    hint: '$r^2 - r = r(r - 1)$: $r = 0$ es raíz, así que las constantes están en $y_h$. Propón $Ax$.',
    wrong: [
      { src: '-3', tex: '-3', key: 'homog' },
      { src: '3x', tex: '3x', key: 'residual' },
      { src: 'x^2', tex: 'x^2', key: 'residual' }
    ]
  };
  var P_THIRD = {
    name: "Tercer orden: y‴ − y″ = 12x", tex: "y''' - y'' = 12x", kind: 'yp', iv: 'x', dv: 'y', order: 3,
    rhs: 'd2y + 12x', g: '12x', domain: [-2, 2], yRange: [-25, 10],
    solution: '-2x^3 - 6x^2', solutionTex: 'y_p = -2x^3 - 6x^2',
    hint: '$r^3 - r^2 = r^2(r - 1)$: $r = 0$ doble. Multiplica el polinomio $Ax + B$ por $x^2$.',
    wrong: [
      { src: '-6x^2', tex: '-6x^2', key: 'residual' },
      { src: '5x + 3', tex: '5x+3', key: 'homog' },
      { src: '-2x^3', tex: '-2x^3', key: 'residual' }
    ]
  };

  var data = window.SESSION_DATA = {
    slug: 'sesion-13', number: '13', group: 'C · No homogéneas y orden superior',
    title: 'Coeficientes indeterminados: duplicación (× xˢ) y orden superior', temario: [],
    minutes: 150,
    quote: 'Si tu propuesta ya resuelve la homogénea, al sustituirla da cero: nunca podrá dar g. Multiplica por x hasta que deje de chocar.',
    badges: [
      'Detectar cuándo un término de $y_p$ ya está en $y_h$ (duplicación).',
      'Corregir la propuesta multiplicando por $x^s$, con $s$ la multiplicidad de la raíz.',
      'Reconocer la resonancia: forzar a un sistema en su frecuencia natural.',
      'Aplicar el método en ecuaciones de orden mayor que 2.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Si algún término de la propuesta de S12 ya es solución de la homogénea, multiplica <strong>toda</strong> la propuesta por $x$ (o $x^2$, …) hasta que ningún término coincida con $y_h$.',
        recall: [
          'La <a href="../sesion-12/">tabla de formas de $y_p$</a> (S12).',
          'Raíces repetidas y la base $x^ke^{rx}$ (<a href="../sesion-11/">S11</a>).',
          'La regla del producto para derivar $x\\,e^{kx}$ y $x\\cos\\omega x$.'
        ],
        why: 'La duplicación no es un tecnicismo: es la <strong>resonancia</strong>. Un puente que oscila con el viento, una copa que se rompe con una nota o un circuito sintonizado en una estación son sistemas forzados en su propia frecuencia.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Si empujas un columpio al ritmo exacto en que oscila solo, cada empujón se suma al anterior y el columpio sube cada vez más. Si empujas a otro ritmo, a veces ayudas y a veces frenas, y no pasa de cierta altura.',
          'En la ecuación pasa lo mismo: si $g$ tiene la frecuencia natural (es solución de la homogénea), la propuesta de siempre da cero. La respuesta real crece con $x$: por eso aparece el factor $x$.'
        ]
      },
      {
        type: 'concept', heading: 'La regla de duplicación', short: 'Regla de xˢ',
        body: [
          'Si $g$ tiene la forma $P(x)e^{kx}$ (o $e^{\\alpha x}\\cos\\beta x$, $e^{\\alpha x}\\sin\\beta x$) y $k$ (o $\\alpha \\pm \\beta i$) es raíz del polinomio característico con multiplicidad $s$, la propuesta de S12 se multiplica por $x^s$: $$y_p = x^s\\,(\\text{propuesta de S12})$$',
          'Si $k$ no es raíz, $s = 0$ y no cambia nada. Si es raíz simple, $s = 1$; si es doble, $s = 2$. Una constante (o un polinomio) cuenta como $k = 0$: si $r = 0$ es raíz, también hay que multiplicar.',
          'Ojo: se multiplica <strong>toda</strong> la propuesta, no solo el término que choca. $(Ax + B)e^{x}$ con $s = 1$ se vuelve $(Ax^2 + Bx)e^{x}$.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: con duplicación', short: 'Receta',
        steps: [
          { text: 'Resuelve la homogénea y anota cada raíz con su multiplicidad.' },
          { text: 'Escribe la propuesta de S12 para $g$.' },
          { text: 'Identifica el «número» de $g$: $k$ en $e^{kx}$, $\\alpha \\pm \\beta i$ en $e^{\\alpha x}\\cos\\beta x$, $0$ en un polinomio. Si es raíz con multiplicidad $s$, multiplica toda la propuesta por $x^s$.', tip: 'Comprueba: ningún término de la nueva propuesta debe estar en $y_h$.' },
          { text: 'Sustituye, iguala coeficientes y despeja.', tip: 'Con el $x^s$, los términos que chocaban se cancelan solos al sustituir: es una buena comprobación.' },
          { text: 'Si $g$ es una suma, revisa cada parte por separado: una puede chocar y la otra no.' }
        ]
      },
      {
        type: 'example', heading: 'Raíz simple',
        problem: '<p>Encuentra $y_p$ para $y\'\' - 3y\' + 2y = 4e^{x}$.</p>',
        steps: [
          { text: 'Característico $(r - 1)(r - 2)$: $y_h = c_1e^x + c_2e^{2x}$. La propuesta $Ae^x$ choca ($k = 1$ es raíz simple).', math: "y_p = Ax\\,e^{x},\\quad y_p' = A(1 + x)e^{x},\\quad y_p'' = A(2 + x)e^{x}" },
          { text: 'Sustituye: los términos con $x$ se cancelan.', math: 'A\\left[(2 + x) - 3(1 + x) + 2x\\right]e^{x} = -A\\,e^{x} = 4e^{x}' }
        ],
        answer: '$A = -4$, así que $y_p = -4x\\,e^{x}$. Si pruebas $Ae^{x}$, te queda $0 = 4e^{x}$: imposible.',
        verify: { lab: 'call', mod: 'ode', fn: 'isParticular', math: true, args: [P_SIMPLE, '-4x*e^x'], value: 1 }
      },
      {
        type: 'example', heading: 'Raíz doble',
        problem: '<p>Encuentra $y_p$ para $y\'\' - 4y\' + 4y = 6e^{2x}$.</p>',
        steps: [
          { text: '$(r - 2)^2$: $y_h = (c_1 + c_2x)e^{2x}$. Tanto $e^{2x}$ como $xe^{2x}$ chocan: $s = 2$.', math: 'y_p = Ax^2e^{2x}' },
          { text: 'Sustituyendo (con $u = Ax^2$, $L(ue^{2x}) = u\'\'e^{2x}$ porque $r = 2$ es doble):', math: '2A\\,e^{2x} = 6e^{2x} \\;\\Rightarrow\\; A = 3' }
        ],
        answer: '$y_p = 3x^2e^{2x}$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isParticular', math: true, args: [P_DOUBLE, '3x^2*e^(2x)'], value: 1 }
      },
      {
        type: 'explainer', heading: 'Resonancia', short: 'Resonancia',
        title: '$y\'\' + 4y = 4\\cos\\omega x$, con $y(0) = y\'(0) = 0$',
        intro: 'La frecuencia natural del sistema es 2.',
        diagram: 'c3s13-resonance',
        steps: [
          { text: 'Con $\\omega = 1.7$ (cerca de 2, pero no igual), la solución sube y baja: «pulsaciones». La amplitud está acotada.', state: { res: 0 } },
          { text: 'Con $\\omega = 2$ exacto, $\\cos 2x$ está en $y_h$: la propuesta es $x(A\\cos 2x + B\\sin 2x)$ y sale $y_p = x\\sin 2x$. La amplitud crece como $x$, sin límite: <strong>resonancia</strong>.', state: { res: 1 } }
        ]
      },
      {
        type: 'example', heading: 'La resonancia, en cuentas',
        problem: '<p>Encuentra $y_p$ para $y\'\' + 4y = 4\\cos 2x$.</p>',
        steps: [
          { text: '$\\pm 2i$ son raíces simples: $s = 1$. Con $u = A\\cos 2x + B\\sin 2x$ (que cumple $u\'\' = -4u$):', math: "y_p = x\\,u \\;\\Rightarrow\\; y_p'' + 4y_p = 2u' = -4A\\sin 2x + 4B\\cos 2x" },
          { text: 'Iguala con $4\\cos 2x$.', math: 'A = 0,\\quad B = 1' }
        ],
        answer: '$y_p = x\\sin 2x$: crece sin parar. En un sistema real siempre hay algo de fricción que lo detiene (S15).',
        verify: { lab: 'call', mod: 'ode', fn: 'isParticular', math: true, args: [P_RESON, 'x*sin(2x)'], value: 1 }
      },
      {
        type: 'example', heading: 'Orden 3 con la raíz cero',
        problem: '<p>Encuentra $y_p$ para $y\'\'\' - y\'\' = 12x$.</p>',
        steps: [
          { text: '$r^3 - r^2 = r^2(r - 1)$: $r = 0$ doble, así que $1$ y $x$ están en $y_h$. La propuesta para $12x$ era $Ax + B$; multiplícala por $x^2$.', math: "y_p = Ax^3 + Bx^2,\\quad y_p'' = 6Ax + 2B,\\quad y_p''' = 6A" },
          { text: 'Sustituye e iguala.', math: '6A - 6Ax - 2B = 12x \\;\\Rightarrow\\; A = -2,\\ B = -6' }
        ],
        answer: '$y_p = -2x^3 - 6x^2$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isParticular', math: true, args: [P_THIRD, '-2x^3 - 6x^2'], value: 1 }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Multiplico por $x$ solo el término que choca?', a: 'No, toda la propuesta. Si $g = xe^{x}$ y $e^{x}$ está en $y_h$, la propuesta $(Ax + B)e^{x}$ completa se vuelve $(Ax^2 + Bx)e^{x}$.' },
          { q: '¿Cómo sé si es $x$ o $x^2$?', a: 'Por la multiplicidad de la raíz: simple → $x$, doble → $x^2$. O, más práctico, multiplica por $x$ y revisa: si todavía choca, otra vez.' },
          { q: '¿Y si $g$ tiene dos partes?', a: 'Revisa cada una por separado. En $y\'\' - y = e^{x} + e^{2x}$, la parte $e^{x}$ choca ($Axe^{x}$) y la parte $e^{2x}$ no ($Be^{2x}$).' },
          { q: '¿La resonancia siempre crece sin límite?', a: 'Solo si no hay fricción. Con amortiguamiento ($y\'$ en la ecuación), $\\pm\\beta i$ ya no son raíces y la respuesta queda acotada, aunque puede ser enorme cerca de la frecuencia natural.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Si un término de la propuesta está en $y_h$, al sustituirlo da cero: hay que corregir.',
          'Multiplica toda la propuesta por $x^s$, con $s$ la multiplicidad de la raíz que choca.',
          'Las constantes y polinomios chocan cuando $r = 0$ es raíz.',
          'Forzar en la frecuencia natural (sin fricción) da resonancia: $y_p \\sim x\\sin\\omega x$.'
        ]
      }
    ],

    lab: {
      type: 'ode-compare', title: 'Cuándo y_p choca con y_h',
      intro: 'Escribe tu $y_p$. Si propones algo que ya está en $y_h$, el lab te avisa que choca: al sustituirlo da cero y no puede igualar a $g$. Corrige multiplicando por $x$ (o $x^2$) y vuelve a calcular los coeficientes.',
      cfg: { start: 0, problems: [P_SIMPLE, P_DOUBLE, P_RESON, P_ZERO, P_THIRD] }
    },

    formulas: [
      { label: 'Duplicación', tex: 'y_p = x^s\\,(\\text{propuesta de S12}),\\ s = \\text{multiplicidad}' },
      { label: 'Resonancia', tex: "y'' + \\omega^2y = C\\cos\\omega x \\Rightarrow y_p = \\tfrac{C}{2\\omega}\\,x\\sin\\omega x" }
    ],

    exercises: [
      {
        id: 'c3-s13-s', title: '¿Por cuánto multiplicas?',
        vars: { k: [0, 4, 1] },
        prompt: function (v) {
          var eq = ["y'' - 5y' + 6y = e^{2x}", "y'' - 6y' + 9y = e^{3x}", "y'' + 9y = \\sin 3x", "y'' + y' = 5", "y'' - y = e^{2x}"][v.k];
          return '<p>Para $' + eq + '$, la propuesta de S12 hay que multiplicarla por $x^s$. ¿Cuánto vale $s$?</p>';
        },
        check: 'numeric',
        answer: function (v) { return [1, 2, 1, 1, 0][v.k]; },
        mistakes: { none: function (v) { return [0, 0, 0, 0, 1][v.k]; } },
        feedback: [
          { when: 'none', say: 'Revisa si el «número» de $g$ es raíz del característico, y con qué multiplicidad.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          // Multiplicidad contada con las raíces numéricas del característico.
          var poly = [[1, -5, 6], [1, -6, 9], [1, 0, 9], [1, 1, 0], [1, 0, -1]][v.k], key = [[2, 0], [3, 0], [0, 3], [0, 0], [2, 0]][v.k];
          return window.LabMath.ode.polyRoots(poly).filter(function (q) { return Math.hypot(q[0] - key[0], q[1] - key[1]) < 1e-4; }).length;
        } },
        hint: 'Factoriza el característico y busca el número de $g$ entre sus raíces.',
        solution: function (v) { return ['$(r - 2)(r - 3)$: $2$ es raíz simple, $s = 1$.', '$(r - 3)^2$: $3$ es raíz doble, $s = 2$.', '$r^2 + 9$: $\\pm 3i$ son raíces simples, $s = 1$.', '$r(r + 1)$: $0$ es raíz simple, $s = 1$.', '$(r - 1)(r + 1)$: $2$ no es raíz, $s = 0$.'][v.k]; }
      },
      {
        id: 'c3-s13-forma', title: 'La forma corregida',
        vars: { k: [0, 2, 1] },
        prompt: function (v) {
          var eq = ["y'' - y = x\\,e^{x}", "y'' + 4y = 3\\cos 2x", "y''' - y' = 2x"][v.k];
          return '<p>¿Qué forma propones para $y_p$ en $' + eq + '$?</p>';
        },
        check: 'choice',
        options: function (v) {
          var ok = ['$(Ax^2 + Bx)e^{x}$', '$x(A\\cos 2x + B\\sin 2x)$', '$Ax^2 + Bx$'][v.k];
          var bad = [
            [['$(Ax + B)e^{x}$', 'El término $Be^{x}$ está en $y_h$: multiplica toda la propuesta por $x$.'], ['$Ax^2e^{x}$', 'Al multiplicar por $x$ se conserva el polinomio completo: $(Ax^2 + Bx)e^{x}$.']],
            [['$A\\cos 2x + B\\sin 2x$', 'Los dos están en $y_h$ ($\\pm 2i$ son raíces): multiplica por $x$.'], ['$Ax\\cos 2x$', 'Hacen falta los dos, coseno y seno, multiplicados por $x$.']],
            [['$Ax + B$', '$r = 0$ es raíz de $r^3 - r$: las constantes están en $y_h$.'], ['$Ax^3 + Bx^2$', '$r = 0$ es raíz simple: basta multiplicar por $x$, no por $x^2$.']]
          ][v.k];
          return [{ text: ok, correct: true }].concat(bad.map(function (b) { return { text: b[0], say: b[1] }; }));
        },
        answer: function (v) { return ['$(Ax^2 + Bx)e^{x}$', '$x(A\\cos 2x + B\\sin 2x)$', '$Ax^2 + Bx$'][v.k]; },
        hint: 'Escribe la propuesta de S12 y revisa si choca con $y_h$.',
        solution: function (v) { return ['$1$ es raíz simple de $r^2 - 1$: $x(Ax + B)e^{x}$.', '$\\pm 2i$ son raíces: $x(A\\cos 2x + B\\sin 2x)$.', '$r^3 - r = r(r - 1)(r + 1)$, $0$ simple: $x(Ax + B)$.'][v.k]; }
      },
      {
        id: 'c3-s13-simple', title: 'Coeficiente con raíz simple',
        vars: { a: [1, 3, 1], b: [-3, -1, 1], c: [2, 12, 2] },
        prompt: function (v) { return '<p>Para $y\'\'' + sg(-(v.a + v.b), "y'") + sg(v.a * v.b, 'y') + ' = ' + v.c + 'e^{' + (v.a === 1 ? '' : v.a) + 'x}$, la propuesta es $y_p = Ax\\,e^{' + (v.a === 1 ? '' : v.a) + 'x}$. ¿Cuánto vale $A$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.c / (v.a - v.b); },
        mistakes: {
          noX: function (v) { return v.c / (v.a * v.a - (v.a + v.b) * v.a + v.a * v.b + 1); },
          sign: function (v) { return v.c / (v.b - v.a); }
        },
        feedback: [
          { when: 'noX', say: 'Con $Ae^{kx}$ la ecuación da $0 = ce^{kx}$: por eso va el $x$.' },
          { when: 'sign', say: 'Revisa el signo: $L(Axe^{ax}) = A(2a - (a + b))e^{ax} = A(a - b)e^{ax}$.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          // Residuo de Axe^{ax} en un punto, por diferencias exactas de sus derivadas.
          var x = 0.4, k = v.a, p = -(v.a + v.b), q = v.a * v.b;
          var L = function (A) { var e = Math.exp(k * x), y = A * x * e, y1 = A * (1 + k * x) * e, y2 = A * (2 * k + k * k * x) * e; return y2 + p * y1 + q * y - v.c * e; };
          return bisect(L, -100, 100);
        } },
        hint: '$y_p\' = A(1 + ax)e^{ax}$ y $y_p\'\' = A(2a + a^2x)e^{ax}$.',
        solution: function (v) { return '$$A(a - b) = c \\;\\Rightarrow\\; A = \\frac{' + v.c + '}{' + v.a + ' - (' + v.b + ')} = ' + fx(v.c / (v.a - v.b), 3) + '$$'; }
      },
      {
        id: 'c3-s13-resonancia', title: 'Amplitud en resonancia',
        vars: { w: [1, 5, 1], c: [2, 12, 2] },
        prompt: function (v) { return '<p>La solución particular de $y\'\' + ' + (v.w * v.w === 1 ? '' : v.w * v.w) + 'y = ' + v.c + '\\cos ' + (v.w === 1 ? '' : v.w) + 'x$ es $y_p = B\\,x\\sin ' + (v.w === 1 ? '' : v.w) + 'x$. ¿Cuánto vale $B$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.c / (2 * v.w); },
        mistakes: { noTwo: function (v) { return v.c / v.w; }, square: function (v) { return v.c / (2 * v.w * v.w); } },
        where: function (v) { return v.w !== 1; },
        feedback: [
          { when: 'noTwo', say: 'Al sustituir queda $2\\omega B\\cos\\omega x$: divide entre $2\\omega$.' },
          { when: 'square', say: 'El factor es $2\\omega$, no $2\\omega^2$: sale de derivar $x\\sin\\omega x$ dos veces.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          var x = 0.3, w = v.w;
          var L = function (B) { var y = B * x * Math.sin(w * x), y2 = B * (2 * w * Math.cos(w * x) - w * w * x * Math.sin(w * x)); return y2 + w * w * y - v.c * Math.cos(w * x); };
          return bisect(L, -100, 100);
        } },
        hint: '$(x\\sin\\omega x)\'\' = 2\\omega\\cos\\omega x - \\omega^2x\\sin\\omega x$.',
        solution: function (v) { return '$$2\\omega B = ' + v.c + ' \\;\\Rightarrow\\; B = \\frac{' + v.c + '}{2(' + v.w + ')} = ' + fx(v.c / (2 * v.w), 3) + '$$'; }
      },
      {
        id: 'c3-s13-doble', title: 'Coeficiente con raíz doble',
        vars: { r: [-3, 3, 1], c: [2, 12, 2] },
        where: function (v) { return v.r !== 0; },
        prompt: function (v) { return '<p>Para $y\'\'' + sg(-2 * v.r, "y'") + sg(v.r * v.r, 'y') + ' = ' + v.c + 'e^{' + (v.r === 1 ? '' : v.r === -1 ? '-' : v.r) + 'x}$, la propuesta es $y_p = Ax^2e^{' + (v.r === 1 ? '' : v.r === -1 ? '-' : v.r) + 'x}$. ¿Cuánto vale $A$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.c / 2; },
        mistakes: { full: function (v) { return v.c; }, quarter: function (v) { return v.c / 4; } },
        feedback: [
          { when: 'full', say: 'Al sustituir queda $2Ae^{rx}$ (la segunda derivada de $x^2$): $A = c/2$.' },
          { when: 'quarter', say: 'Revisa: con raíz doble solo sobrevive $u\'\' = 2A$.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          var x = 0.4, r = v.r;
          var L = function (A) { var e = Math.exp(r * x), y = A * x * x * e, y1 = A * (2 * x + r * x * x) * e, y2 = A * (2 + 4 * r * x + r * r * x * x) * e; return y2 - 2 * r * y1 + r * r * y - v.c * e; };
          return bisect(L, -100, 100);
        } },
        hint: 'Con raíz doble $r$, $L(u\\,e^{rx}) = u\'\'e^{rx}$.',
        solution: function (v) { return '$$2A = ' + v.c + ' \\;\\Rightarrow\\; A = ' + (v.c / 2) + '$$'; }
      }
    ],

    quiz: { tags: ['c3.S13'], count: 8 },

    errors: [
      'Proponer $Ae^{kx}$ cuando $k$ es raíz: al sustituir da $0 = g$.',
      'Multiplicar por $x$ solo el término que choca y no toda la propuesta.',
      'Multiplicar por $x$ cuando la raíz es doble (va $x^2$).',
      'Olvidar que $r = 0$ como raíz hace chocar a las constantes y los polinomios.',
      'Multiplicar por $x$ «por si acaso» cuando no hay choque: los coeficientes no salen.',
      'Confundir la frecuencia natural $\\beta$ con $\\beta^2$ al decidir si hay resonancia.'
    ],

    teacher: {
      plan: [
        'El columpio empujado a su ritmo: la idea de resonancia.',
        'Mostrar en el pizarrón que $Ae^{x}$ da $0 = 4e^{x}$ y que $Axe^{x}$ sí funciona.',
        'Regla de $x^s$ con la multiplicidad; ejemplos de raíz simple, doble y cero.',
        'Explainer de resonancia y lab: probar la propuesta sin $x$ para ver el aviso.'
      ],
      check: [
        'Que comparen cada término de la propuesta con $y_h$ antes de derivar.',
        'Que expliquen físicamente por qué crece la respuesta en resonancia.'
      ],
      note: 'La resonancia con amortiguamiento y el RLC se retoman en S15.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §7.2 “Nonhomogeneous Linear Equations”. <a href="https://openstax.org/books/calculus-volume-3/pages/7-2-nonhomogeneous-linear-equations">openstax.org</a> (CC BY-NC-SA 4.0).',
      'MIT OpenCourseWare. <em>18.03SC Differential Equations</em> (Fall 2011), Unit II, “Exponential Response and Resonance”. <a href="https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/">ocw.mit.edu</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-12',
    next: 'sesion-14'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
