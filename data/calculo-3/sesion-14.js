/* =====================================================================
   Cálculo 3 · S14 · Variación de parámetros (segundo orden)
   (bloque C · No homogéneas y orden superior).
   Fuente: OpenStax, Calculus Volume 3, §7.2 “Nonhomogeneous Linear Equations”
   (variation of parameters), CC BY-NC-SA 4.0. Ejemplos y ejercicios propios.
   Se comprueban con LabMath.ode (lab ode-compare, modo de solución particular);
   los numéricos usan RK4 como oráculo.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }

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
  function bisect(f, lo, hi) {
    var up = f(hi) > f(lo);
    for (var i = 0; i < 100; i++) { var m = (lo + hi) / 2; if ((f(m) > 0) === up) hi = m; else lo = m; }
    return (lo + hi) / 2;
  }

  var P_SEC = {
    name: "y″ + y = sec x", tex: "y'' + y = \\sec x,\\qquad -\\tfrac{\\pi}{2} < x < \\tfrac{\\pi}{2}", kind: 'yp', iv: 'x', dv: 'y', order: 2,
    rhs: '-y + sec(x)', g: 'sec(x)', domain: [-1.4, 1.4], yRange: [-1.5, 1.8],
    solution: 'x*sin(x) + cos(x)*log(cos(x))', solutionTex: 'y_p = x\\sin x + \\cos x\\,\\ln(\\cos x)',
    hint: '$y_1 = \\cos x$, $y_2 = \\sin x$, $W = 1$. Entonces $u_1\' = -\\tan x$ y $u_2\' = 1$.',
    wrong: [
      { src: 'x*sin(x)', tex: 'x\\sin\\left(x\\right)', key: 'residual' },
      { src: 'cos(x)', tex: '\\cos\\left(x\\right)', key: 'homog' },
      { src: 'cos(x)*log(cos(x))', tex: '\\cos\\left(x\\right)\\ln\\left(\\cos\\left(x\\right)\\right)', key: 'residual' }
    ]
  };
  var P_TAN = {
    name: "y″ + y = tan x", tex: "y'' + y = \\tan x,\\qquad -\\tfrac{\\pi}{2} < x < \\tfrac{\\pi}{2}", kind: 'yp', iv: 'x', dv: 'y', order: 2,
    rhs: '-y + tan(x)', g: 'tan(x)', domain: [-1.3, 1.3], yRange: [-1.5, 1.5],
    solution: '-cos(x)*log(sec(x) + tan(x))', solutionTex: 'y_p = -\\cos x\\,\\ln(\\sec x + \\tan x)',
    hint: '$u_1\' = -\\sin x\\tan x = \\cos x - \\sec x$ y $u_2\' = \\sin x$.',
    wrong: [
      { src: 'cos(x)*log(sec(x) + tan(x))', tex: '\\cos\\left(x\\right)\\ln\\left(\\sec\\left(x\\right)+\\tan\\left(x\\right)\\right)', key: 'residual' },
      { src: 'sin(x)', tex: '\\sin\\left(x\\right)', key: 'homog' },
      { src: '-cos(x)*log(cos(x))', tex: '-\\cos\\left(x\\right)\\ln\\left(\\cos\\left(x\\right)\\right)', key: 'residual' }
    ]
  };
  var P_LOG = {
    name: "y″ − 2y′ + y = eˣ/x", tex: "y'' - 2y' + y = \\frac{e^{x}}{x},\\qquad x > 0", kind: 'yp', iv: 'x', dv: 'y', order: 2,
    rhs: '2dy - y + e^x/x', g: 'e^x/x', domain: [0.3, 2.5], yRange: [-2, 14],
    solution: 'x*e^x*log(x)', solutionTex: 'y_p = x\\,e^{x}\\ln x',
    hint: '$y_1 = e^x$, $y_2 = xe^x$, $W = e^{2x}$: $u_1\' = -1$, $u_2\' = 1/x$. El término $-xe^x$ que sale ya está en $y_h$.',
    wrong: [
      { src: 'e^x*log(x)', tex: 'e^{x}\\ln\\left(x\\right)', key: 'residual' },
      { src: 'x*e^x', tex: 'xe^{x}', key: 'homog' },
      { src: 'x^2*e^x', tex: 'x^2e^{x}', key: 'residual' }
    ]
  };
  var P_BOTH = {
    name: "Los dos métodos: y″ − y = e^(2x)", tex: "y'' - y = e^{2x}", kind: 'yp', iv: 'x', dv: 'y', order: 2,
    rhs: 'y + e^(2x)', g: 'e^(2x)', domain: [-1, 1.2], yRange: [-1, 4],
    solution: 'e^(2x)/3', solutionTex: 'y_p = \\tfrac{1}{3}e^{2x}',
    hint: 'Con coeficientes indeterminados: $Ae^{2x}$ y $3A = 1$. Con variación: $y_1 = e^x$, $y_2 = e^{-x}$, $W = -2$. Deben coincidir.',
    wrong: [
      { src: 'e^(2x)', tex: 'e^{2x}', key: 'residual' },
      { src: 'e^x', tex: 'e^{x}', key: 'homog' },
      { src: 'e^(2x)/5', tex: '\\frac{e^{2x}}{5}', key: 'residual' }
    ]
  };
  var P_EULER = {
    name: "Coeficientes variables: x²y″ − 2xy′ + 2y = x³", tex: "x^2y'' - 2xy' + 2y = x^3,\\qquad x > 0", kind: 'yp', iv: 'x', dv: 'y', order: 2,
    rhs: '(2/x)*dy - (2/x^2)*y + x', g: 'x', domain: [0.5, 3], yRange: [-1, 15],
    solution: 'x^3/2', solutionTex: 'y_p = \\tfrac{1}{2}x^3',
    hint: 'Primero divide entre $x^2$: $g = x$ (no $x^3$). Con $y_1 = x$, $y_2 = x^2$, $W = x^2$.',
    wrong: [
      { src: 'x^3', tex: 'x^3', key: 'residual' },
      { src: 'x^2', tex: 'x^2', key: 'homog' },
      { src: 'x^3/6', tex: '\\frac{x^3}{6}', key: 'residual' }
    ]
  };
  // PVI del ejemplo: y″ + y = tan x, y(0) = 0, y′(0) = 0 → y = −cos x ln(sec x + tan x) + sin x.
  var tanPVI = function (x) { return -Math.cos(x) * Math.log(1 / Math.cos(x) + Math.tan(x)) + Math.sin(x); };

  var data = window.SESSION_DATA = {
    slug: 'sesion-14', number: '14', group: 'C · No homogéneas y orden superior',
    title: 'Variación de parámetros (segundo orden)', temario: [],
    minutes: 150,
    quote: 'Variación de parámetros no adivina: construye y_p a partir de y_h. Funciona con cualquier g(x) que se deje integrar.',
    badges: [
      'Usar $y_p = u_1y_1 + u_2y_2$ con $u_1\' = -\\dfrac{y_2g}{W}$, $u_2\' = \\dfrac{y_1g}{W}$.',
      'Pasar a forma estándar antes de leer $g(x)$.',
      'Resolver ecuaciones con $g$ fuera de la tabla ($\\sec x$, $\\tan x$, $\\ln x$, $e^x/x$).',
      'Comparar con coeficientes indeterminados cuando los dos aplican.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Si $y_h = c_1y_1 + c_2y_2$, busca $y_p = u_1(x)\\,y_1 + u_2(x)\\,y_2$: cambia las constantes por funciones. Sus derivadas salen de un sistema cuyo determinante es el Wronskiano.',
        recall: [
          'El <a href="../sesion-09/">Wronskiano</a> $W = y_1y_2\' - y_1\'y_2$ (S09).',
          'Coeficientes indeterminados (<a href="../sesion-12/">S12</a> y <a href="../sesion-13/">S13</a>) y su limitación: solo sirve para ciertos $g$.',
          'Integrales con $\\tan$, $\\sec$ y logaritmos (<a href="../../../calculo-1/sesiones/sesion-10/">Cálculo 1, S10</a>).'
        ],
        why: 'Es el método general: sirve para cualquier $g(x)$ continua y también cuando los coeficientes no son constantes, siempre que conozcas $y_h$. Es la base de la fórmula de Green que se usa en física e ingeniería.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en una receta de pastel ($y_h$) con cantidades fijas ($c_1$, $c_2$). Si el horno se calienta y enfría con el tiempo ($g$), no puedes usar cantidades fijas: las vas ajustando sobre la marcha. Variación de parámetros es eso: las «constantes» se vuelven funciones que se ajustan al lado derecho.',
          'No hace falta adivinar la forma de $y_p$; el precio es que hay que integrar, y a veces esas integrales cuestan trabajo.'
        ]
      },
      {
        type: 'concept', heading: 'La fórmula', short: 'Fórmula',
        body: [
          'Para $y\'\' + P(x)\\,y\' + Q(x)\\,y = g(x)$ <strong>en forma estándar</strong> (coeficiente 1 en $y\'\'$), con $y_1$, $y_2$ un conjunto fundamental y $W = y_1y_2\' - y_1\'y_2$: $$u_1\' = -\\frac{y_2\\,g}{W}, \\qquad u_2\' = \\frac{y_1\\,g}{W}, \\qquad y_p = u_1y_1 + u_2y_2$$',
          'De dónde sale: se impone $u_1\'y_1 + u_2\'y_2 = 0$ (para que $y_p\'$ no tenga $u\'$) y al sustituir queda $u_1\'y_1\' + u_2\'y_2\' = g$. Es un sistema de $2\\times 2$; con la regla de Cramer salen las fórmulas.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: variación de parámetros', short: 'Receta',
        steps: [
          { text: 'Escribe la ecuación en forma estándar y lee $g(x)$.', tip: 'Si te la dan como $x^2y\'\' + \\dots = x^3$, divide entre $x^2$: $g = x$, no $x^3$. Es el error más caro.' },
          { text: 'Encuentra $y_1$, $y_2$ (S10, S11 o te los dan) y calcula $W$.' },
          { text: 'Calcula $u_1\' = -y_2g/W$ y $u_2\' = y_1g/W$. Ojo con el signo menos en $u_1\'$.' },
          { text: 'Integra sin constantes (las constantes darían $y_h$ otra vez).' },
          { text: 'Arma $y_p = u_1y_1 + u_2y_2$ y simplifica; los términos que estén en $y_h$ se pueden quitar.' }
        ]
      },
      {
        type: 'example', heading: 'Con secante',
        problem: '<p>Encuentra $y_p$ para $y\'\' + y = \\sec x$ en $-\\pi/2 < x < \\pi/2$.</p>',
        steps: [
          { text: '$y_1 = \\cos x$, $y_2 = \\sin x$, $W = \\cos^2x + \\sin^2x = 1$. Con $g = \\sec x$:', math: "u_1' = -\\sin x\\sec x = -\\tan x, \\qquad u_2' = \\cos x\\sec x = 1" },
          { text: 'Integra.', math: 'u_1 = \\ln(\\cos x), \\qquad u_2 = x' },
          { text: 'Arma $y_p$.', math: 'y_p = \\cos x\\,\\ln(\\cos x) + x\\sin x' }
        ],
        answer: '$y_p = x\\sin x + \\cos x\\ln(\\cos x)$. Con coeficientes indeterminados no hay forma que proponer para $\\sec x$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isParticular', math: true, args: [P_SEC, 'x*sin(x) + cos(x)*log(cos(x))'], value: 1 }
      },
      {
        type: 'example', heading: 'Los dos métodos coinciden',
        problem: '<p>Encuentra $y_p$ para $y\'\' - y = e^{2x}$ con los dos métodos.</p>',
        steps: [
          { text: '<strong>Indeterminados:</strong> $y_p = Ae^{2x}$, así que $4A - A = 1$ y $A = \\frac{1}{3}$.' },
          { text: '<strong>Variación:</strong> $y_1 = e^{x}$, $y_2 = e^{-x}$, $W = -2$.', math: "u_1' = -\\frac{e^{-x}e^{2x}}{-2} = \\frac{e^{x}}{2},\\qquad u_2' = \\frac{e^{x}e^{2x}}{-2} = -\\frac{e^{3x}}{2}" },
          { text: 'Integra y arma.', math: 'y_p = \\frac{e^{x}}{2}e^{x} - \\frac{e^{3x}}{6}e^{-x} = \\frac{e^{2x}}{2} - \\frac{e^{2x}}{6} = \\frac{e^{2x}}{3}' }
        ],
        answer: '$y_p = \\frac{1}{3}e^{2x}$ con los dos. Cuando $g$ está en la tabla, coeficientes indeterminados suele ser más corto.',
        verify: { lab: 'call', mod: 'ode', fn: 'isParticular', math: true, args: [P_BOTH, 'e^(2x)/3'], value: 1 }
      },
      {
        type: 'example', heading: 'Coeficientes que no son constantes',
        problem: '<p>Sabiendo que $y_1 = x$ y $y_2 = x^2$ resuelven $x^2y\'\' - 2xy\' + 2y = 0$, encuentra $y_p$ para $x^2y\'\' - 2xy\' + 2y = x^3$ ($x > 0$).</p>',
        steps: [
          { text: 'Forma estándar: divide entre $x^2$. Ahora $g = x$.', math: "y'' - \\frac{2}{x}y' + \\frac{2}{x^2}y = x, \\qquad W = x\\cdot 2x - 1\\cdot x^2 = x^2" },
          { text: 'Fórmulas.', math: "u_1' = -\\frac{x^2\\cdot x}{x^2} = -x,\\quad u_2' = \\frac{x\\cdot x}{x^2} = 1 \\;\\Rightarrow\\; u_1 = -\\frac{x^2}{2},\\ u_2 = x" },
          { text: 'Arma.', math: 'y_p = -\\frac{x^2}{2}\\cdot x + x\\cdot x^2 = \\frac{x^3}{2}' }
        ],
        answer: '$y_p = \\frac{1}{2}x^3$. Si usas $g = x^3$ sin dividir, sale $\\frac{x^5}{6}$, que no es solución: el lab lo marca.',
        verify: { lab: 'call', mod: 'ode', fn: 'isParticular', math: true, args: [P_EULER, 'x^3/2'], value: 1 }
      },
      {
        type: 'example', heading: 'PVI con tangente',
        problem: '<p>Resuelve $y\'\' + y = \\tan x$ con $y(0) = 0$, $y\'(0) = 0$, y calcula $y(1)$.</p>',
        steps: [
          { text: '$u_1\' = -\\sin x\\tan x = \\cos x - \\sec x$ y $u_2\' = \\sin x$, así que $u_1 = \\sin x - \\ln(\\sec x + \\tan x)$ y $u_2 = -\\cos x$.', math: 'y_p = -\\cos x\\,\\ln(\\sec x + \\tan x)' },
          { text: 'General: $y = c_1\\cos x + c_2\\sin x + y_p$. En 0: $y_p(0) = 0$ y $y_p\'(0) = -1$, así que $c_1 = 0$ y $c_2 = 1$.', math: 'y = \\sin x - \\cos x\\,\\ln(\\sec x + \\tan x)' },
          { text: 'Evalúa.', math: 'y(1) \\approx ' + fx(tanPVI(1), 4) }
        ],
        answer: '$y(1) \\approx ' + fx(tanPVI(1), 4) + '$.',
        verify: { lab: 'call', mod: 'ode', fn: 'solveAt', math: true, args: [{ order: 2, rhs: '-y + tan(x)', x0: 0, ics: [0, 0], domain: [0, 1.3] }, 1], value: tanPVI(1) }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Cuándo uso cuál método?', a: 'Si $g$ está en la tabla de S12 y los coeficientes son constantes, coeficientes indeterminados suele ser más rápido. Si $g$ es $\\tan x$, $\\sec x$, $\\ln x$, $1/x$… o los coeficientes no son constantes, variación de parámetros.' },
          { q: '¿Por qué no lleva constantes al integrar $u_1\'$ y $u_2\'$?', a: 'Porque $c\\,y_1$ o $c\\,y_2$ son parte de $y_h$; se agregan al final, en la solución general.' },
          { q: '¿Qué pasa si no puedo integrar $u_1\'$?', a: 'Puedes dejar la $y_p$ con integrales: $y_p = -y_1\\int \\frac{y_2g}{W}dx + y_2\\int\\frac{y_1g}{W}dx$. Sigue siendo una respuesta correcta.' },
          { q: '¿Sirve para orden mayor?', a: 'Sí, con $n$ funciones $u_k$ y la regla de Cramer sobre el Wronskiano de $n\\times n$; en este curso solo vemos segundo orden.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Forma estándar primero: $g$ es lo que queda del lado derecho con coeficiente 1 en $y\'\'$.',
          '$u_1\' = -y_2g/W$, $u_2\' = y_1g/W$, $y_p = u_1y_1 + u_2y_2$.',
          'Integra sin constantes; los términos de $y_h$ que aparezcan se pueden quitar.',
          'Funciona con cualquier $g$ y con coeficientes variables, si conoces $y_h$.'
        ]
      }
    ],

    lab: {
      type: 'ode-compare', title: 'Variación de parámetros contra la tabla',
      intro: 'Escribe tu $y_p$ (sin constantes). El lab la sustituye en la ecuación y grafica el residuo. En el problema 4 aplican los dos métodos: comprueba que dan lo mismo. En el 5 los coeficientes no son constantes: recuerda pasar a forma estándar.',
      cfg: { start: 0, problems: [P_SEC, P_TAN, P_LOG, P_BOTH, P_EULER] }
    },

    formulas: [
      { label: 'Propuesta', tex: 'y_p = u_1y_1 + u_2y_2' },
      { label: 'Derivadas', tex: "u_1' = -\\frac{y_2\\,g}{W},\\quad u_2' = \\frac{y_1\\,g}{W}" },
      { label: 'Wronskiano', tex: "W = y_1y_2' - y_1'y_2" }
    ],

    exercises: [
      {
        id: 'c3-s14-cual', title: '¿Qué método?',
        vars: { k: [0, 3, 1] },
        prompt: function (v) {
          var eq = ["y'' + 4y = \\csc 2x", "y'' + 4y = 3x^2", "y'' - 2y' + y = e^{x}\\ln x", "y'' + y' = 6e^{2x}"][v.k];
          return '<p>¿Qué método conviene para $' + eq + '$?</p>';
        },
        check: 'choice',
        options: function (v) {
          var vp = v.k === 0 || v.k === 2;
          return [
            { text: 'Variación de parámetros', correct: vp, say: vp ? null : '$g$ está en la tabla: coeficientes indeterminados es más corto.' },
            { text: 'Coeficientes indeterminados', correct: !vp, say: vp ? 'No hay forma que proponer para este $g$: no está en la tabla.' : null },
            { text: 'Ninguno de los dos sirve', say: 'Variación de parámetros sirve para cualquier $g$ continua.' }
          ];
        },
        answer: function (v) { return v.k === 0 || v.k === 2 ? 'Variación de parámetros' : 'Coeficientes indeterminados'; },
        hint: '¿$g$ es un polinomio, una exponencial, un seno o coseno, o un producto de ellos?',
        solution: function (v) { return ['$\\csc 2x$ no está en la tabla: variación.', 'Polinomio: indeterminados.', '$e^x\\ln x$ no está en la tabla: variación.', 'Exponencial: indeterminados.'][v.k]; }
      },
      {
        id: 'c3-s14-u1', title: 'La primera derivada u₁′',
        vars: { k: [1, 4, 1], c: [2, 9, 1] },
        prompt: function (v) { return '<p>Para $y\'\' + ' + (v.k * v.k === 1 ? '' : v.k * v.k) + 'y = ' + v.c + '$, con $y_1 = \\cos ' + (v.k === 1 ? '' : v.k) + 'x$ y $y_2 = \\sin ' + (v.k === 1 ? '' : v.k) + 'x$, escribe $u_1\'(x)$.</p>'; },
        check: 'expr', domain: [0.1, 1.5],
        answer: function (v) { return '-' + (v.c / v.k) + '*sin(' + v.k + '*x)'; },
        mistakes: {
          noW: function (v) { return '-' + v.c + '*sin(' + v.k + '*x)'; },
          sign: function (v) { return (v.c / v.k) + '*sin(' + v.k + '*x)'; },
          other: function (v) { return (v.c / v.k) + '*cos(' + v.k + '*x)'; }
        },
        where: function (v) { return v.k !== 1; },
        feedback: [
          { when: 'noW', say: 'Divide entre el Wronskiano: $W = k$ para $\\cos kx$ y $\\sin kx$.' },
          { when: 'sign', say: 'La fórmula de $u_1\'$ lleva signo menos: $-y_2g/W$.' },
          { when: 'other', say: 'Esa es $u_2\' = y_1g/W$. $u_1\'$ usa $y_2$.' }
        ],
        hint: '$W = k$; $u_1\' = -y_2g/W$.',
        solution: function (v) { return "$$W = " + v.k + ",\\qquad u_1' = -\\frac{\\sin " + v.k + "x\\cdot " + v.c + "}{" + v.k + "} = -" + fx(v.c / v.k, 3) + "\\sin " + v.k + "x$$"; }
      },
      {
        id: 'c3-s14-exp', title: 'Comprueba con los dos métodos',
        vars: { m: [2, 4, 1], c: [3, 15, 3] },
        prompt: function (v) { return '<p>Para $y\'\' - y = ' + v.c + 'e^{' + v.m + 'x}$, la solución particular es $y_p = Ae^{' + v.m + 'x}$ (sale igual por variación de parámetros). ¿Cuánto vale $A$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.c / (v.m * v.m - 1); },
        mistakes: { plus: function (v) { return v.c / (v.m * v.m + 1); }, raw: function (v) { return v.c; } },
        feedback: [
          { when: 'plus', say: 'La ecuación es $y\'\' - y$: queda $A(m^2 - 1) = c$.' },
          { when: 'raw', say: 'Sustituye $Ae^{mx}$: $A(m^2 - 1)e^{mx} = ce^{mx}$.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          // Variación de parámetros con integrales numéricas (Simpson) de u₁′ y u₂′ en [−3, 0]; en 0, y_p = u₁ + u₂.
          // Con límite inferior −∞ desaparecen los términos de y_h que crecen: se toma el límite a −30.
          function simpson(f, a, b, n) { var h = (b - a) / n, s = f(a) + f(b); for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h); return s * h / 3; }
          var u1 = simpson(function (t) { return Math.exp(-t) * v.c * Math.exp(v.m * t) / 2; }, -30, 0, 60000);
          var u2 = simpson(function (t) { return -Math.exp(t) * v.c * Math.exp(v.m * t) / 2; }, -30, 0, 60000);
          return u1 + u2;
        } },
        hint: 'Con indeterminados es directo: $A(m^2 - 1) = c$.',
        solution: function (v) { return '$$A(' + (v.m * v.m) + ' - 1) = ' + v.c + ' \\;\\Rightarrow\\; A = ' + fx(v.c / (v.m * v.m - 1), 3) + '$$'; }
      },
      {
        id: 'c3-s14-tan', title: 'PVI con tangente',
        vars: { x1: [0.3, 1.2, 0.1] },
        prompt: function (v) { return '<p>Resuelve $y\'\' + y = \\tan x$ con $y(0) = 0$, $y\'(0) = 0$, y calcula $y(' + v.x1 + ')$.</p>'; },
        check: 'numeric',
        answer: function (v) { return tanPVI(v.x1); },
        mistakes: {
          onlyYp: function (v) { return -Math.cos(v.x1) * Math.log(1 / Math.cos(v.x1) + Math.tan(v.x1)); },
          signYp: function (v) { return Math.cos(v.x1) * Math.log(1 / Math.cos(v.x1) + Math.tan(v.x1)) + Math.sin(v.x1); }
        },
        feedback: [
          { when: 'onlyYp', say: 'Esa es $y_p$ sola; falta la parte homogénea que hace cumplir $y\'(0) = 0$ (aquí $\\sin x$).' },
          { when: 'signYp', say: 'Revisa el signo de $u_1\' = -y_2g/W$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return rk({ order: 2, rhs: '-y + tan(x)', x0: 0, ics: [0, 0], domain: [0, 1.3] }, v.x1); } },
        hint: '$y = c_1\\cos x + c_2\\sin x - \\cos x\\ln(\\sec x + \\tan x)$.',
        solution: function (v) { return '$$y = \\sin x - \\cos x\\,\\ln(\\sec x + \\tan x) \\;\\Rightarrow\\; y(' + v.x1 + ') \\approx ' + fx(tanPVI(v.x1), 4) + '$$'; }
      },
      {
        id: 'c3-s14-estandar', title: 'Concepto: forma estándar',
        vars: { k: [2, 4, 1] },
        prompt: function (v) { return '<p>En $x^2y\'\' + xy\' - y = x^{' + v.k + '}$ ($x > 0$), ¿qué $g(x)$ va en las fórmulas de variación de parámetros?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: '$x^{' + (v.k - 2) + '}$'.replace('x^{0}', '1').replace('x^{1}', 'x'), correct: true },
            { text: '$x^{' + v.k + '}$', say: 'Hay que dividir entre el coeficiente de $y\'\'$ ($x^2$) antes de leer $g$.' },
            { text: '$x^{' + (v.k - 1) + '}$'.replace('x^{1}', 'x'), say: 'El coeficiente de $y\'\'$ es $x^2$, no $x$.' }
          ];
        },
        answer: function (v) { return '$x^{' + (v.k - 2) + '}$'.replace('x^{0}', '1').replace('x^{1}', 'x'); },
        hint: 'Divide toda la ecuación entre $x^2$.',
        solution: function (v) { return 'Dividiendo entre $x^2$: $y\'\' + \\frac{1}{x}y\' - \\frac{1}{x^2}y = x^{' + (v.k - 2) + '}$.'; }
      }
    ],

    quiz: { tags: ['c3.S14'], count: 8 },

    errors: [
      'Leer $g$ sin pasar a forma estándar.',
      'Olvidar el signo menos en $u_1\' = -y_2g/W$.',
      'Intercambiar $y_1$ y $y_2$ en las fórmulas.',
      'Dividir entre $W$ con el orden equivocado ($y_1\'y_2 - y_1y_2\'$).',
      'Agregar constantes al integrar $u_1$, $u_2$ y luego otra vez en $y_h$.',
      'Usar variación cuando coeficientes indeterminados es mucho más corto (no es error, pero cuesta).'
    ],

    teacher: {
      plan: [
        'La receta con cantidades que se ajustan: idea de $u_1$, $u_2$.',
        'Deducir el sistema y la regla de Cramer en el pizarrón.',
        'Ejemplo de la secante y comparación con el de los dos métodos.',
        'Lab: el problema de coeficientes variables para insistir en la forma estándar.'
      ],
      check: [
        'Que escriban la forma estándar antes de calcular $W$.',
        'Que comprueben $y_p$ sustituyendo (o en el lab).'
      ],
      note: 'Con esto cierra la teoría de no homogéneas; S15 aplica todo a resortes y circuitos.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §7.2 “Nonhomogeneous Linear Equations” (variation of parameters). <a href="https://openstax.org/books/calculus-volume-3/pages/7-2-nonhomogeneous-linear-equations">openstax.org</a> (CC BY-NC-SA 4.0).',
      'MIT OpenCourseWare. <em>18.03SC Differential Equations</em> (Fall 2011), Unit II, “Variation of Parameters”. <a href="https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/">ocw.mit.edu</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-13',
    next: 'sesion-15'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
