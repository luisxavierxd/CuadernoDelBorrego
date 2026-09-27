/* =====================================================================
   Banco · Cálculo 1 · S03 · Regla del producto. 100 preguntas propias.
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c1', '03'), D = K.D, N = K.N, C = K.C;
  var POS = { domain: [0.3, 3] }, INV = { domain: [-0.8, 0.8] }, TRIG = { domain: [-1, 1] };
  var PROD = 'Regla del producto: $u\'v + uv\'$.';

  var Q = [
    /* ---------- Productos de polinomios ---------- */
    D('p-xa-xb', 'polinomios', 1, { a: [1, 9, 1], b: [1, 9, 1] }, function (v) { return '(x + ' + v.a + ')(x + ' + v.b + ')'; }, function (v) { return '(x + ' + v.a + ')*(x + ' + v.b + ')'; }, function (v) { return '2x + ' + (v.a + v.b); }, PROD + ' Con dos rectas: $(x + b) + (x + a)$.'),
    D('p-x2a-xb', 'polinomios', 1, { a: [1, 9, 1], b: [1, 9, 1] }, function (v) { return '(x^2 + ' + v.a + ')(x - ' + v.b + ')'; }, function (v) { return '(x^2 + ' + v.a + ')*(x - ' + v.b + ')'; }, function (v) { return '2x*(x - ' + v.b + ') + (x^2 + ' + v.a + ')'; }, PROD),
    D('p-lineales', 'polinomios', 1, { a: [2, 6, 1], b: [1, 9, 1], c: [2, 6, 1], d: [1, 9, 1] }, function (v) { return '(' + v.a + 'x + ' + v.b + ')(' + v.c + 'x + ' + v.d + ')'; }, function (v) { return '(' + v.a + 'x + ' + v.b + ')*(' + v.c + 'x + ' + v.d + ')'; }, function (v) { return v.a + '*(' + v.c + 'x + ' + v.d + ') + ' + v.c + '*(' + v.a + 'x + ' + v.b + ')'; }, PROD),
    D('p-x2-x3', 'polinomios', 1, { a: [1, 9, 1] }, function (v) { return 'x^2(x^3 + ' + v.a + ')'; }, function (v) { return 'x^2*(x^3 + ' + v.a + ')'; }, function (v) { return '5x^4 + ' + (2 * v.a) + 'x'; }, PROD + ' O desarrolla: $x^5 + ax^2$.'),
    D('p-cuarticas', 'polinomios', 2, { a: [1, 9, 1], b: [1, 9, 1] }, function (v) { return '(x^2 + ' + v.a + ')(x^2 + ' + v.b + ')'; }, function (v) { return '(x^2 + ' + v.a + ')*(x^2 + ' + v.b + ')'; }, function (v) { return '2x*(x^2 + ' + v.b + ') + 2x*(x^2 + ' + v.a + ')'; }, PROD),
    D('p-raiz-lineal', 'polinomios', 2, { a: [1, 9, 1] }, function (v) { return '\\sqrt{x}\\,(x + ' + v.a + ')'; }, function (v) { return 'sqrt(x)*(x + ' + v.a + ')'; }, function (v) { return '(x + ' + v.a + ')/(2sqrt(x)) + sqrt(x)'; }, PROD + ' Con $(\\sqrt{x})\' = \\tfrac{1}{2\\sqrt{x}}$.', POS),
    D('p-xn-lineal', 'polinomios', 2, { n: [3, 6, 1], a: [1, 9, 1] }, function (v) { return 'x^{' + v.n + '}(x + ' + v.a + ')'; }, function (v) { return 'x^' + v.n + '*(x + ' + v.a + ')'; }, function (v) { return v.n + 'x^' + (v.n - 1) + '*(x + ' + v.a + ') + x^' + v.n; }, PROD),
    D('p-cubica-cuad', 'polinomios', 2, { a: [1, 9, 1], b: [2, 6, 1] }, function (v) { return '(x^3 - ' + v.a + ')(' + v.b + 'x^2 + 1)'; }, function (v) { return '(x^3 - ' + v.a + ')*(' + v.b + 'x^2 + 1)'; }, function (v) { return '3x^2*(' + v.b + 'x^2 + 1) + (x^3 - ' + v.a + ')*' + (2 * v.b) + 'x'; }, PROD),
    D('p-inv-cuad', 'polinomios', 2, { a: [1, 9, 1] }, function (v) { return '\\frac{1}{x}\\,(x^2 + ' + v.a + ')'; }, function (v) { return '(1/x)*(x^2 + ' + v.a + ')'; }, function (v) { return '1 - ' + v.a + '/x^2'; }, 'Producto o simplificación: $x + a\\,x^{-1}$.', POS),
    D('p-x32', 'polinomios', 3, { a: [1, 9, 1] }, function (v) { return 'x^{3/2}(x - ' + v.a + ')'; }, function (v) { return 'x^(3/2)*(x - ' + v.a + ')'; }, function (v) { return '1.5*x^(1/2)*(x - ' + v.a + ') + x^(3/2)'; }, PROD + ' Con $(x^{3/2})\' = \\tfrac{3}{2}x^{1/2}$.', POS),

    /* ---------- Con funciones trascendentes ---------- */
    D('t-xex', 'trascendentes', 1, {}, function () { return 'x\\,e^x'; }, function () { return 'x*e^x'; }, function () { return 'e^x + x*e^x'; }, PROD),
    D('t-x2ex', 'trascendentes', 1, {}, function () { return 'x^2 e^x'; }, function () { return 'x^2*e^x'; }, function () { return '2x*e^x + x^2*e^x'; }, PROD),
    D('t-xnex', 'trascendentes', 2, { n: [3, 7, 1] }, function (v) { return 'x^{' + v.n + '}e^x'; }, function (v) { return 'x^' + v.n + '*e^x'; }, function (v) { return v.n + 'x^' + (v.n - 1) + '*e^x + x^' + v.n + '*e^x'; }, PROD),
    D('t-xsin', 'trascendentes', 1, {}, function () { return 'x\\sin x'; }, function () { return 'x*sin(x)'; }, function () { return 'sin(x) + x*cos(x)'; }, PROD),
    D('t-xcos', 'trascendentes', 1, {}, function () { return 'x\\cos x'; }, function () { return 'x*cos(x)'; }, function () { return 'cos(x) - x*sin(x)'; }, PROD + ' Ojo con el signo de $(\\cos x)\'$.'),
    D('t-x2sin', 'trascendentes', 2, { a: [2, 9, 1] }, function (v) { return v.a + 'x^2\\sin x'; }, function (v) { return v.a + 'x^2*sin(x)'; }, function (v) { return (2 * v.a) + 'x*sin(x) + ' + v.a + 'x^2*cos(x)'; }, PROD),
    D('t-x2cos', 'trascendentes', 2, { a: [2, 9, 1] }, function (v) { return v.a + 'x^2\\cos x'; }, function (v) { return v.a + 'x^2*cos(x)'; }, function (v) { return (2 * v.a) + 'x*cos(x) - ' + v.a + 'x^2*sin(x)'; }, PROD),
    D('t-xln', 'trascendentes', 1, {}, function () { return 'x\\ln x'; }, function () { return 'x*ln(x)'; }, function () { return 'ln(x) + 1'; }, PROD + ' El segundo término: $x\\cdot\\tfrac{1}{x} = 1$.', POS),
    D('t-x2ln', 'trascendentes', 2, {}, function () { return 'x^2\\ln x'; }, function () { return 'x^2*ln(x)'; }, function () { return '2x*ln(x) + x'; }, PROD, POS),
    D('t-exsin', 'trascendentes', 2, {}, function () { return 'e^x\\sin x'; }, function () { return 'e^x*sin(x)'; }, function () { return 'e^x*sin(x) + e^x*cos(x)'; }, PROD),
    D('t-excos', 'trascendentes', 2, {}, function () { return 'e^x\\cos x'; }, function () { return 'e^x*cos(x)'; }, function () { return 'e^x*cos(x) - e^x*sin(x)'; }, PROD),
    D('t-sincos', 'trascendentes', 2, {}, function () { return '\\sin x\\cos x'; }, function () { return 'sin(x)*cos(x)'; }, function () { return 'cos(x)^2 - sin(x)^2'; }, PROD + ' Queda $\\cos^2 x - \\sin^2 x = \\cos 2x$.'),
    D('t-raizex', 'trascendentes', 3, {}, function () { return '\\sqrt{x}\\,e^x'; }, function () { return 'sqrt(x)*e^x'; }, function () { return 'e^x/(2sqrt(x)) + sqrt(x)*e^x'; }, PROD, POS),
    D('t-xnln', 'trascendentes', 2, { n: [3, 6, 1] }, function (v) { return 'x^{' + v.n + '}\\ln x'; }, function (v) { return 'x^' + v.n + '*ln(x)'; }, function (v) { return v.n + 'x^' + (v.n - 1) + '*ln(x) + x^' + (v.n - 1); }, PROD, POS),
    D('t-lnsin', 'trascendentes', 3, {}, function () { return '\\ln x\\,\\sin x'; }, function () { return 'ln(x)*sin(x)'; }, function () { return 'sin(x)/x + ln(x)*cos(x)'; }, PROD, POS),
    D('t-exln', 'trascendentes', 2, {}, function () { return 'e^x\\ln x'; }, function () { return 'e^x*ln(x)'; }, function () { return 'e^x*ln(x) + e^x/x'; }, PROD, POS),
    D('t-xtan', 'trascendentes', 2, {}, function () { return 'x\\tan x'; }, function () { return 'x*tan(x)'; }, function () { return 'tan(x) + x*sec(x)^2'; }, PROD, TRIG),
    D('t-xatan', 'trascendentes', 3, { a: [2, 9, 1] }, function (v) { return v.a + 'x\\arctan x'; }, function (v) { return v.a + 'x*atan(x)'; }, function (v) { return v.a + '*atan(x) + ' + v.a + 'x/(1 + x^2)'; }, PROD),
    D('t-xasin', 'trascendentes', 3, {}, function () { return 'x\\arcsin x'; }, function () { return 'x*asin(x)'; }, function () { return 'asin(x) + x/sqrt(1 - x^2)'; }, PROD, INV),
    D('t-sin2', 'trascendentes', 2, {}, function () { return '\\sin^2 x'; }, function () { return 'sin(x)^2'; }, function () { return '2sin(x)*cos(x)'; }, 'Como producto $\\sin x\\cdot\\sin x$: $2\\sin x\\cos x$.', { lead: function (v, t) { return 'Escribe $' + t + '$ como $\\sin x\\cdot\\sin x$ y deriva.'; } }),
    D('t-ex-x', 'trascendentes', 3, {}, function () { return 'e^x\\,x^{-1}'; }, function () { return 'e^x*x^(-1)'; }, function () { return 'e^x/x - e^x/x^2'; }, PROD + ' Con $(x^{-1})\' = -x^{-2}$.', POS),
    D('t-cosln', 'trascendentes', 3, {}, function () { return '\\cos x\\,\\ln x'; }, function () { return 'cos(x)*ln(x)'; }, function () { return '-sin(x)*ln(x) + cos(x)/x'; }, PROD, POS),

    /* ---------- Tres factores ---------- */
    D('3-xexsin', 'tres', 3, {}, function () { return 'x\\,e^x\\sin x'; }, function () { return 'x*e^x*sin(x)'; }, function () { return 'e^x*sin(x) + x*e^x*sin(x) + x*e^x*cos(x)'; }, 'Tres términos: cada factor se deriva una vez.'),
    D('3-x2exln', 'tres', 3, {}, function () { return 'x^2 e^x\\ln x'; }, function () { return 'x^2*e^x*ln(x)'; }, function () { return '2x*e^x*ln(x) + x^2*e^x*ln(x) + x*e^x'; }, 'Tres términos: $u\'vw + uv\'w + uvw\'$.', POS),
    D('3-xsincos', 'tres', 3, {}, function () { return 'x\\sin x\\cos x'; }, function () { return 'x*sin(x)*cos(x)'; }, function () { return 'sin(x)*cos(x) + x*cos(x)^2 - x*sin(x)^2'; }, 'Tres factores; el último término lleva $-\\sin x$.'),
    D('3-lineales', 'tres', 2, { a: [1, 5, 1] }, function (v) { return '(x + 1)(x + 2)(x + ' + (v.a + 2) + ')'; }, function (v) { return '(x + 1)*(x + 2)*(x + ' + (v.a + 2) + ')'; }, function (v) { return '(x + 2)*(x + ' + (v.a + 2) + ') + (x + 1)*(x + ' + (v.a + 2) + ') + (x + 1)*(x + 2)'; }, 'Cada término deja fijos dos factores y deriva el tercero (que da 1).'),
    D('3-xexln', 'tres', 3, {}, function () { return 'x\\,e^x\\ln x'; }, function () { return 'x*e^x*ln(x)'; }, function () { return 'e^x*ln(x) + x*e^x*ln(x) + e^x'; }, 'El tercer término: $x\\,e^x\\cdot\\tfrac{1}{x} = e^x$.', POS),
    D('3-exsincos', 'tres', 3, {}, function () { return 'e^x\\sin x\\cos x'; }, function () { return 'e^x*sin(x)*cos(x)'; }, function () { return 'e^x*sin(x)*cos(x) + e^x*cos(x)^2 - e^x*sin(x)^2'; }, 'Tres factores; cuida el signo de $(\\cos x)\'$.'),

    /* ---------- Numéricas ---------- */
    N('n-tabla', 'aplicaciones', 2, { u: [-3, 5, 1], du: [-2, 4, 1], w: [1, 6, 1], dw: [-3, 4, 1] }, function (v) { return '$u(1) = ' + v.u + '$, $u\'(1) = ' + v.du + '$, $w(1) = ' + v.w + '$, $w\'(1) = ' + v.dw + '$. ¿Cuánto vale $(uw)\'(1)$?'; }, function (v) { return v.du * v.w + v.u * v.dw; }, PROD, { tol: { abs: 0.01 }, where: function (v) { return v.du * v.w + v.u * v.dw !== v.du * v.dw; }, mistakes: { productOfDerivs: function (v) { return v.du * v.dw; } }, feedback: [{ when: 'productOfDerivs', say: 'Multiplicaste las derivadas.' }] }),
    N('n-tabla-3u', 'aplicaciones', 2, { u: [-3, 5, 1], du: [-2, 4, 1], w: [1, 6, 1], dw: [-3, 4, 1] }, function (v) { return 'Si $f = 3\\,u\\,w$ con $u(0) = ' + v.u + '$, $u\'(0) = ' + v.du + '$, $w(0) = ' + v.w + '$, $w\'(0) = ' + v.dw + '$, ¿cuánto vale $f\'(0)$?'; }, function (v) { return 3 * (v.du * v.w + v.u * v.dw); }, 'La constante 3 multiplica a la regla del producto.', { tol: { abs: 0.01 } }),
    N('n-xu', 'aplicaciones', 2, { u: [-4, 6, 1], du: [-3, 5, 1] }, function (v) { return 'Si $g(x) = x\\,u(x)$, $u(2) = ' + v.u + '$ y $u\'(2) = ' + v.du + '$, ¿cuánto vale $g\'(2)$?'; }, function (v) { return v.u + 2 * v.du; }, '$g\'(x) = u(x) + x\\,u\'(x)$.', { tol: { abs: 0.01 } }),
    N('n-u2', 'aplicaciones', 3, { u: [-4, 6, 1], du: [-3, 5, 1] }, function (v) { return 'Si $h = u^2$ (es decir $u\\cdot u$), $u(3) = ' + v.u + '$ y $u\'(3) = ' + v.du + '$, ¿cuánto vale $h\'(3)$?'; }, function (v) { return 2 * v.u * v.du; }, '$(u\\cdot u)\' = u\'u + uu\' = 2uu\'$.', { tol: { abs: 0.01 } }),
    N('n-xex-a', 'trascendentes', 1, { a: [-2, 2, 1] }, function (v) { return 'Si $f(x) = x\\,e^x$, ¿cuánto vale $f\'(' + v.a + ')$?'; }, function (v) { return Math.exp(v.a) * (1 + v.a); }, '$f\'(x) = e^x(1 + x)$.', { tol: { abs: 0.005 } }),
    N('n-xln-a', 'trascendentes', 2, { a: [2, 9, 1] }, function (v) { return 'Si $f(x) = x\\ln x$, ¿cuánto vale $f\'(' + v.a + ')$?'; }, function (v) { return Math.log(v.a) + 1; }, '$f\'(x) = \\ln x + 1$.'),
    N('n-xsin-pi2', 'trascendentes', 2, {}, function () { return 'Si $f(x) = x\\sin x$, ¿cuánto vale $f\'(\\pi/2)$?'; }, function () { return 1; }, '$\\sin(\\pi/2) + \\tfrac{\\pi}{2}\\cos(\\pi/2) = 1$.', { tol: { abs: 0.01 } }),
    N('n-x2ex-0', 'trascendentes', 2, {}, function () { return 'Si $f(x) = x^2 e^x$, ¿cuánto vale $f\'(0)$?'; }, function () { return 0; }, '$f\'(x) = e^x(2x + x^2)$ y en 0 vale 0.', { tol: { abs: 0.01 } }),
    N('n-h-xex', 'trascendentes', 2, {}, function () { return '¿En qué $x$ tiene tangente horizontal $y = x\\,e^x$?'; }, function () { return -1; }, '$e^x(1 + x) = 0 \\Rightarrow x = -1$.', { tol: { abs: 0.01 } }),
    N('n-h-x2ex', 'trascendentes', 3, {}, function () { return 'Además de $x = 0$, ¿en qué otro $x$ tiene tangente horizontal $y = x^2 e^x$?'; }, function () { return -2; }, '$e^x\\,x(2 + x) = 0 \\Rightarrow x = 0$ o $x = -2$.', { tol: { abs: 0.01 } }),
    N('n-h-xln', 'trascendentes', 3, {}, function () { return '¿En qué $x$ tiene tangente horizontal $y = x\\ln x$?'; }, function () { return Math.exp(-1); }, '$\\ln x + 1 = 0 \\Rightarrow x = e^{-1} \\approx 0.368$.'),
    N('n-lineales-0', 'polinomios', 1, { a: [1, 9, 1], b: [1, 9, 1] }, function (v) { return 'Si $f(x) = (x + ' + v.a + ')(x + ' + v.b + ')$, ¿cuánto vale $f\'(0)$?'; }, function (v) { return v.a + v.b; }, '$f\'(x) = 2x + a + b$.', { tol: { abs: 0.01 } }),
    N('n-x2-lineal', 'polinomios', 1, { a: [1, 9, 1], x0: [1, 4, 1] }, function (v) { return 'Si $f(x) = x^2(x + ' + v.a + ')$, ¿cuánto vale $f\'(' + v.x0 + ')$?'; }, function (v) { return 3 * v.x0 * v.x0 + 2 * v.a * v.x0; }, '$f\'(x) = 3x^2 + 2ax$.', { tol: { abs: 0.01 } }),
    N('n-tan-b', 'trascendentes', 3, { a: [-2, 2, 1] }, function (v) { return 'La tangente a $y = x\\,e^x$ en $x = ' + v.a + '$ corta al eje $y$ en $(0, b)$. ¿Cuánto vale $b$?'; }, function (v) { return -v.a * v.a * Math.exp(v.a); }, '$b = f(a) - a\\,f\'(a) = a e^a - a e^a(1 + a) = -a^2e^a$.', { tol: { abs: 0.005 }, where: function (v) { return v.a !== 0; } }),
    N('n-ingreso', 'aplicaciones', 2, { a: [50, 200, 10], b: [1, 5, 1], x0: [5, 20, 5] }, function (v) { return 'El precio de venta es $p(x) = ' + v.a + ' - ' + v.b + 'x$ pesos al vender $x$ piezas, y el ingreso es $R(x) = x\\,p(x)$. ¿Cuánto vale $R\'(' + v.x0 + ')$?'; }, function (v) { return v.a - 2 * v.b * v.x0; }, '$R\'(x) = p(x) + x\\,p\'(x) = a - 2bx$.', { unit: 'pesos/pieza', tol: { abs: 0.01 } }),
    N('n-ingreso-tabla', 'aplicaciones', 2, { p: [80, 150, 10], dp: [-4, -1, 1] }, function (v) { return 'El ingreso es $R(x) = x\\,p(x)$. Si $p(10) = ' + v.p + '$ y $p\'(10) = ' + v.dp + '$, ¿cuánto vale $R\'(10)$?'; }, function (v) { return v.p + 10 * v.dp; }, '$R\'(10) = p(10) + 10\\,p\'(10)$.', { unit: 'pesos/pieza', tol: { abs: 0.01 } }),
    N('n-exsin-0', 'trascendentes', 2, {}, function () { return 'Si $f(x) = e^x\\sin x$, ¿cuánto vale $f\'(0)$?'; }, function () { return 1; }, '$e^0\\sin 0 + e^0\\cos 0 = 1$.', { tol: { abs: 0.01 } }),
    N('n-sincos-pi6', 'trascendentes', 2, {}, function () { return 'Si $f(x) = \\sin x\\cos x$, ¿cuánto vale $f\'(\\pi/6)$?'; }, function () { return 0.5; }, '$\\cos^2(\\pi/6) - \\sin^2(\\pi/6) = \\tfrac{3}{4} - \\tfrac{1}{4}$.', { tol: { abs: 0.005 } }),
    N('n-rectangulo', 'aplicaciones', 2, { L: [5, 20, 1], W: [2, 10, 1], dL: [1, 3, 1], dW: [1, 3, 1] }, function (v) { return 'Un rectángulo mide $L = ' + v.L + '$ cm por $W = ' + v.W + '$ cm; el largo crece a ' + v.dL + ' cm/s y el ancho a ' + v.dW + ' cm/s. ¿A qué ritmo crece el área?'; }, function (v) { return v.dL * v.W + v.L * v.dW; }, '$A = LW$, así que $A\' = L\'W + LW\'$.', { unit: 'cm²/s', tol: { abs: 0.01 } }),
    N('n-xnex-1', 'trascendentes', 2, { n: [2, 6, 1] }, function (v) { return 'Si $f(x) = x^{' + v.n + '}e^x$, ¿cuánto vale $f\'(1)$?'; }, function (v) { return Math.E * (v.n + 1); }, '$f\'(1) = n\\,e + e = e(n + 1)$.'),
    N('n-raiz-lineal-4', 'polinomios', 2, { a: [1, 9, 1] }, function (v) { return 'Si $f(x) = \\sqrt{x}\\,(x + ' + v.a + ')$, ¿cuánto vale $f\'(4)$?'; }, function (v) { return (4 + v.a) / 4 + 2; }, '$f\'(x) = \\dfrac{x + a}{2\\sqrt{x}} + \\sqrt{x}$.'),
    N('n-despeja', 'aplicaciones', 3, { u: [1, 5, 1], du: [-3, 3, 1], w: [1, 6, 1], f: [-10, 10, 1] }, function (v) { return 'Si $f = u\\,w$, $f\'(2) = ' + v.f + '$, $u(2) = ' + v.u + '$, $u\'(2) = ' + v.du + '$ y $w(2) = ' + v.w + '$, ¿cuánto vale $w\'(2)$?'; }, function (v) { return (v.f - v.du * v.w) / v.u; }, 'Despeja de $f\' = u\'w + uw\'$.', { tol: { abs: 0.01 } }),
    N('n-xln-e', 'trascendentes', 1, {}, function () { return 'Si $f(x) = x\\ln x$, ¿cuánto vale $f\'(e)$?'; }, function () { return 2; }, '$\\ln e + 1 = 2$.', { tol: { abs: 0.01 } }),
    N('n-xcos-pi', 'trascendentes', 2, {}, function () { return 'Si $f(x) = x\\cos x$, ¿cuánto vale $f\'(\\pi)$?'; }, function () { return -1; }, '$\\cos\\pi - \\pi\\sin\\pi = -1$.', { tol: { abs: 0.01 } }),
    N('n-t2sin-pi', 'trascendentes', 3, {}, function () { return 'Un brazo gira y su posición es $s(t) = t^2\\sin t$. ¿Cuánto vale $s\'(\\pi)$?'; }, function () { return -Math.PI * Math.PI; }, '$2\\pi\\sin\\pi + \\pi^2\\cos\\pi = -\\pi^2$.'),
    N('n-lineal-cuad', 'polinomios', 1, { a: [-3, 3, 1] }, function (v) { return 'Si $f(x) = (2x + 1)(x^2 - 3)$, ¿cuánto vale $f\'(' + v.a + ')$?'; }, function (v) { return 2 * (v.a * v.a - 3) + (2 * v.a + 1) * 2 * v.a; }, PROD, { tol: { abs: 0.01 } }),
    N('n-costo-ln', 'aplicaciones', 3, { a: [5, 20, 1], b: [1, 5, 1], x0: [2, 10, 1] }, function (v) { return 'El costo total es $C(x) = x\\,(' + v.a + ' + ' + v.b + '\\ln x)$. ¿Cuánto vale $C\'(' + v.x0 + ')$?'; }, function (v) { return v.a + v.b * Math.log(v.x0) + v.b; }, '$C\'(x) = a + b\\ln x + x\\cdot\\tfrac{b}{x}$.'),
    N('n-gx-f', 'aplicaciones', 1, { f: [-5, 5, 1], df: [-5, 5, 1] }, function (v) { return 'Si $g(x) = x\\,f(x)$, $f(3) = ' + v.f + '$ y $f\'(3) = ' + v.df + '$, ¿cuánto vale $g\'(3)$?'; }, function (v) { return v.f + 3 * v.df; }, '$g\'(3) = f(3) + 3f\'(3)$.', { tol: { abs: 0.01 } }),

    /* ---------- Conceptuales ---------- */
    C('k-regla', 'regla', 1, '¿Cuál es la regla del producto?', '$(uv)\' = u\'v + uv\'$', [['$(uv)\' = u\'v\'$'], ['$(uv)\' = u\'v - uv\'$'], ['$(uv)\' = \\tfrac{u\'v + uv\'}{v^2}$']], 'Cada factor se deriva una vez mientras el otro queda igual.'),
    C('k-contra', 'regla', 2, '¿Por qué $(uv)\' \\neq u\'v\'$? Un contraejemplo:', 'Con $u = v = x$: $(x^2)\' = 2x$, pero $u\'v\' = 1$', [['Con $u = v = 1$ sale distinto'], ['No hay contraejemplo: sí son iguales'], ['Solo falla con funciones trigonométricas']], 'Basta un ejemplo para ver que multiplicar derivadas no funciona.'),
    C('k-orden', 'regla', 1, 'En $u\'v + uv\'$, ¿importa el orden de los dos sumandos?', 'No, la suma conmuta', [['Sí, cambia el signo'], ['Sí, hay que empezar por el factor más grande'], ['Depende de las funciones']], 'A diferencia del cociente, aquí el orden no importa.'),
    C('k-tres', 'tres', 2, '¿Cuál es la derivada de $u\\,v\\,w$?', '$u\'vw + uv\'w + uvw\'$', [['$u\'v\'w\'$'], ['$u\'vw + uv\'w$'], ['$(uv)\'w\'$']], 'Tres términos: cada factor se deriva una vez.'),
    C('k-desarrollar', 'regla', 2, '¿Cuándo conviene desarrollar en lugar de usar la regla del producto?', 'Cuando los dos factores son polinomios sencillos', [['Nunca: la regla es obligatoria'], ['Cuando hay senos y cosenos'], ['Cuando hay un logaritmo']], '$(x + 1)(x - 2)$ se desarrolla fácil; con $e^x$ o $\\sin x$ la regla es indispensable.'),
    C('k-area', 'regla', 2, 'En el dibujo del rectángulo $u\\times v$, ¿por qué se desprecia la esquina $du\\,dv$?', 'Es el producto de dos cambios pequeños: mucho más pequeño que $v\\,du$ y $u\\,dv$', [['Porque vale exactamente cero'], ['Porque está fuera del rectángulo'], ['Porque $du = dv$']], 'Al dividir entre $dx$ y hacer el límite, ese término se va a cero.'),
    C('k-xx', 'regla', 1, 'Usando la regla del producto con $u = v = x$, $(x\\cdot x)\'$ da…', '$2x$', [['$1$'], ['$x$'], ['$x^2$']], '$1\\cdot x + x\\cdot 1 = 2x$, igual que $(x^2)\'$.'),
    C('k-constante', 'regla', 1, 'Para derivar $5\\,f(x)$, ¿hace falta la regla del producto?', 'No: la constante sale, $5f\'(x)$', [['Sí, siempre'], ['Sí, y da $5\'f + 5f\'$ con $5\' = 5$'], ['No, da $5$']], 'Se puede usar, pero como $5\' = 0$ queda $5f\'$.'),
    C('k-xex', 'trascendentes', 1, '¿Cuál es la derivada de $x\\,e^x$?', '$e^x(1 + x)$', [['$e^x$'], ['$x\\,e^x$'], ['$e^x(x - 1)$']], '$1\\cdot e^x + x\\,e^x$.'),
    C('k-xsin', 'trascendentes', 1, '¿Cuál es la derivada de $x\\sin x$?', '$\\sin x + x\\cos x$', [['$\\cos x$'], ['$x\\cos x$'], ['$\\sin x - x\\cos x$']], 'Producto: $(x)\'\\sin x + x(\\sin x)\'$.'),
    C('k-xln', 'trascendentes', 1, '¿Cuál es la derivada de $x\\ln x$?', '$\\ln x + 1$', [['$\\dfrac{1}{x}$'], ['$\\ln x$'], ['$x + \\ln x$']], '$\\ln x + x\\cdot\\tfrac{1}{x}$.'),
    C('k-exsin', 'trascendentes', 2, '¿Cuál es la derivada de $e^x\\sin x$?', '$e^x(\\sin x + \\cos x)$', [['$e^x\\cos x$'], ['$e^x(\\sin x - \\cos x)$'], ['$e^x\\sin x$']], 'La exponencial se queda en los dos términos.'),
    C('k-x2cos', 'trascendentes', 2, '¿Cuál es la derivada de $x^2\\cos x$?', '$2x\\cos x - x^2\\sin x$', [['$-2x\\sin x$'], ['$2x\\cos x + x^2\\sin x$'], ['$2x\\sin x$']], 'Cuidado con $(\\cos x)\' = -\\sin x$.'),
    C('k-uprima0', 'regla', 2, 'Si $u\'(a) = 0$, entonces $(uv)\'(a)$ es…', '$u(a)\\,v\'(a)$', [['$0$'], ['$u\'(a)\\,v(a)$'], ['$v\'(a)$']], 'El primer término se anula.'),
    C('k-u0', 'regla', 2, 'Si $u(a) = 0$, entonces $(uv)\'(a)$ es…', '$u\'(a)\\,v(a)$', [['$0$'], ['$u(a)\\,v\'(a)$'], ['$v\'(a)$']], 'El segundo término se anula.'),
    C('k-cuadrado', 'regla', 2, 'Aplicando la regla del producto a $u\\cdot u$, $(u^2)\'$ es…', '$2u\\,u\'$', [['$2u$'], ['$u\'^2$'], ['$u\\,u\'$']], '$u\'u + uu\' = 2uu\'$.'),
    C('k-gconst', 'regla', 1, 'Si $v$ es constante, $(u\\,v)\'$ es…', '$u\'\\,v$', [['$u\'v\'$'], ['$0$'], ['$uv\'$']], 'Como $v\' = 0$, queda $u\'v$.'),
    C('k-cuantos', 'tres', 1, '¿Cuántos términos tiene la derivada de un producto de tres factores?', '3', [['1'], ['2'], ['6']], 'Uno por cada factor que se deriva.'),
    C('k-error-x2ex', 'regla', 1, 'Un compañero escribió $(x^2e^x)\' = 2x\\,e^x$. ¿Qué le faltó?', 'El término $x^2e^x$', [['Nada, está bien'], ['Dividir entre $e^x$'], ['El término $2x$']], 'Solo derivó el primer factor.'),
    C('k-factor', 'trascendentes', 2, '¿Cuál es una forma factorizada de $(x^3e^x)\'$?', '$x^2e^x(3 + x)$', [['$3x^2e^x$'], ['$x^3e^x$'], ['$x^2e^x(3 - x)$']], '$3x^2e^x + x^3e^x = x^2e^x(3 + x)$.'),
    C('k-producto-cadena', 'regla', 2, '¿Cuál de estas necesita regla del producto?', '$x\\sin x$', [['$\\sin(x^2)$'], ['$\\sin x$'], ['$3\\sin x$']], '$x\\sin x$ multiplica dos funciones; $\\sin(x^2)$ es una composición (S05).'),
    C('k-xex-0', 'trascendentes', 2, '¿Cuánto vale la pendiente de $y = x\\,e^x$ en $x = 0$?', '1', [['0'], ['$e$'], ['−1']], '$e^0(1 + 0) = 1$.'),
    C('k-sincos', 'trascendentes', 2, '¿Cuál es la derivada de $\\sin x\\cos x$?', '$\\cos^2 x - \\sin^2 x$', [['$-\\sin x\\cos x$'], ['$\\cos^2 x + \\sin^2 x$'], ['$-\\sin^2 x$']], 'Producto; queda $\\cos 2x$.'),
    C('k-leibniz', 'regla', 1, 'En notación de Leibniz, la regla del producto se escribe…', '$\\dfrac{d(uv)}{dx} = \\dfrac{du}{dx}v + u\\dfrac{dv}{dx}$', [['$\\dfrac{d(uv)}{dx} = \\dfrac{du}{dx}\\dfrac{dv}{dx}$'], ['$\\dfrac{d(uv)}{dx} = \\dfrac{du}{dv}$'], ['$\\dfrac{d(uv)}{dx} = u + v$']], 'Es la misma regla con otra notación.'),
    C('k-xf', 'regla', 1, '¿Cuál es la derivada de $x\\,f(x)$?', '$f(x) + x\\,f\'(x)$', [['$f\'(x)$'], ['$x\\,f\'(x)$'], ['$1 + f\'(x)$']], '$(x)\' = 1$ multiplica a $f$.'),
    C('k-ingreso', 'aplicaciones', 2, 'El ingreso es $R = x\\,p(x)$. ¿Qué representan los dos términos de $R\'$?', 'Lo que aporta vender una pieza más y lo que cambia el precio', [['Costo y ganancia'], ['Solo el precio'], ['El ingreso promedio dos veces']], '$R\' = p + x\\,p\'$: la pieza extra a precio $p$, y el efecto del cambio de precio sobre todas.'),
    C('k-momento', 'aplicaciones', 2, 'Un cohete pierde masa: $p = m\\,v$ con $m$ y $v$ cambiando. ¿Cuánto vale $\\dfrac{dp}{dt}$?', '$m\'v + mv\'$', [['$m\\,v\'$'], ['$m\'v\'$'], ['$m\'v$']], 'Si la masa cambia, no basta $ma$: es un producto.'),
    C('k-1x-x', 'regla', 2, 'Con la regla del producto, $\\left(\\tfrac{1}{x}\\cdot x\\right)\'$ da…', '$0$', [['$1$'], ['$-\\tfrac{1}{x}$'], ['$\\tfrac{1}{x^2}$']], '$-\\tfrac{1}{x^2}\\cdot x + \\tfrac{1}{x}\\cdot 1 = 0$, como debe ser porque el producto vale 1.'),
    C('k-no-producto', 'regla', 1, '¿Cuál de estas NO necesita regla del producto?', '$3x^2$', [['$x\\,e^x$'], ['$x^2\\ln x$'], ['$e^x\\cos x$']], 'Un número por una función: la constante sale.'),
    C('k-e2x', 'trascendentes', 2, 'Con la regla del producto, la derivada de $e^x\\cdot e^x$ es…', '$2e^{2x}$', [['$e^{2x}$'], ['$e^x$'], ['$2e^x$']], '$e^xe^x + e^xe^x = 2e^{2x}$.'),
    C('k-horizontal', 'trascendentes', 2, '¿Dónde tiene tangente horizontal $y = x\\,e^x$?', 'En $x = -1$', [['En $x = 0$'], ['En $x = 1$'], ['En ningún punto']], '$e^x(1 + x) = 0$ solo si $x = -1$.'),
    C('k-tabla-signo', 'aplicaciones', 2, 'Si $u$ y $v$ son positivas y crecientes, $(uv)\'$ es…', 'positiva', [['negativa'], ['cero'], ['imposible de saber']], 'Los dos términos $u\'v$ y $uv\'$ son positivos.'),
    C('k-x2x3', 'regla', 1, 'Con la regla del producto, $(x^2\\cdot x^3)\'$ da…', '$5x^4$', [['$6x^3$'], ['$6x$'], ['$x^5$']], '$2x\\cdot x^3 + x^2\\cdot 3x^2 = 5x^4$, igual que $(x^5)\'$.'),
    C('k-crece', 'aplicaciones', 1, 'Si el largo y el ancho de un rectángulo crecen, su área…', 'crece', [['decrece'], ['se queda igual'], ['depende del perímetro']], '$A\' = L\'W + LW\' > 0$.')
  ];

  K.register({
    'c1.S03.regla': 'La regla y su sentido',
    'c1.S03.polinomios': 'Productos de polinomios',
    'c1.S03.trascendentes': 'Con exponenciales, logaritmos y trigonométricas',
    'c1.S03.tres': 'Tres factores',
    'c1.S03.aplicaciones': 'Tablas y aplicaciones'
  }, Q);
})();
