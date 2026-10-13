/* =====================================================================
   Física 3 · S09 · Solenoides y toroides (bloque B · Fuentes de campo).
   Fuentes: OpenStax, University Physics Volume 2, §12.6 (CC BY-NC-SA 4.0).
   μ₀ = 4π × 10⁻⁷ T·m/A. Largos y radios en cm, campos en mT.
   Las cuentas se comparan contra LabMath.solenoid (lab solenoid-toroid).
   ===================================================================== */
(function () {
  var MU0 = 4 * Math.PI * 1e-7;
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
  // Campos en mT con largos en cm.
  function sol(N, L, I) { return MU0 * N / (L / 100) * I * 1000; }
  function tor(N, I, r) { return MU0 * N * I / (2 * Math.PI * r / 100) * 1000; }
  function fin(N, L, R, I, z) { var u = (z + L / 2) / 100, w = (z - L / 2) / 100, r = R / 100; return MU0 * N * I / (2 * L / 100) * (u / Math.hypot(u, r) - w / Math.hypot(w, r)) * 1000; }

  var e1 = { N: 500, L: 25, I: 2 }; e1.n = e1.N / (e1.L / 100); e1.B = sol(e1.N, e1.L, e1.I);
  var e2 = { B: 20, N: 1000, L: 30 }; e2.n = e2.N / (e2.L / 100); e2.I = e2.B / 1000 / (MU0 * e2.n);
  var e3 = { N: 200, L: 10, R: 2, I: 1 }; e3.Bi = sol(e3.N, e3.L, e3.I); e3.Bc = fin(e3.N, e3.L, e3.R, e3.I, 0); e3.Be = fin(e3.N, e3.L, e3.R, e3.I, e3.L / 2);
  var e4 = { N: 1000, I: 1.5, a: 5, b: 7 }; e4.Ba = tor(e4.N, e4.I, e4.a); e4.Bb = tor(e4.N, e4.I, e4.b); e4.Bm = tor(e4.N, e4.I, 6);

  var ENDS = [
    { see: 'antihorario', right: 'Ese extremo es el polo N: B sale por ahí', why: 'Dedos antihorarios (vistos de frente): el pulgar apunta hacia ti. B sale por ese extremo, que es el polo N.' },
    { see: 'horario', right: 'Ese extremo es el polo S: B entra por ahí', why: 'Dedos horarios (vistos de frente): el pulgar se aleja de ti. B entra por ese extremo, que es el polo S.' }
  ];

  var data = window.SESSION_DATA = {
    slug: 'sesion-09', number: '09', group: 'B · Fuentes de campo',
    title: 'Solenoides y toroides', temario: [],
    minutes: 120,
    quote: 'Enrollar el alambre concentra el campo: dentro de un solenoide largo $B = \\mu_0 n I$, casi uniforme, y dentro de un toroide $B = \\mu_0 N I/2\\pi r$. Afuera, casi nada.',
    badges: [
      'Describir el campo de un solenoide: uniforme adentro, débil afuera, y su parecido con un imán de barra.',
      'Deducir $B = \\mu_0 n I$ con la ley de Ampère y usarla para diseñar un solenoide.',
      'Saber cuándo un solenoide real se parece al ideal y cuánto vale el campo en sus extremos.',
      'Deducir y usar el campo de un toroide, adentro y afuera.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Una espira produce un campo en su eje; muchas espiras juntas, una tras otra, suman sus campos. Eso es un <strong>solenoide</strong>, y con la ley de Ampère su campo sale en un renglón.',
        recall: [
          'El campo de una espira en su eje, $\\frac{\\mu_0 I R^2}{2(z^2 + R^2)^{3/2}}$ (<a href="../sesion-06/">sesión 6</a>).',
          'La ley de Ampère y la elección de una trayectoria con simetría (<a href="../sesion-08/">sesión 8</a>).',
          'Un imán de barra: líneas que salen del polo N y entran por el S (<a href="../sesion-01/">sesión 1</a>).'
        ],
        why: 'Electroimanes, relevadores, timbres, válvulas solenoides de lavadoras y autos, bobinas de bocinas y los imanes de la resonancia magnética son solenoides. Los transformadores y algunos inductores usan toroides.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Enrolla un alambre esmaltado alrededor de un lápiz, unas cien vueltas, y conéctalo a una pila: atrae clips por las puntas, como un imán. Si metes un clavo de hierro adentro, atrae mucho más (eso lo explicamos en la sesión 10).',
          'Adentro de la bobina los campos de todas las vueltas apuntan igual y se suman; afuera, el campo de una vuelta casi se cancela con el de la vuelta del otro lado. Por eso el campo queda «encerrado» en la bobina.'
        ]
      },
      {
        type: 'concept', heading: 'El campo de un solenoide', short: 'El solenoide',
        body: [
          'Un <strong>solenoide</strong> es un alambre enrollado en hélice, con vueltas muy juntas. Si es largo comparado con su radio:<ul><li>adentro, $\\vec B$ es casi <strong>uniforme</strong> y paralelo al eje;</li><li>afuera, $\\vec B$ es muy débil (en el ideal, cero);</li><li>las líneas salen por un extremo y entran por el otro, como en un imán de barra.</li></ul>',
          'El sentido lo da otra vez la mano derecha: <strong>dobla los dedos en el sentido de la corriente en las vueltas y el pulgar apunta como $\\vec B$ adentro</strong>. Ese extremo, por donde salen las líneas, es el polo N.',
          'Lo que importa no es el número total de vueltas sino cuántas hay por metro: la <strong>densidad de vueltas</strong> $n = N/L$.'
        ],
        diagram: 'f3s09-lines',
        caption: 'Adentro, líneas rectas y apretadas; afuera, lazos débiles. Por el extremo derecho salen las líneas: es el polo N.'
      },
      {
        type: 'explainer', heading: 'Ampère en un solenoide ideal', short: 'Ampère en el solenoide',
        title: 'Un solenoide muy largo con n vueltas por metro y corriente I',
        intro: 'Usa como trayectoria un rectángulo con un lado adentro y otro afuera.',
        diagram: 'f3s09-ampere',
        steps: [
          { text: 'Toma el rectángulo abcd: el lado ab, de largo $\\ell$, va adentro y paralelo al eje; el lado cd, afuera. Lo cruzan $n\\ell$ vueltas, cada una con corriente $I$: $I_{\\text{enc}} = n\\ell I$.', state: { k: 1 } },
          { text: 'Lado cd, afuera: en un solenoide ideal $B = 0$ afuera. No aporta.', state: { k: 2 } },
          { text: 'Lados bc y da: adentro $\\vec B$ es paralelo al eje y estos lados son perpendiculares a él; afuera $B = 0$. Tampoco aportan.', state: { k: 3 } },
          { text: 'Lado ab, adentro: $\\vec B$ es paralelo y constante, así que aporta $B\\ell$. Ampère: $B\\ell = \\mu_0 n\\ell I$, y $$B = \\mu_0 n I$$ No depende de dónde esté ab adentro: el campo es uniforme.', state: { k: 4 } }
        ]
      },
      {
        type: 'concept', heading: 'Solenoides reales', short: 'Solenoides reales',
        body: [
          'Un solenoide de largo $L$ y radio $R$ no es infinito. Sumando las espiras con la fórmula de la sesión 6, en su eje $$B(z) = \\frac{\\mu_0 n I}{2}\\left[\\frac{z + L/2}{\\sqrt{(z + L/2)^2 + R^2}} - \\frac{z - L/2}{\\sqrt{(z - L/2)^2 + R^2}}\\right]$$ con $z$ medido desde el centro.',
          '<ul><li>En el centro: $B = \\mu_0 n I\\,\\frac{L}{\\sqrt{L^2 + 4R^2}}$. Si $L = 10R$, ya es el 98 % del ideal.</li><li>En un extremo de un solenoide largo: más o menos la <strong>mitad</strong>, $\\frac{1}{2}\\mu_0 n I$ (del otro lado ya no hay vueltas).</li></ul>',
          'Así que $B = \\mu_0 n I$ es una muy buena aproximación lejos de los extremos de un solenoide largo y delgado.'
        ],
        diagram: 'f3s09-profile',
        caption: 'Entre más largo comparado con su radio, más se parece al ideal.'
      },
      {
        type: 'explainer', heading: 'El toroide', short: 'Toroide',
        title: 'Un toroide de N vueltas, con núcleo entre los radios a y b',
        intro: 'Un toroide es un solenoide doblado en forma de dona. Por simetría, $\\vec B$ es tangente a círculos centrados en el eje del toroide. Usa un círculo de radio $r$.',
        diagram: 'f3s09-toroid',
        steps: [
          { text: '<strong>Dentro del núcleo</strong> ($a < r < b$): el círculo lo atraviesan las $N$ vueltas, cada una con $I$. $B\\cdot 2\\pi r = \\mu_0 N I$ y $$B = \\frac{\\mu_0 N I}{2\\pi r}$$ No es uniforme: es mayor del lado interior.', state: { k: 1 } },
          { text: '<strong>En el hueco</strong> ($r < a$): ninguna corriente atraviesa el círculo. $B = 0$.', state: { k: 2 } },
          { text: '<strong>Afuera</strong> ($r > b$): cada vuelta atraviesa el disco dos veces, una hacia arriba y otra hacia abajo. $I_{\\text{enc}} = 0$ y $B = 0$. El campo de un toroide queda completamente encerrado en su núcleo.', state: { k: 3 } }
        ]
      },
      {
        type: 'callout', heading: 'Toroide delgado = solenoide doblado',
        body: [
          'Si el núcleo es delgado ($b - a \\ll a$), $r$ casi no cambia adentro y $\\frac{N}{2\\pi r}$ es justo el número de vueltas por metro a lo largo del núcleo. Entonces $B = \\mu_0 n I$, igual que el solenoide. La diferencia es que el toroide no tiene extremos: no hay «fuga» de campo.',
          'Con un núcleo de hierro adentro, el campo de un solenoide o un toroide se multiplica cientos o miles de veces. Así funcionan los electroimanes; lo vemos en la <a href="../sesion-10/">sesión 10</a>.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: solenoides y toroides', short: 'Receta',
        steps: [
          { text: 'Solenoide: calcula $n = N/L$ en vueltas por <strong>metro</strong>.', tip: '200 vueltas en 25 cm son 800 vueltas/m, no 8.' },
          { text: 'Adentro de un solenoide largo, lejos de los extremos: $B = \\mu_0 n I$. En un extremo, la mitad.' },
          { text: 'Si el solenoide es corto (L no mucho mayor que R), usa la fórmula del solenoide finito.' },
          { text: 'Toroide: $B = \\mu_0 N I/2\\pi r$ solo si $a < r < b$; en el hueco y afuera, $B = 0$.', tip: 'Usa $N$ total en el toroide; $n$ en el solenoide.' },
          { text: 'Sentido: dedos con la corriente en las vueltas, el pulgar da $\\vec B$ adentro (y el polo N).' }
        ]
      },
      {
        type: 'example', heading: 'Campo dentro de un solenoide',
        problem: '<p>Un solenoide de $' + e1.L + '\\ \\text{cm}$ tiene $' + e1.N + '$ vueltas y lleva $' + e1.I + '\\ \\text{A}$. ¿Cuánto vale $B$ adentro, lejos de los extremos?</p>',
        steps: [
          { text: 'Densidad de vueltas, con el largo en metros.', math: 'n = \\frac{N}{L} = \\frac{' + e1.N + '}{' + fx(e1.L / 100, 2) + '\\ \\text{m}} = ' + fx(e1.n, 0) + '\\ \\text{vueltas/m}' },
          { text: 'Campo del solenoide ideal.', math: 'B = \\mu_0 n I = (4\\pi\\times 10^{-7})(' + fx(e1.n, 0) + ')(' + e1.I + ') = ' + fx(e1.B, 2) + '\\ \\text{mT}' },
          { text: 'Es unas 100 veces el campo de la Tierra, con solo 2 A.' }
        ],
        answer: '$B = ' + fx(e1.B, 2) + '\\ \\text{mT}$.',
        verify: { lab: 'call', mod: 'solenoid', fn: 'idealmT', args: [e1.N, e1.L, e1.I], value: e1.B }
      },
      {
        type: 'example', heading: 'Diseñar un solenoide',
        problem: '<p>Necesitas $' + e2.B + '\\ \\text{mT}$ dentro de un solenoide de $' + e2.L + '\\ \\text{cm}$ con $' + e2.N + '$ vueltas. ¿Qué corriente le das?</p>',
        steps: [
          { text: 'Densidad de vueltas.', math: 'n = \\frac{' + e2.N + '}{' + fx(e2.L / 100, 2) + '} = ' + fx(e2.n, 0) + '\\ \\text{vueltas/m}' },
          { text: 'Despeja $I$ de $B = \\mu_0 n I$.', math: 'I = \\frac{B}{\\mu_0 n} = \\frac{' + fx(e2.B / 1000, 3) + '}{(4\\pi\\times 10^{-7})(' + fx(e2.n, 0) + ')} = ' + fx(e2.I, 2) + '\\ \\text{A}' }
        ],
        answer: '$I = ' + fx(e2.I, 2) + '\\ \\text{A}$.',
        verify: { lab: 'call', mod: 'solenoid', fn: 'currentA', args: [e2.B, e2.N, e2.L], value: e2.I }
      },
      {
        type: 'example', heading: 'Un solenoide corto: centro y extremo',
        problem: '<p>Un solenoide de $' + e3.L + '\\ \\text{cm}$ de largo y $' + e3.R + '\\ \\text{cm}$ de radio tiene $' + e3.N + '$ vueltas y lleva $' + e3.I + '\\ \\text{A}$. Compara el campo en su centro y en un extremo con el ideal.</p>',
        steps: [
          { text: 'Ideal.', math: 'B_{\\text{ideal}} = \\mu_0\\frac{N}{L}I = ' + fx(e3.Bi, 3) + '\\ \\text{mT}' },
          { text: 'Centro ($z = 0$): el paréntesis vale $\\frac{2(L/2)}{\\sqrt{(L/2)^2 + R^2}} = \\frac{L}{\\sqrt{L^2/4 + R^2}}$.', math: 'B_c = \\frac{\\mu_0 n I}{2}\\cdot\\frac{' + e3.L + '}{\\sqrt{' + e3.L / 2 + '^2 + ' + e3.R + '^2}} = ' + fx(e3.Bc, 3) + '\\ \\text{mT}' },
          { text: 'Extremo ($z = L/2$): el segundo término vale cero.', math: 'B_e = \\frac{\\mu_0 n I}{2}\\cdot\\frac{' + e3.L + '}{\\sqrt{' + e3.L + '^2 + ' + e3.R + '^2}} = ' + fx(e3.Be, 3) + '\\ \\text{mT}' },
          { text: 'Con $L/R = ' + e3.L / e3.R + '$, el centro tiene el ' + fx(e3.Bc / e3.Bi * 100, 0) + ' % del ideal y el extremo el ' + fx(e3.Be / e3.Bi * 100, 0) + ' %.' }
        ],
        answer: '$B_c = ' + fx(e3.Bc, 3) + '\\ \\text{mT}$ y $B_e = ' + fx(e3.Be, 3) + '\\ \\text{mT}$ (ideal: $' + fx(e3.Bi, 3) + '\\ \\text{mT}$).',
        verify: { lab: 'call', mod: 'solenoid', fn: 'finitemT', args: [e3.N, e3.L, e3.R, e3.I, 0], value: e3.Bc }
      },
      {
        type: 'example', heading: 'Un toroide',
        problem: '<p>Un toroide de $' + e4.N + '$ vueltas tiene núcleo entre $a = ' + e4.a + '\\ \\text{cm}$ y $b = ' + e4.b + '\\ \\text{cm}$, y lleva $' + e4.I + '\\ \\text{A}$. ¿Cuánto vale $B$ en el radio medio, junto al borde interior y junto al exterior? ¿Y a $10\\ \\text{cm}$ del centro?</p>',
        steps: [
          { text: 'Dentro del núcleo, $B = \\mu_0 N I/2\\pi r$. En el radio medio, $r = 6\\ \\text{cm}$:', math: 'B = \\frac{2\\times 10^{-7}(' + e4.N + ')(' + e4.I + ')}{0.06} = ' + fx(e4.Bm, 2) + '\\ \\text{mT}' },
          { text: 'Junto a los bordes:', math: 'B(a) = ' + fx(e4.Ba, 2) + '\\ \\text{mT} \\qquad B(b) = ' + fx(e4.Bb, 2) + '\\ \\text{mT}' },
          { text: 'A $10\\ \\text{cm}$ estás afuera del núcleo: cada vuelta cruza dos veces el círculo amperiano y $B = 0$.' }
        ],
        answer: '$' + fx(e4.Bm, 2) + '\\ \\text{mT}$ en el radio medio (de $' + fx(e4.Ba, 2) + '$ a $' + fx(e4.Bb, 2) + '\\ \\text{mT}$ en los bordes) y $0$ afuera.',
        verify: { lab: 'call', mod: 'solenoid', fn: 'toroidmT', args: [e4.N, e4.I, 6, e4.a, e4.b], value: e4.Bm }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué el campo dentro del solenoide no depende del radio?', a: 'Para un solenoide ideal (muy largo), Ampère da $B = \\mu_0 n I$ sin que aparezca el radio. El radio solo importa cerca de los extremos o si el solenoide es corto.' },
          { q: '¿Más vueltas siempre dan más campo?', a: 'Lo que cuenta es $n = N/L$. Si agregas vueltas estirando el solenoide al doble, $n$ no cambia y el campo tampoco. Si las agregas en el mismo largo (otra capa), sí aumenta.' },
          { q: '¿El campo afuera de un solenoide real es cero?', a: 'Es pequeño, no cero. Las líneas tienen que regresar por afuera, pero se reparten en un espacio enorme y el campo queda débil.' },
          { q: '¿Por qué el toroide no tiene campo afuera?', a: 'Un círculo afuera atraviesa cada vuelta dos veces en sentidos opuestos: la corriente encerrada es cero. Y por simetría, si la circulación es cero, el campo es cero.' },
          { q: '¿Un solenoide es un imán?', a: 'Su campo afuera es igual al de un imán de barra del mismo tamaño. De hecho, un imán se puede pensar como un solenoide hecho de corrientes atómicas.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Solenoide largo: $B = \\mu_0 n I$ adentro, uniforme y paralelo al eje, con $n = N/L$ en vueltas por metro. Afuera, casi cero.',
          'En el extremo de un solenoide largo, $B \\approx \\frac{1}{2}\\mu_0 n I$; en un solenoide corto, el centro queda por debajo del ideal.',
          'Sentido: dedos con la corriente, el pulgar da $\\vec B$ adentro y el polo N.',
          'Toroide: $B = \\mu_0 N I/2\\pi r$ dentro del núcleo ($a < r < b$); cero en el hueco y afuera.',
          'Un toroide delgado es un solenoide sin extremos.'
        ]
      }
    ],

    lab: {
      type: 'solenoid-toroid', title: 'Solenoides y toroides',
      intro: 'Cambia N, el largo, el radio y la corriente del solenoide y compara el perfil de B en su eje (sumando espira por espira) con el ideal μ₀nI; mira cuánto baja en los extremos. En el modo de toroide, mueve la trayectoria amperiana adentro, en el hueco y afuera. En el reto, el lab te dice si usaste N en lugar de n, si dejaste el largo en centímetros o si confundiste el centro con el extremo.',
      cfg: {}
    },

    formulas: [
      { label: 'Densidad de vueltas', tex: 'n = \\frac{N}{L}' },
      { label: 'Solenoide ideal', tex: 'B = \\mu_0 n I' },
      { label: 'Solenoide finito, en el centro', tex: 'B = \\mu_0 n I\\,\\frac{L}{\\sqrt{L^2 + 4R^2}}' },
      { label: 'Extremo de un solenoide largo', tex: 'B \\approx \\tfrac{1}{2}\\mu_0 n I' },
      { label: 'Toroide', tex: 'B = \\frac{\\mu_0 N I}{2\\pi r}\\ (a < r < b),\\qquad B = 0\\ \\text{fuera}' }
    ],

    exercises: [
      {
        id: 'f3-s09-B', title: 'Campo dentro de un solenoide',
        vars: { N: [100, 1000, 50], L: [10, 50, 5], I: [0.5, 5, 0.5] },
        prompt: function (v) { return '<p>Un solenoide largo de $' + v.L + '\\ \\text{cm}$ tiene $' + v.N + '$ vueltas y lleva $' + fx(v.I, 1) + '\\ \\text{A}$. ¿Cuánto vale $B$ adentro? En mT.</p>'; },
        check: 'numeric', unit: 'mT',
        answer: function (v) { return sol(v.N, v.L, v.I); },
        mistakes: {
          usedN: function (v) { return MU0 * v.N * v.I * 1000; },
          cm: function (v) { return MU0 * (v.N / v.L) * v.I * 1000; }
        },
        feedback: [
          { when: 'usedN', say: 'Usaste $N$; en $B = \\mu_0 n I$ va $n = N/L$, vueltas por metro.' },
          { when: 'cm', say: 'Dejaste el largo en cm. $n$ va en vueltas por metro.' }
        ],
        oracle: { lab: 'call', mod: 'solenoid', fn: 'idealmT', args: function (v) { return [v.N, v.L, v.I]; } },
        hint: '$n = N/L$ con $L$ en metros; $B = \\mu_0 n I$.',
        solution: function (v) { var n = v.N / (v.L / 100); return '$$n = \\frac{' + v.N + '}{' + fx(v.L / 100, 2) + '} = ' + fx(n, 0) + '\\ \\text{m}^{-1},\\qquad B = (4\\pi\\times 10^{-7})(' + fx(n, 0) + ')(' + fx(v.I, 1) + ') = ' + fx(sol(v.N, v.L, v.I), 3) + '\\ \\text{mT}$$'; }
      },
      {
        id: 'f3-s09-I', title: 'Corriente para un campo dado',
        vars: { B: [1, 30, 1], N: [200, 2000, 100], L: [10, 50, 5] },
        prompt: function (v) { return '<p>¿Qué corriente necesita un solenoide largo de $' + v.L + '\\ \\text{cm}$ y $' + v.N + '$ vueltas para tener $' + v.B + '\\ \\text{mT}$ adentro? En A.</p>'; },
        check: 'numeric', unit: 'A',
        answer: function (v) { return v.B / 1000 / (MU0 * v.N / (v.L / 100)); },
        mistakes: {
          cm: function (v) { return v.B / 1000 / (MU0 * v.N / v.L); },
          inverse: function (v) { return MU0 * (v.N / (v.L / 100)) * v.B / 1000; }
        },
        feedback: [
          { when: 'cm', say: 'Pasa el largo a metros para $n$.' },
          { when: 'inverse', say: 'Despejaste al revés: $I = B/(\\mu_0 n)$.' }
        ],
        oracle: { lab: 'call', mod: 'solenoid', fn: 'currentA', args: function (v) { return [v.B, v.N, v.L]; } },
        hint: '$I = B/\\mu_0 n$.',
        solution: function (v) { var n = v.N / (v.L / 100); return '$$I = \\frac{B}{\\mu_0 n} = \\frac{' + fx(v.B / 1000, 3) + '}{(4\\pi\\times 10^{-7})(' + fx(n, 0) + ')} = ' + fx(v.B / 1000 / (MU0 * n), 3) + '\\ \\text{A}$$'; }
      },
      {
        id: 'f3-s09-vueltas', title: '¿Cuántas vueltas?',
        vars: { B: [1, 20, 1], L: [10, 40, 5], I: [1, 5, 0.5] },
        prompt: function (v) { return '<p>Quieres $' + v.B + '\\ \\text{mT}$ dentro de un solenoide de $' + v.L + '\\ \\text{cm}$ con $' + fx(v.I, 1) + '\\ \\text{A}$. ¿Cuántas vueltas necesitas?</p>'; },
        check: 'numeric', unit: 'vueltas',
        answer: function (v) { return v.B / 1000 * (v.L / 100) / (MU0 * v.I); },
        mistakes: { perM: function (v) { return v.B / 1000 / (MU0 * v.I); } },
        feedback: [{ when: 'perM', say: 'Ese es $n$ (vueltas por metro). Multiplica por el largo para tener $N$.' }],
        oracle: { lab: 'call', mod: 'solenoid', fn: 'turnsN', args: function (v) { return [v.B, v.L, v.I]; } },
        hint: '$N = nL = \\frac{BL}{\\mu_0 I}$.',
        solution: function (v) { return '$$N = \\frac{BL}{\\mu_0 I} = \\frac{(' + fx(v.B / 1000, 3) + ')(' + fx(v.L / 100, 2) + ')}{(4\\pi\\times 10^{-7})(' + fx(v.I, 1) + ')} = ' + fx(v.B / 1000 * (v.L / 100) / (MU0 * v.I), 0) + '\\ \\text{vueltas}$$'; }
      },
      {
        id: 'f3-s09-centro', title: 'Solenoide corto: el centro contra el ideal',
        vars: { L: [2, 30, 2], R: [1, 5, 1] },
        prompt: function (v) { return '<p>Un solenoide mide $' + v.L + '\\ \\text{cm}$ de largo y $' + v.R + '\\ \\text{cm}$ de radio. ¿Qué porcentaje del campo ideal $\\mu_0 n I$ tiene en su centro?</p>'; },
        check: 'numeric', unit: '%',
        answer: function (v) { return 100 * v.L / Math.sqrt(v.L * v.L + 4 * v.R * v.R); },
        mistakes: { noFour: function (v) { return 100 * v.L / Math.sqrt(v.L * v.L + v.R * v.R); } },
        feedback: [{ when: 'noFour', say: 'En el centro cada mitad mide $L/2$: el cociente es $L/\\sqrt{L^2 + 4R^2}$.' }],
        where: function (v) { return v.L / v.R <= 15; },
        oracle: { lab: 'value', value: function (v) { var u = v.L / 2; return 100 * u / Math.hypot(u, v.R); } },
        hint: 'En el centro, $B/B_{\\text{ideal}} = \\frac{L}{\\sqrt{L^2 + 4R^2}}$.',
        solution: function (v) { return '$$\\frac{B_c}{\\mu_0 n I} = \\frac{' + v.L + '}{\\sqrt{' + v.L + '^2 + 4(' + v.R + ')^2}} = ' + fx(v.L / Math.sqrt(v.L * v.L + 4 * v.R * v.R), 4) + ' \\Rightarrow ' + fx(100 * v.L / Math.sqrt(v.L * v.L + 4 * v.R * v.R), 1) + '\\ \\%$$'; }
      },
      {
        id: 'f3-s09-toroide', title: 'Campo dentro de un toroide',
        vars: { N: [200, 2000, 100], I: [0.5, 3, 0.5], a: [3, 8, 1], f: [1, 3, 1] },
        prompt: function (v) { var b = v.a + 2, r = v.a + v.f / 2; return '<p>Un toroide de $' + v.N + '$ vueltas, con núcleo entre $' + v.a + '$ y $' + b + '\\ \\text{cm}$, lleva $' + fx(v.I, 1) + '\\ \\text{A}$. ¿Cuánto vale $B$ a $' + fx(r, 1) + '\\ \\text{cm}$ del centro? En mT.</p>'; },
        check: 'numeric', unit: 'mT',
        answer: function (v) { return tor(v.N, v.I, v.a + v.f / 2); },
        mistakes: {
          noTwoPi: function (v) { return MU0 * v.N * v.I / ((v.a + v.f / 2) / 100) * 1000; },
          cm: function (v) { return tor(v.N, v.I, v.a + v.f / 2) / 100; }
        },
        feedback: [
          { when: 'noTwoPi', say: 'El círculo amperiano mide $2\\pi r$: $B = \\mu_0 N I/2\\pi r$.' },
          { when: 'cm', say: 'Pasa $r$ a metros.' }
        ],
        oracle: { lab: 'call', mod: 'solenoid', fn: 'toroidmT', args: function (v) { return [v.N, v.I, v.a + v.f / 2, v.a, v.a + 2]; } },
        hint: 'Dentro del núcleo, $B = \\mu_0 N I/2\\pi r$.',
        solution: function (v) { var r = v.a + v.f / 2; return '$$B = \\frac{\\mu_0 N I}{2\\pi r} = \\frac{2\\times 10^{-7}(' + v.N + ')(' + fx(v.I, 1) + ')}{' + fx(r / 100, 3) + '} = ' + fx(tor(v.N, v.I, r), 3) + '\\ \\text{mT}$$'; }
      },
      {
        id: 'f3-s09-extremo', title: 'En el extremo de un solenoide largo',
        vars: { N: [100, 1000, 100], L: [20, 60, 10], I: [0.5, 5, 0.5] },
        prompt: function (v) { return '<p>Un solenoide largo y delgado de $' + v.L + '\\ \\text{cm}$ tiene $' + v.N + '$ vueltas y lleva $' + fx(v.I, 1) + '\\ \\text{A}$. ¿Cuánto vale aproximadamente $B$ en uno de sus extremos, sobre el eje? En mT.</p>'; },
        check: 'numeric', unit: 'mT',
        answer: function (v) { return sol(v.N, v.L, v.I) / 2; },
        mistakes: { center: function (v) { return sol(v.N, v.L, v.I); } },
        feedback: [{ when: 'center', say: 'Ese es el campo del centro. En un extremo es más o menos la mitad.' }],
        oracle: { lab: 'value', value: function (v) { return 0.5 * 4e-7 * Math.PI * v.N / (v.L / 100) * v.I * 1000; } },
        hint: 'En un extremo solo hay vueltas de un lado: la mitad del campo.',
        solution: function (v) { return '$$B_{\\text{extremo}} \\approx \\tfrac{1}{2}\\mu_0 n I = \\tfrac{1}{2}(' + fx(sol(v.N, v.L, v.I), 3) + '\\ \\text{mT}) = ' + fx(sol(v.N, v.L, v.I) / 2, 3) + '\\ \\text{mT}$$'; }
      },
      {
        id: 'f3-s09-polo', title: 'Concepto: ¿cuál extremo es el polo N?',
        vars: { k: [0, 1, 1] },
        prompt: function (v) { return '<p>Miras un solenoide de frente, por uno de sus extremos, y la corriente en las vueltas gira en sentido ' + ENDS[v.k].see + '. ¿Qué puedes decir de ese extremo?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: ENDS[v.k].right, correct: true },
            { text: ENDS[1 - v.k].right, say: 'Al revés. Dedos con la corriente: el pulgar da B adentro, y B sale por el polo N.' },
            { text: 'No tiene polos: los solenoides no son imanes', say: 'Su campo afuera es como el de un imán de barra, con polos N y S.' }
          ];
        },
        answer: function (v) { return ENDS[v.k].right; },
        hint: 'Mano derecha: dedos con la corriente, el pulgar da B adentro.',
        solution: function (v) { return ENDS[v.k].why; }
      },
      {
        id: 'f3-s09-toro-fuera', title: 'Concepto: afuera del toroide',
        vars: { k: [0, 1, 1] },
        prompt: function (v) { return v.k ? '<p>¿Cuánto vale el campo de un toroide en su hueco central ($r < a$)?</p>' : '<p>¿Cuánto vale el campo de un toroide afuera de él ($r > b$)?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: 'Cero', correct: true },
            { text: '$\\mu_0 N I/2\\pi r$', say: v.k ? 'En el hueco ninguna corriente atraviesa el círculo.' : 'Afuera, cada vuelta cruza el círculo dos veces en sentidos opuestos.' },
            { text: '$\\mu_0 n I$', say: 'Esa es la fórmula del solenoide, y solo vale adentro.' }
          ];
        },
        answer: function () { return 'Cero'; },
        hint: 'Cuenta la corriente neta que atraviesa un círculo en esa región.',
        solution: function (v) { return v.k ? 'En el hueco el círculo no encierra corriente: $B = 0$.' : 'Afuera, $I_{\\text{enc}} = NI - NI = 0$: $B = 0$.'; }
      }
    ],

    quiz: { tags: ['f3.S09'], count: 8 },

    errors: [
      'Usar el número total de vueltas $N$ en $B = \\mu_0 n I$: va $n = N/L$.',
      'Dejar el largo en centímetros al calcular $n$.',
      'Creer que el campo dentro del solenoide depende del radio (en el ideal no).',
      'Dar el campo del centro para un punto en el extremo: ahí es la mitad.',
      'Usar $B = \\mu_0 N I/2\\pi r$ fuera del núcleo del toroide: ahí $B = 0$.',
      'Pensar que el campo dentro del toroide es uniforme: va con $1/r$.',
      'Confundir el polo N del solenoide: es el extremo por donde sale B.'
    ],

    teacher: {
      plan: [
        'Muestra una bobina con clips (o un video) y recuerda el campo de la espira.',
        'Deriva $B = \\mu_0 n I$ con el rectángulo amperiano del explainer.',
        'Compara con solenoides reales usando el perfil de B y el lab (L/R chico contra grande).',
        'Toroide con Ampère: adentro, hueco y afuera. Cierra con el toroide delgado como solenoide doblado.'
      ],
      check: [
        'Que calculen $n$ en vueltas por metro y $B$ dentro de un solenoide.',
        'Que digan cuál extremo es el polo N dado el sentido de la corriente.',
        'Que den el campo de un toroide adentro y afuera.'
      ],
      note: 'El efecto de un núcleo ferromagnético se adelanta en el callout; se trata con $K_m$ en la sesión 10.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 2</em>, §12.6 “Solenoids and Toroids”. <a href="https://openstax.org/books/university-physics-volume-2/pages/12-6-solenoids-and-toroids">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-08',
    next: 'sesion-10'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
