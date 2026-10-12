/* =====================================================================
   Física 2 · S12 · Resistores en serie y en paralelo, fem y resistencia interna
   (bloque C · Circuitos).
   Fuente: OpenStax, University Physics Volume 2, §10.1 y §10.2 (CC BY-NC-SA 4.0).
   Unidades: R en Ω, ε y V en volts, I en amperes, P en watts.
   Las cuentas se hacen aquí con fórmulas propias; scripts/examples.test.js las
   compara contra LabMath.resnet (lab resistor-network) y los oráculos de los
   ejercicios usan el solver nodal genérico de S10 (LabMath.capnet.nodal, con
   conductancias 1/R), no la reducción en serie y en paralelo.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function L(id, r) { return { id: id, r: r }; }
  function Sr() { return { t: 's', k: Array.prototype.slice.call(arguments) }; }
  function Pl() { return { t: 'p', k: Array.prototype.slice.call(arguments) }; }
  function par2(a, b) { return a * b / (a + b); }
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (m) { return ex.mistakes[m](v); }));
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) {
          // 3 % relativo y 0.02 absoluto: el calificador acepta ±0.01 o ±1 %.
          if (Math.abs(vals[i] - vals[j]) <= Math.max(0.02, 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j])))) return false;
        }
      }
      return true;
    };
  }
  // Oráculo independiente: potenciales por el solver nodal (fuente: nodo s fijo en ε, unido a la
  // terminal a por la conductancia 1/r; terminal b a 0 V). Corriente de cada rama = ΔV/R.
  function nodal(tree, E, r) {
    var g = window.LabMath.resnet.graph(tree), nodes = g.nodes.slice(), fixed = { b: 0 };
    var br = g.branches.map(function (b) { return { a: b.a, b: b.b, value: 1 / b.r }; });
    if (r > 0) { nodes.push('s'); fixed.s = E; br.push({ a: 's', b: 'a', value: 1 / r }); } else fixed.a = E;
    var pot = window.LabMath.capnet.nodal({ nodes: nodes, branches: br, fixed: fixed }), out = { I: 0, Vt: pot.a, parts: {} };
    g.branches.forEach(function (b) {
      var dv = pot[b.a] - pot[b.b];
      out.parts[b.id] = { I: dv / b.r, V: dv, P: dv * dv / b.r };
      if (b.a === 'a') out.I += dv / b.r;
    });
    return out;
  }
  // Red de los ejercicios: (R1 ∥ R2) en serie con R3.
  function mix(v) { return Sr(Pl(L('R1', v.a), L('R2', v.b)), L('R3', v.c)); }
  function mixEq(v) { return par2(v.a, v.b) + v.c; }
  function swapEq(v) { return (v.a + v.b) * v.c / (v.a + v.b + v.c); }

  // Ejemplo 1: batería con resistencia interna.
  var e1 = { E: 12, r: 0.5, R: 5.5 }; e1.I = e1.E / (e1.R + e1.r); e1.Vt = e1.E - e1.I * e1.r; e1.PR = e1.I * e1.I * e1.R; e1.Pr = e1.I * e1.I * e1.r; e1.PE = e1.E * e1.I;
  // Ejemplo 2: el arranque del coche.
  var e2 = { E: 12, r: 0.02, R: 0.06, Il: 10 }; e2.I = e2.E / (e2.R + e2.r); e2.Vt = e2.E - e2.I * e2.r; e2.Vl = e2.E - e2.Il * e2.r;
  // Ejemplo 3: tres en serie.
  var e3 = { R: [2, 4, 6], V: 24 }; e3.Req = e3.R[0] + e3.R[1] + e3.R[2]; e3.I = e3.V / e3.Req; e3.Vs = e3.R.map(function (x) { return e3.I * x; });
  // Ejemplo 4: dos en paralelo.
  var e4 = { a: 6, b: 3, V: 12 }; e4.Req = par2(e4.a, e4.b); e4.I1 = e4.V / e4.a; e4.I2 = e4.V / e4.b; e4.I = e4.V / e4.Req;
  // Ejemplo 5 (y explainer): (4 ∥ 12) en serie con 5, ε = 18 V, r = 1 Ω.
  var e5 = { a: 4, b: 12, c: 5, E: 18, r: 1 };
  e5.R12 = par2(e5.a, e5.b); e5.Req = e5.R12 + e5.c; e5.I = e5.E / (e5.Req + e5.r); e5.Vt = e5.E - e5.I * e5.r;
  e5.V12 = e5.I * e5.R12; e5.V3 = e5.I * e5.c; e5.I1 = e5.V12 / e5.a; e5.I2 = e5.V12 / e5.b;
  e5.P1 = e5.I1 * e5.V12; e5.P2 = e5.I2 * e5.V12; e5.P3 = e5.I * e5.I * e5.c; e5.Pr = e5.I * e5.I * e5.r; e5.PE = e5.E * e5.I;
  e5.tree = Sr(Pl(L('R1', e5.a), L('R2', e5.b)), L('R3', e5.c));
  // Ejemplo 6: máxima transferencia, ε = 12 V y r = 2 Ω.
  var e6 = { E: 12, r: 2 }; e6.P = function (R) { var i = e6.E / (R + e6.r); return i * i * R; }; e6.Pmax = e6.E * e6.E / (4 * e6.r);
  var NET = ['s', ['p', ['1', e5.a], ['2', e5.b]], ['3', e5.c]], NETb = ['s', ['12', e5.R12], ['3', e5.c]];
  var ST = { E: e5.E, r: e5.r, vh: 300 };
  function st(o) { var s = {}; Object.keys(ST).forEach(function (k) { s[k] = ST[k]; }); Object.keys(o).forEach(function (k) { s[k] = o[k]; }); return s; }

  var data = window.SESSION_DATA = {
    slug: 'sesion-12', number: '12', group: 'C · Circuitos',
    title: 'Resistores en serie y en paralelo, fem y resistencia interna', temario: [],
    minutes: 180,
    quote: 'En serie comparten la corriente; en paralelo comparten el voltaje. Es lo mismo que con capacitores, pero las fórmulas van al revés.',
    badges: [
      'Usar el modelo de una fuente real: fem $\\varepsilon$ con resistencia interna $r$, y $V = \\varepsilon - Ir$.',
      'Combinar resistores en serie ($R_{eq} = \\sum R_i$) y en paralelo ($1/R_{eq} = \\sum 1/R_i$) entendiendo por qué.',
      'Reducir una red mixta y desarmarla para hallar $I$, $V$ y $P$ de cada resistor (divisores de voltaje y de corriente).',
      'Explicar por qué en tu casa todo va en paralelo y por qué una serie de focos se apaga completa.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Casi ningún circuito tiene un solo resistor, y ninguna batería es perfecta. Hoy aprendes a convertir una red de resistores en <strong>uno solo</strong> y a tomar en cuenta lo que se «come» la propia batería.',
        recall: [
          'Ley de Ohm $V = IR$ y potencia $P = IV = I^2R = V^2/R$ (S11).',
          'Un cable ideal es un solo potencial; un nodo es donde se unen tres cables o más (<a href="../sesion-10/">S10</a>).',
          'El método de reducir y desarmar redes de capacitores (<a href="../sesion-10/">S10</a>): hoy es el mismo, con las reglas al revés.'
        ],
        why: 'Por esto se atenúan las luces del coche al dar marcha, por esto puedes prender la licuadora sin que se apague el refri, y por esto una tira de focos navideños vieja se apagaba completa cuando se fundía uno.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en la corriente como coches en una carretera y en cada resistor como una caseta de cobro. Si pones varias casetas <strong>una tras otra</strong> en el mismo carril (serie), todos los coches pasan por todas: el flujo es el mismo en cada una y los retrasos se suman. Más casetas en fila, más difícil pasar.',
          'Si en cambio abres <strong>varias casetas lado a lado</strong> (paralelo), los coches se reparten: cada caseta atiende una parte y el flujo total es la suma. Abrir otra caseta, aunque sea lenta, siempre <strong>ayuda</strong>: la resistencia total baja.',
          'Y la batería es como una bomba de agua con una manguera angosta por dentro. Si pides poquita agua, sale con toda la presión. Si pides muchísima, parte de la presión se pierde en su propia manguera: eso es la <strong>resistencia interna</strong>.'
        ]
      },
      {
        type: 'concept', heading: 'Fem y resistencia interna', short: 'Fem',
        body: [
          'Una batería separa cargas por química: hace trabajo sobre cada coulomb que la cruza. Ese trabajo por unidad de carga es la <strong>fuerza electromotriz</strong> o <strong>fem</strong>, $\\varepsilon$, y se mide en volts. A pesar del nombre, no es una fuerza: es el voltaje que tendría la batería si no le pidieras corriente.',
          'Pero los materiales de adentro también se oponen al paso de la corriente. El modelo de una <strong>fuente real</strong> es una fem ideal en serie con una resistencia interna $r$. Cuando sale una corriente $I$, una parte del voltaje se pierde adentro, y lo que llega a las terminales es $$V = \\varepsilon - Ir$$',
          'Con la batería conectada a una carga externa $R_{eq}$, la corriente cruza $r$ y $R_{eq}$ en serie: $$I = \\frac{\\varepsilon}{R_{eq} + r}$$ Si $r$ es mucho menor que $R_{eq}$, casi no importa; si pides mucha corriente (una $R_{eq}$ chica), importa muchísimo.'
        ],
        diagram: 'f2s12-battery',
        caption: 'Una fuente real: la fem ideal $\\varepsilon$ y la resistencia interna $r$ van juntas en el mismo recuadro. Afuera solo puedes medir el voltaje en las terminales.'
      },
      {
        type: 'explainer', heading: 'La batería que «baja» cuando le pides mucho', short: 'Voltaje en terminales',
        title: 'Voltaje en terminales contra corriente',
        intro: 'Una batería de coche tiene $\\varepsilon = 12$ V y una resistencia interna de unos $0.02\\ \\Omega$. Veamos qué marca en sus terminales según la corriente que le pidas.',
        diagram: 'f2s12-terminal',
        steps: [
          { text: 'Sin corriente (circuito abierto): no se pierde nada en $r$ y $V = \\varepsilon = 12$ V. Un voltímetro ideal lee la fem.', state: { I: 0 } },
          { text: 'Con los faros prendidos (unos 10 A) se pierden $Ir = (10)(0.02) = 0.2$ V: $V = 11.8$ V. Casi no se nota.', state: { I: 10 } },
          { text: 'Al dar marcha, el motor de arranque pide unos 150 A: se pierden $(150)(0.02) = 3$ V y quedan $9$ V. Por eso <strong>las luces se atenúan</strong> mientras arrancas.', state: { I: 150 } },
          { text: 'En cortocircuito ($R = 0$), $I = \\varepsilon/r = 600$ A y $V = 0$: toda la energía se queda adentro y la batería se calienta. Nunca unas sus terminales con un cable.', state: { I: 600 } }
        ]
      },
      {
        type: 'callout', heading: 'Potencia: quién da y quién recibe',
        body: [
          'La fem entrega $P = \\varepsilon I$. Una parte se queda en la resistencia interna, $I^2r$, y el resto llega al circuito: $$\\varepsilon I = I^2r + I^2R_{eq}$$ Que esa cuenta cuadre es una gran comprobación de cualquier problema.',
          '¿Con qué carga recibe más potencia el circuito? Con $R$ muy grande casi no pasa corriente, y con $R$ muy chica casi todo se pierde en $r$. El máximo está justo en medio: <strong>cuando $R = r$</strong>, y vale $P_{\\text{máx}} = \\varepsilon^2/(4r)$. A eso se le llama <em>máxima transferencia de potencia</em> (aunque en ese punto la mitad de la energía se calienta dentro de la fuente).'
        ]
      },
      {
        type: 'concept', heading: 'En serie: misma corriente', short: 'Serie',
        body: [
          'Dos resistores están <strong>en serie</strong> si están uno tras otro y en el nodo que comparten no se conecta nada más. La carga no tiene a dónde más ir, así que <strong>la misma corriente</strong> $I$ cruza a todos.',
          'Cada uno «gasta» un pedazo del voltaje, $V_i = IR_i$, y los pedazos suman el total: $$V = IR_1 + IR_2 + IR_3 = I(R_1 + R_2 + R_3)$$ Así que $$R_{eq} = R_1 + R_2 + R_3$$',
          'Tiene sentido: poner resistores en fila es como alargar el alambre, y $R = \\rho L/A$ crece con el largo. El equivalente siempre es <strong>mayor</strong> que el más grande. Y el que tenga más $R$ se lleva el pedazo más grande de voltaje: es un <strong>divisor de voltaje</strong>, $V_k = V\\,R_k/R_{eq}$.'
        ],
        diagram: 'f2s12-series',
        caption: 'Tres resistores en serie: la misma corriente pasa por los tres y sus voltajes se suman.'
      },
      {
        type: 'concept', heading: 'En paralelo: mismo voltaje', short: 'Paralelo',
        body: [
          'Dos o más resistores están <strong>en paralelo</strong> si se conectan a los <strong>mismos dos nodos</strong>. Todos tienen el <strong>mismo voltaje</strong> $V$, y cada uno deja pasar $I_i = V/R_i$.',
          'La corriente que llega al nodo se reparte entre las ramas y luego se vuelve a juntar: $$I = \\frac{V}{R_1} + \\frac{V}{R_2} + \\frac{V}{R_3} \\quad\\Rightarrow\\quad \\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}$$ Para dos: $R_{eq} = \\dfrac{R_1R_2}{R_1 + R_2}$ («producto entre suma»).',
          'Poner resistores en paralelo es como hacer el alambre más grueso (más área $A$): el equivalente es <strong>menor que el más chico</strong>. La rama de menor resistencia se lleva más corriente: es un <strong>divisor de corriente</strong>, $I_1 = I\\,\\dfrac{R_2}{R_1 + R_2}$ para dos ramas.'
        ],
        diagram: 'f2s12-parallel',
        caption: 'Tres resistores en paralelo: los tres ven el mismo $V$ y sus corrientes se suman.'
      },
      {
        type: 'callout', heading: 'Al revés que los capacitores',
        body: [
          'Las ideas físicas son las mismas que en <a href="../sesion-10/">S10</a>: <strong>en serie se comparte lo que fluye</strong> (carga o corriente) y <strong>en paralelo se comparte el voltaje</strong>. Pero las fórmulas se intercambian:',
          'Resistores: serie $R_{eq} = R_1 + R_2$, paralelo $\\dfrac{1}{R_{eq}} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2}$. Capacitores: serie $\\dfrac{1}{C_{eq}} = \\dfrac{1}{C_1} + \\dfrac{1}{C_2}$, paralelo $C_{eq} = C_1 + C_2$.',
          'La razón: la resistencia crece con el largo ($R = \\rho L/A$) y la capacitancia baja con la separación ($C = \\varepsilon_0A/d$). Fila de resistores = alambre más largo = más $R$; fila de capacitores = placas más separadas = menos $C$. Comprobación rápida: dos iguales en serie dan $2R$ (pero $C/2$); en paralelo, $R/2$ (pero $2C$).'
        ]
      },
      {
        type: 'explainer', heading: 'Redes mixtas: reducir y desarmar', short: 'Redes mixtas',
        title: 'De adentro hacia afuera, y de regreso',
        intro: 'Una red mixta se reduce de dos en dos, empezando por los grupos más internos, hasta que queda un solo resistor. Con la fuente sacas la corriente total, y luego «desarmas» en orden inverso para hallar $I$, $V$ y $P$ de cada uno.',
        diagram: 'f2s12-net',
        steps: [
          { text: '$R_1$ y $R_2$ se conectan a los mismos dos nodos: están <strong>en paralelo</strong>. $R_{12} = \\dfrac{(4)(12)}{4 + 12} = 3\\ \\Omega$, menor que el más chico.', state: st({ net: NET, iv: 0, hi: ['1', '2'], eq: [] }) },
          { text: 'Ahora $R_{12}$ y $R_3$ están uno tras otro, sin nada más en medio: <strong>en serie</strong>. $R_{eq} = 3 + 5 = 8\\ \\Omega$.', state: st({ net: NETb, iv: 0, hi: ['12', '3'], eq: ['12'] }) },
          { text: 'Con la fuente: $I = \\dfrac{\\varepsilon}{R_{eq} + r} = \\dfrac{18}{8 + 1} = 2$ A. En las terminales quedan $V = \\varepsilon - Ir = 18 - 2 = 16$ V.', state: st({ net: ['eq', e5.Req], iv: 1, hi: [], eq: [] }) },
          { text: 'Desarmamos: $R_{12}$ y $R_3$ estaban en serie, así que <strong>los dos llevan 2 A</strong>. $V_3 = (2)(5) = 10$ V y $V_{12} = (2)(3) = 6$ V. Suman 16 V, no 18: los otros 2 V se quedaron en $r$.', state: st({ net: NETb, iv: 1, hi: [], eq: ['12'] }) },
          { text: '$R_1$ y $R_2$ estaban en paralelo: <strong>los dos tienen 6 V</strong>. $I_1 = 6/4 = 1.5$ A e $I_2 = 6/12 = 0.5$ A. Suman 2 A, y la rama de <strong>menor</strong> resistencia se lleva más corriente.', state: st({ net: NET, iv: 1, hi: [], eq: [] }) }
        ]
      },
      {
        type: 'concept', heading: 'En tu casa todo va en paralelo', short: 'Casa y focos',
        body: [
          'Cada contacto de tu casa está en paralelo con los demás. Así <strong>cada aparato recibe el voltaje completo</strong> (127 V en México), funciona aunque otro esté apagado, y prender uno más solo agrega corriente sin quitarle voltaje a los otros. El costo: cada aparato nuevo suma corriente en el cable principal; por eso hay un interruptor que corta si pides demasiada.',
          'Las tiras viejas de focos navideños iban en <strong>serie</strong>: una sola trayectoria. Si un foco se fundía, el circuito se abría, la corriente valía cero y <strong>se apagaban todos</strong>; además, cada foco recibía solo un pedazo del voltaje.',
          '¿Qué foco brilla más? El brillo es la potencia. En paralelo (mismo $V$) brilla más el de <strong>menor</strong> $R$, porque $P = V^2/R$. En serie (misma $I$) brilla más el de <strong>mayor</strong> $R$, porque $P = I^2R$. Por eso un foco de 60 W y uno de 100 W en serie dan una sorpresa: brilla más el de 60 W.'
        ],
        diagram: 'f2s12-bulbs',
        caption: 'Un foco fundido abre el circuito. En serie no queda ningún camino; en paralelo las otras ramas siguen conectadas a la fuente.'
      },
      {
        type: 'recipe', heading: 'Receta: resolver una red de resistores', short: 'Receta',
        steps: [
          { text: 'Marca los nodos y busca un par que puedas combinar: <strong>serie</strong> si están uno tras otro y en el nodo que comparten no se conecta nada más; <strong>paralelo</strong> si se conectan a los mismos dos nodos.', tip: 'Dos resistores «que se ven alineados» no siempre están en serie: si en el nodo entre ellos sale otra rama, la corriente se reparte.' },
          { text: 'Combínalos ($R_1 + R_2$ en serie; $\\dfrac{R_1R_2}{R_1 + R_2}$ en paralelo), redibuja y repite de adentro hacia afuera hasta tener $R_{eq}$.', tip: 'Es al revés que con capacitores. En paralelo el resultado es menor que el más chico; si no, usaste la fórmula de serie.' },
          { text: 'Con la fuente: $I = \\dfrac{\\varepsilon}{R_{eq} + r}$ y el voltaje en terminales $V = \\varepsilon - Ir$.', tip: 'No olvides $r$ si el problema la da: va en serie con toda la red.' },
          { text: 'Desarma en orden inverso: en serie, todos con la misma $I$ ($V_i = IR_i$); en paralelo, todos con el mismo $V$ ($I_i = V/R_i$).', tip: 'Un resistor solo tiene el voltaje de la fuente si está conectado directo a sus terminales (y sin $r$). En serie, cada uno tiene un pedazo.' },
          { text: 'Potencias: $P_i = I_iV_i = I_i^2R_i = V_i^2/R_i$, siempre con la $I$ y el $V$ <strong>del mismo resistor</strong>. Comprueba que $\\sum P_i + I^2r = \\varepsilon I$.' }
        ]
      },
      {
        type: 'example', heading: 'Una batería con resistencia interna',
        problem: '<p>Una batería de $\\varepsilon = ' + e1.E + '\\ \\text{V}$ con resistencia interna $r = ' + e1.r + '\\ \\Omega$ alimenta un resistor de $' + e1.R + '\\ \\Omega$. Halla la corriente, el voltaje en las terminales y la potencia en el resistor y en $r$.</p>',
        diagram: 'f2s12-net', state: { net: ['1', e1.R], E: e1.E, r: e1.r, iv: 0 },
        steps: [
          { text: 'La corriente cruza $r$ y $R$ en serie.', math: 'I = \\frac{\\varepsilon}{R + r} = \\frac{' + e1.E + '}{' + e1.R + ' + ' + e1.r + '} = ' + fx(e1.I) + '\\ \\text{A}' },
          { text: 'Voltaje en las terminales.', math: 'V = \\varepsilon - Ir = ' + e1.E + ' - (' + fx(e1.I) + ')(' + e1.r + ') = ' + fx(e1.Vt) + '\\ \\text{V}' },
          { text: 'Potencias.', math: 'P_R = I^2R = ' + fx(e1.PR) + '\\ \\text{W}\\qquad P_r = I^2r = ' + fx(e1.Pr) + '\\ \\text{W}' },
          { text: 'Comprobación: la fem entrega $\\varepsilon I = (' + e1.E + ')(' + fx(e1.I) + ') = ' + fx(e1.PE) + '$ W $= ' + fx(e1.PR) + ' + ' + fx(e1.Pr) + '$ W.' }
        ],
        answer: '$I = ' + fx(e1.I) + '$ A, $V = ' + fx(e1.Vt) + '$ V, $P_R = ' + fx(e1.PR) + '$ W y $P_r = ' + fx(e1.Pr) + '$ W.',
        verify: { lab: 'call', mod: 'resnet', fn: 'solve', args: [L('R1', e1.R), e1.E, e1.r], values: { I: e1.I, Vt: e1.Vt, 'parts.R1.P': e1.PR, Pr: e1.Pr, Pemf: e1.PE } }
      },
      {
        type: 'example', heading: 'El arranque del coche',
        problem: '<p>Una batería de coche tiene $\\varepsilon = ' + e2.E + '\\ \\text{V}$ y $r = ' + e2.r + '\\ \\Omega$. El motor de arranque se comporta como una resistencia de $' + e2.R + '\\ \\Omega$. ¿Cuánta corriente pide y cuánto marca la batería en sus terminales mientras arranca? Compara con los faros, que piden $' + e2.Il + '$ A.</p>',
        steps: [
          { text: 'Corriente del arranque.', math: 'I = \\frac{' + e2.E + '}{' + e2.R + ' + ' + e2.r + '} = ' + fx(e2.I) + '\\ \\text{A}' },
          { text: 'Voltaje en terminales mientras arranca.', math: 'V = ' + e2.E + ' - (' + fx(e2.I) + ')(' + e2.r + ') = ' + fx(e2.Vt) + '\\ \\text{V}' },
          { text: 'Con los faros: $V = ' + e2.E + ' - (' + e2.Il + ')(' + e2.r + ') = ' + fx(e2.Vl) + '$ V. La diferencia de $' + fx(e2.Vl - e2.Vt) + '$ V es lo que ves cuando las luces se atenúan al dar marcha.' }
        ],
        answer: '$I = ' + fx(e2.I) + '$ A y $V = ' + fx(e2.Vt) + '$ V (contra $' + fx(e2.Vl) + '$ V con los faros).',
        verify: { lab: 'call', mod: 'resnet', fn: 'solve', args: [L('R1', e2.R), e2.E, e2.r], values: { I: e2.I, Vt: e2.Vt } }
      },
      {
        type: 'example', heading: 'Tres resistores en serie',
        problem: '<p>Resistores de $2$, $4$ y $6\\ \\Omega$ se conectan en serie a una fuente ideal de $' + e3.V + '\\ \\text{V}$. Halla $R_{eq}$, la corriente y el voltaje de cada uno.</p>',
        diagram: 'f2s12-net', state: { net: ['s', ['1', 2], ['2', 4], ['3', 6]], E: e3.V, r: 0, iv: 0 },
        steps: [
          { text: 'En serie se suman.', math: 'R_{eq} = 2 + 4 + 6 = ' + e3.Req + '\\ \\Omega' },
          { text: 'La misma corriente pasa por los tres.', math: 'I = \\frac{V}{R_{eq}} = \\frac{' + e3.V + '}{' + e3.Req + '} = ' + fx(e3.I) + '\\ \\text{A}' },
          { text: 'Cada voltaje es $IR_i$ (divisor de voltaje).', math: 'V_1 = ' + fx(e3.Vs[0]) + '\\ \\text{V}\\quad V_2 = ' + fx(e3.Vs[1]) + '\\ \\text{V}\\quad V_3 = ' + fx(e3.Vs[2]) + '\\ \\text{V}' },
          { text: 'Comprobación: $' + fx(e3.Vs[0]) + ' + ' + fx(e3.Vs[1]) + ' + ' + fx(e3.Vs[2]) + ' = ' + e3.V + '$ V. El resistor <strong>más grande</strong> se queda con el voltaje más grande (al revés que con capacitores en serie).' }
        ],
        answer: '$R_{eq} = ' + e3.Req + '\\ \\Omega$, $I = ' + fx(e3.I) + '$ A; $V_1 = ' + fx(e3.Vs[0]) + '$, $V_2 = ' + fx(e3.Vs[1]) + '$ y $V_3 = ' + fx(e3.Vs[2]) + '$ V.',
        verify: { lab: 'call', mod: 'resnet', fn: 'solve', args: [Sr(L('R1', 2), L('R2', 4), L('R3', 6)), e3.V, 0], values: { R: e3.Req, I: e3.I, 'parts.R2.V': e3.Vs[1], 'parts.R3.V': e3.Vs[2] } }
      },
      {
        type: 'example', heading: 'Dos resistores en paralelo',
        problem: '<p>Resistores de $' + e4.a + '\\ \\Omega$ y $' + e4.b + '\\ \\Omega$ se conectan en paralelo a una fuente ideal de $' + e4.V + '\\ \\text{V}$. ¿Cuánta corriente pasa por cada uno y cuánta entrega la fuente?</p>',
        steps: [
          { text: 'En paralelo los dos tienen el voltaje de la fuente.', math: 'I_1 = \\frac{' + e4.V + '}{' + e4.a + '} = ' + fx(e4.I1) + '\\ \\text{A}\\qquad I_2 = \\frac{' + e4.V + '}{' + e4.b + '} = ' + fx(e4.I2) + '\\ \\text{A}' },
          { text: 'La fuente entrega la suma, que es lo mismo que $V/R_{eq}$.', math: 'R_{eq} = \\frac{(' + e4.a + ')(' + e4.b + ')}{' + e4.a + ' + ' + e4.b + '} = ' + fx(e4.Req) + '\\ \\Omega\\qquad I = \\frac{' + e4.V + '}{' + fx(e4.Req) + '} = ' + fx(e4.I) + '\\ \\text{A}' },
          { text: 'El de <strong>menor</strong> resistencia se lleva más corriente: el doble, porque tiene la mitad de $R$.' }
        ],
        answer: '$I_1 = ' + fx(e4.I1) + '$ A, $I_2 = ' + fx(e4.I2) + '$ A; la fuente entrega $' + fx(e4.I) + '$ A ($R_{eq} = ' + fx(e4.Req) + '\\ \\Omega$).',
        verify: { lab: 'call', mod: 'resnet', fn: 'solve', args: [Pl(L('R1', e4.a), L('R2', e4.b)), e4.V, 0], values: { R: e4.Req, I: e4.I, 'parts.R1.I': e4.I1, 'parts.R2.I': e4.I2 } }
      },
      {
        type: 'example', heading: 'Red mixta con fuente real: todo, de principio a fin',
        problem: '<p>$R_1 = ' + e5.a + '\\ \\Omega$ y $R_2 = ' + e5.b + '\\ \\Omega$ están en paralelo, y ese par está en serie con $R_3 = ' + e5.c + '\\ \\Omega$. La fuente tiene $\\varepsilon = ' + e5.E + '\\ \\text{V}$ y $r = ' + e5.r + '\\ \\Omega$. Halla la corriente total, el voltaje en terminales y la potencia de cada resistor.</p>',
        diagram: 'f2s12-net', state: { net: NET, E: e5.E, r: e5.r, iv: 0 },
        steps: [
          { text: 'Reduce: primero el paralelo, luego la serie.', math: 'R_{12} = \\frac{(' + e5.a + ')(' + e5.b + ')}{' + e5.a + ' + ' + e5.b + '} = ' + fx(e5.R12) + '\\ \\Omega\\qquad R_{eq} = ' + fx(e5.R12) + ' + ' + e5.c + ' = ' + fx(e5.Req) + '\\ \\Omega' },
          { text: 'Corriente total y voltaje en terminales.', math: 'I = \\frac{' + e5.E + '}{' + fx(e5.Req) + ' + ' + e5.r + '} = ' + fx(e5.I) + '\\ \\text{A}\\qquad V = ' + e5.E + ' - (' + fx(e5.I) + ')(' + e5.r + ') = ' + fx(e5.Vt) + '\\ \\text{V}' },
          { text: 'Desarma la serie: $V_3 = (' + fx(e5.I) + ')(' + e5.c + ') = ' + fx(e5.V3) + '$ V y $V_{12} = (' + fx(e5.I) + ')(' + fx(e5.R12) + ') = ' + fx(e5.V12) + '$ V. Desarma el paralelo: $I_1 = ' + fx(e5.V12) + '/' + e5.a + ' = ' + fx(e5.I1) + '$ A e $I_2 = ' + fx(e5.V12) + '/' + e5.b + ' = ' + fx(e5.I2) + '$ A.' },
          { text: 'Potencias, cada una con lo suyo.', math: 'P_1 = ' + fx(e5.P1) + '\\ \\text{W}\\quad P_2 = ' + fx(e5.P2) + '\\ \\text{W}\\quad P_3 = ' + fx(e5.P3) + '\\ \\text{W}\\quad I^2r = ' + fx(e5.Pr) + '\\ \\text{W}' },
          { text: 'Comprobación: $' + fx(e5.P1) + ' + ' + fx(e5.P2) + ' + ' + fx(e5.P3) + ' + ' + fx(e5.Pr) + ' = ' + fx(e5.PE) + '$ W, que es $\\varepsilon I = (' + e5.E + ')(' + fx(e5.I) + ')$. Todo cuadra.' }
        ],
        answer: '$I = ' + fx(e5.I) + '$ A, $V = ' + fx(e5.Vt) + '$ V; $P_1 = ' + fx(e5.P1) + '$ W, $P_2 = ' + fx(e5.P2) + '$ W y $P_3 = ' + fx(e5.P3) + '$ W.',
        verify: { lab: 'call', mod: 'resnet', fn: 'solve', args: [e5.tree, e5.E, e5.r], values: { R: e5.Req, I: e5.I, Vt: e5.Vt, 'parts.R1.I': e5.I1, 'parts.R2.P': e5.P2, 'parts.R3.P': e5.P3, Pemf: e5.PE, sumP: e5.P1 + e5.P2 + e5.P3 } }
      },
      {
        type: 'example', heading: 'Máxima transferencia de potencia',
        problem: '<p>Una fuente con $\\varepsilon = ' + e6.E + '\\ \\text{V}$ y $r = ' + e6.r + '\\ \\Omega$ alimenta una carga $R$. Compara la potencia en la carga con $R = 1$, $2$ y $4\\ \\Omega$. ¿Cuál es la máxima posible?</p>',
        steps: [
          { text: 'Con $R$ cualquiera: $P = I^2R = \\dfrac{\\varepsilon^2R}{(R + r)^2}$.' },
          { text: 'Sustituye.', math: 'P(1) = ' + fx(e6.P(1)) + '\\ \\text{W}\\qquad P(2) = ' + fx(e6.P(2)) + '\\ \\text{W}\\qquad P(4) = ' + fx(e6.P(4)) + '\\ \\text{W}' },
          { text: 'El máximo está en $R = r$: $P_{\\text{máx}} = \\dfrac{\\varepsilon^2}{4r} = \\dfrac{' + e6.E + '^2}{4(' + e6.r + ')} = ' + fx(e6.Pmax) + '$ W. Más chica o más grande, la carga recibe menos.' }
        ],
        answer: 'El máximo es con $R = r = ' + e6.r + '\\ \\Omega$: $P_{\\text{máx}} = ' + fx(e6.Pmax) + '$ W.',
        verify: { lab: 'call', mod: 'resnet', fn: 'maxPower', args: [e6.E, e6.r], values: { R: e6.r, P: e6.Pmax } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿La fem y el voltaje de la batería son lo mismo?', a: 'Solo cuando no sale corriente. Con corriente, en las terminales hay $V = \\varepsilon - Ir$, un poco menos. La fem es lo que la batería «empuja»; el voltaje en terminales es lo que te llega.' },
          { q: '¿Por qué en paralelo la resistencia baja si estoy agregando resistores?', a: 'Porque cada rama nueva es <strong>otro camino</strong> para la corriente. Con el mismo voltaje pasa más corriente en total, y eso es lo mismo que decir que la resistencia equivalente bajó.' },
          { q: '¿Cada resistor de la red tiene el voltaje de la fuente?', a: 'Solo si está conectado directo a sus terminales (en paralelo con ella). En serie, el voltaje se reparte, y al <strong>más grande</strong> le toca el pedazo más grande ($V_i = IR_i$). Y si la fuente tiene $r$, ni siquiera el de afuera recibe toda la fem.' },
          { q: '¿Por qué en serie el de mayor $R$ tiene más voltaje, pero con capacitores era el más chico?', a: 'En serie todos comparten lo que fluye. Con resistores, $V = IR$: misma $I$, más $R$ da más $V$. Con capacitores, $V = Q/C$: misma $Q$, menos $C$ da más $V$.' },
          { q: '¿Qué fórmula de potencia uso: $IV$, $I^2R$ o $V^2/R$?', a: 'Las tres son la misma para un resistor, si usas su propia $I$ y su propio $V$. Elige la que tenga los datos que ya conoces. El error típico es mezclar la corriente de un resistor con el voltaje de toda la fuente.' },
          { q: '¿Por qué no conectan los focos de la casa en serie para gastar menos?', a: 'En serie cada aparato recibiría solo una parte del voltaje, todos tendrían que estar prendidos a la vez y, si uno se apaga o se funde, se apagan todos. En paralelo cada uno es independiente y recibe los 127 V completos.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Fuente real: fem $\\varepsilon$ en serie con $r$; $I = \\varepsilon/(R_{eq} + r)$ y $V = \\varepsilon - Ir$. La fem entrega $\\varepsilon I = I^2r + I^2R_{eq}$, máxima en la carga cuando $R = r$.',
          'Serie: misma $I$, los voltajes se suman, $R_{eq} = \\sum R_i$ (mayor que la más grande); divisor de voltaje $V_k = VR_k/R_{eq}$.',
          'Paralelo: mismo $V$, las corrientes se suman, $1/R_{eq} = \\sum 1/R_i$ (menor que la más chica); la rama de menor $R$ lleva más corriente. Al revés que con capacitores.',
          'Red mixta: reduce de adentro hacia afuera, saca $I$ con la fuente y desarma en orden inverso; $P_i = I_iV_i$ con lo de cada resistor. En casa, todo en paralelo.'
        ]
      }
    ],

    lab: {
      type: 'resistor-network', title: 'Reduce la red',
      intro: 'Elige dos resistores (tócalos en el circuito o escógelos en las listas) y el lab los combina si están en serie o en paralelo; si no lo están, te explica por qué. La fuente tiene una resistencia interna $r$ que puedes mover. Cuando quede uno solo, calcula $R_{eq}$, la corriente total, el voltaje en terminales o la corriente, el voltaje o la potencia de un resistor y compruébalo: el lab detecta las fórmulas de serie y paralelo cruzadas, la $r$ olvidada, el voltaje de la fuente usado donde no va, la corriente total en un solo resistor y la potencia calculada con el voltaje total. Al final, desarma la red paso a paso para ver $I$ y $V$ de cada uno.',
      cfg: { preset: 2 }
    },

    formulas: [
      { label: 'Fuente real', tex: 'I = \\frac{\\varepsilon}{R_{eq} + r} \\qquad V = \\varepsilon - Ir' },
      { label: 'Serie', tex: 'R_{eq} = R_1 + R_2 + \\cdots' },
      { label: 'Paralelo', tex: '\\frac{1}{R_{eq}} = \\frac{1}{R_1} + \\frac{1}{R_2} + \\cdots' },
      { label: 'Dos en paralelo', tex: 'R_{eq} = \\frac{R_1R_2}{R_1 + R_2}' },
      { label: 'Divisores', tex: 'V_k = V\\frac{R_k}{R_{eq}} \\qquad I_1 = I\\frac{R_2}{R_1 + R_2}' },
      { label: 'Potencia', tex: 'P = IV = I^2R = \\frac{V^2}{R} \\qquad \\varepsilon I = I^2r + I^2R_{eq}' },
      { label: 'Máxima transferencia', tex: 'R = r \\;\\Rightarrow\\; P_{\\text{máx}} = \\frac{\\varepsilon^2}{4r}' }
    ],

    exercises: [
      {
        id: 'f2-s12-mixta', title: 'Equivalente de una red mixta',
        vars: { a: [1, 12, 1], b: [1, 12, 1], c: [1, 12, 1] },
        prompt: function (v) { return '<p>$R_1 = ' + v.a + '\\ \\Omega$ y $R_2 = ' + v.b + '\\ \\Omega$ están en paralelo, y ese par está en serie con $R_3 = ' + v.c + '\\ \\Omega$. ¿Cuál es la resistencia equivalente de la red, en Ω?</p>'; },
        check: 'numeric', unit: 'Ω',
        answer: mixEq,
        mistakes: {
          swap: swapEq,
          allSer: function (v) { return v.a + v.b + v.c; },
          allPar: function (v) { return 1 / (1 / v.a + 1 / v.b + 1 / v.c); }
        },
        feedback: [
          { when: 'swap', say: 'Cruzaste las fórmulas: el par $R_1, R_2$ está en paralelo (producto entre suma) y el resultado va en serie con $R_3$ (se suma). Con resistores es al revés que con capacitores.' },
          { when: 'allSer', say: 'Sumaste los tres como si estuvieran en serie; $R_1$ y $R_2$ están en paralelo entre sí.' },
          { when: 'allPar', say: 'Pusiste los tres en paralelo; $R_3$ está en serie con el par.' }
        ],
        oracle: { lab: 'value', value: function (v) { var o = nodal(mix(v), 1, 0); return 1 / o.I; } },
        hint: 'Primero $R_{12} = \\dfrac{R_1R_2}{R_1 + R_2}$; luego $R_{eq} = R_{12} + R_3$.',
        solution: function (v) { var r12 = par2(v.a, v.b); return '$$R_{12} = \\frac{(' + v.a + ')(' + v.b + ')}{' + v.a + ' + ' + v.b + '} = ' + fx(r12, 3) + '\\ \\Omega \\qquad R_{eq} = ' + fx(r12, 3) + ' + ' + v.c + ' = ' + fx(mixEq(v)) + '\\ \\Omega$$'; }
      },
      {
        id: 'f2-s12-corriente', title: 'Corriente total con resistencia interna',
        vars: { a: [1, 12, 1], b: [1, 12, 1], c: [1, 12, 1], E: [6, 24, 3], r: [0.5, 2, 0.5] },
        prompt: function (v) { return '<p>$R_1 = ' + v.a + '\\ \\Omega$ y $R_2 = ' + v.b + '\\ \\Omega$ están en paralelo, y ese par está en serie con $R_3 = ' + v.c + '\\ \\Omega$. La red se conecta a una batería de fem $\\varepsilon = ' + v.E + '\\ \\text{V}$ y resistencia interna $r = ' + v.r + '\\ \\Omega$. ¿Cuánta corriente entrega la batería, en A?</p>'; },
        check: 'numeric', unit: 'A',
        answer: function (v) { return v.E / (mixEq(v) + v.r); },
        mistakes: {
          noR: function (v) { return v.E / mixEq(v); },
          swap: function (v) { return v.E / (swapEq(v) + v.r); }
        },
        feedback: [
          { when: 'noR', say: 'Olvidaste la resistencia interna: va en serie con toda la red, $I = \\varepsilon/(R_{eq} + r)$.' },
          { when: 'swap', say: 'Revisa $R_{eq}$: cruzaste las fórmulas de serie y paralelo.' }
        ],
        oracle: { lab: 'value', value: function (v) { return nodal(mix(v), v.E, v.r).I; } },
        hint: 'Reduce la red a $R_{eq}$ y luego $I = \\dfrac{\\varepsilon}{R_{eq} + r}$.',
        solution: function (v) { var R = mixEq(v); return '$R_{eq} = ' + fx(par2(v.a, v.b), 3) + ' + ' + v.c + ' = ' + fx(R, 3) + '\\ \\Omega$. $$I = \\frac{' + v.E + '}{' + fx(R, 3) + ' + ' + v.r + '} = ' + fx(v.E / (R + v.r)) + '\\ \\text{A}$$'; }
      },
      {
        id: 'f2-s12-terminal', title: 'Voltaje en las terminales',
        vars: { R: [1, 20, 1], E: [6, 24, 1.5], r: [0.1, 2, 0.1] },
        prompt: function (v) { return '<p>Una batería de fem $\\varepsilon = ' + v.E + '\\ \\text{V}$ y resistencia interna $r = ' + v.r + '\\ \\Omega$ alimenta un resistor de $' + v.R + '\\ \\Omega$. ¿Qué voltaje marca un voltímetro conectado a las terminales de la batería, en V?</p>'; },
        check: 'numeric', unit: 'V',
        answer: function (v) { return v.E - v.E / (v.R + v.r) * v.r; },
        mistakes: {
          noR: function (v) { return v.E; },
          sign: function (v) { return v.E + v.E / (v.R + v.r) * v.r; }
        },
        feedback: [
          { when: 'noR', say: 'Esa es la fem. Con corriente, una parte se pierde adentro: $V = \\varepsilon - Ir$.' },
          { when: 'sign', say: 'Dentro de la batería la corriente <strong>pierde</strong> $Ir$: se resta, no se suma.' }
        ],
        oracle: { lab: 'value', value: function (v) { return nodal(L('R1', v.R), v.E, v.r).Vt; } },
        hint: 'Primero $I = \\dfrac{\\varepsilon}{R + r}$; luego $V = \\varepsilon - Ir$ (o $V = IR$).',
        solution: function (v) { var I = v.E / (v.R + v.r); return '$$I = \\frac{' + v.E + '}{' + v.R + ' + ' + v.r + '} = ' + fx(I, 4) + '\\ \\text{A} \\qquad V = ' + v.E + ' - (' + fx(I, 4) + ')(' + v.r + ') = ' + fx(v.E - I * v.r) + '\\ \\text{V}$$ Comprobación: $IR = ' + fx(I * v.R) + '$ V.'; }
      },
      {
        id: 'f2-s12-rama', title: 'Corriente en una rama (divisor de corriente)',
        vars: { a: [1, 12, 1], b: [1, 12, 1], c: [1, 12, 1], V: [6, 24, 3] },
        baseWhere: function (v) { return v.a !== v.b; },
        prompt: function (v) { return '<p>$R_1 = ' + v.a + '\\ \\Omega$ y $R_2 = ' + v.b + '\\ \\Omega$ están en paralelo, y ese par está en serie con $R_3 = ' + v.c + '\\ \\Omega$. La red se conecta a una fuente ideal de $' + v.V + '\\ \\text{V}$. ¿Cuánta corriente pasa por $R_1$, en A?</p>'; },
        check: 'numeric', unit: 'A',
        answer: function (v) { var I = v.V / mixEq(v); return I * v.b / (v.a + v.b); },
        mistakes: {
          iTotal: function (v) { return v.V / mixEq(v); },
          swapDiv: function (v) { var I = v.V / mixEq(v); return I * v.a / (v.a + v.b); },
          vTotal: function (v) { return v.V / v.a; }
        },
        feedback: [
          { when: 'iTotal', say: 'Esa es la corriente total. En el paralelo se reparte entre $R_1$ y $R_2$.' },
          { when: 'swapDiv', say: 'Invertiste el divisor: la rama de <strong>menor</strong> resistencia se lleva más, $I_1 = I\\,R_2/(R_1 + R_2)$.' },
          { when: 'vTotal', say: '$R_1$ no tiene todo el voltaje: el par está en serie con $R_3$ y solo le toca $V_{12} = IR_{12}$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return nodal(mix(v), v.V, 0).parts.R1.I; } },
        hint: 'Calcula $I = V/R_{eq}$, luego $V_{12} = IR_{12}$ y por último $I_1 = V_{12}/R_1$.',
        solution: function (v) { var R = mixEq(v), I = v.V / R, v12 = I * par2(v.a, v.b); return '$R_{eq} = ' + fx(R, 3) + '\\ \\Omega$, $I = ' + fx(I, 4) + '$ A, $V_{12} = IR_{12} = ' + fx(v12, 3) + '$ V. $$I_1 = \\frac{V_{12}}{R_1} = \\frac{' + fx(v12, 3) + '}{' + v.a + '} = ' + fx(v12 / v.a) + '\\ \\text{A}$$'; }
      },
      {
        id: 'f2-s12-potencia', title: 'Potencia en un resistor',
        vars: { a: [1, 12, 1], b: [1, 12, 1], c: [1, 12, 1], E: [6, 24, 3], r: [0.5, 2, 0.5] },
        prompt: function (v) { return '<p>$R_1 = ' + v.a + '\\ \\Omega$ y $R_2 = ' + v.b + '\\ \\Omega$ en paralelo, en serie con $R_3 = ' + v.c + '\\ \\Omega$, conectados a una batería de $\\varepsilon = ' + v.E + '\\ \\text{V}$ con $r = ' + v.r + '\\ \\Omega$. ¿Cuánta potencia disipa $R_3$, en W?</p>'; },
        check: 'numeric', unit: 'W',
        answer: function (v) { var I = v.E / (mixEq(v) + v.r); return I * I * v.c; },
        mistakes: {
          vTotal: function (v) { return v.E * v.E / v.c; },
          pTotal: function (v) { return v.E * v.E / (mixEq(v) + v.r); },
          noR: function (v) { var I = v.E / mixEq(v); return I * I * v.c; }
        },
        feedback: [
          { when: 'vTotal', say: 'Usaste $\\varepsilon^2/R_3$, pero $R_3$ no tiene todo el voltaje. Usa $P = I^2R_3$ con la corriente que lo cruza.' },
          { when: 'pTotal', say: 'Multiplicaste la corriente por la fem: esa es la potencia que entrega la batería, no la de $R_3$. Usa $P = I^2R_3$.' },
          { when: 'noR', say: 'Olvidaste la resistencia interna al calcular la corriente.' }
        ],
        oracle: { lab: 'value', value: function (v) { return nodal(mix(v), v.E, v.r).parts.R3.P; } },
        hint: '$R_3$ está en serie con todo: lleva la corriente total $I = \\varepsilon/(R_{eq} + r)$. Luego $P_3 = I^2R_3$.',
        solution: function (v) { var R = mixEq(v), I = v.E / (R + v.r); return '$R_{eq} = ' + fx(R, 3) + '\\ \\Omega$ e $I = \\dfrac{' + v.E + '}{' + fx(R, 3) + ' + ' + v.r + '} = ' + fx(I, 4) + '$ A. $$P_3 = I^2R_3 = (' + fx(I, 4) + ')^2(' + v.c + ') = ' + fx(I * I * v.c) + '\\ \\text{W}$$'; }
      },
      {
        id: 'f2-s12-focos', title: 'Concepto: ¿qué foco brilla más?',
        vars: {},
        prompt: function () { return '<p>Un foco de 60 W y otro de 100 W (los dos hechos para 127 V) se conectan <strong>en serie</strong> a un contacto de 127 V. ¿Cuál brilla más?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'El de 60 W', correct: true },
            { text: 'El de 100 W', say: 'Eso pasa en paralelo, donde los dos tienen 127 V. En serie llevan la misma corriente y $P = I^2R$: brilla más el de mayor resistencia.' },
            { text: 'Brillan igual, porque llevan la misma corriente', say: 'La corriente es la misma, pero sus resistencias no: $P = I^2R$ es mayor en el de más $R$.' },
            { text: 'Ninguno enciende', say: 'Sí circula corriente; solo que cada uno recibe una parte del voltaje y brillan menos que en paralelo.' }
          ];
        },
        answer: function () { return 'El de 60 W'; },
        hint: 'De $P = V^2/R$ a 127 V, ¿cuál tiene más resistencia? En serie (misma $I$), $P = I^2R$.',
        solution: function () { return 'A 127 V, $R = V^2/P$: el de 60 W tiene $R \\approx 269\\ \\Omega$ y el de 100 W, $R \\approx 161\\ \\Omega$. En serie llevan la misma corriente, y con $P = I^2R$ brilla más el de mayor resistencia: <strong>el de 60 W</strong>.'; }
      }
    ],

    quiz: { tags: ['f2.S12'], count: 8 },

    errors: [
      'Cruzar las fórmulas: sumar resistores en paralelo o usar producto entre suma en serie (es al revés que con capacitores).',
      'Olvidar invertir al final: $\\sum 1/R_i$ es $1/R_{eq}$, no $R_{eq}$.',
      'Olvidar la resistencia interna: $I = \\varepsilon/R_{eq}$ en vez de $\\varepsilon/(R_{eq} + r)$, o decir que en las terminales hay $\\varepsilon$.',
      'Darle a un resistor en serie todo el voltaje de la fuente.',
      'Darle a un resistor en paralelo toda la corriente; o invertir el divisor (la rama de menor $R$ lleva <strong>más</strong> corriente).',
      'Calcular la potencia de un resistor con el voltaje total ($P = \\varepsilon I_i$ o $\\varepsilon^2/R_i$) en lugar del suyo.'
    ],

    teacher: {
      plan: [
        'Empieza con la fuente real: el arranque del coche y el explainer de $V$ contra $I$. Mide con un multímetro una pila nueva y otra gastada, con y sin carga.',
        'Serie y paralelo con el argumento del largo y el área ($R = \\rho L/A$); compara de frente con los capacitores de S10.',
        'Explainer de reducir y desarmar con la red de los ejemplos; luego el lab con $r = 0$ y con $r \\ne 0$.',
        'Cierra con la casa en paralelo, los focos en serie y la pregunta de qué foco brilla más.'
      ],
      check: [
        'Que justifiquen cada combinación («mismos dos nodos», «nada más en el nodo entre ellos»).',
        'Que comprueben con $\\sum V_i = V$ en serie, $\\sum I_i = I$ en paralelo y $\\varepsilon I = I^2r + \\sum I_i^2R_i$.'
      ],
      note: 'Los circuitos que no se reducen en serie y en paralelo (puentes, varias fuentes) quedan para Kirchhoff en S13 y S14. La máxima transferencia se ve solo como cierre: no hace falta derivar.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §10.1 “Electromotive Force”. <a href="https://openstax.org/books/university-physics-volume-2/pages/10-1-electromotive-force">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §10.2 “Resistors in Series and Parallel”. <a href="https://openstax.org/books/university-physics-volume-2/pages/10-2-resistors-in-series-and-parallel">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-11',
    next: 'sesion-13'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
