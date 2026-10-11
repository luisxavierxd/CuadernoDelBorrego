/* =====================================================================
   Física 2 · S07 · Flujo eléctrico (bloque B · Gauss y capacitores).
   Fuente: OpenStax, University Physics Volume 2, §6.1 (CC BY-NC-SA 4.0).
   ε₀ = 8.85 × 10⁻¹² C²/(N·m²), k = 8.99 × 10⁹ N·m²/C², SI.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.flux (lab flux-surface).
   ===================================================================== */
(function () {
  var EPS0 = 8.85e-12, k = 8.99e9, RAD = Math.PI / 180;
  var EPT = '$\\varepsilon_0 = 8.85\\times 10^{-12}\\ \\text{C}^2/(\\text{N}\\cdot\\text{m}^2)$';
  var KTX = '$k = 8.99\\times 10^{9}\\ \\text{N}\\cdot\\text{m}^2/\\text{C}^2$';
  var U = '\\ \\text{N}\\cdot\\text{m}^2/\\text{C}';
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function sq(x) { return (x < 0 ? '-' : '') + Math.abs(x); }
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (m) { return ex.mistakes[m](v); }));
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) {
          if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]))) return false;
        }
      }
      return true;
    };
  }
  // Caras del cubo (lado a, una esquina en el origen): nombre, componente de E y signo de la normal.
  var CUBE = [['la cara izquierda, en $x = 0$', 0, -1], ['la cara derecha, en $x = a$', 0, 1], ['la cara de enfrente, en $y = 0$', 1, -1],
    ['la cara de atrás, en $y = a$', 1, 1], ['la cara de abajo, en $z = 0$', 2, -1], ['la cara de arriba, en $z = a$', 2, 1]];
  function Evec(v) { return [v.Ex, v.Ey, v.Ez]; }
  function vecTex(v) {
    var s = '', parts = [[v.Ex, '\\hat{\\imath}'], [v.Ey, '\\hat{\\jmath}'], [v.Ez, '\\hat{k}']];
    parts.forEach(function (p) {
      if (!p[0]) return;
      s += (s ? (p[0] < 0 ? ' - ' : ' + ') : (p[0] < 0 ? '-' : '')) + Math.abs(p[0]) + '\\,' + p[1];
    });
    return '(' + (s || '0') + ')\\ \\text{N/C}';
  }
  // Flujo que se muestra en el ejercicio del ángulo (redondeado a 2 decimales).
  function shownPhi(v) { return +(v.E * v.a * v.a * 1e-4 * Math.cos(v.th * RAD)).toFixed(2); }

  // Ejemplo 1: rectángulo inclinado.
  var e1 = { E: 1500, a: 20, b: 30, beta: 30 }; e1.A = e1.a * e1.b / 1e4; e1.th = 90 - e1.beta; e1.phi = e1.E * e1.A * Math.cos(e1.th * RAD);
  // Ejemplo 2: cubo de 10 cm en E = (300 î + 400 k̂) N/C.
  var e2 = { a: 0.10, E: [300, 0, 400] }; e2.A = e2.a * e2.a;
  e2.f = { x0: -300 * e2.A, xa: 300 * e2.A, z0: -400 * e2.A, za: 400 * e2.A };
  // Ejemplo 3: prisma (b = 30 cm, h = 40 cm, w = 20 cm) en E = 600 î N/C.
  var e3 = { E: 600, b: 0.30, h: 0.40, w: 0.20 }; e3.L = Math.hypot(e3.b, e3.h); e3.wall = -e3.E * e3.h * e3.w;
  e3.cos = e3.h / e3.L; e3.slant = e3.E * e3.L * e3.w * e3.cos;
  // Ejemplo 4: E = c x î por un cuadrado de 0.50 m en x = 2.0 m.
  var e4 = { c: 200, a: 2, s: 0.5 }; e4.phi = e4.c * e4.a * e4.s * e4.s;
  // Ejemplo 5: carga de 3.0 nC dentro de esferas de 5 cm y 50 cm.
  var e5 = { q: 3e-9 }; e5.phi = e5.q / EPS0;

  var data = window.SESSION_DATA = {
    slug: 'sesion-07', number: '07', group: 'B · Gauss y capacitores',
    title: 'Flujo eléctrico', temario: [],
    minutes: 180,
    quote: 'El flujo cuenta cuántas líneas de campo atraviesan una superficie, y en qué sentido.',
    badges: [
      'Describir una superficie con su vector área $\\vec A = A\\,\\hat n$ y usar la normal hacia afuera en superficies cerradas.',
      'Calcular el flujo de un campo uniforme por una superficie plana: $\\Phi = \\vec E\\cdot\\vec A = EA\\cos\\theta$.',
      'Sumar el flujo cara por cara en un cubo o un prisma y ver que en un campo uniforme el total es cero.',
      'Plantear y resolver $\\Phi = \\int \\vec E\\cdot d\\vec A$ cuando el campo cambia sobre la superficie.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'El <strong>flujo eléctrico</strong> mide cuánto campo atraviesa una superficie. Depende de qué tan fuerte es el campo, del tamaño de la superficie y de cómo está inclinada.',
        recall: [
          'Producto escalar: $\\vec a\\cdot\\vec b = ab\\cos\\theta$ (<a href="../../../fisica-1/sesiones/sesion-03/">Física 1 · S03</a>).',
          'Campo eléctrico y líneas de campo; campo uniforme entre placas (<a href="../sesion-03/">S03</a>).',
          'Campo de una carga puntual, $E = kq/r^2$ (S03), y la integral como suma de pedacitos (S04).'
        ],
        why: 'El flujo es la pieza central de la ley de Gauss (la siguiente sesión), que da en dos renglones el campo de esferas, cables y placas cargadas. La misma idea mide cuánta luz llega a un panel solar inclinado o cuánta agua pasa por un tubo.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Sostén un aro bajo la lluvia que cae derecho. Si lo pones horizontal, «de frente» a la lluvia, por él pasan muchísimas gotas. Si lo inclinas, pasan menos. Y si lo pones vertical, de canto, no pasa ninguna: las gotas resbalan a su lado.',
          'Con una ventana pasa igual: entra más aire si el viento le pega de frente que si le llega de lado. Y si la ventana es más grande o el viento más fuerte, entra más.',
          'El flujo eléctrico es esa misma cuenta con las líneas de campo: <strong>cuántas líneas atraviesan</strong> la superficie. Importan tres cosas: qué tan juntas vienen las líneas (la magnitud de $E$), el tamaño de la superficie ($A$) y su inclinación.'
        ],
        diagram: 'f2s07-hoop',
        caption: 'El mismo aro bajo la misma lluvia: lo que cambia es cuántas gotas lo cruzan según su inclinación.'
      },
      {
        type: 'concept', heading: 'El vector área', short: 'Vector área',
        body: [
          'Para decir «cómo está inclinada» una superficie plana se usa su <strong>normal</strong> $\\hat n$: un vector unitario perpendicular a ella. El <strong>vector área</strong> junta tamaño y orientación: $$\\vec A = A\\,\\hat n$$ Su magnitud es el área y su dirección es perpendicular a la superficie.',
          'Una superficie abierta tiene dos normales posibles (dos caras); tú eliges una y con ella defines el signo del flujo. En una <strong>superficie cerrada</strong> (una caja, una esfera) la convención es fija: la normal apunta siempre <strong>hacia afuera</strong>.'
        ],
        diagram: 'f2s07-area-vector',
        caption: 'Izquierda: el vector área es perpendicular a la superficie. Derecha: en una caja cerrada cada cara tiene su normal hacia afuera.'
      },
      {
        type: 'explainer', heading: 'Flujo de un campo uniforme por una superficie plana', short: 'Φ = EA cos θ',
        title: 'Gira la superficie en el campo',
        intro: 'El campo es uniforme (mismas líneas, igual de juntas, en todos lados). Gira la superficie y cuenta las líneas que la cruzan. Si $\\theta$ es el ángulo entre $\\vec E$ y la normal $\\hat n$: $$\\Phi = \\vec E\\cdot\\vec A = EA\\cos\\theta\\qquad [\\Phi] = \\text{N}\\cdot\\text{m}^2/\\text{C}$$',
        diagram: 'f2s07-tilt',
        steps: [
          { text: 'La normal apunta igual que el campo ($\\theta = 0$): la superficie está de frente y todas las líneas la cruzan. El flujo es el máximo, $\\Phi = EA$.', state: { th: 0, k: 1 } },
          { text: 'Con $\\theta = 60°$ la superficie le «presenta» al campo solo su sombra, de altura $A\\cos\\theta$ (la barra verde de la derecha). Cruzan la mitad de las líneas: $\\Phi = EA\\cos 60° = EA/2$.', state: { th: 60, k: 2 } },
          { text: 'Error clásico: el ángulo de $30°$ entre el campo y la <strong>superficie</strong> no es $\\theta$. El ángulo con la normal es $\\theta = 90° - 30° = 60°$. Si usas $\\cos 30°$ te sale casi el doble de lo que es.', state: { th: 60, k: 3 } },
          { text: 'Con $\\theta = 90°$ la superficie está de canto: el campo corre paralelo a ella y ninguna línea la atraviesa. $\\Phi = EA\\cos 90° = 0$.', state: { th: 90, k: 4 } },
          { text: 'Si sigues girando ($\\theta > 90°$), las líneas la cruzan en contra de $\\hat n$ y el coseno es negativo: $\\Phi < 0$. El signo dice de qué lado a qué lado cruza el campo.', state: { th: 135, k: 5 } }
        ]
      },
      {
        type: 'callout', heading: 'θ se mide con la normal',
        body: [
          'En $\\Phi = EA\\cos\\theta$, $\\theta$ es el ángulo entre $\\vec E$ y $\\hat n$, <strong>no</strong> entre $\\vec E$ y la superficie. Si el problema te da el ángulo $\\beta$ con la superficie, entonces $\\theta = 90° - \\beta$ y $\\Phi = EA\\sin\\beta$.',
          'El signo: <strong>positivo</strong> si el campo cruza en el sentido de $\\hat n$ ($\\theta < 90°$), <strong>cero</strong> si corre paralelo a la superficie ($\\theta = 90°$) y <strong>negativo</strong> si cruza en contra ($\\theta > 90°$). Y el área va en m²: $1\\ \\text{cm}^2 = 10^{-4}\\ \\text{m}^2$.'
        ]
      },
      {
        type: 'explainer', heading: 'Superficies cerradas: cara por cara', short: 'Superficies cerradas',
        title: 'Un cubo en un campo uniforme',
        intro: 'Para una superficie cerrada se suma el flujo de cada cara, con la normal de cada una hacia afuera: $\\Phi = \\oint \\vec E\\cdot d\\vec A$ (el círculo en la integral significa «superficie cerrada»). Veamos un cubo de cara $A$ en un campo uniforme que lo atraviesa.',
        diagram: 'f2s07-cube',
        steps: [
          { text: 'Por la cara de la izquierda el campo <strong>entra</strong>. Su normal (hacia afuera) apunta contra $\\vec E$: $\\theta = 180°$ y $\\Phi = -EA$.', state: { k: 1 } },
          { text: 'Por la cara de la derecha el campo <strong>sale</strong>. Su normal apunta con $\\vec E$: $\\theta = 0$ y $\\Phi = +EA$.', state: { k: 2 } },
          { text: 'Las otras cuatro caras son paralelas al campo: sus normales forman $90°$ con $\\vec E$ y su flujo es cero.', state: { k: 3 } },
          { text: 'Total: $-EA + EA + 0 = 0$. Toda línea que entra, sale. Sin carga adentro, el flujo neto por la superficie cerrada es cero.', state: { k: 4 } }
        ]
      },
      {
        type: 'concept', heading: 'Con caras inclinadas también da cero', short: 'El prisma',
        body: [
          'Un prisma triangular en un campo horizontal $E$: el campo entra por la pared vertical (alto $h$, fondo $w$) con $\\Phi = -Ehw$. Sale por la cara inclinada, de largo $L = \\sqrt{b^2 + h^2}$; su normal forma un ángulo con $\\vec E$ de coseno $h/L$, así que $\\Phi = E(Lw)(h/L) = +Ehw$.',
          'La base y los dos triángulos de los lados son paralelos al campo: flujo cero. El total vuelve a ser cero. La cara inclinada es más grande, pero está inclinada justo lo necesario: su «sombra» vista desde el campo es la misma pared $h \\times w$.',
          'Con un cilindro cuyo eje va a lo largo del campo pasa igual: una tapa da $-E\\pi R^2$, la otra $+E\\pi R^2$ y la pared curva, paralela al campo, cero.'
        ],
        diagram: 'f2s07-prism',
        caption: 'Las líneas que entran por la pared salen por la cara inclinada. La base es paralela al campo.'
      },
      {
        type: 'explainer', heading: 'Cuando el campo no es uniforme', short: 'Campo no uniforme',
        title: 'Partir la superficie en franjas',
        intro: 'Si $\\vec E$ cambia de un punto a otro de la superficie, ya no sirve multiplicar $EA$. Se parte la superficie en pedacitos $d\\vec A$ donde $\\vec E$ casi no cambia, y se suman: $$\\Phi = \\int \\vec E\\cdot d\\vec A$$ Ejemplo: un cuadrado de lado $s$ en el plano de la hoja y un campo $\\vec E = c\\,y\\,\\hat\\imath$ que sale de la hoja y crece con la altura.',
        diagram: 'f2s07-strips',
        steps: [
          { text: 'El campo sale de la hoja (perpendicular al cuadrado, así que $\\theta = 0$), pero vale más arriba que abajo: $E = cy$. Es cero en $y = 0$.', state: { k: 1 } },
          { text: 'Toma una franja horizontal de alto $dy$ y largo $L$: en toda ella $y$ es el mismo, así que $E$ es constante. Su área es $dA = L\\,dy$.', state: { k: 2 } },
          { text: 'El flujo por la franja es campo por área: $d\\Phi = E\\,dA = c\\,y\\,L\\,dy$.', state: { k: 3 } },
          { text: 'Suma todas las franjas, de $y = 0$ a $y = s$: $$\\Phi = \\int_0^s c\\,y\\,L\\,dy = \\frac{cLs^2}{2}$$ Con $L = s$ (un cuadrado), $\\Phi = cs^3/2$. Las unidades de $c$ son N/(C·m), así que $\\Phi$ sale en N·m²/C.', state: { k: 4 } }
        ]
      },
      {
        type: 'concept', heading: 'Un adelanto: la carga puntual y la esfera', short: 'Adelanto de Gauss',
        body: [
          'Encierra una carga puntual $q$ en una esfera de radio $r$ con la carga en el centro. En toda la esfera $E = kq/r^2$ apunta hacia afuera, igual que la normal ($\\theta = 0$), así que el flujo es campo por área: $$\\Phi = \\frac{kq}{r^2}\\cdot 4\\pi r^2 = 4\\pi k q = \\frac{q}{\\varepsilon_0}$$ (porque $k = 1/4\\pi\\varepsilon_0$, con $\\varepsilon_0 = 8.85\\times 10^{-12}\\ \\text{C}^2/(\\text{N}\\cdot\\text{m}^2)$).',
          '¡El radio se canceló! Una esfera más grande tiene un campo más débil en su superficie ($1/r^2$) pero más área ($r^2$): las mismas líneas la cruzan. El flujo solo depende de la carga encerrada. Esa es la ley de Gauss, que desarrollamos en la siguiente sesión.'
        ],
        diagram: 'f2s07-gauss',
        caption: 'La esfera grande tiene el campo cuatro veces más débil y el área cuatro veces mayor: la cruzan las mismas líneas.'
      },
      {
        type: 'recipe', heading: 'Receta: calcular un flujo', short: 'Receta',
        steps: [
          { text: 'Dibuja la superficie y su normal $\\hat n$. Si es cerrada, la normal de cada cara apunta hacia afuera.' },
          { text: 'Encuentra $\\theta$, el ángulo entre $\\vec E$ y $\\hat n$.', tip: 'Si te dan el ángulo con la superficie, $\\theta = 90°$ menos ese ángulo. Usar el de la superficie cambia el coseno por el seno.' },
          { text: 'Pasa el área a m²: $1\\ \\text{cm}^2 = 10^{-4}\\ \\text{m}^2$. Un rectángulo de $20\\ \\text{cm} \\times 30\\ \\text{cm}$ es $0.06\\ \\text{m}^2$, no 600.' },
          { text: 'Campo uniforme: $\\Phi = EA\\cos\\theta$ (o $\\vec E\\cdot\\vec A$ con componentes). Campo que cambia: parte en franjas donde $E$ sea constante y calcula $\\int \\vec E\\cdot d\\vec A$.', tip: 'Cuida el signo: el campo que entra a una superficie cerrada da flujo negativo.' },
          { text: 'Superficie cerrada: suma cara por cara con signo. En un campo uniforme (sin carga adentro) el total debe dar cero: úsalo para revisar.' }
        ]
      },
      {
        type: 'example', heading: 'Rectángulo inclinado',
        problem: '<p>Un campo uniforme de $' + e1.E + '\\ \\text{N/C}$ atraviesa un rectángulo de $' + e1.a + '\\ \\text{cm} \\times ' + e1.b + '\\ \\text{cm}$. El plano del rectángulo forma un ángulo de $' + e1.beta + '°$ con el campo. ¿Cuál es el flujo?</p>',
        steps: [
          { text: 'Área en m²: $A = (0.20)(0.30) = ' + fx(e1.A) + '\\ \\text{m}^2$.' },
          { text: 'El $' + e1.beta + '°$ es con la superficie. Con la normal: $\\theta = 90° - ' + e1.beta + '° = ' + e1.th + '°$.' },
          { text: 'Aplica $\\Phi = EA\\cos\\theta$.', math: '\\Phi = (' + e1.E + ')(' + fx(e1.A) + ')\\cos ' + e1.th + '° = ' + fx(e1.phi) + U },
          { text: 'Si hubieras usado $\\cos 30°$ te saldría $' + fx(e1.E * e1.A * Math.cos(30 * RAD)) + '$: casi el doble.' }
        ],
        answer: '$\\Phi = ' + fx(e1.phi) + U + '$.',
        verify: { lab: 'call', mod: 'flux', fn: 'uniform', args: [e1.E, e1.A, e1.th], value: e1.phi }
      },
      {
        type: 'example', heading: 'Las seis caras de un cubo',
        problem: '<p>Un cubo de $10\\ \\text{cm}$ de lado tiene una esquina en el origen y sus aristas sobre los ejes positivos. Está en el campo uniforme $\\vec E = (300\\,\\hat\\imath + 400\\,\\hat k)\\ \\text{N/C}$. Calcula el flujo por cada cara y el total.</p>',
        steps: [
          { text: 'Cada cara mide $A = (0.10)^2 = 0.01\\ \\text{m}^2$. Con la normal hacia afuera, $\\Phi = \\vec E\\cdot\\hat n\\,A$ toma solo la componente de $\\vec E$ perpendicular a la cara, con signo.' },
          { text: 'Caras $x = 0$ ($\\hat n = -\\hat\\imath$) y $x = a$ ($\\hat n = +\\hat\\imath$).', math: '\\Phi_{x=0} = -(300)(0.01) = ' + fx(e2.f.x0) + U + '\\qquad \\Phi_{x=a} = +' + fx(e2.f.xa) + U },
          { text: 'Caras $z = 0$ y $z = a$.', math: '\\Phi_{z=0} = -(400)(0.01) = ' + fx(e2.f.z0) + U + '\\qquad \\Phi_{z=a} = +' + fx(e2.f.za) + U },
          { text: 'Caras $y = 0$ y $y = a$: $\\vec E$ no tiene componente $y$, así que su flujo es cero.' },
          { text: 'Total: $-3 + 3 - 4 + 4 + 0 + 0 = 0$. Lo que entra por la izquierda y por abajo sale por la derecha y por arriba.' }
        ],
        answer: '$\\pm 3$ y $\\pm 4\\ \\text{N}\\cdot\\text{m}^2/\\text{C}$ en las caras $x$ y $z$, cero en las caras $y$; el total es $0$.',
        verify: { lab: 'call', mod: 'flux', fn: 'closed', args: ['cube', e2.E, { a: e2.a }], values: { 'faces.0.flux': e2.f.x0, 'faces.1.flux': e2.f.xa, 'faces.4.flux': e2.f.z0, 'faces.5.flux': e2.f.za, total: 0 } }
      },
      {
        type: 'example', heading: 'Un prisma con una cara inclinada',
        problem: '<p>Un prisma triangular tiene la base de $30\\ \\text{cm}$ sobre el piso (a lo largo del campo), una pared vertical de $40\\ \\text{cm}$ y $20\\ \\text{cm}$ de fondo. El campo es horizontal, $E = ' + e3.E + '\\ \\text{N/C}$, y entra por la pared. ¿Cuál es el flujo por la pared y por la cara inclinada?</p>',
        diagram: 'f2s07-prism',
        steps: [
          { text: 'Pared: área $(0.40)(0.20) = 0.08\\ \\text{m}^2$, normal hacia afuera contra $\\vec E$.', math: '\\Phi_{pared} = -(600)(0.08) = ' + fx(e3.wall) + U },
          { text: 'Cara inclinada: largo $L = \\sqrt{0.30^2 + 0.40^2} = 0.50$ m, área $(0.50)(0.20) = 0.10\\ \\text{m}^2$. El coseno entre su normal y $\\vec E$ es $h/L = 0.8$.', math: '\\Phi_{incl} = (600)(0.10)(0.8) = ' + fx(e3.slant) + U },
          { text: 'Base y triángulos: paralelos al campo, flujo cero. Total: $-48 + 48 = 0$, como debe ser.' }
        ],
        answer: '$\\Phi_{pared} = ' + fx(e3.wall) + U + '$ y $\\Phi_{incl} = +' + fx(e3.slant) + U + '$.',
        verify: { lab: 'call', mod: 'flux', fn: 'closed', args: ['prism', [e3.E, 0, 0], { b: e3.b, h: e3.h, w: e3.w }], values: { 'faces.1.flux': e3.wall, 'faces.2.flux': e3.slant, total: 0 } }
      },
      {
        type: 'example', heading: 'Un campo que crece con x',
        problem: '<p>El campo $\\vec E = c\\,x\\,\\hat\\imath$, con $c = ' + e4.c + '\\ \\text{N/(C}\\cdot\\text{m)}$, atraviesa un cuadrado de $' + fx(e4.s) + '\\ \\text{m}$ de lado colocado en el plano $x = ' + fx(e4.a, 1) + '\\ \\text{m}$, con la normal en $+\\hat\\imath$. ¿Cuál es el flujo?</p>',
        steps: [
          { text: 'Sobre el cuadrado todos los puntos tienen $x = ' + fx(e4.a, 1) + '$ m: ahí el campo <strong>sí</strong> es uniforme.', math: 'E = c\\,x = (' + e4.c + ')(' + fx(e4.a, 1) + ') = ' + e4.c * e4.a + '\\ \\text{N/C}' },
          { text: 'Es perpendicular al cuadrado ($\\theta = 0$).', math: '\\Phi = EA = (' + e4.c * e4.a + ')(' + fx(e4.s) + ')^2 = ' + fx(e4.phi) + U },
          { text: 'Si mueves el cuadrado a $x = 3$ m, el flujo sube a $' + fx(e4.c * 3 * e4.s * e4.s) + '$: el campo cambia de un lugar a otro, aunque no sobre este cuadrado.' }
        ],
        answer: '$\\Phi = ' + fx(e4.phi) + U + '$.',
        verify: { lab: 'call', mod: 'flux', fn: 'linearX', args: [e4.c, e4.a, e4.s], value: e4.phi }
      },
      {
        type: 'example', heading: 'Una carga dentro de dos esferas',
        problem: '<p>Una carga de $3.0\\ \\text{nC}$ está en el centro de una esfera de $5\\ \\text{cm}$ de radio. ¿Cuál es el flujo por la esfera? ¿Y por una de $50\\ \\text{cm}$? (' + EPT + ', ' + KTX + '.)</p>',
        steps: [
          { text: 'En la esfera de 5 cm el campo es $E = kq/r^2$ y apunta hacia afuera, igual que la normal.', math: 'E = \\frac{(8.99\\times 10^{9})(3.0\\times 10^{-9})}{0.05^2} = ' + fx(k * e5.q / 0.0025, 0) + '\\ \\text{N/C}' },
          { text: 'Flujo = campo por área de la esfera.', math: '\\Phi = E\\,(4\\pi r^2) = (' + fx(k * e5.q / 0.0025, 0) + ')(4\\pi)(0.05)^2 \\approx ' + fx(k * e5.q * 4 * Math.PI, 1) + U },
          { text: 'Más directo: $\\Phi = q/\\varepsilon_0$, sin importar el radio. (La pequeña diferencia viene de redondear $k$ y $\\varepsilon_0$).', math: '\\Phi = \\frac{3.0\\times 10^{-9}}{8.85\\times 10^{-12}} = ' + fx(e5.phi) + U },
          { text: 'Con $r = 50$ cm el campo es 100 veces más débil y el área 100 veces mayor: el mismo flujo.' }
        ],
        answer: '$\\Phi \\approx ' + fx(e5.phi, 0) + U + '$ en las dos esferas.',
        verify: { lab: 'call', mod: 'flux', fn: 'gaussFlux', args: [e5.q], value: e5.phi }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué coseno y no seno?', a: 'Porque $\\theta$ se mide con la normal. Con $\\theta = 0$ la superficie está de frente y el flujo es máximo, y $\\cos 0 = 1$. Si te dan el ángulo con la superficie, ahí sí te queda un seno.' },
          { q: '¿El flujo es un vector?', a: 'No. Es un escalar con signo: $\\vec E\\cdot\\vec A$ es un producto punto. El signo dice si el campo cruza a favor o en contra de la normal.' },
          { q: 'Si el flujo total por una caja es cero, ¿el campo adentro es cero?', a: 'No. En un cubo dentro de un campo uniforme hay campo en todos lados; el total es cero porque lo que entra por un lado sale por otro.' },
          { q: '¿Cuál normal elijo en una superficie abierta?', a: 'La que quieras, pero dila: cambiarla solo cambia el signo del flujo. En superficies cerradas no se elige: siempre hacia afuera.' },
          { q: '¿Qué significa «el flujo es el número de líneas»?', a: 'Si dibujas las líneas con una densidad proporcional a $E$ (más juntas donde el campo es más fuerte), el número que cruza una superficie es proporcional al flujo. Es una imagen: el flujo se calcula con $\\int \\vec E\\cdot d\\vec A$.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Vector área $\\vec A = A\\hat n$; en superficies cerradas, $\\hat n$ hacia afuera.',
          'Campo uniforme: $\\Phi = EA\\cos\\theta$, con $\\theta$ entre $\\vec E$ y $\\hat n$; unidades N·m²/C.',
          'Superficie cerrada sin carga adentro en un campo uniforme: lo que entra sale, $\\Phi = 0$.',
          'Campo que cambia: $\\Phi = \\int \\vec E\\cdot d\\vec A$ por franjas; una carga puntual da $q/\\varepsilon_0$ por cualquier esfera.'
        ]
      }
    ],

    lab: {
      type: 'flux-surface', title: 'Superficie rotable en un campo',
      intro: 'Ajusta el campo y gira la superficie (con el deslizador o arrastrándola en la vista de canto) y cuenta cuántas líneas la cruzan. En «Superficie cerrada» mira el flujo de cada cara de un cubo o de un prisma y su total. Luego calcula el flujo a mano y compruébalo: el lab detecta el ángulo con la superficie, el signo al revés, el coseno olvidado y el área en cm².',
      cfg: { start: { mode: 'plane', E: 1000, alpha: 0, normal: 60, a: 20, b: 30 } }
    },

    formulas: [
      { label: 'Vector área', tex: '\\vec A = A\\,\\hat n' },
      { label: 'Campo uniforme', tex: '\\Phi = \\vec E\\cdot\\vec A = EA\\cos\\theta' },
      { label: 'Ángulo con la superficie β', tex: '\\theta = 90° - \\beta' },
      { label: 'Campo no uniforme', tex: '\\Phi = \\int \\vec E\\cdot d\\vec A' },
      { label: 'Superficie cerrada', tex: '\\Phi = \\oint \\vec E\\cdot d\\vec A' },
      { label: 'Carga puntual en una esfera', tex: '\\Phi = \\frac{q}{\\varepsilon_0}' },
      { label: 'Constante', tex: '\\varepsilon_0 = 8.85\\times 10^{-12}\\ \\text{C}^2/(\\text{N}\\cdot\\text{m}^2)' }
    ],

    exercises: [
      {
        id: 'f2-s07-inclinado', title: 'Flujo por un rectángulo inclinado',
        vars: { E: [500, 3000, 100], a: [10, 40, 5], b: [10, 40, 5], ang: [10, 80, 5], p: [0, 1, 1] },
        baseWhere: function (v) { return v.ang !== 45; },
        prompt: function (v) {
          return '<p>Un campo uniforme de $' + v.E + '\\ \\text{N/C}$ atraviesa un rectángulo de $' + v.a + '\\ \\text{cm} \\times ' + v.b + '\\ \\text{cm}$. ' +
            (v.p ? 'El plano del rectángulo forma un ángulo de $' + v.ang + '°$ con el campo.' : 'La normal del rectángulo forma un ángulo de $' + v.ang + '°$ con el campo.') + ' ¿Cuál es el flujo, en N·m²/C?</p>';
        },
        check: 'numeric', unit: 'N·m²/C',
        answer: function (v) { var th = v.p ? 90 - v.ang : v.ang; return v.E * v.a * v.b * 1e-4 * Math.cos(th * RAD); },
        mistakes: {
          trig: function (v) { var th = v.p ? 90 - v.ang : v.ang; return v.E * v.a * v.b * 1e-4 * Math.sin(th * RAD); },
          noCos: function (v) { return v.E * v.a * v.b * 1e-4; },
          cm2: function (v) { var th = v.p ? 90 - v.ang : v.ang; return v.E * v.a * v.b * Math.cos(th * RAD); }
        },
        feedback: [
          { when: 'trig', say: 'Revisa el ángulo: en $\\Phi = EA\\cos\\theta$, $\\theta$ va entre $\\vec E$ y la <strong>normal</strong>. Si te dan el ángulo con el plano, $\\theta = 90°$ menos ese ángulo.' },
          { when: 'noCos', say: 'Falta el coseno: $EA$ solo vale si el campo es perpendicular a la superficie.' },
          { when: 'cm2', say: 'Pasa el área a m²: $1\\ \\text{cm}^2 = 10^{-4}\\ \\text{m}^2$.' }
        ],
        oracle: { lab: 'value', value: function (v) { var th = (v.p ? 90 - v.ang : v.ang) * RAD, a = v.a / 100, b = v.b / 100; return window.LabMath.flux.quad(function () { return [v.E, 0, 0]; }, { P0: [0, 0, 0], u: [0, a, 0], v: [-b * Math.sin(th), 0, b * Math.cos(th)] }, 4); } },
        hint: 'Primero $\\theta$ (con la normal), luego el área en m² y al final $\\Phi = EA\\cos\\theta$.',
        solution: function (v) { var th = v.p ? 90 - v.ang : v.ang, A = v.a * v.b * 1e-4; return (v.p ? '$\\theta = 90° - ' + v.ang + '° = ' + th + '°$. ' : '$\\theta = ' + th + '°$. ') + '$A = ' + fx(A, 4) + '\\ \\text{m}^2$. $$\\Phi = (' + v.E + ')(' + fx(A, 4) + ')\\cos ' + th + '° = ' + fx(v.E * A * Math.cos(th * RAD)) + U + '$$'; }
      },
      {
        id: 'f2-s07-angulo', title: '¿Qué ángulo da ese flujo?',
        vars: { E: [500, 2000, 100], a: [10, 30, 2], th: [10, 80, 1] },
        baseWhere: function (v) { return v.th !== 45; },
        prompt: function (v) { return '<p>Un cuadrado de $' + v.a + '\\ \\text{cm}$ de lado está en un campo uniforme de $' + v.E + '\\ \\text{N/C}$ y el flujo por él es $' + shownPhi(v) + '\\ \\text{N}\\cdot\\text{m}^2/\\text{C}$. ¿Qué ángulo forma el campo con la normal del cuadrado, en grados?</p>'; },
        check: 'numeric', unit: '°',
        answer: function (v) { return Math.acos(shownPhi(v) / (v.E * v.a * v.a * 1e-4)) / RAD; },
        mistakes: {
          comp: function (v) { return 90 - Math.acos(shownPhi(v) / (v.E * v.a * v.a * 1e-4)) / RAD; },
          rad: function (v) { return Math.acos(shownPhi(v) / (v.E * v.a * v.a * 1e-4)); }
        },
        feedback: [
          { when: 'comp', say: 'Ese es el ángulo con la superficie. Con la normal: $\\cos\\theta = \\Phi/(EA)$.' },
          { when: 'rad', say: 'Lo diste en radianes: pásalo a grados.' }
        ],
        oracle: { lab: 'value', value: function (v) { var c = shownPhi(v) / (v.E * v.a * v.a * 1e-4); return 2 * Math.atan(Math.sqrt((1 - c) / (1 + c))) * 180 / Math.PI; } },
        hint: 'Despeja de $\\Phi = EA\\cos\\theta$: $\\cos\\theta = \\Phi/(EA)$, con $A$ en m².',
        solution: function (v) { var A = v.a * v.a * 1e-4, c = shownPhi(v) / (v.E * A); return '$A = ' + fx(A, 4) + '\\ \\text{m}^2$, $EA = ' + fx(v.E * A, 3) + '$. $$\\cos\\theta = \\frac{' + shownPhi(v) + '}{' + fx(v.E * A, 3) + '} = ' + fx(c, 4) + '\\quad\\Rightarrow\\quad \\theta = ' + fx(Math.acos(c) / RAD) + '°$$'; }
      },
      {
        id: 'f2-s07-cara', title: 'Flujo por una cara de un cubo',
        vars: { a: [5, 30, 1], Ex: [-900, 900, 100], Ey: [-900, 900, 100], Ez: [-900, 900, 100], f: [0, 5, 1] },
        baseWhere: function (v) { return Evec(v)[CUBE[v.f][1]] !== 0; },
        prompt: function (v) { return '<p>Un cubo de $' + v.a + '\\ \\text{cm}$ de lado tiene una esquina en el origen y sus aristas sobre los ejes $x$, $y$, $z$ positivos. Está en el campo uniforme $\\vec E = ' + vecTex(v) + '$. ¿Cuál es el flujo por ' + CUBE[v.f][0] + ', con la normal hacia afuera?</p>'; },
        check: 'numeric', unit: 'N·m²/C',
        answer: function (v) { var c = CUBE[v.f]; return c[2] * Evec(v)[c[1]] * v.a * v.a * 1e-4; },
        mistakes: {
          sign: function (v) { var c = CUBE[v.f]; return -c[2] * Evec(v)[c[1]] * v.a * v.a * 1e-4; },
          cm2: function (v) { var c = CUBE[v.f]; return c[2] * Evec(v)[c[1]] * v.a * v.a; }
        },
        feedback: [
          { when: 'sign', say: 'Revisa la normal: en una superficie cerrada apunta hacia afuera. En la cara de $x = 0$ es $-\\hat\\imath$.' },
          { when: 'cm2', say: 'Pasa el área a m²: $1\\ \\text{cm}^2 = 10^{-4}\\ \\text{m}^2$.' }
        ],
        oracle: { lab: 'value', value: function (v) { var F = window.LabMath.flux, E = Evec(v); return F.quad(function () { return E; }, F.faces('cube', { a: v.a / 100 })[v.f], 4); } },
        hint: 'Solo cuenta la componente de $\\vec E$ perpendicular a la cara: $\\Phi = (\\vec E\\cdot\\hat n)A$, con $\\hat n$ hacia afuera.',
        solution: function (v) { var c = CUBE[v.f], A = v.a * v.a * 1e-4, comp = Evec(v)[c[1]]; return 'La normal es $' + (c[2] < 0 ? '-' : '+') + ['\\hat\\imath', '\\hat\\jmath', '\\hat k'][c[1]] + '$ y $A = ' + fx(A, 4) + '\\ \\text{m}^2$. $$\\Phi = (' + (c[2] * comp) + ')(' + fx(A, 4) + ') = ' + fx(c[2] * comp * A, 4) + U + '$$'; }
      },
      {
        id: 'f2-s07-total', title: 'Concepto: el total por el cubo',
        vars: {},
        prompt: function () { return '<p>Un cubo vacío (sin carga adentro) está en un campo eléctrico uniforme que apunta en una dirección cualquiera. ¿Cuánto vale el flujo total por sus seis caras?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Cero, para cualquier dirección del campo', correct: true },
            { text: '$6EA$', say: 'Las caras por donde entra el campo dan flujo negativo y cancelan a las de salida.' },
            { text: '$EA$, por la cara que mira al campo', say: 'Esa cara da $-EA$ y la de enfrente $+EA$: se cancelan.' },
            { text: 'Depende de cómo esté girado el cubo', say: 'Cada par de caras opuestas se cancela en cualquier orientación.' }
          ];
        },
        answer: function () { return 'Cero, para cualquier dirección del campo'; },
        hint: 'Compara las caras opuestas: misma área, normales opuestas.',
        solution: function () { return 'Cada par de caras opuestas da $+(\\vec E\\cdot\\hat n)A$ y $-(\\vec E\\cdot\\hat n)A$. El total es cero: toda línea que entra, sale.'; }
      },
      {
        id: 'f2-s07-no-uniforme', title: 'Campo no uniforme E = cx î',
        vars: { c: [50, 500, 10], a: [0.5, 5, 0.5], s: [10, 60, 5] },
        prompt: function (v) { return '<p>El campo $\\vec E = c\\,x\\,\\hat\\imath$, con $c = ' + v.c + '\\ \\text{N/(C}\\cdot\\text{m)}$, atraviesa un cuadrado de $' + v.s + '\\ \\text{cm}$ de lado en el plano $x = ' + v.a + '\\ \\text{m}$ (normal en $+\\hat\\imath$). ¿Cuál es el flujo, en N·m²/C?</p>'; },
        check: 'numeric', unit: 'N·m²/C',
        answer: function (v) { return v.c * v.a * Math.pow(v.s / 100, 2); },
        mistakes: {
          noX: function (v) { return v.c * Math.pow(v.s / 100, 2); },
          cm2: function (v) { return v.c * v.a * v.s * v.s; }
        },
        feedback: [
          { when: 'noX', say: 'El campo en el cuadrado es $E = c\\,x$ con $x = a$: falta multiplicar por $a$.' },
          { when: 'cm2', say: 'Pasa el lado a metros antes de elevar al cuadrado.' }
        ],
        oracle: { lab: 'call', mod: 'flux', fn: 'quad', args: function (v) { var s = v.s / 100; return [function (x) { return [v.c * x, 0, 0]; }, { P0: [v.a, 0, 0], u: [0, s, 0], v: [0, 0, s] }, 8]; } },
        hint: 'En todo el cuadrado $x = a$, así que ahí $E = ca$ es constante y perpendicular.',
        solution: function (v) { var s = v.s / 100; return '$E = c\\,a = ' + fx(v.c * v.a, 1) + '\\ \\text{N/C}$ en todo el cuadrado. $$\\Phi = (' + fx(v.c * v.a, 1) + ')(' + fx(s) + ')^2 = ' + fx(v.c * v.a * s * s, 4) + U + '$$'; }
      },
      {
        id: 'f2-s07-franjas', title: 'Campo que crece con la altura',
        vars: { c: [100, 900, 50], s: [10, 50, 5] },
        prompt: function (v) { return '<p>Un cuadrado de $' + v.s + '\\ \\text{cm}$ de lado está en el plano $x = 0$, con $y$ y $z$ de $0$ a $' + v.s + '\\ \\text{cm}$ (normal en $+\\hat\\imath$). El campo es $\\vec E = c\\,y\\,\\hat\\imath$ con $c = ' + v.c + '\\ \\text{N/(C}\\cdot\\text{m)}$. ¿Cuál es el flujo, en N·m²/C?</p>'; },
        check: 'numeric', unit: 'N·m²/C',
        answer: function (v) { var s = v.s / 100; return v.c * s * s * s / 2; },
        mistakes: {
          noHalf: function (v) { var s = v.s / 100; return v.c * s * s * s; },
          top: function (v) { var s = v.s / 100; return v.c * s * s * s * 2; }
        },
        feedback: [
          { when: 'noHalf', say: 'Usaste el campo de arriba ($cs$) en todo el cuadrado. El campo cambia: integra $\\int_0^s c\\,y\\,s\\,dy = cs^3/2$.' },
          { when: 'top', say: 'Revisa la integral: $\\int_0^s y\\,dy = s^2/2$.' }
        ],
        oracle: { lab: 'call', mod: 'flux', fn: 'quad', args: function (v) { var s = v.s / 100; return [function (x, y) { return [v.c * y, 0, 0]; }, { P0: [0, 0, 0], u: [0, s, 0], v: [0, 0, s] }, 8]; } },
        hint: 'Parte en franjas horizontales de alto $dy$ y largo $s$: $d\\Phi = c\\,y\\,s\\,dy$.',
        solution: function (v) { var s = v.s / 100; return '$$\\Phi = \\int_0^{s} c\\,y\\,s\\,dy = \\frac{c\\,s^3}{2} = \\frac{(' + v.c + ')(' + fx(s) + ')^3}{2} = ' + fx(v.c * s * s * s / 2, 4) + U + '$$'; }
      },
      {
        id: 'f2-s07-esfera', title: 'Carga puntual en una esfera',
        vars: { q: [1, 20, 1], r: [2, 50, 1] },
        prompt: function (v) { return '<p>Una carga de $' + v.q + '\\ \\text{nC}$ está en el centro de una esfera de $' + v.r + '\\ \\text{cm}$ de radio. ¿Cuál es el flujo eléctrico por la esfera, en N·m²/C? (' + EPT + ', ' + KTX + '.)</p>'; },
        check: 'numeric', unit: 'N·m²/C',
        answer: function (v) { return v.q * 1e-9 / EPS0; },
        mistakes: {
          field: function (v) { return k * v.q * 1e-9 / Math.pow(v.r / 100, 2); },
          area: function (v) { return v.q * 1e-9 / EPS0 / (4 * Math.PI); }
        },
        feedback: [
          { when: 'field', say: 'Ese es el campo $E$ en la superficie. El flujo es campo por área: multiplica por $4\\pi r^2$ (o usa $q/\\varepsilon_0$).' },
          { when: 'area', say: 'Sobra el $4\\pi$: $\\Phi = q/\\varepsilon_0$ (el $4\\pi$ ya está dentro de $k = 1/4\\pi\\varepsilon_0$).' }
        ],
        oracle: { lab: 'call', mod: 'flux', fn: 'pointSphere', args: function (v) { return [v.q * 1e-9, v.r / 100]; } },
        hint: 'El flujo de una carga puntual por una esfera que la encierra no depende del radio.',
        solution: function (v) { return '$$\\Phi = \\frac{q}{\\varepsilon_0} = \\frac{' + v.q + '\\times 10^{-9}}{8.85\\times 10^{-12}} = ' + fx(v.q * 1e-9 / EPS0) + U + '$$ El radio no importa.'; }
      },
      {
        id: 'f2-s07-unidades', title: 'Concepto: unidades del flujo',
        vars: {},
        prompt: function () { return '<p>¿En qué unidades se mide el flujo eléctrico?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: '$\\text{N}\\cdot\\text{m}^2/\\text{C}$', correct: true },
            { text: '$\\text{N/C}$', say: 'Esas son del campo; al flujo le falta multiplicar por un área.' },
            { text: '$\\text{N}\\cdot\\text{m}^2/\\text{C}^2$', say: 'Esas son de $k$.' },
            { text: '$\\text{C/m}^2$', say: 'Esas son de una densidad de carga superficial.' }
          ];
        },
        answer: function () { return '$\\text{N}\\cdot\\text{m}^2/\\text{C}$'; },
        hint: 'Flujo = campo × área.',
        solution: function () { return '$[E][A] = (\\text{N/C})(\\text{m}^2) = \\text{N}\\cdot\\text{m}^2/\\text{C}$ (también V·m).'; }
      },
      {
        id: 'f2-s07-signo', title: 'Concepto: la convención de la normal',
        vars: {},
        prompt: function () { return '<p>En una superficie cerrada, el campo eléctrico entra por una de sus caras. ¿Qué signo tiene el flujo por esa cara?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Negativo, porque la normal apunta hacia afuera', correct: true },
            { text: 'Positivo, porque el campo atraviesa la cara', say: 'Atravesarla no basta: el signo lo da $\\cos\\theta$ con la normal hacia afuera.' },
            { text: 'Cero, porque solo cuenta el total', say: 'Cada cara tiene su flujo; el total es la suma.' },
            { text: 'Depende de la normal que elijas', say: 'En superficies cerradas no se elige: siempre hacia afuera.' }
          ];
        },
        answer: function () { return 'Negativo, porque la normal apunta hacia afuera'; },
        hint: '¿Hacia dónde apunta la normal de una superficie cerrada?',
        solution: function () { return 'La normal apunta hacia afuera y el campo hacia adentro: $\\theta > 90°$ y $\\cos\\theta < 0$.'; }
      }
    ],

    quiz: { tags: ['f2.S07'], count: 8 },

    errors: [
      'Usar el ángulo entre el campo y la superficie en lugar del ángulo con la normal (cambia el coseno por el seno).',
      'Dejar el área en cm²: $20\\ \\text{cm} \\times 30\\ \\text{cm}$ son $0.06\\ \\text{m}^2$, no 600.',
      'Olvidar el signo de las caras por donde entra el campo en una superficie cerrada.',
      'Pensar que flujo total cero significa campo cero adentro.',
      'Multiplicar $E \\times A$ cuando el campo cambia sobre la superficie, en lugar de integrar por franjas.',
      'Creer que una esfera más grande alrededor de la misma carga tiene más (o menos) flujo.'
    ],

    teacher: {
      plan: [
        'Arranca con el aro bajo la lluvia: que predigan qué pasa al inclinarlo antes de dar la fórmula.',
        'Explainer de la superficie que gira, deteniéndote en el paso del ángulo con la superficie.',
        'Cubo y prisma cara por cara; en el lab, el modo «Superficie cerrada» para ver que el total siempre da cero.',
        'Cierra con la carga dentro de dos esferas: es la puerta a la ley de Gauss.'
      ],
      check: [
        'Que dibujen la normal antes de calcular y digan cuánto vale $\\theta$.',
        'Que conviertan el área a m² en el primer renglón.'
      ],
      note: 'La ley de Gauss y sus aplicaciones (esferas, cilindros, planos) quedan para S08.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §6.1 “Electric Flux”. <a href="https://openstax.org/books/university-physics-volume-2/pages/6-1-electric-flux">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-06',
    next: 'sesion-08'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
