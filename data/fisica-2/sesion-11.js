/* =====================================================================
   Física 2 · S11 · Corriente, resistividad, ley de Ohm y potencia
   (bloque C · Circuitos).
   Fuente: OpenStax, University Physics Volume 2, §9.1–§9.5 (CC BY-NC-SA 4.0).
   e = 1.60 × 10⁻¹⁹ C; ρ y α de la tabla 9.1 de OpenStax; SI.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.ohm (lab iv-curve).
   ===================================================================== */
(function () {
  var e = 1.60e-19, RHO_CU = 1.72e-8, N_CU = 8.47e28, A_CU = 3.9e-3, A_W = 4.5e-3;
  var ET = '$e = 1.60\\times 10^{-19}\\ \\text{C}$';
  var CU = '$\\rho_{Cu} = 1.72\\times 10^{-8}\\ \\Omega\\cdot\\text{m}$';
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  // Número en notación científica para LaTeX: 2.65 \times 10^{7}.
  function sci(v, d) {
    if (v === 0) return '0';
    var n = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, n);
    if (Math.abs(fx(m, d == null ? 2 : d)) >= 10) { m /= 10; n += 1; }
    return fx(m, d == null ? 2 : d) + '\\times 10^{' + n + '}';
  }
  // Resultado legible: decimales si es «normal», notación científica si es muy chico o muy grande.
  function nice(v, d) { var a = Math.abs(v); return a !== 0 && (a < 0.01 || a >= 1e5) ? sci(v, d) : fx(v, d == null ? 2 : d + 1); }
  function areaD(dmm) { return Math.PI * Math.pow(dmm / 2000, 2); }
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

  // Ejemplo 1: electrones por segundo con 2.5 A.
  var e1 = { I: 2.5 }; e1.N = e1.I / e;
  // Ejemplo 2: alambre de cobre de 20 m y 1.0 mm de diámetro.
  var e2 = { L: 20, d: 1.0 }; e2.A = areaD(e2.d); e2.R = RHO_CU * e2.L / e2.A;
  // Ejemplo 3: deriva en ese alambre con 5 A.
  var e3 = { I: 5 }; e3.v = e3.I / (N_CU * e * e2.A); e3.J = e3.I / e2.A; e3.t = e2.L / e3.v;
  // Ejemplo 4: plancha de 12 Ω a 127 V.
  var e4 = { R: 12, V: 127 }; e4.I = e4.V / e4.R; e4.P = e4.V * e4.V / e4.R;
  // Ejemplo 5: secadora de 1500 W, 20 min al día, 30 días, 1.50 pesos/kWh.
  var e5 = { P: 1500, h: 1 / 3, days: 30, price: 1.5 }; e5.kWh = e5.P / 1000 * e5.h * e5.days; e5.cost = e5.kWh * e5.price;
  // Ejemplo 6: foco de 60 W a 127 V con 22 Ω en frío.
  var e6 = { P: 60, V: 127, R0: 22 }; e6.R = e6.V * e6.V / e6.P; e6.I = e6.P / e6.V; e6.dT = (e6.R / e6.R0 - 1) / A_W;

  var data = window.SESSION_DATA = {
    slug: 'sesion-11', number: '11', group: 'C · Circuitos',
    title: 'Corriente, resistividad, ley de Ohm y potencia', temario: [],
    minutes: 180,
    quote: 'Los electrones avanzan más lento que un caracol, pero el foco prende al instante: el cable ya estaba lleno de ellos.',
    badges: [
      'Calcular la corriente $I = dQ/dt$ y cuántos electrones por segundo la forman.',
      'Relacionar la corriente con la velocidad de deriva: $I = nqv_dA$.',
      'Calcular la resistencia de un alambre con $R = \\rho L/A$ y su cambio con la temperatura.',
      'Usar la ley de Ohm, $V = IR$, y distinguir un elemento óhmico de uno que no lo es.',
      'Calcular la potencia ($P = IV = I^2R = V^2/R$), la energía en kWh y su costo en pesos.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Hasta ahora las cargas estaban quietas. Si conectas un alambre a una pila, adentro aparece un campo eléctrico y las cargas libres empiezan a moverse: eso es una <strong>corriente</strong>. Cuánto cuesta empujarlas lo dice la <strong>resistencia</strong>.',
        recall: [
          'Potencial y diferencia de potencial: $\\Delta U = q\\,\\Delta V$; en un campo uniforme, $\\Delta V = -Ed$ (S05).',
          'Conductores: tienen cargas libres que se mueven con cualquier campo (S01).',
          'Potencia como energía por unidad de tiempo, $P = W/t$ (Física 1, S12).'
        ],
        why: 'Cada aparato de tu casa trae escrito cuántos watts consume y a cuántos volts funciona. Con eso sabes qué corriente jala, qué cable necesita para no calentarse y cuánto te va a costar al mes en el recibo de la luz.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en una manguera <strong>ya llena</strong> de agua. Abres la llave y el agua sale por la punta al instante, aunque la gota que acaba de entrar tarde en llegar. Un cable es igual: está lleno de electrones libres, y al conectarlo todos empiezan a moverse a la vez.',
          'La corriente es como contar a la gente que cruza la puerta del metro: no importa qué tan rápido camina cada quien, sino cuántas personas cruzan por segundo. Mucha gente caminando despacio puede ser un flujo enorme.',
          'Y la resistencia es el pasillo: uno largo y angosto, lleno de obstáculos, cuesta más cruzarlo que uno corto y ancho. Si además la gente del pasillo se agita (más temperatura), cuesta todavía más.'
        ]
      },
      {
        type: 'concept', heading: 'Corriente eléctrica', short: 'Corriente',
        body: [
          'La <strong>corriente eléctrica</strong> es cuánta carga cruza una sección del conductor por unidad de tiempo: $$I = \\frac{dQ}{dt}\\qquad 1\\ \\text{A} = 1\\ \\text{C/s}$$ Si la corriente es constante, $I = \\Delta Q/\\Delta t$.',
          'En un metal lo que se mueve son los electrones, que son negativos. Por una convención histórica, el <strong>sentido de la corriente</strong> es el que tendría una carga positiva: del lado de mayor potencial al de menor, <strong>al revés</strong> de como van los electrones. Las cuentas salen iguales: mover cargas negativas a la izquierda equivale a mover positivas a la derecha.',
          'Cada electrón lleva $e = 1.60\\times 10^{-19}$ C, así que en una corriente de 1 A cruzan $1/e = 6.25\\times 10^{18}$ electrones por segundo.'
        ],
        diagram: 'f2s11-current',
        caption: 'Los electrones van hacia la izquierda; la corriente convencional $I$, hacia la derecha. Lo que se mide es cuánta carga cruza la sección $A$ cada segundo.'
      },
      {
        type: 'explainer', heading: 'De los electrones a la corriente', short: 'Velocidad de deriva',
        title: 'Velocidad de deriva',
        intro: '¿Qué tan rápido avanzan los electrones dentro de un cable? Armemos la corriente a partir de su movimiento.',
        diagram: 'f2s11-drift',
        steps: [
          { text: 'Sin voltaje, los electrones libres se mueven muy rápido (unos $10^6$ m/s), pero al azar: chocan con los iones del metal y cambian de rumbo. En promedio no avanzan: $I = 0$.', state: { k: 0 } },
          { text: 'Al conectar la pila aparece un campo $\\vec E$ dentro del alambre. Empuja a los electrones en sentido contrario a $\\vec E$: entre choque y choque ganan un poquito de velocidad. En promedio avanzan con la <strong>velocidad de deriva</strong> $v_d$, de décimas de milímetro por segundo.', state: { k: 1 } },
          { text: 'En un tiempo $dt$, cruzan la sección $A$ todos los electrones dentro de un cilindro de largo $v_d\\,dt$. Ese cilindro tiene volumen $A\\,v_d\\,dt$; con $n$ portadores por metro cúbico, cada uno con carga $q$: $$dQ = q\\,n\\,A\\,v_d\\,dt$$', state: { k: 2 } },
          { text: 'Divide entre $dt$: $$I = nqv_dA \\qquad J = \\frac{I}{A} = nqv_d$$ $J$ es la <strong>densidad de corriente</strong> (A/m²). En el cobre $n = 8.47\\times 10^{28}\\ \\text{m}^{-3}$: tantísimos portadores compensan una $v_d$ diminuta.', state: { k: 3 } }
        ]
      },
      {
        type: 'callout', heading: '¿Por qué el foco prende al instante?',
        body: [
          'Con $v_d \\approx 10^{-4}$ m/s, un electrón tarda horas en recorrer un cable de unos metros. Pero no hace falta que llegue: el alambre <strong>ya está lleno</strong> de electrones libres. Al cerrar el interruptor, el campo eléctrico se establece en todo el cable casi a la velocidad de la luz, y todos empiezan a derivar a la vez, como el agua en una manguera llena.',
          'Lo que viaja rápido es la señal (el campo), no las cargas. La energía que llega al foco la lleva el campo; los electrones solo la van entregando donde hay resistencia.'
        ]
      },
      {
        type: 'concept', heading: 'Resistividad y resistencia', short: 'Resistividad',
        body: [
          'Para que haya corriente hace falta un campo dentro del alambre. En un alambre uniforme de largo $L$ con una diferencia de potencial $V$ entre sus extremos, el campo es uniforme y, como en <a href="../sesion-05/">S05</a> ($\\Delta V = -Ed$), vale $$E = \\frac{V}{L}$$',
          'La <strong>resistividad</strong> $\\rho$ del material dice cuánto campo hace falta para cada amper por metro cuadrado: $E = \\rho J$. Sustituye $E = V/L$ y $J = I/A$: $V/L = \\rho I/A$, o sea $V = I\\,(\\rho L/A)$. Lo que multiplica a $I$ es la <strong>resistencia</strong>: $$R = \\frac{\\rho L}{A}\\qquad 1\\ \\Omega = 1\\ \\text{V/A}$$',
          'La resistividad es del <strong>material</strong> (en $\\Omega\\cdot\\text{m}$); la resistencia es de <strong>ese alambre</strong>, con su largo y su grosor. Algunos valores a 20 °C:'
        ],
        list: [
          'Cobre: $\\rho = 1.72\\times 10^{-8}\\ \\Omega\\cdot\\text{m}$ (los cables de tu casa).',
          'Aluminio: $\\rho = 2.65\\times 10^{-8}\\ \\Omega\\cdot\\text{m}$ (líneas de alta tensión: es ligero).',
          'Tungsteno: $\\rho = 5.6\\times 10^{-8}\\ \\Omega\\cdot\\text{m}$ (filamento de los focos).',
          'Nicromo: $\\rho = 1.00\\times 10^{-6}\\ \\Omega\\cdot\\text{m}$, casi 60 veces el cobre (resistencias de parrillas y secadoras).'
        ]
      },
      {
        type: 'explainer', heading: 'Largo y grosor del alambre', short: 'R = ρL/A',
        title: 'Cómo cambia R con L y con d',
        intro: 'Antes de memorizar $R = \\rho L/A$, entiende por qué el largo multiplica y el área divide.',
        diagram: 'f2s11-wire',
        steps: [
          { text: 'Un alambre de largo $L$ y diámetro $d$. Su sección es un círculo de radio $d/2$: $$A = \\pi\\left(\\frac{d}{2}\\right)^2 = \\frac{\\pi d^2}{4}$$ Llamemos $R$ a su resistencia.', state: { sl: 1, sd: 1 } },
          { text: 'Duplica el largo: es como poner dos alambres iguales uno tras otro. Cada electrón tiene el doble de camino con choques: $R \\to 2R$.', state: { sl: 2, sd: 1 } },
          { text: 'Regresa al largo original y duplica el diámetro: el área crece $2^2 = 4$ veces, como 4 alambres lado a lado. Hay 4 veces más caminos: $R \\to R/4$.', state: { sl: 1, sd: 2 } },
          { text: 'Las dos cosas a la vez: $R \\to \\dfrac{2}{4}R = \\dfrac{R}{2}$. Ojo: el diámetro cuenta <strong>al cuadrado</strong>, porque el área va con $d^2$.', state: { sl: 2, sd: 2 } }
        ]
      },
      {
        type: 'callout', heading: 'La temperatura también cuenta',
        body: [
          'Al calentarse, los iones del metal vibran más y los electrones chocan más: la resistividad de un metal <strong>crece</strong> con la temperatura. Para cambios moderados, $$R = R_0(1 + \\alpha\\,\\Delta T)$$ con $\\alpha$ el coeficiente de temperatura: $3.9\\times 10^{-3}\\ /^\\circ\\text{C}$ en el cobre, $4.5\\times 10^{-3}\\ /^\\circ\\text{C}$ en el tungsteno y apenas $0.4\\times 10^{-3}\\ /^\\circ\\text{C}$ en el nicromo.',
          'Un foco incandescente encendido tiene su filamento a unos 2500 °C: su resistencia caliente es más de 10 veces la que mides con el foco frío.'
        ]
      },
      {
        type: 'concept', heading: 'Ley de Ohm', short: 'Ley de Ohm',
        body: [
          'Si $R$ no depende del voltaje ni de la corriente, la corriente es proporcional al voltaje: $$V = IR$$ Es la <strong>ley de Ohm</strong>. Duplicas el voltaje y se duplica la corriente.',
          'Para comprobarla se mide: un <strong>amperímetro</strong> en serie con el elemento (le pasa la misma corriente) y un <strong>voltímetro</strong> en paralelo (mide la diferencia de potencial entre sus extremos).',
          'Al cruzar un resistor en el sentido de la corriente, el potencial <strong>baja</strong> $IR$: la corriente va del lado de mayor potencial al de menor, como una pelota cuesta abajo.'
        ],
        diagram: 'f2s11-circuit',
        caption: 'El amperímetro va en serie y el voltímetro en paralelo con el resistor. Con sus lecturas, $R = V/I$.'
      },
      {
        type: 'concept', heading: 'Óhmico y no óhmico', short: 'Óhmico o no',
        body: [
          'El cociente $R = V/I$ siempre se puede calcular en un punto. La ley de Ohm dice algo más: que ese cociente es <strong>el mismo para todos los voltajes</strong>. En una gráfica de $I$ contra $V$, eso es una recta que pasa por el origen con pendiente $1/R$. Los elementos que la cumplen se llaman <strong>óhmicos</strong>.',
          'Muchos no la cumplen:'
        ],
        list: [
          '<strong>Foco:</strong> al subir $V$ el filamento se calienta y $R$ crece; la curva se dobla hacia abajo.',
          '<strong>Diodo:</strong> casi no conduce hasta unos 0.7 V; después la corriente se dispara. En sentido inverso, casi nada.',
          '<strong>Resistor o alambre a temperatura fija:</strong> recta. Es óhmico.'
        ],
        diagram: 'f2s11-iv',
        caption: 'Curvas $I$–$V$: el resistor da una recta por el origen; el foco se dobla; el diodo solo conduce hacia un lado y después de unos 0.7 V. Trázalas tú en el lab.'
      },
      {
        type: 'concept', heading: 'Potencia eléctrica', short: 'Potencia',
        body: [
          'Cada coulomb que cruza una diferencia de potencial $V$ entrega $V$ joules (S05: $\\Delta U = q\\,\\Delta V$). Si cruzan $I$ coulombs por segundo, la energía por segundo es $$P = IV$$ en watts: $1\\ \\text{W} = 1\\ \\text{J/s} = 1\\ \\text{V}\\cdot\\text{A}$.',
          'En un resistor, con $V = IR$: $$P = IV = I^2R = \\frac{V^2}{R}$$ Las tres dan lo mismo; usa la que tenga los datos que conoces. Esa energía se vuelve calor (efecto Joule): así funcionan planchas, parrillas y focos incandescentes.',
          'En tu casa el voltaje es fijo (127 V), así que el aparato con resistencia más <strong>chica</strong> es el que disipa <strong>más</strong>: $P = V^2/R$.'
        ]
      },
      {
        type: 'callout', heading: 'El recibo de la luz cobra energía',
        body: [
          'Lo que pagas no es la potencia, sino la <strong>energía</strong>: $E = Pt$. La unidad práctica es el kilowatt-hora: $$1\\ \\text{kWh} = (1000\\ \\text{W})(3600\\ \\text{s}) = 3.6\\times 10^{6}\\ \\text{J}$$',
          'Una secadora de 1500 W usada 2 horas gasta $1.5\\ \\text{kW}\\times 2\\ \\text{h} = 3\\ \\text{kWh}$. El costo es kWh × precio por kWh, en pesos. Ojo: el kWh es energía aunque diga «watt».'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: corriente, resistencia y potencia', short: 'Receta',
        steps: [
          { text: 'Pasa todo a SI: mm → $\\times 10^{-3}$ m, mA → $\\times 10^{-3}$ A, minutos → $\\times 60$ s. Solo para el costo usa kW y horas.', tip: 'El área va con el radio: $A = \\pi r^2 = \\pi d^2/4$. Si usas el diámetro como si fuera el radio, $R$ te sale 4 veces más chica.' },
          { text: 'Del material y la forma: $R = \\rho L/A$. Si cambia la temperatura, $R = R_0(1 + \\alpha\\,\\Delta T)$.' },
          { text: 'Ley de Ohm: $V = IR$. Despeja lo que falta: $I = V/R$ o $R = V/I$.', tip: 'En la gráfica $I$ contra $V$, la pendiente es $1/R$, no $R$.' },
          { text: 'Potencia: $P = IV = I^2R = V^2/R$. Escoge la forma con tus datos.', tip: 'El $V$ de la fórmula es el voltaje <strong>entre los extremos de ese elemento</strong>, no el de otro elemento ni uno que te inventes.' },
          { text: 'Energía y costo: $E = Pt$ con $P$ en kW y $t$ en horas da kWh; costo = kWh × precio.' }
        ]
      },
      {
        type: 'example', heading: 'Electrones por segundo',
        problem: '<p>El cable de un cargador lleva una corriente de $' + e1.I + '\\ \\text{A}$. ¿Cuántos electrones cruzan cada segundo una sección del cable? (' + ET + '.)</p>',
        steps: [
          { text: 'Cada segundo cruza una carga $Q = It = ' + e1.I + '\\ \\text{C}$.' },
          { text: 'Cada electrón lleva $e$: divide.', math: 'N = \\frac{Q}{e} = \\frac{' + e1.I + '}{1.60\\times 10^{-19}} = ' + sci(e1.N, 3) },
          { text: 'Son más de diez trillones por segundo: por eso la carga de un solo electrón no se nota.' }
        ],
        answer: '$N \\approx ' + sci(e1.N, 2) + '$ electrones por segundo.',
        verify: { lab: 'call', mod: 'ohm', fn: 'electronsPerSecond', args: [e1.I], value: e1.N }
      },
      {
        type: 'example', heading: 'Resistencia de un alambre de cobre',
        problem: '<p>Un alambre de cobre mide $' + e2.L + '\\ \\text{m}$ de largo y $' + fx(e2.d, 1) + '\\ \\text{mm}$ de diámetro. ¿Cuál es su resistencia? (' + CU + '.)</p>',
        steps: [
          { text: 'El radio es la mitad del diámetro, en metros: $r = 0.5\\ \\text{mm} = 5\\times 10^{-4}$ m.', math: 'A = \\pi r^2 = \\pi(5\\times 10^{-4})^2 = ' + sci(e2.A, 3) + '\\ \\text{m}^2' },
          { text: 'Aplica $R = \\rho L/A$.', math: 'R = \\frac{(1.72\\times 10^{-8})(' + e2.L + ')}{' + sci(e2.A, 3) + '} = ' + fx(e2.R, 3) + '\\ \\Omega' },
          { text: 'Menos de medio ohm en 20 m: por eso en un circuito los cables casi no cuentan.' }
        ],
        answer: '$R \\approx ' + fx(e2.R) + '\\ \\Omega$.',
        verify: { lab: 'call', mod: 'ohm', fn: 'wireR', args: [RHO_CU, e2.L, e2.d], value: e2.R }
      },
      {
        type: 'example', heading: 'Velocidad de deriva',
        problem: '<p>Por el mismo alambre (cobre, $1.0\\ \\text{mm}$ de diámetro) pasan $' + e3.I + '\\ \\text{A}$. ¿Con qué velocidad de deriva avanzan los electrones? ¿Cuánto tarda uno en recorrer los $' + e2.L + '\\ \\text{m}$? ($n = 8.47\\times 10^{28}\\ \\text{m}^{-3}$, ' + ET + '.)</p>',
        steps: [
          { text: 'Despeja $v_d$ de $I = nev_dA$, con el área del ejemplo anterior.', math: 'v_d = \\frac{I}{neA} = \\frac{' + e3.I + '}{(8.47\\times 10^{28})(1.60\\times 10^{-19})(' + sci(e2.A, 3) + ')} = ' + sci(e3.v, 3) + '\\ \\text{m/s}' },
          { text: 'Es menos de medio milímetro por segundo. El tiempo para recorrer el cable:', math: 't = \\frac{L}{v_d} = \\frac{' + e2.L + '}{' + sci(e3.v, 3) + '} = ' + sci(e3.t, 2) + '\\ \\text{s} \\approx ' + fx(e3.t / 3600, 1) + '\\ \\text{h}' },
          { text: 'Casi medio día. Y aun así el aparato funciona al instante: el campo llega casi a la velocidad de la luz.' }
        ],
        answer: '$v_d \\approx ' + sci(e3.v, 2) + '\\ \\text{m/s}$; un electrón tarda unas ' + fx(e3.t / 3600, 0) + ' horas.',
        verify: { lab: 'call', mod: 'ohm', fn: 'drift', args: [e3.I, N_CU, e2.A], value: e3.v }
      },
      {
        type: 'example', heading: 'Corriente y potencia de una plancha',
        problem: '<p>La resistencia de una plancha mide $' + e4.R + '\\ \\Omega$ caliente y se conecta a $' + e4.V + '\\ \\text{V}$. ¿Qué corriente jala y qué potencia disipa? Calcula la potencia de las tres formas.</p>',
        steps: [
          { text: 'Ley de Ohm.', math: 'I = \\frac{V}{R} = \\frac{' + e4.V + '}{' + e4.R + '} = ' + fx(e4.I, 3) + '\\ \\text{A}' },
          { text: 'Potencia con la corriente y el voltaje.', math: 'P = IV = (' + fx(e4.I, 3) + ')(' + e4.V + ') \\approx ' + fx(e4.P, 0) + '\\ \\text{W}' },
          { text: 'Con la corriente y la resistencia:', math: 'P = I^2R = (' + fx(e4.I, 3) + ')^2(' + e4.R + ') \\approx ' + fx(e4.P, 0) + '\\ \\text{W}' },
          { text: 'Con el voltaje y la resistencia:', math: 'P = \\frac{V^2}{R} = \\frac{' + e4.V + '^2}{' + e4.R + '} \\approx ' + fx(e4.P, 0) + '\\ \\text{W}' },
          { text: 'Las tres coinciden (si no redondeas $I$ antes de tiempo). Más de 10 A: por eso las planchas llevan cable grueso.' }
        ],
        answer: '$I \\approx ' + fx(e4.I) + '\\ \\text{A}$ y $P \\approx ' + fx(e4.P, 0) + '\\ \\text{W}$.',
        verify: { lab: 'call', mod: 'ohm', fn: 'powers', args: [e4.V, e4.R], values: { I: e4.I, IV: e4.P, I2R: e4.P, V2R: e4.P } }
      },
      {
        type: 'example', heading: 'Lo que cuesta al mes',
        problem: '<p>Una secadora de pelo de $' + e5.P + '\\ \\text{W}$ se usa $20$ minutos diarios durante $' + e5.days + '$ días. Si el kWh cuesta $' + fx(e5.price) + '$ pesos, ¿cuánta energía gasta y cuánto cuesta al mes?</p>',
        steps: [
          { text: 'Pasa a kW y a horas: $P = 1.5$ kW y $t = (1/3\\ \\text{h})(30) = 10$ h.' },
          { text: 'Energía.', math: 'E = Pt = (1.5\\ \\text{kW})(10\\ \\text{h}) = ' + fx(e5.kWh) + '\\ \\text{kWh}' },
          { text: 'Costo.', math: '(' + fx(e5.kWh) + '\\ \\text{kWh})(' + fx(e5.price) + '\\ \\text{pesos/kWh}) = ' + fx(e5.cost) + '\\ \\text{pesos}' }
        ],
        answer: '$' + fx(e5.kWh) + '\\ \\text{kWh}$ y unos $' + fx(e5.cost) + '$ pesos al mes.',
        verify: { lab: 'call', mod: 'ohm', fn: 'cost', args: [e5.P, e5.h, e5.days, e5.price], values: { kWh: e5.kWh, pesos: e5.cost } }
      },
      {
        type: 'example', heading: 'Qué tan caliente está un foco',
        problem: '<p>Un foco incandescente dice «60 W, 127 V». Frío, a 20 °C, su filamento de tungsteno mide $' + e6.R0 + '\\ \\Omega$. ¿Cuánto vale su resistencia encendido y a qué temperatura aproximada está el filamento? ($\\alpha = 4.5\\times 10^{-3}\\ /^\\circ\\text{C}$.)</p>',
        steps: [
          { text: 'Encendido disipa 60 W a 127 V: despeja $R$ de $P = V^2/R$.', math: 'R = \\frac{V^2}{P} = \\frac{127^2}{60} = ' + fx(e6.R, 1) + '\\ \\Omega' },
          { text: 'Despeja $\\Delta T$ de $R = R_0(1 + \\alpha\\,\\Delta T)$.', math: '\\Delta T = \\frac{R/R_0 - 1}{\\alpha} = \\frac{' + fx(e6.R / e6.R0, 2) + ' - 1}{4.5\\times 10^{-3}} \\approx ' + fx(e6.dT, 0) + '\\ ^\\circ\\text{C}' },
          { text: 'El filamento está a unos ' + fx(Math.round((20 + e6.dT) / 10) * 10, 0) + ' °C. Encendido, su resistencia es unas ' + fx(e6.R / e6.R0, 0) + ' veces la de frío: el foco no es óhmico.' }
        ],
        answer: '$R \\approx ' + fx(e6.R, 0) + '\\ \\Omega$ y $T \\approx ' + fx(20 + e6.dT, 0) + '\\ ^\\circ\\text{C}$.',
        verify: { lab: 'call', mod: 'ohm', fn: 'tempRise', args: [e6.R0, e6.R, A_W], value: e6.dT }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿La corriente se «gasta» en el foco?', a: 'No. La misma corriente que entra, sale: la carga se conserva. Lo que el foco gasta es <strong>energía</strong>: cada coulomb sale con menos potencial del que tenía al entrar.' },
          { q: 'Si los electrones van tan lento, ¿cómo prende el foco al instante?', a: 'Porque el cable ya está lleno de electrones. Al cerrar el circuito, el campo se establece en todo el cable casi a la velocidad de la luz y todos empiezan a moverse a la vez.' },
          { q: '¿Por qué la corriente va al revés que los electrones?', a: 'Por convención: se definió antes de saber que en los metales se mueven los electrones. Mover carga negativa hacia un lado equivale a mover positiva hacia el otro, así que las cuentas no cambian.' },
          { q: '¿$V = IR$ vale para todo?', a: 'El cociente $R = V/I$ se puede calcular siempre, pero la ley de Ohm dice que no cambia con $V$. En un foco o un diodo sí cambia: no son óhmicos.' },
          { q: '¿Más resistencia da más calor?', a: 'Depende de qué se mantiene fijo. Con el mismo voltaje, $P = V^2/R$: menos resistencia, más calor (la parrilla). Con la misma corriente, $P = I^2R$: más resistencia, más calor (un mal contacto en un cable).' },
          { q: '¿Un foco de 100 W siempre gasta 100 W?', a: 'Solo al voltaje para el que está hecho (127 V). Con menos voltaje disipa menos. Y lo que pagas depende además del tiempo que esté prendido: kWh = kW × horas.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Corriente: $I = dQ/dt$ (1 A = 1 C/s), en sentido contrario al de los electrones; $I = nqv_dA$ con una $v_d$ diminuta.',
          'Resistencia de un alambre: $R = \\rho L/A$ con $A = \\pi d^2/4$; crece con la temperatura, $R = R_0(1 + \\alpha\\,\\Delta T)$.',
          'Ley de Ohm: $V = IR$ con $R$ constante; la curva $I$–$V$ es una recta de pendiente $1/R$. Focos y diodos no la cumplen.',
          'Potencia: $P = IV = I^2R = V^2/R$; energía en kWh = kW × h, y el costo es kWh × precio.'
        ]
      }
    ],

    lab: {
      type: 'iv-curve', title: 'Curva I–V',
      intro: 'Elige un elemento, mueve el voltaje de la fuente y mira cómo cada lectura del amperímetro se vuelve un punto de la curva. Con el resistor o el alambre sale una recta: el lab la ajusta por mínimos cuadrados y su pendiente es $1/R$. Con el foco la curva se dobla y con el diodo casi no pasa nada hasta 0.7 V. Luego calcula $R$, $I$ o $P$ a mano y compruébalo; el lab detecta el diámetro usado como radio, los mm² sin convertir, $R = VI$, la pendiente confundida con $R$ y la potencia sin el cuadrado.',
      cfg: { start: { elem: 'wire', L: 10, d: 0.5 } }
    },

    formulas: [
      { label: 'Corriente', tex: 'I = \\frac{dQ}{dt}' },
      { label: 'Deriva', tex: 'I = nqv_dA,\\quad J = nqv_d' },
      { label: 'Resistencia', tex: 'R = \\frac{\\rho L}{A},\\quad A = \\frac{\\pi d^2}{4}' },
      { label: 'Temperatura', tex: 'R = R_0(1 + \\alpha\\,\\Delta T)' },
      { label: 'Ley de Ohm', tex: 'V = IR' },
      { label: 'Campo en el alambre', tex: 'E = \\frac{V}{L}' },
      { label: 'Potencia', tex: 'P = IV = I^2R = \\frac{V^2}{R}' },
      { label: 'Energía', tex: '1\\ \\text{kWh} = 3.6\\times 10^{6}\\ \\text{J}' }
    ],

    exercises: [
      {
        id: 'f2-s11-electrones', title: 'Electrones por segundo',
        vars: { mA: [10, 900, 10] },
        prompt: function (v) { return '<p>Por un alambre pasa una corriente de $' + v.mA + '\\ \\text{mA}$. ¿Cuántos electrones cruzan cada segundo una sección del alambre? (' + ET + '.)</p>'; },
        check: 'numeric', unit: 'electrones/s',
        answer: function (v) { return v.mA * 1e-3 / e; },
        mistakes: {
          mA: function (v) { return v.mA / e; },
          times: function (v) { return v.mA * 1e-3 * e; }
        },
        feedback: [
          { when: 'mA', say: 'Pasa los miliamperes a amperes: $1\\ \\text{mA} = 10^{-3}\\ \\text{A}$.' },
          { when: 'times', say: 'Para contar electrones se <strong>divide</strong> la carga entre $e$: $N = I/e$ por segundo.' }
        ],
        oracle: { lab: 'call', mod: 'ohm', fn: 'electronsPerSecond', args: function (v) { return [v.mA / 1000]; } },
        hint: 'Cada segundo cruzan $I$ coulombs; cada electrón lleva $1.60\\times 10^{-19}$ C.',
        solution: function (v) { return '$I = ' + fx(v.mA / 1000, 3) + '\\ \\text{A}$. $$N = \\frac{I}{e} = \\frac{' + fx(v.mA / 1000, 3) + '}{1.60\\times 10^{-19}} = ' + sci(v.mA * 1e-3 / e, 3) + '\\ \\text{electrones/s}$$'; }
      },
      {
        id: 'f2-s11-cobre', title: 'Resistencia de un alambre de cobre',
        vars: { L: [2, 100, 1], d: [0.3, 3, 0.1] },
        prompt: function (v) { return '<p>Un alambre de cobre mide $' + v.L + '\\ \\text{m}$ de largo y $' + fx(v.d, 1) + '\\ \\text{mm}$ de diámetro. ¿Cuál es su resistencia, en ohms? (' + CU + '.)</p>'; },
        check: 'numeric', unit: 'Ω',
        answer: function (v) { return RHO_CU * v.L / (Math.PI * Math.pow(v.d * 1e-3 / 2, 2)); },
        mistakes: {
          diam: function (v) { return RHO_CU * v.L / (Math.PI * Math.pow(v.d * 1e-3, 2)); },
          mm2: function (v) { return RHO_CU * v.L / (Math.PI * Math.pow(v.d / 2, 2)); },
          inv: function (v) { return RHO_CU * (Math.PI * Math.pow(v.d * 1e-3 / 2, 2)) / v.L; }
        },
        feedback: [
          { when: 'diam', say: 'Usaste el diámetro como radio. El radio es $d/2$: $A = \\pi d^2/4$.' },
          { when: 'mm2', say: 'Dejaste el área en mm². Pasa el diámetro a metros antes: $1\\ \\text{mm} = 10^{-3}\\ \\text{m}$.' },
          { when: 'inv', say: 'Es $R = \\rho L/A$: el largo arriba y el área abajo.' }
        ],
        oracle: { lab: 'call', mod: 'ohm', fn: 'wireR', args: function (v) { return [RHO_CU, v.L, v.d]; } },
        hint: '$A = \\pi(d/2)^2$ con $d$ en metros; luego $R = \\rho L/A$.',
        solution: function (v) { var A = Math.PI * Math.pow(v.d * 1e-3 / 2, 2), R = RHO_CU * v.L / A; return '$r = ' + fx(v.d / 2, 2) + '\\ \\text{mm}$, $A = \\pi r^2 = ' + sci(A, 3) + '\\ \\text{m}^2$. $$R = \\frac{(1.72\\times 10^{-8})(' + v.L + ')}{' + sci(A, 3) + '} = ' + nice(R, 3) + '\\ \\Omega$$'; }
      },
      {
        id: 'f2-s11-deriva', title: 'Velocidad de deriva',
        vars: { I: [1, 20, 1], d: [0.5, 3, 0.1] },
        prompt: function (v) { return '<p>Un alambre de cobre de $' + fx(v.d, 1) + '\\ \\text{mm}$ de diámetro lleva $' + v.I + '\\ \\text{A}$. ¿Cuál es la velocidad de deriva de sus electrones, en m/s? ($n = 8.47\\times 10^{28}\\ \\text{m}^{-3}$, ' + ET + '.)</p>'; },
        check: 'numeric', unit: 'm/s',
        answer: function (v) { return v.I / (N_CU * e * Math.PI * Math.pow(v.d * 1e-3 / 2, 2)); },
        mistakes: {
          diam: function (v) { return v.I / (N_CU * e * Math.PI * Math.pow(v.d * 1e-3, 2)); },
          mm2: function (v) { return v.I / (N_CU * e * Math.PI * Math.pow(v.d / 2, 2)); },
          noE: function (v) { return v.I / (N_CU * Math.PI * Math.pow(v.d * 1e-3 / 2, 2)); }
        },
        feedback: [
          { when: 'diam', say: 'Usaste el diámetro como radio: $A = \\pi(d/2)^2$.' },
          { when: 'mm2', say: 'El área va en m²: pasa el diámetro a metros antes de elevar al cuadrado.' },
          { when: 'noE', say: 'Falta la carga de cada electrón: $v_d = I/(neA)$.' }
        ],
        oracle: { lab: 'call', mod: 'ohm', fn: 'drift', args: function (v) { return [v.I, N_CU, Math.PI * Math.pow(v.d / 2000, 2)]; } },
        hint: 'Despeja $v_d$ de $I = nev_dA$, con $A = \\pi(d/2)^2$ en m².',
        solution: function (v) { var A = Math.PI * Math.pow(v.d * 1e-3 / 2, 2), vd = v.I / (N_CU * e * A); return '$A = ' + sci(A, 3) + '\\ \\text{m}^2$. $$v_d = \\frac{I}{neA} = \\frac{' + v.I + '}{(8.47\\times 10^{28})(1.60\\times 10^{-19})(' + sci(A, 3) + ')} = ' + sci(vd, 3) + '\\ \\text{m/s}$$'; }
      },
      {
        id: 'f2-s11-aparato', title: 'Corriente de un aparato',
        vars: { P: [300, 2400, 50] },
        prompt: function (v) { return '<p>Un aparato dice «' + v.P + ' W, 127 V». ¿Qué corriente jala cuando funciona normalmente, en amperes?</p>'; },
        check: 'numeric', unit: 'A',
        answer: function (v) { return v.P / 127; },
        mistakes: {
          times: function (v) { return v.P * 127; },
          inv: function (v) { return 127 / v.P; }
        },
        feedback: [
          { when: 'times', say: 'De $P = IV$ se despeja $I = P/V$: divide.' },
          { when: 'inv', say: 'Al revés: $I = P/V$, no $V/P$.' }
        ],
        oracle: { lab: 'value', value: function (v) { var R = 127 * 127 / v.P; return window.LabMath.ohm.current(127, R); } },
        hint: '$P = IV$, así que $I = P/V$.',
        solution: function (v) { return '$$I = \\frac{P}{V} = \\frac{' + v.P + '}{127} = ' + fx(v.P / 127, 3) + '\\ \\text{A}$$ Comprueba: $R = V/I = ' + fx(127 * 127 / v.P, 1) + '\\ \\Omega$ y $V^2/R = ' + v.P + '$ W.'; }
      },
      {
        id: 'f2-s11-potencia', title: 'Potencia de una resistencia',
        vars: { R: [5, 200, 1], V: [12, 240, 6] },
        prompt: function (v) { return '<p>Una resistencia de $' + v.R + '\\ \\Omega$ se conecta a $' + v.V + '\\ \\text{V}$. ¿Qué potencia disipa, en watts?</p>'; },
        check: 'numeric', unit: 'W',
        answer: function (v) { return v.V * v.V / v.R; },
        mistakes: {
          VR: function (v) { return v.V / v.R; },
          V2R: function (v) { return v.V * v.V * v.R; },
          noSq: function (v) { return v.V * v.R; }
        },
        feedback: [
          { when: 'VR', say: 'Eso es la corriente $I = V/R$. La potencia es $P = V^2/R$ (o $IV$).' },
          { when: 'V2R', say: 'Es $V^2$ <strong>entre</strong> $R$.' },
          { when: 'noSq', say: 'Revisa la fórmula: $P = IV = V^2/R$.' }
        ],
        oracle: { lab: 'call', mod: 'ohm', fn: 'powers', args: function (v) { return [v.V, v.R]; }, field: 'I2R' },
        hint: 'Con $V$ y $R$, la forma directa es $P = V^2/R$.',
        solution: function (v) { var I = v.V / v.R; return '$$P = \\frac{V^2}{R} = \\frac{' + v.V + '^2}{' + v.R + '} = ' + fx(v.V * v.V / v.R, 2) + '\\ \\text{W}$$ Igual con $I = ' + fx(I, 3) + '$ A: $P = IV = I^2R$.'; }
      },
      {
        id: 'f2-s11-costo', title: 'Costo mensual',
        vars: { P: [100, 2500, 50], h: [0.5, 8, 0.5], c: [1, 4, 0.25] },
        prompt: function (v) { return '<p>Un aparato de $' + v.P + '\\ \\text{W}$ se usa $' + fx(v.h, 1) + '$ horas diarias durante 30 días. Si el kWh cuesta $' + fx(v.c) + '$ pesos, ¿cuánto cuesta usarlo ese mes, en pesos?</p>'; },
        check: 'numeric', unit: 'pesos',
        answer: function (v) { return v.P / 1000 * v.h * 30 * v.c; },
        mistakes: {
          W: function (v) { return v.P * v.h * 30 * v.c; },
          day: function (v) { return v.P / 1000 * v.h * v.c; }
        },
        feedback: [
          { when: 'W', say: 'El precio es por <strong>kilo</strong>watt-hora: pasa los watts a kW ($\\div 1000$).' },
          { when: 'day', say: 'Ese es el costo de un día. Multiplica por los 30 días.' }
        ],
        oracle: { lab: 'call', mod: 'ohm', fn: 'cost', args: function (v) { return [v.P, v.h, 30, v.c]; }, field: 'pesos' },
        hint: 'Energía en kWh = kW × horas totales; costo = kWh × precio.',
        solution: function (v) { var kWh = v.P / 1000 * v.h * 30; return '$E = (' + fx(v.P / 1000, 3) + '\\ \\text{kW})(' + fx(v.h, 1) + '\\ \\text{h})(30) = ' + fx(kWh, 2) + '\\ \\text{kWh}$. $$\\text{costo} = (' + fx(kWh, 2) + ')(' + fx(v.c) + ') = ' + fx(kWh * v.c, 2) + '\\ \\text{pesos}$$'; }
      },
      {
        id: 'f2-s11-calienta', title: 'Un alambre que se calienta',
        vars: { R0: [2, 50, 1], T: [60, 200, 10] },
        prompt: function (v) { return '<p>Un alambre de cobre tiene $' + v.R0 + '\\ \\Omega$ a 20 °C. ¿Cuánto vale su resistencia a $' + v.T + '$ °C? ($\\alpha_{Cu} = 3.9\\times 10^{-3}\\ /^\\circ\\text{C}$.)</p>'; },
        check: 'numeric', unit: 'Ω',
        answer: function (v) { return v.R0 * (1 + A_CU * (v.T - 20)); },
        mistakes: {
          noOne: function (v) { return v.R0 * A_CU * (v.T - 20); },
          usedT: function (v) { return v.R0 * (1 + A_CU * v.T); }
        },
        feedback: [
          { when: 'noOne', say: 'Ese es solo el aumento $\\Delta R = R_0\\alpha\\,\\Delta T$. Súmale $R_0$: $R = R_0(1 + \\alpha\\,\\Delta T)$.' },
          { when: 'usedT', say: 'Usa el <strong>cambio</strong> de temperatura: $\\Delta T = T - 20$ °C.' }
        ],
        oracle: { lab: 'call', mod: 'ohm', fn: 'RT', args: function (v) { return [v.R0, A_CU, v.T - 20]; } },
        hint: '$\\Delta T = T - 20$ °C y $R = R_0(1 + \\alpha\\,\\Delta T)$.',
        solution: function (v) { return '$\\Delta T = ' + (v.T - 20) + '$ °C. $$R = ' + v.R0 + '\\left[1 + (3.9\\times 10^{-3})(' + (v.T - 20) + ')\\right] = ' + fx(v.R0 * (1 + A_CU * (v.T - 20)), 2) + '\\ \\Omega$$'; }
      },
      {
        id: 'f2-s11-duplicar', title: 'Concepto: estirar y engordar el alambre',
        vars: { a: [2, 3, 1], b: [2, 3, 1] },
        prompt: function (v) { var w = ['', '', 'duplica', 'triplica']; return '<p>De un alambre se hace otro del mismo material que ' + w[v.a] + ' el largo y ' + w[v.b] + ' el diámetro. ¿Qué pasa con su resistencia?</p>'; },
        check: 'choice',
        options: function (v) {
          function fr(p, q) { var g = function (x, y) { return y ? g(y, x % y) : x; }, k = g(p, q); p /= k; q /= k; return q === 1 ? String(p) : p + '/' + q; }
          var b2 = v.b * v.b;
          return [
            { text: 'Se multiplica por ' + fr(v.a, b2), correct: true },
            { text: v.a === v.b ? 'No cambia' : 'Se multiplica por ' + fr(v.a, v.b), say: 'El área va con el diámetro <strong>al cuadrado</strong>: $A = \\pi d^2/4$.' },
            { text: 'Se multiplica por ' + fr(v.a * b2, 1), say: 'El área divide: más grueso, <strong>menos</strong> resistencia.' },
            { text: 'Se multiplica por ' + fr(b2, v.a), say: 'Lo invertiste: el largo multiplica y el área divide, $R = \\rho L/A$.' }
          ];
        },
        answer: function (v) { function fr(p, q) { var g = function (x, y) { return y ? g(y, x % y) : x; }, k = g(p, q); p /= k; q /= k; return q === 1 ? String(p) : p + '/' + q; } return 'Se multiplica por ' + fr(v.a, v.b * v.b); },
        hint: '$R = \\rho L/A$ y $A$ va con $d^2$.',
        solution: function (v) { return 'El largo multiplica $R$ por ' + v.a + ' y el área se multiplica por $' + v.b + '^2 = ' + v.b * v.b + '$, que divide: $$R\' = \\frac{' + v.a + '}{' + v.b * v.b + '}\\,R$$'; }
      }
    ],

    quiz: { tags: ['f2.S11'], count: 8 },

    errors: [
      'Usar el diámetro como si fuera el radio en $A = \\pi r^2$ (la resistencia sale 4 veces más chica).',
      'Dejar el área en mm² o el diámetro en mm sin pasarlos a metros.',
      'Escribir $R = VI$ o creer que la pendiente de la gráfica $I$–$V$ es $R$ (es $1/R$).',
      'Olvidar el cuadrado en $P = I^2R$ o $P = V^2/R$, o usar un voltaje que no es el del elemento.',
      'Calcular el costo con watts en lugar de kilowatts, o confundir kWh (energía) con kW (potencia).',
      'Pensar que la corriente se gasta en el foco: lo que se gasta es la energía.',
      'Usar la resistencia en frío de un foco para calcular lo que pasa encendido.'
    ],

    teacher: {
      plan: [
        'Arranca con la manguera llena y el explainer de la deriva: que salga $I = nqv_dA$ y que vean lo lento que avanzan los electrones.',
        'Explainer de $R = \\rho L/A$ con el alambre que se estira y engorda; conecta $E = V/L$ con S05.',
        'Ley de Ohm con el lab: tracen la recta del resistor y luego la del foco; que comparen.',
        'Potencia de las tres formas y el ejemplo del recibo de la luz para cerrar.'
      ],
      check: [
        'Que conviertan mm a m antes de calcular el área, y que usen el radio.',
        'Que justifiquen por qué un foco o un diodo no son óhmicos.'
      ],
      note: 'Los resistores en serie y en paralelo, la fem y la resistencia interna quedan para S12.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §9.1 “Electrical Current”. <a href="https://openstax.org/books/university-physics-volume-2/pages/9-1-electrical-current">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §9.2 “Model of Conduction in Metals”. <a href="https://openstax.org/books/university-physics-volume-2/pages/9-2-model-of-conduction-in-metals">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §9.3 “Resistivity and Resistance”. <a href="https://openstax.org/books/university-physics-volume-2/pages/9-3-resistivity-and-resistance">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §9.4 “Ohm\'s Law”. <a href="https://openstax.org/books/university-physics-volume-2/pages/9-4-ohms-law">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §9.5 “Electrical Energy and Power”. <a href="https://openstax.org/books/university-physics-volume-2/pages/9-5-electrical-energy-and-power">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-10',
    next: 'sesion-12'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
