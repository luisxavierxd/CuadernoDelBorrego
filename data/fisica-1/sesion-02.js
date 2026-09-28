/* =====================================================================
   Física 1 · S02 · Vectores: componentes y suma (bloque A · Herramientas).
   Fuente: OpenStax, University Physics Volume 1, §2.1–2.3 (CC BY-NC-SA 4.0).
   Ángulos en grados, desde +x en sentido antihorario. Las cuentas se
   comprueban contra LabMath.vectors (lab vector-sum).
   ===================================================================== */
(function () {
  var RAD = Math.PI / 180, DEG = 180 / Math.PI;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function norm360(a) { a = a % 360; return a < 0 ? a + 360 : a; }
  function sumOf(list, signs) {
    var x = 0, y = 0;
    list.forEach(function (p, i) { var s = signs ? signs[i] : 1; x += s * p[0] * Math.cos(p[1] * RAD); y += s * p[0] * Math.sin(p[1] * RAD); });
    return { x: x, y: y, mag: Math.sqrt(x * x + y * y), ang: norm360(Math.atan2(y, x) * DEG) };
  }

  // Ejemplo 1: robot con dos tramos
  var e1 = sumOf([[4, 20], [6, 110]]);
  // Ejemplo 2: vector en el segundo cuadrante
  var e2 = { x: -4, y: 3 };
  e2.mag = Math.sqrt(e2.x * e2.x + e2.y * e2.y); e2.raw = Math.atan(e2.y / e2.x) * DEG; e2.ang = e2.raw + 180;
  // Ejemplo 3: cambio de velocidad
  var e3 = sumOf([[10, 90], [10, 0]], [1, -1]);

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
    slug: 'sesion-02', number: '02', group: 'A · Herramientas',
    title: 'Vectores: componentes y suma', temario: [],
    minutes: 150,
    quote: 'Un vector no se suma con otro por su tamaño: se suma componente por componente.',
    badges: [
      'Distinguir escalares de vectores.',
      'Descomponer un vector en $x$ y $y$ y reconstruirlo.',
      'Sumar y restar vectores con el método gráfico y por componentes.',
      'Dar la dirección correcta en cualquier cuadrante.'
    ],

    lesson: [
      {
        "type": "warmup",
        "heading": "Antes de empezar",
        "short": "Antes de empezar",
        "idea": "Un <strong>vector</strong> tiene tamaño y dirección; para sumarlos se descomponen en dos partes: una horizontal y una vertical.",
        "recall": [
          "Seno, coseno y tangente en un triángulo rectángulo.",
          "Pitágoras: $c = \\sqrt{a^2 + b^2}$.",
          "Usar la calculadora en grados."
        ],
        "why": "Fuerzas, velocidades y desplazamientos son vectores. No se suman como números: 3 N hacia el este más 4 N hacia el norte dan 5 N, no 7 N."
      },
      {
        "type": "concept",
        "heading": "Imagínalo así",
        "short": "Imagínalo así",
        "body": [
          "Imagina que caminas 3 cuadras al este y luego 4 al norte. Terminaste a 5 cuadras (en línea recta) de donde empezaste, aunque caminaste 7. Sumar vectores es encontrar ese \"desplazamiento neto\".",
          "Para sumar vectores con cualquier ángulo, se descompone cada uno en cuánto avanza en $x$ (su componente horizontal) y cuánto en $y$. Las componentes sí se suman como números normales, porque todas apuntan en la misma dirección.",
          "Al final, con las componentes totales, Pitágoras da el tamaño y el arcotangente da la dirección."
        ]
      },
      {
        type: 'concept', heading: 'Escalares y vectores', short: 'Escalares y vectores',
        body: [
          'Un <strong>escalar</strong> queda dicho con un número y su unidad: la masa, el tiempo, la temperatura, la rapidez o la distancia recorrida.',
          'Un <strong>vector</strong> necesita además una <strong>dirección</strong>: el desplazamiento, la velocidad, la aceleración o la fuerza. "Camina 5 m" no basta para saber dónde terminas; "camina 5 m hacia el norte" sí.',
          'Se escribe con flecha, $\\vec{A}$, y su tamaño (magnitud) como $|\\vec{A}|$ o simplemente $A$. En este curso la dirección se da con un ángulo $\\theta$ medido desde el eje $+x$ en sentido antihorario.'
        ]
      },
      {
        type: 'concept', heading: 'Componentes rectangulares', short: 'Componentes',
        body: [
          'Todo vector del plano es la suma de uno horizontal y uno vertical, sus <strong>componentes</strong>: $$A_x = A\\cos\\theta \\qquad A_y = A\\sin\\theta$$',
          'Con los vectores unitarios $\\hat{\\imath}$ y $\\hat{\\jmath}$ (tamaño 1 en $x$ y en $y$) se escribe $\\vec{A} = A_x\\,\\hat{\\imath} + A_y\\,\\hat{\\jmath}$.',
          'De regreso: $A = \\sqrt{A_x^2 + A_y^2}$ y $\\tan\\theta = A_y / A_x$. Las componentes pueden ser negativas: su signo dice hacia dónde apuntan.'
        ],
        diagram: 'vector-components',
        caption: 'El vector es la hipotenusa; sus componentes, los catetos. El coseno va con el cateto pegado al ángulo.'
      },
      {
        type: 'concept', heading: 'Cuidado con el arco tangente', short: 'Cuadrantes',
        body: [
          'La calculadora da $\\arctan(A_y/A_x)$ solo entre $-90^\\circ$ y $90^\\circ$, es decir, siempre como si $A_x$ fuera positiva.',
          'Si $A_x < 0$, el vector está en el 2.º o 3.er cuadrante y hay que <strong>sumar $180^\\circ$</strong>. Dibuja siempre el vector antes de dar su ángulo.'
        ],
        diagram: 'vector-quadrants',
        caption: '$\\arctan(3/{-4}) = -36.9^\\circ$ apunta al lado contrario; el ángulo real es $143.1^\\circ$.'
      },
      {
        type: 'explainer', heading: 'Sumar cabeza con cola', short: 'Suma de vectores',
        title: 'Del dibujo a las componentes',
        intro: 'El método gráfico muestra qué significa sumar; las componentes dan el número exacto.',
        diagram: 'vector-sum-explainer',
        steps: [
          { text: 'Dos vectores $\\vec{A}$ y $\\vec{B}$ que salen del origen.', state: { step: 0 } },
          { text: 'Traslada $\\vec{B}$ sin girarlo hasta que su cola quede en la cabeza (la punta) de $\\vec{A}$.', state: { step: 1 } },
          { text: 'La resultante $\\vec{R} = \\vec{A} + \\vec{B}$ va de la cola de $\\vec{A}$ a la cabeza de $\\vec{B}$.', state: { step: 2 } },
          { text: 'Por componentes: $R_x = A_x + B_x$ y $R_y = A_y + B_y$. Luego $R = \\sqrt{R_x^2 + R_y^2}$ y el ángulo con cuidado del cuadrante.', state: { step: 3 } }
        ]
      },
      {
        "type": "recipe",
        "heading": "Receta: sumar vectores por componentes",
        "short": "Receta",
        "steps": [
          {
            "text": "Para cada vector, calcula $A_x = A\\cos\\theta$ y $A_y = A\\sin\\theta$, con $\\theta$ medido desde el eje $+x$ en sentido contrario a las manecillas.",
            "tip": "Si el ángulo te lo dan desde otro eje o hacia otra dirección, ajústalo primero o pon los signos a mano."
          },
          {
            "text": "Suma todas las componentes $x$ y, aparte, todas las $y$."
          },
          {
            "text": "Tamaño de la resultante: $R = \\sqrt{R_x^2 + R_y^2}$."
          },
          {
            "text": "Dirección: $\\theta = \\arctan\\dfrac{R_y}{R_x}$, y revisa el cuadrante.",
            "tip": "Si $R_x < 0$, suma $180^\\circ$ al resultado de la calculadora."
          }
        ]
      },
      {
        type: 'example', heading: 'Un robot en dos tramos',
        problem: '<p>Un robot avanza $4.0\\ \\text{m}$ a $20^\\circ$ y luego $6.0\\ \\text{m}$ a $110^\\circ$. ¿A qué distancia y en qué dirección quedó de su punto de partida?</p>',
        steps: [
          { text: 'Componentes del primer tramo.', math: 'A_x = 4\\cos 20^\\circ = ' + fx(4 * Math.cos(20 * RAD), 3) + ' \\qquad A_y = 4\\sin 20^\\circ = ' + fx(4 * Math.sin(20 * RAD), 3) },
          { text: 'Componentes del segundo tramo (el coseno sale negativo: apunta a la izquierda).', math: 'B_x = 6\\cos 110^\\circ = ' + fx(6 * Math.cos(110 * RAD), 3) + ' \\qquad B_y = 6\\sin 110^\\circ = ' + fx(6 * Math.sin(110 * RAD), 3) },
          { text: 'Suma por componentes.', math: 'R_x = ' + fx(e1.x, 3) + '\\ \\text{m} \\qquad R_y = ' + fx(e1.y, 3) + '\\ \\text{m}' },
          { text: 'Magnitud y dirección. $R_x > 0$ y $R_y > 0$: está en el primer cuadrante y el arco tangente sirve directo.', math: 'R = \\sqrt{' + fx(e1.x, 3) + '^2 + ' + fx(e1.y, 3) + '^2} = ' + fx(e1.mag, 3) + '\\ \\text{m} \\qquad \\theta = \\arctan\\frac{' + fx(e1.y, 3) + '}{' + fx(e1.x, 3) + '} = ' + fx(e1.ang, 1) + '^\\circ' },
          { text: 'Comprobación: los tramos forman $90^\\circ$ entre sí, así que $R = \\sqrt{4^2 + 6^2} = 7.21$ m. Sumar $4 + 6 = 10$ m sería un error.' }
        ],
        answer: 'Quedó a $' + fx(e1.mag, 2) + '\\ \\text{m}$ en la dirección $' + fx(e1.ang, 1) + '^\\circ$.',
        verify: { lab: 'call', mod: 'vectors', fn: 'sum', args: [[[4, 20], [6, 110]]], values: { x: e1.x, y: e1.y, mag: e1.mag, ang: e1.ang } }
      },
      {
        type: 'example', heading: 'Un vector del segundo cuadrante',
        problem: '<p>Escribe $\\vec{A} = -4.0\\,\\hat{\\imath} + 3.0\\,\\hat{\\jmath}$ en forma de magnitud y ángulo.</p>',
        steps: [
          { text: 'Magnitud con Pitágoras.', math: 'A = \\sqrt{(-4)^2 + 3^2} = ' + fx(e2.mag) },
          { text: 'La calculadora da un ángulo del 4.º cuadrante.', math: '\\arctan\\frac{3}{-4} = ' + fx(e2.raw, 2) + '^\\circ' },
          { text: '$A_x < 0$ y $A_y > 0$: el vector está en el 2.º cuadrante. Suma $180^\\circ$.', math: '\\theta = ' + fx(e2.raw, 2) + '^\\circ + 180^\\circ = ' + fx(e2.ang, 2) + '^\\circ' }
        ],
        answer: '$A = 5$ con $\\theta = ' + fx(e2.ang, 2) + '^\\circ$.',
        verify: { lab: 'call', mod: 'vectors', fn: 'polar', args: [-4, 3], values: { mag: e2.mag, ang: e2.ang } }
      },
      {
        type: 'callout', heading: 'Restar es sumar el opuesto',
        body: [
          '$-\\vec{B}$ tiene la misma magnitud que $\\vec{B}$ y apunta al lado contrario (su ángulo es $\\theta + 180^\\circ$).',
          'Por eso $\\vec{A} - \\vec{B} = \\vec{A} + (-\\vec{B})$: por componentes, $A_x - B_x$ y $A_y - B_y$.'
        ]
      },
      {
        type: 'example', heading: 'El cambio de velocidad',
        problem: '<p>Un carrito va a $10\\ \\text{m/s}$ hacia el este y, después de dar vuelta, a $10\\ \\text{m/s}$ hacia el norte. ¿Cuánto vale el cambio de velocidad $\\Delta\\vec{v} = \\vec{v}_2 - \\vec{v}_1$?</p>',
        steps: [
          { text: 'Con el este en $+x$ y el norte en $+y$: $\\vec{v}_1 = 10\\,\\hat{\\imath}$ y $\\vec{v}_2 = 10\\,\\hat{\\jmath}$.', math: '\\Delta\\vec{v} = 10\\,\\hat{\\jmath} - 10\\,\\hat{\\imath} = (-10,\\ 10)\\ \\text{m/s}' },
          { text: 'Magnitud y dirección (2.º cuadrante).', math: '|\\Delta\\vec{v}| = \\sqrt{10^2 + 10^2} = ' + fx(e3.mag) + '\\ \\text{m/s} \\qquad \\theta = ' + fx(e3.ang, 1) + '^\\circ' },
          { text: 'La rapidez no cambió, pero la velocidad sí: cambió su dirección. Esto será clave en el movimiento circular (S07).' }
        ],
        answer: '$|\\Delta\\vec{v}| \\approx ' + fx(e3.mag) + '\\ \\text{m/s}$ hacia el noroeste ($' + fx(e3.ang, 1) + '^\\circ$).',
        verify: { lab: 'call', mod: 'vectors', fn: 'sum', args: [[[10, 90], [10, 0]], [1, -1]], values: { x: e3.x, y: e3.y, mag: e3.mag, ang: e3.ang } }
      },
      {
        "type": "faq",
        "heading": "Dudas comunes",
        "short": "Dudas comunes",
        "items": [
          {
            "q": "¿Por qué hay que revisar el cuadrante?",
            "a": "Porque el arcotangente de la calculadora solo da ángulos entre $-90^\\circ$ y $90^\\circ$. Un vector que apunta a la izquierda necesita $180^\\circ$ más."
          },
          {
            "q": "¿Qué es un escalar?",
            "a": "Una cantidad que solo tiene tamaño: masa, temperatura, tiempo, rapidez. Se suman como números normales."
          },
          {
            "q": "¿Cómo resto vectores?",
            "a": "Sumando el opuesto: $\\vec A - \\vec B = \\vec A + (-\\vec B)$, donde $-\\vec B$ tiene las componentes de $\\vec B$ con signo cambiado."
          }
        ]
      },
      {
        "type": "recap",
        "heading": "Lo que te llevas",
        "short": "Resumen",
        "points": [
          "Vector = tamaño + dirección.",
          "Componentes: $A\\cos\\theta$ y $A\\sin\\theta$.",
          "Suma las $x$ con las $x$ y las $y$ con las $y$.",
          "Pitágoras para el tamaño; arcotangente (revisando cuadrante) para la dirección."
        ]
      }
    ],

    lab: {
      type: 'vector-sum', title: 'Suma dos vectores',
      intro: 'Mueve las magnitudes y los ángulos, calcula a mano $|\\vec{R}|$ y su dirección y compáralos con la suma real. El lab detecta si sumaste magnitudes, si te faltó corregir el cuadrante o si intercambiaste seno y coseno.',
      cfg: { start: { A: [3, 60], B: [5, 160], op: 0 } }
    },

    formulas: [
      { label: 'Componentes', tex: 'A_x = A\\cos\\theta,\\ \\ A_y = A\\sin\\theta' },
      { label: 'Magnitud', tex: 'A = \\sqrt{A_x^2 + A_y^2}' },
      { label: 'Dirección*', tex: '\\theta = \\arctan\\frac{A_y}{A_x}\\ (+180^\\circ\\ \\text{si}\\ A_x < 0)' },
      { label: 'Suma', tex: 'R_x = A_x + B_x,\\ \\ R_y = A_y + B_y' },
      { label: 'Resta', tex: '\\vec{A} - \\vec{B} = \\vec{A} + (-\\vec{B})' },
      { label: '*Ángulo desde +x, antihorario', tex: '\\vec{A} = A_x\\,\\hat{\\imath} + A_y\\,\\hat{\\jmath}' }
    ],

    exercises: [
      {
        id: 'f1-s02-componente', title: 'Componente horizontal',
        vars: { A: [5, 40, 1], th: [10, 80, 5] },
        prompt: function (v) { return '<p>Una fuerza de $' + v.A + '\\ \\text{N}$ apunta a $' + v.th + '^\\circ$ sobre la horizontal. ¿Cuánto vale su componente $x$?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return v.A * Math.cos(v.th * RAD); },
        mistakes: { usedSin: function (v) { return v.A * Math.sin(v.th * RAD); } },
        feedback: [{ when: 'usedSin', say: 'Usaste el seno. Con el ángulo medido desde la horizontal, $A_x = A\\cos\\theta$.' }],
        oracle: { lab: 'call', mod: 'vectors', fn: 'comps', field: 'x', args: function (v) { return [v.A, v.th]; } },
        hint: 'El cateto pegado al ángulo es el horizontal: lleva coseno.',
        solution: function (v) { return '$$A_x = ' + v.A + '\\cos ' + v.th + '^\\circ = ' + fx(v.A * Math.cos(v.th * RAD), 3) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f1-s02-magnitud', title: 'Magnitud desde componentes',
        vars: { ax: [-12, 12, 1], ay: [-12, 12, 1] },
        prompt: function (v) { return '<p>Un desplazamiento es $\\vec{d} = (' + v.ax + ')\\,\\hat{\\imath} + (' + v.ay + ')\\,\\hat{\\jmath}$ m. ¿Cuánto mide?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return Math.hypot(v.ax, v.ay); },
        baseWhere: function (v) { return v.ax !== 0 && v.ay !== 0; },
        mistakes: { sumAbs: function (v) { return Math.abs(v.ax) + Math.abs(v.ay); } },
        feedback: [{ when: 'sumAbs', say: 'Sumaste las componentes. Son los catetos de un triángulo rectángulo: usa Pitágoras.' }],
        oracle: { lab: 'call', mod: 'vectors', fn: 'polar', field: 'mag', args: function (v) { return [v.ax, v.ay]; } },
        hint: '$d = \\sqrt{d_x^2 + d_y^2}$; el signo no importa al elevar al cuadrado.',
        solution: function (v) { return '$$d = \\sqrt{(' + v.ax + ')^2 + (' + v.ay + ')^2} = ' + fx(Math.hypot(v.ax, v.ay), 3) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s02-angulo', title: 'Dirección con Ax negativa',
        vars: { ax: [-12, -1, 1], ay: [-12, 12, 1] },
        prompt: function (v) { return '<p>¿Qué ángulo forma $\\vec{A} = (' + v.ax + ',\\ ' + v.ay + ')$ con el eje $+x$? Da un ángulo entre $0^\\circ$ y $360^\\circ$, en sentido antihorario.</p>'; },
        check: 'numeric', unit: '°', tol: { abs: 0.5 },
        answer: function (v) { return norm360(Math.atan2(v.ay, v.ax) * DEG); },
        baseWhere: function (v) { return v.ay !== 0; },
        mistakes: { rawArctan: function (v) { return Math.atan(v.ay / v.ax) * DEG; } },
        feedback: [{ when: 'rawArctan', say: 'Ese es el ángulo de la calculadora. Como $A_x < 0$, el vector está del lado izquierdo: suma $180^\\circ$.' }],
        oracle: { lab: 'call', mod: 'vectors', fn: 'polar', field: 'ang', args: function (v) { return [v.ax, v.ay]; } },
        hint: 'Dibuja el vector: ¿en qué cuadrante está? $\\arctan$ solo da ángulos entre $-90^\\circ$ y $90^\\circ$.',
        solution: function (v) {
          var raw = Math.atan(v.ay / v.ax) * DEG;
          return '$$\\arctan\\frac{' + v.ay + '}{' + v.ax + '} = ' + fx(raw, 2) + '^\\circ \\;\\Rightarrow\\; \\theta = ' + fx(raw, 2) + '^\\circ + 180^\\circ = ' + fx(norm360(raw + 180), 2) + '^\\circ$$';
        }
      },
      {
        id: 'f1-s02-suma', title: 'Magnitud de una suma',
        vars: { A: [2, 10, 1], a: [0, 80, 10], B: [2, 10, 1], b: [100, 250, 10] },
        prompt: function (v) { return '<p>$\\vec{A}$ mide $' + v.A + '$ a $' + v.a + '^\\circ$ y $\\vec{B}$ mide $' + v.B + '$ a $' + v.b + '^\\circ$. ¿Cuánto mide $\\vec{A} + \\vec{B}$?</p>'; },
        check: 'numeric',
        answer: function (v) { return sumOf([[v.A, v.a], [v.B, v.b]]).mag; },
        baseWhere: function (v) { return sumOf([[v.A, v.a], [v.B, v.b]]).mag > 0.5; },
        mistakes: { addedMagnitudes: function (v) { return v.A + v.B; } },
        feedback: [{ when: 'addedMagnitudes', say: 'Sumaste las magnitudes. Solo vale si apuntan al mismo lado: suma componentes.' }],
        oracle: { lab: 'call', mod: 'vectors', fn: 'sum', field: 'mag', args: function (v) { return [[[v.A, v.a], [v.B, v.b]]]; } },
        hint: 'Descompón los dos, suma $x$ con $x$ y $y$ con $y$, y luego Pitágoras.',
        solution: function (v) {
          var r = sumOf([[v.A, v.a], [v.B, v.b]]);
          return '$$R_x = ' + v.A + '\\cos ' + v.a + '^\\circ + ' + v.B + '\\cos ' + v.b + '^\\circ = ' + fx(r.x, 3) + ' \\qquad R_y = ' + v.A + '\\sin ' + v.a + '^\\circ + ' + v.B + '\\sin ' + v.b + '^\\circ = ' + fx(r.y, 3) + '$$$$R = \\sqrt{R_x^2 + R_y^2} = ' + fx(r.mag, 3) + '$$';
        }
      },
      {
        id: 'f1-s02-resta', title: 'Cambio de velocidad',
        vars: { v1: [4, 20, 1], v2: [4, 20, 1] },
        prompt: function (v) { return '<p>Un dron vuela a $' + v.v1 + '\\ \\text{m/s}$ hacia el este y luego a $' + v.v2 + '\\ \\text{m/s}$ hacia el norte. ¿Cuánto mide su cambio de velocidad $\\vec{v}_2 - \\vec{v}_1$?</p>'; },
        check: 'numeric', unit: 'm/s',
        answer: function (v) { return Math.hypot(v.v1, v.v2); },
        mistakes: { magDiff: function (v) { return Math.abs(v.v2 - v.v1); } },
        feedback: [{ when: 'magDiff', say: 'Restaste las rapideces. La dirección también cambió: $\\Delta\\vec{v} = (-v_1,\\ v_2)$.' }],
        oracle: { lab: 'call', mod: 'vectors', fn: 'sum', field: 'mag', args: function (v) { return [[[v.v2, 90], [v.v1, 0]], [1, -1]]; } },
        hint: 'Con el este en $+x$: $\\vec{v}_1 = (' + 'v_1, 0)$ y $\\vec{v}_2 = (0, v_2)$.',
        solution: function (v) { return '$$\\Delta\\vec{v} = (0,\\ ' + v.v2 + ') - (' + v.v1 + ',\\ 0) = (-' + v.v1 + ',\\ ' + v.v2 + ') \\;\\Rightarrow\\; |\\Delta\\vec{v}| = ' + fx(Math.hypot(v.v1, v.v2), 3) + '\\ \\text{m/s}$$'; }
      },
      {
        id: 'f1-s02-concepto', title: 'Concepto: ¿cuándo se suman las magnitudes?',
        vars: {},
        prompt: function () { return '<p>¿En qué caso se cumple $|\\vec{A} + \\vec{B}| = |\\vec{A}| + |\\vec{B}|$?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Cuando $\\vec{A}$ y $\\vec{B}$ apuntan en la misma dirección', correct: true },
            { text: 'Siempre', say: 'Si forman un ángulo, la resultante es el tercer lado de un triángulo y es más corta.' },
            { text: 'Cuando son perpendiculares', say: 'Entonces $|\\vec{A} + \\vec{B}| = \\sqrt{A^2 + B^2}$, que es menor que $A + B$.' },
            { text: 'Cuando apuntan en direcciones opuestas', say: 'Entonces se restan: $|A - B|$.' }
          ];
        },
        answer: function () { return 'Cuando $\\vec{A}$ y $\\vec{B}$ apuntan en la misma dirección'; },
        hint: 'Dibuja la suma cabeza con cola para varios ángulos.',
        solution: function () { return 'Cabeza con cola, $\\vec{A}$, $\\vec{B}$ y $\\vec{R}$ forman un triángulo; el lado $R$ solo es igual a $A + B$ si el triángulo se aplana, es decir, si apuntan igual.'; }
      }
    ],

    quiz: { tags: ['f1.S02'], count: 8 },

    errors: [
      'Sumar magnitudes en lugar de vectores: $|\\vec{A} + \\vec{B}| \\ne A + B$ salvo que apunten igual.',
      'Usar $\\arctan(A_y/A_x)$ sin revisar el cuadrante.',
      'Intercambiar seno y coseno cuando el ángulo se mide desde el eje $y$ o desde otra referencia.',
      'Olvidar el signo negativo de una componente que apunta a la izquierda o hacia abajo.',
      'Tener la calculadora en radianes.'
    ],

    teacher: {
      plan: [
        'Escalares contra vectores con ejemplos cotidianos (rapidez contra velocidad).',
        'Componentes con el triángulo; luego el explainer de cabeza con cola.',
        'Ejemplos 1–3 y el lab con el error de sumar magnitudes que ya trae cargado.'
      ],
      check: [
        'Que dibujen el vector antes de calcular su ángulo.',
        'Que escriban una tabla de componentes $x$ y $y$ por vector antes de sumar.'
      ],
      note: 'Los ángulos siempre se miden desde +x en sentido antihorario; si un problema da el ángulo desde otra referencia, hay que traducirlo primero.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 1</em>, §2.1 “Scalars and Vectors”. <a href="https://openstax.org/books/university-physics-volume-1/pages/2-1-scalars-and-vectors">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §2.2 “Coordinate Systems and Components of a Vector”. <a href="https://openstax.org/books/university-physics-volume-1/pages/2-2-coordinate-systems-and-components-of-a-vector">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §2.3 “Algebra of Vectors”. <a href="https://openstax.org/books/university-physics-volume-1/pages/2-3-algebra-of-vectors">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-01',
    next: 'sesion-03'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
