/* =====================================================================
   Física 1 · S07 · Movimiento circular y relativo (bloque B · Cinemática).
   Fuente: OpenStax, University Physics Volume 1, §4.4–4.5 (CC BY-NC-SA 4.0).
   Las cuentas se comprueban contra LabMath.circular y LabMath.relative
   (lab circular-vectors).
   ===================================================================== */
(function () {
  var TAU = 2 * Math.PI, DEG = 180 / Math.PI;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }

  // Ejemplo 1: centrífuga de laboratorio
  var e1 = { r: 0.4, rpm: 120 };
  e1.w = e1.rpm * TAU / 60; e1.v = e1.w * e1.r; e1.ac = e1.w * e1.w * e1.r; e1.T = 60 / e1.rpm;
  // Ejemplo 2: auto que acelera en una curva
  var e2 = { v: 20, r: 50, at: 3 };
  e2.ac = e2.v * e2.v / e2.r; e2.a = Math.sqrt(e2.ac * e2.ac + e2.at * e2.at);
  // Ejemplo 3: lancha que cruza un río apuntando a la otra orilla
  var e3 = { vb: 4, vc: 3, w: 80 };
  e3.t = e3.w / e3.vb; e3.drift = e3.vc * e3.t; e3.speed = Math.sqrt(e3.vb * e3.vb + e3.vc * e3.vc);
  // Ejemplo 4: la misma lancha, más rápida, que quiere cruzar en línea recta
  var e4 = { vb: 5, vc: 3, w: 80 };
  e4.alpha = Math.asin(e4.vc / e4.vb) * DEG; e4.s = Math.sqrt(e4.vb * e4.vb - e4.vc * e4.vc); e4.t = e4.w / e4.s;

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
    slug: 'sesion-07', number: '07', group: 'B · Cinemática',
    title: 'Movimiento circular y relativo', temario: [],
    minutes: 150,
    quote: 'Girar a rapidez constante también es acelerar: la velocidad cambia de dirección todo el tiempo.',
    badges: [
      'Pasar de rpm y periodo a rapidez angular y rapidez lineal.',
      'Calcular la aceleración centrípeta y saber hacia dónde apunta.',
      'Combinar aceleración centrípeta y tangencial.',
      'Sumar velocidades entre marcos de referencia (río, viento, trenes).'
    ],

    lesson: [
      {
        type: 'concept', heading: 'Ángulos, vueltas y rapidez angular', short: 'Cinemática angular',
        body: [
          'En un círculo de radio $r$, el arco recorrido es $s = r\\theta$ con $\\theta$ en <strong>radianes</strong>. Una vuelta completa son $2\\pi$ rad.',
          'La <strong>rapidez angular</strong> $\\omega = d\\theta/dt$ se mide en rad/s. Si es constante, una vuelta tarda el <strong>periodo</strong> $T = 2\\pi/\\omega$ y la <strong>frecuencia</strong> es $f = 1/T$ (en Hz = vueltas por segundo). Las rpm son vueltas por minuto: $\\omega = \\text{rpm}\\cdot\\frac{2\\pi}{60}$.',
          'Derivando $s = r\\theta$: la rapidez sobre el círculo es $$v = \\omega\\,r$$ y la velocidad es tangente al círculo.'
        ],
        diagram: 'circular-kin',
        caption: 'Todos los puntos de una rueda giran con el mismo $\\omega$; los de afuera van más rápido porque $v = \\omega r$.'
      },
      {
        type: 'explainer', heading: 'Por qué la aceleración apunta al centro', short: 'Aceleración centrípeta',
        title: 'Misma rapidez, distinta dirección',
        intro: 'En el movimiento circular uniforme la rapidez no cambia, pero la velocidad sí. Compara dos instantes.',
        diagram: 'centripetal-explainer',
        steps: [
          { text: 'En dos puntos del círculo, $\\vec{v}_1$ y $\\vec{v}_2$ miden lo mismo pero apuntan a lados distintos.', state: { dth: 60, show: 'v' } },
          { text: 'Pon las dos flechas con la misma cola: el cambio $\\Delta\\vec{v} = \\vec{v}_2 - \\vec{v}_1$ apunta hacia el centro.', state: { dth: 60, show: 'dv' } },
          { text: 'Al acercar los instantes, $\\Delta\\vec{v}$ se vuelve más chico y apunta cada vez más exacto al centro.', state: { dth: 25, show: 'dv' } },
          { text: 'En el límite, la aceleración es <strong>centrípeta</strong> (hacia el centro) y vale $$a_c = \\frac{v^2}{r} = \\omega^2 r$$', state: { dth: 6, show: 'dv' } }
        ]
      },
      {
        type: 'example', heading: 'Una centrífuga de laboratorio',
        problem: '<p>Una centrífuga gira a $' + e1.rpm + '$ rpm y la muestra está a $' + e1.r + '\\ \\text{m}$ del eje. ¿Cuánto valen $\\omega$, la rapidez de la muestra, su aceleración centrípeta y el periodo?</p>',
        steps: [
          { text: 'Rapidez angular: rpm a rad/s.', math: '\\omega = ' + e1.rpm + '\\cdot\\frac{2\\pi}{60} = 4\\pi = ' + fx(e1.w, 3) + '\\ \\text{rad/s}' },
          { text: 'Rapidez lineal.', math: 'v = \\omega r = (' + fx(e1.w, 3) + ')(' + e1.r + ') = ' + fx(e1.v, 3) + '\\ \\text{m/s}' },
          { text: 'Aceleración centrípeta, por las dos fórmulas.', math: 'a_c = \\omega^2 r = \\frac{v^2}{r} = ' + fx(e1.ac, 2) + '\\ \\text{m/s}^2 \\approx ' + fx(e1.ac / 9.81, 1) + 'g' },
          { text: 'Periodo: 120 vueltas por minuto son 2 por segundo.', math: 'T = \\frac{2\\pi}{\\omega} = ' + fx(e1.T, 2) + '\\ \\text{s}' }
        ],
        answer: '$\\omega \\approx ' + fx(e1.w, 2) + '\\ \\text{rad/s}$, $v \\approx ' + fx(e1.v, 2) + '\\ \\text{m/s}$, $a_c \\approx ' + fx(e1.ac, 1) + '\\ \\text{m/s}^2$ y $T = ' + fx(e1.T, 2) + '\\ \\text{s}$.',
        verify: { lab: 'call', mod: 'circular', fn: 'uniform', args: [{ r: e1.r, rpm: e1.rpm }], values: { omega: e1.w, v: e1.v, ac: e1.ac, T: e1.T } }
      },
      {
        type: 'example', heading: 'Acelerar en una curva',
        problem: '<p>Un auto toma una curva de $' + e2.r + '\\ \\text{m}$ de radio a $' + e2.v + '\\ \\text{m/s}$ y en ese instante aumenta su rapidez a razón de $' + e2.at + '\\ \\text{m/s}^2$. ¿Cuánto vale su aceleración total?</p>',
        steps: [
          { text: 'La parte que cambia la dirección apunta al centro.', math: 'a_c = \\frac{v^2}{r} = \\frac{' + e2.v + '^2}{' + e2.r + '} = ' + fx(e2.ac) + '\\ \\text{m/s}^2' },
          { text: 'La parte que cambia la rapidez es <strong>tangencial</strong>: $a_t = dv/dt = ' + e2.at + '\\ \\text{m/s}^2$. Son perpendiculares, así que se combinan con Pitágoras.', math: 'a = \\sqrt{a_c^2 + a_t^2} = \\sqrt{' + fx(e2.ac) + '^2 + ' + e2.at + '^2} = ' + fx(e2.a, 3) + '\\ \\text{m/s}^2' }
        ],
        answer: '$a \\approx ' + fx(e2.a, 2) + '\\ \\text{m/s}^2$.',
        verify: { lab: 'call', mod: 'circular', fn: 'nonUniform', args: [e2.v, e2.r, e2.at], values: { ac: e2.ac, a: e2.a } }
      },
      {
        type: 'concept', heading: 'Velocidad relativa', short: 'Movimiento relativo',
        body: [
          'La velocidad depende de quién la mide. Si una lancha se mueve respecto al agua y el agua respecto a la orilla, la velocidad de la lancha respecto a la orilla es la <strong>suma vectorial</strong>: $$\\vec{v}_{L/O} = \\vec{v}_{L/A} + \\vec{v}_{A/O}$$',
          'Los subíndices se "encadenan": el de adentro se cancela. En una dimensión basta con los signos: dos trenes que se acercan a 30 y 40 km/h se ven entre sí acercándose a 70 km/h.',
          'El lab muestra el caso circular: una partícula que gira, vista desde un marco que avanza, ya no traza un círculo.'
        ],
        diagram: 'relative-river',
        caption: 'La lancha apunta a la otra orilla, pero la corriente la arrastra: avanza en diagonal.'
      },
      {
        type: 'example', heading: 'Cruzar un río',
        problem: '<p>Un río de $' + e3.w + '\\ \\text{m}$ de ancho corre a $' + e3.vc + '\\ \\text{m/s}$. Una lancha que va a $' + e3.vb + '\\ \\text{m/s}$ respecto al agua apunta directo a la otra orilla. ¿Cuánto tarda en cruzar, cuánto la arrastra la corriente y a qué rapidez se mueve respecto a la orilla?</p>',
        steps: [
          { text: 'El cruce solo depende de la velocidad perpendicular a la orilla, que es la de la lancha.', math: 't = \\frac{' + e3.w + '}{' + e3.vb + '} = ' + e3.t + '\\ \\text{s}' },
          { text: 'Durante ese tiempo, la corriente la arrastra río abajo.', math: 'x = v_c\\,t = (' + e3.vc + ')(' + e3.t + ') = ' + e3.drift + '\\ \\text{m}' },
          { text: 'Respecto a la orilla, las dos velocidades son perpendiculares.', math: 'v = \\sqrt{' + e3.vb + '^2 + ' + e3.vc + '^2} = ' + e3.speed + '\\ \\text{m/s}' }
        ],
        answer: 'Cruza en $' + e3.t + '\\ \\text{s}$, llega $' + e3.drift + '\\ \\text{m}$ río abajo y va a $' + e3.speed + '\\ \\text{m/s}$ respecto a la orilla.',
        verify: { lab: 'call', mod: 'relative', fn: 'river', args: [{ vb: e3.vb, vc: e3.vc, w: e3.w }], values: { t: e3.t, drift: e3.drift, speed: e3.speed } }
      },
      {
        type: 'example', heading: 'Cruzar en línea recta',
        problem: '<p>Otra lancha va a $' + e4.vb + '\\ \\text{m/s}$ respecto al agua en el mismo río ($' + e4.vc + '\\ \\text{m/s}$, $' + e4.w + '$ m). Quiere llegar justo enfrente. ¿Con qué ángulo contra la corriente debe apuntar y cuánto tarda?</p>',
        steps: [
          { text: 'La componente de la lancha contra la corriente debe anular la corriente.', math: 'v_b\\sin\\alpha = v_c \\;\\Rightarrow\\; \\sin\\alpha = \\frac{' + e4.vc + '}{' + e4.vb + '} \\;\\Rightarrow\\; \\alpha = ' + fx(e4.alpha, 2) + '^\\circ' },
          { text: 'Lo que queda para cruzar es la otra componente.', math: 'v_\\perp = \\sqrt{' + e4.vb + '^2 - ' + e4.vc + '^2} = ' + e4.s + '\\ \\text{m/s} \\qquad t = \\frac{' + e4.w + '}{' + e4.s + '} = ' + e4.t + '\\ \\text{s}' },
          { text: 'Si la corriente fuera más rápida que la lancha, no podría cruzar en línea recta.' }
        ],
        answer: 'Apunta $' + fx(e4.alpha, 1) + '^\\circ$ contra la corriente y tarda $' + e4.t + '\\ \\text{s}$.',
        verify: { lab: 'call', mod: 'relative', fn: 'riverStraight', args: [{ vb: e4.vb, vc: e4.vc, w: e4.w }], values: { alpha: e4.alpha, t: e4.t, speed: e4.s } }
      },
      {
        type: 'callout', heading: 'Tres trampas de esta sesión',
        body: [
          'La aceleración centrípeta no es una fuerza nueva: es lo que le pasa a la velocidad. En S11 verás qué fuerza la produce (fricción, tensión, la normal).',
          'Convierte rpm a rad/s antes de usar $v = \\omega r$: sin el $2\\pi$ el resultado sale 6.28 veces menor.',
          'En velocidad relativa, dibuja los vectores: los signos y las direcciones deciden si se suman o se restan.'
        ]
      }
    ],

    lab: {
      type: 'circular-vectors', title: 'Vectores que giran',
      intro: 'Cambia $\\omega$ y $r$ y pulsa "Girar": la velocidad siempre es tangente y la aceleración siempre apunta al centro. Abajo, el mismo movimiento visto desde un marco que avanza con velocidad $u$. Calcula $a_c$ a mano y compárala.',
      cfg: { start: { omega: 2, r: 1.5, u: 3 } }
    },

    formulas: [
      { label: 'Arco', tex: 's = r\\theta\\ \\ (\\theta\\ \\text{en rad})' },
      { label: 'Rapidez angular', tex: '\\omega = \\frac{2\\pi}{T} = 2\\pi f' },
      { label: 'rpm a rad/s', tex: '\\omega = \\text{rpm}\\cdot\\frac{2\\pi}{60}' },
      { label: 'Rapidez lineal', tex: 'v = \\omega r' },
      { label: 'Centrípeta', tex: 'a_c = \\frac{v^2}{r} = \\omega^2 r' },
      { label: 'Aceleración total', tex: 'a = \\sqrt{a_c^2 + a_t^2}' },
      { label: 'Velocidad relativa', tex: '\\vec{v}_{A/C} = \\vec{v}_{A/B} + \\vec{v}_{B/C}' }
    ],

    exercises: [
      {
        id: 'f1-s07-rpm', title: 'De rpm a rapidez',
        vars: { rpm: [30, 600, 30], r: [0.05, 0.5, 0.05] },
        prompt: function (v) { return '<p>La rueda de un robot de $' + v.r + '\\ \\text{m}$ de radio gira a $' + v.rpm + '$ rpm. ¿A qué rapidez avanza el borde de la rueda?</p>'; },
        check: 'numeric', unit: 'm/s',
        answer: function (v) { return v.rpm * TAU / 60 * v.r; },
        mistakes: { no2pi: function (v) { return v.rpm / 60 * v.r; } },
        feedback: [{ when: 'no2pi', say: 'Te faltó el $2\\pi$: una vuelta son $2\\pi$ rad, así que $\\omega = \\text{rpm}\\cdot 2\\pi/60$.' }],
        oracle: { lab: 'call', mod: 'circular', fn: 'uniform', field: 'v', args: function (v) { return [{ r: v.r, rpm: v.rpm }]; } },
        hint: 'Primero $\\omega$ en rad/s y luego $v = \\omega r$.',
        solution: function (v) { var w = v.rpm * TAU / 60; return '$$\\omega = ' + v.rpm + '\\cdot\\frac{2\\pi}{60} = ' + fx(w, 3) + '\\ \\text{rad/s} \\qquad v = (' + fx(w, 3) + ')(' + v.r + ') = ' + fx(w * v.r, 3) + '\\ \\text{m/s}$$'; }
      },
      {
        id: 'f1-s07-centripeta', title: 'Aceleración centrípeta',
        vars: { v: [2, 30, 1], r: [1, 50, 1] },
        prompt: function (v) { return '<p>Un carrito recorre una pista circular de $' + v.r + '\\ \\text{m}$ de radio a $' + v.v + '\\ \\text{m/s}$ constantes. ¿Cuánto vale su aceleración?</p>'; },
        check: 'numeric', unit: 'm/s²',
        answer: function (v) { return v.v * v.v / v.r; },
        mistakes: { noSquare: function (v) { return v.v / v.r; } },
        feedback: [{ when: 'noSquare', say: 'Falta el cuadrado: $a_c = v^2/r$. ($v/r$ es la rapidez angular $\\omega$.)' }],
        oracle: { lab: 'call', mod: 'circular', fn: 'uniform', field: 'ac', args: function (v) { return [{ r: v.r, v: v.v }]; } },
        hint: 'Aunque la rapidez es constante, la dirección cambia: $a_c = v^2/r$.',
        solution: function (v) { return '$$a_c = \\frac{v^2}{r} = \\frac{' + v.v + '^2}{' + v.r + '} = ' + fx(v.v * v.v / v.r, 3) + '\\ \\text{m/s}^2$$'; }
      },
      {
        id: 'f1-s07-periodo', title: 'Centrípeta desde el periodo',
        vars: { T: [0.5, 10, 0.5], r: [0.5, 10, 0.5] },
        prompt: function (v) { return '<p>Una partícula da una vuelta cada $' + v.T + '\\ \\text{s}$ en un círculo de $' + v.r + '\\ \\text{m}$. ¿Cuál es su aceleración centrípeta?</p>'; },
        check: 'numeric', unit: 'm/s²',
        answer: function (v) { return 4 * Math.PI * Math.PI * v.r / (v.T * v.T); },
        mistakes: { omegaInvT: function (v) { return v.r / (v.T * v.T); } },
        feedback: [{ when: 'omegaInvT', say: 'Usaste $\\omega = 1/T$; es $\\omega = 2\\pi/T$, así que falta un factor $4\\pi^2$.' }],
        oracle: { lab: 'call', mod: 'circular', fn: 'uniform', field: 'ac', args: function (v) { return [{ r: v.r, T: v.T }]; } },
        hint: '$\\omega = 2\\pi/T$ y $a_c = \\omega^2 r$.',
        solution: function (v) { var w = TAU / v.T; return '$$\\omega = \\frac{2\\pi}{' + v.T + '} = ' + fx(w, 4) + '\\ \\text{rad/s} \\qquad a_c = \\omega^2 r = ' + fx(w * w * v.r, 3) + '\\ \\text{m/s}^2$$'; }
      },
      {
        id: 'f1-s07-trenes', title: 'Trenes que se cruzan',
        vars: { vA: [10, 40, 1], vB: [10, 40, 1] },
        prompt: function (v) { return '<p>Dos trenes van en vías paralelas en sentidos opuestos: uno a $' + v.vA + '\\ \\text{m/s}$ y el otro a $' + v.vB + '\\ \\text{m/s}$ respecto al suelo. ¿Con qué rapidez ve un pasajero del primero pasar al segundo?</p>'; },
        check: 'numeric', unit: 'm/s',
        answer: function (v) { return v.vA + v.vB; },
        baseWhere: function (v) { return v.vA !== v.vB; },
        mistakes: { subtracted: function (v) { return Math.abs(v.vA - v.vB); } },
        feedback: [{ when: 'subtracted', say: 'Restaste. Van en sentidos opuestos: con signos, $v_{2/1} = v_2 - v_1 = (-v_B) - v_A$, de magnitud $v_A + v_B$.' }],
        oracle: { lab: 'call', mod: 'relative', fn: 'sub', field: '0', args: function (v) { return [[v.vA, 0], [-v.vB, 0]]; } },
        hint: 'Pon un sentido positivo y resta las velocidades con sus signos.',
        solution: function (v) { return '$$v_{2/1} = v_2 - v_1 = (-' + v.vB + ') - (' + v.vA + ') = -' + (v.vA + v.vB) + '\\ \\text{m/s}$$ El pasajero lo ve pasar a $' + (v.vA + v.vB) + '$ m/s.'; }
      },
      {
        id: 'f1-s07-rio', title: 'Arrastre de la corriente',
        vars: { vb: [2, 8, 0.5], vc: [0.5, 4, 0.5], w: [20, 200, 10] },
        prompt: function (v) { return '<p>Un nadador cruza un río de $' + v.w + '\\ \\text{m}$ nadando a $' + v.vb + '\\ \\text{m/s}$ perpendicular a la orilla, pero la corriente va a $' + v.vc + '\\ \\text{m/s}$. ¿Cuántos metros río abajo llega?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return v.vc * v.w / v.vb; },
        baseWhere: function (v) { return v.vb !== v.vc; },
        mistakes: { swapped: function (v) { return v.vb * v.w / v.vc; } },
        feedback: [{ when: 'swapped', say: 'Intercambiaste las velocidades. El tiempo de cruce es $w/v_{nadador}$; en ese tiempo la corriente lo arrastra $v_c\\,t$.' }],
        oracle: { lab: 'call', mod: 'relative', fn: 'river', field: 'drift', args: function (v) { return [{ vb: v.vb, vc: v.vc, w: v.w }]; } },
        hint: 'Primero el tiempo de cruce con la velocidad perpendicular; luego lo que avanza la corriente en ese tiempo.',
        solution: function (v) { var t = v.w / v.vb; return '$$t = \\frac{' + v.w + '}{' + v.vb + '} = ' + fx(t, 3) + '\\ \\text{s} \\qquad x = (' + v.vc + ')(' + fx(t, 3) + ') = ' + fx(v.vc * t, 3) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s07-total', title: 'Aceleración total en una curva',
        vars: { v: [5, 25, 1], r: [10, 100, 5], at: [1, 6, 0.5] },
        prompt: function (v) { return '<p>Una moto toma una curva de $' + v.r + '\\ \\text{m}$ de radio a $' + v.v + '\\ \\text{m/s}$ y frena a razón de $' + v.at + '\\ \\text{m/s}^2$. ¿Cuánto vale su aceleración total?</p>'; },
        check: 'numeric', unit: 'm/s²',
        answer: function (v) { var c = v.v * v.v / v.r; return Math.sqrt(c * c + v.at * v.at); },
        mistakes: { added: function (v) { return v.v * v.v / v.r + v.at; } },
        feedback: [{ when: 'added', say: 'Sumaste las magnitudes. $a_c$ y $a_t$ son perpendiculares: $a = \\sqrt{a_c^2 + a_t^2}$.' }],
        oracle: { lab: 'call', mod: 'circular', fn: 'nonUniform', field: 'a', args: function (v) { return [v.v, v.r, v.at]; } },
        hint: 'Calcula $a_c = v^2/r$; la tangencial es la que cambia la rapidez.',
        solution: function (v) { var c = v.v * v.v / v.r; return '$$a_c = \\frac{' + v.v + '^2}{' + v.r + '} = ' + fx(c, 3) + ' \\qquad a = \\sqrt{' + fx(c, 3) + '^2 + ' + v.at + '^2} = ' + fx(Math.sqrt(c * c + v.at * v.at), 3) + '\\ \\text{m/s}^2$$'; }
      },
      {
        id: 'f1-s07-direccion', title: 'Concepto: hacia dónde acelera',
        vars: {},
        prompt: function () { return '<p>Un objeto recorre un círculo con rapidez constante. ¿Hacia dónde apunta su aceleración?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Hacia el centro del círculo', correct: true },
            { text: 'No tiene aceleración', say: 'La rapidez es constante, pero la dirección de la velocidad cambia: sí acelera.' },
            { text: 'Tangente al círculo, como la velocidad', say: 'Una aceleración tangente cambiaría la rapidez, y aquí es constante.' },
            { text: 'Hacia afuera del círculo', say: 'La "fuerza centrífuga" es una sensación en el marco que gira; la aceleración real apunta al centro.' }
          ];
        },
        answer: function () { return 'Hacia el centro del círculo'; },
        hint: 'Dibuja la velocidad en dos puntos cercanos y réstalas.',
        solution: function () { return '$\\Delta\\vec{v}$ entre dos instantes cercanos apunta al centro, así que $\\vec{a}$ es centrípeta, de magnitud $v^2/r$.'; }
      }
    ],

    quiz: { tags: ['f1.S07'], count: 8 },

    errors: [
      'Pensar que con rapidez constante no hay aceleración.',
      'Usar rpm directamente en $v = \\omega r$ sin convertir a rad/s.',
      'Escribir $a_c = v/r$ (falta el cuadrado).',
      'Sumar $a_c$ y $a_t$ como números en lugar de con Pitágoras.',
      'Sumar velocidades relativas sin fijarse en los sentidos.'
    ],

    teacher: {
      plan: [
        'rpm, periodo y $\\omega$ con una rueda real o un ventilador.',
        'Explainer de $\\Delta\\vec{v}$: la aceleración centrípeta sale de restar vectores (S02).',
        'Lab: que noten que $a_c$ se cuadruplica al duplicar $\\omega$; luego el marco en movimiento y el río.'
      ],
      check: [
        'Que dibujen $\\vec{v}$ y $\\vec{a}$ en al menos dos puntos del círculo.',
        'Que etiqueten cada velocidad relativa con "de quién respecto a quién".'
      ],
      note: 'La dinámica circular (qué fuerza produce $a_c$) se ve en S11.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 1</em>, §4.4 “Uniform Circular Motion”. <a href="https://openstax.org/books/university-physics-volume-1/pages/4-4-uniform-circular-motion">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §4.5 “Relative Motion in One and Two Dimensions”. <a href="https://openstax.org/books/university-physics-volume-1/pages/4-5-relative-motion-in-one-and-two-dimensions">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-06',
    next: 'sesion-08'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
