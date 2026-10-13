/* =====================================================================
   Física 3 · S01 · Imanes, campo magnético y líneas de campo (bloque A · Fuerza magnética).
   Fuentes: OpenStax, University Physics Volume 2, §11.1 y §11.2 (CC BY-NC-SA 4.0).
   Campo de la Tierra ≈ 50 µT = 0.50 G, 1 T = 10⁴ G, unidades SI.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.magnet (lab magnetic-field-map).
   ===================================================================== */
(function () {
  var RAD = Math.PI / 180, DEG = 180 / Math.PI;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  // La respuesta y cada error típico deben diferir al menos 3 % entre sí («casi» sin ambigüedad).
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

  // Ejemplo 1: imán de refrigerador (5.0 mT) contra el campo de la Tierra (0.50 G)
  var e1 = { magmT: 5.0, earthG: 0.5 }; e1.magUT = e1.magmT * 1000; e1.earthUT = e1.earthG * 100; e1.ratio = e1.magUT / e1.earthUT;
  // Ejemplo 2: brújula con un imán al este (0.20 mT) y la Tierra al norte (0.050 mT)
  var e2 = { m: 0.20, e: 0.050 }; e2.mag = Math.sqrt(e2.m * e2.m + e2.e * e2.e); e2.bearing = Math.atan(e2.m / e2.e) * DEG;
  // Ejemplo 3: tres campos sobre la brújula: Tierra 0.050 mT N, imán A 0.030 mT E, imán B 0.040 mT S
  var e3 = { earth: 0.050, a: 0.030, b: 0.040 }; e3.east = e3.a; e3.north = e3.earth - e3.b; e3.mag = Math.hypot(e3.east, e3.north); e3.bearing = Math.atan2(e3.east, e3.north) * DEG;

  var NEAR = [
    { where: 'frente al polo N de un imán de barra, sobre su eje', right: 'Alejándose del imán', why: 'Las líneas de campo salen del polo N. Ahí B apunta alejándose del imán, y el extremo N de la aguja sigue a B.' },
    { where: 'frente al polo S de un imán de barra, sobre su eje', right: 'Hacia el imán', why: 'Las líneas de campo entran por el polo S. Ahí B apunta hacia el imán, y el extremo N de la aguja sigue a B.' }
  ];

  var data = window.SESSION_DATA = {
    slug: 'sesion-01', number: '01', group: 'A · Fuerza magnética',
    title: 'Imanes, campo magnético y líneas de campo', temario: [],
    minutes: 120,
    quote: 'Un imán siempre tiene dos polos y está rodeado de un campo $\\vec B$ cuyas líneas no empiezan ni terminan en ningún lado: se cierran sobre sí mismas.',
    badges: [
      'Predecir si dos imanes se atraen o se repelen y explicar por qué no existen polos sueltos.',
      'Dibujar e interpretar las líneas de campo de un imán y usar la brújula para leer la dirección de $\\vec B$.',
      'Sumar el campo de un imán con el de la Tierra como vectores.',
      'Pasar entre tesla, militesla, microtesla y gauss.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Un imán actúa sobre otros objetos <strong>sin tocarlos</strong>. Igual que la carga eléctrica crea un campo $\\vec E$, un imán crea un <strong>campo magnético</strong> $\\vec B$ a su alrededor.',
        recall: [
          'Sumar vectores por componentes y dar su ángulo (<a href="../../../fisica-1/sesiones/sesion-02/">Física 1 · S02</a>).',
          'Qué es un campo y qué dicen sus líneas (<a href="../../../fisica-2/sesiones/sesion-03/">Física 2 · S03</a>): la línea es tangente al vector y entre más juntas, más intenso.',
          'Notación científica y prefijos: mili $= 10^{-3}$, micro $= 10^{-6}$.'
        ],
        why: 'La brújula, los motores y los generadores, las bocinas, los discos duros, las tarjetas de banco y la resonancia magnética funcionan con campos magnéticos. Esta sesión pone el vocabulario; desde la siguiente ya los usamos para calcular fuerzas.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Un imán de refrigerador se queda pegado al metal, pero no a una moneda ni a la pared de yeso. Con otro imán, a veces se atrae y a veces se <strong>empuja</strong> aunque no se toquen: algo ocupa el espacio entre ellos.',
          'Ese “algo” es el campo magnético. Lo puedes ver con limadura de hierro regada sobre un papel encima del imán: se acomoda en arcos que salen de un extremo, rodean al imán y llegan al otro.',
          'Y lo puedes <strong>medir</strong> con una brújula: su aguja es un imán pequeño que gira hasta alinearse con el campo del lugar. Toda la sesión sale de esas dos observaciones: dos extremos distintos y una aguja que señala la dirección.'
        ]
      },
      {
        type: 'concept', heading: 'Dos polos: norte y sur', short: 'Dos polos',
        body: [
          'Todo imán tiene dos extremos, llamados <strong>polos</strong>. Al que apunta hacia el norte geográfico cuando el imán gira libre se le llama polo <strong>norte</strong> (N); al otro, polo <strong>sur</strong> (S).',
          'La regla se parece a la de las cargas, pero con polos: <strong>polos iguales se repelen y polos distintos se atraen</strong>. N con S se jalan; N con N, o S con S, se empujan.',
          'Un imán también atrae un clip que no es imán, porque el campo lo <strong>magnetiza</strong> un poco: el clip queda con un polo cerca y otro lejos, igual que la pared se polariza cerca de un globo cargado (<a href="../../../fisica-2/sesiones/sesion-01/">Física 2 · S01</a>). Esto pasa con hierro, níquel, cobalto y sus aleaciones; no con el aluminio ni el cobre.'
        ],
        diagram: 'f3s01-poles',
        caption: 'Las flechas son las fuerzas sobre cada imán: se acercan si enfrentas N con S y se alejan si enfrentas polos iguales.'
      },
      {
        type: 'concept', heading: 'Los polos no se pueden separar', short: 'Sin polos sueltos',
        body: [
          'Con la carga eléctrica sí puedes tener un “polo” suelto: una carga positiva sola. Con el magnetismo <strong>no</strong>. Si partes un imán de barra por la mitad, no obtienes un trozo N y otro S: obtienes <strong>dos imanes completos</strong>, cada uno con su N y su S. Puedes seguir partiendo y siempre pasa lo mismo.',
          'Hasta hoy nadie ha encontrado un <strong>monopolo magnético</strong> (un N solo o un S solo), aunque sí se ha buscado. Por eso en esta sesión “polo” es una forma de hablar de los dos extremos del imán, y no una carga que se pueda aislar.',
          'El origen último del magnetismo de un imán está en el movimiento de los electrones de sus átomos (orbitan y tienen un espín). Eso lo retomamos cuando veamos el campo de las corrientes, en el bloque B.'
        ],
        diagram: 'f3s01-break',
        caption: 'Cada pedazo de un imán es un imán completo.'
      },
      {
        type: 'concept', heading: 'El campo magnético y la brújula', short: 'El campo B',
        body: [
          'El campo magnético es un <strong>campo vectorial</strong>: en cada punto del espacio hay un vector $\\vec B$ con magnitud y dirección. Se mide en <strong>teslas</strong> (T).',
          'La dirección de $\\vec B$ en un punto es la que señala el extremo <strong>N de una brújula</strong> colocada ahí. Fíjate que el extremo N de la aguja se alinea con $\\vec B$: por eso apunta hacia el polo <em>S</em> de un imán cercano.',
          'La magnitud de $\\vec B$ la vamos a definir bien en la <a href="../sesion-02/">sesión 2</a>, con la fuerza que el campo hace sobre una carga en movimiento. Por ahora basta saber que es una cantidad que se suma <strong>como vector</strong>: si hay dos fuentes, el campo total es $\\vec B = \\vec B_1 + \\vec B_2$.'
        ]
      },
      {
        type: 'concept', heading: 'Líneas de campo', short: 'Líneas de campo',
        body: [
          'Para dibujar un campo se trazan <strong>líneas de campo</strong> con cuatro reglas:',
          '<ul><li>En cada punto, la línea es <strong>tangente</strong> a $\\vec B$ y su flecha indica el sentido de $\\vec B$.</li><li>Afuera del imán, las líneas <strong>salen del polo N</strong> y <strong>entran por el polo S</strong>.</li><li>Entre más juntas estén las líneas, <strong>más intenso</strong> es el campo (junto a los polos).</li><li>Nunca se cruzan: en cada punto B tiene una sola dirección.</li></ul>',
          'Y hay una regla más, que distingue al magnetismo de la electricidad: <strong>las líneas de $\\vec B$ no empiezan ni terminan en ningún punto</strong>. Dentro del imán siguen de S a N, y así cada línea se cierra en un lazo.'
        ],
        diagram: 'f3s01-fieldmap',
        state: { comp: 0, lines: 1, inside: 1 },
        caption: 'Afuera del imán las líneas van de N a S; adentro, de S a N. Son lazos cerrados.'
      },
      {
        type: 'explainer', heading: 'De las brújulas a las líneas de campo', short: 'Brújulas y líneas',
        title: 'Cómo se dibuja el campo de un imán',
        intro: 'Las líneas de campo no son cuerdas que existan en el espacio: son una forma de <strong>resumir</strong> lo que marcaría una brújula en cada punto.',
        diagram: 'f3s01-fieldmap',
        steps: [
          { text: 'Un imán de barra, con su polo N a la derecha. Todavía no hay nada dibujado alrededor.', state: { comp: 0, lines: 0, inside: 0 } },
          { text: 'Pones brújulas por todo el plano. Cada una gira hasta que su extremo N (rojo) señala la dirección de $\\vec B$ en ese punto. Fíjate que a la izquierda y a la derecha, sobre el eje, las agujas apuntan en el mismo sentido que el imán, y arriba y abajo apuntan al revés.', state: { comp: 1, lines: 0, inside: 0 } },
          { text: 'Ahora une las agujas con curvas que siempre sean tangentes a ellas: salen del polo N, rodean al imán y entran por el polo S. Esas curvas son las <strong>líneas de campo</strong>.', state: { comp: 1, lines: 1, inside: 0 } },
          { text: 'Quita las brújulas y dibuja también lo que pasa <strong>dentro</strong> del imán: las líneas siguen de S a N. Cada línea queda cerrada: no hay principio ni final.', state: { comp: 0, lines: 1, inside: 1 } }
        ]
      },
      {
        type: 'concept', heading: 'Dos imanes juntos', short: 'Dos imanes',
        body: [
          'Con dos imanes el campo es la <strong>suma vectorial</strong> de los dos, en cada punto. Si enfrentas N con S, las líneas salen del N de un imán y entran directo al S del otro, como si los unieran: se atraen. Si enfrentas N con N, las líneas se empujan una a la otra y se ve una zona de campo débil entre los imanes: se repelen.',
          'Por simetría, en el punto medio entre dos imanes iguales que enfrentan polos iguales, los campos de los dos se cancelan y $\\vec B = 0$. Pruébalo en el lab.'
        ]
      },
      {
        type: 'concept', heading: 'La Tierra es un imán gigante', short: 'La Tierra',
        body: [
          'La Tierra tiene un campo magnético parecido al de un imán de barra enorme, inclinado unos grados respecto al eje de giro. Cerca de la superficie mide entre unos 25 y 65 $\\mu\\text{T}$ según el lugar; en este curso usamos $B_{\\text{Tierra}} \\approx 50\\ \\mu\\text{T} = 0.50\\ \\text{G}$.',
          'Un detalle que confunde: el extremo N de tu brújula apunta al norte geográfico, y el polo N de un imán se <strong>atrae</strong> al polo S de otro. Entonces el polo magnético que está cerca del norte geográfico es, en realidad, un polo <strong>S</strong> del imán terrestre.',
          'Eso no estorba al trabajo con imanes de laboratorio, pero sí al de precisión: la brújula siempre mide el campo <em>total</em>, el del imán más el de la Tierra. Si el imán es débil o la brújula está lejos, manda la Tierra.'
        ],
        diagram: 'f3s01-earth',
        caption: 'El “polo norte magnético” cercano al norte geográfico es un polo S del imán terrestre.'
      },
      {
        type: 'concept', heading: 'Unidades: tesla y gauss', short: 'Tesla y gauss',
        body: [
          'La unidad del SI es el <strong>tesla</strong> (T). Es una unidad grande, así que se usan submúltiplos: el militesla ($1\\ \\text{mT} = 10^{-3}\\ \\text{T}$) y el microtesla ($1\\ \\mu\\text{T} = 10^{-6}\\ \\text{T}$). Se conserva también el <strong>gauss</strong> (G), que sigue apareciendo en geología y navegación: $$1\\ \\text{T} = 10^{4}\\ \\text{G} \\qquad 1\\ \\text{mT} = 10\\ \\text{G} \\qquad 1\\ \\text{G} = 100\\ \\mu\\text{T}$$',
          'Para tener los órdenes de magnitud presentes:',
          '<ul><li>Campo de la Tierra: $\\approx 50\\ \\mu\\text{T} = 0.50\\ \\text{G}$.</li><li>Imán de refrigerador en su superficie: $\\approx 5\\ \\text{mT}$.</li><li>Imán de neodimio, junto a un polo: del orden de $0.1$ a $0.5\\ \\text{T}$.</li><li>Equipo de resonancia magnética: $1.5$ a $3\\ \\text{T}$.</li></ul>'
        ]
      },
      {
        type: 'callout', heading: 'Un adelanto: E contra B',
        body: [
          'Las líneas de $\\vec E$ <strong>nacen en las cargas positivas y mueren en las negativas</strong>; por eso un dipolo eléctrico tiene líneas que van de una carga a la otra. Las líneas de $\\vec B$ no tienen ese punto de partida: se cierran. Esa diferencia es la ley de Gauss del magnetismo, y la vamos a explicar con cuidado en la <a href="../sesion-10/">sesión 10</a>, junto con la pregunta de los monopolos.'
        ],
        diagram: 'f3s01-eb',
        caption: 'Izquierda: campo eléctrico de un dipolo. Derecha: campo magnético de un imán.'
      },
      {
        type: 'recipe', heading: 'Receta: problemas de campo magnético de imanes', short: 'Receta',
        steps: [
          { text: 'Dibuja los imanes con sus polos y marca la dirección de las líneas: salen de N y entran por S.' },
          { text: 'La dirección de $\\vec B$ en un punto es la tangente a la línea de campo, en el sentido de la flecha. El extremo N de una brújula apunta ahí.', tip: 'El extremo N de la aguja apunta hacia el polo S de un imán cercano, no hacia su polo N.' },
          { text: 'Si hay varias fuentes (varios imanes, o un imán y la Tierra), calcula el campo de cada una y <strong>suma como vectores</strong>: por componentes, nunca sumando solo magnitudes.', tip: 'Sumar magnitudes solo vale si los vectores apuntan al mismo lado.' },
          { text: 'Pasa todo a la misma unidad antes de comparar o de sumar: $1\\ \\text{mT} = 10^{3}\\ \\mu\\text{T}$ y $1\\ \\text{mT} = 10\\ \\text{G}$.', tip: 'Mezclar mT con µT cambia el resultado por un factor de mil.' },
          { text: 'Si pide el ángulo, di desde qué referencia lo mides (por ejemplo, desde el norte hacia el este) y revisa el cuadrante con el dibujo.' }
        ]
      },
      {
        type: 'example', heading: 'Imán de refrigerador contra la Tierra',
        problem: '<p>Un imán de refrigerador da $' + fx(e1.magmT, 1) + '\\ \\text{mT}$ en su superficie. El campo de la Tierra en tu ciudad es de $' + fx(e1.earthG, 2) + '\\ \\text{G}$. Pasa los dos a microteslas y di cuántas veces es mayor el del imán.</p>',
        steps: [
          { text: 'Pasa el campo del imán de mT a µT: $1\\ \\text{mT} = 10^{3}\\ \\mu\\text{T}$.', math: 'B_{\\text{imán}} = ' + fx(e1.magmT, 1) + '\\ \\text{mT} = ' + fx(e1.magUT, 0) + '\\ \\mu\\text{T}' },
          { text: 'Pasa el de la Tierra de G a µT: $1\\ \\text{G} = 100\\ \\mu\\text{T}$.', math: 'B_{\\text{Tierra}} = ' + fx(e1.earthG, 2) + '\\ \\text{G} = ' + fx(e1.earthUT, 0) + '\\ \\mu\\text{T}' },
          { text: 'Con las dos en la misma unidad, divide.', math: '\\frac{B_{\\text{imán}}}{B_{\\text{Tierra}}} = \\frac{' + fx(e1.magUT, 0) + '}{' + fx(e1.earthUT, 0) + '} = ' + fx(e1.ratio, 0) }
        ],
        answer: 'El imán da $' + fx(e1.magUT, 0) + '\\ \\mu\\text{T}$, la Tierra $' + fx(e1.earthUT, 0) + '\\ \\mu\\text{T}$: el del imán es unas $' + fx(e1.ratio, 0) + '$ veces mayor.',
        verify: { lab: 'call', mod: 'magnet', fn: 'ratio', args: [e1.magmT, 'mT', e1.earthG, 'G'], values: { ratio: e1.ratio, a_uT: e1.magUT, b_uT: e1.earthUT } }
      },
      {
        type: 'example', heading: 'Brújula con un imán y la Tierra',
        problem: '<p>En el punto donde está una brújula, un imán produce $' + fx(e2.m, 2) + '\\ \\text{mT}$ hacia el <strong>este</strong>, y la Tierra aporta $' + fx(e2.e, 3) + '\\ \\text{mT}$ hacia el <strong>norte</strong>. ¿Cuánto vale el campo total y hacia dónde apunta la aguja, medido desde el norte hacia el este?</p>',
        steps: [
          { text: 'Los dos campos son perpendiculares. Escribe las componentes: este y norte.', math: 'B_E = ' + fx(e2.m, 2) + '\\ \\text{mT} \\qquad B_N = ' + fx(e2.e, 3) + '\\ \\text{mT}' },
          { text: 'La magnitud sale del teorema de Pitágoras.', math: '|\\vec B| = \\sqrt{B_E^{\\,2} + B_N^{\\,2}} = \\sqrt{' + fx(e2.m, 2) + '^2 + ' + fx(e2.e, 3) + '^2} = ' + fx(e2.mag, 4) + '\\ \\text{mT}' },
          { text: 'El ángulo desde el norte hacia el este cumple $\\tan\\theta = B_E/B_N$.', math: '\\theta = \\tan^{-1}\\frac{' + fx(e2.m, 2) + '}{' + fx(e2.e, 3) + '} = ' + fx(e2.bearing, 1) + '^\\circ' },
          { text: 'Comprueba: el imán es 4 veces más fuerte que la Tierra, así que la aguja casi se alinea con el imán (este) y se queda a unos $14^\\circ$ de él.' }
        ],
        answer: '$|\\vec B| = ' + fx(e2.mag, 4) + '\\ \\text{mT}$, a $' + fx(e2.bearing, 1) + '^\\circ$ del norte hacia el este.',
        verify: { lab: 'call', mod: 'magnet', fn: 'combine', args: [[{ mag: e2.e, bearing: 0 }, { mag: e2.m, bearing: 90 }]], values: { mag: e2.mag, bearing: e2.bearing } }
      },
      {
        type: 'example', heading: 'Tres campos sobre la brújula',
        problem: '<p>Sobre una brújula actúan tres campos: la Tierra, $' + fx(e3.earth, 3) + '\\ \\text{mT}$ al norte; un imán $A$, $' + fx(e3.a, 3) + '\\ \\text{mT}$ al este; y un imán $B$, $' + fx(e3.b, 3) + '\\ \\text{mT}$ al sur. ¿Cuánto vale $|\\vec B|$ y hacia dónde apunta la aguja (desde el norte hacia el este)?</p>',
        steps: [
          { text: 'Suma por componentes. Hacia el este solo aporta el imán $A$.', math: 'B_E = ' + fx(e3.east, 3) + '\\ \\text{mT}' },
          { text: 'Hacia el norte, la Tierra suma y el imán $B$ (que apunta al sur) resta.', math: 'B_N = ' + fx(e3.earth, 3) + ' - ' + fx(e3.b, 3) + ' = ' + fx(e3.north, 3) + '\\ \\text{mT}' },
          { text: 'Magnitud y ángulo.', math: '|\\vec B| = \\sqrt{' + fx(e3.east, 3) + '^2 + ' + fx(e3.north, 3) + '^2} = ' + fx(e3.mag, 4) + '\\ \\text{mT} \\qquad \\theta = \\tan^{-1}\\frac{' + fx(e3.east, 3) + '}{' + fx(e3.north, 3) + '} = ' + fx(e3.bearing, 1) + '^\\circ' }
        ],
        answer: '$|\\vec B| = ' + fx(e3.mag, 4) + '\\ \\text{mT}$, a $' + fx(e3.bearing, 1) + '^\\circ$ del norte hacia el este.',
        verify: { lab: 'call', mod: 'magnet', fn: 'combine', args: [[{ mag: e3.earth, bearing: 0 }, { mag: e3.a, bearing: 90 }, { mag: e3.b, bearing: 180 }]], values: { east: e3.east, north: e3.north, mag: e3.mag, bearing: e3.bearing } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué el polo “norte” de un imán es el que apunta al norte?', a: 'Es un nombre histórico: era el extremo “que busca el norte”. Como polos distintos se atraen, ese extremo es atraído por el polo magnético de la Tierra cercano al norte geográfico, que es físicamente un polo S.' },
          { q: '¿El magnetismo atrae a todos los metales?', a: 'No. Solo a los ferromagnéticos (hierro, níquel, cobalto y algunas aleaciones). El aluminio, el cobre, el oro y la plata no son atraídos por un imán común.' },
          { q: '¿Las líneas de campo son el camino que sigue una partícula?', a: 'No. Una línea de campo solo indica la dirección de $\\vec B$ en cada punto. Más adelante verás que la fuerza magnética sobre una carga en movimiento es <em>perpendicular</em> al campo, así que la partícula no sigue la línea.' },
          { q: '¿Hay líneas de campo dentro del imán?', a: 'Sí. Adentro van del polo S al polo N, y por eso cada línea se cierra en un lazo. Por eso un diagrama que las deje terminar en los polos está incompleto.' },
          { q: '¿Cómo es posible que un clip atraiga a otro clip?', a: 'El imán magnetiza al primero (le induce polos), y ese clip magnetizado, a su vez, magnetiza al siguiente. Al retirar el imán, la mayoría pierde casi todo su magnetismo.' },
          { q: '¿Puedo tener un polo N solo?', a: 'Hasta hoy no se ha observado. Si partes un imán, cada pedazo vuelve a tener un N y un S.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Los imanes tienen dos polos: iguales se repelen y distintos se atraen. Los polos no se pueden separar.',
          '$\\vec B$ es un campo vectorial que se mide en teslas; la aguja de una brújula se alinea con $\\vec B$: su extremo N señala la dirección del campo.',
          'Las líneas de campo salen de N, entran por S, nunca se cruzan y se cierran sobre sí mismas.',
          'Los campos de varias fuentes se suman como vectores (por componentes). La Tierra aporta unos $50\\ \\mu\\text{T}$ al norte.',
          '$1\\ \\text{T} = 10^{4}\\ \\text{G}$, $1\\ \\text{mT} = 10^{3}\\ \\mu\\text{T}$.'
        ]
      }
    ],

    lab: {
      type: 'magnetic-field-map', title: 'El campo de los imanes',
      intro: 'Arrastra los imanes y la brújula para ver cómo cambian las líneas de campo y el vector $\\vec B$ en la brújula. Cambia entre uno y dos imanes (atracción y repulsión) y prende el campo de la Tierra. En el reto, el lab te pone una brújula en el eje o en la mediatriz de un imán; predice el ángulo de $\\vec B$ y su magnitud en mT, y el lab te dice si te falta el campo de la Tierra, si tomaste un solo polo o si la aguja quedó al revés.',
      cfg: { preset: 0 }
    },

    formulas: [
      { label: 'Suma de campos', tex: '\\vec B = \\vec B_1 + \\vec B_2 + \\cdots' },
      { label: 'Magnitud (dos perpendiculares)', tex: '|\\vec B| = \\sqrt{B_x^{\\,2} + B_y^{\\,2}}' },
      { label: 'Rumbo desde el norte', tex: '\\tan\\theta = \\frac{B_E}{B_N}' },
      { label: 'Tesla y gauss', tex: '1\\ \\text{T} = 10^{4}\\ \\text{G}' },
      { label: 'Prefijos', tex: '1\\ \\text{mT} = 10^{3}\\ \\mu\\text{T}\\ \\ (=10\\ \\text{G})' },
      { label: 'Campo de la Tierra', tex: 'B_{\\text{Tierra}} \\approx 50\\ \\mu\\text{T} = 0.50\\ \\text{G}' }
    ],

    exercises: [
      {
        id: 'f3-s01-unidades', title: 'Militesla a gauss',
        vars: { B: [0.2, 9.8, 0.2] },
        prompt: function (v) {
          return '<p>Junto al polo de una bocina el campo mide $' + fx(v.B, 1) + '\\ \\text{mT}$. ¿Cuánto es en gauss?</p>';
        },
        check: 'numeric', unit: 'G',
        answer: function (v) { return v.B * 10; },
        mistakes: {
          noFactor: function (v) { return v.B; },
          micro: function (v) { return v.B * 1000; },
          tesla: function (v) { return v.B / 10; }
        },
        feedback: [
          { when: 'noFactor', say: 'Dejaste el número en militesla. Para pasar a gauss: $1\\ \\text{mT} = 10\\ \\text{G}$.' },
          { when: 'micro', say: 'Ese valor está en microteslas. Pasa de mT a gauss con $1\\ \\text{mT} = 10\\ \\text{G}$.' },
          { when: 'tesla', say: 'Dividiste en lugar de multiplicar: $1\\ \\text{mT} = 10\\ \\text{G}$.' }
        ],
        oracle: { lab: 'call', mod: 'magnet', fn: 'convert', args: function (v) { return [v.B, 'mT', 'G']; } },
        hint: 'Pasa a teslas ($1\\ \\text{mT} = 10^{-3}\\ \\text{T}$) y luego a gauss ($1\\ \\text{T} = 10^{4}\\ \\text{G}$).',
        solution: function (v) {
          return '$$B = ' + fx(v.B, 1) + '\\times 10^{-3}\\ \\text{T}\\times\\frac{10^{4}\\ \\text{G}}{1\\ \\text{T}} = ' + fx(v.B * 10, 1) + '\\ \\text{G}$$';
        }
      },
      {
        id: 'f3-s01-cuantas-veces', title: 'Imán contra la Tierra',
        vars: { BE: [30, 60, 5], Bm: [2, 9, 1] },
        prompt: function (v) {
          return '<p>En una ciudad el campo de la Tierra mide $' + v.BE + '\\ \\mu\\text{T}$. Un imán de refrigerador mide $' + v.Bm + '\\ \\text{mT}$ en su superficie. ¿Cuántas veces es mayor el campo del imán?</p>';
        },
        check: 'numeric', unit: '',
        answer: function (v) { return v.Bm * 1000 / v.BE; },
        mistakes: {
          noConvert: function (v) { return v.Bm / v.BE; },
          inverse: function (v) { return v.BE / (v.Bm * 1000); },
          gauss: function (v) { return v.Bm * 10 / v.BE; }
        },
        feedback: [
          { when: 'noConvert', say: 'Dividiste mT entre µT sin convertir. Pasa los dos a la misma unidad: $1\\ \\text{mT} = 10^{3}\\ \\mu\\text{T}$.' },
          { when: 'inverse', say: 'Invertiste el cociente: te piden imán entre Tierra.' },
          { when: 'gauss', say: 'Mezclaste gauss con microteslas. Compara las dos en µT: $1\\ \\text{mT} = 10^{3}\\ \\mu\\text{T}$.' }
        ],
        oracle: { lab: 'call', mod: 'magnet', fn: 'ratio', field: 'ratio', args: function (v) { return [v.Bm, 'mT', v.BE, 'uT']; } },
        hint: 'Pasa el campo del imán a µT y divide entre el de la Tierra.',
        solution: function (v) {
          return '$$\\frac{B_{\\text{imán}}}{B_{\\text{Tierra}}} = \\frac{' + v.Bm + '\\times 10^{3}\\ \\mu\\text{T}}{' + v.BE + '\\ \\mu\\text{T}} = ' + fx(v.Bm * 1000 / v.BE, 1) + '$$';
        }
      },
      {
        id: 'f3-s01-total', title: 'Magnitud del campo total en la brújula',
        vars: { Bm: [20, 150, 10] },
        prompt: function (v) {
          return '<p>En el punto donde está una brújula, un imán produce $' + v.Bm + '\\ \\mu\\text{T}$ hacia el este y la Tierra aporta $50\\ \\mu\\text{T}$ hacia el norte. ¿Cuánto vale $|\\vec B|$ total, en $\\mu\\text{T}$?</p>';
        },
        check: 'numeric', unit: 'µT',
        answer: function (v) { return Math.sqrt(v.Bm * v.Bm + 2500); },
        mistakes: {
          sum: function (v) { return v.Bm + 50; },
          onlyMagnet: function (v) { return v.Bm; },
          diff: function (v) { return Math.abs(v.Bm - 50); }
        },
        feedback: [
          { when: 'sum', say: 'Sumaste magnitudes. Los campos son perpendiculares (este y norte): usa Pitágoras.' },
          { when: 'onlyMagnet', say: 'Olvidaste el campo de la Tierra. La brújula siente la suma de los dos.' },
          { when: 'diff', say: 'Restaste las magnitudes. Como son perpendiculares, no se restan: $|\\vec B| = \\sqrt{B_E^2 + B_N^2}$.' }
        ],
        oracle: { lab: 'call', mod: 'magnet', fn: 'combine', field: 'mag', args: function (v) { return [[{ mag: v.Bm, bearing: 90 }, { mag: 50, bearing: 0 }]]; } },
        hint: 'Los dos campos son perpendiculares: $|\\vec B| = \\sqrt{B_E^2 + B_N^2}$.',
        solution: function (v) {
          return '$$|\\vec B| = \\sqrt{' + v.Bm + '^2 + 50^2} = ' + fx(Math.sqrt(v.Bm * v.Bm + 2500), 1) + '\\ \\mu\\text{T}$$';
        }
      },
      {
        id: 'f3-s01-desviacion', title: 'Cuánto se desvía la aguja del norte',
        vars: { Bm: [20, 150, 10] },
        prompt: function (v) {
          return '<p>Un imán produce $' + v.Bm + '\\ \\mu\\text{T}$ hacia el este en una brújula, y la Tierra $50\\ \\mu\\text{T}$ hacia el norte. ¿Cuántos grados se desvía la aguja del norte hacia el este?</p>';
        },
        check: 'numeric', unit: '°',
        answer: function (v) { return Math.atan(v.Bm / 50) * DEG; },
        mistakes: {
          inverse: function (v) { return Math.atan(50 / v.Bm) * DEG; },
          radians: function (v) { return Math.atan(v.Bm / 50); }
        },
        feedback: [
          { when: 'inverse', say: 'Ese es el ángulo medido desde el este. Desde el norte, la tangente es $B_E/B_N$.' },
          { when: 'radians', say: 'Dejaste el ángulo en radianes. Pasa a grados (calculadora en modo grados).' }
        ],
        where: function (v) { return v.Bm !== 50; },
        oracle: { lab: 'call', mod: 'magnet', fn: 'combine', field: 'bearing', args: function (v) { return [[{ mag: v.Bm, bearing: 90 }, { mag: 50, bearing: 0 }]]; } },
        hint: 'Desde el norte, $\\tan\\theta = B_E/B_N$.',
        solution: function (v) {
          return '$$\\theta = \\tan^{-1}\\frac{' + v.Bm + '}{50} = ' + fx(Math.atan(v.Bm / 50) * DEG, 1) + '^\\circ$$';
        }
      },
      {
        id: 'f3-s01-polos', title: 'Concepto: ¿atracción o repulsión?',
        vars: { k: [0, 2, 1] },
        prompt: function (v) {
          var a = ['polo N con polo S', 'polo N con polo N', 'polo S con polo S'][v.k];
          return '<p>Enfrentas dos imanes de barra, ' + a + '. ¿Qué pasa?</p>';
        },
        check: 'choice',
        options: function (v) {
          var right = v.k === 0 ? 'Se atraen' : 'Se repelen';
          var say = {
            'Se atraen': 'Solo se atraen los polos distintos (N con S). Aquí los polos son iguales.',
            'Se repelen': 'Polos distintos se atraen: N con S no se repelen.',
            'No hay fuerza entre ellos': 'Los imanes sí interactúan sin tocarse, por el campo magnético.'
          };
          return ['Se atraen', 'Se repelen', 'No hay fuerza entre ellos'].map(function (t) { return t === right ? { text: t, correct: true } : { text: t, say: say[t] }; });
        },
        answer: function (v) { return v.k === 0 ? 'Se atraen' : 'Se repelen'; },
        hint: 'Polos iguales se repelen; polos distintos se atraen.',
        solution: function (v) { return v.k === 0 ? 'N con S son polos distintos: <strong>se atraen</strong>.' : 'Son polos iguales: <strong>se repelen</strong>.'; }
      },
      {
        id: 'f3-s01-brujula', title: 'Concepto: hacia dónde apunta la aguja',
        vars: { k: [0, 1, 1] },
        prompt: function (v) {
          return '<p>Una brújula está ' + NEAR[v.k].where + '. ¿Hacia dónde apunta el extremo N de su aguja?</p>';
        },
        check: 'choice',
        options: function (v) {
          var right = NEAR[v.k].right, wrong = NEAR[1 - v.k].right;
          return [
            { text: right, correct: true },
            { text: wrong, say: 'Es al revés: ' + (v.k === 0 ? 'las líneas salen del polo N, así que B se aleja del imán.' : 'las líneas entran por el polo S, así que B apunta hacia el imán.') },
            { text: 'Perpendicular al eje del imán', say: 'Sobre el eje del imán, B es paralelo al eje. Perpendicular sería en la mediatriz con otra fuente.' }
          ];
        },
        answer: function (v) { return NEAR[v.k].right; },
        hint: 'La aguja se alinea con $\\vec B$, y $\\vec B$ sale de N y entra por S.',
        solution: function (v) { return NEAR[v.k].why; }
      },
      {
        id: 'f3-s01-partir', title: 'Concepto: partir un imán',
        vars: { n: [2, 5, 1] },
        prompt: function (v) { return '<p>Partes un imán de barra en ' + v.n + ' pedazos con cortes perpendiculares a su eje. ¿Qué obtienes?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: v.n + ' imanes, cada uno con su polo N y su polo S', correct: true },
            { text: 'Un pedazo con solo polos N y otro con solo polos S', say: 'No existen polos sueltos: en cada corte aparecen un N y un S nuevos.' },
            { text: v.n + ' pedazos sin magnetismo', say: 'Cada pedazo sigue magnetizado: es un imán completo, aunque más débil.' }
          ];
        },
        answer: function (v) { return v.n + ' imanes, cada uno con su polo N y su polo S'; },
        hint: 'Piensa en la regla de los polos: nunca aparecen solos.',
        solution: function (v) { return 'Obtienes <strong>' + v.n + ' imanes completos</strong>: en cada corte nacen un polo N y un polo S nuevos.'; }
      }
    ],

    quiz: { tags: ['f3.S01'], count: 8 },

    errors: [
      'Pensar que se puede aislar un polo N o un polo S partiendo un imán: cada pedazo vuelve a tener los dos.',
      'Creer que el extremo N de la aguja apunta hacia el polo N del imán cercano: apunta hacia su polo S.',
      'Dibujar las líneas de campo terminando en los polos, sin cerrarlas por dentro del imán.',
      'Tomar las líneas de campo como trayectorias de partículas: solo dan la dirección de $\\vec B$.',
      'Olvidar el campo de la Tierra (unos $50\\ \\mu\\text{T}$) cuando el imán es débil o la brújula está lejos.',
      'Sumar solo magnitudes de campos perpendiculares, en lugar de sumar vectores.',
      'Mezclar unidades: $1\\ \\text{mT} = 10^{3}\\ \\mu\\text{T}$ y $1\\ \\text{mT} = 10\\ \\text{G}$.'
    ],

    teacher: {
      plan: [
        'Arranca con dos imanes y limadura de hierro (o un video): atracción, repulsión y las líneas que se dibujan.',
        'Parte un imán (o muestra la animación): que noten que los polos no se separan. Deja claro que “polo” no es una carga.',
        'Usa el explainer para construir las líneas a partir de brújulas, incluida la parte de adentro del imán.',
        'Cierra con el lab: un imán, dos imanes y la Tierra. El reto de la mediatriz introduce la suma de vectores de campo.'
      ],
      check: [
        'Que digan hacia dónde apunta la aguja cerca del polo N y cerca del polo S.',
        'Que dibujen las líneas de un imán cerradas por dentro.',
        'Que sumen dos campos perpendiculares por componentes y den el ángulo desde una referencia clara.'
      ],
      note: 'El teaser de E contra B queda como adelanto: la ley de Gauss del magnetismo y la discusión de monopolos se tratan con cuidado en la sesión 10. Aquí “polo” se usa como etiqueta de los extremos, no como una carga.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §11.1 “Magnetism and Its Historical Discoveries”. <a href="https://openstax.org/books/university-physics-volume-2/pages/11-1-magnetism-and-its-historical-discoveries">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §11.2 “Magnetic Fields and Lines”. <a href="https://openstax.org/books/university-physics-volume-2/pages/11-2-magnetic-fields-and-lines">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: null,
    next: 'sesion-02'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
