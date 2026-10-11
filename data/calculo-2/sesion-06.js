/* =====================================================================
   Cálculo 2 · S06 · Regla de la cadena: árbol de dependencias y derivación
   implícita (bloque B · Gradiente y optimización).
   Fuente: OpenStax, Calculus Volume 3, §4.5, CC BY-NC-SA 4.0.
   Las cuentas se hacen aquí a mano (fórmulas propias) y scripts/examples.test.js las
   compara contra LabMath.chainTree (lab chain-tree), que arma el árbol con las parciales
   de math.js; los ejercicios numéricos usan como oráculo la derivada numérica de la
   composición (o de la curva de nivel en la implícita), sin regla de la cadena.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  // Número con signo para LaTeX: 3 → '+ 3', −3 → '- 3'.
  function sg(n) { return n < 0 ? '- ' + Math.abs(n) : '+ ' + n; }
  // Paréntesis si es negativo: (−3).
  function pr(n) { return n < 0 ? '(' + n + ')' : String(n); }

  // La respuesta y cada error típico difieren al menos 3 % entre sí (mensajes "casi" sin ambigüedad).
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) {
          if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 0.5)) return false;
        }
      }
      return true;
    };
  }

  // Ejemplo 5: cilindro que crece.
  var cyl = { r: 5, h: 12, dr: 0.3, dh: 0.4 };
  cyl.pw = 2 * Math.PI * cyl.r * cyl.h * cyl.dr;
  cyl.pt = Math.PI * cyl.r * cyl.r * cyl.dh;
  cyl.dV = cyl.pw + cyl.pt;
  var S3 = Math.sqrt(3);

  // Escenarios del ejercicio de estructura: [enunciado, cuántos términos].
  var TREES = [
    ['$w = f(x, y, z)$ con $x = x(s, t)$, $y = y(s, t)$ y $z = z(t)$. ¿Cuántos términos tiene $\\dfrac{\\partial w}{\\partial s}$?', 2, 'Solo $x$ y $y$ dependen de $s$; $z$ no.'],
    ['$w = f(x, y, z)$ con $x = x(s, t)$, $y = y(s, t)$ y $z = z(t)$. ¿Cuántos términos tiene $\\dfrac{\\partial w}{\\partial t}$?', 3, 'Las tres intermedias dependen de $t$.'],
    ['$z = f(x, y)$ con $x = x(t)$ y $y = y(s)$. ¿Cuántos términos tiene $\\dfrac{\\partial z}{\\partial t}$?', 1, 'Solo $x$ depende de $t$: hay un solo camino de $z$ a $t$.'],
    ['$w = f(x, y, z)$ con $x = x(t)$, $y = y(t)$ y $z = z(t)$. ¿Cuántos términos tiene $\\dfrac{dw}{dt}$?', 3, 'Tres intermedias, cada una con su rama hacia $t$.'],
    ['$z = f(x, y)$ con $x = x(s, t)$ y $y = y(s, t)$. ¿Cuántos términos tiene $\\dfrac{\\partial z}{\\partial s}$?', 2, 'Dos intermedias y las dos dependen de $s$.'],
    ['$w = f(x, y, z)$ con $x = x(s)$, $y = y(s, t)$ y $z = z(s, t)$. ¿Cuántos términos tiene $\\dfrac{\\partial w}{\\partial t}$?', 2, '$x$ no depende de $t$: quedan los caminos por $y$ y por $z$.']
  ];
  var WHY = {
    1: 'Un término por cada camino que llega a la variable; aquí hay más de uno.',
    2: 'Cuenta solo las intermedias que sí dependen de la variable que te piden.',
    3: 'No todas las intermedias dependen de esa variable: revisa de qué depende cada una.',
    4: 'Los caminos se cuentan de la raíz a la variable; no se multiplican intermedias por parámetros.'
  };

  var data = window.SESSION_DATA = {
    slug: 'sesion-06', number: '06', group: 'B · Gradiente y optimización',
    title: 'Regla de la cadena: árbol de dependencias y derivación implícita', temario: [],
    minutes: 150,
    quote: 'Si algo cambia por varios caminos a la vez, el cambio total es la suma de lo que aporta cada camino.',
    badges: [
      'Dibujar el árbol de dependencias de una composición y contar sus caminos.',
      'Calcular $dz/dt$ y $\\partial z/\\partial s$ multiplicando a lo largo de cada camino y sumando los caminos.',
      'Resolver razones de cambio relacionadas con dos o más cantidades que cambian a la vez.',
      'Derivar implícitamente con parciales: $dy/dx = -F_x/F_y$ y $\\partial z/\\partial x = -F_x/F_z$.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Si $z$ depende de $x$ y $y$, y las dos dependen de $t$, entonces $z$ cambia con $t$ <strong>por dos caminos</strong>. Multiplica a lo largo de cada camino y suma los caminos.',
        recall: [
          'La <a href="../../../calculo-1/sesiones/sesion-05/">regla de la cadena</a> de Cálculo 1 (S05): $\\dfrac{dy}{dx} = \\dfrac{dy}{du}\\cdot\\dfrac{du}{dx}$.',
          'Las <a href="../sesion-04/">derivadas parciales</a> (S04 de este curso): para $\\partial z/\\partial x$, la $y$ se queda quieta.',
          'La <a href="../sesion-05/">diferencial total</a> (S05): $dz = f_x\\,dx + f_y\\,dy$.',
          'La <a href="../../../calculo-1/sesiones/sesion-06/">derivación implícita</a> de Cálculo 1 (S06).'
        ],
        why: 'En la vida real casi nada depende de una sola cosa. La temperatura que mide un globo depende de dónde está, y dónde está depende del tiempo. El volumen de un tanque que se dilata depende del radio y de la altura, y los dos cambian. La regla de la cadena dice cómo juntar todos esos cambios.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Un globo aerostático va a baja altura sobre un cerro. La temperatura del aire depende del lugar: más fresco cerca de la cima, más caliente abajo. El viento empuja el globo hacia el este y hacia el norte al mismo tiempo. ¿Por qué cambia la temperatura que mide el globo? Por <strong>dos razones</strong>: porque se mueve hacia el este y porque se mueve hacia el norte.',
          'Cada razón aporta un pedazo. Hacia el este, el pedazo es «cuánto cambia la temperatura por kilómetro al este» por «cuántos kilómetros al este recorre por hora». Hacia el norte, lo mismo con el norte. El cambio total por hora es la <strong>suma</strong> de los dos pedazos.',
          'Es como tu gasto en gasolina: depende del precio del litro y de cuántos litros cargas. Si los dos suben a la vez, tu gasto sube por los dos lados, y el aumento total es lo que aporta el precio más lo que aportan los litros.'
        ],
        diagram: 'c2s06-hill',
        caption: 'El globo cruza las curvas de igual temperatura. Su avance hacia el este ($dx/dt$) y hacia el norte ($dy/dt$) aporta cada uno su parte al cambio de $T$.'
      },
      {
        type: 'concept', heading: 'Primero, la cadena de una variable', short: 'Repaso de una variable',
        body: [
          'En <a href="../../../calculo-1/sesiones/sesion-05/">Cálculo 1</a>, si $y = f(u)$ y $u = g(x)$, el cambio pasa por un solo eslabón: $$\\frac{dy}{dx} = \\frac{dy}{du}\\cdot\\frac{du}{dx}$$',
          'Piénsalo como un camino de $y$ a $x$ que pasa por $u$: cada tramo del camino tiene su derivada y se <strong>multiplican</strong>. Si $u$ cambia el triple de rápido que $x$, y $y$ cambia el doble de rápido que $u$, entonces $y$ cambia seis veces más rápido que $x$.',
          'Con varias variables pasa lo mismo, solo que ahora hay <strong>varios caminos</strong>. Cada camino se recorre multiplicando, como antes, y al final se suman.'
        ]
      },
      {
        type: 'explainer', heading: 'El árbol de dependencias', short: 'El árbol',
        title: '$z = f(x, y)$ con $x = x(t)$ y $y = y(t)$',
        intro: 'El árbol es un mapa de quién depende de quién. Se arma de arriba hacia abajo y luego se recorre camino por camino.',
        diagram: 'c2s06-tree',
        steps: [
          { text: 'Arriba va lo que quieres derivar: $z$.', state: { kind: 'one', lv: 0, h1: 0, h2: 0, f1: 0, f2: 0 } },
          { text: '$z$ depende de $x$ y de $y$: una rama a cada una. En esas ramas van las parciales $\\partial z/\\partial x$ y $\\partial z/\\partial y$, porque $z$ tiene dos variables.', state: { kind: 'one', lv: 1, h1: 0, h2: 0, f1: 0, f2: 0 } },
          { text: '$x$ y $y$ dependen de $t$: cuelga una $t$ debajo de cada una. En esas ramas van $dx/dt$ y $dy/dt$, derivadas de siempre, porque $x$ y $y$ solo dependen de $t$.', state: { kind: 'one', lv: 2, h1: 0, h2: 0, f1: 0, f2: 0 } },
          { text: 'Primer camino, $z \\to x \\to t$: multiplica lo que hay en sus ramas, $\\dfrac{\\partial z}{\\partial x}\\cdot\\dfrac{dx}{dt}$. Es lo que aporta moverse en $x$.', state: { kind: 'one', lv: 2, h1: 1, h2: 0, f1: 1, f2: 0 } },
          { text: 'Segundo camino, $z \\to y \\to t$: $\\dfrac{\\partial z}{\\partial y}\\cdot\\dfrac{dy}{dt}$. Es lo que aporta moverse en $y$.', state: { kind: 'one', lv: 2, h1: 0, h2: 1, f1: 1, f2: 1 } },
          { text: 'Suma los caminos: $$\\frac{dz}{dt} = \\frac{\\partial z}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial z}{\\partial y}\\frac{dy}{dt}$$ Dentro de un camino se multiplica; entre caminos se suma.', state: { kind: 'one', lv: 2, h1: 0, h2: 0, f1: 1, f2: 1 } }
        ]
      },
      {
        type: 'concept', heading: '¿De dónde sale la fórmula?', short: 'De dónde sale',
        body: [
          'En la <a href="../sesion-05/">S05</a> viste la diferencial total: si $x$ cambia un poquito $dx$ y $y$ cambia $dy$, entonces $z$ cambia $$dz = \\frac{\\partial z}{\\partial x}\\,dx + \\frac{\\partial z}{\\partial y}\\,dy$$',
          'Si esos cambios ocurren en un tiempo $dt$, divide todo entre $dt$ y te queda la regla de la cadena: $$\\frac{dz}{dt} = \\frac{\\partial z}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial z}{\\partial y}\\frac{dy}{dt}$$',
          'Por eso se suma: cada término es lo que sube (o baja) $z$ por el movimiento en una dirección, y los dos movimientos pasan al mismo tiempo.'
        ]
      },
      {
        type: 'callout', heading: '¿Dónde se evalúan las parciales?',
        body: [
          'Las parciales $\\partial z/\\partial x$ y $\\partial z/\\partial y$ son funciones de $x$ y $y$. Para usarlas en $t = t_0$, primero calcula <strong>dónde estás</strong>: $x_0 = x(t_0)$ y $y_0 = y(t_0)$. Las parciales se evalúan en $(x_0, y_0)$, no en $t_0$.',
          'Ejemplo: si $x = t^2$, en $t = 3$ la parcial se evalúa con $x = 9$, no con $x = 3$. Es el error más común de esta sesión.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: regla de la cadena con árbol', short: 'Receta',
        steps: [
          { text: 'Dibuja el árbol: arriba la función que derivas, en medio las intermedias de las que depende, abajo las variables de las que dependen ellas.' },
          { text: 'Cuenta los caminos de arriba hasta la variable que te piden. Cada camino es <strong>un término</strong> de la respuesta.', tip: 'Si una intermedia no depende de esa variable, su camino no llega: ese término no existe.' },
          { text: 'En cada camino, multiplica las derivadas de sus ramas. Rama que sale de algo con varias variables: parcial ($\\partial$). Rama que sale de algo con una sola variable: derivada ordinaria ($d$).' },
          { text: 'Suma los términos de todos los caminos.', tip: 'Los caminos se suman, no se multiplican entre sí: $\\big(\\tfrac{\\partial z}{\\partial x}\\tfrac{dx}{dt}\\big)\\big(\\tfrac{\\partial z}{\\partial y}\\tfrac{dy}{dt}\\big)$ no significa nada.' },
          { text: 'Si te dan un valor del parámetro, calcula primero $x_0$, $y_0$ y luego sustituye todo.', tip: 'Las parciales de afuera se evalúan en $(x(t_0), y(t_0))$, no en $t_0$.' }
        ]
      },
      {
        type: 'example', heading: 'Dos caminos, con comprobación',
        problem: '<p>Si $z = x^2y$, con $x = t^2$ y $y = 3t + 1$, calcula $\\dfrac{dz}{dt}$ en $t = 1$.</p>',
        steps: [
          { text: 'Dónde estás en $t = 1$:', math: 'x_0 = 1^2 = 1 \\qquad y_0 = 3(1) + 1 = 4' },
          { text: 'Las parciales de afuera, evaluadas en $(1, 4)$:', math: '\\frac{\\partial z}{\\partial x} = 2xy = 2(1)(4) = 8 \\qquad \\frac{\\partial z}{\\partial y} = x^2 = 1' },
          { text: 'Las derivadas de adentro, en $t = 1$:', math: '\\frac{dx}{dt} = 2t = 2 \\qquad \\frac{dy}{dt} = 3' },
          { text: 'Multiplica en cada camino y suma:', math: '\\frac{dz}{dt} = (8)(2) + (1)(3) = 16 + 3 = 19' },
          { text: 'Comprueba sustituyendo antes de derivar: $z = t^4(3t + 1) = 3t^5 + t^4$, así que $z\' = 15t^4 + 4t^3$, que en $t = 1$ da $19$. Coincide.' }
        ],
        answer: '$\\dfrac{dz}{dt} = 19$ en $t = 1$. El camino por $x$ aporta $16$ y el camino por $y$ aporta $3$.',
        verify: { lab: 'call', mod: 'chainTree', fn: 'tree', math: true, args: [{ f: 'x^2*y', inner: { x: 't^2', y: '3t + 1' }, params: ['t'] }, { t: 1 }, 't'], values: { total: 19, 'paths.0.prod': 16, 'paths.1.prod': 3 } }
      },
      {
        type: 'example', heading: 'El globo sobre el cerro',
        problem: '<p>Sobre un cerro, la temperatura del aire a la altura de un globo es $T(x, y) = 30 - x^2 - 2y^2$ (en °C, con $x$ y $y$ en km). El viento lleva el globo por $x = 1 + t$, $y = 2t$ ($t$ en horas). ¿Qué tan rápido cambia la temperatura que mide el globo en $t = 0.5$ h?</p>',
        steps: [
          { text: 'Dónde está el globo en $t = 0.5$:', math: 'x_0 = 1.5 \\qquad y_0 = 1' },
          { text: 'Cuánto cambia $T$ por kilómetro en cada dirección, en $(1.5, 1)$:', math: '\\frac{\\partial T}{\\partial x} = -2x = -3\\ ^{\\circ}\\text{C/km} \\qquad \\frac{\\partial T}{\\partial y} = -4y = -4\\ ^{\\circ}\\text{C/km}' },
          { text: 'Qué tan rápido avanza en cada dirección:', math: '\\frac{dx}{dt} = 1\\ \\text{km/h} \\qquad \\frac{dy}{dt} = 2\\ \\text{km/h}' },
          { text: 'Suma lo que aporta cada dirección. Las unidades salen solas: (°C/km)(km/h) = °C/h.', math: '\\frac{dT}{dt} = (-3)(1) + (-4)(2) = -3 - 8 = -11\\ ^{\\circ}\\text{C/h}' }
        ],
        answer: 'La temperatura baja a razón de $11$ °C por hora. Avanzar al norte pesa más: aporta $-8$ de los $-11$.',
        verify: { lab: 'call', mod: 'chainTree', fn: 'tree', math: true, args: [{ f: '30 - x^2 - 2y^2', inner: { x: '1 + t', y: '2t' }, params: ['t'] }, { t: 0.5 }, 't'], values: { total: -11, 'paths.1.prod': -8 } }
      },
      {
        type: 'concept', heading: 'Dos parámetros: x(s, t) y y(s, t)', short: 'Dos parámetros',
        body: [
          'A veces las intermedias dependen de dos variables, por ejemplo $x = x(s, t)$ y $y = y(s, t)$. Entonces $z$ también depende de $s$ y $t$, y tiene dos parciales: $\\partial z/\\partial s$ y $\\partial z/\\partial t$.',
          'En el árbol, debajo de cada intermedia cuelgan <strong>dos</strong> hojas: $s$ y $t$. Para $\\partial z/\\partial s$ solo sigues los caminos que terminan en una $s$: $$\\frac{\\partial z}{\\partial s} = \\frac{\\partial z}{\\partial x}\\frac{\\partial x}{\\partial s} + \\frac{\\partial z}{\\partial y}\\frac{\\partial y}{\\partial s} \\qquad \\frac{\\partial z}{\\partial t} = \\frac{\\partial z}{\\partial x}\\frac{\\partial x}{\\partial t} + \\frac{\\partial z}{\\partial y}\\frac{\\partial y}{\\partial t}$$',
          'Ahora todas las ramas llevan $\\partial$: $x$ tiene dos variables, así que su derivada respecto a $s$ es parcial ($t$ se queda quieta).'
        ],
        diagram: 'c2s06-tree',
        state: { kind: 'two', w: 's', lv: 2, h1: 0, h2: 0, f1: 1, f2: 1 },
        caption: 'Para $\\partial z/\\partial s$ se recorren los dos caminos que terminan en $s$; las hojas $t$ quedan fuera.'
      },
      {
        type: 'example', heading: 'Polares: una función que gira',
        problem: '<p>Si $z = x^2 - y^2$, con $x = s\\cos t$ y $y = s\\sin t$ (las polares de la S02, con $s$ en lugar de $r$), calcula $\\dfrac{\\partial z}{\\partial t}$ en $s = 2$, $t = \\dfrac{\\pi}{6}$.</p>',
        steps: [
          { text: 'Dónde estás:', math: 'x_0 = 2\\cos\\tfrac{\\pi}{6} = \\sqrt{3} \\qquad y_0 = 2\\sin\\tfrac{\\pi}{6} = 1' },
          { text: 'Parciales de afuera en $(\\sqrt{3}, 1)$:', math: '\\frac{\\partial z}{\\partial x} = 2x = 2\\sqrt{3} \\qquad \\frac{\\partial z}{\\partial y} = -2y = -2' },
          { text: 'Parciales de adentro respecto a $t$ ($s$ fija):', math: '\\frac{\\partial x}{\\partial t} = -s\\sin t = -1 \\qquad \\frac{\\partial y}{\\partial t} = s\\cos t = \\sqrt{3}' },
          { text: 'Suma los dos caminos que llegan a $t$:', math: '\\frac{\\partial z}{\\partial t} = (2\\sqrt{3})(-1) + (-2)(\\sqrt{3}) = -4\\sqrt{3} \\approx ' + fx(-4 * S3) },
          { text: 'Comprueba: $z = s^2\\cos^2 t - s^2\\sin^2 t = s^2\\cos 2t$, así que $\\partial z/\\partial t = -2s^2\\sin 2t = -8\\sin\\tfrac{\\pi}{3} = -4\\sqrt{3}$.' }
        ],
        answer: '$\\dfrac{\\partial z}{\\partial t} = -4\\sqrt{3} \\approx ' + fx(-4 * S3) + '$. Al girar (aumentar $t$) con $s$ fijo, $z$ baja.',
        verify: { lab: 'call', mod: 'chainTree', fn: 'tree', math: true, args: [{ f: 'x^2 - y^2', inner: { x: 's*cos(t)', y: 's*sin(t)' }, params: ['s', 't'] }, { s: 2, t: Math.PI / 6 }, 't'], values: { total: -4 * S3 } }
      },
      {
        type: 'concept', heading: 'Tres variables intermedias', short: 'Tres intermedias',
        body: [
          'Si $w = f(x, y, z)$ y las tres dependen de $t$, el árbol tiene tres ramas y tres caminos: $$\\frac{dw}{dt} = \\frac{\\partial w}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial w}{\\partial y}\\frac{dy}{dt} + \\frac{\\partial w}{\\partial z}\\frac{dz}{dt}$$',
          'La regla no cambia: un término por camino. Con el árbol no tienes que memorizar una fórmula para cada caso; la dibujas.'
        ],
        diagram: 'c2s06-tree',
        state: { kind: 'three', lv: 2, h1: 0, h2: 0, h3: 0, f1: 1, f2: 1, f3: 1 },
        caption: 'Tres intermedias que dependen de $t$: tres caminos, tres términos.'
      },
      {
        type: 'example', heading: 'Tres caminos, dos se cancelan',
        problem: '<p>Si $w = xy + z^2$, con $x = \\cos t$, $y = \\sin t$ y $z = t$, calcula $\\dfrac{dw}{dt}$ en $t = \\dfrac{\\pi}{4}$.</p>',
        steps: [
          { text: 'Dónde estás:', math: 'x_0 = y_0 = \\tfrac{\\sqrt{2}}{2} \\approx 0.71 \\qquad z_0 = \\tfrac{\\pi}{4}' },
          { text: 'Camino por $x$: $\\dfrac{\\partial w}{\\partial x} = y$ y $\\dfrac{dx}{dt} = -\\sin t$.', math: '\\Big(\\tfrac{\\sqrt{2}}{2}\\Big)\\Big(-\\tfrac{\\sqrt{2}}{2}\\Big) = -0.5' },
          { text: 'Camino por $y$: $\\dfrac{\\partial w}{\\partial y} = x$ y $\\dfrac{dy}{dt} = \\cos t$.', math: '\\Big(\\tfrac{\\sqrt{2}}{2}\\Big)\\Big(\\tfrac{\\sqrt{2}}{2}\\Big) = 0.5' },
          { text: 'Camino por $z$: $\\dfrac{\\partial w}{\\partial z} = 2z$ y $\\dfrac{dz}{dt} = 1$.', math: '2\\cdot\\tfrac{\\pi}{4}\\cdot 1 = \\tfrac{\\pi}{2}' },
          { text: 'Suma los tres:', math: '\\frac{dw}{dt} = -0.5 + 0.5 + \\frac{\\pi}{2} = \\frac{\\pi}{2} \\approx ' + fx(Math.PI / 2) }
        ],
        answer: '$\\dfrac{dw}{dt} = \\dfrac{\\pi}{2} \\approx ' + fx(Math.PI / 2) + '$. Los caminos por $x$ y por $y$ se cancelan en ese instante, pero hay que calcularlos para saberlo.',
        verify: { lab: 'call', mod: 'chainTree', fn: 'tree', math: true, args: [{ f: 'x*y + z^2', inner: { x: 'cos(t)', y: 'sin(t)', z: 't' }, params: ['t'] }, { t: Math.PI / 4 }, 't'], values: { total: Math.PI / 2, 'paths.0.prod': -0.5, 'paths.1.prod': 0.5 } }
      },
      {
        type: 'concept', heading: 'Razones de cambio relacionadas', short: 'Razones relacionadas',
        body: [
          'En Cálculo 1 resolviste problemas de razones relacionadas con una sola cantidad cambiando. Con la regla de la cadena puedes tener varias a la vez.',
          'Un cilindro de radio $r$ y altura $h$ tiene volumen $V = \\pi r^2h$. Si $r$ y $h$ cambian con el tiempo, el árbol es $V \\to r, h \\to t$ y $$\\frac{dV}{dt} = \\frac{\\partial V}{\\partial r}\\frac{dr}{dt} + \\frac{\\partial V}{\\partial h}\\frac{dh}{dt} = 2\\pi rh\\,\\frac{dr}{dt} + \\pi r^2\\,\\frac{dh}{dt}$$',
          'Cada término tiene un dibujo: lo que crece la pared cuando el radio aumenta y lo que crece la tapa cuando la altura aumenta.'
        ],
        diagram: 'c2s05-cylinder',
        caption: 'El término $2\\pi rh\\,\\frac{dr}{dt}$ es la pared que se agrega por segundo; $\\pi r^2\\frac{dh}{dt}$, la tapa.'
      },
      {
        type: 'example', heading: 'Un cilindro que crece por dos lados',
        problem: '<p>El radio de un cilindro crece a $0.3$ cm/s y su altura a $0.4$ cm/s. ¿Qué tan rápido crece su volumen cuando $r = 5$ cm y $h = 12$ cm?</p>',
        steps: [
          { text: 'El árbol: $V$ depende de $r$ y $h$; las dos dependen de $t$. Dos caminos.', math: '\\frac{dV}{dt} = 2\\pi rh\\,\\frac{dr}{dt} + \\pi r^2\\,\\frac{dh}{dt}' },
          { text: 'Camino por el radio:', math: '2\\pi(5)(12)(0.3) = 36\\pi \\approx ' + fx(cyl.pw) },
          { text: 'Camino por la altura:', math: '\\pi(5)^2(0.4) = 10\\pi \\approx ' + fx(cyl.pt) },
          { text: 'Suma:', math: '\\frac{dV}{dt} = 46\\pi \\approx ' + fx(cyl.dV) + '\\ \\text{cm}^3\\text{/s}' }
        ],
        answer: '$\\dfrac{dV}{dt} = 46\\pi \\approx ' + fx(cyl.dV) + '$ cm³/s. Aunque el radio crece más despacio, aporta más: el radio está al cuadrado.',
        verify: { lab: 'call', mod: 'chainTree', fn: 'tree', math: true, args: [{ f: 'pi*r^2*h', inner: { r: '5 + 0.3t', h: '12 + 0.4t' }, params: ['t'] }, { t: 0 }, 't'], values: { total: cyl.dV, 'paths.0.prod': cyl.pw } }
      },
      {
        type: 'concept', heading: 'Derivación implícita, ahora con parciales', short: 'Implícita',
        body: [
          'En <a href="../../../calculo-1/sesiones/sesion-06/">Cálculo 1</a> derivabas $x^2y + y^3 = 10$ término por término, acordándote de multiplicar por $y\'$ cada vez que derivabas algo con $y$. La regla de la cadena hace lo mismo en un solo paso.',
          'Escribe la curva como $F(x, y) = 0$ y piensa que $y$ depende de $x$. El árbol tiene dos caminos de $F$ a $x$: uno directo y otro que pasa por $y$. Como $F$ vale $0$ en toda la curva, su derivada también: $$\\frac{\\partial F}{\\partial x}\\cdot 1 + \\frac{\\partial F}{\\partial y}\\cdot\\frac{dy}{dx} = 0 \\quad\\Longrightarrow\\quad \\frac{dy}{dx} = -\\frac{F_x}{F_y}$$',
          'El <strong>signo menos</strong> sale de pasar $F_x$ al otro lado. Sirve mientras $F_y \\neq 0$; donde $F_y = 0$ la tangente es vertical.'
        ],
        diagram: 'c2s06-tree',
        state: { kind: 'imp', lv: 2, h1: 0, h2: 0, f1: 1, f2: 1 },
        caption: 'De $F$ a $x$ hay dos caminos: directo ($\\partial F/\\partial x$) y pasando por $y$ ($\\partial F/\\partial y\\cdot dy/dx$). Su suma es 0.'
      },
      {
        type: 'example', heading: 'Pendiente de una curva implícita',
        problem: '<p>Encuentra la pendiente de la curva $x^2y + y^3 = 10$ en el punto $(3, 1)$.</p>',
        diagram: 'c2s06-curve',
        steps: [
          { text: 'Comprueba que el punto está en la curva: $9(1) + 1 = 10$. Pasa todo a un lado:', math: 'F(x, y) = x^2y + y^3 - 10' },
          { text: 'Parciales de $F$ (con la otra letra quieta, como en la S04):', math: 'F_x = 2xy \\qquad F_y = x^2 + 3y^2' },
          { text: 'Evalúa en $(3, 1)$:', math: 'F_x = 6 \\qquad F_y = 9 + 3 = 12' },
          { text: 'Aplica la fórmula, con su signo menos:', math: '\\frac{dy}{dx} = -\\frac{F_x}{F_y} = -\\frac{6}{12} = -0.5' }
        ],
        answer: 'La pendiente es $-0.5$. Con la implícita de Cálculo 1 llegas a lo mismo: $2xy + x^2y\' + 3y^2y\' = 0$, así que $y\' = -\\dfrac{2xy}{x^2 + 3y^2}$.',
        verify: { lab: 'call', mod: 'chainTree', fn: 'implicit', math: true, args: ['x^2*y + y^3 - 10', { x: 3, y: 1 }, 'x', 'y'], values: { slope: -0.5, Fw: 6, Fd: 12 } }
      },
      {
        type: 'concept', heading: 'Superficies: ∂z/∂x de F(x, y, z) = 0', short: 'Implícita en 3D',
        body: [
          'Si una superficie viene dada como $F(x, y, z) = 0$ y piensas que $z$ depende de $x$ y $y$, la misma idea da $$\\frac{\\partial z}{\\partial x} = -\\frac{F_x}{F_z} \\qquad \\frac{\\partial z}{\\partial y} = -\\frac{F_y}{F_z}$$',
          'Abajo siempre va la parcial respecto a la variable que <strong>despejarías</strong> ($z$), y arriba la parcial respecto a la variable que mueves. Sirve mientras $F_z \\neq 0$.'
        ]
      },
      {
        type: 'example', heading: 'Una superficie implícita',
        problem: '<p>La superficie $x^2z + yz^3 = 10$ pasa por $(1, 1, 2)$. Calcula $\\dfrac{\\partial z}{\\partial x}$ y $\\dfrac{\\partial z}{\\partial y}$ en ese punto.</p>',
        steps: [
          { text: 'Comprueba el punto: $1(2) + 1(8) = 10$. Las parciales de $F = x^2z + yz^3 - 10$:', math: 'F_x = 2xz \\qquad F_y = z^3 \\qquad F_z = x^2 + 3yz^2' },
          { text: 'En $(1, 1, 2)$:', math: 'F_x = 4 \\qquad F_y = 8 \\qquad F_z = 1 + 12 = 13' },
          { text: 'Con la fórmula:', math: '\\frac{\\partial z}{\\partial x} = -\\frac{4}{13} \\approx ' + fx(-4 / 13) + ' \\qquad \\frac{\\partial z}{\\partial y} = -\\frac{8}{13} \\approx ' + fx(-8 / 13) }
        ],
        answer: '$\\dfrac{\\partial z}{\\partial x} = -\\dfrac{4}{13} \\approx ' + fx(-4 / 13) + '$ y $\\dfrac{\\partial z}{\\partial y} = -\\dfrac{8}{13} \\approx ' + fx(-8 / 13) + '$.',
        verify: { lab: 'call', mod: 'chainTree', fn: 'implicit', math: true, args: ['x^2*z + y*z^3 - 10', { x: 1, y: 1, z: 2 }, 'x', 'z'], values: { slope: -4 / 13, Fd: 13 } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Cuándo va $d$ y cuándo va $\\partial$?', a: 'Mira el nodo de donde sale la rama. Si ese nodo depende de varias variables, la derivada es parcial ($\\partial z/\\partial x$). Si depende de una sola, es ordinaria ($dx/dt$ cuando $x$ solo depende de $t$). Y la de hasta arriba: $dz/dt$ si al final $z$ solo depende de $t$; $\\partial z/\\partial s$ si depende de $s$ y $t$.' },
          { q: '¿No es más fácil sustituir y derivar directo?', a: 'A veces sí, y es una gran forma de comprobar. Pero muchas veces no conoces las fórmulas: solo sabes valores ($r = 5$, $dr/dt = 0.3$) o la composición queda enorme. La regla de la cadena trabaja con lo que sí tienes.' },
          { q: '¿Por qué se suman los caminos y no se multiplican?', a: 'Porque son efectos que pasan al mismo tiempo. Lo que sube $z$ por moverse en $x$ y lo que sube por moverse en $y$ se juntan, como dos aumentos de sueldo. Dentro de un camino sí se multiplica: es la cadena de una variable.' },
          { q: '¿Qué pasa si una intermedia no depende de la variable?', a: 'Su camino no llega a esa variable, así que no hay término. Con $x = x(s, t)$ y $y = y(s)$, $\\partial z/\\partial t$ tiene un solo término: el que pasa por $x$.' },
          { q: 'En la implícita, ¿por qué no me sale igual que en Cálculo 1?', a: 'Sí sale igual; revisa el signo. $-F_x/F_y$ es exactamente lo que obtenías despejando $y\'$. El error típico es olvidar el menos o voltear el cociente: arriba va $F_x$.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'El árbol de dependencias muestra quién depende de quién; cada camino de arriba a la variable es un término.',
          'Dentro de un camino se multiplica; entre caminos se suma: $\\dfrac{dz}{dt} = \\dfrac{\\partial z}{\\partial x}\\dfrac{dx}{dt} + \\dfrac{\\partial z}{\\partial y}\\dfrac{dy}{dt}$.',
          'Las parciales de afuera se evalúan en el punto $(x(t_0), y(t_0))$, no en $t_0$.',
          'Implícita: $\\dfrac{dy}{dx} = -\\dfrac{F_x}{F_y}$ y $\\dfrac{\\partial z}{\\partial x} = -\\dfrac{F_x}{F_z}$, con su signo menos.'
        ]
      }
    ],

    lab: {
      type: 'chain-tree', title: 'El árbol animado',
      intro: 'Elige un ejemplo o escribe tu $f$ y tus funciones intermedias. El lab dibuja el árbol de dependencias y, al pulsar «Armar la derivada», recorre cada camino: lo resalta, escribe sus factores y arma la suma. Después escribe tu respuesta (el valor en el punto o la expresión): el lab la compara con la derivada numérica de la composición y te dice si olvidaste un camino, si multiplicaste los caminos, si evaluaste las parciales en el lugar equivocado o, en la implícita, si se te fue el signo.',
      cfg: { start: 1 }
    },

    formulas: [
      { label: 'Un parámetro', tex: '\\frac{dz}{dt} = \\frac{\\partial z}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial z}{\\partial y}\\frac{dy}{dt}' },
      { label: 'Dos parámetros', tex: '\\frac{\\partial z}{\\partial s} = \\frac{\\partial z}{\\partial x}\\frac{\\partial x}{\\partial s} + \\frac{\\partial z}{\\partial y}\\frac{\\partial y}{\\partial s}' },
      { label: 'Tres intermedias', tex: '\\frac{dw}{dt} = w_x\\frac{dx}{dt} + w_y\\frac{dy}{dt} + w_z\\frac{dz}{dt}' },
      { label: 'Implícita en el plano', tex: '\\frac{dy}{dx} = -\\frac{F_x}{F_y}' },
      { label: 'Implícita en el espacio', tex: '\\frac{\\partial z}{\\partial x} = -\\frac{F_x}{F_z} \\qquad \\frac{\\partial z}{\\partial y} = -\\frac{F_y}{F_z}' }
    ],

    exercises: [
      {
        id: 'c2-s06-dzdt', title: 'dz/dt en un instante',
        vars: { a: [2, 4, 1], c: [1, 5, 1], t0: [0.5, 2, 0.5] },
        prompt: function (v) { return '<p>Si $z = x^2y$, con $x = ' + v.a + 't$ y $y = t^2 + ' + v.c + '$, calcula $\\dfrac{dz}{dt}$ en $t = ' + v.t0 + '$.</p>'; },
        check: 'numeric',
        answer: function (v) { var x = v.a * v.t0, y = v.t0 * v.t0 + v.c; return 2 * x * y * v.a + x * x * 2 * v.t0; },
        mistakes: {
          missing: function (v) { var x = v.a * v.t0, y = v.t0 * v.t0 + v.c; return 2 * x * y * v.a; },
          missingY: function (v) { var x = v.a * v.t0; return x * x * 2 * v.t0; },
          product: function (v) { var x = v.a * v.t0, y = v.t0 * v.t0 + v.c; return 2 * x * y * v.a * x * x * 2 * v.t0; },
          atParam: function (v) { var t = v.t0; return 2 * t * t * v.a + t * t * 2 * t; },
          outerOnly: function (v) { var x = v.a * v.t0, y = v.t0 * v.t0 + v.c; return 2 * x * y + x * x; }
        },
        feedback: [
          { when: 'missing', say: 'Te faltó el camino por $y$: $\\frac{\\partial z}{\\partial y}\\frac{dy}{dt} = x^2\\cdot 2t$.' },
          { when: 'missingY', say: 'Te faltó el camino por $x$: $\\frac{\\partial z}{\\partial x}\\frac{dx}{dt} = 2xy\\cdot a$.' },
          { when: 'product', say: 'Multiplicaste los dos caminos. Dentro de un camino se multiplica; entre caminos se <strong>suma</strong>.' },
          { when: 'atParam', say: 'Evaluaste las parciales con $x = y = t_0$. Primero calcula $x_0 = x(t_0)$ y $y_0 = y(t_0)$ y evalúa ahí.' },
          { when: 'outerOnly', say: 'Sumaste solo las parciales de afuera. Cada una se multiplica por la derivada de su intermedia: $dx/dt$ y $dy/dt$.' }
        ],
        // Oráculo: derivada numérica de la composición z(x(t), y(t)), sin regla de la cadena.
        oracle: { lab: 'call', mod: 'chainTree', fn: 'numDeriv', math: true, args: function (v) { return [{ f: 'x^2*y', inner: { x: v.a + '*t', y: 't^2 + ' + v.c }, params: ['t'] }, { t: v.t0 }, 't']; } },
        hint: 'Calcula primero $x_0$ y $y_0$. Luego $\\frac{dz}{dt} = 2xy\\cdot\\frac{dx}{dt} + x^2\\cdot\\frac{dy}{dt}$.',
        solution: function (v) {
          var x = v.a * v.t0, y = v.t0 * v.t0 + v.c, p1 = 2 * x * y * v.a, p2 = x * x * 2 * v.t0;
          return '$x_0 = ' + fx(x) + '$, $y_0 = ' + fx(y) + '$. $$\\frac{dz}{dt} = 2x_0y_0\\cdot ' + v.a + ' + x_0^2\\cdot 2(' + v.t0 + ') = ' + fx(p1) + ' + ' + fx(p2) + ' = ' + fx(p1 + p2) + '$$';
        }
      },
      {
        id: 'c2-s06-dos', title: 'Dos parámetros: ∂z/∂s',
        vars: { a: [1, 3, 1], b: [1, 2, 1], s0: [-2, 2, 1], t0: [1, 2, 1] },
        prompt: function (v) { return '<p>Si $z = xy^2$, con $x = s ' + sg(v.a) + 't$ y $y = ' + (v.b === 1 ? '' : v.b) + 'st$, calcula $\\dfrac{\\partial z}{\\partial s}$ en $s = ' + v.s0 + '$, $t = ' + v.t0 + '$.</p>'; },
        check: 'numeric',
        answer: function (v) { var x = v.s0 + v.a * v.t0, y = v.b * v.s0 * v.t0; return y * y + 2 * x * y * v.b * v.t0; },
        mistakes: {
          otherVar: function (v) { var x = v.s0 + v.a * v.t0, y = v.b * v.s0 * v.t0; return y * y * v.a + 2 * x * y * v.b * v.s0; },
          missing: function (v) { var y = v.b * v.s0 * v.t0; return y * y; },
          atParam: function (v) { var x = v.s0, y = v.t0; return y * y + 2 * x * y * v.b * v.t0; }
        },
        feedback: [
          { when: 'otherVar', say: 'Ese es $\\partial z/\\partial t$: usaste $\\partial x/\\partial t$ y $\\partial y/\\partial t$. Para $\\partial z/\\partial s$ sigue los caminos que terminan en $s$.' },
          { when: 'missing', say: 'Te faltó el camino por $y$: $\\frac{\\partial z}{\\partial y}\\frac{\\partial y}{\\partial s} = 2xy\\cdot bt$.' },
          { when: 'atParam', say: 'Evaluaste las parciales con $x = s_0$ y $y = t_0$. Calcula $x_0 = x(s_0, t_0)$ y $y_0 = y(s_0, t_0)$ y evalúa ahí.' }
        ],
        oracle: { lab: 'call', mod: 'chainTree', fn: 'numDeriv', math: true, args: function (v) { return [{ f: 'x*y^2', inner: { x: 's + ' + v.a + '*t', y: v.b + '*s*t' }, params: ['s', 't'] }, { s: v.s0, t: v.t0 }, 's']; } },
        hint: 'Árbol: $z \\to x, y \\to s$. $\\frac{\\partial z}{\\partial s} = y^2\\cdot\\frac{\\partial x}{\\partial s} + 2xy\\cdot\\frac{\\partial y}{\\partial s}$, con $t$ fija.',
        solution: function (v) {
          var x = v.s0 + v.a * v.t0, y = v.b * v.s0 * v.t0, p1 = y * y, p2 = 2 * x * y * v.b * v.t0;
          return '$x_0 = ' + x + '$, $y_0 = ' + y + '$, $\\frac{\\partial x}{\\partial s} = 1$, $\\frac{\\partial y}{\\partial s} = ' + (v.b * v.t0) + '$. $$\\frac{\\partial z}{\\partial s} = y_0^2(1) + 2x_0y_0(' + (v.b * v.t0) + ') = ' + p1 + ' + ' + pr(p2) + ' = ' + (p1 + p2) + '$$';
        }
      },
      {
        id: 'c2-s06-expr', title: 'dz/dt como expresión',
        vars: { a: [2, 5, 1] },
        prompt: function (v) { return '<p>Si $z = xy^2$, con $x = t^2$ y $y = ' + v.a + 't + 1$, escribe $\\dfrac{dz}{dt}$ <strong>solo en términos de $t$</strong> (sin simplificar, si quieres).</p>'; },
        check: 'expr', exprVars: ['t'], domain: { t: [0.2, 2] },
        answer: function (v) { return '2t*(' + v.a + 't + 1)^2 + 2*' + v.a + '*t^2*(' + v.a + 't + 1)'; },
        mistakes: {
          missing: function (v) { return '2t*(' + v.a + 't + 1)^2'; },
          missingY: function (v) { return '2*' + v.a + '*t^2*(' + v.a + 't + 1)'; },
          outerOnly: function (v) { return '(' + v.a + 't + 1)^2 + 2t^2*(' + v.a + 't + 1)'; },
          product: function (v) { return '2t*(' + v.a + 't + 1)^2 * 2*' + v.a + '*t^2*(' + v.a + 't + 1)'; }
        },
        feedback: [
          { when: 'missing', say: 'Solo tienes el camino por $x$. Falta $\\frac{\\partial z}{\\partial y}\\frac{dy}{dt} = 2xy\\cdot a$.' },
          { when: 'missingY', say: 'Solo tienes el camino por $y$. Falta $\\frac{\\partial z}{\\partial x}\\frac{dx}{dt} = y^2\\cdot 2t$.' },
          { when: 'outerOnly', say: 'Sumaste $y^2 + 2xy$: te faltaron $dx/dt$ y $dy/dt$ en cada camino.' },
          { when: 'product', say: 'Multiplicaste los caminos. Se suman: $y^2(2t) + 2xy(a)$.' }
        ],
        hint: '$\\frac{\\partial z}{\\partial x} = y^2$ y $\\frac{\\partial z}{\\partial y} = 2xy$. Multiplica por $dx/dt$ y $dy/dt$, suma y sustituye $x = t^2$, $y = at + 1$.',
        solution: function (v) {
          return '$$\\frac{dz}{dt} = y^2\\cdot 2t + 2xy\\cdot ' + v.a + ' = 2t(' + v.a + 't + 1)^2 + ' + (2 * v.a) + 't^2(' + v.a + 't + 1)$$ Comprueba: $z = t^2(' + v.a + 't + 1)^2$; derivando con la regla del producto sale lo mismo.';
        }
      },
      {
        id: 'c2-s06-cilindro', title: 'Volumen con dos dimensiones que cambian',
        vars: { r: [3, 10, 1], h: [5, 20, 1], dr: [0.1, 0.5, 0.1], dh: [-0.5, 0.5, 0.1] },
        baseWhere: function (v) { return Math.abs(v.dh) > 1e-9; },
        prompt: function (v) {
          return '<p>El radio de un cilindro crece a $' + v.dr + '$ cm/s y su altura ' + (v.dh > 0 ? 'crece' : 'disminuye') + ' a $' + Math.abs(v.dh) + '$ cm/s. ¿Qué tan rápido cambia su volumen cuando $r = ' + v.r + '$ cm y $h = ' + v.h + '$ cm? (en cm³/s; negativo si disminuye)</p>';
        },
        check: 'numeric', unit: 'cm³/s',
        answer: function (v) { return 2 * Math.PI * v.r * v.h * v.dr + Math.PI * v.r * v.r * v.dh; },
        mistakes: {
          missing: function (v) { return 2 * Math.PI * v.r * v.h * v.dr; },
          missingH: function (v) { return Math.PI * v.r * v.r * v.dh; },
          noTwo: function (v) { return Math.PI * v.r * v.h * v.dr + Math.PI * v.r * v.r * v.dh; },
          signH: function (v) { return 2 * Math.PI * v.r * v.h * v.dr - Math.PI * v.r * v.r * v.dh; }
        },
        feedback: [
          { when: 'missing', say: 'Solo contaste el cambio por el radio. La altura también cambia: suma $\\pi r^2\\,\\frac{dh}{dt}$.' },
          { when: 'missingH', say: 'Solo contaste el cambio por la altura. El radio también cambia: suma $2\\pi rh\\,\\frac{dr}{dt}$.' },
          { when: 'noTwo', say: 'Revisa $\\partial V/\\partial r$: la derivada de $r^2$ es $2r$, así que va $2\\pi rh$.' },
          { when: 'signH', say: 'Revisa el signo de $dh/dt$: si la altura disminuye, $dh/dt$ es negativa; si crece, positiva.' }
        ],
        oracle: { lab: 'call', mod: 'chainTree', fn: 'numDeriv', math: true, args: function (v) { return [{ f: 'pi*r^2*h', inner: { r: v.r + ' + ' + v.dr + '*t', h: v.h + ' + (' + v.dh + ')*t' }, params: ['t'] }, { t: 0 }, 't']; } },
        hint: '$V = \\pi r^2h$. El árbol tiene dos caminos: $\\frac{dV}{dt} = 2\\pi rh\\,\\frac{dr}{dt} + \\pi r^2\\,\\frac{dh}{dt}$.',
        solution: function (v) {
          var p1 = 2 * Math.PI * v.r * v.h * v.dr, p2 = Math.PI * v.r * v.r * v.dh;
          return '$$\\frac{dV}{dt} = 2\\pi(' + v.r + ')(' + v.h + ')(' + v.dr + ') + \\pi(' + v.r + ')^2(' + v.dh + ') = ' + fx(p1) + ' + ' + pr(+fx(p2)) + ' = ' + fx(p1 + p2) + '\\ \\text{cm}^3\\text{/s}$$';
        }
      },
      {
        id: 'c2-s06-implicita', title: 'dy/dx implícita en un punto',
        vars: { a: [1, 3, 1], p: [1, 4, 1], q: [1, 3, 1] },
        prompt: function (v) { return '<p>La curva $' + (v.a === 1 ? '' : v.a) + 'x^2y + y^3 = ' + (v.a * v.p * v.p * v.q + Math.pow(v.q, 3)) + '$ pasa por $(' + v.p + ', ' + v.q + ')$. Usa $\\dfrac{dy}{dx} = -\\dfrac{F_x}{F_y}$ para calcular su pendiente en ese punto.</p>'; },
        check: 'numeric',
        answer: function (v) { return -(2 * v.a * v.p * v.q) / (v.a * v.p * v.p + 3 * v.q * v.q); },
        mistakes: {
          sign: function (v) { return (2 * v.a * v.p * v.q) / (v.a * v.p * v.p + 3 * v.q * v.q); },
          inverted: function (v) { return -(v.a * v.p * v.p + 3 * v.q * v.q) / (2 * v.a * v.p * v.q); }
        },
        feedback: [
          { when: 'sign', say: 'Te faltó el signo menos: de $F_x + F_y\\,y\' = 0$ sale $y\' = -F_x/F_y$.' },
          { when: 'inverted', say: 'Volteaste el cociente: arriba va $F_x$ y abajo $F_y$.' }
        ],
        // Oráculo: resuelve F = 0 para y cerca de x₀ y deriva numéricamente la curva.
        oracle: { lab: 'call', mod: 'chainTree', fn: 'implicitNum', math: true, args: function (v) { return [v.a + '*x^2*y + y^3 - ' + (v.a * v.p * v.p * v.q + Math.pow(v.q, 3)), { x: v.p, y: v.q }, 'x', 'y']; } },
        hint: '$F = ax^2y + y^3 - C$. $F_x = 2axy$ y $F_y = ax^2 + 3y^2$. Evalúa en el punto y no olvides el signo.',
        solution: function (v) {
          var Fx = 2 * v.a * v.p * v.q, Fy = v.a * v.p * v.p + 3 * v.q * v.q;
          return '$F_x = ' + (2 * v.a) + 'xy = ' + Fx + '$ y $F_y = ' + (v.a === 1 ? '' : v.a) + 'x^2 + 3y^2 = ' + Fy + '$ en el punto. $$\\frac{dy}{dx} = -\\frac{' + Fx + '}{' + Fy + '} \\approx ' + fx(-Fx / Fy) + '$$';
        }
      },
      {
        id: 'c2-s06-terminos', title: 'Concepto: cuántos términos',
        vars: { k: [0, 5, 1] },
        prompt: function (v) { return '<p>' + TREES[v.k][0] + '</p>'; },
        check: 'choice',
        options: function (v) {
          var n = TREES[v.k][1];
          return [1, 2, 3, 4].map(function (m) {
            return m === n ? { text: '$' + m + '$', correct: true } : { text: '$' + m + '$', say: WHY[m] + ' ' + TREES[v.k][2] };
          });
        },
        answer: function (v) { return '$' + TREES[v.k][1] + '$'; },
        hint: 'Dibuja el árbol y cuenta los caminos que terminan en la variable que te piden.',
        solution: function (v) { return 'Hay $' + TREES[v.k][1] + '$ término(s). ' + TREES[v.k][2]; }
      }
    ],

    quiz: { tags: ['c2.S06'], count: 8 },

    errors: [
      'Olvidar un camino: si $z$ depende de $x$ y $y$, y las dos dependen de $t$, $dz/dt$ tiene dos términos.',
      'Multiplicar los caminos entre sí en lugar de sumarlos.',
      'Evaluar las parciales de afuera en $t_0$ en lugar de en $(x(t_0), y(t_0))$.',
      'Olvidar las derivadas de adentro ($dx/dt$, $dy/dt$) y sumar solo $f_x + f_y$.',
      'Escribir $dx/ds$ cuando $x$ depende de $s$ y $t$: es $\\partial x/\\partial s$, con $t$ quieta.',
      'En la implícita, olvidar el signo menos o voltear el cociente: es $-F_x/F_y$.'
    ],

    teacher: {
      plan: [
        'Arranca con el globo: que digan por qué cambia la temperatura antes de escribir fórmulas.',
        'Explainer del árbol en el pizarrón; luego el ejemplo 1 con la comprobación por sustitución directa.',
        'Lab: carguen «z = x²y» y escriban 16 a propósito (un solo camino) para ver el aviso; luego 7 (parciales evaluadas en t).',
        'Dos parámetros con el ejemplo de polares y cierra con la implícita comparando contra Cálculo 1.'
      ],
      check: [
        'Que dibujen el árbol antes de derivar y cuenten los caminos en voz alta.',
        'Que calculen $x_0$, $y_0$ antes de evaluar cualquier parcial.'
      ],
      note: 'La forma vectorial ($dz/dt = \\nabla f\\cdot\\vec r\\,\'(t)$) regresa con la derivada direccional y el gradiente (S07 y S08); aquí solo se menciona como idea.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §4.5 “The Chain Rule”. <a href="https://openstax.org/books/calculus-volume-3/pages/4-5-the-chain-rule">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-05',
    next: 'sesion-07'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.baseWhere || ex.where; ex.where = distinct(ex); }
  });
})();
