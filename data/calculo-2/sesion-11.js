/* =====================================================================
   Cálculo 2 · S11 · Integral doble (bloque C · Integral múltiple).
   Fuente: OpenStax, Calculus Volume 3, §5.1 (CC BY-NC-SA 4.0).
   Las cuentas se hacen aquí con antiderivadas a mano y scripts/examples.test.js
   las compara contra LabMath.dblint (cuadratura de Gauss–Legendre y sumas de
   Riemann numéricas), que a su vez se prueba contra Simpson y Monte Carlo.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function co(k) { return k === 1 ? '' : String(k); }
  var PI = Math.PI;

  // La respuesta y cada error típico deben quedar separados (más que la holgura del calificador),
  // para que el mensaje "casi" nunca sea ambiguo. gap(a, b) = separación mínima exigida.
  function apart(gap) {
    return function (ex) {
      return function (v) {
        var w = Object.assign({}, v, ex.derive ? ex.derive(v) : {});
        if (ex.baseWhere && !ex.baseWhere(w)) return false;
        var vals = [ex.answer(w)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](w); }));
        for (var i = 0; i < vals.length; i++) {
          if (!isFinite(vals[i])) return false;
          for (var j = i + 1; j < vals.length; j++) if (Math.abs(vals[i] - vals[j]) <= gap(vals[i], vals[j])) return false;
        }
        return true;
      };
    };
  }
  var REL = apart(function (p, q) { return 0.02 + 0.015 * Math.max(Math.abs(p), Math.abs(q)); });

  // Suma de punto medio 2 × 2 de f = A x + B y² sobre [0, a] × [0, b] (y su versión de esquina).
  function mid22(v, rule) {
    var dx = v.a / 2, dy = v.b / 2, off = rule === 'll' ? 0 : 0.5, s = 0;
    for (var i = 0; i < 2; i++) for (var j = 0; j < 2; j++) {
      var x = (i + off) * dx, y = (j + off) * dy;
      s += v.A * x + v.B * y * y;
    }
    return { raw: s, sum: s * dx * dy };
  }
  // Rango de y del ejercicio separable: [0, π/2] o [0, π/3].
  var YR = [{ tex: '\\tfrac{\\pi}{2}', val: PI / 2 }, { tex: '\\tfrac{\\pi}{3}', val: PI / 3 }];
  var TRIG = [{ tex: '\\cos y', src: 'cos(y)', I: function (d) { return Math.sin(d); }, anti: '\\sin y' },
    { tex: '\\sin y', src: 'sin(y)', I: function (d) { return 1 - Math.cos(d); }, anti: '-\\cos y' }];

  var data = window.SESSION_DATA = {
    slug: 'sesion-11', number: '11', group: 'C · Integral múltiple',
    title: 'Integral doble como suma de diferenciales: sumas de Riemann en 2D y teorema de Fubini', temario: [],
    minutes: 180,
    quote: 'Partes el piso en cuadritos, levantas un prisma en cada uno y sumas. En el límite, esa suma es la integral doble, y se calcula con dos integrales de Cálculo 1, una dentro de la otra.',
    badges: [
      'Armar una suma de Riemann doble $\\sum\\sum f(x_i^*, y_j^*)\\,\\Delta A$ con esquinas o puntos medios.',
      'Entender $\\iint_R f\\,dA$ como límite de esas sumas, con $dA = dx\\,dy$, y leerla como volumen, masa o promedio.',
      'Calcular integrales dobles sobre rectángulos como integrales iteradas (teorema de Fubini), en cualquier orden.',
      'Usar linealidad y separar $g(x)h(y)$ en un producto de dos integrales.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Para el volumen bajo una superficie $z = f(x, y)$ partes el piso en celdas, levantas un prisma en cada una y sumas: $\\sum\\sum f(x^*, y^*)\\,\\Delta A$. En el límite, esa suma es la <strong>integral doble</strong> $\\iint_R f\\,dA$, y se calcula con dos integrales de Cálculo 1, una dentro de la otra.',
        recall: [
          'La integral de Cálculo 1 como límite de sumas de rectángulos, $\\int_a^b f(x)\\,dx = \\lim \\sum f(x_i^*)\\,\\Delta x$ (<a href="../../../calculo-1/sesiones/sesion-09/">Cálculo 1, S09</a>).',
          'Antiderivadas y el teorema fundamental, $\\int_a^b f\\,dx = F(b) - F(a)$, también con $e^{kx}$, $\\sin$ y $\\cos$ (<a href="../../../calculo-1/sesiones/sesion-10/">Cálculo 1, S10</a>).',
          'Superficies $z = f(x, y)$ y sus cortes (S01 y S04): con $y$ fija, $f$ es una función de $x$ sola.'
        ],
        why: 'Volumen de un terreno, masa de una placa cuya densidad cambia, lluvia total sobre una región, carga de una placa cargada (en Física 2, con $\\sigma\\,dA$): todo es sumar algo que cambia de punto a punto sobre un área. La integral doble es esa suma.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Quieres saber cuánta tierra tiene un montículo. Clavas estacas en una cuadrícula, mides la altura en cada cuadro y la multiplicas por el área del cuadro: altura por área es el volumen de una columna de tierra. Sumas todas las columnas. Con cuadros más chicos, la estimación mejora.',
          'Lo mismo con la lluvia en un estado: en cada municipio llovió distinto. Milímetros de lluvia por el área del municipio da el agua que cayó ahí; sumando todos los municipios tienes el total. Cuando la cantidad cambia de punto a punto, partes en pedazos donde casi no cambia.',
          'Y para calcular, rebanas como un pan de caja: el volumen es la suma de las rebanadas, cada una con su área por su grosor. Da igual si rebanas a lo largo o a lo ancho: el pan es el mismo. Esa es la idea del teorema de Fubini.'
        ]
      },
      {
        type: 'concept', heading: 'De Cálculo 1 a dos dimensiones', short: 'Sumas de Riemann en 2D',
        body: [
          'En Cálculo 1, $\\int_a^b f(x)\\,dx$ es el límite de sumas de rectángulos: partes $[a, b]$ en pedazos de ancho $\\Delta x$, tomas una altura $f(x_i^*)$ en cada uno y sumas $\\sum f(x_i^*)\\,\\Delta x$.',
          'Ahora la base es un rectángulo $R = [a, b] \\times [c, d]$: los puntos con $a \\le x \\le b$ y $c \\le y \\le d$. Lo partes en $m$ columnas y $n$ filas: $$\\Delta x = \\frac{b - a}{m}, \\quad \\Delta y = \\frac{d - c}{n}, \\quad \\Delta A = \\Delta x\\,\\Delta y.$$',
          'En cada celda eliges un <strong>punto de muestra</strong> $(x_i^*, y_j^*)$ y levantas un prisma de base $\\Delta A$ y altura $f(x_i^*, y_j^*)$. Su volumen es $f(x_i^*, y_j^*)\\,\\Delta A$, y la <strong>suma doble de Riemann</strong> junta todos: $$S_{m,n} = \\sum_{i=1}^{m}\\sum_{j=1}^{n} f(x_i^*, y_j^*)\\,\\Delta A.$$'
        ],
        diagram: 'c2s11-grid',
        caption: 'Cuatro columnas y tres filas: doce celdas, cada una de área $\\Delta A = \\Delta x\\,\\Delta y$ y con su punto de muestra.'
      },
      {
        type: 'explainer', heading: 'Prismas → volumen', short: 'Prismas → volumen',
        title: 'Los prismas se pegan a la superficie',
        intro: 'Sigue la construcción con el domo $z = 16 - x^2 - 2y^2$ sobre el cuadrado $R = [0, 2] \\times [0, 2]$, usando el punto medio de cada celda.',
        diagram: 'c2s11-prisms',
        steps: [
          { text: 'La superficie $z = 16 - x^2 - 2y^2$ sobre el cuadrado $R = [0, 2] \\times [0, 2]$. Queremos el volumen que hay debajo.', state: { k: 0, m: 2 } },
          { text: 'Partimos $R$ en $2 \\times 2$ celdas: $\\Delta x = \\Delta y = 1$, así que $\\Delta A = 1$.', state: { k: 1, m: 2 } },
          { text: 'Sobre una celda levantamos un prisma de altura $f$ en su punto medio. El techo toca la superficie justo en ese punto; el volumen del prisma es $f(x^*, y^*)\\,\\Delta A$.', state: { k: 2, m: 2 } },
          { text: 'Los cuatro prismas: $(15.25 + 13.25 + 11.25 + 9.25)(1) = 49$.', state: { k: 3, m: 2 } },
          { text: 'Con $4 \\times 4$ celdas los prismas se pegan más a la superficie: la suma da $48.25$.', state: { k: 3, m: 4 } },
          { text: 'Con $8 \\times 8$, $48.0625$. En el límite, la suma es el volumen exacto: $\\iint_R f\\,dA = 48$.', state: { k: 3, m: 8 } }
        ]
      },
      {
        type: 'concept', heading: 'La integral doble y el diferencial de área', short: 'La integral doble',
        body: [
          'Si al refinar la cuadrícula ($m, n \\to \\infty$) las sumas se acercan a un número, sin importar qué punto de muestra uses, ese número es la <strong>integral doble</strong>: $$\\iint_R f(x, y)\\,dA = \\lim_{m, n \\to \\infty} \\sum_{i=1}^{m}\\sum_{j=1}^{n} f(x_i^*, y_j^*)\\,\\Delta A.$$ Si $f$ es continua en $R$, el límite siempre existe.',
          '$dA$ es el <strong>diferencial de área</strong>: lo que queda de $\\Delta A$ cuando la celda se vuelve infinitamente chica. En coordenadas rectangulares, $dA = dx\\,dy$. La integral doble es literalmente una suma infinita de pedacitos $f\\,dA$.',
          'Qué significa depende de $f$. Si $f \\ge 0$, es el <strong>volumen</strong> bajo la superficie. Si $f$ cambia de signo, es volumen con signo: lo de arriba del piso suma y lo de abajo resta. Si $f$ es una <strong>densidad</strong> (kg/m²), cada pedacito $f\\,dA$ es una masa y la integral es la <strong>masa total</strong> de la placa.'
        ]
      },
      {
        type: 'callout', heading: 'El punto de muestra importa… cada vez menos',
        body: [
          'Con pocas celdas, cada punto de muestra da una suma distinta. En el domo con $2 \\times 2$: la esquina inferior izquierda da $58$, la superior derecha $34$ y el punto medio $49$. Al refinar, las tres se acercan a $48$.',
          'El punto medio suele ganar: su error baja como $h^2$ (si partes las celdas a la mitad, el error baja a la cuarta parte), y el de las esquinas, como $h$ (solo a la mitad). Compruébalo en el lab con la gráfica de convergencia.'
        ]
      },
      {
        type: 'explainer', heading: 'Rebanadas: el teorema de Fubini', short: 'Rebanadas (Fubini)',
        title: 'El volumen como suma de rebanadas',
        intro: 'Para calcular la integral sin sumas infinitas, corta el sólido en rebanadas delgadas, como un pan de caja.',
        diagram: 'c2s11-slices',
        steps: [
          { text: 'Fija una $y$ y corta el sólido con ese plano. El corte es una región bajo la curva $z = f(x, y)$, con $x$ de $a$ a $b$. Su área es una integral de Cálculo 1: $A(y) = \\int_a^b f(x, y)\\,dx$.', state: { s1: 1, s2: 0, s3: 0, s4: 0 } },
          { text: 'Dale a la rebanada un grosor $dy$: su volumen es $A(y)\\,dy$.', state: { s1: 1, s2: 1, s3: 0, s4: 0 } },
          { text: 'Suma las rebanadas de $y = c$ a $y = d$: $\\iint_R f\\,dA = \\int_c^d A(y)\\,dy$. En el domo, $A(y) = \\tfrac{88}{3} - 4y^2$ y $\\int_0^2 A(y)\\,dy = 48$.', state: { s1: 0, s2: 0, s3: 1, s4: 0 } },
          { text: 'Rebanando con $x$ fija: $B(x) = \\int_0^2 f\\,dy = \\tfrac{80}{3} - 2x^2$ y $\\int_0^2 B(x)\\,dx = 48$ otra vez. El sólido es el mismo; solo cambió el cuchillo.', state: { s1: 0, s2: 0, s3: 0, s4: 1 } }
        ]
      },
      {
        type: 'concept', heading: 'Teorema de Fubini: integrales iteradas', short: 'Teorema de Fubini',
        body: [
          'Si $f$ es continua en $R = [a, b] \\times [c, d]$, $$\\iint_R f\\,dA = \\int_c^d\\!\\!\\int_a^b f(x, y)\\,dx\\,dy = \\int_a^b\\!\\!\\int_c^d f(x, y)\\,dy\\,dx.$$ A estas se les llama <strong>integrales iteradas</strong> y se resuelven de adentro hacia afuera.',
          'La de adentro se hace con la otra variable <strong>fija</strong>, como si fuera un número: en $\\int_a^b f(x, y)\\,dx$, la $y$ es constante. El resultado ya no tiene $x$: es una función de $y$ (el área de la rebanada). Luego integras esa función respecto a $y$.',
          'Cada par de límites va con su variable: el $dx$ de adentro lleva los límites de $x$ y el $dy$ de afuera, los de $y$. En un rectángulo el orden no cambia el resultado; elige el que deje más fácil la integral de adentro.'
        ]
      },
      {
        type: 'callout', heading: 'Propiedades que ahorran trabajo',
        body: [
          '<strong>Linealidad</strong>: $\\iint_R (\\alpha f + \\beta g)\\,dA = \\alpha\\iint_R f\\,dA + \\beta\\iint_R g\\,dA$. Puedes integrar término por término. Y una constante da un bloque: $\\iint_R k\\,dA = k \\cdot \\text{área}(R)$.',
          '<strong>Separable</strong>: si $f(x, y) = g(x)\\,h(y)$, en un rectángulo $$\\iint_R g(x)h(y)\\,dA = \\left(\\int_a^b g(x)\\,dx\\right)\\left(\\int_c^d h(y)\\,dy\\right).$$ Es un producto, no una suma: al integrar en $x$, la $h(y)$ sale como constante.',
          '<strong>Cotas</strong>: si $m \\le f \\le M$ en $R$, entonces $m \\cdot \\text{área} \\le \\iint_R f\\,dA \\le M \\cdot \\text{área}$. Sirve para saber si tu resultado tiene sentido.'
        ]
      },
      {
        type: 'concept', heading: 'Valor promedio', short: 'Valor promedio',
        body: [
          'En Cálculo 1, el promedio de $f$ en $[a, b]$ es $\\frac{1}{b - a}\\int_a^b f\\,dx$. Con dos variables divides entre el área: $$\\bar f = \\frac{1}{\\text{área}(R)}\\iint_R f(x, y)\\,dA.$$',
          'Geométricamente, $\\bar f$ es la altura del bloque plano sobre $R$ que tiene el mismo volumen que el sólido. En el domo, $\\bar f = 48/4 = 12$. Si $f$ es una temperatura, $\\bar f$ es la temperatura promedio de la placa.'
        ],
        diagram: 'c2s11-average',
        caption: 'El bloque de altura $\\bar f = 12$ y el domo tienen el mismo volumen, $48$.'
      },
      {
        type: 'recipe', heading: 'Receta: integral doble sobre un rectángulo', short: 'Receta',
        steps: [
          { text: 'Identifica $R$: de dónde a dónde va $x$ y de dónde a dónde va $y$.', tip: 'Escribe cada límite junto a su variable, $\\int_{y = c}^{d}\\int_{x = a}^{b}$, para no cruzarlos.' },
          { text: 'Elige el orden: el que deje más fácil la integral de adentro. Si $f = g(x)h(y)$, sepárala en un producto de dos integrales.' },
          { text: 'Integral de adentro: integra respecto a una variable con la otra fija, como constante, y evalúa entre sus límites.', tip: 'El resultado debe depender solo de la variable de afuera. Si todavía ves la de adentro, te falta evaluar.' },
          { text: 'Integral de afuera: integra ese resultado respecto a la otra variable, entre sus límites.', tip: 'No te detengas a medias: evaluar $A(y)$ en $d$ y en $c$ y restar no es integrar; falta $\\int_c^d A(y)\\,dy$.' },
          { text: 'Interpreta y revisa: volumen (con signo), masa o, entre el área, promedio. Comprueba que caiga entre $m \\cdot \\text{área}$ y $M \\cdot \\text{área}$.' }
        ]
      },
      {
        type: 'example', heading: 'Una suma de Riemann de 2 × 2',
        problem: '<p>Estima el volumen bajo $z = 16 - x^2 - 2y^2$ sobre $R = [0, 2] \\times [0, 2]$ con una suma de Riemann de $2 \\times 2$ celdas y el punto medio de cada celda.</p>',
        steps: [
          { text: 'Tamaño de las celdas.', math: '\\Delta x = \\frac{2 - 0}{2} = 1, \\quad \\Delta y = 1, \\quad \\Delta A = 1' },
          { text: 'Puntos medios: $x^*$ y $y^*$ valen $0.5$ o $1.5$. Evalúa $f$ en los cuatro.', math: '\\begin{gathered} f(0.5, 0.5) = 15.25 \\qquad f(1.5, 0.5) = 13.25 \\\\ f(0.5, 1.5) = 11.25 \\qquad f(1.5, 1.5) = 9.25 \\end{gathered}' },
          { text: 'Suma las alturas y multiplica por $\\Delta A$.', math: 'S_{2,2} = (15.25 + 13.25 + 11.25 + 9.25)(1) = 49' },
          { text: 'Compara: el valor exacto, que sale con Fubini, es $48$. Con las esquinas inferiores izquierdas habría salido $58$, y con las superiores derechas, $34$.' }
        ],
        answer: 'La suma con punto medio da $49$, a una unidad del volumen exacto, $48$.',
        verify: { lab: 'call', mod: 'dblint', fn: 'sum', math: true, args: ['16 - x^2 - 2y^2', 0, 2, 0, 2, 2, 2, 'mid'], values: { sum: 49, dA: 1, raw: 49 } }
      },
      {
        type: 'example', heading: 'Los dos órdenes de Fubini',
        problem: '<p>Calcula $\\displaystyle\\iint_R (x + 3y^2)\\,dA$ con $R = [0, 2] \\times [0, 1]$ en los dos órdenes.</p>',
        steps: [
          { text: 'Primero $x$, con $y$ fija.', math: '\\int_0^2 (x + 3y^2)\\,dx = \\Big[\\tfrac{x^2}{2} + 3y^2x\\Big]_0^2 = 2 + 6y^2' },
          { text: 'Luego $y$.', math: '\\int_0^1 (2 + 6y^2)\\,dy = \\big[2y + 2y^3\\big]_0^1 = 4' },
          { text: 'Al revés: primero $y$, con $x$ fija.', math: '\\int_0^1 (x + 3y^2)\\,dy = \\big[xy + y^3\\big]_0^1 = x + 1' },
          { text: 'Luego $x$.', math: '\\int_0^2 (x + 1)\\,dx = \\Big[\\tfrac{x^2}{2} + x\\Big]_0^2 = 4' }
        ],
        answer: 'Los dos órdenes dan $4$, como promete Fubini. $2 + 6y^2$ es el área de la rebanada con $y$ fija, y $x + 1$, la de la rebanada con $x$ fija.',
        verify: { lab: 'call', mod: 'dblint', fn: 'integral', math: true, args: ['x + 3y^2', 0, 2, 0, 1], values: { value: 4, area: 2, avg: 2 } }
      },
      {
        type: 'example', heading: 'Exponencial por seno: se separa',
        problem: '<p>Calcula $\\displaystyle\\iint_R e^{2x}\\sin y\\,dA$ con $R = [0, 1] \\times [0, \\pi]$.</p>',
        steps: [
          { text: 'Es un producto $g(x)h(y)$ sobre un rectángulo: se separa.', math: '\\iint_R e^{2x}\\sin y\\,dA = \\left(\\int_0^1 e^{2x}\\,dx\\right)\\left(\\int_0^{\\pi} \\sin y\\,dy\\right)' },
          { text: 'La de $x$.', math: '\\int_0^1 e^{2x}\\,dx = \\Big[\\tfrac{1}{2}e^{2x}\\Big]_0^1 = \\frac{e^2 - 1}{2}' },
          { text: 'La de $y$.', math: '\\int_0^{\\pi} \\sin y\\,dy = \\big[-\\cos y\\big]_0^{\\pi} = 1 - (-1) = 2' },
          { text: 'Multiplica.', math: '\\frac{e^2 - 1}{2}\\cdot 2 = e^2 - 1 \\approx ' + fx(Math.E * Math.E - 1) }
        ],
        answer: '$e^2 - 1 \\approx ' + fx(Math.E * Math.E - 1) + '$. Sin separar sale igual, con un paso más: la de adentro en $x$ deja $\\tfrac{e^2 - 1}{2}\\sin y$.',
        verify: { lab: 'call', mod: 'dblint', fn: 'integral', math: true, args: ['e^(2x)*sin(y)', 0, 1, 0, PI], values: { value: Math.E * Math.E - 1 } }
      },
      {
        type: 'example', heading: 'Temperatura promedio de una placa',
        problem: '<p>La temperatura de una placa es $T(x, y) = 20 + xy$ (en °C, con $x$ y $y$ en metros), para $0 \\le x \\le 4$ y $0 \\le y \\le 2$. ¿Cuál es su temperatura promedio?</p>',
        steps: [
          { text: 'Integra término por término (linealidad). La constante da un bloque y $xy$ se separa.', math: '\\iint_R 20\\,dA = 20 \\cdot 8 = 160 \\qquad \\iint_R xy\\,dA = \\left(\\int_0^4 x\\,dx\\right)\\left(\\int_0^2 y\\,dy\\right) = 8 \\cdot 2 = 16' },
          { text: 'Total.', math: '\\iint_R T\\,dA = 160 + 16 = 176' },
          { text: 'Divide entre el área, $4 \\cdot 2 = 8$.', math: '\\bar T = \\frac{176}{8} = 22\\ ^\\circ\\text{C}' }
        ],
        answer: 'La temperatura promedio es $22\\ ^\\circ\\text{C}$. Está entre la mínima ($20$, sobre los bordes $x = 0$ y $y = 0$) y la máxima ($28$, en la esquina $(4, 2)$), como debe ser.',
        verify: { lab: 'call', mod: 'dblint', fn: 'integral', math: true, args: ['20 + x*y', 0, 4, 0, 2], values: { value: 176, area: 8, avg: 22 } }
      },
      {
        type: 'example', heading: 'Masa de una placa con densidad',
        problem: '<p>Una placa ocupa $0 \\le x \\le 3$, $0 \\le y \\le 2$ (en metros) y su densidad es $\\rho(x, y) = 2 + x + y^2$ kg/m². ¿Cuál es su masa?</p>',
        steps: [
          { text: 'La masa es la integral de la densidad.', math: 'M = \\int_0^2\\!\\!\\int_0^3 (2 + x + y^2)\\,dx\\,dy' },
          { text: 'Adentro, con $y$ fija.', math: '\\int_0^3 (2 + x + y^2)\\,dx = 6 + \\tfrac{9}{2} + 3y^2 = \\tfrac{21}{2} + 3y^2' },
          { text: 'Afuera.', math: '\\int_0^2 \\left(\\tfrac{21}{2} + 3y^2\\right)dy = 21 + 8 = 29' }
        ],
        answer: 'La placa tiene $29$ kg. Revisa con las cotas: $\\rho$ va de $2$ a $9$ y el área es $6$, así que la masa debe estar entre $12$ y $54$.',
        verify: { lab: 'call', mod: 'dblint', fn: 'integral', math: true, args: ['2 + x + y^2', 0, 3, 0, 2], values: { value: 29, area: 6 } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué $dA = dx\\,dy$?', a: 'Porque la celda es un rectángulo de lados $\\Delta x$ y $\\Delta y$. Al hacerla infinitamente chica, su área $\\Delta x\\,\\Delta y$ se vuelve $dx\\,dy$. En otras coordenadas, como las polares, el pedacito de área tiene otra forma y $dA$ cambia.' },
          { q: 'En la integral de adentro, ¿qué hago con la otra variable?', a: 'La tratas como constante, igual que en las derivadas parciales (S04). En $\\int_0^2 xy^2\\,dx$, el $y^2$ sale de la integral: queda $y^2 \\cdot 2$.' },
          { q: '¿Importa el orden $dx\\,dy$ o $dy\\,dx$?', a: 'En un rectángulo, no: Fubini garantiza el mismo resultado. Lo que sí importa es que cada par de límites vaya con su variable. En regiones que no son rectángulos, el orden cambia los límites.' },
          { q: '¿Una integral doble siempre es un volumen?', a: 'Solo si $f \\ge 0$. Si $f$ es negativa en parte de $R$, esa parte resta. Y si $f$ es una densidad o una lluvia por metro cuadrado, la integral es una masa o el agua total.' },
          { q: '¿Por qué el separable es un producto y no una suma?', a: 'Porque al integrar en $x$, $h(y)$ es constante y sale: $\\int g(x)h(y)\\,dx = h(y)\\int g\\,dx$. Queda un número por $h(y)$, y al integrar en $y$ sale el producto de las dos integrales.' },
          { q: '¿Con cuántas celdas basta una suma de Riemann?', a: 'Depende de cuánto cambie $f$. Con el punto medio, el error baja a la cuarta parte cada vez que partes las celdas a la mitad. En el lab puedes ver cuántas hacen falta para dos decimales.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Suma de Riemann doble: $\\sum\\sum f(x_i^*, y_j^*)\\,\\Delta A$ con $\\Delta A = \\Delta x\\,\\Delta y$; su límite es $\\iint_R f\\,dA$.',
          'Fubini: $\\iint_R f\\,dA = \\int_c^d\\!\\int_a^b f\\,dx\\,dy = \\int_a^b\\!\\int_c^d f\\,dy\\,dx$; la de adentro, con la otra variable fija, es el área de una rebanada.',
          'Volumen si $f \\ge 0$, masa si $f$ es densidad, y promedio $\\bar f = \\frac{1}{\\text{área}}\\iint_R f\\,dA$.',
          'Linealidad y separables: $\\iint_R g(x)h(y)\\,dA = \\int_a^b g\\,dx \\cdot \\int_c^d h\\,dy$.'
        ]
      }
    ],

    lab: {
      type: 'double-riemann', title: 'Prismas → volumen',
      intro: 'Elige una superficie y el rectángulo $R$. Con los deslizadores $m$ y $n$ partes $R$ en celdas, y con el punto de muestra decides dónde se mide la altura de cada prisma. El mapa de calor muestra $f$ en cada celda y la gráfica, cómo se acerca la suma al valor exacto. Luego escribe la integral, la suma de esta cuadrícula o el valor promedio: el lab te dice si integraste solo respecto a una variable, si olvidaste $\\Delta A$, si cruzaste los límites, si usaste otro punto de muestra o si confundiste el promedio con la integral.',
      cfg: { start: 0 }
    },

    formulas: [
      { label: 'Celdas', tex: '\\Delta x = \\frac{b - a}{m},\\ \\ \\Delta y = \\frac{d - c}{n},\\ \\ \\Delta A = \\Delta x\\,\\Delta y' },
      { label: 'Suma de Riemann', tex: 'S_{m,n} = \\sum_{i}\\sum_{j} f(x_i^*, y_j^*)\\,\\Delta A' },
      { label: 'Integral doble', tex: '\\iint_R f\\,dA = \\lim_{m, n \\to \\infty} S_{m,n}' },
      { label: 'Fubini', tex: '\\iint_R f\\,dA = \\int_c^d\\!\\int_a^b f\\,dx\\,dy = \\int_a^b\\!\\int_c^d f\\,dy\\,dx' },
      { label: 'Separable', tex: '\\iint_R g(x)h(y)\\,dA = \\int_a^b g\\,dx \\cdot \\int_c^d h\\,dy' },
      { label: 'Valor promedio', tex: '\\bar f = \\frac{1}{\\text{área}(R)}\\iint_R f\\,dA' },
      { label: 'Masa', tex: 'M = \\iint_R \\rho(x, y)\\,dA' }
    ],

    exercises: [
      {
        id: 'c2-s11-riemann', title: 'Suma de Riemann de 2 × 2',
        vars: { A: [1, 4, 1], B: [1, 3, 1], a: [2, 6, 2], b: [2, 4, 2] },
        baseWhere: function (v) { return v.a * v.b !== 4; },
        prompt: function (v) { return '<p>Aproxima $\\displaystyle\\iint_R (' + co(v.A) + 'x + ' + co(v.B) + 'y^2)\\,dA$ con $R = [0, ' + v.a + '] \\times [0, ' + v.b + ']$ usando una suma de Riemann de $2 \\times 2$ celdas y el <strong>punto medio</strong> de cada celda.</p>'; },
        check: 'numeric',
        answer: function (v) { return mid22(v, 'mid').sum; },
        mistakes: {
          noDA: function (v) { return mid22(v, 'mid').raw; },
          corner: function (v) { return mid22(v, 'll').sum; },
          exact: function (v) { return v.A * v.a * v.a * v.b / 2 + v.B * v.a * Math.pow(v.b, 3) / 3; }
        },
        feedback: [
          { when: 'noDA', say: 'Sumaste solo las alturas. Cada prisma tiene volumen $f(x^*, y^*)\\,\\Delta A$: multiplica por $\\Delta A = \\Delta x\\,\\Delta y$.' },
          { when: 'corner', say: 'Usaste las esquinas inferiores izquierdas. Se pide el punto medio de cada celda.' },
          { when: 'exact', say: 'Ese es el valor exacto de la integral. Se pide la suma de Riemann con solo cuatro celdas.' }
        ],
        oracle: { lab: 'call', mod: 'dblint', fn: 'sum', math: true, field: 'sum', args: function (v) { return [v.A + '*x + ' + v.B + '*y^2', 0, v.a, 0, v.b, 2, 2, 'mid']; } },
        hint: '$\\Delta x = a/2$ y $\\Delta y = b/2$. Los puntos medios están en $x = \\tfrac{a}{4}, \\tfrac{3a}{4}$ y $y = \\tfrac{b}{4}, \\tfrac{3b}{4}$. Evalúa $f$ en los cuatro, suma y multiplica por $\\Delta A$.',
        solution: function (v) {
          var r = mid22(v, 'mid'), dx = v.a / 2, dy = v.b / 2;
          return '$\\Delta x = ' + fx(dx) + '$, $\\Delta y = ' + fx(dy) + '$, $\\Delta A = ' + fx(dx * dy) + '$. Puntos medios: $x \\in \\{' + fx(dx / 2) + ', ' + fx(1.5 * dx) + '\\}$, $y \\in \\{' + fx(dy / 2) + ', ' + fx(1.5 * dy) + '\\}$. La suma de las cuatro alturas es $' + fx(r.raw, 4) + '$, así que $$S_{2,2} = ' + fx(r.raw, 4) + ' \\cdot ' + fx(dx * dy) + ' = ' + fx(r.sum, 4) + '$$';
        }
      },
      {
        id: 'c2-s11-poly', title: 'Integral de un polinomio',
        vars: { A: [1, 4, 1], B: [1, 6, 1], a: [1, 3, 1], b: [1, 4, 1] },
        baseWhere: function (v) { return v.a !== v.b; },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\iint_R (' + co(v.A) + 'x^2 + ' + co(v.B) + 'y)\\,dA$ con $R = [0, ' + v.a + '] \\times [0, ' + v.b + ']$.</p>'; },
        check: 'numeric',
        answer: function (v) { return v.A * Math.pow(v.a, 3) * v.b / 3 + v.B * v.a * v.b * v.b / 2; },
        mistakes: {
          constY: function (v) { return v.A * Math.pow(v.a, 3) / 3 + v.B * v.a * v.b * v.b / 2; },
          swap: function (v) { return v.A * Math.pow(v.b, 3) * v.a / 3 + v.B * v.b * v.a * v.a / 2; },
          avg: function (v) { return (v.A * Math.pow(v.a, 3) * v.b / 3 + v.B * v.a * v.b * v.b / 2) / (v.a * v.b); }
        },
        feedback: [
          { when: 'constY', say: 'Al integrar en $y$ el término que ya no tiene $y$, es una constante: se multiplica por la longitud $b$ del intervalo de $y$.' },
          { when: 'swap', say: 'Cruzaste los límites: $x$ va de 0 a $a$ y $y$ de 0 a $b$. Escribe cada límite junto a su diferencial.' },
          { when: 'avg', say: 'Dividiste entre el área: eso es el valor promedio. Se pide la integral.' }
        ],
        oracle: { lab: 'call', mod: 'dblint', fn: 'integral', math: true, field: 'value', args: function (v) { return [v.A + '*x^2 + ' + v.B + '*y', 0, v.a, 0, v.b]; } },
        hint: 'Primero en $x$ con $y$ fija: $\\int_0^a (Ax^2 + By)\\,dx = \\tfrac{Aa^3}{3} + Bay$. Luego integra eso en $y$ de 0 a $b$.',
        solution: function (v) {
          var i1 = v.A * Math.pow(v.a, 3) / 3;
          return '$$\\int_0^{' + v.a + '} (' + co(v.A) + 'x^2 + ' + co(v.B) + 'y)\\,dx = ' + fx(i1, 4) + ' + ' + (v.B * v.a) + 'y$$ $$\\int_0^{' + v.b + '} (' + fx(i1, 4) + ' + ' + (v.B * v.a) + 'y)\\,dy = ' + fx(i1 * v.b, 4) + ' + ' + fx(v.B * v.a * v.b * v.b / 2, 4) + ' = ' + fx(i1 * v.b + v.B * v.a * v.b * v.b / 2, 4) + '$$';
        }
      },
      {
        id: 'c2-s11-separable', title: 'Exponencial por trigonométrica',
        vars: { k: [2, 3, 1], L: [0.5, 1.5, 0.5], t: [0, 1, 1], r: [0, 1, 1] },
        prompt: function (v) {
          var T = TRIG[v.t], Y = YR[v.r];
          return '<p>Calcula $\\displaystyle\\iint_R e^{' + co(v.k) + 'x}\\,' + T.tex + '\\,dA$ con $R = [0, ' + v.L + '] \\times [0, ' + Y.tex + ']$.</p>';
        },
        check: 'numeric',
        answer: function (v) { return (Math.exp(v.k * v.L) - 1) / v.k * TRIG[v.t].I(YR[v.r].val); },
        mistakes: {
          sum: function (v) { return (Math.exp(v.k * v.L) - 1) / v.k + TRIG[v.t].I(YR[v.r].val); },
          noK: function (v) { return (Math.exp(v.k * v.L) - 1) * TRIG[v.t].I(YR[v.r].val); }
        },
        baseWhere: function (v) { return v.k !== 1; },
        feedback: [
          { when: 'sum', say: 'Sumaste las dos integrales. Para $g(x)h(y)$ sobre un rectángulo se <strong>multiplican</strong>: $\\int g\\,dx \\cdot \\int h\\,dy$.' },
          { when: 'noK', say: 'Te faltó dividir entre $k$: $\\int e^{kx}\\,dx = \\tfrac{1}{k}e^{kx}$.' }
        ],
        oracle: { lab: 'call', mod: 'dblint', fn: 'integral', math: true, field: 'value', args: function (v) { return ['e^(' + v.k + '*x)*' + TRIG[v.t].src, 0, v.L, 0, YR[v.r].val]; } },
        hint: 'Separa: $\\left(\\int_0^L e^{kx}\\,dx\\right)\\left(\\int h(y)\\,dy\\right)$, con $\\int_0^L e^{kx}\\,dx = \\tfrac{e^{kL} - 1}{k}$.',
        solution: function (v) {
          var T = TRIG[v.t], Y = YR[v.r], gx = (Math.exp(v.k * v.L) - 1) / v.k, hy = T.I(Y.val);
          return '$$\\int_0^{' + v.L + '} e^{' + co(v.k) + 'x}\\,dx = \\frac{e^{' + fx(v.k * v.L) + '} - 1}{' + v.k + '} \\approx ' + fx(gx, 4) + ' \\qquad \\int_0^{' + Y.tex + '} ' + T.tex + '\\,dy = \\Big[' + T.anti + '\\Big]_0^{' + Y.tex + '} = ' + fx(hy, 4) + '$$ El producto: $' + fx(gx, 4) + ' \\cdot ' + fx(hy, 4) + ' \\approx ' + fx(gx * hy, 4) + '$.';
        }
      },
      {
        id: 'c2-s11-promedio', title: 'Temperatura promedio',
        vars: { T0: [10, 30, 5], k: [1, 3, 1], a: [1, 4, 1], b: [2, 6, 2] },
        prompt: function (v) { return '<p>La temperatura de una placa es $T(x, y) = ' + v.T0 + ' + ' + co(v.k) + 'x^2y$ (°C, con $x$ y $y$ en metros), para $0 \\le x \\le ' + v.a + '$ y $0 \\le y \\le ' + v.b + '$. ¿Cuál es su temperatura promedio?</p>'; },
        check: 'numeric', unit: '°C',
        answer: function (v) { return v.T0 + v.k * v.a * v.a * v.b / 6; },
        mistakes: {
          integral: function (v) { return (v.T0 + v.k * v.a * v.a * v.b / 6) * v.a * v.b; },
          center: function (v) { return v.T0 + v.k * (v.a / 2) * (v.a / 2) * (v.b / 2); }
        },
        feedback: [
          { when: 'integral', say: 'Esa es la integral $\\iint_R T\\,dA$. Para el promedio, divídela entre el área $ab$.' },
          { when: 'center', say: 'Esa es la temperatura en el centro de la placa. El promedio usa todos los puntos: $\\bar T = \\frac{1}{\\text{área}}\\iint_R T\\,dA$.' }
        ],
        oracle: { lab: 'call', mod: 'dblint', fn: 'integral', math: true, field: 'avg', args: function (v) { return [v.T0 + ' + ' + v.k + '*x^2*y', 0, v.a, 0, v.b]; } },
        hint: '$\\iint_R T\\,dA = T_0 \\cdot ab + k\\left(\\int_0^a x^2\\,dx\\right)\\left(\\int_0^b y\\,dy\\right)$; luego divide entre $ab$.',
        solution: function (v) {
          var A = v.a * v.b, I = v.T0 * A + v.k * Math.pow(v.a, 3) / 3 * v.b * v.b / 2;
          return '$$\\iint_R T\\,dA = ' + v.T0 + '(' + A + ') + ' + co(v.k) + '\\cdot\\frac{' + Math.pow(v.a, 3) + '}{3}\\cdot\\frac{' + v.b * v.b + '}{2} = ' + fx(I, 4) + '$$ $$\\bar T = \\frac{' + fx(I, 4) + '}{' + A + '} \\approx ' + fx(I / A) + '\\ ^\\circ\\text{C}$$';
        }
      },
      {
        id: 'c2-s11-masa', title: 'Masa de una placa',
        vars: { c0: [1, 5, 1], k: [1, 4, 1], a: [1, 4, 1], b: [1, 3, 1] },
        prompt: function (v) { return '<p>Una placa ocupa $0 \\le x \\le ' + v.a + '$, $0 \\le y \\le ' + v.b + '$ (en metros) y su densidad es $\\rho(x, y) = ' + v.c0 + ' + ' + co(v.k) + 'xy$ kg/m². ¿Cuál es su masa?</p>'; },
        check: 'numeric', unit: 'kg',
        answer: function (v) { return v.c0 * v.a * v.b + v.k * v.a * v.a * v.b * v.b / 4; },
        mistakes: {
          noArea: function (v) { return v.c0 + v.k * v.a * v.a * v.b * v.b / 4; },
          avg: function (v) { return (v.c0 * v.a * v.b + v.k * v.a * v.a * v.b * v.b / 4) / (v.a * v.b); }
        },
        feedback: [
          { when: 'noArea', say: 'La constante $c_0$ también se integra: $\\iint_R c_0\\,dA = c_0 \\cdot \\text{área}$.' },
          { when: 'avg', say: 'Dividiste entre el área: eso es la densidad promedio. La masa es la integral sin dividir.' }
        ],
        oracle: { lab: 'call', mod: 'dblint', fn: 'integral', math: true, field: 'value', args: function (v) { return [v.c0 + ' + ' + v.k + '*x*y', 0, v.a, 0, v.b]; } },
        hint: '$M = \\iint_R \\rho\\,dA$. Linealidad: $c_0 \\cdot \\text{área} + k\\left(\\int_0^a x\\,dx\\right)\\left(\\int_0^b y\\,dy\\right)$.',
        solution: function (v) {
          var A = v.a * v.b, P = v.k * v.a * v.a * v.b * v.b / 4;
          return '$$M = ' + v.c0 + '(' + A + ') + ' + co(v.k) + '\\cdot\\frac{' + v.a * v.a + '}{2}\\cdot\\frac{' + v.b * v.b + '}{2} = ' + v.c0 * A + ' + ' + fx(P, 4) + ' = ' + fx(v.c0 * A + P, 4) + '\\ \\text{kg}$$';
        }
      },
      {
        id: 'c2-s11-rebanada', title: 'Área de una rebanada',
        vars: { a: [1, 3, 1], k: [1, 5, 1], y0: [0.5, 2, 0.5] },
        prompt: function (v) { return '<p>El sólido bajo $z = x^2 + ' + co(v.k) + 'y$ sobre $R = [0, ' + v.a + '] \\times [0, 2]$ se corta con el plano $y = ' + v.y0 + '$. ¿Cuál es el área de esa rebanada, $A(' + v.y0 + ') = \\int_0^{' + v.a + '} f(x, ' + v.y0 + ')\\,dx$?</p>'; },
        check: 'numeric',
        answer: function (v) { return Math.pow(v.a, 3) / 3 + v.k * v.a * v.y0; },
        mistakes: {
          height: function (v) { return v.a * v.a + v.k * v.y0; },
          noY: function (v) { return Math.pow(v.a, 3) / 3; }
        },
        feedback: [
          { when: 'height', say: 'Esa es la altura $f(a, y_0)$ en la orilla, no el área. Integra $f(x, y_0)$ respecto a $x$.' },
          { when: 'noY', say: 'El término con $y$ también cuenta: con $y$ fija es una constante, y al integrar en $x$ se multiplica por la longitud $a$.' }
        ],
        oracle: { lab: 'call', mod: 'dblint', fn: 'slice', math: true, args: function (v) { return ['x^2 + ' + v.k + '*y', 0, v.a, 0, 2, 'x', v.y0]; } },
        hint: 'Con $y = y_0$ fija, $\\int_0^a (x^2 + ky_0)\\,dx = \\tfrac{a^3}{3} + ky_0\\,a$.',
        solution: function (v) { return '$$A(' + v.y0 + ') = \\int_0^{' + v.a + '} (x^2 + ' + fx(v.k * v.y0) + ')\\,dx = \\frac{' + Math.pow(v.a, 3) + '}{3} + ' + fx(v.k * v.y0) + '(' + v.a + ') \\approx ' + fx(Math.pow(v.a, 3) / 3 + v.k * v.a * v.y0) + '$$'; }
      },
      {
        id: 'c2-s11-volumen', title: 'Concepto: ¿cuál integral es el volumen?',
        vars: { a: [1, 3, 1], b: [1, 3, 1] },
        where: function (v) { return v.a !== v.b; },
        prompt: function (v) { return '<p>¿Qué expresión da el volumen bajo el plano $z = ' + (v.a + v.b + 2) + ' - x - y$ sobre el rectángulo $0 \\le x \\le ' + v.a + '$, $0 \\le y \\le ' + v.b + '$?</p>'; },
        check: 'choice',
        options: function (v) {
          var C = v.a + v.b + 2, f = '(' + C + ' - x - y)';
          return [
            { text: '$\\displaystyle\\int_0^{' + v.b + '}\\!\\!\\int_0^{' + v.a + '} ' + f + '\\,dx\\,dy$', correct: true },
            { text: '$\\displaystyle\\int_0^{' + v.a + '}\\!\\!\\int_0^{' + v.b + '} ' + f + '\\,dx\\,dy$', say: 'Límites cruzados: la integral de adentro es en $x$, así que lleva los límites de $x$ (de 0 a ' + v.a + ').' },
            { text: '$\\displaystyle\\int_0^{' + v.a + '} ' + f + '\\,dx$', say: 'Una sola integral deja una función de $y$ (el área de una rebanada), no el volumen.' },
            { text: '$\\displaystyle\\frac{1}{' + v.a * v.b + '}\\int_0^{' + v.b + '}\\!\\!\\int_0^{' + v.a + '} ' + f + '\\,dx\\,dy$', say: 'Dividir entre el área da la altura promedio, no el volumen.' }
          ];
        },
        answer: function (v) { return '$\\displaystyle\\int_0^{' + v.b + '}\\!\\!\\int_0^{' + v.a + '} (' + (v.a + v.b + 2) + ' - x - y)\\,dx\\,dy$'; },
        hint: 'La de adentro lleva los límites de la variable de su diferencial. ¿Cuál es el $dx$?',
        solution: function (v) { return 'El plano está arriba del piso en todo $R$ (su mínimo es $2$, en la esquina $(' + v.a + ', ' + v.b + ')$), así que el volumen es $\\iint_R f\\,dA$. Con $dx$ adentro, $x$ va de 0 a $' + v.a + '$; con $dy$ afuera, $y$ va de 0 a $' + v.b + '$. También valdría $\\int_0^{' + v.a + '}\\int_0^{' + v.b + '} f\\,dy\\,dx$.'; }
      },
      {
        id: 'c2-s11-adentro', title: 'Concepto: la integral de adentro',
        vars: {},
        prompt: function () { return '<p>En $\\displaystyle\\int_c^d\\!\\left(\\int_a^b f(x, y)\\,dx\\right)dy$ con $f \\ge 0$, ¿qué representa la integral de adentro para una $y$ fija?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'El área de la rebanada del sólido en esa $y$', correct: true },
            { text: 'El volumen total del sólido', say: 'Eso es toda la integral doble; la de adentro solo cubre una rebanada.' },
            { text: 'La altura de la superficie en $(x, y)$', say: 'La altura es $f(x, y)$; integrarla en $x$ suma alturas a lo largo de la rebanada: da un área.' },
            { text: 'El valor promedio de $f$ en $R$', say: 'El promedio necesita las dos integrales y dividir entre el área.' }
          ];
        },
        answer: function () { return 'El área de la rebanada del sólido en esa $y$'; },
        hint: 'Con $y$ fija, $f(x, y)$ es una curva de $x$. ¿Qué es la integral de una curva entre $a$ y $b$?',
        solution: function () { return 'Con $y$ fija, el plano corta al sólido en una región bajo la curva $z = f(x, y)$, de $x = a$ a $x = b$. Su área es $A(y) = \\int_a^b f(x, y)\\,dx$. Luego $\\int_c^d A(y)\\,dy$ suma las rebanadas.'; }
      }
    ],

    quiz: { tags: ['c2.S11'], count: 8 },

    errors: [
      'Integrar solo respecto a una variable y evaluar el resultado en los límites de la otra, en lugar de integrarlo.',
      'Olvidar multiplicar por $\\Delta A = \\Delta x\\,\\Delta y$ en una suma de Riemann.',
      'Cruzar los límites: poner los de $y$ en la integral de $dx$.',
      'Tratar como cero, en vez de constante, a la variable que está fija en la integral de adentro.',
      'Sumar las dos integrales de una función separable en lugar de multiplicarlas.',
      'Confundir el valor promedio (integral entre el área) con la integral, o con el valor de $f$ en el centro.'
    ],

    teacher: {
      plan: [
        'Arranca con la suma de rectángulos de Cálculo 1 y pregunta qué cambia si la base es un rectángulo.',
        'Explainer de los prismas: que vean la suma de 2 × 2 a mano (49) y cómo se acerca a 48.',
        'Explainer de las rebanadas y ejemplo de los dos órdenes en el pizarrón.',
        'Lab: comparar esquina contra punto medio en la gráfica de convergencia; cierra con el valor promedio.'
      ],
      check: [
        'Que escriban qué variable está fija en la integral de adentro y qué queda después de evaluarla.',
        'Que revisen su resultado con las cotas $m \\cdot \\text{área} \\le \\iint f\\,dA \\le M \\cdot \\text{área}$.'
      ],
      note: 'Las regiones que no son rectángulos, con límites variables, se dejan para S12.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §5.1 “Double Integrals over Rectangular Regions”. <a href="https://openstax.org/books/calculus-volume-3/pages/5-1-double-integrals-over-rectangular-regions">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 1</em>, §5.1 “Approximating Areas”. <a href="https://openstax.org/books/calculus-volume-1/pages/5-1-approximating-areas">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-10',
    next: 'sesion-12'
  };
  // Separación entre la respuesta y los errores típicos (relativa).
  data.exercises.forEach(function (ex) {
    if (ex.check !== 'numeric' || !ex.mistakes) return;
    ex.where = REL(ex);
  });
})();
