/* =====================================================================
   Banco · Cálculo 3 · S01 · Qué es una ecuación diferencial: orden,
   linealidad, solución, PVI, existencia y unicidad.
   100 preguntas propias (source: 'propia').
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c3', '01'), C = K.C;

  function sgn(n) { return n < 0 ? ' - ' + (-n) : ' + ' + n; }

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
    'c3.S01.clasificacion': 'Orden y linealidad',
    'c3.S01.solucion': 'Comprobación de soluciones',
    'c3.S01.pvi': 'Problema de valor inicial',
    'c3.S01.segundo-orden': 'Familias y PVI de segundo orden',
    'c3.S01.campo': 'Campo de pendientes',
    'c3.S01.unicidad': 'Existencia, unicidad y validez'
  };

  var Q = [
    /* ======================= 1. Orden y linealidad (16) ======================= */
    C('cl-incognita', 'clasificacion', 1,
      'En una ecuación diferencial ordinaria como $y\' + 3y = e^x$, ¿qué tipo de objeto matemático es la incógnita?',
      'Una función $y(x)$', [
        ['Un número real $y$', 'Casi: en álgebra buscas un número, pero en una EDO buscas toda una función $y(x)$.'],
        ['La variable independiente $x$', 'Casi: $x$ es la variable independiente; la que buscas es la función $y(x)$.'],
        ['La constante de integración $C$', 'Casi: $C$ aparece en la familia de soluciones, pero la incógnita de la ecuación es la función $y(x)$.']],
      'Resolver una EDO es encontrar las funciones $y(x)$ que cumplen la relación con sus derivadas.'),

    C('cl-edo-edp', 'clasificacion', 1,
      '¿Por qué la ecuación $x^2 y\'\' - 3xy\' + y = 0$ se llama ecuación diferencial <em>ordinaria</em> (EDO)?',
      'Porque la función desconocida depende de una sola variable independiente', [
        ['Porque es de coeficientes polinomiales sencillos', 'Casi: «ordinaria» se refiere a que hay una sola variable independiente, no a la forma de los coeficientes.'],
        ['Porque no tiene derivadas de orden mayor a dos', 'Casi: una EDO puede tener cualquier orden; lo que la hace ordinaria es tener una sola variable independiente.'],
        ['Porque ya está igualada a cero', 'Casi: estar igualada a cero la hace homogénea, no ordinaria.']],
      'Es ordinaria cuando la función incógnita depende de una sola variable (derivadas ordinarias, no parciales).'),

    C('cl-variables-rc', 'clasificacion', 1,
      'En la ecuación del circuito RC, $R\\,\\dfrac{dq}{dt} + \\dfrac{q}{C} = \\varepsilon$, ¿cuáles son la variable independiente y la dependiente?',
      'Independiente: $t$; dependiente: $q$', [
        ['Independiente: $q$; dependiente: $t$', 'Casi: la carga $q(t)$ depende del tiempo $t$; se deriva respecto a $t$.'],
        ['Independiente: $R$; dependiente: $C$', 'Casi: $R$ y $C$ son parámetros constantes del circuito, no las variables de la derivada.'],
        ['Independiente: $t$; dependiente: $\\varepsilon$', 'Casi: la derivada es $dq/dt$, así que la función buscada es la carga $q(t)$.']],
      'En $dq/dt$, la letra de abajo ($t$) es la variable independiente y la de arriba ($q$) es la función dependiente.'),

    C('cl-orden-exponente', 'clasificacion', 1,
      function (v) { return '¿Cuál es el orden de la ecuación diferencial $(y\')^{' + v.p + '} + x^2 y = \\cos x$?'; },
      'Primer orden', [
        [function (v) { return 'Orden ' + v.p; }, 'Casi: confundiste el exponente con el orden. El orden lo da la derivada más alta ($y\'$), no su potencia.'],
        ['Segundo orden', 'Casi: el $x^2$ es una potencia de $x$, no una segunda derivada.'],
        ['Orden cero', 'Casi: sí aparece la primera derivada $y\'$, así que es de primer orden.']],
      'El orden es el de la derivada más alta que aparece ($y\'$), sin importar a qué exponente esté elevada.',
      { vars: { p: [3, 6, 1] } }),

    C('cl-lineal-coef-x', 'clasificacion', 2,
      function (v) { return 'La ecuación $x^{' + v.m + '}y\'\' + e^x y\' - (\\sin x)\\,y = x^2$, ¿es lineal o no lineal?'; },
      'Lineal, porque $y$, $y\'$ y $y\'\'$ aparecen a la primera potencia y sin multiplicarse entre sí', [
        ['No lineal, porque aparece $e^x$ y $\\sin x$', 'Casi: la linealidad solo mira a $y$ y sus derivadas; las funciones de $x$ pueden ser cualesquiera.'],
        [function (v) { return 'No lineal, por la potencia $x^{' + v.m + '}$'; }, 'Casi: las potencias de la variable independiente $x$ no rompen la linealidad.'],
        ['No lineal, porque es de segundo orden', 'Casi: el orden y la linealidad son independientes; hay ecuaciones lineales de cualquier orden.']],
      'La linealidad solo exige que $y$ y sus derivadas estén a la primera potencia y multiplicadas únicamente por funciones de $x$.',
      { vars: { m: [3, 7, 1] } }),

    C('cl-no-lineal-motivo', 'clasificacion', 2,
      '¿Por qué la ecuación del péndulo $\\theta\'\' + \\dfrac{g}{L}\\sin\\theta = 0$ es <strong>no lineal</strong>?',
      'Porque la variable dependiente $\\theta$ está dentro de la función seno', [
        ['Porque aparece la segunda derivada $\\theta\'\'$', 'Casi: la segunda derivada determina que es de orden 2, pero aparece a la primera potencia.'],
        ['Porque contiene la fracción $g/L$', 'Casi: $g/L$ es una constante; no afecta la linealidad.'],
        ['Porque está igualada a cero', 'Casi: estar igualada a cero no quita la linealidad.']],
      'Si la incógnita $\\theta$ está dentro de una función no lineal como $\\sin\\theta$, la EDO es no lineal.'),

    C('cl-producto-yy', 'clasificacion', 2,
      '¿Cuál de las siguientes ecuaciones diferenciales de primer orden es <strong>lineal</strong>?',
      '$y\' + x^3 y = e^{x}$', [
        ['$y\\,y\' + x = 0$', 'Casi: el producto $y\\,y\'$ multiplica a la incógnita por su derivada, así que es no lineal.'],
        ['$y\' + y^2 = x$', 'Casi: el término $y^2$ tiene a la incógnita al cuadrado, por lo que es no lineal.'],
        ['$(y\')^2 + y = 1$', 'Casi: la derivada $y\'$ está elevada al cuadrado, lo que la hace no lineal.']],
      'En $y\' + x^3 y = e^x$, tanto $y$ como $y\'$ están a la primera potencia y no se multiplican entre sí.'),

    C('cl-enfriamiento-modelo', 'clasificacion', 2,
      'Un café a temperatura $T(t)$ se enfría en un cuarto a $20\\ ^\\circ\\text{C}$ con rapidez proporcional a la diferencia $T - 20$. ¿Qué EDO modela esto (con $k > 0$)?',
      '$\\dfrac{dT}{dt} = -k(T - 20)$', [
        ['$\\dfrac{dT}{dt} = -k(t - 20)$', 'Casi: la rapidez depende de la diferencia de temperatura $T - 20$, no del tiempo $t - 20$.'],
        ['$T(t) = -k(T - 20)$', 'Casi: lo que es proporcional a $T - 20$ es la razón de cambio $dT/dt$, no la temperatura $T$.'],
        ['$\\dfrac{d^2T}{dt^2} = -k(T - 20)$', 'Casi: «rapidez con que se enfría» es la primera derivada $dT/dt$, no la segunda.']],
      'La ley de enfriamiento de Newton relaciona la primera derivada $dT/dt$ con la diferencia de temperaturas $T - T_a$.'),

    C('cl-ambas-clasif', 'clasificacion', 3,
      '¿Cómo se clasifica la ecuación $x\\,y\'\'\' - (y\')^2 + 4y = 0$?',
      'De tercer orden y no lineal', [
        ['De tercer orden y lineal', 'Casi: el orden sí es 3 por $y\'\'\'$, pero el término $(y\')^2$ la hace no lineal.'],
        ['De segundo orden y no lineal', 'Casi: el cuadrado en $(y\')^2$ es un exponente; la derivada más alta es $y\'\'\'$ (orden 3).'],
        ['De quinto orden y no lineal', 'Casi: los órdenes de distintas derivadas no se suman; manda el mayor, que es 3.']],
      'La derivada más alta es $y\'\'\'$ (orden 3) y el cuadrado en $(y\')^2$ rompe la linealidad.'),

    C('cl-parametro-lineal', 'clasificacion', 3,
      '¿Para qué valores del exponente constante $p$ la ecuación $y\'\' + x^4 y\' + y^p = \\ln x$ (con $x > 0$) es una EDO <strong>lineal</strong>?',
      'Para $p = 0$ o $p = 1$', [
        ['Para cualquier entero $p \\ge 1$', 'Casi: si $p = 2, 3, \\dots$, el término $y^p$ no es lineal en $y$.'],
        ['Solo para $p = 1$, porque con $p = 0$ desaparece $y$', 'Casi: con $p = 0$ queda $y^0 = 1$, que pasa al lado derecho como función de $x$ y la ecuación sigue siendo lineal en $y$.'],
        ['Para ningún valor de $p$, por el coeficiente $x^4$ y el $\\ln x$', 'Casi: $x^4$ y $\\ln x$ solo dependen de $x$, así que no afectan la linealidad.']],
      'Con $p = 1$ el término es $y$ (lineal), y con $p = 0$ es $1$ (término independiente de $y$, también lineal).'),

    N('cl-orden-num', 'clasificacion', 1, { n: [2, 5, 1], p: [6, 9, 1], m: [2, 6, 1] },
      function (v) { return 'Escribe como número entero el orden de la ecuación diferencial $x^{' + v.m + '} y^{(' + v.n + ')} + (y\')^{' + v.p + '} = e^x$.'; },
      function (v) { return v.n; },
      'El orden es el índice de la derivada más alta, $y^{(n)}$, no el exponente $p$ ni la potencia de $x$.',
      { mistakes: {
          expY: function (v) { return v.p; },
          sumAll: function (v) { return v.n + v.p; }
        },
        feedback: [
          { when: 'expY', say: function (v) { return 'Casi: ' + v.p + ' es el exponente al que está elevado $y\'$, no el orden de derivación.'; } },
          { when: 'sumAll', say: 'Casi: no se suman el orden y el exponente; toma solo el orden de la derivada más alta.' }
        ] }),

    N('cl-num-constantes', 'clasificacion', 1, { n: [2, 6, 1], k: [3, 8, 1] },
      function (v) { return '¿Cuántas constantes arbitrarias independientes debe tener la solución general de la EDO $\\dfrac{d^{' + v.n + '}y}{dx^{' + v.n + '}} + ' + v.k + 'x\\,y = 0$?'; },
      function (v) { return v.n; },
      'La solución general de una EDO de orden $n$ contiene $n$ constantes arbitrarias.',
      { mistakes: {
          coefK: function (v) { return v.k; },
          plusOne: function (v) { return v.n + 1; }
        },
        feedback: [
          { when: 'coefK', say: function (v) { return 'Casi: ' + v.k + ' es solo un coeficiente; el número de constantes es igual al orden de la ecuación.'; } },
          { when: 'plusOne', say: 'Casi: hay exactamente una constante por cada orden de derivación, no una extra.' }
        ] }),

    N('cl-eval-g', 'clasificacion', 2, { a: [2, 5, 1], b: [2, 6, 1], x0: [1, 3, 1] },
      function (v) { return 'Al escribir la EDO lineal $y\' - ' + v.a + 'x\\,y - ' + v.b + 'x^2 = ' + v.a + 'y$ en la forma estándar $a_1(x)y\' + a_0(x)y = g(x)$ con $a_1(x) = 1$, ¿cuánto vale $g(' + v.x0 + ')$?'; },
      function (v) { return v.b * v.x0 * v.x0; },
      'Pasa los términos con $y$ a la izquierda y los que solo dependen de $x$ a la derecha: $y\' - (ax + a)y = bx^2$, así que $g(x) = bx^2$.',
      { mistakes: {
          negG: function (v) { return -v.b * v.x0 * v.x0; },
          coefA0: function (v) { return -(v.a * v.x0 + v.a); }
        },
        feedback: [
          { when: 'negG', say: 'Casi: al pasar $-bx^2$ al lado derecho cambia de signo a $+bx^2$.' },
          { when: 'coefA0', say: 'Casi: ese es el coeficiente $a_0(x)$ de $y$; $g(x)$ es el término que no multiplica a $y$.' }
        ] }),

    N('cl-eval-a0', 'clasificacion', 2, { a: [2, 5, 1], b: [1, 4, 1], x0: [1, 3, 1] },
      function (v) { return 'Reescribe $x\\,y\'\' + ' + v.a + 'y\' = ' + v.b + 'x^2 y + 7$ en la forma $a_2(x)y\'\' + a_1(x)y\' + a_0(x)y = 7$. ¿Cuánto vale el coeficiente $a_0(' + v.x0 + ')$?'; },
      function (v) { return -v.b * v.x0 * v.x0; },
      'Al pasar $bx^2 y$ al lado izquierdo queda $-bx^2 y$, por lo que $a_0(x) = -bx^2$.',
      { mistakes: {
          posA0: function (v) { return v.b * v.x0 * v.x0; },
          withRhs: function (v) { return -v.b * v.x0 * v.x0 + 7; }
        },
        feedback: [
          { when: 'posA0', say: 'Casi: al pasar el término con $y$ del lado derecho al izquierdo, cambia de signo.' },
          { when: 'withRhs', say: 'Casi: el 7 es el término independiente $g(x)$, no parte del coeficiente de $y$.' }
        ] }),

    N('cl-param-anula', 'clasificacion', 2, { k: [2, 9, 1], m: [2, 5, 1] },
      function (v) { return '¿Para qué valor de la constante $a$ la ecuación $y\'\' + (a - ' + v.k + ')\\,y^{' + v.m + '} + x\\,y\' = 0$ se convierte en una EDO <strong>lineal</strong>?'; },
      function (v) { return v.k; },
      'El único término no lineal es $(a - k)y^m$; se elimina cuando su coeficiente vale cero, es decir, $a = k$.',
      { mistakes: {
          negK: function (v) { return -v.k; },
          valM: function (v) { return v.m; }
        },
        feedback: [
          { when: 'negK', say: 'Casi: para que $a - k = 0$ necesitas $a = k$, con signo positivo.' },
          { when: 'valM', say: 'Casi: ese es el exponente de $y$; busca el valor de $a$ que anula el coeficiente $(a - k)$.' }
        ] }),

    N('cl-param-cuad', 'clasificacion', 3, { c: [2, 6, 1], d: [1, 5, 1] },
      function (v) { return 'En la ecuación $y\' + (b^2 - ' + (v.c * v.c) + ')\\,y\\,y\' + (b + ' + v.c + ')\\,y^3 + ' + v.d + 'x\\,y = 0$, ¿qué valor de la constante $b$ anula <em>ambos</em> términos no lineales a la vez?'; },
      function (v) { return -v.c; },
      'Para anular $(b + c)y^3$ necesitas $b = -c$, y ese mismo valor también anula $b^2 - c^2 = 0$.',
      { mistakes: {
          posC: function (v) { return v.c; },
          sqC: function (v) { return v.c * v.c; }
        },
        feedback: [
          { when: 'posC', say: function (v) { return 'Casi: con $b = ' + v.c + '$ se anula $b^2 - ' + (v.c * v.c) + '$, pero el coeficiente $b + ' + v.c + '$ de $y^3$ queda en $' + (2 * v.c) + ' \\neq 0$.'; } },
          { when: 'sqC', say: 'Casi: despeja $b$ de $b + c = 0$ para que desaparezcan tanto $y^3$ como $y\\,y\'$.' }
        ] }),

    /* ======================= 2. Comprobación de soluciones (18) ======================= */
    C('so-que-es', 'solucion', 1,
      '¿Qué significa que una función $y = \\varphi(x)$ sea solución de una EDO en un intervalo $I$?',
      'Que al sustituir $\\varphi(x)$ y sus derivadas en la ecuación, la igualdad se cumple para todo $x$ en $I$', [
        ['Que la igualdad se cumple al menos en un punto $x_0$ del intervalo', 'Casi: coincidir en un solo punto no basta; debe cumplirse como identidad en todo el intervalo $I$.'],
        ['Que $\\varphi(x) = 0$ para todo $x$ en $I$', 'Casi: eso es hallar raíces de $\\varphi$, no comprobar una ecuación diferencial.'],
        ['Que $\\varphi\'(x) = 0$ en todo el intervalo', 'Casi: las soluciones casi nunca son constantes; su derivada debe cumplir la relación que pide la EDO.']],
      'Una solución convierte la EDO en una identidad válida para todos los puntos $x$ del intervalo $I$.'),

    C('so-un-punto-falso', 'solucion', 1,
      'Sustituyes $y = x^2$ en la ecuación $y\' = 2y$ y notas que en $x = 1$ ambos lados dan $2$. ¿Prueba eso que $y = x^2$ es solución?',
      'No: $y\' = 2x$ y $2y = 2x^2$ solo coinciden en $x = 0$ y $x = 1$, no en un intervalo', [
        ['Sí, porque al sustituir en $x = 1$ se cumple la igualdad', 'Casi: comprobar en un punto suelto es el error más común; la igualdad debe valer para todo $x$ de un intervalo.'],
        ['Sí, pero únicamente para $x \\ge 1$', 'Casi: para $x = 2$, $y\' = 4$ mientras que $2y = 8$; no son iguales.'],
        ['No, porque una parábola nunca puede ser solución de una EDO', 'Casi: $y = x^2$ sí es solución de otras EDOs, como $x\\,y\' = 2y$, pero no de $y\' = 2y$.']],
      'Para ser solución, $y\'(x)$ y $2y(x)$ tendrían que ser la misma función en todo un intervalo, no solo cruzarse en un punto.'),

    C('so-cual-cumple-xy', 'solucion', 2,
      function (v) { return '¿Cuál de las siguientes funciones es solución de $x\\,y\' = ' + v.m + 'y$ para todo $x > 0$?'; },
      function (v) { return '$y = x^{' + v.m + '}$'; }, [
        [function (v) { return '$y = ' + v.m + 'x$'; }, 'Casi: con una recta $y = mx$ queda $x\\,y\' = mx$, pero el lado derecho pide $m^2 x$.'],
        [function (v) { return '$y = e^{' + v.m + 'x}$'; }, 'Casi: la exponencial cumple $y\' = my$, sin el factor $x$ multiplicando a $y\'$.'],
        [function (v) { return '$y = x^{' + (v.m + 1) + '}$'; }, 'Casi: al derivar $x^{m+1}$ baja un factor $m + 1$, no $m$.']],
      'Si $y = x^m$, entonces $y\' = mx^{m-1}$ y al multiplicar por $x$ resulta $x\\,y\' = mx^m = my$.',
      { vars: { m: [2, 6, 1] } }),

    C('so-general-vs-part', 'solucion', 2,
      'Para la ecuación $y\' = 4y$, ¿cuál es la diferencia entre $y = Ce^{4x}$ y $y = 7e^{4x}$?',
      '$y = Ce^{4x}$ es la solución general (familia) y $y = 7e^{4x}$ es una solución particular', [
        ['$y = 7e^{4x}$ es la solución general y $y = Ce^{4x}$ es una aproximación', 'Casi: es al revés; la solución con la constante arbitraria $C$ es la general, y ambas son exactas.'],
        ['Solo $y = Ce^{4x}$ es solución; al cambiar $C$ por $7$ deja de cumplir la EDO', 'Casi: la ecuación se cumple para cualquier valor fijo de $C$, incluido $C = 7$.'],
        ['Ninguna: las dos se llaman soluciones particulares', 'Casi: cuando conserva la constante arbitraria $C$ representa a toda la familia y se llama solución general.']],
      'La solución general contiene la constante arbitraria $C$; darle un valor concreto a $C$ produce una solución particular.'),

    C('so-implicita-circ', 'solucion', 2,
      'La relación $x^2 + y^2 = 25$ define implícitamente soluciones de una EDO (para $y \\neq 0$). Al derivar implícitamente respecto a $x$, ¿qué ecuación cumple?',
      '$x + y\\,y\' = 0$', [
        ['$2x + 2y = 0$', 'Casi: olvidaste multiplicar por $y\'$ al derivar $y^2$ respecto a $x$ (regla de la cadena).'],
        ['$x + y\\,y\' = 25$', 'Casi: la derivada de la constante $25$ respecto a $x$ es $0$, no $25$.'],
        ['$y\' = 2x + 2y$', 'Casi: al derivar ambos lados de $x^2 + y^2 = 25$ sale $2x + 2y\\,y\' = 0$.']],
      'Derivando respecto a $x$: $\\frac{d}{dx}(x^2 + y^2) = 2x + 2y\\,y\' = 0$, que simplificada entre 2 es $x + y\\,y\' = 0$.'),

    C('so-cadena-osc', 'solucion', 2,
      function (v) { return 'Al comprobar que $y = \\sin(' + v.w + 'x)$ resuelve $y\'\' + ' + (v.w * v.w) + 'y = 0$, ¿cuánto vale la segunda derivada $y\'\'$?'; },
      function (v) { return '$y\'\' = -' + (v.w * v.w) + '\\sin(' + v.w + 'x)$'; }, [
        [function (v) { return '$y\'\' = -' + v.w + '\\sin(' + v.w + 'x)$'; }, 'Casi: aplicaste la regla de la cadena solo en la primera derivada; al derivar dos veces el factor interno sale al cuadrado.'],
        [function (v) { return '$y\'\' = ' + (v.w * v.w) + '\\sin(' + v.w + 'x)$'; }, 'Casi: la derivada del coseno lleva signo negativo, así que $y\'\'$ queda con signo menos.'],
        [function (v) { return '$y\'\' = -' + (v.w * v.w) + '\\cos(' + v.w + 'x)$'; }, 'Casi: al derivar dos veces el seno regresas a seno (con signo menos), no a coseno.']],
      'Primera derivada: $w\\cos(wx)$; segunda derivada: $-w^2\\sin(wx)$.',
      { vars: { w: [2, 6, 1] } }),

    C('so-suma-lineal', 'solucion', 3,
      'Si $y_1(x)$ y $y_2(x)$ son soluciones de la ecuación lineal homogénea $y\'\' + p(x)y\' + q(x)y = 0$, ¿qué pasa al sustituir $y = y_1(x) + y_2(x)$?',
      'También es solución, porque la derivada de una suma es la suma de las derivadas y los términos se agrupan', [
        ['No es solución, a menos que $y_1 = y_2$', 'Casi: en toda ecuación lineal igualada a cero, la suma de dos soluciones siempre es otra solución.'],
        ['Da el doble de cero, así que solo sirve si divides entre 2', 'Casi: $0 + 0 = 0$; no hace falta dividir entre 2.'],
        ['Solo es solución si los coeficientes $p(x)$ y $q(x)$ son constantes', 'Casi: la propiedad vale para cualquier EDO lineal homogénea, aunque sus coeficientes dependan de $x$.']],
      'Al sustituir $y_1 + y_2$ en el lado izquierdo se separa en $(y_1\'\' + py_1\' + qy_1) + (y_2\'\' + py_2\' + qy_2) = 0 + 0 = 0$.'),

    N('so-hallar-k-exp', 'solucion', 1, { a: [2, 9, 1] },
      function (v) { return '¿Para qué valor de la constante $r$ la función $y = e^{rx}$ es solución de $y\' + ' + v.a + 'y = 0$?'; },
      function (v) { return -v.a; },
      'Al sustituir $y = e^{rx}$ y $y\' = r\\,e^{rx}$ queda $(r + a)e^{rx} = 0$, de donde $r = -a$.',
      { mistakes: {
          posA: function (v) { return v.a; },
          invA: function (v) { return -1 / v.a; }
        },
        feedback: [
          { when: 'posA', say: 'Casi: de $r + a = 0$ al despejar $r$ sale signo negativo.' },
          { when: 'invA', say: 'Casi: no se divide; de $r + a = 0$ se despeja restando $a$.' }
        ] }),

    N('so-hallar-m-pot', 'solucion', 1, { k: [2, 8, 1] },
      function (v) { return 'Encuentra el valor positivo de $m$ para el cual $y = x^m$ (con $x > 0$) es solución de $x^2 y\'\' - ' + (v.k * (v.k - 1)) + 'y = 0$.'; },
      function (v) { return v.k; },
      'Con $y = x^m$, $x^2 y\'\' = m(m - 1)x^m$. Igualando $m(m - 1) = k(k - 1)$ con $m > 0$ se obtiene $m = k$.',
      { mistakes: {
          minusOne: function (v) { return v.k - 1; },
          prodVal: function (v) { return v.k * (v.k - 1); }
        },
        feedback: [
          { when: 'minusOne', say: 'Casi: recuerda que al derivar dos veces $x^m$ el coeficiente es $m(m - 1)$; prueba con una unidad más.' },
          { when: 'prodVal', say: 'Casi: ese es el producto $m(m - 1)$, no el exponente $m$.' }
        ] }),

    N('so-hallar-A-part', 'solucion', 1, { a: [2, 6, 1], b: [3, 9, 1] },
      function (v) { return '¿Qué valor de la constante $A$ hace que la función constante $y = A$ sea solución de $y\' + ' + v.a + 'y = ' + (v.a * v.b) + '$?'; },
      function (v) { return v.b; },
      'Si $y = A$ es constante, entonces $y\' = 0$; sustituyendo queda $0 + aA = ab \\Rightarrow A = b$.',
      { mistakes: {
           forgotA: function (v) { return v.a * v.b; },
          negB: function (v) { return -v.b; }
        },
        feedback: [
          { when: 'forgotA', say: function (v) { return 'Casi: tienes $' + v.a + 'A = ' + (v.a * v.b) + '$; falta dividir entre $' + v.a + '$.'; } },
          { when: 'negB', say: 'Casi: revisa el signo al despejar $A$ de $aA = ab$.' }
        ] }),

    N('so-residuo-exp', 'solucion', 2, { r: [2, 4, 1], a: [1, 3, 1], x0: [1, 2, 1] },
      function (v) { return 'Para probar si $y = e^{' + v.r + 'x}$ resuelve $y\' - ' + v.a + 'y = 0$, calcula el residuo $R(x) = y\' - ' + v.a + 'y$ evaluado en $x = ' + v.x0 + '$.'; },
      function (v) { return (v.r - v.a) * Math.exp(v.r * v.x0); },
      'Como $y\' = r\\,e^{rx}$, el residuo es $R(x) = (r - a)e^{rx}$.',
      { where: function (v) { return v.r !== v.a; },
        mistakes: {
          noChain: function (v) { return (1 - v.a) * Math.exp(v.r * v.x0); },
          plusA: function (v) { return (v.r + v.a) * Math.exp(v.r * v.x0); }
        },
        feedback: [
          { when: 'noChain', say: function (v) { return 'Casi: al derivar $e^{' + v.r + 'x}$ baja un factor $' + v.r + '$ por la regla de la cadena.'; } },
          { when: 'plusA', say: 'Casi: en la ecuación aparece $-' + 'ay$, no $+ay$.' }
        ] }),

    N('so-hallar-b-recta', 'solucion', 2, { m: [2, 5, 1], a: [2, 4, 1], c: [1, 6, 1] },
      function (v) { return 'La recta $y = ' + v.m + 'x + b$ es solución de la EDO $y\' + ' + v.a + 'y = ' + (v.a * v.m) + 'x + ' + v.c + '$. ¿Cuánto debe valer $b$?'; },
      function (v) { return (v.c - v.m) / v.a; },
      'Sustituyendo $y\' = m$ y $y = mx + b$: $m + a(mx + b) = amx + (m + ab) = amx + c \\Rightarrow b = (c - m)/a$.',
      { where: function (v) { return v.c !== v.m; },
        mistakes: {
          noDeriv: function (v) { return v.c / v.a; },
          wrongSign: function (v) { return (v.c + v.m) / v.a; },
          noDivide: function (v) { return v.c - v.m; }
        },
        feedback: [
          { when: 'noDeriv', say: function (v) { return 'Casi: olvidaste sumar $y\' = ' + v.m + '$ en el lado izquierdo antes de despejar $b$.'; } },
          { when: 'wrongSign', say: function (v) { return 'Casi: al pasar $y\' = ' + v.m + '$ restando al lado derecho queda $c - ' + v.m + '$, no $c + ' + v.m + '$.'; } },
          { when: 'noDivide', say: function (v) { return 'Casi: falta dividir entre el coeficiente $' + v.a + '$ que multiplica a $y$.'; } }
        ] }),

    N('so-hallar-k-osc', 'solucion', 2, { w: [2, 7, 1], c1: [2, 5, 1], c2: [1, 4, 1] },
      function (v) { return 'Si $y = ' + v.c1 + '\\cos(' + v.w + 'x) - ' + v.c2 + '\\sin(' + v.w + 'x)$ es solución de $y\'\' + k\\,y = 0$, ¿cuánto vale la constante $k$?'; },
      function (v) { return v.w * v.w; },
      'Al derivar dos veces $\\cos(wx)$ y $\\sin(wx)$ sale un factor $-w^2$, así que $y\'\' = -w^2 y$ y por tanto $k = w^2$.',
      { mistakes: {
          justW: function (v) { return v.w; },
          negW2: function (v) { return -v.w * v.w; }
        },
        feedback: [
          { when: 'justW', say: function (v) { return 'Casi: cada derivada saca un factor $' + v.w + '$, así que en la segunda derivada el factor es $' + v.w + '^2 = ' + (v.w * v.w) + '$.'; } },
          { when: 'negW2', say: 'Casi: $y\'\' = -w^2 y$, así que al pasar sumando queda $y\'\' + w^2 y = 0$ con $k > 0$.' }
        ] }),

    N('so-hallar-A-exp', 'solucion', 2, { r: [2, 5, 1], a: [1, 4, 1], k: [3, 8, 1] },
      function (v) { return 'Encuentra el coeficiente $A$ para que $y = A\\,e^{' + v.r + 'x}$ sea solución de $y\' + ' + v.a + 'y = ' + v.k + 'e^{' + v.r + 'x}$.'; },
      function (v) { return v.k / (v.r + v.a); },
      'Sustituyendo $y\' = rAe^{rx}$: $(r + a)Ae^{rx} = ke^{rx} \\Rightarrow A = k/(r + a)$.',
      { mistakes: {
          noChain: function (v) { return v.k / (1 + v.a); },
          minusSign: function (v) { return v.k / (v.r - v.a); },
          multInstead: function (v) { return v.k * (v.r + v.a); }
        },
        feedback: [
          { when: 'noChain', say: function (v) { return 'Casi: al derivar $Ae^{' + v.r + 'x}$ baja un factor $' + v.r + '$, quedando $(' + v.r + ' + ' + v.a + ')A$.'; } },
          { when: 'minusSign', say: 'Casi: la ecuación tiene $+ay$, así que los coeficientes se suman: $r + a$.' },
          { when: 'multInstead', say: 'Casi: para despejar $A$ de $(r + a)A = k$ hay que dividir entre $r + a$, no multiplicar.' }
        ] }),

    N('so-residuo-pol', 'solucion', 2, { a: [2, 5, 1], b: [1, 4, 1], x0: [1, 3, 1] },
      function (v) { return 'Sea $y = ' + v.a + 'x^2 + ' + v.b + 'x$. Calcula el valor de $x\\,y\' - 2y$ en $x = ' + v.x0 + '$.'; },
      function (v) { return -v.b * v.x0; },
      '$y\' = 2ax + b$, así que $x\\,y\' - 2y = (2ax^2 + bx) - (2ax^2 + 2bx) = -bx$.',
      { mistakes: {
          posBx: function (v) { return v.b * v.x0; },
          noMultX: function (v) { return 2 * v.a * v.x0 + v.b - 2 * (v.a * v.x0 * v.x0 + v.b * v.x0); }
        },
        feedback: [
          { when: 'posBx', say: 'Casi: de $bx - 2bx$ queda $-bx$, con signo negativo.' },
          { when: 'noMultX', say: 'Casi: el primer término de la ecuación es $x\\,y\'$, no solo $y\'$.' }
        ] }),

    N('so-raiz-menor-seg', 'solucion', 3, { r1: [1, 3, 1], r2: [4, 7, 1] },
      function (v) {
        var s = v.r1 + v.r2, p = v.r1 * v.r2;
        return 'La función $y = e^{rx}$ es solución de $y\'\' - ' + s + 'y\' + ' + p + 'y = 0$ para dos valores de $r$. ¿Cuál es el <strong>menor</strong> de esos dos valores?';
      },
      function (v) { return v.r1; },
      'Al sustituir $y = e^{rx}$ queda $(r^2 - sr + p)e^{rx} = 0$, cuyas raíces son $r_1$ y $r_2$.',
      { mistakes: {
          largerRoot: function (v) { return v.r2; },
          negRoot: function (v) { return -v.r1; }
        },
        feedback: [
          { when: 'largerRoot', say: 'Casi: esa es la raíz mayor del polinomio característico; la pregunta pide la menor.' },
          { when: 'negRoot', say: 'Casi: al factorizar $(r - r_1)(r - r_2) = 0$, ambas raíces son positivas.' }
        ] }),

    N('so-hallar-A-cos', 'solucion', 3, { w: [2, 4, 1], a: [1, 5, 1], k: [4, 10, 2] },
      function (v) {
        var c = v.a + v.w * v.w;
        return '¿Para qué valor de $A$ la función $y = A\\cos(' + v.w + 'x)$ resuelve la ecuación $y\'\' + ' + c + 'y = ' + v.k + '\\cos(' + v.w + 'x)$?';
      },
      function (v) { return v.k / v.a; },
      'Como $y\'\' = -w^2 A\\cos(wx)$, al sustituir queda $(-w^2 + c)A\\cos(wx) = aA\\cos(wx) = k\\cos(wx) \\Rightarrow A = k/a$.',
      { mistakes: {
          noChain2: function (v) { return v.k / (v.a + v.w * v.w - v.w); },
          plusW2: function (v) { return v.k / (v.a + 2 * v.w * v.w); }
        },
        feedback: [
          { when: 'noChain2', say: function (v) { return 'Casi: la segunda derivada de $\\cos(' + v.w + 'x)$ lleva $-' + (v.w * v.w) + '$, no $-' + v.w + '$.'; } },
          { when: 'plusW2', say: 'Casi: la segunda derivada de $\\cos(wx)$ tiene signo negativo, así que resta $w^2$ al coeficiente de $y$.' }
        ] }),

    N('so-coef-prod-exp', 'solucion', 3, { r: [2, 5, 1], m: [2, 4, 1], x0: [1, 2, 1] },
      function (v) { return 'Sustituye $y = x^{' + v.m + '} e^{' + v.r + 'x}$ en el lado izquierdo de $y\' - ' + v.r + 'y$ y evalúa el resultado en $x = ' + v.x0 + '$.'; },
      function (v) { return v.m * Math.pow(v.x0, v.m - 1) * Math.exp(v.r * v.x0); },
      'Por la regla del producto, $y\' = mx^{m-1}e^{rx} + rx^m e^{rx}$, así que $y\' - ry = mx^{m-1}e^{rx}$.',
      { mistakes: {
          noProd: function (v) { return v.m * Math.pow(v.x0, v.m - 1) * v.r * Math.exp(v.r * v.x0); },
          keptPower: function (v) { return v.m * Math.pow(v.x0, v.m) * Math.exp(v.r * v.x0); }
        },
        feedback: [
          { when: 'noProd', say: 'Casi: no se multiplican las derivadas de los factores; usa la regla del producto $(uv)\' = u\'v + uv\'$.' },
          { when: 'keptPower', say: function (v) { return 'Casi: al derivar $x^{' + v.m + '}$ el exponente disminuye en 1, quedando $x^{' + (v.m - 1) + '}$.'; } }
        ] }),

    /* ======================= 3. Problema de valor inicial (18) ======================= */
    C('pv-que-fija', 'pvi', 1,
      'Geométricamente, ¿qué hace la condición inicial $y(x_0) = y_0$ en una EDO de primer orden?',
      'Selecciona de la familia general la curva solución que pasa por el punto $(x_0, y_0)$', [
        ['Cambia la pendiente de todas las curvas en todos los puntos del plano', 'Casi: las pendientes las fija la ecuación diferencial, no la condición inicial.'],
        ['Convierte una ecuación no lineal en una ecuación lineal', 'Casi: la condición inicial solo fija la constante $C$, no cambia el tipo de ecuación.'],
        ['Obliga a que la solución tenga derivada cero en $x = x_0$', 'Casi: $y(x_0) = y_0$ fija la altura de la curva en $x_0$, no su pendiente.']],
      'La solución general es toda una familia de curvas; pedir $y(x_0) = y_0$ escoge la que pasa por $(x_0, y_0)$.'),

    C('pv-con-C-suelta', 'pvi', 1,
      'Al entregar la respuesta final de un problema de valor inicial (PVI), ¿debe aparecer la constante arbitraria $C$?',
      'No: las condiciones iniciales sirven justamente para despejar y sustituir el valor numérico de $C$', [
        ['Sí, siempre hay que agregar $+C$ al final de cualquier problema de ecuaciones diferenciales', 'Casi: $+C$ va en la solución general; en un PVI ya tiene un valor fijo determinado por la condición inicial.'],
        ['Sí, pero solo cuando la condición inicial se da en $x_0 = 0$', 'Casi: en $x_0 = 0$ también se despeja $C$ y se sustituye su número.'],
        ['Solo si la ecuación diferencial es no lineal', 'Casi: tampoco en las no lineales queda $C$ libre cuando resuelves un PVI.']],
      'En un PVI la constante queda determinada por la condición inicial, así que la respuesta es una función única sin $C$.'),

    C('pv-cuidado-e0', 'pvi', 2,
      function (v) { return 'En la familia $y = ' + v.a + ' + Ce^{-x}$, un estudiante usa la condición $y(0) = ' + v.b + '$ y escribe «como $x = 0$, el término $Ce^{-x}$ se hace $0$, así que no hay solución». ¿Cuál fue su error?'; },
      function (v) { return 'Que $e^0 = 1$, no $0$; en $x = 0$ queda $' + v.a + ' + C = ' + v.b + '$, de donde $C = ' + (v.b - v.a) + '$'; }, [
        ['Que $e^0$ no está definido en los números reales', 'Casi: $e^0$ está perfectamente definido y vale $1$.'],
        [function (v) { return 'Que debía derivar la familia antes de evaluar $y(0) = ' + v.b + '$'; }, 'Casi: la condición es sobre $y(0)$, así que se evalúa directamente en la familia $y(x)$.'],
        [function (v) { return 'Que en realidad $C$ vale $' + v.b + '$ directamente porque $' + v.a + '$ desaparece'; }, 'Casi: el término constante no desaparece al evaluar; queda $a + C = b$.']],
      'Al evaluar en $x = 0$, $e^{-0} = 1$, por lo que $y(0) = a + C\\cdot 1 = a + C$.',
      { vars: { a: [2, 6, 1], b: [7, 12, 1] } }),

    C('pv-cuantas-cond', 'pvi', 2,
      '¿Qué datos en un mismo punto $x_0$ forman un PVI bien planteado para una ecuación diferencial de tercer orden?',
      '$y(x_0)$, $y\'(x_0)$ y $y\'\'(x_0)$', [
        ['Solo $y(x_0)$, porque el punto inicial es uno solo', 'Casi: con una sola condición te sobrarían dos constantes arbitrarias sin determinar.'],
        ['$y(x_0)$, $y\'(x_0)$, $y\'\'(x_0)$ y $y\'\'\'(x_0)$', 'Casi: son 3 condiciones (hasta la derivada de orden $n - 1 = 2$); la tercera derivada ya la fija la propia EDO.'],
        ['Solo $y\'\'\'(x_0)$', 'Casi: hacen falta tres condiciones iniciales para fijar las tres constantes de integración.']],
      'Una EDO de orden $n$ necesita $n$ condiciones iniciales en $x_0$: desde $y(x_0)$ hasta $y^{(n-1)}(x_0)$.'),

    C('pv-traslacion-autonoma', 'pvi', 3,
      'Si la familia general de $y\' = 2y$ se escribe como $y = Ce^{2x}$, pero el PVI da la condición en $x_0 = 3$, ¿por qué conviene escribir la familia en la forma equivalente $y = K\\,e^{2(x - 3)}$?',
      'Porque al evaluar en $x = 3$ el exponente vale $0$ y sale de inmediato $K = y(3)$', [
        ['Porque $Ce^{2x}$ no es válida cuando $x_0 \\neq 0$', 'Casi: $Ce^{2x}$ sigue siendo válida (con $C = K\\,e^{-6}$); solo es más cómodo centrar el exponente en $x_0$.'],
        ['Porque así la ecuación diferencial cambia de orden', 'Casi: reescribir la constante como $C = Ke^{-6}$ no cambia la ecuación ni su orden.'],
        ['Porque $e^{2(x-3)}$ es igual a $e^{2x} - e^6$', 'Casi: por leyes de los exponentes, $e^{2(x-3)} = e^{2x}\\cdot e^{-6}$, no una resta.']],
      'Como $e^{2(x - 3)} = e^{-6}e^{2x}$, reabsorber $e^{-6}$ en la constante hace que en $x = 3$ la exponencial valga $e^0 = 1$.'),

    E('pv-e-pol', 'pvi', 1, { a: [2, 6, 2], b: [1, 5, 1], c: [1, 6, 1] },
      function (v) { return 'Resuelve por integración directa el PVI $y\' = ' + v.a + 'x + ' + v.b + '$ con condición inicial $y(0) = ' + v.c + '$. Escribe la función $y(x)$.'; },
      function (v) { return (v.a / 2) + '*x^2 + ' + v.b + '*x + ' + v.c; },
      'Integra término a término: $y = \\frac{a}{2}x^2 + bx + C$, y con $y(0) = c$ resulta $C = c$.',
      { domain: [-2, 3],
        mistakes: {
          noC: function (v) { return (v.a / 2) + '*x^2 + ' + v.b + '*x'; },
          noDiv2: function (v) { return v.a + '*x^2 + ' + v.b + '*x + ' + v.c; }
        },
        feedback: [
          { when: 'noC', say: function (v) { return 'Casi: te faltó sumar la constante $C = ' + v.c + '$ dada por $y(0) = ' + v.c + '$.'; } },
          { when: 'noDiv2', say: 'Casi: al integrar $ax$ sale $(a/2)x^2$; olvidaste dividir entre 2.' }
        ] }),

    E('pv-e-exp-fam', 'pvi', 2, { k: [2, 5, 1], y0: [2, 8, 1] },
      function (v) { return 'La solución general de $y\' = -' + v.k + 'y$ es $y = Ce^{-' + v.k + 'x}$. Encuentra la solución del PVI con $y(0) = ' + v.y0 + '$. Escribe $y(x)$.'; },
      function (v) { return v.y0 + '*e^(-' + v.k + '*x)'; },
      'Evaluando en $x = 0$: $y(0) = Ce^0 = C = y_0$, así que $y(x) = y_0 e^{-kx}$.',
      { domain: [0, 1.5],
        mistakes: {
          posExp: function (v) { return v.y0 + '*e^(' + v.k + '*x)'; },
          addedC: function (v) { return 'e^(-' + v.k + '*x) + ' + (v.y0 - 1); }
        },
        feedback: [
          { when: 'posExp', say: 'Casi: el exponente de la familia lleva signo negativo, $e^{-kx}$.' },
          { when: 'addedC', say: 'Casi: en $y = Ce^{-kx}$ la constante $C$ multiplica a la exponencial, no se suma afuera.' }
        ] }),

    E('pv-e-lin-fam', 'pvi', 2, { a: [1, 4, 1], y0: [2, 6, 1] },
      function (v) { return 'La familia $y = x - ' + v.a + ' + Ce^{-x}$ resuelve $y\' = x - (' + (v.a - 1) + ') - y$. Escribe la solución $y(x)$ que cumple $y(0) = ' + v.y0 + '$.'; },
      function (v) { return 'x - ' + v.a + ' + ' + (v.y0 + v.a) + '*e^(-x)'; },
      'En $x = 0$: $y(0) = -a + C = y_0 \\Rightarrow C = y_0 + a$.',
      { domain: [-0.5, 2],
        mistakes: {
          justY0: function (v) { return 'x - ' + v.a + ' + ' + v.y0 + '*e^(-x)'; },
          subA: function (v) { return 'x - ' + v.a + ' + ' + (v.y0 - v.a) + '*e^(-x)'; }
        },
        feedback: [
          { when: 'justY0', say: function (v) { return 'Casi: $C$ no es igual a $y(0)$ porque en $x = 0$ también está el término $-' + v.a + '$.'; } },
          { when: 'subA', say: function (v) { return 'Casi: de $-' + v.a + ' + C = ' + v.y0 + '$ se despeja $C = ' + v.y0 + ' + ' + v.a + '$, sumando.'; } }
        ] }),

    E('pv-e-trig-dir', 'pvi', 2, { w: [2, 5, 1], a: [1, 4, 1], y0: [3, 7, 1] },
      function (v) { return 'Resuelve el PVI $\\dfrac{dy}{dt} = ' + (v.a * v.w) + '\\cos(' + v.w + 't)$ con $y(0) = ' + v.y0 + '$. Escribe la función $y(t)$.'; },
      function (v) { return v.a + '*sin(' + v.w + '*t) + ' + v.y0; },
      'Integrando: $y(t) = a\\sin(wt) + C$. Como $\\sin(0) = 0$, $y(0) = C = y_0$.',
      { exprVars: ['t'], domain: [0.1, 2],
        mistakes: {
          noChainDiv: function (v) { return (v.a * v.w) + '*sin(' + v.w + '*t) + ' + v.y0; },
          negSin: function (v) { return '-' + v.a + '*sin(' + v.w + '*t) + ' + v.y0; }
        },
        feedback: [
          { when: 'noChainDiv', say: function (v) { return 'Casi: al integrar $\\cos(' + v.w + 't)$ hay que dividir entre $' + v.w + '$.'; } },
          { when: 'negSin', say: 'Casi: la integral de $\\cos(wt)$ tiene signo positivo, $+\\frac{1}{w}\\sin(wt)$.' }
        ] }),

    E('pv-e-sin-dir', 'pvi', 2, { w: [2, 4, 1], a: [2, 5, 1], y0: [1, 5, 1] },
      function (v) { return 'Resuelve por integración directa $y\' = ' + (v.a * v.w) + '\\sin(' + v.w + 'x)$ con condición inicial $y(0) = ' + v.y0 + '$. Escribe $y(x)$.'; },
      function (v) { return (-v.a) + '*cos(' + v.w + '*x) + ' + (v.y0 + v.a); },
      'Integrando sale $y = -a\\cos(wx) + C$. En $x = 0$, $\\cos(0) = 1$, así que $-a + C = y_0 \\Rightarrow C = y_0 + a$.',
      { domain: [0.1, 2],
        mistakes: {
          cIsY0: function (v) { return (-v.a) + '*cos(' + v.w + '*x) + ' + v.y0; },
          posCos: function (v) { return v.a + '*cos(' + v.w + '*x) + ' + (v.y0 - v.a); }
        },
        feedback: [
          { when: 'cIsY0', say: 'Casi: recuerda que $\\cos(0) = 1$, no $0$; en $x = 0$ tienes $-a + C = y(0)$.' },
          { when: 'posCos', say: 'Casi: la antiderivada de $\\sin(wx)$ es $-\\frac{1}{w}\\cos(wx)$, con signo menos.' }
        ] }),

    E('pv-e-exp-dir', 'pvi', 2, { k: [2, 4, 1], a: [1, 4, 1], y0: [2, 6, 1] },
      function (v) { return 'Encuentra la solución del PVI $y\' = ' + (v.a * v.k) + 'e^{' + v.k + 'x}$ con $y(0) = ' + v.y0 + '$. Escribe $y(x)$.'; },
      function (v) { return v.a + '*e^(' + v.k + '*x) + ' + (v.y0 - v.a); },
      'Al integrar queda $y = ae^{kx} + C$. Evaluando en $x = 0$: $a + C = y_0 \\Rightarrow C = y_0 - a$.',
      { domain: [0, 1.2],
        mistakes: {
          cIsY0: function (v) { return v.a + '*e^(' + v.k + '*x) + ' + v.y0; },
          multY0: function (v) { return v.y0 + '*e^(' + v.k + '*x)'; }
        },
        feedback: [
          { when: 'cIsY0', say: function (v) { return 'Casi: en $x = 0$ el término $' + v.a + 'e^{0}$ vale $' + v.a + '$, así que $' + v.a + ' + C = ' + v.y0 + '$.'; } },
          { when: 'multY0', say: 'Casi: la ecuación es $y\' = f(x)$ (integración directa), así que $+C$ va sumando, no multiplicando.' }
        ] }),

    E('pv-e-blow-fam', 'pvi', 3, { c0: [3, 7, 1] },
      function (v) {
        return 'La familia $y = \\dfrac{1}{C - x}$ resuelve la ecuación $y\' = y^2$. Encuentra la solución particular que cumple $y(0) = \\dfrac{1}{' + v.c0 + '}$. Escribe $y(x)$.';
      },
      function (v) { return '1/(' + v.c0 + ' - x)'; },
      'Evaluando en $x = 0$: $y(0) = 1/C = 1/c_0 \\Rightarrow C = c_0$.',
      { domain: [-2, 2],
        mistakes: {
          plusX: function (v) { return '1/(' + v.c0 + ' + x)'; },
          invC: function (v) { return '1/(' + (1 / v.c0) + ' - x)'; }
        },
        feedback: [
          { when: 'plusX', say: 'Casi: en la familia el denominador es $C - x$, con signo menos delante de $x$.' },
          { when: 'invC', say: function (v) { return 'Casi: como $1/C = 1/' + v.c0 + '$, al despejar queda $C = ' + v.c0 + '$.'; } }
        ] }),

    E('pv-e-log-dir', 'pvi', 3, { a: [2, 6, 1], b: [1, 5, 1] },
      function (v) { return 'Resuelve para $x > 0$ el PVI $y\' = \\dfrac{' + v.a + '}{x} + 2x$ con condición inicial $y(1) = ' + v.b + '$. Escribe $y(x)$ (usa <code>ln(x)</code>).'; },
      function (v) { return v.a + '*log(x) + x^2 + ' + (v.b - 1); },
      'Integrando: $y = a\\ln x + x^2 + C$. En $x = 1$, $\\ln(1) = 0$, así que $0 + 1 + C = b \\Rightarrow C = b - 1$.',
      { domain: [0.5, 3],
        mistakes: {
          cIsB: function (v) { return v.a + '*log(x) + x^2 + ' + v.b; },
          ln1Is1: function (v) { return v.a + '*log(x) + x^2 + ' + (v.b - 1 - v.a); }
        },
        feedback: [
          { when: 'cIsB', say: 'Casi: la condición se da en $x = 1$, donde $x^2 = 1^2 = 1$, así que $1 + C = y(1)$.' },
          { when: 'ln1Is1', say: 'Casi: recuerda que $\\ln(1) = 0$, no $1$.' }
        ] }),

    N('pv-n-const-lin', 'pvi', 1, { a: [-2, 2, 1], b: [2, 6, 1] },
      function (v) { return 'La familia $y = x - 1 + Ce^{-x}$ es la solución general de $y\' = x - y$. ¿Cuánto vale la constante $C$ si $y(' + v.a + ') = ' + v.b + '$?'; },
      function (v) { return (v.b - v.a + 1) * Math.exp(v.a); },
      'Sustituye $x = a$ y $y = b$: $b = a - 1 + Ce^{-a} \\Rightarrow C = (b - a + 1)e^a$.',
      { where: function (v) { return v.a !== 0 && v.b - v.a + 1 !== 0; },
        mistakes: {
          noExp: function (v) { return v.b - v.a + 1; },
          signExp: function (v) { return (v.b - v.a + 1) * Math.exp(-v.a); },
          dropOne: function (v) { return (v.b - v.a) * Math.exp(v.a); }
        },
        feedback: [
          { when: 'noExp', say: 'Casi: olvidaste despejar el factor $e^{-a}$ que multiplica a $C$.' },
          { when: 'signExp', say: 'Casi: al dividir entre $e^{-a}$ pasa multiplicando como $e^{a}$, cambiando el signo del exponente.' },
          { when: 'dropOne', say: 'Casi: olvidaste el $-1$ de la familia $y = x - 1 + Ce^{-x}$.' }
        ] }),

    N('pv-n-pot-eval', 'pvi', 1, { m: [2, 3, 1], x0: [1, 2, 1], y0: [3, 6, 1], x1: [3, 4, 1] },
      function (v) { return 'La familia $y = Cx^{' + v.m + '}$ resuelve $x\\,y\' = ' + v.m + 'y$. Si $y(' + v.x0 + ') = ' + v.y0 + '$, ¿cuánto vale la solución en $x = ' + v.x1 + '$?'; },
      function (v) { return v.y0 * Math.pow(v.x1 / v.x0, v.m); },
      'De $y(x_0) = Cx_0^m = y_0$ sale $C = y_0 / x_0^m$, y por tanto $y(x_1) = y_0(x_1/x_0)^m$.',
      { mistakes: {
          justC: function (v) { return v.y0 / Math.pow(v.x0, v.m); },
          linearRatio: function (v) { return v.y0 * (v.x1 / v.x0); }
        },
        feedback: [
          { when: 'justC', say: function (v) { return 'Casi: ese es el valor de la constante $C$; falta evaluar $Cx^{' + v.m + '}$ en $x = ' + v.x1 + '$.'; } },
          { when: 'linearRatio', say: function (v) { return 'Casi: olvides elevar el cociente $x_1/x_0$ a la potencia $' + v.m + '$.'; } }
        ] }),

    N('pv-n-enfriamiento-eval', 'pvi', 2, { Ta: [18, 24, 2], T0: [70, 90, 5], k: [1, 3, 1] },
      function (v) {
        var kk = v.k / 10;
        return 'La temperatura de un objeto cumple $T(t) = ' + v.Ta + ' + Ce^{-' + kk + 't}$ (en °C, con $t$ en minutos). Si $T(0) = ' + v.T0 + '$ °C, ¿qué temperatura tiene en $t = 5$ min?';
      },
      function (v) { return v.Ta + (v.T0 - v.Ta) * Math.exp(-0.5 * v.k); },
      'Con $T(0) = T_a + C = T_0$ se obtiene $C = T_0 - T_a$, y luego se evalúa en $t = 5$.',
      { unit: '°C',
        mistakes: {
          cIsT0: function (v) { return v.Ta + v.T0 * Math.exp(-0.5 * v.k); },
          noTa: function (v) { return (v.T0 - v.Ta) * Math.exp(-0.5 * v.k); }
        },
        feedback: [
          { when: 'cIsT0', say: function (v) { return 'Casi: en $t = 0$ tienes $' + v.Ta + ' + C = ' + v.T0 + '$, así que $C = ' + (v.T0 - v.Ta) + '$, no $' + v.T0 + '$.'; } },
          { when: 'noTa', say: function (v) { return 'Casi: olvidaste sumar la temperatura ambiente $' + v.Ta + '$ °C al evaluar $T(5)$.'; } }
        ] }),

    N('pv-n-directa-eval', 'pvi', 2, { a: [3, 9, 3], b: [2, 6, 2], x0: [1, 2, 1], y0: [2, 7, 1], x1: [3, 4, 1] },
      function (v) { return 'Sea el PVI $y\' = ' + v.a + 'x^2 - ' + v.b + 'x$ con condición inicial $y(' + v.x0 + ') = ' + v.y0 + '$. ¿Cuánto vale $y(' + v.x1 + ')$?'; },
      function (v) {
        var F = function (x) { return (v.a / 3) * Math.pow(x, 3) - (v.b / 2) * x * x; };
        return v.y0 + F(v.x1) - F(v.x0);
      },
      'Integrando: $y(x) = \\frac{a}{3}x^3 - \\frac{b}{2}x^2 + C$. Despeja $C$ usando $y(x_0) = y_0$ y evalúa en $x_1$.',
      { mistakes: {
          cIsY0: function (v) {
            var F = function (x) { return (v.a / 3) * Math.pow(x, 3) - (v.b / 2) * x * x; };
            return F(v.x1) + v.y0;
          },
          noY0: function (v) {
            var F = function (x) { return (v.a / 3) * Math.pow(x, 3) - (v.b / 2) * x * x; };
            return F(v.x1) - F(v.x0);
          }
        },
        feedback: [
          { when: 'cIsY0', say: function (v) { return 'Casi: la condición se da en $x_0 = ' + v.x0 + '$, no en $0$, así que $C \\neq ' + v.y0 + '$.'; } },
          { when: 'noY0', say: function (v) { return 'Casi: te faltó sumar el valor inicial $y(' + v.x0 + ') = ' + v.y0 + '$.'; } }
        ] }),

    N('pv-n-blow-eval', 'pvi', 3, { x0: [1, 2, 1], y0: [2, 5, 1] },
      function (v) { return 'La familia $y = \\dfrac{1}{C - x}$ resuelve $y\' = y^2$. Si $y(' + v.x0 + ') = ' + v.y0 + '$, ¿cuánto vale $y(0)$?'; },
      function (v) {
        var Cval = v.x0 + 1 / v.y0;
        return 1 / Cval;
      },
      'De $y(x_0) = \\frac{1}{C - x_0} = y_0$ se despeja $C = x_0 + \\frac{1}{y_0}$, y en $x = 0$ queda $y(0) = \\frac{1}{C}$.',
      { mistakes: {
          justC: function (v) { return v.x0 + 1 / v.y0; },
          wrongDespeje: function (v) { return 1 / (v.y0 + v.x0); }
        },
        feedback: [
          { when: 'justC', say: 'Casi: ese es el valor de $C$; en $x = 0$ la solución vale $y(0) = 1/C$.' },
          { when: 'wrongDespeje', say: 'Casi: de $1/(C - x_0) = y_0$ sale $C - x_0 = 1/y_0$, no $y_0$.' }
        ] }),

    /* ======================= 4. Familias y PVI de segundo orden (16) ======================= */
    C('s2-dos-cond-fisica', 'segundo-orden', 1,
      'En física, la segunda ley de Newton $m\\,x\'\'(t) = F(t, x, x\')$ es una EDO de segundo orden. ¿Qué dos condiciones iniciales necesitas en $t = t_0$ para determinar el movimiento?',
      'La posición inicial $x(t_0)$ y la velocidad inicial $x\'(t_0)$', [
        ['Solo la posición inicial $x(t_0)$', 'Casi: sabiendo solo de dónde sale, sin saber con qué velocidad arranca, hay infinitas trayectorias posibles.'],
        ['La posición en dos tiempos distintos $x(t_0)$ y $x(t_1)$', 'Casi: en dos puntos distintos sería un problema de valores en la frontera, no un PVI en $t_0$.'],
        ['La velocidad inicial $x\'(t_0)$ y la aceleración inicial $x\'\'(t_0)$', 'Casi: la aceleración ya la da la propia ecuación a partir de $x(t_0)$ y $x\'(t_0)$; faltaría fijar la posición inicial.']],
      'Para una ecuación de segundo orden en el tiempo, el estado inicial lo forman la posición $x(t_0)$ y la velocidad $x\'(t_0)$.'),

    C('s2-donde-usar-yprima', 'segundo-orden', 1,
      'Al resolver un PVI de segundo orden con familia $y = c_1\\cos(3x) + c_2\\sin(3x)$, ¿dónde debes sustituir la condición $y\'(0) = 6$?',
      'En la derivada de la familia, $y\'(x) = -3c_1\\sin(3x) + 3c_2\\cos(3x)$', [
        ['Directamente en la familia $y(x)$ sin derivar', 'Casi: la familia da $y(x)$, no $y\'(x)$; primero hay que derivarla respecto a $x$.'],
        ['En la segunda derivada $y\'\'(x)$', 'Casi: la condición es sobre la primera derivada $y\'(0)$, no sobre $y\'\'(0)$.'],
        ['En la ecuación diferencial $y\'\' + 9y = 0$', 'Casi: en la EDO no aparecen $c_1$ ni $c_2$; debes usar la derivada de la familia general.']],
      'La condición $y\'(x_0) = v_0$ habla de la pendiente, así que se evalúa en la derivada $y\'(x)$ de la familia.'),

    C('s2-error-cadena-c2', 'segundo-orden', 2,
      function (v) { return 'Para $y = c_1\\cos(' + v.w + 'x) + c_2\\sin(' + v.w + 'x)$ con $y(0) = 1$ y $y\'(0) = ' + (2 * v.w) + '$, alguien escribe $c_2 = ' + (2 * v.w) + '$ en vez de $c_2 = 2$. ¿Qué olvidó al derivar?'; },
      function (v) { return 'La regla de la cadena: la derivada de $\\sin(' + v.w + 'x)$ es $' + v.w + '\\cos(' + v.w + 'x)$, con el factor $' + v.w + '$ afuera'; }, [
        ['Que $\\cos(0) = 0$ en lugar de $1$', 'Casi: $\\cos(0)$ sí vale $1$; lo que faltó fue el factor de la regla de la cadena.'],
        ['Que la derivada del seno es menos coseno', 'Casi: la derivada del seno es coseno positivo; el error estuvo en olvidar el factor interno.'],
        ['Que $c_1$ también multiplica a $\\cos(0)$ en la derivada', 'Casi: en $y\'(x)$, $c_1$ queda multiplicado por $\\sin(0) = 0$, así que sí se anula.']],
      'Como $y\'(x) = -wc_1\\sin(wx) + wc_2\\cos(wx)$, en $x = 0$ queda $y\'(0) = wc_2$.',
      { vars: { w: [2, 6, 1] } }),

    C('s2-sistema-exponenciales', 'segundo-orden', 2,
      'Si la solución general es $y = c_1 e^{x} + c_2 e^{-x}$ y las condiciones son $y(0) = 4$ y $y\'(0) = 0$, ¿qué sistema deben cumplir $c_1$ y $c_2$?',
      '$c_1 + c_2 = 4$ y $c_1 - c_2 = 0$', [
        ['$c_1 = 4$ y $c_2 = 0$', 'Casi: en $x = 0$ ninguna exponencial se anula ($e^0 = 1$), así que quedan las dos constantes en ambas ecuaciones.'],
        ['$c_1 + c_2 = 4$ y $c_1 + c_2 = 0$', 'Casi: al derivar $c_2 e^{-x}$ baja un signo menos por la regla de la cadena: $y\' = c_1 e^x - c_2 e^{-x}$.'],
        ['$c_1 - c_2 = 4$ y $c_1 + c_2 = 0$', 'Casi: en la función sin derivar ambos términos suman ($c_1 + c_2 = 4$); el signo menos sale hasta derivar.']],
      'Como $e^0 = 1$, $y(0) = c_1 + c_2 = 4$, y como $y\' = c_1 e^x - c_2 e^{-x}$, $y\'(0) = c_1 - c_2 = 0$.'),

    C('s2-reposo-oscilador', 'segundo-orden', 3,
      'Un oscilador con solución general $y(t) = c_1\\cos(\\omega t) + c_2\\sin(\\omega t)$ se suelta <em>desde el reposo</em> en $t = 0$ desde la posición $y(0) = A \\neq 0$. ¿Cómo queda su solución?',
      '$y(t) = A\\cos(\\omega t)$, porque partir del reposo significa $y\'(0) = 0$ y eso anula $c_2$', [
        ['$y(t) = A\\sin(\\omega t)$, porque el seno empieza en reposo', 'Casi: $\\sin(\\omega t)$ tiene $y(0) = 0$ y velocidad inicial $\\omega A \\neq 0$; es el coseno el que tiene derivada cero en $t = 0$.'],
        ['$y(t) = A\\cos(\\omega t) + A\\sin(\\omega t)$', 'Casi: si $c_2 = A$, la velocidad inicial sería $y\'(0) = \\omega A \\neq 0$.'],
        ['$y(t) = 0$ para todo $t$, porque si parte del reposo no se mueve', 'Casi: aunque $y\'(0) = 0$, la aceleración inicial es $y\'\'(0) = -\\omega^2 A \\neq 0$, así que sí oscila.']],
      '«Desde el reposo» significa velocidad inicial nula: $y\'(0) = \\omega c_2 = 0 \\Rightarrow c_2 = 0$, quedando solo $A\\cos(\\omega t)$.'),

    E('s2-e-osc', 'segundo-orden', 2, { w: [2, 5, 1], a: [1, 5, 1], b: [1, 4, 1] },
      function (v) { return 'La familia $y = c_1\\cos(' + v.w + 'x) + c_2\\sin(' + v.w + 'x)$ resuelve $y\'\' + ' + (v.w * v.w) + 'y = 0$. Encuentra la solución $y(x)$ con $y(0) = ' + v.a + '$ y $y\'(0) = ' + (v.b * v.w) + '$.'; },
      function (v) { return v.a + '*cos(' + v.w + '*x) + ' + v.b + '*sin(' + v.w + '*x)'; },
      '$y(0) = c_1 = a$ y $y\'(0) = wc_2 = bw \\Rightarrow c_2 = b$.',
      { domain: [0.1, 2],
        mistakes: {
          noChainC2: function (v) { return v.a + '*cos(' + v.w + '*x) + ' + (v.b * v.w) + '*sin(' + v.w + '*x)'; },
          swappedC: function (v) { return v.b + '*cos(' + v.w + '*x) + ' + v.a + '*sin(' + v.w + '*x)'; }
        },
        feedback: [
          { when: 'noChainC2', say: function (v) { return 'Casi: al derivar $\\sin(' + v.w + 'x)$ sale un factor $' + v.w + '$, así que $c_2 = y\'(0)/' + v.w + '$.'; } },
          { when: 'swappedC', say: 'Casi: intercambiaste $c_1$ (que acompaña al coseno) y $c_2$ (que acompaña al seno).' }
        ] }),

    E('s2-e-doble-int', 'segundo-orden', 2, { a: [1, 4, 1], v0: [2, 6, 1], y0: [1, 5, 1] },
      function (v) { return 'Resuelve integrando dos veces el PVI $y\'\' = ' + (6 * v.a) + 'x$ con condiciones iniciales $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + v.v0 + '$. Escribe $y(x)$.'; },
      function (v) { return v.a + '*x^3 + ' + v.v0 + '*x + ' + v.y0; },
      'Primera integral: $y\' = 3ax^2 + c_1$ con $c_1 = y\'(0) = v_0$. Segunda integral: $y = ax^3 + v_0 x + c_2$ con $c_2 = y(0) = y_0$.',
      { domain: [-2, 2],
        mistakes: {
          forgotX: function (v) { return v.a + '*x^3 + ' + (v.v0 + v.y0); },
          swappedCond: function (v) { return v.a + '*x^3 + ' + v.y0 + '*x + ' + v.v0; }
        },
        feedback: [
          { when: 'forgotX', say: 'Casi: la constante $c_1 = y\'(0)$ se integra en el segundo paso, convirtiéndose en $c_1 x$.' },
          { when: 'swappedCond', say: 'Casi: $y\'(0)$ es el coeficiente lineal de $x$ y $y(0)$ es el término independiente.' }
        ] }),

    E('s2-e-hiper', 'segundo-orden', 2, { k: [2, 4, 1], s: [1, 4, 1], d: [1, 3, 1] },
      function (v) {
        var y0 = v.s + v.d, v0 = v.k * (v.s - v.d);
        return 'La familia $y = c_1 e^{' + v.k + 'x} + c_2 e^{-' + v.k + 'x}$ resuelve $y\'\' - ' + (v.k * v.k) + 'y = 0$. Escribe la solución $y(x)$ que cumple $y(0) = ' + y0 + '$ y $y\'(0) = ' + v0 + '$.';
      },
      function (v) { return v.s + '*e^(' + v.k + '*x) + ' + v.d + '*e^(-' + v.k + '*x)'; },
      'Del sistema $c_1 + c_2 = y(0)$ y $k(c_1 - c_2) = y\'(0)$ se obtiene $c_1 = s$ y $c_2 = d$.',
      { domain: [-1, 1],
        mistakes: {
          swappedC: function (v) { return v.d + '*e^(' + v.k + '*x) + ' + v.s + '*e^(-' + v.k + '*x)'; },
          minusSecond: function (v) { return v.s + '*e^(' + v.k + '*x) - ' + v.d + '*e^(-' + v.k + '*x)'; }
        },
        feedback: [
          { when: 'swappedC', say: 'Casi: intercambiaste $c_1$ y $c_2$ al resolver el sistema de ecuaciones.' },
          { when: 'minusSecond', say: 'Casi: en la familia $c_2$ suma, y aquí $c_2 > 0$.' }
        ] }),

    E('s2-e-dos-raices', 'segundo-orden', 3, { r1: [1, 2, 1], r2: [3, 4, 1], c1: [1, 4, 1], c2: [1, 4, 1] },
      function (v) {
        var s = v.r1 + v.r2, p = v.r1 * v.r2;
        var y0 = v.c1 + v.c2, v0 = v.r1 * v.c1 + v.r2 * v.c2;
        return 'La familia $y = c_1 e^{' + v.r1 + 'x} + c_2 e^{' + v.r2 + 'x}$ resuelve $y\'\' - ' + s + 'y\' + ' + p + 'y = 0$. Resuelve el PVI con $y(0) = ' + y0 + '$ y $y\'(0) = ' + v0 + '$. Escribe $y(x)$.';
      },
      function (v) { return v.c1 + '*e^(' + v.r1 + '*x) + ' + v.c2 + '*e^(' + v.r2 + '*x)'; },
      'En $x = 0$: $c_1 + c_2 = y(0)$ y $r_1 c_1 + r_2 c_2 = y\'(0)$. Resolviendo el sistema $2\\times 2$ se obtienen $c_1$ y $c_2$.',
      { domain: [-0.5, 1],
        where: function (v) { return v.c1 !== v.c2; },
        mistakes: {
          swappedC: function (v) { return v.c2 + '*e^(' + v.r1 + '*x) + ' + v.c1 + '*e^(' + v.r2 + '*x)'; },
          c1IsY0: function (v) { return (v.c1 + v.c2) + '*e^(' + v.r1 + '*x)'; }
        },
        feedback: [
          { when: 'swappedC', say: 'Casi: intercambiaste los valores de $c_1$ y $c_2$ al despejar el sistema.' },
          { when: 'c1IsY0', say: 'Casi: en $x = 0$ ambas exponenciales valen $1$, así que $y(0) = c_1 + c_2$, no solo $c_1$.' }
        ] }),

    N('s2-n-hallar-c1', 'segundo-orden', 1, { w: [2, 6, 1], A: [2, 8, 1], B: [3, 9, 1] },
      function (v) { return 'En la familia $y = c_1\\cos(' + v.w + 'x) + c_2\\sin(' + v.w + 'x)$ con condiciones iniciales $y(0) = ' + v.A + '$ y $y\'(0) = ' + v.B + '$, ¿cuánto vale la constante $c_1$?'; },
      function (v) { return v.A; },
      'Como $\\cos(0) = 1$ y $\\sin(0) = 0$, al evaluar en $x = 0$ queda directamente $y(0) = c_1 = A$.',
      { where: function (v) { return v.A !== v.B && v.A * v.w !== v.B; },
        mistakes: {
          tookB: function (v) { return v.B; },
          divW: function (v) { return v.A / v.w; }
        },
        feedback: [
          { when: 'tookB', say: 'Casi: ese es el dato de $y\'(0)$; $c_1$ sale de evaluar $y(0)$ sin derivar.' },
          { when: 'divW', say: 'Casi: para $c_1$ no se divide entre $w$ porque proviene de $y(0) = c_1\\cos(0) = c_1$.' }
        ] }),

    N('s2-n-hallar-c2', 'segundo-orden', 1, { w: [2, 5, 1], A: [2, 6, 1], B: [3, 11, 2] },
      function (v) { return 'La solución general de $y\'\' + ' + (v.w * v.w) + 'y = 0$ es $y = c_1\\cos(' + v.w + 'x) + c_2\\sin(' + v.w + 'x)$. Si $y(0) = ' + v.A + '$ y $y\'(0) = ' + v.B + '$, ¿cuánto vale $c_2$?'; },
      function (v) { return v.B / v.w; },
      'Derivando: $y\' = -wc_1\\sin(wx) + wc_2\\cos(wx)$, así que $y\'(0) = wc_2 = B \\Rightarrow c_2 = B/w$.',
      { where: function (v) { return v.B % v.w !== 0 && v.A !== v.B; },
        mistakes: {
          noChain: function (v) { return v.B; },
          tookA: function (v) { return v.A; },
          multW: function (v) { return v.B * v.w; }
        },
        feedback: [
          { when: 'noChain', say: function (v) { return 'Casi: olvidaste el factor $' + v.w + '$ que sale al derivar $\\sin(' + v.w + 'x)$: $y\'(0) = ' + v.w + 'c_2$.'; } },
          { when: 'tookA', say: 'Casi: ese es $c_1$, que viene de $y(0)$; $c_2$ se obtiene de $y\'(0)$.' },
          { when: 'multW', say: function (v) { return 'Casi: de $' + v.w + 'c_2 = ' + v.B + '$ se despeja dividiendo entre $' + v.w + '$, no multiplicando.'; } }
        ] }),

    N('s2-n-osc-eval', 'segundo-orden', 2, { w: [2, 4, 1], A: [2, 5, 1], B: [4, 10, 2] },
      function (v) { return 'Sea el PVI $y\'\' + ' + (v.w * v.w) + 'y = 0$ con $y(0) = ' + v.A + '$ y $y\'(0) = ' + v.B + '$. Usando la familia $y = c_1\\cos(' + v.w + 'x) + c_2\\sin(' + v.w + 'x)$, calcula $y(1)$ (con $x$ en radianes).'; },
      function (v) { return v.A * Math.cos(v.w) + (v.B / v.w) * Math.sin(v.w); },
      'Con $c_1 = A$ y $c_2 = B/w$, basta evaluar $A\\cos(w) + (B/w)\\sin(w)$.',
      { mistakes: {
          noDivW: function (v) { return v.A * Math.cos(v.w) + v.B * Math.sin(v.w); },
          onlyCos: function (v) { return v.A * Math.cos(v.w); }
        },
        feedback: [
          { when: 'noDivW', say: function (v) { return 'Casi: recuerda que $c_2 = y\'(0)/' + v.w + '$, no $y\'(0)$.'; } },
          { when: 'onlyCos', say: 'Casi: te faltó sumar el término $c_2\\sin(w)$.' }
        ] }),

    N('s2-n-exp-c1', 'segundo-orden', 2, { k: [2, 5, 1], y0: [4, 10, 2], v0: [4, 12, 2] },
      function (v) { return 'Para la familia $y = c_1 e^{' + v.k + 'x} + c_2 e^{-' + v.k + 'x}$ con condiciones iniciales $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + v.v0 + '$, ¿cuánto vale la constante $c_1$?'; },
      function (v) { return 0.5 * (v.y0 + v.v0 / v.k); },
      'De $c_1 + c_2 = y_0$ y $k(c_1 - c_2) = v_0$ se suma $c_1 + c_2$ con $c_1 - c_2 = v_0/k$ y se divide entre 2.',
      { mistakes: {
          noDivK: function (v) { return 0.5 * (v.y0 + v.v0); },
          justY0: function (v) { return v.y0; },
          c2Val: function (v) { return 0.5 * (v.y0 - v.v0 / v.k); }
        },
        feedback: [
          { when: 'noDivK', say: function (v) { return 'Casi: en la derivada sale un factor $' + v.k + '$, así que $c_1 - c_2 = y\'(0)/' + v.k + '$.'; } },
          { when: 'justY0', say: 'Casi: en $x = 0$ el segundo término $c_2 e^0$ también vale $c_2$, así que $c_1 + c_2 = y(0)$.' },
          { when: 'c2Val', say: 'Casi: ese es el valor de $c_2$; para $c_1$ se suman $y(0)$ y $y\'(0)/k$ antes de dividir entre 2.' }
        ] }),

    N('s2-n-caida-eval', 'segundo-orden', 2, { a: [2, 6, 2], v0: [3, 8, 1], y0: [5, 15, 5], t1: [2, 4, 1] },
      function (v) { return 'Una partícula sobre una recta cumple $x\'\'(t) = ' + v.a + '$ (en m/s²), con posición inicial $x(0) = ' + v.y0 + '$ m y velocidad inicial $x\'(0) = ' + v.v0 + '$ m/s. ¿En qué posición $x(' + v.t1 + ')$ está a los $' + v.t1 + '$ s?'; },
      function (v) { return 0.5 * v.a * v.t1 * v.t1 + v.v0 * v.t1 + v.y0; },
      'Integrando dos veces: $x(t) = \\frac{1}{2}at^2 + v_0 t + x_0$.',
      { unit: 'm',
        mistakes: {
          noHalf: function (v) { return v.a * v.t1 * v.t1 + v.v0 * v.t1 + v.y0; },
          noV0t: function (v) { return 0.5 * v.a * v.t1 * v.t1 + v.y0; }
        },
        feedback: [
          { when: 'noHalf', say: 'Casi: al integrar $at$ respecto a $t$ aparece el factor $1/2$: $\\frac{1}{2}at^2$.' },
          { when: 'noV0t', say: 'Casi: olvidaste el término $v_0 t$ que viene de integrar la velocidad inicial.' }
        ] }),

    N('s2-n-dos-raices-c2', 'segundo-orden', 2, { r1: [1, 2, 1], r2: [4, 6, 1], y0: [3, 6, 1], v0: [8, 14, 2] },
      function (v) {
        var s = v.r1 + v.r2, p = v.r1 * v.r2;
        return 'La solución general de $y\'\' - ' + s + 'y\' + ' + p + 'y = 0$ es $y = c_1 e^{' + v.r1 + 'x} + c_2 e^{' + v.r2 + 'x}$. Si $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + v.v0 + '$, ¿cuánto vale $c_2$?';
      },
      function (v) { return (v.v0 - v.r1 * v.y0) / (v.r2 - v.r1); },
      'De $c_1 + c_2 = y_0$ y $r_1 c_1 + r_2 c_2 = v_0$, sustituyendo $c_1 = y_0 - c_2$ queda $(r_2 - r_1)c_2 = v_0 - r_1 y_0$.',
      { where: function (v) { return v.v0 !== v.r1 * v.y0 && v.v0 !== v.r2 * v.y0; },
        mistakes: {
          c1Val: function (v) { return (v.r2 * v.y0 - v.v0) / (v.r2 - v.r1); },
          divR2: function (v) { return v.v0 / v.r2; }
        },
        feedback: [
          { when: 'c1Val', say: 'Casi: ese es el valor de $c_1$; te piden la constante $c_2$ que acompaña a $e^{r_2 x}$.' },
          { when: 'divR2', say: 'Casi: en $y\'(0) = r_1 c_1 + r_2 c_2$ también participa $r_1 c_1$, no solo $r_2 c_2$.' }
        ] }),

    N('s2-n-repetida-c2', 'segundo-orden', 3, { r: [2, 5, 1], y0: [2, 5, 1], v0: [3, 9, 2] },
      function (v) {
        return 'La familia $y = (c_1 + c_2 x)e^{' + v.r + 'x}$ resuelve $y\'\' - ' + (2 * v.r) + 'y\' + ' + (v.r * v.r) + 'y = 0$. Si $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + v.v0 + '$, ¿cuánto vale $c_2$?';
      },
      function (v) { return v.v0 - v.r * v.y0; },
      'Por la regla del producto, $y\' = c_2 e^{rx} + r(c_1 + c_2 x)e^{rx}$. En $x = 0$: $y(0) = c_1 = y_0$ y $y\'(0) = c_2 + rc_1 = v_0 \\Rightarrow c_2 = v_0 - ry_0$.',
      { where: function (v) { return v.v0 !== v.r * v.y0; },
        mistakes: {
          noProd: function (v) { return v.v0; },
          plusR: function (v) { return v.v0 + v.r * v.y0; }
        },
        feedback: [
          { when: 'noProd', say: function (v) { return 'Casi: olvidaste la regla del producto al derivar $(c_1 + c_2 x)e^{' + v.r + 'x}$; en $x = 0$ queda $y\'(0) = c_2 + ' + v.r + 'c_1$.'; } },
          { when: 'plusR', say: 'Casi: de $c_2 + rc_1 = y\'(0)$ se despeja $c_2 = y\'(0) - rc_1$, restando.' }
        ] }),

    /* ======================= 5. Campo de pendientes (16) ======================= */
    C('ca-que-muestra', 'campo', 1,
      'En el campo de pendientes de la ecuación $y\' = f(x, y)$, ¿qué representa la rayita dibujada en un punto $(a, b)$?',
      'La pendiente $f(a, b)$ que tendría la recta tangente a una curva solución que pase por $(a, b)$', [
        ['Un pedazo de la recta secante entre el origen y el punto $(a, b)$', 'Casi: la inclinación de la rayita la da $f(a, b)$, no la recta que va al origen.'],
        ['El valor numérico de la solución $y(a)$', 'Casi: la altura del punto es $b$; la inclinación de la rayita indica la derivada $y\' = f(a, b)$.'],
        ['La dirección del eje $x$ trasladada al punto $(a, b)$', 'Casi: las rayitas solo son horizontales donde $f(a, b) = 0$.']],
      'Sin resolver la EDO, evaluar $f(a, b)$ da directamente la pendiente de la solución al pasar por $(a, b)$.'),

    C('ca-relacion-curva', 'campo', 1,
      'Al trazar una curva solución sobre el campo de pendientes de $y\' = f(x, y)$, ¿cómo debe comportarse la curva respecto a las rayitas?',
      'En cada punto por el que pasa, la curva es tangente a la rayita de ese punto', [
        ['Debe cortar perpendicularmente a todas las rayitas que encuentra', 'Casi: la rayita marca la pendiente de la propia solución, así que la curva va en esa misma dirección, no perpendicular.'],
        ['Une con segmentos rectos los puntos donde las rayitas son horizontales', 'Casi: los puntos donde las rayitas son horizontales forman una isoclina, no necesariamente una solución.'],
        ['Pasa únicamente por los puntos donde la pendiente es positiva', 'Casi: una solución puede subir en unas regiones y bajar en otras siguiendo las pendientes del campo.']],
      'Como la ecuación exige $y\'(x) = f(x, y(x))$, la pendiente de la curva coincide en todo punto con la del campo.'),

    C('ca-solo-depende-x', 'campo', 2,
      'Si en un campo de pendientes observas que en cada recta vertical $x = c$ todas las rayitas son paralelas entre sí (no cambian al mover $y$), ¿qué forma tiene la EDO?',
      '$y\' = f(x)$, el lado derecho depende únicamente de $x$', [
        ['$y\' = f(y)$, el lado derecho depende únicamente de $y$', 'Casi: cuando depende solo de $y$, las rayitas son paralelas a lo largo de rectas horizontales $y = c$.'],
        ['$y\'\' = 0$, una ecuación de segundo orden', 'Casi: un campo de pendientes en el plano $(x, y)$ representa una ecuación de primer orden $y\' = f(x, y)$.'],
        ['No es una ecuación diferencial, porque las pendientes no cambian con $y$', 'Casi: $y\' = f(x)$ sí es una EDO de primer orden; sus soluciones difieren en una traslación vertical $+C$.']],
      'Que la pendiente no cambie al variar $y$ con $x$ fija significa que $f(x, y)$ no depende de $y$.'),

    C('ca-solo-depende-y', 'campo', 2,
      'En la ecuación autónoma $y\' = y(2 - y)$, las rayitas a lo largo de toda la recta horizontal $y = 2$ son completamente horizontales. ¿Qué significa eso para la función constante $y(x) = 2$?',
      'Que $y(x) = 2$ es una solución de equilibrio: su derivada es $0$ y el lado derecho también vale $0$ para todo $x$', [
        ['Que ninguna solución puede existir cerca de $y = 2$', 'Casi: $f(x, y) = y(2 - y)$ es suave en todo el plano; la recta $y = 2$ misma es una solución.'],
        ['Que todas las demás soluciones cortan verticalmente a la recta $y = 2$', 'Casi: por unicidad, las demás soluciones se acercan o se alejan de $y = 2$ sin cruzarla.'],
        ['Que $y(x) = 2x$ es solución de la ecuación', 'Casi: pendiente cero significa función constante $y = 2$, no $y = 2x$.']],
      'Si $f(x, 2) = 0$ para todo $x$, la recta horizontal $y(x) = 2$ tiene pendiente $0$ en todo punto y es solución.'),

    C('ca-signo-sube-baja', 'campo', 2,
      function (v) { return 'Una solución $y(x)$ de $y\' = y - ' + v.c + '$ pasa por el punto $(0, ' + (v.c - 2) + ')$. En las cercanías de $x = 0$, ¿la curva solución sube o baja al avanzar $x$?'; },
      function (v) { return 'Baja, porque en $(0, ' + (v.c - 2) + ')$ la pendiente es $y\' = -2 < 0$'; }, [
        [function (v) { return 'Sube, porque la coordenada $y = ' + (v.c - 2) + '$ es positiva'; }, 'Casi: que la curva suba o baje lo decide el signo de la derivada $y\'$, no el signo de $y$.'],
        ['Es horizontal, porque $x = 0$', 'Casi: $x = 0$ no hace cero a $y\' = y - c$; la pendiente vale $(c - 2) - c = -2$.'],
        ['Sube si $x > 0$ y baja si $x < 0$', 'Casi: cerca del punto la pendiente sigue siendo cercana a $-2 < 0$, así que decrece al crecer $x$.']],
      'Al evaluar el lado derecho en $y = c - 2$ resulta $y\' = (c - 2) - c = -2 < 0$, por lo que $y(x)$ es decreciente ahí.',
      { vars: { c: [4, 9, 1] } }),

    C('ca-isoclina-no-sol', 'campo', 3,
      'En la ecuación $y\' = x - y$, todos los puntos de la recta $y = x$ tienen rayitas horizontales (pendiente $0$). ¿Es la recta $y = x$ una solución de la EDO?',
      'No: la recta $y = x$ tiene pendiente $1$, mientras que el campo sobre ella pide pendiente $0$', [
        ['Sí, porque en todos sus puntos se anula el lado derecho $x - y = 0$', 'Casi: que $x - y = 0$ dice que $y\'$ debe valer $0$, pero si $y = x$ entonces $y\' = 1 \\neq 0$.'],
        ['Sí, es la solución de equilibrio de la ecuación', 'Casi: una solución de equilibrio debe ser una función constante $y = c$ (con $y\' = 0$), no una recta inclinada.'],
        ['Solo es solución en el origen $(0, 0)$', 'Casi: ser solución requiere cumplir la igualdad en todo un intervalo; en $y = x$ las curvas solución cruzan con tangente horizontal.']],
      'La recta $y = x$ es una isoclina de pendiente $0$: las soluciones que la cruzan tienen ahí un mínimo local, pero $y = x$ tiene derivada $1 \\neq 0$.'),

    N('ca-n-pendiente-lin', 'campo', 1, { a: [2, 5, 1], b: [1, 4, 1], x0: [1, 4, 1], y0: [1, 4, 1] },
      function (v) { return '¿Qué pendiente tiene la rayita del campo direccional de $y\' = ' + v.a + 'x - ' + v.b + 'y$ en el punto $(' + v.x0 + ', ' + v.y0 + ')$?'; },
      function (v) { return v.a * v.x0 - v.b * v.y0; },
      'Sustituye $x = x_0$ y $y = y_0$ en el lado derecho $ax - by$.',
      { where: function (v) { return v.x0 !== v.y0 && v.a * v.x0 !== v.b * v.y0; },
        mistakes: {
          swappedXY: function (v) { return v.a * v.y0 - v.b * v.x0; },
          plusSign: function (v) { return v.a * v.x0 + v.b * v.y0; }
        },
        feedback: [
          { when: 'swappedXY', say: 'Casi: intercambiaste las coordenadas $x_0$ y $y_0$ al evaluar.' },
          { when: 'plusSign', say: 'Casi: el segundo término tiene signo menos ($-by$), no más.' }
        ] }),

    N('ca-n-pendiente-prod', 'campo', 1, { k: [2, 5, 1], x0: [-3, -1, 1], y0: [2, 5, 1] },
      function (v) { return 'En el campo de pendientes de $y\' = x\\,y + ' + v.k + 'y$, calcula la pendiente en el punto $(' + v.x0 + ', ' + v.y0 + ')$.'; },
      function (v) { return v.x0 * v.y0 + v.k * v.y0; },
      'Evalúa $f(x, y) = xy + ky = (x + k)y$ en el punto dado.',
      { where: function (v) { return v.x0 + v.k !== 0; },
        mistakes: {
          swappedXY: function (v) { return v.x0 * v.y0 + v.k * v.x0; },
          noSecond: function (v) { return v.x0 * v.y0; }
        },
        feedback: [
          { when: 'swappedXY', say: 'Casi: en el término $+ky$ multiplicaste por $x_0$ en vez de por $y_0$.' },
          { when: 'noSecond', say: function (v) { return 'Casi: te faltó sumar el término $+' + v.k + 'y$.'; } }
        ] }),

    N('ca-n-equilibrio', 'campo', 1, { a: [2, 6, 1], b: [3, 15, 2] },
      function (v) { return 'Para la ecuación diferencial $y\' = ' + v.a + 'y - ' + v.b + '$, ¿a qué altura $y$ todas las rayitas del campo de pendientes son horizontales?'; },
      function (v) { return v.b / v.a; },
      'Las rayitas son horizontales cuando $y\' = 0$, es decir, $ay - b = 0 \\Rightarrow y = b/a$.',
      { mistakes: {
          negVal: function (v) { return -v.b / v.a; },
          invVal: function (v) { return v.a / v.b; }
        },
        feedback: [
          { when: 'negVal', say: 'Casi: de $ay - b = 0$ al despejar $y$ queda positivo: $y = b/a$.' },
          { when: 'invVal', say: 'Casi: despeja dividiendo $b$ entre el coeficiente $a$ de $y$, no al revés.' }
        ] }),

    N('ca-n-pendiente-cuad', 'campo', 2, { a: [1, 4, 1], x0: [2, 4, 1], y0: [1, 3, 1] },
      function (v) { return 'Calcula la pendiente de la curva solución de $y\' = x^2 - ' + v.a + 'y^2$ en el instante en que pasa por el punto $(' + v.x0 + ', ' + v.y0 + ')$.'; },
      function (v) { return v.x0 * v.x0 - v.a * v.y0 * v.y0; },
      'La pendiente de la solución al pasar por $(x_0, y_0)$ es $y\' = x_0^2 - ay_0^2$.',
      { where: function (v) { return v.x0 !== v.y0 && v.x0 * v.x0 !== v.a * v.y0 * v.y0; },
        mistakes: {
          noSquareY: function (v) { return v.x0 * v.x0 - v.a * v.y0; },
          swappedXY: function (v) { return v.y0 * v.y0 - v.a * v.x0 * v.x0; }
        },
        feedback: [
          { when: 'noSquareY', say: 'Casi: olvidaste elevar al cuadrado la coordenada $y_0$.' },
          { when: 'swappedXY', say: 'Casi: intercambiaste $x_0$ y $y_0$ en la fórmula de $f(x, y)$.' }
        ] }),

    N('ca-n-pendiente-frac', 'campo', 2, { k: [2, 5, 1], x0: [1, 4, 1], y0: [2, 5, 1] },
      function (v) { return 'En el campo de pendientes de $y\' = \\dfrac{' + v.k + 'x + y}{y}$, ¿cuánto vale la pendiente en el punto $(' + v.x0 + ', ' + v.y0 + ')$?'; },
      function (v) { return (v.k * v.x0 + v.y0) / v.y0; },
      'Evaluando en $(x_0, y_0)$ queda $m = (kx_0 + y_0)/y_0$.',
      { mistakes: {
          divByX: function (v) { return (v.k * v.x0 + v.y0) / v.x0; },
          noDenom: function (v) { return v.k * v.x0 + v.y0; }
        },
        feedback: [
          { when: 'divByX', say: 'Casi: el denominador de la ecuación es $y$, no $x$.' },
          { when: 'noDenom', say: 'Casi: olvidaste dividir entre $y_0$.' }
        ] }),

    N('ca-n-isoclina-cero-y', 'campo', 2, { a: [2, 5, 1], b: [1, 6, 1], x0: [2, 5, 1] },
      function (v) { return 'En el campo de pendientes de $y\' = ' + v.a + 'x - y + ' + v.b + '$, ¿cuál debe ser la coordenada $y$ del punto $( ' + v.x0 + ', y )$ para que la rayita ahí sea horizontal?'; },
      function (v) { return v.a * v.x0 + v.b; },
      'La rayita es horizontal cuando $y\' = ax_0 - y + b = 0 \\Rightarrow y = ax_0 + b$.',
      { mistakes: {
          negSign: function (v) { return -v.a * v.x0 - v.b; },
          subB: function (v) { return v.a * v.x0 - v.b; }
        },
        feedback: [
          { when: 'negSign', say: 'Casi: al pasar $-y$ al otro lado de $ax_0 - y + b = 0$ queda $y = ax_0 + b$, positivo.' },
          { when: 'subB', say: 'Casi: el término $+b$ conserva su signo al despejar $y = ax_0 + b$.' }
        ] }),

    N('ca-n-recta-tangente', 'campo', 2, { a: [2, 4, 1], x0: [1, 3, 1], y0: [2, 5, 1] },
      function (v) { return 'La solución $y(x)$ de $y\' = ' + v.a + 'x + y$ cumple $y(' + v.x0 + ') = ' + v.y0 + '$. Usando la recta tangente a la solución en $x = ' + v.x0 + '$, ¿qué valor aproximado tiene $y(' + (v.x0 + 0.5) + ')$?'; },
      function (v) {
        var m = v.a * v.x0 + v.y0;
        return v.y0 + m * 0.5;
      },
      'En $(x_0, y_0)$ la pendiente es $m = ax_0 + y_0$; sobre la recta tangente, $y(x_0 + 0.5) \\approx y_0 + 0.5\\,m$.',
      { mistakes: {
          justSlope: function (v) { return v.a * v.x0 + v.y0; },
          noHalf: function (v) { return v.y0 + (v.a * v.x0 + v.y0); }
        },
        feedback: [
          { when: 'justSlope', say: 'Casi: esa es la pendiente $y\'(x_0)$; falta usar $y_0 + m\\,\\Delta x$ con $\\Delta x = 0.5$.' },
          { when: 'noHalf', say: 'Casi: el paso es $\\Delta x = 0.5$, así que debes multiplicar la pendiente por $0.5$ antes de sumar $y_0$.' }
        ] }),

    N('ca-n-hallar-k-pend', 'campo', 2, { x0: [2, 5, 1], y0: [2, 4, 1], m: [3, 9, 2] },
      function (v) { return 'En el campo de pendientes de $y\' = k\\,x - y^2$, la rayita en el punto $(' + v.x0 + ', ' + v.y0 + ')$ tiene pendiente $' + v.m + '$. ¿Cuánto vale la constante $k$?'; },
      function (v) { return (v.m + v.y0 * v.y0) / v.x0; },
      'De $kx_0 - y_0^2 = m$ se despeja $k = (m + y_0^2)/x_0$.',
      { mistakes: {
          minusY2: function (v) { return (v.m - v.y0 * v.y0) / v.x0; },
          noDivX0: function (v) { return v.m + v.y0 * v.y0; }
        },
        feedback: [
          { when: 'minusY2', say: 'Casi: al pasar $-y_0^2$ al otro lado de $kx_0 - y_0^2 = m$, pasa sumando.' },
          { when: 'noDivX0', say: function (v) { return 'Casi: te faltó dividir entre $x_0 = ' + v.x0 + '$ para despejar $k$.'; } }
        ] }),

    N('ca-n-concavidad-desde-edo', 'campo', 3, { a: [1, 3, 1], x0: [1, 3, 1], y0: [2, 4, 1] },
      function (v) { return 'Si $y(x)$ es la solución de $y\' = ' + v.a + 'x + y$ que pasa por $(' + v.x0 + ', ' + v.y0 + ')$, deriva ambos lados de la EDO para hallar cuánto vale la segunda derivada $y\'\'(' + v.x0 + ')$.'; },
      function (v) { return v.a + (v.a * v.x0 + v.y0); },
      'Derivando $y\' = ax + y$ respecto a $x$ sale $y\'\' = a + y\' = a + (ax_0 + y_0)$.',
      { mistakes: {
          justA: function (v) { return v.a; },
          addedY0: function (v) { return v.a + v.y0; }
        },
        feedback: [
          { when: 'justA', say: 'Casi: al derivar $ax + y$ respecto a $x$, la derivada de $y$ no es $0$ sino $y\'$.' },
          { when: 'addedY0', say: 'Casi: la derivada de $y$ es $y\' = ax_0 + y_0$, no $y_0$.' }
        ] }),

    N('ca-n-logistica-pend', 'campo', 3, { r: [2, 5, 1], K: [10, 20, 5], y0: [2, 8, 2] },
      function (v) { return 'Para el modelo logístico $y\' = ' + v.r + 'y\\left(1 - \\dfrac{y}{' + v.K + '}\\right)$, ¿cuánto vale la pendiente en cualquier punto con altura $y = ' + v.y0 + '$?'; },
      function (v) { return v.r * v.y0 * (1 - v.y0 / v.K); },
      'Evalúa directamente $ry(1 - y/K)$ en $y = y_0$.',
      { mistakes: {
          noFactorY: function (v) { return v.r * (1 - v.y0 / v.K); },
          wrongFrac: function (v) { return v.r * v.y0 * (1 - v.K / v.y0); }
        },
        feedback: [
          { when: 'noFactorY', say: 'Casi: olvidaste multiplicar por el factor $y$ que está fuera del paréntesis.' },
          { when: 'wrongFrac', say: 'Casi: dentro del paréntesis es $1 - y/K$, no $1 - K/y$.' }
        ] }),

    /* ======================= 6. Existencia, unicidad y validez (16) ======================= */
    C('un-hipotesis-teorema', 'unicidad', 1,
      'Para el PVI de primer orden $y\' = f(x, y)$ con $y(x_0) = y_0$, ¿qué pide el teorema de existencia y unicidad para garantizar solución única cerca de $x_0$?',
      'Que tanto $f(x, y)$ como $\\dfrac{\\partial f}{\\partial y}(x, y)$ sean continuas en un rectángulo abierto que contenga a $(x_0, y_0)$', [
        ['Que $f(x, y)$ y $\\dfrac{\\partial f}{\\partial x}(x, y)$ sean continuas cerca de $(x_0, y_0)$', 'Casi: la derivada parcial que exige el teorema para la unicidad es respecto a la variable dependiente $y$, no respecto a $x$.'],
        ['Que la ecuación diferencial sea lineal; si es no lineal nunca hay unicidad', 'Casi: las ecuaciones no lineales también tienen solución única siempre que $f$ y $\\partial f/\\partial y$ sean continuas.'],
        ['Únicamente que $f(x_0, y_0) \\neq 0$', 'Casi: que $f$ valga $0$ solo significa pendiente horizontal; lo que importa es la continuidad de $f$ y $\\partial f/\\partial y$.']],
      'La continuidad de $f$ asegura existencia y la continuidad de $\\partial f/\\partial y$ asegura que la solución sea única cerca de $(x_0, y_0)$.'),

    C('un-cruce-curvas', 'unicidad', 1,
      'Si $f(x, y)$ y $\\dfrac{\\partial f}{\\partial y}(x, y)$ son continuas en todo el plano $\\mathbb{R}^2$, ¿pueden dos curvas solución distintas de $y\' = f(x, y)$ cruzarse en algún punto $(a, b)$?',
      'No: si pasaran por el mismo punto $(a, b)$, resolverían el mismo PVI y por unicidad serían la misma curva', [
        ['Sí, siempre que se crucen con la misma pendiente $f(a, b)$', 'Casi: ni siquiera pueden tocarse tangencialmente, porque con el mismo punto inicial $(a, b)$ el teorema obliga a que coincidan.'],
        ['Sí, pero solo sobre el eje $x$ o el eje $y$', 'Casi: los ejes no tienen nada de especial si $f$ y $\\partial f/\\partial y$ son continuas en todo el plano.'],
        ['Sí, cuando la ecuación es no lineal', 'Casi: mientras $f$ y $\\partial f/\\partial y$ sean continuas en $(a, b)$, el teorema prohíbe cruces aunque sea no lineal.']],
      'Un punto de cruce $(a, b)$ daría dos soluciones distintas para la misma condición inicial $y(a) = b$, contradiciendo la unicidad.'),

    C('un-potencia-frac', 'unicidad', 2,
      function (v) { return 'Para la ecuación $y\' = 3(y - ' + v.c + ')^{2/3}$, ¿en qué puntos iniciales $(x_0, y_0)$ el teorema de existencia y unicidad <strong>no</strong> garantiza unicidad?'; },
      function (v) { return 'En los puntos de la recta horizontal $y_0 = ' + v.c + '$, porque ahí $\\partial f/\\partial y = 2(y - ' + v.c + ')^{-1/3}$ no está definida'; }, [
        [function (v) { return 'En los puntos de la recta vertical $x_0 = ' + v.c + '$'; }, 'Casi: el lado derecho no tiene $x$; donde se anula el denominador de $\\partial f/\\partial y$ es en la recta horizontal $y = c$.'],
        ['En ningún punto, porque $(y - c)^{2/3}$ es continua en todo $\\mathbb{R}$', 'Casi: $f$ sí es continua en todo $\\mathbb{R}$, pero su derivada parcial $\\partial f/\\partial y$ explota en $y = c$.'],
        ['En el origen $(0, 0)$ únicamente', 'Casi: el problema está desplazado a toda la recta horizontal donde se anula la base de la potencia.']],
      'Al derivar $f(x, y) = 3(y - c)^{2/3}$ respecto a $y$ queda $\\frac{2}{(y - c)^{1/3}}$, que se indefine en $y_0 = c$.',
      { vars: { c: [2, 7, 1] } }),

    C('un-que-pasa-si-falla', 'unicidad', 2,
      'Si en un punto $(x_0, y_0)$ no se cumplen las hipótesis del teorema de existencia y unicidad, ¿qué se puede concluir en general?',
      'El teorema no decide: el PVI podría tener solución única, varias soluciones o ninguna', [
        ['Seguro que el PVI no tiene ninguna solución', 'Casi: el teorema da una condición suficiente, no necesaria; por ejemplo, $y\' = 3y^{2/3}$ en $(0,0)$ sí tiene soluciones.'],
        ['Seguro que por $(x_0, y_0)$ pasan infinitas soluciones', 'Casi: que falle la hipótesis tampoco garantiza múltiples soluciones; a veces no existe ninguna o existe una sola.'],
        ['La solución existe, pero solo para $x > x_0$', 'Casi: no hay una regla general; cuando fallan las hipótesis hay que analizar la ecuación directamente.']],
      'Las hipótesis del teorema son suficientes pero no necesarias: cuando fallan, cualquiera de los tres casos puede ocurrir.'),

    C('un-dos-soluciones-origen', 'unicidad', 3,
      'Para el PVI $y\' = 3y^{2/3}$ con $y(0) = 0$, tanto $y_1(x) = 0$ como $y_2(x) = x^3$ cumplen la ecuación y pasan por $(0, 0)$. ¿Por qué esto no contradice el teorema de existencia y unicidad?',
      'Porque $\\dfrac{\\partial f}{\\partial y} = \\dfrac{2}{y^{1/3}}$ no es continua en $y = 0$, así que las hipótesis del teorema no se cumplen en $(0, 0)$', [
        ['Porque $y_2(x) = x^3$ no es derivable en $x = 0$', 'Casi: $x^3$ es perfectamente derivable en todo $\\mathbb{R}$, con derivada $3x^2$.'],
        ['Porque $y_1(x) = 0$ no cuenta como función solución', 'Casi: la función constante $y = 0$ tiene derivada $0$ y cumple $0 = 3(0)^{2/3}$ en todo $\\mathbb{R}$.'],
        ['Porque el teorema solo aplica a ecuaciones lineales', 'Casi: el teorema aplica también a ecuaciones no lineales cuando $f$ y $\\partial f/\\partial y$ son continuas.']],
      'El teorema no se contradice porque en $(0, 0)$ falla la hipótesis de continuidad de $\\partial f/\\partial y = 2y^{-1/3}$.'),

    N('un-n-parcial-fy-pol', 'unicidad', 1, { a: [2, 5, 1], b: [1, 4, 1], x0: [1, 3, 1], y0: [2, 4, 1] },
      function (v) { return 'Para verificar la hipótesis de unicidad en $y\' = ' + v.a + 'x\\,y^2 - ' + v.b + 'y$, calcula el valor de $\\dfrac{\\partial f}{\\partial y}$ en el punto $(' + v.x0 + ', ' + v.y0 + ')$.'; },
      function (v) { return 2 * v.a * v.x0 * v.y0 - v.b; },
      'Derivando $f(x, y) = axy^2 - by$ respecto a $y$ (con $x$ fija) resulta $\\partial f/\\partial y = 2axy - b$.',
      { mistakes: {
          wrtX: function (v) { return v.a * v.y0 * v.y0; },
          evalF: function (v) { return v.a * v.x0 * v.y0 * v.y0 - v.b * v.y0; }
        },
        feedback: [
          { when: 'wrtX', say: 'Casi: esa es $\\partial f/\\partial x$; el teorema de unicidad usa la derivada parcial respecto a $y$.' },
          { when: 'evalF', say: 'Casi: evaluaste $f(x_0, y_0)$ sin derivar respecto a $y$.' }
        ] }),

    N('un-n-y-critico-raiz', 'unicidad', 1, { c: [2, 9, 1], a: [1, 5, 1] },
      function (v) { return 'En la ecuación $y\' = ' + v.a + 'x + \\sqrt{y - ' + v.c + '}$, ¿para qué valor frontera de $y_0$ está definida $f(x_0, y_0)$ pero <strong>no</strong> existe la derivada parcial $\\dfrac{\\partial f}{\\partial y}$?'; },
      function (v) { return v.c; },
      '$f$ está definida para $y \\ge c$, pero $\\partial f/\\partial y = \\frac{1}{2\\sqrt{y - c}}$ se divide entre cero justo en $y_0 = c$.',
      { mistakes: {
          negC: function (v) { return -v.c; },
          tookA: function (v) { return v.a; }
        },
        feedback: [
          { when: 'negC', say: function (v) { return 'Casi: dentro de la raíz hay $y - ' + v.c + '$, que se anula en $y = ' + v.c + '$ positivo.'; } },
          { when: 'tookA', say: 'Casi: el término $ax$ es suave en todas partes; fíjate en dónde se anula la raíz cuadrada.' }
        ] }),

    N('un-n-asintota-blow', 'unicidad', 1, { c: [2, 8, 1], k: [1, 5, 1] },
      function (v) { return 'La solución de cierto PVI de $y\' = y^2 / ' + v.k + '$ es $y(x) = \\dfrac{' + v.k + '}{' + v.c + ' - x}$. ¿En qué valor de $x$ explota la solución (tiene una asíntota vertical)?'; },
      function (v) { return v.c; },
      'La fracción se indefine cuando el denominador se anula: $c - x = 0 \\Rightarrow x = c$.',
      { where: function (v) { return v.c !== v.k; },
        mistakes: {
          negC: function (v) { return -v.c; },
          tookK: function (v) { return v.k; }
        },
        feedback: [
          { when: 'negC', say: function (v) { return 'Casi: el denominador es $' + v.c + ' - x$, que vale cero cuando $x = ' + v.c + '$.'; } },
          { when: 'tookK', say: 'Casi: ese es el numerador; la solución explota donde el denominador se hace cero.' }
        ] }),

    N('un-n-parcial-fy-raiz', 'unicidad', 2, { a: [2, 6, 2], c: [1, 5, 1], m: [2, 4, 1] },
      function (v) {
        var y0 = v.c + v.m * v.m;
        return 'Sea $f(x, y) = ' + v.a + 'x\\sqrt{y - ' + v.c + '}$. Calcula $\\dfrac{\\partial f}{\\partial y}$ en el punto $(1, ' + y0 + ')$.';
      },
      function (v) { return v.a / (2 * v.m); },
      'Con $x$ constante, $\\partial f/\\partial y = \\frac{ax}{2\\sqrt{y - c}}$. En $(1, c + m^2)$ vale $\\frac{a}{2m}$.',
      { mistakes: {
          noHalf: function (v) { return v.a / v.m; },
          wrtX: function (v) { return v.a * v.m; }
        },
        feedback: [
          { when: 'noHalf', say: 'Casi: la derivada de $\\sqrt{u}$ es $\\frac{1}{2\\sqrt{u}}$; te faltó el $2$ en el denominador.' },
          { when: 'wrtX', say: 'Casi: esa es la derivada respecto a $x$; debes derivar respecto a $y$.' }
        ] }),

    N('un-n-parcial-fy-frac', 'unicidad', 2, { a: [2, 5, 1], c: [1, 4, 1], x0: [2, 4, 1], d: [2, 3, 1] },
      function (v) {
        var y0 = v.c + v.d;
        return 'Para la ecuación $y\' = \\dfrac{' + v.a + 'x}{y - ' + v.c + '}$, calcula $\\dfrac{\\partial f}{\\partial y}$ en el punto $(' + v.x0 + ', ' + y0 + ')$.';
      },
      function (v) { return -(v.a * v.x0) / (v.d * v.d); },
      'Como $f = ax(y - c)^{-1}$, su derivada respecto a $y$ es $\\partial f/\\partial y = -\\frac{ax}{(y - c)^2}$.',
      { mistakes: {
          posSign: function (v) { return (v.a * v.x0) / (v.d * v.d); },
          noSquare: function (v) { return -(v.a * v.x0) / v.d; }
        },
        feedback: [
          { when: 'posSign', say: 'Casi: la derivada de $(y - c)^{-1}$ respecto a $y$ lleva signo negativo: $-(y - c)^{-2}$.' },
          { when: 'noSquare', say: 'Casi: al derivar $1/(y - c)$ el denominador queda elevado al cuadrado.' }
        ] }),

    N('un-n-extremo-validez-blow', 'unicidad', 2, { x0: [1, 3, 1], y0: [2, 5, 1] },
      function (v) { return 'El PVI $y\' = y^2$ con condición inicial $y(' + v.x0 + ') = ' + v.y0 + '$ tiene como solución única $y(x) = \\dfrac{1}{C - x}$ en un intervalo máximo $(-\\infty, b)$ que contiene a $x_0 = ' + v.x0 + '$. ¿Cuánto vale el extremo derecho $b$?'; },
      function (v) { return v.x0 + 1 / v.y0; },
      'De $y(x_0) = \\frac{1}{C - x_0} = y_0$ sale $C = x_0 + \\frac{1}{y_0}$, y la solución explota en $b = C$.',
      { mistakes: {
          subInv: function (v) { return v.x0 - 1 / v.y0; },
          addedY0: function (v) { return v.x0 + v.y0; }
        },
        feedback: [
          { when: 'subInv', say: 'Casi: de $C - x_0 = 1/y_0$ se despeja $C = x_0 + 1/y_0$, sumando.' },
          { when: 'addedY0', say: 'Casi: de $1/(C - x_0) = y_0$ el recíproco es $C - x_0 = 1/y_0$, no $y_0$.' }
        ] }),

    N('un-n-validez-lineal', 'unicidad', 2, { a: [1, 4, 1], b: [6, 10, 1], x0: [5, 5, 1] },
      function (v) { return 'En la EDO lineal $(x - ' + v.a + ')(x - ' + v.b + ')\\,y\' + 2y = \\cos x$ con condición inicial en $x_0 = ' + v.x0 + '$, el teorema garantiza una solución única en el intervalo abierto más grande $(p, q)$ que contiene a $x_0$ donde el coeficiente de $y\'$ no se anula. ¿Cuánto vale la longitud $q - p$ de ese intervalo?'; },
      function (v) { return v.b - v.a; },
      'Al dividir entre $(x - a)(x - b)$, los coeficientes son continuos en $(a, b)$, que contiene a $x_0 = 5$; su longitud es $b - a$.',
      { mistakes: {
          toX0: function (v) { return v.b - v.x0; },
          sumAB: function (v) { return v.b + v.a; }
        },
        feedback: [
          { when: 'toX0', say: function (v) { return 'Casi: el intervalo va desde $p = ' + v.a + '$ hasta $q = ' + v.b + '$, no desde $x_0 = ' + v.x0 + '$.'; } },
          { when: 'sumAB', say: 'Casi: la longitud del intervalo $(a, b)$ es la resta $b - a$, no la suma.' }
        ] }),

    N('un-n-validez-circulo', 'unicidad', 2, { r: [3, 8, 1] },
      function (v) { return 'La función $y(x) = \\sqrt{' + (v.r * v.r) + ' - x^2}$ resuelve el PVI $y\' = -\\dfrac{x}{y}$ con $y(0) = ' + v.r + '$. Si su intervalo máximo de validez como solución diferenciable es $(-a, a)$, ¿cuánto vale $a$?'; },
      function (v) { return v.r; },
      'Para que $y > 0$ y la derivada $y\' = -x/y$ exista (sin tangente vertical), se requiere $x \\in (-r, r)$, así que $a = r$.',
      { mistakes: {
          rSquared: function (v) { return v.r * v.r; },
          twoR: function (v) { return 2 * v.r; }
        },
        feedback: [
          { when: 'rSquared', say: function (v) { return 'Casi: dentro de la raíz está $' + (v.r * v.r) + ' - x^2$, que se anula en $x = \\pm ' + v.r + '$.'; } },
          { when: 'twoR', say: 'Casi: $2r$ es la longitud total del intervalo $(-r, r)$, pero te piden el extremo $a = r$.' }
        ] }),

    N('un-n-recta-singular', 'unicidad', 2, { m: [2, 5, 1], b: [1, 4, 1], x0: [2, 4, 1] },
      function (v) { return 'Para la ecuación $y\' = \\ln(y - ' + v.m + 'x - ' + v.b + ')$, el dominio donde $f$ y $\\partial f/\\partial y$ son continuas es el semiplano $y > ' + v.m + 'x + ' + v.b + '$. Si $x_0 = ' + v.x0 + '$, ¿a partir de qué valor frontera de $y_0$ (es decir, $y_0 > y_{\\text{ mín}}$) garantiza el teorema solución única?'; },
      function (v) { return v.m * v.x0 + v.b; },
      'El argumento del logaritmo debe ser estrictamente positivo: $y_0 - mx_0 - b > 0 \\Rightarrow y_0 > mx_0 + b$.',
      { mistakes: {
          plusOne: function (v) { return v.m * v.x0 + v.b + 1; },
          subB: function (v) { return v.m * v.x0 - v.b; }
        },
        feedback: [
          { when: 'plusOne', say: 'Casi: el logaritmo está definido desde que su argumento es mayor que $0$, no mayor que $1$.' },
          { when: 'subB', say: 'Casi: al despejar $y_0$ de $y_0 - mx_0 - b > 0$, el término $b$ pasa sumando.' }
        ] }),

    N('un-n-tiempo-explosion-k', 'unicidad', 3, { k: [2, 5, 1], y0: [2, 4, 1] },
      function (v) { return 'La solución del PVI $\\dfrac{dy}{dt} = ' + v.k + 'y^2$ con $y(0) = ' + v.y0 + '$ es $y(t) = \\dfrac{1}{\\frac{1}{' + v.y0 + '} - ' + v.k + 't}$. ¿En qué instante positivo $t^*$ explota la solución?'; },
      function (v) { return 1 / (v.k * v.y0); },
      'El denominador se anula cuando $\\frac{1}{y_0} - kt^* = 0 \\Rightarrow t^* = \\frac{1}{ky_0}$.',
      { mistakes: {
          multY0: function (v) { return v.y0 / v.k; },
          noK: function (v) { return 1 / v.y0; }
        },
        feedback: [
          { when: 'multY0', say: 'Casi: de $kt^* = 1/y_0$ al dividir entre $k$ queda $y_0$ también en el denominador: $1/(ky_0)$.' },
          { when: 'noK', say: function (v) { return 'Casi: olvidaste dividir entre el coeficiente $' + v.k + '$ que multiplica a $t$.'; } }
        ] }),

    N('un-n-empalme-peano', 'unicidad', 3, { a: [1, 3, 1], x1: [4, 6, 1] },
      function (v) { return 'Para el PVI sin unicidad $y\' = 3y^{2/3}$ con $y(0) = 0$, se construye una solución por tramos que vale $y(x) = 0$ para $x \\le ' + v.a + '$ y despega como $y(x) = (x - ' + v.a + ')^3$ para $x > ' + v.a + '$. ¿Cuánto vale esta solución en $x = ' + v.x1 + '$?'; },
      function (v) { return Math.pow(v.x1 - v.a, 3); },
      'Como $x_1 > a$, se evalúa el tramo $(x_1 - a)^3$, cuya derivada $3(x - a)^2 = 3y^{2/3}$ cumple la EDO en todas partes.',
      { mistakes: {
          noShift: function (v) { return Math.pow(v.x1, 3); },
          squaredVal: function (v) { return Math.pow(v.x1 - v.a, 2); }
        },
        feedback: [
          { when: 'noShift', say: function (v) { return 'Casi: esta solución despega del eje en $x = ' + v.a + '$, no en $x = 0$, así que es $(x - ' + v.a + ')^3$.'; } },
          { when: 'squaredVal', say: 'Casi: el exponente de la solución es $3$, no $2$.' }
        ] })
  ];

  K.register(SUBTEMAS, Q);
})();
