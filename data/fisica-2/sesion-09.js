/* =====================================================================
   Física 2 · S09 · Capacitancia: placas paralelas, cilíndrico y esférico (bloque B · Gauss y capacitores).
   Fuente: OpenStax, University Physics Volume 2, §8.1 y §8.4 (CC BY-NC-SA 4.0).
   Sesión de derivaciones (brief N2 §3.1): cada geometría sigue la cadena
   Q → E (por Gauss) → V = ∫E·dl → C = Q/V.
   ε₀ = 8.85 × 10⁻¹² C²/(N·m²); SI. Las cuentas se hacen aquí con fórmulas propias y
   scripts/examples.test.js las compara contra LabMath.capacitor (verify / oracle), que
   saca C integrando numéricamente E·dl (scripts/labs-math/capacitor-plates.js).
   ===================================================================== */
(function () {
  var eps0 = 8.85e-12;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  // Notación científica en LaTeX: 1.80 \times 10^{3}.
  function sci(v, d) {
    if (v === 0) return '0';
    var e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
    if (Math.abs(+m.toFixed(d == null ? 2 : d)) >= 10) { m /= 10; e += 1; }
    return m.toFixed(d == null ? 2 : d) + ' \\times 10^{' + e + '}';
  }
  // Fórmulas cerradas (SI). Se escriben aquí, aparte de LabMath.
  function Cpl(A, d) { return eps0 * A / d; }
  function Ccyl(a, b, L) { return 2 * Math.PI * eps0 * L / Math.log(b / a); }
  function Csph(a, b) { return 4 * Math.PI * eps0 * a * b / (b - a); }
  var cm2 = function (x) { return x * 1e-4; }, mm = function (x) { return x / 1000; }, cm = function (x) { return x / 100; };
  var pF = 1e12, nCu = 1e9;
  var ETXT = '$\\varepsilon_0 = 8.85 \\times 10^{-12}\\ \\text{C}^2/(\\text{N·m}^2)$';

  // Ejemplo 1: placas paralelas y su carga
  var e1 = { A: 50, d: 1.5, V: 9 };
  e1.C = Cpl(cm2(e1.A), mm(e1.d)); e1.Q = e1.C * e1.V;
  // Ejemplo 2: cable coaxial
  var e2 = { a: 0.45, b: 1.5, L: 2.0 };
  e2.ln = Math.log(e2.b / e2.a); e2.C = Ccyl(mm(e2.a), mm(e2.b), e2.L);
  // Ejemplo 3: esférico y esfera aislada
  var e3 = { a: 6, b: 8 };
  e3.C = Csph(cm(e3.a), cm(e3.b)); e3.iso = 4 * Math.PI * eps0 * cm(e3.a);
  // Ejemplo 4: separar las placas con la batería desconectada
  var e4 = { A: 100, d: 1, V: 12 };
  e4.C0 = Cpl(cm2(e4.A), mm(e4.d)); e4.Q = e4.C0 * e4.V; e4.C = e4.C0 / 2; e4.V2 = e4.Q / e4.C;
  e4.E = e4.V / mm(e4.d); e4.U0 = 0.5 * e4.C0 * e4.V * e4.V; e4.U = 0.5 * e4.Q * e4.V2;

  // La respuesta y cada error típico deben diferir al menos 3 % entre sí.
  function distinct(ex, base) {
    return function (v) {
      if (base && !base(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (key) { return ex.mistakes[key](v); }));
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) {
          if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]))) return false;
        }
      }
      return true;
    };
  }

  var data = window.SESSION_DATA = {
    slug: 'sesion-09', number: '09', group: 'B · Gauss y capacitores',
    title: 'Capacitancia: placas paralelas, cilíndrico y esférico', temario: [],
    minutes: 180,
    quote: 'Un capacitor guarda carga separada: más carga pide más voltaje, y cuánta carga cabe por cada volt lo decide solo su forma.',
    badges: [
      'Explicar qué es un capacitor y qué mide $C = Q/V$, con sus unidades (F, μF, pF).',
      'Derivar la capacitancia de placas, cilindro y esfera con la cadena $Q \\to E \\to V \\to C$.',
      'Predecir qué pasa con $Q$, $V$ y $E$ al mover las placas con la batería conectada o desconectada.',
      'Usar la constante dieléctrica: $C = \\kappa C_0$.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Un capacitor son dos conductores con cargas $+Q$ y $-Q$. Entre ellos hay un campo y, por lo tanto, una diferencia de potencial $V$. La capacitancia $C = Q/V$ dice cuánta carga guarda por cada volt.',
        recall: [
          'El campo de un plano infinito, $E = \\sigma/2\\varepsilon_0$, y de una línea infinita, $E = 2k\\lambda/r$ (<a href="../sesion-04/">S04</a>).',
          'La diferencia de potencial como integral del campo: $V_A - V_B = \\int_A^B \\vec{E}\\cdot d\\vec{l}$ (<a href="../sesion-05/">S05</a>).',
          'La ley de Gauss: el flujo por una superficie cerrada es $q_{enc}/\\varepsilon_0$ (<a href="../sesion-08/">S08</a>). Hoy la usamos para sacar $E$ en dos renglones.'
        ],
        why: 'Hay capacitores en el flash de una cámara, en un desfibrilador, en la fuente de tu cargador y bajo la pantalla táctil de tu celular, que detecta tu dedo porque cambia una capacitancia.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en un tinaco. El agua que le cabe por cada centímetro de altura depende de qué tan ancho es: uno ancho guarda mucha agua sin subir casi de nivel; uno delgado sube rápido con poquita. Esa «agua por centímetro» es una propiedad del tinaco, no de cuánta agua le eches.',
          'Un capacitor es igual. La carga es el agua y el voltaje es la altura. La capacitancia $C = Q/V$ es la carga que le cabe por cada volt. Si le metes el doble de carga, el voltaje sube al doble y el cociente no cambia: $C$ depende de la forma y del material, nada más.',
          'Y ¿qué hace a un capacitor «ancho»? Placas grandes y muy juntas. Con placas grandes la carga se reparte y el campo es débil; con placas juntas el campo recorre poca distancia. En los dos casos el voltaje queda bajo para la misma carga: mucha capacitancia.'
        ]
      },
      {
        type: 'concept', heading: '¿Qué es un capacitor?', short: 'Qué es un capacitor',
        body: [
          'Dos conductores cualesquiera, separados por aire o por un aislante, con cargas iguales y opuestas: $+Q$ en uno y $-Q$ en el otro. Se cargan conectándolos a una batería, que pasa electrones de un conductor al otro. La carga neta del capacitor sigue siendo cero; cuando decimos «tiene carga $Q$» hablamos de la carga de cada conductor.',
          'Las líneas de campo salen del conductor $+$ y llegan al $-$, así que el conductor $+$ queda a mayor potencial. A esa diferencia la llamamos $V$ (sin signo). La <strong>capacitancia</strong> es $$C = \\frac{Q}{V}$$',
          'Su unidad es el farad: $1\\ \\text{F} = 1\\ \\text{C/V}$. Un farad es enorme; en la práctica verás microfarads ($1\\ \\mu\\text{F} = 10^{-6}\\ \\text{F}$), nanofarads ($10^{-9}\\ \\text{F}$) y picofarads ($1\\ \\text{pF} = 10^{-12}\\ \\text{F}$).'
        ],
        diagram: 'f2s09-conductors',
        caption: 'Dos conductores con $+Q$ y $-Q$. Las líneas de campo van del $+$ al $-$, y entre ellos hay una diferencia de potencial $V$.'
      },
      {
        type: 'callout', heading: 'La cadena de siempre: Q → E → V → C',
        body: [
          '<strong>1.</strong> Supón que los conductores tienen $+Q$ y $-Q$. <strong>2.</strong> Saca el campo entre ellos con la <a href="../sesion-08/">ley de Gauss</a>, eligiendo una superficie que respete la simetría. <strong>3.</strong> Integra el campo del conductor $+$ al $-$: $V = \\int E\\,dl$. <strong>4.</strong> Divide: $C = Q/V$. La $Q$ se cancela siempre; si no se cancela, hay un error.',
          'Por qué se cancela: por Gauss, $E$ es proporcional a $Q$; y $V$ es la integral de $E$, también proporcional a $Q$. El cociente solo guarda la geometría (y el material, como verás al final).'
        ]
      },
      {
        type: 'explainer', heading: 'Placas paralelas', short: 'Placas paralelas',
        title: 'Dos placas de área A separadas una distancia d',
        intro: 'El capacitor más sencillo y el más usado. Suponemos $d$ mucho menor que el tamaño de las placas, para ignorar los bordes.',
        diagram: 'f2s09-plates',
        steps: [
          { text: '<strong>Geometría y carga.</strong> Dos placas de área $A$ separadas una distancia $d$, con $+Q$ y $-Q$. La carga se reparte en la cara interior de cada placa con densidad $\\sigma = Q/A$.', state: { k: 1 } },
          { text: '<strong>Gauss.</strong> Una caja gaussiana con una tapa dentro del metal (donde $E = 0$) y la otra entre las placas. Solo hay flujo por la tapa de adentro: $E\\,A_{caja} = \\sigma A_{caja}/\\varepsilon_0$, así que $E = \\frac{\\sigma}{\\varepsilon_0} = \\frac{Q}{\\varepsilon_0 A}$.', state: { k: 2 } },
          { text: '<strong>Simetría.</strong> El campo es uniforme, perpendicular a las placas y va de la $+$ a la $-$. Afuera los campos de las dos placas se cancelan: $E = 0$. Es lo mismo que sumar dos planos de <a href="../sesion-04/">S04</a>: $\\frac{\\sigma}{2\\varepsilon_0} + \\frac{\\sigma}{2\\varepsilon_0}$.', state: { k: 3 } },
          { text: '<strong>La integral.</strong> Recorre de la placa $+$ a la $-$, en la dirección del campo: $V = V_+ - V_- = \\int_0^d E\\,dx$.', state: { k: 4 } },
          { text: '<strong>Integra.</strong> $E$ no cambia con $x$, así que sale de la integral: $V = E\\,d = \\frac{Q\\,d}{\\varepsilon_0 A}$.', state: { k: 5 } },
          { text: '<strong>Divide y comprueba.</strong> $C = \\frac{Q}{V} = \\frac{\\varepsilon_0 A}{d}$. Unidades: $\\frac{\\text{C}^2}{\\text{N·m}^2}\\cdot\\frac{\\text{m}^2}{\\text{m}} = \\frac{\\text{C}^2}{\\text{J}} = \\frac{\\text{C}}{\\text{V}} = \\text{F}$. Más área o menos separación, más capacitancia.', state: { k: 6 } }
        ]
      },
      {
        type: 'explainer', heading: 'Cilíndrico: el cable coaxial', short: 'Cilíndrico',
        title: 'Alambre de radio a dentro de un forro de radio b, de largo L',
        intro: 'Así es un cable coaxial: el alambre central con $+Q$ y la malla de alrededor con $-Q$. Suponemos $L$ mucho mayor que $b$.',
        diagram: 'f2s09-cylinder',
        steps: [
          { text: '<strong>Geometría y carga.</strong> El alambre interior (radio $a$) tiene $+Q$ y el forro (radio $b$) tiene $-Q$, a lo largo de un largo $L$: $\\lambda = Q/L$.', state: { k: 1 } },
          { text: '<strong>Gauss.</strong> Un cilindro de radio $r$ (entre $a$ y $b$) y largo $L$. El flujo solo pasa por su costado, de área $2\\pi rL$: $E\\,(2\\pi r L) = \\frac{Q}{\\varepsilon_0}$, así que $E = \\frac{Q}{2\\pi\\varepsilon_0 L r}$. Es el $2k\\lambda/r$ de la línea infinita.', state: { k: 2 } },
          { text: '<strong>Simetría.</strong> El campo es radial, del alambre hacia el forro, y baja como $1/r$. Afuera del forro la carga encerrada es $Q - Q = 0$: no hay campo.', state: { k: 3 } },
          { text: '<strong>La integral.</strong> Recorre un radio, del alambre al forro: $V = \\int_a^b E\\,dr = \\frac{Q}{2\\pi\\varepsilon_0 L}\\int_a^b \\frac{dr}{r}$.', state: { k: 4 } },
          { text: '<strong>Integra.</strong> $\\int_a^b \\frac{dr}{r} = \\ln b - \\ln a = \\ln\\frac{b}{a}$, así que $V = \\frac{Q}{2\\pi\\varepsilon_0 L}\\ln\\frac{b}{a}$.', state: { k: 5 } },
          { text: '<strong>Divide y comprueba.</strong> $C = \\frac{2\\pi\\varepsilon_0 L}{\\ln(b/a)}$. Crece con el largo y depende de los radios solo por su cociente. Si el hueco $d = b - a$ es muy chico, $\\ln(1 + d/a) \\approx d/a$ y queda $C \\approx \\frac{\\varepsilon_0 (2\\pi a L)}{d}$: placas de área $2\\pi aL$.', state: { k: 6 } }
        ]
      },
      {
        type: 'explainer', heading: 'Esférico y esfera aislada', short: 'Esférico',
        title: 'Esfera de radio a dentro de un cascarón de radio b',
        intro: 'La misma cadena con simetría esférica. Al final, alejamos el cascarón al infinito y sale la capacitancia de una esfera sola.',
        diagram: 'f2s09-sphere',
        steps: [
          { text: '<strong>Geometría y carga.</strong> Una esfera conductora de radio $a$ con $+Q$, dentro de un cascarón concéntrico de radio $b$ con $-Q$.', state: { k: 1 } },
          { text: '<strong>Gauss.</strong> Una esfera de radio $r$ entre los dos: $E\\,(4\\pi r^2) = \\frac{Q}{\\varepsilon_0}$, así que $E = \\frac{Q}{4\\pi\\varepsilon_0 r^2} = \\frac{kQ}{r^2}$, como una carga puntual.', state: { k: 2 } },
          { text: '<strong>Simetría.</strong> El campo es radial, hacia afuera, y solo existe entre $a$ y $b$. Afuera del cascarón la carga encerrada es cero.', state: { k: 3 } },
          { text: '<strong>La integral.</strong> Recorre un radio de $a$ a $b$: $V = \\int_a^b \\frac{kQ}{r^2}\\,dr$.', state: { k: 4 } },
          { text: '<strong>Integra.</strong> $V = kQ\\left(\\frac{1}{a} - \\frac{1}{b}\\right) = kQ\\,\\frac{b - a}{ab}$.', state: { k: 5 } },
          { text: '<strong>Divide y comprueba.</strong> $C = \\frac{4\\pi\\varepsilon_0\\,ab}{b - a}$. Si $b \\to \\infty$, $\\frac{ab}{b - a} \\to a$: una esfera sola tiene $C = 4\\pi\\varepsilon_0 R$ (la otra «placa» está en el infinito). Y si $b - a = d$ es chico, $C \\approx \\frac{\\varepsilon_0 (4\\pi a^2)}{d}$: otra vez placas.', state: { k: 6 } }
        ]
      },
      {
        type: 'callout', heading: 'Tres fórmulas, una sola idea',
        body: [
          '<strong>Placas:</strong> $C = \\frac{\\varepsilon_0 A}{d}$. <strong>Cilíndrico:</strong> $C = \\frac{2\\pi\\varepsilon_0 L}{\\ln(b/a)}$. <strong>Esférico:</strong> $C = \\frac{4\\pi\\varepsilon_0\\,ab}{b - a}$, y una esfera aislada, $C = 4\\pi\\varepsilon_0 R$.',
          'Las tres tienen $\\varepsilon_0$ por una longitud (área entre distancia). Y cuando el hueco es muy delgado, las tres se vuelven placas paralelas: de cerca, cualquier superficie curva parece plana. Dato curioso: la Tierra como esfera aislada ($R = 6.37 \\times 10^{6}\\ \\text{m}$) tiene apenas unos $708\\ \\mu\\text{F}$.'
        ]
      },
      {
        type: 'concept', heading: '¿Batería conectada o desconectada?', short: 'Conectada o desconectada',
        body: [
          'Como $C$ depende solo de la geometría, al mover las placas cambia $C$. Lo que pasa con lo demás depende de una sola pregunta: ¿qué se queda fijo?',
          'Para placas, el campo entre ellas es $E = V/d = \\sigma/\\varepsilon_0$. Con esas dos formas de escribirlo puedes razonar cualquier caso: con $Q$ fija, $\\sigma$ no cambia y $E$ tampoco; con $V$ fija, $E = V/d$ baja si separas.'
        ],
        list: [
          '<strong>Batería conectada: $V$ fija.</strong> La batería mantiene el voltaje. Si separas las placas, $C$ baja y la carga $Q = CV$ también: parte de la carga regresa a la batería.',
          '<strong>Batería desconectada: $Q$ fija.</strong> La carga no tiene a dónde irse. Si separas las placas, $C$ baja y el voltaje $V = Q/C$ sube. El campo no cambia.'
        ],
        diagram: 'f2s09-battery',
        caption: 'Separar las placas al doble: con la batería conectada, $V$ se queda y $Q$ baja a la mitad; desconectada, $Q$ se queda y $V$ se duplica.'
      },
      {
        type: 'callout', heading: 'Cierre breve: el dieléctrico',
        body: [
          'Si llenas el espacio entre los conductores con un aislante (papel, plástico, vidrio), sus moléculas se polarizan: dejan una capa de carga opuesta junto a cada placa que debilita el campo $\\kappa$ veces. Con la misma $Q$ hay menos $V$, así que la capacitancia crece: $$C = \\kappa\\,C_0$$',
          'La <strong>constante dieléctrica</strong> $\\kappa$ no tiene unidades y vale 1 en el vacío (el aire, casi 1). Algunos valores: papel ≈ 3.7, vidrio ≈ 5, agua ≈ 80. Además, el dieléctrico aguanta campos más fuertes que el aire antes de dejar pasar una chispa.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: capacitancia de una geometría', short: 'Receta',
        steps: [
          { text: 'Dibuja los dos conductores y ponles $+Q$ y $-Q$.', tip: 'La $Q$ es la carga de <strong>cada</strong> conductor, no la suma (que es cero).' },
          { text: 'Saca $E$ entre ellos con Gauss: caja en placas, cilindro de radio $r$ en el coaxial, esfera de radio $r$ en el esférico.' },
          { text: 'Integra del conductor $+$ al $-$: $V = \\int E\\,dl$.', tip: 'En el cilíndrico $\\int dr/r$ da logaritmo <strong>natural</strong>, y en el esférico $\\int dr/r^2$ da $1/a - 1/b$.' },
          { text: 'Divide $C = Q/V$: la $Q$ debe cancelarse. Si hay dieléctrico, multiplica por $\\kappa$.' },
          { text: 'Sustituye todo en SI y da el resultado en pF o μF.', tip: '$1\\ \\text{cm}^2 = 10^{-4}\\ \\text{m}^2$ (no $10^{-2}$) y $1\\ \\text{mm} = 10^{-3}\\ \\text{m}$. Es el error más común.' }
        ]
      },
      {
        type: 'example', heading: 'Placas paralelas y su carga',
        problem: '<p>Un capacitor tiene placas de $' + e1.A + '\\ \\text{cm}^2$ separadas $' + fx(e1.d, 1) + '\\ \\text{mm}$ por aire. ¿Cuánto vale su capacitancia? ¿Cuánta carga guarda conectado a una batería de $' + e1.V + '\\ \\text{V}$? Usa ' + ETXT + '.</p>',
        steps: [
          { text: 'Pasa a SI: $A = ' + e1.A + ' \\times 10^{-4}\\ \\text{m}^2$ y $d = ' + fx(e1.d, 1) + ' \\times 10^{-3}\\ \\text{m}$.', math: '\\begin{aligned} C &= \\frac{\\varepsilon_0 A}{d} \\\\ &= \\frac{(8.85 \\times 10^{-12})(' + sci(cm2(e1.A), 1) + ')}{' + sci(mm(e1.d), 1) + '} \\\\ &= ' + sci(e1.C) + '\\ \\text{F} = ' + fx(e1.C * pF, 1) + '\\ \\text{pF} \\end{aligned}' },
          { text: 'La carga sale de $Q = CV$.', math: '\\begin{aligned} Q &= (' + sci(e1.C) + ')(' + e1.V + ') \\\\ &= ' + sci(e1.Q) + '\\ \\text{C} \\end{aligned}' },
          { text: 'Si hubieras dejado el área en cm², te saldría $10^4$ veces más: casi $0.3\\ \\mu\\text{F}$, un valor absurdo para dos plaquitas de este tamaño.' }
        ],
        answer: '$C \\approx ' + fx(e1.C * pF, 1) + '\\ \\text{pF}$ y $Q \\approx ' + sci(e1.Q) + '\\ \\text{C}$ (unos ' + fx(e1.Q * nCu) + ' nC).',
        verify: { lab: 'call', mod: 'capacitor', fn: 'plates', args: [cm2(e1.A), mm(e1.d)], value: e1.C }
      },
      {
        type: 'example', heading: 'Un cable coaxial',
        problem: '<p>Un cable coaxial tiene un alambre central de $' + e2.a + '\\ \\text{mm}$ de radio y una malla de $' + e2.b + '\\ \\text{mm}$ de radio. ¿Qué capacitancia tienen $' + fx(e2.L, 1) + '\\ \\text{m}$ de cable con aire entre ellos? Usa ' + ETXT + '.</p>',
        steps: [
          { text: 'Los radios aparecen solo en su cociente: no hace falta pasarlos a metros.', math: '\\ln\\frac{b}{a} = \\ln\\frac{' + e2.b + '}{' + e2.a + '} = ' + fx(e2.ln, 4) },
          { text: 'Sustituye en la fórmula del cilíndrico, con $L$ en metros.', math: '\\begin{aligned} C &= \\frac{2\\pi\\varepsilon_0 L}{\\ln(b/a)} \\\\ &= \\frac{2\\pi(8.85 \\times 10^{-12})(' + fx(e2.L, 1) + ')}{' + fx(e2.ln, 4) + '} \\\\ &= ' + sci(e2.C) + '\\ \\text{F} \\end{aligned}' },
          { text: 'Por metro de cable son $' + fx(e2.C / e2.L * pF, 1) + '\\ \\text{pF/m}$: los fabricantes dan este dato así.' }
        ],
        answer: '$C \\approx ' + fx(e2.C * pF, 1) + '\\ \\text{pF}$.',
        verify: { lab: 'call', mod: 'capacitor', fn: 'cylinder', args: [mm(e2.a), mm(e2.b), e2.L], value: e2.C }
      },
      {
        type: 'example', heading: 'Esférico contra esfera aislada',
        problem: '<p>Una esfera metálica de $' + e3.a + '\\ \\text{cm}$ de radio está dentro de un cascarón concéntrico de $' + e3.b + '\\ \\text{cm}$. ¿Cuál es su capacitancia? ¿Y la de la esfera sola, sin el cascarón? Usa ' + ETXT + '.</p>',
        steps: [
          { text: 'Aquí los radios no aparecen como cociente: pásalos a metros.', math: '\\begin{aligned} \\frac{ab}{b - a} &= \\frac{(' + fx(cm(e3.a)) + ')(' + fx(cm(e3.b)) + ')}{' + fx(cm(e3.b - e3.a)) + '} \\\\ &= ' + fx(cm(e3.a) * cm(e3.b) / cm(e3.b - e3.a), 3) + '\\ \\text{m} \\end{aligned}' },
          { text: 'Multiplica por $4\\pi\\varepsilon_0$.', math: '\\begin{aligned} C &= 4\\pi(8.85 \\times 10^{-12})(' + fx(cm(e3.a) * cm(e3.b) / cm(e3.b - e3.a), 3) + ') \\\\ &= ' + sci(e3.C) + '\\ \\text{F} \\end{aligned}' },
          { text: 'Sin cascarón, $C = 4\\pi\\varepsilon_0 a$: cuatro veces menos. El cascarón cercano «jala» la carga y baja el voltaje.', math: '4\\pi\\varepsilon_0 a = ' + sci(e3.iso) + '\\ \\text{F}' }
        ],
        answer: 'Con el cascarón, $C \\approx ' + fx(e3.C * pF, 1) + '\\ \\text{pF}$; la esfera sola, $' + fx(e3.iso * pF, 2) + '\\ \\text{pF}$.',
        verify: { lab: 'call', mod: 'capacitor', fn: 'sphere', args: [cm(e3.a), cm(e3.b)], value: e3.C }
      },
      {
        type: 'example', heading: 'Separar las placas sin batería',
        problem: '<p>Un capacitor de placas de $' + e4.A + '\\ \\text{cm}^2$ separadas $' + e4.d + '\\ \\text{mm}$ se carga con una batería de $' + e4.V + '\\ \\text{V}$. Luego se desconecta la batería y las placas se separan hasta $' + 2 * e4.d + '\\ \\text{mm}$. ¿Qué pasa con $Q$, $V$, $E$ y la energía? Usa ' + ETXT + '.</p>',
        steps: [
          { text: 'Antes de separar.', math: '\\begin{aligned} C_0 &= \\frac{\\varepsilon_0 A}{d} = ' + fx(e4.C0 * pF, 1) + '\\ \\text{pF} \\\\ Q &= C_0 V_0 = ' + sci(e4.Q) + '\\ \\text{C} \\end{aligned}' },
          { text: 'Sin batería, $Q$ se queda. La separación se duplica, así que $C$ baja a la mitad y $V = Q/C$ se duplica.', math: '\\begin{aligned} C &= ' + fx(e4.C * pF, 2) + '\\ \\text{pF} \\\\ V &= \\frac{Q}{C} = ' + fx(e4.V2, 1) + '\\ \\text{V} \\end{aligned}' },
          { text: 'El campo no cambia: $E = V/d$ antes y después da lo mismo, porque $\\sigma = Q/A$ no cambió.', math: 'E = \\frac{' + e4.V + '}{' + sci(mm(e4.d), 1) + '} = \\frac{' + fx(e4.V2, 1) + '}{' + sci(mm(2 * e4.d), 1) + '} = ' + sci(e4.E) + '\\ \\text{V/m}' },
          { text: 'La energía $\\tfrac{1}{2}QV$ se duplica (la verás a fondo en S10): la puso quien separó las placas, que se atraen.', math: 'U_0 = ' + sci(e4.U0) + '\\ \\text{J} \\ \\to\\ U = ' + sci(e4.U) + '\\ \\text{J}' }
        ],
        answer: '$Q$ y $E$ no cambian; $V$ pasa de ' + e4.V + ' a ' + fx(e4.V2, 1) + ' V y la energía se duplica.',
        verify: { lab: 'call', mod: 'capacitor', fn: 'platesChange', args: [cm2(e4.A), mm(e4.d), 1, e4.V, 'Q', null, mm(2 * e4.d)], values: { V: e4.V2, E: e4.E, Q: e4.Q, U: e4.U } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: 'Si cargo más el capacitor, ¿aumenta su capacitancia?', a: 'No. Más carga da más voltaje en la misma proporción, y $C = Q/V$ se queda igual. La capacitancia es como el ancho del tinaco: no cambia por echarle más agua.' },
          { q: '¿Por qué entre las placas es $\\sigma/\\varepsilon_0$ y no $\\sigma/2\\varepsilon_0$?', a: 'Cada placa sola da $\\sigma/2\\varepsilon_0$ (S04). Entre ellas los dos campos apuntan igual y se suman; afuera apuntan opuesto y se cancelan.' },
          { q: '¿La carga total de un capacitor cargado no es $2Q$?', a: 'No: es $+Q + (-Q) = 0$. Cargar un capacitor no crea carga, solo la separa. Cuando se dice «tiene carga $Q$», es la de cada conductor.' },
          { q: '¿Por qué en el coaxial no tengo que pasar los radios a metros?', a: 'Porque aparecen como cociente, $b/a$, y las unidades se cancelan. El largo $L$ sí va en metros. En el esférico, $ab/(b - a)$ tiene unidades de longitud: ahí sí hay que convertir.' },
          { q: 'Si separo las placas, ¿el voltaje sube o baja?', a: 'Depende de la batería. Conectada, el voltaje no cambia (lo fija ella) y baja la carga. Desconectada, la carga no cambia y el voltaje sube, porque $C$ bajó.' },
          { q: '¿Una sola esfera puede ser un capacitor?', a: 'Sí: la otra «placa» está en el infinito (o en la tierra, muy lejos). Su potencial es $kQ/R$, así que $C = 4\\pi\\varepsilon_0 R$.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          '$C = Q/V$ en farads; depende solo de la geometría y del material, nunca de $Q$ ni de $V$.',
          'Cadena: $Q \\to E$ por Gauss $\\to V = \\int E\\,dl \\to C = Q/V$. Placas: $\\varepsilon_0 A/d$; coaxial: $2\\pi\\varepsilon_0 L/\\ln(b/a)$; esférico: $4\\pi\\varepsilon_0 ab/(b - a)$; esfera sola: $4\\pi\\varepsilon_0 R$.',
          'Batería conectada: $V$ fija. Desconectada: $Q$ fija. Con eso y $C$ nuevo sacas todo lo demás.',
          'Un dieléctrico multiplica la capacitancia: $C = \\kappa C_0$.'
        ]
      }
    ],

    lab: {
      type: 'capacitor-plates', title: 'Deslizadores d y A',
      intro: 'Mueve el área y la separación de las placas (o los radios del coaxial y del esférico), agrega un dieléctrico y conecta o desconecta la batería. El lab sigue la cadena $Q \\to E \\to V \\to C$ e integra $E\\,dl$ numéricamente. Calcula $C$, la carga o el nuevo voltaje al separar las placas sin batería, y el lab te dice si olvidaste convertir cm² o mm, si invertiste $A/d$ o si confundiste qué se conserva.',
      cfg: { start: { A: 100, d: 2, V: 12, kappa: 1 } }
    },

    formulas: [
      { label: 'Capacitancia', tex: 'C = \\frac{Q}{V}' },
      { label: 'Placas paralelas', tex: 'C = \\frac{\\varepsilon_0 A}{d},\\ \\ E = \\frac{\\sigma}{\\varepsilon_0} = \\frac{V}{d}' },
      { label: 'Cilíndrico', tex: 'C = \\frac{2\\pi\\varepsilon_0 L}{\\ln(b/a)}' },
      { label: 'Esférico', tex: 'C = \\frac{4\\pi\\varepsilon_0\\,ab}{b - a}' },
      { label: 'Esfera aislada', tex: 'C = 4\\pi\\varepsilon_0 R' },
      { label: 'Dieléctrico', tex: 'C = \\kappa C_0' },
      { label: 'Constante', tex: '\\varepsilon_0 = 8.85 \\times 10^{-12}\\ \\text{C}^2/(\\text{N·m}^2)' }
    ],

    exercises: [
      {
        id: 'f2-s09-placas', title: 'Placas paralelas en pF',
        vars: { A: [10, 400, 10], d: [0.5, 5, 0.5] },
        prompt: function (v) { return '<p>Dos placas de $' + v.A + '\\ \\text{cm}^2$ están separadas $' + v.d + '\\ \\text{mm}$ por aire. ¿Cuánto vale la capacitancia? Da $C$ en pF ($1\\ \\text{pF} = 10^{-12}\\ \\text{F}$). Usa ' + ETXT + '.</p>'; },
        check: 'numeric', unit: 'pF',
        answer: function (v) { return Cpl(cm2(v.A), mm(v.d)) * pF; },
        mistakes: {
          cm2: function (v) { return Cpl(v.A, mm(v.d)) * pF; },
          mm: function (v) { return Cpl(cm2(v.A), v.d) * pF; },
          cm2as2: function (v) { return Cpl(v.A / 100, mm(v.d)) * pF; },
          inverted: function (v) { return eps0 * mm(v.d) / cm2(v.A) * pF; }
        },
        feedback: [
          { when: 'cm2', say: 'Dejaste el área en cm². Pásala a m²: $1\\ \\text{cm}^2 = 10^{-4}\\ \\text{m}^2$.' },
          { when: 'mm', say: 'Dejaste la separación en mm. Pásala a metros: $1\\ \\text{mm} = 10^{-3}\\ \\text{m}$.' },
          { when: 'cm2as2', say: 'Un cm² no es $10^{-2}\\ \\text{m}^2$: como es un cuadrado de $10^{-2}\\ \\text{m}$ de lado, es $10^{-4}\\ \\text{m}^2$.' },
          { when: 'inverted', say: 'Lo invertiste: $C = \\varepsilon_0 A/d$. Más área da más capacitancia.' }
        ],
        oracle: { lab: 'call', mod: 'capacitor', fn: 'fromIntegral', args: function (v) { return ['plates', { A: cm2(v.A), d: mm(v.d) }, 1e12]; } },
        hint: 'Convierte $A$ a m² y $d$ a m, y usa $C = \\varepsilon_0 A/d$. Pasa los farads a pF multiplicando por $10^{12}$.',
        solution: function (v) {
          var C = Cpl(cm2(v.A), mm(v.d));
          return '$$\\begin{aligned} C &= \\frac{\\varepsilon_0 A}{d} \\\\ &= \\frac{(8.85 \\times 10^{-12})(' + sci(cm2(v.A)) + ')}{' + sci(mm(v.d)) + '} \\\\ &= ' + sci(C) + '\\ \\text{F} \\\\ &= ' + fx(C * pF) + '\\ \\text{pF} \\end{aligned}$$';
        }
      },
      {
        id: 'f2-s09-carga', title: 'Carga con una batería',
        vars: { A: [20, 300, 10], d: [0.5, 4, 0.5], V: [3, 24, 1] },
        prompt: function (v) { return '<p>Un capacitor de placas de $' + v.A + '\\ \\text{cm}^2$ separadas $' + v.d + '\\ \\text{mm}$ se conecta a una batería de $' + v.V + '\\ \\text{V}$. ¿Cuánta carga queda en cada placa? Da $Q$ en nC ($1\\ \\text{nC} = 10^{-9}\\ \\text{C}$). Usa ' + ETXT + '.</p>'; },
        check: 'numeric', unit: 'nC',
        answer: function (v) { return Cpl(cm2(v.A), mm(v.d)) * v.V * nCu; },
        mistakes: {
          cm2: function (v) { return Cpl(v.A, mm(v.d)) * v.V * nCu; },
          mm: function (v) { return Cpl(cm2(v.A), v.d) * v.V * nCu; },
          divide: function (v) { return Cpl(cm2(v.A), mm(v.d)) / v.V * nCu; },
          noV: function (v) { return Cpl(cm2(v.A), mm(v.d)) * nCu; }
        },
        feedback: [
          { when: 'cm2', say: 'El área va en m²: $1\\ \\text{cm}^2 = 10^{-4}\\ \\text{m}^2$.' },
          { when: 'mm', say: 'La separación va en metros: $1\\ \\text{mm} = 10^{-3}\\ \\text{m}$.' },
          { when: 'divide', say: 'De $C = Q/V$ se despeja $Q = CV$: multiplica por el voltaje.' },
          { when: 'noV', say: 'Ese número es $C$ (en nF). Te faltó multiplicar por el voltaje: $Q = CV$.' }
        ],
        oracle: { lab: 'call', mod: 'capacitor', fn: 'charge', args: function (v) { return ['plates', { A: cm2(v.A), d: mm(v.d) }, v.V, 1e9]; } },
        hint: 'Primero $C = \\varepsilon_0 A/d$ en SI; luego $Q = CV$ y pasa a nC.',
        solution: function (v) {
          var C = Cpl(cm2(v.A), mm(v.d));
          return '$$\\begin{aligned} C &= \\frac{(8.85 \\times 10^{-12})(' + sci(cm2(v.A)) + ')}{' + sci(mm(v.d)) + '} \\\\ &= ' + sci(C) + '\\ \\text{F} \\end{aligned}$$ $$\\begin{aligned} Q &= CV = (' + sci(C) + ')(' + v.V + ') \\\\ &= ' + sci(C * v.V) + '\\ \\text{C} \\\\ &= ' + fx(C * v.V * nCu) + '\\ \\text{nC} \\end{aligned}$$';
        }
      },
      {
        id: 'f2-s09-coaxial', title: 'Capacitancia de un cable coaxial',
        vars: { a: [0.2, 1.5, 0.1], b: [2, 8, 0.5], L: [0.5, 20, 0.5] },
        prompt: function (v) { return '<p>Un cable coaxial tiene un alambre central de $' + v.a + '\\ \\text{mm}$ de radio y una malla de $' + v.b + '\\ \\text{mm}$ de radio, con aire entre ellos. ¿Cuál es la capacitancia de $' + v.L + '\\ \\text{m}$ de cable? Da $C$ en pF. Usa ' + ETXT + '.</p>'; },
        check: 'numeric', unit: 'pF',
        answer: function (v) { return Ccyl(mm(v.a), mm(v.b), v.L) * pF; },
        mistakes: {
          log10: function (v) { return 2 * Math.PI * eps0 * v.L / Math.log10(v.b / v.a) * pF; },
          noTwoPi: function (v) { return eps0 * v.L / Math.log(v.b / v.a) * pF; },
          flipped: function (v) { return 2 * Math.PI * eps0 * v.L / Math.log(v.a / v.b) * pF; }
        },
        feedback: [
          { when: 'log10', say: 'La integral de $dr/r$ es el logaritmo natural: usa $\\ln$, no $\\log_{10}$.' },
          { when: 'noTwoPi', say: 'Te faltó el $2\\pi$: el costado del cilindro gaussiano tiene área $2\\pi rL$.' },
          { when: 'flipped', say: 'El cociente va al revés: integra de $a$ a $b$ y sale $\\ln(b/a)$, que es positivo.' }
        ],
        oracle: { lab: 'call', mod: 'capacitor', fn: 'fromIntegral', args: function (v) { return ['cylinder', { a: mm(v.a), b: mm(v.b), L: v.L }, 1e12]; } },
        hint: 'Usa $C = \\frac{2\\pi\\varepsilon_0 L}{\\ln(b/a)}$. Los radios pueden quedarse en mm (se cancelan); $L$ va en metros.',
        solution: function (v) {
          var ln = Math.log(v.b / v.a), C = Ccyl(mm(v.a), mm(v.b), v.L);
          return '$$\\begin{aligned} \\ln\\frac{b}{a} &= \\ln\\frac{' + v.b + '}{' + v.a + '} = ' + fx(ln, 4) + ' \\\\ C &= \\frac{2\\pi(8.85 \\times 10^{-12})(' + v.L + ')}{' + fx(ln, 4) + '} \\\\ &= ' + sci(C) + '\\ \\text{F} \\\\ &= ' + fx(C * pF) + '\\ \\text{pF} \\end{aligned}$$';
        }
      },
      {
        id: 'f2-s09-esferico', title: 'Capacitor esférico',
        vars: { a: [2, 15, 1], b: [3, 30, 1] },
        prompt: function (v) { return '<p>Una esfera conductora de $' + v.a + '\\ \\text{cm}$ de radio está dentro de un cascarón conductor concéntrico de $' + v.b + '\\ \\text{cm}$ de radio. ¿Cuál es la capacitancia? Da $C$ en pF. Usa ' + ETXT + '.</p>'; },
        check: 'numeric', unit: 'pF',
        answer: function (v) { return Csph(cm(v.a), cm(v.b)) * pF; },
        mistakes: {
          cm: function (v) { return Csph(v.a, v.b) * pF; },
          sum: function (v) { return 4 * Math.PI * eps0 * cm(v.a) * cm(v.b) / cm(v.a + v.b) * pF; },
          noFourPi: function (v) { return eps0 * cm(v.a) * cm(v.b) / cm(v.b - v.a) * pF; },
          isolated: function (v) { return 4 * Math.PI * eps0 * cm(v.a) * pF; }
        },
        feedback: [
          { when: 'cm', say: 'Dejaste los radios en cm. Aquí no se cancelan: $ab/(b - a)$ tiene unidades de longitud y va en metros.' },
          { when: 'sum', say: 'El denominador es $b - a$: de $\\frac{1}{a} - \\frac{1}{b} = \\frac{b - a}{ab}$.' },
          { when: 'noFourPi', say: 'Te faltó el $4\\pi$: el área de la esfera gaussiana es $4\\pi r^2$.' },
          { when: 'isolated', say: 'Esa es la esfera sola, $4\\pi\\varepsilon_0 a$. El cascarón está cerca: usa $\\frac{4\\pi\\varepsilon_0 ab}{b - a}$.' }
        ],
        oracle: { lab: 'call', mod: 'capacitor', fn: 'fromIntegral', args: function (v) { return ['sphere', { a: cm(v.a), b: cm(v.b) }, 1e12]; } },
        hint: 'Usa $C = \\frac{4\\pi\\varepsilon_0 ab}{b - a}$ con $a$ y $b$ en metros.',
        solution: function (v) {
          var a = cm(v.a), b = cm(v.b), g = a * b / (b - a), C = Csph(a, b);
          return '$$\\begin{aligned} \\frac{ab}{b - a} &= \\frac{(' + fx(a) + ')(' + fx(b) + ')}{' + fx(b - a) + '} \\\\ &= ' + fx(g, 4) + '\\ \\text{m} \\end{aligned}$$ $$\\begin{aligned} C &= 4\\pi(8.85 \\times 10^{-12})(' + fx(g, 4) + ') \\\\ &= ' + sci(C) + '\\ \\text{F} \\\\ &= ' + fx(C * pF) + '\\ \\text{pF} \\end{aligned}$$';
        }
      },
      {
        id: 'f2-s09-desconectada', title: 'Concepto: separar las placas sin batería',
        vars: { n: [2, 4, 1] },
        prompt: function (v) { return '<p>Cargas un capacitor de placas paralelas con una batería y luego la <strong>desconectas</strong>. Después separas las placas hasta $' + v.n + '$ veces su distancia original. ¿Qué pasa con el voltaje $V$, el campo $E$ y la carga $Q$?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: '$V$ se multiplica por ' + v.n + '; $E$ y $Q$ no cambian', correct: true },
            { text: '$V$ no cambia; $Q$ se divide entre ' + v.n, say: 'Eso pasaría con la batería conectada, que fija el voltaje. Desconectada, la carga no tiene a dónde irse.' },
            { text: '$V$ se divide entre ' + v.n + '; $Q$ no cambia', say: 'Al separar, $C = \\varepsilon_0 A/d$ baja. Con $Q$ fija, $V = Q/C$ sube, no baja.' },
            { text: '$V$, $E$ y $Q$ se multiplican por ' + v.n, say: 'La carga no puede cambiar: las placas están aisladas. Y $E = \\sigma/\\varepsilon_0$ depende solo de $Q/A$.' }
          ];
        },
        answer: function (v) { return '$V$ se multiplica por ' + v.n + '; $E$ y $Q$ no cambian'; },
        hint: 'Sin batería, ¿qué cantidad no puede cambiar? Luego usa $C = \\varepsilon_0 A/d$ y $V = Q/C$.',
        solution: function (v) { return 'Sin batería, $Q$ se conserva. Con $' + v.n + 'd$, la capacitancia baja a $C/' + v.n + '$, así que $V = Q/C$ se multiplica por ' + v.n + '. El campo $E = \\sigma/\\varepsilon_0 = Q/(\\varepsilon_0 A)$ no cambia (también $E = V/d$: los dos crecen igual).'; }
      }
    ],

    quiz: { tags: ['f2.S09'], count: 8 },

    errors: [
      'Convertir mal las unidades: $1\\ \\text{cm}^2 = 10^{-4}\\ \\text{m}^2$ (no $10^{-2}$) y $1\\ \\text{mm} = 10^{-3}\\ \\text{m}$.',
      'Invertir la fórmula de placas: es $\\varepsilon_0 A/d$, no $\\varepsilon_0 d/A$.',
      'Pensar que $C$ cambia con la carga o el voltaje: solo depende de la geometría y del material.',
      'Usar $\\log_{10}$ en el cilíndrico, o $b + a$ en lugar de $b - a$ en el esférico.',
      'Confundir qué se conserva: con la batería conectada se queda $V$; desconectada, se queda $Q$.',
      'Usar $\\sigma/2\\varepsilon_0$ entre las placas: ahí los campos de las dos placas se suman y da $\\sigma/\\varepsilon_0$.',
      'Dividir entre $\\kappa$ en lugar de multiplicar: el dieléctrico aumenta la capacitancia.'
    ],

    teacher: {
      plan: [
        'Abre con el tinaco y la definición $C = Q/V$; insiste en que $C$ no depende de $Q$.',
        'Haz las placas en el pizarrón con la cadena completa ($Q \\to E \\to V \\to C$); que ellos hagan el coaxial y el esférico con la misma plantilla.',
        'Muestra los límites: hueco delgado → placas; $b \\to \\infty$ → esfera aislada.',
        'Cierra con el lab: desconecten la batería y separen las placas; que predigan antes de mover el deslizador.'
      ],
      check: [
        'Que conviertan cm² a m² con $10^{-4}$.',
        'Que digan qué se conserva antes de calcular un cambio.',
        'Que la $Q$ se cancele al final de cada derivación.'
      ],
      note: 'La ley de Gauss se ve a fondo en S08; aquí basta su forma «flujo = carga encerrada / ε₀» con superficies simétricas. Si el grupo aún no la domina, saca $E$ de placas como suma de dos planos de S04 y el del coaxial con la línea infinita.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §8.1 “Capacitors and Capacitance”. <a href="https://openstax.org/books/university-physics-volume-2/pages/8-1-capacitors-and-capacitance">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §8.4 “Capacitor with a Dielectric”. <a href="https://openstax.org/books/university-physics-volume-2/pages/8-4-capacitor-with-a-dielectric">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-08',
    next: 'sesion-10'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check !== 'numeric' || !ex.mistakes) return;
    ex.where = ex.id === 'f2-s09-esferico' ? distinct(ex, function (v) { return v.b > v.a; }) : distinct(ex);
  });
})();
