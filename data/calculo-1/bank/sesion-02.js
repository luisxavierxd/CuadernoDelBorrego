/* =====================================================================
   Banco · Cálculo 1 · S02 · Fórmulas directas de derivación. 100 preguntas propias.
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c1', '02'), D = K.D, N = K.N, C = K.C;
  function fx(v, d) { return Number((+v).toFixed(d == null ? 4 : d)).toString(); }
  var INV = { domain: [-0.8, 0.8] }, POS = { domain: [0.3, 3] }, TRIG = { domain: [-1, 1] };

  var Q = [
    /* ---------- Potencias y polinomios ---------- */
    D('p-xn', 'potencia', 1, { n: [2, 9, 1] }, function (v) { return 'x^{' + v.n + '}'; }, function (v) { return 'x^' + v.n; }, function (v) { return v.n + 'x^' + (v.n - 1); }, 'Regla de la potencia: baja el exponente y réstale 1.'),
    D('p-axn', 'potencia', 1, { a: [2, 9, 1], n: [2, 7, 1] }, function (v) { return v.a + 'x^{' + v.n + '}'; }, function (v) { return v.a + 'x^' + v.n; }, function (v) { return (v.a * v.n) + 'x^' + (v.n - 1); }, 'La constante se queda multiplicando.'),
    D('p-axnbx', 'potencia', 1, { a: [2, 9, 1], n: [3, 7, 1], b: [2, 9, 1] }, function (v) { return v.a + 'x^{' + v.n + '} + ' + v.b + 'x'; }, function (v) { return v.a + 'x^' + v.n + ' + ' + v.b + 'x'; }, function (v) { return (v.a * v.n) + 'x^' + (v.n - 1) + ' + ' + v.b; }, 'Término a término; la derivada de $bx$ es $b$.'),
    D('p-cubica', 'potencia', 1, { a: [2, 9, 1], b: [2, 9, 1], c: [2, 9, 1], d: [1, 9, 1] }, function (v) { return v.a + 'x^3 - ' + v.b + 'x^2 + ' + v.c + 'x - ' + v.d; }, function (v) { return v.a + 'x^3 - ' + v.b + 'x^2 + ' + v.c + 'x - ' + v.d; }, function (v) { return (3 * v.a) + 'x^2 - ' + (2 * v.b) + 'x + ' + v.c; }, 'Cada término por separado; la constante desaparece.'),
    D('p-raiz', 'potencia', 2, { c: [2, 12, 2] }, function (v) { return v.c + '\\sqrt{x}'; }, function (v) { return v.c + 'sqrt(x)'; }, function (v) { return (v.c / 2) + '/sqrt(x)'; }, '$\\sqrt{x} = x^{1/2}$, así que su derivada es $\\tfrac{1}{2}x^{-1/2}$.', POS),
    D('p-cubicaraiz', 'potencia', 2, { a: [3, 12, 3] }, function (v) { return v.a + '\\sqrt[3]{x}'; }, function (v) { return v.a + 'x^(1/3)'; }, function (v) { return (v.a / 3) + '*x^(-2/3)'; }, '$\\sqrt[3]{x} = x^{1/3}$; baja el $\\tfrac{1}{3}$ y resta 1 al exponente.', POS),
    D('p-ax', 'potencia', 2, { a: [2, 9, 1] }, function (v) { return '\\frac{' + v.a + '}{x}'; }, function (v) { return v.a + '/x'; }, function (v) { return '-' + v.a + '/x^2'; }, '$\\tfrac{a}{x} = a\\,x^{-1}$, que deriva a $-a\\,x^{-2}$.', POS),
    D('p-ax2', 'potencia', 2, { a: [2, 9, 1] }, function (v) { return '\\frac{' + v.a + '}{x^2}'; }, function (v) { return v.a + '/x^2'; }, function (v) { return '-' + (2 * v.a) + '/x^3'; }, '$a\\,x^{-2}$ deriva a $-2a\\,x^{-3}$.', POS),
    D('p-axn-neg', 'potencia', 2, { a: [2, 6, 1], n: [3, 6, 1] }, function (v) { return v.a + 'x^{-' + v.n + '}'; }, function (v) { return v.a + 'x^(-' + v.n + ')'; }, function (v) { return '-' + (v.a * v.n) + 'x^(-' + (v.n + 1) + ')'; }, 'Con exponente negativo el nuevo exponente es más negativo: $-n - 1$.', { domain: [0.3, 3], lead: function (v, t) { return 'Encuentra la derivada de la potencia negativa $f(x) = ' + t + '$.'; } }),
    D('p-frac', 'potencia', 2, { a: [2, 8, 2] }, function (v) { return v.a + 'x^{3/2}'; }, function (v) { return v.a + 'x^(3/2)'; }, function (v) { return (1.5 * v.a) + '*x^(1/2)'; }, 'Exponente fraccionario: $\\tfrac{3}{2}x^{1/2}$.', POS),
    D('p-binomio', 'potencia', 2, { a: [1, 6, 1] }, function (v) { return '(x + ' + v.a + ')^2'; }, function (v) { return '(x + ' + v.a + ')^2'; }, function (v) { return '2x + ' + (2 * v.a); }, 'Desarrolla: $x^2 + 2ax + a^2$, y deriva término a término.'),
    D('p-producto', 'potencia', 2, { a: [2, 9, 1] }, function (v) { return 'x^2(x + ' + v.a + ')'; }, function (v) { return 'x^2*(x + ' + v.a + ')'; }, function (v) { return '3x^2 + ' + (2 * v.a) + 'x'; }, 'Desarrolla a $x^3 + ax^2$ antes de derivar.'),
    D('p-cociente', 'potencia', 3, { a: [2, 9, 1] }, function (v) { return '\\frac{x^3 + ' + v.a + '}{x}'; }, function (v) { return '(x^3 + ' + v.a + ')/x'; }, function (v) { return '2x - ' + v.a + '/x^2'; }, 'Divide primero: $x^2 + a\\,x^{-1}$.', POS),
    D('p-raiz-cubo', 'potencia', 3, { a: [2, 8, 2] }, function (v) { return v.a + '\\sqrt{x^3}'; }, function (v) { return v.a + 'sqrt(x^3)'; }, function (v) { return (1.5 * v.a) + '*sqrt(x)'; }, '$\\sqrt{x^3} = x^{3/2}$.', POS),
    D('p-inv-raiz', 'potencia', 3, { a: [2, 12, 2] }, function (v) { return '\\frac{' + v.a + '}{\\sqrt{x}}'; }, function (v) { return v.a + '/sqrt(x)'; }, function (v) { return '-' + (v.a / 2) + '*x^(-3/2)'; }, '$a\\,x^{-1/2}$ deriva a $-\\tfrac{a}{2}x^{-3/2}$.', POS),

    /* ---------- Exponencial y logaritmo ---------- */
    D('e-aex', 'expolog', 1, { a: [2, 9, 1] }, function (v) { return v.a + 'e^x'; }, function (v) { return v.a + 'e^x'; }, function (v) { return v.a + 'e^x'; }, '$e^x$ es su propia derivada.'),
    D('e-ex-xn', 'expolog', 1, { n: [2, 6, 1] }, function (v) { return 'e^x + x^{' + v.n + '}'; }, function (v) { return 'e^x + x^' + v.n; }, function (v) { return 'e^x + ' + v.n + 'x^' + (v.n - 1); }, 'Suma: cada término por su regla.'),
    D('e-bx', 'expolog', 2, { b: [2, 9, 1] }, function (v) { return v.b + '^x'; }, function (v) { return v.b + '^x'; }, function (v) { return v.b + '^x*ln(' + v.b + ')'; }, '$(b^x)\' = b^x\\ln b$.'),
    D('e-aln', 'expolog', 1, { a: [2, 9, 1] }, function (v) { return v.a + '\\ln x'; }, function (v) { return v.a + 'ln(x)'; }, function (v) { return v.a + '/x'; }, '$(\\ln x)\' = 1/x$.', POS),
    D('e-logb', 'expolog', 3, { b: [2, 10, 1] }, function (v) { return '\\log_{' + v.b + '} x'; }, function (v) { return 'ln(x)/ln(' + v.b + ')'; }, function (v) { return '1/(x*ln(' + v.b + '))'; }, '$\\log_b x = \\ln x / \\ln b$, así que su derivada es $\\dfrac{1}{x\\ln b}$.', POS),
    D('e-ex-ln', 'expolog', 2, { a: [2, 9, 1], b: [2, 9, 1] }, function (v) { return v.a + 'e^x - ' + v.b + '\\ln x'; }, function (v) { return v.a + 'e^x - ' + v.b + 'ln(x)'; }, function (v) { return v.a + 'e^x - ' + v.b + '/x'; }, 'Exponencial se queda; logaritmo da $1/x$.', POS),
    D('e-exa', 'expolog', 3, { a: [1, 5, 1] }, function (v) { return 'e^{x + ' + v.a + '}'; }, function (v) { return 'e^(x + ' + v.a + ')'; }, function (v) { return 'e^(x + ' + v.a + ')'; }, '$e^{x + a} = e^a\\,e^x$: la constante $e^a$ se queda.'),
    D('e-lnax', 'expolog', 3, { a: [2, 9, 1] }, function (v) { return '\\ln(' + v.a + 'x)'; }, function (v) { return 'ln(' + v.a + 'x)'; }, function () { return '1/x'; }, '$\\ln(ax) = \\ln a + \\ln x$; la constante $\\ln a$ desaparece.', POS),
    D('e-abx', 'expolog', 2, { a: [2, 9, 1], b: [2, 5, 1] }, function (v) { return v.a + '\\cdot ' + v.b + '^x'; }, function (v) { return v.a + '*' + v.b + '^x'; }, function (v) { return v.a + '*' + v.b + '^x*ln(' + v.b + ')'; }, 'La constante multiplica a $b^x\\ln b$.'),
    D('e-xe', 'expolog', 3, {}, function () { return 'x^{e}'; }, function () { return 'x^e'; }, function () { return 'e*x^(e - 1)'; }, 'Aquí $e$ es un exponente fijo: regla de la potencia, $e\\,x^{e-1}$.', POS),

    /* ---------- Trigonométricas ---------- */
    D('t-asin', 'trig', 1, { a: [2, 9, 1] }, function (v) { return v.a + '\\sin x'; }, function (v) { return v.a + 'sin(x)'; }, function (v) { return v.a + 'cos(x)'; }, '$(\\sin x)\' = \\cos x$.'),
    D('t-acos', 'trig', 1, { a: [2, 9, 1] }, function (v) { return v.a + '\\cos x'; }, function (v) { return v.a + 'cos(x)'; }, function (v) { return '-' + v.a + 'sin(x)'; }, '$(\\cos x)\' = -\\sin x$.'),
    D('t-tan', 'trig', 1, {}, function () { return '\\tan x'; }, function () { return 'tan(x)'; }, function () { return 'sec(x)^2'; }, '$(\\tan x)\' = \\sec^2 x$.', TRIG),
    D('t-sincos', 'trig', 2, { a: [2, 9, 1], b: [2, 9, 1] }, function (v) { return v.a + '\\sin x - ' + v.b + '\\cos x'; }, function (v) { return v.a + 'sin(x) - ' + v.b + 'cos(x)'; }, function (v) { return v.a + 'cos(x) + ' + v.b + 'sin(x)'; }, 'Menos por menos: $-b(\\cos x)\' = b\\sin x$.'),
    D('t-sec', 'trig', 2, {}, function () { return '\\sec x'; }, function () { return 'sec(x)'; }, function () { return 'sec(x)*tan(x)'; }, '$(\\sec x)\' = \\sec x\\tan x$.', TRIG),
    D('t-csc', 'trig', 3, {}, function () { return '\\csc x'; }, function () { return 'csc(x)'; }, function () { return '-csc(x)*cot(x)'; }, '$(\\csc x)\' = -\\csc x\\cot x$: las “co” llevan menos.', { domain: [0.3, 2.8] }),
    D('t-cot', 'trig', 3, {}, function () { return '\\cot x'; }, function () { return 'cot(x)'; }, function () { return '-csc(x)^2'; }, '$(\\cot x)\' = -\\csc^2 x$.', { domain: [0.3, 2.8] }),
    D('t-tanx', 'trig', 2, { a: [2, 9, 1], b: [2, 9, 1] }, function (v) { return v.a + '\\tan x - ' + v.b + 'x'; }, function (v) { return v.a + 'tan(x) - ' + v.b + 'x'; }, function (v) { return v.a + 'sec(x)^2 - ' + v.b; }, 'Tangente da secante al cuadrado; $bx$ da $b$.', TRIG),
    D('t-sinxn', 'trig', 1, { n: [2, 6, 1] }, function (v) { return '\\sin x + x^{' + v.n + '}'; }, function (v) { return 'sin(x) + x^' + v.n; }, function (v) { return 'cos(x) + ' + v.n + 'x^' + (v.n - 1); }, 'Suma de dos derivadas directas.'),
    D('t-secb', 'trig', 2, { a: [2, 9, 1], b: [1, 9, 1] }, function (v) { return v.a + '\\sec x + ' + v.b; }, function (v) { return v.a + 'sec(x) + ' + v.b; }, function (v) { return v.a + 'sec(x)*tan(x)'; }, 'La constante sumada desaparece.', TRIG),
    D('t-cosmsin', 'trig', 1, {}, function () { return '\\cos x - \\sin x'; }, function () { return 'cos(x) - sin(x)'; }, function () { return '-sin(x) - cos(x)'; }, 'Dos derivadas trigonométricas con cuidado en los signos.'),

    /* ---------- Trigonométricas inversas ---------- */
    D('i-asin', 'inversas', 2, {}, function () { return '\\arcsin x'; }, function () { return 'asin(x)'; }, function () { return '1/sqrt(1 - x^2)'; }, '$(\\arcsin x)\' = 1/\\sqrt{1 - x^2}$.', INV),
    D('i-atan', 'inversas', 2, { a: [2, 9, 1] }, function (v) { return v.a + '\\arctan x'; }, function (v) { return v.a + 'atan(x)'; }, function (v) { return v.a + '/(1 + x^2)'; }, '$(\\arctan x)\' = 1/(1 + x^2)$.'),
    D('i-acos', 'inversas', 2, {}, function () { return '\\arccos x'; }, function () { return 'acos(x)'; }, function () { return '-1/sqrt(1 - x^2)'; }, 'Como la del arcoseno, pero con signo menos.', INV),
    D('i-asinbx', 'inversas', 3, { a: [2, 9, 1], b: [2, 9, 1] }, function (v) { return v.a + '\\arcsin x + ' + v.b + 'x'; }, function (v) { return v.a + 'asin(x) + ' + v.b + 'x'; }, function (v) { return v.a + '/sqrt(1 - x^2) + ' + v.b; }, 'Suma de arcoseno y término lineal.', INV),
    D('i-atanln', 'inversas', 3, {}, function () { return '\\arctan x + \\ln x'; }, function () { return 'atan(x) + ln(x)'; }, function () { return '1/(1 + x^2) + 1/x'; }, 'Dos fórmulas directas sumadas.', POS),
    D('i-aacos', 'inversas', 3, { a: [2, 9, 1] }, function (v) { return v.a + '\\arccos x'; }, function (v) { return v.a + 'acos(x)'; }, function (v) { return '-' + v.a + '/sqrt(1 - x^2)'; }, 'La constante multiplica a $-1/\\sqrt{1 - x^2}$.', INV),

    /* ---------- Numéricas ---------- */
    N('n-xn-a', 'potencia', 1, { n: [2, 5, 1], a: [1, 4, 1] }, function (v) { return '¿Cuál es la pendiente de la tangente a $y = x^{' + v.n + '}$ en $x = ' + v.a + '$?'; }, function (v) { return v.n * Math.pow(v.a, v.n - 1); }, 'La pendiente es $f\'(a) = n\\,a^{n-1}$.', { tol: { abs: 0.01 } }),
    N('n-cuadratica', 'potencia', 1, { a: [1, 6, 1], b: [-6, 6, 1], x0: [-3, 3, 1] }, function (v) { return 'Si $f(x) = ' + v.a + 'x^2 + ' + v.b + 'x$, ¿cuánto vale $f\'(' + v.x0 + ')$?'; }, function (v) { return 2 * v.a * v.x0 + v.b; }, '$f\'(x) = 2ax + b$; evalúa.', { tol: { abs: 0.01 } }),
    N('n-raiz', 'potencia', 2, { a: [1, 9, 1] }, function (v) { return 'Si $f(x) = \\sqrt{x}$, ¿cuánto vale $f\'(' + v.a * v.a + ')$?'; }, function (v) { return 1 / (2 * v.a); }, '$f\'(x) = \\dfrac{1}{2\\sqrt{x}}$.', { tol: { abs: 0.001 } }),
    N('n-ex-a', 'expolog', 2, { a: [-2, 2, 0.5] }, function (v) { return '¿Cuál es la pendiente de $y = e^x$ en $x = ' + v.a + '$?'; }, function (v) { return Math.exp(v.a); }, 'La pendiente de $e^x$ es su propio valor.'),
    N('n-ln-a', 'expolog', 1, { a: [2, 10, 1] }, function (v) { return '¿Cuál es la pendiente de $y = \\ln x$ en $x = ' + v.a + '$?'; }, function (v) { return 1 / v.a; }, '$(\\ln x)\' = 1/x$.'),
    N('n-sin0', 'trig', 1, {}, function () { return '¿Cuál es la pendiente de $y = \\sin x$ en $x = 0$?'; }, function () { return 1; }, '$\\cos 0 = 1$.', { tol: { abs: 0.01 } }),
    N('n-cos', 'trig', 2, { k: [2, 6, 1] }, function (v) { return 'Si $f(x) = \\cos x$, ¿cuánto vale $f\'(\\pi/' + v.k + ')$?'; }, function (v) { return -Math.sin(Math.PI / v.k); }, '$f\'(x) = -\\sin x$; evalúa en radianes.', { tol: { abs: 0.005 } }),
    N('n-tan-pi4', 'trig', 2, {}, function () { return '¿Cuál es la pendiente de $y = \\tan x$ en $x = \\pi/4$?'; }, function () { return 2; }, '$\\sec^2(\\pi/4) = 1/\\cos^2(\\pi/4) = 2$.', { tol: { abs: 0.01 } }),
    N('n-atan', 'inversas', 2, { a: [1, 5, 1] }, function (v) { return 'Si $f(x) = \\arctan x$, ¿cuánto vale $f\'(' + v.a + ')$?'; }, function (v) { return 1 / (1 + v.a * v.a); }, '$f\'(x) = 1/(1 + x^2)$.', { tol: { abs: 0.001 } }),
    N('n-bx-0', 'expolog', 2, { b: [2, 10, 1] }, function (v) { return '¿Cuál es la pendiente de $y = ' + v.b + '^x$ en $x = 0$?'; }, function (v) { return Math.log(v.b); }, '$(b^x)\' = b^x\\ln b$ y $b^0 = 1$.'),
    N('n-horizontal', 'potencia', 2, { b: [2, 12, 2] }, function (v) { return '¿En qué $x$ tiene tangente horizontal $y = x^2 - ' + v.b + 'x$?'; }, function (v) { return v.b / 2; }, '$2x - b = 0$.', { tol: { abs: 0.01 } }),
    N('n-cubica-h', 'potencia', 3, { a: [3, 27, 3] }, function (v) { return '¿En qué $x > 0$ tiene tangente horizontal $y = x^3 - ' + v.a + 'x$?'; }, function (v) { return Math.sqrt(v.a / 3); }, '$3x^2 - a = 0 \\Rightarrow x = \\sqrt{a/3}$.'),
    N('n-tan-ex', 'expolog', 3, { a: [-2, 2, 1] }, function (v) { return 'La tangente a $y = e^x$ en $x = ' + v.a + '$ corta al eje $y$ en $(0, b)$. ¿Cuánto vale $b$?'; }, function (v) { return Math.exp(v.a) * (1 - v.a); }, 'La tangente es $y = e^a + e^a(x - a)$; en $x = 0$ vale $e^a(1 - a)$.', { where: function (v) { return v.a !== 1; } }),
    N('n-velocidad', 'reglas', 2, { a: [1, 4, 1], b: [1, 9, 1], t: [1, 4, 1] }, function (v) { return 'Un robot tiene posición $s(t) = ' + v.a + 't^3 + ' + v.b + 't$ metros. ¿Qué velocidad lleva en $t = ' + v.t + '$ s?'; }, function (v) { return 3 * v.a * v.t * v.t + v.b; }, 'La velocidad es $s\'(t) = 3at^2 + b$.', { unit: 'm/s' }),
    N('n-marginal', 'reglas', 2, { a: [100, 500, 50], b: [2, 9, 1], c: [1, 5, 1], x0: [10, 50, 10] }, function (v) { return 'El costo de producir $x$ piezas es $C(x) = ' + v.a + ' + ' + v.b + 'x + 0.0' + v.c + 'x^2$ pesos. ¿Cuánto vale $C\'(' + v.x0 + ')$?'; }, function (v) { return v.b + 2 * (v.c / 100) * v.x0; }, '$C\'(x) = b + 2(0.0c)x$: costo de la siguiente pieza.', { unit: 'pesos/pieza' }),
    N('n-cx', 'potencia', 2, { c: [2, 9, 1], x0: [1, 5, 1] }, function (v) { return 'Si $f(x) = ' + v.c + '/x$, ¿cuánto vale $f\'(' + v.x0 + ')$?'; }, function (v) { return -v.c / (v.x0 * v.x0); }, '$f\'(x) = -c/x^2$.'),
    N('n-asin-half', 'inversas', 3, {}, function () { return '¿Cuánto vale la derivada de $\\arcsin x$ en $x = \\tfrac{1}{2}$?'; }, function () { return 2 / Math.sqrt(3); }, '$1/\\sqrt{1 - 1/4} = 2/\\sqrt{3} \\approx 1.155$.'),
    N('n-x32', 'potencia', 2, { a: [2, 9, 1] }, function (v) { return 'Si $f(x) = ' + v.a + 'x^{3/2}$, ¿cuánto vale $f\'(4)$?'; }, function (v) { return 3 * v.a; }, '$f\'(x) = \\tfrac{3}{2}a\\sqrt{x}$ y $\\sqrt{4} = 2$.', { tol: { abs: 0.01 } }),
    N('n-ln-ek', 'expolog', 3, { k: [1, 3, 1] }, function (v) { return '¿Cuál es la pendiente de $y = \\ln x$ en el punto donde $x = e^{' + v.k + '}$?'; }, function (v) { return Math.exp(-v.k); }, 'La pendiente es $1/x = e^{-k}$.', { tol: { abs: 0.0005 } }),
    N('n-circulo', 'reglas', 2, { r: [1, 10, 1] }, function (v) { return 'El área de un círculo es $A = \\pi r^2$. ¿Qué tan rápido crece el área respecto al radio cuando $r = ' + v.r + '$ cm?'; }, function (v) { return 2 * Math.PI * v.r; }, '$dA/dr = 2\\pi r$: el perímetro.', { unit: 'cm²/cm' }),
    N('n-cubo', 'reglas', 1, { s: [1, 10, 1] }, function (v) { return 'El volumen de un cubo es $V = s^3$. ¿Cuánto vale $dV/ds$ cuando $s = ' + v.s + '$ cm?'; }, function (v) { return 3 * v.s * v.s; }, '$dV/ds = 3s^2$.', { unit: 'cm³/cm', tol: { abs: 0.01 } }),
    N('n-x1', 'potencia', 1, { n: [2, 12, 1] }, function (v) { return '¿Cuánto vale la derivada de $x^{' + v.n + '}$ en $x = 1$?'; }, function (v) { return v.n; }, '$n \\cdot 1^{n-1} = n$.', { tol: { abs: 0.01 } }),
    N('n-busca-a', 'reglas', 3, { k: [2, 20, 2] }, function (v) { return '¿Qué valor de $a$ hace que la pendiente de $y = a x^2$ en $x = 1$ sea $' + v.k + '$?'; }, function (v) { return v.k / 2; }, '$y\'(1) = 2a$; iguala a $k$.', { tol: { abs: 0.01 } }),
    N('n-ex-k', 'expolog', 3, { k: [2, 9, 1] }, function (v) { return '¿En qué $x$ la pendiente de $y = e^x$ vale $' + v.k + '$?'; }, function (v) { return Math.log(v.k); }, '$e^x = k \\Rightarrow x = \\ln k$.'),
    N('n-sec0', 'trig', 2, {}, function () { return '¿Cuál es la pendiente de $y = \\sec x$ en $x = 0$?'; }, function () { return 0; }, '$\\sec 0\\tan 0 = 1\\cdot 0 = 0$.', { tol: { abs: 0.01 } }),
    N('n-lnbx', 'expolog', 2, { a: [2, 9, 1], b: [1, 5, 1], x0: [1, 5, 1] }, function (v) { return 'Si $f(x) = ' + v.a + '\\ln x + ' + v.b + 'x$, ¿cuánto vale $f\'(' + v.x0 + ')$?'; }, function (v) { return v.a / v.x0 + v.b; }, '$f\'(x) = a/x + b$.'),

    /* ---------- Conceptuales ---------- */
    C('k-constante', 'reglas', 1, '¿Cuál es la derivada de una constante?', '0', [['1'], ['La misma constante'], ['No existe']], 'Una constante no cambia: su razón de cambio es cero.'),
    C('k-potencia', 'reglas', 1, '¿Qué dice la regla de la potencia?', '$(x^n)\' = n\\,x^{n-1}$', [['$(x^n)\' = x^{n-1}$'], ['$(x^n)\' = n\\,x^{n}$'], ['$(x^n)\' = \\tfrac{x^{n+1}}{n+1}$']], 'Baja el exponente como factor y réstale 1. La última opción es la integral.'),
    C('k-ex', 'expolog', 1, '¿Cuál es la derivada de $e^x$?', '$e^x$', [['$x\\,e^{x-1}$'], ['$e^{x-1}$'], ['$\\ln x$']], 'La exponencial natural es su propia derivada.'),
    C('k-ln', 'expolog', 1, '¿Cuál es la derivada de $\\ln x$?', '$\\dfrac{1}{x}$', [['$\\ln x$'], ['$e^x$'], ['$\\dfrac{1}{\\ln x}$']], '$(\\ln x)\' = 1/x$ para $x > 0$.'),
    C('k-sin', 'trig', 1, '¿Cuál es la derivada de $\\sin x$?', '$\\cos x$', [['$-\\cos x$'], ['$-\\sin x$'], ['$\\sin x$']], 'Seno pasa a coseno.'),
    C('k-cos', 'trig', 1, '¿Cuál es la derivada de $\\cos x$?', '$-\\sin x$', [['$\\sin x$'], ['$-\\cos x$'], ['$\\sec x$']], 'Coseno pasa a menos seno.'),
    C('k-tan', 'trig', 1, '¿Cuál es la derivada de $\\tan x$?', '$\\sec^2 x$', [['$\\sec x\\tan x$'], ['$-\\csc^2 x$'], ['$\\cot x$']], '$(\\tan x)\' = \\sec^2 x$.'),
    C('k-atan', 'inversas', 1, '¿Cuál es la derivada de $\\arctan x$?', '$\\dfrac{1}{1 + x^2}$', [['$\\dfrac{1}{\\sqrt{1 - x^2}}$'], ['$\\sec^2 x$'], ['$\\dfrac{1}{\\tan x}$']], '$(\\arctan x)\' = 1/(1 + x^2)$.'),
    C('k-acos', 'inversas', 2, '¿Cuál es la derivada de $\\arccos x$?', '$-\\dfrac{1}{\\sqrt{1 - x^2}}$', [['$\\dfrac{1}{\\sqrt{1 - x^2}}$'], ['$-\\sin x$'], ['$\\dfrac{1}{1 + x^2}$']], 'Igual que la del arcoseno, con signo menos.'),
    C('k-ax', 'expolog', 2, '¿Cuál es la derivada de $a^x$ (con $a > 0$ constante)?', '$a^x\\ln a$', [['$x\\,a^{x-1}$'], ['$a^x$'], ['$\\dfrac{a^x}{\\ln a}$']], 'La variable está en el exponente: no es regla de la potencia.'),
    C('k-reescribir', 'reglas', 1, '¿Por qué conviene escribir $\\sqrt{x}$ como $x^{1/2}$ antes de derivar?', 'Para poder usar la regla de la potencia', [['Porque la raíz no tiene derivada'], ['Porque así la derivada sale cero'], ['Solo por estética']], 'Con la forma de potencia aplicas $n\\,x^{n-1}$ directo.'),
    C('k-sube', 'reglas', 2, 'Si $f\'(x) > 0$ en un intervalo, entonces en ese intervalo $f$…', 'es creciente', [['es decreciente'], ['es positiva'], ['tiene un máximo']], 'La derivada es la pendiente: positiva significa que sube.'),
    C('k-horizontal', 'reglas', 1, 'Si $f\'(a) = 0$, la tangente en $x = a$ es…', 'horizontal', [['vertical'], ['inexistente'], ['la recta $y = x$']], 'Pendiente cero: tangente horizontal.'),
    C('k-suma', 'reglas', 1, 'La derivada de una suma es…', 'la suma de las derivadas', [['el producto de las derivadas'], ['la derivada del primer término'], ['siempre cero']], 'La derivación es lineal: $(f + g)\' = f\' + g\'$.'),
    C('k-multiplo', 'reglas', 1, 'Si $c$ es constante, $(c\\,f)\'$ es…', '$c\\,f\'$', [['$c\'\\,f\'$'], ['$f\'$'], ['$c + f\'$']], 'Las constantes multiplicativas salen de la derivada.'),
    C('k-1x', 'potencia', 2, '¿Cuál es la derivada de $\\dfrac{1}{x}$?', '$-\\dfrac{1}{x^2}$', [['$\\dfrac{1}{x^2}$'], ['$\\ln x$'], ['$0$']], '$x^{-1}$ deriva a $-x^{-2}$.'),
    C('k-x', 'reglas', 1, '¿Cuál es la derivada de $f(x) = x$?', '1', [['0'], ['$x$'], ['$\\tfrac{x^2}{2}$']], 'Es una recta de pendiente 1.'),
    C('k-5-5x', 'reglas', 2, '¿Cuáles son las derivadas de $5$ y de $5x$?', '$0$ y $5$', [['$5$ y $5$'], ['$0$ y $0$'], ['$5$ y $5x$']], 'La constante no cambia; $5x$ es una recta de pendiente 5.'),
    C('k-propia', 'expolog', 1, '¿Qué función es igual a su propia derivada?', '$e^x$', [['$\\ln x$'], ['$x^2$'], ['$\\sin x$']], '$(e^x)\' = e^x$.'),
    C('k-radianes', 'trig', 2, 'Las fórmulas $(\\sin x)\' = \\cos x$ y compañía valen cuando $x$ está en…', 'radianes', [['grados'], ['cualquier unidad'], ['porcentaje']], 'En grados aparecería un factor $\\pi/180$.'),
    C('k-log10', 'expolog', 2, '¿Cuál es la derivada de $\\log_{10} x$?', '$\\dfrac{1}{x\\ln 10}$', [['$\\dfrac{1}{x}$'], ['$\\dfrac{\\ln 10}{x}$'], ['$10^x$']], '$\\log_{10}x = \\ln x/\\ln 10$.'),
    C('k-ax-error', 'expolog', 2, '¿Por qué $(2^x)\' \\neq x\\,2^{x-1}$?', 'Porque la variable está en el exponente, no en la base', [['Porque 2 es par'], ['Porque sí lo es'], ['Porque falta sumar C']], 'La regla de la potencia es para $x^n$ con $n$ fijo.'),
    C('k-e2', 'expolog', 2, '¿Cuál es la derivada de $e^2$?', '0', [['$e^2$'], ['$2e$'], ['$2e^2$']], '$e^2$ es un número fijo, no depende de $x$.'),
    C('k-pix', 'reglas', 2, '¿Cuál es la derivada de $\\pi x$?', '$\\pi$', [['$0$'], ['$\\pi x$'], ['$1$']], '$\\pi$ es una constante que multiplica a $x$.'),
    C('k-recta', 'reglas', 1, 'Si $f(x) = 3x - 7$, ¿cuánto vale $f\'(x)$?', '3', [['$-7$'], ['$3x$'], ['0']], 'La derivada de una recta es su pendiente, en todos los puntos.'),
    C('k-grado', 'reglas', 2, 'Si $f$ es un polinomio de grado 5, su derivada es un polinomio de grado…', '4', [['5'], ['6'], ['Depende de los coeficientes']], 'Cada término baja un grado.'),
    C('k-csc', 'trig', 2, '¿Cuál es la derivada de $\\csc x$?', '$-\\csc x\\cot x$', [['$\\csc x\\cot x$'], ['$-\\csc^2 x$'], ['$\\sec x\\tan x$']], 'Las “co” llevan signo menos.'),
    C('k-sec', 'trig', 2, '¿Cuál es la derivada de $\\sec x$?', '$\\sec x\\tan x$', [['$\\sec^2 x$'], ['$-\\sec x\\tan x$'], ['$\\tan^2 x$']], '$(\\sec x)\' = \\sec x\\tan x$.'),
    C('k-asin-dom', 'inversas', 2, '¿Para qué valores existe la derivada de $\\arcsin x$?', '$-1 < x < 1$', [['Para todo $x$'], ['$x > 0$'], ['$x \\neq 0$']], 'En $\\pm 1$ el denominador $\\sqrt{1 - x^2}$ vale cero.'),
    C('k-nombre', 'reglas', 1, '¿Qué regla usas para derivar $x^7$?', 'La regla de la potencia', [['La regla del producto'], ['La regla de la cadena'], ['La definición con límites, obligatoriamente']], '$(x^7)\' = 7x^6$ directo.'),
    C('k-xmedio', 'potencia', 2, '¿Cuál es la derivada de $x^{-1/2}$?', '$-\\tfrac{1}{2}x^{-3/2}$', [['$-\\tfrac{1}{2}x^{-1/2}$'], ['$\\tfrac{1}{2}x^{1/2}$'], ['$-2x^{-3/2}$']], 'Baja $-\\tfrac{1}{2}$ y resta 1: $-\\tfrac{3}{2}$.'),
    C('k-abs', 'reglas', 2, '¿Existe la derivada de $f(x) = |x|$ en $x = 0$?', 'No: las pendientes por la izquierda y por la derecha no coinciden', [['Sí, vale 0'], ['Sí, vale 1'], ['Sí, vale −1']], 'Hay un pico: por la izquierda la pendiente es −1 y por la derecha, 1.')
  ];

  K.register({
    'c1.S02.potencia': 'Potencias, raíces y polinomios',
    'c1.S02.expolog': 'Exponenciales y logaritmos',
    'c1.S02.trig': 'Trigonométricas',
    'c1.S02.inversas': 'Trigonométricas inversas',
    'c1.S02.reglas': 'Reglas básicas y significado'
  }, Q);
})();
