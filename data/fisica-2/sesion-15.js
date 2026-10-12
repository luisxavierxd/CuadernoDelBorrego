/* =====================================================================
   Física 2 · S15 · Circuito RC: carga y descarga, constante de tiempo y energía
   (bloque C · Circuitos). Última sesión del curso.
   Fuente: OpenStax, University Physics Volume 2, §10.5 (CC BY-NC-SA 4.0).
   Unidades de trabajo: R en kΩ, C en μF, ε en V → τ y t en ms, q en μC, i en mA,
   energía en μJ (kΩ·μF = ms, V/kΩ = mA, μF·V² = μJ).
   Las cuentas se hacen aquí con las fórmulas cerradas; scripts/examples.test.js las
   compara contra LabMath.rc (lab rc-circuit) y los oráculos de los ejercicios usan el
   integrador RK4 de la EDO (LabMath.rc.rk4), que no usa la solución analítica.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function nice(x) { return Number(x.toPrecision(2)); }
  function RC() { return window.LabMath.rc; }
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (m) { return ex.mistakes[m](v); }));
      if (!(Math.abs(vals[0]) >= 0.1)) return false;
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) {
          if (Math.abs(vals[i] - vals[j]) <= Math.max(0.05, 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j])))) return false;
        }
      }
      return true;
    };
  }
  // Instante de los ejercicios: m·τ redondeado a 2 cifras (en ms).
  function tOf(v) { return nice(v.m * v.R * v.C); }
  // Oráculo del tiempo: bisección sobre el RK4 (no usa logaritmos).
  function rkTime(mode, R, C, e, V) {
    var lo = 0, hi = 12 * R * C, up = mode !== 'd';
    for (var k = 0; k < 50; k++) {
      var mid = (lo + hi) / 2, vc = RC().rk4(mode, R, C, e, mid, 1000).VC;
      if ((vc < V) === up) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }
  function circ(sw, x, extra) { var s = { sw: sw, x: x }; Object.keys(extra || {}).forEach(function (k) { s[k] = extra[k]; }); return s; }

  // Ejemplo 1: carga. 4.7 kΩ, 100 μF, 9 V; en t = 1000 ms.
  var e1 = { R: 4.7, C: 100, e: 9, t: 1000 };
  e1.tau = e1.R * e1.C; e1.Qf = e1.C * e1.e; e1.I0 = e1.e / e1.R; e1.x = Math.exp(-e1.t / e1.tau);
  e1.q = e1.Qf * (1 - e1.x); e1.i = e1.I0 * e1.x; e1.VC = e1.q / e1.C; e1.VR = e1.i * e1.R;
  // Ejemplo 2: descarga. 47 μF cargado a 12 V, por 20 kΩ; en t = 500 ms.
  var e2 = { R: 20, C: 47, V0: 12, t: 500 };
  e2.tau = e2.R * e2.C; e2.Q0 = e2.C * e2.V0; e2.x = Math.exp(-e2.t / e2.tau); e2.q = e2.Q0 * e2.x; e2.VC = e2.V0 * e2.x; e2.i = e2.VC / e2.R;
  // Ejemplo 3: flash. 6.8 kΩ, 150 μF, 300 V; listo en 270 V.
  var e3 = { R: 6.8, C: 150, e: 300, V: 270 };
  e3.tau = e3.R * e3.C; e3.t = -e3.tau * Math.log(1 - e3.V / e3.e); e3.U = 0.5 * e3.C * e3.V * e3.V;
  // Ejemplo 4: energía de la carga completa con 100 μF y 12 V.
  var e4 = { C: 100, e: 12 };
  e4.Q = e4.C * e4.e; e4.Ub = e4.Q * e4.e; e4.Uc = 0.5 * e4.Ub; e4.Ur = e4.Ub - e4.Uc;

  var data = window.SESSION_DATA = {
    slug: 'sesion-15', number: '15', group: 'C · Circuitos',
    title: 'Circuito RC: carga y descarga, constante de tiempo y energía', temario: [],
    minutes: 180,
    quote: 'Nada en un circuito RC pasa de golpe: todo se acerca a su valor final con la misma exponencial, y el reloj lo marca τ = RC.',
    badges: [
      'Explicar qué pasa al cerrar el interruptor: al principio el capacitor vacío es un cable; al final, una rama abierta.',
      'Plantear la EDO $R\\,\\dfrac{dq}{dt} + \\dfrac{q}{C} = \\varepsilon$ con Kirchhoff y resolverla por separación de variables.',
      'Usar $\\tau = RC$ para calcular la carga, la corriente y los voltajes en cualquier instante, y el tiempo para llegar a un voltaje.',
      'Hacer el balance de energía: la batería entrega $Q\\varepsilon$, el capacitor guarda la mitad y la otra mitad se va en $R$.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Un capacitor <strong>no se llena al instante</strong>: la carga tiene que pasar por un resistor, y mientras más se llena, más despacio entra. El resultado es una curva exponencial cuyo «reloj» es $\\tau = RC$.',
        recall: [
          'Capacitancia: $Q = CV$ (<a href="../sesion-09/">S09</a>) y energía guardada $U = \\tfrac{1}{2}CV^2 = \\tfrac{1}{2}QV$ (<a href="../sesion-10/">S10</a>).',
          'Regla de mallas y convención de signos (<a href="../sesion-13/">S13</a>); un capacitor cargado en estado estable es una rama abierta (<a href="../sesion-14/">S14</a>).',
          'Corriente como derivada de la carga: $i = dq/dt$ (S11).',
          'Cálculo: $\\int \\frac{dx}{a - x} = -\\ln(a - x)$, y que $\\ln$ y $e^x$ son inversas.'
        ],
        why: 'El flash de una cámara, el desfibrilador de una ambulancia, el limpiaparabrisas intermitente, el parpadeo de una luz LED o el retardo con el que se apaga la luz del coche: todos son circuitos RC. Cambiando $R$ o $C$ se ajusta cuánto tardan.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en inflar una llanta con una bomba de pie. Al principio el aire entra fácil, porque la llanta no empuja de regreso. Conforme se llena, la presión de adentro empuja contra la bomba y cada bombazo mete menos aire. Al final, la presión de la llanta iguala la de la bomba y ya no entra nada. Así se carga un capacitor: la batería es la bomba, la carga es el aire y el voltaje del capacitor es la presión que empuja de regreso.',
          'Ahora destapa una tina llena. Al principio el agua sale con fuerza, porque hay mucha altura empujando. Cuando queda poca, sale despacito. Mientras menos hay, más lento se vacía. Así se descarga un capacitor: la corriente depende de cuánta carga le queda.',
          'En los dos casos lo que cambia es «rápido al principio, lento al final», y la manguera (el resistor) decide qué tan rápido. Una manguera angosta (mucha $R$) o una tina enorme (mucha $C$) hacen que todo tarde más. Por eso el tiempo característico es $\\tau = RC$.'
        ]
      },
      {
        type: 'explainer', heading: 'Al cerrar el interruptor', short: 'Al cerrar el interruptor',
        title: 'De cable a rama abierta',
        intro: 'El circuito tiene una batería, un resistor, un capacitor y un interruptor de dos posiciones: en <strong>a</strong> la batería carga el capacitor; en <strong>b</strong> la batería queda fuera y el capacitor se descarga por $R$. Empezamos con el capacitor vacío.',
        diagram: 'f2s15-circuit',
        steps: [
          { text: 'Interruptor abierto: no hay camino cerrado, no pasa corriente y el capacitor está vacío ($q = 0$, $V_C = 0$).', state: circ('open', 0) },
          { text: 'Pasas el interruptor a <strong>a</strong> ($t = 0$). El capacitor vacío no tiene voltaje, así que <strong>se porta como un cable</strong>: todo $\\varepsilon$ cae en el resistor y la corriente arranca con su valor máximo, $I_0 = \\varepsilon/R$.', state: circ('a', 0) },
          { text: 'La carga se acumula en las placas y $V_C = q/C$ crece. A $R$ le queda menos voltaje ($V_R = \\varepsilon - V_C$), así que la corriente baja. Cuando $t = \\tau$, el capacitor ya tiene 63 % de su carga final.', state: circ('a', 1) },
          { text: 'Mucho tiempo después, $V_C = \\varepsilon$: ya no queda voltaje para $R$ y la corriente es cero. El capacitor lleno es una <strong>rama abierta</strong>, justo lo que usaste en el estado estable de la <a href="../sesion-14/">S14</a>. Hoy vemos todo lo que pasa en medio.', state: circ('a', 6) }
        ]
      },
      {
        type: 'concept', heading: 'Kirchhoff en la malla: la ecuación del circuito', short: 'La ecuación',
        body: [
          'Recorre la malla en el sentido de la corriente (<a href="../sesion-13/">S13</a>): subes $\\varepsilon$ en la batería, bajas $iR$ en el resistor y bajas $V_C = q/C$ en el capacitor. La suma da cero: $$\\varepsilon - iR - \\frac{q}{C} = 0$$',
          'Lo nuevo es que la corriente es la rapidez con la que llega carga al capacitor: $i = \\dfrac{dq}{dt}$. Al sustituir, la regla de mallas se vuelve una <strong>ecuación diferencial</strong> (una ecuación donde la incógnita es una función, $q(t)$, y aparece su derivada): $$R\\,\\frac{dq}{dt} + \\frac{q}{C} = \\varepsilon$$',
          'Léela como una frase: la corriente es grande cuando $q$ es chica y se apaga cuando $q/C$ alcanza a $\\varepsilon$. Eso es «rápido al principio, lento al final». Falta encontrar la función exacta.'
        ],
        diagram: 'f2s15-circuit', state: circ('a', 0.7, { loop: 1, cap: 'ε − iR − q/C = 0' }),
        caption: 'Recorriendo la malla a favor de la corriente: $+\\varepsilon$ en la batería, $-iR$ en el resistor y $-q/C$ en el capacitor.'
      },
      {
        type: 'explainer', heading: 'EDO en 5 minutos', short: 'EDO en 5 minutos',
        title: 'Separación de variables, paso a paso',
        intro: 'No necesitas un curso de ecuaciones diferenciales para resolver esta: basta separar variables e integrar, con lo que ya sabes de Cálculo. El dibujo es el <strong>campo de pendientes</strong>: en cada punto $(t, q)$, la flechita tiene la pendiente $dq/dt$ que pide la ecuación.',
        diagram: 'f2s15-slopes',
        steps: [
          { text: 'Despeja la derivada: $$\\frac{dq}{dt} = \\frac{C\\varepsilon - q}{RC}$$ Con poca carga la pendiente es grande; arriba, cerca de $q = C\\varepsilon$, casi plana.', state: { n: 0 } },
          { text: 'En $q = C\\varepsilon$ la pendiente es <strong>cero</strong>: ese es el final. Ahora separa: todo lo de $q$ a la izquierda y todo lo de $t$ a la derecha. $$\\frac{dq}{C\\varepsilon - q} = \\frac{dt}{RC}$$', state: { n: 1 } },
          { text: 'Integra con la condición inicial $q(0) = 0$ (el punto del origen): de $0$ a $q$ a la izquierda y de $0$ a $t$ a la derecha. $$-\\ln(C\\varepsilon - q) + \\ln(C\\varepsilon) = \\frac{t}{RC}$$ Es decir, $$\\ln\\frac{C\\varepsilon - q}{C\\varepsilon} = -\\frac{t}{RC}$$', state: { n: 2 } },
          { text: 'Aplica la exponencial a los dos lados (deshace el $\\ln$) y despeja $q$: $$\\frac{C\\varepsilon - q}{C\\varepsilon} = e^{-t/RC}$$ $$q(t) = C\\varepsilon\\left(1 - e^{-t/RC}\\right)$$ La curva sigue todas las flechitas: es la solución.', state: { n: 3 } },
          { text: 'La descarga es igual, sin batería: $R\\,dq/dt + q/C = 0$, o sea $\\dfrac{dq}{q} = -\\dfrac{dt}{RC}$. Con $q(0) = Q_0$: $$q(t) = Q_0\\,e^{-t/RC}$$ Comprueba siempre derivando: $dq/dt$ de tu resultado debe cumplir la ecuación.', state: { n: 4 } }
        ]
      },
      {
        type: 'concept', heading: 'La constante de tiempo τ = RC', short: 'Constante de tiempo',
        body: [
          'En las dos soluciones aparece el mismo número, $\\tau = RC$, la <strong>constante de tiempo</strong>. Tiene unidades de tiempo: $\\Omega\\cdot\\text{F} = \\dfrac{\\text{V}}{\\text{A}}\\cdot\\dfrac{\\text{C}}{\\text{V}} = \\dfrac{\\text{C}}{\\text{C/s}} = \\text{s}$. Con prefijos: $\\text{k}\\Omega\\cdot\\mu\\text{F} = \\text{ms}$ y $\\text{M}\\Omega\\cdot\\mu\\text{F} = \\text{s}$.',
          'En $t = \\tau$, $q = C\\varepsilon(1 - e^{-1}) = 0.632\\,C\\varepsilon$: el capacitor tiene <strong>63 %</strong> de su carga final. Cada $\\tau$ adicional se come 63 % de lo que falta: 86 % en $2\\tau$, 95 % en $3\\tau$, 98 % en $4\\tau$ y 99.3 % en $5\\tau$. En la descarga es al revés: queda 37 % en $\\tau$ y 0.7 % en $5\\tau$.',
          '<strong>Regla práctica:</strong> después de $5\\tau$ el capacitor está prácticamente lleno (o vacío). Y una lectura bonita de $\\tau$: si la carga siguiera entrando con la corriente del principio, $I_0 = \\varepsilon/R$, el capacitor se llenaría justo en $t = C\\varepsilon/I_0 = RC$ (la recta punteada).',
          '¿Por qué $R$ por $C$? Más $R$ deja pasar menos corriente; más $C$ hay que llenar con más carga. Las dos cosas hacen que tarde más. La batería <strong>no</strong> cambia $\\tau$: con más $\\varepsilon$ entra más carga, pero también hay más que llenar.'
        ],
        diagram: 'f2s15-tau',
        caption: 'Carga contra tiempo: en cada múltiplo de $\\tau$ el capacitor lleva 63, 86, 95, 98 y 99.3 % de $C\\varepsilon$. La tangente al inicio llega a $C\\varepsilon$ justo en $\\tau$.'
      },
      {
        type: 'concept', heading: 'Corriente y voltajes en cada instante', short: 'Corriente y voltajes',
        body: [
          'Deriva la carga para obtener la corriente: $$i(t) = \\frac{dq}{dt} = \\frac{\\varepsilon}{R}\\,e^{-t/\\tau}$$ Empieza en $\\varepsilon/R$ (el capacitor vacío es un cable) y decae a cero (el capacitor lleno es una rama abierta).',
          'Los voltajes salen de $V_C = q/C$ y $V_R = iR$: $$V_C = \\varepsilon\\left(1 - e^{-t/\\tau}\\right) \\qquad V_R = \\varepsilon\\,e^{-t/\\tau}$$ Uno sube mientras el otro baja, y en todo instante $V_C + V_R = \\varepsilon$: es la regla de mallas. Se cruzan en $\\varepsilon/2$, cuando $t = \\tau\\ln 2 \\approx 0.69\\,\\tau$.',
          'Fíjate que $i$ y $V_R$ decaen como $e^{-t/\\tau}$, sin el «$1 -$». El «$1 -$» solo está en lo que se llena: la carga y el voltaje del capacitor.'
        ],
        diagram: 'f2s15-volts',
        caption: 'Durante la carga: $V_C$ sube, $V_R$ baja (igual que la corriente) y siempre suman $\\varepsilon$.'
      },
      {
        type: 'concept', heading: 'La descarga', short: 'Descarga',
        body: [
          'Con el capacitor cargado a $V_0$ ($Q_0 = CV_0$), pasa el interruptor a <strong>b</strong>: la batería queda fuera y el capacitor empuja carga por el resistor. $$q(t) = Q_0\\,e^{-t/\\tau} \\qquad V_C = V_0\\,e^{-t/\\tau} \\qquad i(t) = -\\frac{V_0}{R}\\,e^{-t/\\tau}$$',
          'El signo menos de $i$ dice que la corriente <strong>va al revés</strong> que en la carga: sale de la placa positiva y da la vuelta por $R$ hasta la negativa. Su tamaño empieza en $V_0/R$ y decae con el mismo $\\tau = RC$.',
          'Sin batería, la regla de mallas dice $V_C = V_R$ en todo momento: el voltaje del capacitor es el único que empuja, y todo cae en el resistor.'
        ],
        diagram: 'f2s15-circuit', state: circ('b', 0.7),
        caption: 'Interruptor en b: el capacitor se descarga por $R$ y la corriente va al revés que al cargar.'
      },
      {
        type: 'concept', heading: 'Energía: la mitad se queda en el camino', short: 'Energía',
        body: [
          'Durante la carga completa, la batería mueve la carga $Q = C\\varepsilon$ a través de su voltaje $\\varepsilon$: entrega $W_{bat} = Q\\varepsilon = C\\varepsilon^2$. Pero el capacitor solo guarda $U_C = \\tfrac{1}{2}Q\\varepsilon$ (<a href="../sesion-10/">S10</a>). La otra mitad se volvió calor en el resistor.',
          'Compruébalo integrando la potencia del resistor, $P = i^2R$, durante toda la carga: $$\\int_0^\\infty i^2R\\,dt = \\frac{\\varepsilon^2}{R}\\int_0^\\infty e^{-2t/RC}\\,dt = \\frac{\\varepsilon^2}{R}\\cdot\\frac{RC}{2} = \\tfrac{1}{2}C\\varepsilon^2$$',
          'Lo sorprendente: <strong>la $R$ se cancela</strong>. Con un resistor chico la corriente es enorme pero dura poco; con uno grande es chica pero dura mucho. El área bajo $i^2R$ es la misma. Cargar un capacitor desde una batería siempre desperdicia la mitad de la energía.',
          'En la descarga no hay batería: toda la energía guardada, $\\tfrac{1}{2}CV_0^2$, termina como calor en $R$ (o como luz en el foco del flash).'
        ],
        diagram: 'f2s15-energy',
        caption: 'Potencia en el resistor durante la carga, con $R$ y con $3R$. Las dos áreas valen $\\tfrac{1}{2}C\\varepsilon^2$.'
      },
      {
        type: 'callout', heading: 'Circuitos RC de todos los días',
        body: [
          '<strong>Flash de cámara.</strong> Una pila chica carga un capacitor grande a través de una resistencia: tarda unos segundos (por eso el foquito de «listo»). El tiempo para llegar al voltaje de disparo es $t = -\\tau\\ln(1 - V/\\varepsilon)$. Luego se descarga por la lámpara, de resistencia muy baja, en una fracción de milisegundo.',
          '<strong>Desfibrilador.</strong> Un capacitor de decenas de μF se carga a miles de volts y se descarga a través del pecho del paciente. La resistencia del cuerpo fija un $\\tau$ de algunos milisegundos.',
          '<strong>Limpiaparabrisas intermitente.</strong> La perilla cambia $R$; con ella cambia $\\tau$ y el tiempo que tarda $V_C$ en llegar al voltaje que dispara el motor. Más $R$, más espera entre pasadas.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: un problema de circuito RC', short: 'Receta',
        steps: [
          { text: 'Decide si es <strong>carga</strong> (batería conectada, el capacitor empieza vacío) o <strong>descarga</strong> (sin batería, empieza con $Q_0 = CV_0$).', tip: 'Si no te dicen nada, al cerrar el interruptor el capacitor está descargado.' },
          { text: 'Calcula $\\tau = RC$ y cuida las unidades.', tip: '$\\text{k}\\Omega\\cdot\\mu\\text{F} = \\text{ms}$. Si pasas solo una de las dos a SI, te equivocas por un factor de 1000. Y es $R$ por $C$, no $R/C$.' },
          { text: 'Escribe la fórmula que toca. Carga: $q = C\\varepsilon(1 - e^{-t/\\tau})$, $V_C = \\varepsilon(1 - e^{-t/\\tau})$, $i = \\dfrac{\\varepsilon}{R}e^{-t/\\tau}$. Descarga: $q = Q_0e^{-t/\\tau}$, $V_C = V_0e^{-t/\\tau}$, $|i| = \\dfrac{V_0}{R}e^{-t/\\tau}$.', tip: 'El exponente siempre es negativo, y $t$ y $\\tau$ van en las mismas unidades. El «$1 -$» solo va en lo que se llena.' },
          { text: 'Si te piden un tiempo, despeja con logaritmo natural: carga $t = -\\tau\\ln(1 - V/\\varepsilon)$; descarga $t = \\tau\\ln(V_0/V)$.', tip: 'Es $\\ln$, no $\\log$: la exponencial es de base $e$.' },
          { text: 'Comprueba con los extremos ($t = 0$: cable; $t \\to \\infty$: rama abierta), con $V_C + V_R = \\varepsilon$ y, si hay energía, con «la mitad se guarda y la mitad se disipa».' }
        ]
      },
      {
        type: 'example', heading: 'Carga, corriente y voltajes en un instante',
        problem: '<p>Un capacitor de $' + e1.C + '\\ \\mu\\text{F}$, descargado, se conecta en serie con un resistor de $' + e1.R + '\\ \\text{k}\\Omega$ y una batería de $' + e1.e + '\\ \\text{V}$. Halla $\\tau$, la carga final, la corriente inicial y, en $t = ' + e1.t + '\\ \\text{ms}$, la carga, la corriente y los voltajes en $C$ y en $R$.</p>',
        diagram: 'f2s15-circuit', state: circ('a', e1.t / e1.tau),
        steps: [
          { text: 'Constante de tiempo, con $\\text{k}\\Omega\\cdot\\mu\\text{F} = \\text{ms}$.', math: '\\tau = RC = (' + e1.R + ')(' + e1.C + ') = ' + fx(e1.tau) + '\\ \\text{ms}' },
          { text: 'Los extremos: al final $q = C\\varepsilon$; al principio el capacitor es un cable, $I_0 = \\varepsilon/R$.', math: 'Q_f = (' + e1.C + ')(' + e1.e + ') = ' + fx(e1.Qf) + '\\ \\mu\\text{C}\\qquad I_0 = \\frac{' + e1.e + '}{' + e1.R + '} = ' + fx(e1.I0, 3) + '\\ \\text{mA}' },
          { text: 'El factor exponencial en $t = ' + e1.t + '$ ms:', math: 'e^{-t/\\tau} = e^{-' + e1.t + '/' + fx(e1.tau) + '} = ' + fx(e1.x, 4) },
          { text: 'Carga y corriente:', math: 'q = ' + fx(e1.Qf) + '(1 - ' + fx(e1.x, 4) + ') = ' + fx(e1.q) + '\\ \\mu\\text{C}\\qquad i = ' + fx(e1.I0, 3) + '(' + fx(e1.x, 4) + ') = ' + fx(e1.i, 3) + '\\ \\text{mA}' },
          { text: 'Voltajes: $V_C = q/C$ y $V_R = iR$. Suman los $' + e1.e + '$ V de la batería.', math: 'V_C = ' + fx(e1.VC) + '\\ \\text{V}\\qquad V_R = ' + fx(e1.VR) + '\\ \\text{V}' }
        ],
        answer: '$\\tau = ' + fx(e1.tau) + '$ ms, $Q_f = ' + fx(e1.Qf) + '\\ \\mu\\text{C}$, $I_0 = ' + fx(e1.I0) + '$ mA; en $' + e1.t + '$ ms, $q = ' + fx(e1.q) + '\\ \\mu\\text{C}$, $i = ' + fx(e1.i) + '$ mA, $V_C = ' + fx(e1.VC) + '$ V y $V_R = ' + fx(e1.VR) + '$ V.',
        verify: { lab: 'call', mod: 'rc', fn: 'charge', args: [e1.R, e1.C, e1.e, e1.t], values: { tau: e1.tau, Qf: e1.Qf, I0: e1.I0, q: e1.q, i: e1.i, VC: e1.VC, VR: e1.VR } }
      },
      {
        type: 'example', heading: 'Descarga a través de un resistor',
        problem: '<p>Un capacitor de $' + e2.C + '\\ \\mu\\text{F}$ cargado a $' + e2.V0 + '\\ \\text{V}$ se descarga a través de un resistor de $' + e2.R + '\\ \\text{k}\\Omega$. ¿Cuánta carga y qué voltaje le quedan después de $' + e2.t + '\\ \\text{ms}$? ¿Cuánta corriente pasa por el resistor en ese momento?</p>',
        diagram: 'f2s15-circuit', state: circ('b', e2.t / e2.tau),
        steps: [
          { text: 'Es una descarga: no hay batería y empieza con $Q_0 = CV_0$.', math: '\\tau = (' + e2.R + ')(' + e2.C + ') = ' + fx(e2.tau) + '\\ \\text{ms}\\qquad Q_0 = (' + e2.C + ')(' + e2.V0 + ') = ' + fx(e2.Q0) + '\\ \\mu\\text{C}' },
          { text: 'Sin el «$1 -$»: lo que queda decae.', math: 'q = ' + fx(e2.Q0) + '\\,e^{-' + e2.t + '/' + fx(e2.tau) + '} = ' + fx(e2.Q0) + '(' + fx(e2.x, 4) + ') = ' + fx(e2.q) + '\\ \\mu\\text{C}' },
          { text: 'Voltaje del capacitor:', math: 'V_C = \\frac{q}{C} = ' + fx(e2.VC) + '\\ \\text{V}' },
          { text: 'Sin batería, todo el voltaje del capacitor cae en $R$: $i = V_C/R$. Va al revés que cuando se cargó.', math: 'i = \\frac{' + fx(e2.VC) + '}{' + e2.R + '} = ' + fx(e2.i, 3) + '\\ \\text{mA}' }
        ],
        answer: '$q = ' + fx(e2.q) + '\\ \\mu\\text{C}$, $V_C = ' + fx(e2.VC) + '$ V y $i = ' + fx(e2.i, 3) + '$ mA (en sentido contrario al de la carga).',
        verify: { lab: 'call', mod: 'rc', fn: 'discharge', args: [e2.R, e2.C, e2.V0, e2.t], values: { tau: e2.tau, Q0: e2.Q0, q: e2.q, VC: e2.VC, iMag: e2.i } }
      },
      {
        type: 'example', heading: 'El flash: ¿cuánto tarda en estar listo?',
        problem: '<p>El circuito de un flash carga un capacitor de $' + e3.C + '\\ \\mu\\text{F}$ desde una fuente de $' + e3.e + '\\ \\text{V}$ a través de $' + e3.R + '\\ \\text{k}\\Omega$. El flash está listo cuando el capacitor llega a $' + e3.V + '\\ \\text{V}$. ¿Cuánto tarda, y cuánta energía tiene guardada en ese momento?</p>',
        steps: [
          { text: 'Constante de tiempo:', math: '\\tau = (' + e3.R + ')(' + e3.C + ') = ' + fx(e3.tau) + '\\ \\text{ms}' },
          { text: 'Plantea $V_C = \\varepsilon(1 - e^{-t/\\tau})$ y despeja la exponencial:', math: 'e^{-t/\\tau} = 1 - \\frac{V}{\\varepsilon} = 1 - \\frac{' + e3.V + '}{' + e3.e + '} = ' + fx(1 - e3.V / e3.e) },
          { text: 'Aplica $\\ln$ a los dos lados (el natural):', math: 't = -\\tau\\ln\\left(1 - \\frac{V}{\\varepsilon}\\right) = -(' + fx(e3.tau) + ')\\ln(' + fx(1 - e3.V / e3.e) + ') = ' + fx(e3.t, 1) + '\\ \\text{ms}' },
          { text: 'Llegar al 90 % siempre toma $\\tau\\ln 10 \\approx 2.3\\,\\tau$. La energía en ese momento:', math: 'U = \\tfrac{1}{2}CV^2 = \\tfrac{1}{2}(' + e3.C + '\\times 10^{-6})(' + e3.V + ')^2 = ' + fx(e3.U * 1e-6, 2) + '\\ \\text{J}' }
        ],
        answer: '$t = ' + fx(e3.t, 1) + '\\ \\text{ms} \\approx ' + fx(e3.t / 1000) + '$ s y $U = ' + fx(e3.U * 1e-6, 2) + '$ J.',
        verify: { lab: 'call', mod: 'rc', fn: 'timeTo', args: ['c', e3.R, e3.C, e3.e, e3.V], value: e3.t }
      },
      {
        type: 'example', heading: 'El balance de energía de una carga completa',
        problem: '<p>Un capacitor de $' + e4.C + '\\ \\mu\\text{F}$ se carga por completo con una batería de $' + e4.e + '\\ \\text{V}$ a través de un resistor. ¿Cuánta energía entrega la batería, cuánta queda en el capacitor y cuánta se disipa en el resistor? ¿Cambia algo si el resistor es de $1\\ \\text{k}\\Omega$ o de $100\\ \\text{k}\\Omega$?</p>',
        steps: [
          { text: 'Carga final y energía de la batería ($W = Q\\varepsilon$; μC × V = μJ):', math: 'Q = C\\varepsilon = ' + fx(e4.Q) + '\\ \\mu\\text{C}\\qquad W_{bat} = Q\\varepsilon = ' + fx(e4.Ub) + '\\ \\mu\\text{J} = ' + fx(e4.Ub / 1000) + '\\ \\text{mJ}' },
          { text: 'Lo que guarda el capacitor (S10):', math: 'U_C = \\tfrac{1}{2}Q\\varepsilon = ' + fx(e4.Uc / 1000) + '\\ \\text{mJ}' },
          { text: 'El resto se volvió calor en $R$:', math: 'W_R = W_{bat} - U_C = ' + fx(e4.Ur / 1000) + '\\ \\text{mJ}' },
          { text: 'Con $1\\ \\text{k}\\Omega$ la carga dura unos $5\\tau = 0.5$ s con corriente grande; con $100\\ \\text{k}\\Omega$ dura unos 50 s con corriente chica. El calor total es el mismo, porque $\\int i^2R\\,dt = \\tfrac{1}{2}C\\varepsilon^2$ no depende de $R$.' }
        ],
        answer: 'La batería entrega $' + fx(e4.Ub / 1000) + '$ mJ; el capacitor guarda $' + fx(e4.Uc / 1000) + '$ mJ y el resistor disipa $' + fx(e4.Ur / 1000) + '$ mJ, sin importar $R$.',
        verify: { lab: 'call', mod: 'rc', fn: 'fullCharge', args: [e4.C, e4.e], values: { Q: e4.Q, Ubat: e4.Ub, Uc: e4.Uc, Ur: e4.Ur } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿El capacitor llega a llenarse por completo?', a: 'En las matemáticas, nunca: $e^{-t/\\tau}$ nunca llega a cero. En la práctica, después de $5\\tau$ ya tiene más de 99 %, y nadie distingue la diferencia. Por eso la regla de las $5\\tau$.' },
          { q: '¿Por qué la corriente es máxima justo al cerrar el interruptor?', a: 'Porque el capacitor vacío no tiene voltaje ($V_C = q/C = 0$): todo $\\varepsilon$ cae en el resistor y $i = \\varepsilon/R$. Conforme se carga, $V_C$ le quita voltaje a $R$ y la corriente baja.' },
          { q: '¿La corriente atraviesa el capacitor?', a: 'No. Entre las placas hay un aislante. La corriente circula por los cables: llegan cargas a una placa y salen de la otra, así que el amperímetro marca lo mismo de los dos lados, pero ninguna carga cruza el hueco.' },
          { q: '¿Si aumento el voltaje de la batería se carga más rápido?', a: 'Se carga a un valor más alto, pero en el mismo tiempo: $\\tau = RC$ no depende de $\\varepsilon$. En $\\tau$ siempre lleva 63 %, sea de 5 V o de 500 V.' },
          { q: '¿Por qué se pierde la mitad de la energía aunque la resistencia sea casi cero?', a: 'Con $R$ muy chica la corriente es enorme durante muy poco tiempo, y $\\int i^2R\\,dt$ sigue valiendo $\\tfrac{1}{2}C\\varepsilon^2$. Ese calor aparece en los cables, en la resistencia interna de la batería y hasta como chispa. No hay forma de evitarlo cargando directo de una batería.' },
          { q: '¿Uso $\\ln$ o $\\log$ para despejar el tiempo?', a: 'Logaritmo natural, $\\ln$, porque la exponencial es $e^{-t/\\tau}$. En la calculadora es la tecla «ln». Con «log» (base 10) el tiempo sale 2.3 veces más chico.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Al cerrar, el capacitor vacío es un cable ($i = \\varepsilon/R$); al final, una rama abierta ($i = 0$, $V_C = \\varepsilon$). Kirchhoff con $i = dq/dt$ da $R\\,\\dfrac{dq}{dt} + \\dfrac{q}{C} = \\varepsilon$.',
          'Separando variables: carga $q = C\\varepsilon(1 - e^{-t/\\tau})$; descarga $q = Q_0e^{-t/\\tau}$; la corriente decae como $e^{-t/\\tau}$ en los dos casos (al revés en la descarga).',
          '$\\tau = RC$: 63 % en $\\tau$, más de 99 % en $5\\tau$; $\\text{k}\\Omega\\cdot\\mu\\text{F} = \\text{ms}$. Para un voltaje: $t = -\\tau\\ln(1 - V/\\varepsilon)$ al cargar y $t = \\tau\\ln(V_0/V)$ al descargar.',
          'Energía de una carga completa: la batería entrega $C\\varepsilon^2$, el capacitor guarda $\\tfrac{1}{2}C\\varepsilon^2$ y la otra mitad se disipa en $R$, sin importar cuánto valga $R$.'
        ]
      }
    ],

    lab: {
      type: 'rc-circuit', title: 'Curvas de carga y descarga',
      intro: 'Mueve $R$, $C$ y $\\varepsilon$, y recorre el tiempo con el cursor (o anímalo desde $t = 0$): ves el capacitor llenarse, la corriente apagarse y las curvas $V_C$, $V_R$, $q$ o $i$ con $\\tau$, $2\\tau$… marcados. El tablero lleva la cuenta de la energía entregada, guardada y disipada, y compara la carga con un integrador RK4 de la EDO. En el reto calculas $\\tau$, la carga o la corriente en el instante del cursor, o el tiempo para llegar a un voltaje; el lab te avisa si usaste $R/C$, si el exponente quedó positivo, si olvidaste el «$1 -$», si usaste $\\log$ en lugar de $\\ln$, si se te pasó un prefijo o si diste la corriente máxima.',
      cfg: { start: { mode: 'c', R: 10, C: 100, eps: 12, k: 1, kind: 'q' } }
    },

    formulas: [
      { label: 'Ecuación del circuito', tex: 'R\\,\\frac{dq}{dt} + \\frac{q}{C} = \\varepsilon' },
      { label: 'Constante de tiempo', tex: '\\tau = RC' },
      { label: 'Carga', tex: 'q = C\\varepsilon\\left(1 - e^{-t/\\tau}\\right)' },
      { label: 'Descarga', tex: 'q = Q_0\\,e^{-t/\\tau}' },
      { label: 'Corriente', tex: '|i| = \\frac{V_0}{R}\\,e^{-t/\\tau}' },
      { label: 'Tiempo para un voltaje', tex: 't = -\\tau\\ln\\left(1 - \\frac{V}{\\varepsilon}\\right)' },
      { label: 'Energía (carga completa)', tex: 'W_{bat} = C\\varepsilon^2,\\quad U_C = W_R = \\tfrac{1}{2}C\\varepsilon^2' }
    ],

    exercises: [
      {
        id: 'f2-s15-tau', title: 'La constante de tiempo',
        vars: { R: [1, 100, 1], C: [10, 470, 10] },
        prompt: function (v) { return '<p>Un circuito RC tiene un resistor de $' + v.R + '\\ \\text{k}\\Omega$ y un capacitor de $' + v.C + '\\ \\mu\\text{F}$. ¿Cuánto vale su constante de tiempo, en ms?</p>'; },
        check: 'numeric', unit: 'ms',
        answer: function (v) { return v.R * v.C; },
        mistakes: {
          RoverC: function (v) { return v.R / v.C; },
          sec: function (v) { return v.R * v.C / 1000; }
        },
        feedback: [
          { when: 'RoverC', say: 'La constante de tiempo es $\\tau = RC$: multiplica, no dividas.' },
          { when: 'sec', say: 'Ese número está en segundos. Con $\\text{k}\\Omega$ y $\\mu\\text{F}$, el producto ya sale en ms.' }
        ],
        // Otra ruta: pasar todo a SI (Ω y F), multiplicar y regresar a ms.
        oracle: { lab: 'value', value: function (v) { return (v.R * 1e3) * (v.C * 1e-6) * 1e3; } },
        hint: '$\\tau = RC$ y $\\text{k}\\Omega\\cdot\\mu\\text{F} = 10^{3}\\cdot 10^{-6}\\ \\text{s} = \\text{ms}$.',
        solution: function (v) { return '$$\\tau = RC = (' + v.R + '\\ \\text{k}\\Omega)(' + v.C + '\\ \\mu\\text{F}) = ' + (v.R * v.C) + '\\ \\text{ms} = ' + fx(v.R * v.C / 1000, 3) + '\\ \\text{s}$$'; }
      },
      {
        id: 'f2-s15-carga', title: 'Carga en un instante',
        vars: { R: [1, 50, 1], C: [10, 200, 10], e: [3, 24, 1], m: [0.3, 3, 0.1] },
        prompt: function (v) { return '<p>Un capacitor de $' + v.C + '\\ \\mu\\text{F}$, descargado, se conecta en serie con un resistor de $' + v.R + '\\ \\text{k}\\Omega$ y una batería de $' + v.e + '\\ \\text{V}$. ¿Cuánta carga tiene $' + tOf(v) + '\\ \\text{ms}$ después de cerrar el interruptor, en μC?</p>'; },
        diagram: { id: 'f2s15-circuit', state: function (v) { return circ('a', tOf(v) / (v.R * v.C)); } },
        check: 'numeric', unit: 'μC',
        answer: function (v) { return v.C * v.e * (1 - Math.exp(-tOf(v) / (v.R * v.C))); },
        mistakes: {
          noOne: function (v) { return v.C * v.e * Math.exp(-tOf(v) / (v.R * v.C)); },
          plusExp: function (v) { return v.C * v.e * (1 - Math.exp(tOf(v) / (v.R * v.C))); },
          final: function (v) { return v.C * v.e; }
        },
        feedback: [
          { when: 'noOne', say: 'Te faltó el «$1 -$»: $C\\varepsilon\\,e^{-t/\\tau}$ es lo que <strong>falta</strong> por llenar (o la descarga). Al cargar, $q = C\\varepsilon(1 - e^{-t/\\tau})$.' },
          { when: 'plusExp', say: 'El exponente es negativo: $e^{-t/\\tau}$. Con $e^{+t/\\tau}$ la carga sale negativa.' },
          { when: 'final', say: 'Esa es la carga final, $C\\varepsilon$. A ese tiempo todavía no llega (¿usaste $\\tau = R/C$?).' }
        ],
        oracle: { lab: 'value', value: function (v) { return RC().rk4('c', v.R, v.C, v.e, tOf(v), 4000).q; } },
        hint: '$\\tau = RC$ (en ms) y $q = C\\varepsilon\\left(1 - e^{-t/\\tau}\\right)$; μF × V = μC.',
        solution: function (v) {
          var T = v.R * v.C, t = tOf(v), x = Math.exp(-t / T);
          return '$\\tau = (' + v.R + ')(' + v.C + ') = ' + T + '\\ \\text{ms}$ y $C\\varepsilon = ' + (v.C * v.e) + '\\ \\mu\\text{C}$. $$q = ' + (v.C * v.e) + '\\left(1 - e^{-' + t + '/' + T + '}\\right) = ' + (v.C * v.e) + '(1 - ' + fx(x, 4) + ') = ' + fx(v.C * v.e * (1 - x)) + '\\ \\mu\\text{C}$$';
        }
      },
      {
        id: 'f2-s15-corriente', title: 'Corriente durante la carga',
        vars: { R: [1, 50, 1], C: [10, 200, 10], e: [3, 24, 1], m: [0.3, 3, 0.1] },
        prompt: function (v) { return '<p>Un capacitor de $' + v.C + '\\ \\mu\\text{F}$, descargado, se carga a través de un resistor de $' + v.R + '\\ \\text{k}\\Omega$ con una batería de $' + v.e + '\\ \\text{V}$. ¿Cuánta corriente pasa por el resistor $' + tOf(v) + '\\ \\text{ms}$ después de cerrar el interruptor, en mA?</p>'; },
        check: 'numeric', unit: 'mA',
        baseWhere: function (v) { return v.e / v.R >= 0.5; },
        answer: function (v) { return v.e / v.R * Math.exp(-tOf(v) / (v.R * v.C)); },
        mistakes: {
          noDecay: function (v) { return v.e / v.R; },
          wrongV: function (v) { return v.e / v.R * (1 - Math.exp(-tOf(v) / (v.R * v.C))); },
          plusExp: function (v) { return v.e / v.R * Math.exp(tOf(v) / (v.R * v.C)); }
        },
        feedback: [
          { when: 'noDecay', say: 'Esa es la corriente inicial, $\\varepsilon/R$, cuando el capacitor vacío se porta como un cable. Después decae: $i = (\\varepsilon/R)e^{-t/\\tau}$.' },
          { when: 'wrongV', say: 'Usaste el voltaje del capacitor. La corriente la fija el voltaje del <strong>resistor</strong>, $V_R = \\varepsilon e^{-t/\\tau}$: $i = V_R/R$.' },
          { when: 'plusExp', say: 'El exponente es negativo: la corriente decae, no crece.' }
        ],
        oracle: { lab: 'value', value: function (v) { return RC().rk4('c', v.R, v.C, v.e, tOf(v), 4000).i; } },
        hint: 'Empieza en $I_0 = \\varepsilon/R$ (V/kΩ = mA) y decae: $i = I_0\\,e^{-t/\\tau}$.',
        solution: function (v) {
          var T = v.R * v.C, t = tOf(v), x = Math.exp(-t / T);
          return '$I_0 = ' + v.e + '/' + v.R + ' = ' + fx(v.e / v.R, 4) + '\\ \\text{mA}$ y $\\tau = ' + T + '\\ \\text{ms}$. $$i = ' + fx(v.e / v.R, 4) + '\\,e^{-' + t + '/' + T + '} = ' + fx(v.e / v.R * x) + '\\ \\text{mA}$$';
        }
      },
      {
        id: 'f2-s15-tiempo', title: 'Tiempo para llegar a un voltaje',
        vars: { R: [1, 50, 1], C: [10, 200, 10], e: [6, 24, 2], p: [50, 95, 5] },
        prompt: function (v) { return '<p>Un capacitor de $' + v.C + '\\ \\mu\\text{F}$, descargado, se carga a través de $' + v.R + '\\ \\text{k}\\Omega$ con una batería de $' + v.e + '\\ \\text{V}$. ¿Cuánto tarda su voltaje en llegar a $' + fx(v.p * v.e / 100) + '\\ \\text{V}$ (el $' + v.p + '\\ \\%$ de $\\varepsilon$), en ms?</p>'; },
        check: 'numeric', unit: 'ms',
        answer: function (v) { return -v.R * v.C * Math.log(1 - v.p / 100); },
        mistakes: {
          log10: function (v) { return -v.R * v.C * Math.log10(1 - v.p / 100); },
          noOne: function (v) { return -v.R * v.C * Math.log(v.p / 100); },
          sec: function (v) { return -v.R * v.C * Math.log(1 - v.p / 100) / 1000; }
        },
        feedback: [
          { when: 'log10', say: 'Usaste $\\log$ (base 10). La exponencial es de base $e$: despeja con $\\ln$.' },
          { when: 'noOne', say: 'Te faltó el «$1 -$»: de $V = \\varepsilon(1 - e^{-t/\\tau})$ sale $e^{-t/\\tau} = 1 - V/\\varepsilon$.' },
          { when: 'sec', say: 'Ese número está en segundos; se pide en ms ($\\text{k}\\Omega\\cdot\\mu\\text{F} = \\text{ms}$).' }
        ],
        oracle: { lab: 'value', value: function (v) { return rkTime('c', v.R, v.C, v.e, v.p * v.e / 100); } },
        hint: 'De $V = \\varepsilon(1 - e^{-t/\\tau})$: $t = -\\tau\\ln(1 - V/\\varepsilon)$.',
        solution: function (v) {
          var T = v.R * v.C, r = 1 - v.p / 100;
          return '$\\tau = ' + T + '\\ \\text{ms}$ y $1 - V/\\varepsilon = ' + fx(r) + '$. $$t = -\\tau\\ln(1 - V/\\varepsilon) = -(' + T + ')\\ln(' + fx(r) + ') = ' + fx(-T * Math.log(r)) + '\\ \\text{ms}$$';
        }
      },
      {
        id: 'f2-s15-descarga', title: 'Voltaje durante la descarga',
        vars: { R: [1, 50, 1], C: [10, 200, 10], V0: [6, 48, 2], m: [0.3, 3, 0.1] },
        prompt: function (v) { return '<p>Un capacitor de $' + v.C + '\\ \\mu\\text{F}$ cargado a $' + v.V0 + '\\ \\text{V}$ se descarga a través de un resistor de $' + v.R + '\\ \\text{k}\\Omega$. ¿Qué voltaje tiene $' + tOf(v) + '\\ \\text{ms}$ después, en volts?</p>'; },
        diagram: { id: 'f2s15-circuit', state: function (v) { return circ('b', tOf(v) / (v.R * v.C)); } },
        check: 'numeric', unit: 'V',
        answer: function (v) { return v.V0 * Math.exp(-tOf(v) / (v.R * v.C)); },
        mistakes: {
          oneMinus: function (v) { return v.V0 * (1 - Math.exp(-tOf(v) / (v.R * v.C))); },
          RoverC: function (v) { return v.V0 * Math.exp(-tOf(v) / (v.R / v.C)); }
        },
        feedback: [
          { when: 'oneMinus', say: 'Esa es la fórmula de la carga. Al descargar, lo que queda decae: $V_C = V_0\\,e^{-t/\\tau}$, sin el «$1 -$».' },
          { when: 'RoverC', say: 'Usaste $\\tau = R/C$; es $\\tau = RC$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return RC().rk4('d', v.R, v.C, v.V0, tOf(v), 4000).VC; } },
        hint: 'Descarga: $V_C = V_0\\,e^{-t/\\tau}$ con $\\tau = RC$.',
        solution: function (v) {
          var T = v.R * v.C, t = tOf(v);
          return '$\\tau = ' + T + '\\ \\text{ms}$. $$V_C = ' + v.V0 + '\\,e^{-' + t + '/' + T + '} = ' + fx(v.V0 * Math.exp(-t / T)) + '\\ \\text{V}$$';
        }
      },
      {
        id: 'f2-s15-energia', title: 'Energía disipada en la carga',
        vars: { R: [1, 100, 1], C: [10, 470, 10], e: [3, 48, 1] },
        prompt: function (v) { return '<p>Un capacitor de $' + v.C + '\\ \\mu\\text{F}$, descargado, se carga por completo con una batería de $' + v.e + '\\ \\text{V}$ a través de un resistor de $' + v.R + '\\ \\text{k}\\Omega$. ¿Cuánta energía se disipa en el resistor durante toda la carga, en mJ?</p>'; },
        check: 'numeric', unit: 'mJ',
        answer: function (v) { return 0.5 * v.C * v.e * v.e / 1000; },
        mistakes: {
          noHalf: function (v) { return v.C * v.e * v.e / 1000; },
          uJ: function (v) { return 0.5 * v.C * v.e * v.e; }
        },
        feedback: [
          { when: 'noHalf', say: 'Esa es toda la energía que entrega la batería, $C\\varepsilon^2$. El capacitor se queda con la mitad; al resistor le toca la otra mitad.' },
          { when: 'uJ', say: 'Ese número está en μJ (μF × V² = μJ). Divide entre 1000 para pasarlo a mJ.' }
        ],
        // Otra ruta: integrar i²R con el RK4 hasta 40τ (la R no se cancela a mano).
        oracle: { lab: 'value', value: function (v) { return RC().rk4('c', v.R, v.C, v.e, 40 * v.R * v.C, 8000).Wr / 1000; } },
        hint: 'La batería entrega $Q\\varepsilon = C\\varepsilon^2$ y el capacitor guarda $\\tfrac{1}{2}C\\varepsilon^2$. El dato de $R$ no hace falta.',
        solution: function (v) { var U = 0.5 * v.C * v.e * v.e; return 'No depende de $R$: $$W_R = \\tfrac{1}{2}C\\varepsilon^2 = \\tfrac{1}{2}(' + v.C + ')(' + v.e + ')^2 = ' + fx(U) + '\\ \\mu\\text{J} = ' + fx(U / 1000, 4) + '\\ \\text{mJ}$$'; }
      },
      {
        id: 'f2-s15-duplica', title: 'Concepto: duplicar R y C',
        vars: {},
        prompt: function () { return '<p>En un circuito RC duplicas la resistencia <strong>y también</strong> la capacitancia, con la misma batería. ¿Qué pasa con la constante de tiempo?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Se hace 4 veces más grande', correct: true },
            { text: 'Se duplica', say: '$\\tau = RC$ es un producto: si los dos factores se duplican, el producto se multiplica por $2 \\times 2 = 4$.' },
            { text: 'No cambia, porque los dos efectos se cancelan', say: 'Se cancelarían si fuera $R/C$. Más $R$ y más $C$ <strong>los dos</strong> hacen más lenta la carga.' },
            { text: 'Depende del voltaje de la batería', say: '$\\tau = RC$ no depende de $\\varepsilon$: la batería solo cambia hasta dónde llega la carga.' }
          ];
        },
        answer: function () { return 'Se hace 4 veces más grande'; },
        hint: '$\\tau = RC$. ¿Qué le pasa a un producto si duplicas los dos factores?',
        solution: function () { return '$\\tau\' = (2R)(2C) = 4RC = 4\\tau$: el circuito tarda 4 veces más en cargarse (o descargarse).'; }
      }
    ],

    quiz: { tags: ['f2.S15'], count: 8 },

    errors: [
      'Calcular $\\tau = R/C$ en lugar de $\\tau = RC$.',
      'Mezclar prefijos: con kΩ y μF, $RC$ sale en ms; si pasas solo uno a SI, el resultado se descuadra 1000 veces.',
      'Escribir el exponente positivo, $e^{+t/\\tau}$: en un circuito RC todo se acerca a su valor final, nada crece sin límite.',
      'Poner el «$1 -$» donde no va (en la corriente o en la descarga) o quitarlo donde sí va (carga y $V_C$ al cargar).',
      'Despejar el tiempo con $\\log$ (base 10) en lugar de $\\ln$.',
      'Usar la corriente inicial $\\varepsilon/R$ en todo momento, o calcular la corriente con el voltaje del capacitor en vez del del resistor.',
      'Decir que la energía disipada depende de $R$: en una carga completa siempre es $\\tfrac{1}{2}C\\varepsilon^2$.'
    ],

    teacher: {
      plan: [
        'Arranca con el explainer del interruptor: los dos extremos (cable al inicio, rama abierta al final) ya los conocen de la S14. La pregunta es qué pasa en medio.',
        'Kirchhoff en la malla con $i = dq/dt$ y el recuadro «EDO en 5 minutos»: que vean el campo de pendientes antes de integrar, y que comprueben la solución derivándola.',
        'Constante de tiempo con la tabla de 63, 86, 95, 98 y 99 %, unidades ($\\text{k}\\Omega\\cdot\\mu\\text{F} = \\text{ms}$) y la descarga. Ejemplos 1 a 3, luego el lab con el cursor de tiempo y la animación.',
        'Cierra con el balance de energía: que integren $i^2R$ y descubran que $R$ se cancela; compruébalo en el tablero del lab con dos valores de $R$ muy distintos.'
      ],
      check: [
        'Que distingan qué lleva «$1 -$» (carga y $V_C$ al cargar) y qué no (corriente, $V_R$, descarga).',
        'Que comprueben con los extremos $t = 0$ y $t \\to \\infty$, con $V_C + V_R = \\varepsilon$ y con las unidades de $\\tau$.'
      ],
      note: 'Es la última sesión del curso. La EDO de primer orden vuelve con todo en Cálculo 3 (ecuaciones diferenciales) y el circuito RL, con la misma forma y $\\tau = L/R$, en Física 3.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §10.5 “RC Circuits”. <a href="https://openstax.org/books/university-physics-volume-2/pages/10-5-rc-circuits">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §8.3 “Energy Stored in a Capacitor”. <a href="https://openstax.org/books/university-physics-volume-2/pages/8-3-energy-stored-in-a-capacitor">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-14',
    next: null
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
