/* =====================================================================
   Física 2 · S08 · Ley de Gauss y sus aplicaciones (bloque B · Gauss y capacitores).
   Fuente: OpenStax, University Physics Volume 2, §6.2–6.4 (CC BY-NC-SA 4.0).
   Sesión de derivaciones (brief N2 §3.1): cada geometría sigue la misma plantilla
   (simetría → superficie gaussiana → flujo en función de E → q_enc → despejar E → comprobar).
   ε₀ = 8.85 × 10⁻¹² C²/(N·m²) y k = 8.99 × 10⁹ N·m²/C²; SI.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js las compara
   contra LabMath.gaussSurface (verify / oracle), que a su vez se prueba contra el flujo
   numérico y la suma de miles de cargas puntuales (scripts/labs-math/gauss-surface.js).
   ===================================================================== */
(function () {
  var k = 8.99e9, eps0 = 8.85e-12, PI = Math.PI;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  // Notación científica en LaTeX: 1.80 \times 10^{3}.
  function sci(v, d) {
    if (v === 0) return '0';
    var e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
    if (Math.abs(+m.toFixed(d == null ? 2 : d)) >= 10) { m /= 10; e += 1; }
    return m.toFixed(d == null ? 2 : d) + ' \\times 10^{' + e + '}';
  }
  // Fórmulas cerradas (SI), escritas aquí aparte de LabMath: q_enc / (ε₀ · área gaussiana).
  function Esolid(Q, R, r) { return r < R ? Q * r / (4 * PI * eps0 * R * R * R) : Q / (4 * PI * eps0 * r * r); }
  function Eline(lam, r) { return lam / (2 * PI * eps0 * r); }
  var cm = function (x) { return x / 100; }, nC = function (q) { return q * 1e-9; };
  var ETXT = '$\\varepsilon_0 = 8.85 \\times 10^{-12}\\ \\text{C}^2/(\\text{N·m}^2)$';
  var QE = 'q_{\\text{enc}}';
  var FOURPI = '4\\pi(8.85 \\times 10^{-12})';

  // Ejemplo 1: esfera sólida, adentro y afuera
  var e1 = { Q: 12e-9, R: 0.05, ri: 0.03, ro: 0.08 };
  e1.qin = e1.Q * Math.pow(e1.ri / e1.R, 3); e1.Ein = Esolid(e1.Q, e1.R, e1.ri); e1.Eout = Esolid(e1.Q, e1.R, e1.ro); e1.ER = Esolid(e1.Q, e1.R, e1.R);
  // Ejemplo 2: alambre largo
  var e2 = { lam: 25e-9, r: 0.06 };
  e2.E = Eline(e2.lam, e2.r); e2.Ek = 2 * k * e2.lam / e2.r;
  // Ejemplo 3: carga a partir del flujo (cubo)
  var e3 = { phi1: 1200 };
  e3.phi = 6 * e3.phi1; e3.q = eps0 * e3.phi;
  // Ejemplo 4: dos placas paralelas
  var e4 = { Q: 40e-9, a: 0.20 };
  e4.A = e4.a * e4.a; e4.sig = e4.Q / e4.A; e4.E = e4.sig / eps0; e4.half = e4.sig / (2 * eps0);

  // La respuesta y cada error típico deben diferir al menos 3 % entre sí.
  function distinct(ex) {
    return function (v) {
      if (ex.id === 'f2-s08-esfera-dentro' && !(v.r < v.R)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (key) { return ex.mistakes[key](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]))) return false;
      }
      return true;
    };
  }

  var data = window.SESSION_DATA = {
    slug: 'sesion-08', number: '08', group: 'B · Gauss y capacitores',
    title: 'Ley de Gauss y sus aplicaciones', temario: [],
    minutes: 180,
    quote: 'El flujo que sale de una superficie cerrada solo sabe cuánta carga hay adentro. Con buena simetría, eso basta para despejar el campo en dos renglones.',
    badges: [
      'Enunciar la ley de Gauss, $\\oint \\vec{E}\\cdot d\\vec{A} = ' + QE + '/\\varepsilon_0$, y explicar qué cuenta como carga encerrada.',
      'Reconocer las tres simetrías (esférica, cilíndrica y plana) y elegir la superficie gaussiana que les corresponde.',
      'Derivar el campo de una carga puntual, una esfera sólida, un cascarón, una línea, un cilindro y un plano con la misma plantilla.',
      'Explicar por qué dentro de un conductor en equilibrio $E = 0$ y la carga se va a la superficie.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'El flujo eléctrico total que sale de una superficie cerrada depende <strong>solo</strong> de la carga que hay adentro: $\\oint \\vec{E}\\cdot d\\vec{A} = ' + QE + '/\\varepsilon_0$. Si la carga tiene simetría, eliges una superficie donde $E$ sea constante, sacas $E$ de la integral y lo despejas.',
        recall: [
          'El flujo eléctrico $\\Phi = \\oint \\vec{E}\\cdot d\\vec{A}$: cuenta cuánto campo atraviesa una superficie, y solo cuenta la parte de $\\vec{E}$ perpendicular a ella (<a href="../sesion-07/">S07</a>).',
          'Los campos que ya sacaste integrando: la línea infinita $2k\\lambda/r$ y el plano $\\sigma/2\\varepsilon_0$ (<a href="../sesion-04/">S04</a>).',
          'Las áreas de la esfera ($4\\pi r^2$) y del lado de un cilindro ($2\\pi r L$), y las coordenadas cilíndricas y esféricas (<a href="../../../calculo-2/sesiones/sesion-03/">Cálculo 2, S03</a>).'
        ],
        why: 'Con Gauss entiendes por qué un coche te protege de un rayo, por qué los cables coaxiales no «se ven» desde afuera y cómo es el campo dentro de un capacitor (S09). Y te ahorra integrales: lo que en S04 te costó una página aquí sale en dos renglones.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en un aspersor de jardín metido en una casa de campaña cerrada. Toda el agua que el aspersor avienta tiene que atravesar la tela. No importa si la casa es redonda o cuadrada, ni si el aspersor está en el centro o en una esquina: el agua que sale por la tela, en total, es la que avienta el aspersor.',
          'Ahora pon otro aspersor <strong>afuera</strong>. Su agua moja la tela por un lado y vuelve a salir por el otro: lo que entra, sale. Cambia cuánto se moja cada pedazo de tela, pero no el total que sale. Las cargas son los aspersores y el campo es el agua.',
          'El truco para calcular: si la casa de campaña es una esfera y el aspersor está justo en el centro, cada pedazo de tela recibe lo mismo. Entonces lo que pasa por un metro cuadrado es el total entre el área. Eso es todo lo que hace la ley de Gauss con la simetría.'
        ]
      },
      {
        type: 'concept', heading: 'La ley de Gauss', short: 'La ley de Gauss',
        body: [
          'Para <strong>cualquier</strong> superficie cerrada (una superficie gaussiana, que es imaginaria: tú la eliges), el flujo eléctrico que sale de ella es la carga encerrada entre $\\varepsilon_0$: $$\\oint \\vec{E}\\cdot d\\vec{A} = \\frac{' + QE + '}{\\varepsilon_0}$$',
          '$d\\vec{A}$ apunta hacia <strong>afuera</strong> de la superficie. $' + QE + '$ es la suma, con signo, de las cargas que quedan <strong>dentro</strong>. Si una distribución queda partida, solo cuenta el pedazo de adentro: con la densidad, $' + QE + ' = \\rho\\cdot(\\text{volumen encerrado})$, $\\sigma\\cdot(\\text{área encerrada})$ o $\\lambda\\cdot(\\text{largo encerrado})$.',
          'El $\\vec{E}$ de la izquierda sí es el campo <strong>total</strong>, el de todas las cargas, de adentro y de afuera. Las de afuera cambian $\\vec{E}$ en cada punto, pero su flujo neto es cero: sus líneas entran y vuelven a salir.'
        ],
        diagram: 'f2s08-law',
        caption: 'Solo $q_1$ y $q_2$ cuentan en el flujo total. Las líneas de $q_3$, que está afuera, entran por un lado y salen por otro: aportan cero al flujo neto, aunque sí cambian el campo sobre la superficie.'
      },
      {
        type: 'callout', heading: 'Gauss siempre es cierta, pero no siempre sirve para despejar E',
        body: [
          'La ley vale para cualquier superficie. Pero para <strong>despejar</strong> $E$ necesitas sacarlo de la integral, y eso solo se puede si sobre la superficie (o sobre las partes por donde pasa flujo) $\\vec{E}$ es perpendicular y tiene el mismo tamaño en todos lados. Entonces $\\oint \\vec{E}\\cdot d\\vec{A} = E\\,A$.',
          'Con un cubo alrededor de una carga puntual, el flujo sigue siendo $q/\\varepsilon_0$, pero $E$ cambia de punto a punto del cubo: no lo puedes despejar. En el lab lo ves con números.'
        ]
      },
      {
        type: 'concept', heading: 'Tres simetrías, tres superficies', short: 'Simetrías',
        body: [
          'Solo hay tres simetrías que hacen el truco. Para cada una se elige la superficie que «copia» la forma de la carga, usando las coordenadas que ya conoces de <a href="../../../calculo-2/sesiones/sesion-03/">Cálculo 2, S03</a>: esféricas para lo esférico y cilíndricas para lo cilíndrico.'
        ],
        list: [
          '<strong>Esférica</strong> (carga puntual, esfera, cascarón): $\\vec{E}$ es radial y solo depende de $r$. Superficie: una <strong>esfera</strong> concéntrica de radio $r$, con área $4\\pi r^2$.',
          '<strong>Cilíndrica</strong> (línea o cilindro infinitos): $\\vec{E}$ sale perpendicular al eje y solo depende de la distancia $r$ al eje. Superficie: un <strong>cilindro</strong> coaxial de radio $r$ y largo $L$. Por el lado pasa flujo $E\\cdot 2\\pi r L$; por las tapas, nada.',
          '<strong>Plana</strong> (plano infinito, placa): $\\vec{E}$ es perpendicular al plano y no cambia al moverte paralelo a él. Superficie: un cilindro corto (o una caja) que cruza el plano. Solo pasa flujo por las tapas.'
        ],
        diagram: 'f2s08-symmetry',
        caption: 'En las tres, la superficie gaussiana es perpendicular a $\\vec{E}$ donde hay flujo y paralela a $\\vec{E}$ en lo demás. Por eso $\\oint \\vec{E}\\cdot d\\vec{A}$ se vuelve $E$ por un área.'
      },
      {
        type: 'callout', heading: 'Siempre los mismos 6 pasos',
        body: [
          '<strong>1.</strong> Simetría: ¿hacia dónde apunta $\\vec{E}$ y de qué depende? <strong>2.</strong> Superficie gaussiana que pase por el punto donde quieres $E$ y respete la simetría. <strong>3.</strong> Flujo en función de $E$: $E$ por el área por donde pasa flujo. <strong>4.</strong> $' + QE + '$: solo lo de adentro. <strong>5.</strong> Iguala y despeja $E$. <strong>6.</strong> Comprueba con S04 o con un límite conocido.',
          'Las derivaciones de abajo siguen esta plantilla. Recórrelas paso a paso con «Siguiente».'
        ]
      },
      {
        type: 'explainer', heading: 'Carga puntual: Coulomb sale de Gauss', short: 'Carga puntual',
        title: 'Carga puntual $q$, campo a una distancia $r$',
        intro: 'El caso más simple, para ver la plantilla completa.',
        diagram: 'f2s08-sphere',
        steps: [
          { text: '<strong>Simetría.</strong> Una carga sola no tiene dirección preferida: $\\vec{E}$ apunta radial y su tamaño solo depende de la distancia $r$.', state: { g: 'point', k: '1', r: 1 } },
          { text: '<strong>Superficie.</strong> Una esfera de radio $r$ centrada en la carga: todos sus puntos están a la misma distancia.', state: { g: 'point', k: '2', r: 1 } },
          { text: '<strong>Flujo.</strong> En cada punto $\\vec{E}$ es perpendicular a la esfera y vale lo mismo, así que sale de la integral: $\\oint \\vec{E}\\cdot d\\vec{A} = E\\cdot 4\\pi r^2$.', state: { g: 'point', k: '3', r: 1 } },
          { text: '<strong>Carga encerrada.</strong> La esfera encierra toda la carga: $' + QE + ' = q$.', state: { g: 'point', k: '4', r: 1 } },
          { text: '<strong>Despeja.</strong> $E\\cdot 4\\pi r^2 = q/\\varepsilon_0$, así que $E = \\frac{q}{4\\pi\\varepsilon_0 r^2}$.', state: { g: 'point', k: '5', r: 1 } },
          { text: '<strong>Comprueba.</strong> Como $k = \\frac{1}{4\\pi\\varepsilon_0}$, queda $E = kq/r^2$: el campo de S03. Coulomb y Gauss dicen lo mismo.', state: { g: 'point', k: '6', r: 1.3 } }
        ]
      },
      {
        type: 'explainer', heading: 'Esfera sólida: adentro y afuera', short: 'Esfera sólida',
        title: 'Esfera aislante de radio $R$ con carga $Q$ repartida en su volumen',
        intro: 'Aquí aparece la idea clave: adentro, la superficie gaussiana solo encierra <strong>parte</strong> de la carga.',
        diagram: 'f2s08-sphere',
        steps: [
          { text: '<strong>Simetría.</strong> La carga está repartida igual en todas direcciones ($\\rho = Q/\\tfrac{4}{3}\\pi R^3$): $\\vec{E}$ es radial y depende solo de $r$.', state: { g: 'solid', k: '1', r: 0.6 } },
          { text: '<strong>Superficie.</strong> Para el campo <strong>adentro</strong>, una esfera de radio $r < R$, concéntrica.', state: { g: 'solid', k: '2', r: 0.6 } },
          { text: '<strong>Flujo.</strong> Igual que antes: $\\oint \\vec{E}\\cdot d\\vec{A} = E\\cdot 4\\pi r^2$.', state: { g: 'solid', k: '3', r: 0.6 } },
          { text: '<strong>Carga encerrada.</strong> Solo la de la esfera chica: $' + QE + ' = \\rho\\cdot\\tfrac{4}{3}\\pi r^3 = Q\\,\\frac{r^3}{R^3}$. La carga entre $r$ y $R$ no cuenta.', state: { g: 'solid', k: '4', r: 0.6 } },
          { text: '<strong>Despeja.</strong> $E\\cdot 4\\pi r^2 = \\frac{Q r^3}{\\varepsilon_0 R^3}$, así que $E = \\frac{Q\\,r}{4\\pi\\varepsilon_0 R^3} = \\frac{kQr}{R^3}$: crece en línea recta desde el centro.', state: { g: 'solid', k: '5', r: 0.6 } },
          { text: '<strong>Afuera y comprueba.</strong> Con $r > R$, $' + QE + ' = Q$ y $E = kQ/r^2$, como una carga puntual. En $r = R$ las dos fórmulas dan $kQ/R^2$: el campo no salta. En el centro, $E = 0$.', state: { g: 'solid', k: '6', r: 1.4 } }
        ]
      },
      {
        type: 'explainer', heading: 'Cascarón esférico: adentro no hay campo', short: 'Cascarón',
        title: 'Cascarón delgado de radio $R$ con carga $Q$ en su superficie',
        intro: 'Misma superficie, otra carga encerrada: por eso el resultado es tan distinto.',
        diagram: 'f2s08-sphere',
        steps: [
          { text: '<strong>Simetría.</strong> Toda la carga está a la distancia $R$ del centro, repartida igual: simetría esférica.', state: { g: 'shell', k: '1', r: 0.6 } },
          { text: '<strong>Superficie.</strong> Para el campo adentro, una esfera de radio $r < R$.', state: { g: 'shell', k: '2', r: 0.6 } },
          { text: '<strong>Flujo.</strong> $\\oint \\vec{E}\\cdot d\\vec{A} = E\\cdot 4\\pi r^2$.', state: { g: 'shell', k: '3', r: 0.6 } },
          { text: '<strong>Carga encerrada.</strong> Ninguna: toda la carga está en $R$, afuera de tu esfera. $' + QE + ' = 0$.', state: { g: 'shell', k: '4', r: 0.6 } },
          { text: '<strong>Despeja.</strong> $E\\cdot 4\\pi r^2 = 0$, así que $E = 0$ en <strong>todo</strong> el interior, no solo en el centro.', state: { g: 'shell', k: '5', r: 0.6 } },
          { text: '<strong>Afuera y comprueba.</strong> Con $r > R$, $' + QE + ' = Q$ y $E = kQ/r^2$. Al cruzar el cascarón, $E$ salta de $0$ a $kQ/R^2 = \\sigma/\\varepsilon_0$, donde $\\sigma = Q/4\\pi R^2$.', state: { g: 'shell', k: '6', r: 1.4 } }
        ]
      },
      {
        type: 'explainer', heading: 'Esfera conductora: la carga se va a la orilla', short: 'Esfera conductora',
        title: 'Esfera de metal con carga $Q$, en equilibrio',
        intro: 'Un conductor tiene cargas libres. En equilibrio ya no se mueven, y eso decide todo.',
        diagram: 'f2s08-sphere',
        steps: [
          { text: '<strong>Simetría.</strong> Las cargas de más se repelen y se alejan lo más posible: terminan en la superficie, repartidas igual.', state: { g: 'conductor', k: '1', r: 0.6 } },
          { text: '<strong>Superficie.</strong> Una esfera de radio $r < R$, toda dentro del metal.', state: { g: 'conductor', k: '2', r: 0.6 } },
          { text: '<strong>Flujo.</strong> $\\oint \\vec{E}\\cdot d\\vec{A} = E\\cdot 4\\pi r^2$.', state: { g: 'conductor', k: '3', r: 0.6 } },
          { text: '<strong>Carga encerrada.</strong> Por dentro el metal es neutro (tantos protones como electrones): $' + QE + ' = 0$.', state: { g: 'conductor', k: '4', r: 0.6 } },
          { text: '<strong>Despeja.</strong> $E = 0$ dentro del metal. Tiene sentido: si hubiera campo, empujaría a las cargas libres y no estarían en equilibrio.', state: { g: 'conductor', k: '5', r: 0.6 } },
          { text: '<strong>Afuera y comprueba.</strong> Afuera da $kQ/r^2$, igual que el cascarón. Por fuera no puedes distinguir una esfera de metal de un cascarón con la misma carga.', state: { g: 'conductor', k: '6', r: 1.4 } }
        ]
      },
      {
        type: 'explainer', heading: 'Línea infinita', short: 'Línea infinita',
        title: 'Línea muy larga con densidad $\\lambda$, campo a una distancia $r$',
        intro: 'Ahora la superficie es un cilindro, y aparecen las tapas, por donde no pasa flujo.',
        diagram: 'f2s08-line',
        steps: [
          { text: '<strong>Simetría.</strong> La línea se ve igual si la giras o si te mueves a lo largo de ella: $\\vec{E}$ sale perpendicular a la línea y solo depende de la distancia $r$.', state: { g: 'line', k: '1', r: 1.6 } },
          { text: '<strong>Superficie.</strong> Un cilindro coaxial de radio $r$ y largo $L$ (cualquier $L$: se va a cancelar).', state: { g: 'line', k: '2', r: 1.6 } },
          { text: '<strong>Flujo.</strong> En el lado, $\\vec{E}$ es perpendicular y constante: $E\\cdot 2\\pi r L$. En las tapas, $\\vec{E}$ es paralelo a ellas: flujo cero.', state: { g: 'line', k: '3', r: 1.6 } },
          { text: '<strong>Carga encerrada.</strong> El tramo de línea dentro del cilindro: $' + QE + ' = \\lambda L$.', state: { g: 'line', k: '4', r: 1.6 } },
          { text: '<strong>Despeja.</strong> $E\\cdot 2\\pi r L = \\lambda L/\\varepsilon_0$; la $L$ se cancela y $E = \\frac{\\lambda}{2\\pi\\varepsilon_0 r}$.', state: { g: 'line', k: '5', r: 1.6 } },
          { text: '<strong>Comprueba.</strong> Con $\\frac{1}{2\\pi\\varepsilon_0} = 2k$ queda $E = \\frac{2k\\lambda}{r}$: lo mismo que la varilla de <a href="../sesion-04/">S04</a> cuando $L \\to \\infty$, sin integrar.', state: { g: 'line', k: '6', r: 1.2 } }
        ]
      },
      {
        type: 'explainer', heading: 'Cilindro sólido infinito: adentro y afuera', short: 'Cilindro sólido',
        title: 'Cilindro aislante de radio $R$ con $\\lambda$ por metro, repartida en su volumen',
        intro: 'Lo mismo que la esfera sólida, pero con cilindros: adentro solo cuenta una parte.',
        diagram: 'f2s08-line',
        steps: [
          { text: '<strong>Simetría.</strong> Cilíndrica, igual que la línea: $\\vec{E}$ radial desde el eje.', state: { g: 'cyl', k: '1', r: 0.6 } },
          { text: '<strong>Superficie.</strong> Un cilindro coaxial de radio $r < R$ y largo $L$.', state: { g: 'cyl', k: '2', r: 0.6 } },
          { text: '<strong>Flujo.</strong> $E\\cdot 2\\pi r L$ por el lado; nada por las tapas.', state: { g: 'cyl', k: '3', r: 0.6 } },
          { text: '<strong>Carga encerrada.</strong> La fracción del área de la sección: $' + QE + ' = \\lambda L\\,\\frac{\\pi r^2}{\\pi R^2} = \\lambda L\\,\\frac{r^2}{R^2}$.', state: { g: 'cyl', k: '4', r: 0.6 } },
          { text: '<strong>Despeja.</strong> $E = \\frac{\\lambda\\,r}{2\\pi\\varepsilon_0 R^2}$: crece en línea recta con $r$.', state: { g: 'cyl', k: '5', r: 0.6 } },
          { text: '<strong>Afuera y comprueba.</strong> Con $r > R$ encierra todo, $\\lambda L$, y $E = \\frac{\\lambda}{2\\pi\\varepsilon_0 r}$, como la línea. En $r = R$ coinciden: no hay salto.', state: { g: 'cyl', k: '6', r: 1.6 } }
        ]
      },
      {
        type: 'explainer', heading: 'Plano infinito', short: 'Plano infinito',
        title: 'Hoja de carga muy grande con densidad $\\sigma$',
        intro: 'Aquí la superficie es un cilindro corto que atraviesa el plano; el flujo sale por las dos tapas.',
        diagram: 'f2s08-plane',
        steps: [
          { text: '<strong>Simetría.</strong> El plano se ve igual si te mueves paralelo a él: $\\vec{E}$ es perpendicular al plano, alejándose de él si $\\sigma > 0$.', state: { g: 'sheet', k: '1' } },
          { text: '<strong>Superficie.</strong> Un cilindro corto con tapas de área $A$, paralelas al plano, una de cada lado y a la misma distancia.', state: { g: 'sheet', k: '2' } },
          { text: '<strong>Flujo.</strong> Por cada tapa sale $E A$; por el lado, $\\vec{E}$ es paralelo y no hay flujo. Total: $2EA$.', state: { g: 'sheet', k: '3' } },
          { text: '<strong>Carga encerrada.</strong> El pedazo de plano dentro del cilindro, de área $A$: $' + QE + ' = \\sigma A$.', state: { g: 'sheet', k: '4' } },
          { text: '<strong>Despeja.</strong> $2EA = \\sigma A/\\varepsilon_0$, así que $E = \\frac{\\sigma}{2\\varepsilon_0}$.', state: { g: 'sheet', k: '5' } },
          { text: '<strong>Comprueba.</strong> No depende de la distancia: es el disco de <a href="../sesion-04/">S04</a> cuando $R \\to \\infty$, $\\frac{\\sigma}{2\\varepsilon_0}\\big(1 - \\frac{z}{\\sqrt{z^2 + R^2}}\\big) \\to \\frac{\\sigma}{2\\varepsilon_0}$.', state: { g: 'sheet', k: '6' } }
        ]
      },
      {
        type: 'explainer', heading: 'Placa conductora: el doble, por un solo lado', short: 'Placa conductora',
        title: 'Placa de metal grande, con densidad $\\sigma$ en cada cara',
        intro: 'Parece igual al plano, pero dentro del metal $E = 0$. Eso cambia el factor 2.',
        diagram: 'f2s08-plane',
        steps: [
          { text: '<strong>Simetría.</strong> Plana: afuera, $\\vec{E}$ es perpendicular a la placa. La carga del conductor está en sus caras, $\\sigma$ en cada una.', state: { g: 'plate', k: '1' } },
          { text: '<strong>Superficie.</strong> Un cilindro corto con una tapa <strong>dentro del metal</strong> y la otra afuera.', state: { g: 'plate', k: '2' } },
          { text: '<strong>Flujo.</strong> Dentro del metal $E = 0$: por esa tapa no sale nada. Por el lado tampoco. Solo sale $EA$ por la tapa de afuera.', state: { g: 'plate', k: '3' } },
          { text: '<strong>Carga encerrada.</strong> La de la cara que quedó adentro: $' + QE + ' = \\sigma A$.', state: { g: 'plate', k: '4' } },
          { text: '<strong>Despeja.</strong> $EA = \\sigma A/\\varepsilon_0$, así que $E = \\frac{\\sigma}{\\varepsilon_0}$ junto a la superficie del conductor.', state: { g: 'plate', k: '5' } },
          { text: '<strong>Comprueba.</strong> Es el doble que la hoja sola: aquí todo el flujo sale por un lado. Así es el campo entre las placas de un capacitor (S09).', state: { g: 'plate', k: '6' } }
        ]
      },
      {
        type: 'concept', heading: 'Conductores en equilibrio', short: 'Conductores',
        body: [
          'Un conductor en equilibrio electrostático cumple cuatro cosas, y todas salen de Gauss y de que sus cargas libres ya no se mueven.'
        ],
        list: [
          '<strong>Dentro del metal, $E = 0$.</strong> Si no, las cargas libres se moverían.',
          '<strong>La carga de más está en la superficie.</strong> Una superficie gaussiana justo debajo de la orilla tiene $E = 0$ en todos lados, así que $' + QE + ' = 0$.',
          '<strong>Justo afuera, $E = \\sigma/\\varepsilon_0$ y perpendicular a la superficie.</strong> Si tuviera una parte paralela, movería las cargas de la orilla.',
          '<strong>Cavidades.</strong> Si la cavidad está vacía, ahí $E = 0$: es una <strong>jaula de Faraday</strong> (por eso el coche te protege de un rayo y el elevador corta la señal del celular). Si adentro hay una carga $q$, en la pared aparece $-q$ y en la orilla de afuera $+q$ extra.'
        ],
        diagram: 'f2s08-conductor',
        caption: 'La superficie gaussiana punteada va por dentro del metal: ahí $E = 0$, así que encierra carga neta cero. Por eso la pared de la cavidad junta $-q$, y para que el conductor conserve su carga aparece $+q$ en la orilla de afuera.'
      },
      {
        type: 'callout', heading: 'Lo que sacaste hoy, contra S04',
        body: [
          '<strong>Línea infinita:</strong> $\\frac{\\lambda}{2\\pi\\varepsilon_0 r} = \\frac{2k\\lambda}{r}$, igual que la varilla larga. <strong>Plano:</strong> $\\frac{\\sigma}{2\\varepsilon_0}$, igual que el disco enorme. <strong>Esfera, por fuera:</strong> $\\frac{kQ}{r^2}$, como si toda la carga estuviera en el centro.',
          'Gauss no reemplaza a la integral de S04: solo funciona con estas tres simetrías. Para una varilla finita, un anillo o un disco tienes que integrar.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: campo con la ley de Gauss', short: 'Receta',
        steps: [
          { text: 'Identifica la simetría: esférica, cilíndrica o plana. Si no hay ninguna, Gauss no sirve para despejar $E$.', tip: 'Una varilla finita o un disco no tienen la simetría: ahí se integra como en S04.' },
          { text: 'Elige la superficie gaussiana que pasa por el punto donde quieres $E$: esfera de radio $r$, cilindro coaxial de radio $r$, o cilindro corto que cruza el plano.' },
          { text: 'Escribe el flujo como $E$ por el área por donde pasa flujo: $4\\pi r^2$, $2\\pi r L$ o $2A$ (una sola $A$ si una tapa queda dentro de un conductor).', tip: 'Las tapas del cilindro alrededor de una línea no tienen flujo: el área es $2\\pi r L$, no $4\\pi r^2$ ni $2\\pi r L + 2\\pi r^2$.' },
          { text: 'Calcula $' + QE + '$: solo la carga dentro de la superficie, con la densidad por el volumen, área o largo encerrado.', tip: 'Dentro de una esfera o un cilindro sólido, $' + QE + '$ no es la carga total. Dentro de un conductor o de un cascarón, es cero.' },
          { text: 'Iguala a $' + QE + '/\\varepsilon_0$, despeja $E$ y comprueba: en la frontera $r = R$ el campo no salta (salvo que haya carga en la superficie) y lejos debe parecer una carga puntual.' }
        ]
      },
      {
        type: 'example', heading: 'Esfera sólida: adentro y afuera',
        problem: '<p>Una esfera aislante de $' + fx(e1.R * 100, 0) + '\\ \\text{cm}$ de radio tiene $' + fx(e1.Q * 1e9, 0) + '\\ \\text{nC}$ repartidos de forma uniforme en su volumen. ¿Cuánto vale el campo a $' + fx(e1.ri * 100, 0) + '\\ \\text{cm}$ del centro? ¿Y a $' + fx(e1.ro * 100, 0) + '\\ \\text{cm}$? Usa ' + ETXT + '.</p>',
        steps: [
          { text: 'Adentro ($r = ' + fx(e1.ri) + '\\ \\text{m} < R$): la esfera gaussiana encierra solo una fracción de la carga.', math: '\\begin{aligned} ' + QE + ' &= Q\\,\\frac{r^3}{R^3} \\\\ &= (' + fx(e1.Q * 1e9, 0) + '\\ \\text{nC})\\frac{(' + fx(e1.ri) + ')^3}{(' + fx(e1.R) + ')^3} \\\\ &= ' + fx(e1.qin * 1e9) + '\\ \\text{nC} \\end{aligned}' },
          { text: 'Flujo: $E\\cdot 4\\pi r^2 = ' + QE + '/\\varepsilon_0$. Despeja.', math: '\\begin{aligned} E &= \\frac{' + QE + '}{4\\pi\\varepsilon_0 r^2} \\\\ &= \\frac{' + fx(e1.qin * 1e9) + ' \\times 10^{-9}}{' + FOURPI + '(' + fx(e1.ri) + ')^2} \\\\ &= ' + sci(e1.Ein) + '\\ \\text{N/C} \\end{aligned}' },
          { text: 'Afuera ($r = ' + fx(e1.ro) + '\\ \\text{m} > R$): encierra toda la carga.', math: '\\begin{aligned} E &= \\frac{Q}{4\\pi\\varepsilon_0 r^2} \\\\ &= \\frac{' + fx(e1.Q * 1e9, 0) + ' \\times 10^{-9}}{' + FOURPI + '(' + fx(e1.ro) + ')^2} \\\\ &= ' + sci(e1.Eout) + '\\ \\text{N/C} \\end{aligned}' },
          { text: 'Comprueba: en la superficie, $kQ/R^2 = ' + sci(e1.ER) + '\\ \\text{N/C}$, más que en los dos puntos. Adentro sube en línea recta hasta ahí y afuera baja como $1/r^2$.' }
        ],
        answer: 'A ' + fx(e1.ri * 100, 0) + ' cm, $E \\approx ' + sci(e1.Ein) + '\\ \\text{N/C}$; a ' + fx(e1.ro * 100, 0) + ' cm, $E \\approx ' + sci(e1.Eout) + '\\ \\text{N/C}$. Ambos radiales, hacia afuera.',
        verify: { lab: 'call', mod: 'gaussSurface', fn: 'solidE', args: [e1.Q, e1.R, e1.ri], value: e1.Ein }
      },
      {
        type: 'example', heading: 'Campo de un alambre largo',
        problem: '<p>Un alambre muy largo tiene $\\lambda = ' + fx(e2.lam * 1e9, 0) + '\\ \\text{nC/m}$. ¿Qué campo hay a $' + fx(e2.r * 100, 0) + '\\ \\text{cm}$ de él? Usa ' + ETXT + '.</p>',
        steps: [
          { text: 'Simetría cilíndrica: cilindro gaussiano de radio $r$ y largo $L$. Las tapas no tienen flujo.', math: 'E\\cdot 2\\pi r L = \\frac{\\lambda L}{\\varepsilon_0}' },
          { text: 'La $L$ se cancela. Sustituye en metros.', math: '\\begin{aligned} E &= \\frac{\\lambda}{2\\pi\\varepsilon_0 r} \\\\ &= \\frac{' + fx(e2.lam * 1e9, 0) + ' \\times 10^{-9}}{2\\pi(8.85 \\times 10^{-12})(' + fx(e2.r) + ')} \\\\ &= ' + sci(e2.E) + '\\ \\text{N/C} \\end{aligned}' },
          { text: 'Comprueba con S04: $2k\\lambda/r$ con $k = 8.99 \\times 10^9$ da casi lo mismo (la diferencia es solo el redondeo de las constantes).', math: '\\frac{2k\\lambda}{r} = ' + sci(e2.Ek) + '\\ \\text{N/C}' }
        ],
        answer: '$E \\approx ' + sci(e2.E) + '\\ \\text{N/C}$, perpendicular al alambre y alejándose de él.',
        verify: { lab: 'call', mod: 'gaussSurface', fn: 'lineE', args: [e2.lam, e2.r], value: e2.E }
      },
      {
        type: 'example', heading: 'Carga encerrada a partir del flujo',
        problem: '<p>Una carga está en el centro de una caja cúbica cerrada. Por <strong>una</strong> de las caras sale un flujo de $' + e3.phi1 + '\\ \\text{N·m}^2/\\text{C}$. ¿Cuánto vale la carga? Usa ' + ETXT + '.</p>',
        steps: [
          { text: 'Por simetría, las seis caras reciben el mismo flujo. El flujo total es seis veces el de una cara.', math: '\\Phi = 6(' + e3.phi1 + ') = ' + e3.phi + '\\ \\text{N·m}^2/\\text{C}' },
          { text: 'Gauss: $\\Phi = ' + QE + '/\\varepsilon_0$. Despeja la carga.', math: '\\begin{aligned} q &= \\varepsilon_0\\,\\Phi \\\\ &= (8.85 \\times 10^{-12})(' + e3.phi + ') \\\\ &= ' + sci(e3.q) + '\\ \\text{C} \\end{aligned}' },
          { text: 'Ojo: el cubo no sirve para despejar $E$ (el campo cambia sobre cada cara), pero sí para la carga, porque Gauss vale para cualquier superficie cerrada.' }
        ],
        answer: '$q \\approx ' + sci(e3.q) + '\\ \\text{C} = ' + fx(e3.q * 1e9) + '\\ \\text{nC}$.',
        verify: { lab: 'call', mod: 'gaussSurface', fn: 'chargeFromFlux', args: [e3.phi], value: e3.q }
      },
      {
        type: 'example', heading: 'Dos placas paralelas',
        problem: '<p>Dos placas cuadradas de metal de $' + fx(e4.a * 100, 0) + '\\ \\text{cm}$ de lado, muy cerca una de la otra, tienen $+' + fx(e4.Q * 1e9, 0) + '\\ \\text{nC}$ y $-' + fx(e4.Q * 1e9, 0) + '\\ \\text{nC}$. ¿Cuánto vale el campo entre ellas, lejos de las orillas? ¿Y afuera? Usa ' + ETXT + '.</p>',
        steps: [
          { text: 'Las cargas opuestas se atraen y se van a las caras de adentro. Densidad de cada una:', math: '\\begin{aligned} \\sigma &= \\frac{Q}{A} = \\frac{' + fx(e4.Q * 1e9, 0) + ' \\times 10^{-9}}{(' + fx(e4.a) + ')^2} \\\\ &= ' + sci(e4.sig) + '\\ \\text{C/m}^2 \\end{aligned}' },
          { text: 'Cilindro gaussiano con una tapa dentro del metal y la otra entre las placas: es el caso del conductor, $E = \\sigma/\\varepsilon_0$.', math: '\\begin{aligned} E &= \\frac{\\sigma}{\\varepsilon_0} = \\frac{' + sci(e4.sig) + '}{8.85 \\times 10^{-12}} \\\\ &= ' + sci(e4.E) + '\\ \\text{N/C} \\end{aligned}' },
          { text: 'Con dos hojas: cada una da $\\sigma/2\\varepsilon_0 = ' + sci(e4.half) + '\\ \\text{N/C}$. Entre las placas apuntan igual y se suman; afuera apuntan opuesto y se cancelan.' }
        ],
        answer: 'Entre las placas, $E \\approx ' + sci(e4.E) + '\\ \\text{N/C}$, de la positiva a la negativa; afuera, $E \\approx 0$.',
        verify: { lab: 'call', mod: 'gaussSurface', fn: 'plateE', args: [e4.sig], value: e4.E }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: 'Si la carga de afuera no cuenta en $' + QE + '$, ¿no cambia el campo?', a: 'Sí lo cambia, punto por punto. Lo que no cambia es el flujo <strong>total</strong>: lo que entra por un lado sale por el otro. Por eso, si hay cargas afuera que rompen la simetría, ya no puedes despejar $E$ aunque la ley siga siendo cierta.' },
          { q: '¿Por qué en el cilindro no cuento las tapas?', a: 'Porque ahí $\\vec{E}$ es paralelo a la tapa: $\\vec{E}\\cdot d\\vec{A} = 0$. Alrededor de una línea, el campo sale de lado, no a lo largo de la línea. En el plano es al revés: solo cuentan las tapas.' },
          { q: 'Si $E = 0$ en un punto, ¿no hay carga cerca?', a: 'No necesariamente. Dentro de un cascarón cargado $E = 0$ aunque haya mucha carga alrededor: los empujones de todos lados se cancelan. Lo que dice Gauss es que dentro no hay carga <strong>neta encerrada</strong>.' },
          { q: '¿Es $\\sigma/\\varepsilon_0$ o $\\sigma/2\\varepsilon_0$?', a: 'Una hoja de carga sola, como un plástico cargado: $\\sigma/2\\varepsilon_0$, porque el flujo sale por los dos lados. Junto a un conductor: $\\sigma/\\varepsilon_0$, porque adentro del metal $E = 0$ y todo sale por un lado.' },
          { q: '¿Puedo usar Gauss con un disco o una varilla finita?', a: 'La ley se cumple, pero no te ayuda a despejar $E$: no hay una superficie donde $E$ sea constante. Para esas formas usa la integral de S04. Gauss solo despeja $E$ con simetría esférica, cilíndrica o plana.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          '$\\oint \\vec{E}\\cdot d\\vec{A} = ' + QE + '/\\varepsilon_0$ para cualquier superficie cerrada; solo cuenta la carga de adentro.',
          'Para despejar $E$ necesitas simetría: esfera ($4\\pi r^2$), cilindro ($2\\pi r L$, sin tapas) o cilindro corto que cruza el plano ($2A$).',
          'Adentro de una distribución sólida, $' + QE + '$ es solo una fracción: $E$ crece con $r$. Dentro de un cascarón o un conductor, $E = 0$.',
          'Plano: $\\sigma/2\\varepsilon_0$; junto a un conductor: $\\sigma/\\varepsilon_0$. Todo coincide con lo que integraste en S04.'
        ]
      }
    ],

    lab: {
      type: 'gauss-surface', title: 'Elige tu superficie gaussiana',
      intro: 'Elige una distribución y una superficie, cambia su tamaño $r$ y descéntrala. El lab sombrea la carga encerrada, calcula el flujo $\\oint \\vec{E}\\cdot d\\vec{A}$ sumando sobre la superficie y lo compara con $q_{\\text{enc}}/\\varepsilon_0$: siempre coinciden. Lo que cambia es si $E$ es constante sobre la superficie, es decir, si te sirve para despejar $E$. Escribe tu $E$ a la distancia $r$ y el lab te dice si usaste la carga total en vez de $q_{\\text{enc}}$, el área equivocada o el factor 2 del plano.',
      cfg: { start: { dist: 'solid', surf: 'sphere', R: 6, Q: 8, r: 3, s: 0 } }
    },

    formulas: [
      { label: 'Ley de Gauss', tex: '\\oint \\vec{E}\\cdot d\\vec{A} = \\frac{q_{\\text{enc}}}{\\varepsilon_0}' },
      { label: 'Carga puntual, esfera por fuera', tex: 'E = \\frac{Q}{4\\pi\\varepsilon_0 r^2} = \\frac{kQ}{r^2}' },
      { label: 'Esfera sólida, adentro', tex: 'E = \\frac{Q\\,r}{4\\pi\\varepsilon_0 R^3}' },
      { label: 'Cascarón o conductor, adentro', tex: 'E = 0' },
      { label: 'Línea infinita', tex: 'E = \\frac{\\lambda}{2\\pi\\varepsilon_0 r} = \\frac{2k\\lambda}{r}' },
      { label: 'Cilindro sólido, adentro', tex: 'E = \\frac{\\lambda\\,r}{2\\pi\\varepsilon_0 R^2}' },
      { label: 'Plano infinito', tex: 'E = \\frac{\\sigma}{2\\varepsilon_0}' },
      { label: 'Junto a un conductor', tex: 'E = \\frac{\\sigma}{\\varepsilon_0}' },
      { label: 'Constantes', tex: '\\varepsilon_0 = 8.85 \\times 10^{-12},\\ \\ k = \\frac{1}{4\\pi\\varepsilon_0}' }
    ],

    exercises: [
      {
        id: 'f2-s08-esfera-dentro', title: 'Esfera sólida: campo adentro',
        vars: { R: [4, 12, 1], Q: [2, 30, 1], r: [1, 11, 1] },
        prompt: function (v) { return '<p>Una esfera aislante de $' + v.R + '\\ \\text{cm}$ de radio tiene $' + v.Q + '\\ \\text{nC}$ repartidos de forma uniforme en su volumen. ¿Cuánto vale el campo eléctrico a $' + v.r + '\\ \\text{cm}$ del centro? Da $E$ en N/C. Usa ' + ETXT + '.</p>'; },
        check: 'numeric', unit: 'N/C',
        answer: function (v) { return Esolid(nC(v.Q), cm(v.R), cm(v.r)); },
        mistakes: {
          totalCharge: function (v) { return nC(v.Q) / (4 * PI * eps0 * cm(v.r) * cm(v.r)); },
          surface: function (v) { return nC(v.Q) / (4 * PI * eps0 * cm(v.R) * cm(v.R)); },
          area: function (v) { return 2 * Esolid(nC(v.Q), cm(v.R), cm(v.r)); }
        },
        feedback: [
          { when: 'totalCharge', say: 'Usaste toda la carga. Tu esfera gaussiana de radio $r$ solo encierra $' + QE + ' = Q\\,r^3/R^3$.' },
          { when: 'surface', say: 'Ese es el campo en la superficie de la esfera. Adentro es más chico: $E = \\frac{Qr}{4\\pi\\varepsilon_0 R^3}$.' },
          { when: 'area', say: 'Revisa el área: la esfera gaussiana mide $4\\pi r^2$, no $2\\pi r^2$.' }
        ],
        oracle: { lab: 'call', mod: 'gaussSurface', fn: 'solidE', args: function (v) { return [nC(v.Q), cm(v.R), cm(v.r)]; } },
        hint: 'Esfera gaussiana de radio $r$: $E\\cdot 4\\pi r^2 = ' + QE + '/\\varepsilon_0$ con $' + QE + ' = Q\\,r^3/R^3$. Todo en metros y coulombs.',
        solution: function (v) {
          var q = nC(v.Q) * Math.pow(v.r / v.R, 3), E = Esolid(nC(v.Q), cm(v.R), cm(v.r));
          return '$$\\begin{aligned} ' + QE + ' &= Q\\,\\frac{r^3}{R^3} = ' + v.Q + '\\,\\frac{' + v.r + '^3}{' + v.R + '^3}\\ \\text{nC} \\\\ &= ' + fx(q * 1e9, 3) + '\\ \\text{nC} \\end{aligned}$$ $$\\begin{aligned} E &= \\frac{' + QE + '}{4\\pi\\varepsilon_0 r^2} \\\\ &= \\frac{' + fx(q * 1e9, 3) + ' \\times 10^{-9}}{' + FOURPI + '(' + fx(cm(v.r)) + ')^2} \\\\ &= ' + sci(E) + '\\ \\text{N/C} \\end{aligned}$$';
        }
      },
      {
        id: 'f2-s08-esfera-fuera', title: 'Esfera sólida: campo afuera',
        vars: { R: [2, 8, 1], Q: [2, 30, 1], r: [9, 40, 1] },
        prompt: function (v) { return '<p>Una esfera aislante de $' + v.R + '\\ \\text{cm}$ de radio tiene $' + v.Q + '\\ \\text{nC}$ repartidos de forma uniforme. ¿Cuánto vale el campo a $' + v.r + '\\ \\text{cm}$ del centro? Da $E$ en N/C. Usa ' + ETXT + '.</p>'; },
        check: 'numeric', unit: 'N/C',
        answer: function (v) { return Esolid(nC(v.Q), cm(v.R), cm(v.r)); },
        mistakes: {
          insideFormula: function (v) { return nC(v.Q) * cm(v.r) / (4 * PI * eps0 * Math.pow(cm(v.R), 3)); },
          useR: function (v) { return nC(v.Q) / (4 * PI * eps0 * cm(v.R) * cm(v.R)); },
          area: function (v) { return 2 * Esolid(nC(v.Q), cm(v.R), cm(v.r)); }
        },
        feedback: [
          { when: 'insideFormula', say: 'Esa es la fórmula de adentro. Afuera la esfera gaussiana encierra toda la carga: $E = \\frac{Q}{4\\pi\\varepsilon_0 r^2}$.' },
          { when: 'useR', say: 'Usaste el radio de la esfera cargada. La distancia es la del punto al centro, $r$.' },
          { when: 'area', say: 'Revisa el área de la esfera gaussiana: $4\\pi r^2$.' }
        ],
        oracle: { lab: 'call', mod: 'gaussSurface', fn: 'solidE', args: function (v) { return [nC(v.Q), cm(v.R), cm(v.r)]; } },
        hint: 'Afuera, $' + QE + ' = Q$: se comporta como una carga puntual en el centro.',
        solution: function (v) {
          return '$$\\begin{aligned} E &= \\frac{Q}{4\\pi\\varepsilon_0 r^2} \\\\ &= \\frac{' + v.Q + ' \\times 10^{-9}}{' + FOURPI + '(' + fx(cm(v.r)) + ')^2} \\\\ &= ' + sci(Esolid(nC(v.Q), cm(v.R), cm(v.r))) + '\\ \\text{N/C} \\end{aligned}$$';
        }
      },
      {
        id: 'f2-s08-linea', title: 'Línea infinita con Gauss',
        vars: { lam: [2, 60, 2], r: [1, 40, 1] },
        prompt: function (v) { return '<p>Un alambre muy largo tiene $\\lambda = ' + v.lam + '\\ \\text{nC/m}$. Con la ley de Gauss, ¿cuánto vale el campo a $' + v.r + '\\ \\text{cm}$ del alambre? Da $E$ en N/C. Usa ' + ETXT + '.</p>'; },
        check: 'numeric', unit: 'N/C',
        answer: function (v) { return Eline(v.lam * 1e-9, cm(v.r)); },
        mistakes: {
          sphereArea: function (v) { return v.lam * 1e-9 / (4 * PI * eps0 * cm(v.r)); },
          squared: function (v) { return v.lam * 1e-9 / (2 * PI * eps0 * cm(v.r) * cm(v.r)); },
          withCaps: function (v) { var r = cm(v.r); return v.lam * 1e-9 / (eps0 * (2 * PI * r + 2 * PI * r * r)); }
        },
        feedback: [
          { when: 'sphereArea', say: 'Usaste $4\\pi$, como en la esfera. El lado del cilindro gaussiano mide $2\\pi r L$.' },
          { when: 'squared', say: 'Alrededor de una línea el campo baja como $1/r$, no como $1/r^2$: el área es $2\\pi r L$.' },
          { when: 'withCaps', say: 'Contaste las tapas. Ahí $\\vec{E}$ es paralelo a la tapa y no hay flujo.' }
        ],
        oracle: { lab: 'call', mod: 'gaussSurface', fn: 'lineE', args: function (v) { return [v.lam * 1e-9, cm(v.r)]; } },
        hint: 'Cilindro gaussiano de radio $r$ y largo $L$: $E\\cdot 2\\pi r L = \\lambda L/\\varepsilon_0$.',
        solution: function (v) {
          return '$$\\begin{aligned} E &= \\frac{\\lambda}{2\\pi\\varepsilon_0 r} \\\\ &= \\frac{' + v.lam + ' \\times 10^{-9}}{2\\pi(8.85 \\times 10^{-12})(' + fx(cm(v.r)) + ')} \\\\ &= ' + sci(Eline(v.lam * 1e-9, cm(v.r))) + '\\ \\text{N/C} \\end{aligned}$$';
        }
      },
      {
        id: 'f2-s08-flujo-carga', title: 'Carga a partir del flujo',
        vars: { phi: [100, 5000, 100] },
        prompt: function (v) { return '<p>Una carga puntual está en el centro de una caja cúbica cerrada. Por una sola de las caras sale un flujo de $' + v.phi + '\\ \\text{N·m}^2/\\text{C}$. ¿Cuánto vale la carga, en nC? Usa ' + ETXT + '.</p>'; },
        check: 'numeric', unit: 'nC',
        answer: function (v) { return 6 * v.phi * eps0 * 1e9; },
        mistakes: {
          oneFace: function (v) { return v.phi * eps0 * 1e9; },
          fourPi: function (v) { return 6 * v.phi * eps0 * 4 * PI * 1e9; }
        },
        feedback: [
          { when: 'oneFace', say: 'Ese es el flujo de una sola cara. Gauss usa el flujo total: las seis caras reciben lo mismo.' },
          { when: 'fourPi', say: 'Aquí no va $4\\pi$: la ley es $\\Phi = ' + QE + '/\\varepsilon_0$, sin importar la forma de la superficie.' }
        ],
        oracle: { lab: 'call', mod: 'gaussSurface', fn: 'chargeFromFlux', args: function (v) { return [6 * v.phi * 1e9]; } },
        hint: 'Por simetría, cada cara se lleva un sexto del flujo total. Luego $q = \\varepsilon_0\\,\\Phi$.',
        solution: function (v) {
          return '$$\\begin{aligned} \\Phi &= 6(' + v.phi + ') = ' + 6 * v.phi + '\\ \\text{N·m}^2/\\text{C} \\\\ q &= \\varepsilon_0\\,\\Phi = (8.85 \\times 10^{-12})(' + 6 * v.phi + ') \\\\ &= ' + sci(6 * v.phi * eps0) + '\\ \\text{C} \\\\ &= ' + fx(6 * v.phi * eps0 * 1e9) + '\\ \\text{nC} \\end{aligned}$$';
        }
      },
      {
        id: 'f2-s08-placas', title: 'Campo entre placas',
        vars: { Q: [5, 90, 5], a: [10, 50, 5] },
        prompt: function (v) { return '<p>Dos placas cuadradas de metal de $' + v.a + '\\ \\text{cm}$ de lado, paralelas y muy cerca, tienen $+' + v.Q + '\\ \\text{nC}$ y $-' + v.Q + '\\ \\text{nC}$. ¿Cuánto vale el campo entre ellas, lejos de las orillas? Da $E$ en N/C. Usa ' + ETXT + '.</p>'; },
        check: 'numeric', unit: 'N/C',
        answer: function (v) { return nC(v.Q) / (cm(v.a) * cm(v.a)) / eps0; },
        mistakes: {
          half: function (v) { return nC(v.Q) / (cm(v.a) * cm(v.a)) / (2 * eps0); },
          noMeters: function (v) { return nC(v.Q) / (v.a * v.a) / eps0; }
        },
        feedback: [
          { when: 'half', say: 'Ese es el campo de <strong>una</strong> hoja sola. Entre las placas se suman las dos (o, con Gauss junto al conductor, $E = \\sigma/\\varepsilon_0$).' },
          { when: 'noMeters', say: 'El área va en m²: $' + '(\\text{lado en cm}/100)^2$.' }
        ],
        oracle: { lab: 'call', mod: 'gaussSurface', fn: 'plateE', args: function (v) { return [nC(v.Q) / (cm(v.a) * cm(v.a))]; } },
        hint: 'Primero $\\sigma = Q/A$ con $A$ en m². Entre las placas, $E = \\sigma/\\varepsilon_0$.',
        solution: function (v) {
          var s = nC(v.Q) / (cm(v.a) * cm(v.a));
          return '$$\\begin{aligned} \\sigma &= \\frac{' + v.Q + ' \\times 10^{-9}}{(' + fx(cm(v.a)) + ')^2} \\\\ &= ' + sci(s) + '\\ \\text{C/m}^2 \\end{aligned}$$ $$\\begin{aligned} E &= \\frac{\\sigma}{\\varepsilon_0} = \\frac{' + sci(s) + '}{8.85 \\times 10^{-12}} \\\\ &= ' + sci(s / eps0) + '\\ \\text{N/C} \\end{aligned}$$';
        }
      },
      {
        id: 'f2-s08-cascaron', title: 'Concepto: dentro de un cascarón',
        vars: { c: [0, 1, 1], Q: [2, 20, 1], R: [5, 15, 1], f: [2, 4, 1] },
        prompt: function (v) {
          var obj = v.c === 0 ? 'un cascarón esférico delgado de plástico' : 'una esfera hueca de metal';
          return '<p>Tienes ' + obj + ' de $' + v.R + '\\ \\text{cm}$ de radio con $' + v.Q + '\\ \\text{nC}$ repartidos en su superficie. ¿Cuánto vale el campo eléctrico en un punto a $' + fx(v.R / v.f, 1) + '\\ \\text{cm}$ del centro?</p>';
        },
        check: 'choice',
        options: function () {
          return [
            { text: '$E = 0$', correct: true },
            { text: '$E = \\frac{kQ}{r^2}$, con $r$ la distancia al centro', say: 'Esa es la de afuera. Una esfera gaussiana de radio $r < R$ no encierra carga: $' + QE + ' = 0$.' },
            { text: '$E = \\frac{kQ}{R^2}$, el mismo que en la superficie', say: 'Al cruzar la superficie cargada el campo salta: justo afuera vale $kQ/R^2$, pero adentro es cero.' },
            { text: '$E = \\frac{kQr}{R^3}$, como en la esfera sólida', say: 'Esa es para carga repartida en el volumen. Aquí toda la carga está en la superficie, afuera de tu esfera gaussiana.' }
          ];
        },
        answer: function () { return '$E = 0$'; },
        hint: 'Dibuja una esfera gaussiana que pase por el punto. ¿Cuánta carga encierra?',
        solution: function (v) { return 'La esfera gaussiana de radio $' + fx(v.R / v.f, 1) + '\\ \\text{cm}$ queda dentro: $' + QE + ' = 0$, así que $E\\cdot 4\\pi r^2 = 0$ y $E = 0$. ' + (v.c === 1 ? 'En el metal pasa lo mismo: la carga de un conductor se va a su superficie de afuera.' : 'Las cargas del cascarón empujan desde todos lados y se cancelan.'); }
      }
    ],

    quiz: { tags: ['f2.S08'], count: 8 },

    errors: [
      'Usar la carga total $Q$ cuando el punto está dentro de una distribución sólida: solo cuenta $' + QE + '$, la carga dentro de la superficie gaussiana.',
      'Usar el área de la esfera ($4\\pi r^2$) alrededor de una línea, o contar las tapas del cilindro: el área con flujo es $2\\pi r L$.',
      'Confundir $\\sigma/2\\varepsilon_0$ (hoja de carga sola) con $\\sigma/\\varepsilon_0$ (junto a un conductor o entre placas).',
      'Olvidar que dentro de un conductor en equilibrio o de un cascarón cargado $E = 0$.',
      'Pensar que como el flujo no depende de las cargas de afuera, tampoco $E$: las de afuera sí cambian $E$, solo no el flujo total.',
      'Usar Gauss para despejar $E$ sin simetría (un disco, una varilla finita, un cubo con carga puntual).',
      'Olvidar pasar cm a m y nC a C antes de sustituir.'
    ],

    teacher: {
      plan: [
        'Abre con el aspersor en la casa de campaña y la figura de la ley: que digan qué cargas cuentan y por qué las de afuera dan flujo neto cero.',
        'Haz en el pizarrón la carga puntual y la esfera sólida con los 6 pasos; que ellos hagan el cascarón y la línea con la misma plantilla.',
        'El plano y la placa conductora juntos: de dónde sale el factor 2. Anticipa el capacitor de placas (S09).',
        'Cierra con el lab: el cubo con la carga descentrada (flujo igual, $E$ no constante) y el error de la carga total ya viene cargado.'
      ],
      check: [
        'Que dibujen la superficie gaussiana antes de escribir cualquier fórmula.',
        'Que distingan $Q$ de $' + QE + '$ en cada problema.',
        'Que comprueben cada resultado contra S04 o contra la carga puntual lejos.'
      ],
      note: 'Si el grupo no vio S07 (flujo), dedica 15 minutos a $\\Phi = EA\\cos\\theta$ con la superficie rotable antes de empezar. Las integrales de superficie no hacen falta: con simetría, $\\oint E\\,dA = E\\,A$.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §6.2 “Explaining Gauss’s Law”. <a href="https://openstax.org/books/university-physics-volume-2/pages/6-2-explaining-gausss-law">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §6.3 “Applying Gauss’s Law”. <a href="https://openstax.org/books/university-physics-volume-2/pages/6-3-applying-gausss-law">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §6.4 “Conductors in Electrostatic Equilibrium”. <a href="https://openstax.org/books/university-physics-volume-2/pages/6-4-conductors-in-electrostatic-equilibrium">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-07',
    next: 'sesion-09'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
