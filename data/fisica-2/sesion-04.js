/* =====================================================================
   Física 2 · S04 · Campo eléctrico de distribuciones continuas (bloque A · Electrostática).
   Fuente: OpenStax, University Physics Volume 2, §5.5 (CC BY-NC-SA 4.0).
   Sesión de derivaciones (brief N2 §3.1): cada geometría sigue la misma plantilla de 6 pasos.
   k = 8.99 × 10⁹ N·m²/C², ε₀ = 8.85 × 10⁻¹² C²/(N·m²); SI.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js las compara
   contra LabMath.chargeIntegral (verify / oracle), que a su vez se prueba contra la suma
   de miles de cargas puntuales (scripts/labs-math/charge-integral.js).
   ===================================================================== */
(function () {
  var k = 8.99e9, eps0 = 8.85e-12;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  // Notación científica en LaTeX: 1.80 \times 10^{3}.
  function sci(v, d) {
    if (v === 0) return '0';
    var e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
    if (Math.abs(+m.toFixed(d == null ? 2 : d)) >= 10) { m /= 10; e += 1; }
    return m.toFixed(d == null ? 2 : d) + ' \\times 10^{' + e + '}';
  }
  // Fórmulas cerradas (SI). Se escriben aquí, aparte de LabMath.
  function Erod(L, Q, d) { return k * Q / (d * (d + L)); }
  function Ering(R, Q, z) { return k * Q * z / Math.pow(z * z + R * R, 1.5); }
  function Edisk(R, Q, z) { var s = Q / (Math.PI * R * R); return s / (2 * eps0) * (1 - z / Math.sqrt(z * z + R * R)); }
  function Esemi(R, Q) { return 2 * k * Q / (Math.PI * R * R); }
  var cm = function (x) { return x / 100; }, nC = function (q) { return q * 1e-9; };
  // Primer renglón de las soluciones: kQ con Q en nC (así las fracciones caben en celular).
  function kQline(qn) { return 'kQ &= (8.99 \\times 10^{9})(' + qn + ' \\times 10^{-9}) \\\\ &= ' + fx(k * qn * 1e-9) + '\\ \\text{N·m}^2/\\text{C} \\\\ '; }
  var KTXT ='$k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$';
  var ETXT = '$\\varepsilon_0 = 8.85 \\times 10^{-12}\\ \\text{C}^2/(\\text{N·m}^2)$';

  // Ejemplo 1: varilla en su eje
  var e1 = { L: 0.20, Q: 6.0e-9, d: 0.10 };
  e1.E = Erod(e1.L, e1.Q, e1.d); e1.far = k * e1.Q / (e1.d * e1.d);
  // Ejemplo 2: anillo en su eje
  var e2 = { R: 0.05, Q: 8.0e-9, z: 0.12 };
  e2.r = Math.sqrt(e2.z * e2.z + e2.R * e2.R); e2.E = Ering(e2.R, e2.Q, e2.z);
  // Ejemplo 3: disco y plano infinito
  var e3 = { R: 0.10, Q: 15e-9, z: 0.04 };
  e3.sig = e3.Q / (Math.PI * e3.R * e3.R); e3.plane = e3.sig / (2 * eps0);
  e3.f = 1 - e3.z / Math.sqrt(e3.z * e3.z + e3.R * e3.R); e3.E = Edisk(e3.R, e3.Q, e3.z);
  // Ejemplo 4: semicírculo en su centro
  var e4 = { R: 0.08, Q: 4.0e-9 };
  e4.lam = e4.Q / (Math.PI * e4.R); e4.E = Esemi(e4.R, e4.Q);

  // La respuesta y cada error típico deben diferir al menos 3 % entre sí.
  function distinct(ex) {
    return function (v) {
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (key) { return ex.mistakes[key](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]))) return false;
      }
      return true;
    };
  }

  var data = window.SESSION_DATA = {
    slug: 'sesion-04', number: '04', group: 'A · Electrostática',
    title: 'Campo eléctrico de distribuciones continuas de carga', temario: [],
    minutes: 180,
    quote: 'Una distribución de carga es un montón de cargas puntuales muy juntas: la partes en pedacitos, sumas sus campos como vectores y la suma se vuelve integral.',
    badges: [
      'Usar las densidades $\\lambda$, $\\sigma$ y $\\rho$ para escribir el $dq$ de cada pedacito.',
      'Escribir $r$, $\\hat{r}$ y $d\\vec{E}$ del elemento al punto, y usar la simetría para cancelar componentes.',
      'Derivar el campo de una varilla, un arco, un anillo y un disco con la misma plantilla de 6 pasos.',
      'Comprobar cada resultado con sus unidades y sus límites: lejos es una carga puntual; muy grande es el caso infinito.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Si la carga está repartida, la partes en pedacitos $dq$; cada uno es una carga puntual y sus campos se suman <strong>como vectores</strong>. Esa suma de infinitos pedacitos es una integral.',
        recall: [
          'El campo de una carga puntual, $E = kq/r^2$, que apunta alejándose de una carga positiva (S03).',
          'Sumar vectores por componentes y la superposición (S02).',
          'La integral como suma de muchos pedacitos y el cambio de variable (Cálculo 1, S09 y S10).'
        ],
        why: 'Las cargas reales nunca son puntos: hay cables, placas, discos de impresora láser, pantallas táctiles. Con estas derivaciones sabes qué campo producen y por qué un plano grande da un campo uniforme, la base de los capacitores (S09).'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en el ruido de un estadio. Cada persona grita un poquito y lo que oyes es la suma de todos: los de cerca se oyen más, los de enfrente menos. Nadie cuenta persona por persona; se piensa en «cuánta gente hay por metro de tribuna».',
          'Con la carga pasa igual. Una varilla cargada tiene billones de electrones de más o de menos y no los vas a contar. Mejor dices cuánta carga hay por metro ($\\lambda$), la partes en pedacitos $dq$, tratas cada uno como carga puntual y sumas sus campos. Ojo: con flechas, porque el campo es un vector.',
          'Y aquí está el truco que ahorra casi todo el trabajo: la <strong>simetría</strong>. Si a cada pedacito de la izquierda le corresponde uno igual a la derecha, sus empujones de lado se cancelan, como dos amigos que te jalan de los brazos con la misma fuerza. Solo queda sumar lo que apunta en una dirección.'
        ]
      },
      {
        type: 'concept', heading: 'Densidades de carga y el elemento dq', short: 'Densidades y dq',
        body: [
          'Una <strong>densidad</strong> dice cuánta carga hay por unidad de tamaño. Si la carga está repartida de forma uniforme, se calcula dividiendo la carga total entre el tamaño.',
          'Con la densidad escribes la carga de un pedacito: densidad por tamaño del pedacito. Ese es el primer paso de toda derivación.'
        ],
        list: [
          '<strong>Línea</strong> (varilla, alambre, arco): $\\lambda = Q/L$ en C/m, y $dq = \\lambda\\,dx$ (o $dq = \\lambda\\,ds$ sobre una curva).',
          '<strong>Superficie</strong> (placa, disco): $\\sigma = Q/A$ en C/m², y $dq = \\sigma\\,dA$.',
          '<strong>Volumen</strong> (esfera sólida, nube de carga): $\\rho = Q/V$ en C/m³, y $dq = \\rho\\,dV$.'
        ],
        diagram: 'f2s04-densities',
        caption: 'En cada distribución se marca un elemento: un tramo $dx$, un parche $dA$ o un cubito $dV$. Su carga es la densidad por su tamaño.'
      },
      {
        type: 'concept', heading: 'De la suma a la integral', short: 'Suma → integral',
        body: [
          'Parte la distribución en $N$ trozos de carga $\\Delta q$. Cada trozo es casi una carga puntual, así que da en P un campo $\\Delta\\vec{E} = \\frac{k\\,\\Delta q}{r^2}\\,\\hat{r}$, donde $r$ es su distancia a P y $\\hat{r}$ apunta del trozo hacia P. El campo total es la suma vectorial: $\\vec{E} \\approx \\sum \\frac{k\\,\\Delta q_i}{r_i^2}\\,\\hat{r}_i$.',
          'Mientras más trozos, mejor la aproximación. En el límite $\\Delta q \\to dq$ la suma se vuelve integral, igual que las sumas de Riemann en <a href="../../../calculo-1/sesiones/sesion-09/">la integral de Cálculo 1</a>: $$\\vec{E} = \\int \\frac{k\\,dq}{r^2}\\,\\hat{r}$$',
          'La integral de un vector se hace <strong>por componentes</strong>: $E_x = \\int dE_x$ y $E_y = \\int dE_y$. Por eso conviene usar la simetría antes de integrar: si una componente se cancela, ni la calculas. En el lab puedes ver cómo la suma con $N$ trozos se acerca a la integral.'
        ],
        diagram: 'f2s04-sum',
        caption: 'Ocho trozos de una varilla. Cada uno da en P su flecha $d\\vec{E}$ (alejándose del trozo, porque la carga es positiva). Las componentes horizontales se cancelan por pares; la suma apunta hacia arriba.'
      },
      {
        type: 'callout', heading: 'Siempre los mismos 6 pasos',
        body: [
          '<strong>1.</strong> Dibuja la geometría y elige el elemento: $dq = \\lambda\\,dx$, $\\lambda\\,ds$, $\\sigma\\,dA$ o $\\rho\\,dV$. <strong>2.</strong> Escribe $r$, $\\hat{r}$ y $dE = k\\,dq/r^2$ del elemento al punto. <strong>3.</strong> Usa la simetría: qué componentes se cancelan y cuáles sobreviven. <strong>4.</strong> Plantea la integral con su variable y sus límites. <strong>5.</strong> Integra paso a paso. <strong>6.</strong> Comprueba unidades (N/C) y límites: lejos debe parecer carga puntual; muy grande, el caso infinito.',
          'Las cinco derivaciones de abajo siguen esta plantilla. Recórrelas paso a paso con «Siguiente».'
        ]
      },
      {
        type: 'explainer', heading: 'Varilla: punto en su eje', short: 'Varilla en su eje',
        title: 'Varilla de largo L, punto P a una distancia d de su extremo',
        intro: 'El caso más directo: todo está sobre una línea, así que no hay componentes que cancelar.',
        diagram: 'f2s04-rod-axis',
        steps: [
          { text: '<strong>Elige dq.</strong> La varilla va de $x = 0$ a $x = L$ con $\\lambda = Q/L$. Un trozo de largo $dx$ en la posición $x$ tiene $dq = \\lambda\\,dx$.', state: { k: 1, g: 1 } },
          { text: '<strong>r y dE.</strong> Del trozo a P hay $r = L + d - x$ y su campo apunta hacia $+x$: $dE = \\frac{k\\lambda\\,dx}{(L + d - x)^2}$.', state: { k: 2, g: 1 } },
          { text: '<strong>Simetría.</strong> Todos los trozos están sobre el eje, así que todas las $dE$ apuntan igual. No se cancela nada: se suman las magnitudes.', state: { k: 3, g: 1 } },
          { text: '<strong>La integral.</strong> La variable es $x$, de $0$ a $L$: $E = \\int_0^L \\frac{k\\lambda\\,dx}{(L + d - x)^2}$.', state: { k: 4, g: 1 } },
          { text: '<strong>Integra.</strong> Con $u = L + d - x$ la integral da $\\frac{1}{d} - \\frac{1}{L + d} = \\frac{L}{d\\,(d + L)}$. Como $\\lambda L = Q$: $E = \\frac{kQ}{d\\,(d + L)}$.', state: { k: 5, g: 1 } },
          { text: '<strong>Comprueba.</strong> Unidades: $\\frac{\\text{N·m}^2}{\\text{C}^2}\\cdot\\frac{\\text{C}}{\\text{m}^2} = \\text{N/C}$. Lejos ($d \\gg L$): $d\\,(d + L) \\approx d^2$ y queda $kQ/d^2$, una carga puntual.', state: { k: 6, g: 0.06 } }
        ]
      },
      {
        type: 'explainer', heading: 'Varilla: punto en la bisectriz', short: 'Varilla en la bisectriz',
        title: 'Varilla de largo L, punto P a una altura y sobre su centro',
        intro: 'Aquí aparece el factor de proyección: cada $dE$ está inclinada y solo cuenta su parte vertical.',
        diagram: 'f2s04-rod-bisector',
        steps: [
          { text: '<strong>Elige dq.</strong> La varilla va de $-L/2$ a $L/2$ sobre el eje $x$ y P está a una altura $y$ sobre el centro. Un trozo en $x$ tiene $dq = \\lambda\\,dx$.', state: { k: 1, g: 1 } },
          { text: '<strong>r y dE.</strong> Del trozo a P: $r = \\sqrt{x^2 + y^2}$ y $dE = \\frac{k\\lambda\\,dx}{x^2 + y^2}$, en la dirección de $\\hat{r}$. Su ángulo con el eje $y$ cumple $\\cos\\theta = y/r$.', state: { k: 2, g: 1 } },
          { text: '<strong>Simetría.</strong> El trozo en $-x$ da una $dE$ espejo: las componentes en $x$ se cancelan por pares y las de $y$ se suman. Solo integras $dE_y = dE\\cos\\theta$.', state: { k: 3, g: 1 } },
          { text: '<strong>La integral.</strong> Con $\\cos\\theta = y/r$ sube un $r$ al denominador: $E = \\int_{-L/2}^{L/2} \\frac{k\\lambda\\,y\\,dx}{(x^2 + y^2)^{3/2}}$.', state: { k: 4, g: 1 } },
          { text: '<strong>Integra.</strong> Con $x = y\\tan\\phi$ sale $\\int \\frac{dx}{(x^2 + y^2)^{3/2}} = \\frac{x}{y^2\\sqrt{x^2 + y^2}}$. Evaluada de $-L/2$ a $L/2$: $E = \\frac{kQ}{y\\sqrt{y^2 + L^2/4}}$.', state: { k: 5, g: 1 } },
          { text: '<strong>Comprueba.</strong> Lejos ($y \\gg L$) queda $kQ/y^2$. Varilla infinita ($L \\to \\infty$): $\\sqrt{y^2 + L^2/4} \\approx L/2$ y $E = \\frac{2k\\lambda}{y}$, el campo de una línea infinita.', state: { k: 6, g: 1.36 } }
        ]
      },
      {
        type: 'explainer', heading: 'Arco: campo en su centro', short: 'Arco en el centro',
        title: 'Semicírculo de radio R, campo en su centro',
        intro: 'En el centro de un arco todos los trozos están a la misma distancia: la integral es en el ángulo.',
        diagram: 'f2s04-arc',
        steps: [
          { text: '<strong>Elige dq.</strong> El semicírculo tiene radio $R$ y carga $Q$, así que $\\lambda = \\frac{Q}{\\pi R}$. Mide $\\theta$ desde el eje de simetría: un trozo de arco $ds = R\\,d\\theta$ tiene $dq = \\lambda R\\,d\\theta$.', state: { k: 1, th: 180 } },
          { text: '<strong>r y dE.</strong> Todos los trozos están a $r = R$ del centro: $dE = \\frac{k\\lambda R\\,d\\theta}{R^2} = \\frac{k\\lambda}{R}\\,d\\theta$, del trozo hacia el centro y más allá.', state: { k: 2, th: 180 } },
          { text: '<strong>Simetría.</strong> El trozo en $-\\theta$ cancela la componente horizontal. Sobrevive la vertical, $dE\\cos\\theta$, que apunta hacia abajo, lejos de la carga.', state: { k: 3, th: 180 } },
          { text: '<strong>La integral.</strong> La variable es $\\theta$, de $-\\pi/2$ a $\\pi/2$: $E = \\int_{-\\pi/2}^{\\pi/2} \\frac{k\\lambda}{R}\\cos\\theta\\,d\\theta$.', state: { k: 4, th: 180 } },
          { text: '<strong>Integra.</strong> $\\int_{-\\pi/2}^{\\pi/2}\\cos\\theta\\,d\\theta = 2$, así que $E = \\frac{2k\\lambda}{R} = \\frac{2kQ}{\\pi R^2}$. Para un arco de ángulo total $\\theta_0$ sale $E = \\frac{2k\\lambda}{R}\\sin\\frac{\\theta_0}{2}$.', state: { k: 5, th: 180 } },
          { text: '<strong>Comprueba.</strong> Arco muy chico: $\\sin\\frac{\\theta_0}{2} \\approx \\frac{\\theta_0}{2}$ y $\\lambda R\\theta_0 = Q$, así que $E \\to kQ/R^2$, una carga puntual. Y el semicírculo da lo mismo que una línea infinita a distancia $R$.', state: { k: 6, th: 30 } }
        ]
      },
      {
        type: 'explainer', heading: 'Anillo: punto en su eje', short: 'Anillo en su eje',
        title: 'Anillo de radio R, punto P a una distancia z sobre su eje',
        intro: 'Todos los trozos están a la misma distancia de P y tienen la misma inclinación: la integral casi se hace sola.',
        diagram: 'f2s04-ring',
        steps: [
          { text: '<strong>Elige dq.</strong> Un anillo de radio $R$ con carga $Q$; P está sobre su eje, a una distancia $z$ del centro. Toma un trozo $dq$ del anillo.', state: { k: 1, g: 1 } },
          { text: '<strong>r y dE.</strong> Todos los trozos están a $r = \\sqrt{z^2 + R^2}$ de P. Cada uno da $dE = \\frac{k\\,dq}{z^2 + R^2}$, inclinada un ángulo $\\theta$ con el eje: $\\cos\\theta = z/r$.', state: { k: 2, g: 1 } },
          { text: '<strong>Simetría.</strong> El trozo opuesto cancela la componente perpendicular al eje. Sobrevive $dE_z = dE\\cos\\theta = \\frac{k\\,z\\,dq}{r^3}$.', state: { k: 3, g: 1 } },
          { text: '<strong>La integral.</strong> $E = \\oint \\frac{k\\,z\\,dq}{r^3}$. Al recorrer el anillo, $z$ y $r$ no cambian: salen de la integral y queda $\\oint dq = Q$.', state: { k: 4, g: 1 } },
          { text: '<strong>Resultado.</strong> $E = \\frac{kQz}{(z^2 + R^2)^{3/2}}$, a lo largo del eje y alejándose del anillo si $Q > 0$.', state: { k: 5, g: 1 } },
          { text: '<strong>Comprueba.</strong> En el centro ($z = 0$) todo se cancela: $E = 0$. Lejos ($z \\gg R$): $(z^2 + R^2)^{3/2} \\approx z^3$ y queda $kQ/z^2$.', state: { k: 6, g: 0.1 } }
        ]
      },
      {
        type: 'explainer', heading: 'Disco: suma de anillos', short: 'Disco en su eje',
        title: 'Disco de radio R, punto P a una distancia z sobre su eje',
        intro: 'Un disco es un montón de anillos, uno dentro de otro. Usas el resultado del anillo como $dE$.',
        diagram: 'f2s04-disk',
        steps: [
          { text: '<strong>Elige dq.</strong> Parte el disco ($\\sigma = Q/\\pi R^2$) en anillos. Uno de radio $r$ y ancho $dr$ tiene área $2\\pi r\\,dr$, así que $dq = \\sigma\\,2\\pi r\\,dr$.', state: { k: 1, g: 1 } },
          { text: '<strong>dE de un anillo.</strong> Ya lo resolviste: ese anillo da en P $dE = \\frac{k\\,z\\,dq}{(z^2 + r^2)^{3/2}}$, a lo largo del eje.', state: { k: 2, g: 1 } },
          { text: '<strong>Simetría.</strong> Cada anillo ya canceló sus componentes perpendiculares y todos empujan hacia $+z$: se suman directo.', state: { k: 3, g: 1 } },
          { text: '<strong>La integral.</strong> La variable es $r$, de $0$ a $R$: $E = \\int_0^R \\frac{2\\pi k\\sigma z\\,r\\,dr}{(z^2 + r^2)^{3/2}}$.', state: { k: 4, g: 1 } },
          { text: '<strong>Integra.</strong> Con $u = z^2 + r^2$, $du = 2r\\,dr$: $E = 2\\pi k\\sigma\\left(1 - \\frac{z}{\\sqrt{z^2 + R^2}}\\right)$. Como $2\\pi k = \\frac{1}{2\\varepsilon_0}$: $E = \\frac{\\sigma}{2\\varepsilon_0}\\left(1 - \\frac{z}{\\sqrt{z^2 + R^2}}\\right)$.', state: { k: 5, g: 1 } },
          { text: '<strong>Comprueba.</strong> Disco enorme ($R \\to \\infty$): $\\frac{z}{\\sqrt{z^2 + R^2}} \\to 0$ y $E = \\frac{\\sigma}{2\\varepsilon_0}$, el plano infinito, que no depende de $z$. Lejos ($z \\gg R$) vuelve a ser $kQ/z^2$.', state: { k: 6, g: 1.15 } }
        ]
      },
      {
        type: 'callout', heading: 'Tres resultados que vas a volver a usar',
        body: [
          '<strong>Línea infinita:</strong> $E = \\frac{2k\\lambda}{r}$, baja como $1/r$, no como $1/r^2$. <strong>Plano infinito:</strong> $E = \\frac{\\sigma}{2\\varepsilon_0}$, igual a cualquier distancia: es un campo uniforme. <strong>Anillo en su centro:</strong> $E = 0$.',
          'En S08 vas a sacar los mismos resultados con la ley de Gauss, en dos renglones. Las integrales de hoy son la prueba de que Gauss no hace trampa.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: campo de una distribución continua', short: 'Receta',
        steps: [
          { text: 'Dibuja la distribución, el punto P y un elemento genérico. Escribe su carga: $dq = \\lambda\\,dx$, $\\lambda R\\,d\\theta$, $\\sigma\\,2\\pi r\\,dr$…', tip: 'Calcula la densidad con la carga y el tamaño: $\\lambda = Q/L$, no $Q$. En un semicírculo el largo es $\\pi R$, no $R$.' },
          { text: 'Escribe la distancia $r$ <strong>de ese elemento</strong> a P y la dirección de su $d\\vec{E}$.', tip: 'Cada $dq$ tiene su propia $r$. Usar la distancia al centro para todos es el error más común.' },
          { text: 'Usa la simetría: decide qué componentes se cancelan y quédate con la que sobrevive, multiplicada por su factor de proyección ($\\cos\\theta$).', tip: 'Si sumas magnitudes completas sin el $\\cos\\theta$, el resultado sale demasiado grande.' },
          { text: 'Plantea la integral: una sola variable ($x$, $\\theta$ o $r$) y sus límites. Saca de la integral lo que no cambia.' },
          { text: 'Integra y comprueba: unidades en N/C, lejos debe dar $kQ/r^2$ y el caso infinito debe salir al crecer el tamaño.' }
        ]
      },
      {
        type: 'example', heading: 'Varilla: punto en su eje',
        problem: '<p>Una varilla de $' + fx(e1.L * 100, 0) + '\\ \\text{cm}$ tiene una carga de $' + fx(e1.Q * 1e9, 1) + '\\ \\text{nC}$ repartida de forma uniforme. ¿Cuánto vale el campo eléctrico en un punto sobre su eje, a $' + fx(e1.d * 100, 0) + '\\ \\text{cm}$ de uno de sus extremos? Usa ' + KTXT + '.</p>',
        steps: [
          { text: 'Todo está sobre el eje: no hay componentes que cancelar. Usa el resultado de la derivación, en metros y coulombs.', math: 'E = \\frac{kQ}{d\\,(d + L)}' },
          { text: 'Sustituye $L = ' + fx(e1.L) + '\\ \\text{m}$, $d = ' + fx(e1.d) + '\\ \\text{m}$ y $Q = ' + fx(e1.Q * 1e9, 1) + ' \\times 10^{-9}\\ \\text{C}$.', math: '\\begin{aligned} E &= \\frac{(8.99 \\times 10^{9})(' + fx(e1.Q * 1e9, 1) + ' \\times 10^{-9})}{(' + fx(e1.d) + ')(' + fx(e1.d + e1.L) + ')} \\\\ &= ' + sci(e1.E) + '\\ \\text{N/C} \\end{aligned}' },
          { text: 'Compara con una carga puntual en el extremo cercano: $kQ/d^2$ daría más, porque supone que toda la carga está a $d$.', math: '\\frac{kQ}{d^2} = ' + sci(e1.far) + '\\ \\text{N/C}' }
        ],
        answer: '$E \\approx ' + sci(e1.E) + '\\ \\text{N/C}$, a lo largo del eje y alejándose de la varilla.',
        verify: { lab: 'call', mod: 'chargeIntegral', fn: 'rodAxis', args: [e1.L, e1.Q, e1.d], value: e1.E }
      },
      {
        type: 'example', heading: 'Anillo: punto en su eje',
        problem: '<p>Un anillo de $' + fx(e2.R * 100, 0) + '\\ \\text{cm}$ de radio tiene una carga de $' + fx(e2.Q * 1e9, 1) + '\\ \\text{nC}$. ¿Qué campo produce en un punto de su eje a $' + fx(e2.z * 100, 0) + '\\ \\text{cm}$ del centro? Usa ' + KTXT + '.</p>',
        steps: [
          { text: 'Distancia de cualquier trozo del anillo al punto.', math: '\\begin{aligned} r &= \\sqrt{z^2 + R^2} \\\\ &= \\sqrt{(' + fx(e2.z) + ')^2 + (' + fx(e2.R) + ')^2} \\\\ &= ' + fx(e2.r, 3) + '\\ \\text{m} \\end{aligned}' },
          { text: 'Solo sobrevive la componente a lo largo del eje: $E = kQz/r^3$. Primero $kQ$.', math: '\\begin{aligned} kQ &= (8.99 \\times 10^{9})(' + fx(e2.Q * 1e9, 1) + ' \\times 10^{-9}) \\\\ &= ' + fx(k * e2.Q) + '\\ \\text{N·m}^2/\\text{C} \\\\ E &= \\frac{(' + fx(k * e2.Q) + ')(' + fx(e2.z) + ')}{(' + fx(e2.r, 3) + ')^3} \\\\ &= ' + sci(e2.E) + '\\ \\text{N/C} \\end{aligned}' },
          { text: 'Si olvidaras el $\\cos\\theta = z/r$, saldría $kQ/r^2$, que es más grande: sumarías también las componentes que se cancelan.' }
        ],
        answer: '$E \\approx ' + sci(e2.E) + '\\ \\text{N/C}$, sobre el eje y alejándose del anillo.',
        verify: { lab: 'call', mod: 'chargeIntegral', fn: 'ring', args: [e2.R, e2.Q, e2.z], value: e2.E }
      },
      {
        type: 'example', heading: 'Disco contra plano infinito',
        problem: '<p>Un disco de plástico de $' + fx(e3.R * 100, 0) + '\\ \\text{cm}$ de radio tiene $' + fx(e3.Q * 1e9, 0) + '\\ \\text{nC}$ repartidos en su cara. ¿Qué campo hay sobre su eje a $' + fx(e3.z * 100, 0) + '\\ \\text{cm}$ del centro? ¿Cuánto daría si lo trataras como plano infinito? Usa ' + ETXT + '.</p>',
        steps: [
          { text: 'Densidad superficial.', math: '\\begin{aligned} \\sigma &= \\frac{Q}{\\pi R^2} \\\\ &= \\frac{' + fx(e3.Q * 1e9, 0) + ' \\times 10^{-9}}{\\pi(' + fx(e3.R) + ')^2} \\\\ &= ' + sci(e3.sig) + '\\ \\text{C/m}^2 \\end{aligned}' },
          { text: 'El plano infinito da $\\sigma/2\\varepsilon_0$.', math: '\\begin{aligned} \\frac{\\sigma}{2\\varepsilon_0} &= \\frac{' + sci(e3.sig) + '}{2(8.85 \\times 10^{-12})} \\\\ &= ' + sci(e3.plane) + '\\ \\text{N/C} \\end{aligned}' },
          { text: 'El disco finito lleva el factor de corrección.', math: '\\begin{aligned} f &= 1 - \\frac{z}{\\sqrt{z^2 + R^2}} \\\\ &= 1 - \\frac{' + fx(e3.z) + '}{\\sqrt{' + fx(e3.z) + '^2 + ' + fx(e3.R) + '^2}} \\\\ &= ' + fx(e3.f, 4) + ' \\end{aligned}' },
          { text: 'Multiplica.', math: '\\begin{aligned} E &= \\frac{\\sigma}{2\\varepsilon_0}\\,f \\\\ &= (' + sci(e3.plane) + ')(' + fx(e3.f, 4) + ') \\\\ &= ' + sci(e3.E) + '\\ \\text{N/C} \\end{aligned}' }
        ],
        answer: 'El disco da $E \\approx ' + sci(e3.E) + '\\ \\text{N/C}$; el plano infinito daría $' + sci(e3.plane) + '\\ \\text{N/C}$. A esta distancia el disco todavía no «parece infinito».',
        verify: { lab: 'call', mod: 'chargeIntegral', fn: 'disk', args: [e3.R, e3.Q, e3.z], value: e3.E }
      },
      {
        type: 'example', heading: 'Semicírculo: campo en el centro',
        problem: '<p>Un alambre doblado en semicírculo de $' + fx(e4.R * 100, 0) + '\\ \\text{cm}$ de radio tiene una carga de $' + fx(e4.Q * 1e9, 1) + '\\ \\text{nC}$. ¿Cuánto vale el campo en el centro del semicírculo? Usa ' + KTXT + '.</p>',
        steps: [
          { text: 'El largo del alambre es medio perímetro, $\\pi R$.', math: '\\begin{aligned} \\lambda &= \\frac{Q}{\\pi R} = \\frac{' + fx(e4.Q * 1e9, 1) + ' \\times 10^{-9}}{\\pi(' + fx(e4.R) + ')} \\\\ &= ' + sci(e4.lam) + '\\ \\text{C/m} \\end{aligned}' },
          { text: 'Usa el resultado de la derivación: $E = 2k\\lambda/R$.', math: '\\begin{aligned} E &= \\frac{2(8.99 \\times 10^{9})(' + sci(e4.lam) + ')}{' + fx(e4.R) + '} \\\\ &= ' + sci(e4.E) + '\\ \\text{N/C} \\end{aligned}' },
          { text: 'Dirección: sobre el eje de simetría, alejándose del alambre (la carga es positiva).' }
        ],
        answer: '$E \\approx ' + sci(e4.E) + '\\ \\text{N/C}$, apuntando del alambre hacia el otro lado del centro.',
        verify: { lab: 'call', mod: 'chargeIntegral', fn: 'semicircle', args: [e4.R, e4.Q], value: e4.E }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué no puedo usar $kQ/r^2$ con la distancia al centro?', a: 'Porque cada pedacito está a una distancia distinta y su campo apunta en otra dirección. $kQ/r^2$ solo sirve cuando estás tan lejos que la distribución se ve como un punto. Por eso cada derivación termina comprobando ese límite.' },
          { q: '¿Cuándo aparece el $\\cos\\theta$?', a: 'Cuando las $dE$ están inclinadas respecto a la dirección que sobrevive. En la bisectriz, el arco y el anillo, solo cuenta la parte de cada $dE$ a lo largo del eje de simetría: $dE\\cos\\theta$. En la varilla vista desde su eje no hay $\\cos\\theta$ porque todo es colineal.' },
          { q: '¿Por qué el plano infinito no depende de la distancia?', a: 'Si te alejas, cada pedazo del plano te queda más lejos (su campo baja), pero ves más plano «de frente» (más pedazos apuntan hacia ti). Los dos efectos se compensan exacto: $E = \\sigma/2\\varepsilon_0$ a cualquier distancia.' },
          { q: '¿Es $\\sigma/\\varepsilon_0$ o $\\sigma/2\\varepsilon_0$?', a: 'Para una hoja de carga aislada, $\\sigma/2\\varepsilon_0$: la mitad del campo sale por cada lado. El $\\sigma/\\varepsilon_0$ aparece junto a la superficie de un conductor o entre las placas de un capacitor, donde los campos de dos hojas se suman (S08 y S09).' },
          { q: '¿Cuándo uso $dx$, $ds$ o $R\\,d\\theta$?', a: 'Depende de la variable que recorra la distribución. En una recta, $dx$. En un arco, el largo de un pedacito es $ds = R\\,d\\theta$, y conviene integrar en el ángulo porque $r = R$ no cambia.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Con la densidad escribes $dq$: $\\lambda\\,dx$, $\\lambda R\\,d\\theta$, $\\sigma\\,dA$ o $\\rho\\,dV$.',
          'Cada $dq$ es una carga puntual con su propia $r$; el campo total es $\\vec{E} = \\int k\\,dq\\,\\hat{r}/r^2$, por componentes.',
          'La simetría cancela componentes: solo integras la que sobrevive, con su $\\cos\\theta$.',
          'Comprueba siempre: lejos sale $kQ/r^2$; la varilla infinita da $2k\\lambda/r$ y el plano infinito, $\\sigma/2\\varepsilon_0$.'
        ]
      }
    ],

    lab: {
      type: 'charge-integral', title: 'Suma de dq → integral',
      intro: 'Elige una geometría y sus medidas. El lab la parte en $N$ trozos, dibuja cada $d\\vec{E}$ cabeza con cola y compara la suma con la integral: sube $N$ y mira cómo converge. Escribe tu $E$ y el lab te dice si olvidaste el $\\cos\\theta$, usaste la distancia al centro o te equivocaste con el factor 2 del disco.',
      cfg: { start: { geom: 'rod-bisector', size: 20, Q: 5, dist: 10, ang: 180, N: 8 } }
    },

    formulas: [
      { label: 'Densidades', tex: '\\lambda = \\frac{Q}{L},\\ \\ \\sigma = \\frac{Q}{A},\\ \\ \\rho = \\frac{Q}{V}' },
      { label: 'Campo de un elemento', tex: 'd\\vec{E} = \\frac{k\\,dq}{r^2}\\,\\hat{r}' },
      { label: 'Varilla, en su eje', tex: 'E = \\frac{kQ}{d\\,(d + L)}' },
      { label: 'Varilla, en la bisectriz', tex: 'E = \\frac{kQ}{y\\sqrt{y^2 + L^2/4}}' },
      { label: 'Línea infinita', tex: 'E = \\frac{2k\\lambda}{r}' },
      { label: 'Semicírculo, en el centro', tex: 'E = \\frac{2k\\lambda}{R} = \\frac{2kQ}{\\pi R^2}' },
      { label: 'Anillo, en su eje', tex: 'E = \\frac{kQz}{(z^2 + R^2)^{3/2}}' },
      { label: 'Disco, en su eje', tex: 'E = \\frac{\\sigma}{2\\varepsilon_0}\\Big(1 - \\frac{z}{\\sqrt{z^2 + R^2}}\\Big)' },
      { label: 'Plano infinito', tex: 'E = \\frac{\\sigma}{2\\varepsilon_0}' },
      { label: 'Constantes', tex: 'k = 8.99 \\times 10^9,\\ \\ \\varepsilon_0 = 8.85 \\times 10^{-12}' }
    ],

    exercises: [
      {
        id: 'f2-s04-varilla-eje', title: 'Varilla: punto en su eje',
        vars: { L: [10, 40, 5], Q: [2, 12, 1], d: [2, 20, 1] },
        prompt: function (v) { return '<p>Una varilla de $' + v.L + '\\ \\text{cm}$ tiene $' + v.Q + '\\ \\text{nC}$ repartidos de forma uniforme. ¿Cuánto vale el campo eléctrico en un punto de su eje a $' + v.d + '\\ \\text{cm}$ del extremo más cercano? Da $E$ en N/C. Usa ' + KTXT + '.</p>'; },
        check: 'numeric', unit: 'N/C',
        answer: function (v) { return Erod(cm(v.L), nC(v.Q), cm(v.d)); },
        mistakes: {
          centerDistance: function (v) { var r = cm(v.d) + cm(v.L) / 2; return k * nC(v.Q) / (r * r); },
          nearEnd: function (v) { return k * nC(v.Q) / (cm(v.d) * cm(v.d)); },
          noMeters: function (v) { return Erod(cm(v.L), nC(v.Q), cm(v.d)) * 1e-4; }
        },
        feedback: [
          { when: 'centerDistance', say: 'Usaste la distancia al centro de la varilla para toda la carga. Cada trozo está a su propia distancia $r = L + d - x$: integra.' },
          { when: 'nearEnd', say: 'Eso supone que toda la carga está en el extremo cercano. Los trozos lejanos aportan menos: $E = \\frac{kQ}{d(d + L)}$.' },
          { when: 'noMeters', say: 'Te faltó pasar los centímetros a metros: $d$ y $L$ van en m.' }
        ],
        oracle: { lab: 'call', mod: 'chargeIntegral', fn: 'rodAxis', args: function (v) { return [cm(v.L), nC(v.Q), cm(v.d)]; } },
        hint: 'Integra $dE = \\frac{k\\lambda\\,dx}{(L + d - x)^2}$ de $0$ a $L$, o usa directo $E = \\frac{kQ}{d\\,(d + L)}$ con todo en metros.',
        solution: function (v) {
          var E = Erod(cm(v.L), nC(v.Q), cm(v.d));
          return '$$\\begin{aligned} ' + kQline(v.Q) + 'E &= \\frac{kQ}{d\\,(d + L)} \\\\ &= \\frac{' + fx(k * nC(v.Q)) + '}{(' + fx(cm(v.d)) + ')(' + fx(cm(v.d) + cm(v.L)) + ')} \\\\ &= ' + sci(E) + '\\ \\text{N/C} \\end{aligned}$$';
        }
      },
      {
        id: 'f2-s04-anillo', title: 'Anillo: punto en su eje',
        vars: { R: [3, 15, 1], Q: [2, 20, 1], z: [2, 30, 1] },
        prompt: function (v) { return '<p>Un anillo de $' + v.R + '\\ \\text{cm}$ de radio tiene una carga de $' + v.Q + '\\ \\text{nC}$. ¿Qué campo produce en un punto de su eje a $' + v.z + '\\ \\text{cm}$ de su centro? Da $E$ en N/C. Usa ' + KTXT + '.</p>'; },
        check: 'numeric', unit: 'N/C',
        answer: function (v) { return Ering(cm(v.R), nC(v.Q), cm(v.z)); },
        mistakes: {
          noCos: function (v) { var R = cm(v.R), z = cm(v.z); return k * nC(v.Q) / (z * z + R * R); },
          centerDistance: function (v) { var z = cm(v.z); return k * nC(v.Q) / (z * z); }
        },
        feedback: [
          { when: 'noCos', say: 'Sumaste las magnitudes completas. Solo sobrevive la componente sobre el eje: multiplica por $\\cos\\theta = z/r$.' },
          { when: 'centerDistance', say: 'Usaste la distancia al centro, $z$. La carga está en el anillo, a $r = \\sqrt{z^2 + R^2}$ del punto.' }
        ],
        oracle: { lab: 'call', mod: 'chargeIntegral', fn: 'ring', args: function (v) { return [cm(v.R), nC(v.Q), cm(v.z)]; } },
        hint: 'Todos los trozos están a $r = \\sqrt{z^2 + R^2}$ y las componentes perpendiculares se cancelan: $E = \\frac{kQz}{r^3}$.',
        solution: function (v) {
          var R = cm(v.R), z = cm(v.z), r = Math.sqrt(z * z + R * R);
          return '$$\\begin{aligned} r &= \\sqrt{' + fx(z) + '^2 + ' + fx(R) + '^2} \\\\ &= ' + fx(r, 4) + '\\ \\text{m} \\end{aligned}$$ $$\\begin{aligned} ' + kQline(v.Q) + 'E &= \\frac{kQz}{r^3} = \\frac{(' + fx(k * nC(v.Q)) + ')(' + fx(z) + ')}{(' + fx(r, 4) + ')^3} \\\\ &= ' + sci(Ering(R, nC(v.Q), z)) + '\\ \\text{N/C} \\end{aligned}$$';
        }
      },
      {
        id: 'f2-s04-disco', title: 'Disco: punto en su eje',
        vars: { R: [5, 20, 1], Q: [5, 40, 5], z: [1, 20, 1] },
        prompt: function (v) { return '<p>Un disco de $' + v.R + '\\ \\text{cm}$ de radio tiene $' + v.Q + '\\ \\text{nC}$ repartidos de forma uniforme en su cara. ¿Cuánto vale el campo sobre su eje a $' + v.z + '\\ \\text{cm}$ del centro? Da $E$ en N/C. Usa ' + ETXT + '.</p>'; },
        check: 'numeric', unit: 'N/C',
        answer: function (v) { return Edisk(cm(v.R), nC(v.Q), cm(v.z)); },
        mistakes: {
          double: function (v) { return 2 * Edisk(cm(v.R), nC(v.Q), cm(v.z)); },
          plane: function (v) { var R = cm(v.R); return nC(v.Q) / (Math.PI * R * R) / (2 * eps0); }
        },
        feedback: [
          { when: 'double', say: 'Te sobra un factor de 2: para una hoja de carga es $\\sigma/(2\\varepsilon_0)$, no $\\sigma/\\varepsilon_0$.' },
          { when: 'plane', say: 'Ese es el plano infinito. El disco es finito: multiplica por $1 - \\frac{z}{\\sqrt{z^2 + R^2}}$.' }
        ],
        oracle: { lab: 'call', mod: 'chargeIntegral', fn: 'disk', args: function (v) { return [cm(v.R), nC(v.Q), cm(v.z)]; } },
        hint: 'Primero $\\sigma = Q/\\pi R^2$. Luego $E = \\frac{\\sigma}{2\\varepsilon_0}\\left(1 - \\frac{z}{\\sqrt{z^2 + R^2}}\\right)$.',
        solution: function (v) {
          var R = cm(v.R), z = cm(v.z), s = nC(v.Q) / (Math.PI * R * R), f = 1 - z / Math.sqrt(z * z + R * R);
          return '$$\\begin{aligned} \\sigma &= \\frac{' + v.Q + ' \\times 10^{-9}}{\\pi(' + fx(R) + ')^2} \\\\ &= ' + sci(s) + '\\ \\text{C/m}^2 \\end{aligned}$$ $$\\begin{aligned} f &= 1 - \\frac{z}{\\sqrt{z^2 + R^2}} \\\\ &= ' + fx(f, 4) + ' \\end{aligned}$$ $$\\begin{aligned} E &= \\frac{\\sigma}{2\\varepsilon_0}\\,f \\\\ &= \\frac{' + sci(s) + '}{2(8.85 \\times 10^{-12})}(' + fx(f, 4) + ') \\\\ &= ' + sci(Edisk(R, nC(v.Q), z)) + '\\ \\text{N/C} \\end{aligned}$$';
        }
      },
      {
        id: 'f2-s04-semicirculo', title: 'Semicírculo: campo en el centro',
        vars: { R: [4, 20, 1], Q: [1, 15, 1] },
        prompt: function (v) { return '<p>Un alambre en forma de semicírculo de $' + v.R + '\\ \\text{cm}$ de radio tiene $' + v.Q + '\\ \\text{nC}$ repartidos de forma uniforme. ¿Cuánto vale el campo eléctrico en el centro del semicírculo? Da $E$ en N/C. Usa ' + KTXT + '.</p>'; },
        check: 'numeric', unit: 'N/C',
        answer: function (v) { return Esemi(cm(v.R), nC(v.Q)); },
        mistakes: {
          noCos: function (v) { var R = cm(v.R); return k * nC(v.Q) / (R * R); },
          lengthR: function (v) { var R = cm(v.R); return 2 * k * nC(v.Q) / (R * R); },
          forgotTwo: function (v) { return Esemi(cm(v.R), nC(v.Q)) / 2; }
        },
        feedback: [
          { when: 'noCos', say: 'Sumaste las magnitudes de todas las $dE$. Las horizontales se cancelan: integra $dE\\cos\\theta$.' },
          { when: 'lengthR', say: 'El largo del semicírculo es $\\pi R$, no $R$: $\\lambda = Q/(\\pi R)$.' },
          { when: 'forgotTwo', say: 'Te falta el 2: $\\int_{-\\pi/2}^{\\pi/2}\\cos\\theta\\,d\\theta = 2$.' }
        ],
        oracle: { lab: 'call', mod: 'chargeIntegral', fn: 'semicircle', args: function (v) { return [cm(v.R), nC(v.Q)]; } },
        hint: 'Con $\\lambda = Q/\\pi R$ y $r = R$ para todos los trozos: $E = \\int_{-\\pi/2}^{\\pi/2} \\frac{k\\lambda}{R}\\cos\\theta\\,d\\theta = \\frac{2k\\lambda}{R}$.',
        solution: function (v) {
          var R = cm(v.R), lam = nC(v.Q) / (Math.PI * R);
          return '$$\\begin{aligned} \\lambda &= \\frac{' + v.Q + ' \\times 10^{-9}}{\\pi(' + fx(R) + ')} \\\\ &= ' + sci(lam) + '\\ \\text{C/m} \\end{aligned}$$ $$\\begin{aligned} E &= \\frac{2k\\lambda}{R} \\\\ &= \\frac{2(8.99 \\times 10^{9})(' + sci(lam) + ')}{' + fx(R) + '} \\\\ &= ' + sci(Esemi(R, nC(v.Q))) + '\\ \\text{N/C} \\end{aligned}$$';
        }
      },
      {
        id: 'f2-s04-anillo-max', title: '¿Dónde es máximo el campo del anillo?',
        vars: { R: [2, 30, 1] },
        prompt: function (v) { return '<p>Sobre el eje de un anillo cargado de $' + v.R + '\\ \\text{cm}$ de radio, el campo vale cero en el centro y tiende a cero muy lejos. ¿A qué distancia del centro, en cm, es máximo?</p>'; },
        check: 'numeric', unit: 'cm',
        answer: function (v) { return v.R / Math.SQRT2; },
        mistakes: {
          atR: function (v) { return v.R; },
          half: function (v) { return v.R / 2; },
          timesSqrt2: function (v) { return v.R * Math.SQRT2; }
        },
        feedback: [
          { when: 'atR', say: 'No es en $z = R$. Deriva $E(z) = \\frac{kQz}{(z^2 + R^2)^{3/2}}$ e iguala a cero.' },
          { when: 'half', say: 'Revisa la derivada: al derivar $(z^2 + R^2)^{-3/2}$ sale $-3z\\,(z^2 + R^2)^{-5/2}$, y queda $R^2 = 2z^2$.' },
          { when: 'timesSqrt2', say: 'Despejaste al revés: de $R^2 = 2z^2$ sale $z = R/\\sqrt{2}$.' }
        ],
        oracle: { lab: 'call', mod: 'chargeIntegral', fn: 'ringMaxZ', args: function (v) { return [v.R]; } },
        hint: 'Deriva $E(z)$ con la regla del producto: $\\frac{dE}{dz} = kQ\\,\\frac{R^2 - 2z^2}{(z^2 + R^2)^{5/2}}$. Iguala a cero.',
        solution: function (v) { return '$$\\begin{aligned} \\frac{dE}{dz} &= kQ\\,\\frac{(z^2 + R^2) - 3z^2}{(z^2 + R^2)^{5/2}} \\\\ &= 0 \\end{aligned}$$ $$\\begin{aligned} R^2 &= 2z^2 \\\\ z &= \\frac{R}{\\sqrt{2}} = \\frac{' + v.R + '}{\\sqrt{2}} \\\\ &= ' + fx(v.R / Math.SQRT2) + '\\ \\text{cm} \\end{aligned}$$'; }
      }
    ],

    quiz: { tags: ['f2.S04'], count: 8 },

    errors: [
      'Usar $kQ/r^2$ con la distancia al centro de la distribución: cada $dq$ tiene su propia $r$.',
      'Sumar las magnitudes de las $dE$ sin el factor de proyección $\\cos\\theta$: el resultado sale demasiado grande.',
      'Calcular mal la densidad: en un semicírculo $\\lambda = Q/(\\pi R)$, no $Q/R$; en un disco $\\sigma = Q/(\\pi R^2)$.',
      'Confundir $\\sigma/2\\varepsilon_0$ (una hoja de carga) con $\\sigma/\\varepsilon_0$, o usar el plano infinito para un disco finito.',
      'Olvidar pasar cm a m y nC a C antes de sustituir.',
      'Sacar de la integral algo que sí cambia con la variable (como $r$ en una varilla).'
    ],

    teacher: {
      plan: [
        'Abre con el concepto de densidad y el «de la suma a la integral»: que vean el lab con $N = 1$, $N = 8$ y $N = 60$.',
        'Haz en el pizarrón la varilla en el eje y la bisectriz con los 6 pasos; que ellos hagan el anillo con la misma plantilla.',
        'El disco como suma de anillos y el límite al plano infinito: anticipa Gauss (S08) y los capacitores (S09).',
        'Cierra con el lab: el error del $\\cos\\theta$ ya viene cargado.'
      ],
      check: [
        'Que escriban $r$ de un elemento genérico, no del centro.',
        'Que digan qué componentes se cancelan antes de integrar.',
        'Que comprueben el límite lejano de cada resultado.'
      ],
      note: 'Las integrales usan sustitución y $x = y\\tan\\phi$ (Cálculo 1). Si el grupo no la domina, da la integral de tabla y concéntrate en el planteamiento (pasos 1 a 4).'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §5.5 “Calculating Electric Fields of Charge Distributions”. <a href="https://openstax.org/books/university-physics-volume-2/pages/5-5-calculating-electric-fields-of-charge-distributions">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §5.4 “Electric Field”. <a href="https://openstax.org/books/university-physics-volume-2/pages/5-4-electric-field">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-03',
    next: 'sesion-05'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
