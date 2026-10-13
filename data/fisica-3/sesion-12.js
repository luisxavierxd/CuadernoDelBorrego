/* =====================================================================
   Física 3 · S12 · Ley de Lenz, forma general de la ley de Faraday y generadores
   (bloque C · Inducción).
   Fuentes: OpenStax, University Physics Volume 2, §13.2, §13.4 y §13.6 (CC BY-NC-SA 4.0).
   Convención: espira en la página vista de frente; B > 0 sale (⊙). ε = −dΦ/dt > 0 ↔ antihoraria.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.lenz (lab lenz-direction).
   ===================================================================== */
(function () {
  var TAU = 2 * Math.PI;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function LZ() { return window.LabMath.lenz; }
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
  // Sentido inducido en un campo uniforme: out = +1 si sale; up = +1 si crece.
  function sense(out, up) { var indOut = out !== up; return { Bind: indOut ? 'sale' : 'entra', cur: indOut ? 'Antihoraria' : 'Horaria' }; }

  // Ejemplo 1: campo que entra y disminuye.
  var e1 = { sc: 'field', p: { a: 5, dir: -1, change: -1, B0: 0.5, k: 0.4 }, t: 0.3 };
  // Ejemplo 2: región de R = 4.0 cm con dB/dt = 1.5 T/s; puntos a 2.0 cm y 10 cm.
  var e2 = { R: 0.04, r1: 0.02, r2: 0.10, dB: 1.5 };
  e2.E1 = e2.r1 * e2.dB / 2; e2.E2 = e2.R * e2.R * e2.dB / (2 * e2.r2); e2.emf2 = Math.PI * e2.R * e2.R * e2.dB;
  // Ejemplo 3: generador de 150 vueltas de 10 cm × 20 cm en 0.25 T a 60 Hz; t = 1.0 ms.
  var e3 = { N: 150, A: 0.020, B: 0.25, f: 60, t: 0.001 };
  e3.w = TAU * e3.f; e3.peak = e3.N * e3.B * e3.A * e3.w; e3.emf = e3.peak * Math.sin(e3.w * e3.t);
  // Ejemplo 4: electrón a 6.0 cm del centro de una región de 10 cm con dB/dt = 50 T/s.
  var e4 = { R: 0.10, r: 0.06, dB: 50 };
  e4.E = e4.r * e4.dB / 2; e4.F = 1.60e-19 * e4.E; e4.a = e4.F / 9.11e-31;

  var CASES = [[true, true], [true, false], [false, true], [false, false]];

  var data = window.SESSION_DATA = {
    slug: 'sesion-12', number: '12', group: 'C · Inducción',
    title: 'Ley de Lenz, forma general de la ley de Faraday y generadores', temario: [],
    minutes: 120,
    quote: 'La corriente inducida siempre lleva la contraria: produce un campo que se opone al cambio del flujo que la creó.',
    badges: [
      'Usar la ley de Lenz para hallar el sentido de la corriente inducida y del campo que produce.',
      'Explicar por qué el signo menos de la ley de Faraday es una consecuencia de la conservación de la energía.',
      'Calcular el campo eléctrico inducido con $\\oint \\vec E\\cdot d\\vec l = -d\\Phi_B/dt$ en una región circular.',
      'Calcular la fem de un generador, $\\varepsilon = NBA\\omega\\sin\\omega t$, su valor máximo y su valor en un instante.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'En la <a href="../sesion-11/">S11</a> calculamos cuánto vale la fem inducida. Hoy contestamos <strong>hacia dónde</strong> circula la corriente: la ley de Lenz. Y vemos que un flujo que cambia crea un <strong>campo eléctrico</strong> aunque no haya alambre.',
        recall: [
          'Ley de Faraday: $\\varepsilon = -N\\,d\\Phi/dt$ y flujo $\\Phi = BA\\cos\\theta$ (<a href="../sesion-11/">S11</a>).',
          'Campo de una espira con corriente y la regla de la mano derecha (<a href="../sesion-06/">S06</a>).',
          'Potencial y campo conservativo: $\\oint \\vec E\\cdot d\\vec l = 0$ para el campo de cargas en reposo (<a href="../../../fisica-2/sesiones/sesion-05/">Física 2 · S05</a>).'
        ],
        why: 'El sentido de la corriente inducida explica por qué un imán cae despacio por un tubo de cobre, por qué frena un tren magnético y por qué un motor se calienta si lo bloqueas. Y la forma general de Faraday es la base del generador que produce casi toda la electricidad que usas.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Suelta un imán dentro de un tubo de cobre. El cobre no es atraído por los imanes, y aun así el imán baja <strong>muy despacio</strong>, como si cayera en miel.',
          'Mientras cae, el flujo cambia en cada anillo del tubo y se inducen corrientes. Esas corrientes producen campos que empujan al imán hacia arriba por debajo y lo jalan hacia arriba por encima: <strong>se oponen al movimiento</strong> que las creó.',
          'Esa “terquedad” es la ley de Lenz. Si fuera al revés y las corrientes ayudaran al imán a caer más rápido, tendrías energía gratis.'
        ]
      },
      {
        type: 'explainer', heading: 'El imán y la espira', short: 'Imán y espira',
        title: 'La espira se opone al cambio',
        intro: 'Un imán con su polo N hacia una espira de cobre. Mira hacia dónde apunta el campo inducido y qué le hace la espira al imán.',
        diagram: 'f3s12-lenz',
        steps: [
          { text: 'El imán está quieto. El flujo por la espira no cambia: no hay corriente.', state: { m: 0.3, v: 0, ind: 0 } },
          { text: 'Acercas el imán. El campo del imán en la espira apunta a la derecha y <strong>crece</strong>. La corriente inducida produce un campo hacia la izquierda, que se opone al aumento.', state: { m: 0.6, v: 1, ind: 1 } },
          { text: 'Con ese campo, la espira se porta como un imán con su cara N hacia el imán: lo <strong>repele</strong>. Para acercar el imán tienes que empujar, y ese trabajo es la energía que se disipa en la espira.', state: { m: 0.85, v: 1, ind: 1 } },
          { text: 'Ahora lo alejas. El flujo <strong>decrece</strong>, y el campo inducido apunta a la derecha, igual que el del imán, para “sostener” el flujo. La espira presenta una cara S y <strong>atrae</strong> al imán: otra vez se opone al movimiento.', state: { m: 0.5, v: -1, ind: 1 } }
        ]
      },
      {
        type: 'concept', heading: 'Ley de Lenz', short: 'Ley de Lenz',
        body: [
          '<strong>La corriente inducida circula en el sentido que produce un campo magnético que se opone al cambio del flujo.</strong> Es el signo menos de $\\varepsilon = -N\\,d\\Phi/dt$.',
          'Ojo: se opone al <strong>cambio</strong>, no al campo. Si el flujo crece, el campo inducido apunta al revés que el externo. Si el flujo decrece, apunta igual que el externo.',
          'Una vez que sabes hacia dónde apunta el campo inducido en el centro de la espira, la corriente sale con la <strong>regla de la mano derecha</strong>: el pulgar en el sentido del campo inducido y los dedos te dan el sentido de la corriente. Vista de frente, antihoraria produce un campo que sale; horaria, uno que entra.'
        ],
        diagram: 'f3s12-rhr',
        caption: 'Regla de la mano derecha para una espira: el sentido de la corriente decide si el campo en el centro sale o entra.'
      },
      {
        type: 'concept', heading: 'Los cuatro casos', short: 'Cuatro casos',
        body: [
          'Con un campo perpendicular a la página solo hay cuatro posibilidades. Haz siempre las mismas tres preguntas: <strong>(1)</strong> ¿hacia dónde apunta el campo externo? <strong>(2)</strong> ¿el flujo crece o decrece? <strong>(3)</strong> el campo inducido se opone al cambio; ¿qué corriente lo produce?',
          'Si nada cambia (el campo es constante y la espira no se mueve ni gira), la respuesta es más sencilla: no hay corriente.'
        ],
        diagram: 'f3s12-cases',
        caption: 'Si el flujo crece, el campo inducido va al revés del externo; si decrece, va igual.'
      },
      {
        type: 'concept', heading: 'Lenz es conservación de la energía', short: 'Energía',
        body: [
          'Imagina que la corriente inducida produjera un campo que <strong>ayudara</strong> al cambio. Al acercar el imán, la espira lo atraería; el imán se aceleraría solo, el flujo crecería más rápido, la corriente sería mayor y lo atraería todavía más. Saldría energía de la nada.',
          'Por eso el signo menos no es un detalle: la oposición garantiza que para inducir corriente <strong>alguien tenga que hacer trabajo</strong> (empujar el imán, mover la barra de la S11 o girar el generador). Ese trabajo es la energía eléctrica que se obtiene.'
        ]
      },
      {
        type: 'concept', heading: 'Forma general: el campo eléctrico inducido', short: 'Campo E inducido',
        body: [
          'La fem es trabajo por unidad de carga a lo largo del circuito. En una espira quieta, ¿quién empuja las cargas? Un <strong>campo eléctrico inducido</strong>. La ley de Faraday se escribe entonces como $$\\oint \\vec E\\cdot d\\vec l = -\\frac{d\\Phi_B}{dt}$$ y vale para cualquier camino cerrado, haya o no alambre.',
          'Este campo es distinto del de las cargas: sus líneas <strong>se cierran</strong> sobre sí mismas, así que $\\oint \\vec E\\cdot d\\vec l \\neq 0$ y no se puede describir con un potencial.',
          'En una región circular de radio $R$ con un campo uniforme que cambia (como dentro de un solenoide largo), por simetría $\\vec E$ es tangente a círculos. En un círculo de radio $r$: $E\\,(2\\pi r) = \\pi r^2\\,\\dfrac{dB}{dt}$ si $r < R$, y $E\\,(2\\pi r) = \\pi R^2\\,\\dfrac{dB}{dt}$ si $r > R$: $$E = \\frac{r}{2}\\left|\\frac{dB}{dt}\\right|\\ (r < R) \\qquad E = \\frac{R^2}{2r}\\left|\\frac{dB}{dt}\\right|\\ (r > R)$$'
        ],
        diagram: 'f3s12-efield',
        caption: 'Las líneas del campo eléctrico inducido son círculos cerrados; $E$ crece con $r$ adentro y baja como $1/r$ afuera.'
      },
      {
        type: 'explainer', heading: 'El generador', short: 'Generador',
        title: 'Una bobina que gira en un campo',
        intro: 'Una bobina de $N$ vueltas y área $A$ gira con rapidez angular $\\omega$ en un campo uniforme $B$. Su normal forma un ángulo $\\theta = \\omega t$ con $\\vec B$, así que el flujo por vuelta es $\\Phi = BA\\cos\\omega t$.',
        diagram: 'f3s12-generator',
        steps: [
          { text: 'En $\\omega t = 0$ la normal es paralela a $\\vec B$: el flujo es máximo, pero en ese instante <strong>no cambia</strong> (está en su pico). La fem vale cero.', state: { wt: 0 } },
          { text: 'Deriva $\\Phi = BA\\cos\\omega t$: $$\\varepsilon = -N\\frac{d\\Phi}{dt} = NBA\\omega\\sin\\omega t$$ En $\\omega t = 90^\\circ$ el plano de la bobina es paralelo a $\\vec B$, el flujo es cero y cambia lo más rápido posible: la fem es máxima, $\\varepsilon_{\\max} = NBA\\omega$.', state: { wt: 90 } },
          { text: 'En $\\omega t = 180^\\circ$ el flujo es máximo otra vez (con la normal al revés) y la fem vuelve a cero.', state: { wt: 180 } },
          { text: 'En $\\omega t = 270^\\circ$ la fem es máxima pero negativa: la corriente va al revés. El resultado es una <strong>corriente alterna</strong> de frecuencia $f = \\omega/2\\pi$.', state: { wt: 270 } }
        ]
      },
      {
        type: 'callout', heading: 'La fem inversa de un motor',
        body: [
          'Un motor es un generador al revés: le das corriente y gira. Pero al girar, su bobina también corta flujo y se induce una fem que, por Lenz, <strong>se opone</strong> a la de la fuente: la fem inversa. Al arrancar, el motor está quieto, no hay fem inversa y la corriente es muy grande; conforme acelera, la fem inversa crece y la corriente baja. Si bloqueas el motor, la corriente se queda grande y el motor se calienta.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: el sentido de la corriente inducida', short: 'Receta',
        steps: [
          { text: 'Dibuja el campo externo en la espira: ¿sale (⊙) o entra (⊗)?' },
          { text: 'Decide qué le pasa al flujo: ¿crece, decrece o no cambia? Mira $B$, el área dentro del campo y el ángulo.', tip: 'Si no cambia nada, no hay corriente: no sigas.' },
          { text: 'El campo inducido se opone al <strong>cambio</strong>: si el flujo crece, apunta al revés del externo; si decrece, igual que el externo.', tip: 'El error más común es ponerlo siempre contra el campo externo.' },
          { text: 'Con la mano derecha, pulgar en el sentido del campo inducido: los dedos dan la corriente. Vista de frente: sale → antihoraria; entra → horaria.' },
          { text: 'Comprueba con la energía: la fuerza sobre la espira (o sobre el imán) debe oponerse al movimiento.' }
        ]
      },
      {
        type: 'example', heading: 'El sentido en un campo que disminuye',
        problem: '<p>Una espira circular está en la página, en un campo magnético uniforme que <strong>entra</strong> en la página (⊗) y que está <strong>disminuyendo</strong>. Vista de frente, ¿en qué sentido circula la corriente inducida?</p>',
        diagram: 'f3s12-cases',
        steps: [
          { text: 'El campo externo entra y el flujo (hacia adentro) decrece.' },
          { text: 'El campo inducido se opone a la disminución: apunta igual que el externo, <strong>hacia adentro</strong>.' },
          { text: 'Con la mano derecha, pulgar hacia adentro de la página: los dedos giran en sentido <strong>horario</strong>.' }
        ],
        answer: 'Horaria (el campo inducido entra, como el externo).',
        verify: { lab: 'call', mod: 'lenz', fn: 'direction', args: [e1.sc, e1.p, e1.t], value: 'cw' }
      },
      {
        type: 'example', heading: 'Campo eléctrico inducido dentro y fuera de un solenoide',
        problem: '<p>Dentro de un solenoide largo de $' + fx(e2.R * 100, 1) + '\\ \\text{cm}$ de radio, el campo crece a razón de $' + fx(e2.dB, 1) + '\\ \\text{T/s}$. Halla el campo eléctrico inducido a $' + fx(e2.r1 * 100, 1) + '\\ \\text{cm}$ y a $' + fx(e2.r2 * 100, 0) + '\\ \\text{cm}$ del eje, y la fem en una espira de $' + fx(e2.r2 * 100, 0) + '\\ \\text{cm}$ de radio alrededor del solenoide.</p>',
        diagram: 'f3s12-efield',
        steps: [
          { text: 'Adentro ($r < R$): el camino circular de radio $r$ encierra el flujo $\\pi r^2B$.', math: 'E\\,(2\\pi r) = \\pi r^2\\frac{dB}{dt} \\Rightarrow E = \\frac{r}{2}\\frac{dB}{dt} = \\frac{0.020}{2}(' + fx(e2.dB, 1) + ') = ' + fx(e2.E1 * 1000, 1) + '\\ \\text{mV/m}' },
          { text: 'Afuera ($r > R$): el flujo encerrado es solo el de la región con campo, $\\pi R^2B$.', math: 'E = \\frac{R^2}{2r}\\frac{dB}{dt} = \\frac{(0.040)^2}{2(0.10)}(' + fx(e2.dB, 1) + ') = ' + fx(e2.E2 * 1000, 1) + '\\ \\text{mV/m}' },
          { text: 'La fem en la espira de afuera es la circulación de $\\vec E$, o sea el cambio del flujo encerrado. Hay campo eléctrico donde no hay campo magnético.', math: '|\\varepsilon| = \\pi R^2\\frac{dB}{dt} = \\pi(0.040)^2(' + fx(e2.dB, 1) + ') = ' + fx(e2.emf2 * 1000, 2) + '\\ \\text{mV}' }
        ],
        answer: '$E = ' + fx(e2.E1 * 1000, 1) + '\\ \\text{mV/m}$ adentro, $E = ' + fx(e2.E2 * 1000, 1) + '\\ \\text{mV/m}$ afuera y $|\\varepsilon| = ' + fx(e2.emf2 * 1000, 2) + '\\ \\text{mV}$.',
        verify: { lab: 'call', mod: 'lenz', fn: 'Einduced', args: [e2.r2, e2.R, e2.dB], value: e2.E2 }
      },
      {
        type: 'example', heading: 'Ejemplo resuelto: el generador de 60 Hz',
        problem: '<p>Un generador tiene una bobina de $' + e3.N + '$ vueltas de $10\\ \\text{cm} \\times 20\\ \\text{cm}$ que gira a $' + e3.f + '\\ \\text{Hz}$ en un campo de $' + fx(e3.B) + '\\ \\text{T}$. En $t = 0$ la normal de la bobina es paralela a $\\vec B$. ¿Cuánto vale la fem máxima? ¿Y la fem en $t = ' + fx(e3.t * 1000, 1) + '\\ \\text{ms}$?</p>',
        diagram: 'f3s12-generator', state: { wt: e3.w * e3.t * 180 / Math.PI },
        steps: [
          { text: 'Rapidez angular y área:', math: '\\omega = 2\\pi f = 2\\pi(' + e3.f + ') = ' + fx(e3.w, 1) + '\\ \\text{rad/s}\\qquad A = (0.10)(0.20) = ' + fx(e3.A, 3) + '\\ \\text{m}^2' },
          { text: 'Fem máxima, cuando el plano de la bobina es paralelo a $\\vec B$:', math: '\\varepsilon_{\\max} = NBA\\omega = ' + e3.N + '(' + fx(e3.B) + ')(' + fx(e3.A, 3) + ')(' + fx(e3.w, 1) + ') = ' + fx(e3.peak, 0) + '\\ \\text{V}' },
          { text: 'En el instante pedido, con la calculadora en radianes:', math: '\\omega t = ' + fx(e3.w, 1) + '(' + fx(e3.t, 4) + ') = ' + fx(e3.w * e3.t, 3) + '\\ \\text{rad}\\qquad \\varepsilon = ' + fx(e3.peak, 0) + '\\sin(' + fx(e3.w * e3.t, 3) + ') = ' + fx(e3.emf, 0) + '\\ \\text{V}' }
        ],
        answer: '$\\varepsilon_{\\max} \\approx ' + fx(e3.peak, 0) + '\\ \\text{V}$ y $\\varepsilon(' + fx(e3.t * 1000, 1) + '\\ \\text{ms}) \\approx ' + fx(e3.emf, 0) + '\\ \\text{V}$.',
        verify: { lab: 'call', mod: 'lenz', fn: 'generator', args: [e3.N, e3.B, e3.A, e3.w, e3.t], values: { peak: e3.peak, emf: e3.emf, f: e3.f } }
      },
      {
        type: 'example', heading: 'Un electrón empujado por el campo inducido',
        problem: '<p>En una región circular de $' + fx(e4.R * 100, 0) + '\\ \\text{cm}$ de radio, el campo magnético crece a $' + e4.dB + '\\ \\text{T/s}$. Un electrón está a $' + fx(e4.r * 100, 0) + '\\ \\text{cm}$ del centro. ¿Qué campo eléctrico siente y con qué aceleración arranca (sin contar la fuerza magnética)?</p>',
        steps: [
          { text: 'El electrón está adentro de la región ($r < R$):', math: 'E = \\frac{r}{2}\\frac{dB}{dt} = \\frac{' + fx(e4.r, 2) + '}{2}(' + e4.dB + ') = ' + fx(e4.E, 2) + '\\ \\text{V/m}' },
          { text: 'Fuerza y aceleración, con $e = 1.60\\times 10^{-19}\\ \\text{C}$ y $m_e = 9.11\\times 10^{-31}\\ \\text{kg}$:', math: 'F = eE = ' + fx(e4.F * 1e19, 2) + '\\times 10^{-19}\\ \\text{N}\\qquad a = \\frac{F}{m_e} = ' + fx(e4.a / 1e11, 2) + '\\times 10^{11}\\ \\text{m/s}^2' },
          { text: 'Es la idea del betatrón: el campo eléctrico inducido acelera electrones en círculos.' }
        ],
        answer: '$E = ' + fx(e4.E, 2) + '\\ \\text{V/m}$ y $a \\approx ' + fx(e4.a / 1e11, 2) + '\\times 10^{11}\\ \\text{m/s}^2$.',
        verify: { lab: 'call', mod: 'lenz', fn: 'Einduced', args: [e4.r, e4.R, e4.dB], value: e4.E }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿El campo inducido siempre apunta contra el campo externo?', a: 'No. Se opone al <strong>cambio</strong>. Si el flujo decrece, el campo inducido apunta igual que el externo, para “sostenerlo”.' },
          { q: '¿Por qué el imán cae despacio en un tubo de cobre si el cobre no es magnético?', a: 'Porque el imán induce corrientes en el tubo, y por Lenz esas corrientes producen campos que se oponen a su caída. En un tubo de plástico cae normal, porque no se inducen corrientes.' },
          { q: '¿Desde dónde se mira el sentido horario o antihorario?', a: 'Siempre di desde dónde miras. En esta sesión, vista de frente (tú mirando la página). Si miras desde el otro lado, horario y antihorario se intercambian.' },
          { q: '¿El campo eléctrico inducido existe sin alambre?', a: 'Sí. Un campo magnético que cambia crea un campo eléctrico en todo el espacio alrededor, haya o no conductor. El alambre solo le da a las cargas un camino para moverse y formar una corriente.' },
          { q: '¿Por qué no se puede usar potencial para el campo inducido?', a: 'Porque $\\oint \\vec E\\cdot d\\vec l \\neq 0$: al dar una vuelta completa, el campo hace trabajo neto sobre la carga. Con un potencial, la vuelta completa daría cero.' },
          { q: '¿La fem del generador es máxima cuando el flujo es máximo?', a: 'No. Es máxima cuando el flujo es <strong>cero</strong> (plano de la bobina paralelo a $\\vec B$), porque ahí el flujo cambia más rápido.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Ley de Lenz: la corriente inducida produce un campo que se opone al cambio del flujo. Si el flujo crece, el campo inducido va al revés; si decrece, igual.',
          'El sentido de la corriente sale con la regla de la mano derecha; el signo menos de Faraday asegura que alguien haga trabajo (conservación de la energía).',
          'Forma general: $\\oint \\vec E\\cdot d\\vec l = -d\\Phi_B/dt$. En una región circular, $E = (r/2)\\,dB/dt$ adentro y $E = R^2/(2r)\\,dB/dt$ afuera.',
          'Generador: $\\varepsilon = NBA\\omega\\sin\\omega t$, con $\\varepsilon_{\\max} = NBA\\omega$ y $\\omega = 2\\pi f$.'
        ]
      }
    ],

    lab: {
      type: 'lenz-direction', title: '¿Hacia dónde va la corriente inducida?',
      intro: 'Elige una escena: un imán que se acerca o se aleja por detrás de la página, un campo uniforme que crece o decrece, o una espira que entra o sale de una región con campo. Mueve el tiempo (o anímalo), mira la gráfica del flujo y predice el sentido de la corriente inducida y el del campo que produce en el centro de la espira. Al comprobar, el lab dibuja la corriente y te avisa si pusiste el campo inducido siempre contra el externo, si reforzaste el cambio o si la corriente no corresponde con la mano derecha.',
      cfg: { start: { sc: 'magnet' } }
    },

    formulas: [
      { label: 'Ley de Faraday y Lenz', tex: '\\varepsilon = -N\\,\\frac{d\\Phi_B}{dt}' },
      { label: 'Forma general', tex: '\\oint \\vec E\\cdot d\\vec l = -\\frac{d\\Phi_B}{dt}' },
      { label: 'E inducido (adentro)', tex: 'E = \\frac{r}{2}\\left|\\frac{dB}{dt}\\right|,\\quad r < R' },
      { label: 'E inducido (afuera)', tex: 'E = \\frac{R^2}{2r}\\left|\\frac{dB}{dt}\\right|,\\quad r > R' },
      { label: 'Generador', tex: '\\varepsilon = NBA\\omega\\sin\\omega t,\\quad \\varepsilon_{\\max} = NBA\\omega' },
      { label: 'Frecuencia', tex: '\\omega = 2\\pi f = \\frac{2\\pi\\,(\\text{rpm})}{60}' }
    ],

    exercises: [
      {
        id: 'f3-s12-sentido', title: 'Sentido de la corriente inducida',
        vars: { k: [0, 3, 1] },
        prompt: function (v) {
          var c = CASES[v.k];
          return '<p>Una espira está en la página, en un campo uniforme que <strong>' + (c[0] ? 'sale de' : 'entra en') + '</strong> la página y que está <strong>' + (c[1] ? 'aumentando' : 'disminuyendo') + '</strong>. Vista de frente, ¿en qué sentido circula la corriente inducida?</p>';
        },
        check: 'choice',
        options: function (v) {
          var c = CASES[v.k], s = sense(c[0], c[1]), wrong = s.cur === 'Horaria' ? 'Antihoraria' : 'Horaria';
          return [
            { text: s.cur, correct: true },
            { text: wrong, say: c[1] ? 'El flujo crece: el campo inducido apunta al revés del externo.' : 'El flujo decrece: el campo inducido apunta igual que el externo, no al revés.' },
            { text: 'No circula corriente', say: 'El campo está cambiando, así que el flujo cambia y sí hay corriente.' }
          ];
        },
        answer: function (v) { var c = CASES[v.k]; return sense(c[0], c[1]).cur; },
        hint: '¿El flujo crece o decrece? El campo inducido se opone al cambio; luego, mano derecha.',
        solution: function (v) { var c = CASES[v.k], s = sense(c[0], c[1]); return 'El flujo ' + (c[1] ? 'crece' : 'decrece') + ', así que el campo inducido ' + s.Bind + ' de la página; con la mano derecha, la corriente es <strong>' + s.cur.toLowerCase() + '</strong>.'; }
      },
      {
        id: 'f3-s12-iman', title: 'Concepto: ¿la espira atrae o repele?',
        vars: { k: [0, 1, 1] },
        prompt: function (v) { return '<p>' + (v.k ? 'Alejas' : 'Acercas') + ' el polo N de un imán a una espira de cobre. ¿Qué fuerza hace la espira sobre el imán?</p>'; },
        check: 'choice',
        options: function (v) {
          var right = v.k ? 'Lo atrae' : 'Lo repele';
          return [
            { text: right, correct: true },
            { text: v.k ? 'Lo repele' : 'Lo atrae', say: 'La espira siempre se opone al movimiento: ' + (v.k ? 'al alejarlo, lo jala de regreso.' : 'al acercarlo, lo empuja.') },
            { text: 'Ninguna, porque el cobre no es magnético', say: 'No hace falta que sea magnético: la corriente inducida produce un campo.' }
          ];
        },
        answer: function (v) { return v.k ? 'Lo atrae' : 'Lo repele'; },
        hint: 'Lenz: la espira se opone al movimiento que cambia el flujo.',
        solution: function (v) { return v.k ? 'Al alejarlo, el flujo decrece; el campo inducido apunta igual que el del imán y la espira lo <strong>atrae</strong>.' : 'Al acercarlo, el flujo crece; el campo inducido se opone y la espira lo <strong>repele</strong>.'; }
      },
      {
        id: 'f3-s12-E-adentro', title: 'Campo eléctrico inducido adentro',
        vars: { R: [3, 10, 1], f: [0.2, 0.9, 0.1], dB: [0.5, 5, 0.5] },
        prompt: function (v) { var r = Math.round(v.f * v.R * 10) / 10; return '<p>Dentro de un solenoide largo de $' + v.R + '\\ \\text{cm}$ de radio, el campo cambia a razón de $' + fx(v.dB, 1) + '\\ \\text{T/s}$. ¿Qué campo eléctrico inducido hay a $' + fx(r, 1) + '\\ \\text{cm}$ del eje, en mV/m?</p>'; },
        check: 'numeric', unit: 'mV/m',
        answer: function (v) { var r = Math.round(v.f * v.R * 10) / 10; return r / 100 * v.dB / 2 * 1000; },
        mistakes: {
          noHalf: function (v) { var r = Math.round(v.f * v.R * 10) / 10; return r / 100 * v.dB * 1000; },
          outside: function (v) { var r = Math.round(v.f * v.R * 10) / 10; return Math.pow(v.R / 100, 2) * v.dB / (2 * r / 100) * 1000; }
        },
        feedback: [
          { when: 'noHalf', say: 'De $E(2\\pi r) = \\pi r^2\\,dB/dt$ sale $E = (r/2)\\,dB/dt$: falta dividir entre 2.' },
          { when: 'outside', say: 'Esa es la fórmula de afuera. El punto está dentro del solenoide ($r < R$).' }
        ],
        oracle: { lab: 'value', value: function (v) { var r = Math.round(v.f * v.R * 10) / 10; return LZ().Einduced(r / 100, v.R / 100, v.dB) * 1000; } },
        hint: 'Adentro: $E = (r/2)\\,|dB/dt|$, con $r$ en metros.',
        solution: function (v) { var r = Math.round(v.f * v.R * 10) / 10; return '$$E = \\frac{r}{2}\\left|\\frac{dB}{dt}\\right| = \\frac{' + fx(r / 100, 3) + '}{2}(' + fx(v.dB, 1) + ') = ' + fx(r / 100 * v.dB / 2 * 1000, 2) + '\\ \\text{mV/m}$$'; }
      },
      {
        id: 'f3-s12-E-afuera', title: 'Campo eléctrico inducido afuera',
        vars: { R: [2, 6, 1], r: [8, 20, 2], dB: [0.5, 5, 0.5] },
        prompt: function (v) { return '<p>Un solenoide largo de $' + v.R + '\\ \\text{cm}$ de radio tiene un campo que cambia a razón de $' + fx(v.dB, 1) + '\\ \\text{T/s}$; afuera el campo magnético es cero. ¿Qué campo eléctrico inducido hay a $' + v.r + '\\ \\text{cm}$ del eje, en mV/m?</p>'; },
        check: 'numeric', unit: 'mV/m',
        answer: function (v) { return Math.pow(v.R / 100, 2) * v.dB / (2 * v.r / 100) * 1000; },
        mistakes: {
          inside: function (v) { return v.r / 100 * v.dB / 2 * 1000; },
          zero: function () { return 0; }
        },
        feedback: [
          { when: 'inside', say: 'Esa es la fórmula de adentro. Afuera, el camino encierra solo el flujo $\\pi R^2B$: $E = R^2/(2r)\\,dB/dt$.' },
          { when: 'zero', say: 'Afuera no hay campo magnético, pero sí campo eléctrico: el camino encierra un flujo que cambia.' }
        ],
        oracle: { lab: 'call', mod: 'lenz', fn: 'Einduced', args: function (v) { return [v.r * 10, v.R * 10, v.dB]; } },
        hint: 'Afuera: $E(2\\pi r) = \\pi R^2\\,dB/dt$.',
        solution: function (v) { var E = Math.pow(v.R / 100, 2) * v.dB / (2 * v.r / 100); return '$$E = \\frac{R^2}{2r}\\left|\\frac{dB}{dt}\\right| = \\frac{(' + fx(v.R / 100, 2) + ')^2}{2(' + fx(v.r / 100, 2) + ')}(' + fx(v.dB, 1) + ') = ' + fx(E * 1000, 3) + '\\ \\text{mV/m}$$'; }
      },
      {
        id: 'f3-s12-fem-region', title: 'Fem en una espira grande',
        vars: { R: [2, 6, 1], r: [8, 20, 2], dB: [0.5, 5, 0.5] },
        prompt: function (v) { return '<p>Una espira de $' + v.r + '\\ \\text{cm}$ de radio rodea un solenoide largo de $' + v.R + '\\ \\text{cm}$ de radio, cuyo campo cambia a $' + fx(v.dB, 1) + '\\ \\text{T/s}$. ¿Qué fem se induce en la espira, en mV?</p>'; },
        check: 'numeric', unit: 'mV',
        answer: function (v) { return Math.PI * Math.pow(v.R / 100, 2) * v.dB * 1000; },
        mistakes: { bigArea: function (v) { return Math.PI * Math.pow(v.r / 100, 2) * v.dB * 1000; } },
        feedback: [{ when: 'bigArea', say: 'Solo hay campo magnético dentro del solenoide: el flujo es $\\pi R^2B$, no $\\pi r^2B$.' }],
        oracle: { lab: 'value', value: function (v) { return LZ().regionEmf(v.r / 100, v.R / 100, v.dB) * 1000; } },
        hint: 'El flujo que atraviesa la espira es el de la región con campo: $\\pi R^2 B$.',
        solution: function (v) { return '$$|\\varepsilon| = \\pi R^2\\left|\\frac{dB}{dt}\\right| = \\pi(' + fx(v.R / 100, 2) + ')^2(' + fx(v.dB, 1) + ') = ' + fx(Math.PI * Math.pow(v.R / 100, 2) * v.dB * 1000, 3) + '\\ \\text{mV}$$ No depende del tamaño de la espira mientras rodee al solenoide.'; }
      },
      {
        id: 'f3-s12-generador', title: 'Fem máxima de un generador',
        vars: { N: [50, 500, 50], a: [5, 20, 5], B: [0.1, 0.8, 0.1], rpm: [600, 3600, 300] },
        prompt: function (v) { return '<p>Un generador tiene una bobina cuadrada de $' + v.N + '$ vueltas y $' + v.a + '\\ \\text{cm}$ de lado que gira a $' + v.rpm + '\\ \\text{rpm}$ en un campo de $' + fx(v.B, 1) + '\\ \\text{T}$. ¿Cuánto vale su fem máxima, en volts?</p>'; },
        check: 'numeric', unit: 'V',
        answer: function (v) { return v.N * v.B * Math.pow(v.a / 100, 2) * v.rpm * TAU / 60; },
        mistakes: {
          rpm: function (v) { return v.N * v.B * Math.pow(v.a / 100, 2) * v.rpm; },
          hz: function (v) { return v.N * v.B * Math.pow(v.a / 100, 2) * v.rpm / 60; },
          cm2: function (v) { return v.N * v.B * v.a * v.a * v.rpm * TAU / 60; }
        },
        feedback: [
          { when: 'rpm', say: 'Las rpm no son rad/s: $\\omega = 2\\pi\\,(\\text{rpm})/60$.' },
          { when: 'hz', say: 'Pasaste a vueltas por segundo ($f$), pero falta el $2\\pi$: $\\omega = 2\\pi f$.' },
          { when: 'cm2', say: 'El área va en m²: el lado en metros antes de elevarlo al cuadrado.' }
        ],
        oracle: { lab: 'call', mod: 'lenz', fn: 'generator', field: 'peak', args: function (v) { return [v.N, v.B, Math.pow(v.a / 100, 2), v.rpm * TAU / 60, 0]; } },
        hint: '$\\varepsilon_{\\max} = NBA\\omega$, con $\\omega = 2\\pi\\,(\\text{rpm})/60$ y $A$ en m².',
        solution: function (v) { var w = v.rpm * TAU / 60, A = Math.pow(v.a / 100, 2); return '$\\omega = 2\\pi(' + v.rpm + ')/60 = ' + fx(w, 1) + '\\ \\text{rad/s}$ y $A = ' + fx(A, 4) + '\\ \\text{m}^2$. $$\\varepsilon_{\\max} = NBA\\omega = ' + v.N + '(' + fx(v.B, 1) + ')(' + fx(A, 4) + ')(' + fx(w, 1) + ') = ' + fx(v.N * v.B * A * w, 1) + '\\ \\text{V}$$'; }
      },
      {
        id: 'f3-s12-generador-t', title: 'Fem del generador en un instante',
        vars: { N: [50, 300, 50], A: [50, 400, 50], B: [0.1, 0.8, 0.1], f: [50, 60, 10], t: [1, 7, 1] },
        prompt: function (v) { return '<p>Una bobina de $' + v.N + '$ vueltas y $' + v.A + '\\ \\text{cm}^2$ gira a $' + v.f + '\\ \\text{Hz}$ en un campo de $' + fx(v.B, 1) + '\\ \\text{T}$; en $t = 0$ su normal es paralela a $\\vec B$. ¿Cuánto vale la fem en $t = ' + v.t + '\\ \\text{ms}$, en volts?</p>'; },
        check: 'numeric', unit: 'V',
        answer: function (v) { var w = TAU * v.f; return v.N * v.B * v.A * 1e-4 * w * Math.sin(w * v.t / 1000); },
        mistakes: {
          cosine: function (v) { var w = TAU * v.f; return v.N * v.B * v.A * 1e-4 * w * Math.cos(w * v.t / 1000); },
          degrees: function (v) { var w = TAU * v.f; return v.N * v.B * v.A * 1e-4 * w * Math.sin(w * v.t / 1000 * Math.PI / 180); }
        },
        feedback: [
          { when: 'cosine', say: 'Con la normal paralela a $\\vec B$ en $t = 0$, $\\Phi = BA\\cos\\omega t$ y la fem va con $\\sin\\omega t$.' },
          { when: 'degrees', say: 'El ángulo $\\omega t$ está en radianes: pon la calculadora en modo radianes.' }
        ],
        baseWhere: function (v) { var w = TAU * v.f; return Math.abs(Math.sin(w * v.t / 1000)) > 0.15; },
        oracle: { lab: 'call', mod: 'lenz', fn: 'generator', field: 'emf', args: function (v) { return [v.N, v.B, v.A * 1e-4, TAU * v.f, v.t / 1000]; } },
        hint: '$\\varepsilon = NBA\\omega\\sin\\omega t$ con $\\omega = 2\\pi f$, $t$ en segundos y la calculadora en radianes.',
        solution: function (v) { var w = TAU * v.f, pk = v.N * v.B * v.A * 1e-4 * w; return '$\\omega = ' + fx(w, 1) + '\\ \\text{rad/s}$, $\\varepsilon_{\\max} = NBA\\omega = ' + fx(pk, 2) + '\\ \\text{V}$. $$\\varepsilon = ' + fx(pk, 2) + '\\sin(' + fx(w * v.t / 1000, 3) + ') = ' + fx(pk * Math.sin(w * v.t / 1000), 2) + '\\ \\text{V}$$'; }
      }
    ],

    quiz: { tags: ['f3.S12'], count: 8 },

    errors: [
      'Poner el campo inducido siempre contra el campo externo: se opone al <strong>cambio</strong> del flujo.',
      'Decir horario o antihorario sin aclarar desde dónde se mira.',
      'Confundir la regla de la mano derecha de una espira: antihoraria (vista de frente) produce un campo que sale.',
      'Creer que el campo eléctrico inducido solo existe dentro del alambre o dentro de la región con campo magnético.',
      'Usar la fórmula de adentro ($E = (r/2)\\,dB/dt$) para un punto de afuera.',
      'Usar rpm o hertz como si fueran rad/s en $\\varepsilon_{\\max} = NBA\\omega$.',
      'Pensar que la fem del generador es máxima cuando el flujo es máximo.'
    ],

    teacher: {
      plan: [
        'Demostración del imán en el tubo de cobre (o video). Pregunta abierta: ¿por qué cae despacio?',
        'Explainer del imán y la espira: repele al acercar, atrae al alejar. Ley de Lenz, mano derecha y los cuatro casos.',
        'Lenz como conservación de la energía. Luego la forma general de Faraday con el campo eléctrico inducido (ejemplos 2 y 4).',
        'Generador como ejemplo resuelto (ejemplo 3) y la fem inversa de un motor. Cierra con el lab: que predigan antes de comprobar.'
      ],
      check: [
        'Que digan si el flujo crece o decrece antes de decidir el sentido.',
        'Que distingan “se opone al cambio” de “se opone al campo”.',
        'Que calculen la fem máxima de un generador pasando rpm a rad/s.'
      ],
      note: 'La convención del curso: espira en la página, vista de frente; antihoraria ↔ campo que sale. Las corrientes de Foucault y el freno magnético quedan como aplicaciones (S11); la inductancia (autoinducción) es la S13.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §13.2 “Lenz’s Law”. <a href="https://openstax.org/books/university-physics-volume-2/pages/13-2-lenzs-law">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §13.4 “Induced Electric Fields”. <a href="https://openstax.org/books/university-physics-volume-2/pages/13-4-induced-electric-fields">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §13.6 “Electric Generators and Back Emf”. <a href="https://openstax.org/books/university-physics-volume-2/pages/13-6-electric-generators-and-back-emf">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-11',
    next: 'sesion-13'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { if (!ex.baseWhere) ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
