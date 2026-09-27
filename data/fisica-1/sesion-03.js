/* =====================================================================
   Física 1 · S03 · Operaciones vectoriales: vector unitario, producto
   escalar y producto vectorial (bloque A · Herramientas).
   Fuente: OpenStax, University Physics Volume 1, §2.2 y §2.4 (CC BY-NC-SA 4.0).
   Las cuentas se comprueban contra LabMath.vec3 (lab dot-cross).
   ===================================================================== */
(function () {
  var DEG = 180 / Math.PI, RAD = Math.PI / 180;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function mag(a) { return Math.sqrt(dot(a, a)); }
  function vtex(a) { return '(' + a.join(',\\ ') + ')'; }
  function p(x) { return x < 0 ? '(' + x + ')' : String(x); }

  var A = [2, -1, 3], B = [1, 4, -2];
  var e1 = { dot: dot(A, B), mA: mag(A), mB: mag(B) };
  e1.ang = Math.acos(e1.dot / (e1.mA * e1.mB)) * DEG;
  var e2 = cross(A, B);
  var F = [12, 5, 0], dsp = [3, 0, 0];     // ejemplo 3: trabajo de una fuerza
  var u = [3, 4, 12], mu = mag(u);           // vector unitario

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

  var data = window.SESSION_DATA = {
    slug: 'sesion-03', number: '03', group: 'A · Herramientas',
    title: 'Operaciones vectoriales: vector unitario, producto escalar y producto vectorial', temario: [],
    minutes: 150,
    quote: 'El producto escalar pregunta cuánto se parecen dos direcciones; el vectorial, cuánto se apartan y hacia dónde gira una respecto a la otra.',
    badges: [
      'Obtener el vector unitario de cualquier vector.',
      'Calcular el producto escalar con componentes y con el ángulo.',
      'Encontrar el ángulo entre dos vectores y la proyección de uno sobre otro.',
      'Calcular el producto vectorial con el determinante y la regla de la mano derecha.'
    ],

    lesson: [
      {
        type: 'concept', heading: 'El vector unitario', short: 'Vector unitario',
        body: [
          'Un vector <strong>unitario</strong> mide 1 y solo sirve para señalar una dirección. Para obtener el de $\\vec{A}$, divide entre su magnitud: $$\\hat{A} = \\frac{\\vec{A}}{|\\vec{A}|}$$',
          'Los más usados son $\\hat{\\imath}$, $\\hat{\\jmath}$ y $\\hat{k}$, en $x$, $y$ y $z$. En 3D un vector se escribe $\\vec{A} = A_x\\,\\hat{\\imath} + A_y\\,\\hat{\\jmath} + A_z\\,\\hat{k}$ y mide $\\sqrt{A_x^2 + A_y^2 + A_z^2}$.',
          'Ejemplo: $\\vec{u} = (3, 4, 12)$ mide $\\sqrt{9 + 16 + 144} = 13$, así que $\\hat{u} = (3/13,\\ 4/13,\\ 12/13)$.'
        ],
        diagram: 'unit-vector',
        caption: 'Mismo rumbo, tamaño 1: el vector unitario es "la dirección" de A.'
      },
      {
        type: 'explainer', heading: 'Producto escalar: la sombra de un vector sobre otro', short: 'Producto escalar',
        title: 'A·B = |A||B| cos θ',
        intro: 'El producto escalar (o producto punto) toma dos vectores y da un <strong>número</strong>. Mide qué tanto apunta uno en la dirección del otro.',
        diagram: 'dot-projection',
        steps: [
          { text: 'Con $\\theta$ agudo, la sombra de $\\vec{A}$ sobre $\\vec{B}$ mide $A\\cos\\theta$ y va en el mismo sentido que $\\vec{B}$: $\\vec{A}\\cdot\\vec{B} > 0$.', state: { ang: 40 } },
          { text: 'A $90^\\circ$ no hay sombra: $\\cos 90^\\circ = 0$. Dos vectores son <strong>perpendiculares</strong> si y solo si su producto escalar es cero.', state: { ang: 90 } },
          { text: 'Con $\\theta$ obtuso la sombra apunta en contra de $\\vec{B}$: el producto es negativo.', state: { ang: 145 } },
          { text: 'Con componentes no hace falta el ángulo: $\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z$. Igualando las dos formas se despeja $\\theta$.', state: { ang: 60 } }
        ]
      },
      {
        type: 'example', heading: 'Producto escalar y ángulo entre vectores',
        problem: '<p>Con $\\vec{A} = ' + vtex(A) + '$ y $\\vec{B} = ' + vtex(B) + '$, calcula $\\vec{A}\\cdot\\vec{B}$ y el ángulo entre ellos.</p>',
        steps: [
          { text: 'Multiplica componente con componente y suma.', math: '\\vec{A}\\cdot\\vec{B} = (2)(1) + (-1)(4) + (3)(-2) = 2 - 4 - 6 = ' + e1.dot },
          { text: 'Magnitudes.', math: '|\\vec{A}| = \\sqrt{4 + 1 + 9} = \\sqrt{14} \\qquad |\\vec{B}| = \\sqrt{1 + 16 + 4} = \\sqrt{21}' },
          { text: 'Despeja el ángulo de $\\vec{A}\\cdot\\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\theta$.', math: '\\cos\\theta = \\frac{' + e1.dot + '}{\\sqrt{14}\\sqrt{21}} = ' + fx(e1.dot / (e1.mA * e1.mB), 4) + ' \\;\\Rightarrow\\; \\theta = ' + fx(e1.ang, 1) + '^\\circ' },
          { text: 'El producto es negativo, así que el ángulo es mayor a $90^\\circ$: apuntan más en contra que a favor.' }
        ],
        answer: '$\\vec{A}\\cdot\\vec{B} = ' + e1.dot + '$ y $\\theta \\approx ' + fx(e1.ang, 1) + '^\\circ$.',
        verify: { lab: 'call', mod: 'vec3', fn: 'angle', args: [A, B], value: e1.ang }
      },
      {
        type: 'example', heading: 'Trabajo de una fuerza',
        problem: '<p>Un robot jala una caja con $\\vec{F} = (' + F[0] + '\\,\\hat{\\imath} + ' + F[1] + '\\,\\hat{\\jmath})\\ \\text{N}$ mientras la caja se mueve $\\vec{d} = ' + dsp[0] + '\\,\\hat{\\imath}\\ \\text{m}$. El trabajo es $W = \\vec{F}\\cdot\\vec{d}$ (lo verás en S12). ¿Cuánto vale?</p>',
        steps: [
          { text: 'Solo la componente de la fuerza en la dirección del movimiento hace trabajo.', math: 'W = (12)(3) + (5)(0) + (0)(0) = ' + dot(F, dsp) + '\\ \\text{J}' },
          { text: 'La componente vertical de 5 N no aporta: es perpendicular al desplazamiento.' }
        ],
        answer: '$W = ' + dot(F, dsp) + '\\ \\text{J}$.',
        verify: { lab: 'call', mod: 'vec3', fn: 'dot', args: [F, dsp], value: dot(F, dsp) }
      },
      {
        type: 'concept', heading: 'Producto vectorial', short: 'Producto vectorial',
        body: [
          'El producto vectorial (o producto cruz) de dos vectores da <strong>otro vector</strong>, perpendicular a los dos. Su magnitud es el área del paralelogramo que forman: $|\\vec{A}\\times\\vec{B}| = AB\\sin\\theta$.',
          'Su sentido lo da la <strong>regla de la mano derecha</strong>: los dedos van de $\\vec{A}$ hacia $\\vec{B}$ y el pulgar señala $\\vec{A}\\times\\vec{B}$. Por eso el orden importa: $\\vec{B}\\times\\vec{A} = -\\vec{A}\\times\\vec{B}$.',
          'Con componentes se usa el determinante (fíjate en el signo menos del término de $\\hat{\\jmath}$): $$\\vec{A}\\times\\vec{B} = \\begin{vmatrix} \\hat{\\imath} & \\hat{\\jmath} & \\hat{k} \\\\ A_x & A_y & A_z \\\\ B_x & B_y & B_z \\end{vmatrix} = (A_yB_z - A_zB_y)\\,\\hat{\\imath} - (A_xB_z - A_zB_x)\\,\\hat{\\jmath} + (A_xB_y - A_yB_x)\\,\\hat{k}$$'
        ],
        diagram: 'cross-product',
        caption: '$\\hat{\\imath}\\times\\hat{\\jmath} = \\hat{k}$, $\\hat{\\jmath}\\times\\hat{k} = \\hat{\\imath}$ y $\\hat{k}\\times\\hat{\\imath} = \\hat{\\jmath}$. En sentido contrario salen con signo menos.'
      },
      {
        type: 'example', heading: 'Producto vectorial con el determinante',
        problem: '<p>Con los mismos $\\vec{A} = ' + vtex(A) + '$ y $\\vec{B} = ' + vtex(B) + '$, calcula $\\vec{A}\\times\\vec{B}$.</p>',
        steps: [
          { text: 'Componente $\\hat{\\imath}$: tapa la columna de $\\hat{\\imath}$.', math: '(-1)(-2) - (3)(4) = 2 - 12 = ' + e2[0] },
          { text: 'Componente $\\hat{\\jmath}$: tapa su columna y <strong>cambia el signo</strong>.', math: '-[(2)(-2) - (3)(1)] = -(-4 - 3) = ' + e2[1] },
          { text: 'Componente $\\hat{k}$.', math: '(2)(4) - (-1)(1) = 8 + 1 = ' + e2[2] },
          { text: 'Comprobación: debe ser perpendicular a los dos.', math: '(\\vec{A}\\times\\vec{B})\\cdot\\vec{A} = ' + p(e2[0]) + '(2) + ' + p(e2[1]) + '(-1) + ' + p(e2[2]) + '(3) = ' + dot(e2, A) }
        ],
        answer: '$\\vec{A}\\times\\vec{B} = ' + vtex(e2) + '$.',
        verify: { lab: 'call', mod: 'vec3', fn: 'cross', args: [A, B], value: e2 }
      },
      {
        type: 'callout', heading: '¿Escalar o vectorial?',
        body: [
          'El <strong>escalar</strong> da un número y es máximo cuando los vectores son paralelos: sirve para el trabajo y para proyectar.',
          'El <strong>vectorial</strong> da un vector y es máximo cuando son perpendiculares: sirve para el torque (S15) y para todo lo que gira.'
        ]
      }
    ],

    lab: {
      type: 'dot-cross', title: 'Producto escalar y vectorial',
      intro: 'Escribe dos vectores, calcula a mano $\\vec{A}\\cdot\\vec{B}$ y $\\vec{A}\\times\\vec{B}$ y compáralos. Gira la vista 3D para ver que $\\vec{A}\\times\\vec{B}$ es perpendicular a los dos. El lab detecta si calculaste $\\vec{B}\\times\\vec{A}$ o si olvidaste el signo de la componente $\\hat{\\jmath}$.',
      cfg: { start: { A: A, B: B } }
    },

    formulas: [
      { label: 'Unitario', tex: '\\hat{A} = \\vec{A}/|\\vec{A}|' },
      { label: 'Escalar', tex: '\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z' },
      { label: 'Escalar y ángulo', tex: '\\vec{A}\\cdot\\vec{B} = AB\\cos\\theta' },
      { label: 'Proyección de A sobre B', tex: 'A_B = \\frac{\\vec{A}\\cdot\\vec{B}}{B}' },
      { label: 'Vectorial (magnitud)', tex: '|\\vec{A}\\times\\vec{B}| = AB\\sin\\theta' },
      { label: 'Vectorial (componentes)', tex: '(A_yB_z - A_zB_y,\\ A_zB_x - A_xB_z,\\ A_xB_y - A_yB_x)' }
    ],

    exercises: [
      {
        id: 'f1-s03-escalar', title: 'Producto escalar',
        vars: { ax: [-5, 5, 1], ay: [-5, 5, 1], az: [-5, 5, 1], bx: [-5, 5, 1], by: [-5, 5, 1], bz: [-5, 5, 1] },
        prompt: function (v) { return '<p>Calcula $\\vec{A}\\cdot\\vec{B}$ con $\\vec{A} = (' + v.ax + ',\\ ' + v.ay + ',\\ ' + v.az + ')$ y $\\vec{B} = (' + v.bx + ',\\ ' + v.by + ',\\ ' + v.bz + ')$.</p>'; },
        check: 'numeric', tol: { abs: 0.01 },
        answer: function (v) { return v.ax * v.bx + v.ay * v.by + v.az * v.bz; },
        baseWhere: function (v) { return v.ax * v.bx + v.ay * v.by + v.az * v.bz !== 0 && v.ax * v.ay * v.az * v.bx * v.by * v.bz !== 0; },
        mistakes: { magsProduct: function (v) { return Math.hypot(v.ax, v.ay, v.az) * Math.hypot(v.bx, v.by, v.bz); } },
        feedback: [{ when: 'magsProduct', say: 'Multiplicaste las magnitudes: eso sería $AB$, sin el $\\cos\\theta$. Multiplica componente con componente.' }],
        oracle: { lab: 'call', mod: 'vec3', fn: 'dot', args: function (v) { return [[v.ax, v.ay, v.az], [v.bx, v.by, v.bz]]; } },
        hint: '$A_xB_x + A_yB_y + A_zB_z$. Cuida los signos.',
        solution: function (v) { return '$$(' + v.ax + ')(' + v.bx + ') + (' + v.ay + ')(' + v.by + ') + (' + v.az + ')(' + v.bz + ') = ' + (v.ax * v.bx + v.ay * v.by + v.az * v.bz) + '$$'; }
      },
      {
        id: 'f1-s03-angulo', title: 'Ángulo entre dos vectores',
        vars: { ax: [-6, 6, 1], ay: [-6, 6, 1], bx: [-6, 6, 1], by: [-6, 6, 1] },
        prompt: function (v) { return '<p>¿Qué ángulo forman $\\vec{A} = (' + v.ax + ',\\ ' + v.ay + ')$ y $\\vec{B} = (' + v.bx + ',\\ ' + v.by + ')$? (Entre $0^\\circ$ y $180^\\circ$).</p>'; },
        check: 'numeric', unit: '°', tol: { abs: 0.5 },
        answer: function (v) { return Math.acos((v.ax * v.bx + v.ay * v.by) / (Math.hypot(v.ax, v.ay) * Math.hypot(v.bx, v.by))) * DEG; },
        baseWhere: function (v) {
          var ma = Math.hypot(v.ax, v.ay), mb = Math.hypot(v.bx, v.by);
          if (ma < 1 || mb < 1) return false;
          var c = (v.ax * v.bx + v.ay * v.by) / (ma * mb);
          return Math.abs(c) < 0.97;
        },
        mistakes: { radians: function (v) { return Math.acos((v.ax * v.bx + v.ay * v.by) / (Math.hypot(v.ax, v.ay) * Math.hypot(v.bx, v.by))); } },
        feedback: [{ when: 'radians', say: 'Ese ángulo está en radianes. Pon la calculadora en grados (o multiplica por $180/\\pi$).' }],
        oracle: { lab: 'call', mod: 'vec3', fn: 'angle', args: function (v) { return [[v.ax, v.ay, 0], [v.bx, v.by, 0]]; } },
        hint: 'Calcula el producto escalar y las dos magnitudes; luego $\\theta = \\arccos\\frac{\\vec{A}\\cdot\\vec{B}}{AB}$.',
        solution: function (v) {
          var d = v.ax * v.bx + v.ay * v.by, ma = Math.hypot(v.ax, v.ay), mb = Math.hypot(v.bx, v.by);
          return '$$\\cos\\theta = \\frac{' + d + '}{(' + fx(ma, 3) + ')(' + fx(mb, 3) + ')} = ' + fx(d / (ma * mb), 4) + ' \\;\\Rightarrow\\; \\theta = ' + fx(Math.acos(d / (ma * mb)) * DEG, 2) + '^\\circ$$';
        }
      },
      {
        id: 'f1-s03-cruz-z', title: 'Producto vectorial en el plano',
        vars: { ax: [-6, 6, 1], ay: [-6, 6, 1], bx: [-6, 6, 1], by: [-6, 6, 1] },
        prompt: function (v) { return '<p>Con $\\vec{A} = (' + v.ax + ',\\ ' + v.ay + ',\\ 0)$ y $\\vec{B} = (' + v.bx + ',\\ ' + v.by + ',\\ 0)$, ¿cuánto vale la componente $z$ de $\\vec{A}\\times\\vec{B}$?</p>'; },
        check: 'numeric', tol: { abs: 0.01 },
        answer: function (v) { return v.ax * v.by - v.ay * v.bx; },
        baseWhere: function (v) { return Math.abs(v.ax * v.by - v.ay * v.bx) >= 2; },
        mistakes: { reversed: function (v) { return v.ay * v.bx - v.ax * v.by; } },
        feedback: [{ when: 'reversed', say: 'Te salió con el signo contrario: calculaste $\\vec{B}\\times\\vec{A}$. Es $A_xB_y - A_yB_x$.' }],
        oracle: { lab: 'call', mod: 'vec3', fn: 'cross', field: '2', args: function (v) { return [[v.ax, v.ay, 0], [v.bx, v.by, 0]]; } },
        hint: 'Con $z = 0$ en los dos, solo sobrevive el término de $\\hat{k}$: $A_xB_y - A_yB_x$.',
        solution: function (v) { return '$$(\\vec{A}\\times\\vec{B})_z = (' + v.ax + ')(' + v.by + ') - (' + v.ay + ')(' + v.bx + ') = ' + (v.ax * v.by - v.ay * v.bx) + '$$'; }
      },
      {
        id: 'f1-s03-area', title: 'Área de un paralelogramo',
        vars: { A: [2, 12, 1], B: [2, 12, 1], th: [20, 160, 10] },
        prompt: function (v) { return '<p>Dos lados de una placa miden $' + v.A + '$ cm y $' + v.B + '$ cm y forman $' + v.th + '^\\circ$. ¿Cuál es el área del paralelogramo, $|\\vec{A}\\times\\vec{B}|$?</p>'; },
        check: 'numeric', unit: 'cm²',
        answer: function (v) { return v.A * v.B * Math.sin(v.th * RAD); },
        baseWhere: function (v) { return v.th !== 90; },
        mistakes: { usedCos: function (v) { return Math.abs(v.A * v.B * Math.cos(v.th * RAD)); } },
        feedback: [{ when: 'usedCos', say: 'Usaste el coseno: eso sería el producto escalar. El área lleva $\\sin\\theta$.' }],
        oracle: { lab: 'call', mod: 'vec3', fn: 'area', args: function (v) { return [[v.A, 0, 0], [v.B * Math.cos(v.th * RAD), v.B * Math.sin(v.th * RAD), 0]]; } },
        hint: '$|\\vec{A}\\times\\vec{B}| = AB\\sin\\theta$.',
        solution: function (v) { return '$$|\\vec{A}\\times\\vec{B}| = (' + v.A + ')(' + v.B + ')\\sin ' + v.th + '^\\circ = ' + fx(v.A * v.B * Math.sin(v.th * RAD), 3) + '\\ \\text{cm}^2$$'; }
      },
      {
        id: 'f1-s03-unitario', title: 'Componente de un vector unitario',
        vars: { a: [1, 9, 1], b: [1, 9, 1], c: [1, 9, 1] },
        prompt: function (v) { return '<p>¿Cuánto vale la componente $x$ del vector unitario en la dirección de $\\vec{A} = (' + v.a + ',\\ ' + v.b + ',\\ ' + v.c + ')$?</p>'; },
        check: 'numeric', tol: { abs: 0.002 },
        answer: function (v) { return v.a / Math.hypot(v.a, v.b, v.c); },
        baseWhere: function (v) { return !(v.a === v.b && v.b === v.c); },
        mistakes: { sumNorm: function (v) { return v.a / (v.a + v.b + v.c); } },
        feedback: [{ when: 'sumNorm', say: 'Dividiste entre la suma de componentes. Hay que dividir entre la magnitud $\\sqrt{A_x^2 + A_y^2 + A_z^2}$.' }],
        oracle: { lab: 'call', mod: 'vec3', fn: 'unit', field: '0', args: function (v) { return [[v.a, v.b, v.c]]; } },
        hint: '$\\hat{A} = \\vec{A}/|\\vec{A}|$: primero calcula $|\\vec{A}|$.',
        solution: function (v) { var m = Math.hypot(v.a, v.b, v.c); return '$$|\\vec{A}| = \\sqrt{' + v.a + '^2 + ' + v.b + '^2 + ' + v.c + '^2} = ' + fx(m, 4) + ' \\qquad \\hat{A}_x = \\frac{' + v.a + '}{' + fx(m, 4) + '} = ' + fx(v.a / m, 4) + '$$'; }
      },
      {
        id: 'f1-s03-perpendicular', title: 'Concepto: ¿perpendiculares?',
        vars: { k: [1, 4, 1] },
        prompt: function (v) { return '<p>¿Qué dice $\\vec{A}\\cdot\\vec{B} = 0$ si $\\vec{A} = (' + v.k + ',\\ 2,\\ 0)$ y $\\vec{B} = (-2,\\ ' + v.k + ',\\ 5)$?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Son perpendiculares', correct: true },
            { text: 'Son paralelos', say: 'Si fueran paralelos, $|\\vec{A}\\cdot\\vec{B}| = AB$, no cero.' },
            { text: 'Uno de los dos es el vector cero', say: 'Ninguno es cero; el producto se anula por el $\\cos 90^\\circ$.' },
            { text: 'Su producto vectorial también es cero', say: 'Al contrario: siendo perpendiculares, $|\\vec{A}\\times\\vec{B}| = AB$ es máximo.' }
          ];
        },
        answer: function () { return 'Son perpendiculares'; },
        hint: 'Calcula el producto: $A_xB_x + A_yB_y + A_zB_z$.',
        solution: function (v) { return '$(' + v.k + ')(-2) + (2)(' + v.k + ') + (0)(5) = 0$: como $AB\\cos\\theta = 0$ con $A, B \\ne 0$, $\\theta = 90^\\circ$.'; }
      }
    ],

    quiz: { tags: ['f1.S03'], count: 8 },

    errors: [
      'Olvidar el signo menos de la componente $\\hat{\\jmath}$ en el determinante.',
      'Calcular $\\vec{B}\\times\\vec{A}$ cuando se pide $\\vec{A}\\times\\vec{B}$: sale con el signo contrario.',
      'Pensar que el producto escalar da un vector o que el vectorial da un número.',
      'Despejar el ángulo sin dividir entre las dos magnitudes.',
      'Normalizar dividiendo entre la suma de componentes en lugar de la magnitud.'
    ],

    teacher: {
      plan: [
        'Vector unitario con el ejemplo (3, 4, 12) → 13.',
        'Producto escalar como sombra: explainer y el ejemplo del trabajo.',
        'Producto vectorial con la mano derecha antes del determinante; el lab trae cargado el error de B×A.'
      ],
      check: [
        'Que comprueben $\\vec{A}\\times\\vec{B}$ haciendo su producto escalar con $\\vec{A}$ y con $\\vec{B}$ (debe dar cero).',
        'Que revisen el signo del producto escalar contra el ángulo que se ve en el dibujo.'
      ],
      note: 'El producto escalar vuelve en S12 (trabajo) y el vectorial en S15 (torque).'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 1</em>, §2.2 “Coordinate Systems and Components of a Vector”. <a href="https://openstax.org/books/university-physics-volume-1/pages/2-2-coordinate-systems-and-components-of-a-vector">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §2.4 “Products of Vectors”. <a href="https://openstax.org/books/university-physics-volume-1/pages/2-4-products-of-vectors">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-02',
    next: 'sesion-04'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
