/* =====================================================================
   Cálculo 2 · S13 · Integral doble en coordenadas polares (bloque C · Integral múltiple).
   Fuente: OpenStax, Calculus Volume 3, §5.3 (CC BY-NC-SA 4.0).
   Ángulos en radianes; θ desde el eje x positivo, en sentido antihorario.
   Las respuestas se calculan aquí con sus fórmulas cerradas; scripts/examples.test.js
   las compara contra LabMath.polarElement, que integra numéricamente en polares
   (verify / oracle), y las pruebas del lab comparan eso contra una cuadratura en
   rectangulares sobre la misma región.
   ===================================================================== */
(function () {
  var PI = Math.PI;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString().replace('-', '−'); }
  function n(v) { return String(+v.toFixed(4)); }
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 0.5)) return false;
      }
      return true;
    };
  }

  // Ejemplos (fórmulas cerradas).
  var e1 = 8 * PI;                                      // ∬ (x² + y²) sobre x² + y² ≤ 4
  var e2 = PI / 3;                                      // un pétalo de r = 2 cos 3θ
  var e3 = PI * (1 - Math.exp(-4)) / 4;                 // cuarto de disco con e^(−(x² + y²))
  var e4 = 81 * PI / 2;                                 // bajo z = 9 − x² − y²
  var e5 = PI / 3 + Math.sqrt(3) / 2;                   // dentro de r = 2 cos θ, fuera de r = 1
  var e6 = 16 * PI;                                     // masa con δ = 3√(x² + y²), radio 2

  var data = window.SESSION_DATA = {
    slug: 'sesion-13', number: '13', group: 'C · Integral múltiple',
    title: 'Integral doble en coordenadas polares', temario: [],
    minutes: 180,
    quote: 'Una pizza no se corta en cuadritos: se corta en rebanadas y, si quieres, en anillos. Las regiones redondas se integran igual.',
    badges: [
      'Reconocer cuándo conviene pasar una integral doble a polares.',
      'Explicar de dónde sale el elemento de área dA = r dr dθ.',
      'Describir regiones polares (discos, anillos, sectores, pétalos, cardioides) con sus límites de r y θ.',
      'Convertir una integral rectangular a polar y usarla para áreas, volúmenes y masas.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'En una región redonda, en vez de cuadritos usa <strong>rebanadas y anillos</strong>. Cada pedacito mide $r\\,dr\\,d\\theta$, no $dr\\,d\\theta$.',
        recall: [
          'Coordenadas polares: $x = r\\cos\\theta$, $y = r\\sin\\theta$, $x^2 + y^2 = r^2$ y las curvas polares típicas (<a href="../sesion-02/">S02</a>).',
          'La integral doble como suma de pedacitos $f\\,\\Delta A$ y las integrales iteradas de Fubini (<a href="../sesion-11/">S11</a> y <a href="../sesion-12/">S12</a>).',
          'El área de un sector circular de radio $r$ y ángulo $\\theta$: $\\frac{1}{2}r^2\\theta$ (con $\\theta$ en radianes).',
          'Integrales de una variable: $\\int r^n\\,dr$, sustitución $u = r^2$ y $\\int \\cos^2 u\\,du = \\frac{u}{2} + \\frac{\\sin 2u}{4}$.'
        ],
        why: 'Discos, tubos, antenas, gotas, platos de radar, la luz de una lámpara sobre la mesa y la campana de Gauss de la estadística: todo lo que tiene simetría alrededor de un centro se integra en polares en un par de renglones, cuando en rectangulares sale una raíz tras otra.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en una <strong>pizza</strong>. Nadie la corta en cuadritos: los del borde saldrían mochos, cada uno de un tamaño distinto. Se corta en rebanadas desde el centro. Si además la cortas en anillos, cada pedazo queda entre dos rebanadas y dos circunferencias: eso es un <strong>rectángulo polar</strong>.',
          'Ahora fíjate en la <strong>diana</strong> de un tiro al blanco. Todos los anillos tienen el mismo ancho, pero el de afuera tiene mucha más área que el del centro, porque su circunferencia es más larga. Con los pedazos de pizza pasa igual: dos pedazos con el mismo ancho de anillo y la misma rebanada no miden lo mismo; el de afuera es más grande.',
          'Esa es toda la idea de la sesión: al pasar a polares, cada pedazo pesa según qué tan lejos está del centro. Por eso aparece un factor $r$ en el elemento de área. Si se te olvida, tratas igual a un pedazo del borde que a uno del centro, y la integral sale mal.'
        ]
      },
      {
        type: 'concept', heading: '¿Cuándo conviene pasar a polares?', short: 'Cuándo conviene',
        body: [
          'Integrar sobre el disco $x^2 + y^2 \\le 4$ en rectangulares obliga a escribir $-\\sqrt{4 - x^2} \\le y \\le \\sqrt{4 - x^2}$ y casi siempre a pelear con esas raíces. En polares el mismo disco es simplemente $0 \\le r \\le 2$, $0 \\le \\theta \\le 2\\pi$: límites constantes.',
          'Hay dos señales para cambiar a polares. La primera es la <strong>región</strong>: discos, anillos, sectores, pétalos, cardioides o cualquier cosa limitada por circunferencias y rayos. La segunda es el <strong>integrando</strong>: si trae $x^2 + y^2$, como $e^{-(x^2 + y^2)}$ o $\\sqrt{x^2 + y^2}$, en polares se vuelve $r^2$ y la integral se simplifica.'
        ],
        diagram: 'c2s13-why',
        caption: 'Con cuadritos, los del borde (marcados) no encajan. Con rebanadas y anillos, la malla sigue al borde exacto.'
      },
      {
        type: 'explainer', heading: 'De dónde sale la r', short: 'El elemento r dr dθ',
        title: 'Área de un rectángulo polar',
        intro: 'Parte la región con circunferencias $r = $ constante (cada $\\Delta r$) y rayos $\\theta = $ constante (cada $\\Delta\\theta$). Calcula el área de un pedazo con lo que ya sabes de sectores:',
        diagram: 'c2s13-element',
        steps: [
          { text: 'La malla polar parte la región en <strong>rectángulos polares</strong>: cada uno está entre dos circunferencias y dos rayos.', state: { k: 0 } },
          { text: 'El pedazo resaltado es un sector grande (radio $r + \\Delta r$) menos uno chico (radio $r$). Con el área de un sector, $\\frac{1}{2}R^2\\Delta\\theta$: $$\\Delta A = \\tfrac{1}{2}(r + \\Delta r)^2\\Delta\\theta - \\tfrac{1}{2}r^2\\Delta\\theta$$', state: { k: 1 } },
          { text: 'Desarrolla el cuadrado: $\\Delta A = \\left(r + \\frac{\\Delta r}{2}\\right)\\Delta r\\,\\Delta\\theta = r^*\\,\\Delta r\\,\\Delta\\theta$, con $r^*$ el radio de en medio. Es como un rectángulo de lados $\\Delta r$ y $r^*\\Delta\\theta$ (la longitud del arco).', state: { k: 2 } },
          { text: 'Compara con un pedazo cerca del origen: mismos $\\Delta r$ y $\\Delta\\theta$, pero $r^* = 1.5$ en vez de $3.5$. Mide menos de la mitad. El área de un rectángulo polar <strong>depende de qué tan lejos está</strong>.', state: { k: 3 } },
          { text: 'Al hacer los pedazos cada vez más chicos, la suma $\\sum f(r^*, \\theta^*)\\,r^*\\,\\Delta r\\,\\Delta\\theta$ se vuelve la integral, y el elemento de área es $$dA = r\\,dr\\,d\\theta$$', state: { k: 4 } }
        ]
      },
      {
        type: 'callout', heading: 'Tu primer Jacobiano',
        body: [
          'El factor $r$ mide cuánto se estira un pedazo $dr\\,d\\theta$ al llevarlo al plano $xy$. A ese factor de estiramiento se le llama <strong>Jacobiano</strong> del cambio de variables.',
          'En S15 vas a ver otros dos: en cilíndricas es otra vez $r$ ($dV = r\\,dr\\,d\\theta\\,dz$) y en esféricas es $\\rho^2\\sin\\varphi$ ($dV = \\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi$). La idea es la misma: medir el tamaño real del pedacito.'
        ]
      },
      {
        type: 'concept', heading: 'Regiones polares y la fórmula', short: 'Regiones polares',
        body: [
          'El caso más sencillo es un <strong>rectángulo polar</strong>: $a \\le r \\le b$, $\\alpha \\le \\theta \\le \\beta$. Ahí todos los límites son constantes. Si además el integrando se separa como $g(r)\\,h(\\theta)$, la integral es el producto de dos integrales de una variable.',
          'En una <strong>región polar general</strong>, $\\theta$ va de un rayo a otro y, para cada $\\theta$, $r$ va de la curva de adentro $r_1(\\theta)$ a la de afuera $r_2(\\theta)$: $$\\iint_R f(x, y)\\,dA = \\int_{\\alpha}^{\\beta}\\!\\int_{r_1(\\theta)}^{r_2(\\theta)} f(r\\cos\\theta,\\ r\\sin\\theta)\\,r\\,dr\\,d\\theta$$',
          'Para leer los límites, imagina un rayo que sale del origen con ángulo $\\theta$: donde entra a la región está $r_1$ y donde sale está $r_2$. Los valores de $\\theta$ que sí tocan la región son los límites de afuera.'
        ],
        list: [
          'Disco de radio $a$: $0 \\le r \\le a$, $0 \\le \\theta \\le 2\\pi$.',
          'Anillo: $a \\le r \\le b$, $0 \\le \\theta \\le 2\\pi$.',
          'Sector: $0 \\le r \\le a$ entre dos rayos, $\\alpha \\le \\theta \\le \\beta$.',
          'Disco que pasa por el origen, $(x - a)^2 + y^2 \\le a^2$: $0 \\le r \\le 2a\\cos\\theta$, $-\\frac{\\pi}{2} \\le \\theta \\le \\frac{\\pi}{2}$.'
        ],
        diagram: 'c2s13-region',
        caption: 'Para cada $\\theta$ entre $\\alpha$ y $\\beta$, la flecha va de $r_1(\\theta)$ a $r_2(\\theta)$.'
      },
      {
        type: 'concept', heading: 'Áreas de regiones polares', short: 'Áreas polares',
        body: [
          'Con $f = 1$, la integral doble da el área. La integral de adentro se hace sola: $\\int_{r_1}^{r_2} r\\,dr = \\frac{1}{2}(r_2^2 - r_1^2)$. Queda la fórmula del área polar: $$A = \\frac{1}{2}\\int_{\\alpha}^{\\beta}\\left[r_2(\\theta)^2 - r_1(\\theta)^2\\right]d\\theta$$',
          'Si la región empieza en el origen ($r_1 = 0$), es $A = \\frac{1}{2}\\int_{\\alpha}^{\\beta} r^2\\,d\\theta$: la suma de sectores delgaditos de área $\\frac{1}{2}r^2\\,d\\theta$.',
          'El cuidado está en los límites de $\\theta$. Un pétalo de $r = a\\cos n\\theta$ nace y muere en el origen, así que va entre dos ceros consecutivos de $\\cos n\\theta$: de $-\\frac{\\pi}{2n}$ a $\\frac{\\pi}{2n}$. Si integras de $0$ a $2\\pi$, te llevas todos los pétalos, y con $n$ impar cada uno <strong>dos veces</strong>.'
        ],
        list: [
          'Un pétalo de $r = a\\cos n\\theta$: $A = \\frac{\\pi a^2}{4n}$.',
          'Cardioide $r = a(1 + \\cos\\theta)$: $A = \\frac{3\\pi a^2}{2}$.',
          'Entre dos curvas: encuentra dónde se cruzan (iguala las $r$) para tener los límites de $\\theta$, y resta los cuadrados.'
        ],
        diagram: 'c2s13-petal',
        caption: 'El pétalo sombreado de $r = 2\\cos 3\\theta$ va de $\\theta = -\\frac{\\pi}{6}$ a $\\theta = \\frac{\\pi}{6}$, donde $r = 0$.'
      },
      {
        type: 'concept', heading: 'Convertir una integral rectangular', short: 'Convertir',
        body: [
          'Para pasar $\\int\\!\\int f\\,dy\\,dx$ a polares, <strong>dibuja primero la región</strong> a partir de los límites rectangulares. Luego descríbela con $r$ y $\\theta$, cambia $x = r\\cos\\theta$, $y = r\\sin\\theta$ en el integrando y escribe $dy\\,dx = r\\,dr\\,d\\theta$.',
          'Por ejemplo, $0 \\le x \\le 2$ y $0 \\le y \\le \\sqrt{4 - x^2}$ es el cuarto de disco de radio 2 en el primer cuadrante: $y = \\sqrt{4 - x^2}$ es la mitad de arriba de $x^2 + y^2 = 4$. En polares es $0 \\le r \\le 2$, $0 \\le \\theta \\le \\frac{\\pi}{2}$.'
        ],
        diagram: 'c2s13-convert',
        caption: 'La misma región, recorrida con tiras verticales (rectangulares) o con rayos desde el origen (polares).'
      },
      {
        type: 'concept', heading: 'Aplicación estrella: la integral de Gauss', short: 'La integral de Gauss',
        body: [
          'La función $e^{-x^2}$ no tiene antiderivada con funciones elementales, y aun así se puede calcular $I = \\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx$. El truco es elevarla al cuadrado: $I^2 = \\int e^{-x^2}dx \\int e^{-y^2}dy = \\iint_{\\mathbb{R}^2} e^{-(x^2 + y^2)}\\,dA$.',
          'En polares el plano entero es $0 \\le r < \\infty$, $0 \\le \\theta \\le 2\\pi$, y la $r$ del elemento hace que la integral salga con la sustitución $u = r^2$: $$I^2 = \\int_0^{2\\pi}\\!\\int_0^{\\infty} e^{-r^2}\\,r\\,dr\\,d\\theta = 2\\pi\\cdot\\tfrac{1}{2} = \\pi \\quad\\Rightarrow\\quad I = \\sqrt{\\pi}$$',
          'Sin la $r$ no habría salida: $\\int e^{-r^2}dr$ es el mismo problema del principio. Este resultado es la base de la distribución normal (la campana de Gauss) en estadística.'
        ],
        diagram: 'c2s13-gauss',
        caption: 'Para hacerlo con cuidado se integra sobre el cuadrado $[-R, R]^2$, que queda entre dos discos; al crecer $R$ ambos dan $\\pi$.'
      },
      {
        type: 'recipe', heading: 'Receta: una integral doble en polares', short: 'Receta',
        steps: [
          { text: 'Dibuja la región. Si son circunferencias, rayos o curvas polares, o si el integrando trae $x^2 + y^2$, conviene polares.' },
          { text: 'Encuentra los límites de $\\theta$: los rayos que encierran la región.', tip: 'En un pétalo, $\\theta$ va entre dos ceros consecutivos de $r$, no de $0$ a $2\\pi$. Si dos curvas se cruzan, iguala las $r$ para hallar el ángulo.' },
          { text: 'Para cada $\\theta$, $r$ va de la curva de adentro a la de afuera: $r_1(\\theta) \\le r \\le r_2(\\theta)$.' },
          { text: 'Cambia el integrando con $x = r\\cos\\theta$, $y = r\\sin\\theta$, $x^2 + y^2 = r^2$, y escribe $dA = r\\,dr\\,d\\theta$.', tip: 'La $r$ del elemento va <strong>siempre</strong>, aunque el integrando ya traiga $r$. Por ejemplo, $\\iint (x^2 + y^2)\\,dA$ lleva $r^2 \\cdot r = r^3$.' },
          { text: 'Integra primero en $r$ (con $\\theta$ fija) y luego en $\\theta$. Revisa que el resultado tenga sentido: un área positiva, un volumen menor que el de un cilindro que lo contiene.' }
        ]
      },
      {
        type: 'example', heading: 'Sobre un disco con x² + y²',
        problem: '<p>Calcula $\\displaystyle\\iint_D (x^2 + y^2)\\,dA$, donde $D$ es el disco $x^2 + y^2 \\le 4$.</p>',
        steps: [
          { text: 'La región es un disco de radio 2 y el integrando es $x^2 + y^2 = r^2$: polares.', math: '0 \\le r \\le 2, \\qquad 0 \\le \\theta \\le 2\\pi' },
          { text: 'Escribe la integral con $dA = r\\,dr\\,d\\theta$. El integrando $r^2$ por la $r$ del elemento da $r^3$.', math: '\\int_0^{2\\pi}\\!\\int_0^{2} r^2 \\cdot r\\,dr\\,d\\theta = \\int_0^{2\\pi}\\!\\int_0^{2} r^3\\,dr\\,d\\theta' },
          { text: 'Integra en $r$.', math: '\\int_0^{2} r^3\\,dr = \\frac{r^4}{4}\\Big|_0^2 = 4' },
          { text: 'Integra en $\\theta$: la integral de adentro no depende de $\\theta$.', math: '\\int_0^{2\\pi} 4\\,d\\theta = 8\\pi \\approx ' + fx(e1) }
        ],
        answer: '$\\displaystyle\\iint_D (x^2 + y^2)\\,dA = 8\\pi \\approx ' + fx(e1) + '$. Sin la $r$ del elemento te habría salido $\\frac{16\\pi}{3}$.',
        verify: { lab: 'call', mod: 'polarElement', fn: 'integral', args: ['disk', { a: 2 }, 'r2', {}], value: e1 }
      },
      {
        type: 'example', heading: 'Área de un pétalo de rosa',
        problem: '<p>Encuentra el área de un pétalo de la rosa $r = 2\\cos 3\\theta$.</p>',
        steps: [
          { text: 'El pétalo sobre el eje $x$ nace y muere en el origen: $\\cos 3\\theta = 0$ en $3\\theta = \\pm\\frac{\\pi}{2}$.', math: '-\\frac{\\pi}{6} \\le \\theta \\le \\frac{\\pi}{6}, \\qquad 0 \\le r \\le 2\\cos 3\\theta' },
          { text: 'Con la fórmula del área polar ($r_1 = 0$):', math: 'A = \\frac{1}{2}\\int_{-\\pi/6}^{\\pi/6} (2\\cos 3\\theta)^2\\,d\\theta = \\int_{-\\pi/6}^{\\pi/6} 2\\cos^2 3\\theta\\,d\\theta' },
          { text: 'Usa $2\\cos^2 u = 1 + \\cos 2u$.', math: 'A = \\int_{-\\pi/6}^{\\pi/6} (1 + \\cos 6\\theta)\\,d\\theta = \\left[\\theta + \\frac{\\sin 6\\theta}{6}\\right]_{-\\pi/6}^{\\pi/6}' },
          { text: 'El seno vale cero en los dos extremos.', math: 'A = \\frac{\\pi}{6} + \\frac{\\pi}{6} = \\frac{\\pi}{3} \\approx ' + fx(e2) }
        ],
        answer: 'Cada pétalo mide $\\frac{\\pi}{3} \\approx ' + fx(e2) + '$. Si hubieras integrado de $0$ a $2\\pi$ te saldría $2\\pi$: los tres pétalos, cada uno contado dos veces.',
        verify: { lab: 'call', mod: 'polarElement', fn: 'area', args: ['petal', { a: 2, n: 3 }], value: e2 }
      },
      {
        type: 'example', heading: 'Convertir y evaluar',
        problem: '<p>Evalúa $\\displaystyle\\int_0^2\\!\\int_0^{\\sqrt{4 - x^2}} e^{-(x^2 + y^2)}\\,dy\\,dx$ pasando a polares.</p>',
        steps: [
          { text: 'Dibuja la región: $0 \\le x \\le 2$ y, para cada $x$, $y$ de $0$ a $\\sqrt{4 - x^2}$. Es el cuarto de disco de radio 2 en el primer cuadrante.', math: '0 \\le r \\le 2, \\qquad 0 \\le \\theta \\le \\frac{\\pi}{2}' },
          { text: 'Cambia el integrando y el elemento: $e^{-(x^2 + y^2)} = e^{-r^2}$ y $dy\\,dx = r\\,dr\\,d\\theta$.', math: '\\int_0^{\\pi/2}\\!\\int_0^{2} e^{-r^2}\\,r\\,dr\\,d\\theta' },
          { text: 'La $r$ del elemento permite la sustitución $u = r^2$, $du = 2r\\,dr$.', math: '\\int_0^{2} e^{-r^2}\\,r\\,dr = \\left[-\\tfrac{1}{2}e^{-r^2}\\right]_0^2 = \\tfrac{1}{2}\\left(1 - e^{-4}\\right)' },
          { text: 'Multiplica por la longitud del intervalo de $\\theta$.', math: '\\frac{\\pi}{2}\\cdot\\tfrac{1}{2}\\left(1 - e^{-4}\\right) = \\frac{\\pi}{4}\\left(1 - e^{-4}\\right) \\approx ' + fx(e3) }
        ],
        answer: '$\\frac{\\pi}{4}\\left(1 - e^{-4}\\right) \\approx ' + fx(e3) + '$. En rectangulares esta integral no se puede hacer a mano.',
        verify: { lab: 'call', mod: 'polarElement', fn: 'integral', args: ['sector', { a: 2, t0: 0, t1: PI / 2 }, 'gauss', {}], value: e3 }
      },
      {
        type: 'example', heading: 'Volumen bajo un paraboloide',
        problem: '<p>Encuentra el volumen del sólido bajo el paraboloide $z = 9 - x^2 - y^2$ y arriba del plano $xy$.</p>',
        steps: [
          { text: 'El paraboloide toca el plano $xy$ donde $9 - x^2 - y^2 = 0$: la circunferencia de radio 3. La base es el disco $x^2 + y^2 \\le 9$.', math: '0 \\le r \\le 3, \\qquad 0 \\le \\theta \\le 2\\pi' },
          { text: 'El volumen es $\\iint (\\text{altura})\\,dA$, con altura $9 - r^2$.', math: 'V = \\int_0^{2\\pi}\\!\\int_0^{3} (9 - r^2)\\,r\\,dr\\,d\\theta' },
          { text: 'Integra en $r$.', math: '\\int_0^{3} (9r - r^3)\\,dr = \\left[\\frac{9r^2}{2} - \\frac{r^4}{4}\\right]_0^3 = \\frac{81}{2} - \\frac{81}{4} = \\frac{81}{4}' },
          { text: 'Multiplica por $2\\pi$.', math: 'V = 2\\pi\\cdot\\frac{81}{4} = \\frac{81\\pi}{2} \\approx ' + fx(e4) }
        ],
        answer: '$V = \\frac{81\\pi}{2} \\approx ' + fx(e4) + '$, justo la mitad del cilindro de radio 3 y altura 9 que lo contiene.',
        verify: { lab: 'call', mod: 'polarElement', fn: 'integral', args: ['disk', { a: 3 }, 'para', { c: 9 }], value: e4 }
      },
      {
        type: 'example', heading: 'Área entre dos círculos',
        problem: '<p>Encuentra el área de la región que está dentro del círculo $r = 2\\cos\\theta$ y fuera del círculo $r = 1$.</p>',
        steps: [
          { text: 'Iguala las $r$ para ver dónde se cruzan: $2\\cos\\theta = 1$, o sea $\\cos\\theta = \\frac{1}{2}$.', math: '\\theta = \\pm\\frac{\\pi}{3}' },
          { text: 'Entre esos rayos, un rayo desde el origen entra por $r = 1$ y sale por $r = 2\\cos\\theta$.', math: '1 \\le r \\le 2\\cos\\theta, \\qquad -\\frac{\\pi}{3} \\le \\theta \\le \\frac{\\pi}{3}' },
          { text: 'Fórmula del área con dos curvas.', math: 'A = \\frac{1}{2}\\int_{-\\pi/3}^{\\pi/3} \\left(4\\cos^2\\theta - 1\\right)d\\theta = \\frac{1}{2}\\int_{-\\pi/3}^{\\pi/3} \\left(1 + 2\\cos 2\\theta\\right)d\\theta' },
          { text: 'Integra.', math: 'A = \\frac{1}{2}\\left[\\theta + \\sin 2\\theta\\right]_{-\\pi/3}^{\\pi/3} = \\frac{1}{2}\\left(\\frac{2\\pi}{3} + \\sqrt{3}\\right) = \\frac{\\pi}{3} + \\frac{\\sqrt{3}}{2} \\approx ' + fx(e5) }
        ],
        answer: '$A = \\frac{\\pi}{3} + \\frac{\\sqrt{3}}{2} \\approx ' + fx(e5) + '$.',
        verify: { lab: 'call', mod: 'polarElement', fn: 'area', args: ['between', { a: 1 }], value: e5 }
      },
      {
        type: 'example', heading: 'Masa de un disco con densidad radial',
        problem: '<p>Una placa circular de radio $2$ m tiene densidad $\\delta(x, y) = 3\\sqrt{x^2 + y^2}$ kg/m²: es más pesada hacia el borde. Encuentra su masa.</p>',
        steps: [
          { text: 'La masa es $\\iint \\delta\\,dA$. En polares, $\\delta = 3r$.', math: 'M = \\int_0^{2\\pi}\\!\\int_0^{2} 3r\\cdot r\\,dr\\,d\\theta = \\int_0^{2\\pi}\\!\\int_0^{2} 3r^2\\,dr\\,d\\theta' },
          { text: 'Integra en $r$.', math: '\\int_0^{2} 3r^2\\,dr = r^3\\Big|_0^2 = 8' },
          { text: 'Integra en $\\theta$.', math: 'M = 8\\cdot 2\\pi = 16\\pi \\approx ' + fx(e6) + '\\text{ kg}' }
        ],
        answer: '$M = 16\\pi \\approx ' + fx(e6) + '$ kg. Si la densidad del borde (6 kg/m²) fuera la de toda la placa, saldría $24\\pi$: de más, porque adentro es más ligera.',
        verify: { lab: 'call', mod: 'polarElement', fn: 'integral', args: ['disk', { a: 2 }, 'r', { k: 3 }], value: e6 }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué aparece la r si en rectangulares no había nada?', a: 'En rectangulares todos los cuadritos $\\Delta x\\,\\Delta y$ miden lo mismo. En polares no: el pedazo entre $r$ y $r + \\Delta r$ mide $r^*\\Delta r\\,\\Delta\\theta$, más grande entre más lejos esté. La $r$ corrige ese tamaño.' },
          { q: 'Si el integrando ya trae r, ¿todavía agrego la del elemento?', a: 'Sí, siempre. La $r$ del integrando viene de $f$; la del elemento viene de $dA$. Por ejemplo $\\iint \\sqrt{x^2 + y^2}\\,dA$ lleva $r\\cdot r = r^2$.' },
          { q: '¿En qué orden integro?', a: 'Casi siempre primero $r$ (de $r_1(\\theta)$ a $r_2(\\theta)$) y luego $\\theta$ (con límites constantes). Los límites de la integral de afuera nunca dependen de la variable de adentro.' },
          { q: '¿Cómo sé los límites de θ en un pétalo?', a: 'Busca dónde $r = 0$: el pétalo va entre dos ceros consecutivos. Para $r = a\\cos n\\theta$, de $-\\frac{\\pi}{2n}$ a $\\frac{\\pi}{2n}$. De $0$ a $2\\pi$ te llevas todos los pétalos.' },
          { q: '¿Por qué el área polar tiene un ½?', a: 'Porque $\\int_0^{R} r\\,dr = \\frac{1}{2}R^2$. Es el ½ del área de un sector, $\\frac{1}{2}R^2\\theta$. Si se te olvida, el área sale al doble.' },
          { q: '¿Siempre conviene pasar a polares?', a: 'No. Un rectángulo, un triángulo o una región entre parábolas son más fáciles en rectangulares. Polares conviene cuando la región es redonda o el integrando trae $x^2 + y^2$.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Pasa a polares cuando la región es redonda (discos, anillos, sectores, pétalos) o el integrando trae $x^2 + y^2$.',
          'El elemento de área es $dA = r\\,dr\\,d\\theta$: un rectángulo polar mide $r^*\\Delta r\\,\\Delta\\theta$, más grande lejos del origen.',
          '$\\iint_R f\\,dA = \\int_\\alpha^\\beta \\int_{r_1(\\theta)}^{r_2(\\theta)} f(r\\cos\\theta, r\\sin\\theta)\\,r\\,dr\\,d\\theta$, con $\\theta$ entre los rayos y $r$ de la curva de adentro a la de afuera.',
          'Área polar: $A = \\frac{1}{2}\\int_\\alpha^\\beta (r_2^2 - r_1^2)\\,d\\theta$; y $\\int_{-\\infty}^{\\infty} e^{-x^2}dx = \\sqrt{\\pi}$ sale gracias a la $r$.'
        ]
      }
    ],

    lab: {
      type: 'polar-element', title: 'Elemento r dr dθ',
      intro: 'Elige una región y una función. La malla polar cubre la región con rectángulos polares, dibujados con su forma real: con los mismos $\\Delta r$ y $\\Delta\\theta$, mira cómo crece el área del resaltado al moverlo hacia afuera. Sube las divisiones para ver la suma $\\sum f\\,r^*\\Delta r\\,\\Delta\\theta$ acercarse al valor exacto, y activa «olvidar la r» para ver a dónde se va la suma sin ese factor. En el reto, escribe el valor de la integral: el lab la compara con una integral calculada en <strong>rectangulares</strong> sobre la misma región y te dice si olvidaste la $r$, usaste $r^2$, te equivocaste en los límites de $\\theta$ o te salió la mitad o el doble.',
      cfg: { start: 0, f: 1 }
    },

    formulas: [
      { label: 'Elemento de área', tex: 'dA = r\\,dr\\,d\\theta' },
      { label: 'Integral en polares', tex: '\\int_\\alpha^\\beta\\!\\int_{r_1(\\theta)}^{r_2(\\theta)} f(r\\cos\\theta, r\\sin\\theta)\\,r\\,dr\\,d\\theta' },
      { label: 'Área polar', tex: 'A = \\tfrac{1}{2}\\int_\\alpha^\\beta (r_2^2 - r_1^2)\\,d\\theta' },
      { label: 'Rectángulo polar', tex: '\\Delta A = r^*\\,\\Delta r\\,\\Delta\\theta' },
      { label: 'Cambio', tex: 'x = r\\cos\\theta,\\ y = r\\sin\\theta,\\ x^2 + y^2 = r^2' },
      { label: 'Gauss', tex: '\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}' },
      { label: 'Un pétalo de r = a cos nθ', tex: '-\\tfrac{\\pi}{2n} \\le \\theta \\le \\tfrac{\\pi}{2n},\\ A = \\tfrac{\\pi a^2}{4n}' }
    ],

    exercises: [
      {
        id: 'c2-s13-disco-r2', title: 'Sobre un disco',
        vars: { a: [1, 4, 0.5] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\iint_D (x^2 + y^2)\\,dA$, donde $D$ es el disco $x^2 + y^2 \\le ' + n(v.a * v.a) + '$.</p>'; },
        check: 'numeric',
        answer: function (v) { return PI * Math.pow(v.a, 4) / 2; },
        mistakes: {
          forgot: function (v) { return 2 * PI * Math.pow(v.a, 3) / 3; },
          rsq: function (v) { return 2 * PI * Math.pow(v.a, 5) / 5; },
          halfTurn: function (v) { return PI * Math.pow(v.a, 4) / 4; }
        },
        feedback: [
          { when: 'forgot', say: 'Olvidaste la $r$ del elemento: el integrando $r^2$ por $dA = r\\,dr\\,d\\theta$ da $r^3$, no $r^2$.' },
          { when: 'rsq', say: 'Te sobró una $r$: $r^2 \\cdot r = r^3$, no $r^4$.' },
          { when: 'halfTurn', say: 'Ese es medio disco: el disco completo pide $0 \\le \\theta \\le 2\\pi$.' }
        ],
        oracle: { lab: 'call', mod: 'polarElement', fn: 'integral', args: function (v) { return ['disk', { a: v.a }, 'r2', {}]; } },
        hint: 'En polares: $0 \\le r \\le a$, $0 \\le \\theta \\le 2\\pi$ y el integrando $r^2$ por la $r$ del elemento.',
        solution: function (v) { return '$$\\int_0^{2\\pi}\\!\\int_0^{' + n(v.a) + '} r^3\\,dr\\,d\\theta = 2\\pi\\cdot\\frac{' + n(v.a) + '^4}{4} = \\frac{\\pi(' + n(v.a) + ')^4}{2} \\approx ' + fx(PI * Math.pow(v.a, 4) / 2) + '$$'; }
      },
      {
        id: 'c2-s13-gauss', title: 'La campana sobre un disco',
        vars: { a: [1, 3, 0.5] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\iint_D e^{-(x^2 + y^2)}\\,dA$, donde $D$ es el disco de radio $' + n(v.a) + '$ centrado en el origen. Redondea a 2 decimales.</p>'; },
        check: 'numeric',
        answer: function (v) { return PI * (1 - Math.exp(-v.a * v.a)); },
        mistakes: {
          noHalf: function (v) { return 2 * PI * (1 - Math.exp(-v.a * v.a)); },
          expA: function (v) { return PI * (1 - Math.exp(-v.a)); }
        },
        feedback: [
          { when: 'noHalf', say: 'Con $u = r^2$, $du = 2r\\,dr$: te faltó el $\\frac{1}{2}$ de $\\int e^{-r^2}r\\,dr = -\\frac{1}{2}e^{-r^2}$.' },
          { when: 'expA', say: 'Al evaluar, el exponente es $-r^2 = -a^2$, no $-a$.' }
        ],
        oracle: { lab: 'call', mod: 'polarElement', fn: 'integral', args: function (v) { return ['disk', { a: v.a }, 'gauss', {}]; } },
        hint: 'En polares queda $\\int_0^{2\\pi}\\int_0^a e^{-r^2}\\,r\\,dr\\,d\\theta$. La $r$ del elemento permite $u = r^2$.',
        solution: function (v) { return '$$\\int_0^{2\\pi}\\!\\int_0^{' + n(v.a) + '} e^{-r^2}\\,r\\,dr\\,d\\theta = 2\\pi\\cdot\\tfrac{1}{2}\\left(1 - e^{-' + n(v.a * v.a) + '}\\right) = \\pi\\left(1 - e^{-' + n(v.a * v.a) + '}\\right) \\approx ' + fx(PI * (1 - Math.exp(-v.a * v.a))) + '$$'; }
      },
      {
        id: 'c2-s13-petalo', title: 'Área de un pétalo',
        vars: { a: [1, 5, 1], k: [3, 5, 2] },
        prompt: function (v) { return '<p>Encuentra el área de <strong>un</strong> pétalo de la rosa $r = ' + v.a + '\\cos ' + v.k + '\\theta$.</p>'; },
        check: 'numeric',
        answer: function (v) { return PI * v.a * v.a / (4 * v.k); },
        mistakes: {
          fullTurn: function (v) { return PI * v.a * v.a / 2; },
          noHalf: function (v) { return PI * v.a * v.a / (2 * v.k); },
          allPetals: function (v) { return PI * v.a * v.a / 4; }
        },
        feedback: [
          { when: 'fullTurn', say: 'Integraste $\\theta$ de $0$ a $2\\pi$: eso recorre todos los pétalos, y con $n$ impar cada uno dos veces. Un pétalo va entre dos ceros de $r$.' },
          { when: 'noHalf', say: 'Te faltó el $\\frac{1}{2}$ de la fórmula $A = \\frac{1}{2}\\int r^2\\,d\\theta$.' },
          { when: 'allPetals', say: 'Esa es el área de todos los pétalos. Pidieron solo uno: divide entre el número de pétalos.' }
        ],
        oracle: { lab: 'call', mod: 'polarElement', fn: 'area', args: function (v) { return ['petal', { a: v.a, n: v.k }]; } },
        hint: function (v) { return 'Un pétalo va de $\\theta = -\\frac{\\pi}{' + (2 * v.k) + '}$ a $\\frac{\\pi}{' + (2 * v.k) + '}$, donde $r = 0$. Usa $A = \\frac{1}{2}\\int r^2\\,d\\theta$ y $\\cos^2 u = \\frac{1 + \\cos 2u}{2}$.'; },
        solution: function (v) { return '$$A = \\frac{1}{2}\\int_{-\\pi/' + (2 * v.k) + '}^{\\pi/' + (2 * v.k) + '} ' + (v.a * v.a) + '\\cos^2 ' + v.k + '\\theta\\,d\\theta = \\frac{' + (v.a * v.a) + '}{4}\\cdot\\frac{\\pi}{' + v.k + '} \\approx ' + fx(PI * v.a * v.a / (4 * v.k)) + '$$'; }
      },
      {
        id: 'c2-s13-convertir', title: 'Convertir y evaluar',
        vars: { a: [1, 4, 1] },
        prompt: function (v) { return '<p>Pasa a polares y evalúa $\\displaystyle\\int_0^{' + v.a + '}\\!\\int_0^{\\sqrt{' + (v.a * v.a) + ' - x^2}} \\sqrt{x^2 + y^2}\\,dy\\,dx$.</p>'; },
        check: 'numeric',
        answer: function (v) { return PI * Math.pow(v.a, 3) / 6; },
        mistakes: {
          forgot: function (v) { return PI * v.a * v.a / 4; },
          fullTurn: function (v) { return 2 * PI * Math.pow(v.a, 3) / 3; },
          halfTurn: function (v) { return PI * Math.pow(v.a, 3) / 3; }
        },
        feedback: [
          { when: 'forgot', say: 'Olvidaste la $r$ del elemento: $\\sqrt{x^2 + y^2} = r$ y con $dA = r\\,dr\\,d\\theta$ queda $r^2$.' },
          { when: 'fullTurn', say: 'La región es solo el primer cuadrante ($x \\ge 0$, $y \\ge 0$): $\\theta$ va de $0$ a $\\frac{\\pi}{2}$, no a $2\\pi$.' },
          { when: 'halfTurn', say: '$x$ va de $0$ a $a$, así que la región está en el primer cuadrante: $0 \\le \\theta \\le \\frac{\\pi}{2}$, no hasta $\\pi$.' }
        ],
        oracle: { lab: 'call', mod: 'polarElement', fn: 'integral', args: function (v) { return ['sector', { a: v.a, t0: 0, t1: PI / 2 }, 'r', {}]; } },
        hint: 'Dibuja la región: $y = \\sqrt{a^2 - x^2}$ es la mitad de arriba de una circunferencia. ¿Qué parte del disco queda?',
        solution: function (v) { return 'Es el cuarto de disco de radio $' + v.a + '$ en el primer cuadrante: $$\\int_0^{\\pi/2}\\!\\int_0^{' + v.a + '} r\\cdot r\\,dr\\,d\\theta = \\frac{\\pi}{2}\\cdot\\frac{' + v.a + '^3}{3} = \\frac{' + Math.pow(v.a, 3) + '\\pi}{6} \\approx ' + fx(PI * Math.pow(v.a, 3) / 6) + '$$'; }
      },
      {
        id: 'c2-s13-paraboloide', title: 'Volumen bajo un paraboloide',
        vars: { c: [1, 9, 1] },
        prompt: function (v) { return '<p>Encuentra el volumen del sólido bajo el paraboloide $z = ' + v.c + ' - x^2 - y^2$ y arriba del plano $xy$.</p>'; },
        check: 'numeric',
        answer: function (v) { return PI * v.c * v.c / 2; },
        mistakes: {
          forgot: function (v) { return 4 * PI * Math.pow(v.c, 1.5) / 3; },
          cylinder: function (v) { return PI * v.c * v.c; }
        },
        feedback: [
          { when: 'forgot', say: 'Olvidaste la $r$ del elemento: es $\\int (c - r^2)\\,r\\,dr$, no $\\int (c - r^2)\\,dr$.' },
          { when: 'cylinder', say: 'Ese es el cilindro de altura $c$ que contiene al sólido. El paraboloide baja hacia el borde: la altura es $c - r^2$.' }
        ],
        oracle: { lab: 'call', mod: 'polarElement', fn: 'integral', args: function (v) { return ['disk', { a: Math.sqrt(v.c) }, 'para', { c: v.c }]; } },
        hint: 'La base es donde $z = 0$: el disco $r \\le \\sqrt{c}$. El volumen es $\\iint (c - r^2)\\,r\\,dr\\,d\\theta$.',
        solution: function (v) { return 'La base es $r \\le \\sqrt{' + v.c + '}$. $$V = \\int_0^{2\\pi}\\!\\int_0^{\\sqrt{' + v.c + '}} (' + v.c + ' - r^2)\\,r\\,dr\\,d\\theta = 2\\pi\\left(\\frac{' + v.c + '^2}{2} - \\frac{' + v.c + '^2}{4}\\right) = \\frac{' + (v.c * v.c) + '\\pi}{2} \\approx ' + fx(PI * v.c * v.c / 2) + '$$'; }
      },
      {
        id: 'c2-s13-masa', title: 'Masa con densidad radial',
        vars: { a: [1, 4, 0.5], k: [1, 5, 1] },
        prompt: function (v) { return '<p>Una placa circular de radio $' + n(v.a) + '$ m tiene densidad $\\delta(x, y) = ' + (v.k === 1 ? '' : v.k) + '\\sqrt{x^2 + y^2}$ kg/m². ¿Cuál es su masa?</p>'; },
        check: 'numeric', unit: 'kg',
        answer: function (v) { return 2 * PI * v.k * Math.pow(v.a, 3) / 3; },
        mistakes: {
          forgot: function (v) { return PI * v.k * v.a * v.a; },
          edge: function (v) { return PI * v.k * Math.pow(v.a, 3); }
        },
        feedback: [
          { when: 'forgot', say: 'Olvidaste la $r$ del elemento: $\\delta\\,dA = kr\\cdot r\\,dr\\,d\\theta$.' },
          { when: 'edge', say: 'Usaste la densidad del borde para toda la placa. Hacia el centro es más ligera: hay que integrar.' }
        ],
        oracle: { lab: 'call', mod: 'polarElement', fn: 'integral', args: function (v) { return ['disk', { a: v.a }, 'r', { k: v.k }]; } },
        hint: 'Masa $= \\iint \\delta\\,dA$. En polares $\\delta = kr$ y $dA = r\\,dr\\,d\\theta$.',
        solution: function (v) { return '$$M = \\int_0^{2\\pi}\\!\\int_0^{' + n(v.a) + '} ' + v.k + 'r\\cdot r\\,dr\\,d\\theta = 2\\pi\\cdot\\frac{' + v.k + '(' + n(v.a) + ')^3}{3} \\approx ' + fx(2 * PI * v.k * Math.pow(v.a, 3) / 3) + '\\text{ kg}$$'; }
      },
      {
        id: 'c2-s13-cardioide', title: 'Área de una cardioide',
        vars: { a: [1, 4, 1] },
        prompt: function (v) { return '<p>Encuentra el área encerrada por la cardioide $r = ' + (v.a === 1 ? '' : v.a) + '(1 + \\cos\\theta)$.</p>'; },
        check: 'numeric',
        answer: function (v) { return 1.5 * PI * v.a * v.a; },
        mistakes: {
          noHalf: function (v) { return 3 * PI * v.a * v.a; },
          halfTurn: function (v) { return 0.75 * PI * v.a * v.a; },
          noCos2: function (v) { return PI * v.a * v.a; }
        },
        feedback: [
          { when: 'noHalf', say: 'Te faltó el $\\frac{1}{2}$ de $A = \\frac{1}{2}\\int r^2\\,d\\theta$.' },
          { when: 'halfTurn', say: 'Esa es la mitad de arriba ($0 \\le \\theta \\le \\pi$). La cardioide se cierra hasta $2\\pi$.' },
          { when: 'noCos2', say: 'Revisa $\\int_0^{2\\pi}\\cos^2\\theta\\,d\\theta = \\pi$: al desarrollar $(1 + \\cos\\theta)^2$ ese término no se va.' }
        ],
        oracle: { lab: 'call', mod: 'polarElement', fn: 'area', args: function (v) { return ['cardioid', { a: v.a }]; } },
        hint: 'Desarrolla $(1 + \\cos\\theta)^2 = 1 + 2\\cos\\theta + \\cos^2\\theta$ e integra de $0$ a $2\\pi$.',
        solution: function (v) { return '$$A = \\frac{1}{2}\\int_0^{2\\pi} ' + (v.a * v.a === 1 ? '' : v.a * v.a) + '(1 + 2\\cos\\theta + \\cos^2\\theta)\\,d\\theta = \\frac{' + (v.a * v.a) + '}{2}(2\\pi + 0 + \\pi) = \\frac{3\\pi(' + v.a + ')^2}{2} \\approx ' + fx(1.5 * PI * v.a * v.a) + '$$'; }
      },
      {
        id: 'c2-s13-factor', title: '¿Qué integral es?',
        vars: { a: [2, 6, 1] },
        prompt: function (v) { return '<p>¿Cuál integral polar es igual a $\\displaystyle\\iint_D f(x, y)\\,dA$, con $D$ el disco $x^2 + y^2 \\le ' + (v.a * v.a) + '$?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: '$\\int_0^{2\\pi}\\int_0^{' + v.a + '} f(r\\cos\\theta, r\\sin\\theta)\\,r\\,dr\\,d\\theta$', correct: true },
            { text: '$\\int_0^{2\\pi}\\int_0^{' + v.a + '} f(r\\cos\\theta, r\\sin\\theta)\\,dr\\,d\\theta$', say: 'Falta la $r$ del elemento: $dA = r\\,dr\\,d\\theta$.' },
            { text: '$\\int_0^{2\\pi}\\int_0^{' + (v.a * v.a) + '} f(r\\cos\\theta, r\\sin\\theta)\\,r\\,dr\\,d\\theta$', say: 'El radio es $' + v.a + '$, no $' + (v.a * v.a) + '$: en $x^2 + y^2 \\le ' + (v.a * v.a) + '$ el número es $r^2$.' },
            { text: '$\\int_0^{\\pi}\\int_0^{' + v.a + '} f(r\\cos\\theta, r\\sin\\theta)\\,r^2\\,dr\\,d\\theta$', say: 'Con $\\theta$ hasta $\\pi$ solo cubres medio disco, y el elemento lleva $r$, no $r^2$.' }
          ];
        },
        answer: function (v) { return '$\\int_0^{2\\pi}\\int_0^{' + v.a + '} f(r\\cos\\theta, r\\sin\\theta)\\,r\\,dr\\,d\\theta$'; },
        hint: 'Tres cosas: el radio (raíz del número), $\\theta$ de una vuelta completa y la $r$ del elemento.',
        solution: function (v) { return 'El disco tiene radio $' + v.a + '$, da la vuelta completa y $dA = r\\,dr\\,d\\theta$: $$\\int_0^{2\\pi}\\!\\int_0^{' + v.a + '} f(r\\cos\\theta, r\\sin\\theta)\\,r\\,dr\\,d\\theta$$'; }
      }
    ],

    quiz: { tags: ['c2.S13'], count: 8 },

    errors: [
      'Olvidar la $r$ del elemento: escribir $dr\\,d\\theta$ en lugar de $r\\,dr\\,d\\theta$.',
      'Creer que si el integrando ya trae $r$ no hace falta la del elemento (con $x^2 + y^2$ queda $r^3$, no $r^2$).',
      'Integrar $\\theta$ de $0$ a $2\\pi$ en un pétalo o en una región que no da la vuelta completa.',
      'Confundir el radio con su cuadrado: $x^2 + y^2 \\le 9$ es $r \\le 3$, no $r \\le 9$.',
      'Olvidar el $\\frac{1}{2}$ de la fórmula del área polar $A = \\frac{1}{2}\\int r^2\\,d\\theta$.',
      'En regiones entre dos curvas, no buscar dónde se cruzan para fijar los límites de $\\theta$.'
    ],

    teacher: {
      plan: [
        'Empieza con la diana o la pizza: que estimen a ojo cuántas veces cabe un pedazo del centro en uno del borde.',
        'Explainer del rectángulo polar: deduce $r^*\\Delta r\\,\\Delta\\theta$ con la resta de sectores en el pizarrón.',
        'Ejemplos 1 y 3 (disco y conversión); luego áreas con el pétalo y la región entre círculos.',
        'Lab: con «olvidar la r» activado, que suban las divisiones y vean que la suma no llega al valor exacto.',
        'Cierre con la integral de Gauss como «por qué vale la pena».'
      ],
      check: [
        'Que escriban $r\\,dr\\,d\\theta$ sin que se les recuerde.',
        'Que dibujen la región antes de poner límites, sobre todo al convertir desde rectangulares.'
      ],
      note: 'El factor $r$ es el primer Jacobiano; en S15 se generaliza a cilíndricas y esféricas.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §5.3 “Double Integrals in Polar Coordinates”. <a href="https://openstax.org/books/calculus-volume-3/pages/5-3-double-integrals-in-polar-coordinates">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 2</em>, §7.4 “Area and Arc Length in Polar Coordinates”. <a href="https://openstax.org/books/calculus-volume-2/pages/7-4-area-and-arc-length-in-polar-coordinates">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-12',
    next: 'sesion-14'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex);
    else if (ex.baseWhere) ex.where = ex.baseWhere;
  });
})();
