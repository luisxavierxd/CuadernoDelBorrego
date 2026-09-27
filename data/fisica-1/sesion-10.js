/* =====================================================================
   Física 1 · S10 · Resortes (ley de Hooke) y fricción (bloque C · Dinámica).
   Fuente: OpenStax, University Physics Volume 1, §5.6 y §6.2 (CC BY-NC-SA 4.0).
   g = 9.81 m/s². Las cuentas se comprueban contra LabMath.friction
   (lab spring-friction).
   ===================================================================== */
(function () {
  var g = 9.81, RAD = Math.PI / 180, DEG = 180 / Math.PI;
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }
  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 1)) return false;
      }
      return true;
    };
  }
  // Caja con fuerza inclinada: mode 'push' (hacia abajo) o 'pull' (hacia arriba).
  function box(m, F, th, mode, muk) {
    var N = m * g + (mode === 'push' ? 1 : -1) * F * Math.sin(th * RAD), f = muk * N;
    return { N: N, f: f, a: (F * Math.cos(th * RAD) - f) / m };
  }

  var e1 = { F0: 30, x0: 0.12, x: 0.2 }; e1.k = e1.F0 / e1.x0; e1.F = e1.k * e1.x;
  var es = { m: 2, k1: 200, k2: 300 };
  es.kS = es.k1 * es.k2 / (es.k1 + es.k2); es.kP = es.k1 + es.k2; es.xS = es.m * g / es.kS; es.xP = es.m * g / es.kP;
  var e2 = { m: 20, mus: 0.4, muk: 0.3, F1: 70, F2: 90 }; e2.N = e2.m * g; e2.fs = e2.mus * e2.N; e2.a2 = (e2.F2 - e2.muk * e2.N) / e2.m;
  var e3 = { m: 10, F: 80, th: 30, muk: 0.3 }; e3.push = box(e3.m, e3.F, e3.th, 'push', e3.muk); e3.pull = box(e3.m, e3.F, e3.th, 'pull', e3.muk);
  var e4 = { m: 10, mu: 0.5 }; e4.th = Math.atan(e4.mu) * DEG; e4.F = e4.mu * e4.m * g / Math.sqrt(1 + e4.mu * e4.mu); e4.F0 = e4.mu * e4.m * g;
  var e5 = { m: 2, k: 300, x: 0.1, mus: 0.4, muk: 0.3 }; e5.Fs = e5.k * e5.x; e5.fs = e5.mus * e5.m * g; e5.a = (e5.Fs - e5.muk * e5.m * g) / e5.m;

  var data = window.SESSION_DATA = {
    slug: 'sesion-10', number: '10', group: 'C · Dinámica',
    title: 'Resortes (ley de Hooke) y fricción', temario: [],
    minutes: 180,
    quote: 'La fricción depende de qué tan fuerte se aprietan las superficies, y eso es la normal, no el peso.',
    badges: [
      'Usar la ley de Hooke, $F = -kx$, y medir $k$ colgando una masa.',
      'Combinar resortes en serie y en paralelo.',
      'Distinguir fricción estática ($\\le \\mu_sN$) de cinética ($\\mu_kN$).',
      'Calcular la normal cuando empujas o jalas con ángulo.',
      'Decidir si un cuerpo se mueve y encontrar la fuerza mínima y el ángulo óptimo.'
    ],

    lesson: [
      {
        type: 'concept', heading: 'Resortes: la ley de Hooke', short: 'Ley de Hooke',
        body: [
          'Un resorte estirado o comprimido una distancia $x$ desde su largo natural ejerce una fuerza proporcional y opuesta: $$F = -kx$$ La constante $k$ (N/m) mide qué tan rígido es.',
          'El signo menos dice que la fuerza apunta hacia el largo natural: si lo estiras, jala de regreso; si lo comprimes, empuja hacia afuera.'
        ],
        diagram: 'hooke',
        caption: 'La fuerza del resorte crece en línea recta con la deformación.'
      },
      {
        type: 'example', heading: 'La constante de un resorte',
        problem: '<p>Un resorte se estira $' + e1.x0 + '\\ \\text{m}$ cuando se le cuelga un peso de $' + e1.F0 + '\\ \\text{N}$. ¿Cuánto vale $k$ y qué fuerza hace si se estira $' + e1.x + '\\ \\text{m}$?</p>',
        steps: [
          { text: 'En equilibrio, la fuerza del resorte iguala al peso.', math: 'k = \\frac{F}{x} = \\frac{' + e1.F0 + '}{' + e1.x0 + '} = ' + fx(e1.k) + '\\ \\text{N/m}' },
          { text: 'Con otra deformación.', math: 'F = kx = (' + fx(e1.k) + ')(' + e1.x + ') = ' + fx(e1.F) + '\\ \\text{N}' }
        ],
        answer: '$k = ' + fx(e1.k) + '\\ \\text{N/m}$ y $F = ' + fx(e1.F) + '\\ \\text{N}$.',
        verify: { lab: 'call', mod: 'friction', fn: 'hooke', args: [e1.k, e1.x], value: e1.F }
      },
      {
        type: 'explainer', heading: 'Colgar, en serie y en paralelo', short: 'Resortes combinados',
        title: 'Un resorte, dos resortes',
        intro: 'Colgar una masa es la forma más sencilla de medir $k$. Con dos resortes importa cómo los unes.',
        diagram: 'springs-explainer',
        steps: [
          { text: 'Sin carga, el resorte tiene su largo natural y no hace fuerza. La deformación $x$ siempre se mide desde ese largo.', state: { show: 'free' } },
          { text: 'Con una masa colgada en reposo, el resorte sostiene el peso: $kx = mg$. Midiendo $x$ se obtiene $k = mg/x$.', state: { show: 'single' } },
          { text: '<strong>En serie</strong> (uno abajo del otro), cada resorte sostiene todo el peso y las elongaciones se suman: $\\frac{1}{k} = \\frac{1}{k_1} + \\frac{1}{k_2}$. El arreglo es más blando que cada resorte.', state: { show: 'series' } },
          { text: '<strong>En paralelo</strong> (lado a lado, estirándose igual), se reparten el peso: $k = k_1 + k_2$. El arreglo es más rígido.', state: { show: 'parallel' } }
        ]
      },
      {
        type: 'example', heading: 'Dos resortes en serie y en paralelo',
        problem: '<p>Tienes dos resortes de $k_1 = ' + es.k1 + '\\ \\text{N/m}$ y $k_2 = ' + es.k2 + '\\ \\text{N/m}$ y una masa de $' + es.m + '\\ \\text{kg}$. ¿Cuánto se estira el arreglo si los pones en serie? ¿Y en paralelo?</p>',
        steps: [
          { text: 'En serie, la constante equivalente es menor que las dos.', math: 'k_s = \\frac{k_1k_2}{k_1 + k_2} = \\frac{(200)(300)}{500} = ' + fx(es.kS) + '\\ \\text{N/m} \\qquad x_s = \\frac{mg}{k_s} = ' + fx(es.xS, 4) + '\\ \\text{m}' },
          { text: 'Comprobación: cada uno se estira $mg/k_i$ y se suman: $0.0981 + 0.0654 = ' + fx(es.xS, 4) + '$ m.' },
          { text: 'En paralelo, las constantes se suman.', math: 'k_p = k_1 + k_2 = ' + es.kP + '\\ \\text{N/m} \\qquad x_p = \\frac{mg}{k_p} = ' + fx(es.xP, 4) + '\\ \\text{m}' },
          { text: 'El mismo par de resortes se estira unas cuatro veces más en serie que en paralelo.' }
        ],
        answer: 'En serie $x \\approx ' + fx(es.xS, 3) + '\\ \\text{m}$; en paralelo $x \\approx ' + fx(es.xP, 3) + '\\ \\text{m}$.',
        verify: { lab: 'call', mod: 'friction', fn: 'hang', args: [es.m, es.k1, es.k2, 'series'], values: { k: es.kS, x: es.xS } }
      },
      {
        type: 'concept', heading: 'Fricción estática y cinética', short: 'Fricción',
        body: [
          'Mientras la caja no se mueve, la fricción <strong>estática</strong> vale justo lo necesario para impedir el movimiento, hasta un máximo: $$f_s \\le \\mu_s N$$',
          'Cuando la caja desliza, la fricción <strong>cinética</strong> es constante: $$f_k = \\mu_k N$$ Casi siempre $\\mu_k < \\mu_s$: cuesta más arrancar que mantener el movimiento.',
          'Para decidir si se mueve, compara la fuerza que empuja con $\\mu_sN$. Si no la supera, la caja no se mueve y la fricción es igual a esa fuerza, no $\\mu_sN$.'
        ],
        diagram: 'friction-graph',
        caption: 'La fricción estática sigue a la fuerza aplicada hasta $\\mu_sN$; luego baja a $\\mu_kN$.'
      },
      {
        type: 'example', heading: '¿Se mueve o no?',
        problem: '<p>Una caja de $' + e2.m + '\\ \\text{kg}$ está en el piso ($\\mu_s = ' + e2.mus + '$, $\\mu_k = ' + e2.muk + '$). La empujas horizontalmente con $' + e2.F1 + '\\ \\text{N}$ y luego con $' + e2.F2 + '\\ \\text{N}$. ¿Qué pasa en cada caso?</p>',
        steps: [
          { text: 'Con fuerza horizontal, $N = mg$. La fricción estática máxima es:', math: '\\mu_s N = 0.4(20)(9.81) = ' + fx(e2.fs) + '\\ \\text{N}' },
          { text: 'Con $70$ N no la supera: no se mueve y la fricción vale $70$ N (no $78.48$).' },
          { text: 'Con $90$ N sí la supera: desliza, y ahora la fricción es cinética.', math: 'a = \\frac{F - \\mu_k N}{m} = \\frac{90 - 0.3(196.2)}{20} = ' + fx(e2.a2, 3) + '\\ \\text{m/s}^2' }
        ],
        answer: 'Con 70 N se queda quieta ($f_s = 70$ N); con 90 N acelera a $' + fx(e2.a2) + '\\ \\text{m/s}^2$.',
        verify: { lab: 'call', mod: 'friction', fn: 'analyze', args: [{ m: e2.m, F: e2.F2, th: 0, mode: 'horizontal', mus: e2.mus, muk: e2.muk }], values: { N: e2.N, a: e2.a2 } }
      },
      {
        type: 'explainer', heading: 'Empujar o jalar con ángulo', short: 'Fuerza con ángulo',
        title: 'La normal no siempre es mg',
        intro: 'Una fuerza inclinada tiene componente vertical, y esa componente cambia cuánto se aprieta la caja contra el piso.',
        diagram: 'angle-push-pull',
        steps: [
          { text: 'Jalando con una cuerda casi horizontal, la normal es casi $mg$.', state: { th: 5, mode: 'pull' } },
          { text: 'Si jalas hacia arriba con ángulo $\\theta$, parte de tu fuerza ayuda a levantar la caja: $N = mg - F\\sin\\theta$ y la fricción baja.', state: { th: 35, mode: 'pull' } },
          { text: 'Si empujas hacia abajo con ángulo $\\theta$, aprietas la caja contra el piso: $N = mg + F\\sin\\theta$ y la fricción sube.', state: { th: 35, mode: 'push' } },
          { text: 'En los dos casos solo $F\\cos\\theta$ empuja hacia adelante.', state: { th: 20, mode: 'push' } }
        ]
      },
      {
        type: 'example', heading: 'Empujar hacia abajo contra jalar hacia arriba',
        problem: '<p>Una caja de $' + e3.m + '\\ \\text{kg}$ ($\\mu_k = ' + e3.muk + '$) se mueve con una fuerza de $' + e3.F + '\\ \\text{N}$ a $' + e3.th + '^\\circ$ de la horizontal. Compara la normal y la aceleración si la <strong>empujas hacia abajo</strong> o si la <strong>jalas hacia arriba</strong>.</p>',
        steps: [
          { text: 'Empujando hacia abajo.', math: 'N = mg + F\\sin\\theta = 98.1 + 40 = ' + fx(e3.push.N) + '\\ \\text{N} \\qquad a = \\frac{F\\cos\\theta - \\mu_kN}{m} = ' + fx(e3.push.a, 3) + '\\ \\text{m/s}^2' },
          { text: 'Jalando hacia arriba.', math: 'N = mg - F\\sin\\theta = 98.1 - 40 = ' + fx(e3.pull.N) + '\\ \\text{N} \\qquad a = ' + fx(e3.pull.a, 3) + '\\ \\text{m/s}^2' },
          { text: 'Con la misma fuerza, jalar hacia arriba acelera más: aprieta menos la caja contra el piso. Si hubieras usado $N = mg$ en los dos, habrías obtenido lo mismo, y es falso.' }
        ],
        answer: 'Empujando: $N = ' + fx(e3.push.N) + '$ N y $a = ' + fx(e3.push.a) + '$ m/s². Jalando: $N = ' + fx(e3.pull.N) + '$ N y $a = ' + fx(e3.pull.a) + '$ m/s².',
        verify: { lab: 'call', mod: 'friction', fn: 'analyze', args: [{ m: e3.m, F: e3.F, th: e3.th, mode: 'push', mus: 0.4, muk: e3.muk }], values: { N: e3.push.N, a: e3.push.a } }
      },
      {
        type: 'example', heading: 'Fuerza mínima y ángulo óptimo',
        problem: '<p>Quieres arrancar una caja de $' + e4.m + '\\ \\text{kg}$ ($\\mu_s = ' + e4.mu + '$) jalando con una cuerda. ¿Con qué ángulo necesitas la menor fuerza y cuánto vale?</p>',
        steps: [
          { text: 'Para arrancar con ángulo $\\theta$: $F\\cos\\theta = \\mu_s(mg - F\\sin\\theta)$.', math: 'F(\\theta) = \\frac{\\mu_s mg}{\\cos\\theta + \\mu_s\\sin\\theta}' },
          { text: 'El denominador es máximo cuando su derivada es cero: $-\\sin\\theta + \\mu_s\\cos\\theta = 0$.', math: '\\tan\\theta = \\mu_s \\;\\Rightarrow\\; \\theta = \\arctan 0.5 = ' + fx(e4.th, 1) + '^\\circ' },
          { text: 'Sustituye.', math: 'F_{mín} = \\frac{\\mu_s mg}{\\sqrt{1 + \\mu_s^2}} = ' + fx(e4.F) + '\\ \\text{N}' },
          { text: 'Jalando horizontal harían falta $\\mu_s mg = ' + fx(e4.F0) + '$ N: el ángulo ahorra un 10 %.' }
        ],
        answer: '$\\theta = ' + fx(e4.th, 1) + '^\\circ$ y $F_{mín} \\approx ' + fx(e4.F, 1) + '\\ \\text{N}$.',
        verify: { lab: 'call', mod: 'friction', fn: 'minForce', args: [e4.m, e4.mu], value: e4.F }
      },
      {
        type: 'example', heading: 'Un resorte contra la fricción',
        problem: '<p>Un resorte de $k = ' + e5.k + '\\ \\text{N/m}$, comprimido $' + e5.x + '\\ \\text{m}$, empuja un bloque de $' + e5.m + '\\ \\text{kg}$ sobre una mesa ($\\mu_s = ' + e5.mus + '$, $\\mu_k = ' + e5.muk + '$). ¿Se mueve? Si sí, ¿con qué aceleración arranca?</p>',
        steps: [
          { text: 'Fuerza del resorte y fricción estática máxima.', math: 'kx = ' + fx(e5.Fs) + '\\ \\text{N} \\qquad \\mu_s mg = ' + fx(e5.fs) + '\\ \\text{N}' },
          { text: 'El resorte le gana: el bloque se mueve y la fricción pasa a ser cinética.', math: 'a = \\frac{kx - \\mu_k mg}{m} = \\frac{30 - 5.886}{2} = ' + fx(e5.a, 3) + '\\ \\text{m/s}^2' },
          { text: 'Conforme el resorte se estira de regreso, $kx$ disminuye y la aceleración también: esta es solo la aceleración inicial.' }
        ],
        answer: 'Sí se mueve; arranca con $a \\approx ' + fx(e5.a) + '\\ \\text{m/s}^2$.',
        verify: { lab: 'call', mod: 'friction', fn: 'analyze', args: [{ m: e5.m, F: 0, th: 0, mode: 'horizontal', mus: e5.mus, muk: e5.muk, k: e5.k, x: e5.x }], values: { a: e5.a } }
      }
    ],

    lab: {
      type: 'spring-friction', title: 'Fricción con ángulo y resorte',
      intro: 'Tiene dos modos. En <strong>fricción</strong>, mueve la fuerza, su ángulo y los coeficientes, cambia entre empujar y jalar, y agrega un resorte. El DCL y la gráfica de fricción cambian en vivo. Escribe tu $N$ y tu $a$: el lab detecta si usaste $N = mg$ con ángulo o $\\mu_s$ cuando ya desliza. En <strong>resorte colgado</strong>, arma uno, dos en serie o dos en paralelo y predice el estiramiento.',
      cfg: { start: { m: 10, F: 80, th: 30, mode: 'push', mus: 0.4, muk: 0.3, spring: false, k: 200, x: 0.2 } }
    },

    formulas: [
      { label: 'Hooke', tex: 'F = -kx' },
      { label: 'Serie y paralelo', tex: '\\tfrac{1}{k_s} = \\tfrac{1}{k_1} + \\tfrac{1}{k_2},\\ \\ k_p = k_1 + k_2' },
      { label: 'Estática', tex: 'f_s \\le \\mu_s N' },
      { label: 'Cinética', tex: 'f_k = \\mu_k N' },
      { label: 'Empujar hacia abajo', tex: 'N = mg + F\\sin\\theta' },
      { label: 'Jalar hacia arriba', tex: 'N = mg - F\\sin\\theta' },
      { label: 'Ángulo óptimo al jalar', tex: '\\tan\\theta = \\mu_s,\\ \\ F_{mín} = \\frac{\\mu_s mg}{\\sqrt{1 + \\mu_s^2}}' }
    ],

    exercises: [
      {
        id: 'f1-s10-empujar', title: 'Normal al empujar con ángulo',
        vars: { m: [5, 30, 1], F: [20, 150, 5], th: [15, 50, 5] },
        prompt: function (v) { return '<p>Empujas una caja de $' + v.m + '\\ \\text{kg}$ con $' + v.F + '\\ \\text{N}$ dirigidos $' + v.th + '^\\circ$ por debajo de la horizontal. ¿Cuánto vale la normal?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return v.m * g + v.F * Math.sin(v.th * RAD); },
        mistakes: { usedMg: function (v) { return v.m * g; }, wrongSign: function (v) { return v.m * g - v.F * Math.sin(v.th * RAD); } },
        feedback: [
          { when: 'usedMg', say: 'Usaste $N = mg$, pero tu fuerza empuja hacia abajo: su componente $F\\sin\\theta$ aumenta la normal.' },
          { when: 'wrongSign', say: 'Signo al revés: empujando hacia abajo, la normal crece.' }
        ],
        oracle: { lab: 'call', mod: 'friction', fn: 'normal', args: function (v) { return [v.m, v.F, v.th, 'push']; } },
        hint: '$\\Sigma F_y = 0$: $N - mg - F\\sin\\theta = 0$.',
        solution: function (v) { return '$$N = mg + F\\sin\\theta = ' + fx(v.m * g) + ' + ' + v.F + '\\sin ' + v.th + '^\\circ = ' + fx(v.m * g + v.F * Math.sin(v.th * RAD)) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f1-s10-jalar', title: 'Aceleración al jalar con ángulo',
        vars: { m: [5, 20, 1], F: [40, 150, 5], th: [15, 45, 5], muk: [0.1, 0.5, 0.05] },
        prompt: function (v) { return '<p>Jalas una caja de $' + v.m + '\\ \\text{kg}$ con una cuerda a $' + v.th + '^\\circ$ sobre la horizontal y $' + v.F + '\\ \\text{N}$ de tensión. La caja ya desliza ($\\mu_k = ' + v.muk + '$). ¿Qué aceleración tiene?</p>'; },
        check: 'numeric', unit: 'm/s²',
        answer: function (v) { return box(v.m, v.F, v.th, 'pull', v.muk).a; },
        baseWhere: function (v) { var b = box(v.m, v.F, v.th, 'pull', v.muk); return b.N > 5 && b.a > 0.3; },
        mistakes: { usedMg: function (v) { return (v.F * Math.cos(v.th * RAD) - v.muk * v.m * g) / v.m; } },
        feedback: [{ when: 'usedMg', say: 'Calculaste la fricción con $N = mg$. Al jalar hacia arriba, $N = mg - F\\sin\\theta$.' }],
        oracle: { lab: 'call', mod: 'friction', fn: 'analyze', field: 'a', args: function (v) { return [{ m: v.m, F: v.F, th: v.th, mode: 'pull', mus: v.muk, muk: v.muk }]; } },
        hint: 'Primero $N$ con $\\Sigma F_y = 0$; luego $a = (F\\cos\\theta - \\mu_kN)/m$.',
        solution: function (v) { var b = box(v.m, v.F, v.th, 'pull', v.muk); return '$$N = ' + fx(v.m * g) + ' - ' + v.F + '\\sin ' + v.th + '^\\circ = ' + fx(b.N) + '\\ \\text{N} \\qquad a = \\frac{' + v.F + '\\cos ' + v.th + '^\\circ - ' + v.muk + '(' + fx(b.N) + ')}{' + v.m + '} = ' + fx(b.a, 3) + '\\ \\text{m/s}^2$$'; }
      },
      {
        id: 'f1-s10-se-mueve', title: '¿Se mueve o no?',
        vars: { m: [5, 40, 1], mus: [0.3, 0.8, 0.05], F: [10, 150, 5] },
        prompt: function (v) { return '<p>Empujas horizontalmente con $' + v.F + '\\ \\text{N}$ un mueble de $' + v.m + '\\ \\text{kg}$ que no se mueve ($\\mu_s = ' + v.mus + '$). ¿Cuánto vale la fuerza de fricción?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return v.F; },
        baseWhere: function (v) { return v.F < 0.9 * v.mus * v.m * g; },
        mistakes: { maxStatic: function (v) { return v.mus * v.m * g; } },
        feedback: [{ when: 'maxStatic', say: 'Ese es el máximo $\\mu_sN$. Como el mueble no se mueve, la fricción estática vale solo lo que empujas.' }],
        oracle: { lab: 'call', mod: 'friction', fn: 'analyze', field: 'f', args: function (v) { return [{ m: v.m, F: v.F, th: 0, mode: 'horizontal', mus: v.mus, muk: v.mus * 0.8 }]; } },
        hint: 'Compara tu fuerza con $\\mu_sN$. Si no se mueve, $\\Sigma F_x = 0$.',
        solution: function (v) { return '$\\mu_sN = ' + fx(v.mus * v.m * g) + '$ N es mayor que ' + v.F + ' N: no se mueve, y por $\\Sigma F_x = 0$ la fricción vale $' + v.F + '$ N.'; }
      },
      {
        id: 'f1-s10-minima', title: 'Fuerza mínima para arrancar',
        vars: { m: [5, 40, 1], mus: [0.2, 0.9, 0.05] },
        prompt: function (v) { return '<p>¿Cuál es la fuerza mínima, jalando con el ángulo óptimo, para arrancar una caja de $' + v.m + '\\ \\text{kg}$ con $\\mu_s = ' + v.mus + '$?</p>'; },
        check: 'numeric', unit: 'N',
        answer: function (v) { return v.mus * v.m * g / Math.sqrt(1 + v.mus * v.mus); },
        mistakes: { horizontal: function (v) { return v.mus * v.m * g; } },
        feedback: [{ when: 'horizontal', say: 'Esa es la fuerza jalando horizontal. Con $\\tan\\theta = \\mu_s$ se necesita menos: $F = \\mu_s mg/\\sqrt{1 + \\mu_s^2}$.' }],
        oracle: { lab: 'call', mod: 'friction', fn: 'forceToStart', args: function (v) { return [v.m, v.mus, Math.atan(v.mus) * DEG, 'pull']; } },
        hint: 'El ángulo óptimo cumple $\\tan\\theta = \\mu_s$.',
        solution: function (v) { return '$$\\theta = \\arctan ' + v.mus + ' = ' + fx(Math.atan(v.mus) * DEG, 1) + '^\\circ \\qquad F = \\frac{\\mu_s mg}{\\sqrt{1 + \\mu_s^2}} = ' + fx(v.mus * v.m * g / Math.sqrt(1 + v.mus * v.mus), 3) + '\\ \\text{N}$$'; }
      },
      {
        id: 'f1-s10-resorte', title: 'Resorte contra la fricción',
        vars: { k: [100, 800, 50], x: [0.05, 0.3, 0.05], m: [1, 5, 0.5], muk: [0.1, 0.5, 0.05] },
        prompt: function (v) { return '<p>Un resorte de $k = ' + v.k + '\\ \\text{N/m}$ comprimido $' + v.x + '\\ \\text{m}$ empuja un bloque de $' + v.m + '\\ \\text{kg}$ que ya desliza sobre una mesa ($\\mu_k = ' + v.muk + '$). ¿Con qué aceleración arranca?</p>'; },
        check: 'numeric', unit: 'm/s²',
        answer: function (v) { return (v.k * v.x - v.muk * v.m * g) / v.m; },
        baseWhere: function (v) { return v.k * v.x - v.muk * v.m * g > 0.5 * v.m; },
        mistakes: { noFriction: function (v) { return v.k * v.x / v.m; } },
        feedback: [{ when: 'noFriction', say: 'Te faltó la fricción: $a = (kx - \\mu_k mg)/m$.' }],
        oracle: { lab: 'call', mod: 'friction', fn: 'analyze', field: 'a', args: function (v) { return [{ m: v.m, F: 0, th: 0, mode: 'horizontal', mus: v.muk, muk: v.muk, k: v.k, x: v.x }]; } },
        hint: 'Fuerza del resorte $kx$ contra fricción cinética $\\mu_k mg$.',
        solution: function (v) { return '$$a = \\frac{kx - \\mu_k mg}{m} = \\frac{' + fx(v.k * v.x) + ' - ' + fx(v.muk * v.m * g, 3) + '}{' + v.m + '} = ' + fx((v.k * v.x - v.muk * v.m * g) / v.m, 3) + '\\ \\text{m/s}^2$$'; }
      },
      {
        id: 'f1-s10-hooke', title: 'Constante de un resorte',
        vars: { F: [5, 80, 5], x: [0.02, 0.4, 0.02] },
        prompt: function (v) { return '<p>Un resorte se estira $' + v.x + '\\ \\text{m}$ cuando se le aplica una fuerza de $' + v.F + '\\ \\text{N}$. ¿Cuánto vale su constante $k$?</p>'; },
        check: 'numeric', unit: 'N/m',
        answer: function (v) { return v.F / v.x; },
        mistakes: { multiplied: function (v) { return v.F * v.x; } },
        feedback: [{ when: 'multiplied', say: 'De $F = kx$ se despeja $k = F/x$: se divide.' }],
        oracle: { lab: 'value', value: function (v) { return v.F / v.x; } },
        hint: '$F = kx$.',
        solution: function (v) { return '$$k = \\frac{F}{x} = \\frac{' + v.F + '}{' + v.x + '} = ' + fx(v.F / v.x) + '\\ \\text{N/m}$$'; }
      },
      {
        id: 'f1-s10-serie', title: 'Dos resortes en serie',
        vars: { m: [0.2, 5, 0.1], k1: [50, 500, 25], k2: [50, 500, 25] },
        prompt: function (v) { return '<p>Cuelgas una masa de $' + v.m + '\\ \\text{kg}$ de dos resortes en serie (uno abajo del otro) de $k_1 = ' + v.k1 + '$ y $k_2 = ' + v.k2 + '\\ \\text{N/m}$. ¿Cuánto se estira el arreglo?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return v.m * g * (1 / v.k1 + 1 / v.k2); },
        mistakes: { parallel: function (v) { return v.m * g / (v.k1 + v.k2); } },
        feedback: [{ when: 'parallel', say: 'Sumaste las constantes: eso es en paralelo. En serie se suman las elongaciones.' }],
        oracle: { lab: 'call', mod: 'friction', fn: 'hang', field: 'x', args: function (v) { return [v.m, v.k1, v.k2, 'series']; } },
        hint: 'Cada resorte sostiene todo el peso: $x_1 = mg/k_1$ y $x_2 = mg/k_2$.',
        solution: function (v) { return '$$x = \\frac{mg}{k_1} + \\frac{mg}{k_2} = ' + fx(v.m * g / v.k1, 4) + ' + ' + fx(v.m * g / v.k2, 4) + ' = ' + fx(v.m * g * (1 / v.k1 + 1 / v.k2), 4) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s10-paralelo', title: 'Dos resortes en paralelo',
        vars: { m: [0.2, 5, 0.1], k1: [50, 500, 25], k2: [50, 500, 25] },
        prompt: function (v) { return '<p>Una placa de $' + v.m + '\\ \\text{kg}$ cuelga de dos resortes lado a lado de $k_1 = ' + v.k1 + '$ y $k_2 = ' + v.k2 + '\\ \\text{N/m}$ y se estiran igual. ¿Cuánto se estiran?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return v.m * g / (v.k1 + v.k2); },
        mistakes: { series: function (v) { return v.m * g * (1 / v.k1 + 1 / v.k2); }, single: function (v) { return v.m * g / v.k1; } },
        feedback: [
          { when: 'series', say: 'Eso sería en serie. En paralelo se reparten el peso: $k = k_1 + k_2$.' },
          { when: 'single', say: 'Usaste solo un resorte; los dos sostienen la placa.' }
        ],
        oracle: { lab: 'call', mod: 'friction', fn: 'hang', field: 'x', args: function (v) { return [v.m, v.k1, v.k2, 'parallel']; } },
        hint: '$(k_1 + k_2)x = mg$.',
        solution: function (v) { return '$$x = \\frac{mg}{k_1 + k_2} = \\frac{' + fx(v.m * g) + '}{' + (v.k1 + v.k2) + '} = ' + fx(v.m * g / (v.k1 + v.k2), 4) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s10-concepto', title: 'Concepto: arrancar cuesta más',
        vars: {},
        prompt: function () { return '<p>¿Por qué cuesta más empezar a mover un mueble que mantenerlo deslizando?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Porque $\\mu_s$ suele ser mayor que $\\mu_k$', correct: true },
            { text: 'Porque en reposo el mueble pesa más', say: 'El peso no cambia; cambia el tipo de fricción.' },
            { text: 'Porque al moverse desaparece la normal', say: 'La normal sigue ahí; lo que baja es el coeficiente.' },
            { text: 'Porque la fricción cinética es cero', say: 'La cinética existe: vale $\\mu_kN$.' }
          ];
        },
        answer: function () { return 'Porque $\\mu_s$ suele ser mayor que $\\mu_k$'; },
        hint: 'Compara la fricción estática máxima con la cinética.',
        solution: function () { return 'Para arrancar hay que superar $\\mu_sN$; ya deslizando basta con igualar $\\mu_kN$, que es menor.'; }
      }
    ],

    quiz: { tags: ['f1.S10'], count: 8 },

    errors: [
      'Usar $N = mg$ cuando la fuerza está inclinada.',
      'Poner $f = \\mu_sN$ cuando el cuerpo no se mueve: la estática vale solo lo necesario.',
      'Usar $\\mu_s$ cuando el cuerpo ya desliza.',
      'Olvidar que solo $F\\cos\\theta$ empuja hacia adelante.',
      'Multiplicar en lugar de dividir al despejar $k$ de $F = kx$.'
    ],

    teacher: {
      plan: [
        'Hooke con un resorte y pesas; fricción con una caja y un dinamómetro: ver que cuesta más arrancar.',
        'Explainer de empujar contra jalar; el lab trae el error de N = mg.',
        'Ejemplos: ¿se mueve?, ángulo óptimo y resorte contra fricción.'
      ],
      check: [
        'Que decidan primero si se mueve, comparando con $\\mu_sN$.',
        'Que calculen N con ΣF_y = 0 en cada problema.'
      ],
      note: 'El ángulo óptimo usa derivadas de S04 y de Cálculo 1: buen momento para conectar.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 1</em>, §5.6 “Common Forces” (ley de Hooke). <a href="https://openstax.org/books/university-physics-volume-1/pages/5-6-common-forces">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §6.2 “Friction”. <a href="https://openstax.org/books/university-physics-volume-1/pages/6-2-friction">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-09',
    next: 'sesion-11'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
