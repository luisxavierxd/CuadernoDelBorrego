/* =====================================================================
   Cálculo 2 · S08 · Gradiente (bloque B · Gradiente y optimización).
   Fuente: OpenStax, Calculus Volume 3, §4.6 (el gradiente) y §4.4 (plano
   tangente), CC BY-NC-SA 4.0.
   Las cuentas se hacen aquí a mano y scripts/examples.test.js las compara
   contra LabMath.grad (lab gradient-field), que deriva con math.js.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function sg(v, d) { return fx(v, d).replace('-', '−'); }
  function co(k) { return k === 1 ? '' : String(k); }
  function par(v) { return v < 0 ? '(' + v + ')' : String(v); }
  function vec(c) { return '\\langle ' + c.join(', ') + '\\rangle'; }
  var DEG = 180 / Math.PI;
  function deg(y, x) { var d = Math.atan2(y, x) * DEG; return d < 0 ? d + 360 : d; }

  // La respuesta y cada error típico deben quedar separados (más que la holgura del calificador).
  function apart(ex) {
    return function (v0) {
      var v = Object.assign({}, v0, ex.derive ? ex.derive(v0) : {});
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) if (Math.abs(vals[i] - vals[j]) <= 0.02 + 0.015 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]))) return false;
      }
      return true;
    };
  }

  // Ejemplo 1: el cerro f = 4 − x² − 2y² en (1, 1).
  var e1 = { fx: -2, fy: -4 };
  e1.mag = Math.hypot(e1.fx, e1.fy); e1.deg = deg(e1.fy, e1.fx);
  // Ejemplo 3: placa T = 50 − x² − 3y² en (2, 1).
  var e3 = { fx: -4, fy: -6 };
  e3.mag = Math.hypot(e3.fx, e3.fy); e3.down = deg(-e3.fy, -e3.fx);

  var data = window.SESSION_DATA = {
    slug: 'sesion-08', number: '08', group: 'B · Gradiente y optimización',
    title: 'Gradiente: dirección de máximo crecimiento y normal a curvas y superficies de nivel', temario: [],
    minutes: 180,
    quote: 'El gradiente es una flecha que vive en el piso: apunta hacia donde el cerro sube más rápido, mide qué tan empinado está y siempre cruza las curvas de nivel en ángulo recto.',
    badges: [
      'Calcular $\\nabla f = \\langle f_x, f_y\\rangle$ (y $\\langle F_x, F_y, F_z\\rangle$ en 3D) en un punto.',
      'Leer en $\\nabla f$ la dirección de máximo crecimiento, la máxima razón de cambio $|\\nabla f|$ y la de máximo decrecimiento $-\\nabla f$.',
      'Usar que $\\nabla f$ es perpendicular a las curvas de nivel para escribir su recta tangente y su recta normal.',
      'Escribir el plano tangente a una superficie de nivel $F(x, y, z) = c$ con la normal $\\nabla F$.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Junta las dos parciales en un vector, $\\nabla f = \\langle f_x, f_y\\rangle$. Esa flecha apunta hacia donde $f$ sube más rápido, su largo es esa rapidez, y es perpendicular a las curvas de nivel.',
        recall: [
          'La derivada direccional $D_{\\mathbf u} f = f_x\\,u_1 + f_y\\,u_2$ con $\\mathbf u$ unitario (<a href="../sesion-07/">S07</a>).',
          'Las curvas de nivel $f(x, y) = c$ de un mapa de contorno (<a href="../sesion-01/">S01</a>).',
          'El producto punto: $\\vec a\\cdot\\vec b = |\\vec a||\\vec b|\\cos\\alpha$, y vale cero si los vectores son perpendiculares.',
          'El plano tangente a $z = f(x, y)$ y su normal $\\langle f_x, f_y, -1\\rangle$ (<a href="../sesion-05/">S05</a>).'
        ],
        why: 'Un esquiador que quiere bajar lo más rápido posible, el agua que escurre por un cerro, el calor que fluye de lo caliente a lo frío y el campo eléctrico que empuja a una carga siguen la misma regla: la dirección de $-\\nabla$. El gradiente también es la herramienta de la optimización (S09 y S10) y del entrenamiento de redes neuronales («descenso por gradiente»).'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Estás parado en la ladera de un cerro con los ojos vendados. Tanteas con el pie en todas direcciones: hacia un lado el suelo sube mucho, hacia otro baja, y hay una dirección en la que no sube ni baja. El gradiente es la flecha que señala hacia donde más sube; su largo dice qué tan empinado está en esa dirección.',
          'Ahora mira el mapa topográfico del mismo cerro. Las curvas de nivel unen puntos de la misma altura: caminar por una de ellas es caminar sin subir ni bajar. Si quieres subir lo más rápido, te conviene cruzar las curvas de frente, en ángulo recto, no de lado. Por eso el gradiente es perpendicular a las curvas de nivel.',
          'Cuando llueve, cada gota baja por la ladera por el camino más empinado: sigue $-\\nabla f$. El esquiador que quiere velocidad hace lo mismo. Y donde las curvas del mapa están amontonadas, la pendiente es fuerte y el gradiente es largo; donde están separadas, el terreno es casi plano.'
        ]
      },
      {
        type: 'concept', heading: 'El vector gradiente', short: 'El gradiente',
        body: [
          'El <strong>gradiente</strong> de $f(x, y)$ es el vector de sus parciales: $$\\nabla f(x, y) = \\langle f_x(x, y),\\ f_y(x, y)\\rangle.$$ Se lee «nabla $f$» o «gradiente de $f$». Es un vector del <em>plano</em> $xy$ (el piso del mapa), no un vector en 3D: dice hacia dónde moverte, no a qué altura.',
          'Con tres variables, $f(x, y, z)$, tiene tres componentes: $\\nabla f = \\langle f_x, f_y, f_z\\rangle$. Por ejemplo, $f = xyz$ tiene $\\nabla f = \\langle yz, xz, xy\\rangle$.',
          'En S07 ya lo usaste como atajo: $D_{\\mathbf u} f = \\nabla f\\cdot\\mathbf u$. Como $|\\mathbf u| = 1$, el producto punto da $$D_{\\mathbf u} f = |\\nabla f|\\cos\\alpha,$$ con $\\alpha$ el ángulo entre $\\mathbf u$ y $\\nabla f$. De esta fórmula sale todo lo demás.'
        ]
      },
      {
        type: 'explainer', heading: 'Lo que dice |∇f| cos α', short: 'Máximo, mínimo y cero',
        title: 'Gira u alrededor de P',
        intro: 'La razón de cambio en la dirección $\\mathbf u$ es la sombra de $\\nabla f$ sobre $\\mathbf u$. Gira $\\mathbf u$ y mira cómo cambia.',
        diagram: 'c2s08-rate',
        steps: [
          { text: '$\\alpha = 0$: $\\mathbf u$ apunta como $\\nabla f$. La sombra es todo el vector: $D_{\\mathbf u} f = |\\nabla f|$, el <strong>máximo</strong>. Es la dirección de máximo crecimiento.', state: { a: 0 } },
          { text: '$\\alpha = 60°$: la sombra mide la mitad, $|\\nabla f|\\cos 60° = \\tfrac{1}{2}|\\nabla f|$. Subes, pero más despacio.', state: { a: 60 } },
          { text: '$\\alpha = 90°$: $\\mathbf u$ es perpendicular a $\\nabla f$ y la sombra es cero. En esa dirección $f$ no cambia: vas por la curva de nivel.', state: { a: 90 } },
          { text: '$\\alpha = 180°$: $\\mathbf u$ apunta como $-\\nabla f$. La sombra queda al revés: $D_{\\mathbf u} f = -|\\nabla f|$, el <strong>mínimo</strong>. Es la bajada más rápida.', state: { a: 180 } },
          { text: '$\\alpha = 270°$: otra vez perpendicular, otra vez cero. Hay dos direcciones sin cambio, opuestas entre sí.', state: { a: 270 } }
        ]
      },
      {
        type: 'concept', heading: 'Tres propiedades del gradiente', short: 'Propiedades',
        body: [
          'Si $\\nabla f(P) \\neq \\vec 0$, en el punto $P$:'
        ],
        list: [
          '<strong>Máximo crecimiento.</strong> $f$ crece más rápido en la dirección de $\\nabla f$, con $\\mathbf u = \\dfrac{\\nabla f}{|\\nabla f|}$. La <strong>máxima razón de cambio</strong> es $|\\nabla f| = \\sqrt{f_x^2 + f_y^2}$.',
          '<strong>Máximo decrecimiento.</strong> $f$ baja más rápido en la dirección de $-\\nabla f$, con razón de cambio $-|\\nabla f|$.',
          '<strong>Sin cambio.</strong> En las dos direcciones perpendiculares a $\\nabla f$, $D_{\\mathbf u} f = 0$: son las tangentes a la curva de nivel.',
          'Si $\\nabla f(P) = \\vec 0$, todas las derivadas direccionales valen cero: $P$ es un <strong>punto crítico</strong> (cima, fondo o silla). Ahí no hay dirección de máximo crecimiento; los usarás en S09.'
        ]
      },
      {
        type: 'explainer', heading: 'El gradiente cruza las curvas de nivel en ángulo recto', short: '∇f ⟂ curvas de nivel',
        title: 'El cerro visto desde arriba',
        intro: 'El cerro $f(x, y) = 4 - x^2 - 2y^2$ en su mapa de contorno. Sigue lo que pasa en $P = (1, 1)$, que está sobre la curva $f = 1$.',
        diagram: 'c2s08-hill',
        steps: [
          { text: 'Las curvas de nivel son elipses $x^2 + 2y^2 = 4 - c$; la cima ($f = 4$) está en el origen. $P = (1, 1)$ está en la curva $f = 1$, la gruesa.', state: { t: 0, g: 0, w: 0, f: 0 } },
          { text: 'Caminar por la curva no cambia $f$: su recta tangente en $P$ es la dirección donde $D_{\\mathbf u} f = 0$.', state: { t: 1, g: 0, w: 0, f: 0 } },
          { text: '$\\nabla f = \\langle -2x, -4y\\rangle$, así que $\\nabla f(1, 1) = \\langle -2, -4\\rangle$. Es perpendicular a la tangente y apunta hacia la cima: cuesta arriba.', state: { t: 1, g: 1, w: 0, f: 0 } },
          { text: 'El agua sigue $-\\nabla f = \\langle 2, 4\\rangle$ en cada punto. Su camino es la parábola $y = x^2$, que corta todas las elipses en ángulo recto.', state: { t: 1, g: 1, w: 1, f: 0 } },
          { text: 'El <strong>campo de gradientes</strong>: una flecha $\\nabla f$ en cada punto de una malla. Todas cruzan las curvas en ángulo recto, apuntan hacia arriba y son más largas donde el cerro está más empinado.', state: { t: 1, g: 1, w: 1, f: 1 } }
        ]
      },
      {
        type: 'concept', heading: '¿Por qué es perpendicular?', short: 'Por qué es perpendicular',
        body: [
          'Recorre la curva de nivel $f(x, y) = c$ con una parametrización $\\vec r(t) = \\langle x(t), y(t)\\rangle$. Sobre la curva $f$ vale siempre $c$, así que $f(x(t), y(t)) = c$ para toda $t$.',
          'Deriva los dos lados con la regla de la cadena (<a href="../sesion-06/">S06</a>): $$f_x\\,x\'(t) + f_y\\,y\'(t) = 0 \\quad\\Longrightarrow\\quad \\nabla f\\cdot\\vec r\\,\'(t) = 0.$$ El vector $\\vec r\\,\'(t)$ es tangente a la curva y su producto punto con $\\nabla f$ es cero: son perpendiculares.',
          'Dicho con palabras: a lo largo de la curva $f$ no cambia, así que la razón de cambio en la dirección tangente es cero; y la única forma de que $|\\nabla f|\\cos\\alpha = 0$ con $\\nabla f \\neq \\vec 0$ es $\\alpha = 90°$.'
        ]
      },
      {
        type: 'concept', heading: 'Recta tangente y recta normal a una curva de nivel', short: 'Recta tangente y normal',
        body: [
          'Como $\\nabla f(a, b)$ es perpendicular a la curva de nivel que pasa por $(a, b)$, sirve de vector normal de su <strong>recta tangente</strong>: $$f_x(a, b)\\,(x - a) + f_y(a, b)\\,(y - b) = 0.$$ Despejando, su pendiente es $m = -\\dfrac{f_x}{f_y}$ (la misma que da la derivación implícita de Cálculo 1).',
          'La <strong>recta normal</strong> pasa por $(a, b)$ en la dirección de $\\nabla f$: su pendiente es $\\dfrac{f_y}{f_x}$, la recíproca negativa de la tangente.',
          'Ojo con no confundirlas: el gradiente es la <em>normal</em> de la curva, no su dirección. La tangente va en la dirección $\\langle -f_y, f_x\\rangle$ (el gradiente girado 90°).'
        ]
      },
      {
        type: 'concept', heading: 'Superficies de nivel y su plano tangente', short: 'Superficies de nivel',
        body: [
          'Con tres variables, $F(x, y, z) = c$ es una <strong>superficie de nivel</strong>: una esfera, un elipsoide, un paraboloide… El mismo argumento de la regla de la cadena, con cualquier curva sobre la superficie, dice que $\\nabla F$ es perpendicular a la superficie.',
          'Entonces $\\nabla F(a, b, c)$ es el vector normal del <strong>plano tangente</strong> en $(a, b, c)$: $$F_x\\,(x - a) + F_y\\,(y - b) + F_z\\,(z - c) = 0.$$ No hace falta despejar $z$: sirve para esferas y superficies que no son gráficas de una función.',
          'Esto generaliza a <a href="../sesion-05/">S05</a>: la gráfica $z = f(x, y)$ es la superficie de nivel $F = f(x, y) - z = 0$, con $\\nabla F = \\langle f_x, f_y, -1\\rangle$. ¡Es la misma normal de S05!'
        ],
        diagram: 'c2s08-sphere',
        caption: 'En la esfera $x^2 + y^2 + z^2 = 14$, el gradiente $\\nabla F = \\langle 2x, 2y, 2z\\rangle$ en $P = (1, 2, 3)$ es $\\langle 2, 4, 6\\rangle$: sale de la esfera en línea recta desde el centro, perpendicular al plano tangente.'
      },
      {
        type: 'concept', heading: 'Campos de gradientes', short: 'Campos de gradientes',
        body: [
          'Si dibujas $\\nabla f$ en muchos puntos tienes un <strong>campo de gradientes</strong>: un mapa de flechas. Encimado sobre el mapa de contorno se ve todo junto: las flechas cruzan las curvas en ángulo recto, apuntan hacia los niveles más altos y crecen donde las curvas se amontonan.',
          'Las curvas que siguen las flechas (las de máximo ascenso) y las que van en contra (el agua, el esquiador) son perpendiculares a todas las curvas de nivel. En el lab puedes trazarlas desde cualquier punto.'
        ]
      },
      {
        type: 'callout', heading: 'En Física 2: el campo eléctrico es E = −∇V',
        body: [
          'El potencial eléctrico $V(x, y, z)$ es una función escalar, y sus superficies de nivel son las <strong>equipotenciales</strong>. El campo eléctrico es $\\vec E = -\\nabla V$: apunta hacia donde el potencial baja más rápido (como el agua en el cerro) y es perpendicular a las equipotenciales. Lo ves con cargas y distribuciones en <a href="../../../fisica-2/sesiones/sesion-06/">Física 2 · S06</a>.',
          'En el lab, el ejemplo «Potencial de dos cargas» muestra justo eso: el recorrido del agua desde $P$ es una línea de campo eléctrico.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: preguntas con el gradiente', short: 'Receta',
        steps: [
          { text: 'Calcula las parciales y evalúalas en el punto: $\\nabla f(P) = \\langle f_x(P), f_y(P)\\rangle$ (o con $f_z$ en 3D).', tip: 'El orden importa: primero $f_x$, luego $f_y$. Si las intercambias, la flecha apunta a otro lado.' },
          { text: 'Máxima razón de cambio: $|\\nabla f(P)| = \\sqrt{f_x^2 + f_y^2}$. La mínima es $-|\\nabla f(P)|$.', tip: 'No olvides la raíz: $f_x^2 + f_y^2$ es el cuadrado de la rapidez, no la rapidez.' },
          { text: 'Dirección de máximo crecimiento: $\\nabla f$ (o el unitario $\\nabla f/|\\nabla f|$). Su ángulo cumple $\\tan\\theta = f_y/f_x$; elige el cuadrante según los signos.', tip: 'Si $f_x < 0$, $\\arctan(f_y/f_x)$ te da la dirección opuesta: súmale $180°$. El agua y el esquiador van en $-\\nabla f$.' },
          { text: 'Recta tangente a la curva de nivel por $(a, b)$: $f_x(x - a) + f_y(y - b) = 0$, pendiente $-f_x/f_y$. La normal va en la dirección de $\\nabla f$.' },
          { text: 'Plano tangente a $F(x, y, z) = c$ en $(a, b, c)$: $F_x(x - a) + F_y(y - b) + F_z(z - c) = 0$.', tip: 'Comprueba que el punto esté en la superficie: sustituye y debe darte $c$.' }
        ]
      },
      {
        type: 'example', heading: 'Gradiente, rapidez y dirección en el cerro',
        problem: '<p>En el cerro $f(x, y) = 4 - x^2 - 2y^2$, estás en $P = (1, 1)$. ¿Hacia dónde sube más rápido, con qué razón de cambio y qué ángulo forma esa dirección con el eje $x$ positivo?</p>',
        steps: [
          { text: 'Parciales y gradiente en $P$.', math: 'f_x = -2x = -2, \\quad f_y = -4y = -4 \\quad\\Rightarrow\\quad \\nabla f(1, 1) = \\langle -2, -4\\rangle' },
          { text: 'Máxima razón de cambio.', math: '|\\nabla f| = \\sqrt{(-2)^2 + (-4)^2} = \\sqrt{20} = 2\\sqrt 5 \\approx ' + fx(e1.mag) },
          { text: 'Dirección: el unitario.', math: '\\mathbf u = \\frac{\\langle -2, -4\\rangle}{2\\sqrt 5} = \\left\\langle -\\tfrac{1}{\\sqrt 5}, -\\tfrac{2}{\\sqrt 5}\\right\\rangle' },
          { text: 'Ángulo: $\\arctan\\frac{-4}{-2} = \\arctan 2 \\approx 63.43°$, pero las dos componentes son negativas (tercer cuadrante): suma $180°$.', math: '\\theta \\approx 63.43° + 180° = ' + fx(e1.deg) + '°' }
        ],
        answer: 'Sube más rápido en la dirección $\\langle -2, -4\\rangle$ (hacia la cima, en el origen), a razón de $2\\sqrt 5 \\approx ' + fx(e1.mag) + '$ por unidad de distancia, con $\\theta \\approx ' + fx(e1.deg) + '°$.',
        verify: { lab: 'call', mod: 'grad', fn: 'gradient', math: true, args: ['4 - x^2 - 2y^2', 1, 1], values: { fx: e1.fx, fy: e1.fy, mag: e1.mag, deg: e1.deg } }
      },
      {
        type: 'example', heading: 'Recta tangente y normal a una curva de nivel',
        problem: '<p>Encuentra la recta tangente y la recta normal a la elipse $x^2 + 2y^2 = 3$ en el punto $(1, 1)$.</p>',
        steps: [
          { text: 'La elipse es la curva de nivel $f = 3$ de $f(x, y) = x^2 + 2y^2$. Gradiente en $(1, 1)$.', math: '\\nabla f = \\langle 2x, 4y\\rangle = \\langle 2, 4\\rangle' },
          { text: 'Recta tangente: $\\nabla f$ es su normal.', math: '2(x - 1) + 4(y - 1) = 0 \\quad\\Rightarrow\\quad y = -\\tfrac{1}{2}x + \\tfrac{3}{2}' },
          { text: 'Recta normal: pasa por $(1, 1)$ en la dirección $\\langle 2, 4\\rangle$, pendiente $\\frac{4}{2} = 2$.', math: 'y - 1 = 2(x - 1) \\quad\\Rightarrow\\quad y = 2x - 1' },
          { text: 'Comprueba: las pendientes $-\\tfrac{1}{2}$ y $2$ multiplican $-1$, son perpendiculares.' }
        ],
        answer: 'Tangente: $y = -\\tfrac{1}{2}x + \\tfrac{3}{2}$. Normal: $y = 2x - 1$.',
        verify: { lab: 'call', mod: 'grad', fn: 'levelLine', math: true, args: ['x^2 + 2y^2', 1, 1], values: { slope: -0.5, intercept: 1.5, normalSlope: 2, normalIntercept: -1, c: 3 } }
      },
      {
        type: 'example', heading: 'La hormiga en la placa caliente',
        problem: '<p>La temperatura de una placa es $T(x, y) = 50 - x^2 - 3y^2$ (°C, con $x$, $y$ en cm). Una hormiga en $(2, 1)$ quiere enfriarse lo más rápido posible. ¿Hacia dónde camina y qué tan rápido baja la temperatura?</p>',
        steps: [
          { text: 'Gradiente en $(2, 1)$.', math: '\\nabla T = \\langle -2x, -6y\\rangle = \\langle -4, -6\\rangle' },
          { text: 'Para enfriarse, la dirección de máximo decrecimiento: $-\\nabla T$.', math: '-\\nabla T = \\langle 4, 6\\rangle, \\quad \\theta = \\arctan\\tfrac{6}{4} \\approx ' + fx(e3.down) + '°' },
          { text: 'Rapidez: la temperatura baja $|\\nabla T|$ grados por centímetro.', math: '|\\nabla T| = \\sqrt{16 + 36} = \\sqrt{52} \\approx ' + fx(e3.mag) + '\\ °\\text{C/cm}' }
        ],
        answer: 'Camina en la dirección $\\langle 4, 6\\rangle$ (unos $' + fx(e3.down) + '°$ desde el eje $x$), donde $T$ baja a razón de $\\sqrt{52} \\approx ' + fx(e3.mag) + '$ °C/cm.',
        verify: { lab: 'call', mod: 'grad', fn: 'gradient', math: true, args: ['50 - x^2 - 3y^2', 2, 1], values: { fx: e3.fx, fy: e3.fy, mag: e3.mag, descentDeg: e3.down, minRate: -e3.mag } }
      },
      {
        type: 'example', heading: 'Plano tangente a una esfera',
        problem: '<p>Encuentra el plano tangente a la esfera $x^2 + y^2 + z^2 = 14$ en $(1, 2, 3)$.</p>',
        steps: [
          { text: 'Comprueba el punto: $1 + 4 + 9 = 14$. Sí está en la esfera, la superficie de nivel $F = 14$ de $F = x^2 + y^2 + z^2$.' },
          { text: 'Gradiente en el punto.', math: '\\nabla F = \\langle 2x, 2y, 2z\\rangle = \\langle 2, 4, 6\\rangle' },
          { text: 'Plano con esa normal.', math: '2(x - 1) + 4(y - 2) + 6(z - 3) = 0 \\quad\\Rightarrow\\quad 2x + 4y + 6z = 28' },
          { text: 'Divide entre 2.', math: 'x + 2y + 3z = 14' }
        ],
        answer: 'El plano tangente es $x + 2y + 3z = 14$. Su normal $\\langle 1, 2, 3\\rangle$ apunta del centro de la esfera hacia el punto, como el radio.',
        verify: { lab: 'call', mod: 'grad', fn: 'levelPlane', math: true, args: ['x^2 + y^2 + z^2', 1, 2, 3], values: { 'n.0': 2, 'n.1': 4, 'n.2': 6, d: 28, k: 14 } }
      },
      {
        type: 'example', heading: 'Gradiente con tres variables',
        problem: '<p>Para $f(x, y, z) = xyz$, ¿cuál es la máxima razón de cambio en $(1, 2, 3)$ y en qué dirección?</p>',
        steps: [
          { text: 'Gradiente: cada parcial deja las otras dos letras.', math: '\\nabla f = \\langle yz, xz, xy\\rangle = \\langle 6, 3, 2\\rangle' },
          { text: 'Magnitud.', math: '|\\nabla f| = \\sqrt{36 + 9 + 4} = \\sqrt{49} = 7' },
          { text: 'Dirección unitaria.', math: '\\mathbf u = \\left\\langle \\tfrac{6}{7}, \\tfrac{3}{7}, \\tfrac{2}{7}\\right\\rangle' }
        ],
        answer: 'La máxima razón de cambio es $7$, en la dirección $\\langle \\tfrac{6}{7}, \\tfrac{3}{7}, \\tfrac{2}{7}\\rangle$.',
        verify: { lab: 'call', mod: 'grad', fn: 'gradient3', math: true, args: ['x*y*z', 1, 2, 3], values: { Fx: 6, Fy: 3, Fz: 2, mag: 7 } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿El gradiente apunta hacia arriba de la superficie, en 3D?', a: 'No. $\\nabla f = \\langle f_x, f_y\\rangle$ vive en el plano $xy$: dice hacia dónde caminar en el mapa. La normal a la gráfica $z = f(x, y)$ es otro vector, $\\langle f_x, f_y, -1\\rangle$.' },
          { q: '¿El gradiente es tangente o perpendicular a la curva de nivel?', a: 'Perpendicular. La tangente a la curva es la dirección donde $f$ no cambia; el gradiente es la dirección donde más cambia. Forman $90°$.' },
          { q: '¿La máxima razón de cambio es $f_x^2 + f_y^2$?', a: 'No: es $\\sqrt{f_x^2 + f_y^2}$, el largo del vector. Sin la raíz tienes su cuadrado.' },
          { q: '¿Por qué mi calculadora me da el ángulo al revés?', a: '$\\arctan(f_y/f_x)$ solo devuelve ángulos entre $-90°$ y $90°$. Si $f_x < 0$ la flecha apunta a la izquierda y hay que sumar $180°$. Haz un dibujo con los signos.' },
          { q: '¿Y si $\\nabla f = \\vec 0$?', a: 'Entonces $D_{\\mathbf u} f = 0$ en todas las direcciones: es un punto crítico (cima, fondo o silla). No hay dirección de máximo crecimiento. Ahí empieza la optimización de S09.' },
          { q: '¿Para el plano tangente a una esfera tengo que despejar $z$?', a: 'No. Usa $F = x^2 + y^2 + z^2$ y su gradiente como normal. Despejar $z$ (como en S05) también funciona, pero solo en una mitad de la esfera y con más cuentas.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          '$\\nabla f = \\langle f_x, f_y\\rangle$ y $D_{\\mathbf u} f = |\\nabla f|\\cos\\alpha$.',
          '$f$ crece más rápido en la dirección de $\\nabla f$, a razón de $|\\nabla f|$; baja más rápido en $-\\nabla f$ (el agua).',
          '$\\nabla f$ es perpendicular a las curvas de nivel: la tangente es $f_x(x - a) + f_y(y - b) = 0$.',
          '$\\nabla F$ es normal a la superficie $F = c$: plano tangente $F_x(x - a) + F_y(y - b) + F_z(z - c) = 0$.'
        ]
      }
    ],

    lab: {
      type: 'gradient-field', title: 'Campo de gradientes sobre contornos',
      intro: 'Elige una función (o escribe la tuya) y mueve el punto $P$: arrástralo, tócalo o usa los deslizadores. Verás su $\\nabla f$ perpendicular a la curva de nivel, la recta tangente a esa curva y, si quieres, el camino de máximo ascenso o el que sigue el agua. Luego escribe $\\nabla f(P)$, la dirección de máximo crecimiento o $|\\nabla f(P)|$: el lab te dice si intercambiaste componentes, si diste $-\\nabla f$, si diste la tangente en vez de la normal o si olvidaste la raíz.',
      cfg: { start: 0 }
    },

    formulas: [
      { label: 'Gradiente', tex: '\\nabla f = \\langle f_x, f_y\\rangle' },
      { label: 'En 3D', tex: '\\nabla F = \\langle F_x, F_y, F_z\\rangle' },
      { label: 'Derivada direccional', tex: 'D_{\\mathbf u} f = \\nabla f\\cdot\\mathbf u = |\\nabla f|\\cos\\alpha' },
      { label: 'Máxima razón de cambio', tex: '|\\nabla f| = \\sqrt{f_x^2 + f_y^2}' },
      { label: 'Dirección de máximo crecimiento', tex: '\\mathbf u = \\frac{\\nabla f}{|\\nabla f|}' },
      { label: 'Tangente a f = c', tex: 'f_x(x - a) + f_y(y - b) = 0' },
      { label: 'Plano tangente a F = c', tex: 'F_x(x - a) + F_y(y - b) + F_z(z - c) = 0' }
    ],

    exercises: [
      {
        id: 'c2-s08-comp', title: 'Una componente del gradiente',
        vars: { A: [1, 4, 1], B: [1, 3, 1], a: [-3, 3, 1], b: [-2, 2, 1] },
        baseWhere: function (v) { return v.a !== 0 && v.b !== 0; },
        prompt: function (v) { return '<p>Para $f(x, y) = ' + co(v.A) + 'x^2y + ' + co(v.B) + 'y^3$, ¿cuánto vale la segunda componente de $\\nabla f(' + v.a + ', ' + v.b + ')$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.A * v.a * v.a + 3 * v.B * v.b * v.b; },
        mistakes: {
          swap: function (v) { return 2 * v.A * v.a * v.b; },
          noThree: function (v) { return v.A * v.a * v.a + v.B * v.b * v.b; }
        },
        feedback: [
          { when: 'swap', say: 'Esa es la primera componente, $f_x = 2Axy$. La segunda es $f_y$: deriva respecto a $y$.' },
          { when: 'noThree', say: 'Al derivar $y^3$ baja el 3: $\\frac{\\partial}{\\partial y}(By^3) = 3By^2$.' }
        ],
        oracle: { lab: 'call', mod: 'grad', fn: 'gradient', math: true, field: 'fy', args: function (v) { return [v.A + '*x^2*y + ' + v.B + '*y^3', v.a, v.b]; } },
        hint: '$\\nabla f = \\langle f_x, f_y\\rangle$; la segunda componente es $f_y$, derivando con $x$ fija.',
        solution: function (v) { return '$f_y = ' + co(v.A) + 'x^2 + ' + (3 * v.B) + 'y^2$. En el punto: $' + v.A + '(' + par(v.a) + ')^2 + ' + (3 * v.B) + '(' + par(v.b) + ')^2 = ' + (v.A * v.a * v.a + 3 * v.B * v.b * v.b) + '$.'; }
      },
      {
        id: 'c2-s08-max', title: 'Máxima razón de cambio',
        vars: { A: [1, 3, 1], B: [1, 3, 1], a: [-3, 3, 1], b: [-3, 3, 1] },
        baseWhere: function (v) { return v.a !== 0 && v.b !== 0; },
        prompt: function (v) { return '<p>¿Cuál es la máxima razón de cambio de $f(x, y) = ' + co(v.A) + 'x^2 + ' + co(v.B) + 'y^2$ en el punto $(' + v.a + ', ' + v.b + ')$?</p>'; },
        check: 'numeric',
        answer: function (v) { return Math.hypot(2 * v.A * v.a, 2 * v.B * v.b); },
        mistakes: {
          noRoot: function (v) { return Math.pow(2 * v.A * v.a, 2) + Math.pow(2 * v.B * v.b, 2); },
          sumAbs: function (v) { return Math.abs(2 * v.A * v.a) + Math.abs(2 * v.B * v.b); }
        },
        feedback: [
          { when: 'noRoot', say: 'Te faltó la raíz: la máxima razón de cambio es $|\\nabla f| = \\sqrt{f_x^2 + f_y^2}$.' },
          { when: 'sumAbs', say: 'La magnitud de un vector no es la suma de sus componentes: usa Pitágoras, $\\sqrt{f_x^2 + f_y^2}$.' }
        ],
        oracle: { lab: 'call', mod: 'grad', fn: 'gradient', math: true, field: 'mag', args: function (v) { return [v.A + '*x^2 + ' + v.B + '*y^2', v.a, v.b]; } },
        hint: 'Calcula $\\nabla f = \\langle 2Ax, 2By\\rangle$ en el punto y luego su magnitud.',
        solution: function (v) {
          var p = 2 * v.A * v.a, q = 2 * v.B * v.b;
          return '$\\nabla f = ' + vec([p, q]) + '$, así que $|\\nabla f| = \\sqrt{' + (p * p) + ' + ' + (q * q) + '} = \\sqrt{' + (p * p + q * q) + '} \\approx ' + fx(Math.hypot(p, q)) + '$.';
        }
      },
      {
        id: 'c2-s08-angulo', title: 'Dirección de máximo crecimiento',
        vars: { A: [1, 3, 1], B: [-3, 3, 1], a: [-3, 3, 1], b: [-2, 2, 1] },
        baseWhere: function (v) { return v.a !== 0 && v.b !== 0 && v.B !== 0; },
        prompt: function (v) { return '<p>Sea $f(x, y) = ' + co(v.A) + 'x^2 ' + (v.B < 0 ? '- ' + co(-v.B) : '+ ' + co(v.B)) + 'xy$. ¿Qué ángulo forma con el eje $x$ positivo la dirección en la que $f$ crece más rápido desde $(' + v.a + ', ' + v.b + ')$? Da el ángulo en grados, entre $0°$ y $360°$.</p>'; },
        check: 'numeric', unit: '°',
        answer: function (v) { return deg(v.B * v.a, 2 * v.A * v.a + v.B * v.b); },
        mistakes: {
          quadrant: function (v) { var p = 2 * v.A * v.a + v.B * v.b; return Math.atan((v.B * v.a) / p) * DEG; },
          neg: function (v) { return (deg(v.B * v.a, 2 * v.A * v.a + v.B * v.b) + 180) % 360; }
        },
        feedback: [
          { when: 'quadrant', say: '$\\arctan(f_y/f_x)$ solo da ángulos entre $-90°$ y $90°$. Mira los signos de $f_x$ y $f_y$: si $f_x < 0$ suma $180°$; si queda negativo, suma $360°$.' },
          { when: 'neg', say: 'Esa es la dirección de máximo decrecimiento, $-\\nabla f$. Se pide la de $\\nabla f$.' }
        ],
        oracle: { lab: 'call', mod: 'grad', fn: 'gradient', math: true, field: 'deg', args: function (v) { return [v.A + '*x^2 + ' + v.B + '*x*y', v.a, v.b]; } },
        hint: 'Calcula $\\nabla f = \\langle 2Ax + By,\\ Bx\\rangle$ en el punto, dibújalo y luego busca su ángulo con $\\tan\\theta = f_y/f_x$, cuidando el cuadrante.',
        solution: function (v) {
          var p = 2 * v.A * v.a + v.B * v.b, q = v.B * v.a;
          return '$\\nabla f = ' + vec([p, q]) + '$. Con $\\tan\\theta = \\frac{' + q + '}{' + p + '}$ y los signos de las componentes, $\\theta \\approx ' + fx(deg(q, p)) + '°$.';
        }
      },
      {
        id: 'c2-s08-tangente', title: 'Pendiente de la recta tangente a una curva de nivel',
        vars: { A: [-2, 3, 1], B: [1, 3, 1], a: [-2, 3, 1], b: [-2, 3, 1] },
        baseWhere: function (v) { return v.a !== 0 && v.b !== 0 && (2 * v.a + v.A * v.b) !== 0 && (v.A * v.a + 2 * v.B * v.b) !== 0; },
        derive: function (v) { return { c: v.a * v.a + v.A * v.a * v.b + v.B * v.b * v.b }; },
        prompt: function (v) {
          var mid = v.A === 0 ? '' : v.A < 0 ? ' - ' + co(-v.A) + 'xy' : ' + ' + co(v.A) + 'xy';
          return '<p>La curva $x^2' + mid + ' + ' + co(v.B) + 'y^2 = ' + v.c + '$ pasa por $(' + v.a + ', ' + v.b + ')$. ¿Cuál es la pendiente de su recta tangente en ese punto?</p>';
        },
        check: 'numeric',
        answer: function (v) { return -(2 * v.a + v.A * v.b) / (v.A * v.a + 2 * v.B * v.b); },
        mistakes: {
          normal: function (v) { return (v.A * v.a + 2 * v.B * v.b) / (2 * v.a + v.A * v.b); },
          noSign: function (v) { return (2 * v.a + v.A * v.b) / (v.A * v.a + 2 * v.B * v.b); },
          swap: function (v) { return -(v.A * v.a + 2 * v.B * v.b) / (2 * v.a + v.A * v.b); }
        },
        feedback: [
          { when: 'normal', say: 'Esa es la pendiente de la recta <em>normal</em> (la dirección de $\\nabla f$). La tangente es perpendicular: $m = -f_x/f_y$.' },
          { when: 'noSign', say: 'Te faltó el signo menos: de $f_x(x - a) + f_y(y - b) = 0$ sale $m = -f_x/f_y$.' },
          { when: 'swap', say: 'Invertiste el cociente: es $-f_x/f_y$, con $f_x$ arriba.' }
        ],
        oracle: { lab: 'call', mod: 'grad', fn: 'levelLine', math: true, field: 'slope', args: function (v) { return ['x^2 + ' + v.A + '*x*y + ' + v.B + '*y^2', v.a, v.b]; } },
        hint: 'Con $f(x, y) = $ el lado izquierdo, $\\nabla f$ es perpendicular a la curva. La tangente cumple $f_x(x - a) + f_y(y - b) = 0$.',
        solution: function (v) {
          var p = 2 * v.a + v.A * v.b, q = v.A * v.a + 2 * v.B * v.b;
          return '$f_x = 2x + ' + par(v.A) + 'y = ' + p + '$ y $f_y = ' + par(v.A) + 'x + ' + (2 * v.B) + 'y = ' + q + '$. La tangente es $' + p + '(x - ' + par(v.a) + ') + ' + par(q) + '(y - ' + par(v.b) + ') = 0$, con pendiente $m = -\\frac{' + p + '}{' + q + '} \\approx ' + fx(-p / q) + '$.';
        }
      },
      {
        id: 'c2-s08-plano', title: 'Plano tangente a una superficie de nivel',
        vars: { A: [1, 4, 1], B: [1, 4, 1], a: [-2, 3, 1], b: [-2, 2, 1], c: [-2, 2, 1] },
        baseWhere: function (v) { return v.a !== 0 && v.b !== 0 && v.c !== 0; },
        derive: function (v) { return { k: v.a * v.a + v.A * v.b * v.b + v.B * v.c * v.c }; },
        prompt: function (v) {
          return '<p>El punto $(' + v.a + ', ' + v.b + ', ' + v.c + ')$ está en el elipsoide $x^2 + ' + co(v.A) + 'y^2 + ' + co(v.B) + 'z^2 = ' + v.k + '$. Si escribes su plano tangente como $F_x\\,x + F_y\\,y + F_z\\,z = D$, con $\\langle F_x, F_y, F_z\\rangle = \\nabla F$ en ese punto, ¿cuánto vale $D$?</p>';
        },
        check: 'numeric',
        answer: function (v) { return 2 * v.k; },
        mistakes: { level: function (v) { return v.k; } },
        feedback: [{ when: 'level', say: 'Ese es el nivel $c$ de la superficie. Con la normal sin simplificar, $D = F_x a + F_y b + F_z c$: calcúlalo con las componentes de $\\nabla F$.' }],
        oracle: { lab: 'call', mod: 'grad', fn: 'levelPlane', math: true, field: 'd', args: function (v) { return ['x^2 + ' + v.A + '*y^2 + ' + v.B + '*z^2', v.a, v.b, v.c]; } },
        hint: '$\\nabla F = \\langle 2x, 2Ay, 2Bz\\rangle$. El plano es $F_x(x - a) + F_y(y - b) + F_z(z - c) = 0$; pasa las constantes a la derecha.',
        solution: function (v) {
          var n = [2 * v.a, 2 * v.A * v.b, 2 * v.B * v.c];
          return '$\\nabla F = ' + vec(n) + '$. Entonces $D = ' + n[0] + '(' + v.a + ') + ' + par(n[1]) + '(' + v.b + ') + ' + par(n[2]) + '(' + v.c + ') = ' + (2 * v.k) + '$.';
        }
      },
      {
        id: 'c2-s08-agua', title: 'Por dónde baja el agua',
        vars: { A: [1, 3, 1], a: [-2, 2, 1], b: [-2, 2, 1] },
        where: function (v) { return v.a !== 0 && v.b !== 0 && Math.abs(v.a) !== Math.abs(v.A * v.b); },
        prompt: function (v) { return '<p>Un cerro tiene altura $h(x, y) = 9 - x^2 - ' + co(v.A) + 'y^2$. Cae una gota en el punto $(' + v.a + ', ' + v.b + ')$. ¿En qué dirección empieza a escurrir?</p>'; },
        check: 'choice',
        options: function (v) {
          var p = 2 * v.a, q = 2 * v.A * v.b;
          return [
            { text: '$' + vec([p, q]) + '$', correct: true },
            { text: '$' + vec([-p, -q]) + '$', say: 'Ese es $\\nabla h$: la dirección de subida más rápida. El agua baja: sigue $-\\nabla h$.' },
            { text: '$' + vec([-q, p]) + '$', say: 'Esa dirección es tangente a la curva de nivel: por ahí la altura no cambia y el agua no tiene por qué ir.' },
            { text: '$' + vec([q, p]) + '$', say: 'Intercambiaste las componentes: la primera sale de $h_x$ y la segunda de $h_y$.' }
          ];
        },
        answer: function (v) { return '$' + vec([2 * v.a, 2 * v.A * v.b]) + '$'; },
        hint: 'El agua sigue la bajada más rápida: $-\\nabla h$.',
        solution: function (v) { return '$\\nabla h = \\langle -2x, -' + (2 * v.A) + 'y\\rangle = ' + vec([-2 * v.a, -2 * v.A * v.b]) + '$, así que el agua va en $-\\nabla h = ' + vec([2 * v.a, 2 * v.A * v.b]) + '$.'; }
      },
      {
        id: 'c2-s08-cero', title: 'Concepto: sin cambio',
        vars: {},
        prompt: function () { return '<p>En un punto $P$ con $\\nabla f(P) \\neq \\vec 0$, ¿en qué direcciones la derivada direccional vale cero?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'En las dos perpendiculares a $\\nabla f(P)$: las tangentes a la curva de nivel', correct: true },
            { text: 'En la dirección de $-\\nabla f(P)$', say: 'Ahí la razón de cambio es la mínima, $-|\\nabla f|$, no cero.' },
            { text: 'En ninguna dirección', say: 'Como $D_{\\mathbf u} f = |\\nabla f|\\cos\\alpha$, vale cero cuando $\\alpha = 90°$ o $270°$.' },
            { text: 'Solo en las direcciones de los ejes', say: 'Las de los ejes dan $f_x$ y $f_y$, que en general no son cero.' }
          ];
        },
        answer: function () { return 'En las dos perpendiculares a $\\nabla f(P)$: las tangentes a la curva de nivel'; },
        hint: 'Usa $D_{\\mathbf u} f = |\\nabla f|\\cos\\alpha$.',
        solution: function () { return '$\\cos\\alpha = 0$ cuando $\\alpha = 90°$ o $270°$: las direcciones perpendiculares a $\\nabla f$, que son tangentes a la curva de nivel (ahí $f$ no cambia).'; }
      }
    ],

    quiz: { tags: ['c2.S08'], count: 8 },

    errors: [
      'Intercambiar $f_x$ y $f_y$ al escribir $\\nabla f$.',
      'Olvidar la raíz: la máxima razón de cambio es $\\sqrt{f_x^2 + f_y^2}$, no $f_x^2 + f_y^2$.',
      'Dar $\\nabla f$ cuando se pide la bajada más rápida (el agua, el esquiador): es $-\\nabla f$.',
      'Creer que el gradiente es tangente a la curva de nivel: es perpendicular.',
      'Usar $\\arctan(f_y/f_x)$ sin corregir el cuadrante cuando $f_x < 0$.',
      'Confundir $\\nabla f$ (vector del plano $xy$) con la normal $\\langle f_x, f_y, -1\\rangle$ a la gráfica.'
    ],

    teacher: {
      plan: [
        'Arranca con un mapa topográfico real: ¿por dónde sube más rápido un excursionista? ¿por dónde baja el agua?',
        'Repasa $D_{\\mathbf u} f = |\\nabla f|\\cos\\alpha$ de S07 con el explainer y saca las tres propiedades.',
        'Explainer del cerro: la tangente, el gradiente, el agua por $y = x^2$. Luego el argumento de la regla de la cadena.',
        'Lab: que arrastren $P$ en «Dos cerros» y tracen el agua; después el reto del ángulo con $f_x < 0$.',
        'Cierra con la esfera y la conexión con S05 y con $\\vec E = -\\nabla V$ de Física 2.'
      ],
      check: [
        'Que distingan la dirección de máximo crecimiento (vector) de la máxima razón de cambio (número).',
        'Que digan por qué $\\nabla f$ es perpendicular a las curvas de nivel, no solo que lo es.'
      ],
      note: 'Los puntos críticos ($\\nabla f = \\vec 0$) se mencionan aquí y se trabajan en S09 con Lagrange.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §4.6 “Directional Derivatives and the Gradient”. <a href="https://openstax.org/books/calculus-volume-3/pages/4-6-directional-derivatives-and-the-gradient">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 3</em>, §4.4 “Tangent Planes and Linear Approximations”. <a href="https://openstax.org/books/calculus-volume-3/pages/4-4-tangent-planes-and-linear-approximations">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-07',
    next: 'sesion-09'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check !== 'numeric' || !ex.mistakes) return;
    ex.where = apart(ex);
  });
})();
