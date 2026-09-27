/* =====================================================================
   Cálculo 1 · S08 · Problemas de optimización (bloque B · tema 4.2).
   Fuente: OpenStax, Calculus Volume 1, §4.7 (CC BY 4.0).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 4 : d)).toString(); }
  var rLata = Math.cbrt(355 / (2 * Math.PI));

  window.SESSION_DATA = {
    slug: 'sesion-08', number: '08', group: 'B · Optimización',
    title: 'Problemas de optimización', temario: ['4.2'],
    minutes: 200,
    quote: 'Optimizar es traducir un problema a una función y buscar dónde su tangente se queda plana.',
    badges: [
      'Traducir un enunciado a una función objetivo de una sola variable.',
      'Usar la restricción para eliminar variables.',
      'Encontrar el óptimo con $f\'(x) = 0$ y revisar los extremos del dominio.',
      'Comprobar que el resultado tiene sentido físico.'
    ],

    lesson: [
      {
        type: 'concept', heading: 'El método en cinco pasos', short: 'El método',
        body: [
          '<strong>1. Dibuja y nombra.</strong> Pon letras a las cantidades que cambian.',
          '<strong>2. Objetivo.</strong> Escribe lo que quieres maximizar o minimizar (área, volumen, costo…).',
          '<strong>3. Restricción.</strong> Usa el dato fijo (perímetro, volumen, material) para dejar el objetivo en <em>una</em> variable.',
          '<strong>4. Dominio y derivada.</strong> Decide qué valores tienen sentido, resuelve $f\'(x) = 0$ y compara con los extremos del dominio.',
          '<strong>5. Responde lo que se pregunta,</strong> con unidades. A veces piden la variable, a veces el valor óptimo.'
        ]
      },
      {
        type: 'explainer', heading: 'La caja sin tapa', short: 'La caja',
        title: 'Recorta las esquinas y dobla',
        intro: 'De una lámina cuadrada de 30 cm se recortan cuadros de lado $x$ en las esquinas y se doblan los lados: $V(x) = x(30 - 2x)^2$ con $0 < x < 15$.',
        diagram: 'box-cut',
        steps: [
          { text: 'Con cortes chicos la caja es plana: poco volumen.', state: { x: 1.5 } },
          { text: 'Al crecer $x$ la caja gana altura y el volumen sube.', state: { x: 3.5 } },
          { text: 'En $x = 5$: $V\'(x) = (30 - 2x)(30 - 6x) = 0$. Volumen máximo de 2000 cm³.', state: { x: 5 } },
          { text: 'Si sigues cortando, la base se encoge más rápido de lo que gana la altura.', state: { x: 9 } },
          { text: 'En $x = 15$ la base desaparece y el volumen vuelve a cero.', state: { x: 13 } }
        ]
      },
      {
        type: 'example', heading: 'La caja, con cálculo',
        problem: '<p>Encuentra el corte $x$ que maximiza $V(x) = x(30 - 2x)^2$ y el volumen máximo.</p>',
        steps: [
          { text: 'Producto y cadena.', math: 'V\'(x) = (30 - 2x)^2 - 4x(30 - 2x) = (30 - 2x)(30 - 6x)' },
          { text: 'Críticos: $x = 15$ (fuera del interior) y $x = 5$.' },
          { text: 'En los extremos del dominio $V = 0$, así que el máximo es interior.', math: 'V(5) = 5\\cdot 20^2 = 2000' }
        ],
        answer: '$x = 5$ cm y $V_{\\text{máx}} = 2000$ cm³.',
        verify: { lab: 'optimum', f: 'x*(30 - 2x)^2', a: 0, b: 15, kind: 'max', x: 5, value: 2000 }
      },
      {
        type: 'example', heading: 'Corral junto a un río',
        problem: '<p>Con 120 m de cerca se forma un corral rectangular junto a un río (ese lado no lleva cerca). ¿Qué medidas dan el área máxima?</p>',
        steps: [
          { text: 'Sea $x$ el lado perpendicular al río. Restricción: $2x + y = 120$, así que $y = 120 - 2x$.' },
          { text: 'Objetivo en una variable.', math: 'A(x) = x(120 - 2x) = 120x - 2x^2' },
          { text: 'Deriva e iguala a cero.', math: 'A\'(x) = 120 - 4x = 0 \\Rightarrow x = 30' },
          { text: '$A\'\' = -4 < 0$: es máximo. Entonces $y = 60$ y $A = 1800$.' }
        ],
        answer: '30 m por 60 m (paralelo al río), con 1800 m².',
        verify: { lab: 'optimum', f: 'x*(120 - 2x)', a: 0, b: 60, kind: 'max', x: 30, value: 1800 }
      },
      {
        type: 'example', heading: 'Una lata con poco material',
        problem: '<p>Una lata cilíndrica debe guardar 355 cm³. ¿Qué radio minimiza la lámina (superficie total)?</p>',
        steps: [
          { text: 'Restricción: $\\pi r^2 h = 355$, así que $h = \\dfrac{355}{\\pi r^2}$.' },
          { text: 'Objetivo.', math: 'S(r) = 2\\pi r^2 + 2\\pi r h = 2\\pi r^2 + \\frac{710}{r}' },
          { text: 'Deriva.', math: 'S\'(r) = 4\\pi r - \\frac{710}{r^2} = 0 \\Rightarrow r^3 = \\frac{355}{2\\pi}' },
          { text: '$S\'\' > 0$ para $r > 0$: es mínimo. Con ese radio, $h = 2r$: la lata ideal es tan alta como ancha.' }
        ],
        answer: '$r = \\sqrt[3]{355/(2\\pi)} \\approx ' + fx(rLata, 3) + '$ cm y $h = 2r \\approx ' + fx(2 * rLata, 3) + '$ cm.',
        verify: { lab: 'optimum', f: '2*pi*x^2 + 710/x', a: 1, b: 10, kind: 'min', x: rLata }
      },
      {
        type: 'callout', heading: 'Revisa los extremos del dominio',
        body: 'El óptimo puede estar en un borde, donde $f\'$ no vale cero. Si la variable vive en $[a, b]$, compara $f$ en los críticos y en $a$ y $b$. Y responde lo que se pregunta: el lado, el área o el costo.'
      }
    ],

    lab: {
      type: 'optimize-slider', title: 'Busca el óptimo con la mano',
      intro: 'Mueve la variable hasta que la tangente quede horizontal. Cambia el dato fijo (lado de la lámina, cerca, volumen o radio) y mira cómo se mueve el óptimo.',
      cfg: {}
    },

    formulas: [
      { label: 'Condición', tex: 'f\'(x) = 0\\ \\text{en el óptimo interior}' },
      { label: 'Caja', tex: 'V(x) = x(L - 2x)^2,\\quad x^* = \\tfrac{L}{6}' },
      { label: 'Corral', tex: 'A(x) = x(P - 2x),\\quad x^* = \\tfrac{P}{4}' },
      { label: 'Lata', tex: 'S(r) = 2\\pi r^2 + \\tfrac{2V}{r},\\quad r^* = \\sqrt[3]{\\tfrac{V}{2\\pi}}' }
    ],

    exercises: [
      {
        id: 'c1-s08-caja', title: 'Corte óptimo de la caja',
        vars: { L: [12, 60, 6] },
        prompt: function (v) { return '<p>De una lámina cuadrada de ' + v.L + ' cm se recortan cuadros de lado $x$ en las esquinas para hacer una caja sin tapa. ¿Qué $x$ da el volumen máximo?</p>'; },
        check: 'numeric', unit: 'cm',
        answer: function (v) { return v.L / 6; },
        mistakes: { quarter: function (v) { return v.L / 4; } },
        feedback: [{ when: 'quarter', say: 'Revisa la derivada: $V\'(x) = (L - 2x)(L - 6x)$.' }],
        oracle: { lab: 'optimum', kind: 'max', f: function (v) { return 'x*(' + v.L + ' - 2x)^2'; }, a: function () { return 0; }, b: function (v) { return v.L / 2; } },
        hint: '$V(x) = x(L - 2x)^2$.',
        solution: function (v) { return '$V\'(x) = (' + v.L + ' - 2x)(' + v.L + ' - 6x) = 0$; dentro del dominio, $x = ' + v.L + '/6 = ' + fx(v.L / 6) + '$ cm.'; }
      },
      {
        id: 'c1-s08-volumen', title: 'Volumen máximo de la caja',
        vars: { L: [12, 60, 6] },
        prompt: function (v) { return '<p>Con la misma caja (lámina de ' + v.L + ' cm), ¿cuál es el volumen máximo?</p>'; },
        check: 'numeric', unit: 'cm³',
        answer: function (v) { return 2 * Math.pow(v.L, 3) / 27; },
        mistakes: { gaveX: function (v) { return v.L / 6; } },
        feedback: [{ when: 'gaveX', say: 'Ese es el corte; ahora evalúa $V$ ahí.' }],
        oracle: { lab: 'optimum', kind: 'max', field: 'value', f: function (v) { return 'x*(' + v.L + ' - 2x)^2'; }, a: function () { return 0; }, b: function (v) { return v.L / 2; } },
        hint: 'Evalúa $V(L/6)$.',
        solution: function (v) { var x = v.L / 6; return '$V\\left(' + fx(x) + '\\right) = ' + fx(x) + '\\,(' + v.L + ' - ' + fx(2 * x) + ')^2 = ' + fx(2 * Math.pow(v.L, 3) / 27, 2) + '$ cm³.'; }
      },
      {
        id: 'c1-s08-corral', title: 'Área máxima del corral',
        vars: { P: [40, 400, 20] },
        prompt: function (v) { return '<p>Con ' + v.P + ' m de cerca se hace un corral rectangular junto a un río (ese lado no lleva cerca). ¿Cuál es el área máxima?</p>'; },
        check: 'numeric', unit: 'm²',
        answer: function (v) { return v.P * v.P / 8; },
        mistakes: { square: function (v) { return v.P * v.P / 9; } },
        feedback: [{ when: 'square', say: 'Un corral cuadrado no es el óptimo cuando un lado no lleva cerca.' }],
        oracle: { lab: 'optimum', kind: 'max', field: 'value', f: function (v) { return 'x*(' + v.P + ' - 2x)'; }, a: function () { return 0; }, b: function (v) { return v.P / 2; } },
        hint: '$A(x) = x(P - 2x)$, con $x$ perpendicular al río.',
        solution: function (v) { return '$A\'(x) = ' + v.P + ' - 4x = 0 \\Rightarrow x = ' + v.P / 4 + '$; $A = ' + v.P / 4 + '\\cdot ' + v.P / 2 + ' = ' + v.P * v.P / 8 + '$ m².'; }
      },
      {
        id: 'c1-s08-producto', title: 'Producto máximo',
        vars: { S: [10, 60, 2] },
        prompt: function (v) { return '<p>Dos números positivos suman ' + v.S + '. ¿Cuál es el mayor producto posible?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.S * v.S / 4; },
        mistakes: { half: function (v) { return v.S / 2; } },
        feedback: [{ when: 'half', say: 'Ese es cada número; se pide su producto.' }],
        oracle: { lab: 'optimum', kind: 'max', field: 'value', f: function (v) { return 'x*(' + v.S + ' - x)'; }, a: function () { return 0; }, b: function (v) { return v.S; } },
        hint: '$P(x) = x(S - x)$.',
        solution: function (v) { return '$P\'(x) = ' + v.S + ' - 2x = 0 \\Rightarrow x = ' + v.S / 2 + '$; $P = ' + v.S * v.S / 4 + '$.'; }
      },
      {
        id: 'c1-s08-lata', title: 'Radio de la lata',
        vars: { V: [250, 1000, 50] },
        prompt: function (v) { return '<p>Una lata cilíndrica cerrada debe guardar ' + v.V + ' cm³. ¿Qué radio minimiza su superficie?</p>'; },
        check: 'numeric', unit: 'cm', tol: { abs: 0.005 },
        answer: function (v) { return Math.cbrt(v.V / (2 * Math.PI)); },
        mistakes: { noTwo: function (v) { return Math.cbrt(v.V / Math.PI); } },
        feedback: [{ when: 'noTwo', say: 'Revisa: $S\'(r) = 4\\pi r - 2V/r^2$, así que $r^3 = V/(2\\pi)$.' }],
        oracle: { lab: 'optimum', kind: 'min', f: function (v) { return '2*pi*x^2 + ' + 2 * v.V + '/x'; }, a: function () { return 1; }, b: function () { return 12; } },
        hint: '$S(r) = 2\\pi r^2 + \\dfrac{2V}{r}$.',
        solution: function (v) { return '$S\'(r) = 4\\pi r - \\dfrac{' + 2 * v.V + '}{r^2} = 0 \\Rightarrow r = \\sqrt[3]{' + v.V + '/(2\\pi)} \\approx ' + fx(Math.cbrt(v.V / (2 * Math.PI)), 3) + '$ cm.'; }
      },
      {
        id: 'c1-s08-borde', title: 'Óptimo en un borde',
        vars: { b: [2, 6, 1] },
        prompt: function (v) { return '<p>¿Cuál es el valor máximo de $f(x) = x^2 - 2x$ en el intervalo $[0, ' + v.b + ']$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.b * v.b - 2 * v.b; },
        mistakes: { vertex: function () { return -1; } },
        feedback: [{ when: 'vertex', say: 'En $x = 1$, $f\' = 0$, pero es un mínimo. El máximo está en un borde.' }],
        where: function (v) { return v.b !== 2; },
        oracle: { lab: 'optimum', kind: 'max', field: 'value', f: function () { return 'x^2 - 2x'; }, a: function () { return 0; }, b: function (v) { return v.b; } },
        hint: 'Compara $f$ en el crítico y en los dos extremos del intervalo.',
        solution: function (v) { return '$f(0) = 0$, $f(1) = -1$ (mínimo), $f(' + v.b + ') = ' + (v.b * v.b - 2 * v.b) + '$. El máximo está en el borde derecho.'; }
      },
      {
        id: 'c1-s08-metodo', title: 'Primer paso',
        vars: {},
        prompt: function () { return '<p>Quieres el rectángulo de área máxima con perímetro 40. El objetivo $A = xy$ tiene dos variables. ¿Qué haces?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Usar $2x + 2y = 40$ para escribir $y = 20 - x$', correct: true },
            { text: 'Derivar $A = xy$ respecto a $x$ y a $y$ por separado', say: 'Primero deja el objetivo en una sola variable.' },
            { text: 'Suponer que $x = y$ desde el inicio', say: 'Sale cuadrado, pero hay que demostrarlo, no suponerlo.' },
            { text: 'Tomar $x = 40$', say: 'Con $x = 40$ el perímetro ya se pasa.' }
          ];
        },
        answer: function () { return 'Usar $2x + 2y = 40$ para escribir $y = 20 - x$'; },
        hint: 'La restricción sirve para eliminar una variable.',
        solution: function () { return 'Con $y = 20 - x$: $A(x) = x(20 - x)$, $A\' = 20 - 2x = 0$, $x = 10$. Es un cuadrado de 10 por 10.'; }
      }
    ],

    quiz: { tags: ['c1.S08'], count: 8 },

    errors: [
      'Derivar el objetivo con dos variables sin usar la restricción.',
      'Olvidar los extremos del dominio.',
      'Responder la variable cuando se pedía el valor óptimo (o al revés).',
      'Aceptar un crítico fuera del dominio físico (lados negativos, cortes mayores que la mitad).'
    ],

    teacher: {
      plan: ['Armar una caja de papel en clase.', 'Explainer de la caja y lab.', 'Ejemplos: corral, lata; discutir la lata “ideal” $h = 2r$.'],
      check: ['Que escriban dominio antes de derivar.'],
      note: 'El problema de examen “área con cociente” junta S04 y S08.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 1</em>, §4.7 “Applied Optimization Problems”. <a href="https://openstax.org/books/calculus-volume-1/pages/4-7-applied-optimization-problems">openstax.org</a> (CC BY 4.0).'
    ],

    prev: 'sesion-07',
    next: 'sesion-09'
  };
})();
