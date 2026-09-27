/* =====================================================================
   Banco · Cálculo 1 · S07 · Extremos relativos. 100 preguntas propias.
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c1', '07'), D = K.D, N = K.N, C = K.C;
  var CRIT = 'Resuelve $f\'(x) = 0$ y revisa el signo de $f\'$ alrededor.';
  function lead2(v, tex) { return 'Calcula $f\'\'(x)$ si $f(x) = ' + tex + '$.'; }

  var Q = [
    /* ---------- Puntos críticos ---------- */
    N('c-cuad', 'criticos', 1, { a: [-5, 5, 1], b: [1, 9, 1] }, function (v) { return '¿En qué $x$ tiene su punto crítico $f(x) = x^2 - ' + 2 * v.a + 'x + ' + v.b + '$?'.replace('- -', '+ '); }, function (v) { return v.a; }, '$f\'(x) = 2x - 2a = 0$.', { where: function (v) { return v.a !== 0; } }),
    N('c-cub-pos', 'criticos', 1, { a: [1, 5, 1] }, function (v) { return '¿Cuál es el punto crítico positivo de $f(x) = x^3 - ' + 3 * v.a * v.a + 'x$?'; }, function (v) { return v.a; }, '$f\'(x) = 3x^2 - 3a^2 = 0$.'),
    N('c-factor', 'primera', 2, { p: [-4, -1, 1], q: [1, 5, 1] }, function (v) { return 'Si $f\'(x) = (x - ' + v.p + ')(x - ' + v.q + ')$, ¿en qué $x$ tiene $f$ un máximo relativo?'.replace('- -', '+ '); }, function (v) { return v.p; }, 'El signo de $f\'$ es $+, -, +$: el máximo está en la raíz menor.', { mistakes: { other: function (v) { return v.q; } }, feedback: [{ when: 'other', say: 'Ahí $f\'$ pasa de $-$ a $+$: es el mínimo.' }] }),
    N('c-exp', 'criticos', 2, { k: [2, 6, 1] }, function (v) { return '¿En qué $x$ tiene su máximo $f(x) = x\\,e^{-x/' + v.k + '}$?'; }, function (v) { return v.k; }, '$f\'(x) = e^{-x/k}(1 - x/k)$.'),
    N('c-ln', 'criticos', 2, { a: [2, 9, 1] }, function (v) { return '¿En qué $x > 0$ tiene su mínimo $f(x) = x - ' + v.a + '\\ln x$?'; }, function (v) { return v.a; }, '$f\'(x) = 1 - \\tfrac{a}{x} = 0$.'),
    N('c-raiz', 'criticos', 2, { m: [1, 5, 1] }, function (v) { return '¿En qué $x > 0$ tiene su mínimo $f(x) = x - ' + 2 * v.m + '\\sqrt{x}$?'; }, function (v) { return v.m * v.m; }, '$f\'(x) = 1 - \\tfrac{m}{\\sqrt{x}} = 0 \\Rightarrow x = m^2$.'),
    N('c-racional', 'criticos', 2, { r: [1, 6, 1] }, function (v) { return '¿En qué $x > 0$ tiene su mínimo $f(x) = x + \\dfrac{' + v.r * v.r + '}{x}$?'; }, function (v) { return v.r; }, '$f\'(x) = 1 - \\tfrac{r^2}{x^2} = 0$.', { mistakes: { square: function (v) { return v.r * v.r; } }, feedback: [{ when: 'square', say: 'Resuelve $x^2 = r^2$: la raíz, no el cuadrado.' }], where: function (v) { return v.r > 1; } }),
    N('c-trig', 'criticos', 2, {}, function () { return '¿En qué $x \\in (0, \\pi)$ tiene su máximo $f(x) = \\sin x + \\cos x$?'; }, function () { return Math.PI / 4; }, '$\\cos x - \\sin x = 0 \\Rightarrow \\tan x = 1$.', { tol: { abs: 0.005 } }),
    N('c-cuartica', 'criticos', 2, { w: [1, 5, 1] }, function (v) { return '¿Cuál es el punto crítico positivo de $f(x) = x^4 - ' + 2 * v.w * v.w + 'x^2$?'; }, function (v) { return v.w; }, '$f\'(x) = 4x(x^2 - w^2)$.'),
    N('c-abs', 'criticos', 1, { h: [-6, 6, 1] }, function (v) { return '¿En qué $x$ tiene un punto crítico $f(x) = |x - ' + v.h + '|$?'.replace('- -', '+ '); }, function (v) { return v.h; }, 'Ahí hay un pico: $f\'$ no existe.', { where: function (v) { return v.h !== 0; } }),
    N('c-sin-k', 'criticos', 2, { k: [2, 6, 1] }, function (v) { return '¿En qué $x$ entre 0 y $\\pi/' + v.k + '$ tiene su máximo $f(x) = \\sin(' + v.k + 'x)$?'; }, function (v) { return Math.PI / (2 * v.k); }, '$k\\cos(kx) = 0$ en $kx = \\pi/2$.', { tol: { abs: 0.002 } }),
    N('c-param', 'criticos', 2, { p: [1, 6, 1] }, function (v) { return '¿Qué valor de $k$ hace que $f(x) = x^2 + kx$ tenga su mínimo en $x = ' + v.p + '$?'; }, function (v) { return -2 * v.p; }, '$f\'(p) = 2p + k = 0$.'),
    N('c-dos-a', 'criticos', 3, {}, function () { return '$f(x) = x^3 + ax^2 + bx$ tiene puntos críticos en $x = 1$ y $x = 3$. ¿Cuánto vale $a$?'; }, function () { return -6; }, '$f\'(x) = 3(x - 1)(x - 3) = 3x^2 - 12x + 9$, así que $2a = -12$.'),
    N('c-dos-b', 'criticos', 3, {}, function () { return 'Si $f(x) = x^3 + ax^2 + bx$ tiene sus críticos en $x = 1$ y $x = 3$, ¿cuánto vale $b$?'; }, function () { return 9; }, '$f\'(x) = 3x^2 + 2ax + b = 3x^2 - 12x + 9$.'),
    N('c-cond', 'criticos', 3, {}, function () { return '$f(x) = ax^3 + bx$ tiene un máximo relativo en $(-1, 4)$. ¿Cuánto vale $a$?'; }, function () { return 2; }, '$3a + b = 0$ y $-a - b = 4$.'),
    N('c-x2ex', 'primera', 3, {}, function () { return '¿En qué $x$ tiene un máximo relativo $f(x) = x^2 e^{x}$?'; }, function () { return -2; }, '$f\'(x) = e^x x(x + 2)$: signo $+, -, +$.', { mistakes: { min: function () { return 0; } }, feedback: [{ when: 'min', say: 'En 0 hay un mínimo.' }] }),
    N('c-xlnx', 'criticos', 2, {}, function () { return '¿En qué $x > 0$ tiene su mínimo $f(x) = x\\ln x$?'; }, function () { return 1 / Math.E; }, '$\\ln x + 1 = 0$.', { tol: { abs: 0.002 } }),
    N('c-x4-4x3', 'primera', 2, {}, function () { return 'Para $f(x) = x^4 - 4x^3$, ¿en qué $x$ está su mínimo relativo?'; }, function () { return 3; }, '$f\'(x) = 4x^2(x - 3)$: en 0 no cambia de signo.', { mistakes: { zero: function () { return 0; } }, feedback: [{ when: 'zero', say: 'En 0, $f\'$ no cambia de signo: no hay extremo.' }] }),

    /* ---------- Valores extremos ---------- */
    N('v-max-cub', 'primera', 1, { c: [1, 9, 1] }, function (v) { return '¿Cuál es el valor máximo relativo de $f(x) = x^3 - 3x + ' + v.c + '$?'; }, function (v) { return 2 + v.c; }, 'El máximo está en $x = -1$: $f(-1) = 2 + c$.', { mistakes: { gaveX: function () { return -1; } }, feedback: [{ when: 'gaveX', say: 'Ese es el $x$; se pide el valor $f(x)$.' }] }),
    N('v-min-cub', 'primera', 2, { c: [3, 9, 1] }, function (v) { return 'Calcula el valor mínimo relativo de $f(x) = x^3 - 3x + ' + v.c + '$.'; }, function (v) { return v.c - 2; }, 'El mínimo está en $x = 1$.', { where: function (v) { return v.c !== 3; } }),
    N('v-cuad-max', 'primera', 1, { a: [1, 6, 1], b: [1, 9, 1] }, function (v) { return '¿Cuál es el valor máximo de $f(x) = -x^2 + ' + 2 * v.a + 'x + ' + v.b + '$?'; }, function (v) { return v.a * v.a + v.b; }, 'Máximo en $x = a$.', { where: function (v) { return v.a * v.a + v.b !== v.a; } }),
    N('v-exp', 'primera', 2, {}, function () { return '¿Cuál es el valor máximo de $f(x) = x\\,e^{-x}$?'; }, function () { return 1 / Math.E; }, 'En $x = 1$: $f(1) = e^{-1}$.', { tol: { abs: 0.002 } }),
    N('v-racional', 'primera', 2, {}, function () { return '¿Cuál es el valor máximo de $f(x) = \\dfrac{x}{x^2 + 1}$?'; }, function () { return 0.5; }, 'Máximo en $x = 1$: $\\tfrac{1}{2}$.', { tol: { abs: 0.002 } }),
    N('v-cuartica', 'primera', 2, { w: [1, 3, 1] }, function (v) { return '¿Cuál es el valor mínimo de $f(x) = x^4 - ' + 2 * v.w * v.w + 'x^2$?'; }, function (v) { return -Math.pow(v.w, 4); }, 'Mínimos en $x = \\pm w$.'),
    N('v-x4-4x3', 'primera', 2, {}, function () { return 'Para $f(x) = x^4 - 4x^3$, calcula su valor mínimo.'; }, function () { return -27; }, '$f(3) = 81 - 108$.'),
    N('v-x2ex', 'primera', 3, {}, function () { return '¿Cuál es el valor máximo relativo de $f(x) = x^2 e^{x}$?'; }, function () { return 4 / (Math.E * Math.E); }, '$f(-2) = 4e^{-2}$.', { tol: { abs: 0.002 } }),
    N('v-xlnx', 'primera', 3, {}, function () { return '¿Cuál es el valor mínimo de $f(x) = x\\ln x$ para $x > 0$?'; }, function () { return -1 / Math.E; }, '$f(1/e) = -1/e$.', { tol: { abs: 0.002 } }),
    N('v-w', 'primera', 2, {}, function () { return 'Para $f(x) = (x^2 - 1)^2$, ¿cuál es el valor del máximo relativo?'; }, function () { return 1; }, 'Críticos en $0$ y $\\pm 1$; el máximo relativo es $f(0) = 1$.', { tol: { abs: 0.005 } }),

    /* ---------- Segunda derivada ---------- */
    N('s-fpp', 'segunda', 1, { a: [1, 9, 1] }, function (v) { return 'Si $f(x) = x^3 + ' + v.a + 'x^2$, ¿cuánto vale $f\'\'(1)$?'; }, function (v) { return 6 + 2 * v.a; }, '$f\'\'(x) = 6x + 2a$.'),
    N('s-fpp-crit', 'segunda', 2, { a: [1, 5, 1] }, function (v) { return 'Para $f(x) = x^3 - ' + 3 * v.a * v.a + 'x$, ¿cuánto vale $f\'\'$ en su crítico positivo?'; }, function (v) { return 6 * v.a; }, '$f\'\'(x) = 6x$ en $x = a$: positiva, es mínimo.'),
    N('s-concava', 'segunda', 2, { b: [1, 5, 1] }, function (v) { return '¿A partir de qué $x$ es cóncava hacia arriba $f(x) = x^3 + ' + 3 * v.b + 'x^2$?'; }, function (v) { return -v.b; }, '$f\'\'(x) = 6x + 6b > 0$ cuando $x > -b$.'),

    /* ---------- Inflexión ---------- */
    N('i-cub', 'inflexion', 1, { k: [1, 6, 1] }, function (v) { return '¿En qué $x$ está la inflexión de $f(x) = x^3 - ' + 3 * v.k + 'x^2 + 1$?'; }, function (v) { return v.k; }, '$f\'\'(x) = 6x - 6k$.', { mistakes: { crit: function (v) { return 2 * v.k; } }, feedback: [{ when: 'crit', say: 'Ahí $f\' = 0$; la inflexión es donde $f\'\' = 0$.' }] }),
    N('i-cuart', 'inflexion', 2, { n: [1, 5, 1] }, function (v) { return '¿Cuál es la inflexión con $x > 0$ de $f(x) = x^4 - ' + 6 * v.n * v.n + 'x^2$?'; }, function (v) { return v.n; }, '$f\'\'(x) = 12x^2 - 12n^2$.'),
    N('i-exp', 'inflexion', 2, {}, function () { return '¿En qué $x$ tiene su inflexión $f(x) = x\\,e^{-x}$?'; }, function () { return 2; }, '$f\'\'(x) = e^{-x}(x - 2)$.', { tol: { abs: 0.005 } }),
    N('i-gauss', 'inflexion', 3, {}, function () { return '¿En qué $x > 0$ tiene una inflexión $f(x) = e^{-x^2}$?'; }, function () { return 1 / Math.SQRT2; }, '$f\'\'(x) = (4x^2 - 2)e^{-x^2}$.', { tol: { abs: 0.002 } }),
    N('i-coord', 'inflexion', 2, { c: [1, 30, 1] }, function (v) { return '¿Cuál es la coordenada $y$ del punto de inflexión de $f(x) = x^3 - 6x^2 + ' + v.c + '$?'; }, function (v) { return v.c - 16; }, 'Inflexión en $x = 2$: $8 - 24 + c$.', { where: function (v) { return v.c !== 16 && v.c - 16 !== 2; }, mistakes: { gaveX: function () { return 2; } }, feedback: [{ when: 'gaveX', say: 'Ese es el $x$; se pide $f(2)$.' }] }),
    N('i-ln', 'inflexion', 3, {}, function () { return '¿En qué $x > 0$ tiene una inflexión $f(x) = \\ln(x^2 + 1)$?'; }, function () { return 1; }, '$f\'\'(x) = \\dfrac{2(1 - x^2)}{(x^2 + 1)^2}$.', { tol: { abs: 0.005 } }),

    /* ---------- Segundas derivadas escritas ---------- */
    D('d2-poli', 'segunda', 1, { a: [1, 9, 1] }, function (v) { return 'x^4 + ' + v.a + 'x^3'; }, function (v) { return '4x^3 + ' + 3 * v.a + 'x^2'; }, function (v) { return '12x^2 + ' + 6 * v.a + 'x'; }, 'Deriva dos veces.', { lead: lead2 }),
    D('d2-sin', 'segunda', 2, { a: [2, 6, 1] }, function (v) { return '\\sin(' + v.a + 'x)'; }, function (v) { return v.a + '*cos(' + v.a + 'x)'; }, function (v) { return '-' + v.a * v.a + '*sin(' + v.a + 'x)'; }, 'Cada derivada saca un factor $a$.', { lead: lead2 }),
    D('d2-cub', 'segunda', 1, { a: [1, 9, 1] }, function (v) { return 'x^3 - ' + 3 * v.a + 'x^2'; }, function (v) { return '3x^2 - ' + 6 * v.a + 'x'; }, function (v) { return '6x - ' + 6 * v.a; }, 'Deriva dos veces.', { lead: lead2 }),
    D('d2-xex', 'segunda', 2, {}, function () { return 'x\\,e^{-x}'; }, function () { return 'e^(-x) - x*e^(-x)'; }, function () { return '(x - 2)*e^(-x)'; }, '$f\' = e^{-x}(1 - x)$; deriva otra vez.', { lead: lead2 }),
    D('d2-ln', 'segunda', 3, {}, function () { return '\\ln(x^2 + 1)'; }, function () { return '2x/(x^2 + 1)'; }, function () { return '2(1 - x^2)/(x^2 + 1)^2'; }, 'Cociente sobre $f\' = \\tfrac{2x}{x^2 + 1}$.', { lead: lead2 }),

    /* ---------- Conceptos ---------- */
    C('k-critico', 'criticos', 1, '¿Qué es un punto crítico de $f$?', 'Un $c$ del dominio con $f\'(c) = 0$ o $f\'(c)$ inexistente', [['Un punto donde $f(c) = 0$'], ['Cualquier máximo absoluto'], ['Un punto donde $f\'\'(c) = 0$']], 'Son los candidatos a extremos.'),
    C('k-tangente', 'criticos', 1, 'En un máximo relativo de una función derivable, la tangente es…', 'horizontal', [['vertical'], ['de pendiente 1'], ['no existe']], '$f\'(c) = 0$.'),
    C('k-x3', 'criticos', 1, '¿$f(x) = x^3$ tiene un extremo en $x = 0$?', 'No: $f\'(0) = 0$ pero $f\'$ no cambia de signo', [['Sí, un mínimo'], ['Sí, un máximo'], ['No, porque $f\'(0)$ no existe']], 'Es un crítico sin extremo.'),
    C('k-abs', 'criticos', 1, '¿Por qué $x = 0$ es crítico para $|x|$?', 'Porque $f\'(0)$ no existe (hay un pico)', [['Porque $f\'(0) = 0$'], ['Porque $f(0) = 0$'], ['No es crítico']], 'También cuentan los puntos sin derivada.'),
    C('k-primera', 'primera', 1, 'Si $f\'$ pasa de positiva a negativa en $c$, entonces $f(c)$ es…', 'un máximo relativo', [['un mínimo relativo'], ['una inflexión'], ['un cero de $f$']], 'Sube y luego baja.'),
    C('k-primera-min', 'primera', 1, 'Si $f\'$ pasa de negativa a positiva en $c$, hay…', 'un mínimo relativo', [['un máximo relativo'], ['una inflexión'], ['una asíntota']], 'Baja y luego sube.'),
    C('k-sube', 'primera', 1, 'Si $f\'(x) > 0$ en un intervalo, $f$ ahí es…', 'creciente', [['decreciente'], ['constante'], ['cóncava hacia arriba']], 'Pendiente positiva.'),
    C('k-baja', 'primera', 2, 'Si $f\'(x) < 0$ en todo $(a, b)$, entonces…', '$f$ decrece en $(a, b)$', [['$f$ es negativa en $(a, b)$'], ['$f$ es cóncava hacia abajo'], ['$f$ tiene un mínimo en $(a, b)$']], 'El signo de $f\'$ habla de subir o bajar, no del signo de $f$.'),
    C('k-concava-arriba', 'segunda', 1, 'Si $f\'\'(x) > 0$, la gráfica es…', 'cóncava hacia arriba (∪)', [['cóncava hacia abajo (∩)'], ['creciente'], ['una recta']], 'La pendiente aumenta.'),
    C('k-concava-abajo', 'segunda', 1, 'Si $f\'\'(x) < 0$, la gráfica es…', 'cóncava hacia abajo (∩)', [['cóncava hacia arriba (∪)'], ['decreciente'], ['constante']], 'La pendiente disminuye.'),
    C('k-segunda', 'segunda', 1, 'Si $f\'(c) = 0$ y $f\'\'(c) > 0$, en $c$ hay…', 'un mínimo relativo', [['un máximo relativo'], ['una inflexión'], ['nada']], 'Tangente plana en una ∪.'),
    C('k-segunda-cero', 'segunda', 2, 'Si $f\'(c) = 0$ y $f\'\'(c) = 0$, ¿qué concluye el criterio de la segunda derivada?', 'Nada: hay que usar el signo de $f\'$', [['Que es máximo'], ['Que es mínimo'], ['Que es inflexión']], '$x^4$, $-x^4$ y $x^3$ cumplen eso y son distintos.'),
    C('k-x4', 'segunda', 2, 'Para $f(x) = x^4$ en $x = 0$: $f\' = f\'\' = 0$. ¿Qué hay ahí?', 'Un mínimo', [['Una inflexión'], ['Un máximo'], ['Nada']], '$f\'$ pasa de $-$ a $+$.'),
    C('k-inflexion', 'inflexion', 1, 'Un punto de inflexión es donde…', 'cambia la concavidad', [['$f$ vale cero'], ['$f\'$ vale cero siempre'], ['la función tiene un máximo']], '$f\'\'$ cambia de signo.'),
    C('k-inflexion-cero', 'inflexion', 2, 'Si $f\'\'(c) = 0$, ¿seguro hay inflexión en $c$?', 'No: $f\'\'$ tiene que cambiar de signo', [['Sí, siempre'], ['Sí, si $f\'(c) = 0$'], ['Solo si $f(c) = 0$']], '$x^4$ tiene $f\'\'(0) = 0$ y no tiene inflexión.'),
    C('k-relativo', 'criticos', 1, '¿Qué diferencia hay entre un máximo relativo y uno absoluto?', 'El relativo es el más alto cerca; el absoluto, en todo el dominio', [['Ninguna'], ['El absoluto siempre está en $x = 0$'], ['El relativo siempre es mayor']], 'Una montaña puede no ser la más alta de la cordillera.'),
    C('k-tabla', 'primera', 2, 'Signo de $f\'$: $+$ en $(-\\infty, -2)$, $-$ en $(-2, 1)$, $-$ en $(1, \\infty)$. ¿Qué hay en $x = 1$?', 'Nada: no cambia de signo', [['Un mínimo'], ['Un máximo'], ['Una asíntota']], 'Sigue bajando.'),
    C('k-tabla-2', 'primera', 2, 'Signo de $f\'$: $-$ en $(-\\infty, 0)$, $+$ en $(0, 4)$, $-$ en $(4, \\infty)$. ¿Dónde está el máximo relativo?', 'En $x = 4$', [['En $x = 0$'], ['No hay'], ['En los dos']], 'En 4 pasa de $+$ a $-$.'),
    C('k-grafica-fp', 'grafica', 2, 'La gráfica de $f\'$ cruza el eje $x$ de arriba hacia abajo en $x = 2$. ¿Qué tiene $f$ en 2?', 'Un máximo relativo', [['Un mínimo relativo'], ['Una inflexión'], ['Un cero']], '$f\'$ pasa de $+$ a $-$.'),
    C('k-grafica-fp-min', 'grafica', 2, 'La gráfica de $f\'$ cruza el eje $x$ de abajo hacia arriba en $x = -1$. En $-1$, $f$ tiene…', 'un mínimo relativo', [['un máximo relativo'], ['una inflexión'], ['una asíntota']], '$f\'$ pasa de $-$ a $+$.'),
    C('k-grafica-fp-toca', 'grafica', 3, 'La gráfica de $f\'$ toca el eje $x$ en $x = 3$ sin cruzarlo (queda positiva). En 3, $f$…', 'no tiene extremo, pero sí una tangente horizontal', [['tiene un máximo'], ['tiene un mínimo'], ['no está definida']], 'Sin cambio de signo no hay extremo.'),
    C('k-grafica-fp-max', 'grafica', 3, 'En $x = 1$ la gráfica de $f\'$ tiene un máximo. ¿Qué pasa con $f$ en 1?', 'Tiene una inflexión', [['Tiene un máximo'], ['Tiene un mínimo'], ['Vale cero']], 'Donde $f\'$ tiene un extremo, $f\'\'$ cambia de signo.'),
    C('k-grafica-f', 'grafica', 1, 'En la cima de una “montaña” de la gráfica de $f$, el signo de $f\'$…', 'pasa de positivo a negativo', [['es siempre positivo'], ['pasa de negativo a positivo'], ['no existe']], 'Sube y luego baja.'),
    C('k-valle', 'grafica', 1, 'En el fondo de un “valle” suave de $f$…', '$f\' = 0$ y $f\'\' \\geq 0$', [['$f\' = 0$ y $f\'\' < 0$'], ['$f = 0$'], ['$f\'$ no existe']], 'Tangente plana en una ∪.'),
    C('k-cubica', 'criticos', 2, '¿Cuántos extremos relativos puede tener como máximo un polinomio de grado 3?', '2', [['3'], ['1'], ['Infinitos']], '$f\'$ es de grado 2: a lo más 2 raíces.'),
    C('k-cuartica', 'criticos', 2, '¿Cuántos puntos críticos puede tener como máximo un polinomio de grado 4?', '3', [['4'], ['2'], ['1']], '$f\'$ es de grado 3.'),
    C('k-parabola', 'segunda', 1, 'La parábola $f(x) = ax^2 + bx + c$ con $a < 0$ tiene…', 'un máximo en $x = -\\tfrac{b}{2a}$', [['un mínimo en $x = -\\tfrac{b}{2a}$'], ['dos extremos'], ['una inflexión']], '$f\'\' = 2a < 0$: ∩.'),
    C('k-lineal', 'criticos', 2, '¿Tiene extremos relativos $f(x) = 3x + 5$?', 'No: $f\'(x) = 3$ nunca vale cero', [['Sí, en $x = 0$'], ['Sí, en $x = -5/3$'], ['Sí, uno de cada tipo']], 'Una recta no inclinada a cero siempre sube o siempre baja.'),
    C('k-exp', 'criticos', 1, '¿Tiene puntos críticos $f(x) = e^x$?', 'No: $e^x > 0$ para todo $x$', [['Sí, en $x = 0$'], ['Sí, en $x = 1$'], ['Infinitos']], '$f\'(x) = e^x$ nunca es cero.'),
    C('k-seno', 'criticos', 2, '¿Dónde tiene máximos $f(x) = \\sin x$?', 'En $x = \\tfrac{\\pi}{2} + 2k\\pi$', [['En $x = k\\pi$'], ['En $x = 0$ solamente'], ['En $x = \\pi + 2k\\pi$']], '$\\cos x = 0$ y $\\sin x = 1$.'),
    C('k-orden', 'primera', 1, '¿Cuál es el primer paso para hallar extremos relativos?', 'Calcular $f\'$ y encontrar sus ceros y dónde no existe', [['Calcular $f\'\'$'], ['Graficar $f$ a mano'], ['Igualar $f$ a cero']], 'Los críticos salen de $f\'$.'),
    C('k-no-derivable', 'criticos', 2, 'Si $f\'(c)$ no existe pero $f$ es continua en $c$, ¿puede haber un extremo?', 'Sí, como el mínimo de $|x|$ en 0', [['No, nunca'], ['Solo si $f(c) = 0$'], ['Solo máximos']], 'Por eso esos puntos también son críticos.'),
    C('k-fuera-dominio', 'criticos', 2, '¿Es $x = 0$ un punto crítico de $f(x) = \\dfrac{1}{x}$?', 'No: $x = 0$ no está en el dominio', [['Sí, porque $f\'(0)$ no existe'], ['Sí, es un máximo'], ['Sí, es un mínimo']], 'Un crítico debe pertenecer al dominio.'),
    C('k-concavidad-pendiente', 'segunda', 2, '“Cóncava hacia arriba” significa que…', 'la pendiente va en aumento', [['la función va en aumento'], ['la función es positiva'], ['la pendiente es positiva']], 'Es lo que dice $f\'\' > 0$.'),
    C('k-decrece-concava', 'segunda', 2, '¿Puede una función ser decreciente y cóncava hacia arriba a la vez?', 'Sí, como $e^{-x}$', [['No, nunca'], ['Solo si es lineal'], ['Solo en un punto']], 'Baja cada vez más despacio.'),
    C('k-crece-concava-abajo', 'segunda', 2, '¿Cuál de estas crece y es cóncava hacia abajo para $x > 0$?', '$\\ln x$', [['$x^2$'], ['$e^x$'], ['$-x^2$']], '$\\tfrac{1}{x} > 0$ y $-\\tfrac{1}{x^2} < 0$.'),
    C('k-inflexion-cubica', 'inflexion', 2, 'Todo polinomio de grado 3…', 'tiene exactamente una inflexión', [['no tiene inflexiones'], ['tiene dos inflexiones'], ['tiene tres extremos']], '$f\'\'$ es lineal y cambia de signo una vez.'),
    C('k-inflexion-cuadratica', 'inflexion', 1, '¿Cuántas inflexiones tiene una parábola?', 'Ninguna', [['Una'], ['Dos'], ['Depende del signo de $a$']], '$f\'\' = 2a$ no cambia de signo.'),
    C('k-inflexion-sin', 'inflexion', 2, '¿Dónde tiene inflexiones $f(x) = \\sin x$?', 'En $x = k\\pi$', [['En $x = \\tfrac{\\pi}{2} + k\\pi$'], ['En ningún punto'], ['Solo en $x = 0$']], '$f\'\' = -\\sin x$ cambia de signo en los ceros del seno.'),
    C('k-velocidad', 'grafica', 2, 'Si $s(t)$ es la posición, un máximo relativo de $s$ ocurre cuando la velocidad…', 'pasa de positiva a negativa', [['es máxima'], ['es negativa siempre'], ['vale 1']], 'El objeto se detiene y regresa.'),
    C('k-aceleracion', 'grafica', 3, 'Si la posición $s(t)$ es cóncava hacia arriba, la aceleración es…', 'positiva', [['negativa'], ['cero'], ['la velocidad']], '$s\'\' = a$.'),
    C('k-f-positiva', 'grafica', 2, '¿Que $f(c) > 0$ dice algo sobre si $c$ es máximo?', 'No: el signo de $f$ no clasifica extremos', [['Sí, es máximo'], ['Sí, es mínimo'], ['Sí, es inflexión']], 'Lo que clasifica es el signo de $f\'$ (o $f\'\'$).'),
    C('k-candidatos', 'criticos', 3, 'En un intervalo cerrado $[a, b]$, los candidatos a extremo absoluto son…', 'los críticos dentro de $(a, b)$ y los extremos $a$ y $b$', [['solo los críticos'], ['solo $a$ y $b$'], ['los ceros de $f$']], 'Tema de S08: siempre revisa los bordes.'),
    C('k-par', 'criticos', 3, 'Si $f$ es par y derivable, ¿cuánto vale $f\'(0)$?', '0', [['1'], ['$f(0)$'], ['No se puede saber']], '$f\'$ es impar, así que $f\'(0) = -f\'(0)$.'),
    C('k-cuarta-simetria', 'segunda', 3, 'Para $f(x) = x^4 - 2x^2$, ¿qué tipo de punto es $x = 0$?', 'Máximo relativo', [['Mínimo relativo'], ['Inflexión'], ['No es crítico']], '$f\'\'(0) = -4 < 0$.'),
    C('k-grafica-fpp', 'grafica', 3, 'Si la gráfica de $f\'\'$ está por encima del eje en todo $(a, b)$, entonces en $(a, b)$…', '$f$ no tiene máximos relativos', [['$f$ no tiene mínimos relativos'], ['$f$ es creciente'], ['$f$ es positiva']], 'En una ∪ solo caben mínimos.'),
    C('k-ejemplo-inflexion', 'inflexion', 1, '¿Cuál de estas tiene una inflexión en $x = 0$?', '$x^3$', [['$x^2$'], ['$x^4$'], ['$|x|$']], '$f\'\' = 6x$ cambia de signo en 0.'),
    C('k-lab', 'grafica', 1, 'En las tres gráficas del lab, un extremo de $f$ coincide con…', 'un cruce de $f\'$ por el eje $x$', [['un cruce de $f\'\'$ por el eje $x$'], ['un cero de $f$'], ['un máximo de $f\'$']], '$f\' = 0$ y cambia de signo.'),
    C('k-lab-inflexion', 'grafica', 1, 'En el lab, una inflexión de $f$ coincide con…', 'un cruce de $f\'\'$ por el eje $x$', [['un cruce de $f\'$ por el eje'], ['un cero de $f$'], ['un pico de $f$']], 'Ahí cambia la concavidad.'),
    C('k-costo', 'grafica', 2, 'Si $C\'(x) > 0$ y $C\'\'(x) < 0$, el costo…', 'sube, pero cada vez más despacio', [['baja'], ['sube cada vez más rápido'], ['es constante']], 'Creciente y cóncava hacia abajo.'),
    C('k-poblacion', 'grafica', 3, 'Una población crece rápido y luego se estabiliza. Su punto de inflexión marca…', 'el instante de crecimiento más rápido', [['el máximo de la población'], ['el inicio'], ['cuando deja de crecer']], 'Ahí $P\'$ es máxima.'),
    C('k-signo-fpp', 'segunda', 2, 'Para $f(x) = -3x^2 + 5$, en $x = 0$ hay…', 'un máximo', [['un mínimo'], ['una inflexión'], ['nada']], '$f\'\' = -6 < 0$.'),
    N('c-e-poly', 'criticos', 2, { u: [1, 5, 1] }, function (v) { return '¿En qué $x$ tiene su mínimo $f(x) = e^{x^2 - ' + 2 * v.u + 'x}$?'; }, function (v) { return v.u; }, 'La exponencial crece con su exponente: basta minimizar $x^2 - 2ux$.'),
    N('s-fpp-exp', 'segunda', 2, { k: [2, 9, 1] }, function (v) { return 'Si $f(x) = e^{' + v.k + 'x}$, ¿cuánto vale $f\'\'(0)$?'; }, function (v) { return v.k * v.k; }, 'Cada derivada saca un factor $k$.', { mistakes: { once: function (v) { return v.k; } }, feedback: [{ when: 'once', say: 'Eso es $f\'(0)$; deriva otra vez.' }] }),
    C('k-dos-minimos', 'grafica', 2, 'Entre dos mínimos relativos de una función derivable siempre hay…', 'un máximo relativo', [['otro mínimo'], ['una asíntota'], ['un cero de $f$']], 'Para bajar de nuevo, primero tiene que subir y dar la vuelta.'),
    N('c-dist', 'criticos', 3, {}, function () { return '¿Qué punto de $y = x^2$ con $x > 0$ está más cerca de $(0, 2)$? Da su $x$.'; }, function () { return Math.sqrt(1.5); }, 'Minimiza $d^2 = x^2 + (x^2 - 2)^2$: $2x(2x^2 - 3) = 0$.', { tol: { abs: 0.002 } }),
    N('i-param', 'inflexion', 3, { a: [1, 6, 1] }, function (v) { return '¿En qué $x \\neq 0$ tiene una inflexión $f(x) = x^4 + ' + v.a + 'x^3$?'; }, function (v) { return -v.a / 2; }, '$f\'\'(x) = 6x(2x + a)$.', { tol: { abs: 0.005 } }),
    C('k-rolle', 'criticos', 3, 'Si $f$ es derivable y $f(1) = f(4)$, entonces…', 'hay algún $c$ entre 1 y 4 con $f\'(c) = 0$', [['$f$ es constante'], ['$f\'(1) = f\'(4)$'], ['$f$ tiene una inflexión en 2.5']], 'Teorema de Rolle: si sale y vuelve a la misma altura, en algún punto la tangente es plana.')
  ];

  K.register({
    'c1.S07.criticos': 'Puntos críticos',
    'c1.S07.primera': 'Criterio de la primera derivada',
    'c1.S07.segunda': 'Concavidad y segunda derivada',
    'c1.S07.inflexion': 'Puntos de inflexión',
    'c1.S07.grafica': 'Leer gráficas'
  }, Q);
})();
