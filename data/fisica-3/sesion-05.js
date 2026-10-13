/* =====================================================================
   Física 3 · S05 · Torque en una espira, dipolo magnético y motor (bloque A · Fuerza magnética).
   Fuente: OpenStax, University Physics Volume 2, §11.5 (CC BY-NC-SA 4.0).
   θ es siempre el ángulo entre la normal de la espira (mano derecha con la corriente) y B.
   Las cuentas se hacen aquí con fórmulas propias y scripts/examples.test.js
   las compara contra LabMath.loop (lab loop-torque).
   ===================================================================== */
(function () {
  var RAD = Math.PI / 180;
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

  // Ejemplo 1: bobina rectangular 5.0 cm × 8.0 cm, N = 50, I = 0.40 A, B = 0.30 T, θ = 30°.
  var e1 = { N: 50, I: 0.40, a: 0.050, b: 0.080, B: 0.30, th: 30 }; e1.A = e1.a * e1.b; e1.mu = e1.N * e1.I * e1.A;
  e1.tau = e1.mu * e1.B * Math.sin(e1.th * RAD); e1.tauMax = e1.mu * e1.B;
  // Ejemplo 2: espira circular r = 4.0 cm, N = 20, I = 1.5 A, B = 0.25 T, el PLANO a 20° del campo (θ = 70°).
  var e2 = { N: 20, I: 1.5, r: 0.040, B: 0.25, plane: 20 }; e2.th = 90 - e2.plane; e2.A = Math.PI * e2.r * e2.r;
  e2.tau = e2.N * e2.I * e2.A * e2.B * Math.sin(e2.th * RAD);
  // Ejemplo 3: energía y trabajo al girar de θ = 0° a 180° con μ = 0.12 A·m² y B = 0.50 T.
  var e3 = { mu: 0.12, B: 0.50 }; e3.U0 = -e3.mu * e3.B; e3.U180 = e3.mu * e3.B; e3.W = e3.U180 - e3.U0;
  // Ejemplo 4: motor de cd, N = 100, A = 12 cm², I = 2.0 A, B = 0.60 T: torque máximo y promedio.
  var e4 = { N: 100, A: 12e-4, I: 2.0, B: 0.60 }; e4.max = e4.N * e4.I * e4.A * e4.B; e4.avg = 2 / Math.PI * e4.max;

  var data = window.SESSION_DATA = {
    slug: 'sesion-05', number: '05', group: 'A · Fuerza magnética',
    title: 'Torque en una espira, dipolo magnético y motor', temario: [],
    minutes: 120,
    quote: 'Una espira con corriente en un campo uniforme no se traslada, pero gira: es un pequeño imán, con momento $\\vec\\mu = NI A\\,\\hat n$, que el campo trata de alinear.',
    badges: [
      'Calcular el torque $\\tau = NIAB\\sin\\theta$ sobre una espira, con $\\theta$ medido desde la normal.',
      'Usar el momento dipolar $\\vec\\mu = NIA\\,\\hat n$ y escribir $\\vec\\tau = \\vec\\mu \\times \\vec B$.',
      'Calcular la energía $U = -\\vec\\mu\\cdot\\vec B$ y el trabajo para girar una espira.',
      'Explicar cómo el conmutador hace girar un motor de corriente directa.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'En la sesión 4 vimos que sobre una espira cerrada en un campo uniforme la fuerza neta es cero. Pero dos fuerzas iguales y opuestas que no actúan sobre la misma línea <strong>hacen girar</strong>.',
        recall: [
          'La fuerza sobre un conductor, $\\vec F = I\\vec L \\times \\vec B$ (<a href="../sesion-04/">S04</a>).',
          'Torque $\\vec\\tau = \\vec r \\times \\vec F$ y el par de fuerzas (<a href="../../../fisica-1/sesiones/sesion-15/">Física 1 · S15</a>).',
          'La aguja de una brújula se alinea con $\\vec B$ (<a href="../sesion-01/">S01</a>).'
        ],
        why: 'Así funcionan los motores eléctricos, los galvanómetros de aguja y la resonancia magnética (los núcleos de los átomos son dipolos magnéticos). Y explica por qué una brújula gira hasta alinearse.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en un volante de auto: si empujas un lado hacia arriba y el otro hacia abajo con la misma fuerza, el volante no se mueve de lugar, pero gira.',
          'En una espira en un campo uniforme pasa lo mismo: en dos lados opuestos la corriente va en sentidos contrarios, así que las fuerzas son iguales y opuestas. No se trasladan la espira, pero forman un <strong>par</strong> que la hace girar hasta que su plano queda perpendicular al campo.'
        ]
      },
      {
        type: 'explainer', heading: 'Las fuerzas en los cuatro lados', short: 'Las cuatro fuerzas',
        title: 'Del alambre a la espira',
        intro: 'Una espira rectangular de lados $a$ (paralelos al eje de giro) y $b$, con su normal $\\hat n$ a un ángulo $\\theta$ del campo.',
        diagram: 'f3s05-loop3d',
        steps: [
          { text: 'La espira puede girar alrededor del eje. Su normal $\\hat n$ se define con la mano derecha: dedos con la corriente, pulgar en $\\hat n$. El campo $\\vec B$ es uniforme.', state: { show: 0, th: 60 } },
          { text: 'Sobre los lados $b$ las fuerzas apuntan a lo largo del eje, son iguales y opuestas y están sobre la misma línea: se cancelan sin hacer torque.', state: { show: 1, th: 60 } },
          { text: 'Sobre los lados $a$, perpendiculares a $\\vec B$, cada fuerza mide $F = NIaB$; son opuestas pero <strong>no</strong> están sobre la misma línea: forman un par.', state: { show: 2, th: 60 } },
          { text: 'Cada fuerza tiene un brazo $\\tfrac{b}{2}\\sin\\theta$ respecto al eje. El torque total es $\\tau = 2\\,(NIaB)\\,\\tfrac{b}{2}\\sin\\theta = NI(ab)B\\sin\\theta = NIAB\\sin\\theta$. La fuerza neta es cero.', state: { show: 3, th: 60 } }
        ]
      },
      {
        type: 'concept', heading: 'El torque sobre una espira', short: 'Torque',
        body: [
          'Para una espira plana de $N$ vueltas, área $A$ y corriente $I$, en un campo uniforme: $$\\tau = NIAB\\sin\\theta$$ con $\\theta$ el ángulo entre la <strong>normal</strong> de la espira y $\\vec B$. Aunque lo dedujimos con un rectángulo, vale para cualquier forma plana (un círculo, un triángulo): solo importa el área.',
          'El torque es máximo cuando el plano de la espira es paralelo al campo ($\\theta = 90^\\circ$) y es cero cuando la espira está perpendicular al campo ($\\theta = 0^\\circ$ o $180^\\circ$). Cuidado: si te dan el ángulo entre el <strong>plano</strong> y el campo, $\\theta = 90^\\circ -$ ese ángulo.'
        ],
        diagram: 'f3s05-top', state: { th: 60 },
        caption: 'Desde arriba: el par de fuerzas tiene un brazo $(b/2)\\sin\\theta$ en cada lado.'
      },
      {
        type: 'concept', heading: 'El momento dipolar magnético', short: 'Dipolo magnético',
        body: [
          'Todo lo que depende de la espira se junta en un vector, el <strong>momento dipolar magnético</strong>: $$\\vec\\mu = NIA\\,\\hat n$$ Sus unidades son A·m². Con él, el torque se escribe como un producto cruz: $$\\vec\\tau = \\vec\\mu \\times \\vec B$$',
          'Una espira con corriente se porta como un imán pequeño: el lado hacia donde apunta $\\vec\\mu$ es su polo norte. Por eso el campo la hace girar hasta que $\\vec\\mu$ apunte como $\\vec B$, igual que a la aguja de una brújula. Los imanes de la sesión 1 deben su magnetismo a muchísimas de estas "espiras" atómicas alineadas.'
        ],
        diagram: 'f3s05-dipole',
        caption: 'La espira con corriente es un dipolo magnético, como un imán de barra.'
      },
      {
        type: 'concept', heading: 'Energía de un dipolo en un campo', short: 'Energía',
        body: [
          'Girar la espira contra el torque cuesta trabajo, así que tiene una energía potencial que depende de su orientación: $$U = -\\vec\\mu\\cdot\\vec B = -\\mu B\\cos\\theta$$',
          'La energía es mínima, $-\\mu B$, con $\\vec\\mu$ alineado con $\\vec B$ ($\\theta = 0^\\circ$, equilibrio <strong>estable</strong>) y máxima, $+\\mu B$, con $\\vec\\mu$ opuesto ($\\theta = 180^\\circ$, equilibrio <strong>inestable</strong>). Para girar la espira de $\\theta_1$ a $\\theta_2$ hay que hacer un trabajo $W = U_2 - U_1$; de 0° a 180° cuesta $2\\mu B$.'
        ],
        diagram: 'f3s05-energy', state: { th: 60 },
        caption: 'La espira tiende a ir al mínimo de energía: $\\vec\\mu$ alineado con $\\vec B$.'
      },
      {
        type: 'concept', heading: 'El motor de corriente directa', short: 'Motor',
        body: [
          'Si dejas girar una espira con corriente, oscila alrededor de $\\theta = 0^\\circ$ y se detiene ahí. Para que siga girando, al pasar por $\\theta = 0^\\circ$ hay que <strong>invertir la corriente</strong>: así $\\vec\\mu$ se voltea y vuelve a haber torque en el mismo sentido de giro.',
          'Eso lo hace el <strong>conmutador</strong>, un anillo partido unido a la espira que toca dos escobillas fijas conectadas a la batería. Con él, el torque es $NIAB\\,|\\sin\\theta|$: nunca cambia de signo y su promedio en una vuelta es $\\tfrac{2}{\\pi}NIAB$. Los motores reales usan muchas bobinas a distintos ángulos para que el torque sea casi constante.'
        ],
        diagram: 'f3s05-motor',
        caption: 'El conmutador invierte la corriente cada media vuelta.'
      },
      {
        type: 'callout', heading: 'Galvanómetros y resonancia magnética',
        body: [
          'En un galvanómetro de aguja, una bobina con resorte gira un ángulo proporcional a la corriente: el torque magnético se equilibra con el del resorte. En una resonancia magnética, los núcleos de hidrógeno del cuerpo son dipolos magnéticos que el campo intenso alinea; las señales de radio que emiten al reorientarse forman la imagen.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: torque y energía de una espira', short: 'Receta',
        steps: [
          { text: 'Calcula el área en m² ($1\\ \\text{cm}^2 = 10^{-4}\\ \\text{m}^2$) y el momento $\\mu = NIA$.', tip: 'Para un círculo, $A = \\pi r^2$ con el radio, no el diámetro.' },
          { text: 'Encuentra $\\theta$ entre la normal y $\\vec B$. Si te dan el ángulo con el plano, $\\theta = 90^\\circ -$ ese ángulo.' },
          { text: 'Torque: $\\tau = \\mu B\\sin\\theta$. Su dirección: $\\vec\\mu \\times \\vec B$, que hace girar a $\\vec\\mu$ hacia $\\vec B$.' },
          { text: 'Energía: $U = -\\mu B\\cos\\theta$. Trabajo para girarla de $\\theta_1$ a $\\theta_2$: $W = U_2 - U_1$.', tip: 'No confundas: el torque lleva seno y la energía, coseno con signo menos.' }
        ]
      },
      {
        type: 'example', heading: 'Una bobina rectangular',
        problem: '<p>Una bobina rectangular de $5.0\\ \\text{cm}\\times 8.0\\ \\text{cm}$ tiene ' + e1.N + ' vueltas y lleva $' + fx(e1.I, 2) + '\\ \\text{A}$ en un campo de $' + fx(e1.B, 2) + '\\ \\text{T}$. Su normal forma $' + e1.th + '^\\circ$ con el campo. ¿Cuánto vale el momento dipolar, el torque y el torque máximo?</p>',
        steps: [
          { text: 'Área y momento dipolar.', math: 'A = (0.050)(0.080) = ' + fx(e1.A, 4) + '\\ \\text{m}^2 \\qquad \\mu = NIA = (' + e1.N + ')(' + fx(e1.I, 2) + ')(' + fx(e1.A, 4) + ') = ' + fx(e1.mu, 3) + '\\ \\text{A·m}^2' },
          { text: 'Torque con el ángulo entre la normal y el campo.', math: '\\tau = \\mu B\\sin\\theta = (' + fx(e1.mu, 3) + ')(' + fx(e1.B, 2) + ')\\sin ' + e1.th + '^\\circ = ' + fx(e1.tau, 4) + '\\ \\text{N·m}' },
          { text: 'El máximo es con $\\theta = 90^\\circ$ (el plano de la bobina paralelo al campo).', math: '\\tau_{\\text{máx}} = \\mu B = ' + fx(e1.tauMax, 4) + '\\ \\text{N·m}' }
        ],
        answer: '$\\mu = ' + fx(e1.mu, 3) + '\\ \\text{A·m}^2$, $\\tau = ' + fx(e1.tau * 1000, 1) + '\\ \\text{mN·m}$ y $\\tau_{\\text{máx}} = ' + fx(e1.tauMax * 1000, 1) + '\\ \\text{mN·m}$.',
        verify: { lab: 'call', mod: 'loop', fn: 'torque', args: [e1.N, e1.I, e1.A, e1.B, e1.th], value: e1.tau }
      },
      {
        type: 'example', heading: 'Cuando te dan el ángulo con el plano',
        problem: '<p>Una espira circular de $4.0\\ \\text{cm}$ de radio y ' + e2.N + ' vueltas lleva $' + fx(e2.I, 1) + '\\ \\text{A}$. El <strong>plano</strong> de la espira forma $' + e2.plane + '^\\circ$ con un campo de $' + fx(e2.B, 2) + '\\ \\text{T}$. ¿Qué torque siente?</p>',
        steps: [
          { text: 'La fórmula usa el ángulo con la normal, que es perpendicular al plano.', math: '\\theta = 90^\\circ - ' + e2.plane + '^\\circ = ' + e2.th + '^\\circ' },
          { text: 'El área de un círculo, con el radio en metros.', math: 'A = \\pi r^2 = \\pi(0.040)^2 = ' + fx(e2.A * 1e4, 2) + '\\times 10^{-4}\\ \\text{m}^2' },
          { text: 'Torque.', math: '\\tau = NIAB\\sin\\theta = (' + e2.N + ')(' + fx(e2.I, 1) + ')(' + fx(e2.A * 1e4, 2) + '\\times 10^{-4})(' + fx(e2.B, 2) + ')\\sin ' + e2.th + '^\\circ = ' + fx(e2.tau * 1000, 2) + '\\ \\text{mN·m}' },
          { text: 'Con $\\sin 20^\\circ$ habrías obtenido casi la tercera parte: es el error más común de este tema.' }
        ],
        answer: '$\\tau = ' + fx(e2.tau * 1000, 2) + '\\ \\text{mN·m}$.',
        verify: { lab: 'call', mod: 'loop', fn: 'truth', args: [{ shape: 'circ', N: e2.N, I: e2.I, r: 4.0, B: e2.B, ang: e2.plane, ref: 'plano' }], value: e2.tau * 1000 }
      },
      {
        type: 'example', heading: 'Darle la vuelta a un dipolo',
        problem: '<p>Una espira con $\\mu = ' + fx(e3.mu, 2) + '\\ \\text{A·m}^2$ está alineada con un campo de $' + fx(e3.B, 2) + '\\ \\text{T}$. ¿Cuánto trabajo hay que hacer para girarla hasta que $\\vec\\mu$ apunte al revés del campo?</p>',
        steps: [
          { text: 'Energía al inicio ($\\theta = 0^\\circ$) y al final ($\\theta = 180^\\circ$).', math: 'U_0 = -\\mu B = ' + fx(e3.U0, 3) + '\\ \\text{J} \\qquad U_{180} = +\\mu B = ' + fx(e3.U180, 3) + '\\ \\text{J}' },
          { text: 'El trabajo que hace el agente externo es el cambio de energía.', math: 'W = U_{180} - U_0 = 2\\mu B = ' + fx(e3.W, 3) + '\\ \\text{J}' }
        ],
        answer: '$W = 2\\mu B = ' + fx(e3.W, 3) + '\\ \\text{J}$.',
        verify: { lab: 'call', mod: 'loop', fn: 'workField', args: [1, 1, e3.mu, e3.B, 180, 0], value: e3.W }
      },
      {
        type: 'example', heading: 'El torque de un motor',
        problem: '<p>Un motor de cd tiene una bobina de ' + e4.N + ' vueltas y $12\\ \\text{cm}^2$, con $' + fx(e4.I, 1) + '\\ \\text{A}$, en un campo de $' + fx(e4.B, 2) + '\\ \\text{T}$. ¿Cuál es su torque máximo y su torque promedio en una vuelta?</p>',
        steps: [
          { text: 'El máximo es con el plano de la bobina paralelo al campo.', math: '\\tau_{\\text{máx}} = NIAB = (' + e4.N + ')(' + fx(e4.I, 1) + ')(12\\times 10^{-4})(' + fx(e4.B, 2) + ') = ' + fx(e4.max, 3) + '\\ \\text{N·m}' },
          { text: 'Con el conmutador, $\\tau = \\tau_{\\text{máx}}|\\sin\\theta|$; el promedio de $|\\sin\\theta|$ en una vuelta es $2/\\pi$.', math: '\\bar\\tau = \\frac{2}{\\pi}\\tau_{\\text{máx}} = ' + fx(e4.avg, 3) + '\\ \\text{N·m}' }
        ],
        answer: '$\\tau_{\\text{máx}} = ' + fx(e4.max, 3) + '\\ \\text{N·m}$ y $\\bar\\tau = ' + fx(e4.avg, 3) + '\\ \\text{N·m}$.',
        verify: { lab: 'call', mod: 'loop', fn: 'motorAverage', args: [e4.N, e4.I, e4.A, e4.B], value: e4.avg }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Desde dónde mido $\\theta$?', a: 'Desde la normal de la espira (perpendicular a su plano) hasta $\\vec B$. Si el plano es paralelo al campo, $\\theta = 90^\\circ$ y el torque es máximo.' },
          { q: '¿Para qué lado gira la espira?', a: 'Hacia donde $\\vec\\mu$ se alinea con $\\vec B$, por el camino más corto. $\\vec\\tau = \\vec\\mu \\times \\vec B$ da el eje y el sentido.' },
          { q: '¿Por qué la forma de la espira no importa?', a: 'Porque el torque solo depende del momento $NIA$; cualquier espira plana se puede pensar como muchas espiras rectangulares pequeñas cuyos lados interiores se cancelan.' },
          { q: 'Si la fuerza neta es cero, ¿la espira se queda en su lugar?', a: 'En un campo uniforme, sí: solo gira. En un campo no uniforme, un dipolo sí siente fuerza neta (por eso un imán atrae a otro).' },
          { q: '¿Qué pasa en $\\theta = 180^\\circ$?', a: 'El torque es cero, pero es un equilibrio inestable: un empujoncito y la espira gira media vuelta hasta $\\theta = 0^\\circ$.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'En un campo uniforme, sobre una espira la fuerza neta es cero pero hay torque: $\\tau = NIAB\\sin\\theta$.',
          '$\\theta$ se mide entre la normal y $\\vec B$; con el ángulo del plano, $\\theta = 90^\\circ -$ ese ángulo.',
          'Momento dipolar $\\vec\\mu = NIA\\,\\hat n$; $\\vec\\tau = \\vec\\mu \\times \\vec B$ y $U = -\\vec\\mu\\cdot\\vec B$.',
          'Estable con $\\vec\\mu$ alineado con $\\vec B$; girarla 180° cuesta $2\\mu B$.',
          'El conmutador de un motor invierte la corriente cada media vuelta; el torque promedio es $\\tfrac{2}{\\pi}NIAB$.'
        ]
      }
    ],

    lab: {
      type: 'loop-torque', title: 'El torque sobre una espira',
      intro: 'La espira se ve desde arriba, de canto: los lados largos se ven de punta (punto: la corriente sale; cruz: entra). Cambia $N$, $I$, los lados, $B$ y el ángulo $\\theta$ entre la normal y el campo, y mira el par de fuerzas y las gráficas de $\\tau(\\theta)$ y $U(\\theta)$. Enciende el motor para ver cómo el conmutador mantiene el sentido del torque. En el reto calculas el torque en mN·m; el lab te dice si usaste el ángulo con el plano, si olvidaste las vueltas o si dejaste el área en cm².',
      cfg: {}
    },

    formulas: [
      { label: 'Torque', tex: '\\tau = NIAB\\sin\\theta' },
      { label: 'Momento dipolar', tex: '\\vec\\mu = NIA\\,\\hat n,\\quad \\vec\\tau = \\vec\\mu \\times \\vec B' },
      { label: 'Energía', tex: 'U = -\\vec\\mu\\cdot\\vec B = -\\mu B\\cos\\theta' },
      { label: 'Trabajo para girarla', tex: 'W = U_2 - U_1' },
      { label: 'Ángulo con el plano', tex: '\\theta = 90^\\circ - \\alpha_{\\text{plano}}' },
      { label: 'Motor (promedio)', tex: '\\bar\\tau = \\frac{2}{\\pi}NIAB' }
    ],

    exercises: [
      {
        id: 'f3-s05-torque', title: 'Torque sobre una bobina',
        vars: { N: [10, 100, 10], I: [0.5, 5, 0.5], a: [2, 10, 1], b: [2, 10, 1], B: [0.1, 1, 0.1], th: [15, 165, 15] },
        prompt: function (v) {
          return '<p>Una bobina rectangular de $' + v.a + '\\ \\text{cm}\\times ' + v.b + '\\ \\text{cm}$ con ' + v.N + ' vueltas lleva $' + fx(v.I, 1) + '\\ \\text{A}$ en un campo de $' + fx(v.B, 1) + '\\ \\text{T}$. Su normal forma $' + v.th + '^\\circ$ con el campo. ¿Cuánto vale el torque, en mN·m?</p>';
        },
        check: 'numeric', unit: 'mN·m',
        answer: function (v) { return v.N * v.I * v.a * v.b * 1e-4 * v.B * Math.sin(v.th * RAD) * 1000; },
        mistakes: {
          cos: function (v) { return Math.abs(v.N * v.I * v.a * v.b * 1e-4 * v.B * Math.cos(v.th * RAD)) * 1000; },
          noN: function (v) { return v.I * v.a * v.b * 1e-4 * v.B * Math.sin(v.th * RAD) * 1000; }
        },
        feedback: [
          { when: 'cos', say: 'El torque lleva $\\sin\\theta$ (el coseno es de la energía).' },
          { when: 'noN', say: 'Multiplica por las $N$ vueltas.' }
        ],
        where: function (v) { return v.th !== 90; },
        oracle: { lab: 'call', mod: 'loop', fn: 'torque', args: function (v) { return [v.N, v.I, v.a * v.b * 1e-4, v.B * 1000, v.th]; } },
        hint: '$\\tau = NIAB\\sin\\theta$ con $A$ en m².',
        solution: function (v) { var A = v.a * v.b * 1e-4; return '$$\\tau = NIAB\\sin\\theta = (' + v.N + ')(' + fx(v.I, 1) + ')(' + fx(A, 4) + ')(' + fx(v.B, 1) + ')\\sin ' + v.th + '^\\circ = ' + fx(v.N * v.I * A * v.B * Math.sin(v.th * RAD) * 1000, 3) + '\\ \\text{mN·m}$$'; }
      },
      {
        id: 'f3-s05-plano', title: 'El ángulo con el plano',
        vars: { N: [10, 50, 10], I: [1, 5, 1], r: [2, 6, 1], B: [0.1, 0.9, 0.1], al: [10, 80, 10] },
        prompt: function (v) {
          return '<p>Una espira circular de $' + v.r + '\\ \\text{cm}$ de radio y ' + v.N + ' vueltas lleva $' + v.I + '\\ \\text{A}$. Su <strong>plano</strong> forma $' + v.al + '^\\circ$ con un campo de $' + fx(v.B, 1) + '\\ \\text{T}$. ¿Qué torque siente, en mN·m?</p>';
        },
        check: 'numeric', unit: 'mN·m',
        answer: function (v) { return v.N * v.I * Math.PI * Math.pow(v.r / 100, 2) * v.B * Math.cos(v.al * RAD) * 1000; },
        mistakes: {
          plane: function (v) { return v.N * v.I * Math.PI * Math.pow(v.r / 100, 2) * v.B * Math.sin(v.al * RAD) * 1000; },
          diam: function (v) { return v.N * v.I * Math.PI * Math.pow(2 * v.r / 100, 2) * v.B * Math.cos(v.al * RAD) * 1000; }
        },
        feedback: [
          { when: 'plane', say: 'Usaste el ángulo con el plano como si fuera el de la normal: $\\theta = 90^\\circ - ' + '\\alpha$.' },
          { when: 'diam', say: 'El área es $\\pi r^2$ con el radio.' }
        ],
        where: function (v) { return v.al !== 45; },
        oracle: { lab: 'call', mod: 'loop', fn: 'truth', args: function (v) { return [{ shape: 'circ', N: v.N, I: v.I, r: v.r, B: v.B, ang: v.al, ref: 'plano' }]; } },
        hint: '$\\theta = 90^\\circ - \\alpha$ y $A = \\pi r^2$.',
        solution: function (v) { var A = Math.PI * Math.pow(v.r / 100, 2); return '$$\\theta = 90^\\circ - ' + v.al + '^\\circ = ' + (90 - v.al) + '^\\circ,\\qquad \\tau = NIAB\\sin\\theta = (' + v.N + ')(' + v.I + ')(' + fx(A * 1e4, 3) + '\\times 10^{-4})(' + fx(v.B, 1) + ')\\sin ' + (90 - v.al) + '^\\circ = ' + fx(v.N * v.I * A * v.B * Math.cos(v.al * RAD) * 1000, 3) + '\\ \\text{mN·m}$$'; }
      },
      {
        id: 'f3-s05-momento', title: 'Momento dipolar',
        vars: { N: [10, 200, 10], I: [0.1, 2, 0.1], r: [1, 10, 1] },
        prompt: function (v) {
          return '<p>Una bobina circular de $' + v.r + '\\ \\text{cm}$ de radio tiene ' + v.N + ' vueltas y lleva $' + fx(v.I, 1) + '\\ \\text{A}$. ¿Cuánto vale su momento dipolar magnético, en A·m²?</p>';
        },
        check: 'numeric', unit: 'A·m²',
        answer: function (v) { return v.N * v.I * Math.PI * Math.pow(v.r / 100, 2); },
        mistakes: { cm2: function (v) { return v.N * v.I * Math.PI * v.r * v.r; }, circ: function (v) { return v.N * v.I * 2 * Math.PI * v.r / 100; } },
        feedback: [{ when: 'cm2', say: 'Pasa el radio a metros antes de elevarlo al cuadrado.' }, { when: 'circ', say: 'Usaste el perímetro; el momento lleva el área $\\pi r^2$.' }],
        oracle: { lab: 'call', mod: 'loop', fn: 'moment', args: function (v) { return [v.N, v.I, Math.PI * Math.pow(v.r / 100, 2)]; } },
        hint: '$\\mu = NIA$ con $A = \\pi r^2$ en m².',
        solution: function (v) { return '$$\\mu = NI\\pi r^2 = (' + v.N + ')(' + fx(v.I, 1) + ')\\pi(' + fx(v.r / 100, 2) + ')^2 = ' + fx(v.N * v.I * Math.PI * Math.pow(v.r / 100, 2), 5) + '\\ \\text{A·m}^2$$'; }
      },
      {
        id: 'f3-s05-trabajo', title: 'Trabajo para girar una espira',
        vars: { mu: [0.05, 0.5, 0.05], B: [0.1, 1, 0.1], t2: [30, 180, 30] },
        prompt: function (v) {
          return '<p>Una espira con $\\mu = ' + fx(v.mu, 2) + '\\ \\text{A·m}^2$ está alineada con un campo de $' + fx(v.B, 1) + '\\ \\text{T}$ ($\\theta = 0^\\circ$). ¿Cuánto trabajo hay que hacer para girarla hasta $\\theta = ' + v.t2 + '^\\circ$, en mJ?</p>';
        },
        check: 'numeric', unit: 'mJ',
        answer: function (v) { return v.mu * v.B * (1 - Math.cos(v.t2 * RAD)) * 1000; },
        mistakes: { sin: function (v) { return v.mu * v.B * Math.sin(v.t2 * RAD) * 1000; }, noOne: function (v) { return Math.abs(v.mu * v.B * Math.cos(v.t2 * RAD)) * 1000; } },
        feedback: [{ when: 'sin', say: 'El seno es del torque. El trabajo es el cambio de $U = -\\mu B\\cos\\theta$.' }, { when: 'noOne', say: 'Es un cambio de energía: $U_2 - U_1 = \\mu B(1 - \\cos\\theta_2)$.' }],
        where: function (v) { return v.t2 !== 90; },
        oracle: { lab: 'call', mod: 'loop', fn: 'workField', args: function (v) { return [1, 1, v.mu * 1000, v.B, v.t2, 0]; } },
        hint: '$W = U_2 - U_1$ con $U = -\\mu B\\cos\\theta$.',
        solution: function (v) { return '$$W = U_2 - U_1 = -\\mu B\\cos ' + v.t2 + '^\\circ - (-\\mu B) = \\mu B(1 - \\cos ' + v.t2 + '^\\circ) = ' + fx(v.mu * v.B * (1 - Math.cos(v.t2 * RAD)) * 1000, 2) + '\\ \\text{mJ}$$'; }
      },
      {
        id: 'f3-s05-motor', title: 'Torque promedio de un motor',
        vars: { N: [50, 300, 50], I: [0.5, 3, 0.5], A: [5, 30, 5], B: [0.2, 1, 0.1] },
        prompt: function (v) {
          return '<p>Un motor de cd tiene una bobina de ' + v.N + ' vueltas y $' + v.A + '\\ \\text{cm}^2$ que lleva $' + fx(v.I, 1) + '\\ \\text{A}$ en un campo de $' + fx(v.B, 1) + '\\ \\text{T}$. ¿Cuál es su torque promedio en una vuelta, en mN·m?</p>';
        },
        check: 'numeric', unit: 'mN·m',
        answer: function (v) { return 2 / Math.PI * v.N * v.I * v.A * 1e-4 * v.B * 1000; },
        mistakes: { max: function (v) { return v.N * v.I * v.A * 1e-4 * v.B * 1000; }, half: function (v) { return 0.5 * v.N * v.I * v.A * 1e-4 * v.B * 1000; } },
        feedback: [{ when: 'max', say: 'Ese es el torque máximo; el promedio de $|\\sin\\theta|$ es $2/\\pi$.' }, { when: 'half', say: 'El promedio de $|\\sin\\theta|$ es $2/\\pi \\approx 0.64$, no $1/2$.' }],
        oracle: { lab: 'call', mod: 'loop', fn: 'motorAverage', args: function (v) { return [v.N, v.I, v.A * 1e-4, v.B * 1000]; } },
        hint: '$\\bar\\tau = \\tfrac{2}{\\pi}NIAB$.',
        solution: function (v) { return '$$\\bar\\tau = \\frac{2}{\\pi}NIAB = \\frac{2}{\\pi}(' + v.N + ')(' + fx(v.I, 1) + ')(' + v.A + '\\times 10^{-4})(' + fx(v.B, 1) + ') = ' + fx(2 / Math.PI * v.N * v.I * v.A * 1e-4 * v.B * 1000, 2) + '\\ \\text{mN·m}$$'; }
      },
      {
        id: 'f3-s05-equilibrio', title: 'Concepto: ¿dónde se detiene?',
        vars: { k: [0, 2, 1] },
        prompt: function (v) { return '<p>' + ['Una espira con corriente puede girar libremente en un campo uniforme. ¿En qué posición queda en equilibrio estable?', 'Una brújula y una espira con corriente están en el mismo campo uniforme. ¿Cómo quedan en equilibrio estable?', 'Una espira con corriente está con su $\\vec\\mu$ exactamente opuesto a $\\vec B$. ¿Qué tipo de equilibrio es?'][v.k] + '</p>'; },
        check: 'choice',
        options: function (v) {
          if (v.k === 2) return [{ text: 'Inestable: cualquier empujón la hace girar hacia $\\theta = 0^\\circ$', correct: true }, { text: 'Estable', say: 'La energía es máxima en $180^\\circ$.' }, { text: 'No hay equilibrio', say: 'El torque es cero ahí, pero el equilibrio es inestable.' }];
          if (v.k === 1) return [{ text: 'La aguja y $\\vec\\mu$ apuntan como $\\vec B$', correct: true }, { text: 'La aguja apunta como $\\vec B$ y $\\vec\\mu$ al revés', say: 'La espira se porta como un imán: también se alinea.' }, { text: 'Las dos quedan perpendiculares a $\\vec B$', say: 'Ahí el torque es máximo.' }];
          return [{ text: 'Con su normal ($\\vec\\mu$) alineada con $\\vec B$', correct: true }, { text: 'Con su plano paralelo a $\\vec B$', say: 'Ahí el torque es máximo.' }, { text: 'Con $\\vec\\mu$ opuesto a $\\vec B$', say: 'Es equilibrio, pero inestable.' }];
        },
        answer: function (v) { return ['Con su normal ($\\vec\\mu$) alineada con $\\vec B$', 'La aguja y $\\vec\\mu$ apuntan como $\\vec B$', 'Inestable: cualquier empujón la hace girar hacia $\\theta = 0^\\circ$'][v.k]; },
        hint: 'Piensa en $U = -\\mu B\\cos\\theta$: ¿dónde es mínima?',
        solution: function () { return '$U = -\\mu B\\cos\\theta$ es mínima con $\\theta = 0^\\circ$: el equilibrio estable es con $\\vec\\mu$ alineado con $\\vec B$, igual que una brújula. En $180^\\circ$ la energía es máxima: equilibrio inestable.'; }
      }
    ],

    quiz: { tags: ['f3.S05'], count: 8 },

    errors: [
      'Medir $\\theta$ desde el plano de la espira en lugar de desde la normal.',
      'Olvidar las $N$ vueltas en el momento dipolar.',
      'Dejar el área en cm²: $1\\ \\text{cm}^2 = 10^{-4}\\ \\text{m}^2$.',
      'Usar el diámetro como radio en $A = \\pi r^2$.',
      'Confundir el torque ($\\sin\\theta$) con la energía ($-\\cos\\theta$).',
      'Creer que la espira se traslada en un campo uniforme: solo gira.',
      'Pensar que $\\theta = 180^\\circ$ es un equilibrio estable.'
    ],

    teacher: {
      plan: [
        'Recuerda que la fuerza neta sobre una espira cerrada es cero y pregunta si entonces no pasa nada.',
        'Explainer de las cuatro fuerzas para llegar a $\\tau = NIAB\\sin\\theta$.',
        'Define $\\vec\\mu$ y conecta con la brújula de la sesión 1: una espira es un imán.',
        'Energía $U = -\\vec\\mu\\cdot\\vec B$, equilibrio estable e inestable.',
        'Motor de cd con el conmutador; cierra con el lab en modo motor.'
      ],
      check: [
        'Que distingan el ángulo con la normal del ángulo con el plano.',
        'Que calculen el trabajo para girar una espira con $U_2 - U_1$.',
        'Que expliquen para qué sirve el conmutador.'
      ],
      note: 'Este es el último tema del bloque A. La espira como dipolo enlaza con el bloque B: allí la espira será también una fuente de campo.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §11.5 “Force and Torque on a Current Loop”. <a href="https://openstax.org/books/university-physics-volume-2/pages/11-5-force-and-torque-on-a-current-loop">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-04',
    next: 'sesion-06'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
