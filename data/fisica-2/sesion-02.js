/* =====================================================================
   Física 2 · S02 · Ley de Coulomb y superposición de fuerzas (bloque A · Electrostática).
   Fuente: OpenStax, University Physics Volume 2, §5.3 (CC BY-NC-SA 4.0).
   k = 8.99 × 10⁹ N·m²/C², e = 1.60 × 10⁻¹⁹ C, SI. Ángulos en grados desde +x,
   antihorario, en [0°, 360°). Las cuentas se hacen aquí con fórmulas escalares y
   scripts/examples.test.js las compara contra LabMath.coulomb (lab coulomb-check).
   ===================================================================== */
(function () {
  var k = 8.99e9, G = 6.67e-11, e = 1.60e-19, mp = 1.67e-27, me = 9.11e-31;
  var DEG = 180 / Math.PI;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function sg(v) { return (v > 0 ? '+' : '') + String(v).replace('-', '−'); }
  function norm360(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  // Notación científica para LaTeX: 2.27 \times 10^{39}.
  function sci(v, d) {
    var ex = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, ex);
    if (Math.abs(+m.toFixed(d == null ? 2 : d)) >= 10) { m /= 10; ex += 1; }
    return m.toFixed(d == null ? 2 : d) + ' \\times 10^{' + ex + '}';
  }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  function frac(n, d) { var g = gcd(n, d); n /= g; d /= g; return d === 1 ? String(n) : '\\tfrac{' + n + '}{' + d + '}'; }
  // Fuerza (N) entre cargas en μC a r cm.
  function Fmag(q1, q2, rcm) { return k * Math.abs(q1 * q2) * 1e-12 / (rcm * rcm / 1e4); }

  // Ejemplo 1: dos cargas
  var e1 = { q1: 4, q2: -6, r: 3 };
  e1.F = Fmag(e1.q1, e1.q2, e1.r);
  // Ejemplo 2: tres cargas en línea; fuerza neta sobre la de en medio (positivo hacia +x)
  var e2 = { q1: 2, q2: -3, q3: 5, x2: 4, x3: 10 };
  e2.F1 = k * e2.q1 * e2.q2 * 1e-12 / Math.pow(e2.x2 / 100, 2);                  // q1 está a la izquierda
  e2.F3 = -k * e2.q3 * e2.q2 * 1e-12 / Math.pow((e2.x3 - e2.x2) / 100, 2);      // q3 está a la derecha
  e2.F = e2.F1 + e2.F3;
  // Ejemplo 3: triángulo rectángulo; fuerza neta sobre q1 en el origen
  var e3 = { q1: 3, q2: -4, q3: 2, a: 5, b: 4 };
  e3.Fx = -k * e3.q1 * e3.q2 * 1e-12 / Math.pow(e3.a / 100, 2);
  e3.Fy = -k * e3.q1 * e3.q3 * 1e-12 / Math.pow(e3.b / 100, 2);
  e3.mag = Math.sqrt(e3.Fx * e3.Fx + e3.Fy * e3.Fy);
  e3.raw = Math.atan(e3.Fy / e3.Fx) * DEG;
  e3.ang = norm360(e3.raw);
  // Ejemplo 4: punto de equilibrio entre dos cargas positivas
  var e4 = { q1: 4, q2: 9, d: 10 };
  e4.x = e4.d / (1 + Math.sqrt(e4.q2 / e4.q1));
  // Ejemplo 5: protón y electrón en el átomo de hidrógeno
  var e5 = { r: 5.3e-11 };
  e5.Fe = k * e * e / (e5.r * e5.r);
  e5.Fg = G * mp * me / (e5.r * e5.r);
  e5.ratio = e5.Fe / e5.Fg;

  // Ejercicio del plano: q1 en el origen, q2 en (a, 0) y q3 en (0, b), en cm.
  function plane(v) {
    var Fx = -k * v.q1 * v.q2 * 1e-12 / Math.pow(v.a / 100, 2), Fy = -k * v.q1 * v.q3 * 1e-12 / Math.pow(v.b / 100, 2);
    return { Fx: Fx, Fy: Fy, mag: Math.hypot(Fx, Fy), ang: norm360(Math.atan2(Fy, Fx) * DEG) };
  }
  function planeSI(v) { return [[{ q: v.q1 * 1e-6, x: 0, y: 0 }, { q: v.q2 * 1e-6, x: v.a / 100, y: 0 }, { q: v.q3 * 1e-6, x: 0, y: v.b / 100 }], 0]; }
  function planePrompt(v) {
    return 'Tres cargas: $q_1 = ' + sg(v.q1) + '\\ \\mu\\text{C}$ en el origen, $q_2 = ' + sg(v.q2) + '\\ \\mu\\text{C}$ en $(' + v.a + ',\\ 0)$ cm y $q_3 = ' + sg(v.q3) + '\\ \\mu\\text{C}$ en $(0,\\ ' + v.b + ')$ cm. Usa $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$.';
  }
  // Ejercicio en línea: q1 en x = 0, q2 en x = d1, q3 en x = d1 + d2 (cm); neta sobre q2.
  function line(v) {
    var F1 = k * v.q1 * v.q2 * 1e-12 / Math.pow(v.d1 / 100, 2), F3 = -k * v.q3 * v.q2 * 1e-12 / Math.pow(v.d2 / 100, 2);
    return { F1: F1, F3: F3, F: F1 + F3 };
  }
  // Equilibrio por bisección (no usa la fórmula cerrada): fuerza neta sobre una carga de prueba.
  function eqBisect(v) {
    var f = function (x) { return v.q1 / (x * x) - v.q2 / ((v.d - x) * (v.d - x)); };
    var lo = v.d * 1e-9, hi = v.d * (1 - 1e-9);
    for (var i = 0; i < 200; i++) { var m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; }
    return (lo + hi) / 2;
  }
  var PAIRS = [['un protón y un electrón', e, -e, mp, me], ['dos protones', e, e, mp, mp], ['dos electrones', -e, -e, me, me]];

  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (key) { return ex.mistakes[key](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 1)) return false;
      }
      return true;
    };
  }

  var data = window.SESSION_DATA = {
    slug: 'sesion-02', number: '02', group: 'A · Electrostática',
    title: 'Ley de Coulomb y superposición de fuerzas', temario: [],
    minutes: 180,
    quote: 'Dos cargas se empujan o se jalan con una fuerza que baja con el cuadrado de la distancia; con varias cargas, cada una empuja por su lado y las fuerzas se suman como vectores.',
    badges: [
      'Calcular la fuerza entre dos cargas con $F = k|q_1q_2|/r^2$.',
      'Decidir la dirección de la fuerza con los signos: repulsión o atracción.',
      'Sumar varias fuerzas eléctricas por componentes, en línea y en el plano.',
      'Encontrar el punto donde la fuerza neta sobre una carga es cero.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Dos cargas se ejercen una fuerza que depende del <strong>producto de las cargas</strong> y del <strong>inverso del cuadrado de la distancia</strong>. Con más de dos cargas, cada par actúa como si las demás no existieran y al final se suman las fuerzas como vectores.',
        recall: [
          'Carga eléctrica: positiva y negativa; iguales se repelen y opuestas se atraen (S01).',
          'Prefijos: $1\\ \\mu\\text{C} = 10^{-6}\\ \\text{C}$, $1\\ \\text{nC} = 10^{-9}\\ \\text{C}$ y $1\\ \\text{cm} = 10^{-2}\\ \\text{m}$.',
          'Sumar vectores por componentes y dar su ángulo revisando el cuadrante (<a href="../../../fisica-1/sesiones/sesion-02/">Física 1 · S02</a>).'
        ],
        why: 'La fuerza de Coulomb mantiene unidos a los átomos, hace que el polvo se pegue a una pantalla y que el tóner de una impresora láser se quede donde debe. Todo lo que sigue en el curso (campo, potencial, capacitores) sale de esta ley.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Frota un globo en tu cabello y acércalo a la pared: se queda pegado. Acércalo a otro globo frotado igual y se alejan. No hay nada que los toque; la fuerza actúa a distancia, como la gravedad, pero puede jalar <strong>o</strong> empujar.',
          'Si alejas el globo, la fuerza se debilita muy rápido: al doble de distancia es la cuarta parte. Es la misma idea que la luz de un foco, que se reparte sobre una esfera cada vez más grande ($4\\pi r^2$).',
          'Cuando hay varias cargas, cada una empuja o jala por su lado, como varias personas tirando de cuerdas atadas a una caja. Lo que importa al final es la suma de todas esas flechas, igual que sumaste fuerzas en Física 1.'
        ]
      },
      {
        type: 'concept', heading: 'La ley de Coulomb', short: 'Ley de Coulomb',
        body: [
          'La magnitud de la fuerza entre dos cargas puntuales $q_1$ y $q_2$ separadas una distancia $r$ es $$F = k\\,\\frac{|q_1q_2|}{r^2} \\qquad k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$$',
          'La <strong>dirección</strong> la deciden los signos: si son iguales, se repelen (cada fuerza se aleja de la otra carga); si son opuestos, se atraen (cada fuerza apunta hacia la otra).',
          'Las dos fuerzas de un par tienen la misma magnitud y sentidos opuestos (tercera ley de Newton), aunque una carga sea mucho más grande que la otra.',
          'A veces verás $k = \\frac{1}{4\\pi\\varepsilon_0}$ con $\\varepsilon_0 = 8.85 \\times 10^{-12}\\ \\text{C}^2/(\\text{N·m}^2)$: es el mismo número escrito de otra forma.'
        ],
        diagram: 'f2s02-pair',
        caption: 'Arriba, cargas iguales: se repelen. Abajo, opuestas: se atraen. $F_{12}$ es la fuerza de $q_1$ sobre $q_2$; $F_{21}$, la de $q_2$ sobre $q_1$. Miden lo mismo.'
      },
      {
        type: 'callout', heading: 'Convierte antes de sustituir',
        body: [
          'La fórmula solo funciona en SI: cargas en coulombs y distancias en metros. Un $3\\ \\text{cm}$ que se queda como $3$ hace que la fuerza salga $10^4$ veces más chica, porque la distancia va al cuadrado.',
          'Escribe primero $q = 3 \\times 10^{-6}\\ \\text{C}$ y $r = 0.03\\ \\text{m}$, y hasta entonces sustituye.'
        ]
      },
      {
        type: 'concept', heading: 'La forma vectorial', short: 'Forma vectorial',
        body: [
          'Para varias cargas conviene escribir la fuerza como vector. La fuerza que $q_1$ ejerce sobre $q_2$ es $$\\vec{F}_{12} = k\\,\\frac{q_1q_2}{r^2}\\,\\hat{r}_{12}$$ donde $\\hat{r}_{12}$ es el vector unitario que va <strong>de $q_1$ hacia $q_2$</strong> y aquí las cargas van <strong>con su signo</strong>.',
          'Si $q_1q_2 > 0$, la fuerza va en el sentido de $\\hat{r}_{12}$: aleja a $q_2$ de $q_1$ (repulsión). Si $q_1q_2 < 0$, va en sentido contrario: la acerca (atracción). El signo del producto hace el trabajo de decidir la dirección.',
          'En la práctica casi siempre es más seguro calcular la magnitud con $|q_1q_2|$ y poner la dirección mirando el dibujo: ¿la empuja o la jala?'
        ]
      },
      {
        type: 'concept', heading: '¿Por qué la eléctrica domina?', short: 'Eléctrica contra gravedad',
        body: [
          'La gravedad entre dos masas también va como $1/r^2$: $F_g = G\\,m_1m_2/r^2$ con $G = 6.67 \\times 10^{-11}\\ \\text{N·m}^2/\\text{kg}^2$. Como las dos bajan igual con la distancia, su cociente <strong>no depende de $r$</strong>.',
          'Entre un protón y un electrón, la fuerza eléctrica es unas $2.27 \\times 10^{39}$ veces mayor que la gravitacional. Por eso en átomos y moléculas la gravedad ni se toma en cuenta.',
          'Si es tan fuerte, ¿por qué no la sentimos todo el tiempo? Porque la materia es casi neutra: las cargas positivas y negativas se cancelan. La gravedad, que solo atrae, se acumula con la masa y gana a escala de planetas.'
        ],
        diagram: 'f2s02-gravity',
        caption: 'Las dos flechas son la atracción eléctrica del par. La gravitacional, dibujada a la misma escala, mediría $10^{-39}$ veces menos.'
      },
      {
        type: 'explainer', heading: 'Superposición: cada carga por su lado', short: 'Superposición',
        title: 'Fuerza neta sobre q₁',
        intro: 'El <strong>principio de superposición</strong> dice que la fuerza de cada carga no cambia porque haya otras cerca. Se calcula una por una y se suman como vectores.',
        diagram: 'f2s02-superpos',
        steps: [
          { text: 'Ubica las cargas y la que te interesa: $q_1 = +3\\ \\mu\\text{C}$ en el origen, $q_2 = -4\\ \\mu\\text{C}$ a $5$ cm en $x$ y $q_3 = +2\\ \\mu\\text{C}$ a $4$ cm en $y$.', state: { step: 0 } },
          { text: '$q_2$ es negativa y $q_1$ positiva: se atraen. $F_2 = k\\frac{(3)(4) \\times 10^{-12}}{0.05^2} = ' + fx(e3.Fx) + '$ N hacia $+x$, hacia $q_2$.', state: { step: 1 } },
          { text: '$q_3$ y $q_1$ son positivas: se repelen. $F_3 = k\\frac{(3)(2) \\times 10^{-12}}{0.04^2} = ' + fx(-e3.Fy) + '$ N hacia $-y$, lejos de $q_3$.', state: { step: 2 } },
          { text: 'Escribe las componentes con su signo: $F_x = +' + fx(e3.Fx) + '$ N y $F_y = ' + fx(e3.Fy) + '$ N.', state: { step: 3 } },
          { text: 'Suma: $|\\vec{F}| = \\sqrt{F_x^2 + F_y^2} = ' + fx(e3.mag) + '$ N. El vector está en el 4.º cuadrante: $\\theta = ' + fx(e3.ang, 1) + '^\\circ$.', state: { step: 4 } }
        ]
      },
      {
        type: 'concept', heading: 'Dónde la fuerza neta es cero', short: 'Punto de equilibrio',
        body: [
          'Con dos cargas fijas, ¿dónde podrías poner una tercera para que no sienta fuerza? Ahí las dos fuerzas deben ser iguales en magnitud y opuestas en dirección.',
          '<strong>Mismo signo:</strong> el punto está entre las dos, más cerca de la carga más chica. Con $q_1$ en $x = 0$ y $q_2$ en $x = d$: $$\\frac{|q_1|}{x^2} = \\frac{|q_2|}{(d - x)^2} \\;\\Rightarrow\\; x = \\frac{d}{1 + \\sqrt{|q_2|/|q_1|}}$$',
          '<strong>Signos opuestos:</strong> entre las dos las fuerzas apuntan al mismo lado y no se cancelan. El punto queda afuera, del lado de la carga más chica (lejos de la grande). Si las dos miden lo mismo, no existe.',
          'El valor de la carga de prueba no importa: aparece en las dos fuerzas y se cancela.'
        ],
        diagram: 'f2s02-equilibrium',
        caption: 'La carga de prueba (punto) siente dos fuerzas iguales y opuestas. Arriba, a $4$ cm de la carga chica; abajo, a $10$ cm del lado de la chica.'
      },
      {
        type: 'recipe', heading: 'Receta: fuerza neta sobre una carga', short: 'Receta',
        steps: [
          { text: 'Dibuja las cargas con sus coordenadas y marca sobre cuál calculas la fuerza.' },
          { text: 'Convierte todo a SI: cargas en C y distancias en m.', tip: 'Un $\\mu$C es $10^{-6}$ C y un cm es $0.01$ m. Es el error más común de esta sesión.' },
          { text: 'Para cada otra carga, calcula la magnitud $F = k|q_iq|/r^2$ y dibuja la flecha: lejos si se repelen, hacia ella si se atraen.', tip: 'No pongas el signo de las cargas en la magnitud; el signo de cada componente sale del dibujo.' },
          { text: 'Descompón cada fuerza en $x$ y $y$ con su signo y suma por separado: $F_x = \\sum F_{ix}$, $F_y = \\sum F_{iy}$.' },
          { text: 'Magnitud con Pitágoras y ángulo con el arco tangente, revisando el cuadrante.', tip: 'Si $F_x < 0$, suma $180^\\circ$ a lo que da la calculadora; si sale negativo, suma $360^\\circ$.' }
        ]
      },
      {
        type: 'example', heading: 'Dos cargas a 3 cm',
        problem: '<p>Una carga $q_1 = +' + e1.q1 + '.0\\ \\mu\\text{C}$ y otra $q_2 = ' + sg(e1.q2) + '.0\\ \\mu\\text{C}$ están a $' + e1.r + '.0\\ \\text{cm}$. ¿Cuánto vale la fuerza entre ellas y se atraen o se repelen? Usa $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$.</p>',
        steps: [
          { text: 'Convierte a SI.', math: 'q_1 = 4.0 \\times 10^{-6}\\ \\text{C} \\qquad q_2 = -6.0 \\times 10^{-6}\\ \\text{C} \\qquad r = 0.030\\ \\text{m}' },
          { text: 'Magnitud con valores absolutos.', math: 'F = (8.99 \\times 10^9)\\frac{(4.0 \\times 10^{-6})(6.0 \\times 10^{-6})}{(0.030)^2} = ' + fx(e1.F) + '\\ \\text{N}' },
          { text: 'Signos opuestos: se atraen. Sobre cada carga, la fuerza apunta hacia la otra, y las dos miden lo mismo.' },
          { text: '¿Mucho o poco? Unos $240$ N es el peso de unos $24$ kg. Por eso en el laboratorio se trabaja con nC: los $\\mu$C de cerca dan fuerzas enormes.' }
        ],
        answer: '$F \\approx ' + fx(e1.F) + '\\ \\text{N}$, de atracción.',
        verify: { lab: 'call', mod: 'coulomb', fn: 'force', args: [{ q: 4e-6, x: 0, y: 0 }, { q: -6e-6, x: 0.03, y: 0 }], values: { mag: e1.F, x: -e1.F } }
      },
      {
        type: 'example', heading: 'Tres cargas en línea',
        problem: '<p>Sobre el eje $x$ hay tres cargas: $q_1 = +2\\ \\mu\\text{C}$ en $x = 0$, $q_2 = -3\\ \\mu\\text{C}$ en $x = 4\\ \\text{cm}$ y $q_3 = +5\\ \\mu\\text{C}$ en $x = 10\\ \\text{cm}$. ¿Cuál es la fuerza neta sobre $q_2$? Usa $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$.</p>',
        steps: [
          { text: '$q_1$ (positiva) atrae a $q_2$ (negativa) hacia la izquierda, a $0.04$ m.', math: 'F_1 = (8.99 \\times 10^9)\\frac{(2 \\times 10^{-6})(3 \\times 10^{-6})}{(0.04)^2} = ' + fx(-e2.F1) + '\\ \\text{N} \\quad (-x)' },
          { text: '$q_3$ (positiva) también la atrae, pero hacia la derecha, a $0.06$ m.', math: 'F_3 = (8.99 \\times 10^9)\\frac{(5 \\times 10^{-6})(3 \\times 10^{-6})}{(0.06)^2} = ' + fx(e2.F3) + '\\ \\text{N} \\quad (+x)' },
          { text: 'En línea, sumar vectores es sumar con signo.', math: 'F_x = -' + fx(-e2.F1) + ' + ' + fx(e2.F3) + ' = ' + fx(e2.F) + '\\ \\text{N}' },
          { text: 'Sumar las magnitudes ($' + fx(e2.F3 - e2.F1) + '$ N) sería un error: las fuerzas apuntan a lados contrarios y casi se cancelan.' }
        ],
        answer: '$F_x \\approx +' + fx(e2.F) + '\\ \\text{N}$: hacia $+x$, hacia $q_3$.',
        verify: { lab: 'call', mod: 'coulomb', fn: 'net', args: [[{ q: 2e-6, x: 0, y: 0 }, { q: -3e-6, x: 0.04, y: 0 }, { q: 5e-6, x: 0.10, y: 0 }], 1], values: { x: e2.F, mag: Math.abs(e2.F) } }
      },
      {
        type: 'example', heading: 'Un triángulo de cargas',
        problem: '<p>$q_1 = +3\\ \\mu\\text{C}$ está en el origen, $q_2 = -4\\ \\mu\\text{C}$ en $(5,\\ 0)$ cm y $q_3 = +2\\ \\mu\\text{C}$ en $(0,\\ 4)$ cm. Da la fuerza neta sobre $q_1$: componentes, magnitud y dirección. Usa $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$.</p>',
        steps: [
          { text: 'Fuerza de $q_2$: se atraen, así que jala a $q_1$ hacia $+x$.', math: 'F_2 = (8.99 \\times 10^9)\\frac{(3 \\times 10^{-6})(4 \\times 10^{-6})}{(0.05)^2} = ' + fx(e3.Fx) + '\\ \\text{N}' },
          { text: 'Fuerza de $q_3$: se repelen, así que empuja a $q_1$ hacia $-y$.', math: 'F_3 = (8.99 \\times 10^9)\\frac{(3 \\times 10^{-6})(2 \\times 10^{-6})}{(0.04)^2} = ' + fx(-e3.Fy) + '\\ \\text{N}' },
          { text: 'Componentes de la neta.', math: 'F_x = +' + fx(e3.Fx) + '\\ \\text{N} \\qquad F_y = ' + fx(e3.Fy) + '\\ \\text{N}' },
          { text: 'Magnitud y ángulo. La calculadora da un ángulo negativo; el vector está en el 4.º cuadrante, así que suma $360^\\circ$.', math: '|\\vec{F}| = \\sqrt{' + fx(e3.Fx) + '^2 + ' + fx(e3.Fy) + '^2} = ' + fx(e3.mag) + '\\ \\text{N} \\qquad \\theta = ' + fx(e3.raw, 1) + '^\\circ + 360^\\circ = ' + fx(e3.ang, 1) + '^\\circ' }
        ],
        answer: '$\\vec{F} = (' + fx(e3.Fx) + ',\\ ' + fx(e3.Fy) + ')\\ \\text{N}$, con $|\\vec{F}| \\approx ' + fx(e3.mag) + '\\ \\text{N}$ a $' + fx(e3.ang, 1) + '^\\circ$. Es la configuración que trae el lab al abrir.',
        verify: { lab: 'call', mod: 'coulomb', fn: 'net', args: [[{ q: 3e-6, x: 0, y: 0 }, { q: -4e-6, x: 0.05, y: 0 }, { q: 2e-6, x: 0, y: 0.04 }], 0], values: { x: e3.Fx, y: e3.Fy, mag: e3.mag, ang: e3.ang } }
      },
      {
        type: 'example', heading: '¿Dónde no siente fuerza?',
        problem: '<p>Dos cargas positivas, $q_1 = +4\\ \\mu\\text{C}$ en $x = 0$ y $q_2 = +9\\ \\mu\\text{C}$ en $x = 10\\ \\text{cm}$, están fijas. ¿En qué punto del eje una tercera carga no sentiría fuerza neta?</p>',
        steps: [
          { text: 'Mismo signo: el punto está entre las dos, donde las repulsiones apuntan a lados contrarios.' },
          { text: 'Iguala las magnitudes; $k$ y la carga de prueba se cancelan.', math: '\\frac{4}{x^2} = \\frac{9}{(10 - x)^2}' },
          { text: 'Saca raíz (todo es positivo entre las cargas).', math: '\\frac{2}{x} = \\frac{3}{10 - x} \\;\\Rightarrow\\; 20 - 2x = 3x \\;\\Rightarrow\\; x = ' + fx(e4.x) + '\\ \\text{cm}' },
          { text: 'Queda más cerca de $q_1$, la carga más chica, como debe ser. Aquí no hace falta pasar a metros: la razón no cambia de unidades.' }
        ],
        answer: 'A $x = ' + fx(e4.x) + '\\ \\text{cm}$ de $q_1$, entre las dos cargas.',
        verify: { lab: 'call', mod: 'coulomb', fn: 'equilibrium', args: [4e-6, 9e-6, 0.10], value: e4.x / 100 }
      },
      {
        type: 'example', heading: 'Protón contra electrón',
        problem: '<p>En el átomo de hidrógeno, el electrón está a unos $5.3 \\times 10^{-11}\\ \\text{m}$ del protón. Compara la fuerza eléctrica con la gravitacional. Usa $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$, $e = 1.60 \\times 10^{-19}\\ \\text{C}$, $G = 6.67 \\times 10^{-11}\\ \\text{N·m}^2/\\text{kg}^2$, $m_p = 1.67 \\times 10^{-27}$ kg y $m_e = 9.11 \\times 10^{-31}$ kg.</p>',
        steps: [
          { text: 'Fuerza eléctrica: las dos cargas miden $e$.', math: 'F_e = \\frac{(8.99 \\times 10^9)(1.60 \\times 10^{-19})^2}{(5.3 \\times 10^{-11})^2} = ' + sci(e5.Fe) + '\\ \\text{N}' },
          { text: 'Fuerza gravitacional.', math: 'F_g = \\frac{(6.67 \\times 10^{-11})(1.67 \\times 10^{-27})(9.11 \\times 10^{-31})}{(5.3 \\times 10^{-11})^2} = ' + sci(e5.Fg) + '\\ \\text{N}' },
          { text: 'El cociente; la distancia se cancela porque las dos van como $1/r^2$.', math: '\\frac{F_e}{F_g} = \\frac{ke^2}{G\\,m_p m_e} = ' + sci(e5.ratio) }
        ],
        answer: 'La eléctrica es unas $' + sci(e5.ratio) + '$ veces mayor que la gravitacional, a cualquier distancia.',
        verify: { lab: 'call', mod: 'coulomb', fn: 'ratio', args: [e, -e, mp, me, 5.3e-11], value: e5.ratio }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Pongo el signo de las cargas en $F = k|q_1q_2|/r^2$?', a: 'Para la magnitud, no: usa valores absolutos. La dirección la decides con el dibujo (atracción o repulsión) y la escribes en el signo de cada componente.' },
          { q: '¿La carga más grande ejerce más fuerza sobre la chica que la chica sobre la grande?', a: 'No. Por la tercera ley de Newton las dos fuerzas miden lo mismo. La diferencia está en el efecto: si la carga chica tiene poca masa, se acelera más.' },
          { q: '¿Por qué no puedo sumar las magnitudes de las fuerzas?', a: 'Porque apuntan en direcciones distintas. Solo si todas apuntan igual la magnitud neta es la suma; en general hay que sumar componentes.' },
          { q: '¿$r$ es la distancia al origen?', a: 'No: es la distancia <strong>entre las dos cargas</strong> del par que estás calculando. Si están en $(x_1, y_1)$ y $(x_2, y_2)$, $r = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$.' },
          { q: '¿El punto de equilibrio depende de la carga de prueba?', a: 'No: aparece en las dos fuerzas y se cancela. Solo dependen de las dos cargas fijas y de la distancia entre ellas.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          '$F = k|q_1q_2|/r^2$ con $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$, cargas en C y distancias en m.',
          'Iguales se repelen y opuestas se atraen; las dos fuerzas del par miden lo mismo.',
          'Con varias cargas: cada fuerza por separado y luego suma por componentes.',
          'Fuerza neta cero: entre las cargas si son del mismo signo, afuera del lado de la chica si son opuestas.'
        ]
      }
    ],

    lab: {
      type: 'coulomb-check', title: '¿Es tu fuerza?',
      intro: 'Arrastra las cargas sobre la cuadrícula (en cm) o escribe su valor y su posición. Elige la carga objetivo, calcula a mano la fuerza neta sobre ella y compárala con la real. El lab dibuja cada fuerza parcial y detecta si no pasaste de cm a m, si olvidaste el prefijo $\\mu$ o n, si no elevaste $r$ al cuadrado, si un signo quedó invertido o si sumaste magnitudes.',
      cfg: { start: { charges: [{ q: 3, x: 2, y: 2 }, { q: -4, x: 7, y: 2 }, { q: 2, x: 2, y: 6 }, { q: -1, x: 8, y: 7 }], n: 3, unit: 'uC', target: 0, mode: 'xy', example: 'cm' } }
    },

    formulas: [
      { label: 'Ley de Coulomb', tex: 'F = k\\,\\frac{|q_1q_2|}{r^2}' },
      { label: 'Constante', tex: 'k = \\frac{1}{4\\pi\\varepsilon_0} = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2' },
      { label: 'Forma vectorial', tex: '\\vec{F}_{12} = k\\,\\frac{q_1q_2}{r^2}\\,\\hat{r}_{12}' },
      { label: 'Superposición', tex: '\\vec{F} = \\sum_i \\vec{F}_i,\\ \\ F_x = \\sum F_{ix},\\ \\ F_y = \\sum F_{iy}' },
      { label: 'Equilibrio (mismo signo)', tex: 'x = \\frac{d}{1 + \\sqrt{|q_2|/|q_1|}}' },
      { label: 'Gravedad', tex: 'F_g = G\\,\\frac{m_1m_2}{r^2}' },
      { label: 'Prefijos', tex: '1\\ \\mu\\text{C} = 10^{-6}\\ \\text{C},\\ \\ 1\\ \\text{nC} = 10^{-9}\\ \\text{C}' }
    ],

    exercises: [
      {
        id: 'f2-s02-magnitud', title: 'Fuerza entre dos cargas',
        vars: { q1: [1, 9, 1], q2: [-9, 9, 1], r: [2, 12, 1] },
        baseWhere: function (v) { return v.q2 !== 0; },
        prompt: function (v) { return '<p>Una carga de $' + sg(v.q1) + '\\ \\mu\\text{C}$ y otra de $' + sg(v.q2) + '\\ \\mu\\text{C}$ están separadas $' + v.r + '\\ \\text{cm}$. ¿Cuánto vale la magnitud de la fuerza entre ellas? Usa $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$.</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return Fmag(v.q1, v.q2, v.r); },
        mistakes: {
          cm: function (v) { return k * Math.abs(v.q1 * v.q2) * 1e-12 / (v.r * v.r); },
          noSquare: function (v) { return k * Math.abs(v.q1 * v.q2) * 1e-12 / (v.r / 100); },
          prefix: function (v) { return k * Math.abs(v.q1 * v.q2) / Math.pow(v.r / 100, 2); }
        },
        feedback: [
          { when: 'cm', say: 'Dejaste la distancia en centímetros. Pásala a metros: $' + '1\\ \\text{cm} = 0.01\\ \\text{m}$.' },
          { when: 'noSquare', say: 'La distancia va al cuadrado: $F = k|q_1q_2|/r^2$.' },
          { when: 'prefix', say: 'Olvidaste el prefijo: $1\\ \\mu\\text{C} = 10^{-6}\\ \\text{C}$.' }
        ],
        oracle: { lab: 'call', mod: 'coulomb', fn: 'force', field: 'mag', args: function (v) { return [{ q: v.q1 * 1e-6, x: 0, y: 0 }, { q: v.q2 * 1e-6, x: v.r / 100, y: 0 }]; } },
        hint: 'Convierte a C y a m, y usa valores absolutos: $F = k|q_1q_2|/r^2$.',
        solution: function (v) { return '$$F = (8.99 \\times 10^9)\\frac{(' + v.q1 + ' \\times 10^{-6})(' + Math.abs(v.q2) + ' \\times 10^{-6})}{(' + fx(v.r / 100) + ')^2} = ' + fx(Fmag(v.q1, v.q2, v.r)) + '\\ \\text{N}$$' + (v.q2 < 0 ? 'Signos opuestos: se atraen.' : 'Mismo signo: se repelen.'); }
      },
      {
        id: 'f2-s02-linea', title: 'Fuerza neta en línea',
        vars: { q1: [-6, 6, 1], q2: [-6, 6, 1], q3: [-6, 6, 1], d1: [2, 8, 1], d2: [2, 8, 1] },
        baseWhere: function (v) { return v.q1 !== 0 && v.q2 !== 0 && v.q3 !== 0 && Math.abs(line(v).F) > 0.5; },
        prompt: function (v) { return '<p>Sobre el eje $x$: $q_1 = ' + sg(v.q1) + '\\ \\mu\\text{C}$ en $x = 0$, $q_2 = ' + sg(v.q2) + '\\ \\mu\\text{C}$ en $x = ' + v.d1 + '\\ \\text{cm}$ y $q_3 = ' + sg(v.q3) + '\\ \\mu\\text{C}$ en $x = ' + (v.d1 + v.d2) + '\\ \\text{cm}$. ¿Cuánto vale la fuerza neta sobre $q_2$? Da $F_x$ con signo (positivo hacia $+x$). Usa $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$.</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return line(v).F; },
        mistakes: {
          addMags: function (v) { var l = line(v); return Math.abs(l.F1) + Math.abs(l.F3); },
          flipped: function (v) { return -line(v).F; },
          cm: function (v) { return line(v).F / 1e4; }
        },
        feedback: [
          { when: 'addMags', say: 'Sumaste las magnitudes. Las fuerzas pueden apuntar a lados contrarios: súmalas con su signo.' },
          { when: 'flipped', say: 'La magnitud está bien, pero la dirección no. Revisa qué carga atrae y cuál repele a $q_2$.' },
          { when: 'cm', say: 'Dejaste las distancias en centímetros: pásalas a metros antes de elevarlas al cuadrado.' }
        ],
        oracle: { lab: 'call', mod: 'coulomb', fn: 'lineForce', args: function (v) { return [[{ q: v.q1 * 1e-6, x: 0 }, { q: v.q2 * 1e-6, x: v.d1 / 100 }, { q: v.q3 * 1e-6, x: (v.d1 + v.d2) / 100 }], 1]; } },
        hint: 'Calcula la magnitud de cada fuerza y decide si empuja a $q_2$ hacia $+x$ o hacia $-x$. Luego suma con signo.',
        solution: function (v) {
          var l = line(v);
          return '$$F_1 = ' + fx(l.F1) + '\\ \\text{N} \\qquad F_3 = ' + fx(l.F3) + '\\ \\text{N}$$$$F_x = ' + fx(l.F1) + ' + (' + fx(l.F3) + ') = ' + fx(l.F) + '\\ \\text{N}$$' +
            'El signo de cada término: $q_1$ está a la izquierda, así que si repele empuja hacia $+x$; $q_3$ está a la derecha, así que si repele empuja hacia $-x$.';
        }
      },
      {
        id: 'f2-s02-plano', title: 'Fuerza neta en el plano',
        vars: { q1: [1, 6, 1], q2: [-6, 6, 1], q3: [-6, 6, 1], a: [2, 8, 1], b: [2, 8, 1] },
        baseWhere: function (v) { return v.q2 !== 0 && v.q3 !== 0; },
        prompt: function (v) { return '<p>' + planePrompt(v) + ' ¿Cuánto mide la fuerza neta sobre $q_1$?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return plane(v).mag; },
        mistakes: {
          addMags: function (v) { var p = plane(v); return Math.abs(p.Fx) + Math.abs(p.Fy); },
          cm: function (v) { return plane(v).mag / 1e4; }
        },
        feedback: [
          { when: 'addMags', say: 'Sumaste las magnitudes. Las dos fuerzas son perpendiculares: usa $\\sqrt{F_x^2 + F_y^2}$.' },
          { when: 'cm', say: 'Dejaste las distancias en centímetros: pásalas a metros.' }
        ],
        oracle: { lab: 'call', mod: 'coulomb', fn: 'net', field: 'mag', args: planeSI },
        hint: 'La fuerza de $q_2$ va sobre el eje $x$ y la de $q_3$ sobre el eje $y$. Calcula cada una y usa Pitágoras.',
        solution: function (v) { var p = plane(v); return '$$F_x = ' + fx(p.Fx) + '\\ \\text{N} \\qquad F_y = ' + fx(p.Fy) + '\\ \\text{N}$$$$|\\vec{F}| = \\sqrt{F_x^2 + F_y^2} = ' + fx(p.mag) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f2-s02-angulo', title: 'Dirección de la fuerza neta',
        vars: { q1: [1, 6, 1], q2: [-6, 6, 1], q3: [-6, 6, 1], a: [2, 8, 1], b: [2, 8, 1] },
        baseWhere: function (v) { return v.q2 !== 0 && v.q3 !== 0; },
        prompt: function (v) { return '<p>' + planePrompt(v) + ' ¿Qué ángulo forma la fuerza neta sobre $q_1$ con el eje $+x$? Da un ángulo entre $0^\\circ$ y $360^\\circ$, antihorario.</p>'; },
        check: 'numeric', unit: '°', tol: { abs: 0.5 },
        answer: function (v) { return plane(v).ang; },
        mistakes: { rawArctan: function (v) { var p = plane(v); return Math.atan(p.Fy / p.Fx) * DEG; } },
        feedback: [{ when: 'rawArctan', say: 'Ese es el ángulo de la calculadora. Mira los signos de $F_x$ y $F_y$: si $F_x < 0$, suma $180^\\circ$; si te queda negativo, suma $360^\\circ$.' }],
        oracle: { lab: 'call', mod: 'coulomb', fn: 'net', field: 'ang', args: planeSI },
        hint: 'Primero $F_x$ y $F_y$ con su signo; luego dibuja el vector para saber en qué cuadrante está.',
        solution: function (v) {
          var p = plane(v), raw = Math.atan(p.Fy / p.Fx) * DEG;
          return '$$F_x = ' + fx(p.Fx) + '\\ \\text{N} \\qquad F_y = ' + fx(p.Fy) + '\\ \\text{N}$$$$\\arctan\\frac{F_y}{F_x} = ' + fx(raw, 2) + '^\\circ \\;\\Rightarrow\\; \\theta = ' + fx(p.ang, 2) + '^\\circ$$';
        }
      },
      {
        id: 'f2-s02-equilibrio', title: 'Punto donde la fuerza neta es cero',
        vars: { q1: [1, 9, 1], q2: [1, 9, 1], d: [6, 20, 2] },
        baseWhere: function (v) { return v.q1 !== v.q2; },
        prompt: function (v) { return '<p>Dos cargas positivas están fijas: $q_1 = +' + v.q1 + '\\ \\mu\\text{C}$ en $x = 0$ y $q_2 = +' + v.q2 + '\\ \\mu\\text{C}$ en $x = ' + v.d + '\\ \\text{cm}$. ¿A qué distancia de $q_1$ (en cm) una tercera carga no siente fuerza neta?</p>'; },
        check: 'numeric', unit: 'cm',
        answer: function (v) { return v.d / (1 + Math.sqrt(v.q2 / v.q1)); },
        mistakes: {
          noSqrt: function (v) { return v.d / (1 + v.q2 / v.q1); },
          fromOther: function (v) { return v.d - v.d / (1 + Math.sqrt(v.q2 / v.q1)); }
        },
        feedback: [
          { when: 'noSqrt', say: 'Te faltó la raíz: las distancias van al cuadrado, así que $x/(d - x) = \\sqrt{q_1/q_2}$.' },
          { when: 'fromOther', say: 'Esa es la distancia a $q_2$. El punto queda más cerca de la carga más chica.' }
        ],
        oracle: { lab: 'value', value: eqBisect },
        hint: 'Iguala $k q_1/x^2 = k q_2/(d - x)^2$ y saca raíz a ambos lados.',
        solution: function (v) {
          var x = v.d / (1 + Math.sqrt(v.q2 / v.q1));
          return '$$\\frac{' + v.q1 + '}{x^2} = \\frac{' + v.q2 + '}{(' + v.d + ' - x)^2} \\;\\Rightarrow\\; \\frac{' + v.d + ' - x}{x} = \\sqrt{\\frac{' + v.q2 + '}{' + v.q1 + '}} \\;\\Rightarrow\\; x = \\frac{' + v.d + '}{1 + \\sqrt{' + v.q2 + '/' + v.q1 + '}} = ' + fx(x) + '\\ \\text{cm}$$';
        }
      },
      {
        id: 'f2-s02-gravedad', title: 'Eléctrica contra gravitacional',
        vars: { p: [0, 2, 1], r: [1, 9, 1] },
        prompt: function (v) {
          var P = PAIRS[v.p];
          return '<p>Para ' + P[0] + ' separados $' + v.r + ' \\times 10^{-10}\\ \\text{m}$, ¿cuántas veces es mayor la fuerza eléctrica que la gravitacional? Usa $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$, $e = 1.60 \\times 10^{-19}\\ \\text{C}$, $G = 6.67 \\times 10^{-11}\\ \\text{N·m}^2/\\text{kg}^2$, $m_p = 1.67 \\times 10^{-27}\\ \\text{kg}$ y $m_e = 9.11 \\times 10^{-31}\\ \\text{kg}$.</p>';
        },
        check: 'numeric',
        answer: function (v) { var P = PAIRS[v.p]; return k * e * e / (G * P[3] * P[4]); },
        mistakes: { inverted: function (v) { var P = PAIRS[v.p]; return G * P[3] * P[4] / (k * e * e); } },
        feedback: [{ when: 'inverted', say: 'Ese es $F_g/F_e$, al revés. Se pide cuántas veces cabe la gravitacional en la eléctrica: $F_e/F_g$.' }],
        oracle: { lab: 'call', mod: 'coulomb', fn: 'ratio', args: function (v) { var P = PAIRS[v.p]; return [P[1], P[2], P[3], P[4], v.r * 1e-10]; } },
        hint: 'Escribe $F_e/F_g$: la distancia $r^2$ aparece en las dos y se cancela.',
        solution: function (v) {
          var P = PAIRS[v.p], ans = k * e * e / (G * P[3] * P[4]);
          return '$$\\frac{F_e}{F_g} = \\frac{k e^2}{G\\,m_1 m_2} = \\frac{(8.99 \\times 10^9)(1.60 \\times 10^{-19})^2}{(6.67 \\times 10^{-11})(' + sci(P[3]) + ')(' + sci(P[4]) + ')} = ' + sci(ans) + '$$La distancia no importa: las dos fuerzas van como $1/r^2$.';
        }
      },
      {
        id: 'f2-s02-escala', title: 'Concepto: cambiar distancia y carga',
        vars: { a: [2, 3, 1], b: [2, 4, 1] },
        where: function (v) { return v.b !== v.a * v.a; },
        prompt: function (v) { return '<p>Dos cargas se atraen con una fuerza $F$. Si la distancia entre ellas se multiplica por ' + v.a + ' y una de las cargas se multiplica por ' + v.b + ', ¿cuánto vale la nueva fuerza?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: '$' + frac(v.b, v.a * v.a) + '\\,F$', correct: true },
            { text: '$' + frac(v.b, v.a) + '\\,F$', say: 'La distancia va al cuadrado: multiplicarla por ' + v.a + ' divide la fuerza entre ' + (v.a * v.a) + ', no entre ' + v.a + '.' },
            { text: '$' + (v.b * v.a * v.a) + '\\,F$', say: 'Más distancia da <strong>menos</strong> fuerza: $r^2$ va en el denominador.' },
            { text: '$' + frac(v.a * v.a, v.b) + '\\,F$', say: 'Lo invertiste: la carga multiplica la fuerza y $r^2$ la divide.' }
          ];
        },
        answer: function (v) { return '$' + frac(v.b, v.a * v.a) + '\\,F$'; },
        hint: 'En $F = k|q_1q_2|/r^2$, ¿qué pasa con el numerador y con el denominador?',
        solution: function (v) { return 'El numerador crece ' + v.b + ' veces y el denominador $(' + v.a + 'r)^2 = ' + (v.a * v.a) + 'r^2$, así que la fuerza queda multiplicada por $' + frac(v.b, v.a * v.a) + '$.'; }
      }
    ],

    quiz: { tags: ['f2.S02'], count: 8 },

    errors: [
      'Dejar las distancias en centímetros: la fuerza sale $10^4$ veces más chica.',
      'Olvidar el prefijo: $\\mu$C es $10^{-6}$ C y nC es $10^{-9}$ C.',
      'No elevar $r$ al cuadrado, o usar como $r$ la distancia al origen en lugar de la distancia entre las dos cargas.',
      'Meter los signos de las cargas en la magnitud y luego volver a poner la dirección: el signo queda doble.',
      'Sumar magnitudes de fuerzas que apuntan en direcciones distintas.',
      'Dar el ángulo de la calculadora sin revisar el cuadrante.'
    ],

    teacher: {
      plan: [
        'Arranca con los globos o una regla frotada: atracción y repulsión antes de la fórmula.',
        'Ley de Coulomb, conversión de unidades y comparación con la gravedad (ejemplo 5).',
        'Explainer de superposición y ejemplos 2 y 3 en el pizarrón, con tabla de componentes.',
        'Punto de equilibrio (ejemplo 4) y el lab con el error de cm que ya trae cargado.'
      ],
      check: [
        'Que conviertan a SI antes de sustituir.',
        'Que dibujen cada fuerza parcial con su dirección antes de calcular componentes.',
        'Que distingan $r$ (entre las cargas) de las coordenadas.'
      ],
      note: 'En esta sesión las cargas son puntuales y están fijas. El campo eléctrico, que es la fuerza por unidad de carga, llega en S03.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §5.3 “Coulomb\'s Law”. <a href="https://openstax.org/books/university-physics-volume-2/pages/5-3-coulombs-law">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-01',
    next: 'sesion-03'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
