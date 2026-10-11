/* =====================================================================
   Cálculo 2 · S05 · Diferencial total (bloque A · Espacio y derivada parcial).
   Fuente: OpenStax, Calculus Volume 3, §4.4 (CC BY-NC-SA 4.0).
   Las cuentas se hacen aquí con fórmulas a mano y scripts/examples.test.js
   las compara contra LabMath.tplane (parciales con math.derivative).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  // Número con signo para escribir “x − 2” o “x + 2”.
  function minus(v) { return v < 0 ? ' + ' + fx(-v) : ' - ' + fx(v); }
  function plus(v) { return v < 0 ? ' - ' + fx(-v, 4) : ' + ' + fx(v, 4); }
  function co(k) { return k === 1 ? '' : String(k); }
  var TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]];

  // La respuesta y cada error típico deben quedar separados (más que la holgura del calificador),
  // para que el mensaje "casi" nunca sea ambiguo. gap(a, b) = separación mínima exigida.
  function apart(gap) {
    return function (ex) {
      return function (v) {
        var w = Object.assign({}, v, ex.derive ? ex.derive(v) : {});
        if (ex.baseWhere && !ex.baseWhere(w)) return false;
        var vals = [ex.answer(w)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](w); }));
        for (var i = 0; i < vals.length; i++) {
          if (!isFinite(vals[i])) return false;
          for (var j = i + 1; j < vals.length; j++) if (Math.abs(vals[i] - vals[j]) <= gap(vals[i], vals[j])) return false;
        }
        return true;
      };
    };
  }
  var REL = apart(function (p, q) { return 0.02 + 0.015 * Math.max(Math.abs(p), Math.abs(q)); });
  var ABS = apart(function () { return 0.025; });

  // Ejemplo 3: z = x²y en (2, 1) con Δx = 0.1, Δy = −0.05, y con la mitad.
  var e3 = { a: 2, b: 1, dx: 0.1, dy: -0.05 };
  e3.f0 = e3.a * e3.a * e3.b; e3.fx = 2 * e3.a * e3.b; e3.fy = e3.a * e3.a;
  e3.dz = e3.fx * e3.dx + e3.fy * e3.dy;
  e3.real = Math.pow(e3.a + e3.dx, 2) * (e3.b + e3.dy) - e3.f0;
  e3.err = Math.abs(e3.real - e3.dz);
  e3.real2 = Math.pow(e3.a + e3.dx / 2, 2) * (e3.b + e3.dy / 2) - e3.f0;
  e3.err2 = Math.abs(e3.real2 - e3.dz / 2);
  // Ejemplo 4: cilindro r = 5 ± 0.1 cm, h = 12 ± 0.2 cm.
  var e4 = { r: 5, h: 12, dr: 0.1, dh: 0.2 };
  e4.V = Math.PI * e4.r * e4.r * e4.h;
  e4.wall = 2 * Math.PI * e4.r * e4.h * e4.dr; e4.cap = Math.PI * e4.r * e4.r * e4.dh;
  e4.dV = e4.wall + e4.cap; e4.pct = 100 * e4.dV / e4.V;
  // Ejemplo 5: resistencias en paralelo R = R1 R2 / (R1 + R2).
  var e5 = { R1: 10, R2: 15, d1: 0.1, d2: 0.2 };
  e5.R = e5.R1 * e5.R2 / (e5.R1 + e5.R2);
  e5.k1 = Math.pow(e5.R2 / (e5.R1 + e5.R2), 2); e5.k2 = Math.pow(e5.R1 / (e5.R1 + e5.R2), 2);
  e5.dR = e5.k1 * e5.d1 + e5.k2 * e5.d2; e5.pct = 100 * e5.dR / e5.R;

  // Porcentaje de error de Q = k·x^m·y^n (una potencia negativa en cada caso).
  var PCT = [
    { q: 'la potencia eléctrica $P = \\dfrac{V^2}{R}$', x: 'V', y: 'R', m: 2, n: -1, src: 'x^2/y' },
    { q: 'la aceleración centrípeta $a = \\dfrac{v^2}{r}$', x: 'v', y: 'r', m: 2, n: -1, src: 'x^2/y' },
    { q: 'la gravedad medida con un péndulo, $g = \\dfrac{4\\pi^2 L}{T^2}$', x: 'L', y: 'T', m: 1, n: -2, src: '4*pi^2*x/y^2' },
    { q: 'la intensidad de una fuente, $I = \\dfrac{P}{4\\pi r^2}$', x: 'P', y: 'r', m: 1, n: -2, src: 'x/(4*pi*y^2)' }
  ];

  var data = window.SESSION_DATA = {
    slug: 'sesion-05', number: '05', group: 'A · Espacio y derivada parcial',
    title: 'Diferencial total: plano tangente, aproximación lineal y propagación de error', temario: [],
    minutes: 180,
    quote: 'De cerca, una superficie suave parece un plano. Con ese plano aproximas valores y estimas cuánto se equivoca un cálculo cuando las medidas traen error.',
    badges: [
      'Escribir el plano tangente $z = f(a, b) + f_x(x - a) + f_y(y - b)$ y su normal $\\langle f_x, f_y, -1\\rangle$.',
      'Aproximar valores con la linealización $L(x, y)$.',
      'Calcular el diferencial total $dz = f_x\\,dx + f_y\\,dy$ y compararlo con el cambio real $\\Delta z$.',
      'Estimar el error máximo, relativo y porcentual de un cálculo hecho con medidas.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Cerca de un punto, la superficie $z = f(x, y)$ se confunde con su <strong>plano tangente</strong>. Con él, un cambio pequeño se calcula con una suma: $dz = f_x\\,dx + f_y\\,dy$.',
        recall: [
          'La recta tangente de Cálculo 1, $y = f(a) + f\'(a)(x - a)$ (<a href="../../../calculo-1/sesiones/sesion-01/">Cálculo 1, S01</a>): aquí haremos lo mismo con un plano.',
          'Las derivadas parciales $f_x$ y $f_y$ (S04): son las pendientes de los dos cortes de la superficie.',
          'La ecuación de un plano con su vector normal (S01).'
        ],
        why: 'Ninguna medida es exacta. Si mides el radio y la altura de un tanque con una cinta que falla un milímetro, ¿cuánto puede fallar el volumen? El diferencial total responde en un renglón. Así se reportan incertidumbres en laboratorio y así se simplifican modelos complicados cerca de un punto de operación.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Vives sobre una Tierra redonda, pero tu calle se ve plana. De cerca, cualquier superficie suave se parece a un plano: ese es el <strong>plano tangente</strong>. Mientras te quedes cerca del punto, cambiar la superficie por el plano casi no se nota.',
          'Imagina una colina y una tabla rígida apoyada justo donde estás parado. Junto a tus pies la tabla y el pasto coinciden; si caminas lejos, la tabla queda por arriba o por abajo del suelo. Esa separación es el error de la aproximación, y crece rápido conforme te alejas.',
          'Ahora piensa en un carpintero que mide una mesa y se equivoca un milímetro en el largo y otro en el ancho. Cada error mueve el área por su lado: un poco por el largo, un poco por el ancho. El diferencial total suma esas dos contribuciones, y cada una pesa según su derivada parcial.'
        ]
      },
      {
        type: 'concept', heading: 'De la recta tangente al plano tangente', short: 'El plano tangente',
        body: [
          'En Cálculo 1, la recta tangente a $y = f(x)$ en $x = a$ es $y = f(a) + f\'(a)(x - a)$: pasa por el punto y tiene la pendiente de la curva.',
          'Con dos variables cortas la superficie dos veces por el punto $(a, b, f(a, b))$. El corte con $y = b$ es una curva con pendiente $f_x(a, b)$; el corte con $x = a$, otra con pendiente $f_y(a, b)$. Sus dos rectas tangentes generan un plano: $$z = f(a, b) + f_x\\,(x - a) + f_y\\,(y - b)$$ con $f_x$ y $f_y$ evaluadas en $(a, b)$.',
          'Si pasas todo a un lado queda $f_x(x - a) + f_y(y - b) - (z - f(a, b)) = 0$, así que un <strong>vector normal</strong> del plano es $\\vec n = \\langle f_x, f_y, -1\\rangle$ (o su opuesto, $\\langle -f_x, -f_y, 1\\rangle$, que apunta hacia arriba).'
        ]
      },
      {
        type: 'explainer', heading: 'Del corte al plano', short: 'Cómo se arma el plano',
        title: 'Dos tangentes generan el plano',
        intro: 'Sigue los cortes de la colina por el punto $P$. Cada corte aporta una recta; juntas definen el plano tangente.',
        diagram: 'c2s05-tangent',
        steps: [
          { text: 'Elige un punto $P = (a, b, f(a, b))$ sobre la superficie.', state: { tx: 0, ty: 0, pl: 0, nr: 0 } },
          { text: 'Corta con el plano $y = b$: queda una curva. Su recta tangente en $P$ tiene pendiente $f_x(a, b)$.', state: { tx: 1, ty: 0, pl: 0, nr: 0 } },
          { text: 'Corta con $x = a$: otra curva, con tangente de pendiente $f_y(a, b)$.', state: { tx: 1, ty: 1, pl: 0, nr: 0 } },
          { text: 'Las dos rectas se cruzan en $P$ y generan un plano: $z = f(a, b) + f_x(x - a) + f_y(y - b)$.', state: { tx: 1, ty: 1, pl: 1, nr: 0 } },
          { text: 'La normal es $\\langle f_x, f_y, -1\\rangle$, perpendicular a las dos rectas: $\\langle 1, 0, f_x\\rangle$ y $\\langle 0, 1, f_y\\rangle$. Compruébalo con el producto punto.', state: { tx: 1, ty: 1, pl: 1, nr: 1 } }
        ]
      },
      {
        type: 'concept', heading: 'Linealización: aproximar con el plano', short: 'Linealización',
        body: [
          'La función del plano tangente se llama <strong>linealización</strong> de $f$ en $(a, b)$: $$L(x, y) = f(a, b) + f_x(a, b)(x - a) + f_y(a, b)(y - b).$$',
          'Cerca de $(a, b)$, $f(x, y) \\approx L(x, y)$. Sirve para calcular a mano valores que no salen exactos. Por ejemplo, $\\sqrt{3.02^2 + 3.97^2}$ es difícil, pero $\\sqrt{3^2 + 4^2} = 5$ es fácil: usas $f(x, y) = \\sqrt{x^2 + y^2}$ en $(3, 4)$ y corriges con las parciales.',
          'Elige siempre un punto $(a, b)$ <strong>cercano</strong> donde $f$, $f_x$ y $f_y$ salgan fáciles. Mientras más lejos, peor la aproximación.'
        ]
      },
      {
        type: 'concept', heading: 'El diferencial total', short: 'Diferencial total',
        body: [
          'Si te mueves de $(a, b)$ a $(a + dx, b + dy)$, el plano tangente sube $$dz = f_x\\,dx + f_y\\,dy.$$ Eso es el <strong>diferencial total</strong>: lo que cambia $z$ por moverte en $x$ más lo que cambia por moverte en $y$. Sus unidades son las de $z$.',
          'El cambio <strong>real</strong> de la superficie es $\\Delta z = f(a + dx, b + dy) - f(a, b)$. No son iguales: $dz$ sigue al plano y $\\Delta z$ sigue a la superficie, que se curva. Pero si los pasos son chicos, $\\Delta z \\approx dz$, y el error $|\\Delta z - dz|$ es mucho más chico que el paso: si partes $dx$ y $dy$ a la mitad, el error baja a cerca de la cuarta parte.',
          'Con tres variables es igual, un término por variable: si $w = f(x, y, z)$, $$dw = f_x\\,dx + f_y\\,dy + f_z\\,dz.$$ Por ejemplo, la caja $V = xyz$ tiene $dV = yz\\,dx + xz\\,dy + xy\\,dz$.'
        ]
      },
      {
        type: 'explainer', heading: 'dz contra Δz', short: 'dz contra Δz',
        title: 'La escalera del plano y el hueco',
        intro: 'Muévete $\\Delta x$ y $\\Delta y$ desde $P$. Sobre el plano subes por escalones; la superficie sube otra cosa.',
        diagram: 'c2s05-dz',
        steps: [
          { text: 'En el piso te mueves $\\Delta x$ en $x$ y $\\Delta y$ en $y$.', state: { k: 1, s: 1 } },
          { text: 'Sobre el plano, el paso en $x$ sube $f_x\\,\\Delta x$.', state: { k: 2, s: 1 } },
          { text: 'El paso en $y$ sube $f_y\\,\\Delta y$. En total, $dz = f_x\\,\\Delta x + f_y\\,\\Delta y$.', state: { k: 3, s: 1 } },
          { text: 'La superficie de verdad sube $\\Delta z$. Como la colina se curva hacia abajo, queda bajo el plano: el hueco es el error $|\\Delta z - dz|$.', state: { k: 4, s: 1 } },
          { text: 'Con pasos de la mitad, el hueco baja a cerca de la cuarta parte. Por eso $dz$ es tan buena aproximación para cambios chicos.', state: { k: 4, s: 0.5 } }
        ]
      },
      {
        type: 'concept', heading: 'Propagación de error', short: 'Propagación de error',
        body: [
          'Si $x$ y $y$ son medidas con incertidumbre $\\pm dx$ y $\\pm dy$, el resultado $z = f(x, y)$ también trae incertidumbre. Los errores pueden ir hacia cualquier lado, así que en el peor caso <strong>se suman</strong>: $$|dz| \\le |f_x|\\,|dx| + |f_y|\\,|dy|.$$ Ese es el <strong>error absoluto máximo</strong>. Los valores absolutos importan: si $f_y < 0$, sin ellos un término le restaría al otro y te saldría un error menor que el real.',
          'El <strong>error relativo</strong> es $\\dfrac{|dz|}{|z|}$ y el <strong>porcentual</strong>, ese número por 100. En productos y cocientes de potencias sale un atajo: si $z = k\\,x^m y^n$, el error relativo es $|m|\\dfrac{|dx|}{x} + |n|\\dfrac{|dy|}{y}$. Así, en $V = \\pi r^2 h$ el radio pesa el doble que la altura.'
        ],
        diagram: 'c2s05-cylinder',
        caption: 'Si el radio crece $dr$, se agrega una pared delgada de volumen $2\\pi r h\\,dr$; si la altura crece $dh$, una tapa de volumen $\\pi r^2 dh$. Juntas dan $dV$.'
      },
      {
        type: 'callout', heading: 'Diferenciable: más que tener parciales',
        body: [
          'Una función es <strong>diferenciable</strong> en $(a, b)$ cuando el plano tangente la aproxima bien: el error $|\\Delta z - dz|$ se va a cero más rápido que el tamaño del paso, en <em>todas</em> las direcciones.',
          'Que existan $f_x$ y $f_y$ no basta: solo miran dos direcciones. Por ejemplo, $f(x, y) = \\dfrac{xy}{x^2 + y^2}$ con $f(0, 0) = 0$ vale 0 sobre los dos ejes (así que $f_x(0, 0) = f_y(0, 0) = 0$), pero vale $\\tfrac{1}{2}$ sobre toda la recta $y = x$: ni siquiera es continua en el origen y no tiene plano tangente.',
          'La regla práctica: si $f_x$ y $f_y$ existen y son <strong>continuas</strong> cerca del punto, $f$ es diferenciable ahí. Los polinomios, exponenciales, senos y sus combinaciones lo son donde están definidos.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: plano tangente, aproximación y error', short: 'Receta',
        steps: [
          { text: 'Elige el punto $(a, b)$: el que te dan, o uno cercano donde $f$ salga fácil.' },
          { text: 'Calcula $f(a, b)$, $f_x(a, b)$ y $f_y(a, b)$.', tip: 'Evalúa las parciales en $(a, b)$, no en el punto nuevo. Y no las cruces: $f_x$ va con $x$ y $f_y$ con $y$.' },
          { text: 'Plano tangente o linealización: $z = f(a, b) + f_x(x - a) + f_y(y - b)$.' },
          { text: 'Para un cambio: $dx = x - a$, $dy = y - b$ y $dz = f_x\\,dx + f_y\\,dy$. La aproximación es $f(a, b) + dz$.', tip: 'Respeta los signos: si $x$ baja, $dx$ es negativo.' },
          { text: 'Para el error máximo, suma con valores absolutos: $|f_x|\\,|dx| + |f_y|\\,|dy|$. Divide entre $|f|$ para el relativo y multiplica por 100 para el porcentual.', tip: 'Sin valores absolutos, un término negativo esconde parte del error.' }
        ]
      },
      {
        type: 'example', heading: 'Un plano tangente',
        problem: '<p>Encuentra el plano tangente a $z = x^2 + xy + 2y^2$ en el punto donde $x = 1$, $y = 2$.</p>',
        steps: [
          { text: 'Altura del punto.', math: 'f(1, 2) = 1 + 2 + 8 = 11' },
          { text: 'Parciales y su valor en $(1, 2)$.', math: 'f_x = 2x + y = 4 \\qquad f_y = x + 4y = 9' },
          { text: 'Arma el plano y simplifica.', math: 'z = 11 + 4(x - 1) + 9(y - 2) = 4x + 9y - 11' },
          { text: 'Un vector normal sale de los coeficientes.', math: '\\vec n = \\langle 4, 9, -1\\rangle' }
        ],
        answer: 'El plano tangente es $z = 4x + 9y - 11$, con normal $\\langle 4, 9, -1\\rangle$.',
        verify: { lab: 'call', mod: 'tplane', fn: 'tangentPlane', math: true, args: ['x^2 + x*y + 2y^2', 1, 2], values: { f0: 11, fx: 4, fy: 9, c: -11 } }
      },
      {
        type: 'example', heading: 'Aproximar una raíz',
        problem: '<p>Aproxima $\\sqrt{3.02^2 + 3.97^2}$ con la linealización de $f(x, y) = \\sqrt{x^2 + y^2}$.</p>',
        steps: [
          { text: 'Un punto cercano y fácil: $(3, 4)$, donde $f = 5$. Los cambios son $dx = 0.02$ y $dy = -0.03$.' },
          { text: 'Parciales en $(3, 4)$.', math: 'f_x = \\frac{x}{\\sqrt{x^2 + y^2}} = \\frac{3}{5} = 0.6 \\qquad f_y = \\frac{4}{5} = 0.8' },
          { text: 'Diferencial total.', math: 'dz = 0.6(0.02) + 0.8(-0.03) = -0.012' },
          { text: 'Aproximación.', math: 'L = 5 + (-0.012) = 4.988' }
        ],
        answer: '$\\sqrt{3.02^2 + 3.97^2} \\approx 4.988$. La calculadora da $4.98812\\ldots$: el plano falla por apenas una diezmilésima.',
        verify: { lab: 'call', mod: 'tplane', fn: 'linear', math: true, args: ['sqrt(x^2 + y^2)', 3, 4, 0.02, -0.03], values: { L: 4.988, dz: -0.012, f0: 5 } }
      },
      {
        type: 'example', heading: 'dz contra Δz',
        problem: '<p>Para $z = x^2y$ en $(2, 1)$ con $\\Delta x = ' + e3.dx + '$ y $\\Delta y = ' + e3.dy + '$, compara $dz$ con el cambio real $\\Delta z$. ¿Qué pasa con el error si partes los pasos a la mitad?</p>',
        steps: [
          { text: 'Parciales en $(2, 1)$: $f_x = 2xy = ' + e3.fx + '$ y $f_y = x^2 = ' + e3.fy + '$.', math: 'dz = ' + e3.fx + '(' + e3.dx + ') + ' + e3.fy + '(' + e3.dy + ') = ' + fx(e3.dz, 4) },
          { text: 'Cambio real, evaluando $f$ en el punto nuevo.', math: '\\Delta z = (2.1)^2(0.95) - 4 = ' + fx(e3.real, 4) },
          { text: 'Error de la aproximación.', math: '|\\Delta z - dz| = ' + fx(e3.err, 4) },
          { text: 'Con la mitad de los pasos, $dz = ' + fx(e3.dz / 2, 4) + '$ y $\\Delta z = ' + fx(e3.real2, 7) + '$.', math: '|\\Delta z - dz| = ' + fx(e3.err2, 7) + ' \\approx \\frac{' + fx(e3.err, 4) + '}{4}' }
        ],
        answer: '$dz = ' + fx(e3.dz, 4) + '$ y $\\Delta z = ' + fx(e3.real, 4) + '$; el error es $' + fx(e3.err, 4) + '$. Con pasos de la mitad baja a $' + fx(e3.err2, 5) + '$, cerca de la cuarta parte.',
        verify: { lab: 'call', mod: 'tplane', fn: 'linear', math: true, args: ['x^2*y', e3.a, e3.b, e3.dx, e3.dy], values: { dz: e3.dz, dzReal: e3.real, err: e3.err } }
      },
      {
        type: 'example', heading: 'El error en el volumen de un cilindro',
        problem: '<p>Mides un cilindro: $r = ' + e4.r + ' \\pm ' + e4.dr + '\\ \\text{cm}$ y $h = ' + e4.h + ' \\pm ' + e4.dh + '\\ \\text{cm}$. Estima el error máximo del volumen y su porcentaje.</p>',
        steps: [
          { text: 'Volumen con las medidas.', math: 'V = \\pi r^2 h = \\pi(25)(12) = 300\\pi \\approx ' + fx(e4.V) + '\\ \\text{cm}^3' },
          { text: 'Parciales: $V_r = 2\\pi r h$ y $V_h = \\pi r^2$.', math: '|dV| \\le 2\\pi(5)(12)(0.1) + \\pi(25)(0.2) = 12\\pi + 5\\pi = 17\\pi' },
          { text: 'En números.', math: '17\\pi \\approx ' + fx(e4.dV) + '\\ \\text{cm}^3' },
          { text: 'Porcentaje: con el atajo, $2\\frac{dr}{r} + \\frac{dh}{h} = 2(0.02) + 0.0167$.', math: '\\frac{17\\pi}{300\\pi} \\times 100 \\approx ' + fx(e4.pct) + '\\,\\%' }
        ],
        answer: 'El volumen es $' + fx(e4.V) + ' \\pm ' + fx(e4.dV) + '\\ \\text{cm}^3$, un error de cerca del $' + fx(e4.pct) + '\\,\\%$. El radio aporta más del doble que la altura.',
        verify: { lab: 'call', mod: 'tplane', fn: 'propagate', math: true, args: ['pi*r^2*h', ['r', 'h'], [e4.r, e4.h], [e4.dr, e4.dh]], values: { value: e4.V, abs: e4.dV, pct: e4.pct } }
      },
      {
        type: 'example', heading: 'Resistencias en paralelo',
        problem: '<p>Dos resistencias en paralelo dan $R = \\dfrac{R_1R_2}{R_1 + R_2}$. Si $R_1 = ' + e5.R1 + ' \\pm ' + e5.d1 + '\\ \\Omega$ y $R_2 = ' + e5.R2 + ' \\pm ' + e5.d2 + '\\ \\Omega$, ¿cuánto vale $R$ y con qué error máximo?</p>',
        steps: [
          { text: 'Valor nominal.', math: 'R = \\frac{(10)(15)}{25} = ' + fx(e5.R) + '\\ \\Omega' },
          { text: 'Parciales (regla del cociente): $\\dfrac{\\partial R}{\\partial R_1} = \\dfrac{R_2^2}{(R_1 + R_2)^2}$ y $\\dfrac{\\partial R}{\\partial R_2} = \\dfrac{R_1^2}{(R_1 + R_2)^2}$.', math: '\\frac{225}{625} = ' + fx(e5.k1) + ' \\qquad \\frac{100}{625} = ' + fx(e5.k2) },
          { text: 'Error máximo.', math: '|dR| \\le ' + fx(e5.k1) + '(' + e5.d1 + ') + ' + fx(e5.k2) + '(' + e5.d2 + ') = ' + fx(e5.dR, 3) + '\\ \\Omega' }
        ],
        answer: '$R = ' + fx(e5.R) + ' \\pm ' + fx(e5.dR, 3) + '\\ \\Omega$, alrededor de $' + fx(e5.pct) + '\\,\\%$.',
        verify: { lab: 'call', mod: 'tplane', fn: 'propagate', math: true, args: ['R1*R2/(R1 + R2)', ['R1', 'R2'], [e5.R1, e5.R2], [e5.d1, e5.d2]], values: { value: e5.R, abs: e5.dR, pct: e5.pct } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿$dz$ y $\\Delta z$ son lo mismo?', a: 'No. $\\Delta z$ es el cambio real de la superficie; $dz$ es el cambio sobre el plano tangente. Para pasos chicos casi coinciden, y por eso $dz$ se usa para estimar $\\Delta z$ sin evaluar $f$.' },
          { q: '¿Por qué el error máximo lleva valores absolutos?', a: 'Porque cada medida puede fallar hacia arriba o hacia abajo. El peor caso es cuando todos los errores empujan el resultado hacia el mismo lado, y eso es sumar sus tamaños.' },
          { q: '¿En dónde evalúo $f_x$ y $f_y$?', a: 'En el punto base $(a, b)$, el que conoces bien. Si las evalúas en el punto nuevo ya no es la linealización.' },
          { q: '¿Si existen $f_x$ y $f_y$ ya hay plano tangente?', a: 'No siempre. Las parciales solo ven dos direcciones. Necesitas que la función sea diferenciable; basta con que las parciales sean continuas cerca del punto.' },
          { q: '¿Y el plano tangente a una esfera $x^2 + y^2 + z^2 = 9$?', a: 'Puedes despejar $z = \\sqrt{9 - x^2 - y^2}$ y usar la fórmula de esta sesión. Hay un camino más directo con el gradiente: lo verás en S08.' },
          { q: '¿El error relativo de un producto es la suma de los relativos?', a: 'Para $z = xy$, sí: $\\dfrac{dz}{z} = \\dfrac{dx}{x} + \\dfrac{dy}{y}$. Con potencias, cada uno se multiplica por su exponente (en valor absoluto).' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Plano tangente: $z = f(a, b) + f_x(x - a) + f_y(y - b)$, con normal $\\langle f_x, f_y, -1\\rangle$.',
          'Cerca del punto, $f \\approx L$: aproxima con un punto cercano y fácil.',
          '$dz = f_x\\,dx + f_y\\,dy$ estima $\\Delta z$; el error baja como el cuadrado del paso.',
          'Error máximo: $|f_x||dx| + |f_y||dy|$; entre $|f|$ da el relativo.'
        ]
      }
    ],

    lab: {
      type: 'tangent-plane', title: 'Plano tangente contra superficie',
      intro: 'Elige una superficie, el punto $(a, b)$ y los pasos $\\Delta x$, $\\Delta y$. El tablero compara en vivo el cambio real $\\Delta z$ con $dz$. Luego escribe tu $dz$, tu $L(a + \\Delta x, b + \\Delta y)$ o tu error máximo: el lab te dice si usaste $\\Delta z$ real, si olvidaste un término, si cruzaste $f_x$ con $f_y$ o si sumaste sin valores absolutos.',
      cfg: { start: 0 }
    },

    formulas: [
      { label: 'Plano tangente', tex: 'z = f(a, b) + f_x(x - a) + f_y(y - b)' },
      { label: 'Vector normal', tex: '\\vec n = \\langle f_x, f_y, -1\\rangle' },
      { label: 'Linealización', tex: 'f(x, y) \\approx L(x, y)' },
      { label: 'Diferencial total', tex: 'dz = f_x\\,dx + f_y\\,dy' },
      { label: 'Tres variables', tex: 'dw = f_x\\,dx + f_y\\,dy + f_z\\,dz' },
      { label: 'Cambio real', tex: '\\Delta z = f(a + dx, b + dy) - f(a, b)' },
      { label: 'Error máximo', tex: '|dz| \\le |f_x||dx| + |f_y||dy|' },
      { label: 'Error relativo', tex: '\\frac{|dz|}{|z|}\\ \\ (\\times 100 = \\%)' }
    ],

    exercises: [
      {
        id: 'c2-s05-plano', title: 'Término independiente del plano',
        vars: { A: [1, 3, 1], B: [1, 3, 1], D: [10, 30, 5], a: [-2, 2, 1], b: [-2, 2, 1] },
        baseWhere: function (v) { return v.a !== 0 && v.b !== 0; },
        prompt: function (v) { return '<p>La colina $z = ' + v.D + ' - ' + co(v.A) + 'x^2 - ' + co(v.B) + 'y^2$ tiene, en el punto con $x = ' + v.a + '$ y $y = ' + v.b + '$, un plano tangente que se escribe $z = Px + Qy + R$. ¿Cuánto vale $R$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.D + v.A * v.a * v.a + v.B * v.b * v.b; },
        mistakes: {
          f0: function (v) { return v.D - v.A * v.a * v.a - v.B * v.b * v.b; },
          signs: function (v) { return v.D - 3 * (v.A * v.a * v.a + v.B * v.b * v.b); }
        },
        feedback: [
          { when: 'f0', say: 'Ese es $f(a, b)$, la altura del punto. $R$ sale al desarrollar $f(a, b) + f_x(x - a) + f_y(y - b)$: queda $R = f(a, b) - f_x a - f_y b$.' },
          { when: 'signs', say: 'Revisa los signos al desarrollar: $f_x(x - a)$ aporta $-f_x a$ al término independiente, no $+f_x a$.' }
        ],
        oracle: { lab: 'call', mod: 'tplane', fn: 'tangentPlane', math: true, field: 'c', args: function (v) { return [v.D + ' - ' + v.A + '*x^2 - ' + v.B + '*y^2', v.a, v.b]; } },
        hint: 'Calcula $f(a, b)$, $f_x = -2Ax$ y $f_y = -2By$ en el punto; luego desarrolla $z = f(a, b) + f_x(x - a) + f_y(y - b)$ y junta las constantes.',
        solution: function (v) {
          var f0 = v.D - v.A * v.a * v.a - v.B * v.b * v.b, px = -2 * v.A * v.a, py = -2 * v.B * v.b, R = f0 - px * v.a - py * v.b;
          return '$f = ' + f0 + '$, $f_x = ' + px + '$, $f_y = ' + py + '$. $$z = ' + f0 + ' + (' + px + ')(x' + minus(v.a) + ') + (' + py + ')(y' + minus(v.b) + ') = ' + px + 'x + (' + py + ')y + ' + R + '$$ así que $R = ' + R + '$.';
        }
      },
      {
        id: 'c2-s05-aprox', title: 'Aproximar con L',
        vars: { k: [0, 3, 1], dx: [-0.2, 0.2, 0.05], dy: [-0.2, 0.2, 0.05] },
        derive: function (v) { var t = TRIPLES[v.k]; return { a: t[0], b: t[1], r: t[2] }; },
        baseWhere: function (v) { return v.dx !== 0 && v.dy !== 0; },
        prompt: function (v) { return '<p>Usa la linealización de $f(x, y) = \\sqrt{x^2 + y^2}$ en $(' + v.a + ', ' + v.b + ')$ para aproximar $\\sqrt{' + fx(v.a + v.dx) + '^2 + ' + fx(v.b + v.dy) + '^2}$.</p>'; },
        check: 'numeric', tol: { abs: 0.01 },
        answer: function (v) { return v.r + (v.a * v.dx + v.b * v.dy) / v.r; },
        mistakes: {
          onlyDz: function (v) { return (v.a * v.dx + v.b * v.dy) / v.r; },
          swap: function (v) { return v.r + (v.a * v.dy + v.b * v.dx) / v.r; },
          missX: function (v) { return v.r + v.b * v.dy / v.r; },
          missY: function (v) { return v.r + v.a * v.dx / v.r; }
        },
        feedback: [
          { when: 'onlyDz', say: 'Eso es solo $dz$, el cambio. Súmale $f(a, b) = r$ para tener la aproximación.' },
          { when: 'swap', say: 'Cruzaste las parciales: $f_x = x/r$ va con $dx$ y $f_y = y/r$ con $dy$.' },
          { when: 'missX', say: 'Te faltó el término $f_x\\,dx$: también cambia $x$.' },
          { when: 'missY', say: 'Te faltó el término $f_y\\,dy$: también cambia $y$.' }
        ],
        oracle: { lab: 'call', mod: 'tplane', fn: 'linear', math: true, field: 'L', args: function (v) { return ['sqrt(x^2 + y^2)', v.a, v.b, v.dx, v.dy]; } },
        hint: 'En $(a, b)$: $f = r$, $f_x = a/r$, $f_y = b/r$. Luego $L = r + f_x\\,dx + f_y\\,dy$.',
        solution: function (v) {
          var dz = (v.a * v.dx + v.b * v.dy) / v.r;
          return '$f = ' + v.r + '$, $f_x = \\tfrac{' + v.a + '}{' + v.r + '}$, $f_y = \\tfrac{' + v.b + '}{' + v.r + '}$, $dx = ' + v.dx + '$, $dy = ' + v.dy + '$. $$L = ' + v.r + ' + \\tfrac{' + v.a + '}{' + v.r + '}(' + v.dx + ') + \\tfrac{' + v.b + '}{' + v.r + '}(' + v.dy + ') = ' + v.r + plus(dz) + ' \\approx ' + fx(v.r + dz) + '$$';
        }
      },
      {
        id: 'c2-s05-dz', title: 'Diferencial total',
        vars: { a: [1, 3, 1], b: [1, 2, 1], dx: [-0.2, 0.2, 0.05], dy: [-0.2, 0.2, 0.05] },
        baseWhere: function (v) { return v.dx !== 0 && v.dy !== 0; },
        prompt: function (v) { return '<p>Para $z = x^2y^3$, calcula $dz$ en $(' + v.a + ', ' + v.b + ')$ con $dx = ' + v.dx + '$ y $dy = ' + v.dy + '$.</p>'; },
        check: 'numeric',
        answer: function (v) { return 2 * v.a * Math.pow(v.b, 3) * v.dx + 3 * v.a * v.a * v.b * v.b * v.dy; },
        mistakes: {
          real: function (v) { return Math.pow(v.a + v.dx, 2) * Math.pow(v.b + v.dy, 3) - v.a * v.a * Math.pow(v.b, 3); },
          swap: function (v) { return 2 * v.a * Math.pow(v.b, 3) * v.dy + 3 * v.a * v.a * v.b * v.b * v.dx; },
          missX: function (v) { return 3 * v.a * v.a * v.b * v.b * v.dy; },
          missY: function (v) { return 2 * v.a * Math.pow(v.b, 3) * v.dx; }
        },
        feedback: [
          { when: 'real', say: 'Calculaste el cambio real $\\Delta z$ evaluando $f$ en el punto nuevo. Se pide $dz = f_x\\,dx + f_y\\,dy$, el cambio sobre el plano.' },
          { when: 'swap', say: 'Cruzaste las parciales: $f_x$ multiplica a $dx$ y $f_y$ a $dy$.' },
          { when: 'missX', say: 'Te faltó el término $f_x\\,dx$.' },
          { when: 'missY', say: 'Te faltó el término $f_y\\,dy$.' }
        ],
        oracle: { lab: 'call', mod: 'tplane', fn: 'linear', math: true, field: 'dz', args: function (v) { return ['x^2*y^3', v.a, v.b, v.dx, v.dy]; } },
        hint: '$f_x = 2xy^3$ y $f_y = 3x^2y^2$, evaluadas en el punto.',
        solution: function (v) {
          var px = 2 * v.a * Math.pow(v.b, 3), py = 3 * v.a * v.a * v.b * v.b;
          return '$f_x = ' + px + '$ y $f_y = ' + py + '$. $$dz = ' + px + '(' + v.dx + ') + ' + py + '(' + v.dy + ') = ' + fx(px * v.dx + py * v.dy, 4) + '$$';
        }
      },
      {
        id: 'c2-s05-volumen', title: 'Error máximo de un volumen',
        vars: { cone: [0, 1, 1], r: [2, 10, 1], h: [5, 30, 1], dr: [0.05, 0.2, 0.05], dh: [0.1, 0.5, 0.1] },
        prompt: function (v) {
          return '<p>Mides ' + (v.cone ? 'un cono, $V = \\tfrac{1}{3}\\pi r^2 h$' : 'un cilindro, $V = \\pi r^2 h$') + ', con $r = ' + v.r + ' \\pm ' + v.dr + '\\ \\text{cm}$ y $h = ' + v.h + ' \\pm ' + v.dh + '\\ \\text{cm}$. ¿Cuál es el error máximo del volumen?</p>';
        },
        check: 'numeric', unit: 'cm³',
        answer: function (v) { return (v.cone ? 1 / 3 : 1) * (2 * Math.PI * v.r * v.h * v.dr + Math.PI * v.r * v.r * v.dh); },
        mistakes: {
          noTwo: function (v) { return (v.cone ? 1 / 3 : 1) * (Math.PI * v.r * v.h * v.dr + Math.PI * v.r * v.r * v.dh); },
          missR: function (v) { return (v.cone ? 1 / 3 : 1) * Math.PI * v.r * v.r * v.dh; },
          missH: function (v) { return (v.cone ? 1 / 3 : 1) * 2 * Math.PI * v.r * v.h * v.dr; }
        },
        feedback: [
          { when: 'noTwo', say: 'Al derivar $r^2$ sale $2r$: $V_r = 2\\pi r h$' + ' (por $\\tfrac{1}{3}$ si es cono).' },
          { when: 'missR', say: 'Te faltó la contribución del radio, $|V_r|\\,dr$. Suele ser la más grande.' },
          { when: 'missH', say: 'Te faltó la contribución de la altura, $|V_h|\\,dh$.' }
        ],
        oracle: { lab: 'call', mod: 'tplane', fn: 'propagate', math: true, field: 'abs', args: function (v) { return [v.cone ? 'pi*r^2*h/3' : 'pi*r^2*h', ['r', 'h'], [v.r, v.h], [v.dr, v.dh]]; } },
        hint: 'Error máximo: $|V_r|\\,dr + |V_h|\\,dh$, con $V_r = 2\\pi r h$ y $V_h = \\pi r^2$' + ' (los dos por $\\tfrac{1}{3}$ en el cono).',
        solution: function (v) {
          var k = v.cone ? '\\tfrac{1}{3}' : '', val = (v.cone ? 1 / 3 : 1) * (2 * Math.PI * v.r * v.h * v.dr + Math.PI * v.r * v.r * v.dh);
          return '$$|dV| \\le ' + k + '\\big[2\\pi(' + v.r + ')(' + v.h + ')(' + v.dr + ') + \\pi(' + v.r + ')^2(' + v.dh + ')\\big] \\approx ' + fx(val) + '\\ \\text{cm}^3$$';
        }
      },
      {
        id: 'c2-s05-porcentaje', title: 'Error porcentual',
        vars: { c: [0, 3, 1], px: [0.5, 3, 0.5], py: [0.5, 3, 0.5] },
        prompt: function (v) {
          var C = PCT[v.c];
          return '<p>Calculas ' + C.q + '. Mides $' + C.x + '$ con un error de $' + v.px + '\\,\\%$ y $' + C.y + '$ con uno de $' + v.py + '\\,\\%$. ¿Cuál es el error porcentual máximo del resultado? (Escribe solo el número de por ciento.)</p>';
        },
        check: 'numeric', unit: '%',
        answer: function (v) { var C = PCT[v.c]; return Math.abs(C.m) * v.px + Math.abs(C.n) * v.py; },
        mistakes: {
          noAbs: function (v) { var C = PCT[v.c]; return C.m * v.px + C.n * v.py; },
          noExp: function (v) { return v.px + v.py; }
        },
        feedback: [
          { when: 'noAbs', say: 'Restaste un error porque su exponente es negativo. En el peor caso los errores se suman: usa $|m|$ y $|n|$.' },
          { when: 'noExp', say: 'Cada error relativo se multiplica por el exponente de su variable (en valor absoluto).' }
        ],
        oracle: { lab: 'call', mod: 'tplane', fn: 'propagate', math: true, field: 'pct', args: function (v) { var C = PCT[v.c]; return [C.src, ['x', 'y'], [3, 2], [3 * v.px / 100, 2 * v.py / 100]]; } },
        hint: 'Si $Q = k\\,x^m y^n$, entonces $\\dfrac{|dQ|}{|Q|} \\le |m|\\dfrac{|dx|}{x} + |n|\\dfrac{|dy|}{y}$.',
        solution: function (v) {
          var C = PCT[v.c];
          return 'Exponentes: $' + C.m + '$ y $' + C.n + '$. $$' + Math.abs(C.m) + '(' + v.px + '\\,\\%) + ' + Math.abs(C.n) + '(' + v.py + '\\,\\%) = ' + fx(Math.abs(C.m) * v.px + Math.abs(C.n) * v.py) + '\\,\\%$$';
        }
      },
      {
        id: 'c2-s05-esquina', title: 'El hueco en un rectángulo',
        vars: { x: [3, 12, 1], y: [2, 10, 1], dx: [0.1, 0.5, 0.1], dy: [0.1, 0.5, 0.1] },
        prompt: function (v) { return '<p>Un rectángulo de $' + v.x + ' \\times ' + v.y + '$ cm crece a $' + fx(v.x + v.dx) + ' \\times ' + fx(v.y + v.dy) + '$ cm. Con $A = xy$, ¿cuánto vale $\\Delta A - dA$, la diferencia entre el cambio real del área y el diferencial?</p>'; },
        check: 'numeric', unit: 'cm²',
        answer: function (v) { return v.dx * v.dy; },
        mistakes: {
          dA: function (v) { return v.y * v.dx + v.x * v.dy; },
          real: function (v) { return (v.x + v.dx) * (v.y + v.dy) - v.x * v.y; }
        },
        feedback: [
          { when: 'dA', say: 'Ese es $dA = y\\,dx + x\\,dy$. Se pide lo que le falta para llegar al cambio real.' },
          { when: 'real', say: 'Ese es el cambio real $\\Delta A$. Réstale $dA = y\\,dx + x\\,dy$.' }
        ],
        oracle: { lab: 'call', mod: 'tplane', fn: 'linear', math: true, field: 'err', args: function (v) { return ['x*y', v.x, v.y, v.dx, v.dy]; } },
        hint: 'Desarrolla $(x + dx)(y + dy) - xy$ y compáralo con $dA = y\\,dx + x\\,dy$. Dibuja el rectángulo grande: ¿qué pedazo no cuenta $dA$?',
        solution: function (v) { return '$\\Delta A = y\\,dx + x\\,dy + dx\\,dy$ y $dA = y\\,dx + x\\,dy$, así que $\\Delta A - dA = dx\\,dy = (' + v.dx + ')(' + v.dy + ') = ' + fx(v.dx * v.dy, 4) + '\\ \\text{cm}^2$: la esquinita que el plano no ve.'; }
      },
      {
        id: 'c2-s05-mitad', title: 'Concepto: pasos de la mitad',
        vars: {},
        prompt: function () { return '<p>Para una función suave, si partes $\\Delta x$ y $\\Delta y$ a la mitad (misma dirección), ¿qué pasa aproximadamente con el error $|\\Delta z - dz|$?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Baja a cerca de la cuarta parte', correct: true },
            { text: 'Baja a la mitad', say: 'El error depende del cuadrado del paso (la curvatura), no del paso: baja más rápido que $\\Delta$.' },
            { text: 'No cambia', say: 'Mientras más cerca del punto, mejor se pega el plano a la superficie.' },
            { text: 'Se duplica', say: 'Al revés: con pasos más chicos el plano se parece más a la superficie.' }
          ];
        },
        answer: function () { return 'Baja a cerca de la cuarta parte'; },
        hint: 'Mira el ejemplo de $z = x^2y$ o el botón de la mitad en el lab.',
        solution: function () { return 'El error es de orden $\\Delta^2$: con la mitad del paso, $(\\tfrac{1}{2})^2 = \\tfrac{1}{4}$ del error.'; }
      },
      {
        id: 'c2-s05-diferenciable', title: 'Concepto: diferenciable',
        vars: {},
        prompt: function () { return '<p>Sea $f(x, y) = \\dfrac{xy}{x^2 + y^2}$ con $f(0, 0) = 0$. Sabes que $f_x(0, 0) = f_y(0, 0) = 0$. ¿Tiene $f$ plano tangente en el origen?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'No: ni siquiera es continua ahí', correct: true },
            { text: 'Sí: el plano $z = 0$', say: 'Sobre la recta $y = x$ la función vale $\\tfrac{1}{2}$, no se acerca a 0: el plano $z = 0$ no la aproxima.' },
            { text: 'Sí, porque existen las dos parciales', say: 'Las parciales solo miran los ejes. Hacen falta parciales continuas (o que el error se vaya a cero en todas las direcciones).' },
            { text: 'No se puede saber', say: 'Sí se puede: prueba la dirección $y = x$.' }
          ];
        },
        answer: function () { return 'No: ni siquiera es continua ahí'; },
        hint: 'Evalúa $f$ sobre la recta $y = x$.',
        solution: function () { return 'Con $y = x$: $f = \\dfrac{x^2}{2x^2} = \\tfrac{1}{2}$ para todo $x \\neq 0$. Cerca del origen $f$ salta entre 0 y $\\tfrac{1}{2}$: no es continua, así que no es diferenciable ni tiene plano tangente.'; }
      }
    ],

    quiz: { tags: ['c2.S05'], count: 8 },

    errors: [
      'Evaluar $f_x$ y $f_y$ en el punto nuevo en lugar del punto base $(a, b)$.',
      'Cruzar las parciales: $f_x$ va con $dx$ y $f_y$ con $dy$.',
      'Olvidar sumar $f(a, b)$ al usar $L$: $dz$ es solo el cambio.',
      'Confundir $dz$ (cambio sobre el plano) con $\\Delta z$ (cambio real).',
      'Sumar errores sin valor absoluto: un término negativo esconde parte del error máximo.',
      'Creer que basta con que existan las parciales para tener plano tangente.'
    ],

    teacher: {
      plan: [
        'Arranca con la recta tangente de Cálculo 1 y pregunta qué haría falta con dos variables.',
        'Explainer de los cortes: que vean que el plano sale de dos rectas tangentes.',
        'Ejemplos 2 y 3 en el pizarrón; luego el lab con el botón de la mitad para ver el error bajar cuatro veces.',
        'Cierra con el cilindro: ¿qué medida conviene medir con más cuidado?'
      ],
      check: [
        'Que escriban $f$, $f_x$, $f_y$ en el punto antes de armar el plano.',
        'Que distingan $dz$ de $\\Delta z$ y usen valores absolutos en el error máximo.'
      ],
      note: 'El plano tangente a una superficie de nivel $F(x, y, z) = 0$ se deja para S08, con el gradiente.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §4.4 “Tangent Planes and Linear Approximations”. <a href="https://openstax.org/books/calculus-volume-3/pages/4-4-tangent-planes-and-linear-approximations">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 1</em>, §4.2 “Linear Approximations and Differentials”. <a href="https://openstax.org/books/calculus-volume-1/pages/4-2-linear-approximations-and-differentials">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-04',
    next: 'sesion-06'
  };
  // Separación entre la respuesta y los errores típicos: absoluta en el de ±0.01, relativa en los demás.
  data.exercises.forEach(function (ex) {
    if (ex.check !== 'numeric' || !ex.mistakes) return;
    ex.where = (ex.tol && ex.tol.abs != null ? ABS : REL)(ex);
  });
})();
