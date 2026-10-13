/* =====================================================================
   Física 3 · S02 · Fuerza sobre una carga en movimiento: F = qv×B (bloque A · Fuerza magnética).
   Fuente: OpenStax, University Physics Volume 2, §11.2 (CC BY-NC-SA 4.0).
   e = 1.60 × 10⁻¹⁹ C, mₚ = 1.67 × 10⁻²⁷ kg, mₑ = 9.11 × 10⁻³¹ kg.
   Unidades de trabajo del lab: q en μC, v en km/s, B en T → F en mN.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.lorentz (lab lorentz-force).
   ===================================================================== */
(function () {
  var RAD = Math.PI / 180;
  var E = 1.60e-19, MP = 1.67e-27, ME = 9.11e-31;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  // Número en LaTeX: notación científica con 3 cifras si es muy grande o muy chico.
  function sci(v, d) {
    d = d == null ? 2 : d;
    if (v === 0) return '0';
    var p = Math.floor(Math.log10(Math.abs(v)));
    if (p >= -2 && p <= 3) return fx(v, d + 1);
    var m = v / Math.pow(10, p);
    if (Math.abs(+m.toFixed(d)) >= 10) { m /= 10; p += 1; }
    return m.toFixed(d) + ' \\times 10^{' + p + '}';
  }
  function sg(x) { return x < 0 ? '(' + fx(x, 2) + ')' : fx(x, 2); }
  // La respuesta y cada error típico deben diferir al menos 3 % entre sí («casi» sin ambigüedad).
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        var big = Math.max(Math.abs(vals[i]), Math.abs(vals[j]));
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * (big >= 0.05 ? Math.max(big, 0.5) : big)) return false;
      }
      return true;
    };
  }

  // Ejemplo 1: protón a 5.0 × 10⁶ m/s, 30° con B = 0.20 T. Unidades: q en 10⁻¹⁹ C, v en 10⁶ m/s → F en 10⁻¹³ N.
  var e1 = { q: 1.60, v: 5.0, B: 0.20, th: 30 };
  e1.F = e1.q * e1.v * e1.B * Math.sin(e1.th * RAD);            // × 10⁻¹³ N
  e1.FN = e1.F * 1e-13; e1.a = e1.FN / MP;
  // Ejemplo 2: q = −3 μC, v = (2, 1, 0) km/s, B = (0, 0, 0.5) T → F en mN.
  var e2 = { q: -3, v: [2, 1, 0], B: [0, 0, 0.5] };
  e2.c = [e2.v[1] * e2.B[2] - e2.v[2] * e2.B[1], e2.v[2] * e2.B[0] - e2.v[0] * e2.B[2], e2.v[0] * e2.B[1] - e2.v[1] * e2.B[0]];
  e2.F = e2.c.map(function (x) { return e2.q * x; });
  e2.mag = Math.hypot(e2.F[0], e2.F[1], e2.F[2]);
  // Ejemplo 3: protón con v = (2.0 × 10⁵, 0, 0) m/s, B = (0, 0, 0.10) T y E = (0, 1.5 × 10⁴, 0) N/C.
  // Unidades: q en e (1), campos en 10⁴ N/C (v·B en 10⁴ también) → F en e·10⁴ N/C = 1.60 × 10⁻¹⁵ N.
  var e3 = { E: [0, 1.5, 0], v: [20, 0, 0], B: [0, 0, 0.10] };     // v en 10⁴ m/s para que v·B salga en 10⁴ N/C
  e3.vB = [e3.v[1] * e3.B[2] - e3.v[2] * e3.B[1], e3.v[2] * e3.B[0] - e3.v[0] * e3.B[2], e3.v[0] * e3.B[1] - e3.v[1] * e3.B[0]];
  e3.sum = [e3.E[0] + e3.vB[0], e3.E[1] + e3.vB[1], e3.E[2] + e3.vB[2]];
  e3.Fy = e3.sum[1] * 1e4 * E;
  // Ejemplo 4: qué B hace falta: F = 6.0 mN sobre q = 4.0 μC a 3.0 km/s, θ = 90°.
  var e4 = { F: 6.0, q: 4.0, v: 3.0, th: 90 }; e4.B = e4.F / (e4.q * e4.v * Math.sin(e4.th * RAD));

  var DIRS = [
    { out: false, pos: true, v: 'hacia la derecha', F: 'Hacia arriba de la hoja', why: 'Con $\\vec v = +\\hat\\imath$ y $\\vec B = -\\hat k$: $\\hat\\imath \\times (-\\hat k) = +\\hat\\jmath$. La carga es positiva, así que $\\vec F$ va hacia arriba.' },
    { out: true, pos: true, v: 'hacia la derecha', F: 'Hacia abajo de la hoja', why: 'Con $\\vec v = +\\hat\\imath$ y $\\vec B = +\\hat k$: $\\hat\\imath \\times \\hat k = -\\hat\\jmath$. La carga es positiva: $\\vec F$ va hacia abajo.' },
    { out: false, pos: false, v: 'hacia la derecha', F: 'Hacia abajo de la hoja', why: '$\\vec v \\times \\vec B = \\hat\\imath \\times (-\\hat k) = +\\hat\\jmath$, pero la carga es negativa: $\\vec F$ va al revés, hacia abajo.' },
    { out: true, pos: false, v: 'hacia la derecha', F: 'Hacia arriba de la hoja', why: '$\\vec v \\times \\vec B = \\hat\\imath \\times \\hat k = -\\hat\\jmath$, y la carga negativa lo invierte: $\\vec F$ va hacia arriba.' }
  ];

  var data = window.SESSION_DATA = {
    slug: 'sesion-02', number: '02', group: 'A · Fuerza magnética',
    title: 'Fuerza sobre una carga en movimiento: F = qv×B', temario: [],
    minutes: 120,
    quote: 'El campo magnético solo empuja a las cargas que se mueven, y siempre de lado: $\\vec F = q\\vec v \\times \\vec B$ es perpendicular a la velocidad y al campo.',
    badges: [
      'Calcular la magnitud $|q|vB\\sin\\theta$ de la fuerza magnética sobre una carga.',
      'Encontrar la dirección de $\\vec F$ con la regla de la mano derecha y con el producto cruz por componentes.',
      'Explicar por qué la fuerza magnética no cambia la rapidez de una partícula.',
      'Sumar la parte eléctrica y la magnética: la fuerza de Lorentz $\\vec F = q(\\vec E + \\vec v \\times \\vec B)$.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Un campo eléctrico empuja a una carga esté quieta o no. El campo magnético es más exigente: <strong>solo actúa sobre cargas que se mueven</strong>, y las empuja de lado.',
        recall: [
          'El producto cruz $\\vec a \\times \\vec b$, su magnitud $ab\\sin\\theta$ y la regla de la mano derecha (<a href="../../../fisica-1/sesiones/sesion-03/">Física 1 · S03</a>).',
          'La fuerza eléctrica $\\vec F = q\\vec E$ y el signo de la carga (<a href="../../../fisica-2/sesiones/sesion-03/">Física 2 · S03</a>).',
          'Qué es $\\vec B$ y cómo lo señala una brújula (<a href="../sesion-01/">S01</a>).'
        ],
        why: 'Con esta fuerza funcionan las pantallas de tubo, los espectrómetros de masas, los aceleradores de partículas, las auroras boreales y, sumada sobre muchos electrones, los motores eléctricos.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en un río que corre siempre hacia el este (el campo $\\vec B$) y en una lancha (la carga). Si la lancha está quieta, el río magnético no la empuja. Si navega, recibe un empujón <strong>de lado</strong>, perpendicular a su rumbo y al río. Si navega justo a favor o en contra de la corriente, el empujón desaparece.',
          'Así se comporta la fuerza magnética: depende de qué tan rápido y en qué dirección te mueves respecto al campo. Por eso la vamos a escribir con un producto cruz.'
        ]
      },
      {
        type: 'concept', heading: 'La fuerza magnética', short: 'F = qv × B',
        body: [
          'Una carga $q$ que se mueve con velocidad $\\vec v$ en un campo magnético $\\vec B$ siente la fuerza $$\\vec F = q\\,\\vec v \\times \\vec B$$',
          'Su <strong>magnitud</strong> es $$F = |q|\\,v\\,B\\sin\\theta$$ donde $\\theta$ es el ángulo entre $\\vec v$ y $\\vec B$ (de 0° a 180°). Es máxima, $|q|vB$, cuando $\\vec v \\perp \\vec B$, y es <strong>cero</strong> si la carga se mueve paralela o antiparalela al campo, o si está quieta.',
          'Su <strong>dirección</strong> es perpendicular a $\\vec v$ y a $\\vec B$ a la vez, o sea, perpendicular al plano que forman. El sentido lo da la regla de la mano derecha, y se invierte si la carga es negativa.'
        ],
        diagram: 'f3s02-sin', state: { th: 60 },
        caption: 'La fuerza crece con $\\sin\\theta$: cero si $\\vec v$ va a lo largo de $\\vec B$, máxima si es perpendicular.'
      },
      {
        type: 'concept', heading: 'Qué es un tesla', short: 'El tesla',
        body: [
          'La fórmula de la fuerza es también la <strong>definición operativa</strong> de $B$: mides la fuerza máxima sobre una carga de prueba que se mueve perpendicular al campo y divides: $$B = \\frac{F_{\\text{máx}}}{|q|\\,v}$$',
          'De ahí sale la unidad: $$1\\ \\text{T} = 1\\ \\frac{\\text{N}}{\\text{C}\\cdot\\text{m/s}} = 1\\ \\frac{\\text{N}}{\\text{A}\\cdot\\text{m}}$$ porque un coulomb por segundo es un ampere. Un campo de 1 T empuja con 1 N a una carga de 1 C que se mueve a 1 m/s perpendicular a él.'
        ]
      },
      {
        type: 'explainer', heading: 'La regla de la mano derecha', short: 'Mano derecha',
        title: 'De v y B a la dirección de F',
        intro: 'La dirección de un producto cruz se encuentra siempre igual: los dedos de la mano derecha van de $\\vec v$ hacia $\\vec B$ y el pulgar marca $\\vec v \\times \\vec B$.',
        diagram: 'f3s02-rhr',
        steps: [
          { text: 'La carga se mueve con $\\vec v$ (aquí, sobre el eje $x$).', state: { show: 0, th: 60, sg: 1 } },
          { text: 'El campo $\\vec B$ está en el plano $xy$. Juntos, $\\vec v$ y $\\vec B$ forman un plano: la fuerza será perpendicular a él.', state: { show: 1, th: 60, sg: 1 } },
          { text: 'Pon los dedos de la mano derecha a lo largo de $\\vec v$ y dóblalos hacia $\\vec B$, por el ángulo menor $\\theta$.', state: { show: 2, th: 60, sg: 1 } },
          { text: 'El pulgar apunta en la dirección de $\\vec v \\times \\vec B$: aquí, $+z$. Si la carga es positiva, $\\vec F$ va ahí y mide $|q|vB\\sin\\theta$.', state: { show: 3, th: 60, sg: 1 } },
          { text: 'Si la carga es <strong>negativa</strong> (un electrón), $\\vec F = q\\,\\vec v \\times \\vec B$ apunta al revés: $-z$.', state: { show: 3, th: 60, sg: -1 } },
          { text: 'Si $\\theta$ crece hasta 90°, la fuerza llega a su máximo, $|q|vB$.', state: { show: 3, th: 90, sg: 1 } }
        ]
      },
      {
        type: 'concept', heading: 'Campos que entran y salen de la hoja', short: 'Puntos y cruces',
        body: [
          'En los dibujos planos, $\\vec B$ suele ser perpendicular a la hoja. Se usa una convención de flechas vistas de frente: <strong>puntos</strong> ($\\odot$) si $\\vec B$ sale de la hoja hacia ti, como la punta de una flecha; <strong>cruces</strong> ($\\otimes$) si entra, como las plumas de la cola.',
          'Con $\\vec v$ en la hoja, la fuerza también queda en la hoja, perpendicular a $\\vec v$. Usa los unitarios: si $x$ va a la derecha y $y$ hacia arriba, el campo que sale es $+\\hat k$ y el que entra es $-\\hat k$, y $\\hat\\imath \\times \\hat\\jmath = \\hat k$, $\\hat\\jmath \\times \\hat k = \\hat\\imath$, $\\hat k \\times \\hat\\imath = \\hat\\jmath$.'
        ],
        diagram: 'f3s02-page',
        caption: 'Cruces: $\\vec B$ entra. Puntos: $\\vec B$ sale. Invertir $\\vec B$, $\\vec v$ o el signo de $q$ invierte $\\vec F$.'
      },
      {
        type: 'concept', heading: 'Por componentes', short: 'Por componentes',
        body: [
          'Cuando $\\vec v$ y $\\vec B$ vienen en componentes, calcula el producto cruz con el determinante y multiplica por $q$: $$\\vec F = q\\begin{vmatrix} \\hat\\imath & \\hat\\jmath & \\hat k \\\\ v_x & v_y & v_z \\\\ B_x & B_y & B_z \\end{vmatrix} = q\\left[(v_yB_z - v_zB_y)\\,\\hat\\imath + (v_zB_x - v_xB_z)\\,\\hat\\jmath + (v_xB_y - v_yB_x)\\,\\hat k\\right]$$',
          'El orden importa: es $\\vec v \\times \\vec B$, con $\\vec v$ en el renglón de en medio. Cambiar el orden ($\\vec B \\times \\vec v$) da el vector opuesto.',
          'Un truco para unidades: con $q$ en $\\mu\\text{C}$, $v$ en km/s y $B$ en T, la fuerza sale en mN, porque $10^{-6}\\cdot 10^{3} = 10^{-3}$.'
        ]
      },
      {
        type: 'concept', heading: 'La fuerza magnética no hace trabajo', short: 'No hace trabajo',
        body: [
          'Como $\\vec F \\perp \\vec v$ en todo momento, la potencia $\\vec F\\cdot\\vec v$ es cero y el trabajo de la fuerza magnética es <strong>siempre cero</strong>. Por el teorema trabajo-energía, la energía cinética no cambia: <strong>la rapidez de la partícula se mantiene</strong>.',
          'El campo magnético solo puede <strong>cambiar la dirección</strong> de la velocidad. Para acelerar una partícula (subirle la rapidez) hace falta un campo eléctrico. Eso es justo lo que hace el ciclotrón de la <a href="../sesion-03/">sesión 3</a>: el campo eléctrico acelera y el magnético hace girar.'
        ],
        diagram: 'f3s02-nowork',
        caption: 'En cada punto, $\\vec F$ apunta al centro y $\\vec v$ es tangente: el ángulo entre ellas es siempre 90°.'
      },
      {
        type: 'concept', heading: 'La fuerza de Lorentz', short: 'Fuerza de Lorentz',
        body: [
          'Si en la región hay campo eléctrico y magnético, la fuerza total sobre la carga es la suma: $$\\vec F = q\\left(\\vec E + \\vec v \\times \\vec B\\right)$$ Se llama <strong>fuerza de Lorentz</strong>. La parte eléctrica no depende de la velocidad y sí puede hacer trabajo; la magnética depende de $\\vec v$ y no hace trabajo.',
          'Aquí se nota la diferencia que adelantamos en la <a href="../sesion-01/">sesión 1</a> entre $\\vec E$ y $\\vec B$: además de que sus líneas son distintas, $\\vec E$ empuja a lo largo de sus líneas y $\\vec B$ empuja perpendicular a ellas.'
        ]
      },
      {
        type: 'callout', heading: 'Auroras: cargas que siguen al campo',
        body: [
          'Las partículas cargadas del viento solar que llegan casi paralelas al campo de la Tierra sienten poca fuerza (el $\\sin\\theta$ es chico) y avanzan girando alrededor de las líneas de campo hasta los polos. Ahí chocan con la atmósfera y la hacen brillar: son las auroras. En la sesión 3 verás por qué el camino es una hélice.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: fuerza magnética sobre una carga', short: 'Receta',
        steps: [
          { text: 'Identifica $q$ con su signo, $\\vec v$ y $\\vec B$. Pasa a SI (o usa el juego μC, km/s, T → mN).' },
          { text: 'Si solo piden la magnitud: $F = |q|vB\\sin\\theta$, con $\\theta$ el ángulo entre $\\vec v$ y $\\vec B$.', tip: 'Si $\\vec v$ es paralela a $\\vec B$, la fuerza es cero aunque $v$ y $B$ sean grandes.' },
          { text: 'Si piden la dirección en un dibujo: regla de la mano derecha de $\\vec v$ hacia $\\vec B$; si $q < 0$, al revés.', tip: 'Puntos: $\\vec B$ sale de la hoja. Cruces: $\\vec B$ entra.' },
          { text: 'Si los vectores vienen en componentes: determinante con $\\vec v$ en el segundo renglón y $\\vec B$ en el tercero, y multiplica por $q$.', tip: 'Verifica que tu $\\vec F$ sea perpendicular a los dos: $\\vec F\\cdot\\vec v = 0$ y $\\vec F\\cdot\\vec B = 0$.' },
          { text: 'Si también hay $\\vec E$, suma: $\\vec F = q(\\vec E + \\vec v \\times \\vec B)$.' }
        ]
      },
      {
        type: 'example', heading: 'Un protón que cruza el campo en diagonal',
        problem: '<p>Un protón se mueve a $' + fx(e1.v, 1) + '\\times 10^{6}\\ \\text{m/s}$ formando $' + e1.th + '^\\circ$ con un campo magnético uniforme de $' + fx(e1.B, 2) + '\\ \\text{T}$. ¿Cuánto vale la fuerza magnética sobre él y qué aceleración le produce? ($m_p = 1.67\\times 10^{-27}\\ \\text{kg}$)</p>',
        steps: [
          { text: 'Magnitud de la fuerza con el ángulo entre $\\vec v$ y $\\vec B$.', math: 'F = |q|vB\\sin\\theta = (1.60\\times 10^{-19})(' + fx(e1.v, 1) + '\\times 10^{6})(' + fx(e1.B, 2) + ')\\sin ' + e1.th + '^\\circ = ' + sci(e1.FN) + '\\ \\text{N}' },
          { text: 'Segunda ley de Newton: la aceleración es enorme porque la masa es muy pequeña.', math: 'a = \\frac{F}{m_p} = \\frac{' + sci(e1.FN) + '}{1.67\\times 10^{-27}} = ' + sci(e1.a) + '\\ \\text{m/s}^2' },
          { text: 'La aceleración es perpendicular a $\\vec v$: cambia la dirección del protón, no su rapidez.' }
        ],
        answer: '$F = ' + sci(e1.FN) + '\\ \\text{N}$ y $a = ' + sci(e1.a) + '\\ \\text{m/s}^2$.',
        // q en 10⁻¹⁹ C y v en 10⁶ m/s: la fuerza sale en 10⁻¹³ N.
        verify: { lab: 'call', mod: 'lorentz', fn: 'magnitude', args: [e1.q, e1.v, e1.B, e1.th], value: e1.F }
      },
      {
        type: 'example', heading: 'Fuerza por componentes',
        problem: '<p>Una carga $q = ' + e2.q + '\\ \\mu\\text{C}$ se mueve con $\\vec v = (' + e2.v.join(', ') + ')\\ \\text{km/s}$ en un campo $\\vec B = (' + e2.B.join(', ') + ')\\ \\text{T}$. Calcula $\\vec F$ y su magnitud.</p>',
        steps: [
          { text: 'Producto cruz con el determinante ($\\vec v$ en medio, $\\vec B$ abajo).', math: '\\vec v \\times \\vec B = \\begin{vmatrix} \\hat\\imath & \\hat\\jmath & \\hat k \\\\ ' + e2.v.join(' & ') + ' \\\\ ' + e2.B.join(' & ') + ' \\end{vmatrix} = (' + e2.c.map(function (x) { return fx(x, 2); }).join(',\\ ') + ')\\ \\text{km/s·T}' },
          { text: 'Multiplica por $q$, con su signo. Con μC, km/s y T, la fuerza queda en mN.', math: '\\vec F = (' + e2.q + ')(' + e2.c.map(function (x) { return fx(x, 2); }).join(',\\ ') + ') = (' + e2.F.map(function (x) { return fx(x, 2); }).join(',\\ ') + ')\\ \\text{mN}' },
          { text: 'Comprueba que sea perpendicular a $\\vec v$: $\\vec F\\cdot\\vec v = ' + sg(e2.F[0]) + '(' + e2.v[0] + ') + ' + sg(e2.F[1]) + '(' + e2.v[1] + ') + 0 = 0$. Y la magnitud:', math: '|\\vec F| = \\sqrt{' + sg(e2.F[0]) + '^2 + ' + sg(e2.F[1]) + '^2} = ' + fx(e2.mag, 3) + '\\ \\text{mN}' }
        ],
        answer: '$\\vec F = (' + e2.F.map(function (x) { return fx(x, 2); }).join(',\\ ') + ')\\ \\text{mN}$, con $|\\vec F| = ' + fx(e2.mag, 3) + '\\ \\text{mN}$.',
        verify: { lab: 'call', mod: 'lorentz', fn: 'force', args: [e2.q, e2.v, e2.B], values: { x: e2.F[0], y: e2.F[1], z: e2.F[2], mag: e2.mag } }
      },
      {
        type: 'example', heading: 'Campo eléctrico y magnético a la vez',
        problem: '<p>Un protón se mueve con $\\vec v = (2.0\\times 10^{5},\\ 0,\\ 0)\\ \\text{m/s}$ en una región con $\\vec B = (0,\\ 0,\\ 0.10)\\ \\text{T}$ y $\\vec E = (0,\\ 1.5\\times 10^{4},\\ 0)\\ \\text{N/C}$. ¿Cuál es la fuerza total?</p>',
        steps: [
          { text: 'Parte magnética: $\\vec v \\times \\vec B = (v_yB_z - v_zB_y,\\ v_zB_x - v_xB_z,\\ v_xB_y - v_yB_x)$.', math: '\\vec v \\times \\vec B = (0,\\ -(2.0\\times 10^{5})(0.10),\\ 0) = (0,\\ ' + fx(e3.vB[1], 1) + '\\times 10^{4},\\ 0)\\ \\text{N/C}' },
          { text: 'Suma con $\\vec E$ (las dos partes tienen unidades de N/C).', math: '\\vec E + \\vec v \\times \\vec B = (0,\\ ' + fx(e3.E[1], 1) + '\\times 10^{4} - ' + fx(-e3.vB[1], 1) + '\\times 10^{4},\\ 0) = (0,\\ ' + fx(e3.sum[1] * 1e4, 0) + ',\\ 0)\\ \\text{N/C}' },
          { text: 'Multiplica por $q = e$.', math: '\\vec F = (1.60\\times 10^{-19})(0,\\ ' + fx(e3.sum[1] * 1e4, 0) + ',\\ 0) = (0,\\ ' + sci(e3.Fy) + ',\\ 0)\\ \\text{N}' },
          { text: 'Las dos fuerzas apuntan en sentidos opuestos sobre $y$ y se restan. Si $E$ valiera exactamente $vB$, se cancelarían: es la idea del <strong>selector de velocidades</strong> de la sesión 3.' }
        ],
        answer: '$\\vec F = (0,\\ ' + sci(e3.Fy) + ',\\ 0)\\ \\text{N}$: apunta hacia $-y$.',
        // Campos en 10⁴ N/C y v en 10⁴ m/s; q = 1 (en unidades de e).
        verify: { lab: 'call', mod: 'lorentz', fn: 'lorentz', args: [1, e3.E, e3.v, e3.B], values: { x: 0, y: e3.sum[1], z: 0 } }
      },
      {
        type: 'example', heading: 'Qué campo hace falta',
        problem: '<p>Quieres que una carga de $' + fx(e4.q, 1) + '\\ \\mu\\text{C}$ que se mueve a $' + fx(e4.v, 1) + '\\ \\text{km/s}$, perpendicular al campo, sienta una fuerza de $' + fx(e4.F, 1) + '\\ \\text{mN}$. ¿Qué campo necesitas?</p>',
        steps: [
          { text: 'Despeja $B$ de $F = |q|vB\\sin\\theta$ con $\\theta = 90^\\circ$.', math: 'B = \\frac{F}{|q|\\,v\\sin\\theta}' },
          { text: 'Con μC, km/s y mN, el campo sale directo en teslas.', math: 'B = \\frac{' + fx(e4.F, 1) + '}{(' + fx(e4.q, 1) + ')(' + fx(e4.v, 1) + ')(1)} = ' + fx(e4.B, 2) + '\\ \\text{T}' }
        ],
        answer: '$B = ' + fx(e4.B, 2) + '\\ \\text{T}$.',
        verify: { lab: 'call', mod: 'lorentz', fn: 'fieldFor', args: [e4.F, e4.q, e4.v, e4.th], value: e4.B }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué una carga quieta no siente fuerza magnética?', a: 'Porque $\\vec F = q\\vec v \\times \\vec B$ y con $\\vec v = 0$ el producto cruz es cero. Una carga quieta solo siente campos eléctricos.' },
          { q: '¿La fuerza magnética puede frenar una partícula?', a: 'No. Es perpendicular a la velocidad, no hace trabajo y la rapidez no cambia. Solo dobla la trayectoria.' },
          { q: '¿Qué ángulo uso en $\\sin\\theta$?', a: 'El ángulo entre $\\vec v$ y $\\vec B$, entre 0° y 180°. No el ángulo con la horizontal, a menos que $\\vec B$ sea horizontal.' },
          { q: '¿La mano derecha cambia para electrones?', a: 'La regla siempre se hace con la mano derecha. Para una carga negativa, la fuerza es la contraria al pulgar.' },
          { q: '¿Por qué la fuerza no va a lo largo de las líneas de campo, como con $\\vec E$?', a: 'Porque la fuerza magnética es un producto cruz: siempre perpendicular a $\\vec B$. Una partícula no sigue las líneas de $\\vec B$.' },
          { q: '¿Un tesla es mucho?', a: 'Sí. El campo de la Tierra es de unos $5\\times 10^{-5}\\ \\text{T}$; un imán de laboratorio fuerte da décimas de tesla.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          '$\\vec F = q\\vec v \\times \\vec B$, con magnitud $|q|vB\\sin\\theta$: cero si la carga está quieta o va paralela a $\\vec B$.',
          'La dirección es perpendicular a $\\vec v$ y a $\\vec B$: mano derecha de $\\vec v$ a $\\vec B$, y al revés si $q < 0$.',
          'Por componentes, determinante con $\\vec v$ en el segundo renglón y $\\vec B$ en el tercero.',
          'La fuerza magnética no hace trabajo: cambia la dirección de la velocidad, no la rapidez.',
          '$1\\ \\text{T} = 1\\ \\text{N/(A·m)}$ y, con campo eléctrico, $\\vec F = q(\\vec E + \\vec v \\times \\vec B)$.'
        ]
      }
    ],

    lab: {
      type: 'lorentz-force', title: 'La fuerza magnética en 3D',
      intro: 'En el modo Explorar, $\\vec v$ va sobre el eje $x$ y $\\vec B$ está en el plano $xy$: mueve la rapidez, el campo, el ángulo $\\theta$ y el signo de la carga, y mira cómo $\\vec F$ sale perpendicular a los dos. En el Reto te dan $q$, $\\vec v$ y $\\vec B$ en componentes; calcula $\\vec F$ en mN y el lab te dice si te faltó el signo de la carga, si invertiste el orden del producto cruz o si una componente está mal.',
      cfg: { mode: 'reto' }
    },

    formulas: [
      { label: 'Fuerza magnética', tex: '\\vec F = q\\,\\vec v \\times \\vec B' },
      { label: 'Magnitud', tex: 'F = |q|\\,vB\\sin\\theta' },
      { label: 'Fuerza de Lorentz', tex: '\\vec F = q\\left(\\vec E + \\vec v \\times \\vec B\\right)' },
      { label: 'Tesla', tex: '1\\ \\text{T} = 1\\ \\text{N/(A·m)}' },
      { label: 'Producto cruz', tex: '\\vec v \\times \\vec B = (v_yB_z - v_zB_y,\\ v_zB_x - v_xB_z,\\ v_xB_y - v_yB_x)' },
      { label: 'Sin trabajo', tex: '\\vec F\\cdot\\vec v = 0 \\ \\Rightarrow\\ v = \\text{constante}' }
    ],

    exercises: [
      {
        id: 'f3-s02-magnitud', title: 'Magnitud de la fuerza',
        vars: { q: [1, 9, 1], v: [2, 20, 2], B: [0.1, 1.5, 0.1], th: [15, 165, 15] },
        prompt: function (v) {
          return '<p>Una carga de $' + v.q + '\\ \\mu\\text{C}$ se mueve a $' + v.v + '\\ \\text{km/s}$ formando $' + v.th + '^\\circ$ con un campo de $' + fx(v.B, 1) + '\\ \\text{T}$. ¿Cuánto vale la fuerza magnética, en mN?</p>';
        },
        check: 'numeric', unit: 'mN',
        answer: function (v) { return v.q * v.v * v.B * Math.sin(v.th * RAD); },
        mistakes: {
          cos: function (v) { return v.q * v.v * v.B * Math.cos(v.th * RAD); },
          noSin: function (v) { return v.q * v.v * v.B; }
        },
        feedback: [
          { when: 'cos', say: 'Usaste $\\cos\\theta$. La fuerza magnética lleva $\\sin\\theta$: es cero cuando $\\vec v$ va paralela a $\\vec B$.' },
          { when: 'noSin', say: 'Ese es el máximo, $|q|vB$. Solo vale si $\\vec v \\perp \\vec B$; aquí falta $\\sin\\theta$.' }
        ],
        where: function (v) { return v.th !== 90; },
        oracle: { lab: 'call', mod: 'lorentz', fn: 'magnitude', args: function (v) { return [v.q, v.v, v.B, v.th]; } },
        hint: '$F = |q|vB\\sin\\theta$; con μC, km/s y T sale en mN.',
        solution: function (v) {
          return '$$F = |q|vB\\sin\\theta = (' + v.q + ')(' + v.v + ')(' + fx(v.B, 1) + ')\\sin ' + v.th + '^\\circ = ' + fx(v.q * v.v * v.B * Math.sin(v.th * RAD), 3) + '\\ \\text{mN}$$';
        }
      },
      {
        id: 'f3-s02-campo', title: 'El campo que hace falta',
        vars: { F: [1, 20, 1], q: [1, 5, 1], v: [2, 10, 1] },
        prompt: function (v) {
          return '<p>Una carga de $' + v.q + '\\ \\mu\\text{C}$ se mueve a $' + v.v + '\\ \\text{km/s}$ perpendicular a un campo magnético y siente $' + v.F + '\\ \\text{mN}$. ¿Cuánto vale $B$, en teslas?</p>';
        },
        check: 'numeric', unit: 'T',
        answer: function (v) { return v.F / (v.q * v.v); },
        mistakes: {
          mult: function (v) { return v.F * v.q * v.v; },
          half: function (v) { return v.F / (v.q * v.v) / 2; }
        },
        feedback: [
          { when: 'mult', say: 'Multiplicaste. Despeja: $B = F/(|q|v)$.' },
          { when: 'half', say: 'Con $\\vec v \\perp \\vec B$, $\\sin 90^\\circ = 1$; no hay factor ½.' }
        ],
        oracle: { lab: 'call', mod: 'lorentz', fn: 'fieldFor', args: function (v) { return [v.F, v.q, v.v, 90]; } },
        hint: 'Despeja $B$ de $F = |q|vB$ (con $\\sin 90^\\circ = 1$).',
        solution: function (v) { return '$$B = \\frac{F}{|q|v} = \\frac{' + v.F + '}{(' + v.q + ')(' + v.v + ')} = ' + fx(v.F / (v.q * v.v), 3) + '\\ \\text{T}$$'; }
      },
      {
        id: 'f3-s02-fz', title: 'Una componente de la fuerza',
        vars: { q: [-5, 5, 1], vx: [1, 6, 1], By: [0.1, 1, 0.1] },
        where: function (v) { return v.q !== 0; },
        prompt: function (v) {
          return '<p>Una carga $q = ' + v.q + '\\ \\mu\\text{C}$ tiene $\\vec v = (' + v.vx + ',\\ 0,\\ 0)\\ \\text{km/s}$ en un campo $\\vec B = (0,\\ ' + fx(v.By, 1) + ',\\ 0)\\ \\text{T}$. ¿Cuánto vale $F_z$, en mN? (con su signo)</p>';
        },
        check: 'numeric', unit: 'mN',
        answer: function (v) { return v.q * v.vx * v.By; },
        mistakes: {
          order: function (v) { return -v.q * v.vx * v.By; },
          noQ: function (v) { return v.vx * v.By; }
        },
        feedback: [
          { when: 'order', say: 'Te quedó al revés. $\\hat\\imath \\times \\hat\\jmath = +\\hat k$; revisa el orden $\\vec v \\times \\vec B$ y el signo de $q$.' },
          { when: 'noQ', say: 'Ese es $(\\vec v \\times \\vec B)_z$. Falta multiplicar por $q$, con su signo.' }
        ],
        oracle: { lab: 'call', mod: 'lorentz', fn: 'force', field: 'z', args: function (v) { return [v.q, [v.vx, 0, 0], [0, v.By, 0]]; } },
        hint: '$F_z = q(v_xB_y - v_yB_x)$.',
        solution: function (v) { return '$$F_z = q(v_xB_y - v_yB_x) = (' + v.q + ')(' + v.vx + ')(' + fx(v.By, 1) + ') = ' + fx(v.q * v.vx * v.By, 2) + '\\ \\text{mN}$$'; }
      },
      {
        id: 'f3-s02-electron', title: 'Aceleración de un electrón',
        vars: { v: [1, 9, 1], B: [1, 9, 1] },
        prompt: function (v) {
          return '<p>Un electrón se mueve a $' + v.v + '\\times 10^{6}\\ \\text{m/s}$ perpendicular a un campo de $' + v.B + '\\ \\text{mT}$. ¿Cuánto vale su aceleración, en m/s²? ($e = 1.60\\times 10^{-19}\\ \\text{C}$, $m_e = 9.11\\times 10^{-31}\\ \\text{kg}$.) Responde con notación científica.</p>';
        },
        check: 'numeric', unit: 'm/s²',
        answer: function (v) { return E * v.v * 1e6 * v.B * 1e-3 / ME; },
        mistakes: {
          proton: function (v) { return E * v.v * 1e6 * v.B * 1e-3 / MP; },
          noMilli: function (v) { return E * v.v * 1e6 * v.B / ME; }
        },
        feedback: [
          { when: 'proton', say: 'Usaste la masa del protón. El electrón es unas 1800 veces más ligero.' },
          { when: 'noMilli', say: 'Pasa el campo a teslas: $1\\ \\text{mT} = 10^{-3}\\ \\text{T}$.' }
        ],
        oracle: { lab: 'call', mod: 'lorentz', fn: 'magnitude', args: function (v) { return [E / ME, v.v * 1e6, v.B * 1e-3, 90]; } },
        hint: '$a = F/m_e = evB/m_e$.',
        solution: function (v) { var a = E * v.v * 1e6 * v.B * 1e-3 / ME; return '$$a = \\frac{evB}{m_e} = \\frac{(1.60\\times 10^{-19})(' + v.v + '\\times 10^{6})(' + v.B + '\\times 10^{-3})}{9.11\\times 10^{-31}} = ' + sci(a) + '\\ \\text{m/s}^2$$'; }
      },
      {
        id: 'f3-s02-direccion', title: 'Concepto: hacia dónde empuja',
        vars: { k: [0, 3, 1] },
        prompt: function (v) {
          var c = DIRS[v.k];
          return '<p>Una carga ' + (c.pos ? 'positiva' : 'negativa') + ' se mueve ' + c.v + ' en un campo magnético uniforme que <strong>' + (c.out ? 'sale' : 'entra a') + '</strong> ' + (c.out ? 'de la hoja' : 'la hoja') + '. ¿Hacia dónde apunta la fuerza magnética?</p>';
        },
        check: 'choice',
        options: function (v) {
          var right = DIRS[v.k].F, all = ['Hacia arriba de la hoja', 'Hacia abajo de la hoja', 'Hacia la derecha, como $\\vec v$', 'Hacia fuera de la hoja, como $\\vec B$'];
          var say = { 'Hacia arriba de la hoja': 'Revisa el producto cruz y el signo de la carga.', 'Hacia abajo de la hoja': 'Revisa el producto cruz y el signo de la carga.', 'Hacia la derecha, como $\\vec v$': 'La fuerza magnética es perpendicular a $\\vec v$.', 'Hacia fuera de la hoja, como $\\vec B$': 'La fuerza magnética es perpendicular a $\\vec B$.' };
          return all.map(function (t) { return t === right ? { text: t, correct: true } : { text: t, say: say[t] }; });
        },
        answer: function (v) { return DIRS[v.k].F; },
        hint: 'Escribe $\\vec v = \\hat\\imath$ y $\\vec B = \\pm\\hat k$, haz el producto cruz y multiplica por el signo de $q$.',
        solution: function (v) { return DIRS[v.k].why; }
      },
      {
        id: 'f3-s02-trabajo', title: 'Concepto: ¿cambia la rapidez?',
        vars: { k: [0, 1, 1] },
        prompt: function (v) {
          return '<p>Un ' + ['protón', 'electrón'][v.k] + ' entra a una región con solo campo magnético uniforme. Mientras está ahí, su rapidez…</p>';
        },
        check: 'choice',
        options: function () {
          return [
            { text: 'no cambia, porque la fuerza magnética es perpendicular a la velocidad', correct: true },
            { text: 'aumenta, porque el campo lo empuja', say: 'La fuerza magnética no hace trabajo: solo dobla la trayectoria.' },
            { text: 'disminuye hasta que se detiene', say: 'Sin trabajo no cambia la energía cinética.' }
          ];
        },
        answer: function () { return 'no cambia, porque la fuerza magnética es perpendicular a la velocidad'; },
        hint: '¿Qué ángulo forman $\\vec F$ y $\\vec v$? ¿Cuánto trabajo hace la fuerza?',
        solution: function () { return '$\\vec F \\perp \\vec v$, así que $P = \\vec F\\cdot\\vec v = 0$: <strong>la rapidez no cambia</strong>, solo la dirección.'; }
      },
      {
        id: 'f3-s02-cero', title: 'Concepto: cuándo no hay fuerza',
        vars: { k: [0, 2, 1] },
        prompt: function (v) {
          return '<p>' + ['Una carga positiva se mueve en la misma dirección que $\\vec B$.', 'Una carga negativa se mueve en sentido contrario a $\\vec B$.', 'Una carga está quieta dentro de un campo magnético de 2 T.'][v.k] + ' ¿Cuánto vale la fuerza magnética?</p>';
        },
        check: 'choice',
        options: function () {
          return [
            { text: 'Cero', correct: true },
            { text: '$|q|vB$, la máxima', say: 'La máxima es con $\\vec v \\perp \\vec B$.' },
            { text: 'Depende del signo de la carga', say: 'El signo cambia el sentido, no hace que aparezca una fuerza.' }
          ];
        },
        answer: function () { return 'Cero'; },
        hint: 'Mira el ángulo entre $\\vec v$ y $\\vec B$, o si hay velocidad.',
        solution: function (v) { return v.k === 2 ? 'Sin velocidad, $\\vec v \\times \\vec B = 0$: la fuerza es <strong>cero</strong>.' : 'Con $\\theta = ' + (v.k ? 180 : 0) + '^\\circ$, $\\sin\\theta = 0$: la fuerza es <strong>cero</strong>.'; }
      }
    ],

    quiz: { tags: ['f3.S02'], count: 8 },

    errors: [
      'Usar $\\cos\\theta$ en lugar de $\\sin\\theta$: la fuerza es cero cuando $\\vec v$ va a lo largo de $\\vec B$.',
      'Olvidar el signo de la carga: para un electrón, $\\vec F$ va al revés de lo que marca el pulgar.',
      'Cambiar el orden del producto cruz: $\\vec B \\times \\vec v = -\\vec v \\times \\vec B$.',
      'Pensar que la fuerza magnética apunta a lo largo de $\\vec B$, como la eléctrica a lo largo de $\\vec E$.',
      'Creer que la fuerza magnética puede acelerar (cambiar la rapidez) a una partícula.',
      'Confundir puntos y cruces: puntos, $\\vec B$ sale de la hoja; cruces, entra.',
      'Mezclar unidades: con μC, km/s y T la fuerza sale en mN, no en N.'
    ],

    teacher: {
      plan: [
        'Arranca con la pregunta: ¿qué le hace un imán a un electrón quieto? Nada. ¿Y si se mueve? Muestra un tubo de rayos catódicos o un video con un imán que desvía el haz.',
        'Escribe $\\vec F = q\\vec v \\times \\vec B$ y saca de ahí la definición del tesla.',
        'Usa el explainer de la mano derecha y practica con puntos y cruces (las cuatro viñetas).',
        'Por componentes con el determinante y la comprobación $\\vec F\\cdot\\vec v = 0$.',
        'Cierra con el lab en modo Reto y con la fuerza de Lorentz como puente al selector de velocidades.'
      ],
      check: [
        'Que den la dirección de $\\vec F$ en un dibujo con puntos o cruces, para cargas positivas y negativas.',
        'Que calculen $\\vec F$ por componentes y verifiquen que es perpendicular a $\\vec v$.',
        'Que expliquen por qué la rapidez no cambia.'
      ],
      note: 'La definición de $B$ por la fuerza sobre una carga de prueba es paralela a la de $\\vec E$ en Física 2. Conviene hacer explícita la comparación: $\\vec F = q\\vec E$ contra $\\vec F = q\\vec v \\times \\vec B$.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §11.2 “Magnetic Fields and Lines”. <a href="https://openstax.org/books/university-physics-volume-2/pages/11-2-magnetic-fields-and-lines">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-01',
    next: 'sesion-03'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
