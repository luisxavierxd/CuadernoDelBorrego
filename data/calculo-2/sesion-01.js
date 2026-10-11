/* =====================================================================
   Cálculo 2 · S01 · Espacio 3D (bloque A · Espacio y derivada parcial).
   Rectangulares en 3D: puntos, distancia, planos, cuádricas y curvas de nivel.
   Fuentes: OpenStax, Calculus Volume 3, §2.2, §2.5, §2.6 y §4.1 (CC BY-NC-SA 4.0).
   Las respuestas se calculan aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.surface (verify / oracle).
   ===================================================================== */
(function () {
  var OS = 'https://openstax.org/books/calculus-volume-3/pages/';
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function sq(n) { return n * n; }
  // Término de un polinomio en LaTeX: coeficiente 1 implícito y signos limpios.
  function poly(terms) {
    var s = '';
    terms.forEach(function (t) {
      var c = t[0], m = t[1];
      if (c === 0) return;
      var mag = Math.abs(c), body = m ? (mag === 1 ? '' : mag) + m : String(mag);
      s += s ? (c < 0 ? ' - ' : ' + ') + body : (c < 0 ? '-' : '') + body;
    });
    return s || '0';
  }
  function pt(a, b, c) { return '(' + a + ', ' + b + ', ' + c + ')'; }

  // La respuesta y cada error típico deben diferir lo suficiente para que el «casi» no sea ambiguo.
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      if (!vals.every(isFinite)) return false;
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        var big = Math.max(Math.abs(vals[i]), Math.abs(vals[j]));
        if (Math.abs(vals[i] - vals[j]) <= Math.max(0.03 * big, 0.05)) return false;
      }
      return true;
    };
  }

  // Ejemplos (cuentas propias; verify las compara con LabMath.surface)
  var e1 = { P: [1, -2, 3], Q: [4, 2, -9] };
  e1.d = Math.sqrt(sq(e1.Q[0] - e1.P[0]) + sq(e1.Q[1] - e1.P[1]) + sq(e1.Q[2] - e1.P[2]));
  var e2 = { D: -4, E: 6, F: -2, G: -2 };
  e2.c = [-e2.D / 2, -e2.E / 2, -e2.F / 2];
  e2.r = Math.sqrt(sq(e2.c[0]) + sq(e2.c[1]) + sq(e2.c[2]) - e2.G);
  var e3 = { P: [1, 0, 2], Q: [2, 1, 0], R: [0, 2, 1] };
  e3.u = [e3.Q[0] - e3.P[0], e3.Q[1] - e3.P[1], e3.Q[2] - e3.P[2]];
  e3.w = [e3.R[0] - e3.P[0], e3.R[1] - e3.P[1], e3.R[2] - e3.P[2]];
  e3.n = [e3.u[1] * e3.w[2] - e3.u[2] * e3.w[1], e3.u[2] * e3.w[0] - e3.u[0] * e3.w[2], e3.u[0] * e3.w[1] - e3.u[1] * e3.w[0]];
  e3.d = e3.n[0] * e3.P[0] + e3.n[1] * e3.P[1] + e3.n[2] * e3.P[2];
  var e4 = { n: [2, 1, 2], P: [1, 2, 1] };
  e4.d = e4.n[0] * e4.P[0] + e4.n[1] * e4.P[1] + e4.n[2] * e4.P[2];
  e4.ix = e4.d / e4.n[0]; e4.iy = e4.d / e4.n[1]; e4.iz = e4.d / e4.n[2];
  var e6 = { x: 1, y: 2 };
  e6.c = sq(e6.x) + 2 * sq(e6.y);

  /* ---------- Ejercicio: ¿qué cuádrica es? ---------- */
  var Q_NAMES = ['Elipsoide', 'Hiperboloide de una hoja', 'Hiperboloide de dos hojas', 'Cono elíptico', 'Paraboloide elíptico', 'Paraboloide hiperbólico (silla)', 'Cilindro elíptico', 'Cilindro parabólico'];
  // Distractores más parecidos a cada tipo, con su explicación.
  var Q_WRONG = [
    [[1, 'Un hiperboloide tendría un signo menos en alguno de los cuadrados.'], [4, 'Un paraboloide tiene una variable sin cuadrado; aquí las tres están al cuadrado.'], [6, 'En un cilindro falta una variable; aquí aparecen las tres.']],
    [[2, 'Dos hojas llevan dos signos menos (con la constante positiva). Aquí hay uno solo.'], [3, 'El cono tiene 0 del otro lado; aquí la constante no es 0.'], [0, 'El elipsoide tiene los tres cuadrados con el mismo signo.']],
    [[1, 'Una hoja lleva un solo signo menos; aquí hay dos.'], [3, 'El cono tiene 0 del otro lado; aquí la constante no es 0.'], [0, 'El elipsoide tiene los tres cuadrados con el mismo signo.']],
    [[1, 'Con una constante distinta de 0 sería un hiperboloide; aquí el otro lado es 0.'], [2, 'Con una constante distinta de 0 sería un hiperboloide; aquí el otro lado es 0.'], [4, 'Las tres variables están al cuadrado: no es un paraboloide.']],
    [[5, 'Los dos cuadrados tienen el mismo signo: es un tazón, no una silla.'], [3, 'El cono tiene las tres variables al cuadrado; aquí una es lineal.'], [7, 'Hay dos variables al cuadrado, no solo una.']],
    [[4, 'Los cuadrados tienen signos distintos: es una silla, no un tazón.'], [1, 'Un hiperboloide tiene las tres variables al cuadrado; aquí una es lineal.'], [7, 'Hay dos variables al cuadrado, no solo una.']],
    [[0, 'Falta una variable: la elipse se repite a lo largo de ese eje, así que es un cilindro.'], [4, 'Un paraboloide tiene una variable lineal; aquí una variable no aparece.'], [3, 'El cono tiene las tres variables al cuadrado.']],
    [[4, 'Solo una variable está al cuadrado y otra no aparece: es un cilindro.'], [6, 'La traza es una parábola, no una elipse.'], [5, 'Una silla tiene dos variables al cuadrado.']]
  ];
  var PERMS = [['x', 'y', 'z'], ['y', 'z', 'x'], ['z', 'x', 'y']];
  function quadricTex(v) {
    var p = PERMS[v.p], u = p[0] + '^2', w2 = p[2] + '^2', vv = p[1] + '^2', w = p[2];
    switch (v.t) {
      case 0: return poly([[v.A, u], [v.B, vv], [v.C, w2]]) + ' = ' + v.K;
      case 1: return poly([[v.A, u], [v.B, vv], [-v.C, w2]]) + ' = ' + v.K;
      case 2: return poly([[v.C, w2], [-v.A, u], [-v.B, vv]]) + ' = ' + v.K;
      case 3: return poly([[v.A, u], [v.B, vv], [-v.C, w2]]) + ' = 0';
      case 4: return w + ' = ' + poly([[v.A, u], [v.B, vv]]);
      case 5: return w + ' = ' + poly([[v.A, u], [-v.B, vv]]);
      case 6: return poly([[v.A, u], [v.B, vv]]) + ' = ' + v.K;
      default: return w + ' = ' + poly([[v.A, u]]);
    }
  }

  /* ---------- Ejercicio: dominio ---------- */
  function domainCase(v) {
    var R2 = v.R * v.R;
    return [
      { f: '\\sqrt{' + R2 + ' - x^2 - y^2}', ok: 'El disco $x^2 + y^2 \\leq ' + R2 + '$, con su borde',
        wrong: [['Todo el plano', 'La raíz no acepta negativos: fuera del disco el radicando es negativo.'], ['Solo la circunferencia $x^2 + y^2 = ' + R2 + '$', 'Adentro también se puede: ahí el radicando es positivo.'], ['Afuera del disco: $x^2 + y^2 \\geq ' + R2 + '$', 'Afuera el radicando es negativo y la raíz no existe.']],
        why: 'Se necesita $' + R2 + ' - x^2 - y^2 \\geq 0$, o sea $x^2 + y^2 \\leq ' + R2 + '$: el disco de radio ' + v.R + ' con su borde.' },
      { f: '\\ln(x - y)', ok: 'El semiplano $y < x$, sin la recta $y = x$',
        wrong: [['El semiplano $y \\leq x$, con la recta $y = x$', '$\\ln 0$ no existe: la recta $y = x$ queda fuera.'], ['El semiplano $y > x$', 'Ahí $x - y < 0$ y el logaritmo no existe.'], ['Todo el plano', 'El logaritmo solo acepta números positivos.']],
        why: 'El logaritmo pide $x - y > 0$, es decir, $y < x$: los puntos debajo de la recta $y = x$.' },
      { f: '\\dfrac{1}{x^2 + y^2 - ' + R2 + '}', ok: 'Todo el plano menos la circunferencia $x^2 + y^2 = ' + R2 + '$',
        wrong: [['Solo el disco $x^2 + y^2 < ' + R2 + '$', 'Adentro el denominador es negativo, pero no cero: también se puede.'], ['Todo el plano', 'En la circunferencia el denominador vale 0.'], ['Solo afuera del disco: $x^2 + y^2 > ' + R2 + '$', 'Adentro el denominador no es cero: también se puede.']],
        why: 'Solo hay que evitar que el denominador sea 0: $x^2 + y^2 \\neq ' + R2 + '$.' },
      { f: '\\sqrt{y - ' + (v.R === 1 ? '' : v.R) + 'x^2}', ok: 'La región sobre la parábola $y \\geq ' + (v.R === 1 ? '' : v.R) + 'x^2$, con la parábola',
        wrong: [['La región $y > ' + (v.R === 1 ? '' : v.R) + 'x^2$, sin la parábola', 'En la parábola el radicando vale 0, y $\\sqrt{0} = 0$ sí existe.'], ['La región bajo la parábola: $y \\leq ' + (v.R === 1 ? '' : v.R) + 'x^2$', 'Ahí el radicando es negativo.'], ['Todo el plano', 'La raíz no acepta negativos.']],
        why: 'Se necesita $y - ' + (v.R === 1 ? '' : v.R) + 'x^2 \\geq 0$: los puntos sobre la parábola o en ella.' }
    ][v.t];
  }

  /* ---------- Ejercicio: curva de nivel por un punto ---------- */
  function levelF(v, x, y, bad) {
    var X2 = bad ? x * Math.abs(x) : x * x, Y2 = bad ? y * Math.abs(y) : y * y;
    if (v.t === 0) return v.a * X2 + v.b * Y2;
    if (v.t === 1) return v.a * X2 - v.b * Y2;
    return v.a * X2 - v.b * x * y;
  }
  function levelSrc(v) { return [v.a + 'x^2 + ' + v.b + 'y^2', v.a + 'x^2 - ' + v.b + 'y^2', v.a + 'x^2 - ' + v.b + 'x*y'][v.t]; }
  function levelTex(v) {
    var a = v.a === 1 ? '' : v.a, b = v.b === 1 ? '' : v.b;
    return [a + 'x^2 + ' + b + 'y^2', a + 'x^2 - ' + b + 'y^2', a + 'x^2 - ' + b + 'xy'][v.t];
  }

  var data = window.SESSION_DATA = {
    slug: 'sesion-01', number: '01', group: 'A · Espacio y derivada parcial',
    title: 'Rectangulares en 3D: puntos, distancia, planos, cuádricas y curvas de nivel', temario: [],
    minutes: 200,
    quote: 'En 3D cada punto necesita tres números. Con ellos describes planos, superficies y, con curvas de nivel, dibujas un cerro en una hoja plana.',
    badges: [
      'Ubicar puntos en el sistema de mano derecha y medir la distancia entre ellos.',
      'Escribir la ecuación de un plano y encontrar dónde corta los ejes.',
      'Reconocer una cuádrica por sus trazas.',
      'Leer una función $z = f(x, y)$ con su dominio y sus curvas de nivel.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Un punto del espacio se ubica con <strong>tres números</strong> $(x, y, z)$. Con ellos se escriben ecuaciones de superficies y, con <strong>curvas de nivel</strong>, una superficie se dibuja en papel como un mapa topográfico.',
        recall: [
          'La distancia en el plano: $d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$ (Pitágoras).',
          'La circunferencia $(x - h)^2 + (y - k)^2 = r^2$ y cómo completar cuadrados.',
          'El producto cruz de dos vectores (Física 1, S03), para el plano por tres puntos.',
          'Elipses, parábolas e hipérbolas: aquí reaparecen como cortes de superficies.'
        ],
        why: 'Todo el curso vive en 3D: derivadas parciales, gradiente, optimización e integrales dobles y triples se dibujan sobre superficies como las de hoy. Los mapas de contorno se usan en topografía, en meteorología (isobaras) y en ingeniería (curvas de igual temperatura o presión).'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Párate en una esquina de tu cuarto. El piso y las dos paredes son tres planos que se cortan en tres rectas: esas rectas son los ejes $x$, $y$ y $z$. Para decirle a alguien dónde está un foco del techo le das tres números: cuánto avanzar a lo largo de una pared, cuánto a lo largo de la otra y cuánto subir.',
          'Un dron que vuela sobre la ciudad necesita lo mismo: dos números para saber sobre qué punto del mapa está y un tercero para su altura. Si el dron vuela siempre a 30 m, su altura no cambia aunque se mueva: todos esos puntos forman un plano horizontal, $z = 30$.',
          'Ahora piensa en un mapa de senderismo. Las líneas onduladas unen puntos de la misma altura: son <strong>curvas de nivel</strong>. Donde están muy juntas, el cerro es empinado; donde están separadas, es casi plano. Así se dibuja una superficie en 3D sobre una hoja plana.'
        ]
      },
      {
        type: 'concept', heading: 'El espacio de tres dimensiones', short: 'El espacio 3D',
        body: [
          'Tres ejes perpendiculares que salen del origen $O$. Se acomodan con la <strong>regla de la mano derecha</strong>: si los dedos de tu mano derecha giran del eje $x$ hacia el eje $y$, el pulgar apunta hacia la parte positiva del eje $z$. Todos los libros (y este curso) usan esa orientación.',
          'Un punto $P(x, y, z)$ se alcanza avanzando $x$ unidades en la dirección del eje $x$, luego $y$ en la del eje $y$ y luego $z$ hacia arriba. Los ejes, de dos en dos, forman los <strong>planos coordenados</strong>: el plano $xy$ ($z = 0$, el piso), el plano $xz$ ($y = 0$) y el plano $yz$ ($x = 0$). Juntos parten el espacio en ocho <strong>octantes</strong>; el primero es donde las tres coordenadas son positivas.',
          'Al dibujar en perspectiva, el eje $x$ apunta hacia ti (abajo a la izquierda en el papel), el $y$ a la derecha y el $z$ hacia arriba. Una pista para leer el dibujo: dos puntos que en la hoja se ven juntos pueden estar lejos en el espacio. Por eso conviene marcar el camino $x \\to y \\to z$ con líneas punteadas.'
        ],
        diagram: 'c2s01-octant',
        caption: 'Los tres planos coordenados en el primer octante: el piso $z = 0$ y las paredes $y = 0$ y $x = 0$.'
      },
      {
        type: 'explainer', heading: 'Ubicar un punto y medir su distancia', short: 'Ubicar un punto',
        title: 'Del origen a P(2, 4, 3)',
        intro: 'Sigue el camino desde el origen. El último paso muestra de dónde sale la fórmula de la distancia.',
        diagram: 'c2s01-point',
        steps: [
          { text: 'Avanza 2 unidades en la dirección del eje $x$.', state: { k: 1 } },
          { text: 'Desde ahí, 4 unidades paralelo al eje $y$. Ya estás en $(2, 4, 0)$, en el piso.', state: { k: 2 } },
          { text: 'Sube 3 unidades paralelo al eje $z$: llegaste a $P(2, 4, 3)$.', state: { k: 3 } },
          { text: 'La distancia sale de aplicar Pitágoras dos veces: en el piso, $\\sqrt{2^2 + 4^2}$; luego con la altura, $d = \\sqrt{2^2 + 4^2 + 3^2} = \\sqrt{29}$.', state: { k: 4 } }
        ]
      },
      {
        type: 'concept', heading: 'Distancia y esfera', short: 'Distancia y esfera',
        body: [
          'La distancia entre $P_1(x_1, y_1, z_1)$ y $P_2(x_2, y_2, z_2)$ es Pitágoras con una coordenada más: $$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2 + (z_2 - z_1)^2}.$$',
          'Una <strong>esfera</strong> de centro $(h, k, l)$ y radio $r$ son todos los puntos a distancia $r$ del centro. Elevando al cuadrado: $$(x - h)^2 + (y - k)^2 + (z - l)^2 = r^2.$$',
          'Si la ecuación viene desarrollada, por ejemplo $x^2 + y^2 + z^2 - 4x + 6y = 3$, se <strong>completan cuadrados</strong> en cada variable: $x^2 - 4x = (x - 2)^2 - 4$ y $y^2 + 6y = (y + 3)^2 - 9$. Queda $(x - 2)^2 + (y + 3)^2 + z^2 = 16$: centro $(2, -3, 0)$ y radio 4. Si del lado derecho queda un número negativo, no hay esfera.'
        ]
      },
      {
        type: 'concept', heading: 'Planos', short: 'Planos',
        body: [
          'Un plano queda fijo con un punto $P_0(x_0, y_0, z_0)$ y un vector perpendicular a él, su <strong>normal</strong> $\\vec n = \\langle a, b, c \\rangle$. Un punto $P$ está en el plano si $\\overrightarrow{P_0P}$ es perpendicular a $\\vec n$, es decir, si su producto punto es cero: $$a(x - x_0) + b(y - y_0) + c(z - z_0) = 0 \\quad\\Longleftrightarrow\\quad ax + by + cz = d.$$',
          'Si te dan <strong>tres puntos</strong> $P$, $Q$ y $R$, la normal es el producto cruz $\\vec n = \\overrightarrow{PQ} \\times \\overrightarrow{PR}$, y luego usas cualquiera de los tres como $P_0$.',
          'Para dibujarlo, busca dónde corta los ejes: en el eje $x$ las otras dos coordenadas valen 0, así que $x = d/a$; igual $y = d/b$ y $z = d/c$. Al unir esos tres puntos ves el triángulo del primer octante. Los lados del triángulo son las <strong>trazas</strong>: los cortes del plano con los planos coordenados.',
          'Si falta una variable, el plano es paralelo a ese eje: $z = 3$ es horizontal (paralelo al piso) y $x + y = 2$ es una pared vertical.'
        ],
        diagram: 'c2s01-plane',
        caption: 'El plano $2x + y + 2z = 6$ corta los ejes en $(3, 0, 0)$, $(0, 6, 0)$ y $(0, 0, 3)$. La flecha roja es su normal $\\langle 2, 1, 2 \\rangle$.'
      },
      {
        type: 'callout', heading: 'Una ecuación, dos lecturas',
        body: [
          'En el plano, $x^2 + y^2 = 4$ es una circunferencia. En el espacio es un <strong>cilindro</strong>: como $z$ no aparece, puede valer lo que sea y la circunferencia se repite a todas las alturas.',
          'Igual con $y = 3$: en el plano es una recta; en el espacio, un plano. Antes de dibujar, pregúntate en cuántas dimensiones estás.'
        ]
      },
      {
        type: 'explainer', heading: 'Cuádricas: se reconocen por sus trazas', short: 'Cuádricas',
        title: 'Seis superficies con sus cortes',
        intro: 'Una <strong>cuádrica</strong> es una superficie con ecuación de segundo grado en $x$, $y$ y $z$. Para saber cuál es, se corta con planos $z = k$ (horizontales) y $x = k$ o $y = k$ (verticales) y se mira qué cónica sale. Avanza por las seis más comunes.',
        diagram: 'c2s01-quadric',
        steps: [
          { text: '<strong>Elipsoide</strong>: los tres cuadrados con el mismo signo y una constante positiva. Todas sus trazas son elipses; es una pelota estirada (si los coeficientes son iguales, una esfera).', state: { kind: 'ellipsoid' } },
          { text: '<strong>Hiperboloide de una hoja</strong>: un solo signo menos. Las trazas horizontales son circunferencias que crecen al alejarse de $z = 0$; las verticales, hipérbolas. Tiene «cintura», como una torre de enfriamiento.', state: { kind: 'hyperboloid1' } },
          { text: '<strong>Hiperboloide de dos hojas</strong>: dos signos menos. Entre $z = -1$ y $z = 1$ no hay traza: la superficie se parte en dos tazones separados.', state: { kind: 'hyperboloid2' } },
          { text: '<strong>Cono</strong>: como el hiperboloide, pero con 0 del otro lado. En $z = 0$ la traza es un solo punto (el vértice) y los cortes verticales por el eje son dos rectas.', state: { kind: 'cone' } },
          { text: '<strong>Paraboloide elíptico</strong>: una variable aparece <em>sin</em> cuadrado. Trazas horizontales: elipses (aquí circunferencias) solo para $z \\geq 0$; verticales: parábolas. Un tazón.', state: { kind: 'paraboloid-elliptic' } },
          { text: '<strong>Paraboloide hiperbólico</strong>: una variable lineal y los cuadrados con signos distintos. En una dirección las parábolas abren hacia arriba y en la otra hacia abajo: una silla de montar (o una papa frita de bolsa).', state: { kind: 'paraboloid-hyperbolic' } }
        ]
      },
      {
        type: 'concept', heading: 'Las cuádricas de un vistazo', short: 'Tabla de cuádricas',
        body: [
          'Pasa todo a un lado, completa cuadrados si hay términos lineales sueltos y compara con esta tabla (aquí el eje especial es $z$; si el signo distinto o la variable lineal es otra, la figura apunta a lo largo de ese otro eje).'
        ],
        list: [
          '<strong>Elipsoide</strong>: $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} + \\frac{z^2}{c^2} = 1$. Todas las trazas son elipses.',
          '<strong>Hiperboloide de una hoja</strong>: $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} - \\frac{z^2}{c^2} = 1$. Elipses en $z = k$; hipérbolas en $x = k$ y $y = k$.',
          '<strong>Hiperboloide de dos hojas</strong>: $\\frac{z^2}{c^2} - \\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$. Elipses en $z = k$ solo si $|k| \\geq c$.',
          '<strong>Cono elíptico</strong>: $\\frac{z^2}{c^2} = \\frac{x^2}{a^2} + \\frac{y^2}{b^2}$. Elipses en $z = k$; dos rectas en $x = 0$ y $y = 0$.',
          '<strong>Paraboloide elíptico</strong>: $\\frac{z}{c} = \\frac{x^2}{a^2} + \\frac{y^2}{b^2}$. Elipses en $z = k$; parábolas en $x = k$ y $y = k$.',
          '<strong>Paraboloide hiperbólico</strong>: $\\frac{z}{c} = \\frac{y^2}{b^2} - \\frac{x^2}{a^2}$. Hipérbolas en $z = k$; parábolas en $x = k$ y $y = k$.',
          '<strong>Cilindros</strong>: falta una variable, como $x^2 + y^2 = 4$ (cilindro circular) o $z = x^2$ (cilindro parabólico). La curva se repite a lo largo del eje que falta.'
        ]
      },
      {
        type: 'concept', heading: 'Funciones de dos variables', short: 'Funciones de dos variables',
        body: [
          'Una <strong>función de dos variables</strong> $z = f(x, y)$ le asigna a cada punto $(x, y)$ de una región del plano un número $z$. Esa región es su <strong>dominio</strong>, y el conjunto de valores que toma es su <strong>rango</strong>. Ejemplo: la temperatura en cada punto de una placa.',
          'El dominio se encuentra igual que en Cálculo 1, pero ahora es una región: una raíz pide radicando $\\geq 0$, un logaritmo pide argumento $> 0$ y un cociente pide denominador $\\neq 0$. Por ejemplo, $f(x, y) = \\sqrt{9 - x^2 - y^2}$ pide $x^2 + y^2 \\leq 9$: el disco de radio 3 con su borde. Su rango es $[0, 3]$.',
          'La <strong>gráfica</strong> de $f$ es la superficie $z = f(x, y)$: sobre cada punto del dominio se levanta una altura $f(x, y)$. La de $\\sqrt{9 - x^2 - y^2}$ es la mitad de arriba de la esfera de radio 3.'
        ]
      },
      {
        type: 'explainer', heading: 'Del cerro al mapa: curvas de nivel', short: 'Curvas de nivel',
        title: 'El cerro z = 9 − x² − y²',
        intro: 'Una <strong>curva de nivel</strong> de $f$ son los puntos del plano donde $f(x, y) = c$: la orilla del corte de la superficie con el plano horizontal $z = c$, vista desde arriba. Varias juntas forman el <strong>mapa de contorno</strong>.',
        diagram: 'c2s01-levels',
        steps: [
          { text: 'Corta el cerro a la altura $c = 1$: la orilla es $9 - x^2 - y^2 = 1$, o sea la circunferencia $x^2 + y^2 = 8$.', state: { c: 1 } },
          { text: 'Más arriba, $c = 5$: queda $x^2 + y^2 = 4$, una circunferencia más chica.', state: { c: 5 } },
          { text: 'Cerca de la cima, $c = 8$: $x^2 + y^2 = 1$. En $c = 9$ la «curva» es solo el punto $(0, 0)$, y para $c > 9$ no hay curva: el cerro no llega tan alto.', state: { c: 8 } },
          { text: 'Mira el mapa: los niveles van de 1 en 1, pero las circunferencias están más juntas hacia afuera. Ahí el cerro es más empinado: hay que avanzar menos para subir lo mismo.', state: { c: 3 } }
        ]
      },
      {
        type: 'recipe', heading: 'Receta: leer una superficie en 3D', short: 'Receta',
        steps: [
          { text: 'Pasa todo a un lado y, si hay términos lineales junto a un cuadrado ($x^2 - 4x$), completa cuadrados para encontrar el centro.' },
          { text: 'Cuenta: ¿cuántas variables están al cuadrado?, ¿alguna aparece solo lineal?, ¿alguna falta? Una lineal → paraboloide; una que falta → cilindro.', tip: 'Fíjate en los signos de los cuadrados y en la constante del otro lado: un signo menos con constante positiva es una hoja; dos signos menos, dos hojas; constante 0, cono.' },
          { text: 'Corta con planos $z = k$ (y $x = k$, $y = k$): sustituye el número y mira qué cónica queda. Así confirmas el tipo y sabes hacia dónde abre.' },
          { text: 'Para una función $z = f(x, y)$, primero el dominio (raíces, logaritmos, denominadores); luego las curvas de nivel $f(x, y) = c$ con valores de $c$ igualmente espaciados.', tip: 'Una curva de nivel vive en el plano $xy$: es $f(x, y) = c$, sin $z$. No la confundas con la superficie.' },
          { text: 'Lee el mapa: curvas juntas = subida empinada; separadas = casi plano. El valor de $c$ de la curva que pasa por un punto es $f$ evaluada en ese punto.' }
        ]
      },
      {
        type: 'example', heading: 'Distancia entre dos puntos',
        problem: '<p>Calcula la distancia entre $P' + pt(e1.P[0], e1.P[1], e1.P[2]) + '$ y $Q' + pt(e1.Q[0], e1.Q[1], e1.Q[2]) + '$.</p>',
        steps: [
          { text: 'Resta coordenada por coordenada (el orden no importa porque se elevan al cuadrado).', math: '\\Delta x = 4 - 1 = 3,\\quad \\Delta y = 2 - (-2) = 4,\\quad \\Delta z = -9 - 3 = -12' },
          { text: 'Suma los cuadrados y saca raíz.', math: 'd = \\sqrt{3^2 + 4^2 + (-12)^2} = \\sqrt{9 + 16 + 144} = \\sqrt{169} = ' + fx(e1.d) }
        ],
        answer: '$d = ' + fx(e1.d) + '$.',
        verify: { lab: 'call', mod: 'surface', fn: 'dist', args: [e1.P, e1.Q], value: e1.d }
      },
      {
        type: 'example', heading: 'Centro y radio de una esfera',
        problem: '<p>Encuentra el centro y el radio de la esfera $x^2 + y^2 + z^2 - 4x + 6y - 2z - 2 = 0$.</p>',
        steps: [
          { text: 'Agrupa cada variable y pasa la constante al otro lado.', math: '(x^2 - 4x) + (y^2 + 6y) + (z^2 - 2z) = 2' },
          { text: 'Completa cada cuadrado: suma la mitad del coeficiente al cuadrado en ambos lados.', math: '(x^2 - 4x + 4) + (y^2 + 6y + 9) + (z^2 - 2z + 1) = 2 + 4 + 9 + 1' },
          { text: 'Factoriza.', math: '(x - 2)^2 + (y + 3)^2 + (z - 1)^2 = 16' },
          { text: 'Lee el centro con el signo cambiado y saca la raíz del lado derecho.' }
        ],
        answer: 'Centro $' + pt(e2.c[0], e2.c[1], e2.c[2]) + '$ y radio $r = ' + fx(e2.r) + '$.',
        verify: { lab: 'call', mod: 'surface', fn: 'sphere', args: [e2.D, e2.E, e2.F, e2.G], values: { r: e2.r, 'center.0': e2.c[0], 'center.1': e2.c[1], 'center.2': e2.c[2] } }
      },
      {
        type: 'example', heading: 'Plano por tres puntos',
        problem: '<p>Encuentra la ecuación del plano que pasa por $P' + pt(1, 0, 2) + '$, $Q' + pt(2, 1, 0) + '$ y $R' + pt(0, 2, 1) + '$.</p>',
        steps: [
          { text: 'Dos vectores dentro del plano.', math: '\\overrightarrow{PQ} = \\langle ' + e3.u.join(', ') + ' \\rangle,\\qquad \\overrightarrow{PR} = \\langle ' + e3.w.join(', ') + ' \\rangle' },
          { text: 'Su producto cruz es perpendicular a los dos: es la normal.', math: '\\vec n = \\overrightarrow{PQ} \\times \\overrightarrow{PR} = \\langle (1)(-1) - (-2)(2),\\ (-2)(-1) - (1)(-1),\\ (1)(2) - (1)(-1) \\rangle = \\langle ' + e3.n.join(', ') + ' \\rangle' },
          { text: 'Usa $P$ como punto del plano.', math: '3(x - 1) + 3(y - 0) + 3(z - 2) = 0 \\;\\Rightarrow\\; 3x + 3y + 3z = ' + e3.d },
          { text: 'Divide entre 3. Comprueba con $Q$: $2 + 1 + 0 = 3$. Con $R$: $0 + 2 + 1 = 3$.' }
        ],
        answer: '$x + y + z = 3$ (normal $\\langle 1, 1, 1 \\rangle$).',
        verify: { lab: 'call', mod: 'surface', fn: 'planeFromPoints', args: [e3.P, e3.Q, e3.R], values: { a: e3.n[0], b: e3.n[1], c: e3.n[2], d: e3.d } }
      },
      {
        type: 'example', heading: 'Plano con punto y normal; sus intersecciones con los ejes', short: 'Intersecciones con los ejes',
        problem: '<p>El plano pasa por $P_0' + pt(1, 2, 1) + '$ y tiene normal $\\vec n = \\langle 2, 1, 2 \\rangle$. Escribe su ecuación y encuentra dónde corta cada eje.</p>',
        steps: [
          { text: 'Forma punto-normal y desarrolla.', math: '2(x - 1) + 1(y - 2) + 2(z - 1) = 0 \\;\\Rightarrow\\; 2x + y + 2z = ' + e4.d },
          { text: 'Eje $x$: haz $y = z = 0$.', math: '2x = 6 \\;\\Rightarrow\\; x = ' + fx(e4.ix) },
          { text: 'Eje $y$: $x = z = 0$. Eje $z$: $x = y = 0$.', math: 'y = ' + fx(e4.iy) + ',\\qquad 2z = 6 \\;\\Rightarrow\\; z = ' + fx(e4.iz) },
          { text: 'Une los tres puntos y tienes el triángulo de la figura de planos.' }
        ],
        answer: '$2x + y + 2z = 6$; corta en $(3, 0, 0)$, $(0, 6, 0)$ y $(0, 0, 3)$.',
        verify: { lab: 'call', mod: 'surface', fn: 'intercepts', args: [{ a: e4.n[0], b: e4.n[1], c: e4.n[2], d: e4.d }], values: { x: e4.ix, y: e4.iy, z: e4.iz } }
      },
      {
        type: 'example', heading: '¿Qué cuádrica es?',
        problem: '<p>Identifica la superficie $x^2 + y^2 - z^2 - 4z = 0$.</p>',
        steps: [
          { text: 'Hay un término lineal en $z$ junto a $z^2$: completa el cuadrado (con cuidado con el signo menos).', math: '-(z^2 + 4z) = -(z + 2)^2 + 4' },
          { text: 'Sustituye y acomoda.', math: 'x^2 + y^2 - (z + 2)^2 = -4 \\;\\Rightarrow\\; (z + 2)^2 - x^2 - y^2 = 4' },
          { text: 'Dos signos menos y constante positiva: hiperboloide de dos hojas, con eje paralelo al eje $z$ y centro en $(0, 0, -2)$.' },
          { text: 'Compruébalo con trazas: en $z = k$ queda $x^2 + y^2 = (k + 2)^2 - 4$, que solo existe si $k \\leq -4$ o $k \\geq 0$. Entre $-4$ y $0$ no hay superficie: el hueco entre las dos hojas.' }
        ],
        answer: 'Un hiperboloide de dos hojas: $(z + 2)^2 - x^2 - y^2 = 4$.',
        verify: { lab: 'call', mod: 'surface', fn: 'kindOf', args: [{ A: 1, B: 1, C: -1, F: -4 }], value: 'hyperboloid2' }
      },
      {
        type: 'example', heading: 'La curva de nivel que pasa por un punto', short: 'Nivel por un punto',
        problem: '<p>Para $f(x, y) = x^2 + 2y^2$, ¿qué curva de nivel pasa por el punto $(1, 2)$? ¿Qué forma tiene?</p>',
        steps: [
          { text: 'El nivel de la curva es el valor de $f$ en el punto.', math: 'c = f(1, 2) = 1^2 + 2(2)^2 = 1 + 8 = ' + e6.c },
          { text: 'La curva es $f(x, y) = 9$. Divide entre 9 para reconocerla.', math: 'x^2 + 2y^2 = 9 \\;\\Rightarrow\\; \\frac{x^2}{9} + \\frac{y^2}{4.5} = 1' },
          { text: 'Es una elipse con semiejes $3$ en $x$ y $\\sqrt{4.5} \\approx 2.12$ en $y$. Todas las curvas de nivel de $f$ son elipses parecidas: la superficie es un paraboloide elíptico.' }
        ],
        answer: 'La curva $x^2 + 2y^2 = ' + e6.c + '$, una elipse ($c = ' + e6.c + '$).',
        verify: { lab: 'call', mod: 'surface', fn: 'evalAt', math: true, args: ['x^2 + 2y^2', e6.x, e6.y], value: e6.c }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué el eje $x$ apunta hacia mí y no a la derecha?', a: 'Es la convención para dibujar en perspectiva con la regla de la mano derecha: $x$ hacia ti, $y$ a la derecha, $z$ arriba. Si cambias el orden de dos ejes, el sistema queda «de mano izquierda» y los productos cruz salen con el signo al revés.' },
          { q: '¿$x^2 + y^2 = 1$ es una circunferencia o un cilindro?', a: 'Depende de dónde estés. En el plano $xy$ es una circunferencia; en el espacio, como $z$ es libre, es un cilindro.' },
          { q: '¿La curva de nivel es lo mismo que la traza?', a: 'Casi. La traza en $z = c$ es la curva dentro del espacio, a la altura $c$. La curva de nivel es esa misma curva bajada al plano $xy$: se escribe $f(x, y) = c$, sin $z$.' },
          { q: '¿Cómo distingo un hiperboloide de un cono?', a: 'Después de completar cuadrados, mira el número del otro lado: si es 0 es un cono; si no, un hiperboloide. Los signos te dicen si es de una o de dos hojas.' },
          { q: '¿Por qué las curvas juntas significan pendiente fuerte?', a: 'Entre dos curvas vecinas la altura cambia lo mismo (por ejemplo 1 m). Si están cerca, ese cambio ocurre en poca distancia horizontal: la subida es empinada.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Distancia en 3D: Pitágoras con tres diferencias; esfera: $(x - h)^2 + (y - k)^2 + (z - l)^2 = r^2$.',
          'Plano: $a(x - x_0) + b(y - y_0) + c(z - z_0) = 0$; corta el eje $x$ en $d/a$ (y así los otros).',
          'Cuádricas: cuenta cuadrados, signos, variables lineales o ausentes, y confirma con trazas.',
          'Curvas de nivel $f(x, y) = c$: un mapa topográfico; juntas = empinado.'
        ]
      }
    ],

    lab: {
      type: 'surface-contour', title: 'Superficie 3D ↔ mapa de contorno',
      intro: 'Elige o escribe $f(x, y)$ y mueve el nivel $c$: la curva $f = c$ se resalta en el mapa y el plano $z = c$ corta la superficie (en PC la ves en 3D; en el celular, con el corte lateral $y = b$). Reto 1: calcula qué nivel pasa por el punto $P$. Reto 2 (en el selector de arriba): identifica una cuádrica al azar por sus trazas. El lab te dice si intercambiaste $x$ y $y$, si leíste la curva dibujada en lugar de calcular, o qué cuádrica se parece a la tuya.',
      cfg: { start: 0 }
    },

    formulas: [
      { label: 'Distancia', tex: 'd = \\sqrt{\\Delta x^2 + \\Delta y^2 + \\Delta z^2}' },
      { label: 'Esfera', tex: '(x - h)^2 + (y - k)^2 + (z - l)^2 = r^2' },
      { label: 'Plano', tex: 'a(x - x_0) + b(y - y_0) + c(z - z_0) = 0' },
      { label: 'Normal por tres puntos', tex: '\\vec n = \\overrightarrow{PQ} \\times \\overrightarrow{PR}' },
      { label: 'Cortes con los ejes', tex: 'x = \\tfrac{d}{a},\\ y = \\tfrac{d}{b},\\ z = \\tfrac{d}{c}' },
      { label: 'Curva de nivel', tex: 'f(x, y) = c' }
    ],

    exercises: [
      {
        id: 'c2-s01-distancia', title: 'Distancia entre dos puntos',
        vars: { x1: [-5, 5, 1], y1: [-5, 5, 1], z1: [-5, 5, 1], x2: [-5, 5, 1], y2: [-5, 5, 1], z2: [-5, 5, 1] },
        baseWhere: function (v) { return v.z1 !== v.z2 && v.x1 !== v.x2; },
        prompt: function (v) { return '<p>Calcula la distancia entre $P' + pt(v.x1, v.y1, v.z1) + '$ y $Q' + pt(v.x2, v.y2, v.z2) + '$.</p>'; },
        check: 'numeric',
        answer: function (v) { return Math.sqrt(sq(v.x2 - v.x1) + sq(v.y2 - v.y1) + sq(v.z2 - v.z1)); },
        mistakes: {
          noSqrt: function (v) { return sq(v.x2 - v.x1) + sq(v.y2 - v.y1) + sq(v.z2 - v.z1); },
          forgotZ: function (v) { return Math.sqrt(sq(v.x2 - v.x1) + sq(v.y2 - v.y1)); },
          sumAbs: function (v) { return Math.abs(v.x2 - v.x1) + Math.abs(v.y2 - v.y1) + Math.abs(v.z2 - v.z1); }
        },
        feedback: [
          { when: 'noSqrt', say: 'Te faltó sacar la raíz: eso es $d^2$.' },
          { when: 'forgotZ', say: 'Usaste solo $x$ y $y$: en 3D también va $(z_2 - z_1)^2$.' },
          { when: 'sumAbs', say: 'Sumaste las diferencias. La distancia en línea recta es la raíz de la suma de sus cuadrados.' }
        ],
        oracle: { lab: 'call', mod: 'surface', fn: 'dist', args: function (v) { return [[v.x1, v.y1, v.z1], [v.x2, v.y2, v.z2]]; } },
        hint: 'Resta coordenada por coordenada, eleva al cuadrado, suma y saca raíz.',
        solution: function (v) {
          var dx = v.x2 - v.x1, dy = v.y2 - v.y1, dz = v.z2 - v.z1, s = dx * dx + dy * dy + dz * dz;
          return '$$d = \\sqrt{(' + dx + ')^2 + (' + dy + ')^2 + (' + dz + ')^2} = \\sqrt{' + s + '} \\approx ' + fx(Math.sqrt(s)) + '$$';
        }
      },
      {
        id: 'c2-s01-esfera', title: 'Radio de una esfera',
        vars: { h: [-4, 4, 1], k: [-4, 4, 1], l: [-4, 4, 1], r: [2, 7, 1] },
        baseWhere: function (v) { return v.h !== 0 && v.k !== 0; },
        prompt: function (v) {
          var G = v.h * v.h + v.k * v.k + v.l * v.l - v.r * v.r;
          return '<p>La ecuación $' + poly([[1, 'x^2'], [1, 'y^2'], [1, 'z^2'], [-2 * v.h, 'x'], [-2 * v.k, 'y'], [-2 * v.l, 'z'], [G, '']]) + ' = 0$ es una esfera. ¿Cuál es su radio?</p>';
        },
        check: 'numeric',
        answer: function (v) { return v.r; },
        mistakes: {
          squared: function (v) { return v.r * v.r; },
          noHalf: function (v) { return Math.sqrt(3 * (v.h * v.h + v.k * v.k + v.l * v.l) + v.r * v.r); }
        },
        feedback: [
          { when: 'squared', say: 'Ese número es $r^2$: falta sacar la raíz.' },
          { when: 'noHalf', say: 'Al completar el cuadrado se suma la <em>mitad</em> del coeficiente al cuadrado: $x^2 - 4x = (x - 2)^2 - 4$.' }
        ],
        oracle: { lab: 'call', mod: 'surface', fn: 'sphere', field: 'r', args: function (v) { return [-2 * v.h, -2 * v.k, -2 * v.l, v.h * v.h + v.k * v.k + v.l * v.l - v.r * v.r]; } },
        hint: 'Agrupa $x^2 + Dx$, $y^2 + Ey$, $z^2 + Fz$ y completa cada cuadrado sumando $(D/2)^2$, $(E/2)^2$ y $(F/2)^2$ en ambos lados.',
        solution: function (v) {
          var s = v.h * v.h + v.k * v.k + v.l * v.l, G = s - v.r * v.r;
          return 'Completando cuadrados: $$(x ' + (v.h < 0 ? '+ ' + (-v.h) : '- ' + v.h) + ')^2 + (y ' + (v.k < 0 ? '+ ' + (-v.k) : '- ' + v.k) + ')^2 + (z ' + (v.l < 0 ? '+ ' + (-v.l) : '- ' + v.l) + ')^2 = ' + s + ' - (' + G + ') = ' + (v.r * v.r) + '$$ El centro es $' + pt(v.h, v.k, v.l) + '$ y el radio $r = \\sqrt{' + (v.r * v.r) + '} = ' + v.r + '$.';
        }
      },
      {
        id: 'c2-s01-plano-eje', title: 'Dónde corta un plano a un eje',
        vars: { a: [-4, 5, 1], b: [-4, 5, 1], c: [-4, 5, 1], x0: [-3, 3, 1], y0: [-3, 3, 1], z0: [-3, 3, 1], ax: [0, 2, 1] },
        baseWhere: function (v) { return v.a !== 0 && v.b !== 0 && v.c !== 0 && (v.a * v.x0 + v.b * v.y0 + v.c * v.z0) !== 0; },
        prompt: function (v) {
          return '<p>Un plano pasa por $P_0' + pt(v.x0, v.y0, v.z0) + '$ y tiene normal $\\vec n = \\langle ' + v.a + ', ' + v.b + ', ' + v.c + ' \\rangle$. ¿En qué valor corta al eje $' + 'xyz'[v.ax] + '$? (Da la coordenada $' + 'xyz'[v.ax] + '$ del punto.)</p>';
        },
        check: 'numeric',
        answer: function (v) { var d = v.a * v.x0 + v.b * v.y0 + v.c * v.z0; return d / [v.a, v.b, v.c][v.ax]; },
        mistakes: {
          sign: function (v) { var d = v.a * v.x0 + v.b * v.y0 + v.c * v.z0; return -d / [v.a, v.b, v.c][v.ax]; },
          inverted: function (v) { var d = v.a * v.x0 + v.b * v.y0 + v.c * v.z0; return [v.a, v.b, v.c][v.ax] / d; }
        },
        feedback: [
          { when: 'sign', say: 'Revisa el signo de $d$: al desarrollar $a(x - x_0) + \\dots = 0$, la constante pasa al otro lado como $d = ax_0 + by_0 + cz_0$.' },
          { when: 'inverted', say: 'Lo invertiste: en el eje, por ejemplo, $ax = d$, así que $x = d/a$, no $a/d$.' }
        ],
        oracle: { lab: 'call', mod: 'surface', fn: 'axisIntercept', args: function (v) { return [{ a: v.a, b: v.b, c: v.c, d: v.a * v.x0 + v.b * v.y0 + v.c * v.z0 }, v.ax]; } },
        hint: 'Primero escribe el plano como $ax + by + cz = d$ con $d = ax_0 + by_0 + cz_0$. En el eje pedido, las otras dos coordenadas valen 0.',
        solution: function (v) {
          var d = v.a * v.x0 + v.b * v.y0 + v.c * v.z0, k = [v.a, v.b, v.c][v.ax], name = 'xyz'[v.ax];
          return '$d = (' + v.a + ')(' + v.x0 + ') + (' + v.b + ')(' + v.y0 + ') + (' + v.c + ')(' + v.z0 + ') = ' + d + '$, así que el plano es $' + poly([[v.a, 'x'], [v.b, 'y'], [v.c, 'z']]) + ' = ' + d + '$. En el eje $' + name + '$ las otras coordenadas son 0: $$' + name + ' = \\frac{' + d + '}{' + k + '} \\approx ' + fx(d / k) + '$$';
        }
      },
      {
        id: 'c2-s01-nivel', title: 'Curva de nivel por un punto',
        vars: { t: [0, 2, 1], a: [1, 4, 1], b: [1, 4, 1], x0: [-3, 3, 1], y0: [-3, 3, 1] },
        baseWhere: function (v) { return v.a !== v.b && Math.abs(levelF(v, v.x0, v.y0)) >= 1 && (v.x0 < 0 || v.y0 < 0); },
        prompt: function (v) { return '<p>Para $f(x, y) = ' + levelTex(v) + '$, ¿qué valor de $c$ tiene la curva de nivel $f(x, y) = c$ que pasa por el punto $(' + v.x0 + ', ' + v.y0 + ')$?</p>'; },
        check: 'numeric',
        answer: function (v) { return levelF(v, v.x0, v.y0); },
        mistakes: {
          swapped: function (v) { return levelF(v, v.y0, v.x0); },
          negSquare: function (v) { return levelF(v, v.x0, v.y0, true); }
        },
        feedback: [
          { when: 'swapped', say: 'Intercambiaste las coordenadas: en $(x_0, y_0)$ la primera va en $x$ y la segunda en $y$.' },
          { when: 'negSquare', say: 'Cuidado con los negativos al cuadrado: $(-3)^2 = 9$, no $-9$. Usa paréntesis.' }
        ],
        oracle: { lab: 'call', mod: 'surface', fn: 'evalAt', math: true, args: function (v) { return [levelSrc(v), v.x0, v.y0]; } },
        hint: 'La curva de nivel que pasa por un punto tiene $c = f(x_0, y_0)$. Sustituye con paréntesis.',
        solution: function (v) {
          var sub = levelTex(v).split('x').join('(' + v.x0 + ')').split('y').join('(' + v.y0 + ')');
          return '$$c = f(' + v.x0 + ', ' + v.y0 + ') = ' + sub + ' = ' + fx(levelF(v, v.x0, v.y0)) + '$$ La curva es $' + levelTex(v) + ' = ' + fx(levelF(v, v.x0, v.y0)) + '$.';
        }
      },
      {
        id: 'c2-s01-cuadrica', title: '¿Qué cuádrica es?',
        vars: { t: [0, 7, 1], A: [1, 4, 1], B: [1, 4, 1], C: [1, 4, 1], K: [2, 12, 1], p: [0, 2, 1] },
        where: function (v) { return !(v.t === 0 && v.A === v.B && v.B === v.C); },
        prompt: function (v) { return '<p>¿Qué superficie es $' + quadricTex(v) + '$?</p>'; },
        check: 'choice',
        options: function (v) {
          return [{ text: Q_NAMES[v.t], correct: true }].concat(Q_WRONG[v.t].map(function (w) { return { text: Q_NAMES[w[0]], say: w[1] }; }));
        },
        answer: function (v) { return Q_NAMES[v.t]; },
        hint: 'Cuenta las variables al cuadrado y sus signos; fíjate si alguna es lineal o falta, y qué número queda del otro lado.',
        solution: function (v) {
          var why = [
            'Los tres cuadrados con el mismo signo y constante positiva: todas sus trazas son elipses.',
            'Un solo signo menos y constante positiva: elipses en las trazas perpendiculares a su eje e hipérbolas en las otras.',
            'Dos signos menos y constante positiva: hay un tramo del eje sin traza, entre las dos hojas.',
            'Tres cuadrados con un signo distinto y 0 del otro lado: por el vértice la traza es un punto.',
            'Una variable lineal y dos cuadrados con el mismo signo: trazas elípticas y parabólicas.',
            'Una variable lineal y dos cuadrados con signos distintos: trazas hiperbólicas y parabólicas (una silla).',
            'Falta una variable y los dos cuadrados tienen el mismo signo: la elipse se repite a lo largo del eje que falta.',
            'Una variable al cuadrado, otra lineal y una ausente: la parábola se repite a lo largo del eje que falta.'
          ][v.t];
          return '<strong>' + Q_NAMES[v.t] + '.</strong> ' + why;
        }
      },
      {
        id: 'c2-s01-dominio', title: 'Dominio de una función de dos variables',
        vars: { t: [0, 3, 1], R: [2, 5, 1] },
        prompt: function (v) { return '<p>¿Cuál es el dominio de $f(x, y) = ' + domainCase(v).f + '$?</p>'; },
        check: 'choice',
        options: function (v) {
          var d = domainCase(v);
          return [{ text: d.ok, correct: true }].concat(d.wrong.map(function (w) { return { text: w[0], say: w[1] }; }));
        },
        answer: function (v) { return domainCase(v).ok; },
        hint: 'Raíz: radicando $\\geq 0$. Logaritmo: argumento $> 0$. Cociente: denominador $\\neq 0$.',
        solution: function (v) { return domainCase(v).why; }
      }
    ],

    quiz: { tags: ['c2.S01'], count: 8 },

    errors: [
      'Olvidar la diferencia en $z$ al calcular una distancia en 3D.',
      'Al completar cuadrados, sumar el coeficiente completo en lugar de su mitad al cuadrado, o sumarlo solo de un lado.',
      'Leer mal el centro de una esfera: $(x + 3)^2$ corresponde a $h = -3$.',
      'Confundir $d/a$ con $a/d$ al buscar dónde corta un plano a un eje.',
      'Tomar $x^2 + y^2 = 4$ como circunferencia cuando se está en el espacio: es un cilindro.',
      'Confundir hiperboloide de una hoja, de dos hojas y cono: mira los signos y si la constante es 0.',
      'Escribir la curva de nivel con $z$: la curva vive en el plano $xy$ y es $f(x, y) = c$.'
    ],

    teacher: {
      plan: [
        'Empieza con la esquina del salón: que señalen los ejes y ubiquen un punto con tres números.',
        'Explainer del punto y la distancia; luego la esfera completando cuadrados.',
        'Planos: forma punto-normal, plano por tres puntos con producto cruz e intersecciones con los ejes.',
        'Cuádricas con el explainer de trazas y la tabla; reto del lab «¿qué cuádrica es?» en parejas.',
        'Funciones de dos variables: dominio, gráfica y el explainer del cerro; cierra con el lab de contornos.'
      ],
      check: [
        'Que dibujen el camino $x \\to y \\to z$ al ubicar un punto.',
        'Que completen cuadrados en ambos lados de la ecuación.',
        'Que identifiquen una cuádrica con al menos dos trazas, no solo de memoria.'
      ],
      note: 'Las coordenadas cilíndricas y esféricas llegan en S03; las derivadas parciales (pendiente de las trazas) en S04.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §2.2 “Vectors in Three Dimensions”. <a href="' + OS + '2-2-vectors-in-three-dimensions">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 3</em>, §2.5 “Equations of Lines and Planes in Space”. <a href="' + OS + '2-5-equations-of-lines-and-planes-in-space">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 3</em>, §2.6 “Quadric Surfaces”. <a href="' + OS + '2-6-quadric-surfaces">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 3</em>, §4.1 “Functions of Several Variables”. <a href="' + OS + '4-1-functions-of-several-variables">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: null,
    next: 'sesion-02'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
