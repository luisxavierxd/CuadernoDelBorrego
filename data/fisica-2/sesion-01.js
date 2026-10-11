/* =====================================================================
   Física 2 · S01 · Carga eléctrica (bloque A · Electrostática).
   Fuentes: OpenStax, University Physics Volume 2, §5.1 y §5.2 (CC BY-NC-SA 4.0).
   e = 1.60 × 10⁻¹⁹ C, mₑ = 9.11 × 10⁻³¹ kg, unidades SI.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.induction (lab induction).
   ===================================================================== */
(function () {
  var E = 1.60e-19, ME = 9.11e-31;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  // Notación científica para LaTeX: 3.13 \times 10^{10}
  function sci(x) {
    if (x === 0) return '0';
    var ex = Math.floor(Math.log10(Math.abs(x))), m = x / Math.pow(10, ex);
    if (Math.abs(m) >= 9.995) { m /= 10; ex += 1; }
    return m.toFixed(2) + ' \\times 10^{' + ex + '}';
  }
  function nc(q) { return (q < 0 ? '-' : q > 0 ? '+' : '') + fx(Math.abs(q), 1); }
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

  // Ejemplo 1: globo con −4.8 nC
  var e1 = { Q: -4.8e-9 }; e1.n = Math.abs(e1.Q) / E;
  // Ejemplo 2: frotar PVC con lana; pasan 5.0 × 10¹⁰ electrones
  var e2 = { n: 5.0e10 }; e2.gainer = -e2.n * E; e2.loser = e2.n * E; e2.mass = e2.n * ME;
  // Ejemplo 3: tres esferas idénticas; A toca a B y luego B toca a C (nC)
  var e3 = { a: 6, b: -2, c: 0 };
  e3.ab = (e3.a + e3.b) / 2; e3.bc = (e3.ab + e3.c) / 2; e3.fin = [e3.ab, e3.bc, e3.bc];
  // Ejemplo 4: inducción con barra positiva; con tierra la esfera llega a |Q| = 3.2 nC
  var e4 = { Qg: 3.2e-9 }; e4.Q = -e4.Qg; e4.n = e4.Qg / E;

  var VARIANTS = [
    { steps: ['acercas la barra', 'conectas la esfera a tierra', 'desconectas la tierra', 'retiras la barra'], final: 'opp' },
    { steps: ['acercas la barra', 'conectas la esfera a tierra', 'retiras la barra', 'desconectas la tierra'], final: 'zero', why: 'Retiraste la barra con la tierra conectada: los electrones regresan (o vuelven a subir) y la esfera queda neutra.' },
    { steps: ['acercas la barra', 'retiras la barra (sin conectar nunca la tierra)'], final: 'zero', why: 'Sin tierra no entra ni sale carga: solo se polariza un rato y vuelve a quedar neutra.' },
    { steps: ['conectas la esfera a tierra', 'acercas la barra', 'desconectas la tierra', 'retiras la barra'], final: 'opp' }
  ];
  function seqText(v) {
    return VARIANTS[v.k].steps.map(function (s, i) { return (i + 1) + ') ' + s; }).join(', ');
  }
  function finalSign(v) {
    if (VARIANTS[v.k].final === 'zero') return 'Neutra';
    return v.s === 0 ? 'Negativa' : 'Positiva';                 // s = 0: barra positiva
  }

  var data = window.SESSION_DATA = {
    slug: 'sesion-01', number: '01', group: 'A · Electrostática',
    title: 'Carga eléctrica: cuantización, conservación, conductores, aislantes e inducción', temario: [],
    minutes: 120,
    quote: 'Cargar algo no es fabricar carga: es mover electrones de un lugar a otro. Ni se crean ni se pierden, y siempre vienen en paquetes de $e$.',
    badges: [
      'Explicar por qué dos cargas se atraen o se repelen según su signo.',
      'Pasar de carga a número de electrones con $q = ne$.',
      'Usar la conservación de la carga al frotar y al tocar esferas.',
      'Describir paso a paso la carga por inducción y la polarización.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Toda la materia tiene cargas positivas (protones) y negativas (electrones). Un objeto se <strong>carga</strong> cuando gana o pierde electrones.',
        recall: [
          'Notación científica y prefijos: nano $= 10^{-9}$, micro $= 10^{-6}$ (<a href="../../../fisica-1/sesiones/sesion-01/">Física 1, S01</a>).',
          'Que un átomo tiene un núcleo con protones y neutrones, y electrones alrededor.'
        ],
        why: 'La chispa al tocar una perilla en invierno, las impresoras láser, la pintura en aerosol de los coches y los filtros que limpian el humo de las chimeneas funcionan con estas ideas.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'En un día seco te quitas un suéter y oyes chasquidos; luego tocas la perilla de una puerta y te da un toque. Al rozar la ropa, unos electrones pasaron del suéter a ti. No se crearon: <strong>cambiaron de dueño</strong>.',
          'Frota un globo en tu cabello y acércalo: los pelos se levantan para seguirlo. El globo se llevó electrones del cabello, así que quedó negativo y el cabello positivo. Cargas opuestas se atraen.',
          'Ahora pega ese globo en la pared. La pared no está cargada y aun así lo sostiene. El globo no le pasa carga: solo <strong>acomoda</strong> las cargas que la pared ya tenía. Esa es la idea de toda la sesión: la carga se mueve o se reacomoda, pero el total no cambia.'
        ]
      },
      {
        type: 'concept', heading: 'Dos tipos de carga', short: 'Dos tipos de carga',
        body: [
          'Hay dos tipos de carga, que por costumbre llamamos <strong>positiva</strong> y <strong>negativa</strong>. Los protones del núcleo son positivos y los electrones son negativos.',
          'La regla de oro: <strong>cargas iguales se repelen y cargas opuestas se atraen</strong>. Un objeto con tantos protones como electrones es <strong>neutro</strong>: sus efectos se cancelan.',
          'La carga se mide en <strong>coulombs</strong> (C). Un coulomb es muchísimo; en la vida diaria verás nanocoulombs ($1\\ \\text{nC} = 10^{-9}\\ \\text{C}$) y microcoulombs ($1\\ \\mu\\text{C} = 10^{-6}\\ \\text{C}$).'
        ],
        diagram: 'f2s01-charges',
        caption: 'Las flechas son las fuerzas sobre cada carga: hacia afuera si se repelen, hacia la otra si se atraen.'
      },
      {
        type: 'concept', heading: 'La carga viene en paquetes', short: 'Cuantización',
        body: [
          'Los electrones no se parten: un objeto gana o pierde electrones completos. Por eso cualquier carga es un número entero de veces la <strong>carga elemental</strong>: $$q = n\\,e \\qquad e = 1.60 \\times 10^{-19}\\ \\text{C}$$',
          'A esto se le llama <strong>cuantización</strong>. Si un objeto tiene carga negativa, le <em>sobran</em> $n$ electrones; si es positiva, le <em>faltan</em> $n$ electrones. En ambos casos $n = |q|/e$.',
          '¿Por qué en la vida diaria la carga parece continua? Porque $n$ es enorme: un solo nanocoulomb son $6.25 \\times 10^{9}$ electrones. Un electrón de más o de menos ni se nota.'
        ]
      },
      {
        type: 'concept', heading: 'La carga se conserva', short: 'Conservación',
        body: [
          'La carga total de un sistema aislado <strong>no cambia</strong>. Al frotar dos materiales, los electrones que pierde uno los gana el otro: si uno queda con $+Q$, el otro queda con $-Q$.',
          'Al frotar, ¿quién se queda con los electrones? Depende de los materiales. El vidrio frotado con seda queda positivo; el globo, el hule y el PVC frotados con lana o cabello quedan negativos (ganan electrones).',
          'Ganar electrones también agrega masa, aunque muy poca: cada electrón tiene $m_e = 9.11 \\times 10^{-31}\\ \\text{kg}$.'
        ],
        diagram: 'f2s01-rubbing',
        caption: 'Antes y después de frotar hay el mismo número de cargas en total. Solo pasaron dos electrones de la lana al globo.'
      },
      {
        type: 'concept', heading: 'Conductores y aislantes', short: 'Conductores y aislantes',
        body: [
          'En un <strong>conductor</strong> (metales, el agua con sal, tu cuerpo) algunos electrones están libres y viajan por todo el material. Si le pones carga, se reparte enseguida por toda su superficie, porque las cargas iguales se alejan unas de otras lo más que pueden.',
          'En un <strong>aislante</strong> (plástico, vidrio, hule, madera seca) los electrones están amarrados a sus átomos. La carga se queda donde la pusiste: por eso solo la punta frotada de una regla atrae papelitos.',
          'La <strong>tierra</strong> es un conductor enorme. Conectar algo a tierra le da un camino para que entren o salgan electrones sin que la tierra cambie de forma apreciable.'
        ],
        diagram: 'f2s01-materials',
        caption: 'En el metal la carga se reparte; en el plástico se queda en la punta frotada.'
      },
      {
        type: 'explainer', heading: 'Carga por contacto', short: 'Carga por contacto',
        title: 'Dos esferas metálicas idénticas se tocan',
        intro: 'Cuando dos conductores se tocan, los electrones pasan de uno a otro hasta que quedan en equilibrio. Si las esferas son <strong>idénticas</strong>, se reparten la carga total a partes iguales.',
        diagram: 'f2s01-contact',
        steps: [
          { text: 'Antes: $A$ tiene $+6\\ \\text{nC}$ (le faltan electrones) y $B$ tiene $-2\\ \\text{nC}$ (le sobran).', state: { t: 0 } },
          { text: 'Se tocan: forman un solo conductor con carga total $+6 - 2 = +4\\ \\text{nC}$. Pasan electrones de $B$ a $A$.', state: { t: 1 } },
          { text: 'Se separan: como son idénticas, cada una se queda con la mitad, $\\frac{q_1 + q_2}{2} = +2\\ \\text{nC}$. El total sigue siendo $+4\\ \\text{nC}$.', state: { t: 2 } }
        ]
      },
      {
        type: 'explainer', heading: 'Carga por inducción, paso a paso', short: 'Inducción',
        title: 'Cargar una esfera sin tocarla',
        intro: 'Con una barra cargada puedes dejar cargada una esfera de metal <strong>sin tocarla</strong>. El truco es darle a los electrones un camino (la tierra) y cerrarlo en el momento justo.',
        diagram: 'f2s01-induction',
        steps: [
          { text: 'La esfera de metal está neutra: tiene tantos protones como electrones.', state: { rod: 0, pol: 0, g: 0, q: 0, out: 0, flow: 0, cap: 'esfera de metal neutra' } },
          { text: 'Acercas una barra positiva (sin tocar). Atrae a los electrones libres al lado cercano y deja el lado lejano positivo: la esfera se <strong>polariza</strong>, pero sigue neutra.', state: { rod: 1, pol: 1, cap: 'acercas la barra: se polariza' } },
          { text: 'Conectas la esfera a tierra. La barra sigue atrayendo electrones, así que <strong>suben electrones</strong> desde la tierra y neutralizan el lado positivo.', state: { g: 1, q: 1, flow: 1, cap: 'conectas a tierra: suben electrones' } },
          { text: 'Desconectas la tierra <strong>con la barra todavía cerca</strong>. Los electrones que subieron ya no pueden regresar.', state: { g: 0, flow: 0, cap: 'desconectas: quedan atrapados' } },
          { text: 'Retiras la barra. Los electrones de más se reparten por toda la superficie: la esfera queda <strong>negativa</strong>, con signo opuesto al de la barra.', state: { rod: 0, pol: 0, out: 1, cap: 'retiras la barra: queda negativa' } }
        ]
      },
      {
        type: 'callout', heading: 'El orden importa',
        body: [
          'Si retiras la barra <strong>antes</strong> de desconectar la tierra, los electrones que subieron regresan a la tierra y la esfera queda neutra.',
          'Con una barra negativa todo se invierte: la barra empuja electrones hacia la tierra y la esfera termina <strong>positiva</strong>. En la inducción, la carga final siempre es opuesta a la de la barra.'
        ]
      },
      {
        type: 'concept', heading: 'Polarización: por qué el globo se pega a la pared', short: 'Polarización',
        body: [
          'En un aislante los electrones no pueden viajar, pero sí pueden moverse un poquito dentro de cada átomo o molécula. Cerca de un globo negativo, cada molécula de la pared se estira: su lado positivo queda hacia el globo y su lado negativo hacia atrás. Decimos que la pared se <strong>polariza</strong>.',
          'La pared sigue neutra, pero sus cargas positivas quedan un poco <strong>más cerca</strong> del globo que las negativas. Como la fuerza eléctrica es mayor a menor distancia, gana la atracción y el globo se queda pegado.',
          'Por lo mismo una regla frotada levanta papelitos y un peine cargado desvía un chorro delgado de agua.'
        ],
        diagram: 'f2s01-polarization',
        caption: 'La pared no está cargada: solo se reacomodan sus cargas. El lado + de cada molécula queda más cerca del globo.'
      },
      {
        type: 'recipe', heading: 'Receta: problemas de carga', short: 'Receta',
        steps: [
          { text: 'Identifica qué te piden: contar electrones, repartir carga al tocar, usar la conservación al frotar o seguir una secuencia de inducción.' },
          { text: 'Pasa todas las cargas a coulombs: $1\\ \\text{nC} = 10^{-9}\\ \\text{C}$ y $1\\ \\mu\\text{C} = 10^{-6}\\ \\text{C}$.', tip: 'Olvidar el prefijo cambia la respuesta por un factor de mil millones.' },
          { text: 'Para contar electrones divide entre la carga elemental: $n = |q|/e$. El signo te dice si sobran (−) o faltan (+).', tip: 'Se divide entre $e$, no se multiplica. El resultado es un número enorme, sin unidades.' },
          { text: 'Si se tocan esferas idénticas, cada contacto deja a las dos con $\\frac{q_1 + q_2}{2}$. Lleva una tabla con la carga de cada esfera después de cada contacto.', tip: 'Usa la carga que tiene cada esfera en ese momento, no la del principio.' },
          { text: 'En inducción, sigue a los electrones: ¿quién los atrae o los empuja?, ¿tienen camino a tierra?, ¿cuándo se cierra el camino? La esfera queda con signo opuesto al de la barra solo si desconectas la tierra antes de retirar la barra.' }
        ]
      },
      {
        type: 'example', heading: 'Contar electrones',
        problem: '<p>Después de frotarlo, un globo tiene una carga de $' + fx(e1.Q * 1e9, 1) + '\\ \\text{nC}$. ¿Le sobran o le faltan electrones, y cuántos? Usa $e = 1.60 \\times 10^{-19}\\ \\text{C}$.</p>',
        steps: [
          { text: 'La carga es negativa: al globo le <strong>sobran</strong> electrones.' },
          { text: 'Pasa la carga a coulombs.', math: 'Q = ' + fx(e1.Q * 1e9, 1) + '\\ \\text{nC} = ' + fx(e1.Q * 1e9, 1) + ' \\times 10^{-9}\\ \\text{C}' },
          { text: 'Divide entre la carga de un electrón.', math: 'n = \\frac{|Q|}{e} = \\frac{' + fx(Math.abs(e1.Q) * 1e9, 1) + ' \\times 10^{-9}}{1.60 \\times 10^{-19}} = ' + sci(e1.n) }
        ],
        answer: 'Le sobran $' + sci(e1.n) + '$ electrones.',
        verify: { lab: 'call', mod: 'induction', fn: 'count', args: [e1.Q], value: e1.n }
      },
      {
        type: 'example', heading: 'Frotar: lo que uno pierde, el otro lo gana',
        problem: '<p>Frotas un tubo de PVC con un trapo de lana y pasan $' + sci(e2.n) + '$ electrones de la lana al tubo. ¿Con qué carga queda cada uno? ¿Cuánta masa ganó el tubo? Usa $e = 1.60 \\times 10^{-19}\\ \\text{C}$ y $m_e = 9.11 \\times 10^{-31}\\ \\text{kg}$.</p>',
        steps: [
          { text: 'El tubo gana electrones: queda negativo.', math: 'Q_{\\text{tubo}} = -n\\,e = -(' + sci(e2.n) + ')(1.60 \\times 10^{-19}) = ' + sci(e2.gainer) + '\\ \\text{C} = ' + fx(e2.gainer * 1e9, 1) + '\\ \\text{nC}' },
          { text: 'La carga se conserva: la lana perdió esos mismos electrones y queda con la carga opuesta.', math: 'Q_{\\text{lana}} = +' + fx(e2.loser * 1e9, 1) + '\\ \\text{nC} \\qquad Q_{\\text{tubo}} + Q_{\\text{lana}} = 0' },
          { text: 'La masa que ganó el tubo es la de esos electrones.', math: '\\Delta m = n\\,m_e = (' + sci(e2.n) + ')(9.11 \\times 10^{-31}) = ' + sci(e2.mass) + '\\ \\text{kg}' }
        ],
        answer: 'Tubo: $' + fx(e2.gainer * 1e9, 1) + '\\ \\text{nC}$; lana: $+' + fx(e2.loser * 1e9, 1) + '\\ \\text{nC}$. El tubo ganó apenas $' + sci(e2.mass) + '\\ \\text{kg}$.',
        verify: { lab: 'call', mod: 'induction', fn: 'rub', args: [e2.n], values: { gainer: e2.gainer, loser: e2.loser, mass: e2.mass } }
      },
      {
        type: 'example', heading: 'Tres esferas que se tocan',
        problem: '<p>Tres esferas metálicas idénticas tienen $q_A = +' + e3.a + '\\ \\text{nC}$, $q_B = ' + e3.b + '\\ \\text{nC}$ y $q_C = 0$. Primero $A$ toca a $B$ y se separan; luego $B$ toca a $C$ y se separan. ¿Con qué carga queda cada una?</p>',
        steps: [
          { text: '$A$ toca a $B$: se reparten su total.', math: 'q_A = q_B = \\frac{' + e3.a + ' + (' + e3.b + ')}{2} = ' + nc(e3.ab) + '\\ \\text{nC}' },
          { text: '$B$ (que ahora tiene ' + nc(e3.ab) + ' nC) toca a $C$.', math: 'q_B = q_C = \\frac{' + fx(e3.ab, 1) + ' + 0}{2} = ' + nc(e3.bc) + '\\ \\text{nC}' },
          { text: 'Comprueba la conservación: la suma final debe ser la inicial.', math: fx(e3.fin[0], 1) + ' + ' + fx(e3.fin[1], 1) + ' + ' + fx(e3.fin[2], 1) + ' = ' + fx(e3.a + e3.b + e3.c, 1) + '\\ \\text{nC}' }
        ],
        answer: '$q_A = ' + nc(e3.fin[0]) + '\\ \\text{nC}$, $q_B = ' + nc(e3.fin[1]) + '\\ \\text{nC}$ y $q_C = ' + nc(e3.fin[2]) + '\\ \\text{nC}$.',
        verify: { lab: 'call', mod: 'induction', fn: 'contactSeq', args: [[e3.a, e3.b, e3.c], [[0, 1], [1, 2]]], value: e3.fin }
      },
      {
        type: 'example', heading: 'Inducción: signo y número de electrones',
        problem: '<p>Acercas una barra <strong>positiva</strong> a una esfera de metal neutra y conectas la esfera a tierra; un medidor indica que la esfera llega a $|Q| = ' + fx(e4.Qg * 1e9, 1) + '\\ \\text{nC}$. Desconectas la tierra y después retiras la barra. ¿Con qué signo queda la esfera y cuántos electrones le sobran o le faltan? Usa $e = 1.60 \\times 10^{-19}\\ \\text{C}$.</p>',
        steps: [
          { text: 'La barra positiva atrae electrones. Con la tierra conectada, <strong>suben</strong> electrones desde la tierra.' },
          { text: 'Desconectas la tierra con la barra cerca: esos electrones quedan atrapados. Al retirar la barra se reparten, y la esfera queda <strong>negativa</strong>.', math: 'Q = -' + fx(e4.Qg * 1e9, 1) + '\\ \\text{nC}' },
          { text: 'Cuenta los electrones de más.', math: 'n = \\frac{|Q|}{e} = \\frac{' + fx(e4.Qg * 1e9, 1) + ' \\times 10^{-9}}{1.60 \\times 10^{-19}} = ' + sci(e4.n) }
        ],
        answer: 'Queda negativa, con $' + sci(e4.n) + '$ electrones de más.',
        verify: { lab: 'call', mod: 'induction', fn: 'sequence', args: [{ q0: 0, qRod: 9.6e-9, a: 0.1, d: 0.3, steps: ['near', 'ground', 'unground', 'remove'] }], values: { Q: e4.Q, n: e4.n } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Un objeto neutro no tiene cargas?', a: 'Sí tiene, y muchísimas: tantos protones como electrones. Neutro quiere decir que se cancelan, no que no haya.' },
          { q: '¿Por qué siempre se mueven los electrones y no los protones?', a: 'Los protones están amarrados en el núcleo y son casi 2000 veces más pesados. Los que cambian de lugar al frotar, tocar o conectar a tierra son los electrones. Un objeto positivo no ganó protones: perdió electrones.' },
          { q: '¿Qué hace exactamente la tierra?', a: 'Es una reserva enorme de electrones. Puede dar o recibir los que haga falta sin cargarse de forma apreciable.' },
          { q: 'En la inducción, ¿por qué la carga final es opuesta a la de la barra?', a: 'Porque la barra atrae a las cargas de signo contrario y aleja (hacia la tierra) a las del mismo signo. Lo que queda atrapado al desconectar es lo que la barra atrajo.' },
          { q: 'Si la pared es neutra, ¿por qué atrae al globo?', a: 'Porque se polariza: el lado de cada molécula con signo contrario al del globo queda más cerca que el otro, y la fuerza eléctrica crece al acercarse.' },
          { q: '¿Puede un objeto tener una carga de $0.5\\,e$?', a: 'No. Las cargas que se pueden aislar siempre son múltiplos enteros de $e$. Si te sale un número de electrones con decimales, revisa tus cuentas.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Cargas iguales se repelen y opuestas se atraen; lo que se mueve son los electrones.',
          'La carga viene en paquetes: $q = ne$ con $e = 1.60 \\times 10^{-19}\\ \\text{C}$.',
          'La carga total se conserva: al frotar o tocar, lo que uno pierde el otro lo gana.',
          'Inducción: polarizar, conectar a tierra, desconectar y retirar la barra deja carga opuesta a la de la barra.'
        ]
      }
    ],

    lab: {
      type: 'induction', title: 'Inducción y polarización',
      intro: 'Acerca y aleja la barra, cambia su signo y conecta la esfera a tierra para ver cómo se acomodan las cargas. En el reto, predice el signo final y cuántos electrones le sobran o le faltan a la esfera; el lab reproduce la secuencia y te dice si invertiste el signo, si olvidaste la tierra o si confundiste la carga con el número de electrones. Cambia el material a aislante para ver moléculas que giran sin que entre ni salga carga.',
      cfg: { start: { q: 8, d: 15 } }
    },

    formulas: [
      { label: 'Cuantización', tex: 'q = n\\,e' },
      { label: 'Carga elemental', tex: 'e = 1.60 \\times 10^{-19}\\ \\text{C}' },
      { label: 'Número de electrones', tex: 'n = \\frac{|q|}{e}' },
      { label: 'Conservación', tex: '\\textstyle\\sum q_{\\text{antes}} = \\sum q_{\\text{después}}' },
      { label: 'Contacto (esferas idénticas)', tex: 'q_1\' = q_2\' = \\frac{q_1 + q_2}{2}' },
      { label: 'Masa del electrón', tex: 'm_e = 9.11 \\times 10^{-31}\\ \\text{kg}' },
      { label: 'Prefijos', tex: '1\\ \\text{nC} = 10^{-9}\\ \\text{C},\\ \\ 1\\ \\mu\\text{C} = 10^{-6}\\ \\text{C}' }
    ],

    exercises: [
      {
        id: 'f2-s01-electrones', title: 'Electrones de más o de menos',
        vars: { Q: [1, 9.8, 0.2], neg: [0, 1, 1] },
        prompt: function (v) {
          return '<p>Una esfera tiene una carga de $' + (v.neg ? '-' : '+') + fx(v.Q, 1) + '\\ \\text{nC}$. ¿Cuántos electrones le ' + (v.neg ? 'sobran' : 'faltan') + '? Usa $e = 1.60 \\times 10^{-19}\\ \\text{C}$.</p>';
        },
        check: 'numeric', unit: 'electrones',
        answer: function (v) { return v.Q * 1e-9 / E; },
        mistakes: {
          noPrefix: function (v) { return v.Q / E; },
          micro: function (v) { return v.Q * 1e-6 / E; },
          timesE: function (v) { return v.Q * 1e-9 * E; }
        },
        feedback: [
          { when: 'noPrefix', say: 'Te faltó el prefijo: $1\\ \\text{nC} = 10^{-9}\\ \\text{C}$.' },
          { when: 'micro', say: 'Usaste micro ($10^{-6}$); la carga está en nanocoulombs ($10^{-9}$).' },
          { when: 'timesE', say: 'Multiplicaste por $e$. Para contar electrones se divide: $n = |Q|/e$.' }
        ],
        oracle: { lab: 'call', mod: 'induction', fn: 'count', args: function (v) { return [(v.neg ? -1 : 1) * v.Q * 1e-9]; } },
        hint: 'Pasa la carga a coulombs y divide entre la carga de un electrón: $n = |Q|/e$.',
        solution: function (v) {
          return '$$n = \\frac{|Q|}{e} = \\frac{' + fx(v.Q, 1) + ' \\times 10^{-9}\\ \\text{C}}{1.60 \\times 10^{-19}\\ \\text{C}} = ' + sci(v.Q * 1e-9 / E) + '$$ Le ' + (v.neg ? 'sobran' : 'faltan') + ' esos electrones.';
        }
      },
      {
        id: 'f2-s01-contacto', title: 'Tres esferas en secuencia',
        vars: { a: [2, 12, 1], b: [-9, -1, 1], c: [1, 6, 1] },
        prompt: function (v) {
          return '<p>Tres esferas metálicas idénticas tienen $q_A = +' + v.a + '\\ \\text{nC}$, $q_B = ' + v.b + '\\ \\text{nC}$ y $q_C = +' + v.c + '\\ \\text{nC}$. $A$ toca a $B$ y se separan; después $B$ toca a $C$ y se separan. ¿Qué carga tiene al final $C$, en nC?</p>';
        },
        check: 'numeric', unit: 'nC',
        answer: function (v) { return ((v.a + v.b) / 2 + v.c) / 2; },
        mistakes: {
          allThree: function (v) { return (v.a + v.b + v.c) / 3; },
          noHalf: function (v) { return (v.a + v.b) / 2 + v.c; },
          initialB: function (v) { return (v.b + v.c) / 2; }
        },
        feedback: [
          { when: 'allThree', say: 'Repartiste entre las tres, pero nunca se tocaron las tres a la vez. Ve contacto por contacto.' },
          { when: 'noHalf', say: 'En el segundo contacto también se reparte: $B$ y $C$ se quedan con la mitad de su suma.' },
          { when: 'initialB', say: 'Cuando $B$ toca a $C$, $B$ ya no tiene su carga inicial: tiene lo que le dejó el contacto con $A$.' }
        ],
        oracle: { lab: 'call', mod: 'induction', fn: 'contactSeq', field: '2', args: function (v) { return [[v.a, v.b, v.c], [[0, 1], [1, 2]]]; } },
        hint: 'Primero $q_B = \\frac{q_A + q_B}{2}$; luego usa ese valor en el contacto de $B$ con $C$.',
        solution: function (v) {
          var ab = (v.a + v.b) / 2;
          return '$$q_B = \\frac{' + v.a + ' + (' + v.b + ')}{2} = ' + fx(ab, 2) + '\\ \\text{nC} \\qquad q_C = \\frac{' + fx(ab, 2) + ' + ' + v.c + '}{2} = ' + fx((ab + v.c) / 2, 2) + '\\ \\text{nC}$$';
        }
      },
      {
        id: 'f2-s01-frotar', title: 'Conservación al frotar',
        vars: { n: [1.5, 9.5, 0.5], k: [9, 11, 1] },
        prompt: function (v) {
          return '<p>Al frotar un tubo de PVC con un trapo de lana pasan $' + fx(v.n, 1) + ' \\times 10^{' + v.k + '}$ electrones de la lana al tubo. ¿Qué carga queda en la <strong>lana</strong>, en nC (con su signo)? Usa $e = 1.60 \\times 10^{-19}\\ \\text{C}$.</p>';
        },
        check: 'numeric', unit: 'nC',
        answer: function (v) { return v.n * Math.pow(10, v.k) * E * 1e9; },
        mistakes: {
          signFlip: function (v) { return -v.n * Math.pow(10, v.k) * E * 1e9; },
          coulombs: function (v) { return v.n * Math.pow(10, v.k) * E; }
        },
        feedback: [
          { when: 'signFlip', say: 'Esa es la carga del tubo. La lana <em>perdió</em> electrones, así que queda positiva.' },
          { when: 'coulombs', say: 'Ese valor está en coulombs. Pásalo a nanocoulombs: multiplica por $10^{9}$.' }
        ],
        // Por conservación: la lana queda con lo contrario de lo que ganó el tubo.
        oracle: { lab: 'value', value: function (v) { var tubo = -(v.n * Math.pow(10, v.k)) * 1.60e-19; return (0 - tubo) / 1e-9; } },
        hint: 'La carga del tubo es $-ne$; la carga total se conserva y era cero.',
        solution: function (v) {
          var q = v.n * Math.pow(10, v.k) * E;
          return '$$Q_{\\text{lana}} = +n\\,e = (' + fx(v.n, 1) + ' \\times 10^{' + v.k + '})(1.60 \\times 10^{-19}) = ' + sci(q) + '\\ \\text{C} = +' + fx(q * 1e9, 2) + '\\ \\text{nC}$$';
        }
      },
      {
        id: 'f2-s01-masa', title: 'La masa de la carga',
        vars: { Q: [1, 9, 0.5] },
        prompt: function (v) {
          return '<p>Una esfera neutra recibe electrones hasta quedar con $-' + fx(v.Q, 1) + '\\ \\mu\\text{C}$. ¿Cuánta masa ganó, en kg? Usa $e = 1.60 \\times 10^{-19}\\ \\text{C}$ y $m_e = 9.11 \\times 10^{-31}\\ \\text{kg}$.</p>';
        },
        // withinTol pone un piso de 1e-9 a la tolerancia relativa; con masas de 1e-17 kg hace falta una absoluta.
        check: 'numeric', unit: 'kg', tol: { abs: 5e-20 },
        answer: function (v) { return v.Q * 1e-6 * ME / E; },
        mistakes: {
          protonMass: function (v) { return v.Q * 1e-6 * 1.67e-27 / E; },
          noPrefix: function (v) { return v.Q * ME / E; },
          nano: function (v) { return v.Q * 1e-9 * ME / E; }
        },
        feedback: [
          { when: 'protonMass', say: 'Usaste la masa del protón. Lo que ganó la esfera son electrones: $m_e = 9.11 \\times 10^{-31}\\ \\text{kg}$.' },
          { when: 'noPrefix', say: 'Te faltó el prefijo: $1\\ \\mu\\text{C} = 10^{-6}\\ \\text{C}$.' },
          { when: 'nano', say: 'Usaste nano ($10^{-9}$); la carga está en microcoulombs ($10^{-6}$).' }
        ],
        oracle: { lab: 'call', mod: 'induction', fn: 'massGain', args: function (v) { return [v.Q * 1e-6 / 1.60e-19]; } },
        hint: 'Primero cuenta los electrones con $n = |Q|/e$; luego multiplica por la masa de uno.',
        solution: function (v) {
          var n = v.Q * 1e-6 / E;
          return '$$n = \\frac{' + fx(v.Q, 1) + ' \\times 10^{-6}}{1.60 \\times 10^{-19}} = ' + sci(n) + ' \\qquad \\Delta m = n\\,m_e = ' + sci(n * ME) + '\\ \\text{kg}$$';
        }
      },
      {
        id: 'f2-s01-induccion', title: 'Concepto: ¿qué carga queda?',
        vars: { s: [0, 1, 1], k: [0, 3, 1] },
        prompt: function (v) {
          return '<p>Tienes una esfera de metal neutra y una barra ' + (v.s === 0 ? 'positiva' : 'negativa') + '. Haces esto, en orden: ' + seqText(v) + '. ¿Con qué carga termina la esfera?</p>';
        },
        check: 'choice',
        options: function (v) {
          var right = finalSign(v), rodSign = v.s === 0 ? 'Positiva' : 'Negativa';
          var say = { Neutra: 'Con la barra cerca y la tierra conectada sí pasaron electrones, y al desconectar la tierra antes de retirar la barra quedaron atrapados.' };
          ['Positiva', 'Negativa'].forEach(function (t) {
            say[t] = right === 'Neutra' ? VARIANTS[v.k].why
              : t === rodSign ? 'Ese es el signo de la barra. Lo que se queda atrapado es lo que la barra atrajo: carga opuesta.' : '';
          });
          return ['Positiva', 'Negativa', 'Neutra'].map(function (t) { return t === right ? { text: t, correct: true } : { text: t, say: say[t] }; });
        },
        answer: function (v) { return finalSign(v); },
        hint: 'Sigue a los electrones: ¿pudieron entrar o salir por la tierra?, ¿podían regresar cuando retiraste la barra?',
        solution: function (v) {
          if (VARIANTS[v.k].final === 'zero') return 'Termina <strong>neutra</strong>. ' + VARIANTS[v.k].why;
          return 'Termina <strong>' + finalSign(v).toLowerCase() + '</strong>: con la tierra conectada, la barra ' + (v.s === 0 ? 'atrajo electrones desde la tierra' : 'empujó electrones hacia la tierra') + ', y al desconectar la tierra antes de retirar la barra ese cambio quedó atrapado. La carga final es opuesta a la de la barra.';
        }
      },
      {
        id: 'f2-s01-cuantizada', title: 'Concepto: ¿qué carga es posible?',
        vars: { m: [2, 5, 1] },
        prompt: function () { return '<p>Con $e = 1.60 \\times 10^{-19}\\ \\text{C}$, ¿cuál de estas cargas puede tener un objeto aislado?</p>'; },
        check: 'choice',
        options: function (v) {
          var t = function (k) { return '$' + fx(k * 1.6, 1) + ' \\times 10^{-19}\\ \\text{C}$'; };
          return [
            { text: t(v.m), correct: true },
            { text: t(v.m - 0.5), say: 'Equivale a $' + fx(v.m - 0.5, 1) + 'e$: no es un número entero de electrones.' },
            { text: t(v.m + 0.5), say: 'Equivale a $' + fx(v.m + 0.5, 1) + 'e$: no es un número entero de electrones.' },
            { text: t(v.m === 2 ? 3.25 : 0.5), say: 'Equivale a $' + (v.m === 2 ? '3.25' : '0.5') + 'e$: los electrones no se parten.' }
          ];
        },
        answer: function (v) { return '$' + fx(v.m * 1.6, 1) + ' \\times 10^{-19}\\ \\text{C}$'; },
        hint: 'Divide cada carga entre $e$ y busca la que dé un número entero.',
        solution: function (v) { return '$\\frac{' + fx(v.m * 1.6, 1) + ' \\times 10^{-19}}{1.60 \\times 10^{-19}} = ' + v.m + '$: son ' + v.m + ' electrones completos. Las demás dan números con decimales.'; }
      }
    ],

    quiz: { tags: ['f2.S01'], count: 8 },

    errors: [
      'Olvidar el prefijo: $1\\ \\text{nC} = 10^{-9}\\ \\text{C}$ y $1\\ \\mu\\text{C} = 10^{-6}\\ \\text{C}$.',
      'Multiplicar por $e$ en lugar de dividir al contar electrones: $n = |q|/e$.',
      'Pensar que un objeto positivo ganó protones: perdió electrones.',
      'En una secuencia de contactos, usar la carga inicial de una esfera en lugar de la que tiene en ese momento.',
      'Repartir entre tres esferas cuando solo se tocaron de dos en dos.',
      'En la inducción, dar a la esfera el mismo signo que la barra, o retirar la barra antes de desconectar la tierra y esperar que quede cargada.',
      'Creer que la pared atrae al globo porque está cargada: solo está polarizada.'
    ],

    teacher: {
      plan: [
        'Arranca con el globo y el cabello o una regla y papelitos: que vean atracción y repulsión antes de cualquier fórmula.',
        'Cuantización con números: cuántos electrones hay en 1 nC. Que noten por qué la carga parece continua.',
        'Contacto con la tabla de cargas paso a paso; luego el explainer de inducción y el lab con el ejemplo cargado (signo invertido).',
        'Cierra con la polarización: globo en la pared.'
      ],
      check: [
        'Que digan qué se mueve (electrones) en cada situación.',
        'Que comprueben la conservación sumando las cargas antes y después.',
        'Que expliquen por qué importa el orden en la inducción.'
      ],
      note: 'La «serie triboeléctrica» depende de la humedad y del estado de las superficies; basta con los ejemplos típicos (vidrio con seda, globo con cabello, PVC con lana).'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §5.1 “Electric Charge”. <a href="https://openstax.org/books/university-physics-volume-2/pages/5-1-electric-charge">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §5.2 “Conductors, Insulators, and Charging by Induction”. <a href="https://openstax.org/books/university-physics-volume-2/pages/5-2-conductors-insulators-and-charging-by-induction">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: null,
    next: 'sesion-02'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
