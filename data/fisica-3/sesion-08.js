/* =====================================================================
   Física 3 · S08 · Ley de Ampère (bloque B · Fuentes de campo).
   Fuentes: OpenStax, University Physics Volume 2, §12.5 (CC BY-NC-SA 4.0).
   μ₀ = 4π × 10⁻⁷ T·m/A. Radios en cm (o mm), campos en µT, circulación en µT·m
   (μ₀ · 1 A = 1.257 µT·m). Las cuentas se comparan contra LabMath.ampere (lab ampere-loop).
   ===================================================================== */
(function () {
  var MU0 = 4 * Math.PI * 1e-7, M = MU0 * 1e6;           // M: μ₀ en µT·m/A
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        var big = Math.max(Math.abs(vals[i]), Math.abs(vals[j]));
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * (big >= 0.05 ? Math.max(big, 0.5) : big)) return false;
      }
      return true;
    };
  }
  // Campos en µT con radios en cm.
  function out(I, r) { return 2e-7 * I / (r / 100) * 1e6; }
  function inside(I, R, r) { return 2e-7 * I * (r / 100) / Math.pow(R / 100, 2) * 1e6; }

  // Ejemplo 1: la figura de la corriente encerrada (5 A ⊙ y 2 A ⊗ adentro, 4 A afuera)
  var e1 = { Ienc: 5 - 2 }; e1.C = M * e1.Ienc;
  // Ejemplo 2: alambre grueso, I = 10 A, R = 0.50 cm; r = 0.25 cm y r = 1.0 cm
  var e2 = { I: 10, R: 0.5, ri: 0.25, ro: 1 }; e2.Bi = inside(e2.I, e2.R, e2.ri); e2.Bs = out(e2.I, e2.R); e2.Bo = out(e2.I, e2.ro); e2.enc = e2.I * Math.pow(e2.ri / e2.R, 2);
  // Ejemplo 3: coaxial, I = 4.0 A, a = 1.0 mm, b = 4.0 mm, c = 5.0 mm; r = 2.0 mm
  var e3 = { I: 4, a: 0.1, b: 0.4, c: 0.5, r: 0.2 }; e3.B = out(e3.I, e3.r);
  // Ejemplo 4: tubo con I = 6.0 A entre a = 1.0 cm y b = 2.0 cm; r = 1.5 cm
  var e4 = { I: 6, a: 1, b: 2, r: 1.5 }; e4.frac = (e4.r * e4.r - e4.a * e4.a) / (e4.b * e4.b - e4.a * e4.a); e4.enc = e4.I * e4.frac; e4.B = out(e4.enc, e4.r);

  var SIGN = [
    { cur: 'sale de la página (⊙)', dir: 'antihorario', right: 'Positivo', why: 'Antihorario: la normal sale de la página, igual que la corriente.' },
    { cur: 'entra a la página (⊗)', dir: 'antihorario', right: 'Negativo', why: 'Antihorario: la normal sale; la corriente entra, en contra.' },
    { cur: 'sale de la página (⊙)', dir: 'horario', right: 'Negativo', why: 'Horario: la normal entra; la corriente sale, en contra.' },
    { cur: 'entra a la página (⊗)', dir: 'horario', right: 'Positivo', why: 'Horario: la normal entra, igual que la corriente.' }
  ];

  var data = window.SESSION_DATA = {
    slug: 'sesion-08', number: '08', group: 'B · Fuentes de campo',
    title: 'Ley de Ampère', temario: [],
    minutes: 180,
    quote: 'Al recorrer cualquier trayectoria cerrada, la suma de $\\vec B\\cdot d\\vec l$ solo depende de la corriente que la atraviesa: $\\oint\\vec B\\cdot d\\vec l = \\mu_0 I_{\\text{enc}}$. Con simetría, eso basta para sacar $B$ sin integrar Biot–Savart.',
    badges: [
      'Calcular la circulación de B alrededor de una trayectoria cerrada y la corriente encerrada con su signo.',
      'Explicar por qué las corrientes de afuera no cuentan en la ley de Ampère.',
      'Usar la ley de Ampère con simetría cilíndrica: alambre delgado, alambre grueso, tubo y cable coaxial.',
      'Reconocer cuándo la ley de Ampère es cierta pero no sirve para despejar B.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'En Física 2, la ley de Gauss cambió una integral difícil (Coulomb trozo a trozo) por una superficie bien elegida. La <strong>ley de Ampère</strong> hace lo mismo con el campo magnético, pero con una <strong>trayectoria cerrada</strong> en lugar de una superficie.',
        recall: [
          'La ley de Gauss y la elección de superficies con simetría (<a href="../../../fisica-2/sesiones/sesion-08/">Física 2 · S08</a>).',
          'El campo de un alambre largo, $B = \\mu_0 I/2\\pi r$, tangente a circunferencias (<a href="../sesion-06/">sesión 6</a>).',
          'El producto punto: $\\vec B\\cdot d\\vec l = B\\,dl\\cos\\theta$.'
        ],
        why: 'Con Ampère sacas en dos renglones el campo dentro de un cable, en un coaxial (el de la tele por cable), en un solenoide y en un toroide (sesión 9). Y es una de las ecuaciones de Maxwell.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Camina alrededor de un alambre con corriente, en un círculo, cargando una brújula. En cada paso, multiplica lo que avanzas por la parte del campo que va en tu dirección, y ve sumando. Al cerrar la vuelta, el total no depende del radio de tu círculo ni de su forma: <strong>solo de cuánta corriente pasó por adentro</strong>.',
          'Si das la vuelta lejos del alambre, el campo es más débil, pero el camino es más largo: se compensa exacto. Si el alambre queda afuera de tu camino, lo que sumas de ida lo restas de regreso y te da cero.'
        ]
      },
      {
        type: 'concept', heading: 'La circulación de B', short: 'Circulación',
        body: [
          'La <strong>circulación</strong> de $\\vec B$ alrededor de una trayectoria cerrada es $$\\oint \\vec B\\cdot d\\vec l$$ Partes la trayectoria en pasitos $d\\vec l$ (en el sentido del recorrido), multiplicas cada uno por la componente de $\\vec B$ a lo largo de él y sumas todo.',
          'Para un alambre largo y un círculo centrado en él, $\\vec B$ es tangente y tiene la misma magnitud en todo el círculo. Entonces $\\vec B\\cdot d\\vec l = B\\,dl$ y $$\\oint\\vec B\\cdot d\\vec l = B\\cdot 2\\pi r = \\frac{\\mu_0 I}{2\\pi r}\\cdot 2\\pi r = \\mu_0 I$$ El radio se cancela: la circulación es la misma para cualquier círculo.'
        ],
        diagram: 'f3s08-circ',
        caption: 'Alrededor de un alambre, B·2πr = μ₀I para cualquier radio.'
      },
      {
        type: 'concept', heading: 'La ley de Ampère', short: 'Ley de Ampère',
        body: [
          'Para <strong>cualquier</strong> trayectoria cerrada y cualquier arreglo de corrientes estacionarias: $$\\oint\\vec B\\cdot d\\vec l = \\mu_0\\,I_{\\text{enc}}$$ donde $I_{\\text{enc}}$ es la corriente neta que atraviesa una superficie que tiene a la trayectoria como borde.',
          '<strong>Signo.</strong> Dobla los dedos de la mano derecha en el sentido del recorrido: el pulgar marca qué corrientes cuentan como positivas. Con recorrido antihorario en la página, ⊙ cuenta $+$ y ⊗ cuenta $-$.',
          '<strong>Las de afuera no cuentan.</strong> Una corriente fuera de la trayectoria sí cambia $\\vec B$ en cada punto, pero su aporte a la circulación suma cero.'
        ],
        diagram: 'f3s08-sign',
        caption: 'Solo cuentan las corrientes que atraviesan la trayectoria, con su signo.'
      },
      {
        type: 'explainer', heading: '¿Por qué no cuentan las corrientes de afuera?', short: 'Corrientes de afuera',
        title: 'La circulación del campo de un alambre, adentro y afuera',
        intro: 'Escribe $\\vec B\\cdot d\\vec l$ con el ángulo con que el alambre «ve» cada pasito.',
        diagram: 'f3s08-angle',
        steps: [
          { text: 'El campo del alambre es tangente a círculos, así que solo cuenta la parte de $d\\vec l$ en esa dirección: $r\\,d\\theta$. Entonces $\\vec B\\cdot d\\vec l = \\frac{\\mu_0 I}{2\\pi r}\\,r\\,d\\theta = \\frac{\\mu_0 I}{2\\pi}\\,d\\theta$, sin importar la forma del camino. Si el alambre está adentro, $\\theta$ da una vuelta completa: $\\oint = \\frac{\\mu_0 I}{2\\pi}\\cdot 2\\pi = \\mu_0 I$.', state: { k: 1 } },
          { text: 'Si el alambre está afuera, dos rayos que salen de él cortan la trayectoria dos veces: en un tramo cercano y en uno lejano. Los dos tramos ven el mismo $d\\theta$, pero se recorren en sentidos opuestos.', state: { k: 2 } },
          { text: 'Sus aportes $\\frac{\\mu_0 I}{2\\pi}d\\theta$ se cancelan por pares, y al cerrar la vuelta $\\theta$ regresa a su valor inicial sin haber dado la vuelta: $\\oint\\vec B\\cdot d\\vec l = 0$.', state: { k: 3 } }
        ]
      },
      {
        type: 'callout', heading: 'Ampère y Gauss: siempre ciertas, a veces útiles',
        body: [
          'La ley de Ampère vale para cualquier trayectoria, igual que la de Gauss para cualquier superficie. Pero solo sirve para <strong>despejar $B$</strong> si eliges una trayectoria donde $B$ es constante y paralelo (o perpendicular) a $d\\vec l$ en cada tramo. Eso pasa con simetría: alambres largos y cilindros (esta sesión), solenoides y toroides (<a href="../sesion-09/">sesión 9</a>).',
          'Para una espira o un tramo corto, Ampère sigue siendo cierta, pero no hay trayectoria donde $B$ salga de la integral: ahí se usa Biot–Savart.'
        ]
      },
      {
        type: 'explainer', heading: 'Alambre grueso: B adentro y afuera', short: 'Alambre grueso',
        title: 'Un alambre de radio R con corriente I repartida de manera uniforme',
        intro: 'Por simetría, $\\vec B$ es tangente a círculos centrados en el eje y su magnitud solo depende de $r$. Usa como trayectoria un círculo de radio $r$.',
        diagram: 'f3s08-thick',
        steps: [
          { text: '<strong>Afuera</strong> ($r \\ge R$): el círculo encierra toda la corriente. $B\\cdot 2\\pi r = \\mu_0 I$ y $B = \\frac{\\mu_0 I}{2\\pi r}$, igual que un alambre delgado.', state: { k: 1 } },
          { text: '<strong>Adentro</strong> ($r < R$): la corriente está repartida en el área $\\pi R^2$. El círculo encierra la fracción de área $\\pi r^2/\\pi R^2$: $I_{\\text{enc}} = I\\,r^2/R^2$.', state: { k: 2 } },
          { text: 'Ampère: $B\\cdot 2\\pi r = \\mu_0 I\\,\\frac{r^2}{R^2}$, así que $$B = \\frac{\\mu_0 I\\,r}{2\\pi R^2}$$ Crece en línea recta desde cero en el eje.', state: { k: 3 } },
          { text: 'La gráfica: sube proporcional a $r$ hasta la superficie, donde vale $\\frac{\\mu_0 I}{2\\pi R}$ (las dos fórmulas coinciden), y luego baja como $1/r$. El campo es máximo en la superficie.', state: { k: 4 } }
        ]
      },
      {
        type: 'concept', heading: 'Cable coaxial y tubo', short: 'Coaxial y tubo',
        body: [
          'Un <strong>cable coaxial</strong> tiene un núcleo que lleva $I$ en un sentido y un forro cilíndrico que la regresa. Con círculos de radio $r$:<ul><li>dentro del núcleo, como el alambre grueso;</li><li>entre núcleo y forro, $I_{\\text{enc}} = I$ y $B = \\mu_0 I/2\\pi r$;</li><li>afuera del forro, $I_{\\text{enc}} = I - I = 0$ y $\\boxed{B = 0}$.</li></ul>Por eso el coaxial no produce campo afuera ni lo recibe: su señal queda blindada.',
          'Un <strong>tubo</strong> de radios $a$ y $b$ con corriente en su pared: en el hueco ($r < a$) no encierra corriente y $B = 0$; en la pared, $I_{\\text{enc}} = I\\,\\frac{r^2 - a^2}{b^2 - a^2}$; afuera, como un alambre.'
        ],
        diagram: 'f3s08-coax',
        caption: 'Tres trayectorias en un coaxial: en el núcleo, entre núcleo y forro, y afuera.'
      },
      {
        type: 'recipe', heading: 'Receta: la ley de Ampère con simetría', short: 'Receta',
        steps: [
          { text: 'Mira la simetría: ¿hacia dónde apunta $\\vec B$ y de qué depende su magnitud? Para cilindros, $\\vec B$ es tangente a círculos y solo depende de $r$.' },
          { text: 'Elige la trayectoria amperiana: un círculo de radio $r$ por el punto donde quieres $B$, recorrido en el sentido de $\\vec B$.', tip: 'Así $\\vec B\\cdot d\\vec l = B\\,dl$ y $B$ sale de la integral.' },
          { text: 'Lado izquierdo: $\\oint\\vec B\\cdot d\\vec l = B\\cdot 2\\pi r$.' },
          { text: 'Lado derecho: $\\mu_0 I_{\\text{enc}}$, con la corriente que atraviesa el círculo, con signo. Si la corriente está repartida, usa la fracción de área encerrada.', tip: 'Con densidad uniforme, $I_{\\text{enc}}$ va con el área: $r^2$, no $r$.' },
          { text: 'Despeja $B$ y revisa que coincida en las fronteras (por ejemplo, en $r = R$).' }
        ]
      },
      {
        type: 'example', heading: 'Circulación con tres alambres',
        problem: '<p>En la figura de la corriente encerrada, la trayectoria se recorre en sentido antihorario y encierra un alambre con $5\\ \\text{A}$ saliendo y otro con $2\\ \\text{A}$ entrando; afuera hay otro con $4\\ \\text{A}$. ¿Cuánto vale $\\oint\\vec B\\cdot d\\vec l$?</p>',
        steps: [
          { text: 'Antihorario: ⊙ cuenta $+$ y ⊗ cuenta $-$. El de afuera no cuenta.', math: 'I_{\\text{enc}} = 5 - 2 = 3\\ \\text{A}' },
          { text: 'Ley de Ampère.', math: '\\oint\\vec B\\cdot d\\vec l = \\mu_0 I_{\\text{enc}} = (4\\pi\\times 10^{-7})(3) = ' + fx(e1.C, 2) + '\\times 10^{-6}\\ \\text{T·m}' }
        ],
        answer: '$\\oint\\vec B\\cdot d\\vec l = ' + fx(e1.C, 2) + '\\ \\mu\\text{T·m}$.',
        verify: { lab: 'call', mod: 'ampere', fn: 'ampere', args: [e1.Ienc], value: e1.C }
      },
      {
        type: 'example', heading: 'Dentro y fuera de un alambre grueso',
        problem: '<p>Un alambre de radio $R = ' + fx(e2.R, 2) + '\\ \\text{cm}$ lleva $' + e2.I + '\\ \\text{A}$ repartidos de manera uniforme. ¿Cuánto vale $B$ a $r = ' + fx(e2.ri, 2) + '\\ \\text{cm}$ del eje, en la superficie y a $r = ' + fx(e2.ro, 1) + '\\ \\text{cm}$?</p>',
        steps: [
          { text: 'Adentro, la trayectoria encierra la fracción $r^2/R^2$ de la corriente.', math: 'I_{\\text{enc}} = ' + e2.I + '\\left(\\frac{' + fx(e2.ri, 2) + '}{' + fx(e2.R, 2) + '}\\right)^2 = ' + fx(e2.enc, 2) + '\\ \\text{A}' },
          { text: 'Ampère con el círculo de radio $r$.', math: 'B = \\frac{\\mu_0 I_{\\text{enc}}}{2\\pi r} = \\frac{2\\times 10^{-7}(' + fx(e2.enc, 2) + ')}{' + fx(e2.ri / 100, 4) + '} = ' + fx(e2.Bi, 0) + '\\ \\mu\\text{T}' },
          { text: 'En la superficie y afuera, toda la corriente.', math: 'B(R) = \\frac{2\\times 10^{-7}(' + e2.I + ')}{' + fx(e2.R / 100, 3) + '} = ' + fx(e2.Bs, 0) + '\\ \\mu\\text{T} \\qquad B(' + fx(e2.ro, 1) + '\\ \\text{cm}) = ' + fx(e2.Bo, 0) + '\\ \\mu\\text{T}' },
          { text: 'Fíjate: en $r = R/2$ y en $r = 2R$ el campo es el mismo, la mitad del de la superficie.' }
        ],
        answer: '$' + fx(e2.Bi, 0) + '\\ \\mu\\text{T}$ adentro, $' + fx(e2.Bs, 0) + '\\ \\mu\\text{T}$ en la superficie y $' + fx(e2.Bo, 0) + '\\ \\mu\\text{T}$ afuera.',
        verify: { lab: 'call', mod: 'ampere', fn: 'thickUT', args: [e2.I, e2.R, e2.ri], value: e2.Bi }
      },
      {
        type: 'example', heading: 'Un cable coaxial',
        problem: '<p>Un coaxial tiene un núcleo de radio $1.0\\ \\text{mm}$ y un forro entre $4.0$ y $5.0\\ \\text{mm}$. Lleva $' + e3.I + '\\ \\text{A}$ de ida por el núcleo y de vuelta por el forro. ¿Cuánto vale $B$ a $2.0\\ \\text{mm}$ del eje? ¿Y a $6.0\\ \\text{mm}$?</p>',
        steps: [
          { text: 'A $2.0\\ \\text{mm}$ estás entre el núcleo y el forro: el círculo encierra toda la corriente del núcleo.', math: 'B = \\frac{\\mu_0 I}{2\\pi r} = \\frac{2\\times 10^{-7}(' + e3.I + ')}{0.0020} = ' + fx(e3.B, 0) + '\\ \\mu\\text{T}' },
          { text: 'A $6.0\\ \\text{mm}$ estás afuera: encierra $+I$ del núcleo y $-I$ del forro.', math: 'I_{\\text{enc}} = 0 \\Rightarrow B = 0' }
        ],
        answer: '$B = ' + fx(e3.B, 0) + '\\ \\mu\\text{T}$ a 2.0 mm y $B = 0$ a 6.0 mm.',
        verify: { lab: 'call', mod: 'ampere', fn: 'coaxUT', args: [e3.I, e3.a, e3.b, e3.c, e3.r], value: e3.B }
      },
      {
        type: 'example', heading: 'Dentro de la pared de un tubo',
        problem: '<p>Un tubo de cobre tiene radio interior $' + e4.a + '\\ \\text{cm}$ y exterior $' + e4.b + '\\ \\text{cm}$, y lleva $' + e4.I + '\\ \\text{A}$ repartidos de manera uniforme en su pared. ¿Cuánto vale $B$ a $' + e4.r + '\\ \\text{cm}$ del eje?</p>',
        steps: [
          { text: 'Fracción del área de la pared que queda dentro del círculo de radio $r$.', math: '\\frac{r^2 - a^2}{b^2 - a^2} = \\frac{' + e4.r + '^2 - ' + e4.a + '^2}{' + e4.b + '^2 - ' + e4.a + '^2} = ' + fx(e4.frac, 4) + ' \\Rightarrow I_{\\text{enc}} = ' + fx(e4.enc, 2) + '\\ \\text{A}' },
          { text: 'Ampère.', math: 'B = \\frac{\\mu_0 I_{\\text{enc}}}{2\\pi r} = \\frac{2\\times 10^{-7}(' + fx(e4.enc, 2) + ')}{' + fx(e4.r / 100, 3) + '} = ' + fx(e4.B, 1) + '\\ \\mu\\text{T}' },
          { text: 'En el hueco ($r < ' + e4.a + '\\ \\text{cm}$), $B = 0$: no hay corriente encerrada.' }
        ],
        answer: '$B = ' + fx(e4.B, 1) + '\\ \\mu\\text{T}$.',
        verify: { lab: 'call', mod: 'ampere', fn: 'pipeUT', args: [e4.I, e4.a, e4.b, e4.r], value: e4.B }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: 'Si $\\oint\\vec B\\cdot d\\vec l = 0$, ¿quiere decir que $B = 0$ en la trayectoria?', a: 'No. Una corriente de afuera produce $B$ en cada punto de la trayectoria, pero la circulación suma cero. Ampère da la integral, no el campo punto por punto, salvo con simetría.' },
          { q: '¿Para qué sirve la superficie que tiene a la trayectoria como borde?', a: 'Para contar la corriente que «atraviesa» la trayectoria. Con corrientes estacionarias, cualquier superficie con ese borde da la misma $I_{\\text{enc}}$.' },
          { q: '¿Puedo usar Ampère para el campo de una espira?', a: 'Es cierta, pero no sirve: no hay trayectoria donde $B$ sea constante y tangente. Para la espira se usa Biot–Savart (sesión 6).' },
          { q: '¿Por qué adentro del alambre crece con r y no baja?', a: 'Porque al crecer $r$ encierras más corriente ($\\propto r^2$) y eso le gana al $1/r$ del perímetro: $B \\propto r^2/r = r$.' },
          { q: '¿Y si la corriente cambia con el tiempo?', a: 'Entonces hace falta un término extra (la corriente de desplazamiento de Maxwell), que no vemos en este curso. Aquí todas las corrientes son estacionarias.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Ley de Ampère: $\\oint\\vec B\\cdot d\\vec l = \\mu_0 I_{\\text{enc}}$, para cualquier trayectoria cerrada.',
          'Signo con la mano derecha: dedos con el recorrido, el pulgar da qué corriente es positiva. Las corrientes de afuera no cuentan.',
          'Con simetría cilíndrica: $B\\cdot 2\\pi r = \\mu_0 I_{\\text{enc}}$.',
          'Alambre grueso: $B = \\mu_0 I r/2\\pi R^2$ adentro y $\\mu_0 I/2\\pi r$ afuera; máximo en la superficie.',
          'Coaxial: $B = 0$ afuera del forro. Tubo: $B = 0$ en el hueco.'
        ]
      }
    ],

    lab: {
      type: 'ampere-loop', title: 'La ley de Ampère',
      intro: 'Mueve los alambres y la trayectoria (círculo o rectángulo) y cambia el sentido del recorrido. El lab suma B·dl alrededor de la trayectoria con el campo de todos los alambres y lo compara con μ₀ I_enc: aunque muevas los de afuera, la circulación no cambia. En el modo de alambre grueso, ves B(r) adentro y afuera. En el reto, el lab te dice si contaste alambres de afuera, si ignoraste signos o si olvidaste μ₀.',
      cfg: {}
    },

    formulas: [
      { label: 'Ley de Ampère', tex: '\\oint\\vec B\\cdot d\\vec l = \\mu_0 I_{\\text{enc}}' },
      { label: 'Con simetría cilíndrica', tex: 'B\\cdot 2\\pi r = \\mu_0 I_{\\text{enc}}' },
      { label: 'Alambre grueso', tex: 'B = \\frac{\\mu_0 I\\,r}{2\\pi R^2}\\ (r < R),\\qquad B = \\frac{\\mu_0 I}{2\\pi r}\\ (r \\ge R)' },
      { label: 'Densidad uniforme', tex: 'I_{\\text{enc}} = I\\,\\frac{\\text{área encerrada}}{\\text{área total}}' },
      { label: 'Coaxial, afuera', tex: 'I_{\\text{enc}} = I - I = 0 \\Rightarrow B = 0' }
    ],

    exercises: [
      {
        id: 'f3-s08-circulacion', title: 'Circulación con varios alambres',
        vars: { I1: [1, 9, 1], I2: [1, 9, 1], I3: [1, 9, 1] },
        prompt: function (v) { return '<p>Una trayectoria circular de $5\\ \\text{cm}$ de radio, recorrida en sentido antihorario, encierra un alambre con $' + v.I1 + '\\ \\text{A}$ saliendo de la página y otro con $' + v.I2 + '\\ \\text{A}$ entrando. Afuera, a $9\\ \\text{cm}$ del centro, hay un tercero con $' + v.I3 + '\\ \\text{A}$ saliendo. ¿Cuánto vale $\\oint\\vec B\\cdot d\\vec l$? En $\\mu\\text{T·m}$, con signo.</p>'; },
        check: 'numeric', unit: 'µT·m',
        answer: function (v) { return M * (v.I1 - v.I2); },
        mistakes: {
          all: function (v) { return M * (v.I1 - v.I2 + v.I3); },
          abs: function (v) { return M * (v.I1 + v.I2); },
          noMu: function (v) { return v.I1 - v.I2; }
        },
        feedback: [
          { when: 'all', say: 'El alambre de afuera no cuenta en la circulación.' },
          { when: 'abs', say: 'Con recorrido antihorario, el que entra cuenta negativo.' },
          { when: 'noMu', say: 'Ese es $I_{\\text{enc}}$; falta multiplicar por $\\mu_0 = 1.257\\ \\mu\\text{T·m/A}$.' }
        ],
        where: function (v) { return v.I1 !== v.I2; },
        oracle: { lab: 'call', mod: 'ampere', fn: 'circulation', args: function (v) { return [[{ x: -2, y: 1, I: v.I1 }, { x: 2, y: -1, I: -v.I2 }, { x: 9, y: 0, I: v.I3 }], { kind: 'circle', cx: 0, cy: 0, r: 5, dir: 1 }]; } },
        hint: '$I_{\\text{enc}}$ con signo (⊙ positivo con recorrido antihorario) por $\\mu_0$.',
        solution: function (v) { return '$$I_{\\text{enc}} = ' + v.I1 + ' - ' + v.I2 + ' = ' + (v.I1 - v.I2) + '\\ \\text{A},\\qquad \\oint\\vec B\\cdot d\\vec l = (1.257\\ \\mu\\text{T·m/A})(' + (v.I1 - v.I2) + '\\ \\text{A}) = ' + fx(M * (v.I1 - v.I2), 3) + '\\ \\mu\\text{T·m}$$'; }
      },
      {
        id: 'f3-s08-ienc', title: 'De la circulación a la corriente',
        vars: { C: [1, 30, 1] },
        prompt: function (v) { return '<p>Mides la circulación de $\\vec B$ alrededor de una trayectoria cerrada y obtienes $' + v.C + '\\ \\mu\\text{T·m}$. ¿Cuánta corriente neta la atraviesa? En A.</p>'; },
        check: 'numeric', unit: 'A',
        answer: function (v) { return v.C / M; },
        mistakes: { times: function (v) { return v.C * M; } },
        feedback: [{ when: 'times', say: 'Multiplicaste por $\\mu_0$; hay que dividir: $I_{\\text{enc}} = \\oint\\vec B\\cdot d\\vec l/\\mu_0$.' }],
        oracle: { lab: 'value', value: function (v) { return v.C * 1e-6 / (4e-7 * Math.PI); } },
        hint: 'Despeja de $\\oint\\vec B\\cdot d\\vec l = \\mu_0 I_{\\text{enc}}$.',
        solution: function (v) { return '$$I_{\\text{enc}} = \\frac{' + v.C + '\\times 10^{-6}\\ \\text{T·m}}{4\\pi\\times 10^{-7}\\ \\text{T·m/A}} = ' + fx(v.C / M, 3) + '\\ \\text{A}$$'; }
      },
      {
        id: 'f3-s08-grueso-dentro', title: 'Dentro de un alambre grueso',
        vars: { I: [2, 20, 2], R: [0.5, 3, 0.5], k: [1, 4, 1] },
        prompt: function (v) { return '<p>Un alambre de radio $' + fx(v.R, 1) + '\\ \\text{cm}$ lleva $' + v.I + '\\ \\text{A}$ repartidos de manera uniforme. ¿Cuánto vale $B$ a $' + fx(v.R * v.k / 5, 2) + '\\ \\text{cm}$ del eje? En $\\mu\\text{T}$.</p>'; },
        check: 'numeric', unit: 'µT',
        answer: function (v) { return inside(v.I, v.R, v.R * v.k / 5); },
        mistakes: {
          outside: function (v) { return out(v.I, v.R * v.k / 5); },
          linear: function (v) { return out(v.I * v.k / 5, v.R * v.k / 5); }
        },
        feedback: [
          { when: 'outside', say: 'Usaste la fórmula de afuera. Adentro solo se encierra la fracción $r^2/R^2$ de la corriente.' },
          { when: 'linear', say: 'La corriente encerrada va con el área: $I\\,r^2/R^2$, no $I\\,r/R$.' }
        ],
        oracle: { lab: 'call', mod: 'ampere', fn: 'thickUT', args: function (v) { return [v.I, v.R, v.R * v.k / 5]; } },
        hint: 'Adentro: $B = \\mu_0 I r/2\\pi R^2$.',
        solution: function (v) { var r = v.R * v.k / 5; return '$$B = \\frac{\\mu_0 I r}{2\\pi R^2} = \\frac{2\\times 10^{-7}(' + v.I + ')(' + fx(r / 100, 4) + ')}{(' + fx(v.R / 100, 3) + ')^2} = ' + fx(inside(v.I, v.R, r), 1) + '\\ \\mu\\text{T}$$'; }
      },
      {
        id: 'f3-s08-grueso-max', title: 'Campo máximo de un alambre grueso',
        vars: { I: [2, 30, 2], R: [0.2, 2, 0.2] },
        prompt: function (v) { return '<p>¿Cuánto vale el campo <strong>máximo</strong> de un alambre de radio $' + fx(v.R, 1) + '\\ \\text{cm}$ que lleva $' + v.I + '\\ \\text{A}$ repartidos de manera uniforme? En $\\mu\\text{T}$.</p>'; },
        check: 'numeric', unit: 'µT',
        answer: function (v) { return out(v.I, v.R); },
        mistakes: { half: function (v) { return out(v.I, v.R) / 2; } },
        feedback: [{ when: 'half', say: 'El máximo está en la superficie, $r = R$: $\\mu_0 I/2\\pi R$.' }],
        oracle: { lab: 'call', mod: 'ampere', fn: 'thickUT', args: function (v) { return [v.I, v.R, v.R]; } },
        hint: 'Adentro crece con $r$ y afuera baja: el máximo está en $r = R$.',
        solution: function (v) { return '$$B_{\\text{máx}} = \\frac{\\mu_0 I}{2\\pi R} = \\frac{2\\times 10^{-7}(' + v.I + ')}{' + fx(v.R / 100, 3) + '} = ' + fx(out(v.I, v.R), 1) + '\\ \\mu\\text{T}$$'; }
      },
      {
        id: 'f3-s08-coax', title: 'Entre el núcleo y el forro de un coaxial',
        vars: { I: [1, 10, 1], r: [2, 3.5, 0.5] },
        prompt: function (v) { return '<p>Un coaxial tiene núcleo de $1.0\\ \\text{mm}$ de radio y forro entre $4.0$ y $5.0\\ \\text{mm}$; lleva $' + v.I + '\\ \\text{A}$ de ida y vuelta. ¿Cuánto vale $B$ a $' + fx(v.r, 1) + '\\ \\text{mm}$ del eje? En $\\mu\\text{T}$.</p>'; },
        check: 'numeric', unit: 'µT',
        answer: function (v) { return out(v.I, v.r / 10); },
        mistakes: { mmcm: function (v) { return out(v.I, v.r); }, core: function (v) { return inside(v.I, 0.1, v.r / 10); } },
        feedback: [
          { when: 'mmcm', say: 'Tomaste los milímetros como centímetros: 1 mm = $10^{-3}$ m.' },
          { when: 'core', say: 'Ya estás fuera del núcleo: encierras toda su corriente, no la fracción $r^2/a^2$.' }
        ],
        oracle: { lab: 'call', mod: 'ampere', fn: 'coaxUT', args: function (v) { return [v.I, 0.1, 0.4, 0.5, v.r / 10]; } },
        hint: 'Entre núcleo y forro, $I_{\\text{enc}} = I$.',
        solution: function (v) { return '$$B = \\frac{\\mu_0 I}{2\\pi r} = \\frac{2\\times 10^{-7}(' + v.I + ')}{' + fx(v.r / 1000, 4) + '} = ' + fx(out(v.I, v.r / 10), 0) + '\\ \\mu\\text{T}$$'; }
      },
      {
        id: 'f3-s08-tubo', title: 'En la pared de un tubo',
        vars: { I: [2, 20, 2], a: [1, 3, 1], t: [1, 3, 1], f: [1, 3, 1] },
        prompt: function (v) { var b = v.a + v.t, r = v.a + v.t * v.f / 4; return '<p>Un tubo de radio interior $' + v.a + '\\ \\text{cm}$ y exterior $' + b + '\\ \\text{cm}$ lleva $' + v.I + '\\ \\text{A}$ repartidos de manera uniforme en su pared. ¿Cuánto vale $B$ a $' + fx(r, 2) + '\\ \\text{cm}$ del eje? En $\\mu\\text{T}$.</p>'; },
        check: 'numeric', unit: 'µT',
        answer: function (v) { var b = v.a + v.t, r = v.a + v.t * v.f / 4; return out(v.I * (r * r - v.a * v.a) / (b * b - v.a * v.a), r); },
        mistakes: {
          all: function (v) { var r = v.a + v.t * v.f / 4; return out(v.I, r); },
          linear: function (v) { var b = v.a + v.t, r = v.a + v.t * v.f / 4; return out(v.I * (r - v.a) / (b - v.a), r); }
        },
        feedback: [
          { when: 'all', say: 'Dentro de la pared no encierras toda la corriente, solo la fracción de área $(r^2 - a^2)/(b^2 - a^2)$.' },
          { when: 'linear', say: 'La fracción encerrada va con el área: $(r^2 - a^2)/(b^2 - a^2)$, no $(r - a)/(b - a)$.' }
        ],
        oracle: { lab: 'call', mod: 'ampere', fn: 'pipeUT', args: function (v) { return [v.I, v.a, v.a + v.t, v.a + v.t * v.f / 4]; } },
        hint: '$I_{\\text{enc}} = I\\,\\frac{r^2 - a^2}{b^2 - a^2}$.',
        solution: function (v) { var b = v.a + v.t, r = v.a + v.t * v.f / 4, e = v.I * (r * r - v.a * v.a) / (b * b - v.a * v.a); return '$$I_{\\text{enc}} = ' + v.I + '\\cdot\\frac{' + fx(r, 2) + '^2 - ' + v.a + '^2}{' + b + '^2 - ' + v.a + '^2} = ' + fx(e, 3) + '\\ \\text{A},\\qquad B = \\frac{2\\times 10^{-7}(' + fx(e, 3) + ')}{' + fx(r / 100, 4) + '} = ' + fx(out(e, r), 1) + '\\ \\mu\\text{T}$$'; }
      },
      {
        id: 'f3-s08-signo', title: 'Concepto: el signo de una corriente encerrada',
        vars: { k: [0, 3, 1] },
        prompt: function (v) { return '<p>Una trayectoria en el plano de la página se recorre en sentido ' + SIGN[v.k].dir + ' y encierra un alambre cuya corriente ' + SIGN[v.k].cur + '. ¿Con qué signo cuenta esa corriente en $I_{\\text{enc}}$?</p>'; },
        check: 'choice',
        options: function (v) {
          var right = SIGN[v.k].right, other = right === 'Positivo' ? 'Negativo' : 'Positivo';
          return [
            { text: right, correct: true },
            { text: other, say: 'Revisa la mano derecha: dedos con el recorrido; si el pulgar apunta como la corriente, cuenta positivo.' },
            { text: 'No cuenta', say: 'Está adentro de la trayectoria: sí cuenta.' }
          ];
        },
        answer: function (v) { return SIGN[v.k].right; },
        hint: 'Dedos de la mano derecha con el recorrido: el pulgar marca la dirección positiva.',
        solution: function (v) { return SIGN[v.k].why + ' Cuenta <strong>' + SIGN[v.k].right.toLowerCase() + '</strong>.'; }
      },
      {
        id: 'f3-s08-afuera', title: 'Concepto: mover una corriente de afuera',
        vars: { k: [0, 1, 1] },
        prompt: function (v) { return v.k ? '<p>Una corriente fuera de una trayectoria amperiana se acerca mucho a la trayectoria (sin cruzarla). ¿Qué pasa con $\\oint\\vec B\\cdot d\\vec l$?</p>' : '<p>Una corriente fuera de una trayectoria amperiana se acerca mucho a la trayectoria (sin cruzarla). ¿Qué pasa con $\\vec B$ en los puntos de la trayectoria más cercanos a ella?</p>'; },
        check: 'choice',
        options: function (v) {
          return v.k ? [
            { text: 'No cambia', correct: true },
            { text: 'Aumenta', say: 'Cambia B punto por punto, pero su aporte a la circulación sigue siendo cero.' },
            { text: 'Se hace cero', say: 'Sigue valiendo $\\mu_0$ por la corriente de adentro.' }
          ] : [
            { text: 'Aumenta', correct: true },
            { text: 'No cambia', say: 'El campo en cada punto sí cambia: la corriente está más cerca.' },
            { text: 'Se hace cero', say: 'La corriente de afuera sí produce campo en la trayectoria.' }
          ];
        },
        answer: function (v) { return v.k ? 'No cambia' : 'Aumenta'; },
        hint: 'Distingue entre el campo en cada punto y la circulación total.',
        solution: function (v) { return v.k ? 'La circulación solo depende de la corriente encerrada: <strong>no cambia</strong>.' : 'Cerca de una corriente su campo es grande: <strong>aumenta</strong>. Pero la circulación no cambia.'; }
      }
    ],

    quiz: { tags: ['f3.S08'], count: 8 },

    errors: [
      'Contar las corrientes de afuera en $I_{\\text{enc}}$.',
      'Ignorar el signo: con recorrido antihorario, ⊗ cuenta negativo.',
      'Concluir que $B = 0$ en la trayectoria porque la circulación es cero.',
      'Dentro de un alambre grueso, usar $\\mu_0 I/2\\pi r$ (como si encerrara toda la corriente).',
      'Tomar la corriente encerrada proporcional a $r$ en lugar de $r^2$.',
      'Usar Ampère para despejar B donde no hay simetría (una espira, un tramo corto).',
      'Olvidar $\\mu_0$ y dar $I_{\\text{enc}}$ como si fuera la circulación.'
    ],

    teacher: {
      plan: [
        'Recupera Gauss: «integral sobre algo cerrado = lo que hay adentro». Presenta la circulación con el alambre y el círculo.',
        'Enuncia Ampère con la regla de signos y usa el explainer para justificar que las de afuera no cuentan.',
        'Resuelve el alambre grueso con el explainer (adentro y afuera) y luego el coaxial y el tubo.',
        'Cierra con el lab: que muevan alambres de afuera y vean que la circulación no cambia.'
      ],
      check: [
        'Que calculen $I_{\\text{enc}}$ con signo para un recorrido dado.',
        'Que saquen $B(r)$ dentro y fuera de un alambre grueso.',
        'Que expliquen por qué un coaxial no tiene campo afuera.'
      ],
      note: 'La corriente de desplazamiento de Maxwell solo se menciona en una duda común; todas las corrientes del curso son estacionarias.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §12.5 “Ampère’s Law”. <a href="https://openstax.org/books/university-physics-volume-2/pages/12-5-amperes-law">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-07',
    next: 'sesion-09'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
