/* =====================================================================
   Banco · Cálculo 3 · S12 · Coeficientes indeterminados: la forma de
   y_p según g(x) (bloque C · No homogéneas y orden superior).
   100 preguntas propias (source: 'propia').
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c3', '12');

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
    'c3.S12.forma': 'Estructura general y elección de la forma de y_p',
    'c3.S12.polinomios': 'Lado derecho polinomial y coeficientes',
    'c3.S12.exponenciales': 'Lado derecho exponencial',
    'c3.S12.trigonometricas': 'Lado derecho con senos y cosenos',
    'c3.S12.superposicion': 'Superposición y productos de funciones',
    'c3.S12.pvi': 'Problemas de valor inicial y solución completa'
  };

  var Q = [
    /* ======================= 1. Estructura general y elección de la forma de y_p (16) ======================= */
    C('fo-c-estructura-gral', 'forma', 1,
      'Para una ecuación lineal no homogénea $L(y) = g(x)$, ¿cuál es la estructura de su solución general?',
      '$y = y_h + y_p$, con $y_h$ la solución de la homogénea y $y_p$ una particular', [
        ['$y = y_h \\cdot y_p$, el producto de ambas', 'Casi: por linealidad las soluciones se suman, no se multiplican.'],
        ['$y = y_p$, descartando la solución homogénea', 'Casi: la solución homogénea aporta las constantes arbitrarias.'],
        ['$y = y_h - g(x)$, restando la fuente directamente', 'Casi: $g(x)$ no resuelve la ecuación; se requiere $L(y_p) = g(x)$.']],
      'La solución general de una ecuación lineal no homogénea es la suma de la homogénea y una particular.'),

    C('fo-c-metodo-aplicabilidad', 'forma', 1,
      '¿Para qué tipo de funciones $g(x)$ se aplica directamente coeficientes indeterminados?',
      'Polinomios, exponenciales $e^{kx}$, senos $\\sin\\omega x$, cosenos $\\cos\\omega x$, y sumas o productos de ellos', [
        ['Cualquier función continua como $\\tan x$ o $\\ln x$', 'Casi: las derivadas de $\\tan x$ o $\\ln x$ no forman una familia finita.'],
        ['Únicamente polinomios de grado 1 o 2', 'Casi: también admite exponenciales, senos, cosenos y polinomios de cualquier grado.'],
        ['Solo funciones periódicas acotadas', 'Casi: las exponenciales y los polinomios no son periódicos y el método funciona.']],
      'El método requiere que las derivadas sucesivas de $g(x)$ pertenezcan a una familia finita de funciones.'),

    C('fo-c-origen-anulador', 'forma', 1,
      '¿Cuál es la razón matemática de proponer que $y_p$ tenga la misma forma que $g(x)$?',
      'Al derivar polinomios, exponenciales y senos o cosenos, el resultado queda en la misma familia de funciones', [
        ['Las derivadas de cualquier función reducen su grado', 'Casi: funciones como $\\sec x$ generan términos cada vez más complejos.'],
        ['La solución particular siempre es ortogonal a $y_h$', 'Casi: la relación se debe a la invariancia bajo derivación lineal.'],
        ['La ecuación cancela todas las derivadas de orden impar', 'Casi: las derivadas de orden impar intervienen si la ecuación tiene $y\'$.']],
      'Operadores con coeficientes constantes transforman estas familias en combinaciones de la misma familia.'),

    C('fo-c-polinomio-incompleto', 'forma', 1,
      'Para $y\'\' + 3y\' + 2y = 5x^2$, ¿por qué la propuesta correcta es $y_p = Ax^2 + Bx + C$ y no solo $Ax^2$?',
      'Porque al derivar $Ax^2$ aparecen términos con $x$ y constantes que deben equilibrarse', [
        ['Porque todo polinomio debe tener al menos tres términos', 'Casi: se debe a las potencias menores generadas por $y\'$ y $y\'\'$.'],
        ['Porque $C$ representa la constante de integración del PVI', 'Casi: $C$ es un coeficiente indeterminado fijo de $y_p$, no una constante libre.'],
        ['Porque $Ax^2$ violaría la linealidad de la ecuación', 'Casi: la linealidad se conserva con cualquier función admitida.']],
      'El término $y\'$ introduce potencias inferiores que requieren coeficientes adicionales para cancelarse.'),

    C('fo-c-seno-solo', 'forma', 1,
      'Si $g(x) = 4\\sin(3x)$ y la ecuación contiene $y\'$, ¿por qué $y_p$ debe llevar seno y coseno?',
      'Porque la derivada de $\\sin(3x)$ produce $\\cos(3x)$, y se necesita un término para cancelarlo', [
        ['Por la identidad pitagórica $\\sin^2(3x) + \\cos^2(3x) = 1$', 'Casi: la ecuación es lineal; no se eleva al cuadrado ninguna función.'],
        ['Porque la frecuencia angular se duplica al derivar', 'Casi: la frecuencia angular se mantiene en $\\omega = 3$.'],
        ['Porque se deben usar números complejos obligatoriamente', 'Casi: se trabaja en el campo real combinando seno y coseno.']],
      'Al estar presente $y\'$, senos y cosenos se mezclan mediante la derivación.'),

    C('fo-c-seno-sin-derivada-primera', 'forma', 1,
      'En $y\'\' + 9y = 6\\cos(2x)$ (sin término en $y\'$), ¿qué ocurre con el seno en $y_p = A\\cos 2x + B\\sin 2x$?',
      'El coeficiente $B$ resulta automáticamente cero al sustituir', [
        ['El sistema algebraico resulta incompatible', 'Casi: el sistema tiene solución única con $A = 6/5$ y $B = 0$.'],
        ['El término en coseno se anula y queda puro seno', 'Casi: la segunda derivada del coseno es coseno, igualando directamente a $g$.'],
        ['Es obligatorio multiplicar por $x$', 'Casi: la frecuencia natural es $3$ y la externa es $2$; no hay resonancia.']],
      'Al no haber $y\'$, la segunda derivada de cada función trigonométrica no genera la función complementaria.'),

    C('fo-c-frecuencia-diferente', 'forma', 1,
      'Si $g(x) = \\cos(4x)$, ¿por qué sería incorrecto proponer $y_p = A\\cos(2x) + B\\sin(2x)$?',
      'Porque las derivadas no cambian la frecuencia; $\\cos(2x)$ nunca podrá igualar a $\\cos(4x)$', [
        ['Porque $\\cos(2x)$ no está definida en el origen', 'Casi: ambas funciones están definidas en todo $\\mathbb{R}$; difiere la frecuencia.'],
        ['Porque la amplitud de $\\cos(2x)$ es el doble', 'Casi: las amplitudes las determinan los coeficientes indeterminados.'],
        ['Porque el periodo debe ser igual a $\\pi$', 'Casi: la respuesta forzada adopta la frecuencia de la fuente externa.']],
      'Los operadores lineales con coeficientes constantes preservan la frecuencia angular de la excitación.'),

    C('fo-c-invalido-tan', 'forma', 1,
      '¿Por qué el método de coeficientes indeterminados no se aplica a $y\'\' + y = \\tan x$?',
      'Porque las derivadas sucesivas de $\\tan x$ generan potencias de $\\sec x$ y no forman una familia finita', [
        ['Porque $\\tan x$ es una función impar', 'Casi: la paridad no impide el método; lo impide la infinitud de formas derivadas.'],
        ['Porque la ecuación característica carece de raíces reales', 'Casi: las raíces son $\\pm i$, pero para resolverla se usa variación de parámetros.'],
        ['Porque el coeficiente de $y$ es igual a $1$', 'Casi: el impedimento radica exclusivamente en la función fuente $\\tan x$.']],
      'Funciones como $\\tan x$, $\\sec x$ o $\\ln x$ requieren variación de parámetros.'),

    C('fo-c-constante-indet-vs-arb', 'forma', 2,
      '¿Cuál es la diferencia entre las constantes $c_1, c_2$ de $y_h$ y los coeficientes $A, B$ de $y_p$?',
      '$c_1, c_2$ son arbitrarias y se fijan con el PVI; $A, B$ quedan fijos por la propia ecuación diferencial', [
        ['$c_1, c_2$ son enteros y $A, B$ son fraccionarios', 'Casi: todas las constantes pueden tomar cualquier valor real.'],
        ['No hay diferencia; las cuatro se calculan con el PVI', 'Casi: $A$ y $B$ se determinan sustituyendo en la EDO antes del PVI.'],
        ['$A, B$ dependen de $y(0)$ y $c_1, c_2$ dependen de $g(x)$', 'Casi: es al revés; $A, B$ provienen de $g(x)$ y $c_1, c_2$ del PVI.']],
      'Los coeficientes de $y_p$ son únicos para esa $g(x)$, mientras que $y_h$ aporta los grados de libertad.'),

    C('fo-c-grado-polinomio-rhs', 'forma', 2,
      function (v) { return 'Para $y\'\' + 4y\' + 3y = 7x^{' + v.n + '}$, ¿cuál es el grado del polinomio que se propone para $y_p$?'; },
      function (v) { return 'Grado ' + v.n + ' completo ($Ax^{' + v.n + '} + \\dots + A_0$)'; }, [
        [function (v) { return 'Grado ' + (v.n + 2); }, function (v) { return 'Casi: el término $3y$ conserva el grado $' + v.n + '$.'; }],
        [function (v) { return 'Grado ' + (v.n - 1); }, function (v) { return 'Casi: el término $3y$ no deriva la función; mantiene el grado $' + v.n + '$.'; }],
        [function (v) { return 'Solo el monomio $Ax^{' + v.n + '}$'; }, 'Casi: al derivar aparecen potencias menores que deben equilibrarse.']],
      'Con $c \\neq 0$, la potencia más alta proviene de $c y_p$, por lo que $y_p$ tiene el mismo grado que $g(x)$.',
      { vars: { n: [3, 5, 1] } }),

    C('fo-c-exp-polinomio-forma', 'forma', 2,
      function (v) { return '¿Qué forma de $y_p$ corresponde a $y\'\' - 4y = (3x + ' + v.b + ')e^{' + v.k + 'x}$ si $k = ' + v.k + '$ no es raíz característica?'; },
      function (v) { return '$(Ax + B)e^{' + v.k + 'x}$'; }, [
        [function (v) { return 'Axe^{' + v.k + 'x}'; }, 'Casi: el polinomio debe ser de grado 1 completo: $(Ax + B)$.'],
        [function (v) { return '(Ax^2 + Bx)e^{' + v.k + 'x}'; }, function (v) { return 'Casi: como $' + v.k + '$ no es raíz de $r^2 - 4 = 0$, no se multiplica por $x$.'; }],
        [function (v) { return 'Ax + B + Ce^{' + v.k + 'x}'; }, 'Casi: es un producto de polinomio por exponencial, no una suma.']],
      'Para una fuente $P_1(x)e^{kx}$ sin resonancia, la solución particular es $(Ax + B)e^{kx}$.',
      { vars: { b: [1, 5, 1], k: [3, 5, 1] } }),

    C('fo-c-exponencial-base-a', 'forma', 2,
      'Si la fuente es $g(x) = 2^x$, ¿cómo se formula para coeficientes indeterminados?',
      'Se reescribe como $e^{(\\ln 2)x}$ y se propone $y_p = A\\,e^{(\\ln 2)x} = A\\,2^x$', [
        ['No se puede resolver con coeficientes indeterminados', 'Casi: cualquier base positiva $a$ se expresa como $a^x = e^{x\\ln a}$.'],
        ['Se propone un polinomio $Ax + B$', 'Casi: $2^x$ es exponencial, no polinomial.'],
        ['Se deriva como $x 2^{x-1}$', 'Casi: la derivada de $a^x$ es $(\\ln a)a^x$.']],
      'Como $2^x = e^{x\\ln 2}$, se trata de una exponencial estándar con $k = \\ln 2$.'),

    C('fo-c-suma-trig-frec', 'forma', 2,
      function (v) { return 'Para $y\'\' + y = 3\\cos(' + v.w1 + 'x) + 5\\sin(' + v.w2 + 'x)$ con frecuencias distintas, ¿cuántos coeficientes indeterminados tiene $y_p$?'; },
      function (v) { return 'Cuatro coeficientes ($A\\cos ' + v.w1 + 'x + B\\sin ' + v.w1 + 'x + C\\cos ' + v.w2 + 'x + D\\sin ' + v.w2 + 'x$)'; }, [
        ['Dos coeficientes en total', 'Casi: cada frecuencia distinta requiere su propia pareja de seno y coseno.'],
        ['Un solo coeficiente combinado', 'Casi: las funciones con frecuencias distintas son linealmente independientes.'],
        ['Seis coeficientes', 'Casi: por linealidad no aparecen términos con frecuencias cruzadas.']],
      'Por superposición, cada frecuencia distinta aporta dos coeficientes indeterminados.',
      { vars: { w1: [2, 3, 1], w2: [4, 5, 1] } }),

    C('fo-c-linealidad-fraccion', 'forma', 2,
      '¿Es aplicable coeficientes indeterminados a $y\'\' + 2y\' + y = \\dfrac{1}{1 + x^2}$?',
      'No, porque las derivadas de $(1+x^2)^{-1}$ generan potencias racionales crecientes', [
        ['Sí, proponiendo $y_p = A/(1 + Bx^2)$', 'Casi: esa expresión no es lineal en los parámetros indeterminados.'],
        ['Sí, porque el denominador es cuadrático', 'Casi: una función racional no es un polinomio.'],
        ['Sí, restringiendo $x$ a $[-1, 1]$', 'Casi: la limitación proviene de la estructura algebraica bajo derivación.']],
      'Las funciones racionales no forman una familia finita bajo derivación.'),

    N('fo-n-contar-parametros', 'forma', 3, { p: [2, 4, 1], m: [1, 3, 1] },
      function (v) { return 'Para $y\'\' + 5y\' + 6y = (x^{' + v.p + '} - 1) + x^{' + v.m + '}e^{4x}$, ¿cuántos coeficientes indeterminados en total tiene la forma canónica de $y_p$?'; },
      function (v) { return v.p + v.m + 2; },
      'El polinomio de grado $p$ aporta $p+1$ coeficientes y el producto con $e^{4x}$ aporta $m+1$; en total $(p+1)+(m+1)$.',
      { mistakes: {
          noConst: function (v) { return v.p + v.m; },
          onlyLeading: function () { return 2; }
        },
        feedback: [
          { when: 'noConst', say: 'Casi: olvidaste los términos constantes de los polinomios.' },
          { when: 'onlyLeading', say: 'Casi: propusiste solo los términos de mayor grado en lugar de los polinomios completos.' }
        ] }),

    N('fo-n-grado-suma', 'forma', 3, { n: [2, 4, 1], m: [1, 3, 1] },
      function (v) { return 'Si $g(x) = P_{' + v.n + '}(x) + Q_{' + v.m + '}(x)\\cos(3x)$ con polinomios de grados $' + v.n + '$ y $' + v.m + '$, ¿cuántos coeficientes tiene $y_p$ sin resonancia?'; },
      function (v) { return v.n + 2 * v.m + 3; },
      'El polinomio $P_n$ aporta $n+1$ coeficientes y la parte trigonométrica requiere senos y cosenos: $2(m+1)$.',
      { mistakes: {
          forgotSine: function (v) { return v.n + v.m + 2; },
          noConsts: function (v) { return v.n + 2 * v.m; }
        },
        feedback: [
          { when: 'forgotSine', say: 'Casi: olvidaste que la parte trigonométrica requiere tanto cosenos como senos.' },
          { when: 'noConsts', say: 'Casi: los polinomios completos de grado $k$ tienen $k+1$ términos.' }
        ] }),

    /* ======================= 2. Lado derecho polinomial y coeficientes (17) ======================= */
    C('po-c-orden-cero', 'polinomios', 1,
      'Para $y\'\' + 4y\' + 3y = 12$, ¿cuál es el valor de la solución particular constante $y_p$?',
      '$y_p = 4$, porque $3y_p = 12$', [
        ['$y_p = 12$', 'Casi: debes dividir entre el coeficiente de $y$, que es $3$.'],
        ['$y_p = 3$', 'Casi: para una constante $y\' = 0$; solo actúa el término $3y$.'],
        ['$y_p = 0$', 'Casi: las derivadas se anulan pero $3y_p = 12$.']],
      'Al proponer $y_p = A$, las derivadas son cero y queda $3A = 12 \\Rightarrow A = 4$.'),

    C('po-c-origen-termino-constante', 'polinomios', 1,
      'En $y\'\' + 2y\' + 5y = 10x$, al proponer $y_p = Ax + B$, ¿de dónde surge la ecuación para $B$?',
      'Del término constante $2A + 5B = 0$, producido por $2y\'_p$ y $5y_p$', [
        ['De la segunda derivada $y\'\'_p$', 'Casi: la segunda derivada de $Ax + B$ es idénticamente cero.'],
        ['De igualar $B$ directamente al término independiente de $g$', 'Casi: el término $2y\'$ aporta $2A$ a las constantes.'],
        ['De la condición inicial $y(0) = B$', 'Casi: las condiciones iniciales determinan $y_h + y_p$, no $B$ en la EDO.']],
      'Sustituyendo da $5Ax + (2A + 5B) = 10x$, lo que exige $2A + 5B = 0$.'),

    C('po-c-sistema-triangular', 'polinomios', 1,
      'Al igualar coeficientes para un polinomio de grado $n$ en $a y\'\' + b y\' + c y = P_n(x)$ con $c \\neq 0$, ¿qué estructura tiene el sistema?',
      'Es triangular: se halla primero el coeficiente principal $A_n$ y los demás en cascada', [
        ['Es un sistema completamente acoplado', 'Casi: la potencia más alta contiene únicamente a $A_n$.'],
        ['Es un sistema homogéneo indeterminado', 'Casi: con $c \\neq 0$ el sistema tiene solución única.'],
        ['Requiere calcular valores propios', 'Casi: es una sustitución algebraica directa hacia atrás.']],
      'La potencia $x^n$ solo aparece en $c A_n x^n$, permitiendo despejar de mayor a menor grado.'),

    C('po-c-sin-termino-independiente', 'polinomios', 1,
      'Si una ecuación es $a y\'\' + b y\' = x$ (sin término en $y$), ¿por qué falla proponer $y_p = Ax + B$?',
      'Porque al derivar, la potencia más alta que queda en el lado izquierdo es constante y no puede igualar a $x$', [
        ['Porque las ecuaciones sin término en $y$ no tienen solución', 'Casi: se resuelven fácilmente integrando o con cambio $u = y\'$.'],
        ['Porque la solución homogénea es siempre nula', 'Casi: la homogénea contiene la constante $c_1$ pues $r = 0$ es raíz.'],
        ['Porque el discriminante se vuelve negativo', 'Casi: las raíces son $0$ y $-b/a$, que son reales.']],
      'Al faltar $c y$, la derivada más baja es $y\'$, exigiendo que $y_p$ sea de un grado mayor.'),

    C('po-c-efecto-coeficiente-c', 'polinomios', 1,
      'En $y\'\' + 3y\' + c\\,y = 6$, si duplicamos $c > 0$, ¿qué le ocurre a la solución particular constante $y_p$?',
      'Se reduce a la mitad, porque $y_p = 6/c$', [
        ['Se duplica', 'Casi: $c$ multiplica a $y_p$, por lo que pasa dividiendo.'],
        ['Permanece constante', 'Casi: el valor de equilibrio depende de la rigidez $c$ del sistema.'],
        ['Se vuelve cero', 'Casi: una entrada constante no nula produce un desplazamiento particular no nulo.']],
      'Para $y_p = A$, $cA = 6 \\Rightarrow A = 6/c$; al duplicar $c$, la amplitud se divide entre 2.'),

    N('po-n-constante-simple', 'polinomios', 2, { c: [2, 5, 1], k: [10, 30, 5] },
      function (v) { return 'Encuentra la solución particular constante $y_p$ de la ecuación $y\'\' + 5y\' + ' + v.c + 'y = ' + v.k + '$.'; },
      function (v) { return v.k / v.c; },
      'Para $y_p = A$, las derivadas son cero y $c A = k \\Rightarrow A = k/c$.',
      { mistakes: {
          mult: function (v) { return v.k * v.c; },
          noDiv: function (v) { return v.k; }
        },
        feedback: [
          { when: 'mult', say: function (v) { return 'Casi: al sustituir queda $' + v.c + ' y_p = ' + v.k + '$, así que se divide entre $' + v.c + '$.'; } },
          { when: 'noDiv', say: function (v) { return 'Casi: falta dividir entre el coeficiente $' + v.c + '$ de $y$.'; } }
        ] }),

    N('po-n-lineal-coef-a', 'polinomios', 2, { c: [2, 5, 1], p: [4, 12, 2], b: [2, 6, 1] },
      function (v) { return 'Para la ecuación $y\'\' + ' + v.b + "y' + " + v.c + 'y = ' + v.p + 'x$, se propone $y_p = Ax + B$. ¿Cuánto vale el coeficiente $A$?'; },
      function (v) { return v.p / v.c; },
      'Al sustituir $y_p = Ax+B$, el coeficiente de $x$ es $c A = p \\Rightarrow A = p/c$.',
      { where: function (v) { return v.c !== v.b; },
        mistakes: {
          divB: function (v) { return v.p / v.b; },
          neg: function (v) { return -v.p / v.c; }
        },
        feedback: [
          { when: 'divB', say: 'Casi: el término en $x$ proviene de $c(Ax) = px$, por lo que $A = p/c$.' },
          { when: 'neg', say: 'Casi: el signo es positivo porque ambos coeficientes son positivos.' }
        ] }),

    N('po-n-lineal-coef-b', 'polinomios', 2, { b: [2, 4, 1], c: [2, 5, 1], p: [2, 6, 1], q: [1, 5, 1] },
      function (v) { return 'Para la ecuación $y\'\' + ' + v.b + "y' + " + v.c + 'y = ' + v.p + 'x + ' + v.q + '$, calcula el término constante $B$ en $y_p = Ax + B$.'; },
      function (v) { return (v.c * v.q - v.b * v.p) / (v.c * v.c); },
      'De $bA + cB = q$ y $A = p/c$, se despeja $B = (cq - bp)/c^2$.',
      { where: function (v) { return Math.abs(v.c * v.q - v.b * v.p) >= 3; },
        mistakes: {
          plusSign: function (v) { return (v.c * v.q + v.b * v.p) / (v.c * v.c); },
          noDivCSq: function (v) { return (v.c * v.q - v.b * v.p) / v.c; }
        },
        feedback: [
          { when: 'plusSign', say: 'Casi: al despejar $cB = q - bA$, el término $bA$ pasa restando.' },
          { when: 'noDivCSq', say: 'Casi: falta dividir entre $c$ para despejar $B$.' }
        ] }),

    N('po-n-eval-lineal-yp', 'polinomios', 2, { c: [2, 4, 1], p: [2, 6, 2], x1: [2, 4, 1] },
      function (v) { return 'Dada la ecuación $y\'\' + 3y\' + ' + v.c + 'y = ' + (v.c * v.p) + 'x$, calcula el valor de $y_p$ en $x = ' + v.x1 + '$.'; },
      function (v) { return v.p * v.x1 - 3 * v.p / v.c; },
      'Sustituyendo $y_p = Ax+B$ da $A = p$ y $B = -3p/c$; luego $y_p(x_1) = p x_1 - 3p/c$.',
      { mistakes: {
          forgotB: function (v) { return v.p * v.x1; },
          wrongSignB: function (v) { return v.p * v.x1 + 3 * v.p / v.c; }
        },
        feedback: [
          { when: 'forgotB', say: function (v) { return 'Casi: olvidaste el término constante $B = -3(' + v.p + ')/' + v.c + '$.'; } },
          { when: 'wrongSignB', say: 'Casi: el término constante es negativo: $B = -3A/c$.' }
        ] }),

    N('po-n-cuadratica-coef-a', 'polinomios', 2, { c: [2, 5, 1], p: [6, 18, 3] },
      function (v) { return 'Para $y\'\' + y\' + ' + v.c + 'y = ' + v.p + 'x^2$, se propone $y_p = Ax^2 + Bx + C$. ¿Cuánto vale $A$?'; },
      function (v) { return v.p / v.c; },
      'La mayor potencia $x^2$ proviene únicamente de $c A x^2 = p x^2 \\Rightarrow A = p/c$.',
      { mistakes: {
          div2: function (v) { return v.p / (2 * v.c); },
          noDiv: function (v) { return v.p; }
        },
        feedback: [
          { when: 'div2', say: 'Casi: el término en $x^2$ proviene de $c(Ax^2) = px^2$, por lo que $A = p/c$.' },
          { when: 'noDiv', say: function (v) { return 'Casi: falta dividir entre el coeficiente $' + v.c + '$ de $y$.'; } }
        ] }),

    N('po-n-cuadratica-coef-b', 'polinomios', 2, { b: [2, 4, 1], c: [2, 5, 1], p: [4, 10, 2] },
      function (v) { return 'En $y\'\' + ' + v.b + "y' + " + v.c + 'y = ' + v.p + 'x^2$, calcula el coeficiente $B$ de $y_p = Ax^2 + Bx + C$.'; },
      function (v) { return -2 * v.b * v.p / (v.c * v.c); },
      'El término en $x$ en la ecuación es $2bA + cB = 0 \\Rightarrow B = -2bA/c = -2bp/c^2$.',
      { mistakes: {
          posSign: function (v) { return 2 * v.b * v.p / (v.c * v.c); },
          noTwo: function (v) { return -v.b * v.p / (v.c * v.c); }
        },
        feedback: [
          { when: 'posSign', say: 'Casi: al despejar $cB = -2bA$, el signo es negativo.' },
          { when: 'noTwo', say: 'Casi: la derivada de $Ax^2$ es $2Ax$, aportando un factor $2$.' }
        ] }),

    N('po-n-cuadratica-sin-derivada-primera', 'polinomios', 2, { c: [2, 5, 1], p: [4, 10, 2], s: [1, 5, 1] },
      function (v) { return 'Para la ecuación $y\'\' + ' + v.c + 'y = ' + v.p + 'x^2 + ' + v.s + '$ (sin término en $y\'$), calcula el término constante $C$ de $y_p$.'; },
      function (v) { return (v.c * v.s - 2 * v.p) / (v.c * v.c); },
      'Al sustituir, $y\'\'_p = 2A$ se suma con $c C$, dando $2A + c C = s \\Rightarrow C = (s - 2A)/c$.',
      { where: function (v) { return Math.abs(v.c * v.s - 2 * v.p) >= 3; },
        mistakes: {
          forgot2A: function (v) { return v.s / v.c; },
          wrongSign2A: function (v) { return (v.c * v.s + 2 * v.p) / (v.c * v.c); }
        },
        feedback: [
          { when: 'forgot2A', say: 'Casi: olvidaste que la segunda derivada $y\'\'_p = 2A$ contribuye al término independiente.' },
          { when: 'wrongSign2A', say: 'Casi: al despejar $cC = s - 2A$, el término $2A$ pasa restando.' }
        ] }),

    E('po-e-lineal-completa', 'polinomios', 2, { c: [2, 4, 1], p: [2, 4, 1], q: [1, 3, 1] },
      function (v) { return 'Encuentra la solución particular $y_p(x)$ de $y\'\' + 2y\' + ' + v.c + 'y = ' + (v.p * v.c) + 'x + ' + (v.q * v.c + 2 * v.p) + '$. Escribe la expresión en términos de $x$.'; },
      function (v) { return v.p + '*x + ' + v.q; },
      'Sustituyendo $y_p = px + q$: $2(p) + c(px + q) = cpx + (2p + cq)$, igualando el lado derecho.',
      { domain: [-2, 2],
        mistakes: {
          noB: function (v) { return v.p + '*x'; },
          wrongB: function (v) { return v.p + '*x + ' + (v.q + 2); }
        },
        feedback: [
          { when: 'noB', say: 'Casi: falta el término independiente $B$.' },
          { when: 'wrongB', say: 'Casi: revisa el despeje del término constante.' }
        ] }),

    E('po-e-cuadratica-sin-yprim', 'polinomios', 2, { c: [2, 4, 1], a: [1, 3, 1] },
      function (v) { return 'Halla la solución polinomial $y_p(x)$ de $y\'\' + ' + v.c + 'y = ' + (v.a * v.c) + 'x^2 + ' + (2 * v.a + 3 * v.c) + '$.'; },
      function (v) { return v.a + '*x^2 + 3'; },
      'Con $y_p = ax^2 + 3$: $y\'\' = 2a$ y $2a + c(ax^2 + 3) = cax^2 + 2a + 3c$, que coincide con el lado derecho.',
      { domain: [-2, 2],
        mistakes: {
          noConst: function (v) { return v.a + '*x^2'; },
          wrongConst: function (v) { return v.a + '*x^2 + ' + (2 * v.a); }
        },
        feedback: [
          { when: 'noConst', say: 'Casi: olvidaste el término constante $3$.' },
          { when: 'wrongConst', say: 'Casi: la segunda derivada aporta $2a$, dejando $cC = 3c \\Rightarrow C = 3$.' }
        ] }),

    N('po-n-cuadratica-completa-c', 'polinomios', 3, { a: [1, 2, 1], b: [2, 3, 1], c: [2, 4, 1], p: [4, 8, 2] },
      function (v) { return 'Para $' + (v.a === 1 ? '' : v.a) + "y'' + " + v.b + "y' + " + v.c + 'y = ' + v.p + 'x^2$, se propone $y_p = Ax^2 + Bx + C$. Calcula el término independiente $C$.'; },
      function (v) { return 2 * v.p * (v.b * v.b - v.a * v.c) / (v.c * v.c * v.c); },
      'Al igualar constantes, $2aA + bB + cC = 0 \\Rightarrow C = (-2aA - bB)/c = 2p(b^2 - ac)/c^3$.',
      { where: function (v) { return Math.abs(v.b * v.b - v.a * v.c) >= 2; },
        mistakes: {
          forgotSecondDeriv: function (v) { return 2 * v.p * (v.b * v.b) / (v.c * v.c * v.c); },
          wrongSign: function (v) { return -2 * v.p * (v.b * v.b - v.a * v.c) / (v.c * v.c * v.c); }
        },
        feedback: [
          { when: 'forgotSecondDeriv', say: 'Casi: olvidaste el término $2aA$ proveniente de $a y\'\'_p$.' },
          { when: 'wrongSign', say: 'Casi: revisa los signos al despejar $cC = -2aA - bB$.' }
        ] }),

    N('po-n-cubica-coef-a', 'polinomios', 3, { c: [2, 5, 1], p: [7, 19, 3] },
      function (v) { return 'Para $y\'\' + 4y\' + ' + v.c + 'y = ' + v.p + 'x^3$, se propone un polinomio completo de grado 3 para $y_p$. ¿Cuánto vale el coeficiente principal $A_3$ de $x^3$?'; },
      function (v) { return v.p / v.c; },
      'En la ecuación, el término en $x^3$ solo proviene de $c(A_3 x^3) = p x^3 \\Rightarrow A_3 = p/c$.',
      { mistakes: {
          div3: function (v) { return v.p / (3 * v.c); },
          noDiv: function (v) { return v.p; }
        },
        feedback: [
          { when: 'div3', say: 'Casi: no hay que dividir entre las derivadas de $x^3$; la potencia más alta no se deriva.' },
          { when: 'noDiv', say: function (v) { return 'Casi: falta dividir entre el coeficiente $' + v.c + '$ de $y$.'; } }
        ] }),

    N('po-n-cubica-coef-b', 'polinomios', 3, { b: [2, 4, 1], c: [2, 4, 1], p: [6, 12, 3] },
      function (v) { return 'Para $y\'\' + ' + v.b + "y' + " + v.c + 'y = ' + v.p + 'x^3$, calcula el coeficiente $A_2$ de $x^2$ en la propuesta $y_p = A_3 x^3 + A_2 x^2 + A_1 x + A_0$.'; },
      function (v) { return -3 * v.b * v.p / (v.c * v.c); },
      'El término en $x^2$ es $3b A_3 + c A_2 = 0 \\Rightarrow A_2 = -3b A_3 / c = -3bp/c^2$.',
      { mistakes: {
          posSign: function (v) { return 3 * v.b * v.p / (v.c * v.c); },
          twoInsteadOfThree: function (v) { return -2 * v.b * v.p / (v.c * v.c); }
        },
        feedback: [
          { when: 'posSign', say: 'Casi: al despejar $c A_2 = -3 b A_3$, el signo es negativo.' },
          { when: 'twoInsteadOfThree', say: 'Casi: la derivada de $x^3$ es $3x^2$, por lo que el factor es $3b$, no $2b$.' }
        ] }),

    /* ======================= 3. Lado derecho exponencial (17) ======================= */
    C('ex-c-polinomio-evaluado', 'exponenciales', 1,
      'Al buscar $y_p = A e^{kx}$ para $a y\'\' + b y\' + c y = C_0 e^{kx}$, ¿a qué equivale el factor que multiplica a $A$ tras sustituir?',
      'Al polinomio característico evaluado en $k$: $P(k) = a k^2 + b k + c$', [
        ['A la derivada del polinomio característico: $P\'(k) = 2ak + b$', 'Casi: la derivada aparece cuando hay resonancia, no en el caso estándar.'],
        ['A la exponencial $e^{kx}$ elevada al cuadrado', 'Casi: la exponencial es factor común de ambos miembros y se cancela.'],
        ['A una constante arbitraria del PVI', 'Casi: $P(k)$ depende únicamente de los coeficientes de la EDO y del exponente $k$.']],
      'Cada derivada respecto a $x$ de $e^{kx}$ aporta un factor $k$, resultando en $P(k)e^{kx}$.'),

    C('ex-c-cancelacion-exponencial', 'exponenciales', 1,
      '¿Por qué al sustituir $y_p = A e^{kx}$ en $a y\'\' + b y\' + c y = C_0 e^{kx}$ la ecuación se reduce a una ecuación algebraica en $A$?',
      'Porque $e^{kx}$ es factor común en todos los términos y nunca se anula ($e^{kx} > 0$ en $\\mathbb{R}$)', [
        ['Porque la exponencial se transforma en una constante cuando $x \\to 0$', 'Casi: la igualdad debe cumplirse para todo $x$, no solo en el origen.'],
        ['Porque los coeficientes indeterminados integran la ecuación automáticamente', 'Casi: se realiza una sustitución algebraica directa sin integración.'],
        ['Porque la segunda derivada cancela a la primera derivada', 'Casi: las derivadas se combinan de acuerdo a los coeficientes de la EDO.']],
      'Al dividir ambos miembros entre la función estrictamente positiva $e^{kx}$, queda $P(k)A = C_0$.'),

    C('ex-c-exponente-negativo', 'exponenciales', 1,
      'Para $y\'\' + 3y\' + 2y = 8e^{-4x}$, ¿qué signo tienen los términos $k$ y $k^2$ al evaluar el polinomio característico?',
      '$k = -4$ y $k^2 = (-4)^2 = +16$; el cuadrado siempre es positivo', [
        ['Ambos términos son negativos: $k = -4$ y $k^2 = -16$', 'Casi: el cuadrado de cualquier número real no nulo es estrictamente positivo.'],
        ['Ambos términos son positivos al tomar su valor absoluto', 'Casi: el término de primer orden conserva su signo: $3k = 3(-4) = -12$.'],
        ['El exponente negativo obliga a cambiar la propuesta a $A e^{4x}$', 'Casi: la propuesta debe conservar exactamente el mismo exponente que la fuente.']],
      'En $(-4)^2 + 3(-4) + 2 = 16 - 12 + 2 = 6$, el cuadrado es positivo y el término lineal conserva el signo.'),

    C('ex-c-signo-amplitud', 'exponenciales', 1,
      'Si $P(k) = a k^2 + b k + c < 0$ y la amplitud de la fuente es $C_0 > 0$, ¿qué signo tiene la amplitud $A$ de $y_p = A e^{kx}$?',
      'Negativo, porque $A = C_0 / P(k)$ y el cociente de un positivo entre un negativo es negativo', [
        ['Positivo, porque las exponenciales siempre deben tener amplitud positiva', 'Casi: $e^{kx} > 0$, pero la constante $A$ puede ser de cualquier signo.'],
        ['Cero, porque una exponencial no puede tener amplitud negativa', 'Casi: $A$ es un número real; si $P(k) < 0$, $A$ resulta negativo.'],
        ['Indeterminado hasta conocer las condiciones iniciales', 'Casi: $A$ queda determinado exclusivamente por la EDO.']],
      'De $P(k)A = C_0$, se despeja $A = C_0 / P(k)$; al tener signos opuestos, $A < 0$.'),

    C('ex-c-resonancia-anticipo', 'exponenciales', 1,
      '¿Qué ocurre algebraicamente con la fórmula $A = C_0 / P(k)$ si $k$ es raíz del polinomio característico?',
      'El denominador se anula ($P(k) = 0$), produciendo división entre cero y la propuesta falla', [
        ['La solución particular se vuelve idénticamente cero', 'Casi: $P(k) = 0$ indica que $e^{kx}$ resuelve la homogénea y da $0 = C_0 e^{kx}$.'],
        ['La amplitud $A$ se vuelve igual a $C_0$', 'Casi: al sustituir $e^{kx}$ el lado izquierdo da cero y no puede igualar a la fuente.'],
        ['La ecuación diferencial deja de ser lineal', 'Casi: la ecuación sigue siendo lineal; este caso se resuelve multiplicando por $x$.']],
      'Si $P(k) = 0$, $L(e^{kx}) = 0$, imposibilitando igualar una fuente no nula.'),

    N('ex-n-coef-positivo', 'exponenciales', 2, { a: [1, 3, 1], c: [6, 18, 2], k: [2, 4, 1] },
      function (v) { return 'Para la ecuación diferencial $y\'\' + 3y\' + ' + v.a + 'y = ' + v.c + 'e^{' + v.k + 'x}$, calcula el coeficiente $A$ de $y_p = Ae^{' + v.k + 'x}$.'; },
      function (v) { return v.c / (v.k * v.k + 3 * v.k + v.a); },
      'Sustituyendo $y_p = Ae^{kx}$: $A(k^2 + 3k + a) = c \\Rightarrow A = c/(k^2 + 3k + a)$.',
      { mistakes: {
          noSquare: function (v) { return v.c / (v.k + 3 * v.k + v.a); },
          negSign: function (v) { return -v.c / (v.k * v.k + 3 * v.k + v.a); }
        },
        feedback: [
          { when: 'noSquare', say: 'Casi: la segunda derivada de $e^{kx}$ es $k^2 e^{kx}$, no $k e^{kx}$.' },
          { when: 'negSign', say: 'Casi: revisa el signo de la amplitud.' }
        ] }),

    N('ex-n-exponente-negativo', 'exponenciales', 2, { a: [1, 3, 1], c: [6, 18, 2], m: [1, 3, 1] },
      function (v) { return 'Calcula la amplitud $A$ de $y_p = Ae^{-' + (v.m === 1 ? '' : v.m) + 'x}$ para la ecuación $y\'\' + 4y\' + ' + v.a + 'y = ' + v.c + 'e^{-' + (v.m === 1 ? '' : v.m) + 'x}$.'; },
      function (v) { var k = -v.m; return v.c / (k * k + 4 * k + v.a); },
      'Con $k = -m$, el polinomio característico es $(-m)^2 + 4(-m) + a = m^2 - 4m + a$, y $A = c/P(-m)$.',
      { where: function (v) { var d = v.m * v.m - 4 * v.m + v.a; return d !== 0 && Math.abs(d) >= 1; },
        mistakes: {
          posK: function (v) { var k = v.m; return v.c / (k * k + 4 * k + v.a); },
          negSq: function (v) { return v.c / (-v.m * v.m - 4 * v.m + v.a); }
        },
        feedback: [
          { when: 'posK', say: 'Casi: el exponente es negativo, por lo que $4k = 4(-m) = -4m$.' },
          { when: 'negSq', say: 'Casi: el cuadrado $(-m)^2 = +m^2$ es positivo.' }
        ] }),

    N('ex-n-sin-derivada-primera', 'exponenciales', 2, { b: [2, 7, 1], k: [1, 4, 1], c: [6, 24, 6] },
      function (v) { return 'Para la ecuación no amortiguada $y\'\' + ' + v.b + 'y = ' + v.c + 'e^{' + (v.k === 1 ? '' : v.k) + 'x}$, calcula el coeficiente $A$ de la particular.'; },
      function (v) { return v.c / (v.k * v.k + v.b); },
      'Como no hay $y\'$, la ecuación queda $(k^2 + b)A = c \\Rightarrow A = c/(k^2 + b)$.',
      { mistakes: {
          minus: function (v) { return v.c / (v.k * v.k - v.b); },
          noSq: function (v) { return v.c / (v.k + v.b); }
        },
        feedback: [
          { when: 'minus', say: 'Casi: el término es $+b y$, por lo que se suma $+b$, no se resta.' },
          { when: 'noSq', say: 'Casi: la segunda derivada introduce $k^2$, no $k$.' }
        ] }),

    N('ex-n-eval-yp-en-cero', 'exponenciales', 2, { a: [2, 5, 1], b: [1, 4, 1], c: [10, 30, 5] },
      function (v) { return 'Para $y\'\' + ' + v.a + "y' + " + v.b + 'y = ' + v.c + 'e^{2x}$, ¿cuánto vale la solución particular $y_p(x)$ evaluada en $x = 0$?'; },
      function (v) { return v.c / (4 + 2 * v.a + v.b); },
      'En $x = 0$, $y_p(0) = A e^0 = A = c/P(2) = c/(4 + 2a + b)$.',
      { mistakes: {
          zero: function () { return 0; },
          rawC: function (v) { return v.c; }
        },
        feedback: [
          { when: 'zero', say: 'Casi: $e^{2(0)} = e^0 = 1$, no cero.' },
          { when: 'rawC', say: 'Casi: olvidaste dividir entre $P(2) = 4 + 2a + b$.' }
        ] }),

    N('ex-n-eval-derivada-yp', 'exponenciales', 2, { k: [2, 4, 1], c: [12, 24, 6] },
      function (v) { return 'Si $y_p(x)$ es la solución particular de $y\'\' - y = ' + v.c + 'e^{' + v.k + 'x}$, calcula el valor de su derivada $y\'_p(0)$ en el origen.'; },
      function (v) { return (v.k * v.c) / (v.k * v.k - 1); },
      '$y_p\'(x) = kAe^{kx}$, por lo que $y_p\'(0) = kA = kc/(k^2 - 1)$.',
      { mistakes: {
          noK: function (v) { return v.c / (v.k * v.k - 1); },
          kSq: function (v) { return (v.k * v.k * v.c) / (v.k * v.k - 1); }
        },
        feedback: [
          { when: 'noK', say: 'Casi: ese es el valor de $y_p(0)$; su derivada en $x = 0$ lleva un factor $k$: $y\'_p(0) = k A$.' },
          { when: 'kSq', say: 'Casi: multiplicaste por $k^2$, que corresponde a la segunda derivada $y\'\'_p(0)$.' }
        ] }),

    E('ex-e-solucion-directa', 'exponenciales', 2, { k: [2, 4, 1], c: [3, 8, 1] },
      function (v) { return 'Encuentra la solución particular $y_p(x)$ de la ecuación $y\'\' + 2y\' + y = ' + (v.c * (v.k * v.k + 2 * v.k + 1)) + 'e^{' + v.k + 'x}$.'; },
      function (v) { return v.c + '*e^(' + v.k + '*x)'; },
      'Sustituyendo $y_p = ce^{kx}$, $L(y_p) = c(k^2 + 2k + 1)e^{kx}$, que iguala exactamente al lado derecho.',
      { domain: [-1, 1],
        mistakes: {
          noCoeff: function (v) { return 'e^(' + v.k + '*x)'; },
          wrongExp: function (v) { return v.c + '*e^x'; }
        },
        feedback: [
          { when: 'noCoeff', say: function (v) { return 'Casi: falta el coeficiente $' + v.c + '$.'; } },
          { when: 'wrongExp', say: function (v) { return 'Casi: el exponente debe ser $' + v.k + 'x$.'; } }
        ] }),

    E('ex-e-solucion-exponente-negativo', 'exponenciales', 2, { m: [1, 3, 1], c: [2, 5, 1] },
      function (v) { var d = v.m * v.m - 4, num = v.c * Math.abs(d); return 'Halla la solución particular exponencial $y_p(x)$ de $y\'\' - 4y = ' + (d < 0 ? '-' : '') + num + 'e^{-' + (v.m === 1 ? '' : v.m) + 'x}$.'; },
      function (v) { return v.c + '*e^(-' + v.m + '*x)'; },
      'El exponente es $-mx$ con $(-m)^2 - 4 \\neq 0$; la solución particular es $ce^{-mx}$.',
      { where: function (v) { return v.m !== 2; },
        domain: [-1, 1],
        mistakes: {
          posExp: function (v) { return v.c + '*e^(' + v.m + '*x)'; },
          noCoeff: function (v) { return 'e^(-' + v.m + '*x)'; }
        },
        feedback: [
          { when: 'posExp', say: function (v) { return 'Casi: el exponente es negativo: $-' + (v.m === 1 ? '' : v.m) + 'x$.'; } },
          { when: 'noCoeff', say: function (v) { return 'Casi: falta el coeficiente $' + v.c + '$.'; } }
        ] }),

    N('ex-n-tres-terminos-p', 'exponenciales', 2, { a: [2, 4, 1], b: [-4, -2, 1], k: [1, 3, 1], c: [10, 20, 2] },
      function (v) { return 'Para la ecuación con coeficiente dos $2y\'\'' + (v.b < 0 ? ' - ' + (-v.b) : ' + ' + v.b) + "y' + " + v.a + 'y = ' + v.c + 'e^{' + (v.k === 1 ? '' : v.k) + 'x}$, determina la amplitud $A$.'; },
      function (v) { return v.c / (2 * v.k * v.k + v.b * v.k + v.a); },
      'El polinomio característico es $2k^2 + bk + a$; entonces $A = c / (2k^2 + bk + a)$.',
      { where: function (v) { var d = 2 * v.k * v.k + v.b * v.k + v.a; return d !== 0 && Math.abs(d) >= 1; },
        mistakes: {
          noFactor2: function (v) { return v.c / (v.k * v.k + v.b * v.k + v.a); },
          wrongSignB: function (v) { return v.c / (2 * v.k * v.k - v.b * v.k + v.a); }
        },
        feedback: [
          { when: 'noFactor2', say: 'Casi: olvidaste el coeficiente $2$ que multiplica a $y\'\'$.' },
          { when: 'wrongSignB', say: 'Casi: revisa el signo del término con $y\'$.' }
        ] }),

    N('ex-n-polinomio-por-exp-a', 'exponenciales', 2, { k: [1, 3, 1], p: [4, 12, 2], b: [2, 5, 1] },
      function (v) { return 'Para la ecuación $y\'\' + ' + v.b + 'y = ' + v.p + 'x\\,e^{' + (v.k === 1 ? '' : v.k) + 'x}$, se propone $y_p = (Ax + B)e^{' + (v.k === 1 ? '' : v.k) + 'x}$. ¿Cuánto vale el coeficiente principal $A$?'; },
      function (v) { return v.p / (v.k * v.k + v.b); },
      'Al sustituir, el coeficiente de $x e^{kx}$ es $(k^2 + b)A = p \\Rightarrow A = p/(k^2 + b)$.',
      { mistakes: {
          noSq: function (v) { return v.p / (v.k + v.b); },
          plus2k: function (v) { return v.p / (v.k * v.k + 2 * v.k + v.b); }
        },
        feedback: [
          { when: 'noSq', say: 'Casi: el término cuadrático es $k^2$, no $k$.' },
          { when: 'plus2k', say: 'Casi: el término $2kA$ afecta al término independiente, no al coeficiente de $x$.' }
        ] }),

    N('ex-n-polinomio-por-exp-b', 'exponenciales', 3, { k: [1, 2, 1], b: [2, 4, 1], p: [4, 8, 2] },
      function (v) { return 'En $y\'\' + ' + v.b + 'y = ' + v.p + 'x\\,e^{' + (v.k === 1 ? '' : v.k) + 'x}$, calcula el término constante $B$ de la propuesta $y_p = (Ax + B)e^{' + (v.k === 1 ? '' : v.k) + 'x}$.'; },
      function (v) { return -2 * v.k * v.p / Math.pow(v.k * v.k + v.b, 2); },
      'Igualando a cero el término independiente dentro del corchete: $2kA + (k^2 + b)B = 0 \\Rightarrow B = -2kA/(k^2 + b) = -2kp/(k^2 + b)^2$.',
      { mistakes: {
          posSign: function (v) { return 2 * v.k * v.p / Math.pow(v.k * v.k + v.b, 2); },
          noSqDenom: function (v) { return -2 * v.k * v.p / (v.k * v.k + v.b); }
        },
        feedback: [
          { when: 'posSign', say: 'Casi: al despejar $(k^2+b)B = -2kA$, el signo es negativo.' },
          { when: 'noSqDenom', say: 'Casi: falta dividir nuevamente entre $(k^2 + b)$ para despejar $B$.' }
        ] }),

    N('ex-n-segunda-derivada-origen', 'exponenciales', 3, { k: [2, 3, 1], a: [1, 3, 1], c: [12, 24, 6] },
      function (v) { return 'Para la ecuación diferencial $y\'\' + 2y\' + ' + v.a + 'y = ' + v.c + 'e^{' + v.k + 'x}$, calcula el valor de la segunda derivada $y\'\'_p(0)$ de su solución particular en $x = 0$.'; },
      function (v) { return (v.k * v.k * v.c) / (v.k * v.k + 2 * v.k + v.a); },
      'Como $y_p(x) = Ae^{kx}$, su segunda derivada es $y\'\'_p(x) = k^2 Ae^{kx}$, evaluando en $x = 0$ da $k^2 A = k^2 c / P(k)$.',
      { mistakes: {
          noK: function (v) { return v.c / (v.k * v.k + 2 * v.k + v.a); },
          singleK: function (v) { return (v.k * v.c) / (v.k * v.k + 2 * v.k + v.a); }
        },
        feedback: [
          { when: 'noK', say: 'Casi: ese es $y_p(0)$; la segunda derivada introduce el factor $k^2$.' },
          { when: 'singleK', say: 'Casi: multiplicaste por $k$ en vez de $k^2$; eso corresponde a la primera derivada $y\'_p(0)$.' }
        ] }),

    N('ex-n-razon-amplitudes', 'exponenciales', 3, { k1: [1, 2, 1], k2: [3, 4, 1] },
      function (v) { return 'Se tienen dos fuentes exponenciales con la misma amplitud: $g_1(x) = e^{' + v.k1 + 'x}$ y $g_2(x) = e^{' + v.k2 + 'x}$ para la ecuación $y\'\' + y = g(x)$. Calcula la razón entre sus amplitudes $A_1 / A_2$.'; },
      function (v) { return (v.k2 * v.k2 + 1) / (v.k1 * v.k1 + 1); },
      'Como $A_i = 1/(k_i^2 + 1)$, la razón es $A_1 / A_2 = (k_2^2 + 1)/(k_1^2 + 1)$.',
      { mistakes: {
          inverted: function (v) { return (v.k1 * v.k1 + 1) / (v.k2 * v.k2 + 1); },
          linearK: function (v) { return (v.k2 + 1) / (v.k1 + 1); }
        },
        feedback: [
          { when: 'inverted', say: 'Casi: invertiste la razón; es $A_1 / A_2 = P(k_2) / P(k_1)$.' },
          { when: 'linearK', say: 'Casi: el polinomio es $k^2 + 1$, no $k + 1$.' }
        ] }),

    /* ======================= 4. Lado derecho con senos y cosenos (17) ======================= */
    C('tr-c-segunda-derivada-signo', 'trigonometricas', 1,
      'Al derivar dos veces la función $\\cos(\\omega x)$, ¿cuál es el resultado correcto?',
      '$-\\omega^2\\cos(\\omega x)$, con signo negativo debido a que $(\\cos u)\' = -\\sin u$', [
        ['$\\omega^2\\cos(\\omega x)$, con signo positivo al ser de segundo orden', 'Casi: la derivada del coseno es menos seno, y al derivar el seno queda coseno conservando el menos.'],
        ['$-\\omega\\sin(\\omega x)$, olvidando elevar $\\omega$ al cuadrado', 'Casi: cada derivación aporta un factor $\\omega$ por la regla de la cadena, resultando en $\\omega^2$.'],
        ['$-\\omega^2\\sin(\\omega x)$, confundiendo la función trigonométrica', 'Casi: tras dos derivadas se regresa a la misma función trigonométrica original: coseno.']],
      'Por la regla de la cadena, $(\\cos\\omega x)\' = -\\omega\\sin\\omega x$ y $(- \\omega\\sin\\omega x)\' = -\\omega^2\\cos\\omega x$.'),

    C('tr-c-desfase-damping', 'trigonometricas', 1,
      'En un oscilador con amortiguamiento $y\'\' + 2y\' + 5y = 10\\cos(3x)$, ¿por qué la respuesta estacionaria $y_p$ contiene tanto coseno como seno aunque la fuerza sea solo coseno?',
      'Porque el término de amortiguamiento $2y\'$ mezcla senos y cosenos, introduciendo un desfase temporal', [
        ['Porque la frecuencia externa $3$ resuena con la frecuencia natural', 'Casi: no hay resonancia; la presencia de senos se debe al desfase originado por $y\'$.'],
        ['Porque la energía del oscilador se disipa hasta detenerse', 'Casi: el término forzado mantiene la oscilación con amplitud y fase constantes en $y_p$.'],
        ['Porque la función coseno no es solución de ninguna ecuación diferencial', 'Casi: el coseno sí es solución, pero con desfase adquiere componentes en seno y coseno.']],
      'El término $2y\'_p$ transforma el coseno en seno y viceversa, requiriendo ambos para cancelar el residuo.'),

    C('tr-c-frecuencia-invariante', 'trigonometricas', 1,
      'Si $g(x) = 5\\sin(7x)$, ¿cuál es la frecuencia angular de las funciones que componen $y_p$?',
      'Exactamente $\\omega = 7$, idéntica a la frecuencia de la fuerza externa', [
        ['$\\omega = 7/2 = 3.5$, la mitad por ser de segundo orden', 'Casi: los sistemas lineales no dividen la frecuencia de entrada.'],
        ['$\\omega = 14$, el doble por efecto de la aceleración', 'Casi: la frecuencia no se duplica en ecuaciones lineales; se mantiene en $\\omega = 7$.'],
        ['La frecuencia natural del sistema libre', 'Casi: la frecuencia natural aparece en $y_h$ (transitorio); la solución particular $y_p$ sigue la frecuencia externa.']],
      'En un sistema lineal forzado, la respuesta permanente $y_p$ oscila exactamente a la frecuencia de la excitación.'),

    C('tr-c-determinante-amplitud', 'trigonometricas', 1,
      'Para el sistema algebraico que determina $A$ y $B$ en $y_p = A\\cos\\omega x + B\\sin\\omega x$, ¿cuál es el determinante del sistema?',
      '$\\Delta = (c - a\\omega^2)^2 + (b\\omega)^2$', [
        ['$\\Delta = (c - a\\omega^2) - b\\omega$', 'Casi: el determinante es la suma de los cuadrados: $\\alpha^2 + \\beta^2$.'],
        ['$\\Delta = a^2 \\omega^4 + c^2$', 'Casi: falta el término cruzado $-2ac\\omega^2$ y la contribución de $y\'$: $(b\\omega)^2$.'],
        ['$\\Delta = 0$, porque siempre hay infinitas soluciones', 'Casi: fuera de la resonancia $\\Delta > 0$, lo que garantiza solución particular única.']],
      'La matriz del sistema es $\\begin{pmatrix} \\alpha & \\beta \\\\ -\\beta & \\alpha \\end{pmatrix}$, cuyo determinante es $\\alpha^2 + \\beta^2$.'),

    C('tr-c-sin-derivada-primera-b', 'trigonometricas', 1,
      'Si la ecuación es $y\'\' + 4y = 3\\sin(5x)$ (sin término $y\'$), ¿cuánto vale el coeficiente $A$ del término en coseno en $y_p$?',
      '$A = 0$, porque al no haber $y\'$ no hay mezcla y la segunda derivada del seno no produce cosenos', [
        ['$A = 3$, igual a la amplitud de la fuerza', 'Casi: $3$ es la amplitud del seno en el lado derecho; el coseno no aparece.'],
        ['$A = -3/(25 - 4)$, con signo cambiado', 'Casi: ese es el coeficiente $B$ del seno, no del coseno.'],
        ['$A = 5$, por la frecuencia angular', 'Casi: la frecuencia no define la amplitud; el coeficiente del coseno es exactamente cero.']],
      'Sin amortiguamiento ($b = 0$), una entrada puramente senoidal produce una respuesta puramente senoidal ($A = 0$).'),

    N('tr-n-amplitud-sin-amort-cos', 'trigonometricas', 2, { c: [2, 8, 1], w: [1, 4, 1], k: [3, 15, 3] },
      function (v) { return 'Para la ecuación $y\'\' + ' + v.c + 'y = ' + v.k + '\\cos(' + (v.w === 1 ? '' : v.w) + 'x)$, calcula la amplitud $A$ de $y_p = A\\cos(' + (v.w === 1 ? '' : v.w) + 'x)$.'; },
      function (v) { return v.k / (v.c - v.w * v.w); },
      'Sustituyendo: $(c - \\omega^2)A = k \\Rightarrow A = k/(c - \\omega^2)$.',
      { where: function (v) { return v.c !== v.w * v.w; },
        mistakes: {
          plus: function (v) { return v.k / (v.c + v.w * v.w); },
          noSq: function (v) { return v.k / (v.c - v.w); }
        },
        feedback: [
          { when: 'plus', say: 'Casi: la segunda derivada del coseno introduce un signo negativo: $-\\omega^2$.' },
          { when: 'noSq', say: 'Casi: al derivar dos veces se multiplica por $\\omega^2$, no por $\\omega$.' }
        ] }),

    N('tr-n-amplitud-sin-amort-sin', 'trigonometricas', 2, { c: [3, 9, 1], w: [1, 3, 1], k: [4, 16, 2] },
      function (v) { return 'Para la ecuación $y\'\' + ' + v.c + 'y = ' + v.k + '\\sin(' + (v.w === 1 ? '' : v.w) + 'x)$, calcula el coeficiente $B$ de $y_p = B\\sin(' + (v.w === 1 ? '' : v.w) + 'x)$.'; },
      function (v) { return v.k / (v.c - v.w * v.w); },
      'Sustituyendo: $(c - \\omega^2)B = k \\Rightarrow B = k/(c - \\omega^2)$.',
      { where: function (v) { return v.c !== v.w * v.w; },
        mistakes: {
          neg: function (v) { return -v.k / (v.c - v.w * v.w); },
          plus: function (v) { return v.k / (v.c + v.w * v.w); }
        },
        feedback: [
          { when: 'neg', say: 'Casi: al sustituir $(c - \\omega^2)B\\sin\\omega x = k\\sin\\omega x$, por lo que $B = k/(c - \\omega^2)$.' },
          { when: 'plus', say: 'Casi: la segunda derivada del seno aporta $-\\omega^2$, no $+\\omega^2$.' }
        ] }),

    N('tr-n-eval-yp-origen-cos', 'trigonometricas', 2, { c: [2, 6, 1], w: [2, 3, 1], k: [6, 18, 2] },
      function (v) { return 'Calcula el valor de la solución particular $y_p(0)$ en el origen para $y\'\' + ' + v.c + 'y = ' + v.k + '\\cos(' + v.w + 'x)$.'; },
      function (v) { return v.k / (v.c - v.w * v.w); },
      'En $x = 0$, $y_p(0) = A\\cos(0) = A = k/(c - \\omega^2)$.',
      { where: function (v) { return v.c !== v.w * v.w; },
        mistakes: {
          zero: function () { return 0; },
          rawK: function (v) { return v.k; }
        },
        feedback: [
          { when: 'zero', say: 'Casi: $\\cos(0) = 1$, por lo que $y_p(0) = A$, no cero.' },
          { when: 'rawK', say: 'Casi: falta dividir entre $(c - \\omega^2)$.' }
        ] }),

    N('tr-n-derivada-origen-sin', 'trigonometricas', 2, { c: [2, 7, 1], w: [2, 4, 1], k: [5, 15, 5] },
      function (v) { return 'Para $y\'\' + ' + v.c + 'y = ' + v.k + '\\sin(' + v.w + 'x)$, calcula la derivada de la solución particular $y\'_p(0)$ en $x = 0$.'; },
      function (v) { return (v.w * v.k) / (v.c - v.w * v.w); },
      'Como $y_p(x) = B\\sin\\omega x$, su derivada es $y\'_p(x) = \\omega B\\cos\\omega x$, que en $x = 0$ vale $\\omega B = \\omega k/(c - \\omega^2)$.',
      { where: function (v) { return v.c !== v.w * v.w; },
        mistakes: {
          noW: function (v) { return v.k / (v.c - v.w * v.w); },
          negW: function (v) { return -(v.w * v.k) / (v.c - v.w * v.w); }
        },
        feedback: [
          { when: 'noW', say: 'Casi: ese es $B$; la derivada de $\\sin(\\omega x)$ en $0$ vale $\\omega\\cos(0) = \\omega$.' },
          { when: 'negW', say: 'Casi: la derivada de $\\sin(\\omega x)$ es $+\\omega\\cos(\\omega x)$, positiva.' }
        ] }),

    N('tr-n-coef-amortiguado-a', 'trigonometricas', 2, { b: [2, 4, 1], c: [2, 4, 1], k: [10, 30, 5] },
      function (v) { return 'Para $y\'\' + ' + v.b + "y' + " + v.c + 'y = ' + v.k + '\\cos x$ (con $\\omega = 1$), calcula el coeficiente $A$ en $y_p = A\\cos x + B\\sin x$.'; },
      function (v) { var a = v.c - 1; return (a * v.k) / (a * a + v.b * v.b); },
      'Del sistema $\\alpha A + \\beta B = k$, $-\\beta A + \\alpha B = 0$, resulta $A = \\alpha k / (\\alpha^2 + \\beta^2)$ con $\\alpha = c - 1$ y $\\beta = b$.',
      { where: function (v) { return v.c !== 1; },
        mistakes: {
          noBetaSq: function (v) { var a = v.c - 1; return v.k / a; },
          divByBeta: function (v) { var a = v.c - 1; return (v.b * v.k) / (a * a + v.b * v.b); }
        },
        feedback: [
          { when: 'noBetaSq', say: 'Casi: el término $by\'$ introduce acoplamiento con el seno; el denominador es $\\alpha^2 + \\beta^2$.' },
          { when: 'divByBeta', say: 'Casi: ese es el coeficiente $B$ del seno, no el coeficiente $A$ del coseno.' }
        ] }),

    N('tr-n-coef-amortiguado-b', 'trigonometricas', 2, { b: [2, 4, 1], c: [2, 4, 1], k: [10, 30, 5] },
      function (v) { return 'Para $y\'\' + ' + v.b + "y' + " + v.c + 'y = ' + v.k + '\\cos x$ (con $\\omega = 1$), calcula el coeficiente $B$ correspondiente a $\\sin x$ en $y_p$.'; },
      function (v) { var a = v.c - 1; return (v.b * v.k) / (a * a + v.b * v.b); },
      'Del sistema de $2\\times 2$, $B = \\beta k / (\\alpha^2 + \\beta^2)$ con $\\alpha = c - 1$ y $\\beta = b$.',
      { mistakes: {
          negSign: function (v) { var a = v.c - 1; return -(v.b * v.k) / (a * a + v.b * v.b); },
          alphaNum: function (v) { var a = v.c - 1; return (a * v.k) / (a * a + v.b * v.b); }
        },
        feedback: [
          { when: 'negSign', say: 'Casi: de $-\\beta A + \\alpha B = 0$ y $A = \\alpha k / \\Delta$, resulta $B = +\\beta k / \\Delta$, positivo.' },
          { when: 'alphaNum', say: 'Casi: ese es el coeficiente $A$ del coseno; el del seno lleva en el numerador a $\\beta = b$.' }
        ] }),

    E('tr-e-sin-amortiguamiento', 'trigonometricas', 2, { c: [5, 10, 1], w: [1, 3, 1] },
      function (v) { return 'Halla la solución particular $y_p(x)$ de $y\'\' + ' + v.c + 'y = ' + (2 * (v.c - v.w * v.w)) + '\\cos(' + (v.w === 1 ? '' : v.w) + 'x)$.'; },
      function (v) { return '2*cos(' + v.w + '*x)'; },
      'Como no hay amortiguamiento, la solución particular es $2\\cos(\\omega x)$.',
      { where: function (v) { return v.c !== v.w * v.w; },
        domain: [-3, 3],
        mistakes: {
          sinInstead: function (v) { return '2*sin(' + v.w + '*x)'; },
          halfCoeff: function (v) { return 'cos(' + v.w + '*x)'; }
        },
        feedback: [
          { when: 'sinInstead', say: 'Casi: la fuente es coseno y no hay $y\'$; la respuesta es coseno.' },
          { when: 'halfCoeff', say: 'Casi: el coeficiente es $2$.' }
        ] }),

    E('tr-e-seno-puro', 'trigonometricas', 2, { c: [2, 6, 1], w: [2, 3, 1] },
      function (v) { return 'Halla la forma de la solución particular $y_p(x)$ de $y\'\' + ' + v.c + 'y = ' + (3 * (v.c - v.w * v.w)) + '\\sin(' + v.w + 'x)$.'; },
      function (v) { return '3*sin(' + v.w + '*x)'; },
      'Sustituyendo $y_p = 3\\sin(\\omega x)$ se tiene $y\'\' + cy = -3\\omega^2\\sin\\omega x + 3c\\sin\\omega x = 3(c - \\omega^2)\\sin\\omega x$.',
      { where: function (v) { return v.c !== v.w * v.w; },
        domain: [-3, 3],
        mistakes: {
          cosInstead: function (v) { return '3*cos(' + v.w + '*x)'; },
          negCoeff: function (v) { return '-3*sin(' + v.w + '*x)'; }
        },
        feedback: [
          { when: 'cosInstead', say: 'Casi: la fuente es un seno y no hay $y\'$; la solución es un seno.' },
          { when: 'negCoeff', say: 'Casi: revisa el signo de la amplitud.' }
        ] }),

    N('tr-n-amplitud-total-r', 'trigonometricas', 3, { b: [2, 3, 1], c: [2, 5, 1], k: [10, 20, 5] },
      function (v) { return 'Para $y\'\' + ' + v.b + "y' + " + v.c + 'y = ' + v.k + '\\cos x$ con solución $y_p = A\\cos x + B\\sin x$, calcula la amplitud total de oscilación $R = \\sqrt{A^2 + B^2}$.'; },
      function (v) { var a = v.c - 1; return v.k / Math.sqrt(a * a + v.b * v.b); },
      'La amplitud total es $R = \\sqrt{A^2 + B^2} = k / \\sqrt{(c - 1)^2 + b^2}$.',
      { mistakes: {
          noSqrt: function (v) { var a = v.c - 1; return (v.k * v.k) / (a * a + v.b * v.b); },
          onlyAlpha: function (v) { var a = v.c - 1; return v.k / a; }
        },
        feedback: [
          { when: 'noSqrt', say: 'Casi: calculaste $R^2 = A^2 + B^2$; falta sacar la raíz cuadrada.' },
          { when: 'onlyAlpha', say: 'Casi: olvidaste el efecto del amortiguamiento $b$ en la amplitud total.' }
        ] }),

    N('tr-n-desfase-tangente', 'trigonometricas', 3, { b: [2, 5, 1], c: [2, 4, 1] },
      function (v) { return 'Para la ecuación $y\'\' + ' + v.b + "y' + " + v.c + 'y = 12\\cos x$, la solución se escribe como $y_p = R\\cos(x - \\phi)$ con $\\tan\\phi = B/A$. ¿Cuánto vale $\\tan\\phi$?'; },
      function (v) { return v.b / (v.c - 1); },
      'Como $B = \\beta k / \\Delta$ y $A = \\alpha k / \\Delta$, el cociente es $\\tan\\phi = B/A = \\beta/\\alpha = b/(c - 1)$.',
      { where: function (v) { return v.c !== 1; },
        mistakes: {
          inv: function (v) { return (v.c - 1) / v.b; },
          neg: function (v) { return -v.b / (v.c - 1); }
        },
        feedback: [
          { when: 'inv', say: 'Casi: invertiste la razón: $\\tan\\phi = B/A = \\beta/\\alpha$, no $\\alpha/\\beta$.' },
          { when: 'neg', say: 'Casi: el cociente $B/A = b/(c-1)$ es positivo.' }
        ] }),

    N('tr-n-fuente-seno-coef-a', 'trigonometricas', 3, { b: [1, 3, 1], c: [2, 4, 1], k: [6, 18, 6] },
      function (v) { return 'Para la ecuación $y\'\' + ' + (v.b === 1 ? '' : v.b) + "y' + " + v.c + 'y = ' + v.k + '\\sin x$ (con $\\omega = 1$), calcula el coeficiente $A$ del coseno en $y_p = A\\cos x + B\\sin x$.'; },
      function (v) { var a = v.c - 1; return (-v.b * v.k) / (a * a + v.b * v.b); },
      'Para entrada $k\\sin x$, el sistema lineal da $A = -\\beta k / (\\alpha^2 + \\beta^2) = -bk / ((c-1)^2 + b^2)$.',
      { mistakes: {
          posSign: function (v) { var a = v.c - 1; return (v.b * v.k) / (a * a + v.b * v.b); },
          alphaNum: function (v) { var a = v.c - 1; return (-a * v.k) / (a * a + v.b * v.b); }
        },
        feedback: [
          { when: 'posSign', say: 'Casi: para una entrada en seno, el coeficiente del coseno tiene signo negativo: $A = -\\beta k / (\\alpha^2 + \\beta^2)$.' },
          { when: 'alphaNum', say: 'Casi: el numerador del coeficiente del coseno lleva a $\\beta = b$, no a $\\alpha$.' }
        ] }),

    N('tr-n-fuente-seno-coef-b', 'trigonometricas', 3, { b: [2, 4, 1], c: [2, 5, 1], k: [8, 20, 4] },
      function (v) { return 'Para la ecuación $y\'\' + ' + v.b + "y' + " + v.c + 'y = ' + v.k + '\\sin x$, calcula el coeficiente $B$ del seno en la propuesta $y_p = A\\cos x + B\\sin x$.'; },
      function (v) { var a = v.c - 1; return (a * v.k) / (a * a + v.b * v.b); },
      'Para entrada senoidal pura, el coeficiente del seno es $B = \\alpha k / (\\alpha^2 + \\beta^2) = (c-1)k / ((c-1)^2 + b^2)$.',
      { where: function (v) { return v.c !== 1; },
        mistakes: {
          betaNum: function (v) { var a = v.c - 1; return (v.b * v.k) / (a * a + v.b * v.b); },
          negSign: function (v) { var a = v.c - 1; return (-a * v.k) / (a * a + v.b * v.b); }
        },
        feedback: [
          { when: 'betaNum', say: 'Casi: ese es el numerador para el coseno; para el seno es $\\alpha = c - 1$.' },
          { when: 'negSign', say: 'Casi: para $c > 1$, el coeficiente $B$ es positivo.' }
        ] }),

    /* ======================= 5. Superposición y productos de funciones (16) ======================= */
    C('su-c-principio-superposicion', 'superposicion', 1,
      'Si $L(y) = g_1(x) + g_2(x)$ es una EDO lineal con $L(y_{p1}) = g_1(x)$ y $L(y_{p2}) = g_2(x)$, ¿cuál es una solución particular completa?',
      '$y_p = y_{p1} + y_{p2}$, sumando las soluciones particulares de cada término por separado', [
        ['$y_p = y_{p1} \\cdot y_{p2}$, multiplicando ambas soluciones', 'Casi: la ecuación es lineal; el operador diferencial actúa sobre sumas, no sobre productos.'],
        ['$y_p = y_{p1} - y_{p2}$, restando las soluciones individuales', 'Casi: si las fuentes se suman ($g_1 + g_2$), las soluciones particulares se suman.'],
        ['$y_p = \\max(y_{p1}, y_{p2})$, tomando el término dominante', 'Casi: se deben incluir ambas respuestas simultáneamente para satisfacer ambos lados derechos.']],
      'Por la linealidad del operador diferencial: $L(y_{p1} + y_{p2}) = L(y_{p1}) + L(y_{p2}) = g_1 + g_2$.'),

    C('su-c-multiples-terminos-fuente', 'superposicion', 1,
      'Para $y\'\' - y = 4 + 6e^{2x} + 5\\cos(3x)$, ¿cuál es la mejor estrategia para encontrar $y_p$?',
      'Descomponer en tres subproblemas ($g_1 = 4$, $g_2 = 6e^{2x}$, $g_3 = 5\\cos 3x$) y sumar sus soluciones particulares', [
        ['Proponer una sola función que mezcle todos los términos multiplicados entre sí', 'Casi: multiplicar los términos cambiaría la naturaleza de las fuentes; se resuelven por separado y se suman.'],
        ['Descartar los términos más pequeños y resolver solo para el término dominante', 'Casi: una solución particular exacta debe satisfacer la totalidad del lado derecho.'],
        ['Aplicar transformada de Fourier de manera obligatoria', 'Casi: la superposición algebraica directa es elemental y exacta sin recurrir a transformadas integrales.']],
      'La superposición permite resolver cada tipo de función fuente con su propuesta estándar de forma independiente.'),

    C('su-c-producto-exp-trig', 'superposicion', 1,
      'Si $g(x) = e^{2x}\\cos(3x)$, ¿qué forma general se debe proponer para $y_p$?',
      '$y_p = e^{2x}(A\\cos 3x + B\\sin 3x)$', [
        ['$y_p = A e^{2x}\\cos(3x)$, con un solo término', 'Casi: la regla del producto al derivar genera tanto términos con coseno como con seno.'],
        ['$y_p = A e^{2x} + B\\cos(3x)$, separando en una suma', 'Casi: la fuente es un producto de funciones, no una suma; debe proponerse el producto.'],
        ['$y_p = (Ax + B)e^{2x}\\cos(3x)$', 'Casi: no hay polinomio multiplicando a la función fuente ni resonancia.']],
      'Al derivar $e^{kx}\\cos\\omega x$ aparecen combinaciones de $e^{kx}\\cos\\omega x$ y $e^{kx}\\sin\\omega x$, por lo que la propuesta debe contener ambas.'),

    C('su-c-producto-polinomio-trig', 'superposicion', 1,
      'Si $g(x) = x\\sin(2x)$, ¿cuál es la forma correcta de $y_p$?',
      '$y_p = (Ax + B)\\cos(2x) + (Cx + D)\\sin(2x)$', [
        ['$y_p = Ax\\sin(2x)$, con un solo coeficiente', 'Casi: al derivar aparecen términos con coseno, términos constantes por seno y por coseno.'],
        ['$y_p = (Ax + B)\\sin(2x)$, sin incluir el coseno', 'Casi: la derivada del seno es el coseno; se requieren polinomios completos para ambos.'],
        ['$y_p = Ax + B + C\\sin(2x)$', 'Casi: $g(x)$ es un producto de $x$ con el seno, no una suma de funciones independientes.']],
      'Cada derivada de $x\\sin(2x)$ genera términos de la forma $x\\cos 2x$, $\\cos 2x$, $x\\sin 2x$ y $\\sin 2x$.'),

    N('su-n-suma-constante-exp', 'superposicion', 2, { c: [2, 5, 1], k: [1, 3, 1], p: [6, 18, 6], q: [4, 16, 4] },
      function (v) { return 'Para la ecuación $y\'\' - ' + v.c + 'y = ' + v.p + ' + ' + v.q + 'e^{' + (v.k === 1 ? '' : v.k) + 'x}$, calcula el valor de $y_p(0)$ en el origen.'; },
      function (v) { return -v.p / v.c + v.q / (v.k * v.k - v.c); },
      'Por superposición, $y_p = -p/c + [q/(k^2 - c)]e^{kx}$; evaluando en $x = 0$ da la suma de ambas amplitudes.',
      { where: function (v) { return v.k * v.k - v.c !== 0 && Math.abs(-v.p / v.c + v.q / (v.k * v.k - v.c)) >= 0.2; },
        mistakes: {
          posConst: function (v) { return v.p / v.c + v.q / (v.k * v.k - v.c); },
          onlyExp: function (v) { return v.q / (v.k * v.k - v.c); }
        },
        feedback: [
          { when: 'posConst', say: 'Casi: el término constante es $-p/c$ debido al signo negativo en $-c y$.' },
          { when: 'onlyExp', say: function (v) { return 'Casi: olvidaste sumar la solución particular de la parte constante: $y_{p1} = -' + v.p + '/' + v.c + '$.'; } }
        ] }),

    N('su-n-suma-dos-exponenciales', 'superposicion', 2, { a: [1, 3, 1], c1: [2, 5, 1], c2: [1, 4, 1] },
      function (v) { return 'Para $y\'\' + 4y = ' + (v.c1 * (v.a * v.a + 4)) + 'e^{' + (v.a === 1 ? '' : v.a) + 'x} + ' + (v.c2 * 5) + 'e^x$, calcula el valor de $y_p(0)$.'; },
      function (v) { return v.c1 + v.c2; },
      'Las soluciones particulares son $y_{p1} = c_1 e^{ax}$ y $y_{p2} = c_2 e^x$, por lo que $y_p(0) = c_1 + c_2$.',
      { where: function (v) { return v.a !== 1 && v.a * v.a !== 4; },
        mistakes: {
          mult: function (v) { return v.c1 * v.c2; },
          diff: function (v) { return v.c1 - v.c2; }
        },
        feedback: [
          { when: 'mult', say: 'Casi: por superposición las soluciones se suman, no se multiplican.' },
          { when: 'diff', say: 'Casi: ambas fuentes tienen signo positivo; se deben sumar.' }
        ] }),

    N('su-n-derivada-superposicion', 'superposicion', 2, { a: [2, 4, 1] },
      function (v) { return 'Para la ecuación $y\'\' + 9y = 18x + ' + (v.a * v.a + 9) + 'e^{' + v.a + 'x}$, calcula la derivada $y\'_p(0)$ de la solución particular en $x = 0$.'; },
      function (v) { return 2 + v.a; },
      '$y_p(x) = 2x + e^{ax}$, cuya derivada es $y\'_p(x) = 2 + a e^{ax}$, y en $x = 0$ vale $2 + a$.',
      { mistakes: {
          noExpDeriv: function () { return 2; },
          noPolyDeriv: function (v) { return v.a; }
        },
        feedback: [
          { when: 'noExpDeriv', say: 'Casi: olvidaste la derivada del término exponencial: $(e^{ax})\'(0) = a$.' },
          { when: 'noPolyDeriv', say: 'Casi: olvidaste la derivada del término polinomial: $(2x)\' = 2$.' }
        ] }),

    N('su-n-suma-polinomio-trig-eval', 'superposicion', 2, { c: [2, 6, 1], p: [4, 16, 4], k: [6, 18, 6] },
      function (v) { return 'Para $y\'\' + ' + v.c + 'y = ' + v.p + ' + ' + v.k + '\\cos x$, calcula el valor de $y_p(0)$.'; },
      function (v) { return v.p / v.c + v.k / (v.c - 1); },
      'Por superposición, $y_p(x) = p/c + [k/(c-1)]\\cos x$; en $x = 0$ queda $p/c + k/(c-1)$.',
      { where: function (v) { return v.c !== 1; },
        mistakes: {
          forgotCos: function (v) { return v.p / v.c; },
          minusCos: function (v) { return v.p / v.c - v.k / (v.c - 1); }
        },
        feedback: [
          { when: 'forgotCos', say: 'Casi: olvidaste sumar la contribución de la parte trigonométrica en $x = 0$: $k/(c-1)$.' },
          { when: 'minusCos', say: 'Casi: $\\cos(0) = +1$, el término trigonométrico se suma.' }
        ] }),

    E('su-e-suma-dos-terminos', 'superposicion', 2, { a: [2, 5, 1], k: [2, 3, 1] },
      function (v) { return 'Halla la solución particular $y_p(x)$ de $y\'\' - y = ' + v.a + ' + ' + (3 * (v.k * v.k - 1)) + 'e^{' + v.k + 'x}$ (con $k = ' + v.k + '$).'; },
      function (v) { return '-' + v.a + ' + 3*e^(' + v.k + '*x)'; },
      'Por superposición, $y_p = -a + 3e^{kx}$; al sustituir en $y\'\' - y$ se obtiene exactamente $a + 3(k^2 - 1)e^{kx}$.',
      { domain: [-1, 1],
        mistakes: {
          posA: function (v) { return v.a + ' + 3*e^(' + v.k + '*x)'; },
          onlyExp: function (v) { return '3*e^(' + v.k + '*x)'; }
        },
        feedback: [
          { when: 'posA', say: function (v) { return 'Casi: para la constante, $-y = ' + v.a + ' \\Rightarrow y_{p1} = -' + v.a + '$.'; } },
          { when: 'onlyExp', say: function (v) { return 'Casi: falta la solución particular de la parte constante $-' + v.a + '$.'; } }
        ] }),

    E('su-e-suma-poli-trig', 'superposicion', 2, { c: [2, 5, 1], a: [1, 3, 1] },
      function (v) { return 'Encuentra la solución particular $y_p(x)$ de $y\'\' + ' + v.c + 'y = ' + (v.a * v.c) + 'x + ' + (2 * (v.c - 4)) + '\\cos(2x)$ (con $c = ' + v.c + '$).'; },
      function (v) { return v.a + '*x + 2*cos(2*x)'; },
      'Por superposición, $y_p = ax + 2\\cos(2x)$ satisface ambos lados derechos.',
      { where: function (v) { return v.c !== 4; },
        domain: [-2, 2],
        mistakes: {
          sinInstead: function (v) { return v.a + '*x + 2*sin(2*x)'; },
          noPoli: function () { return '2*cos(2*x)'; }
        },
        feedback: [
          { when: 'sinInstead', say: 'Casi: la fuente es coseno y no hay $y\'$; la solución lleva coseno.' },
          { when: 'noPoli', say: function (v) { return 'Casi: falta la parte polinomial $' + v.a + 'x$.'; } }
        ] }),

    N('su-n-producto-exp-trig-amplitud', 'superposicion', 2, { a: [1, 2, 1], w: [1, 2, 1], k: [10, 30, 5] },
      function (v) { return 'Para la ecuación $y\'\' - 2y\' + 2y = ' + v.k + 'e^{' + (v.a === 1 ? '' : v.a) + 'x}\\cos(' + (v.w === 1 ? '' : v.w) + 'x)$, se propone $y_p = e^{' + (v.a === 1 ? '' : v.a) + 'x}(A\\cos ' + (v.w === 1 ? '' : v.w) + 'x + B\\sin ' + (v.w === 1 ? '' : v.w) + 'x)$. Calcula $y_p(0)$.'; },
      function (v) {
        var c_tilde = v.a * v.a - 2 * v.a + 2, b_tilde = 2 * (v.a - 1);
        var alpha = c_tilde - v.w * v.w, beta = b_tilde * v.w;
        return (alpha * v.k) / (alpha * alpha + beta * beta);
      },
      'Por el desplazamiento exponencial, la ecuación para $u(x)$ en $y_p = e^{ax}u(x)$ tiene $\\alpha = a^2 - 2a + 2 - \\omega^2$ y $\\beta = 2(a - 1)\\omega$, dando $y_p(0) = A = \\alpha k / (\\alpha^2 + \\beta^2)$.',
      { where: function (v) {
          var c_tilde = v.a * v.a - 2 * v.a + 2, b_tilde = 2 * (v.a - 1);
          var alpha = c_tilde - v.w * v.w, beta = b_tilde * v.w;
          return (alpha * alpha + beta * beta) !== 0 && alpha !== 0;
        },
        mistakes: {
          noShift: function (v) { return v.k / (2 - v.w * v.w); },
          wrongSign: function (v) {
            var c_tilde = v.a * v.a - 2 * v.a + 2, b_tilde = 2 * (v.a - 1);
            var alpha = c_tilde - v.w * v.w, beta = b_tilde * v.w;
            return (-alpha * v.k) / (alpha * alpha + beta * beta);
          }
        },
        feedback: [
          { when: 'noShift', say: 'Casi: olvidaste el desplazamiento exponencial; $e^{ax}$ modifica los coeficientes efectivos.' },
          { when: 'wrongSign', say: 'Casi: revisa el signo de $\\alpha = a^2 - 2a + 2 - \\omega^2$.' }
        ] }),

    N('su-n-producto-x-exp-eval', 'superposicion', 2, { a: [2, 4, 1], p: [3, 9, 3] },
      function (v) { return 'Para $y\'\' - 9y = ' + v.p + 'x\\,e^{' + v.a + 'x}$ (con $a = ' + v.a + ' \\neq 3$), calcula el coeficiente principal $A$ de $y_p = (Ax + B)e^{' + v.a + 'x}$.'; },
      function (v) { return v.p / (v.a * v.a - 9); },
      'El coeficiente de $x e^{ax}$ es $(a^2 - 9)A = p \\Rightarrow A = p/(a^2 - 9)$.',
      { where: function (v) { return v.a !== 3; },
        mistakes: {
          plus9: function (v) { return v.p / (v.a * v.a + 9); },
          noSq: function (v) { return v.p / (v.a - 9); }
        },
        feedback: [
          { when: 'plus9', say: 'Casi: la ecuación tiene $-9y$, por lo que es $a^2 - 9$, no $a^2 + 9$.' },
          { when: 'noSq', say: 'Casi: el exponente entra al cuadrado: $a^2 - 9$.' }
        ] }),

    E('su-e-tres-terminos-completo', 'superposicion', 2, { a: [2, 4, 1], b: [2, 3, 1] },
      function (v) { return 'Encuentra la solución particular $y_p(x)$ de $y\'\' + y = ' + v.a + ' + ' + (2 * (v.b * v.b + 1)) + 'e^{' + v.b + 'x}$.'; },
      function (v) { return v.a + ' + 2*e^(' + v.b + '*x)'; },
      'Por superposición, $y_p = a + 2e^{bx}$ satisface $y\'\' + y = a + 2(b^2 + 1)e^{bx}$.',
      { domain: [-1, 1],
        mistakes: {
          negA: function (v) { return '-' + v.a + ' + 2*e^(' + v.b + '*x)'; },
          noA: function () { return '2*e^(' + v.b + '*x)'; }
        },
        feedback: [
          { when: 'negA', say: 'Casi: el término constante es positivo $+a$.' },
          { when: 'noA', say: function (v) { return 'Casi: falta la parte constante $' + v.a + '$.'; } }
        ] }),

    N('su-n-producto-x-exp-b', 'superposicion', 3, { a: [1, 2, 1], p: [4, 8, 2] },
      function (v) { return 'En $y\'\' - 9y = ' + v.p + 'x\\,e^{' + v.a + 'x}$, calcula el término constante $B$ de la propuesta $y_p = (Ax + B)e^{' + v.a + 'x}$.'; },
      function (v) { return -2 * v.a * v.p / Math.pow(v.a * v.a - 9, 2); },
      'Igualando a cero el término independiente dentro del corchete: $2aA + (a^2 - 9)B = 0 \\Rightarrow B = -2ap/(a^2 - 9)^2$.',
      { mistakes: {
          posSign: function (v) { return 2 * v.a * v.p / Math.pow(v.a * v.a - 9, 2); },
          noSqDenom: function (v) { return -2 * v.a * v.p / (v.a * v.a - 9); }
        },
        feedback: [
          { when: 'posSign', say: 'Casi: al despejar $(a^2-9)B = -2aA$, el signo es negativo.' },
          { when: 'noSqDenom', say: 'Casi: falta dividir nuevamente entre $(a^2 - 9)$ para despejar $B$.' }
        ] }),

    N('su-n-superposicion-tres-fuentes', 'superposicion', 3, { c1: [1, 3, 1], c2: [2, 4, 1], c3: [2, 5, 1] },
      function (v) { return 'Para $y\'\' + y = ' + v.c1 + ' + ' + (5 * v.c2) + 'e^{2x} + ' + (-3 * v.c3) + '\\cos(2x)$, calcula $y_p(0)$.'; },
      function (v) { return v.c1 + v.c2 + v.c3; },
      'Por superposición, $y_p(0) = y_{p1}(0) + y_{p2}(0) + y_{p3}(0) = c_1 + c_2 + c_3$.',
      { mistakes: {
          mult: function (v) { return v.c1 * v.c2 * v.c3; },
          minusC3: function (v) { return v.c1 + v.c2 - v.c3; }
        },
        feedback: [
          { when: 'mult', say: 'Casi: las tres soluciones particulares se suman.' },
          { when: 'minusC3', say: 'Casi: como $(-3) c_3 / (1 - 4) = +c_3$, la contribución en $x = 0$ es $+c_3$.' }
        ] }),

    N('su-n-producto-exp-trig-derivada', 'superposicion', 3, { a: [1, 2, 1], k: [12, 24, 6] },
      function (v) { return 'Para $y\'\' + 4y = 8x + ' + v.k + 'e^{' + v.a + 'x}$, calcula el valor de la segunda derivada $y\'\'_p(0)$.'; },
      function (v) { return (v.a * v.a * v.k) / (v.a * v.a + 4); },
      'La segunda derivada del término polinomial $2x$ es 0; la del término exponencial aporta $a^2 k / (a^2 + 4)$.',
      { mistakes: {
          noSq: function (v) { return (v.a * v.k) / (v.a * v.a + 4); },
          addPoly: function (v) { return 8 + (v.a * v.a * v.k) / (v.a * v.a + 4); }
        },
        feedback: [
          { when: 'noSq', say: 'Casi: la segunda derivada introduce $a^2$, no $a$.' },
          { when: 'addPoly', say: 'Casi: la segunda derivada de $2x$ es $0$, no $8$.' }
        ] }),

    /* ======================= 6. Problemas de valor inicial y solución completa (17) ======================= */
    C('pv-c-error-clasico-ics', 'pvi', 1,
      'Al resolver un PVI para una ecuación no homogénea $L(y) = g(x)$, ¿en qué momento deben aplicarse las condiciones iniciales?',
      'Al final, sobre la solución general completa $y = y_h + y_p$', [
        ['Al inicio, sobre la solución homogénea $y_h$ antes de calcular $y_p$', 'Casi: ese es el error más común; si aplicas las condiciones a $y_h$, al sumarle $y_p$ se violan las condiciones iniciales.'],
        ['Únicamente sobre la solución particular $y_p$', 'Casi: $y_p$ no tiene constantes arbitrarias; las constantes están en $y_h$.'],
        ['Es indiferente: da el mismo resultado aplicarlas a $y_h$ que a $y_h + y_p$', 'Casi: $y_p(0)$ y $y\'_p(0)$ modifican los valores iniciales disponibles para $c_1$ y $c_2$.']],
      'Las condiciones $y(x_0) = y_0$ y $y\'(x_0) = y_0\'$ son restricciones sobre la función total $y(x) = y_h(x) + y_p(x)$.'),

    C('pv-c-unicidad-solucion', 'pvi', 1,
      'Para una EDO lineal de segundo orden con coeficientes constantes y fuente $g(x)$ continua, ¿cuántas soluciones tiene el PVI con $y(x_0) = y_0$, $y\'(x_0) = y_1$?',
      'Exactamente una solución única definida en todo $\\mathbb{R}$', [
        ['Infinitas soluciones, porque $y_p$ no es única', 'Casi: aunque existan varias $y_p$, la suma $y_h + y_p$ sujeta a condiciones iniciales da una única curva solución.'],
        ['Dos soluciones distintas, una correspondiente a $y_h$ y otra a $y_p$', 'Casi: la solución es la suma $y = y_h + y_p$, no dos curvas independientes.'],
        ['Ninguna si el discriminante de la homogénea es negativo', 'Casi: el teorema de existencia y unicidad garantiza solución única para cualquier discriminante si $g$ es continua.']],
      'Por el teorema de existencia y unicidad lineal, un PVI de orden 2 con coeficientes constantes y fuente continua tiene solución única en todo $\\mathbb{R}$.'),

    C('pv-c-efecto-yp-en-c1', 'pvi', 1,
      'Si $y_h = c_1 e^x + c_2 e^{-x}$ y $y_p = 3$, con condición $y(0) = 5$, ¿cuánto vale la suma $c_1 + c_2$?',
      '$c_1 + c_2 = 2$, porque $y(0) = c_1 + c_2 + 3 = 5$', [
        ['$c_1 + c_2 = 5$, olvidando restar $y_p(0)$', 'Casi: olvidaste que $y_p(0) = 3$ se suma en la solución total: $c_1 + c_2 + 3 = 5$.'],
        ['$c_1 + c_2 = 8$, sumando $y_p(0)$ a $5$', 'Casi: al despejar $c_1 + c_2$, el $3$ pasa restando: $5 - 3 = 2$.'],
        ['$c_1 + c_2 = 0$, porque la homogénea se anula en el origen', 'Casi: $c_1 e^0 + c_2 e^0 = c_1 + c_2$.']],
      'Evaluando la solución total en $0$: $y(0) = (c_1 + c_2) + 3 = 5 \\Rightarrow c_1 + c_2 = 2$.'),

    N('pv-n-constante-c1', 'pvi', 2, { y0: [6, 12, 2], s: [1, 4, 1] },
      function (v) { return 'Para la ecuación $y\'\' - y = ' + v.s + '$ con solución general $y(x) = c_1 e^x + c_2 e^{-x} - ' + v.s + '$, si $y(0) = ' + v.y0 + '$ y $y\'(0) = 0$, ¿cuánto vale $c_1$?'; },
      function (v) { return (v.y0 + v.s) / 2; },
      'De $c_1 + c_2 - s = y_0$ y $c_1 - c_2 = 0$, se obtiene $c_1 = (y_0 + s)/2$.',
      { mistakes: {
          noS: function (v) { return v.y0 / 2; },
          subS: function (v) { return (v.y0 - v.s) / 2; }
        },
        feedback: [
          { when: 'noS', say: function (v) { return 'Casi: olvidaste sumar $' + v.s + '$ proveniente de $y_p(0) = -' + v.s + '$: $c_1 + c_2 = y_0 + s$.'; } },
          { when: 'subS', say: function (v) { return 'Casi: como $y_p = -' + v.s + '$, al pasar al otro lado queda $y_0 + s$.'; } }
        ] }),

    N('pv-n-constante-c2', 'pvi', 2, { s: [2, 6, 2], d: [2, 6, 2] },
      function (v) { return 'Una solución tiene la forma $y(x) = c_1 e^x + c_2 e^{-x} + 3$. Si $y(0) = ' + (3 + v.s) + '$ y $y\'(0) = ' + v.d + '$, calcula $c_2$.'; },
      function (v) { return (v.s - v.d) / 2; },
      'De $c_1 + c_2 = s$ y $c_1 - c_2 = d$, restando ambas ecuaciones da $2c_2 = s - d \\Rightarrow c_2 = (s - d)/2$.',
      { where: function (v) { return v.s !== v.d; },
        mistakes: {
          plus: function (v) { return (v.s + v.d) / 2; },
          noDiv2: function (v) { return v.s - v.d; }
        },
        feedback: [
          { when: 'plus', say: 'Casi: ese es el valor de $c_1$; para $c_2$ se resta: $c_2 = (s - d)/2$.' },
          { when: 'noDiv2', say: 'Casi: falta dividir entre 2.' }
        ] }),

    N('pv-n-eval-solucion-completa', 'pvi', 2, { k: [1, 3, 1], s: [2, 4, 1] },
      function (v) { return 'El PVI $y\'\' - ' + (v.k * v.k) + 'y = ' + (2 * v.s * v.k * v.k) + '$ con $y(0) = 0$ y $y\'(0) = 0$ tiene solución $y(x) = ' + (2 * v.s) + '(\\cosh ' + (v.k === 1 ? '' : v.k) + 'x - 1)$. Calcula el valor de $y(1)$.'; },
      function (v) { return 2 * v.s * (Math.cosh(v.k) - 1); },
      'Evaluando la solución analítica en $x = 1$: $y(1) = 2s(\\cosh k - 1)$.',
      { mistakes: {
          noMinus1: function (v) { return 2 * v.s * Math.cosh(v.k); },
          zero: function () { return 0; }
        },
        feedback: [
          { when: 'noMinus1', say: 'Casi: olvidaste restar el término particular $-1$.' },
          { when: 'zero', say: 'Casi: la solución no es idénticamente cero; la fuente no homogénea la desplaza.' }
        ] }),

    N('pv-n-posicion-equilibrio', 'pvi', 2, { c: [2, 8, 2], k: [12, 36, 6] },
      function (v) { return 'Un sistema masa-resorte amortiguado $y\'\' + 4y\' + ' + v.c + 'y = ' + v.k + '$ se suelta desde el reposo. Al pasar mucho tiempo ($t \\to \\infty$), ¿a qué valor de posición estacionaria $y_{est}$ converge la solución?'; },
      function (v) { return v.k / v.c; },
      'Como las raíces homogéneas tienen parte real negativa, el transitorio $y_h(t) \\to 0$ y la solución converge a $y_p = k/c$.',
      { mistakes: {
          zero: function () { return 0; },
          div4: function (v) { return v.k / 4; }
        },
        feedback: [
          { when: 'zero', say: 'Casi: la parte homogénea decae a cero, pero la solución converge a la solución particular $y_p = k/c$.' },
          { when: 'div4', say: 'Casi: para la posición estacionaria constante, $y\' = 0$; se divide entre $c$, no entre $4$.' }
        ] }),

    E('pv-e-pvi-exponencial-cero', 'pvi', 2, { a: [1, 3, 1], k: [2, 4, 1] },
      function (v) { return 'Resuelve el PVI $y\'\' - ' + (v.a * v.a) + 'y = ' + (v.k * v.k - v.a * v.a) + 'e^{' + v.k + 'x}$ con $y(0) = 1$ y $y\'(0) = ' + v.k + '$. Escribe la función $y(x)$.'; },
      function (v) { return 'e^(' + v.k + '*x)'; },
      'Como $y_p = e^{kx}$ ya cumple exactamente $y_p(0) = 1$ y $y\'_p(0) = k$, las constantes de la homogénea son $c_1 = c_2 = 0$, dando $y(x) = e^{kx}$.',
      { where: function (v) { return v.a !== v.k; },
        domain: [-1, 1],
        mistakes: {
          plusYh: function (v) { return 'e^(' + v.a + '*x) + e^(' + v.k + '*x)'; },
          wrongExp: function (v) { return 'e^(' + v.a + '*x)'; }
        },
        feedback: [
          { when: 'plusYh', say: 'Casi: las condiciones iniciales determinan que las constantes de $y_h$ son exactamente cero.' },
          { when: 'wrongExp', say: function (v) { return 'Casi: la solución es la particular $e^{' + v.k + 'x}$.'; } }
        ] }),

    E('pv-e-pvi-constante-cero', 'pvi', 2, { a: [2, 4, 1] },
      function (v) { return 'Resuelve el PVI $y\'\' + ' + (v.a * v.a) + 'y = ' + (3 * v.a * v.a) + '$ con condiciones $y(0) = 4$ y $y\'(0) = 0$. Escribe la función $y(x)$.'; },
      function (v) { return 'cos(' + v.a + '*x) + 3'; },
      'La solución particular es $y_p = 3$; la homogénea es $c_1\\cos(ax) + c_2\\sin(ax)$. Con $y(0) = c_1 + 3 = 4 \\Rightarrow c_1 = 1$ y $c_2 = 0$, dando $y = \\cos(ax) + 3$.',
      { domain: [-2, 2],
        mistakes: {
          noThree: function (v) { return '4*cos(' + v.a + '*x)'; },
          sinInstead: function (v) { return 'sin(' + v.a + '*x) + 3'; }
        },
        feedback: [
          { when: 'noThree', say: 'Casi: olvidaste la solución particular $y_p = 3$; aplicaste las condiciones solo a $y_h$.' },
          { when: 'sinInstead', say: 'Casi: en $x = 0$ la función seno se anula; se requiere el coseno para dar $y(0) = 4$.' }
        ] }),

    N('pv-n-pvi-valor-en-dos', 'pvi', 2, { a: [1, 3, 1], s: [2, 5, 1] },
      function (v) { return 'Dada la solución del PVI $y(x) = ' + v.s + ' + \\cos(' + v.a + 'x)$, calcula el valor numérico de $y(2)$.'; },
      function (v) { return v.s + Math.cos(2 * v.a); },
      'Sustituyendo $x = 2$: $y(2) = s + \\cos(2a)$.',
      { mistakes: {
          noS: function (v) { return Math.cos(2 * v.a); },
          sinInstead: function (v) { return v.s + Math.sin(2 * v.a); }
        },
        feedback: [
          { when: 'noS', say: function (v) { return 'Casi: olvidaste sumar la constante $' + v.s + '$.'; } },
          { when: 'sinInstead', say: 'Casi: la solución contiene coseno, no seno.' }
        ] }),

    E('pv-e-pvi-seno-origen', 'pvi', 2, { a: [2, 4, 1] },
      function (v) { return 'Resuelve el PVI $y\'\' + ' + (v.a * v.a) + 'y = ' + (2 * v.a * v.a) + '$ con $y(0) = 2$ y $y\'(0) = ' + v.a + '$. Escribe la función $y(x)$.'; },
      function (v) { return 'sin(' + v.a + '*x) + 2'; },
      '$y_p = 2$; $y(0) = c_1 + 2 = 2 \\Rightarrow c_1 = 0$; $y\'(0) = a c_2 = a \\Rightarrow c_2 = 1$, resultando $y = \\sin(ax) + 2$.',
      { domain: [-2, 2],
        mistakes: {
          cosInstead: function (v) { return 'cos(' + v.a + '*x) + 2'; },
          noConst: function () { return 'sin(' + v.a + '*x)'; }
        },
        feedback: [
          { when: 'cosInstead', say: 'Casi: como $y(0) = 2$ y $y_p = 2$, el coeficiente del coseno es $c_1 = 0$; la derivada da $c_2 = 1$ para el seno.' },
          { when: 'noConst', say: 'Casi: olvidaste sumar la solución particular $y_p = 2$.' }
        ] }),

    E('pv-e-pvi-exponencial-sinh', 'pvi', 2, { k: [2, 3, 1] },
      function (v) { return 'Resuelve el PVI $y\'\' - ' + (v.k * v.k) + 'y = ' + (v.k * v.k) + '$ con $y(0) = 0$ y $y\'(0) = ' + v.k + '$. Escribe la solución $y(x)$ en términos de exponenciales o funciones hiperbólicas.'; },
      function (v) { return 'e^(' + v.k + '*x) - 1'; },
      'La particular es $y_p = -1$. De $c_1 + c_2 = 1$ y $c_1 - c_2 = 1$ se obtiene $c_1 = 1, c_2 = 0$, por lo que $y(x) = e^{kx} - 1$.',
      { domain: [-1, 1],
        mistakes: {
          noMinus1: function (v) { return 'e^(' + v.k + '*x)'; },
          wrongSign: function (v) { return 'e^(' + v.k + '*x) + 1'; }
        },
        feedback: [
          { when: 'noMinus1', say: 'Casi: en $x = 0$, $y(0)$ debe ser 0; falta restar $1$ por la solución particular.' },
          { when: 'wrongSign', say: 'Casi: $y_p = -1$, así que va restando.' }
        ] }),

    N('pv-n-velocidad-inicial-requerida', 'pvi', 3, { a: [2, 5, 1], y0: [1, 4, 1] },
      function (v) { return 'Para la ecuación $y\'\' - ' + (v.a * v.a) + 'y = ' + (2 * v.a * v.a) + '$ con $y(0) = ' + v.y0 + '$, ¿qué velocidad inicial $y\'(0) = v_0$ se debe fijar para que la solución no contenga el modo creciente $e^{' + v.a + 'x}$ (es decir, $c_1 = 0$)?'; },
      function (v) { return -v.a * (v.y0 + 2); },
      'Para eliminar el término creciente $e^{ax}$ se requiere $c_1 = 0 \\Rightarrow c_2 = y_0 + 2$, por lo que $v_0 = y\'(0) = -a c_2 = -a(y_0 + 2)$.',
      { mistakes: {
          posSign: function (v) { return v.a * (v.y0 + 2); },
          noP: function (v) { return -v.a * v.y0; }
        },
        feedback: [
          { when: 'posSign', say: 'Casi: como $c_1 = 0$, $y\'(0) = -a c_2 = -a(y_0 + 2)$, con signo negativo.' },
          { when: 'noP', say: 'Casi: olvidaste la contribución de la particular $y_p = -2$ en la condición inicial.' }
        ] }),

    N('pv-n-cruce-cero-pvi', 'pvi', 3, { k: [1, 3, 1], s: [2, 5, 1] },
      function (v) { return 'La solución de un PVI es $y(x) = ' + v.s + ' - ' + v.s + 'e^{-' + (v.k === 1 ? '' : v.k) + 'x} + x$. Calcula la derivada $y\'(0)$ en el origen.'; },
      function (v) { return v.k * v.s + 1; },
      'Derivando: $y\'(x) = k s e^{-kx} + 1$, que evaluado en $x = 0$ da $k s + 1$.',
      { mistakes: {
          noOne: function (v) { return v.k * v.s; },
          wrongSign: function (v) { return -v.k * v.s + 1; }
        },
        feedback: [
          { when: 'noOne', say: 'Casi: olvidaste la derivada del término lineal: $(x)\' = 1$.' },
          { when: 'wrongSign', say: 'Casi: $(-s)(-k)e^{-kx} = +ks$, el signo es positivo.' }
        ] }),

    N('pv-n-aceleracion-inicial', 'pvi', 3, { a: [2, 4, 1], b: [3, 5, 1], g0: [4, 12, 2] },
      function (v) { return 'Sin resolver toda la ecuación, para $y\'\' + ' + v.a + "y' + " + v.b + 'y = ' + v.g0 + '$ con condiciones $y(0) = 1$ y $y\'(0) = 2$, ¿cuánto vale la segunda derivada $y\'\'(0)$ en el instante inicial?'; },
      function (v) { return v.g0 - 2 * v.a - v.b; },
      'Despejando directamente de la EDO: $y\'\'(0) = g(0) - a y\'(0) - b y(0) = g_0 - 2a - b$.',
      { where: function (v) { return Math.abs(v.g0 - 2 * v.a - v.b) >= 1; },
        mistakes: {
          plusAll: function (v) { return v.g0 + 2 * v.a + v.b; },
          forgotDeriv: function (v) { return v.g0 - v.b; }
        },
        feedback: [
          { when: 'plusAll', say: 'Casi: al despejar $y\'\'(0)$, los términos con $y\'$ y $y$ pasan restando.' },
          { when: 'forgotDeriv', say: function (v) { return 'Casi: olvidaste restar el término $' + v.a + "y'(0) = " + (2 * v.a) + '$.'; } }
        ] }),

    N('pv-n-maximo-oscilacion-forzada', 'pvi', 3, { a: [2, 4, 1], c: [1, 3, 1] },
      function (v) { return 'La solución del PVI para un oscilador no amortiguado es $y(x) = ' + v.c + ' + ' + v.a + '\\sin(3x)$. ¿Cuál es el valor máximo absoluto que alcanza la función $y(x)$?'; },
      function (v) { return v.c + v.a; },
      'Como el seno oscila entre $-1$ y $+1$, el valor máximo de $c + a\\sin(3x)$ es $c + a$.',
      { mistakes: {
          onlyA: function (v) { return v.a; },
          onlyC: function (v) { return v.c; }
        },
        feedback: [
          { when: 'onlyA', say: function (v) { return 'Casi: esa es la amplitud de oscilación; el valor máximo suma la posición de equilibrio $' + v.c + '$.'; } },
          { when: 'onlyC', say: function (v) { return 'Casi: ese es el centro de oscilación; el máximo alcanza $' + v.c + ' + ' + v.a + '$.'; } }
        ] }),

    N('pv-n-energia-origen', 'pvi', 3, { m: [1, 3, 1], v0: [2, 6, 2] },
      function (v) { return 'Para un oscilador $y\'\' + 4y = 8$ con masa $m = ' + v.m + '$, si la velocidad inicial es $y\'(0) = ' + v.v0 + '$, calcula la energía cinética inicial $E_k = \\frac{1}{2} m (y\'(0))^2$.'; },
      function (v) { return 0.5 * v.m * v.v0 * v.v0; },
      'La energía cinética inicial es $E_k = \\frac{1}{2} m (y\'(0))^2$, sustituyendo los datos dados.',
      { mistakes: {
          noHalf: function (v) { return v.m * v.v0 * v.v0; },
          noSq: function (v) { return 0.5 * v.m * v.v0; }
        },
        feedback: [
          { when: 'noHalf', say: 'Casi: la energía cinética lleva el factor $1/2$: $E_k = \\frac{1}{2}m v_0^2$.' },
          { when: 'noSq', say: 'Casi: la velocidad va elevada al cuadrado.' }
        ] })
  ];

  K.register(SUBTEMAS, Q);
})();
