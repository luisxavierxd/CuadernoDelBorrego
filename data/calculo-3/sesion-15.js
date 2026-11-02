/* =====================================================================
   Cálculo 3 · S15 · Aplicaciones: masa–resorte–amortiguador y circuito RLC
   (libre, amortiguado, forzado y resonancia), con una guía corta de la
   transformada de Laplace y los sistemas de EDO para seguir estudiando
   (bloque C · No homogéneas y orden superior).
   Fuente: OpenStax, Calculus Volume 3, §7.3 “Applications”, CC BY-NC-SA 4.0;
   OpenStax, University Physics Volume 2, §14.6 “RLC Series Circuits” (CC BY-NC-SA 4.0);
   MIT OCW 18.03SC, Units II–IV (CC BY-NC-SA 4.0). Ejemplos y ejercicios propios.
   Se comprueban con LabMath.ode (lab ode-compare); los numéricos usan RK4.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }

  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 0.5)) return false;
      }
      return true;
    };
  }
  function rk(P, x) { return window.LabMath.ode.solveAt(window.math, P, x); }
  function bisect(f, lo, hi) {
    var up = f(hi) > f(lo);
    for (var i = 0; i < 100; i++) { var m = (lo + hi) / 2; if ((f(m) > 0) === up) hi = m; else lo = m; }
    return (lo + hi) / 2;
  }

  var P_FREE = {
    name: 'Libre amortiguado: mueve m, c y k', tex: "m\\,x'' + c\\,x' + k\\,x = 0,\\qquad x(0) = 1,\\ x'(0) = 0", iv: 't', dv: 'x', order: 2,
    rhs: '(-c*dy - k*y)/m', scene: 'roots', poly: ['m', 'c', 'k'], spring: true,
    params: {
      m: { value: 1, min: 0.5, max: 3, step: 0.1, label: 'Masa m', unit: 'kg' },
      c: { value: 2, min: 0, max: 12, step: 0.1, label: 'Amortiguamiento c', unit: 'kg/s' },
      k: { value: 10, min: 1, max: 20, step: 0.5, label: 'Constante del resorte k', unit: 'N/m' }
    },
    x0: 0, ics: [1, 0], domain: [0, 8], yRange: [-1.1, 1.1],
    solution: 'e^(-t)*(cos(3t) + sin(3t)/3)', solutionTex: 'e^{-t}\\left(\\cos 3t + \\tfrac{1}{3}\\sin 3t\\right)\\ \\ (m = 1,\\ c = 2,\\ k = 10)',
    hint: 'Con los valores de inicio, $r^2 + 2r + 10 = 0$ da $-1 \\pm 3i$. Mueve $c$ para ver los tres regímenes: el cuadro de abajo te dice cuál es.',
    wrong: [
      { src: 'e^(-t)*cos(3t)', tex: 'e^{-t}\\cos\\left(3t\\right)', key: 'ic' },
      { src: 'cos(3t)', tex: '\\cos\\left(3t\\right)', key: 'residual' },
      { src: 'e^(-t)*(cos(sqrt(10)*t) + sin(sqrt(10)*t)/3)', tex: 'e^{-t}\\left(\\cos\\left(\\sqrt{10}t\\right)+\\frac{1}{3}\\sin\\left(\\sqrt{10}t\\right)\\right)', key: 'residual' }
    ]
  };
  var P_FORCED = {
    name: 'Forzado: amplitud estacionaria con m, c, k, ω', tex: "m\\,x'' + c\\,x' + k\\,x = F_0\\cos\\omega t", kind: 'yp', iv: 't', dv: 'x', order: 2,
    rhs: '(-c*dy - k*y + F0*cos(w*t))/m', g: 'F0*cos(w*t)/m', alias: { omega: 'w' }, scene: 'roots', poly: ['m', 'c', 'k'], spring: true,
    params: {
      m: { value: 1, min: 0.5, max: 3, step: 0.1, label: 'Masa m', unit: 'kg' },
      c: { value: 0.4, min: 0.05, max: 4, step: 0.05, label: 'Amortiguamiento c', unit: 'kg/s' },
      k: { value: 4, min: 1, max: 20, step: 0.5, label: 'Constante del resorte k', unit: 'N/m' },
      w: { value: 1.5, min: 0.2, max: 5, step: 0.05, label: 'Frecuencia de la fuerza ω', unit: 'rad/s' },
      F0: { value: 1 }
    },
    domain: [0, 20], yRange: [-3, 3],
    solution: 'F0*((k - m*w^2)*cos(w*t) + c*w*sin(w*t))/((k - m*w^2)^2 + (c*w)^2)', solutionTex: 'x_p = \\dfrac{F_0\\left[(k - m\\omega^2)\\cos\\omega t + c\\,\\omega\\sin\\omega t\\right]}{(k - m\\omega^2)^2 + (c\\,\\omega)^2}',
    hint: 'Propón $A\\cos\\omega t + B\\sin\\omega t$ y escribe la respuesta con las letras $m$, $c$, $k$, $\\omega$ (escribe <code>w</code>) y $F_0$: así sigue valiendo al mover los deslizadores. Acerca $\\omega$ a $\\sqrt{k/m}$ y baja $c$: la amplitud crece.',
    wrong: [
      { src: 'F0*cos(w*t)/(k - m*w^2)', tex: '\\frac{F_0\\cos\\left(wt\\right)}{k-mw^2}', key: 'residual' },
      { src: 'F0*sin(w*t)/(c*w)', tex: '\\frac{F_0\\sin\\left(wt\\right)}{cw}', key: 'residual' },
      { src: 'F0*cos(w*t)/k', tex: '\\frac{F_0\\cos\\left(wt\\right)}{k}', key: 'residual' }
    ]
  };
  var P_RLC = {
    name: 'Circuito RLC que se carga', tex: "L\\,q'' + R\\,q' + \\frac{q}{C} = 10,\\quad L = 1,\\ R = 2,\\ C = 0.1,\\quad q(0) = 0,\\ i(0) = 0", iv: 't', dv: 'q', order: 2,
    rhs: '10 - 2dy - 10y', scene: 'roots', poly: [1, 2, 10], spring: true, x0: 0, ics: [0, 0], domain: [0, 6], yRange: [0, 1.6],
    solution: '1 - e^(-t)*(cos(3t) + sin(3t)/3)', solutionTex: '1 - e^{-t}\\left(\\cos 3t + \\tfrac{1}{3}\\sin 3t\\right)',
    hint: 'Es el resorte de arriba con fuerza constante: $q_p = C\\varepsilon = 1$ y el transitorio con $-1 \\pm 3i$.',
    wrong: [
      { src: '1 - e^(-t)*cos(3t)', tex: '1-e^{-t}\\cos\\left(3t\\right)', key: 'ic' },
      { src: '1 - cos(3t)', tex: '1-\\cos\\left(3t\\right)', key: 'residual' },
      { src: 'e^(-t)*(cos(3t) + sin(3t)/3)', tex: 'e^{-t}\\left(\\cos\\left(3t\\right)+\\frac{1}{3}\\sin\\left(3t\\right)\\right)', key: 'residual' }
    ]
  };
  var P_CRIT = {
    name: 'Amortiguamiento crítico', tex: "x'' + 4x' + 4x = 0,\\qquad x(0) = 1,\\ x'(0) = 0", iv: 't', dv: 'x', order: 2,
    rhs: '-4dy - 4y', scene: 'roots', poly: [1, 4, 4], spring: true, x0: 0, ics: [1, 0], domain: [0, 5], yRange: [-0.2, 1.1],
    solution: '(1 + 2t)e^(-2t)', solutionTex: '(1 + 2t)\\,e^{-2t}',
    hint: '$c^2 = 4mk$: raíz doble $-2$. Regresa a 0 lo más rápido posible sin oscilar.',
    wrong: [
      { src: 'e^(-2t)', tex: 'e^{-2t}', key: 'ic' },
      { src: '(1 + 2t)e^(2t)', tex: '\\left(1+2t\\right)e^{2t}', key: 'residual' },
      { src: '(1 - 2t)e^(-2t)', tex: '\\left(1-2t\\right)e^{-2t}', key: 'ic' }
    ]
  };
  var P_RES = {
    name: 'Resonancia sin fricción', tex: "x'' + 4x = 2\\cos 2t,\\qquad x(0) = 0,\\ x'(0) = 0", iv: 't', dv: 'x', order: 2,
    rhs: '-4y + 2cos(2t)', scene: 'roots', poly: [1, 0, 4], spring: true, x0: 0, ics: [0, 0], domain: [0, 15], yRange: [-8, 8],
    solution: '(t/2)*sin(2t)', solutionTex: '\\tfrac{t}{2}\\sin 2t',
    hint: 'La fuerza tiene la frecuencia natural: $x_p = t(A\\cos 2t + B\\sin 2t)$ (S13).',
    wrong: [
      { src: 'sin(2t)/2', tex: '\\frac{\\sin\\left(2t\\right)}{2}', key: 'residual' },
      { src: 't*sin(2t)', tex: 't\\sin\\left(2t\\right)', key: 'residual' },
      { src: '(t/2)*cos(2t)', tex: '\\frac{t}{2}\\cos\\left(2t\\right)', key: 'residual' }
    ]
  };
  // Ejemplo forzado: m = 1, c = 0.4, k = 4, F0 = 1, ω = 1.5 → amplitud estacionaria.
  var fz = { m: 1, c: 0.4, k: 4, F0: 1, w: 1.5 };
  fz.amp = fz.F0 / Math.sqrt(Math.pow(fz.k - fz.m * fz.w * fz.w, 2) + Math.pow(fz.c * fz.w, 2));

  var data = window.SESSION_DATA = {
    slug: 'sesion-15', number: '15', group: 'C · No homogéneas y orden superior',
    title: 'Aplicaciones: masa–resorte–amortiguador y circuito RLC (libre, amortiguado, forzado y resonancia)', temario: [],
    minutes: 150,
    quote: 'Un resorte con fricción y un circuito RLC cumplen la misma ecuación. Lo que aprendiste de raíces y de y_p es, literalmente, cómo vibran las cosas.',
    badges: [
      'Plantear $mx\'\' + cx\' + kx = F(t)$ para un resorte y $Lq\'\' + Rq\' + q/C = E(t)$ para un circuito.',
      'Clasificar el movimiento libre: sobreamortiguado, crítico, subamortiguado o sin amortiguamiento.',
      'Calcular la respuesta forzada y su amplitud, y reconocer la resonancia.',
      'Saber hacia dónde sigue el tema: transformada de Laplace y sistemas de EDO.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Todo el bloque C en un solo modelo: la homogénea da el movimiento libre (las raíces dicen si oscila o no) y la $y_p$ da la respuesta a la fuerza externa.',
        recall: [
          'Los <a href="../sesion-10/">tres casos de raíces</a> (S10) y la <a href="../sesion-13/">resonancia</a> (S13).',
          'La ley de Hooke $F = -kx$ y la segunda ley de Newton.',
          'El <a href="../../../fisica-2/sesiones/sesion-15/">circuito RC</a> (Física 2, S15) y el <a href="../../../fisica-3/sesiones/sesion-14/">RL</a> (Física 3, S14); también el <a href="../sesion-08/">modelado de S08</a>.'
        ],
        why: 'Suspensiones de coches, edificios en un sismo, bocinas, sintonizadores de radio, marcapasos: todo lo que vibra o se sintoniza es este modelo.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'La suspensión de un coche es un resorte (absorbe el golpe) más un amortiguador (frena el rebote). Con amortiguadores gastados, el coche rebota varias veces después de un tope: subamortiguado. Con amortiguadores muy duros, se siente rígido y tarda en regresar: sobreamortiguado. Los ingenieros buscan algo cerca del punto crítico.',
          'Si además el camino tiene ondulaciones a cierto ritmo, eso es una fuerza externa. Si ese ritmo coincide con el del resorte, el coche empieza a brincar cada vez más: resonancia.'
        ]
      },
      {
        type: 'concept', heading: 'El modelo', short: 'Modelo',
        body: [
          'Una masa $m$ en un resorte de constante $k$, con un amortiguador de constante $c$ y una fuerza externa $F(t)$: Newton da $$m\\,x\'\' + c\\,x\' + k\\,x = F(t)$$ con $x$ medida desde el equilibrio. El resorte jala con $-kx$ y el amortiguador frena con $-cx\'$.',
          'Un circuito RLC en serie con fuente $E(t)$: Kirchhoff da $$L\\,q\'\' + R\\,q\' + \\frac{q}{C} = E(t)$$ Es la misma ecuación con $m \\leftrightarrow L$, $c \\leftrightarrow R$, $k \\leftrightarrow 1/C$ y $F \\leftrightarrow E$.'
        ],
        diagram: 'c3s15-spring',
        caption: 'El sistema mecánico y su análogo eléctrico. Todo lo que sale de uno vale para el otro.'
      },
      {
        type: 'concept', heading: 'Movimiento libre: los cuatro regímenes', short: 'Regímenes',
        diagram: 'c3s15-regimes', caption: 'Todas salen de x = 1 en reposo; solo cambia el amortiguamiento c.',
        body: [
          'Con $F = 0$, el característico es $mr^2 + cr + k = 0$. Según el discriminante $c^2 - 4mk$:'
        ],
        list: [
          '<strong>Sin amortiguamiento</strong> ($c = 0$): $x = A\\cos\\omega_0t + B\\sin\\omega_0t$ con $\\omega_0 = \\sqrt{k/m}$, la <strong>frecuencia natural</strong>. Oscila para siempre.',
          '<strong>Subamortiguado</strong> ($c^2 < 4mk$): oscila con amplitud que decae, $e^{-ct/2m}(\\dots\\cos\\beta t + \\dots\\sin\\beta t)$.',
          '<strong>Crítico</strong> ($c^2 = 4mk$): raíz doble; regresa lo más rápido posible sin oscilar.',
          '<strong>Sobreamortiguado</strong> ($c^2 > 4mk$): dos exponenciales negativas; regresa lento, sin oscilar.'
        ]
      },
      {
        type: 'example', heading: 'Un resorte subamortiguado',
        problem: '<p>Una masa de 1 kg cuelga de un resorte con $k = 10$ N/m y amortiguamiento $c = 2$ kg/s. Se suelta desde $x = 1$ m en reposo. Encuentra $x(t)$.</p>',
        steps: [
          { text: 'Característico: $r^2 + 2r + 10 = 0$, $r = -1 \\pm 3i$. Como $c^2 = 4 < 40 = 4mk$, es subamortiguado.', math: 'x = e^{-t}(c_1\\cos 3t + c_2\\sin 3t)' },
          { text: '$x(0) = c_1 = 1$; $x\'(0) = -c_1 + 3c_2 = 0$, así que $c_2 = \\frac{1}{3}$.', math: 'x = e^{-t}\\left(\\cos 3t + \\tfrac{1}{3}\\sin 3t\\right)' }
        ],
        answer: 'Oscila con frecuencia $3$ rad/s (un poco menos que $\\omega_0 = \\sqrt{10} \\approx 3.16$) y se apaga como $e^{-t}$. En el lab, sube $c$ para verla pasar a crítico y sobreamortiguado.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_FREE, 'e^(-t)*(cos(3t) + sin(3t)/3)'], value: 1 }
      },
      {
        type: 'concept', heading: 'Movimiento forzado y resonancia', short: 'Forzado',
        body: [
          'Con $F = F_0\\cos\\omega t$ y $c > 0$, la solución es transitorio (la homogénea, que se apaga) más el <strong>estado estacionario</strong> $x_p = A\\cos\\omega t + B\\sin\\omega t$, que oscila al ritmo de la fuerza. Su amplitud es $$|x_p| = \\frac{F_0}{\\sqrt{(k - m\\omega^2)^2 + (c\\,\\omega)^2}}$$',
          'Es máxima cerca de $\\omega_0 = \\sqrt{k/m}$, y el pico es más alto entre menos amortiguamiento. Con $c = 0$ y $\\omega = \\omega_0$ no hay estado estacionario: la respuesta crece como $t\\sin\\omega_0t$ (resonancia pura, S13).'
        ]
      },
      {
        type: 'explainer', heading: 'La curva de resonancia', short: 'Curva de resonancia',
        title: 'Amplitud estacionaria contra $\\omega$ ($m = 1$, $k = 4$, $F_0 = 1$)',
        intro: 'Cada curva es un amortiguamiento distinto.',
        diagram: 'c3s15-amplitude',
        steps: [
          { text: 'Con mucho amortiguamiento ($c = 2$) casi no hay pico: el sistema responde parecido a cualquier frecuencia.', state: { c: 2 } },
          { text: 'Con $c = 0.8$ ya se nota un máximo cerca de $\\omega_0 = 2$.', state: { c: 0.8 } },
          { text: 'Con $c = 0.3$ el pico es alto y angosto: una fuerza pequeña en la frecuencia justa produce oscilaciones grandes. Así funciona un sintonizador y así se cae un puente mal diseñado.', state: { c: 0.3 } }
        ]
      },
      {
        type: 'example', heading: 'Amplitud del estado estacionario',
        problem: '<p>Con $m = 1$, $c = 0.4$, $k = 4$ y $F = \\cos 1.5t$, ¿qué amplitud tiene el estado estacionario?</p>',
        steps: [
          { text: 'Sustituye en la fórmula.', math: '|x_p| = \\frac{1}{\\sqrt{(4 - 2.25)^2 + (0.4\\cdot 1.5)^2}} = \\frac{1}{\\sqrt{3.0625 + 0.36}} \\approx ' + fx(fz.amp, 3) }
        ],
        answer: 'Unos ' + fx(fz.amp, 3) + ' m. Con $\\omega = 2$ (resonancia) sería $1/(0.4\\cdot 2) = 1.25$ m, más del doble.',
        verify: { lab: 'call', mod: 'ode', fn: 'isParticular', math: true, args: [P_FORCED, 'F0*((k - m*w^2)*cos(w*t) + c*w*sin(w*t))/((k - m*w^2)^2 + (c*w)^2)'], value: 1 }
      },
      {
        type: 'example', heading: 'Un RLC que se carga',
        diagram: 'c3s15-rlc',
        problem: '<p>Un RLC tiene $L = 1$ H, $R = 2$ Ω, $C = 0.1$ F y una batería de 10 V. Empieza descargado y sin corriente. Encuentra $q(t)$ y $q(1)$.</p>',
        steps: [
          { text: 'Ecuación: $q\'\' + 2q\' + 10q = 10$. Particular constante: $10q_p = 10$, $q_p = 1$ C ($= C\\varepsilon$).', math: 'q = 1 + e^{-t}(c_1\\cos 3t + c_2\\sin 3t)' },
          { text: '$q(0) = 0$ da $c_1 = -1$; $i(0) = q\'(0) = 0$ da $-c_1 + 3c_2 = 0$, $c_2 = -\\frac{1}{3}$.', math: 'q = 1 - e^{-t}\\left(\\cos 3t + \\tfrac{1}{3}\\sin 3t\\right)' },
          { text: 'Evalúa.', math: 'q(1) \\approx ' + fx(1 - Math.exp(-1) * (Math.cos(3) + Math.sin(3) / 3), 3) + '\\ \\text{C}' }
        ],
        answer: 'La carga oscila alrededor de $C\\varepsilon = 1$ C antes de estabilizarse (a diferencia del RC, que sube sin pasarse).',
        verify: { lab: 'call', mod: 'ode', fn: 'solveAt', math: true, args: [P_RLC, 1], value: 1 - Math.exp(-1) * (Math.cos(3) + Math.sin(3) / 3) }
      },
      {
        type: 'concept', heading: 'Para seguir: la transformada de Laplace', short: 'Guía: Laplace',
        body: [
          'Este curso cierra aquí, pero hay dos herramientas que verás después. La primera es la <strong>transformada de Laplace</strong>: $$\\mathcal{L}\\{f\\}(s) = \\int_0^\\infty e^{-st}f(t)\\,dt$$ Convierte derivadas en multiplicaciones: $\\mathcal{L}\\{y\'\\} = sY - y(0)$ y $\\mathcal{L}\\{y\'\'\\} = s^2Y - sy(0) - y\'(0)$.',
          'Así, un PVI lineal con coeficientes constantes se vuelve una ecuación algebraica en $Y(s)$, que ya trae las condiciones iniciales. Se despeja $Y$, se separa en fracciones parciales (<a href="../../../calculo-1/sesiones/sesion-13/">Cálculo 1, S13</a>) y se regresa con una tabla. Brilla cuando la fuerza se prende y se apaga (escalones) o es un golpe instantáneo (impulso).',
          'Ejemplo: en $y\'\' + y = 0$, $y(0) = 1$, $y\'(0) = 0$, la transformada da $s^2Y - s + Y = 0$, así que $Y = \\frac{s}{s^2 + 1}$, que en la tabla es $\\cos t$. Es la misma respuesta de S10, sin buscar raíces ni constantes.'
        ]
      },
      {
        type: 'concept', heading: 'Para seguir: sistemas de EDO', short: 'Guía: sistemas',
        body: [
          'La segunda son los <strong>sistemas</strong>: varias funciones que dependen unas de otras, como dos masas unidas por resortes, dos tanques conectados o depredador y presa. Se escriben como $\\mathbf{x}\' = A\\mathbf{x}$, con $A$ una matriz.',
          'Una ecuación de orden 2 es un sistema de dos de primer orden: con $x_1 = x$ y $x_2 = x\'$, el resorte queda $x_1\' = x_2$, $x_2\' = -\\frac{k}{m}x_1 - \\frac{c}{m}x_2$. Las raíces del característico de esta sesión son los <strong>valores propios</strong> de esa matriz: lo que aprendiste se generaliza con álgebra lineal.',
          'Ninguno de los dos temas trae lab ni ejercicios aquí: son una guía para que reconozcas los nombres cuando lleguen.'
        ]
      },
      {
        type: 'example', heading: 'Un sistema que ya sabes resolver',
        diagram: 'c3s15-phase',
        problem: '<p>Resuelve el sistema $x\' = y$, $y\' = -4x$ con $x(0) = 1$, $y(0) = 0$.</p>',
        steps: [
          { text: 'Deriva la primera y sustituye la segunda: $x\'\' = y\' = -4x$.', math: "x'' + 4x = 0,\\qquad x(0) = 1,\\ x'(0) = y(0) = 0" },
          { text: 'Es S10: $x = \\cos 2t$, y entonces $y = x\' = -2\\sin 2t$.' }
        ],
        answer: '$x = \\cos 2t$, $y = -2\\sin 2t$. El punto $(x, y)$ recorre una elipse: así se ve una oscilación en el «plano fase».',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [{ iv: 't', order: 2, rhs: '-4y', x0: 0, ics: [1, 0], domain: [0, 6] }, 'cos(2t)'], value: 1 }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué la frecuencia de oscilación es menor que $\\omega_0$?', a: 'Con amortiguamiento, $\\beta = \\sqrt{\\omega_0^2 - (c/2m)^2} < \\omega_0$: la fricción hace que oscile un poco más lento.' },
          { q: '¿Qué pasa con el transitorio en el forzado?', a: 'Se apaga exponencialmente (si $c > 0$). Después de un rato solo queda el estado estacionario, que no depende de las condiciones iniciales.' },
          { q: '¿Por qué en el RLC la carga «se pasa» de $C\\varepsilon$?', a: 'Porque la bobina tiene inercia (como la masa): la corriente no se detiene de golpe. En el RC no hay bobina y la carga sube sin pasarse.' },
          { q: '¿Cuándo uso Laplace en lugar de lo de este curso?', a: 'Con fuerzas que se prenden y apagan, impulsos o sistemas grandes. Para los problemas de este curso, los métodos de S10 a S14 dan lo mismo.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          '$mx\'\' + cx\' + kx = F(t)$ y $Lq\'\' + Rq\' + q/C = E(t)$ son la misma ecuación.',
          '$c^2 - 4mk$ decide el régimen: sub, crítico o sobreamortiguado; con $c = 0$ oscila con $\\omega_0 = \\sqrt{k/m}$.',
          'Forzado: transitorio + estado estacionario; la amplitud tiene un pico cerca de $\\omega_0$ (resonancia).',
          'Para seguir: la transformada de Laplace y los sistemas $\\mathbf{x}\' = A\\mathbf{x}$.'
        ]
      }
    ],

    lab: {
      type: 'ode-compare', title: 'Régimen en vivo',
      intro: 'En el primer problema mueve $m$, $c$ y $k$: las raíces viajan en el plano complejo y el cuadro de abajo te dice el régimen. En el segundo, escribe la amplitud estacionaria con letras y acerca $\\omega$ a la frecuencia natural para ver la resonancia. Los demás: un RLC, el caso crítico y la resonancia sin fricción.',
      cfg: { start: 0, problems: [P_FREE, P_FORCED, P_RLC, P_CRIT, P_RES] }
    },

    formulas: [
      { label: 'Resorte', tex: "m\\,x'' + c\\,x' + k\\,x = F(t)" },
      { label: 'RLC', tex: "L\\,q'' + R\\,q' + \\frac{q}{C} = E(t)" },
      { label: 'Frecuencia natural', tex: '\\omega_0 = \\sqrt{k/m} = 1/\\sqrt{LC}' },
      { label: 'Crítico', tex: 'c^2 = 4mk' },
      { label: 'Amplitud forzada', tex: '|x_p| = \\frac{F_0}{\\sqrt{(k - m\\omega^2)^2 + (c\\omega)^2}}' }
    ],

    exercises: [
      {
        id: 'c3-s15-regimen', title: '¿Qué régimen?',
        vars: { m: [1, 4, 1], k: [2, 16, 2], c: [0, 10, 1] },
        prompt: function (v) { return '<p>Un resorte tiene $m = ' + v.m + '$ kg, $k = ' + v.k + '$ N/m y $c = ' + v.c + '$ kg/s. ¿Cómo se mueve si lo sueltas sin fuerza externa?</p>'; },
        check: 'choice',
        options: function (v) {
          var d = v.c * v.c - 4 * v.m * v.k;
          var right = v.c === 0 ? 0 : d < 0 ? 1 : d === 0 ? 2 : 3;
          var txt = ['Oscila para siempre (sin amortiguamiento)', 'Subamortiguado: oscila y se apaga', 'Crítico: regresa sin oscilar, lo más rápido posible', 'Sobreamortiguado: regresa lento, sin oscilar'];
          return txt.map(function (t, i) { return i === right ? { text: t, correct: true } : { text: t, say: 'Compara $c^2 = ' + (v.c * v.c) + '$ con $4mk = ' + (4 * v.m * v.k) + '$.' }; });
        },
        answer: function (v) { var d = v.c * v.c - 4 * v.m * v.k; return ['Oscila para siempre (sin amortiguamiento)', 'Subamortiguado: oscila y se apaga', 'Crítico: regresa sin oscilar, lo más rápido posible', 'Sobreamortiguado: regresa lento, sin oscilar'][v.c === 0 ? 0 : d < 0 ? 1 : d === 0 ? 2 : 3]; },
        hint: 'El discriminante de $mr^2 + cr + k$ es $c^2 - 4mk$.',
        solution: function (v) { var d = v.c * v.c - 4 * v.m * v.k; return '$c^2 - 4mk = ' + (v.c * v.c) + ' - ' + (4 * v.m * v.k) + ' = ' + d + '$: ' + (v.c === 0 ? 'sin amortiguamiento.' : d < 0 ? 'subamortiguado.' : d === 0 ? 'crítico.' : 'sobreamortiguado.'); }
      },
      {
        id: 'c3-s15-critico', title: 'Amortiguamiento crítico',
        vars: { m: [0.5, 4, 0.5], k: [2, 50, 2] },
        prompt: function (v) { return '<p>Para una masa de ' + v.m + ' kg en un resorte con $k = ' + v.k + '$ N/m, ¿qué amortiguamiento $c$ da el caso crítico?</p>'; },
        check: 'numeric', unit: 'kg/s',
        answer: function (v) { return 2 * Math.sqrt(v.m * v.k); },
        mistakes: { noTwo: function (v) { return Math.sqrt(v.m * v.k); }, four: function (v) { return 4 * v.m * v.k; } },
        feedback: [
          { when: 'noTwo', say: '$c^2 = 4mk$ da $c = 2\\sqrt{mk}$: falta el 2.' },
          { when: 'four', say: 'Ese es $c^2$. Saca raíz.' }
        ],
        oracle: { lab: 'value', value: function (v) { return bisect(function (c) { return c * c - 4 * v.m * v.k; }, 0, 100); } },
        hint: 'Crítico: discriminante cero.',
        solution: function (v) { return '$$c = 2\\sqrt{mk} = 2\\sqrt{' + fx(v.m * v.k) + '} \\approx ' + fx(2 * Math.sqrt(v.m * v.k)) + '\\ \\text{kg/s}$$'; }
      },
      {
        id: 'c3-s15-amplitud', title: 'Amplitud estacionaria',
        vars: { m: [1, 3, 1], k: [4, 20, 2], c: [0.2, 2, 0.2], w: [0.5, 4, 0.5], F: [1, 10, 1] },
        prompt: function (v) { return '<p>Con $m = ' + v.m + '$ kg, $c = ' + v.c + '$ kg/s, $k = ' + v.k + '$ N/m y $F(t) = ' + v.F + '\\cos(' + v.w + 't)$ N, ¿qué amplitud tiene el estado estacionario?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return v.F / Math.sqrt(Math.pow(v.k - v.m * v.w * v.w, 2) + Math.pow(v.c * v.w, 2)); },
        mistakes: {
          noDamp: function (v) { return v.F / Math.abs(v.k - v.m * v.w * v.w); },
          noMass: function (v) { return v.F / Math.sqrt(Math.pow(v.k - v.w * v.w, 2) + Math.pow(v.c * v.w, 2)); }
        },
        where: function (v) { return Math.abs(v.k - v.m * v.w * v.w) > 0.5 && v.m !== 1; },
        feedback: [
          { when: 'noDamp', say: 'Falta el término de amortiguamiento $(c\\omega)^2$ en la raíz.' },
          { when: 'noMass', say: 'Es $k - m\\omega^2$: la masa multiplica a $\\omega^2$.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          // Amplitud = máximo del estado estacionario en un periodo, con A y B del sistema 2×2 resuelto aparte.
          var a = v.k - v.m * v.w * v.w, b = v.c * v.w, det = a * a + b * b, A = v.F * a / det, B = v.F * b / det;
          return Math.hypot(A, B);
        } },
        hint: '$|x_p| = F_0/\\sqrt{(k - m\\omega^2)^2 + (c\\omega)^2}$.',
        solution: function (v) { var A = v.F / Math.sqrt(Math.pow(v.k - v.m * v.w * v.w, 2) + Math.pow(v.c * v.w, 2)); return '$$|x_p| = \\frac{' + v.F + '}{\\sqrt{(' + v.k + ' - ' + fx(v.m * v.w * v.w) + ')^2 + (' + fx(v.c * v.w) + ')^2}} \\approx ' + fx(A, 3) + '\\ \\text{m}$$'; }
      },
      {
        id: 'c3-s15-rlc', title: 'Frecuencia de un RLC',
        vars: { L: [0.5, 2, 0.5], R: [1, 4, 1], C: [0.01, 0.1, 0.01] },
        where: function (v) { return 1 / (v.L * v.C) > Math.pow(v.R / v.L, 2) * 1.2; },
        prompt: function (v) { return '<p>Un RLC en serie tiene $L = ' + v.L + '$ H, $R = ' + v.R + '$ Ω y $C = ' + v.C + '$ F. Sin fuente, la carga oscila amortiguada. ¿Con qué frecuencia angular $\\beta$ oscila (en rad/s)?</p>'; },
        check: 'numeric', unit: 'rad/s',
        answer: function (v) { return Math.sqrt(1 / (v.L * v.C) - Math.pow(v.R / (2 * v.L), 2)); },
        mistakes: {
          natural: function (v) { return 1 / Math.sqrt(v.L * v.C); },
          noHalf: function (v) { return Math.sqrt(1 / (v.L * v.C) - Math.pow(v.R / v.L, 2)); }
        },
        feedback: [
          { when: 'natural', say: 'Esa es la frecuencia natural $\\omega_0 = 1/\\sqrt{LC}$. Con resistencia, $\\beta = \\sqrt{\\omega_0^2 - (R/2L)^2}$.' },
          { when: 'noHalf', say: 'La parte real de las raíces es $-R/(2L)$: falta el 2.' }
        ],
        oracle: { lab: 'value', value: function (v) { var R = window.LabMath.ode.polyRoots([v.L, v.R, 1 / v.C]); return Math.abs(R[0][1]); } },
        hint: 'Característico: $Lr^2 + Rr + 1/C = 0$; $\\beta$ es la parte imaginaria de las raíces.',
        solution: function (v) { var b = Math.sqrt(1 / (v.L * v.C) - Math.pow(v.R / (2 * v.L), 2)); return '$$\\beta = \\sqrt{\\frac{1}{LC} - \\left(\\frac{R}{2L}\\right)^2} = \\sqrt{' + fx(1 / (v.L * v.C)) + ' - ' + fx(Math.pow(v.R / (2 * v.L), 2), 3) + '} \\approx ' + fx(b, 3) + '\\ \\text{rad/s}$$'; }
      },
      {
        id: 'c3-s15-posicion', title: 'Posición de un resorte',
        vars: { k: [5, 20, 1], x0: [1, 3, 1], t: [0.5, 3, 0.5] },
        prompt: function (v) { return '<p>Una masa de 1 kg en un resorte con $k = ' + v.k + '$ N/m y $c = 2$ kg/s se suelta desde $x = ' + v.x0 + '$ m en reposo. ¿Dónde está a los ' + v.t + ' s?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { var b = Math.sqrt(v.k - 1); return v.x0 * Math.exp(-v.t) * (Math.cos(b * v.t) + Math.sin(b * v.t) / b); },
        mistakes: {
          noSin: function (v) { var b = Math.sqrt(v.k - 1); return v.x0 * Math.exp(-v.t) * Math.cos(b * v.t); },
          omega0: function (v) { var b = Math.sqrt(v.k); return v.x0 * Math.exp(-v.t) * (Math.cos(b * v.t) + Math.sin(b * v.t) / b); }
        },
        where: function (v) { var b = Math.sqrt(v.k - 1), y = v.x0 * Math.exp(-v.t) * (Math.cos(b * v.t) + Math.sin(b * v.t) / b); return Math.abs(y) > 0.15; },
        feedback: [
          { when: 'noSin', say: 'Con $x\'(0) = 0$ también hay término en seno: $c_2 = c_1/\\beta$.' },
          { when: 'omega0', say: 'Con amortiguamiento la frecuencia es $\\beta = \\sqrt{k - 1}$, no $\\sqrt{k}$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return rk({ iv: 't', order: 2, rhs: '-2dy - ' + v.k + '*y', x0: 0, ics: [v.x0, 0], domain: [0, 3] }, v.t); } },
        hint: '$r^2 + 2r + k = 0$ da $-1 \\pm \\sqrt{k - 1}\\,i$.',
        solution: function (v) { var b = Math.sqrt(v.k - 1), y = v.x0 * Math.exp(-v.t) * (Math.cos(b * v.t) + Math.sin(b * v.t) / b); return '$$x = ' + v.x0 + 'e^{-t}\\left(\\cos\\beta t + \\tfrac{1}{\\beta}\\sin\\beta t\\right),\\ \\beta = \\sqrt{' + (v.k - 1) + '} \\;\\Rightarrow\\; x(' + v.t + ') \\approx ' + fx(y, 3) + '\\ \\text{m}$$'; }
      }
    ],

    quiz: { tags: ['c3.S15'], count: 8 },

    errors: [
      'Poner la fuerza del resorte o del amortiguador con el signo equivocado.',
      'Confundir $\\omega_0 = \\sqrt{k/m}$ con la frecuencia amortiguada $\\beta$.',
      'Olvidar $(c\\omega)^2$ en la amplitud forzada.',
      'Usar $c = \\sqrt{mk}$ en lugar de $2\\sqrt{mk}$ para el caso crítico.',
      'Mezclar la analogía: $k \\leftrightarrow 1/C$, no $C$.',
      'Aplicar las condiciones iniciales solo al estado estacionario.'
    ],

    teacher: {
      plan: [
        'La suspensión del coche: los cuatro regímenes.',
        'Modelo y analogía con el RLC en el pizarrón.',
        'Ejemplo subamortiguado y la curva de resonancia.',
        'Lab con los deslizadores: llevar el sistema de sub a crítico a sobreamortiguado, y buscar la resonancia.',
        'Cerrar con la guía de Laplace y sistemas como «lo que sigue».'
      ],
      check: [
        'Que clasifiquen el régimen sin resolver.',
        'Que expliquen por qué la amplitud crece cerca de $\\omega_0$.'
      ],
      note: 'Es la última sesión. La transformada de Laplace y los sistemas de EDO quedan como guía corta, sin lab, ejercicios ni banco; el péndulo no lineal y los métodos numéricos van en otros cursos.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §7.3 “Applications”. <a href="https://openstax.org/books/calculus-volume-3/pages/7-3-applications">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §14.6 “RLC Series Circuits with AC”. <a href="https://openstax.org/books/university-physics-volume-2/pages/15-4-rlc-series-circuits-with-ac">openstax.org</a> (CC BY-NC-SA 4.0).',
      'MIT OpenCourseWare. <em>18.03SC Differential Equations</em> (Fall 2011), Unit III (Laplace) y Unit IV (sistemas). <a href="https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/">ocw.mit.edu</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-14',
    next: null
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
