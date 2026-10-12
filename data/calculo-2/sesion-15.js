/* =====================================================================
   Cálculo 2 · S15 · Integral triple en cilíndricas y esféricas: el Jacobiano
   (bloque C · Integral múltiple).
   Fuente: OpenStax, Calculus Volume 3, §5.5 y §5.7 (CC BY-NC-SA 4.0).
   Esféricas (ρ, θ, φ) con φ desde el eje z positivo (convención de OpenStax);
   ángulos en radianes. La densidad se llama δ para no confundirla con ρ.
   Las respuestas se calculan aquí con fórmulas cerradas; scripts/examples.test.js
   las compara contra LabMath.sphElement (integral numérica en esféricas o
   cilíndricas), y las pruebas del lab comparan eso contra la integral iterada
   en rectangulares y contra Monte Carlo en x, y, z.
   ===================================================================== */
(function () {
  var PI = Math.PI;
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString().replace('-', '−'); }
  function one() { return 1; }
  function rad(x, y, z) { return Math.sqrt(x * x + y * y + z * z); }
  function SPH(R) { return [[0, R], [0, 2 * PI], [0, PI]]; }

  // La respuesta y cada error típico deben quedar separados (más que la holgura del calificador).
  function apart(ex) {
    return function (v) {
      var w = Object.assign({}, v, ex.derive ? ex.derive(v) : {});
      if (ex.baseWhere && !ex.baseWhere(w)) return false;
      var vals = [ex.answer(w)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](w); }));
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) if (Math.abs(vals[i] - vals[j]) <= 0.02 + 0.015 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]))) return false;
      }
      return true;
    };
  }

  // Conos z = k·√(x² + y²) para φ = π/6, π/4, π/3 (cot φ = k).
  var CONES = [
    { al: PI / 6, tex: '\\frac{\\pi}{6}', cone: 'z = \\sqrt{3(x^2 + y^2)}', cos: '\\frac{\\sqrt{3}}{2}' },
    { al: PI / 4, tex: '\\frac{\\pi}{4}', cone: 'z = \\sqrt{x^2 + y^2}', cos: '\\frac{\\sqrt{2}}{2}' },
    { al: PI / 3, tex: '\\frac{\\pi}{3}', cone: 'z = \\sqrt{\\frac{x^2 + y^2}{3}}', cos: '\\frac{1}{2}' }
  ];

  // Ejemplos (fórmulas cerradas).
  var e1 = 36 * PI;                                      // esfera de radio 3
  var e2 = 16 * PI / 3 * (1 - Math.SQRT2 / 2);           // cono de helado, R = 2, φ ≤ π/4
  var e3 = 14 * PI;                                      // tubo 1 ≤ r ≤ 2, 0 ≤ z ≤ 3, δ = r
  var e4 = 8 * PI;                                       // bola R = 1, δ = 12 − 8ρ
  var e5 = { V: 16 * PI / 3, zbar: 0.75 };               // hemisferio R = 2

  var data = window.SESSION_DATA = {
    slug: 'sesion-15', number: '15', group: 'C · Integral múltiple',
    title: 'Integral triple en cilíndricas y esféricas: el Jacobiano', temario: [],
    minutes: 180,
    quote: 'Un sólido redondo no se llena de cubitos: se llena de cajitas curvas. Cada una mide lo que miden sus tres lados, y de ahí sale el Jacobiano.',
    badges: [
      'Escribir el elemento de volumen en cilíndricas, $dV = r\\,dr\\,d\\theta\\,dz$, y en esféricas, $dV = \\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi$.',
      'Deducir $\\rho^2\\sin\\varphi$ con la cajita esférica de lados $d\\rho$, $\\rho\\,d\\varphi$ y $\\rho\\sin\\varphi\\,d\\theta$.',
      'Elegir el sistema que conviene (cilindros, conos, esferas) y escribir sus límites.',
      'Calcular volúmenes, masas y centros de masa de sólidos redondos, y reconocer el Jacobiano como factor de escala.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Un sólido redondo se describe con límites <strong>constantes</strong> en cilíndricas o esféricas. Solo hay que multiplicar por el tamaño real de cada cajita: $r$ en cilíndricas y $\\rho^2\\sin\\varphi$ en esféricas. Ese factor es el <strong>Jacobiano</strong>.',
        recall: [
          'Coordenadas cilíndricas y esféricas: $x = r\\cos\\theta$, $y = r\\sin\\theta$; $x = \\rho\\sin\\varphi\\cos\\theta$, $y = \\rho\\sin\\varphi\\sin\\theta$, $z = \\rho\\cos\\varphi$ (<a href="../sesion-03/">S03</a>).',
          'La doble en polares y su elemento $dA = r\\,dr\\,d\\theta$, el primer Jacobiano (<a href="../sesion-13/">S13</a>).',
          'La integral triple en rectangulares: volumen $\\iiint 1\\,dV$, masa $\\iiint \\delta\\,dV$ y centro de masa $\\bar z = M_{xy}/m$ (<a href="../sesion-14/">S14</a>).',
          'Antiderivadas sencillas: $\\int \\rho^n\\,d\\rho$ y $\\int \\sin\\varphi\\,d\\varphi = -\\cos\\varphi$.'
        ],
        why: 'Tanques, tubos, cables, gotas, planetas y antenas tienen simetría cilíndrica o esférica. La masa de la Tierra con su núcleo denso, el volumen de un silo o la carga dentro de una esfera (como en la ley de Gauss de Física 2) se calculan en un par de renglones en estos sistemas, cuando en rectangulares salen raíces por todos lados.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en una <strong>cebolla</strong> partida en gajos. Cada pedazo está entre dos capas (dos radios), entre dos cortes verticales (dos ángulos $\\theta$) y entre dos «latitudes» (dos ángulos $\\varphi$). Los pedazos de las capas de afuera son mucho más grandes que los del centro, aunque los cortes sean iguales.',
          'Ahora piensa en un <strong>globo terráqueo</strong>. Los gajos que van de polo a polo son anchos en el ecuador y se adelgazan hasta ser un punto en los polos. Por eso un pedazo cerca del ecuador mide más que uno con los mismos ángulos cerca del polo: el ancho de cada gajo depende de $\\sin\\varphi$.',
          'Esa es la idea de la sesión: al pasar a esféricas, cada cajita pesa según qué tan lejos está del centro ($\\rho^2$) y qué tan lejos está del eje ($\\sin\\varphi$). Si olvidas ese factor, tratas igual a un pedazo del polo que a uno del ecuador, y la integral sale mal.'
        ]
      },
      {
        type: 'concept', heading: 'Repaso: los dos sistemas', short: 'Los dos sistemas',
        body: [
          '<strong>Cilíndricas</strong> $(r, \\theta, z)$: son las polares del piso más la altura. $x = r\\cos\\theta$, $y = r\\sin\\theta$, $z = z$, con $r \\ge 0$ y $0 \\le \\theta \\le 2\\pi$. Sirven para todo lo que tiene un eje: cilindros, tubos, paraboloides $z = x^2 + y^2 = r^2$.',
          '<strong>Esféricas</strong> $(\\rho, \\theta, \\varphi)$: $\\rho$ es la distancia al origen, $\\theta$ es el mismo ángulo de las cilíndricas y $\\varphi$ es el ángulo <strong>medido desde el eje $z$ positivo</strong> (la convención de OpenStax). $$x = \\rho\\sin\\varphi\\cos\\theta, \\quad y = \\rho\\sin\\varphi\\sin\\theta, \\quad z = \\rho\\cos\\varphi$$ con $\\rho \\ge 0$, $0 \\le \\theta \\le 2\\pi$ y $0 \\le \\varphi \\le \\pi$. Fíjate: $\\varphi$ llega solo hasta $\\pi$ (del polo norte al polo sur); es $\\theta$ la que da la vuelta completa.',
          'Dos identidades que se usan todo el tiempo: $x^2 + y^2 = r^2$ y $x^2 + y^2 + z^2 = \\rho^2$. Y la distancia al eje $z$ en esféricas es $r = \\rho\\sin\\varphi$.'
        ]
      },
      {
        type: 'concept', heading: 'El elemento de volumen en cilíndricas', short: 'dV en cilíndricas',
        body: [
          'Parte el sólido con cilindros $r = $ constante, semiplanos $\\theta = $ constante y planos $z = $ constante. Cada pedazo es el rectángulo polar de S13, de área $r\\,\\Delta r\\,\\Delta\\theta$, levantado una altura $\\Delta z$.',
          'Su volumen es base por altura: $$dV = r\\,dr\\,d\\theta\\,dz$$ La $r$ es la misma de las polares: los pedazos lejos del eje son más grandes. Así, $$\\iiint_E f\\,dV = \\int_\\alpha^\\beta\\!\\int_{r_1(\\theta)}^{r_2(\\theta)}\\!\\int_{u_1(r, \\theta)}^{u_2(r, \\theta)} f(r\\cos\\theta, r\\sin\\theta, z)\\,r\\,dz\\,dr\\,d\\theta$$'
        ],
        diagram: 'c2s15-cyl',
        caption: 'La cajita cilíndrica: la base es el rectángulo polar de S13 ($r\\,dr\\,d\\theta$) y la altura es $dz$.'
      },
      {
        type: 'explainer', heading: 'La cajita esférica', short: 'La cajita esférica',
        title: 'De dónde sale ρ² sin φ',
        intro: 'Parte el sólido con esferas $\\rho = $ constante, semiplanos $\\theta = $ constante y conos $\\varphi = $ constante. Cada pedazo es casi una caja: mide sus tres lados.',
        diagram: 'c2s15-box',
        steps: [
          { text: 'Un punto $P$ a distancia $\\rho$ del origen, con ángulo $\\varphi$ desde el eje $z$ y ángulo $\\theta$ en el piso. Su distancia al eje $z$ es $r = \\rho\\sin\\varphi$.', state: { s: 0 } },
          { text: 'Primer lado: al crecer $\\rho$ en $d\\rho$, te alejas del origen en línea recta. Ese lado mide <strong>$d\\rho$</strong>.', state: { s: 1 } },
          { text: 'Segundo lado: al crecer $\\varphi$ en $d\\varphi$, recorres un arco de un círculo de radio $\\rho$ (un meridiano). Longitud de arco = radio × ángulo: <strong>$\\rho\\,d\\varphi$</strong>.', state: { s: 2 } },
          { text: 'Tercer lado: al crecer $\\theta$ en $d\\theta$, recorres un arco de un círculo horizontal (un paralelo). Su radio no es $\\rho$, es la distancia al eje, $\\rho\\sin\\varphi$: el lado mide <strong>$\\rho\\sin\\varphi\\,d\\theta$</strong>.', state: { s: 3 } },
          { text: 'Los tres lados son perpendiculares: su producto $(d\\rho)(\\rho\\,d\\varphi)(\\rho\\sin\\varphi\\,d\\theta)$ da $$dV = \\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi$$', state: { s: 4 } }
        ]
      },
      {
        type: 'callout', heading: 'Comprobación: el volumen de la esfera',
        body: [
          'La esfera de radio $R$ es la «caja» $0 \\le \\rho \\le R$, $0 \\le \\theta \\le 2\\pi$, $0 \\le \\varphi \\le \\pi$. Como los límites son constantes y el integrando es un producto, la integral se separa: $$V = \\int_0^{\\pi}\\!\\int_0^{2\\pi}\\!\\int_0^{R} \\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi = \\frac{R^3}{3}\\cdot 2\\pi\\cdot 2 = \\frac{4}{3}\\pi R^3$$',
          'Sale la fórmula de siempre. Sin el Jacobiano saldría $R\\cdot 2\\pi\\cdot\\pi = 2\\pi^2 R$: ni siquiera tiene unidades de volumen (es una longitud). Esa es una buena alarma para detectar el error.'
        ]
      },
      {
        type: 'concept', heading: 'El Jacobiano: el factor de escala', short: 'El Jacobiano',
        body: [
          'Un cambio de variables $x = x(u, v, w)$, $y = y(u, v, w)$, $z = z(u, v, w)$ lleva una cajita recta $du\\,dv\\,dw$ a una cajita curva en el espacio. El <strong>Jacobiano</strong> dice cuántas veces más grande queda: $$dV = \\left|\\frac{\\partial(x, y, z)}{\\partial(u, v, w)}\\right| du\\,dv\\,dw$$ donde $\\frac{\\partial(x, y, z)}{\\partial(u, v, w)}$ es el determinante de la matriz de las nueve derivadas parciales.',
          'En esféricas, con las columnas en el orden $\\rho$, $\\theta$, $\\varphi$: $$\\frac{\\partial(x, y, z)}{\\partial(\\rho, \\theta, \\varphi)} = \\begin{vmatrix} \\sin\\varphi\\cos\\theta & -\\rho\\sin\\varphi\\sin\\theta & \\rho\\cos\\varphi\\cos\\theta \\\\ \\sin\\varphi\\sin\\theta & \\rho\\sin\\varphi\\cos\\theta & \\rho\\cos\\varphi\\sin\\theta \\\\ \\cos\\varphi & 0 & -\\rho\\sin\\varphi \\end{vmatrix} = -\\rho^2\\sin\\varphi$$ y su valor absoluto es $\\rho^2\\sin\\varphi$, lo mismo que dio la cajita.',
          'En el plano pasa lo mismo con dos variables: $\\left|\\frac{\\partial(x, y)}{\\partial(r, \\theta)}\\right| = \\begin{vmatrix} \\cos\\theta & -r\\sin\\theta \\\\ \\sin\\theta & r\\cos\\theta \\end{vmatrix} = r$. Es la $r$ de las polares de <a href="../sesion-13/">S13</a>: el ciclo se cierra. En cilíndricas la $z$ no se deforma y el Jacobiano vuelve a ser $r$.'
        ]
      },
      {
        type: 'concept', heading: '¿Cuál sistema conviene?', short: 'Cuál sistema',
        body: [
          'Elige el sistema en el que el sólido sea una «caja» (límites constantes) o casi. Las superficies que en un sistema son sencillas te dicen cuál usar.'
        ],
        list: [
          '<strong>Cilíndricas</strong>: cilindros $x^2 + y^2 = a^2$ ($r = a$), tubos, y sólidos entre $z = g(r)$ abajo y $z = h(r)$ arriba, como paraboloides. También cuando el integrando trae $x^2 + y^2$.',
          '<strong>Esféricas</strong>: esferas $x^2 + y^2 + z^2 = a^2$ ($\\rho = a$), cascarones, conos $z = k\\sqrt{x^2 + y^2}$ ($\\varphi = $ constante) y el <strong>cono de helado</strong>: dentro de una esfera y arriba de un cono. También cuando el integrando trae $x^2 + y^2 + z^2$.',
          '<strong>Rectangulares</strong>: cajas, tetraedros y sólidos con caras planas, como en <a href="../sesion-14/">S14</a>.'
        ],
        diagram: 'c2s15-choose',
        caption: 'Una lata se describe con $r$ y $z$; un cono de helado y una pelota, con $\\rho$, $\\theta$ y $\\varphi$.'
      },
      {
        type: 'callout', heading: 'Lo mismo que en Gauss',
        body: [
          'En la <a href="../../../fisica-2/sesiones/sesion-08/">ley de Gauss de Física 2 (sesión 8)</a> se elige una esfera alrededor de una carga puntual y un cilindro alrededor de un alambre largo, por la misma razón que aquí: la simetría hace que todo dependa de una sola variable ($\\rho$ o $r$).',
          'Por ejemplo, la carga de una esfera con densidad $\\rho_q(\\rho)$ es $Q = \\int_0^R \\rho_q\\,4\\pi\\rho^2\\,d\\rho$: las integrales en $\\theta$ y $\\varphi$ ya dieron el $4\\pi$, y el $\\rho^2$ es el Jacobiano. Cada cascarón delgado tiene volumen $4\\pi\\rho^2\\,d\\rho$ (área de la esfera por grosor).'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: integral triple en cilíndricas o esféricas', short: 'Receta',
        steps: [
          { text: 'Dibuja el sólido y elige el sistema: cilíndricas si tiene un eje (cilindros, paraboloides); esféricas si tiene un centro (esferas, conos desde el origen).' },
          { text: 'Traduce cada superficie: $x^2 + y^2 = r^2$, $x^2 + y^2 + z^2 = \\rho^2$, el cono $z = \\sqrt{x^2 + y^2}$ es $\\varphi = \\frac{\\pi}{4}$.', tip: '$\\varphi$ se mide desde el eje $z$ positivo y va de $0$ a $\\pi$. La que da la vuelta, de $0$ a $2\\pi$, es $\\theta$.' },
          { text: 'Escribe los límites. En un sólido redondo casi siempre son constantes: $\\rho$ de un radio a otro, $\\theta$ de $0$ a $2\\pi$, $\\varphi$ del cono al eje.' },
          { text: 'Cambia el integrando ($x = \\rho\\sin\\varphi\\cos\\theta$, $z = \\rho\\cos\\varphi$…) y multiplica por el Jacobiano: $r$ en cilíndricas, $\\rho^2\\sin\\varphi$ en esféricas.', tip: 'Es el error más común: sin el Jacobiano el resultado sale mal aunque los límites estén bien. Revisa también que sea $\\rho^2$ (no $\\rho$) y que lleve el $\\sin\\varphi$.' },
          { text: 'Integra. Si los límites son constantes y el integrando es un producto, separa en tres integrales de una variable.' }
        ]
      },
      {
        type: 'example', heading: 'El volumen de una esfera',
        problem: '<p>Calcula el volumen de la esfera $x^2 + y^2 + z^2 \\le 9$ con una integral triple en esféricas.</p>',
        steps: [
          { text: 'La esfera es $\\rho \\le 3$, con $\\theta$ de $0$ a $2\\pi$ y $\\varphi$ de $0$ a $\\pi$.', math: 'V = \\int_0^{\\pi}\\!\\int_0^{2\\pi}\\!\\int_0^{3} \\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi' },
          { text: 'Los límites son constantes y el integrando es un producto: se separa.', math: '\\int_0^3 \\rho^2\\,d\\rho = 9, \\qquad \\int_0^{2\\pi} d\\theta = 2\\pi, \\qquad \\int_0^{\\pi} \\sin\\varphi\\,d\\varphi = 2' },
          { text: 'Multiplica.', math: 'V = 9 \\cdot 2\\pi \\cdot 2 = 36\\pi \\approx 113.10' }
        ],
        answer: '$V = 36\\pi \\approx 113.10$, igual que $\\frac{4}{3}\\pi(3)^3$.',
        verify: { lab: 'call', mod: 'sphElement', fn: 'integrate', args: [one, 'sph', SPH(3)], value: e1 }
      },
      {
        type: 'example', heading: 'El cono de helado',
        problem: '<p>Encuentra el volumen del sólido que está dentro de la esfera $x^2 + y^2 + z^2 = 4$ y arriba del cono $z = \\sqrt{x^2 + y^2}$.</p>',
        diagram: 'c2s15-cone',
        steps: [
          { text: 'La esfera es $\\rho = 2$. El cono: $\\rho\\cos\\varphi = \\rho\\sin\\varphi$, o sea $\\tan\\varphi = 1$ y $\\varphi = \\frac{\\pi}{4}$. «Arriba del cono» es entre el eje $z$ y el cono.', math: '0 \\le \\rho \\le 2, \\quad 0 \\le \\theta \\le 2\\pi, \\quad 0 \\le \\varphi \\le \\tfrac{\\pi}{4}' },
          { text: 'Plantea con el Jacobiano.', math: 'V = \\int_0^{\\pi/4}\\!\\int_0^{2\\pi}\\!\\int_0^{2} \\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi' },
          { text: 'Separa en tres integrales.', math: '\\int_0^2 \\rho^2\\,d\\rho = \\frac{8}{3}, \\qquad \\int_0^{\\pi/4} \\sin\\varphi\\,d\\varphi = 1 - \\frac{\\sqrt{2}}{2}' },
          { text: 'Multiplica.', math: 'V = \\frac{8}{3}\\cdot 2\\pi\\cdot\\left(1 - \\frac{\\sqrt{2}}{2}\\right) = \\frac{16\\pi}{3}\\left(1 - \\frac{\\sqrt{2}}{2}\\right) \\approx 4.91' }
        ],
        answer: '$V = \\frac{16\\pi}{3}\\left(1 - \\frac{\\sqrt{2}}{2}\\right) \\approx 4.91$. En general, el cono de helado de radio $R$ y ángulo $\\alpha$ mide $\\frac{2\\pi}{3}R^3(1 - \\cos\\alpha)$.',
        verify: { lab: 'call', mod: 'sphElement', fn: 'integrate', args: [one, 'sph', [[0, 2], [0, 2 * PI], [0, PI / 4]]], value: e2 }
      },
      {
        type: 'example', heading: 'Un tubo con densidad variable (cilíndricas)',
        problem: '<p>Un tubo grueso ocupa $1 \\le x^2 + y^2 \\le 4$, $0 \\le z \\le 3$ (en metros). Su densidad crece hacia afuera: $\\delta = \\sqrt{x^2 + y^2}$ kg/m³. ¿Cuál es su masa?</p>',
        steps: [
          { text: 'En cilíndricas el tubo es una «caja»: $1 \\le r \\le 2$, $0 \\le \\theta \\le 2\\pi$, $0 \\le z \\le 3$. La densidad es $\\delta = r$.', math: 'm = \\int_0^{3}\\!\\int_0^{2\\pi}\\!\\int_1^{2} \\underbrace{r}_{\\delta}\\cdot\\underbrace{r}_{\\text{Jacobiano}}\\,dr\\,d\\theta\\,dz' },
          { text: 'La integral en $r$.', math: '\\int_1^2 r^2\\,dr = \\frac{8 - 1}{3} = \\frac{7}{3}' },
          { text: 'Las otras dos dan $2\\pi$ y $3$.', math: 'm = \\frac{7}{3}\\cdot 2\\pi\\cdot 3 = 14\\pi \\approx 43.98\\ \\text{kg}' }
        ],
        answer: '$m = 14\\pi \\approx 43.98$ kg. Ojo: aparecen dos $r$, una de la densidad y otra del Jacobiano. Sin el Jacobiano saldría $\\frac{3}{2}\\cdot 2\\pi\\cdot 3 = 9\\pi$.',
        verify: { lab: 'call', mod: 'sphElement', fn: 'integrate', args: [function (x, y) { return Math.sqrt(x * x + y * y); }, 'cyl', [[1, 2], [0, 2 * PI], [0, 3]]], value: e3 }
      },
      {
        type: 'example', heading: 'Un planeta con núcleo denso',
        problem: '<p>Un modelo de planeta es una bola de radio 1 (en unidades del radio del planeta) con densidad $\\delta = 12 - 8\\rho$: vale 12 en el centro y 4 en la superficie. Calcula su masa.</p>',
        steps: [
          { text: 'La densidad solo depende de $\\rho$; las integrales en $\\theta$ y $\\varphi$ dan $2\\pi \\cdot 2 = 4\\pi$.', math: 'm = \\int_0^{\\pi}\\!\\int_0^{2\\pi}\\!\\int_0^{1} (12 - 8\\rho)\\,\\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi = 4\\pi\\int_0^1 (12\\rho^2 - 8\\rho^3)\\,d\\rho' },
          { text: 'Integra en $\\rho$.', math: '\\int_0^1 (12\\rho^2 - 8\\rho^3)\\,d\\rho = 4 - 2 = 2' },
          { text: 'Multiplica.', math: 'm = 4\\pi\\cdot 2 = 8\\pi \\approx 25.13' }
        ],
        answer: '$m = 8\\pi \\approx 25.13$. Es como sumar cascarones de volumen $4\\pi\\rho^2\\,d\\rho$, cada uno con su densidad. Con densidad constante 4 (la de la superficie) saldría solo $\\frac{16\\pi}{3} \\approx 16.76$: el núcleo pesa mucho.',
        verify: { lab: 'call', mod: 'sphElement', fn: 'integrate', args: [function (x, y, z) { return 12 - 8 * rad(x, y, z); }, 'sph', SPH(1)], value: e4 }
      },
      {
        type: 'example', heading: 'El centroide de un hemisferio',
        problem: '<p>Encuentra el centroide del hemisferio sólido $x^2 + y^2 + z^2 \\le 4$, $z \\ge 0$ (densidad constante).</p>',
        steps: [
          { text: 'Por simetría, $\\bar x = \\bar y = 0$. El hemisferio es $0 \\le \\rho \\le 2$, $0 \\le \\theta \\le 2\\pi$, $0 \\le \\varphi \\le \\frac{\\pi}{2}$, y su volumen es la mitad de la esfera.', math: 'V = \\tfrac{1}{2}\\cdot\\tfrac{4}{3}\\pi(2)^3 = \\frac{16\\pi}{3}' },
          { text: 'El momento $M_{xy} = \\iiint z\\,dV$, con $z = \\rho\\cos\\varphi$.', math: 'M_{xy} = \\int_0^{\\pi/2}\\!\\int_0^{2\\pi}\\!\\int_0^{2} (\\rho\\cos\\varphi)\\,\\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi' },
          { text: 'Se separa: $\\int_0^2 \\rho^3\\,d\\rho = 4$, $\\int_0^{2\\pi} d\\theta = 2\\pi$ y $\\int_0^{\\pi/2} \\cos\\varphi\\sin\\varphi\\,d\\varphi = \\frac{1}{2}$.', math: 'M_{xy} = 4\\cdot 2\\pi\\cdot\\tfrac{1}{2} = 4\\pi' },
          { text: 'Divide entre el volumen.', math: '\\bar z = \\frac{4\\pi}{16\\pi/3} = \\frac{3}{4} = 0.75' }
        ],
        answer: 'El centroide está en $\\left(0, 0, \\frac{3}{4}\\right)$. En general, $\\bar z = \\frac{3R}{8}$: un poco abajo de la mitad de la altura, porque abajo hay más volumen.',
        verify: { lab: 'call', mod: 'sphElement', fn: 'moments', args: [one, 'sph', [[0, 2], [0, 2 * PI], [0, PI / 2]]], values: { V: e5.V, zbar: e5.zbar } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué $\\varphi$ va de $0$ a $\\pi$ y no de $0$ a $2\\pi$?', a: 'Porque $\\varphi$ es el ángulo con el eje $z$ positivo: del polo norte ($\\varphi = 0$) al polo sur ($\\varphi = \\pi$). La vuelta completa alrededor del eje la da $\\theta$. Si pones $\\varphi$ hasta $2\\pi$, recorres todo dos veces y además el $\\sin\\varphi$ se vuelve negativo: la integral de la esfera da 0.' },
          { q: '¿El Jacobiano es $\\rho^2\\sin\\varphi$ o $\\rho\\sin\\varphi$?', a: '$\\rho^2\\sin\\varphi$. Dos lados de la cajita llevan $\\rho$: $\\rho\\,d\\varphi$ y $\\rho\\sin\\varphi\\,d\\theta$. Con un solo $\\rho$ las unidades no cuadran: el volumen debe salir en unidades al cubo.' },
          { q: '¿Por qué en cilíndricas es $r$ y no $r^2$?', a: 'Solo un lado se estira con la distancia al eje: el arco $r\\,d\\theta$. Los otros dos, $dr$ y $dz$, no dependen de dónde estés. En esféricas se estiran dos lados.' },
          { q: 'Si el integrando ya trae una $r$ (como $\\delta = r$), ¿todavía multiplico por el Jacobiano?', a: 'Sí. Una $r$ es la densidad y la otra es el tamaño de la cajita: quedan $r\\cdot r = r^2$. Son cosas distintas que se multiplican.' },
          { q: '¿Por qué la densidad se llama $\\delta$ y no $\\rho$?', a: 'Para no confundirla con la coordenada $\\rho$ de las esféricas. En muchos libros (y en S14) la densidad se llama $\\rho$; aquí, para que no choquen, usamos $\\delta$, como en S13.' },
          { q: '¿Cómo sé si el $\\theta$ va de $0$ a $2\\pi$ o menos?', a: 'Si el sólido da la vuelta completa alrededor del eje $z$ (esferas, conos, cilindros completos), va de $0$ a $2\\pi$. Si es un gajo o solo está en el primer octante, $\\theta$ va entre los dos semiplanos que lo cortan, por ejemplo de $0$ a $\\frac{\\pi}{2}$.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Cilíndricas: $dV = r\\,dr\\,d\\theta\\,dz$; esféricas: $dV = \\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi$, con $\\varphi$ de $0$ a $\\pi$ desde el eje $z$ positivo.',
          'El factor sale de los tres lados de la cajita: $d\\rho$, $\\rho\\,d\\varphi$ y $\\rho\\sin\\varphi\\,d\\theta$. Es el Jacobiano $\\left|\\frac{\\partial(x, y, z)}{\\partial(\\rho, \\theta, \\varphi)}\\right|$.',
          'Usa cilíndricas con un eje (cilindros, paraboloides) y esféricas con un centro (esferas, conos de helado).',
          'Volumen, masa y centro de masa se plantean igual que en S14; solo cambian los límites y aparece el Jacobiano.'
        ]
      }
    ],

    lab: {
      type: 'spherical-element', title: 'Elemento de volumen esférico',
      intro: 'Elige un sólido (esfera, cascarón, cono de helado, gajo, hemisferio, cilindro o cilindro con hueco) y mueve las divisiones en cada coordenada. El lab parte el sólido en cajitas y resalta una con sus tres lados ($d\\rho$, $\\rho\\,d\\varphi$ y $\\rho\\sin\\varphi\\,d\\theta$; o $dr$, $r\\,d\\theta$ y $dz$). La suma de las cajitas se compara con el valor exacto y con Monte Carlo en $x$, $y$, $z$; activa «sin el Jacobiano» para ver cuánto se equivoca. En el reto escribe el volumen, la masa o $\\bar z$: el lab te dice si olvidaste el Jacobiano, si te faltó el $\\sin\\varphi$ o usaste $\\rho$ en vez de $\\rho^2$, si pusiste $\\varphi$ hasta $2\\pi$ o $\\theta$ hasta $\\pi$, o si olvidaste la densidad.',
      cfg: { start: 2, n1: 3, n2: 8, n3: 4 }
    },

    formulas: [
      { label: 'Cilíndricas', tex: 'x = r\\cos\\theta,\\ y = r\\sin\\theta,\\ z = z' },
      { label: 'Esféricas', tex: 'x = \\rho\\sin\\varphi\\cos\\theta,\\ y = \\rho\\sin\\varphi\\sin\\theta,\\ z = \\rho\\cos\\varphi' },
      { label: 'dV en cilíndricas', tex: 'dV = r\\,dr\\,d\\theta\\,dz' },
      { label: 'dV en esféricas', tex: 'dV = \\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi' },
      { label: 'Jacobiano', tex: '\\left|\\frac{\\partial(x, y, z)}{\\partial(\\rho, \\theta, \\varphi)}\\right| = \\rho^2\\sin\\varphi' },
      { label: 'Esfera', tex: 'V = \\int_0^{\\pi}\\!\\int_0^{2\\pi}\\!\\int_0^{R} \\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi = \\frac{4}{3}\\pi R^3' },
      { label: 'Cono de helado', tex: 'V = \\frac{2\\pi}{3}R^3(1 - \\cos\\alpha)' }
    ],

    exercises: [
      {
        id: 'c2-s15-helado', title: 'El cono de helado',
        vars: { R: [1, 4, 1], q: [0, 2, 1] },
        prompt: function (v) { var C = CONES[v.q]; return '<p>Encuentra el volumen del sólido que está dentro de la esfera $x^2 + y^2 + z^2 = ' + v.R * v.R + '$ y arriba del cono $' + C.cone + '$.</p>'; },
        check: 'numeric',
        answer: function (v) { return 2 * PI / 3 * Math.pow(v.R, 3) * (1 - Math.cos(CONES[v.q].al)); },
        mistakes: {
          noJac: function (v) { return v.R * 2 * PI * CONES[v.q].al; },
          rho1: function (v) { return PI * v.R * v.R * (1 - Math.cos(CONES[v.q].al)); },
          rho2: function (v) { return 2 * PI / 3 * Math.pow(v.R, 3) * CONES[v.q].al; },
          thetaHalf: function (v) { return PI / 3 * Math.pow(v.R, 3) * (1 - Math.cos(CONES[v.q].al)); }
        },
        feedback: [
          { when: 'noJac', say: 'Integraste $d\\rho\\,d\\theta\\,d\\varphi$ sin el Jacobiano. En esféricas $dV = \\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi$.' },
          { when: 'rho1', say: 'Usaste $\\rho\\sin\\varphi$. El Jacobiano lleva $\\rho^2$: dos lados de la cajita miden $\\rho\\,d\\varphi$ y $\\rho\\sin\\varphi\\,d\\theta$.' },
          { when: 'rho2', say: 'Te faltó el $\\sin\\varphi$ del Jacobiano: $\\int_0^\\alpha \\sin\\varphi\\,d\\varphi = 1 - \\cos\\alpha$, no $\\alpha$.' },
          { when: 'thetaHalf', say: 'El sólido da la vuelta completa alrededor del eje $z$: $\\theta$ va de $0$ a $2\\pi$.' }
        ],
        oracle: { lab: 'call', mod: 'sphElement', fn: 'integrate', args: function (v) { return [one, 'sph', [[0, v.R], [0, 2 * PI], [0, CONES[v.q].al]]]; } },
        hint: 'La esfera es $\\rho = R$. Para el cono, sustituye $z = \\rho\\cos\\varphi$ y $\\sqrt{x^2 + y^2} = \\rho\\sin\\varphi$ y despeja $\\varphi$. Luego $\\varphi$ va de $0$ al cono.',
        solution: function (v) {
          var C = CONES[v.q], V = 2 * PI / 3 * Math.pow(v.R, 3) * (1 - Math.cos(C.al));
          return 'La esfera es $\\rho = ' + v.R + '$ y el cono es $\\varphi = ' + C.tex + '$. $$V = \\int_0^{' + C.tex + '}\\!\\int_0^{2\\pi}\\!\\int_0^{' + v.R + '} \\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi = \\frac{' + v.R + '^3}{3}\\cdot 2\\pi\\cdot\\left(1 - ' + C.cos + '\\right) \\approx ' + fx(V) + '$$';
        }
      },
      {
        id: 'c2-s15-masa', title: 'Masa con densidad radial',
        vars: { R: [1, 5, 1], k: [0.5, 4, 0.5] },
        prompt: function (v) { return '<p>Una esfera de radio $R = ' + v.R + '$ m tiene densidad $\\delta = ' + v.k + '\\rho$ kg/m³, donde $\\rho$ es la distancia al centro. ¿Cuál es su masa?</p>'; },
        check: 'numeric', unit: 'kg',
        answer: function (v) { return v.k * PI * Math.pow(v.R, 4); },
        mistakes: {
          noRho: function (v) { return 4 * PI * Math.pow(v.R, 3) / 3; },
          noJac: function (v) { return v.k * PI * PI * v.R * v.R; },
          rho1: function (v) { return 4 * PI * v.k * Math.pow(v.R, 3) / 3; },
          rho2: function (v) { return v.k * PI * PI * Math.pow(v.R, 4) / 2; }
        },
        feedback: [
          { when: 'noRho', say: 'Ese es el volumen de la esfera. La masa es $\\iiint \\delta\\,dV$: cada cajita pesa según su densidad.' },
          { when: 'noJac', say: 'Olvidaste el Jacobiano: el integrando es $k\\rho\\cdot\\rho^2\\sin\\varphi$, no solo $k\\rho$.' },
          { when: 'rho1', say: 'Usaste $\\rho\\sin\\varphi$ como Jacobiano. Es $\\rho^2\\sin\\varphi$: con la densidad queda $k\\rho^3\\sin\\varphi$.' },
          { when: 'rho2', say: 'Te faltó el $\\sin\\varphi$ del Jacobiano: $\\int_0^\\pi \\sin\\varphi\\,d\\varphi = 2$, no $\\pi$.' }
        ],
        oracle: { lab: 'call', mod: 'sphElement', fn: 'integrate', args: function (v) { return [function (x, y, z) { return v.k * rad(x, y, z); }, 'sph', SPH(v.R)]; } },
        hint: 'Integra $k\\rho\\cdot\\rho^2\\sin\\varphi$ sobre $0 \\le \\rho \\le R$, $0 \\le \\theta \\le 2\\pi$, $0 \\le \\varphi \\le \\pi$. Se separa en tres integrales.',
        solution: function (v) { return '$$m = \\int_0^{\\pi}\\!\\int_0^{2\\pi}\\!\\int_0^{' + v.R + '} ' + v.k + '\\rho\\cdot\\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi = ' + v.k + '\\cdot\\frac{' + v.R + '^4}{4}\\cdot 2\\pi\\cdot 2 = ' + v.k + '\\pi(' + v.R + ')^4 \\approx ' + fx(v.k * PI * Math.pow(v.R, 4)) + '\\ \\text{kg}$$'; }
      },
      {
        id: 'c2-s15-cil', title: 'Una triple en cilíndricas',
        vars: { R: [1, 4, 1], H: [2, 6, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\iiint_E (x^2 + y^2)\\,dV$, donde $E$ es el cilindro $x^2 + y^2 \\le ' + v.R * v.R + '$, $0 \\le z \\le ' + v.H + '$.</p>'; },
        check: 'numeric',
        answer: function (v) { return PI * v.H * Math.pow(v.R, 4) / 2; },
        mistakes: {
          noJac: function (v) { return 2 * PI * v.H * Math.pow(v.R, 3) / 3; },
          noH: function (v) { return PI * Math.pow(v.R, 4) / 2; }
        },
        feedback: [
          { when: 'noJac', say: 'Te faltó el Jacobiano: $x^2 + y^2 = r^2$ y además $dV = r\\,dr\\,d\\theta\\,dz$, así que queda $r^3$.' },
          { when: 'noH', say: 'Olvidaste la integral en $z$: aporta la altura del cilindro como factor.' }
        ],
        oracle: { lab: 'call', mod: 'sphElement', fn: 'integrate', args: function (v) { return [function (x, y) { return x * x + y * y; }, 'cyl', [[0, v.R], [0, 2 * PI], [0, v.H]]]; } },
        hint: 'En cilíndricas, $x^2 + y^2 = r^2$ y $dV = r\\,dr\\,d\\theta\\,dz$: integra $r^3$ con $r$ de $0$ a $R$, $\\theta$ de $0$ a $2\\pi$ y $z$ de $0$ a $H$.',
        solution: function (v) { return '$$\\int_0^{' + v.H + '}\\!\\int_0^{2\\pi}\\!\\int_0^{' + v.R + '} r^2\\cdot r\\,dr\\,d\\theta\\,dz = \\frac{' + v.R + '^4}{4}\\cdot 2\\pi\\cdot ' + v.H + ' \\approx ' + fx(PI * v.H * Math.pow(v.R, 4) / 2) + '$$'; }
      },
      {
        id: 'c2-s15-hemi', title: 'Centroide de un hemisferio',
        vars: { R: [1, 8, 1] },
        prompt: function (v) { return '<p>Encuentra la coordenada $\\bar z$ del centroide del hemisferio sólido $x^2 + y^2 + z^2 \\le ' + v.R * v.R + '$, $z \\ge 0$ (densidad constante).</p>'; },
        check: 'numeric',
        answer: function (v) { return 3 * v.R / 8; },
        mistakes: {
          noDiv: function (v) { return PI * Math.pow(v.R, 4) / 4; },
          noJac: function (v) { return v.R / PI; },
          half: function (v) { return v.R / 2; }
        },
        feedback: [
          { when: 'noDiv', say: 'Ese es el momento $M_{xy} = \\iiint z\\,dV$. Falta dividir entre el volumen $\\frac{2}{3}\\pi R^3$.' },
          { when: 'noJac', say: 'Calculaste sin el Jacobiano, tanto el momento como el volumen. Con $\\rho^2\\sin\\varphi$ sale otro número.' },
          { when: 'half', say: 'Esa es la mitad de la altura. Abajo hay más volumen que arriba (el hemisferio se angosta), así que el centroide queda más abajo.' }
        ],
        oracle: { lab: 'call', mod: 'sphElement', fn: 'moments', field: 'zbar', args: function (v) { return [one, 'sph', [[0, v.R], [0, 2 * PI], [0, PI / 2]]]; } },
        hint: '$M_{xy} = \\iiint \\rho\\cos\\varphi\\cdot\\rho^2\\sin\\varphi\\,dV$ con $\\varphi$ de $0$ a $\\frac{\\pi}{2}$; divide entre $V = \\frac{2}{3}\\pi R^3$.',
        solution: function (v) {
          return '$$M_{xy} = \\int_0^{\\pi/2}\\!\\int_0^{2\\pi}\\!\\int_0^{' + v.R + '} \\rho^3\\cos\\varphi\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi = \\frac{' + v.R + '^4}{4}\\cdot 2\\pi\\cdot\\frac{1}{2} = \\frac{\\pi(' + v.R + ')^4}{4}$$ $$\\bar z = \\frac{\\pi R^4/4}{2\\pi R^3/3} = \\frac{3R}{8} = ' + fx(3 * v.R / 8) + '$$';
        }
      },
      {
        id: 'c2-s15-cascaron', title: 'Volumen de un cascarón',
        vars: { a: [1, 4, 1], b: [2, 6, 1] },
        baseWhere: function (v) { return v.b > v.a; },
        prompt: function (v) { return '<p>Calcula el volumen del cascarón esférico $' + v.a * v.a + ' \\le x^2 + y^2 + z^2 \\le ' + v.b * v.b + '$ con una integral triple en esféricas.</p>'; },
        check: 'numeric',
        answer: function (v) { return 4 * PI * (Math.pow(v.b, 3) - Math.pow(v.a, 3)) / 3; },
        mistakes: {
          noJac: function (v) { return 2 * PI * PI * (v.b - v.a); },
          diffR: function (v) { return 4 * PI * Math.pow(v.b - v.a, 3) / 3; },
          rho1: function (v) { return 2 * PI * (v.b * v.b - v.a * v.a); }
        },
        feedback: [
          { when: 'noJac', say: 'Olvidaste el Jacobiano $\\rho^2\\sin\\varphi$: sin él sale $(b - a)\\cdot 2\\pi\\cdot\\pi$, que ni siquiera tiene unidades de volumen.' },
          { when: 'diffR', say: 'Ese es el volumen de una esfera de radio $b - a$. El cascarón es la esfera grande menos la chica: $\\rho$ va de $a$ a $b$ y queda $\\frac{b^3 - a^3}{3}$.' },
          { when: 'rho1', say: 'Usaste $\\rho\\sin\\varphi$; el Jacobiano es $\\rho^2\\sin\\varphi$.' }
        ],
        oracle: { lab: 'call', mod: 'sphElement', fn: 'integrate', args: function (v) { return [one, 'sph', [[v.a, v.b], [0, 2 * PI], [0, PI]]]; } },
        hint: 'Los radios son las raíces de los números: $\\rho$ va de $a$ a $b$; $\\theta$ de $0$ a $2\\pi$ y $\\varphi$ de $0$ a $\\pi$.',
        solution: function (v) { return '$$V = \\int_0^{\\pi}\\!\\int_0^{2\\pi}\\!\\int_{' + v.a + '}^{' + v.b + '} \\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi = \\frac{' + v.b + '^3 - ' + v.a + '^3}{3}\\cdot 2\\pi\\cdot 2 = \\frac{4\\pi(' + (Math.pow(v.b, 3) - Math.pow(v.a, 3)) + ')}{3} \\approx ' + fx(4 * PI * (Math.pow(v.b, 3) - Math.pow(v.a, 3)) / 3) + '$$'; }
      },
      {
        id: 'c2-s15-jac', title: 'Concepto: ¿cuál es el Jacobiano?',
        vars: { q: [0, 2, 1] },
        prompt: function (v) {
          var s = ['de polares $(r, \\theta)$, en el plano', 'de cilíndricas $(r, \\theta, z)$', 'de esféricas $(\\rho, \\theta, \\varphi)$, con $\\varphi$ desde el eje $z$ positivo'][v.q];
          return '<p>¿Cuál es el factor de escala (el valor absoluto del Jacobiano) del cambio ' + s + '?</p>';
        },
        check: 'choice',
        options: function (v) {
          var A = { text: '$r$' }, B = { text: '$\\rho^2\\sin\\varphi$' }, C = { text: '$\\rho\\sin\\varphi$' }, D = { text: '$r^2$' }, E1 = { text: '$1$' };
          if (v.q === 2) {
            B.correct = true;
            A.say = '$r$ es el Jacobiano de polares y cilíndricas, no el de esféricas.';
            C.say = 'Falta una $\\rho$: dos lados de la cajita llevan $\\rho$ ($\\rho\\,d\\varphi$ y $\\rho\\sin\\varphi\\,d\\theta$).';
            D.say = 'En esféricas la distancia al origen es $\\rho$ y el factor lleva $\\sin\\varphi$.';
            E1.say = 'Con factor 1 todas las cajitas medirían lo mismo, y las de afuera son más grandes.';
          } else {
            A.correct = true;
            B.say = 'Ese es el de esféricas. ' + (v.q === 0 ? 'En polares solo hay $r$ y $\\theta$.' : 'En cilíndricas la $z$ no se deforma.');
            C.say = 'Ese factor no corresponde a ningún sistema: el de esféricas lleva $\\rho^2$.';
            D.say = 'Solo un lado se estira con la distancia al eje: el arco $r\\,d\\theta$. Por eso es $r$, no $r^2$.';
            E1.say = 'Con factor 1 los pedazos lejos del eje medirían igual que los de cerca; el arco $r\\,d\\theta$ crece con $r$.';
          }
          return [A, B, C, D, E1];
        },
        answer: function (v) { return v.q === 2 ? '$\\rho^2\\sin\\varphi$' : '$r$'; },
        hint: 'Mide los lados de la cajita: ¿cuáles crecen al alejarte del eje o del origen?',
        solution: function (v) { return v.q === 2 ? 'Los lados son $d\\rho$, $\\rho\\,d\\varphi$ y $\\rho\\sin\\varphi\\,d\\theta$: su producto da $\\rho^2\\sin\\varphi\\,d\\rho\\,d\\theta\\,d\\varphi$.' : 'Los lados son $dr$, $r\\,d\\theta$' + (v.q === 1 ? ' y $dz$' : '') + ': el factor es $r$.'; }
      },
      {
        id: 'c2-s15-eleccion', title: 'Concepto: ¿qué sistema conviene?',
        vars: { s: [0, 3, 1] },
        prompt: function (v) {
          var t = ['el sólido entre los cilindros $x^2 + y^2 = 1$ y $x^2 + y^2 = 9$, con $0 \\le z \\le 4$',
            'el sólido dentro de la esfera $x^2 + y^2 + z^2 = 16$ y arriba del cono $z = \\sqrt{x^2 + y^2}$',
            'el cascarón entre las esferas de radio 2 y 5 centradas en el origen',
            'la caja $[0, 2] \\times [0, 3] \\times [0, 1]$'][v.s];
          return '<p>Vas a calcular el volumen de ' + t + '. ¿En qué sistema los límites quedan más sencillos?</p>';
        },
        check: 'choice',
        options: function (v) {
          var right = ['Cilíndricas', 'Esféricas', 'Esféricas', 'Rectangulares'][v.s];
          var all = [
            { text: 'Cilíndricas', say: v.s === 3 ? 'Las caras de la caja son planos $x = $ constante y $y = $ constante, que en cilíndricas no son sencillos.' : 'Las esferas y los conos desde el origen se describen mejor con $\\rho$ y $\\varphi$.' },
            { text: 'Esféricas', say: v.s === 0 ? 'Los cilindros son $r = $ constante en cilíndricas; en esféricas serían $\\rho\\sin\\varphi = $ constante.' : 'La caja tiene caras planas: en esféricas sus límites serían complicados.' },
            { text: 'Rectangulares', say: 'Saldrían raíces cuadradas en los límites; el sólido es redondo.' }
          ];
          return all.map(function (o) { return o.text === right ? { text: o.text, correct: true } : o; });
        },
        answer: function (v) { return ['Cilíndricas', 'Esféricas', 'Esféricas', 'Rectangulares'][v.s]; },
        hint: 'Busca el sistema en el que cada superficie del borde es «coordenada = constante».',
        solution: function (v) {
          return ['En cilíndricas: $1 \\le r \\le 3$, $0 \\le \\theta \\le 2\\pi$, $0 \\le z \\le 4$.',
            'En esféricas: $0 \\le \\rho \\le 4$, $0 \\le \\theta \\le 2\\pi$, $0 \\le \\varphi \\le \\frac{\\pi}{4}$.',
            'En esféricas: $2 \\le \\rho \\le 5$, $0 \\le \\theta \\le 2\\pi$, $0 \\le \\varphi \\le \\pi$.',
            'En rectangulares: $0 \\le x \\le 2$, $0 \\le y \\le 3$, $0 \\le z \\le 1$.'][v.s];
        }
      }
    ],

    quiz: { tags: ['c2.S15'], count: 8 },

    errors: [
      'Olvidar el Jacobiano: integrar $d\\rho\\,d\\theta\\,d\\varphi$ o $dr\\,d\\theta\\,dz$ sin el factor $\\rho^2\\sin\\varphi$ o $r$.',
      'Usar $\\rho\\sin\\varphi$ o $\\rho^2$ en vez de $\\rho^2\\sin\\varphi$.',
      'Poner $\\varphi$ de $0$ a $2\\pi$ (con el $\\sin\\varphi$ la esfera da 0) o $\\theta$ de $0$ a $\\pi$ (sale la mitad).',
      'Medir $\\varphi$ desde el piso en vez de desde el eje $z$ positivo: el cono $z = \\sqrt{x^2 + y^2}$ es $\\varphi = \\frac{\\pi}{4}$ y «arriba del cono» es $0 \\le \\varphi \\le \\frac{\\pi}{4}$.',
      'Confundir la densidad con la coordenada $\\rho$, o creer que si el integrando ya tiene $r$ no hace falta el Jacobiano.',
      'Para el centro de masa, no dividir entre la masa (o el volumen).'
    ],

    teacher: {
      plan: [
        'Arranca con la cebolla y el globo terráqueo: cajitas iguales en ángulo no miden lo mismo.',
        'Cilíndricas como polares + altura: liga con la $r$ de S13.',
        'Explainer de la cajita esférica: que midan los tres lados y los multipliquen. Comprueba con la esfera $\\frac{4}{3}\\pi R^3$.',
        'El Jacobiano como determinante: haz el de polares en el pizarrón y muestra que el de esféricas da $\\rho^2\\sin\\varphi$.',
        'Lab: el cono de helado con el interruptor «sin el Jacobiano»; luego el reto con la esfera y $\\delta = \\rho$.',
        'Cierra con el hemisferio ($\\bar z = \\frac{3R}{8}$) y la conexión con la ley de Gauss de Física 2.'
      ],
      check: [
        'Que escriban el Jacobiano antes de los límites.',
        'Que digan de dónde a dónde va $\\varphi$ y por qué.'
      ],
      note: 'Es la última sesión del curso. El cambio de variables general (§5.7 de OpenStax) se presenta solo como idea: el Jacobiano como factor de escala del elemento.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §5.5 “Triple Integrals in Cylindrical and Spherical Coordinates”. <a href="https://openstax.org/books/calculus-volume-3/pages/5-5-triple-integrals-in-cylindrical-and-spherical-coordinates">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 3</em>, §5.7 “Change of Variables in Multiple Integrals”. <a href="https://openstax.org/books/calculus-volume-3/pages/5-7-change-of-variables-in-multiple-integrals">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-14',
    next: null
  };
  data.exercises.forEach(function (ex) {
    if (ex.check !== 'numeric' || !ex.mistakes) return;
    ex.where = apart(ex);
  });
})();
