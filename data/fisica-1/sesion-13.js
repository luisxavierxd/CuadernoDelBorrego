/* =====================================================================
   Física 1 · S13 · Energía potencial y conservación de la energía (bloque D).
   Fuente: OpenStax, University Physics Volume 1, §8.1–8.3 (CC BY-NC-SA 4.0).
   g = 9.81 m/s². Las cuentas se comprueban contra LabMath.energy (lab energy-bars).
   ===================================================================== */
(function () {
  var g = 9.81;
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

  var e1 = { h: 5 }; e1.v = Math.sqrt(2 * g * e1.h);
  var e2 = { h: 8 }; e2.y = e2.h / 2; e2.v = Math.sqrt(g * e2.h);
  var e3 = { m: 2, v: 3, k: 800 }; e3.x = e3.v * Math.sqrt(e3.m / e3.k);
  var e4 = { m: 1, h: 2, k: 400, mu: 0.25, d: 1.5 }; e4.E0 = e4.m * g * e4.h; e4.loss = e4.mu * e4.m * g * e4.d; e4.x = Math.sqrt(2 * (e4.E0 - e4.loss) / e4.k);
  var e5 = { m: 60, h: 10, v: 12 }; e5.loss = e5.m * g * e5.h - 0.5 * e5.m * e5.v * e5.v;
  var e6 = { m: 0.05, k: 500, x: 0.1 }; e6.H = 0.5 * e6.k * e6.x * e6.x / (e6.m * g);

  var data = window.SESSION_DATA = {
    slug: 'sesion-13', number: '13', group: 'D · Trabajo y energía',
    title: 'Energía potencial y conservación de la energía', temario: [],
    minutes: 180,
    quote: 'La energía no se crea ni se destruye: cambia de forma. Si falta, búscala en el calor de la fricción.',
    badges: [
      'Calcular la energía potencial gravitacional $mgy$ y elástica $\\tfrac{1}{2}kx^2$.',
      'Usar $K_0 + U_0 = K_f + U_f$ para hallar rapideces, alturas y compresiones.',
      'Encontrar a qué altura la energía cinética iguala a la potencial.',
      'Incluir la fricción como energía perdida: $E_f = E_0 - f_k d$.'
    ],

    lesson: [
      {
        "type": "warmup",
        "heading": "Antes de empezar",
        "short": "Antes de empezar",
        "idea": "La energía no se crea ni se destruye: se <strong>transforma</strong>. Sin fricción, energía cinética más potencial se mantiene constante.",
        "recall": [
          "Energía cinética y trabajo (S12).",
          "Que la altura se mide desde un nivel que tú eliges."
        ],
        "why": "Montañas rusas, péndulos, resortes que lanzan cosas y presas hidroeléctricas funcionan convirtiendo un tipo de energía en otro."
      },
      {
        "type": "concept",
        "heading": "Imagínalo así",
        "short": "Imagínalo así",
        "body": [
          "Sube un carrito a lo alto de una montaña rusa: ahí tiene mucha energía <strong>potencial</strong> (por su altura) y casi nada de cinética. Al bajar, la altura se \"convierte\" en rapidez; al volver a subir, la rapidez se convierte en altura.",
          "Sin fricción la suma no cambia: $K + U$ es la misma en todos los puntos. Por eso basta comparar dos puntos (inicio y final) sin importar la forma del camino.",
          "Con fricción, una parte de la energía se va en calor. Sigue existiendo, pero ya no está disponible como movimiento o altura: la restas como \"energía perdida\"."
        ]
      },
      {
        type: 'concept', heading: 'Energía potencial', short: 'Energía potencial',
        body: [
          'El trabajo del peso no depende del camino, solo de la altura inicial y la final. Por eso se puede guardar como <strong>energía potencial gravitacional</strong>: $$U_g = mgy$$ con $y$ medida desde un nivel que tú eliges (solo importan las diferencias).',
          'Un resorte deformado $x$ desde su largo natural guarda <strong>energía potencial elástica</strong>: $$U_e = \\tfrac{1}{2}kx^2$$ Es el área bajo $F = kx$ que viste en S12. Vale lo mismo si se estira o se comprime.',
          'El peso y el resorte son fuerzas <strong>conservativas</strong>: lo que quitan de energía cinética lo devuelven. La fricción no: lo que quita se va en calor.'
        ]
      },
      {
        type: 'explainer', heading: 'La energía mecánica se conserva', short: 'Conservación',
        title: 'Un carrito en una rampa sin fricción',
        intro: 'Sin fricción, la energía mecánica $E = K + U$ no cambia: $$K_0 + U_0 = K_f + U_f$$',
        diagram: 'energy-explainer',
        steps: [
          { text: 'Arriba, en reposo, toda la energía es potencial: $E = mgh$.', state: { u: 0 } },
          { text: 'A la mitad de la altura, la mitad se volvió cinética: $K = U$. Esto contesta <em>"¿a qué altura $K = U$?"</em>: a $h/2$, sin importar la forma de la rampa.', state: { u: 0.2929 } },
          { text: 'Abajo, toda es cinética: $\\tfrac{1}{2}mv^2 = mgh$, así que $$v = \\sqrt{2gh}$$ La masa se cancela: la misma rapidez que en caída libre.', state: { u: 1 } }
        ]
      },
      {
        "type": "recipe",
        "heading": "Receta: conservación de la energía",
        "short": "Receta",
        "steps": [
          {
            "text": "Elige el nivel cero de altura (suele ser el punto más bajo)."
          },
          {
            "text": "Escribe la energía en el punto inicial: $K_0 + U_0$ (con $U_g = mgy$ y, si hay resorte, $U_e = \\tfrac{1}{2}kx^2$)."
          },
          {
            "text": "Escribe la energía en el punto final: $K_f + U_f$."
          },
          {
            "text": "Iguala. Si hay fricción, resta $f_kd$ del lado inicial.",
            "tip": "La masa se cancela muchas veces: si todos los términos la tienen, no la necesitas."
          },
          {
            "text": "Despeja lo que te piden (rapidez, altura, compresión)."
          }
        ]
      },
      {
        type: 'example', heading: '¿Con qué rapidez llega abajo?',
        problem: '<p>Un niño se suelta desde el reposo en lo alto de una resbaladilla sin fricción de $' + e1.h + '\\ \\text{m}$ de altura. ¿Con qué rapidez llega abajo?</p>',
        steps: [
          { text: 'Nivel cero abajo. Arriba solo hay potencial; abajo solo cinética.', math: 'mgh = \\tfrac{1}{2}mv^2' },
          { text: 'La masa se cancela.', math: 'v = \\sqrt{2gh} = \\sqrt{2(9.81)(5)} = ' + fx(e1.v, 3) + '\\ \\text{m/s}' },
          { text: 'No importa la forma de la resbaladilla: solo la altura.' }
        ],
        answer: '$v \\approx ' + fx(e1.v) + '\\ \\text{m/s}$.',
        verify: { lab: 'call', mod: 'energy', fn: 'speedAt', args: [e1.h, 0], value: e1.v }
      },
      {
        type: 'example', heading: '¿A qué altura la energía cinética iguala a la potencial?',
        problem: '<p>Sueltas una pelota desde $' + e2.h + '\\ \\text{m}$ de altura. ¿A qué altura su energía cinética es igual a su energía potencial? ¿Qué rapidez lleva ahí?</p>',
        steps: [
          { text: 'La energía total es $mgh$ y se reparte a partes iguales.', math: 'K + U = mgh \\quad\\text{y}\\quad K = U \\;\\Rightarrow\\; 2mgy = mgh' },
          { text: 'Despeja.', math: 'y = \\frac{h}{2} = ' + fx(e2.y) + '\\ \\text{m}' },
          { text: 'Rapidez ahí: $\\tfrac{1}{2}mv^2 = mg(h - y) = mg\\,h/2$.', math: 'v = \\sqrt{gh} = ' + fx(e2.v, 3) + '\\ \\text{m/s}' }
        ],
        answer: 'A $y = ' + fx(e2.y) + '\\ \\text{m}$, con $v \\approx ' + fx(e2.v) + '\\ \\text{m/s}$.',
        verify: { lab: 'call', mod: 'energy', fn: 'heightKequalsU', args: [e2.h], value: e2.y }
      },
      {
        type: 'example', heading: '¿Cuánto se comprime el resorte?',
        problem: '<p>Un carrito de $' + e3.m + '\\ \\text{kg}$ rueda a $' + e3.v + '\\ \\text{m/s}$ por un piso liso y choca con un resorte de $k = ' + e3.k + '\\ \\text{N/m}$. ¿Cuánto lo comprime hasta frenar?</p>',
        steps: [
          { text: 'Al frenar, toda la energía cinética quedó en el resorte.', math: '\\tfrac{1}{2}mv^2 = \\tfrac{1}{2}kx^2' },
          { text: 'Despeja.', math: 'x = v\\sqrt{\\frac{m}{k}} = 3\\sqrt{\\frac{2}{800}} = ' + fx(e3.x, 3) + '\\ \\text{m}' },
          { text: 'Después el resorte lo devuelve con la misma rapidez: sin fricción no se pierde nada.' }
        ],
        answer: '$x = ' + fx(e3.x, 2) + '\\ \\text{m} = ' + fx(e3.x * 100, 0) + '\\ \\text{cm}$.',
        verify: { lab: 'call', mod: 'energy', fn: 'track', args: [{ m: e3.m, h: e3.v * e3.v / (2 * g), k: e3.k, mu: 0, d: 0 }], values: { x: e3.x } }
      },
      {
        type: 'concept', heading: 'Con fricción: la energía que se pierde', short: 'Con fricción',
        body: [
          'La fricción cinética hace trabajo negativo $-f_k d$ y esa energía sale del sistema mecánico (se vuelve calor). El balance queda $$K_0 + U_0 - f_k d = K_f + U_f$$',
          'Si conoces las energías inicial y final, la diferencia es la <strong>energía perdida</strong>. Si conoces $f_k = \\mu_k N$ y la distancia, puedes calcularla antes.',
          'Revisa siempre: la energía final nunca puede ser mayor que la inicial si solo hay fricción.'
        ],
        diagram: 'energy-track',
        caption: 'Rampa lisa, tramo áspero y resorte: lo que llega al resorte es $mgh - \\mu_k mgd$.'
      },
      {
        type: 'example', heading: 'Rampa, tramo áspero y resorte',
        problem: '<p>Un carrito de $' + e4.m + '\\ \\text{kg}$ se suelta desde $' + e4.h + '\\ \\text{m}$ en una rampa lisa, cruza un tramo áspero de $' + e4.d + '\\ \\text{m}$ ($\\mu_k = ' + e4.mu + '$) y choca con un resorte de $k = ' + e4.k + '\\ \\text{N/m}$. ¿Cuánta energía pierde y cuánto comprime el resorte?</p>',
        steps: [
          { text: 'Energía inicial.', math: 'E_0 = mgh = ' + fx(e4.E0, 3) + '\\ \\text{J}' },
          { text: 'Energía perdida en el tramo áspero ($N = mg$ en el piso).', math: '\\mu_k mg\\,d = (0.25)(9.81)(1.5) = ' + fx(e4.loss, 3) + '\\ \\text{J}' },
          { text: 'Lo que queda se guarda en el resorte.', math: '\\tfrac{1}{2}kx^2 = ' + fx(e4.E0 - e4.loss, 3) + ' \\;\\Rightarrow\\; x = ' + fx(e4.x, 4) + '\\ \\text{m}' },
          { text: 'Sin fricción serían $' + fx(Math.sqrt(2 * e4.E0 / e4.k), 3) + '$ m: olvidar la pérdida es el error típico.' }
        ],
        answer: 'Pierde $' + fx(e4.loss, 2) + '\\ \\text{J}$ y comprime el resorte $' + fx(e4.x, 3) + '\\ \\text{m}$.',
        verify: { lab: 'call', mod: 'energy', fn: 'track', args: [{ m: e4.m, h: e4.h, k: e4.k, mu: e4.mu, d: e4.d }], values: { loss: e4.loss, x: e4.x } }
      },
      {
        type: 'example', heading: 'La energía que se llevó la fricción',
        problem: '<p>Una persona de $' + e5.m + '\\ \\text{kg}$ baja por un tobogán de $' + e5.h + '\\ \\text{m}$ de altura y llega abajo a $' + e5.v + '\\ \\text{m/s}$. ¿Cuánta energía se perdió por fricción?</p>',
        steps: [
          { text: 'Sin fricción llegaría a $\\sqrt{2gh} = ' + fx(Math.sqrt(2 * g * e5.h)) + '$ m/s. Llega más lento: se perdió energía.' },
          { text: 'Pérdida = energía inicial menos final.', math: 'mgh - \\tfrac{1}{2}mv^2 = ' + fx(e5.m * g * e5.h) + ' - ' + fx(0.5 * e5.m * e5.v * e5.v) + ' = ' + fx(e5.loss) + '\\ \\text{J}' },
          { text: 'Es el ' + fx(100 * e5.loss / (e5.m * g * e5.h), 0) + ' % de la energía inicial.' }
        ],
        answer: 'Se perdieron $' + fx(e5.loss, 0) + '\\ \\text{J}$.',
        verify: { lab: 'call', mod: 'energy', fn: 'track', args: [{ m: e5.m, h: e5.h, k: 1, mu: e5.loss / (e5.m * g), d: 1 }], values: { vAfter: e5.v } }
      },
      {
        type: 'example', heading: 'Un resorte que dispara hacia arriba',
        problem: '<p>Un resorte vertical de $k = ' + e6.k + '\\ \\text{N/m}$ comprimido $' + fx(e6.x * 100, 0) + '\\ \\text{cm}$ dispara hacia arriba una canica de $' + fx(e6.m * 1000, 0) + '\\ \\text{g}$. ¿Qué altura sube sobre su punto de partida? (Desprecia el cambio de altura mientras el resorte se expande.)</p>',
        steps: [
          { text: 'Energía elástica inicial, energía gravitacional arriba.', math: '\\tfrac{1}{2}kx^2 = mgH' },
          { text: 'Despeja con la masa en kilogramos.', math: 'H = \\frac{kx^2}{2mg} = \\frac{(500)(0.1)^2}{2(0.05)(9.81)} = ' + fx(e6.H, 3) + '\\ \\text{m}' }
        ],
        answer: '$H \\approx ' + fx(e6.H) + '\\ \\text{m}$.',
        verify: { lab: 'call', mod: 'energy', fn: 'speedAt', args: [e6.H, 0], value: e6.x * Math.sqrt(e6.k / e6.m) }
      },
      {
        type: 'callout', heading: 'Receta de energía',
        body: [
          'Elige el nivel cero de altura. Escribe $K$ y $U$ en el estado inicial y en el final; si hay fricción, resta $f_k d$.',
          'Energía sirve para rapideces, alturas y compresiones. Si te preguntan un tiempo, necesitas cinemática o dinámica.'
        ]
      },
      {
        "type": "faq",
        "heading": "Dudas comunes",
        "short": "Dudas comunes",
        "items": [
          {
            "q": "¿Importa dónde pongo el cero de altura?",
            "a": "No para el resultado: solo importan las diferencias de altura. Elige el que haga las cuentas más fáciles."
          },
          {
            "q": "¿Por qué la forma de la rampa no importa?",
            "a": "Porque la energía solo depende de la altura y la rapidez en cada punto, no del camino (si no hay fricción)."
          },
          {
            "q": "¿Qué pasa con la energía \"perdida\"?",
            "a": "Se convierte en calor (y un poco en sonido). No desaparece, pero ya no puede devolverse como movimiento."
          }
        ]
      },
      {
        "type": "recap",
        "heading": "Lo que te llevas",
        "short": "Resumen",
        "points": [
          "$U_g = mgy$, $U_e = \\tfrac{1}{2}kx^2$.",
          "Sin fricción: $K_0 + U_0 = K_f + U_f$.",
          "Con fricción: resta $f_kd$.",
          "Solo importan el punto inicial y el final."
        ]
      }
    ],

    lab: {
      type: 'energy-bars', title: 'Barras de energía',
      intro: 'Suelta el carrito y mira cómo la energía potencial se vuelve cinética, se pierde en el tramo áspero y termina en el resorte. Escribe tu rapidez abajo y tu compresión máxima: el lab detecta si olvidaste el 2, el ½ o la energía perdida.',
      cfg: { start: { h: 2, m: 1, k: 400, mu: 0.25, d: 1.5 } }
    },

    formulas: [
      { label: 'Potencial gravitacional', tex: 'U_g = mgy' },
      { label: 'Potencial elástica', tex: 'U_e = \\tfrac{1}{2}kx^2' },
      { label: 'Conservación', tex: 'K_0 + U_0 = K_f + U_f' },
      { label: 'Con fricción', tex: 'K_0 + U_0 - f_k d = K_f + U_f' },
      { label: 'Rapidez abajo', tex: 'v = \\sqrt{2gh}' },
      { label: 'K = U', tex: 'y = h/2' }
    ],

    exercises: [
      {
        id: 'f1-s13-abajo', title: 'Rapidez al llegar abajo',
        vars: { h: [1, 40, 1], v0: [0, 8, 1] },
        prompt: function (v) { return '<p>Un carrito de montaña rusa pasa por un punto a $' + v.h + '\\ \\text{m}$ de altura con rapidez $' + v.v0 + '\\ \\text{m/s}$. Sin fricción, ¿qué rapidez tiene al llegar al punto más bajo (altura 0)?</p>'; },
        check: 'numeric', unit: 'm/s',
        answer: function (v) { return Math.sqrt(v.v0 * v.v0 + 2 * g * v.h); },
        baseWhere: function (v) { return v.v0 > 0; },
        mistakes: { noV0: function (v) { return Math.sqrt(2 * g * v.h); }, addSpeeds: function (v) { return v.v0 + Math.sqrt(2 * g * v.h); }, noTwo: function (v) { return Math.sqrt(v.v0 * v.v0 + g * v.h); } },
        feedback: [
          { when: 'noV0', say: 'Ya llevaba rapidez arriba: incluye su energía cinética inicial.' },
          { when: 'addSpeeds', say: 'Las rapideces no se suman: se suman las energías, $v^2 = v_0^2 + 2gh$.' },
          { when: 'noTwo', say: 'De $mgh = \\tfrac{1}{2}mv^2$ sale $2gh$, no $gh$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return window.LabMath.energy.speedAt(v.h + v.v0 * v.v0 / (2 * g), 0); } },
        hint: '$\\tfrac{1}{2}mv_0^2 + mgh = \\tfrac{1}{2}mv^2$.',
        solution: function (v) { return '$$v = \\sqrt{v_0^2 + 2gh} = \\sqrt{' + (v.v0 * v.v0) + ' + 2(9.81)(' + v.h + ')} = ' + fx(Math.sqrt(v.v0 * v.v0 + 2 * g * v.h), 3) + '\\ \\text{m/s}$$'; }
      },
      {
        id: 'f1-s13-kigualu', title: '¿A qué altura K es n veces U?',
        vars: { h: [4, 60, 2], n: [1, 4, 1] },
        prompt: function (v) { return '<p>Sueltas una piedra desde $' + v.h + '\\ \\text{m}$. ¿A qué altura su energía cinética es ' + (v.n === 1 ? 'igual a' : v.n + ' veces') + ' su energía potencial? (Nivel cero en el suelo.)</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return v.h / (v.n + 1); },
        mistakes: { overN: function (v) { return v.h / v.n; } },
        feedback: [{ when: 'overN', say: 'La energía total es $K + U = (n + 1)U$: divide entre $n + 1$.' }],
        oracle: { lab: 'value', value: function (v) { var lo = 0, hi = v.h; for (var i = 0; i < 80; i++) { var y = (lo + hi) / 2, K = g * (v.h - y), U = g * y; if (K > v.n * U) lo = y; else hi = y; } return (lo + hi) / 2; } },
        hint: '$K + U = mgh$ y $K = nU$, así que $(n + 1)mgy = mgh$.',
        solution: function (v) { return '$$y = \\frac{h}{n + 1} = \\frac{' + v.h + '}{' + (v.n + 1) + '} = ' + fx(v.h / (v.n + 1), 3) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s13-comprime', title: 'Compresión al frenar un carrito',
        vars: { m: [0.5, 5, 0.5], v: [1, 6, 0.5], k: [100, 2000, 100] },
        prompt: function (v) { return '<p>Un carrito de $' + v.m + '\\ \\text{kg}$ a $' + v.v + '\\ \\text{m/s}$ choca con un resorte de $k = ' + v.k + '\\ \\text{N/m}$ sobre un piso liso. ¿Cuánto lo comprime como máximo?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return v.v * Math.sqrt(v.m / v.k); },
        mistakes: { noSqrt: function (v) { return v.m * v.v * v.v / v.k; }, noHalfK: function (v) { return v.v * Math.sqrt(v.m / (2 * v.k)); } },
        feedback: [
          { when: 'noSqrt', say: 'Ese es $x^2$: falta la raíz.' },
          { when: 'noHalfK', say: 'Los dos lados llevan ½: $\\tfrac{1}{2}mv^2 = \\tfrac{1}{2}kx^2$.' }
        ],
        oracle: { lab: 'call', mod: 'energy', fn: 'track', field: 'x', args: function (v) { return [{ m: v.m, h: v.v * v.v / (2 * g), k: v.k, mu: 0, d: 0 }]; } },
        hint: 'Toda la energía cinética termina en el resorte.',
        solution: function (v) { return '$$x = v\\sqrt{\\frac{m}{k}} = ' + v.v + '\\sqrt{\\frac{' + v.m + '}{' + v.k + '}} = ' + fx(v.v * Math.sqrt(v.m / v.k), 4) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s13-perdida', title: 'Energía perdida por fricción',
        vars: { m: [20, 90, 5], h: [3, 20, 1], p: [50, 90, 5] },
        prompt: function (v) { var vf = Math.sqrt(2 * g * v.h * v.p / 100); return '<p>Una persona de $' + v.m + '\\ \\text{kg}$ baja desde el reposo por un tobogán de $' + v.h + '\\ \\text{m}$ de altura y llega abajo a $' + fx(vf, 2) + '\\ \\text{m/s}$. ¿Cuánta energía se perdió por fricción?</p>'; },
        check: 'numeric', unit: 'J',
        answer: function (v) { var vf = Number(Math.sqrt(2 * g * v.h * v.p / 100).toFixed(2)); return v.m * g * v.h - 0.5 * v.m * vf * vf; },
        mistakes: { noHalf: function (v) { var vf = Number(Math.sqrt(2 * g * v.h * v.p / 100).toFixed(2)); return Math.abs(v.m * g * v.h - v.m * vf * vf); }, finalOnly: function (v) { var vf = Number(Math.sqrt(2 * g * v.h * v.p / 100).toFixed(2)); return 0.5 * v.m * vf * vf; } },
        feedback: [
          { when: 'noHalf', say: 'La energía cinética es $\\tfrac{1}{2}mv^2$.' },
          { when: 'finalOnly', say: 'Esa es la energía que llegó abajo. La perdida es la diferencia con $mgh$.' }
        ],
        oracle: { lab: 'value', value: function (v) { var vf = Number(Math.sqrt(2 * g * v.h * v.p / 100).toFixed(2)); return v.m * (window.LabMath.energy.speedAt(v.h, 0) * window.LabMath.energy.speedAt(v.h, 0) - vf * vf) / 2; } },
        hint: 'Pérdida $= mgh - \\tfrac{1}{2}mv^2$.',
        solution: function (v) { var vf = Number(Math.sqrt(2 * g * v.h * v.p / 100).toFixed(2)); return '$$mgh - \\tfrac{1}{2}mv^2 = ' + fx(v.m * g * v.h, 2) + ' - ' + fx(0.5 * v.m * vf * vf, 2) + ' = ' + fx(v.m * g * v.h - 0.5 * v.m * vf * vf, 2) + '\\ \\text{J}$$'; }
      },
      {
        id: 'f1-s13-aspero', title: 'Rampa y tramo áspero antes del resorte',
        vars: { m: [0.5, 4, 0.5], h: [1, 4, 0.5], mu: [0.1, 0.4, 0.05], d: [0.5, 2, 0.5], k: [200, 1500, 100] },
        prompt: function (v) { return '<p>Un bloque de $' + v.m + '\\ \\text{kg}$ se suelta desde $' + v.h + '\\ \\text{m}$ en una rampa lisa, cruza un tramo horizontal de $' + v.d + '\\ \\text{m}$ con $\\mu_k = ' + v.mu + '$ y choca con un resorte de $k = ' + v.k + '\\ \\text{N/m}$. ¿Cuánto comprime el resorte?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return Math.sqrt(2 * v.m * g * (v.h - v.mu * v.d) / v.k); },
        baseWhere: function (v) { return v.h - v.mu * v.d > 0.3; },
        mistakes: { noFriction: function (v) { return Math.sqrt(2 * v.m * g * v.h / v.k); }, noHalf: function (v) { return Math.sqrt(v.m * g * (v.h - v.mu * v.d) / v.k); } },
        feedback: [
          { when: 'noFriction', say: 'Olvidaste la energía perdida en el tramo áspero, $\\mu_k mg\\,d$.' },
          { when: 'noHalf', say: 'La energía del resorte es $\\tfrac{1}{2}kx^2$.' }
        ],
        oracle: { lab: 'call', mod: 'energy', fn: 'track', field: 'x', args: function (v) { return [{ m: v.m, h: v.h, k: v.k, mu: v.mu, d: v.d }]; } },
        hint: '$mgh - \\mu_k mg\\,d = \\tfrac{1}{2}kx^2$.',
        solution: function (v) { var E = v.m * g * (v.h - v.mu * v.d); return '$$\\tfrac{1}{2}kx^2 = mgh - \\mu_k mgd = ' + fx(E, 3) + '\\ \\text{J} \\;\\Rightarrow\\; x = ' + fx(Math.sqrt(2 * E / v.k), 4) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s13-dispara', title: 'Resorte que lanza hacia arriba',
        vars: { k: [100, 1000, 50], x: [2, 15, 1], m: [10, 200, 10] },
        prompt: function (v) { return '<p>Un resorte vertical de $k = ' + v.k + '\\ \\text{N/m}$ se comprime $' + v.x + '\\ \\text{cm}$ y lanza hacia arriba un objeto de $' + v.m + '\\ \\text{g}$. Despreciando el cambio de altura mientras se expande, ¿qué altura sube?</p>'; },
        check: 'numeric', unit: 'm',
        answer: function (v) { return 0.5 * v.k * Math.pow(v.x / 100, 2) / (v.m / 1000 * g); },
        baseWhere: function (v) { var H = 0.5 * v.k * Math.pow(v.x / 100, 2) / (v.m / 1000 * g); return H > 0.2 && H < 60; },
        mistakes: { noHalf: function (v) { return v.k * Math.pow(v.x / 100, 2) / (v.m / 1000 * g); }, noG: function (v) { return 0.5 * v.k * Math.pow(v.x / 100, 2) / (v.m / 1000); } },
        feedback: [
          { when: 'noHalf', say: 'La energía del resorte es $\\tfrac{1}{2}kx^2$.' },
          { when: 'noG', say: 'La energía gravitacional es $mgH$: te faltó $g$.' }
        ],
        oracle: { lab: 'value', value: function (v) { var v0 = Math.sqrt(v.k * Math.pow(v.x / 100, 2) / (v.m / 1000)); return v0 * v0 / (2 * g); } },
        hint: '$\\tfrac{1}{2}kx^2 = mgH$, con $x$ en metros y $m$ en kilogramos.',
        solution: function (v) { var H = 0.5 * v.k * Math.pow(v.x / 100, 2) / (v.m / 1000 * g); return '$$H = \\frac{kx^2}{2mg} = \\frac{(' + v.k + ')(' + fx(v.x / 100, 2) + ')^2}{2(' + fx(v.m / 1000, 3) + ')(9.81)} = ' + fx(H, 3) + '\\ \\text{m}$$'; }
      },
      {
        id: 'f1-s13-concepto', title: 'Concepto: dos rampas',
        vars: {},
        prompt: function () { return '<p>Dos niños se sueltan desde la misma altura: uno por una resbaladilla recta y el otro por una curva más larga, ambas sin fricción. ¿Quién llega abajo más rápido (mayor rapidez)?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: 'Llegan con la misma rapidez', correct: true },
            { text: 'El de la resbaladilla recta', say: 'Quizá llegue antes, pero la rapidez final solo depende de la altura.' },
            { text: 'El de la resbaladilla curva, porque recorre más', say: 'Recorrer más no da más energía: sin fricción, $\\tfrac{1}{2}mv^2 = mgh$.' },
            { text: 'Depende de la masa de cada niño', say: 'La masa se cancela: $v = \\sqrt{2gh}$.' }
          ];
        },
        answer: function () { return 'Llegan con la misma rapidez'; },
        hint: '¿De qué depende $v = \\sqrt{2gh}$?',
        solution: function () { return 'Sin fricción, $mgh = \\tfrac{1}{2}mv^2$ en los dos casos: $v = \\sqrt{2gh}$ no depende del camino ni de la masa. El tiempo sí puede ser distinto.'; }
      }
    ],

    quiz: { tags: ['f1.S13'], count: 8 },

    errors: [
      'Escribir $v = \\sqrt{gh}$ (sin el 2) al despejar la rapidez.',
      'Olvidar la energía cinética inicial cuando el cuerpo ya se movía.',
      'Olvidar la energía perdida por fricción.',
      'Sumar rapideces en vez de energías.',
      'Usar centímetros o gramos sin convertir a metros y kilogramos.'
    ],

    teacher: {
      plan: [
        'De trabajo del peso y del resorte a energía potencial.',
        'Explainer de la rampa: arriba, a la mitad ($K = U$) y abajo.',
        'Ejemplos obligatorios: rapidez abajo, altura $K = U$, compresión del resorte y versión con fricción.',
        'Lab de barras: soltar con y sin tramo áspero y comparar.'
      ],
      check: [
        'Que escriban el estado inicial y el final antes de igualar.',
        'Que expliquen a dónde se fue la energía que falta.'
      ],
      note: 'Cierra el bloque D: los problemas de examen combinan S10, S12 y S13.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 1</em>, §8.1 “Potential Energy of a System”. <a href="https://openstax.org/books/university-physics-volume-1/pages/8-1-potential-energy-of-a-system">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §8.2 “Conservative and Non-Conservative Forces”. <a href="https://openstax.org/books/university-physics-volume-1/pages/8-2-conservative-and-non-conservative-forces">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §8.3 “Conservation of Energy”. <a href="https://openstax.org/books/university-physics-volume-1/pages/8-3-conservation-of-energy">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-12',
    next: 'sesion-14'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
