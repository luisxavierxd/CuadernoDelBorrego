/* =====================================================================
   Física 1 · S09 · Tensiones y poleas (bloque C · Dinámica).
   Fuente: OpenStax, University Physics Volume 1, §5.6 y §6.1 (CC BY-NC-SA 4.0).
   Cuerdas y poleas ideales (sin masa ni fricción), g = 9.81 m/s².
   Las cuentas se comprueban contra LabMath.atwood (lab atwood).
   ===================================================================== */
(function () {
  var g = 9.81;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 1)) return false;
      }
      return true;
    };
  }
  function atw(m1, m2) { return { a: (m2 - m1) * g / (m1 + m2), T: 2 * m1 * m2 * g / (m1 + m2) }; }
  function mesa(m1, m2, mu) { var a = (m2 - mu * m1) * g / (m1 + m2); return { a: a, T: m1 * (a + mu * g) }; }

  var e1 = { m1: 3, m2: 5 }; Object.assign(e1, atw(e1.m1, e1.m2));
  var e2 = { m1: 4, m2: 2, mu: 0.2 }; Object.assign(e2, mesa(e2.m1, e2.m2, e2.mu));
  var e3 = { m: 200, a: 0.5 }; e3.T = e3.m * (g + e3.a);
  var e4 = { ms: [2, 3, 5], F: 40 }; e4.M = 10; e4.a = e4.F / e4.M; e4.T12 = 8 * e4.a; e4.T23 = 5 * e4.a;

  var data = window.SESSION_DATA = {
    slug: 'sesion-09', number: '09', group: 'C · Dinámica',
    title: 'Tensiones y poleas', temario: [],
    minutes: 150,
    quote: 'Una cuerda tensa une los movimientos: todo lo que ata se mueve con la misma aceleración.',
    badges: [
      'Entender qué es la tensión en una cuerda ideal.',
      'Plantear ΣF = ma para cada cuerpo de un sistema conectado.',
      'Resolver la máquina de Atwood y el bloque en la mesa con polea.',
      'Calcular tensiones en cuerdas que levantan o jalan cuerpos en fila.'
    ],

    lesson: [
      {
        "type": "warmup",
        "heading": "Antes de empezar",
        "short": "Antes de empezar",
        "idea": "Una cuerda transmite una <strong>tensión</strong>; cuando varios cuerpos están unidos, se mueven juntos con la misma aceleración.",
        "recall": [
          "Diagramas de cuerpo libre y $\\Sigma F = ma$ (S08).",
          "Resolver sistemas de dos ecuaciones."
        ],
        "why": "Elevadores, grúas, poleas y trenes de carros funcionan con cuerdas y cables. Saber la tensión es saber si el cable aguanta."
      },
      {
        "type": "concept",
        "heading": "Imagínalo así",
        "short": "Imagínalo así",
        "body": [
          "Una cuerda ideal (sin masa) jala con la misma fuerza en sus dos extremos: esa fuerza es la tensión $T$. Solo puede jalar, nunca empujar.",
          "Si dos cuerpos están unidos por una cuerda tensa, avanzan juntos: tienen la misma aceleración (en tamaño). Esa condición es la que une las ecuaciones de cada cuerpo.",
          "Un truco muy útil: si sumas las ecuaciones de todos los cuerpos, las tensiones internas se cancelan y queda \"fuerza que mueve al sistema = masa total × aceleración\"."
        ]
      },
      {
        type: 'concept', heading: 'La tensión', short: 'Tensión',
        body: [
          'Una cuerda tensa jala lo que tiene atado en cada extremo con una fuerza llamada <strong>tensión</strong>, $T$, a lo largo de la cuerda. Las cuerdas <strong>solo jalan</strong>.',
          'En una cuerda <strong>ideal</strong> (sin masa y que no se estira) la tensión es la misma en toda la cuerda, y una polea ideal solo cambia su dirección. Por eso los cuerpos unidos por la cuerda tienen la misma aceleración en magnitud.',
          'La tensión <strong>no es</strong> el peso de lo que cuelga: solo son iguales si el cuerpo no acelera.'
        ],
        diagram: 'table-pulley',
        caption: 'La misma $T$ jala al bloque hacia la polea y sostiene a la masa que cuelga.'
      },
      {
        type: 'explainer', heading: 'La máquina de Atwood', short: 'Máquina de Atwood',
        title: 'Un DCL por cada cuerpo',
        intro: 'Con dos cuerpos hay dos incógnitas, $a$ y $T$, y dos ecuaciones: una por cuerpo.',
        diagram: 'atwood-explainer',
        steps: [
          { text: 'Dos masas cuelgan de una polea. Si $m_2 > m_1$, $m_2$ baja y $m_1$ sube con la misma $a$.', state: { step: 0 } },
          { text: 'DCL de $m_1$, que sube: la tensión le gana al peso. $T - m_1g = m_1a$.', state: { step: 1 } },
          { text: 'DCL de $m_2$, que baja: el peso le gana a la tensión. $m_2g - T = m_2a$.', state: { step: 2 } },
          { text: 'Suma las dos ecuaciones: la $T$ se cancela y queda $a = \\frac{(m_2 - m_1)g}{m_1 + m_2}$. Con $a$, despeja $T$ de cualquiera.', state: { step: 3 } }
        ]
      },
      {
        "type": "recipe",
        "heading": "Receta: sistemas con cuerdas y poleas",
        "short": "Receta",
        "steps": [
          {
            "text": "Dibuja un diagrama de cuerpo libre para <em>cada</em> cuerpo."
          },
          {
            "text": "Decide hacia dónde se mueve el sistema y toma ese sentido como positivo para cada cuerpo (siguiendo la cuerda)."
          },
          {
            "text": "Escribe $\\Sigma F = ma$ para cada cuerpo, con la misma $a$ y la misma $T$ en toda la cuerda."
          },
          {
            "text": "Suma las ecuaciones para eliminar $T$ y despeja $a$."
          },
          {
            "text": "Sustituye $a$ en la ecuación más sencilla para obtener $T$.",
            "tip": "Comprueba: la tensión debe quedar entre los pesos si una masa sube y otra baja."
          }
        ]
      },
      {
        type: 'example', heading: 'Máquina de Atwood',
        problem: '<p>Dos masas de $' + e1.m1 + '\\ \\text{kg}$ y $' + e1.m2 + '\\ \\text{kg}$ cuelgan de una polea ideal. ¿Qué aceleración tienen y cuánto vale la tensión?</p>',
        steps: [
          { text: 'Suma las ecuaciones de cada masa.', math: 'a = \\frac{(m_2 - m_1)g}{m_1 + m_2} = \\frac{(5 - 3)(9.81)}{8} = ' + fx(e1.a, 3) + '\\ \\text{m/s}^2' },
          { text: 'Tensión, con la ecuación de $m_1$.', math: 'T = m_1(g + a) = 3(9.81 + ' + fx(e1.a, 3) + ') = ' + fx(e1.T) + '\\ \\text{N}' },
          { text: 'Comprueba con $m_2$: $m_2(g - a) = 5(9.81 - ' + fx(e1.a, 3) + ') = ' + fx(e1.m2 * (g - e1.a)) + '$ N. Queda entre los dos pesos (29.4 N y 49.1 N), como debe ser.' }
        ],
        answer: '$a \\approx ' + fx(e1.a) + '\\ \\text{m/s}^2$ y $T \\approx ' + fx(e1.T, 1) + '\\ \\text{N}$.',
        verify: { lab: 'call', mod: 'atwood', fn: 'atwood', args: [e1.m1, e1.m2], values: { a: e1.a, T: e1.T } }
      },
      {
        type: 'example', heading: 'Bloque en una mesa con polea',
        problem: '<p>Un bloque de $' + e2.m1 + '\\ \\text{kg}$ sobre una mesa ($\\mu_k = ' + e2.mu + '$) está atado a una masa de $' + e2.m2 + '\\ \\text{kg}$ que cuelga de una polea en la orilla. ¿Qué aceleración tienen y cuál es la tensión?</p>',
        steps: [
          { text: 'Bloque: la tensión jala hacia la polea y la fricción en contra; $N = m_1g$.', math: 'T - \\mu_k m_1 g = m_1 a' },
          { text: 'Masa que cuelga.', math: 'm_2 g - T = m_2 a' },
          { text: 'Suma para eliminar $T$.', math: 'a = \\frac{(m_2 - \\mu_k m_1)g}{m_1 + m_2} = \\frac{(2 - 0.8)(9.81)}{6} = ' + fx(e2.a, 3) + '\\ \\text{m/s}^2' },
          { text: 'Tensión, de la ecuación de la masa que cuelga.', math: 'T = m_2(g - a) = 2(9.81 - ' + fx(e2.a, 3) + ') = ' + fx(e2.T) + '\\ \\text{N}' }
        ],
        answer: '$a \\approx ' + fx(e2.a) + '\\ \\text{m/s}^2$ y $T \\approx ' + fx(e2.T) + '\\ \\text{N}$.',
        verify: { lab: 'call', mod: 'atwood', fn: 'table', args: [e2.m1, e2.m2, e2.mu], values: { a: e2.a, T: e2.T } }
      },
      {
        type: 'example', heading: 'Una grúa que acelera la carga',
        problem: '<p>Una grúa levanta una carga de $' + e3.m + '\\ \\text{kg}$ con una aceleración de $' + e3.a + '\\ \\text{m/s}^2$ hacia arriba. ¿Cuánto vale la tensión del cable?</p>',
        steps: [
          { text: 'DCL de la carga: $T$ hacia arriba y $mg$ hacia abajo.', math: 'T - mg = ma' },
          { text: 'Despeja.', math: 'T = m(g + a) = 200(9.81 + 0.5) = ' + fx(e3.T) + '\\ \\text{N}' },
          { text: 'Es mayor que el peso ($1962$ N) porque la carga acelera hacia arriba.' }
        ],
        answer: '$T = ' + fx(e3.T) + '\\ \\text{N}$.',
        verify: { lab: 'call', mod: 'forces', fn: 'scene', args: ['elevador', { m: e3.m, acc: e3.a }], values: { N: e3.T } }
      },
      {
        type: 'example', heading: 'Tres carritos en fila',
        problem: '<p>Un robot jala con $' + e4.F + '\\ \\text{N}$ tres carritos de $2$, $3$ y $5\\ \\text{kg}$ unidos por cuerdas, sobre un piso liso. El de 2 kg va adelante. ¿Qué aceleración tienen y cuánto vale la tensión de la cuerda entre el primero y el segundo?</p>',
        steps: [
          { text: 'Todo el tren acelera junto: toma los tres como un solo cuerpo.', math: 'a = \\frac{F}{m_1 + m_2 + m_3} = \\frac{40}{10} = ' + e4.a + '\\ \\text{m/s}^2' },
          { text: 'La cuerda 1-2 jala a los dos carritos de atrás (3 + 5 kg).', math: 'T_{12} = (3 + 5)(' + e4.a + ') = ' + e4.T12 + '\\ \\text{N}' },
          { text: 'La cuerda 2-3 solo jala al último: $T_{23} = 5(' + e4.a + ') = ' + e4.T23 + '$ N. Las tensiones bajan hacia atrás.' }
        ],
        answer: '$a = ' + e4.a + '\\ \\text{m/s}^2$ y $T_{12} = ' + e4.T12 + '\\ \\text{N}$.',
        verify: { lab: 'call', mod: 'atwood', fn: 'train', args: [e4.ms, e4.F], values: { a: e4.a, T: e4.T12 } }
      },
      {
        type: 'callout', heading: 'Cuándo T = mg',
        body: [
          'Solo si el cuerpo que cuelga no acelera (en reposo o a velocidad constante). Si baja acelerando, $T < mg$; si sube acelerando, $T > mg$.',
          'Revisa siempre que tu $T$ quede entre los pesos de las masas de una máquina de Atwood.'
        ]
      },
      {
        "type": "faq",
        "heading": "Dudas comunes",
        "short": "Dudas comunes",
        "items": [
          {
            "q": "¿La tensión es igual al peso que cuelga?",
            "a": "Solo si no hay aceleración. Si la masa baja acelerando, $T < mg$; si sube acelerando, $T > mg$."
          },
          {
            "q": "¿Qué hace la polea?",
            "a": "Cambia la dirección de la cuerda sin cambiar la tensión (si es ideal)."
          },
          {
            "q": "¿Y si elegí mal el sentido del movimiento?",
            "a": "La aceleración te saldrá negativa: significa que se mueve al revés. El valor absoluto sigue siendo correcto."
          }
        ]
      },
      {
        "type": "recap",
        "heading": "Lo que te llevas",
        "short": "Resumen",
        "points": [
          "Una cuerda ideal tiene la misma tensión en todas partes.",
          "Cuerpos unidos: misma aceleración.",
          "Suma las ecuaciones para eliminar $T$.",
          "$T = mg$ solo sin aceleración."
        ]
      }
    ],

    lab: {
      type: 'atwood', title: 'Masas y poleas',
      intro: 'Elige la máquina de Atwood o el bloque en la mesa, cambia las masas y la fricción, y compara tu $a$ y tu $T$ con la solución. El botón "Soltar" muestra cómo se mueven. El lab detecta si usaste $T = m_2g$ o si dividiste entre una sola masa.',
      cfg: { start: { mode: 'atwood', m1: 3, m2: 5, mu: 0.2 } }
    },

    formulas: [
      { label: 'Atwood', tex: 'a = \\frac{(m_2 - m_1)g}{m_1 + m_2}' },
      { label: 'Tensión de Atwood', tex: 'T = \\frac{2m_1m_2g}{m_1 + m_2}' },
      { label: 'Mesa con polea', tex: 'a = \\frac{(m_2 - \\mu_k m_1)g}{m_1 + m_2}' },
      { label: 'Levantar acelerando', tex: 'T = m(g + a)' },
      { label: 'Cuerpos en fila', tex: 'T = (\\text{masa de atrás})\\,a' }
    ],

    exercises: [
      {
        id: 'f1-s09-atwood-a', title: 'Aceleración de Atwood',
        vars: { m1: [1, 10, 0.5], m2: [1, 10, 0.5] },
        prompt: function (v) { return '<p>Dos masas de $' + v.m1 + '$ y $' + v.m2 + '\\ \\text{kg}$ cuelgan de una polea ideal. ¿Cuánto vale la magnitud de su aceleración?</p>'; },
        check: 'numeric', unit: 'm/s²',
        answer: function (v) { return Math.abs(v.m2 - v.m1) * g / (v.m1 + v.m2); },
        baseWhere: function (v) { return v.m1 !== v.m2; },
        mistakes: { oneMass: function (v) { return Math.abs(v.m2 - v.m1) * g / Math.max(v.m1, v.m2); } },
        feedback: [{ when: 'oneMass', say: 'Dividiste entre una sola masa; las dos aceleran juntas: divide entre $m_1 + m_2$.' }],
        oracle: { lab: 'value', value: function (v) { return Math.abs(window.LabMath.atwood.atwood(v.m1, v.m2).a); } },
        hint: 'Escribe ΣF = ma para cada masa y súmalas.',
        solution: function (v) { return '$$a = \\frac{|m_2 - m_1|\\,g}{m_1 + m_2} = \\frac{' + fx(Math.abs(v.m2 - v.m1)) + '(9.81)}{' + (v.m1 + v.m2) + '} = ' + fx(Math.abs(v.m2 - v.m1) * g / (v.m1 + v.m2), 3) + '\\ \\text{m/s}^2$$'; }
      },
      {
        id: 'f1-s09-atwood-t', title: 'Tensión de Atwood',
        vars: { m1: [1, 10, 0.5], m2: [1, 10, 0.5] },
        prompt: function (v) { return '<p>En una máquina de Atwood con masas de $' + v.m1 + '$ y $' + v.m2 + '\\ \\text{kg}$, ¿cuánto vale la tensión de la cuerda?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return 2 * v.m1 * v.m2 * g / (v.m1 + v.m2); },
        baseWhere: function (v) { return v.m1 !== v.m2; },
        mistakes: { heavy: function (v) { return Math.max(v.m1, v.m2) * g; }, light: function (v) { return Math.min(v.m1, v.m2) * g; } },
        feedback: [
          { when: 'heavy', say: 'Ese es el peso de la masa que baja; como acelera, la cuerda la sostiene con menos: $T = m(g - a)$.' },
          { when: 'light', say: 'Ese es el peso de la masa que sube; para acelerarla, la tensión debe ser mayor.' }
        ],
        oracle: { lab: 'call', mod: 'atwood', fn: 'atwood', field: 'T', args: function (v) { return [v.m1, v.m2]; } },
        hint: 'Calcula $a$ y sustituye en $T - m_1g = m_1a$ (con la masa que sube).',
        solution: function (v) { return '$$T = \\frac{2m_1m_2g}{m_1 + m_2} = \\frac{2(' + v.m1 + ')(' + v.m2 + ')(9.81)}{' + (v.m1 + v.m2) + '} = ' + fx(2 * v.m1 * v.m2 * g / (v.m1 + v.m2), 3) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f1-s09-mesa', title: 'Bloque en la mesa con polea',
        vars: { m1: [1, 10, 0.5], m2: [1, 10, 0.5], mu: [0, 0.4, 0.05] },
        prompt: function (v) { return '<p>Un bloque de $' + v.m1 + '\\ \\text{kg}$ sobre una mesa ($\\mu_k = ' + v.mu + '$) está unido por una polea a una masa colgante de $' + v.m2 + '\\ \\text{kg}$. ¿Qué aceleración tienen?</p>'; },
        check: 'numeric', unit: 'm/s²',
        answer: function (v) { return (v.m2 - v.mu * v.m1) * g / (v.m1 + v.m2); },
        baseWhere: function (v) { return v.m2 > v.mu * v.m1 + 0.3 && v.mu > 0; },
        mistakes: { noFriction: function (v) { return v.m2 * g / (v.m1 + v.m2); }, onlyHanging: function (v) { return (v.m2 - v.mu * v.m1) * g / v.m2; } },
        feedback: [
          { when: 'noFriction', say: 'Te faltó la fricción de la mesa, $\\mu_k m_1 g$.' },
          { when: 'onlyHanging', say: 'Dividiste solo entre la masa que cuelga; se mueven las dos.' }
        ],
        oracle: { lab: 'call', mod: 'atwood', fn: 'table', field: 'a', args: function (v) { return [v.m1, v.m2, v.mu]; } },
        hint: 'Bloque: $T - \\mu_k m_1g = m_1a$. Masa que cuelga: $m_2g - T = m_2a$.',
        solution: function (v) { return '$$a = \\frac{(m_2 - \\mu_k m_1)g}{m_1 + m_2} = \\frac{(' + v.m2 + ' - ' + fx(v.mu * v.m1, 3) + ')(9.81)}{' + (v.m1 + v.m2) + '} = ' + fx((v.m2 - v.mu * v.m1) * g / (v.m1 + v.m2), 3) + '\\ \\text{m/s}^2$$'; }
      },
      {
        id: 'f1-s09-grua', title: 'Cable que levanta acelerando',
        vars: { m: [50, 900, 50], a: [0.2, 3, 0.2] },
        prompt: function (v) { return '<p>Un cable levanta una carga de $' + v.m + '\\ \\text{kg}$ que acelera hacia arriba a $' + v.a + '\\ \\text{m/s}^2$. ¿Cuánto vale la tensión?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return v.m * (g + v.a); },
        mistakes: { usedMg: function (v) { return v.m * g; } },
        feedback: [{ when: 'usedMg', say: 'Ese es el peso; para acelerar hacia arriba, la tensión debe superarlo: $T = m(g + a)$.' }],
        oracle: { lab: 'call', mod: 'forces', fn: 'scene', field: 'N', args: function (v) { return ['elevador', { m: v.m, acc: v.a }]; } },
        hint: '$T - mg = ma$.',
        solution: function (v) { return '$$T = m(g + a) = ' + v.m + '(9.81 + ' + v.a + ') = ' + fx(v.m * (g + v.a), 1) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f1-s09-fila', title: 'Tensión entre carritos',
        vars: { m1: [1, 6, 1], m2: [1, 6, 1], m3: [1, 6, 1], F: [10, 80, 5] },
        prompt: function (v) { return '<p>Una fuerza de $' + v.F + '\\ \\text{N}$ jala tres carritos en fila sobre un piso liso: $' + v.m1 + '$ kg (adelante), $' + v.m2 + '$ kg y $' + v.m3 + '$ kg. ¿Cuánto vale la tensión de la cuerda entre el primero y el segundo?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return (v.m2 + v.m3) * v.F / (v.m1 + v.m2 + v.m3); },
        mistakes: { gaveF: function (v) { return v.F; }, onlyLast: function (v) { return v.m3 * v.F / (v.m1 + v.m2 + v.m3); } },
        feedback: [
          { when: 'gaveF', say: 'La cuerda no jala con toda la fuerza: solo acelera a los carritos de atrás.' },
          { when: 'onlyLast', say: 'Esa es la tensión entre el segundo y el tercero; la primera cuerda jala a dos carritos.' }
        ],
        oracle: { lab: 'call', mod: 'atwood', fn: 'train', field: 'T', args: function (v) { return [[v.m1, v.m2, v.m3], v.F]; } },
        hint: 'Primero la aceleración de todo el tren; luego ΣF = ma para los carritos de atrás.',
        solution: function (v) { var M = v.m1 + v.m2 + v.m3, a = v.F / M; return '$$a = \\frac{' + v.F + '}{' + M + '} = ' + fx(a, 3) + '\\ \\text{m/s}^2 \\qquad T_{12} = (' + v.m2 + ' + ' + v.m3 + ')(' + fx(a, 3) + ') = ' + fx((v.m2 + v.m3) * a, 3) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f1-s09-concepto', title: 'Concepto: tensión y peso',
        vars: {},
        prompt: function () { return '<p>En una máquina de Atwood, la masa más pesada baja acelerando. ¿Cómo es la tensión comparada con su peso?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Menor que su peso', correct: true },
            { text: 'Igual a su peso', say: 'Si fueran iguales, la fuerza neta sería cero y no aceleraría.' },
            { text: 'Mayor que su peso', say: 'Entonces subiría acelerando, no bajaría.' },
            { text: 'Cero', say: 'La cuerda está tensa: sí jala.' }
          ];
        },
        answer: function () { return 'Menor que su peso'; },
        hint: 'Si baja acelerando, ¿quién gana, el peso o la tensión?',
        solution: function () { return '$mg - T = ma > 0$, así que $T < mg$.'; }
      }
    ],

    quiz: { tags: ['f1.S09'], count: 8 },

    errors: [
      'Suponer que la tensión es igual al peso de lo que cuelga aunque acelere.',
      'Dividir la fuerza neta entre una sola masa en un sistema conectado.',
      'Poner la tensión empujando: las cuerdas solo jalan.',
      'Olvidar la fricción del bloque que desliza sobre la mesa.',
      'Usar distinta aceleración para cuerpos unidos por la misma cuerda.'
    ],

    teacher: {
      plan: [
        'Tensión como fuerza de una cuerda; cuerda y polea ideales.',
        'Explainer de Atwood: un DCL por masa y sumar ecuaciones.',
        'Ejemplos y lab: que prueben masas iguales y noten que $a = 0$ y $T = mg$.'
      ],
      check: [
        'Que elijan el sentido positivo de cada masa según hacia dónde se mueve.',
        'Que verifiquen que la tensión queda entre los dos pesos.'
      ],
      note: 'El caso del plano inclinado con polea se ve en S11.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 1</em>, §5.6 “Common Forces”. <a href="https://openstax.org/books/university-physics-volume-1/pages/5-6-common-forces">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §6.1 “Solving Problems with Newton’s Laws”. <a href="https://openstax.org/books/university-physics-volume-1/pages/6-1-solving-problems-with-newtons-laws">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-08',
    next: 'sesion-10'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
