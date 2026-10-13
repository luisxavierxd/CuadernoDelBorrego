/* =====================================================================
   Física 3 · S15 · Energía en el campo magnético, con circuito LC como detalle
   (bloque C · Inducción). Última sesión del curso.
   Fuentes: OpenStax, University Physics Volume 2, §14.3 y §14.5 (CC BY-NC-SA 4.0).
   μ₀ = 4π × 10⁻⁷ T·m/A. Unidades SI; energía en J o mJ.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.menergy (lab magnetic-energy).
   El circuito LC va solo como detalle: sin lab, ejercicios, banco ni examen.
   ===================================================================== */
(function () {
  var MU0 = 4 * Math.PI * 1e-7, TAU = 2 * Math.PI;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function ME() { return window.LabMath.menergy; }
  function area(r) { return Math.PI * Math.pow(r / 100, 2); }
  function Lsol(N, r, l) { return MU0 * N * N * area(r) / (l / 100); }
  function Ltor(N, a, b, h) { return MU0 * N * N * (h / 100) * Math.log(b / a) / TAU; }
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

  // Ejemplo 1: solenoide de 500 vueltas, r = 2.0 cm, ℓ = 20 cm, I = 3.0 A: dos formas.
  var e1 = { N: 500, r: 2, l: 20, I: 3 };
  e1.A = area(e1.r); e1.V = e1.A * e1.l / 100; e1.B = MU0 * e1.N * e1.I / (e1.l / 100); e1.u = e1.B * e1.B / (2 * MU0);
  e1.L = Lsol(e1.N, e1.r, e1.l); e1.U = 0.5 * e1.L * e1.I * e1.I;
  // Ejemplo 2: densidad en un resonador de 3.0 T y en el campo de la Tierra (50 µT).
  var e2 = { B1: 3.0, B2: 50e-6 }; e2.u1 = e2.B1 * e2.B1 / (2 * MU0); e2.u2 = e2.B2 * e2.B2 / (2 * MU0);
  // Ejemplo 3: toroide de 1000 vueltas, a = 5.0 cm, b = 8.0 cm, h = 2.0 cm, I = 2.0 A.
  var e3 = { N: 1000, a: 5, b: 8, h: 2, I: 2 };
  e3.L = Ltor(e3.N, e3.a, e3.b, e3.h); e3.U = 0.5 * e3.L * e3.I * e3.I; e3.Ba = MU0 * e3.N * e3.I / (TAU * e3.a / 100); e3.Bb = MU0 * e3.N * e3.I / (TAU * e3.b / 100);
  // Ejemplo 4: corriente para guardar 10 J en 0.50 H.
  var e4 = { L: 0.5, U: 10 }; e4.I = Math.sqrt(2 * e4.U / e4.L);

  var data = window.SESSION_DATA = {
    slug: 'sesion-15', number: '15', group: 'C · Inducción',
    title: 'Energía en el campo magnético y circuito LC', temario: [],
    minutes: 120,
    quote: 'La energía de un inductor no está en el alambre: está guardada en el campo magnético, a razón de B²/2μ₀ por metro cúbico.',
    badges: [
      'Deducir la energía de un inductor, $U = \\tfrac{1}{2}LI^2$, a partir del trabajo contra la fem autoinducida.',
      'Usar la densidad de energía magnética $u = B^2/2\\mu_0$ y comprobar que su integral da $\\tfrac{1}{2}LI^2$.',
      'Calcular la energía y la inductancia de un solenoide y de un toroide.',
      'Reconocer el circuito LC como un intercambio de energía entre $C$ y $L$ (detalle).'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Para subir la corriente de un inductor hay que empujar contra su fem autoinducida. Ese trabajo no se pierde: queda <strong>guardado en el campo magnético</strong>, igual que la energía de un capacitor queda guardada en el campo eléctrico.',
        recall: [
          'Fem autoinducida $\\varepsilon = -L\\,dI/dt$ e inductancia de un solenoide $L = \\mu_0N^2A/\\ell$ (<a href="../sesion-13/">S13</a>).',
          'Circuito RL y la corriente que crece hacia $\\varepsilon/R$ (<a href="../sesion-14/">S14</a>).',
          'Energía de un capacitor, $U = \\tfrac{1}{2}CV^2$, y densidad $u = \\tfrac{1}{2}\\varepsilon_0E^2$ (<a href="../../../fisica-2/sesiones/sesion-10/">Física 2 · S10</a>).',
          'Toroide: $B = \\mu_0NI/2\\pi r$ (<a href="../sesion-09/">S09</a>).'
        ],
        why: 'Los equipos de resonancia magnética guardan megajoules en su campo, y apagarlos de golpe es peligroso. Las fuentes conmutadas de tu cargador guardan energía en un inductor y la sueltan miles de veces por segundo. Y la chispa de una bujía sale de la energía guardada en la bobina de encendido.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en un volante pesado: para ponerlo a girar tienes que hacer trabajo, y mientras gira guarda ese trabajo como energía cinética, $\\tfrac{1}{2}mv^2$. Si lo sueltas, sigue girando y puede devolver la energía.',
          'Un inductor con corriente es lo mismo en versión eléctrica: la inductancia es la “masa”, la corriente es la “velocidad” y la energía guardada es $\\tfrac{1}{2}LI^2$. Por eso la corriente de un inductor no se puede detener de golpe: habría que sacar toda esa energía en un instante.'
        ]
      },
      {
        type: 'explainer', heading: 'La energía de un inductor', short: 'U = ½LI²',
        title: 'El trabajo para subir la corriente',
        intro: 'Subimos la corriente de un inductor de cero a $I$. En cada instante, la fuente tiene que empujar contra la fem autoinducida $L\\,di/dt$.',
        diagram: 'f3s15-build',
        steps: [
          { text: 'Con la corriente en $i$, la potencia que la fuente entrega al inductor es su voltaje por la corriente: $P = \\left(L\\,\\dfrac{di}{dt}\\right)i$.', state: { I: 0.3 } },
          { text: 'En un tiempo $dt$, el trabajo es $dW = P\\,dt = Li\\,di$. En la gráfica de $Li$ contra $i$ es una franja delgada bajo la recta.', state: { I: 0.6 } },
          { text: 'Suma (integra) desde $i = 0$ hasta $i = I$: el área del triángulo. $$U = \\int_0^I Li\\,di = \\tfrac{1}{2}LI^2$$ No depende de qué tan rápido subiste la corriente: solo del valor final.', state: { I: 1 } }
        ]
      },
      {
        type: 'concept', heading: 'La energía está en el campo: u = B²/2μ₀', short: 'Densidad',
        body: [
          'Aplícalo a un solenoide largo: $L = \\mu_0N^2A/\\ell$ y $B = \\mu_0NI/\\ell$, así que $I = B\\ell/(\\mu_0N)$. Sustituye: $$U = \\tfrac{1}{2}\\,\\frac{\\mu_0N^2A}{\\ell}\\left(\\frac{B\\ell}{\\mu_0N}\\right)^2 = \\frac{B^2}{2\\mu_0}\\,(A\\ell)$$',
          '$A\\ell$ es el volumen donde hay campo. Entonces la energía por unidad de volumen es la <strong>densidad de energía magnética</strong>: $$u_B = \\frac{B^2}{2\\mu_0}$$ en J/m³. Aunque la dedujimos con un solenoide, vale en cualquier punto donde haya campo magnético, igual que $u_E = \\tfrac{1}{2}\\varepsilon_0E^2$ para el campo eléctrico.',
          'Cuando el campo no es uniforme, se suma (integra) la densidad sobre el volumen: $U = \\int u_B\\,dV$.'
        ],
        diagram: 'f3s15-density',
        caption: 'En el solenoide ideal la densidad es uniforme adentro: $U = u\\cdot A\\ell = \\tfrac{1}{2}LI^2$.'
      },
      {
        type: 'concept', heading: 'El toroide: un campo que cambia con r', short: 'Toroide',
        body: [
          'En un toroide de sección rectangular (radios $a$ y $b$, alto $h$), el campo es $B = \\mu_0NI/2\\pi r$ y la densidad, $u = B^2/2\\mu_0$, baja como $1/r^2$. Toma una capa cilíndrica de radio $r$ y grosor $dr$, de volumen $dV = 2\\pi rh\\,dr$: $$U = \\int_a^b \\frac{1}{2\\mu_0}\\left(\\frac{\\mu_0NI}{2\\pi r}\\right)^2 2\\pi rh\\,dr = \\frac{\\mu_0N^2I^2h}{4\\pi}\\ln\\frac{b}{a}$$',
          'Comparando con $U = \\tfrac{1}{2}LI^2$ sale la inductancia del toroide sin calcular flujos: $$L = \\frac{\\mu_0N^2h}{2\\pi}\\ln\\frac{b}{a}$$ La energía es una forma muy cómoda de calcular inductancias.',
          'Lo mismo pasa con un cable coaxial (dos conductores cilíndricos de radios $a$ y $b$): por unidad de largo, $U/\\ell = \\dfrac{\\mu_0I^2}{4\\pi}\\ln\\dfrac{b}{a}$ y $L/\\ell = \\dfrac{\\mu_0}{2\\pi}\\ln\\dfrac{b}{a}$.'
        ],
        diagram: 'f3s15-toroid',
        caption: 'La energía se suma por capas: más concentrada cerca del radio interior.'
      },
      {
        type: 'concept', heading: '¿A dónde va la energía en un circuito RL?', short: 'Balance en el RL',
        body: [
          'Multiplica la malla del RL (<a href="../sesion-14/">S14</a>) por $I$: $$\\varepsilon I = I^2R + LI\\,\\frac{dI}{dt}$$ La potencia de la batería se reparte en calor en el resistor y en energía que entra al campo del inductor, $\\dfrac{d}{dt}\\left(\\tfrac{1}{2}LI^2\\right)$.',
          'Al principio casi todo va al inductor; al final, con la corriente constante, el inductor ya no recibe nada y toda la potencia va al resistor. Al quitar la batería, la energía guardada $\\tfrac{1}{2}LI_0^2$ sale del inductor y se disipa en $R$ mientras la corriente decae.'
        ],
        diagram: 'f3s15-powers',
        caption: 'La potencia que entra al inductor sube y luego se apaga: cuando la corriente deja de cambiar, ya no guarda más.'
      },
      {
        type: 'concept', heading: 'Detalle: el circuito LC', short: 'Circuito LC',
        body: [
          'Conecta un capacitor cargado a un inductor (sin resistencia). El capacitor empuja corriente; el inductor la deja crecer poco a poco y, cuando el capacitor se vacía, la corriente sigue y lo carga al revés. La energía <strong>pasa del campo eléctrico al magnético y de regreso</strong>: $$\\frac{q^2}{2C} + \\frac{1}{2}LI^2 = \\text{constante}$$',
          'Es un oscilador, como una masa en un resorte, con frecuencia angular $\\omega = 1/\\sqrt{LC}$. Así se sintonizan los radios. Para este curso basta con la idea; con resistencia, las oscilaciones se van apagando.'
        ],
        diagram: 'f3s15-lc', state: { ph: 50 },
        caption: 'La energía se reparte entre el capacitor ($U_E$) y el inductor ($U_B$); la suma no cambia.'
      },
      {
        type: 'recipe', heading: 'Receta: energía magnética', short: 'Receta',
        steps: [
          { text: 'Si conoces $L$ e $I$: $U = \\tfrac{1}{2}LI^2$, con $L$ en henries.', tip: 'mH × A² = mJ: si dejas $L$ en mH, el resultado sale en mJ.' },
          { text: 'Si conoces el campo: $u = B^2/2\\mu_0$, con $B$ en teslas.', tip: 'Con $B$ en mT sin convertir, $u$ sale $10^6$ veces mayor.' },
          { text: 'Campo uniforme (solenoide): $U = u\\cdot(\\text{volumen})$. Campo que cambia (toroide, coaxial): divide en capas $dV = 2\\pi rh\\,dr$ e integra.' },
          { text: 'Para una corriente que guarda cierta energía: $I = \\sqrt{2U/L}$.' },
          { text: 'Comprueba con las dos formas cuando puedas: $\\tfrac{1}{2}LI^2$ y $\\int u\\,dV$ deben coincidir.' }
        ]
      },
      {
        type: 'example', heading: 'La energía de un solenoide, de dos formas',
        problem: '<p>Un solenoide de aire de $' + e1.N + '$ vueltas, $' + fx(e1.r, 1) + '\\ \\text{cm}$ de radio y $' + e1.l + '\\ \\text{cm}$ de largo lleva $' + fx(e1.I, 1) + '\\ \\text{A}$. Calcula la energía guardada con $\\tfrac{1}{2}LI^2$ y con la densidad de energía.</p>',
        diagram: 'f3s15-density',
        steps: [
          { text: 'Inductancia y energía:', math: 'L = \\frac{\\mu_0N^2A}{\\ell} = ' + fx(e1.L * 1000, 3) + '\\ \\text{mH}\\qquad U = \\tfrac{1}{2}LI^2 = \\tfrac{1}{2}(' + fx(e1.L * 1000, 3) + '\\times 10^{-3})(' + fx(e1.I, 1) + ')^2 = ' + fx(e1.U * 1000, 2) + '\\ \\text{mJ}' },
          { text: 'Ahora por el campo:', math: 'B = \\frac{\\mu_0NI}{\\ell} = ' + fx(e1.B * 1000, 2) + '\\ \\text{mT}\\qquad u = \\frac{B^2}{2\\mu_0} = ' + fx(e1.u, 1) + '\\ \\text{J/m}^3' },
          { text: 'Por el volumen $A\\ell$:', math: 'V = \\pi(0.020)^2(0.20) = ' + fx(e1.V * 1e4, 3) + '\\times 10^{-4}\\ \\text{m}^3\\qquad U = uV = ' + fx(e1.u * e1.V * 1000, 2) + '\\ \\text{mJ}' },
          { text: 'Las dos formas coinciden: la energía del inductor es la energía del campo dentro de él.' }
        ],
        answer: '$U \\approx ' + fx(e1.U * 1000, 2) + '\\ \\text{mJ}$ por los dos caminos.',
        verify: { lab: 'call', mod: 'menergy', fn: 'solenoid', args: [e1.N, e1.r, e1.l, e1.I], values: { L: e1.L, UL: e1.U, B: e1.B, u: e1.u, Uu: e1.U } }
      },
      {
        type: 'example', heading: 'Densidades: un resonador contra la Tierra',
        problem: '<p>Compara la densidad de energía magnética dentro de un equipo de resonancia de $' + fx(e2.B1, 1) + '\\ \\text{T}$ con la del campo de la Tierra, $50\\ \\mu\\text{T}$.</p>',
        steps: [
          { text: 'En el resonador:', math: 'u = \\frac{B^2}{2\\mu_0} = \\frac{(' + fx(e2.B1, 1) + ')^2}{2(4\\pi\\times 10^{-7})} = ' + fx(e2.u1 / 1e6, 2) + '\\times 10^{6}\\ \\text{J/m}^3' },
          { text: 'En el campo de la Tierra, con $B = 5.0\\times 10^{-5}\\ \\text{T}$:', math: 'u = \\frac{(5.0\\times 10^{-5})^2}{2(4\\pi\\times 10^{-7})} = ' + fx(e2.u2 * 1e3, 2) + '\\times 10^{-3}\\ \\text{J/m}^3' },
          { text: 'El cociente es $(B_1/B_2)^2 = (6\\times 10^4)^2 \\approx 3.6\\times 10^{9}$. Unos litros de ese campo guardan miles de joules: por eso apagar un resonador se hace con cuidado.' }
        ],
        answer: '$u \\approx ' + fx(e2.u1 / 1e6, 2) + '\\times 10^{6}\\ \\text{J/m}^3$ contra $' + fx(e2.u2 * 1e3, 2) + '\\times 10^{-3}\\ \\text{J/m}^3$.',
        verify: { lab: 'call', mod: 'menergy', fn: 'density', args: [e2.B1], value: e2.u1 }
      },
      {
        type: 'example', heading: 'Energía e inductancia de un toroide',
        problem: '<p>Un toroide de sección rectangular tiene $' + e3.N + '$ vueltas, radio interior $' + fx(e3.a, 1) + '\\ \\text{cm}$, exterior $' + fx(e3.b, 1) + '\\ \\text{cm}$ y alto $' + fx(e3.h, 1) + '\\ \\text{cm}$, y lleva $' + fx(e3.I, 1) + '\\ \\text{A}$. Halla la energía guardada y su inductancia.</p>',
        diagram: 'f3s15-toroid',
        steps: [
          { text: 'Integra la densidad por capas (resultado de la lección):', math: 'U = \\frac{\\mu_0N^2I^2h}{4\\pi}\\ln\\frac{b}{a} = \\frac{(4\\pi\\times 10^{-7})(' + e3.N + ')^2(' + fx(e3.I, 1) + ')^2(0.020)}{4\\pi}\\ln\\frac{8.0}{5.0} = ' + fx(e3.U * 1000, 2) + '\\ \\text{mJ}' },
          { text: 'De $U = \\tfrac{1}{2}LI^2$:', math: 'L = \\frac{2U}{I^2} = ' + fx(e3.L * 1000, 2) + '\\ \\text{mH}' },
          { text: 'El campo va de $' + fx(e3.Ba * 1000, 1) + '\\ \\text{mT}$ en $r = a$ a $' + fx(e3.Bb * 1000, 1) + '\\ \\text{mT}$ en $r = b$: la energía está más concentrada adentro.' }
        ],
        answer: '$U \\approx ' + fx(e3.U * 1000, 2) + '\\ \\text{mJ}$ y $L \\approx ' + fx(e3.L * 1000, 2) + '\\ \\text{mH}$.',
        verify: { lab: 'call', mod: 'menergy', fn: 'toroid', args: [e3.N, e3.a, e3.b, e3.h, e3.I], values: { UL: e3.U, L: e3.L, Ba: e3.Ba, Bb: e3.Bb } }
      },
      {
        type: 'example', heading: '¿Qué corriente guarda 10 J?',
        problem: '<p>Un inductor de $' + fx(e4.L) + '\\ \\text{H}$ debe guardar $' + e4.U + '\\ \\text{J}$. ¿Qué corriente necesita?</p>',
        steps: [
          { text: 'Despeja de $U = \\tfrac{1}{2}LI^2$:', math: 'I = \\sqrt{\\frac{2U}{L}} = \\sqrt{\\frac{2(' + e4.U + ')}{' + fx(e4.L) + '}} = ' + fx(e4.I, 2) + '\\ \\text{A}' },
          { text: 'Duplicar la corriente cuadruplica la energía: con $' + fx(2 * e4.I, 1) + '\\ \\text{A}$ guardaría $40\\ \\text{J}$.' }
        ],
        answer: '$I \\approx ' + fx(e4.I, 2) + '\\ \\text{A}$.',
        verify: { lab: 'call', mod: 'menergy', fn: 'currentFor', args: [e4.U, e4.L], value: e4.I }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Dónde está guardada la energía de un inductor?', a: 'En el campo magnético, a razón de $B^2/2\\mu_0$ por metro cúbico. No está en el alambre ni en la corriente misma.' },
          { q: '¿Por qué $\\tfrac{1}{2}$ y no $LI^2$?', a: 'Porque al subir la corriente, la fem que hay que vencer crece desde cero: el trabajo es el área de un triángulo, $\\tfrac{1}{2}\\cdot I\\cdot LI$.' },
          { q: '¿La energía depende de qué tan rápido subí la corriente?', a: 'No. Subirla rápido exige más voltaje durante menos tiempo; al final el área bajo $Li$ contra $i$ es la misma.' },
          { q: '¿Se parece a la energía del capacitor?', a: 'Mucho: $\\tfrac{1}{2}CV^2$ con densidad $\\tfrac{1}{2}\\varepsilon_0E^2$, contra $\\tfrac{1}{2}LI^2$ con densidad $B^2/2\\mu_0$. En el circuito LC la energía pasa de una forma a la otra.' },
          { q: '¿Por qué es peligroso abrir el circuito de un inductor grande?', a: 'Porque toda la energía $\\tfrac{1}{2}LI^2$ tiene que salir en muy poco tiempo: aparece un voltaje enorme y una chispa.' },
          { q: '¿El circuito LC va en el examen?', a: 'En este curso es un detalle para conectar con lo que sigue; los problemas son de energía magnética.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Energía de un inductor: $U = \\tfrac{1}{2}LI^2$, el trabajo para subir la corriente contra la fem autoinducida.',
          'La energía está en el campo: $u_B = B^2/2\\mu_0$ y $U = \\int u_B\\,dV$. En el solenoide, $uA\\ell = \\tfrac{1}{2}LI^2$.',
          'Toroide: $U = \\dfrac{\\mu_0N^2I^2h}{4\\pi}\\ln\\dfrac{b}{a}$ y $L = \\dfrac{\\mu_0N^2h}{2\\pi}\\ln\\dfrac{b}{a}$; la energía es otra forma de hallar $L$.',
          'En el RL, $\\varepsilon I = I^2R + d(\\tfrac{1}{2}LI^2)/dt$. Detalle: en el LC la energía va y viene entre $C$ y $L$ con $\\omega = 1/\\sqrt{LC}$.'
        ]
      }
    ],

    lab: {
      type: 'magnetic-energy', title: 'La energía guardada en el campo',
      intro: 'Elige un solenoide o un toroide y mueve las vueltas, la corriente y las medidas. Las barras comparan la energía calculada con $\\tfrac{1}{2}LI^2$ y la suma de $u = B^2/2\\mu_0$ sobre el volumen, hecha por capas: en el solenoide coinciden siempre; en el toroide, con pocas capas la suma se equivoca y con más se acerca. En el reto calculas la energía, la densidad o la corriente para guardar una energía dada; el lab te avisa si olvidaste el $\\tfrac{1}{2}$ o el cuadrado, si dejaste centímetros o militeslas, o si usaste el campo del radio medio en el toroide.',
      cfg: {}
    },

    formulas: [
      { label: 'Energía de un inductor', tex: 'U = \\tfrac{1}{2}LI^2' },
      { label: 'Densidad de energía', tex: 'u_B = \\frac{B^2}{2\\mu_0}' },
      { label: 'Energía del campo', tex: 'U = \\int u_B\\,dV' },
      { label: 'Toroide', tex: 'U = \\frac{\\mu_0N^2I^2h}{4\\pi}\\ln\\frac{b}{a},\\quad L = \\frac{\\mu_0N^2h}{2\\pi}\\ln\\frac{b}{a}' },
      { label: 'Balance en el RL', tex: '\\varepsilon I = I^2R + \\frac{d}{dt}\\left(\\tfrac{1}{2}LI^2\\right)' },
      { label: 'Detalle: LC', tex: '\\omega = \\frac{1}{\\sqrt{LC}}' }
    ],

    exercises: [
      {
        id: 'f3-s15-U', title: 'Energía de un inductor',
        vars: { L: [10, 900, 10], I: [0.5, 10, 0.5] },
        prompt: function (v) { return '<p>Un inductor de $' + v.L + '\\ \\text{mH}$ lleva $' + fx(v.I, 1) + '\\ \\text{A}$. ¿Cuánta energía guarda, en mJ?</p>'; },
        check: 'numeric', unit: 'mJ',
        answer: function (v) { return 0.5 * v.L * v.I * v.I; },
        mistakes: {
          noHalf: function (v) { return v.L * v.I * v.I; },
          noSquare: function (v) { return 0.5 * v.L * v.I; }
        },
        feedback: [
          { when: 'noHalf', say: 'Falta el $\\tfrac{1}{2}$: $U = \\tfrac{1}{2}LI^2$.' },
          { when: 'noSquare', say: 'La corriente va al cuadrado.' }
        ],
        oracle: { lab: 'value', value: function (v) { var I = ME().currentFor(1, v.L / 1000); return v.I * v.I / (I * I) * 1000; } },
        hint: '$U = \\tfrac{1}{2}LI^2$; mH × A² = mJ.',
        solution: function (v) { return '$$U = \\tfrac{1}{2}LI^2 = \\tfrac{1}{2}(' + v.L + '\\ \\text{mH})(' + fx(v.I, 1) + '\\ \\text{A})^2 = ' + fx(0.5 * v.L * v.I * v.I, 3) + '\\ \\text{mJ}$$'; }
      },
      {
        id: 'f3-s15-u', title: 'Densidad de energía',
        vars: { B: [10, 900, 10] },
        prompt: function (v) { return '<p>En una región el campo magnético mide $' + v.B + '\\ \\text{mT}$. ¿Cuánto vale la densidad de energía magnética, en J/m³?</p>'; },
        check: 'numeric', unit: 'J/m³',
        answer: function (v) { return Math.pow(v.B / 1000, 2) / (2 * MU0); },
        mistakes: {
          noHalf: function (v) { return Math.pow(v.B / 1000, 2) / MU0; },
          noSquare: function (v) { return v.B / 1000 / (2 * MU0); },
          mT: function (v) { return v.B * v.B / (2 * MU0); }
        },
        feedback: [
          { when: 'noHalf', say: 'Es $B^2/2\\mu_0$: falta el 2 del denominador.' },
          { when: 'noSquare', say: 'El campo va al cuadrado.' },
          { when: 'mT', say: 'Pasa $B$ a teslas: $1\\ \\text{mT} = 10^{-3}\\ \\text{T}$.' }
        ],
        oracle: { lab: 'call', mod: 'menergy', fn: 'density', args: function (v) { return [v.B / 1000]; } },
        hint: '$u = B^2/2\\mu_0$ con $B$ en teslas y $\\mu_0 = 4\\pi\\times 10^{-7}$.',
        solution: function (v) { return '$$u = \\frac{B^2}{2\\mu_0} = \\frac{(' + fx(v.B / 1000, 3) + ')^2}{2(4\\pi\\times 10^{-7})} = ' + fx(Math.pow(v.B / 1000, 2) / (2 * MU0), 2) + '\\ \\text{J/m}^3$$'; }
      },
      {
        id: 'f3-s15-solenoide', title: 'Energía de un solenoide',
        vars: { N: [100, 1000, 100], r: [0.5, 3, 0.5], l: [10, 40, 5], I: [0.5, 5, 0.5] },
        prompt: function (v) { return '<p>Un solenoide de aire de $' + v.N + '$ vueltas, $' + fx(v.r, 1) + '\\ \\text{cm}$ de radio y $' + v.l + '\\ \\text{cm}$ de largo lleva $' + fx(v.I, 1) + '\\ \\text{A}$. ¿Cuánta energía guarda su campo, en mJ?</p>'; },
        check: 'numeric', unit: 'mJ',
        answer: function (v) { return 0.5 * Lsol(v.N, v.r, v.l) * v.I * v.I * 1000; },
        mistakes: {
          noHalf: function (v) { return Lsol(v.N, v.r, v.l) * v.I * v.I * 1000; },
          noSquareN: function (v) { return 0.5 * Lsol(v.N, v.r, v.l) / v.N * v.I * v.I * 1000; }
        },
        feedback: [
          { when: 'noHalf', say: 'Falta el $\\tfrac{1}{2}$.' },
          { when: 'noSquareN', say: 'En $L = \\mu_0N^2A/\\ell$ va $N^2$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return ME().integrate('sol', { N: v.N, r: v.r, l: v.l, I: v.I }, 50) * 1000; } },
        hint: 'Con $L = \\mu_0N^2A/\\ell$ y $U = \\tfrac{1}{2}LI^2$, o con $u = B^2/2\\mu_0$ por el volumen $A\\ell$.',
        solution: function (v) { var L = Lsol(v.N, v.r, v.l); return '$L = \\mu_0N^2A/\\ell = ' + fx(L * 1000, 4) + '\\ \\text{mH}$. $$U = \\tfrac{1}{2}LI^2 = \\tfrac{1}{2}(' + fx(L * 1000, 4) + ')(' + fx(v.I, 1) + ')^2 = ' + fx(0.5 * L * v.I * v.I * 1000, 4) + '\\ \\text{mJ}$$'; }
      },
      {
        id: 'f3-s15-corriente', title: 'Corriente para guardar una energía',
        vars: { L: [10, 900, 10], U: [1, 500, 1] },
        prompt: function (v) { return '<p>¿Qué corriente necesita un inductor de $' + v.L + '\\ \\text{mH}$ para guardar $' + v.U + '\\ \\text{mJ}$? En A.</p>'; },
        check: 'numeric', unit: 'A',
        answer: function (v) { return Math.sqrt(2 * v.U / v.L); },
        mistakes: {
          noSqrt: function (v) { return 2 * v.U / v.L; },
          noTwo: function (v) { return Math.sqrt(v.U / v.L); }
        },
        feedback: [
          { when: 'noSqrt', say: 'Ese es $I^2$: saca la raíz.' },
          { when: 'noTwo', say: 'De $U = \\tfrac{1}{2}LI^2$: $I = \\sqrt{2U/L}$.' }
        ],
        baseWhere: function (v) { var I = Math.sqrt(2 * v.U / v.L); return I >= 0.2 && I <= 50; },
        oracle: { lab: 'call', mod: 'menergy', fn: 'currentFor', args: function (v) { return [v.U / 1000, v.L / 1000]; } },
        hint: '$I = \\sqrt{2U/L}$; mJ/mH = A².',
        solution: function (v) { return '$$I = \\sqrt{\\frac{2U}{L}} = \\sqrt{\\frac{2(' + v.U + ')}{' + v.L + '}} = ' + fx(Math.sqrt(2 * v.U / v.L), 3) + '\\ \\text{A}$$'; }
      },
      {
        id: 'f3-s15-toroide', title: 'Energía de un toroide',
        vars: { N: [200, 1000, 100], a: [2, 6, 1], d: [1, 6, 1], h: [1, 5, 1], I: [0.5, 5, 0.5] },
        prompt: function (v) { return '<p>Un toroide de sección rectangular tiene $' + v.N + '$ vueltas, radio interior $' + v.a + '\\ \\text{cm}$, exterior $' + (v.a + v.d) + '\\ \\text{cm}$ y alto $' + v.h + '\\ \\text{cm}$. Lleva $' + fx(v.I, 1) + '\\ \\text{A}$. ¿Cuánta energía guarda, en mJ?</p>'; },
        check: 'numeric', unit: 'mJ',
        answer: function (v) { return 0.5 * Ltor(v.N, v.a, v.a + v.d, v.h) * v.I * v.I * 1000; },
        mistakes: {
          avgB: function (v) { var rm = (v.a + v.d / 2) / 100, B = MU0 * v.N * v.I / (TAU * rm); return B * B / (2 * MU0) * Math.PI * (Math.pow((v.a + v.d) / 100, 2) - Math.pow(v.a / 100, 2)) * v.h / 100 * 1000; },
          noHalf: function (v) { return Ltor(v.N, v.a, v.a + v.d, v.h) * v.I * v.I * 1000; }
        },
        feedback: [
          { when: 'avgB', say: 'Usaste el campo del radio medio como si fuera uniforme. $B$ cambia con $r$: integra, $U = (\\mu_0N^2I^2h/4\\pi)\\ln(b/a)$.' },
          { when: 'noHalf', say: 'Falta el $\\tfrac{1}{2}$ (o el 4π del denominador es 2π de más).' }
        ],
        // Otra ruta: sumar u = B²/2μ₀ en capas finas (sin logaritmos).
        oracle: { lab: 'value', value: function (v) { return ME().integrate('toroid', { N: v.N, a: v.a, b: v.a + v.d, h: v.h, I: v.I }, 200000) * 1000; } },
        hint: '$U = \\dfrac{\\mu_0N^2I^2h}{4\\pi}\\ln\\dfrac{b}{a}$, con $h$ en metros.',
        solution: function (v) { var U = 0.5 * Ltor(v.N, v.a, v.a + v.d, v.h) * v.I * v.I; return '$$U = \\frac{\\mu_0N^2I^2h}{4\\pi}\\ln\\frac{b}{a} = (10^{-7})(' + v.N + ')^2(' + fx(v.I, 1) + ')^2(' + fx(v.h / 100, 2) + ')\\ln\\frac{' + (v.a + v.d) + '}{' + v.a + '} = ' + fx(U * 1000, 4) + '\\ \\text{mJ}$$'; }
      },
      {
        id: 'f3-s15-B', title: 'Campo a partir de la densidad',
        vars: { u: [1, 900, 1] },
        prompt: function (v) { return '<p>La densidad de energía magnética en una región es $' + v.u + '\\ \\text{J/m}^3$. ¿Cuánto vale $B$, en mT?</p>'; },
        check: 'numeric', unit: 'mT',
        answer: function (v) { return Math.sqrt(2 * MU0 * v.u) * 1000; },
        mistakes: {
          noTwo: function (v) { return Math.sqrt(MU0 * v.u) * 1000; },
          noSqrt: function (v) { return 2 * MU0 * v.u * 1000; }
        },
        feedback: [
          { when: 'noTwo', say: 'De $u = B^2/2\\mu_0$: $B = \\sqrt{2\\mu_0u}$.' },
          { when: 'noSqrt', say: 'Ese es $B^2$: saca la raíz.' }
        ],
        oracle: { lab: 'value', value: function (v) { return Math.sqrt(v.u / ME().density(1)) * 1000; } },
        hint: '$B = \\sqrt{2\\mu_0u}$.',
        solution: function (v) { return '$$B = \\sqrt{2\\mu_0u} = \\sqrt{2(4\\pi\\times 10^{-7})(' + v.u + ')} = ' + fx(Math.sqrt(2 * MU0 * v.u) * 1000, 3) + '\\ \\text{mT}$$'; }
      },
      {
        id: 'f3-s15-doble', title: 'Concepto: duplicar la corriente',
        vars: { k: [0, 1, 1] },
        prompt: function (v) { return '<p>En un inductor duplicas ' + (v.k ? 'la inductancia (con la misma corriente)' : 'la corriente') + '. ¿Qué pasa con la energía guardada?</p>'; },
        check: 'choice',
        options: function (v) {
          var right = v.k ? 'Se duplica' : 'Se multiplica por 4';
          return ['Se multiplica por 4', 'Se duplica', 'No cambia'].map(function (t) {
            if (t === right) return { text: t, correct: true };
            return { text: t, say: t === 'No cambia' ? 'Sí cambia: $U = \\tfrac{1}{2}LI^2$.' : v.k ? '$U$ es lineal en $L$.' : '$U$ va con $I^2$.' };
          });
        },
        answer: function (v) { return v.k ? 'Se duplica' : 'Se multiplica por 4'; },
        hint: '$U = \\tfrac{1}{2}LI^2$.',
        solution: function (v) { return v.k ? '$U$ es proporcional a $L$: <strong>se duplica</strong>.' : '$U$ va con $I^2$: $(2I)^2 = 4I^2$, <strong>se multiplica por 4</strong>.'; }
      }
    ],

    quiz: { tags: ['f3.S15'], count: 8 },

    errors: [
      'Olvidar el $\\tfrac{1}{2}$ en $U = \\tfrac{1}{2}LI^2$ o el 2 en $u = B^2/2\\mu_0$.',
      'No elevar al cuadrado la corriente o el campo.',
      'Dejar $B$ en mT o el volumen en cm³.',
      'Usar el campo del radio medio en un toroide como si fuera uniforme.',
      'Pensar que la energía está en el alambre: está en el campo.',
      'Creer que la energía depende de qué tan rápido se subió la corriente.'
    ],

    teacher: {
      plan: [
        'Analogía del volante y explainer del trabajo contra la fem autoinducida: el área del triángulo da $\\tfrac{1}{2}LI^2$.',
        'Del solenoide a la densidad $u = B^2/2\\mu_0$ (ejemplos 1 y 2). Que comparen con $\\tfrac{1}{2}\\varepsilon_0E^2$ de Física 2.',
        'Toroide por capas: la integral da la energía y de ahí la inductancia (ejemplo 3). Mención del coaxial.',
        'Balance de energía en el RL y el LC como detalle. Cierra con el lab: que suban las capas en el toroide hasta que coincida.'
      ],
      check: [
        'Que calculen la energía con $\\tfrac{1}{2}LI^2$ y con $\\int u\\,dV$ y vean que coincide.',
        'Que expliquen dónde está guardada la energía de un inductor.',
        'Que justifiquen por qué un campo no uniforme exige integrar.'
      ],
      note: 'Es la última sesión del curso. El circuito LC queda como detalle (sin ejercicios ni examen). Lo que sigue en electromagnetismo, las ecuaciones de Maxwell y las ondas electromagnéticas, queda fuera de este curso.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §14.3 “Energy in a Magnetic Field”. <a href="https://openstax.org/books/university-physics-volume-2/pages/14-3-energy-in-a-magnetic-field">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §14.5 “Oscillations in an LC Circuit”. <a href="https://openstax.org/books/university-physics-volume-2/pages/14-5-oscillations-in-an-lc-circuit">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-14',
    next: null
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { if (!ex.baseWhere) ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
