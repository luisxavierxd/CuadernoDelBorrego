/* =====================================================================
   Banco · Cálculo 3 · S14 · Variación de parámetros (segundo orden):
   forma estándar, sistema auxiliar de Cramer, Wronskiano, funciones no
   tabuladas (trigonométricas, logarítmicas, racionales), comparación
   con coeficientes indeterminados, ecuaciones de Cauchy-Euler y PVI.
   100 preguntas propias (source: 'propia').
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c3', '14');

  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }

  // Como K.C, pero la explicación de un distractor también puede depender de los valores (say(v)).
  function C() {
    var q = K.C.apply(null, arguments), opts = q.options;
    q.options = function (v) {
      return opts(v).map(function (o) { return typeof o.say === 'function' ? Object.assign({}, o, { say: o.say(v) }) : o; });
    };
    return q;
  }

  // La respuesta y cada error típico difieren al menos 3 % entre sí y no caen cerca de 0.
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
    'c3.S14.forma': 'Forma estándar y sistema auxiliar',
    'c3.S14.wronskiano': 'Wronskiano y derivadas u₁′, u₂′',
    'c3.S14.trig': 'Funciones trigonométricas no tabuladas',
    'c3.S14.log-rac': 'Logaritmos y funciones racionales',
    'c3.S14.comparacion': 'Comparación con coeficientes indeterminados',
    'c3.S14.variables-pvi': 'Coeficientes variables y problemas de valor inicial'
  };

  var Q = [
    /* ======================= 1. Forma estándar y sistema auxiliar (16) ======================= */
    C('fo-def-estandar', 'forma', 1,
      '¿Cuál es la forma estándar indispensable de una ecuación diferencial lineal de segundo orden para aplicar el método de variación de parámetros?',
      '$y\'\' + P(x)\\,y\' + Q(x)\\,y = g(x)$, con coeficiente $1$ en $y\'\'$', [
        ['$a(x)\\,y\'\' + b(x)\\,y\' + c(x)\\,y = 0$, igualada siempre a cero', 'Casi: eso corresponde a la forma homogénea; el método busca resolver la no homogénea con $g(x)$.'],
        ['$y\'\' = P(x)\\,y\'\\,Q(x)\\,y$, factorizada en derivadas', 'Casi: la ecuación debe ser lineal, no un producto de factores.'],
        ['$P(x)\\,y\'\' + y\' + Q(x)\\,y = g(x)$, con coeficiente $1$ en $y\'$', 'Casi: el coeficiente que debe ser igual a $1$ es el de la segunda derivada $y\'\'$.']],
      'La deducción de las fórmulas de Cramer parte de que el coeficiente de $y\'\'$ es exactamente $1$.'),

    C('fo-condicion-auxiliar', 'forma', 1,
      'Al buscar una solución particular de la forma $y_p = u_1(x)\\,y_1 + u_2(x)\\,y_2$, ¿qué condición auxiliar se impone para simplificar el cálculo de $y_p\'$?',
      '$u_1\'\\,y_1 + u_2\'\\,y_2 = 0$', [
        ['$u_1\\,y_1\' + u_2\\,y_2\' = 0$', 'Casi: esa combinación forma parte de $y_p\'$, no es la que se anula por hipótesis.'],
        ['$u_1\'\\,y_1\' + u_2\'\\,y_2\' = 0$', 'Casi: al sustituir en la EDO, esa combinación se iguala al término $g(x)$.'],
        ['$u_1 + u_2 = 1$', 'Casi: la condición vincula las derivadas de las funciones incógnita con la base $y_1, y_2$.']],
      'Se impone $u_1\'y_1 + u_2\'y_2 = 0$ para que $y_p\'$ no contenga derivadas $u_1\'$ ni $u_2\'$, evitando segundas derivadas de $u$.'),

    C('fo-porque-condicion', 'forma', 1,
      '¿Por qué es matemáticamente lícito imponer la condición auxiliar $u_1\'\\,y_1 + u_2\'\\,y_2 = 0$ al buscar la solución particular?',
      'Porque se tienen dos funciones incógnita ($u_1$ y $u_2$) pero solo una ecuación diferencial original, lo que concede un grado de libertad', [
        ['Porque el Wronskiano de $y_1$ y $y_2$ siempre se anula en todo el intervalo', 'Casi: si el Wronskiano fuera cero, $y_1$ y $y_2$ no formarían una base fundamental.'],
        ['Porque las funciones $u_1$ y $u_2$ deben ser números constantes por definición', 'Casi: en variación de parámetros las cantidades $u_1, u_2$ son explícitamente variables.'],
        ['Porque de lo contrario la ecuación resultante se transformaría en una ecuación no lineal', 'Casi: la linealidad se mantiene, pero tener dos funciones da la libertad de fijar una restricción.'],
        ['Porque la solución particular debe ser ortogonal a la homogénea', 'Casi: no se exige ortogonalidad en el espacio de funciones para deducir el método.']],
      'Al proponer dos funciones para satisfacer una sola ecuación escalar de segundo orden, se dispone de un grado de libertad para imponer una relación conveniente.'),

    C('fo-cramer-sistema', 'forma', 1,
      'El sistema algebraico de dos ecuaciones que determina $u_1\'$ y $u_2\'$ tiene como matriz de coeficientes:',
      '$\\begin{pmatrix} y_1 & y_2 \\\\ y_1\' & y_2\' \\end{pmatrix}$, cuyo determinante es el Wronskiano $W(y_1, y_2)$', [
        ['$\\begin{pmatrix} y_1\' & y_2\' \\\\ y_1\'\' & y_2\'\' \\end{pmatrix}$, con determinante $W(y_1\', y_2\')$', 'Casi: la primera fila contiene a las funciones de la base $y_1, y_2$, no a sus derivadas.'],
        ['$\\begin{pmatrix} 1 & 1 \\\\ y_1 & y_2 \\end{pmatrix}$, con determinante $y_2 - y_1$', 'Casi: las filas corresponden a los coeficientes de $u_1\'$ y $u_2\'$ en el sistema deducido.'],
        ['$\\begin{pmatrix} y_1 & y_1\' \\\\ y_2 & y_2\' \\end{pmatrix}$, cuyo determinante es nulo', 'Casi: el determinante no se anula para un conjunto fundamental de soluciones.']],
      'Las ecuaciones deducidas son $u_1\'y_1 + u_2\'y_2 = 0$ y $u_1\'y_1\' + u_2\'y_2\' = g(x)$; su matriz es exactamente la del Wronskiano.'),

    C('fo-origen-signo-u1', 'forma', 1,
      '¿De dónde proviene el signo negativo en la fórmula $u_1\' = -\\dfrac{y_2\\,g}{W}$?',
      'De la regla de Cramer: al sustituir el vector $\\begin{pmatrix} 0 \\\\ g \\end{pmatrix}$ en la primera columna, el determinante queda $-y_2\\,g$', [
        ['De aplicar la derivada del cociente en la regla del producto', 'Casi: no se deriva ningún cociente; es el cálculo algebraico del determinante $\\det\\begin{pmatrix} 0 & y_2 \\\\ g & y_2\' \\end{pmatrix} = -y_2 g$.'],
        ['De que el Wronskiano tiene siempre signo negativo por definición', 'Casi: el Wronskiano puede ser positivo o negativo según el orden en que se listen las soluciones.'],
        ['De una convención arbitraria para forzar que $y_p$ decrezca', 'Casi: el signo es consecuencia directa del álgebra matricial de Cramer.']],
      'El determinante de la matriz modificada es $0\\cdot y_2\' - y_2\\cdot g = -y_2 g$, lo que introduce el signo negativo.'),

    C('fo-identificar-g-coef-const', 'forma', 2,
      function (v) { return 'Para la ecuación no homogénea $' + v.a + 'y\'\' + ' + v.b + 'y\' + y = \\sec x$, ¿cuál es la función $g(x)$ que debe emplearse en las fórmulas de variación de parámetros?'; },
      function (v) { return '$g(x) = \\frac{1}{' + v.a + '}\\sec x$'; }, [
        [function (v) { return '$g(x) = \\sec x$'; }, function (v) { return 'Casi: olvidaste dividir entre el coeficiente principal ' + v.a + ' de $y\'\'$.'; }],
        [function (v) { return '$g(x) = ' + v.a + '\\sec x$'; }, function (v) { return 'Casi: se debe dividir entre ' + v.a + ', no multiplicar.'; }],
        [function (v) { return '$g(x) = \\frac{' + v.b + '}{' + v.a + '}\\sec x$'; }, 'Casi: el coeficiente de primer orden no altera el término fuente al normalizar.']],
      function (v) { return 'Al dividir toda la ecuación entre ' + v.a + ' para obtener coeficiente 1 en $y\'\'$, queda $g(x) = \\frac{1}{' + v.a + '}\\sec x$.'; },
      { vars: { a: [2, 5, 1], b: [2, 6, 2] } }),

    C('fo-identificar-g-potencia', 'forma', 2,
      function (v) { return 'Dada la ecuación $x^2 y\'\' + 3x y\' - 4y = x^{' + v.n + '}$ con $x > 0$, ¿qué función $g(x)$ entra en la regla de Cramer?'; },
      function (v) { return '$g(x) = x^{' + (v.n - 2) + '}$'; }, [
        [function (v) { return '$g(x) = x^{' + v.n + '}$'; }, 'Casi: hay que dividir entre $x^2$ antes de usar las fórmulas de variación de parámetros.'],
        [function (v) { return '$g(x) = x^{' + (v.n - 1) + '}$'; }, 'Casi: el coeficiente de $y\'\'$ es $x^2$, por lo que se restan 2 unidades al exponente, no 1.'],
        [function (v) { return '$g(x) = x^{' + (v.n + 2) + '}$'; }, 'Casi: no se multiplica por $x^2$, se divide entre $x^2$.']],
      function (v) { return 'En forma estándar: $y\'\' + \\frac{3}{x}y\' - \\frac{4}{x^2}y = x^{' + (v.n - 2) + '}$, así que $g(x) = x^{' + (v.n - 2) + '}$.'; },
      { vars: { n: [3, 6, 1] } }),

    C('fo-sin-constantes', 'forma', 2,
      '¿Por qué al calcular $u_1(x) = \\int u_1\'(x)\\,dx$ y $u_2(x) = \\int u_2\'(x)\\,dx$ no es necesario añadir constantes $+C_1$ y $+C_2$?',
      'Porque esas constantes producirían los términos $C_1 y_1 + C_2 y_2$, que ya están contemplados en la solución homogénea $y_h$', [
        ['Porque las integrales en variación de parámetros son siempre definidas entre 0 y 1', 'Casi: se calculan antiderivadas indefinidas, pero cualquier constante reproduce términos de $y_h$.'],
        ['Porque si se agregan constantes la función resultante deja de ser solución de la EDO', 'Casi: sigue siendo solución, pero duplica innecesariamente la familia complementaria.'],
        ['Porque la hipótesis $u_1\'y_1 + u_2\'y_2 = 0$ exige que $u_1(0) = 0$ y $u_2(0) = 0$', 'Casi: esa condición vincula exclusivamente a las derivadas, no fija valores en cero.']],
      'Si tomas $u_1 + C_1$ y $u_2 + C_2$, el producto $(u_1+C_1)y_1 + (u_2+C_2)y_2 = y_p + C_1y_1 + C_2y_2$ repite la solución homogénea complementaria.'),

    N('fo-coef-principal-eval', 'forma', 2,
      { a: [2, 6, 1], b: [2, 8, 2], c: [3, 9, 2] },
      function (v) { return 'En la ecuación $' + v.a + 'y\'\' + ' + v.b + 'y = ' + v.c + '\\sec x$, ¿cuál es el coeficiente numérico de $\\sec x$ en la función estándar $g(x)$?'; },
      function (v) { return v.c / v.a; },
      function (v) { return 'La forma estándar exige coeficiente 1 en $y\'\'$: dividiendo entre ' + v.a + ' resulta g(x) = ' + fx(v.c / v.a, 2) + '\\sec x.'; },
      {
        mistakes: {
          noDiv: function (v) { return v.c; },
          mult: function (v) { return v.c * v.a; }
        },
        feedback: [
          { when: 'noDiv', say: 'Divide el lado derecho entre el coeficiente principal de $y\'\'$.' },
          { when: 'mult', say: 'Se debe dividir entre $a$, no multiplicar.' }
        ]
      }),

    N('fo-eval-rhs-euler', 'forma', 2,
      { k: [2, 5, 1], x0: [2, 6, 1] },
      function (v) { return 'Para la ecuación diferencial de Cauchy-Euler $x^2 y\'\' + x y\' + 4y = ' + v.k + 'x^3$ ($x > 0$), evalúa el término fuente normalizado $g(' + v.x0 + ')$.'; },
      function (v) { return v.k * v.x0; },
      function (v) { return 'Al dividir entre x^2 se obtiene g(x) = ' + v.k + 'x, de modo que g(' + v.x0 + ') = ' + (v.k * v.x0) + '.'; },
      {
        mistakes: {
          noDiv: function (v) { return v.k * Math.pow(v.x0, 3); },
          divOnce: function (v) { return v.k * Math.pow(v.x0, 2); }
        },
        feedback: [
          { when: 'noDiv', say: 'Divide entre $x^2$ antes de evaluar $g(x)$.' },
          { when: 'divOnce', say: 'El coeficiente de $y\'\'$ es $x^2$, debes dividir entre $x^2$ y no entre $x$.' }
        ]
      }),

    N('fo-u1p-sistema-eval', 'forma', 2,
      { c: [2, 5, 1], x0: [2, 4, 1] },
      function (v) { return 'Para una EDO con conjunto fundamental $y_1 = 1$, $y_2 = x$ y término estándar $g(x) = ' + v.c + 'x$, calcula el valor numérico de $u_1\'(' + v.x0 + ')$.'; },
      function (v) { return -v.c * v.x0 * v.x0; },
      function (v) { return 'Con W = 1, u_1\'(x) = -x(' + v.c + 'x) = -' + v.c + 'x^2, que en x = ' + v.x0 + ' vale ' + (-v.c * v.x0 * v.x0) + '.'; },
      {
        mistakes: {
          sign: function (v) { return v.c * v.x0 * v.x0; },
          noX: function (v) { return -v.c * v.x0; }
        },
        feedback: [
          { when: 'sign', say: 'Casi: recuerda el signo menos en $u_1\' = -y_2 g / W$.' },
          { when: 'noX', say: 'Casi: la fórmula es $u_1\' = -y_2 g / W$ y aquí $y_2 = x$.' }
        ]
      }),

    N('fo-u2p-sistema-eval', 'forma', 2,
      { c: [2, 6, 1], x0: [2, 5, 1] },
      function (v) { return 'Con el mismo conjunto fundamental $y_1 = 1$, $y_2 = x$ y $g(x) = ' + v.c + 'x$, calcula el valor numérico de la segunda derivada auxiliar $u_2\'(' + v.x0 + ')$.'; },
      function (v) { return v.c * v.x0; },
      function (v) { return 'Con W = 1 y y_1 = 1, u_2\'(x) = 1\\cdot ' + v.c + 'x = ' + v.c + 'x, que en x = ' + v.x0 + ' es ' + (v.c * v.x0) + '.'; },
      {
        mistakes: {
          neg: function (v) { return -v.c * v.x0; },
          sq: function (v) { return v.c * v.x0 * v.x0; }
        },
        feedback: [
          { when: 'neg', say: 'Casi: la derivada $u_2\' = +y_1 g / W$ lleva signo positivo.' },
          { when: 'sq', say: 'Casi: $u_2\'$ multiplica por $y_1 = 1$, no por $y_2 = x$.' }
        ]
      }),

    N('fo-det-matriz-u', 'forma', 2,
      { k: [2, 6, 1] },
      function (v) { return 'Determina el determinante del sistema auxiliar (el Wronskiano) para la base de soluciones $y_1 = e^{' + v.k + 'x}$ y $y_2 = e^{-' + v.k + 'x}$.'; },
      function (v) { return -2 * v.k; },
      function (v) { return 'W = e^{' + v.k + 'x}(-' + v.k + 'e^{-' + v.k + 'x}) - (' + v.k + 'e^{' + v.k + 'x})e^{-' + v.k + 'x} = -' + (2 * v.k) + '.'; },
      {
        mistakes: {
          pos: function (v) { return 2 * v.k; },
          zero: function (v) { return 0; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: $y_1 y_2\' - y_1\' y_2 = -k - k = -2k$.' },
          { when: 'zero', say: 'Casi: las dos exponenciales son linealmente independientes, su determinante no es cero.' }
        ]
      }),

    E('fo-expr-g-frac', 'forma', 3,
      { k: [3, 5, 1] },
      function (v) { return 'Escribe la expresión reducida de $g(x)$ para la ecuación diferencial $(x+1)\\,y\'\' + y\' - y = (x+1)^{' + v.k + '}$ en $x > 0$.'; },
      function (v) { return '(x + 1)^' + (v.k - 1); },
      function (v) { return 'Dividiendo entre el coeficiente principal (x+1) queda g(x) = (x+1)^{' + (v.k - 1) + '}.'; },
      {
        domain: [0.5, 3],
        mistakes: {
          noDiv: function (v) { return '(x + 1)^' + v.k; },
          plus: function (v) { return '(x + 1)^' + (v.k + 1); }
        },
        feedback: [
          { when: 'noDiv', say: 'Divide el lado derecho entre $(x+1)$.' },
          { when: 'plus', say: 'Se debe dividir entre $(x+1)$, no multiplicar.' }
        ]
      }),

    E('fo-expr-u1p-cramer', 'forma', 3,
      { m: [1, 3, 1] },
      function (v) { return 'Para la ecuación $y\'\' + ' + (v.m * v.m) + 'y = \\sec(' + v.m + 'x)$, con base $y_1 = \\cos(' + v.m + 'x)$ y $y_2 = \\sin(' + v.m + 'x)$, escribe la derivada $u_1\'(x)$ simplificada.'; },
      function (v) { return '-(1/' + v.m + ')*tan(' + v.m + '*x)'; },
      function (v) { return 'Como W = ' + v.m + ' y y_2 g = \\sin(' + v.m + 'x)\\sec(' + v.m + 'x) = \\tan(' + v.m + 'x), resulta u_1\' = -\\frac{1}{' + v.m + '}\\tan(' + v.m + 'x).'; },
      {
        domain: [0.1, 0.4],
        mistakes: {
          sign: function (v) { return '(1/' + v.m + ')*tan(' + v.m + '*x)'; },
          noW: function (v) { return '-tan(' + v.m + '*x)'; }
        },
        feedback: [
          { when: 'sign', say: 'Recuerda el signo negativo en la fórmula de $u_1\'.' },
          { when: 'noW', say: 'Falta dividir entre el Wronskiano $W = m$.' }
        ]
      }),

    E('fo-expr-u2p-cramer', 'forma', 3,
      { m: [1, 4, 1] },
      function (v) { return 'Para la misma ecuación $y\'\' + ' + (v.m * v.m) + 'y = \\sec(' + v.m + 'x)$ con $y_1 = \\cos(' + v.m + 'x)$ y $y_2 = \\sin(' + v.m + 'x)$, escribe la derivada $u_2\'(x)$ simplificada.'; },
      function (v) { return '1/' + v.m; },
      function (v) { return 'Como y_1 g = \\cos(' + v.m + 'x)\\sec(' + v.m + 'x) = 1 y W = ' + v.m + ', se tiene u_2\' = \\frac{1}{' + v.m + '}.'; },
      {
        domain: [0.2, 2.0],
        mistakes: {
          noW: function (v) { return '1'; },
          neg: function (v) { return '-1/' + v.m; }
        },
        feedback: [
          { when: 'noW', say: 'Divide entre el Wronskiano $W = m$.' },
          { when: 'neg', say: 'La derivada $u_2\'$ no lleva signo menos en la fórmula de Cramer.' }
        ]
      }),

    /* ======================= 2. Wronskiano y derivadas u₁′, u₂′ (17) ======================= */
    C('wr-constante-cuando', 'wronskiano', 1,
      'En una ecuación lineal de segundo orden en forma estándar $y\'\' + P(x)\\,y\' + Q(x)\\,y = 0$, ¿en qué caso el Wronskiano $W(y_1, y_2)$ resulta ser una función constante?',
      'Cuando el coeficiente $P(x)$ de la primera derivada $y\'$ es idénticamente cero', [
        ['Cuando el término independiente $Q(x)$ es constante e igual a 1', 'Casi: por el teorema de Abel $W(x) = C e^{-\\int P(x)dx}$; la variación de $W$ depende exclusivamente de $P(x)$.'],
        ['Únicamente cuando las soluciones $y_1$ y $y_2$ son polinomios', 'Casi: para funciones trigonométricas en $y\'\' + k^2y = 0$, como $P(x)=0$, $W$ también es constante.'],
        ['Siempre, porque dos soluciones linealmente independientes siempre dan Wronskiano constante', 'Casi: si $P(x) \\neq 0$, el Wronskiano varía con $x$ exponencialmente según el teorema de Abel.']],
      'Por la identidad de Abel, $W\'(x) = -P(x)W(x)$; si $P(x) = 0$, entonces $W\'(x) = 0$ y $W$ es constante.'),

    C('wr-intercambio-orden', 'wronskiano', 1,
      'Si al resolver una ecuación por variación de parámetros intercambias los papeles de $y_1$ y $y_2$, ¿qué ocurre con el Wronskiano y con la solución particular $y_p$ resultante?',
      'El Wronskiano cambia de signo, pero la solución particular $y_p$ final no cambia', [
        ['Tanto el Wronskiano como $y_p$ cambian de signo, dando un resultado incorrecto', 'Casi: el cambio de signo en $W$ se compensa con el intercambio de $u_1\'$ y $u_2\'$, dejando a $y_p$ idéntica.'],
        ['El Wronskiano permanece idéntico pero $y_p$ se anula', 'Casi: el determinante de una matriz es anticonmutativo al permutar columnas, así que $W$ cambia de signo.'],
        ['No se pueden intercambiar porque el método exige que $y_1$ sea siempre la función par', 'Casi: la elección de cuál es $y_1$ y cuál $y_2$ en la base es completamente arbitraria.']],
      'Al intercambiar columnas en el Wronskiano este cambia de signo ($W_{21} = -W_{12}$), pero las fórmulas intercambian $u_1$ y $u_2$ compensando el signo en $y_p$.'),

    C('wr-w-trig-basico', 'wronskiano', 1,
      'Para el conjunto fundamental $y_1 = \\cos(kx)$ y $y_2 = \\sin(kx)$ (con $k > 0$), ¿cuánto vale el Wronskiano $W(y_1, y_2)$?',
      '$W = k$', [
        ['$W = 1$', 'Casi: al derivar $\\sin(kx)$ y $\\cos(kx)$ sale un factor $k$ por la regla de la cadena: $\\cos(kx)(k\\cos(kx)) - (-k\\sin(kx))\\sin(kx) = k$.'],
        ['$W = k^2$', 'Casi: el factor $k$ aparece una sola vez en cada término del determinante, no al cuadrado.'],
        ['$W = -k$', 'Casi: $y_1 y_2\' - y_1\' y_2 = k\\cos^2(kx) - (-k\\sin^2(kx)) = k(\\cos^2(kx) + \\sin^2(kx)) = +k$.']],
      '$W = y_1 y_2\' - y_1\' y_2 = k\\cos^2(kx) + k\\sin^2(kx) = k$.'),

    C('wr-w-doble-raiz', 'wronskiano', 1,
      'Cuando la ecuación característica tiene raíz repetida $r$, la base es $y_1 = e^{rx}$ y $y_2 = x e^{rx}$. ¿Cuál es su Wronskiano?',
      '$W = e^{2rx}$', [
        ['$W = x e^{2rx}$', 'Casi: al calcular $y_1 y_2\' - y_1\' y_2$, el término $r x e^{2rx}$ se cancela exactamente.'],
        ['$W = 2r e^{2rx}$', 'Casi: los términos con $r$ se restan mutuamente en el determinante.'],
        ['$W = 1$', 'Casi: el factor exponencial $e^{2rx}$ no desaparece.']],
      '$y_1 y_2\' - y_1\' y_2 = e^{rx}(e^{rx} + rx e^{rx}) - (r e^{rx})(x e^{rx}) = e^{2rx}$.'),

    C('wr-abel-formula', 'wronskiano', 1,
      '¿Qué establece la fórmula de Abel para dos soluciones de $y\'\' + P(x)\\,y\' + Q(x)\\,y = 0$?',
      '$W(x) = C\\,e^{-\\int P(x)\\,dx}$ para alguna constante real $C$', [
        ['$W(x) = C\\,e^{-\\int Q(x)\\,dx}$', 'Casi: el exponente contiene la integral de $P(x)$, el coeficiente de $y\'$, no de $y$.'],
        ['$W(x) = P(x)\\,y_1 + Q(x)\\,y_2$', 'Casi: esa no es la relación diferencial que cumple el determinante wronskiano.'],
        ['$W(x) = C\\,\\ln|P(x)|$', 'Casi: la solución de $W\' + P(x)W = 0$ es una función exponencial.']],
      'Derivando el determinante y usando la EDO se obtiene la ecuación separable $W\' + P(x)W = 0$, cuya solución es $W(x) = C e^{-\\int P(x)dx}$.'),

    C('wr-no-anularse', 'wronskiano', 2,
      '¿Por qué es crucial para el método de variación de parámetros que el Wronskiano $W(y_1, y_2)$ nunca se anule en el intervalo de definición?',
      'Porque $W$ aparece en el denominador de las expresiones para $u_1\'$ y $u_2\'$', [
        ['Porque si $W=0$ las derivadas $u_1\'$ y $u_2\'$ se volverían números imaginarios', 'Casi: la división entre cero produce una indeterminación o discontinuidad esencial, no números imaginarios.'],
        ['Porque el método solo funciona si las dos soluciones son idénticas', 'Casi: las dos soluciones deben ser linealmente independientes para generar todo el espacio de soluciones.'],
        ['Porque $W$ representa la energía mecánica total del oscilador', 'Casi: el Wronskiano es una herramienta de álgebra lineal y análisis para independencia lineal.']],
      'Tanto $u_1\' = -y_2g/W$ como $u_2\' = y_1g/W$ dividen entre $W$; si $W = 0$ no es posible despejar por Cramer.'),

    N('wr-num-trig-k', 'wronskiano', 2,
      { k: [2, 9, 1] },
      function (v) { return 'Calcula el valor numérico del Wronskiano $W(\\cos(' + v.k + 'x), \\sin(' + v.k + 'x))$.'; },
      function (v) { return v.k; },
      function (v) { return 'W = \\cos(' + v.k + 'x)(' + v.k + '\\cos(' + v.k + 'x)) - (-' + v.k + '\\sin(' + v.k + 'x))\\sin(' + v.k + 'x) = ' + v.k + '.'; },
      {
        mistakes: {
          sq: function (v) { return v.k * v.k; },
          one: function (v) { return 1; }
        },
        feedback: [
          { when: 'sq', say: 'El factor $k$ entra linealmente por la regla de la cadena, no elevado al cuadrado.' },
          { when: 'one', say: 'No olvides la regla de la cadena al derivar las funciones trigonométricas.' }
        ]
      }),

    N('wr-num-exp-distintas', 'wronskiano', 2,
      { a: [1, 4, 1], b: [5, 9, 1] },
      function (v) { return 'Determina el valor del Wronskiano evaluado en $x = 0$ para las soluciones $y_1 = e^{' + v.a + 'x}$ y $y_2 = e^{' + v.b + 'x}$.'; },
      function (v) { return v.b - v.a; },
      function (v) { return 'W(x) = (' + v.b + ' - ' + v.a + ')e^{' + (v.a + v.b) + 'x}, que en x = 0 da ' + (v.b - v.a) + '.'; },
      {
        mistakes: {
          neg: function (v) { return v.a - v.b; },
          sum: function (v) { return v.a + v.b; }
        },
        feedback: [
          { when: 'neg', say: 'Casi: el determinante es $y_1 y_2\' - y_1\' y_2 = b - a$ en $x=0$.' },
          { when: 'sum', say: 'Casi: en el determinante los productos cruzados se restan, no se suman.' }
        ]
      }),

    N('wr-num-euler-potencias', 'wronskiano', 2,
      { m: [1, 3, 1], n: [4, 7, 1] },
      function (v) { return 'Para las soluciones linealmente independientes $y_1 = x^{' + v.m + '}$ y $y_2 = x^{' + v.n + '}$ ($x > 0$), halla el valor de $W(1)$.'; },
      function (v) { return v.n - v.m; },
      function (v) { return 'W(x) = (' + v.n + ' - ' + v.m + ')x^{' + (v.m + v.n - 1) + '}, por lo que en x = 1 vale ' + (v.n - v.m) + '.'; },
      {
        mistakes: {
          sign: function (v) { return v.m - v.n; },
          prod: function (v) { return v.m * v.n; }
        },
        feedback: [
          { when: 'sign', say: 'Revisa el orden en $y_1 y_2\' - y_1\' y_2 = n - m$.' },
          { when: 'prod', say: 'Las derivadas se multiplican cruzadas y se restan: $n - m$, no $m \\times n$.' }
        ]
      }),

    N('wr-num-abel-razon', 'wronskiano', 2,
      { b: [1, 4, 1] },
      function (v) { return 'Si $y_1, y_2$ resuelven $y\'\' + ' + v.b + 'y\' + 2y = 0$, calcula la razón $\\dfrac{W(0)}{W(1)}$.'; },
      function (v) { return Math.exp(v.b); },
      function (v) { return 'Por Abel, W(x) = W(0)e^{-' + v.b + 'x}, así que la razón invertida en x = 1 es e^{' + v.b + '} \\approx ' + fx(Math.exp(v.b), 2) + '.'; },
      {
        mistakes: {
          neg: function (v) { return Math.exp(-v.b); },
          linear: function (v) { return 1 + v.b; }
        },
        feedback: [
          { when: 'neg', say: 'Casi: esa es $W(1)/W(0)$; se pide la razón $W(0)/W(1) = e^b$.' },
          { when: 'linear', say: 'Casi: la relación es exponencial, no lineal.' }
        ]
      }),

    N('wr-num-u1p-eval-pol', 'wronskiano', 2,
      { c: [2, 6, 1], x0: [2, 5, 1] },
      function (v) { return 'Con base $y_1 = x$, $y_2 = x^2$ ($W = x^2$) y término fuente $g(x) = ' + v.c + 'x$, evalúa numéricamente $u_1\'(' + v.x0 + ')$.'; },
      function (v) { return -v.c * v.x0; },
      function (v) { return 'u_1\'(x) = -\\frac{x^2 \\cdot ' + v.c + 'x}{x^2} = -' + v.c + 'x, que en x = ' + v.x0 + ' es ' + (-v.c * v.x0) + '.'; },
      {
        mistakes: {
          sign: function (v) { return v.c * v.x0; },
          sq: function (v) { return -v.c * v.x0 * v.x0; }
        },
        feedback: [
          { when: 'sign', say: 'Casi: $u_1\'$ lleva signo menos en el numerador de Cramer.' },
          { when: 'sq', say: 'El término $x^2$ de $y_2$ se cancela con el Wronskiano $x^2$, dejando solo $-c x$.' }
        ]
      }),

    N('wr-num-u2p-eval-pol', 'wronskiano', 2,
      { c: [3, 8, 1], x0: [2, 5, 1] },
      function (v) { return 'Para las mismas funciones $y_1 = x$, $y_2 = x^2$ ($W = x^2$) y $g(x) = ' + v.c + 'x$, ¿cuánto vale $u_2\'(' + v.x0 + ')$?'; },
      function (v) { return v.c; },
      function (v) { return 'u_2\'(x) = \\frac{x \\cdot ' + v.c + 'x}{x^2} = ' + v.c + ', constante en cualquier x.'; },
      {
        mistakes: {
          neg: function (v) { return -v.c; },
          timesX: function (v) { return v.c * v.x0; }
        },
        feedback: [
          { when: 'neg', say: 'Casi: $u_2\'$ no lleva signo menos.' },
          { when: 'timesX', say: 'Las potencias de $x$ se cancelan por completo: $\\frac{x \\cdot cx}{x^2} = c$.' }
        ]
      }),

    N('wr-num-eval-cociente-u', 'wronskiano', 2,
      { k: [2, 5, 1] },
      function (v) { return 'Para cualquier ecuación diferencial con base $y_1 = x$ y $y_2 = x^{' + v.k + '}$, evalúa el cociente $\\dfrac{u_1\'(2)}{u_2\'(2)}$.'; },
      function (v) { return -Math.pow(2, v.k - 1); },
      function (v) { return 'Al dividir las expresiones de Cramer, g y W se cancelan: u_1\'/u_2\' = -y_2/y_1 = -x^{' + (v.k - 1) + '}, que en x = 2 vale ' + (-Math.pow(2, v.k - 1)) + '.'; },
      {
        mistakes: {
          pos: function (v) { return Math.pow(2, v.k - 1); },
          inv: function (v) { return -1 / Math.pow(2, v.k - 1); }
        },
        feedback: [
          { when: 'pos', say: 'Casi: el cociente $u_1\'/u_2\' = -y_2/y_1$ lleva signo negativo.' },
          { when: 'inv', say: 'Casi: el cociente es $-y_2/y_1$, no $-y_1/y_2$.' }
        ]
      }),

    N('wr-num-w-orden3-simple', 'wronskiano', 2,
      { k: [2, 8, 1] },
      function (v) { return 'Determina el valor en $x = 0$ del Wronskiano de las funciones $y_1 = 1$ y $y_2 = e^{' + v.k + 'x}$.'; },
      function (v) { return v.k; },
      function (v) { return 'W(x) = 1 \\cdot ' + v.k + 'e^{' + v.k + 'x} - 0 = ' + v.k + 'e^{' + v.k + 'x}, que en x = 0 vale ' + v.k + '.'; },
      {
        mistakes: {
          one: function (v) { return 1; },
          zero: function (v) { return 0; }
        },
        feedback: [
          { when: 'one', say: 'La derivada de $e^{kx}$ aporta un factor $k$ en $x=0$.' },
          { when: 'zero', say: 'Las funciones son linealmente independientes, su Wronskiano no se anula.' }
        ]
      }),

    E('wr-expr-w-seno-hiperbolico', 'wronskiano', 3,
      { k: [1, 4, 1] },
      function (v) { return 'Escribe la expresión reducida del Wronskiano $W(x)$ para el conjunto fundamental con raíz repetida $y_1 = e^{' + v.k + 'x}$ y $y_2 = x e^{' + v.k + 'x}$.'; },
      function (v) { return 'e^(' + (2 * v.k) + '*x)'; },
      function (v) { return 'W = e^{' + v.k + 'x}(e^{' + v.k + 'x} + ' + v.k + 'x e^{' + v.k + 'x}) - (' + v.k + 'e^{' + v.k + 'x})(x e^{' + v.k + 'x}) = e^{' + (2 * v.k) + 'x}.'; },
      {
        domain: [0.2, 1.5],
        mistakes: {
          sqK: function (v) { return 'e^(' + v.k + '*x)'; },
          withX: function (v) { return 'x*e^(' + (2 * v.k) + '*x)'; }
        },
        feedback: [
          { when: 'sqK', say: 'Al multiplicar $e^{kx} \\cdot e^{kx}$ los exponentes se suman: $2kx$.' },
          { when: 'withX', say: 'El término con $x$ se cancela en la resta de productos cruzados.' }
        ]
      }),

    E('wr-expr-u2p-gen', 'wronskiano', 3,
      { k: [1, 4, 1] },
      function (v) { return 'Para la ecuación $y\'\' - ' + (v.k * v.k) + 'y = e^{' + v.k + 'x}$ con $y_1 = e^{' + v.k + 'x}$ y $y_2 = e^{-' + v.k + 'x}$ ($W = -' + (2 * v.k) + '$), escribe la derivada auxiliar $u_2\'(x)$.'; },
      function (v) { return '-(1/' + (2 * v.k) + ')*e^(' + (2 * v.k) + '*x)'; },
      function (v) { return 'u_2\' = \\frac{y_1 g}{W} = \\frac{e^{' + v.k + 'x} e^{' + v.k + 'x}}{-' + (2 * v.k) + '} = -\\frac{1}{' + (2 * v.k) + '}e^{' + (2 * v.k) + 'x}.'; },
      {
        domain: [0.1, 1.0],
        mistakes: {
          sign: function (v) { return '(1/' + (2 * v.k) + ')*e^(' + (2 * v.k) + '*x)'; },
          noW: function (v) { return '-e^(' + (2 * v.k) + '*x)'; }
        },
        feedback: [
          { when: 'sign', say: 'Casi: recuerda que $W = -2k$ es negativo, lo que cambia el signo de $u_2\'.' },
          { when: 'noW', say: 'Falta dividir entre el Wronskiano $W = -2k$.' }
        ]
      }),

    E('wr-expr-u1p-gen-k', 'wronskiano', 3,
      { k: [1, 3, 1] },
      function (v) { return 'Para la ecuación $y\'\' - ' + (v.k * v.k) + 'y = e^{' + (2 * v.k) + 'x}$ con $y_1 = e^{' + v.k + 'x}$ y $y_2 = e^{-' + v.k + 'x}$ ($W = -' + (2 * v.k) + '$), halla la expresión de $u_1\'(x)$.'; },
      function (v) { return '(1/' + (2 * v.k) + ')*e^(' + v.k + '*x)'; },
      function (v) { return 'u_1\' = -\\frac{e^{-' + v.k + 'x} e^{' + (2 * v.k) + 'x}}{-' + (2 * v.k) + '} = \\frac{1}{' + (2 * v.k) + '}e^{' + v.k + 'x}.'; },
      {
        domain: [0.1, 1.0],
        mistakes: {
          sign: function (v) { return '-(1/' + (2 * v.k) + ')*e^(' + v.k + '*x)'; },
          noW: function (v) { return 'e^(' + v.k + '*x)'; }
        },
        feedback: [
          { when: 'sign', say: 'El signo menos de la fórmula se cancela con el signo negativo del Wronskiano $W = -2k$.' },
          { when: 'noW', say: 'Divide entre el valor del Wronskiano $W = -2k$.' }
        ]
      }),

    /* ======================= 3. Funciones trigonométricas no tabuladas (17) ======================= */
    C('tr-por-que-variacion', 'trig', 1,
      '¿Por qué para resolver $y\'\' + y = \\sec x$ es indispensable usar variación de parámetros en lugar de coeficientes indeterminados?',
      'Porque $\\sec x$ tiene infinitas derivadas linealmente independientes (no se cierra su familia de derivadas)', [
        ['Porque $\\sec x$ es una función discontinua en todo su dominio real', 'Casi: $\\sec x$ es continua en $(-\\pi/2, \\pi/2)$, pero sus derivadas sucesivas $\\sec x\\tan x, \\sec^3 x + \\sec x\\tan^2 x, \\dots$ generan infinitas funciones nuevas.'],
        ['Porque la ecuación homogénea asociada no tiene soluciones reales', 'Casi: la solución homogénea es simplemente $c_1\\cos x + c_2\\sin x$.'],
        ['Porque los coeficientes de la ecuación diferencial son funciones variables', 'Casi: los coeficientes son constantes ($1$ y $1$), pero la función no homogénea no está en la tabla de derivadas finitas.']],
      'El método de coeficientes indeterminados requiere un conjunto finito cerrado bajo derivación (polinomios, exponenciales, senos y cosenos); las derivadas de $\\sec x$ crecen indefinidamente.'),

    C('tr-yp-secante', 'trig', 1,
      'Para la ecuación diferencial clásica $y\'\' + y = \\sec x$ en el intervalo $(-\\pi/2, \\pi/2)$, ¿cuál es la solución particular $y_p$?',
      '$y_p = x\\sin x + \\cos x\\,\\ln(\\cos x)$', [
        ['$y_p = x\\cos x + \\sin x\\,\\ln(\\sin x)$', 'Casi: el término lineal acompaña a $\\sin x$ y el logaritmo multiplica a $\\cos x$.'],
        ['$y_p = \\sec x\\,\\tan x$', 'Casi: eso es la derivada de $\\sec x$, no una solución de la ecuación diferencial.'],
        ['$y_p = -\\cos x\\,\\ln(\\sec x + \\tan x)$', 'Casi: esa corresponde a la ecuación con lado derecho $\\tan x$.']],
      'Con $u_1\' = -\\tan x$ ($u_1 = \\ln(\\cos x)$) y $u_2\' = 1$ ($u_2 = x$), $y_p = u_1\\cos x + u_2\\sin x = \\cos x\\ln(\\cos x) + x\\sin x$.'),

    C('tr-yp-tangente', 'trig', 1,
      'Para la ecuación $y\'\' + y = \\tan x$, ¿cuál es la solución particular $y_p$ simplificada?',
      '$y_p = -\\cos x\\,\\ln(\\sec x + \\tan x)$', [
        ['$y_p = \\sin x\\,\\ln(\\cos x)$', 'Casi: al simplificar $y_p = u_1\\cos x + u_2\\sin x$, el término $\\sin x\\cos x$ se cancela con $-\\cos x\\sin x$.'],
        ['$y_p = \\ln(\\sec x)$', 'Casi: una solución particular debe involucrar las funciones de la base homogénea.'],
        ['$y_p = x\\tan x$', 'Casi: al derivar $x\\tan x$ dos veces no se recupera $\\tan x$.']],
      'Al integrar se obtiene $u_1 = \\sin x - \\ln(\\sec x + \\tan x)$ y $u_2 = -\\cos x$; al armar $y_p$, el término $\\sin x\\cos x$ se cancela.'),

    C('tr-yp-cosecante', 'trig', 1,
      'Para la ecuación diferencial $y\'\' + y = \\csc x$ en $(0, \\pi)$, ¿cuál es la solución particular obtenida por variación de parámetros?',
      '$y_p = -x\\cos x + \\sin x\\,\\ln(\\sin x)$', [
        ['$y_p = x\\sin x - \\cos x\\,\\ln(\\cos x)$', 'Casi: aquí $u_1\' = -\\sin x\\csc x = -1 \\implies u_1 = -x$, que multiplica a $\\cos x$.'],
        ['$y_p = -\\sin x\\,\\ln(\\csc x + \\cot x)$', 'Casi: esa forma no corresponde a las integrales de $u_1\'$ y $u_2\'$ para $\\csc x$.'],
        ['$y_p = \\csc x + \\cot x$', 'Casi: no satisface la ecuación al sustituir sus derivadas.']],
      'Con $W = 1$: $u_1\' = -\\sin x\\csc x = -1 \\implies u_1 = -x$; $u_2\' = \\cos x\\csc x = \\cot x \\implies u_2 = \\ln(\\sin x)$.'),

    C('tr-yp-cotangente', 'trig', 1,
      'En la ecuación $y\'\' + y = \\cot x$ sobre $(0, \\pi)$, la solución particular simplificada viene dada por:',
      '$y_p = \\sin x\\,\\ln(\\csc x - \\cot x)$', [
        ['$y_p = \\cos x\\,\\ln(\\sin x)$', 'Casi: al integrar $u_2\' = \\cos x\\cot x = \\csc x - \\sin x$ aparece $\\ln|\\csc x - \\cot x| + \\cos x$, y los términos cruzados se cancelan.'],
        ['$y_p = -x\\sin x$', 'Casi: no produce $\\cot x$ al sustituir en el lado izquierdo.'],
        ['$y_p = \\cot x\\,\\ln(\\sec x)$', 'Casi: no es solución particular válida.']],
      '$u_1\' = -\\cos x \\implies u_1 = -\\sin x$; $u_2\' = \\csc x - \\sin x \\implies u_2 = \\ln(\\csc x - \\cot x) + \\cos x$; armando $y_p$, se cancela $\\sin x\\cos x$.'),

    N('tr-eval-u1p-sec', 'trig', 2,
      { k: [2, 6, 1] },
      function (v) { return 'Para la ecuación $y\'\' + ' + (v.k * v.k) + 'y = \\sec(' + v.k + 'x)$, calcula el valor numérico de $u_1\'(x)$ evaluado en $x = \\dfrac{\\pi}{' + (4 * v.k) + '}$.'; },
      function (v) { return -1 / v.k; },
      function (v) { return 'u_1\'(x) = -\\frac{\\tan(' + v.k + 'x)}{' + v.k + '}. En x = \\pi/' + (4 * v.k) + ', \\tan(\\pi/4) = 1, dando -1/' + v.k + ' = ' + fx(-1 / v.k, 4) + '.'; },
      {
        mistakes: {
          pos: function (v) { return 1 / v.k; },
          noW: function (v) { return -1; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: la derivada $u_1\'$ lleva signo negativo: $-\\frac{1}{k}\\tan(kx)$.' },
          { when: 'noW', say: 'Olvidaste dividir entre el Wronskiano $W = k$.' }
        ]
      }),

    N('tr-eval-u2p-sec', 'trig', 2,
      { k: [2, 6, 1] },
      function (v) { return 'Para la misma ecuación $y\'\' + ' + (v.k * v.k) + 'y = \\sec(' + v.k + 'x)$, ¿cuánto vale $u_2\'(x)$ para cualquier punto en su dominio?'; },
      function (v) { return 1 / v.k; },
      function (v) { return 'u_2\'(x) = \\frac{\\cos(' + v.k + 'x)\\sec(' + v.k + 'x)}{' + v.k + '} = \\frac{1}{' + v.k + '}.'; },
      {
        mistakes: {
          neg: function (v) { return -1 / v.k; },
          one: function (v) { return 1; }
        },
        feedback: [
          { when: 'neg', say: '$u_2\'$ no lleva signo negativo.' },
          { when: 'one', say: 'Recuerda dividir entre el Wronskiano $W = k$.' }
        ]
      }),

    N('tr-eval-yp-sec-cero', 'trig', 2,
      { c: [2, 6, 1] },
      function (v) { return 'Para la ecuación diferencial $y\'\' + y = ' + v.c + '\\sec x$, calcula el valor numérico de la solución particular canónica $y_p(1)$ (con $x$ en radianes).'; },
      function (v) { return v.c * (Math.sin(1) + Math.cos(1) * Math.log(Math.cos(1))); },
      function (v) { return 'y_p(1) = ' + v.c + '(\\sin 1 + \\cos 1 \\ln(\\cos 1)) \\approx ' + fx(v.c * (Math.sin(1) + Math.cos(1) * Math.log(Math.cos(1))), 4) + '.'; },
      {
        mistakes: {
          onlySin: function (v) { return v.c * Math.sin(1); },
          signLog: function (v) { return v.c * (Math.sin(1) - Math.cos(1) * Math.log(Math.cos(1))); }
        },
        feedback: [
          { when: 'onlySin', say: 'Olvidaste el término $\\cos(1)\\ln(\\cos 1)$.' },
          { when: 'signLog', say: 'Revisa el signo del término logarítmico: $y_p = x\\sin x + \\cos x\\ln(\\cos x)$.' }
        ]
      }),

    N('tr-eval-u1p-csc', 'trig', 2,
      { k: [2, 5, 1], c: [2, 8, 2] },
      function (v) { return 'Para la ecuación $y\'\' + ' + (v.k * v.k) + 'y = ' + v.c + '\\csc(' + v.k + 'x)$, calcula la derivada $u_1\'(x)$.'; },
      function (v) { return -v.c / v.k; },
      function (v) { return 'u_1\'(x) = -\\frac{\\sin(' + v.k + 'x)(' + v.c + '\\csc(' + v.k + 'x))}{' + v.k + '} = -' + fx(v.c / v.k, 2) + '.'; },
      {
        mistakes: {
          pos: function (v) { return v.c / v.k; },
          noW: function (v) { return -v.c; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: recuerda el signo menos en la fórmula de $u_1\'.' },
          { when: 'noW', say: 'Divide entre el Wronskiano $W = k$.' }
        ]
      }),

    N('tr-eval-u2p-csc-cot', 'trig', 2,
      { k: [9, 13, 1] },
      function (v) { return 'Dada la ecuación $y\'\' + ' + (v.k * v.k) + 'y = \\csc(' + v.k + 'x)$, evalúa numéricamente $u_2\'(x)$ en el punto $x = \\dfrac{\\pi}{' + (4 * v.k) + '}$.'; },
      function (v) { return 1 / v.k; },
      function (v) { return 'u_2\'(x) = \\frac{\\cot(' + v.k + 'x)}{' + v.k + '}. En x = \\pi/' + (4 * v.k) + ', \\cot(\\pi/4) = 1, dando 1/' + v.k + ' = ' + fx(1 / v.k, 4) + '.'; },
      {
        mistakes: {
          neg: function (v) { return -1 / v.k; },
          noW: function (v) { return 1; }
        },
        feedback: [
          { when: 'neg', say: '$u_2\'$ lleva signo positivo en Cramer.' },
          { when: 'noW', say: 'Falta dividir entre el Wronskiano $W = k$.' }
        ]
      }),

    N('tr-eval-yp-tan-pto', 'trig', 2,
      { c: [2, 6, 1] },
      function (v) { return 'Para la ecuación diferencial $y\'\' + y = ' + v.c + '\\tan x$, calcula el valor de la solución particular $y_p(0.5)$ (ángulos en radianes).'; },
      function (v) { return -v.c * Math.cos(0.5) * Math.log(1 / Math.cos(0.5) + Math.tan(0.5)); },
      function (v) { return 'y_p(0.5) = -' + v.c + '\\cos(0.5)\\ln(\\sec 0.5 + \\tan 0.5) \\approx ' + fx(-v.c * Math.cos(0.5) * Math.log(1 / Math.cos(0.5) + Math.tan(0.5)), 4) + '.'; },
      {
        mistakes: {
          pos: function (v) { return v.c * Math.cos(0.5) * Math.log(1 / Math.cos(0.5) + Math.tan(0.5)); },
          noCos: function (v) { return -v.c * Math.log(1 / Math.cos(0.5) + Math.tan(0.5)); }
        },
        feedback: [
          { when: 'pos', say: 'Casi: recuerda el signo negativo: $y_p = -c\\cos x\\ln(\\sec x + \\tan x)$.' },
          { when: 'noCos', say: 'Olvidaste multiplicar por la solución homogénea $\\cos x$.' }
        ]
      }),

    N('tr-eval-tan-pvi-derivada', 'trig', 2,
      { a: [2, 6, 1] },
      function (v) { return 'Resuelve el PVI $y\'\' + y = ' + v.a + '\\tan x$ con $y(0) = 0$ y $y\'(0) = 0$, y halla el valor de $y(1)$ (en radianes).'; },
      function (v) { return v.a * (Math.sin(1) - Math.cos(1) * Math.log(1 / Math.cos(1) + Math.tan(1))); },
      function (v) { return 'La solución es y(x) = ' + v.a + '(\\sin x - \\cos x\\ln(\\sec x + \\tan x)), que en x = 1 vale ' + fx(v.a * (Math.sin(1) - Math.cos(1) * Math.log(1 / Math.cos(1) + Math.tan(1))), 4) + '.'; },
      {
        mistakes: {
          onlyYp: function (v) { return -v.a * Math.cos(1) * Math.log(1 / Math.cos(1) + Math.tan(1)); },
          sign: function (v) { return v.a * (Math.sin(1) + Math.cos(1) * Math.log(1 / Math.cos(1) + Math.tan(1))); }
        },
        feedback: [
          { when: 'onlyYp', say: 'Falta la solución de la homogénea $c_2\\sin x = a\\sin x$ necesaria para cumplir $y\'(0)=0$.' },
          { when: 'sign', say: 'Revisa el signo de la solución particular.' }
        ]
      }),

    N('tr-eval-u1-csc-integral', 'trig', 2,
      { x0: [2, 8, 2] },
      function (v) { return 'Para la ecuación $y\'\' + 4y = \\csc 2x$, calcula el valor de la función de coeficiente $u_1(' + v.x0 + ')$ tomando constante de integración cero.'; },
      function (v) { return -v.x0 / 2; },
      function (v) { return 'u_1\' = -\\frac{\\sin 2x\\csc 2x}{2} = -\\frac{1}{2} \\;\\Rightarrow\\; u_1(x) = -\\frac{x}{2}, que en x = ' + v.x0 + ' da ' + (-v.x0 / 2) + '.'; },
      {
        mistakes: {
          pos: function (v) { return v.x0 / 2; },
          noW: function (v) { return -v.x0; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: $u_1\'(x) = -1/2$, por lo que su antiderivada es $-x/2$.' },
          { when: 'noW', say: 'Falta dividir entre el Wronskiano $W = 2$.' }
        ]
      }),

    E('tr-expr-yp-sec-k', 'trig', 3,
      { k: [1, 3, 1] },
      function (v) { return 'Escribe la expresión de la solución particular $y_p(x)$ para $y\'\' + ' + (v.k * v.k) + 'y = \\sec(' + v.k + 'x)$ en $(-\\pi/' + (2 * v.k) + ', \\pi/' + (2 * v.k) + ')$.'; },
      function (v) { return '(x/' + v.k + ')*sin(' + v.k + '*x) + (1/' + (v.k * v.k) + ')*cos(' + v.k + '*x)*log(cos(' + v.k + '*x))'; },
      function (v) { return 'Con W = ' + v.k + ', u_1 = \\frac{1}{' + (v.k * v.k) + '}\\ln(\\cos ' + v.k + 'x) y u_2 = \\frac{x}{' + v.k + '}.'; },
      {
        domain: [0.1, 0.4],
        mistakes: {
          noK: function (v) { return 'x*sin(' + v.k + '*x) + cos(' + v.k + '*x)*log(cos(' + v.k + '*x))'; },
          sign: function (v) { return '(x/' + v.k + ')*sin(' + v.k + '*x) - (1/' + (v.k * v.k) + ')*cos(' + v.k + '*x)*log(cos(' + v.k + '*x))'; }
        },
        feedback: [
          { when: 'noK', say: 'Faltan los factores $1/k$ y $1/k^2$ procedentes del Wronskiano y la integración.' },
          { when: 'sign', say: 'La integral de $-\\tan(kx)$ es $+\\frac{1}{k}\\ln(\\cos(kx))$.' }
        ]
      }),

    E('tr-expr-yp-csc-k', 'trig', 3,
      { k: [1, 3, 1] },
      function (v) { return 'Escribe la expresión de la solución particular $y_p(x)$ para $y\'\' + ' + (v.k * v.k) + 'y = \\csc(' + v.k + 'x)$ en $(0, \\pi/' + v.k + ')$.'; },
      function (v) { return '-(x/' + v.k + ')*cos(' + v.k + '*x) + (1/' + (v.k * v.k) + ')*sin(' + v.k + '*x)*log(sin(' + v.k + '*x))'; },
      function (v) { return 'u_1 = -x/' + v.k + ' y u_2 = \\frac{1}{' + (v.k * v.k) + '}\\ln(\\sin ' + v.k + 'x), dando y_p = -\\frac{x\\cos ' + v.k + 'x}{' + v.k + '} + \\frac{\\sin ' + v.k + 'x\\ln(\\sin ' + v.k + 'x)}{' + (v.k * v.k) + '}.'; },
      {
        domain: [0.5, 0.9],
        mistakes: {
          pos: function (v) { return '(x/' + v.k + ')*cos(' + v.k + '*x) + (1/' + (v.k * v.k) + ')*sin(' + v.k + '*x)*log(sin(' + v.k + '*x))'; },
          noK: function (v) { return '-x*cos(' + v.k + '*x) + sin(' + v.k + '*x)*log(sin(' + v.k + '*x))'; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: recuerda que $u_1\' = -1/k$, por lo que el primer término es negativo.' },
          { when: 'noK', say: 'Divide entre las potencias correspondientes de $k$.' }
        ]
      }),

    E('tr-expr-u1p-tan-k', 'trig', 3,
      { k: [1, 3, 1] },
      function (v) { return 'Para la ecuación $y\'\' + ' + (v.k * v.k) + 'y = \\tan(' + v.k + 'x)$, escribe la derivada $u_1\'(x)$ expresada en términos de $\\cos(' + v.k + 'x)$ y $\\sec(' + v.k + 'x)$.'; },
      function (v) { return '(1/' + v.k + ')*(cos(' + v.k + '*x) - sec(' + v.k + '*x))'; },
      function (v) { return 'u_1\' = -\\frac{\\sin^2 ' + v.k + 'x}{' + v.k + '\\cos ' + v.k + 'x} = \\frac{1}{' + v.k + '}(\\cos ' + v.k + 'x - \\sec ' + v.k + 'x).'; },
      {
        domain: [0.1, 0.4],
        mistakes: {
          inv: function (v) { return '(1/' + v.k + ')*(sec(' + v.k + '*x) - cos(' + v.k + '*x))'; },
          noW: function (v) { return 'cos(' + v.k + '*x) - sec(' + v.k + '*x)'; }
        },
        feedback: [
          { when: 'inv', say: 'Casi: $-\\sin^2(kx) = \\cos^2(kx) - 1$, por lo que queda $\\cos(kx) - \\sec(kx)$.' },
          { when: 'noW', say: 'Divide entre el Wronskiano $W = k$.' }
        ]
      }),

    E('tr-expr-u2p-tan-k', 'trig', 3,
      { k: [1, 4, 1] },
      function (v) { return 'Para la misma ecuación $y\'\' + ' + (v.k * v.k) + 'y = \\tan(' + v.k + 'x)$, escribe la derivada auxiliar $u_2\'(x)$.'; },
      function (v) { return '(1/' + v.k + ')*sin(' + v.k + '*x)'; },
      function (v) { return 'u_2\' = \\frac{\\cos ' + v.k + 'x\\tan ' + v.k + 'x}{' + v.k + '} = \\frac{1}{' + v.k + '}\\sin(' + v.k + 'x).'; },
      {
        domain: [0.1, 1.2],
        mistakes: {
          neg: function (v) { return '-(1/' + v.k + ')*sin(' + v.k + '*x)'; },
          noW: function (v) { return 'sin(' + v.k + '*x)'; }
        },
        feedback: [
          { when: 'neg', say: '$u_2\'$ no lleva signo menos en la fórmula.' },
          { when: 'noW', say: 'Divide entre el Wronskiano $W = k$.' }
        ]
      }),

    /* ======================= 4. Logaritmos y funciones racionales (16) ======================= */
    C('lr-absorcion-homogenea', 'log-rac', 1,
      'Al resolver $y\'\' - 2y\' + y = \\dfrac{e^x}{x}$, se obtiene $y_p = -x e^x + x e^x \\ln x$. ¿Por qué se puede prescindir del término $-x e^x$ y reportar simplemente $y_p = x e^x \\ln x$?',
      'Porque $-x e^x$ es un múltiplo constante de la solución homogénea $y_2 = x e^x$ y se absorbe en $c_2 y_2$', [
        ['Porque $-x e^x$ se anula para todo $x > 0$', 'Casi: no se anula; es una función no nula que ya forma parte de la base del espacio homogéneo.'],
        ['Porque los términos con signo negativo siempre se descartan en variación de parámetros', 'Casi: los signos son fundamentales; solo se descartan términos que pertenezcan a la solución homogénea.'],
        ['Porque al sustituir $-x e^x$ en la ecuación diferencial original produce infinito', 'Casi: al sustituirlo da exactamente 0 porque es solución de la homogénea.']],
      'Cualquier término que resuelva la homogénea asociada puede absorberse en la combinación lineal $c_1 y_1 + c_2 y_2$.'),

    C('lr-g-fraccion-exponencial', 'log-rac', 1,
      '¿Por qué una función como $g(x) = \\dfrac{e^x}{x}$ no puede abordarse mediante el método de coeficientes indeterminados?',
      'Porque la división entre $x$ genera potencias crecientes en el denominador al derivar ($x^{-1}, x^{-2}, x^{-3}, \\dots$), impidiendo un conjunto finito', [
        ['Porque la función exponencial $e^x$ no es diferenciable', 'Casi: $e^x$ es infinitamente diferenciable.'],
        ['Porque la ecuación diferencial deja de ser lineal si el lado derecho tiene una fracción', 'Casi: la linealidad de la EDO solo exige que $y, y\', y\'\'$ aparezcan linealmente; $g(x)$ puede ser cualquier función de $x$.'],
        ['Porque solo las funciones polinomiales admiten solución particular', 'Casi: existen soluciones particulares para cualquier $g(x)$ integrable.']],
      'La regla del cociente genera derivadas de la forma $e^x(x^{-1} - x^{-2})$, $e^x(x^{-1} - 2x^{-2} + 2x^{-3})$, que no cierran un espacio de dimensión finita.'),

    C('lr-solucion-integral-definida', 'log-rac', 1,
      'Si la integral para calcular $u_1(x)$ no puede expresarse en términos de funciones elementales (por ejemplo con $g(x) = \\dfrac{1}{x}$), ¿qué se hace?',
      'Se deja la solución particular expresada en forma integral con límite variable: $y_p(x) = -y_1(x)\\int_{x_0}^x \\frac{y_2(t)g(t)}{W(t)}dt + y_2(x)\\int_{x_0}^x \\frac{y_1(t)g(t)}{W(t)}dt$', [
        ['Se concluye que la ecuación diferencial no tiene solución', 'Casi: el teorema de existencia garantiza que sí existe solución si los coeficientes y $g$ son continuos.'],
        ['Se sustituye $1/x$ por su valor promedio en el intervalo', 'Casi: eso cambiaría la ecuación diferencial por otra completamente diferente.'],
        ['Se cambia la variable dependiente $y$ por $1/y$', 'Casi: esa transformación volvería no lineal a la ecuación.']],
      'Una solución expresada mediante integrales definidas de funciones continuas es perfectamente válida y exacta.'),

    C('lr-logaritmo-w', 'log-rac', 1,
      'Para la ecuación diferencial $y\'\' + y = \\ln x$ ($x > 0$), con base $y_1 = \\cos x$ y $y_2 = \\sin x$ ($W = 1$), ¿cuál es la expresión de $u_2\'(x)$?',
      '$u_2\'(x) = \\cos x\\,\\ln x$', [
        ['$u_2\'(x) = -\\sin x\\,\\ln x$', 'Casi: esa es $u_1\'(x)$, que lleva signo negativo y utiliza $y_2$.'],
        ['$u_2\'(x) = \\dfrac{\\cos x}{x}$', 'Casi: no se deriva el logaritmo; en $u_2\' = y_1 g / W$ se multiplica por $g(x) = \\ln x$.'],
        ['$u_2\'(x) = \\ln(\\cos x)$', 'Casi: es el producto $\\cos x \\cdot \\ln x$, no la composición.']],
      'Por la fórmula de Cramer: $u_2\' = \\frac{y_1 g}{W} = \\frac{\\cos x \\ln x}{1} = \\cos x \\ln x$.'),

    C('lr-logaritmo-u1p', 'log-rac', 1,
      'Para la misma ecuación $y\'\' + y = \\ln x$, ¿cuál es la expresión de $u_1\'(x)$?',
      '$u_1\'(x) = -\\sin x\\,\\ln x$', [
        ['$u_1\'(x) = \\sin x\\,\\ln x$', 'Casi: falta el signo menos que prescribe la regla de Cramer para la primera variable.'],
        ['$u_1\'(x) = -\\cos x\\,\\ln x$', 'Casi: la fórmula de $u_1\'$ usa $y_2 = \\sin x$, no $y_1$.'],
        ['$u_1\'(x) = -\\dfrac{\\sin x}{x}$', 'Casi: no se deriva $\\ln x$; se multiplica directamente por $g(x) = \\ln x$.']],
      '$u_1\' = -\\frac{y_2 g}{W} = -\\frac{\\sin x \\ln x}{1} = -\\sin x \\ln x$.'),

    N('lr-eval-yp-ex-sobre-x', 'log-rac', 2,
      { c: [2, 5, 1] },
      function (v) { return 'Para la ecuación diferencial $y\'\' - 2y\' + y = ' + v.c + '\\dfrac{e^x}{x}$ ($x > 0$), calcula el valor de la solución particular $y_p(2)$ (sin incluir términos de $y_h$).'; },
      function (v) { return v.c * 2 * Math.exp(2) * Math.log(2); },
      function (v) { return 'y_p(2) = ' + v.c + ' \\cdot 2e^2 \\ln 2 \\approx ' + fx(v.c * 2 * Math.exp(2) * Math.log(2), 2) + '.'; },
      {
        mistakes: {
          noX: function (v) { return v.c * Math.exp(2) * Math.log(2); },
          noLog: function (v) { return v.c * 2 * Math.exp(2); }
        },
        feedback: [
          { when: 'noX', say: 'Olvidaste el factor $x$ frente a la exponencial: $y_p = c x e^x \\ln x$.' },
          { when: 'noLog', say: 'Falta el factor logarítmico $\\ln x$.' }
        ]
      }),

    N('lr-eval-u1p-ex-sobre-x', 'log-rac', 2,
      { c: [2, 8, 1] },
      function (v) { return 'Para la ecuación $y\'\' - 2y\' + y = ' + v.c + '\\dfrac{e^x}{x}$, ¿cuánto vale la derivada auxiliar $u_1\'(x)$ para cualquier $x > 0$?'; },
      function (v) { return -v.c; },
      function (v) { return 'u_1\' = -\\frac{(xe^x)(' + v.c + 'e^x/x)}{e^{2x}} = -' + v.c + '.'; },
      {
        mistakes: {
          pos: function (v) { return v.c; },
          withX: function (v) { return -v.c * 2; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: recuerda el signo menos en $u_1\' = -y_2 g / W$.' },
          { when: 'withX', say: 'Las variables $x$ y las exponenciales se cancelan por completo, dando una constante.' }
        ]
      }),

    N('lr-eval-u2p-ex-sobre-x', 'log-rac', 2,
      { c: [3, 9, 2] },
      function (v) { return 'Para la misma ecuación $y\'\' - 2y\' + y = ' + v.c + '\\dfrac{e^x}{x}$, calcula el valor numérico de $u_2\'(4)$.'; },
      function (v) { return v.c / 4; },
      function (v) { return 'u_2\'(x) = \\frac{e^x(' + v.c + 'e^x/x)}{e^{2x}} = \\frac{' + v.c + '}{x}, que en x = 4 vale ' + fx(v.c / 4, 2) + '.'; },
      {
        mistakes: {
          neg: function (v) { return -v.c / 4; },
          mult: function (v) { return v.c * 4; }
        },
        feedback: [
          { when: 'neg', say: '$u_2\'$ lleva signo positivo.' },
          { when: 'mult', say: 'El término $x$ queda en el denominador: $c/x$.' }
        ]
      }),

    N('lr-eval-yp-ex-sobre-x2', 'log-rac', 2,
      { c: [2, 6, 1] },
      function (v) { return 'Dada la ecuación $y\'\' - 2y\' + y = ' + v.c + '\\dfrac{e^x}{x^2}$ ($x > 0$), calcula el valor de la solución particular simplificada $y_p(2)$ (sin el término de $y_h$).'; },
      function (v) { return -v.c * Math.exp(2) * Math.log(2); },
      function (v) { return 'y_p(2) = -' + v.c + 'e^2\\ln 2 \\approx ' + fx(-v.c * Math.exp(2) * Math.log(2), 2) + '.'; },
      {
        mistakes: {
          pos: function (v) { return v.c * Math.exp(2) * Math.log(2); },
          extra: function (v) { return -v.c * Math.exp(2) * Math.log(2) - v.c * Math.exp(2); }
        },
        feedback: [
          { when: 'pos', say: 'Casi: el término resultante es negativo: $y_p = -c e^x \\ln x$.' },
          { when: 'extra', say: 'Recuerda que el término $-c e^x$ forma parte de $y_h$ y se puede omitir.' }
        ]
      }),

    N('lr-eval-u1p-fermi', 'log-rac', 2,
      { c: [4, 12, 2] },
      function (v) { return 'Para la ecuación con lado derecho racional en exponenciales $y\'\' - y = \\dfrac{' + v.c + '}{1 + e^x}$, calcula el valor numérico de $u_2\'(0)$ con $y_1 = e^x$ y $y_2 = e^{-x}$.'; },
      function (v) { return -v.c / 4; },
      function (v) { return 'u_2\'(0) = \\frac{e^0 \\cdot ' + v.c + ' / (1 + e^0)}{-2} = -\\frac{' + v.c + '}{4} = ' + fx(-v.c / 4, 2) + '.'; },
      {
        mistakes: {
          pos: function (v) { return v.c / 4; },
          half: function (v) { return -v.c / 2; }
        },
        feedback: [
          { when: 'pos', say: 'Recuerda que el Wronskiano $W = -2$ aporta un signo negativo al cociente de $u_2\'.' },
          { when: 'half', say: 'En $x=0$, el denominador es $2(1 + e^0) = 4$, no $2$.' }
        ]
      }),

    N('lr-eval-u1p-fermi-cero', 'log-rac', 2,
      { c: [4, 12, 2] },
      function (v) { return 'Para la misma ecuación $y\'\' - y = \\dfrac{' + v.c + '}{1 + e^x}$, calcula el valor de $u_1\'(0)$ con la misma base $y_1 = e^x$ y $y_2 = e^{-x}$.'; },
      function (v) { return v.c / 4; },
      function (v) { return 'u_1\'(0) = -\\frac{e^0 \\cdot ' + v.c + ' / (1 + e^0)}{-2} = \\frac{' + v.c + '}{4} = ' + fx(v.c / 4, 2) + '.'; },
      {
        mistakes: {
          neg: function (v) { return -v.c / 4; },
          half: function (v) { return v.c / 2; }
        },
        feedback: [
          { when: 'neg', say: 'Los dos signos negativos (el de la fórmula y el del Wronskiano) se cancelan: $(-)/(-) = +$.' },
          { when: 'half', say: 'En $x=0$, $1 + e^0 = 2$, multiplicado por el 2 del Wronskiano da 4.' }
        ]
      }),

    N('lr-eval-u2-integral-ln', 'log-rac', 2,
      { k: [2, 8, 2] },
      function (v) { return 'Para la ecuación $y\'\' - 4y = \\dfrac{e^{2x}}{x}$ con $y_1 = e^{2x}$ y $y_2 = e^{-2x}$ ($W = -4$), calcula el valor de $u_1(e^{' + v.k + '})$ tomando constante cero.'; },
      function (v) { return v.k / 4; },
      function (v) { return 'u_1\' = \\frac{1}{4x} \\;\\Rightarrow\\; u_1(x) = \\frac{1}{4}\\ln x. En x = e^{' + v.k + '}, u_1 = \\frac{' + v.k + '}{4} = ' + fx(v.k / 4, 2) + '.'; },
      {
        mistakes: {
          neg: function (v) { return -v.k / 4; },
          noW: function (v) { return v.k; }
        },
        feedback: [
          { when: 'neg', say: 'El signo menos de la fórmula se anula con el signo negativo de $W = -4$.' },
          { when: 'noW', say: 'Divide entre el valor del Wronskiano $4$.' }
        ]
      }),

    N('lr-eval-u2p-exp-x', 'log-rac', 2,
      { c: [1, 4, 1] },
      function (v) { return 'Para la ecuación $y\'\' - 4y = ' + v.c + '\\dfrac{e^{2x}}{x}$, calcula el valor numérico de la derivada $u_2\'(1)$.'; },
      function (v) { return -v.c * Math.exp(4) / 4; },
      function (v) { return 'u_2\'(1) = \\frac{e^2 \\cdot ' + v.c + 'e^2}{-4} = -\\frac{' + v.c + 'e^4}{4} \\approx ' + fx(-v.c * Math.exp(4) / 4, 2) + '.'; },
      {
        mistakes: {
          pos: function (v) { return v.c * Math.exp(4) / 4; },
          noW: function (v) { return -v.c * Math.exp(4); }
        },
        feedback: [
          { when: 'pos', say: 'Recuerda que $W = -4$, lo que hace negativa a la derivada $u_2\'.' },
          { when: 'noW', say: 'Falta dividir entre el Wronskiano $4$.' }
        ]
      }),

    E('lr-expr-yp-ex-sobre-x', 'log-rac', 3,
      { c: [1, 4, 1] },
      function (v) { return 'Escribe la expresión simplificada de la solución particular $y_p(x)$ para $y\'\' - 2y\' + y = ' + v.c + '\\dfrac{e^x}{x}$ en $x > 0$ (omitiendo el término que pertenece a $y_h$).'; },
      function (v) { return v.c + '*x*e^x*log(x)'; },
      function (v) { return 'y_p = ' + v.c + ' x e^x \\ln x, ya que el término -' + v.c + ' x e^x se absorbe en la homogénea.'; },
      {
        domain: [0.5, 2.5],
        mistakes: {
          noX: function (v) { return v.c + '*e^x*log(x)'; },
          neg: function (v) { return '-' + v.c + '*x*e^x*log(x)'; }
        },
        feedback: [
          { when: 'noX', say: 'El término que sobrevive es $x e^x \\ln x$, no $e^x \\ln x$.' },
          { when: 'neg', say: 'El signo resultante de $u_2 y_2$ es positivo.' }
        ]
      }),

    E('lr-expr-yp-ex-sobre-x2', 'log-rac', 3,
      { c: [1, 4, 1] },
      function (v) { return 'Escribe la solución particular $y_p(x)$ para $y\'\' - 2y\' + y = ' + v.c + '\\dfrac{e^x}{x^2}$ ($x > 0$), eliminando cualquier término redundante de $y_h$.'; },
      function (v) { return '-' + v.c + '*e^x*log(x)'; },
      function (v) { return 'y_p = -' + v.c + ' e^x \\ln x (el término -' + v.c + ' e^x se absorbe en c_1 e^x).'; },
      {
        domain: [0.5, 2.5],
        mistakes: {
          pos: function (v) { return v.c + '*e^x*log(x)'; },
          withX: function (v) { return '-' + v.c + '*x*e^x*log(x)'; }
        },
        feedback: [
          { when: 'pos', say: 'Revisa el signo: $u_1 = -c\\ln x$ multiplica a $y_1 = e^x$.' },
          { when: 'withX', say: 'Para $g(x) = e^x/x^2$, la solución no lleva factor $x$ adicional.' }
        ]
      }),

    E('lr-expr-u1p-log', 'log-rac', 3,
      { k: [1, 3, 1] },
      function (v) { return 'Para la ecuación $y\'\' + ' + (v.k * v.k) + 'y = \\ln x$ ($x > 0$), escribe la derivada auxiliar $u_1\'(x)$ usando la base habitual $y_1 = \\cos(' + v.k + 'x)$ y $y_2 = \\sin(' + v.k + 'x)$.'; },
      function (v) { return '-(1/' + v.k + ')*sin(' + v.k + '*x)*log(x)'; },
      function (v) { return 'u_1\' = -\\frac{\\sin(' + v.k + 'x)\\ln x}{' + v.k + '} = -\\frac{1}{' + v.k + '}\\sin(' + v.k + 'x)\\ln x.'; },
      {
        domain: [0.5, 2.5],
        mistakes: {
          pos: function (v) { return '(1/' + v.k + ')*sin(' + v.k + '*x)*log(x)'; },
          noW: function (v) { return '-sin(' + v.k + '*x)*log(x)'; }
        },
        feedback: [
          { when: 'pos', say: 'Recuerda el signo menos de $u_1\' = -y_2 g / W$.' },
          { when: 'noW', say: 'Falta dividir entre el Wronskiano $W = k$.' }
        ]
      }),

    /* ======================= 5. Comparación con coeficientes indeterminados (17) ======================= */
    C('cp-cuando-ambos', 'comparacion', 1,
      '¿Bajo qué condiciones se pueden aplicar <strong>ambos</strong> métodos (coeficientes indeterminados y variación de parámetros) a una ecuación lineal de segundo orden?',
      'Cuando los coeficientes de la EDO son constantes y el término no homogéneo $g(x)$ es una combinación de polinomios, exponenciales, senos y cosenos', [
        ['Para cualquier ecuación diferencial lineal sin ninguna restricción', 'Casi: coeficientes indeterminados requiere coeficientes constantes y que $g(x)$ esté en la tabla de derivadas finitas.'],
        ['Solo cuando la ecuación diferencial es de primer orden', 'Casi: ambos métodos se aplican a segundo orden y órdenes superiores.'],
        ['Únicamente cuando el lado derecho es igual a cero', 'Casi: si $g(x) = 0$ la ecuación es homogénea y no requiere buscar solución particular.']],
      'Ambos métodos son aplicables cuando los coeficientes son constantes y $g(x)$ pertenece a la familia de funciones con derivadas cíclicas o finitas.'),

    C('cp-ventaja-indeterminados', 'comparacion', 1,
      'Cuando ambos métodos son aplicables, ¿por qué suele preferirse el método de coeficientes indeterminados?',
      'Porque solo involucra derivar y resolver un sistema de ecuaciones algebraicas, evitando calcular integrales', [
        ['Porque produce una solución más exacta que variación de parámetros', 'Casi: ambos métodos son analíticos y exactos; producen exactamente la misma solución.'],
        ['Porque no requiere encontrar previamente las soluciones de la homogénea', 'Casi: para coeficientes indeterminados también necesitas $y_h$ para verificar si hay resonancia.'],
        ['Porque funciona para coeficientes variables como las ecuaciones de Cauchy-Euler', 'Casi: coeficientes indeterminados solo aplica a ecuaciones con coeficientes constantes.']],
      'Derivar funciones algebraicamente es un proceso algorítmico directo, mientras que integrar en variación de parámetros puede ser largo y propenso a errores.'),

    C('cp-resonancia-automatico', 'comparacion', 1,
      'En caso de resonancia (cuando un término de $g(x)$ ya es solución de la homogénea), ¿cómo maneja variación de parámetros dicha situación a diferencia de coeficientes indeterminados?',
      'La maneja de forma automática mediante la integración, sin necesidad de adivinar o multiplicar por factores $x$ o $x^2$', [
        ['Falla completamente y obliga a recurrir a transformadas de Laplace', 'Casi: variación de parámetros nunca falla ante resonancias; la regla de Cramer sigue siendo plenamente válida.'],
        ['Exige multiplicar previamente $g(x)$ por la variable $x$', 'Casi: la fórmula con $W$ produce directamente los factores $x$ al integrar.'],
        ['El Wronskiano se vuelve cero y no se puede dividir', 'Casi: el Wronskiano solo depende de la base homogénea $y_1, y_2$, la cual es independiente.']],
      'La presencia de términos de resonancia produce integrales directas de constantes como $\\int 1\\,dx = x$, generando el factor $x$ naturalmente.'),

    C('cp-diferencia-yp', 'comparacion', 1,
      'Si dos estudiantes resuelven la misma EDO no homogénea por distintos métodos y obtienen soluciones particulares que difieren por un término $+5\\cos x$, sabiendo que $\\cos x$ resuelve la homogénea, ¿cuál de los dos tiene la respuesta correcta?',
      'Ambos son correctos, ya que la diferencia pertenece a la solución homogénea y se absorbe en las constantes de integración', [
        ['Solo el que usó variación de parámetros, porque es el método más general', 'Casi: cualquier función que satisfaga la EDO es una solución particular válida.'],
        ['Ninguno, la solución particular debe ser única e idéntica término a término', 'Casi: $y_p$ es única módulo el subespacio de soluciones homogéneas.'],
        ['El que no tiene el término $+5\\cos x$, porque la solución particular debe ser ortogonal a $y_h$', 'Casi: no se exige ortogonalidad en la solución de ecuaciones diferenciales ordinarias.']],
      'Si $y_{p1}$ y $y_{p2}$ son soluciones particulares, su diferencia satisface la ecuación homogénea: $L(y_{p1} - y_{p2}) = g - g = 0$.'),

    C('cp-cual-metodo-secante', 'comparacion', 1,
      '¿Cuál método debe emplearse obligatoriamente para resolver $y\'\' + 9y = \\sec 3x$?',
      'Variación de parámetros, porque $\\sec 3x$ no tiene un conjunto finito de derivadas independientes', [
        ['Coeficientes indeterminados con propuesta $A\\sec 3x + B\\tan 3x$', 'Casi: al derivar $\\sec 3x$ aparecen $\\sec 3x\\tan 3x$, luego $\\sec^3 3x$, etc., nunca se cierra la familia.'],
        ['Separación de variables directamente', 'Casi: es una ecuación de segundo orden, no de primer orden separable.'],
        ['El método del factor integrante de Bernoulli', 'Casi: Bernoulli es para ecuaciones no lineales de primer orden.']],
      'Las funciones trigonométricas $\\sec, \\csc, \\tan, \\cot$ no forman familias finitas de derivadas; requieren variación de parámetros.'),

    C('cp-cual-metodo-polinomio', 'comparacion', 2,
      'Para resolver $y\'\' - 4y\' + 4y = 3x^2 - 1$, ¿qué método resulta considerablemente más rápido y conveniente?',
      'Coeficientes indeterminados, proponiendo $y_p = Ax^2 + Bx + C$', [
        ['Variación de parámetros, porque integra polinomios sin dificultad', 'Casi: aunque funciona, calcular $W=e^{4x}$, armar $u_1\', u_2\'$ e integrar por partes dos veces toma mucho más tiempo.'],
        ['Series de Fourier trigonométricas', 'Casi: no hace falta recurrir a métodos avanzados de variable periódica para polinomios simples.'],
        ['Factores integrantes de primer orden', 'Casi: la ecuación es de segundo orden.']],
      'Para polinomios, derivar e igualar coeficientes toma pocos pasos algebraicos y evita integrales por partes con exponenciales.'),

    C('cp-caso-ambos-exp', 'comparacion', 2,
      'Para la ecuación $y\'\' - y = e^{2x}$, ¿cuál es la solución particular obtenida tanto por coeficientes indeterminados como por variación de parámetros?',
      '$y_p = \\frac{1}{3}e^{2x}$', [
        ['$y_p = e^{2x}$', 'Casi: al sustituir en $y\'\' - y$ da $4e^{2x} - e^{2x} = 3e^{2x} \\neq e^{2x}$.'],
        ['$y_p = \\frac{1}{5}e^{2x}$', 'Casi: eso resultaría si la ecuación fuera $y\'\' + y = e^{2x}$, no $y\'\' - y$.'],
        ['$y_p = x e^{2x}$', 'Casi: no hay resonancia porque las raíces características son $\\pm 1$, distintas de $2$.']],
      'Con indeterminados: $A(2^2 - 1) = 1 \\implies A = 1/3$. Con variación de parámetros da exactamente la misma función.'),

    N('cp-num-coef-exp', 'comparacion', 2,
      { m: [2, 5, 1], c: [3, 15, 3] },
      function (v) { return 'Para la ecuación $y\'\' - y = ' + v.c + 'e^{' + v.m + 'x}$, calcula el coeficiente $A$ de la solución particular $y_p = A e^{' + v.m + 'x}$ obtenida por cualquiera de los dos métodos.'; },
      function (v) { return v.c / (v.m * v.m - 1); },
      function (v) { return 'A(' + (v.m * v.m) + ' - 1) = ' + v.c + ' \\;\\Rightarrow\\; A = \\frac{' + v.c + '}{' + (v.m * v.m - 1) + '} = ' + fx(v.c / (v.m * v.m - 1), 2) + '.'; },
      {
        mistakes: {
          plus: function (v) { return v.c / (v.m * v.m + 1); },
          noSq: function (v) { return v.c / (v.m - 1); }
        },
        feedback: [
          { when: 'plus', say: 'La ecuación es $y\'\' - y$, por lo que queda $A(m^2 - 1) = c$, no $m^2 + 1$.' },
          { when: 'noSq', say: 'La segunda derivada aporta $m^2$, no $m$.' }
        ]
      }),

    N('cp-num-coef-seno', 'comparacion', 2,
      { w: [1, 2, 1], c: [4, 16, 2] },
      function (v) { return 'Dada la ecuación $y\'\' + 9y = ' + v.c + '\\sin(' + v.w + 'x)$, calcula el coeficiente $B$ de la solución particular $y_p = B\\sin(' + v.w + 'x)$.'; },
      function (v) { return v.c / (9 - v.w * v.w); },
      function (v) { return 'B(9 - ' + (v.w * v.w) + ') = ' + v.c + ' \\;\\Rightarrow\\; B = ' + fx(v.c / (9 - v.w * v.w), 2) + '.'; },
      {
        mistakes: {
          plus: function (v) { return v.c / (9 + v.w * v.w); },
          inv: function (v) { return (9 - v.w * v.w) / v.c; }
        },
        feedback: [
          { when: 'plus', say: 'Al derivar seno dos veces sale un signo menos: $-w^2 + 9$.' },
          { when: 'inv', say: 'El coeficiente es $c/(9 - w^2)$, no su inverso.' }
        ]
      }),

    N('cp-num-coef-coseno', 'comparacion', 2,
      { w: [3, 5, 1], c: [6, 18, 3] },
      function (v) { return 'Para la ecuación $y\'\' + 4y = ' + v.c + '\\cos(' + v.w + 'x)$, encuentra el coeficiente numérico $B$ en $y_p = B\\cos(' + v.w + 'x)$.'; },
      function (v) { return v.c / (4 - v.w * v.w); },
      function (v) { return 'B(4 - ' + (v.w * v.w) + ') = ' + v.c + ' \\;\\Rightarrow\\; B = ' + fx(v.c / (4 - v.w * v.w), 2) + '.'; },
      {
        mistakes: {
          pos: function (v) { return v.c / (v.w * v.w - 4); },
          plus: function (v) { return v.c / (4 + v.w * v.w); }
        },
        feedback: [
          { when: 'pos', say: 'Como $w^2 > 4$, $4 - w^2$ es negativo; revisa el signo de $B$.' },
          { when: 'plus', say: 'La segunda derivada de coseno aporta $-w^2$.' }
        ]
      }),

    N('cp-num-polinomio-constante', 'comparacion', 2,
      { b: [2, 5, 1], k: [2, 6, 1], c: [6, 24, 3] },
      function (v) { return 'Para la ecuación $y\'\' + ' + v.b + 'y\' + ' + v.k + 'y = ' + v.c + '$, halla el valor de la solución particular constante $y_p$.'; },
      function (v) { return v.c / v.k; },
      function (v) { return 'Sustituyendo una constante A: 0 + 0 + ' + v.k + 'A = ' + v.c + ' \\;\\Rightarrow\\; A = ' + fx(v.c / v.k, 2) + '.'; },
      {
        mistakes: {
          withB: function (v) { return v.c / (v.b + v.k); },
          times: function (v) { return v.c * v.k; }
        },
        feedback: [
          { when: 'withB', say: 'La derivada de una constante es cero, por lo que el término con $y\'$ no interviene.' },
          { when: 'times', say: 'Se despeja dividiendo entre el coeficiente de $y$.' }
        ]
      }),

    N('cp-num-polinomio-lineal', 'comparacion', 2,
      { c: [4, 16, 4], x0: [2, 5, 1] },
      function (v) { return 'Para la ecuación diferencial $y\'\' + 4y = ' + v.c + 'x$, evalúa la solución particular polinomial en $x = ' + v.x0 + '$.'; },
      function (v) { return (v.c / 4) * v.x0; },
      function (v) { return 'y_p = \\frac{' + v.c + '}{4}x, por lo que en x = ' + v.x0 + ' vale ' + ((v.c / 4) * v.x0) + '.'; },
      {
        mistakes: {
          noDiv: function (v) { return v.c * v.x0; },
          div2: function (v) { return (v.c / 2) * v.x0; }
        },
        feedback: [
          { when: 'noDiv', say: 'Divide entre el coeficiente 4 de $y$.' },
          { when: 'div2', say: 'El coeficiente de $y$ es 4, no 2.' }
        ]
      }),

    N('cp-num-resonancia-coef', 'comparacion', 2,
      { c: [2, 10, 2] },
      function (v) { return 'Para la ecuación resonante $y\'\' + y = ' + v.c + '\\cos x$, ¿cuál es el coeficiente de $x\\sin x$ en la solución particular?'; },
      function (v) { return v.c / 2; },
      function (v) { return 'Al derivar y_p = Ax\\sin x se obtiene y_p\'\' + y_p = 2A\\cos x = ' + v.c + '\\cos x \\;\\Rightarrow\\; A = ' + (v.c / 2) + '.'; },
      {
        mistakes: {
          same: function (v) { return v.c; },
          neg: function (v) { return -v.c / 2; }
        },
        feedback: [
          { when: 'same', say: 'La derivada segunda de $x\\sin x$ produce $2\\cos x$, así que $2A = c \\implies A = c/2$.' },
          { when: 'neg', say: 'El coeficiente es positivo: $2A = c$.' }
        ]
      }),

    N('cp-num-comparacion-integral', 'comparacion', 2,
      { c: [4, 16, 4] },
      function (v) { return 'Calcula el valor numérico en $x = 1$ de la solución particular de $y\'\' - y = ' + v.c + 'e^{3x}$.'; },
      function (v) { return (v.c / 8) * Math.exp(3); },
      function (v) { return 'y_p = \\frac{' + v.c + '}{8}e^{3x}, que en x = 1 vale ' + fx((v.c / 8) * Math.exp(3), 2) + '.'; },
      {
        mistakes: {
          div9: function (v) { return (v.c / 9) * Math.exp(3); },
          div10: function (v) { return (v.c / 10) * Math.exp(3); }
        },
        feedback: [
          { when: 'div9', say: 'El factor característico es $3^2 - 1 = 8$, no 9.' },
          { when: 'div10', say: 'La ecuación tiene signo menos: $3^2 - 1 = 8$.' }
        ]
      }),

    E('cp-expr-yp-exp', 'comparacion', 3,
      { k: [1, 3, 1] },
      function (v) { return 'Escribe la solución particular $y_p(x)$ para $y\'\' - ' + (v.k * v.k) + 'y = e^{' + (2 * v.k) + 'x}$ (válida por ambos métodos).'; },
      function (v) { return '(1/' + (3 * v.k * v.k) + ')*e^(' + (2 * v.k) + '*x)'; },
      function (v) { return 'y_p = \\frac{e^{' + (2 * v.k) + 'x}}{(2k)^2 - k^2} = \\frac{1}{' + (3 * v.k * v.k) + '}e^{' + (2 * v.k) + 'x}.'; },
      {
        domain: [0.2, 1.2],
        mistakes: {
          denom4: function (v) { return '(1/' + (4 * v.k * v.k) + ')*e^(' + (2 * v.k) + '*x)'; },
          denom1: function (v) { return '(1/' + (v.k * v.k) + ')*e^(' + (2 * v.k) + '*x)'; }
        },
        feedback: [
          { when: 'denom4', say: '$(2k)^2 - k^2 = 3k^2$, no $4k^2$.' },
          { when: 'denom1', say: 'Sustituye en la EDO: $(2k)^2 - k^2 = 3k^2$.' }
        ]
      }),

    E('cp-expr-yp-seno-ambos', 'comparacion', 3,
      { k: [1, 3, 1] },
      function (v) { return 'Escribe la solución particular $y_p(x)$ para la ecuación no resonante $y\'\' + ' + (v.k * v.k) + 'y = \\cos(' + (2 * v.k) + 'x)$.'; },
      function (v) { return '-(1/' + (3 * v.k * v.k) + ')*cos(' + (2 * v.k) + '*x)'; },
      function (v) { return 'y_p\'\' + k^2 y_p = A(-4k^2 + k^2)\\cos(2kx) = -3k^2 A\\cos(2kx) = \\cos(2kx) \\;\\Rightarrow\\; A = -\\frac{1}{' + (3 * v.k * v.k) + '}.'; },
      {
        domain: [0.1, 1.2],
        mistakes: {
          pos: function (v) { return '(1/' + (3 * v.k * v.k) + ')*cos(' + (2 * v.k) + '*x)'; },
          denom5: function (v) { return '-(1/' + (5 * v.k * v.k) + ')*cos(' + (2 * v.k) + '*x)'; }
        },
        feedback: [
          { when: 'pos', say: 'Al sustituir, $-(2k)^2 + k^2 = -3k^2$, lo que produce signo negativo.' },
          { when: 'denom5', say: 'Las derivadas aportan $-(2k)^2 = -4k^2$, que sumado con $k^2$ da $-3k^2$.' }
        ]
      }),

    E('cp-expr-yp-resonancia', 'comparacion', 3,
      { k: [1, 3, 1] },
      function (v) { return 'Escribe la solución particular $y_p(x)$ para la ecuación en resonancia $y\'\' + ' + (v.k * v.k) + 'y = \\sin(' + v.k + 'x)$.'; },
      function (v) { return '-(x/' + (2 * v.k) + ')*cos(' + v.k + '*x)'; },
      function (v) { return 'Para g(x) = \\sin(kx), y_p = -\\frac{x\\cos(' + v.k + 'x)}{2k}.'; },
      {
        domain: [0.2, 1.5],
        mistakes: {
          pos: function (v) { return '(x/' + (2 * v.k) + ')*cos(' + v.k + '*x)'; },
          sin: function (v) { return '-(x/' + (2 * v.k) + ')*sin(' + v.k + '*x)'; }
        },
        feedback: [
          { when: 'pos', say: 'Revisa el signo: la derivada segunda de $-x\\cos(kx)$ cancela el signo negativo.' },
          { when: 'sin', say: 'La solución particular para una excitación senoidal resonante tiene forma $x\\cos(kx)$.' }
        ]
      }),

    /* ======================= 6. Coeficientes variables y problemas de valor inicial (17) ======================= */
    C('vp-cauchy-error-tipico', 'variables-pvi', 1,
      'Al aplicar variación de parámetros a la ecuación de Cauchy-Euler $x^2 y\'\' - 2x y\' + 2y = x^3$ (para $x > 0$), ¿cuál es el error más costoso que suele cometerse?',
      'Tomar $g(x) = x^3$ en lugar de dividir entre $x^2$ para obtener $g(x) = x$', [
        ['Calcular el Wronskiano con la regla de la cadena', 'Casi: el cálculo del Wronskiano es estándar; el error grave está en la identificación errónea de $g(x)$.'],
        ['Suponer que las soluciones fundamentales son funciones exponenciales', 'Casi: la base suele ser de potencias $x^m$, pero no dividir arruina todo el proceso.'],
        ['Olvidar sumar $+C$ en las integrales de $u_1\'$ y $u_2\'$', 'Casi: en $u_1$ y $u_2$ no se deben sumar constantes porque reproducirían $y_h$.']],
      'Las fórmulas de Cramer suponen coeficiente 1 en $y\'\'$; si no se divide entre $x^2$, la función particular obtenida no satisface la ecuación.'),

    C('vp-condiciones-iniciales-donde', 'variables-pvi', 1,
      'En un problema de valor inicial (PVI) de segundo orden con solución general $y = c_1 y_1 + c_2 y_2 + y_p$, ¿en qué momento deben calcularse las constantes $c_1$ y $c_2$?',
      'Al final de todo el procedimiento, aplicando las condiciones iniciales a la solución completa $y(x)$ y a su derivada $y\'(x)$', [
        ['Inmediatamente después de hallar la solución homogénea, antes de calcular $y_p$', 'Casi: si hallas las constantes antes, $y_p$ alterará los valores iniciales $y(x_0)$ y $y\'(x_0)$.'],
        ['Durante la integración de $u_1\'$ y $u_2\'$, usándolas como límites inferiores', 'Casi: aunque es posible fijar límites para que $y_p(x_0)=0$, la forma canónica es ajustar $c_1, c_2$ sobre la solución total.'],
        ['No se calculan porque la solución particular fija automáticamente todas las constantes', 'Casi: $y_p$ no tiene constantes arbitrarias; $c_1$ y $c_2$ son indispensables para satisfacer el PVI.']],
      'La solución particular contribuye tanto a $y(x_0)$ como a $y\'(x_0)$; las constantes $c_1, c_2$ deben compensar esa contribución.'),

    C('vp-intervalo-validez-pvi', 'variables-pvi', 1,
      'Para el PVI $(x-2)\\,y\'\' + y\' + \\dfrac{y}{x} = \\sec x$ con condiciones en $x_0 = 1$, ¿en qué intervalo garantiza el teorema de existencia y unicidad una solución única?',
      'En $(0, \\pi/2)$, pues contiene a $x_0=1$ y en él todos los coeficientes normalizados son continuos', [
        ['En $(-\\infty, \\infty)$ porque es una ecuación lineal', 'Casi: hay singularidades en $x=0$, $x=2$ y donde $\\cos x = 0$ ($x=\\pm \\pi/2$).'],
        ['En $(0, 2)$ únicamente, ignorando el lado derecho', 'Casi: $\\sec x$ tiene una asíntota en $\\pi/2 \\approx 1.57$, que está antes de $x=2$.'],
        ['En $[1, \\infty)$ porque las condiciones iniciales parten de $x_0=1$', 'Casi: el intervalo de solución se extiende hacia ambos lados de $x_0$ hasta la primera discontinuidad.']],
      'En forma estándar $P(x) = \\frac{1}{x-2}$, $Q(x) = \\frac{1}{x(x-2)}$ y $g(x) = \\frac{\\sec x}{x-2}$; alrededor de $x_0=1$ las discontinuidades más cercanas son $x=0$ y $x=\\pi/2$.'),

    C('vp-unicidad-pvi', 'variables-pvi', 1,
      'Un PVI de segundo orden para una ecuación lineal con coeficientes continuos y condiciones $y(x_0) = y_0$, $y\'(x_0) = y_0\'$:',
      'Tiene una solución única definida en todo el intervalo donde los coeficientes sean continuos', [
        ['Puede tener infinitas soluciones si la ecuación no es homogénea', 'Casi: el teorema de existencia y unicidad garantiza una sola curva solución para valores iniciales dados.'],
        ['No tiene solución si $y_0 = 0$ y $y_0\' = 0$', 'Casi: si las condiciones son cero la solución existe y es no trivial gracias al término forzador $g(x)$.'],
        ['Requiere una tercera condición sobre $y\'\'(x_0)$ para tener solución única', 'Casi: para una EDO de segundo orden bastan dos condiciones iniciales ($y$ y $y\'$).']],
      'Por el teorema de Picard-Lindelöf para sistemas lineales, dos condiciones iniciales determinan unívocamente a $c_1$ y $c_2$.'),

    C('vp-yp-condiciones-cero', 'variables-pvi', 1,
      'Si un sistema parte del reposo con condiciones $y(0) = 0$ y $y\'(0) = 0$, ¿qué papel juega la solución homogénea $y_h$ en la respuesta final?',
      'Las constantes $c_1$ y $c_2$ se eligen para cancelar exactamente los valores $y_p(0)$ y $y_p\'(0)$', [
        ['La solución homogénea es idénticamente cero ($c_1 = 0, c_2 = 0$)', 'Casi: si $y_p(0) \\neq 0$ o $y_p\'(0) \\neq 0$, se requiere $y_h$ para compensarlo.'],
        ['La solución particular se descarta y solo queda la solución homogénea', 'Casi: sin solución particular no se satisfaría la ecuación no homogénea.'],
        ['No se puede resolver porque el reposo exige que $g(x) = 0$', 'Casi: un sistema puede estar en reposo y comenzar a moverse debido a una fuerza externa $g(x)$.']],
      '$y(0) = c_1 y_1(0) + c_2 y_2(0) + y_p(0) = 0$, por lo que $y_h(0) = -y_p(0)$.'),

    N('vp-num-cauchy-coef', 'variables-pvi', 2,
      { c: [2, 6, 1] },
      function (v) { return 'Para la ecuación de coeficientes variables $x^2 y\'\' - 2x y\' + 2y = ' + v.c + 'x^3$ ($x > 0$), calcula el valor de $y_p(2)$ sabiendo que $y_1 = x$ y $y_2 = x^2$.'; },
      function (v) { return 4 * v.c; },
      function (v) { return 'y_p = \\frac{' + v.c + '}{2}x^3, de modo que y_p(2) = \\frac{' + v.c + '}{2}(8) = ' + (4 * v.c) + '.'; },
      {
        mistakes: {
          noDiv: function (v) { return (v.c / 6) * 32; },
          half: function (v) { return 2 * v.c; }
        },
        feedback: [
          { when: 'noDiv', say: 'Dividir entre $x^2$ es obligatorio: $g(x) = c x$, no $c x^3$.' },
          { when: 'half', say: 'Revisa la evaluación en $x = 2$: $2^3 = 8$, multiplicado por $c/2$ da $4c$.' }
        ]
      }),

    N('vp-num-cauchy-potencia4', 'variables-pvi', 2,
      { c: [6, 24, 6] },
      function (v) { return 'Para la ecuación $x^2 y\'\' - 2x y\' + 2y = ' + v.c + 'x^4$ ($x > 0$), con base $y_1 = x$ y $y_2 = x^2$, determina el valor de $y_p(1)$.'; },
      function (v) { return v.c / 6; },
      function (v) { return 'y_p = \\frac{' + v.c + '}{6}x^4 \\;\\Rightarrow\\; y_p(1) = \\frac{' + v.c + '}{6} = ' + (v.c / 6) + '.'; },
      {
        mistakes: {
          noDiv: function (v) { return v.c / 12; },
          half: function (v) { return v.c / 2; }
        },
        feedback: [
          { when: 'noDiv', say: 'Divide entre $x^2$ antes de aplicar Cramer: $g(x) = c x^2$.' },
          { when: 'half', say: 'La combinación $-1/3 + 1/2$ da $1/6$, no $1/2$.' }
        ]
      }),

    N('vp-num-pvi-c1', 'variables-pvi', 2,
      { v0: [1, 5, 1] },
      function (v) { return 'En el PVI $y\'\' + y = 2\\tan x$ con $y(0) = 0$ y $y\'(0) = ' + v.v0 + '$, sabiendo que $y_p\'(0) = -2$, calcula el valor de la constante $c_2$ en $y = c_1\\cos x + c_2\\sin x + y_p$.'; },
      function (v) { return v.v0 + 2; },
      function (v) { return 'y\'(0) = c_2 + y_p\'(0) = c_2 - 2 = ' + v.v0 + ' \\;\\Rightarrow\\; c_2 = ' + (v.v0 + 2) + '.'; },
      {
        mistakes: {
          sub: function (v) { return v.v0 - 2; },
          same: function (v) { return v.v0; }
        },
        feedback: [
          { when: 'sub', say: 'Como $y_p\'(0) = -2$, al despejar queda $c_2 = v_0 - (-2) = v_0 + 2$.' },
          { when: 'same', say: 'No olvides que la derivada de la solución particular aporta un valor no nulo en $0$.' }
        ]
      }),

    N('vp-num-pvi-tan-eval', 'variables-pvi', 2,
      { k: [2, 6, 1] },
      function (v) { return 'Resuelve $y\'\' + y = ' + v.k + '\\tan x$ con $y(0) = 0$ y $y\'(0) = ' + v.k + '$, y evalúa la solución en $x = 0.5$ (en radianes).'; },
      function (v) { return v.k * (2 * Math.sin(0.5) - Math.cos(0.5) * Math.log(1 / Math.cos(0.5) + Math.tan(0.5))); },
      function (v) { return 'Con c_1 = 0 y c_2 = ' + (2 * v.k) + ', y(0.5) = ' + (2 * v.k) + '\\sin(0.5) - ' + v.k + '\\cos(0.5)\\ln(\\sec 0.5 + \\tan 0.5) \\approx ' + fx(v.k * (2 * Math.sin(0.5) - Math.cos(0.5) * Math.log(1 / Math.cos(0.5) + Math.tan(0.5))), 4) + '.'; },
      {
        mistakes: {
          noC2: function (v) { return v.k * (Math.sin(0.5) - Math.cos(0.5) * Math.log(1 / Math.cos(0.5) + Math.tan(0.5))); },
          onlyYp: function (v) { return -v.k * Math.cos(0.5) * Math.log(1 / Math.cos(0.5) + Math.tan(0.5)); }
        },
        feedback: [
          { when: 'noC2', say: 'Como $y_p\'(0) = -k$, para cumplir $y\'(0) = k$ se requiere $c_2 = 2k$.' },
          { when: 'onlyYp', say: 'Falta la contribución de la solución homogénea $c_2\\sin x$.' }
        ]
      }),

    N('vp-num-cauchy-euler-pvi-c1', 'variables-pvi', 2,
      { y0: [2, 6, 1] },
      function (v) { return 'Para el PVI $x^2 y\'\' - 2x y\' + 2y = 2x^3$ ($x > 0$) con $y(1) = ' + v.y0 + '$ y $y\'(1) = 0$, calcula el valor de la constante $c_1$ en $y = c_1 x + c_2 x^2 + x^3$.'; },
      function (v) { return 2 * v.y0 + 1; },
      function (v) { return 'Del sistema c_1 + c_2 = ' + (v.y0 - 1) + ' y c_1 + 2c_2 = -3 se obtiene c_1 = 2(' + v.y0 + ') + 1 = ' + (2 * v.y0 + 1) + '.'; },
      {
        mistakes: {
          neg: function (v) { return 2 * v.y0 - 1; },
          noYp: function (v) { return v.y0; }
        },
        feedback: [
          { when: 'neg', say: 'Revisa el signo al despejar del sistema $c_1 + c_2 = y_0 - 1$ y $c_1 + 2c_2 = -3$.' },
          { when: 'noYp', say: 'No olvides la contribución de $y_p(1) = 1$ y $y_p\'(1) = 3$.' }
        ]
      }),

    N('vp-num-cauchy-euler-pvi-c2', 'variables-pvi', 2,
      { y0: [2, 6, 1] },
      function (v) { return 'Para el mismo PVI $x^2 y\'\' - 2x y\' + 2y = 2x^3$ con $y(1) = ' + v.y0 + '$ y $y\'(1) = 0$, halla el valor de la segunda constante $c_2$.'; },
      function (v) { return -2 - v.y0; },
      function (v) { return 'c_2 = -3 - (' + v.y0 + ' - 1) = ' + (-2 - v.y0) + '.'; },
      {
        mistakes: {
          pos: function (v) { return 2 + v.y0; },
          sub: function (v) { return v.y0 - 2; }
        },
        feedback: [
          { when: 'pos', say: '$c_2$ es negativa para compensar la pendiente positiva $+3$ de la solución particular.' },
          { when: 'sub', say: 'Al restar las ecuaciones queda $c_2 = -3 - (y_0 - 1) = -y_0 - 2$.' }
        ]
      }),

    N('vp-num-cauchy-euler-eval-final', 'variables-pvi', 2,
      { A: [1, 4, 1], B: [1, 5, 1] },
      function (v) { return 'La ecuación $x^2y\'\' - 2xy\' + 2y = x^3$ ($x > 0$) tiene $y_h = c_1x + c_2x^2$ y, por variación de parámetros, $y_p = \\tfrac{1}{2}x^3$. Con $y(1) = ' + v.A + '$ y $y\'(1) = ' + v.B + '$, ¿cuánto vale $y(2)$?'; },
      function (v) { var c2 = v.B - v.A - 1, c1 = v.A - 0.5 - c2; return 2 * c1 + 4 * c2 + 4; },
      function (v) { var c2 = v.B - v.A - 1, c1 = v.A - 0.5 - c2; return 'De $c_1 + c_2 + \\tfrac{1}{2} = ' + v.A + '$ y $c_1 + 2c_2 + \\tfrac{3}{2} = ' + v.B + '$: $c_2 = ' + c2 + '$, $c_1 = ' + c1 + '$, y $y(2) = 2c_1 + 4c_2 + 4 = ' + (2 * c1 + 4 * c2 + 4) + '$.'; }),

    N('vp-num-w-variables-eval', 'variables-pvi', 2,
      { x0: [2, 6, 1] },
      function (v) { return 'Para la ecuación de Euler $x^2 y\'\' - 2x y\' + 2y = 0$, calcula el valor del Wronskiano $W(x)$ en $x = ' + v.x0 + '$ usando la base $y_1 = x$ y $y_2 = x^2$.'; },
      function (v) { return v.x0 * v.x0; },
      function (v) { return 'W(x) = x(2x) - 1(x^2) = x^2, que en x = ' + v.x0 + ' vale ' + (v.x0 * v.x0) + '.'; },
      {
        mistakes: {
          linear: function (v) { return v.x0; },
          cube: function (v) { return Math.pow(v.x0, 3); }
        },
        feedback: [
          { when: 'linear', say: 'El Wronskiano es $x(2x) - 1(x^2) = x^2$.' },
          { when: 'cube', say: 'El grado del Wronskiano es 2, no 3.' }
        ]
      }),

    E('vp-expr-cauchy-yp', 'variables-pvi', 3,
      { k: [4, 6, 1] },
      function (v) { return 'Para la ecuación $x^2 y\'\' - 3x y\' + 3y = x^{' + v.k + '}$ ($x > 0$), con soluciones homogéneas $y_1 = x$ y $y_2 = x^3$, escribe la expresión de la solución particular $y_p(x)$.'; },
      function (v) { return '(1/' + ((v.k - 1) * (v.k - 3)) + ')*x^' + v.k; },
      function (v) { return 'En forma estándar g(x) = x^{' + (v.k - 2) + '}; integrando resulta y_p = \\frac{1}{' + ((v.k - 1) * (v.k - 3)) + '}x^{' + v.k + '}.'; },
      {
        domain: [0.5, 2.0],
        mistakes: {
          noDiv: function (v) { return '(1/' + ((v.k + 1) * (v.k - 1)) + ')*x^' + (v.k + 2); },
          denom2: function (v) { return '(1/2)*x^' + v.k; }
        },
        feedback: [
          { when: 'noDiv', say: 'Recuerda dividir entre $x^2$ al usar variación de parámetros: $g(x) = x^{k-2}$.' },
          { when: 'denom2', say: 'El denominador sale de $(k-1)(k-3)$.' }
        ]
      }),

    E('vp-expr-cauchy-u1p', 'variables-pvi', 3,
      { k: [4, 6, 1] },
      function (v) { return 'Para la misma ecuación $x^2 y\'\' - 3x y\' + 3y = x^{' + v.k + '}$ con $y_1 = x$ y $y_2 = x^3$ ($W = 2x^3$), escribe la función $u_1\'(x)$.'; },
      function (v) { return '-(1/2)*x^' + (v.k - 2); },
      function (v) { return 'u_1\' = -\\frac{x^3 \\cdot x^{' + (v.k - 2) + '}}{2x^3} = -\\frac{1}{2}x^{' + (v.k - 2) + '}.'; },
      {
        domain: [0.5, 2.0],
        mistakes: {
          pos: function (v) { return '(1/2)*x^' + (v.k - 2); },
          noDiv: function (v) { return '-(1/2)*x^' + v.k; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: recuerda el signo menos en $u_1\' = -y_2 g / W$.' },
          { when: 'noDiv', say: 'Recuerda que $g(x) = x^{k-2}$ tras dividir entre $x^2$.' }
        ]
      }),

    E('vp-expr-cauchy-u2p', 'variables-pvi', 3,
      { k: [4, 6, 1] },
      function (v) { return 'Para la misma ecuación $x^2 y\'\' - 3x y\' + 3y = x^{' + v.k + '}$ con $y_1 = x$ y $y_2 = x^3$, escribe la derivada auxiliar $u_2\'(x)$.'; },
      function (v) { return '(1/2)*x^' + (v.k - 4); },
      function (v) { return 'u_2\' = \\frac{x \\cdot x^{' + (v.k - 2) + '}}{2x^3} = \\frac{1}{2}x^{' + (v.k - 4) + '}.'; },
      {
        domain: [0.5, 2.0],
        mistakes: {
          neg: function (v) { return '-(1/2)*x^' + (v.k - 4); },
          noDiv: function (v) { return '(1/2)*x^' + (v.k - 2); }
        },
        feedback: [
          { when: 'neg', say: '$u_2\'$ lleva signo positivo en Cramer.' },
          { when: 'noDiv', say: 'Divide entre $x^2$ al determinar $g(x)$.' }
        ]
      }),

    E('vp-expr-pvi-sol-completa', 'variables-pvi', 3,
      {},
      function (v) { return 'Escribe la solución analítica completa $y(x)$ del PVI $y\'\' + y = \\sec x$ con condiciones iniciales $y(0) = 1$ y $y\'(0) = 0$ en $(-\\pi/2, \\pi/2)$.'; },
      function (v) { return 'cos(x) + x*sin(x) + cos(x)*log(cos(x))'; },
      function (v) { return 'Con c_1 = 1 y c_2 = 0, la solución única es y(x) = \\cos x + x\\sin x + \\cos x\\ln(\\cos x).'; },
      {
        domain: [-1.2, 1.2],
        mistakes: {
          noHomog: function (v) { return 'x*sin(x) + cos(x)*log(cos(x))'; },
          sinHomog: function (v) { return 'sin(x) + x*sin(x) + cos(x)*log(cos(x))'; }
        },
        feedback: [
          { when: 'noHomog', say: 'Para cumplir $y(0)=1$ se necesita $c_1\\cos x = \\cos x$.' },
          { when: 'sinHomog', say: 'En $x=0$, $\\sin(0)=0$, no cumple $y(0)=1$.' }
        ]
      })
  ];

  K.register(SUBTEMAS, Q);
})();
