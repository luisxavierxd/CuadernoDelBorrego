/* =====================================================================
   Banco · Cálculo 2 · S07 · Derivada direccional.
   Preguntas propias. Las numéricas de derivada direccional llevan `fd`
   ({ f, pt, dir }): scripts/labs-math/directional-derivative.js las recalcula
   con un cociente centrado propio (f(P + hu) − f(P − hu))/2h, sin derivar a
   mano; otras llevan `alt`, la misma cantidad por otro camino.
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c2', '07'), C = K.C;

  function len(v) { var s = 0; for (var i = 0; i < v.length; i++) s += v[i] * v[i]; return Math.sqrt(s); }
  function unit(v) { var l = len(v); return v.map(function (c) { return c / l; }); }
  function dot(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }
  function vec(c) { return '\\langle ' + c.join(', ') + '\\rangle'; }
  function co(k) { return k === 1 ? '' : k === -1 ? '-' : String(k); }
  function sum(terms) {
    return terms.filter(function (t) { return t && t !== '0'; }).map(function (t, i) {
      t = String(t);
      if (i === 0) return t;
      return t.charAt(0) === '-' ? ' - ' + t.slice(1) : ' + ' + t;
    }).join('') || '0';
  }
  function wrap(t) { var w = t % (2 * Math.PI); return w < 0 ? w + 2 * Math.PI : w; }
  // Numérico en grados para el texto: 3 decimales sin ceros de sobra.
  function f3(v) { return Number(v.toFixed(3)).toString(); }

  // Ángulos «de tabla» en radianes (sin π/2, π ni 3π/2) y en grados.
  var ANG = [[1, 6], [1, 4], [1, 3], [2, 3], [3, 4], [5, 6], [7, 6], [5, 4], [4, 3], [5, 3], [7, 4], [11, 6]];
  function angTex(k) { var p = ANG[k][0], q = ANG[k][1]; return '\\frac{' + (p === 1 ? '' : p) + '\\pi}{' + q + '}'; }
  function ang(k) { return Math.PI * ANG[k][0] / ANG[k][1]; }
  function uA(k) { return [Math.cos(ang(k)), Math.sin(ang(k))]; }
  var DEG = [30, 45, 60, 120, 135, 150, 210, 225, 240, 300, 315, 330];
  function uD(k) { var t = DEG[k] * Math.PI / 180; return [Math.cos(t), Math.sin(t)]; }
  // Vectores no unitarios (2D) y en 3D con largo entero.
  var VEC = [[3, 4], [4, -3], [-3, 4], [5, 12], [12, -5], [1, 2], [2, -1], [1, 1], [-1, 3], [2, 3], [-4, -3], [-1, -2]];
  var V3 = [[1, 2, 2], [2, 1, 2], [2, -1, 2], [2, 2, 1], [1, -2, 2], [2, 3, 6], [2, -3, 6], [6, 2, 3], [1, 4, 8], [4, 4, 7]];
  var XY = function (v) { return { x: v.p, y: v.q }; };
  var XYZ = function (v) { return { x: v.p, y: v.q, z: v.r }; };

  // La respuesta y cada error típico difieren al menos 3 % entre sí, y la respuesta no es casi 0.
  function distinct(q) {
    return function (v) {
      if (q.baseWhere && !q.baseWhere(v)) return false;
      var vals = [q.answer(v)].concat(Object.keys(q.mistakes).map(function (k) { return q.mistakes[k](v); }));
      if (Math.abs(vals[0]) < 0.15) return false;
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (!isFinite(vals[i]) || !isFinite(vals[j])) return false;
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 0.5)) return false;
      }
      return true;
    };
  }
  function N(id, sub, d, vars, prompt, answer, why, o) {
    o = o || {};
    var q = K.N(id, sub, d, vars, prompt, answer, why, o);
    if (o.mistakes) { q.baseWhere = o.where; q.where = distinct(q); }
    else { var w = o.where; q.where = function (v) { return (!w || w(v)) && Math.abs(answer(v)) >= 0.15; }; }
    if (o.fd) q.fd = o.fd;
    if (o.alt) q.alt = o.alt;
    return q;
  }
  var SAY = {
    noNorm: 'No normalizaste la dirección: divide entre su largo para que $\\mathbf u$ mida 1.',
    swap: 'Cruzaste los términos: $f_x$ va con la componente en $x$ de $\\mathbf u$ y $f_y$ con la de $y$.',
    term: 'Te faltó un término del producto punto: cada parcial aporta su parte.',
    degMode: 'Tu calculadora estaba en grados, pero el ángulo está en radianes.'
  };
  // Derivada direccional: grad(v) a mano, dir(v) tal como se da (se normaliza aquí).
  // mk: errores típicos a detectar ('noNorm', 'swap', 'term', 'degMode').
  function DU(id, sub, d, vars, prompt, src, grad, pt, dir, why, o) {
    o = o || {};
    var mk = o.mk || [], mistakes = {}, feedback = [];
    var ans = function (v) { return dot(grad(v), unit(dir(v))); };
    mk.forEach(function (m) {
      if (m === 'noNorm') mistakes.noNorm = function (v) { return dot(grad(v), dir(v)); };
      if (m === 'swap') mistakes.swap = function (v) { var g = grad(v), u = unit(dir(v)); return g[0] * u[1] + g[1] * u[0]; };
      if (m === 'term') mistakes.term = function (v) { var g = grad(v), u = unit(dir(v)), n = g.length - 1; return ans(v) - g[n] * u[n]; };
      if (m === 'degMode') mistakes.degMode = function (v) { var g = grad(v), t = o.angle(v) * Math.PI / 180; return g[0] * Math.cos(t) + g[1] * Math.sin(t); };
      feedback.push({ when: m, say: SAY[m] });
    });
    return N(id, sub, d, vars, prompt, o.scale ? function (v) { return ans(v) * o.scale(v); } : ans, why, {
      where: o.where, unit: o.unit,
      mistakes: mk.length ? (o.scale ? scaleAll(mistakes, o.scale) : mistakes) : undefined,
      feedback: mk.length ? feedback : undefined,
      fd: function (v) { return { f: src(v), pt: pt(v), dir: dir(v), scale: o.scale ? o.scale(v) : undefined }; }
    });
  }
  function scaleAll(ms, s) {
    var out = {};
    Object.keys(ms).forEach(function (k) { out[k] = function (v) { return ms[k](v) * s(v); }; });
    return out;
  }
  var PQ = function (v) { return 'P(' + v.p + ', ' + v.q + ')'; };
  var PQR = function (v) { return 'P(' + v.p + ', ' + v.q + ', ' + v.r + ')'; };

  var Q = [
    /* ---------------- Idea: qué mide y de dónde sale ---------------- */
    C('i-mide', 'idea', 1, '$D_{\\mathbf u} f(P)$ mide…',
      'qué tan rápido cambia $f$ al moverte desde $P$ en la dirección de $\\mathbf u$, por unidad de distancia', [
        ['el valor de $f$ en el punto $P + \\mathbf u$', 'Eso es una altura, no una razón de cambio.'],
        ['la pendiente más grande posible en $P$, sin importar la dirección', 'Esa es $|\\nabla f|$; la derivada direccional depende de $\\mathbf u$.'],
        ['la distancia de $P$ a la curva de nivel más cercana', 'No mide distancias: mide cuánto cambia $f$ por unidad caminada.']],
      'Es una pendiente en la dirección de $\\mathbf u$.'),
    C('i-uj', 'idea', 1, '¿Con qué vector unitario $\\mathbf u$ la derivada direccional es exactamente $f_y$?',
      '$\\langle 0, 1\\rangle$', [
        ['$\\langle 1, 0\\rangle$', 'Esa dirección es $+x$: da $f_x$.'],
        ['$\\langle 1, 1\\rangle$', 'No es unitario y mezcla las dos parciales.'],
        ['$\\langle 0, -1\\rangle$', 'Hacia $-y$ da $-f_y$.']],
      'Con $\\mathbf u = \\mathbf j$: $D_{\\mathbf u} f = f_x(0) + f_y(1) = f_y$.'),
    C('i-ui', 'idea', 1, 'Si $\\mathbf u = \\langle 1, 0\\rangle$, entonces $D_{\\mathbf u} f$ es…',
      '$f_x$', [
        ['$f_y$', 'Para $f_y$ la dirección es $\\langle 0, 1\\rangle$.'],
        ['$f(1, 0)$', 'Es una derivada, no un valor de $f$.'],
        ['$0$', 'Solo sería 0 si $f_x = 0$.']],
      'Las parciales son derivadas direccionales en las direcciones de los ejes.'),
    C('i-oeste', 'idea', 2, 'Si caminas hacia el oeste, $\\mathbf u = \\langle -1, 0\\rangle$, la derivada direccional es…',
      '$-f_x$', [
        ['$f_x$', 'Caminar al revés invierte el signo de la pendiente.'],
        ['$-f_y$', 'El oeste es sobre el eje $x$, no el $y$.'],
        ['$|f_x|$', 'No se toma valor absoluto: puede ser negativa.']],
      '$D_{\\mathbf u} f = f_x(-1) + f_y(0) = -f_x$.'),
    C('i-corte', 'idea', 2, 'Geométricamente, $D_{\\mathbf u} f(P)$ es la pendiente de…',
      'la traza que deja el plano vertical que pasa por $P$ y contiene a $\\mathbf u$', [
        ['la curva de nivel que pasa por $P$', 'La curva de nivel vive en el plano $xy$ y sobre ella $f$ no cambia.'],
        ['la traza del plano $y = b$, siempre', 'Ese corte solo da $f_x$, que es el caso $\\mathbf u = \\mathbf i$.'],
        ['la recta que une $P$ con el origen', 'El origen no tiene nada que ver con la dirección $\\mathbf u$.']],
      'Se corta la superficie con un plano vertical en la dirección de $\\mathbf u$.'),
    C('i-limite', 'idea', 2, '¿Cuál es la definición de $D_{\\mathbf u} f(a, b)$ con $\\mathbf u = \\langle u_1, u_2\\rangle$ unitario?',
      '$\\displaystyle\\lim_{h \\to 0}\\frac{f(a + hu_1,\\, b + hu_2) - f(a, b)}{h}$', [
        ['$\\displaystyle\\lim_{h \\to 0}\\frac{f(a + h,\\, b + h) - f(a, b)}{h}$', 'Ese límite camina siempre en diagonal, y además $\\langle 1, 1\\rangle$ no es unitario.'],
        ['$\\displaystyle\\lim_{h \\to 0}\\big(f(a + hu_1,\\, b + hu_2) - f(a, b)\\big)$', 'Sin dividir entre $h$ el límite vale 0 para cualquier $f$ continua.'],
        ['$\\displaystyle\\lim_{h \\to 0}\\frac{f(a + hu_1,\\, b) - f(a, b)}{h}$', 'Solo mueve la $x$: se perdió el paso en $y$.']],
      'Avanzas $h$ en la dirección de $\\mathbf u$ y divides entre lo que avanzaste.'),
    C('i-signo', 'idea', 1, 'Si $D_{\\mathbf u} f(P) < 0$, al caminar desde $P$ en la dirección de $\\mathbf u$, el valor de $f$…',
      'baja', [
        ['sube', 'Una razón de cambio negativa significa que $f$ disminuye.'],
        ['se queda igual', 'Eso pasaría con $D_{\\mathbf u} f = 0$.'],
        ['baja solo si también $f_x < 0$', 'El signo de $D_{\\mathbf u} f$ ya dice todo en esa dirección.']],
      'El signo dice si $f$ sube o baja en esa dirección.'),
    C('i-cero', 'idea', 2, 'Si $D_{\\mathbf u} f(P) = 0$ para cierta $\\mathbf u$, eso significa que…',
      'en esa dirección, cerca de $P$, $f$ no cambia: vas tangente a la curva de nivel', [
        ['$f$ es constante en todo el plano', 'Solo se anula en esa dirección; en otras puede cambiar.'],
        ['$P$ es un máximo de $f$', 'En un máximo se anulan todas las direcciones, no solo una.'],
        ['$\\mathbf u$ es el vector cero', '$\\mathbf u$ es unitario: mide 1.']],
      'Pendiente cero en una dirección = te mueves a la misma altura (por la curva de nivel).'),
    C('i-opuesto', 'idea', 2, function (v) { return 'Si $D_{\\mathbf u} f(P) = ' + v.c + '$, ¿cuánto vale $D_{-\\mathbf u} f(P)$?'; },
      function (v) { return '$-' + v.c + '$'; }, [
        [function (v) { return '$' + v.c + '$'; }, 'Caminar en la dirección opuesta invierte el signo.'],
        ['$0$', 'No se anula: es la misma pendiente vista al revés.'],
        [function (v) { return '$\\frac{1}{' + v.c + '}$'; }, 'No se invierte el número; solo cambia el signo.']],
      '$\\nabla f\\cdot(-\\mathbf u) = -\\nabla f\\cdot\\mathbf u$.', { vars: { c: [2, 9, 1] } }),
    C('i-depende', 'idea', 1, 'En un mismo punto $P$, ¿la derivada direccional depende de la dirección $\\mathbf u$?',
      'Sí: cada dirección tiene su propia pendiente', [
        ['No: en un punto hay una sola pendiente', 'Piensa en un cerro: hacia la cima subes, por la curva de nivel no.'],
        ['Solo si $f$ es un polinomio', 'Depende de $\\mathbf u$ para cualquier $f$ con gradiente distinto de cero.'],
        ['Solo en tres variables', 'Ya en dos variables cambia con el ángulo.']],
      '$D_{\\mathbf u} f = |\\nabla f|\\cos\\alpha$ cambia con el ángulo.'),
    N('i-cociente', 'idea', 2, { p: [1, 4, 1], q: [1, 4, 1] },
      function (v) { return 'Para $f(x, y) = x^2 + y^2$ en $P(' + v.p + ', ' + v.q + ')$ y $\\mathbf u = \\langle 0.6, 0.8\\rangle$, calcula el cociente $\\dfrac{f(P + h\\mathbf u) - f(P)}{h}$ con $h = 0.1$. (Con $h \\to 0$ se acerca a $D_{\\mathbf u} f$.)'; },
      function (v) { return 2 * v.p * 0.6 + 2 * v.q * 0.8 + 0.1; },
      'Desarrolla: $\\frac{(p + 0.06)^2 + (q + 0.08)^2 - p^2 - q^2}{0.1} = 1.2p + 1.6q + 0.1$.',
      { alt: function (v) { var f = function (x, y) { return x * x + y * y; }; return (f(v.p + 0.06, v.q + 0.08) - f(v.p, v.q)) / 0.1; } }),
    N('i-cociente-xy', 'idea', 2, { p: [1, 5, 1], q: [1, 5, 1] },
      function (v) { return 'Para $f(x, y) = xy$ en $P(' + v.p + ', ' + v.q + ')$ y $\\mathbf u = \\langle 0.8, -0.6\\rangle$, calcula $\\dfrac{f(P + h\\mathbf u) - f(P)}{h}$ con $h = 0.1$.'; },
      function (v) { return 0.8 * v.q - 0.6 * v.p - 0.048; },
      '$\\frac{(p + 0.08)(q - 0.06) - pq}{0.1} = 0.8q - 0.6p - 0.048$; con $h \\to 0$ queda $0.8q - 0.6p$.',
      { alt: function (v) { return ((v.p + 0.08) * (v.q - 0.06) - v.p * v.q) / 0.1; } }),
    DU('i-du-i', 'idea', 1, { a: [2, 6, 1], p: [-2, 3, 1], q: [1, 4, 1] },
      function (v) { return 'Si $f(x, y) = ' + co(v.a) + 'x^2y$, calcula $D_{\\mathbf u} f(' + v.p + ', ' + v.q + ')$ con $\\mathbf u = \\langle 1, 0\\rangle$.'; },
      function (v) { return v.a + '*x^2*y'; }, function (v) { return [2 * v.a * v.p * v.q, v.a * v.p * v.p]; }, XY, function () { return [1, 0]; },
      'Con $\\mathbf u = \\mathbf i$ es $f_x = 2axy$.'),
    DU('i-du-j', 'idea', 1, { a: [2, 6, 1], b: [1, 9, 1], p: [1, 4, 1], q: [-2, 3, 1] },
      function (v) { return 'Si $f(x, y) = ' + co(v.a) + 'xy^2 + ' + co(v.b) + 'x$, calcula la derivada direccional en $P(' + v.p + ', ' + v.q + ')$ hacia $+y$, es decir con $\\mathbf u = \\mathbf j$.'; },
      function (v) { return v.a + '*x*y^2 + ' + v.b + '*x'; }, function (v) { return [v.a * v.q * v.q + v.b, 2 * v.a * v.p * v.q]; }, XY, function () { return [0, 1]; },
      'Con $\\mathbf u = \\mathbf j$ es $f_y = 2axy$.'),
    DU('i-du-oeste', 'idea', 2, { a: [1, 5, 1], b: [2, 9, 1], p: [-3, 3, 1], q: [-3, 3, 1] },
      function (v) { return 'Si $f(x, y) = ' + co(v.a) + 'x^2 + ' + co(v.b) + 'y$, ¿cuánto vale la derivada direccional en $P(' + v.p + ', ' + v.q + ')$ si caminas hacia el oeste, $\\mathbf u = \\langle -1, 0\\rangle$?'; },
      function (v) { return v.a + '*x^2 + ' + v.b + '*y'; }, function (v) { return [2 * v.a * v.p, v.b]; }, XY, function () { return [-1, 0]; },
      'Hacia el oeste sale $-f_x = -2ax$.'),
    DU('i-du-sur', 'idea', 2, { a: [1, 5, 1], b: [1, 4, 1], p: [-3, 3, 1], q: [-3, 3, 1] },
      function (v) { return 'Si $f(x, y) = ' + co(v.a) + 'xy + ' + co(v.b) + 'y^2$, calcula $D_{\\mathbf u} f$ en $P(' + v.p + ', ' + v.q + ')$ caminando hacia el sur, $\\mathbf u = \\langle 0, -1\\rangle$.'; },
      function (v) { return v.a + '*x*y + ' + v.b + '*y^2'; }, function (v) { return [v.a * v.q, v.a * v.p + 2 * v.b * v.q]; }, XY, function () { return [0, -1]; },
      'Hacia el sur sale $-f_y = -(ax + 2by)$.'),

    /* ---------------- u unitario: normalizar ---------------- */
    C('u-porque', 'unitario', 1, '¿Por qué en $D_{\\mathbf u} f$ se pide que $\\mathbf u$ sea unitario?',
      'Para que el resultado sea el cambio de $f$ por unidad de distancia recorrida', [
        ['Porque con vectores largos la derivada no existe', 'Sí existiría, pero saldría multiplicada por el largo del vector.'],
        ['Para que la respuesta siempre sea positiva', 'El signo depende de la dirección, no del largo.'],
        ['Por costumbre; da igual el largo', 'No da igual: con $|\\mathbf v| = 5$ el resultado sale 5 veces más grande.']],
      'Con $|\\mathbf u| = 1$, $h$ es exactamente la distancia caminada.'),
    C('u-cual', 'unitario', 1, '¿Cuál de estos vectores es unitario?',
      '$\\langle 0.6, -0.8\\rangle$', [
        ['$\\langle 1, 1\\rangle$', 'Mide $\\sqrt 2 \\approx 1.41$.'],
        ['$\\langle 3, 4\\rangle$', 'Mide 5.'],
        ['$\\langle 0.5, 0.5\\rangle$', 'Mide $\\sqrt{0.5} \\approx 0.71$.']],
      '$0.36 + 0.64 = 1$.'),
    C('u-efecto', 'unitario', 2, 'Si para la dirección de $\\mathbf v = \\langle 3, 4\\rangle$ usas $\\mathbf v$ sin normalizar, tu resultado…',
      'sale 5 veces el correcto', [
        ['sale 25 veces el correcto', 'El producto punto es lineal en $\\mathbf v$: escala por $|\\mathbf v| = 5$, no por su cuadrado.'],
        ['sale igual, porque la dirección es la misma', 'La dirección es la misma, pero el largo multiplica el resultado.'],
        ['sale la quinta parte del correcto', 'Al revés: $\\mathbf v$ es más largo que $\\mathbf u$.']],
      '$\\nabla f\\cdot\\mathbf v = |\\mathbf v|\\,(\\nabla f\\cdot\\mathbf u) = 5\\,D_{\\mathbf u} f$.'),
    C('u-angulo', 'unitario', 2, 'Si la dirección viene como $\\mathbf u = \\langle\\cos\\theta, \\sin\\theta\\rangle$, ¿hay que normalizarla?',
      'No: siempre mide 1, porque $\\cos^2\\theta + \\sin^2\\theta = 1$', [
        ['Sí, siempre hay que dividir entre su largo', 'Dividir entre 1 no cambia nada.'],
        ['Solo si $\\theta$ está en grados', 'Mide 1 en cualquier unidad de ángulo.'],
        ['Sí, dividiendo entre $\\cos\\theta + \\sin\\theta$', 'Eso no es su largo y lo deformaría.']],
      'Los vectores de la forma $\\langle\\cos\\theta, \\sin\\theta\\rangle$ ya son unitarios.'),
    C('u-que-es', 'unitario', 1, 'Normalizar un vector $\\mathbf v$ significa…',
      'dividirlo entre su largo $|\\mathbf v|$', [
        ['dividirlo entre la suma de sus componentes', 'La suma de las componentes no es el largo.'],
        ['elevar al cuadrado sus componentes', 'Eso se hace para calcular el largo, no para normalizar.'],
        ['quitarle los signos negativos', 'Eso cambiaría la dirección.']],
      '$\\mathbf u = \\mathbf v/|\\mathbf v|$ apunta igual y mide 1.'),
    C('u-doble', 'unitario', 2, 'En el mismo punto, comparas la derivada direccional en la dirección de $\\mathbf v = \\langle 6, 8\\rangle$ con la de $\\mathbf w = \\langle 3, 4\\rangle$. ¿Qué pasa?',
      'Son iguales: los dos dan la misma dirección unitaria', [
        ['La de $\\mathbf v$ es el doble', 'Solo si no normalizas. Normalizados, los dos dan $\\langle 0.6, 0.8\\rangle$.'],
        ['La de $\\mathbf w$ es el doble', 'Tampoco: la dirección es la misma.'],
        ['No se puede saber sin conocer $f$', 'Sin conocer $f$ ya sabes que son iguales: la dirección unitaria es la misma.']],
      'La derivada direccional depende solo de la dirección.'),
    N('u-largo', 'unitario', 1, { k: [0, 11, 1] },
      function (v) { return '¿Cuánto mide el vector $\\mathbf v = ' + vec(VEC[v.k]) + '$? (Lo necesitas para normalizarlo.)'; },
      function (v) { return len(VEC[v.k]); }, '$|\\mathbf v| = \\sqrt{v_1^2 + v_2^2}$.',
      { alt: function (v) { var c = VEC[v.k]; return Math.hypot(c[0], c[1]); } }),
    N('u-comp1', 'unitario', 2, { p: [-6, 6, 1], q: [1, 6, 1] },
      function (v) { return 'Al normalizar $\\mathbf v = \\langle ' + v.p + ', ' + v.q + '\\rangle$, ¿cuánto vale la componente en $y$ del vector unitario?'; },
      function (v) { return v.q / Math.sqrt(v.p * v.p + v.q * v.q); }, 'Divide la componente entre $|\\mathbf v|$.',
      { alt: function (v) { return Math.sin(Math.atan2(v.q, v.p)); } }),
    N('u-comp2', 'unitario', 2, { p: [1, 6, 1], q: [-6, 6, 1] },
      function (v) { return 'Escribe $\\mathbf u = \\mathbf v/|\\mathbf v|$ para $\\mathbf v = \\langle ' + v.p + ', ' + v.q + '\\rangle$. ¿Cuánto vale su primera componente $u_1$?'; },
      function (v) { return v.p / Math.sqrt(v.p * v.p + v.q * v.q); }, '$u_1 = v_1/|\\mathbf v|$.',
      { alt: function (v) { return Math.cos(Math.atan2(v.q, v.p)); } }),
    DU('u-du-cuad', 'unitario', 2, { a: [1, 4, 1], b: [1, 4, 1], p: [-3, 3, 1], q: [-3, 3, 1], k: [0, 11, 1] },
      function (v) { return 'Si $f(x, y) = ' + co(v.a) + 'x^2 + ' + co(v.b) + 'y^2$, calcula $D_{\\mathbf u} f$ en $' + PQ(v) + '$ en la dirección de $\\mathbf v = ' + vec(VEC[v.k]) + '$.'; },
      function (v) { return v.a + '*x^2 + ' + v.b + '*y^2'; }, function (v) { return [2 * v.a * v.p, 2 * v.b * v.q]; }, XY, function (v) { return VEC[v.k]; },
      'Normaliza $\\mathbf v$ y haz el producto punto con $\\langle 2ax, 2by\\rangle$.', { mk: ['noNorm'] }),
    DU('u-du-xy', 'unitario', 2, { a: [1, 6, 1], p: [-3, 3, 1], q: [-3, 3, 1], k: [0, 11, 1] },
      function (v) { return 'Para $f(x, y) = ' + co(v.a) + 'xy$, ¿cuál es la derivada direccional en $' + PQ(v) + '$ en la dirección del vector $' + vec(VEC[v.k]) + '$?'; },
      function (v) { return v.a + '*x*y'; }, function (v) { return [v.a * v.q, v.a * v.p]; }, XY, function (v) { return VEC[v.k]; },
      '$\\nabla f = \\langle ay, ax\\rangle$; normaliza antes del producto punto.', { mk: ['noNorm', 'swap'] }),
    DU('u-du-plano', 'unitario', 1, { a: [-6, 6, 1], b: [-6, 6, 1], c: [1, 9, 1], k: [0, 11, 1] },
      function (v) { return 'Si $f(x, y) = ' + sum([co(v.a) + 'x', co(v.b) + 'y', String(v.c)]) + '$, calcula su derivada direccional (en cualquier punto) en la dirección de $\\mathbf v = ' + vec(VEC[v.k]) + '$.'; },
      function (v) { return v.a + '*x + ' + v.b + '*y + ' + v.c; }, function (v) { return [v.a, v.b]; }, function () { return { x: 0.5, y: -0.5 }; }, function (v) { return VEC[v.k]; },
      'Un plano tiene las mismas parciales en todos lados: $\\langle a, b\\rangle\\cdot\\mathbf v/|\\mathbf v|$.', { mk: ['noNorm'], where: function (v) { return v.a !== 0 && v.b !== 0; } }),
    DU('u-du-x2y', 'unitario', 2, { a: [1, 4, 1], p: [-2, 3, 1], q: [-2, 3, 1], s: [-4, 4, 1], t: [-4, 4, 1] },
      function (v) { return 'Si $f(x, y) = ' + co(v.a) + 'x^2y$, calcula $D_{\\mathbf u} f(' + v.p + ', ' + v.q + ')$ donde $\\mathbf u$ es el vector unitario en la dirección de $\\langle ' + v.s + ', ' + v.t + '\\rangle$.'; },
      function (v) { return v.a + '*x^2*y'; }, function (v) { return [2 * v.a * v.p * v.q, v.a * v.p * v.p]; }, XY, function (v) { return [v.s, v.t]; },
      '$\\nabla f = \\langle 2axy, ax^2\\rangle$; normaliza $\\langle s, t\\rangle$.', { mk: ['noNorm'], where: function (v) { return v.s * v.s + v.t * v.t > 1; } }),
    DU('u-du-cubo', 'unitario', 3, { a: [1, 5, 1], p: [-2, 2, 1], q: [-2, 3, 1], k: [0, 11, 1] },
      function (v) { return 'Si $f(x, y) = x^3 - ' + co(v.a) + 'xy$, calcula la razón de cambio de $f$ en $' + PQ(v) + '$ en la dirección de $' + vec(VEC[v.k]) + '$.'; },
      function (v) { return 'x^3 - ' + v.a + '*x*y'; }, function (v) { return [3 * v.p * v.p - v.a * v.q, -v.a * v.p]; }, XY, function (v) { return VEC[v.k]; },
      '$\\nabla f = \\langle 3x^2 - ay, -ax\\rangle$; normaliza la dirección.', { mk: ['noNorm', 'swap'] }),
    N('u-arreglar', 'unitario', 2, { c: [-40, 40, 1] },
      function (v) { return 'Un compañero calculó la derivada direccional en la dirección de $\\mathbf v = \\langle 3, 4\\rangle$ usando $\\mathbf v$ sin normalizar y obtuvo $' + v.c + '$. ¿Cuál era el valor correcto?'; },
      function (v) { return v.c / 5; }, 'Sin normalizar sale $|\\mathbf v| = 5$ veces el correcto: divide entre 5.',
      { alt: function (v) { return v.c * (0.6 * 0.6 + 0.8 * 0.8) / Math.hypot(3, 4); }, where: function (v) { return Math.abs(v.c) >= 2; } }),

    /* ---------------- Cálculo con la fórmula ---------------- */
    C('c-formula', 'calculo', 1, 'Si $\\mathbf u = \\langle a, b\\rangle$ es unitario, la derivada direccional se calcula como…',
      '$f_x\\,a + f_y\\,b$', [
        ['$f_x\\,b + f_y\\,a$', 'Las componentes están cruzadas: $f_x$ va con la componente en $x$.'],
        ['$f_x + f_y$', 'Eso sería con $\\langle 1, 1\\rangle$, que ni siquiera es unitario.'],
        ['$(f_x\\,a)(f_y\\,b)$', 'Es una suma (producto punto), no un producto.']],
      '$D_{\\mathbf u} f = \\nabla f\\cdot\\mathbf u$.'),
    C('c-formula-ang', 'calculo', 1, 'Con $\\mathbf u = \\langle\\cos\\theta, \\sin\\theta\\rangle$, la derivada direccional es…',
      '$f_x\\cos\\theta + f_y\\sin\\theta$', [
        ['$f_x\\sin\\theta + f_y\\cos\\theta$', 'Cruzaste: el coseno es la componente en $x$.'],
        ['$(f_x + f_y)\\cos\\theta$', 'Cada parcial va con su propia componente.'],
        ['$f_x\\cos\\theta - f_y\\sin\\theta$', 'No hay resta: es un producto punto.']],
      'Producto punto de $\\langle f_x, f_y\\rangle$ con $\\langle\\cos\\theta, \\sin\\theta\\rangle$.'),
    C('c-grados', 'calculo', 2, 'El ángulo es $\\theta = \\dfrac{\\pi}{4}$ y tu calculadora da $\\cos(\\pi/4) = 0.99991$. ¿Qué pasa?',
      'La calculadora está en grados; con $\\theta$ en radianes debe estar en radianes', [
        ['Todo bien: $\\cos(\\pi/4)$ vale casi 1', '$\\cos(\\pi/4) = \\sqrt 2/2 \\approx 0.707$.'],
        ['Hay que normalizar el vector', 'El problema no es el largo sino el modo de la calculadora.'],
        ['$\\pi/4$ no es un ángulo válido', 'Sí lo es: son 45°.']],
      'En modo grados, $\\cos(0.785°) \\approx 0.9999$.'),
    C('c-orden', 'calculo', 2, 'Para $D_{\\mathbf u} f(P)$, ¿cuál es un orden correcto de pasos?',
      'Derivar $f_x$ y $f_y$, evaluarlas en $P$, normalizar la dirección y hacer el producto punto', [
        ['Sustituir $P$ en $f$, derivar el número y multiplicar por $\\mathbf u$', 'Un número deriva a 0: primero se deriva, después se sustituye.'],
        ['Hacer el producto punto de $P$ con $\\mathbf u$ y derivar el resultado', '$P$ es un punto, no el gradiente.'],
        ['Normalizar $\\nabla f$ y multiplicarlo por $|\\mathbf u|$', 'Lo que se normaliza es la dirección, no el gradiente.']],
      'Parciales en $P$, dirección unitaria, producto punto.'),
    DU('c-ang-cuad', 'calculo', 1, { a: [1, 4, 1], b: [1, 4, 1], p: [-2, 3, 1], q: [1, 3, 1], k: [0, 11, 1] },
      function (v) { return 'Si $f(x, y) = ' + co(v.a) + 'x^2 + ' + co(v.b) + 'y^2$, calcula $D_{\\mathbf u} f(' + v.p + ', ' + v.q + ')$ con $\\mathbf u$ a un ángulo $\\theta = ' + angTex(v.k) + '$ de $+x$.'; },
      function (v) { return v.a + '*x^2 + ' + v.b + '*y^2'; }, function (v) { return [2 * v.a * v.p, 2 * v.b * v.q]; }, XY, function (v) { return uA(v.k); },
      '$D_{\\mathbf u} f = 2ax\\cos\\theta + 2by\\sin\\theta$.', { mk: ['degMode', 'swap'], angle: function (v) { return ang(v.k); } }),
    DU('c-ang-xy', 'calculo', 2, { a: [1, 6, 1], p: [-3, 3, 1], q: [1, 3, 1], k: [0, 11, 1] },
      function (v) { return 'Para $f(x, y) = ' + co(v.a) + 'xy$, ¿cuánto vale la derivada direccional en $' + PQ(v) + '$ en la dirección $\\theta = ' + angTex(v.k) + '$?'; },
      function (v) { return v.a + '*x*y'; }, function (v) { return [v.a * v.q, v.a * v.p]; }, XY, function (v) { return uA(v.k); },
      '$\\nabla f = \\langle ay, ax\\rangle$ y $\\mathbf u = \\langle\\cos\\theta, \\sin\\theta\\rangle$.', { mk: ['degMode'], angle: function (v) { return ang(v.k); }, where: function (v) { return v.p !== 0; } }),
    DU('c-ang-x2y', 'calculo', 2, { a: [1, 4, 1], b: [1, 6, 1], p: [-2, 3, 1], q: [1, 3, 1], k: [0, 11, 1] },
      function (v) { return 'Si $f(x, y) = ' + co(v.a) + 'x^2y - ' + co(v.b) + 'x$, calcula $D_{\\mathbf u} f$ en $' + PQ(v) + '$ para $\\mathbf u = \\left\\langle\\cos ' + angTex(v.k) + ', \\sin ' + angTex(v.k) + '\\right\\rangle$.'; },
      function (v) { return v.a + '*x^2*y - ' + v.b + '*x'; }, function (v) { return [2 * v.a * v.p * v.q - v.b, v.a * v.p * v.p]; }, XY, function (v) { return uA(v.k); },
      '$f_x = 2axy - b$, $f_y = ax^2$.', { mk: ['swap', 'term'] }),
    DU('c-ang-plano', 'calculo', 1, { a: [-6, 6, 1], b: [-6, 6, 1], k: [0, 11, 1] },
      function (v) { return 'El plano $z = ' + sum([co(v.a) + 'x', co(v.b) + 'y']) + ' + 10$ tiene la misma pendiente en cualquier punto para una dirección dada. ¿Cuánto vale en la dirección $\\theta = ' + angTex(v.k) + '$?'; },
      function (v) { return v.a + '*x + ' + v.b + '*y + 10'; }, function (v) { return [v.a, v.b]; }, function () { return { x: 1, y: 1 }; }, function (v) { return uA(v.k); },
      '$D_{\\mathbf u} f = a\\cos\\theta + b\\sin\\theta$.', { mk: ['swap'], where: function (v) { return v.a !== 0 && v.b !== 0; } }),
    DU('c-ang-cubo', 'calculo', 3, { a: [1, 4, 1], p: [-2, 2, 1], q: [-2, 2, 1], k: [0, 11, 1] },
      function (v) { return 'Si $f(x, y) = x^3 + ' + co(v.a) + 'xy^2$, calcula la derivada direccional en $' + PQ(v) + '$ en la dirección que forma $' + angTex(v.k) + '$ radianes con el eje $+x$.'; },
      function (v) { return 'x^3 + ' + v.a + '*x*y^2'; }, function (v) { return [3 * v.p * v.p + v.a * v.q * v.q, 2 * v.a * v.p * v.q]; }, XY, function (v) { return uA(v.k); },
      '$f_x = 3x^2 + ay^2$, $f_y = 2axy$.', { mk: ['degMode', 'swap'], angle: function (v) { return ang(v.k); } }),
    DU('c-ang-exp', 'calculo', 3, { a: [1, 3, 1], q: [-1, 1, 0.5], k: [0, 11, 1] },
      function (v) { return 'Si $f(x, y) = x\\,e^{' + co(v.a) + 'y}$, calcula $D_{\\mathbf u} f(2, ' + v.q + ')$ con $\\theta = ' + angTex(v.k) + '$.'; },
      function (v) { return 'x*e^(' + v.a + '*y)'; }, function (v) { var e = Math.exp(v.a * v.q); return [e, 2 * v.a * e]; }, function (v) { return { x: 2, y: v.q }; }, function (v) { return uA(v.k); },
      '$f_x = e^{ay}$, $f_y = ax\\,e^{ay}$ (regla de la cadena).', { mk: ['swap'] }),
    DU('c-ang-trig', 'calculo', 3, { b: [1, 6, 1], q: [-2, 2, 1], k: [0, 11, 1] },
      function (v) { return 'Si $f(x, y) = \\sin x + ' + co(v.b) + 'xy$, calcula la derivada direccional en $(0, ' + v.q + ')$ en la dirección $\\theta = ' + angTex(v.k) + '$.'; },
      function (v) { return 'sin(x) + ' + v.b + '*x*y'; }, function (v) { return [1 + v.b * v.q, 0]; }, function (v) { return { x: 0, y: v.q }; }, function (v) { return uA(v.k); },
      'En $x = 0$: $f_x = \\cos 0 + by = 1 + by$ y $f_y = bx = 0$.', { mk: ['swap'] }),
    DU('c-grados-dato', 'calculo', 2, { a: [1, 4, 1], b: [1, 5, 1], p: [-2, 3, 1], q: [1, 3, 1], k: [0, 11, 1] },
      function (v) { return 'Si $f(x, y) = ' + co(v.a) + 'x^2 - ' + co(v.b) + 'xy$, calcula $D_{\\mathbf u} f(' + v.p + ', ' + v.q + ')$ en la dirección que forma ' + DEG[v.k] + '° con el eje $+x$.'; },
      function (v) { return v.a + '*x^2 - ' + v.b + '*x*y'; }, function (v) { return [2 * v.a * v.p - v.b * v.q, -v.b * v.p]; }, XY, function (v) { return uD(v.k); },
      '$f_x = 2ax - by$, $f_y = -bx$; con el ángulo en grados, la calculadora en grados.', { mk: ['swap'], where: function (v) { return v.p !== 0; } }),
    DU('c-vec-exp', 'calculo', 2, { a: [1, 3, 1], p: [1, 3, 1], k: [0, 11, 1] },
      function (v) { return 'Si $f(x, y) = ' + co(v.a) + 'x\\,e^{y}$, calcula la derivada direccional en $(' + v.p + ', 0)$ en la dirección de $' + vec(VEC[v.k]) + '$.'; },
      function (v) { return v.a + '*x*e^y'; }, function (v) { return [v.a, v.a * v.p]; }, function (v) { return { x: v.p, y: 0 }; }, function (v) { return VEC[v.k]; },
      'En $y = 0$: $f_x = a$, $f_y = ax$.', { mk: ['noNorm', 'swap'] }),
    DU('c-vec-raiz', 'calculo', 3, { k: [0, 11, 1], j: [0, 3, 1] },
      function (v) { var P = [[3, 4], [4, 3], [0, 5], [5, 12]][v.j]; return 'Si $f(x, y) = \\sqrt{x^2 + y^2}$, calcula $D_{\\mathbf u} f(' + P[0] + ', ' + P[1] + ')$ en la dirección de $\\mathbf v = ' + vec(VEC[v.k]) + '$.'; },
      function () { return 'sqrt(x^2 + y^2)'; }, function (v) { var P = [[3, 4], [4, 3], [0, 5], [5, 12]][v.j], r = len(P); return [P[0] / r, P[1] / r]; },
      function (v) { var P = [[3, 4], [4, 3], [0, 5], [5, 12]][v.j]; return { x: P[0], y: P[1] }; }, function (v) { return VEC[v.k]; },
      '$f_x = x/\\sqrt{x^2 + y^2}$, $f_y = y/\\sqrt{x^2 + y^2}$.', { mk: ['noNorm'] }),
    DU('c-vec-trig', 'calculo', 3, { a: [1, 4, 1], k: [0, 11, 1] },
      function (v) { return 'Si $f(x, y) = \\cos(x) + ' + co(v.a) + 'y^2$, calcula $D_{\\mathbf u} f$ en $\\left(\\frac{\\pi}{2}, 1\\right)$ en la dirección de $' + vec(VEC[v.k]) + '$.'; },
      function (v) { return 'cos(x) + ' + v.a + '*y^2'; }, function (v) { return [-1, 2 * v.a]; }, function () { return { x: Math.PI / 2, y: 1 }; }, function (v) { return VEC[v.k]; },
      '$f_x = -\\sin x = -1$ y $f_y = 2ay = 2a$.', { mk: ['noNorm', 'swap'] }),
    DU('c-vec-cociente', 'calculo', 3, { p: [1, 4, 1], q: [1, 4, 1], k: [0, 11, 1] },
      function (v) { return 'Si $f(x, y) = \\dfrac{x}{y}$, calcula la derivada direccional en $' + PQ(v) + '$ en la dirección de $' + vec(VEC[v.k]) + '$.'; },
      function () { return 'x/y'; }, function (v) { return [1 / v.q, -v.p / (v.q * v.q)]; }, XY, function (v) { return VEC[v.k]; },
      '$f_x = 1/y$, $f_y = -x/y^2$.', { mk: ['noNorm'] }),
    DU('c-hacia-q', 'calculo', 2, { a: [1, 4, 1], p: [-3, 3, 1], q: [-3, 3, 1], s: [-4, 4, 1], t: [-4, 4, 1] },
      function (v) { return 'Si $f(x, y) = ' + co(v.a) + 'x^2 + xy$, calcula $D_{\\mathbf u} f$ en $' + PQ(v) + '$ en la dirección que va hacia el punto $Q(' + v.s + ', ' + v.t + ')$.'; },
      function (v) { return v.a + '*x^2 + x*y'; }, function (v) { return [2 * v.a * v.p + v.q, v.p]; }, XY, function (v) { return [v.s - v.p, v.t - v.q]; },
      'Dirección $\\overrightarrow{PQ} = Q - P$, normalizada.', { mk: ['noNorm'], where: function (v) { return (v.s - v.p) * (v.s - v.p) + (v.t - v.q) * (v.t - v.q) > 1; } }),
    DU('c-hacia-origen', 'calculo', 2, { a: [1, 4, 1], b: [1, 4, 1], p: [-4, 4, 1], q: [-4, 4, 1] },
      function (v) { return 'Si $f(x, y) = ' + co(v.a) + 'x^2 - ' + co(v.b) + 'y^2$, ¿qué tan rápido cambia $f$ en $' + PQ(v) + '$ si te mueves hacia el origen?'; },
      function (v) { return v.a + '*x^2 - ' + v.b + '*y^2'; }, function (v) { return [2 * v.a * v.p, -2 * v.b * v.q]; }, XY, function (v) { return [-v.p, -v.q]; },
      'Hacia el origen, la dirección es $\\langle -p, -q\\rangle$ (normalizada).', { mk: ['noNorm'], where: function (v) { return v.p * v.p + v.q * v.q > 1; } }),
    DU('c-diagonal', 'calculo', 1, { a: [1, 5, 1], b: [1, 5, 1], p: [-3, 3, 1], q: [-3, 3, 1] },
      function (v) { return 'Si $f(x, y) = ' + co(v.a) + 'x^2 + ' + co(v.b) + 'xy$, calcula la derivada direccional en $' + PQ(v) + '$ en la diagonal $\\mathbf u = \\left\\langle\\frac{1}{\\sqrt 2}, \\frac{1}{\\sqrt 2}\\right\\rangle$.'; },
      function (v) { return v.a + '*x^2 + ' + v.b + '*x*y'; }, function (v) { return [2 * v.a * v.p + v.b * v.q, v.b * v.p]; }, XY, function () { return [1, 1]; },
      '$D_{\\mathbf u} f = (f_x + f_y)/\\sqrt 2$.'),
    DU('c-vec-poli', 'calculo', 2, { a: [1, 4, 1], b: [1, 6, 1], p: [-2, 2, 1], q: [-2, 2, 1], k: [0, 11, 1] },
      function (v) { return 'Si $f(x, y) = ' + co(v.a) + 'x^2y^2 + ' + co(v.b) + 'y$, ¿cuánto vale $D_{\\mathbf u} f(' + v.p + ', ' + v.q + ')$ para la dirección de $\\mathbf w = ' + vec(VEC[v.k]) + '$?'; },
      function (v) { return v.a + '*x^2*y^2 + ' + v.b + '*y'; }, function (v) { return [2 * v.a * v.p * v.q * v.q, 2 * v.a * v.p * v.p * v.q + v.b]; }, XY, function (v) { return VEC[v.k]; },
      '$f_x = 2axy^2$, $f_y = 2ax^2y + b$; normaliza $\\mathbf w$.', { mk: ['noNorm', 'swap'] }),
    DU('c-vec-lin', 'calculo', 1, { a: [1, 5, 1], b: [1, 5, 1], p: [-3, 3, 1], q: [-3, 3, 1] },
      function (v) { return 'Si $f(x, y) = ' + co(v.a) + 'x^2 + ' + co(v.b) + 'y$, calcula $D_{\\mathbf u} f(' + v.p + ', ' + v.q + ')$ con $\\mathbf u = \\langle 0.6, 0.8\\rangle$.'; },
      function (v) { return v.a + '*x^2 + ' + v.b + '*y'; }, function (v) { return [2 * v.a * v.p, v.b]; }, XY, function () { return [0.6, 0.8]; },
      '$D_{\\mathbf u} f = 0.6\\,f_x + 0.8\\,f_y$.', { mk: ['swap'] }),
    DU('c-vec-neg', 'calculo', 1, { a: [1, 5, 1], b: [1, 5, 1], p: [-3, 3, 1], q: [-3, 3, 1] },
      function (v) { return 'Para $f(x, y) = ' + co(v.a) + 'xy - ' + co(v.b) + 'x$, calcula la derivada direccional en $' + PQ(v) + '$ con el vector unitario $\\langle -0.8, 0.6\\rangle$.'; },
      function (v) { return v.a + '*x*y - ' + v.b + '*x'; }, function (v) { return [v.a * v.q - v.b, v.a * v.p]; }, XY, function () { return [-0.8, 0.6]; },
      '$D_{\\mathbf u} f = -0.8\\,f_x + 0.6\\,f_y$.', { mk: ['swap'] }),

    /* ---------------- Varias direcciones: máximo, mínimo y cero ---------------- */
    C('d-max-dir', 'direcciones', 1, 'En un punto con $\\nabla f \\neq \\mathbf 0$, $D_{\\mathbf u} f$ es máxima cuando $\\mathbf u$ apunta…',
      'en la misma dirección que $\\nabla f = \\langle f_x, f_y\\rangle$', [
        ['perpendicular a $\\nabla f$', 'Ahí $D_{\\mathbf u} f = 0$: vas por la curva de nivel.'],
        ['en dirección opuesta a $\\nabla f$', 'Ahí es mínima.'],
        ['siempre hacia $+x$', 'Hacia $+x$ solo da $f_x$, que no tiene por qué ser lo máximo.']],
      '$D_{\\mathbf u} f = |\\nabla f|\\cos\\alpha$ es máxima con $\\alpha = 0$.'),
    C('d-max-val', 'direcciones', 1, 'El valor máximo de $D_{\\mathbf u} f(P)$ entre todas las direcciones es…',
      '$\\sqrt{f_x^2 + f_y^2}$', [
        ['$f_x + f_y$', 'Eso es usar $\\langle 1, 1\\rangle$ sin normalizar.'],
        ['$f_x^2 + f_y^2$', 'Falta la raíz cuadrada.'],
        ['el mayor entre $f_x$ y $f_y$', 'En diagonal puede salir más que cualquiera de las dos.']],
      'Es el largo del gradiente, $|\\nabla f|$.'),
    C('d-min', 'direcciones', 2, 'El valor mínimo de $D_{\\mathbf u} f(P)$ entre todas las direcciones es…',
      '$-|\\nabla f(P)|$', [
        ['$0$', 'Cero es lo que sale en las direcciones perpendiculares, no el mínimo.'],
        ['$-f_x - f_y$', 'Eso es con $\\langle -1, -1\\rangle$ sin normalizar.'],
        ['$|\\nabla f(P)|$', 'Ese es el máximo.']],
      'Con $\\alpha = \\pi$: $|\\nabla f|\\cos\\pi = -|\\nabla f|$.'),
    C('d-cero-dir', 'direcciones', 2, 'Si $\\nabla f(P) \\neq \\mathbf 0$, ¿en qué direcciones vale $D_{\\mathbf u} f(P) = 0$?',
      'En las perpendiculares a $\\nabla f$, tangentes a la curva de nivel que pasa por $P$', [
        ['En la dirección de $\\nabla f$', 'Esa es la de máximo crecimiento.'],
        ['En la opuesta a $\\nabla f$', 'Esa es la de máximo decrecimiento.'],
        ['En ninguna', 'Siempre hay dos: las tangentes a la curva de nivel.']],
      '$\\nabla f\\cdot\\mathbf u = 0$ cuando son perpendiculares.'),
    C('d-cuantas', 'direcciones', 2, 'Si $\\nabla f(P) \\neq \\mathbf 0$, ¿cuántas direcciones unitarias $\\mathbf u$ en el plano dan $D_{\\mathbf u} f(P) = 0$?',
      'Dos', [
        ['Una', 'Si $\\mathbf u$ sirve, $-\\mathbf u$ también: son dos.'],
        ['Cuatro', 'Solo hay dos perpendiculares a un vector en el plano.'],
        ['Infinitas', 'Eso pasa solo si $\\nabla f = \\mathbf 0$.']],
      'Las dos tangentes a la curva de nivel, opuestas entre sí.'),
    C('d-alfa', 'direcciones', 2, 'En la fórmula $D_{\\mathbf u} f = |\\nabla f|\\cos\\alpha$, ¿qué es $\\alpha$?',
      'El ángulo entre $\\mathbf u$ y $\\nabla f$', [
        ['El ángulo de $\\mathbf u$ con el eje $+x$', 'Ese es $\\theta$; $\\alpha$ se mide desde $\\nabla f$.'],
        ['El ángulo de la superficie con el piso', 'No es un ángulo de inclinación.'],
        ['El ángulo de $\\nabla f$ con el eje $+y$', 'Se mide entre $\\mathbf u$ y $\\nabla f$.']],
      'Viene de $\\mathbf A\\cdot\\mathbf B = |\\mathbf A||\\mathbf B|\\cos\\alpha$ con $|\\mathbf u| = 1$.'),
    C('d-grad-cero', 'direcciones', 3, 'Si en $P$ se cumple $f_x = 0$ y $f_y = 0$, entonces $D_{\\mathbf u} f(P)$…',
      'vale 0 en todas las direcciones', [
        ['vale 0 solo hacia $+x$ y $+y$', 'Con las dos parciales en 0, el producto punto es 0 para cualquier $\\mathbf u$.'],
        ['es máxima', 'Con gradiente cero no hay dirección preferida.'],
        ['no existe', 'Sí existe y vale 0 (si $f$ es diferenciable).']],
      '$\\langle 0, 0\\rangle\\cdot\\mathbf u = 0$.'),
    C('d-cero-vec', 'direcciones', 3, function (v) { return 'Para $f(x, y) = ' + co(v.a) + 'x^2 + ' + co(v.b) + 'y^2$ en $P(' + v.p + ', ' + v.q + ')$, ¿en cuál de estas direcciones $f$ no cambia (a primer orden)?'; },
      function (v) { var m = v.a * v.p, n = v.b * v.q, g = gcd(m, n); return '$' + vec([-n / g, m / g]) + '$'; }, [
        [function (v) { var m = v.a * v.p, n = v.b * v.q, g = gcd(m, n); return '$' + vec([m / g, n / g]) + '$'; }, 'Esa es la dirección de $\\nabla f$: ahí crece lo más rápido.'],
        [function (v) { var m = v.a * v.p, n = v.b * v.q, g = gcd(m, n); return '$' + vec([-m / g, -n / g]) + '$'; }, 'Opuesta a $\\nabla f$: ahí decrece lo más rápido.'],
        [function (v) { var m = v.a * v.p, n = v.b * v.q, g = gcd(m, n); return '$' + vec([n / g, m / g]) + '$'; }, 'Su producto punto con $\\nabla f$ no es 0.']],
      'La perpendicular a $\\nabla f = \\langle 2ap, 2bq\\rangle$.', { vars: { a: [1, 4, 1], b: [1, 4, 1], p: [1, 3, 1], q: [1, 3, 1] }, where: function (v) { return v.a * v.p !== v.b * v.q; } }),
    N('d-max-cuad', 'direcciones', 1, { a: [1, 4, 1], b: [1, 4, 1], p: [-3, 3, 1], q: [-3, 3, 1] },
      function (v) { return '¿Cuál es el valor máximo de $D_{\\mathbf u} f$ en $' + PQ(v) + '$ para $f(x, y) = ' + co(v.a) + 'x^2 + ' + co(v.b) + 'y^2$?'; },
      function (v) { return Math.hypot(2 * v.a * v.p, 2 * v.b * v.q); }, 'El máximo es $|\\nabla f| = \\sqrt{(2ap)^2 + (2bq)^2}$.',
      { mistakes: { sumComp: function (v) { return 2 * v.a * v.p + 2 * v.b * v.q; } }, feedback: [{ when: 'sumComp', say: 'Sumaste las parciales; el máximo es la raíz de la suma de sus cuadrados.' }],
        alt: function (v) { var f = function (x, y) { return v.a * x * x + v.b * y * y; }, h = 1e-4; return Math.hypot((f(v.p + h, v.q) - f(v.p - h, v.q)) / (2 * h), (f(v.p, v.q + h) - f(v.p, v.q - h)) / (2 * h)); } }),
    N('d-max-xy', 'direcciones', 2, { a: [1, 6, 1], p: [-3, 3, 1], q: [-3, 3, 1] },
      function (v) { return 'Para $f(x, y) = ' + co(v.a) + 'xy$, ¿qué tan rápido puede crecer $f$, como máximo, al salir de $' + PQ(v) + '$?'; },
      function (v) { return v.a * Math.hypot(v.p, v.q); }, '$\\nabla f = \\langle ay, ax\\rangle$; el máximo es su largo.',
      { alt: function (v) { var f = function (x, y) { return v.a * x * y; }, h = 1e-4; return Math.hypot((f(v.p + h, v.q) - f(v.p - h, v.q)) / (2 * h), (f(v.p, v.q + h) - f(v.p, v.q - h)) / (2 * h)); } }),
    N('d-max-plano', 'direcciones', 1, { a: [-6, 6, 1], b: [-6, 6, 1] },
      function (v) { return 'En el plano $z = ' + sum([co(v.a) + 'x', co(v.b) + 'y']) + '$, ¿cuál es la pendiente más empinada posible?'; },
      function (v) { return Math.hypot(v.a, v.b); }, 'Es $|\\langle a, b\\rangle|$, igual en todos los puntos.',
      { where: function (v) { return v.a !== 0 && v.b !== 0; }, alt: function (v) { var m = 0; for (var i = 0; i < 36000; i++) { var t = 2 * Math.PI * i / 36000; m = Math.max(m, v.a * Math.cos(t) + v.b * Math.sin(t)); } return m; } }),
    N('d-min-x2y', 'direcciones', 2, { a: [1, 4, 1], p: [-2, 3, 1], q: [-2, 3, 1] },
      function (v) { return 'Para $f(x, y) = ' + co(v.a) + 'x^2y$, ¿cuál es el valor <strong>mínimo</strong> de $D_{\\mathbf u} f(' + v.p + ', ' + v.q + ')$?'; },
      function (v) { return -Math.hypot(2 * v.a * v.p * v.q, v.a * v.p * v.p); }, 'El mínimo es $-|\\nabla f|$, en la dirección opuesta al gradiente.',
      { mistakes: { positive: function (v) { return Math.hypot(2 * v.a * v.p * v.q, v.a * v.p * v.p); } }, feedback: [{ when: 'positive', say: 'Ese es el máximo; el mínimo lleva signo menos.' }], where: function (v) { return v.p !== 0; },
        alt: function (v) { var gx = 2 * v.a * v.p * v.q, gy = v.a * v.p * v.p; return gx * (-gx) / Math.sqrt(gx * gx + gy * gy) + gy * (-gy) / Math.sqrt(gx * gx + gy * gy); } }),
    N('d-ang-max', 'direcciones', 3, { a: [-6, 6, 1], b: [-6, 6, 1] },
      function (v) { return 'Para el plano $f(x, y) = ' + sum([co(v.a) + 'x', co(v.b) + 'y']) + '$, ¿a qué ángulo $\\theta \\in [0, 2\\pi)$, en radianes, apunta la dirección de máximo crecimiento?'; },
      function (v) { return wrap(Math.atan2(v.b, v.a)); }, 'Apunta como $\\langle a, b\\rangle$: $\\theta$ es su ángulo con $+x$, en el cuadrante correcto.',
      { where: function (v) { return v.a !== 0 && v.b !== 0; }, alt: function (v) { var r = Math.hypot(v.a, v.b), t = Math.acos(v.a / r); return v.b >= 0 ? t : 2 * Math.PI - t; } }),
    N('d-ang-cero', 'direcciones', 3, { a: [1, 6, 1], b: [1, 6, 1] },
      function (v) { return 'Para $f(x, y) = ' + co(v.a) + 'x + ' + co(v.b) + 'y$, $D_{\\mathbf u} f = 0$ en dos direcciones. ¿Cuál es el ángulo de la que está en $(0, \\pi)$, en radianes?'; },
      function (v) { return Math.atan2(v.b, v.a) + Math.PI / 2; }, 'Es perpendicular a $\\langle a, b\\rangle$: suma $\\pi/2$ a su ángulo.',
      { alt: function (v) { return Math.acos(-v.b / Math.hypot(v.a, v.b)); } }),
    DU('d-du-grad', 'direcciones', 2, { a: [1, 4, 1], b: [1, 4, 1], p: [1, 3, 1], q: [1, 3, 1] },
      function (v) { return 'Para $f(x, y) = ' + co(v.a) + 'x^2 + ' + co(v.b) + 'y^2$, calcula $D_{\\mathbf u} f(' + v.p + ', ' + v.q + ')$ en la dirección de $\\mathbf v = \\langle ' + (2 * v.a * v.p) + ', ' + (2 * v.b * v.q) + '\\rangle$. ¿Qué tiene de especial?'; },
      function (v) { return v.a + '*x^2 + ' + v.b + '*y^2'; }, function (v) { return [2 * v.a * v.p, 2 * v.b * v.q]; }, XY, function (v) { return [2 * v.a * v.p, 2 * v.b * v.q]; },
      '$\\mathbf v$ es el propio gradiente: da el máximo, $|\\nabla f|$.', { mk: ['noNorm'] }),
    N('d-coseno', 'direcciones', 2, { G: [2, 9, 1], k: [0, 11, 1] },
      function (v) { return 'En un punto, $|\\nabla f| = ' + v.G + '$ y la dirección $\\mathbf u$ forma un ángulo $\\alpha = ' + angTex(v.k) + '$ con $\\nabla f$. ¿Cuánto vale $D_{\\mathbf u} f$?'; },
      function (v) { return v.G * Math.cos(ang(v.k)); }, '$D_{\\mathbf u} f = |\\nabla f|\\cos\\alpha$.',
      { mistakes: { sine: function (v) { return v.G * Math.sin(ang(v.k)); } }, feedback: [{ when: 'sine', say: 'Es coseno, no seno: con $\\alpha = 0$ debe dar el máximo.' }],
        alt: function (v) { var t = ang(v.k); return v.G * Math.sin(t + Math.PI / 2); } }),
    N('d-alfa-n', 'direcciones', 3, { G: [4, 9, 1], d: [-3, 3, 1] },
      function (v) { return 'En un punto, $|\\nabla f| = ' + v.G + '$ y en cierta dirección $D_{\\mathbf u} f = ' + v.d + '$. ¿Qué ángulo $\\alpha \\in [0, \\pi]$ forma $\\mathbf u$ con $\\nabla f$, en radianes?'; },
      function (v) { return Math.acos(v.d / v.G); }, '$\\cos\\alpha = D_{\\mathbf u} f/|\\nabla f|$.',
      { alt: function (v) { return Math.atan2(Math.sqrt(v.G * v.G - v.d * v.d), v.d); } }),
    N('d-max-cubo', 'direcciones', 3, { a: [1, 4, 1], p: [-2, 2, 1], q: [-2, 2, 1] },
      function (v) { return 'Si $f(x, y) = x^3 - ' + co(v.a) + 'xy$, ¿cuál es la mayor razón de cambio de $f$ en $' + PQ(v) + '$?'; },
      function (v) { return Math.hypot(3 * v.p * v.p - v.a * v.q, v.a * v.p); }, '$|\\nabla f| = \\sqrt{(3x^2 - ay)^2 + (ax)^2}$.',
      { alt: function (v) { var f = function (x, y) { return x * x * x - v.a * x * y; }, h = 1e-4; return Math.hypot((f(v.p + h, v.q) - f(v.p - h, v.q)) / (2 * h), (f(v.p, v.q + h) - f(v.p, v.q - h)) / (2 * h)); } }),

    /* ---------------- Tres variables ---------------- */
    C('t-formula', 'tres-variables', 1, 'Para $f(x, y, z)$ y $\\mathbf u = \\langle u_1, u_2, u_3\\rangle$ unitario, $D_{\\mathbf u} f$ es…',
      '$f_x u_1 + f_y u_2 + f_z u_3$', [
        ['$f_x u_1 + f_y u_2$', 'Falta el término de $z$.'],
        ['$(f_x + f_y + f_z)(u_1 + u_2 + u_3)$', 'Es un producto punto, término a término.'],
        ['$f_z u_3$', 'Las tres parciales aportan.']],
      'El mismo producto punto, con tres términos.'),
    C('t-angulo', 'tres-variables', 2, 'En tres variables, ¿basta un solo ángulo $\\theta$ para dar la dirección $\\mathbf u$?',
      'No: en el espacio la dirección se da con un vector (que hay que normalizar)', [
        ['Sí, el ángulo con el eje $+x$', 'Hay infinitas direcciones con el mismo ángulo con $+x$ (forman un cono).'],
        ['Sí, si está en radianes', 'Las unidades del ángulo no cambian el problema.'],
        ['No: se necesitan cuatro ángulos', 'No hacen falta tantos; lo práctico es dar un vector.']],
      'En el espacio, un ángulo no fija la dirección.'),
    C('t-k', 'tres-variables', 1, 'Si $\\mathbf u = \\langle 0, 0, 1\\rangle$, entonces $D_{\\mathbf u} f(x, y, z)$ es…',
      '$f_z$', [
        ['$f_x$', 'Esa sale con $\\langle 1, 0, 0\\rangle$.'],
        ['$f_x + f_y + f_z$', 'Solo sobrevive la componente en $z$.'],
        ['$0$', 'Solo si $f_z = 0$.']],
      'Hacia $+z$ la derivada direccional es la parcial respecto a $z$.'),
    N('t-largo', 'tres-variables', 1, { k: [0, 9, 1] },
      function (v) { return 'Para normalizar $\\mathbf v = ' + vec(V3[v.k]) + '$, ¿entre qué número lo divides?'; },
      function (v) { return len(V3[v.k]); }, '$|\\mathbf v| = \\sqrt{v_1^2 + v_2^2 + v_3^2}$.',
      { alt: function (v) { var c = V3[v.k]; return Math.hypot(c[0], c[1], c[2]); } }),
    DU('t-xyz', 'tres-variables', 2, { a: [1, 5, 1], p: [-2, 2, 1], q: [-2, 3, 1], r: [1, 3, 1], k: [0, 9, 1] },
      function (v) { return 'Si $f(x, y, z) = ' + co(v.a) + 'xyz$, calcula $D_{\\mathbf u} f$ en $' + PQR(v) + '$ en la dirección de $' + vec(V3[v.k]) + '$.'; },
      function (v) { return v.a + '*x*y*z'; }, function (v) { return [v.a * v.q * v.r, v.a * v.p * v.r, v.a * v.p * v.q]; }, XYZ, function (v) { return V3[v.k]; },
      '$\\nabla f = \\langle ayz, axz, axy\\rangle$.', { mk: ['noNorm', 'term'] }),
    DU('t-esfera', 'tres-variables', 2, { a: [1, 4, 1], b: [1, 4, 1], p: [-2, 2, 1], q: [-2, 2, 1], r: [1, 3, 1], k: [0, 9, 1] },
      function (v) { return 'Si $f(x, y, z) = x^2 + ' + co(v.a) + 'y^2 + ' + co(v.b) + 'z^2$, calcula la derivada direccional en $' + PQR(v) + '$ en la dirección de $\\mathbf v = ' + vec(V3[v.k]) + '$.'; },
      function (v) { return 'x^2 + ' + v.a + '*y^2 + ' + v.b + '*z^2'; }, function (v) { return [2 * v.p, 2 * v.a * v.q, 2 * v.b * v.r]; }, XYZ, function (v) { return V3[v.k]; },
      '$\\nabla f = \\langle 2x, 2ay, 2bz\\rangle$.', { mk: ['noNorm', 'term'] }),
    DU('t-mixta', 'tres-variables', 2, { a: [1, 4, 1], b: [1, 4, 1], p: [-2, 2, 1], q: [-2, 2, 1], r: [1, 3, 1], k: [0, 9, 1] },
      function (v) { return 'Si $f(x, y, z) = ' + co(v.a) + 'xz + ' + co(v.b) + 'y^2$, ¿cuánto vale $D_{\\mathbf u} f(' + v.p + ', ' + v.q + ', ' + v.r + ')$ para la dirección de $' + vec(V3[v.k]) + '$?'; },
      function (v) { return v.a + '*x*z + ' + v.b + '*y^2'; }, function (v) { return [v.a * v.r, 2 * v.b * v.q, v.a * v.p]; }, XYZ, function (v) { return V3[v.k]; },
      '$\\nabla f = \\langle az, 2by, ax\\rangle$.', { mk: ['noNorm', 'term'] }),
    DU('t-ciclica', 'tres-variables', 3, { p: [-2, 3, 1], q: [-2, 3, 1], r: [-2, 3, 1], k: [0, 9, 1] },
      function (v) { return 'Si $f(x, y, z) = xy + yz + zx$, calcula $D_{\\mathbf u} f$ en $' + PQR(v) + '$ en la dirección de $\\mathbf v = ' + vec(V3[v.k]) + '$.'; },
      function () { return 'x*y + y*z + z*x'; }, function (v) { return [v.q + v.r, v.p + v.r, v.p + v.q]; }, XYZ, function (v) { return V3[v.k]; },
      '$\\nabla f = \\langle y + z, x + z, x + y\\rangle$.', { mk: ['noNorm', 'term'] }),
    DU('t-x2y', 'tres-variables', 2, { a: [1, 4, 1], b: [1, 6, 1], p: [-2, 2, 1], q: [-2, 3, 1], r: [-2, 2, 1], k: [0, 9, 1] },
      function (v) { return 'Para $w = ' + co(v.a) + 'x^2y + ' + co(v.b) + 'z$, calcula la razón de cambio de $w$ en $' + PQR(v) + '$ en la dirección de $' + vec(V3[v.k]) + '$.'; },
      function (v) { return v.a + '*x^2*y + ' + v.b + '*z'; }, function (v) { return [2 * v.a * v.p * v.q, v.a * v.p * v.p, v.b]; }, XYZ, function (v) { return V3[v.k]; },
      '$\\nabla w = \\langle 2axy, ax^2, b\\rangle$.', { mk: ['noNorm', 'term'] }),
    DU('t-exp', 'tres-variables', 3, { a: [1, 3, 1], q: [-2, 2, 1], r: [1, 3, 1], k: [0, 9, 1] },
      function (v) { return 'Si $f(x, y, z) = ' + co(v.a) + 'yz\\,e^{x}$, calcula $D_{\\mathbf u} f$ en $(0, ' + v.q + ', ' + v.r + ')$ en la dirección de $' + vec(V3[v.k]) + '$.'; },
      function (v) { return v.a + '*y*z*e^x'; }, function (v) { return [v.a * v.q * v.r, v.a * v.r, v.a * v.q]; }, function (v) { return { x: 0, y: v.q, z: v.r }; }, function (v) { return V3[v.k]; },
      'En $x = 0$, $e^x = 1$: $\\nabla f = \\langle ayz, az, ay\\rangle$.', { mk: ['noNorm'], where: function (v) { return v.q !== 0; } }),
    DU('t-trig', 'tres-variables', 3, { b: [1, 5, 1], q: [-2, 2, 1], r: [1, 3, 1], k: [0, 9, 1] },
      function (v) { return 'Si $f(x, y, z) = \\sin x + ' + co(v.b) + 'yz$, ¿cuánto vale la derivada direccional en $(0, ' + v.q + ', ' + v.r + ')$ hacia $' + vec(V3[v.k]) + '$?'; },
      function (v) { return 'sin(x) + ' + v.b + '*y*z'; }, function (v) { return [1, v.b * v.r, v.b * v.q]; }, function (v) { return { x: 0, y: v.q, z: v.r }; }, function (v) { return V3[v.k]; },
      '$\\nabla f = \\langle \\cos x, bz, by\\rangle$ y $\\cos 0 = 1$.', { mk: ['noNorm', 'term'] }),
    DU('t-ejez', 'tres-variables', 1, { a: [1, 4, 1], b: [1, 5, 1], p: [-2, 2, 1], q: [-2, 2, 1], r: [1, 3, 1] },
      function (v) { return 'Si $f(x, y, z) = ' + co(v.a) + 'x^2z + ' + co(v.b) + 'z^2$, calcula la derivada direccional en $' + PQR(v) + '$ hacia arriba, $\\mathbf u = \\langle 0, 0, 1\\rangle$.'; },
      function (v) { return v.a + '*x^2*z + ' + v.b + '*z^2'; }, function (v) { return [2 * v.a * v.p * v.r, 0, v.a * v.p * v.p + 2 * v.b * v.r]; }, XYZ, function () { return [0, 0, 1]; },
      'Hacia $+z$ es $f_z = ax^2 + 2bz$.'),
    N('t-max', 'tres-variables', 2, { a: [1, 4, 1], p: [-2, 2, 1], q: [-2, 2, 1], r: [1, 3, 1] },
      function (v) { return 'Para $f(x, y, z) = ' + co(v.a) + 'xy + z^2$, ¿cuál es el valor máximo de $D_{\\mathbf u} f$ en $' + PQR(v) + '$?'; },
      function (v) { return Math.hypot(v.a * v.q, v.a * v.p, 2 * v.r); }, 'Es $|\\nabla f| = \\sqrt{(ay)^2 + (ax)^2 + (2z)^2}$.',
      { alt: function (v) { var f = function (x, y, z) { return v.a * x * y + z * z; }, h = 1e-4; return Math.hypot((f(v.p + h, v.q, v.r) - f(v.p - h, v.q, v.r)) / (2 * h), (f(v.p, v.q + h, v.r) - f(v.p, v.q - h, v.r)) / (2 * h), (f(v.p, v.q, v.r + h) - f(v.p, v.q, v.r - h)) / (2 * h)); } }),

    /* ---------------- Interpretación y unidades ---------------- */
    C('r-unidades', 'interpretacion', 1, 'La temperatura $T(x, y)$ está en °C y $x$, $y$ en metros. ¿En qué unidades sale $D_{\\mathbf u} T$?',
      '°C/m', [
        ['°C', 'Es una razón de cambio: °C por cada metro.'],
        ['m/°C', 'Está al revés.'],
        ['°C·m', 'Se divide entre la distancia, no se multiplica.']],
      'Unidades de $T$ entre unidades de distancia.'),
    C('r-pendiente', 'interpretacion', 2, 'En un cerro con altura $h(x, y)$ en metros, en un sendero $D_{\\mathbf u} h = 0.2$. Eso quiere decir que…',
      'el sendero sube 0.2 m por cada metro caminado (pendiente del 20 %)', [
        ['el sendero está a 0.2 m de altura', 'Es una razón de cambio, no una altura.'],
        ['el sendero baja 0.2 m por metro', 'Positiva significa que sube.'],
        ['el ángulo del sendero es 0.2 radianes', 'Es una pendiente (tangente del ángulo), no el ángulo.']],
      'm de subida por m caminado.'),
    C('r-pq', 'interpretacion', 1, 'Para la razón de cambio al moverte de $P$ hacia $Q$, la dirección que se normaliza es…',
      '$\\overrightarrow{PQ} = Q - P$', [
        ['el vector de posición de $Q$', 'Ese apunta del origen a $Q$, no de $P$ a $Q$.'],
        ['$P - Q$', 'Esa va de $Q$ hacia $P$: el signo sale al revés.'],
        ['$P + Q$', 'Sumar los puntos no da ninguna dirección útil.']],
      'Punto final menos punto inicial.'),
    C('r-local', 'interpretacion', 3, 'En $P$, $D_{\\mathbf u} T = 5$ °C/cm. ¿Al avanzar 3 cm en esa dirección, la temperatura sube exactamente 15 °C?',
      'No necesariamente: 15 °C es una aproximación que vale para pasos pequeños', [
        ['Sí, siempre exactamente', 'La razón de cambio puede variar a lo largo del camino.'],
        ['No: sube exactamente 5 °C', 'La razón es por centímetro; en 3 cm se esperan unos 15 °C.'],
        ['No: baja 15 °C', 'Positiva significa que sube.']],
      '$\\Delta T \\approx D_{\\mathbf u} T\\cdot s$ solo cerca de $P$.'),
    C('r-negativa', 'interpretacion', 2, 'En un sendero, $D_{\\mathbf u} h = -0.1$ (metros por metro). ¿Qué significa?',
      'Al avanzar por ese sendero bajas unos 10 cm por cada metro', [
        ['Subes 10 cm por cada metro', 'El signo negativo indica bajada.'],
        ['Estás 0.1 m bajo el nivel del mar', 'No es una altura sino una razón de cambio.'],
        ['El sendero es plano', 'Plano sería $D_{\\mathbf u} h = 0$.']],
      'Negativa: bajada; 0.1 m/m = 10 cm por metro.'),
    DU('r-temp-pq', 'interpretacion', 2, { c: [60, 100, 10], a: [1, 3, 1], b: [1, 4, 1], p: [-3, 3, 1], q: [-3, 3, 1], s: [-4, 4, 1], t: [-4, 4, 1] },
      function (v) { return 'La temperatura de una placa es $T(x, y) = ' + v.c + ' - ' + co(v.a) + 'x^2 - ' + co(v.b) + 'y^2$ °C ($x$, $y$ en cm). Desde $' + PQ(v) + '$ caminas hacia $Q(' + v.s + ', ' + v.t + ')$. ¿A qué razón cambia la temperatura al salir, en °C/cm?'; },
      function (v) { return v.c + ' - ' + v.a + '*x^2 - ' + v.b + '*y^2'; }, function (v) { return [-2 * v.a * v.p, -2 * v.b * v.q]; }, XY, function (v) { return [v.s - v.p, v.t - v.q]; },
      'Dirección $Q - P$ normalizada; $\\nabla T = \\langle -2ax, -2by\\rangle$.', { mk: ['noNorm'], unit: '°C/cm', where: function (v) { return (v.s - v.p) * (v.s - v.p) + (v.t - v.q) * (v.t - v.q) > 1; } }),
    DU('r-temp-xy', 'interpretacion', 2, { c: [20, 40, 5], a: [1, 4, 1], p: [-3, 3, 1], q: [-3, 3, 1], s: [-4, 4, 1], t: [-4, 4, 1] },
      function (v) { return 'En una lámina, $T(x, y) = ' + v.c + ' + ' + co(v.a) + 'xy$ °C con $x$, $y$ en metros. Un robot en $' + PQ(v) + '$ arranca hacia $Q(' + v.s + ', ' + v.t + ')$. ¿Cuánto cambia la temperatura por metro al arrancar?'; },
      function (v) { return v.c + ' + ' + v.a + '*x*y'; }, function (v) { return [v.a * v.q, v.a * v.p]; }, XY, function (v) { return [v.s - v.p, v.t - v.q]; },
      '$\\nabla T = \\langle ay, ax\\rangle$; dirección $Q - P$.', { mk: ['noNorm', 'swap'], unit: '°C/m', where: function (v) { return (v.s - v.p) * (v.s - v.p) + (v.t - v.q) * (v.t - v.q) > 1; } }),
    DU('r-cerro', 'interpretacion', 2, { a: [1, 5, 1], b: [1, 5, 1], p: [-3, 3, 1], q: [-3, 3, 1], k: [0, 11, 1] },
      function (v) { return 'Un cerro tiene altura $h(x, y) = 500 - 0.0' + v.a + 'x^2 - 0.0' + v.b + 'y^2$ metros, con $x$, $y$ en metros. En $(' + (10 * v.p) + ', ' + (10 * v.q) + ')$ caminas en la dirección $\\theta = ' + angTex(v.k) + '$. ¿Cuántos metros subes (o bajas, si sale negativo) por metro caminado?'; },
      function (v) { return '500 - ' + (v.a / 100) + '*x^2 - ' + (v.b / 100) + '*y^2'; }, function (v) { return [-2 * v.a / 100 * 10 * v.p, -2 * v.b / 100 * 10 * v.q]; },
      function (v) { return { x: 10 * v.p, y: 10 * v.q }; }, function (v) { return uA(v.k); },
      function (v) { return '$h_x = -' + (2 * v.a / 100) + 'x$ y $h_y = -' + (2 * v.b / 100) + 'y$; haz el producto punto con $\\langle\\cos\\theta, \\sin\\theta\\rangle$.'; }, { mk: ['swap'], unit: 'm/m' }),
    DU('r-cambio', 'interpretacion', 3, { c: [60, 100, 10], a: [1, 3, 1], b: [1, 4, 1], p: [-3, 3, 1], q: [-3, 3, 1], k: [0, 11, 1], s: [1, 5, 1] },
      function (v) { return 'Con $T(x, y) = ' + v.c + ' - ' + co(v.a) + 'x^2 - ' + co(v.b) + 'y^2$ °C ($x$, $y$ en cm), estima cuánto cambia la temperatura si desde $' + PQ(v) + '$ avanzas $0.' + v.s + '$ cm en la dirección de $' + vec(VEC[v.k]) + '$. (Usa $\\Delta T \\approx D_{\\mathbf u} T\\cdot s$.)'; },
      function (v) { return v.c + ' - ' + v.a + '*x^2 - ' + v.b + '*y^2'; }, function (v) { return [-2 * v.a * v.p, -2 * v.b * v.q]; }, XY, function (v) { return VEC[v.k]; },
      'Multiplica la derivada direccional por la distancia recorrida.', { mk: ['noNorm'], unit: '°C', scale: function (v) { return v.s / 10; } }),
    DU('r-porcentaje', 'interpretacion', 3, { a: [1, 5, 1], b: [1, 5, 1], p: [-4, 4, 1], q: [-4, 4, 1], k: [0, 11, 1] },
      function (v) { return 'Una rampa tiene altura $h(x, y) = 0.0' + v.a + 'x^2 + 0.0' + v.b + 'xy$ m ($x$, $y$ en m). En $' + PQ(v) + '$, ¿cuál es su pendiente, <strong>en porcentaje</strong>, en la dirección de $' + vec(VEC[v.k]) + '$?'; },
      function (v) { return (v.a / 100) + '*x^2 + ' + (v.b / 100) + '*x*y'; }, function (v) { return [2 * v.a / 100 * v.p + v.b / 100 * v.q, v.b / 100 * v.p]; }, XY, function (v) { return VEC[v.k]; },
      'Pendiente en % = 100 · $D_{\\mathbf u} h$.', { mk: ['noNorm'], unit: '%', scale: function () { return 100; } }),
    DU('r-tiempo', 'interpretacion', 3, { c: [50, 90, 10], a: [1, 3, 1], b: [1, 4, 1], p: [-3, 3, 1], q: [-3, 3, 1], k: [0, 11, 1], s: [2, 6, 1] },
      function (v) { return 'Un robot avanza a ' + v.s + ' cm/s sobre una placa con $T(x, y) = ' + v.c + ' - ' + co(v.a) + 'x^2 - ' + co(v.b) + 'y^2$ °C ($x$, $y$ en cm). Al pasar por $' + PQ(v) + '$ va en la dirección $\\theta = ' + angTex(v.k) + '$. ¿Qué tan rápido cambia la temperatura que mide, en °C/s?'; },
      function (v) { return v.c + ' - ' + v.a + '*x^2 - ' + v.b + '*y^2'; }, function (v) { return [-2 * v.a * v.p, -2 * v.b * v.q]; }, XY, function (v) { return uA(v.k); },
      '°C/cm por cm/s da °C/s: multiplica $D_{\\mathbf u} T$ por la rapidez.', { unit: '°C/s', scale: function (v) { return v.s; } }),
    DU('r-voltaje', 'interpretacion', 2, { a: [1, 6, 1], b: [1, 9, 1], p: [-3, 3, 1], q: [-3, 3, 1], k: [0, 11, 1] },
      function (v) { return 'El potencial en una región es $V(x, y) = ' + co(v.a) + 'x^2 - ' + co(v.b) + 'y$ volts, con $x$, $y$ en metros. ¿Cuánto cambia $V$ por metro al moverte desde $' + PQ(v) + '$ en la dirección de $' + vec(VEC[v.k]) + '$, en V/m?'; },
      function (v) { return v.a + '*x^2 - ' + v.b + '*y'; }, function (v) { return [2 * v.a * v.p, -v.b]; }, XY, function (v) { return VEC[v.k]; },
      '$\\nabla V = \\langle 2ax, -b\\rangle$; normaliza la dirección.', { mk: ['noNorm', 'swap'], unit: 'V/m' }),
    DU('r-dron', 'interpretacion', 3, { c: [20, 30, 1], a: [1, 4, 1], p: [-3, 3, 1], q: [-3, 3, 1], r: [1, 5, 1], k: [0, 9, 1] },
      function (v) { return 'La temperatura del aire es $T(x, y, z) = ' + v.c + ' - 0.' + v.a + '(x^2 + y^2) - 0.5z$ °C, con distancias en km. Un dron en $' + PQR(v) + '$ vuela en la dirección de $' + vec(V3[v.k]) + '$. ¿Cuánto cambia la temperatura por km al arrancar?'; },
      function (v) { return v.c + ' - ' + (v.a / 10) + '*(x^2 + y^2) - 0.5*z'; }, function (v) { return [-0.2 * v.a * v.p, -0.2 * v.a * v.q, -0.5]; }, XYZ, function (v) { return V3[v.k]; },
      function (v) { return '$\\nabla T = \\langle -' + (v.a / 5) + 'x, -' + (v.a / 5) + 'y, -0.5\\rangle$; normaliza la dirección.'; }, { mk: ['noNorm', 'term'], unit: '°C/km' }),
    DU('r-concentracion', 'interpretacion', 2, { a: [1, 6, 1], b: [1, 6, 1], p: [-3, 3, 1], q: [-3, 3, 1], s: [-4, 4, 1], t: [-4, 4, 1] },
      function (v) { return 'La concentración de un contaminante en un lago es $C(x, y) = ' + co(v.a) + 'x + ' + co(v.b) + 'y^2$ mg/L, con $x$, $y$ en km. Un bote en $' + PQ(v) + '$ navega hacia el muelle $Q(' + v.s + ', ' + v.t + ')$. ¿Cuántos mg/L cambia la concentración por km al salir?'; },
      function (v) { return v.a + '*x + ' + v.b + '*y^2'; }, function (v) { return [v.a, 2 * v.b * v.q]; }, XY, function (v) { return [v.s - v.p, v.t - v.q]; },
      '$\\nabla C = \\langle a, 2by\\rangle$; dirección $Q - P$ normalizada.', { mk: ['noNorm'], unit: 'mg/L por km', where: function (v) { return (v.s - v.p) * (v.s - v.p) + (v.t - v.q) * (v.t - v.q) > 1; } }),
    DU('r-presion', 'interpretacion', 2, { c: [90, 110, 5], a: [1, 5, 1], b: [1, 5, 1], p: [-3, 3, 1], q: [-3, 3, 1], k: [0, 11, 1] },
      function (v) { return 'La presión atmosférica en un mapa es $p(x, y) = ' + v.c + ' + 0.' + v.a + 'x - 0.' + v.b + 'y^2$ kPa, con $x$, $y$ en km. Un globo en $' + PQ(v) + '$ se mueve en la dirección $\\theta = ' + angTex(v.k) + '$. ¿Cuántos kPa por km cambia la presión al arrancar?'; },
      function (v) { return v.c + ' + ' + (v.a / 10) + '*x - ' + (v.b / 10) + '*y^2'; }, function (v) { return [v.a / 10, -2 * v.b / 10 * v.q]; }, XY, function (v) { return uA(v.k); },
      function (v) { return '$p_x = ' + (v.a / 10) + '$ y $p_y = -' + (2 * v.b / 10) + 'y$; producto punto con $\\langle\\cos\\theta, \\sin\\theta\\rangle$.'; }, { mk: ['swap'], unit: 'kPa/km', where: function (v) { return v.q !== 0; } }),
    DU('r-hormiga', 'interpretacion', 2, { c: [40, 80, 10], a: [1, 4, 1], p: [-3, 3, 1], q: [-3, 3, 1], s: [-4, 4, 1], t: [-4, 4, 1] },
      function (v) { return 'Una hormiga está en $' + PQ(v) + '$ sobre una plancha con $T(x, y) = ' + v.c + ' - ' + co(v.a) + '(x^2 + y^2)$ °C ($x$, $y$ en cm) y camina en línea recta hacia la migaja en $Q(' + v.s + ', ' + v.t + ')$. ¿Cuánto cambia la temperatura por cm al arrancar?'; },
      function (v) { return v.c + ' - ' + v.a + '*(x^2 + y^2)'; }, function (v) { return [-2 * v.a * v.p, -2 * v.a * v.q]; }, XY, function (v) { return [v.s - v.p, v.t - v.q]; },
      '$\\nabla T = \\langle -2ax, -2ay\\rangle$; dirección $Q - P$ normalizada.', { mk: ['noNorm'], unit: '°C/cm', where: function (v) { return (v.s - v.p) * (v.s - v.p) + (v.t - v.q) * (v.t - v.q) > 1; } }),
    DU('u-du-exp', 'unitario', 2, { a: [1, 4, 1], q: [-1, 1, 1], k: [0, 11, 1] },
      function (v) { return 'Para $f(x, y) = ' + co(v.a) + 'e^{x}y$, calcula la derivada direccional en $(0, ' + v.q + ')$ en la dirección de $\\mathbf v = ' + vec(VEC[v.k]) + '$ (recuerda normalizar).'; },
      function (v) { return v.a + '*e^x*y'; }, function (v) { return [v.a * v.q, v.a]; }, function (v) { return { x: 0, y: v.q }; }, function (v) { return VEC[v.k]; },
      'En $x = 0$: $f_x = ay$, $f_y = a$.', { mk: ['noNorm'] })
  ];

  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a || 1; }

  K.register({
    'c2.S07.idea': 'Qué mide y definición',
    'c2.S07.unitario': 'Vector unitario: normalizar',
    'c2.S07.calculo': 'Cálculo con la fórmula',
    'c2.S07.direcciones': 'Máximo, mínimo y cero',
    'c2.S07.tres-variables': 'Tres variables',
    'c2.S07.interpretacion': 'Interpretación y unidades'
  }, Q);
})();
