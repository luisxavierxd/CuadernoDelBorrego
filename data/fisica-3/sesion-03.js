/* =====================================================================
   Física 3 · S03 · Movimiento circular en un campo magnético: selector de velocidad,
   espectrómetro y ciclotrón (bloque A · Fuerza magnética).
   Fuentes: OpenStax, University Physics Volume 2, §11.3 y §11.7 (CC BY-NC-SA 4.0).
   e = 1.60 × 10⁻¹⁹ C, mₚ = 1.67 × 10⁻²⁷ kg, mₑ = 9.11 × 10⁻³¹ kg, u = 1.66 × 10⁻²⁷ kg.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.orbit (lab cyclotron-orbit).
   ===================================================================== */
(function () {
  var E = 1.60e-19, MP = 1.67e-27, ME = 9.11e-31, U = 1.66e-27, RAD = Math.PI / 180;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function sci(v, d) {
    d = d == null ? 2 : d;
    if (v === 0) return '0';
    var p = Math.floor(Math.log10(Math.abs(v)));
    if (p >= -2 && p <= 3) return fx(v, d + 1);
    var m = v / Math.pow(10, p);
    if (Math.abs(+m.toFixed(d)) >= 10) { m /= 10; p += 1; }
    return m.toFixed(d) + ' \\times 10^{' + p + '}';
  }
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

  // Ejemplo 1: protón a 3.0 × 10⁶ m/s en 0.50 T.
  var e1 = { v: 3.0e6, B: 0.50 }; e1.r = MP * e1.v / (E * e1.B); e1.T = 2 * Math.PI * MP / (E * e1.B); e1.f = 1 / e1.T;
  // Ejemplo 2: electrón a 2.0 × 10⁷ m/s en 4.0 mT, a 30° del campo (hélice).
  var e2 = { v: 2.0e7, B: 4.0e-3, a: 30 }; e2.vpar = e2.v * Math.cos(e2.a * RAD); e2.vperp = e2.v * Math.sin(e2.a * RAD);
  e2.r = ME * e2.vperp / (E * e2.B); e2.T = 2 * Math.PI * ME / (E * e2.B); e2.pitch = e2.vpar * e2.T;
  // Ejemplo 3: selector (E = 4.0 × 10⁴ N/C, B₁ = 0.20 T) y espectrómetro (B₂ = 0.50 T) con ¹²C⁺ y ¹³C⁺.
  var e3 = { Ef: 4.0e4, B1: 0.20, B2: 0.50 }; e3.v = e3.Ef / e3.B1;
  e3.r12 = 12 * U * e3.v / (E * e3.B2); e3.r13 = 13 * U * e3.v / (E * e3.B2); e3.sep = 2 * (e3.r13 - e3.r12);
  // Ejemplo 4: ciclotrón de protones, B = 1.5 T, R = 0.50 m.
  var e4 = { B: 1.5, R: 0.50, dV: 50e3 }; e4.f = E * e4.B / (2 * Math.PI * MP); e4.vmax = E * e4.B * e4.R / MP;
  e4.K = 0.5 * MP * e4.vmax * e4.vmax; e4.KeV = e4.K / E; e4.turns = e4.K / (2 * E * e4.dV);

  var SENSE = [
    { who: 'Un protón', B: 'entra a', right: 'Antihorario', why: 'Con $\\vec v$ a la derecha y $\\vec B$ entrando, $\\vec F = q\\vec v \\times \\vec B$ apunta hacia arriba: el centro queda arriba y el protón gira en sentido antihorario.' },
    { who: 'Un electrón', B: 'entra a', right: 'Horario', why: 'Para el protón sería antihorario; la carga negativa invierte la fuerza y el sentido de giro: horario.' },
    { who: 'Un protón', B: 'sale de', right: 'Horario', why: 'Con $\\vec B$ saliendo, $\\hat\\imath \\times \\hat k = -\\hat\\jmath$: la fuerza apunta hacia abajo y el protón gira en sentido horario.' },
    { who: 'Un electrón', B: 'sale de', right: 'Antihorario', why: 'Las dos inversiones (carga negativa y campo saliendo) se cancelan: gira en sentido antihorario.' }
  ];

  var data = window.SESSION_DATA = {
    slug: 'sesion-03', number: '03', group: 'A · Fuerza magnética',
    title: 'Movimiento circular en un campo magnético: selector de velocidad, espectrómetro y ciclotrón', temario: [],
    minutes: 120,
    quote: 'En un campo magnético uniforme, una carga que se mueve perpendicular a $\\vec B$ da vueltas: $r = mv/|q|B$, y el tiempo de cada vuelta no depende de su rapidez.',
    badges: [
      'Deducir el radio $r = mv/|q|B$ y el periodo $T = 2\\pi m/|q|B$ de una carga en un campo uniforme.',
      'Describir la hélice cuando la velocidad no es perpendicular al campo.',
      'Usar el selector de velocidades ($v = E/B$) y el espectrómetro de masas.',
      'Calcular la frecuencia y la energía máxima de un ciclotrón.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Una fuerza que siempre es perpendicular a la velocidad y tiene magnitud constante produce un <strong>movimiento circular uniforme</strong>. Es justo lo que hace un campo magnético uniforme.',
        recall: [
          'La fuerza centrípeta $F = mv^2/r$ y el periodo $T = 2\\pi r/v$ (<a href="../../../fisica-1/sesiones/sesion-07/">Física 1 · S07</a> y <a href="../../../fisica-1/sesiones/sesion-11/">S11</a>).',
          'La fuerza magnética $F = |q|vB\\sin\\theta$ y que no hace trabajo (<a href="../sesion-02/">S02</a>).',
          'Una carga que cae por un voltaje gana $qV$ de energía cinética (<a href="../../../fisica-2/sesiones/sesion-05/">Física 2 · S05</a>).'
        ],
        why: 'Así se miden las masas de los átomos (espectrómetro), se separan isótopos, se producen radioisótopos para medicina (ciclotrón) y se entiende por qué las partículas cósmicas quedan atrapadas alrededor de la Tierra.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Gira una pelota atada a una cuerda: la cuerda la jala siempre hacia el centro, perpendicular a su velocidad, y la pelota da vueltas con rapidez constante. Si la sueltas, sale en línea recta.',
          'En un campo magnético uniforme, la fuerza $q\\vec v \\times \\vec B$ hace el papel de la cuerda: siempre perpendicular a $\\vec v$ y siempre del mismo tamaño, porque la rapidez no cambia. La diferencia es que nadie la ata: el radio lo deciden la masa, la rapidez, la carga y el campo.'
        ]
      },
      {
        type: 'explainer', heading: 'De la fuerza al radio', short: 'De la fuerza al radio',
        title: 'Por qué la órbita es un círculo',
        intro: 'Seguimos a una carga positiva que entra perpendicular a un campo que entra a la hoja.',
        diagram: 'f3s03-circle',
        steps: [
          { text: 'La carga entra moviéndose a la derecha con rapidez $v$, perpendicular a $\\vec B$ (cruces: el campo entra a la hoja).', state: { show: 0 } },
          { text: 'La fuerza $q\\vec v \\times \\vec B$ apunta hacia arriba, perpendicular a $\\vec v$, y mide $|q|vB$.', state: { show: 1 } },
          { text: 'Como la fuerza no hace trabajo, la rapidez no cambia y la fuerza mide siempre lo mismo. Una fuerza constante en tamaño y siempre perpendicular a la velocidad produce un <strong>círculo</strong>: en cualquier punto, $\\vec F$ apunta al centro.', state: { show: 2 } },
          { text: 'La fuerza magnética es la centrípeta: $|q|vB = \\dfrac{mv^2}{r}$. Despejando, $r = \\dfrac{mv}{|q|B}$. Y el periodo es $T = \\dfrac{2\\pi r}{v} = \\dfrac{2\\pi m}{|q|B}$.', state: { show: 3 } }
        ]
      },
      {
        type: 'concept', heading: 'Radio y periodo', short: 'Radio y periodo',
        body: [
          'De $|q|vB = mv^2/r$ salen las dos fórmulas de la sesión: $$r = \\frac{mv}{|q|B} \\qquad T = \\frac{2\\pi m}{|q|B} \\qquad f = \\frac{1}{T} = \\frac{|q|B}{2\\pi m} \\qquad \\omega = \\frac{|q|B}{m}$$',
          'El radio crece con la masa y la rapidez, y baja con la carga y el campo. El producto $mv$ es el <strong>momento</strong> $p$: $r = p/|q|B$, así que medir el radio mide el momento.',
          'Lo sorprendente es el <strong>periodo</strong>: no depende de $v$. Una partícula más rápida da una vuelta más grande, pero tarda lo mismo. A $f$ se le llama <strong>frecuencia de ciclotrón</strong>.'
        ]
      },
      {
        type: 'concept', heading: 'El sentido de giro', short: 'Sentido de giro',
        body: [
          'El sentido sale de la dirección de la fuerza en cualquier punto. Con el campo entrando a la hoja, una carga positiva gira en sentido <strong>antihorario</strong> y una negativa en sentido <strong>horario</strong>. Si el campo sale de la hoja, se invierte todo.',
          'Por eso en una cámara de burbujas (un detector de partículas) los electrones y los positrones dejan espirales que giran en sentidos opuestos: el sentido de giro dice el signo de la carga.'
        ]
      },
      {
        type: 'concept', heading: 'Si la velocidad es oblicua: la hélice', short: 'Hélice',
        body: [
          'Si $\\vec v$ forma un ángulo $\\alpha$ con $\\vec B$, sepárala en una componente paralela al campo, $v_\\parallel = v\\cos\\alpha$, y una perpendicular, $v_\\perp = v\\sin\\alpha$.',
          'La parte paralela no siente fuerza ($\\sin 0 = 0$): avanza a lo largo de $\\vec B$ con rapidez constante. La parte perpendicular hace un círculo de radio $r = mv_\\perp/|q|B$. Juntas dan una <strong>hélice</strong>, como un resorte, con un avance por vuelta (el <strong>paso</strong>) de $$p = v_\\parallel\\,T = v\\cos\\alpha\\,\\frac{2\\pi m}{|q|B}$$'
        ],
        diagram: 'f3s03-helix',
        caption: 'La componente paralela avanza; la perpendicular gira. La parte punteada va por detrás.'
      },
      {
        type: 'callout', heading: 'Cinturones de radiación',
        body: [
          'Las partículas del viento solar que quedan atrapadas en el campo de la Tierra avanzan en hélices a lo largo de las líneas de campo. Cerca de los polos, donde el campo es más intenso, rebotan y regresan: quedan atrapadas en los <strong>cinturones de Van Allen</strong>. Las que logran bajar a la atmósfera cerca de los polos producen las auroras.'
        ]
      },
      {
        type: 'concept', heading: 'Selector de velocidades', short: 'Selector',
        body: [
          'Entre dos placas cargadas hay un campo eléctrico $\\vec E$ y, perpendicular a él, un campo magnético $\\vec B$. Sobre una carga que entra perpendicular a los dos, la fuerza eléctrica $qE$ empuja hacia un lado y la magnética $qvB$ hacia el otro.',
          'Solo las cargas con $qE = qvB$, o sea con $$v = \\frac{E}{B}$$ pasan sin desviarse por la rendija de salida. Las más rápidas se desvían hacia donde empuja la magnética; las más lentas, hacia donde empuja la eléctrica. La condición no depende de la carga ni de la masa.'
        ],
        diagram: 'f3s03-selector',
        caption: 'Solo pasa recta la rapidez $v = E/B$.'
      },
      {
        type: 'concept', heading: 'Espectrómetro de masas', short: 'Espectrómetro',
        body: [
          'Para medir masas de átomos se ionizan, se aceleran y se meten a un campo magnético uniforme. Ahí describen medio círculo y caen en un detector a una distancia $d = 2r$ de la rendija de entrada.',
          'Si los iones se aceleraron desde el reposo por un voltaje $V$, todos tienen la misma energía, $\\tfrac{1}{2}mv^2 = qV$, y el radio queda $$r = \\frac{mv}{qB} = \\frac{1}{B}\\sqrt{\\frac{2mV}{q}} \\qquad\\Longrightarrow\\qquad m = \\frac{qB^2r^2}{2V}$$ Si antes pasaron por un selector, todos tienen la misma $v$ y entonces $r \\propto m$: los isótopos de un mismo elemento caen en lugares distintos.'
        ],
        diagram: 'f3s03-spectro',
        caption: 'Más masa, más radio: el ion pesado cae más lejos.'
      },
      {
        type: 'concept', heading: 'El ciclotrón', short: 'Ciclotrón',
        body: [
          'Un ciclotrón usa que el periodo no depende de la rapidez. Dos cajas metálicas huecas en forma de D están dentro de un campo magnético uniforme, separadas por un hueco con un voltaje alterno. Cada vez que la partícula cruza el hueco, el campo eléctrico la acelera; dentro de las D, el magnético la hace dar media vuelta.',
          'Como cada media vuelta tarda lo mismo, basta con que el voltaje alterne con la <strong>frecuencia de ciclotrón</strong> $f = |q|B/2\\pi m$. La partícula describe una espiral hasta llegar al borde, de radio $R$, con la rapidez máxima $v_{\\text{máx}} = |q|BR/m$ y la energía $$K_{\\text{máx}} = \\frac{q^2B^2R^2}{2m}$$',
          'Fíjate que la energía final no depende del voltaje del hueco: un voltaje mayor solo hace que se necesiten menos vueltas.'
        ],
        diagram: 'f3s03-cyclotron',
        caption: 'El campo eléctrico acelera en el hueco y el magnético curva dentro de las D.'
      },
      {
        type: 'recipe', heading: 'Receta: cargas que giran en un campo magnético', short: 'Receta',
        steps: [
          { text: 'Identifica la partícula: su carga (con signo) y su masa. Alfa: $2e$ y $4u$; deuterón: $e$ y $2u$; $u = 1.66\\times 10^{-27}$ kg.' },
          { text: 'Si $\\vec v$ no es perpendicular a $\\vec B$, sepárala en $v_\\parallel$ y $v_\\perp$. Solo $v_\\perp$ entra en el radio.', tip: 'El periodo es el mismo con o sin componente paralela.' },
          { text: 'Iguala la fuerza magnética con la centrípeta: $|q|vB = mv^2/r$. De ahí $r$, $T$, $f$ o lo que pidan.', tip: 'Si te dan la energía, saca primero la rapidez con $K = \\tfrac{1}{2}mv^2$ (o $qV = \\tfrac{1}{2}mv^2$).' },
          { text: 'El sentido de giro: dirección de $q\\vec v \\times \\vec B$ en un punto; ahí está el centro.' },
          { text: 'Selector: $v = E/B$. Espectrómetro: cae a $2r$. Ciclotrón: $f = |q|B/2\\pi m$ y $K_{\\text{máx}} = q^2B^2R^2/2m$.' }
        ]
      },
      {
        type: 'example', heading: 'Un protón en órbita',
        problem: '<p>Un protón se mueve a $3.0\\times 10^{6}\\ \\text{m/s}$ perpendicular a un campo de $0.50\\ \\text{T}$. ¿Qué radio tiene su órbita, cuánto tarda en dar una vuelta y con qué frecuencia gira?</p>',
        steps: [
          { text: 'La fuerza magnética es la centrípeta: $evB = m_pv^2/r$.', math: 'r = \\frac{m_pv}{eB} = \\frac{(1.67\\times 10^{-27})(3.0\\times 10^{6})}{(1.60\\times 10^{-19})(0.50)} = ' + sci(e1.r) + '\\ \\text{m} = ' + fx(e1.r * 100, 2) + '\\ \\text{cm}' },
          { text: 'El periodo no depende de $v$.', math: 'T = \\frac{2\\pi m_p}{eB} = \\frac{2\\pi(1.67\\times 10^{-27})}{(1.60\\times 10^{-19})(0.50)} = ' + sci(e1.T) + '\\ \\text{s}' },
          { text: 'La frecuencia es el inverso.', math: 'f = \\frac{1}{T} = ' + sci(e1.f) + '\\ \\text{Hz}' }
        ],
        answer: '$r = ' + fx(e1.r * 100, 2) + '\\ \\text{cm}$, $T = ' + sci(e1.T) + '\\ \\text{s}$ y $f = ' + sci(e1.f) + '\\ \\text{Hz}$ (unos 7.6 MHz).',
        verify: { lab: 'call', mod: 'orbit', fn: 'radius', args: [MP * 100, E, e1.v, e1.B], value: e1.r * 100 }
      },
      {
        type: 'example', heading: 'Un electrón en hélice',
        problem: '<p>Un electrón entra a $2.0\\times 10^{7}\\ \\text{m/s}$ en un campo de $4.0\\ \\text{mT}$, formando $30^\\circ$ con el campo. ¿Qué radio tiene la hélice y cuánto avanza en cada vuelta?</p>',
        steps: [
          { text: 'Separa la velocidad en las partes paralela y perpendicular al campo.', math: 'v_\\parallel = v\\cos 30^\\circ = ' + sci(e2.vpar) + '\\ \\text{m/s} \\qquad v_\\perp = v\\sin 30^\\circ = ' + sci(e2.vperp) + '\\ \\text{m/s}' },
          { text: 'El radio usa solo $v_\\perp$.', math: 'r = \\frac{m_ev_\\perp}{eB} = \\frac{(9.11\\times 10^{-31})(' + sci(e2.vperp) + ')}{(1.60\\times 10^{-19})(4.0\\times 10^{-3})} = ' + sci(e2.r) + '\\ \\text{m} = ' + fx(e2.r * 100, 2) + '\\ \\text{cm}' },
          { text: 'El periodo y el paso.', math: 'T = \\frac{2\\pi m_e}{eB} = ' + sci(e2.T) + '\\ \\text{s} \\qquad p = v_\\parallel T = ' + sci(e2.pitch) + '\\ \\text{m} = ' + fx(e2.pitch * 100, 1) + '\\ \\text{cm}' }
        ],
        answer: 'Radio $' + fx(e2.r * 100, 2) + '\\ \\text{cm}$ y paso $' + fx(e2.pitch * 100, 1) + '\\ \\text{cm}$.',
        verify: { lab: 'call', mod: 'orbit', fn: 'helix', args: [ME * 100, E, e2.v, e2.B, e2.a], values: { r: e2.r * 100, pitch: e2.pitch * 100 } }
      },
      {
        type: 'example', heading: 'Selector y espectrómetro: los isótopos del carbono',
        problem: '<p>Iones de $^{12}\\text{C}^{+}$ y $^{13}\\text{C}^{+}$ pasan por un selector con $E = 4.0\\times 10^{4}\\ \\text{N/C}$ y $B_1 = 0.20\\ \\text{T}$, y luego entran a un campo $B_2 = 0.50\\ \\text{T}$. ¿A qué distancia uno del otro caen en el detector? ($u = 1.66\\times 10^{-27}$ kg; carga $+e$.)</p>',
        steps: [
          { text: 'El selector deja pasar una sola rapidez.', math: 'v = \\frac{E}{B_1} = \\frac{4.0\\times 10^{4}}{0.20} = ' + sci(e3.v) + '\\ \\text{m/s}' },
          { text: 'Los radios en $B_2$, con la misma rapidez y la misma carga.', math: 'r_{12} = \\frac{(12u)v}{eB_2} = ' + fx(e3.r12 * 100, 3) + '\\ \\text{cm} \\qquad r_{13} = \\frac{(13u)v}{eB_2} = ' + fx(e3.r13 * 100, 3) + '\\ \\text{cm}' },
          { text: 'Caen a $2r$ de la rendija: la separación es el doble de la diferencia de radios.', math: '\\Delta d = 2(r_{13} - r_{12}) = ' + fx(e3.sep * 1000, 2) + '\\ \\text{mm}' }
        ],
        answer: 'Caen a $' + fx(e3.sep * 1000, 2) + '\\ \\text{mm}$ uno del otro.',
        verify: { lab: 'call', mod: 'orbit', fn: 'radius', args: [2 * U * 1000, E, e3.v, e3.B2], value: 2 * (e3.r13 - e3.r12) * 1000 }
      },
      {
        type: 'example', heading: 'Un ciclotrón de protones',
        problem: '<p>Un ciclotrón de protones tiene un campo de $1.5\\ \\text{T}$ y un radio de $0.50\\ \\text{m}$; el voltaje del hueco es de $50\\ \\text{kV}$. ¿Con qué frecuencia debe alternar el voltaje, qué energía máxima alcanzan los protones y cuántas vueltas dan?</p>',
        steps: [
          { text: 'La frecuencia de ciclotrón.', math: 'f = \\frac{eB}{2\\pi m_p} = \\frac{(1.60\\times 10^{-19})(1.5)}{2\\pi(1.67\\times 10^{-27})} = ' + sci(e4.f) + '\\ \\text{Hz}' },
          { text: 'La energía máxima, al llegar al borde.', math: 'K_{\\text{máx}} = \\frac{e^2B^2R^2}{2m_p} = ' + sci(e4.K) + '\\ \\text{J} = ' + fx(e4.KeV / 1e6, 1) + '\\ \\text{MeV}' },
          { text: 'Cada vuelta cruza el hueco dos veces y gana $2e\\Delta V = 0.10$ MeV.', math: 'N = \\frac{K_{\\text{máx}}}{2e\\Delta V} = \\frac{' + fx(e4.KeV / 1e6, 1) + '\\ \\text{MeV}}{0.10\\ \\text{MeV}} \\approx ' + fx(e4.turns, 0) }
        ],
        answer: '$f = ' + sci(e4.f) + '\\ \\text{Hz}$ (unos 23 MHz), $K_{\\text{máx}} = ' + fx(e4.KeV / 1e6, 1) + '\\ \\text{MeV}$ y unas ' + fx(e4.turns, 0) + ' vueltas.',
        verify: { lab: 'call', mod: 'orbit', fn: 'cyclotron', args: [MP, E, e4.B, e4.R, e4.dV], values: { f: e4.f, KmaxEV: e4.KeV, turns: e4.turns } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué el periodo no depende de la rapidez?', a: 'Porque el radio crece en la misma proporción que $v$: el camino es más largo, pero se recorre más rápido. $T = 2\\pi r/v = 2\\pi m/|q|B$.' },
          { q: 'Si la fuerza no hace trabajo, ¿cómo acelera un ciclotrón?', a: 'Lo acelera el campo eléctrico del hueco. El magnético solo la hace girar para que vuelva a pasar por el hueco una y otra vez.' },
          { q: '¿Qué rapidez uso en $r = mv/|q|B$ si la velocidad es oblicua?', a: 'Solo la componente perpendicular a $\\vec B$, $v_\\perp = v\\sin\\alpha$. La paralela produce el avance de la hélice.' },
          { q: '¿El selector depende de la carga?', a: 'No. Las dos fuerzas son proporcionales a $q$ y se equilibran con $v = E/B$ para cualquier carga y cualquier masa.' },
          { q: '¿Por qué el ciclotrón no sirve para electrones muy rápidos?', a: 'Cuando la rapidez se acerca a la de la luz, la masa efectiva crece (relatividad) y el periodo deja de ser constante. Para eso se usan sincrotrones.' },
          { q: '¿Cómo sé si gira en sentido horario o antihorario?', a: 'Dibuja $\\vec v$ y calcula la dirección de $q\\vec v \\times \\vec B$: el centro del círculo está hacia donde apunta la fuerza.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Con $\\vec v \\perp \\vec B$, la carga hace un círculo: $|q|vB = mv^2/r$ ⇒ $r = mv/|q|B$.',
          'El periodo $T = 2\\pi m/|q|B$ y la frecuencia $f = |q|B/2\\pi m$ no dependen de la rapidez.',
          'Con velocidad oblicua: hélice de radio $mv_\\perp/|q|B$ y paso $v_\\parallel T$.',
          'Selector: $v = E/B$. Espectrómetro: $r = \\frac{1}{B}\\sqrt{2mV/q}$, cae a $2r$.',
          'Ciclotrón: $f = |q|B/2\\pi m$ y $K_{\\text{máx}} = q^2B^2R^2/2m$.'
        ]
      }
    ],

    lab: {
      type: 'cyclotron-orbit', title: 'Órbitas, selector, espectrómetro y ciclotrón',
      intro: 'En el modo Órbita, elige la partícula, su rapidez y el campo, y lánzala: mira cómo cambia el radio y comprueba que el periodo no depende de $v$. Cambia a Selector (solo pasa recta $v = E/B$), a Espectrómetro (dos isótopos caen en lugares distintos) y a Ciclotrón (la espiral de medias vueltas). En el reto predices el radio de una órbita en cm, y el lab te dice si diste el diámetro, si invertiste la fórmula, si la carga de la alfa no es $2e$ o si usaste otra masa.',
      cfg: {}
    },

    formulas: [
      { label: 'Radio', tex: 'r = \\frac{mv}{|q|B} = \\frac{p}{|q|B}' },
      { label: 'Periodo y frecuencia', tex: 'T = \\frac{2\\pi m}{|q|B},\\quad f = \\frac{|q|B}{2\\pi m},\\quad \\omega = \\frac{|q|B}{m}' },
      { label: 'Hélice', tex: 'r = \\frac{mv_\\perp}{|q|B},\\quad p = v_\\parallel T' },
      { label: 'Selector', tex: 'v = \\frac{E}{B}' },
      { label: 'Espectrómetro', tex: 'qV = \\tfrac{1}{2}mv^2,\\quad m = \\frac{qB^2r^2}{2V}' },
      { label: 'Ciclotrón', tex: 'K_{\\text{máx}} = \\frac{q^2B^2R^2}{2m}' }
    ],

    exercises: [
      {
        id: 'f3-s03-radio', title: 'Radio de la órbita de un protón',
        vars: { v: [1, 9, 1], B: [0.2, 1.0, 0.1] },
        prompt: function (v) {
          return '<p>Un protón se mueve a $' + v.v + '\\times 10^{6}\\ \\text{m/s}$ perpendicular a un campo de $' + fx(v.B, 1) + '\\ \\text{T}$. ¿Qué radio tiene su órbita, en cm?</p>';
        },
        check: 'numeric', unit: 'cm',
        answer: function (v) { return MP * v.v * 1e6 / (E * v.B) * 100; },
        mistakes: {
          diameter: function (v) { return 2 * MP * v.v * 1e6 / (E * v.B) * 100; },
          meters: function (v) { return MP * v.v * 1e6 / (E * v.B); },
          electron: function (v) { return ME * v.v * 1e6 / (E * v.B) * 100; }
        },
        feedback: [
          { when: 'diameter', say: 'Ese es el diámetro. El radio es $r = mv/|q|B$.' },
          { when: 'meters', say: 'Ese valor está en metros; pásalo a cm.' },
          { when: 'electron', say: 'Usaste la masa del electrón; es un protón.' }
        ],
        oracle: { lab: 'call', mod: 'orbit', fn: 'radius', args: function (v) { return [MP * 100, E, v.v * 1e6, v.B]; } },
        hint: '$r = m_pv/(eB)$; pasa de m a cm.',
        solution: function (v) { var r = MP * v.v * 1e6 / (E * v.B); return '$$r = \\frac{m_pv}{eB} = \\frac{(1.67\\times 10^{-27})(' + v.v + '\\times 10^{6})}{(1.60\\times 10^{-19})(' + fx(v.B, 1) + ')} = ' + sci(r) + '\\ \\text{m} = ' + fx(r * 100, 2) + '\\ \\text{cm}$$'; }
      },
      {
        id: 'f3-s03-periodo', title: 'Periodo de un electrón',
        vars: { B: [1, 20, 1] },
        prompt: function (v) {
          return '<p>Un electrón gira en un campo uniforme de $' + v.B + '\\ \\text{mT}$. ¿Cuánto tarda en dar una vuelta, en ns?</p>';
        },
        check: 'numeric', unit: 'ns',
        answer: function (v) { return 2 * Math.PI * ME / (E * v.B * 1e-3) * 1e9; },
        mistakes: {
          noTwoPi: function (v) { return ME / (E * v.B * 1e-3) * 1e9; },
          proton: function (v) { return 2 * Math.PI * MP / (E * v.B * 1e-3) * 1e9; }
        },
        feedback: [
          { when: 'noTwoPi', say: 'Ese es $1/\\omega$. Una vuelta completa es $T = 2\\pi m/|q|B$.' },
          { when: 'proton', say: 'Usaste la masa del protón.' }
        ],
        oracle: { lab: 'call', mod: 'orbit', fn: 'period', args: function (v) { return [ME * 1e9, E, v.B * 1e-3]; } },
        hint: '$T = 2\\pi m_e/(eB)$; no necesitas la rapidez.',
        solution: function (v) { var T = 2 * Math.PI * ME / (E * v.B * 1e-3); return '$$T = \\frac{2\\pi m_e}{eB} = \\frac{2\\pi(9.11\\times 10^{-31})}{(1.60\\times 10^{-19})(' + v.B + '\\times 10^{-3})} = ' + sci(T) + '\\ \\text{s} = ' + fx(T * 1e9, 2) + '\\ \\text{ns}$$'; }
      },
      {
        id: 'f3-s03-selector', title: 'La rapidez que pasa el selector',
        vars: { Ek: [5, 95, 5], B: [0.1, 0.9, 0.1] },
        prompt: function (v) {
          return '<p>Un selector de velocidades tiene $E = ' + v.Ek + '\\ \\text{kN/C}$ y $B = ' + fx(v.B, 1) + '\\ \\text{T}$, perpendiculares. ¿Qué rapidez pasa sin desviarse, en km/s?</p>';
        },
        check: 'numeric', unit: 'km/s',
        answer: function (v) { return v.Ek / v.B; },
        mistakes: { mult: function (v) { return v.Ek * v.B; }, inv: function (v) { return v.B / v.Ek; } },
        feedback: [
          { when: 'mult', say: 'De $qE = qvB$ sale $v = E/B$, no $EB$.' },
          { when: 'inv', say: 'Invertiste: $v = E/B$.' }
        ],
        oracle: { lab: 'call', mod: 'orbit', fn: 'selector', args: function (v) { return [v.Ek, v.B]; } },
        hint: 'Iguala $qE$ con $qvB$.',
        solution: function (v) { return '$$v = \\frac{E}{B} = \\frac{' + v.Ek + '\\times 10^{3}}{' + fx(v.B, 1) + '} = ' + fx(v.Ek / v.B, 2) + '\\times 10^{3}\\ \\text{m/s} = ' + fx(v.Ek / v.B, 2) + '\\ \\text{km/s}$$'; }
      },
      {
        id: 'f3-s03-espectro', title: 'Dónde cae un ion',
        vars: { A: [6, 40, 1], V: [1, 5, 0.5], B: [0.2, 0.8, 0.1] },
        prompt: function (v) {
          return '<p>Un ion de carga $+e$ y masa $' + v.A + 'u$ ($u = 1.66\\times 10^{-27}$ kg) se acelera desde el reposo por $' + fx(v.V, 1) + '\\ \\text{kV}$ y entra perpendicular a un campo de $' + fx(v.B, 1) + '\\ \\text{T}$. ¿A qué distancia de la rendija cae, en cm, después de media vuelta?</p>';
        },
        check: 'numeric', unit: 'cm',
        answer: function (v) { var m = v.A * U, s = Math.sqrt(2 * E * v.V * 1e3 / m); return 2 * m * s / (E * v.B) * 100; },
        mistakes: {
          radius: function (v) { var m = v.A * U, s = Math.sqrt(2 * E * v.V * 1e3 / m); return m * s / (E * v.B) * 100; },
          noSqrt: function (v) { var m = v.A * U; return 2 * m * (2 * E * v.V * 1e3 / m) / (E * v.B) * 100; }
        },
        feedback: [
          { when: 'radius', say: 'Ese es el radio. Después de media vuelta cae a un diámetro: $2r$.' },
          { when: 'noSqrt', say: 'Te faltó la raíz: $v = \\sqrt{2qV/m}$.' }
        ],
        oracle: { lab: 'call', mod: 'orbit', fn: 'spectrometer', field: 'd', args: function (v) { return [v.A * U, E, v.V * 1e3, v.B / 100]; } },
        hint: 'Primero $v = \\sqrt{2eV/m}$, luego $r = mv/(eB)$, y cae a $2r$.',
        solution: function (v) { var m = v.A * U, s = Math.sqrt(2 * E * v.V * 1e3 / m), r = m * s / (E * v.B); return '$$v = \\sqrt{\\frac{2eV}{m}} = ' + sci(s) + '\\ \\text{m/s},\\qquad r = \\frac{mv}{eB} = ' + fx(r * 100, 3) + '\\ \\text{cm},\\qquad d = 2r = ' + fx(2 * r * 100, 3) + '\\ \\text{cm}$$'; }
      },
      {
        id: 'f3-s03-ciclotron', title: 'Energía máxima de un ciclotrón',
        vars: { B: [0.5, 2, 0.1], R: [20, 90, 10] },
        prompt: function (v) {
          return '<p>Un ciclotrón de protones tiene un campo de $' + fx(v.B, 1) + '\\ \\text{T}$ y un radio de $' + v.R + '\\ \\text{cm}$. ¿Qué energía cinética máxima alcanzan los protones, en MeV? ($1\\ \\text{MeV} = 1.60\\times 10^{-13}\\ \\text{J}$)</p>';
        },
        check: 'numeric', unit: 'MeV',
        answer: function (v) { var R = v.R / 100; return Math.pow(E * v.B * R, 2) / (2 * MP) / (E * 1e6); },
        mistakes: {
          noHalf: function (v) { var R = v.R / 100; return Math.pow(E * v.B * R, 2) / MP / (E * 1e6); },
          cm: function (v) { return Math.pow(E * v.B * v.R, 2) / (2 * MP) / (E * 1e6); }
        },
        feedback: [
          { when: 'noHalf', say: 'Te faltó el ½ de la energía cinética: $K = q^2B^2R^2/2m$.' },
          { when: 'cm', say: 'Pasa el radio a metros antes de elevarlo al cuadrado.' }
        ],
        oracle: { lab: 'call', mod: 'orbit', fn: 'cyclotron', field: 'KmaxEV', args: function (v) { return [MP * 1e6, E, v.B, v.R / 100, 1]; } },
        hint: '$K_{\\text{máx}} = e^2B^2R^2/(2m_p)$; divide entre $1.60\\times 10^{-13}$ J para tenerla en MeV.',
        solution: function (v) { var R = v.R / 100, K = Math.pow(E * v.B * R, 2) / (2 * MP); return '$$K_{\\text{máx}} = \\frac{e^2B^2R^2}{2m_p} = \\frac{(1.60\\times 10^{-19})^2(' + fx(v.B, 1) + ')^2(' + fx(R, 2) + ')^2}{2(1.67\\times 10^{-27})} = ' + sci(K) + '\\ \\text{J} = ' + fx(K / (E * 1e6), 2) + '\\ \\text{MeV}$$'; }
      },
      {
        id: 'f3-s03-sentido', title: 'Concepto: sentido de giro',
        vars: { k: [0, 3, 1] },
        prompt: function (v) {
          var c = SENSE[v.k];
          return '<p>' + c.who + ' se mueve en el plano de la hoja dentro de un campo magnético uniforme que ' + c.B + ' la hoja. Visto desde donde estás, ¿en qué sentido gira?</p>';
        },
        check: 'choice',
        options: function (v) {
          var right = SENSE[v.k].right;
          return ['Antihorario', 'Horario', 'No gira: sigue en línea recta'].map(function (t) {
            return t === right ? { text: t, correct: true } : { text: t, say: t === 'No gira: sigue en línea recta' ? 'Con $\\vec v \\perp \\vec B$ hay fuerza y la trayectoria es un círculo.' : 'Revisa la dirección de $q\\vec v \\times \\vec B$ en un punto: ahí está el centro.' };
          });
        },
        answer: function (v) { return SENSE[v.k].right; },
        hint: 'Pon $\\vec v$ a la derecha, calcula la dirección de la fuerza y ubica el centro.',
        solution: function (v) { return SENSE[v.k].why; }
      },
      {
        id: 'f3-s03-periodo-v', title: 'Concepto: ¿y si va más rápido?',
        vars: { n: [2, 4, 1] },
        prompt: function (v) {
          return '<p>Un protón gira en un campo uniforme. Si su rapidez se multiplica por ' + v.n + ', ¿qué pasa con su radio y su periodo?</p>';
        },
        check: 'choice',
        options: function (v) {
          return [
            { text: 'El radio se multiplica por ' + v.n + ' y el periodo no cambia', correct: true },
            { text: 'El radio y el periodo se multiplican por ' + v.n, say: 'El periodo $2\\pi m/|q|B$ no depende de $v$.' },
            { text: 'El radio no cambia y el periodo se divide entre ' + v.n, say: 'El radio $mv/|q|B$ sí crece con $v$.' }
          ];
        },
        answer: function (v) { return 'El radio se multiplica por ' + v.n + ' y el periodo no cambia'; },
        hint: 'Mira $r = mv/|q|B$ y $T = 2\\pi m/|q|B$.',
        solution: function (v) { return 'El radio es proporcional a $v$: se multiplica por ' + v.n + '. El periodo no depende de $v$: el camino es ' + v.n + ' veces más largo, pero se recorre ' + v.n + ' veces más rápido.'; }
      }
    ],

    quiz: { tags: ['f3.S03'], count: 8 },

    errors: [
      'Dar el diámetro cuando piden el radio (o al revés en el espectrómetro, donde el ion cae a $2r$).',
      'Usar toda la rapidez en el radio cuando la velocidad es oblicua: solo cuenta $v_\\perp$.',
      'Pensar que el periodo crece con la rapidez: $T = 2\\pi m/|q|B$ no depende de $v$.',
      'Olvidar que una partícula alfa tiene carga $2e$ y masa $4u$.',
      'Creer que el campo magnético acelera las partículas del ciclotrón: lo hace el campo eléctrico del hueco.',
      'Pasar la energía de eV a J con el factor equivocado: $1\\ \\text{eV} = 1.60\\times 10^{-19}\\ \\text{J}$.',
      'Equivocar el sentido de giro de las cargas negativas.'
    ],

    teacher: {
      plan: [
        'Recuerda la fuerza centrípeta con la pelota atada y pregunta qué hace las veces de la cuerda.',
        'Usa el explainer para llegar a $r = mv/|q|B$ y $T = 2\\pi m/|q|B$; subraya que $T$ no depende de $v$.',
        'Hélice con la descomposición $v_\\parallel$, $v_\\perp$; menciona auroras y cinturones de Van Allen.',
        'Aplicaciones en orden: selector, espectrómetro (que suele usar el selector antes) y ciclotrón.',
        'Cierra con el lab: radio en el reto, y los cuatro modos para ver las aplicaciones.'
      ],
      check: [
        'Que calculen el radio y el periodo de un protón y de un electrón en campos típicos.',
        'Que digan el sentido de giro para cargas de los dos signos.',
        'Que expliquen por qué el selector no depende de la masa y el ciclotrón no depende del voltaje del hueco para la energía final.'
      ],
      note: 'El ciclotrón funciona porque el periodo no depende de $v$; a rapideces relativistas eso deja de valer y se pasa al sincrotrón. Basta mencionarlo.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §11.3 “Motion of a Charged Particle in a Magnetic Field”. <a href="https://openstax.org/books/university-physics-volume-2/pages/11-3-motion-of-a-charged-particle-in-a-magnetic-field">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §11.7 “Applications of Magnetic Forces and Fields”. <a href="https://openstax.org/books/university-physics-volume-2/pages/11-7-applications-of-magnetic-forces-and-fields">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-02',
    next: 'sesion-04'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
