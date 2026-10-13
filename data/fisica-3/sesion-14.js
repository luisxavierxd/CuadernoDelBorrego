/* =====================================================================
   Física 3 · S14 · Circuito RL: crecimiento y decaimiento de la corriente
   (bloque C · Inducción).
   Fuente: OpenStax, University Physics Volume 2, §14.4 (CC BY-NC-SA 4.0).
   Unidades de trabajo: R en Ω, L en mH, ε en V → τ y t en ms, I en A,
   energía en mJ (mH/Ω = ms; mH·A² = mJ).
   Las cuentas se hacen aquí con las fórmulas cerradas; scripts/examples.test.js las
   compara contra LabMath.rl (lab rl-circuit) y los oráculos de los ejercicios usan el
   integrador RK4 de la EDO (LabMath.rl.rk4), que no usa la solución analítica.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function nice(x) { return Number(x.toPrecision(2)); }
  function RL() { return window.LabMath.rl; }
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (m) { return ex.mistakes[m](v); }));
      if (!(Math.abs(vals[0]) >= 0.01)) return false;
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
  // Instante de los ejercicios: m·τ redondeado a 2 cifras (en ms).
  function tOf(v) { return nice(v.m * v.L / v.R); }
  // Oráculo del tiempo: bisección sobre el RK4 (no usa logaritmos).
  function rkTime(mode, L, R, e, I) {
    var lo = 0, hi = 12 * L / R, up = mode !== 'd';
    for (var k = 0; k < 50; k++) {
      var mid = (lo + hi) / 2, i = RL().rk4(mode, L, R, e, mid, 1000).I;
      if ((i < I) === up) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  function circ(sw, x, extra) { var s = { sw: sw, x: x }; Object.keys(extra || {}).forEach(function (k) { s[k] = extra[k]; }); return s; }

  // Ejemplo 1: crecimiento. 50 Ω, 200 mH, 12 V; en t = 6.0 ms.
  var e1 = { R: 50, L: 200, e: 12, t: 6 };
  e1.tau = e1.L / e1.R; e1.If = e1.e / e1.R; e1.x = Math.exp(-e1.t / e1.tau); e1.I = e1.If * (1 - e1.x); e1.VR = e1.I * e1.R; e1.VL = e1.e * e1.x;
  // Ejemplo 2: decaimiento. 500 mH y 20 Ω, con 0.60 A al quitar la batería de 12 V; en t = 40 ms.
  var e2 = { R: 20, L: 500, e: 12, t: 40 };
  e2.tau = e2.L / e2.R; e2.I0 = e2.e / e2.R; e2.x = Math.exp(-e2.t / e2.tau); e2.I = e2.I0 * e2.x; e2.VL = e2.I * e2.R;
  // Ejemplo 3: 100 Ω, 800 mH, 24 V: tiempo para llegar al 90 % de la corriente final.
  var e3 = { R: 100, L: 800, e: 24, p: 0.9 };
  e3.tau = e3.L / e3.R; e3.If = e3.e / e3.R; e3.I = e3.p * e3.If; e3.t = -e3.tau * Math.log(1 - e3.p);
  // Ejemplo 4: 50 Ω, 200 mH, 12 V: rapidez inicial y energía final.
  var e4 = { R: 50, L: 200, e: 12 };
  e4.rate = e4.e / (e4.L / 1000); e4.If = e4.e / e4.R; e4.U = 0.5 * e4.L * e4.If * e4.If;

  var data = window.SESSION_DATA = {
    slug: 'sesion-14', number: '14', group: 'C · Inducción',
    title: 'Circuito RL: crecimiento y decaimiento de la corriente', temario: [],
    minutes: 120,
    quote: 'Un inductor no deja que la corriente salte: la hace subir y bajar con una exponencial cuyo reloj es τ = L/R.',
    badges: [
      'Explicar qué pasa al cerrar el interruptor: al principio el inductor es un circuito abierto; al final, un alambre.',
      'Plantear $L\\,\\dfrac{dI}{dt} + IR = \\varepsilon$ con Kirchhoff y reconocer su solución.',
      'Usar $\\tau = L/R$ para calcular la corriente y los voltajes en cualquier instante, y el tiempo para llegar a una corriente.',
      'Comparar el circuito RL con el RC de Física 2.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Un inductor se opone a que su corriente cambie (<a href="../sesion-13/">S13</a>). En un circuito con una batería, un resistor y un inductor, la corriente <strong>no salta</strong> a su valor final: sube poco a poco con una exponencial cuyo reloj es $\\tau = L/R$.',
        recall: [
          'Fem autoinducida y polaridad: $\\Delta V = -L\\,dI/dt$ al cruzar el inductor a favor de la corriente (<a href="../sesion-13/">S13</a>).',
          'Regla de mallas (<a href="../../../fisica-2/sesiones/sesion-13/">Física 2 · S13</a>).',
          'El circuito RC: misma ecuación, misma exponencial, $\\tau = RC$ (<a href="../../../fisica-2/sesiones/sesion-15/">Física 2 · S15</a>).',
          'Logaritmo natural: $e^{-x} = a \\Leftrightarrow x = -\\ln a$.'
        ],
        why: 'Los circuitos RL están en los relés y solenoides de los coches, en las fuentes de poder (los inductores suavizan la corriente), en las bobinas de encendido y en los motores. También explican por qué un motor tarda en tomar corriente y por qué hay que protegerlo al apagarlo.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Empuja un carrito pesado con una fuerza constante en un piso con fricción que crece con la rapidez. Al principio el carrito apenas se mueve: su inercia se opone. Poco a poco acelera, la fricción crece y al final llega a una rapidez constante en la que la fricción iguala tu fuerza.',
          'Así sube la corriente en un circuito RL: la batería es tu fuerza, el inductor es la inercia (masa) y el resistor es la fricción. La corriente final es $\\varepsilon/R$, pero llegar ahí toma tiempo, más si el inductor es grande y menos si la resistencia es grande.'
        ]
      },
      {
        type: 'explainer', heading: 'Al cerrar el interruptor', short: 'Al cerrar',
        title: 'De circuito abierto a alambre',
        intro: 'Un circuito con una batería, un resistor, un inductor y un interruptor de dos posiciones. En <strong>a</strong> la batería empuja corriente; en <strong>b</strong> la batería queda fuera y la corriente sigue por $R$ y $L$.',
        diagram: 'f3s14-circuit',
        steps: [
          { text: 'Interruptor abierto: no hay corriente.', state: circ('open', 0) },
          { text: 'Pasas el interruptor a <strong>a</strong> ($t = 0$). La corriente no puede saltar: en ese instante sigue siendo cero, así que el resistor no tiene voltaje y <strong>todo $\\varepsilon$ cae en el inductor</strong>. El inductor se porta como un circuito abierto, y la corriente empieza a subir con $dI/dt = \\varepsilon/L$.', state: circ('a', 0) },
          { text: 'La corriente crece y el resistor toma más voltaje ($V_R = IR$). Al inductor le queda menos ($V_L = \\varepsilon - IR$), así que la corriente sube cada vez más despacio. En $t = \\tau$ ya va en 63 % de su valor final.', state: circ('a', 1) },
          { text: 'Mucho tiempo después, $I = \\varepsilon/R$ y ya no cambia: el inductor tiene voltaje cero y se porta como un <strong>alambre</strong>.', state: circ('a', 6) }
        ]
      },
      {
        type: 'concept', heading: 'La ecuación del circuito', short: 'La ecuación',
        body: [
          'Recorre la malla a favor de la corriente: subes $\\varepsilon$ en la batería, bajas $IR$ en el resistor y bajas $L\\,dI/dt$ en el inductor (<a href="../sesion-13/">S13</a>): $$\\varepsilon - IR - L\\,\\frac{dI}{dt} = 0 \\quad\\Rightarrow\\quad L\\,\\frac{dI}{dt} + IR = \\varepsilon$$',
          'Es la misma ecuación del circuito RC con otras letras ($R\\,dq/dt + q/C = \\varepsilon$). Separando variables, igual que en <a href="../../../fisica-2/sesiones/sesion-15/">Física 2 · S15</a>, con $I(0) = 0$: $$I(t) = \\frac{\\varepsilon}{R}\\left(1 - e^{-t/\\tau}\\right), \\qquad \\tau = \\frac{L}{R}$$',
          'Compruébalo derivando: $dI/dt = (\\varepsilon/L)\\,e^{-t/\\tau}$, y al sustituir, la malla se cumple en todo instante.'
        ],
        diagram: 'f3s14-circuit', state: circ('a', 0.7, { loop: 1, cap: 'ε − IR − L dI/dt = 0' }),
        caption: 'Recorriendo la malla a favor de la corriente: $+\\varepsilon$, $-IR$ y $-L\\,dI/dt$.'
      },
      {
        type: 'concept', heading: 'La constante de tiempo τ = L/R', short: 'Constante de tiempo',
        body: [
          'La constante de tiempo es $\\tau = L/R$. Sus unidades: $\\text{H}/\\Omega = (\\text{V·s/A})/(\\text{V/A}) = \\text{s}$. Con prefijos, $\\text{mH}/\\Omega = \\text{ms}$.',
          'Ojo, que es al revés que en el RC en un sentido importante: <strong>más resistencia hace el circuito más rápido</strong>. Con más $R$ la corriente final $\\varepsilon/R$ es menor y se alcanza antes. Más $L$, en cambio, lo hace más lento (más “inercia”).',
          'Los hitos son los mismos que en el RC: 63 % en $\\tau$, 86 % en $2\\tau$, 95 % en $3\\tau$ y más de 99 % en $5\\tau$.'
        ],
        diagram: 'f3s14-curves',
        caption: 'Crecimiento y decaimiento de la corriente, con los hitos de un $\\tau$.'
      },
      {
        type: 'concept', heading: 'Voltajes en cada instante', short: 'Voltajes',
        body: [
          'Del resistor: $V_R = IR = \\varepsilon\\left(1 - e^{-t/\\tau}\\right)$. Del inductor: $V_L = L\\,dI/dt = \\varepsilon\\,e^{-t/\\tau}$. Siempre suman $\\varepsilon$.',
          'Fíjate en el cambio de papeles con el RC: allá el voltaje del capacitor empezaba en cero y crecía; aquí el voltaje del inductor empieza en $\\varepsilon$ y <strong>decae</strong>. Lo que no puede saltar en el RL es la <strong>corriente</strong> del inductor.'
        ],
        diagram: 'f3s14-volts',
        caption: '$V_L$ empieza en $\\varepsilon$ y decae; $V_R$ sube. Se cruzan en $t = \\tau\\ln 2$.'
      },
      {
        type: 'concept', heading: 'El decaimiento', short: 'Decaimiento',
        body: [
          'Con la corriente en $I_0 = \\varepsilon/R$, pasa el interruptor a <strong>b</strong>: la batería queda fuera, pero el inductor no deja que la corriente se apague de golpe. Ahora la malla es $L\\,dI/dt + IR = 0$ y $$I(t) = I_0\\,e^{-t/\\tau}$$',
          'La corriente sigue en el <strong>mismo sentido</strong> y se va apagando. El inductor ahora empuja (su fem va a favor de la corriente): $|V_L| = V_R = IR$.',
          'Si en vez de pasar a b simplemente abrieras el circuito, la corriente tendría que caer a cero casi al instante, $dI/dt$ sería enorme y aparecería una chispa (<a href="../sesion-13/">S13</a>). La posición b le da a la corriente un camino para apagarse con calma.'
        ],
        diagram: 'f3s14-circuit', state: circ('b', 0.7),
        caption: 'Interruptor en b: la corriente del inductor sigue circulando por $R$ y decae con el mismo $\\tau$.'
      },
      {
        type: 'concept', heading: 'RC contra RL', short: 'RC contra RL',
        body: [
          'Los dos circuitos tienen la misma matemática, pero el inductor y el capacitor hacen cosas opuestas en los extremos. Al conectar, el capacitor vacío es un cable y el inductor es un circuito abierto; mucho después, al revés.',
          'La energía que guarda el inductor con su corriente final, $\\tfrac{1}{2}LI^2$, es el tema de la <a href="../sesion-15/">S15</a>.'
        ],
        diagram: 'f3s14-compare',
        caption: 'Lo que no puede saltar: el voltaje del capacitor y la corriente del inductor.'
      },
      {
        type: 'recipe', heading: 'Receta: un problema de circuito RL', short: 'Receta',
        steps: [
          { text: 'Decide si la corriente <strong>crece</strong> (se conecta la batería, empieza en 0) o <strong>decae</strong> (se quita la batería, empieza en $I_0$).' },
          { text: 'Calcula $\\tau = L/R$ y cuida unidades.', tip: '$\\text{mH}/\\Omega = \\text{ms}$. Es $L$ entre $R$; no $R/L$ ni $LR$.' },
          { text: 'Crecimiento: $I = (\\varepsilon/R)(1 - e^{-t/\\tau})$, $V_L = \\varepsilon e^{-t/\\tau}$. Decaimiento: $I = I_0e^{-t/\\tau}$, $|V_L| = IR$.', tip: 'El «$1 -$» solo va en la corriente que crece.' },
          { text: 'Si te piden un tiempo, despeja con $\\ln$: crecimiento $t = -\\tau\\ln(1 - I/I_f)$; decaimiento $t = \\tau\\ln(I_0/I)$.' },
          { text: 'Comprueba los extremos: en $t = 0$ el inductor es un circuito abierto ($I = 0$, $V_L = \\varepsilon$); mucho después es un alambre ($I = \\varepsilon/R$, $V_L = 0$).' }
        ]
      },
      {
        type: 'example', heading: 'Corriente y voltajes en un instante',
        problem: '<p>Un circuito tiene una batería de $' + e1.e + '\\ \\text{V}$, un resistor de $' + e1.R + '\\ \\Omega$ y un inductor de $' + e1.L + '\\ \\text{mH}$. Se cierra el interruptor en $t = 0$. Halla $\\tau$, la corriente final y, en $t = ' + fx(e1.t, 1) + '\\ \\text{ms}$, la corriente y los voltajes en $R$ y en $L$.</p>',
        diagram: 'f3s14-circuit', state: circ('a', e1.t / e1.tau),
        steps: [
          { text: 'Constante de tiempo, con $\\text{mH}/\\Omega = \\text{ms}$, y corriente final:', math: '\\tau = \\frac{L}{R} = \\frac{' + e1.L + '}{' + e1.R + '} = ' + fx(e1.tau) + '\\ \\text{ms}\\qquad I_f = \\frac{\\varepsilon}{R} = ' + fx(e1.If) + '\\ \\text{A}' },
          { text: 'Factor exponencial:', math: 'e^{-t/\\tau} = e^{-' + fx(e1.t, 1) + '/' + fx(e1.tau) + '} = ' + fx(e1.x, 4) },
          { text: 'Corriente:', math: 'I = ' + fx(e1.If) + '(1 - ' + fx(e1.x, 4) + ') = ' + fx(e1.I, 4) + '\\ \\text{A}' },
          { text: 'Voltajes; suman $\\varepsilon$:', math: 'V_R = IR = ' + fx(e1.VR) + '\\ \\text{V}\\qquad V_L = \\varepsilon e^{-t/\\tau} = ' + fx(e1.VL) + '\\ \\text{V}' }
        ],
        answer: '$\\tau = ' + fx(e1.tau) + '$ ms, $I_f = ' + fx(e1.If) + '$ A; en $' + fx(e1.t, 1) + '$ ms, $I = ' + fx(e1.I, 3) + '$ A, $V_R = ' + fx(e1.VR) + '$ V y $V_L = ' + fx(e1.VL) + '$ V.',
        verify: { lab: 'call', mod: 'rl', fn: 'grow', args: [e1.L, e1.R, e1.e, e1.t], values: { tau: e1.tau, If: e1.If, I: e1.I, VR: e1.VR, VL: e1.VL } }
      },
      {
        type: 'example', heading: 'La corriente que se apaga',
        problem: '<p>Un inductor de $' + e2.L + '\\ \\text{mH}$ lleva $' + fx(e2.I0) + '\\ \\text{A}$ y en $t = 0$ el interruptor pasa a la posición que lo conecta solo con un resistor de $' + e2.R + '\\ \\Omega$. ¿Cuánta corriente queda después de $' + e2.t + '\\ \\text{ms}$ y qué voltaje tiene el inductor en ese momento?</p>',
        diagram: 'f3s14-circuit', state: circ('b', e2.t / e2.tau),
        steps: [
          { text: 'Constante de tiempo:', math: '\\tau = \\frac{' + e2.L + '}{' + e2.R + '} = ' + fx(e2.tau) + '\\ \\text{ms}' },
          { text: 'Decaimiento, sin el «$1 -$»:', math: 'I = I_0e^{-t/\\tau} = ' + fx(e2.I0) + '\\,e^{-' + e2.t + '/' + fx(e2.tau) + '} = ' + fx(e2.I, 4) + '\\ \\text{A}' },
          { text: 'Sin batería, el inductor es el único que empuja: su voltaje es el del resistor.', math: '|V_L| = IR = (' + fx(e2.I, 4) + ')(' + e2.R + ') = ' + fx(e2.VL, 2) + '\\ \\text{V}' }
        ],
        answer: '$I \\approx ' + fx(e2.I, 3) + '\\ \\text{A}$ (en el mismo sentido) y $|V_L| \\approx ' + fx(e2.VL, 2) + '\\ \\text{V}$.',
        verify: { lab: 'call', mod: 'rl', fn: 'decay', args: [e2.L, e2.R, e2.e, e2.t], values: { tau: e2.tau, I0: e2.I0, I: e2.I, VLmag: e2.VL } }
      },
      {
        type: 'example', heading: '¿Cuánto tarda en llegar al 90 %?',
        problem: '<p>Un relé tiene una bobina de $' + e3.L + '\\ \\text{mH}$ y $' + e3.R + '\\ \\Omega$, y se conecta a $' + e3.e + '\\ \\text{V}$. El relé cierra sus contactos cuando la corriente llega al 90 % de su valor final. ¿Cuánto tarda?</p>',
        steps: [
          { text: 'Constante de tiempo y corriente de disparo:', math: '\\tau = \\frac{' + e3.L + '}{' + e3.R + '} = ' + fx(e3.tau) + '\\ \\text{ms}\\qquad I = 0.90\\,\\frac{\\varepsilon}{R} = ' + fx(e3.I, 3) + '\\ \\text{A}' },
          { text: 'De $I = I_f(1 - e^{-t/\\tau})$ sale $e^{-t/\\tau} = 1 - 0.90 = 0.10$:', math: 't = -\\tau\\ln(0.10) = ' + fx(e3.tau) + '\\ln 10 = ' + fx(e3.t, 2) + '\\ \\text{ms}' }
        ],
        answer: '$t \\approx ' + fx(e3.t, 1) + '\\ \\text{ms}$ (siempre $\\tau\\ln 10 \\approx 2.3\\,\\tau$ para el 90 %).',
        verify: { lab: 'call', mod: 'rl', fn: 'timeTo', args: ['c', e3.L, e3.R, e3.e, e3.I], value: e3.t }
      },
      {
        type: 'example', heading: 'El arranque y la energía final',
        problem: '<p>En el circuito del ejemplo 1 ($' + e4.e + '\\ \\text{V}$, $' + e4.R + '\\ \\Omega$, $' + e4.L + '\\ \\text{mH}$), ¿a qué ritmo empieza a crecer la corriente justo al cerrar? ¿Cuánta energía guarda el inductor cuando la corriente llega a su valor final?</p>',
        steps: [
          { text: 'En $t = 0$, $I = 0$ y todo $\\varepsilon$ cae en el inductor:', math: '\\left.\\frac{dI}{dt}\\right|_0 = \\frac{\\varepsilon}{L} = \\frac{' + e4.e + '}{0.200} = ' + fx(e4.rate, 0) + '\\ \\text{A/s}' },
          { text: 'Si la corriente siguiera subiendo a ese ritmo, llegaría a $I_f$ justo en $t = \\tau$: esa es otra lectura de la constante de tiempo.' },
          { text: 'Con la corriente final, el inductor guarda (lo vemos en la S15) $U = \\tfrac{1}{2}LI^2$; mH × A² = mJ:', math: 'U = \\tfrac{1}{2}(' + e4.L + ')(' + fx(e4.If) + ')^2 = ' + fx(e4.U, 2) + '\\ \\text{mJ}' }
        ],
        answer: '$dI/dt = ' + fx(e4.rate, 0) + '\\ \\text{A/s}$ al inicio y $U = ' + fx(e4.U, 2) + '\\ \\text{mJ}$ al final.',
        verify: { lab: 'call', mod: 'rl', fn: 'stored', args: [e4.L, e4.R, e4.e], value: e4.U }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué más resistencia hace más rápido el circuito RL?', a: 'Porque $\\tau = L/R$. Con más $R$, la corriente final $\\varepsilon/R$ es menor: hay menos corriente que “acelerar”, y se llega antes. En el RC es al revés porque $\\tau = RC$.' },
          { q: '¿La corriente llega a $\\varepsilon/R$?', a: 'Matemáticamente nunca del todo, pero después de $5\\tau$ ya va en más de 99 %.' },
          { q: 'Justo al cerrar, ¿cuánto vale la corriente?', a: 'Cero. La corriente de un inductor no puede saltar. Lo que sí salta es su voltaje: de 0 a $\\varepsilon$.' },
          { q: '¿Hacia dónde va la corriente al decaer?', a: 'En el mismo sentido que antes. El inductor la sostiene mientras se apaga.' },
          { q: '¿Qué pasa si abro el interruptor de golpe en lugar de pasarlo a b?', a: 'La corriente tendría que caer a cero casi instantáneamente: $L\\,dI/dt$ sería enorme y saltaría una chispa. Por eso se pone un camino de descarga (un diodo o un resistor).' },
          { q: '¿Uso ln o log?', a: 'ln, el logaritmo natural, porque la exponencial es $e^{-t/\\tau}$.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Kirchhoff con la fem del inductor: $L\\,dI/dt + IR = \\varepsilon$.',
          'Crecimiento: $I = (\\varepsilon/R)(1 - e^{-t/\\tau})$ y $V_L = \\varepsilon e^{-t/\\tau}$. Decaimiento: $I = I_0e^{-t/\\tau}$.',
          '$\\tau = L/R$ ($\\text{mH}/\\Omega = \\text{ms}$): 63 % en $\\tau$, más de 99 % en $5\\tau$. Para una corriente: $t = -\\tau\\ln(1 - I/I_f)$ o $t = \\tau\\ln(I_0/I)$.',
          'Al conectar, el inductor es un circuito abierto; mucho después, un alambre. Su corriente nunca salta.'
        ]
      }
    ],

    lab: {
      type: 'rl-circuit', title: 'Curvas de crecimiento y decaimiento',
      intro: 'Mueve $R$, $L$ y $\\varepsilon$, y recorre el tiempo con el cursor (o anímalo desde $t = 0$): ves la corriente subir hacia $\\varepsilon/R$ o apagarse, y las curvas de $I$, $V_R$ y $V_L$ con $\\tau$, $2\\tau$… marcados. El tablero lleva la energía entregada por la batería, la guardada en el inductor y la disipada en $R$, y compara la corriente con un integrador RK4. En el reto calculas $\\tau$, la corriente o el voltaje del inductor en el instante del cursor, o el tiempo para llegar a una corriente; el lab te avisa si usaste $R/L$ o $LR$, si olvidaste el «$1 -$», si usaste $\\log$ o si diste el voltaje del resistor.',
      cfg: { start: { mode: 'c', R: 50, L: 200, eps: 12, k: 1, kind: 'I' } }
    },

    formulas: [
      { label: 'Ecuación del circuito', tex: 'L\\,\\frac{dI}{dt} + IR = \\varepsilon' },
      { label: 'Constante de tiempo', tex: '\\tau = \\frac{L}{R}' },
      { label: 'Crecimiento', tex: 'I = \\frac{\\varepsilon}{R}\\left(1 - e^{-t/\\tau}\\right)' },
      { label: 'Decaimiento', tex: 'I = I_0\\,e^{-t/\\tau}' },
      { label: 'Voltaje del inductor', tex: 'V_L = L\\,\\frac{dI}{dt} = \\varepsilon\\,e^{-t/\\tau}' },
      { label: 'Tiempo para una corriente', tex: 't = -\\tau\\ln\\left(1 - \\frac{I}{I_f}\\right)' }
    ],

    exercises: [
      {
        id: 'f3-s14-tau', title: 'La constante de tiempo',
        vars: { L: [10, 900, 10], R: [10, 200, 10] },
        prompt: function (v) { return '<p>Un circuito RL tiene $L = ' + v.L + '\\ \\text{mH}$ y $R = ' + v.R + '\\ \\Omega$. ¿Cuánto vale su constante de tiempo, en ms?</p>'; },
        check: 'numeric', unit: 'ms',
        answer: function (v) { return v.L / v.R; },
        mistakes: {
          RoverL: function (v) { return v.R / v.L; },
          LR: function (v) { return v.L * v.R; },
          sec: function (v) { return v.L / v.R / 1000; }
        },
        feedback: [
          { when: 'RoverL', say: 'Es $\\tau = L/R$, no $R/L$.' },
          { when: 'LR', say: 'En el RL no se multiplica: $\\tau = L/R$.' },
          { when: 'sec', say: 'Ese número está en segundos; con mH y Ω, $L/R$ sale en ms.' }
        ],
        oracle: { lab: 'value', value: function (v) { return (v.L * 1e-3) / v.R * 1e3; } },
        hint: '$\\tau = L/R$; $\\text{mH}/\\Omega = \\text{ms}$.',
        solution: function (v) { return '$$\\tau = \\frac{L}{R} = \\frac{' + v.L + '\\ \\text{mH}}{' + v.R + '\\ \\Omega} = ' + fx(v.L / v.R, 3) + '\\ \\text{ms}$$'; }
      },
      {
        id: 'f3-s14-crece', title: 'Corriente mientras crece',
        vars: { L: [50, 900, 50], R: [10, 200, 10], e: [3, 24, 1], m: [0.3, 3, 0.1] },
        prompt: function (v) { return '<p>Un circuito tiene una batería de $' + v.e + '\\ \\text{V}$, $R = ' + v.R + '\\ \\Omega$ y $L = ' + v.L + '\\ \\text{mH}$. ¿Cuánta corriente circula $' + tOf(v) + '\\ \\text{ms}$ después de cerrar el interruptor, en A?</p>'; },
        diagram: { id: 'f3s14-circuit', state: function (v) { return circ('a', tOf(v) / (v.L / v.R)); } },
        check: 'numeric', unit: 'A',
        answer: function (v) { return v.e / v.R * (1 - Math.exp(-tOf(v) / (v.L / v.R))); },
        mistakes: {
          noOne: function (v) { return v.e / v.R * Math.exp(-tOf(v) / (v.L / v.R)); },
          final: function (v) { return v.e / v.R; }
        },
        feedback: [
          { when: 'noOne', say: 'Te faltó el «$1 -$»: al crecer, $I = (\\varepsilon/R)(1 - e^{-t/\\tau})$.' },
          { when: 'final', say: 'Esa es la corriente final; a ese tiempo todavía no llega.' }
        ],
        oracle: { lab: 'value', value: function (v) { return RL().rk4('c', v.L, v.R, v.e, tOf(v), 4000).I; } },
        hint: '$\\tau = L/R$ en ms e $I = (\\varepsilon/R)(1 - e^{-t/\\tau})$.',
        solution: function (v) { var T = v.L / v.R, t = tOf(v), x = Math.exp(-t / T); return '$\\tau = ' + fx(T, 3) + '\\ \\text{ms}$ e $I_f = ' + fx(v.e / v.R, 4) + '\\ \\text{A}$. $$I = ' + fx(v.e / v.R, 4) + '\\left(1 - e^{-' + t + '/' + fx(T, 3) + '}\\right) = ' + fx(v.e / v.R * (1 - x), 4) + '\\ \\text{A}$$'; }
      },
      {
        id: 'f3-s14-VL', title: 'Voltaje del inductor',
        vars: { L: [50, 900, 50], R: [10, 200, 10], e: [3, 24, 1], m: [0.3, 3, 0.1] },
        prompt: function (v) { return '<p>En un circuito con $' + v.e + '\\ \\text{V}$, $R = ' + v.R + '\\ \\Omega$ y $L = ' + v.L + '\\ \\text{mH}$, ¿qué voltaje tiene el inductor $' + tOf(v) + '\\ \\text{ms}$ después de cerrar el interruptor, en V?</p>'; },
        check: 'numeric', unit: 'V',
        answer: function (v) { return v.e * Math.exp(-tOf(v) / (v.L / v.R)); },
        mistakes: {
          wrongV: function (v) { return v.e * (1 - Math.exp(-tOf(v) / (v.L / v.R))); },
          noDecay: function (v) { return v.e; }
        },
        feedback: [
          { when: 'wrongV', say: 'Ese es el voltaje del resistor. El del inductor es $\\varepsilon e^{-t/\\tau}$: empieza en $\\varepsilon$ y decae.' },
          { when: 'noDecay', say: '$V_L = \\varepsilon$ solo en $t = 0$; luego decae.' }
        ],
        oracle: { lab: 'value', value: function (v) { return RL().rk4('c', v.L, v.R, v.e, tOf(v), 4000).VL; } },
        hint: '$V_L = \\varepsilon - IR = \\varepsilon e^{-t/\\tau}$.',
        solution: function (v) { var T = v.L / v.R, t = tOf(v); return '$\\tau = ' + fx(T, 3) + '\\ \\text{ms}$. $$V_L = \\varepsilon e^{-t/\\tau} = ' + v.e + '\\,e^{-' + t + '/' + fx(T, 3) + '} = ' + fx(v.e * Math.exp(-t / T), 3) + '\\ \\text{V}$$'; }
      },
      {
        id: 'f3-s14-tiempo', title: 'Tiempo para llegar a una corriente',
        vars: { L: [50, 900, 50], R: [10, 200, 10], e: [6, 24, 2], p: [50, 95, 5] },
        prompt: function (v) { return '<p>Un circuito tiene $' + v.e + '\\ \\text{V}$, $R = ' + v.R + '\\ \\Omega$ y $L = ' + v.L + '\\ \\text{mH}$. ¿Cuánto tarda la corriente en llegar al $' + v.p + '\\ \\%$ de su valor final, en ms?</p>'; },
        check: 'numeric', unit: 'ms',
        answer: function (v) { return -v.L / v.R * Math.log(1 - v.p / 100); },
        mistakes: {
          log10: function (v) { return -v.L / v.R * Math.log10(1 - v.p / 100); },
          noOne: function (v) { return -v.L / v.R * Math.log(v.p / 100); }
        },
        feedback: [
          { when: 'log10', say: 'Usa $\\ln$, no $\\log$.' },
          { when: 'noOne', say: 'De $I = I_f(1 - e^{-t/\\tau})$ sale $e^{-t/\\tau} = 1 - I/I_f$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return rkTime('c', v.L, v.R, v.e, v.p / 100 * v.e / v.R); } },
        hint: '$t = -\\tau\\ln(1 - I/I_f)$.',
        solution: function (v) { var T = v.L / v.R, r = 1 - v.p / 100; return '$\\tau = ' + fx(T, 3) + '\\ \\text{ms}$. $$t = -\\tau\\ln(' + fx(r) + ') = ' + fx(-T * Math.log(r), 3) + '\\ \\text{ms}$$'; }
      },
      {
        id: 'f3-s14-decae', title: 'Corriente que decae',
        vars: { L: [50, 900, 50], R: [10, 200, 10], I0: [0.1, 2, 0.1], m: [0.3, 3, 0.1] },
        prompt: function (v) { return '<p>Un inductor de $' + v.L + '\\ \\text{mH}$ lleva $' + fx(v.I0, 1) + '\\ \\text{A}$ y se conecta solo con un resistor de $' + v.R + '\\ \\Omega$. ¿Cuánta corriente queda después de $' + tOf(v) + '\\ \\text{ms}$, en A?</p>'; },
        diagram: { id: 'f3s14-circuit', state: function (v) { return circ('b', tOf(v) / (v.L / v.R)); } },
        check: 'numeric', unit: 'A',
        answer: function (v) { return v.I0 * Math.exp(-tOf(v) / (v.L / v.R)); },
        mistakes: {
          oneMinus: function (v) { return v.I0 * (1 - Math.exp(-tOf(v) / (v.L / v.R))); },
          RoverL: function (v) { return v.I0 * Math.exp(-tOf(v) / (v.R / v.L)); }
        },
        feedback: [
          { when: 'oneMinus', say: 'Esa es la fórmula del crecimiento. Al decaer, $I = I_0e^{-t/\\tau}$.' },
          { when: 'RoverL', say: 'Usaste $\\tau = R/L$; es $L/R$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return RL().rk4('d', v.L, v.R, v.I0 * v.R, tOf(v), 4000).I; } },
        hint: 'Decaimiento: $I = I_0e^{-t/\\tau}$ con $\\tau = L/R$.',
        solution: function (v) { var T = v.L / v.R, t = tOf(v); return '$\\tau = ' + fx(T, 3) + '\\ \\text{ms}$. $$I = ' + fx(v.I0, 1) + '\\,e^{-' + t + '/' + fx(T, 3) + '} = ' + fx(v.I0 * Math.exp(-t / T), 4) + '\\ \\text{A}$$'; }
      },
      {
        id: 'f3-s14-arranque', title: 'Rapidez inicial de la corriente',
        vars: { L: [50, 900, 50], R: [10, 200, 10], e: [3, 24, 1] },
        prompt: function (v) { return '<p>Al cerrar el interruptor de un circuito con $' + v.e + '\\ \\text{V}$, $R = ' + v.R + '\\ \\Omega$ y $L = ' + v.L + '\\ \\text{mH}$, ¿a qué ritmo empieza a crecer la corriente, en A/s?</p>'; },
        check: 'numeric', unit: 'A/s',
        answer: function (v) { return v.e / (v.L / 1000); },
        mistakes: {
          final: function (v) { return v.e / v.R; },
          mH: function (v) { return v.e / v.L; }
        },
        feedback: [
          { when: 'final', say: 'Esa es la corriente final, no su rapidez de cambio.' },
          { when: 'mH', say: 'Pasa $L$ a henries para obtener A/s.' }
        ],
        oracle: { lab: 'call', mod: 'rl', fn: 'grow', field: 'dIdt', args: function (v) { return [v.L / 1000, v.R, v.e, 0]; } },
        hint: 'En $t = 0$, $I = 0$ y todo $\\varepsilon$ está en el inductor: $\\varepsilon = L\\,dI/dt$.',
        solution: function (v) { return '$$\\left.\\frac{dI}{dt}\\right|_0 = \\frac{\\varepsilon}{L} = \\frac{' + v.e + '}{' + fx(v.L / 1000, 3) + '} = ' + fx(v.e / (v.L / 1000), 2) + '\\ \\text{A/s}$$'; }
      },
      {
        id: 'f3-s14-extremos', title: 'Concepto: los dos extremos',
        vars: { k: [0, 1, 1] },
        prompt: function (v) { return '<p>En un circuito RL que se conecta a una batería, ' + (v.k ? 'mucho tiempo después' : 'justo al cerrar el interruptor') + ', el inductor se comporta como…</p>'; },
        check: 'choice',
        options: function (v) {
          var right = v.k ? 'Un alambre: su voltaje es cero' : 'Un circuito abierto: la corriente es cero';
          var other = v.k ? 'Un circuito abierto: la corriente es cero' : 'Un alambre: su voltaje es cero';
          return [
            { text: right, correct: true },
            { text: other, say: v.k ? 'Eso pasa al cerrar. Al final la corriente ya no cambia y $V_L = 0$.' : 'Eso pasa al final. Al cerrar, la corriente no puede saltar desde cero.' },
            { text: 'Una resistencia igual a R', say: 'El inductor ideal no tiene resistencia.' }
          ];
        },
        answer: function (v) { return v.k ? 'Un alambre: su voltaje es cero' : 'Un circuito abierto: la corriente es cero'; },
        hint: 'La corriente de un inductor no salta; su voltaje es $L\\,dI/dt$.',
        solution: function (v) { return v.k ? 'Con la corriente constante, $V_L = L\\,dI/dt = 0$: es un <strong>alambre</strong>.' : 'La corriente empieza en cero porque no puede saltar: el inductor es un <strong>circuito abierto</strong> en ese instante.'; }
      }
    ],

    quiz: { tags: ['f3.S14'], count: 8 },

    errors: [
      'Calcular $\\tau = R/L$ o $\\tau = LR$ en lugar de $\\tau = L/R$.',
      'Pensar que más resistencia hace más lento el circuito RL (es al revés que en el RC).',
      'Poner el «$1 -$» en el decaimiento o quitarlo del crecimiento.',
      'Creer que la corriente salta al cerrar el interruptor: lo que salta es el voltaje del inductor.',
      'Confundir $V_L$ con $V_R$: el del inductor empieza en $\\varepsilon$ y decae.',
      'Usar $\\log$ en lugar de $\\ln$ al despejar el tiempo.',
      'Mezclar prefijos: con mH y Ω, $L/R$ sale en ms.'
    ],

    teacher: {
      plan: [
        'Analogía del carrito (inercia y fricción) y explainer del interruptor: abierto, a en $t = 0$, a en $\\tau$ y a mucho después.',
        'Malla con la polaridad del inductor de la S13 y la ecuación; la solución sale igual que en el RC de Física 2, así que basta recordarla y comprobarla derivando.',
        '$\\tau = L/R$ con unidades y la pregunta de por qué más $R$ es más rápido. Ejemplos 1 y 3, luego el decaimiento (ejemplo 2) y el problema de abrir de golpe.',
        'Lab: crecimiento y decaimiento con el cursor; que comparen $V_R$ y $V_L$. Cierra con la tabla RC contra RL.'
      ],
      check: [
        'Que digan qué hace el inductor en $t = 0$ y mucho después.',
        'Que calculen $\\tau$, $I(t)$ y $V_L(t)$ con unidades consistentes.',
        'Que distingan qué no puede saltar en el RC (voltaje de C) y en el RL (corriente de L).'
      ],
      note: 'La energía guardada en el inductor ($\\tfrac{1}{2}LI^2$) y su densidad se desarrollan en la S15; aquí solo se adelanta en el ejemplo 4.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §14.4 “RL Circuits”. <a href="https://openstax.org/books/university-physics-volume-2/pages/14-4-rl-circuits">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-13',
    next: 'sesion-15'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { if (!ex.baseWhere) ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
