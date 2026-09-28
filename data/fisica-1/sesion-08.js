/* =====================================================================
   Física 1 · S08 · Leyes de Newton y diagrama de cuerpo libre (bloque C).
   Fuente: OpenStax, University Physics Volume 1, §5.1–5.7 (CC BY-NC-SA 4.0).
   g = 9.81 m/s². Las cuentas se comprueban contra LabMath.forces
   (lab fbd-builder) y LabMath.vectors.
   ===================================================================== */
(function () {
  var g = 9.81, RAD = Math.PI / 180, DEG = 180 / Math.PI;
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

  // Ejemplo 1: caja empujada horizontalmente sobre piso liso
  var e1 = { m: 12, F: 48 }; e1.N = e1.m * g; e1.a = e1.F / e1.m;
  // Ejemplo 2: tres fuerzas sobre un disco en el hielo
  var e2 = { m: 4, F: [[20, 0], [15, 90], [10, 225]] };
  e2.x = 0; e2.y = 0; e2.F.forEach(function (f) { e2.x += f[0] * Math.cos(f[1] * RAD); e2.y += f[0] * Math.sin(f[1] * RAD); });
  e2.mag = Math.hypot(e2.x, e2.y); e2.ang = Math.atan2(e2.y, e2.x) * DEG; e2.a = e2.mag / e2.m;
  // Ejemplo 3: persona en un elevador
  var e3 = { m: 70, a: 1.5 }; e3.Nup = e3.m * (g + e3.a); e3.Ndown = e3.m * (g - e3.a);

  var data = window.SESSION_DATA = {
    slug: 'sesion-08', number: '08', group: 'C · Dinámica',
    title: 'Leyes de Newton y diagrama de cuerpo libre', temario: [],
    minutes: 150,
    quote: 'Antes de escribir una sola ecuación, dibuja el cuerpo solo con las fuerzas que lo tocan.',
    badges: [
      'Enunciar y aplicar las tres leyes de Newton.',
      'Distinguir masa de peso.',
      'Dibujar diagramas de cuerpo libre sin fuerzas de más ni de menos.',
      'Resolver ΣF = ma por componentes, incluido el elevador que acelera.'
    ],

    lesson: [
      {
        "type": "warmup",
        "heading": "Antes de empezar",
        "short": "Antes de empezar",
        "idea": "Las fuerzas cambian el movimiento: la <strong>fuerza neta</strong> sobre un cuerpo es su masa por su aceleración, $\\Sigma\\vec F = m\\vec a$.",
        "recall": [
          "Suma de vectores por componentes (S02).",
          "Que el peso es $mg$ y apunta hacia abajo."
        ],
        "why": "Las tres leyes de Newton explican casi todo lo que se mueve a tu alrededor: por qué frenas, por qué una báscula marca distinto en un elevador o cuánta fuerza necesita un motor."
      },
      {
        "type": "concept",
        "heading": "Imagínalo así",
        "short": "Imagínalo así",
        "body": [
          "Primera ley: si nadie empuja ni jala, un objeto sigue como está (quieto o en línea recta a velocidad constante). Por eso sales \"hacia adelante\" cuando un camión frena: tu cuerpo quiere seguir.",
          "Segunda ley: si las fuerzas no se cancelan, el objeto acelera en la dirección de la fuerza neta. Más masa, menos aceleración con la misma fuerza.",
          "Tercera ley: si empujas una pared, la pared te empuja igual. Esas dos fuerzas actúan en cuerpos distintos, por eso no se cancelan entre sí."
        ]
      },
      {
        type: 'concept', heading: 'Las tres leyes', short: 'Leyes de Newton',
        body: [
          '<strong>Primera ley (inercia):</strong> si la fuerza neta sobre un cuerpo es cero, su velocidad no cambia: sigue en reposo o en línea recta a velocidad constante. No hace falta una fuerza para <em>mantener</em> el movimiento.',
          '<strong>Segunda ley:</strong> la fuerza neta produce aceleración en su misma dirección: $$\\Sigma\\vec{F} = m\\vec{a}$$ Se aplica por componentes: $\\Sigma F_x = ma_x$ y $\\Sigma F_y = ma_y$. La unidad es el newton, $1\\ \\text{N} = 1\\ \\text{kg·m/s}^2$.',
          '<strong>Tercera ley:</strong> si A empuja a B, B empuja a A con una fuerza igual y opuesta. Esas dos fuerzas actúan sobre <em>cuerpos distintos</em>, así que nunca se cancelan entre sí.'
        ],
        diagram: 'newton3',
        caption: 'Par de acción y reacción: una fuerza actúa sobre la caja y la otra sobre la persona.'
      },
      {
        type: 'concept', heading: 'Masa, peso y normal', short: 'Peso y normal',
        body: [
          'La <strong>masa</strong> (kg) mide cuánta materia tiene un cuerpo y cuánto se resiste a acelerar. El <strong>peso</strong> es la fuerza con que la Tierra lo atrae: $w = mg$, en newtons, siempre vertical hacia abajo.',
          'La <strong>normal</strong> es la fuerza con que una superficie empuja a lo que se apoya en ella, perpendicular a la superficie. <strong>No siempre vale $mg$</strong>: se calcula con $\\Sigma F_y = ma_y$. Cambia si hay fuerzas inclinadas, si la superficie está inclinada o si todo acelera verticalmente, como en un elevador.'
        ]
      },
      {
        type: 'explainer', heading: 'Cómo armar un diagrama de cuerpo libre', short: 'Diagrama de cuerpo libre',
        title: 'Paso a paso',
        intro: 'El diagrama de cuerpo libre (DCL) es la mitad del problema. Hazlo siempre antes de escribir ΣF = ma.',
        diagram: 'fbd-explainer',
        steps: [
          { text: 'Mira la situación: una caja jalada por una cuerda sobre un piso con fricción.', state: { step: 0 } },
          { text: 'Aísla el cuerpo: dibuja solo la caja. El peso $mg$ siempre actúa, hacia abajo.', state: { step: 1 } },
          { text: 'Recorre lo que toca a la caja. El piso la empuja: normal $N$, perpendicular al piso.', state: { step: 2 } },
          { text: 'La cuerda jala a lo largo de sí misma: tensión $T$. Las cuerdas solo jalan, nunca empujan.', state: { step: 3 } },
          { text: 'Si hay fricción, se opone al deslizamiento. Elige ejes y descompón las fuerzas inclinadas. No existe la "fuerza del movimiento".', state: { step: 4 } }
        ]
      },
      {
        "type": "recipe",
        "heading": "Receta: problemas de Newton",
        "short": "Receta",
        "steps": [
          {
            "text": "Elige un cuerpo y dibújalo solo (diagrama de cuerpo libre)."
          },
          {
            "text": "Dibuja todas las fuerzas que actúan sobre él: peso, normal, tensiones, fricción, empujes.",
            "tip": "Cada fuerza necesita \"algo que la haga\": si no puedes decir quién la ejerce, no existe."
          },
          {
            "text": "Elige ejes; conviene uno en la dirección de la aceleración."
          },
          {
            "text": "Escribe $\\Sigma F_x = ma_x$ y $\\Sigma F_y = ma_y$ con signos."
          },
          {
            "text": "Resuelve el sistema."
          }
        ]
      },
      {
        type: 'example', heading: 'Una caja con una fuerza horizontal',
        problem: '<p>Empujas horizontalmente una caja de $' + e1.m + '\\ \\text{kg}$ con $' + e1.F + '\\ \\text{N}$ sobre un piso liso (sin fricción). ¿Cuánto vale la normal y qué aceleración tiene la caja?</p>',
        steps: [
          { text: 'DCL: peso hacia abajo, normal hacia arriba y tu fuerza hacia la derecha.' },
          { text: 'En $y$ no acelera: $\\Sigma F_y = 0$.', math: 'N - mg = 0 \\;\\Rightarrow\\; N = (' + e1.m + ')(9.81) = ' + fx(e1.N) + '\\ \\text{N}' },
          { text: 'En $x$, la única fuerza es la tuya.', math: 'a = \\frac{F}{m} = \\frac{' + e1.F + '}{' + e1.m + '} = ' + fx(e1.a) + '\\ \\text{m/s}^2' }
        ],
        answer: '$N = ' + fx(e1.N) + '\\ \\text{N}$ y $a = ' + fx(e1.a) + '\\ \\text{m/s}^2$.',
        verify: { lab: 'call', mod: 'forces', fn: 'scene', args: ['empuje', { m: e1.m, F: e1.F }], values: { N: e1.N, a: e1.a } }
      },
      {
        type: 'example', heading: 'Varias fuerzas a la vez',
        problem: '<p>Sobre un disco de hockey de $' + e2.m + '\\ \\text{kg}$ en hielo sin fricción actúan tres fuerzas horizontales: $20\\ \\text{N}$ a $0^\\circ$, $15\\ \\text{N}$ a $90^\\circ$ y $10\\ \\text{N}$ a $225^\\circ$. ¿Cuánto vale la fuerza neta y qué aceleración tiene?</p>',
        steps: [
          { text: 'Suma las componentes $x$.', math: '\\Sigma F_x = 20 + 0 + 10\\cos 225^\\circ = ' + fx(e2.x) + '\\ \\text{N}' },
          { text: 'Suma las componentes $y$.', math: '\\Sigma F_y = 0 + 15 + 10\\sin 225^\\circ = ' + fx(e2.y) + '\\ \\text{N}' },
          { text: 'Magnitud y dirección de la fuerza neta.', math: '|\\Sigma\\vec{F}| = \\sqrt{' + fx(e2.x) + '^2 + ' + fx(e2.y) + '^2} = ' + fx(e2.mag) + '\\ \\text{N} \\qquad \\theta = ' + fx(e2.ang, 1) + '^\\circ' },
          { text: 'La aceleración apunta igual que la fuerza neta.', math: 'a = \\frac{' + fx(e2.mag) + '}{' + e2.m + '} = ' + fx(e2.a) + '\\ \\text{m/s}^2' }
        ],
        answer: '$|\\Sigma\\vec{F}| \\approx ' + fx(e2.mag) + '\\ \\text{N}$ a $' + fx(e2.ang, 1) + '^\\circ$ y $a \\approx ' + fx(e2.a) + '\\ \\text{m/s}^2$.',
        verify: { lab: 'call', mod: 'vectors', fn: 'sum', args: [e2.F], values: { x: e2.x, y: e2.y, mag: e2.mag } }
      },
      {
        type: 'concept', heading: 'El elevador y el peso aparente', short: 'Peso aparente',
        body: [
          'Dentro de un elevador que acelera, una báscula no marca tu peso: marca la normal $N$. Con el eje hacia arriba, $N - mg = ma$, así que $$N = m(g + a)$$',
          'Si el elevador acelera hacia arriba ($a > 0$), te sientes más pesado; si acelera hacia abajo ($a < 0$), más ligero. A velocidad constante, $a = 0$ y la báscula marca $mg$, aunque el elevador se mueva.'
        ],
        diagram: 'elevator',
        caption: 'Lo que "sientes" como peso es la normal que te sostiene.'
      },
      {
        type: 'example', heading: 'Un elevador que acelera',
        problem: '<p>Una persona de $' + e3.m + '\\ \\text{kg}$ está parada sobre una báscula dentro de un elevador. ¿Qué marca la báscula (en N) cuando el elevador acelera a $' + e3.a + '\\ \\text{m/s}^2$ hacia arriba? ¿Y hacia abajo?</p>',
        steps: [
          { text: 'DCL de la persona: peso hacia abajo y normal (la báscula) hacia arriba.', math: 'N - mg = ma' },
          { text: 'Acelerando hacia arriba, $a = +' + e3.a + '$.', math: 'N = ' + e3.m + '(9.81 + ' + e3.a + ') = ' + fx(e3.Nup, 1) + '\\ \\text{N}' },
          { text: 'Acelerando hacia abajo, $a = -' + e3.a + '$.', math: 'N = ' + e3.m + '(9.81 - ' + e3.a + ') = ' + fx(e3.Ndown, 1) + '\\ \\text{N}' },
          { text: 'Su peso real, $mg = ' + fx(e3.m * g, 1) + '$ N, no cambia en ningún caso.' }
        ],
        answer: 'Marca $' + fx(e3.Nup, 1) + '\\ \\text{N}$ subiendo y acelerando, y $' + fx(e3.Ndown, 1) + '\\ \\text{N}$ acelerando hacia abajo.',
        verify: { lab: 'call', mod: 'forces', fn: 'scene', args: ['elevador', { m: e3.m, acc: e3.a }], values: { N: e3.Nup } }
      },
      {
        type: 'callout', heading: 'Tres errores que el DCL evita',
        body: [
          'Poner una "fuerza del movimiento": si algo se mueve y nada lo empuja, no hay fuerza hacia adelante; solo inercia.',
          'Usar $N = mg$ sin pensarlo. Escribe siempre $\\Sigma F_y = ma_y$.',
          'Sumar el par de acción y reacción en el mismo DCL: esas fuerzas actúan sobre cuerpos distintos.'
        ]
      },
      {
        "type": "faq",
        "heading": "Dudas comunes",
        "short": "Dudas comunes",
        "items": [
          {
            "q": "¿La normal siempre es $mg$?",
            "a": "No. Solo cuando nada más empuja en vertical y no hay aceleración vertical. En un elevador que acelera, o si alguien jala hacia arriba, cambia."
          },
          {
            "q": "¿Masa y peso son lo mismo?",
            "a": "No. La masa (kg) es cuánta materia hay; el peso (N) es la fuerza con que la Tierra la jala: $w = mg$."
          },
          {
            "q": "¿Existe la \"fuerza del movimiento\"?",
            "a": "No. Un objeto en movimiento no necesita una fuerza para seguir moviéndose; necesita una fuerza para <em>cambiar</em> su movimiento."
          }
        ]
      },
      {
        "type": "recap",
        "heading": "Lo que te llevas",
        "short": "Resumen",
        "points": [
          "$\\Sigma\\vec F = m\\vec a$.",
          "Diagrama de cuerpo libre antes de escribir ecuaciones.",
          "Acción y reacción actúan sobre cuerpos distintos.",
          "La normal no siempre es $mg$."
        ]
      }
    ],

    lab: {
      type: 'fbd-builder', title: 'Arma el diagrama de cuerpo libre',
      intro: 'Elige una situación, marca las fuerzas que actúan sobre el cuerpo y su dirección, y escribe la normal (o la tensión) y la aceleración. El lab dice qué fuerzas faltan, cuáles sobran y si usaste $N = mg$ donde no se vale.',
      cfg: { start: { scene: 'jalon' } }
    },

    formulas: [
      { label: 'Segunda ley', tex: '\\Sigma\\vec{F} = m\\vec{a}' },
      { label: 'Por componentes', tex: '\\Sigma F_x = ma_x,\\ \\ \\Sigma F_y = ma_y' },
      { label: 'Peso', tex: 'w = mg' },
      { label: 'Elevador (y hacia arriba)', tex: 'N = m(g + a)' },
      { label: 'Tercera ley', tex: '\\vec{F}_{A\\to B} = -\\vec{F}_{B\\to A}' },
      { label: 'Newton', tex: '1\\ \\text{N} = 1\\ \\text{kg·m/s}^2' }
    ],

    exercises: [
      {
        id: 'f1-s08-horizontal', title: 'Caja con una fuerza horizontal',
        vars: { m: [2, 40, 1], F: [10, 200, 5] },
        prompt: function (v) { return '<p>Empujas horizontalmente una caja de $' + v.m + '\\ \\text{kg}$ con $' + v.F + '\\ \\text{N}$ sobre un piso liso. ¿Qué aceleración tiene?</p>'; },
        check: 'numeric', unit: 'm/s²',
        answer: function (v) { return v.F / v.m; },
        mistakes: { byWeight: function (v) { return v.F / (v.m * g); } },
        feedback: [{ when: 'byWeight', say: 'Dividiste entre el peso $mg$. La segunda ley usa la masa: $a = F/m$.' }],
        oracle: { lab: 'call', mod: 'forces', fn: 'scene', field: 'a', args: function (v) { return ['empuje', { m: v.m, F: v.F }]; } },
        hint: 'En $x$ solo actúa tu fuerza: $\\Sigma F_x = ma$.',
        solution: function (v) { return '$$a = \\frac{F}{m} = \\frac{' + v.F + '}{' + v.m + '} = ' + fx(v.F / v.m, 3) + '\\ \\text{m/s}^2$$'; }
      },
      {
        id: 'f1-s08-varias', title: 'Varias fuerzas a la vez',
        vars: { F1: [5, 40, 1], F2: [5, 40, 1], F3: [5, 40, 1], b: [100, 170, 10] },
        prompt: function (v) { return '<p>Sobre un carrito actúan $' + v.F1 + '\\ \\text{N}$ a $0^\\circ$, $' + v.F2 + '\\ \\text{N}$ a $90^\\circ$ y $' + v.F3 + '\\ \\text{N}$ a $' + v.b + '^\\circ$ (todas horizontales, vistas desde arriba). ¿Cuánto mide la fuerza neta?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { var x = v.F1 + v.F3 * Math.cos(v.b * RAD), y = v.F2 + v.F3 * Math.sin(v.b * RAD); return Math.hypot(x, y); },
        mistakes: { added: function (v) { return v.F1 + v.F2 + v.F3; } },
        feedback: [{ when: 'added', say: 'Sumaste las magnitudes. Las fuerzas son vectores: suma componentes.' }],
        oracle: { lab: 'call', mod: 'vectors', fn: 'sum', field: 'mag', args: function (v) { return [[[v.F1, 0], [v.F2, 90], [v.F3, v.b]]]; } },
        hint: 'Suma todas las componentes $x$ y todas las $y$; luego Pitágoras.',
        solution: function (v) {
          var x = v.F1 + v.F3 * Math.cos(v.b * RAD), y = v.F2 + v.F3 * Math.sin(v.b * RAD);
          return '$$\\Sigma F_x = ' + fx(x, 3) + '\\ \\text{N} \\qquad \\Sigma F_y = ' + fx(y, 3) + '\\ \\text{N} \\qquad |\\Sigma\\vec{F}| = ' + fx(Math.hypot(x, y), 3) + '\\ \\text{N}$$';
        }
      },
      {
        id: 'f1-s08-elevador-sube', title: 'Elevador que acelera hacia arriba',
        vars: { m: [40, 100, 5], a: [0.5, 4, 0.5] },
        prompt: function (v) { return '<p>Una persona de $' + v.m + '\\ \\text{kg}$ va en un elevador que acelera hacia arriba a $' + v.a + '\\ \\text{m/s}^2$. ¿Cuánto vale la normal que el piso ejerce sobre ella?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return v.m * (g + v.a); },
        mistakes: { usedMg: function (v) { return v.m * g; }, minusA: function (v) { return v.m * (g - v.a); } },
        feedback: [
          { when: 'usedMg', say: 'Ese es el peso. Como acelera, $N - mg = ma$: la normal es mayor que $mg$.' },
          { when: 'minusA', say: 'Signo al revés: acelerando hacia arriba, la normal debe superar al peso.' }
        ],
        oracle: { lab: 'call', mod: 'forces', fn: 'scene', field: 'N', args: function (v) { return ['elevador', { m: v.m, acc: v.a }]; } },
        hint: 'Con el eje hacia arriba: $N - mg = ma$.',
        solution: function (v) { return '$$N = m(g + a) = ' + v.m + '(9.81 + ' + v.a + ') = ' + fx(v.m * (g + v.a), 1) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f1-s08-elevador-baja', title: 'Elevador que acelera hacia abajo',
        vars: { m: [40, 100, 5], a: [0.5, 4, 0.5] },
        prompt: function (v) { return '<p>Un paquete de $' + v.m + '\\ \\text{kg}$ descansa en el piso de un elevador que acelera hacia abajo a $' + v.a + '\\ \\text{m/s}^2$. ¿Cuánto vale la normal sobre el paquete?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return v.m * (g - v.a); },
        mistakes: { plusA: function (v) { return v.m * (g + v.a); }, usedMg: function (v) { return v.m * g; } },
        feedback: [
          { when: 'plusA', say: 'La aceleración apunta hacia abajo, así que $a$ es negativa y la normal queda menor que el peso.' },
          { when: 'usedMg', say: 'Ese es el peso; como el elevador acelera, la normal cambia.' }
        ],
        oracle: { lab: 'call', mod: 'forces', fn: 'scene', field: 'N', args: function (v) { return ['elevador', { m: v.m, acc: -v.a }]; } },
        hint: 'Mismo planteamiento, $N - mg = ma$, con $a$ negativa.',
        solution: function (v) { return '$$N = m(g - a) = ' + v.m + '(9.81 - ' + v.a + ') = ' + fx(v.m * (g - v.a), 1) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f1-s08-tercera', title: 'Concepto: acción y reacción',
        vars: {},
        prompt: function () { return '<p>Un camión choca con un mosquito. ¿Cómo es la fuerza que el mosquito ejerce sobre el camión comparada con la que el camión ejerce sobre el mosquito?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Igual en magnitud y opuesta', correct: true },
            { text: 'Mucho menor', say: 'Tercera ley: las fuerzas de un par son iguales. Lo distinto es la aceleración, porque las masas son muy distintas.' },
            { text: 'Mucho mayor', say: 'Son exactamente iguales en magnitud.' },
            { text: 'Cero, porque el mosquito no empuja', say: 'Si el camión empuja al mosquito, el mosquito empuja al camión.' }
          ];
        },
        answer: function () { return 'Igual en magnitud y opuesta'; },
        hint: 'Piensa en la tercera ley y luego en $a = F/m$ para cada uno.',
        solution: function () { return 'Por la tercera ley son iguales y opuestas; el mosquito se acelera muchísimo más porque su masa es diminuta.'; }
      },
      {
        id: 'f1-s08-inercia', title: 'Concepto: la fuerza del movimiento',
        vars: {},
        prompt: function () { return '<p>Una pelota rueda sobre una mesa sin fricción después de que la empujaste. ¿Qué fuerzas horizontales actúan sobre ella?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Ninguna', correct: true },
            { text: 'La fuerza que le diste, que la sigue empujando', say: 'Tu fuerza dejó de actuar al soltarla. Sigue por inercia (primera ley).' },
            { text: 'Una fuerza del movimiento hacia adelante', say: 'No existe: el movimiento no es una fuerza.' },
            { text: 'Su peso', say: 'El peso es vertical, y aquí lo equilibra la normal.' }
          ];
        },
        answer: function () { return 'Ninguna'; },
        hint: 'Una fuerza siempre la ejerce algo que toca a la pelota (o la gravedad).',
        solution: function () { return 'Nada la empuja horizontalmente: su velocidad no cambia por la primera ley.'; }
      }
    ],

    quiz: { tags: ['f1.S08'], count: 8 },

    errors: [
      'Agregar una "fuerza del movimiento" en la dirección en que se mueve el cuerpo.',
      'Usar $N = mg$ cuando hay fuerzas inclinadas, rampas o aceleración vertical.',
      'Confundir masa (kg) con peso (N).',
      'Cancelar las fuerzas de un par acción-reacción como si actuaran sobre el mismo cuerpo.',
      'Sumar magnitudes de fuerzas que apuntan en direcciones distintas.'
    ],

    teacher: {
      plan: [
        'Primera ley con ejemplos cotidianos: ¿qué mantiene en movimiento a un disco de hockey?',
        'Explainer del DCL con la caja jalada; luego el lab con el diagrama del compañero que trae cargado.',
        'Ejemplos: fuerza horizontal, varias fuerzas y el elevador.'
      ],
      check: [
        'Que cada fuerza del DCL tenga un "responsable" (algo que toca o la gravedad).',
        'Que escriban ΣF_y = ma_y antes de dar la normal.'
      ],
      note: 'Las sesiones S09 a S11 son aplicaciones de esta: conviene insistir en el DCL.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 1</em>, §5.2 “Newton’s First Law”. <a href="https://openstax.org/books/university-physics-volume-1/pages/5-2-newtons-first-law">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §5.3 “Newton’s Second Law”. <a href="https://openstax.org/books/university-physics-volume-1/pages/5-3-newtons-second-law">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §5.5 “Newton’s Third Law”. <a href="https://openstax.org/books/university-physics-volume-1/pages/5-5-newtons-third-law">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §5.7 “Drawing Free-Body Diagrams”. <a href="https://openstax.org/books/university-physics-volume-1/pages/5-7-drawing-free-body-diagrams">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-07',
    next: 'sesion-09'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
