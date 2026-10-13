/* =====================================================================
   Física 3 · S13 · Autoinducción e inductancia, con inductancia mutua como detalle
   (bloque C · Inducción).
   Fuentes: OpenStax, University Physics Volume 2, §14.2 y §14.1 (CC BY-NC-SA 4.0).
   μ₀ = 4π × 10⁻⁷ T·m/A. Unidades SI: L en H (1 H = 1 V·s/A = 1 Wb/A).
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.inductor (lab inductance-solenoid).
   La inductancia mutua va solo como detalle: sin lab, ejercicios, banco ni examen.
   ===================================================================== */
(function () {
  var MU0 = 4 * Math.PI * 1e-7, TAU = 2 * Math.PI;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function IN() { return window.LabMath.inductor; }
  function area(r) { return Math.PI * Math.pow(r / 100, 2); }
  function Lsol(N, r, l, Km) { return (Km || 1) * MU0 * N * N * area(r) / (l / 100); }
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) {
          var big = Math.max(Math.abs(vals[i]), Math.abs(vals[j])), small = Math.min(Math.abs(vals[i]), Math.abs(vals[j]));
          if (Math.abs(vals[i] - vals[j]) <= Math.max(0.03 * big, small >= 0.09 ? 0.025 : 0)) return false;
        }
      }
      return true;
    };
  }

  // Ejemplo 1: solenoide de 400 vueltas, r = 1.0 cm, ℓ = 15 cm (aire).
  var e1 = { N: 400, r: 1.0, l: 15 }; e1.A = area(e1.r); e1.L = Lsol(e1.N, e1.r, e1.l, 1);
  // Ejemplo 2: L = 25 mH; la corriente sube de 0 a 2.0 A en 5.0 ms.
  var e2 = { L: 0.025, dI: 2.0, dt: 0.005 }; e2.rate = e2.dI / e2.dt; e2.emf = -e2.L * e2.rate;
  // Ejemplo 3: 200 vueltas, r = 2.0 cm, ℓ = 10 cm, núcleo K_m = 200; I = 0.30 sen(2π·60 t) A.
  var e3 = { N: 200, r: 2.0, l: 10, Km: 200, Im: 0.30, f: 60 };
  e3.L = Lsol(e3.N, e3.r, e3.l, e3.Km); e3.w = TAU * e3.f; e3.peak = e3.L * e3.Im * e3.w;
  // Ejemplo 4: vueltas para 10 mH con r = 1.5 cm y ℓ = 20 cm (aire).
  var e4 = { L: 0.010, r: 1.5, l: 20 }; e4.N = Math.sqrt(e4.L * (e4.l / 100) / (MU0 * area(e4.r)));

  var data = window.SESSION_DATA = {
    slug: 'sesion-13', number: '13', group: 'C · Inducción',
    title: 'Autoinducción e inductancia, con inductancia mutua', temario: [],
    minutes: 120,
    quote: 'Una bobina se opone a que cambie su propia corriente: la inductancia mide qué tanto.',
    badges: [
      'Explicar la autoinducción: una corriente que cambia induce una fem en su propio circuito, que se opone al cambio.',
      'Usar $L = N\\Phi/I$ y $\\varepsilon = -L\\,dI/dt$, con la polaridad correcta.',
      'Deducir y usar la inductancia de un solenoide, $L = \\mu_0N^2A/\\ell$, y el efecto de un núcleo.',
      'Reconocer la inductancia mutua entre dos bobinas (detalle).'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Una bobina con corriente produce su propio campo y su propio flujo. Si la corriente cambia, ese flujo cambia y, por Faraday, aparece una fem <strong>en la misma bobina</strong>. Es la <strong>autoinducción</strong>.',
        recall: [
          'Campo dentro de un solenoide largo: $B = \\mu_0nI = \\mu_0NI/\\ell$ (<a href="../sesion-09/">S09</a>).',
          'Ley de Faraday y ley de Lenz: $\\varepsilon = -N\\,d\\Phi/dt$, la fem se opone al cambio (<a href="../sesion-11/">S11</a>, <a href="../sesion-12/">S12</a>).',
          'Capacitancia: $C = Q/V$ depende solo de la geometría (<a href="../../../fisica-2/sesiones/sesion-09/">Física 2 · S09</a>). La inductancia es su pariente magnético.'
        ],
        why: 'Los inductores suavizan corrientes en fuentes de poder, guardan energía en convertidores, forman filtros con capacitores y aparecen en cada motor y transformador. Y la autoinducción explica la chispa que salta al desconectar un aparato con motor.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en el agua en una manguera larga. Cuando abres la llave, el agua no sale a todo lo que da al instante: hay que acelerar toda la columna. Y si cierras de golpe, el agua “quiere seguir” y da un golpe (el golpe de ariete).',
          'Una bobina hace lo mismo con la corriente: le cuesta que la corriente <strong>cambie</strong>, en cualquier sentido. No le importa cuánta corriente hay, sino qué tan rápido cambia. Esa “inercia eléctrica” es la inductancia.'
        ]
      },
      {
        type: 'explainer', heading: 'La bobina se opone a su propio cambio', short: 'Autoinducción',
        title: 'Corriente constante, creciente y decreciente',
        intro: 'Una bobina conectada a un circuito. Su corriente produce un campo dentro de ella, y por lo tanto un flujo por sus propias vueltas.',
        diagram: 'f3s13-self',
        steps: [
          { text: 'Corriente constante: el flujo no cambia y no hay fem autoinducida. La bobina se porta como un simple alambre.', state: { c: 0, on: 0 } },
          { text: 'La corriente <strong>crece</strong>: el flujo propio crece y, por Lenz, se induce una fem que empuja en contra de la corriente. El lado por donde entra la corriente queda a mayor potencial.', state: { c: 1, on: 1 } },
          { text: 'La corriente <strong>decrece</strong>: ahora la fem empuja a favor de la corriente, para sostenerla. Por eso, si abres un interruptor de golpe, la fem puede ser enorme y saltar una chispa.', state: { c: -1, on: 1 } }
        ]
      },
      {
        type: 'concept', heading: 'Inductancia: L = NΦ/I', short: 'Inductancia',
        body: [
          'El flujo propio es proporcional a la corriente (el campo lo es). A la constante se le llama <strong>inductancia</strong> (o autoinductancia): $$L = \\frac{N\\Phi}{I}$$ donde $N\\Phi$ es el enlace de flujo de las $N$ vueltas.',
          'Si $L$ no cambia (la geometría es fija), derivar $N\\Phi = LI$ y usar Faraday da $$\\varepsilon = -L\\,\\frac{dI}{dt}$$',
          'La unidad es el <strong>henry</strong>: $1\\ \\text{H} = 1\\ \\text{Wb/A} = 1\\ \\text{V·s/A}$. Un henry es mucho: los inductores comunes van de microhenries a algunos henries. Igual que la capacitancia, $L$ depende solo de la geometría y del material, no de la corriente.'
        ]
      },
      {
        type: 'concept', heading: 'Polaridad de la fem autoinducida', short: 'Polaridad',
        body: [
          'En un circuito, el inductor se dibuja como un resorte. Si recorres el inductor en el sentido de la corriente, el cambio de potencial es $\\Delta V = -L\\,dI/dt$.',
          'Si la corriente crece ($dI/dt > 0$), el potencial <strong>baja</strong> al cruzar el inductor: el lado por donde entra la corriente es el positivo. Si decrece, el potencial sube. Esta regla es la que usaremos en la malla del circuito RL (<a href="../sesion-14/">S14</a>).'
        ],
        diagram: 'f3s13-polarity',
        caption: 'Con la corriente creciendo, el inductor actúa como una pila puesta en contra; con la corriente bajando, como una pila a favor.'
      },
      {
        type: 'concept', heading: 'La inductancia de un solenoide', short: 'Solenoide',
        body: [
          'En un solenoide largo de $N$ vueltas, largo $\\ell$ y área $A$, el campo de adentro es $B = \\mu_0NI/\\ell$ (<a href="../sesion-09/">S09</a>) y cada vuelta atraviesa $\\Phi = BA$. Entonces $$L = \\frac{N\\Phi}{I} = \\frac{N}{I}\\cdot\\frac{\\mu_0NI}{\\ell}A = \\frac{\\mu_0N^2A}{\\ell}$$',
          '¿Por qué $N^2$? Una $N$ viene de que el campo es proporcional al número de vueltas; la otra, de que <strong>cada una</strong> de esas $N$ vueltas atraviesa el flujo. Duplicar las vueltas (en el mismo largo) cuadruplica $L$.',
          'El modelo supone un solenoide largo, con $B$ uniforme adentro. En un solenoide corto el campo se abre en los extremos y la $L$ real es un poco menor; el lab te muestra las dos.'
        ],
        diagram: 'f3s13-solenoid',
        caption: 'Dentro del solenoide el campo es uniforme; el enlace de flujo de las $N$ vueltas es $N\\Phi = LI$.'
      },
      {
        type: 'concept', heading: 'Un núcleo multiplica la inductancia', short: 'Núcleo',
        body: [
          'Si llenas el solenoide con un material magnético de permeabilidad relativa $K_m$ (<a href="../sesion-10/">S10</a>), el campo adentro se multiplica por $K_m$, y la inductancia también: $$L = K_m\\,\\frac{\\mu_0N^2A}{\\ell}$$',
          'Las ferritas tienen $K_m$ de decenas a miles, y el hierro dulce, miles. Por eso los inductores y transformadores reales casi siempre tienen núcleo: dan la misma $L$ con muchas menos vueltas.'
        ]
      },
      {
        type: 'concept', heading: 'La fem va con la pendiente de I(t)', short: 'Pendiente',
        body: [
          'Como $\\varepsilon = -L\\,dI/dt$, una gráfica de $I(t)$ dice todo: donde $I$ sube en línea recta la fem es constante y negativa; donde $I$ es constante la fem es cero; donde $I$ baja rápido la fem es grande y positiva.',
          'Con una corriente alterna $I = I_m\\sin(\\omega t)$, la fem es $\\varepsilon = -LI_m\\omega\\cos(\\omega t)$: su valor máximo es $LI_m\\omega$. A más frecuencia, más fem: por eso los inductores “frenan” las corrientes que cambian rápido.'
        ],
        diagram: 'f3s13-graphs',
        caption: 'La fem autoinducida es $-L$ veces la pendiente de $I(t)$.'
      },
      {
        type: 'concept', heading: 'Detalle: inductancia mutua', short: 'Inductancia mutua',
        body: [
          'Si hay dos bobinas cerca, el flujo de una atraviesa a la otra. Cuando cambia la corriente $I_1$ de la bobina 1, se induce una fem en la bobina 2: $$\\varepsilon_2 = -M\\,\\frac{dI_1}{dt}, \\qquad M = \\frac{N_2\\Phi_{21}}{I_1}$$',
          'La constante $M$ es la <strong>inductancia mutua</strong>, también en henries, y es la misma en los dos sentidos ($M_{12} = M_{21}$). En eso se basan los transformadores, los cargadores inalámbricos y los marcapasos que se recargan desde afuera. Para este curso basta con la idea; los problemas son de autoinducción.'
        ],
        diagram: 'f3s13-mutual',
        caption: 'La corriente de la bobina 1 produce un flujo en la bobina 2; si cambia, induce una fem en ella.'
      },
      {
        type: 'recipe', heading: 'Receta: problemas de inductancia', short: 'Receta',
        steps: [
          { text: 'Si te dan la geometría de un solenoide, calcula $A = \\pi r^2$ y usa $L = K_m\\mu_0N^2A/\\ell$ con todo en metros.', tip: 'Radio en cm → pásalo a m antes de elevar al cuadrado. Y es $N^2$, no $N$.' },
          { text: 'Si te dan el flujo, usa la definición: $L = N\\Phi/I$.' },
          { text: 'Para la fem: $|\\varepsilon| = L\\,|dI/dt|$, con $L$ en henries y $dI/dt$ en A/s.', tip: 'mH → H: divide entre 1000. Y es la rapidez de cambio de $I$, no $I$.' },
          { text: 'Con corriente senoidal, deriva: $|\\varepsilon|_{\\max} = LI_m\\omega$, con $\\omega = 2\\pi f$.' },
          { text: 'Revisa el sentido: la fem se opone al cambio de corriente (si crece, empuja en contra; si baja, a favor).' }
        ]
      },
      {
        type: 'example', heading: 'La inductancia de un solenoide de aire',
        problem: '<p>Un solenoide de $' + e1.N + '$ vueltas, $' + fx(e1.r, 1) + '\\ \\text{cm}$ de radio y $' + e1.l + '\\ \\text{cm}$ de largo no tiene núcleo. ¿Cuánto vale su inductancia?</p>',
        diagram: 'f3s13-solenoid',
        steps: [
          { text: 'Área de la sección, con el radio en metros:', math: 'A = \\pi(0.010\\ \\text{m})^2 = ' + fx(e1.A * 1e4, 3) + '\\times 10^{-4}\\ \\text{m}^2' },
          { text: 'Fórmula del solenoide con $\\ell = 0.15\\ \\text{m}$:', math: 'L = \\frac{\\mu_0N^2A}{\\ell} = \\frac{(4\\pi\\times 10^{-7})(' + e1.N + ')^2(' + fx(e1.A * 1e4, 3) + '\\times 10^{-4})}{0.15}' },
          { text: 'Resultado:', math: 'L = ' + fx(e1.L * 1e4, 2) + '\\times 10^{-4}\\ \\text{H} = ' + fx(e1.L * 1000, 3) + '\\ \\text{mH}' }
        ],
        answer: '$L \\approx ' + fx(e1.L * 1000, 3) + '\\ \\text{mH}$.',
        verify: { lab: 'call', mod: 'inductor', fn: 'ideal', args: [e1.N, e1.r, e1.l, 1], value: e1.L }
      },
      {
        type: 'example', heading: 'La fem al encender una corriente',
        problem: '<p>En un inductor de $25\\ \\text{mH}$ la corriente sube uniformemente de $0$ a $' + fx(e2.dI, 1) + '\\ \\text{A}$ en $' + fx(e2.dt * 1000, 1) + '\\ \\text{ms}$. ¿Cuánto vale la fem autoinducida y hacia dónde empuja?</p>',
        diagram: 'f3s13-polarity',
        steps: [
          { text: 'Rapidez de cambio de la corriente:', math: '\\frac{dI}{dt} = \\frac{' + fx(e2.dI, 1) + '\\ \\text{A}}{' + fx(e2.dt, 4) + '\\ \\text{s}} = ' + fx(e2.rate, 0) + '\\ \\text{A/s}' },
          { text: 'Fem, con $L$ en henries:', math: '\\varepsilon = -L\\,\\frac{dI}{dt} = -(0.025)(' + fx(e2.rate, 0) + ') = ' + fx(e2.emf, 1) + '\\ \\text{V}' },
          { text: 'El signo menos dice que la fem se opone al aumento: empuja en contra de la corriente, y el lado por donde entra la corriente queda $' + fx(-e2.emf, 0) + '$ V arriba del otro.' }
        ],
        answer: '$\\varepsilon = ' + fx(e2.emf, 1) + '\\ \\text{V}$: $' + fx(-e2.emf, 0) + '$ V en contra de la corriente mientras sube.',
        verify: { lab: 'call', mod: 'inductor', fn: 'emf', args: [e2.L, e2.rate], value: e2.emf }
      },
      {
        type: 'example', heading: 'Bobina con núcleo y corriente alterna',
        problem: '<p>Una bobina de $' + e3.N + '$ vueltas, $' + fx(e3.r, 1) + '\\ \\text{cm}$ de radio y $' + e3.l + '\\ \\text{cm}$ de largo tiene un núcleo de ferrita con $K_m = ' + e3.Km + '$. Por ella pasa $I = ' + fx(e3.Im) + '\\sin(2\\pi\\cdot ' + e3.f + '\\,t)\\ \\text{A}$. Halla su inductancia y la fem autoinducida máxima.</p>',
        steps: [
          { text: 'Inductancia con el núcleo:', math: 'L = K_m\\frac{\\mu_0N^2A}{\\ell} = ' + e3.Km + '\\cdot\\frac{(4\\pi\\times 10^{-7})(' + e3.N + ')^2\\,\\pi(0.020)^2}{0.10} = ' + fx(e3.L, 4) + '\\ \\text{H}' },
          { text: 'Deriva la corriente: $dI/dt = I_m\\omega\\cos(\\omega t)$, con $\\omega = 2\\pi(' + e3.f + ') = ' + fx(e3.w, 1) + '\\ \\text{rad/s}$.' },
          { text: 'La fem máxima ocurre cuando la corriente cruza el cero:', math: '|\\varepsilon|_{\\max} = LI_m\\omega = (' + fx(e3.L, 4) + ')(' + fx(e3.Im) + ')(' + fx(e3.w, 1) + ') = ' + fx(e3.peak, 1) + '\\ \\text{V}' }
        ],
        answer: '$L \\approx ' + fx(e3.L, 3) + '\\ \\text{H}$ y $|\\varepsilon|_{\\max} \\approx ' + fx(e3.peak, 1) + '\\ \\text{V}$.',
        verify: { lab: 'call', mod: 'inductor', fn: 'state', args: [{ N: e3.N, r: e3.r, l: e3.l, Km: e3.Km, kind: 'sine', Im: e3.Im, f: e3.f }, 0], values: { L: e3.L, emf: -e3.peak } }
      },
      {
        type: 'example', heading: 'Diseñar un inductor de 10 mH',
        problem: '<p>Quieres un inductor de aire de $10\\ \\text{mH}$ con un tubo de $' + fx(e4.r, 1) + '\\ \\text{cm}$ de radio y $' + e4.l + '\\ \\text{cm}$ de largo. ¿Cuántas vueltas necesitas?</p>',
        steps: [
          { text: 'Despeja $N$ de $L = \\mu_0N^2A/\\ell$:', math: 'N = \\sqrt{\\frac{L\\ell}{\\mu_0A}}' },
          { text: 'Con $A = \\pi(0.015)^2 = ' + fx(area(e4.r) * 1e4, 3) + '\\times 10^{-4}\\ \\text{m}^2$:', math: 'N = \\sqrt{\\frac{(0.010)(0.20)}{(4\\pi\\times 10^{-7})(' + fx(area(e4.r) * 1e4, 3) + '\\times 10^{-4})}} = ' + fx(e4.N, 0) },
          { text: 'Unas $' + fx(Math.ceil(e4.N), 0) + '$ vueltas. Con un núcleo de $K_m = 100$ bastarían 10 veces menos ($\\sqrt{100} = 10$).' }
        ],
        answer: '$N \\approx ' + fx(e4.N, 0) + '$ vueltas.',
        verify: { lab: 'call', mod: 'inductor', fn: 'turnsFor', args: [e4.L, e4.r, e4.l, 1], value: e4.N }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Un inductor se opone a la corriente?', a: 'No a la corriente, sino a su <strong>cambio</strong>. Con corriente directa constante, un inductor ideal es un alambre (fem cero).' },
          { q: '¿Por qué salta una chispa al desconectar un motor?', a: 'Al abrir el circuito la corriente cae a cero en muy poco tiempo: $dI/dt$ es enorme y la fem autoinducida también. Ese voltaje grande hace saltar la chispa entre los contactos.' },
          { q: '¿L depende de la corriente?', a: 'No. Igual que $C$, depende de la geometría (vueltas, área, largo) y del material del núcleo. El flujo sí depende de la corriente, pero proporcionalmente.' },
          { q: '¿Por qué $N^2$ y no $N$?', a: 'Más vueltas producen más campo (una $N$) y además ese campo atraviesa más vueltas (otra $N$).' },
          { q: '¿Qué tan grande es un henry?', a: 'Muy grande. Un solenoide de aire de unas cuantas centenas de vueltas tiene fracciones de milihenry. Para llegar a henries se necesitan muchas vueltas y un núcleo de hierro.' },
          { q: '¿La inductancia mutua es para el examen?', a: 'En este curso es un detalle para entender transformadores y cargadores; los ejercicios y el examen son de autoinducción.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Autoinducción: si la corriente de una bobina cambia, se induce en ella misma una fem que se opone al cambio.',
          'Inductancia: $L = N\\Phi/I$, en henries; $\\varepsilon = -L\\,dI/dt$. Si $I$ crece, el potencial baja al cruzar el inductor.',
          'Solenoide: $L = K_m\\mu_0N^2A/\\ell$; duplicar $N$ cuadruplica $L$, y un núcleo la multiplica por $K_m$.',
          'Detalle: la inductancia mutua $M$ liga dos bobinas, $\\varepsilon_2 = -M\\,dI_1/dt$.'
        ]
      }
    ],

    lab: {
      type: 'inductance-solenoid', title: 'Inductancia de un solenoide',
      intro: 'Cambia las vueltas, el radio, el largo y el núcleo del solenoide: el lab calcula $L$ con el modelo ideal y con el campo real en el eje (efectos de borde). Luego elige una corriente en rampa o senoidal y recorre el tiempo: las gráficas de $I(t)$ y $\\varepsilon(t) = -L\\,dI/dt$ muestran que la fem sigue a la pendiente de la corriente. En el reto calculas $L$, la fem en un instante o las vueltas para una $L$ dada; el lab te avisa si usaste $N$ en lugar de $N^2$, si dejaste centímetros, si olvidaste el núcleo o si usaste $I$ en lugar de $dI/dt$.',
      cfg: {}
    },

    formulas: [
      { label: 'Inductancia', tex: 'L = \\frac{N\\Phi}{I}' },
      { label: 'Fem autoinducida', tex: '\\varepsilon = -L\\,\\frac{dI}{dt}' },
      { label: 'Solenoide', tex: 'L = K_m\\frac{\\mu_0N^2A}{\\ell}' },
      { label: 'Corriente alterna', tex: '|\\varepsilon|_{\\max} = LI_m\\omega' },
      { label: 'Henry', tex: '1\\ \\text{H} = 1\\ \\text{Wb/A} = 1\\ \\text{V·s/A}' },
      { label: 'Detalle: mutua', tex: '\\varepsilon_2 = -M\\,\\frac{dI_1}{dt}' }
    ],

    exercises: [
      {
        id: 'f3-s13-L', title: 'Inductancia de un solenoide',
        vars: { N: [100, 1000, 50], r: [0.5, 3, 0.5], l: [5, 40, 5] },
        prompt: function (v) { return '<p>Un solenoide de aire tiene $' + v.N + '$ vueltas, $' + fx(v.r, 1) + '\\ \\text{cm}$ de radio y $' + v.l + '\\ \\text{cm}$ de largo. ¿Cuánto vale su inductancia, en mH?</p>'; },
        check: 'numeric', unit: 'mH',
        answer: function (v) { return Lsol(v.N, v.r, v.l, 1) * 1000; },
        mistakes: {
          noSquare: function (v) { return Lsol(v.N, v.r, v.l, 1) * 1000 / v.N; },
          cm2: function (v) { return Lsol(v.N, v.r, v.l, 1) * 1000 * 1e4; },
          diam: function (v) { return Lsol(v.N, v.r, v.l, 1) * 1000 / 4; }
        },
        feedback: [
          { when: 'noSquare', say: 'Es $N^2$: el campo crece con $N$ y lo atraviesan $N$ vueltas.' },
          { when: 'cm2', say: 'El área va en m²: pasa el radio a metros antes de elevarlo al cuadrado.' },
          { when: 'diam', say: 'Te dieron el radio, no el diámetro: $A = \\pi r^2$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return IN().ideal(v.N, v.r, v.l, 1) * 1000; } },
        hint: '$L = \\mu_0N^2A/\\ell$ con $A = \\pi r^2$ y todo en metros.',
        solution: function (v) { var L = Lsol(v.N, v.r, v.l, 1); return '$A = \\pi(' + fx(v.r / 100, 3) + ')^2 = ' + fx(area(v.r) * 1e4, 3) + '\\times 10^{-4}\\ \\text{m}^2$. $$L = \\frac{\\mu_0N^2A}{\\ell} = \\frac{(4\\pi\\times 10^{-7})(' + v.N + ')^2(' + fx(area(v.r) * 1e4, 3) + '\\times 10^{-4})}{' + fx(v.l / 100, 2) + '} = ' + fx(L * 1000, 4) + '\\ \\text{mH}$$'; }
      },
      {
        id: 'f3-s13-fem', title: 'Fem cuando la corriente cambia',
        vars: { L: [5, 200, 5], dI: [0.5, 5, 0.5], dt: [1, 20, 1] },
        prompt: function (v) { return '<p>En un inductor de $' + v.L + '\\ \\text{mH}$ la corriente cambia uniformemente $' + fx(v.dI, 1) + '\\ \\text{A}$ en $' + v.dt + '\\ \\text{ms}$. ¿Cuánto vale la fem autoinducida (en valor absoluto), en volts?</p>'; },
        check: 'numeric', unit: 'V',
        answer: function (v) { return v.L / 1000 * v.dI / (v.dt / 1000); },
        mistakes: {
          useI: function (v) { return v.L / 1000 * v.dI; },
          mH: function (v) { return v.L * v.dI / (v.dt / 1000); },
          ms: function (v) { return v.L / 1000 * v.dI / v.dt; }
        },
        feedback: [
          { when: 'useI', say: 'La fem depende de $dI/dt$, no de $I$: divide entre el tiempo.' },
          { when: 'mH', say: 'Pasa $L$ a henries: $1\\ \\text{mH} = 10^{-3}\\ \\text{H}$.' },
          { when: 'ms', say: 'El tiempo va en segundos.' }
        ],
        oracle: { lab: 'value', value: function (v) { return Math.abs(IN().emf(v.L / 1000, v.dI / (v.dt / 1000))); } },
        hint: '$|\\varepsilon| = L\\,\\Delta I/\\Delta t$ con $L$ en H y $\\Delta t$ en s.',
        solution: function (v) { return '$$|\\varepsilon| = L\\,\\frac{\\Delta I}{\\Delta t} = (' + fx(v.L / 1000, 3) + ')\\frac{' + fx(v.dI, 1) + '}{' + fx(v.dt / 1000, 3) + '} = ' + fx(v.L / 1000 * v.dI / (v.dt / 1000), 3) + '\\ \\text{V}$$'; }
      },
      {
        id: 'f3-s13-alterna', title: 'Fem máxima con corriente alterna',
        vars: { L: [10, 500, 10], Im: [0.1, 2, 0.1], f: [50, 1000, 50] },
        prompt: function (v) { return '<p>Por un inductor de $' + v.L + '\\ \\text{mH}$ pasa $I = ' + fx(v.Im, 1) + '\\sin(2\\pi\\cdot ' + v.f + '\\,t)$ A. ¿Cuánto vale la fem autoinducida máxima, en volts?</p>'; },
        check: 'numeric', unit: 'V',
        answer: function (v) { return v.L / 1000 * v.Im * TAU * v.f; },
        mistakes: {
          noOmega: function (v) { return v.L / 1000 * v.Im; },
          f: function (v) { return v.L / 1000 * v.Im * v.f; }
        },
        feedback: [
          { when: 'noOmega', say: 'Al derivar $\\sin(\\omega t)$ sale un factor $\\omega$.' },
          { when: 'f', say: 'Usa $\\omega = 2\\pi f$, no $f$.' }
        ],
        oracle: { lab: 'value', value: function (v) { var s = IN().state({ N: 1, r: 1, l: 1, Km: 1, kind: 'sine', Im: v.Im, f: v.f }, 0); return Math.abs(s.emf / s.L) * v.L / 1000; } },
        hint: '$|\\varepsilon|_{\\max} = LI_m\\omega$ con $\\omega = 2\\pi f$.',
        solution: function (v) { var w = TAU * v.f; return '$\\omega = 2\\pi(' + v.f + ') = ' + fx(w, 1) + '\\ \\text{rad/s}$. $$|\\varepsilon|_{\\max} = LI_m\\omega = (' + fx(v.L / 1000, 3) + ')(' + fx(v.Im, 1) + ')(' + fx(w, 1) + ') = ' + fx(v.L / 1000 * v.Im * w, 3) + '\\ \\text{V}$$'; }
      },
      {
        id: 'f3-s13-vueltas', title: 'Vueltas para una inductancia',
        vars: { L: [1, 50, 1], r: [0.5, 3, 0.5], l: [5, 40, 5] },
        prompt: function (v) { return '<p>¿Cuántas vueltas necesita un solenoide de aire de $' + fx(v.r, 1) + '\\ \\text{cm}$ de radio y $' + v.l + '\\ \\text{cm}$ de largo para tener $' + v.L + '\\ \\text{mH}$? Da el número sin redondear.</p>'; },
        check: 'numeric', unit: '',
        answer: function (v) { return Math.sqrt(v.L / 1000 * (v.l / 100) / (MU0 * area(v.r))); },
        mistakes: {
          noSqrt: function (v) { return v.L / 1000 * (v.l / 100) / (MU0 * area(v.r)); },
          cm2: function (v) { return Math.sqrt(v.L / 1000 * (v.l / 100) / (MU0 * Math.PI * v.r * v.r)); }
        },
        feedback: [
          { when: 'noSqrt', say: 'Ese es $N^2$: saca la raíz.' },
          { when: 'cm2', say: 'El área va en m².' }
        ],
        baseWhere: function (v) { var N = Math.sqrt(v.L / 1000 * (v.l / 100) / (MU0 * area(v.r))); return N >= 50 && N <= 20000; },
        oracle: { lab: 'call', mod: 'inductor', fn: 'turnsFor', args: function (v) { return [v.L / 1000, v.r, v.l, 1]; } },
        hint: 'Despeja: $N = \\sqrt{L\\ell/(\\mu_0A)}$.',
        solution: function (v) { var N = Math.sqrt(v.L / 1000 * (v.l / 100) / (MU0 * area(v.r))); return '$$N = \\sqrt{\\frac{L\\ell}{\\mu_0A}} = \\sqrt{\\frac{(' + fx(v.L / 1000, 3) + ')(' + fx(v.l / 100, 2) + ')}{(4\\pi\\times 10^{-7})(' + fx(area(v.r) * 1e4, 3) + '\\times 10^{-4})}} = ' + fx(N, 1) + '$$'; }
      },
      {
        id: 'f3-s13-flujo', title: 'Flujo por vuelta',
        vars: { L: [5, 200, 5], I: [0.5, 5, 0.5], N: [100, 1000, 100] },
        prompt: function (v) { return '<p>Una bobina de $' + v.N + '$ vueltas tiene $L = ' + v.L + '\\ \\text{mH}$ y lleva $' + fx(v.I, 1) + '\\ \\text{A}$. ¿Cuánto flujo atraviesa cada vuelta, en $\\mu\\text{Wb}$?</p>'; },
        check: 'numeric', unit: 'μWb',
        answer: function (v) { return v.L / 1000 * v.I / v.N * 1e6; },
        mistakes: { noN: function (v) { return v.L / 1000 * v.I * 1e6; } },
        feedback: [{ when: 'noN', say: 'Ese es el enlace de flujo $N\\Phi = LI$; divide entre $N$.' }],
        oracle: { lab: 'value', value: function (v) { var s = IN().state({ N: v.N, r: 1, l: 1, Km: 1, kind: 'ramp', I0: v.I, k: 0 }, 0); return v.L / 1000 * s.I / v.N * 1e6; } },
        hint: '$N\\Phi = LI$.',
        solution: function (v) { return '$$\\Phi = \\frac{LI}{N} = \\frac{(' + fx(v.L / 1000, 3) + ')(' + fx(v.I, 1) + ')}{' + v.N + '} = ' + fx(v.L / 1000 * v.I / v.N * 1e6, 3) + '\\ \\mu\\text{Wb}$$'; }
      },
      {
        id: 'f3-s13-escala', title: 'Concepto: cambiar la geometría',
        vars: { k: [0, 2, 1] },
        prompt: function (v) { return '<p>En un solenoide largo ' + ['duplicas el número de vueltas sin cambiar el largo', 'duplicas el radio', 'duplicas el largo sin cambiar el número de vueltas'][v.k] + '. ¿Qué pasa con su inductancia?</p>'; },
        check: 'choice',
        options: function (v) {
          var right = ['Se multiplica por 4', 'Se multiplica por 4', 'Se reduce a la mitad'][v.k];
          var all = ['Se multiplica por 4', 'Se duplica', 'Se reduce a la mitad', 'No cambia'];
          var say = { 'Se multiplica por 4': 'Revisa cómo aparece ese factor en $L = \\mu_0N^2A/\\ell$.', 'Se duplica': v.k === 1 ? 'El área va con $r^2$.' : 'Es $N^2$: $2^2 = 4$.', 'Se reduce a la mitad': '$\\ell$ está en el denominador, pero aquí cambió otra cosa.', 'No cambia': 'Sí cambia: revisa la fórmula.' };
          return all.map(function (t) { return t === right ? { text: t, correct: true } : { text: t, say: say[t] }; });
        },
        answer: function (v) { return ['Se multiplica por 4', 'Se multiplica por 4', 'Se reduce a la mitad'][v.k]; },
        hint: '$L = \\mu_0N^2A/\\ell$, con $A = \\pi r^2$.',
        solution: function (v) { return ['Con $2N$: $(2N)^2 = 4N^2$, así que $L$ se multiplica por 4.', 'Con $2r$: $A$ se multiplica por 4, y $L$ también.', 'Con $2\\ell$ y las mismas vueltas, $L$ se reduce a la mitad.'][v.k]; }
      },
      {
        id: 'f3-s13-polaridad', title: 'Concepto: ¿qué lado queda positivo?',
        vars: { k: [0, 1, 1] },
        prompt: function (v) { return '<p>Por un inductor circula una corriente de izquierda a derecha que está <strong>' + (v.k ? 'disminuyendo' : 'aumentando') + '</strong>. ¿Qué extremo del inductor está a mayor potencial?</p>'; },
        check: 'choice',
        options: function (v) {
          var right = v.k ? 'El derecho' : 'El izquierdo';
          return [
            { text: right, correct: true },
            { text: v.k ? 'El izquierdo' : 'El derecho', say: v.k ? 'Si la corriente baja, la fem empuja a favor de ella: el potencial sube al cruzar el inductor.' : 'Si la corriente sube, la fem se opone: el potencial baja al cruzar el inductor.' },
            { text: 'Los dos están al mismo potencial', say: 'Solo si la corriente fuera constante.' }
          ];
        },
        answer: function (v) { return v.k ? 'El derecho' : 'El izquierdo'; },
        hint: 'Recorriendo el inductor a favor de la corriente, $\\Delta V = -L\\,dI/dt$.',
        solution: function (v) { return v.k ? '$dI/dt < 0$: $\\Delta V = -L\\,dI/dt > 0$ al cruzar de izquierda a derecha, así que el <strong>derecho</strong> está más alto.' : '$dI/dt > 0$: el potencial baja al cruzar, así que el <strong>izquierdo</strong> (por donde entra la corriente) está más alto.'; }
      }
    ],

    quiz: { tags: ['f3.S13'], count: 8 },

    errors: [
      'Creer que el inductor se opone a la corriente: se opone a su cambio.',
      'Usar $N$ en lugar de $N^2$ en $L = \\mu_0N^2A/\\ell$.',
      'Dejar el radio o el largo en centímetros.',
      'Calcular la fem con $I$ en lugar de $dI/dt$.',
      'Dejar $L$ en mH al calcular la fem en volts.',
      'Equivocar la polaridad: si la corriente crece, el lado por donde entra queda positivo.',
      'Olvidar el factor $K_m$ del núcleo.'
    ],

    teacher: {
      plan: [
        'Analogía de la manguera y explainer de autoinducción: constante, creciente y decreciente. La chispa al desconectar es un buen gancho.',
        'Definición $L = N\\Phi/I$, unidad henry y $\\varepsilon = -L\\,dI/dt$ con la polaridad (prepara la malla de la S14).',
        'Solenoide: deducción de $L = \\mu_0N^2A/\\ell$ y por qué $N^2$; núcleo $K_m$. Ejemplos 1, 3 y 4.',
        'Lab: comparar L ideal y con bordes; gráficas de I(t) y ε(t). Inductancia mutua solo como recuadro.'
      ],
      check: [
        'Que distingan “oponerse a la corriente” de “oponerse al cambio de la corriente”.',
        'Que calculen $L$ de un solenoide con unidades correctas y la fem con $dI/dt$.',
        'Que digan qué extremo de un inductor está a mayor potencial.'
      ],
      note: 'La inductancia mutua se queda como detalle (OpenStax §14.1): sin ejercicios, banco ni examen. El circuito RL de la S14 usa la regla de polaridad de esta sesión.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §14.2 “Self-Inductance and Inductors”. <a href="https://openstax.org/books/university-physics-volume-2/pages/14-2-self-inductance-and-inductors">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §14.1 “Mutual Inductance”. <a href="https://openstax.org/books/university-physics-volume-2/pages/14-1-mutual-inductance">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-12',
    next: 'sesion-14'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { if (!ex.baseWhere) ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
