/* =====================================================================
   Cálculo 2 · S02 · Coordenadas polares (bloque A · Espacio y derivada parcial).
   Fuente: OpenStax, Calculus Volume 2, §7.3 (CC BY-NC-SA 4.0).
   Ángulos en radianes, θ medido desde el eje x positivo en sentido antihorario.
   Las respuestas se calculan aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.polar (verify / oracle).
   ===================================================================== */
(function () {
  var PI = Math.PI, TAU = 2 * PI;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString().replace('-', '−'); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  // (p/q)·π en LaTeX: piTex(4, 6) → \frac{2\pi}{3}
  function piTex(p, q) {
    var g = gcd(p, q); p /= g; q /= g;
    var top = (p === 1 ? '' : p) + '\\pi';
    return q === 1 ? top : '\\frac{' + top + '}{' + q + '}';
  }
  function sgn(x) { return x < 0 ? '-' : '+'; }
  // θ en [0, 2π) por cuadrantes, con arctan de valores positivos (camino distinto de atan2).
  function thetaByQuadrant(x, y) {
    var base = Math.atan(Math.abs(y) / Math.abs(x));
    if (x > 0 && y > 0) return base;
    if (x < 0 && y > 0) return PI - base;
    if (x < 0 && y < 0) return PI + base;
    return TAU - base;
  }
  function quad(x, y) { return x > 0 ? (y > 0 ? 'I' : 'IV') : (y > 0 ? 'II' : 'III'); }
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

  // Ejemplo 1: (4, 2π/3) a rectangulares
  var e1 = { r: 4, th: 2 * PI / 3 };
  e1.x = e1.r * Math.cos(e1.th); e1.y = e1.r * Math.sin(e1.th);
  // Ejemplo 2: (−3, −4) a polares (cuadrante III)
  var e2 = { x: -3, y: -4 };
  e2.r = Math.sqrt(e2.x * e2.x + e2.y * e2.y);
  e2.base = Math.atan(4 / 3);
  e2.th = thetaByQuadrant(e2.x, e2.y);

  var data = window.SESSION_DATA = {
    slug: 'sesion-02', number: '02', group: 'A · Espacio y derivada parcial',
    title: 'Coordenadas polares: conversión y curvas polares', temario: [],
    minutes: 180,
    quote: 'En polares no dices «tantas cuadras a la derecha y tantas hacia arriba», sino «mira hacia allá y camina tanto».',
    badges: [
      'Convertir puntos entre polares y rectangulares, con el ángulo en el cuadrante correcto.',
      'Reconocer que un mismo punto tiene muchas coordenadas polares.',
      'Pasar ecuaciones de rectangulares a polares y de regreso.',
      'Graficar curvas polares con tabla y reconocer cardioides, limaçons, rosas y espirales.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Un punto del plano también se describe con <strong>una distancia y un ángulo</strong>: qué tan lejos está del origen y en qué dirección.',
        recall: [
          'Seno, coseno y tangente en el círculo unitario, en radianes (Cálculo 1).',
          'El ángulo de un vector con el cuadrante correcto (<a href="../../../fisica-1/sesiones/sesion-02/">Física 1, S02</a>).',
          'Completar el cuadrado para reconocer una circunferencia: $(x - h)^2 + (y - k)^2 = R^2$.'
        ],
        why: 'Radares, antenas, órbitas, el sonido de una bocina y todo lo que gira alrededor de un centro se escribe más fácil en polares. Además, en S13 vas a integrar en polares regiones que en rectangulares son un dolor.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'En la pantalla de un <strong>radar</strong> el avión no aparece como «3 km al este y 4 km al norte», sino como «a 5 km, en la dirección de 53°». La barra que gira marca el ángulo y la distancia al centro dice qué tan lejos está. Eso son las coordenadas polares: $(r, \\theta)$.',
          'Un <strong>reloj</strong> funciona igual: la punta del minutero siempre está a la misma distancia del centro y lo único que cambia es la dirección. En polares esa circunferencia es simplemente $r = \\text{constante}$; en rectangulares necesitas $x^2 + y^2 = R^2$.',
          'Y una <strong>pizza</strong> se corta en rebanadas desde el centro: cada corte es un ángulo fijo, $\\theta = c$. Las figuras que nacen de un centro (círculos, pétalos, espirales) son las que mejor se describen en polares.'
        ]
      },
      {
        type: 'concept', heading: 'Qué son r y θ', short: 'r y θ',
        body: [
          'Elige un punto fijo, el <strong>polo</strong> (el origen), y una semirrecta que sale de él, el <strong>eje polar</strong> (el eje $x$ positivo). Un punto $P$ queda descrito por $(r, \\theta)$: $r$ es su distancia al origen y $\\theta$ el ángulo que gira el eje polar hasta apuntar a $P$, en sentido antihorario.',
          'En este curso $\\theta$ va en <strong>radianes</strong> salvo que se diga otra cosa. Con el triángulo rectángulo de la figura sale la conversión a rectangulares: $$x = r\\cos\\theta \\qquad y = r\\sin\\theta$$'
        ],
        diagram: 'c2s02-point',
        caption: 'El cateto horizontal es $x = r\\cos\\theta$ y el vertical, $y = r\\sin\\theta$. La hipotenusa es $r$.'
      },
      {
        type: 'concept', heading: 'De rectangulares a polares: el cuadrante manda', short: 'Rectangulares a polares',
        body: [
          'De regreso, Pitágoras da la distancia: $r = \\sqrt{x^2 + y^2}$. El ángulo cumple $\\tan\\theta = \\dfrac{y}{x}$, pero <strong>cuidado</strong>: la tangente se repite cada $\\pi$, así que $\\arctan(y/x)$ solo te da ángulos entre $-\\frac{\\pi}{2}$ y $\\frac{\\pi}{2}$, es decir, de los cuadrantes I y IV.',
          'Por eso primero miras en qué cuadrante está el punto y luego ajustas: si $x < 0$ (cuadrantes II y III), súmale $\\pi$ a lo que da la calculadora; si estás en el IV, súmale $2\\pi$ para quedar en $[0, 2\\pi)$. Es lo mismo que hace la función <code>atan2(y, x)</code> de las calculadoras científicas y los lenguajes de programación.'
        ],
        diagram: 'c2s02-quadrant',
        caption: 'Para $(-4, 3)$, $\\arctan(3/(-4)) \\approx -0.64$ apunta al cuadrante IV. El ángulo correcto es $\\pi - 0.64 \\approx 2.50$.'
      },
      {
        type: 'concept', heading: 'Un punto, muchos nombres', short: 'Varias representaciones',
        body: [
          'En rectangulares cada punto tiene un solo par $(x, y)$. En polares no: dar una vuelta completa te deja en el mismo lugar, así que $(r, \\theta)$ y $(r, \\theta + 2\\pi)$ son el mismo punto.',
          'Además $r$ puede ser <strong>negativo</strong>: $(-r, \\theta)$ significa «mira en la dirección $\\theta$ y camina $r$ hacia atrás». Eso cae en la dirección opuesta, así que $(-r, \\theta) = (r, \\theta + \\pi)$. El origen es especial: $(0, \\theta)$ es el origen para cualquier $\\theta$.'
        ],
        diagram: 'c2s02-negative',
        caption: 'Los tres nombres apuntan al mismo $P$. Con $r = -2$ miras hacia $5\\pi/4$ y caminas hacia atrás.'
      },
      {
        type: 'concept', heading: 'Ecuaciones: de rectangulares a polares y de regreso', short: 'Ecuaciones',
        body: [
          'Para pasar una ecuación a polares, sustituye $x = r\\cos\\theta$ y $y = r\\sin\\theta$ y despeja $r$. Para regresar, busca las combinaciones $r\\cos\\theta = x$, $r\\sin\\theta = y$ y $r^2 = x^2 + y^2$; a veces conviene multiplicar toda la ecuación por $r$.',
          'Por ejemplo, $r = 2a\\cos\\theta$: multiplica por $r$ y queda $r^2 = 2a\\,r\\cos\\theta$, o sea $x^2 + y^2 = 2ax$. Completando el cuadrado, $(x - a)^2 + y^2 = a^2$: una circunferencia de radio $a$ que pasa por el origen.'
        ],
        list: [
          '$r = a$ es la circunferencia $x^2 + y^2 = a^2$.',
          '$\\theta = c$ es la recta por el origen $y = (\\tan c)\\,x$.',
          '$r = a\\sec\\theta$ es la recta vertical $x = a$, y $r = a\\csc\\theta$ es la horizontal $y = a$.',
          '$r = 2a\\cos\\theta$ es la circunferencia $(x - a)^2 + y^2 = a^2$; $r = 2a\\sin\\theta$ es $x^2 + (y - a)^2 = a^2$.'
        ]
      },
      {
        type: 'explainer', heading: 'Graficar con una tabla', short: 'Graficar con tabla',
        title: 'r = 1 + 2 cos θ, paso a paso',
        intro: 'Para graficar $r = f(\\theta)$ haz una tabla con ángulos fáciles ($0$, $\\frac{\\pi}{2}$, $\\pi$, …), calcula $r$ y coloca cada punto girando $\\theta$ y caminando $r$. Sigue el trazo:',
        diagram: 'c2s02-trace',
        steps: [
          { text: 'En $\\theta = 0$: $r = 1 + 2(1) = 3$. El punto está sobre el eje polar, a 3 del origen.', state: { t: 0 } },
          { text: 'En $\\theta = \\frac{\\pi}{2}$: $r = 1 + 2(0) = 1$. La curva subió y se acercó al origen.', state: { t: PI / 2 } },
          { text: 'En $\\theta = \\frac{2\\pi}{3}$: $r = 1 + 2(-\\tfrac{1}{2}) = 0$. La curva toca el origen.', state: { t: 2 * PI / 3 } },
          { text: 'En $\\theta = \\pi$: $r = 1 - 2 = -1$. Como $r < 0$, el punto cae del lado <strong>opuesto</strong>, en $(1, 0)$: así nace el lazo interior.', state: { t: PI } },
          { text: 'En $\\theta = \\frac{4\\pi}{3}$: $r = 0$ otra vez. El lazo interior se cierra en el origen.', state: { t: 4 * PI / 3 } },
          { text: 'De $\\frac{4\\pi}{3}$ a $2\\pi$, $r$ crece de 0 a 3 y la curva regresa a su inicio. Como $\\cos(-\\theta) = \\cos\\theta$, la mitad de abajo es el reflejo de la de arriba.', state: { t: TAU } }
        ]
      },
      {
        type: 'concept', heading: 'Las familias que vas a encontrar', short: 'Familias de curvas',
        body: [
          'Casi todas las curvas polares de los exámenes son de unas pocas familias. Si reconoces la familia, ya sabes la forma y solo te faltan las medidas.'
        ],
        list: [
          '<strong>Circunferencias:</strong> $r = a$ (centrada) y $r = 2a\\cos\\theta$ o $2a\\sin\\theta$ (pasan por el origen).',
          '<strong>Cardioides y limaçons:</strong> $r = a + b\\cos\\theta$ (o con $\\sin\\theta$). Si $a = b$ es una cardioide (forma de corazón, toca el origen); si $a < b$ tiene un lazo interior; si $a > b$ no toca el origen.',
          '<strong>Rosas:</strong> $r = a\\cos n\\theta$ o $a\\sin n\\theta$, con pétalos de largo $a$. Si $n$ es impar hay $n$ pétalos; si $n$ es par, $2n$.',
          '<strong>Espirales:</strong> $r = a\\theta$. Cada vuelta se aleja $2\\pi a$ del origen.'
        ],
        diagram: 'c2s02-families',
        caption: 'Con $\\cos\\theta$ la curva se acomoda sobre el eje polar; con $\\sin\\theta$, la misma forma gira hacia el eje $y$.'
      },
      {
        type: 'callout', heading: 'Simetrías: te ahorran la mitad de la tabla',
        body: [
          '<strong>Eje polar (eje $x$):</strong> si cambiar $\\theta$ por $-\\theta$ no altera la ecuación. Pasa con todo lo que solo tiene $\\cos\\theta$.',
          '<strong>Eje $y$ (la recta $\\theta = \\frac{\\pi}{2}$):</strong> si cambiar $\\theta$ por $\\pi - \\theta$ no la altera. Pasa con $\\sin\\theta$.',
          '<strong>Origen:</strong> si cambiar $r$ por $-r$ (o $\\theta$ por $\\theta + \\pi$) no la altera.',
          'Estas pruebas bastan pero no son las únicas: una curva puede ser simétrica aunque la prueba falle. Por ejemplo, en $r = \\sin 2\\theta$ cambiar $\\theta$ por $-\\theta$ da $r = -\\sin 2\\theta$ (falla), y aun así la rosa es simétrica respecto al eje polar. Lo confirma la prueba alternativa $(r, \\theta) \\to (-r, \\pi - \\theta)$, que es el mismo reflejo en el eje $x$: queda $-r = \\sin(2\\pi - 2\\theta) = -\\sin 2\\theta$, o sea $r = \\sin 2\\theta$.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: convertir y graficar en polares', short: 'Receta',
        steps: [
          { text: 'Polar a rectangular: $x = r\\cos\\theta$, $y = r\\sin\\theta$ (calculadora en radianes).' },
          { text: 'Rectangular a polar: $r = \\sqrt{x^2 + y^2}$ y $\\tan\\theta = y/x$.', tip: 'Ubica primero el cuadrante. Si $x < 0$, súmale $\\pi$ a $\\arctan(y/x)$; si el punto está en el IV, súmale $2\\pi$.' },
          { text: 'Ecuaciones: sustituye $x$ y $y$ para ir a polares; usa $r^2 = x^2 + y^2$, $r\\cos\\theta = x$ y $r\\sin\\theta = y$ para regresar.', tip: 'Si ves $r = \\ldots\\cos\\theta$, multiplica todo por $r$ para que aparezca $r\\cos\\theta = x$.' },
          { text: 'Para graficar, identifica la familia y busca simetrías; luego haz una tabla en $0$, $\\frac{\\pi}{2}$, $\\pi$, $\\frac{3\\pi}{2}$ y donde $r = 0$.' },
          { text: 'Coloca cada punto girando $\\theta$ y caminando $r$.', tip: 'Si $r$ sale negativo, el punto va del lado opuesto a $\\theta$.' }
        ]
      },
      {
        type: 'example', heading: 'De polares a rectangulares',
        problem: '<p>Convierte el punto con coordenadas polares $(r, \\theta) = \\left(4, \\frac{2\\pi}{3}\\right)$ a coordenadas rectangulares.</p>',
        steps: [
          { text: 'El ángulo $\\frac{2\\pi}{3}$ (120°) está en el cuadrante II, así que esperamos $x < 0$ y $y > 0$.' },
          { text: 'Calcula $x$ con el coseno.', math: 'x = r\\cos\\theta = 4\\cos\\frac{2\\pi}{3} = 4\\left(-\\tfrac{1}{2}\\right) = ' + fx(e1.x) },
          { text: 'Calcula $y$ con el seno.', math: 'y = r\\sin\\theta = 4\\sin\\frac{2\\pi}{3} = 4\\cdot\\tfrac{\\sqrt{3}}{2} = 2\\sqrt{3} \\approx ' + fx(e1.y) },
          { text: 'Comprueba: $\\sqrt{(-2)^2 + (3.46)^2} \\approx 4$. La distancia al origen sigue siendo $r$.' }
        ],
        answer: '$(x, y) = (-2,\\ 2\\sqrt{3}) \\approx (' + fx(e1.x) + ',\\ ' + fx(e1.y) + ')$.',
        verify: { lab: 'call', mod: 'polar', fn: 'toRect', args: [e1.r, e1.th], values: { x: e1.x, y: e1.y } }
      },
      {
        type: 'example', heading: 'De rectangulares a polares, en el cuadrante III',
        problem: '<p>Encuentra coordenadas polares $(r, \\theta)$ del punto $(-3, -4)$, con $r > 0$ y $0 \\le \\theta < 2\\pi$.</p>',
        steps: [
          { text: 'La distancia al origen, con Pitágoras.', math: 'r = \\sqrt{(-3)^2 + (-4)^2} = \\sqrt{25} = 5' },
          { text: 'La calculadora da $\\arctan\\frac{-4}{-3} = \\arctan\\frac{4}{3} \\approx ' + fx(e2.base, 4) + '$. Pero ese ángulo es del cuadrante I, y el punto tiene $x < 0$ y $y < 0$: está en el III.' },
          { text: 'Ajusta el cuadrante sumando $\\pi$.', math: '\\theta = \\pi + ' + fx(e2.base, 4) + ' \\approx ' + fx(e2.th, 4) },
          { text: 'Comprueba: $5\\cos(' + fx(e2.th, 4) + ') \\approx -3$ y $5\\sin(' + fx(e2.th, 4) + ') \\approx -4$.' }
        ],
        answer: '$(r, \\theta) \\approx (5,\\ ' + fx(e2.th) + ')$. También valen $(5,\\ ' + fx(e2.th - TAU) + ')$ o $(-5,\\ ' + fx(e2.th - PI) + ')$.',
        verify: { lab: 'call', mod: 'polar', fn: 'toPolar', args: [e2.x, e2.y], values: { r: e2.r, theta: e2.th } }
      },
      {
        type: 'example', heading: 'Una ecuación polar que es una circunferencia',
        problem: '<p>Convierte $r = 6\\cos\\theta$ a coordenadas rectangulares y describe la curva.</p>',
        steps: [
          { text: 'Multiplica ambos lados por $r$ para que aparezcan $r^2$ y $r\\cos\\theta$.', math: 'r^2 = 6\\,r\\cos\\theta' },
          { text: 'Sustituye $r^2 = x^2 + y^2$ y $r\\cos\\theta = x$.', math: 'x^2 + y^2 = 6x' },
          { text: 'Pasa $6x$ al lado izquierdo y completa el cuadrado en $x$.', math: 'x^2 - 6x + 9 + y^2 = 9 \\;\\Rightarrow\\; (x - 3)^2 + y^2 = 9' },
          { text: 'Es una circunferencia de centro $(3, 0)$ y radio 3. Pasa por el origen: en $\\theta = \\frac{\\pi}{2}$, $r = 0$.' }
        ],
        answer: '$(x - 3)^2 + y^2 = 9$: circunferencia de centro $(3, 0)$ y radio $3$.',
        verify: { lab: 'call', mod: 'polar', fn: 'onImplicit', math: true, args: ['6*cos(theta)', '(x-3)^2 + y^2 - 9'], value: true }
      },
      {
        type: 'example', heading: 'Graficar una cardioide con tabla y simetría',
        problem: '<p>Grafica $r = 2 + 2\\cos\\theta$. ¿Qué simetrías tiene?</p>',
        steps: [
          { text: 'Simetría: $\\cos(-\\theta) = \\cos\\theta$, así que la ecuación no cambia al cambiar $\\theta$ por $-\\theta$. Es simétrica respecto al eje polar: basta graficar de $0$ a $\\pi$ y reflejar.' },
          { text: 'Tabla de $0$ a $\\pi$.', math: '\\begin{array}{c|ccccc} \\theta & 0 & \\frac{\\pi}{3} & \\frac{\\pi}{2} & \\frac{2\\pi}{3} & \\pi \\\\ \\hline r & 4 & 3 & 2 & 1 & 0 \\end{array}' },
          { text: 'Coloca los puntos: sale de $(4, 0)$, pasa por $(0, 2)$ en rectangulares y llega al origen en $\\theta = \\pi$. Refleja respecto al eje $x$.' },
          { text: 'Es de la forma $a + b\\cos\\theta$ con $a = b = 2$: una cardioide. No es simétrica respecto al eje $y$ ni al origen: llega a 4 a la derecha y a 0 a la izquierda.' }
        ],
        answer: 'Cardioide que apunta hacia la derecha, de largo 4, simétrica solo respecto al eje polar.',
        verify: { lab: 'call', mod: 'polar', fn: 'symmetryOf', math: true, args: ['2 + 2*cos(theta)'], value: { polar: true, yaxis: false, origin: false } }
      },
      {
        type: 'example', heading: '¿Cuántos pétalos tiene la rosa?',
        problem: '<p>¿Cuántos pétalos tiene $r = 3\\sin 4\\theta$ y qué tan largos son?</p>',
        steps: [
          { text: 'Es una rosa $r = a\\sin n\\theta$ con $a = 3$ y $n = 4$.' },
          { text: '$n = 4$ es par, así que hay $2n = 8$ pétalos. (Con $n$ impar habría $n$ pétalos, porque la segunda vuelta repasa los mismos.)' },
          { text: 'Cada pétalo llega hasta donde $|\\sin 4\\theta| = 1$: su largo es $|a| = 3$.' }
        ],
        answer: '8 pétalos de largo 3.',
        verify: { lab: 'call', mod: 'polar', fn: 'petalsOf', math: true, args: ['3*sin(4*theta)'], value: 8 }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué mi calculadora da un ángulo equivocado?', a: '$\\arctan$ solo devuelve ángulos entre $-\\frac{\\pi}{2}$ y $\\frac{\\pi}{2}$. Si el punto tiene $x < 0$, súmale $\\pi$; si está en el cuadrante IV y quieres $\\theta \\in [0, 2\\pi)$, súmale $2\\pi$.' },
          { q: '¿Puede $r$ ser negativo?', a: 'Sí. $(-r, \\theta)$ es el punto que está a distancia $r$ en la dirección $\\theta + \\pi$. Muchas curvas, como $r = 1 + 2\\cos\\theta$ o las rosas, usan $r < 0$ en parte de su trazo.' },
          { q: '¿Grados o radianes?', a: 'Radianes, salvo que el problema diga otra cosa. Revisa el modo de tu calculadora antes de evaluar $\\cos\\theta$.' },
          { q: '¿Por qué $r = \\cos 3\\theta$ tiene 3 pétalos y $r = \\cos 2\\theta$ tiene 4?', a: 'Con $n$ impar, la curva de $\\pi$ a $2\\pi$ repasa los mismos pétalos (con $r$ negativo). Con $n$ par cae en pétalos nuevos, y por eso son $2n$.' },
          { q: '¿Una ecuación polar puede tener varias formas?', a: 'Sí: $r = 2\\cos\\theta$ y $r = -2\\cos(\\theta + \\pi)$ dibujan la misma circunferencia. Por eso el lab compara las curvas como conjuntos de puntos y no las fórmulas.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          '$x = r\\cos\\theta$, $y = r\\sin\\theta$; de regreso, $r = \\sqrt{x^2 + y^2}$ y $\\theta$ con el cuadrante correcto.',
          'Un punto tiene muchos nombres: $(r, \\theta + 2\\pi)$ y $(-r, \\theta + \\pi)$.',
          'Para convertir ecuaciones usa $r^2 = x^2 + y^2$, $r\\cos\\theta = x$, $r\\sin\\theta = y$.',
          'Cardioides y limaçons $a + b\\cos\\theta$, rosas con $n$ o $2n$ pétalos y espirales $r = a\\theta$.'
        ]
      }
    ],

    lab: {
      type: 'polar-check', title: '¿Es tu curva polar?',
      intro: 'Elige una curva objetivo, lee sus medidas en la gráfica y escribe su $r(\\theta)$ con $\\theta$ de la paleta. Se califica la curva como conjunto de puntos, así que cualquier forma equivalente cuenta. El lab detecta si intercambiaste $\\cos$ y $\\sin$, si te equivocaste de signo, de pétalos o de tamaño. En el modo explorar, un deslizador traza la curva poco a poco y te dice $(r, \\theta)$ y $(x, y)$ de cada punto.',
      cfg: { start: 0, mode: 'check' }
    },

    formulas: [
      { label: 'Polar a rectangular', tex: 'x = r\\cos\\theta,\\ \\ y = r\\sin\\theta' },
      { label: 'Rectangular a polar', tex: 'r = \\sqrt{x^2 + y^2},\\ \\ \\tan\\theta = \\tfrac{y}{x}' },
      { label: 'Ajuste de cuadrante', tex: 'x < 0:\\ \\theta = \\arctan\\tfrac{y}{x} + \\pi' },
      { label: 'Mismo punto', tex: '(r, \\theta) = (r, \\theta + 2\\pi) = (-r, \\theta + \\pi)' },
      { label: 'Circunferencia por el origen', tex: 'r = 2a\\cos\\theta \\iff (x - a)^2 + y^2 = a^2' },
      { label: 'Rectas', tex: 'x = a \\iff r = a\\sec\\theta,\\ \\ y = a \\iff r = a\\csc\\theta' },
      { label: 'Rosa r = a cos nθ', tex: 'n \\text{ impar: } n \\text{ pétalos};\\ n \\text{ par: } 2n' }
    ],

    exercises: [
      {
        id: 'c2-s02-rect-x', title: 'De polares a rectangulares',
        vars: { r: [1, 6, 0.5], k: [1, 11, 1] },
        baseWhere: function (v) { return v.k % 3 !== 0 || v.k === 6; },
        prompt: function (v) { return '<p>Un punto tiene coordenadas polares $(r, \\theta) = \\left(' + v.r + ',\\ ' + piTex(v.k, 6) + '\\right)$. ¿Cuánto vale su coordenada rectangular $x$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.r * Math.cos(v.k * PI / 6); },
        mistakes: {
          usedSin: function (v) { return v.r * Math.sin(v.k * PI / 6); },
          flippedSign: function (v) { return -v.r * Math.cos(v.k * PI / 6); }
        },
        feedback: [
          { when: 'usedSin', say: 'Usaste el seno: ese es $y$. La coordenada $x$ es $r\\cos\\theta$.' },
          { when: 'flippedSign', say: 'Revisa el signo: el coseno es positivo en los cuadrantes I y IV y negativo en el II y el III.' }
        ],
        oracle: { lab: 'call', mod: 'polar', fn: 'toRect', field: 'x', args: function (v) { return [v.r, v.k * PI / 6]; } },
        hint: '$x = r\\cos\\theta$. Ubica primero el cuadrante de $\\theta$ para saber el signo.',
        solution: function (v) { return '$$x = r\\cos\\theta = ' + v.r + '\\cos ' + piTex(v.k, 6) + ' = ' + fx(v.r * Math.cos(v.k * PI / 6)) + '$$'; }
      },
      {
        id: 'c2-s02-rect-y', title: 'Con r negativo',
        vars: { r: [-5, -1, 0.5], k: [1, 7, 1] },
        baseWhere: function (v) { return v.k !== 4; },
        prompt: function (v) { return '<p>Un punto tiene coordenadas polares $(r, \\theta) = \\left(' + v.r + ',\\ ' + piTex(v.k, 4) + '\\right)$. Ojo con el signo de $r$. ¿Cuánto vale su coordenada rectangular $y$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.r * Math.sin(v.k * PI / 4); },
        mistakes: {
          ignoredSign: function (v) { return -v.r * Math.sin(v.k * PI / 4); },
          usedCos: function (v) { return v.r * Math.cos(v.k * PI / 4); }
        },
        feedback: [
          { when: 'ignoredSign', say: 'Usaste $|r|$. Con $r < 0$ el punto cae del lado opuesto a $\\theta$, así que el signo cambia.' },
          { when: 'usedCos', say: 'Usaste el coseno: ese es $x$. La coordenada $y$ es $r\\sin\\theta$.' }
        ],
        oracle: { lab: 'call', mod: 'polar', fn: 'toRect', field: 'y', args: function (v) { return [v.r, v.k * PI / 4]; } },
        hint: 'Las fórmulas valen igual con $r < 0$: $y = r\\sin\\theta$, con todo y el signo de $r$.',
        solution: function (v) { return '$$y = r\\sin\\theta = (' + v.r + ')\\sin ' + piTex(v.k, 4) + ' = ' + fx(v.r * Math.sin(v.k * PI / 4)) + '$$ El punto cae del lado opuesto a la dirección $' + piTex(v.k, 4) + '$.'; }
      },
      {
        id: 'c2-s02-polar-r', title: 'Distancia al origen',
        vars: { x: [-8, 8, 1], y: [-8, 8, 1] },
        baseWhere: function (v) { return v.x !== 0 && v.y !== 0; },
        prompt: function (v) { return '<p>¿Cuánto vale $r$ (con $r > 0$) para el punto rectangular $(' + v.x + ', ' + v.y + ')$?</p>'; },
        check: 'numeric',
        answer: function (v) { return Math.sqrt(v.x * v.x + v.y * v.y); },
        mistakes: {
          noSqrt: function (v) { return v.x * v.x + v.y * v.y; },
          sumAbs: function (v) { return Math.abs(v.x) + Math.abs(v.y); }
        },
        feedback: [
          { when: 'noSqrt', say: 'Te faltó la raíz: $r^2 = x^2 + y^2$, así que $r = \\sqrt{x^2 + y^2}$.' },
          { when: 'sumAbs', say: 'Sumaste los catetos. La distancia es la hipotenusa: $\\sqrt{x^2 + y^2}$.' }
        ],
        oracle: { lab: 'call', mod: 'polar', fn: 'toPolar', field: 'r', args: function (v) { return [v.x, v.y]; } },
        hint: 'Pitágoras: $r = \\sqrt{x^2 + y^2}$. Los signos no importan porque se elevan al cuadrado.',
        solution: function (v) { return '$$r = \\sqrt{(' + v.x + ')^2 + (' + v.y + ')^2} = \\sqrt{' + (v.x * v.x + v.y * v.y) + '} \\approx ' + fx(Math.sqrt(v.x * v.x + v.y * v.y)) + '$$'; }
      },
      {
        id: 'c2-s02-polar-theta', title: 'El ángulo en el cuadrante correcto',
        vars: { x: [-6, 6, 1], y: [-6, 6, 1] },
        baseWhere: function (v) { return v.x !== 0 && v.y !== 0 && (v.x < 0 || v.y < 0); },
        prompt: function (v) { return '<p>Encuentra $\\theta$, en radianes y con $0 \\le \\theta < 2\\pi$, para el punto rectangular $(' + v.x + ', ' + v.y + ')$ (toma $r > 0$).</p>'; },
        check: 'numeric', unit: 'rad',
        answer: function (v) { return thetaByQuadrant(v.x, v.y); },
        mistakes: {
          arctan: function (v) { return Math.atan(v.y / v.x); },
          opposite: function (v) { return (thetaByQuadrant(v.x, v.y) + PI) % TAU; }
        },
        feedback: [
          { when: 'arctan', say: function (v) { return v.x < 0 ? 'Eso es lo que da $\\arctan(y/x)$, que solo cubre los cuadrantes I y IV. El punto tiene $x < 0$: súmale $\\pi$.' : 'Eso es lo que da $\\arctan(y/x)$: un ángulo negativo. Súmale $2\\pi$ para quedar en $[0, 2\\pi)$.'; } },
          { when: 'opposite', say: 'Ese ángulo apunta al punto opuesto. Revisa en qué cuadrante está $(x, y)$.' }
        ],
        oracle: { lab: 'call', mod: 'polar', fn: 'toPolar', field: 'theta', args: function (v) { return [v.x, v.y]; } },
        hint: 'Calcula $\\arctan\\left|\\frac{y}{x}\\right|$ y ajústalo: cuadrante II, $\\pi - $ ese ángulo; III, $\\pi + $; IV, $2\\pi - $.',
        solution: function (v) {
          var b = Math.atan(Math.abs(v.y) / Math.abs(v.x)), q = quad(v.x, v.y), th = thetaByQuadrant(v.x, v.y);
          var how = q === 'II' ? '\\pi - ' + fx(b, 4) : q === 'III' ? '\\pi + ' + fx(b, 4) : '2\\pi - ' + fx(b, 4);
          return 'El punto está en el cuadrante ' + q + '. El ángulo de referencia es $\\arctan\\frac{' + Math.abs(v.y) + '}{' + Math.abs(v.x) + '} \\approx ' + fx(b, 4) + '$, así que $$\\theta = ' + how + ' \\approx ' + fx(th) + '$$';
        }
      },
      {
        id: 'c2-s02-circulo', title: 'r = 2a cos θ en rectangulares',
        vars: { a: [1, 5, 1] },
        prompt: function (v) { return '<p>¿Qué ecuación rectangular describe la curva $r = ' + (2 * v.a) + '\\cos\\theta$?</p>'; },
        check: 'choice',
        options: function (v) {
          var c = 2 * v.a;
          return [
            { text: '$x^2 + y^2 = ' + c + 'x$', correct: true },
            { text: '$x^2 + y^2 = ' + c + 'y$', say: 'Esa es la de $r = ' + c + '\\sin\\theta$: el seno va con $y$.' },
            { text: '$x = ' + c + '$', say: 'Esa sería $r\\cos\\theta = ' + c + '$. Aquí hay que multiplicar por $r$: $r^2 = ' + c + 'r\\cos\\theta$.' },
            { text: '$x^2 + y^2 = ' + (c * c) + '$', say: 'Esa es $r = ' + c + '$, una circunferencia centrada en el origen.' }
          ];
        },
        answer: function (v) { return '$x^2 + y^2 = ' + (2 * v.a) + 'x$'; },
        hint: 'Multiplica ambos lados por $r$ y usa $r^2 = x^2 + y^2$, $r\\cos\\theta = x$.',
        solution: function (v) { var c = 2 * v.a; return '$$r^2 = ' + c + 'r\\cos\\theta \\;\\Rightarrow\\; x^2 + y^2 = ' + c + 'x \\;\\Rightarrow\\; (x - ' + v.a + ')^2 + y^2 = ' + (v.a * v.a) + '$$ Es la circunferencia de centro $(' + v.a + ', 0)$ y radio $' + v.a + '$.'; }
      },
      {
        id: 'c2-s02-recta', title: 'Una recta en polares',
        vars: { c: [2, 6, 1] },
        prompt: function (v) { return '<p>Escribe la recta vertical $x = ' + v.c + '$ en polares, como $r$ en función de $\\theta$.</p>'; },
        check: 'expr', exprVars: ['theta'], domain: [0.1, 1.2],
        answer: function (v) { return v.c + '/cos(theta)'; },
        mistakes: {
          times: function (v) { return v.c + '*cos(theta)'; },
          sine: function (v) { return v.c + '/sin(theta)'; }
        },
        feedback: [
          { when: 'times', say: 'De $r\\cos\\theta = c$ se despeja dividiendo: $r = c/\\cos\\theta$.' },
          { when: 'sine', say: 'Esa es la recta horizontal $y = c$. Para $x$ usa $r\\cos\\theta$.' }
        ],
        hint: 'Sustituye $x = r\\cos\\theta$ y despeja $r$.',
        solution: function (v) { return '$$r\\cos\\theta = ' + v.c + ' \\;\\Rightarrow\\; r = \\frac{' + v.c + '}{\\cos\\theta} = ' + v.c + '\\sec\\theta$$'; }
      },
      {
        id: 'c2-s02-petalos', title: 'Pétalos de una rosa',
        vars: { a: [1, 5, 1], n: [2, 9, 1], s: [0, 1, 1] },
        prompt: function (v) { return '<p>¿Cuántos pétalos tiene la rosa $r = ' + v.a + '\\' + (v.s ? 'sin' : 'cos') + ' ' + v.n + '\\theta$?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.n % 2 ? v.n : 2 * v.n; },
        mistakes: { parity: function (v) { return v.n % 2 ? 2 * v.n : v.n; } },
        feedback: [{ when: 'parity', say: function (v) { return v.n % 2 ? 'Con $n$ impar la segunda vuelta repasa los mismos pétalos: son $n$, no $2n$.' : 'Con $n$ par los pétalos de la segunda vuelta son nuevos: son $2n$.'; } }],
        oracle: { lab: 'call', mod: 'polar', fn: 'petalsOf', math: true, args: function (v) { return [v.a + '*' + (v.s ? 'sin' : 'cos') + '(' + v.n + '*theta)']; } },
        hint: '$r = a\\cos n\\theta$ o $a\\sin n\\theta$: $n$ pétalos si $n$ es impar, $2n$ si es par. El número $a$ solo cambia el largo.',
        solution: function (v) { return '$n = ' + v.n + '$ es ' + (v.n % 2 ? 'impar, así que hay $' + v.n + '$ pétalos' : 'par, así que hay $2(' + v.n + ') = ' + (2 * v.n) + '$ pétalos') + ', cada uno de largo $' + v.a + '$.'; }
      },
      {
        id: 'c2-s02-identifica', title: 'Identifica la curva',
        vars: { a: [1, 4, 1], b: [1, 4, 1], t: [0, 1, 1], sg: [0, 1, 1] },
        prompt: function (v) { return '<p>¿Qué curva es $r = ' + v.a + (v.sg ? ' - ' : ' + ') + v.b + '\\' + (v.t ? 'sin' : 'cos') + '\\theta$?</p>'; },
        check: 'choice',
        options: function (v) {
          var o = [
            { key: 'card', text: 'Una cardioide', ok: v.a === v.b, say: 'Para una cardioide los dos números deben ser iguales ($a = b$).' },
            { key: 'loop', text: 'Un limaçon con lazo interior', ok: v.a < v.b, say: 'El lazo interior aparece solo si $a < b$: entonces $r$ se vuelve negativo.' },
            { key: 'noloop', text: 'Un limaçon sin lazo, que no toca el origen', ok: v.a > v.b, say: 'Si $a > b$, $r$ nunca llega a 0; aquí no es el caso.' },
            { key: 'rose', text: 'Una rosa', ok: false, say: 'Una rosa es $r = a\\cos n\\theta$, sin término constante.' }
          ];
          return o.map(function (x) { return x.ok ? { text: x.text, correct: true } : { text: x.text, say: x.say }; });
        },
        answer: function (v) { return v.a === v.b ? 'Una cardioide' : v.a < v.b ? 'Un limaçon con lazo interior' : 'Un limaçon sin lazo, que no toca el origen'; },
        hint: 'Compara el número suelto $a$ con el que multiplica al coseno o seno, $b$.',
        solution: function (v) { return 'Es de la forma $a + b\\,' + (v.t ? '\\sin' : '\\cos') + '\\theta$ con $a = ' + v.a + '$ y $b = ' + v.b + '$. ' + (v.a === v.b ? 'Como $a = b$, es una cardioide.' : v.a < v.b ? 'Como $a < b$, $r$ toma valores negativos y aparece un lazo interior.' : 'Como $a > b$, $r > 0$ siempre: un limaçon que no toca el origen.'); }
      }
    ],

    quiz: { tags: ['c2.S02'], count: 8 },

    errors: [
      'Usar $\\theta = \\arctan(y/x)$ sin revisar el cuadrante: falla con $x < 0$ y da ángulos negativos en el IV.',
      'Tener la calculadora en grados cuando $\\theta$ está en radianes.',
      'Intercambiar $\\cos$ y $\\sin$: $x$ va con coseno y $y$ con seno.',
      'Pensar que $r$ no puede ser negativo: $(-r, \\theta)$ es el punto en la dirección $\\theta + \\pi$.',
      'Contar $2n$ pétalos en una rosa con $n$ impar (son $n$).',
      'Olvidar multiplicar por $r$ al convertir $r = 2a\\cos\\theta$ y escribir $x = 2a$.'
    ],

    teacher: {
      plan: [
        'Empieza con el radar: que ubiquen tres puntos en papel polar antes de ver fórmulas.',
        'Conversión de puntos con énfasis en el cuadrante; ejemplos 1 y 2 en el pizarrón.',
        'Explainer de $r = 1 + 2\\cos\\theta$ con tabla, deteniéndose en $\\theta = \\pi$ ($r < 0$).',
        'Familias y simetrías; luego el lab en modo reto con la cardioide que trae cargada.'
      ],
      check: [
        'Que digan el cuadrante antes de calcular cualquier ángulo.',
        'Que expliquen dónde cae un punto con $r < 0$.'
      ],
      note: 'Las áreas y longitudes en polares quedan para S13 (integral doble en polares).'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 2</em>, §7.3 “Polar Coordinates”. <a href="https://openstax.org/books/calculus-volume-2/pages/7-3-polar-coordinates">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-01',
    next: 'sesion-03'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex);
    else if (ex.baseWhere) ex.where = ex.baseWhere;
  });
})();
