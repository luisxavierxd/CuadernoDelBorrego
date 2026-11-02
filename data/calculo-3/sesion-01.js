/* =====================================================================
   Cálculo 3 · S01 · Qué es una ecuación diferencial: orden, linealidad,
   solución, PVI, existencia y unicidad (bloque A · Primer orden I).
   Fuente: OpenStax, Calculus Volume 2, §4.1 y §4.2, CC BY-NC-SA 4.0; teoría de
   existencia y unicidad como en Boyce, DiPrima y Meade, §2.4 (solo como lectura).
   Los ejemplos se comprueban con LabMath.ode (lab ode-compare): la solución se
   sustituye en la ecuación y se revisan las condiciones iniciales; los ejercicios
   numéricos usan la integral numérica (RK4) o una cuenta aparte como oráculo.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function sgn(n) { return n < 0 ? ' - ' + (-n) : ' + ' + n; }
  // c·x como término de LaTeX con signo: 3x, -x, + 2x…
  function cx(c, v, first) {
    var a = Math.abs(c), body = (a === 1 ? '' : a) + v;
    return first ? (c < 0 ? '-' : '') + body : (c < 0 ? ' - ' : ' + ') + body;
  }

  // La respuesta y cada error típico difieren al menos 3 % entre sí (mensajes "casi" sin ambigüedad).
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

  // Problemas del lab (también los usan los ejemplos).
  var P_LIN = {
    name: 'y′ = x − y con y(0) = 1', tex: "y' = x - y,\\qquad y(0) = 1", iv: 'x', dv: 'y', order: 1,
    rhs: 'x - y', x0: 0, ics: [1], domain: [-0.5, 4], yRange: [-1, 3.4], field: true,
    solution: 'x - 1 + 2e^(-x)', solutionTex: 'x - 1 + 2e^{-x}',
    hint: 'La familia de soluciones es $y = x - 1 + Ce^{-x}$. Elige la $C$ que cumple $y(0) = 1$.',
    wrong: [
      { src: 'x - 1 + e^(-x)', tex: 'x-1+e^{-x}', key: 'ic' },
      { src: 'x - 1 + 2e^(x)', tex: 'x-1+2e^{x}', key: 'residual' },
      { src: 'x + 1 - 2e^(-x)', tex: 'x+1-2e^{-x}', key: 'residual' },
      { src: 'x - 1', tex: 'x-1', key: 'ic' }
    ]
  };
  var P_EXP = {
    name: 'y′ = y con y(0) = 2', tex: "y' = y,\\qquad y(0) = 2", iv: 'x', dv: 'y', order: 1,
    rhs: 'y', x0: 0, ics: [2], domain: [-2, 1.8], field: true,
    solution: '2e^x', solutionTex: '2e^{x}',
    hint: 'Busca una función que sea igual a su propia derivada.',
    wrong: [
      { src: 'e^x + 1', tex: 'e^{x}+1', key: 'residual' },
      { src: 'e^(2x)', tex: 'e^{2x}', key: 'residual' },
      { src: 'e^x', tex: 'e^{x}', key: 'ic' }
    ]
  };
  var P_INT = {
    name: 'y′ = 2x con y(1) = 3', tex: "y' = 2x,\\qquad y(1) = 3", iv: 'x', dv: 'y', order: 1,
    rhs: '2x', x0: 1, ics: [3], domain: [-2, 2.5], field: true,
    solution: 'x^2 + 2', solutionTex: 'x^2 + 2',
    hint: 'Integra los dos lados y usa $y(1) = 3$ para la constante.',
    wrong: [
      { src: 'x^2 + 3', tex: 'x^2+3', key: 'ic' },
      { src: 'x^2', tex: 'x^2', key: 'ic' },
      { src: '2x^2 + 1', tex: '2x^2+1', key: 'residual' }
    ]
  };
  var P_OSC = {
    name: 'y″ + 4y = 0 con y(0) = 1, y′(0) = 2', tex: "y'' + 4y = 0,\\qquad y(0) = 1,\\quad y'(0) = 2", iv: 'x', dv: 'y', order: 2,
    rhs: '-4y', x0: 0, ics: [1, 2], domain: [0, 6],
    solution: 'cos(2x) + sin(2x)', solutionTex: '\\cos 2x + \\sin 2x',
    hint: 'La familia es $y = c_1\\cos 2x + c_2\\sin 2x$. Necesitas dos condiciones para las dos constantes.',
    wrong: [
      { src: 'cos(2x) + 2sin(2x)', tex: '\\cos\\left(2x\\right)+2\\sin\\left(2x\\right)', key: 'ic' },
      { src: 'cos(x) + 2sin(x)', tex: '\\cos\\left(x\\right)+2\\sin\\left(x\\right)', key: 'residual' },
      { src: 'cos(2x)', tex: '\\cos\\left(2x\\right)', key: 'ic' }
    ]
  };
  var P_BLOW = {
    name: 'y′ = y² con y(0) = 1 (explota)', tex: "y' = y^2,\\qquad y(0) = 1", iv: 'x', dv: 'y', order: 1,
    rhs: 'y^2', x0: 0, ics: [1], domain: [-2, 0.9], yRange: [-1, 11], field: true,
    solution: '1/(1 - x)', solutionTex: '\\dfrac{1}{1 - x}',
    hint: 'Prueba con $y = \\dfrac{1}{c - x}$: su derivada es $\\dfrac{1}{(c - x)^2} = y^2$.',
    wrong: [
      { src: '1/(1 + x)', tex: '\\frac{1}{1+x}', key: 'residual' },
      { src: '1/(2 - x)', tex: '\\frac{1}{2-x}', key: 'ic' },
      { src: '1 + x', tex: '1+x', key: 'residual' }
    ]
  };

  var data = window.SESSION_DATA = {
    slug: 'sesion-01', number: '01', group: 'A · Primer orden I',
    title: 'Qué es una ecuación diferencial: orden, linealidad, solución, PVI, existencia y unicidad', temario: [],
    minutes: 150,
    quote: 'Una ecuación diferencial no te dice cuánto vale algo: te dice cómo cambia. Resolverla es reconstruir la historia completa a partir de esa regla.',
    badges: [
      'Reconocer una ecuación diferencial ordinaria y decir su orden y si es lineal.',
      'Comprobar que una función es solución sustituyéndola en la ecuación.',
      'Usar condiciones iniciales para elegir una solución de la familia (PVI).',
      'Leer un campo de pendientes y saber cuándo el teorema garantiza una solución única.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Una <strong>ecuación diferencial</strong> es una ecuación donde la incógnita es una <em>función</em> y aparecen sus derivadas. Resolverla es encontrar las funciones que la cumplen.',
        recall: [
          'Las <a href="../../../calculo-1/sesiones/sesion-02/">fórmulas de derivación</a> (Cálculo 1, S02) y la <a href="../../../calculo-1/sesiones/sesion-05/">regla de la cadena</a> (Cálculo 1, S05).',
          'La <a href="../../../calculo-1/sesiones/sesion-09/">integral y el Teorema Fundamental</a> (Cálculo 1, S09): si $y\' = f(x)$, entonces $y = \\int f(x)\\,dx + C$.',
          'La derivada como pendiente de la recta tangente (<a href="../../../calculo-1/sesiones/sesion-01/">Cálculo 1, S01</a>).'
        ],
        why: 'Casi todas las leyes de la física y muchos modelos de biología, economía o ingeniería se escriben como ecuaciones diferenciales: cómo se enfría un café, cómo se descarga un capacitor (lo viste en <a href="../../../fisica-2/sesiones/sesion-15/">Física 2, S15</a>), cómo oscila un resorte o cómo crece una población.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Vas en carretera y el velocímetro marca 90 km/h. Eso no te dice dónde estás: te dice qué tan rápido <em>cambia</em> tu posición. Si además sabes de dónde saliste, puedes reconstruir todo el viaje. Una ecuación diferencial es justo eso: una regla para el cambio, y una condición inicial que fija el punto de partida.',
          'Otro ejemplo: un café recién servido se enfría rápido al principio y cada vez más lento. Nadie te da la fórmula de la temperatura; lo que sí se sabe es que <strong>se enfría más rápido entre más caliente está respecto al cuarto</strong>. Eso, escrito con derivadas, es $T\' = -k(T - T_a)$. De esa regla sale la fórmula de $T(t)$.',
          'En este curso vas a aprender a pasar de la regla (la ecuación) a la historia (la solución), y a comprobar siempre tu respuesta: si sustituyes tu función en la ecuación y se cumple, está bien.'
        ]
      },
      {
        type: 'concept', heading: 'Qué es una ecuación diferencial', short: 'Definición',
        body: [
          'Una <strong>ecuación diferencial ordinaria</strong> (EDO) relaciona una función desconocida $y(x)$ de <em>una</em> variable con sus derivadas $y\'$, $y\'\'$, … Por ejemplo: $$y\' = 3y \\qquad y\'\' + 4y = 0 \\qquad x\\,y\' - 2y = x^3 \\qquad R\\,q\' + \\frac{q}{C} = \\varepsilon$$',
          'La letra de afuera ($x$ o $t$) es la <strong>variable independiente</strong>; la función que buscas ($y$, $T$, $q$…) es la <strong>variable dependiente</strong>. Si la función dependiera de varias variables y aparecieran derivadas parciales, sería una ecuación en derivadas parciales (EDP); esas no entran en este curso.'
        ]
      },
      {
        type: 'concept', heading: 'Orden y linealidad', short: 'Orden y linealidad',
        body: [
          'El <strong>orden</strong> es el de la derivada más alta que aparece. $y\' = 3y$ es de primer orden; $y\'\' + 4y = 0$, de segundo. Ojo: $(y\')^3 = x$ sigue siendo de primer orden: el exponente no es el orden.',
          'Una EDO de orden $n$ es <strong>lineal</strong> si se puede escribir como $$a_n(x)\\,y^{(n)} + \\dots + a_1(x)\\,y\' + a_0(x)\\,y = g(x)$$ Es decir: $y$ y sus derivadas aparecen solas, a la primera potencia, multiplicadas solo por funciones de $x$. Si no, es <strong>no lineal</strong>.'
        ],
        list: [
          '$x^2y\'\' + e^x y\' - y = \\sin x$: lineal. Los coeficientes pueden ser lo que sea <em>de $x$</em>.',
          '$y\' + y^2 = 0$: no lineal, por el $y^2$.',
          '$y\'\' + \\sin y = 0$ (el péndulo): no lineal, porque $y$ está dentro del seno.',
          '$y\\,y\' = x$: no lineal, porque $y$ multiplica a su derivada.'
        ]
      },
      {
        type: 'callout', heading: 'Lineal en y, no en x',
        body: [
          'La linealidad solo mira a $y$ y sus derivadas. En $y\' + x^5 y = e^{x^2}$ hay potencias raras de $x$, pero la ecuación es lineal: lo que importa es que $y$ y $y\'$ aparezcan a la primera potencia y sin multiplicarse entre sí.'
        ]
      },
      {
        type: 'concept', heading: 'Qué es una solución', short: 'Solución',
        body: [
          'Una <strong>solución</strong> en un intervalo $I$ es una función $y = \\varphi(x)$ que, al sustituirla junto con sus derivadas, hace que la ecuación se cumpla para <em>todo</em> $x$ en $I$. Para comprobarla no hace falta saber resolver: <strong>deriva, sustituye y simplifica</strong>.',
          'Normalmente hay una familia completa de soluciones con constantes arbitrarias: es la <strong>solución general</strong>. Por ejemplo, $y = Ce^{3x}$ cumple $y\' = 3y$ para cualquier $C$. Una EDO de orden $n$ tiene $n$ constantes en su solución general. Cada elección de las constantes da una <strong>solución particular</strong>.',
          'A veces la solución viene <strong>implícita</strong>, como una relación $G(x, y) = 0$ que no se despeja fácil (lo verás en la sesión 2). Sigue siendo solución si al derivar implícitamente se cumple la ecuación.'
        ]
      },
      {
        type: 'example', heading: 'Comprobar una solución de segundo orden',
        problem: '<p>Comprueba que $y = \\cos 2x + \\sin 2x$ es solución de $y\'\' + 4y = 0$.</p>',
        steps: [
          { text: 'Deriva dos veces (regla de la cadena: sale un 2 cada vez).', math: "y' = -2\\sin 2x + 2\\cos 2x \\qquad y'' = -4\\cos 2x - 4\\sin 2x" },
          { text: 'Sustituye en el lado izquierdo.', math: "y'' + 4y = (-4\\cos 2x - 4\\sin 2x) + 4(\\cos 2x + \\sin 2x) = 0" },
          { text: 'Da 0 para todo $x$: se cumple en todo $\\mathbb{R}$.' }
        ],
        answer: 'Sí es solución en todo $\\mathbb{R}$. De hecho, cualquier $y = c_1\\cos 2x + c_2\\sin 2x$ lo es: es la solución general, con dos constantes porque la ecuación es de orden 2.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_OSC, 'cos(2x) + sin(2x)'], value: 1 }
      },
      {
        type: 'example', heading: 'Una que sí y una que no',
        problem: '<p>¿Cuál de estas funciones es solución de $x\\,y\' = 2y$ para $x > 0$: $y = x^2$ o $y = x^3$?</p>',
        steps: [
          { text: 'Con $y = x^2$: $y\' = 2x$, así que $x\\,y\' = 2x^2$ y $2y = 2x^2$.', math: 'x\\,y\' = 2x^2 = 2y \\quad\\checkmark' },
          { text: 'Con $y = x^3$: $y\' = 3x^2$, así que $x\\,y\' = 3x^3$, pero $2y = 2x^3$.', math: 'x\\,y\' = 3x^3 \\neq 2x^3 = 2y' }
        ],
        answer: '$y = x^2$ sí es solución; $y = x^3$ no (le sobra un $x^3$). En general, $y = Cx^2$ es la familia de soluciones.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [{ order: 1, rhs: '2y/x', x0: 1, ics: [1], domain: [0.2, 3] }, 'x^2'], value: 1 }
      },
      {
        type: 'concept', heading: 'Problema de valor inicial', short: 'PVI',
        body: [
          'La solución general es una familia de curvas. Para quedarte con una, das <strong>condiciones iniciales</strong>: el valor de $y$ (y de sus derivadas, si el orden es mayor) en un punto $x_0$. La ecuación junto con esas condiciones es un <strong>problema de valor inicial</strong> (PVI): $$y\' = f(x, y), \\qquad y(x_0) = y_0$$',
          'En orden $n$ hacen falta $n$ condiciones: $y(x_0)$, $y\'(x_0)$, …, $y^{(n-1)}(x_0)$. Una por cada constante. En física es natural: para saber cómo se mueve una masa ($x\'\' = F/m$) necesitas dónde empieza y con qué velocidad.'
        ]
      },
      {
        type: 'explainer', heading: 'El campo de pendientes', short: 'Campo de pendientes',
        title: 'La ecuación $y\' = x - y$ dibujada',
        intro: 'Sin resolver nada, la ecuación ya dice la pendiente de la solución en cada punto del plano.',
        diagram: 'c3s01-field',
        steps: [
          { text: 'En cada punto $(x, y)$ la ecuación $y\' = x - y$ da un número: la pendiente que tendría una solución que pase por ahí. Dibuja una rayita con esa pendiente en muchos puntos y obtienes el <strong>campo de pendientes</strong>.', state: { field: 1, ic: 0, sol: 0, fam: 0 } },
          { text: 'Escoge un punto de partida, la condición inicial $y(0) = 1$.', state: { field: 1, ic: 1, sol: 0, fam: 0 } },
          { text: 'La solución sale de ahí siguiendo las rayitas: en cada punto es tangente a la rayita que tiene enfrente. Nunca las cruza.', state: { field: 1, ic: 1, sol: 1, fam: 0 } },
          { text: 'Desde otros puntos salen otras curvas: son la familia $y = x - 1 + Ce^{-x}$. La condición inicial elige una sola; aquí $C = 2$.', state: { field: 1, ic: 1, sol: 1, fam: 1 } }
        ]
      },
      {
        type: 'example', heading: 'Elegir la constante con la condición inicial',
        problem: '<p>La familia $y = x - 1 + Ce^{-x}$ resuelve $y\' = x - y$. Encuentra la solución con $y(0) = 1$.</p>',
        steps: [
          { text: 'Sustituye $x = 0$ y $y = 1$ en la familia.', math: '1 = 0 - 1 + Ce^{0} = -1 + C' },
          { text: 'Despeja la constante.', math: 'C = 2' },
          { text: 'Comprueba: $y\' = 1 - 2e^{-x}$ y $x - y = x - (x - 1 + 2e^{-x}) = 1 - 2e^{-x}$. Coinciden.' }
        ],
        answer: '$y = x - 1 + 2e^{-x}$. En el lab puedes ver esta curva encima del campo de pendientes.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_LIN, 'x - 1 + 2e^(-x)'], value: 1 }
      },
      {
        type: 'example', heading: 'Dos condiciones para dos constantes',
        problem: '<p>Con la familia $y = c_1\\cos 2x + c_2\\sin 2x$ de $y\'\' + 4y = 0$, resuelve el PVI con $y(0) = 1$ y $y\'(0) = 2$.</p>',
        steps: [
          { text: 'En $x = 0$, $\\cos 0 = 1$ y $\\sin 0 = 0$.', math: 'y(0) = c_1 = 1' },
          { text: 'Deriva la familia y evalúa en 0.', math: "y' = -2c_1\\sin 2x + 2c_2\\cos 2x \\;\\Rightarrow\\; y'(0) = 2c_2 = 2 \\;\\Rightarrow\\; c_2 = 1" }
        ],
        answer: '$y = \\cos 2x + \\sin 2x$. Si olvidas el 2 de la cadena al derivar, te sale $c_2 = 2$: el lab te avisa que la curva no cumple $y\'(0) = 2$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_OSC, 'cos(2x) + sin(2x)'], value: 1 }
      },
      {
        type: 'concept', heading: 'Existencia y unicidad', short: 'Existencia y unicidad',
        body: [
          '¿Todo PVI tiene solución? ¿Y es una sola? Para $y\' = f(x, y)$ con $y(x_0) = y_0$ hay un criterio sencillo (teorema de existencia y unicidad):',
          '<strong>Si $f$ y $\\dfrac{\\partial f}{\\partial y}$ son continuas en un rectángulo que contiene a $(x_0, y_0)$, entonces hay una única solución del PVI en algún intervalo alrededor de $x_0$.</strong>',
          'Geométricamente: por cada punto donde se cumplen las hipótesis pasa una y solo una curva solución, y dos soluciones nunca se cruzan ahí. La $\\partial f/\\partial y$ es la derivada parcial de <a href="../../../calculo-2/sesiones/sesion-04/">Cálculo 2, S04</a>: derivas $f$ respecto a $y$ con $x$ fija.',
          'Si las hipótesis fallan, el teorema no dice nada: puede haber una solución, varias o ninguna. En la figura, $y\' = 3y^{2/3}$ en $(0, 0)$: tanto $y = 0$ como $y = x^3$ salen del mismo punto, porque $\\partial f/\\partial y = 2y^{-1/3}$ no existe en $y = 0$.'
        ],
        diagram: 'c3s01-nounique',
        caption: 'Por el origen pasan dos soluciones de $y\' = 3y^{2/3}$. Ahí la parcial $\\partial f/\\partial y$ no es continua, así que el teorema no garantiza unicidad.'
      },
      {
        type: 'example', heading: '¿Garantiza el teorema una solución única?',
        problem: '<p>Para $y\' = \\sqrt{y}$, ¿garantiza el teorema una solución única por $(1, 4)$? ¿Y por $(0, 0)$?</p>',
        steps: [
          { text: 'Aquí $f = \\sqrt{y}$ y $\\dfrac{\\partial f}{\\partial y} = \\dfrac{1}{2\\sqrt{y}}$.' },
          { text: 'En $(1, 4)$ las dos son continuas cerca del punto ($y > 0$): hay solución única.' },
          { text: 'En $(0, 0)$, $\\partial f/\\partial y$ no está definida en $y = 0$: el teorema no garantiza nada. De hecho $y = 0$ y $y = x^2/4$ (para $x \\ge 0$) salen las dos del origen.', math: "y = \\frac{x^2}{4} \\;\\Rightarrow\\; y' = \\frac{x}{2} = \\sqrt{\\frac{x^2}{4}} = \\sqrt{y} \\quad (x \\ge 0)" }
        ],
        answer: 'Por $(1, 4)$ sí hay garantía de solución única; por $(0, 0)$ no, y de hecho hay al menos dos soluciones.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [{ order: 1, rhs: 'sqrt(y)', x0: 0, ics: [0], domain: [0.1, 3] }, 'x^2/4'], value: 1 }
      },
      {
        type: 'callout', heading: 'La solución puede explotar',
        body: [
          'El teorema garantiza la solución solo «en algún intervalo». El PVI $y\' = y^2$, $y(0) = 1$ tiene solución $y = \\dfrac{1}{1 - x}$, que se va a infinito en $x = 1$ aunque la ecuación se vea inofensiva. El <strong>intervalo de validez</strong> es $(-\\infty, 1)$: el que contiene a $x_0 = 0$. Lo puedes ver en el problema 5 del lab.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: comprobar una solución y resolver el PVI', short: 'Receta',
        steps: [
          { text: 'Mira el orden de la ecuación: te dice cuántas derivadas necesitas y cuántas constantes debe tener la solución general.' },
          { text: 'Deriva la función propuesta las veces necesarias.', tip: 'Cuidado con la regla de la cadena: $(\\sin 2x)\' = 2\\cos 2x$. Es el error que más tumba una comprobación.' },
          { text: 'Sustituye en la ecuación y simplifica hasta que los dos lados sean idénticos para todo $x$ del intervalo. Si sobra algo, no es solución.' },
          { text: 'Para el PVI, sustituye cada condición inicial en la familia (y en sus derivadas) y despeja las constantes.', tip: 'Usa $y\'(x_0)$ en la <em>derivada</em> de la familia, no en la familia.' },
          { text: 'Di en qué intervalo vale: el más grande que contiene a $x_0$ donde la solución está definida.' }
        ]
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué la solución es una función y no un número?', a: 'Porque la incógnita es una función: buscas todo un comportamiento $y(x)$, no un valor. Por eso para comprobar sustituyes la función completa y sus derivadas, y la igualdad debe cumplirse para <em>todo</em> $x$ del intervalo, no solo en un punto.' },
          { q: '¿$(y\')^2 + y = 0$ es de orden 2?', a: 'No: el orden es el de la derivada más alta, y aquí es $y\'$. Es de primer orden, y no lineal por el cuadrado.' },
          { q: '¿Siempre hay que poner $+C$?', a: 'En la solución general, sí: una constante por cada orden. En un PVI ya no, porque las condiciones iniciales fijan todas las constantes. En el lab no se acepta una $C$ suelta: tienes que despejarla.' },
          { q: 'Si el teorema no se cumple, ¿no hay solución?', a: 'No necesariamente. El teorema solo da una condición suficiente. Si falla, puede haber una solución, varias o ninguna; hay que estudiarlo aparte, como en $y\' = 3y^{2/3}$.' },
          { q: '¿Cómo encuentra el lab la curva de referencia si no conoce la fórmula?', a: 'La aproxima con un método numérico que avanza paso a paso siguiendo las pendientes. Esos métodos se estudian en un curso de modelación computacional; aquí solo los usamos para comparar.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Una EDO relaciona una función con sus derivadas; su orden es el de la derivada más alta.',
          'Es lineal si $y$ y sus derivadas aparecen a la primera potencia, multiplicadas solo por funciones de $x$.',
          'Para comprobar una solución: deriva, sustituye y simplifica. El PVI fija las constantes con las condiciones iniciales.',
          'Si $f$ y $\\partial f/\\partial y$ son continuas cerca de $(x_0, y_0)$, el PVI tiene una única solución cerca de $x_0$.'
        ]
      }
    ],

    lab: {
      type: 'ode-compare', title: '¿Es solución?',
      intro: 'Elige un PVI y escribe tu $y(x)$. El lab la grafica junto a la solución numérica, la sustituye en la ecuación y dibuja el residuo $r(x)$: si es cero en todo el dominio y se cumplen las condiciones iniciales, es la solución. Detecta si resolviste la ecuación pero con la constante mal. En los de primer orden también puedes <strong>trazar la curva a mano</strong> sobre el campo de pendientes.',
      cfg: { start: 0, trace: true, problems: [P_LIN, P_EXP, P_INT, P_OSC, P_BLOW] }
    },

    formulas: [
      { label: 'EDO lineal de orden n', tex: 'a_n(x)\\,y^{(n)} + \\dots + a_1(x)\\,y\' + a_0(x)\\,y = g(x)' },
      { label: 'PVI de primer orden', tex: "y' = f(x, y),\\quad y(x_0) = y_0" },
      { label: 'Integración directa', tex: "y' = f(x) \\;\\Rightarrow\\; y = \\int f(x)\\,dx + C" },
      { label: 'Existencia y unicidad', tex: 'f,\\ \\tfrac{\\partial f}{\\partial y}\\ \\text{continuas cerca de } (x_0, y_0) \\Rightarrow \\text{solución única}' }
    ],

    exercises: [
      {
        id: 'c3-s01-orden', title: 'Orden de una ecuación',
        vars: { k: [0, 3, 1] },
        prompt: function (v) {
          var eqs = ["(y')^3 + x\\,y = 0", "y''' - 2y' = e^x", "x\\,y'' + (y')^4 = 1", "y^{(4)} + y^2 = \\sin x"];
          return '<p>¿De qué orden es la ecuación $' + eqs[v.k] + '$?</p>';
        },
        check: 'choice',
        options: function (v) {
          var right = [1, 3, 2, 4][v.k], wrongTxt = { 1: 'Primer orden', 2: 'Segundo orden', 3: 'Tercer orden', 4: 'Cuarto orden' };
          var expo = [3, 0, 4, 2][v.k];
          var out = [{ text: wrongTxt[right], correct: true }];
          [1, 2, 3, 4].filter(function (n) { return n !== right; }).forEach(function (n) {
            out.push({ text: wrongTxt[n], say: n === expo ? 'Ese es un exponente, no el orden. El orden lo da la derivada más alta.' : 'Busca la derivada con más primas (o el número entre paréntesis en $y^{(n)}$).' });
          });
          return out;
        },
        answer: function (v) { return { 1: 'Primer orden', 2: 'Segundo orden', 3: 'Tercer orden', 4: 'Cuarto orden' }[[1, 3, 2, 4][v.k]]; },
        hint: 'El orden es el de la derivada más alta, sin importar a qué potencia esté.',
        solution: function (v) { return ['La derivada más alta es $y\'$: primer orden (el cubo no cuenta).', 'La derivada más alta es $y\'\'\'$: tercer orden.', 'La derivada más alta es $y\'\'$: segundo orden.', 'Aparece $y^{(4)}$: cuarto orden.'][v.k]; }
      },
      {
        id: 'c3-s01-lineal', title: '¿Lineal o no lineal?',
        vars: { k: [0, 4, 1] },
        prompt: function (v) {
          var eqs = ["x^3y'' - e^x y' + 5y = \\cos x", "y' + y^2 = x", "y'' + \\sin y = 0", "y\\,y' = 2x", "y' + x^4 y = e^{x^2}"];
          return '<p>La ecuación $' + eqs[v.k] + '$, ¿es lineal?</p>';
        },
        check: 'choice',
        options: function (v) {
          var lin = v.k === 0 || v.k === 4;
          var why = ['', 'Tiene $y^2$: $y$ no está a la primera potencia.', '$y$ está dentro de una función (el seno).', '$y$ multiplica a su propia derivada.', ''][v.k];
          return [
            { text: 'Sí, es lineal', correct: lin, say: lin ? null : why },
            { text: 'No, es no lineal', correct: !lin, say: lin ? 'Los coeficientes pueden ser cualquier función de $x$ (potencias, exponenciales…). Lo que importa es que $y$ y sus derivadas estén a la primera potencia.' : null }
          ];
        },
        answer: function (v) { return v.k === 0 || v.k === 4 ? 'Sí, es lineal' : 'No, es no lineal'; },
        hint: 'Fíjate solo en cómo aparecen $y$, $y\'$, $y\'\'$: ¿a la primera potencia, sin multiplicarse entre sí y sin estar dentro de otra función?',
        solution: function (v) { return v.k === 0 || v.k === 4 ? 'Es lineal: $y$ y sus derivadas aparecen a la primera potencia, multiplicadas solo por funciones de $x$.' : 'No es lineal: ' + ['', 'aparece $y^2$.', '$y$ está dentro del seno.', '$y$ multiplica a $y\'$.', ''][v.k]; }
      },
      {
        id: 'c3-s01-constante', title: 'La constante del PVI',
        vars: { a: [-2, 2, 1], b: [-3, 4, 1] },
        prompt: function (v) { return '<p>La familia $y = x - 1 + Ce^{-x}$ resuelve $y\' = x - y$. ¿Qué valor de $C$ da la solución con $y(' + v.a + ') = ' + v.b + '$?</p>'; },
        check: 'numeric',
        answer: function (v) { return (v.b - v.a + 1) * Math.exp(v.a); },
        mistakes: {
          noExp: function (v) { return v.b - v.a + 1; },
          signExp: function (v) { return (v.b - v.a + 1) * Math.exp(-v.a); },
          dropMinusOne: function (v) { return (v.b - v.a) * Math.exp(v.a); }
        },
        feedback: [
          { when: 'noExp', say: 'Olvidaste el $e^{-x}$ evaluado en el punto: $C\\,e^{-a}$ no es $C$ si $a \\neq 0$.' },
          { when: 'signExp', say: 'Al despejar, $C = (\\dots)/e^{-a} = (\\dots)\\,e^{a}$: el signo del exponente cambia.' },
          { when: 'dropMinusOne', say: 'Se te fue el $-1$ de la familia: $y(a) = a - 1 + Ce^{-a}$.' }
        ],
        // Oráculo independiente: con esa C, la familia evaluada en a debe dar b (y la C que lo logra es única).
        oracle: { lab: 'value', value: function (v) {
          var lo = -1e4, hi = 1e4;
          for (var i = 0; i < 200; i++) { var m = (lo + hi) / 2; if (v.a - 1 + m * Math.exp(-v.a) < v.b) lo = m; else hi = m; }
          return (lo + hi) / 2;
        } },
        where: function (v) { return v.a !== 0 && v.b - v.a + 1 !== 0; },
        hint: 'Sustituye $x = a$ y $y = b$ en la familia y despeja $C$.',
        solution: function (v) {
          return '$$' + v.b + ' = ' + v.a + ' - 1 + Ce^{' + (-v.a) + '} \\;\\Rightarrow\\; C = (' + v.b + sgn(-v.a) + ' + 1)\\,e^{' + v.a + '} = ' + (v.b - v.a + 1) + 'e^{' + v.a + '} \\approx ' + fx((v.b - v.a + 1) * Math.exp(v.a)) + '$$';
        }
      },
      {
        id: 'c3-s01-directa', title: 'PVI por integración directa',
        vars: { a: [2, 9, 1], b: [-6, 6, 1], c: [-5, 5, 1] },
        where: function (v) { return v.b !== 0 && v.c !== 0; },
        prompt: function (v) { return '<p>Resuelve el PVI $y\' = ' + v.a + 'x^2' + sgn(v.b) + '$, con $y(0) = ' + v.c + '$. Escribe $y(x)$.</p>'; },
        check: 'expr', domain: [-2, 2],
        answer: function (v) { return (v.a / 3) + '*x^3 + ' + v.b + '*x + ' + v.c; },
        mistakes: {
          noC: function (v) { return (v.a / 3) + '*x^3 + ' + v.b + '*x'; },
          noDivide: function (v) { return v.a + '*x^3 + ' + v.b + '*x + ' + v.c; },
          derived: function (v) { return (2 * v.a) + '*x + ' + v.c; }
        },
        feedback: [
          { when: 'noC', say: function (v) { return 'Falta la constante: la condición $y(0) = ' + v.c + '$ dice que vale $' + v.c + '$.'; } },
          { when: 'noDivide', say: 'Al integrar $x^2$ sale $x^3/3$: falta dividir entre 3.' },
          { when: 'derived', say: 'Derivaste en lugar de integrar. Si $y\' = f(x)$, entonces $y = \\int f(x)\\,dx$.' }
        ],
        hint: 'Integra los dos lados respecto a $x$ y usa $y(0)$ para la constante.',
        solution: function (v) {
          var k = v.a % 3 === 0 ? String(v.a / 3) : '\\tfrac{' + v.a + '}{3}';
          return '$$y = \\int (' + v.a + 'x^2' + sgn(v.b) + ')\\,dx = ' + k + 'x^3' + cx(v.b, 'x') + ' + C$$ Con $y(0) = C = ' + v.c + '$: $$y = ' + k + 'x^3' + cx(v.b, 'x') + sgn(v.c) + '$$';
        }
      },
      {
        id: 'c3-s01-oscilador', title: 'Dos condiciones iniciales',
        vars: { w: [2, 5, 1], A: [-4, 4, 1], B: [-9, 9, 1] },
        where: function (v) { return v.A !== 0 && v.B !== 0 && v.B % v.w !== 0; },
        prompt: function (v) { return '<p>La solución general de $y\'\' + ' + (v.w * v.w) + 'y = 0$ es $y = c_1\\cos ' + v.w + 'x + c_2\\sin ' + v.w + 'x$. Si $y(0) = ' + v.A + '$ y $y\'(0) = ' + v.B + '$, ¿cuánto vale $c_2$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.B / v.w; },
        mistakes: {
          noChain: function (v) { return v.B; },
          swapped: function (v) { return v.A; },
          times: function (v) { return v.B * v.w; }
        },
        feedback: [
          { when: 'noChain', say: function (v) { return 'Al derivar $\\sin ' + v.w + 'x$ sale $' + v.w + '\\cos ' + v.w + 'x$: $y\'(0) = ' + v.w + 'c_2$.'; } },
          { when: 'swapped', say: 'Ese es $c_1$, que sale de $y(0)$. $c_2$ sale de $y\'(0)$.' },
          { when: 'times', say: 'Despeja dividiendo: si $' + 'w\\,c_2 = y\'(0)$, entonces $c_2 = y\'(0)/w$.' }
        ],
        // Oráculo: integra el PVI con RK4 y lee c₂ = y(π/(2w)) (ahí el coseno vale 0 y el seno 1).
        oracle: { lab: 'value', value: function (v) {
          var LM = window.LabMath, math = window.math;
          if (LM && LM.ode && math) return LM.ode.solveAt(math, { order: 2, rhs: '-' + (v.w * v.w) + '*y', x0: 0, ics: [v.A, v.B], domain: [0, 2] }, Math.PI / (2 * v.w));
          return v.B / v.w;
        } },
        hint: 'Deriva la familia y evalúa en 0: $\\cos 0 = 1$, $\\sin 0 = 0$.',
        solution: function (v) { return '$$y\' = -' + v.w + 'c_1\\sin ' + v.w + 'x + ' + v.w + 'c_2\\cos ' + v.w + 'x \\;\\Rightarrow\\; y\'(0) = ' + v.w + 'c_2 = ' + v.B + ' \\;\\Rightarrow\\; c_2 = \\frac{' + v.B + '}{' + v.w + '} \\approx ' + fx(v.B / v.w) + '$$'; }
      },
      {
        id: 'c3-s01-pendiente', title: 'Leer el campo de pendientes',
        vars: { a: [-3, 3, 1], b: [-3, 3, 1], k: [2, 4, 1] },
        where: function (v) { return v.a !== 0 && v.b !== 0 && v.a * v.b !== v.k * v.b; },
        prompt: function (v) { return '<p>En el campo de pendientes de $y\' = x\\,y - ' + v.k + 'y$, ¿qué pendiente tiene la rayita en el punto $(' + v.a + ', ' + v.b + ')$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.a * v.b - v.k * v.b; },
        mistakes: {
          swapped: function (v) { return v.b * v.a - v.k * v.a; },
          noSecond: function (v) { return v.a * v.b; }
        },
        feedback: [
          { when: 'swapped', say: 'Intercambiaste las coordenadas: en $(a, b)$, $x = a$ y $y = b$.' },
          { when: 'noSecond', say: 'Falta el término $-ky$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return v.b * (v.a - v.k); } },
        hint: 'La pendiente en $(x, y)$ es el lado derecho de la ecuación evaluado ahí.',
        solution: function (v) { return '$$y\' = (' + v.a + ')(' + v.b + ') - ' + v.k + '(' + v.b + ') = ' + (v.a * v.b - v.k * v.b) + '$$'; }
      },
      {
        id: 'c3-s01-unicidad', title: '¿Hay garantía de solución única?',
        vars: { c: [1, 6, 1], x0: [-3, 3, 1], d: [1, 5, 1], k: [0, 1, 1] },
        prompt: function (v) {
          var y0 = v.k ? v.c : v.c + v.d;
          return '<p>Para el PVI $y\' = \\sqrt{y - ' + v.c + '}$ con $y(' + v.x0 + ') = ' + y0 + '$, ¿garantiza el teorema de existencia y unicidad una solución única cerca de $x = ' + v.x0 + '$?</p>';
        },
        check: 'choice',
        options: function (v) {
          var yes = !v.k;
          return [
            { text: 'Sí: $f$ y $\\partial f/\\partial y$ son continuas cerca del punto', correct: yes, say: yes ? null : 'En $y = ' + v.c + '$, $\\partial f/\\partial y = \\frac{1}{2\\sqrt{y - ' + v.c + '}}$ no está definida.' },
            { text: 'No: $\\partial f/\\partial y$ no es continua en el punto', correct: !yes, say: yes ? 'Aquí $y_0 > ' + v.c + '$, así que la raíz y su derivada son continuas cerca del punto.' : null },
            { text: 'No: $f$ no es continua en el punto', correct: false, say: 'La raíz sí es continua donde está definida. El problema, si lo hay, es su derivada respecto a $y$.' }
          ];
        },
        answer: function (v) { return !v.k ? 'Sí: $f$ y $\\partial f/\\partial y$ son continuas cerca del punto' : 'No: $\\partial f/\\partial y$ no es continua en el punto'; },
        hint: 'Calcula $\\partial f/\\partial y$ y revisa si es continua cerca de $(x_0, y_0)$.',
        solution: function (v) { return '$f = \\sqrt{y - ' + v.c + '}$ y $\\dfrac{\\partial f}{\\partial y} = \\dfrac{1}{2\\sqrt{y - ' + v.c + '}}$. ' + (v.k ? 'En $y_0 = ' + v.c + '$ la parcial no está definida: el teorema no garantiza unicidad.' : 'Con $y_0 = ' + (v.c + v.d) + ' > ' + v.c + '$ las dos son continuas cerca del punto: hay solución única.'); }
      }
    ],

    quiz: { tags: ['c3.S01'], count: 8 },

    errors: [
      'Confundir el orden con el exponente: $(y\')^3 = x$ es de primer orden.',
      'Creer que $x^5y\'$ hace no lineal la ecuación: los coeficientes pueden ser cualquier función de $x$.',
      'Comprobar una solución en un solo punto: la igualdad debe valer para todo $x$ del intervalo.',
      'Olvidar la regla de la cadena al derivar ($\\sin 2x \\to 2\\cos 2x$).',
      'Usar $y\'(x_0)$ en la familia en lugar de en su derivada.',
      'Pensar que si el teorema falla no hay solución: solo deja de garantizar.'
    ],

    teacher: {
      plan: [
        'Arranca con el velocímetro: la ecuación es la regla del cambio; la condición inicial, el punto de salida.',
        'Clasifica en el pizarrón 6 o 7 ecuaciones por orden y linealidad; que voten antes de explicar.',
        'Explainer del campo de pendientes y luego el lab en modo de trazo a mano: que tracen la solución por (0, 1) antes de ver la fórmula.',
        'Cierra con existencia y unicidad usando $y\' = 3y^{2/3}$ y el problema 5 del lab (la solución que explota).'
      ],
      check: [
        'Que comprueben una solución derivando y sustituyendo, sin resolver.',
        'Que digan cuántas condiciones iniciales hacen falta según el orden.'
      ],
      note: 'Los métodos numéricos (Euler, RK) no se enseñan aquí: el lab solo los usa para dibujar la referencia. El teorema de Picard se enuncia sin demostración.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 2</em>, §4.1 “Basics of Differential Equations”. <a href="https://openstax.org/books/calculus-volume-2/pages/4-1-basics-of-differential-equations">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 2</em>, §4.2 “Direction Fields and Numerical Methods”. <a href="https://openstax.org/books/calculus-volume-2/pages/4-2-direction-fields-and-numerical-methods">openstax.org</a> (CC BY-NC-SA 4.0).',
      'MIT OpenCourseWare. <em>18.03SC Differential Equations</em> (Fall 2011), Unit I: First Order Differential Equations. <a href="https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/">ocw.mit.edu</a> (CC BY-NC-SA 4.0).',
      'Boyce, W. E., DiPrima, R. C. y Meade, D. B. <em>Elementary Differential Equations and Boundary Value Problems</em>, 11.ª ed., Wiley, §1.3 y §2.4 (lectura de apoyo para clasificación y existencia y unicidad).'
    ],

    prev: null,
    next: 'sesion-02'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
