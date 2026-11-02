/* =====================================================================
   Cálculo 3 · S12 · Coeficientes indeterminados: la forma de y_p según g(x)
   (bloque C · No homogéneas y orden superior).
   Fuente: OpenStax, Calculus Volume 3, §7.2 “Nonhomogeneous Linear Equations”,
   CC BY-NC-SA 4.0. Ejemplos y ejercicios propios. Se comprueban con LabMath.ode
   (lab ode-compare, modo de solución particular): la y_p se sustituye en la
   ecuación; los numéricos usan RK4 como oráculo.
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
  function rk(P, x) { return window.LabMath.ode.solveAt(window.math, P, x); }

  var P_POLY = {
    name: "Polinomio: y″ + y′ − 2y = 4x²", tex: "y'' + y' - 2y = 4x^2", kind: 'yp', iv: 'x', dv: 'y', order: 2,
    rhs: '-dy + 2y + 4x^2', g: '4x^2', domain: [-2, 2], yRange: [-14, 2],
    solution: '-2x^2 - 2x - 3', solutionTex: 'y_p = -2x^2 - 2x - 3',
    hint: 'Propón $y_p = Ax^2 + Bx + C$ (el polinomio completo, aunque $g$ solo tenga $x^2$) e iguala coeficientes.',
    wrong: [
      { src: '-2x^2', tex: '-2x^2', key: 'residual' },
      { src: 'e^x', tex: 'e^{x}', key: 'homog' },
      { src: '2x^2 + 2x + 3', tex: '2x^2+2x+3', key: 'residual' }
    ]
  };
  var P_EXP = {
    name: "Exponencial: y″ − 3y′ + 2y = 6e^(3x)", tex: "y'' - 3y' + 2y = 6e^{3x}", kind: 'yp', iv: 'x', dv: 'y', order: 2,
    rhs: '3dy - 2y + 6e^(3x)', g: '6e^(3x)', domain: [-1, 1], yRange: [-2, 65],
    solution: '3e^(3x)', solutionTex: 'y_p = 3e^{3x}',
    hint: 'Propón $y_p = Ae^{3x}$: al sustituir, todo queda multiplicado por $e^{3x}$.',
    wrong: [
      { src: '6e^(3x)', tex: '6e^{3x}', key: 'residual' },
      { src: 'e^x', tex: 'e^{x}', key: 'homog' },
      { src: '2e^(3x)', tex: '2e^{3x}', key: 'residual' }
    ]
  };
  var P_SIN = {
    name: "Seno: y″ + 4y = 8 sin x", tex: "y'' + 4y = 8\\sin x", kind: 'yp', iv: 'x', dv: 'y', order: 2,
    rhs: '-4y + 8sin(x)', g: '8sin(x)', domain: [0, 7], yRange: [-3.5, 3.5],
    solution: '(8/3)*sin(x)', solutionTex: 'y_p = \\tfrac{8}{3}\\sin x',
    hint: 'Propón $y_p = A\\sin x + B\\cos x$. Aquí $B$ sale cero porque no hay $y\'$.',
    wrong: [
      { src: '8sin(x)', tex: '8\\sin\\left(x\\right)', key: 'residual' },
      { src: 'sin(2x)', tex: '\\sin\\left(2x\\right)', key: 'homog' },
      { src: '(8/3)*cos(x)', tex: '\\frac{8}{3}\\cos\\left(x\\right)', key: 'residual' }
    ]
  };
  var P_COS = {
    name: "Coseno con amortiguamiento: y″ + 2y′ + y = 25 cos 2x", tex: "y'' + 2y' + y = 25\\cos 2x", kind: 'yp', iv: 'x', dv: 'y', order: 2,
    rhs: '-2dy - y + 25cos(2x)', g: '25cos(2x)', domain: [0, 7], yRange: [-6, 6],
    solution: '-3cos(2x) + 4sin(2x)', solutionTex: 'y_p = -3\\cos 2x + 4\\sin 2x',
    hint: 'Con $y\'$ en la ecuación, el seno y el coseno se mezclan: propón los dos y resuelve un sistema de $2\\times 2$.',
    wrong: [
      { src: '-3cos(2x)', tex: '-3\\cos\\left(2x\\right)', key: 'residual' },
      { src: '3cos(2x) - 4sin(2x)', tex: '3\\cos\\left(2x\\right)-4\\sin\\left(2x\\right)', key: 'residual' },
      { src: 'x*e^(-x)', tex: 'xe^{-x}', key: 'homog' }
    ]
  };
  var P_PRODUCT = {
    name: "Producto: y″ − y = x e^(2x)", tex: "y'' - y = x\\,e^{2x}", kind: 'yp', iv: 'x', dv: 'y', order: 2,
    rhs: 'y + x*e^(2x)', g: 'x*e^(2x)', domain: [-1, 1], yRange: [-2, 4],
    solution: '(x/3 - 4/9)e^(2x)', solutionTex: 'y_p = \\left(\\tfrac{x}{3} - \\tfrac{4}{9}\\right)e^{2x}',
    hint: 'Propón $y_p = (Ax + B)e^{2x}$: el polinomio completo por la exponencial.',
    wrong: [
      { src: 'x/3*e^(2x)', tex: '\\frac{x}{3}e^{2x}', key: 'residual' },
      { src: 'e^x', tex: 'e^{x}', key: 'homog' },
      { src: '(x/3 + 4/9)e^(2x)', tex: '\\left(\\frac{x}{3}+\\frac{4}{9}\\right)e^{2x}', key: 'residual' }
    ]
  };
  // Ejemplo con PVI completo: y″ − y = 2, y(0) = 0, y′(0) = 0 → y = 2cosh x − 2.
  var P_FULL = { order: 2, rhs: 'y + 2', x0: 0, ics: [0, 0], domain: [0, 1] };

  var data = window.SESSION_DATA = {
    slug: 'sesion-12', number: '12', group: 'C · No homogéneas y orden superior',
    title: 'Coeficientes indeterminados: la forma de y_p según g(x)', temario: [],
    minutes: 150,
    quote: 'Si el lado derecho es un polinomio, una exponencial o un seno, adivina que la respuesta se le parece; las derivadas de esas funciones no salen de la familia.',
    badges: [
      'Escribir la solución general de una no homogénea como $y = y_h + y_p$.',
      'Proponer la forma de $y_p$ según $g(x)$: polinomio, exponencial, seno y coseno, y sus productos.',
      'Sustituir e igualar coeficientes para encontrar las constantes.',
      'Usar superposición cuando $g$ es una suma, y resolver el PVI completo.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Para $ay\'\' + by\' + cy = g(x)$ la solución es $y = y_h + y_p$. La $y_h$ ya la sabes (S10). Para $y_p$, propón una función «parecida» a $g$ con coeficientes desconocidos y encuéntralos sustituyendo.',
        recall: [
          'Homogéneas con <a href="../sesion-10/">coeficientes constantes</a> (S10) y <a href="../sesion-11/">de orden n</a> (S11).',
          'Por qué $y = y_h + y_p$ (<a href="../sesion-09/">S09</a>): la diferencia de dos soluciones de la no homogénea resuelve la homogénea.',
          'Derivadas de polinomios, $e^{kx}$, $\\sin\\omega x$ y $\\cos\\omega x$; sistemas de ecuaciones lineales.'
        ],
        why: 'Una fuerza externa sobre un resorte, una fuente de voltaje en un circuito o una entrada en un sistema de control son el $g(x)$. La $y_p$ es la respuesta que el sistema mantiene por culpa de esa entrada.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Si empujas un columpio cada 3 segundos, al final se mueve al ritmo de tus empujones, no al suyo. La respuesta «copia» la forma de la fuerza: empujas con un seno, responde con un seno de la misma frecuencia (con otra amplitud y otro desfase).',
          'Eso es lo que usa este método: si $g$ es un seno, $y_p$ es un seno y un coseno de la misma frecuencia; si $g$ es una exponencial, $y_p$ es la misma exponencial; si $g$ es un polinomio, $y_p$ es un polinomio del mismo grado. Solo faltan los números.'
        ]
      },
      {
        type: 'concept', heading: 'La forma de y_p', short: 'Tabla de formas',
        body: [
          'El método sirve cuando $g(x)$ es un polinomio, una exponencial $e^{kx}$, un $\\sin\\omega x$ o $\\cos\\omega x$, o productos y sumas de ellos. La propuesta lleva <strong>todos</strong> los términos que pueden aparecer al derivar:'
        ],
        list: [
          '$g = $ polinomio de grado $n$ → $y_p = A_nx^n + \\dots + A_1x + A_0$ (completo).',
          '$g = Ce^{kx}$ → $y_p = Ae^{kx}$.',
          '$g = C\\cos\\omega x$ o $C\\sin\\omega x$ → $y_p = A\\cos\\omega x + B\\sin\\omega x$ (los dos, siempre).',
          '$g = $ polinomio $\\times\\, e^{kx}$ → (polinomio completo) $\\times\\, e^{kx}$.',
          '$g = e^{kx}\\cos\\omega x$ → $e^{kx}(A\\cos\\omega x + B\\sin\\omega x)$.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: coeficientes indeterminados', short: 'Receta',
        steps: [
          { text: 'Resuelve primero la homogénea: $y_h$ y las raíces del característico.' },
          { text: 'Propón $y_p$ según la tabla, con coeficientes $A, B, C, \\dots$', tip: 'Si algún término de tu propuesta ya está en $y_h$, choca: lo arreglas en la sesión 13 (multiplicando por $x$).' },
          { text: 'Deriva $y_p$ las veces necesarias y sustituye en la ecuación.' },
          { text: 'Iguala los coeficientes de cada tipo de término ($x^2$, $x$, constante, $\\cos$, $\\sin$…) y resuelve el sistema.', tip: 'Si te queda una ecuación como $0 = 5$, la propuesta estaba incompleta.' },
          { text: 'Escribe $y = y_h + y_p$ y solo entonces aplica las condiciones iniciales.', tip: 'Las condiciones se aplican a la solución completa, no a $y_h$ sola.' }
        ]
      },
      {
        type: 'example', heading: 'Lado derecho polinomial',
        problem: '<p>Encuentra una solución particular de $y\'\' + y\' - 2y = 4x^2$.</p>',
        steps: [
          { text: 'Propón el polinomio completo de grado 2.', math: "y_p = Ax^2 + Bx + C,\\quad y_p' = 2Ax + B,\\quad y_p'' = 2A" },
          { text: 'Sustituye y agrupa por potencias.', math: '2A + (2Ax + B) - 2(Ax^2 + Bx + C) = -2Ax^2 + (2A - 2B)x + (2A + B - 2C)' },
          { text: 'Iguala con $4x^2 + 0x + 0$.', math: '-2A = 4,\\quad 2A - 2B = 0,\\quad 2A + B - 2C = 0 \\;\\Rightarrow\\; A = -2,\\ B = -2,\\ C = -3' }
        ],
        answer: '$y_p = -2x^2 - 2x - 3$. Si propones solo $Ax^2$, te queda un sistema sin solución: por eso va el polinomio completo.',
        verify: { lab: 'call', mod: 'ode', fn: 'isParticular', math: true, args: [P_POLY, '-2x^2 - 2x - 3'], value: 1 }
      },
      {
        type: 'example', heading: 'Lado derecho trigonométrico',
        problem: '<p>Encuentra una solución particular de $y\'\' + 2y\' + y = 25\\cos 2x$.</p>',
        steps: [
          { text: 'Propón seno y coseno.', math: "y_p = A\\cos 2x + B\\sin 2x,\\quad y_p'' = -4A\\cos 2x - 4B\\sin 2x" },
          { text: 'Sustituye y agrupa: el $y\'$ mezcla senos con cosenos.', math: '(-3A + 4B)\\cos 2x + (-4A - 3B)\\sin 2x = 25\\cos 2x' },
          { text: 'Resuelve el sistema.', math: '-3A + 4B = 25,\\quad -4A - 3B = 0 \\;\\Rightarrow\\; A = -3,\\ B = 4' }
        ],
        answer: '$y_p = -3\\cos 2x + 4\\sin 2x$. Aunque $g$ solo tenga coseno, la respuesta lleva seno: es el desfase.',
        verify: { lab: 'call', mod: 'ode', fn: 'isParticular', math: true, args: [P_COS, '-3cos(2x) + 4sin(2x)'], value: 1 }
      },
      {
        type: 'explainer', heading: 'La respuesta copia a la fuerza', short: 'Transitorio y estacionario',
        title: 'y″ + 2y′ + y = 25 cos 2x, desde el reposo',
        intro: 'La misma ecuación del ejemplo, ahora con $y(0) = 0$, $y\'(0) = 0$.',
        diagram: 'c3s12-response',
        steps: [
          { text: 'La fuerza $g = 25\\cos 2x$ (dibujada a escala 1/5) empuja con frecuencia 2.', state: { k: 0 } },
          { text: 'La particular $y_p = -3\\cos 2x + 4\\sin 2x$ tiene la <strong>misma frecuencia</strong>, con otra amplitud ($5$) y desfasada.', state: { k: 1 } },
          { text: 'La solución completa es $y = (3 - 5x)e^{-x} + y_p$. La parte $y_h$ se apaga (es el <strong>transitorio</strong>) y lo que queda es $y_p$: el <strong>estado estacionario</strong>.', state: { k: 2 } }
        ]
      },
      {
        type: 'concept', heading: 'Superposición del lado derecho', short: 'Sumas en g',
        body: [
          'Si $g = g_1 + g_2$, encuentra $y_{p1}$ para $g_1$ y $y_{p2}$ para $g_2$ por separado y súmalas: $y_p = y_{p1} + y_{p2}$. Funciona porque la ecuación es lineal.',
          'Por ejemplo, para $y\'\' - y = 3 + e^{2x}$: con $g_1 = 3$ sale $y_{p1} = -3$; con $g_2 = e^{2x}$ sale $y_{p2} = \\tfrac{1}{3}e^{2x}$. Entonces $y_p = -3 + \\tfrac{1}{3}e^{2x}$.'
        ]
      },
      {
        type: 'example', heading: 'El PVI completo',
        diagram: 'c3s12-pvi',
        problem: '<p>Resuelve $y\'\' - y = 2$ con $y(0) = 0$, $y\'(0) = 0$, y calcula $y(1)$.</p>',
        steps: [
          { text: 'Homogénea: $r^2 - 1 = 0$, $y_h = c_1e^x + c_2e^{-x}$. Particular: $y_p = A$ da $-A = 2$.', math: 'y = c_1e^{x} + c_2e^{-x} - 2' },
          { text: 'Condiciones sobre la solución completa.', math: 'c_1 + c_2 - 2 = 0,\\quad c_1 - c_2 = 0 \\;\\Rightarrow\\; c_1 = c_2 = 1' },
          { text: 'Así $y = e^x + e^{-x} - 2 = 2\\cosh x - 2$.', math: 'y(1) = e + e^{-1} - 2 \\approx ' + fx(Math.E + 1 / Math.E - 2, 3) }
        ],
        answer: '$y(1) \\approx ' + fx(Math.E + 1 / Math.E - 2, 3) + '$. Si aplicas las condiciones a $y_h$ antes de sumar $y_p$, te sale $y = 0$, que no resuelve la ecuación.',
        verify: { lab: 'call', mod: 'ode', fn: 'solveAt', math: true, args: [P_FULL, 1], value: Math.E + 1 / Math.E - 2 }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué hay que poner seno y coseno si $g$ solo tiene uno?', a: 'Porque al derivar uno aparece el otro. Si solo pones coseno y la ecuación tiene $y\'$, aparece un seno que no tienes cómo cancelar.' },
          { q: '¿Cuándo no funciona el método?', a: 'Cuando $g$ no es de la tabla: $\\tan x$, $\\ln x$, $1/x$, $\\sec x$… Ahí se usa variación de parámetros (S14). También cuando los coeficientes de la ecuación no son constantes.' },
          { q: '¿Qué hago si un término de $y_p$ está en $y_h$?', a: 'Tu propuesta da cero al sustituirla: no puede igualar a $g$. Multiplica por $x$ (o $x^2$). Es el tema de S13; en el lab, ese caso sale como «choca con $y_h$».' },
          { q: '¿La $y_p$ es única?', a: 'No: si le sumas cualquier $y_h$ sigue siendo particular. El método da la más sencilla (sin términos de $y_h$).' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          '$y = y_h + y_p$; las condiciones iniciales se aplican a la suma.',
          'La forma de $y_p$ copia la de $g$: polinomio completo, $Ae^{kx}$, $A\\cos + B\\sin$, y productos.',
          'Sustituye, agrupa e iguala coeficientes.',
          'Si $g$ es suma, resuelve por partes y suma las $y_p$.'
        ]
      }
    ],

    lab: {
      type: 'ode-compare', title: 'Propón y_p y valídala',
      intro: 'Escribe tu solución particular $y_p$ con los coeficientes ya calculados. El lab la sustituye en la ecuación y grafica el residuo $r(x) = L(y_p) - g(x)$: si es cero, es una solución particular. Si tu $y_p$ resuelve la homogénea (da cero en lugar de $g$), te avisa que choca con $y_h$.',
      cfg: { start: 0, problems: [P_POLY, P_EXP, P_SIN, P_COS, P_PRODUCT] }
    },

    formulas: [
      { label: 'Solución general', tex: 'y = y_h + y_p' },
      { label: 'g polinomio', tex: 'y_p = A_nx^n + \\dots + A_0' },
      { label: 'g exponencial', tex: 'g = Ce^{kx} \\Rightarrow y_p = Ae^{kx}' },
      { label: 'g seno o coseno', tex: 'y_p = A\\cos\\omega x + B\\sin\\omega x' },
      { label: 'Producto', tex: 'g = P(x)e^{kx} \\Rightarrow y_p = Q(x)e^{kx}' }
    ],

    exercises: [
      {
        id: 'c3-s12-forma', title: '¿Qué forma propones?',
        vars: { k: [0, 3, 1] },
        prompt: function (v) {
          var g = ['3x^2 - 1', '5e^{-2x}', '4\\sin 3x', 'x\\,e^{x}'][v.k];
          return '<p>Para $y\'\' + 4y\' + 5y = ' + g + '$ (cuya $y_h$ es $e^{-2x}(c_1\\cos x + c_2\\sin x)$), ¿qué forma propones para $y_p$?</p>';
        },
        check: 'choice',
        options: function (v) {
          var ok = ['$Ax^2 + Bx + C$', '$Ae^{-2x}$', '$A\\cos 3x + B\\sin 3x$', '$(Ax + B)e^{x}$'][v.k];
          var bad = [
            [['$Ax^2$', 'Va el polinomio completo: al derivar aparecen términos en $x$ y constantes.'], ['$Ax^2 + C$', 'Falta el término en $x$: aparece al derivar con $y\'$.']],
            [['$Axe^{-2x}$', 'No hace falta multiplicar por $x$: $e^{-2x}$ sola no está en $y_h$ (ahí va con seno y coseno).'], ['$A\\cos x + B\\sin x$', 'Eso es parte de $y_h$; para $g = e^{-2x}$ propón una exponencial.']],
            [['$A\\sin 3x$', 'Hace falta también el coseno: con $y\'$ en la ecuación se mezclan.'], ['$A\\cos x + B\\sin x$', 'La frecuencia debe ser la de $g$: $3$.']],
            [['$Axe^{x}$', 'Falta la constante del polinomio: va $(Ax + B)e^{x}$.'], ['$Ax + Be^{x}$', 'Es un producto: el polinomio completo multiplicado por $e^{x}$.']]
          ][v.k];
          return [{ text: ok, correct: true }].concat(bad.map(function (b) { return { text: b[0], say: b[1] }; }));
        },
        answer: function (v) { return ['$Ax^2 + Bx + C$', '$Ae^{-2x}$', '$A\\cos 3x + B\\sin 3x$', '$(Ax + B)e^{x}$'][v.k]; },
        hint: 'Copia la forma de $g$ con todos los términos que salen al derivar.',
        solution: function (v) { return ['Polinomio de grado 2 completo.', 'La misma exponencial.', 'Seno y coseno de la misma frecuencia.', 'Polinomio de grado 1 completo por $e^{x}$.'][v.k]; }
      },
      {
        id: 'c3-s12-exp', title: 'Coeficiente de una exponencial',
        vars: { a: [-3, 3, 1], b: [-4, 4, 1], c: [2, 12, 2], k: [1, 3, 1] },
        where: function (v) { var d = v.k * v.k + v.a * v.k + v.b; return d !== 0 && Math.abs(d) !== 1; },
        prompt: function (v) { return '<p>Para $y\'\'' + sg(v.a, "y'") + sg(v.b, 'y') + ' = ' + v.c + 'e^{' + (v.k === 1 ? '' : v.k) + 'x}$, propón $y_p = Ae^{' + (v.k === 1 ? '' : v.k) + 'x}$. ¿Cuánto vale $A$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.c / (v.k * v.k + v.a * v.k + v.b); },
        mistakes: {
          noSquare: function (v) { return v.c / (v.k + v.a * v.k + v.b); },
          raw: function (v) { return v.c; }
        },
        feedback: [
          { when: 'noSquare', say: 'La segunda derivada de $e^{kx}$ es $k^2e^{kx}$.' },
          { when: 'raw', say: 'Sustituye: $A(k^2 + ak + b)e^{kx} = ce^{kx}$, así que $A = c/(k^2 + ak + b)$.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          // y_p evaluada como límite: la solución del PVI con y(0) = A₀ … mejor: el residuo de Ae^{kx} debe ser 0 → bisección en A.
          var f = function (A) { return A * (v.k * v.k + v.a * v.k + v.b) - v.c; }, d = v.k * v.k + v.a * v.k + v.b, lo = -100, hi = 100;
          for (var i = 0; i < 90; i++) { var m = (lo + hi) / 2; if ((f(m) > 0) === (d > 0)) hi = m; else lo = m; }
          return (lo + hi) / 2;
        } },
        hint: 'Sustituye $Ae^{kx}$, $kAe^{kx}$ y $k^2Ae^{kx}$.',
        solution: function (v) { var d = v.k * v.k + v.a * v.k + v.b; return '$$A(' + (v.k * v.k) + sg(v.a * v.k) + sg(v.b) + ') = ' + v.c + ' \\;\\Rightarrow\\; A = \\frac{' + v.c + '}{' + d + '} \\approx ' + fx(v.c / d, 3) + '$$'; }
      },
      {
        id: 'c3-s12-lineal', title: 'y_p polinomial',
        vars: { p: [1, 4, 1], q: [1, 4, 1], c: [2, 8, 1], d: [-5, 5, 1] },
        prompt: function (v) { return '<p>Encuentra una solución particular de $y\'\' + ' + (v.p === 1 ? '' : v.p) + "y' + " + (v.q === 1 ? '' : v.q) + 'y = ' + v.c + 'x' + sg(v.d) + '$.</p>'; },
        check: 'expr', domain: [-2, 2],
        answer: function (v) { var A = v.c / v.q, B = (v.d - v.p * A) / v.q; return A + '*x + ' + B; },
        mistakes: {
          noB: function (v) { return (v.c / v.q) + '*x'; },
          noP: function (v) { var A = v.c / v.q; return A + '*x + ' + (v.d / v.q); }
        },
        where: function (v) { var A = v.c / v.q; return v.d !== 0 && v.d - v.p * A !== 0; },
        feedback: [
          { when: 'noB', say: 'Falta la constante: propón $Ax + B$ completo.' },
          { when: 'noP', say: 'Olvidaste el término $p\\,y_p\' = pA$ al igualar las constantes.' }
        ],
        hint: 'Con $y_p = Ax + B$: $y_p\' = A$ y $y_p\'\' = 0$.',
        solution: function (v) { var A = v.c / v.q, B = (v.d - v.p * A) / v.q; return '$$' + v.q + 'A = ' + v.c + ',\\quad ' + v.p + 'A + ' + v.q + 'B = ' + v.d + ' \\;\\Rightarrow\\; A = ' + fx(A, 3) + ',\\ B = ' + fx(B, 3) + '$$'; }
      },
      {
        id: 'c3-s12-trig', title: 'Amplitud con un coseno',
        vars: { b: [2, 9, 1], w: [1, 4, 1], c: [3, 12, 3] },
        where: function (v) { return v.w * v.w !== v.b; },
        prompt: function (v) { return '<p>Para $y\'\' + ' + v.b + 'y = ' + v.c + '\\cos ' + (v.w === 1 ? '' : v.w) + 'x$, propón $y_p = A\\cos ' + (v.w === 1 ? '' : v.w) + 'x + B\\sin ' + (v.w === 1 ? '' : v.w) + 'x$. ¿Cuánto vale $A$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.c / (v.b - v.w * v.w); },
        mistakes: {
          plus: function (v) { return v.c / (v.b + v.w * v.w); },
          noW: function (v) { return v.c / (v.b - v.w); }
        },
        feedback: [
          { when: 'plus', say: 'La segunda derivada de $\\cos\\omega x$ es $-\\omega^2\\cos\\omega x$: el signo es negativo.' },
          { when: 'noW', say: 'Al derivar dos veces sale $\\omega^2$, no $\\omega$.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          // Bisección en A sobre el residuo de A·cos ωx en un punto (sin despejar la fórmula).
          var x0 = 0.3, r = function (A) { return -v.w * v.w * A * Math.cos(v.w * x0) + v.b * A * Math.cos(v.w * x0) - v.c * Math.cos(v.w * x0); };
          var lo = -100, hi = 100, up = r(hi) > r(lo);
          for (var i = 0; i < 90; i++) { var m = (lo + hi) / 2; if ((r(m) > 0) === up) hi = m; else lo = m; }
          return (lo + hi) / 2;
        } },
        hint: 'Sustituye: $(-\\omega^2 + b)A\\cos\\omega x + (-\\omega^2 + b)B\\sin\\omega x = c\\cos\\omega x$.',
        solution: function (v) { var A = v.c / (v.b - v.w * v.w); return '$$(' + v.b + ' - ' + (v.w * v.w) + ')A = ' + v.c + ',\\quad B = 0 \\;\\Rightarrow\\; A = ' + fx(A, 3) + '$$'; }
      },
      {
        id: 'c3-s12-pvi', title: 'PVI con lado derecho constante',
        vars: { k: [1, 3, 1], c: [2, 10, 2] },
        prompt: function (v) { return '<p>Resuelve $y\'\' - ' + (v.k * v.k === 1 ? '' : v.k * v.k) + 'y = ' + v.c + '$ con $y(0) = 0$ y $y\'(0) = 0$, y calcula $y(1)$.</p>'; },
        check: 'numeric',
        answer: function (v) { return v.c / (v.k * v.k) * (Math.cosh(v.k) - 1); },
        mistakes: {
          icOnYh: function () { return 0; },
          noOne: function (v) { return v.c / (v.k * v.k) * Math.cosh(v.k); }
        },
        feedback: [
          { when: 'icOnYh', say: 'Aplicaste las condiciones a $y_h$ antes de sumar $y_p$. Van sobre $y = y_h + y_p$.' },
          { when: 'noOne', say: 'Te faltó $y_p = -c/k^2$ en la solución completa.' }
        ],
        oracle: { lab: 'value', value: function (v) { return rk({ order: 2, rhs: (v.k * v.k) + '*y + ' + v.c, x0: 0, ics: [0, 0], domain: [0, 1] }, 1); } },
        hint: '$y_p = -c/k^2$, $y_h = c_1e^{kx} + c_2e^{-kx}$; aplica las condiciones a la suma.',
        solution: function (v) { var y = v.c / (v.k * v.k) * (Math.cosh(v.k) - 1); return '$$y = \\frac{' + v.c + '}{' + (v.k * v.k) + '}\\left(\\cosh ' + v.k + 'x - 1\\right) \\;\\Rightarrow\\; y(1) \\approx ' + fx(y, 3) + '$$'; }
      }
    ],

    quiz: { tags: ['c3.S12'], count: 8 },

    errors: [
      'Proponer solo el término de mayor grado ($Ax^2$) en lugar del polinomio completo.',
      'Proponer solo seno (o solo coseno) cuando la ecuación tiene $y\'$.',
      'Cambiar la frecuencia o el exponente de $g$ en la propuesta.',
      'Aplicar las condiciones iniciales a $y_h$ antes de sumar $y_p$.',
      'No revisar si la propuesta choca con $y_h$.',
      'Olvidar el signo de $(\\cos\\omega x)\'\' = -\\omega^2\\cos\\omega x$.'
    ],

    teacher: {
      plan: [
        'El columpio: la respuesta copia la forma de la fuerza.',
        'Tabla de formas en el pizarrón con un ejemplo por renglón.',
        'Ejemplos del polinomio y del coseno; superposición de $g$.',
        'Lab: que propongan $y_p$, vean el residuo y prueben una función de $y_h$ para ver el aviso de choque.'
      ],
      check: [
        'Que escriban la forma completa de $y_p$ antes de derivar.',
        'Que apliquen las condiciones a $y_h + y_p$.'
      ],
      note: 'La duplicación ($y_p$ que choca con $y_h$) es S13; los $g$ fuera de la tabla, S14.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §7.2 “Nonhomogeneous Linear Equations”. <a href="https://openstax.org/books/calculus-volume-3/pages/7-2-nonhomogeneous-linear-equations">openstax.org</a> (CC BY-NC-SA 4.0).',
      'MIT OpenCourseWare. <em>18.03SC Differential Equations</em> (Fall 2011), Unit II, “Undetermined Coefficients”. <a href="https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/">ocw.mit.edu</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-11',
    next: 'sesion-13'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
