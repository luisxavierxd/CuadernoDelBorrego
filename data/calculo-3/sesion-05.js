/* =====================================================================
   Cálculo 3 · S05 · Reducibles a lineales: ecuación de Bernoulli
   (bloque A · Primer orden I).
   Fuente: OpenStax, Calculus Volume 2, §4.4 “The Logistic Equation”, CC BY-NC-SA 4.0;
   MIT OCW 18.03SC, Unit I (CC BY-NC-SA 4.0). Ejemplos y ejercicios propios.
   Los ejemplos se comprueban con LabMath.ode (lab ode-compare); los ejercicios
   numéricos usan la integral numérica (RK4) como oráculo.
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

  // Ejemplo de la logística: K = 1000 peces, r = 0.4/año, P0 = 50. ¿Cuántos a los 8 años? ¿Cuándo 500?
  var fish = { K: 1000, r: 0.4, P0: 50 };
  fish.A = fish.K / fish.P0 - 1;
  fish.P8 = fish.K / (1 + fish.A * Math.exp(-fish.r * 8));
  fish.tHalf = Math.log(fish.A) / fish.r;

  var P_LOG = {
    name: 'Logística: P′ = rP(1 − P/K)', tex: "P' = r\\,P\\left(1 - \\frac{P}{K}\\right),\\qquad P(0) = P_0", iv: 't', dv: 'P', order: 1,
    rhs: 'r*y*(1 - y/K)',
    params: {
      r: { value: 0.5, min: 0.1, max: 1.5, step: 0.05, label: 'Tasa de crecimiento r', unit: '1/año' },
      K: { value: 100, min: 40, max: 160, step: 5, label: 'Capacidad de carga K' },
      P0: { value: 8, min: 1, max: 160, step: 1, label: 'Población inicial P₀' }
    },
    x0: 0, ics: ['P0'], domain: [0, 20], yRange: [0, 170], field: true,
    twin: { u: '1/y', label: 'v = 1/P, que cumple v′ + r v = r/K: lineal' },
    solution: 'K/(1 + (K/P0 - 1)*e^(-r*t))', solutionTex: '\\dfrac{K}{1 + \\left(\\frac{K}{P_0} - 1\\right)e^{-rt}}',
    hint: 'Es Bernoulli con $n = 2$: usa $v = 1/P$. Escribe con las letras $r$, $K$ y $P_0$ para que siga valiendo con los deslizadores.',
    wrong: [
      { src: 'K/(1 + (K - P0)*e^(-r*t))', tex: '\\frac{K}{1+\\left(K-P_0\\right)e^{-rt}}', key: 'ic' },
      { src: 'K/(1 + (K/P0 - 1)*e^(r*t))', tex: '\\frac{K}{1+\\left(\\frac{K}{P_0}-1\\right)e^{rt}}', key: 'residual' },
      { src: 'P0*e^(r*t)', tex: 'P_0e^{rt}', key: 'residual' },
      { src: '1 + (K/P0 - 1)*e^(-r*t)', tex: '1+\\left(\\frac{K}{P_0}-1\\right)e^{-rt}', key: 'residual' }
    ]
  };
  var P_N2 = {
    name: 'y′ + y = y² con y(0) = 1/2', tex: "y' + y = y^2,\\qquad y(0) = \\tfrac{1}{2}", iv: 'x', dv: 'y', order: 1,
    rhs: 'y^2 - y', x0: 0, ics: [0.5], domain: [-3, 3], yRange: [-0.2, 1.2], field: true,
    twin: { u: '1/y', label: 'v = 1/y, que cumple v′ − v = −1: lineal' },
    solution: '1/(1 + e^x)', solutionTex: '\\dfrac{1}{1 + e^{x}}',
    hint: 'Con $v = y^{-1}$: $v\' = -y^{-2}y\'$. Divide la ecuación entre $y^2$ y sustituye.',
    wrong: [
      { src: '1 + e^x', tex: '1+e^{x}', key: 'residual' },
      { src: '1/(1 + 2e^x)', tex: '\\frac{1}{1+2e^{x}}', key: 'ic' },
      { src: '1/(1 + e^(-x))', tex: '\\frac{1}{1+e^{-x}}', key: 'residual' }
    ]
  };
  var P_X = {
    name: 'y′ + y/x = x·y² con y(1) = 1', tex: "y' + \\frac{y}{x} = x\\,y^2,\\qquad y(1) = 1", iv: 'x', dv: 'y', order: 1,
    rhs: 'x*y^2 - y/x', x0: 1, ics: [1], domain: [0.3, 1.7], yRange: [0, 4], field: true,
    twin: { u: '1/y', label: 'v = 1/y, que cumple v′ − v/x = −x: lineal' },
    solution: '1/(2x - x^2)', solutionTex: '\\dfrac{1}{2x - x^2}',
    hint: 'Con $v = 1/y$ queda $v\' - \\frac{v}{x} = -x$; el factor integrante es $\\frac{1}{x}$.',
    wrong: [
      { src: '1/(3x - x^2)', tex: '\\frac{1}{3x-x^2}', key: 'ic' },
      { src: '1/(2x + x^2)', tex: '\\frac{1}{2x+x^2}', key: 'residual' },
      { src: '2x - x^2', tex: '2x-x^2', key: 'residual' }
    ]
  };
  var P_HALF = {
    name: 'y′ + y = eˣ·√y con y(0) = 1', tex: "y' + y = e^{x}\\sqrt{y},\\qquad y(0) = 1", iv: 'x', dv: 'y', order: 1,
    rhs: 'e^x*sqrt(y) - y', x0: 0, ics: [1], domain: [-1, 2], field: true,
    twin: { u: 'sqrt(y)', label: 'v = √y, que cumple v′ + v/2 = eˣ/2: lineal' },
    solution: '(e^x/3 + 2/3*e^(-x/2))^2', solutionTex: '\\left(\\tfrac{1}{3}e^{x} + \\tfrac{2}{3}e^{-x/2}\\right)^2',
    hint: 'Aquí $n = \\tfrac{1}{2}$, así que $v = y^{1/2}$. No olvides elevar al cuadrado al regresar.',
    wrong: [
      { src: 'e^x/3 + 2/3*e^(-x/2)', tex: '\\frac{e^{x}}{3}+\\frac{2}{3}e^{-\\frac{x}{2}}', key: 'residual' },
      { src: '(e^x/3 + e^(-x/2))^2', tex: '\\left(\\frac{e^{x}}{3}+e^{-\\frac{x}{2}}\\right)^2', key: 'ic' },
      { src: '(e^x/2 + 1/2*e^(-x/2))^2', tex: '\\left(\\frac{e^{x}}{2}+\\frac{1}{2}e^{-\\frac{x}{2}}\\right)^2', key: 'residual' }
    ]
  };
  var P_N3 = {
    name: 'y′ + y = y³ con y(0) = 1/2', tex: "y' + y = y^3,\\qquad y(0) = \\tfrac{1}{2}", iv: 'x', dv: 'y', order: 1,
    rhs: 'y^3 - y', x0: 0, ics: [0.5], domain: [-2, 2], yRange: [-0.1, 1.1], field: true,
    twin: { u: '1/y^2', label: 'v = y⁻², que cumple v′ − 2v = −2: lineal' },
    solution: '1/sqrt(1 + 3e^(2x))', solutionTex: '\\dfrac{1}{\\sqrt{1 + 3e^{2x}}}',
    hint: 'Con $n = 3$, $v = y^{1 - 3} = y^{-2}$, y $v\' = -2y^{-3}y\'$.',
    wrong: [
      { src: '1/(1 + 3e^(2x))', tex: '\\frac{1}{1+3e^{2x}}', key: 'residual' },
      { src: '1/sqrt(1 + 3e^(-2x))', tex: '\\frac{1}{\\sqrt{1+3e^{-2x}}}', key: 'residual' },
      { src: '1/sqrt(1 + 8e^(2x))', tex: '\\frac{1}{\\sqrt{1+8e^{2x}}}', key: 'ic' }
    ]
  };

  var data = window.SESSION_DATA = {
    slug: 'sesion-05', number: '05', group: 'A · Primer orden I',
    title: 'Reducibles a lineales: ecuación de Bernoulli', temario: [],
    minutes: 150,
    quote: 'Bernoulli es una lineal con un intruso: el yⁿ. Un cambio de variable lo saca y queda una lineal de las que ya sabes resolver.',
    badges: [
      'Reconocer una ecuación de Bernoulli $y\' + P(x)\\,y = Q(x)\\,y^n$.',
      'Usar $v = y^{1-n}$ para convertirla en lineal y resolverla con factor integrante.',
      'Regresar a $y$ con la potencia correcta y aplicar la condición inicial.',
      'Resolver la ecuación logística de dos maneras: como Bernoulli y como separable.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'En $y\' + P(x)\\,y = Q(x)\\,y^n$, el cambio $v = y^{1-n}$ convierte la ecuación en una <strong>lineal</strong> en $v$. La resuelves como en S04 y regresas.',
        recall: [
          'El <a href="../sesion-04/">factor integrante</a> para lineales (S04 de este curso).',
          'El cambio de variable en una ecuación (<a href="../sesion-03/">S03</a>) y la <a href="../../../calculo-1/sesiones/sesion-05/">regla de la cadena</a> (Cálculo 1, S05): $(y^{m})\' = m\\,y^{m-1}y\'$.',
          'Leyes de exponentes: $y^{-n}\\cdot y = y^{1-n}$.'
        ],
        why: 'El ejemplo estrella es la <strong>ecuación logística</strong>, el modelo más usado de crecimiento con límite: poblaciones, epidemias al inicio, la difusión de una noticia o la adopción de una tecnología.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Una población de peces en un lago crece rápido cuando hay pocos (comida de sobra) y se frena cuando el lago se llena. El crecimiento es $rP$ por la parte de «más peces, más crías», pero se va apagando con un factor $\\left(1 - \\frac{P}{K}\\right)$ que llega a 0 cuando $P = K$, la capacidad del lago.',
          'Al desarrollar, $P\' = rP - \\frac{r}{K}P^2$: casi lineal, salvo el $P^2$. Si en vez de contar peces miras $v = 1/P$ («qué tanto lago le toca a cada pez»), la ecuación se vuelve lineal. Esa es la idea de Bernoulli.'
        ]
      },
      {
        type: 'concept', heading: 'La ecuación de Bernoulli', short: 'Forma de Bernoulli',
        body: [
          'Una ecuación de <strong>Bernoulli</strong> tiene la forma $$y\' + P(x)\\,y = Q(x)\\,y^{n}$$ con $n$ un número real. Si $n = 0$ o $n = 1$ ya es lineal. Para cualquier otro $n$ (2, 3, $\\frac{1}{2}$, $-1$…) no lo es, pero se arregla con un cambio de variable.',
          'El truco: divide entre $y^n$ y llama $v = y^{1-n}$. Por la regla de la cadena, $v\' = (1 - n)\\,y^{-n}\\,y\'$. Sustituyendo, $$v\' + (1 - n)\\,P(x)\\,v = (1 - n)\\,Q(x)$$ que es lineal en $v$.'
        ],
        list: [
          '$y\' + y = y^2$: $n = 2$, $v = y^{-1}$.',
          '$y\' + \\frac{2}{x}y = x\\,y^3$: $n = 3$, $v = y^{-2}$.',
          '$y\' - y = e^{x}\\sqrt{y}$: $n = \\frac{1}{2}$, $v = y^{1/2}$.',
          '$y\' + y = \\frac{x}{y}$: $n = -1$, $v = y^{2}$.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: Bernoulli', short: 'Receta',
        steps: [
          { text: 'Escribe la ecuación como $y\' + P\\,y = Q\\,y^n$ e identifica $n$.', tip: 'Si $y\'$ tiene coeficiente, divide primero, como en S04.' },
          { text: 'Llama $v = y^{1-n}$. Entonces $v\' + (1 - n)P\\,v = (1 - n)Q$.', tip: 'El factor $(1 - n)$ multiplica a <em>los dos</em> coeficientes, $P$ y $Q$. Olvidarlo en uno es el error más común.' },
          { text: 'Resuelve la lineal en $v$ con factor integrante $\\mu = e^{\\int (1 - n)P\\,dx}$.' },
          { text: 'Regresa: $y = v^{1/(1-n)}$. Con $n = 2$, $y = 1/v$; con $n = 3$, $y = \\pm 1/\\sqrt{v}$; con $n = \\frac{1}{2}$, $y = v^2$.' },
          { text: 'Aplica la condición inicial (en $v$: $v(x_0) = y_0^{1-n}$) y revisa si $y = 0$ también era solución.' }
        ]
      },
      {
        type: 'example', heading: 'Bernoulli con n = 2',
        problem: '<p>Resuelve $y\' + y = y^2$ con $y(0) = \\tfrac{1}{2}$.</p>',
        steps: [
          { text: 'Aquí $P = 1$, $Q = 1$, $n = 2$. Con $v = y^{-1}$, la ecuación en $v$ es:', math: "v' + (1 - 2)(1)\\,v = (1 - 2)(1) \\;\\Rightarrow\\; v' - v = -1" },
          { text: 'Factor integrante $e^{-x}$.', math: "(e^{-x}v)' = -e^{-x} \\;\\Rightarrow\\; e^{-x}v = e^{-x} + C \\;\\Rightarrow\\; v = 1 + Ce^{x}" },
          { text: 'La condición en $v$: $v(0) = 1/y(0) = 2$, así que $C = 1$. Regresa con $y = 1/v$.', math: 'y = \\frac{1}{1 + e^{x}}' }
        ],
        answer: '$y = \\dfrac{1}{1 + e^{x}}$. Si te quedas con $v = 1 + e^x$ sin regresar a $y$, el lab muestra que no cumple la ecuación (aunque en la gráfica de abajo, la de $v$, sí coincide).',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_N2, '1/(1 + e^x)'], value: 1 }
      },
      {
        type: 'example', heading: 'Con coeficientes que dependen de x',
        problem: '<p>Resuelve $y\' + \\dfrac{y}{x} = x\\,y^2$ con $y(1) = 1$, para $x > 0$.</p>',
        steps: [
          { text: '$n = 2$, $v = 1/y$. Multiplica $P = 1/x$ y $Q = x$ por $(1 - n) = -1$.', math: "v' - \\frac{v}{x} = -x" },
          { text: 'Factor integrante $e^{-\\ln x} = \\frac{1}{x}$.', math: "\\left(\\frac{v}{x}\\right)' = -1 \\;\\Rightarrow\\; \\frac{v}{x} = -x + C \\;\\Rightarrow\\; v = -x^2 + Cx" },
          { text: 'Con $v(1) = 1/1 = 1$: $-1 + C = 1$, $C = 2$. Regresa.', math: 'y = \\frac{1}{2x - x^2}' }
        ],
        answer: '$y = \\dfrac{1}{2x - x^2}$, en $0 < x < 2$ (en $x = 2$ explota).',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_X, '1/(2x - x^2)'], value: 1 }
      },
      {
        type: 'example', heading: 'Con n = 3: aparece una raíz',
        problem: '<p>Resuelve $y\' + y = y^3$ con $y(0) = \\tfrac{1}{2}$.</p>',
        steps: [
          { text: '$n = 3$, $v = y^{-2}$, y $(1 - n) = -2$.', math: "v' - 2v = -2" },
          { text: 'Factor integrante $e^{-2x}$.', math: "(e^{-2x}v)' = -2e^{-2x} \\;\\Rightarrow\\; v = 1 + Ce^{2x}" },
          { text: 'Con $v(0) = (1/2)^{-2} = 4$: $C = 3$. Regresa con $y = v^{-1/2}$ y el signo de $y(0) > 0$.', math: 'y = \\frac{1}{\\sqrt{1 + 3e^{2x}}}' }
        ],
        answer: '$y = \\dfrac{1}{\\sqrt{1 + 3e^{2x}}}$. Cuidado con la condición en $v$: es $4$, no $\\frac{1}{2}$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_N3, '1/sqrt(1 + 3e^(2x))'], value: 1 }
      },
      {
        type: 'concept', heading: 'La ecuación logística', short: 'Logística',
        body: [
          'El modelo logístico es $$\\frac{dP}{dt} = r\\,P\\left(1 - \\frac{P}{K}\\right)$$ con $r > 0$ la tasa de crecimiento cuando hay pocos y $K > 0$ la <strong>capacidad de carga</strong>. Tiene dos soluciones de equilibrio: $P = 0$ (sin población) y $P = K$ (lleno).',
          'Se puede resolver de dos formas, y las dos dan lo mismo: <strong>como separable</strong>, con fracciones parciales en $\\int \\frac{dP}{P(1 - P/K)}$, o <strong>como Bernoulli</strong> con $n = 2$, escribiéndola $P\' - rP = -\\frac{r}{K}P^2$. El resultado es $$P(t) = \\frac{K}{1 + \\left(\\frac{K}{P_0} - 1\\right)e^{-rt}}$$'
        ]
      },
      {
        type: 'explainer', heading: 'Todas van hacia K', short: 'Curvas logísticas',
        title: 'Soluciones de $P\' = 0.5\\,P(1 - P/100)$',
        intro: 'La forma de la curva depende de dónde empieza.',
        diagram: 'c3s05-logistic',
        steps: [
          { text: 'Empezando con pocos ($P_0 = 8$), la población crece casi exponencial, luego se frena: una curva en forma de S. El crecimiento es más rápido justo en $P = K/2$, el punto de inflexión.', state: { many: 0 } },
          { text: 'Con otros $P_0$: si empieza por debajo de $K$, sube hacia $K$; si empieza por arriba (más peces de los que caben), baja hacia $K$. Ninguna cruza la recta $P = K$: es una solución, y por unicidad dos soluciones no se cruzan.', state: { many: 1 } }
        ]
      },
      {
        type: 'example', heading: 'La logística como Bernoulli',
        problem: '<p>Un lago admite $K = 1000$ peces. Se siembran 50 y la tasa es $r = 0.4$ por año. ¿Cuántos hay a los 8 años? ¿Cuándo llegan a 500?</p>',
        steps: [
          { text: 'Escrita como Bernoulli, $P\' - 0.4P = -0.0004P^2$. Con $v = 1/P$:', math: "v' + 0.4\\,v = 0.0004 \\;\\Rightarrow\\; v = \\frac{1}{1000} + Ce^{-0.4t}" },
          { text: 'Con $v(0) = 1/50 = 0.02$: $C = 0.019$. Regresa y simplifica:', math: 'P = \\frac{1}{0.001 + 0.019e^{-0.4t}} = \\frac{1000}{1 + 19e^{-0.4t}}' },
          { text: 'A los 8 años:', math: 'P(8) = \\frac{1000}{1 + 19e^{-3.2}} \\approx ' + fx(fish.P8, 0) + '\\ \\text{peces}' },
          { text: 'Para $P = 500$: $1 + 19e^{-0.4t} = 2$, así que $e^{-0.4t} = \\frac{1}{19}$.', math: 't = \\frac{\\ln 19}{0.4} \\approx ' + fx(fish.tHalf, 2) + '\\ \\text{años}' }
        ],
        answer: 'Unos ' + fx(fish.P8, 0) + ' peces a los 8 años, y llegan a 500 (la mitad de $K$, donde crecen más rápido) a los ' + fx(fish.tHalf, 2) + ' años.',
        verify: { lab: 'call', mod: 'ode', fn: 'solveAt', math: true, args: [{ iv: 't', order: 1, rhs: '0.4*y*(1 - y/1000)', x0: 0, ics: [50], domain: [0, 10] }, fish.tHalf], value: 500 }
      },
      {
        type: 'callout', heading: 'Y como separable, el mismo resultado',
        body: [
          'Separando: $\\displaystyle\\int \\frac{K\\,dP}{P(K - P)} = \\int r\\,dt$. Con fracciones parciales (<a href="../../../calculo-1/sesiones/sesion-13/">Cálculo 1, S13</a>), $\\frac{K}{P(K - P)} = \\frac{1}{P} + \\frac{1}{K - P}$, así que $\\ln\\left|\\frac{P}{K - P}\\right| = rt + C$. Despejando $P$ sale exactamente la misma fórmula. Bernoulli evita las fracciones parciales; la separable evita el cambio de variable. Usa la que te salga más natural.'
        ]
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué $v = y^{1-n}$ y no $v = y^{n}$?', a: 'Porque al dividir la ecuación entre $y^n$, el término $P\\,y$ queda $P\\,y^{1-n}$. Ese es el que quieres que sea «la variable», y su derivada $(1 - n)y^{-n}y\'$ es justo lo que tienes en el otro término.' },
          { q: '¿Se pierde alguna solución al dividir entre $y^n$?', a: 'Si $n > 0$, $y = 0$ es solución y se pierde al dividir (como en S02). Revísala aparte, sobre todo si la condición inicial es $y(x_0) = 0$.' },
          { q: '¿Qué hago con el signo cuando $y = \\pm 1/\\sqrt{v}$?', a: 'Lo elige la condición inicial: si $y(x_0) > 0$, raíz positiva; si es negativa, la otra.' },
          { q: '¿La logística siempre se puede resolver así?', a: 'Sí. Incluso con cosecha constante ($P\' = rP(1 - P/K) - h$) se puede separar, aunque ya no es Bernoulli; eso lo verás en la sesión 8.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Bernoulli: $y\' + Py = Qy^n$, con $n \\neq 0, 1$.',
          'Con $v = y^{1-n}$: $v\' + (1 - n)Pv = (1 - n)Q$, lineal.',
          'Convierte la condición inicial a $v$ y al final regresa a $y$ con la potencia y el signo correctos.',
          'Logística: $P = \\frac{K}{1 + (K/P_0 - 1)e^{-rt}}$, por Bernoulli o por separación.'
        ]
      }
    ],

    lab: {
      type: 'ode-compare', title: 'Bernoulli: en y y en v',
      intro: 'Escribe tu $y(x)$ (o tu $P(t)$). Arriba la ves contra la numérica; abajo, la misma curva en la variable $v = y^{1-n}$, donde la ecuación es lineal. En la logística, mueve $r$, $K$ y $P_0$: si $P_0 > K$, la población baja hacia $K$. El lab detecta si te quedaste en $v$, si convertiste mal la condición inicial o si olvidaste el factor $(1 - n)$.',
      cfg: { start: 0, problems: [P_LOG, P_N2, P_X, P_HALF, P_N3] }
    },

    formulas: [
      { label: 'Bernoulli', tex: "y' + P(x)\\,y = Q(x)\\,y^n" },
      { label: 'Cambio de variable', tex: "v = y^{1-n} \\;\\Rightarrow\\; v' + (1 - n)P\\,v = (1 - n)Q" },
      { label: 'Logística', tex: "P' = rP\\left(1 - \\tfrac{P}{K}\\right) \\;\\Rightarrow\\; P = \\frac{K}{1 + \\left(\\frac{K}{P_0} - 1\\right)e^{-rt}}" }
    ],

    exercises: [
      {
        id: 'c3-s05-v', title: 'El cambio de variable',
        vars: { k: [0, 3, 1] },
        prompt: function (v) {
          var eqs = ["y' + 3y = x\\,y^{4}", "y' - \\frac{y}{x} = y^{2}", "y' + y = \\frac{e^{x}}{y^{2}}", "y' - 2y = x\\sqrt{y}"];
          return '<p>Para resolver la ecuación de Bernoulli $' + eqs[v.k] + '$, ¿qué cambio de variable usas?</p>';
        },
        check: 'choice',
        options: function (v) {
          var n = [4, 2, -2, 0.5][v.k];
          var good = { 4: 'v = y^{-3}', 2: 'v = y^{-1}', '-2': 'v = y^{3}', 0.5: 'v = y^{1/2}' }[n];
          var asN = { 4: 'v = y^{4}', 2: 'v = y^{2}', '-2': 'v = y^{-2}', 0.5: 'v = y^{2}' }[n];
          var neg = { 4: 'v = y^{3}', 2: 'v = y', '-2': 'v = y^{-3}', 0.5: 'v = y^{-1/2}' }[n];
          var out = [
            { text: '$' + good + '$', correct: true },
            { text: '$' + asN + '$', say: 'El exponente del cambio es $1 - n$, no $n$.' },
            { text: '$' + neg + '$', say: 'Revisa el signo: $1 - n$ con $n = ' + n + '$ da $' + (1 - n) + '$.' }
          ];
          if (n !== 2) out.push({ text: '$v = y/x$', say: 'Eso es para homogéneas (S03). Aquí lo que estorba es la potencia $y^n$.' });
          else out.push({ text: '$v = y/x$', say: 'Aunque aparece $y/x$, el problema es el $y^2$: es Bernoulli con $n = 2$.' });
          return out;
        },
        answer: function (v) { return '$' + ['v = y^{-3}', 'v = y^{-1}', 'v = y^{3}', 'v = y^{1/2}'][v.k] + '$'; },
        hint: 'Identifica $n$ (la potencia de $y$ del lado derecho) y usa $v = y^{1-n}$.',
        solution: function (v) { var n = [4, 2, -2, 0.5][v.k]; return 'Aquí $n = ' + (n === 0.5 ? '\\tfrac{1}{2}' : n) + '$, así que $v = y^{1 - n} = y^{' + (n === 0.5 ? '1/2' : 1 - n) + '}$.'; }
      },
      {
        id: 'c3-s05-lineal', title: 'La lineal que resulta',
        vars: { a: [2, 6, 1], n: [2, 4, 1] },
        prompt: function (v) { return '<p>Con $v = y^{' + (1 - v.n) + '}$, ¿en qué ecuación lineal se convierte $y\' + ' + v.a + 'y = x\\,y^{' + v.n + '}$?</p>'; },
        check: 'choice',
        options: function (v) {
          var m = 1 - v.n;
          return [
            { text: "$v' " + (m * v.a < 0 ? '- ' + (-m * v.a) : '+ ' + m * v.a) + 'v = ' + m + 'x$', correct: true },
            { text: "$v' + " + v.a + 'v = x$', say: 'Falta el factor $(1 - n)$: multiplica a $P$ y a $Q$.' },
            { text: "$v' " + (m * v.a < 0 ? '- ' + (-m * v.a) : '+ ' + m * v.a) + 'v = x$', say: 'El factor $(1 - n)$ también multiplica a $Q$.' },
            { text: "$v' + " + v.a + 'v = ' + m + 'x$', say: 'El factor $(1 - n)$ también multiplica a $P$.' }
          ];
        },
        answer: function (v) { var m = 1 - v.n; return "$v' " + (m * v.a < 0 ? '- ' + (-m * v.a) : '+ ' + m * v.a) + 'v = ' + m + 'x$'; },
        hint: '$v\' + (1 - n)P\\,v = (1 - n)Q$.',
        solution: function (v) { var m = 1 - v.n; return 'Con $1 - n = ' + m + '$: $v\' + (' + m + ')(' + v.a + ')v = (' + m + ')x$.'; }
      },
      {
        id: 'c3-s05-n2', title: 'Bernoulli con n = 2',
        vars: { a: [1, 3, 1], b: [2, 5, 1] },
        prompt: function (v) { return '<p>Resuelve $y\' + ' + (v.a === 1 ? '' : v.a) + 'y = ' + (v.a === 1 ? '' : v.a) + 'y^2$ con $y(0) = \\tfrac{1}{' + v.b + '}$. Escribe $y(x)$.</p>'; },
        check: 'expr', domain: [-1, 1],
        answer: function (v) { return '1/(1 + ' + (v.b - 1) + '*e^(' + v.a + '*x))'; },
        mistakes: {
          stayV: function (v) { return '1 + ' + (v.b - 1) + '*e^(' + v.a + '*x)'; },
          icRaw: function (v) { return '1/(1 + (1/' + v.b + ' - 1)*e^(' + v.a + '*x))'; },
          signExp: function (v) { return '1/(1 + ' + (v.b - 1) + '*e^(-' + v.a + '*x))'; }
        },
        feedback: [
          { when: 'stayV', say: 'Esa es $v = 1/y$. Regresa: $y = 1/v$.' },
          { when: 'icRaw', say: 'La condición en $v$ es $v(0) = 1/y(0) = b$, no $1/b$.' },
          { when: 'signExp', say: 'Revisa la lineal en $v$: $v\' - av = -a$, así que la exponencial es $e^{ax}$.' }
        ],
        hint: 'Con $v = 1/y$: $v\' - av = -a$, solución $v = 1 + Ce^{ax}$.',
        solution: function (v) { return '$$v\' - ' + v.a + 'v = -' + v.a + ' \\;\\Rightarrow\\; v = 1 + Ce^{' + v.a + 'x}, \\quad v(0) = ' + v.b + ' \\Rightarrow C = ' + (v.b - 1) + '$$ $$y = \\frac{1}{1 + ' + (v.b - 1) + 'e^{' + v.a + 'x}}$$'; }
      },
      {
        id: 'c3-s05-poblacion', title: 'Población logística',
        vars: { K: [200, 2000, 100], P0: [10, 150, 10], r: [0.1, 0.9, 0.05], t: [2, 15, 1] },
        where: function (v) { return v.P0 < v.K / 2; },
        prompt: function (v) { return '<p>Una población sigue $P\' = ' + v.r + 'P\\left(1 - \\dfrac{P}{' + v.K + '}\\right)$ ($t$ en años) y empieza con $P(0) = ' + v.P0 + '$. ¿Cuántos individuos hay a los ' + v.t + ' años? (No redondees a entero.)</p>'; },
        check: 'numeric',
        answer: function (v) { return v.K / (1 + (v.K / v.P0 - 1) * Math.exp(-v.r * v.t)); },
        mistakes: {
          exponential: function (v) { return v.P0 * Math.exp(v.r * v.t); },
          noMinusOne: function (v) { return v.K / (1 + (v.K / v.P0) * Math.exp(-v.r * v.t)); },
          wrongA: function (v) { return v.K / (1 + (v.K - v.P0) * Math.exp(-v.r * v.t)); }
        },
        feedback: [
          { when: 'exponential', say: 'Eso es crecimiento exponencial, sin el freno $(1 - P/K)$.' },
          { when: 'noMinusOne', say: 'La constante es $\\frac{K}{P_0} - 1$: con $t = 0$ debe dar $P_0$.' },
          { when: 'wrongA', say: 'La constante es $\\frac{K}{P_0} - 1$, no $K - P_0$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return rk({ iv: 't', order: 1, rhs: 'r*y*(1 - y/K)', params: { r: v.r, K: v.K }, x0: 0, ics: [v.P0], domain: [0, 15] }, v.t); } },
        hint: '$P = \\dfrac{K}{1 + (K/P_0 - 1)e^{-rt}}$.',
        solution: function (v) { var A = v.K / v.P0 - 1, P = v.K / (1 + A * Math.exp(-v.r * v.t)); return '$$P(' + v.t + ') = \\frac{' + v.K + '}{1 + ' + fx(A, 3) + 'e^{-' + v.r + '(' + v.t + ')}} \\approx ' + fx(P) + '$$'; }
      },
      {
        id: 'c3-s05-mitad', title: '¿Cuándo crece más rápido?',
        vars: { K: [100, 1000, 50], P0: [5, 40, 5], r: [0.2, 1, 0.1] },
        where: function (v) { return v.P0 < v.K / 4; },
        prompt: function (v) { return '<p>Con $P\' = ' + v.r + 'P\\left(1 - \\dfrac{P}{' + v.K + '}\\right)$ y $P(0) = ' + v.P0 + '$, ¿en qué tiempo $t$ la población crece más rápido (es decir, llega a $K/2$)?</p>'; },
        check: 'numeric',
        answer: function (v) { return Math.log(v.K / v.P0 - 1) / v.r; },
        mistakes: {
          noMinusOne: function (v) { return Math.log(v.K / v.P0) / v.r; },
          times: function (v) { return Math.log(v.K / v.P0 - 1) * v.r; }
        },
        feedback: [
          { when: 'noMinusOne', say: 'De $1 + (K/P_0 - 1)e^{-rt} = 2$ sale $e^{rt} = K/P_0 - 1$: no olvides el $-1$.' },
          { when: 'times', say: 'Despeja dividiendo entre $r$: $t = \\ln(K/P_0 - 1)/r$.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          // Bisección sobre la logística cerrada (sin despejar con logaritmos).
          var A = v.K / v.P0 - 1, a = 0, b = 200;
          for (var i = 0; i < 80; i++) { var m = (a + b) / 2; if (v.K / (1 + A * Math.exp(-v.r * m)) < v.K / 2) a = m; else b = m; }
          return (a + b) / 2;
        } },
        hint: 'El crecimiento $rP(1 - P/K)$ es máximo en $P = K/2$. Iguala la fórmula a $K/2$ y despeja $t$.',
        solution: function (v) { var t = Math.log(v.K / v.P0 - 1) / v.r; return '$$\\frac{K}{2} = \\frac{K}{1 + (K/P_0 - 1)e^{-rt}} \\;\\Rightarrow\\; t = \\frac{\\ln(' + fx(v.K / v.P0 - 1, 3) + ')}{' + v.r + '} \\approx ' + fx(t) + '$$'; }
      }
    ],

    quiz: { tags: ['c3.S05'], count: 8 },

    errors: [
      'Usar $v = y^{n}$ en lugar de $v = y^{1-n}$.',
      'Olvidar el factor $(1 - n)$ en $P$ o en $Q$ de la lineal en $v$.',
      'Aplicar $y(x_0) = y_0$ directo a $v$ sin convertir: es $v(x_0) = y_0^{1-n}$.',
      'Dejar la respuesta en $v$ sin regresar a $y$.',
      'Con $n = 3$ o $n = \\frac{1}{2}$, olvidar la raíz o el cuadrado al regresar.',
      'En la logística, poner $K - P_0$ en lugar de $\\frac{K}{P_0} - 1$.'
    ],

    teacher: {
      plan: [
        'Los peces en el lago: deducir el factor $(1 - P/K)$ y las dos soluciones de equilibrio.',
        'Derivar el cambio $v = y^{1-n}$ en el pizarrón con $n$ general.',
        'Ejemplos con $n = 2$ y $n = 3$, insistiendo en convertir la condición inicial.',
        'Lab: logística con $P_0 > K$ y comparar las gráficas en $P$ y en $v = 1/P$.'
      ],
      check: [
        'Que identifiquen $n$ y escriban $v = y^{1-n}$ antes de calcular.',
        'Que expliquen por qué ninguna curva logística cruza $P = K$.'
      ],
      note: 'La logística con cosecha y otros modelos de población van en la sesión 8. Con esta sesión cierra el bloque A (Parcial 1).'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 2</em>, §4.4 “The Logistic Equation”. <a href="https://openstax.org/books/calculus-volume-2/pages/4-4-the-logistic-equation">openstax.org</a> (CC BY-NC-SA 4.0).',
      'MIT OpenCourseWare. <em>18.03SC Differential Equations</em> (Fall 2011), Unit I, “Substitution Methods” (Bernoulli). <a href="https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/">ocw.mit.edu</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-04',
    next: 'sesion-06'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
