/* =====================================================================
   Cálculo 2 · S07 · Derivada direccional (bloque B · Gradiente y optimización).
   Fuente: OpenStax, Calculus Volume 3, §4.6 (solo la derivada direccional; el
   gradiente como protagonista es la S08), CC BY-NC-SA 4.0.
   Las cuentas se hacen aquí a mano y scripts/examples.test.js las compara contra
   LabMath.directional (lab directional-derivative), que deriva con math.js; los
   ejercicios numéricos usan como oráculo el límite numérico f(P + hu) (limitAt),
   que no deriva nada.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function sg(v, d) { return fx(v, d).replace('-', '−'); }
  // Coeficiente delante de una letra: 1 → '', −1 → '-'.
  function co(k) { return k === 1 ? '' : k === -1 ? '-' : String(k); }
  // Número entre paréntesis si es negativo (para sustituir).
  function par(v) { return v < 0 ? '(' + v + ')' : String(v); }
  // Une términos de LaTeX con sus signos: ['3x', '-2y'] → 3x - 2y
  function sum(terms) {
    return terms.filter(function (t) { return t && t !== '0'; }).map(function (t, i) {
      t = String(t);
      if (i === 0) return t;
      return t.charAt(0) === '-' ? ' - ' + t.slice(1) : ' + ' + t;
    }).join('') || '0';
  }
  function vec(c) { return '\\langle ' + c.join(', ') + '\\rangle'; }
  function len(c) { return Math.sqrt(c.reduce(function (s, x) { return s + x * x; }, 0)); }
  // |v| en LaTeX: entero si es cuadrado perfecto, \sqrt{n} si no.
  function lenTex(c) {
    var n = c.reduce(function (s, x) { return s + x * x; }, 0), r = Math.round(Math.sqrt(n));
    return r * r === n ? String(r) : '\\sqrt{' + n + '}';
  }

  // Ángulos «de tabla» (sin π/2, π ni 3π/2, donde una componente de u se anula).
  var ANG = [[1, 6], [1, 4], [1, 3], [2, 3], [3, 4], [5, 6], [7, 6], [5, 4], [4, 3], [5, 3], [7, 4], [11, 6]];
  function angTex(k) { var p = ANG[k][0], q = ANG[k][1]; return '\\frac{' + (p === 1 ? '' : p) + '\\pi}{' + q + '}'; }
  function ang(k) { return Math.PI * ANG[k][0] / ANG[k][1]; }
  // Vectores no unitarios para dar direcciones.
  var VEC = [[3, 4], [4, -3], [-3, 4], [5, 12], [12, -5], [1, 2], [2, -1], [1, 1], [-1, 3], [2, 3], [-4, -3], [-1, -2]];
  var V3 = [[1, 2, 2], [2, 1, 2], [2, -1, 2], [2, 2, 1], [1, -2, 2], [2, 3, 6], [2, -3, 6], [6, 2, 3], [1, 4, 8], [4, 4, 7]];
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }

  // La respuesta y cada error típico difieren al menos 3 % entre sí (mensajes "casi" sin ambigüedad).
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      if (Math.abs(vals[0]) < 0.15) return false;
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (!isFinite(vals[i]) || !isFinite(vals[j])) return false;
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 0.5)) return false;
      }
      return true;
    };
  }

  // Ejemplo 1: f = x² + 3xy en (1, 2), θ = π/6.
  var e1 = { fx: 8, fy: 3, th: Math.PI / 6 };
  e1.D = e1.fx * Math.cos(e1.th) + e1.fy * Math.sin(e1.th);
  // Ejemplo 3: f = 9 − x² − 2y² en (1, 1): ∇f = (−2, −4).
  var e3 = { max: Math.sqrt(20), thMax: Math.atan2(-4, -2) + 2 * Math.PI, z1: Math.atan2(2, -4), z2: Math.atan2(-2, 4) + 2 * Math.PI };

  var data = window.SESSION_DATA = {
    slug: 'sesion-07', number: '07', group: 'B · Gradiente y optimización',
    title: 'Derivada direccional', temario: [],
    minutes: 150,
    quote: 'Las parciales te dicen qué tan empinado está el cerro hacia el este y hacia el norte. La derivada direccional te lo dice hacia donde tú quieras caminar.',
    badges: [
      'Ver $D_{\\mathbf u} f$ como la pendiente de la traza que deja un plano vertical en la dirección de $\\mathbf u$.',
      'Normalizar la dirección antes de calcular: $\\mathbf u$ debe ser unitario.',
      'Calcular $D_{\\mathbf u} f = f_x\\,a + f_y\\,b$ (también con tres variables) e interpretarla con unidades.',
      'Encontrar en qué direcciones $D_{\\mathbf u} f$ es máxima, mínima o cero.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Si caminas desde un punto en una dirección $\\mathbf u$ (un vector de largo 1), ¿qué tan rápido cambia $f$? Esa razón de cambio es la <strong>derivada direccional</strong>: $D_{\\mathbf u} f = f_x\\,a + f_y\\,b$.',
        recall: [
          'Las <a href="../sesion-04/">derivadas parciales</a> (S04): $f_x$ es la pendiente hacia $+x$ y $f_y$ hacia $+y$.',
          'El <a href="../sesion-05/">plano tangente y el diferencial</a> (S05): un paso pequeño $(dx, dy)$ cambia $f$ en $dz = f_x\\,dx + f_y\\,dy$.',
          'El <a href="../../../fisica-1/sesiones/sesion-03/">vector unitario y el producto punto</a> (Física 1, S03): $\\hat{\\mathbf v} = \\mathbf v/|\\mathbf v|$ y $\\mathbf A\\cdot\\mathbf B = A_xB_x + A_yB_y$.'
        ],
        why: 'En la vida real casi nunca caminas justo hacia el este o el norte. Un excursionista quiere saber qué tan empinado está el sendero que va a tomar; un dron que vuela en diagonal quiere saber qué tan rápido cambia la temperatura; un robot en una placa caliente, qué tan rápido se calienta si avanza hacia una pieza. Todas son derivadas direccionales.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Estás en la ladera de un cerro con un mapa de curvas de nivel en la mano. Si caminas derecho hacia la cima, subes muy empinado. Si caminas a lo largo de una curva de nivel, no subes nada: vas a la misma altura. Si caminas en diagonal, subes algo intermedio. <strong>En el mismo punto, la inclinación depende de hacia dónde camines.</strong>',
          'Las parciales solo contestan dos de esas preguntas: hacia el este ($f_x$) y hacia el norte ($f_y$). La derivada direccional contesta todas las demás. Y lo bonito es que con esas dos alcanza: cualquier dirección es una mezcla de este y norte.',
          'Piénsalo como una rampa de skate vista desde arriba: si la cruzas de frente sientes toda la pendiente; si la cruzas de lado casi no la notas. La rampa es la misma; lo que cambia es tu dirección.'
        ]
      },
      {
        type: 'explainer', heading: 'Una pendiente por cada dirección', short: 'Una pendiente por dirección',
        title: 'El mapa de contorno de un cerro, visto desde arriba',
        intro: 'Cada paso agrega una dirección. Las dos primeras son las parciales de la S04; la tercera es una cualquiera.',
        diagram: 'c2s07-compass',
        steps: [
          { text: 'El mapa de contorno de un cerro y un punto $P$ en su ladera. Cada curva une los puntos de la misma altura; la cima está en el centro.', state: { e: 0, n: 0, u: 0, fan: 0, th: 55 } },
          { text: 'Si caminas hacia $+x$ (el vector $\\mathbf i = \\langle 1, 0\\rangle$), la pendiente es $f_x(P)$.', state: { e: 1 } },
          { text: 'Si caminas hacia $+y$ (el vector $\\mathbf j = \\langle 0, 1\\rangle$), la pendiente es $f_y(P)$.', state: { n: 1 } },
          { text: 'Ahora camina en una dirección cualquiera $\\mathbf u = \\langle \\cos\\theta, \\sin\\theta\\rangle$, a un ángulo $\\theta$ de $+x$. Su pendiente es la <strong>derivada direccional</strong> $D_{\\mathbf u} f(P)$.', state: { u: 1 } },
          { text: 'Hay una pendiente distinta por cada dirección. Las parciales son solo dos casos: $D_{\\mathbf i} f = f_x$ y $D_{\\mathbf j} f = f_y$.', state: { fan: 1 } }
        ]
      },
      {
        type: 'concept', heading: 'La definición', short: 'Definición',
        body: [
          'Para medir qué tan rápido cambia $f$ al caminar desde $P(a, b)$ en la dirección $\\mathbf u = \\langle u_1, u_2\\rangle$, avanzas una distancia $h$ (llegas a $(a + hu_1,\\, b + hu_2)$), ves cuánto cambió $f$ y divides entre lo que caminaste:',
          '$$D_{\\mathbf u} f(a, b) = \\lim_{h \\to 0} \\frac{f(a + h u_1,\\; b + h u_2) - f(a, b)}{h}$$',
          'Es la misma idea de la derivada de Cálculo 1 y de las parciales de la S04. De hecho, con $\\mathbf u = \\langle 1, 0\\rangle$ el límite es exactamente el de $f_x$, y con $\\mathbf u = \\langle 0, 1\\rangle$, el de $f_y$.',
          'Para que $h$ sea de verdad la distancia caminada, $\\mathbf u$ tiene que medir 1: es un <strong>vector unitario</strong>. Los ángulos se miden en radianes desde el eje $+x$, en sentido contrario a las manecillas: $\\mathbf u = \\langle\\cos\\theta, \\sin\\theta\\rangle$ siempre mide 1.'
        ]
      },
      {
        type: 'explainer', heading: 'La pendiente de un corte inclinado', short: 'El corte en la dirección u',
        title: 'Una colina cortada por un plano vertical en la dirección de $\\mathbf u$',
        intro: 'En la S04 cortabas con planos paralelos a los ejes. Aquí el plano gira para seguir a $\\mathbf u$.',
        diagram: 'c2s07-slice',
        steps: [
          { text: 'La superficie $z = f(x, y)$ y el punto $P$ en el piso, con la altura $f(P)$ justo arriba.', state: { u: 0, plane: 0, trace: 0, tan: 0 } },
          { text: 'Elige la dirección $\\mathbf u$ en el piso: hacia allá vas a caminar.', state: { u: 1 } },
          { text: 'Levanta un plano vertical que pase por $P$ y contenga a $\\mathbf u$. Es como la pared de una zanja recta que va en esa dirección.', state: { plane: 1 } },
          { text: 'El plano corta la superficie en una curva: la traza $z = f(P + t\\,\\mathbf u)$, donde $t$ es lo que llevas caminado. Ya es una función de una sola variable.', state: { trace: 1 } },
          { text: 'La pendiente de su tangente en $P$ es $D_{\\mathbf u} f(P)$: cuánto sube $z$ por cada unidad que caminas en la dirección de $\\mathbf u$. Si $\\mathbf u$ apunta a $+x$, el plano es $y = b$ y recuperas $f_x$, como en la S04.', state: { tan: 1 } }
        ]
      },
      {
        type: 'concept', heading: '¿Por qué u debe ser unitario?', short: 'u unitario',
        body: [
          'Muchas veces la dirección viene como un vector cualquiera, por ejemplo $\\mathbf v = \\langle 3, 4\\rangle$. Ese vector mide $|\\mathbf v| = \\sqrt{3^2 + 4^2} = 5$. Si lo usas tal cual, cada «paso» de $h$ en realidad te mueve $5h$, y tu resultado sale <strong>5 veces más grande</strong>.',
          'La dirección es la misma, pero la razón de cambio debe medirse por unidad de distancia. Por eso primero se <strong>normaliza</strong>: $\\mathbf u = \\dfrac{\\mathbf v}{|\\mathbf v|} = \\left\\langle \\dfrac{3}{5}, \\dfrac{4}{5}\\right\\rangle$. Es el error más común de esta sesión.'
        ],
        diagram: 'c2s07-unit',
        caption: '$\\mathbf v$ y $\\mathbf u$ apuntan igual, pero solo $\\mathbf u$ mide 1: su punta cae en el círculo unitario.'
      },
      {
        type: 'concept', heading: 'La fórmula práctica', short: 'Fórmula práctica',
        body: [
          'Calcular el límite cada vez sería eterno. Hay un atajo, y sale del plano tangente de la <a href="../sesion-05/">S05</a>: si caminas una distancia pequeña $h$ en la dirección $\\mathbf u = \\langle a, b\\rangle$, te mueves $dx = h\\,a$ en $x$ y $dy = h\\,b$ en $y$, así que $f$ cambia más o menos $dz = f_x\\,(h a) + f_y\\,(h b)$. Divide entre $h$:',
          '$$D_{\\mathbf u} f = f_x\\,a + f_y\\,b = \\langle f_x, f_y\\rangle \\cdot \\langle a, b\\rangle$$',
          'Moverte en diagonal es moverte un poco en $x$ y un poco en $y$ a la vez: cada parcial aporta según cuánto de tu paso va en su dirección. Con ángulo, $D_{\\mathbf u} f = f_x\\cos\\theta + f_y\\sin\\theta$.',
          'El vector $\\langle f_x, f_y\\rangle$ se llama <strong>gradiente</strong> y se escribe $\\nabla f$. Aquí solo lo usamos como atajo: $D_{\\mathbf u} f = \\nabla f\\cdot\\mathbf u$. En la S08 verás todo lo que dice por sí mismo.'
        ]
      },
      {
        type: 'callout', heading: 'Las parciales salen solas',
        body: [
          'Con $\\mathbf u = \\langle 1, 0\\rangle$: $D_{\\mathbf u} f = f_x(1) + f_y(0) = f_x$. Con $\\mathbf u = \\langle 0, 1\\rangle$: $D_{\\mathbf u} f = f_y$. La fórmula no contradice lo que ya sabías: lo contiene.',
          'Y al revés: con $\\mathbf u = \\langle -1, 0\\rangle$ (hacia el oeste) sale $-f_x$. Caminar al revés invierte la pendiente, como subir o bajar la misma escalera.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: derivada direccional', short: 'Receta',
        steps: [
          { text: 'Calcula las parciales $f_x$ y $f_y$ (y $f_z$ si hay tres variables) y evalúalas en el punto $P$.' },
          { text: 'Consigue la dirección. Si te dan un ángulo, $\\mathbf u = \\langle\\cos\\theta, \\sin\\theta\\rangle$. Si te dan un punto $Q$ hacia el que caminas, la dirección es $\\overrightarrow{PQ} = Q - P$.', tip: 'Con ángulos en radianes, la calculadora debe estar en radianes. $\\cos(\\pi/6)$ con la calculadora en grados da 0.99996, no $0.866$.' },
          { text: 'Si la dirección viene como vector $\\mathbf v$, normalízala: $\\mathbf u = \\mathbf v / |\\mathbf v|$.', tip: 'Es el error más común. Si no normalizas, tu resultado sale multiplicado por $|\\mathbf v|$.' },
          { text: 'Haz el producto punto: $D_{\\mathbf u} f = f_x\\,u_1 + f_y\\,u_2\\;(+\\,f_z\\,u_3)$.', tip: 'La componente en $x$ de $\\mathbf u$ va con $f_x$, la de $y$ con $f_y$. No las cruces y no olvides ningún término.' },
          { text: 'Interpreta: unidades de $f$ por unidad de distancia. Positiva, $f$ sube en esa dirección; negativa, baja; cero, te mueves sobre la curva de nivel.' }
        ]
      },
      {
        type: 'example', heading: 'Con un ángulo',
        problem: '<p>Si $f(x, y) = x^2 + 3xy$, calcula la derivada direccional en $P(1, 2)$ en la dirección que forma un ángulo $\\theta = \\dfrac{\\pi}{6}$ con el eje $+x$.</p>',
        steps: [
          { text: 'Parciales y su valor en $P$.', math: 'f_x = 2x + 3y \\Rightarrow f_x(1, 2) = 8 \\qquad f_y = 3x \\Rightarrow f_y(1, 2) = 3' },
          { text: 'La dirección ya es unitaria porque viene de un ángulo.', math: '\\mathbf u = \\left\\langle \\cos\\tfrac{\\pi}{6}, \\sin\\tfrac{\\pi}{6}\\right\\rangle = \\left\\langle \\tfrac{\\sqrt 3}{2}, \\tfrac{1}{2}\\right\\rangle' },
          { text: 'Producto punto.', math: 'D_{\\mathbf u} f(1, 2) = 8\\cdot\\frac{\\sqrt 3}{2} + 3\\cdot\\frac{1}{2} = 4\\sqrt 3 + 1.5 \\approx ' + fx(e1.D) }
        ],
        answer: '$D_{\\mathbf u} f(1, 2) = 4\\sqrt 3 + 1.5 \\approx ' + fx(e1.D) + '$: al caminar en esa dirección, $f$ sube unas ' + fx(e1.D) + ' unidades por cada unidad de distancia.',
        verify: { lab: 'call', mod: 'directional', fn: 'dufAngle', math: true, args: ['x^2 + 3x*y', { x: 1, y: 2 }, Math.PI / 6], value: e1.D }
      },
      {
        type: 'example', heading: 'Con un vector que no es unitario',
        problem: '<p>Si $f(x, y) = x\\,e^{y}$, calcula $D_{\\mathbf u} f$ en $P(2, 0)$ en la dirección del vector $\\mathbf v = \\langle 3, -4\\rangle$.</p>',
        steps: [
          { text: 'Parciales en $P$.', math: 'f_x = e^{y} \\Rightarrow f_x(2, 0) = 1 \\qquad f_y = x\\,e^{y} \\Rightarrow f_y(2, 0) = 2' },
          { text: '$\\mathbf v$ mide $\\sqrt{9 + 16} = 5$, así que no es unitario. Normaliza.', math: '\\mathbf u = \\frac{\\langle 3, -4\\rangle}{5} = \\langle 0.6, -0.8\\rangle' },
          { text: 'Producto punto.', math: 'D_{\\mathbf u} f(2, 0) = 1(0.6) + 2(-0.8) = 0.6 - 1.6 = -1' }
        ],
        answer: '$D_{\\mathbf u} f(2, 0) = -1$: en esa dirección $f$ baja. Si hubieras usado $\\mathbf v$ sin normalizar, te saldría $3 - 8 = -5$, cinco veces más.',
        verify: { lab: 'call', mod: 'directional', fn: 'duf', math: true, args: ['x*e^y', { x: 2, y: 0 }, [3, -4]], value: -1 }
      },
      {
        type: 'concept', heading: 'Varias direcciones en el mismo punto', short: 'Máximo, mínimo y cero',
        body: [
          'Fija el punto y gira $\\mathbf u$. Como $D_{\\mathbf u} f = \\nabla f\\cdot\\mathbf u$ y $|\\mathbf u| = 1$, por la fórmula del producto punto queda $$D_{\\mathbf u} f = |\\nabla f|\\cos\\alpha,$$ donde $\\alpha$ es el ángulo entre $\\mathbf u$ y $\\nabla f = \\langle f_x, f_y\\rangle$. Al girar, la derivada direccional sube y baja como un coseno.',
          'Así se leen las direcciones especiales: el <strong>máximo</strong>, $|\\nabla f|$, cuando $\\mathbf u$ apunta como $\\nabla f$ ($\\alpha = 0$); el <strong>mínimo</strong>, $-|\\nabla f|$, en la dirección opuesta; y <strong>cero</strong> en las dos direcciones perpendiculares a $\\nabla f$, que son las tangentes a la curva de nivel (ahí no subes ni bajas).',
          'Esto es un adelanto de la S08, donde el gradiente es el protagonista. Por ahora basta con saber que la derivada direccional depende del ángulo y tiene un máximo, un mínimo y dos ceros. En el lab lo ves como una sinusoide.'
        ],
        diagram: 'c2s07-wave',
        caption: 'Izquierda: desde $P$, la dirección de máximo crecimiento, la de máximo decrecimiento y las dos tangentes a la curva de nivel. Derecha: $D_{\\mathbf u} f$ contra $\\theta$.'
      },
      {
        type: 'example', heading: '¿Hacia dónde no cambia?',
        problem: '<p>Para $f(x, y) = 9 - x^2 - 2y^2$ en $P(1, 1)$, encuentra el valor máximo de $D_{\\mathbf u} f$ y las direcciones (ángulos) en las que $D_{\\mathbf u} f = 0$.</p>',
        steps: [
          { text: 'Parciales en $P$: $\\nabla f(1, 1) = \\langle -2, -4\\rangle$.', math: 'f_x = -2x = -2 \\qquad f_y = -4y = -4' },
          { text: 'El máximo es el largo de ese vector, en la dirección de $\\langle -2, -4\\rangle$ (hacia la cima, que está en el origen).', math: '|\\nabla f| = \\sqrt{4 + 16} = \\sqrt{20} \\approx ' + fx(e3.max) + ' \\quad\\text{en } \\theta = \\pi + \\arctan 2 \\approx ' + fx(e3.thMax) },
          { text: 'Para que $D_{\\mathbf u} f = -2u_1 - 4u_2 = 0$, toma $\\mathbf u$ perpendicular a $\\langle -2, -4\\rangle$: $\\langle 4, -2\\rangle$ o $\\langle -4, 2\\rangle$, ya normalizados.', math: '\\mathbf u = \\pm\\left\\langle \\tfrac{2}{\\sqrt 5}, -\\tfrac{1}{\\sqrt 5}\\right\\rangle \\Rightarrow \\theta \\approx ' + fx(e3.z1) + '\\ \\text{y}\\ \\theta \\approx ' + fx(e3.z2) }
        ],
        answer: 'El máximo es $\\sqrt{20} \\approx ' + fx(e3.max) + '$ y $D_{\\mathbf u} f = 0$ en $\\theta \\approx ' + fx(e3.z1) + '$ y $\\theta \\approx ' + fx(e3.z2) + '$ rad (unos $153°$ y $333°$): por ahí caminas a la misma altura, a lo largo de la elipse de nivel.',
        verify: { lab: 'call', mod: 'directional', fn: 'extremesAt', math: true, args: ['9 - x^2 - 2y^2', { x: 1, y: 1 }], values: { max: e3.max, thMax: e3.thMax, 'zeros.0': e3.z1, 'zeros.1': e3.z2 } }
      },
      {
        type: 'concept', heading: 'Tres variables', short: 'Tres variables',
        body: [
          'Con $w = f(x, y, z)$ todo funciona igual, ahora con un vector unitario de tres componentes $\\mathbf u = \\langle u_1, u_2, u_3\\rangle$:',
          '$$D_{\\mathbf u} f = f_x\\,u_1 + f_y\\,u_2 + f_z\\,u_3$$',
          'Ya no hay superficie que dibujar, pero sí hay una lectura física: si $T(x, y, z)$ es la temperatura dentro de un cuarto, $D_{\\mathbf u} T$ es qué tan rápido cambia al volar en línea recta en la dirección de $\\mathbf u$. En tres variables no hay un solo ángulo: la dirección se da con un vector, que casi siempre hay que normalizar.'
        ]
      },
      {
        type: 'example', heading: 'Una función de tres variables',
        problem: '<p>Si $f(x, y, z) = x^2y + yz^2$, calcula $D_{\\mathbf u} f$ en $P(1, 2, 1)$ en la dirección de $\\mathbf v = \\langle 2, -1, 2\\rangle$.</p>',
        steps: [
          { text: 'Las tres parciales en $P$.', math: 'f_x = 2xy = 4 \\qquad f_y = x^2 + z^2 = 2 \\qquad f_z = 2yz = 4' },
          { text: 'Normaliza: $|\\mathbf v| = \\sqrt{4 + 1 + 4} = 3$.', math: '\\mathbf u = \\left\\langle \\tfrac{2}{3}, -\\tfrac{1}{3}, \\tfrac{2}{3}\\right\\rangle' },
          { text: 'Producto punto con los tres términos.', math: 'D_{\\mathbf u} f = 4\\cdot\\frac{2}{3} + 2\\left(-\\frac{1}{3}\\right) + 4\\cdot\\frac{2}{3} = \\frac{8 - 2 + 8}{3} = \\frac{14}{3} \\approx ' + fx(14 / 3) }
        ],
        answer: '$D_{\\mathbf u} f(1, 2, 1) = \\dfrac{14}{3} \\approx ' + fx(14 / 3) + '$.',
        verify: { lab: 'call', mod: 'directional', fn: 'duf', math: true, args: ['x^2*y + y*z^2', { x: 1, y: 2, z: 1 }, [2, -1, 2]], value: 14 / 3 }
      },
      {
        type: 'concept', heading: 'Interpretación con unidades', short: 'Unidades',
        body: [
          'La derivada direccional es una razón de cambio: <strong>unidades de $f$ entre unidades de distancia</strong>. En una placa con temperatura en °C y posición en cm, sale en °C/cm. En un cerro con altura en metros, sale en metros de subida por metro caminado: $D_{\\mathbf u} h = 0.25$ significa que el sendero sube 25 cm por cada metro, una pendiente del 25 %.',
          'Cuando te digan «caminando de $P$ hacia $Q$», la dirección es el vector $\\overrightarrow{PQ} = Q - P$, normalizado. Ojo: no es el vector de posición de $Q$, y el resultado vale solo en $P$; más adelante en el camino la razón de cambio puede ser otra.'
        ],
        diagram: 'c2s07-walk',
        caption: 'La placa de la S04. Desde $P(2, 1)$ hacia $Q(-1, -3)$, la temperatura empieza subiendo 7.2 °C por centímetro.'
      },
      {
        type: 'example', heading: 'Temperatura caminando hacia un punto',
        problem: '<p>La temperatura de una placa es $T(x, y) = 80 - x^2 - 3y^2$ °C, con $x$ y $y$ en cm. Una hormiga está en $P(2, 1)$ y camina hacia $Q(-1, -3)$. ¿Qué tan rápido cambia la temperatura que siente al arrancar?</p>',
        steps: [
          { text: 'Parciales en $P$.', math: 'T_x = -2x = -4\\ \\text{°C/cm} \\qquad T_y = -6y = -6\\ \\text{°C/cm}' },
          { text: 'Dirección de $P$ a $Q$, normalizada.', math: '\\overrightarrow{PQ} = \\langle -1 - 2,\\, -3 - 1\\rangle = \\langle -3, -4\\rangle,\\quad |\\overrightarrow{PQ}| = 5 \\;\\Rightarrow\\; \\mathbf u = \\langle -0.6, -0.8\\rangle' },
          { text: 'Producto punto.', math: 'D_{\\mathbf u} T = (-4)(-0.6) + (-6)(-0.8) = 2.4 + 4.8 = 7.2\\ \\text{°C/cm}' }
        ],
        answer: 'La temperatura sube $7.2$ °C por cada centímetro al salir de $P$: la hormiga va hacia el centro caliente. (Más adelante el camino se aleja del centro y la temperatura vuelve a bajar.)',
        verify: { lab: 'call', mod: 'directional', fn: 'duf', math: true, args: ['80 - x^2 - 3y^2', { x: 2, y: 1 }, [-3, -4]], value: 7.2 }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué tengo que normalizar si la dirección es la misma?', a: 'Porque la derivada direccional mide el cambio <em>por unidad de distancia</em>. Con $\\mathbf v = \\langle 3, 4\\rangle$ sin normalizar, cada «unidad» de $h$ te mueve 5, y el resultado sale 5 veces más grande. La dirección es la misma; la escala no.' },
          { q: '¿Y si el ángulo viene en grados?', a: 'Puedes usarlo en grados si tu calculadora está en grados: $\\langle\\cos 30°, \\sin 30°\\rangle$ es el mismo vector que $\\langle\\cos\\frac{\\pi}{6}, \\sin\\frac{\\pi}{6}\\rangle$. El problema es mezclar: un ángulo en radianes con la calculadora en grados (o al revés).' },
          { q: '¿$D_{\\mathbf u} f$ puede ser mayor que $f_x$ y que $f_y$?', a: 'Sí. Con $f_x = 3$ y $f_y = 4$, en la dirección $\\langle 0.6, 0.8\\rangle$ sale $1.8 + 3.2 = 5$. El máximo posible es $|\\nabla f| = \\sqrt{f_x^2 + f_y^2}$, que nunca es menor que $|f_x|$ ni que $|f_y|$.' },
          { q: 'Si $D_{\\mathbf u} f = 0$, ¿la función es constante?', a: 'No. Solo dice que <em>en ese punto y en esa dirección</em> la pendiente es cero: vas tangente a la curva de nivel. En otra dirección, o un poco más adelante, $f$ puede cambiar.' },
          { q: '¿Qué pasa si camino en la dirección contraria?', a: 'Cambia el signo: $D_{-\\mathbf u} f = -D_{\\mathbf u} f$. Si un sendero sube 0.3 m por metro hacia el norte, bajarlo hacia el sur baja 0.3 m por metro.' },
          { q: 'Para ir «de $P$ hacia $Q$», ¿uso las coordenadas de $Q$ como dirección?', a: 'No: la dirección es $Q - P$. Las coordenadas de $Q$ solas son la flecha desde el origen hasta $Q$, que apunta a otro lado (salvo que $P$ sea el origen).' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          '$D_{\\mathbf u} f$ es la pendiente de la superficie al caminar en la dirección del vector <strong>unitario</strong> $\\mathbf u$: la pendiente de la traza que deja un plano vertical que contiene a $\\mathbf u$.',
          'Se calcula con $D_{\\mathbf u} f = f_x\\,u_1 + f_y\\,u_2\\;(+\\,f_z\\,u_3) = \\nabla f\\cdot\\mathbf u$; con ángulo, $f_x\\cos\\theta + f_y\\sin\\theta$.',
          'Si te dan un vector o dos puntos, normaliza: $\\mathbf u = \\mathbf v/|\\mathbf v|$. Las parciales son los casos $\\mathbf u = \\mathbf i$ y $\\mathbf u = \\mathbf j$.',
          'En un mismo punto, $D_{\\mathbf u} f = |\\nabla f|\\cos\\alpha$: máxima hacia $\\nabla f$, mínima en contra y cero a lo largo de la curva de nivel.'
        ]
      }
    ],

    lab: {
      type: 'directional-derivative', title: 'Rota el vector u',
      intro: 'Elige una función, arrastra el punto $P$ y gira el vector unitario $\\mathbf u$ (arrastrando su punta o con el deslizador de $\\theta$). Mira en vivo $D_{\\mathbf u} f$, su curva contra $\\theta$ y el corte vertical en la dirección de $\\mathbf u$. En el reto calculas $D_{\\mathbf u} f$ a mano para una dirección dada con un vector o un ángulo; el lab te avisa si no normalizaste, si tu calculadora estaba en grados, si cruzaste $f_x$ y $f_y$ o si te faltó un término.',
      cfg: { start: 0 }
    },

    formulas: [
      { label: 'Definición', tex: 'D_{\\mathbf u} f(a, b) = \\lim_{h \\to 0} \\frac{f(a + hu_1, b + hu_2) - f(a, b)}{h}' },
      { label: 'Cálculo', tex: 'D_{\\mathbf u} f = f_x\\,u_1 + f_y\\,u_2 = \\nabla f\\cdot\\mathbf u' },
      { label: 'Con ángulo', tex: 'D_{\\mathbf u} f = f_x\\cos\\theta + f_y\\sin\\theta' },
      { label: 'Normalizar', tex: '\\mathbf u = \\frac{\\mathbf v}{|\\mathbf v|}' },
      { label: 'Tres variables', tex: 'D_{\\mathbf u} f = f_x u_1 + f_y u_2 + f_z u_3' },
      { label: 'Según el ángulo', tex: 'D_{\\mathbf u} f = |\\nabla f|\\cos\\alpha' }
    ],

    exercises: [
      {
        id: 'c2-s07-angulo', title: 'Con un ángulo',
        vars: { a: [1, 4, 1], b: [1, 5, 1], p: [-2, 3, 1], q: [1, 3, 1], k: [0, 11, 1] },
        prompt: function (v) { return '<p>Si $f(x, y) = ' + sum([co(v.a) + 'x^2', co(v.b) + 'xy']) + '$, calcula $D_{\\mathbf u} f(' + v.p + ', ' + v.q + ')$ en la dirección $\\theta = ' + angTex(v.k) + '$ (en radianes, medida desde $+x$).</p>'; },
        check: 'numeric',
        answer: function (v) { var gx = 2 * v.a * v.p + v.b * v.q, gy = v.b * v.p, t = ang(v.k); return gx * Math.cos(t) + gy * Math.sin(t); },
        mistakes: {
          degMode: function (v) { var gx = 2 * v.a * v.p + v.b * v.q, gy = v.b * v.p, t = ang(v.k) * Math.PI / 180; return gx * Math.cos(t) + gy * Math.sin(t); },
          swap: function (v) { var gx = 2 * v.a * v.p + v.b * v.q, gy = v.b * v.p, t = ang(v.k); return gx * Math.sin(t) + gy * Math.cos(t); },
          oneTerm: function (v) { var gx = 2 * v.a * v.p + v.b * v.q, t = ang(v.k); return gx * Math.cos(t); }
        },
        feedback: [
          { when: 'degMode', say: 'Tu calculadora estaba en grados: $\\theta$ está en radianes. Cámbiala a radianes (o usa los valores exactos de la tabla).' },
          { when: 'swap', say: 'Cruzaste los términos: $f_x$ va con $\\cos\\theta$ (la parte en $x$ de $\\mathbf u$) y $f_y$ con $\\sin\\theta$.' },
          { when: 'oneTerm', say: 'Te faltó el término $f_y\\sin\\theta$: al caminar en diagonal cambian $x$ y $y$ a la vez.' }
        ],
        oracle: { lab: 'call', mod: 'directional', fn: 'limitAt', math: true, args: function (v) { var t = ang(v.k); return [v.a + '*x^2 + ' + v.b + '*x*y', { x: v.p, y: v.q }, [Math.cos(t), Math.sin(t)]]; } },
        hint: 'Calcula $f_x$ y $f_y$ en el punto y usa $D_{\\mathbf u} f = f_x\\cos\\theta + f_y\\sin\\theta$.',
        solution: function (v) {
          var gx = 2 * v.a * v.p + v.b * v.q, gy = v.b * v.p, t = ang(v.k);
          return '$$f_x = ' + sum([(2 * v.a) + 'x', co(v.b) + 'y']) + ' = ' + gx + ',\\qquad f_y = ' + co(v.b) + 'x = ' + gy + '$$ $$D_{\\mathbf u} f = ' + gx + '\\cos' + angTex(v.k) + ' + ' + par(gy) + '\\sin' + angTex(v.k) + ' \\approx ' + fx(gx * Math.cos(t) + gy * Math.sin(t)) + '$$';
        }
      },
      {
        id: 'c2-s07-vector', title: 'Con un vector sin normalizar',
        vars: { a: [1, 4, 1], b: [1, 5, 1], p: [-2, 3, 1], q: [1, 3, 1], k: [0, 11, 1] },
        prompt: function (v) { return '<p>Si $f(x, y) = ' + sum([co(v.a) + 'x^2y', co(-v.b) + 'y^2']) + '$, calcula la derivada direccional en $P(' + v.p + ', ' + v.q + ')$ en la dirección del vector $\\mathbf v = ' + vec(VEC[v.k]) + '$.</p>'; },
        check: 'numeric',
        answer: function (v) { var d = VEC[v.k], gx = 2 * v.a * v.p * v.q, gy = v.a * v.p * v.p - 2 * v.b * v.q; return (gx * d[0] + gy * d[1]) / len(d); },
        mistakes: {
          noNorm: function (v) { var d = VEC[v.k], gx = 2 * v.a * v.p * v.q, gy = v.a * v.p * v.p - 2 * v.b * v.q; return gx * d[0] + gy * d[1]; },
          square: function (v) { var d = VEC[v.k], gx = 2 * v.a * v.p * v.q, gy = v.a * v.p * v.p - 2 * v.b * v.q; return (gx * d[0] + gy * d[1]) / (len(d) * len(d)); },
          swap: function (v) { var d = VEC[v.k], gx = 2 * v.a * v.p * v.q, gy = v.a * v.p * v.p - 2 * v.b * v.q; return (gx * d[1] + gy * d[0]) / len(d); }
        },
        feedback: [
          { when: 'noNorm', say: function (v) { return 'Usaste $\\mathbf v$ sin normalizar: mide $' + lenTex(VEC[v.k]) + '$, no 1. Divide entre $|\\mathbf v|$ antes (o después) del producto punto.'; } },
          { when: 'square', say: 'Dividiste entre $|\\mathbf v|^2$. Para normalizar se divide una sola vez entre $|\\mathbf v|$.' },
          { when: 'swap', say: 'Cruzaste las componentes: $f_x$ va con la componente en $x$ de $\\mathbf u$ y $f_y$ con la de $y$.' }
        ],
        oracle: { lab: 'call', mod: 'directional', fn: 'limitAt', math: true, args: function (v) { return [v.a + '*x^2*y - ' + v.b + '*y^2', { x: v.p, y: v.q }, VEC[v.k]]; } },
        hint: '$\\mathbf v$ no es unitario: primero $\\mathbf u = \\mathbf v/|\\mathbf v|$, luego $D_{\\mathbf u} f = f_x u_1 + f_y u_2$.',
        solution: function (v) {
          var d = VEC[v.k], gx = 2 * v.a * v.p * v.q, gy = v.a * v.p * v.p - 2 * v.b * v.q;
          return '$$f_x = ' + (2 * v.a) + 'xy = ' + gx + ',\\qquad f_y = ' + sum([co(v.a) + 'x^2', (-2 * v.b) + 'y']) + ' = ' + gy + '$$ $$|\\mathbf v| = ' + lenTex(d) + ',\\qquad D_{\\mathbf u} f = \\frac{' + gx + '(' + d[0] + ') + ' + par(gy) + '(' + d[1] + ')}{' + lenTex(d) + '} \\approx ' + fx((gx * d[0] + gy * d[1]) / len(d)) + '$$';
        }
      },
      {
        id: 'c2-s07-tres', title: 'Tres variables',
        vars: { a: [1, 4, 1], b: [1, 5, 1], p: [-2, 2, 1], q: [-2, 3, 1], r: [1, 3, 1], k: [0, 9, 1] },
        prompt: function (v) { return '<p>Si $f(x, y, z) = ' + sum([co(v.a) + 'x^2z', co(v.b) + 'yz']) + '$, calcula $D_{\\mathbf u} f$ en $P(' + v.p + ', ' + v.q + ', ' + v.r + ')$ en la dirección de $\\mathbf v = ' + vec(V3[v.k]) + '$.</p>'; },
        check: 'numeric',
        answer: function (v) { var d = V3[v.k], g = [2 * v.a * v.p * v.r, v.b * v.r, v.a * v.p * v.p + v.b * v.q]; return (g[0] * d[0] + g[1] * d[1] + g[2] * d[2]) / len(d); },
        mistakes: {
          noNorm: function (v) { var d = V3[v.k], g = [2 * v.a * v.p * v.r, v.b * v.r, v.a * v.p * v.p + v.b * v.q]; return g[0] * d[0] + g[1] * d[1] + g[2] * d[2]; },
          noZ: function (v) { var d = V3[v.k], g = [2 * v.a * v.p * v.r, v.b * v.r]; return (g[0] * d[0] + g[1] * d[1]) / len(d); }
        },
        feedback: [
          { when: 'noNorm', say: function (v) { return 'No normalizaste: $|\\mathbf v| = ' + len(V3[v.k]) + '$. Divide el producto punto entre ese largo.'; } },
          { when: 'noZ', say: 'Te faltó el término $f_z\\,u_3$: en tres variables son tres sumandos.' }
        ],
        oracle: { lab: 'call', mod: 'directional', fn: 'limitAt', math: true, args: function (v) { return [v.a + '*x^2*z + ' + v.b + '*y*z', { x: v.p, y: v.q, z: v.r }, V3[v.k]]; } },
        hint: 'Calcula $f_x$, $f_y$ y $f_z$ en $P$; normaliza $\\mathbf v$ y suma los tres productos.',
        solution: function (v) {
          var d = V3[v.k], g = [2 * v.a * v.p * v.r, v.b * v.r, v.a * v.p * v.p + v.b * v.q];
          return '$$f_x = ' + (2 * v.a) + 'xz = ' + g[0] + ',\\quad f_y = ' + co(v.b) + 'z = ' + g[1] + ',\\quad f_z = ' + sum([co(v.a) + 'x^2', co(v.b) + 'y']) + ' = ' + g[2] + '$$ $$|\\mathbf v| = ' + len(d) + ',\\qquad D_{\\mathbf u} f = \\frac{' + g[0] + '(' + d[0] + ') + ' + par(g[1]) + '(' + d[1] + ') + ' + par(g[2]) + '(' + d[2] + ')}{' + len(d) + '} \\approx ' + fx((g[0] * d[0] + g[1] * d[1] + g[2] * d[2]) / len(d)) + '$$';
        }
      },
      {
        id: 'c2-s07-temperatura', title: 'Temperatura hacia un punto',
        vars: { c: [60, 100, 10], a: [1, 3, 1], b: [1, 4, 1], p: [-3, 3, 1], q: [-3, 3, 1], s: [-4, 4, 1], t: [-4, 4, 1] },
        where: function (v) { return (v.s !== v.p || v.t !== v.q) && (v.s !== 0 || v.t !== 0) && (v.p !== 0 || v.q !== 0); },
        prompt: function (v) { return '<p>La temperatura de una placa es $T(x, y) = ' + v.c + ' - ' + co(v.a) + 'x^2 - ' + co(v.b) + 'y^2$ °C, con $x$ y $y$ en cm. Un sensor está en $P(' + v.p + ', ' + v.q + ')$ y se mueve en línea recta hacia $Q(' + v.s + ', ' + v.t + ')$. ¿Qué tan rápido cambia la temperatura al arrancar, en °C/cm?</p>'; },
        check: 'numeric', unit: '°C/cm',
        answer: function (v) { var d = [v.s - v.p, v.t - v.q], g = [-2 * v.a * v.p, -2 * v.b * v.q]; return (g[0] * d[0] + g[1] * d[1]) / len(d); },
        mistakes: {
          noNorm: function (v) { var d = [v.s - v.p, v.t - v.q], g = [-2 * v.a * v.p, -2 * v.b * v.q]; return g[0] * d[0] + g[1] * d[1]; },
          usedQ: function (v) { var d = [v.s, v.t], g = [-2 * v.a * v.p, -2 * v.b * v.q]; return (g[0] * d[0] + g[1] * d[1]) / len(d); },
          reversed: function (v) { var d = [v.p - v.s, v.q - v.t], g = [-2 * v.a * v.p, -2 * v.b * v.q]; return (g[0] * d[0] + g[1] * d[1]) / len(d); }
        },
        feedback: [
          { when: 'noNorm', say: 'No normalizaste $\\overrightarrow{PQ}$: divide entre su largo $|Q - P|$.' },
          { when: 'usedQ', say: 'Usaste las coordenadas de $Q$ como dirección. La dirección de $P$ a $Q$ es $Q - P$.' },
          { when: 'reversed', say: 'Usaste $P - Q$: esa es la dirección de $Q$ hacia $P$. El signo sale al revés.' }
        ],
        oracle: { lab: 'call', mod: 'directional', fn: 'limitAt', math: true, args: function (v) { return [v.c + ' - ' + v.a + '*x^2 - ' + v.b + '*y^2', { x: v.p, y: v.q }, [v.s - v.p, v.t - v.q]]; } },
        hint: 'La dirección es $\\overrightarrow{PQ} = Q - P$; normalízala y haz el producto punto con $\\langle T_x, T_y\\rangle$ en $P$.',
        solution: function (v) {
          var d = [v.s - v.p, v.t - v.q], g = [-2 * v.a * v.p, -2 * v.b * v.q], D = (g[0] * d[0] + g[1] * d[1]) / len(d);
          return '$$T_x = ' + (-2 * v.a) + 'x = ' + g[0] + ',\\qquad T_y = ' + (-2 * v.b) + 'y = ' + g[1] + '$$ $$\\overrightarrow{PQ} = ' + vec(d) + ',\\quad |\\overrightarrow{PQ}| = ' + lenTex(d) + '$$ $$D_{\\mathbf u} T = \\frac{' + g[0] + '(' + d[0] + ') + ' + par(g[1]) + '(' + d[1] + ')}{' + lenTex(d) + '} \\approx ' + fx(D) + '\\ \\text{°C/cm}$$ ' + (D > 0 ? 'Al arrancar, la temperatura sube.' : 'Al arrancar, la temperatura baja.');
        }
      },
      {
        id: 'c2-s07-maximo', title: 'La razón de cambio más grande',
        vars: { a: [1, 4, 1], b: [1, 6, 1], p: [-2, 3, 1], q: [1, 3, 1] },
        where: function (v) { return v.p !== 0; },
        prompt: function (v) { return '<p>Si $f(x, y) = ' + sum([co(v.a) + 'x^2y', co(v.b) + 'y']) + '$, ¿cuál es el valor <strong>máximo</strong> de $D_{\\mathbf u} f(' + v.p + ', ' + v.q + ')$ entre todas las direcciones $\\mathbf u$?</p>'; },
        check: 'numeric',
        answer: function (v) { return Math.hypot(2 * v.a * v.p * v.q, v.a * v.p * v.p + v.b); },
        mistakes: {
          sumComp: function (v) { return 2 * v.a * v.p * v.q + v.a * v.p * v.p + v.b; },
          squared: function (v) { var gx = 2 * v.a * v.p * v.q, gy = v.a * v.p * v.p + v.b; return gx * gx + gy * gy; }
        },
        feedback: [
          { when: 'sumComp', say: 'Sumaste $f_x + f_y$: eso es $D_{\\mathbf u} f$ con $\\mathbf u = \\langle 1, 1\\rangle$ sin normalizar. El máximo es el largo de $\\langle f_x, f_y\\rangle$.' },
          { when: 'squared', say: 'Te faltó la raíz: el máximo es $\\sqrt{f_x^2 + f_y^2}$.' }
        ],
        oracle: { lab: 'call', mod: 'directional', fn: 'extremesAt', math: true, field: 'max', args: function (v) { return [v.a + '*x^2*y + ' + v.b + '*y', { x: v.p, y: v.q }]; } },
        hint: '$D_{\\mathbf u} f = |\\nabla f|\\cos\\alpha$ es máxima cuando $\\alpha = 0$: vale $|\\nabla f| = \\sqrt{f_x^2 + f_y^2}$.',
        solution: function (v) {
          var gx = 2 * v.a * v.p * v.q, gy = v.a * v.p * v.p + v.b;
          return '$$f_x = ' + (2 * v.a) + 'xy = ' + gx + ',\\qquad f_y = ' + sum([co(v.a) + 'x^2', String(v.b)]) + ' = ' + gy + '$$ $$\\max D_{\\mathbf u} f = \\sqrt{' + par(gx) + '^2 + ' + par(gy) + '^2} \\approx ' + fx(Math.hypot(gx, gy)) + '$$ Se alcanza cuando $\\mathbf u$ apunta como $\\langle f_x, f_y\\rangle$.';
        }
      },
      {
        id: 'c2-s07-cero', title: '¿En qué dirección no cambia?',
        vars: { a: [1, 4, 1], b: [1, 4, 1], p: [1, 3, 1], q: [1, 3, 1] },
        where: function (v) { return v.a * v.p !== v.b * v.q; },
        prompt: function (v) { return '<p>Para $f(x, y) = ' + co(v.a) + 'x^2 + ' + co(v.b) + 'y^2$ en $P(' + v.p + ', ' + v.q + ')$, ¿en cuál de estas direcciones vale $D_{\\mathbf u} f = 0$?</p>'; },
        check: 'choice',
        options: function (v) {
          var m = v.a * v.p, n = v.b * v.q, g = gcd(m, n);
          m /= g; n /= g;
          return [
            { text: '$' + vec([n, -m]) + '$', correct: true },
            { text: '$' + vec([m, n]) + '$', say: 'Esa es la dirección de $\\nabla f$: ahí $D_{\\mathbf u} f$ es máxima, no cero.' },
            { text: '$' + vec([-m, -n]) + '$', say: 'Es la dirección opuesta a $\\nabla f$: ahí $D_{\\mathbf u} f$ es mínima (negativa).' },
            { text: '$' + vec([n, m]) + '$', say: 'Intercambiaste las componentes pero sin cambiar un signo: el producto punto con $\\nabla f$ no da cero.' }
          ];
        },
        answer: function (v) { var m = v.a * v.p, n = v.b * v.q, g = gcd(m, n); return '$' + vec([n / g, -m / g]) + '$'; },
        hint: '$D_{\\mathbf u} f = \\nabla f\\cdot\\mathbf u = 0$ cuando $\\mathbf u$ es perpendicular a $\\nabla f = \\langle f_x, f_y\\rangle$. El perpendicular de $\\langle m, n\\rangle$ es $\\langle n, -m\\rangle$.',
        solution: function (v) {
          var m = v.a * v.p, n = v.b * v.q, g = gcd(m, n);
          return '$\\nabla f(' + v.p + ', ' + v.q + ') = \\langle ' + (2 * m) + ', ' + (2 * n) + '\\rangle$, que apunta como $' + vec([m / g, n / g]) + '$. Su perpendicular $' + vec([n / g, -m / g]) + '$ da producto punto $' + (m / g) + '(' + (n / g) + ') + ' + (n / g) + '(' + (-m / g) + ') = 0$: en esa dirección vas sobre la curva de nivel.';
        }
      }
    ],

    quiz: { tags: ['c2.S07'], count: 8 },

    errors: [
      'No normalizar la dirección: con $\\mathbf v = \\langle 3, 4\\rangle$ hay que usar $\\mathbf u = \\langle 0.6, 0.8\\rangle$; si no, el resultado sale 5 veces más grande.',
      'Usar la calculadora en grados con un ángulo en radianes (o al revés).',
      'Cruzar los términos: $f_x$ va con la componente en $x$ de $\\mathbf u$ y $f_y$ con la de $y$.',
      'Olvidar un término, sobre todo el de $z$ en tres variables.',
      'Usar las coordenadas de $Q$ como dirección en lugar de $\\overrightarrow{PQ} = Q - P$.',
      'Sustituir el punto antes de derivar, o evaluar las parciales en el punto equivocado.',
      'Creer que $D_{\\mathbf u} f = 0$ significa que la función es constante: solo es cero en esa dirección y en ese punto.'
    ],

    teacher: {
      plan: [
        'Arranca con el mapa de contorno: pregunta qué tan empinado está «hacia allá» señalando una diagonal.',
        'Explainer del corte inclinado: que vean que es la misma traza de la S04, con el plano girado.',
        'Deriva la fórmula práctica desde el diferencial de la S05 (dos renglones) y haz los ejemplos 1 y 2 en el pizarrón.',
        'Lab: carguen el cerro, giren $\\mathbf u$ y encuentren a ojo el máximo y los ceros en la sinusoide; luego resuelvan dos retos con vector sin normalizar.',
        'Cierra con la placa (unidades) y deja el gradiente como pregunta abierta para la S08.'
      ],
      check: [
        'Que normalicen siempre antes de calcular, y que lo digan en voz alta.',
        'Que escriban las unidades de toda derivada direccional.'
      ],
      note: 'El gradiente aparece aquí solo como atajo de cálculo ($\\nabla f\\cdot\\mathbf u$); su significado (máximo crecimiento, normal a curvas y superficies de nivel) es el tema de la S08.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §4.6 “Directional Derivatives and the Gradient”. <a href="https://openstax.org/books/calculus-volume-3/pages/4-6-directional-derivatives-and-the-gradient">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-06',
    next: 'sesion-08'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
