/* =====================================================================
   Banco · Cálculo 3 · S09 · Teoría lineal de orden n: superposición,
   Wronskiano, conjunto fundamental y reducción de orden.
   100 preguntas propias (source: 'propia').
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c3', '09');

  function C() {
    var q = K.C.apply(null, arguments), opts = q.options;
    q.options = function (v) {
      return opts(v).map(function (o) { return typeof o.say === 'function' ? Object.assign({}, o, { say: o.say(v) }) : o; });
    };
    return q;
  }

  function distinct(q) {
    return function (v) {
      if (q.baseWhere && !q.baseWhere(v)) return false;
      var vals = [q.answer(v)].concat(Object.keys(q.mistakes || {}).map(function (k) { return q.mistakes[k](v); }));
      if (!isFinite(vals[0]) || (vals[0] !== 0 && Math.abs(vals[0]) < 0.08)) return false;
      for (var i = 0; i < vals.length; i++) {
        if (!isFinite(vals[i])) return false;
        for (var j = i + 1; j < vals.length; j++) {
          var big = Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 0.5);
          if (Math.abs(vals[i] - vals[j]) <= Math.max(0.03 * big, 0.025)) return false;
        }
      }
      return true;
    };
  }

  function N(id, sub, d, vars, prompt, answer, why, o) {
    o = o || {};
    var q = K.N(id, sub, d, vars, prompt, answer, why, o);
    q.baseWhere = o.where;
    q.where = distinct(q);
    return q;
  }

  function E(id, sub, d, vars, prompt, answer, why, o) {
    return K.E(id, sub, d, vars, prompt, answer, why, o || {});
  }

  var SUBTEMAS = {
    'c3.S09.linealidad': 'Ecuaciones lineales y superposición',
    'c3.S09.wronskiano': 'Independencia lineal y Wronskiano',
    'c3.S09.abel': 'Fórmula de Abel y propiedades del Wronskiano',
    'c3.S09.fundamental': 'Conjunto fundamental y solución general',
    'c3.S09.pvi': 'Problemas de valor inicial de orden superior',
    'c3.S09.reduccion': 'Reducción de orden'
  };

  var Q = [
    /* ======================= 1. Ecuaciones lineales y superposición (16) ======================= */
    C('lin-c-def', 'linealidad', 1,
      '¿Cuál es la forma general de una ecuación diferencial lineal homogénea de orden $n$ en un intervalo $I$?',
      '$a_n(x)y^{(n)} + a_{n-1}(x)y^{(n-1)} + \\dots + a_1(x)y\' + a_0(x)y = 0$, con $a_n(x) \\neq 0$ en $I$', [
        ['$y^{(n)} = [a_1(x)y\' + a_0(x)y]^n$', 'Casi: las derivadas y la función incógnita deben aparecer con exponente $1$, no elevadas a potencias.'],
        ['$a_n(x)y^{(n)} + \\dots + a_0(x)y = g(x)$ con $g(x) \\neq 0$', 'Casi: esa es una ecuación no homogénea; para ser homogénea el término independiente $g(x)$ debe ser idénticamente cero.'],
        ['$y^{(n)} + (y\')^2 + y = 0$', 'Casi: el término $(y\')^2$ es no lineal por tener exponente $2$.']],
      'Una ecuación es lineal si la incógnita y todas sus derivadas aparecen con grado 1 y sin multiplicarse entre sí; es homogénea si no tiene término independiente.'),

    C('lin-c-superposicion', 'linealidad', 1,
      'Si $y_1(x)$ y $y_2(x)$ son soluciones de la ecuación lineal homogénea $y\'\' + P(x)y\' + Q(x)y = 0$, ¿qué garantiza el principio de superposición?',
      'Que cualquier combinación lineal $c_1y_1(x) + c_2y_2(x)$ también es solución para cualesquiera constantes $c_1, c_2$', [
        ['Que el producto $y_1(x)y_2(x)$ siempre es solución de la misma ecuación', 'Casi: la superposición aplica a combinaciones lineales (sumas y múltiplos constantes), no a productos de soluciones.'],
        ['Que la suma $y_1(x) + y_2(x)$ es solución solo si $y_1(0) = y_2(0)$', 'Casi: la combinación lineal es solución para cualquier par de soluciones sin importar sus valores iniciales.'],
        ['Que la ecuación tiene únicamente esas dos soluciones particulares', 'Casi: el principio permite construir infinitas soluciones combinándolas, no limita su número.']],
      'Por la linealidad de la derivada, $L(c_1y_1 + c_2y_2) = c_1L(y_1) + c_2L(y_2) = c_1(0) + c_2(0) = 0$.'),

    C('lin-c-falla-nohom', 'linealidad', 1,
      'Dadas dos soluciones $y_1$ y $y_2$ de la ecuación no homogénea $y\'\' + 4y = 8$, ¿qué ecuación satisface su suma $y_1 + y_2$?',
      '$y\'\' + 4y = 16$, por lo que la suma no resuelve la ecuación original', [
        ['$y\'\' + 4y = 8$, porque la superposición siempre vale para ecuaciones con coeficientes constantes', 'Casi: al sumar se duplica el lado derecho: $L(y_1+y_2) = L(y_1)+L(y_2) = 8+8 = 16$.'],
        ['$y\'\' + 4y = 0$, porque los términos independientes se cancelan', 'Casi: los términos independientes se suman ($8 + 8 = 16$), no se restan ni se cancelan.'],
        ['$y\'\' + 4y = 64$, porque el lado derecho se eleva al cuadrado', 'Casi: el operador diferencial es lineal, así que la suma da $8 + 8 = 16$, no $8^2$.']],
      'Para una ecuación no homogénea $L(y) = g$, $L(y_1 + y_2) = L(y_1) + L(y_2) = 2g \\neq g$ si $g \\neq 0$.'),

    C('lin-c-falla-nolin', 'linealidad', 1,
      '¿Por qué el principio de superposición no se cumple para la ecuación diferencial $y\' = y^2$?',
      'Porque la ecuación es no lineal: $(c_1y_1 + c_2y_2)^2 \\neq c_1y_1^2 + c_2y_2^2$', [
        ['Porque es de primer orden y la superposición solo aplica a segundo orden en adelante', 'Casi: en ecuaciones lineales de primer orden como $y\' + Py = 0$ la superposición sí se cumple perfectamente.'],
        ['Porque no tiene soluciones continuas en todo $\\mathbb{R}$', 'Casi: la falla se debe a la no linealidad algebraica del término $y^2$, no al intervalo de definición.'],
        ['Porque la derivada de una suma no es la suma de las derivadas en esta ecuación', 'Casi: la derivada siempre es lineal; lo que falla es la operación no lineal de elevar al cuadrado.']],
      'La linealidad del operador diferencial exige que todas las potencias de la función incógnita sean de grado 1.'),

    C('lin-c-unicidad-intervalo', 'linealidad', 1,
      'Según el teorema de existencia y unicidad para ecuaciones lineales de orden $n$, ¿dónde tiene asegurada una solución única el PVI si los coeficientes $a_k(x)$ y el término independiente son continuos?',
      'En todo intervalo abierto $I$ donde el coeficiente principal $a_n(x) \\neq 0$ y que contenga al punto inicial $x_0$', [
        ['Únicamente en una vecindad infinitesimal alrededor de $x_0$', 'Casi: en ecuaciones lineales la solución existe en todo el intervalo común donde los coeficientes son continuos y $a_n(x) \\neq 0$, no solo localmente.'],
        ['En toda la recta real $\\mathbb{R}$, sin importar dónde se anulen los coeficientes', 'Casi: los puntos donde el coeficiente principal se anula son puntos singulares donde la existencia o unicidad pueden fallar.'],
        ['En cualquier intervalo donde la condición inicial $y(x_0)$ sea estrictamente positiva', 'Casi: el valor de $y(x_0)$ puede ser positivo, negativo o cero sin alterar el intervalo de validez.']],
      'A diferencia de las ecuaciones no lineales, las soluciones de ecuaciones lineales existen en todo el intervalo de continuidad de sus coeficientes normalizados.'),

    C('lin-c-orden-condiciones', 'linealidad', 2,
      'Para garantizar una única solución en un PVI lineal de orden $n$ con coeficientes continuos y $a_n(x) \\neq 0$, ¿cuántas condiciones iniciales especificadas en el mismo punto $x_0$ se requieren?',
      'Exactamente $n$ condiciones: desde $y(x_0)$ hasta la derivada de orden $n - 1$, $y^{(n-1)}(x_0)$', [
        ['Exactamente $n + 1$ condiciones, incluyendo la derivada de orden $n$, $y^{(n)}(x_0)$', 'Casi: la derivada de orden $n$ ya queda completamente determinada por la propia ecuación diferencial.'],
        ['Una sola condición: el valor de la función $y(x_0)$', 'Casi: una sola condición solo basta para primer orden ($n = 1$). Para orden $n$ se deben fijar $n$ constantes.'],
        ['$2n$ condiciones, una para cada derivada y su signo', 'Casi: el teorema de orden $n$ fija exactamente $n$ valores: $y, y\', \\dots, y^{(n-1)}$ en $x_0$.']],
      'Un PVI de orden $n$ requiere fijar $y(x_0), y\'(x_0), \\dots, y^{(n-1)}(x_0)$ para determinar de forma única las $n$ constantes de la solución general.'),

    N('lin-n-intervalo-singular', 'linealidad', 2, { x0: [1, 4, 1], k: [9, 14, 1] },
      function (v) { return 'El problema de valor inicial $(x - ' + v.k + ')y\'\' + xy\' + 2y = 0$ con condiciones en $x_0 = ' + v.x0 + '$ tiene solución única garantizada en el intervalo máximo $(-\\infty, b)$. ¿Cuánto vale el extremo $b$?'; },
      function (v) { return v.k; },
      'Al normalizar la ecuación dividiendo entre $(x - k)$, los coeficientes tienen una discontinuidad en $x = k$. Como $x_0 < k$, el intervalo es $(-\\infty, k)$, por lo que $b = k$.',
      { where: function (v) { return v.k > 2 * v.x0; },
        mistakes: {
          x0val: function (v) { return v.x0; },
          diff: function (v) { return v.k - v.x0; },
          infinite: function () { return 100; }
        },
        feedback: [
          { when: 'x0val', say: 'Casi: $x_0$ es el punto inicial interior al intervalo, no el extremo singular.' },
          { when: 'diff', say: 'Casi: se pide la coordenada $x = b$ del punto singular, no la distancia $b - x_0$.' }
        ] }),

    N('lin-n-longitud-intervalo', 'linealidad', 2, { a: [1, 3, 1], d: [2, 5, 1] },
      function (v) { var r = v.a + v.d; return 'Determina la longitud del intervalo máximo $(a_1, a_2)$ donde el teorema de existencia y unicidad garantiza solución única para $(x^2 - ' + (r * r) + ')y\'\' + \\sin(x)y\' + y = 0$ con condiciones iniciales dadas en $x_0 = ' + v.a + '$.'; },
      function (v) { return 2 * (v.a + v.d); },
      'Las singularidades ocurren en $x = \\pm(a+d)$. Como $x_0 = a$ cae entre ellas, el intervalo es $(-(a+d), a+d)$, cuya longitud es $2(a+d)$.',
      { mistakes: {
          half: function (v) { return v.a + v.d; },
          fromX0: function (v) { return v.d; },
          squared: function (v) { return (v.a + v.d) * (v.a + v.d); }
        },
        feedback: [
          { when: 'half', say: 'Casi: ese es el radio desde el origen; la longitud total de $(-r, r)$ es $2r$.' },
          { when: 'fromX0', say: 'Casi: esa es la distancia de $x_0$ al extremo derecho; la longitud total es $a_2 - a_1$.' }
        ] }),

    N('lin-n-superposicion-eval', 'linealidad', 2, { c1: [3, 6, 1], c2: [1, 2, 1], k: [2, 4, 1] },
      function (v) { return 'Las funciones $y_1 = e^{' + v.k + 'x}$ y $y_2 = e^{-' + v.k + 'x}$ resuelven $y\'\' - ' + (v.k * v.k) + 'y = 0$. Si la combinación $y(x) = ' + v.c1 + 'y_1(x) + ' + v.c2 + 'y_2(x)$ es otra solución, ¿cuánto vale $y\'(0)$?'; },
      function (v) { return v.k * (v.c1 - v.c2); },
      '$y\'(x) = c_1 k e^{kx} - c_2 k e^{-kx}$; al evaluar en $x = 0$ queda $k(c_1 - c_2)$.',
      { where: function (v) { return v.k * (v.c1 - v.c2) !== v.c1 + v.c2; },
        mistakes: {
          sum: function (v) { return v.k * (v.c1 + v.c2); },
          swapped: function (v) { return v.k * (v.c2 - v.c1); },
          noscaling: function (v) { return v.c1 - v.c2; }
        },
        feedback: [
          { when: 'sum', say: 'Casi: la derivada de $e^{-kx}$ aporta un signo negativo: $-k e^{-kx}$, por lo que los coeficientes se restan.' },
          { when: 'swapped', say: 'Casi: el término positivo corresponde a $y_1$, así que es $k(c_1 - c_2)$.' },
          { when: 'noscaling', say: 'Casi: falta multiplicar por la derivada interna $k$.' }
        ] }),

    N('lin-n-combo-trig', 'linealidad', 2, { w: [2, 4, 1], A: [2, 5, 1], B: [2, 5, 1] },
      function (v) { return 'Si $y(x) = ' + v.A + '\\cos(' + v.w + 'x) + ' + v.B + '\\sin(' + v.w + 'x)$ es solución de $y\'\' + ' + (v.w * v.w) + 'y = 0$, calcula el valor de la segunda derivada $y\'\'(0)$.'; },
      function (v) { return -v.w * v.w * v.A; },
      'Como $y\'\' = -w^2y$ y $y(0) = A$, se obtiene directamente $y\'\'(0) = -w^2 A$.',
      { where: function (v) { return v.A !== v.B && v.w * v.A !== v.B; },
        mistakes: {
          pos: function (v) { return v.w * v.w * v.A; },
          firstDeriv: function (v) { return v.w * v.B; },
          sinTerm: function (v) { return -v.w * v.w * v.B; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: la segunda derivada de $\\cos(wx)$ lleva signo negativo: $-w^2\\cos(wx)$.' },
          { when: 'firstDeriv', say: 'Casi: esa es la primera derivada $y\'(0)$, no la segunda derivada $y\'\'(0)$.' },
          { when: 'sinTerm', say: 'Casi: en $x = 0$, $\\sin(0) = 0$, así que el término con seno no contribuye a $y\'\'(0)$.' }
        ] }),

    N('lin-n-orden-derivadas', 'linealidad', 2, { m: [3, 6, 1] },
      function (v) { return 'Para una ecuación diferencial lineal homogénea de orden $' + v.m + '$ con coeficientes continuos y coeficiente principal no nulo, ¿cuántas condiciones iniciales independientes se requieren en un punto $x_0$ para fijar una solución única?'; },
      function (v) { return v.m; },
      'El orden de la ecuación determina la dimensión del espacio de soluciones y por tanto el número exacto de condiciones necesarias.',
      { mistakes: {
          plusOne: function (v) { return v.m + 1; },
          minusOne: function (v) { return v.m - 1; },
          twoM: function (v) { return 2 * v.m; }
        },
        feedback: [
          { when: 'plusOne', say: 'Casi: se requieren exactamente $m$ condiciones ($y, y\', \\dots, y^{(m-1)}$), no $m + 1$.' },
          { when: 'minusOne', say: 'Casi: la derivada más alta en los datos es de orden $m - 1$, pero contando la función $y$ son $m$ condiciones.' }
        ] }),

    N('lin-n-suma-nohom-val', 'linealidad', 2, { g: [3, 7, 1], c: [2, 4, 1] },
      function (v) { return 'Sean $y_1$ y $y_2$ soluciones de la ecuación lineal no homogénea $L(y) = ' + v.g + '$. Al aplicar el operador lineal $L$ a la combinación $z = ' + v.c + 'y_1 + y_2$, ¿qué valor constante se obtiene?'; },
      function (v) { return (v.c + 1) * v.g; },
      '$L(c y_1 + y_2) = c L(y_1) + L(y_2) = c(g) + g = (c + 1)g$.',
      { mistakes: {
          justG: function (v) { return v.g; },
          product: function (v) { return v.c * v.g; },
          zeroVal: function () { return 0; }
        },
        feedback: [
          { when: 'justG', say: 'Casi: por linealidad $L(c y_1 + y_2) = c L(y_1) + L(y_2) = (c+1)g$.' },
          { when: 'product', say: 'Casi: olvidaste sumar el término correspondiente a $L(y_2) = g$.' }
        ] }),

    E('lin-e-diferencia-hom', 'linealidad', 2, { k: [2, 5, 1] },
      function (v) { return 'Dos soluciones de una ecuación lineal no homogénea son $y_1 = x + e^{' + v.k + 'x}$ y $y_2 = x + 3e^{' + v.k + 'x}$. Escribe la solución de la ecuación homogénea asociada dada por su diferencia $y_2 - y_1$.'; },
      function (v) { return '2*e^(' + v.k + '*x)'; },
      'La diferencia de dos soluciones de la ecuación no homogénea satisface la ecuación homogénea: $(x + 3e^{kx}) - (x + e^{kx}) = 2e^{kx}$.',
      { domain: [-1, 1],
        mistakes: {
          noCoeff: function (v) { return 'e^(' + v.k + '*x)'; },
          withX: function (v) { return 'x+2*e^(' + v.k + '*x)'; }
        },
        feedback: [
          { when: 'noCoeff', say: 'Casi: la resta es $3e^{kx} - e^{kx} = 2e^{kx}$.' },
          { when: 'withX', say: 'Casi: al restar $y_2 - y_1$, los términos $x - x$ se cancelan.' }
        ] }),

    N('lin-n-grado-singular', 'linealidad', 3, { p: [1, 3, 1], d: [2, 4, 1] },
      function (v) { var q = v.p + 2 * v.d, x0 = v.p + v.d; return 'Para la ecuación $(x - ' + v.p + ')(x - ' + q + ')y\'\'\' + 4y\' + x\\,y = 0$ con condiciones iniciales en el punto medio $x_0 = ' + x0 + '$, ¿cuál es el radio $R$ del intervalo máximo simétrico $(x_0 - R, x_0 + R)$ con solución única garantizada?'; },
      function (v) { return v.d; },
      'Las singularidades están en $x = p$ y $x = q$. La distancia desde el punto medio $x_0$ a cualquiera de las dos singularidades es $(q - p)/2 = d$.',
      { where: function (v) { return v.d !== v.p && v.d !== 2 * v.p; },
        mistakes: {
          diam: function (v) { return 2 * v.d; },
          posP: function (v) { return v.p; },
          x0val: function (v) { return v.p + v.d; }
        },
        feedback: [
          { when: 'diam', say: 'Casi: esa es la distancia total entre las dos singularidades; el radio desde el punto medio es la mitad.' },
          { when: 'posP', say: 'Casi: el radio es la distancia desde $x_0$ a la singularidad más próxima.' }
        ] }),

    N('lin-n-combinacion-no-hom-cero', 'linealidad', 3, { g: [2, 6, 1], k: [2, 5, 1] },
      function (v) { return 'Si $y_1$ y $y_2$ son dos soluciones distintas de la ecuación lineal no homogénea $L(y) = ' + v.g + '$, y la combinación $y = ' + v.k + 'y_1 + c_2 y_2$ es solución de la ecuación homogénea $L(y) = 0$, ¿cuánto debe valer la constante $c_2$ '; },
      function (v) { return -v.k; },
      'Por linealidad, $L(k y_1 + c_2 y_2) = k g + c_2 g = (k + c_2)g$. Para que sea $0$, se requiere $c_2 = -k$.',
      { mistakes: {
          pos: function (v) { return v.k; },
          zeroVal: function () { return 0; },
          scaled: function (v) { return -v.k * v.g; }
        },
        feedback: [
          { when: 'pos', say: function (v) { return 'Casi: si sumas con signo positivo da $' + (2 * v.k) + ' \\times ' + v.g + ' \\neq 0$; se necesita $c_2 = -' + v.k + '$.'; } },
          { when: 'zeroVal', say: function (v) { return 'Casi: si $c_2 = 0$, quedaría $' + v.k + 'L(y_1) \\neq 0$.'; } }
        ] }),

    N('lin-n-pvi-unicidad-orden3', 'linealidad', 3, { a: [2, 5, 1], b: [1, 4, 1] },
      function (v) { return 'Considera el PVI de tercer orden $y\'\'\' + ' + v.a + 'y\'\' + ' + v.b + 'y\' + 2y = 0$ con condiciones $y(0) = 0$, $y\'(0) = 0$, $y\'\'(0) = 0$. ¿Cuánto vale la solución evaluada en $x = 3.5$?'; },
      function () { return 0; },
      'La función idénticamente nula $y(x) \\equiv 0$ satisface la EDO homogénea y todas las condiciones iniciales. Por unicidad, es la única solución, así que $y(3.5) = 0$.',
      { mistakes: {
          one: function () { return 1; },
          sumCoeff: function (v) { return v.a + v.b; },
          scaled: function (v) { return (v.a + v.b) * 2; }
        },
        feedback: [
          { when: 'one', say: 'Casi: por el teorema de existencia y unicidad con condiciones nulas en una homogénea, la única solución es la trivial $y \\equiv 0$.' },
          { when: 'sumCoeff', say: 'Casi: la solución es idénticamente cero en todo punto, no depende de los coeficientes.' }
        ] }),

    /* ======================= 2. Independencia lineal y Wronskiano (18) ======================= */
    C('wro-c-def', 'wronskiano', 1,
      '¿Cómo se define el Wronskiano $W(y_1, y_2)$ de dos funciones diferenciables $y_1(x)$ y $y_2(x)$?',
      '$W(y_1, y_2) = \\begin{vmatrix} y_1 & y_2 \\\\ y_1\' & y_2\' \\end{vmatrix} = y_1y_2\' - y_1\'y_2$', [
        ['$W(y_1, y_2) = y_1\'y_2\' - y_1y_2$', 'Casi: el determinante es el producto de la diagonal principal menos la secundaria: $y_1y_2\' - y_1\'y_2$.'],
        ['$W(y_1, y_2) = y_1y_2\' + y_1\'y_2$', 'Casi: esa es la regla del producto para la derivada $(y_1y_2)\'$, que lleva signo más; el Wronskiano lleva signo menos.'],
        ['$W(y_1, y_2) = \\frac{y_1y_2\'}{y_1\'y_2}$', 'Casi: el Wronskiano es una resta (un determinante), no una fracción.']],
      'El Wronskiano es el determinante de la matriz con las funciones en el primer renglón y sus derivadas en el segundo.'),

    C('wro-c-signo-orden', 'wronskiano', 1,
      'Si se invierte el orden de las funciones en el Wronskiano de dos funciones, ¿qué relación cumple $W(y_2, y_1)$ con respecto a $W(y_1, y_2)$?',
      '$W(y_2, y_1) = -W(y_1, y_2)$, cambia de signo', [
        ['$W(y_2, y_1) = W(y_1, y_2)$, permanece idéntico', 'Casi: intercambiar dos columnas de un determinante siempre cambia su signo.'],
        ['$W(y_2, y_1) = 1/W(y_1, y_2)$, es el recíproco', 'Casi: el determinante es lineal en sus columnas, no produce el recíproco.'],
        ['$W(y_2, y_1) = 0$', 'Casi: intercambiar las funciones no anula el determinante; solo invierte la resta: $y_2y_1\' - y_2\'y_1 = -(y_1y_2\' - y_1\'y_2)$.']],
      'Al intercambiar las dos columnas de la matriz, el determinante cambia de signo.'),

    C('wro-c-dependencia-cero', 'wronskiano', 1,
      'Si dos funciones diferenciables $y_1$ y $y_2$ son linealmente dependientes en un intervalo $I$ (es decir, $y_2 = c\\,y_1$ con $c$ constante), ¿cuánto vale su Wronskiano $W(y_1, y_2)$ en todo $I$?',
      '$W(y_1, y_2) \\equiv 0$, es idénticamente cero', [
        ['$W(y_1, y_2) = c$, igual a la constante de proporcionalidad', 'Casi: al calcular $y_1(c y_1\') - y_1\'(c y_1) = c(y_1y_1\' - y_1\'y_1) = 0$.'],
        ['$W(y_1, y_2) > 0$ siempre', 'Casi: si son dependientes, las columnas de la matriz son proporcionales y el determinante da exactamente 0.'],
        ['$W(y_1, y_2)$ depende de $x$ y se anula solo en el origen', 'Casi: si una es múltiplo constante de la otra, el Wronskiano es cero en todos los puntos del intervalo.']],
      'Si $y_2 = c y_1$, entonces $y_2\' = c y_1\'$. Al sustituir: $y_1(c y_1\') - y_1\'(c y_1) = 0$ para todo $x$.'),

    C('wro-c-independencia-criterio', 'wronskiano', 1,
      'Si encontramos al menos un punto $x_0 \\in I$ donde el Wronskiano $W(y_1, y_2)(x_0) \\neq 0$, ¿qué se puede concluir con certeza sobre $y_1$ y $y_2$ en $I$?',
      'Que $y_1$ y $y_2$ son linealmente independientes en $I$', [
        ['Que $y_1$ y $y_2$ son linealmente dependientes en $I$', 'Casi: si fueran dependientes su Wronskiano sería cero en todos los puntos; al no ser cero en $x_0$, son independientes.'],
        ['Que ambas funciones deben ser positivas en $I$', 'Casi: el Wronskiano no determina el signo de las funciones individuales.'],
        ['Que $y_1$ y $y_2$ deben ser polinomios', 'Casi: el criterio aplica a cualquier par de funciones diferenciables.']],
      'Si fueran dependientes, $W \\equiv 0$ en todo el intervalo. Por contrarrecíproco, si $W(x_0) \\neq 0$, son independientes.'),

    C('wro-c-wronskiano-3x3', 'wronskiano', 1,
      '¿Qué tamaño tiene la matriz cuyo determinante define el Wronskiano de tres funciones $y_1, y_2, y_3$ y qué derivadas incluye?',
      'Una matriz de $3 \\times 3$, que incluye hasta la segunda derivada $y\'\'$ en el tercer renglón', [
        ['Una matriz de $3 \\times 3$ que incluye hasta la tercera derivada $y\'\'\'$', 'Casi: para 3 funciones la matriz $3\\times 3$ contiene $y$, $y\'$ y $y\'\'$ (hasta orden $n - 1 = 2$).'],
        ['Una matriz de $2 \\times 3$, porque el Wronskiano solo compara de dos en dos', 'Casi: el determinante solo está definido para matrices cuadradas, en este caso $3\\times 3$.'],
        ['Una matriz de $4 \\times 4$ que agrega una fila de ceros', 'Casi: con 3 funciones se usan 3 filas: función, primera derivada y segunda derivada.']],
      'Para $n$ funciones, el Wronskiano es el determinante de una matriz $n \\times n$ con derivadas desde el orden $0$ hasta $n - 1$.'),

    C('wro-c-matriz-general', 'wronskiano', 2,
      'En el cálculo del Wronskiano de $n$ funciones $y_1, \\dots, y_n$, ¿cuál es el elemento de la fila $i$ y columna $j$ (con filas indexadas de $1$ a $n$)?',
      'La derivada de orden $i - 1$ de la función $j$: $y_j^{(i-1)}(x)$', [
        ['La derivada de orden $i$ de la función $j$: $y_j^{(i)}(x)$', 'Casi: la primera fila ($i = 1$) contiene la derivada de orden 0 (la función sin derivar), así que el orden es $i - 1$.'],
        ['La potencia $(y_j(x))^{i-1}$', 'Casi: los renglones corresponden a derivadas sucesivas, no a potencias algebraicas.'],
        ['El producto $y_i(x)y_j(x)$', 'Casi: cada entrada contiene una sola función o su derivada, no un producto.']],
      'La primera fila contiene las funciones sin derivar ($y_j^{(0)}$), la segunda las primeras derivadas ($y_j^{(1)}$), y la fila $n$ las derivadas de orden $n - 1$.'),

    C('wro-c-trig-constante', 'wronskiano', 2,
      'El Wronskiano de las funciones $y_1 = \\cos(\\omega x)$ y $y_2 = \\sin(\\omega x)$ es constante e igual a $\\omega$. ¿Por qué no depende de $x$?',
      'Porque al aplicar la identidad fundamental trigonométrica, $\\cos^2(\\omega x) + \\sin^2(\\omega x) = 1$', [
        ['Porque ambas funciones tienen la misma frecuencia', 'Casi: la frecuencia influye en el valor $\\omega$, pero la independencia de $x$ se debe a que $\\cos^2 + \\sin^2 = 1$.'],
        ['Porque la derivada de $\\sin$ es igual a la derivada de $\\cos$', 'Casi: sus derivadas tienen signos distintos: $(\\cos)\' = -\\omega\\sin$ y $(\\sin)\' = \\omega\\cos$.'],
        ['Porque el Wronskiano de cualquier par de funciones siempre es constante', 'Casi: en general el Wronskiano depende de $x$; por ejemplo, para $x$ y $x^2$ es $x^2$.']],
      '$W = \\cos(\\omega x)(\\omega\\cos(\\omega x)) - (-\\omega\\sin(\\omega x))\\sin(\\omega x) = \\omega(\\cos^2 + \\sin^2) = \\omega$.'),

    N('wro-n-exp-basico', 'wronskiano', 2, { a: [1, 3, 1], b: [4, 7, 1] },
      function (v) { return 'Calcula el Wronskiano de las funciones exponenciales $y_1 = e^{' + v.a + 'x}$ y $y_2 = e^{' + v.b + 'x}$ evaluado en el origen $x = 0$.'; },
      function (v) { return v.b - v.a; },
      '$W(x) = e^{ax}(b e^{bx}) - (a e^{ax})e^{bx} = (b - a)e^{(a+b)x}$. En $x = 0$, $W(0) = b - a$.',
      { mistakes: {
          swapped: function (v) { return v.a - v.b; },
          sum: function (v) { return v.a + v.b; },
          product: function (v) { return v.a * v.b; }
        },
        feedback: [
          { when: 'swapped', say: 'Casi: el orden es $y_1 y_2\' - y_1\' y_2$, lo que da $(b - a)e^{(a+b)x}$, no $a - b$.' },
          { when: 'sum', say: 'Casi: los exponentes se suman en la exponencial, pero el factor constante que multiplica es $b - a$.' },
          { when: 'product', say: 'Casi: no es el producto de las derivadas; es el determinante $y_1 y_2\' - y_1\' y_2$.' }
        ] }),

    N('wro-n-potencias-x', 'wronskiano', 2, { m: [1, 2, 1], n: [3, 4, 1], x0: [2, 3, 1] },
      function (v) { return 'Calcula el Wronskiano de las potencias $y_1 = x^{' + v.m + '}$ y $y_2 = x^{' + v.n + '}$ en el punto $x = ' + v.x0 + '$.'; },
      function (v) { return (v.n - v.m) * Math.pow(v.x0, v.m + v.n - 1); },
      '$W(x) = x^m(n x^{n-1}) - (m x^{m-1})x^n = (n - m)x^{m+n-1}$. Evaluando en $x_0$ se obtiene el resultado.',
      { mistakes: {
          swapped: function (v) { return (v.m - v.n) * Math.pow(v.x0, v.m + v.n - 1); },
          wrongPow: function (v) { return (v.n - v.m) * Math.pow(v.x0, v.m + v.n); },
          zeroVal: function () { return 0; }
        },
        feedback: [
          { when: 'swapped', say: 'Casi: el determinante es $y_1 y_2\' - y_1\' y_2$, dando $(n - m)x^{m+n-1}$.' },
          { when: 'wrongPow', say: 'Casi: al multiplicar $x^m \\cdot x^{n-1}$ el exponente resultante es $m + n - 1$.' }
        ] }),

    N('wro-n-trig-escalado', 'wronskiano', 2, { k: [2, 7, 1] },
      function (v) { return '¿Cuánto vale el Wronskiano $W(\\sin(' + v.k + 'x), \\cos(' + v.k + 'x))$?'; },
      function (v) { return -v.k; },
      '$W = \\sin(kx)(-k\\sin(kx)) - (k\\cos(kx))\\cos(kx) = -k(\\sin^2 + \\cos^2) = -k$.',
      { mistakes: {
          pos: function (v) { return v.k; },
          negOne: function () { return -1; },
          posOne: function () { return 1; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: como la primera función es $\\sin$ y la segunda $\\cos$, $y_1y_2\' - y_1\'y_2 = -k\\sin^2 - k\\cos^2 = -k$.' },
          { when: 'negOne', say: 'Casi: falta la derivada interna $k$ por la regla de la cadena.' }
        ] }),

    N('wro-n-raiz-doble', 'wronskiano', 2, { a: [2, 5, 1] },
      function (v) { return 'Halla el valor del Wronskiano de las soluciones $y_1 = e^{' + v.a + 'x}$ y $y_2 = x\\,e^{' + v.a + 'x}$ en el origen $x = 0$.'; },
      function () { return 1; },
      '$W(x) = e^{ax}(e^{ax} + ax e^{ax}) - a e^{ax}(x e^{ax}) = e^{2ax}$. En $x = 0$, $e^0 = 1$.',
      { mistakes: {
          twoA: function (v) { return 2 * v.a; },
          valA: function (v) { return v.a; },
          zeroVal: function () { return 0; }
        },
        feedback: [
          { when: 'twoA', say: 'Casi: en $x = 0$, $e^{2ax} = e^0 = 1$.' },
          { when: 'valA', say: 'Casi: los términos con $ax$ se cancelan algebraicamente en el Wronskiano: $W(x) = e^{2ax}$.' },
          { when: 'zeroVal', say: 'Casi: las dos soluciones son linealmente independientes, su Wronskiano nunca es cero.' }
        ] }),

    N('wro-n-polinomios', 'wronskiano', 2, { a: [1, 3, 1], b: [8, 11, 1] },
      function (v) { return 'Calcula el Wronskiano de las funciones lineales $y_1 = 1 + ' + v.a + 'x$ y $y_2 = 1 + ' + v.b + 'x$.'; },
      function (v) { return v.b - v.a; },
      '$W(x) = (1 + ax)(b) - a(1 + bx) = b + abx - a - abx = b - a$.',
      { mistakes: {
          swapped: function (v) { return v.a - v.b; },
          sum: function (v) { return v.a + v.b; },
          product: function (v) { return v.a * v.b; }
        },
        feedback: [
          { when: 'swapped', say: 'Casi: $W(y_1, y_2) = (1+ax)b - a(1+bx) = b - a$.' },
          { when: 'product', say: 'Casi: los términos en $x$ se cancelan ($abx - abx = 0$), quedando solo $b - a$.' }
        ] }),

    N('wro-n-sinh-cosh', 'wronskiano', 2, { k: [2, 6, 1] },
      function (v) { return 'Sabiendo que $(\\cosh u)\' = \\sinh u$ y $(\\sinh u)\' = \\cosh u$, con $\\cosh^2 u - \\sinh^2 u = 1$, calcula el Wronskiano $W(\\cosh(' + v.k + 'x), \\sinh(' + v.k + 'x))$.'; },
      function (v) { return v.k; },
      '$W = \\cosh(kx)(k\\cosh(kx)) - (k\\sinh(kx))\\sinh(kx) = k(\\cosh^2 - \\sinh^2) = k(1) = k$.',
      { mistakes: {
          neg: function (v) { return -v.k; },
          one: function () { return 1; },
          twoK: function (v) { return 2 * v.k; }
        },
        feedback: [
          { when: 'neg', say: 'Casi: para funciones hiperbólicas $\\cosh^2 u - \\sinh^2 u = +1$, así que el signo resultante es positivo: $+k$.' },
          { when: 'one', say: 'Casi: falta la derivada interna $k$ proveniente de la regla de la cadena.' }
        ] }),

    N('wro-n-log-x', 'wronskiano', 2, { x0: [2, 6, 1] },
      function (v) { return 'Para las funciones $y_1 = x$ y $y_2 = x\\ln x$ (con $x > 0$), ¿cuánto vale su Wronskiano evaluado en $x = ' + v.x0 + '$?'; },
      function (v) { return v.x0; },
      '$W(x) = x(\\ln x + 1) - 1\\cdot(x\\ln x) = x$. En $x = x_0$, $W(x_0) = x_0$.',
      { mistakes: {
          one: function () { return 1; },
          squared: function (v) { return v.x0 * v.x0; },
          zeroVal: function () { return 0; }
        },
        feedback: [
          { when: 'one', say: 'Casi: el Wronskiano simplifica a $W(x) = x$, no a la constante $1$.' },
          { when: 'squared', say: 'Casi: al expandir $x(\\ln x + 1) - 1(x\\ln x)$, los términos con logaritmo se cancelan y queda $x$.' }
        ] }),

    E('wro-e-wronskiano-exp', 'wronskiano', 2, { a: [1, 3, 1], b: [4, 6, 1] },
      function (v) { return 'Calcula la expresión simplificada del Wronskiano $W(e^{' + v.a + 'x}, e^{-' + v.b + 'x})$.'; },
      function (v) { return '-' + (v.a + v.b) + '*e^(' + (v.a - v.b) + '*x)'; },
      '$W = e^{ax}(-b e^{-bx}) - a e^{ax} e^{-bx} = -(a + b)e^{(a - b)x}$.',
      { domain: [-1, 1],
        mistakes: {
          pos: function (v) { return (v.a + v.b) + '*e^(' + (v.a - v.b) + '*x)'; },
          diffCoeff: function (v) { return (v.b - v.a) + '*e^(' + (v.a - v.b) + '*x)'; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: ambos términos son negativos: $-b e^{(a-b)x} - a e^{(a-b)x} = -(a+b)e^{(a-b)x}$.' },
          { when: 'diffCoeff', say: 'Casi: como el exponente de $y_2$ tiene signo negativo, se suma en magnitud: $-(a+b)$.' }
        ] }),

    N('wro-n-wronskiano-3x3-val', 'wronskiano', 3, { a: [2, 6, 1] },
      function (v) { return 'Calcula el Wronskiano $W(1, x, ' + v.a + 'x^2)$ en cualquier punto $x$.'; },
      function (v) { return 2 * v.a; },
      'La matriz con renglones $(1, x, ax^2)$, $(0, 1, 2ax)$, $(0, 0, 2a)$ es triangular respecto a ceros en la primera columna, con determinante $1 \\times 1 \\times 2a = 2a$.',
      { mistakes: {
          valA: function (v) { return v.a; },
          fourA: function (v) { return 4 * v.a; },
          zeroVal: function () { return 0; }
        },
        feedback: [
          { when: 'valA', say: 'Casi: la segunda derivada de $x^2$ es $2$, por lo que el determinante da $2a$.' },
          { when: 'zeroVal', say: 'Casi: las potencias $1, x, x^2$ son linealmente independientes, su Wronskiano no se anula.' }
        ] }),

    N('wro-n-wronskiano-3-exp', 'wronskiano', 3, { a: [1, 2, 1], b: [4, 5, 1] },
      function (v) { return 'Calcula el Wronskiano de las tres funciones $y_1 = 1$, $y_2 = e^{' + v.a + 'x}$ y $y_3 = e^{' + v.b + 'x}$ evaluado en $x = 0$.'; },
      function (v) { return v.a * v.b * (v.b - v.a); },
      'Al evaluar en $x = 0$ la primera columna es $(1, 0, 0)^T$, reduciendo el determinante a $ab^2 - a^2b = ab(b - a)$.',
      { where: function (v) { return v.b - v.a > 1; },
        mistakes: {
          swapped: function (v) { return -v.a * v.b * (v.b - v.a); },
          diffOnly: function (v) { return v.b - v.a; },
          productOnly: function (v) { return v.a * v.b; }
        },
        feedback: [
          { when: 'swapped', say: 'Casi: el determinante es $1(ab^2 - a^2b) = ab(b - a)$, con signo positivo porque $b > a$.' },
          { when: 'diffOnly', say: 'Casi: el determinante $3\\times 3$ en $x=0$ produce $ab(b - a)$ (tipo Vandermonde).' }
        ] }),

    N('wro-n-independencia-param', 'wronskiano', 3, { k: [2, 6, 1] },
      function (v) { return 'Determina el Wronskiano de $y_1 = x^2$ y $y_2 = x^2 - ' + v.k + 'x$ evaluado en $x = 2$.'; },
      function (v) { return v.k * 4; },
      '$W(x) = x^2(2x - k) - 2x(x^2 - kx) = kx^2$. En $x = 2$, $W(2) = 4k$.',
      { mistakes: {
          valK: function (v) { return v.k; },
          neg: function (v) { return -v.k * 4; },
          zeroVal: function () { return 0; }
        },
        feedback: [
          { when: 'valK', say: 'Casi: el Wronskiano simplifica a $kx^2$; en $x = 2$ da $4k$.' },
          { when: 'neg', say: 'Casi: $y_1 y_2\' - y_1\' y_2 = x^2(2x - k) - 2x(x^2 - kx) = +kx^2$.' }
        ] }),

    /* ======================= 3. Fórmula de Abel y propiedades del Wronskiano (15) ======================= */
    C('abe-c-formula', 'abel', 1,
      'Para la ecuación diferencial $y\'\' + P(x)y\' + Q(x)y = 0$, ¿qué establece la fórmula de Abel para el Wronskiano $W(x)$ de dos soluciones?',
      '$W(x) = C\\,e^{-\\int P(x)\\,dx}$, donde $C$ es una constante', [
        ['$W(x) = C\\,e^{+\\int P(x)\\,dx}$, con signo positivo en el exponente', 'Casi: la ecuación diferencial que satisface es $W\' + P(x)W = 0$, cuya solución lleva signo menos: $e^{-\\int P\\,dx}$.'],
        ['$W(x) = C\\,e^{-\\int Q(x)\\,dx}$, dependiendo únicamente de $Q(x)$', 'Casi: el coeficiente que entra en la fórmula de Abel es el de la primera derivada $P(x)$, no $Q(x)$.'],
        ['$W(x) = C\\,(P(x) + Q(x))$', 'Casi: la relación es exponencial debido al factor integrante de $W\' + PW = 0$.']],
      'Derivando $W$ y sustituyendo $y\'\' = -Py\' - Qy$ se deduce $W\' + P(x)W = 0$, cuya solución es $W(x) = C e^{-\\int P(x)dx}$.'),

    C('abe-c-cero-o-nunca', 'abel', 1,
      'Como consecuencia directa de la fórmula de Abel $W(x) = C e^{-\\int P(x)\\,dx}$ en un intervalo $I$ donde $P$ es continuo, ¿cómo se comporta el Wronskiano de dos soluciones?',
      'O bien es idénticamente cero en todo $I$ (si $C = 0$), o nunca se anula en ningún punto de $I$ (si $C \\neq 0$)', [
        ['Se anula exactamente en los puntos donde la solución $y_1(x) = 0$', 'Casi: la exponencial nunca es cero; si $C \\neq 0$, $W(x)$ jamás se anula, aun cuando las soluciones individuales crucen por cero.'],
        ['Siempre oscila alrededor de cero cambiando de signo periódicamente', 'Casi: como la función exponencial $e^{-\\int P}$ es estrictamente positiva, $W(x)$ mantiene un signo constante determinado por $C$.'],
        ['Vale cero en los extremos del intervalo y es positivo en el interior', 'Casi: si no es idénticamente cero, no se anula en ningún punto donde $P$ sea continua.']],
      'Dado que $e^{-\\int P dx} > 0$ para todo $x$, el signo y la anulación de $W(x)$ dependen únicamente de la constante $C$.'),

    C('abe-c-funciones-arbitrarias', 'abel', 1,
      '¿Por qué el hecho de que $W(x_0) = 0$ en un punto aislado NO garantiza que dos funciones diferenciables arbitrarias $f(x)$ y $g(x)$ sean linealmente dependientes?',
      'Porque la fórmula de Abel solo aplica a soluciones de una ecuación lineal homogénea; funciones arbitrarias pueden tener $W(x_0) = 0$ sin ser múltiplos', [
        ['Porque el Wronskiano solo funciona para funciones trigonométricas', 'Casi: el Wronskiano se define para cualquier par de funciones diferenciables.'],
        ['Porque para funciones arbitrarias $W(x)$ siempre es constante', 'Casi: el Wronskiano de funciones arbitrarias puede variar y cruzar por cero sin que una sea múltiplo constante de la otra.'],
        ['Porque se requiere evaluar la tercera derivada antes de concluir', 'Casi: para dos funciones el Wronskiano solo involucra hasta la primera derivada.']],
      'La propiedad de ser idénticamente cero o nunca cero requiere que ambas funciones resuelvan la misma EDO lineal homogénea.'),

    C('abe-c-forma-estandar', 'abel', 1,
      'Al usar la fórmula de Abel en la ecuación $2x\\,y\'\' + 6y\' + x^2y = 0$, ¿cuál es la función $P(x)$ correcta que debe integrarse?',
      '$P(x) = \\frac{6}{2x} = \\frac{3}{x}$, tras dividir toda la ecuación entre el coeficiente principal $2x$', [
        ['$P(x) = 6$, tomando directamente el coeficiente de $y\'$', 'Casi: la fórmula de Abel requiere que la ecuación esté en forma estándar con coeficiente $1$ en $y\'\'$.'],
        ['$P(x) = 2x$, usando el coeficiente de la segunda derivada', 'Casi: $2x$ es $a_2(x)$; al normalizar queda $P(x) = a_1/a_2 = 3/x$.'],
        ['$P(x) = -\\frac{3}{x}$, agregando un signo menos anticipado', 'Casi: en la ecuación estándar $y\'\' + Py\' + Qy = 0$, $P(x) = +3/x$; el signo menos va en la fórmula $e^{-\\int P}$.']],
      'La fórmula de Abel se deduce para $y\'\' + P(x)y\' + Q(x)y = 0$, por lo que se debe normalizar dividiendo entre el coeficiente de $y\'\'$.'),

    C('abe-c-constante-w0', 'abel', 1,
      'Si conocemos el valor del Wronskiano en un punto inicial $x_0$, $W(x_0) = W_0$, ¿cómo se expresa la fórmula de Abel en términos de una integral definida?',
      '$W(x) = W_0\\,\\exp\\left(-\\int_{x_0}^x P(t)\\,dt\\right)$', [
        ['$W(x) = W_0 - \\int_{x_0}^x P(t)\\,dt$', 'Casi: la ecuación diferencial es multiplicativa en $W$ ($W\'/W = -P$), por lo que resulta una exponencial, no una resta.'],
        ['$W(x) = W_0\\,\\exp\\left(+\\int_{x_0}^x P(t)\\,dt\\right)$', 'Casi: el exponente lleva signo menos: $-\\int_{x_0}^x P(t)\\,dt$.'],
        ['$W(x) = \\frac{W_0}{\\int_{x_0}^x P(t)\\,dt}$', 'Casi: la solución analítica de $W\' + PW = 0$ es una función exponencial.']],
      'Integrando $W\'/W = -P(t)$ desde $x_0$ hasta $x$ se obtiene $\\ln(W(x)/W_0) = -\\int_{x_0}^x P(t)dt$, dando $W(x) = W_0 e^{-\\int_{x_0}^x P(t)dt}$.'),

    C('abe-c-coeficientes-constantes', 'abel', 2,
      'Para la ecuación con coeficientes constantes $y\'\' + a\\,y\' + b\\,y = 0$, ¿qué forma tiene el Wronskiano de cualquier par de soluciones según Abel?',
      '$W(x) = C\\,e^{-ax}$, donde $a$ es el coeficiente de $y\'$', [
        ['$W(x) = C\\,e^{-bx}$, gobernado por el término independiente $b$', 'Casi: el exponente depende del coeficiente de $y\'$, que es $a$, no de $b$.'],
        ['$W(x) = C\\,e^{+ax}$, con signo positivo en el exponente', 'Casi: la fórmula de Abel lleva signo menos: $e^{-\\int a\\,dx} = e^{-ax}$.'],
        ['$W(x) = C$, siempre constante para cualquier ecuación con coeficientes constantes', 'Casi: solo es constante si $a = 0$ (sin término en primera derivada). Si $a \\neq 0$, decae o crece exponencialmente.']],
      'Con $P(x) = a$ constante, $\\int P\\,dx = ax$, por lo que $W(x) = C e^{-ax}$.'),

    N('abe-n-calc-w1', 'abel', 2, { k: [2, 4, 1], mult: [2, 5, 1] },
      function (v) { return 'Para la ecuación $x^2y\'\' - ' + v.k + 'x\\,y\' + 4y = 0$ (con $x > 0$), el Wronskiano de dos soluciones satisface la fórmula de Abel. Si $W(1) = ' + v.mult + '$, ¿cuánto vale $W(2)$?'; },
      function (v) { return v.mult * Math.pow(2, v.k); },
      'En forma estándar $P(x) = -k/x$. Por Abel, $W(x) = C e^{\\int k/x\\,dx} = C x^k$. Con $W(1) = m$, $W(2) = m(2^k)$.',
      { mistakes: {
          negPow: function (v) { return v.mult / Math.pow(2, v.k); },
          linear: function (v) { return v.mult * 2; },
          noChange: function (v) { return v.mult; }
        },
        feedback: [
          { when: 'negPow', say: 'Casi: en forma estándar $P(x) = -k/x$, así que $-\\int P\\,dx = +k\\ln x$ y $W(x) = C x^k$.' },
          { when: 'linear', say: 'Casi: el factor de escala es $2^k$, no simplemente $2$.' },
          { when: 'noChange', say: 'Casi: $W(x)$ depende de $x$ a través de la fórmula de Abel; no es constante.' }
        ] }),

    N('abe-n-exponente-abel', 'abel', 2, { a: [4, 8, 2], b: [2, 3, 1] },
      function (v) { return 'Dada la ecuación $' + v.b + 'y\'\' + ' + v.a + 'y\' + 5y = 0$, el Wronskiano de dos soluciones tiene la forma $W(x) = C e^{r x}$. ¿Cuánto vale el coeficiente $r$ en el exponente?'; },
      function (v) { return -v.a / v.b; },
      'Dividiendo entre el coeficiente principal queda $P(x) = a/b$. Por Abel, $W(x) = C e^{-(a/b)x}$, por lo que $r = -a/b$.',
      { mistakes: {
          pos: function (v) { return v.a / v.b; },
          noNorm: function (v) { return -v.a; },
          invNorm: function (v) { return -v.b / v.a; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: la fórmula de Abel lleva signo negativo: $r = -P = -a/b$.' },
          { when: 'noNorm', say: 'Casi: primero debes dividir entre el coeficiente de $y\'\'$.' }
        ] }),

    N('abe-n-wronskiano-constante', 'abel', 2, { k: [3, 5, 1], w0: [3, 8, 1] },
      function (v) { return 'Para la ecuación $y\'\' + ' + (v.k * v.k) + 'y = 0$, no hay término con $y\'$ ($P(x) = 0$). Si el Wronskiano de dos soluciones vale $W(1) = ' + v.w0 + '$, ¿cuánto vale $W(5)$?'; },
      function (v) { return v.w0; },
      'Como el coeficiente de $y\'$ es cero ($P(x) = 0$), $W\'(x) = 0$, por lo que $W(x)$ es constante en todo $\\mathbb{R}$: $W(5) = W(1)$.',
      { mistakes: {
          scaled2: function (v) { return v.w0 * 2; },
          zeroVal: function () { return 0; },
          timesK: function (v) { return v.w0 * v.k; }
        },
        feedback: [
          { when: 'scaled2', say: 'Casi: como $P(x) = 0$, $W(x)$ es estrictamente constante para todo $x$.' },
          { when: 'zeroVal', say: 'Casi: por Abel, si $W(1) \\neq 0$, jamás se anula en ningún otro punto.' }
        ] }),

    N('abe-n-constante-c', 'abel', 2, { p: [2, 4, 1], w0: [2, 6, 1] },
      function (v) { return 'En la ecuación $x\\,y\'\' + 2y\' + x\\,y = 0$ (con $x > 0$), el Wronskiano de dos soluciones es $W(x) = C/x^2$. Si en $x = ' + v.p + '$ se tiene $W(' + v.p + ') = ' + v.w0 + '$, ¿cuánto vale la constante $C$?'; },
      function (v) { return v.w0 * v.p * v.p; },
      'De $W(x) = C/x^2$, sustituyendo $x = p$ se tiene $w_0 = C/p^2$, de modo que $C = w_0 p^2$.',
      { mistakes: {
          divided: function (v) { return v.w0 / (v.p * v.p); },
          linear: function (v) { return v.w0 * v.p; },
          justW0: function (v) { return v.w0; }
        },
        feedback: [
          { when: 'divided', say: 'Casi: para despejar $C$ en $W = C/x^2$, debes multiplicar: $C = W(x) \\cdot x^2$.' },
          { when: 'linear', say: 'Casi: el denominador es $x^2$, no $x$.' }
        ] }),

    N('abe-n-cociente-wronskiano', 'abel', 2, { k: [2, 4, 1] },
      function (v) { return 'Para la ecuación $x\\,y\'\' - ' + v.k + 'y\' + 3x^2y = 0$ en $x > 0$, ¿cuánto vale el cociente $\\frac{W(3)}{W(1)}$ para cualquier par de soluciones con $W(1) \\neq 0$?'; },
      function (v) { return Math.pow(3, v.k); },
      'Al normalizar, $P(x) = -k/x$, así que $W(x) = C x^k$. Por tanto, $W(3)/W(1) = 3^k$.',
      { mistakes: {
          linear: function (v) { return 3 * v.k; },
          justBase: function () { return 3; },
          zeroVal: function () { return 0; }
        },
        feedback: [
          { when: 'linear', say: 'Casi: el cociente es $(3/1)^k = 3^k$, no $3k$.' },
          { when: 'justBase', say: 'Casi: la relación depende del exponente $k$: $W(3)/W(1) = 3^k$.' }
        ] }),

    E('abe-e-formula-simbolica', 'abel', 2, { k: [2, 5, 1] },
      function (v) { return 'Escribe la función del Wronskiano $W(x)$ para soluciones de $y\'\' + ' + v.k + 'y\' - 4y = 0$, sabiendo que en $x = 0$ se tiene $W(0) = 1$.'; },
      function (v) { return 'e^(-' + v.k + '*x)'; },
      'Por la fórmula de Abel con $P(x) = k$ y $W(0) = 1$, $W(x) = 1\\cdot e^{-\\int_0^x k\\,dt} = e^{-kx}$.',
      { domain: [0, 2],
        mistakes: {
          pos: function (v) { return 'e^(' + v.k + '*x)'; },
          minusP: function (v) { return '-' + v.k + '*x'; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: por la fórmula de Abel el exponente lleva signo negativo: $-\\int k\\,dx = -kx$.' },
          { when: 'minusP', say: 'Casi: el Wronskiano es una exponencial $e^{-\\int P}$, no el exponente solo.' }
        ] }),

    N('abe-n-derivada-wronskiano', 'abel', 3, { p: [2, 6, 1], w: [3, 8, 1] },
      function (v) { return 'En un punto $x_0$, los coeficientes de $y\'\' + ' + v.p + 'y\' + 4y = 0$ dan $P(x_0) = ' + v.p + '$. Si el Wronskiano de dos soluciones vale $W(x_0) = ' + v.w + '$, ¿cuánto vale su derivada $W\'(x_0)$?'; },
      function (v) { return -v.p * v.w; },
      'De la ecuación diferencial $W\' + P(x)W = 0$, se despeja $W\'(x_0) = -P(x_0)W(x_0) = -p\\cdot w$.',
      { mistakes: {
          pos: function (v) { return v.p * v.w; },
          zeroVal: function () { return 0; },
          diff: function (v) { return v.w - v.p; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: de la identidad $W\' + P(x)W = 0$ se despeja $W\' = -P(x)W$, que lleva signo negativo.' },
          { when: 'zeroVal', say: 'Casi: $W\'(x) = 0$ solo si $P = 0$ o $W = 0$.' }
        ] }),

    N('abe-n-cociente-singulares', 'abel', 3, { mult: [2, 6, 1] },
      function (v) { var w1 = v.mult * 8; return 'Para la ecuación de Cauchy-Euler $x^2y\'\' + 3x\\,y\' + y = 0$ (con $x > 0$), el Wronskiano satisface la fórmula de Abel. Si $W(1) = ' + w1 + '$, ¿cuánto vale $W(2)$?'; },
      function (v) { return v.mult; },
      'En forma estándar $y\'\' + \\frac{3}{x}y\' + \\frac{1}{x^2}y = 0$, por lo que $W(x) = C/x^3$. Con $W(1) = 8m$, $W(2) = 8m/8 = m$.',
      { mistakes: {
          multBy8: function (v) { return v.mult * 64; },
          divBy2: function (v) { return v.mult * 4; },
          noChange: function (v) { return v.mult * 8; }
        },
        feedback: [
          { when: 'multBy8', say: 'Casi: en forma estándar $P(x) = +3/x$, así que $W(x) = C/x^3$ (decrece con $x$), no $C x^3$.' },
          { when: 'divBy2', say: 'Casi: el denominador es $2^3 = 8$, no $2$.' }
        ] }),

    N('abe-n-pvi-inverso-abel', 'abel', 3, { k: [2, 5, 1], c: [2, 5, 1] },
      function (v) { return 'Dos soluciones de $y\'\' - 2y\' + y = 0$ tienen Wronskiano $W(0) = ' + v.c + '$. ¿Para qué valor de $x$ el Wronskiano toma el valor $' + v.c + 'e^{' + (2 * v.k) + '}$?'; },
      function (v) { return v.k; },
      'Por la fórmula de Abel con $P(x) = -2$, $W(x) = c e^{2x}$. Igualando a $c e^{2k}$ se obtiene $2x = 2k \\implies x = k$.',
      { mistakes: {
          doubleVal: function (v) { return 2 * v.k; },
          halfVal: function (v) { return v.k / 2; },
          neg: function (v) { return -v.k; }
        },
        feedback: [
          { when: 'doubleVal', say: function (v) { return 'Casi: como $W(x) = C e^{2x}$, se iguala $2x = ' + (2 * v.k) + '$, de donde $x = ' + v.k + '$.'; } },
          { when: 'halfVal', say: 'Casi: el exponente es $2x$, no $4x$.' }
        ] }),

    /* ======================= 4. Conjunto fundamental y solución general (17) ======================= */
    C('fun-c-def', 'fundamental', 1,
      '¿Qué es un conjunto fundamental de soluciones para una ecuación diferencial lineal homogénea de orden $n$ en un intervalo $I$?',
      'Un conjunto de $n$ soluciones linealmente independientes en $I$', [
        ['Cualquier conjunto de soluciones, sin importar si son dependientes o cuántas sean', 'Casi: deben ser exactamente $n$ soluciones y deben ser linealmente independientes entre sí.'],
        ['Un conjunto de soluciones que se anulan simultáneamente en el origen', 'Casi: si se anularan todas en el origen su Wronskiano sería cero y no serían independientes.'],
        ['Un conjunto de $n + 1$ soluciones particulares de la no homogénea', 'Casi: el conjunto fundamental pertenece a la homogénea y tiene exactamente $n$ soluciones.']],
      'El espacio de soluciones de una homogénea de orden $n$ tiene dimensión $n$; una base está formada por $n$ soluciones independientes.'),

    C('fun-c-sol-general-hom', 'fundamental', 1,
      'Si $\\{y_1, y_2, \\dots, y_n\\}$ es un conjunto fundamental de soluciones de una ecuación lineal homogénea de orden $n$, ¿cómo se expresa su solución general?',
      '$y(x) = c_1y_1(x) + c_2y_2(x) + \\dots + c_ny_n(x)$, con $c_i$ constantes arbitrarias', [
        ['$y(x) = y_1(x) \\cdot y_2(x) \\cdots y_n(x) + C$, como el producto más una constante', 'Casi: la solución general es una combinación lineal (suma ponderada), no un producto.'],
        ['$y(x) = c_1y_1(x) + c_2y_2(x)$, con solo dos constantes para cualquier orden', 'Casi: para orden $n$ se requieren exactamente $n$ constantes arbitrarias.'],
        ['$y(x) = c_1y_1\'(x) + \\dots + c_ny_n\'(x)$, sumando las derivadas', 'Casi: se combinan las soluciones originales, no sus derivadas.']],
      'Todo elemento del espacio vectorial de soluciones se escribe de forma única como combinación lineal de los elementos de la base fundamental.'),

    C('fun-c-estructura-nohom', 'fundamental', 1,
      '¿Cuál es la estructura de la solución general de una ecuación lineal no homogénea $L(y) = g(x)$?',
      '$y = y_h + y_p$, donde $y_h$ es la solución general de la homogénea y $y_p$ es una solución particular de la no homogénea', [
        ['$y = y_h \\cdot y_p$, el producto de la homogénea por la particular', 'Casi: las soluciones se suman ($y_h + y_p$), no se multiplican.'],
        ['$y = y_p$, la solución particular sola sin constantes', 'Casi: $y_p$ es solo una solución fija; para tener la solución general se debe sumar toda la familia homogénea $y_h$.'],
        ['$y = y_h - g(x)$, restando el término independiente', 'Casi: la particular $y_p$ se encuentra resolviendo la ecuación, no restando $g(x)$ directamente.']],
      'Si $y$ y $y_p$ resuelven $L(y) = g$, entonces $L(y - y_p) = g - g = 0$, por lo que $y - y_p = y_h$, es decir, $y = y_h + y_p$.'),

    C('fun-c-dimension', 'fundamental', 1,
      '¿Cuál es la dimensión del espacio vectorial de soluciones de una ecuación diferencial lineal homogénea de orden $n$ en un intervalo $I$ donde sus coeficientes son continuos?',
      'Exactamente $n$', [
        ['Infinita, porque hay infinitas funciones en el intervalo', 'Casi: aunque hay infinitas soluciones, todas se generan combinando exactamente $n$ funciones base.'],
        ['$n - 1$, el orden de la derivada más alta en las condiciones iniciales', 'Casi: la dimensión es igual al orden de la ecuación, $n$.'],
        ['$2n$, considerando la parte real e imaginaria por separado', 'Casi: la dimensión sobre los números reales o complejos es exactamente $n$.']],
      'Existe un isomorfismo lineal entre el espacio de soluciones y $\\mathbb{R}^n$ dado por los valores iniciales $(y(x_0), y\'(x_0), \\dots, y^{(n-1)}(x_0))$.'),

    C('fun-c-prueba-fundamental', 'fundamental', 1,
      'Para verificar que dos funciones $y_1$ y $y_2$ forman un conjunto fundamental de una ecuación homogénea de segundo orden, ¿qué dos cosas se deben comprobar?',
      'Que ambas funciones sean soluciones de la ecuación y que su Wronskiano sea no nulo en el intervalo', [
        ['Que ambas funciones tengan la misma integral y derivadas iguales', 'Casi: no deben tener derivadas iguales (serían dependientes); deben ser independientes y resolver la ecuación.'],
        ['Que se anulen en el mismo punto y tengan asíntotas verticales', 'Casi: las soluciones de lineales con coeficientes continuos no tienen asíntotas en el intervalo.'],
        ['Solo que su Wronskiano no sea cero, sin importar si resuelven la ecuación', 'Casi: dos funciones pueden tener $W \\neq 0$ pero no ser soluciones de la EDO dada.']],
      'Deben pertenecer al espacio de soluciones (resolver la EDO) y formar una base (ser linealmente independientes, lo que equivale a $W \\neq 0$).'),

    C('fun-c-independencia-potencias', 'fundamental', 2,
      '¿Son las funciones $y_1 = x$ y $y_2 = x^2$ linealmente independientes en todo $\\mathbb{R}$?',
      'Sí, porque ninguna es un múltiplo escalar constante de la otra ($x^2 / x = x$ no es constante)', [
        ['No, porque en $x = 0$ ambas valen cero y su Wronskiano se anula ahí', 'Casi: que se anulen en un punto no las hace dependientes; para ser dependientes una debe ser $c$ veces la otra para todo $x$.'],
        ['No, porque ambas son potencias enteras de $x$', 'Casi: potencias distintas de $x$ ($x^m$ con distintos $m$) son siempre linealmente independientes.'],
        ['Solo para $x > 0$, en los negativos son dependientes', 'Casi: son independientes en cualquier intervalo que contenga más de un punto.']],
      'Si $c_1 x + c_2 x^2 = 0$ para todo $x$, evaluando en $x = 1$ y $x = -1$ se concluye $c_1 = c_2 = 0$.'),

    N('fun-n-orden-dimension', 'fundamental', 2, { n: [3, 7, 1] },
      function (v) { return '¿Cuántas soluciones linealmente independientes integran el conjunto fundamental de una ecuación diferencial lineal homogénea de orden $' + v.n + '$?'; },
      function (v) { return v.n; },
      'El espacio de soluciones de una ecuación lineal homogénea de orden $n$ tiene dimensión exactamente $n$.',
      { mistakes: {
          nMinus1: function (v) { return v.n - 1; },
          nPlus1: function (v) { return v.n + 1; },
          twoN: function (v) { return 2 * v.n; }
        },
        feedback: [
          { when: 'nMinus1', say: 'Casi: se necesitan exactamente $n$ soluciones para igualar el orden de la ecuación.' },
          { when: 'nPlus1', say: 'Casi: con $n + 1$ soluciones en un espacio de dimensión $n$, forzosamente una dependería de las demás.' }
        ] }),

    N('fun-n-eval-general', 'fundamental', 2, { c1: [3, 6, 1], c2: [2, 4, 1], k: [1, 3, 1] },
      function (v) { return 'Si la solución general de $y\'\' - ' + (v.k * v.k) + 'y = 0$ es $y(x) = c_1e^{' + v.k + 'x} + c_2e^{-' + v.k + 'x}$, ¿cuánto vale $y(0)$ cuando $c_1 = ' + v.c1 + '$ y $c_2 = ' + v.c2 + '$?'; },
      function (v) { return v.c1 + v.c2; },
      '$y(0) = c_1 e^0 + c_2 e^0 = c_1 + c_2$.',
      { where: function (v) { return v.c1 > v.c2; },
        mistakes: {
          diff: function (v) { return v.c1 - v.c2; },
          c1Only: function (v) { return v.c1; },
          scaled: function (v) { return (v.c1 + v.c2) * 2; }
        },
        feedback: [
          { when: 'diff', say: 'Casi: en $x = 0$, $e^0 = 1$, así que $y(0) = c_1(1) + c_2(1) = c_1 + c_2$.' },
          { when: 'c1Only', say: 'Casi: ambas exponenciales valen $1$ en $x = 0$, por lo que se suman ambas constantes.' }
        ] }),

    N('fun-n-combo-derivada', 'fundamental', 2, { c1: [1, 4, 1], c2: [2, 5, 1], w: [2, 5, 1] },
      function (v) { return 'Para la solución general $y(x) = c_1\\cos(' + v.w + 'x) + c_2\\sin(' + v.w + 'x)$ de $y\'\' + ' + (v.w * v.w) + 'y = 0$, calcula el valor de la derivada $y\'(0)$ con las constantes $c_1 = ' + v.c1 + '$ y $c_2 = ' + v.c2 + '$.'; },
      function (v) { return v.c2 * v.w; },
      '$y\'(0) = -c_1 w\\sin(0) + c_2 w\\cos(0) = c_2 w$.',
      { mistakes: {
          withC1: function (v) { return -v.c1 * v.w; },
          noW: function (v) { return v.c2; },
          sumCoeff: function (v) { return (v.c1 + v.c2) * v.w; }
        },
        feedback: [
          { when: 'withC1', say: 'Casi: en $x = 0$, la derivada de $\\cos$ contiene $\\sin(0) = 0$, así que $c_1$ no aparece en $y\'(0)$.' },
          { when: 'noW', say: function (v) { return 'Casi: por la regla de la cadena, $(\\sin wx)\' = w\\cos wx$, por lo que se multiplica por $' + v.w + '$.'; } }
        ] }),

    N('fun-n-euler-eval', 'fundamental', 2, { c1: [1, 3, 1], c2: [2, 5, 1], x0: [2, 4, 1] },
      function (v) { return 'El conjunto fundamental de $x^2y\'\' - 2xy\' + 2y = 0$ es $\\{x, x^2\\}$. Con las constantes $c_1 = ' + v.c1 + '$ y $c_2 = ' + v.c2 + '$, ¿cuánto vale $y(' + v.x0 + ')$?'; },
      function (v) { return v.c1 * v.x0 + v.c2 * v.x0 * v.x0; },
      '$y(x) = c_1 x + c_2 x^2$. Evaluando en $x_0$ se obtiene $c_1 x_0 + c_2 x_0^2$.',
      { mistakes: {
          noSquare: function (v) { return (v.c1 + v.c2) * v.x0; },
          deriv: function (v) { return v.c1 + 2 * v.c2 * v.x0; },
          swapped: function (v) { return v.c2 * v.x0 + v.c1 * v.x0 * v.x0; }
        },
        feedback: [
          { when: 'noSquare', say: function (v) { return 'Casi: el segundo término lleva $x^2$, es decir, $' + v.c2 + ' \\times (' + v.x0 + ')^2$.'; } },
          { when: 'deriv', say: function (v) { return 'Casi: esa es la derivada $y\'(' + v.x0 + ')$, no el valor de la función $y(' + v.x0 + ')$.'; } }
        ] }),

    N('fun-n-nohom-suma', 'fundamental', 2, { yp0: [2, 5, 1], c1: [1, 3, 1], c2: [2, 4, 1] },
      function (v) { return 'Para la ecuación no homogénea $y\'\' - y = 3$, la solución general es $y = c_1e^x + c_2e^{-x} + y_p(x)$, donde $y_p(0) = ' + v.yp0 + '$. Si $c_1 = ' + v.c1 + '$ y $c_2 = ' + v.c2 + '$, ¿cuánto vale $y(0)$?'; },
      function (v) { return v.c1 + v.c2 + v.yp0; },
      '$y(0) = c_1(1) + c_2(1) + y_p(0) = c_1 + c_2 + y_p(0)$.',
      { mistakes: {
          noYp: function (v) { return v.c1 + v.c2; },
          minusYp: function (v) { return v.c1 + v.c2 - v.yp0; },
          scaled: function (v) { return (v.c1 + v.c2) * 2; }
        },
        feedback: [
          { when: 'noYp', say: 'Casi: la solución general de la no homogénea incluye el término particular: $y = y_h + y_p$.' },
          { when: 'minusYp', say: 'Casi: la solución particular se suma, no se resta.' }
        ] }),

    E('fun-e-sol-general-trig', 'fundamental', 2, { w: [2, 6, 1] },
      function (v) { return 'Escribe la función solución particular $y(x)$ de $y\'\' + ' + (v.w * v.w) + 'y = 0$ correspondiente a elegir las constantes $c_1 = 2$ y $c_2 = 3$ en el conjunto fundamental $\\{\\cos(' + v.w + 'x), \\sin(' + v.w + 'x)\\}$.'; },
      function (v) { return '2*cos(' + v.w + '*x)+3*sin(' + v.w + '*x)'; },
      'La combinación lineal con $c_1 = 2$ y $c_2 = 3$ es $y(x) = 2\\cos(wx) + 3\\sin(wx)$.',
      { domain: [0, 2],
        mistakes: {
          swapped: function (v) { return '3*cos(' + v.w + '*x)+2*sin(' + v.w + '*x)'; },
          minus: function (v) { return '2*cos(' + v.w + '*x)-3*sin(' + v.w + '*x)'; }
        },
        feedback: [
          { when: 'swapped', say: 'Casi: $c_1$ acompaña al coseno y $c_2$ al seno.' },
          { when: 'minus', say: 'Casi: ambas constantes son positivas, por lo que los términos se suman.' }
        ] }),

    N('fun-n-indep-determinante', 'fundamental', 2, { k: [1, 3, 1], m: [4, 6, 1] },
      function (v) { return 'Verifica la independencia lineal del par $\\{e^{' + v.k + 'x}, e^{' + v.m + 'x}\\}$ calculando su Wronskiano en $x = 0$.'; },
      function (v) { return v.m - v.k; },
      '$W(0) = 1(m) - k(1) = m - k \\neq 0$. Como no se anula, las soluciones son independientes y forman un conjunto fundamental.',
      { mistakes: {
          swapped: function (v) { return v.k - v.m; },
          product: function (v) { return v.k * v.m; },
          zeroVal: function () { return 0; }
        },
        feedback: [
          { when: 'swapped', say: 'Casi: el Wronskiano es $y_1 y_2\' - y_1\' y_2 = (m - k)e^{(k+m)x}$, lo que en $x = 0$ da $m - k$.' },
          { when: 'zeroVal', say: 'Casi: al tener exponentes distintos ($k \\neq m$), las soluciones son independientes.' }
        ] }),

    N('fun-n-segunda-deriv-combo', 'fundamental', 3, { c1: [2, 4, 1], c2: [1, 3, 1], a: [2, 4, 1] },
      function (v) { return 'Para la solución $y(x) = ' + v.c1 + 'e^{' + v.a + 'x} + ' + v.c2 + 'x\\,e^{' + v.a + 'x}$ de una ecuación con raíz doble, halla el valor de la segunda derivada $y\'\'(0)$.'; },
      function (v) { return v.c1 * v.a * v.a + 2 * v.c2 * v.a; },
      '$y\'\'(0) = c_1 a^2 + 2 c_2 a$, ya que $(x e^{ax})\'\'|_{x=0} = 2a$.',
      { mistakes: {
          no2: function (v) { return v.c1 * v.a * v.a + v.c2 * v.a; },
          firstTermOnly: function (v) { return v.c1 * v.a * v.a; },
          linear: function (v) { return (v.c1 + v.c2) * v.a; }
        },
        feedback: [
          { when: 'no2', say: 'Casi: al derivar dos veces $x e^{ax}$, por la regla del producto el término central es $2 a e^{ax}$.' },
          { when: 'firstTermOnly', say: 'Casi: $(x e^{ax})\'\'$ evaluado en 0 da $2a$, por lo que $c_2$ también contribuye a la segunda derivada.' }
        ] }),

    N('fun-n-orden-tres-eval', 'fundamental', 3, { c1: [1, 3, 1], c2: [2, 4, 1], c3: [1, 3, 1] },
      function (v) { return 'La solución general de $y\'\'\' = 0$ es $y(x) = c_1 + c_2x + c_3x^2$. Si $c_1 = ' + v.c1 + '$, $c_2 = ' + v.c2 + '$ y $c_3 = ' + v.c3 + '$, ¿cuánto vale $y\'\'(1)$?'; },
      function (v) { return 2 * v.c3; },
      '$y\'(x) = c_2 + 2c_3x$, y derivando otra vez $y\'\'(x) = 2c_3$. En cualquier punto $x$, $y\'\'(1) = 2c_3$.',
      { mistakes: {
          valC3: function (v) { return v.c3; },
          evalFunc: function (v) { return v.c1 + v.c2 + v.c3; },
          firstDeriv: function (v) { return v.c2 + 2 * v.c3; }
        },
        feedback: [
          { when: 'valC3', say: 'Casi: la segunda derivada de $x^2$ es $2$, por lo que $y\'\' = 2c_3$.' },
          { when: 'evalFunc', say: 'Casi: esa es la función $y(1)$, pero se pide la segunda derivada $y\'\'(1)$.' }
        ] }),

    E('fun-e-raiz-doble-combo', 'fundamental', 3, { r: [2, 5, 1] },
      function (v) { return 'Escribe la solución $y(x)$ del PVI $y\'\' - ' + (2 * v.r) + 'y\' + ' + (v.r * v.r) + 'y = 0$ con condiciones $y(0) = 1$ y $y\'(0) = ' + (v.r + 1) + '$.'; },
      function (v) { return '(1+x)*e^(' + v.r + '*x)'; },
      'La general es $y = (c_1 + c_2x)e^{rx}$. Con $y(0) = 1 \\implies c_1 = 1$, y $y\'(0) = r + c_2 = r + 1 \\implies c_2 = 1$, por lo que $y(x) = (1+x)e^{rx}$.',
      { domain: [-1, 1],
        mistakes: {
          noXterm: function (v) { return 'e^(' + v.r + '*x)'; },
          minusX: function (v) { return '(1-x)*e^(' + v.r + '*x)'; }
        },
        feedback: [
          { when: 'noXterm', say: function (v) { return 'Casi: con $y\'(0) = ' + (v.r + 1) + '$, la constante $c_2 = 1$, por lo que el término $x e^{rx}$ debe estar presente.'; } },
          { when: 'minusX', say: 'Casi: de $r(1) + c_2 = r + 1$ se obtiene $c_2 = +1$, no $-1$.' }
        ] }),

    N('fun-n-no-hom-valor-x', 'fundamental', 3, { a: [1, 3, 1], b: [2, 4, 1] },
      function (v) { return 'Para la ecuación no homogénea $y\'\' + 4y = 8$, una solución particular constante es $y_p = 2$. Si la solución general es $y(x) = ' + v.a + '\\cos(2x) + ' + v.b + '\\sin(2x) + 2$, ¿cuánto vale $y(0)$?'; },
      function (v) { return v.a + 2; },
      '$y(0) = a\\cos(0) + b\\sin(0) + 2 = a(1) + 0 + 2 = a + 2$.',
      { mistakes: {
          noYp: function (v) { return v.a; },
          withB: function (v) { return v.a + v.b + 2; },
          justYp: function () { return 2; }
        },
        feedback: [
          { when: 'noYp', say: 'Casi: falta sumar el término particular $y_p(0) = 2$.' },
          { when: 'withB', say: function (v) { return 'Casi: en $x = 0$, $\\sin(0) = 0$, así que la constante $' + v.b + '$ no contribuye a $y(0)$.'; } }
        ] }),

    /* ======================= 5. Problemas de valor inicial de orden superior (17) ======================= */
    C('pvi-c-sistema-det', 'pvi', 1,
      'Al resolver un PVI de segundo orden $y(x_0) = y_0$, $y\'(x_0) = y_0\'$ a partir del conjunto fundamental $\\{y_1, y_2\\}$, ¿cuál es el determinante del sistema lineal de $2 \\times 2$ para las constantes $c_1$ y $c_2$?',
      'El Wronskiano de las dos soluciones evaluado en el punto inicial, $W(y_1, y_2)(x_0)$', [
        ['La suma de las condiciones iniciales $y_0 + y_0\'$', 'Casi: las condiciones iniciales forman el vector de términos independientes, no el determinante del sistema.'],
        ['El producto de las soluciones $y_1(x_0)y_2(x_0)$', 'Casi: el determinante es $y_1(x_0)y_2\'(x_0) - y_1\'(x_0)y_2(x_0)$, que es exactamente el Wronskiano.'],
        ['Siempre vale $1$, sin importar las funciones elegidas', 'Casi: el determinante vale $W(x_0)$, que no necesariamente es $1$.']],
      'Las ecuaciones son $c_1y_1(x_0) + c_2y_2(x_0) = y_0$ y $c_1y_1\'(x_0) + c_2y_2\'(x_0) = y_0\'$. La matriz de coeficientes tiene como determinante exactamente a $W(x_0)$.'),

    C('pvi-c-solucion-unica', 'pvi', 1,
      '¿Por qué el sistema para determinar las constantes $c_1, c_2$ en un PVI lineal homogéneo de segundo orden siempre tiene solución única?',
      'Porque $\\{y_1, y_2\\}$ es un conjunto fundamental, lo que garantiza que el determinante del sistema $W(x_0) \\neq 0$', [
        ['Porque las condiciones iniciales siempre son números positivos', 'Casi: la unicidad es válida para cualesquiera valores reales de las condiciones iniciales.'],
        ['Porque toda matriz de $2 \\times 2$ es invertible', 'Casi: una matriz solo es invertible si su determinante es distinto de cero, lo cual aquí está garantizado por la independencia lineal.'],
        ['Porque el orden de la ecuación es par', 'Casi: la unicidad se cumple para cualquier orden $n$ gracias a que las $n$ soluciones son linealmente independientes.']],
      'Por la regla de Cramer, el sistema tiene solución única si y solo si su determinante es no nulo. Como las soluciones forman un conjunto fundamental, $W(x_0) \\neq 0$.'),

    C('pvi-c-condiciones-origen', 'pvi', 1,
      'Si en un PVI lineal homogéneo de segundo orden las dos condiciones iniciales son nulas, $y(0) = 0$ y $y\'(0) = 0$, ¿cuál es la solución en todo su intervalo de definición?',
      'La solución trivial $y(x) \\equiv 0$', [
        ['No existe ninguna solución que cumpla ambas condiciones a la vez', 'Casi: la función cero cumple la ecuación homogénea y ambas condiciones.'],
        ['Hay infinitas soluciones distintas que pasan por el origen con pendiente cero', 'Casi: el teorema de unicidad asegura que hay exactamente una única solución.'],
        ['$y(x) = e^x - 1$', 'Casi: esa función no es solución en general y además su derivada en 0 vale $e^0 = 1 \\neq 0$.']],
      'La función idénticamente nula $y(x) = 0$ resuelve la ecuación homogénea y cumple $y(0) = 0, y\'(0) = 0$. Por el teorema de unicidad, es la única solución.'),

    C('pvi-c-datos-distintos-puntos', 'pvi', 1,
      'Si en lugar de especificar $y(x_0)$ y $y\'(x_0)$ en el mismo punto, se especifican $y(a) = A$ y $y(b) = B$ con $a \\neq b$, ¿cómo se llama este problema y qué diferencia tiene con un PVI?',
      'Es un problema de valores en la frontera (PVF), y no siempre tiene solución única (puede tener cero, una o infinitas)', [
        ['Sigue siendo un PVI común y siempre tiene solución única garantizada', 'Casi: las condiciones en puntos distintos forman un problema de frontera, donde la existencia y unicidad pueden fallar.'],
        ['Es un problema mal planteado que nunca tiene ninguna solución', 'Casi: muchos problemas de frontera sí tienen solución única, pero otros no.'],
        ['Es una ecuación diferencial no lineal', 'Casi: la ecuación sigue siendo lineal; lo que cambia es el tipo de condiciones impuestas.']],
      'Un PVI fija derivadas en un único punto $x_0$ y tiene unicidad asegurada. Un PVF especifica condiciones en puntos distintos y su determinante puede anularse.'),

    C('pvi-c-orden-tres-pvi', 'pvi', 1,
      'Para fijar completamente la solución de un PVI de tercer orden $y\'\'\' + P(x)y\'\' + Q(x)y\' + R(x)y = 0$, ¿qué condiciones iniciales en $x_0$ se deben proporcionar?',
      '$y(x_0)$, $y\'(x_0)$ y $y\'\'(x_0)$', [
        ['Solo $y(x_0)$ y $y\'(x_0)$', 'Casi: para tercer orden hay 3 constantes arbitrarias; con dos condiciones quedaría una constante libre.'],
        ['$y(x_0)$, $y\'(x_0)$, $y\'\'(x_0)$ y $y\'\'\'(x_0)$', 'Casi: la tercera derivada $y\'\'\'(x_0)$ se calcula despejando directamente de la EDO, no se fija como dato inicial.'],
        ['Tres valores de la función en puntos distintos: $y(x_1), y(x_2), y(x_3)$', 'Casi: en un PVI todas las condiciones deben darse en el mismo punto inicial $x_0$.']],
      'Se requieren $n = 3$ condiciones iniciales en el mismo punto: la función y sus derivadas hasta el orden $n - 1 = 2$.'),

    N('pvi-n-c1-exp', 'pvi', 2, { A: [3, 7, 1], B: [1, 5, 1] },
      function (v) { return 'La solución general de $y\'\' - y = 0$ es $y = c_1e^x + c_2e^{-x}$. Si $y(0) = ' + v.A + '$ y $y\'(0) = ' + v.B + '$, ¿cuánto vale la constante $c_1$?'; },
      function (v) { return (v.A + v.B) / 2; },
      '$c_1 + c_2 = A$ y $c_1 - c_2 = B$. Sumando ambas ecuaciones: $2c_1 = A + B \\implies c_1 = (A + B)/2$.',
      { where: function (v) { return (v.A + v.B) % 2 === 0 && v.A > v.B; },
        mistakes: {
          c2val: function (v) { return (v.A - v.B) / 2; },
          sumOnly: function (v) { return v.A + v.B; },
          negVal: function (v) { return -(v.A + v.B) / 2; }
        },
        feedback: [
          { when: 'c2val', say: 'Casi: ese es el valor de $c_2 = (A - B)/2$; para $c_1$ se suman las dos ecuaciones: $c_1 = (A + B)/2$.' },
          { when: 'sumOnly', say: 'Casi: falta dividir entre $2$: $2c_1 = A + B \\implies c_1 = (A + B)/2$.' }
        ] }),

    N('pvi-n-c2-exp', 'pvi', 2, { A: [4, 8, 1], B: [2, 6, 1] },
      function (v) { return 'En el PVI $y\'\' - y = 0$ con solución general $y = c_1e^x + c_2e^{-x}$, si los valores iniciales son $y(0) = ' + v.A + '$ y $y\'(0) = ' + v.B + '$, determina el valor de $c_2$.'; },
      function (v) { return (v.A - v.B) / 2; },
      'Restando $c_1 - c_2 = B$ de $c_1 + c_2 = A$ resulta $2c_2 = A - B \\implies c_2 = (A - B)/2$.',
      { where: function (v) { return (v.A - v.B) % 2 === 0 && v.A > v.B + 1; },
        mistakes: {
          c1val: function (v) { return (v.A + v.B) / 2; },
          diffOnly: function (v) { return v.A - v.B; },
          negVal: function (v) { return -(v.A - v.B) / 2; }
        },
        feedback: [
          { when: 'c1val', say: 'Casi: ese es $c_1$. Restando la segunda ecuación de la primera queda $2c_2 = A - B$.' },
          { when: 'diffOnly', say: 'Casi: recuerda dividir entre $2$: $c_2 = (A - B)/2$.' }
        ] }),

    N('pvi-n-trig-c1', 'pvi', 2, { y0: [2, 6, 1], yp0: [2, 6, 1], w: [2, 4, 1] },
      function (v) { return 'La solución general de $y\'\' + ' + (v.w * v.w) + 'y = 0$ es $y = c_1\\cos(' + v.w + 'x) + c_2\\sin(' + v.w + 'x)$. Si $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + v.yp0 + '$, ¿cuánto vale $c_1$?'; },
      function (v) { return v.y0; },
      'Evaluando en $x = 0$, $y(0) = c_1\\cos(0) + c_2\\sin(0) = c_1$. Por lo tanto, $c_1 = y_0$.',
      { mistakes: {
          scaled: function (v) { return v.y0 * v.w; },
          zeroVal: function () { return 0; },
          neg: function (v) { return -v.y0; }
        },
        feedback: [
          { when: 'scaled', say: 'Casi: la condición $y(0) = c_1(1) + c_2(0) = c_1$ no requiere multiplicar por $w$.' },
          { when: 'zeroVal', say: 'Casi: $\\cos(0) = 1$, por lo que $c_1$ es exactamente $y(0)$.' }
        ] }),

    N('pvi-n-trig-c2', 'pvi', 2, { w: [2, 5, 1], mult: [2, 6, 1] },
      function (v) { var yp0 = v.w * v.mult; return 'Para el oscilador armónico $y\'\' + ' + (v.w * v.w) + 'y = 0$ con solución $y = c_1\\cos(' + v.w + 'x) + c_2\\sin(' + v.w + 'x)$, con $y(0) = 1$ y rapidez inicial $y\'(0) = ' + yp0 + '$, calcula el coeficiente $c_2$.'; },
      function (v) { return v.mult; },
      '$y\'(x) = -c_1 w\\sin(wx) + c_2 w\\cos(wx)$. En $x = 0$, $y\'(0) = w c_2 = w\\cdot m \\implies c_2 = m$.',
      { mistakes: {
          timesW: function (v) { return v.mult * v.w * v.w; },
          justYp0: function (v) { return v.w * v.mult; },
          zeroVal: function () { return 0; }
        },
        feedback: [
          { when: 'timesW', say: 'Casi: debes dividir $y\'(0)$ entre $w$, no multiplicar: $c_2 = y\'(0)/w$.' },
          { when: 'justYp0', say: function (v) { return 'Casi: por la regla de la cadena, $y\'(0) = c_2 w$, por lo que debes dividir entre $' + v.w + '$.'; } }
        ] }),

    N('pvi-n-raiz-doble-c2', 'pvi', 2, { a: [2, 4, 1], y0: [2, 5, 1], extra: [2, 5, 1] },
      function (v) { var yp0 = v.a * v.y0 + v.extra; return 'La solución general de $y\'\' - ' + (2 * v.a) + 'y\' + ' + (v.a * v.a) + 'y = 0$ es $y = c_1e^{' + v.a + 'x} + c_2x\\,e^{' + v.a + 'x}$. Si $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + yp0 + '$, ¿cuánto vale $c_2$?'; },
      function (v) { return v.extra; },
      '$c_1 = y(0) = y_0$. Luego $y\'(0) = a c_1 + c_2 = a y_0 + \\text{extra} \\implies c_2 = \\text{extra}$.',
      { where: function (v) { return v.extra !== v.y0; },
        mistakes: {
          c1val: function (v) { return v.y0; },
          yp0val: function (v) { return v.a * v.y0 + v.extra; },
          zeroVal: function () { return 0; }
        },
        feedback: [
          { when: 'c1val', say: 'Casi: ese es $c_1 = y(0)$. Para $c_2$ se despeja de $y\'(0) = a c_1 + c_2$.' },
          { when: 'yp0val', say: 'Casi: la derivada en 0 es $y\'(0) = a c_1 + c_2$; debes restar $a c_1$.' }
        ] }),

    N('pvi-n-euler-pvi', 'pvi', 2, { A: [1, 3, 1], B: [8, 12, 1] },
      function (v) { return 'Para la ecuación de Cauchy-Euler con solución general $y = c_1x + c_2x^2$ (en $x > 0$), se imponen las condiciones $y(1) = ' + v.A + '$ y $y\'(1) = ' + v.B + '$. ¿Cuánto vale $c_2$?'; },
      function (v) { return v.B - v.A; },
      'El sistema en $x = 1$ es $c_1 + c_2 = A$ y $c_1 + 2c_2 = B$. Restando ambas ecuaciones se obtiene directamente $c_2 = B - A$.',
      { mistakes: {
          c1val: function (v) { return 2 * v.A - v.B; },
          sum: function (v) { return v.A + v.B; },
          zeroVal: function () { return 0; }
        },
        feedback: [
          { when: 'c1val', say: 'Casi: ese es el valor de $c_1 = 2A - B$. Restando $c_1 + c_2 = A$ de $c_1 + 2c_2 = B$ se obtiene $c_2 = B - A$.' },
          { when: 'sum', say: 'Casi: las ecuaciones se restan para eliminar $c_1$, no se suman.' }
        ] }),

    N('pvi-n-suma-constantes', 'pvi', 2, { c1: [2, 5, 1], c2: [2, 5, 1] },
      function (v) { return 'Al resolver el PVI $y\'\' + y\' - 6y = 0$ con solución general $y = c_1e^{2x} + c_2e^{-3x}$, se obtienen $c_1 = ' + v.c1 + '$ y $c_2 = ' + v.c2 + '$. ¿Cuánto valía la condición inicial $y(0)$?'; },
      function (v) { return v.c1 + v.c2; },
      'Evaluando en $x = 0$, $y(0) = c_1 e^0 + c_2 e^0 = c_1 + c_2$.',
      { where: function (v) { return v.c1 !== v.c2; },
        mistakes: {
          diff: function (v) { return Math.abs(v.c1 - v.c2); },
          product: function (v) { return v.c1 * v.c2; },
          scaled: function (v) { return (v.c1 + v.c2) * 2; }
        },
        feedback: [
          { when: 'diff', say: 'Casi: en $x = 0$ los términos se suman: $y(0) = c_1(1) + c_2(1)$.' },
          { when: 'product', say: 'Casi: en una combinación lineal los coeficientes se suman ponderados por la función, no se multiplican.' }
        ] }),

    E('pvi-e-solucion-pvi', 'pvi', 2, { a: [2, 5, 1] },
      function (v) { return 'Halla la función solución única $y(x)$ del PVI $y\'\' - ' + (v.a * v.a) + 'y = 0$ con condiciones iniciales $y(0) = 1$ y $y\'(0) = ' + v.a + '$.'; },
      function (v) { return 'e^(' + v.a + '*x)'; },
      '$c_1 + c_2 = 1$ y $a(c_1 - c_2) = a \\implies c_1 = 1, c_2 = 0$, por lo que la solución es $y(x) = e^{ax}$.',
      { domain: [-1, 1],
        mistakes: {
          neg: function (v) { return 'e^(-' + v.a + '*x)'; },
          cosh: function (v) { return 'cosh(' + v.a + '*x)'; }
        },
        feedback: [
          { when: 'neg', say: 'Casi: para $e^{-ax}$ la derivada en $0$ es $-a$, pero la condición dada es $+a$.' },
          { when: 'cosh', say: 'Casi: $\\cosh(ax)$ tiene derivada cero en $x = 0$, no $a$.' }
        ] }),

    N('pvi-n-tres-condiciones', 'pvi', 2, { c1: [1, 3, 1], c2: [1, 3, 1], c3: [4, 7, 1] },
      function (v) { var y0 = v.c1 + v.c3, yp0 = v.c2 + v.c3; return 'La solución general de $y\'\'\' - y\'\' = 0$ es $y(x) = c_1 + c_2x + c_3e^x$. Si un PVI impone $y(0) = ' + y0 + '$, $y\'(0) = ' + yp0 + '$ y $y\'\'(0) = ' + v.c3 + '$, ¿cuánto vale $c_3$?'; },
      function (v) { return v.c3; },
      'Como $y\'\'(x) = c_3 e^x$, al evaluar en $x = 0$ se tiene directamente $y\'\'(0) = c_3$.',
      { where: function (v) { return v.c1 !== v.c2; },
        mistakes: {
          c2val: function (v) { return v.c2; },
          y0val: function (v) { return v.c1 + v.c3; },
          yp0val: function (v) { return v.c2 + v.c3; }
        },
        feedback: [
          { when: 'c2val', say: 'Casi: ese es el coeficiente de $x$. La segunda derivada de $x$ es cero, así que $y\'\'(0) = c_3$.' },
          { when: 'y0val', say: 'Casi: ese es $y(0) = c_1 + c_3$, no $c_3$.' }
        ] }),

    N('pvi-n-eval-punto-no-cero', 'pvi', 3, { k: [2, 5, 1] },
      function (v) { return 'Resuelve el PVI $y\'\' + ' + (v.k * v.k) + 'y = 0$ con $y(0) = 0$ y $y\'(0) = ' + v.k + '$. ¿Cuánto vale la solución evaluada en $x = \\frac{\\pi}{' + (2 * v.k) + '}$?'; },
      function () { return 1; },
      'La solución con $y(0) = 0$ y $y\'(0) = k$ es $y(x) = \\sin(kx)$. Evaluando en $x = \\pi/(2k)$ resulta $\\sin(\\pi/2) = 1$.',
      { mistakes: {
          zeroVal: function () { return 0; },
          valK: function (v) { return v.k; },
          negOne: function () { return -1; }
        },
        feedback: [
          { when: 'zeroVal', say: 'Casi: en $x = \\pi/(2k)$ el argumento es $k(\\pi/(2k)) = \\pi/2$, donde $\\sin(\\pi/2) = 1$.' },
          { when: 'valK', say: 'Casi: la solución es $y(x) = \\sin(kx)$ sin factor $k$ enfrente.' }
        ] }),

    N('pvi-n-cramer-wronskiano', 'pvi', 3, { y0: [2, 6, 1], yp0: [2, 8, 2] },
      function (v) { return 'Para el PVI $y\'\' - 4y = 0$ con $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + v.yp0 + '$, el Wronskiano de $\\{e^{2x}, e^{-2x}\\}$ en $0$ es $-4$. ¿Cuánto vale la constante $c_1$ de la solución $y = c_1e^{2x} + c_2e^{-2x}$?'; },
      function (v) { return (2 * v.y0 + v.yp0) / 4; },
      'De $c_1 + c_2 = y_0$ y $2c_1 - 2c_2 = y_0\'$, multiplicamos la primera por $2$ y sumamos: $4c_1 = 2y_0 + y_0\' \\implies c_1 = (2y_0 + y_0\')/4$.',
      { where: function (v) { return (2 * v.y0 + v.yp0) % 4 === 0 && (2 * v.y0 - v.yp0) !== 0; },
        mistakes: {
          c2val: function (v) { return (2 * v.y0 - v.yp0) / 4; },
          sumOnly: function (v) { return (v.y0 + v.yp0) / 2; },
          zeroVal: function () { return 0; }
        },
        feedback: [
          { when: 'c2val', say: 'Casi: ese es $c_2 = (2y_0 - y\'_0)/4$. Para $c_1$ se suma $2y_0 + y\'_0$ y se divide entre $4$.' },
          { when: 'sumOnly', say: 'Casi: los coeficientes de las derivadas son $2$ y $-2$, por lo que se divide entre el determinante $4$.' }
        ] }),

    E('pvi-e-pvi-nohom-expr', 'pvi', 3, { k: [2, 5, 1] },
      function (v) { return 'Escribe la solución $y(x)$ del PVI no homogéneo $y\'\' + y = ' + v.k + '$ con condiciones $y(0) = ' + v.k + '$ y $y\'(0) = 1$.'; },
      function (v) { return 'sin(x)+' + v.k; },
      'La solución general es $y = c_1\\cos x + c_2\\sin x + k$. Con $y(0) = k \\implies c_1 = 0$, y $y\'(0) = 1 \\implies c_2 = 1$, resulta $y(x) = \\sin x + k$.',
      { domain: [0, 3],
        mistakes: {
          withCos: function (v) { return 'cos(x)+sin(x)+' + v.k; },
          noK: function () { return 'sin(x)'; }
        },
        feedback: [
          { when: 'withCos', say: 'Casi: como $y(0) = c_1 + k = k$, la constante del coseno es $c_1 = 0$.' },
          { when: 'noK', say: 'Casi: falta la solución particular constante $y_p = k$.' }
        ] }),

    /* ======================= 6. Reducción de orden (17) ======================= */
    C('red-c-idea-sustitucion', 'reduccion', 1,
      'En el método de reducción de orden de D\'Alembert, al conocer una solución no nula $y_1(x)$ de $y\'\' + P(x)y\' + Q(x)y = 0$, ¿qué sustitución se propone para hallar una segunda solución independiente?',
      '$y_2(x) = v(x)\\,y_1(x)$, donde $v(x)$ es una función no constante por determinar', [
        ['$y_2(x) = y_1(x) + v(x)$, sumando una función', 'Casi: se multiplica por $v(x)$ ($y_2 = v\\,y_1$); si se sumara no se aprovecharía que $y_1$ resuelve la ecuación lineal.'],
        ['$y_2(x) = [y_1(x)]^2$, elevando al cuadrado la primera solución', 'Casi: en general el cuadrado de una solución no resuelve la ecuación diferencial.'],
        ['$y_2(x) = y_1\'(x)$, tomando simplemente la derivada de la primera solución', 'Casi: la derivada solo es solución en casos muy particulares de coeficientes constantes homogéneos.']],
      'Al proponer $y_2 = v(x)y_1(x)$, la regla del producto hace que los términos con $v(x)$ sumen $v(y_1\'\' + Py_1\' + Qy_1) = 0$, reduciendo la ecuación a una de primer orden en $w = v\'$.'),

    C('red-c-cancelacion-v', 'reduccion', 1,
      'Al sustituir $y_2 = v\\,y_1$ en la ecuación $y\'\' + P(x)y\' + Q(x)y = 0$, ¿por qué desaparece completamente el término que contiene a $v(x)$ sin derivar?',
      'Porque su coeficiente es $y_1\'\' + P(x)y_1\' + Q(x)y_1$, que vale cero ya que $y_1$ es solución de la ecuación', [
        ['Porque se asume que $v(x) = 0$', 'Casi: si $v(x) = 0$ tendríamos la solución trivial; lo que se anula es el paréntesis que multiplica a $v$.'],
        ['Porque $Q(x) = 0$ en toda ecuación donde se aplica reducción de orden', 'Casi: el método funciona con cualquier $Q(x)$; la cancelación ocurre gracias a que $y_1$ resuelve la EDO completa.'],
        ['Por un error de simplificación que se corrige al final', 'Casi: es la propiedad matemática exacta en la que se fundamenta el método.']],
      'Al agrupar términos en $v$, queda $v\\cdot(y_1\'\' + Py_1\' + Qy_1)$. Como $y_1$ resuelve la ecuación homogénea, ese paréntesis es idénticamente cero.'),

    C('red-c-formula-integral', 'reduccion', 1,
      '¿Cuál es la fórmula cerrada para la segunda solución $y_2(x)$ en términos de $y_1(x)$ y del coeficiente $P(x)$ de la forma estándar?',
      '$y_2(x) = y_1(x)\\displaystyle\\int \\frac{e^{-\\int P(x)\\,dx}}{[y_1(x)]^2}\\,dx$', [
        ['$y_2(x) = \\displaystyle\\int \\frac{e^{-\\int P(x)\\,dx}}{[y_1(x)]^2}\\,dx$, sin multiplicar por $y_1(x)$ al final', 'Casi: esa integral es la función $v(x)$; la segunda solución completa es $y_2 = v(x)\\,y_1(x)$.'],
        ['$y_2(x) = y_1(x)\\displaystyle\\int \\frac{e^{+\\int P(x)\\,dx}}{[y_1(x)]^2}\\,dx$, con exponente positivo', 'Casi: el exponente lleva signo menos: $-\\int P(x)\\,dx$, idéntico al factor integrante de Abel.'],
        ['$y_2(x) = y_1(x)\\displaystyle\\int \\frac{[y_1(x)]^2}{e^{-\\int P(x)\\,dx}}\\,dx$', 'Casi: el término $y_1^2$ va en el denominador, no en el numerador.']],
      'Resolviendo $w\' + (2y_1\'/y_1 + P)w = 0$ se obtiene $w = v\' = \\frac{e^{-\\int P dx}}{y_1^2}$, e integrando se llega a $y_2 = y_1 \\int \\frac{e^{-\\int P dx}}{y_1^2} dx$.'),

    C('red-c-forma-estandar-aviso', 'reduccion', 1,
      'Si te dan la ecuación $x^2y\'\' + x\\,y\' - 4y = 0$ con una solución conocida $y_1 = x^2$, ¿cuál es el primer paso indispensable antes de aplicar la fórmula de reducción de orden?',
      'Dividir toda la ecuación entre $x^2$ para identificar correctamente $P(x) = 1/x$', [
        ['Integrar directamente tomando $P(x) = x$', 'Casi: la fórmula parte de la forma estándar $y\'\' + Py\' + Qy = 0$; si no divides entre $x^2$, $P(x)$ queda mal identificado.'],
        ['Cambiar la variable independiente de $x$ a $t = \\ln x$', 'Casi: no es obligatorio cambiar de variable; basta dividir entre el coeficiente principal $x^2$.'],
        ['Calcular el Wronskiano con una función supuesta', 'Casi: primero debes tener $P(x)$ de la forma estándar para construir la segunda solución.']],
      'La fórmula de reducción de orden se deduce asumiendo que el coeficiente de $y\'\'$ es $1$.'),

    C('red-c-raiz-doble-origen', 'reduccion', 1,
      'Cuando la ecuación característica de coeficientes constantes tiene una raíz doble $r$, sabemos que $y_1 = e^{rx}$ es solución. ¿Por qué la segunda solución independiente es $y_2 = x\\,e^{rx}$?',
      'Porque al aplicar reducción de orden con $P = -2r$, el cociente $\\frac{e^{2rx}}{(e^{rx})^2} = 1$, y su integral da $v(x) = x$', [
        ['Porque toda ecuación de segundo orden debe tener una solución polinomial', 'Casi: $x e^{rx}$ no es un polinomio, es el producto de un monomio por una exponencial.'],
        ['Porque se multiplica arbitrariamente por $x$ sin justificación teórica', 'Casi: la multiplicación por $x$ se deduce rigurosamente mediante la reducción de orden.'],
        ['Porque la derivada de $e^{rx}$ es $x e^{rx}$', 'Casi: la derivada de $e^{rx}$ es $r e^{rx}$, no $x e^{rx}$.']],
      'Con $P = -2r$, $e^{-\\int P dx} = e^{2rx}$, y como $y_1^2 = e^{2rx}$, el integrando es $1$; entonces $v = \\int 1\\,dx = x$, por lo que $y_2 = x e^{rx}$.'),

    C('red-c-constantes-integracion', 'reduccion', 2,
      'Al calcular $v(x) = \\int \\frac{e^{-\\int P\\,dx}}{y_1^2}\\,dx$ para hallar una segunda solución independiente, ¿por qué podemos elegir la constante de integración como $+0$?',
      'Porque sumar una constante $+c$ a $v(x)$ solo agrega un múltiplo $c\\,y_1(x)$ a $y_2$, el cual ya está contenido en la solución general', [
        ['Porque en cálculo integral las constantes siempre se descartan', 'Casi: en cálculo las constantes importan; aquí se elige $c = 0$ por conveniencia porque la combinación general $c_1 y_1 + c_2 y_2$ ya incluye múltiplos de $y_1$.'],
        ['Porque si sumas una constante la función deja de ser solución', 'Casi: al contrario, cualquier $y_2 + c y_1$ sigue siendo solución; elegimos la más simple.'],
        ['Porque la integral que define a $v(x)$ es siempre una integral impropia', 'Casi: se trata de una antiderivada estándar.']],
      '$y_2 = (v + c)y_1 = v\\,y_1 + c\\,y_1$. Como $c\\,y_1$ ya forma parte de la familia $c_1y_1 + c_2y_2$, basta tomar $c = 0$.'),

    N('red-n-const-doble', 'reduccion', 2, { a: [2, 6, 1] },
      function (v) { return 'Para la ecuación diferencial $y\'\' - ' + (2 * v.a) + 'y\' + ' + (v.a * v.a) + 'y = 0$, ¿cuánto vale el coeficiente constante $P$ de la forma estándar $y\'\' + Py\' + Qy = 0$?'; },
      function (v) { return -2 * v.a; },
      'El coeficiente de $y\'$ en la forma estándar es directamente $P = -2a$.',
      { mistakes: {
          pos: function (v) { return 2 * v.a; },
          half: function (v) { return -v.a; },
          zeroVal: function () { return 0; }
        },
        feedback: [
          { when: 'pos', say: function (v) { return 'Casi: en la ecuación el signo es negativo, así que $P = -' + (2 * v.a) + '$.'; } },
          { when: 'half', say: function (v) { return 'Casi: el coeficiente de $y\'$ completo es $-2a = -' + (2 * v.a) + '$, no $-a$.'; } }
        ] }),

    N('red-n-exponente-integrando', 'reduccion', 2, { k: [2, 7, 1] },
      function (v) { return 'Para $x\\,y\'\' - ' + v.k + 'y\' + 4x^3y = 0$ en $x > 0$, al pasar a forma estándar se tiene $P(x) = -' + v.k + '/x$. ¿A qué potencia $m$ equivale el factor $e^{-\\int P(x)\\,dx} = x^m$?'; },
      function (v) { return v.k; },
      '$-\\int P(x)\\,dx = -\\int (-k/x)dx = k\\ln x = \\ln(x^k)$, por lo que $e^{-\\int P\\,dx} = x^k$, es decir, $m = k$.',
      { mistakes: {
          neg: function (v) { return -v.k; },
          kPlus1: function (v) { return v.k + 1; },
          zeroVal: function () { return 0; }
        },
        feedback: [
          { when: 'neg', say: 'Casi: $-\\int (-k/x)\\,dx = +k\\ln x = \\ln(x^k)$, por lo que la potencia es positiva: $+k$.' },
          { when: 'kPlus1', say: 'Casi: la integral de $1/x$ es $\\ln x$, sin alterar el exponente $k$.' }
        ] }),

    N('red-n-integral-monomio', 'reduccion', 2, { m: [2, 5, 1] },
      function (v) { return 'Al aplicar reducción de orden con $y_1 = x^{' + v.m + '}$ en la ecuación $x^2y\'\' - ' + (2 * v.m - 1) + 'x\\,y\' + ' + (v.m * v.m) + 'y = 0$, el cociente $\\frac{e^{-\\int P\\,dx}}{y_1^2}$ se simplifica a una potencia $x^p$. ¿Cuánto vale el exponente $p$?'; },
      function () { return -1; },
      'El numerador es $x^{2m-1}$ y el denominador es $(x^m)^2 = x^{2m}$. Al dividir queda $x^{2m-1 - 2m} = x^{-1}$, cuya integral produce el término logarítmico.',
      { mistakes: {
          one: function () { return 1; },
          zeroVal: function () { return 0; },
          valM: function (v) { return -v.m; }
        },
        feedback: [
          { when: 'one', say: 'Casi: el exponente es $-1$, es decir, $1/x$, cuya integral genera el término $\\ln x$.' },
          { when: 'zeroVal', say: 'Casi: el numerador es $x^{2m-1}$ y el denominador es $x^{2m}$, dando $x^{-1}$.' }
        ] }),

    E('red-e-cauchy-euler-ln', 'reduccion', 2, { m: [1, 4, 1] },
      function (v) { return 'Dada la solución conocida $y_1 = x^{' + v.m + '}$ de la ecuación de Cauchy-Euler $x^2y\'\' - ' + (2 * v.m - 1) + 'x\\,y\' + ' + (v.m * v.m) + 'y = 0$ (para $x > 0$), halla la segunda solución independiente $y_2(x)$ por reducción de orden.'; },
      function (v) { return 'x^' + v.m + '*log(x)'; },
      '$v(x) = \\int \\frac{x^{2m-1}}{x^{2m}}dx = \\int \\frac{1}{x}dx = \\ln x$. Por tanto, $y_2 = y_1\\,v = x^m\\ln x$.',
      { domain: [1, 3],
        mistakes: {
          onlyLog: function () { return 'log(x)'; },
          plusOne: function (v) { return 'x^' + (v.m + 1); }
        },
        feedback: [
          { when: 'onlyLog', say: 'Casi: esa es $v(x) = \\ln x$; falta multiplicar por $y_1 = x^m$ para obtener $y_2 = v\\,y_1$.' },
          { when: 'plusOne', say: 'Casi: la reducción de orden produce un factor logarítmico $x^m\\ln x$, no una potencia superior.' }
        ] }),

    E('red-e-exp-doble', 'reduccion', 2, { a: [1, 4, 1] },
      function (v) { return 'Para la ecuación $y\'\' - ' + (2 * v.a) + 'y\' + ' + (v.a * v.a) + 'y = 0$ con solución conocida $y_1 = e^{' + (v.a === 1 ? '' : v.a) + 'x}$, escribe la segunda solución independiente $y_2(x)$ obtenida por reducción de orden.'; },
      function (v) { return 'x*e^(' + v.a + '*x)'; },
      'Con $P = -2a$, $e^{-\\int P\\,dx} = e^{2ax}$ y $y_1^2 = e^{2ax}$, así que $v(x) = \\int 1\\,dx = x$. Por tanto, $y_2 = x e^{ax}$.',
      { domain: [-1, 1],
        mistakes: {
          onlyX: function () { return 'x'; },
          squared: function (v) { return 'x^2*e^(' + v.a + '*x)'; },
          negExp: function (v) { return 'e^(-' + v.a + '*x)'; }
        },
        feedback: [
          { when: 'onlyX', say: 'Casi: $v(x) = x$, pero la segunda solución es $y_2 = v\\,y_1 = x e^{ax}$.' },
          { when: 'squared', say: 'Casi: la integral de $1$ es $x$, no $x^2$.' }
        ] }),

    N('red-n-eval-y2', 'reduccion', 2, { a: [2, 5, 1] },
      function (v) { return 'Dada la segunda solución $y_2(x) = x\\,e^{' + v.a + 'x}$ obtenida por reducción de orden, calcula el valor de su derivada en $x = 1$, $y_2\'(1)$.'; },
      function (v) { return Math.exp(v.a) * (1 + v.a); },
      '$y_2\'(x) = e^{ax} + ax e^{ax}$ (regla del producto). Evaluando en $x = 1$ da $e^{a}(1 + a)$.',
      { mistakes: {
          onlyFirst: function (v) { return Math.exp(v.a); },
          onlySecond: function (v) { return v.a * Math.exp(v.a); }
        },
        feedback: [
          { when: 'onlyFirst', say: 'Casi: ese es $y_2(1)$ o solo el primer término; falta el $ax\\,e^{ax}$ de la regla del producto.' },
          { when: 'onlySecond', say: 'Casi: falta el primer término de la regla del producto, $e^{ax}$.' }
        ] }),

    E('red-e-segunda-sol-frac', 'reduccion', 2, { k: [1, 4, 1] },
      function (v) { return 'Para la ecuación diferencial $x\\,y\'\' + ' + (v.k + 1) + 'y\' = 0$ (con $x > 0$), una solución constante es $y_1 = 1$. Usa reducción de orden para hallar una segunda solución independiente $y_2(x)$ (escribe la potencia simple de $x$, sin constantes multiplicativas).'; },
      function (v) { return 'x^(-' + v.k + ')'; },
      'En forma estándar $P(x) = \\frac{k + 1}{x}$, por lo que $v\'(x) = x^{-(k + 1)}$. Integrando se obtiene $v(x) \\propto x^{-k}$, y como $y_1 = 1$, $y_2(x) = x^{-k}$.',
      { domain: [1, 3],
        mistakes: {
          pos: function (v) { return 'x^' + v.k; },
          plusOne: function (v) { return 'x^(-' + (v.k + 1) + ')'; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: la potencia resultante es negativa: $x^{-k}$.' },
          { when: 'plusOne', say: 'Casi: esa es $v\'(x)$; al integrar aumenta el exponente en $1$, quedando $x^{-k}$.' }
        ] }),

    N('red-n-potencia-negativa', 'reduccion', 3, { m: [2, 6, 1] },
      function (v) { return 'Para la ecuación $x^2y\'\' + ' + v.m + 'x\\,y\' - ' + v.m + 'y = 0$, una solución es $y_1 = x$. Al aplicar reducción de orden para hallar $y_2 = x^k$, ¿cuánto vale la potencia entera negativa $k$?'; },
      function (v) { return -v.m; },
      'En forma estándar $P(x) = m/x$. El numerador es $x^{-m}$. Con $y_1 = x$, $y_1^2 = x^2$, así que $v(x) = \\int x^{-m-2}dx \\propto x^{-m-1}$. Multiplicando por $y_1 = x$ queda $y_2 \\propto x^{-m}$, de modo que $k = -m$.',
      { mistakes: {
          pos: function (v) { return v.m; },
          minusOne: function () { return -1; },
          zeroVal: function () { return 0; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: la segunda solución tiene potencia negativa: $k = -m$.' },
          { when: 'minusOne', say: 'Casi: en forma estándar $P(x) = m/x$, lo que genera $e^{-\\int P} = x^{-m}$.' }
        ] }),

    N('red-n-wronskiano-reducido', 'reduccion', 3, { a: [7, 11, 1] },
      function (v) { return 'Sean $y_1 = e^{' + v.a + 'x}$ y $y_2 = x\\,e^{' + v.a + 'x}$ el par fundamental obtenido por reducción de orden. Calcula el valor de la derivada de su Wronskiano en $x = 0$, es decir, $W\'(0)$.'; },
      function (v) { return 2 * v.a; },
      '$W(x) = y_1^2 v\' = e^{2ax}$. Su derivada es $W\'(x) = 2a e^{2ax}$, que evaluada en $x = 0$ da $2a$.',
      { mistakes: {
          valA: function (v) { return v.a; },
          valW0: function () { return 1; },
          zeroVal: function () { return 0; }
        },
        feedback: [
          { when: 'valA', say: 'Casi: $W(x) = e^{2ax}$, por lo que su derivada es $W\'(x) = 2a e^{2ax}$, que en $0$ vale $2a$.' },
          { when: 'valW0', say: 'Casi: ese es $W(0) = 1$, pero se pide la derivada $W\'(0)$.' }
        ] }),

    E('red-e-reduccion-trig', 'reduccion', 3, { k: [2, 5, 1] },
      function (v) { return 'Dada la solución conocida $y_1 = \\cos(' + v.k + 'x)$ de $y\'\' + ' + (v.k * v.k) + 'y = 0$, usa reducción de orden para hallar la segunda solución básica independiente $y_2(x)$ (simplificada, omitiendo constantes multiplicativas).'; },
      function (v) { return 'sin(' + v.k + '*x)'; },
      '$v(x) = \\int \\frac{1}{\\cos^2(kx)}dx = \\frac{1}{k}\\tan(kx)$. Multiplicando por $y_1$: $y_2 = \\cos(kx)\\cdot\\tan(kx) = \\sin(kx)$.',
      { domain: [0.1, 1.2],
        mistakes: {
          tan: function (v) { return 'tan(' + v.k + '*x)'; },
          negSin: function (v) { return '-sin(' + v.k + '*x)'; }
        },
        feedback: [
          { when: 'tan', say: 'Casi: $v(x) = \\frac{1}{k}\\tan(kx)$, pero la solución es $y_2 = v\\,y_1 = \\tan(kx)\\cos(kx) = \\sin(kx)$.' },
          { when: 'negSin', say: 'Casi: la integral de $\\sec^2$ es $+\\tan$, por lo que resulta $+\\sin(kx)$.' }
        ] }),

    N('red-n-constante-v-prima', 'reduccion', 3, { a: [2, 5, 1], x0: [2, 4, 1] },
      function (v) { return 'Al aplicar la sustitución $y_2 = v\\,y_1$ con $y_1 = e^{' + v.a + 'x}$ en $y\'\' - ' + (2 * v.a) + 'y\' + ' + (v.a * v.a) + 'y = 0$, se obtiene la función $w(x) = v\'(x)$. ¿Cuánto vale $v\'(' + v.x0 + ')$?'; },
      function () { return 1; },
      '$v\'(x) = \\frac{e^{-\\int (-2a)\\,dx}}{(e^{ax})^2} = \\frac{e^{2ax}}{e^{2ax}} = 1$. Por lo tanto, $v\'(x_0) = 1$ en cualquier punto.',
      { mistakes: {
          valA: function (v) { return v.a; },
          zeroVal: function () { return 0; },
          scaled: function (v) { return v.a * v.x0; }
        },
        feedback: [
          { when: 'valA', say: 'Casi: el cociente $\\frac{e^{-\\int P}}{y_1^2} = \\frac{e^{2ax}}{e^{2ax}} = 1$ es constante e igual a $1$.' },
          { when: 'scaled', say: 'Casi: $v(x) = x$, por lo que su derivada es $v\'(x) = 1$, independiente de $x_0$.' }
        ] })
  ];

  K.register(SUBTEMAS, Q);
})();
