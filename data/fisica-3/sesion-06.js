/* =====================================================================
   Física 3 · S06 · Ley de Biot–Savart: alambre recto, arco y espira (bloque B · Fuentes de campo).
   Fuentes: OpenStax, University Physics Volume 2, §12.1, §12.2 y §12.4 (CC BY-NC-SA 4.0).
   μ₀ = 4π × 10⁻⁷ T·m/A. Distancias de los enunciados en cm, campos en µT.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.biot (lab biot-savart).
   ===================================================================== */
(function () {
  var MU0 = 4 * Math.PI * 1e-7, RAD = Math.PI / 180, DEG = 180 / Math.PI;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
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
  // Campos en µT con distancias en cm.
  function inf(I, a) { return MU0 * I / (2 * Math.PI * a / 100) * 1e6; }
  function sym(I, a, L) { return MU0 * I / (4 * Math.PI * a / 100) * 2 * L / Math.hypot(L, a) * 1e6; }
  function arcB(I, R, ph) { return MU0 * I * ph * RAD / (4 * Math.PI * R / 100) * 1e6; }
  function axis(I, R, z, N) { var r = R / 100, zz = z / 100; return (N || 1) * MU0 * I * r * r / (2 * Math.pow(zz * zz + r * r, 1.5)) * 1e6; }

  // Ejemplo 1: alambre largo, 8 A a 2.5 cm; contra la Tierra (50 µT)
  var e1 = { I: 8, a: 2.5 }; e1.B = inf(e1.I, e1.a); e1.ratio = e1.B / 50;
  // Ejemplo 2: tramo de −4 cm a 6 cm, 5 A, P a 3 cm del alambre
  var e2 = { I: 5, a: 3, x1: -4, x2: 6 }; e2.s1 = e2.x1 / Math.hypot(e2.x1, e2.a); e2.s2 = e2.x2 / Math.hypot(e2.x2, e2.a);
  e2.B = MU0 * e2.I / (4 * Math.PI * e2.a / 100) * (e2.s2 - e2.s1) * 1e6; e2.Binf = inf(e2.I, e2.a);
  // Ejemplo 3: cuarto de círculo de 4 cm con dos tramos radiales, 6 A
  var e3 = { I: 6, R: 4, ph: 90 }; e3.B = arcB(e3.I, e3.R, e3.ph);
  // Ejemplo 4: bobina plana de 20 vueltas, R = 5 cm, 3 A; centro y z = 5 cm
  var e4 = { N: 20, I: 3, R: 5, z: 5 }; e4.Bc = axis(e4.I, e4.R, 0, e4.N); e4.Bz = axis(e4.I, e4.R, e4.z, e4.N); e4.ratio = e4.Bz / e4.Bc;

  var SIDE = [
    { where: 'arriba', cur: 'hacia la derecha', right: 'Sale de la página', wrong: 'Entra a la página' },
    { where: 'abajo', cur: 'hacia la derecha', right: 'Entra a la página', wrong: 'Sale de la página' },
    { where: 'arriba', cur: 'hacia la izquierda', right: 'Entra a la página', wrong: 'Sale de la página' },
    { where: 'abajo', cur: 'hacia la izquierda', right: 'Sale de la página', wrong: 'Entra a la página' }
  ];

  var data = window.SESSION_DATA = {
    slug: 'sesion-06', number: '06', group: 'B · Fuentes de campo',
    title: 'Ley de Biot–Savart: alambre recto, arco y espira', temario: [],
    minutes: 180,
    quote: 'Cada trocito de corriente $I\\,d\\vec l$ produce un campo $d\\vec B$ perpendicular a $d\\vec l$ y a $\\hat r$, que baja como $1/r^2$. Sumando todos los trocitos sale el campo de cualquier circuito.',
    badges: [
      'Usar la ley de Biot–Savart para plantear el campo de un alambre con corriente, trozo por trozo.',
      'Calcular B de un tramo recto, de un alambre largo, de un arco y de una espira en su eje.',
      'Dar el sentido de B con la regla de la mano derecha.',
      'Reconocer cuándo un tramo no aporta (dl paralelo a r) y cuándo un alambre se puede tomar como infinito.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'En el bloque A el campo $\\vec B$ ya estaba ahí y estudiamos qué fuerza hace. Ahora la pregunta es al revés: <strong>¿quién produce $\\vec B$?</strong> La respuesta es: las cargas en movimiento, o sea, las corrientes.',
        recall: [
          'El campo de una distribución continua de carga se arma sumando $dE$ de cada trozo $dq$ (<a href="../../../fisica-2/sesiones/sesion-04/">Física 2 · S04</a>). Aquí haremos lo mismo con trozos de corriente.',
          'El producto cruz: $|\\vec a\\times\\vec b| = ab\\sin\\phi$, perpendicular a los dos, con la regla de la mano derecha.',
          'La fuerza sobre una carga en movimiento, $\\vec F = q\\vec v\\times\\vec B$ (<a href="../sesion-02/">sesión 2</a>): de nuevo un producto cruz.'
        ],
        why: 'Las bobinas de los motores, los electroimanes, las bocinas, los transformadores y los aparatos de resonancia magnética producen su campo con corrientes. Saber calcularlo es el primer paso para diseñarlos.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'En 1820, Hans Christian Oersted notó en plena clase que la aguja de una brújula se movía cada vez que conectaba una pila a un alambre que pasaba cerca. Sin imanes a la vista: la corriente sola hacía girar la aguja.',
          'Si pones varias brújulas alrededor de un alambre vertical con corriente, se acomodan en <strong>círculos</strong> alrededor del alambre. El campo de una corriente no sale de ella ni llega a ella: <strong>la rodea</strong>.'
        ]
      },
      {
        type: 'concept', heading: 'Las corrientes producen campo magnético', short: 'Corrientes y campo',
        body: [
          'Alrededor de un alambre recto, las líneas de $\\vec B$ son circunferencias centradas en el alambre. Su sentido lo da la <strong>regla de la mano derecha</strong>: apunta el pulgar con la corriente y tus dedos se doblan en el sentido de $\\vec B$.',
          'En los dibujos planos se usan dos símbolos: <strong>⊙</strong> es un vector (o una corriente) que <em>sale</em> de la página, como la punta de una flecha que viene hacia ti; <strong>⊗</strong> es uno que <em>entra</em>, como las plumas de una flecha que se aleja.',
          'Con la corriente saliendo de la página (⊙), $\\vec B$ gira en sentido <strong>antihorario</strong>; entrando (⊗), en sentido horario.'
        ],
        diagram: 'f3s06-oersted',
        caption: 'Pulgar con la corriente; los dedos dan el sentido de B.'
      },
      {
        type: 'concept', heading: 'La ley de Biot–Savart', short: 'Biot–Savart',
        body: [
          'Parte el alambre en trocitos. Un trocito de largo $dl$ que lleva corriente $I$ se escribe como el vector $I\\,d\\vec l$, que apunta en el sentido de la corriente. En un punto P, a una distancia $r$ del trocito, produce $$d\\vec B = \\frac{\\mu_0}{4\\pi}\\,\\frac{I\\,d\\vec l\\times\\hat r}{r^2}$$ donde $\\hat r$ es el vector unitario <strong>del trocito hacia P</strong>.',
          'Lee la fórmula por partes:<ul><li>Como en Coulomb, baja como $1/r^2$.</li><li>La magnitud es $dB = \\frac{\\mu_0}{4\\pi}\\frac{I\\,dl\\,\\sin\\phi}{r^2}$, con $\\phi$ el ángulo entre $d\\vec l$ y $\\hat r$. Si P está en la misma línea que el trocito ($\\phi = 0$), ese trocito <strong>no aporta</strong>.</li><li>Por el producto cruz, $d\\vec B$ es perpendicular al alambre y a $\\hat r$: rodea a la corriente.</li></ul>',
          'La constante es la <strong>permeabilidad del vacío</strong>, $\\mu_0 = 4\\pi\\times 10^{-7}\\ \\text{T·m/A}$, así que $\\frac{\\mu_0}{4\\pi} = 10^{-7}\\ \\text{T·m/A}$. Desde la redefinición del SI en 2019, $\\mu_0$ ya no es exacta (CODATA 2018: $1.25663706212\\times 10^{-6}$), pero la diferencia está en la décima cifra y en el curso usamos $4\\pi\\times 10^{-7}$.',
          'El campo total es la suma (integral) de todos los trocitos: $\\vec B = \\frac{\\mu_0}{4\\pi}\\int \\frac{I\\,d\\vec l\\times\\hat r}{r^2}$. Es la misma idea que el campo de una varilla cargada, con un producto cruz en lugar de un vector radial.'
        ]
      },
      {
        type: 'explainer', heading: 'Tramo recto: de dB a B', short: 'Tramo recto',
        title: 'Un tramo recto con corriente I y un punto P a una distancia a',
        intro: 'El caso que más se usa. Todos los trocitos dan $d\\vec B$ en el mismo sentido, así que basta sumar magnitudes.',
        diagram: 'f3s06-segment',
        steps: [
          { text: '<strong>Elige el trocito.</strong> Pon el alambre sobre el eje $x$ y el origen al pie de la perpendicular desde P. Un trocito en la posición $x$ tiene largo $dx$; de él a P hay $r = \\sqrt{x^2 + a^2}$.', state: { k: 1 } },
          { text: '<strong>Dirección.</strong> Con la corriente hacia la derecha y P arriba, $d\\vec l\\times\\hat r$ sale de la página para <em>todos</em> los trocitos. Su magnitud es $dB = \\frac{\\mu_0 I}{4\\pi}\\frac{dx\\,\\sin\\phi}{r^2}$, y $\\sin\\phi = a/r$.', state: { k: 2 } },
          { text: '<strong>Cambia de variable.</strong> Mide la posición con el ángulo $\\theta$ desde la perpendicular: $x = a\\tan\\theta$, $dx = a\\sec^2\\theta\\,d\\theta$ y $r = a\\sec\\theta$. Todo se simplifica a $dB = \\frac{\\mu_0 I}{4\\pi a}\\cos\\theta\\,d\\theta$.', state: { k: 3 } },
          { text: '<strong>Integra</strong> de $\\theta_1$ (extremo izquierdo, negativo) a $\\theta_2$ (extremo derecho): $$B = \\frac{\\mu_0 I}{4\\pi a}\\left(\\sin\\theta_2 - \\sin\\theta_1\\right)$$ Con las posiciones de los extremos, $\\sin\\theta = x/\\sqrt{x^2 + a^2}$.', state: { k: 4 } },
          { text: '<strong>Alambre infinito.</strong> Si el alambre es muy largo, $\\theta_1 \\to -90^\\circ$ y $\\theta_2 \\to 90^\\circ$: el paréntesis vale 2 y $$B = \\frac{\\mu_0 I}{2\\pi a}$$', state: { k: 5 } }
        ]
      },
      {
        type: 'concept', heading: 'El alambre largo', short: 'Alambre largo',
        body: [
          'Un alambre recto y largo produce, a una distancia $a$, $$B = \\frac{\\mu_0 I}{2\\pi a}$$ en circunferencias alrededor del alambre. Baja como $1/a$, no como $1/a^2$: un alambre es una fila infinita de trocitos.',
          'Para tener una idea: $10\\ \\text{A}$ a $1\\ \\text{cm}$ dan $B = \\frac{(4\\pi\\times 10^{-7})(10)}{2\\pi(0.01)} = 2\\times 10^{-4}\\ \\text{T} = 200\\ \\mu\\text{T}$, cuatro veces el campo de la Tierra. Por eso una brújula junto a un cable de una estufa eléctrica se desvía.',
          '¿Cuándo es “largo”? Cuando sus extremos se ven casi a $\\pm 90^\\circ$ desde P. Un tramo de largo $2L$ con P en el centro da $\\frac{\\mu_0 I}{2\\pi a}\\cdot\\frac{L}{\\sqrt{L^2 + a^2}}$; con $L = 10a$ ya es el 99.5 % del infinito.'
        ]
      },
      {
        type: 'explainer', heading: 'Arco: campo en su centro', short: 'Arco',
        title: 'Un arco de radio R y ángulo φ, con el campo en su centro',
        intro: 'En el centro de un arco todos los trocitos están a la misma distancia y son perpendiculares al radio: la integral es inmediata.',
        diagram: 'f3s06-arc',
        steps: [
          { text: '<strong>Elige el trocito.</strong> Un trocito de arco $d\\vec l$ es tangente a la circunferencia, y el vector hacia el centro P es radial, de largo $r = R$.', state: { k: 1, ph: 120 } },
          { text: '<strong>Perpendiculares.</strong> Tangente y radio forman $90^\\circ$: $\\sin\\phi = 1$. Cada trocito da $dB = \\frac{\\mu_0}{4\\pi}\\frac{I\\,dl}{R^2}$, y todos salen de la página (corriente antihoraria).', state: { k: 2, ph: 120 } },
          { text: '<strong>Integra.</strong> Con $dl = R\\,d\\theta$: $B = \\frac{\\mu_0 I}{4\\pi R}\\int_0^{\\varphi} d\\theta$, y queda $$B = \\frac{\\mu_0 I\\varphi}{4\\pi R}$$ con $\\varphi$ <strong>en radianes</strong>.', state: { k: 3, ph: 120 } },
          { text: '<strong>Espira completa.</strong> Con $\\varphi = 2\\pi$, el centro de una espira circular tiene $$B = \\frac{\\mu_0 I}{2R}$$ Con $N$ vueltas apretadas (una bobina plana), $N$ veces eso.', state: { k: 4, ph: 360 } }
        ]
      },
      {
        type: 'explainer', heading: 'Espira: campo en su eje', short: 'Espira en su eje',
        title: 'Una espira de radio R y un punto P en su eje, a una altura z',
        intro: 'Aquí sí hay cancelaciones: cada $d\\vec B$ está inclinado y solo sobrevive su parte a lo largo del eje.',
        diagram: 'f3s06-loop',
        steps: [
          { text: '<strong>Elige el trocito.</strong> Todos los trocitos están a la misma distancia de P: $r = \\sqrt{z^2 + R^2}$. Y $d\\vec l$ es perpendicular a $\\hat r$, así que $dB = \\frac{\\mu_0}{4\\pi}\\frac{I\\,dl}{z^2 + R^2}$.', state: { k: 1 } },
          { text: '<strong>Dirección.</strong> $d\\vec B$ es perpendicular a $\\hat r$: está inclinado. Tiene una parte a lo largo del eje y otra que se aleja del eje.', state: { k: 2 } },
          { text: '<strong>Simetría.</strong> El trocito del lado opuesto da la misma parte a lo largo del eje y una parte hacia afuera <em>opuesta</em>: esas se cancelan por pares. Solo sumas $dB_z = dB\\cos\\alpha$, con $\\cos\\alpha = R/r$.', state: { k: 3 } },
          { text: '<strong>Integra.</strong> $r$ y $\\alpha$ no cambian al recorrer la espira, y $\\oint dl = 2\\pi R$. Multiplica $\\frac{\\mu_0 I}{4\\pi}\\cdot\\frac{2\\pi R}{z^2 + R^2}$ por $\\cos\\alpha = \\frac{R}{\\sqrt{z^2 + R^2}}$: $$B = \\frac{\\mu_0 I R^2}{2\\,(z^2 + R^2)^{3/2}}$$', state: { k: 4 } },
          { text: '<strong>Comprueba.</strong> En el centro ($z = 0$) sale $\\mu_0 I/2R$, lo mismo que con el arco. Lejos ($z \\gg R$), $B \\approx \\frac{\\mu_0 I R^2}{2z^3}$: baja como $1/z^3$, como un dipolo (la espira es un dipolo magnético, <a href="../sesion-05/">sesión 5</a>).', state: { k: 5 } }
        ]
      },
      {
        type: 'callout', heading: 'Cuatro resultados que vas a volver a usar',
        body: [
          '<ul><li>Tramo recto: $B = \\frac{\\mu_0 I}{4\\pi a}(\\sin\\theta_2 - \\sin\\theta_1)$.</li><li>Alambre largo: $B = \\frac{\\mu_0 I}{2\\pi a}$.</li><li>Arco, en su centro: $B = \\frac{\\mu_0 I\\varphi}{4\\pi R}$; espira completa: $\\frac{\\mu_0 I}{2R}$.</li><li>Espira, en su eje: $B = \\frac{\\mu_0 I R^2}{2(z^2 + R^2)^{3/2}}$.</li></ul>Y un atajo: un tramo recto que apunta hacia P (o se aleja de P) no produce campo en P, porque $d\\vec l \\parallel \\hat r$.'
        ]
      },
      {
        type: 'concept', heading: 'Circuitos armados por partes', short: 'Por partes',
        body: [
          'Muchos problemas combinan tramos rectos y arcos. Como el campo es una suma, calcula el de cada parte en P con su fórmula y súmalos <strong>con su sentido</strong> (⊙ positivo, ⊗ negativo, por ejemplo).',
          'Los tramos que van directo hacia P no aportan. Por eso el campo en el centro de una “rebanada de pizza” (dos radios y un arco) es solo el del arco.'
        ],
        diagram: 'f3s06-radial',
        caption: 'Solo el arco produce campo en C.'
      },
      {
        type: 'recipe', heading: 'Receta: campo de un circuito con Biot–Savart', short: 'Receta',
        steps: [
          { text: 'Dibuja el circuito, el punto P y el sentido de la corriente. Parte el circuito en piezas: tramos rectos, arcos y espiras.' },
          { text: 'Descarta los tramos que apuntan hacia P (o que se alejan de P en línea recta): no aportan.', tip: 'Ahí $d\\vec l$ es paralelo a $\\hat r$ y el producto cruz vale cero.' },
          { text: 'Para cada pieza, usa su fórmula: tramo recto, alambre largo, arco o espira en su eje. Pasa distancias a metros y ángulos de arco a radianes.', tip: 'Un arco de $90^\\circ$ es $\\varphi = \\pi/2$, no 90.' },
          { text: 'Da el sentido de cada campo con la mano derecha y súmalos con signo (⊙ contra ⊗).' },
          { text: 'Revisa el orden de magnitud: unos amperes a unos centímetros dan decenas o cientos de microteslas.' }
        ]
      },
      {
        type: 'example', heading: 'Un alambre largo junto a una brújula',
        problem: '<p>Un cable largo lleva $' + e1.I + '\\ \\text{A}$. ¿Cuánto vale $B$ a $' + fx(e1.a, 1) + '\\ \\text{cm}$ del cable, y cuántas veces es el campo de la Tierra ($50\\ \\mu\\text{T}$)?</p>',
        steps: [
          { text: 'Es un alambre largo: $B = \\frac{\\mu_0 I}{2\\pi a}$, con $a$ en metros.', math: 'B = \\frac{(4\\pi\\times 10^{-7})(' + e1.I + ')}{2\\pi(' + fx(e1.a / 100, 3) + ')} = ' + fx(e1.B, 1) + '\\ \\mu\\text{T}' },
          { text: 'Compara con la Tierra.', math: '\\frac{' + fx(e1.B, 1) + '}{50} = ' + fx(e1.ratio, 2) }
        ],
        answer: '$B = ' + fx(e1.B, 1) + '\\ \\mu\\text{T}$, unas $' + fx(e1.ratio, 1) + '$ veces el campo de la Tierra.',
        verify: { lab: 'call', mod: 'biot', fn: 'infiniteUT', args: [e1.I, e1.a], value: e1.B }
      },
      {
        type: 'example', heading: 'Un tramo que no es infinito',
        problem: '<p>Un tramo recto lleva $' + e2.I + '\\ \\text{A}$ hacia la derecha. P está $' + e2.a + '\\ \\text{cm}$ arriba del alambre; medidos desde el pie de la perpendicular, los extremos están en $x_1 = ' + e2.x1 + '\\ \\text{cm}$ y $x_2 = ' + e2.x2 + '\\ \\text{cm}$. ¿Cuánto vale $B$ en P y hacia dónde apunta? Compáralo con el de un alambre infinito.</p>',
        steps: [
          { text: 'Senos de los ángulos de los extremos: $\\sin\\theta = x/\\sqrt{x^2 + a^2}$.', math: '\\sin\\theta_1 = \\frac{' + e2.x1 + '}{\\sqrt{' + e2.x1 + '^2 + ' + e2.a + '^2}} = ' + fx(e2.s1, 3) + ' \\qquad \\sin\\theta_2 = \\frac{' + e2.x2 + '}{\\sqrt{' + e2.x2 + '^2 + ' + e2.a + '^2}} = ' + fx(e2.s2, 3) },
          { text: 'Fórmula del tramo recto, con $a$ en metros.', math: 'B = \\frac{\\mu_0 I}{4\\pi a}(\\sin\\theta_2 - \\sin\\theta_1) = \\frac{10^{-7}(' + e2.I + ')}{' + fx(e2.a / 100, 2) + '}(' + fx(e2.s2, 3) + ' + ' + fx(-e2.s1, 3) + ') = ' + fx(e2.B, 1) + '\\ \\mu\\text{T}' },
          { text: 'Sentido: corriente a la derecha y P arriba; con la mano derecha, B <strong>sale de la página</strong>.' },
          { text: 'El infinito daría $\\frac{\\mu_0 I}{2\\pi a} = ' + fx(e2.Binf, 1) + '\\ \\mu\\text{T}$: el tramo da el ' + fx(e2.B / e2.Binf * 100, 0) + ' %. Faltan los pedazos de alambre más allá de los extremos.' }
        ],
        answer: '$B = ' + fx(e2.B, 1) + '\\ \\mu\\text{T}$, saliendo de la página.',
        verify: { lab: 'call', mod: 'biot', fn: 'segmentUT', args: [e2.I, e2.a, e2.x1, e2.x2], value: e2.B }
      },
      {
        type: 'example', heading: 'Rebanada de pizza: dos radios y un arco',
        problem: '<p>El circuito de la figura tiene dos tramos rectos que llegan al punto C y un cuarto de circunferencia de radio $' + e3.R + '\\ \\text{cm}$. Lleva $' + e3.I + '\\ \\text{A}$ en sentido horario. ¿Cuánto vale $B$ en C?</p>',
        steps: [
          { text: 'Los tramos rectos apuntan hacia C: ahí $d\\vec l \\parallel \\hat r$ y no aportan.' },
          { text: 'El arco es de $90^\\circ$: $\\varphi = \\pi/2$ rad.', math: 'B = \\frac{\\mu_0 I\\varphi}{4\\pi R} = \\frac{10^{-7}(' + e3.I + ')(\\pi/2)}{' + fx(e3.R / 100, 2) + '} = ' + fx(e3.B, 1) + '\\ \\mu\\text{T}' },
          { text: 'Corriente horaria: con la mano derecha, B <strong>entra a la página</strong> en C.' }
        ],
        answer: '$B = ' + fx(e3.B, 1) + '\\ \\mu\\text{T}$, entrando a la página.',
        verify: { lab: 'call', mod: 'biot', fn: 'arcUT', args: [e3.I, e3.R, e3.ph], value: e3.B }
      },
      {
        type: 'example', heading: 'Bobina plana: centro y eje',
        problem: '<p>Una bobina plana de $' + e4.N + '$ vueltas y radio $' + e4.R + '\\ \\text{cm}$ lleva $' + e4.I + '\\ \\text{A}$. ¿Cuánto vale $B$ en su centro y en el eje, a $' + e4.z + '\\ \\text{cm}$ del centro?</p>',
        steps: [
          { text: 'En el centro, cada vuelta da $\\mu_0 I/2R$; las ' + e4.N + ' se suman.', math: 'B_0 = \\frac{N\\mu_0 I}{2R} = \\frac{' + e4.N + '(4\\pi\\times 10^{-7})(' + e4.I + ')}{2(' + fx(e4.R / 100, 2) + ')} = ' + fx(e4.Bc, 0) + '\\ \\mu\\text{T}' },
          { text: 'En el eje, con $z = R$:', math: 'B = \\frac{N\\mu_0 I R^2}{2(z^2 + R^2)^{3/2}} = ' + fx(e4.Bz, 0) + '\\ \\mu\\text{T}' },
          { text: 'Con $z = R$, el cociente es $\\frac{R^3}{(2R^2)^{3/2}} = \\frac{1}{2\\sqrt 2} \\approx ' + fx(e4.ratio, 3) + '$: a una distancia de un radio, el campo ya bajó a poco más de un tercio.' }
        ],
        answer: '$B_0 = ' + fx(e4.Bc, 0) + '\\ \\mu\\text{T}$ en el centro y $' + fx(e4.Bz, 0) + '\\ \\mu\\text{T}$ a ' + e4.z + ' cm, a lo largo del eje.',
        verify: { lab: 'call', mod: 'biot', fn: 'loopAxisUT', args: [e4.I, e4.R, e4.z, e4.N], value: e4.Bz }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué el campo del alambre baja como 1/r y no como 1/r²?', a: 'Cada trocito sí baja como $1/r^2$, pero un alambre largo tiene trocitos a todas las distancias. Al sumarlos, la integral da $1/a$. Pasa lo mismo con la línea de carga en Física 2: $E = 2k\\lambda/r$.' },
          { q: '¿Qué es exactamente r̂?', a: 'El vector unitario que va <strong>del trocito al punto P</strong>. Si lo tomas al revés, el producto cruz cambia de signo y te queda el sentido opuesto.' },
          { q: '¿Por qué un tramo que apunta a P no produce campo?', a: 'Porque ahí $d\\vec l$ y $\\hat r$ son paralelos y $d\\vec l\\times\\hat r = 0$. Un alambre no produce campo en su propia prolongación.' },
          { q: '¿El ángulo del arco va en grados?', a: 'No: en $B = \\mu_0 I\\varphi/4\\pi R$ el ángulo va en radianes. Medio círculo es $\\pi$, un cuarto es $\\pi/2$.' },
          { q: '¿Y el campo de la espira fuera de su eje?', a: 'Existe, pero no tiene fórmula sencilla. Lejos de la espira se parece al de un imán de barra; por eso a la espira se le llama dipolo magnético.' },
          { q: '¿Para qué sirve μ₀/4π = 10⁻⁷?', a: 'Para hacer cuentas rápidas: $\\frac{\\mu_0 I}{2\\pi a} = 2\\times 10^{-7}\\,\\frac{I}{a}$ con $I$ en A y $a$ en m.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Biot–Savart: $d\\vec B = \\frac{\\mu_0}{4\\pi}\\frac{I\\,d\\vec l\\times\\hat r}{r^2}$, con $\\mu_0 = 4\\pi\\times 10^{-7}\\ \\text{T·m/A}$ y $\\hat r$ del trocito a P.',
          'Las líneas de B rodean a la corriente; el sentido sale de la mano derecha (⊙ sale, ⊗ entra).',
          'Tramo recto: $\\frac{\\mu_0 I}{4\\pi a}(\\sin\\theta_2 - \\sin\\theta_1)$; infinito: $\\frac{\\mu_0 I}{2\\pi a}$.',
          'Arco en su centro: $\\frac{\\mu_0 I\\varphi}{4\\pi R}$ (φ en radianes); espira: $\\frac{\\mu_0 I}{2R}$ en el centro y $\\frac{\\mu_0 I R^2}{2(z^2 + R^2)^{3/2}}$ en el eje.',
          'Los tramos que apuntan hacia P no aportan; los campos de las piezas se suman con su sentido.'
        ]
      }
    ],

    lab: {
      type: 'biot-savart', title: 'Biot–Savart trozo a trozo',
      intro: 'Elige la geometría (tramo recto, alambre largo, arco o espira) y parte el alambre en N trozos. El lab dibuja el aporte de cada trozo y compara su suma con la fórmula cerrada: con más trozos, la suma se acerca. En el reto, predice |B| en P y su sentido; el lab te dice si usaste la fórmula del alambre infinito para un tramo corto, si dejaste el ángulo del arco en grados o si mezclaste centímetros con metros.',
      cfg: { mode: 'segment' }
    },

    formulas: [
      { label: 'Biot–Savart', tex: 'd\\vec B = \\frac{\\mu_0}{4\\pi}\\,\\frac{I\\,d\\vec l\\times\\hat r}{r^2}' },
      { label: 'Constante', tex: '\\mu_0 = 4\\pi\\times 10^{-7}\\ \\text{T·m/A}' },
      { label: 'Tramo recto', tex: 'B = \\frac{\\mu_0 I}{4\\pi a}\\left(\\sin\\theta_2 - \\sin\\theta_1\\right)' },
      { label: 'Alambre largo', tex: 'B = \\frac{\\mu_0 I}{2\\pi a}' },
      { label: 'Arco, en su centro', tex: 'B = \\frac{\\mu_0 I\\varphi}{4\\pi R}' },
      { label: 'Espira, en su eje', tex: 'B = \\frac{\\mu_0 I R^2}{2\\,(z^2 + R^2)^{3/2}},\\quad B_{\\text{centro}} = \\frac{\\mu_0 I}{2R}' }
    ],

    exercises: [
      {
        id: 'f3-s06-infinito', title: 'Campo de un alambre largo',
        vars: { I: [1, 20, 1], a: [1, 10, 0.5] },
        prompt: function (v) { return '<p>Un alambre recto y largo lleva $' + v.I + '\\ \\text{A}$. ¿Cuánto vale $B$ a $' + fx(v.a, 1) + '\\ \\text{cm}$ de él? Responde en $\\mu\\text{T}$.</p>'; },
        check: 'numeric', unit: 'µT',
        answer: function (v) { return inf(v.I, v.a); },
        mistakes: {
          cm: function (v) { return inf(v.I, v.a) / 100; },
          fourPi: function (v) { return inf(v.I, v.a) / 2; },
          noTwo: function (v) { return inf(v.I, v.a) * 2; }
        },
        feedback: [
          { when: 'cm', say: 'Dejaste la distancia en centímetros. En $\\mu_0 I/2\\pi a$, $a$ va en metros.' },
          { when: 'fourPi', say: 'Usaste $4\\pi$ en el denominador. Para el alambre largo es $2\\pi a$: $B = \\mu_0 I/2\\pi a$.' },
          { when: 'noTwo', say: 'Te faltó el 2 del denominador: $B = \\mu_0 I/(2\\pi a)$.' }
        ],
        oracle: { lab: 'call', mod: 'biot', fn: 'infiniteUT', args: function (v) { return [v.I, v.a]; } },
        hint: '$B = \\frac{\\mu_0 I}{2\\pi a} = 2\\times 10^{-7}\\,\\frac{I}{a}$ con $a$ en metros.',
        solution: function (v) { return '$$B = \\frac{(4\\pi\\times 10^{-7})(' + v.I + ')}{2\\pi(' + fx(v.a / 100, 3) + ')} = ' + fx(inf(v.I, v.a), 2) + '\\ \\mu\\text{T}$$'; }
      },
      {
        id: 'f3-s06-distancia', title: '¿A qué distancia?',
        vars: { I: [2, 30, 1], B: [20, 200, 10] },
        prompt: function (v) { return '<p>Un cable largo lleva $' + v.I + '\\ \\text{A}$. ¿A qué distancia del cable su campo vale $' + v.B + '\\ \\mu\\text{T}$? Responde en cm.</p>'; },
        check: 'numeric', unit: 'cm',
        answer: function (v) { return MU0 * v.I / (2 * Math.PI * v.B * 1e-6) * 100; },
        mistakes: {
          meters: function (v) { return MU0 * v.I / (2 * Math.PI * v.B * 1e-6); },
          fourPi: function (v) { return MU0 * v.I / (4 * Math.PI * v.B * 1e-6) * 100; }
        },
        feedback: [
          { when: 'meters', say: 'Ese resultado está en metros. Pásalo a centímetros.' },
          { when: 'fourPi', say: 'Para el alambre largo el denominador es $2\\pi B$, no $4\\pi B$.' }
        ],
        oracle: { lab: 'call', mod: 'biot', fn: 'distanceCm', args: function (v) { return [v.I, v.B]; } },
        hint: 'Despeja $a$ de $B = \\mu_0 I/2\\pi a$, con $B$ en teslas.',
        solution: function (v) { return '$$a = \\frac{\\mu_0 I}{2\\pi B} = \\frac{2\\times 10^{-7}(' + v.I + ')}{' + v.B + '\\times 10^{-6}} = ' + fx(MU0 * v.I / (2 * Math.PI * v.B * 1e-6), 4) + '\\ \\text{m} = ' + fx(MU0 * v.I / (2 * Math.PI * v.B * 1e-6) * 100, 2) + '\\ \\text{cm}$$'; }
      },
      {
        id: 'f3-s06-tramo', title: 'Tramo recto simétrico',
        vars: { I: [2, 12, 1], a: [1, 5, 1], L: [1, 8, 1] },
        prompt: function (v) { return '<p>Un tramo recto de $' + 2 * v.L + '\\ \\text{cm}$ lleva $' + v.I + '\\ \\text{A}$. ¿Cuánto vale $B$ en un punto a $' + v.a + '\\ \\text{cm}$ de su centro, sobre la perpendicular? Responde en $\\mu\\text{T}$.</p>'; },
        check: 'numeric', unit: 'µT',
        answer: function (v) { return sym(v.I, v.a, v.L); },
        mistakes: {
          infinite: function (v) { return inf(v.I, v.a); },
          half: function (v) { return sym(v.I, v.a, v.L) / 2; }
        },
        feedback: [
          { when: 'infinite', say: 'Usaste el alambre infinito. Este tramo es corto: $\\sin\\theta_2 - \\sin\\theta_1 = 2L/\\sqrt{L^2 + a^2}$, no 2.' },
          { when: 'half', say: 'Contaste una sola mitad del tramo. Los extremos están en $x = \\pm L$.' }
        ],
        oracle: { lab: 'call', mod: 'biot', fn: 'segmentUT', args: function (v) { return [v.I, v.a, -v.L, v.L]; } },
        hint: 'Los extremos están en $x = \\pm L$: $\\sin\\theta_{2} = -\\sin\\theta_1 = L/\\sqrt{L^2 + a^2}$.',
        solution: function (v) { var s = v.L / Math.hypot(v.L, v.a); return '$$B = \\frac{\\mu_0 I}{4\\pi a}\\cdot 2\\cdot\\frac{L}{\\sqrt{L^2 + a^2}} = \\frac{10^{-7}(' + v.I + ')}{' + fx(v.a / 100, 2) + '}\\cdot 2(' + fx(s, 4) + ') = ' + fx(sym(v.I, v.a, v.L), 2) + '\\ \\mu\\text{T}$$'; }
      },
      {
        id: 'f3-s06-arco', title: 'Campo en el centro de un arco',
        vars: { I: [1, 10, 1], R: [2, 10, 1], ph: [30, 270, 30] },
        prompt: function (v) { return '<p>Un arco de $' + v.ph + '^\\circ$ y radio $' + v.R + '\\ \\text{cm}$ lleva $' + v.I + '\\ \\text{A}$. ¿Cuánto vale $B$ en su centro? Responde en $\\mu\\text{T}$.</p>'; },
        check: 'numeric', unit: 'µT',
        answer: function (v) { return arcB(v.I, v.R, v.ph); },
        mistakes: {
          degrees: function (v) { return arcB(v.I, v.R, v.ph) * DEG; },
          fullLoop: function (v) { return MU0 * v.I / (2 * v.R / 100) * 1e6; }
        },
        feedback: [
          { when: 'degrees', say: 'Dejaste el ángulo en grados. En $\\mu_0 I\\varphi/4\\pi R$ va en radianes.' },
          { when: 'fullLoop', say: 'Ese es el centro de la espira completa. El arco da solo la fracción $\\varphi/2\\pi$.' }
        ],
        where: function (v) { return v.ph !== 360; },
        oracle: { lab: 'call', mod: 'biot', fn: 'arcUT', args: function (v) { return [v.I, v.R, v.ph]; } },
        hint: '$B = \\frac{\\mu_0 I\\varphi}{4\\pi R}$ con $\\varphi$ en radianes y $R$ en metros.',
        solution: function (v) { return '$$\\varphi = ' + v.ph + '^\\circ\\cdot\\frac{\\pi}{180} = ' + fx(v.ph * RAD, 4) + '\\ \\text{rad},\\qquad B = \\frac{10^{-7}(' + v.I + ')(' + fx(v.ph * RAD, 4) + ')}{' + fx(v.R / 100, 2) + '} = ' + fx(arcB(v.I, v.R, v.ph), 2) + '\\ \\mu\\text{T}$$'; }
      },
      {
        id: 'f3-s06-bobina', title: 'Centro de una bobina plana',
        vars: { N: [5, 100, 5], I: [0.5, 5, 0.5], R: [2, 12, 1] },
        prompt: function (v) { return '<p>Una bobina plana de $' + v.N + '$ vueltas apretadas, de radio $' + v.R + '\\ \\text{cm}$, lleva $' + fx(v.I, 1) + '\\ \\text{A}$. ¿Cuánto vale $B$ en su centro? Responde en $\\mu\\text{T}$.</p>'; },
        check: 'numeric', unit: 'µT',
        answer: function (v) { return v.N * MU0 * v.I / (2 * v.R / 100) * 1e6; },
        mistakes: {
          noN: function (v) { return MU0 * v.I / (2 * v.R / 100) * 1e6; },
          wire: function (v) { return v.N * MU0 * v.I / (2 * Math.PI * v.R / 100) * 1e6; }
        },
        feedback: [
          { when: 'noN', say: 'Ese es el campo de una sola vuelta. Las $N$ vueltas suman sus campos: multiplica por $N$.' },
          { when: 'wire', say: 'Usaste el alambre largo ($2\\pi R$). En el centro de una espira es $\\mu_0 I/2R$, sin $\\pi$.' }
        ],
        oracle: { lab: 'call', mod: 'biot', fn: 'loopCenterUT', args: function (v) { return [v.I, v.R, v.N]; } },
        hint: 'Cada vuelta da $\\mu_0 I/2R$ en el centro.',
        solution: function (v) { return '$$B = \\frac{N\\mu_0 I}{2R} = \\frac{' + v.N + '(4\\pi\\times 10^{-7})(' + fx(v.I, 1) + ')}{2(' + fx(v.R / 100, 2) + ')} = ' + fx(v.N * MU0 * v.I / (2 * v.R / 100) * 1e6, 1) + '\\ \\mu\\text{T}$$'; }
      },
      {
        id: 'f3-s06-eje', title: 'En el eje de una espira',
        vars: { I: [1, 10, 1], R: [2, 8, 1], z: [1, 10, 1] },
        prompt: function (v) { return '<p>Una espira de radio $' + v.R + '\\ \\text{cm}$ lleva $' + v.I + '\\ \\text{A}$. ¿Cuánto vale $B$ en su eje, a $' + v.z + '\\ \\text{cm}$ del centro? Responde en $\\mu\\text{T}$.</p>'; },
        check: 'numeric', unit: 'µT',
        answer: function (v) { return axis(v.I, v.R, v.z); },
        mistakes: {
          center: function (v) { return axis(v.I, v.R, 0); },
          noPow: function (v) { var r = v.R / 100, z = v.z / 100; return MU0 * v.I * r * r / (2 * (z * z + r * r)) * 1e6; }
        },
        feedback: [
          { when: 'center', say: 'Ese es el campo del centro. Sobre el eje, a una distancia $z$, es $\\frac{\\mu_0 I R^2}{2(z^2 + R^2)^{3/2}}$.' },
          { when: 'noPow', say: 'Te faltó la potencia $3/2$ en $(z^2 + R^2)^{3/2}$.' }
        ],
        oracle: { lab: 'call', mod: 'biot', fn: 'loopAxisUT', args: function (v) { return [v.I, v.R, v.z, 1]; } },
        hint: '$B = \\frac{\\mu_0 I R^2}{2(z^2 + R^2)^{3/2}}$ con todo en metros.',
        solution: function (v) { return '$$B = \\frac{(4\\pi\\times 10^{-7})(' + v.I + ')(' + fx(v.R / 100, 2) + ')^2}{2\\,(' + fx(v.z / 100, 2) + '^2 + ' + fx(v.R / 100, 2) + '^2)^{3/2}} = ' + fx(axis(v.I, v.R, v.z), 2) + '\\ \\mu\\text{T}$$'; }
      },
      {
        id: 'f3-s06-sentido', title: 'Concepto: sentido del campo de un alambre',
        vars: { k: [0, 3, 1] },
        prompt: function (v) { return '<p>Un alambre horizontal en el plano de la página lleva corriente ' + SIDE[v.k].cur + '. El punto P está ' + SIDE[v.k].where + ' del alambre. ¿Hacia dónde apunta $\\vec B$ en P?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: SIDE[v.k].right, correct: true },
            { text: SIDE[v.k].wrong, say: 'Es al revés. Pulgar con la corriente: tus dedos ' + (SIDE[v.k].right === 'Sale de la página' ? 'salen' : 'entran') + ' de la página en P.' },
            { text: 'Paralelo al alambre', say: 'El campo de una corriente es perpendicular al alambre: lo rodea.' },
            { text: 'Hacia el alambre', say: 'B no es radial: rodea al alambre.' }
          ];
        },
        answer: function (v) { return SIDE[v.k].right; },
        hint: 'Pulgar con la corriente; los dedos rodean al alambre en el sentido de B.',
        solution: function (v) { return 'Con el pulgar ' + SIDE[v.k].cur + ', los dedos pasan por P ' + (SIDE[v.k].right === 'Sale de la página' ? '<strong>saliendo</strong>' : '<strong>entrando</strong>') + ' de la página.'; }
      },
      {
        id: 'f3-s06-radial', title: 'Concepto: tramos que no aportan',
        vars: { k: [0, 1, 1] },
        prompt: function (v) { return v.k ? '<p>Un circuito tiene un tramo recto cuya prolongación pasa justo por P. ¿Cuánto aporta ese tramo al campo en P?</p>' : '<p>En una “rebanada de pizza” (dos radios y un arco) con corriente, ¿qué partes producen campo en el centro?</p>'; },
        check: 'choice',
        options: function (v) {
          return v.k ? [
            { text: 'Nada, porque dl es paralelo a r̂', correct: true },
            { text: 'Lo mismo que un alambre infinito', say: 'Ese tramo apunta a P: $d\\vec l\\times\\hat r = 0$ en todos sus trocitos.' },
            { text: 'La mitad que un alambre infinito', say: 'La mitad sería un alambre semiinfinito visto desde un lado, no desde su prolongación.' }
          ] : [
            { text: 'Solo el arco', correct: true },
            { text: 'Solo los dos radios', say: 'Los radios apuntan al centro: no aportan.' },
            { text: 'Los radios y el arco', say: 'En los radios $d\\vec l\\parallel\\hat r$: aportan cero.' }
          ];
        },
        answer: function (v) { return v.k ? 'Nada, porque dl es paralelo a r̂' : 'Solo el arco'; },
        hint: 'Revisa el producto cruz $d\\vec l\\times\\hat r$ en cada tramo.',
        solution: function (v) { return 'Donde el alambre apunta hacia el punto, $d\\vec l\\parallel\\hat r$ y el producto cruz es cero. ' + (v.k ? 'Ese tramo no aporta nada.' : 'Solo aporta el arco.'); }
      }
    ],

    quiz: { tags: ['f3.S06'], count: 8 },

    errors: [
      'Tomar $\\hat r$ del punto P hacia el trocito: va del trocito hacia P, y al revés el sentido sale opuesto.',
      'Usar $\\mu_0 I/2\\pi a$ para un tramo corto: solo vale si los extremos se ven casi a $\\pm 90^\\circ$.',
      'Dejar el ángulo de un arco en grados en $\\mu_0 I\\varphi/4\\pi R$.',
      'Confundir el centro de la espira ($\\mu_0 I/2R$) con el alambre largo ($\\mu_0 I/2\\pi a$).',
      'Olvidar la potencia $3/2$ en el campo en el eje de la espira.',
      'Sumar magnitudes de campos con sentidos opuestos (⊙ y ⊗) sin restar.',
      'Dejar las distancias en centímetros.'
    ],

    teacher: {
      plan: [
        'Arranca con el experimento de Oersted (brújula y alambre) y la regla de la mano derecha con los símbolos ⊙ y ⊗.',
        'Presenta Biot–Savart comparándola con el $dE$ de Física 2: misma receta, con producto cruz.',
        'Haz el tramo recto con el explainer y saca el infinito como límite. Luego el arco (fácil) y la espira (con simetría).',
        'Cierra con circuitos por partes (rebanada de pizza) y el lab: que vean converger la suma de N trozos.'
      ],
      check: [
        'Que den el sentido de B alrededor de un alambre en dibujos con ⊙ y ⊗.',
        'Que distingan cuándo usar tramo, infinito, arco o espira.',
        'Que identifiquen los tramos que no aportan.'
      ],
      note: 'El campo fuera del eje de una espira no se calcula; basta mencionar que lejos se parece al de un dipolo, lo que conecta con el momento magnético de la sesión 5.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §12.1 “The Biot-Savart Law”. <a href="https://openstax.org/books/university-physics-volume-2/pages/12-1-the-biot-savart-law">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §12.2 “Magnetic Field Due to a Thin Straight Wire”. <a href="https://openstax.org/books/university-physics-volume-2/pages/12-2-magnetic-field-due-to-a-thin-straight-wire">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §12.4 “Magnetic Field of a Current Loop”. <a href="https://openstax.org/books/university-physics-volume-2/pages/12-4-magnetic-field-of-a-current-loop">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-05',
    next: 'sesion-07'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
