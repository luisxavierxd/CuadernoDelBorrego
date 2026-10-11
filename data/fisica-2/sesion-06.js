/* =====================================================================
   Física 2 · S06 · Potencial de distribuciones continuas, equipotenciales y E = −∇V
   (bloque B · Gauss y capacitores).
   Fuente: OpenStax, University Physics Volume 2, §7.3, §7.4 y §7.5 (CC BY-NC-SA 4.0).
   Sesión de derivaciones (brief N2 §3.1): V de varilla, anillo y disco con la plantilla
   de 6 pasos de S04; luego E = −∇V recupera los campos de S04 como comprobación.
   k = 8.99 × 10⁹ N·m²/C², ε₀ = 8.85 × 10⁻¹² C²/(N·m²), e = 1.60 × 10⁻¹⁹ C; SI.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js las compara
   contra LabMath.equipotential (verify / oracle), que a su vez se prueba contra la suma
   de miles de cargas puntuales y contra el E de S04 (scripts/labs-math/equipotentials.js).
   ===================================================================== */
(function () {
  var k = 8.99e9;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  // Notación científica en LaTeX: 1.80 \times 10^{3}.
  function sci(v, d) {
    if (v === 0) return '0';
    var e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
    if (Math.abs(+m.toFixed(d == null ? 2 : d)) >= 10) { m /= 10; e += 1; }
    return m.toFixed(d == null ? 2 : d) + ' \\times 10^{' + e + '}';
  }
  function sg(x) { return x < 0 ? '-' + Math.abs(x) : String(x); }
  // Fórmulas cerradas (SI). Se escriben aquí, aparte de LabMath.
  function Vring(R, Q, z) { return k * Q / Math.sqrt(z * z + R * R); }
  function Vdisk(R, Q, z) { return 2 * Math.PI * k * (Q / (Math.PI * R * R)) * (Math.sqrt(z * z + R * R) - z); }
  function Vrod(L, Q, d) { return k * Q / L * Math.log((L + d) / d); }
  function Vbis(L, Q, y) { return 2 * k * Q / L * Math.log((L / 2 + Math.sqrt(y * y + L * L / 4)) / y); }
  var cm = function (x) { return x / 100; }, nC = function (q) { return q * 1e-9; };
  var KTXT = '$k = 8.99 \\times 10^9\\ \\text{N·m}^2/\\text{C}^2$';

  // Ejemplo 1: anillo en su eje.
  var e1 = { R: 0.06, Q: 5e-9, z: 0.08 };
  e1.r = Math.sqrt(e1.z * e1.z + e1.R * e1.R); e1.V = Vring(e1.R, e1.Q, e1.z); e1.E = k * e1.Q * e1.z / Math.pow(e1.r, 3);
  // Ejemplo 2: disco en su eje.
  var e2 = { R: 0.10, Q: 12e-9, z: 0.05 };
  e2.sig = e2.Q / (Math.PI * e2.R * e2.R); e2.root = Math.sqrt(e2.z * e2.z + e2.R * e2.R); e2.pre = 2 * Math.PI * k * e2.sig; e2.V = Vdisk(e2.R, e2.Q, e2.z); e2.far = k * e2.Q / e2.z;
  // Ejemplo 3: varilla, punto en la bisectriz.
  var e3 = { L: 0.20, Q: 4e-9, y: 0.10 };
  e3.lam = e3.Q / e3.L; e3.s = Math.sqrt(e3.y * e3.y + e3.L * e3.L / 4); e3.ln = Math.log((e3.L / 2 + e3.s) / e3.y); e3.V = Vbis(e3.L, e3.Q, e3.y); e3.pt = k * e3.Q / e3.y;
  // Ejemplo 4: E a partir de V(x, y) = 100(3x²y − y³) en (1, 2) m.
  var e4 = { x: 1, y: 2 }; e4.Ex = -600 * e4.x * e4.y; e4.Ey = -(300 * e4.x * e4.x - 300 * e4.y * e4.y); e4.E = Math.hypot(e4.Ex, e4.Ey);
  // Ejemplo 5: placas paralelas.
  var e5 = { dV: 120, d: 0.005, s: 0.003 }; e5.E = e5.dV / e5.d; e5.Vs = e5.E * e5.s;

  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (m) { return ex.mistakes[m](v); }));
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) {
          if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]))) return false;
        }
      }
      return true;
    };
  }
  // Polinomio en x, y escrito para math.js y para LaTeX: términos [coef, px, py].
  function polySrc(t) { return t.map(function (a) { return '(' + a[0] + ')' + (a[1] ? '*x^' + a[1] : '') + (a[2] ? '*y^' + a[2] : ''); }).join(' + '); }
  function mono(c, px, py, first) {
    var s = c < 0 ? ' - ' : (first ? '' : ' + '), a = Math.abs(c);
    if (first && c < 0) s = '-';
    var body = (a === 1 && (px || py) ? '' : a) + (px ? 'x' + (px > 1 ? '^{' + px + '}' : '') : '') + (py ? 'y' + (py > 1 ? '^{' + py + '}' : '') : '');
    return s + body;
  }
  function polyTex(t) { return t.map(function (a, i) { return mono(a[0], a[1], a[2], i === 0); }).join(''); }

  var data = window.SESSION_DATA = {
    slug: 'sesion-06', number: '06', group: 'B · Gauss y capacitores',
    title: 'Potencial de distribuciones continuas, equipotenciales y E = −∇V', temario: [],
    minutes: 180,
    quote: 'El potencial es un mapa de alturas; las equipotenciales son sus curvas de nivel y el campo es la bajada más empinada.',
    badges: [
      'Calcular el potencial de una varilla, un anillo y un disco con la plantilla de 6 pasos, sumando escalares.',
      'Recuperar el campo a partir del potencial: $E_z = -dV/dz$ y, en general, $\\vec{E} = -\\nabla V$.',
      'Dibujar e interpretar superficies equipotenciales: perpendiculares a $\\vec{E}$ y sin trabajo sobre ellas.',
      'Explicar por qué un conductor en equilibrio es equipotencial y por qué la carga se junta en las puntas.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Para el potencial de una distribución haces lo mismo que en S04, pero <strong>sin flechas</strong>: cada $dq$ aporta $dV = k\\,dq/r$, un número, y los sumas con una integral. Al revés, si ya tienes $V$, el campo sale derivando: $\\vec{E} = -\\nabla V$.',
        recall: [
          'El potencial de cargas puntuales, $V = \\sum kq_i/r_i$, y $\\Delta V = -Ed$ en un campo uniforme (S05).',
          'La plantilla de 6 pasos y los campos de varilla, anillo y disco (<a href="../sesion-04/">S04</a>).',
          'La derivada parcial: derivar respecto a una variable con las demás fijas (<a href="../../../calculo-2/sesiones/sesion-04/">Cálculo 2 · S04</a>).'
        ],
        why: 'Los mapas de equipotenciales sirven para diseñar desde un electrocardiograma (los electrodos miden diferencias de potencial en la piel) hasta un pararrayos o la jaula metálica que protege un cable coaxial. Y es más fácil calcular un número $V$ y derivarlo que sumar flechas.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en un mapa topográfico de un cerro. Las curvas de nivel unen los puntos a la misma altura. Si caminas sobre una curva de nivel no subes ni bajas: no gastas energía contra la gravedad.',
          'Si sueltas una pelota, no rueda a lo largo de la curva de nivel: baja por donde el cerro está más empinado, <strong>perpendicular</strong> a las curvas. Y donde las curvas están muy juntas, la bajada es más fuerte.',
          'Con la electricidad es igual. El potencial es la «altura», las <strong>equipotenciales</strong> son las curvas de nivel y el campo eléctrico es la bajada más empinada: apunta hacia donde $V$ baja más rápido, perpendicular a las equipotenciales, y es más fuerte donde están más juntas.'
        ]
      },
      {
        type: 'concept', heading: 'El potencial de una distribución: una suma de números', short: 'V de una distribución',
        body: [
          'Parte la distribución en pedacitos $dq$. Cada uno es una carga puntual y aporta en P el potencial $dV = \\frac{k\\,dq}{r}$, con $r$ su distancia a P. El potencial total es la suma de todos: $$V = \\int \\frac{k\\,dq}{r}$$',
          'Usas la misma plantilla de 6 pasos de <a href="../sesion-04/">S04</a>, con una gran diferencia en el paso 3: $V$ es un <strong>escalar</strong>. No hay componentes que se cancelen ni $\\cos\\theta$ que agregar; solo sumas números positivos (o negativos, si la carga es negativa).',
          'Ojo con dos cosas: va $r$, no $r^2$, y el potencial se mide con respecto al infinito ($V = 0$ muy lejos), igual que en S05.'
        ],
        diagram: 'f2s06-scalar',
        caption: 'A la izquierda, el campo de S04: cada $d\\vec{E}$ es una flecha y hay que proyectarla. A la derecha, el potencial: cada pedacito aporta un número $k\\,dq/r$ y se suman tal cual.'
      },
      {
        type: 'explainer', heading: 'Varilla: punto en su eje', short: 'Varilla en su eje',
        title: 'Varilla de largo L, punto P a una distancia d de su extremo',
        intro: 'La misma geometría del primer caso de S04, ahora para el potencial.',
        diagram: 'f2s06-rod',
        steps: [
          { text: '<strong>Elige dq.</strong> La varilla va de $x = 0$ a $x = L$ con $\\lambda = Q/L$. Un trozo de largo $dx$ en $x$ tiene $dq = \\lambda\\,dx$.', state: { k: 1 } },
          { text: '<strong>r y dV.</strong> Del trozo a P hay $r = L + d - x$, así que $dV = \\frac{k\\lambda\\,dx}{L + d - x}$.', state: { k: 2 } },
          { text: '<strong>Simetría.</strong> Aquí no hace falta: $dV$ es un número positivo para cada trozo y todos se suman. No hay componentes.', state: { k: 3 } },
          { text: '<strong>La integral.</strong> La variable es $x$, de $0$ a $L$: $V = \\int_0^L \\frac{k\\lambda\\,dx}{L + d - x}$.', state: { k: 4 } },
          { text: '<strong>Integra.</strong> Con $u = L + d - x$ queda $\\int_d^{L+d}\\frac{du}{u} = \\ln\\frac{L + d}{d}$. Entonces $V = k\\lambda\\ln\\left(1 + \\frac{L}{d}\\right) = \\frac{kQ}{L}\\ln\\left(1 + \\frac{L}{d}\\right)$.', state: { k: 5 } },
          { text: '<strong>Comprueba.</strong> Unidades: $\\frac{\\text{N·m}^2}{\\text{C}^2}\\cdot\\frac{\\text{C}}{\\text{m}} = \\text{V}$. Lejos ($d \\gg L$): $\\ln(1 + L/d) \\approx L/d$ y queda $kQ/d$, una carga puntual.', state: { k: 6 } }
        ]
      },
      {
        type: 'explainer', heading: 'Anillo: punto en su eje', short: 'Anillo en su eje',
        title: 'Anillo de radio R, punto P a una distancia z sobre su eje',
        intro: 'En S04 había que proyectar cada $dE$ sobre el eje. Para el potencial ni eso: todos los trozos están a la misma distancia.',
        diagram: 'f2s06-ring',
        steps: [
          { text: '<strong>Elige dq.</strong> Un anillo de radio $R$ con carga $Q$; P está sobre su eje, a una distancia $z$ del centro. Toma un trozo $dq$.', state: { k: 1 } },
          { text: '<strong>r y dV.</strong> Todos los trozos están a $r = \\sqrt{z^2 + R^2}$ de P: $dV = \\frac{k\\,dq}{\\sqrt{z^2 + R^2}}$.', state: { k: 2 } },
          { text: '<strong>Simetría.</strong> Como $V$ es escalar, no se cancela nada: el trozo de enfrente aporta exactamente lo mismo y se suma.', state: { k: 3 } },
          { text: '<strong>La integral.</strong> $V = \\oint \\frac{k\\,dq}{\\sqrt{z^2 + R^2}}$. La raíz no cambia al recorrer el anillo: sale de la integral y queda $\\oint dq = Q$.', state: { k: 4 } },
          { text: '<strong>Resultado.</strong> $V = \\frac{kQ}{\\sqrt{z^2 + R^2}}$. En el centro ($z = 0$) vale $kQ/R$: ¡no es cero, aunque ahí el campo sí lo sea!', state: { k: 5 } },
          { text: '<strong>Comprueba.</strong> Lejos ($z \\gg R$): $\\sqrt{z^2 + R^2} \\approx z$ y queda $kQ/z$, una carga puntual.', state: { k: 6 } }
        ]
      },
      {
        type: 'explainer', heading: 'Disco: suma de anillos', short: 'Disco en su eje',
        title: 'Disco de radio R, punto P a una distancia z sobre su eje',
        intro: 'Igual que en S04: partes el disco en anillos y usas el resultado del anillo como $dV$.',
        diagram: 'f2s06-disk',
        steps: [
          { text: '<strong>Elige dq.</strong> Con $\\sigma = Q/\\pi R^2$, un anillo de radio $r$ y ancho $dr$ tiene $dq = \\sigma\\,2\\pi r\\,dr$.', state: { k: 1 } },
          { text: '<strong>dV de un anillo.</strong> Ya lo tienes: $dV = \\frac{k\\,dq}{\\sqrt{z^2 + r^2}} = \\frac{2\\pi k\\sigma\\,r\\,dr}{\\sqrt{z^2 + r^2}}$.', state: { k: 2 } },
          { text: '<strong>Simetría.</strong> Todos los anillos aportan un número positivo; se suman directo.', state: { k: 3 } },
          { text: '<strong>La integral.</strong> La variable es $r$, de $0$ a $R$: $V = 2\\pi k\\sigma\\int_0^R \\frac{r\\,dr}{\\sqrt{z^2 + r^2}}$.', state: { k: 4 } },
          { text: '<strong>Integra.</strong> Con $u = z^2 + r^2$, $du = 2r\\,dr$: $\\int \\frac{r\\,dr}{\\sqrt{z^2 + r^2}} = \\sqrt{z^2 + r^2}$. Evaluada de $0$ a $R$: $V = 2\\pi k\\sigma\\left(\\sqrt{z^2 + R^2} - z\\right)$.', state: { k: 5 } },
          { text: '<strong>Comprueba.</strong> Lejos: $\\sqrt{z^2 + R^2} - z \\approx \\frac{R^2}{2z}$, así que $V \\approx \\frac{2\\pi k\\sigma R^2}{2z} = \\frac{kQ}{z}$. En el centro del disco ($z = 0$): $V = 2\\pi k\\sigma R$.', state: { k: 6 } }
        ]
      },
      {
        type: 'callout', heading: 'Cuatro potenciales que conviene tener a la mano',
        body: [
          '<strong>Varilla, en su eje:</strong> $V = \\frac{kQ}{L}\\ln\\left(1 + \\frac{L}{d}\\right)$. <strong>Varilla, en la bisectriz:</strong> $V = \\frac{2kQ}{L}\\ln\\frac{L/2 + \\sqrt{y^2 + L^2/4}}{y}$. <strong>Anillo:</strong> $V = \\frac{kQ}{\\sqrt{z^2 + R^2}}$. <strong>Disco:</strong> $V = 2\\pi k\\sigma\\left(\\sqrt{z^2 + R^2} - z\\right)$.',
          'Fíjate que todos son <strong>más fáciles</strong> que sus campos: no hubo que proyectar nada. Por eso muchas veces conviene calcular $V$ primero y sacar $\\vec{E}$ derivando.'
        ]
      },
      {
        type: 'explainer', heading: 'De V a E: recupera el campo de S04', short: 'De V a E',
        title: 'Potencial del anillo sobre su eje y su pendiente',
        intro: 'En S05 viste que en un campo uniforme $\\Delta V = -E\\,\\Delta s$. Si el campo cambia, se usa un $\\Delta s$ muy chico: el campo es menos la pendiente de $V$.',
        diagram: 'f2s06-slope',
        steps: [
          { text: 'La gráfica es $V(z) = \\frac{kQ}{\\sqrt{z^2 + R^2}}$ sobre el eje del anillo: máxima en el centro y bajando hacia los lados.', state: { z: 0.9, t: 0 } },
          { text: 'Muévete un poquito $dz$ a lo largo del eje. El potencial cambia $dV$ y el trabajo por coulomb es $E_z\\,dz = -dV$. Por eso $E_z = -\\frac{dV}{dz}$: <strong>menos la pendiente</strong> de la gráfica.', state: { z: 0.9, t: 1 } },
          { text: 'Deriva con la regla de la cadena: $\\frac{dV}{dz} = kQ\\cdot\\left(-\\tfrac{1}{2}\\right)(z^2 + R^2)^{-3/2}\\cdot 2z$. Con el signo menos: $$E_z = \\frac{kQz}{(z^2 + R^2)^{3/2}}$$ ¡El mismo resultado de S04, sin proyectar ningún $\\cos\\theta$!', state: { z: 1.6, t: 1 } },
          { text: 'En el centro la pendiente es cero: $E = 0$ aunque $V = kQ/R$ sea máximo. Y donde la pendiente es más empinada ($z = R/\\sqrt{2}$) el campo es máximo, como encontraste en S04.', state: { z: 0, t: 1 } },
          { text: 'Lo mismo con el disco: $-\\frac{d}{dz}\\left[2\\pi k\\sigma\\left(\\sqrt{z^2 + R^2} - z\\right)\\right] = 2\\pi k\\sigma\\left(1 - \\frac{z}{\\sqrt{z^2 + R^2}}\\right)$, que con $2\\pi k = \\frac{1}{2\\varepsilon_0}$ es el $E$ del disco de S04.', state: { z: 2.4, t: 1 } }
        ]
      },
      {
        type: 'concept', heading: 'E = −∇V en general', short: 'E = −∇V',
        body: [
          'En el plano, $V(x, y)$ depende de dos variables. Moverte $dx$ con $y$ fija cambia $V$ en $\\frac{\\partial V}{\\partial x}dx$: es la <a href="../../../calculo-2/sesiones/sesion-04/">derivada parcial de Cálculo 2</a>. Cada componente del campo es menos una parcial: $$E_x = -\\frac{\\partial V}{\\partial x}, \\qquad E_y = -\\frac{\\partial V}{\\partial y}, \\qquad E_z = -\\frac{\\partial V}{\\partial z}$$',
          'Juntas se escriben $\\vec{E} = -\\nabla V$, donde $\\nabla V = \\left(\\frac{\\partial V}{\\partial x}, \\frac{\\partial V}{\\partial y}, \\frac{\\partial V}{\\partial z}\\right)$ es el <strong>gradiente</strong> (<a href="../../../calculo-2/sesiones/sesion-08/">Cálculo 2 · S08</a>): apunta hacia donde $V$ crece más rápido. El signo menos dice que $\\vec{E}$ apunta hacia donde $V$ <strong>baja</strong> más rápido, y su magnitud es esa rapidez, en V/m (que es lo mismo que N/C).',
          'Si conoces dos equipotenciales cercanas, separadas una distancia $\\Delta s$ medida perpendicular a ellas, el campo entre ellas es aproximadamente $$|E| \\approx \\frac{|\\Delta V|}{\\Delta s}$$ y apunta hacia la de menor potencial. Así lo vas a estimar en el lab.'
        ]
      },
      {
        type: 'explainer', heading: 'Superficies equipotenciales', short: 'Equipotenciales',
        title: 'Equipotenciales (azul) y líneas de campo en tres configuraciones',
        intro: 'Una superficie equipotencial une los puntos con el mismo $V$. En un dibujo plano se ven como curvas. Se dibujan con la misma $\\Delta V$ entre una y la siguiente.',
        diagram: 'f2s06-equip',
        steps: [
          { text: '<strong>Carga puntual.</strong> $V = kq/r$ es igual a la misma distancia: las equipotenciales son <strong>esferas</strong> (círculos en el dibujo) y las líneas de campo salen como rayos, perpendiculares a ellas. Con la misma $\\Delta V$, los círculos se juntan cerca de la carga, donde el campo es fuerte.', state: { scene: 'point' } },
          { text: '<strong>Dipolo.</strong> Alrededor de cada carga hay óvalos; en medio, el plano bisector tiene $V = 0$ (las dos cargas aportan lo mismo con signo contrario). Las líneas de campo cruzan cada equipotencial en ángulo recto.', state: { scene: 'dipole' } },
          { text: '<strong>Placas paralelas.</strong> Entre las placas el campo es uniforme: las equipotenciales son planos paralelos a las placas, igualmente separados. Cada uno baja $\\Delta V = E\\,\\Delta s$ respecto al anterior.', state: { scene: 'plates' } },
          { text: '<strong>¿Por qué perpendiculares?</strong> Si mueves una carga $d\\vec{s}$ sobre una equipotencial, $dV = 0$, así que el trabajo $W = -q\\,dV = q\\vec{E}\\cdot d\\vec{s}$ es cero. Un producto punto es cero solo si $\\vec{E} \\perp d\\vec{s}$. Por la misma razón, <strong>el trabajo sobre una equipotencial siempre es cero</strong>.', state: { scene: 'work' } }
        ]
      },
      {
        type: 'concept', heading: 'Conductores en equilibrio', short: 'Conductores',
        body: [
          'En un conductor los electrones se mueven libres. Si hubiera campo adentro, se moverían; cuando dejan de moverse (equilibrio electrostático), el campo dentro del metal es <strong>cero</strong>. Entonces $V$ no cambia de un punto a otro: <strong>todo el conductor es una equipotencial</strong>, adentro y en su superficie.',
          'Como la superficie es equipotencial, justo afuera el campo es <strong>perpendicular a la superficie</strong> (si tuviera una parte tangente, movería las cargas de la superficie). Y la carga en exceso se queda en la superficie, no adentro.',
          'En las <strong>puntas</strong> (donde la curvatura es mayor) la carga se amontona y el campo es más intenso. Es la idea del <strong>pararrayos</strong>: una punta metálica con un campo tan fuerte a su alrededor que ioniza el aire y le da al rayo un camino seguro a tierra. Por lo mismo, una jaula metálica protege lo que tiene adentro (jaula de Faraday).'
        ],
        diagram: 'f2s06-conductor',
        caption: 'Un conductor cargado: adentro $E = 0$ y $V$ es el mismo en todos lados. Afuera, el campo sale perpendicular a la superficie y es más fuerte en la punta, donde se juntan las cargas.'
      },
      {
        type: 'concept', heading: 'Campo uniforme: ΔV = −E·d', short: 'Campo uniforme',
        body: [
          'Entre dos placas paralelas el campo es el mismo en todos lados. Si te mueves un desplazamiento $\\vec{d}$, el potencial cambia $$\\Delta V = -\\vec{E}\\cdot\\vec{d} = -E\\,d\\cos\\theta$$ con $\\theta$ el ángulo entre $\\vec{E}$ y tu desplazamiento.',
          'A favor del campo ($\\theta = 0$) el potencial baja $Ed$; en contra ($\\theta = 180°$) sube $Ed$; perpendicular ($\\theta = 90°$) no cambia: te mueves sobre una equipotencial. Entre las placas: $E = \\frac{\\Delta V}{d}$, con $d$ la separación.'
        ],
        diagram: 'f2s06-uniform',
        caption: 'Entre las placas, las equipotenciales son planos paralelos a ellas. Solo la parte del desplazamiento a lo largo de $\\vec{E}$, $d\\cos\\theta$, cambia el potencial.'
      },
      {
        type: 'recipe', heading: 'Receta: potencial de una distribución y campo a partir de V', short: 'Receta',
        steps: [
          { text: 'Dibuja la distribución y un elemento genérico. Escribe su carga: $dq = \\lambda\\,dx$, $\\lambda R\\,d\\theta$ o $\\sigma\\,2\\pi r\\,dr$.', tip: 'La densidad es carga entre tamaño: $\\lambda = Q/L$, $\\sigma = Q/\\pi R^2$.' },
          { text: 'Escribe la distancia $r$ de ese elemento a P y $dV = k\\,dq/r$.', tip: 'Va $r$, no $r^2$: el $r^2$ es del campo. Y no hay $\\cos\\theta$: $V$ es un escalar.' },
          { text: 'Plantea la integral con una sola variable y sus límites; saca lo que no cambia. Integra.' },
          { text: 'Comprueba: unidades en volts y, lejos, $V \\to kQ/r$.' },
          { text: 'Si te piden el campo: $E_x = -\\partial V/\\partial x$, $E_y = -\\partial V/\\partial y$ (en el eje de simetría, $E_z = -dV/dz$). Con dos equipotenciales cercanas, $|E| \\approx |\\Delta V|/\\Delta s$.', tip: 'No olvides el signo menos: $\\vec{E}$ apunta hacia donde $V$ baja.' }
        ]
      },
      {
        type: 'example', heading: 'Anillo: potencial en su eje',
        problem: '<p>Un anillo de $' + fx(e1.R * 100, 0) + '\\ \\text{cm}$ de radio tiene una carga de $' + fx(e1.Q * 1e9, 0) + '\\ \\text{nC}$. ¿Cuánto vale el potencial en un punto de su eje a $' + fx(e1.z * 100, 0) + '\\ \\text{cm}$ del centro? Usa ' + KTXT + '.</p>',
        steps: [
          { text: 'Todos los trozos del anillo están a la misma distancia del punto.', math: '\\begin{aligned} r &= \\sqrt{z^2 + R^2} \\\\ &= \\sqrt{(' + fx(e1.z) + ')^2 + (' + fx(e1.R) + ')^2} \\\\ &= ' + fx(e1.r) + '\\ \\text{m} \\end{aligned}' },
          { text: 'Suma de escalares: $V = kQ/r$.', math: '\\begin{aligned} V &= \\frac{(8.99 \\times 10^{9})(' + fx(e1.Q * 1e9, 0) + ' \\times 10^{-9})}{' + fx(e1.r) + '} \\\\ &= ' + fx(e1.V, 1) + '\\ \\text{V} \\end{aligned}' },
          { text: 'Con $E_z = -dV/dz$ sale además el campo de S04: $E = kQz/r^3 = ' + fx(e1.E, 0) + '\\ \\text{N/C}$.' }
        ],
        answer: '$V \\approx ' + fx(e1.V, 1) + '\\ \\text{V}$.',
        verify: { lab: 'call', mod: 'equipotential', fn: 'ringV', args: [e1.R, e1.Q, e1.z], value: e1.V }
      },
      {
        type: 'example', heading: 'Disco: potencial en su eje',
        problem: '<p>Un disco de $' + fx(e2.R * 100, 0) + '\\ \\text{cm}$ de radio tiene $' + fx(e2.Q * 1e9, 0) + '\\ \\text{nC}$ repartidos de forma uniforme en su cara. ¿Cuánto vale el potencial sobre su eje a $' + fx(e2.z * 100, 0) + '\\ \\text{cm}$ del centro? Usa ' + KTXT + '.</p>',
        steps: [
          { text: 'Densidad superficial.', math: '\\begin{aligned} \\sigma &= \\frac{Q}{\\pi R^2} = \\frac{' + fx(e2.Q * 1e9, 0) + ' \\times 10^{-9}}{\\pi(' + fx(e2.R) + ')^2} \\\\ &= ' + sci(e2.sig) + '\\ \\text{C/m}^2 \\end{aligned}' },
          { text: 'El factor de la raíz.', math: '\\begin{aligned} \\sqrt{z^2 + R^2} - z &= ' + fx(e2.root, 4) + ' - ' + fx(e2.z) + ' \\\\ &= ' + fx(e2.root - e2.z, 4) + '\\ \\text{m} \\end{aligned}' },
          { text: 'Multiplica por $2\\pi k\\sigma$.', math: '\\begin{aligned} V &= 2\\pi k\\sigma\\left(\\sqrt{z^2 + R^2} - z\\right) \\\\ &= (' + sci(e2.pre) + ')(' + fx(e2.root - e2.z, 4) + ') \\\\ &= ' + fx(e2.V, 0) + '\\ \\text{V} \\end{aligned}' },
          { text: 'Una carga puntual en el centro daría $kQ/z = ' + fx(e2.far, 0) + '\\ \\text{V}$: mucho más, porque supone toda la carga a $z$ y la del disco está más lejos.' }
        ],
        answer: '$V \\approx ' + fx(e2.V, 0) + '\\ \\text{V}$.',
        verify: { lab: 'call', mod: 'equipotential', fn: 'diskV', args: [e2.R, e2.Q, e2.z], value: e2.V }
      },
      {
        type: 'example', heading: 'Varilla: potencial en la bisectriz',
        problem: '<p>Una varilla de $' + fx(e3.L * 100, 0) + '\\ \\text{cm}$ tiene $' + fx(e3.Q * 1e9, 0) + '\\ \\text{nC}$ repartidos de forma uniforme. ¿Cuánto vale el potencial en un punto a $' + fx(e3.y * 100, 0) + '\\ \\text{cm}$ de su centro, sobre la bisectriz? Usa ' + KTXT + '.</p>',
        steps: [
          { text: 'Con $dq = \\lambda\\,dx$ y $r = \\sqrt{x^2 + y^2}$, la integral de $-L/2$ a $L/2$ es $\\int \\frac{dx}{\\sqrt{x^2 + y^2}} = \\ln\\left(x + \\sqrt{x^2 + y^2}\\right)$. Queda:', math: 'V = 2k\\lambda\\ln\\frac{L/2 + \\sqrt{y^2 + L^2/4}}{y}' },
          { text: 'Densidad y la raíz.', math: '\\begin{aligned} \\lambda &= \\frac{Q}{L} = ' + sci(e3.lam) + '\\ \\text{C/m} \\\\ \\sqrt{y^2 + L^2/4} &= ' + fx(e3.s, 4) + '\\ \\text{m} \\end{aligned}' },
          { text: 'Sustituye.', math: '\\begin{aligned} V &= 2(8.99 \\times 10^{9})(' + sci(e3.lam) + ')\\ln\\frac{' + fx(e3.L / 2) + ' + ' + fx(e3.s, 4) + '}{' + fx(e3.y) + '} \\\\ &= (' + fx(2 * k * e3.lam, 1) + ')(' + fx(e3.ln, 4) + ') \\\\ &= ' + fx(e3.V, 1) + '\\ \\text{V} \\end{aligned}' },
          { text: 'Como carga puntual en el centro daría $kQ/y = ' + fx(e3.pt, 1) + '\\ \\text{V}$: la carga de los extremos está más lejos que $y$, así que el potencial real es menor.' }
        ],
        answer: '$V \\approx ' + fx(e3.V, 1) + '\\ \\text{V}$.',
        verify: { lab: 'call', mod: 'equipotential', fn: 'rodBisectorV', args: [e3.L, e3.Q, e3.y], value: e3.V }
      },
      {
        type: 'example', heading: 'El campo a partir de V(x, y)',
        problem: '<p>En cierta región el potencial es $V(x, y) = 100\\,(3x^2y - y^3)$, en volts con $x$ y $y$ en metros. ¿Cuánto vale el campo eléctrico (componentes y magnitud) en el punto $(' + e4.x + ', ' + e4.y + ')\\ \\text{m}$?</p>',
        steps: [
          { text: 'Derivadas parciales: para $\\partial V/\\partial x$, $y$ es constante; para $\\partial V/\\partial y$, $x$ es constante.', math: '\\frac{\\partial V}{\\partial x} = 600\\,xy, \\qquad \\frac{\\partial V}{\\partial y} = 300\\,x^2 - 300\\,y^2' },
          { text: 'Cada componente es menos su parcial, evaluada en $(1, 2)$.', math: '\\begin{aligned} E_x &= -600(1)(2) = ' + e4.Ex + '\\ \\text{V/m} \\\\ E_y &= -(300 - 1200) = ' + e4.Ey + '\\ \\text{V/m} \\end{aligned}' },
          { text: 'Magnitud.', math: '|\\vec{E}| = \\sqrt{(' + e4.Ex + ')^2 + ' + e4.Ey + '^2} = ' + e4.E + '\\ \\text{V/m}' }
        ],
        answer: '$\\vec{E} = (' + e4.Ex + ',\\ ' + e4.Ey + ')\\ \\text{V/m}$ y $|\\vec{E}| = ' + e4.E + '\\ \\text{V/m}$: apunta hacia la izquierda y arriba, hacia donde $V$ baja.',
        verify: { lab: 'call', mod: 'equipotential', fn: 'fieldFromExpr', math: true, args: ['100*(3x^2*y - y^3)', e4.x, e4.y], values: { x: e4.Ex, y: e4.Ey, mag: e4.E } }
      },
      {
        type: 'example', heading: 'Placas paralelas',
        problem: '<p>Dos placas paralelas separadas $' + fx(e5.d * 1000, 0) + '\\ \\text{mm}$ se conectan a $' + e5.dV + '\\ \\text{V}$. ¿Cuánto vale el campo entre ellas? ¿Cuánto vale el potencial a $' + fx(e5.s * 1000, 0) + '\\ \\text{mm}$ de la placa negativa (que está a $0\\ \\text{V}$)? ¿Cuánto trabajo hace el campo sobre un electrón que se mueve paralelo a las placas?</p>',
        diagram: 'f2s06-uniform', state: { plain: 1 },
        steps: [
          { text: 'Campo uniforme: la diferencia de potencial entre la separación.', math: 'E = \\frac{\\Delta V}{d} = \\frac{' + e5.dV + '}{' + fx(e5.d, 3) + '} = ' + e5.E + '\\ \\text{V/m}' },
          { text: 'Desde la placa negativa hacia la positiva vas en contra del campo ($\\theta = 180°$): el potencial sube $Es$.', math: 'V = 0 + E\\,s = (' + e5.E + ')(' + fx(e5.s, 3) + ') = ' + fx(e5.Vs, 0) + '\\ \\text{V}' },
          { text: 'Paralelo a las placas te mueves sobre una equipotencial: $\\Delta V = 0$, así que $W = -q\\,\\Delta V = 0$.' }
        ],
        answer: '$E = ' + e5.E + '\\ \\text{V/m}$, $V = ' + fx(e5.Vs, 0) + '\\ \\text{V}$ y el trabajo paralelo a las placas es $0$.',
        verify: { lab: 'call', mod: 'equipotential', fn: 'plates', args: [e5.dV, e5.d], value: e5.E }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué para V no hay $\\cos\\theta$?', a: 'Porque $V$ es un número, no una flecha. Cada $dq$ aporta $k\\,dq/r$ y ya. El $\\cos\\theta$ de S04 aparecía al proyectar vectores; aquí no hay nada que proyectar.' },
          { q: 'Si $E = 0$ en un punto, ¿$V = 0$ ahí?', a: 'No. $E$ es la pendiente de $V$, no su valor. En el centro de un anillo $E = 0$ pero $V = kQ/R$. Dentro de un conductor $E = 0$ y $V$ es constante, no necesariamente cero.' },
          { q: '¿De dónde sale el signo menos en $\\vec{E} = -\\nabla V$?', a: 'El gradiente apunta hacia donde $V$ sube. El campo empuja a las cargas positivas hacia donde $V$ baja (como la pelota cuesta abajo), así que apunta al revés del gradiente.' },
          { q: '¿Se pueden cruzar dos equipotenciales?', a: 'No. En el punto de cruce $V$ tendría dos valores distintos. Por la misma razón, las líneas de campo nunca se cruzan.' },
          { q: '¿Por qué la carga de un conductor se junta en las puntas?', a: 'Una punta es una parte muy curva: para que toda la superficie quede al mismo potencial, la densidad de carga ahí tiene que ser mayor. Con más carga por área, el campo justo afuera ($\\sigma/\\varepsilon_0$) es más fuerte. Así funciona el pararrayos.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Potencial de una distribución: $V = \\int k\\,dq/r$, una suma de escalares (sin $\\cos\\theta$); lejos, $V \\to kQ/r$.',
          'Anillo: $kQ/\\sqrt{z^2 + R^2}$; disco: $2\\pi k\\sigma(\\sqrt{z^2 + R^2} - z)$; varilla en su eje: $\\frac{kQ}{L}\\ln(1 + L/d)$.',
          'El campo es menos el gradiente: $E_x = -\\partial V/\\partial x$, $E_y = -\\partial V/\\partial y$; apunta hacia donde $V$ baja y vale $|\\Delta V|/\\Delta s$ entre equipotenciales cercanas.',
          'Las equipotenciales son ⟂ a $\\vec{E}$ y moverse sobre ellas no cuesta trabajo; un conductor en equilibrio es equipotencial, con $E = 0$ adentro y $\\vec{E}$ ⟂ a su superficie.'
        ]
      }
    ],

    lab: {
      type: 'equipotentials', title: 'Equipotenciales ⟂ campo',
      intro: 'Arrastra las cargas y el punto P. Las curvas azules son equipotenciales, todas con la misma $\\Delta V$; las líneas de campo las cruzan en ángulo recto. En el reto, estima $|E|$ con los potenciales de dos puntos cercanos ($|E| \\approx |\\Delta V|/\\Delta s$) y di hacia dónde apunta, o calcula $V$ en P. El lab detecta si olvidaste dividir entre la distancia, si dejaste los centímetros, si usaste $r^2$ como en el campo o si pusiste $\\vec{E}$ hacia el potencial mayor.',
      cfg: { start: { preset: 'Dipolo', step: 150, ds: 2 } }
    },

    formulas: [
      { label: 'Potencial de una distribución', tex: 'V = \\int \\frac{k\\,dq}{r}' },
      { label: 'Varilla, en su eje', tex: 'V = \\frac{kQ}{L}\\ln\\Big(1 + \\frac{L}{d}\\Big)' },
      { label: 'Anillo, en su eje', tex: 'V = \\frac{kQ}{\\sqrt{z^2 + R^2}}' },
      { label: 'Disco, en su eje', tex: 'V = 2\\pi k\\sigma\\big(\\sqrt{z^2 + R^2} - z\\big)' },
      { label: 'Campo a partir de V', tex: '\\vec{E} = -\\nabla V,\\ \\ E_x = -\\frac{\\partial V}{\\partial x}' },
      { label: 'Entre equipotenciales', tex: '|E| \\approx \\frac{|\\Delta V|}{\\Delta s}' },
      { label: 'Campo uniforme', tex: '\\Delta V = -\\vec{E}\\cdot\\vec{d} = -Ed\\cos\\theta' },
      { label: 'Constantes', tex: 'k = 8.99 \\times 10^9,\\ \\ \\varepsilon_0 = 8.85 \\times 10^{-12}' }
    ],

    exercises: [
      {
        id: 'f2-s06-anillo', title: 'Anillo: potencial en su eje',
        vars: { R: [3, 15, 1], Q: [1, 20, 1], z: [2, 30, 1] },
        prompt: function (v) { return '<p>Un anillo de $' + v.R + '\\ \\text{cm}$ de radio tiene una carga de $' + v.Q + '\\ \\text{nC}$. ¿Cuánto vale el potencial en un punto de su eje a $' + v.z + '\\ \\text{cm}$ de su centro? Da $V$ en volts. Usa ' + KTXT + '.</p>'; },
        check: 'numeric', unit: 'V',
        answer: function (v) { return Vring(cm(v.R), nC(v.Q), cm(v.z)); },
        mistakes: {
          r2: function (v) { var R = cm(v.R), z = cm(v.z); return k * nC(v.Q) / (z * z + R * R); },
          center: function (v) { return k * nC(v.Q) / cm(v.z); },
          cm: function (v) { return Vring(cm(v.R), nC(v.Q), cm(v.z)) / 100; }
        },
        feedback: [
          { when: 'r2', say: 'El potencial va con $1/r$, no con $1/r^2$: el $r^2$ es del campo.' },
          { when: 'center', say: 'Usaste la distancia al centro, $z$. La carga está en el anillo, a $r = \\sqrt{z^2 + R^2}$ del punto.' },
          { when: 'cm', say: 'Pasa los centímetros a metros antes de dividir.' }
        ],
        oracle: { lab: 'call', mod: 'equipotential', fn: 'ringV', args: function (v) { return [cm(v.R), nC(v.Q), cm(v.z)]; } },
        hint: 'Todos los trozos están a $r = \\sqrt{z^2 + R^2}$ y $V$ es escalar: $V = kQ/r$.',
        solution: function (v) {
          var R = cm(v.R), z = cm(v.z), r = Math.sqrt(z * z + R * R);
          return '$$\\begin{aligned} r &= \\sqrt{' + fx(z) + '^2 + ' + fx(R) + '^2} = ' + fx(r, 4) + '\\ \\text{m} \\\\ V &= \\frac{(8.99 \\times 10^{9})(' + v.Q + ' \\times 10^{-9})}{' + fx(r, 4) + '} \\\\ &= ' + fx(Vring(R, nC(v.Q), z)) + '\\ \\text{V} \\end{aligned}$$';
        }
      },
      {
        id: 'f2-s06-disco', title: 'Disco: potencial en su eje',
        vars: { R: [5, 20, 1], Q: [5, 40, 5], z: [1, 20, 1] },
        prompt: function (v) { return '<p>Un disco de $' + v.R + '\\ \\text{cm}$ de radio tiene $' + v.Q + '\\ \\text{nC}$ repartidos de forma uniforme en su cara. ¿Cuánto vale el potencial sobre su eje a $' + v.z + '\\ \\text{cm}$ del centro? Da $V$ en volts. Usa ' + KTXT + '.</p>'; },
        check: 'numeric', unit: 'V',
        answer: function (v) { return Vdisk(cm(v.R), nC(v.Q), cm(v.z)); },
        mistakes: {
          noZ: function (v) { var R = cm(v.R), z = cm(v.z); return 2 * Math.PI * k * nC(v.Q) / (Math.PI * R * R) * Math.sqrt(z * z + R * R); },
          point: function (v) { return k * nC(v.Q) / cm(v.z); },
          cm: function (v) { return Vdisk(cm(v.R), nC(v.Q), cm(v.z)) / 100; }
        },
        feedback: [
          { when: 'noZ', say: 'Te faltó el límite inferior: al evaluar $\\sqrt{z^2 + r^2}$ de $0$ a $R$ queda $\\sqrt{z^2 + R^2} - z$.' },
          { when: 'point', say: 'Eso es una carga puntual en el centro. La carga del disco está más lejos de P: usa $2\\pi k\\sigma(\\sqrt{z^2 + R^2} - z)$.' },
          { when: 'cm', say: 'Revisa las unidades: $\\sigma$ en C/m² y las distancias en metros.' }
        ],
        oracle: { lab: 'call', mod: 'equipotential', fn: 'diskV', args: function (v) { return [cm(v.R), nC(v.Q), cm(v.z)]; } },
        hint: 'Primero $\\sigma = Q/\\pi R^2$. Luego $V = 2\\pi k\\sigma\\left(\\sqrt{z^2 + R^2} - z\\right)$, todo en metros.',
        solution: function (v) {
          var R = cm(v.R), z = cm(v.z), s = nC(v.Q) / (Math.PI * R * R), f = Math.sqrt(z * z + R * R) - z;
          return '$$\\begin{aligned} \\sigma &= \\frac{' + v.Q + ' \\times 10^{-9}}{\\pi(' + fx(R) + ')^2} = ' + sci(s) + '\\ \\text{C/m}^2 \\\\ \\sqrt{z^2 + R^2} - z &= ' + fx(f, 4) + '\\ \\text{m} \\\\ V &= 2\\pi(8.99 \\times 10^{9})(' + sci(s) + ')(' + fx(f, 4) + ') \\\\ &= ' + fx(Vdisk(R, nC(v.Q), z)) + '\\ \\text{V} \\end{aligned}$$';
        }
      },
      {
        id: 'f2-s06-varilla', title: 'Varilla: potencial en su eje',
        vars: { L: [10, 40, 5], Q: [2, 12, 1], d: [2, 20, 1] },
        prompt: function (v) { return '<p>Una varilla de $' + v.L + '\\ \\text{cm}$ tiene $' + v.Q + '\\ \\text{nC}$ repartidos de forma uniforme. ¿Cuánto vale el potencial en un punto de su eje a $' + v.d + '\\ \\text{cm}$ del extremo más cercano? Da $V$ en volts. Usa ' + KTXT + '.</p>'; },
        check: 'numeric', unit: 'V',
        answer: function (v) { return Vrod(cm(v.L), nC(v.Q), cm(v.d)); },
        mistakes: {
          centerDistance: function (v) { return k * nC(v.Q) / (cm(v.d) + cm(v.L) / 2); },
          nearEnd: function (v) { return k * nC(v.Q) / cm(v.d); },
          field: function (v) { return k * nC(v.Q) / (cm(v.d) * (cm(v.d) + cm(v.L))); }
        },
        feedback: [
          { when: 'centerDistance', say: 'Pusiste toda la carga en el centro de la varilla. Cada trozo está a su propia distancia $r = L + d - x$: integra.' },
          { when: 'nearEnd', say: 'Eso supone que toda la carga está en el extremo cercano. Los trozos lejanos aportan menos: $V = \\frac{kQ}{L}\\ln(1 + L/d)$.' },
          { when: 'field', say: 'Eso es el campo $E = \\frac{kQ}{d(d + L)}$, no el potencial. Para $V$ se integra $1/r$, que da un logaritmo.' }
        ],
        oracle: { lab: 'call', mod: 'equipotential', fn: 'rodAxisV', args: function (v) { return [cm(v.L), nC(v.Q), cm(v.d)]; } },
        hint: 'Integra $dV = \\frac{k\\lambda\\,dx}{L + d - x}$ de $0$ a $L$: sale $V = k\\lambda\\ln\\frac{L + d}{d}$, con $\\lambda = Q/L$.',
        solution: function (v) {
          var L = cm(v.L), d = cm(v.d), lam = nC(v.Q) / L;
          return '$$\\begin{aligned} \\lambda &= \\frac{' + v.Q + ' \\times 10^{-9}}{' + fx(L) + '} = ' + sci(lam) + '\\ \\text{C/m} \\\\ V &= k\\lambda\\ln\\frac{L + d}{d} = (' + fx(k * lam, 1) + ')\\ln\\frac{' + fx(L + d) + '}{' + fx(d) + '} \\\\ &= ' + fx(Vrod(L, nC(v.Q), d)) + '\\ \\text{V} \\end{aligned}$$';
        }
      },
      {
        id: 'f2-s06-ex', title: 'Componente x del campo a partir de V',
        vars: { a: [2, 9, 1], b: [2, 9, 1], c: [2, 9, 1] },
        prompt: function (v) { return '<p>En una región el potencial es $V(x, y) = ' + polyTex([[v.a, 2, 1], [v.b, 1, 0], [-v.c, 0, 2]]) + '$ (en volts, con $x$ y $y$ en metros). Escribe la componente $E_x$ del campo eléctrico como función de $x$ y $y$.</p>'; },
        check: 'expr', exprVars: ['x', 'y'], domain: { x: [0.3, 2], y: [0.3, 2] },
        partialOf: function (v) { return { f: '-(' + polySrc([[v.a, 2, 1], [v.b, 1, 0], [-v.c, 0, 2]]) + ')', wrt: 'x' }; },
        answer: function (v) { return '-' + 2 * v.a + '*x*y - ' + v.b; },
        mistakes: {
          otherVar: function (v) { return '-' + v.a + '*x^2 + ' + 2 * v.c + '*y'; },
          keptB: function (v) { return '-' + 2 * v.a + '*x*y - ' + v.b + '*x'; }
        },
        feedback: [
          { when: 'otherVar', say: 'Derivaste respecto a $y$: eso da $E_y$. Para $E_x$ deriva respecto a $x$ con $y$ fija.' },
          { when: 'keptB', say: 'La derivada de $bx$ respecto a $x$ es $b$, sin la $x$.' },
          { when: 'sign', say: 'Casi: te faltó el signo menos. $E_x = -\\partial V/\\partial x$: el campo apunta hacia donde $V$ baja.' }
        ],
        hint: '$E_x = -\\dfrac{\\partial V}{\\partial x}$: trata a $y$ como constante y no olvides el signo menos.',
        solution: function (v) { return '$$\\frac{\\partial V}{\\partial x} = ' + 2 * v.a + 'xy + ' + v.b + ' \\quad\\Rightarrow\\quad E_x = -' + 2 * v.a + 'xy - ' + v.b + '$$ El término $-' + v.c + 'y^2$ no tiene $x$: su parcial es 0.'; }
      },
      {
        id: 'f2-s06-ey', title: 'Campo en un punto a partir de V',
        vars: { a: [1, 9, 1], b: [1, 9, 1], c: [1, 9, 1], p: [-3, 3, 1], q: [-3, 3, 1] },
        baseWhere: function (v) { return v.b * v.p - 2 * v.c * v.q !== 0 && (2 * v.a * v.p - v.b * v.q) !== 0; },
        prompt: function (v) { return '<p>El potencial en una región es $V(x, y) = ' + polyTex([[v.a, 2, 0], [-v.b, 1, 1], [v.c, 0, 2]]) + '$ (en volts, con $x$ y $y$ en metros). ¿Cuánto vale la componente $E_y$ del campo eléctrico en el punto $(' + v.p + ', ' + v.q + ')\\ \\text{m}$, en V/m?</p>'; },
        check: 'numeric', unit: 'V/m',
        answer: function (v) { return v.b * v.p - 2 * v.c * v.q; },
        mistakes: {
          sign: function (v) { return -(v.b * v.p - 2 * v.c * v.q); },
          otherVar: function (v) { return -(2 * v.a * v.p - v.b * v.q); }
        },
        feedback: [
          { when: 'sign', say: 'Te faltó el signo menos: $E_y = -\\partial V/\\partial y$.' },
          { when: 'otherVar', say: 'Eso es $E_x$ (derivaste respecto a $x$). Para $E_y$ deriva respecto a $y$.' }
        ],
        oracle: { lab: 'call', mod: 'equipotential', fn: 'fieldFromExpr', math: true, field: 'y', args: function (v) { return [polySrc([[v.a, 2, 0], [-v.b, 1, 1], [v.c, 0, 2]]), v.p, v.q]; } },
        hint: 'Deriva respecto a $y$ con $x$ fija: $\\frac{\\partial V}{\\partial y} = -bx + 2cy$. Luego $E_y = -\\frac{\\partial V}{\\partial y}$ en el punto.',
        solution: function (v) { return '$$\\begin{aligned} \\frac{\\partial V}{\\partial y} &= ' + mono(-v.b, 1, 0, true) + mono(2 * v.c, 0, 1) + ' \\\\ E_y &= -\\big[' + sg(-v.b) + '(' + v.p + ') + ' + 2 * v.c + '(' + v.q + ')\\big] \\\\ &= ' + (v.b * v.p - 2 * v.c * v.q) + '\\ \\text{V/m} \\end{aligned}$$'; }
      },
      {
        id: 'f2-s06-uniforme', title: 'Campo uniforme: ΔV = −E·d',
        vars: { E: [500, 5000, 500], s: [1, 20, 1], th: [0, 180, 15] },
        baseWhere: function (v) { return v.th !== 90; },
        prompt: function (v) { return '<p>En una región hay un campo eléctrico uniforme de $' + v.E + '\\ \\text{V/m}$. Una carga se mueve $' + v.s + '\\ \\text{cm}$ en una dirección que forma un ángulo de $' + v.th + '°$ con el campo. ¿Cuánto cambia el potencial, $\\Delta V = V_f - V_i$, con su signo?</p>'; },
        check: 'numeric', unit: 'V',
        answer: function (v) { return -v.E * cm(v.s) * Math.cos(v.th * Math.PI / 180); },
        mistakes: {
          sign: function (v) { return v.E * cm(v.s) * Math.cos(v.th * Math.PI / 180); },
          noCos: function (v) { return -v.E * cm(v.s); },
          sin: function (v) { return -v.E * cm(v.s) * Math.sin(v.th * Math.PI / 180); },
          cm: function (v) { return -v.E * v.s * Math.cos(v.th * Math.PI / 180); }
        },
        feedback: [
          { when: 'sign', say: 'Revisa el signo: a favor del campo el potencial baja. $\\Delta V = -Ed\\cos\\theta$.' },
          { when: 'noCos', say: 'Solo cuenta la parte del desplazamiento a lo largo del campo: multiplica por $\\cos\\theta$.' },
          { when: 'sin', say: 'El ángulo se mide desde el campo: la parte a lo largo de $\\vec{E}$ es $d\\cos\\theta$, no $d\\sin\\theta$.' },
          { when: 'cm', say: 'Pasa los centímetros a metros: $E$ está en V/m.' }
        ],
        oracle: { lab: 'call', mod: 'equipotential', fn: 'deltaV', args: function (v) { return [v.E, cm(v.s), v.th]; } },
        hint: '$\\Delta V = -\\vec{E}\\cdot\\vec{d} = -Ed\\cos\\theta$, con $d$ en metros.',
        solution: function (v) { return '$$\\begin{aligned} \\Delta V &= -Ed\\cos\\theta = -(' + v.E + ')(' + fx(cm(v.s)) + ')\\cos ' + v.th + '° \\\\ &= ' + fx(-v.E * cm(v.s) * Math.cos(v.th * Math.PI / 180)) + '\\ \\text{V} \\end{aligned}$$'; }
      },
      {
        id: 'f2-s06-trabajo-equipotencial', title: 'Concepto: trabajo sobre una equipotencial',
        vars: {},
        prompt: function () { return '<p>Llevas una carga de $3\\ \\mu\\text{C}$ de un punto a otro de la misma superficie equipotencial de $500\\ \\text{V}$, por un camino largo que se sale de la superficie y regresa. ¿Cuánto trabajo hace el campo eléctrico?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Cero: $\\Delta V = 0$ entre los dos puntos', correct: true },
            { text: '$1.5\\times 10^{-3}\\ \\text{J}$, que es $qV$', say: '$qV$ es la energía potencial en cada punto, no el trabajo. El trabajo depende de la diferencia, $-q\\,\\Delta V$, y aquí $\\Delta V = 0$.' },
            { text: 'Depende de qué tan largo sea el camino', say: 'La fuerza eléctrica es conservativa: solo importan los extremos.' },
            { text: 'Positivo, porque el campo empuja a la carga', say: 'En el tramo de ida el campo hace trabajo de un signo y en el de regreso del contrario: el total es $-q\\,\\Delta V = 0$.' }
          ];
        },
        answer: function () { return 'Cero: $\\Delta V = 0$ entre los dos puntos'; },
        hint: 'Usa $W = -q\\,\\Delta V$ y fíjate en qué potencial tienen el inicio y el final.',
        solution: function () { return 'Los dos puntos están a $500\\ \\text{V}$: $W = -q(V_B - V_A) = 0$, por cualquier camino.'; }
      },
      {
        id: 'f2-s06-conductor', title: 'Concepto: dentro de un conductor',
        vars: {},
        prompt: function () { return '<p>Una esfera metálica hueca tiene carga y está en equilibrio. ¿Qué pasa con el campo y el potencial dentro del metal?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: '$E = 0$ y $V$ es el mismo en todos sus puntos', correct: true },
            { text: '$E = 0$ y $V = 0$', say: 'Que $E$ sea cero solo dice que $V$ no cambia; su valor es el de la superficie, que no tiene por qué ser cero.' },
            { text: '$V$ es constante pero $E$ apunta hacia afuera', say: 'Si $V$ es constante, sus derivadas son cero: $\\vec{E} = -\\nabla V = 0$.' },
            { text: 'El campo es máximo en el centro', say: 'Si hubiera campo, los electrones libres se moverían; en equilibrio ya no se mueven.' }
          ];
        },
        answer: function () { return '$E = 0$ y $V$ es el mismo en todos sus puntos'; },
        hint: 'En equilibrio las cargas libres no se mueven. ¿Qué dice eso del campo?',
        solution: function () { return 'Sin movimiento de cargas, $E = 0$ en el metal; como $\\vec{E} = -\\nabla V$, el potencial es constante: todo el conductor es una equipotencial.'; }
      }
    ],

    quiz: { tags: ['f2.S06'], count: 8 },

    errors: [
      'Usar $1/r^2$ en el potencial: va $k\\,dq/r$; el $r^2$ es del campo.',
      'Agregar un $\\cos\\theta$ o cancelar componentes al calcular $V$: es un escalar y todos los $dq$ se suman.',
      'Olvidar el signo menos de $\\vec{E} = -\\nabla V$: el campo apunta hacia donde el potencial baja.',
      'Confundir $V = 0$ con $E = 0$: en el centro de un anillo $E = 0$ pero $V = kQ/R$.',
      'Olvidar dividir entre $\\Delta s$ (en metros) al estimar $|E| \\approx |\\Delta V|/\\Delta s$.',
      'Usar $Ed$ con la distancia completa cuando el desplazamiento no va a lo largo del campo: es $-Ed\\cos\\theta$.'
    ],

    teacher: {
      plan: [
        'Arranca con el mapa topográfico: curvas de nivel ↔ equipotenciales, bajada más empinada ↔ campo.',
        'Haz en el pizarrón la varilla en su eje y el anillo con los 6 pasos; que ellos hagan el disco. Compara con S04: aquí no hay proyecciones.',
        'Recupera el campo del anillo derivando $V(z)$: la comprobación de que S04 y S06 cuentan la misma historia.',
        'Equipotenciales y conductores con el lab: que arrastren las cargas y vean el ángulo recto; reto de estimar $|E|$ con dos equipotenciales.'
      ],
      check: [
        'Que escriban $r$ de un elemento genérico y $dV = k\\,dq/r$ sin $\\cos\\theta$.',
        'Que justifiquen el signo de $\\vec{E} = -\\nabla V$ con «hacia donde $V$ baja».',
        'Que expliquen por qué $W = 0$ sobre una equipotencial.'
      ],
      note: 'El gradiente como tal (dirección de máximo crecimiento, normal a curvas de nivel) se ve en Cálculo 2 · S08, ya enlazado en la lección. Aquí basta con las derivadas parciales de Cálculo 2 · S04.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §7.3 “Calculations of Electric Potential”. <a href="https://openstax.org/books/university-physics-volume-2/pages/7-3-calculations-of-electric-potential">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §7.4 “Determining Field from Potential”. <a href="https://openstax.org/books/university-physics-volume-2/pages/7-4-determining-field-from-potential">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §7.5 “Equipotential Surfaces and Conductors”. <a href="https://openstax.org/books/university-physics-volume-2/pages/7-5-equipotential-surfaces-and-conductors">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-05',
    next: 'sesion-07'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
