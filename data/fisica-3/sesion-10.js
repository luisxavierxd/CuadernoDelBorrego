/* =====================================================================
   Física 3 · S10 · Flujo magnético, ley de Gauss del magnetismo y materia (bloque B · Fuentes de campo).
   Fuentes: OpenStax, University Physics Volume 2, §12.7 y §13.1 (CC BY-NC-SA 4.0).
   μ₀ = 4π × 10⁻⁷ T·m/A. Campos en mT, áreas en cm², flujo en µWb (1 Wb = 1 T·m²).
   Las cuentas se comparan contra LabMath.mflux (lab magnetic-flux).
   ===================================================================== */
(function () {
  var MU0 = 4 * Math.PI * 1e-7, RAD = Math.PI / 180;
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
  // Flujo en µWb con B en mT y A en cm²: (B/1000)(A/10⁴) cos θ × 10⁶ = 0.1·B·A·cos θ.
  function phi(B, A, th) { return 0.1 * B * A * Math.cos(th * RAD); }

  var e1 = { B: 200, L: 10, th: 60 }; e1.A = e1.L * e1.L; e1.F = phi(e1.B, e1.A, e1.th);
  var e2 = { I: 20, a: 2, b: 10, h: 5 }; e2.F = 2e-7 * e2.I * (e2.h / 100) * Math.log(e2.b / e2.a) * 1e6;
  var e3 = { a: 120, b: 30 }; e3.F = e3.a - e3.b;
  var e4 = { Km: 500, N: 300, L: 15, I: 0.5 }; e4.B0 = MU0 * e4.N / (e4.L / 100) * e4.I * 1000; e4.B = e4.Km * e4.B0;

  var MAT = [
    { chi: '3.9\\times 10^{-4}', what: 'un gas de oxígeno líquido', right: 'Paramagnético', why: 'χ es positiva y pequeña: paramagnético (se atrae débilmente).' },
    { chi: '-9.7\\times 10^{-6}', what: 'el cobre', right: 'Diamagnético', why: 'χ es negativa y pequeña: diamagnético (se repele débilmente).' },
    { chi: '5\\times 10^{3}', what: 'un hierro dulce', right: 'Ferromagnético', why: 'χ es enorme y positiva: ferromagnético.' },
    { chi: '-9.0\\times 10^{-6}', what: 'el agua', right: 'Diamagnético', why: 'χ es negativa y pequeña: diamagnético.' }
  ];

  var data = window.SESSION_DATA = {
    slug: 'sesion-10', number: '10', group: 'B · Fuentes de campo',
    title: 'Flujo magnético, ley de Gauss del magnetismo y materia', temario: [],
    minutes: 180,
    quote: 'El flujo magnético cuenta cuántas líneas de $\\vec B$ atraviesan una superficie. Por una superficie cerrada siempre da cero: las líneas de $\\vec B$ no empiezan ni terminan, porque no hay polos magnéticos sueltos.',
    badges: [
      'Calcular el flujo magnético $\\Phi = BA\\cos\\theta$ y su signo, y con una integral cuando B no es uniforme.',
      'Explicar la ley de Gauss del magnetismo, $\\oint\\vec B\\cdot d\\vec A = 0$, y compararla con la del campo eléctrico.',
      'Distinguir materiales paramagnéticos, diamagnéticos y ferromagnéticos por su susceptibilidad.',
      'Usar la permeabilidad $\\mu = K_m\\mu_0$ para el campo de una bobina con núcleo.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'En Física 2 el flujo eléctrico contaba cuántas líneas de $\\vec E$ cruzaban una superficie. Con $\\vec B$ se hace igual. La diferencia aparece al cerrar la superficie: ahí está la ley de Gauss del magnetismo, que prometimos en la <a href="../sesion-01/">sesión 1</a>.',
        recall: [
          'Flujo eléctrico y ley de Gauss (<a href="../../../fisica-2/sesiones/sesion-07/">Física 2 · S07</a> y <a href="../../../fisica-2/sesiones/sesion-08/">S08</a>).',
          'Líneas de campo de un imán: salen de N, entran por S y se cierran por dentro (<a href="../sesion-01/">sesión 1</a>).',
          'El campo dentro de un solenoide, $B = \\mu_0 n I$ (<a href="../sesion-09/">sesión 9</a>).'
        ],
        why: 'El flujo magnético es la cantidad clave del bloque C: la ley de Faraday dice que cuando el flujo cambia aparece un voltaje. Y los materiales magnéticos están en todos los transformadores, motores, discos duros y en la resonancia magnética.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Sostén un aro de alambre en la lluvia. Si lo pones horizontal, le entra la mayor cantidad de gotas; si lo inclinas, menos; si lo pones vertical, casi ninguna. Lo que importa es el área que el aro le «presenta» a la lluvia: su sombra.',
          'El flujo magnético es lo mismo con las líneas de $\\vec B$: cuántas atraviesan una superficie, contando cuánta área queda «de frente» al campo.'
        ]
      },
      {
        type: 'concept', heading: 'Flujo magnético', short: 'Flujo magnético',
        body: [
          'Para una superficie plana de área $A$ en un campo uniforme, el <strong>flujo magnético</strong> es $$\\Phi_B = \\vec B\\cdot\\vec A = BA\\cos\\theta$$ donde $\\vec A$ es un vector de magnitud $A$ perpendicular a la superficie (su <strong>normal</strong>) y $\\theta$ es el ángulo entre $\\vec B$ y la normal.',
          'Su unidad es el <strong>weber</strong>: $1\\ \\text{Wb} = 1\\ \\text{T·m}^2$. Con B en mT y A en cm², sale en $10^{-7}$ Wb $= 0.1\\ \\mu\\text{Wb}$.',
          'Cuidado con el ángulo: es entre $\\vec B$ y la <strong>normal</strong>, no entre $\\vec B$ y el plano. Si te dan el ángulo $\\alpha$ con el plano, $\\theta = 90^\\circ - \\alpha$ y $\\Phi = BA\\sin\\alpha$.'
        ],
        diagram: 'f3s10-flux',
        state: { th: 30 },
        caption: 'La sombra de la espira sobre un plano perpendicular a B tiene área A cos θ.'
      },
      {
        type: 'explainer', heading: 'El flujo al girar la espira', short: 'Girar la espira',
        title: 'Una espira en un campo uniforme, a distintos ángulos',
        intro: 'Gira la espira y mira la sombra: el flujo sigue a $\\cos\\theta$.',
        diagram: 'f3s10-flux',
        steps: [
          { text: '$\\theta = 0$: la normal es paralela a $\\vec B$, la espira está «de frente» y el flujo es máximo: $\\Phi = BA$.', state: { th: 0 } },
          { text: '$\\theta = 60^\\circ$: la sombra es la mitad del área, $\\Phi = BA\\cos 60^\\circ = \\frac{1}{2}BA$.', state: { th: 60 } },
          { text: '$\\theta = 90^\\circ$: el campo pasa rozando la espira, la sombra es una línea y $\\Phi = 0$.', state: { th: 90 } },
          { text: '$\\theta = 180^\\circ$: la espira quedó al revés; las líneas la cruzan en contra de la normal y $\\Phi = -BA$. El signo depende de qué lado elegiste como normal.', state: { th: 180 } }
        ]
      },
      {
        type: 'concept', heading: 'Cuando B no es uniforme', short: 'B no uniforme',
        body: [
          'Si $\\vec B$ cambia de un punto a otro, parte la superficie en pedacitos $dA$ y suma: $$\\Phi_B = \\int \\vec B\\cdot d\\vec A$$',
          'Ejemplo clásico: una espira rectangular de alto $h$, en el mismo plano que un alambre largo, entre las distancias $a$ y $b$. El campo $\\frac{\\mu_0 I}{2\\pi r}$ es perpendicular a la espira y solo cambia con $r$, así que se usan tiras de área $h\\,dr$: $$\\Phi_B = \\int_a^b \\frac{\\mu_0 I}{2\\pi r}\\,h\\,dr = \\frac{\\mu_0 I h}{2\\pi}\\ln\\frac{b}{a}$$'
        ],
        diagram: 'f3s10-wire',
        caption: 'Cada tira de ancho dr tiene casi el mismo B.'
      },
      {
        type: 'concept', heading: 'La ley de Gauss del magnetismo', short: 'Gauss magnético',
        body: [
          'Para cualquier superficie <strong>cerrada</strong>: $$\\oint \\vec B\\cdot d\\vec A = 0$$',
          'La razón está en las líneas. Como las líneas de $\\vec B$ son lazos cerrados, cada línea que entra a una superficie cerrada tiene que volver a salir. Lo que entra es igual a lo que sale y el flujo neto es cero, sin importar la forma de la superficie ni lo que haya adentro.',
          'Compara con la ley de Gauss eléctrica, $\\oint\\vec E\\cdot d\\vec A = q_{\\text{enc}}/\\varepsilon_0$: las líneas de $\\vec E$ <strong>nacen</strong> en las cargas positivas y <strong>mueren</strong> en las negativas, así que si hay carga adentro, sale (o entra) más de lo que entra (o sale). En magnetismo, el lugar de la «carga» lo ocuparía un polo suelto, un <strong>monopolo magnético</strong>. Gauss magnético dice que no hay: el flujo cero es otra forma de decir que los polos siempre vienen en pares.'
        ]
      },
      {
        type: 'explainer', heading: 'Una superficie que corta un imán', short: 'Superficie y imán',
        title: '¿Y si la superficie encierra solo el polo N?',
        intro: 'Parece que ahí sí saldría flujo neto. Sigue las líneas también por dentro del imán.',
        diagram: 'f3s10-gauss',
        steps: [
          { text: 'A la izquierda, una carga positiva: todas las líneas de $\\vec E$ salen de la superficie. Flujo neto $q/\\varepsilon_0$. A la derecha, una superficie que rodea solo el polo N: por afuera del imán, las líneas salen.', state: { k: 1 } },
          { text: 'Pero las líneas de $\\vec B$ no empiezan en el polo N: vienen <strong>por dentro del imán</strong>, de S a N, y entran a la superficie justo donde la superficie corta al imán.', state: { k: 2 } },
          { text: 'Cada línea que sale por afuera entró por adentro: el flujo neto es cero. Lo comprobarás en el lab con una esfera que corta un imán.', state: { k: 3 } }
        ]
      },
      {
        type: 'callout', heading: 'E contra B, ahora sí completo',
        body: [
          '<ul><li><strong>Fuentes:</strong> $\\vec E$ sale de cargas, que pueden estar solas. $\\vec B$ sale de corrientes (y de los espines de los electrones); sus «polos» siempre vienen en pares.</li><li><strong>Líneas:</strong> las de $\\vec E$ empiezan y terminan en cargas; las de $\\vec B$ son lazos cerrados.</li><li><strong>Gauss:</strong> $\\oint\\vec E\\cdot d\\vec A = q/\\varepsilon_0$; $\\oint\\vec B\\cdot d\\vec A = 0$.</li><li><strong>Monopolos:</strong> se han buscado (en rayos cósmicos y en aceleradores) y nunca se han encontrado.</li></ul>'
        ],
        diagram: 'f3s01-eb',
        caption: 'Izquierda: E de un par de cargas. Derecha: B de un imán.'
      },
      {
        type: 'concept', heading: 'Magnetismo en la materia', short: 'Materia',
        body: [
          'Cada átomo es un imán diminuto: sus electrones orbitan y tienen <strong>espín</strong>, y eso les da un momento magnético. En la mayoría de los materiales esos imanes atómicos apuntan al azar o se cancelan; un campo externo $\\vec B_0$ los reorienta un poco o mucho y el material agrega su propio campo.',
          'Si llenas un solenoide con un material, el campo adentro cambia por un factor, la <strong>permeabilidad relativa</strong> $K_m$: $$B = K_m B_0 = K_m\\mu_0 n I = \\mu n I,\\qquad \\mu = K_m\\mu_0 = (1 + \\chi)\\,\\mu_0$$ donde $\\chi$ es la <strong>susceptibilidad magnética</strong>.',
          '<ul><li><strong>Paramagnéticos</strong> ($\\chi$ positiva y pequeña, de $10^{-5}$ a $10^{-3}$): aluminio, platino, oxígeno. Sus imanes atómicos se alinean un poco con el campo; la agitación térmica lo impide en parte. Un imán fuerte los atrae débilmente.</li><li><strong>Diamagnéticos</strong> ($\\chi$ negativa, del orden de $-10^{-5}$): cobre, oro, agua, bismuto. El campo induce en los átomos un pequeño momento opuesto. Un imán muy fuerte los repele débilmente (así se ha hecho levitar una rana). Todos los materiales tienen algo de diamagnetismo.</li><li><strong>Ferromagnéticos</strong> ($K_m$ de cientos a miles): hierro, níquel, cobalto y sus aleaciones. Ahí los momentos se alinean en regiones llamadas <strong>dominios</strong>.</li></ul>'
        ]
      },
      {
        type: 'concept', heading: 'Dominios, histéresis e imanes permanentes', short: 'Ferromagnetismo',
        body: [
          'En un ferromagnético, cada dominio (unas décimas de milímetro o menos) está magnetizado por completo, pero sin campo externo los dominios apuntan al azar. Un campo externo hace crecer los dominios alineados con él, y el material produce un campo cientos o miles de veces mayor que $B_0$. Por eso un clavo dentro de una bobina la convierte en un electroimán.',
          'Al quitar el campo, muchos dominios se quedan alineados: queda una <strong>remanencia</strong>. Así se hace un <strong>imán permanente</strong>. Para desmagnetizarlo hay que aplicar un campo opuesto (el campo <strong>coercitivo</strong>). La curva de ida y la de regreso no coinciden: es el ciclo de <strong>histéresis</strong>.',
          'Por arriba de la <strong>temperatura de Curie</strong> (770 °C para el hierro) la agitación térmica destruye los dominios y el material se vuelve paramagnético.'
        ],
        diagram: 'f3s10-domains',
        state: { k: 1 },
        caption: 'Sin campo los dominios se cancelan; con campo se alinean.'
      },
      {
        type: 'concept', heading: 'El ciclo de histéresis', short: 'Histéresis',
        body: [
          'Los materiales «blandos» (hierro dulce, núcleos de transformador) tienen un ciclo angosto: se magnetizan y desmagnetizan fácil, con poca energía perdida por vuelta. Los «duros» (acero, ferritas, neodimio) tienen un ciclo ancho: buena remanencia y gran coercitivo, ideales para imanes permanentes y para guardar datos.'
        ],
        diagram: 'f3s10-hyst',
        caption: 'El área del ciclo es energía que se pierde en cada vuelta.'
      },
      {
        type: 'recipe', heading: 'Receta: flujo y materiales', short: 'Receta',
        steps: [
          { text: 'Identifica la normal de la superficie y el ángulo $\\theta$ entre $\\vec B$ y la normal.', tip: 'Si te dan el ángulo con el plano, $\\theta = 90^\\circ$ menos ese ángulo.' },
          { text: 'Campo uniforme y superficie plana: $\\Phi = BA\\cos\\theta$, con $A$ en m² y $B$ en T.', tip: '1 cm² = $10^{-4}$ m².' },
          { text: 'Campo que cambia: parte en tiras donde B sea casi constante e integra $\\int B\\,dA$.' },
          { text: 'Superficie cerrada: el flujo neto es cero. Lo que falta en una cara tiene que compensar a las demás.' },
          { text: 'Con un material: $B = K_m B_0$. Paramagnético $K_m$ apenas mayor que 1, diamagnético apenas menor, ferromagnético mucho mayor.' }
        ]
      },
      {
        type: 'example', heading: 'Flujo por una espira inclinada',
        problem: '<p>Una espira cuadrada de $' + e1.L + '\\ \\text{cm}$ de lado está en un campo uniforme de $' + e1.B + '\\ \\text{mT}$. Su normal forma $' + e1.th + '^\\circ$ con el campo. ¿Cuánto vale el flujo?</p>',
        steps: [
          { text: 'Área en m².', math: 'A = (' + fx(e1.L / 100, 2) + '\\ \\text{m})^2 = ' + fx(e1.A / 1e4, 4) + '\\ \\text{m}^2' },
          { text: 'Flujo con el ángulo entre B y la normal.', math: '\\Phi = BA\\cos\\theta = (' + fx(e1.B / 1000, 2) + '\\ \\text{T})(' + fx(e1.A / 1e4, 4) + ')\\cos ' + e1.th + '^\\circ = ' + fx(e1.F / 1e6, 4) + '\\ \\text{Wb} = ' + fx(e1.F, 0) + '\\ \\mu\\text{Wb}' }
        ],
        answer: '$\\Phi = ' + fx(e1.F / 1000, 2) + '\\ \\text{mWb} = ' + fx(e1.F, 0) + '\\ \\mu\\text{Wb}$.',
        verify: { lab: 'call', mod: 'mflux', fn: 'fluxUWb', args: [e1.B, e1.A, e1.th], value: e1.F }
      },
      {
        type: 'example', heading: 'Una espira junto a un alambre',
        problem: '<p>Un alambre largo lleva $' + e2.I + '\\ \\text{A}$. En su mismo plano hay una espira rectangular de $' + e2.h + '\\ \\text{cm}$ de alto, con sus lados paralelos al alambre a $' + e2.a + '\\ \\text{cm}$ y $' + e2.b + '\\ \\text{cm}$ de él. ¿Cuánto flujo del alambre pasa por la espira?</p>',
        steps: [
          { text: 'B cambia con $r$: usa tiras de área $h\\,dr$.', math: '\\Phi = \\int_a^b \\frac{\\mu_0 I}{2\\pi r}h\\,dr = \\frac{\\mu_0 I h}{2\\pi}\\ln\\frac{b}{a}' },
          { text: 'Sustituye.', math: '\\Phi = (2\\times 10^{-7})(' + e2.I + ')(' + fx(e2.h / 100, 2) + ')\\ln\\frac{' + e2.b + '}{' + e2.a + '} = ' + fx(e2.F, 3) + '\\ \\mu\\text{Wb}' },
          { text: 'Un error común: usar el campo en el centro de la espira por el área. Aquí daría $' + fx(2e-7 * e2.I / ((e2.a + e2.b) / 200) * (e2.h * (e2.b - e2.a) / 1e4) * 1e6, 3) + '\\ \\mu\\text{Wb}$: el campo no es uniforme y el promedio no es el del centro.' }
        ],
        answer: '$\\Phi = ' + fx(e2.F, 3) + '\\ \\mu\\text{Wb} = ' + fx(e2.F, 3) + '\\times 10^{-6}\\ \\text{Wb}$.',
        verify: { lab: 'call', mod: 'mflux', fn: 'wireRectUWb', args: [e2.I, e2.a, e2.b, e2.h], value: e2.F }
      },
      {
        type: 'example', heading: 'Flujo por una superficie cerrada',
        problem: '<p>Un cilindro cerrado está en una región con campo magnético. Por una de sus tapas entran $' + e3.a + '\\ \\mu\\text{Wb}$ y por su cara lateral salen $' + e3.b + '\\ \\mu\\text{Wb}$. ¿Cuánto flujo pasa por la otra tapa, y entra o sale?</p>',
        steps: [
          { text: 'Gauss magnético: el flujo neto por la superficie cerrada es cero. Con «sale» positivo:', math: '-' + e3.a + ' + ' + e3.b + ' + \\Phi_{\\text{tapa}} = 0' },
          { text: 'Despeja.', math: '\\Phi_{\\text{tapa}} = ' + e3.a + ' - ' + e3.b + ' = ' + e3.F + '\\ \\mu\\text{Wb}' }
        ],
        answer: 'Por la otra tapa <strong>salen</strong> $' + e3.F + '\\ \\mu\\text{Wb}$.',
        verify: { lab: 'call', mod: 'mflux', fn: 'truth', args: [{ kind: 'gauss', a: e3.a, b: e3.b }], value: e3.F }
      },
      {
        type: 'example', heading: 'Un electroimán con núcleo de hierro',
        problem: '<p>Un solenoide de $' + e4.L + '\\ \\text{cm}$ con $' + e4.N + '$ vueltas lleva $' + e4.I + '\\ \\text{A}$. Lo llenas con un núcleo de hierro de $K_m = ' + e4.Km + '$. ¿Cuánto vale el campo sin núcleo y con núcleo?</p>',
        steps: [
          { text: 'Sin núcleo.', math: 'B_0 = \\mu_0 n I = (4\\pi\\times 10^{-7})\\frac{' + e4.N + '}{' + fx(e4.L / 100, 2) + '}(' + e4.I + ') = ' + fx(e4.B0, 3) + '\\ \\text{mT}' },
          { text: 'Con núcleo, el material multiplica el campo.', math: 'B = K_m B_0 = ' + e4.Km + '(' + fx(e4.B0, 3) + '\\ \\text{mT}) = ' + fx(e4.B, 0) + '\\ \\text{mT}' },
          { text: 'Con más corriente no crecería sin límite: el hierro se <strong>satura</strong> (todos los dominios ya alineados) cerca de 2 T.' }
        ],
        answer: '$B_0 = ' + fx(e4.B0, 3) + '\\ \\text{mT}$ y $B = ' + fx(e4.B, 0) + '\\ \\text{mT}$.',
        verify: { lab: 'call', mod: 'mflux', fn: 'coremT', args: [e4.Km, e4.N, e4.L, e4.I], value: e4.B }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: 'Si el flujo por una superficie cerrada es cero, ¿quiere decir que no hay campo?', a: 'No. Puede haber mucho campo atravesándola: lo que entra por un lado sale por otro.' },
          { q: '¿Qué pasa si parto un imán para aislar el polo N?', a: 'Obtienes dos imanes completos (sesión 1). Por eso ninguna superficie encierra un polo suelto, y Gauss magnético se cumple siempre.' },
          { q: '¿El flujo puede ser negativo?', a: 'Sí: si el campo cruza la superficie en contra de la normal que elegiste. Para una superficie cerrada, la normal se elige hacia afuera.' },
          { q: '¿Por qué un imán atrae al hierro pero no al cobre?', a: 'El hierro es ferromagnético: el imán alinea sus dominios y aparece un polo opuesto cerca. El cobre es diamagnético: su respuesta es diminuta y de repulsión.' },
          { q: '¿Qué es la saturación?', a: 'Cuando todos los dominios ya están alineados, el material no puede aportar más. Para el hierro es del orden de 2 T; más allá, el campo solo crece como el de la bobina sola.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Flujo magnético: $\\Phi_B = BA\\cos\\theta$ (θ entre B y la normal), o $\\int\\vec B\\cdot d\\vec A$. Unidad: weber, $1\\ \\text{Wb} = 1\\ \\text{T·m}^2$.',
          'Ley de Gauss del magnetismo: $\\oint\\vec B\\cdot d\\vec A = 0$. Las líneas de B se cierran; no hay monopolos.',
          'Comparación: $\\oint\\vec E\\cdot d\\vec A = q/\\varepsilon_0$; $\\oint\\vec B\\cdot d\\vec A = 0$.',
          'En un material: $B = K_m B_0$, $\\mu = K_m\\mu_0 = (1 + \\chi)\\mu_0$.',
          'Paramagnético: χ > 0 pequeña. Diamagnético: χ < 0 pequeña. Ferromagnético: dominios, $K_m$ enorme, histéresis y remanencia.'
        ]
      }
    ],

    lab: {
      type: 'magnetic-flux', title: 'Flujo magnético',
      intro: 'En el modo de espira, cambia el campo, el tamaño y el ángulo θ entre B y la normal, y mira cómo la sombra de la espira da el flujo BA cos θ. En el modo de Gauss, arrastra una esfera cerrada alrededor de imanes: el lab suma el flujo que sale, el que entra y el que pasa por dentro de un imán cortado, y el total siempre es cero. En el reto, el lab te dice si usaste sen θ, si dejaste el área en cm² o si olvidaste que el flujo neto por una superficie cerrada es cero.',
      cfg: {}
    },

    formulas: [
      { label: 'Flujo magnético', tex: '\\Phi_B = \\vec B\\cdot\\vec A = BA\\cos\\theta,\\qquad \\Phi_B = \\int\\vec B\\cdot d\\vec A' },
      { label: 'Weber', tex: '1\\ \\text{Wb} = 1\\ \\text{T·m}^2' },
      { label: 'Junto a un alambre', tex: '\\Phi_B = \\frac{\\mu_0 I h}{2\\pi}\\ln\\frac{b}{a}' },
      { label: 'Gauss del magnetismo', tex: '\\oint\\vec B\\cdot d\\vec A = 0' },
      { label: 'En un material', tex: 'B = K_m B_0,\\quad \\mu = K_m\\mu_0 = (1 + \\chi)\\mu_0' }
    ],

    exercises: [
      {
        id: 'f3-s10-flujo', title: 'Flujo por una espira cuadrada',
        vars: { B: [10, 500, 10], L: [2, 20, 1], th: [0, 75, 15] },
        prompt: function (v) { return '<p>Una espira cuadrada de $' + v.L + '\\ \\text{cm}$ de lado está en un campo uniforme de $' + v.B + '\\ \\text{mT}$; su normal forma $' + v.th + '^\\circ$ con el campo. ¿Cuánto vale el flujo? En $\\mu\\text{Wb}$.</p>'; },
        check: 'numeric', unit: 'µWb',
        answer: function (v) { return phi(v.B, v.L * v.L, v.th); },
        mistakes: {
          sin: function (v) { return 0.1 * v.B * v.L * v.L * Math.sin(v.th * RAD); },
          cm2: function (v) { return phi(v.B, v.L * v.L, v.th) * 1e4; }
        },
        feedback: [
          { when: 'sin', say: 'θ es el ángulo con la normal: va $\\cos\\theta$.' },
          { when: 'cm2', say: 'Pasa el área a m²: 1 cm² = $10^{-4}$ m².' }
        ],
        oracle: { lab: 'call', mod: 'mflux', fn: 'fluxUWb', args: function (v) { return [v.B, v.L * v.L, v.th]; } },
        hint: '$\\Phi = BA\\cos\\theta$ con B en T y A en m².',
        solution: function (v) { return '$$\\Phi = (' + fx(v.B / 1000, 3) + ')(' + fx(v.L * v.L / 1e4, 4) + ')\\cos ' + v.th + '^\\circ = ' + fx(phi(v.B, v.L * v.L, v.th), 2) + '\\ \\mu\\text{Wb}$$'; }
      },
      {
        id: 'f3-s10-plano', title: 'Ángulo con el plano',
        vars: { B: [10, 400, 10], A: [10, 400, 10], al: [10, 80, 10] },
        prompt: function (v) { return '<p>Un campo de $' + v.B + '\\ \\text{mT}$ forma $' + v.al + '^\\circ$ con el <strong>plano</strong> de una espira de $' + v.A + '\\ \\text{cm}^2$. ¿Cuánto vale el flujo? En $\\mu\\text{Wb}$.</p>'; },
        check: 'numeric', unit: 'µWb',
        answer: function (v) { return 0.1 * v.B * v.A * Math.sin(v.al * RAD); },
        mistakes: { cos: function (v) { return phi(v.B, v.A, v.al); } },
        feedback: [{ when: 'cos', say: 'Ese ángulo es con el plano; con la normal es $90^\\circ - ' + '\\alpha$, así que va $\\sin\\alpha$.' }],
        where: function (v) { return v.al !== 45; },
        oracle: { lab: 'call', mod: 'mflux', fn: 'fluxUWb', args: function (v) { return [v.B, v.A, 90 - v.al]; } },
        hint: 'Con la normal: $\\theta = 90^\\circ - \\alpha$.',
        solution: function (v) { return '$$\\theta = 90^\\circ - ' + v.al + '^\\circ = ' + (90 - v.al) + '^\\circ,\\qquad \\Phi = (' + fx(v.B / 1000, 3) + ')(' + fx(v.A / 1e4, 4) + ')\\cos ' + (90 - v.al) + '^\\circ = ' + fx(0.1 * v.B * v.A * Math.sin(v.al * RAD), 2) + '\\ \\mu\\text{Wb}$$'; }
      },
      {
        id: 'f3-s10-circular', title: 'Espira circular de frente al campo',
        vars: { B: [10, 500, 10], d: [2, 20, 2] },
        prompt: function (v) { return '<p>Una espira circular de $' + v.d + '\\ \\text{cm}$ de <strong>diámetro</strong> está perpendicular a un campo de $' + v.B + '\\ \\text{mT}$. ¿Cuánto vale el flujo? En $\\mu\\text{Wb}$.</p>'; },
        check: 'numeric', unit: 'µWb',
        answer: function (v) { return phi(v.B, Math.PI * v.d * v.d / 4, 0); },
        mistakes: { diam: function (v) { return phi(v.B, Math.PI * v.d * v.d, 0); } },
        feedback: [{ when: 'diam', say: 'Usaste el diámetro como radio: $A = \\pi(d/2)^2$.' }],
        oracle: { lab: 'call', mod: 'mflux', fn: 'truth', args: function (v) { return [{ kind: 'loop', B: v.B, shape: 'circ', L: v.d, th: 0, diam: true }]; } },
        hint: '$A = \\pi r^2$ con $r = d/2$; perpendicular quiere decir $\\theta = 0$.',
        solution: function (v) { var A = Math.PI * v.d * v.d / 4; return '$$A = \\pi(' + fx(v.d / 200, 3) + ')^2 = ' + fx(A / 1e4, 6) + '\\ \\text{m}^2,\\qquad \\Phi = (' + fx(v.B / 1000, 3) + ')(' + fx(A / 1e4, 6) + ') = ' + fx(phi(v.B, A, 0), 2) + '\\ \\mu\\text{Wb}$$'; }
      },
      {
        id: 'f3-s10-gauss', title: 'Flujo que falta en una superficie cerrada',
        vars: { a: [10, 90, 5], b: [5, 80, 5] },
        prompt: function (v) { return '<p>Por la cara izquierda de una caja cerrada <strong>entran</strong> $' + v.a + '\\ \\mu\\text{Wb}$ y por la derecha <strong>salen</strong> $' + v.b + '\\ \\mu\\text{Wb}$. ¿Cuánto flujo neto <strong>sale</strong> por las otras cuatro caras? En $\\mu\\text{Wb}$ (negativo si entra).</p>'; },
        check: 'numeric', unit: 'µWb',
        answer: function (v) { return v.a - v.b; },
        mistakes: { sign: function (v) { return v.b - v.a; } },
        feedback: [{ when: 'sign', say: 'El neto total debe ser cero: con «sale» positivo, $-a + b + x = 0$.' }],
        where: function (v) { return v.a !== v.b; },
        oracle: { lab: 'call', mod: 'mflux', fn: 'truth', args: function (v) { return [{ kind: 'gauss', a: v.a, b: v.b }]; } },
        hint: 'Gauss magnético: el flujo neto por la caja es cero.',
        solution: function (v) { return '$$-' + v.a + ' + ' + v.b + ' + \\Phi = 0 \\Rightarrow \\Phi = ' + (v.a - v.b) + '\\ \\mu\\text{Wb}$$'; }
      },
      {
        id: 'f3-s10-alambre', title: 'Flujo de un alambre por una espira',
        vars: { I: [5, 50, 5], a: [1, 5, 1], d: [2, 20, 2], h: [2, 20, 2] },
        prompt: function (v) { return '<p>Un alambre largo lleva $' + v.I + '\\ \\text{A}$. Una espira rectangular de $' + v.h + '\\ \\text{cm}$ de alto, en el mismo plano, tiene sus lados paralelos al alambre a $' + v.a + '\\ \\text{cm}$ y a $' + (v.a + v.d) + '\\ \\text{cm}$. ¿Cuánto flujo pasa por la espira? En $\\mu\\text{Wb}$.</p>'; },
        check: 'numeric', unit: 'µWb',
        answer: function (v) { return 2e-7 * v.I * (v.h / 100) * Math.log((v.a + v.d) / v.a) * 1e6; },
        mistakes: { center: function (v) { var rc = (v.a + v.d / 2) / 100; return 2e-7 * v.I / rc * (v.h / 100) * (v.d / 100) * 1e6; } },
        feedback: [{ when: 'center', say: 'Usaste el campo del centro por el área. B no es uniforme: integra $\\int \\frac{\\mu_0 I}{2\\pi r}h\\,dr$.' }],
        oracle: { lab: 'call', mod: 'mflux', fn: 'wireRectUWb', args: function (v) { return [v.I, v.a, v.a + v.d, v.h]; } },
        hint: '$\\Phi = \\frac{\\mu_0 I h}{2\\pi}\\ln\\frac{b}{a}$.',
        solution: function (v) { return '$$\\Phi = (2\\times 10^{-7})(' + v.I + ')(' + fx(v.h / 100, 2) + ')\\ln\\frac{' + (v.a + v.d) + '}{' + v.a + '} = ' + fx(2e-7 * v.I * (v.h / 100) * Math.log((v.a + v.d) / v.a) * 1e6, 3) + '\\ \\mu\\text{Wb}$$'; }
      },
      {
        id: 'f3-s10-nucleo', title: 'Bobina con núcleo',
        vars: { Km: [100, 2000, 100], Nv: [100, 500, 50], L: [10, 40, 5], I: [0.1, 1, 0.1] },
        prompt: function (v) { return '<p>Un solenoide de $' + v.L + '\\ \\text{cm}$ y $' + v.Nv + '$ vueltas lleva $' + fx(v.I, 1) + '\\ \\text{A}$ y está lleno de un material con $K_m = ' + v.Km + '$. ¿Cuánto vale $B$ adentro? En mT.</p>'; },
        check: 'numeric', unit: 'mT',
        answer: function (v) { return v.Km * MU0 * v.Nv / (v.L / 100) * v.I * 1000; },
        mistakes: { noKm: function (v) { return MU0 * v.Nv / (v.L / 100) * v.I * 1000; } },
        feedback: [{ when: 'noKm', say: 'Ese es el campo sin núcleo. Multiplica por $K_m$.' }],
        where: function (v) { return v.Km * MU0 * v.Nv / (v.L / 100) * v.I < 1.5; },
        oracle: { lab: 'call', mod: 'mflux', fn: 'coremT', args: function (v) { return [v.Km, v.Nv, v.L, v.I]; } },
        hint: '$B = K_m\\mu_0 n I$.',
        solution: function (v) { var B0 = MU0 * v.Nv / (v.L / 100) * v.I * 1000; return '$$B_0 = \\mu_0 n I = ' + fx(B0, 4) + '\\ \\text{mT},\\qquad B = K_m B_0 = ' + v.Km + '(' + fx(B0, 4) + ') = ' + fx(v.Km * B0, 1) + '\\ \\text{mT}$$'; }
      },
      {
        id: 'f3-s10-material', title: 'Concepto: ¿qué tipo de material?',
        vars: { k: [0, 3, 1] },
        prompt: function (v) { return '<p>La susceptibilidad magnética de ' + MAT[v.k].what + ' es $\\chi = ' + MAT[v.k].chi + '$. ¿Qué tipo de material es?</p>'; },
        check: 'choice',
        options: function (v) {
          var say = {
            'Paramagnético': 'Paramagnético es con χ positiva y pequeña.',
            'Diamagnético': 'Diamagnético es con χ negativa.',
            'Ferromagnético': 'Ferromagnético es con χ enorme (cientos a miles).'
          };
          return ['Paramagnético', 'Diamagnético', 'Ferromagnético'].map(function (t) { return t === MAT[v.k].right ? { text: t, correct: true } : { text: t, say: say[t] }; });
        },
        answer: function (v) { return MAT[v.k].right; },
        hint: 'Mira el signo y el tamaño de χ.',
        solution: function (v) { return MAT[v.k].why; }
      },
      {
        id: 'f3-s10-cerrada', title: 'Concepto: flujo por una superficie cerrada',
        vars: { k: [0, 2, 1] },
        prompt: function (v) { return '<p>' + ['Una esfera encierra por completo un imán de barra.', 'Una esfera encierra solo el polo N de un imán largo (la esfera corta al imán).', 'Una caja encierra una bobina con corriente.'][v.k] + ' ¿Cuánto vale el flujo magnético neto por la superficie?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Cero', correct: true },
            { text: 'Positivo, porque las líneas salen del polo N', say: 'Por dentro del imán las mismas líneas entran: lo que sale, entra.' },
            { text: 'Depende de qué tan fuerte sea la fuente', say: 'Para cualquier superficie cerrada es cero, sin importar la fuente.' }
          ];
        },
        answer: function () { return 'Cero'; },
        hint: 'Ley de Gauss del magnetismo.',
        solution: function () { return 'Las líneas de B son cerradas: todo lo que entra a una superficie cerrada sale. $\\oint\\vec B\\cdot d\\vec A = 0$.'; }
      }
    ],

    quiz: { tags: ['f3.S10'], count: 8 },

    errors: [
      'Usar el ángulo con el plano en lugar del ángulo con la normal en $\\Phi = BA\\cos\\theta$.',
      'Dejar el área en cm² (1 cm² = $10^{-4}$ m²).',
      'Pensar que flujo neto cero significa campo cero en la superficie.',
      'Creer que una superficie alrededor de un solo polo encierra flujo neto: por dentro del imán regresa.',
      'Usar el campo del centro por el área cuando B no es uniforme.',
      'Confundir diamagnético (χ < 0) con paramagnético (χ > 0, pequeña).',
      'Olvidar que el hierro se satura: $B = K_m B_0$ no crece sin límite.'
    ],

    teacher: {
      plan: [
        'Recupera el flujo eléctrico y define Φ_B con la sombra de la espira (explainer con varios ángulos).',
        'Flujo con B no uniforme: la espira junto al alambre, integrando por tiras.',
        'Gauss magnético con el explainer de la superficie que corta un imán y cierra la comparación E contra B que dejó abierta la sesión 1.',
        'Materia: imanes atómicos, para/dia/ferro, dominios e histéresis. Cierra con el lab (las dos partes).'
      ],
      check: [
        'Que calculen Φ con el ángulo correcto (con la normal) y con el área en m².',
        'Que expliquen por qué $\\oint\\vec B\\cdot d\\vec A = 0$ y qué diría un monopolo.',
        'Que clasifiquen materiales por χ y usen $B = K_m B_0$.'
      ],
      note: 'Esta sesión cierra el adelanto E contra B de la sesión 1. El flujo magnético es la base del bloque C (Faraday); conviene que dominen el signo y el ángulo.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §12.7 “Magnetism in Matter”. <a href="https://openstax.org/books/university-physics-volume-2/pages/12-7-magnetism-in-matter">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §13.1 “Faraday’s Law” (definición de flujo magnético). <a href="https://openstax.org/books/university-physics-volume-2/pages/13-1-faradays-law">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-09',
    next: 'sesion-11'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
