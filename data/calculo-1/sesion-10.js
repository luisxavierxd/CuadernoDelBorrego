/* =====================================================================
   Cálculo 1 · S10 · Integrales directas y cambio de variable (bloque C).
   Fuentes: OpenStax, Calculus Volume 1, §4.10, §5.5, §5.6 y §5.7 (CC BY-NC-SA 4.0).
   Las respuestas se calculan aquí y scripts/examples.test.js las verifica
   contra LabMath (verify / oracle).
   ===================================================================== */
(function () {
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  // Fracción simplificada en LaTeX: frac(6, 4) → \frac{3}{2}; frac(6, 3) → 2
  function frac(p, q) {
    var g = gcd(p, q); p /= g; q /= g;
    if (q < 0) { p = -p; q = -q; }
    return q === 1 ? String(p) : (p < 0 ? '-' : '') + '\\frac{' + Math.abs(p) + '}{' + q + '}';
  }
  function fx(v, d) { return Number(v.toFixed(d == null ? 4 : d)).toString(); }

  var halfLn5 = 0.5 * Math.log(5);

  window.SESSION_DATA = {
    slug: 'sesion-10', number: '10', group: 'C · Integral',
    title: 'Integrales directas y cambio de variable', temario: [],
    minutes: 180,
    quote: 'Integrar es derivar al revés. Y el cambio de variable es la regla de la cadena al revés.',
    badges: [
      'Reconocer las integrales directas de la tabla básica y usar la linealidad.',
      'Elegir $u$ para que $du$ aparezca en el integrando.',
      'Cambiar los límites cuando la integral es definida.',
      'Comprobar cualquier resultado derivándolo.'
    ],

    lesson: [
      {
        "type": "warmup",
        "heading": "Antes de empezar",
        "short": "Antes de empezar",
        "idea": "Integrar es derivar al revés. El <strong>cambio de variable</strong> deshace la regla de la cadena.",
        "recall": [
          "La tabla de derivadas (leída de derecha a izquierda es una tabla de integrales).",
          "La regla de la cadena (S05).",
          "El Teorema Fundamental (S09)."
        ],
        "why": "Con la tabla y el cambio de variable se resuelve la gran mayoría de integrales que aparecen en física, economía y en el resto del curso."
      },
      {
        "type": "concept",
        "heading": "Imagínalo así",
        "short": "Imagínalo así",
        "body": [
          "Si derivar $\\sin(x^2)$ da $2x\\cos(x^2)$ (regla de la cadena), entonces integrar $2x\\cos(x^2)$ tiene que dar $\\sin(x^2)$. El cambio de variable es la forma ordenada de reconocer ese patrón.",
          "La pista es ver una función \"adentro\" de otra y, <em>afuera</em>, la derivada de lo de adentro (o casi, salvo un número). En $2x\\cos(x^2)$, lo de adentro es $x^2$ y afuera está $2x$, que es justo su derivada.",
          "Al llamar $u$ a lo de adentro, la integral fea se convierte en una de la tabla, como $\\int \\cos u\\,du$."
        ]
      },
      {
        type: 'concept', heading: 'Antiderivada e integral indefinida', short: 'Antiderivada',
        body: [
          'Una función $F$ es <strong>antiderivada</strong> de $f$ si $F\'(x) = f(x)$. Por ejemplo, $F(x) = x^3$ es antiderivada de $f(x) = 3x^2$.',
          'Si $F$ funciona, $F + 7$ también: la derivada de una constante es cero. Todas las antiderivadas de $f$ difieren en una constante, y por eso escribimos $$\\int f(x)\\,dx = F(x) + C.$$',
          'En la gráfica: las curvas $F(x) + C$ son la misma curva subida o bajada. En un mismo $x_0$ todas tienen la misma pendiente, $f(x_0)$.'
        ],
        diagram: 'antiderivative-family',
        caption: 'Familia $F(x) = \\tfrac{x^3}{3} - x + C$. Las tangentes verdes en $x_0$ son paralelas.'
      },
      {
        type: 'concept', heading: 'La tabla de integrales directas', short: 'Integrales directas',
        body: [
          'Cada fórmula de derivación leída al revés da una integral directa. Estas son las que vas a usar siempre:'
        ],
        list: [
          '$\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1} + C$, si $n \\neq -1$',
          '$\\int \\dfrac{1}{x}\\,dx = \\ln|x| + C$',
          '$\\int e^x\\,dx = e^x + C$ y $\\int a^x\\,dx = \\dfrac{a^x}{\\ln a} + C$',
          '$\\int \\sin x\\,dx = -\\cos x + C$, $\\int \\cos x\\,dx = \\sin x + C$, $\\int \\sec^2 x\\,dx = \\tan x + C$',
          '$\\int \\dfrac{dx}{1 + x^2} = \\arctan x + C$ y $\\int \\dfrac{dx}{\\sqrt{1 - x^2}} = \\arcsin x + C$',
          '<strong>Linealidad:</strong> las constantes salen de la integral y una suma se integra término a término.'
        ]
      },
      {
        "type": "recipe",
        "heading": "Receta: cambio de variable",
        "short": "Receta",
        "steps": [
          {
            "text": "Elige $u$: lo que está \"adentro\" (del paréntesis, la raíz, el exponente, el argumento)."
          },
          {
            "text": "Calcula $du = u'\\,dx$."
          },
          {
            "text": "Reescribe toda la integral en $u$: no debe quedar ninguna $x$.",
            "tip": "Si sobra un número (por ejemplo tienes $x\\,dx$ y $du = 2x\\,dx$), ajusta: $x\\,dx = \\tfrac{1}{2}du$."
          },
          {
            "text": "Integra con la tabla."
          },
          {
            "text": "Regresa a $x$ sustituyendo $u$. En una definida, mejor cambia los límites a $u$ y ya no regreses."
          },
          {
            "text": "Comprueba derivando."
          }
        ]
      },
      {
        type: 'example', heading: 'Un polinomio, término a término',
        problem: '<p>Calcula $\\displaystyle\\int (3x^2 - 4x + 1)\\,dx$.</p>',
        steps: [
          { text: 'Separa la suma y saca las constantes (linealidad).', math: '\\int 3x^2\\,dx - \\int 4x\\,dx + \\int 1\\,dx = 3\\int x^2\\,dx - 4\\int x\\,dx + \\int dx' },
          { text: 'Aplica la regla de la potencia a cada término: sube el exponente y divide entre el nuevo exponente.', math: '3\\cdot\\frac{x^3}{3} - 4\\cdot\\frac{x^2}{2} + x' },
          { text: 'Simplifica y agrega una sola constante al final.', math: 'x^3 - 2x^2 + x + C' },
          { text: 'Comprueba derivando: $\\frac{d}{dx}(x^3 - 2x^2 + x) = 3x^2 - 4x + 1$. Coincide.' }
        ],
        answer: '$\\displaystyle\\int (3x^2 - 4x + 1)\\,dx = x^3 - 2x^2 + x + C$',
        verify: { lab: 'antiderivative', f: '3x^2 - 4x + 1', F: 'x^3 - 2x^2 + x', a: -1, b: 2 }
      },
      {
        type: 'callout', heading: 'Comprueba siempre derivando',
        body: 'Integrar es difícil; derivar, no. Si la derivada de tu resultado no te regresa el integrando, algo está mal. Eso mismo hace el lab de esta sesión con tu respuesta.'
      },
      {
        type: 'concept', heading: 'Cambio de variable: la regla de la cadena al revés', short: 'Cambio de variable',
        body: [
          'La regla de la cadena dice que $\\frac{d}{dx}F(g(x)) = F\'(g(x))\\,g\'(x)$. Leída al revés: $$\\int f(g(x))\\,g\'(x)\\,dx = F(g(x)) + C.$$',
          'Con $u = g(x)$ y $du = g\'(x)\\,dx$, la integral queda $\\int f(u)\\,du$, que ya es directa. La receta:'
        ],
        list: [
          'Elige $u$: normalmente “lo de adentro” (el argumento de una función, la base de una potencia, un exponente).',
          'Calcula $du = u\'(x)\\,dx$ y busca ese factor en el integrando. Si solo falta una constante, se ajusta.',
          'Reescribe <strong>todo</strong> en $u$, incluido $dx$. No puede quedar ninguna $x$.',
          'Integra en $u$ y regresa a $x$.'
        ],
        teacher: 'Pide que marquen con color $u$ y $du$ dentro del integrando antes de escribir nada. Así se ve de inmediato si la sustitución cierra.'
      },
      {
        type: 'explainer', heading: 'Por qué funciona: el área no cambia', short: 'El área se conserva',
        title: '$u = x^2$ estira el eje',
        intro: 'Mira la integral $\\int_0^{1.6} 2x\\cos(x^2)\\,dx$ como un área. Avanza los pasos.',
        diagram: 'substitution-area',
        steps: [
          { text: 'El área neta bajo $f(x) = 2x\\cos(x^2)$ entre $x = 0$ y $x = 1.6$.', state: { t: 0 } },
          { text: 'Con $u = x^2$, cada tramo $dx$ se estira a $du = 2x\\,dx$: el factor $2x$ deja la altura y se vuelve ancho.', state: { t: 0.5 } },
          { text: 'Queda el área bajo $\\cos u$ entre $u = 0$ y $u = 1.6^2 = 2.56$. Es la misma área neta: $\\sin(2.56) \\approx 0.549$.', state: { t: 1 } }
        ]
      },
      {
        type: 'example', heading: 'Sustitución con coseno',
        problem: '<p>Calcula $\\displaystyle\\int 2x\\cos(x^2)\\,dx$.</p>',
        steps: [
          { text: 'Lo de adentro del coseno es $x^2$. Prueba con $u = x^2$.', math: 'u = x^2 \\quad\\Rightarrow\\quad du = 2x\\,dx' },
          { text: 'El factor $2x\\,dx$ está completo en el integrando: se reemplaza por $du$.', math: '\\int \\cos(x^2)\\,\\underbrace{2x\\,dx}_{du} = \\int \\cos u\\,du' },
          { text: 'Integra en $u$ y regresa a $x$.', math: '\\sin u + C = \\sin(x^2) + C' }
        ],
        answer: '$\\displaystyle\\int 2x\\cos(x^2)\\,dx = \\sin(x^2) + C$',
        verify: { lab: 'antiderivative', f: '2x*cos(x^2)', F: 'sin(x^2)', a: 0, b: 2 }
      },
      {
        type: 'example', heading: 'Cuando falta una constante: $e^{3x}$',
        problem: '<p>Calcula $\\displaystyle\\int e^{3x}\\,dx$.</p>',
        steps: [
          { text: 'Con $u = 3x$ se tiene $du = 3\\,dx$, así que $dx = \\tfrac{1}{3}\\,du$.', math: '\\int e^{3x}\\,dx = \\int e^{u}\\,\\tfrac{1}{3}\\,du = \\tfrac{1}{3}\\int e^u\\,du' },
          { text: 'Integra y regresa a $x$.', math: '\\tfrac{1}{3}e^{u} + C = \\tfrac{1}{3}e^{3x} + C' },
          { text: 'Comprueba: $\\frac{d}{dx}\\left(\\tfrac{1}{3}e^{3x}\\right) = \\tfrac{1}{3}\\cdot 3e^{3x} = e^{3x}$. Si hubieras escrito solo $e^{3x}$, su derivada sería $3e^{3x}$: te sobraría un factor de 3.' }
        ],
        answer: '$\\displaystyle\\int e^{3x}\\,dx = \\tfrac{1}{3}e^{3x} + C$',
        verify: { lab: 'antiderivative', f: 'e^(3x)', F: 'e^(3x)/3', a: -1, b: 1 }
      },
      {
        type: 'example', heading: 'Integral definida: cambia también los límites', short: 'Cambiar los límites',
        problem: '<p>Calcula $\\displaystyle\\int_0^2 \\frac{x}{x^2 + 1}\\,dx$.</p>',
        steps: [
          { text: 'Con $u = x^2 + 1$ se tiene $du = 2x\\,dx$, así que $x\\,dx = \\tfrac{1}{2}\\,du$.' },
          { text: 'Los límites también pasan a $u$: si $x = 0$, $u = 1$; si $x = 2$, $u = 5$.', math: '\\int_0^2 \\frac{x}{x^2+1}\\,dx = \\frac{1}{2}\\int_1^5 \\frac{du}{u}' },
          { text: 'Integra y evalúa en los límites de $u$, sin regresar a $x$.', math: '\\frac{1}{2}\\Big[\\ln u\\Big]_1^5 = \\frac{1}{2}(\\ln 5 - \\ln 1) = \\frac{\\ln 5}{2}' }
        ],
        answer: '$\\displaystyle\\int_0^2 \\frac{x}{x^2+1}\\,dx = \\frac{\\ln 5}{2} \\approx ' + fx(halfLn5) + '$',
        verify: { lab: 'antiderivative', f: 'x/(x^2+1)', F: 'ln(x^2+1)/2', a: 0, b: 2, value: halfLn5 }
      },
      {
        "type": "faq",
        "heading": "Dudas comunes",
        "short": "Dudas comunes",
        "items": [
          {
            "q": "¿Cómo sé qué $u$ elegir?",
            "a": "Busca una función cuya derivada también aparezca (salvo una constante). Si con tu $u$ sigue quedando $x$ después de sustituir, prueba con otra."
          },
          {
            "q": "¿Puedo ajustar cualquier cosa que falte?",
            "a": "Solo constantes. Si falta un número, se compensa; si falta una $x$, ese cambio no sirve."
          },
          {
            "q": "¿Por qué hay que cambiar los límites?",
            "a": "Porque los límites originales son valores de $x$. Si integras en $u$, necesitas los valores de $u$ correspondientes."
          }
        ]
      },
      {
        "type": "recap",
        "heading": "Lo que te llevas",
        "short": "Resumen",
        "points": [
          "Integrar es derivar al revés; siempre puedes comprobar derivando.",
          "Cambio de variable: $u$ = lo de adentro, $du = u'dx$.",
          "Solo se ajustan constantes.",
          "En una definida, cambia también los límites."
        ]
      }
    ],

    lab: {
      type: 'antiderivative-check', title: '¿Es tu antiderivada?',
      intro: 'Escribe la $F(x)$ que obtuviste a mano. El lab la deriva, la compara con $f(x)$ y anima el Teorema Fundamental: si tu $F$ es correcta, el área acumulada bajo $f$ recorre exactamente tu curva. Si no, te dice si fue el signo o un factor.',
      cfg: {}
    },

    formulas: [
      { label: 'Potencia ($n \\neq -1$)', tex: '\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C' },
      { label: 'Recíproco', tex: '\\int \\frac{dx}{x} = \\ln|x| + C' },
      { label: 'Exponencial', tex: '\\int e^{kx}\\,dx = \\frac{e^{kx}}{k} + C' },
      { label: 'Seno y coseno', tex: '\\int \\sin x\\,dx = -\\cos x + C' },
      { label: '', tex: '\\int \\cos x\\,dx = \\sin x + C' },
      { label: 'Arcotangente', tex: '\\int \\frac{dx}{1+x^2} = \\arctan x + C' },
      { label: 'Cambio de variable', tex: '\\int f(g(x))\\,g\'(x)\\,dx = \\int f(u)\\,du' }
    ],

    exercises: [
      {
        id: 'c1-s10-potencia', title: 'Regla de la potencia',
        vars: { a: [2, 9, 1], n: [2, 6, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int ' + v.a + 'x^{' + v.n + '}\\,dx$.</p>'; },
        check: 'expr',
        integrand: function (v) { return v.a + '*x^' + v.n; },
        answer: function (v) { return v.a + '/' + (v.n + 1) + '*x^' + (v.n + 1); },
        mistakes: {
          noDivide: function (v) { return v.a + '*x^' + (v.n + 1); },
          derivative: function (v) { return (v.a * v.n) + '*x^' + (v.n - 1); }
        },
        feedback: [
          { when: 'noDivide', say: 'Subiste el exponente, pero falta dividir entre el nuevo exponente.' },
          { when: 'derivative', say: 'Eso es la derivada, no la integral: al integrar, el exponente sube.' }
        ],
        hint: 'Sube el exponente en 1 y divide entre el nuevo exponente. La constante $a$ se queda afuera.',
        solution: function (v) { return '$$\\int ' + v.a + 'x^{' + v.n + '}\\,dx = ' + v.a + '\\cdot\\frac{x^{' + (v.n + 1) + '}}{' + (v.n + 1) + '} + C = ' + frac(v.a, v.n + 1) + 'x^{' + (v.n + 1) + '} + C$$'; }
      },
      {
        id: 'c1-s10-exponencial', title: 'Exponencial con constante',
        vars: { c: [1, 5, 1], k: [2, 7, 1] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int ' + (v.c === 1 ? '' : v.c) + 'e^{' + v.k + 'x}\\,dx$.</p>'; },
        check: 'expr',
        integrand: function (v) { return v.c + '*e^(' + v.k + 'x)'; },
        answer: function (v) { return v.c + '/' + v.k + '*e^(' + v.k + 'x)'; },
        mistakes: {
          forgotK: function (v) { return v.c + '*e^(' + v.k + 'x)'; },
          multipliedK: function (v) { return (v.c * v.k) + '*e^(' + v.k + 'x)'; }
        },
        feedback: [
          { when: 'forgotK', say: function (v) { return 'Te sobra un factor de ' + v.k + ': con $u = ' + v.k + 'x$, $dx = du/' + v.k + '$. Hay que dividir entre ' + v.k + '.'; } },
          { when: 'multipliedK', say: function (v) { return 'Multiplicaste por ' + v.k + ' (eso hace la derivada). Al integrar se divide entre ' + v.k + '.'; } }
        ],
        hint: 'Usa $u = kx$. Entonces $du = k\\,dx$ y $dx = du/k$.',
        solution: function (v) { return '$$\\int ' + (v.c === 1 ? '' : v.c) + 'e^{' + v.k + 'x}\\,dx = ' + (v.c === 1 ? '' : v.c + '\\cdot') + '\\frac{e^{' + v.k + 'x}}{' + v.k + '} + C = ' + frac(v.c, v.k) + 'e^{' + v.k + 'x} + C$$'; }
      },
      {
        id: 'c1-s10-sustitucion-seno', title: 'Sustitución',
        vars: { c: [2, 8, 2] },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int ' + v.c + 'x\\,\\sin(x^2)\\,dx$.</p>'; },
        check: 'expr',
        integrand: function (v) { return v.c + '*x*sin(x^2)'; },
        answer: function (v) { return '-' + (v.c / 2) + '*cos(x^2)'; },
        mistakes: {
          noHalf: function (v) { return '-' + v.c + '*cos(x^2)'; },
          sign: function (v) { return (v.c / 2) + '*cos(x^2)'; }
        },
        feedback: [
          { when: 'noHalf', say: 'Te faltó el $\\tfrac{1}{2}$: con $u = x^2$, $du = 2x\\,dx$, así que $x\\,dx = du/2$.' },
          { when: 'sign', say: 'Revisa el signo: $\\int \\sin u\\,du = -\\cos u$.' }
        ],
        hint: 'Toma $u = x^2$. ¿Qué parte del integrando se vuelve $du$?',
        solution: function (v) {
          return 'Con $u = x^2$, $du = 2x\\,dx$ y $x\\,dx = \\tfrac{du}{2}$: $$\\int ' + v.c + 'x\\sin(x^2)\\,dx = ' + frac(v.c, 2) + '\\int \\sin u\\,du = -' + frac(v.c, 2) + '\\cos(x^2) + C$$';
        }
      },
      {
        id: 'c1-s10-definida', title: 'Definida con cambio de límites',
        vars: { b: [0.5, 1.5, 0.1] },
        where: function (v) {
          var ans = Math.exp(v.b * v.b) - 1;
          return Math.abs((Math.exp(v.b) - 1) - ans) > 0.05 * ans;
        },
        prompt: function (v) { return '<p>Calcula $\\displaystyle\\int_0^{' + v.b + '} 2x\\,e^{x^2}\\,dx$. Da tu resultado con al menos 3 cifras.</p>'; },
        check: 'numeric', tol: { rel: 0.005 },
        answer: function (v) { return Math.exp(v.b * v.b) - 1; },
        mistakes: {
          forgotLimits: function (v) { return Math.exp(v.b) - 1; },
          forgotLower: function (v) { return Math.exp(v.b * v.b); }
        },
        feedback: [
          { when: 'forgotLimits', say: 'Evaluaste $e^u$ con los límites de $x$. Si $x$ va de 0 a $b$, $u = x^2$ va de 0 a $b^2$.' },
          { when: 'forgotLower', say: 'Falta restar el límite inferior: $e^{0} = 1$.' }
        ],
        oracle: { lab: 'integral', f: function () { return '2x*e^(x^2)'; }, a: function () { return 0; }, b: function (v) { return v.b; } },
        hint: 'Con $u = x^2$, el factor $2x\\,dx$ es justo $du$. No olvides cambiar los límites.',
        solution: function (v) {
          var b2 = +(v.b * v.b).toFixed(2);
          return 'Con $u = x^2$: $x = 0 \\to u = 0$ y $x = ' + v.b + ' \\to u = ' + b2 + '$. $$\\int_0^{' + b2 + '} e^u\\,du = e^{' + b2 + '} - 1 \\approx ' + fx(Math.exp(v.b * v.b) - 1) + '$$';
        }
      },
      {
        id: 'c1-s10-elige-u', title: 'Elige la sustitución',
        vars: { p: [3, 7, 1] },
        prompt: function (v) { return '<p>¿Qué sustitución resuelve más directo $\\displaystyle\\int x^2\\,(x^3 + 1)^{' + v.p + '}\\,dx$?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: '$u = x^3 + 1$', correct: true },
            { text: '$u = x^2$', say: 'Con $u = x^2$, $du = 2x\\,dx$, que no aparece en el integrando.' },
            { text: '$u = (x^3 + 1)^{' + v.p + '}$', say: 'Su $du$ es más complicado que el integrando. Busca lo de adentro de la potencia.' },
            { text: 'Ninguna: hay que desarrollar la potencia', say: 'Se podría, pero serían ' + (v.p + 1) + ' términos. La sustitución lo hace en una línea.' }
          ];
        },
        answer: function () { return '$u = x^3 + 1$'; },
        hint: 'Busca una función “de adentro” cuya derivada aparezca afuera, aunque sea con otra constante.',
        solution: function (v) {
          return 'Con $u = x^3 + 1$, $du = 3x^2\\,dx$, así que $x^2\\,dx = du/3$: $$\\int x^2 (x^3+1)^{' + v.p + '}\\,dx = \\frac{1}{3}\\int u^{' + v.p + '}\\,du = \\frac{(x^3+1)^{' + (v.p + 1) + '}}{' + (3 * (v.p + 1)) + '} + C$$';
        }
      }
    ],

    quiz: { tags: ['c1.S10'], count: 8 },

    errors: [
      'Olvidar la constante $+\\,C$ en una integral indefinida.',
      'Integrar $e^{3x}$ como $e^{3x}$: falta dividir entre 3. Es la regla de la cadena al revés.',
      'Dejar $x$ mezcladas con $u$ después de sustituir. Todo, incluido $dx$, debe quedar en $u$.',
      'En una integral definida, sustituir pero conservar los límites en $x$.',
      'Usar la regla de la potencia con $n = -1$: $\\int \\frac{dx}{x}$ no es $\\frac{x^0}{0}$, es $\\ln|x| + C$.'
    ],

    teacher: {
      plan: [
        'Arranca con la familia $F + C$ y el lab: que vean que derivar es la forma de comprobar.',
        'Tabla directa en 15 minutos; que la reconstruyan leyendo al revés la tabla de derivadas.',
        'Cambio de variable con el explainer del área y los tres ejemplos, en ese orden.'
      ],
      check: [
        'Que marquen $u$ y $du$ en el integrando antes de escribir.',
        'Que en las definidas cambien los límites o regresen a $x$, pero no mezclen.'
      ],
      note: 'Las integrales por partes, trigonométricas y fracciones parciales vienen en S11–S13.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 1</em>, §4.10 “Antiderivatives”. <a href="https://openstax.org/books/calculus-volume-1/pages/4-10-antiderivatives">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 1</em>, §5.5 “Substitution”. <a href="https://openstax.org/books/calculus-volume-1/pages/5-5-substitution">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 1</em>, §5.6 “Integrals Involving Exponential and Logarithmic Functions”. <a href="https://openstax.org/books/calculus-volume-1/pages/5-6-integrals-involving-exponential-and-logarithmic-functions">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 1</em>, §5.7 “Integrals Resulting in Inverse Trigonometric Functions”. <a href="https://openstax.org/books/calculus-volume-1/pages/5-7-integrals-resulting-in-inverse-trigonometric-functions">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-09',
    next: 'sesion-11'
  };
})();
