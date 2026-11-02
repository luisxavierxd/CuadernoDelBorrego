/* =====================================================================
   Cálculo 3 · S04 · Lineales de primer orden: factor integrante
   (bloque A · Primer orden I).
   Fuente: OpenStax, Calculus Volume 2, §4.5 “First-order Linear Equations”, CC BY-NC-SA 4.0.
   Los ejemplos se comprueban con LabMath.ode (lab ode-compare); los ejercicios
   numéricos usan la integral numérica (RK4) como oráculo.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function sgn(n) { return n < 0 ? ' - ' + (-n) : ' + ' + n; }

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

  // Ejemplo del tanque: 200 L con 20 g de sal; entra salmuera a 0.5 g/L, 4 L/min; sale igual.
  var tank = { V: 200, A0: 20, cin: 0.5, r: 4 };
  tank.Ainf = tank.V * tank.cin;
  tank.k = tank.r / tank.V;
  tank.A30 = tank.Ainf + (tank.A0 - tank.Ainf) * Math.exp(-tank.k * 30);
  // Ejemplo RC: R = 2 kΩ, C = 3 μF, ε = 12 V (t en ms, q en μC).
  var rc = { R: 2, Cap: 3, E: 12 };
  rc.tau = rc.R * rc.Cap;
  rc.q10 = rc.Cap * rc.E * (1 - Math.exp(-10 / rc.tau));

  var P_TANK = {
    name: 'Tanque de mezclas', tex: "A' = r\\,c_{in} - \\frac{r}{V}A,\\qquad A(0) = A_0", iv: 't', dv: 'A', order: 1,
    rhs: 'r*cin - r*y/V',
    params: {
      r: { value: 4, min: 1, max: 12, step: 0.5, label: 'Razón de entrada y salida r', unit: 'L/min' },
      cin: { value: 0.5, min: 0, max: 1.5, step: 0.05, label: 'Concentración que entra cᵢₙ', unit: 'g/L' },
      A0: { value: 20, min: 0, max: 200, step: 5, label: 'Sal inicial A₀', unit: 'g' },
      V: { value: 200 }
    },
    x0: 0, ics: ['A0'], domain: [0, 200], yRange: [0, 320], scene: 'tank',
    solution: 'V*cin + (A0 - V*cin)*e^(-r*t/V)', solutionTex: 'V c_{in} + (A_0 - V c_{in})\\,e^{-rt/V}',
    hint: 'Forma estándar: $A\' + \\frac{r}{V}A = r\\,c_{in}$, con factor integrante $e^{rt/V}$. Usa las letras $r$, $c_{in}$, $A_0$ y $V$ (aquí $V = 200$) para que siga valiendo con los deslizadores.',
    wrong: [
      { src: 'V*cin + A0*e^(-r*t/V)', tex: 'Vc_{in}+A_0e^{-\\frac{rt}{V}}', key: 'ic' },
      { src: 'V*cin*(1 - e^(-r*t/V))', tex: 'Vc_{in}\\left(1-e^{-\\frac{rt}{V}}\\right)', key: 'ic' },
      { src: 'V*cin + (A0 - V*cin)*e^(r*t/V)', tex: 'Vc_{in}+\\left(A_0-Vc_{in}\\right)e^{\\frac{rt}{V}}', key: 'residual' },
      { src: 'cin + (A0 - cin)*e^(-r*t/V)', tex: 'c_{in}+\\left(A_0-c_{in}\\right)e^{-\\frac{rt}{V}}', key: 'residual' }
    ]
  };
  var P_EXP = {
    name: 'y′ + 2y = e^(−x) con y(0) = 2', tex: "y' + 2y = e^{-x},\\qquad y(0) = 2", iv: 'x', dv: 'y', order: 1,
    rhs: 'e^(-x) - 2y', x0: 0, ics: [2], domain: [-0.5, 4], field: true,
    solution: 'e^(-x) + e^(-2x)', solutionTex: 'e^{-x} + e^{-2x}',
    hint: 'Factor integrante $\\mu = e^{2x}$: $(e^{2x}y)\' = e^{x}$.',
    wrong: [
      { src: 'e^(-x) + 2e^(-2x)', tex: 'e^{-x}+2e^{-2x}', key: 'ic' },
      { src: 'e^(-x) + e^(2x)', tex: 'e^{-x}+e^{2x}', key: 'residual' },
      { src: 'x*e^(-2x) + 2e^(-2x)', tex: 'xe^{-2x}+2e^{-2x}', key: 'residual' }
    ]
  };
  var P_X = {
    name: 'y′ + y/x = x² con y(1) = 1', tex: "y' + \\frac{y}{x} = x^2,\\qquad y(1) = 1", iv: 'x', dv: 'y', order: 1,
    rhs: 'x^2 - y/x', x0: 1, ics: [1], domain: [0.4, 2.5], yRange: [0, 5], field: true,
    solution: 'x^3/4 + 3/(4x)', solutionTex: '\\dfrac{x^3}{4} + \\dfrac{3}{4x}',
    hint: 'Factor integrante $\\mu = e^{\\int dx/x} = x$: $(xy)\' = x^3$.',
    wrong: [
      { src: 'x^3/4 + 3/4', tex: '\\frac{x^3}{4}+\\frac{3}{4}', key: 'residual' },
      { src: 'x^3/4 + 1/(4x)', tex: '\\frac{x^3}{4}+\\frac{1}{4x}', key: 'ic' },
      { src: 'x^3/3 + 2/(3x)', tex: '\\frac{x^3}{3}+\\frac{2}{3x}', key: 'residual' }
    ]
  };
  var P_SIN = {
    name: 'xy′ + 2y = cos(x)/x con y(π) = 0', tex: "x\\,y' + 2y = \\frac{\\cos x}{x},\\qquad y(\\pi) = 0", iv: 'x', dv: 'y', order: 1,
    rhs: '(cos(x)/x - 2y)/x', x0: Math.PI, ics: [0], domain: [1, 8], yRange: [-0.4, 0.9], field: true,
    solution: 'sin(x)/x^2', solutionTex: '\\dfrac{\\sin x}{x^2}',
    hint: 'Primero divide entre $x$ para la forma estándar: $P = 2/x$ y $\\mu = x^2$.',
    wrong: [
      { src: 'sin(x)/x', tex: '\\frac{\\sin\\left(x\\right)}{x}', key: 'residual' },
      { src: 'cos(x)/x^2', tex: '\\frac{\\cos\\left(x\\right)}{x^2}', key: 'residual' },
      { src: '(sin(x) + 1)/x^2', tex: '\\frac{\\sin\\left(x\\right)+1}{x^2}', key: 'ic' }
    ]
  };
  var P_RC = {
    name: 'Circuito RC cargándose', tex: "R\\,q' + \\frac{q}{C} = \\varepsilon,\\qquad q(0) = 0", iv: 't', dv: 'q', order: 1,
    rhs: 'E/R - y/(R*C)', alias: { epsilon: 'E' },
    params: {
      R: { value: 2, min: 0.5, max: 6, step: 0.1, label: 'Resistencia R', unit: 'kΩ' },
      C: { value: 3, min: 0.5, max: 6, step: 0.1, label: 'Capacitancia C', unit: 'μF' },
      E: { value: 12, min: 1, max: 24, step: 1, label: 'fem ε', unit: 'V' }
    },
    x0: 0, ics: [0], domain: [0, 40], yRange: [0, 150],
    solution: 'C*E*(1 - e^(-t/(R*C)))', solutionTex: 'C\\varepsilon\\left(1 - e^{-t/RC}\\right)',
    hint: 'Tiempo en ms y carga en μC. Usa las letras $R$, $C$ y $\\varepsilon$ para que tu fórmula siga valiendo al mover los deslizadores.',
    wrong: [
      { src: 'C*E*e^(-t/(R*C))', tex: 'C\\varepsilon e^{-\\frac{t}{RC}}', key: 'residual' },
      { src: 'E/R*(1 - e^(-t/(R*C)))', tex: '\\frac{\\varepsilon}{R}\\left(1-e^{-\\frac{t}{RC}}\\right)', key: 'residual' },
      { src: 'C*E*(1 - e^(-t*R*C))', tex: 'C\\varepsilon\\left(1-e^{-tRC}\\right)', key: 'residual' },
      { src: 'C*E*(1 + e^(-t/(R*C)))', tex: 'C\\varepsilon\\left(1+e^{-\\frac{t}{RC}}\\right)', key: 'ic' }
    ]
  };

  var data = window.SESSION_DATA = {
    slug: 'sesion-04', number: '04', group: 'A · Primer orden I',
    title: 'Lineales de primer orden: factor integrante', temario: [],
    minutes: 150,
    quote: 'El factor integrante es un truco de magia con explicación: multiplicas por la función justa y el lado izquierdo se vuelve la derivada de un producto.',
    badges: [
      'Escribir una lineal en forma estándar $y\' + P(x)\\,y = Q(x)$.',
      'Calcular el factor integrante $\\mu = e^{\\int P\\,dx}$ y resolver.',
      'Modelar un tanque de mezclas y un circuito RC.',
      'Separar la solución en estado estacionario y transitorio.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Si la ecuación es <strong>lineal</strong>, $y\' + P(x)\\,y = Q(x)$, multiplícala por $\\mu = e^{\\int P\\,dx}$: el lado izquierdo se vuelve $(\\mu y)\'$ y basta integrar.',
        recall: [
          'Qué es una ecuación lineal (<a href="../sesion-01/">S01 de este curso</a>).',
          'La <a href="../../../calculo-1/sesiones/sesion-03/">regla del producto</a> (Cálculo 1, S03), leída al revés: $(\\mu y)\' = \\mu y\' + \\mu\' y$.',
          'Integrales con exponenciales y <a href="../../../calculo-1/sesiones/sesion-11/">por partes</a> (Cálculo 1, S11).'
        ],
        why: 'Las lineales aparecen en todos lados: la sal en un tanque, la carga de un capacitor (<a href="../../../fisica-2/sesiones/sesion-15/">Física 2, S15</a>), la corriente de un circuito RL, un cuerpo que cae con resistencia del aire. Y, a diferencia de las separables, el método funciona <strong>siempre</strong>.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        diagram: 'c3s04-tub', caption: 'Al principio entra más de lo que sale; el nivel sube hasta que se igualan.',
        body: [
          'Una tina se llena con la llave abierta y al mismo tiempo se vacía por la coladera, más rápido entre más agua tiene. Lo que entra es fijo; lo que sale es proporcional a lo que hay. Al final se equilibra en un nivel donde lo que entra iguala a lo que sale.',
          'Eso es una ecuación lineal: $y\' = (\\text{entra}) - k\\,y$. Ya no se puede separar como en S02 si lo que entra depende del tiempo, pero hay un truco que siempre funciona: multiplicar por el factor justo para que el lado izquierdo sea la derivada de un producto.'
        ]
      },
      {
        type: 'concept', heading: 'La forma estándar', short: 'Forma estándar',
        body: [
          'Toda lineal de primer orden se puede escribir en <strong>forma estándar</strong>: $$y\' + P(x)\\,y = Q(x)$$ con coeficiente $1$ en $y\'$. Si te la dan como $a(x)\\,y\' + b(x)\\,y = c(x)$, divide todo entre $a(x)$: $P = b/a$ y $Q = c/a$.',
          'Ejemplo: $x\\,y\' - 2y = x^3$ se vuelve $y\' - \\frac{2}{x}y = x^2$, así que $P = -\\frac{2}{x}$ (no $-2$) y $Q = x^2$.'
        ]
      },
      {
        type: 'concept', heading: 'De dónde sale el factor integrante', short: 'Factor integrante',
        body: [
          'Busca una función $\\mu(x)$ tal que, al multiplicar la ecuación por ella, el lado izquierdo $\\mu y\' + \\mu P y$ sea la derivada del producto $(\\mu y)\' = \\mu y\' + \\mu\' y$. Para eso necesitas $\\mu\' = \\mu P$, una separable: $$\\mu(x) = e^{\\int P(x)\\,dx}$$ (sin constante: cualquier $\\mu$ sirve, así que tomas la más simple).',
          'Con ese $\\mu$, la ecuación queda $(\\mu y)\' = \\mu Q$. Integra los dos lados y despeja: $$y = \\frac{1}{\\mu(x)}\\left(\\int \\mu(x)\\,Q(x)\\,dx + C\\right)$$'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: lineal de primer orden', short: 'Receta',
        steps: [
          { text: 'Escribe la ecuación en forma estándar $y\' + P(x)\\,y = Q(x)$.', tip: 'Si $y\'$ tiene coeficiente, divide entre él antes de leer $P$. Es el error que más cuesta.' },
          { text: 'Calcula $\\mu = e^{\\int P\\,dx}$ y simplifica: $e^{\\ln x} = x$, $e^{2\\ln x} = x^2$, $e^{-\\ln x} = 1/x$.', tip: 'El signo de $P$ va en el exponente: si $P = -2/x$, $\\mu = x^{-2}$, no $x^2$.' },
          { text: 'Multiplica todo por $\\mu$: el lado izquierdo es $(\\mu y)\'$. Escríbelo así.' },
          { text: 'Integra: $\\mu y = \\int \\mu Q\\,dx + C$. Pon la $C$ <strong>antes</strong> de despejar.', tip: 'Al dividir entre $\\mu$, la $C$ también se divide: queda $C/\\mu$, no $C$ sola.' },
          { text: 'Despeja $y$, aplica la condición inicial y comprueba sustituyendo.' }
        ]
      },
      {
        type: 'example', heading: 'Coeficientes constantes',
        problem: '<p>Resuelve $y\' + 2y = e^{-x}$ con $y(0) = 2$.</p>',
        steps: [
          { text: 'Ya está en forma estándar con $P = 2$. El factor integrante:', math: '\\mu = e^{\\int 2\\,dx} = e^{2x}' },
          { text: 'Multiplica: el lado izquierdo es la derivada de $e^{2x}y$.', math: "(e^{2x}y)' = e^{2x}e^{-x} = e^{x}" },
          { text: 'Integra y despeja.', math: 'e^{2x}y = e^{x} + C \\;\\Rightarrow\\; y = e^{-x} + Ce^{-2x}' },
          { text: 'Con $y(0) = 2$: $1 + C = 2$, $C = 1$.', math: 'y = e^{-x} + e^{-2x}' }
        ],
        answer: '$y = e^{-x} + e^{-2x}$. Comprueba: $y\' + 2y = (-e^{-x} - 2e^{-2x}) + (2e^{-x} + 2e^{-2x}) = e^{-x}$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_EXP, 'e^(-x) + e^(-2x)'], value: 1 }
      },
      {
        type: 'example', heading: 'Con P(x) = 1/x',
        problem: '<p>Resuelve $y\' + \\dfrac{y}{x} = x^2$ con $y(1) = 1$, para $x > 0$.</p>',
        steps: [
          { text: '$P = 1/x$, así que $\\int P\\,dx = \\ln x$ y $\\mu = e^{\\ln x} = x$.', math: "(x\\,y)' = x\\cdot x^2 = x^3" },
          { text: 'Integra.', math: 'x\\,y = \\frac{x^4}{4} + C' },
          { text: 'Despeja: la $C$ también se divide entre $x$.', math: 'y = \\frac{x^3}{4} + \\frac{C}{x}' },
          { text: 'Con $y(1) = 1$: $\\frac{1}{4} + C = 1$, $C = \\frac{3}{4}$.', math: 'y = \\frac{x^3}{4} + \\frac{3}{4x}' }
        ],
        answer: '$y = \\dfrac{x^3}{4} + \\dfrac{3}{4x}$. Si escribes $\\frac{x^3}{4} + \\frac{3}{4}$ (olvidando dividir la $C$), el lab muestra que el residuo no es cero.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_X, 'x^3/4 + 3/(4x)'], value: 1 }
      },
      {
        type: 'example', heading: 'Primero la forma estándar',
        problem: '<p>Resuelve $x\\,y\' + 2y = \\dfrac{\\cos x}{x}$ con $y(\\pi) = 0$, para $x > 0$.</p>',
        steps: [
          { text: 'Divide entre $x$: $P = \\frac{2}{x}$, $Q = \\frac{\\cos x}{x^2}$.', math: "y' + \\frac{2}{x}\\,y = \\frac{\\cos x}{x^2}" },
          { text: 'El factor integrante es $e^{2\\ln x} = x^2$.', math: "(x^2y)' = \\cos x" },
          { text: 'Integra y despeja.', math: 'x^2y = \\sin x + C \\;\\Rightarrow\\; y = \\frac{\\sin x + C}{x^2}' },
          { text: 'Con $y(\\pi) = 0$: $\\sin\\pi + C = 0$, así que $C = 0$.', math: 'y = \\frac{\\sin x}{x^2}' }
        ],
        answer: '$y = \\dfrac{\\sin x}{x^2}$. Si no divides entre $x$ al principio, tomarías $P = 2$ y $\\mu = e^{2x}$, y la integral ya no sale.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_SIN, 'sin(x)/x^2'], value: 1 }
      },
      {
        type: 'concept', heading: 'Tanques de mezclas', short: 'Tanques',
        body: [
          'Un tanque tiene $V$ litros de agua con $A(t)$ gramos de sal disuelta. Entra salmuera a $r$ litros por minuto con concentración $c_{in}$ g/L, y sale la mezcla (bien revuelta) también a $r$ L/min, así que el volumen no cambia. La sal cambia por lo que entra menos lo que sale: $$\\frac{dA}{dt} = \\underbrace{r\\,c_{in}}_{\\text{entra}} - \\underbrace{r\\,\\frac{A}{V}}_{\\text{sale}}$$',
          'Lo que sale lleva la concentración del tanque, $A/V$. En forma estándar: $A\' + \\frac{r}{V}A = r\\,c_{in}$, lineal con coeficientes constantes.'
        ],
        diagram: 'c3s04-tank',
        caption: 'Lo que entra no depende de $A$; lo que sale, sí. Por eso la sal se estabiliza en $Vc_{in}$.'
      },
      {
        type: 'example', heading: 'La sal en el tanque',
        problem: '<p>Un tanque de 200 L tiene 20 g de sal. Entra salmuera con 0.5 g/L a 4 L/min y sale la mezcla a 4 L/min. ¿Cuánta sal hay a los 30 minutos? ¿Y a la larga?</p>',
        steps: [
          { text: 'Plantea: entra $4(0.5) = 2$ g/min; sale $4\\cdot\\frac{A}{200}$ g/min.', math: "A' + 0.02\\,A = 2, \\qquad A(0) = 20" },
          { text: 'Factor integrante $e^{0.02t}$.', math: "(e^{0.02t}A)' = 2e^{0.02t} \\;\\Rightarrow\\; e^{0.02t}A = 100e^{0.02t} + C \\;\\Rightarrow\\; A = 100 + Ce^{-0.02t}" },
          { text: 'Con $A(0) = 20$: $C = -80$. Evalúa en 30 min.', math: 'A(30) = 100 - 80e^{-0.6} \\approx ' + fx(tank.A30) + '\\ \\text{g}' },
          { text: 'Cuando $t \\to \\infty$, $e^{-0.02t} \\to 0$: $A \\to 100$ g, que es $V c_{in} = 200(0.5)$.' }
        ],
        answer: 'A los 30 min hay unos ' + fx(tank.A30) + ' g; a la larga, 100 g (la concentración del tanque se iguala a la que entra). En el lab puedes mover $r$, $c_{in}$ y $A_0$.',
        verify: { lab: 'call', mod: 'ode', fn: 'solveAt', math: true, args: [P_TANK, 30], value: tank.A30 }
      },
      {
        type: 'explainer', heading: 'Estacionario más transitorio', short: 'Estacionario y transitorio',
        title: 'La solución $A = 100 - 80e^{-0.02t}$ separada en dos partes',
        intro: 'Con coeficientes constantes la solución siempre se parte igual.',
        diagram: 'c3s04-steady',
        steps: [
          { text: 'La sal sube de 10 g hacia un valor fijo. Esa es la solución completa.', state: { parts: 0 } },
          { text: 'Se separa en un <strong>estado estacionario</strong> (la constante a la que llega, donde $A\' = 0$) y un <strong>transitorio</strong> que decae como $Ce^{-kt}$ y se apaga. La condición inicial solo afecta al transitorio.', state: { parts: 1 } }
        ]
      },
      {
        type: 'example', heading: 'Un capacitor que se carga',
        diagram: 'c3s04-tau',
        problem: '<p>Un circuito RC tiene $R = 2$ kΩ, $C = 3$ μF y una fem de 12 V. El capacitor empieza descargado. ¿Qué carga tiene a los 10 ms?</p>',
        steps: [
          { text: 'Ley de mallas: $\\varepsilon - Rq\' - \\frac{q}{C} = 0$. En forma estándar, con $\\tau = RC = 6$ ms:', math: "q' + \\frac{q}{RC} = \\frac{\\varepsilon}{R}" },
          { text: 'Factor integrante $e^{t/RC}$; igual que el tanque, queda estacionario más transitorio.', math: 'q = C\\varepsilon + K e^{-t/RC}, \\qquad q(0) = 0 \\Rightarrow K = -C\\varepsilon' },
          { text: 'Sustituye.', math: 'q(10) = (3)(12)\\left(1 - e^{-10/6}\\right) \\approx ' + fx(rc.q10) + '\\ \\mu\\text{C}' }
        ],
        answer: 'Unos ' + fx(rc.q10) + ' μC, de un máximo de 36 μC. Es la fórmula de <a href="../../../fisica-2/sesiones/sesion-15/">Física 2, S15</a>: ahora sabes de dónde sale.',
        verify: { lab: 'call', mod: 'ode', fn: 'solveAt', math: true, args: [P_RC, 10], value: rc.q10 }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué no lleva constante el factor integrante?', a: 'Porque cualquier múltiplo de $\\mu$ también sirve: $Ke^{\\int P}$ funciona igual, y la $K$ se cancela al despejar. Se toma la más simple.' },
          { q: '¿Y si $\\int P\\,dx$ da $\\ln|x|$?', a: 'Entonces $\\mu = |x|$. En un intervalo donde $x > 0$ es $x$; donde $x < 0$ es $-x$, y el signo se cancela. En la práctica usa $\\mu = x$.' },
          { q: '¿Una lineal puede ser también separable?', a: 'Sí, si $P$ y $Q$ son constantes ($y\' + 2y = 4$) o si $Q = 0$. Entonces los dos métodos dan lo mismo; el factor integrante funciona siempre.' },
          { q: '¿Qué pasa si el volumen del tanque cambia?', a: 'Si entra a $r_1$ y sale a $r_2$, $V(t) = V_0 + (r_1 - r_2)t$ y lo que sale es $r_2\\,A/V(t)$. Sigue siendo lineal, pero con $P(t) = r_2/V(t)$ y factor integrante con potencias. Lo verás en la sesión 8.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Forma estándar: $y\' + P(x)\\,y = Q(x)$, con coeficiente 1 en $y\'$.',
          'Factor integrante $\\mu = e^{\\int P\\,dx}$; queda $(\\mu y)\' = \\mu Q$.',
          'Integra, pon la $C$ y divídela también entre $\\mu$.',
          'Con coeficientes constantes: estado estacionario + transitorio que se apaga (tanques, RC).'
        ]
      }
    ],

    lab: {
      type: 'ode-compare', title: 'El tanque y el factor integrante',
      intro: 'Escribe tu solución. En el tanque y en el circuito RC mueve los deslizadores y mira el dibujo del tanque cambiar de tono: si tu fórmula usa las letras, sigue coincidiendo. El lab detecta la $C$ que se olvidó dividir entre $\\mu$, el signo del exponente y la constante mal despejada.',
      cfg: { start: 0, problems: [P_TANK, P_EXP, P_X, P_SIN, P_RC] }
    },

    formulas: [
      { label: 'Forma estándar', tex: "y' + P(x)\\,y = Q(x)" },
      { label: 'Factor integrante', tex: '\\mu(x) = e^{\\int P(x)\\,dx}' },
      { label: 'Solución', tex: 'y = \\frac{1}{\\mu}\\left(\\int \\mu\\,Q\\,dx + C\\right)' },
      { label: 'Tanque', tex: "A' = r\\,c_{in} - r\\,\\frac{A}{V}" }
    ],

    exercises: [
      {
        id: 'c3-s04-constante', title: 'Lineal con coeficientes constantes',
        vars: { a: [1, 4, 1], b: [2, 12, 2], c: [-3, 3, 1] },
        where: function (v) { return v.c * v.a !== v.b && v.c !== 0; },
        prompt: function (v) { return '<p>Resuelve $y\' + ' + (v.a === 1 ? '' : v.a) + 'y = ' + v.b + '$ con $y(0) = ' + v.c + '$. Escribe $y(x)$.</p>'; },
        check: 'expr', domain: [0, 2],
        answer: function (v) { return (v.b / v.a) + ' + (' + v.c + ' - ' + (v.b / v.a) + ')*e^(-' + v.a + '*x)'; },
        mistakes: {
          keptC: function (v) { return (v.b / v.a) + ' + ' + v.c + '*e^(-' + v.a + '*x)'; },
          signExp: function (v) { return (v.b / v.a) + ' + (' + v.c + ' - ' + (v.b / v.a) + ')*e^(' + v.a + '*x)'; },
          noSteady: function (v) { return v.c + '*e^(-' + v.a + '*x)'; }
        },
        feedback: [
          { when: 'keptC', say: 'La constante no es $y(0)$: de $y = \\frac{b}{a} + Ce^{-ax}$ con $x = 0$ sale $C = y(0) - \\frac{b}{a}$.' },
          { when: 'signExp', say: 'El exponente es $-ax$: al dividir entre $\\mu = e^{ax}$ queda $e^{-ax}$.' },
          { when: 'noSteady', say: 'Esa es la solución de la homogénea $y\' + ay = 0$. Falta el estado estacionario $b/a$.' }
        ],
        hint: '$\\mu = e^{ax}$. Queda $y = \\frac{b}{a} + Ce^{-ax}$; usa $y(0)$ para la $C$.',
        solution: function (v) { var s = v.b / v.a; return '$$(e^{' + v.a + 'x}y)\' = ' + v.b + 'e^{' + v.a + 'x} \\;\\Rightarrow\\; y = ' + fx(s, 3) + ' + Ce^{-' + v.a + 'x}, \\quad C = ' + v.c + ' - ' + fx(s, 3) + '$$'; }
      },
      {
        id: 'c3-s04-mu', title: 'El factor integrante',
        vars: { k: [2, 5, 1], s: [0, 1, 1] },
        prompt: function (v) { return '<p>¿Cuál es un factor integrante de $x\\,y\' ' + (v.s ? '-' : '+') + ' ' + v.k + 'y = x^3$ (con $x > 0$)?</p>'; },
        check: 'choice',
        options: function (v) {
          var e = v.s ? -v.k : v.k;
          return [
            { text: '$\\mu = x^{' + e + '}$', correct: true },
            { text: '$\\mu = x^{' + (-e) + '}$', say: 'El signo de $P$ va en el exponente tal cual: $\\mu = e^{\\int P}$, no $e^{-\\int P}$.' },
            { text: '$\\mu = e^{' + e + 'x}$', say: 'Primero divide entre $x$: $P = ' + e + '/x$, cuya integral es $' + e + '\\ln x$.' },
            { text: '$\\mu = e^{' + e + '/x}$', say: '$\\int \\frac{' + e + '}{x}dx = ' + e + '\\ln x$, no $' + e + '/x$.' }
          ];
        },
        answer: function (v) { return '$\\mu = x^{' + (v.s ? -v.k : v.k) + '}$'; },
        hint: 'Forma estándar primero: divide entre $x$ y lee $P$.',
        solution: function (v) { var e = v.s ? -v.k : v.k; return '$P = \\frac{' + e + '}{x}$, $\\int P\\,dx = ' + e + '\\ln x$, así que $\\mu = e^{' + e + '\\ln x} = x^{' + e + '}$.'; }
      },
      {
        id: 'c3-s04-x', title: 'Lineal con P = 1/x',
        vars: { n: [0, 3, 1], b: [-3, 4, 1] },
        prompt: function (v) { return '<p>Resuelve $y\' + \\dfrac{y}{x} = ' + (v.n === 0 ? '1' : v.n === 1 ? 'x' : 'x^{' + v.n + '}') + '$ con $y(1) = ' + v.b + '$, para $x > 0$. Escribe $y(x)$.</p>'; },
        check: 'expr', domain: [0.5, 2.5],
        where: function (v) { return Math.abs(v.b - 1 / (v.n + 2)) > 1e-9; },
        answer: function (v) { return 'x^' + (v.n + 1) + '/' + (v.n + 2) + ' + (' + v.b + ' - 1/' + (v.n + 2) + ')/x'; },
        mistakes: {
          noDivC: function (v) { return 'x^' + (v.n + 1) + '/' + (v.n + 2) + ' + (' + v.b + ' - 1/' + (v.n + 2) + ')'; },
          rawC: function (v) { return 'x^' + (v.n + 1) + '/' + (v.n + 2) + ' + ' + v.b + '/x'; },
          noMu: function (v) { return 'x^' + (v.n + 1) + '/' + (v.n + 1) + ' + (' + v.b + ' - 1/' + (v.n + 1) + ')'; }
        },
        feedback: [
          { when: 'noDivC', say: 'La $C$ también se divide entre $\\mu = x$: queda $C/x$.' },
          { when: 'rawC', say: 'La constante no es $y(1)$: $y(1) = \\frac{1}{n + 2} + C$.' },
          { when: 'noMu', say: 'Integraste $Q$ sin multiplicar por $\\mu = x$. La ecuación es $(xy)\' = x\\cdot Q$.' }
        ],
        hint: '$\\mu = x$, así que $(xy)\' = x^{n + 1}$.',
        solution: function (v) { var m = v.n + 2; return '$$(xy)\' = x^{' + (v.n + 1) + '} \\;\\Rightarrow\\; xy = \\frac{x^{' + m + '}}{' + m + '} + C \\;\\Rightarrow\\; y = \\frac{x^{' + (v.n + 1) + '}}{' + m + '} + \\frac{C}{x}, \\quad C = ' + v.b + ' - \\tfrac{1}{' + m + '}$$'; }
      },
      {
        id: 'c3-s04-tanque', title: 'Sal en el tanque',
        vars: { V: [100, 500, 50], A0: [0, 50, 5], c: [0.2, 1.5, 0.1], r: [2, 10, 1], t: [10, 60, 5] },
        prompt: function (v) { return '<p>Un tanque tiene ' + v.V + ' L de agua con ' + v.A0 + ' g de sal. Entra salmuera con ' + v.c + ' g/L a ' + v.r + ' L/min, y sale la mezcla a la misma razón. ¿Cuántos gramos de sal hay a los ' + v.t + ' minutos?</p>'; },
        check: 'numeric', unit: 'g',
        answer: function (v) { var S = v.V * v.c; return S + (v.A0 - S) * Math.exp(-v.r * v.t / v.V); },
        mistakes: {
          noIn: function (v) { return v.A0 * Math.exp(-v.r * v.t / v.V); },
          noV: function (v) { var S = v.V * v.c; return S + (v.A0 - S) * Math.exp(-v.r * v.t); },
          keptA0: function (v) { var S = v.V * v.c; return S + v.A0 * Math.exp(-v.r * v.t / v.V); }
        },
        where: function (v) { return v.A0 > 0; },
        feedback: [
          { when: 'noIn', say: 'Olvidaste la sal que entra ($r\\,c_{in}$ g/min): solo dejaste salir la que había.' },
          { when: 'noV', say: 'Lo que sale lleva la concentración $A/V$: el exponente es $-rt/V$.' },
          { when: 'keptA0', say: 'La constante es $A_0 - Vc_{in}$, no $A_0$: revisa la condición inicial.' }
        ],
        oracle: { lab: 'value', value: function (v) { return rk({ iv: 't', order: 1, rhs: 'r*c - r*y/V', params: { r: v.r, c: v.c, V: v.V }, x0: 0, ics: [v.A0], domain: [0, 60] }, v.t); } },
        hint: '$A\' = r\\,c_{in} - \\frac{r}{V}A$. La solución es $A = Vc_{in} + (A_0 - Vc_{in})e^{-rt/V}$.',
        solution: function (v) { var S = v.V * v.c, A = S + (v.A0 - S) * Math.exp(-v.r * v.t / v.V); return '$$A = ' + fx(S) + ' + (' + v.A0 + ' - ' + fx(S) + ')e^{-' + v.r + 't/' + v.V + '} \\;\\Rightarrow\\; A(' + v.t + ') \\approx ' + fx(A) + '\\ \\text{g}$$'; }
      },
      {
        id: 'c3-s04-rc', title: 'Carga de un capacitor',
        vars: { R: [1, 5, 1], C: [1, 6, 1], E: [3, 24, 3], t: [2, 20, 2] },
        prompt: function (v) { return '<p>Un circuito RC tiene $R = ' + v.R + '$ kΩ, $C = ' + v.C + '$ μF y una fem de ' + v.E + ' V. El capacitor empieza descargado. ¿Qué carga tiene, en μC, a los ' + v.t + ' ms?</p>'; },
        check: 'numeric', unit: 'μC',
        answer: function (v) { return v.C * v.E * (1 - Math.exp(-v.t / (v.R * v.C))); },
        mistakes: {
          discharge: function (v) { return v.C * v.E * Math.exp(-v.t / (v.R * v.C)); },
          current: function (v) { return v.E / v.R * (1 - Math.exp(-v.t / (v.R * v.C))); },
          tauProduct: function (v) { return v.C * v.E * (1 - Math.exp(-v.t * v.R * v.C)); }
        },
        feedback: [
          { when: 'discharge', say: 'Esa es la descarga. Empieza en 0 y sube hacia $C\\varepsilon$: $q = C\\varepsilon(1 - e^{-t/RC})$.' },
          { when: 'current', say: '$\\varepsilon/R$ es la corriente inicial; la carga máxima es $C\\varepsilon$.' },
          { when: 'tauProduct', say: 'El exponente es $-t/(RC)$: se divide entre la constante de tiempo.' }
        ],
        oracle: { lab: 'value', value: function (v) { return rk({ iv: 't', order: 1, rhs: 'E/R - y/(R*K)', params: { E: v.E, R: v.R, K: v.C }, x0: 0, ics: [0], domain: [0, 20] }, v.t); } },
        hint: 'Con kΩ, μF y ms, las unidades cuadran: $RC$ sale en ms y $q$ en μC.',
        solution: function (v) { var q = v.C * v.E * (1 - Math.exp(-v.t / (v.R * v.C))); return '$$q = C\\varepsilon\\left(1 - e^{-t/RC}\\right) = ' + (v.C * v.E) + '\\left(1 - e^{-' + v.t + '/' + (v.R * v.C) + '}\\right) \\approx ' + fx(q) + '\\ \\mu\\text{C}$$'; }
      },
      {
        id: 'c3-s04-largo', title: 'A la larga',
        vars: { V: [50, 400, 50], c: [0.1, 2, 0.1], r: [1, 9, 1] },
        prompt: function (v) { return '<p>Un tanque de ' + v.V + ' L recibe salmuera con ' + v.c + ' g/L a ' + v.r + ' L/min y sale la mezcla a la misma razón. ¿A cuántos gramos de sal tiende el tanque cuando $t \\to \\infty$?</p>'; },
        check: 'numeric', unit: 'g',
        answer: function (v) { return v.V * v.c; },
        mistakes: {
          rate: function (v) { return v.r * v.c; },
          conc: function (v) { return v.c; }
        },
        where: function (v) { return v.r !== v.V; },
        feedback: [
          { when: 'rate', say: '$r\\,c_{in}$ es cuánta sal entra por minuto, no cuánta hay al final.' },
          { when: 'conc', say: 'Esa es la concentración final; multiplícala por el volumen.' }
        ],
        // Oráculo: el valor de A donde el lado derecho de la EDO se anula (bisección).
        oracle: { lab: 'value', value: function (v) {
          var f = function (A) { return v.r * v.c - v.r * A / v.V; }, a = 0, b = 1e4;
          for (var i = 0; i < 100; i++) { var m = (a + b) / 2; if (f(m) > 0) a = m; else b = m; }
          return (a + b) / 2;
        } },
        hint: 'En el estado estacionario $A\' = 0$: lo que entra iguala a lo que sale.',
        solution: function (v) { return '$$0 = r\\,c_{in} - r\\frac{A}{V} \\;\\Rightarrow\\; A = V c_{in} = ' + v.V + '(' + v.c + ') = ' + fx(v.V * v.c) + '\\ \\text{g}$$'; }
      }
    ],

    quiz: { tags: ['c3.S04'], count: 8 },

    errors: [
      'Leer $P$ sin dividir antes entre el coeficiente de $y\'$.',
      'Factor integrante invertido: $e^{-\\int P}$ en lugar de $e^{\\int P}$.',
      'Olvidar dividir la constante entre $\\mu$: $y = \\dots + C/\\mu$.',
      'Poner la $C$ después de despejar, como si se sumara al final.',
      'En tanques, usar $A$ en lo que sale en lugar de la concentración $A/V$.',
      'Tomar $y(0)$ como la constante sin restar el estado estacionario.'
    ],

    teacher: {
      plan: [
        'La tina que se llena y se vacía: entra fijo, sale proporcional.',
        'Deducir $\\mu = e^{\\int P}$ en el pizarrón pidiendo que el lado izquierdo sea $(\\mu y)\'$.',
        'Ejemplos 2 y 3: insistir en la forma estándar y en dividir la $C$.',
        'Lab con el tanque: mover $c_{in}$ y $r$, y ver que el estacionario $Vc_{in}$ no depende de $r$.'
      ],
      check: [
        'Que escriban la forma estándar antes de calcular $\\mu$.',
        'Que identifiquen el estado estacionario sin resolver ($y\' = 0$).'
      ],
      note: 'El circuito RC enlaza con Física 2, S15; el RL (Física 3, S14) es el mismo modelo. Tanques con volumen variable y más modelos van en la sesión 8.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 2</em>, §4.5 “First-order Linear Equations”. <a href="https://openstax.org/books/calculus-volume-2/pages/4-5-first-order-linear-equations">openstax.org</a> (CC BY-NC-SA 4.0).',
      'MIT OpenCourseWare. <em>18.03SC Differential Equations</em> (Fall 2011), Unit I, “Linear First Order ODEs” e “Integrating Factors”. <a href="https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/">ocw.mit.edu</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-03',
    next: 'sesion-05'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
