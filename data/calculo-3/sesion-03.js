/* =====================================================================
   Cálculo 3 · S03 · Reducibles a separables: homogéneas (y = ux) y la
   sustitución u = ax + by + c (bloque A · Primer orden I).
   Fuente: MIT OCW 18.03SC, Unit I, “Substitution Methods” (CC BY-NC-SA 4.0);
   el tema sigue a Zill, Ecuaciones diferenciales con aplicaciones de modelado,
   11.ª ed., §2.5 (solo como lectura). Ejemplos y ejercicios propios.
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
  function X1(v) { return 1 + v.a / 10; }       // punto donde se evalúa en c3-s03-valor

  // Problemas del lab (también los usan los ejemplos). twin: la misma curva en la variable nueva.
  var P_HOM = {
    name: 'Homogénea: y′ = (x² + y²)/(2xy)', tex: "y' = \\frac{x^2 + y^2}{2xy},\\qquad y(1) = 2", iv: 'x', dv: 'y', order: 1,
    rhs: '(x^2 + y^2)/(2x*y)', x0: 1, ics: [2], domain: [0.5, 4], yRange: [0, 5.5], field: true,
    twin: { u: 'y/x', label: 'u = y/x, que cumple x u′ = (1 − u²)/(2u), separable' },
    solution: 'sqrt(x^2 + 3x)', solutionTex: '\\sqrt{x^2 + 3x}',
    hint: 'Con $y = ux$ sale $\\dfrac{2u\\,du}{1 - u^2} = \\dfrac{dx}{x}$, que lleva a $y^2 = x^2 + Cx$.',
    wrong: [
      { src: 'sqrt(x^2 + 3)', tex: '\\sqrt{x^2+3}', key: 'residual' },
      { src: 'sqrt(x^2 + 2x)', tex: '\\sqrt{x^2+2x}', key: 'ic' },
      { src: 'x + 1', tex: 'x+1', key: 'residual' },
      { src: '-sqrt(x^2 + 3x)', tex: '-\\sqrt{x^2+3x}', key: 'ic' }
    ]
  };
  var P_LOG = {
    name: 'Homogénea: y′ = y/x + x/y', tex: "y' = \\frac{y}{x} + \\frac{x}{y},\\qquad y(1) = 1", iv: 'x', dv: 'y', order: 1,
    rhs: 'y/x + x/y', x0: 1, ics: [1], domain: [0.7, 4], field: true,
    twin: { u: 'y/x', label: 'u = y/x, que cumple x u′ = 1/u, separable' },
    solution: 'x*sqrt(2log(x) + 1)', solutionTex: 'x\\sqrt{2\\ln x + 1}',
    hint: 'Con $y = ux$: $u + xu\' = u + \\dfrac{1}{u}$, así que $u\\,du = \\dfrac{dx}{x}$.',
    wrong: [
      { src: 'x*sqrt(log(x) + 1)', tex: 'x\\sqrt{\\ln\\left(x\\right)+1}', key: 'residual' },
      { src: 'sqrt(2log(x) + 1)', tex: '\\sqrt{2\\ln\\left(x\\right)+1}', key: 'residual' },
      { src: 'x + log(x)', tex: 'x+\\ln\\left(x\\right)', key: 'residual' },
      { src: 'x*sqrt(2log(x) + 4)', tex: 'x\\sqrt{2\\ln\\left(x\\right)+4}', key: 'ic' }
    ]
  };
  var P_RIC = {
    name: 'Homogénea: y′ = (y² + xy)/x²', tex: "y' = \\frac{y^2 + xy}{x^2},\\qquad y(1) = 1", iv: 'x', dv: 'y', order: 1,
    rhs: '(y^2 + x*y)/x^2', x0: 1, ics: [1], domain: [0.4, 2.4], yRange: [0, 14], field: true,
    twin: { u: 'y/x', label: 'u = y/x, que cumple x u′ = u², separable' },
    solution: 'x/(1 - log(x))', solutionTex: '\\dfrac{x}{1 - \\ln x}',
    hint: 'Con $y = ux$ queda $x\\,u\' = u^2$: $\\dfrac{du}{u^2} = \\dfrac{dx}{x}$.',
    wrong: [
      { src: 'x/(2 - log(x))', tex: '\\frac{x}{2-\\ln\\left(x\\right)}', key: 'ic' },
      { src: 'x*(1 - log(x))', tex: 'x\\left(1-\\ln\\left(x\\right)\\right)', key: 'residual' },
      { src: '1/(1 - log(x))', tex: '\\frac{1}{1-\\ln\\left(x\\right)}', key: 'residual' }
    ]
  };
  var P_SUM = {
    name: 'u = x + y: y′ = (x + y)²', tex: "y' = (x + y)^2,\\qquad y(0) = 0", iv: 'x', dv: 'y', order: 1,
    rhs: '(x + y)^2', x0: 0, ics: [0], domain: [-1.2, 1.2], yRange: [-2, 2], field: true,
    twin: { u: 'x + y', label: 'u = x + y, que cumple u′ = 1 + u², separable' },
    solution: 'tan(x) - x', solutionTex: '\\tan x - x',
    hint: 'Con $u = x + y$: $u\' = 1 + y\' = 1 + u^2$, y $\\int \\frac{du}{1 + u^2} = \\arctan u$.',
    wrong: [
      { src: 'tan(x)', tex: '\\tan\\left(x\\right)', key: 'residual' },
      { src: 'x - tan(x)', tex: 'x-\\tan\\left(x\\right)', key: 'residual' },
      { src: 'tan(x + 0.2) - x', tex: '\\tan\\left(x+0.2\\right)-x', key: 'ic' }
    ]
  };
  var P_DIF = {
    name: 'u = x − y: y′ = (x − y)² + 1', tex: "y' = (x - y)^2 + 1,\\qquad y(0) = -1", iv: 'x', dv: 'y', order: 1,
    rhs: '(x - y)^2 + 1', x0: 0, ics: [-1], domain: [-0.5, 4], field: true,
    twin: { u: 'x - y', label: 'u = x − y, que cumple u′ = −u², separable' },
    solution: 'x - 1/(x + 1)', solutionTex: 'x - \\dfrac{1}{x + 1}',
    hint: 'Con $u = x - y$: $u\' = 1 - y\' = -u^2$. Integra $-\\dfrac{du}{u^2} = dx$.',
    wrong: [
      { src: 'x - 1/(x + 2)', tex: 'x-\\frac{1}{x+2}', key: 'ic' },
      { src: 'x + 1/(x + 1)', tex: 'x+\\frac{1}{x+1}', key: 'residual' },
      { src: '-1/(x + 1)', tex: '-\\frac{1}{x+1}', key: 'residual' }
    ]
  };

  var data = window.SESSION_DATA = {
    slug: 'sesion-03', number: '03', group: 'A · Primer orden I',
    title: 'Reducibles a separables: homogéneas (y = ux) y sustitución u = ax + by + c', temario: [],
    minutes: 150,
    quote: 'Si la ecuación no se deja separar, cámbiale la ropa: con la variable correcta, la misma ecuación se vuelve separable.',
    badges: [
      'Reconocer una ecuación homogénea: $y\' = F(y/x)$.',
      'Resolverla con $y = ux$, $y\' = u + xu\'$ y separar en $u$ y $x$.',
      'Usar $u = ax + by + c$ cuando $y\'$ depende solo de esa combinación.',
      'Regresar a la variable original y aplicar la condición inicial.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Algunas ecuaciones no son separables, pero un <strong>cambio de variable</strong> bien elegido las convierte en separables. Resuelves en la variable nueva y regresas.',
        recall: [
          'El método de <a href="../sesion-02/">variables separables</a> (S02 de este curso).',
          'La <a href="../../../calculo-1/sesiones/sesion-03/">regla del producto</a> (Cálculo 1, S03): si $y = u\\,x$, entonces $y\' = u + x\\,u\'$.',
          'El <a href="../../../calculo-1/sesiones/sesion-10/">cambio de variable en integrales</a> (Cálculo 1, S10): es la misma idea, ahora en una ecuación.'
        ],
        why: 'Es la primera herramienta para ecuaciones que no caen en ningún molde. La idea (buscar la variable en la que el problema se ve simple) se repite en todo el curso: Bernoulli, factores integrantes y hasta la reducción de orden.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Imagina que te dan las direcciones de una ciudad en coordenadas raras: «camina $3$ calles en diagonal y $2$ hacia la otra diagonal». Si cambias a calles y avenidas normales, el mismo recorrido se describe fácil. El camino no cambió, solo cómo lo describes.',
          'Con las ecuaciones pasa igual. En $y\' = (x + y)^2$ lo que manda es la suma $x + y$. Si llamas $u = x + y$, la ecuación habla solo de $u$ y queda $u\' = 1 + u^2$, que ya es separable. En una ecuación <strong>homogénea</strong>, lo que manda es el cociente $y/x$, así que usas $u = y/x$.'
        ]
      },
      {
        type: 'concept', heading: 'Ecuaciones homogéneas', short: 'Homogéneas',
        body: [
          'Una ecuación de primer orden $y\' = f(x, y)$ es <strong>homogénea</strong> si el lado derecho depende solo del cociente $y/x$: $$y\' = F\\!\\left(\\frac{y}{x}\\right)$$ Una prueba rápida: si $f(tx, ty) = f(x, y)$ para todo $t$, es homogénea. En la práctica, divide numerador y denominador entre la potencia más alta de $x$ y mira si todo queda en términos de $y/x$.',
          'Ojo: aquí «homogénea» no tiene nada que ver con las lineales homogéneas ($g(x) = 0$) que verás en la sesión 9. Es el mismo nombre para dos ideas distintas.'
        ],
        list: [
          '$y\' = \\dfrac{x^2 + y^2}{2xy}$: homogénea. Dividiendo entre $x^2$: $\\dfrac{1 + (y/x)^2}{2(y/x)}$.',
          '$y\' = \\dfrac{y}{x} + \\dfrac{x}{y}$: homogénea, es $u + 1/u$ con $u = y/x$.',
          '$y\' = \\dfrac{x + y + 1}{x}$: <strong>no</strong>, por el $1$: $f(tx, ty) = \\dfrac{tx + ty + 1}{tx}$ cambia con $t$.'
        ]
      },
      {
        type: 'explainer', heading: 'Por qué funciona y = ux', short: 'Los rayos',
        title: 'Campo de pendientes de $y\' = \\frac{x^2 + y^2}{2xy}$',
        intro: 'En una homogénea la pendiente solo depende de $y/x$, y $y/x$ es constante sobre cada recta que sale del origen.',
        diagram: 'c3s03-rays',
        steps: [
          { text: 'Cada recta $y = mx$ que sale del origen tiene $y/x = m$ fijo. Como la pendiente solo depende de $y/x$, todas las rayitas sobre una misma recta son <strong>paralelas</strong>.', state: { rays: 1, sol: 0 } },
          { text: 'Por eso conviene medir «en qué recta estás»: eso es $u = y/x$. Al cambiar a $u$, la ecuación ya no depende de $y$ por separado y se puede separar.', state: { rays: 1, sol: 0 } },
          { text: 'La solución que pasa por $(1, 2)$ va cruzando rectas: su $u$ cambia con $x$. Resolver en $u$ dice cómo cambia, y luego $y = ux$.', state: { rays: 1, sol: 1 } }
        ]
      },
      {
        type: 'recipe', heading: 'Receta: homogéneas con y = ux', short: 'Receta homogéneas',
        steps: [
          { text: 'Comprueba que es homogénea: escribe el lado derecho como $F(y/x)$.' },
          { text: 'Sustituye $y = ux$ y $y\' = u + x\\,u\'$.', tip: 'El error más común es escribir $y\' = u\'$. Por la regla del producto falta el término $u$.' },
          { text: 'Despeja $x\\,u\' = F(u) - u$. Esto <strong>siempre</strong> es separable: $\\dfrac{du}{F(u) - u} = \\dfrac{dx}{x}$.' },
          { text: 'Integra (a veces con fracciones parciales) y regresa con $u = y/x$.', tip: 'No te quedes con la respuesta en $u$: la pregunta es sobre $y$.' },
          { text: 'Aplica la condición inicial y comprueba sustituyendo en la ecuación original.' }
        ]
      },
      {
        type: 'example', heading: 'Una homogénea paso a paso',
        problem: '<p>Resuelve $y\' = \\dfrac{x^2 + y^2}{2xy}$ con $y(1) = 2$.</p>',
        steps: [
          { text: 'Dividiendo entre $x^2$ queda $F(u) = \\dfrac{1 + u^2}{2u}$ con $u = y/x$. Sustituye $y\' = u + xu\'$.', math: "u + x\\,u' = \\frac{1 + u^2}{2u}" },
          { text: 'Despeja $x\\,u\'$.', math: "x\\,u' = \\frac{1 + u^2}{2u} - u = \\frac{1 - u^2}{2u}" },
          { text: 'Separa e integra. La izquierda es $\\int \\frac{2u}{1 - u^2}du = -\\ln|1 - u^2|$.', math: '\\frac{2u\\,du}{1 - u^2} = \\frac{dx}{x} \\;\\Rightarrow\\; -\\ln|1 - u^2| = \\ln|x| + C \\;\\Rightarrow\\; 1 - u^2 = \\frac{A}{x}' },
          { text: 'Regresa con $u = y/x$ y multiplica por $x^2$.', math: 'x^2 - y^2 = A\\,x \\;\\Rightarrow\\; y^2 = x^2 - Ax' },
          { text: 'Con $y(1) = 2$: $4 = 1 - A$, así que $A = -3$. Como $y(1) > 0$, raíz positiva.', math: 'y = \\sqrt{x^2 + 3x}' }
        ],
        answer: '$y = \\sqrt{x^2 + 3x}$, para $x > 0$. En el lab verás la misma curva en la variable $u = y/x$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_HOM, 'sqrt(x^2 + 3x)'], value: 1 }
      },
      {
        type: 'example', heading: 'Con logaritmo',
        problem: '<p>Resuelve $y\' = \\dfrac{y}{x} + \\dfrac{x}{y}$ con $y(1) = 1$, para $x > 0$.</p>',
        steps: [
          { text: 'Ya está en términos de $u = y/x$: $F(u) = u + \\frac{1}{u}$. Sustituye.', math: "u + x\\,u' = u + \\frac{1}{u} \\;\\Rightarrow\\; x\\,u' = \\frac{1}{u}" },
          { text: 'Separa e integra.', math: 'u\\,du = \\frac{dx}{x} \\;\\Rightarrow\\; \\frac{u^2}{2} = \\ln x + C' },
          { text: 'En $x = 1$, $u = y/x = 1$: $\\frac{1}{2} = 0 + C$. Despeja $u$ y regresa a $y$.', math: 'u^2 = 2\\ln x + 1 \\;\\Rightarrow\\; y = x\\sqrt{2\\ln x + 1}' }
        ],
        answer: '$y = x\\sqrt{2\\ln x + 1}$, que vale mientras $2\\ln x + 1 > 0$, es decir, $x > e^{-1/2} \\approx 0.61$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_LOG, 'x*sqrt(2log(x) + 1)'], value: 1 }
      },
      {
        type: 'concept', heading: 'La sustitución u = ax + by + c', short: 'u = ax + by + c',
        body: [
          'Si la ecuación tiene la forma $$y\' = G(ax + by + c)$$ es decir, $x$ y $y$ solo aparecen dentro de una misma combinación lineal, usa $u = ax + by + c$. Derivando: $u\' = a + b\\,y\'$, así que $$u\' = a + b\\,G(u)$$ que es separable (y autónoma: no tiene $x$ suelta).',
          'Ejemplos: $y\' = (x + y)^2$ con $u = x + y$; $y\' = \\sin(x - y + 2)$ con $u = x - y + 2$; $y\' = \\sqrt{2x + y - 1}$ con $u = 2x + y - 1$.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: sustitución u = ax + by + c', short: 'Receta lineal',
        steps: [
          { text: 'Identifica la combinación que se repite y llámala $u$.' },
          { text: 'Deriva: $u\' = a + b\\,y\'$, y despeja $y\' = \\dfrac{u\' - a}{b}$.', tip: 'No olvides la constante $a$: la derivada de $x$ es 1, no 0.' },
          { text: 'Sustituye en la ecuación: queda $u\' = a + b\\,G(u)$. Separa e integra.' },
          { text: 'Regresa con $u = ax + by + c$, despeja $y$ y usa la condición inicial (en $u$ o en $y$, pero sin mezclarlas).' }
        ]
      },
      {
        type: 'example', heading: 'u = x + y',
        problem: '<p>Resuelve $y\' = (x + y)^2$ con $y(0) = 0$.</p>',
        steps: [
          { text: 'Con $u = x + y$: $u\' = 1 + y\' = 1 + u^2$.', math: "u' = 1 + u^2" },
          { text: 'Separa e integra.', math: '\\frac{du}{1 + u^2} = dx \\;\\Rightarrow\\; \\arctan u = x + C' },
          { text: 'En $x = 0$, $u = 0 + 0 = 0$: $C = 0$. Despeja y regresa.', math: 'u = \\tan x \\;\\Rightarrow\\; y = \\tan x - x' }
        ],
        answer: '$y = \\tan x - x$, en $-\\pi/2 < x < \\pi/2$. Si regresas sin restar la $x$ (dejando $y = \\tan x$), el lab muestra que el residuo no es cero.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_SUM, 'tan(x) - x'], value: 1 }
      },
      {
        type: 'example', heading: 'u = x − y',
        problem: '<p>Resuelve $y\' = (x - y)^2 + 1$ con $y(0) = -1$.</p>',
        steps: [
          { text: 'Con $u = x - y$: $u\' = 1 - y\' = 1 - (u^2 + 1) = -u^2$.', math: "u' = -u^2" },
          { text: 'Separa e integra.', math: '-\\frac{du}{u^2} = dx \\;\\Rightarrow\\; \\frac{1}{u} = x + C' },
          { text: 'En $x = 0$: $u = 0 - (-1) = 1$, así que $C = 1$.', math: 'u = \\frac{1}{x + 1} \\;\\Rightarrow\\; y = x - u = x - \\frac{1}{x + 1}' }
        ],
        answer: '$y = x - \\dfrac{1}{x + 1}$, para $x > -1$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_DIF, 'x - 1/(x + 1)'], value: 1 }
      },
      {
        type: 'callout', heading: 'La condición inicial en la variable nueva',
        body: [
          'Si aplicas la condición inicial después de cambiar de variable, conviértela: $y(x_0) = y_0$ se vuelve $u(x_0) = y_0/x_0$ (homogéneas) o $u(x_0) = ax_0 + by_0 + c$. Usar $u(x_0) = y_0$ tal cual es un error típico. Lo más seguro es regresar a $y$ y aplicar ahí la condición.'
        ]
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Cómo sé si conviene $y = ux$ o $u = ax + by + c$?', a: 'Si todo depende de $y/x$ (grados iguales arriba y abajo), $y = ux$. Si $x$ y $y$ aparecen siempre en la misma suma o resta, $u = ax + by + c$. Si no hay ninguna de las dos, el método no aplica.' },
          { q: '¿Por qué $y\' = u + xu\'$ y no solo $u\'$?', a: 'Porque $y = u\\cdot x$ es un producto de dos funciones de $x$ (la $u$ también cambia). Regla del producto: $(ux)\' = u\'x + u\\cdot 1$.' },
          { q: '¿Qué hago si $F(u) - u = 0$ para algún $u$?', a: 'Igual que en S02, esos valores dan soluciones especiales: si $F(m) = m$, la recta $y = mx$ es solución. Anótala antes de dividir.' },
          { q: '¿Y si la combinación es $ax + by + c$ arriba y otra distinta abajo?', a: 'Hay métodos (trasladar el origen al cruce de las dos rectas para que quede homogénea), pero no los vemos en este curso.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Homogénea: $y\' = F(y/x)$. Con $y = ux$, $y\' = u + xu\'$ queda $\\frac{du}{F(u) - u} = \\frac{dx}{x}$.',
          'Si $y\' = G(ax + by + c)$, con $u = ax + by + c$ queda $u\' = a + bG(u)$, separable.',
          'Siempre regresa a $y$ al final y convierte bien la condición inicial.',
          'Comprueba sustituyendo tu $y(x)$ en la ecuación original.'
        ]
      }
    ],

    lab: {
      type: 'ode-compare', title: 'Antes y después del cambio de variable',
      intro: 'Escribe tu $y(x)$. Arriba la ves contra la numérica en $(x, y)$; abajo, la misma curva después del cambio de variable ($u = y/x$ o $u = x + y$…). Si tu respuesta está bien, coincide en las dos. El lab detecta la constante mal despejada y cuando olvidas regresar a $y$.',
      cfg: { start: 0, problems: [P_HOM, P_LOG, P_RIC, P_SUM, P_DIF] }
    },

    formulas: [
      { label: 'Homogénea', tex: "y' = F\\!\\left(\\tfrac{y}{x}\\right),\\quad y = ux,\\quad y' = u + xu'" },
      { label: 'Separada en u', tex: '\\frac{du}{F(u) - u} = \\frac{dx}{x}' },
      { label: 'Combinación lineal', tex: "y' = G(ax + by + c),\\quad u' = a + b\\,G(u)" }
    ],

    exercises: [
      {
        id: 'c3-s03-eshomogenea', title: '¿Es homogénea?',
        vars: { k: [0, 4, 1] },
        prompt: function (v) {
          var eqs = ["y' = \\dfrac{x^2 - 3y^2}{xy}", "y' = \\dfrac{x + 2y + 1}{x}", "y' = \\dfrac{y}{x}\\,e^{y/x}", "y' = x^2 + y", "y' = \\dfrac{x^3 + y^3}{x\\,y^2}"];
          return '<p>¿La ecuación $' + eqs[v.k] + '$ es homogénea (es decir, de la forma $y\' = F(y/x)$)?</p>';
        },
        check: 'choice',
        options: function (v) {
          var yes = v.k === 0 || v.k === 2 || v.k === 4;
          var why = ['', 'El $+1$ rompe la homogeneidad: no se puede escribir solo con $y/x$.', '', '$x^2$ y $y$ tienen grados distintos.', ''][v.k];
          return [
            { text: 'Sí', correct: yes, say: yes ? null : why },
            { text: 'No', correct: !yes, say: yes ? 'Divide arriba y abajo entre la potencia más alta de $x$: todo queda en términos de $y/x$.' : null }
          ];
        },
        answer: function (v) { return v.k === 0 || v.k === 2 || v.k === 4 ? 'Sí' : 'No'; },
        hint: 'Cambia $x \\to tx$, $y \\to ty$. Si la $t$ se cancela, es homogénea.',
        solution: function (v) { return ['Sí: $\\frac{1 - 3u^2}{u}$ con $u = y/x$.', 'No: $\\frac{tx + 2ty + 1}{tx}$ depende de $t$.', 'Sí: ya está escrita como $F(y/x)$.', 'No: los grados no coinciden.', 'Sí: dividiendo entre $x^3$ queda $\\frac{1 + u^3}{u^2}$.'][v.k]; }
      },
      {
        id: 'c3-s03-derivada', title: 'La derivada de y = ux',
        vars: {},
        prompt: function () { return '<p>Si sustituyes $y = u(x)\\,x$, ¿cuánto vale $y\'$?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: "$y' = u + x\\,u'$", correct: true },
            { text: "$y' = u'$", say: 'Falta la regla del producto: $u$ también depende de $x$, y $x$ deriva a 1.' },
            { text: "$y' = x\\,u'$", say: 'Te faltó el término $u\\cdot(x)\' = u$.' },
            { text: "$y' = u + u'$", say: 'La $u\'$ va multiplicada por $x$: $(ux)\' = u\'x + u$.' }
          ];
        },
        answer: function () { return "$y' = u + x\\,u'$"; },
        hint: 'Regla del producto con $u$ y $x$.',
        solution: function () { return "$(u\\,x)' = u'\\,x + u\\cdot 1 = u + x\\,u'$."; }
      },
      {
        id: 'c3-s03-sustitucion', title: '¿Qué sustitución usas?',
        vars: { a: [2, 5, 1], c: [1, 6, 1] },
        prompt: function (v) { return '<p>Para resolver $y\' = \\cos(' + v.a + 'x - y + ' + v.c + ')$, ¿qué cambio de variable la vuelve separable?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: '$u = ' + v.a + 'x - y + ' + v.c + '$', correct: true },
            { text: '$y = ux$', say: 'No es homogénea: el lado derecho no depende solo de $y/x$.' },
            { text: '$u = \\cos y$', say: 'Lo que se repite es la combinación de adentro del coseno, no el coseno de $y$.' },
            { text: 'Ya es separable', say: 'No: $\\cos(' + v.a + 'x - y + ' + v.c + ')$ no se factoriza como $g(x)\\,h(y)$.' }
          ];
        },
        answer: function (v) { return '$u = ' + v.a + 'x - y + ' + v.c + '$'; },
        hint: '¿Qué combinación de $x$ y $y$ aparece?',
        solution: function (v) { return 'Con $u = ' + v.a + 'x - y + ' + v.c + '$: $u\' = ' + v.a + ' - y\' = ' + v.a + ' - \\cos u$, que es separable.'; }
      },
      {
        id: 'c3-s03-suma', title: 'Resolver con u = x + y',
        vars: { b: [1, 3, 1] },
        prompt: function (v) { return '<p>Resuelve $y\' = (x + y)^2 - 1$ con $y(0) = ' + v.b + '$. Escribe $y(x)$.</p>'; },
        check: 'expr', domain: [-1, 0.2],
        answer: function (v) { return '-x - ' + v.b + '/(' + v.b + '*x - 1)'; },
        mistakes: {
          noBack: function (v) { return '-' + v.b + '/(' + v.b + '*x - 1)'; },
          signC: function (v) { return '-x - ' + v.b + '/(' + v.b + '*x + 1)'; },
          plusX: function (v) { return 'x - ' + v.b + '/(' + v.b + '*x - 1)'; }
        },
        feedback: [
          { when: 'noBack', say: 'Esa es $u(x)$. Regresa a $y$: $y = u - x$.' },
          { when: 'signC', say: 'Revisa la constante: de $-\\frac{1}{u} = x + C$ con $u(0) = b$ sale $C = -\\frac{1}{b}$.' },
          { when: 'plusX', say: 'Al regresar, $y = u - x$, no $u + x$.' }
        ],
        hint: 'Con $u = x + y$: $u\' = 1 + y\' = u^2$. Separa, integra y regresa con $y = u - x$.',
        solution: function (v) { return '$$u\' = u^2 \\;\\Rightarrow\\; -\\frac{1}{u} = x + C, \\quad u(0) = ' + v.b + ' \\Rightarrow C = -\\tfrac{1}{' + v.b + '}$$ $$u = \\frac{' + v.b + '}{1 - ' + v.b + 'x} \\;\\Rightarrow\\; y = \\frac{' + v.b + '}{1 - ' + v.b + 'x} - x$$'; }
      },
      {
        id: 'c3-s03-valor', title: 'Valor de una homogénea',
        vars: { b: [0.2, 0.6, 0.1], a: [1, 6, 1] },
        where: function (v) { return 1 / v.b > 0.2 + Math.log(X1(v)); },          // sin polo en [1, x1]
        prompt: function (v) { return '<p>Resuelve $y\' = \\dfrac{y^2 + xy}{x^2}$ con $y(1) = ' + v.b + '$ y calcula $y(' + fx(X1(v)) + ')$.</p>'; },
        check: 'numeric',
        answer: function (v) { return X1(v) / (1 / v.b - Math.log(X1(v))); },
        mistakes: {
          noX: function (v) { return 1 / (1 / v.b - Math.log(X1(v))); },
          plusLog: function (v) { return X1(v) / (1 / v.b + Math.log(X1(v))); },
          icRaw: function (v) { return X1(v) / (v.b - Math.log(X1(v))); }
        },
        feedback: [
          { when: 'noX', say: 'Esa es $u(' + 'x)$. Regresa con $y = ux$.' },
          { when: 'plusLog', say: 'Revisa el signo: $\\int \\frac{du}{u^2} = -\\frac{1}{u}$.' },
          { when: 'icRaw', say: 'La constante sale de $-\\frac{1}{u(1)}$, con $u(1) = y(1)/1$: es $\\frac{1}{b}$, no $b$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return rk({ order: 1, rhs: '(y^2 + x*y)/x^2', x0: 1, ics: [v.b], domain: [1, 4] }, X1(v)); } },
        hint: 'Con $y = ux$ queda $x\\,u\' = u^2$, así que $-\\frac{1}{u} = \\ln x + C$.',
        solution: function (v) { var y = X1(v) / (1 / v.b - Math.log(X1(v))); return '$$-\\frac{1}{u} = \\ln x - \\frac{1}{' + v.b + '} \\;\\Rightarrow\\; y = \\frac{x}{\\frac{1}{' + v.b + '} - \\ln x} \\;\\Rightarrow\\; y(' + fx(X1(v)) + ') \\approx ' + fx(y) + '$$'; }
      },
      {
        id: 'c3-s03-logvalor', title: 'Homogénea con raíz',
        vars: { c: [1, 4, 1], a: [2, 6, 1] },
        prompt: function (v) { return '<p>Resuelve $y\' = \\dfrac{y}{x} + \\dfrac{x}{y}$ con $y(1) = ' + v.c + '$ y calcula $y(' + v.a + ')$.</p>'; },
        check: 'numeric',
        answer: function (v) { return v.a * Math.sqrt(2 * Math.log(v.a) + v.c * v.c); },
        mistakes: {
          noX: function (v) { return Math.sqrt(2 * Math.log(v.a) + v.c * v.c); },
          noTwo: function (v) { return v.a * Math.sqrt(Math.log(v.a) + v.c * v.c); },
          noSq: function (v) { return v.a * Math.sqrt(2 * Math.log(v.a) + v.c); }
        },
        where: function (v) { return v.c !== 1; },
        feedback: [
          { when: 'noX', say: 'Esa es $u = y/x$. Multiplica por $x$ para regresar a $y$.' },
          { when: 'noTwo', say: '$\\int u\\,du = u^2/2$: al despejar $u^2$ sale $2\\ln x$.' },
          { when: 'noSq', say: 'La constante es $u(1)^2 = ' + 'c^2$, no $c$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return rk({ order: 1, rhs: 'y/x + x/y', x0: 1, ics: [v.c], domain: [1, 7] }, v.a); } },
        hint: 'Con $y = ux$: $x\\,u\' = 1/u$, así que $u^2/2 = \\ln x + C$.',
        solution: function (v) { var y = v.a * Math.sqrt(2 * Math.log(v.a) + v.c * v.c); return '$$u^2 = 2\\ln x + ' + (v.c * v.c) + ' \\;\\Rightarrow\\; y = x\\sqrt{2\\ln x + ' + (v.c * v.c) + '} \\;\\Rightarrow\\; y(' + v.a + ') \\approx ' + fx(y) + '$$'; }
      }
    ],

    quiz: { tags: ['c3.S03'], count: 8 },

    errors: [
      'Escribir $y\' = u\'$ en lugar de $y\' = u + xu\'$ al sustituir $y = ux$.',
      'Olvidar la $a$ en $u\' = a + by\'$ (la derivada de $ax$ es $a$).',
      'Dejar la respuesta en $u$ sin regresar a $y$.',
      'Usar $u(x_0) = y_0$ sin convertir la condición inicial.',
      'Llamar homogénea a una ecuación con términos de grados distintos, como $\\frac{x + y + 1}{x}$.',
      'Confundir «homogénea» de esta sesión con «lineal homogénea» ($g = 0$).'
    ],

    teacher: {
      plan: [
        'Explainer de los rayos: que noten que las rayitas sobre cada recta son paralelas.',
        'Receta y ejemplo 1 en el pizarrón, remarcando $y\' = u + xu\'$.',
        'La sustitución lineal con $y\' = (x + y)^2$; preguntar qué pasa si regresan sin restar $x$.',
        'Lab: comparar la curva en $(x, y)$ y en $u$; que vean que la constante mal se nota en las dos.'
      ],
      check: [
        'Que reconozcan la forma $F(y/x)$ o $G(ax + by + c)$ antes de calcular.',
        'Que conviertan la condición inicial a la variable nueva o regresen antes de aplicarla.'
      ],
      note: 'Las homogéneas con coeficientes lineales distintos arriba y abajo (traslación del origen) quedan fuera. Bernoulli, que también es un cambio de variable, va en la sesión 5.'
    },

    bibliography: [
      'MIT OpenCourseWare. <em>18.03SC Differential Equations</em> (Fall 2011), Unit I, “Substitution Methods”. <a href="https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/">ocw.mit.edu</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 2</em>, §4.3 “Separable Equations” (base del método al que se reduce todo). <a href="https://openstax.org/books/calculus-volume-2/pages/4-3-separable-equations">openstax.org</a> (CC BY-NC-SA 4.0).',
      'Zill, D. G. <em>Ecuaciones diferenciales con aplicaciones de modelado</em>, 11.ª ed., Cengage, §2.5 “Soluciones por sustitución” (lectura de apoyo).'
    ],

    prev: 'sesion-02',
    next: 'sesion-04'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
