/* =====================================================================
   Cálculo 3 · S07 · Reducibles a exactas: factores integrantes μ(x) y μ(y)
   (bloque B · Primer orden II y orden n).
   Fuente: MIT OCW 18.03SC (CC BY-NC-SA 4.0); el método sigue a Zill, Ecuaciones
   diferenciales con aplicaciones de modelado, 11.ª ed., §2.4 (solo lectura).
   Ejemplos y ejercicios propios. Se comprueban con LabMath.ode (lab ode-compare, modo
   de exactas): con μ, ∂(μM)/∂y = ∂(μN)/∂x; los numéricos usan RK4 o cuentas aparte.
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

  var P_MUX = {
    name: 'μ(x): (3xy + y²) dx + (x² + xy) dy = 0', tex: '(3xy + y^2)\\,dx + (x^2 + xy)\\,dy = 0,\\qquad y(1) = 1', kind: 'exact', ask: 'mu',
    M: '3x*y + y^2', N: 'x^2 + x*y', x0: 1, ics: [1], domain: [0.6, 2], yRange: [0.1, 3],
    solution: 'x', solutionTex: 'x',
    hint: '$\\dfrac{M_y - N_x}{N} = \\dfrac{(3x + 2y) - (2x + y)}{x(x + y)}$. Simplifica: solo queda $x$.',
    wrong: [
      { src: 'y', tex: 'y', key: 'notExact' },
      { src: 'e^x', tex: 'e^{x}', key: 'notExact' },
      { src: '1/x', tex: '\\frac{1}{x}', key: 'notExact' }
    ]
  };
  var P_MUX2 = {
    name: 'μ(x): (2y² + 3x) dx + 2xy dy = 0', tex: '(2y^2 + 3x)\\,dx + 2xy\\,dy = 0,\\qquad y(1) = 1', kind: 'exact', ask: 'mu',
    M: '2y^2 + 3x', N: '2x*y', x0: 1, ics: [1], domain: [0.5, 1.2], yRange: [0.1, 3],
    solution: 'x', solutionTex: 'x',
    hint: '$\\dfrac{M_y - N_x}{N} = \\dfrac{4y - 2y}{2xy} = \\dfrac{1}{x}$, así que $\\mu = e^{\\int dx/x}$.',
    wrong: [
      { src: 'y', tex: 'y', key: 'notExact' },
      { src: 'x^2', tex: 'x^2', key: 'notExact' },
      { src: '1/x', tex: '\\frac{1}{x}', key: 'notExact' }
    ]
  };
  var P_MUY = {
    name: 'μ(y): y dx + (2x − y eʸ) dy = 0', tex: 'y\\,dx + (2x - y e^{y})\\,dy = 0,\\qquad y(1) = 1', kind: 'exact', ask: 'mu',
    M: 'y', N: '2x - y*e^y', x0: 1, ics: [1], domain: [0.5, 2], yRange: [0.2, 2.2],
    solution: 'y', solutionTex: 'y',
    hint: '$\\dfrac{M_y - N_x}{N}$ depende de $x$ y de $y$. Prueba al revés: $\\dfrac{N_x - M_y}{M} = \\dfrac{2 - 1}{y}$.',
    wrong: [
      { src: 'x', tex: 'x', key: 'notExact' },
      { src: 'e^y', tex: 'e^{y}', key: 'notExact' },
      { src: '1/y', tex: '\\frac{1}{y}', key: 'notExact' }
    ]
  };
  var P_LIN = {
    name: 'La lineal y′ + 2y = e^(−x) como exacta', tex: '(2y - e^{-x})\\,dx + dy = 0,\\qquad y(0) = 2', kind: 'exact', ask: 'mu',
    M: '2y - e^(-x)', N: '1', x0: 0, ics: [2], domain: [0, 3], yRange: [0, 2.5],
    solution: 'e^(2x)', solutionTex: 'e^{2x}',
    hint: 'Es la lineal de la sesión 4 escrita en forma diferencial. $\\dfrac{M_y - N_x}{N} = 2$.',
    wrong: [
      { src: 'e^(-2x)', tex: 'e^{-2x}', key: 'notExact' },
      { src: 'e^x', tex: 'e^{x}', key: 'notExact' },
      { src: '2x', tex: '2x', key: 'notExact' }
    ]
  };
  var P_F = {
    name: 'Ya con μ = x: encuentra F', tex: 'x(3xy + y^2)\\,dx + x(x^2 + xy)\\,dy = 0,\\qquad y(1) = 1', kind: 'exact',
    M: '3x*y + y^2', N: 'x^2 + x*y', mu: 'x', x0: 1, ics: [1], domain: [0.6, 2], yRange: [0.1, 3],
    solution: 'x^3*y + x^2*y^2/2', solutionTex: 'x^3y + \\tfrac{1}{2}x^2y^2',
    hint: 'Ya multiplicada: $\\mu M = 3x^2y + xy^2$. Intégrala respecto a $x$.',
    wrong: [
      { src: 'x^2*y + x*y^2/2', tex: 'x^2y+\\frac{xy^2}{2}', key: 'residual' },
      { src: '-(x^3*y + x^2*y^2/2)', tex: '-\\left(x^3y+\\frac{x^2y^2}{2}\\right)', key: 'sign' },
      { src: 'x^3*y + x^2*y^2', tex: 'x^3y+x^2y^2', key: 'residual' }
    ]
  };

  var data = window.SESSION_DATA = {
    slug: 'sesion-07', number: '07', group: 'B · Primer orden II y orden n',
    title: 'Reducibles a exactas: factores integrantes μ(x) y μ(y)', temario: [],
    minutes: 150,
    quote: 'Multiplicar por μ no cambia las soluciones: solo las acomoda para que se vean como curvas de nivel.',
    badges: [
      'Reconocer cuándo una ecuación no exacta admite un factor $\\mu(x)$ o $\\mu(y)$.',
      'Calcular $\\mu = e^{\\int (M_y - N_x)/N\\,dx}$ o $\\mu = e^{\\int (N_x - M_y)/M\\,dy}$.',
      'Resolver la ecuación ya exacta con la receta de la sesión 6.',
      'Ver el factor integrante de las lineales (S04) como un caso de este método.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Si $M\\,dx + N\\,dy = 0$ no es exacta, a veces al multiplicarla por una función $\\mu$ sí lo es. Buscamos $\\mu$ que dependa de una sola variable.',
        recall: [
          'Las <a href="../sesion-06/">ecuaciones exactas</a> y la prueba $M_y = N_x$ (S06 de este curso).',
          'El <a href="../sesion-04/">factor integrante de las lineales</a> (S04): $\\mu = e^{\\int P\\,dx}$.',
          'Regla del producto para derivadas parciales: $\\partial_y(\\mu M) = \\mu M_y$ si $\\mu$ solo depende de $x$.'
        ],
        why: 'Muchas ecuaciones del mundo real llegan «casi exactas». El factor integrante las rescata, y además explica de dónde salía el truco de las lineales.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Imagina un mapa del cerro dibujado en una hoja de hule que alguien estiró de forma dispareja. Las curvas de nivel siguen ahí, pero las distancias entre ellas ya no corresponden a alturas: con ese mapa no puedes reconstruir el cerro.',
          'El factor integrante es «desestirar» el hule: multiplicas la ecuación por la función correcta y las pendientes vuelven a ser las de un cerro de verdad. Las curvas (las soluciones) nunca cambiaron; solo recuperas la función $F$ de la que son curvas de nivel.'
        ]
      },
      {
        type: 'concept', heading: 'La condición para μ', short: 'Condición',
        body: [
          'Queremos que $\\mu M\\,dx + \\mu N\\,dy = 0$ sea exacta: $\\partial_y(\\mu M) = \\partial_x(\\mu N)$. Con $\\mu$ cualquiera eso es una ecuación en derivadas parciales, difícil. Pero si $\\mu$ depende solo de $x$, $\\partial_y(\\mu M) = \\mu M_y$ y $\\partial_x(\\mu N) = \\mu\' N + \\mu N_x$, así que $$\\frac{\\mu\'}{\\mu} = \\frac{M_y - N_x}{N}$$',
          'Eso solo tiene sentido si el lado derecho depende <strong>solo de $x$</strong>. Entonces $$\\mu(x) = e^{\\int \\frac{M_y - N_x}{N}\\,dx}$$',
          'De la misma forma, si $\\dfrac{N_x - M_y}{M}$ depende solo de $y$, $$\\mu(y) = e^{\\int \\frac{N_x - M_y}{M}\\,dy}$$ Fíjate en el orden de la resta y en quién divide: $N$ para $\\mu(x)$, $M$ para $\\mu(y)$.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: factor integrante', short: 'Receta',
        steps: [
          { text: 'Calcula $M_y$ y $N_x$. Si son iguales ya es exacta (S06).' },
          { text: 'Calcula $\\dfrac{M_y - N_x}{N}$ y simplifica. Si solo tiene $x$, $\\mu(x) = e^{\\int (\\cdot)\\,dx}$.', tip: 'Simplifica antes de decidir: $\\frac{x + y}{x(x + y)} = \\frac{1}{x}$ sí depende solo de $x$.' },
          { text: 'Si no, calcula $\\dfrac{N_x - M_y}{M}$. Si solo tiene $y$, $\\mu(y) = e^{\\int (\\cdot)\\,dy}$.', tip: 'Ojo: para $\\mu(y)$ el orden es $N_x - M_y$ y se divide entre $M$.' },
          { text: 'Multiplica <strong>toda</strong> la ecuación por $\\mu$ y comprueba que ahora $\\partial_y(\\mu M) = \\partial_x(\\mu N)$.' },
          { text: 'Resuelve la exacta con la receta de S06: $F = \\int \\mu M\\,dx + h(y)$, y $F = C$.' }
        ]
      },
      {
        type: 'example', heading: 'Un factor μ(x)',
        problem: '<p>Resuelve $(3xy + y^2)\\,dx + (x^2 + xy)\\,dy = 0$.</p>',
        steps: [
          { text: 'No es exacta.', math: 'M_y = 3x + 2y \\qquad N_x = 2x + y' },
          { text: 'Prueba $\\mu(x)$: la diferencia entre $N$ se simplifica.', math: '\\frac{M_y - N_x}{N} = \\frac{x + y}{x(x + y)} = \\frac{1}{x} \\;\\Rightarrow\\; \\mu = e^{\\ln x} = x' },
          { text: 'Multiplica: $(3x^2y + xy^2)\\,dx + (x^3 + x^2y)\\,dy = 0$. Ahora $\\partial_y = 3x^2 + 2xy = \\partial_x$. Integra.', math: 'F = \\int (3x^2y + xy^2)\\,dx = x^3y + \\tfrac{1}{2}x^2y^2 + h(y), \\quad h\' = 0' }
        ],
        answer: '$x^3y + \\tfrac{1}{2}x^2y^2 = C$. En el lab puedes escribir tu $\\mu$ y ver cómo la diferencia $M_y - N_x$ (punteada) se vuelve cero.',
        verify: { lab: 'call', mod: 'ode', fn: 'isExactEq', math: true, args: [P_MUX, 'x'], value: 1 }
      },
      {
        type: 'example', heading: 'Un factor μ(y)',
        problem: '<p>Resuelve $y\\,dx + (2x - y e^{y})\\,dy = 0$, con $y > 0$.</p>',
        steps: [
          { text: '$M_y = 1$, $N_x = 2$. La prueba para $\\mu(x)$ da $\\frac{-1}{2x - ye^y}$, que tiene $y$: no sirve.', math: '\\frac{N_x - M_y}{M} = \\frac{2 - 1}{y} = \\frac{1}{y} \\;\\Rightarrow\\; \\mu = e^{\\ln y} = y' },
          { text: 'Multiplica: $y^2\\,dx + (2xy - y^2e^y)\\,dy = 0$, exacta. Integra $\\mu M = y^2$ respecto a $x$.', math: "F = xy^2 + h(y), \\quad F_y = 2xy + h'(y) = 2xy - y^2e^y" },
          { text: 'Así que $h\' = -y^2e^y$; por partes dos veces (Cálculo 1, S11):', math: 'h(y) = -(y^2 - 2y + 2)e^y' }
        ],
        answer: '$xy^2 - (y^2 - 2y + 2)e^{y} = C$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isPotential', math: true, args: [{ kind: 'exact', M: 'y', N: '2x - y*e^y', mu: 'y', x0: 1, ics: [1], domain: [0.5, 2], yRange: [0.2, 2.2] }, 'x*y^2 - (y^2 - 2y + 2)*e^y'], value: 1 }
      },
      {
        type: 'concept', heading: 'Las lineales son un caso particular', short: 'Lineales',
        body: [
          'La lineal $y\' + P(x)\\,y = Q(x)$ en forma diferencial es $(P\\,y - Q)\\,dx + dy = 0$, con $M = Py - Q$ y $N = 1$. Entonces $$\\frac{M_y - N_x}{N} = \\frac{P - 0}{1} = P(x) \\;\\Longrightarrow\\; \\mu = e^{\\int P\\,dx}$$',
          'Es el mismo factor integrante de la sesión 4. Ahora sabes de dónde sale: es el que vuelve exacta a la ecuación.'
        ],
        diagram: 'c3s07-same',
        state: { level: 1 },
        caption: 'El campo de pendientes de la ecuación original y las curvas de nivel de $F$ (después de multiplicar por $\\mu = x$): coinciden. El factor integrante no cambia las soluciones.'
      },
      {
        type: 'example', heading: 'La constante de la solución',
        problem: '<p>Resuelve $(2y^2 + 3x)\\,dx + 2xy\\,dy = 0$ con $y(1) = 1$ y calcula $y(0.5)$.</p>',
        steps: [
          { text: '$M_y = 4y$, $N_x = 2y$, y $\\frac{M_y - N_x}{N} = \\frac{2y}{2xy} = \\frac{1}{x}$: $\\mu = x$.', math: '(2xy^2 + 3x^2)\\,dx + 2x^2y\\,dy = 0' },
          { text: 'Integra: $F = x^2y^2 + x^3 + h(y)$, con $h\' = 0$. La condición da $C = 1 + 1 = 2$.', math: 'x^2y^2 + x^3 = 2 \\;\\Rightarrow\\; y = \\frac{\\sqrt{2 - x^3}}{x}' },
          { text: 'En $x = 0.5$:', math: 'y(0.5) = \\frac{\\sqrt{2 - 0.125}}{0.5} \\approx ' + fx(Math.sqrt(1.875) / 0.5) }
        ],
        answer: '$y(0.5) \\approx ' + fx(Math.sqrt(1.875) / 0.5) + '$.',
        verify: { lab: 'call', mod: 'ode', fn: 'solveAt', math: true, args: [P_MUX2, 0.5], value: Math.sqrt(1.875) / 0.5 }
      },
      {
        type: 'callout', heading: 'Si ninguna prueba funciona',
        body: [
          'Puede que la ecuación tenga un factor integrante que depende de $x$ y de $y$ juntas (como $\\mu = xy$ o $\\mu = x^ay^b$), o que convenga otro método (separable, homogénea, Bernoulli). Antes de buscar $\\mu$, mira si la ecuación ya cae en uno de los métodos que conoces.'
        ]
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Multiplicar por $\\mu$ cambia las soluciones?', a: 'No (salvo puntos donde $\\mu = 0$ o no existe, que hay que revisar aparte). Si $M\\,dx + N\\,dy = 0$, también $\\mu M\\,dx + \\mu N\\,dy = 0$.' },
          { q: '¿Por qué $\\mu$ no lleva constante?', a: 'Porque si $\\mu$ funciona, $3\\mu$ también. Se toma la más simple.' },
          { q: '¿Cómo sé si la expresión «depende solo de $x$»?', a: 'Simplifícala hasta el final. Si después de cancelar factores comunes ya no aparece $y$, depende solo de $x$.' },
          { q: '¿Me equivoqué si $\\mu$ me sale negativo o con valor absoluto?', a: '$e^{\\ln|x|} = |x|$. En un intervalo con $x > 0$ es $x$; con $x < 0$, $-x$, y el signo da igual porque multiplica toda la ecuación.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Si $\\frac{M_y - N_x}{N}$ solo depende de $x$: $\\mu(x) = e^{\\int (M_y - N_x)/N\\,dx}$.',
          'Si $\\frac{N_x - M_y}{M}$ solo depende de $y$: $\\mu(y) = e^{\\int (N_x - M_y)/M\\,dy}$.',
          'Multiplica toda la ecuación y resuélvela como exacta.',
          'El factor de las lineales, $e^{\\int P}$, es este mismo con $M = Py - Q$, $N = 1$.'
        ]
      }
    ],

    lab: {
      type: 'ode-compare', title: 'Antes y después de multiplicar por μ',
      intro: 'En los primeros cuatro problemas escribe tu factor integrante $\\mu$. Abajo ves $M_y - N_x$ a lo largo de la solución antes de multiplicar (punteada) y después (sólida): con el $\\mu$ correcto se vuelve cero. En el último, $\\mu$ ya está aplicado: escribe la función potencial $F$.',
      cfg: { start: 0, problems: [P_MUX, P_MUX2, P_MUY, P_LIN, P_F] }
    },

    formulas: [
      { label: 'Factor en x', tex: '\\mu(x) = e^{\\int \\frac{M_y - N_x}{N}\\,dx}' },
      { label: 'Factor en y', tex: '\\mu(y) = e^{\\int \\frac{N_x - M_y}{M}\\,dy}' },
      { label: 'Exactitud con μ', tex: '\\partial_y(\\mu M) = \\partial_x(\\mu N)' }
    ],

    exercises: [
      {
        id: 'c3-s07-tipo', title: '¿Qué factor integrante?',
        vars: { k: [0, 3, 1] },
        prompt: function (v) {
          var eqs = ['(3xy + y^2)\\,dx + (x^2 + xy)\\,dy = 0', 'y\\,dx + (2x - y e^{y})\\,dy = 0', '(2y - e^{-x})\\,dx + dy = 0', '(x^2 + y)\\,dx + x\\,dy = 0'];
          return '<p>Para $' + eqs[v.k] + '$, ¿qué sirve?</p>';
        },
        check: 'choice',
        options: function (v) {
          var right = ['mux', 'muy', 'mux', 'exact'][v.k];
          var all = [
            ['mux', 'Un factor $\\mu(x)$', '$\\frac{M_y - N_x}{N}$ depende de $y$ aquí; no sirve.'],
            ['muy', 'Un factor $\\mu(y)$', '$\\frac{N_x - M_y}{M}$ no depende solo de $y$ aquí.'],
            ['exact', 'Ya es exacta, no hace falta $\\mu$', 'Calcula $M_y$ y $N_x$: no son iguales.']
          ];
          return all.map(function (o) { return o[0] === right ? { text: o[1], correct: true } : { text: o[1], say: o[2] }; });
        },
        answer: function (v) { return { mux: 'Un factor $\\mu(x)$', muy: 'Un factor $\\mu(y)$', exact: 'Ya es exacta, no hace falta $\\mu$' }[['mux', 'muy', 'mux', 'exact'][v.k]]; },
        hint: 'Primero prueba exactitud; luego $\\frac{M_y - N_x}{N}$ y $\\frac{N_x - M_y}{M}$.',
        solution: function (v) { return ['$\\frac{M_y - N_x}{N} = \\frac{1}{x}$: $\\mu(x) = x$.', '$\\frac{N_x - M_y}{M} = \\frac{1}{y}$: $\\mu(y) = y$.', '$\\frac{M_y - N_x}{N} = 2$: $\\mu(x) = e^{2x}$.', '$M_y = 1 = N_x$: ya es exacta.'][v.k]; }
      },
      {
        id: 'c3-s07-mux', title: 'Calcula μ(x)',
        vars: { k: [1, 4, 1], a: [1, 5, 1] },
        prompt: function (v) { return '<p>Encuentra un factor integrante $\\mu(x)$ para $(' + (v.k === 1 ? '' : v.k) + 'y^2 + ' + v.a + 'x)\\,dx + xy\\,dy = 0$.</p>'; },
        check: 'expr', domain: [0.5, 2],
        answer: function (v) { return 'x^' + (2 * v.k - 1); },
        mistakes: {
          noMinus: function (v) { return 'x^' + (2 * v.k); },
          inverse: function (v) { return 'x^(-' + (2 * v.k - 1) + ')'; },
          expo: function (v) { return 'e^(' + (2 * v.k - 1) + '*x)'; }
        },
        feedback: [
          { when: 'noMinus', say: 'Revisa $M_y - N_x$: $2ky - y = (2k - 1)y$.' },
          { when: 'inverse', say: 'El orden es $M_y - N_x$ (y se divide entre $N$): el exponente es positivo.' },
          { when: 'expo', say: '$\\int \\frac{2k - 1}{x}dx = (2k - 1)\\ln x$, así que $\\mu = x^{2k - 1}$, no una exponencial de $x$.' }
        ],
        hint: '$\\frac{M_y - N_x}{N} = \\frac{2ky - y}{xy}$.',
        solution: function (v) { return '$$\\frac{M_y - N_x}{N} = \\frac{' + (2 * v.k) + 'y - y}{xy} = \\frac{' + (2 * v.k - 1) + '}{x} \\;\\Rightarrow\\; \\mu = e^{' + (2 * v.k - 1) + '\\ln x} = x^{' + (2 * v.k - 1) + '}$$'; }
      },
      {
        id: 'c3-s07-muy', title: 'El exponente de μ(y)',
        vars: { c: [2, 6, 1] },
        prompt: function (v) { return '<p>Para $y\\,dx + (' + v.c + 'x - y^3)\\,dy = 0$, el factor integrante es de la forma $\\mu(y) = y^m$. ¿Cuánto vale $m$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.c - 1; },
        mistakes: {
          sign: function (v) { return 1 - v.c; },
          raw: function (v) { return v.c; }
        },
        feedback: [
          { when: 'sign', say: 'Para $\\mu(y)$ el orden es $N_x - M_y$, dividido entre $M$.' },
          { when: 'raw', say: 'Resta $M_y = 1$: $N_x - M_y = ' + 'c - 1$.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          // Busca m tal que ∂y(y^m·y) = ∂x(y^m·(cx − y³)) en un punto (bisección).
          var y = 1.7, gap = function (m) { return (m + 1) * Math.pow(y, m) - v.c * Math.pow(y, m); };
          var lo = -20, hi = 20;
          for (var i = 0; i < 80; i++) { var mm = (lo + hi) / 2; if (gap(mm) < 0) lo = mm; else hi = mm; }
          return (lo + hi) / 2;
        } },
        hint: '$\\frac{N_x - M_y}{M} = \\frac{c - 1}{y}$.',
        solution: function (v) { return '$$\\frac{N_x - M_y}{M} = \\frac{' + v.c + ' - 1}{y} \\;\\Rightarrow\\; \\mu = e^{' + (v.c - 1) + '\\ln y} = y^{' + (v.c - 1) + '}$$'; }
      },
      {
        id: 'c3-s07-valor', title: 'Resolver y evaluar',
        vars: { a: [1, 4, 1], b: [1, 3, 1] },
        prompt: function (v) { return '<p>Resuelve $(2y^2 + ' + (3 * v.a) + 'x)\\,dx + 2xy\\,dy = 0$ con $y(1) = ' + v.b + '$ y calcula $y(0.8)$.</p>'; },
        check: 'numeric',
        answer: function (v) { var C = v.b * v.b + v.a; return Math.sqrt(C - v.a * 0.512) / 0.8; },
        mistakes: {
          noMu: function (v) { return Math.sqrt(v.b * v.b + 1.5 * v.a - 1.5 * v.a * 0.64) / Math.sqrt(0.8); },
          noRoot: function (v) { var C = v.b * v.b + v.a; return (C - v.a * 0.512) / 0.64; }
        },
        feedback: [
          { when: 'noMu', say: 'Parece que integraste sin multiplicar por $\\mu = x$. Con $\\mu$: $F = x^2y^2 + ax^3$.' },
          { when: 'noRoot', say: 'Ese es $y^2$; saca raíz (positiva, porque $y(1) > 0$).' }
        ],
        oracle: { lab: 'value', value: function (v) { return window.LabMath.ode.solveAt(window.math, { kind: 'exact', M: '2y^2 + ' + (3 * v.a) + '*x', N: '2x*y', x0: 1, ics: [v.b], domain: [0.5, 1] }, 0.8); } },
        hint: '$\\mu = x$ y $F = x^2y^2 + ax^3$.',
        solution: function (v) { var C = v.b * v.b + v.a, y = Math.sqrt(C - v.a * 0.512) / 0.8; return '$$x^2y^2 + ' + v.a + 'x^3 = ' + C + ' \\;\\Rightarrow\\; y(0.8) = \\frac{\\sqrt{' + C + ' - ' + v.a + '(0.512)}}{0.8} \\approx ' + fx(y) + '$$'; }
      },
      {
        id: 'c3-s07-lineal', title: 'Concepto: las lineales',
        vars: {},
        prompt: function () { return '<p>Si escribes $y\' + P(x)\\,y = Q(x)$ como $(P\\,y - Q)\\,dx + dy = 0$, ¿qué factor integrante sale con la prueba de $\\mu(x)$?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: '$e^{\\int P\\,dx}$, el de la sesión 4', correct: true },
            { text: '$e^{-\\int P\\,dx}$', say: '$\\frac{M_y - N_x}{N} = \\frac{P - 0}{1} = P$, con signo positivo.' },
            { text: '$e^{\\int Q\\,dx}$', say: '$Q$ no tiene $y$, así que no aparece en $M_y$.' },
            { text: 'No tiene factor integrante', say: 'Sí lo tiene: es justo el método de las lineales.' }
          ];
        },
        answer: function () { return '$e^{\\int P\\,dx}$, el de la sesión 4'; },
        hint: 'Aquí $M = Py - Q$ y $N = 1$.',
        solution: function () { return '$M_y = P$, $N_x = 0$, así que $\\frac{M_y - N_x}{N} = P(x)$ y $\\mu = e^{\\int P\\,dx}$.'; }
      }
    ],

    quiz: { tags: ['c3.S07'], count: 8 },

    errors: [
      'Invertir el orden de la resta: para $\\mu(x)$ es $M_y - N_x$; para $\\mu(y)$, $N_x - M_y$.',
      'Dividir entre $M$ para $\\mu(x)$ (va entre $N$), o entre $N$ para $\\mu(y)$.',
      'Decidir que «tiene $y$» sin simplificar primero.',
      'Multiplicar solo $M$ (o solo $N$) por $\\mu$.',
      'Olvidar $h(y)$ al resolver la exacta que resulta.',
      'Integrar $\\frac{k}{x}$ como $kx$ en lugar de $k\\ln x$.'
    ],

    teacher: {
      plan: [
        'El mapa estirado: $\\mu$ no cambia las curvas, solo recupera $F$.',
        'Deducir la condición para $\\mu(x)$ en el pizarrón (regla del producto).',
        'Ejemplos 1 y 2; insistir en simplificar antes de decidir.',
        'Cerrar mostrando que el factor de las lineales es un caso particular, y el lab.'
      ],
      check: [
        'Que comprueben la exactitud después de multiplicar.',
        'Que escriban bien el orden de la resta en cada caso.'
      ],
      note: 'Los factores que dependen de $x$ y $y$ juntas se mencionan, pero no se trabajan.'
    },

    bibliography: [
      'MIT OpenCourseWare. <em>18.03SC Differential Equations</em> (Fall 2011), Unit I. <a href="https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/">ocw.mit.edu</a> (CC BY-NC-SA 4.0).',
      'Zill, D. G. <em>Ecuaciones diferenciales con aplicaciones de modelado</em>, 11.ª ed., Cengage, §2.4 (factores integrantes; lectura de apoyo).'
    ],

    prev: 'sesion-06',
    next: 'sesion-08'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
