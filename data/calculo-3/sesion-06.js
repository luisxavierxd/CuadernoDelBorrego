/* =====================================================================
   Cálculo 3 · S06 · Ecuaciones exactas: ∂M/∂y = ∂N/∂x y función potencial
   (bloque B · Primer orden II y orden n).
   Fuente: MIT OCW 18.03SC (CC BY-NC-SA 4.0) y OpenStax, Calculus Volume 3, §4.4 y §4.5
   (diferencial total y regla de la cadena), CC BY-NC-SA 4.0; el método sigue a Zill,
   Ecuaciones diferenciales con aplicaciones de modelado, 11.ª ed., §2.4 (solo lectura).
   Los ejemplos se comprueban con LabMath.ode (lab ode-compare, modo de exactas): ∂F/∂x = M
   y ∂F/∂y = N con derivadas simbólicas; los ejercicios numéricos usan RK4 como oráculo.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function sgn(n) { return n < 0 ? ' - ' + (-n) : ' + ' + n; }
  function co(c, s) { return (c === 1 ? '' : c === -1 ? '-' : c) + s; }

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
    name: '(2xy + 3) dx + (x² + 4y) dy = 0', tex: '(2xy + 3)\\,dx + (x^2 + 4y)\\,dy = 0,\\qquad y(1) = 1', kind: 'exact',
    M: '2x*y + 3', N: 'x^2 + 4y', x0: 1, ics: [1], domain: [0.3, 2.5], yRange: [-0.6, 2.5],
    solution: 'x^2*y + 3x + 2y^2', solutionTex: 'x^2y + 3x + 2y^2',
    hint: 'Integra $M$ respecto a $x$ (con $y$ fija): $x^2y + 3x + h(y)$. Luego deriva respecto a $y$ e iguala con $N$.',
    wrong: [
      { src: 'x^2*y + 3x', tex: 'x^2y+3x', key: 'missingH' },
      { src: '-(x^2*y + 3x + 2y^2)', tex: '-\\left(x^2y+3x+2y^2\\right)', key: 'sign' },
      { src: 'x^2*y + 2y^2', tex: 'x^2y+2y^2', key: 'residual' },
      { src: '2x*y^2 + 3x + x^2', tex: '2xy^2+3x+x^2', key: 'residual' }
    ]
  };
  var P_EXP = {
    name: '(eʸ + y cos x) dx + (x eʸ + sin x) dy = 0', tex: '(e^{y} + y\\cos x)\\,dx + (x e^{y} + \\sin x)\\,dy = 0,\\qquad y(1) = 0', kind: 'exact',
    M: 'e^y + y*cos(x)', N: 'x*e^y + sin(x)', x0: 1, ics: [0], domain: [0.3, 3], yRange: [-1.6, 1.6],
    solution: 'x*e^y + y*sin(x)', solutionTex: 'x e^{y} + y\\sin x',
    hint: '$\\int (e^y + y\\cos x)\\,dx = x e^y + y\\sin x + h(y)$.',
    wrong: [
      { src: 'x*e^y + y*cos(x)', tex: 'xe^{y}+y\\cos\\left(x\\right)', key: 'residual' },
      { src: '-(x*e^y + y*sin(x))', tex: '-\\left(xe^{y}+y\\sin\\left(x\\right)\\right)', key: 'sign' },
      { src: 'e^y + y*sin(x)', tex: 'e^{y}+y\\sin\\left(x\\right)', key: 'residual' }
    ]
  };
  var P_CUB = {
    name: '(3x² + 2y²) dx + (4xy + 6y²) dy = 0', tex: '(3x^2 + 2y^2)\\,dx + (4xy + 6y^2)\\,dy = 0,\\qquad y(1) = 1', kind: 'exact',
    M: '3x^2 + 2y^2', N: '4x*y + 6y^2', x0: 1, ics: [1], domain: [0.5, 1.6], yRange: [0, 2],
    solution: 'x^3 + 2x*y^2 + 2y^3', solutionTex: 'x^3 + 2xy^2 + 2y^3',
    hint: 'Después de integrar $M$ respecto a $x$, la parte $6y^2$ de $N$ todavía no aparece: esa es la que da $h(y)$.',
    wrong: [
      { src: 'x^3 + 2x*y^2', tex: 'x^3+2xy^2', key: 'missingH' },
      { src: 'x^3 + 2x*y^2 + 6y^3', tex: 'x^3+2xy^2+6y^3', key: 'missingH' },
      { src: '3x^2*y + 2y^3', tex: '3x^2y+2y^3', key: 'residual' }
    ]
  };
  var P_TRIG = {
    name: '2x cos y dx + (2y − x² sin y) dy = 0', tex: '2x\\cos y\\,dx + (2y - x^2\\sin y)\\,dy = 0,\\qquad y(0.5) = 1', kind: 'exact',
    M: '2x*cos(y)', N: '2y - x^2*sin(y)', x0: 0.5, ics: [1], domain: [0.2, 0.9], yRange: [0, 1.5],
    solution: 'x^2*cos(y) + y^2', solutionTex: 'x^2\\cos y + y^2',
    hint: '$\\int 2x\\cos y\\,dx = x^2\\cos y + h(y)$. Compara su derivada respecto a $y$ con $N$.',
    wrong: [
      { src: 'x^2*cos(y)', tex: 'x^2\\cos\\left(y\\right)', key: 'missingH' },
      { src: '-x^2*cos(y) - y^2', tex: '-x^2\\cos\\left(y\\right)-y^2', key: 'sign' },
      { src: 'x^2*sin(y) + y^2', tex: 'x^2\\sin\\left(y\\right)+y^2', key: 'residual' }
    ]
  };
  var P_LOG = {
    name: '(y/x + 6x) dx + (ln x − 2) dy = 0', tex: '\\left(\\frac{y}{x} + 6x\\right)dx + (\\ln x - 2)\\,dy = 0,\\qquad y(1) = 1', kind: 'exact',
    M: 'y/x + 6x', N: 'log(x) - 2', x0: 1, ics: [1], domain: [0.5, 2.5], yRange: [-1, 17],
    solution: 'y*log(x) + 3x^2 - 2y', solutionTex: 'y\\ln x + 3x^2 - 2y',
    hint: 'Aquí conviene empezar por $N$: $\\int (\\ln x - 2)\\,dy = y\\ln x - 2y + g(x)$.',
    wrong: [
      { src: 'y*log(x) - 2y', tex: 'y\\ln\\left(x\\right)-2y', key: 'residual' },
      { src: '-(y*log(x) + 3x^2 - 2y)', tex: '-\\left(y\\ln\\left(x\\right)+3x^2-2y\\right)', key: 'sign' },
      { src: 'y/x + 3x^2 - 2y', tex: '\\frac{y}{x}+3x^2-2y', key: 'residual' }
    ]
  };
  // Ejemplo con despeje explícito: (2x + y)dx + (x + 2y)dy = 0, y(1) = 1 → y(0) = √3.
  var P_ELL = { kind: 'exact', M: '2x + y', N: 'x + 2y', x0: 1, ics: [1], domain: [0, 1], yRange: [0, 2] };

  var data = window.SESSION_DATA = {
    slug: 'sesion-06', number: '06', group: 'B · Primer orden II y orden n',
    title: 'Ecuaciones exactas: ∂M/∂y = ∂N/∂x y función potencial', temario: [],
    minutes: 150,
    quote: 'Una ecuación exacta es la huella de una función: si caminas sin cambiar de altura en un mapa, estás sobre una curva de nivel.',
    badges: [
      'Escribir una EDO como $M\\,dx + N\\,dy = 0$ y probar si es exacta con $M_y = N_x$.',
      'Encontrar la función potencial $F(x, y)$ con $F_x = M$ y $F_y = N$.',
      'Dar la solución como $F(x, y) = C$ y fijar $C$ con la condición inicial.',
      'Despejar $y$ cuando se puede, y saber cuándo la respuesta implícita es suficiente.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Si $M\\,dx + N\\,dy$ es el diferencial total de una función $F(x, y)$, la ecuación $M\\,dx + N\\,dy = 0$ dice $dF = 0$: $F$ no cambia. Las soluciones son las curvas de nivel $F(x, y) = C$.',
        recall: [
          '<a href="../../../calculo-2/sesiones/sesion-04/">Derivadas parciales y el teorema de Clairaut</a> (Cálculo 2, S04): $f_{xy} = f_{yx}$.',
          'El <a href="../../../calculo-2/sesiones/sesion-05/">diferencial total</a> $dF = F_x\\,dx + F_y\\,dy$ (Cálculo 2, S05).',
          '<a href="../../../calculo-2/sesiones/sesion-01/">Curvas de nivel</a> (Cálculo 2, S01).'
        ],
        why: 'Muchas ecuaciones que no son separables ni lineales son exactas. Además, en física son la regla: si una fuerza tiene energía potencial, las trayectorias de energía constante salen justo así.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        diagram: 'c3s06-hill', caption: 'Sobre una curva de nivel F no cambia: eso dice F_x dx + F_y dy = 0.',
        body: [
          'Piensa en un mapa topográfico de un cerro. Si caminas por una curva de nivel, tu altura no cambia: cada paso $dx$ hacia el este y $dy$ hacia el norte suma un cambio de altura $F_x\\,dx + F_y\\,dy = 0$.',
          'Una ecuación exacta te da justo esa regla, $M\\,dx + N\\,dy = 0$, con $M = F_x$ y $N = F_y$. Lo que hay que hacer es reconstruir el cerro $F(x, y)$ a partir de sus pendientes. Una vez que lo tienes, cada solución es una curva de nivel.'
        ]
      },
      {
        type: 'concept', heading: 'Forma diferencial y exactitud', short: 'Exactitud',
        body: [
          'Toda ecuación de primer orden $\\dfrac{dy}{dx} = f(x, y)$ se puede escribir en <strong>forma diferencial</strong> $$M(x, y)\\,dx + N(x, y)\\,dy = 0$$ Por ejemplo, $y\' = -\\dfrac{2xy + 3}{x^2 + 4y}$ es $(2xy + 3)\\,dx + (x^2 + 4y)\\,dy = 0$.',
          'La ecuación es <strong>exacta</strong> si existe una función $F(x, y)$ (la <strong>función potencial</strong>) con $$\\frac{\\partial F}{\\partial x} = M \\qquad \\frac{\\partial F}{\\partial y} = N$$ Entonces la solución general es $F(x, y) = C$.',
          '<strong>Prueba de exactitud:</strong> si $M$ y $N$ tienen derivadas continuas en un rectángulo, la ecuación es exacta ahí si y solo si $$\\frac{\\partial M}{\\partial y} = \\frac{\\partial N}{\\partial x}$$ La razón es Clairaut: si $M = F_x$ y $N = F_y$, entonces $M_y = F_{xy} = F_{yx} = N_x$.'
        ]
      },
      {
        type: 'explainer', heading: 'Las soluciones son curvas de nivel', short: 'Curvas de nivel',
        title: 'La ecuación $(2x + y)\\,dx + (x + 2y)\\,dy = 0$',
        intro: 'Aquí $F = x^2 + xy + y^2$: $F_x = 2x + y = M$ y $F_y = x + 2y = N$.',
        diagram: 'c3s06-levels',
        steps: [
          { text: 'Cada elipse es una curva de nivel $F(x, y) = C$. Todas son soluciones de la ecuación.', state: { curves: 1, pick: 0, grad: 0 } },
          { text: 'La condición inicial $y(1) = 1$ elige una: $C = F(1, 1) = 3$. La solución es $x^2 + xy + y^2 = 3$, en forma implícita.', state: { curves: 1, pick: 1, grad: 0 } },
          { text: 'El vector $(M, N) = \\nabla F$ es perpendicular a la curva de nivel (<a href="../../../calculo-2/sesiones/sesion-08/">Cálculo 2, S08</a>). Por eso $M\\,dx + N\\,dy = \\nabla F\\cdot(dx, dy) = 0$ cuando te mueves sobre la curva.', state: { curves: 1, pick: 1, grad: 1 } }
        ]
      },
      {
        type: 'recipe', heading: 'Receta: ecuación exacta', short: 'Receta',
        steps: [
          { text: 'Escribe la ecuación como $M\\,dx + N\\,dy = 0$ e identifica $M$ (lo que multiplica a $dx$) y $N$ (lo que multiplica a $dy$).', tip: 'Si te la dan como $y\' = \\dots$, pasa todo de un lado: los signos importan.' },
          { text: 'Prueba: calcula $M_y$ y $N_x$. Si son iguales, es exacta. Si no, espera a la sesión 7 (factor integrante).' },
          { text: 'Integra $M$ respecto a $x$ con $y$ fija. En lugar de una constante, suma una función $h(y)$: $F = \\int M\\,dx + h(y)$.', tip: 'La «constante» de integrar respecto a $x$ puede depender de $y$. Olvidar $h(y)$ es el error más común.' },
          { text: 'Deriva ese $F$ respecto a $y$ e iguala con $N$. De ahí sale $h\'(y)$; intégrala para tener $h(y)$.' },
          { text: 'Escribe $F(x, y) = C$, usa la condición inicial para $C$ y, si se puede, despeja $y$.' }
        ]
      },
      {
        type: 'example', heading: 'Un polinomio',
        problem: '<p>Resuelve $(2xy + 3)\\,dx + (x^2 + 4y)\\,dy = 0$ con $y(1) = 1$.</p>',
        steps: [
          { text: 'Prueba de exactitud.', math: 'M_y = 2x \\qquad N_x = 2x \\quad\\checkmark' },
          { text: 'Integra $M$ respecto a $x$, con $y$ fija.', math: 'F = \\int (2xy + 3)\\,dx = x^2y + 3x + h(y)' },
          { text: 'Deriva respecto a $y$ e iguala con $N$.', math: "F_y = x^2 + h'(y) = x^2 + 4y \\;\\Rightarrow\\; h'(y) = 4y \\;\\Rightarrow\\; h(y) = 2y^2" },
          { text: 'La solución general es $F = C$. Con $(1, 1)$: $1 + 3 + 2 = 6$.', math: 'x^2y + 3x + 2y^2 = 6' }
        ],
        answer: '$x^2y + 3x + 2y^2 = 6$ (implícita). Si olvidas $h(y)$ y escribes $F = x^2y + 3x$, el lab te dice que $\\partial F/\\partial y$ no da $N$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isPotential', math: true, args: [P_POLY, 'x^2*y + 3x + 2y^2'], value: 1 }
      },
      {
        type: 'example', heading: 'Con exponencial y trigonométricas',
        problem: '<p>Resuelve $(e^{y} + y\\cos x)\\,dx + (x e^{y} + \\sin x)\\,dy = 0$.</p>',
        steps: [
          { text: 'Prueba.', math: 'M_y = e^y + \\cos x \\qquad N_x = e^y + \\cos x \\quad\\checkmark' },
          { text: 'Integra $M$ respecto a $x$: $e^y$ es constante y $\\int y\\cos x\\,dx = y\\sin x$.', math: 'F = x e^y + y\\sin x + h(y)' },
          { text: 'Deriva respecto a $y$: $F_y = x e^y + \\sin x + h\'(y)$, que ya es $N$.', math: "h'(y) = 0 \\;\\Rightarrow\\; h = \\text{constante}" }
        ],
        answer: '$x e^{y} + y\\sin x = C$. A veces $h(y)$ es una constante y no agrega nada: aun así hay que comprobarlo.',
        verify: { lab: 'call', mod: 'ode', fn: 'isPotential', math: true, args: [P_EXP, 'x*e^y + y*sin(x)'], value: 1 }
      },
      {
        type: 'example', heading: 'Cuándo no es exacta',
        problem: '<p>¿Es exacta $(3y + x)\\,dx + (x - y)\\,dy = 0$?</p>',
        steps: [
          { text: 'Calcula las dos parciales cruzadas.', math: 'M_y = 3 \\qquad N_x = 1' },
          { text: 'Son distintas: no existe $F$ con $F_x = M$ y $F_y = N$. Si intentas el método, al final $h\'(y)$ te sale dependiendo de $x$, lo cual es imposible.' }
        ],
        answer: 'No es exacta. En la sesión 7 verás cómo multiplicar por un factor $\\mu$ para volverla exacta cuando se puede.',
        verify: { lab: 'call', mod: 'ode', fn: 'isExactEq', math: true, args: [{ kind: 'exact', M: '3y + x', N: 'x - y', x0: 1, ics: [3], domain: [0, 2], yRange: [2, 4] }], value: 0 }
      },
      {
        type: 'example', heading: 'De la implícita a la explícita',
        diagram: 'c3s06-implicit',
        problem: '<p>Resuelve $(2x + y)\\,dx + (x + 2y)\\,dy = 0$ con $y(1) = 1$ y calcula $y(0)$.</p>',
        steps: [
          { text: '$M_y = 1 = N_x$. Integrando: $F = x^2 + xy + h(y)$ y $F_y = x + h\'(y) = x + 2y$, así que $h = y^2$.', math: 'x^2 + xy + y^2 = C, \\qquad C = 1 + 1 + 1 = 3' },
          { text: 'Es cuadrática en $y$: $y^2 + xy + (x^2 - 3) = 0$.', math: 'y = \\frac{-x \\pm \\sqrt{12 - 3x^2}}{2}' },
          { text: 'En $x = 1$ debe dar $1$: con el signo $+$ sale $\\frac{-1 + 3}{2} = 1$. Evalúa en $0$.', math: 'y(0) = \\frac{\\sqrt{12}}{2} = \\sqrt{3} \\approx ' + fx(Math.sqrt(3)) }
        ],
        answer: '$y(0) = \\sqrt{3} \\approx ' + fx(Math.sqrt(3)) + '$. La solución explícita vale mientras $12 - 3x^2 > 0$; ahí la curva tiene tangente vertical ($N = 0$).',
        verify: { lab: 'call', mod: 'ode', fn: 'solveAt', math: true, args: [P_ELL, 0], value: Math.sqrt(3) }
      },
      {
        type: 'callout', heading: 'También puedes empezar por N',
        body: [
          'Si $\\int M\\,dx$ es difícil y $\\int N\\,dy$ es fácil, empieza al revés: $F = \\int N\\,dy + g(x)$ y luego compara $F_x$ con $M$. En $\\left(\\frac{y}{x} + 6x\\right)dx + (\\ln x - 2)\\,dy = 0$, integrar $N$ respecto a $y$ da $y\\ln x - 2y + g(x)$ en un renglón. Es el problema 5 del lab.'
        ]
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué la constante de integrar respecto a $x$ es $h(y)$?', a: 'Porque al derivar respecto a $x$, cualquier función que solo dependa de $y$ se va a cero, igual que una constante. Así que al integrar respecto a $x$ no puedes saber si había una: la escribes como $h(y)$ y la recuperas comparando con $N$.' },
          { q: '¿Y si $h\'(y)$ me queda con $x$?', a: 'Entonces te equivocaste en alguna cuenta, o la ecuación no es exacta. Si $M_y = N_x$, la $x$ siempre se cancela.' },
          { q: '¿Tengo que despejar $y$?', a: 'No necesariamente. $F(x, y) = C$ es una solución válida (implícita). Despeja solo si se puede y te lo piden, o si necesitas evaluar $y$ en un punto.' },
          { q: '¿$F$ y $-F$ dan lo mismo?', a: 'Dan las mismas curvas de nivel, pero $-F$ no es una función potencial de $M\\,dx + N\\,dy$ (su derivada respecto a $x$ es $-M$). Si te sale $-F$, revisa un signo.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          '$M\\,dx + N\\,dy = 0$ es exacta si $M_y = N_x$.',
          'La función potencial cumple $F_x = M$, $F_y = N$; se encuentra integrando $M$ y agregando $h(y)$.',
          'La solución general es $F(x, y) = C$: las curvas de nivel de $F$.',
          'La condición inicial da $C = F(x_0, y_0)$.'
        ]
      }
    ],

    lab: {
      type: 'ode-compare', title: 'Reconstruye la función potencial',
      intro: 'Escribe tu $F(x, y)$, sin la constante. El lab comprueba que $\\partial F/\\partial x = M$ y $\\partial F/\\partial y = N$, dibuja tus curvas $F = C$ y la que pasa por el punto inicial, y la compara con la solución numérica. Detecta si olvidaste $h(y)$ o si tu $F$ salió con el signo al revés.',
      cfg: { start: 0, problems: [P_POLY, P_EXP, P_CUB, P_TRIG, P_LOG] }
    },

    formulas: [
      { label: 'Forma diferencial', tex: 'M(x, y)\\,dx + N(x, y)\\,dy = 0' },
      { label: 'Prueba de exactitud', tex: '\\frac{\\partial M}{\\partial y} = \\frac{\\partial N}{\\partial x}' },
      { label: 'Función potencial', tex: 'F_x = M,\\quad F_y = N,\\quad F = \\int M\\,dx + h(y)' },
      { label: 'Solución', tex: 'F(x, y) = C' }
    ],

    exercises: [
      {
        id: 'c3-s06-esexacta', title: '¿Es exacta?',
        vars: { k: [0, 4, 1] },
        prompt: function (v) {
          var eqs = ['(2xy^3 + 1)\\,dx + (3x^2y^2 - 2)\\,dy = 0', '(y\\cos x + 2x)\\,dx + (\\sin x + 1)\\,dy = 0', '(x + y)\\,dx + (x - y)\\,dy = 0', '(3x^2 + y)\\,dx + (2x + y)\\,dy = 0', '(e^{x}y)\\,dx + (e^{x} + 2y)\\,dy = 0'];
          return '<p>¿Es exacta la ecuación $' + eqs[v.k] + '$?</p>';
        },
        check: 'choice',
        options: function (v) {
          var yes = [true, true, true, false, true][v.k];
          var why = ['', '', '', '$M_y = 1$ pero $N_x = 2$.', ''][v.k];
          return [
            { text: 'Sí', correct: yes, say: yes ? null : why },
            { text: 'No', correct: !yes, say: yes ? 'Calcula $M_y$ y $N_x$: son iguales.' : null }
          ];
        },
        answer: function (v) { return [true, true, true, false, true][v.k] ? 'Sí' : 'No'; },
        hint: 'Deriva $M$ respecto a $y$ y $N$ respecto a $x$.',
        solution: function (v) { return ['$M_y = 6xy^2 = N_x$: sí.', '$M_y = \\cos x = N_x$: sí.', '$M_y = 1 = N_x$: sí.', '$M_y = 1$, $N_x = 2$: no.', '$M_y = e^x = N_x$: sí.'][v.k]; }
      },
      {
        id: 'c3-s06-k', title: 'El valor que la vuelve exacta',
        vars: { a: [1, 5, 1], b: [2, 6, 1] },
        prompt: function (v) { return '<p>¿Para qué valor de $k$ es exacta $(k\\,x^2y + e^{y})\\,dx + (' + co(v.a, 'x^3') + ' + x e^{y}' + sgn(v.b) + ')\\,dy = 0$?</p>'; },
        check: 'numeric',
        answer: function (v) { return 3 * v.a; },
        mistakes: {
          noPower: function (v) { return v.a; },
          divided: function (v) { return v.a / 3; }
        },
        where: function (v) { return v.a !== 3; },
        feedback: [
          { when: 'noPower', say: 'Deriva $N$ respecto a $x$: $\\frac{\\partial}{\\partial x}(ax^3) = 3ax^2$.' },
          { when: 'divided', say: 'Iguala $M_y = kx^2 + e^y$ con $N_x = 3ax^2 + e^y$: $k = 3a$.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          // Busca la k que anula M_y − N_x en un punto, con diferencias finitas.
          var h = 1e-5, x = 1.3, y = 0.7;
          var gap = function (k) {
            var M = function (yy) { return k * x * x * yy + Math.exp(yy); }, N = function (xx) { return v.a * xx * xx * xx + xx * Math.exp(y) + v.b; };
            return (M(y + h) - M(y - h)) / (2 * h) - (N(x + h) - N(x - h)) / (2 * h);
          };
          var lo = -100, hi = 100;
          for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; if (gap(m) < 0) lo = m; else hi = m; }
          return (lo + hi) / 2;
        } },
        hint: 'Exacta significa $M_y = N_x$.',
        solution: function (v) { return '$$M_y = kx^2 + e^y, \\qquad N_x = ' + (3 * v.a) + 'x^2 + e^y \\;\\Rightarrow\\; k = ' + (3 * v.a) + '$$'; }
      },
      {
        id: 'c3-s06-potencial', title: 'La función potencial',
        vars: { a: [1, 4, 1], b: [-5, 5, 1], c: [1, 4, 1] },
        where: function (v) { return v.b !== 0; },
        prompt: function (v) { return '<p>La ecuación $(' + (2 * v.a) + 'xy' + sgn(v.b) + ')\\,dx + (' + co(v.a, 'x^2') + ' + ' + (2 * v.c) + 'y)\\,dy = 0$ es exacta. Encuentra su función potencial $F(x, y)$ con $F(0, 0) = 0$.</p>'; },
        check: 'expr', exprVars: ['x', 'y'], domain: { x: [-1.5, 1.5], y: [-1.5, 1.5] },
        answer: function (v) { return v.a + '*x^2*y + ' + v.b + '*x + ' + v.c + '*y^2'; },
        mistakes: {
          missingH: function (v) { return v.a + '*x^2*y + ' + v.b + '*x'; },
          doubled: function (v) { return (2 * v.a) + '*x^2*y + ' + v.b + '*x + ' + v.c + '*y^2'; },
          noHalf: function (v) { return v.a + '*x^2*y + ' + v.b + '*x + ' + (2 * v.c) + '*y^2'; }
        },
        feedback: [
          { when: 'missingH', say: 'Falta $h(y)$: deriva tu $F$ respecto a $y$ y compárala con $N$; sobra un término que solo tiene $y$.' },
          { when: 'doubled', say: 'Contaste dos veces el término $x^2y$ (salió al integrar $M$ y otra vez al integrar $N$). Solo va una vez.' },
          { when: 'noHalf', say: 'Al integrar $' + '2cy$ respecto a $y$ sale $cy^2$: falta dividir entre 2.' }
        ],
        hint: 'Integra $M$ respecto a $x$ y agrega $h(y)$. Compara $F_y$ con $N$.',
        solution: function (v) { return '$$F = \\int (' + (2 * v.a) + 'xy' + sgn(v.b) + ')\\,dx = ' + co(v.a, 'x^2y') + sgn(v.b) + 'x + h(y), \\quad F_y = ' + co(v.a, 'x^2') + " + h'(y) = N \\Rightarrow h = " + co(v.c, 'y^2') + '$$'; }
      },
      {
        id: 'c3-s06-constante', title: 'La constante de la solución',
        vars: { p: [-3, 3, 1], q: [-3, 3, 1] },
        where: function (v) { return v.p !== 0 && v.q !== 0; },
        prompt: function (v) { return '<p>La solución general de $(2xy + 3)\\,dx + (x^2 + 4y)\\,dy = 0$ es $x^2y + 3x + 2y^2 = C$. ¿Cuánto vale $C$ para la solución que pasa por $(' + v.p + ', ' + v.q + ')$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.p * v.p * v.q + 3 * v.p + 2 * v.q * v.q; },
        mistakes: {
          swapped: function (v) { return v.q * v.q * v.p + 3 * v.q + 2 * v.p * v.p; },
          noH: function (v) { return v.p * v.p * v.q + 3 * v.p; }
        },
        feedback: [
          { when: 'swapped', say: 'Intercambiaste las coordenadas: $x = ' + 'p$ y $y = q$.' },
          { when: 'noH', say: 'Te faltó el término $2y^2$ de la función potencial.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          // F se reconstruye integrando M dx + N dy desde (0, 0) por la recta, sin la fórmula cerrada
          // (Simpson: el integrando es cúbico en t, así que la regla es exacta).
          var n = 20, g = function (t) { var x = v.p * t, y = v.q * t; return (2 * x * y + 3) * v.p + (x * x + 4 * y) * v.q; }, s = g(0) + g(1);
          for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * g(i / n);
          return s / (3 * n);
        } },
        hint: 'Sustituye el punto en $F(x, y)$.',
        solution: function (v) { var C = v.p * v.p * v.q + 3 * v.p + 2 * v.q * v.q; return '$$C = (' + v.p + ')^2(' + v.q + ') + 3(' + v.p + ') + 2(' + v.q + ')^2 = ' + C + '$$'; }
      },
      {
        id: 'c3-s06-explicita', title: 'Despejar y evaluar',
        vars: { p: [1, 3, 1], q: [1, 3, 1] },
        prompt: function (v) { return '<p>Resuelve $(2x + y)\\,dx + (x + 2y)\\,dy = 0$ con $y(' + v.p + ') = ' + v.q + '$ y calcula $y(0)$.</p>'; },
        check: 'numeric',
        answer: function (v) { return Math.sqrt(v.p * v.p + v.p * v.q + v.q * v.q); },
        mistakes: {
          noRoot: function (v) { return v.p * v.p + v.p * v.q + v.q * v.q; },
          noCross: function (v) { return Math.sqrt(v.p * v.p + v.q * v.q); }
        },
        feedback: [
          { when: 'noRoot', say: 'Ese es $C$ (o $y^2$). En $x = 0$ queda $y^2 = C$: saca raíz.' },
          { when: 'noCross', say: 'La función potencial tiene el término cruzado $xy$: $F = x^2 + xy + y^2$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return rk({ kind: 'exact', M: '2x + y', N: 'x + 2y', x0: v.p, ics: [v.q], domain: [0, 3] }, 0); } },
        hint: '$F = x^2 + xy + y^2$. Fija $C$ con el punto y luego pon $x = 0$.',
        solution: function (v) { var C = v.p * v.p + v.p * v.q + v.q * v.q; return '$$C = ' + v.p + '^2 + ' + v.p + '\\cdot' + v.q + ' + ' + v.q + '^2 = ' + C + ', \\qquad y(0)^2 = ' + C + ' \\;\\Rightarrow\\; y(0) = \\sqrt{' + C + '} \\approx ' + fx(Math.sqrt(C)) + '$$ (raíz positiva porque la solución empieza con $y > 0$).'; }
      },
      {
        id: 'c3-s06-por-que', title: 'Concepto: por qué F = C',
        vars: {},
        prompt: function () { return '<p>Si $F_x = M$ y $F_y = N$, ¿por qué las curvas $F(x, y) = C$ son soluciones de $M\\,dx + N\\,dy = 0$?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Porque sobre la curva $dF = F_x\\,dx + F_y\\,dy = 0$', correct: true },
            { text: 'Porque $M$ y $N$ son constantes', say: 'No tienen por qué serlo; dependen de $x$ y $y$.' },
            { text: 'Porque $M_y = N_x$', say: 'Esa es la prueba de que $F$ existe, no la razón de que $F = C$ resuelva la ecuación.' },
            { text: 'Porque $F$ es lineal en $y$', say: 'En general no lo es (por ejemplo $x^2 + xy + y^2$).' }
          ];
        },
        answer: function () { return 'Porque sobre la curva $dF = F_x\\,dx + F_y\\,dy = 0$'; },
        hint: 'Piensa en el diferencial total.',
        solution: function () { return 'Sobre una curva de nivel $F$ no cambia, así que $dF = M\\,dx + N\\,dy = 0$: es justo la ecuación.'; }
      }
    ],

    quiz: { tags: ['c3.S06'], count: 8 },

    errors: [
      'Olvidar $h(y)$ al integrar $M$ respecto a $x$.',
      'Sumar los resultados de integrar $M$ y $N$, contando dos veces los términos mixtos.',
      'Confundir $M$ con $N$ (o equivocar un signo al pasar de $y\'$ a la forma diferencial).',
      'Probar exactitud con $M_x = N_y$ en lugar de $M_y = N_x$.',
      'Dar $F$ como respuesta sin igualar a $C$ ni usar la condición inicial.',
      'Despejar $y$ con el signo de la raíz que no cumple la condición inicial.'
    ],

    teacher: {
      plan: [
        'Mapa topográfico: caminar sin cambiar de altura es $dF = 0$.',
        'Prueba de exactitud con Clairaut y la receta en el pizarrón.',
        'Ejemplo 1 completo, insistiendo en $h(y)$; luego el que no es exacto.',
        'Lab: cargar $x^2y + 3x$ y ver el aviso de $h(y)$; comparar las curvas de nivel con la numérica.'
      ],
      check: [
        'Que hagan la prueba $M_y = N_x$ antes de integrar.',
        'Que comprueben su $F$ derivándola respecto a $x$ y respecto a $y$.'
      ],
      note: 'Los factores integrantes que vuelven exacta una ecuación van en la sesión 7.'
    },

    bibliography: [
      'MIT OpenCourseWare. <em>18.03SC Differential Equations</em> (Fall 2011), Unit I. <a href="https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/">ocw.mit.edu</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 3</em>, §4.4 “Tangent Planes and Linear Approximations” (diferencial total) y §4.6 “Directional Derivatives and the Gradient”. <a href="https://openstax.org/books/calculus-volume-3/pages/4-4-tangent-planes-and-linear-approximations">openstax.org</a> (CC BY-NC-SA 4.0).',
      'Zill, D. G. <em>Ecuaciones diferenciales con aplicaciones de modelado</em>, 11.ª ed., Cengage, §2.4 “Ecuaciones exactas” (lectura de apoyo).'
    ],

    prev: 'sesion-05',
    next: 'sesion-07'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
