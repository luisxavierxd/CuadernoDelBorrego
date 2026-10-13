/* =====================================================================
   Física 3 · S07 · Superposición de campos y fuerza entre conductores paralelos (bloque B · Fuentes de campo).
   Fuentes: OpenStax, University Physics Volume 2, §12.3 (CC BY-NC-SA 4.0).
   μ₀ = 4π × 10⁻⁷ T·m/A, así que μ₀/2π = 2 × 10⁻⁷ T·m/A. Distancias en cm, campos en µT,
   fuerzas por metro en µN/m. Las cuentas se comparan contra LabMath.parwires (lab parallel-wires).
   ===================================================================== */
(function () {
  var MU0 = 4 * Math.PI * 1e-7;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
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
  // B de un alambre largo en µT con la distancia en cm: 20·I/a.
  function b1(I, a) { return 20 * I / a; }
  // Fuerza por metro entre dos alambres, en µN/m (d en cm).
  function fpl(I1, I2, d) { return 2e-7 * I1 * I2 / (d / 100) * 1e6; }

  // Ejemplo 1: dos alambres a 10 cm, 8 A saliendo y 4 A entrando; B en el punto medio
  var e1 = { I1: 8, I2: 4, d: 10 }; e1.B1 = b1(e1.I1, e1.d / 2); e1.B2 = b1(e1.I2, e1.d / 2); e1.B = e1.B1 + e1.B2;
  // Ejemplo 2: alambres en (0, 0) con 6 A saliendo y en (8, 0) cm con 6 A saliendo; P = (0, 6) cm
  var e2 = { I: 6, d: 8, h: 6 }; e2.r2 = Math.hypot(e2.d, e2.h); e2.B1 = b1(e2.I, e2.h); e2.B2 = b1(e2.I, e2.r2);
  // B₁: P está arriba del alambre 1 → B₁ hacia −x. B₂: r₂ = (−8, 6)/10; ẑ × r̂ = (−6, −8)/10.
  e2.Bx = -e2.B1 + e2.B2 * (-e2.h / e2.r2); e2.By = e2.B2 * (-e2.d / e2.r2); e2.B = Math.hypot(e2.Bx, e2.By); e2.ang = (Math.atan2(e2.By, e2.Bx) * 180 / Math.PI + 360) % 360;
  // Ejemplo 3: cables de un electrodoméstico: 12 A de ida y vuelta, a 3 mm; fuerza por metro y en 1.5 m
  var e3 = { I: 12, d: 0.3, L: 1.5 }; e3.f = fpl(e3.I, e3.I, e3.d); e3.F = e3.f * e3.L;
  // Ejemplo 4: tres alambres en fila; fuerza sobre el de en medio
  var e4 = { w: [{ x: -2, y: 0, I: 4 }, { x: 0, y: 0, I: 5 }, { x: 3, y: 0, I: -6 }] };
  e4.f1 = fpl(4, 5, 2); e4.f3 = fpl(6, 5, 3); e4.F = -(e4.f1 + e4.f3);

  var PAIR = [
    { a: 'en el mismo sentido', right: 'Se atraen', why: 'Corrientes en el mismo sentido se atraen.' },
    { a: 'en sentidos opuestos', right: 'Se repelen', why: 'Corrientes en sentidos opuestos se repelen.' }
  ];

  var data = window.SESSION_DATA = {
    slug: 'sesion-07', number: '07', group: 'B · Fuentes de campo',
    title: 'Superposición de campos y fuerza entre conductores paralelos', temario: [],
    minutes: 120,
    quote: 'Dos corrientes paralelas se atraen si van en el mismo sentido y se repelen si van en sentidos opuestos: al revés que las cargas, y con una fuerza por metro de $\\mu_0 I_1 I_2/2\\pi d$.',
    badges: [
      'Sumar como vectores los campos de varios alambres largos en un punto.',
      'Encontrar dónde se cancela el campo entre dos alambres.',
      'Calcular la fuerza por unidad de largo entre dos conductores paralelos y decir si se atraen o se repelen.',
      'Explicar de dónde salía la definición histórica del ampere.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Ya sabes el campo de un alambre largo, $B = \\mu_0 I/2\\pi a$, y la fuerza de un campo sobre un conductor, $\\vec F = I\\vec L\\times\\vec B$. Esta sesión junta las dos ideas: <strong>un alambre siente el campo de otro</strong>.',
        recall: [
          'El campo de un alambre largo y su sentido con la mano derecha (<a href="../sesion-06/">sesión 6</a>).',
          'La fuerza sobre un conductor con corriente, $\\vec F = I\\vec L\\times\\vec B$ (<a href="../sesion-04/">sesión 4</a>).',
          'Sumar vectores por componentes (<a href="../../../fisica-1/sesiones/sesion-02/">Física 1 · S02</a>).'
        ],
        why: 'Las barras de las subestaciones, los cables de alta corriente y los rieles de un cañón de riel sienten estas fuerzas. Y hasta 2019 el ampere se definía con ellas.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'En un arranque de auto, por los cables pasan cientos de amperes. Si los cables de ida y vuelta corren juntos, se empujan un poco hacia afuera; en una subestación, las barras de cobre se sujetan con soportes fuertes porque en un cortocircuito los miles de amperes las jalan o las empujan con fuerza.',
          'No hay imanes: cada corriente produce un campo, y la otra corriente, que está metida en ese campo, siente una fuerza.'
        ]
      },
      {
        type: 'concept', heading: 'Superposición: los campos se suman como vectores', short: 'Superposición',
        body: [
          'Con varios alambres, el campo en un punto es la suma vectorial de los campos de cada uno: $\\vec B = \\vec B_1 + \\vec B_2 + \\cdots$',
          'Cada $\\vec B_i$ tiene magnitud $\\mu_0 I_i/2\\pi r_i$ y es <strong>perpendicular</strong> a la línea que une el alambre con el punto, con el sentido de la mano derecha. Así que: dibuja $\\vec r_i$, gira $90^\\circ$ (antihorario si la corriente sale, horario si entra), y suma por componentes.',
          'Truco de cuentas: $\\frac{\\mu_0}{2\\pi} = 2\\times 10^{-7}\\ \\text{T·m/A}$. Con $I$ en A y $r$ en cm, $B = 20\\,I/r$ en $\\mu\\text{T}$.'
        ]
      },
      {
        type: 'explainer', heading: 'Dos alambres y un punto', short: 'Dos alambres',
        title: 'Campo en un punto P arriba de dos alambres con corrientes opuestas',
        intro: 'Sigue los pasos con el dibujo: primero cada campo por separado, luego la suma.',
        diagram: 'f3s07-super',
        steps: [
          { text: 'Dos alambres perpendiculares a la página: $I_1$ sale (⊙) e $I_2$ entra (⊗). P está a la misma distancia de los dos. Dibuja $\\vec r_1$ y $\\vec r_2$ de cada alambre a P.', state: { k: 1 } },
          { text: '$\\vec B_1$: magnitud $\\mu_0 I_1/2\\pi r_1$, perpendicular a $\\vec r_1$. Como $I_1$ sale, gira antihorario: en P apunta arriba a la izquierda.', state: { k: 2 } },
          { text: '$\\vec B_2$: perpendicular a $\\vec r_2$. Como $I_2$ entra, gira horario: en P apunta arriba a la derecha.', state: { k: 3 } },
          { text: 'Separa en componentes. Si las corrientes y las distancias son iguales, las componentes horizontales se cancelan y las verticales se suman.', state: { k: 4 } },
          { text: 'El campo total apunta hacia arriba. Si no hay simetría, la receta es la misma: suma $B_x$ por un lado y $B_y$ por otro.', state: { k: 5 } }
        ]
      },
      {
        type: 'concept', heading: 'Entre dos alambres: ¿se suman o se cancelan?', short: 'Entre dos alambres',
        body: [
          'Sobre la línea que une dos alambres, los dos campos son perpendiculares a esa línea, así que solo hay que ver si apuntan igual o al revés.',
          '<ul><li><strong>Corrientes opuestas</strong>: entre los alambres los campos apuntan igual y se <strong>suman</strong>. En el punto medio, $B = \\frac{\\mu_0}{2\\pi}\\cdot\\frac{I_1 + I_2}{d/2}$.</li><li><strong>Corrientes iguales en sentido</strong>: entre los alambres los campos apuntan al revés y se <strong>restan</strong>. Hay un punto con $B = 0$, más cerca del alambre de menor corriente: $\\frac{I_1}{x} = \\frac{I_2}{d - x}$.</li></ul>',
          'Las líneas de campo lo muestran: con corrientes iguales, lejos rodean a los dos alambres juntos; con corrientes opuestas, cada alambre tiene sus propias líneas y entre ellos se apretujan.'
        ],
        diagram: 'f3s07-lines',
        caption: 'Izquierda: corrientes iguales. Derecha: corrientes opuestas.'
      },
      {
        type: 'explainer', heading: 'La fuerza entre dos conductores paralelos', short: 'Fuerza entre conductores',
        title: 'Dos alambres paralelos y largos separados una distancia d',
        intro: 'Calcula el campo de un alambre en el lugar del otro, y luego la fuerza de ese campo sobre la corriente del otro.',
        diagram: 'f3s07-force',
        steps: [
          { text: '<strong>Campo de 1 en 2.</strong> El alambre 2 está a una distancia $d$ del 1, en un campo $B_1 = \\frac{\\mu_0 I_1}{2\\pi d}$. Con $I_1$ hacia arriba, en el lugar del alambre 2 ese campo entra a la página.', state: { k: 1, opp: 0 } },
          { text: '<strong>Fuerza sobre 2.</strong> Un tramo de largo $L$ del alambre 2 siente $\\vec F_2 = I_2\\vec L\\times\\vec B_1$. $\\vec L$ y $\\vec B_1$ son perpendiculares, así que $F_2 = I_2 L B_1$ y $$\\frac{F}{L} = \\frac{\\mu_0 I_1 I_2}{2\\pi d}$$ Con la mano derecha, apunta hacia el alambre 1.', state: { k: 2, opp: 0 } },
          { text: '<strong>Tercera ley.</strong> El alambre 1 siente una fuerza igual y opuesta, hacia el alambre 2. Las fórmulas son simétricas en $I_1$ e $I_2$.', state: { k: 3, opp: 0 } },
          { text: '<strong>Resultado.</strong> Corrientes en el mismo sentido: <strong>se atraen</strong>.', state: { k: 4, opp: 0 } },
          { text: 'Si inviertes $I_2$, cambia el sentido de $\\vec F_2$: corrientes opuestas <strong>se repelen</strong>. Es al revés que con las cargas: aquí “iguales” se atraen.', state: { k: 4, opp: 1 } }
        ]
      },
      {
        type: 'callout', heading: 'La definición del ampere',
        body: [
          'De 1948 a 2019 el ampere se definía con esta fuerza: <em>es la corriente que, en dos conductores paralelos, rectos, infinitamente largos y separados 1 m en el vacío, produce una fuerza de $2\\times 10^{-7}\\ \\text{N}$ por metro de largo</em>. Por eso $\\mu_0$ valía exactamente $4\\pi\\times 10^{-7}$.',
          'Desde 2019 el ampere se define fijando la carga del electrón, $e = 1.602176634\\times 10^{-19}\\ \\text{C}$, y $\\mu_0$ pasó a ser un valor medido (CODATA 2018: $1.25663706212\\times 10^{-6}\\ \\text{T·m/A}$). La diferencia con $4\\pi\\times 10^{-7}$ está en la décima cifra.'
        ]
      },
      {
        type: 'concept', heading: 'Tres o más alambres', short: 'Tres alambres',
        body: [
          'Para la fuerza sobre un alambre cuando hay varios, suma la fuerza que le hace cada uno de los otros, <strong>como vectores</strong>. Cada fuerza va sobre la línea que une los dos alambres: hacia el otro si las corrientes van igual, alejándose si van opuestas.',
          'Si todos están en una fila, las fuerzas van sobre la misma recta y solo hay que cuidar los signos.'
        ],
        diagram: 'f3s07-three',
        caption: 'Sobre el alambre de en medio, las dos fuerzas apuntan a la izquierda.'
      },
      {
        type: 'recipe', heading: 'Receta: campos y fuerzas de varios alambres', short: 'Receta',
        steps: [
          { text: 'Dibuja los alambres con ⊙ o ⊗ y el punto (o el alambre) donde te piden el resultado. Pasa las distancias a metros.' },
          { text: 'Campo de cada alambre: $B_i = \\mu_0 I_i/2\\pi r_i$, perpendicular a $\\vec r_i$, con el sentido de la mano derecha.', tip: 'B rodea al alambre: nunca apunta hacia él ni se aleja de él.' },
          { text: 'Suma por componentes. Si todo está en una recta, basta con signos.' },
          { text: 'Fuerza entre dos: $F/L = \\mu_0 I_1 I_2/2\\pi d$, hacia el otro si las corrientes van igual y alejándose si van opuestas. Para varios, suma vectores.', tip: 'Iguales se atraen: al revés que las cargas.' },
          { text: 'Revisa el orden de magnitud: unos amperes a unos centímetros dan decenas de µT y fuerzas de decenas a cientos de µN por metro.' }
        ]
      },
      {
        type: 'example', heading: 'Punto medio entre corrientes opuestas',
        problem: '<p>Dos alambres largos y paralelos están a $' + e1.d + '\\ \\text{cm}$. Uno lleva $' + e1.I1 + '\\ \\text{A}$ saliendo de la página y el otro $' + e1.I2 + '\\ \\text{A}$ entrando. ¿Cuánto vale $B$ en el punto medio?</p>',
        steps: [
          { text: 'Cada alambre está a $' + e1.d / 2 + '\\ \\text{cm}$ del punto medio.', math: 'B_1 = \\frac{\\mu_0 I_1}{2\\pi r} = \\frac{2\\times 10^{-7}(' + e1.I1 + ')}{' + fx(e1.d / 200, 2) + '} = ' + fx(e1.B1, 1) + '\\ \\mu\\text{T} \\qquad B_2 = ' + fx(e1.B2, 1) + '\\ \\mu\\text{T}' },
          { text: 'Con corrientes opuestas, entre los alambres los dos campos apuntan igual (haz la mano derecha con cada uno): se suman.', math: 'B = ' + fx(e1.B1, 1) + ' + ' + fx(e1.B2, 1) + ' = ' + fx(e1.B, 1) + '\\ \\mu\\text{T}' }
        ],
        answer: '$B = ' + fx(e1.B, 1) + '\\ \\mu\\text{T}$, perpendicular a la línea entre los alambres.',
        verify: { lab: 'call', mod: 'parwires', fn: 'field', args: [[{ x: -e1.d / 2, y: 0, I: e1.I1 }, { x: e1.d / 2, y: 0, I: -e1.I2 }], 0, 0], values: { mag: e1.B } }
      },
      {
        type: 'example', heading: 'Un punto fuera de la línea',
        problem: '<p>Dos alambres llevan $' + e2.I + '\\ \\text{A}$ cada uno, saliendo de la página: uno en el origen y otro en $(' + e2.d + ', 0)\\ \\text{cm}$. ¿Cuánto vale $\\vec B$ en $P = (0, ' + e2.h + ')\\ \\text{cm}$? Da su magnitud y su ángulo desde $+x$.</p>',
        steps: [
          { text: 'Alambre 1: P está $' + e2.h + '\\ \\text{cm}$ arriba. Saliendo, antihorario: arriba del alambre $\\vec B_1$ apunta a $-x$.', math: 'B_1 = \\frac{20(' + e2.I + ')}{' + e2.h + '} = ' + fx(e2.B1, 1) + '\\ \\mu\\text{T}\\ \\text{hacia}\\ -x' },
          { text: 'Alambre 2: $r_2 = \\sqrt{' + e2.d + '^2 + ' + e2.h + '^2} = ' + fx(e2.r2, 0) + '\\ \\text{cm}$ y $\\hat r_2 = (-0.8, 0.6)$. Girar $90^\\circ$ antihorario da $(-0.6, -0.8)$.', math: 'B_2 = \\frac{20(' + e2.I + ')}{' + fx(e2.r2, 0) + '} = ' + fx(e2.B2, 1) + '\\ \\mu\\text{T} \\Rightarrow \\vec B_2 = (' + fx(e2.B2 * -0.6, 1) + ',\\ ' + fx(e2.B2 * -0.8, 1) + ')\\ \\mu\\text{T}' },
          { text: 'Suma por componentes.', math: 'B_x = ' + fx(-e2.B1, 1) + ' + (' + fx(e2.B2 * -0.6, 1) + ') = ' + fx(e2.Bx, 1) + ' \\qquad B_y = ' + fx(e2.By, 1) },
          { text: 'Magnitud y ángulo (tercer cuadrante).', math: '|\\vec B| = \\sqrt{' + fx(e2.Bx, 1) + '^2 + ' + fx(e2.By, 1) + '^2} = ' + fx(e2.B, 1) + '\\ \\mu\\text{T} \\qquad \\theta = ' + fx(e2.ang, 1) + '^\\circ' }
        ],
        answer: '$|\\vec B| = ' + fx(e2.B, 1) + '\\ \\mu\\text{T}$, a $' + fx(e2.ang, 1) + '^\\circ$ de $+x$.',
        verify: { lab: 'call', mod: 'parwires', fn: 'field', args: [[{ x: 0, y: 0, I: e2.I }, { x: e2.d, y: 0, I: e2.I }], 0, e2.h], values: { x: e2.Bx, y: e2.By, mag: e2.B, ang: e2.ang } }
      },
      {
        type: 'example', heading: 'Los dos cables de una plancha',
        problem: '<p>El cordón de una plancha tiene dos conductores paralelos separados $' + fx(e3.d * 10, 0) + '\\ \\text{mm}$, que llevan $' + e3.I + '\\ \\text{A}$ de ida y $' + e3.I + '\\ \\text{A}$ de vuelta. ¿Qué fuerza por metro sienten, se atraen o se repelen, y qué fuerza hay en $' + e3.L + '\\ \\text{m}$ de cordón?</p>',
        steps: [
          { text: 'Fuerza por metro con $d = ' + fx(e3.d / 100, 3) + '\\ \\text{m}$.', math: '\\frac{F}{L} = \\frac{\\mu_0 I_1 I_2}{2\\pi d} = \\frac{2\\times 10^{-7}(' + e3.I + ')(' + e3.I + ')}{' + fx(e3.d / 100, 3) + '} = ' + fx(e3.f / 1000, 1) + '\\times 10^{-3}\\ \\text{N/m}' },
          { text: 'Ida y vuelta son corrientes opuestas: <strong>se repelen</strong>.' },
          { text: 'En todo el cordón.', math: 'F = ' + fx(e3.f / 1000, 1) + '\\times 10^{-3}\\ \\text{N/m}\\times ' + e3.L + '\\ \\text{m} = ' + fx(e3.F / 1000, 1) + '\\times 10^{-3}\\ \\text{N}' },
          { text: 'Es muy poco (el peso de unos granos de arroz). Pero la fuerza va con $I^2$: en un cortocircuito de miles de amperes, la misma geometría daría cientos de newtons por metro.' }
        ],
        answer: '$F/L = ' + fx(e3.f / 1000, 1) + '\\times 10^{-3}\\ \\text{N/m}$, se repelen; en ' + e3.L + ' m, $' + fx(e3.F / 1000, 1) + '\\times 10^{-3}\\ \\text{N}$.',
        verify: { lab: 'call', mod: 'parwires', fn: 'force', args: [[{ x: 0, y: 0, I: e3.I }, { x: e3.d, y: 0, I: -e3.I }], 1], values: { mag: e3.f, x: e3.f } }
      },
      {
        type: 'example', heading: 'Tres alambres en fila',
        problem: '<p>Tres alambres en una fila (figura de arriba): $4.0\\ \\text{A}$ saliendo; a $2.0\\ \\text{cm}$, $5.0\\ \\text{A}$ saliendo; y a $3.0\\ \\text{cm}$ de este, $6.0\\ \\text{A}$ entrando. ¿Qué fuerza por metro siente el alambre de en medio?</p>',
        steps: [
          { text: 'Con el primero: corrientes iguales, lo atrae hacia la izquierda.', math: '\\frac{F_1}{L} = \\frac{2\\times 10^{-7}(4.0)(5.0)}{0.020} = ' + fx(e4.f1, 0) + '\\ \\mu\\text{N/m}' },
          { text: 'Con el tercero: corrientes opuestas, lo repele, también hacia la izquierda.', math: '\\frac{F_3}{L} = \\frac{2\\times 10^{-7}(6.0)(5.0)}{0.030} = ' + fx(e4.f3, 0) + '\\ \\mu\\text{N/m}' },
          { text: 'Las dos apuntan igual: se suman.', math: '\\frac{F}{L} = ' + fx(e4.f1, 0) + ' + ' + fx(e4.f3, 0) + ' = ' + fx(-e4.F, 0) + '\\ \\mu\\text{N/m}\\ \\text{hacia la izquierda}' }
        ],
        answer: '$F/L = ' + fx(-e4.F, 0) + '\\ \\mu\\text{N/m} = 4.0\\times 10^{-4}\\ \\text{N/m}$, hacia la izquierda.',
        verify: { lab: 'call', mod: 'parwires', fn: 'force', args: [e4.w, 1], values: { x: e4.F, mag: -e4.F } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué corrientes iguales se atraen si cargas iguales se repelen?', a: 'Porque no es la fuerza eléctrica: los alambres son neutros. Es la fuerza magnética $I\\vec L\\times\\vec B$, y el producto cruz da el sentido «al revés» del que esperarías por analogía.' },
          { q: '¿El alambre siente su propio campo?', a: 'Su propio campo no le hace fuerza neta (por simetría). Solo cuenta el campo de los <em>otros</em> alambres.' },
          { q: '¿La fuerza entre los cables del cordón es peligrosa?', a: 'Con corrientes domésticas, no: son milinewtons por metro. En cortocircuitos industriales (decenas de miles de amperes) sí: por eso las barras se sujetan con soportes robustos.' },
          { q: '¿Sirve $\\mu_0 I_1 I_2/2\\pi d$ para alambres cortos?', a: 'Solo si son largos comparados con $d$. Para tramos cortos el campo es menor (sesión 6) y la fuerza también.' },
          { q: '¿Dónde se cancela el campo entre dos corrientes iguales en sentido?', a: 'En el punto donde $I_1/x = I_2/(d - x)$: más cerca del alambre con menos corriente. Si $I_1 = I_2$, en el punto medio. Con corrientes opuestas, entre ellos nunca se cancela.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Los campos de varios alambres se suman como vectores; cada uno es perpendicular a $\\vec r_i$ y vale $\\mu_0 I_i/2\\pi r_i$ ($= 20\\,I/r$ en µT con $r$ en cm).',
          'Entre dos alambres: con corrientes opuestas los campos se suman; con corrientes iguales se restan y hay un punto con $B = 0$.',
          'Fuerza por unidad de largo: $F/L = \\mu_0 I_1 I_2/2\\pi d$. Iguales se atraen; opuestas se repelen.',
          'Con varios alambres, suma las fuerzas como vectores.',
          'Hasta 2019, el ampere se definía con esta fuerza: $2\\times 10^{-7}\\ \\text{N/m}$ a 1 m.'
        ]
      }
    ],

    lab: {
      type: 'parallel-wires', title: 'Alambres paralelos',
      intro: 'Arrastra los alambres y la sonda P. El lab dibuja la dirección de B en todo el plano, el campo de cada alambre en P y la suma, y la fuerza por metro sobre cada alambre. En el reto, predice |B| en P y su ángulo, o la fuerza por metro sobre el alambre de en medio; el lab te dice si sumaste magnitudes, si pusiste B apuntando hacia el alambre o si solo contaste el alambre más cercano.',
      cfg: {}
    },

    formulas: [
      { label: 'Superposición', tex: '\\vec B = \\vec B_1 + \\vec B_2 + \\cdots,\\quad B_i = \\frac{\\mu_0 I_i}{2\\pi r_i}' },
      { label: 'Atajo', tex: '\\frac{\\mu_0}{2\\pi} = 2\\times 10^{-7}\\ \\text{T·m/A}' },
      { label: 'Fuerza entre paralelos', tex: '\\frac{F}{L} = \\frac{\\mu_0 I_1 I_2}{2\\pi d}' },
      { label: 'Punto con B = 0 (iguales)', tex: '\\frac{I_1}{x} = \\frac{I_2}{d - x}' },
      { label: 'Ampere (hasta 2019)', tex: '1\\ \\text{A}:\\ \\frac{F}{L} = 2\\times 10^{-7}\\ \\text{N/m}\\ \\text{a}\\ 1\\ \\text{m}' }
    ],

    exercises: [
      {
        id: 'f3-s07-medio', title: 'Punto medio, corrientes opuestas',
        vars: { I1: [2, 12, 1], I2: [2, 12, 1], d: [4, 20, 2] },
        prompt: function (v) { return '<p>Dos alambres largos y paralelos están a $' + v.d + '\\ \\text{cm}$; uno lleva $' + v.I1 + '\\ \\text{A}$ saliendo de la página y el otro $' + v.I2 + '\\ \\text{A}$ entrando. ¿Cuánto vale $B$ en el punto medio? En $\\mu\\text{T}$.</p>'; },
        check: 'numeric', unit: 'µT',
        answer: function (v) { return b1(v.I1, v.d / 2) + b1(v.I2, v.d / 2); },
        mistakes: {
          diff: function (v) { return Math.abs(b1(v.I1, v.d / 2) - b1(v.I2, v.d / 2)); },
          fullD: function (v) { return b1(v.I1, v.d) + b1(v.I2, v.d); }
        },
        feedback: [
          { when: 'diff', say: 'Restaste. Con corrientes opuestas, entre los alambres los dos campos apuntan igual: se suman.' },
          { when: 'fullD', say: 'Usaste la separación completa. Cada alambre está a $d/2$ del punto medio.' }
        ],
        where: function (v) { return v.I1 !== v.I2; },
        oracle: { lab: 'call', mod: 'parwires', fn: 'field', field: 'mag', args: function (v) { return [[{ x: -v.d / 2, y: 0, I: v.I1 }, { x: v.d / 2, y: 0, I: -v.I2 }], 0, 0]; } },
        hint: 'Cada campo vale $\\mu_0 I/2\\pi(d/2)$. Con la mano derecha, ve si apuntan igual o al revés.',
        solution: function (v) { return '$$B = \\frac{2\\times 10^{-7}}{' + fx(v.d / 200, 2) + '}(' + v.I1 + ' + ' + v.I2 + ') = ' + fx(b1(v.I1, v.d / 2) + b1(v.I2, v.d / 2), 1) + '\\ \\mu\\text{T}$$'; }
      },
      {
        id: 'f3-s07-medio-iguales', title: 'Punto medio, corrientes iguales en sentido',
        vars: { I1: [2, 12, 1], I2: [2, 12, 1], d: [4, 20, 2] },
        prompt: function (v) { return '<p>Dos alambres largos y paralelos a $' + v.d + '\\ \\text{cm}$ llevan $' + v.I1 + '\\ \\text{A}$ y $' + v.I2 + '\\ \\text{A}$, las dos saliendo de la página. ¿Cuánto vale $B$ en el punto medio? En $\\mu\\text{T}$.</p>'; },
        check: 'numeric', unit: 'µT',
        answer: function (v) { return Math.abs(b1(v.I1, v.d / 2) - b1(v.I2, v.d / 2)); },
        mistakes: { sum: function (v) { return b1(v.I1, v.d / 2) + b1(v.I2, v.d / 2); } },
        feedback: [{ when: 'sum', say: 'Con corrientes en el mismo sentido, entre los alambres los campos apuntan al revés: se restan.' }],
        where: function (v) { return Math.abs(v.I1 - v.I2) >= 2; },
        oracle: { lab: 'call', mod: 'parwires', fn: 'field', field: 'mag', args: function (v) { return [[{ x: -v.d / 2, y: 0, I: v.I1 }, { x: v.d / 2, y: 0, I: v.I2 }], 0, 0]; } },
        hint: 'Entre dos corrientes iguales en sentido, los campos apuntan al revés.',
        solution: function (v) { return '$$B = \\frac{2\\times 10^{-7}}{' + fx(v.d / 200, 2) + '}\\,|' + v.I1 + ' - ' + v.I2 + '| = ' + fx(Math.abs(b1(v.I1, v.d / 2) - b1(v.I2, v.d / 2)), 1) + '\\ \\mu\\text{T}$$'; }
      },
      {
        id: 'f3-s07-cero', title: '¿Dónde se cancela el campo?',
        vars: { I1: [1, 10, 1], I2: [1, 10, 1], d: [4, 20, 2] },
        prompt: function (v) { return '<p>Dos alambres a $' + v.d + '\\ \\text{cm}$ llevan $' + v.I1 + '\\ \\text{A}$ y $' + v.I2 + '\\ \\text{A}$ en el mismo sentido. ¿A qué distancia del primero (el de ' + v.I1 + ' A), entre los dos, se cancela el campo? En cm.</p>'; },
        check: 'numeric', unit: 'cm',
        answer: function (v) { return v.d * v.I1 / (v.I1 + v.I2); },
        mistakes: { swap: function (v) { return v.d * v.I2 / (v.I1 + v.I2); } },
        feedback: [{ when: 'swap', say: 'Ese punto está más cerca del alambre con <em>más</em> corriente. El campo se cancela más cerca del de menos corriente.' }],
        where: function (v) { return v.I1 !== v.I2; },
        oracle: { lab: 'call', mod: 'parwires', fn: 'zero', args: function (v) { return [[{ x: 0, y: 0, I: v.I1 }, { x: v.d, y: 0, I: v.I2 }], 0.001, v.d - 0.001]; } },
        hint: 'Iguala $\\frac{I_1}{x} = \\frac{I_2}{d - x}$.',
        solution: function (v) { return '$$\\frac{' + v.I1 + '}{x} = \\frac{' + v.I2 + '}{' + v.d + ' - x} \\Rightarrow x = \\frac{' + v.d + '(' + v.I1 + ')}{' + v.I1 + ' + ' + v.I2 + '} = ' + fx(v.d * v.I1 / (v.I1 + v.I2), 2) + '\\ \\text{cm}$$'; }
      },
      {
        id: 'f3-s07-fuerza', title: 'Fuerza por metro entre dos alambres',
        vars: { I1: [1, 20, 1], I2: [1, 20, 1], d: [1, 10, 0.5] },
        prompt: function (v) { return '<p>Dos alambres largos y paralelos separados $' + fx(v.d, 1) + '\\ \\text{cm}$ llevan $' + v.I1 + '\\ \\text{A}$ y $' + v.I2 + '\\ \\text{A}$. ¿Qué fuerza por metro siente cada uno? En $\\mu\\text{N/m}$.</p>'; },
        check: 'numeric', unit: 'µN/m',
        answer: function (v) { return fpl(v.I1, v.I2, v.d); },
        mistakes: {
          cm: function (v) { return fpl(v.I1, v.I2, v.d) / 100; },
          fourPi: function (v) { return fpl(v.I1, v.I2, v.d) / 2; }
        },
        feedback: [
          { when: 'cm', say: 'Pasa $d$ a metros.' },
          { when: 'fourPi', say: 'El denominador es $2\\pi d$: $F/L = \\mu_0 I_1 I_2/2\\pi d$.' }
        ],
        oracle: { lab: 'call', mod: 'parwires', fn: 'force', field: 'mag', args: function (v) { return [[{ x: 0, y: 0, I: v.I1 }, { x: v.d, y: 0, I: v.I2 }], 1]; } },
        hint: '$F/L = 2\\times 10^{-7}\\,I_1 I_2/d$ con $d$ en m.',
        solution: function (v) { return '$$\\frac{F}{L} = \\frac{2\\times 10^{-7}(' + v.I1 + ')(' + v.I2 + ')}{' + fx(v.d / 100, 3) + '} = ' + fx(fpl(v.I1, v.I2, v.d), 1) + '\\ \\mu\\text{N/m}$$'; }
      },
      {
        id: 'f3-s07-triangulo', title: 'Campo en la esquina de un triángulo rectángulo',
        vars: { I: [2, 10, 1], d: [3, 8, 1], h: [3, 8, 1] },
        prompt: function (v) { return '<p>Dos alambres llevan $' + v.I + '\\ \\text{A}$ cada uno, saliendo de la página: uno en el origen y otro en $(' + v.d + ', 0)\\ \\text{cm}$. ¿Cuánto vale $|\\vec B|$ en $P = (0, ' + v.h + ')\\ \\text{cm}$? En $\\mu\\text{T}$.</p>'; },
        check: 'numeric', unit: 'µT',
        answer: function (v) { var r = Math.hypot(v.d, v.h), B1 = b1(v.I, v.h), B2 = b1(v.I, r); return Math.hypot(-B1 - B2 * v.h / r, -B2 * v.d / r); },
        mistakes: {
          sumMag: function (v) { return b1(v.I, v.h) + b1(v.I, Math.hypot(v.d, v.h)); },
          pyth: function (v) { return Math.hypot(b1(v.I, v.h), b1(v.I, Math.hypot(v.d, v.h))); }
        },
        feedback: [
          { when: 'sumMag', say: 'Sumaste magnitudes. Los dos campos no son paralelos: suma por componentes.' },
          { when: 'pyth', say: 'Usaste Pitágoras como si los campos fueran perpendiculares. No lo son: el ángulo entre ellos es el de $\\vec r_1$ y $\\vec r_2$.' }
        ],
        oracle: { lab: 'call', mod: 'parwires', fn: 'field', field: 'mag', args: function (v) { return [[{ x: 0, y: 0, I: v.I }, { x: v.d, y: 0, I: v.I }], 0, v.h]; } },
        hint: 'Cada campo es perpendicular a su $\\vec r$. Saca componentes y suma.',
        solution: function (v) { var r = Math.hypot(v.d, v.h), B1 = b1(v.I, v.h), B2 = b1(v.I, r), Bx = -B1 - B2 * v.h / r, By = -B2 * v.d / r; return '$\\vec B_1 = (' + fx(-B1, 2) + ', 0)$ y $\\vec B_2 = ' + fx(B2, 2) + '\\,(-' + fx(v.h / r, 3) + ', -' + fx(v.d / r, 3) + ')\\ \\mu\\text{T}$: $$|\\vec B| = \\sqrt{' + fx(Bx, 2) + '^2 + ' + fx(By, 2) + '^2} = ' + fx(Math.hypot(Bx, By), 2) + '\\ \\mu\\text{T}$$'; }
      },
      {
        id: 'f3-s07-fila', title: 'Fuerza sobre el alambre de en medio',
        vars: { Ia: [2, 8, 1], Ib: [2, 8, 1], Ic: [2, 8, 1], a: [1, 5, 1], c: [1, 5, 1] },
        prompt: function (v) { return '<p>Tres alambres en una fila: $' + v.Ia + '\\ \\text{A}$ saliendo; a $' + v.a + '\\ \\text{cm}$ a su derecha, $' + v.Ib + '\\ \\text{A}$ saliendo; y a $' + v.c + '\\ \\text{cm}$ a la derecha de este, $' + v.Ic + '\\ \\text{A}$ <strong>saliendo</strong>. ¿Qué fuerza por metro siente el de en medio? Dala con signo: positiva si apunta a la derecha. En $\\mu\\text{N/m}$.</p>'; },
        check: 'numeric', unit: 'µN/m',
        answer: function (v) { return fpl(v.Ic, v.Ib, v.c) - fpl(v.Ia, v.Ib, v.a); },
        mistakes: {
          sum: function (v) { return -(fpl(v.Ic, v.Ib, v.c) + fpl(v.Ia, v.Ib, v.a)); },
          sign: function (v) { return fpl(v.Ia, v.Ib, v.a) - fpl(v.Ic, v.Ib, v.c); }
        },
        feedback: [
          { when: 'sum', say: 'Las dos corrientes vecinas van igual que la de en medio: cada una la atrae hacia sí, en sentidos opuestos. Se restan.' },
          { when: 'sign', say: 'El signo está al revés: corrientes iguales se atraen.' }
        ],
        where: function (v) { return Math.abs(fpl(v.Ic, v.Ib, v.c) - fpl(v.Ia, v.Ib, v.a)) > 5; },
        oracle: { lab: 'call', mod: 'parwires', fn: 'force', field: 'x', args: function (v) { return [[{ x: 0, y: 0, I: v.Ia }, { x: v.a, y: 0, I: v.Ib }, { x: v.a + v.c, y: 0, I: v.Ic }], 1]; } },
        hint: 'Cada vecino jala al de en medio hacia sí (corrientes iguales). Uno jala a la izquierda y el otro a la derecha.',
        solution: function (v) { var fl = fpl(v.Ia, v.Ib, v.a), fr = fpl(v.Ic, v.Ib, v.c); return 'El de la izquierda lo jala con $' + fx(fl, 1) + '\\ \\mu\\text{N/m}$ hacia $-x$; el de la derecha, con $' + fx(fr, 1) + '\\ \\mu\\text{N/m}$ hacia $+x$: $$\\frac{F}{L} = ' + fx(fr, 1) + ' - ' + fx(fl, 1) + ' = ' + fx(fr - fl, 1) + '\\ \\mu\\text{N/m}$$'; }
      },
      {
        id: 'f3-s07-atraen', title: 'Concepto: ¿se atraen o se repelen?',
        vars: { k: [0, 1, 1] },
        prompt: function (v) { return '<p>Dos alambres largos y paralelos llevan corrientes ' + PAIR[v.k].a + '. ¿Qué pasa con ellos?</p>'; },
        check: 'choice',
        options: function (v) {
          var say = {
            'Se atraen': 'Al revés: corrientes opuestas se repelen.',
            'Se repelen': 'Al revés: corrientes en el mismo sentido se atraen.',
            'No hay fuerza: los alambres son neutros': 'No hay fuerza eléctrica, pero sí magnética: cada uno está en el campo del otro.'
          };
          return ['Se atraen', 'Se repelen', 'No hay fuerza: los alambres son neutros'].map(function (t) { return t === PAIR[v.k].right ? { text: t, correct: true } : { text: t, say: say[t] }; });
        },
        answer: function (v) { return PAIR[v.k].right; },
        hint: 'Iguales se atraen; opuestas se repelen (al revés que las cargas).',
        solution: function (v) { return PAIR[v.k].why + ' Sale de $\\vec F = I\\vec L\\times\\vec B$ con el campo del otro alambre.'; }
      }
    ],

    quiz: { tags: ['f3.S07'], count: 8 },

    errors: [
      'Sumar las magnitudes de los campos de varios alambres en lugar de sumarlos como vectores.',
      'Dibujar el campo de un alambre apuntando hacia él o alejándose: es perpendicular a $\\vec r$.',
      'Creer que corrientes iguales se repelen, como las cargas: se atraen.',
      'Usar la separación completa $d$ en lugar de $d/2$ en el punto medio.',
      'Poner el punto de campo cero más cerca del alambre con más corriente: está más cerca del de menos.',
      'Contar la fuerza de un alambre sobre sí mismo.',
      'Dejar $d$ en centímetros en $\\mu_0 I_1 I_2/2\\pi d$.'
    ],

    teacher: {
      plan: [
        'Recupera el campo del alambre largo y la fuerza $I\\vec L\\times\\vec B$; pregunta qué pasa si un alambre está en el campo de otro.',
        'Superposición con el explainer de dos alambres y un punto; luego las líneas de campo de los dos casos.',
        'Deriva $F/L = \\mu_0 I_1 I_2/2\\pi d$ con el explainer y enfatiza que «iguales se atraen».',
        'Cierra con la definición histórica del ampere y el lab (fuerzas de tres alambres).'
      ],
      check: [
        'Que sumen el campo de dos alambres en un punto fuera de la línea, por componentes.',
        'Que digan si dos alambres se atraen o se repelen y calculen $F/L$.',
        'Que localicen el punto de campo cero entre dos corrientes iguales en sentido.'
      ],
      note: 'La redefinición del SI de 2019 se menciona solo como cultura: en las cuentas del curso $\\mu_0 = 4\\pi\\times 10^{-7}$.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §12.3 “Magnetic Force between Two Parallel Currents”. <a href="https://openstax.org/books/university-physics-volume-2/pages/12-3-magnetic-force-between-two-parallel-currents">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §12.2 “Magnetic Field Due to a Thin Straight Wire”. <a href="https://openstax.org/books/university-physics-volume-2/pages/12-2-magnetic-field-due-to-a-thin-straight-wire">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-06',
    next: 'sesion-08'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
