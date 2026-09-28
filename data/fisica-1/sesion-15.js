/* =====================================================================
   Física 1 · S15 · Torque y equilibrio del cuerpo rígido: vigas y reacciones
   en apoyos (bloque E · Estática).
   Fuente: OpenStax, University Physics Volume 1, §10.6 y §12.1–12.2 (CC BY-NC-SA 4.0).
   g = 9.81 m/s². Las cuentas se comprueban contra LabMath.beam (lab beam-equilibrium).
   ===================================================================== */
(function () {
  var g = 9.81, RAD = Math.PI / 180;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function sn(t) { return Math.sin(t * RAD); }
  function cs(t) { return Math.cos(t * RAD); }
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

  var e1 = { F: 40, r: 0.3, th: 60 }; e1.tau = e1.F * e1.r * sn(e1.th);
  var e2 = { m1: 30, x1: 2, m2: 75 }; e2.x2 = e2.m1 * e2.x1 / e2.m2;
  var e3 = { L: 6, M: 20, a: 1, b: 5, F1: 300, x1: 2, F2: 500, x2: 4.5 };
  e3.W = e3.M * g; e3.RB = (e3.F1 * (e3.x1 - e3.a) + e3.F2 * (e3.x2 - e3.a) + e3.W * (e3.L / 2 - e3.a)) / (e3.b - e3.a); e3.RA = e3.F1 + e3.F2 + e3.W - e3.RB;
  var e4 = { L: 4, M: 30, a: 0, b: 3, m: 60 }; e4.x = e4.b + e4.M * (e4.b - e4.L / 2) / e4.m;
  var e5 = { W: 400, M: 20, th: 30, L: 3 }; e5.T = (e5.W + e5.M * g / 2) / sn(e5.th); e5.H = e5.T * cs(e5.th); e5.V = e5.W + e5.M * g - e5.T * sn(e5.th);

  var data = window.SESSION_DATA = {
    slug: 'sesion-15', number: '15', group: 'E · Estática',
    title: 'Torque y equilibrio del cuerpo rígido: vigas y reacciones en apoyos', temario: [],
    minutes: 180,
    quote: 'Un cuerpo rígido en equilibrio ni se traslada ni gira: la suma de fuerzas y la suma de torques valen cero.',
    badges: [
      'Calcular el torque $\\tau = rF\\sin\\theta$ con su signo.',
      'Equilibrar un balancín con $\\Sigma\\tau = 0$.',
      'Encontrar las reacciones de una viga en dos apoyos, con su peso propio.',
      'Resolver una viga sostenida por un cable y el límite de volcadura.'
    ],

    lesson: [
      {
        "type": "warmup",
        "heading": "Antes de empezar",
        "short": "Antes de empezar",
        "idea": "Un cuerpo extenso también puede <strong>girar</strong>. Para que no gire, la suma de <strong>torques</strong> debe ser cero.",
        "recall": [
          "Equilibrio de fuerzas (S14).",
          "Producto vectorial (S03): $\\tau = rF\\sin\\theta$."
        ],
        "why": "Puertas, llaves, balancines, vigas, puentes y escaleras dependen de los torques. Explican por qué una llave larga afloja mejor y cuánto carga cada apoyo de un puente."
      },
      {
        "type": "concept",
        "heading": "Imagínalo así",
        "short": "Imagínalo así",
        "body": [
          "Empuja una puerta cerca de las bisagras y cuesta mucho; empújala del borde y abre fácil. El efecto de giro (torque) depende de la fuerza <em>y</em> de qué tan lejos del eje la aplicas.",
          "Solo gira la parte de la fuerza perpendicular al brazo: jalar la puerta hacia las bisagras no la abre. Por eso $\\tau = rF\\sin\\theta$.",
          "En una viga en equilibrio hay dos condiciones: que no se traslade ($\\Sigma F = 0$) y que no gire ($\\Sigma\\tau = 0$). El truco: tomar torques respecto a un apoyo, así la fuerza de ese apoyo no aparece en la ecuación."
        ]
      },
      {
        type: 'explainer', heading: 'Torque: la tendencia a girar', short: 'Torque',
        title: 'Brazo, fuerza y ángulo',
        intro: 'Una fuerza puede hacer girar un cuerpo alrededor de un eje. Cuánto gira depende de qué tan lejos y con qué ángulo empuja: $$\\tau = rF\\sin\\theta$$',
        diagram: 'torque-explainer',
        steps: [
          { text: 'Perpendicular al brazo ($\\theta = 90^\\circ$): el torque es máximo, $\\tau = rF$. Por eso las manijas van lejos de las bisagras.', state: { th: 90 } },
          { text: 'Con ángulo, solo gira la componente perpendicular $F\\sin\\theta$. Equivale a usar el <strong>brazo de palanca</strong> $r\\sin\\theta$.', state: { th: 40 } },
          { text: 'A lo largo del brazo ($\\theta = 0$) no hay torque: jalar la puerta hacia la bisagra no la abre.', state: { th: 3 } },
          { text: 'Signo: antihorario positivo, horario negativo. En equilibrio la suma de torques respecto a <em>cualquier</em> punto es cero. Unidad: N·m.', state: { th: 90 } }
        ]
      },
      {
        "type": "recipe",
        "heading": "Receta: viga en equilibrio",
        "short": "Receta",
        "steps": [
          {
            "text": "Dibuja la viga con todas sus cargas, su peso en el centro y las reacciones de los apoyos."
          },
          {
            "text": "Elige el eje de torques en un apoyo (donde hay una fuerza desconocida)."
          },
          {
            "text": "Escribe $\\Sigma\\tau = 0$: cada fuerza por su distancia al eje, con signo según el sentido de giro.",
            "tip": "Las distancias se miden desde el eje que elegiste, no desde la punta de la viga."
          },
          {
            "text": "Despeja la reacción del otro apoyo."
          },
          {
            "text": "Con $\\Sigma F = 0$ obtén la reacción que falta. Si alguna sale negativa, la viga se vuelca."
          }
        ]
      },
      {
        type: 'example', heading: 'Una llave inclinada',
        problem: '<p>Aprietas una tuerca con una llave de $' + fx(e1.r * 100, 0) + '\\ \\text{cm}$. Empujas con $' + e1.F + '\\ \\text{N}$ en la punta, formando $' + e1.th + '^\\circ$ con la llave. ¿Qué torque aplicas?</p>',
        steps: [
          { text: 'Brazo en metros y el ángulo entre el brazo y la fuerza.', math: '\\tau = rF\\sin\\theta = (0.3)(40)\\sin 60^\\circ' },
          { text: 'Calcula.', math: '\\tau = ' + fx(e1.tau, 2) + '\\ \\text{N·m}' },
          { text: 'Empujando perpendicular serían $12$ N·m, el máximo posible con esa fuerza.' }
        ],
        answer: '$\\tau \\approx ' + fx(e1.tau, 1) + '\\ \\text{N·m}$.',
        verify: { lab: 'call', mod: 'beam', fn: 'torque', args: [e1.F, e1.r, e1.th], value: e1.tau }
      },
      {
        type: 'concept', heading: 'Condiciones de equilibrio del cuerpo rígido', short: 'Equilibrio rígido',
        body: [
          'Un cuerpo extenso puede trasladarse y girar. Para que esté en equilibrio: $$\\Sigma \\vec F = 0 \\qquad \\Sigma \\tau = 0$$',
          'El truco: toma torques respecto al punto donde hay una fuerza desconocida. Su brazo es cero y desaparece de la ecuación.',
          'El peso de un cuerpo uniforme actúa en su centro (el <strong>centro de gravedad</strong>).'
        ],
        diagram: 'seesaw',
        caption: 'Balancín: el peso chico lejos equilibra al grande cerca, $F_1x_1 = F_2x_2$.'
      },
      {
        type: 'example', heading: 'Equilibrar un balancín',
        problem: '<p>Una niña de $' + e2.m1 + '\\ \\text{kg}$ se sienta a $' + e2.x1 + '\\ \\text{m}$ del pivote de un balancín. ¿A qué distancia del otro lado debe sentarse su papá, de $' + e2.m2 + '\\ \\text{kg}$?</p>',
        steps: [
          { text: 'Torques respecto al pivote (la fuerza del pivote no aparece).', math: 'm_1g\\,x_1 = m_2g\\,x_2' },
          { text: 'La $g$ se cancela.', math: 'x_2 = \\frac{m_1x_1}{m_2} = \\frac{(30)(2)}{75} = ' + fx(e2.x2, 2) + '\\ \\text{m}' },
          { text: 'El pivote empuja hacia arriba con la suma de los dos pesos: $\\Sigma F = 0$.' }
        ],
        answer: 'A $' + fx(e2.x2, 2) + '\\ \\text{m}$ del pivote.',
        verify: { lab: 'call', mod: 'beam', fn: 'balance', args: [e2.m1 * g, -e2.x1, e2.m2 * g], value: e2.x2 }
      },
      {
        type: 'explainer', heading: 'Una viga sobre dos apoyos', short: 'Viga en dos apoyos',
        title: 'Torques respecto a un apoyo',
        intro: 'Una viga de $6$ m y $20$ kg descansa en apoyos $A$ ($x = 1$ m) y $B$ ($x = 5$ m), con cargas de $300$ N en $x = 2$ m y $500$ N en $x = 4.5$ m.',
        diagram: 'beam-explainer',
        steps: [
          { text: 'Dos incógnitas: las reacciones $R_A$ y $R_B$.', state: { step: 0 } },
          { text: 'DCL: las dos cargas, el peso propio $Mg = 196.2$ N en el centro ($x = 3$ m) y las dos reacciones hacia arriba.', state: { step: 1 } },
          { text: 'Torques respecto a $A$, con brazos medidos <strong>desde A</strong>: $$R_B(4) = 300(1) + 196.2(2) + 500(3.5)$$ $R_A$ no aparece.', state: { step: 2 } },
          { text: 'Con $R_B$, la suma de fuerzas da la otra: $R_A = 300 + 500 + 196.2 - R_B$.', state: { step: 3 } }
        ]
      },
      {
        type: 'example', heading: 'Las reacciones de la viga',
        problem: '<p>Termina la viga anterior: ¿cuánto valen $R_A$ y $R_B$?</p>',
        steps: [
          { text: 'Torques respecto a $A$.', math: 'R_B = \\frac{300(1) + 196.2(2) + 500(3.5)}{4} = ' + fx(e3.RB, 2) + '\\ \\text{N}' },
          { text: 'Suma de fuerzas.', math: 'R_A = 996.2 - ' + fx(e3.RB, 2) + ' = ' + fx(e3.RA, 2) + '\\ \\text{N}' },
          { text: 'Comprueba con torques respecto a $B$: $R_A(4) = 300(3) + 196.2(2) + 500(-0.5)$ da lo mismo.' }
        ],
        answer: '$R_A \\approx ' + fx(e3.RA, 1) + '\\ \\text{N}$ y $R_B \\approx ' + fx(e3.RB, 1) + '\\ \\text{N}$.',
        verify: { lab: 'call', mod: 'beam', fn: 'reactions', args: [{ L: e3.L, M: e3.M, a: e3.a, b: e3.b, loads: [{ x: e3.x1, F: e3.F1 }, { x: e3.x2, F: e3.F2 }] }], values: { RA: e3.RA, RB: e3.RB } }
      },
      {
        type: 'example', heading: '¿Hasta dónde puedo caminar?',
        problem: '<p>Una tabla uniforme de $' + e4.L + '\\ \\text{m}$ y $' + e4.M + '\\ \\text{kg}$ descansa en dos apoyos: uno en el extremo izquierdo y otro a $' + e4.b + '\\ \\text{m}$ de él, así que $1$ m sobresale. Una persona de $' + e4.m + '\\ \\text{kg}$ camina sobre la parte que sobresale. ¿Hasta qué posición puede llegar antes de que la tabla se voltee?</p>',
        steps: [
          { text: 'Justo al volcar, la tabla deja de tocar el apoyo izquierdo: $R_A = 0$. Toma torques respecto a $B$.', math: 'mg(x - 3) = Mg(3 - 2)' },
          { text: 'Despeja.', math: 'x = 3 + \\frac{M(1)}{m} = 3 + \\frac{30}{60} = ' + fx(e4.x, 2) + '\\ \\text{m}' },
          { text: 'Puede avanzar $0.5$ m más allá del apoyo; el último medio metro de la tabla es peligroso.' }
        ],
        answer: 'Hasta $x = ' + fx(e4.x, 2) + '\\ \\text{m}$ (medio metro más allá del apoyo).',
        verify: { lab: 'call', mod: 'beam', fn: 'maxOverhang', args: [{ L: e4.L, M: e4.M, a: e4.a, b: e4.b, loads: [] }, e4.m * g], value: e4.x }
      },
      {
        type: 'concept', heading: 'Una viga sostenida por un cable', short: 'Viga con cable',
        body: [
          'Una viga con bisagra en la pared y un cable inclinado en la punta: la bisagra hace una fuerza de dirección desconocida (dos componentes) y el cable una tensión $T$. Tres incógnitas: dos ecuaciones de fuerza y una de torques.',
          'Torques respecto a la bisagra eliminan sus dos componentes: solo quedan $T$, la carga y el peso propio.'
        ],
        diagram: 'boom-cable',
        caption: 'Solo la componente vertical $T\\sin\\theta$ del cable hace torque respecto a la bisagra.'
      },
      {
        type: 'example', heading: 'La tensión del cable de una pluma',
        problem: '<p>Una viga uniforme de $' + e5.M + '\\ \\text{kg}$ sale horizontal de una pared con bisagra. Un cable atado a su punta sube a la pared formando $' + e5.th + '^\\circ$ con la viga, y de la punta cuelga una carga de $' + e5.W + '\\ \\text{N}$. ¿Qué tensión tiene el cable y qué fuerza horizontal hace la bisagra?</p>',
        steps: [
          { text: 'Torques respecto a la bisagra (largo $L$; se cancela).', math: 'TL\\sin 30^\\circ = 400L + Mg\\frac{L}{2}' },
          { text: 'Despeja.', math: 'T = \\frac{400 + 98.1}{0.5} = ' + fx(e5.T, 2) + '\\ \\text{N}' },
          { text: 'Horizontal: la bisagra empuja hacia afuera de la pared con la componente horizontal del cable.', math: 'H = T\\cos 30^\\circ = ' + fx(e5.H, 2) + '\\ \\text{N}' },
          { text: 'Vertical: $V = 400 + 196.2 - T\\sin 30^\\circ = ' + fx(e5.V, 2) + '$ N. El cable tira con más del doble de la carga.' }
        ],
        answer: '$T \\approx ' + fx(e5.T, 0) + '\\ \\text{N}$ y la bisagra empuja $' + fx(e5.H, 0) + '\\ \\text{N}$ horizontalmente.',
        verify: { lab: 'call', mod: 'beam', fn: 'reactions', args: [{ L: e5.L, M: e5.M, a: 0, b: e5.L, loads: [{ x: e5.L, F: e5.W }] }], values: { RB: e5.T * sn(e5.th), RA: e5.V } }
      },
      {
        type: 'callout', heading: 'Receta de estática',
        body: [
          'DCL del cuerpo completo (con su peso en el centro). Elige como eje de torques el punto con más incógnitas.',
          'Mide los brazos desde ese eje. Si una reacción sale negativa, el apoyo tendría que jalar: la viga se vuelca.'
        ]
      },
      {
        "type": "faq",
        "heading": "Dudas comunes",
        "short": "Dudas comunes",
        "items": [
          {
            "q": "¿Respecto a qué punto tomo torques?",
            "a": "Respecto a cualquiera: en equilibrio siempre da cero. Conviene el punto donde hay más fuerzas desconocidas."
          },
          {
            "q": "¿Dónde actúa el peso de la viga?",
            "a": "En su centro, si es uniforme."
          },
          {
            "q": "¿Por qué el apoyo más cercano a la carga carga más?",
            "a": "Porque la carga tiene poco brazo respecto a él y mucho respecto al otro; para equilibrar torques, la reacción cercana tiene que ser mayor."
          }
        ]
      },
      {
        "type": "recap",
        "heading": "Lo que te llevas",
        "short": "Resumen",
        "points": [
          "$\\tau = rF\\sin\\theta$: fuerza por brazo perpendicular.",
          "Equilibrio: $\\Sigma F = 0$ y $\\Sigma\\tau = 0$.",
          "Toma torques en un apoyo para eliminar su fuerza.",
          "Reacción negativa → la viga se vuelca."
        ]
      }
    ],

    lab: {
      type: 'beam-equilibrium', title: 'Viga sobre dos apoyos',
      intro: 'Mueve los apoyos, el peso de la viga y dos cargas; el lab dibuja las reacciones y avisa si la viga se vuelca. Escribe tus reacciones: detecta si repartiste a la mitad, si las intercambiaste, si mediste los brazos desde el extremo o si olvidaste el peso propio.',
      cfg: { start: { L: 6, M: 20, a: 1, b: 5, F1: 300, x1: 2, F2: 500, x2: 4.5 } }
    },

    formulas: [
      { label: 'Torque', tex: '\\tau = rF\\sin\\theta' },
      { label: 'Equilibrio', tex: '\\Sigma \\vec F = 0,\\ \\ \\Sigma \\tau = 0' },
      { label: 'Balancín', tex: 'F_1x_1 = F_2x_2' },
      { label: 'Viga en dos apoyos', tex: 'R_B = \\frac{\\Sigma F_i(x_i - x_A)}{x_B - x_A},\\ \\ R_A = \\Sigma F_i - R_B' },
      { label: 'Peso propio', tex: 'Mg \\text{ en el centro}' }
    ],

    exercises: [
      {
        id: 'f1-s15-torque', title: 'Torque con ángulo',
        vars: { F: [10, 200, 10], r: [10, 80, 5], th: [20, 80, 5] },
        prompt: function (v) { return '<p>Empujas una puerta con $' + v.F + '\\ \\text{N}$ a $' + v.r + '\\ \\text{cm}$ de las bisagras, formando $' + v.th + '^\\circ$ con la puerta. ¿Qué torque aplicas?</p>'; },
        check: 'numeric', unit: 'N·m',
        answer: function (v) { return v.F * v.r / 100 * sn(v.th); },
        baseWhere: function (v) { return v.th !== 45; },
        mistakes: { cosInstead: function (v) { return v.F * v.r / 100 * cs(v.th); }, noAngle: function (v) { return v.F * v.r / 100; }, cm: function (v) { return v.F * v.r * sn(v.th); } },
        feedback: [
          { when: 'cosInstead', say: 'Solo gira la componente perpendicular al brazo: $F\\sin\\theta$.' },
          { when: 'noAngle', say: 'Te faltó el ángulo: $\\tau = rF\\sin\\theta$.' },
          { when: 'cm', say: 'Pasa el brazo a metros.' }
        ],
        oracle: { lab: 'call', mod: 'beam', fn: 'torque', args: function (v) { return [v.F, v.r / 100, v.th]; } },
        hint: '$\\tau = rF\\sin\\theta$ con $r$ en metros.',
        solution: function (v) { return '$$\\tau = (' + fx(v.r / 100, 2) + ')(' + v.F + ')\\sin ' + v.th + '^\\circ = ' + fx(v.F * v.r / 100 * sn(v.th), 3) + '\\ \\text{N·m}$$'; }
      },
      {
        id: 'f1-s15-balancin', title: 'Equilibrar un balancín',
        vars: { m1: [15, 60, 5], x1: [1, 3, 0.25], m2: [20, 90, 5] },
        prompt: function (v) { return '<p>Una persona de $' + v.m1 + '\\ \\text{kg}$ se sienta a $' + v.x1 + '\\ \\text{m}$ del pivote de un balancín. ¿A qué distancia del pivote, del otro lado, debe sentarse otra de $' + v.m2 + '\\ \\text{kg}$ para equilibrarlo?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return v.m1 * v.x1 / v.m2; },
        baseWhere: function (v) { return v.m1 !== v.m2 && v.m1 * v.x1 / v.m2 < 4; },
        mistakes: { inverted: function (v) { return v.m2 * v.x1 / v.m1; } },
        feedback: [{ when: 'inverted', say: 'Invertiste la razón: el más pesado se sienta más cerca.' }],
        oracle: { lab: 'call', mod: 'beam', fn: 'balance', args: function (v) { return [v.m1 * g, -v.x1, v.m2 * g]; } },
        hint: 'Torques respecto al pivote: $m_1x_1 = m_2x_2$.',
        solution: function (v) { return '$$x_2 = \\frac{m_1x_1}{m_2} = \\frac{(' + v.m1 + ')(' + v.x1 + ')}{' + v.m2 + '} = ' + fx(v.m1 * v.x1 / v.m2, 3) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s15-rb', title: 'Reacción en un apoyo',
        vars: { L: [4, 10, 1], F: [100, 1500, 50], p: [10, 90, 5] },
        prompt: function (v) { var x = Number((v.L * v.p / 100).toFixed(2)); return '<p>Una viga de $' + v.L + '\\ \\text{m}$ de masa despreciable descansa en apoyos en sus dos extremos, $A$ ($x = 0$) y $B$ ($x = ' + v.L + '$ m). Una carga de $' + v.F + '\\ \\text{N}$ está en $x = ' + x + '\\ \\text{m}$. ¿Cuánto vale la reacción en $B$?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { var x = Number((v.L * v.p / 100).toFixed(2)); return v.F * x / v.L; },
        baseWhere: function (v) { return v.p !== 50; },
        mistakes: { swapped: function (v) { var x = Number((v.L * v.p / 100).toFixed(2)); return v.F * (v.L - x) / v.L; }, half: function (v) { return v.F / 2; } },
        feedback: [
          { when: 'swapped', say: 'Esa es la reacción en $A$. El apoyo más cercano a la carga carga más.' },
          { when: 'half', say: 'Solo se reparte a la mitad si la carga está en el centro. Usa torques respecto a $A$.' }
        ],
        oracle: { lab: 'call', mod: 'beam', fn: 'reactions', field: 'RB', args: function (v) { var x = Number((v.L * v.p / 100).toFixed(2)); return [{ L: v.L, M: 0, a: 0, b: v.L, loads: [{ x: x, F: v.F }] }]; } },
        hint: 'Torques respecto a $A$: $R_B L = Fx$.',
        solution: function (v) { var x = Number((v.L * v.p / 100).toFixed(2)); return '$$R_B = \\frac{Fx}{L} = \\frac{(' + v.F + ')(' + x + ')}{' + v.L + '} = ' + fx(v.F * x / v.L, 3) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f1-s15-propio', title: 'Viga con peso propio',
        vars: { L: [4, 10, 1], M: [10, 80, 5], F: [100, 1200, 50], p: [60, 95, 5] },
        prompt: function (v) { var x = Number((v.L * v.p / 100).toFixed(2)); return '<p>Una viga uniforme de $' + v.L + '\\ \\text{m}$ y $' + v.M + '\\ \\text{kg}$ descansa en apoyos en sus extremos $A$ ($x = 0$) y $B$ ($x = ' + v.L + '$ m). Una carga de $' + v.F + '\\ \\text{N}$ está en $x = ' + x + '\\ \\text{m}$. ¿Cuánto vale la reacción en $A$?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { var x = Number((v.L * v.p / 100).toFixed(2)); return v.F * (v.L - x) / v.L + v.M * g / 2; },
        mistakes: { noOwn: function (v) { var x = Number((v.L * v.p / 100).toFixed(2)); return v.F * (v.L - x) / v.L; }, swapped: function (v) { var x = Number((v.L * v.p / 100).toFixed(2)); return v.F * x / v.L + v.M * g / 2; } },
        feedback: [
          { when: 'noOwn', say: 'Olvidaste el peso de la viga, $Mg$ en el centro: cada apoyo carga la mitad.' },
          { when: 'swapped', say: 'Esa es la reacción en $B$.' }
        ],
        oracle: { lab: 'call', mod: 'beam', fn: 'reactions', field: 'RA', args: function (v) { var x = Number((v.L * v.p / 100).toFixed(2)); return [{ L: v.L, M: v.M, a: 0, b: v.L, loads: [{ x: x, F: v.F }] }]; } },
        hint: 'Torques respecto a $B$, incluido $Mg$ a $L/2$.',
        solution: function (v) { var x = Number((v.L * v.p / 100).toFixed(2)), RA = v.F * (v.L - x) / v.L + v.M * g / 2; return '$$R_A = \\frac{F(L - x) + Mg\\,L/2}{L} = ' + fx(RA, 3) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f1-s15-vuelco', title: 'Límite de volcadura',
        vars: { M: [10, 60, 5], m: [30, 100, 5], s: [2, 5, 1] },
        prompt: function (v) { return '<p>Una tabla uniforme de $' + (v.s + 1) + '\\ \\text{m}$ y $' + v.M + '\\ \\text{kg}$ descansa en un apoyo en su extremo izquierdo ($x = 0$) y otro en $x = ' + v.s + '\\ \\text{m}$. Una persona de $' + v.m + '\\ \\text{kg}$ camina por la parte que sobresale. ¿En qué posición $x$ la tabla empieza a voltearse?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return v.s + v.M * (v.s - (v.s + 1) / 2) / v.m; },
        baseWhere: function (v) { return v.M * (v.s - (v.s + 1) / 2) / v.m < 1; },
        mistakes: { armFromEnd: function (v) { return v.s + v.M * ((v.s + 1) / 2) / v.m; }, inverted: function (v) { return v.s + v.m * (v.s - (v.s + 1) / 2) / v.M; } },
        feedback: [
          { when: 'armFromEnd', say: 'El brazo del peso de la tabla se mide desde el apoyo donde gira ($B$), no desde el extremo.' },
          { when: 'inverted', say: 'Invertiste las masas: $m(x - x_B) = M(x_B - L/2)$.' }
        ],
        oracle: { lab: 'call', mod: 'beam', fn: 'maxOverhang', args: function (v) { return [{ L: v.s + 1, M: v.M, a: 0, b: v.s, loads: [] }, v.m * g]; } },
        hint: 'Al volcar, $R_A = 0$. Toma torques respecto a $B$.',
        solution: function (v) { var arm = v.s - (v.s + 1) / 2; return '$$m(x - ' + v.s + ') = M(' + fx(arm, 2) + ') \\;\\Rightarrow\\; x = ' + v.s + ' + \\frac{' + v.M + '(' + fx(arm, 2) + ')}{' + v.m + '} = ' + fx(v.s + v.M * arm / v.m, 3) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s15-pluma', title: 'Tensión del cable de una pluma',
        vars: { W: [100, 1500, 50], M: [5, 60, 5], th: [20, 60, 5] },
        prompt: function (v) { return '<p>Una viga uniforme horizontal de $' + v.M + '\\ \\text{kg}$ tiene bisagra en la pared. Un cable atado a su punta forma $' + v.th + '^\\circ$ con la viga y de la punta cuelga una carga de $' + v.W + '\\ \\text{N}$. ¿Qué tensión tiene el cable?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return (v.W + v.M * g / 2) / sn(v.th); },
        baseWhere: function (v) { return v.th !== 45; },
        mistakes: { noOwn: function (v) { return v.W / sn(v.th); }, fullOwn: function (v) { return (v.W + v.M * g) / sn(v.th); }, cosInstead: function (v) { return (v.W + v.M * g / 2) / cs(v.th); } },
        feedback: [
          { when: 'noOwn', say: 'Olvidaste el peso de la viga (en su centro).' },
          { when: 'fullOwn', say: 'El peso de la viga actúa en el centro: su brazo es $L/2$, no $L$.' },
          { when: 'cosInstead', say: 'La parte del cable que hace torque es la perpendicular a la viga: $T\\sin\\theta$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return window.LabMath.beam.reactions({ L: 1, M: v.M, a: 0, b: 1, loads: [{ x: 1, F: v.W }] }).RB / sn(v.th); } },
        hint: 'Torques respecto a la bisagra: $TL\\sin\\theta = WL + Mg\\,L/2$.',
        solution: function (v) { return '$$T = \\frac{W + Mg/2}{\\sin\\theta} = \\frac{' + v.W + ' + ' + fx(v.M * g / 2, 3) + '}{\\sin ' + v.th + '^\\circ} = ' + fx((v.W + v.M * g / 2) / sn(v.th), 3) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f1-s15-concepto', title: 'Concepto: dónde empujar',
        vars: {},
        prompt: function () { return '<p>¿Dónde conviene empujar una puerta pesada para abrirla con la menor fuerza?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'En el borde opuesto a las bisagras, perpendicular a la puerta', correct: true },
            { text: 'Cerca de las bisagras, porque ahí la puerta está sujeta', say: 'Cerca del eje el brazo es chico: hace falta más fuerza.' },
            { text: 'En el centro, porque ahí está su centro de gravedad', say: 'El centro de gravedad no importa aquí: importa el brazo desde las bisagras.' },
            { text: 'Da igual dónde, si la fuerza es la misma', say: 'El torque $rF\\sin\\theta$ crece con $r$.' }
          ];
        },
        answer: function () { return 'En el borde opuesto a las bisagras, perpendicular a la puerta'; },
        hint: '$\\tau = rF\\sin\\theta$: ¿qué conviene maximizar?',
        solution: function () { return 'Para el mismo torque, la fuerza es mínima con $r$ máximo (el borde) y $\\sin\\theta = 1$ (perpendicular).'; }
      }
    ],

    quiz: { tags: ['f1.S15'], count: 8 },

    errors: [
      'Usar $\\cos\\theta$ en el torque o no usar el ángulo.',
      'Repartir la carga a la mitad entre dos apoyos.',
      'Medir los brazos desde el extremo de la viga en vez del eje de torques.',
      'Olvidar el peso propio de la viga o ponerlo en un extremo.',
      'Olvidar que una reacción negativa significa que la viga se vuelca.'
    ],

    teacher: {
      plan: [
        'Explainer del torque con la puerta: brazo y ángulo.',
        'Balancín: primer problema de $\\Sigma\\tau = 0$.',
        'Viga en dos apoyos paso a paso; peso propio en el centro.',
        'Volcadura y pluma con cable; lab de la viga.'
      ],
      check: [
        'Que elijan el eje de torques donde hay más incógnitas.',
        'Que comprueben con torques respecto al otro apoyo.'
      ],
      note: 'Cierra el curso: los problemas de examen del bloque E combinan S14 y S15.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 1</em>, §10.6 “Torque”. <a href="https://openstax.org/books/university-physics-volume-1/pages/10-6-torque">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §12.1 “Conditions for Static Equilibrium”. <a href="https://openstax.org/books/university-physics-volume-1/pages/12-1-conditions-for-static-equilibrium">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §12.2 “Examples of Static Equilibrium”. <a href="https://openstax.org/books/university-physics-volume-1/pages/12-2-examples-of-static-equilibrium">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-14',
    next: null
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
