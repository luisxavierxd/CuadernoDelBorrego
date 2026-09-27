/* =====================================================================
   Banco · Cálculo 1 · S14 · Longitud de arco y áreas. 100 preguntas propias.
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c1', '14'), N = K.N, C = K.C;
  var AB = 'Arriba menos abajo, entre las intersecciones.';
  var T = { tol: { rel: 0.003 } };

  var Q = [
    /* ---------- Áreas entre curvas ---------- */
    N('a-kx', 'areas', 1, { k: [1, 6, 1] }, function (v) { return 'Calcula el área entre $y = ' + (v.k === 1 ? '' : v.k) + 'x$ y $y = x^2$.'; }, function (v) { return Math.pow(v.k, 3) / 6; }, AB + ' Se cruzan en 0 y $k$.', T),
    N('a-cupula', 'areas', 1, { a: [1, 5, 1] }, function (v) { return 'Calcula el área entre $y = ' + v.a * v.a + ' - x^2$ y el eje $x$.'; }, function (v) { return 4 * Math.pow(v.a, 3) / 3; }, 'Límites $\\pm a$.', T),
    N('a-raiz', 'areas', 2, {}, function () { return 'Calcula el área entre $y = \\sqrt{x}$ y $y = x^2$.'; }, function () { return 1 / 3; }, '$\\int_0^1(\\sqrt{x} - x^2)\\,dx$.', T),
    N('a-dos-par', 'areas', 2, {}, function () { return 'Calcula el área entre $y = x^2$ y $y = 2 - x^2$.'; }, function () { return 8 / 3; }, 'Se cruzan en $\\pm 1$: $\\int_{-1}^{1}(2 - 2x^2)\\,dx$.', T),
    N('a-exp-x', 'areas', 2, {}, function () { return 'Calcula el área entre $y = e^x$ y $y = x$ para $0 \\leq x \\leq 1$.'; }, function () { return Math.E - 1.5; }, '$\\int_0^1(e^x - x)\\,dx = e - 1 - \\tfrac{1}{2}$.', T),
    N('a-seno', 'areas', 1, {}, function () { return 'Calcula el área bajo un arco de $y = \\sin x$, de 0 a $\\pi$.'; }, function () { return 2; }, '$[-\\cos x]_0^{\\pi} = 2$.', T),
    N('a-inv', 'areas', 1, { b: [2, 9, 1] }, function (v) { return 'Calcula el área bajo $y = \\dfrac{1}{x}$ entre $x = 1$ y $x = ' + v.b + '$.'; }, function (v) { return Math.log(v.b); }, '$\\ln b - \\ln 1$.', T),
    N('a-cubo', 'areas', 2, {}, function () { return 'Calcula el área entre $y = x$ y $y = x^3$ para $0 \\leq x \\leq 1$.'; }, function () { return 0.25; }, '$\\int_0^1(x - x^3)\\,dx$.', T),
    N('a-bajo', 'areas', 2, {}, function () { return 'Calcula el área entre $y = x^2 - 4$ y el eje $x$ (la región está bajo el eje).'; }, function () { return 32 / 3; }, 'El eje va arriba: $\\int_{-2}^{2}(0 - (x^2 - 4))\\,dx$.', T),
    N('a-techo', 'areas', 1, {}, function () { return 'Calcula el área entre $y = x^2$ y la recta $y = 4$.'; }, function () { return 32 / 3; }, '$\\int_{-2}^{2}(4 - x^2)\\,dx$.', T),
    N('a-sincos', 'areas', 2, {}, function () { return 'Calcula el área entre $y = \\cos x$ y $y = \\sin x$ de $x = 0$ a $x = \\pi/4$.'; }, function () { return Math.SQRT2 - 1; }, '$[\\sin x + \\cos x]_0^{\\pi/4} = \\sqrt{2} - 1$.', T),
    N('a-x2x4', 'areas', 3, {}, function () { return 'Calcula el área entre $y = x^2$ y $y = x^4$.'; }, function () { return 4 / 15; }, 'Se cruzan en $0$ y $\\pm 1$; entre $-1$ y 1, $x^2 \\geq x^4$.', T),
    N('a-raiz-recta', 'areas', 3, {}, function () { return 'Calcula el área entre $y = \\sqrt{x}$ y $y = \\tfrac{x}{2}$.'; }, function () { return 4 / 3; }, 'Se cruzan en 0 y 4: $\\int_0^4\\left(\\sqrt{x} - \\tfrac{x}{2}\\right)dx$.', T),
    N('a-parab-recta', 'areas', 2, {}, function () { return 'Calcula el área de la región entre $y = x^2 - 2x$ y $y = x$.'; }, function () { return 4.5; }, 'Se cruzan en 0 y 3: $\\int_0^3(3x - x^2)\\,dx$.', T),
    N('a-exp-exp', 'areas', 3, {}, function () { return 'Calcula el área entre $y = e^x$ y $y = e^{-x}$ para $0 \\leq x \\leq 1$.'; }, function () { return Math.E + 1 / Math.E - 2; }, '$\\int_0^1(e^x - e^{-x})\\,dx = e + e^{-1} - 2$.', T),

    /* ---------- Cuando se cruzan ---------- */
    N('x-cubo-lin', 'cruces', 2, { a: [1, 3, 1] }, function (v) { return 'Calcula el área total entre $y = x^3$ y $y = ' + (v.a === 1 ? '' : v.a * v.a) + 'x$ en $[-' + v.a + ', ' + v.a + ']$.'; }, function (v) { return Math.pow(v.a, 4) / 2; }, 'Parte en $x = 0$; los dos lados aportan lo mismo.', Object.assign({ mistakes: { net: function () { return 0; } }, feedback: [{ when: 'net', say: 'Esa es el área neta: parte la integral en el cruce.' }] }, T)),
    N('x-seno2pi', 'cruces', 1, {}, function () { return '¿Cuál es el área total entre $y = \\sin x$ y el eje $x$ de 0 a $2\\pi$?'; }, function () { return 4; }, 'Dos arcos de área 2; la integral neta daría 0.', Object.assign({ mistakes: { net: function () { return 0; } }, feedback: [{ when: 'net', say: 'Esa es la integral neta; el área cuenta los dos arcos como positivos.' }] }, T)),
    N('x-recta', 'cruces', 2, { a: [1, 5, 1] }, function (v) { return 'Calcula el área total entre $y = x$ y el eje $x$ en $[-' + v.a + ', ' + 2 * v.a + ']$.'; }, function (v) { return 2.5 * v.a * v.a; }, 'Dos triángulos: $\\tfrac{a^2}{2} + 2a^2$.', T),
    N('x-parab1', 'cruces', 3, {}, function () { return 'Calcula el área total entre $y = x^2 - 1$ y el eje $x$ en $[0, 2]$.'; }, function () { return 2; }, 'Parte en $x = 1$: $\\tfrac{2}{3} + \\tfrac{4}{3}$.', T),
    N('x-coseno', 'cruces', 2, {}, function () { return '¿Cuál es el área total entre $y = \\cos x$ y el eje $x$ de 0 a $\\pi$?'; }, function () { return 2; }, 'Parte en $\\tfrac{\\pi}{2}$; cada tramo aporta 1.', T),

    /* ---------- Longitud de arco ---------- */
    N('l-recta', 'arco', 1, { m: [1, 5, 1], L: [1, 6, 1] }, function (v) { return 'Usa la fórmula de arco para $y = ' + (v.m === 1 ? '' : v.m) + 'x$ entre $x = 0$ y $x = ' + v.L + '$.'; }, function (v) { return v.L * Math.sqrt(1 + v.m * v.m); }, '$\\int_0^L\\sqrt{1 + m^2}\\,dx$: coincide con Pitágoras.', T),
    N('l-x32', 'arco', 3, { b: [1, 5, 1] }, function (v) { return 'Calcula la longitud de $y = x^{3/2}$ entre $x = 0$ y $x = ' + v.b + '$.'; }, function (v) { return 8 / 27 * (Math.pow(1 + 9 * v.b / 4, 1.5) - 1); }, '$u = 1 + \\tfrac{9}{4}x$.', T),
    N('l-23', 'arco', 2, {}, function () { return 'Calcula la longitud de $y = \\tfrac{2}{3}x^{3/2}$ entre $x = 0$ y $x = 3$.'; }, function () { return 14 / 3; }, '$y\' = \\sqrt{x}$: $\\int_0^3\\sqrt{1 + x}\\,dx = \\tfrac{2}{3}(8 - 1)$.', T),
    N('l-par', 'arco', 3, {}, function () { return 'Calcula la longitud de $y = \\tfrac{x^2}{2}$ entre $x = 0$ y $x = 1$.'; }, function () { return (Math.SQRT2 + Math.log(1 + Math.SQRT2)) / 2; }, '$\\int_0^1\\sqrt{1 + x^2}\\,dx$ con sustitución trigonométrica (S12).', T),
    N('l-semi', 'arco', 2, { r: [1, 6, 1] }, function (v) { return 'Calcula la longitud de $y = \\sqrt{' + v.r * v.r + ' - x^2}$ de $x = -' + v.r + '$ a $x = ' + v.r + '$.'; }, function (v) { return Math.PI * v.r; }, 'Es media circunferencia: $\\pi r$.', T),
    N('l-lncos', 'arco', 3, {}, function () { return 'Calcula la longitud de $y = \\ln(\\cos x)$ entre $x = 0$ y $x = \\pi/4$.'; }, function () { return Math.log(Math.SQRT2 + 1); }, '$\\sqrt{1 + \\tan^2 x} = \\sec x$ y $\\int\\sec x = \\ln|\\sec x + \\tan x|$.', T),
    N('l-trampa', 'arco', 3, {}, function () { return 'Calcula la longitud de $y = \\dfrac{x^3}{6} + \\dfrac{1}{2x}$ entre $x = 1$ y $x = 2$.'; }, function () { return 17 / 12; }, '$1 + (y\')^2 = \\left(\\tfrac{x^2}{2} + \\tfrac{1}{2x^2}\\right)^2$: la raíz se va.', T),
    N('l-segmento', 'arco', 1, {}, function () { return 'Calcula la longitud de $y = 2x + 1$ entre $x = 0$ y $x = 3$.'; }, function () { return 3 * Math.sqrt(5); }, '$\\int_0^3\\sqrt{5}\\,dx$.', T),

    /* ---------- Tiras horizontales ---------- */
    N('h-y2', 'horizontales', 2, {}, function () { return 'Calcula el área entre $x = y^2$ y la recta $x = 4$.'; }, function () { return 32 / 3; }, 'Con tiras horizontales: $\\int_{-2}^{2}(4 - y^2)\\,dy$.', T),
    N('h-y2-recta', 'horizontales', 3, {}, function () { return 'Calcula el área entre $x = y^2$ y $y = x - 2$.'; }, function () { return 4.5; }, 'En $y$: derecha $x = y + 2$, izquierda $x = y^2$, de $y = -1$ a $y = 2$.', T),

    /* ---------- Plantear ---------- */
    N('p-cruce', 'planteo', 1, {}, function () { return '¿En qué $x > 0$ se cruzan $y = x + 6$ y $y = x^2$?'; }, function () { return 3; }, '$x^2 - x - 6 = (x - 3)(x + 2) = 0$.', T),
    N('p-cruce-k', 'planteo', 1, { k: [2, 9, 1] }, function (v) { return 'Además de $x = 0$, ¿en qué $x$ se cruzan $y = x^2$ y $y = ' + v.k + 'x$?'; }, function (v) { return v.k; }, '$x^2 = kx$.', T),
    N('p-altura', 'planteo', 1, { c: [1, 4, 1] }, function (v) { return 'Entre $y = x + 2$ (arriba) y $y = x^2$ (abajo), ¿qué altura tiene la tira vertical en $x = ' + (v.c - 1) / 2 + '$?'; }, function (v) { var x = (v.c - 1) / 2; return x + 2 - x * x; }, 'Altura $= f(x) - g(x)$.', T),

    /* ---------- Conceptos ---------- */
    C('k-formula', 'planteo', 1, 'El área entre $f$ (arriba) y $g$ (abajo) en $[a, b]$ es…', '$\\int_a^b (f - g)\\,dx$', [['$\\int_a^b (g - f)\\,dx$'], ['$\\int_a^b f\\cdot g\\,dx$'], ['$\\int_a^b f\\,dx\\cdot\\int_a^b g\\,dx$']], 'Arriba menos abajo.'),
    C('k-limites', 'planteo', 1, 'Si el problema no da los límites, se obtienen…', 'con las intersecciones de las curvas', [['con los ceros de $f$ solamente'], ['siempre de 0 a 1'], ['con los máximos de $f$']], 'Resuelve $f(x) = g(x)$.'),
    C('k-arriba', 'planteo', 1, '¿Cómo sabes qué curva va arriba en un intervalo?', 'Evaluando ambas en un punto del intervalo (o con un dibujo)', [['La de mayor grado siempre va arriba'], ['La que aparece primero en el enunciado'], ['No importa']], 'Un solo punto basta si no se cruzan en el intervalo.'),
    C('k-negativa', 'planteo', 1, 'Si tu área sale negativa, lo más probable es que…', 'restaste abajo menos arriba', [['el área es negativa de verdad'], ['los límites están bien y todo es correcto'], ['falta la constante $C$']], 'Un área siempre es positiva.'),
    C('k-bajo-eje', 'areas', 2, 'Si las dos curvas están bajo el eje $x$, la altura de una tira es…', 'la de arriba menos la de abajo, igual que siempre', [['el valor absoluto de cada una sumado'], ['cero'], ['la de abajo menos la de arriba']], 'El eje $x$ no importa; importa qué curva está más alta.'),
    C('k-neta-total', 'cruces', 1, '¿Qué diferencia hay entre área neta y área total?', 'La neta resta lo que está bajo el eje; la total lo suma', [['Ninguna'], ['La neta siempre es mayor'], ['La total solo usa el primer tramo']], 'Neta: $\\int f$; total: $\\int |f|$.'),
    C('k-partir', 'cruces', 1, 'Si las curvas se cruzan dentro de $[a, b]$, hay que…', 'partir la integral en cada cruce', [['integrar de una vez'], ['cambiar de variable'], ['multiplicar por 2']], 'En cada tramo cambia cuál va arriba.'),
    C('k-seno-neto', 'cruces', 1, '¿Cuánto vale $\\int_0^{2\\pi}\\sin x\\,dx$?', '0', [['4'], ['2'], ['$2\\pi$']], 'Los dos arcos se cancelan en la integral neta.'),
    C('k-valor-abs', 'cruces', 2, 'El área total entre $f$ y $g$ se puede escribir como…', '$\\int_a^b |f - g|\\,dx$', [['$\\left|\\int_a^b (f - g)\\,dx\\right|$'], ['$\\int_a^b (f + g)\\,dx$'], ['$\\int_a^b f\\,dx - \\int_a^b g\\,dx$ siempre']], 'El valor absoluto va adentro, en cada punto.'),
    C('k-abs-fuera', 'cruces', 3, '¿Por qué $\\left|\\int_a^b (f - g)\\right|$ no siempre da el área?', 'Porque las partes con distinto signo se cancelan antes de tomar el valor absoluto', [['Sí siempre da el área'], ['Porque falta $\\pi$'], ['Porque hay que derivar']], 'Solo coincide si no se cruzan.'),
    C('k-horizontal', 'horizontales', 2, '¿Cuándo conviene integrar en $y$ (tiras horizontales)?', 'Cuando la región queda descrita como “derecha menos izquierda” en $y$', [['Siempre'], ['Nunca'], ['Solo si hay senos']], 'Por ejemplo, entre $x = y^2$ y una recta.'),
    C('k-horizontal-form', 'horizontales', 2, 'Con tiras horizontales, el área es…', '$\\int_c^d (x_{\\text{der}} - x_{\\text{izq}})\\,dy$', [['$\\int_c^d (y_{\\text{arr}} - y_{\\text{ab}})\\,dx$'], ['$\\int_c^d x\\,dy$ siempre'], ['$\\int_c^d (x_{\\text{izq}} - x_{\\text{der}})\\,dy$']], 'Derecha menos izquierda.'),
    C('k-despejar', 'horizontales', 2, 'Para integrar en $y$ la curva $y = \\sqrt{x}$ se reescribe como…', '$x = y^2$ con $y \\geq 0$', [['$x = \\sqrt{y}$'], ['$x = y$'], ['$y = x^2$']], 'Despeja $x$.'),
    C('k-arco-formula', 'arco', 1, 'La longitud de $y = f(x)$ en $[a, b]$ es…', '$\\int_a^b \\sqrt{1 + (f\'(x))^2}\\,dx$', [['$\\int_a^b \\sqrt{1 + f(x)^2}\\,dx$'], ['$\\int_a^b f\'(x)\\,dx$'], ['$\\int_a^b (1 + f\'(x))\\,dx$']], 'Pitágoras en cada pedacito.'),
    C('k-arco-origen', 'arco', 1, 'La fórmula de longitud de arco sale de…', 'el teorema de Pitágoras aplicado a pedacitos rectos', [['la regla de la cadena'], ['el área bajo la curva'], ['la derivada implícita']], '$\\sqrt{\\Delta x^2 + \\Delta y^2}$.'),
    C('k-arco-uno', 'arco', 1, '¿Por qué hay un 1 dentro de la raíz?', 'Porque es el $\\Delta x^2$ que se factoriza', [['Por la constante de integración'], ['Porque el área es 1'], ['Es un error de notación']], '$\\sqrt{\\Delta x^2 + \\Delta y^2} = \\sqrt{1 + (\\Delta y/\\Delta x)^2}\\,\\Delta x$.'),
    C('k-arco-f-prima', 'arco', 1, 'En la fórmula de arco, dentro de la raíz va…', 'la derivada $f\'$, al cuadrado', [['la función $f$'], ['la integral de $f$'], ['$f\'$ sin elevar']], 'Es la pendiente de cada pedacito.'),
    C('k-arco-recta', 'arco', 1, 'Para una recta de pendiente $m$, la fórmula de arco da…', 'la distancia entre los extremos (Pitágoras)', [['cero'], ['el área bajo la recta'], ['$m$']], '$L\\sqrt{1 + m^2}$.'),
    C('k-arco-numerico', 'arco', 2, '¿Por qué muchas longitudes de arco se calculan numéricamente?', 'Porque $\\sqrt{1 + (f\')^2}$ casi nunca tiene antiderivada elemental', [['Porque la fórmula está mal'], ['Por costumbre'], ['Porque las curvas no tienen longitud']], 'Por ejemplo, el arco de $\\sin x$.'),
    C('k-cuerda', 'arco', 2, 'Comparada con la cuerda (recta entre los extremos), la longitud del arco es…', 'mayor o igual', [['menor'], ['siempre igual'], ['cero']], 'La recta es el camino más corto.'),
    C('k-poligonal', 'arco', 1, 'En el lab, al aumentar los segmentos de la poligonal, su longitud…', 'crece hacia la longitud del arco', [['disminuye'], ['no cambia'], ['se vuelve infinita']], 'Cada segmento abraza mejor la curva.'),
    C('k-circulo', 'arco', 2, 'La longitud de $y = \\sqrt{r^2 - x^2}$ de $-r$ a $r$ es…', '$\\pi r$', [['$2\\pi r$'], ['$\\pi r^2$'], ['$2r$']], 'Media circunferencia.'),
    C('k-arco-x2', 'arco', 2, 'Para el arco de $y = x^2$ se integra…', '$\\sqrt{1 + 4x^2}$', [['$\\sqrt{1 + x^4}$'], ['$\\sqrt{1 + 2x}$'], ['$1 + 4x^2$']], '$f\' = 2x$.'),
    C('k-arco-sec', 'arco', 3, 'Si $f\'(x) = \\tan x$, la raíz $\\sqrt{1 + (f\')^2}$ vale…', '$\\sec x$ (para $|x| < \\pi/2$)', [['$\\tan x$'], ['$1 + \\tan x$'], ['$\\cos x$']], '$1 + \\tan^2 x = \\sec^2 x$.'),
    C('k-cuadrado-perfecto', 'arco', 3, 'Los ejemplos de libro de longitud de arco suelen elegirse para que…', '$1 + (f\')^2$ sea un cuadrado perfecto', [['$f\'$ sea cero'], ['la curva sea recta'], ['no haya raíz']], 'Así la raíz desaparece.'),
    C('k-unidades', 'planteo', 2, 'Si $x$ y $y$ están en metros, el área está en…', 'm²', [['m'], ['m³'], ['sin unidades']], 'Altura por ancho.'),
    C('k-unidades-arco', 'arco', 2, 'Si $x$ y $y$ están en metros, la longitud de arco está en…', 'm', [['m²'], ['m/m'], ['sin unidades']], 'Es una distancia.'),
    C('k-simetria', 'areas', 2, 'Si la región es simétrica respecto al eje $y$, puedes…', 'calcular de 0 a $b$ y multiplicar por 2', [['calcular solo la mitad y no multiplicar'], ['ignorar la mitad negativa'], ['integrar solo el eje']], 'Ahorra cuentas y errores.'),
    C('k-intersecciones-3', 'planteo', 2, 'Si $f$ y $g$ se cruzan en tres puntos $a < c < b$, el área entre $a$ y $b$ se calcula con…', 'dos integrales: de $a$ a $c$ y de $c$ a $b$', [['una sola integral'], ['tres integrales'], ['la integral de $a$ a $c$ nada más']], 'En cada tramo puede cambiar cuál va arriba.'),
    C('k-grafica', 'planteo', 1, 'Antes de integrar un área entre curvas conviene…', 'hacer un bosquejo', [['derivar las curvas'], ['calcular la longitud de arco'], ['multiplicar las funciones']], 'Muestra cruces y qué curva va arriba.'),
    C('k-eje-como-curva', 'areas', 1, 'El área bajo $y = f(x) \\geq 0$ es el área entre $f$ y…', 'la recta $y = 0$', [['la recta $y = 1$'], ['la recta $x = 0$'], ['$f\'$']], 'El eje $x$ es la curva de abajo.'),
    C('k-dos-metodos', 'horizontales', 3, '¿Dan lo mismo las tiras verticales y las horizontales?', 'Sí: son dos formas de sumar la misma área', [['No, las horizontales siempre dan más'], ['Solo si la región es un rectángulo'], ['No, dan áreas con signo contrario']], 'Se elige la más cómoda.'),
    C('k-exp-arriba', 'areas', 2, 'Para $0 \\leq x \\leq 1$, ¿qué curva va arriba, $y = e^x$ o $y = x + 1$?', '$y = e^x$', [['$y = x + 1$'], ['Son iguales en todo el intervalo'], ['Se cruzan en $x = 0.5$']], '$e^x \\geq 1 + x$ para todo $x$ (la recta es su tangente en 0).'),
    C('k-log-area', 'areas', 2, 'El área bajo $y = \\tfrac{1}{x}$ entre 1 y $b$ es…', '$\\ln b$', [['$\\dfrac{1}{b}$'], ['$1 - \\dfrac{1}{b^2}$'], ['$b - 1$']], 'De hecho, así se puede definir el logaritmo natural.'),
    C('k-seno-area', 'areas', 1, 'El área bajo un arco completo de $\\sin x$ (de 0 a $\\pi$) es…', '2', [['1'], ['$\\pi$'], ['0']], '$[-\\cos x]_0^{\\pi}$.'),
    C('k-recta-tangente', 'areas', 3, 'El área entre una curva cóncava hacia arriba y su tangente en un punto…', 'es positiva porque la curva queda por encima de la tangente', [['es cero'], ['es negativa'], ['no se puede calcular']], 'Por ejemplo, $x^2$ y su tangente en 1.'),
    C('k-lab-area', 'planteo', 1, 'En el lab, el botón “Usar intersecciones” sirve para…', 'poner como límites los puntos donde se cruzan las curvas', [['cambiar las curvas'], ['calcular la longitud de arco'], ['borrar la región']], 'Así no tienes que resolver la ecuación a mano.'),
    C('k-lab-neta', 'cruces', 2, 'En el lab, si escribes el área neta cuando las curvas se cruzan, te dice…', '“Esa es el área neta”', [['“Correcto”'], ['“Signo invertido”'], ['nada']], 'Detecta ese error típico.'),
    C('k-arco-param', 'arco', 3, '¿Qué pasa con la fórmula de arco si la curva tiene una tangente vertical (como $x^{3/2}$ no, pero $\\sqrt{x}$ en 0 sí)?', 'La integral es impropia en ese punto, aunque la longitud puede ser finita', [['La longitud es infinita siempre'], ['La fórmula no cambia nada'], ['Se vuelve un área']], '$f\'$ no está definida en el borde.'),
    C('k-costo', 'planteo', 3, 'Una cerca sigue la curva $y = f(x)$ de $a$ a $b$ y cuesta $c$ pesos por metro. Su costo es…', '$c\\int_a^b\\sqrt{1 + (f\')^2}\\,dx$', [['$c\\int_a^b f\\,dx$'], ['$c\\,(b - a)$'], ['$\\int_a^b c\\,f\'\\,dx$']], 'Se paga la longitud, no el área.'),
    C('k-pintura', 'areas', 3, 'Para calcular cuánta pintura necesita un letrero con forma de región entre curvas se usa…', 'el área entre las curvas', [['la longitud de arco'], ['la derivada'], ['el volumen']], 'La pintura cubre la superficie.'),
    C('k-inter-num', 'planteo', 2, 'Si $f(x) = g(x)$ no se puede resolver a mano, las intersecciones se buscan…', 'numéricamente (por ejemplo, con bisección o con el lab)', [['no existen'], ['derivando'], ['siempre en $x = 0$']], 'Luego se integra con esos límites aproximados.'),

    /* ---------- Más práctica ---------- */
    N('a-rect', 'areas', 1, { h: [2, 9, 1], L: [1, 6, 1] }, function (v) { return 'Calcula el área entre $y = ' + v.h + '$ y $y = 1$ para $0 \\leq x \\leq ' + v.L + '$.'; }, function (v) { return (v.h - 1) * v.L; }, 'Es un rectángulo: altura $(h - 1)$ por base $L$.', T),
    C('k-positiva', 'planteo', 1, 'El área de una región plana es siempre…', 'positiva (o cero)', [['negativa si está bajo el eje'], ['igual a la integral neta'], ['un número entero']], 'La integral puede ser negativa; el área, no.'),
    N('a-par-par', 'areas', 2, { a: [1, 3, 1] }, function (v) { return 'Encuentra las intersecciones y calcula el área de la región entre $y = x^2$ y $y = ' + 2 * v.a * v.a + ' - x^2$.'; }, function (v) { return 8 * Math.pow(v.a, 3) / 3; }, 'Se cruzan en $\\pm a$: $\\int_{-a}^{a}(2a^2 - 2x^2)\\,dx$.', T),
    N('a-cub-par', 'areas', 2, {}, function () { return 'Calcula el área entre $y = x^2$ y $y = x^3$ para $0 \\leq x \\leq 1$.'; }, function () { return 1 / 12; }, '$\\int_0^1(x^2 - x^3)\\,dx$.', T),
    N('a-exp-1', 'areas', 2, { b: [1, 3, 1] }, function (v) { return 'Calcula el área entre $y = e^x$ y $y = 1$ para $0 \\leq x \\leq ' + v.b + '$.'; }, function (v) { return Math.exp(v.b) - 1 - v.b; }, '$\\int_0^b(e^x - 1)\\,dx$.', T),
    N('a-ln', 'areas', 2, {}, function () { return 'Calcula el área bajo $y = \\ln x$ entre $x = 1$ y $x = e$.'; }, function () { return 1; }, '$[x\\ln x - x]_1^e$ (por partes, S11).', T),
    N('a-rp', 'areas', 2, {}, function () { return 'Calcula el área de la región entre la parábola $y = x^2$ y la recta $y = x + 2$.'; }, function () { return 4.5; }, 'Se cruzan en $-1$ y 2.', T),
    N('a-uno-cos', 'areas', 2, {}, function () { return 'Calcula el área entre $y = 1$ y $y = \\cos x$ para $0 \\leq x \\leq \\pi/2$.'; }, function () { return Math.PI / 2 - 1; }, '$\\int_0^{\\pi/2}(1 - \\cos x)\\,dx$.', T),
    N('x-seno-k', 'cruces', 2, { k: [2, 5, 1] }, function (v) { return 'Suma los arcos: ¿qué área total encierran $y = \\sin x$ y el eje $x$ entre $x = 0$ y $x = ' + v.k + '\\pi$?'; }, function (v) { return 2 * v.k; }, 'Cada arco aporta 2.', T),
    N('x-cub-menos', 'cruces', 2, {}, function () { return 'Calcula el área total entre $y = x^3 - x$ y el eje $x$ en $[-1, 1]$.'; }, function () { return 0.5; }, 'Parte en 0: cada lado aporta $\\tfrac{1}{4}$.', T),
    N('l-perfecto', 'arco', 2, { b: [1, 4, 1] }, function (v) { return 'Calcula la longitud de $y = \\tfrac{1}{3}(x^2 + 2)^{3/2}$ entre $x = 0$ y $x = ' + v.b + '$.'; }, function (v) { return Math.pow(v.b, 3) / 3 + v.b; }, '$1 + (y\')^2 = (x^2 + 1)^2$: se integra $x^2 + 1$.', T),
    N('l-catenaria', 'arco', 2, { b: [1, 3, 1] }, function (v) { return 'Calcula la longitud de la catenaria $y = \\tfrac{e^x + e^{-x}}{2}$ entre $x = 0$ y $x = ' + v.b + '$.'; }, function (v) { return (Math.exp(v.b) - Math.exp(-v.b)) / 2; }, '$1 + (y\')^2 = \\left(\\tfrac{e^x + e^{-x}}{2}\\right)^2$.', T),
    N('h-y2-k', 'horizontales', 2, { k: [1, 4, 1] }, function (v) { return 'Calcula el área entre $x = y^2$ y $x = ' + v.k * v.k + '$.'; }, function (v) { return 4 * Math.pow(v.k, 3) / 3; }, '$\\int_{-k}^{k}(k^2 - y^2)\\,dy$.', T),
    N('p-cruce2', 'planteo', 2, {}, function () { return '¿En qué $x > 0$ se cruzan $y = x^2$ y $y = 2x + 3$?'; }, function () { return 3; }, '$x^2 - 2x - 3 = (x - 3)(x + 1)$.', T),
    N('p-integrando', 'arco', 2, {}, function () { return 'Para el arco de $y = x^2$, ¿cuánto vale el integrando $\\sqrt{1 + (y\')^2}$ en $x = 1$?'; }, function () { return Math.sqrt(5); }, '$\\sqrt{1 + 4x^2}$ en 1.', T),
    C('k-plan-y', 'horizontales', 2, 'Para el área entre $x = y^2$ y $x = 9$ con tiras horizontales, la integral es…', '$\\int_{-3}^{3}(9 - y^2)\\,dy$', [['$\\int_0^9(9 - y^2)\\,dy$'], ['$\\int_{-3}^{3}(y^2 - 9)\\,dy$'], ['$\\int_0^3 y^2\\,dy$']], 'Derecha $x = 9$, izquierda $x = y^2$, de $y = -3$ a 3.'),
    C('k-arco-dx', 'arco', 2, 'En la fórmula de arco, ¿qué representa $\\sqrt{1 + (f\')^2}\\,dx$?', 'La longitud de un pedacito de curva', [['El área de una tira'], ['La pendiente'], ['Un volumen']], 'Es la hipotenusa del triángulo con catetos $dx$ y $dy$.'),
    C('k-dos-veces', 'areas', 2, 'Si calculas $\\int_{-2}^{2}(4 - x^2)$ como $2\\int_0^2(4 - x^2)$, obtienes…', 'el mismo resultado, porque la región es simétrica', [['el doble del área'], ['la mitad del área'], ['un resultado incorrecto']], 'Aprovecha la simetría par.'),
    C('k-ecuacion', 'planteo', 2, 'Para encontrar dónde se cruzan $y = x^3$ y $y = x$ resuelves…', '$x^3 - x = 0$, que da $x = -1, 0, 1$', [['$x^3 = 0$'], ['$x^3 + x = 0$'], ['$3x^2 = 1$']], 'Iguala las curvas.'),
    C('k-par-mas-larga', 'arco', 2, 'Entre $x = 0$ y $x = 1$, ¿qué arco es más largo, el de $y = x$ o el de $y = x^2$?', 'El de $y = x^2$', [['El de $y = x$'], ['Miden lo mismo'], ['No se puede comparar']], 'Ambos unen $(0, 0)$ con $(1, 1)$; la recta es el camino más corto.'),
    C('k-ancho', 'planteo', 2, 'En una suma de tiras verticales, cada tira tiene ancho…', '$dx$', [['$dy$'], ['$f(x)$'], ['1']], 'Y altura $f(x) - g(x)$.'),
    C('k-limites-y', 'horizontales', 2, 'Con tiras horizontales, los límites de integración son…', 'valores de $y$', [['valores de $x$'], ['siempre 0 y 1'], ['las pendientes']], 'Se integra en $dy$.'),
    N('a-tres-cruces', 'cruces', 3, {}, function () { return 'Calcula el área total entre $y = x^3$ y $y = 4x$.'; }, function () { return 8; }, 'Se cruzan en $-2, 0, 2$: $2\\int_0^2(4x - x^3)\\,dx$.', T),
    N('l-cuarta', 'arco', 3, {}, function () { return 'Calcula la longitud de $y = \\dfrac{x^4}{8} + \\dfrac{1}{4x^2}$ entre $x = 1$ y $x = 2$.'; }, function () { return 33 / 16; }, '$1 + (y\')^2 = \\left(\\tfrac{x^3}{2} + \\tfrac{1}{2x^3}\\right)^2$.', T),
    C('k-infinita', 'arco', 3, '¿Puede una curva en un intervalo acotado tener longitud infinita?', 'Sí, si oscila sin control; las curvas con $f\'$ continua en $[a, b]$ no', [['Nunca'], ['Siempre que sea curva'], ['Solo las rectas']], 'Con $f\'$ continua, la integral de arco es finita.')
  ];

  K.register({
    'c1.S14.planteo': 'Plantear la integral',
    'c1.S14.areas': 'Áreas entre curvas',
    'c1.S14.cruces': 'Curvas que se cruzan',
    'c1.S14.horizontales': 'Tiras horizontales',
    'c1.S14.arco': 'Longitud de arco'
  }, Q);
})();
