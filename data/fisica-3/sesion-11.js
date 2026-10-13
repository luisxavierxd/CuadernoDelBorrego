/* =====================================================================
   Física 3 · S11 · Ley de Faraday y fem de movimiento (bloque C · Inducción).
   Fuentes: OpenStax, University Physics Volume 2, §13.1 y §13.3 (CC BY-NC-SA 4.0).
   Unidades SI: B en T, áreas en m², Φ en Wb = T·m², ε en V.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.faraday (lab faraday-emf).
   ===================================================================== */
(function () {
  var RAD = Math.PI / 180;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function FD() { return window.LabMath.faraday; }
  // La respuesta y cada error típico deben diferir al menos 3 % entre sí («casi» sin ambigüedad).
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) {
          var big = Math.max(Math.abs(vals[i]), Math.abs(vals[j]));
          if (Math.abs(vals[i] - vals[j]) <= Math.max(0.03 * big, Math.min(Math.abs(vals[i]), Math.abs(vals[j])) >= 0.09 ? 0.025 : 0)) return false;
        }
      }
      return true;
    };
  }
  function area(rcm) { return Math.PI * Math.pow(rcm / 100, 2); }

  // Ejemplo 1: bobina de 200 vueltas, r = 4.0 cm; B pasa de 0.10 a 0.50 T en 0.20 s (eje paralelo a B).
  var e1 = { N: 200, r: 4, B1: 0.10, B2: 0.50, dt: 0.20 };
  e1.A = area(e1.r); e1.dPhi = (e1.B2 - e1.B1) * e1.A; e1.emf = e1.N * e1.dPhi / e1.dt;
  // Ejemplo 2: barra de 25 cm a 3.0 m/s en 0.40 T, R = 1.5 Ω.
  var e2 = { B: 0.40, L: 25, v: 3.0, R: 1.5 };
  e2.emf = e2.B * e2.L / 100 * e2.v; e2.I = e2.emf / e2.R; e2.F = e2.I * e2.L / 100 * e2.B; e2.P = e2.F * e2.v;
  // Ejemplo 3: 50 vueltas de 5.0 cm de radio, normal a 30° de B; B crece a 0.40 T/s.
  var e3 = { N: 50, r: 5, th: 30, B0: 0.2, k: 0.4, t: 0.5 };
  e3.A = area(e3.r); e3.emf = e3.N * e3.A * Math.cos(e3.th * RAD) * e3.k;
  // Ejemplo 4: bobina exploradora de 100 vueltas y 2.0 cm² que se voltea 180° en B = 0.25 T; R total 40 Ω.
  var e4 = { N: 100, Acm: 2.0, B: 0.25, R: 40 };
  e4.A = e4.Acm * 1e-4; e4.dPhi = 2 * e4.B * e4.A; e4.Q = e4.N * e4.dPhi / e4.R;

  var data = window.SESSION_DATA = {
    slug: 'sesion-11', number: '11', group: 'C · Inducción',
    title: 'Ley de Faraday y fem de movimiento', temario: [],
    minutes: 120,
    quote: 'Un campo magnético que no cambia no hace nada por una espira quieta. Lo que produce corriente es el cambio del flujo: ε = −N dΦ/dt.',
    badges: [
      'Calcular el flujo magnético $\\Phi = BA\\cos\\theta$ y decir qué lo hace cambiar.',
      'Usar la ley de Faraday $\\varepsilon = -N\\,d\\Phi/dt$ para la fem promedio y la instantánea de una bobina.',
      'Deducir la fem de movimiento $\\varepsilon = BLv$ de una barra y la corriente, la fuerza y la potencia en los rieles.',
      'Reconocer que la energía eléctrica sale del trabajo de quien mueve la barra.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Hasta ahora las corrientes producían campos magnéticos. Hoy va al revés: un campo magnético que <strong>cambia</strong> produce una fem y, si hay circuito, una corriente. Eso es la <strong>inducción electromagnética</strong>.',
        recall: [
          'Flujo magnético $\\Phi = \\vec B\\cdot\\vec A = BA\\cos\\theta$, en webers ($1\\ \\text{Wb} = 1\\ \\text{T·m}^2$) (<a href="../sesion-10/">S10</a>).',
          'Fuerza magnética sobre una carga en movimiento, $\\vec F = q\\vec v\\times\\vec B$ (<a href="../sesion-02/">S02</a>), y sobre un alambre, $\\vec F = I\\vec L\\times\\vec B$ (<a href="../sesion-04/">S04</a>).',
          'Fem, corriente y potencia en un circuito: $I = \\varepsilon/R$, $P = I^2R$ (<a href="../../../fisica-2/sesiones/sesion-12/">Física 2 · S12</a>).',
          'Derivar $\\sin(\\omega t)$: sale $\\omega\\cos(\\omega t)$.'
        ],
        why: 'Casi toda la electricidad que usas se genera por inducción: en las centrales, una turbina gira bobinas dentro de un campo magnético. También funcionan así los transformadores, los cargadores inalámbricos, las estufas de inducción, las pastillas de una guitarra eléctrica y los lectores de tarjetas.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Conecta una bobina a un galvanómetro (un amperímetro muy sensible) y deja un imán quieto junto a ella. La aguja no se mueve: aunque haya campo, no hay corriente.',
          'Ahora <strong>mueve</strong> el imán hacia la bobina: la aguja salta. Detén el imán: regresa a cero. Aléjalo: salta hacia el otro lado. Muévelo más rápido: salta más.',
          'Lo que importa no es cuánto campo hay, sino <strong>qué tan rápido cambia</strong> el campo que atraviesa la bobina. Faraday lo descubrió en 1831 y lo resumió en una sola ley.'
        ],
        diagram: 'f3s11-faraday', state: { m: 0.6, v: 1 },
        caption: 'Mientras el imán se acerca, el galvanómetro marca corriente; si el imán se detiene, la aguja vuelve a cero.'
      },
      {
        type: 'explainer', heading: 'El experimento de Faraday', short: 'Experimento',
        title: 'Imán, bobina y galvanómetro',
        intro: 'El mismo imán y la misma bobina, en cuatro momentos. Fíjate en cuándo se mueve la aguja.',
        diagram: 'f3s11-faraday',
        steps: [
          { text: 'El imán está quieto lejos de la bobina. Por la bobina pasa un poco de campo, pero no cambia: la aguja marca cero.', state: { m: 0.1, v: 0 } },
          { text: 'Acercas el imán. El campo dentro de la bobina <strong>aumenta</strong> mientras se acerca, y la aguja se desvía: hay una corriente inducida.', state: { m: 0.7, v: 1 } },
          { text: 'Detienes el imán muy cerca. Ahora el campo es grande pero ya no cambia: la aguja regresa a cero.', state: { m: 0.95, v: 0, cap: 'campo grande pero constante: no hay corriente' } },
          { text: 'Alejas el imán. El campo <strong>disminuye</strong> y la aguja se desvía hacia el lado contrario: la corriente va al revés. Si lo mueves más rápido, la desviación es mayor.', state: { m: 0.3, v: -1 } }
        ]
      },
      {
        type: 'concept', heading: 'El flujo magnético', short: 'Flujo',
        body: [
          'Para medir “cuánto campo atraviesa” una espira se usa el <strong>flujo magnético</strong>, igual que en la <a href="../sesion-10/">S10</a>. Para un campo uniforme y una espira plana de área $A$: $$\\Phi_B = BA\\cos\\theta$$ donde $\\theta$ es el ángulo entre $\\vec B$ y la <strong>normal</strong> a la espira (no el plano de la espira).',
          'Si $\\vec B$ atraviesa la espira de frente ($\\theta = 0$), el flujo es máximo, $BA$. Si $\\vec B$ va paralelo a la espira ($\\theta = 90^\\circ$), no la atraviesa y $\\Phi = 0$. Si el campo no es uniforme, $\\Phi_B = \\int \\vec B\\cdot d\\vec A$.',
          'La unidad es el <strong>weber</strong>: $1\\ \\text{Wb} = 1\\ \\text{T·m}^2$. Ojo con las áreas en cm²: $1\\ \\text{cm}^2 = 10^{-4}\\ \\text{m}^2$.'
        ],
        diagram: 'f3s11-flux', state: { th: 35 },
        caption: 'Solo la componente de $\\vec B$ a lo largo de la normal atraviesa la espira: $B\\cos\\theta$.'
      },
      {
        type: 'concept', heading: 'Ley de Faraday', short: 'Ley de Faraday',
        body: [
          'La fem inducida en una espira es igual a <strong>menos la rapidez de cambio</strong> del flujo que la atraviesa. Si la bobina tiene $N$ vueltas iguales, cada una aporta la misma fem y están en serie: $$\\varepsilon = -N\\,\\frac{d\\Phi_B}{dt}$$',
          'El signo menos dice hacia dónde va la corriente inducida: siempre se <strong>opone al cambio</strong> del flujo. Es la ley de Lenz, y le dedicamos la <a href="../sesion-12/">S12</a>. Hoy calculamos sobre todo el tamaño de la fem.',
          'Si el flujo cambia de manera uniforme (o solo te interesa el promedio), la derivada se vuelve un cociente: $$|\\varepsilon_{\\text{prom}}| = N\\,\\frac{|\\Delta\\Phi|}{\\Delta t}$$ Y si la bobina es parte de un circuito de resistencia $R$, circula $I = \\varepsilon/R$.',
          'Unidades: $\\text{Wb/s} = \\text{T·m}^2/\\text{s} = \\text{V}$. Una fem no es una fuerza: es trabajo por unidad de carga, igual que el voltaje de una pila.'
        ]
      },
      {
        type: 'concept', heading: 'Tres formas de cambiar el flujo', short: 'Tres formas',
        body: [
          'Como $\\Phi = BA\\cos\\theta$, hay tres maneras de inducir una fem: cambiar <strong>B</strong> (acercar un imán, o variar la corriente de un electroimán), cambiar el <strong>área</strong> (deformar la espira o mover un lado de un circuito, como la barra de abajo) o cambiar el <strong>ángulo</strong> (girar la espira, como en un generador, <a href="../sesion-12/">S12</a>).',
          'Si $B$ cambia con el tiempo de forma conocida, deriva: con $B = B_0 + kt$, $d\\Phi/dt = Ak\\cos\\theta$ y la fem es constante. Con $B = B_m\\sin(\\omega t)$, $d\\Phi/dt = AB_m\\omega\\cos(\\omega t)\\cos\\theta$: la fem es máxima donde el flujo cruza el cero, no donde es máximo.'
        ],
        diagram: 'f3s11-ways',
        caption: 'Cualquier cambio en $B$, en $A$ o en $\\theta$ cambia el flujo e induce una fem.'
      },
      {
        type: 'concept', heading: 'La fem es la pendiente del flujo', short: 'Pendiente',
        body: [
          'Grafica $\\Phi(t)$. La fem en cada instante es $-N$ veces la <strong>pendiente</strong> de esa gráfica. Donde el flujo está en un pico, la pendiente es cero y no hay fem, aunque el flujo sea enorme. Donde el flujo cruza el cero con la mayor inclinación, la fem es máxima.',
          'Esa es la idea más importante de la sesión: <strong>no importa cuánto flujo hay, sino qué tan rápido cambia</strong>.'
        ],
        diagram: 'f3s11-slope', state: { t: 0.5 },
        caption: 'Arriba, $\\Phi(t)$; abajo, $\\varepsilon(t) = -N\\,d\\Phi/dt$. En el instante marcado el flujo cruza el cero y la fem es máxima.'
      },
      {
        type: 'explainer', heading: 'Fem de movimiento: la barra sobre rieles', short: 'Barra sobre rieles',
        title: 'De $q\\vec v\\times\\vec B$ a $\\varepsilon = BLv$',
        intro: 'Una barra conductora de largo $L$ se desliza con rapidez $v$ sobre dos rieles unidos por un resistor $R$. Todo está en un campo uniforme $\\vec B$ que entra en la página. Vamos a sacar la fem de dos formas.',
        diagram: 'f3s11-rails',
        steps: [
          { text: 'El circuito es el rectángulo formado por el resistor, los rieles y la barra. Su área es $A = Lx$, donde $x$ es la distancia de la barra al resistor.', state: { x: 0.25, area: 1, cur: 0, F: 0 } },
          { text: 'La barra avanza: $x$ crece a razón $dx/dt = v$. El flujo $\\Phi = BLx$ crece, y por Faraday $$|\\varepsilon| = \\frac{d\\Phi}{dt} = BL\\,\\frac{dx}{dt} = BLv$$', state: { x: 0.65, area: 1, cur: 0, F: 0 } },
          { text: 'La misma respuesta desde la fuerza sobre las cargas: cada carga de la barra se mueve con $\\vec v$, y sufre $q\\vec v\\times\\vec B$, que apunta <strong>a lo largo</strong> de la barra. Esa fuerza empuja las cargas por toda la barra: hace un trabajo $qvB\\cdot L$, así que la fem es $\\varepsilon = W/q = BLv$. La barra se porta como una pila.', state: { x: 0.65, area: 0.3, cur: 1, F: 0 } },
          { text: 'Circula $I = \\varepsilon/R = BLv/R$, que sube por la barra. Ahora la barra lleva corriente en un campo: sufre $\\vec F = I\\vec L\\times\\vec B$, que apunta <strong>hacia atrás</strong>. Para mantener $v$ constante alguien tiene que empujar con $F = ILB = B^2L^2v/R$.', state: { x: 0.65, area: 0.3, cur: 1, F: 1 } }
        ]
      },
      {
        type: 'concept', heading: 'La energía no sale de la nada', short: 'Energía',
        body: [
          'Quien empuja la barra hace trabajo a razón $P_{\\text{mec}} = Fv = \\dfrac{B^2L^2v^2}{R}$. El resistor disipa $P = I^2R = \\left(\\dfrac{BLv}{R}\\right)^2R = \\dfrac{B^2L^2v^2}{R}$. Son <strong>iguales</strong>: toda la energía eléctrica sale del trabajo mecánico.',
          'Por eso la fuerza magnética sobre la barra frena: si empujara hacia adelante, la barra se aceleraría sola y generaría energía gratis. Ese “freno” es el que se siente al girar un generador conectado a una carga, y el principio del freno magnético de algunos trenes y montañas rusas.',
          'Si nadie empuja, la barra se va frenando: su energía cinética termina como calor en $R$.'
        ],
        diagram: 'f3s11-rails', state: { x: 0.55, area: 0.25, cur: 1, F: 1, cap: 'F·v = I²R: el trabajo de quien empuja termina como calor en R' },
        caption: 'La corriente inducida produce una fuerza que se opone al movimiento: hay que empujar para mantener la rapidez.'
      },
      {
        type: 'recipe', heading: 'Receta: problemas de ley de Faraday', short: 'Receta',
        steps: [
          { text: 'Identifica qué cambia: $B$, el área o el ángulo. Escribe el flujo por una vuelta, $\\Phi = BA\\cos\\theta$, con $\\theta$ entre $\\vec B$ y la normal.', tip: 'Si te dan el ángulo con el plano de la espira, $\\theta = 90^\\circ$ menos ese ángulo.' },
          { text: 'Pasa todo a SI: áreas en m² ($1\\ \\text{cm}^2 = 10^{-4}\\ \\text{m}^2$; con el radio en cm, pásalo a metros antes de elevarlo al cuadrado) y tiempos en segundos.', tip: 'Un área en cm² sin convertir da una fem $10^4$ veces mayor.' },
          { text: 'Fem promedio: $|\\varepsilon| = N\\,|\\Delta\\Phi|/\\Delta t$. Fem instantánea: deriva $\\Phi(t)$ y multiplica por $-N$.', tip: 'No olvides las $N$ vueltas: están en serie y sus fems se suman.' },
          { text: 'Barra que se mueve: $\\varepsilon = BLv$ (con $\\vec v$, $\\vec L$ y $\\vec B$ perpendiculares entre sí). Luego $I = \\varepsilon/R$, $F = ILB$ y $P = Fv = I^2R$.' },
          { text: 'Revisa unidades ($\\text{T·m}^2/\\text{s} = \\text{V}$) y el sentido con la ley de Lenz (<a href="../sesion-12/">S12</a>).' }
        ]
      },
      {
        type: 'example', heading: 'Fem promedio en una bobina',
        problem: '<p>Una bobina de $' + e1.N + '$ vueltas y $' + fx(e1.r, 1) + '\\ \\text{cm}$ de radio tiene su eje paralelo a un campo uniforme. El campo pasa de $' + fx(e1.B1) + '\\ \\text{T}$ a $' + fx(e1.B2) + '\\ \\text{T}$ en $' + fx(e1.dt) + '\\ \\text{s}$. ¿Cuánto vale la fem promedio inducida?</p>',
        steps: [
          { text: 'Área de una vuelta, con el radio en metros:', math: 'A = \\pi r^2 = \\pi(0.040\\ \\text{m})^2 = ' + fx(e1.A * 1e3, 3) + '\\times 10^{-3}\\ \\text{m}^2' },
          { text: 'El eje es paralelo a $\\vec B$, así que $\\theta = 0$ y el cambio de flujo por vuelta es:', math: '\\Delta\\Phi = (\\Delta B)A = (' + fx(e1.B2 - e1.B1) + ')(' + fx(e1.A * 1e3, 3) + '\\times 10^{-3}) = ' + fx(e1.dPhi * 1e4, 3) + '\\times 10^{-4}\\ \\text{Wb}' },
          { text: 'Ley de Faraday con las $N$ vueltas:', math: '|\\varepsilon| = N\\,\\frac{\\Delta\\Phi}{\\Delta t} = ' + e1.N + '\\cdot\\frac{' + fx(e1.dPhi * 1e4, 3) + '\\times 10^{-4}}{' + fx(e1.dt) + '} = ' + fx(e1.emf, 2) + '\\ \\text{V}' }
        ],
        answer: '$|\\varepsilon| \\approx ' + fx(e1.emf, 2) + '\\ \\text{V}$.',
        verify: { lab: 'call', mod: 'faraday', fn: 'avgEmf', args: [e1.N, e1.dPhi, e1.dt], value: e1.emf }
      },
      {
        type: 'example', heading: 'La barra sobre rieles',
        problem: '<p>Una barra de $' + e2.L + '\\ \\text{cm}$ se desliza a $' + fx(e2.v, 1) + '\\ \\text{m/s}$ sobre rieles unidos por un resistor de $' + fx(e2.R, 1) + '\\ \\Omega$, en un campo de $' + fx(e2.B) + '\\ \\text{T}$ perpendicular al plano de los rieles. Halla la fem, la corriente, la fuerza necesaria para mantener la rapidez y la potencia.</p>',
        diagram: 'f3s11-rails', state: { x: 0.55, area: 0.3, cur: 1, F: 1 },
        steps: [
          { text: 'Fem de movimiento, con $L$ en metros:', math: '\\varepsilon = BLv = (' + fx(e2.B) + ')(0.25)(' + fx(e2.v, 1) + ') = ' + fx(e2.emf, 2) + '\\ \\text{V}' },
          { text: 'Corriente en el circuito:', math: 'I = \\frac{\\varepsilon}{R} = \\frac{' + fx(e2.emf, 2) + '}{' + fx(e2.R, 1) + '} = ' + fx(e2.I, 2) + '\\ \\text{A}' },
          { text: 'Fuerza magnética sobre la barra (frena); quien empuja debe igualarla:', math: 'F = ILB = (' + fx(e2.I, 2) + ')(0.25)(' + fx(e2.B) + ') = ' + fx(e2.F, 3) + '\\ \\text{N}' },
          { text: 'Potencia mecánica y eléctrica, iguales:', math: 'P = Fv = ' + fx(e2.P, 3) + '\\ \\text{W} \\qquad I^2R = (' + fx(e2.I, 2) + ')^2(' + fx(e2.R, 1) + ') = ' + fx(e2.I * e2.I * e2.R, 3) + '\\ \\text{W}' }
        ],
        answer: '$\\varepsilon = ' + fx(e2.emf, 2) + '\\ \\text{V}$, $I = ' + fx(e2.I, 2) + '\\ \\text{A}$, $F = ' + fx(e2.F, 3) + '\\ \\text{N}$ y $P = ' + fx(e2.P, 3) + '\\ \\text{W}$.',
        verify: { lab: 'call', mod: 'faraday', fn: 'rail', args: [e2.B, e2.L, e2.v, e2.R], values: { emf: e2.emf, I: e2.I, F: e2.F, Pm: e2.P, Pe: e2.P } }
      },
      {
        type: 'example', heading: 'Bobina inclinada en un campo que crece',
        problem: '<p>Una bobina de $' + e3.N + '$ vueltas y $' + fx(e3.r, 1) + '\\ \\text{cm}$ de radio tiene su normal a $' + e3.th + '^\\circ$ de un campo uniforme que crece a razón de $' + fx(e3.k) + '\\ \\text{T/s}$. ¿Cuánto vale la fem inducida?</p>',
        steps: [
          { text: 'Solo cuenta la componente de $\\vec B$ a lo largo de la normal: $\\Phi = BA\\cos\\theta$, con $A$ y $\\theta$ fijos.', math: '\\frac{d\\Phi}{dt} = A\\cos\\theta\\,\\frac{dB}{dt}' },
          { text: 'Área en m²:', math: 'A = \\pi(0.050)^2 = ' + fx(e3.A * 1e3, 3) + '\\times 10^{-3}\\ \\text{m}^2' },
          { text: 'Fem con las $N$ vueltas (en tamaño):', math: '|\\varepsilon| = NA\\cos\\theta\\,\\frac{dB}{dt} = ' + e3.N + '(' + fx(e3.A * 1e3, 3) + '\\times 10^{-3})(\\cos ' + e3.th + '^\\circ)(' + fx(e3.k) + ') = ' + fx(e3.emf, 3) + '\\ \\text{V}' },
          { text: 'Como $B$ crece a ritmo constante, la fem es la misma en todo instante.' }
        ],
        answer: '$|\\varepsilon| \\approx ' + fx(e3.emf, 3) + '\\ \\text{V}$, constante.',
        verify: { lab: 'call', mod: 'faraday', fn: 'coil', args: ['ramp', { N: e3.N, r: e3.r, th: e3.th, B0: e3.B0, k: e3.k }, e3.t], values: { emfMag: e3.emf, A: e3.A } }
      },
      {
        type: 'example', heading: 'La bobina exploradora: medir B con una carga',
        problem: '<p>Para medir un campo, una bobina de $' + e4.N + '$ vueltas y $' + fx(e4.Acm, 1) + '\\ \\text{cm}^2$, con su normal paralela a $\\vec B$, se voltea $180^\\circ$ rápidamente. Está conectada a un instrumento que mide la carga total que pasa; la resistencia del circuito es $' + e4.R + '\\ \\Omega$. Si $B = ' + fx(e4.B) + '\\ \\text{T}$, ¿cuánta carga pasa?</p>',
        steps: [
          { text: 'Al voltearla, el flujo por vuelta pasa de $+BA$ a $-BA$: cambia $2BA$.', math: '|\\Delta\\Phi| = 2BA = 2(' + fx(e4.B) + ')(' + fx(e4.Acm, 1) + '\\times 10^{-4}) = ' + fx(e4.dPhi * 1e4, 3) + '\\times 10^{-4}\\ \\text{Wb}' },
          { text: 'La corriente es $I = \\varepsilon/R$ y la carga es $Q = \\int I\\,dt = \\dfrac{N}{R}\\int \\left|\\dfrac{d\\Phi}{dt}\\right| dt$. El tiempo se cancela:', math: 'Q = \\frac{N\\,|\\Delta\\Phi|}{R} = \\frac{' + e4.N + '(' + fx(e4.dPhi * 1e4, 3) + '\\times 10^{-4})}{' + e4.R + '} = ' + fx(e4.Q * 1e4, 3) + '\\times 10^{-4}\\ \\text{C}' },
          { text: 'No importa qué tan rápido la voltees: la carga solo depende del cambio de flujo. Por eso se usa para medir $B$.' }
        ],
        answer: '$Q = ' + fx(e4.Q * 1e4, 3) + '\\times 10^{-4}\\ \\text{C}$.',
        verify: { lab: 'call', mod: 'faraday', fn: 'chargeThrough', args: [e4.N, e4.dPhi, e4.R], value: e4.Q }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: 'Si el campo es muy grande, ¿la fem es grande?', a: 'No necesariamente. Un imán enorme quieto junto a una bobina quieta no induce nada. La fem depende de qué tan <strong>rápido cambia</strong> el flujo.' },
          { q: '¿El ángulo θ es con la espira o con la normal?', a: 'Con la normal (la perpendicular al plano de la espira). Si $\\vec B$ es perpendicular al plano, $\\theta = 0$ y el flujo es máximo.' },
          { q: '¿Por qué se multiplica por N?', a: 'Cada vuelta es una espira con su propia fem, y todas están conectadas en serie, así que se suman. $N\\Phi$ se llama a veces “enlace de flujo”.' },
          { q: '¿Hay fem si el circuito está abierto?', a: 'Sí. La fem aparece aunque no circule corriente; entre los extremos abiertos de la bobina (o de la barra) se mide un voltaje. La corriente solo circula si el circuito está cerrado.' },
          { q: '¿De dónde sale la energía en la barra sobre rieles?', a: 'Del trabajo de quien la empuja. La corriente inducida produce una fuerza magnética que frena la barra, y la potencia mecánica $Fv$ es exactamente la que se disipa en el resistor, $I^2R$.' },
          { q: '¿El campo magnético hace trabajo sobre las cargas?', a: 'La fuerza magnética sobre una carga nunca hace trabajo. En la barra, la componente de $q\\vec v\\times\\vec B$ a lo largo de la barra empuja las cargas, pero la otra componente frena la barra; el trabajo neto lo pone quien empuja.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Flujo: $\\Phi = BA\\cos\\theta$ (Wb), con $\\theta$ entre $\\vec B$ y la normal. Cambia si cambia $B$, $A$ o $\\theta$.',
          'Ley de Faraday: $\\varepsilon = -N\\,d\\Phi/dt$; promedio $|\\varepsilon| = N\\,|\\Delta\\Phi|/\\Delta t$. Importa la rapidez del cambio, no el tamaño del flujo.',
          'Fem de movimiento: $\\varepsilon = BLv$; en los rieles, $I = BLv/R$ y la barra sufre una fuerza que frena, $F = B^2L^2v/R$.',
          'La potencia mecánica $Fv$ es igual a la eléctrica $I^2R$: la inducción convierte trabajo en energía eléctrica.'
        ]
      }
    ],

    lab: {
      type: 'faraday-emf', title: 'Fem inducida: rieles y bobina',
      intro: 'En el modo de rieles, mueve $B$, $L$, $v$ y $R$ y anima la barra: el lab muestra el área que crece, la corriente inducida, la fuerza que frena y las dos potencias, que siempre son iguales. En el modo de bobina, el campo crece en rampa o cambia como una senoide; las gráficas de $\\Phi(t)$ y $\\varepsilon(t)$ te muestran que la fem es menos la pendiente del flujo. En el reto calculas $\\varepsilon$, $I$ o $F$, o $|\\varepsilon|$ en un instante, y el lab te avisa si usaste centímetros, si olvidaste $N$ o el ángulo, o si derivaste mal la senoide.',
      cfg: { start: { mode: 'rail' } }
    },

    formulas: [
      { label: 'Flujo magnético', tex: '\\Phi_B = BA\\cos\\theta = \\int \\vec B\\cdot d\\vec A' },
      { label: 'Ley de Faraday', tex: '\\varepsilon = -N\\,\\frac{d\\Phi_B}{dt}' },
      { label: 'Fem promedio', tex: '|\\varepsilon| = N\\,\\frac{|\\Delta\\Phi_B|}{\\Delta t}' },
      { label: 'Fem de movimiento', tex: '\\varepsilon = BLv' },
      { label: 'Barra sobre rieles', tex: 'I = \\frac{BLv}{R},\\quad F = \\frac{B^2L^2v}{R},\\quad P = Fv = I^2R' },
      { label: 'Carga que pasa', tex: 'Q = \\frac{N\\,|\\Delta\\Phi_B|}{R}' }
    ],

    exercises: [
      {
        id: 'f3-s11-flujo', title: 'Flujo por una espira inclinada',
        vars: { B: [0.1, 1, 0.1], A: [10, 200, 10], th: [10, 80, 10] },
        prompt: function (v) { return '<p>Una espira de $' + v.A + '\\ \\text{cm}^2$ está en un campo uniforme de $' + fx(v.B, 1) + '\\ \\text{T}$. La normal a la espira forma $' + v.th + '^\\circ$ con $\\vec B$. ¿Cuánto vale el flujo, en mWb?</p>'; },
        check: 'numeric', unit: 'mWb',
        answer: function (v) { return v.B * v.A * 1e-4 * Math.cos(v.th * RAD) * 1000; },
        mistakes: {
          sine: function (v) { return v.B * v.A * 1e-4 * Math.sin(v.th * RAD) * 1000; },
          cm2: function (v) { return v.B * v.A * Math.cos(v.th * RAD) * 1000; },
          noCos: function (v) { return v.B * v.A * 1e-4 * 1000; }
        },
        feedback: [
          { when: 'sine', say: 'Usaste el seno. El ángulo es entre $\\vec B$ y la normal: $\\Phi = BA\\cos\\theta$.' },
          { when: 'cm2', say: 'El área va en m²: $1\\ \\text{cm}^2 = 10^{-4}\\ \\text{m}^2$.' },
          { when: 'noCos', say: 'Ese sería el flujo con $\\vec B$ perpendicular a la espira. Aquí está inclinada: multiplica por $\\cos\\theta$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return FD().flux(v.B, v.A * 1e-4, v.th) * 1000; } },
        hint: '$\\Phi = BA\\cos\\theta$ con $A$ en m²; $1\\ \\text{Wb} = 1000\\ \\text{mWb}$.',
        solution: function (v) { var p = v.B * v.A * 1e-4 * Math.cos(v.th * RAD); return '$$\\Phi = BA\\cos\\theta = (' + fx(v.B, 1) + ')(' + v.A + '\\times 10^{-4})\\cos ' + v.th + '^\\circ = ' + fx(p * 1000, 4) + '\\ \\text{mWb}$$'; }
      },
      {
        id: 'f3-s11-promedio', title: 'Fem promedio en una bobina',
        vars: { N: [20, 300, 20], r: [1, 6, 0.5], dB: [0.1, 1, 0.1], dt: [20, 400, 20] },
        prompt: function (v) { return '<p>Una bobina de $' + v.N + '$ vueltas y $' + fx(v.r, 1) + '\\ \\text{cm}$ de radio tiene su eje paralelo a un campo que cambia $' + fx(v.dB, 1) + '\\ \\text{T}$ en $' + v.dt + '\\ \\text{ms}$. ¿Cuánto vale la fem promedio, en volts?</p>'; },
        check: 'numeric', unit: 'V',
        answer: function (v) { return v.N * v.dB * area(v.r) / (v.dt / 1000); },
        mistakes: {
          noN: function (v) { return v.dB * area(v.r) / (v.dt / 1000); },
          cm2: function (v) { return v.N * v.dB * Math.PI * v.r * v.r / (v.dt / 1000); },
          ms: function (v) { return v.N * v.dB * area(v.r) / v.dt; }
        },
        feedback: [
          { when: 'noN', say: 'Te faltaron las $N$ vueltas: $\\varepsilon = N\\,\\Delta\\Phi/\\Delta t$.' },
          { when: 'cm2', say: 'El radio va en metros antes de elevarlo al cuadrado (1 cm = 0.01 m); si no, el área sale 10 000 veces mayor.' },
          { when: 'ms', say: 'El tiempo va en segundos: $1\\ \\text{ms} = 10^{-3}\\ \\text{s}$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return FD().avgEmf(v.N, FD().flux(v.dB, area(v.r), 0), v.dt / 1000); } },
        hint: '$A = \\pi r^2$ con $r$ en m; $|\\varepsilon| = NA\\,\\Delta B/\\Delta t$ con $\\Delta t$ en s.',
        solution: function (v) { var A = area(v.r); return '$A = \\pi(' + fx(v.r / 100, 3) + ')^2 = ' + fx(A * 1e4, 3) + '\\times 10^{-4}\\ \\text{m}^2$. $$|\\varepsilon| = N\\,\\frac{A\\,\\Delta B}{\\Delta t} = ' + v.N + '\\cdot\\frac{(' + fx(A * 1e4, 3) + '\\times 10^{-4})(' + fx(v.dB, 1) + ')}{' + fx(v.dt / 1000, 3) + '} = ' + fx(v.N * v.dB * A / (v.dt / 1000), 3) + '\\ \\text{V}$$'; }
      },
      {
        id: 'f3-s11-barra-fem', title: 'Fem de una barra en movimiento',
        vars: { B: [0.1, 1.5, 0.1], L: [10, 80, 5], v: [0.5, 8, 0.5] },
        prompt: function (v) { return '<p>Una barra de $' + v.L + '\\ \\text{cm}$ se mueve a $' + fx(v.v, 1) + '\\ \\text{m/s}$, perpendicular a sí misma y a un campo de $' + fx(v.B, 1) + '\\ \\text{T}$. ¿Qué fem aparece entre sus extremos, en volts?</p>'; },
        check: 'numeric', unit: 'V',
        answer: function (v) { return v.B * v.L / 100 * v.v; },
        mistakes: {
          cmL: function (v) { return v.B * v.L * v.v; },
          over: function (v) { return v.B * v.v / (v.L / 100); }
        },
        feedback: [
          { when: 'cmL', say: 'El largo va en metros: divide los centímetros entre 100.' },
          { when: 'over', say: 'Dividiste entre $L$. La fem es el producto $BLv$.' }
        ],
        oracle: { lab: 'call', mod: 'faraday', fn: 'rail', field: 'emf', args: function (v) { return [v.B, v.L, v.v, 1]; } },
        hint: '$\\varepsilon = BLv$, con $L$ en metros.',
        solution: function (v) { return '$$\\varepsilon = BLv = (' + fx(v.B, 1) + ')(' + fx(v.L / 100, 2) + ')(' + fx(v.v, 1) + ') = ' + fx(v.B * v.L / 100 * v.v, 3) + '\\ \\text{V}$$'; }
      },
      {
        id: 'f3-s11-barra-corriente', title: 'Corriente en los rieles',
        vars: { B: [0.2, 1.2, 0.1], L: [10, 60, 5], v: [1, 6, 0.5], R: [0.5, 8, 0.5] },
        prompt: function (v) { return '<p>Una barra de $' + v.L + '\\ \\text{cm}$ se desliza a $' + fx(v.v, 1) + '\\ \\text{m/s}$ sobre rieles unidos por $' + fx(v.R, 1) + '\\ \\Omega$, en un campo de $' + fx(v.B, 1) + '\\ \\text{T}$ perpendicular a los rieles. ¿Cuánta corriente circula, en amperes?</p>'; },
        diagram: { id: 'f3s11-rails', state: function () { return { x: 0.5, area: 0.3, cur: 1, F: 0 }; } },
        check: 'numeric', unit: 'A',
        answer: function (v) { return v.B * v.L / 100 * v.v / v.R; },
        mistakes: {
          noR: function (v) { return v.B * v.L / 100 * v.v; },
          cmL: function (v) { return v.B * v.L * v.v / v.R; },
          timesR: function (v) { return v.B * v.L / 100 * v.v * v.R; }
        },
        feedback: [
          { when: 'noR', say: 'Esa es la fem. La corriente es $I = \\varepsilon/R$.' },
          { when: 'cmL', say: 'El largo va en metros, no en centímetros.' },
          { when: 'timesR', say: 'Multiplicaste por $R$; la corriente es $\\varepsilon/R$.' }
        ],
        oracle: { lab: 'call', mod: 'faraday', fn: 'rail', field: 'I', args: function (v) { return [v.B, v.L, v.v, v.R]; } },
        hint: 'Primero $\\varepsilon = BLv$ y luego $I = \\varepsilon/R$.',
        solution: function (v) { var e = v.B * v.L / 100 * v.v; return '$\\varepsilon = (' + fx(v.B, 1) + ')(' + fx(v.L / 100, 2) + ')(' + fx(v.v, 1) + ') = ' + fx(e, 3) + '\\ \\text{V}$. $$I = \\frac{\\varepsilon}{R} = \\frac{' + fx(e, 3) + '}{' + fx(v.R, 1) + '} = ' + fx(e / v.R, 3) + '\\ \\text{A}$$'; }
      },
      {
        id: 'f3-s11-fuerza', title: 'Fuerza para mantener la rapidez',
        vars: { B: [0.2, 1.2, 0.1], L: [10, 60, 5], v: [1, 6, 0.5], R: [0.5, 8, 0.5] },
        prompt: function (v) { return '<p>En unos rieles con $R = ' + fx(v.R, 1) + '\\ \\Omega$, una barra de $' + v.L + '\\ \\text{cm}$ se mueve a $' + fx(v.v, 1) + '\\ \\text{m/s}$ en un campo de $' + fx(v.B, 1) + '\\ \\text{T}$. Sin fricción, ¿con qué fuerza hay que empujarla para que su rapidez no cambie, en newtons?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { var L = v.L / 100; return v.B * v.B * L * L * v.v / v.R; },
        mistakes: {
          isI: function (v) { return v.B * v.L / 100 * v.v / v.R; },
          noR: function (v) { var L = v.L / 100; return v.B * v.B * L * L * v.v; },
          zero: function (v) { return 0; }
        },
        feedback: [
          { when: 'isI', say: 'Esa es la corriente. La fuerza es $F = ILB = B^2L^2v/R$.' },
          { when: 'noR', say: 'Usaste la fem como si fuera la corriente. Divide entre $R$: $I = BLv/R$.' },
          { when: 'zero', say: 'Sin fricción sí hace falta empujar: la corriente inducida produce una fuerza magnética que frena la barra.' }
        ],
        where: function (v) { return v.B * v.B * Math.pow(v.L / 100, 2) * v.v / v.R >= 0.01; },
        oracle: { lab: 'call', mod: 'faraday', fn: 'rail', field: 'F', args: function (v) { return [v.B, v.L, v.v, v.R]; } },
        hint: '$I = BLv/R$ y la fuerza magnética sobre la barra es $F = ILB$.',
        solution: function (v) { var L = v.L / 100, I = v.B * L * v.v / v.R; return '$I = BLv/R = ' + fx(I, 4) + '\\ \\text{A}$. $$F = ILB = (' + fx(I, 4) + ')(' + fx(L, 2) + ')(' + fx(v.B, 1) + ') = ' + fx(I * L * v.B, 4) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f3-s11-potencia', title: 'Potencia que se disipa',
        vars: { B: [0.2, 1.2, 0.1], L: [10, 60, 5], v: [1, 6, 0.5], R: [0.5, 8, 0.5] },
        prompt: function (v) { return '<p>Una barra de $' + v.L + '\\ \\text{cm}$ se mueve a $' + fx(v.v, 1) + '\\ \\text{m/s}$ sobre rieles con $R = ' + fx(v.R, 1) + '\\ \\Omega$ en un campo de $' + fx(v.B, 1) + '\\ \\text{T}$. ¿Cuánta potencia se disipa en el resistor, en watts?</p>'; },
        check: 'numeric', unit: 'W',
        answer: function (v) { var e = v.B * v.L / 100 * v.v; return e * e / v.R; },
        mistakes: {
          eI: function (v) { var e = v.B * v.L / 100 * v.v; return e / v.R; },
          eR: function (v) { var e = v.B * v.L / 100 * v.v; return e * v.R; }
        },
        feedback: [
          { when: 'eI', say: 'Esa es la corriente. La potencia es $P = I^2R = \\varepsilon^2/R$.' },
          { when: 'eR', say: 'Multiplicaste la fem por $R$. Es $P = \\varepsilon^2/R$.' }
        ],
        where: function (v) { var e = v.B * v.L / 100 * v.v; return e * e / v.R >= 0.01; },
        oracle: { lab: 'call', mod: 'faraday', fn: 'rail', field: 'Pm', args: function (v) { return [v.B, v.L, v.v, v.R]; } },
        hint: '$P = \\varepsilon^2/R$ con $\\varepsilon = BLv$; también es igual a $Fv$.',
        solution: function (v) { var e = v.B * v.L / 100 * v.v; return '$\\varepsilon = BLv = ' + fx(e, 4) + '\\ \\text{V}$. $$P = \\frac{\\varepsilon^2}{R} = \\frac{(' + fx(e, 4) + ')^2}{' + fx(v.R, 1) + '} = ' + fx(e * e / v.R, 4) + '\\ \\text{W}$$ Es la misma potencia que pone quien empuja, $Fv$.'; }
      },
      {
        id: 'f3-s11-cuando', title: 'Concepto: ¿hay fem inducida?',
        vars: { k: [0, 3, 1] },
        prompt: function (v) {
          var s = ['un imán está quieto dentro de una bobina quieta', 'acercas un imán a una bobina', 'una espira gira dentro de un campo uniforme', 'una espira se mueve sin girar dentro de un campo uniforme, sin salir de él'][v.k];
          return '<p>En esta situación: ' + s + '. ¿Se induce una fem en la bobina (o espira)?</p>';
        },
        check: 'choice',
        options: function (v) {
          var yes = v.k === 1 || v.k === 2;
          var A = 'Sí, porque el flujo que la atraviesa cambia', Bn = 'No, porque el flujo que la atraviesa no cambia', C = 'Sí, porque hay un campo magnético presente';
          return [
            yes ? { text: A, correct: true } : { text: A, say: 'Aquí el flujo es constante: ni $B$, ni el área, ni el ángulo cambian.' },
            yes ? { text: Bn, say: 'El flujo sí cambia: ' + (v.k === 1 ? 'al acercar el imán, $B$ crece en la bobina.' : 'al girar, cambia el ángulo $\\theta$.') } : { text: Bn, correct: true },
            { text: C, say: 'Un campo constante no induce nada. Lo que cuenta es que el flujo cambie.' }
          ];
        },
        answer: function (v) { return v.k === 1 || v.k === 2 ? 'Sí, porque el flujo que la atraviesa cambia' : 'No, porque el flujo que la atraviesa no cambia'; },
        hint: 'Pregúntate si cambia $B$, el área o el ángulo.',
        solution: function (v) { return v.k === 1 || v.k === 2 ? 'Sí: el flujo cambia, así que $\\varepsilon = -N\\,d\\Phi/dt \\neq 0$.' : 'No: el flujo es constante y $d\\Phi/dt = 0$.'; }
      },
      {
        id: 'f3-s11-rapidez', title: 'Concepto: más rápido',
        vars: { n: [2, 4, 1] },
        prompt: function (v) { return '<p>Acercas un imán a una bobina siempre desde el mismo punto hasta el mismo punto, pero ahora ' + v.n + ' veces más rápido. ¿Qué pasa con la fem inducida promedio?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: 'Se hace ' + v.n + ' veces mayor', correct: true },
            { text: 'No cambia, porque el cambio de flujo es el mismo', say: 'El cambio de flujo es el mismo, pero ocurre en menos tiempo: $\\Delta\\Phi/\\Delta t$ crece.' },
            { text: 'Se hace ' + v.n + ' veces menor', say: 'Si el cambio es más rápido, $\\Delta t$ es menor y la fem es mayor.' }
          ];
        },
        answer: function (v) { return 'Se hace ' + v.n + ' veces mayor'; },
        hint: '$|\\varepsilon_{\\text{prom}}| = N\\,|\\Delta\\Phi|/\\Delta t$.',
        solution: function (v) { return 'El mismo $\\Delta\\Phi$ en un tiempo ' + v.n + ' veces menor: la fem promedio es <strong>' + v.n + ' veces mayor</strong>.'; }
      }
    ],

    quiz: { tags: ['f3.S11'], count: 8 },

    errors: [
      'Creer que un campo grande induce fem aunque no cambie: lo que cuenta es $d\\Phi/dt$.',
      'Medir $\\theta$ desde el plano de la espira en lugar de desde la normal.',
      'Dejar el área en cm² o el radio en cm: $1\\ \\text{cm}^2 = 10^{-4}\\ \\text{m}^2$.',
      'Olvidar las $N$ vueltas de la bobina.',
      'Confundir la fem con la corriente: $I = \\varepsilon/R$.',
      'Pensar que no hace falta empujar la barra sin fricción: la fuerza magnética sobre la corriente inducida la frena.',
      'Poner la fem máxima donde el flujo es máximo: es donde el flujo cambia más rápido.'
    ],

    teacher: {
      plan: [
        'Arranca con el experimento de Faraday (en vivo o con el explainer): imán quieto, acercándose, quieto cerca, alejándose. Que formulen la regla antes de verla escrita.',
        'Flujo con $\\cos\\theta$ y las tres formas de cambiarlo. Ejemplos 1 y 3: fem promedio e instantánea, cuidando unidades.',
        'Barra sobre rieles con el explainer: las dos deducciones de $BLv$ (flujo y fuerza sobre las cargas). Luego corriente, fuerza y potencia (ejemplo 2) y el balance de energía.',
        'Cierra con el lab: modo de rieles para el balance de potencias; modo de bobina con la senoide para que vean que la fem es la pendiente del flujo.'
      ],
      check: [
        'Que digan qué cambia en cada situación (B, A o θ) y si hay fem.',
        'Que calculen $\\varepsilon$, $I$ y $F$ de la barra con las unidades correctas.',
        'Que expliquen de dónde sale la energía que se disipa en el resistor.'
      ],
      note: 'El signo de la ley de Faraday y el sentido de la corriente se dejan para la S12 (Lenz). Aquí basta con el tamaño de la fem; en el lab y los ejercicios se pide $|\\varepsilon|$.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §13.1 “Faraday’s Law”. <a href="https://openstax.org/books/university-physics-volume-2/pages/13-1-faradays-law">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §13.3 “Motional Emf”. <a href="https://openstax.org/books/university-physics-volume-2/pages/13-3-motional-emf">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-10',
    next: 'sesion-12'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
