/* =====================================================================
   Física 2 · S14 · Leyes de Kirchhoff II: varias mallas como sistema de ecuaciones
   (bloque C · Circuitos). Incluye capacitores en estado estable.
   Fuente: OpenStax, University Physics Volume 2, §10.3 y §10.5 (CC BY-NC-SA 4.0).
   Unidades: V, Ω, A, W; capacitancia en μF y carga en μC.
   Circuitos como en el lab kirchhoff-solve:
     dos nodos  a (arriba) y b (abajo), tres ramas verticales; corrientes de rama I₁ ↑, I₂ ↓, I₃ ↑
                (como en la S13); fem positiva = placa + arriba.
     tres mallas  ramas: izquierda (ε₁, R₁), R₂, R₃ arriba, R₄ y derecha (R₅ con ε₂ o con C);
                corrientes de malla en sentido horario.
   Las cuentas se hacen aquí con Cramer (fórmulas propias); scripts/examples.test.js las
   compara contra LabMath.kirchsys y los oráculos de los ejercicios usan el solver nodal
   de la S10 (LabMath.kirchsys.solveNodal → LabMath.capnet.nodal), que no escribe mallas.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function sg(v) { return v < 0 ? '-' + fx(-v) : fx(v); }
  function det3(m) {
    return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  }
  function cramer(A, b) {
    var D = det3(A);
    return [0, 1, 2].map(function (j) { return det3(A.map(function (r, i) { return r.map(function (x, k) { return k === j ? b[i] : x; }); })) / D; });
  }
  function KS() { return window.LabMath.kirchsys; }
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (m) { return ex.mistakes[m](v); }));
      if (!(Math.abs(vals[0]) >= 0.1)) return false;
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) {
          if (Math.abs(vals[i] - vals[j]) <= Math.max(0.05, 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j])))) return false;
        }
      }
      return true;
    };
  }
  // Dos nodos: ε₁ y R₁ | R₂ | ε₃ y R₃, con I₁ ↑, I₂ ↓, I₃ ↑.
  //   nodo a: I₁ − I₂ + I₃ = 0 · malla izquierda: R₁I₁ + R₂I₂ = ε₁ · malla derecha: R₂I₂ + R₃I₃ = ε₃
  function twoA(R) { return [[1, -1, 1], [R[0], R[1], 0], [0, R[1], R[2]]]; }
  function twoSol(R, e1, e3) { var x = cramer(twoA(R), [0, e1, e3]); return { I: x, V: R[1] * x[1] }; }
  function twoSpec(R, e1, e3) { return { topo: 'two', R: R, E: [e1, 0, e3] }; }
  // Tres mallas (horario): ε₁ en la izquierda empuja en horario; ε₂ en la derecha con su + arriba (se opone).
  function meshA(R) { return [[R[0] + R[1], -R[1], 0], [-R[1], R[1] + R[2] + R[3], -R[3]], [0, -R[3], R[3] + R[4]]]; }
  function threeSol(R, e1, e2) { return cramer(meshA(R), [e1, 0, -e2]); }
  function threeSpec(R, e1, e2) { return { topo: 'three', R: R, E: [e1, 0, 0, 0, -e2] }; }
  // Con capacitor en la rama derecha (estado estable): la malla 3 vale 0 y quedan dos mallas.
  function capI(R, e1) {
    var a = R[0] + R[1], d = R[1] + R[2] + R[3], D = a * d - R[1] * R[1];
    return { I1: e1 * d / D, I2: e1 * R[1] / D };
  }
  function capSpec(R, e1, C) { return { topo: 'three', R: R, E: [e1, 0, 0, 0, 0], C: C }; }
  function matTex(A) { return '\\begin{pmatrix}' + A.map(function (r) { return r.join(' & '); }).join(' \\\\ ') + '\\end{pmatrix}'; }
  function vecTex(b) { return '\\begin{pmatrix}' + b.join(' \\\\ ') + '\\end{pmatrix}'; }
  var IV = '\\begin{pmatrix}I_1 \\\\ I_2 \\\\ I_3\\end{pmatrix}';

  // Ejemplo 1 (y 3): ε₁ = 12 V, R₁ = 2 Ω; R₂ = 4 Ω; ε₃ = 6 V, R₃ = 2 Ω.
  var x1 = { R: [2, 4, 2], e1: 12, e3: 6 };
  x1.s = twoSol(x1.R, x1.e1, x1.e3); x1.I = x1.s.I;
  // Eliminación: R2 − R₁·R1 y luego R3 − (R₂/(R₁ + R₂))·R2.
  x1.p = x1.R[0] + x1.R[1]; x1.q = x1.R[2] + x1.R[1] * x1.R[0] / x1.p; x1.rhs3 = x1.e3 - x1.R[1] * x1.e1 / x1.p;
  x1.P1 = x1.e1 * x1.I[0]; x1.P3 = x1.e3 * x1.I[2];
  x1.PR = [x1.R[0] * x1.I[0] * x1.I[0], x1.R[1] * x1.I[1] * x1.I[1], x1.R[2] * x1.I[2] * x1.I[2]];
  // Ejemplo 2: tres mallas. ε₁ = 18 V; R = 1, 2, 2, 1, 2 Ω; ε₂ = 6 V con su + arriba.
  var x2 = { R: [1, 2, 2, 1, 2], e1: 18, e2: 6 };
  x2.A = meshA(x2.R); x2.b = [x2.e1, 0, -x2.e2]; x2.D = det3(x2.A); x2.I = threeSol(x2.R, x2.e1, x2.e2);
  x2.Dj = x2.I.map(function (I) { return I * x2.D; });
  // Ejemplo 4: capacitor en la rama derecha. ε = 12 V; R = 2, 4, 1, 3, 2 Ω; C = 10 μF.
  var x4 = { R: [2, 4, 1, 3, 2], e1: 12, C: 10 };
  x4.s = capI(x4.R, x4.e1); x4.VC = x4.R[3] * x4.s.I2; x4.Q = x4.C * x4.VC;
  x4.a = x4.R[0] + x4.R[1]; x4.d = x4.R[1] + x4.R[2] + x4.R[3];

  var data = window.SESSION_DATA = {
    slug: 'sesion-14', number: '14', group: 'C · Circuitos',
    title: 'Leyes de Kirchhoff II: varias mallas como sistema de ecuaciones', temario: [],
    minutes: 180,
    quote: 'Tantas ecuaciones independientes como incógnitas: plantear es física, resolver es álgebra.',
    badges: [
      'Contar nodos y ramas para saber cuántas ecuaciones necesitas: $n - 1$ de nodo y $b - n + 1$ de malla.',
      'Escribir el sistema en forma matricial $A\\,\\vec{I} = \\vec{b}$ y resolverlo con Gauss, con Cramer o con la calculadora.',
      'Usar corrientes de malla como atajo en circuitos de tres mallas.',
      'Resolver circuitos con capacitores en estado estable y comprobar todo con el balance de potencias.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Con las dos reglas de Kirchhoff, un circuito de varias mallas se convierte en un <strong>sistema de ecuaciones lineales</strong>. Si escribes tantas ecuaciones <strong>independientes</strong> como corrientes desconocidas, el sistema tiene una sola solución.',
        recall: [
          'Regla de nodos, regla de mallas y la convención de signos: a favor de tu flecha $-IR$, en contra $+IR$; batería de $-$ a $+$, $+\\varepsilon$ (<a href="../sesion-13/">S13</a>).',
          'Una corriente negativa solo dice que va al revés de tu flecha (<a href="../sesion-13/">S13</a>).',
          'Capacitancia: $Q = CV$ (<a href="../sesion-09/">S09</a> y <a href="../sesion-10/">S10</a>).',
          'Álgebra: resolver un sistema de 2 o 3 ecuaciones por sustitución o por eliminación.'
        ],
        why: 'Así se analizan los circuitos de verdad: la tarjeta madre de tu computadora, el cargador de tu celular o la red eléctrica de una ciudad. Los simuladores de circuitos hacen exactamente lo que vas a hacer hoy: arman una matriz con las leyes de Kirchhoff y la resuelven.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en un sudoku. Cada pista te dice algo, pero si te dan dos pistas que dicen lo mismo con otras palabras, no avanzas. Para llenar el tablero necesitas <strong>pistas distintas</strong>, y suficientes. Con un circuito pasa igual: cada corriente desconocida es una casilla vacía y cada ecuación de Kirchhoff es una pista.',
          'Ahora piensa en las calles de un barrio. En cada esquina, los coches que llegan son los que se van (regla de nodos). Si das una vuelta a la manzana, terminas a la misma altura de donde saliste (regla de mallas). Si ya revisaste dos manzanas vecinas, dar la vuelta a las dos juntas no te dice nada nuevo: es una pista repetida.',
          'Lo que aprendes hoy es a <strong>contar cuántas pistas necesitas</strong>, escribirlas ordenadas como una tabla de números (una matriz) y dejar que el álgebra, o la calculadora, haga el resto.'
        ]
      },
      {
        type: 'explainer', heading: 'Cuenta antes de escribir', short: 'Contar ecuaciones',
        title: 'Nodos, ramas y mallas',
        intro: 'Antes de escribir una sola ecuación, cuenta. Así sabes cuántas incógnitas tienes y cuántas ecuaciones de cada tipo te hacen falta.',
        diagram: 'f2s14-count',
        steps: [
          { text: 'Un circuito con dos baterías y cinco resistores. Parece complicado, pero no se puede reducir con serie y paralelo: hace falta Kirchhoff.', state: { step: 0 } },
          { text: '<strong>Nodos</strong>: puntos donde se unen tres cables o más. Aquí hay $n = 3$: $a$, $b$ y $c$ (toda la línea de abajo es un solo nodo, porque un cable tiene un solo potencial).', state: { step: 1 } },
          { text: '<strong>Ramas</strong>: tramos entre dos nodos. Todo lo que está en una rama lleva la misma corriente, así que hay $b = 5$ corrientes desconocidas.', state: { step: 2 } },
          { text: '<strong>Mallas independientes</strong>: las «ventanas» del dibujo. Siempre son $b - n + 1 = 5 - 3 + 1 = 3$.', state: { step: 3 } },
          { text: 'Ecuaciones: $n - 1 = 2$ de nodo y $3$ de malla. En total $5$, una por incógnita. La ecuación del tercer nodo no sirve: es la suma de las otras dos.', state: { step: 4 } }
        ]
      },
      {
        type: 'callout', heading: 'Por qué sobra un nodo y sobra la malla grande',
        body: [
          'Si sumas las ecuaciones de <strong>todos</strong> los nodos, cada corriente aparece dos veces: una entrando a un nodo y otra saliendo del otro. Todo se cancela y queda $0 = 0$. Por eso la última ecuación de nodo siempre es la suma de las demás: usa $n - 1$.',
          'Con las mallas pasa lo mismo: la vuelta por el borde de dos ventanas vecinas es la <strong>suma</strong> de las dos vueltas (el tramo que comparten se recorre una vez en cada sentido y se cancela). Usa las ventanas, no las mallas grandes.'
        ]
      },
      {
        type: 'concept', heading: 'El sistema como una matriz', short: 'Forma matricial',
        body: [
          'Escribe cada ecuación con las incógnitas en el mismo orden y los números (las fem) a la derecha. En el circuito de dos mallas de la <a href="../sesion-13/">S13</a>, con $I_1$ hacia arriba, $I_2$ hacia abajo e $I_3$ hacia arriba: $$\\begin{aligned} I_1 - I_2 + I_3 &= 0 \\\\ ' + x1.R[0] + 'I_1 + ' + x1.R[1] + 'I_2 &= ' + x1.e1 + ' \\\\ ' + x1.R[1] + 'I_2 + ' + x1.R[2] + 'I_3 &= ' + x1.e3 + ' \\end{aligned}$$',
          'Cada renglón es una ecuación y cada columna es una corriente. Si una corriente no aparece, su coeficiente es $0$: $$' + matTex(twoA(x1.R)) + IV + ' = ' + vecTex([0, x1.e1, x1.e3]) + '$$',
          'Eso es $A\\,\\vec{I} = \\vec{b}$: la matriz $A$ lleva las resistencias (y los $\\pm 1$ de los nodos), $\\vec{I}$ las corrientes y $\\vec{b}$ las fem. Para que haya una sola solución, $\\det A \\neq 0$, que es lo mismo que decir que las ecuaciones son independientes.'
        ],
        diagram: 'f2s14-two', state: { R: x1.R, E: [x1.e1, 0, x1.e3], up: [1, -1, 1], loops: 1 },
        caption: 'Las dos ventanas son las mallas 1 y 2 (recorridas en sentido horario); el nodo $a$ da la tercera ecuación.'
      },
      {
        type: 'concept', heading: 'Resolver: Gauss, Cramer o calculadora', short: 'Resolver',
        body: [
          '<strong>Eliminación de Gauss</strong> (a mano). Usa un renglón para eliminar una incógnita de los de abajo, hasta que el último renglón tenga una sola incógnita. Luego despeja de abajo hacia arriba. Es lo mismo que sustituir, pero en orden.',
          '<strong>Regla de Cramer</strong>. Cada incógnita es un cociente de determinantes: $I_j = D_j/D$, donde $D = \\det A$ y $D_j$ es el determinante de $A$ con la columna $j$ cambiada por $\\vec{b}$. Para un $3\\times 3$: $$\\det\\begin{pmatrix}a & b & c \\\\ d & e & f \\\\ g & h & i\\end{pmatrix} = a(ei - fh) - b(di - fg) + c(dh - eg)$$',
          '<strong>Calculadora</strong>. Casi todas las científicas tienen un modo para sistemas de ecuaciones (EQN o «sistema lineal»): metes los coeficientes renglón por renglón y te da $I_1$, $I_2$ e $I_3$. El trabajo de física es escribir bien la matriz; si un signo está mal, la calculadora resuelve con mucha precisión un circuito que no existe.'
        ]
      },
      {
        type: 'concept', heading: 'El atajo: corrientes de malla', short: 'Corrientes de malla',
        body: [
          'Con tres mallas y cinco ramas tendrías cinco incógnitas. El atajo es suponer una corriente que da vuelta por cada ventana: $I_1$, $I_2$ e $I_3$, todas en sentido horario. En una rama que no se comparte, la corriente es la de su malla. En una rama compartida, es la <strong>diferencia</strong>: por $R_2$ pasa $I_1 - I_2$ hacia abajo.',
          'La ventaja: las ecuaciones de nodo se cumplen solas (cada corriente de malla entra y sale de cada nodo), así que solo escribes una ecuación por ventana. Cinco incógnitas se vuelven tres.',
          'Al recorrer la malla 1 en horario, $R_1$ solo lleva $I_1$ ($-R_1I_1$) y $R_2$ lleva $I_1 - I_2$ ($-R_2(I_1 - I_2)$). Así sale $(R_1 + R_2)I_1 - R_2I_2 = \\varepsilon_1$. Fíjate en el patrón: en la diagonal va la suma de las resistencias de la malla y fuera de ella, con signo menos, la resistencia que comparte con la vecina.'
        ],
        diagram: 'f2s14-three', state: { R: x2.R, E: [x2.e1, -x2.e2], arcs: 1, shared: 1 },
        caption: 'Una corriente por ventana, en sentido horario. En las ramas compartidas pasa la diferencia.'
      },
      {
        type: 'explainer', heading: 'Capacitores en estado estable', short: 'Capacitores',
        title: 'Después de mucho tiempo, el capacitor es una rama abierta',
        intro: 'Si un circuito con baterías y resistores tiene un capacitor, al principio hay corrientes que lo van cargando (eso es la S15). Pero después de mucho tiempo, el capacitor se llena y todo deja de cambiar: es el <strong>estado estable</strong> ($t \\to \\infty$).',
        diagram: 'f2s14-cap',
        steps: [
          { text: 'Al conectar, las cargas se acumulan en las placas: por la rama del capacitor sí pasa corriente, cada vez menos.', state: { step: 0, R: x4.R, E: x4.e1, C: x4.C, vc: x4.VC } },
          { text: 'Cuando el capacitor se llena, su voltaje ya no cambia y entre sus placas hay un aislante: <strong>por su rama no pasa corriente</strong>. Es como si esa rama estuviera cortada.', state: { step: 1, R: x4.R, E: x4.e1, C: x4.C, vc: x4.VC } },
          { text: 'Resuelve el circuito <strong>sin esa rama</strong>. Aquí quedan dos mallas: $' + x4.a + 'I_1 - ' + x4.R[1] + 'I_2 = ' + x4.e1 + '$ y $-' + x4.R[1] + 'I_1 + ' + x4.d + 'I_2 = 0$, que dan $I_1 = ' + fx(x4.s.I1) + '$ A e $I_2 = ' + fx(x4.s.I2) + '$ A.', state: { step: 2, R: x4.R, E: x4.e1, C: x4.C, vc: x4.VC } },
          { text: 'El capacitor está conectado entre los mismos dos nodos que $R_4$, y por $R_5$ no pasa corriente (no hay caída): $V_C = I_2R_4 = ' + fx(x4.VC) + '$ V. Su carga: $Q = CV_C = (' + x4.C + '\\ \\mu\\text{F})(' + fx(x4.VC) + '\\ \\text{V}) = ' + fx(x4.Q) + '\\ \\mu\\text{C}$.', state: { step: 3, R: x4.R, E: x4.e1, C: x4.C, vc: x4.VC } }
        ]
      },
      {
        type: 'callout', heading: 'Comprueba con el balance de potencias',
        body: [
          'La energía que entregan las baterías por segundo es la que se vuelve calor en los resistores: $$\\sum \\varepsilon I = \\sum I^2R$$ Cada batería aporta $\\varepsilon I$ con la corriente que la cruza de $-$ a $+$ por dentro; si la cruza al revés, su término es negativo (se está cargando).',
          'Si el balance no cierra, hay un signo mal en alguna ecuación. Es la comprobación más rápida, y no depende de cómo planteaste el sistema.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: un circuito de varias mallas', short: 'Receta',
        steps: [
          { text: 'Si hay capacitores y te piden el estado estable, <strong>quita sus ramas</strong>: por ahí no pasa corriente.', tip: 'No recorras una malla que cruce el capacitor como si fuera un cable: su voltaje no es cero, es una incógnita más.' },
          { text: 'Cuenta nodos ($n$) y ramas ($b$). Dibuja una flecha por rama (o una corriente por ventana si usas mallas).' },
          { text: 'Escribe $n - 1$ ecuaciones de nodo y $b - n + 1$ de malla, recorriendo las ventanas con la convención de signos de la S13.', tip: 'No uses la malla grande junto con las dos ventanas que la forman: es su suma y el sistema queda sin solución única.' },
          { text: 'Ordénalas como $A\\,\\vec{I} = \\vec{b}$ (mismas columnas, fem a la derecha) y resuelve con Gauss, Cramer o la calculadora.', tip: 'Antes de resolver, revisa cada signo contra el dibujo. La calculadora no detecta un signo al revés.' },
          { text: 'Interpreta los signos (negativa = al revés de tu flecha), calcula lo que te pidan ($V$ entre nodos, $Q = CV$, potencias) y comprueba que $\\sum \\varepsilon I = \\sum I^2R$.' }
        ]
      },
      {
        type: 'example', heading: 'Dos mallas con eliminación de Gauss',
        problem: '<p>En el circuito, $\\varepsilon_1 = ' + x1.e1 + '\\ \\text{V}$, $R_1 = ' + x1.R[0] + '\\ \\Omega$, $R_2 = ' + x1.R[1] + '\\ \\Omega$, $R_3 = ' + x1.R[2] + '\\ \\Omega$ y $\\varepsilon_2 = ' + x1.e3 + '\\ \\text{V}$. Con las flechas del dibujo, halla las tres corrientes y el voltaje $V_{ab}$.</p>',
        diagram: 'f2s14-two', state: { R: x1.R, E: [x1.e1, 0, x1.e3], up: [1, -1, 1] },
        steps: [
          { text: 'Cuenta: $n = 2$ nodos y $b = 3$ ramas. Necesitas $1$ ecuación de nodo y $3 - 2 + 1 = 2$ de malla.' },
          { text: 'Nodo $a$: entran $I_1$ e $I_3$, sale $I_2$. Malla izquierda en horario: $+\\varepsilon_1 - R_1I_1 - R_2I_2 = 0$. Malla derecha en horario: $+R_2I_2 + R_3I_3 - \\varepsilon_2 = 0$ (subes por $R_2$ en contra de $I_2$, bajas por $R_3$ en contra de $I_3$ y cruzas $\\varepsilon_2$ de $+$ a $-$).', math: '\\left(\\begin{array}{ccc|c} 1 & -1 & 1 & 0 \\\\ ' + x1.R[0] + ' & ' + x1.R[1] + ' & 0 & ' + x1.e1 + ' \\\\ 0 & ' + x1.R[1] + ' & ' + x1.R[2] + ' & ' + x1.e3 + ' \\end{array}\\right)' },
          { text: 'Al renglón 2 réstale $' + x1.R[0] + '$ veces el renglón 1, para quitar $I_1$.', math: '0\\,I_1 + ' + x1.p + 'I_2 - ' + x1.R[0] + 'I_3 = ' + x1.e1 },
          { text: 'Al renglón 3 réstale $' + x1.R[1] + '/' + x1.p + '$ veces el nuevo renglón 2, para quitar $I_2$. Queda una sola incógnita.', math: fx(x1.q, 4) + '\\,I_3 = ' + fx(x1.rhs3, 4) + '\\quad\\Rightarrow\\quad I_3 = ' + sg(x1.I[2]) + '\\ \\text{A}' },
          { text: 'Despeja hacia arriba.', math: 'I_2 = \\frac{' + x1.e1 + ' + ' + x1.R[0] + 'I_3}{' + x1.p + '} = ' + fx(x1.I[1]) + '\\ \\text{A}\\qquad I_1 = I_2 - I_3 = ' + fx(x1.I[0]) + '\\ \\text{A}' },
          { text: '$I_3$ salió negativa: en realidad baja por la rama derecha y $\\varepsilon_2$ se está cargando. El voltaje entre los nodos es el de $R_2$, que lleva $I_2$ de $a$ hacia $b$.', math: 'V_{ab} = R_2I_2 = (' + x1.R[1] + ')(' + fx(x1.I[1]) + ') = ' + fx(x1.s.V) + '\\ \\text{V}' }
        ],
        answer: '$I_1 = ' + fx(x1.I[0]) + '$ A, $I_2 = ' + fx(x1.I[1]) + '$ A, $I_3 = ' + sg(x1.I[2]) + '$ A (va hacia abajo) y $V_{ab} = ' + fx(x1.s.V) + '$ V.',
        verify: { lab: 'call', mod: 'kirchsys', fn: 'solveNodal', args: [twoSpec(x1.R, x1.e1, x1.e3), [1, -1, 1]], values: { 'x.0': x1.I[0], 'x.1': x1.I[1], 'x.2': x1.I[2], 'pot.A': x1.s.V } }
      },
      {
        type: 'example', heading: 'Tres mallas con corrientes de malla y Cramer',
        problem: '<p>En el circuito de tres mallas, $\\varepsilon_1 = ' + x2.e1 + '\\ \\text{V}$, $\\varepsilon_2 = ' + x2.e2 + '\\ \\text{V}$ (con su terminal $+$ arriba), $R_1 = ' + x2.R[0] + '\\ \\Omega$, $R_2 = ' + x2.R[1] + '\\ \\Omega$, $R_3 = ' + x2.R[2] + '\\ \\Omega$, $R_4 = ' + x2.R[3] + '\\ \\Omega$ y $R_5 = ' + x2.R[4] + '\\ \\Omega$. Halla las corrientes de malla y la corriente por $R_2$.</p>',
        diagram: 'f2s14-three', state: { R: x2.R, E: [x2.e1, -x2.e2], arcs: 1 },
        steps: [
          { text: 'Tres ventanas, tres corrientes de malla en horario. Malla 1: diagonal $R_1 + R_2$, compartida $R_2$, fem $+\\varepsilon_1$ (la cruzas de $-$ a $+$).', math: '(' + x2.R[0] + ' + ' + x2.R[1] + ')I_1 - ' + x2.R[1] + 'I_2 = ' + x2.e1 },
          { text: 'Malla 2: no tiene baterías. Comparte $R_2$ con la malla 1 y $R_4$ con la malla 3.', math: '-' + x2.R[1] + 'I_1 + (' + x2.R[1] + ' + ' + x2.R[2] + ' + ' + x2.R[3] + ')I_2 - ' + x2.R[3] + 'I_3 = 0' },
          { text: 'Malla 3: al bajar por la derecha cruzas $\\varepsilon_2$ de $+$ a $-$, así que su término es $-\\varepsilon_2$.', math: '-' + x2.R[3] + 'I_2 + (' + x2.R[3] + ' + ' + x2.R[4] + ')I_3 = -' + x2.e2 },
          { text: 'En forma matricial, con su determinante:', math: matTex(x2.A) + IV + ' = ' + vecTex(x2.b) + '\\qquad D = ' + fx(x2.D) },
          { text: 'Cramer: cambia cada columna por $\\vec{b}$.', math: 'I_1 = \\frac{' + fx(x2.Dj[0]) + '}{' + fx(x2.D) + '} = ' + sg(x2.I[0]) + '\\quad I_2 = \\frac{' + fx(x2.Dj[1]) + '}{' + fx(x2.D) + '} = ' + sg(x2.I[1]) + '\\quad I_3 = \\frac{' + fx(x2.Dj[2]) + '}{' + fx(x2.D) + '} = ' + sg(x2.I[2]) },
          { text: 'Por $R_2$ pasa la diferencia. $I_3$ negativa significa que en la malla 3 la corriente gira en antihorario: sube por la rama derecha, empujada por $\\varepsilon_2$.', math: 'I_{R_2} = I_1 - I_2 = ' + fx(x2.I[0] - x2.I[1]) + '\\ \\text{A (hacia abajo)}' }
        ],
        answer: '$I_1 = ' + sg(x2.I[0]) + '$ A, $I_2 = ' + sg(x2.I[1]) + '$ A, $I_3 = ' + sg(x2.I[2]) + '$ A; por $R_2$ pasan $' + fx(x2.I[0] - x2.I[1]) + '$ A hacia abajo.',
        verify: { lab: 'call', mod: 'kirchsys', fn: 'solveNodal', args: [threeSpec(x2.R, x2.e1, x2.e2), [1, 1, 1]], values: { 'x.0': x2.I[0], 'x.1': x2.I[1], 'x.2': x2.I[2], 'i.1': x2.I[0] - x2.I[1] } }
      },
      {
        type: 'example', heading: 'El balance de potencias',
        problem: '<p>Con el circuito del ejemplo 1, ¿cuánta potencia entrega cada batería y cuánta disipa cada resistor? Comprueba el balance.</p>',
        steps: [
          { text: '$\\varepsilon_1$: la corriente $I_1 = ' + fx(x1.I[0]) + '$ A la cruza de $-$ a $+$.', math: 'P_1 = \\varepsilon_1I_1 = (' + x1.e1 + ')(' + fx(x1.I[0]) + ') = ' + fx(x1.P1) + '\\ \\text{W}' },
          { text: '$\\varepsilon_2$: con la flecha hacia arriba, $I_3 = ' + sg(x1.I[2]) + '$ A. El signo dice que la corriente la cruza de $+$ a $-$: recibe energía.', math: 'P_2 = \\varepsilon_2I_3 = (' + x1.e3 + ')(' + sg(x1.I[2]) + ') = ' + sg(x1.P3) + '\\ \\text{W}' },
          { text: 'Resistores: $I^2R$ en cada uno.', math: fx(x1.PR[0]) + ' + ' + fx(x1.PR[1]) + ' + ' + fx(x1.PR[2]) + ' = ' + fx(x1.PR[0] + x1.PR[1] + x1.PR[2]) + '\\ \\text{W}' },
          { text: 'Balance: $' + fx(x1.P1) + ' ' + (x1.P3 < 0 ? '-' : '+') + ' ' + fx(Math.abs(x1.P3)) + ' = ' + fx(x1.P1 + x1.P3) + '$ W. Coincide: los signos de las ecuaciones estaban bien.' }
        ],
        answer: '$\\varepsilon_1$ entrega $' + fx(x1.P1) + '$ W, $\\varepsilon_2$ recibe $' + fx(-x1.P3) + '$ W y los resistores disipan $' + fx(x1.PR[0] + x1.PR[1] + x1.PR[2]) + '$ W.',
        verify: { lab: 'call', mod: 'kirchsys', fn: 'solveNodal', args: [twoSpec(x1.R, x1.e1, x1.e3), [1, -1, 1]], values: { Psup: x1.P1 + x1.P3, Pdis: x1.PR[0] + x1.PR[1] + x1.PR[2], 'P.0': x1.P1, 'P.2': x1.P3 } }
      },
      {
        type: 'example', heading: 'La carga de un capacitor en estado estable',
        problem: '<p>En el circuito de tres mallas, la rama derecha tiene $R_5 = ' + x4.R[4] + '\\ \\Omega$ en serie con un capacitor de $' + x4.C + '\\ \\mu\\text{F}$. Con $\\varepsilon = ' + x4.e1 + '\\ \\text{V}$, $R_1 = ' + x4.R[0] + '\\ \\Omega$, $R_2 = ' + x4.R[1] + '\\ \\Omega$, $R_3 = ' + x4.R[2] + '\\ \\Omega$ y $R_4 = ' + x4.R[3] + '\\ \\Omega$, ¿cuánta carga tiene el capacitor después de mucho tiempo?</p>',
        diagram: 'f2s14-three', state: { R: x4.R, E: [x4.e1, 0], C: x4.C },
        steps: [
          { text: 'Estado estable: por la rama del capacitor no pasa corriente ($I_3 = 0$). Quedan dos mallas.' },
          { text: 'Mallas 1 y 2 en horario, sin la rama derecha:', math: x4.a + 'I_1 - ' + x4.R[1] + 'I_2 = ' + x4.e1 + '\\qquad -' + x4.R[1] + 'I_1 + ' + x4.d + 'I_2 = 0' },
          { text: 'De la segunda, $I_1 = ' + fx(x4.d / x4.R[1], 4) + 'I_2$. En la primera:', math: 'I_2 = \\frac{' + x4.e1 + '}{' + x4.a + '(' + fx(x4.d / x4.R[1], 4) + ') - ' + x4.R[1] + '} = ' + fx(x4.s.I2) + '\\ \\text{A}\\qquad I_1 = ' + fx(x4.s.I1) + '\\ \\text{A}' },
          { text: 'El capacitor y $R_4$ están entre los mismos dos nodos; $R_5$ no tiene caída porque no lleva corriente.', math: 'V_C = I_2R_4 = (' + fx(x4.s.I2) + ')(' + x4.R[3] + ') = ' + fx(x4.VC) + '\\ \\text{V}' },
          { text: 'La carga:', math: 'Q = CV_C = (' + x4.C + '\\ \\mu\\text{F})(' + fx(x4.VC) + '\\ \\text{V}) = ' + fx(x4.Q) + '\\ \\mu\\text{C} = ' + fx(x4.Q * 1e-6 * 1e5, 2) + '\\times 10^{-5}\\ \\text{C}' }
        ],
        answer: '$V_C = ' + fx(x4.VC) + '$ V y $Q = ' + fx(x4.Q) + '\\ \\mu\\text{C}$.',
        verify: { lab: 'call', mod: 'kirchsys', fn: 'solveNodal', args: [capSpec(x4.R, x4.e1, x4.C), [1, 1, 1]], values: { Q: x4.Q, VC: x4.VC, 'x.0': x4.s.I1, 'x.1': x4.s.I2, 'x.2': 0 } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Puedo escribir más ecuaciones de las necesarias, por si acaso?', a: 'Puedes, pero no ayudan: las de más son combinaciones de las otras. Lo que importa es tener tantas <strong>independientes</strong> como incógnitas. Si escoges mal (dos nodos de dos, o la malla grande con sus dos ventanas), te faltará una.' },
          { q: '¿Cómo sé si mis ecuaciones son independientes?', a: 'Si usas $n - 1$ nodos y las ventanas del dibujo, siempre lo son. Con la matriz: si $\\det A = 0$, alguna ecuación sobra (y falta otra).' },
          { q: '¿Corrientes de rama o corrientes de malla?', a: 'Dan lo mismo. Con corrientes de rama tienes más incógnitas pero cada una es directamente la corriente de un elemento. Con corrientes de malla tienes menos ecuaciones, pero en las ramas compartidas la corriente real es la diferencia.' },
          { q: '¿Por qué por un capacitor no pasa corriente, si sí se carga?', a: 'Mientras se carga sí pasa (las cargas llegan a las placas). Cuando ya está cargado, su voltaje deja de cambiar y la corriente $I = dQ/dt$ es cero. Entre sus placas hay un aislante: ninguna carga lo cruza.' },
          { q: '¿Qué voltaje tiene el capacitor en estado estable?', a: 'El que haya entre los dos nodos a los que se conecta. Si en su rama hay un resistor, ese resistor no tiene caída (no lleva corriente), así que el capacitor tiene todo el voltaje entre esos nodos.' },
          { q: 'Me salió una corriente negativa, ¿lo hago de nuevo?', a: 'No. El signo solo compara la corriente real con tu flecha: va al revés. Sigue usando el valor con su signo en las demás cuentas.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Cuenta primero: $n - 1$ ecuaciones de nodo y $b - n + 1$ de malla (las ventanas). La última de nodo y la malla grande sobran.',
          'Ordena el sistema como $A\\,\\vec{I} = \\vec{b}$ y resuélvelo con Gauss, Cramer ($I_j = D_j/D$) o la calculadora. Si $\\det A = 0$, hay ecuaciones dependientes.',
          'Corrientes de malla: una por ventana; en una rama compartida pasa la diferencia. Tres mallas, tres ecuaciones.',
          'Capacitor en estado estable: su rama está abierta ($I = 0$); resuelve sin ella y usa $Q = CV$ con el voltaje entre sus nodos. Comprueba siempre $\\sum \\varepsilon I = \\sum I^2R$.'
        ]
      }
    ],

    lab: {
      type: 'kirchhoff-solve', title: 'Tú planteas, el solver resuelve',
      intro: 'Elige el sentido de cada corriente (toca las flechas del dibujo) y escribe tus ecuaciones en la tabla, una por renglón: los coeficientes de $I_1$, $I_2$, $I_3$ y el lado derecho. El lab revisa si cada ecuación es una ley de Kirchhoff válida con tus sentidos y si el conjunto es independiente; resuelve tu sistema con math.js y lo compara con el solver nodal. Te avisa si un término tiene el signo al revés (y cuál), si una ecuación es la suma de otras, si te faltan ecuaciones o si recorriste el capacitor como si fuera un cable.',
      cfg: { preset: 0 }
    },

    formulas: [
      { label: 'Cuántas ecuaciones', tex: 'n - 1 \\text{ de nodo},\\quad b - n + 1 \\text{ de malla}' },
      { label: 'Signos (S13)', tex: '-IR \\text{ a favor},\\; +IR \\text{ en contra},\\; +\\varepsilon \\text{ de } - \\text{ a } +' },
      { label: 'Sistema', tex: 'A\\,\\vec{I} = \\vec{b}' },
      { label: 'Cramer', tex: 'I_j = \\frac{D_j}{D},\\quad D = \\det A' },
      { label: 'Rama compartida', tex: 'I_{rama} = I_1 - I_2' },
      { label: 'Capacitor en estado estable', tex: 'I_C = 0,\\quad Q = CV_C' },
      { label: 'Balance', tex: '\\sum \\varepsilon I = \\sum I^2R' }
    ],

    exercises: [
      {
        id: 'f2-s14-rama', title: 'Una corriente en un circuito de tres mallas',
        vars: { e1: [6, 24, 3], e2: [3, 15, 3], r1: [1, 6, 1], r2: [1, 8, 1], r3: [1, 6, 1], r4: [1, 8, 1], r5: [1, 6, 1] },
        prompt: function (v) {
          return '<p>En el circuito de tres mallas, $\\varepsilon_1 = ' + v.e1 + '\\ \\text{V}$, $\\varepsilon_2 = ' + v.e2 + '\\ \\text{V}$ (con su terminal $+$ arriba), $R_1 = ' + v.r1 + '\\ \\Omega$, $R_2 = ' + v.r2 + '\\ \\Omega$, $R_3 = ' + v.r3 + '\\ \\Omega$, $R_4 = ' + v.r4 + '\\ \\Omega$ y $R_5 = ' + v.r5 + '\\ \\Omega$. ¿Cuánta corriente pasa por $R_2$, en A? (Escribe su magnitud.)</p>';
        },
        diagram: { id: 'f2s14-three', state: function (v) { return { R: [v.r1, v.r2, v.r3, v.r4, v.r5], E: [v.e1, -v.e2] }; } },
        check: 'numeric', unit: 'A',
        answer: function (v) { var x = threeSol([v.r1, v.r2, v.r3, v.r4, v.r5], v.e1, v.e2); return Math.abs(x[0] - x[1]); },
        mistakes: {
          mesh: function (v) { return Math.abs(threeSol([v.r1, v.r2, v.r3, v.r4, v.r5], v.e1, v.e2)[0]); },
          sign: function (v) { var x = threeSol([v.r1, v.r2, v.r3, v.r4, v.r5], v.e1, -v.e2); return Math.abs(x[0] - x[1]); }
        },
        feedback: [
          { when: 'mesh', say: 'Ese es $I_1$, la corriente de la malla 1. Por $R_2$ pasan las dos mallas en sentidos contrarios: la corriente es $I_1 - I_2$.' },
          { when: 'sign', say: 'El signo de $\\varepsilon_2$ está al revés. Recorriendo la malla 3 en horario, bajas por la derecha y la cruzas de $+$ a $-$: su término es $-\\varepsilon_2$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return Math.abs(KS().solveNodal(threeSpec([v.r1, v.r2, v.r3, v.r4, v.r5], v.e1, v.e2)).i[1]); } },
        hint: 'Corrientes de malla en horario: diagonal = suma de las resistencias de la malla; fuera de la diagonal, $-R$ compartida. Luego $I_{R_2} = I_1 - I_2$.',
        solution: function (v) {
          var R = [v.r1, v.r2, v.r3, v.r4, v.r5], A = meshA(R), x = threeSol(R, v.e1, v.e2);
          return '$$' + matTex(A) + IV + ' = ' + vecTex([v.e1, 0, -v.e2]) + '$$ Con Cramer o la calculadora: $I_1 = ' + fx(x[0], 3) + '$ A, $I_2 = ' + fx(x[1], 3) + '$ A, $I_3 = ' + fx(x[2], 3) + '$ A. $$|I_1 - I_2| = ' + fx(Math.abs(x[0] - x[1])) + '\\ \\text{A}$$';
        }
      },
      {
        id: 'f2-s14-cuantas', title: 'Cuántas ecuaciones',
        vars: { n: [2, 6, 1], m: [2, 4, 1] },
        prompt: function (v) { return '<p>Un circuito tiene $' + v.n + '$ nodos y $' + (v.n - 1 + v.m) + '$ ramas, y no tiene capacitores. Si usas corrientes de rama, ¿cuántas ecuaciones de cada tipo necesitas?</p>'; },
        check: 'choice',
        options: function (v) {
          var b = v.n - 1 + v.m;
          return [
            { text: (v.n - 1) + ' de nodo y ' + v.m + ' de malla', correct: true },
            { text: v.n + ' de nodo y ' + v.m + ' de malla', say: 'Una de nodo sobra: la del último nodo es la suma de las demás. Son $n - 1$.' },
            { text: (v.n - 1) + ' de nodo y ' + b + ' de malla', say: 'No es una malla por rama. Las mallas independientes son $b - n + 1$ (las ventanas del dibujo).' },
            { text: v.n + ' de nodo y ' + b + ' de malla', say: 'Así tendrías más ecuaciones que incógnitas, y varias serían dependientes. Necesitas $b$ en total: $n - 1$ de nodo y $b - n + 1$ de malla.' }
          ];
        },
        answer: function (v) { return (v.n - 1) + ' de nodo y ' + v.m + ' de malla'; },
        hint: 'Una incógnita por rama. De nodo, $n - 1$; de malla, $b - n + 1$.',
        solution: function (v) { var b = v.n - 1 + v.m; return 'Hay $b = ' + b + '$ corrientes. Ecuaciones de nodo: $n - 1 = ' + (v.n - 1) + '$. De malla: $b - n + 1 = ' + b + ' - ' + v.n + ' + 1 = ' + v.m + '$. En total $' + b + '$, una por incógnita.'; }
      },
      {
        id: 'f2-s14-voltaje', title: 'Voltaje entre dos nodos',
        vars: { e1: [6, 24, 3], e3: [3, 18, 3], r1: [1, 10, 1], r2: [1, 10, 1], r3: [1, 10, 1] },
        prompt: function (v) { return '<p>En el circuito de dos nodos, $\\varepsilon_1 = ' + v.e1 + '\\ \\text{V}$, $R_1 = ' + v.r1 + '\\ \\Omega$, $R_2 = ' + v.r2 + '\\ \\Omega$, $R_3 = ' + v.r3 + '\\ \\Omega$ y $\\varepsilon_2 = ' + v.e3 + '\\ \\text{V}$ (las dos con su terminal $+$ arriba). ¿Cuánto vale el voltaje $V_{ab}$ entre los nodos, en V?</p>'; },
        diagram: { id: 'f2s14-two', state: function (v) { return { R: [v.r1, v.r2, v.r3], E: [v.e1, 0, v.e3], up: [1, -1, 1] }; } },
        check: 'numeric', unit: 'V',
        answer: function (v) { return twoSol([v.r1, v.r2, v.r3], v.e1, v.e3).V; },
        mistakes: {
          sign: function (v) { return Math.abs(twoSol([v.r1, v.r2, v.r3], v.e1, -v.e3).V); },
          alone: function (v) { return v.e1 * v.r2 / (v.r1 + v.r2); }
        },
        feedback: [
          { when: 'sign', say: 'Tomaste $\\varepsilon_2$ con el signo al revés. En la malla derecha (horario) bajas por la rama de $\\varepsilon_2$ y la cruzas de $+$ a $-$.' },
          { when: 'alone', say: 'Resolviste la malla izquierda como si estuviera sola. La rama de $\\varepsilon_2$ también manda corriente por $R_2$: hace falta el sistema completo.' }
        ],
        oracle: { lab: 'value', value: function (v) { return KS().solveNodal(twoSpec([v.r1, v.r2, v.r3], v.e1, v.e3)).pot.A; } },
        hint: 'Plantea nodo $a$ y las dos ventanas, resuelve $I_2$ y usa $V_{ab} = R_2I_2$.',
        solution: function (v) {
          var s = twoSol([v.r1, v.r2, v.r3], v.e1, v.e3);
          return '$$\\begin{aligned} I_1 - I_2 + I_3 &= 0 \\\\ ' + v.r1 + 'I_1 + ' + v.r2 + 'I_2 &= ' + v.e1 + ' \\\\ ' + v.r2 + 'I_2 + ' + v.r3 + 'I_3 &= ' + v.e3 + ' \\end{aligned}$$ Resolviendo, $I_2 = ' + fx(s.I[1], 4) + '$ A. $$V_{ab} = R_2I_2 = ' + fx(s.V) + '\\ \\text{V}$$';
        }
      },
      {
        id: 'f2-s14-capacitor', title: 'Carga de un capacitor en estado estable',
        vars: { e1: [6, 24, 3], r1: [1, 6, 1], r2: [1, 8, 1], r3: [1, 6, 1], r4: [1, 8, 1], r5: [1, 6, 1], C: [2, 20, 2] },
        prompt: function (v) { return '<p>En el circuito, la rama derecha tiene $R_5 = ' + v.r5 + '\\ \\Omega$ en serie con un capacitor de $' + v.C + '\\ \\mu\\text{F}$. Con $\\varepsilon = ' + v.e1 + '\\ \\text{V}$, $R_1 = ' + v.r1 + '\\ \\Omega$, $R_2 = ' + v.r2 + '\\ \\Omega$, $R_3 = ' + v.r3 + '\\ \\Omega$ y $R_4 = ' + v.r4 + '\\ \\Omega$, ¿cuánta carga tiene el capacitor después de mucho tiempo, en μC?</p>'; },
        diagram: { id: 'f2s14-three', state: function (v) { return { R: [v.r1, v.r2, v.r3, v.r4, v.r5], E: [v.e1, 0], C: v.C }; } },
        check: 'numeric', unit: 'μC',
        answer: function (v) { return v.C * v.r4 * capI([v.r1, v.r2, v.r3, v.r4], v.e1).I2; },
        mistakes: {
          wire: function (v) { var x = threeSol([v.r1, v.r2, v.r3, v.r4, v.r5], v.e1, 0); return v.C * v.r4 * Math.abs(x[1] - x[2]); },
          emf: function (v) { return v.C * v.e1; }
        },
        feedback: [
          { when: 'wire', say: 'Trataste el capacitor como un cable y dejaste pasar corriente por la rama derecha. En estado estable esa rama está abierta: $I_3 = 0$ y solo quedan dos mallas.' },
          { when: 'emf', say: 'El capacitor no tiene todo el voltaje de la batería: tiene el de $R_4$, que está conectado entre los mismos dos nodos.' }
        ],
        oracle: { lab: 'value', value: function (v) { return KS().solveNodal(capSpec([v.r1, v.r2, v.r3, v.r4, v.r5], v.e1, v.C)).Q; } },
        hint: 'Quita la rama del capacitor, resuelve las dos mallas que quedan, $V_C = I_2R_4$ y $Q = CV_C$.',
        solution: function (v) {
          var s = capI([v.r1, v.r2, v.r3, v.r4], v.e1), VC = v.r4 * s.I2;
          return 'Sin la rama derecha: $' + (v.r1 + v.r2) + 'I_1 - ' + v.r2 + 'I_2 = ' + v.e1 + '$ y $-' + v.r2 + 'I_1 + ' + (v.r2 + v.r3 + v.r4) + 'I_2 = 0$, de donde $I_2 = ' + fx(s.I2, 4) + '$ A. $V_C = I_2R_4 = ' + fx(VC, 3) + '$ V. $$Q = CV_C = (' + v.C + ')(' + fx(VC, 3) + ') = ' + fx(v.C * VC) + '\\ \\mu\\text{C}$$';
        }
      },
      {
        id: 'f2-s14-potencia', title: 'Potencia de una fuente',
        vars: { e1: [9, 24, 3], e3: [3, 12, 3], r1: [1, 8, 1], r2: [1, 8, 1], r3: [1, 8, 1] },
        prompt: function (v) { return '<p>En el circuito de dos nodos, $\\varepsilon_1 = ' + v.e1 + '\\ \\text{V}$, $R_1 = ' + v.r1 + '\\ \\Omega$, $R_2 = ' + v.r2 + '\\ \\Omega$, $R_3 = ' + v.r3 + '\\ \\Omega$ y $\\varepsilon_2 = ' + v.e3 + '\\ \\text{V}$ (las dos con su terminal $+$ arriba). ¿Qué potencia entrega $\\varepsilon_1$, en W?</p>'; },
        diagram: { id: 'f2s14-two', state: function (v) { return { R: [v.r1, v.r2, v.r3], E: [v.e1, 0, v.e3], up: [1, -1, 1] }; } },
        check: 'numeric', unit: 'W',
        baseWhere: function (v) { return twoSol([v.r1, v.r2, v.r3], v.e1, v.e3).I[0] > 0; },
        answer: function (v) { return v.e1 * twoSol([v.r1, v.r2, v.r3], v.e1, v.e3).I[0]; },
        mistakes: {
          heat: function (v) { var I = twoSol([v.r1, v.r2, v.r3], v.e1, v.e3).I[0]; return I * I * v.r1; },
          sign: function (v) { return Math.abs(v.e1 * twoSol([v.r1, v.r2, v.r3], v.e1, -v.e3).I[0]); }
        },
        feedback: [
          { when: 'heat', say: 'Eso es lo que disipa $R_1$ ($I_1^2R_1$). La potencia que entrega la batería es $\\varepsilon_1I_1$.' },
          { when: 'sign', say: 'El signo de $\\varepsilon_2$ en la malla derecha está al revés: la cruzas de $+$ a $-$ al bajar por su rama.' }
        ],
        // Otra ruta: balance de potencias con las corrientes del solver nodal (Σ I²R − ε₂I₃).
        oracle: { lab: 'value', value: function (v) { var s = KS().solveNodal(twoSpec([v.r1, v.r2, v.r3], v.e1, v.e3)); return s.Pdis - s.P[2]; } },
        hint: 'Resuelve $I_1$ con el sistema de dos mallas y multiplica por $\\varepsilon_1$. Comprueba con $\\sum \\varepsilon I = \\sum I^2R$.',
        solution: function (v) { var s = twoSol([v.r1, v.r2, v.r3], v.e1, v.e3); return 'Del sistema (nodo $a$ y las dos ventanas): $I_1 = ' + fx(s.I[0], 4) + '$ A. $$P_1 = \\varepsilon_1I_1 = (' + v.e1 + ')(' + fx(s.I[0], 4) + ') = ' + fx(v.e1 * s.I[0]) + '\\ \\text{W}$$'; }
      },
      {
        id: 'f2-s14-dependiente', title: 'Concepto: ecuaciones que no alcanzan',
        vars: {},
        prompt: function () { return '<p>En un circuito de dos nodos y tres ramas, un compañero escribe la malla izquierda, la malla derecha y la malla grande (el borde de todo el circuito). Su calculadora dice que el sistema no tiene solución única. ¿Por qué?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'La malla grande es la suma de las otras dos: le falta la ecuación del nodo', correct: true },
            { text: 'Le falta una cuarta ecuación de malla', say: 'Con dos nodos y tres ramas solo hay dos mallas independientes. Lo que falta es la de nodo.' },
            { text: 'Eligió mal el sentido de alguna corriente', say: 'El sentido nunca impide resolver: solo cambia el signo del resultado.' },
            { text: 'El circuito no tiene solución', say: 'Todo circuito de resistores y baterías tiene corrientes bien definidas. El problema es el sistema que escribió.' }
          ];
        },
        answer: function () { return 'La malla grande es la suma de las otras dos: le falta la ecuación del nodo'; },
        hint: 'Suma las ecuaciones de las dos ventanas. ¿Qué te queda?',
        solution: function () { return 'Al sumar las dos ventanas, el tramo compartido se cancela y sale la malla grande: es dependiente. Necesita $n - 1 = 1$ ecuación de nodo y $b - n + 1 = 2$ de malla.'; }
      }
    ],

    quiz: { tags: ['f2.S14'], count: 8 },

    errors: [
      'Escribir la ecuación de todos los nodos, o la malla grande junto con sus dos ventanas: quedan ecuaciones dependientes y falta información.',
      'Cambiar el signo de un término al pasar del dibujo a la matriz. Revisa cada coeficiente contra el sentido de su flecha.',
      'Con corrientes de malla, usar la corriente de una sola malla en una rama compartida. Por ahí pasa la diferencia.',
      'Recorrer una malla que cruza un capacitor como si fuera un cable. En estado estable su rama está abierta y $I = 0$.',
      'Darle al capacitor el voltaje de la batería: tiene el voltaje entre los dos nodos a los que se conecta.',
      'Confiar en la calculadora sin comprobar: un sistema mal planteado se resuelve igual de bien. Usa el balance de potencias.'
    ],

    teacher: {
      plan: [
        'Empieza contando: nodos, ramas y ventanas en varios circuitos. Que justifiquen por qué sobra un nodo (sumando todas las de nodo).',
        'Arma la matriz del circuito de dos mallas de la S13 y resuélvela con Gauss a mano; compara con la sustitución que ya conocen.',
        'Cramer y la calculadora con el ejemplo de tres mallas. Introduce las corrientes de malla como atajo y el patrón de la matriz.',
        'Capacitores en estado estable con el explainer; cierra con el lab: que planteen el circuito con capacitor y vean el «casi» si lo recorren como cable.'
      ],
      check: [
        'Que digan cuántas ecuaciones de cada tipo necesitan antes de escribir.',
        'Que comprueben siempre con el balance de potencias y con un voltaje calculado por dos caminos.'
      ],
      note: 'El análisis nodal (el que usa el solver del lab) es otra forma sistemática de plantear: incógnitas = potenciales de los nodos. Se puede mencionar como curiosidad. La carga y descarga del capacitor en el tiempo es la S15.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §10.3 “Kirchhoff\'s Rules”. <a href="https://openstax.org/books/university-physics-volume-2/pages/10-3-kirchhoffs-rules">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §10.5 “RC Circuits”. <a href="https://openstax.org/books/university-physics-volume-2/pages/10-5-rc-circuits">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-13',
    next: 'sesion-15'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
