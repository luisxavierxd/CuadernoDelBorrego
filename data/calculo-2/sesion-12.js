/* =====================================================================
   Cálculo 2 · S12 · Integral doble en regiones generales: orden de
   integración, área y masa (bloque C · Integral múltiple).
   Fuente: OpenStax, Calculus Volume 3, §5.2 y §5.6 (CC BY-NC-SA 4.0).
   Las respuestas se calculan aquí con fórmulas cerradas; scripts/examples.test.js
   las compara contra LabMath.region (integral iterada numérica con límites
   variables, en el orden contrario o en la descripción original de la región).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function k1(c, s) { return c === 1 ? s : c + s; }          // 1·x → x

  // La respuesta y cada error típico deben quedar separados (más que la holgura del calificador).
  function apart(ex) {
    return function (v) {
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) if (Math.abs(vals[i] - vals[j]) <= 0.02 + 0.015 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]))) return false;
      }
      return true;
    };
  }

  var E = Math.E;
  var data = window.SESSION_DATA = {
    slug: 'sesion-12', number: '12', group: 'C · Integral múltiple',
    title: 'Integral doble en regiones generales: orden de integración, área y masa', temario: [],
    minutes: 180,
    quote: 'Una región no tiene que ser un rectángulo. Basta con saber, para cada rebanada, por qué curva entra y por cuál sale.',
    badges: [
      'Describir una región como tipo I (rebanadas verticales) o tipo II (horizontales) y leer los límites del dibujo.',
      'Cambiar el orden de integración, partiendo la región cuando haga falta.',
      'Calcular áreas con $\\iint_D 1\\,dA$.',
      'Calcular la masa y el centro de masa de una lámina con densidad $\\rho(x, y)$.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'En una región que no es rectángulo, los límites de la integral de adentro dejan de ser números: son las <strong>curvas</strong> por donde cada rebanada entra y sale de la región.',
        recall: [
          'La integral iterada y el teorema de Fubini en un rectángulo (<a href="../sesion-11/">S11</a>): se integra primero en una variable, con la otra fija, y luego en la otra.',
          'Área entre curvas: $A = \\int_a^b (f - g)\\,dx$, con $f$ arriba y $g$ abajo (<a href="../../../calculo-1/sesiones/sesion-14/">Cálculo 1, S14</a>).',
          'Despejar $x$ de una curva $y = f(x)$: de $y = x^2$ sale $x = \\sqrt y$ (con $x \\ge 0$); de $y = 2x$ sale $x = y/2$.'
        ],
        why: 'Las placas, los terrenos y las piezas que se recortan casi nunca son rectángulos. Con la integral doble en regiones generales calculas el área de un terreno irregular, la masa de una placa más gruesa en un lado que en otro, el punto donde se equilibra una pieza o la probabilidad de que dos variables caigan en una zona del plano.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en una tortilla con forma rara que quieres cortar en tiras. Si cortas tiras verticales, cada tira empieza en el borde de abajo y termina en el de arriba. Las tiras de la orilla son cortas y las del centro, largas: el largo depende de <strong>dónde</strong> cortas.',
          'Para medir toda la tortilla, sumas las tiras: primero lo que hay a lo largo de cada tira (de abajo hacia arriba) y luego juntas todas las tiras de izquierda a derecha. Eso es una integral iterada con límites que cambian.',
          'También podrías cortar tiras horizontales. Ahora cada tira empieza en el borde izquierdo y termina en el derecho. Es la misma tortilla y da lo mismo, pero a veces una forma de cortar es mucho más fácil que la otra (o la única que se puede hacer).'
        ]
      },
      {
        type: 'concept', heading: 'Regiones tipo I y tipo II', short: 'Tipo I y tipo II',
        body: [
          'Una región es <strong>tipo I</strong> si se describe con rebanadas verticales: $x$ va de un número $a$ a otro $b$, y en cada $x$, $y$ va de una curva $g_1(x)$ a otra $g_2(x)$. Entonces $$\\iint_D f\\,dA = \\int_a^b \\int_{g_1(x)}^{g_2(x)} f(x, y)\\,dy\\,dx.$$',
          'Es <strong>tipo II</strong> si se describe con rebanadas horizontales: $y$ va de $c$ a $d$, y en cada $y$, $x$ va de $h_1(y)$ a $h_2(y)$: $$\\iint_D f\\,dA = \\int_c^d \\int_{h_1(y)}^{h_2(y)} f(x, y)\\,dx\\,dy.$$',
          'Muchas regiones son de los dos tipos. El resultado es el mismo con cualquier descripción (es el teorema de Fubini para regiones generales); lo que cambia es qué tan fáciles son las cuentas.'
        ],
        diagram: 'c2s12-types',
        caption: 'El diferencial de adentro ($dy$ en tipo I, $dx$ en tipo II) es el de la dirección de la rebanada.'
      },
      {
        type: 'explainer', heading: 'Leer los límites del dibujo', short: 'Leer los límites',
        title: 'Región entre $y = x^2$ y $y = 2x$',
        intro: 'Los límites salen del dibujo, no de una fórmula: traza una rebanada y mira por dónde entra y por dónde sale.',
        diagram: 'c2s12-read',
        steps: [
          { text: 'La región está entre la parábola $y = x^2$ y la recta $y = 2x$. Se cortan donde $x^2 = 2x$: en $x = 0$ y $x = 2$, es decir, en $(0, 0)$ y $(2, 4)$.', state: { v: 0, t: 1, hz: 0, s: 2.5, many: 0, rng: 0 } },
          { text: 'Traza una rebanada vertical en un $x$ cualquiera. Entra a la región por la parábola (abajo) y sale por la recta (arriba): $y$ va de $x^2$ a $2x$. Esos son los límites de adentro.', state: { v: 1, t: 1, hz: 0, s: 2.5, many: 0, rng: 0 } },
          { text: 'Mueve la rebanada: las curvas de entrada y de salida no cambian, solo su altura. Por eso los límites de adentro dependen de $x$.', state: { v: 1, t: 1.7, hz: 0, s: 2.5, many: 0, rng: 0 } },
          { text: 'Las rebanadas barren la región de $x = 0$ a $x = 2$: esos números son los límites de afuera. Queda $\\int_0^2\\int_{x^2}^{2x} f\\,dy\\,dx$.', state: { v: 1, t: 1.7, hz: 0, s: 2.5, many: 1, rng: 1 } },
          { text: 'Ahora con rebanadas horizontales. Despeja $x$ de cada curva: la recta es $x = y/2$ y la parábola, $x = \\sqrt y$. La rebanada entra por la recta (izquierda) y sale por la parábola (derecha).', state: { v: 1, t: 1.7, hz: 1, s: 2.5, many: 0, rng: 0 } },
          { text: 'Las rebanadas van de $y = 0$ a $y = 4$, la altura de las intersecciones. Queda $\\int_0^4\\int_{y/2}^{\\sqrt y} f\\,dx\\,dy$: la misma región, descrita al revés.', state: { v: 1, t: 1.7, hz: 1, s: 1.2, many: 1, rng: 1 } }
        ]
      },
      {
        type: 'callout', heading: 'La regla de los límites',
        body: [
          'Los límites de <strong>afuera</strong> son siempre números. Los de <strong>adentro</strong> pueden depender solo de la variable de afuera.',
          'En $\\int\\int \\ldots\\,dy\\,dx$, los límites de $y$ pueden tener $x$, pero nunca $y$. Si al terminar la integral te queda una letra, algo está mal: el resultado de una integral doble sobre una región es un número.'
        ]
      },
      {
        type: 'concept', heading: 'Cambiar el orden de integración', short: 'Cambiar el orden',
        body: [
          'Para pasar de $dy\\,dx$ a $dx\\,dy$ (o al revés) no se intercambian los límites: se <strong>redibuja la región</strong>. Primero dibuja la región que describen los límites que te dan; luego encuentra las intersecciones; después traza rebanadas en la otra dirección y lee por dónde entran y salen, despejando la otra variable.',
          'A veces, en la nueva dirección, la curva de entrada (o la de salida) <strong>cambia a la mitad</strong>. Entonces hay que partir la región en dos y escribir dos integrales. Con $x = y^2$ y $y = x - 2$, las rebanadas horizontales siempre entran por la parábola y salen por la recta, pero las verticales entran por $y = -\\sqrt x$ hasta $x = 1$ y por $y = x - 2$ después.'
        ],
        diagram: 'c2s12-split',
        caption: 'Las dos piezas de la derecha suman lo mismo que la integral de la izquierda: $\\tfrac{4}{3} + \\tfrac{19}{6} = \\tfrac{9}{2}$.'
      },
      {
        type: 'concept', heading: 'Cuando solo así se puede', short: 'Solo así se puede',
        body: [
          'Algunas integrales no tienen antiderivada elemental: $\\int e^{x^2}\\,dx$, $\\int \\frac{\\sin x}{x}\\,dx$, $\\int \\sin(y^2)\\,dy$. Si una de ellas te toca <strong>adentro</strong>, te quedas atorado.',
          'Cambiar el orden la manda <strong>afuera</strong>, y al hacer primero la otra integral aparece un factor que la deja integrable. En $\\int_0^1\\int_y^1 e^{x^2}\\,dx\\,dy$ la región es el triángulo $0 \\le y \\le x \\le 1$; volteada queda $\\int_0^1\\int_0^x e^{x^2}\\,dy\\,dx = \\int_0^1 x\\,e^{x^2}\\,dx$, que ya sale con un cambio de variable.'
        ],
        diagram: 'c2s12-swap',
        caption: 'Mismo triángulo, dos formas de rebanarlo. Solo la de la derecha se puede hacer a mano.'
      },
      {
        type: 'concept', heading: 'Área con una integral doble', short: 'Área',
        body: [
          'Si integras la función $1$, cada pedacito $dA$ aporta su área, así que $$A = \\iint_D 1\\,dA.$$',
          'En una región tipo I, la integral de adentro es $\\int_{g_1(x)}^{g_2(x)} 1\\,dy = g_2(x) - g_1(x)$, y queda $A = \\int_a^b \\big(g_2(x) - g_1(x)\\big)\\,dx$: exactamente el área entre curvas de <a href="../../../calculo-1/sesiones/sesion-14/">Cálculo 1</a>. La integral doble no es otra cosa: es la misma idea con la ventaja de que puedes rebanar en la dirección que más convenga.'
        ]
      },
      {
        type: 'concept', heading: 'Masa y centro de masa de una lámina', short: 'Masa y centro de masa',
        body: [
          'Una <strong>lámina</strong> es una placa delgada con forma $D$ y densidad de área $\\rho(x, y)$ (masa por unidad de área). Un pedacito $dA$ en $(x, y)$ pesa $\\rho\\,dA$, así que la masa es $$m = \\iint_D \\rho(x, y)\\,dA.$$',
          'Los <strong>momentos</strong> miden qué tanto «jala» la masa respecto a cada eje: $$M_x = \\iint_D y\\,\\rho\\,dA, \\qquad M_y = \\iint_D x\\,\\rho\\,dA.$$ Ojo con los nombres: $M_x$ es el momento <em>respecto al eje $x$</em>, y por eso lleva la distancia a ese eje, que es $y$.',
          'El <strong>centro de masa</strong> es el punto donde la lámina se equilibra sobre la punta de un lápiz: $$\\bar x = \\frac{M_y}{m}, \\qquad \\bar y = \\frac{M_x}{m}.$$ Si $\\rho$ es constante se cancela y el punto se llama <strong>centroide</strong>: solo depende de la forma.'
        ],
        diagram: 'c2s12-mass',
        caption: 'La densidad $\\rho = y$ pone más masa arriba, así que el centro de masa sube respecto al centroide.'
      },
      {
        type: 'callout', heading: 'La simetría ahorra cuentas',
        body: [
          'Si la región y la densidad son simétricas respecto a una recta, el centro de masa está sobre esa recta. En la lámina bajo $y = 4 - x^2$ con $\\rho = y$, todo es simétrico respecto al eje $y$: $\\bar x = 0$ sin hacer $M_y$.',
          'Igual, si integras una función impar en $x$ (como $x$ o $x^3y$) sobre una región simétrica respecto al eje $y$, el resultado es $0$: lo de la izquierda cancela lo de la derecha.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: integral doble en una región general', short: 'Receta',
        steps: [
          { text: 'Dibuja la región y encuentra las intersecciones de las curvas (igualándolas).', tip: 'Sin dibujo es muy fácil equivocarte de curva. Dos minutos de dibujo te ahorran media hora de cuentas.' },
          { text: 'Elige la dirección de las rebanadas: vertical ($dy\\,dx$) u horizontal ($dx\\,dy$). Prefiere la que da una sola integral y un integrando que sepas integrar.' },
          { text: 'Lee los límites de adentro: la curva por donde entra la rebanada va abajo y por donde sale va arriba, escritas en función de la variable de afuera.', tip: 'Con rebanadas horizontales hay que despejar $x$: de $y = x^2$ sale $x = \\sqrt y$, no $x = y^2$.' },
          { text: 'Lee los límites de afuera: los valores extremos (números) entre los que se mueven las rebanadas. Si la curva de entrada o de salida cambia a la mitad, parte ahí.', tip: 'Si te sale un área o una masa negativa, invertiste un par de límites.' },
          { text: 'Integra de adentro hacia afuera. Para la masa, el centro de masa o el área, cambia solo el integrando: $\\rho$, $y\\rho$, $x\\rho$ o $1$.' }
        ]
      },
      {
        type: 'example', heading: 'Una región tipo I',
        problem: '<p>Calcula $\\iint_D xy\\,dA$, donde $D$ es la región entre $y = x^2$ y $y = 2x$.</p>',
        steps: [
          { text: 'Intersecciones: $x^2 = 2x$ da $x = 0$ y $x = 2$. Entre ellas, $2x \\ge x^2$: la recta va arriba.', math: '\\iint_D xy\\,dA = \\int_0^2 \\int_{x^2}^{2x} xy\\,dy\\,dx' },
          { text: 'Adentro, $x$ es constante.', math: '\\begin{aligned} \\int_{x^2}^{2x} xy\\,dy &= x\\,\\frac{y^2}{2}\\Big|_{x^2}^{2x} = \\frac{x(4x^2 - x^4)}{2} \\\\ &= 2x^3 - \\frac{x^5}{2} \\end{aligned}' },
          { text: 'Afuera.', math: '\\begin{aligned} \\int_0^2 \\left(2x^3 - \\frac{x^5}{2}\\right)dx &= \\left[\\frac{x^4}{2} - \\frac{x^6}{12}\\right]_0^2 \\\\ &= 8 - \\frac{16}{3} = \\frac{8}{3} \\end{aligned}' }
        ],
        answer: '$\\iint_D xy\\,dA = \\tfrac{8}{3} \\approx 2.67$. Con rebanadas horizontales, $\\int_0^4\\int_{y/2}^{\\sqrt y} xy\\,dx\\,dy$, sale lo mismo.',
        verify: { lab: 'call', mod: 'region', fn: 'integrate', math: true, args: [{ kind: 'II', pieces: [{ a: 0, b: 4, lo: 'y/2', hi: 'sqrt(y)' }] }, 'x*y'], value: 8 / 3 }
      },
      {
        type: 'example', heading: 'Cambiar el orden porque no hay de otra',
        problem: '<p>Calcula $\\displaystyle\\int_0^1\\int_y^1 e^{x^2}\\,dx\\,dy$.</p>',
        steps: [
          { text: 'La de adentro, $\\int e^{x^2}\\,dx$, no tiene antiderivada elemental. Hay que cambiar el orden.' },
          { text: 'Dibuja la región: $y$ va de 0 a 1 y, en cada $y$, $x$ va de la recta $x = y$ a $x = 1$. Es el triángulo con vértices $(0, 0)$, $(1, 0)$ y $(1, 1)$.' },
          { text: 'Con rebanadas verticales: $x$ va de 0 a 1 y, en cada $x$, $y$ va de $0$ a $x$.', math: '\\int_0^1\\int_0^x e^{x^2}\\,dy\\,dx = \\int_0^1 x\\,e^{x^2}\\,dx' },
          { text: 'Con $u = x^2$, $du = 2x\\,dx$.', math: '\\int_0^1 x\\,e^{x^2}\\,dx = \\frac{e^{x^2}}{2}\\Big|_0^1 = \\frac{e - 1}{2}' }
        ],
        answer: '$\\dfrac{e - 1}{2} \\approx ' + fx((E - 1) / 2) + '$. El factor $x$ que salió de la integral de adentro fue el que hizo posible la de afuera.',
        verify: { lab: 'call', mod: 'region', fn: 'integrate', math: true, args: [{ kind: 'II', pieces: [{ a: 0, b: 1, lo: 'y', hi: '1' }] }, 'e^(x^2)'], value: (E - 1) / 2 }
      },
      {
        type: 'example', heading: 'Una región que hay que partir',
        problem: '<p>Calcula el área de la región entre $x = y^2$ y $y = x - 2$, primero con rebanadas horizontales y luego con verticales.</p>',
        steps: [
          { text: 'Intersecciones: $y^2 = y + 2$ da $y = -1$ y $y = 2$, es decir, $(1, -1)$ y $(4, 2)$.' },
          { text: 'Horizontales: entran por $x = y^2$ y salen por $x = y + 2$.', math: '\\begin{aligned} A &= \\int_{-1}^{2}\\int_{y^2}^{y + 2} dx\\,dy \\\\ &= \\int_{-1}^{2}(y + 2 - y^2)\\,dy = \\frac{9}{2} \\end{aligned}' },
          { text: 'Verticales: salen siempre por $y = \\sqrt x$, pero entran por $y = -\\sqrt x$ hasta $x = 1$ y por $y = x - 2$ después. Se parte en $x = 1$.', math: '\\begin{aligned} A = &\\int_0^1\\int_{-\\sqrt x}^{\\sqrt x} dy\\,dx \\\\ &+ \\int_1^4\\int_{x - 2}^{\\sqrt x} dy\\,dx \\end{aligned}' },
          { text: 'Cada pieza.', math: '\\begin{aligned} A &= \\int_0^1 2\\sqrt x\\,dx + \\int_1^4 (\\sqrt x - x + 2)\\,dx \\\\ &= \\frac{4}{3} + \\frac{19}{6} = \\frac{9}{2} \\end{aligned}' }
        ],
        answer: 'El área es $\\tfrac{9}{2} = 4.5$ por los dos caminos. En este caso conviene rebanar en horizontal: una integral en lugar de dos.',
        verify: { lab: 'call', mod: 'region', fn: 'integrate', math: true, args: [{ kind: 'I', pieces: [{ a: 0, b: 1, lo: '-sqrt(x)', hi: 'sqrt(x)' }, { a: 1, b: 4, lo: 'x - 2', hi: 'sqrt(x)' }] }, '1'], value: 4.5 }
      },
      {
        type: 'example', heading: 'Masa y centro de masa de una lámina',
        problem: '<p>Una lámina ocupa la región bajo $y = 4 - x^2$ y sobre el eje $x$, con densidad $\\rho(x, y) = y$. Encuentra su masa y su centro de masa.</p>',
        steps: [
          { text: 'La parábola corta al eje $x$ en $x = \\pm 2$. Masa con rebanadas verticales.', math: '\\begin{aligned} m &= \\int_{-2}^{2}\\int_0^{4 - x^2} y\\,dy\\,dx \\\\ &= \\int_{-2}^{2}\\frac{(4 - x^2)^2}{2}\\,dx \\\\ &= \\frac{256}{15} \\approx ' + fx(256 / 15) + ' \\end{aligned}' },
          { text: 'Por simetría (región y densidad simétricas respecto al eje $y$), $\\bar x = 0$.' },
          { text: 'Momento respecto al eje $x$: el integrando es $y\\rho = y^2$.', math: '\\begin{aligned} M_x &= \\int_{-2}^{2}\\int_0^{4 - x^2} y^2\\,dy\\,dx \\\\ &= \\int_{-2}^{2}\\frac{(4 - x^2)^3}{3}\\,dx \\\\ &= \\frac{4096}{105} \\approx ' + fx(4096 / 105) + ' \\end{aligned}' },
          { text: 'Divide entre la masa.', math: '\\bar y = \\frac{M_x}{m} = \\frac{4096/105}{256/15} = \\frac{16}{7} \\approx ' + fx(16 / 7) }
        ],
        answer: '$m = \\tfrac{256}{15} \\approx ' + fx(256 / 15) + '$ y el centro de masa está en $\\left(0, \\tfrac{16}{7}\\right) \\approx (0, ' + fx(16 / 7) + ')$. Con densidad constante estaría más abajo, en $\\bar y = 1.6$.',
        verify: { lab: 'call', mod: 'region', fn: 'moments', math: true, args: [{ kind: 'I', pieces: [{ a: -2, b: 2, lo: '0', hi: '4 - x^2' }] }, 'y'], values: { m: 256 / 15, Mx: 4096 / 105, ybar: 16 / 7, xbar: 0 } }
      },
      {
        type: 'example', heading: 'El centroide de un semicírculo',
        problem: '<p>Encuentra el centroide de la mitad superior del disco $x^2 + y^2 \\le 9$ (densidad constante).</p>',
        steps: [
          { text: 'Por simetría, $\\bar x = 0$. El área es la mitad del disco.', math: 'A = \\tfrac{1}{2}\\pi(3)^2 = \\tfrac{9\\pi}{2}' },
          { text: 'Con $\\rho = 1$, el momento respecto al eje $x$ con rebanadas verticales:', math: '\\begin{aligned} M_x &= \\int_{-3}^{3}\\int_0^{\\sqrt{9 - x^2}} y\\,dy\\,dx \\\\ &= \\int_{-3}^{3}\\frac{9 - x^2}{2}\\,dx = 18 \\end{aligned}' },
          { text: 'Divide entre el área (que aquí hace de masa).', math: '\\bar y = \\frac{18}{9\\pi/2} = \\frac{4}{\\pi} \\approx ' + fx(4 / Math.PI) }
        ],
        answer: 'El centroide está en $\\left(0, \\tfrac{4}{\\pi}\\right) \\approx (0, ' + fx(4 / Math.PI) + ')$. En general, para radio $r$, $\\bar y = \\tfrac{4r}{3\\pi}$: un poco abajo de la mitad del radio.',
        verify: { lab: 'call', mod: 'region', fn: 'moments', math: true, args: [{ kind: 'I', pieces: [{ a: -3, b: 3, lo: '0', hi: 'sqrt(9 - x^2)' }] }, '1'], values: { m: 4.5 * Math.PI, Mx: 18, ybar: 4 / Math.PI, xbar: 0 } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Cómo sé qué orden usar?', a: 'Dibuja y prueba las dos direcciones de rebanada. Escoge la que da menos integrales (sin partir la región) y un integrando que sepas integrar. Si la de adentro no tiene antiderivada, cambia el orden.' },
          { q: '¿Por qué los límites de afuera no pueden tener $x$ ni $y$?', a: 'Porque después de la integral de afuera ya no queda ninguna variable: el resultado es un número. Si un límite de afuera tuviera una letra, esa letra se quedaría en la respuesta.' },
          { q: 'Me salió un área negativa. ¿Qué hice mal?', a: 'Invertiste un par de límites: pusiste la curva de arriba abajo (o la de la derecha a la izquierda). El área y la masa con $\\rho > 0$ siempre son positivas.' },
          { q: 'Al cambiar el orden, ¿basta con intercambiar los límites?', a: 'No. Hay que redibujar la región y despejar la otra variable. Los límites de afuera nuevos son las alturas (o anchuras) extremas de la región, no los números de antes.' },
          { q: '¿$M_x$ lleva $x$ o $y$?', a: 'Lleva $y$: $M_x = \\iint y\\rho\\,dA$ es el momento respecto al eje $x$, y la distancia a ese eje es $y$. Por eso $\\bar y = M_x/m$.' },
          { q: '¿El centro de masa siempre está dentro de la lámina?', a: 'No. En una herradura o un anillo cae en el hueco. Es el punto de equilibrio, no necesariamente un punto de la placa.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Tipo I: $\\int_a^b\\int_{g_1(x)}^{g_2(x)} f\\,dy\\,dx$. Tipo II: $\\int_c^d\\int_{h_1(y)}^{h_2(y)} f\\,dx\\,dy$. Afuera números; adentro, curvas en la variable de afuera.',
          'Para cambiar el orden, redibuja la región, despeja la otra variable y parte la región si la curva de entrada o salida cambia.',
          'Área: $\\iint_D 1\\,dA$. Masa: $\\iint_D \\rho\\,dA$.',
          'Centro de masa: $\\bar x = M_y/m$, $\\bar y = M_x/m$, con $M_x = \\iint y\\rho\\,dA$ y $M_y = \\iint x\\rho\\,dA$. La simetría te ahorra la mitad.'
        ]
      }
    ],

    lab: {
      type: 'region-order', title: '¿Es tu región?',
      intro: 'Elige una región y mira sus rebanadas verticales u horizontales; mueve una para ver por qué curva entra y por cuál sale. Luego escribe los límites de la integral en el orden pedido: los de afuera son números y los de adentro, expresiones en la variable de afuera. El lab dibuja la región que describen tus límites encima de la verdadera y marca lo que te sobra y lo que te falta. También te avisa si invertiste límites (área negativa), si usaste la variable de adentro en sus propios límites, si copiaste la curva sin despejar, si faltó partir la región o si escribiste el otro orden.',
      cfg: { start: 0 }
    },

    formulas: [
      { label: 'Tipo I', tex: '\\int_a^b\\int_{g_1(x)}^{g_2(x)} f\\,dy\\,dx' },
      { label: 'Tipo II', tex: '\\int_c^d\\int_{h_1(y)}^{h_2(y)} f\\,dx\\,dy' },
      { label: 'Área', tex: 'A = \\iint_D 1\\,dA' },
      { label: 'Masa', tex: 'm = \\iint_D \\rho\\,dA' },
      { label: 'Momentos', tex: 'M_x = \\iint_D y\\rho\\,dA,\\ \\ M_y = \\iint_D x\\rho\\,dA' },
      { label: 'Centro de masa', tex: '\\bar x = \\frac{M_y}{m},\\ \\ \\bar y = \\frac{M_x}{m}' }
    ],

    exercises: [
      {
        id: 'c2-s12-tipo-i', title: 'Una integral sobre una región tipo I',
        vars: { k: [1, 4, 0.5], c: [1, 6, 1] },
        prompt: function (v) { return '<p>Sea $D$ la región entre la parábola $y = x^2$ y la recta $y = ' + k1(v.k, 'x') + '$. Calcula $\\iint_D ' + k1(v.c, 'x') + '\\,dA$.</p>'; },
        check: 'numeric',
        answer: function (v) { return v.c * Math.pow(v.k, 4) / 12; },
        mistakes: {
          flipped: function (v) { return -v.c * Math.pow(v.k, 4) / 12; },
          area: function (v) { return v.c * Math.pow(v.k, 3) / 6; }
        },
        feedback: [
          { when: 'flipped', say: 'Te salió con signo menos: entre $0$ y $k$ la recta va arriba de la parábola, así que $y$ va de $x^2$ a $kx$.' },
          { when: 'area', say: 'Ese es $c$ por el área de la región. Falta el factor $x$ del integrando: adentro queda $x(kx - x^2)$.' }
        ],
        oracle: { lab: 'call', mod: 'region', fn: 'integrate', math: true, args: function (v) { return [{ kind: 'II', pieces: [{ a: 0, b: v.k * v.k, lo: 'y/' + v.k, hi: 'sqrt(y)' }] }, v.c + '*x']; } },
        hint: 'Intersecciones: $x^2 = kx$ en $x = 0$ y $x = k$. Integra primero en $y$, de $x^2$ a $kx$.',
        solution: function (v) {
          return 'Con $x$ de $0$ a $' + v.k + '$ y $y$ de $x^2$ a $' + k1(v.k, 'x') + '$: $$\\begin{aligned} &\\int_0^{' + v.k + '}\\int_{x^2}^{' + k1(v.k, 'x') + '} ' + k1(v.c, 'x') + '\\,dy\\,dx \\\\ &= \\int_0^{' + v.k + '} ' + k1(v.c, 'x') + '(' + k1(v.k, 'x') + ' - x^2)\\,dx \\\\ &= \\frac{' + v.c + '\\cdot ' + v.k + '^4}{12} \\approx ' + fx(v.c * Math.pow(v.k, 4) / 12) + ' \\end{aligned}$$';
        }
      },
      {
        id: 'c2-s12-orden', title: 'Cambiar el orden',
        vars: { k: [2, 5, 1] },
        prompt: function (v) { return '<p>¿Cuál integral es igual a $\\displaystyle\\int_0^{' + v.k + '}\\int_{x^2}^{' + v.k + 'x} f(x, y)\\,dy\\,dx$?</p>'; },
        check: 'choice',
        options: function (v) {
          var K2 = v.k * v.k;
          return [
            { text: '$\\int_0^{' + K2 + '}\\int_{y/' + v.k + '}^{\\sqrt y} f\\,dx\\,dy$', correct: true },
            { text: '$\\int_0^{' + K2 + '}\\int_{\\sqrt y}^{y/' + v.k + '} f\\,dx\\,dy$', say: 'Así queda al revés: a la izquierda está la recta $x = y/' + v.k + '$ y a la derecha la parábola $x = \\sqrt y$.' },
            { text: '$\\int_0^{' + v.k + '}\\int_{y/' + v.k + '}^{\\sqrt y} f\\,dx\\,dy$', say: 'Ahora $y$ va afuera, y $y$ sube hasta la altura de la intersección, $' + v.k + '^2 = ' + K2 + '$, no hasta ' + v.k + '.' },
            { text: '$\\int_0^{' + K2 + '}\\int_{y^2}^{' + v.k + 'y} f\\,dx\\,dy$', say: 'Cambiaste la letra sin despejar. De $y = x^2$ sale $x = \\sqrt y$, y de $y = ' + v.k + 'x$ sale $x = y/' + v.k + '$.' }
          ];
        },
        answer: function (v) { return '$\\int_0^{' + v.k * v.k + '}\\int_{y/' + v.k + '}^{\\sqrt y} f\\,dx\\,dy$'; },
        hint: 'Dibuja la región: entre $y = x^2$ (abajo) y $y = kx$ (arriba). Las rebanadas horizontales entran por la recta y salen por la parábola.',
        solution: function (v) { return 'Se cortan en $(0, 0)$ y $(' + v.k + ', ' + v.k * v.k + ')$. En horizontal, $y$ va de $0$ a $' + v.k * v.k + '$ y, en cada $y$, $x$ va de la recta $x = y/' + v.k + '$ a la parábola $x = \\sqrt y$.'; }
      },
      {
        id: 'c2-s12-solo-asi', title: 'Solo cambiando el orden',
        vars: { a: [0.5, 1.5, 0.1], kind: [0, 1, 1] },
        prompt: function (v) {
          var f = v.kind ? '\\frac{\\sin x}{x}' : 'e^{x^2}';
          return '<p>Calcula $\\displaystyle\\int_0^{' + v.a + '}\\int_y^{' + v.a + '} ' + f + '\\,dx\\,dy$. (La integral de adentro no tiene antiderivada elemental: cambia el orden.)</p>';
        },
        check: 'numeric',
        answer: function (v) { return v.kind ? 1 - Math.cos(v.a) : (Math.exp(v.a * v.a) - 1) / 2; },
        mistakes: {
          noHalf: function (v) { return v.kind ? Math.cos(v.a) - 1 : Math.exp(v.a * v.a) - 1; },
          noLower: function (v) { return v.kind ? -Math.cos(v.a) : Math.exp(v.a * v.a) / 2; }
        },
        feedback: [
          { when: 'noHalf', say: function (v) { return v.kind ? 'Revisa el signo: $\\int_0^a \\sin x\\,dx = -\\cos a + \\cos 0 = 1 - \\cos a$.' : 'Falta el $\\tfrac{1}{2}$ del cambio de variable: $\\int x e^{x^2}dx = \\tfrac{1}{2}e^{x^2}$.'; } },
          { when: 'noLower', say: 'Te faltó evaluar en el límite de abajo, $x = 0$: no vale cero.' }
        ],
        oracle: { lab: 'call', mod: 'region', fn: 'integrate', math: true, args: function (v) { return [{ kind: 'II', pieces: [{ a: 0, b: v.a, lo: 'y', hi: String(v.a) }] }, v.kind ? 'sin(x)/x' : 'e^(x^2)']; } },
        hint: 'La región es el triángulo $0 \\le y \\le x \\le a$. Volteada: $x$ de $0$ a $a$ y $y$ de $0$ a $x$. La integral de adentro (en $y$) solo multiplica por $x$.',
        solution: function (v) {
          if (v.kind) return 'Volteada: $$\\begin{aligned} &\\int_0^{' + v.a + '}\\int_0^{x}\\frac{\\sin x}{x}\\,dy\\,dx = \\int_0^{' + v.a + '}\\sin x\\,dx \\\\ &= 1 - \\cos ' + v.a + ' \\approx ' + fx(1 - Math.cos(v.a)) + ' \\end{aligned}$$';
          return 'Volteada: $$\\begin{aligned} &\\int_0^{' + v.a + '}\\int_0^{x} e^{x^2}\\,dy\\,dx = \\int_0^{' + v.a + '} x e^{x^2}\\,dx \\\\ &= \\frac{e^{' + fx(v.a * v.a) + '} - 1}{2} \\approx ' + fx((Math.exp(v.a * v.a) - 1) / 2) + ' \\end{aligned}$$';
        }
      },
      {
        id: 'c2-s12-limite', title: 'El límite despejado',
        vars: { c: [2, 5, 1] },
        prompt: function (v) { return '<p>La región $0 \\le x \\le 1$, $' + v.c + 'x^2 \\le y \\le ' + v.c + '$ se escribe con rebanadas horizontales como $\\displaystyle\\int_0^{' + v.c + '}\\int_0^{\\,?} f\\,dx\\,dy$. ¿Cuál es el límite de arriba de $x$, en función de $y$?</p>'; },
        check: 'expr', exprVars: ['y'], domain: { y: [0.2, 2] },
        answer: function (v) { return 'sqrt(y/' + v.c + ')'; },
        mistakes: {
          renamed: function (v) { return v.c + '*y^2'; },
          noRoot: function (v) { return 'y/' + v.c; },
          inside: function (v) { return 'sqrt(' + v.c + '*y)'; }
        },
        feedback: [
          { when: 'renamed', say: 'Cambiaste la letra sin despejar. Hay que resolver $y = cx^2$ para $x$.' },
          { when: 'noRoot', say: 'Ese es $x^2$. Falta sacar la raíz: $x = \\sqrt{y/c}$.' },
          { when: 'inside', say: 'Al despejar, $c$ divide: $x^2 = y/c$.' }
        ],
        hint: 'Las rebanadas horizontales salen por la parábola $y = cx^2$. Despeja $x$ (con $x \\ge 0$).',
        solution: function (v) { return 'De $y = ' + v.c + 'x^2$ sale $x^2 = \\dfrac{y}{' + v.c + '}$, y con $x \\ge 0$: $$x = \\sqrt{\\frac{y}{' + v.c + '}}$$'; }
      },
      {
        id: 'c2-s12-area', title: 'Área con integral doble',
        vars: { h: [1, 9, 1] },
        prompt: function (v) { return '<p>Con una integral doble, calcula el área de la región entre la parábola $x = y^2$ y la recta $x = ' + v.h + '$.</p>'; },
        check: 'numeric', unit: 'u²',
        answer: function (v) { return 4 / 3 * Math.pow(v.h, 1.5); },
        mistakes: {
          half: function (v) { return 2 / 3 * Math.pow(v.h, 1.5); },
          noSub: function (v) { return 2 * Math.pow(v.h, 1.5); }
        },
        feedback: [
          { when: 'half', say: 'Esa es solo la mitad de arriba. La región también tiene $y$ negativas: $y$ va de $-\\sqrt h$ a $\\sqrt h$.' },
          { when: 'noSub', say: 'Ese es el rectángulo completo. Adentro, $x$ va de $y^2$ a $h$: el integrando de afuera es $h - y^2$.' }
        ],
        oracle: { lab: 'call', mod: 'region', fn: 'integrate', math: true, args: function (v) { return [{ kind: 'I', pieces: [{ a: 0, b: v.h, lo: '-sqrt(x)', hi: 'sqrt(x)' }] }, '1']; } },
        hint: 'Con rebanadas horizontales: $y$ de $-\\sqrt h$ a $\\sqrt h$ y $x$ de $y^2$ a $h$.',
        solution: function (v) { var r = Math.sqrt(v.h); return 'Con $y$ de $-\\sqrt{' + v.h + '}$ a $\\sqrt{' + v.h + '}$: $$\\begin{aligned} A &= \\int_{-' + fx(r, 4) + '}^{' + fx(r, 4) + '}\\int_{y^2}^{' + v.h + '} dx\\,dy = \\int (' + v.h + ' - y^2)\\,dy \\\\ &= \\frac{4}{3}(' + v.h + ')^{3/2} \\approx ' + fx(4 / 3 * Math.pow(v.h, 1.5)) + ' \\end{aligned}$$'; }
      },
      {
        id: 'c2-s12-masa', title: 'Masa de una lámina',
        vars: { L: [1, 5, 0.5], k: [1, 5, 1], dens: [0, 1, 1] },
        prompt: function (v) { return '<p>Una lámina ocupa el triángulo con vértices $(0, 0)$, $(' + v.L + ', 0)$ y $(' + v.L + ', ' + v.L + ')$, con densidad $\\rho(x, y) = ' + k1(v.k, v.dens ? 'y' : 'x') + '$. ¿Cuál es su masa?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.k * Math.pow(v.L, 3) / (v.dens ? 6 : 3); },
        mistakes: {
          other: function (v) { return v.k * Math.pow(v.L, 3) / (v.dens ? 3 : 6); },
          area: function (v) { return v.k * v.L * v.L / 2; }
        },
        feedback: [
          { when: 'other', say: 'Ese resultado corresponde a la otra densidad. Revisa si $\\rho$ depende de $x$ o de $y$.' },
          { when: 'area', say: 'Ese es $k$ por el área del triángulo. La densidad cambia de un punto a otro: hay que integrarla.' }
        ],
        oracle: { lab: 'call', mod: 'region', fn: 'integrate', math: true, args: function (v) { return [{ kind: 'II', pieces: [{ a: 0, b: v.L, lo: 'y', hi: String(v.L) }] }, v.k + '*' + (v.dens ? 'y' : 'x')]; } },
        hint: 'El triángulo es $0 \\le y \\le x$, $0 \\le x \\le L$. Calcula $m = \\int_0^L\\int_0^x \\rho\\,dy\\,dx$.',
        solution: function (v) {
          var m = v.k * Math.pow(v.L, 3) / (v.dens ? 6 : 3);
          return v.dens ? '$$\\begin{aligned} m &= \\int_0^{' + v.L + '}\\int_0^x ' + k1(v.k, 'y') + '\\,dy\\,dx = \\int_0^{' + v.L + '}\\frac{' + v.k + 'x^2}{2}\\,dx \\\\ &= \\frac{' + v.k + '(' + v.L + ')^3}{6} \\approx ' + fx(m) + ' \\end{aligned}$$'
            : '$$\\begin{aligned} m &= \\int_0^{' + v.L + '}\\int_0^x ' + k1(v.k, 'x') + '\\,dy\\,dx = \\int_0^{' + v.L + '} ' + v.k + 'x^2\\,dx \\\\ &= \\frac{' + v.k + '(' + v.L + ')^3}{3} \\approx ' + fx(m) + ' \\end{aligned}$$';
        }
      },
      {
        id: 'c2-s12-centro', title: 'Coordenada del centro de masa',
        vars: { R: [1, 6, 1], kind: [0, 1, 1] },
        prompt: function (v) {
          return '<p>¿Cuánto vale $\\bar y$ del centroide (densidad constante) de ' + (v.kind ? 'la región entre la parábola $y = ' + v.R + ' - x^2$ y el eje $x$' : 'la mitad superior del disco $x^2 + y^2 \\le ' + v.R * v.R + '$') + '?</p>';
        },
        check: 'numeric',
        answer: function (v) { return v.kind ? 0.4 * v.R : 4 * v.R / (3 * Math.PI); },
        mistakes: {
          half: function (v) { return v.R / 2; },
          moment: function (v) { return v.kind ? 8 / 15 * Math.pow(v.R, 2.5) : 2 * Math.pow(v.R, 3) / 3; }
        },
        feedback: [
          { when: 'half', say: 'Ese es el punto medio de la altura. La figura es más ancha abajo, así que el centroide queda más abajo de la mitad.' },
          { when: 'moment', say: 'Ese es $M_x$. Falta dividir entre el área: $\\bar y = M_x / A$.' }
        ],
        oracle: { lab: 'call', mod: 'region', fn: 'moments', math: true, field: 'ybar', args: function (v) { var s = Math.sqrt(v.R); return [v.kind ? { kind: 'I', pieces: [{ a: -s, b: s, lo: '0', hi: v.R + ' - x^2' }] } : { kind: 'I', pieces: [{ a: -v.R, b: v.R, lo: '0', hi: 'sqrt(' + v.R * v.R + ' - x^2)' }] }, '1']; } },
        hint: '$\\bar y = \\dfrac{M_x}{A}$ con $M_x = \\iint y\\,dA$. Con rebanadas verticales, $\\int_0^{g(x)} y\\,dy = \\tfrac{g(x)^2}{2}$.',
        solution: function (v) {
          if (v.kind) {
            var s = Math.sqrt(v.R);
            return 'La parábola corta al eje en $x = \\pm' + fx(s, 4) + '$. $A = \\tfrac{4}{3}(' + v.R + ')^{3/2}$ y $M_x = \\int \\tfrac{(' + v.R + ' - x^2)^2}{2}dx = \\tfrac{8}{15}(' + v.R + ')^{5/2}$. $$\\bar y = \\frac{M_x}{A} = \\frac{2}{5}(' + v.R + ') = ' + fx(0.4 * v.R) + '$$';
          }
          return '$A = \\tfrac{\\pi(' + v.R + ')^2}{2}$ y $M_x = \\int_{-' + v.R + '}^{' + v.R + '}\\tfrac{' + v.R * v.R + ' - x^2}{2}dx = \\tfrac{2(' + v.R + ')^3}{3}$. $$\\bar y = \\frac{4r}{3\\pi} = \\frac{4(' + v.R + ')}{3\\pi} \\approx ' + fx(4 * v.R / (3 * Math.PI)) + '$$';
        }
      },
      {
        id: 'c2-s12-partir', title: 'Concepto: cuándo partir',
        vars: {},
        prompt: function () { return '<p>Quieres el área entre $x = y^2$ y $y = x - 2$ con rebanadas <strong>verticales</strong> ($dy\\,dx$). ¿Qué necesitas?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Dos integrales, partiendo en $x = 1$', correct: true },
            { text: 'Una sola integral, con $x$ de 0 a 4', say: 'Las rebanadas verticales entran por $y = -\\sqrt x$ hasta $x = 1$ y por $y = x - 2$ después: la curva de abajo cambia.' },
            { text: 'Dos integrales, partiendo en $y = 0$', say: 'El corte va en la variable de afuera, que con $dy\\,dx$ es $x$; además, la curva cambia en $x = 1$.' },
            { text: 'No se puede en ese orden', say: 'Sí se puede: solo hay que partir. Las dos piezas suman $\\tfrac{9}{2}$, igual que en el otro orden.' }
          ];
        },
        answer: function () { return 'Dos integrales, partiendo en $x = 1$'; },
        hint: 'Dibuja la región y traza rebanadas verticales a la izquierda y a la derecha de $x = 1$. ¿Entran por la misma curva?',
        solution: function () { return 'A la izquierda de $x = 1$ las rebanadas entran por la mitad de abajo de la parábola, $y = -\\sqrt x$; a la derecha, por la recta $y = x - 2$. Por eso $A = \\int_0^1\\int_{-\\sqrt x}^{\\sqrt x} dy\\,dx + \\int_1^4\\int_{x - 2}^{\\sqrt x} dy\\,dx$.'; }
      }
    ],

    quiz: { tags: ['c2.S12'], count: 8 },

    errors: [
      'Cambiar el orden intercambiando los límites sin redibujar la región.',
      'Dejar la variable de adentro (o cualquier letra) en los límites de afuera.',
      'Copiar la curva cambiando la letra sin despejar: de $y = x^2$ escribir $x = y^2$ en vez de $x = \\sqrt y$.',
      'Olvidar partir la región cuando la curva de entrada o de salida cambia a la mitad.',
      'Poner la curva de arriba como límite de abajo: el área o la masa salen negativas.',
      'Confundir $M_x$ con $M_y$: $M_x = \\iint y\\rho\\,dA$ va con $\\bar y$.',
      'Olvidar dividir el momento entre la masa al calcular el centro de masa.'
    ],

    teacher: {
      plan: [
        'La tortilla en tiras: que digan por dónde empieza y termina cada tira antes de dar fórmulas.',
        'Explainer de la parábola y la recta, escribiendo los dos órdenes en el pizarrón.',
        'Cambio de orden con la región que hay que partir y con $e^{x^2}$; luego área, masa y centro de masa.',
        'Lab: que escriban los límites en el orden pedido y lean el dibujo de lo que sobra y lo que falta.'
      ],
      check: [
        'Que dibujen la región antes de escribir límites.',
        'Que revisen que los límites de afuera sean números y que los de adentro dependan solo de la variable de afuera.'
      ],
      note: 'Las coordenadas polares para regiones circulares se dejan para S13; aquí los círculos se hacen en rectangulares para que se note la ventaja que traerán.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §5.2 “Double Integrals over General Regions”. <a href="https://openstax.org/books/calculus-volume-3/pages/5-2-double-integrals-over-general-regions">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 3</em>, §5.6 “Calculating Centers of Mass and Moments of Inertia”. <a href="https://openstax.org/books/calculus-volume-3/pages/5-6-calculating-centers-of-mass-and-moments-of-inertia">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 2</em>, §2.6 “Moments and Centers of Mass”. <a href="https://openstax.org/books/calculus-volume-2/pages/2-6-moments-and-centers-of-mass">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-11',
    next: 'sesion-13'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) ex.where = apart(ex);
  });
})();
