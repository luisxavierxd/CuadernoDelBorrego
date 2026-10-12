/* =====================================================================
   Física 2 · S13 · Leyes de Kirchhoff I: nodos, mallas y convención de signos
   (bloque C · Circuitos). Circuitos de una y dos mallas.
   Fuente: OpenStax, University Physics Volume 2, §10.3 (CC BY-NC-SA 4.0).
   Unidades: V, Ω, A, W.
   Circuitos como en el lab kirchhoff-signs: ramas verticales entre el nodo b (abajo)
   y el nodo a (arriba), elementos de abajo hacia arriba; up = la terminal + arriba.
   Las cuentas se hacen aquí por sustitución (fórmulas propias); scripts/examples.test.js
   las compara contra LabMath.kirchhoff (Cramer) y los oráculos de los ejercicios usan
   el solver nodal de la S10 (LabMath.kirchhoff.nodal → LabMath.capnet.nodal).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function sg(v) { return v < 0 ? '-' + fx(-v) : fx(v); }
  function Eb(n, v, up) { return { t: 'E', id: 'E' + n, v: v, up: up !== false }; }
  function Rb(n, v) { return { t: 'R', id: 'R' + n, v: v }; }
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (m) { return ex.mistakes[m](v); }));
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) {
          if (Math.abs(vals[i] - vals[j]) <= Math.max(0.03, 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j])))) return false;
        }
      }
      return true;
    };
  }
  function K() { return window.LabMath.kirchhoff; }

  // Una malla: ε₁ (+ arriba) y R₁ a la izquierda; R₂ y ε₂ (+ arriba) a la derecha: las baterías se oponen.
  function loop(v) { return { br: [[Eb(1, v.e1), Rb(1, v.a)], [Rb(2, v.b), Eb(2, v.e2)]] }; }
  function loopI(v) { return (v.e1 - v.e2) / (v.a + v.b); }                       // en horario
  // Dos mallas: ε₁ y R₁ a la izquierda, R₂ en medio, R₃ y ε₂ a la derecha (las dos + arriba).
  function two(v) { return { br: [[Eb(1, v.e1), Rb(1, v.a)], [Rb(2, v.b)], [Rb(3, v.c), Eb(2, v.e2)]] }; }
  // Sustitución con I₁ ↑, I₂ ↓ (en medio), I₃ ↑:  I₁ + I₃ = I₂;  ε₁ = R₁I₁ + R₂I₂;  ε₂ = R₃I₃ + R₂I₂.
  function twoSol(v) {
    var I2 = (v.e1 / v.a + v.e2 / v.c) / (1 + v.b / v.a + v.b / v.c);
    var I1 = (v.e1 - v.b * I2) / v.a, I3 = (v.e2 - v.b * I2) / v.c;
    return { I1: I1, I2: I2, I3: I3, V: v.b * I2 };
  }

  // Ejemplo 1: 12 V contra 6 V, 4 Ω y 2 Ω.
  var x1 = { e1: 12, e2: 6, a: 4, b: 2 }; x1.I = loopI(x1); x1.circ = loop(x1);
  // Ejemplos 2–4: ε₁ = 12 V, R₁ = 2 Ω, R₂ = 6 Ω, R₃ = 3 Ω, ε₂ = 6 V.
  var x2 = { e1: 12, a: 2, b: 6, c: 3, e2: 6 }; x2.s = twoSol(x2); x2.circ = two(x2);
  x2.P1 = x2.e1 * x2.s.I1; x2.P2 = x2.e2 * x2.s.I3;
  x2.PR = [x2.s.I1 * x2.s.I1 * x2.a, x2.s.I2 * x2.s.I2 * x2.b, x2.s.I3 * x2.s.I3 * x2.c];
  var DIRS = [1, -1, 1];                               // I₁ ↑, I₂ ↓, I₃ ↑ (como en la lección)
  var IV2 = [x2.s.I1, x2.s.I2, x2.s.I3];                // corrientes con su signo, para la figura

  var data = window.SESSION_DATA = {
    slug: 'sesion-13', number: '13', group: 'C · Circuitos',
    title: 'Leyes de Kirchhoff I: nodos, mallas y convención de signos', temario: [],
    minutes: 180,
    quote: 'Lo que entra a un nodo, sale. Lo que subes en una vuelta, lo bajas. Todo lo demás es cuidar los signos.',
    badges: [
      'Reconocer cuándo un circuito no se reduce con serie y paralelo.',
      'Escribir la regla de nodos (conservación de la carga) y la regla de mallas (conservación de la energía).',
      'Poner bien el signo de cada término: $\\mp IR$ en los resistores y $\\pm\\varepsilon$ en las baterías.',
      'Resolver circuitos de una y dos mallas, interpretar corrientes negativas y comprobar con potencias.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Con <strong>dos reglas</strong> se resuelve cualquier circuito, aunque no se pueda reducir con serie y paralelo: en un nodo, la corriente que entra es la que sale; en una vuelta cerrada, el potencial sube y baja lo mismo.',
        recall: [
          'Ley de Ohm: un resistor con corriente $I$ tiene un voltaje $V = IR$ entre sus terminales, y disipa $P = I^2R$ (S11).',
          'Una batería ideal sube el potencial $\\varepsilon$ de su terminal $-$ a su terminal $+$; la potencia que entrega es $P = \\varepsilon I$ (S12).',
          'El potencial es como una altura: la diferencia entre dos puntos no depende del camino (<a href="../sesion-05/">S05</a>).'
        ],
        why: 'Pasar corriente a un auto con otro auto, cargar una batería con un panel solar, o un celular que se carga mientras lo usas: son circuitos con varias fuentes en ramas distintas. Ahí serie y paralelo no alcanzan, y Kirchhoff sí.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en tuberías de agua. Donde se juntan tres tubos (un <strong>nodo</strong>), el agua no se acumula ni desaparece: los litros por segundo que llegan son los que se van. Con la carga pasa igual. Esa es la <strong>regla de nodos</strong>.',
          'Ahora piensa en un edificio. Sales de tu piso, subes escaleras, bajas por otras, das la vuelta y regresas a tu piso. No importa el camino: lo que subiste es lo que bajaste. En un circuito, las baterías son las escaleras que suben y los resistores son las que bajan. Esa es la <strong>regla de mallas</strong>: en una vuelta completa, la suma de subidas y bajadas de potencial es cero.',
          'Lo único delicado es saber, en cada escalón, si subes o bajas. Para eso hay una <strong>convención de signos</strong>, y es lo que vas a practicar en esta sesión.'
        ]
      },
      {
        type: 'concept', heading: '¿Por qué no basta con serie y paralelo?', short: 'Por qué Kirchhoff',
        body: [
          'En este circuito hay una batería en la rama de la izquierda y otra en la de la derecha. Fíjate en $R_1$ y $R_2$: en el nodo $a$ que las une sale una tercera rama, así que no llevan la misma corriente (no están en serie). Tampoco están en paralelo: $R_2$ va directo de $a$ a $b$, pero en la rama de $R_1$ también está $\\varepsilon_1$. Lo mismo pasa con $R_3$ y $\\varepsilon_2$.',
          'Como no se puede reducir, se resuelve de frente: se le pone nombre a la corriente de cada rama y se escriben ecuaciones que salen de dos leyes de conservación. Son las <strong>reglas de Kirchhoff</strong>.',
          'Cuando no hay baterías en ramas distintas, a veces sí puedes reducir (S12). Kirchhoff funciona siempre; reducir solo a veces.'
        ],
        diagram: 'f2s13-circuit', state: { c: x2.circ, vals: true },
        caption: 'Dos baterías en ramas distintas: ninguna pareja de resistores está en serie ni en paralelo.'
      },
      {
        type: 'concept', heading: 'Regla de nodos: lo que entra es lo que sale', short: 'Regla de nodos',
        body: [
          'Un <strong>nodo</strong> es un punto donde se unen tres cables o más. La carga no se crea ni se destruye, y en un circuito en estado estable tampoco se acumula en un punto. Por eso: $$\\sum I_{\\text{entran}} = \\sum I_{\\text{salen}}$$',
          'Para escribirla necesitas una flecha en cada rama. Esa flecha es <strong>tu elección</strong>: dices «supongo que la corriente va por aquí». Con esas flechas cuentas cuáles llegan al nodo y cuáles se van.',
          'En un circuito con $n$ nodos, solo $n - 1$ de estas ecuaciones son distintas: en los de esta sesión hay dos nodos ($a$ y $b$) y basta una ecuación.'
        ],
        diagram: 'f2s13-node',
        caption: 'Tres ramas en un nodo. Con estas flechas, $I_1$ entra y $I_2$, $I_3$ salen: $I_1 = I_2 + I_3$.'
      },
      {
        type: 'explainer', heading: 'Regla de mallas: vuelves al mismo piso', short: 'Regla de mallas',
        title: 'El potencial a lo largo de una vuelta',
        intro: 'Una <strong>malla</strong> es un camino cerrado del circuito. Recórrela y anota cuánto sube o baja el potencial en cada elemento. Ejemplo: una malla con $\\varepsilon_1 = 12$ V, $R_1 = 4\\ \\Omega$, $\\varepsilon_2 = 6$ V (en contra) y $R_2 = 2\\ \\Omega$; por ella circula $I = 1$ A.',
        diagram: 'f2s13-stairs',
        steps: [
          { text: 'Sales del punto $b$ con potencial $0$ (tú eliges el cero).', state: { n: 0 } },
          { text: 'Cruzas $\\varepsilon_1$ de $-$ a $+$: <strong>subes</strong> 12 V. Es la escalera hacia arriba.', state: { n: 1 } },
          { text: 'Pasas por $R_1$ en el sentido de la corriente: <strong>bajas</strong> $IR_1 = (1)(4) = 4$ V. Llegas a 8 V.', state: { n: 2 } },
          { text: 'Cruzas $\\varepsilon_2$ de $+$ a $-$: <strong>bajas</strong> 6 V. Esta batería empuja en contra.', state: { n: 3 } },
          { text: 'Pasas por $R_2$ con la corriente: bajas $IR_2 = 2$ V y <strong>vuelves a 0</strong>, al mismo piso. $$+12 - 4 - 6 - 2 = 0$$ Esa es la regla: $\\sum \\Delta V = 0$ en cualquier malla.', state: { n: 4 } }
        ]
      },
      {
        type: 'concept', heading: 'La convención de signos', short: 'Signos',
        body: [
          '<strong>Paso 1: elige un sentido para cada corriente</strong> (una flecha por rama) y un sentido para recorrer cada malla. Los dos son arbitrarios e independientes: puedes recorrer una malla en contra de alguna corriente.',
          '<strong>Resistores.</strong> La corriente va de mayor a menor potencial dentro del resistor. Si lo recorres <strong>a favor</strong> de tu flecha, el potencial <strong>baja</strong>: escribe $-IR$. Si lo recorres <strong>en contra</strong>, sube: $+IR$.',
          '<strong>Baterías.</strong> No importa la corriente, solo cómo la cruzas: de $-$ a $+$ (placa corta a placa larga) el potencial <strong>sube</strong>, $+\\varepsilon$; de $+$ a $-$ <strong>baja</strong>, $-\\varepsilon$.',
          'La suma de todos los términos de la malla es cero.'
        ],
        diagram: 'f2s13-signs',
        caption: 'Las cuatro reglas. Flecha punteada: el sentido en que recorres; flecha sólida: la corriente que elegiste.'
      },
      {
        type: 'callout', heading: 'Si una corriente sale negativa, no pasa nada',
        body: [
          'Las flechas son una suposición. Si al resolver te sale $I_3 = -0.67$ A, significa que la corriente real mide $0.67$ A y va <strong>al revés</strong> de tu flecha. No tienes que volver a empezar: el signo ya te lo dijo.',
          'Lo que sí no puedes hacer es cambiar de flecha a media cuenta. Elige una vez y usa la misma en la regla de nodos y en todas las mallas.'
        ]
      },
      {
        type: 'explainer', heading: 'El procedimiento completo', short: 'Procedimiento',
        title: 'Dos mallas paso a paso',
        intro: 'Con el circuito de arriba: $\\varepsilon_1 = ' + x2.e1 + '$ V, $R_1 = ' + x2.a + '\\ \\Omega$, $R_2 = ' + x2.b + '\\ \\Omega$, $R_3 = ' + x2.c + '\\ \\Omega$ y $\\varepsilon_2 = ' + x2.e2 + '$ V.',
        diagram: 'f2s13-circuit',
        steps: [
          { text: '<strong>Etiqueta.</strong> Una corriente por rama, con su flecha: $I_1$ hacia arriba, $I_2$ hacia abajo (en medio) e $I_3$ hacia arriba. Son tres incógnitas.', state: { c: x2.circ, vals: true, dirs: DIRS, loop: null, nodeHi: 0, ival: null } },
          { text: '<strong>Nodo $a$.</strong> Entran $I_1$ e $I_3$; sale $I_2$: $$I_1 + I_3 = I_2$$ El nodo $b$ da la misma ecuación.', state: { nodeHi: 1 } },
          { text: '<strong>Malla izquierda</strong>, en horario desde $b$: subes por $\\varepsilon_1$ ($+$), pasas $R_1$ a favor de $I_1$ ($-$) y bajas por $R_2$ a favor de $I_2$ ($-$): $$' + x2.e1 + ' - ' + x2.a + 'I_1 - ' + x2.b + 'I_2 = 0$$', state: { nodeHi: 0, loop: 'izq', trav: 1 } },
          { text: '<strong>Malla derecha</strong>, en antihorario desde $b$: subes por $R_3$ a favor de $I_3$ ($-$), cruzas $\\varepsilon_2$ de $-$ a $+$ ($+$) y bajas por $R_2$ a favor de $I_2$ ($-$): $$-' + x2.c + 'I_3 + ' + x2.e2 + ' - ' + x2.b + 'I_2 = 0$$', state: { loop: 'der', trav: -1 } },
          { text: '<strong>Resuelve</strong> por sustitución: $I_1 = (' + x2.e1 + ' - ' + x2.b + 'I_2)/' + x2.a + '$ e $I_3 = (' + x2.e2 + ' - ' + x2.b + 'I_2)/' + x2.c + '$; en el nodo sale $I_2 = ' + fx(x2.s.I2) + '$ A, $I_1 = ' + fx(x2.s.I1) + '$ A e $I_3 = ' + sg(x2.s.I3) + '$ A. El signo de $I_3$ dice que en realidad va hacia abajo: $\\varepsilon_2$ <strong>se está cargando</strong>.', state: { loop: null, ival: IV2 } }
        ]
      },
      {
        type: 'callout', heading: 'Comprueba con potencias',
        body: [
          'La energía también se conserva: lo que entregan las baterías es lo que disipan los resistores. $$\\sum \\varepsilon I = \\sum I^2R$$',
          'Una batería entrega $P = \\varepsilon I$ con la corriente que la atraviesa de $-$ a $+$ por dentro. Si la corriente la atraviesa al revés, $P$ sale negativa: la batería <strong>recibe</strong> energía (se está cargando). Si tu balance no cierra, hay un signo mal.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: resolver un circuito con Kirchhoff', short: 'Receta',
        steps: [
          { text: 'Dibuja una flecha en cada rama y nombra su corriente ($I_1$, $I_2$, …). Una rama es un tramo entre dos nodos: todo lo que hay en ella lleva la misma corriente.', tip: 'El sentido es tu elección. No pierdas tiempo adivinando: el signo del resultado te dirá si acertaste.' },
          { text: 'Escribe la regla de nodos en todos los nodos menos uno: $\\sum I_{\\text{entran}} = \\sum I_{\\text{salen}}$, según tus flechas.' },
          { text: 'Elige mallas hasta tener tantas ecuaciones como incógnitas (con dos mallas basta con la izquierda y la derecha) y un sentido de recorrido para cada una.' },
          { text: 'Recorre cada malla y escribe un término por elemento: resistor a favor de tu flecha $-IR$, en contra $+IR$; batería de $-$ a $+$ $+\\varepsilon$, de $+$ a $-$ $-\\varepsilon$. Iguala la suma a cero.', tip: 'El error más común es poner $-IR$ en todos los resistores. Solo baja si lo recorres a favor de la corriente que elegiste.' },
          { text: 'Resuelve por sustitución, interpreta los signos (negativa = va al revés) y comprueba que $\\sum \\varepsilon I = \\sum I^2R$.', tip: 'Una batería con $P = \\varepsilon I < 0$ se está cargando: es normal cuando otra más fuerte la empuja.' }
        ]
      },
      {
        type: 'example', heading: 'Una malla con dos baterías opuestas',
        problem: '<p>En una malla hay una batería $\\varepsilon_1 = ' + x1.e1 + '\\ \\text{V}$ y otra $\\varepsilon_2 = ' + x1.e2 + '\\ \\text{V}$, con sus terminales $+$ hacia arriba en el dibujo (empujan en sentidos opuestos), y dos resistores $R_1 = ' + x1.a + '\\ \\Omega$ y $R_2 = ' + x1.b + '\\ \\Omega$. ¿Cuánta corriente circula y hacia dónde?</p>',
        diagram: 'f2s13-circuit', state: { c: x1.circ, vals: true, dirs: [1, -1], loop: 'malla', trav: 1 },
        steps: [
          { text: 'Una sola malla: la misma corriente $I$ en todo el circuito. Elige el sentido horario para $I$ y recorre también en horario desde $b$.' },
          { text: 'Subes por $\\varepsilon_1$ ($+$), pasas $R_1$ a favor ($-$), cruzas $\\varepsilon_2$ de $+$ a $-$ ($-$) y pasas $R_2$ a favor ($-$).', math: '' + x1.e1 + ' - ' + x1.a + 'I - ' + x1.e2 + ' - ' + x1.b + 'I = 0' },
          { text: 'Despeja.', math: 'I = \\frac{' + x1.e1 + ' - ' + x1.e2 + '}{' + x1.a + ' + ' + x1.b + '} = ' + fx(x1.I) + '\\ \\text{A}' },
          { text: 'Salió positiva: va en horario, como supusiste. Gana la batería más grande; la otra resta.' }
        ],
        answer: '$I = ' + fx(x1.I) + '\\ \\text{A}$, en sentido horario (la batería de ' + x1.e1 + ' V empuja más).',
        verify: { lab: 'call', mod: 'kirchhoff', fn: 'solve', args: [x1.circ, [1, -1]], values: { 'I.0': x1.I, 'I.1': x1.I } }
      },
      {
        type: 'example', heading: 'Dos mallas: las tres corrientes',
        problem: '<p>En el circuito de dos mallas, $\\varepsilon_1 = ' + x2.e1 + '\\ \\text{V}$, $R_1 = ' + x2.a + '\\ \\Omega$, $R_2 = ' + x2.b + '\\ \\Omega$ (en medio), $R_3 = ' + x2.c + '\\ \\Omega$ y $\\varepsilon_2 = ' + x2.e2 + '\\ \\text{V}$, con las dos baterías con su $+$ hacia arriba. Halla las tres corrientes.</p>',
        diagram: 'f2s13-circuit', state: { c: x2.circ, vals: true, dirs: DIRS },
        steps: [
          { text: 'Flechas: $I_1$ arriba, $I_2$ abajo, $I_3$ arriba. Nodo $a$:', math: 'I_1 + I_3 = I_2' },
          { text: 'Malla izquierda (horario) y malla derecha (antihorario):', math: '' + x2.e1 + ' - ' + x2.a + 'I_1 - ' + x2.b + 'I_2 = 0 \\qquad ' + x2.e2 + ' - ' + x2.c + 'I_3 - ' + x2.b + 'I_2 = 0' },
          { text: 'Despeja $I_1$ e $I_3$ en función de $I_2$ y sustituye en el nodo:', math: '\\frac{' + x2.e1 + ' - ' + x2.b + 'I_2}{' + x2.a + '} + \\frac{' + x2.e2 + ' - ' + x2.b + 'I_2}{' + x2.c + '} = I_2 \\;\\Rightarrow\\; I_2 = ' + fx(x2.s.I2) + '\\ \\text{A}' },
          { text: 'Regresa a las otras dos:', math: 'I_1 = \\frac{' + x2.e1 + ' - ' + x2.b + '(' + fx(x2.s.I2) + ')}{' + x2.a + '} = ' + fx(x2.s.I1) + '\\ \\text{A}\\qquad I_3 = \\frac{' + x2.e2 + ' - ' + x2.b + '(' + fx(x2.s.I2) + ')}{' + x2.c + '} = ' + sg(x2.s.I3) + '\\ \\text{A}' },
          { text: 'Comprueba el nodo: $' + fx(x2.s.I1) + ' + (' + sg(x2.s.I3) + ') = ' + fx(x2.s.I2) + '$. $I_3$ es negativa: la corriente real en la rama derecha baja, y entra a $\\varepsilon_2$ por su terminal $+$.' }
        ],
        answer: '$I_1 = ' + fx(x2.s.I1) + '$ A hacia arriba, $I_2 = ' + fx(x2.s.I2) + '$ A hacia abajo, e $I_3 = ' + sg(x2.s.I3) + '$ A: en realidad ' + fx(-x2.s.I3) + ' A hacia abajo.',
        verify: { lab: 'call', mod: 'kirchhoff', fn: 'solve', args: [x2.circ, DIRS], values: { 'I.0': x2.s.I1, 'I.1': x2.s.I2, 'I.2': x2.s.I3 } }
      },
      {
        type: 'example', heading: 'Voltaje entre dos puntos por dos caminos',
        problem: '<p>En el mismo circuito, ¿cuánto vale $V_a - V_b$ (del nodo de arriba al de abajo)?</p>',
        steps: [
          { text: 'Camina de $b$ a $a$ por <strong>cualquier</strong> rama y suma los cambios de potencial. Por la rama del centro: subes por $R_2$ en contra de $I_2$ (que baja), así que el potencial sube $I_2R_2$.', math: 'V_a - V_b = I_2R_2 = (' + fx(x2.s.I2) + ')(' + x2.b + ') = ' + fx(x2.s.V) + '\\ \\text{V}' },
          { text: 'Por la rama izquierda: subes $\\varepsilon_1$ y bajas $I_1R_1$ (vas a favor de $I_1$).', math: 'V_a - V_b = ' + x2.e1 + ' - (' + fx(x2.s.I1) + ')(' + x2.a + ') = ' + fx(x2.e1 - x2.s.I1 * x2.a) + '\\ \\text{V}' },
          { text: 'El mismo resultado: el potencial es como una altura, y la diferencia no depende del camino. Esta es otra manera de comprobar tus corrientes.' }
        ],
        answer: '$V_a - V_b = ' + fx(x2.s.V) + '\\ \\text{V}$.',
        verify: { lab: 'call', mod: 'kirchhoff', fn: 'solve', args: [x2.circ, DIRS], values: { V: x2.s.V } }
      },
      {
        type: 'example', heading: 'Balance de potencias',
        problem: '<p>En el mismo circuito, ¿cuánta potencia entrega cada batería y cuánta disipan los resistores?</p>',
        steps: [
          { text: '$\\varepsilon_1$: la corriente $I_1$ la cruza de $-$ a $+$.', math: 'P_1 = \\varepsilon_1 I_1 = (' + x2.e1 + ')(' + fx(x2.s.I1) + ') = ' + fx(x2.P1) + '\\ \\text{W}' },
          { text: '$\\varepsilon_2$: con tu flecha $I_3$ también la cruzaría de $-$ a $+$, pero $I_3$ es negativa.', math: 'P_2 = \\varepsilon_2 I_3 = (' + x2.e2 + ')(' + sg(x2.s.I3) + ') = ' + sg(x2.P2) + '\\ \\text{W}' },
          { text: 'Resistores: $I^2R$ en cada uno.', math: '(' + fx(x2.s.I1) + ')^2(' + x2.a + ') + (' + fx(x2.s.I2) + ')^2(' + x2.b + ') + (' + fx(-x2.s.I3) + ')^2(' + x2.c + ') = ' + fx(x2.PR[0] + x2.PR[1] + x2.PR[2]) + '\\ \\text{W}' },
          { text: 'Cierra: $' + fx(x2.P1) + ' + (' + sg(x2.P2) + ') = ' + fx(x2.P1 + x2.P2) + '$ W. $\\varepsilon_2$ <strong>absorbe</strong> ' + fx(-x2.P2) + ' W: la batería de ' + x2.e1 + ' V la está cargando.' }
        ],
        answer: '$\\varepsilon_1$ entrega $' + fx(x2.P1) + '$ W, $\\varepsilon_2$ recibe $' + fx(-x2.P2) + '$ W y los resistores disipan $' + fx(x2.PR[0] + x2.PR[1] + x2.PR[2]) + '$ W.',
        verify: { lab: 'call', mod: 'kirchhoff', fn: 'solve', args: [x2.circ, DIRS], values: { 'P.src.E1': x2.P1, 'P.src.E2': x2.P2, 'P.diss': x2.PR[0] + x2.PR[1] + x2.PR[2], 'P.gen': x2.P1 + x2.P2 } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Y si elijo mal el sentido de una corriente?', a: 'No existe «mal»: la flecha es una suposición. Si la corriente real va al revés, el resultado sale negativo, y con eso ya sabes hacia dónde va. Solo usa la misma flecha en todas las ecuaciones.' },
          { q: '¿En un resistor el potencial siempre baja?', a: 'Baja <strong>en el sentido de la corriente</strong>. Si recorres el resistor en contra de tu flecha, el potencial sube y el término es $+IR$. Por eso no se pone $-IR$ en todos.' },
          { q: '¿El signo de una batería depende de la corriente?', a: 'No. Solo depende de cómo la cruzas en tu recorrido: de $-$ a $+$ es $+\\varepsilon$, de $+$ a $-$ es $-\\varepsilon$, vaya la corriente hacia donde vaya.' },
          { q: '¿El sentido de recorrido tiene que ser el de la corriente?', a: 'No. Son dos elecciones independientes. Si recorres al revés, todos los términos cambian de signo y la ecuación es la misma multiplicada por $-1$.' },
          { q: '¿Cuántas ecuaciones necesito?', a: 'Tantas como corrientes desconocidas. Con dos nodos y tres ramas: una de nodos y dos de mallas. La malla exterior no agrega nada nuevo: es la suma de las otras dos.' },
          { q: '¿Cómo puede una batería tener potencia negativa?', a: 'Si otra batería más fuerte hace pasar la corriente por ella de $+$ a $-$, le mete energía: se está <strong>cargando</strong>. Así funciona un cargador.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Regla de nodos (conservación de la carga): $\\sum I_{\\text{entran}} = \\sum I_{\\text{salen}}$.',
          'Regla de mallas (conservación de la energía): en una vuelta cerrada, $\\sum \\Delta V = 0$.',
          'Signos: resistor a favor de tu flecha $-IR$, en contra $+IR$; batería de $-$ a $+$ $+\\varepsilon$, de $+$ a $-$ $-\\varepsilon$.',
          'Una corriente negativa va al revés de tu flecha; comprueba siempre con $\\sum \\varepsilon I = \\sum I^2R$.'
        ]
      }
    ],

    lab: {
      type: 'kirchhoff-signs', title: '¿Son tus signos?',
      intro: 'Elige el sentido de cada corriente (toca las flechas para invertirlas), una malla y su sentido de recorrido, y pon el signo de cada término de la ecuación. El lab marca los signos mal y te dice por qué. Al final calcula una corriente con tus flechas: el lab reconoce el valor del sentido contrario, una batería con el signo invertido, una batería olvidada y una malla resuelta como si estuviera sola.',
      cfg: { preset: 2 }
    },

    formulas: [
      { label: 'Regla de nodos', tex: '\\sum I_{\\text{entran}} = \\sum I_{\\text{salen}}' },
      { label: 'Regla de mallas', tex: '\\sum \\Delta V = 0' },
      { label: 'Resistor', tex: '-IR \\text{ a favor},\\; +IR \\text{ en contra}' },
      { label: 'Batería', tex: '+\\varepsilon \\text{ de } - \\text{ a } +,\\; -\\varepsilon \\text{ de } + \\text{ a } -' },
      { label: 'Potencias', tex: '\\sum \\varepsilon I = \\sum I^2R' }
    ],

    exercises: [
      {
        id: 'f2-s13-una-malla', title: 'Una malla con dos baterías opuestas',
        vars: { e1: [6, 24, 1], e2: [1, 15, 1], a: [1, 10, 1], b: [1, 10, 1] },
        baseWhere: function (v) { return v.e1 > v.e2; },
        diagram: { id: 'f2s13-circuit', state: function (v) { return { c: loop(v), vals: true }; } },
        prompt: function (v) { return '<p>En la malla del dibujo, $\\varepsilon_1 = ' + v.e1 + '\\ \\text{V}$ y $\\varepsilon_2 = ' + v.e2 + '\\ \\text{V}$ tienen su terminal $+$ hacia arriba, así que empujan en sentidos opuestos. Con $R_1 = ' + v.a + '\\ \\Omega$ y $R_2 = ' + v.b + '\\ \\Omega$, ¿cuánta corriente circula, en A?</p>'; },
        check: 'numeric', unit: 'A',
        answer: loopI,
        mistakes: {
          sum: function (v) { return (v.e1 + v.e2) / (v.a + v.b); },
          drop: function (v) { return v.e1 / (v.a + v.b); }
        },
        feedback: [
          { when: 'sum', say: 'Sumaste las dos baterías, pero se oponen: al recorrer la malla una se cruza de $-$ a $+$ y la otra de $+$ a $-$.' },
          { when: 'drop', say: 'Te faltó $\\varepsilon_2$: cada batería que cruzas aporta $+\\varepsilon$ o $-\\varepsilon$.' }
        ],
        oracle: { lab: 'call', mod: 'kirchhoff', fn: 'nodal', args: function (v) { return [loop(v)]; }, field: 'Iup.0' },
        hint: 'Recorre en horario: $+\\varepsilon_1 - IR_1 - \\varepsilon_2 - IR_2 = 0$.',
        solution: function (v) { return '$$' + v.e1 + ' - ' + v.a + 'I - ' + v.e2 + ' - ' + v.b + 'I = 0 \\;\\Rightarrow\\; I = \\frac{' + v.e1 + ' - ' + v.e2 + '}{' + v.a + ' + ' + v.b + '} = ' + fx(loopI(v)) + '\\ \\text{A}$$ en sentido horario.'; }
      },
      {
        id: 'f2-s13-signo', title: 'Concepto: el signo de un término',
        vars: { k: [0, 3, 1] },
        prompt: function (v) {
          var what = ['Recorres un resistor $R$ <strong>en el mismo sentido</strong> que la flecha de su corriente $I$.', 'Recorres un resistor $R$ <strong>en sentido contrario</strong> a la flecha de su corriente $I$.',
            'Cruzas una batería $\\varepsilon$ de su terminal $-$ a su terminal $+$.', 'Cruzas una batería $\\varepsilon$ de su terminal $+$ a su terminal $-$.'][v.k];
          return '<p>' + what + ' ¿Qué término escribes en la ecuación de malla?</p>';
        },
        check: 'choice',
        options: function (v) {
          if (v.k < 2) return [
            { text: '$-IR$', correct: v.k === 0, say: 'Eso es al recorrerlo a favor de la corriente: el potencial baja.' },
            { text: '$+IR$', correct: v.k === 1, say: 'Eso es al recorrerlo en contra de la corriente: el potencial sube.' },
            { text: '$0$', say: 'Por un resistor con corriente sí cambia el potencial: $V = IR$.' },
            { text: 'Depende de si $I$ sale positiva o negativa', say: 'El signo del término sale de tus flechas, no del resultado. El valor de $I$ (con su signo) se resuelve después.' }
          ];
          return [
            { text: '$+\\varepsilon$', correct: v.k === 2, say: 'Eso es al cruzarla de $-$ a $+$: el potencial sube.' },
            { text: '$-\\varepsilon$', correct: v.k === 3, say: 'Eso es al cruzarla de $+$ a $-$: el potencial baja.' },
            { text: '$0$', say: 'Una batería ideal cambia el potencial en $\\varepsilon$, con o sin corriente.' },
            { text: 'Depende del sentido de la corriente', say: 'En una batería el signo solo depende de cómo la cruzas, no de la corriente.' }
          ];
        },
        answer: function (v) { return ['$-IR$', '$+IR$', '$+\\varepsilon$', '$-\\varepsilon$'][v.k]; },
        hint: 'En un resistor el potencial baja en el sentido de la corriente; en una batería sube de $-$ a $+$.',
        solution: function (v) { return ['A favor de la corriente el potencial baja: $-IR$.', 'En contra de la corriente el potencial sube: $+IR$.', 'De $-$ a $+$ el potencial sube: $+\\varepsilon$.', 'De $+$ a $-$ el potencial baja: $-\\varepsilon$.'][v.k]; }
      },
      {
        id: 'f2-s13-central', title: 'Corriente en la rama central',
        vars: { e1: [6, 24, 1], e2: [3, 18, 1], a: [1, 8, 1], b: [1, 8, 1], c: [1, 8, 1] },
        diagram: { id: 'f2s13-circuit', state: function (v) { return { c: two(v), vals: true }; } },
        prompt: function (v) { return '<p>En el circuito de dos mallas, $\\varepsilon_1 = ' + v.e1 + '\\ \\text{V}$, $R_1 = ' + v.a + '\\ \\Omega$, $R_2 = ' + v.b + '\\ \\Omega$ (rama central), $R_3 = ' + v.c + '\\ \\Omega$ y $\\varepsilon_2 = ' + v.e2 + '\\ \\text{V}$, las dos baterías con su $+$ hacia arriba. ¿Cuánta corriente pasa por $R_2$, en A?</p>'; },
        check: 'numeric', unit: 'A',
        answer: function (v) { return twoSol(v).I2; },
        mistakes: {
          isolated: function (v) { return v.e1 / (v.a + v.b); },
          both: function (v) { return v.e1 / (v.a + v.b) + v.e2 / (v.b + v.c); },
          node: function (v) { return Math.abs((v.e1 / v.a - v.e2 / v.c) / (1 + v.b / v.a - v.b / v.c)); }
        },
        feedback: [
          { when: 'isolated', say: 'Resolviste la malla izquierda como si estuviera sola. Por $R_2$ pasa la corriente de las dos ramas: necesitas la regla de nodos.' },
          { when: 'both', say: 'Sumaste las corrientes de cada malla resuelta por separado. Cada malla afecta a la otra: plantea el nodo y las dos mallas juntas.' },
          { when: 'node', say: 'Revisa la regla de nodos: con $I_1$ e $I_3$ hacia arriba e $I_2$ hacia abajo, entran $I_1$ e $I_3$ y sale $I_2$: $I_2 = I_1 + I_3$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return -K().nodal(two(v)).Iup[1]; } },
        hint: 'Con $I_1$ ↑, $I_2$ ↓, $I_3$ ↑: $I_2 = I_1 + I_3$, $\\varepsilon_1 = R_1I_1 + R_2I_2$ y $\\varepsilon_2 = R_3I_3 + R_2I_2$. Despeja $I_1$ e $I_3$ y sustituye en el nodo.',
        solution: function (v) {
          var s = twoSol(v);
          return 'Nodo: $I_2 = I_1 + I_3$. Mallas: $' + v.e1 + ' = ' + v.a + 'I_1 + ' + v.b + 'I_2$ y $' + v.e2 + ' = ' + v.c + 'I_3 + ' + v.b + 'I_2$. Sustituyendo: $$\\frac{' + v.e1 + ' - ' + v.b + 'I_2}{' + v.a + '} + \\frac{' + v.e2 + ' - ' + v.b + 'I_2}{' + v.c + '} = I_2 \\;\\Rightarrow\\; I_2 = ' + fx(s.I2) + '\\ \\text{A}$$ hacia abajo.';
        }
      },
      {
        id: 'f2-s13-lateral', title: 'Corriente con su signo',
        vars: { e1: [6, 24, 1], e2: [1, 12, 1], a: [1, 8, 1], b: [1, 8, 1], c: [1, 8, 1] },
        baseWhere: function (v) { return Math.abs(twoSol(v).I3) >= 0.1; },
        diagram: { id: 'f2s13-circuit', state: function (v) { return { c: two(v), vals: true, dirs: DIRS }; } },
        prompt: function (v) { return '<p>Mismo tipo de circuito: $\\varepsilon_1 = ' + v.e1 + '\\ \\text{V}$, $R_1 = ' + v.a + '\\ \\Omega$, $R_2 = ' + v.b + '\\ \\Omega$, $R_3 = ' + v.c + '\\ \\Omega$ y $\\varepsilon_2 = ' + v.e2 + '\\ \\text{V}$. Elegiste las flechas del dibujo: $I_3$ <strong>hacia arriba</strong> en la rama derecha. ¿Cuánto vale $I_3$, con su signo, en A?</p>'; },
        check: 'numeric', unit: 'A',
        answer: function (v) { return twoSol(v).I3; },
        mistakes: {
          flip: function (v) { return -twoSol(v).I3; },
          isolated: function (v) { return v.e2 / (v.b + v.c); }
        },
        feedback: [
          { when: 'flip', say: 'Esa es la corriente en el sentido contrario. Con la flecha hacia arriba, el signo de tu respuesta tiene que decir si va con la flecha (+) o al revés (−).' },
          { when: 'isolated', say: 'Resolviste la malla derecha sola. Por $R_2$ también pasa la corriente de la izquierda: usa la regla de nodos.' }
        ],
        oracle: { lab: 'call', mod: 'kirchhoff', fn: 'nodal', args: function (v) { return [two(v)]; }, field: 'Iup.2' },
        hint: 'Primero $I_2 = \\dfrac{\\varepsilon_1/R_1 + \\varepsilon_2/R_3}{1 + R_2/R_1 + R_2/R_3}$; luego $I_3 = (\\varepsilon_2 - R_2I_2)/R_3$. Si sale negativa, va hacia abajo.',
        solution: function (v) {
          var s = twoSol(v);
          return '$I_2 = ' + fx(s.I2, 3) + '$ A (nodo y mallas, como en el ejemplo 2). $$I_3 = \\frac{' + v.e2 + ' - ' + v.b + '(' + fx(s.I2, 3) + ')}{' + v.c + '} = ' + sg(s.I3) + '\\ \\text{A}$$' + (s.I3 < 0 ? 'Negativa: la corriente real baja por la rama derecha y $\\varepsilon_2$ se está cargando.' : 'Positiva: sube, como supusiste.');
        }
      },
      {
        id: 'f2-s13-vab', title: 'Voltaje entre dos puntos',
        vars: { e1: [6, 24, 1], e2: [3, 18, 1], a: [1, 8, 1], b: [1, 8, 1], c: [1, 8, 1] },
        diagram: { id: 'f2s13-circuit', state: function (v) { return { c: two(v), vals: true }; } },
        prompt: function (v) { return '<p>En el circuito de dos mallas ($\\varepsilon_1 = ' + v.e1 + '\\ \\text{V}$, $R_1 = ' + v.a + '\\ \\Omega$, $R_2 = ' + v.b + '\\ \\Omega$, $R_3 = ' + v.c + '\\ \\Omega$, $\\varepsilon_2 = ' + v.e2 + '\\ \\text{V}$), ¿cuánto vale $V_a - V_b$, del nodo de arriba al de abajo, en V?</p>'; },
        check: 'numeric', unit: 'V',
        answer: function (v) { var s = twoSol(v); return v.e1 - v.a * s.I1; },
        mistakes: {
          signIR: function (v) { var s = twoSol(v); return v.e1 + v.a * s.I1; },
          flip: function (v) { return -twoSol(v).V; }
        },
        feedback: [
          { when: 'signIR', say: 'Subiendo por la rama izquierda vas a favor de $I_1$: en $R_1$ el potencial <strong>baja</strong>, $V_a - V_b = \\varepsilon_1 - I_1R_1$.' },
          { when: 'flip', say: 'Ese es $V_b - V_a$. Camina de $b$ hacia $a$ y suma los cambios.' }
        ],
        oracle: { lab: 'call', mod: 'kirchhoff', fn: 'nodal', args: function (v) { return [two(v)]; }, field: 'V' },
        hint: 'Resuelve las corrientes y camina de $b$ a $a$ por la rama que quieras: por la del centro, $V_a - V_b = I_2R_2$.',
        solution: function (v) { var s = twoSol(v); return 'Con $I_1 = ' + fx(s.I1, 3) + '$ A e $I_2 = ' + fx(s.I2, 3) + '$ A: $$V_a - V_b = \\varepsilon_1 - I_1R_1 = I_2R_2 = ' + fx(s.V) + '\\ \\text{V}$$'; }
      },
      {
        id: 'f2-s13-potencia', title: 'Potencia de una batería',
        vars: { e1: [3, 24, 1], e2: [3, 24, 1], a: [1, 10, 1], b: [1, 10, 1] },
        baseWhere: function (v) { return v.e1 !== v.e2; },
        diagram: { id: 'f2s13-circuit', state: function (v) { return { c: loop(v), vals: true }; } },
        prompt: function (v) { return '<p>En la malla del dibujo, $\\varepsilon_1 = ' + v.e1 + '\\ \\text{V}$ y $\\varepsilon_2 = ' + v.e2 + '\\ \\text{V}$ se oponen (las dos con su $+$ hacia arriba), con $R_1 = ' + v.a + '\\ \\Omega$ y $R_2 = ' + v.b + '\\ \\Omega$. ¿Qué potencia entrega $\\varepsilon_2$, en W? Si se está cargando, la respuesta es negativa.</p>'; },
        check: 'numeric', unit: 'W',
        answer: function (v) { return v.e2 * (v.e2 - v.e1) / (v.a + v.b); },
        mistakes: {
          flip: function (v) { return v.e2 * (v.e1 - v.e2) / (v.a + v.b); },
          heat: function (v) { var I = (v.e1 - v.e2) / (v.a + v.b); return I * I * v.b; }
        },
        feedback: [
          { when: 'flip', say: 'El signo está al revés. $\\varepsilon_2$ entrega energía solo si la corriente la cruza de $-$ a $+$; si la cruza de $+$ a $-$ (cuando $\\varepsilon_1$ es mayor), se está cargando y su potencia es negativa.' },
          { when: 'heat', say: 'Eso es lo que disipa $R_2$, $I^2R_2$. La potencia de la batería es $\\varepsilon_2 I$, con su signo.' }
        ],
        oracle: { lab: 'call', mod: 'kirchhoff', fn: 'nodal', args: function (v) { return [loop(v)]; }, field: 'P.src.E2' },
        hint: 'Calcula $I$ en horario: $I = (\\varepsilon_1 - \\varepsilon_2)/(R_1 + R_2)$. En horario, la corriente cruza $\\varepsilon_2$ de $+$ a $-$, así que $P_2 = -\\varepsilon_2 I$.',
        solution: function (v) {
          var I = (v.e1 - v.e2) / (v.a + v.b), P = v.e2 * (v.e2 - v.e1) / (v.a + v.b);
          return '$I = \\dfrac{' + v.e1 + ' - ' + v.e2 + '}{' + v.a + ' + ' + v.b + '} = ' + sg(I) + '$ A en horario, que cruza $\\varepsilon_2$ de $+$ a $-$: $$P_2 = -\\varepsilon_2 I = -(' + v.e2 + ')(' + sg(I) + ') = ' + sg(P) + '\\ \\text{W}$$' + (P < 0 ? '$\\varepsilon_2$ se está cargando.' : '$\\varepsilon_2$ es la que gana: entrega energía.');
        }
      },
      {
        id: 'f2-s13-negativa', title: 'Concepto: una corriente negativa',
        vars: { x: [2, 30, 1] },
        prompt: function (v) { return '<p>Resolviste un circuito con Kirchhoff y te salió $I_2 = -' + fx(v.x / 10, 1) + '\\ \\text{A}$, con la flecha de $I_2$ hacia abajo. ¿Qué significa?</p>'; },
        check: 'choice',
        options: function (v) {
          var m = fx(v.x / 10, 1);
          return [
            { text: 'La corriente real mide ' + m + ' A y va hacia arriba', correct: true },
            { text: 'Te equivocaste: una corriente no puede ser negativa', say: 'Sí puede, con respecto a tu flecha: el signo dice que va al revés de como supusiste.' },
            { text: 'Hay que repetir todo con la flecha hacia arriba', say: 'No hace falta: el resultado ya te dice que mide ' + m + ' A hacia arriba.' },
            { text: 'La corriente real mide ' + m + ' A y va hacia abajo', say: 'Hacia abajo era tu suposición; el signo negativo dice que va al revés.' }
          ];
        },
        answer: function (v) { return 'La corriente real mide ' + fx(v.x / 10, 1) + ' A y va hacia arriba'; },
        hint: 'La flecha es una suposición; el signo del resultado compara la corriente real con ella.',
        solution: function (v) { return 'El signo negativo dice que la corriente va al revés de tu flecha: mide $' + fx(v.x / 10, 1) + '$ A hacia arriba. No hay que volver a resolver.'; }
      }
    ],

    quiz: { tags: ['f2.S13'], count: 8 },

    errors: [
      'Poner $-IR$ en todos los resistores. Solo baja si lo recorres a favor de la corriente que elegiste; en contra es $+IR$.',
      'Darle a una batería el signo según la corriente. El signo de $\\varepsilon$ solo depende de cómo la cruzas: de $-$ a $+$ sube.',
      'Cambiar el sentido de una flecha a media cuenta (una flecha en el nodo y otra en la malla).',
      'Resolver cada malla como si estuviera sola y olvidar que la rama compartida lleva las dos corrientes (la regla de nodos).',
      'Pensar que una corriente negativa es un error: solo dice que va al revés de la flecha.',
      'Escribir más ecuaciones de malla de las necesarias (la exterior repite a las otras) y quedarse sin la de nodos.'
    ],

    teacher: {
      plan: [
        'Arranca con el circuito de dos baterías en ramas distintas: que intenten reducirlo con serie y paralelo y descubran que no se puede.',
        'Regla de nodos con la analogía del agua; regla de mallas con el explainer de las escaleras (subir y bajar y volver al mismo piso).',
        'La convención de signos con la figura de las cuatro reglas. Que digan en voz alta, para cada término, «a favor, baja» o «de menos a más, sube».',
        'Procedimiento completo con el explainer y los ejemplos; luego el lab con el ejemplo cargado (todos los resistores con −) y con circuitos al azar.'
      ],
      check: [
        'Que usen las mismas flechas en la regla de nodos y en las mallas.',
        'Que interpreten una corriente negativa sin volver a resolver, y que cierren con el balance de potencias o con $V_a - V_b$ por dos caminos.'
      ],
      note: 'Aquí bastan circuitos de una y dos mallas resueltos a mano por sustitución. Los sistemas más grandes y los capacitores en estado estable quedan para la S14.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §10.3 “Kirchhoff\'s Rules”. <a href="https://openstax.org/books/university-physics-volume-2/pages/10-3-kirchhoffs-rules">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-12',
    next: 'sesion-14'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
