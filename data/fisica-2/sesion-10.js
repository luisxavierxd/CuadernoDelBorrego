/* =====================================================================
   Física 2 · S10 · Capacitores en serie y en paralelo y energía almacenada
   (bloque B · Gauss y capacitores).
   Fuente: OpenStax, University Physics Volume 2, §8.2 y §8.3 (CC BY-NC-SA 4.0).
   Unidades de trabajo: C en μF, V en volts → Q en μC y U en μJ.
   Las cuentas se hacen aquí con fórmulas propias; scripts/examples.test.js las
   compara contra LabMath.capnet (lab capacitor-network) y los oráculos de los
   ejercicios usan el solver nodal (LabMath.capnet.nodal), no la reducción.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function L(id, c) { return { id: id, c: c }; }
  function Sr() { return { t: 's', k: Array.prototype.slice.call(arguments) }; }
  function Pl() { return { t: 'p', k: Array.prototype.slice.call(arguments) }; }
  function ser2(a, b) { return a * b / (a + b); }
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
  // Oráculo independiente: potenciales por el solver nodal (terminal a = V, b = 0).
  function nodal(tree, V) {
    var N = window.LabMath.capnet, g = N.graph(tree), pot = N.nodal({ nodes: g.nodes, branches: g.branches, fixed: { a: V, b: 0 } }), out = { Q: 0, parts: {} };
    g.branches.forEach(function (br) {
      var dv = pot[br.a] - pot[br.b];
      out.parts[br.id] = { Q: br.value * dv, V: dv, U: 0.5 * br.value * dv * dv };
      if (br.a === 'a') out.Q += br.value * dv;
    });
    return out;
  }
  // Red mixta de los ejercicios: (C1 ∥ C2) en serie con C3.
  function mix(v) { return Sr(Pl(L('C1', v.a), L('C2', v.b)), L('C3', v.c)); }
  function mixEq(v) { return (v.a + v.b) * v.c / (v.a + v.b + v.c); }

  // Ejemplo 1: serie de 6 y 3 μF con 12 V.
  var e1 = { a: 6, b: 3, V: 12 }; e1.C = ser2(e1.a, e1.b); e1.Q = e1.C * e1.V; e1.V1 = e1.Q / e1.a; e1.V2 = e1.Q / e1.b;
  // Ejemplo 2: paralelo de 2, 4 y 6 μF con 10 V.
  var e2 = { c: [2, 4, 6], V: 10 }; e2.C = e2.c[0] + e2.c[1] + e2.c[2]; e2.Q = e2.c.map(function (c) { return c * e2.V; }); e2.Qt = e2.C * e2.V;
  // Ejemplo 3 y 4: (2 ∥ 4) en serie con 3, a 12 V.
  var e3 = { a: 2, b: 4, c: 3, V: 12 };
  e3.C12 = e3.a + e3.b; e3.C = ser2(e3.C12, e3.c); e3.Q = e3.C * e3.V; e3.V12 = e3.Q / e3.C12; e3.V3 = e3.Q / e3.c;
  e3.Q1 = e3.a * e3.V12; e3.Q2 = e3.b * e3.V12;
  e3.tree = Sr(Pl(L('C1', e3.a), L('C2', e3.b)), L('C3', e3.c));
  e3.U = 0.5 * e3.C * e3.V * e3.V; e3.U1 = 0.5 * e3.a * e3.V12 * e3.V12; e3.U2 = 0.5 * e3.b * e3.V12 * e3.V12; e3.U3 = 0.5 * e3.c * e3.V3 * e3.V3;
  // Ejemplo 5: dos de 4 μF a 10 V, en serie y en paralelo.
  var e5 = { c: 4, V: 10 }; e5.Cs = e5.c / 2; e5.Cp = 2 * e5.c; e5.Us = 0.5 * e5.Cs * e5.V * e5.V; e5.Up = 0.5 * e5.Cp * e5.V * e5.V;
  var NET3 = ['s', ['p', ['1', e3.a], ['2', e3.b]], ['3', e3.c]], NET3b = ['s', ['12', e3.C12], ['3', e3.c]];

  var data = window.SESSION_DATA = {
    slug: 'sesion-10', number: '10', group: 'B · Gauss y capacitores',
    title: 'Capacitores en serie y en paralelo y energía almacenada', temario: [],
    minutes: 180,
    quote: 'En paralelo comparten el voltaje; en serie comparten la carga. Todo lo demás sale de ahí.',
    badges: [
      'Leer un diagrama de circuito: batería, capacitor, cables y nodos.',
      'Combinar capacitores en paralelo ($C = \\sum C_i$) y en serie ($1/C = \\sum 1/C_i$) entendiendo por qué.',
      'Reducir una red mixta paso a paso y luego desarmarla para hallar $Q$ y $V$ de cada capacitor.',
      'Calcular la energía $U = \\tfrac{1}{2}CV^2$ de cada capacitor y de toda la red.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Casi nunca hay un solo capacitor: hay <strong>redes</strong>. Una red de capacitores se porta como un solo capacitor equivalente, y para encontrarlo solo hacen falta dos reglas.',
        recall: [
          'Capacitancia: $C = Q/V$ y el capacitor de placas paralelas $C = \\varepsilon_0 A/d$ (<a href="../sesion-09/">S09</a>).',
          'Diferencia de potencial y energía potencial: $\\Delta U = q\\,\\Delta V$ (S05).',
          'Un conductor en equilibrio tiene el mismo potencial en todos sus puntos; un cable ideal también.'
        ],
        why: 'El flash de una cámara, un desfibrilador o la fuente de tu computadora juntan capacitores en serie y en paralelo para conseguir la capacidad y el voltaje que necesitan, y guardan energía en ellos para soltarla de golpe.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en varias cubetas que llenas con la misma llave. Si las pones <strong>lado a lado</strong> y todas reciben agua hasta la misma altura, juntas guardan más: eso es el <strong>paralelo</strong>. Mismo «nivel» (voltaje), y el agua total (carga) es la suma.',
          'Ahora piensa en una fila de personas pasándose cajas de mano en mano: cada caja que entra por un extremo obliga a pasar una caja por cada persona. Todas mueven la <strong>misma cantidad</strong>. Eso es la <strong>serie</strong>: misma carga en cada capacitor, y el «esfuerzo» (voltaje) se reparte.',
          'Y la energía: cargar un capacitor es como inflar un globo. Al principio cuesta poco, pero cada vez cuesta más, porque lo que ya metiste empuja de regreso. Por eso aparece un $\\tfrac{1}{2}$ en la energía.'
        ]
      },
      {
        type: 'concept', heading: 'Cómo leer un diagrama de circuito', short: 'Diagramas',
        body: [
          'Un diagrama no es un dibujo a escala: solo dice <strong>qué está conectado con qué</strong>. La batería se dibuja con una placa larga (el lado $+$) y una corta (el lado $-$); un capacitor, con dos placas iguales.',
          'Un cable ideal no tiene resistencia ni capacidad: <strong>todo un cable está al mismo potencial</strong>. Por eso puedes doblarlo, alargarlo o moverlo en el dibujo sin cambiar nada. Lo que importa son los <strong>nodos</strong>: los puntos donde se unen tres cables o más.',
          'La pregunta clave para cualquier par de capacitores es: ¿a qué nodos está conectado cada uno?'
        ],
        diagram: 'f2s10-symbols',
        caption: 'Los cuatro símbolos que vas a usar. Entre dos nodos, todo el cable tiene el mismo potencial.'
      },
      {
        type: 'concept', heading: 'En paralelo: mismo voltaje', short: 'Paralelo',
        body: [
          'Dos o más capacitores están <strong>en paralelo</strong> si se conectan a los <strong>mismos dos nodos</strong>. Sus placas de arriba están unidas por cable, y las de abajo también: todos tienen el <strong>mismo voltaje</strong> $V$.',
          'Cada uno guarda $Q_i = C_iV$, y la batería tuvo que entregar toda esa carga: $$Q = Q_1 + Q_2 + Q_3 = (C_1 + C_2 + C_3)V$$ Así que el capacitor equivalente es $$C_{eq} = C_1 + C_2 + C_3$$',
          'Tiene sentido: poner capacitores en paralelo es como agrandar el área de las placas, y $C = \\varepsilon_0 A/d$ crece con el área. El equivalente siempre es <strong>mayor</strong> que el más grande.'
        ],
        diagram: 'f2s10-parallel',
        caption: 'Tres capacitores en paralelo: los tres ven el mismo $V$ de la batería y sus cargas se suman.'
      },
      {
        type: 'explainer', heading: 'En serie: misma carga', short: 'Serie',
        title: 'Por qué todos llevan la misma Q',
        intro: 'Dos capacitores están <strong>en serie</strong> si están uno tras otro y en el nodo que comparten no se conecta nada más. Veamos por qué terminan con la misma carga.',
        diagram: 'f2s10-series',
        steps: [
          { text: 'Antes de conectar la batería, todas las placas están neutras.', state: { n: 0 } },
          { text: 'La batería solo toca dos placas: la izquierda de $C_1$ queda con $+Q$ y la derecha de $C_3$ con $-Q$.', state: { n: 1 } },
          { text: 'La placa derecha de $C_1$, el cable y la placa izquierda de $C_2$ forman una <strong>pieza aislada</strong>: nada le da ni le quita carga, así que sigue con carga neta cero. El $+Q$ de $C_1$ atrae $-Q$ a su placa vecina y del otro lado queda $+Q$. Lo mismo pasa en la siguiente pieza.', state: { n: 2 } },
          { text: 'Resultado: <strong>los tres llevan la misma carga</strong> $Q$, y los voltajes se suman: $$V = V_1 + V_2 + V_3 = \\frac{Q}{C_1} + \\frac{Q}{C_2} + \\frac{Q}{C_3}$$ Dividiendo entre $Q$: $$\\frac{1}{C_{eq}} = \\frac{1}{C_1} + \\frac{1}{C_2} + \\frac{1}{C_3}$$', state: { n: 3 } }
        ]
      },
      {
        type: 'callout', heading: 'Al revés que los resistores (y que el sentido común)',
        body: [
          'En serie el equivalente es <strong>menor que el más chico</strong>: poner capacitores en fila es como separar más las placas, y $C = \\varepsilon_0 A/d$ baja con $d$. Para dos: $C_{eq} = \\dfrac{C_1C_2}{C_1 + C_2}$ («producto entre suma»).',
          'Comprobación rápida: dos iguales en serie dan $C/2$; en paralelo dan $2C$. Si tu resultado en serie es más grande que alguno de los capacitores, sumaste como si fuera paralelo.'
        ]
      },
      {
        type: 'explainer', heading: 'Redes mixtas: reducir y desarmar', short: 'Redes mixtas',
        title: 'De adentro hacia afuera, y de regreso',
        intro: 'Una red mixta se reduce de dos en dos, empezando por los grupos más internos, hasta que queda un solo capacitor. Luego se «desarma» en orden inverso para encontrar la carga y el voltaje de cada uno.',
        diagram: 'f2s10-net',
        steps: [
          { text: '$C_1$ y $C_2$ se conectan a los mismos dos nodos: están <strong>en paralelo</strong>. $C_{12} = 2 + 4 = 6\\ \\mu\\text{F}$.', state: { net: NET3, V: 12, qv: 0, hi: ['1', '2'], eq: [], vh: 290 } },
          { text: 'Ahora $C_{12}$ y $C_3$ están uno tras otro, sin nada más en medio: <strong>en serie</strong>. $C_{eq} = \\dfrac{(6)(3)}{6 + 3} = 2\\ \\mu\\text{F}$.', state: { net: NET3b, V: 12, qv: 0, hi: ['12', '3'], eq: ['12'], vh: 290 } },
          { text: 'Con la batería: $Q = C_{eq}V = (2)(12) = 24\\ \\mu\\text{C}$. Esa es la carga que entrega la batería.', state: { net: ['eq', e3.C], V: 12, qv: 1, hi: [], eq: [], vh: 290 } },
          { text: 'Desarmamos: $C_{12}$ y $C_3$ estaban en serie, así que <strong>los dos llevan 24 μC</strong>. $V_3 = 24/3 = 8$ V y $V_{12} = 24/6 = 4$ V. Suman 12 V.', state: { net: NET3b, V: 12, qv: 1, hi: [], eq: ['12'], vh: 290 } },
          { text: '$C_1$ y $C_2$ estaban en paralelo: <strong>los dos tienen 4 V</strong>. $Q_1 = (2)(4) = 8\\ \\mu\\text{C}$ y $Q_2 = (4)(4) = 16\\ \\mu\\text{C}$. Suman 24 μC, como debe ser.', state: { net: NET3, V: 12, qv: 1, hi: [], eq: [], vh: 290 } }
        ]
      },
      {
        type: 'concept', heading: 'Energía almacenada en un capacitor', short: 'Energía',
        body: [
          'Para cargar un capacitor hay que llevar carga de una placa a la otra contra el voltaje que ya hay. Cuando lleva $q$, el voltaje es $v = q/C$ y pasar un $dq$ más cuesta $dW = v\\,dq$. Sumando desde cero hasta $Q$: $$U = \\int_0^Q \\frac{q}{C}\\,dq = \\frac{Q^2}{2C} = \\tfrac{1}{2}CV^2 = \\tfrac{1}{2}QV$$',
          'El $\\tfrac{1}{2}$ no es un adorno: al principio el voltaje es cero y al final es $V$, así que «en promedio» cada coulomb subió $V/2$. Es el área de un triángulo.',
          'En una red, la energía total es la suma de las de cada capacitor, y también es $\\tfrac{1}{2}C_{eq}V^2$. Que las dos cuentas coincidan es una buena <strong>comprobación</strong> de que desarmaste bien.'
        ],
        diagram: 'f2s10-energy',
        caption: 'Al cargar, el voltaje crece en línea recta con la carga. El trabajo total es el área bajo la recta: $\\tfrac{1}{2}QV$.'
      },
      {
        type: 'callout', heading: '¿Dónde está la energía? En el campo',
        body: [
          'En un capacitor de placas paralelas, $C = \\varepsilon_0A/d$ y $V = Ed$. Entonces $U = \\tfrac{1}{2}\\dfrac{\\varepsilon_0A}{d}(Ed)^2 = \\tfrac{1}{2}\\varepsilon_0E^2\\,(Ad)$, y $Ad$ es el volumen entre las placas.',
          'La <strong>densidad de energía</strong> (energía por metro cúbico) es $$u = \\tfrac{1}{2}\\varepsilon_0E^2 \\qquad \\varepsilon_0 = 8.85\\times 10^{-12}\\ \\text{C}^2/(\\text{N}\\cdot\\text{m}^2)$$ Vale para cualquier campo eléctrico, no solo el de un capacitor: donde hay campo, hay energía guardada.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: resolver una red de capacitores', short: 'Receta',
        steps: [
          { text: 'Marca los nodos (donde se unen tres cables o más). Recuerda: un cable es un solo potencial.' },
          { text: 'Busca un par que puedas combinar: <strong>paralelo</strong> si se conectan a los mismos dos nodos; <strong>serie</strong> si están uno tras otro y en el nodo que comparten no se conecta nada más.', tip: 'Dos capacitores «que se ven alineados» no siempre están en serie: si en el nodo entre ellos sale otra rama, la carga se reparte.' },
          { text: 'Combínalos ($C_1 + C_2$ en paralelo; $\\dfrac{C_1C_2}{C_1 + C_2}$ en serie), redibuja y repite de adentro hacia afuera hasta tener $C_{eq}$.', tip: 'En serie el resultado es menor que el más chico. Si no, sumaste como en paralelo.' },
          { text: 'Con la batería: $Q = C_{eq}V$. Luego desarma en orden inverso: en serie, todos con la misma $Q$ ($V_i = Q/C_i$); en paralelo, todos con el mismo $V$ ($Q_i = C_iV$).', tip: 'El voltaje de la batería solo lo tiene un capacitor si está conectado directo a ella. En serie, cada uno tiene un pedazo.' },
          { text: 'Energía: $U_i = \\tfrac{1}{2}C_iV_i^2$ y comprueba que $\\sum U_i = \\tfrac{1}{2}C_{eq}V^2$. Unidades: μF × V² = μJ.' }
        ]
      },
      {
        type: 'example', heading: 'Dos capacitores en serie',
        problem: '<p>Un capacitor de $' + e1.a + '\\ \\mu\\text{F}$ y otro de $' + e1.b + '\\ \\mu\\text{F}$ se conectan en serie a una batería de $' + e1.V + '\\ \\text{V}$. Halla la capacitancia equivalente, la carga de cada uno y el voltaje de cada uno.</p>',
        diagram: 'f2s10-net', state: { net: ['s', ['1', e1.a], ['2', e1.b]], V: e1.V, qv: 0 },
        steps: [
          { text: 'En serie: producto entre suma.', math: 'C_{eq} = \\frac{(' + e1.a + ')(' + e1.b + ')}{' + e1.a + ' + ' + e1.b + '} = ' + fx(e1.C) + '\\ \\mu\\text{F}' },
          { text: 'La carga es la misma en los dos: la que entrega la batería.', math: 'Q = C_{eq}V = (' + fx(e1.C) + ')(' + e1.V + ') = ' + fx(e1.Q) + '\\ \\mu\\text{C}' },
          { text: 'Cada voltaje es $Q/C_i$.', math: 'V_1 = \\frac{' + fx(e1.Q) + '}{' + e1.a + '} = ' + fx(e1.V1) + '\\ \\text{V}\\qquad V_2 = \\frac{' + fx(e1.Q) + '}{' + e1.b + '} = ' + fx(e1.V2) + '\\ \\text{V}' },
          { text: 'Comprobación: $' + fx(e1.V1) + ' + ' + fx(e1.V2) + ' = ' + e1.V + '$ V. El capacitor <strong>más chico</strong> se queda con el voltaje más grande.' }
        ],
        answer: '$C_{eq} = ' + fx(e1.C) + '\\ \\mu\\text{F}$, $Q = ' + fx(e1.Q) + '\\ \\mu\\text{C}$ en cada uno, $V_1 = ' + fx(e1.V1) + '$ V y $V_2 = ' + fx(e1.V2) + '$ V.',
        verify: { lab: 'call', mod: 'capnet', fn: 'series', args: [[e1.a, e1.b]], value: e1.C }
      },
      {
        type: 'example', heading: 'Tres capacitores en paralelo',
        problem: '<p>Capacitores de $2$, $4$ y $6\\ \\mu\\text{F}$ se conectan en paralelo a $' + e2.V + '\\ \\text{V}$. ¿Cuánta carga guarda cada uno y cuánta entregó la batería?</p>',
        steps: [
          { text: 'En paralelo todos tienen el voltaje de la batería: $V = ' + e2.V + '$ V.' },
          { text: 'Carga de cada uno: $Q_i = C_iV$.', math: 'Q_1 = ' + fx(e2.Q[0]) + '\\ \\mu\\text{C}\\quad Q_2 = ' + fx(e2.Q[1]) + '\\ \\mu\\text{C}\\quad Q_3 = ' + fx(e2.Q[2]) + '\\ \\mu\\text{C}' },
          { text: 'La batería entregó la suma, que es lo mismo que $C_{eq}V$.', math: 'C_{eq} = 2 + 4 + 6 = ' + e2.C + '\\ \\mu\\text{F}\\qquad Q = C_{eq}V = ' + fx(e2.Qt) + '\\ \\mu\\text{C}' }
        ],
        answer: '$Q_1 = ' + fx(e2.Q[0]) + '$, $Q_2 = ' + fx(e2.Q[1]) + '$, $Q_3 = ' + fx(e2.Q[2]) + '\\ \\mu\\text{C}$; en total $' + fx(e2.Qt) + '\\ \\mu\\text{C}$.',
        verify: { lab: 'call', mod: 'capnet', fn: 'parallel', args: [e2.c], value: e2.C }
      },
      {
        type: 'example', heading: 'Carga y voltaje dentro de una red mixta',
        problem: '<p>$C_1 = ' + e3.a + '\\ \\mu\\text{F}$ y $C_2 = ' + e3.b + '\\ \\mu\\text{F}$ están en paralelo, y ese par está en serie con $C_3 = ' + e3.c + '\\ \\mu\\text{F}$. La red se conecta a $' + e3.V + '\\ \\text{V}$. Halla $C_{eq}$ y la carga y el voltaje de $C_1$.</p>',
        diagram: 'f2s10-net', state: { net: NET3, V: e3.V, qv: 0 },
        steps: [
          { text: 'Reduce de adentro hacia afuera: primero el paralelo, luego la serie.', math: 'C_{12} = ' + e3.a + ' + ' + e3.b + ' = ' + e3.C12 + '\\ \\mu\\text{F}\\qquad C_{eq} = \\frac{(' + e3.C12 + ')(' + e3.c + ')}{' + e3.C12 + ' + ' + e3.c + '} = ' + fx(e3.C) + '\\ \\mu\\text{F}' },
          { text: 'Carga de la batería.', math: 'Q = C_{eq}V = ' + fx(e3.Q) + '\\ \\mu\\text{C}' },
          { text: 'Desarma la serie: $C_{12}$ lleva esa misma carga, así que su voltaje es', math: 'V_{12} = \\frac{' + fx(e3.Q) + '}{' + e3.C12 + '} = ' + fx(e3.V12) + '\\ \\text{V}' },
          { text: 'Desarma el paralelo: $C_1$ tiene $V_{12}$.', math: 'Q_1 = C_1V_{12} = (' + e3.a + ')(' + fx(e3.V12) + ') = ' + fx(e3.Q1) + '\\ \\mu\\text{C}' },
          { text: 'Ojo: $C_1$ <strong>no</strong> tiene los $' + e3.V + '$ V de la batería (eso daría $' + fx(e3.a * e3.V) + '\\ \\mu$C) ni la carga total ($' + fx(e3.Q) + '\\ \\mu$C).' }
        ],
        answer: '$C_{eq} = ' + fx(e3.C) + '\\ \\mu\\text{F}$; $C_1$ tiene $V_1 = ' + fx(e3.V12) + '$ V y $Q_1 = ' + fx(e3.Q1) + '\\ \\mu\\text{C}$.',
        verify: { lab: 'call', mod: 'capnet', fn: 'solve', args: [e3.tree, e3.V], values: { C: e3.C, Q: e3.Q, 'parts.C1.Q': e3.Q1, 'parts.C1.V': e3.V12, 'parts.C3.V': e3.V3 } }
      },
      {
        type: 'example', heading: 'Energía de toda la red',
        problem: '<p>Con la misma red del ejemplo anterior, ¿cuánta energía guarda cada capacitor y cuánta la red completa?</p>',
        steps: [
          { text: 'Energía total con el equivalente.', math: 'U = \\tfrac{1}{2}C_{eq}V^2 = \\tfrac{1}{2}(' + fx(e3.C) + ')(' + e3.V + ')^2 = ' + fx(e3.U) + '\\ \\mu\\text{J}' },
          { text: 'Ahora capacitor por capacitor, con su propio voltaje.', math: 'U_1 = \\tfrac{1}{2}(' + e3.a + ')(' + fx(e3.V12) + ')^2 = ' + fx(e3.U1) + '\\quad U_2 = \\tfrac{1}{2}(' + e3.b + ')(' + fx(e3.V12) + ')^2 = ' + fx(e3.U2) + '\\quad U_3 = \\tfrac{1}{2}(' + e3.c + ')(' + fx(e3.V3) + ')^2 = ' + fx(e3.U3) },
          { text: 'Suma: $' + fx(e3.U1) + ' + ' + fx(e3.U2) + ' + ' + fx(e3.U3) + ' = ' + fx(e3.U1 + e3.U2 + e3.U3) + '\\ \\mu\\text{J}$. Coincide con $\\tfrac{1}{2}C_{eq}V^2$: el reparto estaba bien.' }
        ],
        answer: '$U = ' + fx(e3.U) + '\\ \\mu\\text{J} = ' + fx(e3.U * 1e-6, 6) + '\\ \\text{J}$; el capacitor en serie, $C_3$, guarda la mayor parte ($' + fx(e3.U3) + '\\ \\mu\\text{J}$).',
        verify: { lab: 'call', mod: 'capnet', fn: 'solve', args: [e3.tree, e3.V], values: { U: e3.U, sumU: e3.U, 'parts.C3.U': e3.U3 } }
      },
      {
        type: 'example', heading: 'Serie contra paralelo: ¿cuál guarda más?',
        problem: '<p>Tienes dos capacitores de $' + e5.c + '\\ \\mu\\text{F}$ y una batería de $' + e5.V + '\\ \\text{V}$. ¿Cuánta energía guardan si los conectas en serie? ¿Y en paralelo?</p>',
        steps: [
          { text: 'En serie: $C_{eq} = ' + e5.c + '/2 = ' + fx(e5.Cs) + '\\ \\mu\\text{F}$.', math: 'U_s = \\tfrac{1}{2}(' + fx(e5.Cs) + ')(' + e5.V + ')^2 = ' + fx(e5.Us) + '\\ \\mu\\text{J}' },
          { text: 'En paralelo: $C_{eq} = 2(' + e5.c + ') = ' + fx(e5.Cp) + '\\ \\mu\\text{F}$.', math: 'U_p = \\tfrac{1}{2}(' + fx(e5.Cp) + ')(' + e5.V + ')^2 = ' + fx(e5.Up) + '\\ \\mu\\text{J}' },
          { text: 'Con el mismo voltaje, en paralelo guardan <strong>4 veces más</strong>: cada uno recibe todo el voltaje, y la energía va con $V^2$.' }
        ],
        answer: '$U_s = ' + fx(e5.Us) + '\\ \\mu\\text{J}$ y $U_p = ' + fx(e5.Up) + '\\ \\mu\\text{J}$.',
        verify: { lab: 'call', mod: 'capnet', fn: 'solve', args: [Pl(L('C1', e5.c), L('C2', e5.c)), e5.V], values: { U: e5.Up } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Cómo sé si dos capacitores están en serie?', a: 'Están uno tras otro y en el nodo que comparten <strong>no se conecta nada más</strong>. Si de ese punto sale otra rama, parte de la carga se va por ahí y ya no llevan la misma.' },
          { q: '¿Por qué en serie la capacidad baja?', a: 'Poner capacitores en fila es como separar más las placas: con la misma batería, cabe menos carga. Por eso $C_{eq}$ es menor que el más chico.' },
          { q: '¿Cada capacitor de la red tiene el voltaje de la batería?', a: 'Solo si está conectado directo a sus dos terminales (en paralelo con ella). En serie, el voltaje se reparte, y al <strong>más chico</strong> le toca el pedazo más grande ($V_i = Q/C_i$).' },
          { q: '¿Las placas internas de una serie se cargan aunque la batería no las toque?', a: 'Sí, por inducción: la pieza aislada entre dos capacitores sigue neutra en total, pero se separa en $-Q$ de un lado y $+Q$ del otro.' },
          { q: '¿Qué fórmula de energía uso, $\\tfrac{1}{2}CV^2$, $Q^2/2C$ o $\\tfrac{1}{2}QV$?', a: 'Son la misma, porque $Q = CV$. Usa la que tenga los datos que ya conoces. Lo que no puede faltar es el $\\tfrac{1}{2}$.' },
          { q: '¿Por qué μF × V² da μJ?', a: 'Porque $1\\ \\text{F}\\cdot\\text{V}^2 = 1\\ \\text{J}$, y el prefijo micro se queda: $\\tfrac{1}{2}(2\\ \\mu\\text{F})(12\\ \\text{V})^2 = 144\\ \\mu\\text{J} = 1.44\\times 10^{-4}\\ \\text{J}$.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Paralelo: mismo $V$, las cargas se suman, $C_{eq} = \\sum C_i$ (mayor que el más grande).',
          'Serie: misma $Q$ (por inducción en las placas internas), los voltajes se suman, $1/C_{eq} = \\sum 1/C_i$ (menor que el más chico).',
          'Red mixta: reduce de adentro hacia afuera, calcula $Q = C_{eq}V$ y desarma en orden inverso.',
          'Energía: $U = \\tfrac{1}{2}CV^2 = Q^2/2C = \\tfrac{1}{2}QV$; la total es $\\sum U_i = \\tfrac{1}{2}C_{eq}V^2$, y $u = \\tfrac{1}{2}\\varepsilon_0E^2$.'
        ]
      }
    ],

    lab: {
      type: 'capacitor-network', title: 'Reduce la red',
      intro: 'Elige dos capacitores (tócalos en el circuito o escógelos en las listas) y el lab los combina si están en serie o en paralelo; si no lo están, te explica por qué. Cuando quede uno solo, calcula $C_{eq}$, la carga, el voltaje o la energía de un capacitor y compruébalo: el lab detecta la serie sumada como paralelo, el voltaje de la batería usado donde no va, la carga total en un solo capacitor y la energía sin el $\\tfrac{1}{2}$. Al final, desarma la red paso a paso para ver $Q$ y $V$ de cada uno.',
      cfg: { preset: 2 }
    },

    formulas: [
      { label: 'Paralelo', tex: 'C_{eq} = C_1 + C_2 + \\cdots' },
      { label: 'Serie', tex: '\\frac{1}{C_{eq}} = \\frac{1}{C_1} + \\frac{1}{C_2} + \\cdots' },
      { label: 'Dos en serie', tex: 'C_{eq} = \\frac{C_1C_2}{C_1 + C_2}' },
      { label: 'Carga y voltaje', tex: 'Q = CV' },
      { label: 'Energía', tex: 'U = \\tfrac{1}{2}CV^2 = \\frac{Q^2}{2C} = \\tfrac{1}{2}QV' },
      { label: 'Densidad de energía', tex: 'u = \\tfrac{1}{2}\\varepsilon_0E^2' },
      { label: 'Constante', tex: '\\varepsilon_0 = 8.85\\times 10^{-12}\\ \\text{C}^2/(\\text{N}\\cdot\\text{m}^2)' }
    ],

    exercises: [
      {
        id: 'f2-s10-serie', title: 'Capacitores en serie',
        vars: { n: [2, 3, 1], a: [1, 12, 1], b: [1, 12, 1], c: [1, 12, 1] },
        prompt: function (v) {
          var list = v.n === 2 ? '$' + v.a + '\\ \\mu\\text{F}$ y $' + v.b + '\\ \\mu\\text{F}$' : '$' + v.a + '$, $' + v.b + '$ y $' + v.c + '\\ \\mu\\text{F}$';
          return '<p>Se conectan en serie capacitores de ' + list + '. ¿Cuál es la capacitancia equivalente, en μF?</p>';
        },
        check: 'numeric', unit: 'μF',
        answer: function (v) { var s = 1 / v.a + 1 / v.b + (v.n === 3 ? 1 / v.c : 0); return 1 / s; },
        mistakes: {
          swap: function (v) { return v.a + v.b + (v.n === 3 ? v.c : 0); },
          noInv: function (v) { return 1 / v.a + 1 / v.b + (v.n === 3 ? 1 / v.c : 0); }
        },
        feedback: [
          { when: 'swap', say: 'Sumaste como si estuvieran en paralelo. En serie se suman los <strong>inversos</strong>: el resultado es menor que el más chico.' },
          { when: 'noInv', say: 'Ese número es $1/C_{eq}$: falta invertirlo.' }
        ],
        oracle: { lab: 'value', value: function (v) { return v.n === 2 ? v.a * v.b / (v.a + v.b) : v.a * v.b * v.c / (v.a * v.b + v.b * v.c + v.a * v.c); } },
        hint: '$\\dfrac{1}{C_{eq}} = \\dfrac{1}{C_1} + \\dfrac{1}{C_2} + \\cdots$; para dos, producto entre suma.',
        solution: function (v) {
          var C = 1 / (1 / v.a + 1 / v.b + (v.n === 3 ? 1 / v.c : 0));
          return '$$\\frac{1}{C_{eq}} = \\frac{1}{' + v.a + '} + \\frac{1}{' + v.b + '}' + (v.n === 3 ? ' + \\frac{1}{' + v.c + '}' : '') + ' = ' + fx(1 / C, 4) + '\\ \\mu\\text{F}^{-1} \\quad\\Rightarrow\\quad C_{eq} = ' + fx(C) + '\\ \\mu\\text{F}$$';
        }
      },
      {
        id: 'f2-s10-mixta', title: 'Equivalente de una red mixta',
        vars: { a: [1, 12, 1], b: [1, 12, 1], c: [1, 12, 1] },
        prompt: function (v) { return '<p>$C_1 = ' + v.a + '\\ \\mu\\text{F}$ y $C_2 = ' + v.b + '\\ \\mu\\text{F}$ están en paralelo, y ese par está en serie con $C_3 = ' + v.c + '\\ \\mu\\text{F}$. ¿Cuál es la capacitancia equivalente de la red, en μF?</p>'; },
        check: 'numeric', unit: 'μF',
        answer: mixEq,
        mistakes: {
          swap: function (v) { return v.a * v.b / (v.a + v.b) + v.c; },
          allPar: function (v) { return v.a + v.b + v.c; },
          allSer: function (v) { return 1 / (1 / v.a + 1 / v.b + 1 / v.c); }
        },
        feedback: [
          { when: 'swap', say: 'Cambiaste las reglas: el par $C_1, C_2$ está en paralelo (se suma) y el resultado va en serie con $C_3$ (producto entre suma).' },
          { when: 'allPar', say: 'Sumaste los tres como si estuvieran en paralelo; $C_3$ está en serie con el par.' },
          { when: 'allSer', say: 'Pusiste los tres en serie; $C_1$ y $C_2$ están en paralelo entre sí.' }
        ],
        oracle: { lab: 'value', value: function (v) { return nodal(mix(v), 1).Q; } },
        hint: 'Primero $C_{12} = C_1 + C_2$; luego $C_{eq} = \\dfrac{C_{12}C_3}{C_{12} + C_3}$.',
        solution: function (v) { var c12 = v.a + v.b; return '$C_{12} = ' + v.a + ' + ' + v.b + ' = ' + c12 + '\\ \\mu\\text{F}$. $$C_{eq} = \\frac{(' + c12 + ')(' + v.c + ')}{' + c12 + ' + ' + v.c + '} = ' + fx(mixEq(v)) + '\\ \\mu\\text{F}$$'; }
      },
      {
        id: 'f2-s10-carga', title: 'Carga de un capacitor dentro de la red',
        vars: { a: [1, 12, 1], b: [1, 12, 1], c: [1, 12, 1], V: [6, 24, 3] },
        prompt: function (v) { return '<p>$C_1 = ' + v.a + '\\ \\mu\\text{F}$ y $C_2 = ' + v.b + '\\ \\mu\\text{F}$ están en paralelo, y ese par está en serie con $C_3 = ' + v.c + '\\ \\mu\\text{F}$. La red se conecta a una batería de $' + v.V + '\\ \\text{V}$. ¿Cuánta carga guarda $C_1$, en μC?</p>'; },
        check: 'numeric', unit: 'μC',
        answer: function (v) { var Q = mixEq(v) * v.V; return v.a * Q / (v.a + v.b); },
        mistakes: {
          vTotal: function (v) { return v.a * v.V; },
          qTotal: function (v) { return mixEq(v) * v.V; }
        },
        feedback: [
          { when: 'vTotal', say: '$C_1$ no tiene todo el voltaje de la batería: el par está en serie con $C_3$ y le toca solo una parte, $V_{12} = Q/C_{12}$.' },
          { when: 'qTotal', say: 'Esa es la carga total. En el paralelo se reparte: $Q_1 = C_1V_{12}$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return nodal(mix(v), v.V).parts.C1.Q; } },
        hint: 'Reduce, calcula $Q = C_{eq}V$, luego $V_{12} = Q/C_{12}$ y por último $Q_1 = C_1V_{12}$.',
        solution: function (v) { var c12 = v.a + v.b, C = mixEq(v), Q = C * v.V, v12 = Q / c12; return '$C_{eq} = ' + fx(C, 3) + '\\ \\mu\\text{F}$, $Q = ' + fx(Q, 3) + '\\ \\mu\\text{C}$, $V_{12} = Q/C_{12} = ' + fx(v12, 3) + '$ V. $$Q_1 = C_1V_{12} = (' + v.a + ')(' + fx(v12, 3) + ') = ' + fx(v.a * v12) + '\\ \\mu\\text{C}$$'; }
      },
      {
        id: 'f2-s10-voltaje', title: 'Voltaje del capacitor en serie',
        vars: { a: [1, 12, 1], b: [1, 12, 1], c: [1, 12, 1], V: [6, 24, 3] },
        prompt: function (v) { return '<p>En la misma red ($C_1 = ' + v.a + '\\ \\mu\\text{F}$ en paralelo con $C_2 = ' + v.b + '\\ \\mu\\text{F}$, y el par en serie con $C_3 = ' + v.c + '\\ \\mu\\text{F}$), conectada a $' + v.V + '\\ \\text{V}$, ¿qué voltaje tiene $C_3$?</p>'; },
        check: 'numeric', unit: 'V',
        answer: function (v) { return mixEq(v) * v.V / v.c; },
        mistakes: {
          vTotal: function (v) { return v.V; },
          other: function (v) { return mixEq(v) * v.V / (v.a + v.b); }
        },
        feedback: [
          { when: 'vTotal', say: '$C_3$ está en serie con el par: el voltaje de la batería se reparte entre los dos.' },
          { when: 'other', say: 'Ese es el voltaje del par $C_{12}$. El de $C_3$ es $Q/C_3$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return nodal(mix(v), v.V).parts.C3.V; } },
        hint: 'En serie, $C_{12}$ y $C_3$ llevan la misma carga $Q = C_{eq}V$; luego $V_3 = Q/C_3$.',
        solution: function (v) { var Q = mixEq(v) * v.V; return '$Q = C_{eq}V = (' + fx(mixEq(v), 3) + ')(' + v.V + ') = ' + fx(Q, 3) + '\\ \\mu\\text{C}$. $$V_3 = \\frac{Q}{C_3} = \\frac{' + fx(Q, 3) + '}{' + v.c + '} = ' + fx(Q / v.c) + '\\ \\text{V}$$'; }
      },
      {
        id: 'f2-s10-energia', title: 'Energía almacenada en la red',
        vars: { a: [1, 12, 1], b: [1, 12, 1], c: [1, 12, 1], V: [6, 24, 3] },
        prompt: function (v) { return '<p>$C_1 = ' + v.a + '\\ \\mu\\text{F}$ y $C_2 = ' + v.b + '\\ \\mu\\text{F}$ en paralelo, en serie con $C_3 = ' + v.c + '\\ \\mu\\text{F}$, conectados a $' + v.V + '\\ \\text{V}$. ¿Cuánta energía guarda toda la red, en μJ?</p>'; },
        check: 'numeric', unit: 'μJ',
        answer: function (v) { return 0.5 * mixEq(v) * v.V * v.V; },
        mistakes: {
          noHalf: function (v) { return mixEq(v) * v.V * v.V; },
          allPar: function (v) { return 0.5 * (v.a + v.b + v.c) * v.V * v.V; }
        },
        feedback: [
          { when: 'noHalf', say: 'Te faltó el $\\tfrac{1}{2}$: $U = \\tfrac{1}{2}C_{eq}V^2$.' },
          { when: 'allPar', say: 'Usaste $C_1 + C_2 + C_3$; $C_3$ está en serie, así que primero reduce bien la red.' }
        ],
        oracle: { lab: 'value', value: function (v) { var p = nodal(mix(v), v.V).parts; return p.C1.U + p.C2.U + p.C3.U; } },
        hint: 'Reduce a $C_{eq}$ y usa $U = \\tfrac{1}{2}C_{eq}V^2$. Puedes comprobar sumando $\\tfrac{1}{2}C_iV_i^2$ de cada uno.',
        solution: function (v) { var C = mixEq(v); return '$C_{eq} = ' + fx(C, 3) + '\\ \\mu\\text{F}$. $$U = \\tfrac{1}{2}(' + fx(C, 3) + ')(' + v.V + ')^2 = ' + fx(0.5 * C * v.V * v.V) + '\\ \\mu\\text{J}$$'; }
      },
      {
        id: 'f2-s10-serie-paralelo', title: 'Concepto: serie o paralelo',
        vars: {},
        prompt: function () { return '<p>Tienes dos capacitores iguales y una batería. Los conectas primero en serie y luego en paralelo a la misma batería. ¿Cómo se compara la energía guardada?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'En paralelo guardan 4 veces más que en serie', correct: true },
            { text: 'Igual: son los mismos capacitores', say: 'La energía depende de $C_{eq}$: en paralelo es $2C$ y en serie $C/2$, con el mismo $V$.' },
            { text: 'En serie guardan más, porque se suman los voltajes', say: 'Los voltajes de cada uno se suman para dar el de la batería; cada uno tiene solo la mitad. $U = \\tfrac{1}{2}C_{eq}V^2$ es menor.' },
            { text: 'En paralelo guardan el doble', say: '$C_{eq}$ pasa de $C/2$ a $2C$: un factor de 4, no de 2.' }
          ];
        },
        answer: function () { return 'En paralelo guardan 4 veces más que en serie'; },
        hint: 'Con el mismo $V$, $U = \\tfrac{1}{2}C_{eq}V^2$. Compara $C_{eq}$ en los dos casos.',
        solution: function () { return 'En serie $C_{eq} = C/2$; en paralelo $C_{eq} = 2C$. Con el mismo $V$, la energía es $4$ veces mayor en paralelo.'; }
      }
    ],

    quiz: { tags: ['f2.S10'], count: 8 },

    errors: [
      'Sumar capacidades en serie como si fueran paralelo (o al revés). En serie el equivalente es menor que el más chico.',
      'Olvidar invertir al final: $\\sum 1/C_i$ es $1/C_{eq}$, no $C_{eq}$.',
      'Darle a un capacitor en serie todo el voltaje de la batería.',
      'Darle a un capacitor en paralelo toda la carga que entregó la batería.',
      'Decir que dos capacitores están en serie cuando en el nodo entre ellos sale otra rama.',
      'Escribir la energía sin el $\\tfrac{1}{2}$, o mezclar μF con F al pasar a joules.'
    ],

    teacher: {
      plan: [
        'Empieza con la lectura de diagramas: nodos y cables equipotenciales. Que identifiquen nodos en varios dibujos del mismo circuito.',
        'Paralelo con el argumento del área; serie con el explainer de la inducción en las placas internas.',
        'Explainer de reducir y desarmar con la red de los ejemplos 3 y 4; luego el lab con la red de cinco.',
        'Energía: el área bajo $v(q)$ explica el $\\tfrac{1}{2}$; cierra con $u = \\tfrac{1}{2}\\varepsilon_0E^2$ y la comparación serie contra paralelo.'
      ],
      check: [
        'Que justifiquen cada combinación («mismos dos nodos», «nada más en el nodo entre ellos»).',
        'Que comprueben con $\\sum V_i = V$ en serie, $\\sum Q_i = Q$ en paralelo y $\\sum U_i = \\tfrac{1}{2}C_{eq}V^2$.'
      ],
      note: 'Los dieléctricos quedan fuera de esta sesión. El mismo método de reducir y desarmar vuelve en S12 con resistores, con las reglas al revés.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §8.2 “Capacitors in Series and in Parallel”. <a href="https://openstax.org/books/university-physics-volume-2/pages/8-2-capacitors-in-series-and-in-parallel">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §8.3 “Energy Stored in a Capacitor”. <a href="https://openstax.org/books/university-physics-volume-2/pages/8-3-energy-stored-in-a-capacitor">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-09',
    next: 'sesion-11'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
