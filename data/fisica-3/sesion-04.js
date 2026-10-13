/* =====================================================================
   Física 3 · S04 · Fuerza magnética sobre un conductor con corriente y efecto Hall
   (bloque A · Fuerza magnética).
   Fuentes: OpenStax, University Physics Volume 2, §11.4 y §11.6 (CC BY-NC-SA 4.0).
   El efecto Hall va solo como detalle de la lección: sin lab, ejercicios ni banco.
   g = 9.81 m/s². Las cuentas se hacen aquí con fórmulas propias y
   scripts/examples.test.js las compara contra LabMath.wire (lab wire-force).
   ===================================================================== */
(function () {
  var RAD = Math.PI / 180, G = 9.81;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function sg(x) { return x < 0 ? '(' + fx(x, 2) + ')' : fx(x, 2); }
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

  // Ejemplo 1: I = 8.0 A, L = 0.50 m, B = 0.30 T, θ = 60°.
  var e1 = { I: 8.0, L: 0.50, B: 0.30, th: 60 }; e1.F = e1.I * e1.L * e1.B * Math.sin(e1.th * RAD);
  // Ejemplo 2: I = 5.0 A, L = (0.20, 0.10, 0) m, B = (0, 0, 0.40) T.
  var e2 = { I: 5.0, L: [0.20, 0.10, 0], B: [0, 0, 0.40] };
  e2.c = [e2.L[1] * e2.B[2] - e2.L[2] * e2.B[1], e2.L[2] * e2.B[0] - e2.L[0] * e2.B[2], e2.L[0] * e2.B[1] - e2.L[1] * e2.B[0]];
  e2.F = e2.c.map(function (x) { return e2.I * x; }); e2.mag = Math.hypot(e2.F[0], e2.F[1], e2.F[2]);
  // Ejemplo 3: varilla de 20 g y 25 cm en 0.40 T.
  var e3 = { m: 0.020, L: 0.25, B: 0.40 }; e3.I = e3.m * G / (e3.L * e3.B);
  // Ejemplo 4: semicírculo de radio 10 cm con 3.0 A en 0.50 T.
  var e4 = { I: 3.0, R: 0.10, B: 0.50 }; e4.F = 2 * e4.I * e4.R * e4.B; e4.wrong = e4.I * Math.PI * e4.R * e4.B;

  var DIRS = [
    { I: 'hacia la derecha', B: 'entra a la hoja', F: 'Hacia arriba (en la hoja)', why: '$\\vec L = +\\hat\\imath$, $\\vec B = -\\hat k$: $\\hat\\imath \\times (-\\hat k) = +\\hat\\jmath$.' },
    { I: 'hacia arriba', B: 'entra a la hoja', F: 'Hacia la izquierda', why: '$\\vec L = +\\hat\\jmath$, $\\vec B = -\\hat k$: $\\hat\\jmath \\times (-\\hat k) = -\\hat\\imath$.' },
    { I: 'hacia la derecha', B: 'sale de la hoja', F: 'Hacia abajo (en la hoja)', why: '$\\vec L = +\\hat\\imath$, $\\vec B = +\\hat k$: $\\hat\\imath \\times \\hat k = -\\hat\\jmath$.' },
    { I: 'hacia abajo', B: 'sale de la hoja', F: 'Hacia la izquierda', why: '$\\vec L = -\\hat\\jmath$, $\\vec B = +\\hat k$: $(-\\hat\\jmath) \\times \\hat k = -\\hat\\imath$.' }
  ];
  var ALL = ['Hacia arriba (en la hoja)', 'Hacia abajo (en la hoja)', 'Hacia la izquierda', 'Hacia la derecha'];

  var data = window.SESSION_DATA = {
    slug: 'sesion-04', number: '04', group: 'A · Fuerza magnética',
    title: 'Fuerza magnética sobre un conductor con corriente y efecto Hall', temario: [],
    minutes: 120,
    quote: 'Un alambre con corriente es un río de cargas en movimiento: el campo magnético empuja a cada una, y la suma es $\\vec F = I\\vec L \\times \\vec B$.',
    badges: [
      'Deducir $\\vec F = I\\vec L \\times \\vec B$ a partir de la fuerza sobre las cargas que se mueven en el alambre.',
      'Calcular la magnitud $ILB\\sin\\theta$ y la dirección de la fuerza sobre un tramo recto.',
      'Usar que, en un campo uniforme, un alambre doblado siente lo mismo que el segmento recto entre sus extremos.',
      'Plantear el equilibrio de una varilla que flota por la fuerza magnética.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Una corriente son cargas en movimiento. Si el campo magnético empuja a cada carga que se mueve, también empuja al alambre que las contiene.',
        recall: [
          'La corriente en términos de los portadores, $I = nqv_dA$ (<a href="../../../fisica-2/sesiones/sesion-11/">Física 2 · S11</a>).',
          'La fuerza sobre una carga, $\\vec F = q\\vec v \\times \\vec B$, y la regla de la mano derecha (<a href="../sesion-02/">S02</a>).',
          'Equilibrio de fuerzas: $\\sum \\vec F = 0$ (<a href="../../../fisica-1/sesiones/sesion-08/">Física 1 · S08</a>).'
        ],
        why: 'Esta fuerza mueve los motores eléctricos, las bocinas y los discos duros, y con ella se define el ampere. En la sesión 5 la usamos para encontrar el torque sobre una espira.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Imagina un tubo lleno de canicas que avanzan despacio. Si a cada canica le da un empujón de lado, el tubo entero se va de lado: las canicas lo empujan desde adentro.',
          'Así pasa con un alambre: los electrones que forman la corriente sienten la fuerza magnética y se la pasan al alambre. Por eso un alambre con corriente se mueve si lo pones entre los polos de un imán.'
        ]
      },
      {
        type: 'explainer', heading: 'De las cargas al alambre', short: 'De las cargas al alambre',
        title: 'Por qué F = I L × B',
        intro: 'Sumamos la fuerza magnética sobre todas las cargas que se mueven en un tramo de alambre.',
        diagram: 'f3s04-carriers',
        steps: [
          { text: 'Un tramo de alambre de largo $L$ y sección $A$ lleva una corriente $I$ hacia la derecha, en un campo que entra a la hoja.', state: { show: 0 } },
          { text: 'Adentro hay $n$ portadores por unidad de volumen, cada uno con carga $q$ y velocidad de deriva $\\vec v_d$. En el tramo hay $nAL$ portadores.', state: { show: 1 } },
          { text: 'Cada uno siente $q\\vec v_d \\times \\vec B$. Todas las fuerzas son iguales y apuntan hacia arriba.', state: { show: 2 } },
          { text: 'La suma es $\\vec F = (nAL)\\,q\\vec v_d \\times \\vec B$. Como $I = nqv_dA$, queda $\\vec F = I\\vec L \\times \\vec B$, con $\\vec L$ apuntando en el sentido de la corriente.', state: { show: 3 } }
        ]
      },
      {
        type: 'concept', heading: 'La fuerza sobre un tramo recto', short: 'Tramo recto',
        body: [
          'Para un tramo recto de largo $L$ en un campo uniforme: $$\\vec F = I\\vec L \\times \\vec B \\qquad F = ILB\\sin\\theta$$ donde $\\vec L$ tiene el largo del tramo y apunta en el sentido de la corriente, y $\\theta$ es el ángulo entre el alambre y $\\vec B$.',
          'La fuerza es perpendicular al alambre y al campo. Para la dirección usa la mano derecha como en la sesión 2, con $I\\vec L$ en lugar de $q\\vec v$: dedos en el sentido de la corriente, dóblalos hacia $\\vec B$, y el pulgar marca $\\vec F$. Aquí no hay que preocuparse por el signo de los portadores: la corriente ya lleva el sentido convencional.',
          'Si el alambre va a lo largo de $\\vec B$, la fuerza es cero. La fuerza por unidad de longitud, $F/L = IB\\sin\\theta$, es útil cuando el alambre es largo.'
        ],
        diagram: 'f3s04-angle', state: { th: 40 },
        caption: 'Con $\\vec B$ en la hoja, la fuerza sale o entra de ella.'
      },
      {
        type: 'concept', heading: 'Alambres doblados', short: 'Alambres doblados',
        body: [
          'Si el alambre no es recto, se parte en trocitos $d\\vec l$ y se suman las fuerzas: $$\\vec F = \\int I\\,d\\vec l \\times \\vec B$$',
          'Si el campo es <strong>uniforme</strong>, $\\vec B$ sale de la integral y queda $\\vec F = I\\left(\\int d\\vec l\\right) \\times \\vec B$. La suma de todos los $d\\vec l$ es el vector que va del principio al final del alambre. Así que <strong>un alambre doblado siente lo mismo que el segmento recto que une sus extremos</strong>, sin importar la forma.',
          'Consecuencia: sobre una espira <strong>cerrada</strong> en un campo uniforme, la fuerza neta es cero, porque el principio y el final coinciden. Eso no quiere decir que la espira se quede quieta: puede girar. El torque es el tema de la sesión 5.'
        ],
        diagram: 'f3s04-bent',
        caption: 'Las componentes horizontales se cancelan y queda la fuerza de la cuerda $2R$.'
      },
      {
        type: 'concept', heading: 'Una varilla que flota', short: 'Varilla que flota',
        body: [
          'Una varilla horizontal de masa $m$ y largo $L$ con corriente, en un campo horizontal perpendicular a ella, siente una fuerza vertical $ILB$. Si la corriente va en el sentido correcto, la fuerza apunta hacia arriba y puede igualar al peso: $$ILB = mg \\qquad\\Longrightarrow\\qquad I = \\frac{mg}{LB}$$',
          'Este equilibrio es la idea de la <strong>balanza de corriente</strong>, con la que históricamente se midieron campos y corrientes.'
        ],
        diagram: 'f3s04-rod',
        caption: 'La fuerza magnética sostiene a la varilla si $ILB = mg$.'
      },
      {
        type: 'callout', heading: 'Detalle: el efecto Hall',
        body: [
          'Si la corriente pasa por una placa delgada en un campo perpendicular a ella, los portadores se desvían hacia un borde: ahí se acumula carga de su signo y en el borde opuesto, carga del signo contrario. Aparece un campo eléctrico transversal que crece hasta equilibrar la fuerza magnética, $qE = qv_dB$, y entre los bordes se mide el <strong>voltaje de Hall</strong>: $$V_H = v_dBw = \\frac{IB}{nqt}$$ con $w$ el ancho y $t$ el grosor de la placa.',
          'El signo de $V_H$ dice el signo de los portadores (así se comprobó que en los metales son electrones) y su tamaño mide $B$: los sensores Hall están en los celulares y en los autos.'
        ],
        diagram: 'f3s04-hall',
        caption: 'Los electrones se acumulan arriba y aparece un voltaje entre los bordes.'
      },
      {
        type: 'recipe', heading: 'Receta: fuerza sobre un conductor', short: 'Receta',
        steps: [
          { text: 'Dibuja el alambre y marca el sentido de la corriente: $\\vec L$ apunta así.' },
          { text: 'Si el tramo es recto: $F = ILB\\sin\\theta$, con $L$ en metros, $B$ en teslas y $\\theta$ el ángulo entre el alambre y $\\vec B$.', tip: 'Con $L$ en cm y $B$ en mT, recuerda: $1\\ \\text{cm} = 10^{-2}$ m y $1\\ \\text{mT} = 10^{-3}$ T.' },
          { text: 'Dirección: mano derecha de $\\vec L$ hacia $\\vec B$. Por componentes, $\\vec F = I\\vec L \\times \\vec B$ con el determinante.' },
          { text: 'Si el alambre está doblado y el campo es uniforme, cambia el alambre por el segmento recto entre sus extremos.', tip: 'No uses el largo del camino: usa la distancia entre los extremos.' },
          { text: 'Si hay equilibrio (varilla que flota o cuelga), suma la fuerza magnética con el peso y las demás fuerzas.' }
        ]
      },
      {
        type: 'example', heading: 'Un tramo recto oblicuo',
        problem: '<p>Un alambre recto de $' + fx(e1.L, 2) + '\\ \\text{m}$ lleva $' + fx(e1.I, 1) + '\\ \\text{A}$ y forma $' + e1.th + '^\\circ$ con un campo uniforme de $' + fx(e1.B, 2) + '\\ \\text{T}$. ¿Qué fuerza siente?</p>',
        steps: [
          { text: 'Magnitud con el ángulo entre el alambre y el campo.', math: 'F = ILB\\sin\\theta = (' + fx(e1.I, 1) + ')(' + fx(e1.L, 2) + ')(' + fx(e1.B, 2) + ')\\sin ' + e1.th + '^\\circ = ' + fx(e1.F, 3) + '\\ \\text{N}' },
          { text: 'La dirección es perpendicular al plano que forman el alambre y el campo; el sentido sale de la mano derecha.' }
        ],
        answer: '$F = ' + fx(e1.F, 3) + '\\ \\text{N}$, perpendicular al alambre y al campo.',
        verify: { lab: 'call', mod: 'wire', fn: 'magnitude', args: [e1.I, e1.L, e1.B, e1.th], value: e1.F }
      },
      {
        type: 'example', heading: 'Fuerza por componentes',
        problem: '<p>Un tramo de alambre va del origen al punto $(0.20,\\ 0.10,\\ 0)\\ \\text{m}$ y lleva $' + fx(e2.I, 1) + '\\ \\text{A}$ en ese sentido. El campo es $\\vec B = (0,\\ 0,\\ 0.40)\\ \\text{T}$. Calcula $\\vec F$.</p>',
        steps: [
          { text: 'El vector $\\vec L$ va en el sentido de la corriente, del inicio al final.', math: '\\vec L = (0.20,\\ 0.10,\\ 0)\\ \\text{m}' },
          { text: 'Producto cruz ($\\vec L$ en medio, $\\vec B$ abajo).', math: '\\vec L \\times \\vec B = (L_yB_z - L_zB_y,\\ L_zB_x - L_xB_z,\\ L_xB_y - L_yB_x) = (' + e2.c.map(function (x) { return fx(x, 3); }).join(',\\ ') + ')\\ \\text{m·T}' },
          { text: 'Multiplica por la corriente.', math: '\\vec F = I\\vec L \\times \\vec B = (' + e2.F.map(function (x) { return fx(x, 2); }).join(',\\ ') + ')\\ \\text{N},\\qquad |\\vec F| = ' + fx(e2.mag, 3) + '\\ \\text{N}' }
        ],
        answer: '$\\vec F = (' + e2.F.map(function (x) { return fx(x, 2); }).join(',\\ ') + ')\\ \\text{N}$, de magnitud $' + fx(e2.mag, 3) + '\\ \\text{N}$.',
        verify: { lab: 'call', mod: 'wire', fn: 'force', args: [e2.I, e2.L, e2.B], values: { x: e2.F[0], y: e2.F[1], z: e2.F[2], mag: e2.mag } }
      },
      {
        type: 'example', heading: 'La varilla que flota',
        problem: '<p>Una varilla de $' + fx(e3.m * 1000, 0) + '\\ \\text{g}$ y $' + fx(e3.L * 100, 0) + '\\ \\text{cm}$ está en un campo horizontal de $' + fx(e3.B, 2) + '\\ \\text{T}$, perpendicular a ella. ¿Qué corriente la hace flotar?</p>',
        steps: [
          { text: 'Para flotar, la fuerza magnética hacia arriba iguala al peso.', math: 'ILB = mg' },
          { text: 'Despeja la corriente (con la masa en kg y el largo en m).', math: 'I = \\frac{mg}{LB} = \\frac{(' + fx(e3.m, 3) + ')(9.81)}{(' + fx(e3.L, 2) + ')(' + fx(e3.B, 2) + ')} = ' + fx(e3.I, 2) + '\\ \\text{A}' },
          { text: 'El sentido de la corriente debe ser tal que $I\\vec L \\times \\vec B$ apunte hacia arriba; con la otra, la varilla se hunde con el doble de fuerza neta.' }
        ],
        answer: '$I = ' + fx(e3.I, 2) + '\\ \\text{A}$.',
        verify: { lab: 'call', mod: 'wire', fn: 'levitate', args: [e3.m, e3.L, e3.B], value: e3.I }
      },
      {
        type: 'example', heading: 'Un alambre en semicírculo',
        problem: '<p>Un alambre en forma de semicírculo de radio $' + fx(e4.R * 100, 0) + '\\ \\text{cm}$ lleva $' + fx(e4.I, 1) + '\\ \\text{A}$ en un campo uniforme de $' + fx(e4.B, 2) + '\\ \\text{T}$ perpendicular a su plano. ¿Cuánto vale la fuerza neta sobre él?</p>',
        steps: [
          { text: 'En un campo uniforme, el semicírculo siente lo mismo que el segmento recto entre sus extremos: un diámetro, $2R$.', math: 'L_{\\text{ef}} = 2R = ' + fx(2 * e4.R, 2) + '\\ \\text{m}' },
          { text: 'El segmento es perpendicular a $\\vec B$.', math: 'F = I(2R)B = (' + fx(e4.I, 1) + ')(' + fx(2 * e4.R, 2) + ')(' + fx(e4.B, 2) + ') = ' + fx(e4.F, 2) + '\\ \\text{N}' },
          { text: 'Ojo: con el largo del arco, $\\pi R$, saldría $' + fx(e4.wrong, 3) + '$ N, que está mal: las componentes de lado se cancelan.' }
        ],
        answer: '$F = ' + fx(e4.F, 2) + '\\ \\text{N}$, perpendicular al diámetro que une los extremos.',
        verify: { lab: 'call', mod: 'wire', fn: 'arcForce', args: [e4.I, e4.R, e4.B, 180], value: e4.F }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: 'Si los portadores son electrones, ¿hay que invertir la fuerza?', a: 'No. Los electrones van al revés de la corriente y tienen carga negativa: las dos inversiones se cancelan. Con $I\\vec L \\times \\vec B$, $\\vec L$ en el sentido de la corriente convencional, ya sale bien.' },
          { q: '¿Qué ángulo uso?', a: 'El ángulo entre el alambre (en el sentido de la corriente) y $\\vec B$. Si el alambre es perpendicular al campo, $\\sin\\theta = 1$.' },
          { q: '¿Por qué la forma del alambre no importa en un campo uniforme?', a: 'Porque $\\vec B$ sale de la integral y la suma de los $d\\vec l$ es solo el vector del inicio al final. En un campo no uniforme sí importa.' },
          { q: 'Si la fuerza neta sobre una espira es cero, ¿cómo funciona un motor?', a: 'Las fuerzas sobre lados opuestos se cancelan, pero no actúan sobre la misma línea: hacen un torque que la hace girar. Lo vemos en la sesión 5.' },
          { q: '¿La fuerza sobre el alambre hace trabajo, si la magnética no hace trabajo sobre las cargas?', a: 'El trabajo lo entrega la fuente que mantiene la corriente: el campo magnético solo canaliza la energía, pasándola del movimiento a lo largo del alambre al movimiento del alambre.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          '$\\vec F = I\\vec L \\times \\vec B$, con $\\vec L$ en el sentido de la corriente; $F = ILB\\sin\\theta$.',
          'La fuerza es perpendicular al alambre y al campo; si el alambre va a lo largo de $\\vec B$, es cero.',
          'En un campo uniforme, un alambre doblado siente lo mismo que el segmento recto entre sus extremos; una espira cerrada, fuerza neta cero.',
          'Varilla que flota: $ILB = mg$.',
          'Detalle: en el efecto Hall, $V_H = IB/(nqt)$ y su signo da el signo de los portadores.'
        ]
      }
    ],

    lab: {
      type: 'wire-force', title: 'La fuerza sobre un alambre',
      intro: 'En el modo Tramo recto, gira el alambre respecto al campo y cambia la corriente, el largo y el campo: mira cuándo la fuerza sale o entra de la hoja y cuándo se anula. Con el campo entrando a la hoja, la fuerza queda en el plano. En el modo Alambre doblado, compara la fuerza de cada trocito con la fuerza neta, que es la del segmento recto entre los extremos. En el reto das la magnitud en mN y la dirección; el lab te dice si usaste el largo del camino, si usaste $\\cos\\theta$ o si la dirección quedó al revés.',
      cfg: {}
    },

    formulas: [
      { label: 'Tramo recto', tex: '\\vec F = I\\vec L \\times \\vec B,\\quad F = ILB\\sin\\theta' },
      { label: 'Por unidad de longitud', tex: '\\frac{F}{L} = IB\\sin\\theta' },
      { label: 'Alambre cualquiera', tex: '\\vec F = \\int I\\,d\\vec l \\times \\vec B' },
      { label: 'Campo uniforme', tex: '\\vec F = I\\,\\vec L_{\\text{extremos}} \\times \\vec B,\\quad \\vec F_{\\text{espira cerrada}} = 0' },
      { label: 'Varilla que flota', tex: 'ILB = mg' },
      { label: 'Detalle: voltaje de Hall', tex: 'V_H = \\frac{IB}{nqt}' }
    ],

    exercises: [
      {
        id: 'f3-s04-magnitud', title: 'Fuerza sobre un tramo recto',
        vars: { I: [1, 15, 1], L: [10, 90, 10], B: [10, 500, 10], th: [15, 165, 15] },
        prompt: function (v) {
          return '<p>Un alambre recto de $' + v.L + '\\ \\text{cm}$ lleva $' + v.I + '\\ \\text{A}$ y forma $' + v.th + '^\\circ$ con un campo de $' + v.B + '\\ \\text{mT}$. ¿Cuánto vale la fuerza sobre él, en N?</p>';
        },
        check: 'numeric', unit: 'N',
        answer: function (v) { return v.I * v.L / 100 * v.B / 1000 * Math.sin(v.th * RAD); },
        mistakes: {
          cos: function (v) { return Math.abs(v.I * v.L / 100 * v.B / 1000 * Math.cos(v.th * RAD)); },
          cm: function (v) { return v.I * v.L * v.B / 1000 * Math.sin(v.th * RAD); }
        },
        feedback: [
          { when: 'cos', say: 'La fuerza lleva $\\sin\\theta$: es cero si el alambre va a lo largo de $\\vec B$.' },
          { when: 'cm', say: 'Pasa el largo a metros.' }
        ],
        where: function (v) { return v.th !== 90; },
        oracle: { lab: 'call', mod: 'wire', fn: 'magnitude', args: function (v) { return [v.I, v.L / 100, v.B / 1000, v.th]; } },
        hint: '$F = ILB\\sin\\theta$ con $L$ en m y $B$ en T.',
        solution: function (v) { return '$$F = ILB\\sin\\theta = (' + v.I + ')(' + fx(v.L / 100, 2) + ')(' + fx(v.B / 1000, 3) + ')\\sin ' + v.th + '^\\circ = ' + fx(v.I * v.L / 100 * v.B / 1000 * Math.sin(v.th * RAD), 4) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f3-s04-por-metro', title: 'Fuerza por metro de cable',
        vars: { I: [10, 200, 10], B: [10, 90, 5] },
        prompt: function (v) {
          return '<p>Un cable largo lleva $' + v.I + '\\ \\text{A}$ perpendicular al campo de la Tierra, de $' + v.B + '\\ \\mu\\text{T}$. ¿Cuánta fuerza siente cada metro de cable, en mN/m?</p>';
        },
        check: 'numeric', unit: 'mN/m',
        answer: function (v) { return v.I * v.B * 1e-6 * 1000; },
        mistakes: { milli: function (v) { return v.I * v.B * 1e-3 * 1000; } },
        feedback: [{ when: 'milli', say: 'Un microtesla es $10^{-6}$ T.' }],
        oracle: { lab: 'call', mod: 'wire', fn: 'magnitude', args: function (v) { return [v.I, 1, v.B * 1e-3, 90]; } },
        hint: '$F/L = IB$ con $B$ en teslas.',
        solution: function (v) { return '$$\\frac{F}{L} = IB = (' + v.I + ')(' + v.B + '\\times 10^{-6}) = ' + fx(v.I * v.B * 1e-3, 3) + '\\times 10^{-3}\\ \\text{N/m} = ' + fx(v.I * v.B * 1e-3, 3) + '\\ \\text{mN/m}$$'; }
      },
      {
        id: 'f3-s04-flota', title: 'Corriente para que flote',
        vars: { m: [5, 50, 5], L: [10, 50, 5], B: [0.1, 0.9, 0.1] },
        prompt: function (v) {
          return '<p>Una varilla de $' + v.m + '\\ \\text{g}$ y $' + v.L + '\\ \\text{cm}$ está en un campo horizontal de $' + fx(v.B, 1) + '\\ \\text{T}$, perpendicular a ella. ¿Qué corriente la hace flotar, en A? ($g = 9.81\\ \\text{m/s}^2$)</p>';
        },
        check: 'numeric', unit: 'A',
        answer: function (v) { return v.m / 1000 * G / (v.L / 100 * v.B); },
        mistakes: {
          grams: function (v) { return v.m * G / (v.L / 100 * v.B); },
          noG: function (v) { return v.m / 1000 / (v.L / 100 * v.B); }
        },
        feedback: [
          { when: 'grams', say: 'Pasa la masa a kilogramos.' },
          { when: 'noG', say: 'La fuerza magnética iguala al peso $mg$, no a la masa.' }
        ],
        oracle: { lab: 'call', mod: 'wire', fn: 'levitate', args: function (v) { return [v.m / 1000, v.L / 100, v.B]; } },
        hint: '$ILB = mg$.',
        solution: function (v) { return '$$I = \\frac{mg}{LB} = \\frac{(' + fx(v.m / 1000, 3) + ')(9.81)}{(' + fx(v.L / 100, 2) + ')(' + fx(v.B, 1) + ')} = ' + fx(v.m / 1000 * G / (v.L / 100 * v.B), 3) + '\\ \\text{A}$$'; }
      },
      {
        id: 'f3-s04-arco', title: 'Fuerza sobre un arco',
        vars: { I: [1, 10, 1], R: [5, 30, 5], B: [0.1, 1, 0.1], phi: [60, 300, 30] },
        prompt: function (v) {
          return '<p>Un alambre en forma de arco de círculo, de radio $' + v.R + '\\ \\text{cm}$ y ángulo $' + v.phi + '^\\circ$, lleva $' + v.I + '\\ \\text{A}$ en un campo uniforme de $' + fx(v.B, 1) + '\\ \\text{T}$ perpendicular a su plano. ¿Cuánto vale la fuerza neta, en N?</p>';
        },
        check: 'numeric', unit: 'N',
        answer: function (v) { return 2 * v.I * v.R / 100 * v.B * Math.sin(v.phi * RAD / 2); },
        mistakes: {
          path: function (v) { return v.I * (v.phi * RAD) * v.R / 100 * v.B; },
          diam: function (v) { return 2 * v.I * v.R / 100 * v.B; }
        },
        feedback: [
          { when: 'path', say: 'Usaste el largo del arco. En un campo uniforme cuenta la cuerda entre los extremos.' },
          { when: 'diam', say: 'Usaste el diámetro, pero el arco no es un semicírculo: la cuerda es $2R\\sin(\\varphi/2)$.' }
        ],
        where: function (v) { return v.phi !== 180; },
        oracle: { lab: 'call', mod: 'wire', fn: 'arcForce', args: function (v) { return [v.I, v.R / 100, v.B, v.phi]; } },
        hint: 'La cuerda de un arco de ángulo $\\varphi$ mide $2R\\sin(\\varphi/2)$.',
        solution: function (v) { var c = 2 * v.R / 100 * Math.sin(v.phi * RAD / 2); return '$$F = I\\,(2R\\sin\\tfrac{\\varphi}{2})\\,B = (' + v.I + ')(' + fx(c, 4) + ')(' + fx(v.B, 1) + ') = ' + fx(v.I * c * v.B, 4) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f3-s04-fy', title: 'Una componente de la fuerza',
        vars: { I: [1, 10, 1], Lx: [10, 50, 5], Bz: [-0.9, 0.9, 0.1] },
        where: function (v) { return Math.abs(v.Bz) > 0.05; },
        prompt: function (v) {
          return '<p>Un tramo de alambre va de $(0, 0, 0)$ a $(' + fx(v.Lx / 100, 2) + ',\\ 0,\\ 0)\\ \\text{m}$ y lleva $' + v.I + '\\ \\text{A}$ en ese sentido, con $\\vec B = (0,\\ 0,\\ ' + fx(v.Bz, 1) + ')\\ \\text{T}$. ¿Cuánto vale $F_y$, en N? (con signo)</p>';
        },
        check: 'numeric', unit: 'N',
        answer: function (v) { return -v.I * v.Lx / 100 * v.Bz; },
        mistakes: { plus: function (v) { return v.I * v.Lx / 100 * v.Bz; } },
        feedback: [{ when: 'plus', say: '$\\hat\\imath \\times \\hat k = -\\hat\\jmath$: hay un signo menos.' }],
        oracle: { lab: 'call', mod: 'wire', fn: 'force', field: 'y', args: function (v) { return [v.I, [v.Lx / 100, 0, 0], [0, 0, v.Bz]]; } },
        hint: '$F_y = I(L_zB_x - L_xB_z)$.',
        solution: function (v) { return '$$F_y = I(L_zB_x - L_xB_z) = -(' + v.I + ')(' + fx(v.Lx / 100, 2) + ')(' + sg(v.Bz) + ') = ' + fx(-v.I * v.Lx / 100 * v.Bz, 3) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f3-s04-direccion', title: 'Concepto: hacia dónde se mueve el alambre',
        vars: { k: [0, 3, 1] },
        prompt: function (v) { var c = DIRS[v.k]; return '<p>Un alambre recto en la hoja lleva corriente ' + c.I + ', en un campo uniforme que ' + c.B + '. ¿Hacia dónde apunta la fuerza sobre el alambre?</p>'; },
        check: 'choice',
        options: function (v) {
          var right = DIRS[v.k].F;
          return ALL.map(function (t) { return t === right ? { text: t, correct: true } : { text: t, say: 'Usa la mano derecha: dedos en el sentido de la corriente, dóblalos hacia $\\vec B$; el pulgar da $\\vec F$.' }; });
        },
        answer: function (v) { return DIRS[v.k].F; },
        hint: 'Escribe $\\vec L$ y $\\vec B$ con unitarios y haz el producto cruz.',
        solution: function (v) { return DIRS[v.k].why; }
      },
      {
        id: 'f3-s04-espira', title: 'Concepto: espira cerrada',
        vars: { k: [0, 2, 1] },
        prompt: function (v) { return '<p>Una espira ' + ['cuadrada', 'circular', 'triangular'][v.k] + ' con corriente está en un campo magnético uniforme. ¿Cuánto vale la fuerza neta sobre ella?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Cero, aunque puede sentir un torque', correct: true },
            { text: 'Depende de la forma de la espira', say: 'En un campo uniforme la forma no importa: el inicio y el final coinciden.' },
            { text: '$ILB$, con $L$ el perímetro', say: 'Las fuerzas sobre los lados opuestos se cancelan.' }
          ];
        },
        answer: function () { return 'Cero, aunque puede sentir un torque'; },
        hint: 'En un campo uniforme, la fuerza neta depende del vector del inicio al final del alambre.',
        solution: function () { return 'El vector del inicio al final de una espira cerrada es cero, así que <strong>la fuerza neta es cero</strong>. Sí puede haber torque (sesión 5).'; }
      }
    ],

    quiz: { tags: ['f3.S04'], count: 8 },

    errors: [
      'Usar el largo del camino de un alambre doblado en lugar del segmento entre sus extremos (en un campo uniforme).',
      'Usar $\\cos\\theta$: la fuerza es cero cuando el alambre va a lo largo de $\\vec B$.',
      'Invertir la fuerza por pensar en los electrones: con la corriente convencional ya sale el sentido correcto.',
      'Dejar $L$ en cm o $B$ en mT.',
      'Creer que una espira cerrada en un campo uniforme no siente nada: la fuerza neta es cero, pero puede haber torque.',
      'En la varilla que flota, igualar la fuerza a la masa en lugar de al peso $mg$.'
    ],

    teacher: {
      plan: [
        'Demostración: un alambre entre los polos de un imán salta al cerrar el circuito; al invertir la corriente, salta al revés.',
        'Explainer de los portadores para llegar a $\\vec F = I\\vec L \\times \\vec B$ desde $q\\vec v \\times \\vec B$.',
        'Tramo recto y alambres doblados; deja la espira cerrada como gancho para el torque.',
        'Varilla que flota como problema de equilibrio.',
        'Efecto Hall solo como recuadro: qué es y para qué sirve, sin problemas.'
      ],
      check: [
        'Que den la dirección de la fuerza sobre un alambre en un dibujo con puntos o cruces.',
        'Que calculen la fuerza sobre un arco con la cuerda y expliquen por qué no se usa el largo del arco.',
        'Que planteen $ILB = mg$ con unidades SI.'
      ],
      note: 'El efecto Hall está en el temario solo como detalle: no hay ejercicios, preguntas de banco ni problemas de examen de él.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §11.4 “Magnetic Force on a Current-Carrying Conductor”. <a href="https://openstax.org/books/university-physics-volume-2/pages/11-4-magnetic-force-on-a-current-carrying-conductor">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §11.6 “The Hall Effect”. <a href="https://openstax.org/books/university-physics-volume-2/pages/11-6-the-hall-effect">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-03',
    next: 'sesion-05'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
