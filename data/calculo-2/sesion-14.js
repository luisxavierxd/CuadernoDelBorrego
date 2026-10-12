/* =====================================================================
   Cálculo 2 · S14 · Integral triple en rectangulares (bloque C · Integral múltiple).
   Fuente: OpenStax, Calculus Volume 3, §5.4 y §5.6 (CC BY-NC-SA 4.0).
   Las respuestas se calculan aquí con fórmulas cerradas; scripts/examples.test.js
   las compara contra LabMath.triple (integral iterada por cuadratura en rectangulares).
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a; }
  // Plano x/a + y/b + z/c = 1 con coeficientes enteros: bc·x + ac·y + ab·z = abc (reducido).
  function plane(a, b, c) {
    var p = b * c, q = a * c, r = a * b, d = a * b * c, g = gcd(gcd(p, q), gcd(r, d));
    function t(k, s) { return (k / g === 1 ? '' : String(k / g)) + s; }
    return t(p, 'x') + ' + ' + t(q, 'y') + ' + ' + t(r, 'z') + ' = ' + d / g;
  }
  function T() { return window.LabMath.triple; }
  function boxL(a, b, c) { return [[0, a], function () { return [0, b]; }, function () { return [0, c]; }]; }
  function tetL(a, b, c) { return [[0, a], function (x) { return [0, b * (1 - x / a)]; }, function (x, y) { return [0, c * (1 - x / a - y / b)]; }]; }

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

  // Ejemplo 4: cubo [0, 2]³ con densidad ρ = 1 + z.
  var e4 = { M: 16, Mxy: 56 / 3 };
  e4.zbar = e4.Mxy / e4.M;

  var data = window.SESSION_DATA = {
    slug: 'sesion-14', number: '14', group: 'C · Integral múltiple',
    title: 'Integral triple en rectangulares: volumen, masa y centro de masa', temario: [],
    minutes: 180,
    quote: 'Llena el sólido de cubitos, multiplica cada uno por lo que vale y súmalos. Al hacerlos cada vez más chicos, la suma se vuelve una integral triple.',
    badges: [
      'Plantear $\\iiint_E f\\,dV$ como el límite de sumas de $f\\cdot\\Delta V$ sobre cubitos.',
      'Integrar sobre una caja en cualquiera de los seis órdenes (Fubini).',
      'Escribir los límites de un sólido general: $z$ entre dos superficies sobre su sombra $D$.',
      'Calcular volumen, masa, momentos, centro de masa y valor promedio de un sólido.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Una integral triple suma una cantidad sobre un <strong>sólido</strong>: lo partes en cubitos $dV = dx\\,dy\\,dz$, multiplicas cada uno por $f$ y sumas. Se calcula como tres integrales sencillas, una dentro de otra.',
        recall: [
          'La integral doble como suma de prismas y el teorema de Fubini (<a href="../sesion-11/">S11</a>), y las regiones generales tipo I y tipo II (<a href="../sesion-12/">S12</a>): la triple termina siendo una doble sobre la sombra del sólido.',
          'La integral definida como suma de rebanadas (<a href="../../../calculo-1/sesiones/sesion-09/">Cálculo 1, S09</a>) y el volumen por rebanadas de los sólidos de revolución (<a href="../../../calculo-1/sesiones/sesion-15/">Cálculo 1, S15</a>).',
          'Planos y paraboloides en 3D y sus intersecciones (<a href="../sesion-01/">S01</a>).'
        ],
        why: 'La masa de una pieza que no es homogénea, el centro de gravedad de una presa, la carga eléctrica dentro de un volumen ($Q = \\iiint \\rho\\,dV$, como en Física 2) o la temperatura promedio de un cuarto: todo se calcula sumando sobre un sólido. La integral triple es la herramienta para eso.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en una caja de cereal llena de cubitos de azúcar. Si quieres saber cuánto volumen ocupa, cuentas los cubitos y multiplicas por el volumen de uno. Si unos cubitos pesan más que otros (abajo están más apretados), multiplicas cada uno por su densidad y sumas: así sale la masa.',
          'Para contarlos ordenadamente, primero apilas los cubitos de una columna (de abajo hacia arriba), luego juntas las columnas de una rebanada y al final juntas las rebanadas. Esas tres sumas, una dentro de otra, son las tres integrales de la triple.',
          'Ahora imagina un trozo de queso con forma de cuña. No llena toda la caja: cada columna llega hasta una altura distinta y algunas columnas ni existen. Por eso los límites importan: dicen dónde empieza y dónde termina cada columna, y sobre qué región del piso (la <strong>sombra</strong> del sólido) hay columnas.'
        ]
      },
      {
        type: 'concept', heading: 'De la doble a la triple', short: 'La integral triple',
        body: [
          'Encierra el sólido $E$ en una caja y pártela en cubitos de lados $\\Delta x$, $\\Delta y$, $\\Delta z$. Cada uno tiene volumen $\\Delta V = \\Delta x\\,\\Delta y\\,\\Delta z$. Escoge un punto $(x_i, y_j, z_k)$ en cada cubito que cae dentro de $E$ y suma: $$\\sum_{i,j,k} f(x_i, y_j, z_k)\\,\\Delta V.$$',
          'Si al hacer los cubitos cada vez más chicos la suma se acerca a un número, ese número es la <strong>integral triple</strong> $\\displaystyle\\iiint_E f(x, y, z)\\,dV$. Si $f$ es continua y $E$ es un sólido razonable (acotado por superficies suaves), el límite siempre existe.',
          'Su significado depende de $f$. Con $f = 1$ sumas solo volúmenes: $\\iiint_E 1\\,dV$ es el <strong>volumen</strong> de $E$. Con $f = \\rho$, una densidad en kg/m³, sumas masas: $\\iiint_E \\rho\\,dV$ es la <strong>masa</strong>.'
        ]
      },
      {
        type: 'explainer', heading: 'Del cubito a la integral', short: 'Cubito, columna, rebanada',
        title: 'Tres sumas, una dentro de otra',
        intro: 'El sólido es el tetraedro bajo el plano $x + y + z = 4$ en el primer octante. Mira cómo se arma con cubitos.',
        diagram: 'c2s14-cubes',
        steps: [
          { text: 'Un cubito de lados $dx$, $dy$, $dz$: su volumen es $dV = dx\\,dy\\,dz$ y aporta $f\\,dV$.', state: { k: 0 } },
          { text: 'Apila los cubitos de una columna, desde el piso hasta la tapa $z = 4 - x - y$: es la integral de adentro, en $z$.', state: { k: 1 } },
          { text: 'Junta las columnas de una rebanada con $x$ fijo: $y$ va de $0$ a $4 - x$. Es la integral de en medio.', state: { k: 2 } },
          { text: 'Junta todas las rebanadas, $x$ de $0$ a $4$: $\\displaystyle\\int_0^4\\!\\int_0^{4-x}\\!\\int_0^{4-x-y} f\\,dz\\,dy\\,dx$. Con cubitos más chicos la escalera se pega al sólido.', state: { k: 3 } }
        ]
      },
      {
        type: 'concept', heading: 'Fubini en una caja: seis órdenes', short: 'Fubini en una caja',
        body: [
          'Si $E$ es la caja $[a, b] \\times [c, d] \\times [r, s]$, todos los límites son números y la integral triple se calcula como tres integrales iteradas: $$\\iiint_E f\\,dV = \\int_a^b\\!\\int_c^d\\!\\int_r^s f(x, y, z)\\,dz\\,dy\\,dx.$$ La de adentro se hace primero, tratando a las otras variables como constantes, igual que en las parciales (S04).',
          'Puedes integrar en cualquier orden: $dz\\,dy\\,dx$, $dx\\,dz\\,dy$, $dy\\,dx\\,dz$… son $3! = 6$ órdenes, y en una caja todos dan lo mismo (teorema de Fubini). Elige el que deje las cuentas más fáciles.',
          'Truco: si $f$ es un producto $g(x)\\,h(y)\\,k(z)$, la triple sobre una caja se separa en tres integrales sencillas: $\\left(\\int_a^b g\\right)\\left(\\int_c^d h\\right)\\left(\\int_r^s k\\right)$. Y si un término no tiene una variable, al integrarla sale multiplicado por la longitud de su intervalo.'
        ]
      },
      {
        type: 'concept', heading: 'Sólidos generales: $z$ entre dos superficies', short: 'Sólidos generales',
        body: [
          'Casi ningún sólido es una caja. El caso más común: $E$ está entre una superficie de abajo $z = u_1(x, y)$ y una de arriba $z = u_2(x, y)$, sobre una región $D$ del plano $xy$. Entonces $$\\iiint_E f\\,dV = \\iint_D \\left[\\int_{u_1(x, y)}^{u_2(x, y)} f(x, y, z)\\,dz\\right] dA.$$',
          'La integral de adentro recorre una columna vertical: entra al sólido por la superficie de abajo y sale por la de arriba. Lo que queda es una <strong>integral doble sobre $D$</strong>, que ya sabes plantear como región tipo I ($y$ entre dos curvas) o tipo II ($x$ entre dos curvas), como en <a href="../sesion-12/">S12</a>.',
          'Con $f = 1$, la integral de adentro da la altura de la columna, $u_2 - u_1$, y queda $V = \\iint_D (u_2 - u_1)\\,dA$: el volumen entre dos superficies de S11 y S12. La triple no contradice a la doble; la generaliza.'
        ]
      },
      {
        type: 'explainer', heading: 'Cómo encontrar los límites', short: 'La sombra D',
        title: 'Columna, sombra y rebanada',
        intro: 'El sólido es la cuña bajo el plano $z = 5 - x - y$, sobre el triángulo $0 \\le y \\le x \\le 2$. Lee los límites de adentro hacia afuera.',
        diagram: 'c2s14-shadow',
        steps: [
          { text: 'Dibuja el sólido: piso $z = 0$, tapa $z = 5 - x - y$ y paredes verticales $y = 0$, $y = x$ y $x = 2$.', state: { s: 1 } },
          { text: 'Proyecta el sólido al piso: su <strong>sombra</strong> $D$ es el triángulo con vértices $(0, 0)$, $(2, 0)$ y $(2, 2)$.', state: { s: 2 } },
          { text: 'Toma un punto $(x, y)$ de $D$ y sube en línea recta: entras al sólido en $z = 0$ y sales en $z = 5 - x - y$. Esos son los límites de $z$.', state: { s: 3 } },
          { text: 'Ahora trabaja en $D$: con $x$ fijo, $y$ va de $0$ a $x$.', state: { s: 4 } },
          { text: 'Y $x$ recorre de $0$ a $2$: $\\displaystyle V = \\int_0^2\\!\\int_0^{x}\\!\\int_0^{5-x-y} dz\\,dy\\,dx = 6$.', state: { s: 5 } }
        ]
      },
      {
        type: 'callout', heading: '¿Cómo encuentro la sombra $D$?',
        body: [
          'Mira el sólido desde arriba. Si está acotado por paredes verticales (planos como $x = 2$ o $y = x$), esas paredes son el borde de $D$.',
          'Si el sólido está entre dos superficies que se cortan, iguálalas: la curva donde se tocan, vista desde arriba, es el borde de $D$. Por ejemplo, $z = x^2 + y^2$ y $z = 8 - x^2 - y^2$ se tocan cuando $x^2 + y^2 = 4$: la sombra es el disco de radio 2.',
          'Si la tapa es un plano que corta al piso $z = 0$ (como el tetraedro), pon $z = 0$ en la ecuación del plano: la recta que queda cierra a $D$.'
        ]
      },
      {
        type: 'concept', heading: 'Masa, momentos y centro de masa', short: 'Masa y centro de masa',
        body: [
          'Si el sólido tiene densidad $\\rho(x, y, z)$, su <strong>masa</strong> es $m = \\iiint_E \\rho\\,dV$. Los <strong>momentos</strong> respecto a los planos coordenados pesan cada cubito por su distancia al plano: $$\\begin{aligned} M_{yz} &= \\iiint_E x\\,\\rho\\,dV \\\\ M_{xz} &= \\iiint_E y\\,\\rho\\,dV \\\\ M_{xy} &= \\iiint_E z\\,\\rho\\,dV \\end{aligned}$$',
          'El <strong>centro de masa</strong> es el punto de equilibrio: $$\\bar x = \\frac{M_{yz}}{m}, \\quad \\bar y = \\frac{M_{xz}}{m}, \\quad \\bar z = \\frac{M_{xy}}{m}.$$ Cada coordenada es un promedio de $x$ (o $y$, o $z$) en el que cada cubito pesa lo que pesa su masa. Por eso se divide entre la masa, no entre el volumen.',
          'Si la densidad es constante, se cancela y el centro de masa es el <strong>centroide</strong>, el centro geométrico. Por ejemplo, el centroide del tetraedro bajo $\\frac{x}{a} + \\frac{y}{b} + \\frac{z}{c} = 1$ es $\\left(\\frac{a}{4}, \\frac{b}{4}, \\frac{c}{4}\\right)$. Si el sólido es simétrico respecto a un plano y $\\rho$ también, el centro de masa está en ese plano.',
          'El <strong>valor promedio</strong> de $f$ en $E$ sigue la misma idea: $f_{\\text{prom}} = \\dfrac{1}{V}\\iiint_E f\\,dV$. Por ejemplo, la temperatura promedio de un cuarto.'
        ]
      },
      {
        type: 'callout', heading: 'Cambiar el orden en un tetraedro (opcional)',
        body: [
          'En el tetraedro bajo $x + y + z = 4$ también puedes integrar primero en $x$: la sombra ahora está en el plano $yz$. Proyectas al plano $yz$, obtienes el triángulo $0 \\le z \\le 4 - y$, $0 \\le y \\le 4$, y cada línea horizontal entra por $x = 0$ y sale por $x = 4 - y - z$.',
          'El resultado es el mismo: $\\displaystyle\\int_0^4\\!\\int_0^{4-y}\\!\\int_0^{4-y-z} dx\\,dz\\,dy = \\frac{32}{3}$. La regla es siempre la misma: la variable de adentro va entre dos superficies; las otras dos describen la sombra en el plano de esas dos variables.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: plantear y calcular una integral triple', short: 'Receta',
        steps: [
          { text: 'Dibuja el sólido. Identifica la superficie de abajo $z = u_1(x, y)$ y la de arriba $z = u_2(x, y)$.', tip: 'Si no sabes cuál está arriba, evalúa las dos en un punto de adentro: la mayor es la tapa. Al revés, la integral sale con el signo cambiado.' },
          { text: 'Encuentra la sombra $D$ en el plano $xy$: paredes verticales, la intersección de las dos superficies o la recta donde la tapa corta al piso.', tip: 'No integres sobre el rectángulo que envuelve a $D$ si $D$ es un triángulo: los límites de $y$ dependen de $x$.' },
          { text: 'Escribe $D$ como región tipo I o tipo II y arma los límites: $z$ de $u_1$ a $u_2$, luego $y$ (o $x$) entre dos curvas, luego números.' },
          { text: 'Integra de adentro hacia afuera; en cada paso las variables de afuera son constantes.' },
          { text: 'Para masa, multiplica por $\\rho$. Para centro de masa, calcula cada momento y divide entre la masa.', tip: 'Con densidad variable divide entre $m = \\iiint \\rho\\,dV$, no entre el volumen.' }
        ]
      },
      {
        type: 'example', heading: 'Una integral sobre una caja',
        problem: '<p>Calcula $\\displaystyle\\iiint_B x\\,y\\,z^2\\,dV$, donde $B = [0, 1] \\times [0, 2] \\times [0, 3]$.</p>',
        steps: [
          { text: 'Integral de adentro, en $z$ (con $x$ y $y$ constantes).', math: '\\int_0^3 x y z^2\\,dz = x y\\,\\frac{z^3}{3}\\Big|_0^3 = 9xy' },
          { text: 'Luego en $y$.', math: '\\int_0^2 9xy\\,dy = 9x\\,\\frac{y^2}{2}\\Big|_0^2 = 18x' },
          { text: 'Y al final en $x$.', math: '\\int_0^1 18x\\,dx = 9' },
          { text: 'Atajo: como $f$ es un producto, la integral se separa.', math: '\\left(\\int_0^1 x\\,dx\\right)\\left(\\int_0^2 y\\,dy\\right)\\left(\\int_0^3 z^2\\,dz\\right) = \\tfrac{1}{2}\\cdot 2 \\cdot 9 = 9' }
        ],
        answer: '$\\displaystyle\\iiint_B x\\,y\\,z^2\\,dV = 9$, en cualquier orden.',
        verify: { lab: 'call', mod: 'triple', fn: 'integrate', args: [function (x, y, z) { return x * y * z * z; }].concat(boxL(1, 2, 3)), value: 9 }
      },
      {
        type: 'example', heading: 'El volumen de un tetraedro',
        problem: '<p>Encuentra el volumen del tetraedro acotado por los planos coordenados y el plano $2x + 3y + 6z = 6$.</p>',
        steps: [
          { text: 'Tapa: despeja $z$. Piso: $z = 0$.', math: 'z = 1 - \\frac{x}{3} - \\frac{y}{2}' },
          { text: 'Sombra: con $z = 0$ queda la recta $2x + 3y = 6$. $D$ es el triángulo $0 \\le x \\le 3$, $0 \\le y \\le 2 - \\frac{2x}{3}$.', math: 'V = \\int_0^3\\!\\int_0^{2 - 2x/3}\\!\\int_0^{1 - x/3 - y/2} dz\\,dy\\,dx' },
          { text: 'La de adentro da la altura de la columna. Llama $u = 1 - \\frac{x}{3}$: la altura es $u - \\frac{y}{2}$ y $y$ va de $0$ a $2u$.', math: '\\int_0^{2u} \\left(u - \\frac{y}{2}\\right) dy = 2u^2 - u^2 = u^2' },
          { text: 'Y al final en $x$.', math: '\\int_0^3 \\left(1 - \\frac{x}{3}\\right)^2 dx = 3 \\cdot \\frac{1}{3} = 1' }
        ],
        answer: '$V = 1$. Coincide con la fórmula $\\frac{abc}{6}$ con las intersecciones $a = 3$, $b = 2$, $c = 1$: el tetraedro es un sexto de su caja.',
        verify: { lab: 'call', mod: 'triple', fn: 'integrate', args: [function () { return 1; }].concat(tetL(3, 2, 1)), value: 1 }
      },
      {
        type: 'example', heading: 'El sólido entre dos paraboloides',
        problem: '<p>Encuentra el volumen del sólido entre los paraboloides $z = x^2 + y^2$ (abajo) y $z = 8 - x^2 - y^2$ (arriba).</p>',
        steps: [
          { text: 'Sombra: iguala las superficies para ver dónde se tocan.', math: 'x^2 + y^2 = 8 - x^2 - y^2 \\iff x^2 + y^2 = 4' },
          { text: '$D$ es el disco de radio 2. En rectangulares: $-2 \\le x \\le 2$, $-\\sqrt{4 - x^2} \\le y \\le \\sqrt{4 - x^2}$.', math: 'V = \\int_{-2}^{2}\\!\\int_{-\\sqrt{4 - x^2}}^{\\sqrt{4 - x^2}}\\!\\int_{x^2 + y^2}^{8 - x^2 - y^2} dz\\,dy\\,dx' },
          { text: 'La de adentro da la altura: $(8 - x^2 - y^2) - (x^2 + y^2) = 8 - 2(x^2 + y^2)$. Sobre un disco conviene pasar a polares (<a href="../sesion-13/">S13</a>), con $dA = r\\,dr\\,d\\theta$.', math: 'V = \\int_0^{2\\pi}\\!\\int_0^2 (8 - 2r^2)\\,r\\,dr\\,d\\theta' },
          { text: 'Integra.', math: 'V = 2\\pi\\left[4r^2 - \\frac{r^4}{2}\\right]_0^2 = 2\\pi(16 - 8) = 16\\pi \\approx 50.27' }
        ],
        answer: '$V = 16\\pi \\approx 50.27$. La triple en rectangulares da lo mismo; las polares solo hacen más fácil la doble sobre el disco.',
        verify: { lab: 'call', mod: 'triple', fn: 'integrate', args: [function () { return 1; }, [-2, 2], function (x) { var s = Math.sqrt(Math.max(0, 4 - x * x)); return [-s, s]; }, function (x, y) { return [x * x + y * y, 8 - x * x - y * y]; }], value: 16 * Math.PI }
      },
      {
        type: 'example', heading: 'Masa y centro de masa de un cubo',
        problem: '<p>Un cubo ocupa $[0, 2] \\times [0, 2] \\times [0, 2]$ (en metros) y su densidad crece con la altura: $\\rho = 1 + z$ (en kg/m³). Encuentra su masa y su centro de masa.</p>',
        steps: [
          { text: 'Masa. $\\rho$ no depende de $x$ ni de $y$: esas integrales dan la longitud de cada lado, 2 y 2.', math: 'm = \\int_0^2\\!\\int_0^2\\!\\int_0^2 (1 + z)\\,dz\\,dy\\,dx = 2 \\cdot 2 \\cdot \\left[z + \\frac{z^2}{2}\\right]_0^2 = 4 \\cdot 4 = 16\\ \\text{kg}' },
          { text: 'Momento respecto al piso, $M_{xy} = \\iiint z\\,\\rho\\,dV$.', math: 'M_{xy} = 4\\int_0^2 (z + z^2)\\,dz = 4\\left(2 + \\frac{8}{3}\\right) = \\frac{56}{3}' },
          { text: 'Divide entre la masa.', math: '\\bar z = \\frac{56/3}{16} = \\frac{7}{6} \\approx 1.17\\ \\text{m}' },
          { text: 'En $x$ y $y$ el cubo y la densidad son simétricos respecto al centro: $\\bar x = \\bar y = 1$.' }
        ],
        answer: '$m = 16$ kg y el centro de masa está en $\\left(1, 1, \\frac{7}{6}\\right)$: un poco arriba del centro geométrico $(1, 1, 1)$, porque arriba hay más masa.',
        verify: { lab: 'call', mod: 'triple', fn: 'moments', args: [function (x, y, z) { return 1 + z; }].concat(boxL(2, 2, 2)), values: { M: e4.M, Mxy: e4.Mxy, zbar: e4.zbar, xbar: 1, ybar: 1 } }
      },
      {
        type: 'example', heading: 'El centroide del tetraedro',
        problem: '<p>Encuentra la coordenada $\\bar z$ del centroide del tetraedro del ejemplo 2 (densidad constante), acotado por $2x + 3y + 6z = 6$ y los planos coordenados.</p>',
        steps: [
          { text: 'Con $\\rho$ constante, la densidad se cancela: $\\bar z = \\frac{1}{V}\\iiint z\\,dV$, y ya sabes que $V = 1$.' },
          { text: 'Integral de adentro, con la misma $u = 1 - \\frac{x}{3}$ del ejemplo 2.', math: '\\int_0^{u - y/2} z\\,dz = \\frac{1}{2}\\left(u - \\frac{y}{2}\\right)^2' },
          { text: 'En $y$, de $0$ a $2u$ (sustituye $w = u - \\frac{y}{2}$, $dy = -2\\,dw$).', math: '\\int_0^{2u} \\frac{1}{2}\\left(u - \\frac{y}{2}\\right)^2 dy = \\int_0^u w^2\\,dw = \\frac{u^3}{3}' },
          { text: 'En $x$.', math: '\\int_0^3 \\frac{1}{3}\\left(1 - \\frac{x}{3}\\right)^3 dx = \\frac{1}{3}\\cdot\\frac{3}{4} = \\frac{1}{4}' }
        ],
        answer: '$\\bar z = \\frac{1/4}{1} = \\frac{1}{4}$, la cuarta parte de la altura $c = 1$. Igual salen $\\bar x = \\frac{3}{4}$ y $\\bar y = \\frac{1}{2}$: el centroide es $\\left(\\frac{a}{4}, \\frac{b}{4}, \\frac{c}{4}\\right)$.',
        verify: { lab: 'call', mod: 'triple', fn: 'moments', args: [function () { return 1; }].concat(tetL(3, 2, 1)), values: { V: 1, zbar: 0.25, xbar: 0.75, ybar: 0.5 } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué con $f = 1$ sale el volumen?', a: 'Porque la suma de $1\\cdot\\Delta V$ sobre los cubitos es la suma de sus volúmenes. Igual que en la doble $\\iint_D 1\\,dA$ da el área.' },
          { q: '¿En qué orden integro?', a: 'En una caja, en el que quieras: los seis dan lo mismo. En un sólido general, el de adentro suele ser $z$ (entre la superficie de abajo y la de arriba), pero puede convenir otro si el sólido se describe mejor con $x$ o $y$ entre dos superficies.' },
          { q: '¿Los límites de adentro pueden tener variables?', a: 'Sí, y casi siempre las tienen: los de $z$ dependen de $x$ y $y$; los de $y$, de $x$. Los de afuera son siempre números. Si al final te queda una variable suelta, hay un error en los límites.' },
          { q: '¿Cómo sé cuál superficie está arriba?', a: 'Evalúa las dos en un punto de $D$. La que da el valor mayor es la tapa. Si las inviertes, la integral sale negativa.' },
          { q: '¿El centro de masa se divide entre el volumen o entre la masa?', a: 'Entre la masa: $\\bar z = M_{xy}/m$. Solo si la densidad es constante da lo mismo que el centroide $\\frac{1}{V}\\iiint z\\,dV$.' },
          { q: '¿El centro de masa tiene que estar dentro del sólido?', a: 'No siempre. En un sólido con forma de U o de dona puede quedar en el hueco. En un sólido convexo, como una caja o un tetraedro, sí queda adentro.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          '$\\iiint_E f\\,dV$ es el límite de $\\sum f\\,\\Delta V$ sobre cubitos; con $f = 1$ es el volumen y con $f = \\rho$, la masa.',
          'En una caja, los límites son números y los seis órdenes dan lo mismo.',
          'Sólido general: $z$ de la superficie de abajo a la de arriba y luego una doble sobre la sombra $D$.',
          'Centro de masa: momento entre masa, $\\bar x = \\frac{1}{m}\\iiint x\\rho\\,dV$; con $\\rho$ constante es el centroide.'
        ]
      }
    ],

    lab: {
      type: 'triple-cubes', title: 'Cubitos → sólido',
      intro: 'Elige un sólido y una densidad, y mueve $n$ (divisiones en $x$ y $y$) y $m$ (divisiones en $z$). El lab llena el sólido con los cubitos cuyo centro queda adentro, muestra la sombra $D$ con la altura de cada columna y un corte vertical, y compara la suma $\\sum \\rho\\,\\Delta V$ con el valor exacto y con Monte Carlo. En el reto escribe el volumen, la masa o una coordenada del centro de masa: el lab te dice si usaste la región $D$ equivocada, si olvidaste la densidad, si no dividiste entre la masa o si invertiste los límites en $z$.',
      cfg: { start: 1, n: 4, m: 4 }
    },

    formulas: [
      { label: 'Integral triple', tex: '\\iiint_E f\\,dV = \\lim \\sum f(x_i, y_j, z_k)\\,\\Delta V' },
      { label: 'Caja (Fubini)', tex: '\\int_a^b\\!\\int_c^d\\!\\int_r^s f\\,dz\\,dy\\,dx' },
      { label: 'Sólido general', tex: '\\iint_D \\left[\\int_{u_1(x, y)}^{u_2(x, y)} f\\,dz\\right] dA' },
      { label: 'Volumen', tex: 'V = \\iiint_E 1\\,dV' },
      { label: 'Masa', tex: 'm = \\iiint_E \\rho\\,dV' },
      { label: 'Momentos', tex: 'M_{yz} = \\iiint x\\rho\\,dV,\\ M_{xz} = \\iiint y\\rho\\,dV,\\ M_{xy} = \\iiint z\\rho\\,dV' },
      { label: 'Centro de masa', tex: '\\bar x = \\frac{M_{yz}}{m},\\ \\bar y = \\frac{M_{xz}}{m},\\ \\bar z = \\frac{M_{xy}}{m}' },
      { label: 'Valor promedio', tex: 'f_{\\text{prom}} = \\frac{1}{V}\\iiint_E f\\,dV' }
    ],

    exercises: [
      {
        id: 'c2-s14-caja', title: 'Integral sobre una caja',
        vars: { a: [1, 4, 1], b: [1, 4, 1], c: [1, 4, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\iiint_B (xz + y)\\,dV$ sobre la caja $B = [0, ' + v.a + '] \\times [0, ' + v.b + '] \\times [0, ' + v.c + ']$.</p>'; },
        check: 'numeric',
        answer: function (v) { return v.a * v.a * v.b * v.c * v.c / 4 + v.a * v.b * v.b * v.c / 2; },
        mistakes: {
          noLen: function (v) { return v.a * v.a * v.c * v.c / 4 + v.b * v.b / 2; },
          noHalf: function (v) { return v.a * v.a * v.b * v.c * v.c + v.a * v.b * v.b * v.c; }
        },
        feedback: [
          { when: 'noLen', say: 'Cuando un término no tiene una variable, al integrarla sale multiplicado por la longitud de su intervalo: $\\int_0^b xz\\,dy = b\\,xz$. Te faltaron esos factores.' },
          { when: 'noHalf', say: 'Revisa las antiderivadas: $\\int_0^a x\\,dx = \\frac{a^2}{2}$, no $a^2$.' }
        ],
        oracle: { lab: 'call', mod: 'triple', fn: 'integrate', args: function (v) { return [function (x, y, z) { return x * z + y; }].concat(boxL(v.a, v.b, v.c)); } },
        hint: 'Separa en dos integrales. En $\\iiint xz\\,dV$ la $y$ no aparece: aporta un factor $b$. En $\\iiint y\\,dV$, $x$ y $z$ aportan $a$ y $c$.',
        solution: function (v) {
          var t1 = v.a * v.a * v.b * v.c * v.c / 4, t2 = v.a * v.b * v.b * v.c / 2;
          return '$$\\iiint xz\\,dV = \\frac{' + v.a + '^2}{2}\\cdot ' + v.b + '\\cdot\\frac{' + v.c + '^2}{2} = ' + fx(t1) + '$$ $$\\iiint y\\,dV = ' + v.a + '\\cdot\\frac{' + v.b + '^2}{2}\\cdot ' + v.c + ' = ' + fx(t2) + '$$ En total, $' + fx(t1 + t2) + '$.';
        }
      },
      {
        id: 'c2-s14-tetra', title: 'Volumen de un tetraedro',
        vars: { a: [1, 6, 1], b: [1, 6, 1], c: [1, 6, 1] },
        baseWhere: function (v) { return v.a * v.b * v.c >= 6; },
        prompt: function (v) { return '<p>Encuentra el volumen del tetraedro acotado por los planos coordenados y el plano $' + plane(v.a, v.b, v.c) + '$.</p>'; },
        check: 'numeric',
        answer: function (v) { return v.a * v.b * v.c / 6; },
        mistakes: {
          box: function (v) { return v.a * v.b * v.c; },
          prism: function (v) { return v.a * v.b * v.c / 2; },
          third: function (v) { return v.a * v.b * v.c / 3; }
        },
        feedback: [
          { when: 'box', say: 'Ese es el volumen de la caja que lo envuelve. El tetraedro solo llena una parte: la sombra $D$ es un triángulo y la altura de cada columna baja hasta 0.' },
          { when: 'prism', say: 'Ese es un prisma con base triangular y altura constante. La tapa es inclinada: la altura de la columna es $z = c\\left(1 - \\frac{x}{a} - \\frac{y}{b}\\right)$, no $c$.' },
          { when: 'third', say: 'Usaste la sombra rectangular con la tapa inclinada, o la fórmula de una pirámide de base rectangular. La sombra es el triángulo bajo la recta donde el plano corta al piso.' }
        ],
        oracle: { lab: 'call', mod: 'triple', fn: 'integrate', args: function (v) { return [function () { return 1; }].concat(tetL(v.a, v.b, v.c)); } },
        hint: 'Encuentra dónde corta el plano a cada eje (pon las otras dos variables en 0). Con $z = 0$ obtienes la recta que cierra la sombra $D$; la tapa es el plano despejado para $z$.',
        solution: function (v) {
          return 'El plano corta los ejes en $a = ' + v.a + '$, $b = ' + v.b + '$ y $c = ' + v.c + '$, así que es $\\frac{x}{' + v.a + '} + \\frac{y}{' + v.b + '} + \\frac{z}{' + v.c + '} = 1$. $$V = \\int_0^{' + v.a + '}\\!\\int_0^{' + v.b + '(1 - x/' + v.a + ')}\\!\\int_0^{' + v.c + '(1 - x/' + v.a + ' - y/' + v.b + ')} dz\\,dy\\,dx = \\frac{abc}{6} = \\frac{' + v.a * v.b * v.c + '}{6} \\approx ' + fx(v.a * v.b * v.c / 6) + '$$';
        }
      },
      {
        id: 'c2-s14-entre', title: 'Volumen entre dos superficies',
        vars: { a: [1, 3, 1], b: [1, 3, 1], h: [22, 30, 1] },
        prompt: function (v) { return '<p>Un sólido está sobre el rectángulo $D = [0, ' + v.a + '] \\times [0, ' + v.b + ']$, entre el paraboloide $z = x^2 + y^2$ (abajo) y el plano $z = ' + v.h + ' - x$ (arriba). ¿Cuál es su volumen?</p>'; },
        check: 'numeric',
        answer: function (v) { return v.h * v.a * v.b - v.a * v.a * v.b / 2 - Math.pow(v.a, 3) * v.b / 3 - v.a * Math.pow(v.b, 3) / 3; },
        mistakes: {
          onlyTop: function (v) { return v.h * v.a * v.b - v.a * v.a * v.b / 2; },
          flip: function (v) { return -(v.h * v.a * v.b - v.a * v.a * v.b / 2 - Math.pow(v.a, 3) * v.b / 3 - v.a * Math.pow(v.b, 3) / 3); }
        },
        feedback: [
          { when: 'onlyTop', say: 'Ese es el volumen bajo el plano, desde $z = 0$. El sólido empieza en el paraboloide: $z$ va de $x^2 + y^2$ hasta el plano, así que la altura de cada columna es la diferencia.' },
          { when: 'flip', say: 'Tus límites en $z$ están al revés: va de la superficie de abajo ($x^2 + y^2$) a la de arriba (el plano).' }
        ],
        oracle: { lab: 'call', mod: 'triple', fn: 'integrate', args: function (v) { return [function () { return 1; }, [0, v.a], function () { return [0, v.b]; }, function (x, y) { return [x * x + y * y, v.h - x]; }]; } },
        hint: 'La integral de adentro da la altura $(h - x) - (x^2 + y^2)$. Integra en $y$ de 0 a $b$ y luego en $x$ de 0 a $a$.',
        solution: function (v) {
          var V = v.h * v.a * v.b - v.a * v.a * v.b / 2 - Math.pow(v.a, 3) * v.b / 3 - v.a * Math.pow(v.b, 3) / 3;
          return '$$V = \\int_0^{' + v.a + '}\\!\\int_0^{' + v.b + '}\\!\\int_{x^2 + y^2}^{' + v.h + ' - x} dz\\,dy\\,dx = \\int_0^{' + v.a + '}\\!\\int_0^{' + v.b + '} (' + v.h + ' - x - x^2 - y^2)\\,dy\\,dx$$ $$= ' + v.h + '(' + v.a * v.b + ') - \\frac{' + v.a + '^2(' + v.b + ')}{2} - \\frac{' + v.a + '^3(' + v.b + ')}{3} - \\frac{' + v.a + '(' + v.b + '^3)}{3} \\approx ' + fx(V) + '$$';
        }
      },
      {
        id: 'c2-s14-masa', title: 'Masa con densidad variable',
        vars: { a: [1, 4, 1], b: [1, 4, 1], c: [1, 4, 1], k: [0.5, 3, 0.5] },
        prompt: function (v) { return '<p>Un bloque ocupa la caja $[0, ' + v.a + '] \\times [0, ' + v.b + '] \\times [0, ' + v.c + ']$ (en metros) y su densidad crece con la altura: $\\rho = ' + v.k + 'z$ kg/m³. ¿Cuál es su masa?</p>'; },
        check: 'numeric', unit: 'kg',
        answer: function (v) { return v.k * v.a * v.b * v.c * v.c / 2; },
        mistakes: {
          noRho: function (v) { return v.a * v.b * v.c; },
          noHalf: function (v) { return v.k * v.a * v.b * v.c * v.c; }
        },
        feedback: [
          { when: 'noRho', say: 'Ese es el volumen. La masa es $\\iiint \\rho\\,dV$: cada cubito pesa según su densidad.' },
          { when: 'noHalf', say: 'Revisa $\\int_0^c z\\,dz = \\frac{c^2}{2}$.' }
        ],
        oracle: { lab: 'call', mod: 'triple', fn: 'moments', field: 'M', args: function (v) { return [function (x, y, z) { return v.k * z; }].concat(boxL(v.a, v.b, v.c)); } },
        hint: '$\\rho$ solo depende de $z$: las integrales en $x$ y en $y$ dan $a$ y $b$.',
        solution: function (v) { return '$$m = \\int_0^{' + v.a + '}\\!\\int_0^{' + v.b + '}\\!\\int_0^{' + v.c + '} ' + v.k + 'z\\,dz\\,dy\\,dx = ' + v.a + '\\cdot ' + v.b + '\\cdot ' + v.k + '\\cdot\\frac{' + v.c + '^2}{2} = ' + fx(v.k * v.a * v.b * v.c * v.c / 2) + '\\ \\text{kg}$$'; }
      },
      {
        id: 'c2-s14-centro', title: 'Una coordenada del centro de masa',
        vars: { a: [1, 5, 1], b: [1, 5, 1], c: [1, 5, 1], k: [0.5, 3, 0.5], q: [0, 1, 1] },
        derive: function (v) { return { L: v.q ? v.c : v.a, o: v.q ? v.a * v.b : v.b * v.c }; },
        prompt: function (v) {
          var w = v.q ? 'z' : 'x';
          return '<p>Un bloque ocupa la caja $[0, ' + v.a + '] \\times [0, ' + v.b + '] \\times [0, ' + v.c + ']$ y su densidad es $\\rho = ' + v.k + w + '$. Encuentra la coordenada $\\bar ' + w + '$ de su centro de masa.</p>';
        },
        check: 'numeric',
        answer: function (v) { return 2 * v.L / 3; },
        mistakes: {
          centroid: function (v) { return v.L / 2; },
          noDiv: function (v) { return v.k * v.o * Math.pow(v.L, 3) / 3; },
          byVol: function (v) { return v.k * v.L * v.L / 3; }
        },
        feedback: [
          { when: 'centroid', say: 'Ese es el centro geométrico. Con densidad variable el centro de masa se corre hacia donde hay más masa: usa $\\bar x = \\frac{1}{m}\\iiint x\\rho\\,dV$.' },
          { when: 'noDiv', say: 'Ese es el momento $\\iiint x\\rho\\,dV$ (o $\\iiint z\\rho\\,dV$). Falta dividir entre la masa.' },
          { when: 'byVol', say: 'Dividiste el momento entre el volumen. Con densidad variable se divide entre la masa $m = \\iiint \\rho\\,dV$.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          var m = T().moments(v.q ? function (x, y, z) { return v.k * z; } : function (x) { return v.k * x; }, boxL(v.a, v.b, v.c)[0], boxL(v.a, v.b, v.c)[1], boxL(v.a, v.b, v.c)[2]);
          return v.q ? m.zbar : m.xbar;
        } },
        hint: 'Calcula la masa y el momento; en los dos, las variables que no aparecen dan la longitud de su lado y se cancelan al dividir.',
        solution: function (v) {
          var w = v.q ? 'z' : 'x', M = v.q ? 'M_{xy}' : 'M_{yz}';
          return '$$m = ' + v.o + '\\int_0^{' + v.L + '} ' + v.k + w + '\\,d' + w + ' = ' + fx(v.k * v.o * v.L * v.L / 2) + ' \\qquad ' + M + ' = ' + v.o + '\\int_0^{' + v.L + '} ' + v.k + w + '^2\\,d' + w + ' = ' + fx(v.k * v.o * Math.pow(v.L, 3) / 3) + '$$ $$\\bar ' + w + ' = \\frac{' + M + '}{m} = \\frac{2}{3}(' + v.L + ') \\approx ' + fx(2 * v.L / 3) + '$$';
        }
      },
      {
        id: 'c2-s14-promedio', title: 'Temperatura promedio',
        vars: { a: [1, 6, 1], b: [1, 6, 1], c: [1, 6, 1] },
        baseWhere: function (v) { return v.a * v.b * v.c >= 6; },
        prompt: function (v) { return '<p>La temperatura en un sólido es $T(x, y, z) = x + y + z$. ¿Cuál es la temperatura promedio en el tetraedro acotado por los planos coordenados y el plano $' + plane(v.a, v.b, v.c) + '$?</p>'; },
        check: 'numeric',
        answer: function (v) { return (v.a + v.b + v.c) / 4; },
        mistakes: {
          noDiv: function (v) { return v.a * v.b * v.c / 6 * (v.a + v.b + v.c) / 4; },
          box: function (v) { return (v.a + v.b + v.c) / 2; }
        },
        feedback: [
          { when: 'noDiv', say: 'Ese es $\\iiint T\\,dV$. El promedio es esa integral dividida entre el volumen del tetraedro.' },
          { when: 'box', say: 'Ese es el promedio en la caja que envuelve al tetraedro. En el tetraedro hay más volumen cerca del origen.' }
        ],
        oracle: { lab: 'call', mod: 'triple', fn: 'average', field: 'avg', args: function (v) { return [function (x, y, z) { return x + y + z; }].concat(tetL(v.a, v.b, v.c)); } },
        hint: '$T_{\\text{prom}} = \\frac{1}{V}\\iiint (x + y + z)\\,dV = \\bar x + \\bar y + \\bar z$, con el centroide del tetraedro.',
        solution: function (v) { return 'Intersecciones $a = ' + v.a + '$, $b = ' + v.b + '$, $c = ' + v.c + '$. El promedio de $x$ es $\\bar x = \\frac{a}{4}$, y así con $y$ y $z$: $$T_{\\text{prom}} = \\frac{a + b + c}{4} = \\frac{' + (v.a + v.b + v.c) + '}{4} = ' + fx((v.a + v.b + v.c) / 4) + '$$'; }
      },
      {
        id: 'c2-s14-sombra', title: 'Concepto: la sombra D',
        vars: { a: [2, 6, 1], b: [2, 6, 1], c: [2, 6, 1] },
        where: function (v) { return v.a !== v.b && v.b !== v.c && v.a !== v.c; },
        prompt: function (v) { return '<p>El sólido está acotado por los planos coordenados y el plano $' + plane(v.a, v.b, v.c) + '$. Si integras primero en $z$, ¿sobre qué región $D$ del plano $xy$ queda la integral doble?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: 'El triángulo $0 \\le x \\le ' + v.a + '$, $0 \\le y \\le ' + v.b + '\\left(1 - \\frac{x}{' + v.a + '}\\right)$', correct: true },
            { text: 'El rectángulo $[0, ' + v.a + '] \\times [0, ' + v.b + ']$', say: 'El sólido no tiene columnas en todo el rectángulo: más allá de la recta donde el plano toca el piso, la tapa queda bajo $z = 0$.' },
            { text: 'El triángulo $0 \\le x \\le ' + v.a + '$, $0 \\le y \\le ' + v.c + '\\left(1 - \\frac{x}{' + v.a + '}\\right)$', say: 'Usaste la intersección con el eje $z$. En el piso ($z = 0$) el plano corta al eje $y$ en $y = ' + v.b + '$.' },
            { text: 'El triángulo $0 \\le y \\le ' + v.b + '$, $0 \\le z \\le ' + v.c + '\\left(1 - \\frac{y}{' + v.b + '}\\right)$', say: 'Esa es la sombra en el plano $yz$, la que usarías si integraras primero en $x$.' }
          ];
        },
        answer: function (v) { return 'El triángulo $0 \\le x \\le ' + v.a + '$, $0 \\le y \\le ' + v.b + '\\left(1 - \\frac{x}{' + v.a + '}\\right)$'; },
        hint: 'Pon $z = 0$ en la ecuación del plano: la recta que queda, con los ejes $x$ y $y$, encierra la sombra.',
        solution: function (v) { return 'Con $z = 0$: $\\frac{x}{' + v.a + '} + \\frac{y}{' + v.b + '} = 1$, la recta de $(' + v.a + ', 0)$ a $(0, ' + v.b + ')$. Con los ejes forma el triángulo $0 \\le x \\le ' + v.a + '$, $0 \\le y \\le ' + v.b + '(1 - x/' + v.a + ')$.'; }
      },
      {
        id: 'c2-s14-orden', title: 'Concepto: el orden en una caja',
        vars: {},
        prompt: function () { return '<p>Calculas $\\iiint_B f\\,dV$ sobre una caja $B$ con $f$ continua, primero en el orden $dz\\,dy\\,dx$ y luego en el orden $dx\\,dz\\,dy$. ¿Qué pasa con el resultado?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Es el mismo: en una caja los seis órdenes coinciden', correct: true },
            { text: 'Cambia de signo', say: 'El orden no cambia el signo; lo cambia invertir los límites de una integral.' },
            { text: 'Depende de si $f$ es positiva', say: 'Fubini vale para cualquier $f$ continua, positiva o no.' },
            { text: 'Solo coinciden si $f$ es un producto $g(x)h(y)k(z)$', say: 'Con un producto la integral se separa, pero la igualdad de los órdenes vale para toda $f$ continua.' }
          ];
        },
        answer: function () { return 'Es el mismo: en una caja los seis órdenes coinciden'; },
        hint: 'Piensa en el teorema de Fubini y en contar cubitos por columnas o por rebanadas.',
        solution: function () { return 'Teorema de Fubini: en una caja, con $f$ continua, las $3! = 6$ integrales iteradas son iguales. Contar los cubitos por columnas o por rebanadas da la misma suma.'; }
      }
    ],

    quiz: { tags: ['c2.S14'], count: 8 },

    errors: [
      'Integrar sobre el rectángulo que envuelve a la sombra cuando $D$ es un triángulo: los límites de $y$ dependen de $x$.',
      'Poner la superficie de arriba como límite inferior en $z$: la integral sale con el signo cambiado.',
      'Dejar variables en los límites de la integral de afuera: los de afuera son números.',
      'Olvidar la densidad al calcular la masa (eso es el volumen).',
      'Para el centro de masa, no dividir entre la masa, o dividir entre el volumen cuando la densidad es variable.',
      'Olvidar que una variable que no aparece en $f$ aporta la longitud de su intervalo.'
    ],

    teacher: {
      plan: [
        'Arranca con la caja de cereal: contar cubitos, luego pesarlos. Que vean la triple como suma antes de ver límites.',
        'Explainer de los cubitos: columna → rebanada → sólido. Liga cada suma con una integral.',
        'Ejemplos 1 y 2 en el pizarrón. En el tetraedro, insiste en encontrar la sombra con $z = 0$.',
        'Lab: el tetraedro con $n$ creciente; que comparen la suma con el exacto y luego prueben el reto con la región equivocada.',
        'Cierra con el cubo de densidad $1 + z$: ¿por qué el centro de masa sube?'
      ],
      check: [
        'Que dibujen la sombra $D$ antes de escribir los límites.',
        'Que distingan masa (con $\\rho$) de volumen, y centro de masa (entre $m$) de centroide.'
      ],
      note: 'Las triples en cilíndricas y esféricas, con el Jacobiano, van en S15. Aquí el disco del ejemplo 3 se resuelve con la doble en polares de S13.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §5.4 “Triple Integrals”. <a href="https://openstax.org/books/calculus-volume-3/pages/5-4-triple-integrals">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 3</em>, §5.6 “Calculating Centers of Mass and Moments of Inertia”. <a href="https://openstax.org/books/calculus-volume-3/pages/5-6-calculating-centers-of-mass-and-moments-of-inertia">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-13',
    next: 'sesion-15'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check !== 'numeric' || !ex.mistakes) return;
    ex.where = apart(ex);
  });
})();
