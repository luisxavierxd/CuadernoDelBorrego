/* =====================================================================
   Cálculo 2 · S03 · Coordenadas cilíndricas y esféricas (bloque A).
   Fuente: OpenStax, Calculus Volume 3, §2.7 (CC BY-NC-SA 4.0).
   Convención de OpenStax: θ ∈ [0, 2π) desde el eje x positivo; φ ∈ [0, π]
   medido desde el eje z positivo. Ángulos en radianes.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.coords (verify / oracle).
   ===================================================================== */
(function () {
  var PI = Math.PI, TAU = 2 * PI, DEG = 180 / PI;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  // nπ/d en LaTeX, simplificado: piTex(4, 6) → \frac{2\pi}{3}
  function piTex(n, d) {
    var g = gcd(n, d); n /= g; d /= g;
    if (n === 0) return '0';
    var s = n < 0 ? '-' : ''; n = Math.abs(n);
    if (d === 1) return s + (n === 1 ? '' : n) + '\\pi';
    return s + '\\frac{' + (n === 1 ? '' : n) + '\\pi}{' + d + '}';
  }
  function norm(t) { var u = t % TAU; return u < 0 ? u + TAU : u; }
  // La respuesta y cada error típico difieren lo suficiente para que el «casi» no sea ambiguo.
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      if (!vals.every(isFinite)) return false;
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (Math.abs(vals[i] - vals[j]) <= Math.max(0.03, 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j])))) return false;
      }
      return true;
    };
  }

  // Ejemplo 1: cilíndricas → rectangulares
  var e1 = { r: 4, th: 2 * PI / 3, z: -2 };
  e1.x = e1.r * Math.cos(e1.th); e1.y = e1.r * Math.sin(e1.th);
  // Ejemplo 2: rectangulares → esféricas, con el cuadrante
  var e2 = { x: -1, y: Math.sqrt(3), z: 2 };
  e2.rho = Math.sqrt(e2.x * e2.x + e2.y * e2.y + e2.z * e2.z);
  e2.th = PI + Math.atan(e2.y / e2.x);
  e2.phi = Math.acos(e2.z / e2.rho);
  // Ejemplo 3: esféricas → cilíndricas, con φ > π/2
  var e3 = { rho: 8, th: PI / 6, phi: 2 * PI / 3 };
  e3.r = e3.rho * Math.sin(e3.phi); e3.z = e3.rho * Math.cos(e3.phi);
  // Ejemplo 4: un punto de la esfera x² + y² + z² = 4z y del cono z = √(x² + y²)
  var e4 = { rho: 2 * Math.SQRT2, th: PI / 2, phi: PI / 4 };

  var data = window.SESSION_DATA = {
    slug: 'sesion-03', number: '03', group: 'A · Espacio y derivada parcial',
    title: 'Coordenadas cilíndricas y esféricas', temario: [],
    minutes: 180,
    quote: 'Un punto no cambia de lugar porque le cambies el nombre. Cada sistema de coordenadas es otra forma de decir dónde está.',
    badges: [
      'Pasar un punto entre rectangulares, cilíndricas y esféricas, en los seis sentidos.',
      'Calcular $\\theta$ en el cuadrante correcto y $\\varphi$ desde el eje $z$ positivo.',
      'Reconocer las superficies $r = c$, $\\theta = c$, $z = c$, $\\rho = c$ y $\\varphi = c$.',
      'Reescribir una ecuación en el sistema que la vuelve más sencilla.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Las <strong>cilíndricas</strong> son polares en el piso más la altura $z$. Las <strong>esféricas</strong> dicen qué tan lejos del origen está el punto y en qué dirección se ve.',
        recall: [
          'Coordenadas polares: $x = r\\cos\\theta$, $y = r\\sin\\theta$, $r^2 = x^2 + y^2$ (<a href="../sesion-02/">S02</a>).',
          'Distancia al origen en 3D: $\\sqrt{x^2 + y^2 + z^2}$ (S01).',
          'Seno, coseno y tangente en un triángulo rectángulo, y los ángulos en radianes.'
        ],
        why: 'Muchas cosas reales tienen un eje o un centro: tuberías, antenas, tanques, planetas, el campo de una carga. Con el sistema que respeta esa simetría, las ecuaciones se vuelven cortas y las integrales del bloque C se pueden hacer.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en un estacionamiento circular de varios pisos. Para decirle a alguien dónde dejaste el coche no le das $x$ y $y$: le dices <em>a qué distancia del poste central</em>, <em>hacia qué lado</em> y <em>en qué piso</em>. Eso son las cilíndricas: $(r, \\theta, z)$.',
          'Ahora piensa en un radar en el suelo que sigue un dron. El radar no mide pisos: mide <em>qué tan lejos</em> está el dron, <em>hacia qué lado</em> gira la antena y <em>cuánto se inclina</em> desde la vertical. Eso son las esféricas: $(\\rho, \\theta, \\varphi)$.',
          'El dron y el coche no se mueven cuando cambias de sistema. Solo cambia la forma de nombrar el mismo punto. Por eso siempre puedes comprobar una conversión regresando a $(x, y, z)$.'
        ]
      },
      {
        type: 'explainer', heading: 'Un punto, tres maneras de nombrarlo', short: 'Un punto, tres sistemas',
        title: 'De $(x, y, z)$ a $(r, \\theta, z)$ y a $(\\rho, \\theta, \\varphi)$',
        intro: 'Sigue el punto $P$. En cada paso aparece una de las coordenadas nuevas.',
        diagram: 'c2s03-punto',
        steps: [
          { text: 'Un punto $P$ del espacio. En rectangulares lo ubicas con tres distancias a lo largo de los ejes: $(x, y, z)$.', state: { k: 0 } },
          { text: 'Baja de $P$ al piso (el plano $xy$). Ahí lo describes en <strong>polares</strong>: $r$ es la distancia al eje $z$ y $\\theta$ el ángulo desde el eje $x$ positivo.', state: { k: 1 } },
          { text: 'La altura sigue siendo $z$. Las <strong>cilíndricas</strong> $(r, \\theta, z)$ son polares en el piso más la altura.', state: { k: 2 } },
          { text: 'Mide directo del origen al punto: esa distancia es $\\rho = \\sqrt{x^2 + y^2 + z^2}$, siempre $\\rho \\ge 0$.', state: { k: 3 } },
          { text: 'El ángulo entre el eje $z$ positivo y el segmento $\\rho$ es $\\varphi$. Las <strong>esféricas</strong> son $(\\rho, \\theta, \\varphi)$. El triángulo vertical da $r = \\rho\\sin\\varphi$ y $z = \\rho\\cos\\varphi$.', state: { k: 4 } }
        ]
      },
      {
        type: 'concept', heading: 'Cilíndricas: polares con altura', short: 'Cilíndricas',
        body: [
          'Las cilíndricas usan las polares del plano $xy$ y dejan $z$ igual. De cilíndricas a rectangulares: $$x = r\\cos\\theta, \\qquad y = r\\sin\\theta, \\qquad z = z.$$',
          'De rectangulares a cilíndricas: $$r = \\sqrt{x^2 + y^2}, \\qquad \\tan\\theta = \\frac{y}{x}, \\qquad z = z.$$',
          'Aquí $r \\ge 0$ es la distancia al <strong>eje $z$</strong> (no al origen) y $\\theta$ va de $0$ a $2\\pi$. Sobre el eje $z$ se tiene $r = 0$ y cualquier $\\theta$ sirve.'
        ]
      },
      {
        type: 'callout', heading: 'Ojo con θ: el cuadrante',
        body: [
          '$\\arctan(y/x)$ solo da ángulos entre $-\\frac{\\pi}{2}$ y $\\frac{\\pi}{2}$, así que no distingue $(1, 1)$ de $(-1, -1)$. Mira los signos de $x$ y $y$: si $x < 0$, súmale $\\pi$; si $x > 0$ y $y < 0$, súmale $2\\pi$ para quedar en $[0, 2\\pi)$.',
          'Es lo mismo que hace la función $\\operatorname{atan2}(y, x)$ de las calculadoras y los lenguajes de programación.'
        ]
      },
      {
        type: 'concept', heading: 'Esféricas: distancia y dos ángulos', short: 'Esféricas',
        body: [
          '$\\rho \\ge 0$ es la distancia del punto al <strong>origen</strong>. $\\theta$ es el mismo ángulo de las cilíndricas. Y $\\varphi$ es el ángulo <strong>desde el eje $z$ positivo</strong> hasta el segmento que va del origen al punto, con $0 \\le \\varphi \\le \\pi$.',
          '<strong>Esta es la convención de OpenStax y la de todo este curso: $\\varphi$ se mide desde el eje $z$ positivo, no desde el plano $xy$.</strong> Con $\\varphi = 0$ estás en el eje $z$ positivo, con $\\varphi = \\frac{\\pi}{2}$ en el plano $xy$ y con $\\varphi = \\pi$ en el eje $z$ negativo. Si $\\varphi > \\frac{\\pi}{2}$, el punto está debajo del plano $xy$.',
          'Del corte vertical: $r = \\rho\\sin\\varphi$ y $z = \\rho\\cos\\varphi$. Con las cilíndricas sale todo lo demás: $$x = \\rho\\sin\\varphi\\cos\\theta, \\quad y = \\rho\\sin\\varphi\\sin\\theta, \\quad z = \\rho\\cos\\varphi.$$',
          'Y al revés: $$\\rho = \\sqrt{x^2 + y^2 + z^2}, \\qquad \\tan\\theta = \\frac{y}{x}, \\qquad \\varphi = \\arccos\\frac{z}{\\rho}.$$ El $\\arccos$ ya da ángulos entre $0$ y $\\pi$, justo el rango de $\\varphi$.'
        ],
        diagram: 'c2s03-phi',
        caption: 'El corte vertical que pasa por el eje $z$ y por el punto. $\\varphi$ se mide desde el eje $z$ positivo; el arco rojo punteado, medido desde el plano, es su complemento $\\frac{\\pi}{2} - \\varphi$ y <strong>no</strong> es $\\varphi$.'
      },
      {
        type: 'callout', heading: 'En física a veces se intercambian θ y φ',
        body: [
          'Muchos libros de física (y la norma ISO) llaman $\\theta$ al ángulo desde el eje $z$ y $\\varphi$ al ángulo en el plano $xy$: justo al revés que aquí. Algunos mapas y programas usan la latitud, que se mide desde el plano. Antes de usar una fórmula de otro libro, revisa qué ángulo es cuál.',
          'En este curso y en sus quizzes: $\\theta$ en el plano $xy$ desde el eje $x$, y $\\varphi$ desde el eje $z$ positivo.'
        ]
      },
      {
        type: 'concept', heading: 'Las seis conversiones', short: 'Seis conversiones',
        body: [
          'Con tres sistemas hay seis direcciones. No las memorices por separado: todas salen de dos triángulos, el del piso (polares) y el del corte vertical.'
        ],
        list: [
          '<strong>Cilíndricas → rectangulares:</strong> $x = r\\cos\\theta$, $y = r\\sin\\theta$, $z = z$.',
          '<strong>Rectangulares → cilíndricas:</strong> $r = \\sqrt{x^2 + y^2}$, $\\theta$ con el cuadrante de $(x, y)$, $z = z$.',
          '<strong>Esféricas → rectangulares:</strong> $x = \\rho\\sin\\varphi\\cos\\theta$, $y = \\rho\\sin\\varphi\\sin\\theta$, $z = \\rho\\cos\\varphi$.',
          '<strong>Rectangulares → esféricas:</strong> $\\rho = \\sqrt{x^2 + y^2 + z^2}$, $\\theta$ con el cuadrante, $\\varphi = \\arccos(z/\\rho)$.',
          '<strong>Esféricas → cilíndricas:</strong> $r = \\rho\\sin\\varphi$, $\\theta = \\theta$, $z = \\rho\\cos\\varphi$.',
          '<strong>Cilíndricas → esféricas:</strong> $\\rho = \\sqrt{r^2 + z^2}$, $\\theta = \\theta$, $\\varphi = \\arccos(z/\\rho)$ (o $\\tan\\varphi = r/z$, cuidando el signo de $z$).'
        ]
      },
      {
        type: 'explainer', heading: 'Superficies de coordenada constante', short: 'Superficies típicas',
        title: 'Fija una coordenada y deja libres las otras dos',
        intro: 'Si fijas una coordenada, los puntos que cumplen esa ecuación forman una superficie. Estas cinco aparecen todo el tiempo.',
        diagram: 'c2s03-superficies',
        steps: [
          { text: '$r = 2$: todos los puntos a distancia 2 del eje $z$, a cualquier altura y hacia cualquier lado. Es un <strong>cilindro</strong> circular con eje $z$.', state: { kind: 'r', c: 2, lbl: 'r = 2', name: 'cilindro' } },
          { text: '$\\theta = \\frac{2\\pi}{3}$: la dirección queda fija y $r \\ge 0$, $z$ son libres. Es un <strong>semiplano</strong> vertical que sale del eje $z$. La otra mitad del plano sería $\\theta = \\frac{5\\pi}{3}$.', state: { kind: 'theta', c: 2 * PI / 3, lbl: 'θ = 2π/3', name: 'semiplano' } },
          { text: '$z = 1.5$: la altura fija. Es un <strong>plano horizontal</strong>; en cilíndricas y en rectangulares se escribe igual.', state: { kind: 'z', c: 1.5, lbl: 'z = 1.5', name: 'plano horizontal' } },
          { text: '$\\rho = 2$: todos los puntos a distancia 2 del origen. Es una <strong>esfera</strong>. Compárala con $r = 2$: allá se mide al eje, aquí al origen.', state: { kind: 'rho', c: 2, lbl: 'ρ = 2', name: 'esfera' } },
          { text: '$\\varphi = \\frac{\\pi}{4}$: todos los puntos que se ven a $45^\\circ$ del eje $z$. Es un <strong>cono</strong> con vértice en el origen. Con $\\varphi > \\frac{\\pi}{2}$ abre hacia abajo y con $\\varphi = \\frac{\\pi}{2}$ es el plano $xy$.', state: { kind: 'phi', c: PI / 4, lbl: 'φ = π/4', name: 'cono' } }
        ]
      },
      {
        type: 'concept', heading: 'Convertir ecuaciones', short: 'Convertir ecuaciones',
        body: [
          'Para pasar una ecuación a otro sistema, busca los grupos que ya conoces y reemplázalos completos: $x^2 + y^2 = r^2$ y $x^2 + y^2 + z^2 = \\rho^2$. Lo que sobre, sustitúyelo con las fórmulas de conversión.'
        ],
        list: [
          '$x^2 + y^2 = 4 \\;\\Rightarrow\\; r^2 = 4 \\;\\Rightarrow\\; r = 2$: un cilindro.',
          '$x^2 + y^2 + z^2 = 9 \\;\\Rightarrow\\; \\rho = 3$: una esfera.',
          '$z = \\sqrt{x^2 + y^2} \\;\\Rightarrow\\; z = r \\;\\Rightarrow\\; \\rho\\cos\\varphi = \\rho\\sin\\varphi \\;\\Rightarrow\\; \\varphi = \\frac{\\pi}{4}$: un cono.',
          '$z = x^2 + y^2 \\;\\Rightarrow\\; z = r^2$: el paraboloide queda en una línea.',
          '$y = x$ con $x > 0 \\;\\Rightarrow\\; \\theta = \\frac{\\pi}{4}$: un semiplano.'
        ]
      },
      {
        type: 'callout', heading: '¿Cuándo conviene cada sistema?',
        body: [
          'Usa el sistema que respeta la <strong>simetría</strong> del problema. Cajas y planos: rectangulares. Algo con un eje (tubos, cilindros, conos de revolución, paraboloides $z = x^2 + y^2$): cilíndricas. Algo con un centro (esferas, conos desde el origen, una carga puntual): esféricas.',
          'Esa misma idea la usa la <a href="../../../fisica-2/sesiones/sesion-08/">ley de Gauss en Física 2 (sesión 8)</a>: para un alambre largo se elige un cilindro alrededor del alambre y para una carga puntual, una esfera. Y en el bloque C de este curso integrarás en estos sistemas.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: convertir un punto', short: 'Receta',
        steps: [
          { text: 'Identifica de qué sistema a qué sistema vas y escribe las fórmulas de esa dirección.' },
          { text: 'Calcula primero las distancias: $r = \\sqrt{x^2 + y^2}$ o $\\rho = \\sqrt{x^2 + y^2 + z^2}$.', tip: '$r$ no lleva $z$; $\\rho$ sí. Son distancias distintas: al eje y al origen.' },
          { text: 'Calcula $\\theta$ y corrige el cuadrante según los signos de $x$ y $y$.', tip: 'Si $x < 0$, a $\\arctan(y/x)$ súmale $\\pi$. Deja $\\theta$ entre $0$ y $2\\pi$.' },
          { text: 'En esféricas, calcula $\\varphi = \\arccos(z/\\rho)$, que ya queda entre $0$ y $\\pi$.', tip: '$\\varphi$ se mide desde el eje $z$ positivo. Si $z < 0$, $\\varphi$ es mayor que $\\frac{\\pi}{2}$.' },
          { text: 'Comprueba regresando a rectangulares. Ten la calculadora en radianes.' }
        ]
      },
      {
        type: 'example', heading: 'De cilíndricas a rectangulares', short: 'Cilíndricas → rectangulares',
        problem: '<p>Un punto tiene coordenadas cilíndricas $(r, \\theta, z) = \\left(4, \\frac{2\\pi}{3}, -2\\right)$. Encuentra sus coordenadas rectangulares.</p>',
        steps: [
          { text: 'Con las fórmulas de polares en el piso:', math: 'x = r\\cos\\theta = 4\\cos\\frac{2\\pi}{3} = 4\\left(-\\frac{1}{2}\\right) = -2' },
          { text: 'La $y$ con el seno:', math: 'y = r\\sin\\theta = 4\\sin\\frac{2\\pi}{3} = 4\\cdot\\frac{\\sqrt{3}}{2} = 2\\sqrt{3} \\approx ' + fx(e1.y) },
          { text: 'La altura no cambia: $z = -2$. Comprueba: $\\theta = \\frac{2\\pi}{3}$ está en el segundo cuadrante, y ahí $x < 0$ y $y > 0$. Coincide.' }
        ],
        answer: '$(x, y, z) = \\left(-2,\\ 2\\sqrt{3},\\ -2\\right) \\approx (-2,\\ ' + fx(e1.y) + ',\\ -2)$.',
        verify: { lab: 'call', mod: 'coords', fn: 'cylToRect', args: [e1.r, e1.th, e1.z], values: { x: e1.x, y: e1.y, z: e1.z } }
      },
      {
        type: 'example', heading: 'De rectangulares a esféricas', short: 'Rectangulares → esféricas',
        problem: '<p>Escribe en coordenadas esféricas el punto $(x, y, z) = \\left(-1, \\sqrt{3}, 2\\right)$.</p>',
        steps: [
          { text: 'La distancia al origen:', math: '\\rho = \\sqrt{(-1)^2 + (\\sqrt{3})^2 + 2^2} = \\sqrt{8} = 2\\sqrt{2} \\approx ' + fx(e2.rho) },
          { text: '$\\theta$: la calculadora da $\\arctan\\frac{\\sqrt{3}}{-1} = -\\frac{\\pi}{3}$, pero el punto tiene $x < 0$ y $y > 0$ (segundo cuadrante). Súmale $\\pi$:', math: '\\theta = -\\frac{\\pi}{3} + \\pi = \\frac{2\\pi}{3} \\approx ' + fx(e2.th) },
          { text: '$\\varphi$ desde el eje $z$ positivo:', math: '\\varphi = \\arccos\\frac{z}{\\rho} = \\arccos\\frac{2}{2\\sqrt{2}} = \\arccos\\frac{\\sqrt{2}}{2} = \\frac{\\pi}{4} \\approx ' + fx(e2.phi) },
          { text: 'Comprueba: $\\rho\\sin\\varphi\\cos\\theta = 2\\sqrt{2}\\cdot\\frac{\\sqrt{2}}{2}\\cdot\\left(-\\frac{1}{2}\\right) = -1$. Coincide con $x$.' }
        ],
        answer: '$(\\rho, \\theta, \\varphi) = \\left(2\\sqrt{2},\\ \\frac{2\\pi}{3},\\ \\frac{\\pi}{4}\\right) \\approx (' + fx(e2.rho) + ',\\ ' + fx(e2.th) + ',\\ ' + fx(e2.phi) + ')$.',
        verify: { lab: 'call', mod: 'coords', fn: 'rectToSph', args: [e2.x, e2.y, e2.z], values: { rho: e2.rho, theta: e2.th, phi: e2.phi } }
      },
      {
        type: 'example', heading: 'De esféricas a cilíndricas', short: 'Esféricas → cilíndricas',
        problem: '<p>Un punto tiene coordenadas esféricas $(\\rho, \\theta, \\varphi) = \\left(8, \\frac{\\pi}{6}, \\frac{2\\pi}{3}\\right)$. ¿Cuáles son sus coordenadas cilíndricas? ¿Está arriba o abajo del plano $xy$?</p>',
        steps: [
          { text: 'No hace falta pasar por $x$ y $y$: el corte vertical da $r$ y $z$ directo.', math: 'r = \\rho\\sin\\varphi = 8\\sin\\frac{2\\pi}{3} = 8\\cdot\\frac{\\sqrt{3}}{2} = 4\\sqrt{3} \\approx ' + fx(e3.r) },
          { text: 'La altura:', math: 'z = \\rho\\cos\\varphi = 8\\cos\\frac{2\\pi}{3} = 8\\left(-\\frac{1}{2}\\right) = -4' },
          { text: '$\\theta$ es el mismo en los dos sistemas: $\\theta = \\frac{\\pi}{6}$. Como $\\varphi = \\frac{2\\pi}{3} > \\frac{\\pi}{2}$, el punto está <strong>abajo</strong> del plano $xy$, y por eso $z < 0$.' }
        ],
        answer: '$(r, \\theta, z) = \\left(4\\sqrt{3},\\ \\frac{\\pi}{6},\\ -4\\right) \\approx (' + fx(e3.r) + ',\\ ' + fx(PI / 6) + ',\\ -4)$, debajo del plano $xy$.',
        verify: { lab: 'call', mod: 'coords', fn: 'sphToCyl', args: [e3.rho, e3.th, e3.phi], values: { r: e3.r, theta: e3.th, z: e3.z } }
      },
      {
        type: 'example', heading: 'Convertir ecuaciones: una esfera y un cono', short: 'Convertir ecuaciones',
        problem: '<p>Escribe en coordenadas esféricas la esfera $x^2 + y^2 + z^2 = 4z$ y el cono $z = \\sqrt{x^2 + y^2}$. Comprueba con el punto $(0, 2, 2)$, que está en los dos.</p>',
        steps: [
          { text: 'En la esfera, reemplaza el grupo completo $x^2 + y^2 + z^2 = \\rho^2$ y usa $z = \\rho\\cos\\varphi$:', math: '\\rho^2 = 4\\rho\\cos\\varphi \\;\\Rightarrow\\; \\rho = 4\\cos\\varphi' },
          { text: 'Dividir entre $\\rho$ no pierde puntos: el origen ($\\rho = 0$) sigue en la curva con $\\varphi = \\frac{\\pi}{2}$. En el cono, $\\sqrt{x^2 + y^2} = r = \\rho\\sin\\varphi$:', math: '\\rho\\cos\\varphi = \\rho\\sin\\varphi \\;\\Rightarrow\\; \\tan\\varphi = 1 \\;\\Rightarrow\\; \\varphi = \\frac{\\pi}{4}' },
          { text: 'Comprueba con $(0, 2, 2)$: $\\rho = \\sqrt{0 + 4 + 4} = 2\\sqrt{2}$, $\\theta = \\frac{\\pi}{2}$ (está sobre el eje $y$ positivo) y $\\varphi = \\arccos\\frac{2}{2\\sqrt{2}} = \\frac{\\pi}{4}$.', math: '4\\cos\\frac{\\pi}{4} = 4\\cdot\\frac{\\sqrt{2}}{2} = 2\\sqrt{2} = \\rho \\quad\\checkmark' }
        ],
        answer: 'La esfera es $\\rho = 4\\cos\\varphi$ y el cono es $\\varphi = \\frac{\\pi}{4}$. El punto $(0, 2, 2)$ tiene $(\\rho, \\theta, \\varphi) = \\left(2\\sqrt{2}, \\frac{\\pi}{2}, \\frac{\\pi}{4}\\right)$ y cumple las dos.',
        verify: { lab: 'call', mod: 'coords', fn: 'rectToSph', args: [0, 2, 2], values: { rho: e4.rho, theta: e4.th, phi: e4.phi } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Cuál es la diferencia entre $r$ y $\\rho$?', a: '$r$ es la distancia al <strong>eje $z$</strong>: no le importa la altura. $\\rho$ es la distancia al <strong>origen</strong>. Siempre $\\rho \\ge r$, y son iguales solo en el plano $xy$.' },
          { q: '¿Por qué mi calculadora da un $\\theta$ negativo o del lado contrario?', a: 'Porque $\\arctan$ solo devuelve ángulos entre $-\\frac{\\pi}{2}$ y $\\frac{\\pi}{2}$. Si $x < 0$, súmale $\\pi$; si queda negativo, súmale $2\\pi$.' },
          { q: '¿$\\varphi$ puede ser mayor que $\\frac{\\pi}{2}$?', a: 'Sí, hasta $\\pi$. Pasa con todos los puntos debajo del plano $xy$. Lo que no puede es ser negativo ni pasar de $\\pi$: para darle la vuelta completa está $\\theta$.' },
          { q: 'En mi libro de física $\\theta$ es el ángulo desde el eje $z$. ¿Quién tiene razón?', a: 'Los dos: es una convención distinta, con los nombres intercambiados. Lo importante es saber qué ángulo es cuál antes de usar una fórmula. En este curso, $\\varphi$ es el que se mide desde el eje $z$.' },
          { q: '¿Qué $\\theta$ tiene un punto sobre el eje $z$?', a: 'Cualquiera: ahí $r = 0$ y el ángulo no importa. Por la misma razón, el origen tiene cualquier $\\theta$ y cualquier $\\varphi$.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Cilíndricas: polares en el piso más la altura, $x = r\\cos\\theta$, $y = r\\sin\\theta$, $z = z$.',
          'Esféricas: $x = \\rho\\sin\\varphi\\cos\\theta$, $y = \\rho\\sin\\varphi\\sin\\theta$, $z = \\rho\\cos\\varphi$, con $\\varphi$ desde el eje $z$ positivo.',
          '$\\theta$ siempre con el cuadrante de $(x, y)$; $\\varphi = \\arccos(z/\\rho)$ entre $0$ y $\\pi$.',
          '$r = c$ cilindro, $\\theta = c$ semiplano, $z = c$ plano, $\\rho = c$ esfera, $\\varphi = c$ cono.'
        ]
      }
    ],

    lab: {
      type: 'coord-convert', title: '¿Es tu conversión?',
      intro: 'El lab te da un punto en un sistema y tú escribes sus coordenadas en otro. Ve el punto con sus segmentos y ángulos: $r$ y $\\theta$ en el piso, $z$ vertical, $\\rho$ y $\\varphi$ desde el origen. Detecta si te faltó el cuadrante de $\\theta$, si mediste $\\varphi$ desde el plano $xy$, si usaste grados o si confundiste $r$ con $\\rho$. Arrastra el punto o pide otro.',
      cfg: { start: { from: 'rect', to: 'sph', p: [-2, 2, 2], example: 'quadrant' } }
    },

    formulas: [
      { label: 'Cilíndricas → rect.', tex: 'x = r\\cos\\theta,\\ \\ y = r\\sin\\theta,\\ \\ z = z' },
      { label: 'Rect. → cilíndricas', tex: 'r = \\sqrt{x^2 + y^2},\\ \\ \\tan\\theta = \\frac{y}{x}' },
      { label: 'Esféricas → rect.', tex: 'x = \\rho\\sin\\varphi\\cos\\theta,\\ \\ y = \\rho\\sin\\varphi\\sin\\theta' },
      { label: '', tex: 'z = \\rho\\cos\\varphi' },
      { label: 'Rect. → esféricas', tex: '\\rho = \\sqrt{x^2 + y^2 + z^2},\\ \\ \\varphi = \\arccos\\frac{z}{\\rho}' },
      { label: 'Esféricas ↔ cilíndricas', tex: 'r = \\rho\\sin\\varphi,\\ \\ z = \\rho\\cos\\varphi' },
      { label: 'Rangos', tex: 'r,\\rho \\ge 0,\\ \\ 0 \\le \\theta < 2\\pi,\\ \\ 0 \\le \\varphi \\le \\pi' }
    ],

    exercises: [
      {
        id: 'c2-s03-cil-rect', title: 'De cilíndricas a rectangulares',
        vars: { r: [2, 6, 1], k: [1, 11, 1], z: [-4, 4, 1] },
        where: function (v) { return Math.abs(Math.sin(v.k * PI / 6)) > 0.2; },
        prompt: function (v) { return '<p>Un punto tiene coordenadas cilíndricas $(r, \\theta, z) = \\left(' + v.r + ', ' + piTex(v.k, 6) + ', ' + v.z + '\\right)$. ¿Cuánto vale su coordenada $y$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.r * Math.sin(v.k * PI / 6); },
        mistakes: {
          usedCos: function (v) { return v.r * Math.cos(v.k * PI / 6); },
          degMode: function (v) { return v.r * Math.sin(v.k * PI / 6 / DEG); }
        },
        feedback: [
          { when: 'usedCos', say: 'Ese es $x = r\\cos\\theta$. La coordenada $y$ lleva seno: $y = r\\sin\\theta$.' },
          { when: 'degMode', say: 'Tu calculadora está en grados: $\\theta$ está en radianes. Cámbiala a radianes y vuelve a calcular $\\sin\\theta$.' }
        ],
        oracle: { lab: 'call', mod: 'coords', fn: 'cylToRect', args: function (v) { return [v.r, v.k * PI / 6, v.z]; }, field: 'y' },
        hint: 'En el piso son polares: $y = r\\sin\\theta$. La $z$ no interviene.',
        solution: function (v) { var y = v.r * Math.sin(v.k * PI / 6); return '$$y = r\\sin\\theta = ' + v.r + '\\sin' + piTex(v.k, 6) + ' = ' + fx(y) + '$$'; }
      },
      {
        id: 'c2-s03-rho', title: 'Rectangulares a esféricas: ρ',
        vars: { x: [-5, 5, 1], y: [-5, 5, 1], z: [-5, 5, 1] },
        baseWhere: function (v) { return v.z !== 0 && (v.x !== 0 || v.y !== 0); },
        prompt: function (v) { return '<p>Para el punto $(x, y, z) = (' + v.x + ', ' + v.y + ', ' + v.z + ')$, calcula su coordenada esférica $\\rho$.</p>'; },
        check: 'numeric',
        answer: function (v) { return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z); },
        mistakes: {
          usedR: function (v) { return Math.sqrt(v.x * v.x + v.y * v.y); },
          noSqrt: function (v) { return v.x * v.x + v.y * v.y + v.z * v.z; }
        },
        feedback: [
          { when: 'usedR', say: 'Ese es $r$, la distancia al eje $z$. $\\rho$ es la distancia al origen y también lleva $z^2$.' },
          { when: 'noSqrt', say: 'Eso es $\\rho^2$: te faltó sacar la raíz.' }
        ],
        oracle: { lab: 'call', mod: 'coords', fn: 'rectToSph', args: function (v) { return [v.x, v.y, v.z]; }, field: 'rho' },
        hint: '$\\rho = \\sqrt{x^2 + y^2 + z^2}$.',
        solution: function (v) { return '$$\\rho = \\sqrt{(' + v.x + ')^2 + (' + v.y + ')^2 + (' + v.z + ')^2} = \\sqrt{' + (v.x * v.x + v.y * v.y + v.z * v.z) + '} \\approx ' + fx(Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)) + '$$'; }
      },
      {
        id: 'c2-s03-theta', title: 'Rectangulares a esféricas: θ con su cuadrante',
        vars: { x: [-5, -1, 1], y: [-5, 5, 1], z: [-4, 4, 1] },
        baseWhere: function (v) { return v.y !== 0; },
        prompt: function (v) { return '<p>Para el punto $(x, y, z) = (' + v.x + ', ' + v.y + ', ' + v.z + ')$, calcula su coordenada $\\theta$ en radianes, con $0 \\le \\theta < 2\\pi$.</p>'; },
        check: 'numeric',
        answer: function (v) { return norm(Math.atan2(v.y, v.x)); },
        mistakes: {
          rawArctan: function (v) { return Math.atan(v.y / v.x); },
          degrees: function (v) { return norm(Math.atan2(v.y, v.x)) * DEG; }
        },
        feedback: [
          { when: 'rawArctan', say: 'Eso da $\\arctan(y/x)$ sin ver el cuadrante. Aquí $x < 0$: el punto está del lado izquierdo, así que súmale $\\pi$.' },
          { when: 'degrees', say: 'Está en grados. Pásalo a radianes multiplicando por $\\pi/180$.' }
        ],
        oracle: { lab: 'call', mod: 'coords', fn: 'rectToSph', args: function (v) { return [v.x, v.y, v.z]; }, field: 'theta' },
        hint: 'Calcula $\\arctan(y/x)$ y luego corrige: con $x < 0$, $\\theta = \\arctan(y/x) + \\pi$.',
        solution: function (v) {
          var a = Math.atan(v.y / v.x);
          return '$\\arctan\\frac{' + v.y + '}{' + v.x + '} \\approx ' + fx(a, 3) + '$, pero $x < 0$ (el punto está a la izquierda del eje $y$), así que $$\\theta = ' + fx(a, 3) + ' + \\pi \\approx ' + fx(norm(Math.atan2(v.y, v.x))) + '$$';
        }
      },
      {
        id: 'c2-s03-phi', title: 'Rectangulares a esféricas: φ desde el eje z',
        vars: { x: [-4, 4, 1], y: [-4, 4, 1], z: [-5, 5, 1] },
        baseWhere: function (v) { return v.z !== 0 && (v.x !== 0 || v.y !== 0); },
        prompt: function (v) { return '<p>Para el punto $(x, y, z) = (' + v.x + ', ' + v.y + ', ' + v.z + ')$, calcula su coordenada esférica $\\varphi$ en radianes (medida desde el eje $z$ positivo).</p>'; },
        check: 'numeric',
        answer: function (v) { return Math.acos(v.z / Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)); },
        mistakes: {
          fromPlane: function (v) { return Math.atan(v.z / Math.sqrt(v.x * v.x + v.y * v.y)); },
          degrees: function (v) { return Math.acos(v.z / Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)) * DEG; }
        },
        feedback: [
          { when: 'fromPlane', say: 'Mediste el ángulo desde el plano $xy$. $\\varphi$ se mide desde el eje $z$ positivo: es el complemento, $\\frac{\\pi}{2}$ menos lo que obtuviste.' },
          { when: 'degrees', say: 'Está en grados. Pásalo a radianes multiplicando por $\\pi/180$.' }
        ],
        oracle: { lab: 'call', mod: 'coords', fn: 'rectToSph', args: function (v) { return [v.x, v.y, v.z]; }, field: 'phi' },
        hint: 'Primero $\\rho$; luego $\\varphi = \\arccos(z/\\rho)$, que ya queda entre $0$ y $\\pi$.',
        solution: function (v) {
          var s = v.x * v.x + v.y * v.y + v.z * v.z, rho = Math.sqrt(s);
          return '$\\rho = \\sqrt{' + s + '} \\approx ' + fx(rho, 3) + '$ y $$\\varphi = \\arccos\\frac{' + v.z + '}{' + fx(rho, 3) + '} \\approx ' + fx(Math.acos(v.z / rho)) + '$$' + (v.z < 0 ? ' Es mayor que $\\frac{\\pi}{2}$ porque el punto está debajo del plano $xy$.' : '');
        }
      },
      {
        id: 'c2-s03-ecuacion', title: 'Una ecuación en cilíndricas',
        vars: { a: [1, 4, 1], b: [-3, 3, 1] },
        where: function (v) { return v.b !== 0; },
        prompt: function (v) { return '<p>Escribe la superficie $z = ' + (v.a === 1 ? '' : v.a) + '(x^2 + y^2) ' + (v.b < 0 ? '- ' : '+ ') + (Math.abs(v.b) === 1 ? '' : Math.abs(v.b)) + 'x$ en coordenadas cilíndricas: da $z$ en términos de $r$ y $\\theta$.</p>'; },
        check: 'expr', exprVars: ['r', 'theta'], domain: { r: [0.3, 3], theta: [0.1, 6.2] },
        answer: function (v) { return v.a + '*r^2 + (' + v.b + ')*r*cos(theta)'; },
        mistakes: {
          rNotSquared: function (v) { return v.a + '*r + (' + v.b + ')*r*cos(theta)'; },
          usedSin: function (v) { return v.a + '*r^2 + (' + v.b + ')*r*sin(theta)'; }
        },
        feedback: [
          { when: 'rNotSquared', say: '$x^2 + y^2$ es $r^2$, no $r$.' },
          { when: 'usedSin', say: '$x = r\\cos\\theta$; el seno va con $y$.' }
        ],
        hint: 'Reemplaza el grupo $x^2 + y^2$ por $r^2$ y la $x$ suelta por $r\\cos\\theta$.',
        solution: function (v) { return '$$z = ' + (v.a === 1 ? '' : v.a) + 'r^2 ' + (v.b < 0 ? '- ' : '+ ') + (Math.abs(v.b) === 1 ? '' : Math.abs(v.b)) + 'r\\cos\\theta$$'; }
      },
      {
        id: 'c2-s03-superficie', title: 'Identifica la superficie',
        vars: { k: [0, 4, 1], c: [2, 4, 1] },
        prompt: function (v) {
          var eq = ['r = ' + v.c, '\\theta = \\frac{\\pi}{' + v.c + '}', 'z = ' + v.c, '\\rho = ' + v.c, '\\varphi = \\frac{\\pi}{' + (v.c + 2) + '}'][v.k];
          return '<p>¿Qué superficie es $' + eq + '$? (Las coordenadas que no aparecen pueden tomar cualquier valor.)</p>';
        },
        check: 'choice',
        options: function (v) {
          var names = ['Un cilindro circular con eje $z$', 'Un semiplano vertical que sale del eje $z$', 'Un plano horizontal', 'Una esfera con centro en el origen', 'Un cono con vértice en el origen'];
          var why = [
            'Un cilindro con eje $z$ sale de fijar $r$, la distancia al eje.',
            'Un semiplano que sale del eje $z$ sale de fijar la dirección $\\theta$.',
            'Un plano horizontal sale de fijar la altura $z$.',
            'Una esfera sale de fijar $\\rho$, la distancia al origen.',
            'Un cono desde el origen sale de fijar $\\varphi$, el ángulo con el eje $z$.'
          ];
          return names.map(function (n, i) { return i === v.k ? { text: n, correct: true } : { text: n, say: why[i] + ' Aquí lo fijo es otra coordenada.' }; });
        },
        answer: function (v) { return ['Un cilindro circular con eje $z$', 'Un semiplano vertical que sale del eje $z$', 'Un plano horizontal', 'Una esfera con centro en el origen', 'Un cono con vértice en el origen'][v.k]; },
        hint: 'Pregúntate qué mide la coordenada fija: ¿distancia al eje, dirección, altura, distancia al origen o ángulo con el eje $z$?',
        solution: function (v) {
          return [
            'Todos los puntos a distancia ' + v.c + ' del eje $z$: un cilindro de radio ' + v.c + '.',
            'Todos los puntos en la dirección $\\theta = \\frac{\\pi}{' + v.c + '}$, a cualquier distancia del eje y cualquier altura: un semiplano vertical.',
            'Todos los puntos a altura ' + v.c + ': un plano horizontal.',
            'Todos los puntos a distancia ' + v.c + ' del origen: una esfera de radio ' + v.c + '.',
            'Todos los puntos que se ven a un ángulo $\\frac{\\pi}{' + (v.c + 2) + '}$ del eje $z$: un cono con vértice en el origen, abierto hacia arriba.'
          ][v.k];
        }
      }
    ],

    quiz: { tags: ['c2.S03'], count: 8 },

    errors: [
      'Usar $\\theta = \\arctan(y/x)$ sin corregir el cuadrante cuando $x < 0$.',
      'Medir $\\varphi$ desde el plano $xy$ (como la latitud) en lugar de desde el eje $z$ positivo.',
      'Confundir $r$ (distancia al eje $z$) con $\\rho$ (distancia al origen).',
      'Tener la calculadora en grados con ángulos en radianes.',
      'Llamar «plano» a $\\theta = c$: es un semiplano, la mitad que sale del eje $z$.',
      'Copiar fórmulas de un libro de física sin revisar que ahí $\\theta$ y $\\varphi$ pueden estar intercambiados.'
    ],

    teacher: {
      plan: [
        'Arranca con el explainer del punto: que vean que las cilíndricas son polares más altura y que las esféricas salen del triángulo vertical.',
        'Insiste en la convención de $\\varphi$ con la figura del corte vertical; menciona que en física se intercambian los nombres.',
        'Ejemplos 1 a 3 en el pizarrón, uno por dirección. Luego el lab con el error del cuadrante que trae cargado.',
        'Cierra con las superficies y la conversión de ecuaciones; amarra con la simetría (Gauss en Física 2).'
      ],
      check: [
        'Que corrijan el cuadrante de $\\theta$ con los signos de $x$ y $y$.',
        'Que comprueben cada conversión regresando a rectangulares.'
      ],
      note: 'Las integrales en estos sistemas (con el factor $r$ y $\\rho^2\\sin\\varphi$) llegan en las sesiones 13 y 15.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §2.7 “Cylindrical and Spherical Coordinates”. <a href="https://openstax.org/books/calculus-volume-3/pages/2-7-cylindrical-and-spherical-coordinates">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 2</em>, §7.3 “Polar Coordinates”. <a href="https://openstax.org/books/calculus-volume-2/pages/7-3-polar-coordinates">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-02',
    next: 'sesion-04'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) {
      if (!ex.baseWhere && ex.where) ex.baseWhere = ex.where;
      ex.where = distinct(ex);
    }
  });
})();
