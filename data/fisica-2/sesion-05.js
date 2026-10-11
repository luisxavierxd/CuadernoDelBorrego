/* =====================================================================
   Física 2 · S05 · Energía potencial eléctrica y potencial de cargas puntuales
   (bloque A · Electrostática).
   Fuente: OpenStax, University Physics Volume 2, §7.1 y §7.2 (CC BY-NC-SA 4.0).
   k = 8.99 × 10⁹ N·m²/C², e = 1.60 × 10⁻¹⁹ C, SI.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.potential (lab potential-work).
   ===================================================================== */
(function () {
  var k = 8.99e9, e = 1.60e-19, mP = 1.67e-27, mE = 9.11e-31;
  var KTX = '$k = 8.99\\times 10^{9}\\ \\text{N}\\cdot\\text{m}^2/\\text{C}^2$';
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  // Número en notación científica para LaTeX: 2.65 \times 10^{7}.
  function sci(v, d) {
    if (v === 0) return '0';
    var n = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, n);
    if (Math.abs(m) >= 9.995) { m /= 10; n += 1; }
    return fx(m, d == null ? 2 : d) + '\\times 10^{' + n + '}';
  }
  function sq(x) { return (x < 0 ? '-' : '') + Math.abs(x); }       // carga con signo
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (m) { return ex.mistakes[m](v); }));
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) {
          if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]))) return false;
        }
      }
      return true;
    };
  }

  // Ejemplo 1: un par de cargas.
  var e1 = { q1: 3, q2: -2, r: 5 }; e1.U = k * e1.q1 * 1e-6 * e1.q2 * 1e-6 / (e1.r / 100);
  // Ejemplo 2: triángulo equilátero de 10 cm con +2, +2 y −3 μC.
  var e2 = { a: 0.10, q: [2e-6, 2e-6, -3e-6] };
  e2.W2 = k * e2.q[0] * e2.q[1] / e2.a; e2.W3 = k * e2.q[2] * (e2.q[0] + e2.q[1]) / e2.a; e2.U = e2.W2 + e2.W3;
  e2.ch = [{ q: e2.q[0], x: 0, y: 0 }, { q: e2.q[1], x: e2.a, y: 0 }, { q: e2.q[2], x: e2.a / 2, y: e2.a * Math.sqrt(3) / 2 }];
  // Ejemplo 3: potencial en P = (0, 8 cm) con +4 μC en el origen y −2 μC en (6 cm, 0).
  var e3 = { ch: [{ q: 4e-6, x: 0, y: 0 }, { q: -2e-6, x: 0.06, y: 0 }], P: { x: 0, y: 0.08 } };
  e3.V1 = k * 4e-6 / 0.08; e3.V2 = k * -2e-6 / 0.10; e3.V = e3.V1 + e3.V2;
  // Ejemplo 4: llevar +1 μC de P al punto medio M = (3 cm, 0).
  var e4 = { q: 1e-6, M: { x: 0.03, y: 0 } };
  e4.VM = k * 4e-6 / 0.03 + k * -2e-6 / 0.03; e4.dV = e4.VM - e3.V; e4.W = -e4.q * e4.dV;
  // Ejemplo 5: electrón acelerado desde el reposo por 2000 V.
  var e5 = { dv: 2000 }; e5.K = e * e5.dv; e5.v = Math.sqrt(2 * e5.K / mE);

  var data = window.SESSION_DATA = {
    slug: 'sesion-05', number: '05', group: 'A · Electrostática',
    title: 'Energía potencial eléctrica y potencial de cargas puntuales', temario: [],
    minutes: 180,
    quote: 'El potencial es un mapa de alturas para las cargas: las positivas ruedan hacia abajo y las negativas hacia arriba.',
    badges: [
      'Calcular la energía potencial $U = kq_1q_2/r$ de un par y de un sistema de cargas.',
      'Calcular el potencial $V = kq/r$ de varias cargas sumando escalares con signo.',
      'Relacionar el trabajo del campo con la diferencia de potencial: $W = -q\\,\\Delta V$.',
      'Usar la conservación de la energía para hallar la rapidez de una carga acelerada.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'La fuerza eléctrica, como el peso, es <strong>conservativa</strong>: su trabajo se puede guardar como energía potencial. Dividida entre la carga, esa energía es el <strong>potencial</strong>, un número (sin dirección) en cada punto.',
        recall: [
          'Ley de Coulomb: $F = k|q_1q_2|/r^2$ (S02).',
          'Campo eléctrico de cargas puntuales y superposición (S03).',
          'Trabajo, energía potencial y conservación de la energía (Física 1, S12 y S13).'
        ],
        why: 'Los volts de una pila, un contacto o un rayo son diferencias de potencial. Con ellas se calcula qué tan rápido sale un electrón en un tubo de rayos X, cuánta energía mueve un chip o por qué un rayo cae donde cae.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Junta dos imanes por los polos que se repelen: tienes que empujar, y si los sueltas salen disparados. El trabajo que hiciste no se perdió: quedó <strong>guardado</strong> y se devuelve como movimiento. Con dos cargas del mismo signo pasa exactamente eso.',
          'Ahora piensa en subir una mochila a un estante: no importa si la subes en línea recta o dando vueltas, la energía guardada depende solo de la altura final. Con las cargas, la «altura» se llama <strong>potencial eléctrico</strong> y se mide en volts.',
          'Una pila de 1.5 V dice justo eso: cada coulomb que pasa por ella gana 1.5 joules. Por eso el voltaje es «energía por unidad de carga».'
        ]
      },
      {
        type: 'concept', heading: 'La fuerza eléctrica es conservativa', short: 'Fuerza conservativa',
        body: [
          'Mueve una carga de prueba $q$ de A a B cerca de una carga fija $Q$. El trabajo de la fuerza eléctrica <strong>no depende del camino</strong>: por la recta o por la curva sale el mismo. Y en un camino cerrado (salir de A y volver a A) el trabajo total es cero.',
          'Por eso se puede definir una energía potencial $U$, igual que con el peso en <a href="../../../fisica-1/sesiones/sesion-13/">Física 1 · S13</a>: $$W_{A\\to B} = -\\Delta U = -(U_B - U_A)$$ Si el campo hace trabajo positivo, la energía potencial baja (y la carga gana energía cinética).'
        ],
        diagram: 'f2s05-paths',
        caption: 'Dos caminos de A a B en el campo de $Q$. La fuerza cambia a lo largo de cada uno, pero el trabajo total es el mismo. Compruébalo en el lab dibujando tu propio camino.'
      },
      {
        type: 'explainer', heading: 'De la fuerza a la energía potencial', short: 'U de un par de cargas',
        title: 'Alejar q de Q',
        intro: 'Calculemos el trabajo cuando $q$ se aleja en línea recta de $Q$. La fuerza cambia con $r$, así que el trabajo es un área bajo la curva $F(r)$: una integral.',
        diagram: 'f2s05-work',
        steps: [
          { text: 'En $r_A$ la fuerza de Coulomb empuja a $q$ hacia afuera (ambas positivas): $F = \\dfrac{kQq}{r^2}$. Mientras más lejos, más débil.', state: { u: 0, inf: 0, show: 'force' } },
          { text: '$q$ se mueve de $r_A$ a $r_B$. El trabajo es el área bajo $F(r)$: $W = \\int_{r_A}^{r_B} \\frac{kQq}{r^2}\\,dr$.', state: { u: 1, inf: 0, show: 'area' } },
          { text: 'La integral de $1/r^2$ es $-1/r$: $$W = kQq\\left(\\frac{1}{r_A} - \\frac{1}{r_B}\\right) = -\\Delta U$$ Así que la energía potencial es $U(r) = kQq/r$ (más una constante).', state: { u: 1, inf: 0, show: 'w' } },
          { text: 'Elegimos $U = 0$ cuando las cargas están infinitamente separadas ($r_B \\to \\infty$). Queda $$U = \\frac{k\\,q_1q_2}{r}$$ con los signos de las cargas: positiva si se repelen, negativa si se atraen.', state: { u: 1, inf: 1, show: 'inf' } }
        ]
      },
      {
        type: 'callout', heading: 'Lo mismo que la gravedad (con un detalle)',
        body: [
          'La gravitación da $U_g = -\\dfrac{GMm}{r}$: siempre negativa, porque las masas solo se atraen. La eléctrica da $U = \\dfrac{kq_1q_2}{r}$, y el signo lo ponen las cargas: <strong>positiva</strong> si son del mismo signo (se repelen) y <strong>negativa</strong> si son de signo opuesto (se atraen).',
          'El $mgh$ de Física 1 es la versión «cerca del suelo» de la gravitacional, igual que $\\Delta V = -Ed$ es la versión de un campo uniforme. Ojo: $U$ va con $1/r$, no con $1/r^2$; el $r^2$ es de la fuerza.'
        ]
      },
      {
        type: 'explainer', heading: 'Energía de un sistema de cargas', short: 'Sistema de cargas',
        title: 'Armar el sistema carga por carga',
        intro: '¿Cuánta energía guarda un grupo de cargas? La que costó armarlo: trae las cargas una por una desde muy lejos y suma el trabajo que hiciste.',
        diagram: 'f2s05-assemble',
        steps: [
          { text: 'La primera carga llega gratis: no hay nada que la empuje. $W_1 = 0$.', state: { n: 'a', u2: 0, u3: 0 } },
          { text: 'La segunda siente a la primera: $W_2 = \\dfrac{kq_1q_2}{r_{12}}$.', state: { n: 'b', u2: 1, u3: 0 } },
          { text: 'La tercera siente a las dos: $W_3 = kq_3\\left(\\dfrac{q_1}{r_{13}} + \\dfrac{q_2}{r_{23}}\\right)$.', state: { n: 'c', u2: 1, u3: 1 } },
          { text: 'En total aparece <strong>un término por cada par</strong>, contado una sola vez: $$U = k\\left(\\frac{q_1q_2}{r_{12}} + \\frac{q_1q_3}{r_{13}} + \\frac{q_2q_3}{r_{23}}\\right)$$ El orden en que las traes no importa.', state: { n: 'd', u2: 1, u3: 1 } }
        ]
      },
      {
        type: 'concept', heading: 'Potencial eléctrico', short: 'Potencial V',
        body: [
          'La energía de una carga de prueba $q_0$ depende de $q_0$. Si la divides entre $q_0$, queda algo que solo depende del lugar: el <strong>potencial eléctrico</strong> $$V = \\frac{U}{q_0}\\qquad [\\text{V}] = \\text{J/C}$$',
          'Para una carga puntual, $V = \\dfrac{kq}{r}$ (con $V = 0$ lejísimos). Con varias cargas, <strong>se suman los potenciales con su signo</strong>: $$V_P = \\sum_i \\frac{kq_i}{r_i}$$ Es una suma de números, sin componentes ni ángulos: mucho más fácil que sumar campos.',
          'Una carga negativa aporta potencial negativo. Si tienes el potencial, la energía de cualquier carga que pongas ahí es $U = qV$.'
        ],
        diagram: 'f2s05-superposition',
        caption: 'Para $V$ solo importan las distancias $r_1$, $r_2$, $r_3$ y el signo de cada carga. No hay flechas que sumar: $V$ es un escalar.'
      },
      {
        type: 'concept', heading: 'Diferencia de potencial y trabajo', short: 'ΔV y trabajo',
        body: [
          'Lo que tiene sentido físico es la <strong>diferencia de potencial</strong> $\\Delta V = V_B - V_A$ (el «voltaje»). Con ella el trabajo del campo sobre $q$ de A a B es $$W_{A\\to B} = -q\\,\\Delta V \\qquad \\Delta U = q\\,\\Delta V$$',
          'Si alguien mueve la carga despacio (sin cambiar su rapidez), el trabajo <strong>externo</strong> es el contrario: $W_{ext} = +q\\,\\Delta V$. Traer $q$ desde el infinito hasta un punto cuesta $W_{ext} = qV$.',
          'En un campo uniforme $E$, moverse una distancia $d$ en la dirección del campo baja el potencial: $\\Delta V = -Ed$. Por eso $E$ también se mide en V/m.'
        ]
      },
      {
        type: 'callout', heading: 'El signo, sin memorizar',
        body: [
          'Una carga <strong>positiva</strong> soltada se va hacia donde $V$ <strong>baja</strong> (como una pelota cuesta abajo). Una carga <strong>negativa</strong> se va hacia donde $V$ <strong>sube</strong>. En ambos casos el campo hace trabajo positivo y la carga gana energía cinética.',
          'Conservación de la energía: $K_A + qV_A = K_B + qV_B$. Un electrón (o un protón) que cruza $\\Delta V = 1\\ \\text{V}$ gana $1\\ \\text{eV} = 1.60\\times 10^{-19}\\ \\text{J}$, el <strong>electronvolt</strong>.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: energía, potencial y trabajo', short: 'Receta',
        steps: [
          { text: 'Pasa todo a SI: μC → $\\times 10^{-6}$ C, nC → $\\times 10^{-9}$ C, cm → $\\times 10^{-2}$ m.', tip: 'Olvidar pasar los centímetros a metros da un resultado 100 veces más chico.' },
          { text: 'Mide cada distancia $r$ de cada carga al punto (o entre cada par). Usa Pitágoras si no están alineadas.' },
          { text: 'Potencial en un punto: suma $kq_i/r_i$ con el signo de cada carga. Energía de un sistema: suma $kq_iq_j/r_{ij}$ una vez por cada par.', tip: 'Va $r$, no $r^2$. El $r^2$ es de la fuerza y del campo.' },
          { text: 'Trabajo del campo de A a B: $W = -q(V_B - V_A)$. El trabajo externo es el contrario.' },
          { text: 'Rapidez: conservación de la energía, $\\tfrac{1}{2}mv^2 = \\tfrac{1}{2}mv_0^2 - q\\,\\Delta V$. Revisa que la carga vaya «cuesta abajo» para ella.' }
        ]
      },
      {
        type: 'example', heading: 'Energía de un par de cargas',
        problem: '<p>Una carga de $' + e1.q1 + '\\ \\mu\\text{C}$ y otra de $' + e1.q2 + '\\ \\mu\\text{C}$ están a $' + e1.r + '\\ \\text{cm}$. ¿Cuál es la energía potencial del par? ¿Qué significa su signo? (' + KTX + '.)</p>',
        steps: [
          { text: 'Pasa a SI: $q_1 = 3\\times 10^{-6}$ C, $q_2 = -2\\times 10^{-6}$ C, $r = 0.05$ m.' },
          { text: 'Aplica $U = kq_1q_2/r$ con los signos.', math: 'U = \\frac{(8.99\\times 10^{9})(3\\times 10^{-6})(-2\\times 10^{-6})}{0.05} = ' + fx(e1.U, 4) + '\\ \\text{J}' },
          { text: 'Es negativa porque se atraen: para separarlas hasta el infinito hay que hacer un trabajo externo de $' + fx(-e1.U, 4) + '$ J.' }
        ],
        answer: '$U \\approx ' + fx(e1.U) + '\\ \\text{J}$.',
        verify: { lab: 'call', mod: 'potential', fn: 'pairU', args: [e1.q1 * 1e-6, e1.q2 * 1e-6, e1.r / 100], value: e1.U }
      },
      {
        type: 'example', heading: 'Un triángulo de cargas',
        problem: '<p>Tres cargas, $+2\\ \\mu\\text{C}$, $+2\\ \\mu\\text{C}$ y $-3\\ \\mu\\text{C}$, están en los vértices de un triángulo equilátero de $10\\ \\text{cm}$ de lado. ¿Cuánta energía potencial tiene el sistema? (' + KTX + '.)</p>',
        steps: [
          { text: 'Tres cargas, tres pares, todos a $a = 0.10$ m.', math: 'U = \\frac{k}{a}\\left(q_1q_2 + q_1q_3 + q_2q_3\\right)' },
          { text: 'Suma los productos con signo (en $\\mu\\text{C}^2$): $(2)(2) + (2)(-3) + (2)(-3) = -8$.', math: 'U = \\frac{(8.99\\times 10^{9})(-8\\times 10^{-12})}{0.10} = ' + fx(e2.U, 4) + '\\ \\text{J}' },
          { text: 'Compruébalo armándolo: traer la segunda cuesta $W_2 = ' + fx(e2.W2, 4) + '$ J y la tercera $W_3 = ' + fx(e2.W3, 4) + '$ J. La suma da lo mismo.' }
        ],
        answer: '$U \\approx ' + fx(e2.U) + '\\ \\text{J}$: el sistema está «amarrado»; desarmarlo cuesta $' + fx(-e2.U) + '$ J.',
        verify: { lab: 'call', mod: 'potential', fn: 'systemU', args: [e2.ch], value: e2.U }
      },
      {
        type: 'example', heading: 'Potencial en un punto con dos cargas',
        problem: '<p>Hay $+4\\ \\mu\\text{C}$ en el origen y $-2\\ \\mu\\text{C}$ en $(6\\ \\text{cm}, 0)$. ¿Cuál es el potencial en $P = (0, 8\\ \\text{cm})$? (' + KTX + '.)</p>',
        steps: [
          { text: 'Distancias: $r_1 = 0.08$ m; $r_2 = \\sqrt{0.06^2 + 0.08^2} = 0.10$ m.' },
          { text: 'Aporte de cada carga, con su signo.', math: 'V_1 = \\frac{k(4\\times 10^{-6})}{0.08} = ' + fx(e3.V1, 0) + '\\ \\text{V} \\qquad V_2 = \\frac{k(-2\\times 10^{-6})}{0.10} = ' + fx(e3.V2, 0) + '\\ \\text{V}' },
          { text: 'Suma de escalares: sin componentes.', math: 'V_P = ' + fx(e3.V1, 0) + ' + (' + fx(e3.V2, 0) + ') = ' + fx(e3.V, 0) + '\\ \\text{V}' }
        ],
        answer: '$V_P \\approx ' + fx(e3.V / 1000, 1) + '\\ \\text{kV}$.',
        verify: { lab: 'call', mod: 'potential', fn: 'V', args: [e3.ch, e3.P.x, e3.P.y], value: e3.V }
      },
      {
        type: 'example', heading: 'Trabajo para mover una carga',
        problem: '<p>Con las mismas dos cargas, una carga de prueba de $+1\\ \\mu\\text{C}$ se lleva de $P = (0, 8\\ \\text{cm})$ al punto medio $M = (3\\ \\text{cm}, 0)$. ¿Cuánto trabajo hace el campo? ¿Y quien la empuja despacio?</p>',
        steps: [
          { text: 'Potencial en $M$: las dos cargas están a $0.03$ m.', math: 'V_M = \\frac{k(4\\times 10^{-6})}{0.03} + \\frac{k(-2\\times 10^{-6})}{0.03} = ' + fx(e4.VM, 0) + '\\ \\text{V}' },
          { text: 'Diferencia de potencial.', math: '\\Delta V = V_M - V_P = ' + fx(e4.dV, 0) + '\\ \\text{V}' },
          { text: 'Trabajo del campo.', math: 'W = -q\\,\\Delta V = -(1\\times 10^{-6})(' + fx(e4.dV, 0) + ') = ' + fx(e4.W, 4) + '\\ \\text{J}' },
          { text: 'Es negativo: la carga positiva va hacia mayor potencial («cuesta arriba»). Quien la empuja hace $+' + fx(-e4.W, 4) + '$ J, por el camino que sea.' }
        ],
        answer: '$W_{campo} \\approx ' + fx(e4.W) + '\\ \\text{J}$ y $W_{ext} \\approx +' + fx(-e4.W) + '\\ \\text{J}$.',
        verify: { lab: 'call', mod: 'potential', fn: 'workAB', args: [e3.ch, e4.q, e3.P, e4.M], value: e4.W }
      },
      {
        type: 'example', heading: 'Un electrón acelerado',
        problem: '<p>Un electrón parte del reposo y cruza una diferencia de potencial de $' + e5.dv + '\\ \\text{V}$ (de la placa a $0\\ \\text{V}$ a la de $+' + e5.dv + '\\ \\text{V}$). ¿Cuánta energía cinética gana y con qué rapidez llega? ($e = 1.60\\times 10^{-19}\\ \\text{C}$, $m_e = 9.11\\times 10^{-31}\\ \\text{kg}$.)</p>',
        diagram: 'f2s05-accel', state: { dv: e5.dv },
        steps: [
          { text: 'La carga es $q = -e$ y $\\Delta V = +' + e5.dv + '$ V: $\\Delta U = q\\Delta V < 0$, así que gana energía cinética.', math: 'K = -q\\,\\Delta V = e\\,\\Delta V = ' + e5.dv + '\\ \\text{eV} = ' + sci(e5.K, 2) + '\\ \\text{J}' },
          { text: 'Despeja la rapidez de $\\tfrac{1}{2}mv^2 = K$.', math: 'v = \\sqrt{\\frac{2K}{m_e}} = \\sqrt{\\frac{2(' + sci(e5.K, 2) + ')}{9.11\\times 10^{-31}}} = ' + sci(e5.v, 3) + '\\ \\text{m/s}' },
          { text: 'Casi el 9 % de la rapidez de la luz con solo 2000 V: la masa del electrón es diminuta.' }
        ],
        answer: '$K = ' + e5.dv + '\\ \\text{eV}$ y $v \\approx ' + sci(e5.v, 2) + '\\ \\text{m/s}$.',
        verify: { lab: 'call', mod: 'potential', fn: 'speed', args: [-e, mE, e5.dv, 0], value: e5.v }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿El potencial y la energía potencial son lo mismo?', a: 'No. $U$ es energía de una carga (en joules) y depende de cuánto vale esa carga. $V = U/q$ es energía por coulomb (en volts) y solo depende del lugar.' },
          { q: '¿Por qué aquí va $r$ y no $r^2$?', a: 'Porque $U$ y $V$ salen de integrar la fuerza: $\\int dr/r^2 = -1/r$. La fuerza y el campo van con $1/r^2$; la energía y el potencial, con $1/r$.' },
          { q: '¿Cómo sumo los potenciales de varias cargas?', a: 'Como números con signo: $V = kq_1/r_1 + kq_2/r_2 + \\dots$ Nada de componentes ni ángulos. Una carga negativa resta.' },
          { q: 'Si el campo vale cero en un punto, ¿el potencial también?', a: 'No necesariamente. A la mitad de dos cargas iguales $E = 0$ pero $V = 2kq/(d/2) \\neq 0$. Y a la mitad de $+q$ y $-q$ es al revés: $V = 0$ pero $E \\neq 0$.' },
          { q: '¿Una energía potencial negativa es «poca» energía?', a: 'Es menos que la del sistema desarmado ($U = 0$). Que sea negativa significa que las cargas se atraen y hay que hacer trabajo para separarlas.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Par de cargas: $U = kq_1q_2/r$, con signos; sistema: un término por par.',
          'Potencial: $V = \\sum kq_i/r_i$, una suma de escalares con signo.',
          'Trabajo del campo: $W = -q\\,\\Delta V$; no depende del camino.',
          'Conservación: $K_A + qV_A = K_B + qV_B$; $1\\ \\text{eV} = 1.60\\times 10^{-19}\\ \\text{J}$.'
        ]
      }
    ],

    lab: {
      type: 'potential-work', title: 'Trabajo al mover una carga',
      intro: 'Arrastra las cargas fijas, los puntos A y B y los puntos de paso, o dibuja tu propio camino. El lab integra $W = \\int \\vec F\\cdot d\\vec l$ sobre tu camino y lo compara con $-q\\,\\Delta V$: dan lo mismo por cualquier camino. Luego calcula $V_A$, $V_B$ o el trabajo a mano y compruébalo; el lab detecta el signo al revés, el $r^2$ del campo, la suma sin signos y la carga olvidada.',
      cfg: { start: { charges: [{ q: 3, x: -3, y: 0 }, { q: -2, x: 3, y: 0 }], q: 1, A: [-7, 3], B: [7, 3] } }
    },

    formulas: [
      { label: 'Energía de un par', tex: 'U = \\frac{kq_1q_2}{r}' },
      { label: 'Sistema de cargas', tex: 'U = \\sum_{i<j} \\frac{kq_iq_j}{r_{ij}}' },
      { label: 'Potencial', tex: 'V = \\frac{U}{q_0} = \\sum_i \\frac{kq_i}{r_i}' },
      { label: 'Trabajo del campo', tex: 'W_{A\\to B} = -\\Delta U = -q\\,\\Delta V' },
      { label: 'Campo uniforme', tex: '\\Delta V = -Ed' },
      { label: 'Conservación', tex: 'K_A + qV_A = K_B + qV_B' },
      { label: 'Electronvolt', tex: '1\\ \\text{eV} = 1.60\\times 10^{-19}\\ \\text{J}' },
      { label: 'Constante', tex: 'k = 8.99\\times 10^{9}\\ \\text{N}\\cdot\\text{m}^2/\\text{C}^2' }
    ],

    exercises: [
      {
        id: 'f2-s05-par', title: 'Energía de un par',
        vars: { q1: [1, 6, 0.5], q2: [-6, 6, 0.5], r: [2, 20, 1] },
        baseWhere: function (v) { return v.q2 !== 0; },
        prompt: function (v) { return '<p>Una carga de $' + v.q1 + '\\ \\mu\\text{C}$ y otra de $' + sq(v.q2) + '\\ \\mu\\text{C}$ están separadas $' + v.r + '\\ \\text{cm}$. ¿Cuál es la energía potencial eléctrica del par, con su signo? (' + KTX + '.)</p>'; },
        check: 'numeric', unit: 'J',
        answer: function (v) { return k * v.q1 * 1e-6 * v.q2 * 1e-6 / (v.r / 100); },
        mistakes: {
          sign: function (v) { return -k * v.q1 * 1e-6 * v.q2 * 1e-6 / (v.r / 100); },
          r2: function (v) { return k * v.q1 * 1e-6 * v.q2 * 1e-6 / Math.pow(v.r / 100, 2); },
          cm: function (v) { return k * v.q1 * 1e-6 * v.q2 * 1e-6 / v.r; }
        },
        feedback: [
          { when: 'sign', say: 'Revisa el signo: $U = kq_1q_2/r$ es positiva si las cargas tienen el mismo signo y negativa si tienen signos opuestos.' },
          { when: 'r2', say: 'La energía va con $1/r$, no con $1/r^2$: el $r^2$ es de la fuerza.' },
          { when: 'cm', say: 'Pasa los centímetros a metros antes de dividir.' }
        ],
        oracle: { lab: 'call', mod: 'potential', fn: 'pairU', args: function (v) { return [v.q1 * 1e-6, v.q2 * 1e-6, v.r / 100]; } },
        hint: '$U = \\dfrac{kq_1q_2}{r}$, con las cargas en coulombs (con signo) y $r$ en metros.',
        solution: function (v) { var U = k * v.q1 * 1e-6 * v.q2 * 1e-6 / (v.r / 100); return '$$U = \\frac{(8.99\\times 10^{9})(' + v.q1 + '\\times 10^{-6})(' + sq(v.q2) + '\\times 10^{-6})}{' + fx(v.r / 100) + '} = ' + fx(U, 4) + '\\ \\text{J}$$'; }
      },
      {
        id: 'f2-s05-triangulo', title: 'Triángulo de cargas',
        vars: { q1: [-5, 5, 1], q2: [-5, 5, 1], q3: [-5, 5, 1], a: [3, 15, 1] },
        baseWhere: function (v) { return v.q1 && v.q2 && v.q3 && (v.q1 * v.q2 + v.q1 * v.q3 + v.q2 * v.q3) !== 0; },
        prompt: function (v) { return '<p>Tres cargas, $q_1 = ' + sq(v.q1) + '\\ \\mu\\text{C}$, $q_2 = ' + sq(v.q2) + '\\ \\mu\\text{C}$ y $q_3 = ' + sq(v.q3) + '\\ \\mu\\text{C}$, están en los vértices de un triángulo equilátero de $' + v.a + '\\ \\text{cm}$ de lado. ¿Cuál es la energía potencial del sistema? (' + KTX + '.)</p>'; },
        check: 'numeric', unit: 'J',
        answer: function (v) { return k * (v.q1 * v.q2 + v.q1 * v.q3 + v.q2 * v.q3) * 1e-12 / (v.a / 100); },
        mistakes: {
          double: function (v) { return 2 * k * (v.q1 * v.q2 + v.q1 * v.q3 + v.q2 * v.q3) * 1e-12 / (v.a / 100); },
          r2: function (v) { return k * (v.q1 * v.q2 + v.q1 * v.q3 + v.q2 * v.q3) * 1e-12 / Math.pow(v.a / 100, 2); },
          abs: function (v) { return k * (Math.abs(v.q1 * v.q2) + Math.abs(v.q1 * v.q3) + Math.abs(v.q2 * v.q3)) * 1e-12 / (v.a / 100); }
        },
        feedback: [
          { when: 'double', say: 'Contaste cada par dos veces. Con tres cargas hay tres pares: 12, 13 y 23.' },
          { when: 'r2', say: 'La energía va con $1/r$, no con $1/r^2$.' },
          { when: 'abs', say: 'Cada producto $q_iq_j$ lleva su signo: los pares que se atraen restan.' }
        ],
        oracle: { lab: 'call', mod: 'potential', fn: 'systemU', args: function (v) { var a = v.a / 100; return [[{ q: v.q1 * 1e-6, x: 0, y: 0 }, { q: v.q2 * 1e-6, x: a, y: 0 }, { q: v.q3 * 1e-6, x: a / 2, y: a * Math.sqrt(3) / 2 }]]; } },
        hint: 'Un término $kq_iq_j/a$ por cada uno de los tres pares, con su signo.',
        solution: function (v) { var s = v.q1 * v.q2 + v.q1 * v.q3 + v.q2 * v.q3; return 'Suma de productos: $(' + sq(v.q1) + ')(' + sq(v.q2) + ') + (' + sq(v.q1) + ')(' + sq(v.q3) + ') + (' + sq(v.q2) + ')(' + sq(v.q3) + ') = ' + s + '\\ \\mu\\text{C}^2$. $$U = \\frac{(8.99\\times 10^{9})(' + s + '\\times 10^{-12})}{' + fx(v.a / 100) + '} = ' + fx(k * s * 1e-12 / (v.a / 100), 4) + '\\ \\text{J}$$'; }
      },
      {
        id: 'f2-s05-potencial', title: 'Potencial por superposición',
        vars: { q1: [1, 9, 1], q2: [-9, -1, 1], a: [3, 10, 1], b: [3, 10, 1] },
        prompt: function (v) { return '<p>Hay una carga de $' + v.q1 + '\\ \\text{nC}$ en el origen y otra de $' + v.q2 + '\\ \\text{nC}$ en $(' + v.a + '\\ \\text{cm}, 0)$. ¿Cuál es el potencial en $P = (0, ' + v.b + '\\ \\text{cm})$, en volts? (' + KTX + '.)</p>'; },
        check: 'numeric', unit: 'V',
        answer: function (v) { return k * 1e-9 * (v.q1 / (v.b / 100) + v.q2 / (Math.hypot(v.a, v.b) / 100)); },
        mistakes: {
          usedA: function (v) { return k * 1e-9 * (v.q1 / (v.b / 100) + v.q2 / (v.a / 100)); },
          abs: function (v) { return k * 1e-9 * (v.q1 / (v.b / 100) - v.q2 / (Math.hypot(v.a, v.b) / 100)); },
          r2: function (v) { return k * 1e-9 * (v.q1 / Math.pow(v.b / 100, 2) + v.q2 / Math.pow(Math.hypot(v.a, v.b) / 100, 2)); }
        },
        feedback: [
          { when: 'usedA', say: 'La distancia de la segunda carga a $P$ no es $a$: es $\\sqrt{a^2 + b^2}$.' },
          { when: 'abs', say: 'La carga negativa aporta potencial negativo: resta.' },
          { when: 'r2', say: 'El potencial va con $1/r$, no con $1/r^2$.' }
        ],
        oracle: { lab: 'call', mod: 'potential', fn: 'V', args: function (v) { return [[{ q: v.q1 * 1e-9, x: 0, y: 0 }, { q: v.q2 * 1e-9, x: v.a / 100, y: 0 }], 0, v.b / 100]; } },
        hint: '$V_P = kq_1/r_1 + kq_2/r_2$ con $r_1 = b$ y $r_2 = \\sqrt{a^2 + b^2}$, en metros.',
        solution: function (v) { var r2 = Math.hypot(v.a, v.b) / 100, V1 = k * v.q1 * 1e-9 / (v.b / 100), V2 = k * v.q2 * 1e-9 / r2; return '$r_1 = ' + fx(v.b / 100) + '$ m, $r_2 = ' + fx(r2, 4) + '$ m. $$V_P = ' + fx(V1, 1) + ' + (' + fx(V2, 1) + ') = ' + fx(V1 + V2, 1) + '\\ \\text{V}$$'; }
      },
      {
        id: 'f2-s05-trabajo', title: 'Trabajo entre dos puntos',
        vars: { Q: [-5, 5, 1], q: [-5, 5, 1], rA: [2, 10, 1], rB: [2, 20, 1] },
        baseWhere: function (v) { return v.Q && v.q && v.rA !== v.rB; },
        prompt: function (v) { return '<p>Una carga fija $Q = ' + sq(v.Q) + '\\ \\mu\\text{C}$. Una carga $q = ' + sq(v.q) + '\\ \\mu\\text{C}$ se mueve de un punto a $' + v.rA + '\\ \\text{cm}$ de $Q$ a otro a $' + v.rB + '\\ \\text{cm}$. ¿Cuánto trabajo hace la fuerza eléctrica? (' + KTX + '.)</p>'; },
        check: 'numeric', unit: 'J',
        answer: function (v) { return k * v.Q * v.q * 1e-12 * (100 / v.rA - 100 / v.rB); },
        mistakes: {
          sign: function (v) { return -k * v.Q * v.q * 1e-12 * (100 / v.rA - 100 / v.rB); },
          r2: function (v) { return k * v.Q * v.q * 1e-12 * (1e4 / (v.rA * v.rA) - 1e4 / (v.rB * v.rB)); },
          noQ: function (v) { return -k * v.Q * 1e-6 * (100 / v.rB - 100 / v.rA); }
        },
        feedback: [
          { when: 'sign', say: 'Ese es el trabajo externo (o el signo al revés). El del campo es $W = -q(V_B - V_A)$.' },
          { when: 'r2', say: 'El potencial va con $1/r$, no con $1/r^2$.' },
          { when: 'noQ', say: 'Ese número es $-\\Delta V$ en volts: multiplica por la carga $q$ en coulombs.' }
        ],
        oracle: { lab: 'call', mod: 'potential', fn: 'workAB', args: function (v) { return [[{ q: v.Q * 1e-6, x: 0, y: 0 }], v.q * 1e-6, { x: v.rA / 100, y: 0 }, { x: 0, y: v.rB / 100 }]; } },
        hint: 'Calcula $V_A = kQ/r_A$ y $V_B = kQ/r_B$; luego $W = -q(V_B - V_A)$.',
        solution: function (v) { var VA = k * v.Q * 1e-6 / (v.rA / 100), VB = k * v.Q * 1e-6 / (v.rB / 100); return '$V_A = ' + fx(VA, 0) + '$ V, $V_B = ' + fx(VB, 0) + '$ V. $$W = -q(V_B - V_A) = -(' + sq(v.q) + '\\times 10^{-6})(' + fx(VB - VA, 0) + ') = ' + fx(-v.q * 1e-6 * (VB - VA), 4) + '\\ \\text{J}$$'; }
      },
      {
        id: 'f2-s05-rapidez', title: 'Partícula acelerada',
        vars: { p: [0, 1, 1], dv: [100, 5000, 100] },
        prompt: function (v) { return '<p>' + (v.p ? 'Un electrón' : 'Un protón') + ' parte del reposo y se acelera a través de una diferencia de potencial de $' + v.dv + '\\ \\text{V}$. ¿Con qué rapidez sale? ($e = 1.60\\times 10^{-19}\\ \\text{C}$, ' + (v.p ? '$m_e = 9.11\\times 10^{-31}\\ \\text{kg}$' : '$m_p = 1.67\\times 10^{-27}\\ \\text{kg}$') + '.)</p>'; },
        check: 'numeric', unit: 'm/s',
        answer: function (v) { return Math.sqrt(2 * e * v.dv / (v.p ? mE : mP)); },
        mistakes: {
          noTwo: function (v) { return Math.sqrt(e * v.dv / (v.p ? mE : mP)); },
          noSqrt: function (v) { return 2 * e * v.dv / (v.p ? mE : mP); }
        },
        feedback: [
          { when: 'noTwo', say: 'De $\\tfrac{1}{2}mv^2 = e\\,\\Delta V$ sale $v = \\sqrt{2e\\,\\Delta V/m}$: te faltó el 2.' },
          { when: 'noSqrt', say: 'Ese es $v^2$: falta sacar la raíz.' }
        ],
        oracle: { lab: 'call', mod: 'potential', fn: 'speed', args: function (v) { return v.p ? [-e, mE, v.dv, 0] : [e, mP, -v.dv, 0]; } },
        hint: 'Toda la energía potencial perdida, $e\\,\\Delta V$, se vuelve cinética: $\\tfrac{1}{2}mv^2 = e\\,\\Delta V$.',
        solution: function (v) { var m = v.p ? mE : mP, K = e * v.dv; return '$K = e\\,\\Delta V = ' + sci(K, 3) + '\\ \\text{J}$ (' + v.dv + ' eV). $$v = \\sqrt{\\frac{2K}{m}} = ' + sci(Math.sqrt(2 * K / m), 3) + '\\ \\text{m/s}$$'; }
      },
      {
        id: 'f2-s05-traer', title: 'Traer una carga desde el infinito',
        vars: { q1: [-5, 5, 1], q2: [-5, 5, 1], q: [-3, 3, 1], d: [4, 20, 2] },
        baseWhere: function (v) { return v.q && v.q1 + v.q2 !== 0; },
        prompt: function (v) { return '<p>Dos cargas, $q_1 = ' + sq(v.q1) + '\\ \\mu\\text{C}$ y $q_2 = ' + sq(v.q2) + '\\ \\mu\\text{C}$, están a $' + v.d + '\\ \\text{cm}$ una de otra. ¿Cuánto trabajo externo hace falta para traer despacio una carga $q = ' + sq(v.q) + '\\ \\mu\\text{C}$ desde muy lejos hasta el punto medio entre ellas? (' + KTX + '.)</p>'; },
        check: 'numeric', unit: 'J',
        answer: function (v) { return v.q * 1e-6 * k * (v.q1 + v.q2) * 1e-6 / (v.d / 200); },
        mistakes: {
          sign: function (v) { return -v.q * 1e-6 * k * (v.q1 + v.q2) * 1e-6 / (v.d / 200); },
          usedD: function (v) { return v.q * 1e-6 * k * (v.q1 + v.q2) * 1e-6 / (v.d / 100); }
        },
        feedback: [
          { when: 'sign', say: 'Ese es el trabajo del campo. El externo es $W_{ext} = +qV$.' },
          { when: 'usedD', say: 'Cada carga está a la mitad de la separación, $d/2$, del punto medio.' }
        ],
        oracle: { lab: 'value', value: function (v) { var P = window.LabMath.potential, d = v.d / 100, two = [{ q: v.q1 * 1e-6, x: 0, y: 0 }, { q: v.q2 * 1e-6, x: d, y: 0 }]; return P.systemU(two.concat([{ q: v.q * 1e-6, x: d / 2, y: 0 }])) - P.systemU(two); } },
        hint: 'Primero el potencial en el punto medio, $V = k(q_1 + q_2)/(d/2)$; luego $W_{ext} = qV$.',
        solution: function (v) { var V = k * (v.q1 + v.q2) * 1e-6 / (v.d / 200); return '$$V_M = \\frac{k(q_1 + q_2)}{d/2} = ' + fx(V, 0) + '\\ \\text{V} \\qquad W_{ext} = qV_M = ' + fx(v.q * 1e-6 * V, 4) + '\\ \\text{J}$$'; }
      },
      {
        id: 'f2-s05-camino', title: 'Concepto: dos caminos',
        vars: {},
        prompt: function () { return '<p>Llevas una carga de A a B cerca de una carga fija, primero en línea recta y luego por un camino largo y curvo. ¿Cómo es el trabajo de la fuerza eléctrica en los dos casos?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Igual: solo depende de $V_A$ y $V_B$', correct: true },
            { text: 'Mayor por el camino largo', say: 'La fuerza eléctrica es conservativa: lo que gana en un tramo lo pierde en otro.' },
            { text: 'Mayor por la recta', say: 'El largo del camino no importa; solo $W = -q(V_B - V_A)$.' },
            { text: 'Cero en los dos', say: 'Solo es cero si A y B tienen el mismo potencial (o si el camino es cerrado).' }
          ];
        },
        answer: function () { return 'Igual: solo depende de $V_A$ y $V_B$'; },
        hint: '¿La fuerza eléctrica es conservativa?',
        solution: function () { return 'La fuerza eléctrica es conservativa: $W_{A\\to B} = -q(V_B - V_A)$ por cualquier camino.'; }
      },
      {
        id: 'f2-s05-signo', title: 'Concepto: el signo del trabajo',
        vars: {},
        prompt: function () { return '<p>Una carga positiva se mueve de un punto a $100\\ \\text{V}$ a otro a $300\\ \\text{V}$. ¿Qué signo tiene el trabajo de la fuerza eléctrica?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Negativo: va «cuesta arriba» en potencial', correct: true },
            { text: 'Positivo, porque el potencial aumenta', say: '$W = -q\\,\\Delta V$ con $q > 0$ y $\\Delta V > 0$ da trabajo negativo.' },
            { text: 'Cero, porque el potencial no es una fuerza', say: 'Hay diferencia de potencial, así que hay trabajo: $W = -q\\,\\Delta V$.' },
            { text: 'Depende del camino', say: 'El trabajo de la fuerza eléctrica no depende del camino.' }
          ];
        },
        answer: function () { return 'Negativo: va «cuesta arriba» en potencial'; },
        hint: 'Usa $W = -q\\,\\Delta V$.',
        solution: function () { return '$W = -q(300 - 100) < 0$ para $q > 0$. Alguien externo tuvo que empujarla.'; }
      }
    ],

    quiz: { tags: ['f2.S05'], count: 8 },

    errors: [
      'Usar $1/r^2$ en $U$ o en $V$: eso es de la fuerza y del campo.',
      'Sumar potenciales sin el signo de cada carga, o descomponerlos en componentes como si fueran vectores.',
      'Confundir el trabajo del campo, $-q\\,\\Delta V$, con el trabajo externo, $+q\\,\\Delta V$.',
      'Contar cada par dos veces al calcular la energía de un sistema.',
      'Dejar las distancias en centímetros o las cargas en μC sin convertir.',
      'Olvidar multiplicar por la carga al pasar de potencial (volts) a energía (joules).'
    ],

    teacher: {
      plan: [
        'Arranca con la analogía gravitacional (Física 1 · S13): trabajo independiente del camino → energía potencial.',
        'Explainer de la integral de $1/r^2$: que vean salir $U = kq_1q_2/r$ y el cero en el infinito.',
        'Explainer de armar el sistema; luego el potencial como energía por coulomb y la suma escalar.',
        'Ejemplos 3 y 4 con las mismas cargas; el lab para ver que el trabajo no depende del camino.'
      ],
      check: [
        'Que escriban las distancias en metros antes de sustituir.',
        'Que justifiquen el signo de cada resultado («se atraen», «va cuesta arriba»).'
      ],
      note: 'El potencial de distribuciones continuas, las equipotenciales y $E = -\\nabla V$ quedan para S06.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §7.1 “Electric Potential Energy”. <a href="https://openstax.org/books/university-physics-volume-2/pages/7-1-electric-potential-energy">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §7.2 “Electric Potential and Potential Difference”. <a href="https://openstax.org/books/university-physics-volume-2/pages/7-2-electric-potential-and-potential-difference">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-04',
    next: 'sesion-06'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
