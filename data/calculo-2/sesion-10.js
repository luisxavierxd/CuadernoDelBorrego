/* =====================================================================
   Cálculo 2 · S10 · Multiplicadores de Lagrange con dos o más restricciones
   (bloque B · Gradiente y optimización).
   Fuente: OpenStax, Calculus Volume 3, §4.8 (CC BY-NC-SA 4.0).
   Las cuentas se hacen aquí a mano y scripts/examples.test.js las compara contra
   LabMath.lagr2.optimize (lab lagrange-two), que busca densamente sobre la curva
   de intersección parametrizada; los ejercicios numéricos usan esa búsqueda como oráculo.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  // a x + b y + c z en LaTeX (coeficientes enteros; omite ceros y unos).
  function lin(cs) {
    var vs = ['x', 'y', 'z'], s = '';
    cs.forEach(function (k, i) {
      if (!k) return;
      var a = Math.abs(k), t = (a === 1 ? '' : a) + vs[i];
      s += s ? (k < 0 ? ' - ' : ' + ') + t : (k < 0 ? '-' : '') + t;
    });
    return s || '0';
  }
  function plane(a, b, c, d) { return { type: 'plane', n: [a, b, c], c: d }; }
  function cyl(c) { return { type: 'cyl', c: c }; }
  function sph(c) { return { type: 'sphere', c: c }; }
  var N2 = [[1, -1, 0], [1, 0, -1], [0, 1, -1]];

  // La respuesta y cada error típico deben quedar separados (más que la holgura del calificador).
  function apart(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) if (Math.abs(vals[i] - vals[j]) <= 0.02 + 0.015 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]))) return false;
      }
      return true;
    };
  }

  // Ejemplo 4: T = 20 + 5z sobre x² + y² + z² = 9 y x + y + z = 3.
  var e4 = { lamMax: 5 / 6, lamMin: -5 / 6, muMin: 10 / 3 };

  var data = window.SESSION_DATA = {
    slug: 'sesion-10', number: '10', group: 'B · Gradiente y optimización',
    title: 'Multiplicadores de Lagrange con dos o más restricciones', temario: [],
    minutes: 150,
    quote: 'Con dos condiciones a la vez ya no te mueves en una superficie, sino sobre una curva. En el mejor punto de la curva, el gradiente de f no tiene nada que empuje a lo largo de ella.',
    badges: [
      'Ver que dos restricciones $g = c_1$ y $h = c_2$ en tres variables dejan una <strong>curva</strong>: la intersección de dos superficies.',
      'Entender por qué en el óptimo $\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$: $\\nabla f$ es perpendicular a la tangente $\\vec T = \\nabla g \\times \\nabla h$.',
      'Plantear y resolver el sistema de 5 ecuaciones con 5 incógnitas $(x, y, z, \\lambda, \\mu)$.',
      'Comprobar el resultado parametrizando la curva y reduciendo a una sola variable.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Con dos restricciones el punto solo puede moverse sobre la curva donde se cortan dos superficies. En el máximo o el mínimo, $\\nabla f$ queda en el plano que generan $\\nabla g$ y $\\nabla h$: $\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$.',
        recall: [
          '<a href="../sesion-09/">Lagrange con una restricción</a> (S09): en el óptimo $\\nabla f = \\lambda\\nabla g$, porque la curva de nivel de $f$ toca a la restricción sin cruzarla.',
          'El <a href="../sesion-08/">gradiente</a> es perpendicular a las superficies de nivel (S08): $\\nabla g$ es normal a la superficie $g = c_1$.',
          'El <a href="../../../fisica-1/sesiones/sesion-03/">producto vectorial</a> (Física 1, S03): $\\vec A \\times \\vec B$ es perpendicular a $\\vec A$ y a $\\vec B$.',
          'Planos, cilindros y esferas en 3D (<a href="../sesion-01/">S01</a>).'
        ],
        why: 'En la vida real casi nunca hay una sola condición. Una pieza debe tener cierto volumen <em>y</em> cierta área; un riel sigue la curva donde un terreno corta a una pared; una antena se mueve sobre un anillo y quieres su punto más alto. Cada condición es una restricción, y Lagrange las maneja todas con la misma idea.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Corta un pepino (o un tubo) con un cuchillo inclinado. La cáscara es un cilindro y el corte es un plano; donde se encuentran queda una <strong>elipse</strong>. Si una hormiga tiene que caminar justo sobre esa orilla, ya no puede ir a donde quiera: está atada a una curva.',
          'Ahora pregúntate cuál es el punto más alto de esa orilla. La hormiga camina; mientras pueda subir, sigue. Se detiene donde, en la dirección en que camina, ya no sube ni baja: la «subida» (el gradiente de la altura) no tiene ninguna parte a lo largo del camino.',
          'Con una restricción caminabas sobre una superficie y había dos direcciones para moverte. Con dos restricciones solo queda una dirección: la de la curva. Por eso en el óptimo solo se pide una cosa: que $\\nabla f$ no empuje a lo largo de la curva. Todo lo demás de $\\nabla f$ puede apuntar hacia fuera de las dos superficies, y eso es justo lo que dicen $\\nabla g$ y $\\nabla h$.'
        ]
      },
      {
        type: 'concept', heading: 'De una restricción a dos', short: 'Dos restricciones',
        body: [
          'Con tres variables, cada restricción $g(x, y, z) = c_1$ es una superficie. Si además pides $h(x, y, z) = c_2$, los puntos que sirven son los que están en las dos: una <strong>curva</strong>. Un plano y un cilindro dan una elipse; un plano y una esfera, una circunferencia; dos planos, una recta.',
          'La curva vive dentro de las dos superficies, así que su tangente $\\vec T$ es perpendicular a las dos normales: $\\vec T \\perp \\nabla g$ y $\\vec T \\perp \\nabla h$. Por eso $$\\vec T \\parallel \\nabla g \\times \\nabla h.$$',
          'En un máximo o mínimo sobre la curva, la derivada de $f$ al avanzar por ella es cero: $\\nabla f \\cdot \\vec T = 0$. Los vectores perpendiculares a $\\vec T$ forman el plano que generan $\\nabla g$ y $\\nabla h$, así que $\\nabla f$ es una combinación de los dos: $$\\nabla f = \\lambda\\,\\nabla g + \\mu\\,\\nabla h.$$ Hay un multiplicador por restricción: $\\lambda$ para $g$ y $\\mu$ para $h$.'
        ]
      },
      {
        type: 'explainer', heading: 'Por qué ∇f cae en el plano de ∇g y ∇h', short: 'La idea en un dibujo',
        title: 'El punto más alto de una elipse',
        intro: 'El plano $x + y + z = 4$ corta al cilindro $x^2 + y^2 = 2$ en una elipse. Busquemos su punto más alto: $f = z$.',
        diagram: 'c2s10-curve',
        steps: [
          { text: 'Cada restricción es una superficie: el plano $g = x + y + z = 4$ y el cilindro $h = x^2 + y^2 = 2$.', state: { k: 0, t: 2.2 } },
          { text: 'Se cortan en una elipse: los puntos que cumplen las dos a la vez. El punto $P$ solo puede moverse sobre ella.', state: { k: 1, t: 2.2 } },
          { text: 'En $P$, $\\nabla g$ es normal al plano y $\\nabla h$ normal al cilindro. La curva es perpendicular a los dos: su tangente es $\\vec T = \\nabla g \\times \\nabla h$.', state: { k: 2, t: 2.2 } },
          { text: 'Aquí $\\nabla f = \\langle 0, 0, 1\\rangle$ tiene una parte a lo largo de $\\vec T$: al avanzar por la curva, $z$ sube. Todavía no es el máximo.', state: { k: 3, t: 2.2 } },
          { text: 'Avanza hasta $(-1, -1, 6)$. Ahí $\\nabla f \\cdot \\vec T = 0$: $\\nabla f$ queda en el plano de $\\nabla g$ y $\\nabla h$, y de hecho $\\nabla f = 1\\cdot\\nabla g + \\tfrac{1}{2}\\nabla h$.', state: { k: 4, t: 3.927 } }
        ]
      },
      {
        type: 'concept', heading: 'El sistema: 5 ecuaciones, 5 incógnitas', short: 'El sistema',
        body: [
          'La ecuación vectorial $\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$ son tres ecuaciones (una por componente). Con las dos restricciones quedan cinco: $$\\begin{aligned} f_x &= \\lambda g_x + \\mu h_x \\\\ f_y &= \\lambda g_y + \\mu h_y \\\\ f_z &= \\lambda g_z + \\mu h_z \\\\ g(x, y, z) &= c_1 \\\\ h(x, y, z) &= c_2 \\end{aligned}$$ Las incógnitas también son cinco: $x$, $y$, $z$, $\\lambda$ y $\\mu$.',
          'No hay una receta única para resolverlo, pero estas estrategias casi siempre funcionan:'
        ],
        list: [
          '<strong>Despeja $x$, $y$, $z$ en términos de $\\lambda$ y $\\mu$</strong> cuando $f$ es cuadrática y las restricciones son lineales; luego sustituye en las restricciones.',
          '<strong>Usa una restricción lineal para despejar</strong> una variable (en un plano, $z = 4 - x - y$).',
          '<strong>Elimina $\\lambda$ y $\\mu$</strong> combinando ecuaciones: si dos componentes tienen el mismo lado derecho, réstalas.',
          '<strong>No dividas entre algo que puede ser cero.</strong> De $y(1 - \\lambda) = 0$ salen dos casos: $y = 0$ o $\\lambda = 1$. Revisa los dos.',
          '<strong>Evalúa $f$ en todos los candidatos.</strong> El más grande es el máximo y el más chico, el mínimo (si la curva es cerrada, existen los dos).'
        ]
      },
      {
        type: 'concept', heading: 'Comprobar parametrizando la curva', short: 'Parametrizar',
        body: [
          'Si puedes escribir la curva con un solo parámetro, el problema se vuelve de Cálculo 1: $f$ sobre la curva es una función de $t$. Para el plano y el cilindro del dibujo, $x = \\sqrt2\\cos t$, $y = \\sqrt2\\sin t$ y $z = 4 - x - y$: $$z(t) = 4 - \\sqrt2(\\cos t + \\sin t) = 4 - 2\\sin\\!\\left(t + \\tfrac{\\pi}{4}\\right).$$ El máximo es $6$ (en $t = \\tfrac{5\\pi}{4}$) y el mínimo $2$ (en $t = \\tfrac{\\pi}{4}$), igual que con Lagrange.',
          'Parametrizaciones típicas: plano ∩ cilindro $x^2 + y^2 = r^2$: $x = r\\cos t$, $y = r\\sin t$ y $z$ despejada del plano. Dos planos: una recta $\\vec p_0 + t\\,\\vec v$ con $\\vec v = \\vec n_1 \\times \\vec n_2$. Plano ∩ esfera: una circunferencia con centro y radio que salen de la distancia del plano al centro.',
          '¿Cuándo conviene? Cuando la parametrización sale fácil, como en estos casos. Lagrange gana cuando las superficies son complicadas o no sabes parametrizar su intersección. Y usar los dos caminos es la mejor comprobación.'
        ],
        diagram: 'c2s10-param',
        caption: 'La altura $z$ a lo largo de la elipse, como función del parámetro $t$: un máximo y un mínimo, donde la derivada $z\'(t) = \\nabla f\\cdot\\vec r\\,\'(t)$ vale cero.'
      },
      {
        type: 'callout', heading: 'Con más restricciones, la misma idea',
        body: [
          'Con $n$ variables y $k$ restricciones $g_1 = c_1, \\ldots, g_k = c_k$ (con $k < n$), en el óptimo $$\\nabla f = \\lambda_1\\nabla g_1 + \\lambda_2\\nabla g_2 + \\cdots + \\lambda_k\\nabla g_k.$$ Son $n$ ecuaciones de componentes más $k$ restricciones: $n + k$ ecuaciones con $n + k$ incógnitas.',
          'El método necesita que los gradientes $\\nabla g_1, \\ldots, \\nabla g_k$ sean independientes en el punto (en 3D con dos restricciones: que $\\nabla g$ y $\\nabla h$ no sean paralelos). Donde son paralelos las superficies se tocan sin cruzarse y ese punto se revisa aparte.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: Lagrange con dos restricciones', short: 'Receta',
        steps: [
          { text: 'Identifica $f$ (lo que optimizas) y escribe las restricciones como $g = c_1$ y $h = c_2$.', tip: 'Si te piden la distancia, optimiza la distancia al cuadrado: tiene el mismo punto óptimo y no lleva raíces. Al final saca la raíz.' },
          { text: 'Calcula $\\nabla f$, $\\nabla g$ y $\\nabla h$.' },
          { text: 'Plantea las 5 ecuaciones: $\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$ (tres componentes) más $g = c_1$ y $h = c_2$.', tip: 'Las dos restricciones van en el sistema. Si usas solo una, encuentras el óptimo sobre una superficie, no sobre la curva.' },
          { text: 'Resuelve: despeja con las ecuaciones lineales, elimina $\\lambda$ y $\\mu$ y separa en casos en lugar de dividir entre algo que puede ser cero.' },
          { text: 'Evalúa $f$ en cada candidato y compara. Si la curva es una recta (no acotada), revisa si de verdad hay máximo o mínimo.', tip: '$\\lambda$ y $\\mu$ no son el valor de $f$: el valor sale de evaluar $f$ en el punto.' }
        ]
      },
      {
        type: 'example', heading: 'El punto de una recta más cercano al origen',
        problem: '<p>Los planos $x + y + z = 3$ y $x - y = 1$ se cortan en una recta. Encuentra el punto de esa recta más cercano al origen y la distancia.</p>',
        steps: [
          { text: 'Optimiza la distancia al cuadrado, $f = x^2 + y^2 + z^2$, con $g = x + y + z = 3$ y $h = x - y = 1$.', math: '\\nabla f = \\langle 2x, 2y, 2z\\rangle \\quad \\nabla g = \\langle 1, 1, 1\\rangle \\quad \\nabla h = \\langle 1, -1, 0\\rangle' },
          { text: 'Las tres componentes de $\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$, despejadas.', math: 'x = \\frac{\\lambda + \\mu}{2} \\qquad y = \\frac{\\lambda - \\mu}{2} \\qquad z = \\frac{\\lambda}{2}' },
          { text: 'Sustituye en las restricciones.', math: 'x + y + z = \\tfrac{3\\lambda}{2} = 3 \\Rightarrow \\lambda = 2 \\qquad x - y = \\mu = 1' },
          { text: 'El punto y la distancia.', math: '(x, y, z) = (1.5,\\ 0.5,\\ 1) \\qquad d = \\sqrt{2.25 + 0.25 + 1} = \\sqrt{3.5} \\approx 1.87' },
          { text: '¿Es mínimo? La recta es infinita y lejos la distancia crece sin límite, así que el único candidato es el mínimo. Máximo no hay.' }
        ],
        answer: 'El punto más cercano es $(1.5, 0.5, 1)$, a una distancia $\\sqrt{3.5} \\approx 1.87$, con $\\lambda = 2$ y $\\mu = 1$.',
        verify: { lab: 'call', mod: 'lagr2', fn: 'optimize', math: true, args: ['x^2 + y^2 + z^2', plane(1, 1, 1, 3), plane(1, -1, 0, 1)], values: { 'min.value': 3.5, 'min.x': 1.5, 'min.y': 0.5, 'min.z': 1, 'min.lam': 2, 'min.mu': 1 } }
      },
      {
        type: 'example', heading: 'La altura máxima de una elipse',
        problem: '<p>El plano $x + y + z = 4$ corta al cilindro $x^2 + y^2 = 2$ en una elipse. Encuentra sus puntos más alto y más bajo.</p>',
        steps: [
          { text: '$f = z$, $g = x + y + z = 4$ y $h = x^2 + y^2 = 2$.', math: '\\langle 0, 0, 1\\rangle = \\lambda\\langle 1, 1, 1\\rangle + \\mu\\langle 2x, 2y, 0\\rangle' },
          { text: 'La tercera componente da $\\lambda$ de inmediato; las otras dos, $x$ y $y$.', math: '\\lambda = 1 \\qquad 0 = 1 + 2\\mu x \\qquad 0 = 1 + 2\\mu y \\ \\Rightarrow\\ x = y = -\\frac{1}{2\\mu}' },
          { text: 'Al cilindro.', math: '\\frac{2}{4\\mu^2} = 2 \\Rightarrow \\mu = \\pm\\tfrac{1}{2}' },
          { text: 'Los dos candidatos, con $z = 4 - x - y$.', math: '\\mu = \\tfrac{1}{2}:\\ (-1, -1, 6) \\qquad \\mu = -\\tfrac{1}{2}:\\ (1, 1, 2)' },
          { text: 'Comprueba parametrizando: $z(t) = 4 - 2\\sin(t + \\tfrac{\\pi}{4})$ va de 2 a 6.' }
        ],
        answer: 'El punto más alto es $(-1, -1, 6)$ y el más bajo $(1, 1, 2)$. En los dos $\\lambda = 1$; $\\mu = \\tfrac{1}{2}$ en el máximo y $-\\tfrac{1}{2}$ en el mínimo.',
        verify: { lab: 'call', mod: 'lagr2', fn: 'optimize', math: true, args: ['z', plane(1, 1, 1, 4), cyl(2)], values: { 'max.value': 6, 'max.x': -1, 'max.y': -1, 'max.lam': 1, 'max.mu': 0.5, 'min.value': 2, 'min.x': 1, 'min.mu': -0.5 } }
      },
      {
        type: 'example', heading: 'El punto más lejano: no dividas entre cero',
        problem: '<p>¿Qué punto de la elipse $x^2 + y^2 = 1$, $x + z = 1$ está más lejos del origen? ¿Y cuál más cerca?</p>',
        steps: [
          { text: '$f = x^2 + y^2 + z^2$, $g = x^2 + y^2 = 1$ (con $\\lambda$) y $h = x + z = 1$ (con $\\mu$).', math: '2x = 2\\lambda x + \\mu \\qquad 2y = 2\\lambda y \\qquad 2z = \\mu' },
          { text: 'La segunda es $y(1 - \\lambda) = 0$. No dividas entre $y$: hay dos casos.', math: 'y = 0 \\quad\\text{o}\\quad \\lambda = 1' },
          { text: 'Si $\\lambda = 1$: la primera da $\\mu = 0$, luego $z = 0$, $x = 1$ y $y = 0$. Si $y = 0$: $x = \\pm 1$ y $z = 1 - x$.', math: '(1, 0, 0) \\qquad (-1, 0, 2)' },
          { text: 'Evalúa $f$.', math: 'f(1, 0, 0) = 1 \\qquad f(-1, 0, 2) = 5' },
          { text: 'Multiplicadores del más lejano: $\\mu = 2z = 4$ y $-2 = -2\\lambda + 4$.', math: '\\lambda = 3 \\qquad \\mu = 4' }
        ],
        answer: 'El más lejano es $(-1, 0, 2)$, a $\\sqrt5 \\approx 2.24$; el más cercano, $(1, 0, 0)$, a distancia 1.',
        verify: { lab: 'call', mod: 'lagr2', fn: 'optimize', math: true, args: ['x^2 + y^2 + z^2', cyl(1), plane(1, 0, 1, 1)], values: { 'max.value': 5, 'max.x': -1, 'max.z': 2, 'max.lam': 3, 'max.mu': 4, 'min.value': 1, 'min.x': 1 } }
      },
      {
        type: 'example', heading: 'Temperatura en un anillo',
        problem: '<p>Un alambre tiene la forma de la circunferencia donde la esfera $x^2 + y^2 + z^2 = 9$ corta al plano $x + y + z = 3$. La temperatura es $T = 20 + 5z$ (°C). ¿Dónde está más caliente y dónde más frío?</p>',
        steps: [
          { text: '$g = x^2 + y^2 + z^2 = 9$ (con $\\lambda$) y $h = x + y + z = 3$ (con $\\mu$).', math: '0 = 2\\lambda x + \\mu \\qquad 0 = 2\\lambda y + \\mu \\qquad 5 = 2\\lambda z + \\mu' },
          { text: 'Resta las dos primeras: $2\\lambda(x - y) = 0$. Si $\\lambda = 0$, también $\\mu = 0$ y la tercera diría $5 = 0$. Entonces $x = y$.' },
          { text: 'Con $x = y$: $2x + z = 3$ y $2x^2 + z^2 = 9$. Sustituye $x = \\frac{3 - z}{2}$.', math: '\\frac{(3 - z)^2}{2} + z^2 = 9 \\Rightarrow z^2 - 2z - 3 = 0 \\Rightarrow z = 3 \\ \\text{o}\\ z = -1' },
          { text: 'Los candidatos y su temperatura.', math: '(0, 0, 3):\\ T = 35 \\qquad (2, 2, -1):\\ T = 15' }
        ],
        answer: 'Lo más caliente es $(0, 0, 3)$ con $35\\,°\\text{C}$ ($\\lambda = \\tfrac{5}{6}$, $\\mu = 0$) y lo más frío $(2, 2, -1)$ con $15\\,°\\text{C}$. Multiplicar $z$ por 5 y sumarle 20 no mueve los puntos: solo cambia los valores.',
        verify: { lab: 'call', mod: 'lagr2', fn: 'optimize', math: true, args: ['20 + 5z', sph(9), plane(1, 1, 1, 3)], values: { 'max.value': 35, 'max.z': 3, 'max.lam': e4.lamMax, 'max.mu': 0, 'min.value': 15, 'min.x': 2, 'min.lam': e4.lamMin, 'min.mu': e4.muMin } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué ya no basta con $\\nabla f \\parallel \\nabla g$?', a: 'Porque ahora el punto no puede moverse en toda la superficie $g = c_1$, solo por la curva. Basta con que $\\nabla f$ no tenga parte a lo largo de esa curva, y eso deja a $\\nabla f$ libre dentro del plano de $\\nabla g$ y $\\nabla h$.' },
          { q: '¿Siempre hay máximo y mínimo?', a: 'Si la curva es cerrada y acotada (una elipse, una circunferencia), sí: es el teorema del valor extremo. En una recta puede no haberlos: la distancia al origen tiene mínimo pero no máximo.' },
          { q: '¿Tengo que calcular $\\lambda$ y $\\mu$?', a: 'Casi siempre son solo un puente para llegar al punto. Pero tienen significado: $\\lambda$ dice cuánto cambia el valor óptimo si $c_1$ aumenta una unidad, y $\\mu$ lo mismo con $c_2$.' },
          { q: '¿Importa cuál restricción llamo $g$ y cuál $h$?', a: 'No para el punto ni para el valor de $f$. Solo se intercambian los nombres de los multiplicadores. Y si escribes una restricción multiplicada por $-1$, su multiplicador cambia de signo.' },
          { q: '¿Y si $\\nabla g$ y $\\nabla h$ son paralelos en algún punto?', a: 'Ahí las superficies se tocan en lugar de cruzarse y la curva puede no tener una tangente bien definida. El método puede no ver ese punto: revísalo aparte.' },
          { q: '¿Puedo usar solo una restricción y luego verificar la otra?', a: 'No. El óptimo sobre una superficie casi nunca está sobre la curva. Las dos restricciones van juntas en el sistema.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Dos restricciones en 3D dejan una curva, con tangente $\\vec T \\parallel \\nabla g \\times \\nabla h$.',
          'En el óptimo $\\nabla f\\cdot\\vec T = 0$, es decir, $\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$.',
          'Son 5 ecuaciones con 5 incógnitas; con $n$ variables y $k$ restricciones, $n + k$.',
          'Evalúa $f$ en todos los candidatos y, si puedes, comprueba parametrizando la curva.'
        ]
      }
    ],

    lab: {
      type: 'lagrange-two', title: 'Intersección de dos superficies de restricción',
      intro: 'Elige dos restricciones y una función $f$, y mueve el punto por la curva donde se cortan. Mira $\\nabla f$, $\\nabla g$ y $\\nabla h$, la gráfica de $f$ contra $t$ y la parte de $\\nabla f$ que va a lo largo de la curva: en los extremos vale cero. Luego escribe el máximo o el mínimo (el valor o una coordenada): el lab lo compara con una búsqueda densa sobre la curva y te dice si diste el otro extremo, si confundiste $\\lambda$ o $\\mu$ con el valor de $f$ o si usaste una sola restricción.',
      cfg: { pair: 0, fun: 1 }
    },

    formulas: [
      { label: 'Condición de Lagrange', tex: '\\nabla f = \\lambda\\nabla g + \\mu\\nabla h' },
      { label: 'Restricciones', tex: 'g(x, y, z) = c_1,\\quad h(x, y, z) = c_2' },
      { label: 'Tangente a la curva', tex: '\\vec T = \\nabla g \\times \\nabla h' },
      { label: 'Equivalente', tex: '\\nabla f \\cdot (\\nabla g \\times \\nabla h) = 0' },
      { label: 'Tamaño del sistema', tex: 'n + k\\ \\text{ecuaciones}' },
      { label: 'k restricciones', tex: '\\nabla f = \\textstyle\\sum_{i} \\lambda_i \\nabla g_i' }
    ],

    exercises: [
      {
        id: 'c2-s10-recta', title: 'Distancia del origen a una recta',
        vars: { a: [1, 9, 1], b: [1, 6, 1], k: [0, 2, 1] },
        prompt: function (v) { return '<p>Los planos $x + y + z = ' + v.a + '$ y $' + lin(N2[v.k]) + ' = ' + v.b + '$ se cortan en una recta. ¿Cuál es la distancia mínima del origen a esa recta?</p>'; },
        check: 'numeric',
        answer: function (v) { return Math.sqrt(v.a * v.a / 3 + v.b * v.b / 2); },
        mistakes: {
          squared: function (v) { return v.a * v.a / 3 + v.b * v.b / 2; },
          oneG: function (v) { return v.a / Math.sqrt(3); },
          oneH: function (v) { return v.b / Math.sqrt(2); }
        },
        feedback: [
          { when: 'squared', say: 'Ese es el mínimo de $d^2$. Saca la raíz para tener la distancia.' },
          { when: 'oneG', say: 'Esa es la distancia al primer plano: usaste una sola restricción. El punto debe estar en los dos planos.' },
          { when: 'oneH', say: 'Esa es la distancia al segundo plano: usaste una sola restricción. El punto debe estar en los dos planos.' }
        ],
        oracle: { lab: 'call', mod: 'lagr2', fn: 'optimize', math: true, field: 'min.value', args: function (v) { var n = N2[v.k]; return ['sqrt(x^2 + y^2 + z^2)', plane(1, 1, 1, v.a), plane(n[0], n[1], n[2], v.b)]; } },
        hint: 'Minimiza $x^2 + y^2 + z^2$. De $\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$ sale $\\vec p = \\tfrac{\\lambda}{2}\\vec n_1 + \\tfrac{\\mu}{2}\\vec n_2$; sustituye en los dos planos.',
        solution: function (v) {
          var d2 = v.a * v.a / 3 + v.b * v.b / 2;
          return 'Con $\\vec p = \\tfrac{\\lambda}{2}\\vec n_1 + \\tfrac{\\mu}{2}\\vec n_2$ y como $\\vec n_1 \\cdot \\vec n_2 = 0$: el primer plano da $\\tfrac{3\\lambda}{2} = ' + v.a + '$ y el segundo $\\tfrac{2\\mu}{2} = ' + v.b + '$. Así $\\lambda = ' + fx(2 * v.a / 3, 3) + '$, $\\mu = ' + v.b + '$ y $$d^2 = \\frac{' + v.a + '^2}{3} + \\frac{' + v.b + '^2}{2} = ' + fx(d2, 4) + ' \\qquad d \\approx ' + fx(Math.sqrt(d2)) + '$$';
        }
      },
      {
        id: 'c2-s10-zmax', title: 'Altura máxima de una elipse',
        vars: { a: [-3, 3, 1], b: [1, 3, 1], r: [1, 3, 1], d: [2, 9, 1] },
        baseWhere: function (v) { return v.a !== 0; },
        prompt: function (v) { return '<p>El plano $' + lin([v.a, v.b, 1]) + ' = ' + v.d + '$ corta al cilindro $x^2 + y^2 = ' + v.r * v.r + '$ en una elipse. ¿Cuál es la altura $z$ máxima de esa elipse?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.d + v.r * Math.hypot(v.a, v.b); },
        mistakes: {
          min: function (v) { return v.d - v.r * Math.hypot(v.a, v.b); },
          mu: function (v) { return Math.hypot(v.a, v.b) / (2 * v.r); },
          lam: function () { return 1; }
        },
        feedback: [
          { when: 'min', say: 'Esa es la altura mínima. Evalúa $z$ en los dos candidatos y quédate con el más grande.' },
          { when: 'mu', say: 'Ese número es $\\mu$, el multiplicador del cilindro. La altura sale de evaluar $z$ en el punto.' },
          { when: 'lam', say: 'Ese es $\\lambda$ (sale de la componente $z$). Falta hallar el punto y evaluar $z$.' }
        ],
        oracle: { lab: 'call', mod: 'lagr2', fn: 'optimize', math: true, field: 'max.value', args: function (v) { return ['z', plane(v.a, v.b, 1, v.d), cyl(v.r * v.r)]; } },
        hint: 'La componente $z$ de $\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$ da $\\lambda = 1$. Las otras dos dan $(x, y) = -\\tfrac{1}{2\\mu}(a, b)$; usa el cilindro.',
        solution: function (v) {
          var m = Math.hypot(v.a, v.b);
          return '$\\lambda = 1$ y $(x, y) = -\\tfrac{1}{2\\mu}(' + v.a + ', ' + v.b + ')$. En el cilindro, $|\\mu| = \\dfrac{\\sqrt{' + (v.a * v.a + v.b * v.b) + '}}{2(' + v.r + ')}$. El más alto es $(x, y) = -' + v.r + '\\dfrac{(' + v.a + ', ' + v.b + ')}{\\sqrt{' + (v.a * v.a + v.b * v.b) + '}}$: $$z = ' + v.d + ' + ' + v.r + '\\sqrt{' + (v.a * v.a + v.b * v.b) + '} \\approx ' + fx(v.d + v.r * m) + '$$';
        }
      },
      {
        id: 'c2-s10-coord', title: 'Una coordenada del punto óptimo',
        vars: { R: [2, 5, 1], d: [1, 6, 1] },
        baseWhere: function (v) { return 6 * v.R * v.R - 2 * v.d * v.d > 1; },
        prompt: function (v) { return '<p>La esfera $x^2 + y^2 + z^2 = ' + v.R * v.R + '$ y el plano $x + y + z = ' + v.d + '$ se cortan en una circunferencia. En su punto más alto, ¿cuánto vale la coordenada $x$?</p>'; },
        check: 'numeric',
        answer: function (v) { return (2 * v.d - Math.sqrt(6 * v.R * v.R - 2 * v.d * v.d)) / 6; },
        mistakes: {
          other: function (v) { return (2 * v.d + Math.sqrt(6 * v.R * v.R - 2 * v.d * v.d)) / 6; },
          zTop: function (v) { return v.d - 2 * (2 * v.d - Math.sqrt(6 * v.R * v.R - 2 * v.d * v.d)) / 6; }
        },
        feedback: [
          { when: 'other', say: 'Esa es la $x$ del punto más bajo. Con $x = y$ salen dos soluciones: la del punto más alto es la de $z$ mayor.' },
          { when: 'zTop', say: 'Esa es la altura $z$ del punto. Se pide su coordenada $x$.' }
        ],
        oracle: { lab: 'call', mod: 'lagr2', fn: 'optimize', math: true, field: 'max.x', args: function (v) { return ['z', sph(v.R * v.R), plane(1, 1, 1, v.d)]; } },
        hint: 'Restando las dos primeras ecuaciones sale $x = y$. Sustituye $z = d - 2x$ en la esfera y elige la raíz que da la $z$ más grande.',
        solution: function (v) {
          var s = Math.sqrt(6 * v.R * v.R - 2 * v.d * v.d), x = (2 * v.d - s) / 6;
          return 'Con $x = y$ y $z = ' + v.d + ' - 2x$: $2x^2 + (' + v.d + ' - 2x)^2 = ' + v.R * v.R + '$, o sea $6x^2 - ' + 4 * v.d + 'x + ' + (v.d * v.d - v.R * v.R) + ' = 0$. La raíz con $z$ mayor es la más chica: $$x = \\frac{' + 2 * v.d + ' - \\sqrt{' + fx(s * s, 4) + '}}{6} \\approx ' + fx(x) + '$$ (y ahí $z \\approx ' + fx(v.d - 2 * x) + '$).';
        }
      },
      {
        id: 'c2-s10-mult', title: 'El valor de un multiplicador',
        vars: { a: [1, 4, 1], b: [1, 4, 1], r: [1, 3, 1], d: [3, 8, 1] },
        prompt: function (v) { return '<p>Buscas el punto más alto ($f = z$) de la elipse con $g = ' + lin([v.a, v.b, 1]) + ' = ' + v.d + '$ y $h = x^2 + y^2 = ' + v.r * v.r + '$. Con $\\nabla f = \\lambda\\nabla g + \\mu\\nabla h$, ¿cuánto vale $\\mu$ en ese punto?</p>'; },
        check: 'numeric',
        answer: function (v) { return Math.hypot(v.a, v.b) / (2 * v.r); },
        mistakes: {
          neg: function (v) { return -Math.hypot(v.a, v.b) / (2 * v.r); },
          lam: function () { return 1; },
          value: function (v) { return v.d + v.r * Math.hypot(v.a, v.b); }
        },
        feedback: [
          { when: 'neg', say: 'Ese es el $\\mu$ del punto más bajo. En el más alto, $(x, y) = -\\tfrac{1}{2\\mu}(a, b)$ debe apuntar contra $(a, b)$, así que $\\mu > 0$.' },
          { when: 'lam', say: 'Ese es $\\lambda$, el multiplicador del plano. Se pide $\\mu$, el del cilindro.' },
          { when: 'value', say: 'Esa es la altura máxima, el valor de $f$. Se pide el multiplicador $\\mu$.' }
        ],
        oracle: { lab: 'call', mod: 'lagr2', fn: 'optimize', math: true, field: 'max.mu', args: function (v) { return ['z', plane(v.a, v.b, 1, v.d), cyl(v.r * v.r)]; } },
        hint: 'Componentes $x$ y $y$: $0 = a + 2\\mu x$ y $0 = b + 2\\mu y$. Sustituye en $x^2 + y^2 = r^2$.',
        solution: function (v) { return '$x = -\\tfrac{' + v.a + '}{2\\mu}$, $y = -\\tfrac{' + v.b + '}{2\\mu}$ y $\\dfrac{' + (v.a * v.a + v.b * v.b) + '}{4\\mu^2} = ' + v.r * v.r + '$, así que $|\\mu| = \\dfrac{\\sqrt{' + (v.a * v.a + v.b * v.b) + '}}{' + 2 * v.r + '} \\approx ' + fx(Math.hypot(v.a, v.b) / (2 * v.r), 3) + '$. En el punto más alto $x, y < 0$ (contra $(a, b)$), así que $\\mu$ es positivo.'; }
      },
      {
        id: 'c2-s10-lejano', title: 'El punto más lejano de una elipse',
        vars: { r: [1, 3, 1], m: [1, 3, 1], q: [1, 4, 1] },
        prompt: function (v) { return '<p>El plano $z = ' + (v.m === 1 ? '' : v.m) + 'x + ' + v.q + '$ corta al cilindro $x^2 + y^2 = ' + v.r * v.r + '$ en una elipse. ¿A qué distancia del origen está su punto más lejano?</p>'; },
        check: 'numeric',
        answer: function (v) { return Math.sqrt(v.r * v.r + Math.pow(v.m * v.r + v.q, 2)); },
        mistakes: {
          min: function (v) { return v.q > v.m * v.r ? Math.sqrt(v.r * v.r + Math.pow(v.q - v.m * v.r, 2)) : v.r; },
          squared: function (v) { return v.r * v.r + Math.pow(v.m * v.r + v.q, 2); }
        },
        feedback: [
          { when: 'min', say: 'Ese es el punto más cercano. Compara $f$ en todos los candidatos: el más lejano tiene la $f$ más grande.' },
          { when: 'squared', say: 'Esa es la distancia al cuadrado. Saca la raíz.' }
        ],
        oracle: { lab: 'call', mod: 'lagr2', fn: 'optimize', math: true, field: 'max.value', args: function (v) { return ['sqrt(x^2 + y^2 + z^2)', plane(-v.m, 0, 1, v.q), cyl(v.r * v.r)]; } },
        hint: 'Sobre la elipse $x^2 + y^2 = r^2$, así que $d^2 = r^2 + z^2 = r^2 + (mx + q)^2$. Con Lagrange sale $y(1 - \\lambda) = 0$: revisa el caso $y = 0$.',
        solution: function (v) {
          var z = v.m * v.r + v.q;
          return 'En la elipse $d^2 = ' + v.r * v.r + ' + (' + (v.m === 1 ? '' : v.m) + 'x + ' + v.q + ')^2$, que crece con $x$: el más lejano es $x = ' + v.r + '$, $y = 0$, $z = ' + z + '$. $$d = \\sqrt{' + v.r * v.r + ' + ' + z * z + '} \\approx ' + fx(Math.sqrt(v.r * v.r + z * z)) + '$$';
        }
      },
      {
        id: 'c2-s10-ecuaciones', title: 'Concepto: tamaño del sistema',
        vars: { n: [3, 5, 1], k: [2, 3, 1] },
        where: function (v) { return v.k < v.n; },
        prompt: function (v) { return '<p>Optimizas una función de $' + v.n + '$ variables con $' + v.k + '$ restricciones usando multiplicadores de Lagrange. ¿Cuántas ecuaciones tiene el sistema que resuelves?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: String(v.n + v.k), correct: true },
            { text: String(v.n), say: 'Esas son solo las componentes del gradiente. Faltan las ' + v.k + ' restricciones.' },
            { text: String(v.n + 1), say: 'Así sería con una sola restricción. Cada restricción aporta una ecuación (y un multiplicador).' },
            { text: String(v.n + 2 * v.k), say: 'Los multiplicadores son incógnitas, no ecuaciones extra.' }
          ];
        },
        answer: function (v) { return String(v.n + v.k); },
        hint: 'Cuenta las componentes de $\\nabla f = \\sum \\lambda_i \\nabla g_i$ y súmale una ecuación por restricción.',
        solution: function (v) { return '$' + v.n + '$ componentes de la ecuación vectorial más $' + v.k + '$ restricciones: $' + (v.n + v.k) + '$ ecuaciones, con $' + (v.n + v.k) + '$ incógnitas ($' + v.n + '$ variables y $' + v.k + '$ multiplicadores).'; }
      }
    ],

    quiz: { tags: ['c2.S10'], count: 8 },

    errors: [
      'Usar una sola restricción: el óptimo sobre una superficie casi nunca está en la curva.',
      'Escribir $\\nabla f = \\lambda\\nabla g$ con un solo multiplicador cuando hay dos restricciones.',
      'Dar $\\lambda$ o $\\mu$ como si fueran el valor de $f$.',
      'Dividir entre una variable que puede ser cero y perder candidatos.',
      'Quedarse con el primer candidato sin evaluar $f$ en todos (y dar el mínimo cuando se pedía el máximo).',
      'Dar la distancia al cuadrado cuando se pide la distancia (o al revés).'
    ],

    teacher: {
      plan: [
        'Recuerda S09 con una pregunta: ¿qué pasa si además pido estar sobre un plano? Corta un tubo de cartón en diagonal para ver la elipse.',
        'Explainer: que vean que $\\vec T = \\nabla g \\times \\nabla h$ y que en el máximo $\\nabla f$ ya no tiene parte a lo largo de $\\vec T$.',
        'Ejemplos 1 y 2 en el pizarrón; luego el lab, moviendo el punto hasta que la componente tangencial sea cero.',
        'Cierra con el ejemplo 3 (los casos) y la comprobación por parametrización.'
      ],
      check: [
        'Que escriban las 5 ecuaciones antes de resolver.',
        'Que evalúen $f$ en todos los candidatos y distingan el valor de $f$ de los multiplicadores.'
      ],
      note: 'La interpretación de $\\lambda$ y $\\mu$ como sensibilidad del valor óptimo se menciona en las dudas; no se evalúa.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §4.8 “Lagrange Multipliers”. <a href="https://openstax.org/books/calculus-volume-3/pages/4-8-lagrange-multipliers">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 3</em>, §4.7 “Maxima/Minima Problems”. <a href="https://openstax.org/books/calculus-volume-3/pages/4-7-maxima-minima-problems">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-09',
    next: 'sesion-11'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check !== 'numeric' || !ex.mistakes) return;
    ex.where = apart(ex);
  });
})();
