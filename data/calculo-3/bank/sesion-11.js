/* =====================================================================
   Banco · Cálculo 3 · S11 · Homogéneas de orden n: polinomio característico,
   raíces repetidas y complejas.
   100 preguntas propias (source: 'propia').
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c3', '11');

  function C() {
    var q = K.C.apply(null, arguments), opts = q.options;
    q.options = function (v) {
      return opts(v).map(function (o) {
        return typeof o.say === 'function' ? Object.assign({}, o, { say: o.say(v) }) : o;
      });
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
    o = o || {};
    return K.E(id, sub, d, vars, prompt, answer, why, o);
  }

  var SUBTEMAS = {
    'c3.S11.caracteristico': 'Polinomio característico y factorización',
    'c3.S11.reales': 'Raíces reales distintas y raíz cero',
    'c3.S11.repetidas': 'Raíces repetidas y multiplicidad',
    'c3.S11.complejas': 'Raíces complejas simples y repetidas',
    'c3.S11.base': 'Conjunto fundamental y dimensión',
    'c3.S11.pvi': 'Problemas de valor inicial de orden superior'
  };

  var Q = [
    /* ======================= 1. Polinomio característico y factorización (16) ======================= */
    C('pc-c-grado-orden', 'caracteristico', 1,
      'Para una ecuación diferencial ordinaria lineal homogénea de orden $n$ con coeficientes constantes, $a_n y^{(n)} + a_{n-1} y^{(n-1)} + \\dots + a_0 y = 0$ con $a_n \\neq 0$, ¿cuál es el grado de su polinomio característico?',
      'Exactamente $n$, pues cada derivada $y^{(k)}$ se transforma en la potencia algebraica $r^k$', [
        ['Siempre 2, porque las ecuaciones de orden superior se desacoplan en pares cuadráticos', 'Casi: en segundo orden el grado es 2, pero para orden $n$ arbitrario el grado del polinomio es $n$.'],
        ['$n - 1$, porque el término libre $a_0$ reduce en una unidad el grado efectivo', 'Casi: la derivada más alta $y^{(n)}$ produce $r^n$, por lo que el grado es exactamente $n$.'],
        ['$2n$, debido a que cada raíz genera dos funciones linealmente independientes', 'Casi: el grado del polinomio es igual al orden de la EDO, es decir, $n$.']],
      'Al proponer $y = e^{rx}$, la derivada $k$-ésima $y^{(k)}$ genera $r^k e^{rx}$. Al factorizar $e^{rx} \\neq 0$, queda un polinomio de grado $n$.'),

    C('pc-c-termino-sin-derivada', 'caracteristico', 1,
      'Al escribir el polinomio característico de $y\'\'\' + 5y\'\' - 9y = 0$, un estudiante anota $r^3 + 5r^2 - 9r = 0$. ¿Cuál es el error cometido?',
      'Asignó la potencia $r$ a la función $y$; como $y$ es la derivada de orden cero, le corresponde $r^0 = 1$ (el término constante $-9$)', [
        ['Olvidó incluir el término correspondiente a la primera derivada con coeficiente cero, $+0r$', 'Casi: $+0r$ vale cero y no altera el polinomio; el error real fue poner $-9r$ en lugar de $-9$.'],
        ['Cambió erróneamente los signos de los coeficientes al pasar de la EDO al polinomio', 'Casi: los signos de los coeficientes se mantienen idénticos.'],
        ['Debió elevar el 5 al cuadrado por tratarse de una segunda derivada', 'Casi: los coeficientes se conservan sin alterar; solo las derivadas se transforman en potencias de $r$.']],
      'La función $y = y^{(0)}$ produce $r^0 = 1$. Por ello el término $-9y$ se transforma en la constante $-9$, dando $r^3 + 5r^2 - 9 = 0$.'),

    C('pc-c-raices-racionales', 'caracteristico', 1,
      'Según el teorema de las raíces racionales, para encontrar una raíz entera del polinomio característico mónico $r^3 - 4r^2 + r + 6 = 0$, ¿entre qué valores enteros se debe buscar?',
      'Entre los divisores enteros del término independiente $6$, es decir, $\\pm 1, \\pm 2, \\pm 3, \\pm 6$', [
        ['Entre los múltiplos de $4$, ya que $-4$ es el coeficiente del término cuadrático', 'Casi: las posibles raíces enteras de un polinomio mónico deben dividir al término constante $a_0$.'],
        ['Únicamente entre números primos positivos menores a $6$, como $2$ y $3$', 'Casi: también se deben considerar los divisores negativos y el número $1$.'],
        ['Entre los divisores de la suma de todos los coeficientes', 'Casi: el teorema de las raíces racionales establece que las posibles raíces dividen a $a_0/a_n$.']],
      'Si el coeficiente principal es $a_n = 1$, cualquier raíz racional es un número entero divisor del término constante $a_0 = 6$.'),

    C('pc-c-division-sintetica', 'caracteristico', 2,
      'Si sabemos que $r = 2$ es una raíz del polinomio característico $r^3 - 2r^2 + 4r - 8 = 0$, ¿qué resultado se obtiene al dividirlo entre $(r - 2)$?',
      'El cociente cuadrático $r^2 + 4$ con residuo $0$, revelando dos raíces imaginarias adicionales $\\pm 2i$', [
        ['El cociente $r^2 - 4$ con residuo $0$, dando raíces reales adicionales $\\pm 2$', 'Casi: al efectuar la división sintética el término independiente del cociente es $+4$, no $-4$.'],
        ['El cociente $r^2 + 2r + 4$ con residuo diferente de cero', 'Casi: como $r = 2$ es raíz exacta, el residuo es necesariamente cero.'],
        ['El cociente lineal $r - 4$ con residuo cero', 'Casi: al dividir un polinomio cúbico entre uno lineal el cociente es cuadrático.']],
      'Factorizando por agrupación: $r^2(r - 2) + 4(r - 2) = (r^2 + 4)(r - 2) = 0$. El cociente es $r^2 + 4$.'),

    C('pc-c-teorema-fundamental-algebra', 'caracteristico', 2,
      '¿Qué garantiza el Teorema Fundamental del Álgebra sobre el polinomio característico de una EDO homogénea de orden $n$ con coeficientes reales?',
      'Que posee exactamente $n$ raíces en el plano de los números complejos, contando sus multiplicidades algebraicas', [
        ['Que todas sus raíces deben ser forzosamente números reales distintos', 'Casi: las raíces pueden ser repetidas o complejas conjugadas.'],
        ['Que al menos una de las raíces tiene que ser igual a cero', 'Casi: la raíz cero solo aparece cuando la ecuación carece del término en $y$.'],
        ['Que el número de raíces complejas siempre supera al de raíces reales', 'Casi: un polinomio puede tener todas sus raíces reales si sus factores son lineales.']],
      'Todo polinomio de grado $n$ con coeficientes complejos se descompone en exactamente $n$ factores lineales en $\\mathbb{C}$, contando multiplicidad.'),

    C('pc-c-diferencia-cuadrados-cuarto', 'caracteristico', 2,
      'Para factorizar la ecuación característica bicuadrática $r^4 - m^4 = 0$ con $m > 0$, ¿cuál es su descomposición completa en factores irreducibles sobre los reales?',
      '$(r - m)(r + m)(r^2 + m^2) = 0$, originando dos raíces reales $\\pm m$ y dos imaginarias puras $\\pm m i$', [
        ['$(r - m)^2 (r + m)^2 = 0$, produciendo raíces reales dobles $\\pm m$', 'Casi: $(r^2 - m^2)^2 = r^4 - 2m^2 r^2 + m^4$, que difiere de $r^4 - m^4$.'],
        ['$(r^2 - m^2)^2 = 0$, sin presencia de raíces complejas', 'Casi: la diferencia de cuadrados produce $(r^2 - m^2)(r^2 + m^2)$.'],
        ['$(r - m)^4 = 0$, con una raíz cuádruple en $r = m$', 'Casi: $(r - m)^4$ contiene términos en $r^3, r^2$ y $r$.']],
      'Por doble diferencia de cuadrados: $r^4 - m^4 = (r^2 - m^2)(r^2 + m^2) = (r - m)(r + m)(r^2 + m^2) = 0$.'),

    N('pc-n-evaluar-polinomio', 'caracteristico', 1, { a: [1, 3, 1], b: [2, 4, 1], r0: [1, 3, 1] },
      function (v) { return 'Para la ecuación diferencial $y\'\'\' + ' + v.a + "y'' - " + v.b + 'y\' - ' + (v.a * v.b) + 'y = 0$, evalúa su polinomio característico $P(r)$ en el valor $r = ' + v.r0 + '$.'; },
      function (v) { return v.r0 * v.r0 * v.r0 + v.a * v.r0 * v.r0 - v.b * v.r0 - (v.a * v.b); },
      'El polinomio característico es $P(r) = r^3 + a\\,r^2 - b\\,r - ab$. Se evalúa directamente sustituyendo el valor dado de $r$.',
      { where: function (v) { return v.r0 * v.r0 !== v.b; },
        mistakes: { noOrderZero: function (v) { return v.r0 * v.r0 * v.r0 + v.a * v.r0 * v.r0 - v.b * v.r0; }, wrongSign: function (v) { return v.r0 * v.r0 * v.r0 - v.a * v.r0 * v.r0 - v.b * v.r0 - (v.a * v.b); } },
        feedback: [
          { when: 'noOrderZero', say: 'Casi: olvidaste restar el término independiente $-ab$.' },
          { when: 'wrongSign', say: 'Casi: el término de segundo orden tiene coeficiente positivo $+a$.' }
        ] }),

    N('pc-n-suma-raices-vieta', 'caracteristico', 1, { a: [2, 6, 1], b: [1, 5, 1], c: [2, 6, 1] },
      function (v) { return 'Calcula la suma de todas las raíces (contando multiplicidades) del polinomio característico de $y\'\'\' - ' + v.a + "y'' + " + v.b + "y' - " + v.c + 'y = 0$.'; },
      function (v) { return v.a; },
      'Por las relaciones de Vieta, en un polinomio mónico $r^3 + a_2 r^2 + a_1 r + a_0 = 0$ la suma de las raíces es $-a_2 = -(-a) = a$.',
      { mistakes: { neg: function (v) { return -v.a; }, plusOne: function (v) { return v.a + 1; } },
        feedback: [
          { when: 'neg', say: 'Casi: la suma de las raíces es $-a_2 = -(-a) = a$, con signo positivo.' },
          { when: 'plusOne', say: 'Casi: la suma exacta de las raíces coincide con el coeficiente $a$.' }
        ] }),

    N('pc-n-producto-raices-orden3', 'caracteristico', 1, { k: [2, 5, 1], p: [2, 4, 1] },
      function (v) { return 'Determina el producto de las tres raíces del polinomio característico asociado a la ecuación $y\'\'\' + ' + v.p + "y' - " + (v.k * v.p) + 'y = 0$.'; },
      function (v) { return v.k * v.p; },
      'Para un polinomio cúbico mónico $r^3 + a_2 r^2 + a_1 r + a_0 = 0$, el producto de las raíces es $r_1 r_2 r_3 = -a_0 = -(-kp) = kp$.',
      { mistakes: { neg: function (v) { return -v.k * v.p; }, linear: function (v) { return v.p; } },
        feedback: [
          { when: 'neg', say: 'Casi: en un polinomio de grado impar el producto de raíces es $-a_0 = -(-kp) = kp$.' },
          { when: 'linear', say: 'Casi: ese es el coeficiente de primer orden, no el producto de las raíces.' }
        ] }),

    N('pc-n-orden-desde-ecuacion', 'caracteristico', 1, { n: [5, 8, 1] },
      function (v) { return 'Identifica el orden de la ecuación diferencial ordinaria lineal $y^{(' + v.n + ')} - 4y\'\'\' + 7y = 0$.'; },
      function (v) { return v.n; },
      'El orden de una ecuación diferencial es el orden de la derivada más alta que figura en la expresión.',
      { mistakes: { three: function () { return 3; }, plusOne: function (v) { return v.n + 1; } },
        feedback: [
          { when: 'three', say: 'Casi: 3 es el orden de la derivada intermedia, pero el orden de la EDO lo marca la más alta.' },
          { when: 'plusOne', say: 'Casi: el orden es directamente el índice superior de derivación de la ecuación.' }
        ] }),

    N('pc-n-raiz-entera-cubica', 'caracteristico', 2, { a: [2, 4, 1], b: [5, 8, 1] },
      function (v) { var s = v.a + v.b, p = v.a * v.b; return 'El polinomio característico $r^3 - ' + (s + 1) + 'r^2 + ' + (p + s) + 'r - ' + p + ' = 0$ tiene a $r = 1$ como raíz. Halla la mayor de las otras dos raíces.'; },
      function (v) { return v.b; },
      'Al dividir entre $(r - 1)$ se obtiene el factor cuadrático $(r - a)(r - b) = 0$. La mayor de las dos raíces es $b$.',
      { mistakes: { min: function (v) { return v.a; }, sum: function (v) { return v.a + v.b; } },
        feedback: [
          { when: 'min', say: 'Casi: esa es la menor de las otras dos raíces; se pidió la mayor.' },
          { when: 'sum', say: 'Casi: esa es la suma de ambas raíces, no la raíz mayor.' }
        ] }),

    N('pc-n-discriminante-cociente-cuadratico', 'caracteristico', 2, { p: [2, 5, 1], q: [2, 4, 1] },
      function (v) { return 'Al factorizar $(r - 1)(r^2 + ' + (2 * v.p) + 'r + ' + (v.p * v.p + v.q * v.q) + ') = 0$, calcula el valor absoluto del discriminante $|\\Delta|$ de su factor cuadrático.'; },
      function (v) { return 4 * v.q * v.q; },
      'Para el factor cuadrático, $\\Delta = b^2 - 4ac = (2p)^2 - 4(p^2 + q^2) = -4q^2$. El valor absoluto es $|-4q^2| = 4q^2$.',
      { mistakes: { noFour: function (v) { return v.q * v.q; }, signed: function (v) { return -4 * v.q * v.q; } },
        feedback: [
          { when: 'noFour', say: 'Casi: el discriminante es $b^2 - 4ac = -4q^2$; su valor absoluto es $4q^2$, no $q^2$.' },
          { when: 'signed', say: 'Casi: se solicitó el valor absoluto $|\\Delta|$; la respuesta debe ser positiva.' }
        ] }),

    N('pc-n-coeficiente-faltante-raices', 'caracteristico', 2, { r1: [1, 3, 1], r2: [2, 5, 1] },
      function (v) { return 'Si las raíces del polinomio característico de $y\'\'\' + a_2 y\'\' + a_1 y\' + a_0 y = 0$ son $r_1 = ' + v.r1 + '$, $r_2 = -' + v.r1 + '$ y $r_3 = ' + v.r2 + '$, ¿cuánto vale el coeficiente $a_2$?'; },
      function (v) { return -v.r2; },
      'El polinomio es $(r^2 - r_1^2)(r - r_2) = r^3 - r_2 r^2 - r_1^2 r + r_1^2 r_2 = 0$. Por lo tanto, $a_2 = -r_2$.',
      { mistakes: { pos: function (v) { return v.r2; }, minusOne: function (v) { return -v.r2 - 1; } },
        feedback: [
          { when: 'pos', say: 'Casi: por Vieta, $a_2 = -(r_1 - r_1 + r_2) = -r_2$, con signo negativo.' },
          { when: 'minusOne', say: 'Casi: la suma de las tres raíces es $r_1 + (-r_1) + r_2 = r_2$, por lo que $a_2 = -r_2$.' }
        ] }),

    N('pc-n-termino-independiente-cuarto', 'caracteristico', 2, { a: [1, 3, 1], b: [2, 4, 1] },
      function (v) { return 'Determina el término independiente $a_0$ de la ecuación característica mónada $r^4 + a_2 r^2 + a_0 = 0$ cuyas raíces son $\\pm ' + v.a + '$ y $\\pm ' + v.b + 'i$.'; },
      function (v) { return -(v.a * v.a) * (v.b * v.b); },
      'El polinomio es $(r^2 - a^2)(r^2 + b^2) = r^4 + (b^2 - a^2)r^2 - a^2 b^2 = 0$. El término independiente es $a_0 = -a^2 b^2$.',
      { mistakes: { pos: function (v) { return (v.a * v.a) * (v.b * v.b); }, sum: function (v) { return v.a * v.a + v.b * v.b; } },
        feedback: [
          { when: 'pos', say: 'Casi: $(-a^2)(+b^2) = -a^2 b^2$; el término constante lleva signo negativo.' },
          { when: 'sum', say: 'Casi: el término libre proviene del producto de las raíces, no de la suma.' }
        ] }),

    N('pc-n-coeficiente-lineal-cubico', 'caracteristico', 3, { r1: [1, 2, 1], r2: [3, 4, 1], r3: [5, 6, 1] },
      function (v) { return 'Para la ecuación $y\'\'\' + a_2 y\'\' + a_1 y\' + a_0 y = 0$ con raíces características $r = ' + v.r1 + '$, $r = ' + v.r2 + '$ y $r = ' + v.r3 + '$, halla el valor de $a_1$.'; },
      function (v) { return v.r1 * v.r2 + v.r1 * v.r3 + v.r2 * v.r3; },
      'Al expandir $(r - r_1)(r - r_2)(r - r_3) = 0$, el coeficiente lineal es la suma de los productos por pares: $a_1 = r_1 r_2 + r_1 r_3 + r_2 r_3$.',
      { mistakes: { neg: function (v) { return -(v.r1 * v.r2 + v.r1 * v.r3 + v.r2 * v.r3); }, sumRoots: function (v) { return v.r1 + v.r2 + v.r3; } },
        feedback: [
          { when: 'neg', say: 'Casi: por Vieta, el coeficiente de primer orden tiene signo positivo: $a_1 = r_1 r_2 + r_1 r_3 + r_2 r_3$.' },
          { when: 'sumRoots', say: 'Casi: esa es la suma de las tres raíces (relacionada con $a_2$), no la suma de productos dobles.' }
        ] }),

    N('pc-n-suma-cuadrados-raices', 'caracteristico', 3, { s: [4, 8, 1], q: [2, 5, 1] },
      function (v) { return 'Si las tres raíces de un polinomio característico cumplen $r_1 + r_2 + r_3 = ' + v.s + '$ y $r_1 r_2 + r_1 r_3 + r_2 r_3 = ' + v.q + '$, halla la suma de sus cuadrados $r_1^2 + r_2^2 + r_3^2$.'; },
      function (v) { return v.s * v.s - 2 * v.q; },
      'De la identidad algebraica $(r_1+r_2+r_3)^2 = \\sum r_i^2 + 2\\sum r_i r_j$, se despeja $\\sum r_i^2 = s^2 - 2q$.',
      { mistakes: { noTwo: function (v) { return v.s * v.s - v.q; }, plus: function (v) { return v.s * v.s + 2 * v.q; } },
        feedback: [
          { when: 'noTwo', say: 'Casi: la identidad tiene un doble producto: debes restar $2q$, no solo $q$.' },
          { when: 'plus', say: 'Casi: se debe restar el doble producto a $s^2$, no sumarlo.' }
        ] }),

    /* ======================= 2. Raíces reales distintas y raíz cero (16) ======================= */
    C('re-c-base-tres-reales', 'reales', 1,
      'Si una EDO lineal homogénea de tercer orden con coeficientes constantes tiene raíces características $r_1$, $r_2$ y $r_3$ reales y distintas dos a dos, ¿cuál es su base de soluciones?',
      'El conjunto de tres exponenciales $\\{e^{r_1 x}, e^{r_2 x}, e^{r_3 x}\\}$', [
        ['$\\{e^{r_1 x}, x\\,e^{r_1 x}, x^2 e^{r_1 x}\\}$', 'Casi: esa base corresponde a una raíz real triple, pero aquí las tres raíces son distintas.'],
        ['$\\{e^{r_1 x}, e^{r_2 x}, \\cos(r_3 x)\\}$', 'Casi: la función coseno requiere raíces imaginarias, no raíces reales.'],
        ['$\\{1, e^{r_1 x}, e^{r_2 x}\\}$', 'Casi: la constante 1 solo forma parte de la base si alguna de las raíces vale exactamente cero.']],
      'Cada raíz real simple $r_k$ aporta la solución $e^{r_k x}$. Al ser distintas, las tres exponenciales son linealmente independientes.'),

    C('re-c-significado-raiz-cero', 'reales', 1,
      'En la ecuación $y\'\'\' - 4y\' = 0$, el polinomio característico es $r(r^2 - 4) = 0$. ¿Qué función de la base de soluciones proviene de la raíz $r = 0$?',
      'La función constante $y_1(x) = 1$, porque $e^{0\\cdot x} = 1$', [
        ['La función nula $y_1(x) = 0$, que se descarta por trivial', 'Casi: $e^{0x} = 1$ es una función constante no nula perfectamente válida.'],
        ['La función lineal $y_1(x) = x$', 'Casi: $x$ aparece cuando $r = 0$ es raíz repetida, no simple.'],
        ['Ninguna función, pues $r = 0$ no genera soluciones', 'Casi: toda raíz aporta una solución; para $r = 0$ es $e^{0x} = 1$.']],
      'Sustituyendo $r = 0$ en $e^{rx}$ se obtiene $e^{0x} = 1$. Cualquier función constante satisface $y\'\'\' - 4y\' = 0$ ya que sus derivadas son cero.'),

    C('re-c-asintotica-infinito-negativas', 'reales', 1,
      'Si todas las raíces del polinomio característico de una EDO homogénea son reales y estrictamente negativas, ¿qué ocurre con toda solución cuando $x \\to \\infty$?',
      'Toda solución decae asintóticamente hacia $0$, sin importar las constantes iniciales', [
        ['Toda solución crece sin límite hacia $+\\infty$', 'Casi: como los exponentes son negativos, $e^{r_k x} \\to 0$ cuando $x \\to \\infty$.'],
        ['Las soluciones oscilan indefinidamente con periodo constante', 'Casi: la oscilación requiere raíces con parte imaginaria no nula.'],
        ['La solución converge hacia la suma de las condiciones iniciales', 'Casi: la combinación de exponenciales decrecientes decae hacia 0.']],
      'Como cada $r_k < 0$, cada término exponencial $e^{r_k x}$ tiende a 0 al crecer $x$, por lo que la solución total tiende a cero.'),

    C('re-c-wronskiano-tres-exponenciales', 'reales', 2,
      'El Wronskiano de tres exponenciales $e^{r_1 x}, e^{r_2 x}, e^{r_3 x}$ evaluado en $x = 0$ es un determinante de Vandermonde. ¿Bajo qué condición este determinante es diferente de cero?',
      'Basta con que las tres raíces sean distintas entre sí ($r_1 \\neq r_2$, $r_1 \\neq r_3$, $r_2 \\neq r_3$)', [
        ['Se requiere que la suma de las tres raíces sea estrictamente positiva', 'Casi: el determinante de Vandermonde es $\\prod_{i<j}(r_j - r_i)$; depende de las diferencias, no de la suma.'],
        ['Es indispensable que al menos dos raíces tengan el mismo signo', 'Casi: solo importa que las raíces sean distintas dos a dos.'],
        ['Solo es no nulo si ninguna de las raíces es igual a cero', 'Casi: una raíz puede ser cero; mientras las tres sean distintas, el determinante no se anula.']],
      'El determinante de Vandermonde vale $(r_2 - r_1)(r_3 - r_1)(r_3 - r_2)$, el cual es no nulo si y solo si las raíces son distintas por pares.'),

    C('re-c-falta-termino-y-yprima', 'reales', 2,
      'Si en una ecuación homogénea de tercer orden no aparecen ni el término en $y$ ni el término en $y\'$ (por ejemplo, $y\'\'\' + 2y\'\' = 0$), ¿cuántas raíces iguales a cero tiene su polinomio característico?',
      'Tiene exactamente dos raíces iguales a cero ($r = 0$ con multiplicidad 2), aportando las funciones $1$ y $x$', [
        ['Tiene una sola raíz igual a cero, aportando únicamente la constante 1', 'Casi: el polinomio es $r^3 + 2r^2 = r^2(r + 2) = 0$, por lo que $r = 0$ es raíz doble.'],
        ['Tiene tres raíces iguales a cero', 'Casi: el término en $y\'\'$ genera $r^2$, de modo que la tercera raíz es $r = -2$.'],
        ['No tiene ninguna raíz igual a cero', 'Casi: al factorizar $r^2$, $r = 0$ es raíz con multiplicidad 2.']],
      'El polinomio característico es $r^3 + a_2 r^2 = r^2(r + a_2) = 0$. El factor $r^2$ indica que $r = 0$ tiene multiplicidad 2.'),

    C('re-c-combinacion-general-reales', 'reales', 2,
      'Para la ecuación $y\'\'\' - 7y\'\' + 12y\' = 0$, cuyas raíces son $0, 3, 4$, ¿cuál es la estructura de su solución general?',
      '$y(x) = c_1 + c_2 e^{3x} + c_3 e^{4x}$', [
        ['$y(x) = c_1 x + c_2 e^{3x} + c_3 e^{4x}$', 'Casi: la raíz 0 es simple, por lo que produce $e^{0x} = 1$, no $x$.'],
        ['$y(x) = c_1 e^{3x} + c_2 e^{4x}$', 'Casi: una ecuación de orden 3 requiere 3 funciones independientes y 3 constantes arbitrarias.'],
        ['$y(x) = (c_1 + c_2 x + c_3 x^2)e^{7x}$', 'Casi: las raíces son tres números reales distintos ($0, 3, 4$), no una raíz triple.']],
      'Las tres raíces son $r_1 = 0, r_2 = 3, r_3 = 4$. Sus funciones básicas son $1, e^{3x}, e^{4x}$, dando $y = c_1 + c_2 e^{3x} + c_3 e^{4x}$.'),

    N('re-n-evaluar-solucion-reales', 'reales', 1, { a: [1, 3, 1], c0: [2, 5, 1] },
      function (v) { return 'La solución de una EDO con raíces $0$ y $\\pm ' + v.a + '$ es $y(x) = ' + v.c0 + ' + e^{' + v.a + 'x} + e^{-' + v.a + 'x}$. Calcula el valor numérico de $y(0)$.'; },
      function (v) { return v.c0 + 2; },
      'En $x = 0$, $e^{a\\cdot 0} = 1$ y $e^{-a\\cdot 0} = 1$. Por lo tanto, $y(0) = c_0 + 1 + 1 = c_0 + 2$.',
      { mistakes: { justC0: function (v) { return v.c0; }, plusOne: function (v) { return v.c0 + 1; } },
        feedback: [
          { when: 'justC0', say: 'Casi: cada exponencial evaluada en cero vale 1, sumando 2 a la constante.' },
          { when: 'plusOne', say: 'Casi: hay dos exponenciales que aportan 1 cada una, sumando 2.' }
        ] }),

    N('re-n-derivada-en-cero-simetrica', 'reales', 1, { k: [2, 5, 1], c: [2, 6, 1] },
      function (v) { return 'Dada la función $y(x) = ' + v.c + ' + 3e^{' + v.k + 'x} - 3e^{-' + v.k + 'x}$, calcula el valor de su primera derivada en el origen, $y\'(0)$.'; },
      function (v) { return 6 * v.k; },
      'La derivada es $y\'(x) = 3k\\,e^{kx} + 3k\\,e^{-kx}$. Evaluando en $x = 0$: $y\'(0) = 3k + 3k = 6k$.',
      { mistakes: { half: function (v) { return 3 * v.k; }, neg: function (v) { return -6 * v.k; } },
        feedback: [
          { when: 'half', say: 'Casi: ambos términos aportan $3k$, por lo que la suma da $6k$.' },
          { when: 'neg', say: 'Casi: la derivada del segundo término es $-3(-k)e^{-kx} = +3k e^{-kx}$, con signo positivo.' }
        ] }),

    N('re-n-segunda-derivada-origen', 'reales', 2, { r1: [1, 3, 1], r2: [4, 6, 1] },
      function (v) { return 'Para la solución $y(x) = e^{' + v.r1 + 'x} + e^{-' + v.r2 + 'x}$, calcula el valor exacto de su segunda derivada en $x = 0$, $y\'\'(0)$.'; },
      function (v) { return v.r1 * v.r1 + v.r2 * v.r2; },
      'La segunda derivada es $y\'\'(x) = r_1^2 e^{r_1 x} + (-r_2)^2 e^{-r_2 x}$. En $x = 0$ da $r_1^2 + r_2^2$.',
      { mistakes: { diff: function (v) { return v.r2 * v.r2 - v.r1 * v.r1; }, neg: function (v) { return -(v.r1 * v.r1 + v.r2 * v.r2); } },
        feedback: [
          { when: 'diff', say: 'Casi: $(-r_2)^2 = +r_2^2$; al elevar al cuadrado ambos coeficientes se suman.' },
          { when: 'neg', say: 'Casi: los cuadrados de números reales son no negativos; el resultado es positivo.' }
        ] }),

    N('re-n-limite-solucion-infinito', 'reales', 2, { c0: [3, 7, 1], a: [1, 3, 1], b: [2, 4, 1] },
      function (v) { return 'Determina el valor límite cuando $x \\to \\infty$ de la solución $y(x) = ' + v.c0 + ' + 3e^{-' + v.a + 'x} - 5e^{-' + v.b + 'x}$.'; },
      function (v) { return v.c0; },
      'Como ambos exponentes son negativos, $\\lim_{x\\to\\infty} e^{-ax} = 0$ y $\\lim_{x\\to\\infty} e^{-bx} = 0$. Solo sobrevive la constante $c_0$.',
      { mistakes: { plusTwo: function (v) { return v.c0 + 2; }, neg: function (v) { return -v.c0; } },
        feedback: [
          { when: 'plusTwo', say: 'Casi: las exponenciales decaen a cero al tender $x$ a infinito; no las evalúes en 0.' },
          { when: 'neg', say: 'Casi: el límite es la constante tal cual, $+c_0$.' }
        ] }),

    N('re-n-cruce-cero-exponencial', 'reales', 2, { r1: [1, 2, 1], r2: [3, 4, 1], shift: [3, 6, 1] },
      function (v) { return 'La solución $y(x) = e^{' + v.r2 + 'x} - e^{' + v.r1 + 'x}$ se anula en un único punto $x^*$. Encuentra el valor de $x^* + ' + v.shift + '$.'; },
      function (v) { return v.shift; },
      'La ecuación $e^{r_2 x} = e^{r_1 x}$ equivale a $(r_2 - r_1)x = 0$. Como $r_2 \\neq r_1$, la raíz es $x^* = 0$. Por tanto, $x^* + s = s$.',
      { mistakes: { plusOne: function (v) { return v.shift + 1; }, minusTwo: function (v) { return v.shift - 2; } },
        feedback: [
          { when: 'plusOne', say: 'Casi: el cruce por cero ocurre exactamente en $x^* = 0$, por lo que $x^* + s = s$.' },
          { when: 'minusTwo', say: 'Casi: la solución única de $e^{r_2 x} = e^{r_1 x}$ es $x = 0$.' }
        ] }),

    N('re-n-razon-asintotica-dos-exponenciales', 'reales', 2, { r1: [1, 2, 1], r2: [4, 6, 1] },
      function (v) { return 'En la solución $y(x) = 4e^{' + v.r1 + 'x} + 7e^{' + v.r2 + 'x}$, ¿cuál es el exponente dominante que rige la tasa de crecimiento cuando $x \\to \\infty$?'; },
      function (v) { return v.r2; },
      'Al ser $r_2 > r_1 > 0$, el término $e^{r_2 x}$ crece exponencialmente más rápido y domina el comportamiento asintótico.',
      { mistakes: { min: function (v) { return v.r1; }, sum: function (v) { return v.r1 + v.r2; } },
        feedback: [
          { when: 'min', say: 'Casi: al crecer $x$, el término dominante es el de mayor exponente positivo.' },
          { when: 'sum', say: 'Casi: las exponenciales se suman linealmente; los exponentes no se suman.' }
        ] }),

    N('re-n-tercera-derivada-combinacion', 'reales', 3, { a: [1, 2, 1], b: [3, 4, 1] },
      function (v) { return 'Calcula el valor de la tercera derivada en el origen, $y\'\'\'(0)$, para la función $y(x) = 2e^{' + v.a + 'x} + 3e^{' + v.b + 'x}$.'; },
      function (v) { return 2 * Math.pow(v.a, 3) + 3 * Math.pow(v.b, 3); },
      'La tercera derivada es $y\'\'\'(x) = 2 a^3 e^{ax} + 3 b^3 e^{bx}$. Evaluando en $x = 0$ da $2 a^3 + 3 b^3$.',
      { mistakes: { secondDeriv: function (v) { return 2 * v.a * v.a + 3 * v.b * v.b; }, neg: function (v) { return -(2 * Math.pow(v.a, 3) + 3 * Math.pow(v.b, 3)); } },
        feedback: [
          { when: 'secondDeriv', say: 'Casi: esa es la segunda derivada; para la tercera debes elevar cada raíz al cubo.' },
          { when: 'neg', say: 'Casi: al derivar exponenciales con exponentes positivos, los signos se conservan positivos.' }
        ] }),

    N('re-n-wronskiano-numerico-tres-ceros', 'reales', 3, { r1: [1, 2, 1], r2: [4, 5, 1] },
      function (v) { return 'Calcula el determinante Wronskiano $W(1, e^{' + v.r1 + 'x}, e^{' + v.r2 + 'x})$ evaluado en $x = 0$.'; },
      function (v) { return v.r1 * v.r2 * (v.r2 - v.r1); },
      'Para las raíces $0, r_1, r_2$, el determinante de Vandermonde en $x = 0$ es $(r_1 - 0)(r_2 - 0)(r_2 - r_1) = r_1 r_2 (r_2 - r_1)$.',
      { mistakes: { diffOnly: function (v) { return v.r2 - v.r1; }, prodOnly: function (v) { return v.r1 * v.r2; } },
        feedback: [
          { when: 'diffOnly', say: 'Casi: el determinante de Vandermonde incluye el factor $r_1 r_2 (r_2 - r_1)$.' },
          { when: 'prodOnly', say: 'Casi: falta multiplicar por la diferencia entre las dos raíces $(r_2 - r_1)$.' }
        ] }),

    E('re-e-sol-pvi-tres-reales', 'reales', 2, { a: [1, 2, 1], b: [3, 4, 1] },
      function (v) { return 'Halla la solución particular de $y\'\'\' - ' + (v.a + v.b) + "y'' + " + (v.a * v.b) + 'y\' = 0$ con $y(0) = 1$, $y\'(0) = ' + v.a + '$ y $y\'\'(0) = ' + (v.a * v.a) + '$.'; },
      function (v) { return 'e^(' + v.a + '*x)'; },
      'La base es $\\{1, e^{ax}, e^{bx}\\}$. Las condiciones iniciales coinciden exactamente con $y(x) = e^{ax}$, con $c_2 = 1$ y las demás constantes nulas.',
      { domain: [-1, 1],
        mistakes: { otherRoot: function (v) { return 'e^(' + v.b + '*x)'; }, constante: function () { return '1'; } },
        feedback: [
          { when: 'otherRoot', say: 'Casi: las condiciones coinciden con la raíz $r = a$, no con $r = b$.' },
          { when: 'constante', say: 'Casi: la función constante tiene derivada cero, violando $y\'(0) = a$.' }
        ] }),

    E('re-e-sol-simetrica-hiperbolica', 'reales', 2, { k: [1, 3, 1] },
      function (v) { return 'Encuentra la solución del problema $y\'\'\' - ' + (v.k * v.k) + 'y\' = 0$ sujeta a $y(0) = 0$, $y\'(0) = ' + (2 * v.k) + '$ y $y\'\'(0) = 0$.'; },
      function (v) { return 'e^(' + v.k + '*x) - e^(-' + v.k + '*x)'; },
      'La solución general es $c_1 + c_2 e^{kx} + c_3 e^{-kx}$. Con $y(0)=0$ y $y\'\'(0)=0$ se deduce $c_1=0$ y $c_2 = -c_3 = 1$, dando $e^{kx} - e^{-kx}$.',
      { domain: [-1, 1],
        mistakes: { plus: function (v) { return 'e^(' + v.k + '*x) + e^(-' + v.k + '*x)'; }, noNeg: function (v) { return 'e^(' + v.k + '*x)'; } },
        feedback: [
          { when: 'plus', say: 'Casi: para satisfacer $y(0) = 0$ los términos exponenciales deben restarse.' },
          { when: 'noNeg', say: 'Casi: se requieren ambas exponenciales para que la segunda derivada en 0 sea nula.' }
        ] }),

    /* ======================= 3. Raíces repetidas y multiplicidad (17) ======================= */
    C('rep-c-multiplicidad-m', 'repetidas', 1,
      'Si una raíz real $r_0$ del polinomio característico tiene multiplicidad algebraica $m$, ¿cuántas funciones linealmente independientes aporta a la base de soluciones?',
      'Exactamente $m$ funciones: $e^{r_0 x}, x\\,e^{r_0 x}, x^2 e^{r_0 x}, \\dots, x^{m-1} e^{r_0 x}$', [
        ['Solo una función, $e^{r_0 x}$, debiendo buscar las demás con coeficientes variables', 'Casi: cada orden de repetición genera una nueva solución multiplicando por potencias crecientes de $x$.'],
        ['$m$ funciones exponenciales con exponentes fraccionarios $e^{(r_0/k)x}$', 'Casi: la base mantiene la misma tasa $r_0$ multiplicada por factores algebraicos $x^k$.'],
        ['$2m$ funciones, alternando combinaciones de senos y cosenos', 'Casi: las funciones trigonométricas provienen de raíces complejas, no de raíces reales repetidas.']],
      'Por reducción de orden sucesiva, una raíz de multiplicidad $m$ produce las $m$ soluciones $x^k e^{r_0 x}$ para $k = 0, 1, \\dots, m-1$.'),

    C('rep-c-raiz-triple-estructura', 'repetidas', 1,
      'Para la ecuación diferencial $y\'\'\' - 3y\'\' + 3y\' - y = 0$, cuyo polinomio es $(r - 1)^3 = 0$, ¿cómo se expresa su solución general?',
      '$y(x) = (c_1 + c_2 x + c_3 x^2)e^x$', [
        ['$y(x) = c_1 e^x + c_2 e^{2x} + c_3 e^{3x}$', 'Casi: esa forma sería para tres raíces distintas $1, 2, 3$; aquí la raíz $1$ es triple.'],
        ['$y(x) = (c_1 + c_2 x)e^x + c_3 e^{-x}$', 'Casi: todas las soluciones comparten el factor común $e^x$, hasta la potencia $x^2$.'],
        ['$y(x) = c_1 e^x + c_2 x^3 e^x$', 'Casi: las potencias deben ser consecutivas: $1, x, x^2$. La potencia $x^3$ correspondería a multiplicidad 4.']],
      'La raíz $r = 1$ tiene multiplicidad 3. La base es $\\{e^x, x e^x, x^2 e^x\\}$, cuya combinación lineal es $(c_1 + c_2 x + c_3 x^2)e^x$.'),

    C('rep-c-origen-factor-x', 'repetidas', 1,
      '¿Por qué no podemos simplemente repetir $e^{r_0 x}$ varias veces cuando una raíz característica $r_0$ tiene multiplicidad mayor a 1?',
      'Porque copias idénticas de $e^{r_0 x}$ son proporcionales entre sí (linealmente dependientes) y no generan una base de dimensión requerida', [
        ['Porque la función exponencial deja de ser derivable al repetirse', 'Casi: la exponencial es suave e infinitamente diferenciable en todo $\\mathbb{R}$.'],
        ['Porque al sustituir la misma función la ecuación diferencial se vuelve no lineal', 'Casi: la linealidad de la EDO es una propiedad intrínseca del operador diferencial.'],
        ['Porque el Wronskiano de cualquier exponencial siempre es cero', 'Casi: el Wronskiano de funciones distintas no es cero; se anula precisamente cuando son linealmente dependientes.']],
      'Un conjunto fundamental debe ser linealmente independiente. Dos funciones idénticas tienen Wronskiano nulo y no expanden el espacio de soluciones.'),

    C('rep-c-cero-triple-polinomio', 'repetidas', 2,
      '¿Cuál es la solución general de la ecuación diferencial elemental $y\'\'\' = 0$ y cómo se interpreta mediante el polinomio característico?',
      '$y(x) = c_1 + c_2 x + c_3 x^2$; proviene de la raíz característica $r = 0$ con multiplicidad 3', [
        ['$y(x) = c_1 x^3$, integrando tres veces e ignorando las constantes intermedias', 'Casi: cada integración sucesiva introduce una constante arbitraria independiente.'],
        ['$y(x) = c_1 e^x + c_2 e^{-x} + c_3$', 'Casi: el polinomio es $r^3 = 0$, con triple raíz cero, no raíces $\\pm 1$.'],
        ['$y(x) = c_1 \\cos x + c_2 \\sin x + c_3$', 'Casi: no hay factores cuadráticos $r^2 + 1$; es un polinomio nulo de tercer grado.']],
      'Para $y\'\'\' = 0$, el polinomio es $r^3 = 0$. La raíz $r = 0$ triple genera $e^{0x}=1$, $x e^{0x}=x$ y $x^2 e^{0x}=x^2$.'),

    C('rep-c-multiplicidad-cuatro', 'repetidas', 2,
      'Para una ecuación de cuarto orden con polinomio característico $(r - 2)^4 = 0$, ¿cuál es el término de mayor grado en $x$ presente en su base de soluciones?',
      '$x^3 e^{2x}$, pues las potencias de $x$ van desde $x^0$ hasta $x^{m-1} = x^3$', [
        ['$x^4 e^{2x}$, correspondiente al orden 4 de la ecuación diferencial', 'Casi: para multiplicidad $m = 4$, la potencia máxima es $m - 1 = 3$.'],
        ['$x^2 e^{2x}$, porque solo se añaden términos pares', 'Casi: se incluyen todas las potencias enteras sucesivas: $1, x, x^2, x^3$.'],
        ['$e^{8x}$, multiplicando el orden por el valor de la raíz', 'Casi: el exponente siempre es $rx = 2x$, multiplicado por factores polinomiales en $x$.']],
      'Con multiplicidad 4, las cuatro soluciones básicas son $e^{2x}, x e^{2x}, x^2 e^{2x}, x^3 e^{2x}$. La potencia más alta es $x^3$.'),

    C('rep-c-regla-producto-derivadas', 'repetidas', 2,
      'Al derivar la función de base $y = x^2 e^{rx}$, ¿cuál es la expresión correcta resultante de aplicar la regla del producto?',
      '$y\' = (2x + r x^2)e^{rx}$, sumando la derivada del polinomio multiplicada por la exponencial y viceversa', [
        ['$y\' = 2r\\,x e^{rx}$, multiplicando directamente las derivadas individuales', 'Casi: por la regla del producto $(uv)\' = u\'v + uv\'$ se obtiene una suma, no un producto.'],
        ['$y\' = r^2 x^2 e^{rx}$, derivando únicamente el factor exponencial', 'Casi: se debe aplicar la regla del producto porque tanto $x^2$ como $e^{rx}$ dependen de $x$.'],
        ['$y\' = 2x\\,e^{rx}$, tratando al factor exponencial como una constante', 'Casi: la derivada de $e^{rx}$ aporta el término $r e^{rx}$.']],
      'Por la regla del producto: $(x^2)\' e^{rx} + x^2 (e^{rx})\' = 2x e^{rx} + r x^2 e^{rx} = (2x + r x^2)e^{rx}$.'),

    N('rep-n-evaluar-raiz-doble', 'repetidas', 1, { r: [1, 3, 1], c2: [4, 7, 1] },
      function (v) { return 'La solución general de una EDO con raíz doble $r = ' + v.r + '$ es $y(x) = (1 + ' + v.c2 + 'x)e^{' + v.r + 'x}$. Calcula el valor de su primera derivada en el origen, $y\'(0)$.'; },
      function (v) { return v.c2 + v.r; },
      'La derivada es $y\'(x) = c_2 e^{rx} + r(1 + c_2 x)e^{rx}$. En $x = 0$, $y\'(0) = c_2 + r$.',
      { mistakes: { justC2: function (v) { return v.c2; }, doubleR: function (v) { return v.c2 + 2 * v.r; } },
        feedback: [
          { when: 'justC2', say: 'Casi: por regla del producto, $y\'(0) = c_2 + r(1)$.' },
          { when: 'doubleR', say: 'Casi: el coeficiente de $r$ en el origen es $c_1 = 1$, no 2.' }
        ] }),

    N('rep-n-segunda-derivada-raiz-doble', 'repetidas', 1, { r: [2, 5, 1] },
      function (v) { return 'Para la función $y(x) = x\\,e^{' + v.r + 'x}$, calcula el valor de su segunda derivada en $x = 0$, $y\'\'(0)$.'; },
      function (v) { return 2 * v.r; },
      'Las derivadas son $y\' = (1 + rx)e^{rx}$ y $y\'\' = (2r + r^2 x)e^{rx}$. En $x = 0$ vale $2r$.',
      { mistakes: { justR: function (v) { return v.r; }, neg: function (v) { return -2 * v.r; } },
        feedback: [
          { when: 'justR', say: 'Casi: por la regla de Leibniz, $(x e^{rx})\'\' = 2r e^{rx} + r^2 x e^{rx}$; en 0 da $2r$.' },
          { when: 'neg', say: 'Casi: con raíz positiva, la segunda derivada en 0 es positiva: $+2r$.' }
        ] }),

    N('rep-n-tercera-derivada-x2', 'repetidas', 2, { r: [1, 4, 1] },
      function (v) { return 'Calcula el valor numérico de la tercera derivada en el origen, $y\'\'\'(0)$, para la función de base $y(x) = x^2 e^{' + v.r + 'x}$.'; },
      function (v) { return 6 * v.r; },
      'Por la regla de Leibniz, el único término que no se anula en $x = 0$ es $\\binom{3}{2}(x^2)\'\'(0)(e^{rx})\'(0) = 3(2)(r) = 6r$.',
      { mistakes: { twoR: function (v) { return 2 * v.r; }, neg: function (v) { return -6 * v.r; } },
        feedback: [
          { when: 'twoR', say: 'Casi: el coeficiente binomial es $\\binom{3}{2} = 3$ y $(x^2)\'\' = 2$, dando $3 \\times 2 \\times r = 6r$.' },
          { when: 'neg', say: 'Casi: las derivadas de potencias y exponenciales positivas son positivas.' }
        ] }),

    N('rep-n-coeficiente-cubo-binomio', 'repetidas', 2, { a: [2, 5, 1] },
      function (v) { return 'En la expansión del polinomio característico $(r - ' + v.a + ')^3 = r^3 + a_2 r^2 + a_1 r + a_0$, ¿cuánto vale el coeficiente $a_2$?'; },
      function (v) { return -3 * v.a; },
      'Por el binomio de Newton, $(r - a)^3 = r^3 - 3a\\,r^2 + 3a^2\\,r - a^3$. El coeficiente cuadrático es $a_2 = -3a$.',
      { mistakes: { pos: function (v) { return 3 * v.a; }, linear: function (v) { return -v.a; } },
        feedback: [
          { when: 'pos', say: 'Casi: $(r - a)^3$ tiene término cuadrático $-3a r^2$, con signo negativo.' },
          { when: 'linear', say: 'Casi: el coeficiente del binomio al cubo es 3, dando $-3a$.' }
        ] }),

    N('rep-n-punto-critico-solucion', 'repetidas', 2, { k: [2, 6, 1] },
      function (v) { return 'Para la solución $y(x) = (x - ' + v.k + ')e^{-x}$, calcula la coordenada $x^*$ de su punto crítico donde $y\'(x^*) = 0$.'; },
      function (v) { return v.k + 1; },
      'Derivando: $y\'(x) = e^{-x} - (x - k)e^{-x} = (1 + k - x)e^{-x} = 0$. La solución es $x^* = k + 1$.',
      { mistakes: { justK: function (v) { return v.k; }, minusOne: function (v) { return v.k - 1; } },
        feedback: [
          { when: 'justK', say: 'Casi: en $x = k$ se anula la función $y(x) = 0$, pero su derivada se anula en $x^* = k + 1$.' },
          { when: 'minusOne', say: 'Casi: al resolver $1 + k - x = 0$ se obtiene $x = k + 1$.' }
        ] }),

    N('rep-n-cuarta-derivada-origen-x3', 'repetidas', 2, { r: [2, 4, 1] },
      function (v) { return 'Para la función $y(x) = x^3 e^{' + v.r + 'x}$, calcula el valor de la cuarta derivada en $x = 0$, $y^{(4)}(0)$.'; },
      function (v) { return 24 * v.r; },
      'Por Leibniz, en $x = 0$ sobrevive $\\binom{4}{3}(x^3)\'\'\'(0)(e^{rx})\'(0) = 4 \\times 6 \\times r = 24r$.',
      { mistakes: { sixR: function (v) { return 6 * v.r; }, neg: function (v) { return -24 * v.r; } },
        feedback: [
          { when: 'sixR', say: 'Casi: el coeficiente binomial es $\\binom{4}{3} = 4$ y $(x^3)\'\'\' = 6$, $4 \\times 6 = 24$.' },
          { when: 'neg', say: 'Casi: el resultado en el origen es positivo: $+24r$.' }
        ] }),

    N('rep-n-cero-cuadruple-integral', 'repetidas', 2, { c3: [3, 7, 1] },
      function (v) { return 'Si $y(x) = \\frac{' + v.c3 + '}{6} x^3$ satisface la ecuación $y^{(4)} = 0$, calcula el valor numérico de su tercera derivada $y\'\'\'(1)$.'; },
      function (v) { return v.c3; },
      'La tercera derivada de $x^3/6$ es $6/6 = 1$. Multiplicando por $c_3$, $y\'\'\'(x) = c_3$ constante para todo $x$.',
      { mistakes: { double: function (v) { return 2 * v.c3; }, neg: function (v) { return -v.c3; } },
        feedback: [
          { when: 'double', say: 'Casi: la derivada tercera de $x^3$ es exactamente 6, que cancela el denominador 6.' },
          { when: 'neg', say: 'Casi: las derivadas sucesivas de $x^3$ con coeficientes positivos son positivas.' }
        ] }),

    N('rep-n-sistema-constantes-triple', 'repetidas', 3, { a: [1, 3, 1], yp: [3, 7, 1] },
      function (v) { return 'La solución $y(x) = (c_1 + c_2 x + c_3 x^2)e^{' + v.a + 'x}$ cumple $y(0) = 0$ y $y\'(0) = ' + v.yp + '$. ¿Cuánto vale la constante $c_2$?'; },
      function (v) { return v.yp; },
      'Como $y(0) = c_1 = 0$, la derivada en 0 es $y\'(0) = c_2 + a\\,c_1 = c_2$. Por tanto, $c_2 = y\'(0)$.',
      { mistakes: { plusTwo: function (v) { return v.yp + 2; }, neg: function (v) { return -v.yp; } },
        feedback: [
          { when: 'plusTwo', say: 'Casi: como $c_1 = 0$, el término $a c_1$ se anula por completo, dejando $c_2 = y\'(0)$.' },
          { when: 'neg', say: 'Casi: la constante $c_2$ tiene el mismo signo que la derivada inicial.' }
        ] }),

    N('rep-n-constante-cuadratica-triple', 'repetidas', 3, { ypp: [6, 14, 2] },
      function (v) { return 'En $y(x) = (c_1 + c_2 x + c_3 x^2)e^x$ con $y(0) = 0$ y $y\'(0) = 0$, si $y\'\'(0) = ' + v.ypp + '$, determina el valor de $c_3$.'; },
      function (v) { return v.ypp / 2; },
      'Derivando dos veces con $c_1 = 0$ y $c_2 = 0$, se obtiene $y\'\'(0) = 2c_3$. Despejando: $c_3 = y\'\'(0)/2$.',
      { mistakes: { direct: function (v) { return v.ypp; }, neg: function (v) { return -v.ypp / 2; } },
        feedback: [
          { when: 'direct', say: 'Casi: $(x^2)\'\' = 2$, por lo que $y\'\'(0) = 2c_3$; debes dividir entre 2.' },
          { when: 'neg', say: 'Casi: con derivada segunda positiva, $c_3$ es positivo.' }
        ] }),

    E('rep-e-sol-pvi-triple-uno', 'repetidas', 2, { r: [1, 2, 1] },
      function (v) { var a = -3 * v.r, b = 3 * v.r * v.r, c = -v.r * v.r * v.r; return 'Resuelve la EDO $y\'\'\' ' + a + "y'' + " + b + "y' + " + c + 'y = 0$ con condiciones $y(0) = 1$, $y\'(0) = ' + v.r + '$ y $y\'\'(0) = ' + (v.r * v.r) + '$.'; },
      function (v) { return 'e^(' + v.r + '*x)'; },
      'La solución general es $(c_1 + c_2 x + c_3 x^2)e^{rx}$. Con las derivadas iniciales de $e^{rx}$, $c_1 = 1, c_2 = 0, c_3 = 0$.',
      { domain: [-1, 1],
        mistakes: { conX: function (v) { return '(1 + x)*e^(' + v.r + '*x)'; }, cuadratica: function (v) { return '(1 + x + x^2)*e^(' + v.r + '*x)'; } },
        feedback: [
          { when: 'conX', say: 'Casi: con estas condiciones $c_2 = 0$ y $c_3 = 0$, resultando la exponencial pura.' },
          { when: 'cuadratica', say: 'Casi: los términos en $x$ y $x^2$ alteran las derivadas iniciales.' }
        ] }),

    E('rep-e-sol-doble-con-x', 'repetidas', 2, { a: [1, 3, 1] },
      function (v) { return 'Encuentra la solución del problema $y\'\'\' - ' + (2 * v.a) + "y'' + " + (v.a * v.a) + 'y\' = 0$ sujeta a $y(0) = 0$, $y\'(0) = 1$ y $y\'\'(0) = ' + (2 * v.a) + '$.'; },
      function (v) { return 'x*e^(' + v.a + '*x)'; },
      'Las raíces son $0$ y $a$ doble. La general es $c_1 + (c_2 + c_3 x)e^{ax}$. Las condiciones iniciales fijan $c_1=0, c_2=0, c_3=1$, dando $x e^{ax}$.',
      { domain: [-1, 1],
        mistakes: { noX: function (v) { return 'e^(' + v.a + '*x)'; }, xCuadrada: function (v) { return 'x^2*e^(' + v.a + '*x)'; } },
        feedback: [
          { when: 'noX', say: 'Casi: para cumplir $y(0) = 0$ y $y\'(0) = 1$ la solución debe llevar el factor $x$.' },
          { when: 'xCuadrada', say: 'Casi: la derivada en el origen de $x^2 e^{ax}$ es cero, violando $y\'(0) = 1$.' }
        ] }),

    /* ======================= 4. Raíces complejas simples y repetidas (17) ======================= */
    C('cx-c-pares-conjugados', 'complejas', 1,
      '¿Por qué las raíces complejas no reales del polinomio característico de una EDO con coeficientes reales siempre vienen en pares conjugados $\\alpha \\pm \\beta i$?',
      'Por el teorema del conjugado para polinomios reales: si $P(z) = 0$, entonces $P(\\bar{z}) = \\overline{P(z)} = 0$', [
        ['Porque las ecuaciones diferenciales ordinarias solo admiten soluciones con números reales', 'Casi: las raíces son complejas; lo que es real son los coeficientes del polinomio característico.'],
        ['Porque la función exponencial $e^{rx}$ cancela la parte imaginaria de cualquier número complejo', 'Casi: por la fórmula de Euler, $e^{(\\alpha + \\beta i)x}$ contiene partes real e imaginaria.'],
        ['Porque el discriminante de cualquier ecuación de orden superior es forzosamente cero', 'Casi: el discriminante puede ser cualquier número real negativo o positivo.']],
      'Si los coeficientes del polinomio son reales, conjugar la ecuación demuestra que si $r$ es raíz, su conjugado complejo $\\bar{r}$ también lo es.'),

    C('cx-c-euler-base-trig', 'complejas', 1,
      'A partir del par de raíces conjugadas $r = \\alpha \\pm \\beta i$, ¿cómo se obtienen dos soluciones reales linealmente independientes usando la fórmula de Euler?',
      'Tomando la parte real $e^{\\alpha x}\\cos(\\beta x)$ y la parte imaginaria $e^{\\alpha x}\\sin(\\beta x)$ de la solución compleja $e^{(\\alpha + i\\beta)x}$', [
        ['Sumando y multiplicando las dos soluciones complejas para obtener una parábola', 'Casi: se toma la combinación lineal simétrica y antisimétrica (partes real e imaginaria).'],
        ['Despreciando la parte imaginaria $\\beta$ y usando únicamente $e^{\\alpha x}$', 'Casi: despreciar $\\beta$ eliminaría la oscilación y una de las dimensiones del espacio de soluciones.'],
        ['Elevando al cuadrado la parte imaginaria para convertirla en un número real negativo', 'Casi: la base real se forma con $\\cos(\\beta x)$ y $\\sin(\\beta x)$ moduladas por $e^{\\alpha x}$.']],
      'Por la fórmula de Euler, $e^{(\\alpha \\pm i\\beta)x} = e^{\\alpha x}(\\cos \\beta x \\pm i\\sin \\beta x)$. La parte real y la imaginaria forman la base real.'),

    C('cx-c-cuarto-orden-bicuadratica', 'complejas', 1,
      'Para la ecuación de cuarto orden $y^{(4)} + 16y = 0$, el polinomio característico es $r^4 + 16 = 0$. ¿Qué tipo de raíces tiene en el plano complejo?',
      'Cuatro raíces complejas con partes real e imaginaria no nulas: $\\pm \\sqrt{2} \\pm \\sqrt{2} i$', [
        ['Cuatro raíces imaginarias puras $\\pm 2i$ y $\\pm 4i$', 'Casi: las raíces cuartas de $-16$ están rotadas $45^\\circ$, teniendo partes real e imaginaria iguales.'],
        ['Dos raíces reales $\\pm 2$ y dos imaginarias puras $\\pm 2i$', 'Casi: eso corresponde a $r^4 - 16 = 0$, no a $r^4 + 16 = 0$.'],
        ['Una raíz cuádruple real en $r = -2$', 'Casi: la ecuación $r^4 = -16$ no tiene ninguna raíz real.']],
      '$-16 = 16 e^{i(\\pi + 2k\\pi)}$. Sus cuatro raíces tienen módulo $\\sqrt[4]{16} = 2$ y ángulos $\\pi/4, 3\\pi/4, 5\\pi/4, 7\\pi/4$, dando $\\pm \\sqrt{2} \\pm \\sqrt{2}i$.'),

    C('cx-c-complejas-repetidas-base', 'complejas', 2,
      'Si el par de raíces complejas imaginarias puras $\\pm \\beta i$ tiene multiplicidad 2 (por ejemplo, $(r^2 + \\beta^2)^2 = 0$), ¿cuáles son las cuatro funciones de la base real?',
      '$\\cos(\\beta x),\\; \\sin(\\beta x),\\; x\\cos(\\beta x),\\; x\\sin(\\beta x)$', [
        ['$\\cos(\\beta x),\\; \\sin(\\beta x),\\; \\cos(2\\beta x),\\; \\sin(2\\beta x)$', 'Casi: la frecuencia no se duplica; al haber multiplicidad se multiplica por potencias de $x$.'],
        ['$e^{\\beta x},\\; e^{-\\beta x},\\; x\\,e^{\\beta x},\\; x\\,e^{-\\beta x}$', 'Casi: las raíces son imaginarias puras, por lo que generan funciones trigonométricas, no exponenciales reales.'],
        ['$\\cos^2(\\beta x),\\; \\sin^2(\\beta x),\\; \\cos(\\beta x),\\; \\sin(\\beta x)$', 'Casi: las soluciones son combinaciones lineales de funciones, no potencias no lineales.']],
      'Al igual que con raíces reales, la multiplicidad 2 en raíces complejas introduce un factor adicional $x$, generando $x\\cos(\\beta x)$ y $x\\sin(\\beta x)$.'),

    C('cx-c-resonancia-orden-cuatro', 'complejas', 2,
      'En vibraciones mecánicas y vigas elásticas, la presencia de términos como $x\\sin(\\beta x)$ en la solución de $y^{(4)} + 2\\beta^2 y\'\' + \\beta^4 y = 0$ representa físicamente:',
      'Una oscilación cuya amplitud crece linealmente con $x$ sin límite, fenómeno originado por raíces imaginarias repetidas', [
        ['Un decaimiento exponencial rápido hacia la posición de equilibrio', 'Casi: la amplitud crece con $x$; no decae porque la parte real de las raíces es cero.'],
        ['Un movimiento armónico simple con amplitud estrictamente constante', 'Casi: el factor $x$ enfrente del seno hace que la amplitud crezca linealmente con $x$.'],
        ['Una solución constante estacionaria que no oscila', 'Casi: la función contiene $\\sin(\\beta x)$, por lo que oscila continuamente.']],
      'El término $x\\sin(\\beta x)$ tiene una envolvente $\\pm x$ que diverge cuando $x \\to \\infty$, lo que modela resonancia interna o pandeo.'),

    C('cx-c-orden-tres-imaginarias', 'complejas', 2,
      '¿Puede una EDO lineal homogénea de tercer orden con coeficientes reales tener tres raíces imaginarias puras?',
      'No, porque las raíces complejas no reales siempre vienen en pares conjugados, obligando a que al menos una raíz sea real', [
        ['Sí, siempre que el término independiente de la ecuación sea cero', 'Casi: si el término independiente es cero, $r = 0$ es raíz, la cual es un número real.'],
        ['Sí, si los coeficientes son números enteros impares', 'Casi: el teorema de los pares conjugados se aplica a cualquier polinomio con coeficientes reales.'],
        ['Solo si la ecuación carece de segunda derivada', 'Casi: cualquier polinomio de grado 3 con coeficientes reales tiene 1 o 3 raíces reales, jamás 0 reales.']],
      'El grado es 3 (impar). Las raíces complejas ocurren en pares ($2k$), por lo que el número de raíces reales es al menos $3 - 2 = 1$.'),

    N('cx-n-frecuencia-orden-cuatro', 'complejas', 1, { b: [2, 5, 1] },
      function (v) { return 'Calcula la frecuencia angular $\\beta$ (en rad/s) de las oscilaciones sinusoidales presentes en la solución general de $y^{(4)} - ' + (v.b * v.b * v.b * v.b) + 'y = 0$.'; },
      function (v) { return v.b; },
      'El factor $(r^2 + b^2) = 0$ produce $r = \\pm b i$, lo que genera soluciones $\\cos(bx)$ y $\\sin(bx)$ con frecuencia angular $\\beta = b$.',
      { mistakes: { squared: function (v) { return v.b * v.b; }, neg: function (v) { return -v.b; } },
        feedback: [
          { when: 'squared', say: 'Casi: $r^2 + b^2 = 0$ da raíces $\\pm bi$; la frecuencia es $b$, no $b^2$.' },
          { when: 'neg', say: 'Casi: la frecuencia angular $\\beta$ se define como una cantidad positiva.' }
        ] }),

    N('cx-n-parte-real-raiz-compleja', 'complejas', 1, { a: [2, 5, 1], w: [2, 5, 1] },
      function (v) { return 'La ecuación $(r - 3)((r + ' + v.a + ')^2 + ' + (v.w * v.w) + ') = 0$ es la característica de una EDO de tercer orden. ¿Cuánto vale la parte real $\\alpha$ de sus raíces complejas?'; },
      function (v) { return -v.a; },
      'Resolviendo $(r + a)^2 = -w^2$ se obtiene $r = -a \\pm wi$, cuya parte real es $\\alpha = -a$.',
      { mistakes: { pos: function (v) { return v.a; }, minusOne: function (v) { return -v.a - 1; } },
        feedback: [
          { when: 'pos', say: 'Casi: $(r + a) = \\pm wi \\implies r = -a \\pm wi$; la parte real es $-a$, negativa.' },
          { when: 'minusOne', say: 'Casi: la parte real exacta es $-a$.' }
        ] }),

    N('cx-n-periodo-oscilacion-imaginaria', 'complejas', 2, { b: [2, 5, 1] },
      function (v) { return 'Para la ecuación $y\'\'\' + ' + (v.b * v.b) + 'y\' = 0$, calcula el periodo fundamental $T = 2\\pi/\\beta$ de sus soluciones sinusoidales.'; },
      function (v) { return 2 * Math.PI / v.b; },
      'El polinomio es $r(r^2 + b^2) = 0$, con frecuencia $\\beta = b$. El periodo es $T = 2\\pi/b$.',
      { mistakes: { noPi: function (v) { return 2 / v.b; }, half: function (v) { return Math.PI / v.b; } },
        feedback: [
          { when: 'noPi', say: 'Casi: el periodo es $T = 2\\pi/\\beta$; olvidaste multiplicar por $\\pi$.' },
          { when: 'half', say: 'Casi: el periodo es $2\\pi/\\beta$, no $\\pi/\\beta$.' }
        ] }),

    N('cx-n-evaluar-solucion-trig-en-cero', 'complejas', 2, { c1: [2, 4, 1], c2: [3, 5, 1], w: [2, 4, 1] },
      function (v) { return 'Dada la solución $y(x) = ' + v.c1 + '\\cos(' + v.w + 'x) + ' + v.c2 + '\\sin(' + v.w + 'x) + x\\cos(' + v.w + 'x)$, calcula el valor numérico de su primera derivada en el origen, $y\'(0)$.'; },
      function (v) { return v.c2 * v.w + 1; },
      'La derivada es $y\'(x) = -c_1 w\\sin(wx) + c_2 w\\cos(wx) + \\cos(wx) - wx\\sin(wx)$. En $x = 0$ da $c_2 w + 1$.',
      { mistakes: { justC2W: function (v) { return v.c2 * v.w; }, minusOne: function (v) { return v.c2 * v.w - 1; } },
        feedback: [
          { when: 'justC2W', say: 'Casi: el término $x\\cos(wx)$ tiene derivada que en 0 aporta $+1$.' },
          { when: 'minusOne', say: 'Casi: la derivada de $x\\cos(wx)$ evaluada en 0 es $+1$, no $-1$.' }
        ] }),

    N('cx-n-segunda-derivada-seno-origen', 'complejas', 2, { c: [2, 5, 1], w: [2, 4, 1] },
      function (v) { return 'Calcula la segunda derivada en el origen, $y\'\'(0)$, para la función de base oscilatoria $y(x) = ' + v.c + '\\cos(' + v.w + 'x)$.'; },
      function (v) { return -v.c * v.w * v.w; },
      'Derivando dos veces: $y\' = -c w\\sin(wx)$ y $y\'\' = -c w^2\\cos(wx)$. En $x = 0$ vale $-c w^2$.',
      { mistakes: { posSign: function (v) { return v.c * v.w * v.w; }, linearW: function (v) { return -v.c * v.w; } },
        feedback: [
          { when: 'posSign', say: 'Casi: la segunda derivada de $\\cos(wx)$ es negativa: $-c w^2$.' },
          { when: 'linearW', say: 'Casi: en cada derivación se multiplica por $w$; para la segunda derivada es $w^2$.' }
        ] }),

    N('cx-n-coeficiente-amortiguamiento-raiz', 'complejas', 2, { al: [2, 5, 1] },
      function (v) { return 'Si el polinomio característico $(r - 0)((r + ' + v.al + ')^2 + 9) = 0$ se expande como $r^3 + a_2 r^2 + a_1 r = 0$, ¿cuánto vale el coeficiente $a_2$?'; },
      function (v) { return 2 * v.al; },
      'El factor cuadrático es $r^2 + 2\\alpha r + (\\alpha^2 + 9)$. Al multiplicar por $r$, el término cuadrático tiene coeficiente $a_2 = 2\\alpha$.',
      { mistakes: { justAl: function (v) { return v.al; }, neg: function (v) { return -2 * v.al; } },
        feedback: [
          { when: 'justAl', say: 'Casi: el término medio del binomio al cuadrado es $2\\alpha$, no $\\alpha$.' },
          { when: 'neg', say: 'Casi: el binomio es $(r + \\alpha)^2$, por lo que el coeficiente cuadrático es positivo.' }
        ] }),

    N('cx-n-modulo-al-cuadrado-raices', 'complejas', 2, { al: [2, 4, 1], be: [5, 7, 1] },
      function (v) { return 'Calcula el módulo al cuadrado $|r|^2 = \\alpha^2 + \\beta^2$ de las raíces complejas de $(r^2 + ' + (2 * v.al) + 'r + ' + (v.al * v.al + v.be * v.be) + ')(r - 1) = 0$.'; },
      function (v) { return v.al * v.al + v.be * v.be; },
      'Las raíces complejas son $-\\alpha \\pm \\beta i$. Su módulo al cuadrado es $(-\\alpha)^2 + \\beta^2 = \\alpha^2 + \\beta^2$.',
      { mistakes: { diff: function (v) { return v.be * v.be - v.al * v.al; }, justSum: function (v) { return v.al + v.be; } },
        feedback: [
          { when: 'diff', say: 'Casi: el módulo al cuadrado es la suma de los componentes al cuadrado, no la diferencia.' },
          { when: 'justSum', say: 'Casi: debes sumar los cuadrados de la parte real y de la parte imaginaria.' }
        ] }),

    N('cx-n-envolvente-amplitud-creciente', 'complejas', 3, { c: [2, 5, 1], x0: [3, 6, 1] },
      function (v) { return 'La solución modulada $y(x) = ' + v.c + 'x\\sin(3x)$ posee una amplitud oscilatoria creciente $A(x) = ' + v.c + 'x$. ¿Cuánto vale dicha amplitud cuando $x = ' + v.x0 + '$?'; },
      function (v) { return v.c * v.x0; },
      'La amplitud de oscilación modulada por resonancia es $A(x) = c\\,x$. En $x = x_0$, $A(x_0) = c\\,x_0$.',
      { mistakes: { justC: function (v) { return v.c; }, double: function (v) { return 2 * v.c * v.x0; } },
        feedback: [
          { when: 'justC', say: function (v) { return 'Casi: la envolvente depende de la posición; debes multiplicar por $x = ' + v.x0 + '$.'; } },
          { when: 'double', say: 'Casi: la amplitud directa es $c x_0$, sin factor 2.' }
        ] }),

    N('cx-n-tercera-derivada-coseno', 'complejas', 3, { w: [2, 4, 1] },
      function (v) { return 'Para la función $y(x) = \\sin(' + v.w + 'x)$, calcula el valor numérico de su tercera derivada en el origen, $y\'\'\'(0)$.'; },
      function (v) { return -Math.pow(v.w, 3); },
      'Las derivadas sucesivas son $w\\cos(wx), -w^2\\sin(wx), -w^3\\cos(wx)$. En $x = 0$ vale $-w^3$.',
      { mistakes: { pos: function (v) { return Math.pow(v.w, 3); }, squared: function (v) { return -v.w * v.w; } },
        feedback: [
          { when: 'pos', say: 'Casi: la tercera derivada de $\\sin(wx)$ evaluada en 0 es $-w^3$, con signo negativo.' },
          { when: 'squared', say: 'Casi: en cada derivación se multiplica por $w$; para la tercera derivada la potencia es $w^3$.' }
        ] }),

    E('cx-e-sol-pvi-seno-puro', 'complejas', 2, { w: [2, 4, 1] },
      function (v) { return 'Resuelve la ecuación $y\'\'\' + ' + (v.w * v.w) + 'y\' = 0$ sujeta a las condiciones $y(0) = 0$, $y\'(0) = ' + v.w + '$ y $y\'\'(0) = 0$.'; },
      function (v) { return 'sin(' + v.w + '*x)'; },
      'La solución general es $c_1 + c_2\\cos(wx) + c_3\\sin(wx)$. $y(0)=0$ y $y\'\'(0)=0$ dan $c_1=c_2=0$. $y\'(0) = c_3 w = w \\implies c_3=1$.',
      { domain: [0, 2],
        mistakes: { coseno: function (v) { return 'cos(' + v.w + '*x)'; }, noW: function () { return 'sin(x)'; } },
        feedback: [
          { when: 'coseno', say: 'Casi: $\\cos(wx)$ vale 1 en $x = 0$, violando la condición inicial $y(0) = 0$.' },
          { when: 'noW', say: function (v) { return 'Casi: la frecuencia angular de la ecuación es $w = ' + v.w + '$.'; } }
        ] }),

    E('cx-e-sol-cuarto-orden-par', 'complejas', 3, { a: [1, 3, 1] },
      function (v) { return 'Determina la solución de $y^{(4)} + ' + (v.a * v.a) + 'y\'\' = 0$ que satisface $y(0) = 1$, $y\'(0) = 0$, $y\'\'(0) = -' + (v.a * v.a) + '$ y $y\'\'\'(0) = 0$.'; },
      function (v) { return 'cos(' + v.a + '*x)'; },
      'La base fundamental es $\\{1, x, \\cos(ax), \\sin(ax)\\}$. Las condiciones dadas identifican de forma única a $y(x) = \\cos(ax)$.',
      { domain: [0, 2],
        mistakes: { seno: function (v) { return 'sin(' + v.a + '*x)'; }, constante: function () { return '1'; } },
        feedback: [
          { when: 'seno', say: 'Casi: la función seno vale 0 en $x = 0$, violando $y(0) = 1$.' },
          { when: 'constante', say: 'Casi: la función constante tiene segunda derivada nula, violando $y\'\'(0) = -a^2$.' }
        ] }),

    /* ======================= 5. Conjunto fundamental y dimensión (16) ======================= */
    C('ba-c-dimension-espacio-soluciones', 'base', 1,
      'Para una ecuación diferencial ordinaria lineal homogénea de orden $n$ con coeficientes continuos, ¿cuál es la dimensión de su espacio vectorial de soluciones?',
      'Exactamente $n$, lo que significa que cualquier conjunto fundamental contiene exactamente $n$ funciones linealmente independientes', [
        ['La dimensión es infinita porque existen infinitas combinaciones lineales posibles', 'Casi: hay infinitas soluciones particulares, pero la dimensión (número de funciones de la base) es finita e igual a $n$.'],
        ['La dimensión es $n + 1$, incluyendo la función constante generada por la integración', 'Casi: la dimensión coincide exactamente con el orden $n$ de la ecuación diferencial.'],
        ['La dimensión es 2, independientemente del orden de la ecuación', 'Casi: la dimensión 2 corresponde únicamente a segundo orden; para orden $n$ es $n$.']],
      'El espacio de soluciones de una EDO lineal homogénea de orden $n$ es un espacio vectorial de dimensión finita exactamente igual a $n$.'),

    C('ba-c-definicion-wronskiano-n', 'base', 1,
      '¿Cómo se define el determinante Wronskiano $W(y_1, y_2, \\dots, y_n)(x)$ para $n$ funciones suficientemente diferenciables?',
      'Como el determinante de la matriz cuadrada $n \\times n$ cuyo renglón $k$-ésimo contiene las derivadas de orden $k-1$: $y_j^{(k-1)}(x)$', [
        ['Como la suma simple de todas las derivadas sucesivas de las $n$ funciones', 'Casi: el Wronskiano es un determinante de una matriz cuadrada de derivadas, no una suma.'],
        ['Como el producto de las funciones $y_1(x) \\cdot y_2(x) \\dots y_n(x)$', 'Casi: involucra las derivadas sucesivas de cada función ordenadas en renglones.'],
        ['Como el determinante jacobiano de una transformación de coordenadas espaciales', 'Casi: es el determinante de la matriz de soluciones fundamentales y sus derivadas.']],
      'El Wronskiano es $\\det [y_j^{(i-1)}]_{i,j=1}^n$, el determinante del sistema lineal que relaciona las constantes con las condiciones iniciales.'),

    C('ba-c-teorema-abel-orden-n', 'base', 1,
      '¿Qué establece la fórmula de Abel para el Wronskiano $W(x)$ de $n$ soluciones de $y^{(n)} + p_{n-1}(x)y^{(n-1)} + \\dots + p_0(x)y = 0$?',
      '$W(x) = W(x_0)\\,\\exp\\left(-\\int_{x_0}^x p_{n-1}(t)\\,dt\\right)$, por lo que nunca se anula o es idénticamente cero en todo el intervalo', [
        ['$W(x) = W(x_0) + \\int_{x_0}^x p_0(t)\\,dt$, dependiendo únicamente del término libre', 'Casi: el Wronskiano depende del coeficiente de la penúltima derivada $p_{n-1}(x)$ mediante una exponencial.'],
        ['$W(x)$ es siempre una constante numérica independiente de los coeficientes', 'Casi: solo es constante si el coeficiente de la derivada $(n-1)$-ésima es cero.'],
        ['$W(x)$ oscila periódicamente cruzando por cero repetidas veces', 'Casi: como la función exponencial nunca se anula ni cambia de signo, $W(x)$ jamás cruza por cero si $W(x_0) \\neq 0$.']],
      'Por la identidad de Abel, $W\'(x) = -p_{n-1}(x)W(x)$, cuya solución exponencial preserva estrictamente el signo de $W(x_0)$.'),

    C('ba-c-independencia-lineal-criterio', 'base', 1,
      'Si $y_1, y_2, \\dots, y_n$ son soluciones de una misma EDO lineal homogénea de orden $n$ en un intervalo $I$, ¿qué condición garantiza que formen un conjunto fundamental?',
      'Que su determinante Wronskiano sea distinto de cero en al menos un punto $x_0 \\in I$', [
        ['Que ninguna de las funciones tome el valor cero en ningún punto del intervalo', 'Casi: las soluciones individuales pueden tener ceros (como $\\sin x$); lo que no puede ser cero es su Wronskiano.'],
        ['Que todas las funciones tengan el mismo signo positivo en todo el intervalo', 'Casi: el signo de las funciones individuales es irrelevante para su independencia lineal.'],
        ['Que el producto de todas las funciones sea igual a la constante uno', 'Casi: el criterio fundamental es que el determinante Wronskiano no se anule.']],
      'Por Abel, si $W(x_0) \\neq 0$ en un solo punto, es no nulo en todo el intervalo, garantizando la independencia lineal de las $n$ soluciones.'),

    C('ba-c-constantes-arbitrarias-pvi', 'base', 2,
      '¿Por qué la solución general de una EDO lineal homogénea de orden $n$ debe incluir exactamente $n$ constantes arbitrarias esenciales?',
      'Para poder satisfacer de forma única cualquier conjunto de $n$ condiciones iniciales independientes $y(x_0), y\'(x_0), \\dots, y^{(n-1)}(x_0)$', [
        ['Porque cada derivada requiere una constante de integración positiva y otra negativa', 'Casi: cada orden de integración introduce una única constante escalar independiente.'],
        ['Para asegurar que la función resultante sea periódica en todo su dominio', 'Casi: la periodicidad depende de si las raíces son imaginarias, no del número de constantes.'],
        ['Porque el número de constantes debe ser igual al grado del polinomio de Taylor', 'Casi: las constantes parametrizan la solución en el espacio vectorial de dimensión $n$.']],
      'Un sistema lineal de $n$ condiciones en un punto $x_0$ para una combinación lineal $c_1 y_1 + \\dots + c_n y_n$ requiere $n$ incógnitas para tener solución única.'),

    C('ba-c-principio-superposicion-n', 'base', 2,
      'El principio de superposición para ecuaciones lineales homogéneas de orden superior asegura que:',
      'Cualquier combinación lineal $c_1 y_1 + c_2 y_2 + \\dots + c_k y_k$ de soluciones particulares es también una solución de la ecuación', [
        ['El producto de dos soluciones cualesquiera es siempre otra solución de la ecuación', 'Casi: la suma lineal sí es solución, pero el producto de soluciones en general no lo es.'],
        ['Solo las soluciones con la misma frecuencia angular pueden combinarse', 'Casi: cualquier solución puede combinarse linealmente con cualquier otra debido a la linealidad del operador.'],
        ['La superposición solo es válida si todos los coeficientes de la EDO son enteros', 'Casi: el principio se cumple para cualquier ecuación diferencial lineal homogénea.']],
      'El operador diferencial lineal $L$ satisface $L(c_1 y_1 + c_2 y_2) = c_1 L(y_1) + c_2 L(y_2) = 0 + 0 = 0$.'),

    C('ba-c-conteo-funciones-base', 'base', 2,
      'Al factorizar el polinomio característico de una EDO de orden 5 se obtiene $(r - 2)^2 (r + 1) (r^2 + 9) = 0$. ¿Cuántas funciones linealmente independientes componen su base?',
      'Exactamente 5 funciones: dos de la raíz $r = 2$, una de $r = -1$ y dos del par imaginario $\\pm 3i$', [
        ['Solo 3 funciones, una por cada factor algebraico del polinomio', 'Casi: se deben contar las multiplicidades: el factor cuadrático repetido da 2 funciones y $r^2+9$ aporta 2 funciones.'],
        ['4 funciones, porque las raíces imaginarias se combinan en una sola', 'Casi: el par imaginario aporta dos funciones independientes: coseno y seno.'],
        ['6 funciones, añadiendo una constante arbitraria adicional', 'Casi: el orden de la ecuación es 5, por lo que la base contiene exactamente 5 funciones.']],
      'Multiplicidades: $r=2$ aporta $e^{2x}, xe^{2x}$ (2); $r=-1$ aporta $e^{-x}$ (1); $r=\\pm 3i$ aporta $\\cos 3x, \\sin 3x$ (2). Total: $2 + 1 + 2 = 5$.'),

    N('ba-n-tamano-matriz-wronskiano', 'base', 1, { n: [3, 6, 1] },
      function (v) { return 'Para una ecuación diferencial ordinaria de orden ' + v.n + ', ¿cuántos elementos en total (renglones $\\times$ columnas) tiene la matriz de su determinante Wronskiano?'; },
      function (v) { return v.n * v.n; },
      'El Wronskiano de $n$ funciones es el determinante de una matriz cuadrada de $n \\times n$, la cual posee $n^2$ elementos.',
      { mistakes: { justN: function (v) { return v.n; }, doubleN: function (v) { return 2 * v.n; } },
        feedback: [
          { when: 'justN', say: 'Casi: $n$ es el número de renglones; la matriz completa tiene $n \\times n = n^2$ entradas.' },
          { when: 'doubleN', say: 'Casi: se multiplica renglones por columnas: $n \\times n = n^2$.' }
        ] }),

    N('ba-n-orden-maximo-derivada-wronskiano', 'base', 1, { n: [4, 7, 1] },
      function (v) { return 'En la matriz del determinante Wronskiano para una ecuación de orden ' + v.n + ', ¿cuál es el orden más alto de derivada que aparece en el último renglón?'; },
      function (v) { return v.n - 1; },
      'Los renglones van desde la derivada de orden 0 (la función) hasta el orden $n - 1$ en el renglón $n$.',
      { mistakes: { orderN: function (v) { return v.n; }, plusOne: function (v) { return v.n + 1; } },
        feedback: [
          { when: 'orderN', say: 'Casi: el primer renglón es la derivada cero, por lo que el renglón $n$ contiene la derivada $n - 1$.' },
          { when: 'plusOne', say: 'Casi: la derivada máxima en el Wronskiano de orden $n$ es $n - 1$.' }
        ] }),

    N('ba-n-conteo-constantes-orden', 'base', 1, { n: [4, 8, 1] },
      function (v) { return '¿Cuántas constantes arbitrarias esenciales aparecen en la solución general de una ecuación diferencial lineal homogénea de orden ' + v.n + '?'; },
      function (v) { return v.n; },
      'La dimensión del espacio de soluciones coincide con el orden $n$, requiriendo exactamente $n$ constantes arbitrarias.',
      { mistakes: { minusOne: function (v) { return v.n - 1; }, plusOne: function (v) { return v.n + 1; } },
        feedback: [
          { when: 'minusOne', say: 'Casi: el número de constantes coincide exactamente con el orden $n$ de la EDO.' },
          { when: 'plusOne', say: 'Casi: para una ecuación de orden $n$ la solución general tiene $n$ constantes.' }
        ] }),

    N('ba-n-wronskiano-constante-coef-cero', 'base', 2, { w0: [3, 8, 1] },
      function (v) { return 'En la ecuación $y\'\'\' + 4y\' - 6y = 0$, el coeficiente de la segunda derivada es $p_2(x) = 0$. Si el Wronskiano en $x = 0$ es $W(0) = ' + v.w0 + '$, calcula el valor de $W(5)$.'; },
      function (v) { return v.w0; },
      'Por la fórmula de Abel, $W(x) = W(0)\\,e^{-\\int 0\\,dt} = W(0)$. Al ser $p_2(x) = 0$, el Wronskiano es constante para todo $x$.',
      { mistakes: { plusTwo: function (v) { return v.w0 + 2; }, neg: function (v) { return -v.w0; } },
        feedback: [
          { when: 'plusTwo', say: 'Casi: por la fórmula de Abel con $p_2 = 0$, $W(x)$ es constante e igual a $W(0)$.' },
          { when: 'neg', say: 'Casi: el Wronskiano preserva su signo positivo constante.' }
        ] }),

    N('ba-n-wronskiano-dos-polinomios-uno', 'base', 2, { a: [2, 6, 1] },
      function (v) { return 'Calcula el determinante Wronskiano de las tres funciones $y_1 = 1$, $y_2 = x$, $y_3 = ' + v.a + 'x^2$ evaluado en cualquier punto $x$.'; },
      function (v) { return 2 * v.a; },
      'La matriz con renglones $(1, x, ax^2)$, $(0, 1, 2ax)$ y $(0, 0, 2a)$ es triangular superior. Su determinante es $1 \\times 1 \\times 2a = 2a$.',
      { mistakes: { justA: function (v) { return v.a; }, neg: function (v) { return -2 * v.a; } },
        feedback: [
          { when: 'justA', say: 'Casi: la derivada segunda de $a x^2$ es $2a$, por lo que el producto diagonal es $2a$.' },
          { when: 'neg', say: 'Casi: el determinante de la matriz triangular tiene signo positivo: $+2a$.' }
        ] }),

    N('ba-n-wronskiano-tres-potencias-x', 'base', 2, { a: [3, 6, 1] },
      function (v) { return 'Para las tres funciones $y_1 = ' + v.a + '$, $y_2 = x$ y $y_3 = x^2$, calcula el valor constante de su determinante Wronskiano.'; },
      function (v) { return 2 * v.a; },
      'La matriz tiene renglones $(a, x, x^2)$, $(0, 1, 2x)$ y $(0, 0, 2)$. El determinante es $a \\times 1 \\times 2 = 2a$.',
      { mistakes: { justA: function (v) { return v.a; }, two: function () { return 2; } },
        feedback: [
          { when: 'justA', say: 'Casi: en el último renglón la derivada de $x^2$ aporta un factor 2; el determinante es $2a$.' },
          { when: 'two', say: function (v) { return 'Casi: debes multiplicar por el valor de la función constante inicial $a = ' + v.a + '$.'; } }
        ] }),

    N('ba-n-combinacion-lineal-evaluada', 'base', 2, { c1: [1, 3, 1], c2: [2, 4, 1], c3: [2, 5, 1] },
      function (v) { return 'Si la solución general de $y\'\'\' = 0$ es $y(x) = ' + v.c1 + ' + ' + v.c2 + 'x + ' + v.c3 + 'x^2$, calcula el valor numérico de $y(2)$.'; },
      function (v) { return v.c1 + 2 * v.c2 + 4 * v.c3; },
      'Evaluando en $x = 2$: $y(2) = c_1 + c_2(2) + c_3(2^2) = c_1 + 2c_2 + 4c_3$.',
      { mistakes: { noSquare: function (v) { return v.c1 + 2 * v.c2 + 2 * v.c3; }, atOne: function (v) { return v.c1 + v.c2 + v.c3; } },
        feedback: [
          { when: 'noSquare', say: 'Casi: en el término cuadrático $x^2 = 2^2 = 4$, debes multiplicar $c_3$ por 4.' },
          { when: 'atOne', say: 'Casi: evaluaste en $x = 1$ en lugar de $x = 2$.' }
        ] }),

    N('ba-n-traza-sistema-equivalente', 'base', 3, { a2: [2, 6, 1] },
      function (v) { return 'Al convertir la EDO $y\'\'\' + ' + v.a2 + "y'' + 4y' + 5y = 0$ en un sistema de primer orden $\\mathbf{x}\' = A\\mathbf{x}$, ¿cuánto vale la traza de la matriz compañera $A$?"; },
      function (v) { return -v.a2; },
      'La matriz compañera de orden 3 tiene ceros en la diagonal excepto en la posición inferior derecha $(3,3)$, donde vale $-a_2$. Su traza es $-a_2$.',
      { mistakes: { pos: function (v) { return v.a2; }, minusOne: function (v) { return -v.a2 - 1; } },
        feedback: [
          { when: 'pos', say: 'Casi: el elemento de la diagonal es $-a_2$, con signo negativo.' },
          { when: 'minusOne', say: 'Casi: la traza coincide exactamente con $-a_2$.' }
        ] }),

    N('ba-n-wronskiano-abel-decae', 'base', 3, { a: [2, 5, 1] },
      function (v) { return 'Para la ecuación $y\'\'\' + ' + v.a + "y'' + 4y' + 5y = 0$, el Wronskiano cumple $W(x) = W(0)e^{k x}$. Determina el valor numérico de la constante $k$."; },
      function (v) { return -v.a; },
      'Por la fórmula de Abel, $W(x) = W(0)\\,\\exp(-\\int p_2\\,dx) = W(0)e^{-a x}$. Por lo tanto, el exponente es $k = -a$.',
      { mistakes: { pos: function (v) { return v.a; }, minusTwo: function (v) { return -v.a - 2; } },
        feedback: [
          { when: 'pos', say: 'Casi: la fórmula de Abel lleva un signo negativo enfrente de la integral: $k = -a$.' },
          { when: 'minusTwo', say: 'Casi: el exponente es directamente $-a$.' }
        ] }),

    /* ======================= 6. Problemas de valor inicial de orden superior (18) ======================= */
    C('pvi-c-numero-condiciones', 'pvi', 1,
      '¿Por qué un problema de valor inicial para una ecuación diferencial lineal homogénea de orden $n$ requiere exactamente $n$ condiciones en el punto inicial $x_0$?',
      'Porque la solución general contiene $n$ constantes esenciales que forman un sistema algebraico de $n \\times n$ con solución única', [
        ['Porque cada condición inicial elimina un término no lineal de la ecuación', 'Casi: la ecuación ya es lineal; las condiciones fijan el valor de las constantes arbitrarias.'],
        ['Porque se necesita una condición en cada uno de los $n$ ejes del plano complejo', 'Casi: todas las $n$ condiciones se evalúan en el mismo punto real inicial $x_0$.'],
        ['Porque el Teorema Fundamental del Cálculo exige integrar $2n$ veces', 'Casi: para orden $n$ se necesitan $n$ condiciones para determinar la solución particular.']],
      'La solución general es una combinación de $n$ funciones independientes. Hallar los $n$ coeficientes requiere un sistema lineal de $n$ ecuaciones.'),

    C('pvi-c-condiciones-estandar-pvi', 'pvi', 1,
      '¿Cuál es el conjunto estándar de condiciones iniciales para un PVI de orden 3 fijado en el punto inicial $x_0$?',
      'El valor de la función y de sus dos primeras derivadas en ese mismo punto: $y(x_0) = y_0$, $y\'(x_0) = y\'_0$, $y\'\'(x_0) = y\'\'_0$', [
        ['El valor de la función en tres puntos espaciados: $y(x_1)$, $y(x_2)$ y $y(x_3)$', 'Casi: fijar valores en puntos distintos define un problema de frontera (PVF), no un PVI.'],
        ['El valor de la función y de sus tres primeras derivadas: $y, y\', y\'\', y\'\'\'$', 'Casi: para orden 3 solo se especifican hasta la segunda derivada (orden $n - 1$).'],
        ['Únicamente el valor de la tercera derivada en el origen: $y\'\'\'(0)$', 'Casi: se requieren las derivadas de orden 0 hasta $n - 1$.']],
      'Un PVI de orden $n$ fija el estado completo en un solo punto $x_0$, involucrando las derivadas desde el orden 0 hasta $n - 1$.'),

    C('pvi-c-solucion-trivial-unicidad', 'pvi', 1,
      'Si en un PVI homogéneo de orden $n$ con coeficientes constantes todas las condiciones iniciales son nulas ($y(0) = y\'(0) = \\dots = y^{(n-1)}(0) = 0$), ¿cuál es su solución?',
      'La solución idénticamente nula $y(x) = 0$ para todo $x \\in \\mathbb{R}$, garantizada por el teorema de unicidad', [
        ['No existe ninguna solución porque no se pueden calcular las constantes', 'Casi: la función constante cero satisface la ecuación y las condiciones iniciales nulas.'],
        ['Cualquier múltiplo de la primera función de la base $c_1 y_1(x)$', 'Casi: si las condiciones son cero, obligatoriamente todas las constantes $c_k = 0$.'],
        ['Una oscilación armónica de amplitud infinitesimal', 'Casi: la solución es exactamente la función cero en todo su dominio.']],
      'La función idénticamente nula $y(x) \\equiv 0$ satisface la EDO homogénea y todas las condiciones cero. Por unicidad, es la única solución.'),

    C('pvi-c-dominio-validez-pvi', 'pvi', 2,
      'Para una EDO homogénea de orden $n$ con coeficientes constantes reales, ¿cuál es el intervalo de validez de la solución única del PVI?',
      'Toda la recta real $(-\\infty, \\infty)$, pues los coeficientes constantes son continuos en todo $\\mathbb{R}$ sin puntos singulares', [
        ['Solo el semieje positivo $[x_0, \\infty)$', 'Casi: la solución está definida y es única para todo $x \\in \\mathbb{R}$, tanto a la derecha como a la izquierda.'],
        ['Únicamente un intervalo cerrado local $[x_0 - 1, x_0 + 1]$', 'Casi: en ecuaciones lineales con coeficientes continuos no hay singularidades locales; la validez es global.'],
        ['Hasta el primer punto donde la solución cruza por cero', 'Casi: la solución es diferenciable en todo $\\mathbb{R}$; no se interrumpe en sus raíces.']],
      'Al ser los coeficientes constantes, no hay divisiones entre cero ni singularidades. La solución existe y es única en $(-\\infty, \\infty)$.'),

    C('pvi-c-despeje-derivada-superior', 'pvi', 2,
      'Si se conocen los valores iniciales $y(0), y\'(0), \\dots, y^{(n-1)}(0)$, ¿cómo se obtiene el valor de la derivada superior $y^{(n)}(0)$ sin resolver la ecuación?',
      'Despejando directamente $y^{(n)}$ de la ecuación diferencial evaluada en $x = 0$', [
        ['Es imposible conocer $y^{(n)}(0)$ sin calcular primero todas las constantes de la solución', 'Casi: la propia EDO relaciona $y^{(n)}$ linealmente con las derivadas de menor orden en cualquier punto.'],
        ['Integrando las condiciones iniciales entre $0$ y $1$', 'Casi: se despeja algebraicamente de la propia EDO sin necesidad de integrar.'],
        ['Elevando al cuadrado la condición inicial $y^{(n-1)}(0)$', 'Casi: la relación entre derivadas es una ecuación lineal dada por la propia EDO.']],
      'De $a_n y^{(n)} + \\dots + a_0 y = 0$ se despeja directamente $y^{(n)}(0) = -\\frac{1}{a_n}\\sum_{k=0}^{n-1} a_k y^{(k)}(0)$.'),

    N('pvi-n-suma-constantes-origen', 'pvi', 1, { y0: [3, 7, 1] },
      function (v) { return 'La solución de una EDO de tercer orden es $y(x) = c_1 + c_2 e^x + c_3 e^{2x}$. Si la condición inicial es $y(0) = ' + v.y0 + '$, ¿cuánto vale la suma $c_1 + c_2 + c_3$?'; },
      function (v) { return v.y0; },
      'Evaluando en $x = 0$: $y(0) = c_1 e^0 + c_2 e^0 + c_3 e^0 = c_1 + c_2 + c_3 = y_0$.',
      { mistakes: { plusTwo: function (v) { return v.y0 + 2; }, neg: function (v) { return -v.y0; } },
        feedback: [
          { when: 'plusTwo', say: 'Casi: cada exponencial evaluada en 0 vale 1, por lo que la suma directa es $y(0)$.' },
          { when: 'neg', say: 'Casi: la suma directa de las constantes es exactamente $+y(0)$.' }
        ] }),

    N('pvi-n-tercera-derivada-despejada', 'pvi', 2, { a2: [2, 4, 1], a1: [1, 3, 1], a0: [2, 4, 1], y0: [1, 2, 1], y1: [1, 2, 1], y2: [2, 3, 1] },
      function (v) { return 'Para la ecuación $y\'\'\' + ' + v.a2 + "y'' + " + v.a1 + "y' + " + v.a0 + 'y = 0$ con $y(0) = ' + v.y0 + '$, $y\'(0) = ' + v.y1 + '$ y $y\'\'(0) = ' + v.y2 + '$, calcula el valor de $y\'\'\'(0)$.'; },
      function (v) { return -v.a2 * v.y2 - v.a1 * v.y1 - v.a0 * v.y0; },
      'Despejando de la EDO: $y\'\'\'(0) = -a_2 y\'\'(0) - a_1 y\'(0) - a_0 y(0)$.',
      { mistakes: { pos: function (v) { return v.a2 * v.y2 + v.a1 * v.y1 + v.a0 * v.y0; }, forgotA0: function (v) { return -v.a2 * v.y2 - v.a1 * v.y1; } },
        feedback: [
          { when: 'pos', say: 'Casi: al despejar $y\'\'\'$ todos los términos pasan al lado derecho con signo negativo.' },
          { when: 'forgotA0', say: 'Casi: no olvides incluir el término correspondiente a la función $y(0)$.' }
        ] }),

    N('pvi-n-cuarta-derivada-despejada', 'pvi', 2, { a: [2, 4, 1], y0: [2, 4, 1] },
      function (v) { return 'Si $y(x)$ satisface $y^{(4)} - ' + (v.a * v.a) + 'y = 0$ con $y(0) = ' + v.y0 + '$, $y\'(0) = 0$, $y\'\'(0) = 0$, $y\'\'\'(0) = 0$, calcula el valor de $y^{(4)}(0)$.'; },
      function (v) { return v.a * v.a * v.y0; },
      'De la propia ecuación diferencial: $y^{(4)}(0) = a^2 y(0) = a^2 y_0$.',
      { mistakes: { neg: function (v) { return -v.a * v.a * v.y0; }, justY0: function (v) { return v.y0; } },
        feedback: [
          { when: 'neg', say: function (v) { return 'Casi: al despejar $y^{(4)} = +' + (v.a * v.a) + 'y$, el signo es positivo.'; } },
          { when: 'justY0', say: function (v) { return 'Casi: debes multiplicar por el coeficiente de la ecuación $a^2 = ' + (v.a * v.a) + '$.'; } }
        ] }),

    N('pvi-n-segunda-derivada-condicion', 'pvi', 2, { r1: [2, 4, 1] },
      function (v) { return 'La solución del PVI para una EDO de tercer orden sujeta a $y(0) = 2$, $y\'(0) = ' + v.r1 + '$ y $y\'\'(0) = ' + (v.r1 * v.r1) + '$ satisface las tres condiciones. Indica el valor numérico de $y\'\'(0)$.'; },
      function (v) { return v.r1 * v.r1; },
      'La condición inicial dada en el enunciado impone directamente que $y\'\'(0) = r_1^2$.',
      { mistakes: { linear: function (v) { return v.r1; }, neg: function (v) { return -v.r1 * v.r1; } },
        feedback: [
          { when: 'linear', say: 'Casi: ese es el valor de la primera derivada $y\'(0)$, no de la segunda.' },
          { when: 'neg', say: 'Casi: la condición inicial es positiva: $+r_1^2$.' }
        ] }),

    N('pvi-n-evaluar-solucion-pvi-uno', 'pvi', 2, { a: [5, 9, 1], b: [2, 4, 1] },
      function (v) { return 'La solución única de un PVI de tercer orden es $y(x) = ' + v.a + ' + ' + v.b + 'x - x^2$. Evalúa la función en el punto $x = 2$.'; },
      function (v) { return v.a + 2 * v.b - 4; },
      'Sustituyendo $x = 2$: $y(2) = a + b(2) - (2)^2 = a + 2b - 4$.',
      { mistakes: { plusEight: function (v) { return v.a + 2 * v.b + 4; }, neg: function (v) { return -(v.a + 2 * v.b - 4); } },
        feedback: [
          { when: 'plusEight', say: 'Casi: el término cuadrático lleva signo negativo: $-x^2 = -4$.' },
          { when: 'neg', say: 'Casi: revisa los signos de cada término; el resultado debe ser positivo.' }
        ] }),

    N('pvi-n-pendiente-en-uno-polinomial', 'pvi', 2, { c2: [2, 5, 1], c3: [2, 5, 1] },
      function (v) { return 'Para la solución $y(x) = 3 + ' + v.c2 + 'x + ' + v.c3 + 'x^2$, calcula la pendiente de la recta tangente en $x = 1$, $y\'(1)$.'; },
      function (v) { return v.c2 + 2 * v.c3; },
      'La derivada es $y\'(x) = c_2 + 2c_3 x$. En $x = 1$ vale $c_2 + 2c_3$.',
      { mistakes: { justC2: function (v) { return v.c2; }, sumCoeff: function (v) { return v.c2 + v.c3; } },
        feedback: [
          { when: 'justC2', say: 'Casi: la derivada de $c_3 x^2$ es $2c_3 x$, que en $x = 1$ aporta $2c_3$.' },
          { when: 'sumCoeff', say: 'Casi: la derivada de $x^2$ es $2x$, por lo que se multiplica por 2.' }
        ] }),

    N('pvi-n-tercera-derivada-raiz-cero', 'pvi', 3, { c: [2, 5, 1] },
      function (v) { return 'Dada la solución $y(x) = ' + v.c + 'x^3$ de la ecuación $y^{(4)} = 0$, calcula el valor numérico constante de su tercera derivada $y\'\'\'(x)$ para cualquier $x$.'; },
      function (v) { return 6 * v.c; },
      'Derivando tres veces sucesivas: $(c x^3)\' = 3c x^2$, $(c x^3)\'\' = 6c x$, $(c x^3)\'\'\' = 6c$. Es constante para todo $x$.',
      { mistakes: { justC: function (v) { return v.c; }, firstDeriv: function (v) { return 3 * v.c; } },
        feedback: [
          { when: 'justC', say: 'Casi: derivar $x^3$ tres veces produce $3! = 6$, por lo que debes multiplicar por 6.' },
          { when: 'firstDeriv', say: 'Casi: la tercera derivada de $x^3$ es 6, no 3.' }
        ] }),

    N('pvi-n-quinta-derivada-en-cero', 'pvi', 3, { a: [2, 3, 1], y0: [2, 3, 1] },
      function (v) { return 'Dada la ecuación $y\'\'\' - ' + (v.a * v.a) + 'y\' = 0$ con solución particular $y(x) = ' + v.y0 + 'e^{' + v.a + 'x}$, calcula el valor de su quinta derivada en el origen, $y^{(5)}(0)$.'; },
      function (v) { return v.y0 * Math.pow(v.a, 5); },
      'Cada derivación sucesiva de $e^{ax}$ multiplica por $a$. Para la quinta derivada en $x = 0$: $y^{(5)}(0) = y_0 a^5$.',
      { mistakes: { fourth: function (v) { return v.y0 * Math.pow(v.a, 4); }, neg: function (v) { return -v.y0 * Math.pow(v.a, 5); } },
        feedback: [
          { when: 'fourth', say: 'Casi: calculaste la cuarta derivada; para la quinta se multiplica por $a^5$.' },
          { when: 'neg', say: 'Casi: con $a > 0$ y $y_0 > 0$, las derivadas de la exponencial son positivas.' }
        ] }),

    N('pvi-n-condicion-derivada-origen-coseno', 'pvi', 3, { c: [2, 5, 1], w: [2, 4, 1] },
      function (v) { return 'Dada la función oscilatoria $y(x) = ' + v.c + '\\cos(' + v.w + 'x)$, calcula el valor numérico de la suma $y(0) + y\'\'(0)$.'; },
      function (v) { return v.c * (1 - v.w * v.w); },
      'Evaluando: $y(0) = c$ y $y\'\'(0) = -c w^2$. La suma es $c - c w^2 = c(1 - w^2)$.',
      { mistakes: { posSign: function (v) { return v.c * (1 + v.w * v.w); }, justY0: function (v) { return v.c; } },
        feedback: [
          { when: 'posSign', say: 'Casi: la segunda derivada de $\\cos(wx)$ en el origen es negativa: $-c w^2$.' },
          { when: 'justY0', say: 'Casi: olvidaste sumar el término de la segunda derivada $y\'\'(0) = -c w^2$.' }
        ] }),

    E('pvi-e-orden-tres-polinomial', 'pvi', 2, { a: [1, 3, 1], b: [2, 4, 1] },
      function (v) { return 'Resuelve la EDO $y\'\'\' = 0$ sujeta a las condiciones iniciales $y(0) = ' + v.a + '$, $y\'(0) = ' + v.b + '$ y $y\'\'(0) = 2$.'; },
      function (v) { return v.a + ' + ' + v.b + '*x + x^2'; },
      'Integrando sucesivamente: $y(x) = y(0) + y\'(0)x + \\frac{y\'\'(0)}{2}x^2 = a + bx + x^2$.',
      { domain: [-1, 1],
        mistakes: { dosXcuadrada: function (v) { return v.a + ' + ' + v.b + '*x + 2*x^2'; }, sinCuadratica: function (v) { return v.a + ' + ' + v.b + '*x'; } },
        feedback: [
          { when: 'dosXcuadrada', say: 'Casi: la segunda derivada de $x^2$ es $2$, que coincide con $y\'\'(0) = 2$. Con $2x^2$ daría 4.' },
          { when: 'sinCuadratica', say: 'Casi: olvidaste el término cuadrático correspondiente a $y\'\'(0) = 2$.' }
        ] }),

    E('pvi-e-orden-tres-exponencial-pura', 'pvi', 2, { k: [1, 3, 1], y0: [2, 5, 1] },
      function (v) { return 'Halla la solución del PVI $y\'\'\' - ' + v.k + "y'' = 0$ con $y(0) = ' + v.y0 + '$, $y\'(0) = ' + (v.k * v.y0) + '$ y $y\'\'(0) = ' + (v.k * v.k * v.y0) + '$."; },
      function (v) { return v.y0 + '*e^(' + v.k + '*x)'; },
      'Las tres derivadas iniciales cumplen $y^{(j)}(0) = y_0 k^j$, lo que coincide exactamente con la solución exponencial pura $y(x) = y_0 e^{kx}$.',
      { domain: [-1, 1],
        mistakes: { noY0: function (v) { return 'e^(' + v.k + '*x)'; }, polinomial: function (v) { return v.y0 + ' + ' + (v.k * v.y0) + '*x'; } },
        feedback: [
          { when: 'noY0', say: function (v) { return 'Casi: olvidaste el factor constante inicial $y_0 = ' + v.y0 + '$.'; } },
          { when: 'polinomial', say: 'Casi: las derivadas corresponden a la función exponencial, no a una recta.' }
        ] }),

    E('pvi-e-orden-cuatro-dos-exponenciales', 'pvi', 3, { a: [1, 2, 1] },
      function (v) { return 'Resuelve la ecuación $y^{(4)} - ' + (v.a * v.a * v.a * v.a) + 'y = 0$ sujeta a $y(0) = 2$, $y\'(0) = 0$, $y\'\'(0) = ' + (2 * v.a * v.a) + '$ y $y\'\'\'(0) = 0$.'; },
      function (v) { return 'e^(' + v.a + '*x) + e^(-' + v.a + '*x)'; },
      'Las raíces son $\\pm a, \\pm ai$. Las derivadas impares nulas y las condiciones pares determinan $y(x) = e^{ax} + e^{-ax} = 2\\cosh(ax)$.',
      { domain: [-1, 1],
        mistakes: { menos: function (v) { return 'e^(' + v.a + '*x) - e^(-' + v.a + '*x)'; }, coseno: function (v) { return '2*cos(' + v.a + '*x)'; } },
        feedback: [
          { when: 'menos', say: 'Casi: con signo negativo $y(0) = 0$, violando la condición $y(0) = 2$.' },
          { when: 'coseno', say: 'Casi: para la función coseno la segunda derivada sería negativa ($-2a^2$), pero la condición es $+2a^2$.' }
        ] }),

    E('pvi-e-orden-tres-seno-desplazado', 'pvi', 3, { w: [2, 3, 1] },
      function (v) { return 'Encuentra la solución del PVI $y\'\'\' + ' + (v.w * v.w) + 'y\' = 0$ con condiciones $y(0) = 1$, $y\'(0) = ' + v.w + '$ y $y\'\'(0) = 0$.'; },
      function (v) { return '1 + sin(' + v.w + '*x)'; },
      'La solución general es $c_1 + c_2\\cos(wx) + c_3\\sin(wx)$. $y(0)=1, y\'\'(0)=0 \\implies c_1=1, c_2=0$; $y\'(0)=w \\implies c_3=1$. Resulta $1 + \\sin(wx)$.',
      { domain: [0, 2],
        mistakes: { sinUno: function (v) { return 'sin(' + v.w + '*x)'; }, conCoseno: function (v) { return '1 + cos(' + v.w + '*x)'; } },
        feedback: [
          { when: 'sinUno', say: 'Casi: falta el término constante $1$ para satisfacer $y(0) = 1$.' },
          { when: 'conCoseno', say: 'Casi: en $x = 0$ la función $1 + \\cos(wx)$ valdría 2 en lugar de 1.' }
        ] })
  ];

  K.register(SUBTEMAS, Q);
})();
