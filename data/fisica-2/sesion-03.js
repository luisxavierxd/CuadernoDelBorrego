/* =====================================================================
   Física 2 · S03 · Campo eléctrico (bloque A · Electrostática).
   Fuentes: OpenStax, University Physics Volume 2, §5.4 y §5.6 (CC BY-NC-SA 4.0).
   k = 8.99 × 10⁹ N·m²/C², e = 1.60 × 10⁻¹⁹ C, mₑ = 9.11 × 10⁻³¹ kg, SI.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.efield (lab field-lines).
   ===================================================================== */
(function () {
  var k = 8.99e9, e = 1.60e-19, me = 9.11e-31, mp = 1.67e-27, DEG = 180 / Math.PI;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  // Número en LaTeX: notación científica con 3 cifras si es muy grande o muy chico.
  function sci(v, d) {
    d = d == null ? 2 : d;
    if (v === 0) return '0';
    var ex = Math.floor(Math.log10(Math.abs(v)));
    if (ex >= -1 && ex <= 3) return fx(v, d);
    var m = v / Math.pow(10, ex);
    if (Math.abs(+m.toFixed(d)) >= 10) { m /= 10; ex += 1; }
    return m.toFixed(d) + ' \\times 10^{' + ex + '}';
  }
  // Campo de una carga q (C) en (sx, sy) evaluado en (px, py), en metros: [Ex, Ey].
  function Epoint(q, sx, sy, px, py) {
    var dx = px - sx, dy = py - sy, r = Math.sqrt(dx * dx + dy * dy);
    return [k * q * dx / (r * r * r), k * q * dy / (r * r * r)];
  }

  // Ejemplo 1: carga puntual de +3.0 nC, punto a 5.0 cm.
  var e1 = { q: 3e-9, r: 0.05, q0: -2e-9 };
  e1.E = k * e1.q / (e1.r * e1.r);
  e1.F = Math.abs(e1.q0) * e1.E;
  // Ejemplo 2: q₁ = +4 nC en el origen, q₂ = −2 nC en (6, 0) cm, P en (0, 8) cm.
  var e2 = { q1: 4e-9, q2: -2e-9 };
  e2.E1 = k * e2.q1 / (0.08 * 0.08);
  e2.E2 = k * Math.abs(e2.q2) / (0.1 * 0.1);
  e2.E2x = e2.E2 * 0.6; e2.E2y = -e2.E2 * 0.8;     // hacia q₂: (0.06, −0.08)/0.10
  e2.Ex = e2.E2x; e2.Ey = e2.E1 + e2.E2y;
  e2.E = Math.sqrt(e2.Ex * e2.Ex + e2.Ey * e2.Ey);
  e2.ang = Math.atan2(e2.Ey, e2.Ex) * DEG;
  // Ejemplo 3: +2 nC en x = 0 y +8 nC en x = 30 cm.
  var e3 = { a: 2, b: 8, d: 0.3 };
  e3.x = e3.d * Math.sqrt(e3.a) / (Math.sqrt(e3.a) + Math.sqrt(e3.b));
  e3.E1 = k * e3.a * 1e-9 / (e3.x * e3.x);
  // Ejemplo 4: electrón entre placas.
  var e4 = { E: 1.0e3, v0: 3.0e6, L: 0.04 };
  e4.F = e * e4.E;
  e4.a = e4.F / me;
  e4.t = e4.L / e4.v0;
  e4.y = 0.5 * e4.a * e4.t * e4.t;
  e4.W = me * 9.81;

  // Resultados del alumno: la respuesta y cada error típico deben diferir al menos 3 %.
  function distinct(ex, base) {
    return function (v) {
      if (base && !base(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (key) { return ex.mistakes[key](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (!isFinite(vals[i]) || Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]))) return false;
      }
      return true;
    };
  }

  // Ejercicio de dos cargas: q₁ = +a nC en el origen, q₂ = ±b nC en (d, 0) cm, P en (0, h) cm.
  function twoQ(v) { return [{ q: v.a * 1e-9, x: 0, y: 0 }, { q: (v.s ? 1 : -1) * v.b * 1e-9, x: v.d / 100, y: 0 }]; }
  function netE(v, flip) {
    var q2 = (v.s ? 1 : -1) * (flip ? -1 : 1) * v.b * 1e-9, h = v.h / 100, d = v.d / 100;
    var A = Epoint(v.a * 1e-9, 0, 0, 0, h), B = Epoint(q2, d, 0, 0, h);
    return Math.sqrt(Math.pow(A[0] + B[0], 2) + Math.pow(A[1] + B[1], 2));
  }
  // Punto nulo sobre el eje (cm): q₁ = +a en 0, q₂ = ±b en d.
  function nullX(v) {
    var ra = Math.sqrt(v.a), rb = Math.sqrt(v.b);
    return v.s ? v.d * ra / (ra + rb) : -v.d * ra / (rb - ra);
  }
  function plateY(v, m) { var a = e * v.E * 1e3 / m, t = (v.L / 100) / (v.v0 * 1e6); return 0.5 * a * t * t * 1000; }

  var data = window.SESSION_DATA = {
    slug: 'sesion-03', number: '03', group: 'A · Electrostática',
    title: 'Campo eléctrico', temario: [],
    minutes: 180,
    quote: 'Una carga cambia el espacio a su alrededor: el campo eléctrico te dice qué fuerza sentiría cualquier otra carga que pusieras ahí.',
    badges: [
      'Definir el campo como fuerza por unidad de carga, $\\vec E = \\vec F/q_0$.',
      'Calcular el campo de una o varias cargas puntuales por componentes.',
      'Encontrar dónde se anula el campo de dos cargas.',
      'Leer y dibujar líneas de campo, incluido el dipolo.',
      'Predecir la trayectoria de un electrón en un campo uniforme.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'El campo eléctrico es la <strong>fuerza que sentiría una carga de 1 C</strong> en cada punto del espacio. Si lo conoces, la fuerza sobre cualquier carga es $\\vec F = q\\vec E$.',
        recall: [
          'Ley de Coulomb y superposición de fuerzas (S02).',
          'Componentes y suma de vectores (Física 1, S02).',
          'Tiro parabólico: un movimiento uniforme y otro acelerado a la vez (Física 1, S06).'
        ],
        why: 'Las pantallas de los osciloscopios viejos, las impresoras de inyección de tinta y los aceleradores de partículas desvían cargas con campos eléctricos. Las líneas de campo también te dejan «ver» cómo se reparte la carga en un conductor.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en una fogata. No necesitas tocarla para sentir su calor: el calor llena el espacio a su alrededor y es más intenso cerca. Una carga eléctrica hace algo parecido: «prepara» el espacio, y cualquier otra carga que entre ahí siente una fuerza.',
          'El mapa del clima muestra flechas de viento en cada ciudad aunque no haya nadie parado ahí. El campo eléctrico es ese mapa: en cada punto, una flecha que dice hacia dónde y qué tan fuerte empujaría a una carga positiva de 1 C.',
          'La gravedad ya la conoces así: cerca de la Tierra, $g = 9.81$ N/kg es la fuerza por cada kilogramo. El campo eléctrico es la fuerza por cada coulomb.'
        ]
      },
      {
        type: 'concept', heading: 'El campo: fuerza por unidad de carga', short: 'Definición de E',
        body: [
          'Para medir el campo en un punto P pones ahí una <strong>carga de prueba</strong> $q_0$ (chica y positiva) y mides la fuerza sobre ella. El campo es $$\\vec E = \\frac{\\vec F}{q_0}\\qquad [\\vec E] = \\text{N/C}$$',
          'Si duplicas $q_0$, la fuerza se duplica y el cociente no cambia: <strong>el campo depende de las cargas que lo producen, no de la carga de prueba</strong>. Al revés, si conoces $\\vec E$, la fuerza sobre cualquier carga $q$ es $\\vec F = q\\vec E$: misma dirección que $\\vec E$ si $q > 0$ y opuesta si $q < 0$.',
          'Para una carga puntual $Q$, Coulomb da $F = k|Q|q_0/r^2$; al dividir entre $q_0$ queda el campo de la carga puntual: $$\\vec E = \\frac{kQ}{r^2}\\,\\hat r$$ donde $\\hat r$ es el vector unitario que va <strong>de la carga al punto</strong>.'
        ],
        diagram: 'f2s03-test-charge',
        caption: 'La carga de prueba $q_0$ solo «mide»: el campo es la fuerza sobre ella dividida entre su carga.'
      },
      {
        type: 'explainer', heading: 'El campo de una carga puntual, paso a paso', short: 'Carga puntual',
        title: 'Magnitud y dirección de E',
        intro: 'Todo el campo de una carga puntual sale de dos preguntas: ¿qué tan lejos está P? y ¿hacia dónde apunta?',
        diagram: 'f2s03-point',
        steps: [
          { text: 'Mide la distancia $r$ de la carga $Q$ al punto P, <strong>en metros</strong>.', state: { d: 200, neg: false, show: 'r' } },
          { text: 'El vector unitario $\\hat r$ apunta de $Q$ hacia P. Es la dirección «de alejarse» de la carga.', state: { show: 'rhat' } },
          { text: 'La magnitud es $|\\vec E| = \\dfrac{k|Q|}{r^2}$. Si $Q > 0$, $\\vec E$ apunta como $\\hat r$: se aleja de la carga.', state: { show: 'mag' } },
          { text: 'Si $Q < 0$, $\\vec E = kQ\\hat r/r^2$ apunta al revés de $\\hat r$: <strong>hacia la carga</strong>.', state: { neg: true, show: 'dir' } },
          { text: 'Con $r$ al doble, $r^2$ crece 4 veces: el campo baja a la cuarta parte. Por eso las flechas se encogen tan rápido.', state: { d: 400, neg: false, show: 'double' } }
        ]
      },
      {
        type: 'explainer', heading: 'Varias cargas: se suman los vectores', short: 'Superposición',
        title: 'Superposición en el punto P',
        intro: 'Cada carga produce su propio campo como si las otras no existieran. El campo total es la <strong>suma vectorial</strong>: $\\vec E = \\vec E_1 + \\vec E_2 + \\cdots$',
        diagram: 'f2s03-superposition',
        steps: [
          { text: 'Campo de $q_1 = +4$ nC: $r_1 = 0.08$ m y $E_1 = kq_1/r_1^2 = 5619$ N/C, alejándose de $q_1$ (hacia arriba).', state: { show: 'e1' } },
          { text: 'Campo de $q_2 = -2$ nC: $r_2 = 0.10$ m y $E_2 = k|q_2|/r_2^2 = 1798$ N/C, apuntando <strong>hacia</strong> $q_2$ porque es negativa.', state: { show: 'e2' } },
          { text: 'Descompón: la dirección de P a $q_2$ es $(0.6, -0.8)$, así que $\\vec E_2 = (1079, -1438)$ N/C.', state: { show: 'comp' } },
          { text: 'Suma componente a componente: $\\vec E = (1079, 4180)$ N/C, $|\\vec E| = 4317$ N/C. Nunca sumes las magnitudes: $5619 + 1798$ no es la respuesta.', state: { show: 'sum' } }
        ]
      },
      {
        type: 'explainer', heading: '¿Dónde se anula el campo?', short: 'Punto nulo',
        title: 'Dos cargas sobre una recta',
        intro: 'Sobre la recta que une dos cargas, el campo total es cero donde los dos campos tienen la misma magnitud y sentidos opuestos. Primero piensa <strong>en qué región</strong> puede pasar eso; luego iguala magnitudes.',
        diagram: 'f2s03-null',
        steps: [
          { text: 'Mismo signo: entre las cargas los campos apuntan en sentidos opuestos. Ahí está el punto nulo, más cerca de la carga menor: $\\dfrac{k|q_1|}{x^2} = \\dfrac{k|q_2|}{(d - x)^2}$.', state: { mode: 'same' } },
          { text: 'Signos opuestos: entre las cargas los campos apuntan al mismo lado y se suman. El punto nulo está <strong>afuera</strong>, del lado de la carga de menor magnitud (cerca de la grande nunca puede igualarla).', state: { mode: 'opposite' } },
          { text: 'Iguales y opuestas (un dipolo): afuera, la más cercana siempre gana. El campo no se anula en ningún punto de la recta.', state: { mode: 'equal' } }
        ]
      },
      {
        type: 'explainer', heading: 'Líneas de campo', short: 'Líneas de campo',
        title: 'Cómo se dibujan',
        intro: 'Las líneas de campo son una forma de dibujar $\\vec E$ en todo el plano a la vez. En cada punto, la línea es <strong>tangente</strong> a $\\vec E$ y su flecha marca el sentido. Muévelas tú mismo en el lab.',
        diagram: 'f2s03-lines',
        steps: [
          { text: 'Salen de las cargas positivas, en todas direcciones y repartidas de forma pareja.', state: { kind: 'pos' } },
          { text: 'Entran a las cargas negativas. Donde están más juntas (cerca de la carga), el campo es más intenso.', state: { kind: 'neg' } },
          { text: 'Dipolo: las líneas van de la + a la −. En la bisectriz, entre las dos, el campo es paralelo a la recta que las une y apunta de la + hacia la −.', state: { kind: 'dipole' } },
          { text: 'Dos cargas iguales: las líneas se repelen y dejan un hueco a la mitad, donde $\\vec E = 0$. Dos líneas <strong>nunca se cruzan</strong>: en cada punto $\\vec E$ tiene una sola dirección.', state: { kind: 'pair' } },
          { text: 'El número de líneas es proporcional a la carga: de $+2q$ salen el doble que las que entran a $-q$. Las que sobran se van lejos.', state: { kind: 'unequal' } }
        ]
      },
      {
        type: 'explainer', heading: 'Una carga en un campo uniforme', short: 'Campo uniforme',
        title: 'Un electrón entre dos placas',
        intro: 'Entre dos placas paralelas con cargas opuestas el campo es <strong>uniforme</strong>: misma magnitud y dirección en todos lados. Una carga ahí siente una fuerza constante, igual que una pelota con la gravedad. Por eso su trayectoria es una parábola, como el <a href="../../../fisica-1/sesiones/sesion-06/">tiro parabólico de Física 1</a>.',
        diagram: 'f2s03-plates',
        steps: [
          { text: 'El campo va de la placa + a la −, con la misma magnitud $E$ en todo el espacio entre ellas.', state: { u: 0, show: 'field' } },
          { text: 'Un electrón entra horizontal con rapidez $v_0$. En horizontal no hay fuerza: avanza a velocidad constante.', state: { u: 0, show: 'enter' } },
          { text: 'La fuerza es $\\vec F = q\\vec E$; como $q = -e$, apunta <strong>al revés</strong> de $\\vec E$: hacia la placa +. Su aceleración es constante: $a = \\dfrac{eE}{m}$.', state: { u: 0.35, show: 'force' } },
          { text: 'Es el tiro parabólico con $a$ en lugar de $g$: $x = v_0t$ y $y = \\tfrac{1}{2}at^2$. La trayectoria es una parábola.', state: { u: 1, show: 'path' } },
          { text: 'Sale de las placas cuando $x = L$, o sea en $t = L/v_0$. La deflexión es $y = \\tfrac{1}{2}a\\,(L/v_0)^2$; afuera ya no hay fuerza y sigue en línea recta.', state: { u: 1, show: 'exit' } }
        ]
      },
      {
        type: 'callout', heading: '¿Y la gravedad del electrón?',
        body: [
          'El peso de un electrón es $m_e g \\approx 8.9 \\times 10^{-30}$ N. Con un campo modesto de $1000$ N/C, la fuerza eléctrica es $eE = 1.6 \\times 10^{-16}$ N: unas $10^{13}$ veces más grande. Por eso en estos problemas la gravedad se ignora.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: campo de cargas puntuales', short: 'Receta',
        steps: [
          { text: 'Convierte todo a SI: nC → $10^{-9}$ C, μC → $10^{-6}$ C y cm → m.', tip: 'El error más común es dejar $r$ en centímetros: el campo sale $10^4$ veces más chico.' },
          { text: 'Para cada carga, calcula $r$ (de la carga a P) y la magnitud $E_i = k|q_i|/r_i^2$.', tip: 'Usa $|q|$ para la magnitud; el signo solo decide el sentido.' },
          { text: 'Decide el sentido de cada $\\vec E_i$: se aleja de las positivas y apunta hacia las negativas. Dibújalo.' },
          { text: 'Descompón cada vector en $x$ y $y$ (con el triángulo o con el ángulo) y suma por separado.', tip: 'No sumes magnitudes: dos vectores de 3 y 4 pueden dar 5, 7 o 1.' },
          { text: 'Si te piden magnitud y dirección: $|\\vec E| = \\sqrt{E_x^2 + E_y^2}$ y el ángulo con los signos de $E_x$ y $E_y$ a la vista.' }
        ]
      },
      {
        type: 'example', heading: 'Campo de una carga puntual',
        problem: '<p>Una carga de $Q = +3.0\\ \\text{nC}$ está fija. ¿Qué campo produce en un punto a $5.0\\ \\text{cm}$? Si ahí pones una carga de $q_0 = -2.0\\ \\text{nC}$, ¿qué fuerza siente? Usa $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$.</p>',
        steps: [
          { text: 'Convierte: $Q = 3.0 \\times 10^{-9}$ C y $r = 0.050$ m.' },
          { text: 'Magnitud del campo. Apunta alejándose de $Q$ porque es positiva.', math: 'E = \\frac{kQ}{r^2} = \\frac{(8.99 \\times 10^9)(3.0 \\times 10^{-9})}{(0.050)^2} = ' + sci(e1.E) + '\\ \\text{N/C}' },
          { text: 'Fuerza sobre $q_0$: $F = |q_0|E$. Como $q_0 < 0$, apunta al revés del campo: hacia $Q$ (se atraen).', math: 'F = (2.0 \\times 10^{-9})(' + sci(e1.E) + ') = ' + sci(e1.F) + '\\ \\text{N}' }
        ],
        answer: '$E \\approx ' + sci(e1.E) + '\\ \\text{N/C}$ alejándose de $Q$, y $F \\approx ' + sci(e1.F) + '\\ \\text{N}$ hacia $Q$.',
        verify: { lab: 'call', mod: 'efield', fn: 'field', args: [[{ q: e1.q, x: 0, y: 0 }], e1.r, 0], values: { mag: e1.E, x: e1.E } }
      },
      {
        type: 'example', heading: 'Superposición de dos cargas',
        problem: '<p>$q_1 = +4.0\\ \\text{nC}$ está en el origen y $q_2 = -2.0\\ \\text{nC}$ en $(6.0, 0)$ cm. Encuentra el campo en P $= (0, 8.0)$ cm. Usa $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$.</p>',
        steps: [
          { text: 'Distancias: $r_1 = 0.080$ m; de $q_2$ a P, $r_2 = \\sqrt{0.06^2 + 0.08^2} = 0.10$ m.' },
          { text: 'Campo de $q_1$: se aleja de ella, hacia $+y$.', math: 'E_1 = \\frac{(8.99 \\times 10^9)(4.0 \\times 10^{-9})}{(0.080)^2} = ' + fx(e2.E1, 0) + '\\ \\text{N/C}' },
          { text: 'Campo de $q_2$: apunta hacia $q_2$, en la dirección $(0.06, -0.08)/0.10 = (0.6, -0.8)$.', math: 'E_2 = \\frac{(8.99 \\times 10^9)(2.0 \\times 10^{-9})}{(0.10)^2} = ' + fx(e2.E2, 0) + '\\ \\text{N/C} \\;\\Rightarrow\\; \\vec E_2 = (' + fx(e2.E2x, 0) + ', ' + fx(e2.E2y, 0) + ')' },
          { text: 'Suma por componentes.', math: '\\vec E = (' + fx(e2.Ex, 0) + ',\\ ' + fx(e2.Ey, 0) + ')\\ \\text{N/C} \\qquad |\\vec E| = ' + fx(e2.E, 0) + '\\ \\text{N/C},\\ \\theta = ' + fx(e2.ang, 1) + '^\\circ' }
        ],
        answer: '$\\vec E \\approx (' + fx(e2.Ex, 0) + ', ' + fx(e2.Ey, 0) + ')$ N/C: $|\\vec E| \\approx ' + fx(e2.E, 0) + '$ N/C a $' + fx(e2.ang, 1) + '^\\circ$ sobre $+x$.',
        verify: { lab: 'call', mod: 'efield', fn: 'field', args: [[{ q: e2.q1, x: 0, y: 0 }, { q: e2.q2, x: 0.06, y: 0 }], 0, 0.08], values: { x: e2.Ex, y: e2.Ey, mag: e2.E, ang: e2.ang } }
      },
      {
        type: 'example', heading: 'Dónde se anula el campo',
        problem: '<p>Una carga de $+2.0\\ \\text{nC}$ está en $x = 0$ y otra de $+8.0\\ \\text{nC}$ en $x = 30$ cm. ¿En qué punto del eje $x$ es cero el campo?</p>',
        steps: [
          { text: 'Mismo signo: el punto está entre las dos, más cerca de la menor. Iguala magnitudes; $k$ se cancela.', math: '\\frac{2.0}{x^2} = \\frac{8.0}{(0.30 - x)^2}' },
          { text: 'Saca raíz (las dos distancias son positivas):', math: '\\frac{0.30 - x}{x} = \\sqrt{\\frac{8.0}{2.0}} = 2 \\;\\Rightarrow\\; x = \\frac{0.30}{3} = ' + fx(e3.x * 100, 1) + '\\ \\text{cm}' },
          { text: 'Comprueba: $E_1 = k(2.0 \\times 10^{-9})/(0.10)^2 = ' + fx(e3.E1, 0) + '$ N/C a la derecha y $E_2 = k(8.0 \\times 10^{-9})/(0.20)^2$ da lo mismo a la izquierda.' }
        ],
        answer: 'En $x = ' + fx(e3.x * 100, 1) + '$ cm, entre las cargas.',
        verify: { lab: 'call', mod: 'efield', fn: 'nullPoint', args: [2e-9, 0, 8e-9, 0.3], value: e3.x }
      },
      {
        type: 'example', heading: 'Un electrón entre placas',
        problem: '<p>Un electrón entra horizontal con $v_0 = 3.0 \\times 10^6$ m/s entre dos placas de $L = 4.0$ cm de largo, separadas $4.0$ cm, con un campo uniforme de $1.0 \\times 10^3$ N/C. ¿Qué aceleración tiene, cuánto tarda en cruzar y cuánto se desvía? Usa $e = 1.60 \\times 10^{-19}$ C y $m_e = 9.11 \\times 10^{-31}$ kg.</p>',
        steps: [
          { text: 'Aceleración (hacia la placa +):', math: 'a = \\frac{eE}{m_e} = \\frac{(1.60 \\times 10^{-19})(1.0 \\times 10^3)}{9.11 \\times 10^{-31}} = ' + sci(e4.a) + '\\ \\text{m/s}^2' },
          { text: 'En horizontal la velocidad no cambia:', math: 't = \\frac{L}{v_0} = \\frac{0.040}{3.0 \\times 10^6} = ' + sci(e4.t) + '\\ \\text{s}' },
          { text: 'En vertical parte del reposo, como una caída libre con $a$:', math: 'y = \\tfrac{1}{2}a t^2 = \\tfrac{1}{2}(' + sci(e4.a) + ')(' + sci(e4.t) + ')^2 = ' + fx(e4.y * 100) + '\\ \\text{cm}' },
          { text: 'Como $' + fx(e4.y * 100) + ' < 2.0$ cm (la mitad de la separación), sí sale sin chocar.' }
        ],
        answer: '$a \\approx ' + sci(e4.a) + '\\ \\text{m/s}^2$, $t \\approx ' + sci(e4.t) + '\\ \\text{s}$ y se desvía $' + fx(e4.y * 100) + '$ cm hacia la placa +.',
        verify: { lab: 'call', mod: 'efield', fn: 'plates', args: [{ q: -e, m: me, E: e4.E, v0: e4.v0, L: e4.L }], values: { a: e4.a, t: e4.t, y: e4.y } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿El campo depende de la carga de prueba?', a: 'No. Si cambias $q_0$, la fuerza cambia en la misma proporción y $F/q_0$ queda igual. El campo lo producen las otras cargas.' },
          { q: '¿Para qué sirve $\\hat r$ si ya sé la magnitud?', a: 'Te da la dirección. Con varias cargas la necesitas para descomponer cada campo y sumarlos.' },
          { q: '¿Las líneas de campo existen de verdad?', a: 'No son objetos: son un dibujo de $\\vec E$. Lo real es el campo en cada punto; las líneas solo lo hacen visible.' },
          { q: '¿Una carga sigue su línea de campo?', a: 'No en general. La fuerza es tangente a la línea, pero la velocidad puede ir hacia otro lado: el electrón entre placas cruza las líneas en parábola.' },
          { q: '¿Por qué el electrón se va hacia la placa positiva si el campo apunta hacia abajo?', a: 'Porque $\\vec F = q\\vec E$ con $q < 0$: la fuerza es opuesta al campo. Un protón se iría hacia la negativa, y mucho menos, porque su masa es unas 1800 veces mayor.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          '$\\vec E = \\vec F/q_0$; la fuerza sobre cualquier carga es $\\vec F = q\\vec E$.',
          'Carga puntual: $|\\vec E| = k|q|/r^2$, alejándose de las + y hacia las −.',
          'Varias cargas: suma vectorial por componentes, nunca de magnitudes.',
          'En un campo uniforme la aceleración es constante, $a = |q|E/m$: trayectoria parabólica.'
        ]
      }
    ],

    lab: {
      type: 'field-lines', title: 'Líneas de campo en vivo',
      intro: 'Arrastra las cargas y el punto P: las líneas se recalculan al instante. Calcula a mano $E_x$ y $E_y$ en P y compáralos. El lab detecta si dejaste $r$ en cm, si olvidaste el cuadrado, si ignoraste un signo o si sumaste magnitudes. En el modo «Electrón entre placas» predice la deflexión.',
      cfg: { start: { preset: 'Positiva y negativa distintas' } }
    },

    formulas: [
      { label: 'Definición', tex: '\\vec E = \\vec F / q_0' },
      { label: 'Carga puntual', tex: '\\vec E = \\frac{kq}{r^2}\\,\\hat r' },
      { label: 'Superposición', tex: '\\vec E = \\sum_i \\vec E_i' },
      { label: 'Fuerza en un campo', tex: '\\vec F = q\\vec E' },
      { label: 'Campo uniforme', tex: 'a = \\frac{|q|E}{m},\\ \\ y = \\tfrac{1}{2}a\\left(\\frac{L}{v_0}\\right)^2' },
      { label: 'Constantes', tex: 'k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2,\\ \\ e = 1.60 \\times 10^{-19}\\ \\text{C}' }
    ],

    exercises: [
      {
        id: 'f2-s03-puntual', title: 'Campo de una carga puntual',
        vars: { q: [1, 9, 1], r: [2, 12, 1] },
        prompt: function (v) { return '<p>Una carga de $+' + v.q + '\\ \\text{nC}$ está fija. ¿Qué magnitud tiene su campo eléctrico a $' + v.r + '\\ \\text{cm}$? Da $E$ en N/C. Usa $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$.</p>'; },
        check: 'numeric', unit: 'N/C',
        answer: function (v) { return k * v.q * 1e-9 / Math.pow(v.r / 100, 2); },
        mistakes: {
          noSquare: function (v) { return k * v.q * 1e-9 / (v.r / 100); },
          cm: function (v) { return k * v.q * 1e-9 / (v.r * v.r); }
        },
        feedback: [
          { when: 'noSquare', say: 'Te faltó elevar $r$ al cuadrado: $E = kq/r^2$.' },
          { when: 'cm', say: 'Dejaste $r$ en centímetros. Conviértelo a metros antes de elevarlo al cuadrado.' }
        ],
        oracle: { lab: 'call', mod: 'efield', fn: 'field', field: 'mag', args: function (v) { return [[{ q: v.q * 1e-9, x: 0, y: 0 }], v.r / 100, 0]; } },
        hint: 'Convierte nC a C y cm a m. Luego $E = kq/r^2$.',
        solution: function (v) { return '$$E = \\frac{(8.99 \\times 10^9)(' + v.q + ' \\times 10^{-9})}{(' + fx(v.r / 100, 2) + ')^2} = ' + sci(k * v.q * 1e-9 / Math.pow(v.r / 100, 2)) + '\\ \\text{N/C}$$'; }
      },
      {
        id: 'f2-s03-fuerza', title: 'Definición: E = F/q₀',
        vars: { F: [2, 50, 1], q0: [1, 9, 1] },
        prompt: function (v) { return '<p>Una carga de prueba de $' + v.q0 + '\\ \\mu\\text{C}$ siente una fuerza de $' + v.F + '\\ \\text{mN}$ en cierto punto. ¿Cuánto vale el campo eléctrico ahí, en N/C?</p>'; },
        check: 'numeric', unit: 'N/C',
        answer: function (v) { return (v.F * 1e-3) / (v.q0 * 1e-6); },
        mistakes: {
          noConvert: function (v) { return v.F / v.q0; },
          multiplied: function (v) { return v.F * 1e-3 * v.q0 * 1e-6; }
        },
        feedback: [
          { when: 'noConvert', say: 'Convierte antes de dividir: 1 mN = $10^{-3}$ N y 1 μC = $10^{-6}$ C.' },
          { when: 'multiplied', say: 'El campo es la fuerza <em>entre</em> la carga: $E = F/q_0$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return 1000 * v.F / v.q0; } },
        hint: '$E = F/q_0$ con $F$ en N y $q_0$ en C.',
        solution: function (v) { return '$$E = \\frac{' + v.F + ' \\times 10^{-3}\\ \\text{N}}{' + v.q0 + ' \\times 10^{-6}\\ \\text{C}} = ' + sci(1000 * v.F / v.q0) + '\\ \\text{N/C}$$'; }
      },
      {
        id: 'f2-s03-neto', title: 'Campo neto de dos cargas',
        vars: { a: [1, 6, 1], b: [1, 6, 1], s: [0, 1, 1], d: [3, 8, 1], h: [3, 8, 1] },
        prompt: function (v) {
          return '<p>$q_1 = +' + v.a + '\\ \\text{nC}$ está en el origen y $q_2 = ' + (v.s ? '+' : '-') + v.b + '\\ \\text{nC}$ en $(' + v.d + ', 0)$ cm. ¿Qué magnitud tiene el campo total en P $= (0, ' + v.h + ')$ cm? Usa $k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$.</p>';
        },
        check: 'numeric', unit: 'N/C',
        answer: function (v) { return netE(v, false); },
        mistakes: {
          addMags: function (v) { return k * v.a * 1e-9 / Math.pow(v.h / 100, 2) + k * v.b * 1e-9 / (Math.pow(v.d / 100, 2) + Math.pow(v.h / 100, 2)); },
          signFlip: function (v) { return netE(v, true); }
        },
        feedback: [
          { when: 'addMags', say: 'Sumaste las magnitudes. Los campos apuntan en direcciones distintas: suma por componentes.' },
          { when: 'signFlip', say: 'Revisa el sentido de $\\vec E_2$: se aleja de $q_2$ si es positiva y apunta hacia ella si es negativa.' }
        ],
        oracle: { lab: 'call', mod: 'efield', fn: 'field', field: 'mag', args: function (v) { return [twoQ(v), 0, v.h / 100]; } },
        hint: '$\\vec E_1$ es vertical. Para $\\vec E_2$, la dirección de $q_2$ a P es $(-d, h)/\\sqrt{d^2 + h^2}$; invierte si $q_2 < 0$.',
        solution: function (v) {
          var h = v.h / 100, d = v.d / 100, r2 = Math.sqrt(d * d + h * h), E1 = k * v.a * 1e-9 / (h * h), E2 = k * v.b * 1e-9 / (r2 * r2), sg = v.s ? 1 : -1;
          var Ex = sg * E2 * (-d / r2), Ey = E1 + sg * E2 * (h / r2);
          return '$E_1 = ' + fx(E1, 0) + '$ N/C hacia $+y$. $r_2 = ' + fx(r2, 4) + '$ m y $E_2 = ' + fx(E2, 0) + '$ N/C ' + (v.s ? 'alejándose de' : 'hacia') + ' $q_2$: $\\vec E_2 = (' + fx(Ex, 0) + ', ' + fx(sg * E2 * h / r2, 0) + ')$. ' +
            '$$\\vec E = (' + fx(Ex, 0) + ',\\ ' + fx(Ey, 0) + ')\\ \\text{N/C} \\quad |\\vec E| = ' + fx(netE(v, false), 0) + '\\ \\text{N/C}$$';
        }
      },
      {
        id: 'f2-s03-nulo', title: 'Dónde se anula el campo',
        vars: { a: [1, 9, 1], b: [1, 9, 1], s: [0, 1, 1], d: [10, 40, 5] },
        prompt: function (v) {
          return '<p>Una carga de $+' + v.a + '\\ \\text{nC}$ está en $x = 0$ y otra de $' + (v.s ? '+' : '-') + v.b + '\\ \\text{nC}$ en $x = ' + v.d + '$ cm. ¿En qué posición $x$ (en cm) del eje es cero el campo eléctrico? Puede ser negativa.</p>';
        },
        check: 'numeric', unit: 'cm',
        answer: nullX,
        mistakes: {
          noRoot: function (v) { return v.s ? v.d * v.a / (v.a + v.b) : -v.d * v.a / (v.b - v.a); }
        },
        feedback: [
          { when: 'noRoot', say: 'Al igualar $q_1/x^2 = q_2/(\\ldots)^2$ las distancias quedan al cuadrado: usa $\\sqrt{q_1}$ y $\\sqrt{q_2}$, no las cargas.' }
        ],
        oracle: { lab: 'call', mod: 'efield', fn: 'nullPoint', args: function (v) { return [v.a, 0, (v.s ? 1 : -1) * v.b, v.d]; } },
        hint: 'Mismo signo: entre las cargas. Signos opuestos: afuera, del lado de la menor. Iguala $k|q_1|/r_1^2 = k|q_2|/r_2^2$ y saca raíz.',
        solution: function (v) {
          var x = nullX(v);
          if (v.s) return 'Mismo signo: entre ellas. $\\dfrac{d - x}{x} = \\sqrt{\\dfrac{' + v.b + '}{' + v.a + '}}$, así que $$x = \\frac{' + v.d + '\\sqrt{' + v.a + '}}{\\sqrt{' + v.a + '} + \\sqrt{' + v.b + '}} = ' + fx(x) + '\\ \\text{cm}$$';
          return 'Signos opuestos: afuera, del lado de la de ' + (v.a < v.b ? '$+' + v.a + '$ nC (a la izquierda)' : '$-' + v.b + '$ nC (a la derecha)') + '. Con $\\dfrac{x - ' + v.d + '}{x} = \\sqrt{\\dfrac{' + v.b + '}{' + v.a + '}}$: $$x = ' + fx(x) + '\\ \\text{cm}$$';
        }
      },
      {
        id: 'f2-s03-aceleracion', title: 'Aceleración de un electrón',
        vars: { E: [1, 9, 1] },
        prompt: function (v) { return '<p>Un electrón está en un campo uniforme de $' + v.E + '.0 \\times 10^3\\ \\text{N/C}$. ¿Qué magnitud tiene su aceleración, en m/s²? Usa $e = 1.60 \\times 10^{-19}$ C y $m_e = 9.11 \\times 10^{-31}$ kg.</p>'; },
        check: 'numeric', unit: 'm/s²',
        answer: function (v) { return e * v.E * 1e3 / me; },
        mistakes: { protonMass: function (v) { return e * v.E * 1e3 / mp; } },
        feedback: [{ when: 'protonMass', say: 'Esa es la aceleración de un protón: usa la masa del electrón, $9.11 \\times 10^{-31}$ kg.' }],
        oracle: { lab: 'call', mod: 'efield', fn: 'plates', field: 'a', args: function (v) { return [{ q: -e, m: me, E: v.E * 1e3, v0: 1, L: 1 }]; } },
        hint: '$F = eE$ y $a = F/m_e$.',
        solution: function (v) { return '$$a = \\frac{eE}{m_e} = \\frac{(1.60 \\times 10^{-19})(' + v.E + ' \\times 10^3)}{9.11 \\times 10^{-31}} = ' + sci(e * v.E * 1e3 / me) + '\\ \\text{m/s}^2$$'; }
      },
      {
        id: 'f2-s03-deflexion', title: 'Electrón entre placas',
        vars: { E: [0.5, 3, 0.5], v0: [2, 6, 0.5], L: [2, 6, 1] },
        where: function (v) { return plateY(v, me) < 20; },
        prompt: function (v) {
          return '<p>Un electrón entra horizontal con $v_0 = ' + v.v0 + ' \\times 10^6$ m/s entre dos placas de $' + v.L + '$ cm de largo con un campo uniforme de $' + v.E + ' \\times 10^3$ N/C. ¿Cuántos <strong>milímetros</strong> se desvía al salir? Usa $e = 1.60 \\times 10^{-19}$ C y $m_e = 9.11 \\times 10^{-31}$ kg.</p>';
        },
        check: 'numeric', unit: 'mm',
        answer: function (v) { return plateY(v, me); },
        mistakes: {
          noHalf: function (v) { return 2 * plateY(v, me); },
          protonMass: function (v) { return plateY(v, mp); }
        },
        feedback: [
          { when: 'noHalf', say: 'Te faltó el ½: parte sin velocidad vertical, así que $y = \\tfrac{1}{2}at^2$.' },
          { when: 'protonMass', say: 'Usaste la masa del protón. Es un electrón: $m_e = 9.11 \\times 10^{-31}$ kg.' }
        ],
        oracle: { lab: 'call', mod: 'efield', fn: 'plates', field: 'mm', args: function (v) { return [{ q: -e, m: me, E: v.E * 1e3, v0: v.v0 * 1e6, L: v.L / 100 }]; } },
        hint: '$a = eE/m_e$, $t = L/v_0$ (con $L$ en metros) y $y = \\tfrac{1}{2}at^2$. Pasa a mm al final.',
        solution: function (v) {
          var a = e * v.E * 1e3 / me, t = (v.L / 100) / (v.v0 * 1e6);
          return '$a = ' + sci(a) + '$ m/s², $t = ' + sci(t) + '$ s. $$y = \\tfrac{1}{2}a t^2 = ' + sci(0.5 * a * t * t, 3) + '\\ \\text{m} = ' + fx(plateY(v, me)) + '\\ \\text{mm}$$';
        }
      },
      {
        id: 'f2-s03-lineas', title: 'Leer líneas de campo',
        vars: { n: [4, 12, 2], m: [2, 3, 1] },
        prompt: function (v) { return '<p>En un dibujo de líneas de campo, de la carga A salen ' + v.n + ' líneas y a la carga B llegan ' + (v.n * v.m) + '. ¿Qué puedes decir de sus cargas?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: '$q_B = -' + v.m + 'q_A$', correct: true },
            { text: '$q_B = +' + v.m + 'q_A$', say: 'Las líneas <em>llegan</em> a B: B es negativa.' },
            { text: '$q_B = -q_A/' + v.m + '$', say: 'Al revés: a B llegan más líneas, así que su carga es mayor en magnitud.' },
            { text: 'Tienen la misma magnitud', say: 'El número de líneas es proporcional a $|q|$: ' + (v.n * v.m) + ' contra ' + v.n + '.' }
          ];
        },
        answer: function (v) { return '$q_B = -' + v.m + 'q_A$'; },
        hint: 'Salen de las +, entran a las −, y el número es proporcional a la carga.',
        solution: function (v) { return 'A es positiva (salen líneas) y B negativa (llegan). La razón ' + (v.n * v.m) + '/' + v.n + ' = ' + v.m + ' da $q_B = -' + v.m + 'q_A$.'; }
      },
      {
        id: 'f2-s03-cruce', title: 'Concepto: ¿se cruzan?',
        vars: {},
        prompt: function () { return '<p>¿Por qué dos líneas de campo eléctrico nunca se cruzan?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'En cada punto el campo tiene una sola dirección', correct: true },
            { text: 'Porque se repelen entre sí', say: 'Las líneas no son objetos que se empujen; son un dibujo del campo.' },
            { text: 'Porque siempre son rectas', say: 'Las del dipolo son curvas y aun así no se cruzan.' },
            { text: 'Sí se cruzan donde el campo es muy intenso', say: 'Si se cruzaran, en ese punto E apuntaría en dos direcciones a la vez.' }
          ];
        },
        answer: function () { return 'En cada punto el campo tiene una sola dirección'; },
        hint: 'La línea es tangente a $\\vec E$ en cada punto.',
        solution: function () { return 'La línea es tangente a $\\vec E$. Si dos se cruzaran, en ese punto habría dos tangentes, o sea dos direcciones para un solo vector $\\vec E$.'; }
      }
    ],

    quiz: { tags: ['f2.S03'], count: 8 },

    errors: [
      'Dejar $r$ en centímetros: el campo sale $10^4$ veces más chico.',
      'Olvidar elevar $r$ al cuadrado en $kq/r^2$.',
      'Sumar magnitudes de campos que apuntan en direcciones distintas.',
      'Usar el signo de la carga en la magnitud y luego otra vez en la dirección (o ignorarlo del todo).',
      'Pensar que el electrón se desvía hacia la placa negativa: la fuerza sobre una carga negativa es opuesta a $\\vec E$.',
      'Buscar el punto nulo entre dos cargas de signo opuesto: ahí los campos se suman.'
    ],

    teacher: {
      plan: [
        'Arranca con la analogía de $g$ como «fuerza por kilogramo» y deriva $\\vec E = kQ\\hat r/r^2$ desde Coulomb.',
        'Superposición con el triángulo 3-4-5 del explainer; que dibujen los vectores antes de calcular.',
        'Lab en modo cargas: que expliquen con las líneas dónde el campo es fuerte y dónde se anula.',
        'Cierra con el electrón entre placas y compáralo con el tiro parabólico de Física 1.'
      ],
      check: [
        'Que conviertan cm a m y nC a C antes de sustituir.',
        'Que decidan el sentido de cada campo con un dibujo y no con el signo de la fórmula.'
      ],
      note: 'La distribución continua de carga (varillas, anillos, discos) es la sesión siguiente; aquí todo son cargas puntuales.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §5.4 “Electric Field”. <a href="https://openstax.org/books/university-physics-volume-2/pages/5-4-electric-field">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §5.6 “Electric Field Lines”. <a href="https://openstax.org/books/university-physics-volume-2/pages/5-6-electric-field-lines">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-02',
    next: 'sesion-04'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex, ex.where); });
})();
