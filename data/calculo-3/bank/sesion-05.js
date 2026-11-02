/* =====================================================================
   Banco · Cálculo 3 · S05 · Reducibles a lineales: ecuación de Bernoulli.
   100 preguntas propias (source: 'propia').
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c3', '05'), C = K.C;

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
    'c3.S05.reconocimiento': 'Reconocimiento y forma de Bernoulli',
    'c3.S05.cambio': 'Cambio de variable y ecuación lineal en v',
    'c3.S05.n2': 'Bernoulli con n = 2',
    'c3.S05.potencias': 'Otras potencias (n = 3, 1/2, −1) y regreso a y',
    'c3.S05.logistica': 'Ecuación logística y aplicaciones',
    'c3.S05.equilibrios': 'Soluciones perdidas, signo y análisis cualitativo'
  };

  var Q = [
    /* ======================= 1. Reconocimiento y forma de Bernoulli (16) ======================= */
    C('re-forma-estandar', 'reconocimiento', 1,
      '¿Cuál es la forma estándar de una ecuación diferencial de Bernoulli en la función incógnita $y(x)$?',
      '$y\' + P(x)\\,y = Q(x)\\,y^n$', [
        ['$y\' + P(x)\\,y = Q(x)$', 'Casi: esa es la ecuación lineal de primer orden de S04 (caso particular $n = 0$).'],
        ['$y\' + P(x)\\,y^n = Q(x)$', 'Casi: en la forma estándar el término con $P(x)$ lleva $y$ a la primera potencia y $y^n$ multiplica a $Q(x)$.'],
        ['$(y\')^n + P(x)\\,y = Q(x)$', 'Casi: el exponente $n$ en Bernoulli está sobre la función $y$, no sobre la derivada $y\'$.']],
      'Una ecuación de Bernoulli tiene la parte lineal $y\' + P(x)\\,y$ igualada a $Q(x)\\,y^n$.'),

    C('re-casos-lineales', 'reconocimiento', 1,
      'En la ecuación de Bernoulli $y\' + P(x)\\,y = Q(x)\\,y^n$, ¿para qué valores del exponente constante $n$ la ecuación ya es lineal sin hacer cambio de variable?',
      'Para $n = 0$ y $n = 1$', [
        ['Solo para $n = 0$', 'Casi: con $n = 1$ queda $y\' + (P(x) - Q(x))y = 0$, que también es lineal.'],
        ['Para $n = 1$ y $n = 2$', 'Casi: cuando $n = 2$ aparece $y^2$, que hace no lineal a la ecuación.'],
        ['Para cualquier entero positivo $n$', 'Casi: para $n \\neq 0, 1$ la potencia $y^n$ rompe la linealidad y requiere el cambio $v = y^{1-n}$.']],
      'Con $n = 0$ queda $y\' + Py = Q$ y con $n = 1$ queda $y\' + (P - Q)y = 0$; en ambos casos es lineal.'),

    C('re-intruso-no-lineal', 'reconocimiento', 1,
      '¿Por qué la ecuación $y\' + 4x\\,y = e^x y^3$ no se puede resolver multiplicando directamente por el factor integrante $e^{\\int 4x\\,dx}$ para $y$?',
      'Porque el factor $y^3$ del lado derecho depende de la incógnita $y$ y hace no lineal a la ecuación', [
        ['Porque el coeficiente $4x$ no es constante', 'Casi: el factor integrante sí funciona con $P(x) = 4x$; lo que estorba es la potencia $y^3$.'],
        ['Porque aparece $e^x$ en el lado derecho', 'Casi: las funciones de $x$ son válidas en una lineal; el problema es el factor $y^3$.'],
        ['Porque es una ecuación diferencial de tercer orden', 'Casi: la derivada más alta es $y\'$ (primer orden); el $3$ es un exponente sobre $y$.']],
      'En una ecuación lineal el lado derecho solo depende de $x$; el intruso $y^3$ obliga a usar primero el cambio de Bernoulli.'),

    C('re-cual-es-bernoulli', 'reconocimiento', 2,
      '¿Cuál de las siguientes ecuaciones diferenciales de primer orden es una ecuación de Bernoulli (con $n \\neq 0, 1$)?',
      '$x\\,y\' + 2y = x^4 y^3$', [
        ['$y\' + y^2 = x^4$', 'Casi: el término $x^4$ no tiene factor $y$; es una ecuación de Riccati, no de Bernoulli.'],
        ['$y\' + x\\,y = \\sin(y)$', 'Casi: la incógnita está dentro de $\\sin(y)$, no como una sola potencia $y^n$.'],
        ['$(y\')^2 + 2x\\,y = x^4$', 'Casi: aquí el cuadrado está sobre la derivada $y\'$, no sobre $y$.']],
      'Dividiendo entre $x$ resulta $y\' + \\frac{2}{x}y = x^3 y^3$, que tiene la forma $y\' + P(x)y = Q(x)y^n$ con $n = 3$.'),

    C('re-raiz-en-denominador', 'reconocimiento', 2,
      function (v) { return 'Al reescribir la ecuación $y\' - ' + v.k + 'x\\,y = \\dfrac{e^x}{\\sqrt{y}}$ en la forma estándar de Bernoulli $y\' + P(x)\\,y = Q(x)\\,y^n$, ¿cuánto vale el exponente $n$?'; },
      '$n = -\\tfrac{1}{2}$', [
        ['$n = \\tfrac{1}{2}$', 'Casi: como $\\sqrt{y} = y^{1/2}$ está en el denominador, sube al numerador con signo negativo.'],
        ['$n = -2$', 'Casi: raíz cuadrada en el denominador corresponde a exponente $-1/2$, no $-2$.'],
        ['$n = 2$', 'Casi: $\\frac{1}{\\sqrt{y}}$ se escribe como $y^{-1/2}$, así que $n = -1/2$.']],
      'Por leyes de los exponentes, $\\frac{1}{\\sqrt{y}} = y^{-1/2}$, por lo que $n = -\\frac{1}{2}$.',
      { vars: { k: [2, 6, 1] } }),

    C('re-dividir-primero', 'reconocimiento', 2,
      'Si tienes la ecuación $x^2 y\' + 3x\\,y = 5y^4$ (para $x > 0$), ¿qué debes hacer primero para identificar correctamente $P(x)$ y $Q(x)$?',
      'Dividir toda la ecuación entre $x^2$ para que el coeficiente de $y\'$ sea $1$', [
        ['Tomar directamente $P(x) = 3x$ y $Q(x) = 5$', 'Casi: si no divides antes entre $x^2$, el factor integrante saldrá mal porque $y\'$ está multiplicada por $x^2$.'],
        ['Dividir entre $5y^4$ antes de quitar el $x^2$', 'Casi: conviene dejar primero a $y\'$ con coeficiente $1$: $y\' + \\frac{3}{x}y = \\frac{5}{x^2}y^4$.'],
        ['Restar $x^2$ en ambos lados de la ecuación', 'Casi: $x^2$ multiplica a $y\'$, así que se despeja dividiendo, no restando.']],
      'La forma estándar exige que $y\'$ tenga coeficiente $1$, lo que da $P(x) = 3/x$ y $Q(x) = 5/x^2$.'),

    C('re-aparente-producto', 'reconocimiento', 3,
      'La ecuación $y\\,y\' + x\\,y^2 = x^3$ no parece tener la forma estándar a primera vista por el producto $y\\,y\'$. ¿Qué ocurre si divides toda la ecuación entre $y$ (para $y \\neq 0$)?',
      'Se convierte en $y\' + x\\,y = x^3 y^{-1}$, que es una ecuación de Bernoulli con $n = -1$', [
        ['Se convierte en una ecuación lineal para $y(x)$ sin hacer ningún cambio de variable', 'Casi: en el lado derecho queda $x^3/y = x^3 y^{-1}$, que es de Bernoulli con $n = -1$.'],
        ['Queda $y\' + x\\,y^2 = x^3 y^{-1}$, que sigue sin ser de Bernoulli', 'Casi: al dividir también $x\\,y^2$ entre $y$ se simplifica a $x\\,y$.'],
        ['Se vuelve una ecuación de segundo orden', 'Casi: dividir entre $y$ solo modifica los exponentes de $y$, no el orden de derivación.']],
      'Al dividir entre $y$ queda $y\' + xy = x^3 y^{-1}$ (Bernoulli con $n = -1$), donde $v = y^{1-(-1)} = y^2$.'),

    N('re-n-exponente-simple', 'reconocimiento', 1, { a: [2, 5, 1], n: [2, 6, 1] },
      function (v) { return 'Identifica el exponente $n$ al escribir la ecuación $y\' + ' + v.a + 'x\\,y = x^2 y^{' + v.n + '}$ en la forma estándar de Bernoulli $y\' + P(x)\\,y = Q(x)\\,y^n$.'; },
      function (v) { return v.n; },
      'En $y\' + P(x)y = Q(x)y^n$, el número $n$ es el exponente de $y$ que acompaña a $Q(x)$.',
      { where: function (v) { return v.a !== v.n; },
        mistakes: { tookA: function (v) { return v.a; }, oneMinusN: function (v) { return 1 - v.n; } },
        feedback: [
          { when: 'tookA', say: function (v) { return 'Casi: ' + v.a + ' es el coeficiente en $P(x) = ' + v.a + 'x$, no el exponente de $y^n$.'; } },
          { when: 'oneMinusN', say: 'Casi: ese es el exponente $1 - n$ del cambio de variable; te piden el exponente $n$ de la ecuación.' }
        ] }),

    N('re-n-exponente-denom', 'reconocimiento', 1, { a: [2, 6, 1], m: [2, 5, 1] },
      function (v) { return '¿Cuánto vale el exponente $n$ de Bernoulli en la ecuación $y\' + ' + v.a + 'y = \\dfrac{x^3}{y^{' + v.m + '}}$?'; },
      function (v) { return -v.m; },
      'Como $y^m$ está en el denominador, al pasarlo al numerador queda $x^3 y^{-m}$, por lo que $n = -m$.',
      { mistakes: { posM: function (v) { return v.m; }, onePlusM: function (v) { return 1 + v.m; } },
        feedback: [
          { when: 'posM', say: function (v) { return 'Casi: como $y^{' + v.m + '}$ está dividiendo, su exponente en $Q(x)y^n$ es negativo: $n = -' + v.m + '$.'; } },
          { when: 'onePlusM', say: 'Casi: ese es $1 - n = 1 + m$ del cambio de variable, no el exponente $n$.' }
        ] }),

    N('re-n-eval-P-normalizar', 'reconocimiento', 1, { a: [2, 5, 1], b: [6, 12, 2], x0: [2, 3, 1] },
      function (v) { return 'Al llevar $' + v.a + 'x\\,y\' + ' + v.b + 'y = x^4 y^3$ a la forma estándar $y\' + P(x)\\,y = Q(x)\\,y^3$, ¿cuánto vale el coeficiente $P(' + v.x0 + ')$?'; },
      function (v) { return v.b / (v.a * v.x0); },
      'Dividiendo entre $ax$ queda $P(x) = \\frac{b}{ax}$, y luego se evalúa en $x = x_0$.',
      { mistakes: { noDivA: function (v) { return v.b / v.x0; }, noDivX: function (v) { return v.b / v.a; }, negVal: function (v) { return -v.b / (v.a * v.x0); } },
        feedback: [
          { when: 'noDivA', say: function (v) { return 'Casi: dividiste entre $x$, pero te faltó dividir también entre el coeficiente $' + v.a + '$ de $y\'$.'; } },
          { when: 'noDivX', say: 'Casi: el coeficiente de $y\'$ es $ax$, así que $P(x) = b/(ax)$ también divide entre $x_0$.' },
          { when: 'negVal', say: 'Casi: el término $+by$ ya está del lado izquierdo, así que $P(x)$ conserva su signo positivo.' }
        ] }),

    N('re-n-eval-Q-normalizar', 'reconocimiento', 2, { a: [2, 4, 1], c: [3, 9, 2], x0: [2, 4, 1] },
      function (v) { return 'Lleva la ecuación $x^2 y\' - ' + v.a + 'x\\,y = ' + v.c + 'x^3 y^4$ a la forma estándar $y\' + P(x)\\,y = Q(x)\\,y^4$. ¿Cuánto vale $Q(' + v.x0 + ')$?'; },
      function (v) { return v.c * v.x0; },
      'Al dividir toda la ecuación entre $x^2$, el coeficiente de $y^4$ queda $Q(x) = \\frac{cx^3}{x^2} = cx$.',
      { mistakes: { noDivX2: function (v) { return v.c * Math.pow(v.x0, 3); }, tookP: function (v) { return -v.a / v.x0; } },
        feedback: [
          { when: 'noDivX2', say: 'Casi: olvidaste dividir el lado derecho entre el coeficiente $x^2$ que multiplica a $y\'$.' },
          { when: 'tookP', say: 'Casi: ese es el valor de $P(x_0)$, que multiplica a $y$; te piden $Q(x_0)$, que multiplica a $y^4$.' }
        ] }),

    N('re-n-reordenar-P', 'reconocimiento', 2, { a: [2, 6, 1], b: [1, 4, 1], x0: [1, 3, 1] },
      function (v) { return 'Reordena la ecuación $y\' = ' + v.a + 'x\\,y - ' + v.b + 'x^2 y^3$ a la forma estándar $y\' + P(x)\\,y = Q(x)\\,y^3$. ¿Cuánto vale $P(' + v.x0 + ')$?'; },
      function (v) { return -v.a * v.x0; },
      'Al pasar $ax\\,y$ restando al lado izquierdo queda $y\' - ax\\,y = -bx^2 y^3$, por lo que $P(x) = -ax$.',
      { where: function (v) { return v.a !== v.b * v.x0; },
        mistakes: { posSign: function (v) { return v.a * v.x0; }, tookQ: function (v) { return -v.b * v.x0 * v.x0; } },
        feedback: [
          { when: 'posSign', say: 'Casi: al pasar el término $ax\\,y$ del lado derecho al izquierdo, cambia a signo negativo: $P(x) = -ax$.' },
          { when: 'tookQ', say: 'Casi: ese es $Q(x_0)$, el coeficiente de $y^3$ en el lado derecho.' }
        ] }),

    N('re-n-factorizar-logistica-Q', 'reconocimiento', 2, { r: [2, 6, 1], k: [2, 5, 1], x0: [1, 3, 1] },
      function (v) { return 'Desarrolla el producto en $y\' = ' + v.r + 'y(1 - ' + v.k + 'x\\,y)$ y escríbela en la forma $y\' + P(x)\\,y = Q(x)\\,y^2$. ¿Cuánto vale $Q(' + v.x0 + ')$?'; },
      function (v) { return -v.r * v.k * v.x0; },
      'Al expandir queda $y\' - ry = -rkx\\,y^2$, así que $Q(x) = -rkx$.',
      { mistakes: { noR: function (v) { return -v.k * v.x0; }, posSign: function (v) { return v.r * v.k * v.x0; } },
        feedback: [
          { when: 'noR', say: function (v) { return 'Casi: al quitar el paréntesis, el factor $' + v.r + 'y$ también multiplica a $-' + v.k + 'xy$.'; } },
          { when: 'posSign', say: 'Casi: el término con $y^2$ lleva signo menos, así que $Q(x) = -rkx < 0$.' }
        ] }),

    N('re-n-suma-n-P', 'reconocimiento', 2, { a: [2, 5, 1], m: [2, 4, 1], x0: [2, 4, 1] },
      function (v) { return 'En la ecuación $x\\,y\' - ' + v.a + 'y = \\dfrac{x^2}{y^{' + v.m + '}}$, identifica el exponente $n$ y la función $P(x)$ de la forma estándar. Calcula la suma $n + P(' + v.x0 + ')$.'; },
      function (v) { return -v.m - v.a / v.x0; },
      'Dividiendo entre $x$ queda $y\' - \\frac{a}{x}y = x\\,y^{-m}$, por lo que $n = -m$ y $P(x_0) = -a/x_0$.',
      { mistakes: { posM: function (v) { return v.m - v.a / v.x0; }, posP: function (v) { return -v.m + v.a / v.x0; } },
        feedback: [
          { when: 'posM', say: function (v) { return 'Casi: como $y^{' + v.m + '}$ está en el denominador, el exponente es $n = -' + v.m + '$.'; } },
          { when: 'posP', say: 'Casi: el coeficiente de $y$ tiene signo menos: $P(x) = -a/x$.' }
        ] }),

    N('re-n-oculta-producto-n', 'reconocimiento', 3, { p: [2, 4, 1], q: [5, 8, 1] },
      function (v) { return 'Divide la ecuación $y^{' + v.p + '} y\' + x\\,y^{' + (v.p + 1) + '} = e^x y^{' + v.q + '}$ entre $y^{' + v.p + '}$ para escribirla en la forma de Bernoulli $y\' + x\\,y = e^x y^n$. ¿Cuánto vale el exponente $n$?'; },
      function (v) { return v.q - v.p; },
      'Al dividir $y^q$ entre $y^p$ los exponentes se restan: $y^q / y^p = y^{q - p}$, así que $n = q - p$.',
      { mistakes: { justQ: function (v) { return v.q; }, sumPQ: function (v) { return v.q + v.p; } },
        feedback: [
          { when: 'justQ', say: function (v) { return 'Casi: al dividir entre $y^{' + v.p + '}$, el exponente del lado derecho disminuye en $' + v.p + '$.'; } },
          { when: 'sumPQ', say: 'Casi: al dividir potencias de la misma base los exponentes se restan ($q - p$), no se suman.' }
        ] }),

    N('re-n-parametro-hace-lineal', 'reconocimiento', 3, { k: [3, 9, 1] },
      function (v) { return 'En la ecuación $y\' + 2x\\,y = 5x\\,y^{2m - ' + v.k + '}$, ¿para qué valor de la constante $m$ el término de la derecha tiene exponente $n = 1$ (de modo que la ecuación ya es lineal homogénea)?'; },
      function (v) { return (v.k + 1) / 2; },
      'Igualando el exponente a $1$: $2m - k = 1 \\Rightarrow m = (k + 1)/2$.',
      { mistakes: { setZero: function (v) { return v.k / 2; }, noDiv2: function (v) { return v.k + 1; } },
        feedback: [
          { when: 'setZero', say: 'Casi: ese valor hace $n = 0$ (lineal no homogénea); la pregunta pide el valor que hace $n = 1$.' },
          { when: 'noDiv2', say: 'Casi: de $2m = k + 1$ falta dividir entre $2$ para despejar $m$.' }
        ] }),

    /* ======================= 2. Cambio de variable y ecuación lineal en v (18) ======================= */
    C('cv-formula-cambio', 'cambio', 1,
      'Para transformar la ecuación de Bernoulli $y\' + P(x)\\,y = Q(x)\\,y^n$ (con $n \\neq 0, 1$) en una ecuación lineal, ¿qué cambio de variable se utiliza?',
      '$v = y^{1-n}$', [
        ['$v = y^n$', 'Casi: el exponente del cambio de Bernoulli es $1 - n$, no $n$.'],
        ['$v = y^{n-1}$', 'Casi: el signo del exponente está invertido; debe ser $1 - n$ para coincidir con $y/y^n$.'],
        ['$v = \\dfrac{y}{x}$', 'Casi: $v = y/x$ es el cambio para ecuaciones homogéneas (S03), no para Bernoulli.']],
      'Al dividir entre $y^n$ aparece $y^{1-n}$ en el término con $P(x)$, por lo que se define $v = y^{1-n}$.'),

    C('cv-por-que-1-menos-n', 'cambio', 1,
      '¿Por qué el cambio de Bernoulli es $v = y^{1-n}$ y no otra potencia de $y$?',
      'Porque al dividir la EDO entre $y^n$, el término $P(x)\\,y$ queda $P(x)\\,y^{1-n}$ y su derivada $(1 - n)y^{-n}y\'$ es múltiplo exacto del primer término', [
        ['Porque $1 - n$ siempre es positivo para cualquier $n$', 'Casi: cuando $n > 1$, el exponente $1 - n$ es negativo (por ejemplo, $v = y^{-1}$ para $n = 2$).'],
        ['Porque hace que el factor integrante sea siempre constante', 'Casi: el factor integrante sigue dependiendo de $P(x)$; el cambio logra que la ecuación sea lineal en $v$.'],
        ['Porque elimina por completo a la función $Q(x)$ de la ecuación', 'Casi: $Q(x)$ permanece en el lado derecho multiplicada por $(1 - n)$.']],
      'Al dividir entre $y^n$ queda $y^{-n}y\' + P(x)y^{1-n} = Q(x)$, donde el primer término es $\\frac{1}{1-n}v\'$ y el segundo es $P(x)v$.'),

    C('cv-derivada-cadena', 'cambio', 1,
      function (v) { return 'Si defines el cambio de variable $v = y^{-' + v.m + '}$ donde $y$ es función de $x$, ¿cuánto vale la derivada $v\'$ respecto a $x$?'; },
      function (v) { return '$v\' = -' + v.m + 'y^{-' + (v.m + 1) + '}y\'$'; }, [
        [function (v) { return '$v\' = -' + v.m + 'y^{-' + (v.m + 1) + '}$'; }, 'Casi: olvidaste multiplicar por $y\'$ al aplicar la regla de la cadena respecto a $x$.'],
        [function (v) { return '$v\' = -' + v.m + 'y^{-' + (v.m - 1) + '}y\'$'; }, 'Casi: al restar $1$ al exponente negativo $-m$ queda $-(m + 1)$, no $-(m - 1)$.'],
        [function (v) { return '$v\' = ' + v.m + 'y^{-' + (v.m + 1) + '}y\'$'; }, 'Casi: al bajar el exponente negativo $-m$ debe conservarse el signo menos.']],
      'Por la regla de la cadena, $\\frac{d}{dx}(y^{-m}) = -m\\,y^{-m-1}\\,y\'$.',
      { vars: { m: [2, 5, 1] } }),

    C('cv-error-olvidar-factor', 'cambio', 2,
      function (v) { return 'Al aplicar $v = y^{' + (1 - v.n) + '}$ a la ecuación $y\' + ' + v.a + 'y = e^x y^{' + v.n + '}$, un estudiante escribe la lineal $v\' ' + ((1 - v.n) * v.a) + 'v = e^x$. ¿Qué error cometió?'; },
      function (v) { return 'Olvidó multiplicar también el lado derecho $Q(x) = e^x$ por el factor $(1 - n) = ' + (1 - v.n) + '$'; }, [
        ['Usó el exponente equivocado en el cambio de variable', 'Casi: el exponente $1 - n$ es correcto; lo que falló fue no multiplicar el lado derecho por $(1 - n)$.'],
        [function (v) { return 'No debía multiplicar el coeficiente $' + v.a + '$ por $' + (1 - v.n) + '$'; }, 'Casi: el factor $(1 - n)$ sí multiplica a $P(x)$, pero también debe multiplicar a $Q(x)$.'],
        ['Dejó $e^x$ cuando debía cambiarlo por $e^{(1-n)x}$', 'Casi: el factor $(1 - n)$ multiplica afuera a $Q(x)$, no dentro del exponente de $e^x$.']],
      'En $v\' + (1 - n)P(x)\\,v = (1 - n)Q(x)$, el factor $(1 - n)$ multiplica tanto a $P(x)$ como a $Q(x)$.',
      { vars: { a: [2, 5, 1], n: [3, 5, 1] } }),

    C('cv-factor-integrante-v', 'cambio', 2,
      function (v) {
        var m = (1 - v.n) * v.a;
        return 'Para resolver $y\' + ' + v.a + 'x\\,y = x\\,y^{' + v.n + '}$, haces $v = y^{' + (1 - v.n) + '}$ y obtienes $v\' ' + m + 'x\\,v = ' + (1 - v.n) + 'x$. ¿Cuál es el factor integrante $\\mu(x)$ de esta ecuación lineal en $v$?';
      },
      function (v) { return '$\\mu(x) = e^{' + (((1 - v.n) * v.a) / 2) + 'x^2}$'; }, [
        [function (v) { return '$\\mu(x) = e^{' + (v.a / 2) + 'x^2}$'; }, 'Casi: ese sería el factor con $P(x) = ax$, sin multiplicar por $(1 - n)$.'],
        [function (v) { return '$\\mu(x) = e^{' + ((1 - v.n) * v.a) + 'x}$'; }, 'Casi: la integral de $x\\,dx$ es $\\frac{1}{2}x^2$, no $x$.'],
        [function (v) { return '$\\mu(x) = e^{' + (((v.n - 1) * v.a) / 2) + 'x^2}$'; }, 'Casi: como $1 - n < 0$, el exponente del factor integrante lleva signo negativo.']],
      'El coeficiente de $v$ es $(1 - n)ax$, cuya integral es $\\frac{1}{2}(1 - n)ax^2$.',
      { vars: { a: [4, 6, 2], n: [3, 4, 1] } }),

    C('cv-convertir-condicion-inicial', 'cambio', 2,
      'Si resuelves una ecuación de Bernoulli con $n = 3$ mediante $v = y^{-2}$ y la condición inicial del problema es $y(0) = \\tfrac{1}{3}$, ¿qué condición inicial debes usar para despejar $C$ en la ecuación de $v$?',
      '$v(0) = \\left(\\tfrac{1}{3}\\right)^{-2} = 9$', [
        ['$v(0) = \\tfrac{1}{3}$, usando directamente el mismo número', 'Casi: $\\frac{1}{3}$ es el valor de $y(0)$, pero para $v = y^{-2}$ debes evaluar $v(0) = (y(0))^{-2} = 9$.'],
        ['$v(0) = \\left(\\tfrac{1}{3}\\right)^2 = \\tfrac{1}{9}$', 'Casi: el exponente de $v = y^{-2}$ es $-2$ (invierte y eleva al cuadrado), no $+2$.'],
        ['$v(0) = 3$, tomando solo el recíproco', 'Casi: $v = y^{-1} = 3$ sería para $n = 2$, pero con $n = 3$ es $v = y^{-2} = 3^2 = 9$.']],
      'Al trabajar en la variable $v = y^{1-n}$, la condición inicial $y(x_0) = y_0$ se transforma en $v(x_0) = y_0^{1-n}$.'),

    C('cv-bernoulli-en-x', 'cambio', 3,
      'La ecuación $\\dfrac{dy}{dx} = \\dfrac{y}{2x + y^3 x^2}$ no es de Bernoulli para $y(x)$, pero al invertir la derivada tomando a $x$ como función de $y$ queda $\\dfrac{dx}{dy} - \\dfrac{2}{y}x = y^2 x^2$. ¿Cómo se resuelve esta ecuación para $x(y)$?',
      'Como ecuación de Bernoulli en la variable dependiente $x(y)$ con $n = 2$, usando el cambio $v = x^{-1}$', [
        ['Con el cambio $v = y^{-1}$, porque el exponente $n = 2$ siempre se aplica a la letra $y$', 'Casi: al invertir la derivada, la incógnita pasó a ser $x(y)$, así que el cambio es $v = x^{1-2} = x^{-1}$.'],
        ['Directamente como lineal en $x(y)$, porque $y^2$ depende de la nueva variable independiente', 'Casi: aunque $y^2$ depende de $y$, está multiplicado por $x^2$, que es no lineal en la incógnita $x$.'],
        ['No se puede resolver, porque las ecuaciones de Bernoulli solo existen para $y(x)$', 'Casi: los nombres de las letras no importan; para $x(y)$ tiene exactamente la forma de Bernoulli con $n = 2$.']],
      'Con $x$ como variable dependiente y $y$ como independiente, $\\frac{dx}{dy} - \\frac{2}{y}x = y^2 x^2$ es Bernoulli en $x$ con $n = 2$.'),

    E('cv-e-cambio-expr', 'cambio', 2, { n: [2, 5, 1], k: [2, 6, 1] },
      function (v) { return 'En la ecuación $y\' + ' + v.k + 'x\\,y = e^x y^{' + v.n + '}$, el cambio de Bernoulli es $v = y^{1-n}$. Si una curva cumple $y(x) = x^2$ (para $x > 0$), escribe la expresión de $v(x)$ como potencia de $x$.'; },
      function (v) { return 'x^(' + (2 * (1 - v.n)) + ')'; },
      'Sustituyendo $y = x^2$ en $v = y^{1-n}$ resulta $v = (x^2)^{1-n} = x^{2(1-n)}$.',
      { domain: [0.5, 2],
        mistakes: { usedN: function (v) { return 'x^(' + (2 * v.n) + ')'; }, noSquare: function (v) { return 'x^(' + (1 - v.n) + ')'; } },
        feedback: [
          { when: 'usedN', say: 'Casi: el cambio de Bernoulli es $v = y^{1-n}$, no $v = y^n$.' },
          { when: 'noSquare', say: 'Casi: como $y = x^2$, al elevar a la potencia $1 - n$ los exponentes se multiplican: $2(1 - n)$.' }
        ] }),

    E('cv-e-fi-potencia', 'cambio', 2, { a: [2, 4, 1], n: [2, 4, 1] },
      function (v) { return 'Para la ecuación de Bernoulli $y\' - \\dfrac{' + v.a + '}{x}y = x^2 y^{' + v.n + '}$ (con $x > 0$), escribe el factor integrante $\\mu(x)$ (con $\\mu(1) = 1$) de la ecuación lineal resultante para $v = y^{' + (1 - v.n) + '}$.'; },
      function (v) { return 'x^(' + ((v.n - 1) * v.a) + ')'; },
      'En la lineal para $v$, el coeficiente de $v$ es $(1 - n)(-a/x) = \\frac{(n - 1)a}{x}$, cuyo factor integrante es $e^{(n-1)a\\ln x} = x^{(n-1)a}$.',
      { domain: [0.5, 2],
        mistakes: { noOneMinusN: function (v) { return 'x^(-' + v.a + ')'; }, wrongSign: function (v) { return 'x^(-' + ((v.n - 1) * v.a) + ')'; } },
        feedback: [
          { when: 'noOneMinusN', say: function (v) { return 'Casi: olvidaste multiplicar $P(x) = -' + v.a + '/x$ por $(1 - n) = ' + (1 - v.n) + '$ antes de integrar.'; } },
          { when: 'wrongSign', say: 'Casi: como $P(x) = -a/x$ y $(1 - n) < 0$, el producto $(1 - n)P(x)$ tiene signo positivo.' }
        ] }),

    N('cv-n-exponente-cambio', 'cambio', 1, { n: [2, 8, 1], a: [2, 5, 1] },
      function (v) { return 'Para resolver $y\' + ' + v.a + 'y = x\\,y^{' + v.n + '}$ mediante el cambio de Bernoulli $v = y^m$, ¿cuánto debe valer el exponente $m$?'; },
      function (v) { return 1 - v.n; },
      'El cambio de variable de Bernoulli usa siempre el exponente $m = 1 - n$.',
      { mistakes: { justN: function (v) { return v.n; }, nMinus1: function (v) { return v.n - 1; } },
        feedback: [
          { when: 'justN', say: 'Casi: ese es el exponente $n$ de la ecuación; el cambio de variable usa $m = 1 - n$.' },
          { when: 'nMinus1', say: 'Casi: es $1 - n$ (negativo cuando $n > 1$), no $n - 1$.' }
        ] }),

    N('cv-n-exponente-frac', 'cambio', 1, { p: [3, 7, 2] },
      function (v) { return 'Si tienes la ecuación $y\' + x\\,y = x^2 y^{' + v.p + '/2}$ y aplicas el cambio de Bernoulli $v = y^m$, ¿cuánto vale el exponente $m$ (en decimal)?'; },
      function (v) { return 1 - v.p / 2; },
      'Con $n = p/2$, el exponente del cambio es $m = 1 - n = 1 - p/2$.',
      { mistakes: { justN: function (v) { return v.p / 2; }, wrongSign: function (v) { return v.p / 2 - 1; } },
        feedback: [
          { when: 'justN', say: 'Casi: ese es $n = p/2$; para el cambio debes calcular $1 - n$.' },
          { when: 'wrongSign', say: 'Casi: restaste $n - 1$ en lugar de $1 - n$.' }
        ] }),

    N('cv-n-coef-v-lineal', 'cambio', 1, { a: [2, 6, 1], n: [3, 6, 1] },
      function (v) { return 'Al transformar $y\' + ' + v.a + 'y = 7x\\,y^{' + v.n + '}$ con $v = y^{' + (1 - v.n) + '}$ a la forma lineal $v\' + A\\,v = B\\,x$, ¿cuánto vale el coeficiente constante $A$?'; },
      function (v) { return (1 - v.n) * v.a; },
      'En $v\' + (1 - n)P\\,v = (1 - n)Q$, el coeficiente de $v$ es $A = (1 - n)a$.',
      { mistakes: { justA: function (v) { return v.a; }, posMult: function (v) { return (v.n - 1) * v.a; } },
        feedback: [
          { when: 'justA', say: function (v) { return 'Casi: te faltó multiplicar el coeficiente $' + v.a + '$ por $(1 - n) = ' + (1 - v.n) + '$.'; } },
          { when: 'posMult', say: function (v) { return 'Casi: como $1 - n = ' + (1 - v.n) + ' < 0$, el coeficiente $A$ queda negativo.'; } }
        ] }),

    N('cv-n-rhs-v-lineal', 'cambio', 2, { b: [2, 6, 1], n: [3, 5, 1], x0: [1, 3, 1] },
      function (v) { return 'Transforma $y\' - 3y = ' + v.b + 'x^2 y^{' + v.n + '}$ con $v = y^{' + (1 - v.n) + '}$ a la ecuación lineal $v\' + p(x)\\,v = q(x)$. ¿Cuánto vale el lado derecho $q(' + v.x0 + ')$?'; },
      function (v) { return (1 - v.n) * v.b * v.x0 * v.x0; },
      'El lado derecho de la lineal en $v$ es $q(x) = (1 - n)Q(x) = (1 - n)bx^2$.',
      { mistakes: { noFactor: function (v) { return v.b * v.x0 * v.x0; }, wrongSign: function (v) { return (v.n - 1) * v.b * v.x0 * v.x0; } },
        feedback: [
          { when: 'noFactor', say: function (v) { return 'Casi: olvidaste multiplicar $Q(x)$ por el factor $(1 - n) = ' + (1 - v.n) + '$.'; } },
          { when: 'wrongSign', say: function (v) { return 'Casi: multiplicaste por $n - 1$ en lugar de $1 - n = ' + (1 - v.n) + '$.'; } }
        ] }),

    N('cv-n-cond-inicial-v', 'cambio', 2, { n: [3, 4, 1], y0: [2, 5, 1] },
      function (v) { return 'En un PVI de Bernoulli con exponente $n = ' + v.n + '$, la condición inicial es $y(0) = \\dfrac{1}{' + v.y0 + '}$. ¿Cuánto vale la condición inicial $v(0)$ para la variable $v = y^{1-n}$?'; },
      function (v) { return Math.pow(v.y0, v.n - 1); },
      'Como $v = y^{1-n} = (1/y)^{n-1}$, al evaluar en $y(0) = 1/y_0$ resulta $v(0) = y_0^{n-1}$.',
      { mistakes: { keptFrac: function (v) { return 1 / Math.pow(v.y0, v.n - 1); }, rawY0: function (v) { return 1 / v.y0; }, usedN: function (v) { return Math.pow(v.y0, v.n); } },
        feedback: [
          { when: 'keptFrac', say: 'Casi: el exponente $1 - n$ es negativo, así que invierte la fracción $1/y_0$.' },
          { when: 'rawY0', say: 'Casi: ese es $y(0)$; debes elevarlo a la potencia $1 - n$ para obtener $v(0)$.' },
          { when: 'usedN', say: function (v) { return 'Casi: elevaste a la potencia $n = ' + v.n + '$ en lugar de $n - 1 = ' + (v.n - 1) + '$.'; } }
        ] }),

    N('cv-n-vprima-en-x0', 'cambio', 2, { a: [1, 3, 1], b: [2, 5, 1], n: [3, 4, 1], y0: [2, 3, 1] },
      function (v) { return 'Sea el PVI $y\' + ' + v.a + 'y = ' + v.b + 'y^{' + v.n + '}$ con $y(0) = ' + v.y0 + '$. Si defines $v = y^{1-' + v.n + '}$, ¿cuánto vale la derivada $v\'(0)$?'; },
      function (v) { return (1 - v.n) * (v.b - v.a * Math.pow(v.y0, 1 - v.n)); },
      'De $v\' + (1 - n)av = (1 - n)b$ con $v(0) = y_0^{1-n}$ se obtiene $v\'(0) = (1 - n)(b - ay_0^{1-n})$.',
      { mistakes: { noFactor: function (v) { return v.b - v.a * Math.pow(v.y0, 1 - v.n); }, plusSign: function (v) { return (1 - v.n) * (v.b + v.a * Math.pow(v.y0, 1 - v.n)); } },
        feedback: [
          { when: 'noFactor', say: function (v) { return 'Casi: olvidaste el factor $(1 - n) = ' + (1 - v.n) + '$ al despejar $v\'(0)$.'; } },
          { when: 'plusSign', say: 'Casi: al despejar $v\'$ de $v\' + (1-n)av = (1-n)b$, el término con $v$ pasa restando.' }
        ] }),

    N('cv-n-eval-fi-en-x0', 'cambio', 2, { a: [1, 2, 1], n: [3, 4, 1], x0: [1, 2, 1] },
      function (v) { return 'Para resolver $y\' - ' + v.a + 'y = x\\,y^{' + v.n + '}$ haces $v = y^{' + (1 - v.n) + '}$. Calcula el valor numérico del factor integrante $\\mu(x) = e^{\\int (1-n)P(x)\\,dx}$ (con $\\mu(0) = 1$) evaluado en $x = ' + v.x0 + '$.'; },
      function (v) { return Math.exp((v.n - 1) * v.a * v.x0); },
      'Aquí $P(x) = -a$ y $(1 - n)P(x) = (n - 1)a > 0$, por lo que $\\mu(x) = e^{(n-1)ax}$.',
      { mistakes: { noOneMinusN: function (v) { return Math.exp(-v.a * v.x0); }, keptPosA: function (v) { return Math.exp(v.a * v.x0); } },
        feedback: [
          { when: 'noOneMinusN', say: function (v) { return 'Casi: ese es $e^{\\int P\\,dx}$ sin multiplicar $P = -' + v.a + '$ por $(1 - n) = ' + (1 - v.n) + '$.'; } },
          { when: 'keptPosA', say: function (v) { return 'Casi: falta multiplicar el exponente por $(n - 1) = ' + (v.n - 1) + '$.'; } }
        ] }),

    N('cv-n-regreso-exponente', 'cambio', 3, { p: [3, 7, 2] },
      function (v) { return 'En una ecuación de Bernoulli con exponente fraccionario $n = \\dfrac{' + v.p + '}{2}$, después de hallar $v(x) = y^{1-n}$ despejas $y = v^r$. ¿Cuánto vale el exponente $r$ (en decimal)?'; },
      function (v) { return 2 / (2 - v.p); },
      'Como $v = y^{1-n}$ con $1 - n = \\frac{2 - p}{2}$, al despejar $y = v^{1/(1-n)}$ el exponente se invierte: $r = \\frac{2}{2 - p}$.',
      { mistakes: { oneMinusN: function (v) { return (2 - v.p) / 2; }, posSign: function (v) { return 2 / (v.p - 2); } },
        feedback: [
          { when: 'oneMinusN', say: 'Casi: ese es el exponente $1 - n$ para ir de $y$ a $v$; para regresar de $v$ a $y$ debes tomar su recíproco $1/(1 - n)$.' },
          { when: 'posSign', say: function (v) { return 'Casi: como $n = ' + v.p + '/2 > 1$, el exponente $1 - n$ y su recíproco $r$ son negativos.'; } }
        ] }),

    N('cv-n-suma-A-B-normalizada', 'cambio', 3, { k: [2, 4, 1], a: [2, 5, 1], b: [3, 7, 1], n: [3, 5, 1] },
      function (v) { return 'Al transformar $' + v.k + 'y\' + ' + (v.k * v.a) + 'y = ' + (v.k * v.b) + 'y^{' + v.n + '}$ mediante $v = y^{' + (1 - v.n) + '}$ a la ecuación lineal normalizada $v\' + A\\,v = B$, ¿cuánto vale la suma $A + B$?'; },
      function (v) { return (1 - v.n) * (v.a + v.b); },
      'Dividiendo primero entre $k$ queda $y\' + ay = by^n$; luego $A = (1 - n)a$ y $B = (1 - n)b$.',
      { mistakes: { forgotDivK: function (v) { return (1 - v.n) * v.k * (v.a + v.b); }, noOneMinusN: function (v) { return v.a + v.b; } },
        feedback: [
          { when: 'forgotDivK', say: function (v) { return 'Casi: antes de leer $P$ y $Q$ hay que dividir toda la ecuación entre el coeficiente $' + v.k + '$ de $y\'$.'; } },
          { when: 'noOneMinusN', say: function (v) { return 'Casi: te faltó multiplicar por el factor $(1 - n) = ' + (1 - v.n) + '$.'; } }
        ] }),

    /* ======================= 3. Bernoulli con n = 2 (18) ======================= */
    C('n2-cambio-especifico', 'n2', 1,
      'En toda ecuación de Bernoulli con exponente $n = 2$, como $y\' + P(x)\\,y = Q(x)\\,y^2$, ¿cuál es el cambio de variable y cómo se relaciona $v\'$ con $y\'$?',
      '$v = y^{-1} = \\dfrac{1}{y}$, con derivada $v\' = -y^{-2}y\'$', [
        ['$v = y^2$, con derivada $v\' = 2y\\,y\'$', 'Casi: $v = y^2$ corresponde a $n = -1$; cuando $n = 2$ el exponente es $1 - 2 = -1$.'],
        ['$v = y^{-1}$, con derivada $v\' = y^{-2}y\'$', 'Casi: al derivar $y^{-1}$ baja un signo menos: $v\' = -y^{-2}y\'$.'],
        ['$v = \\ln|y|$, con derivada $v\' = y\'/y$', 'Casi: al dividir entre $y^2$ queda $y^{-2}y\'$, que es la derivada de $-y^{-1}$, no de $\\ln|y|$.']],
      'Con $n = 2$ se tiene $1 - n = -1$, por lo que $v = 1/y$ y $v\' = -y^{-2}y\'$.'),

    C('n2-error-quedarse-en-v', 'n2', 1,
      function (v) { return 'Al resolver $y\' + y = y^2$ con $y(0) = \\dfrac{1}{' + (v.c + 1) + '}$, un alumno llega correctamente a $v(x) = 1 + ' + v.c + 'e^x$ y entrega esa expresión como respuesta final para $y(x)$. ¿Qué paso olvidó?'; },
      function (v) { return 'Regresar a la variable original usando $y = \\dfrac{1}{v}$, lo que da $y(x) = \\dfrac{1}{1 + ' + v.c + 'e^x}$'; }, [
        ['Elevar al cuadrado la expresión de $v(x)$', 'Casi: para $n = 2$ el cambio es $v = 1/y$, así que se regresa invirtiendo ($y = 1/v$), no elevando al cuadrado.'],
        ['Multiplicar $v(x)$ por el factor integrante $e^{-x}$', 'Casi: $v(x) = 1 + ce^x$ ya tiene despejada la $v$; solo faltaba invertir para obtener $y = 1/v$.'],
        ['Cambiar el signo del exponente de $e^x$ a $e^{-x}$', 'Casi: en $v\' - v = -1$ el exponente $+x$ es correcto; el único olvido fue no hacer $y = 1/v$.']],
      'Quedarse en $v(x)$ sin regresar a $y(x) = 1/v(x)$ es uno de los descuidos más frecuentes al resolver Bernoulli.',
      { vars: { c: [2, 6, 1] } }),

    C('n2-signos-al-sustituir', 'n2', 2,
      function (v) { return 'Cuando aplicas $v = \\dfrac{1}{y}$ a la ecuación $y\' + ' + v.a + 'y = ' + v.b + 'y^2$, ¿por qué cambian de signo ambos lados al escribir la lineal $v\' - ' + v.a + 'v = -' + v.b + '$?'; },
      'Porque el factor $(1 - n) = 1 - 2 = -1$ proviene del signo menos en la derivada $v\' = -y^{-2}y\'$', [
        ['Porque al pasar los términos al otro lado del signo igual cambian de signo', 'Casi: los términos siguen en su mismo lado; el cambio de signo viene de multiplicar toda la ecuación por $1 - n = -1$.'],
        ['Porque $v = 1/y$ siempre es negativo', 'Casi: el signo de $v$ es el mismo que el de $y$; el $-1$ viene de derivar $y^{-1}$.'],
        [function (v) { return 'Es opcional: daría exactamente lo mismo escribir $v\' + ' + v.a + 'v = ' + v.b + '$'; }, 'Casi: si no cambias los signos te queda el exponente al revés en el factor integrante y la función no resuelve la EDO.']],
      'Al dividir entre $y^2$ queda $y^{-2}y\' + av = b$, y como $y^{-2}y\' = -v\'$, al multiplicar por $-1$ resulta $v\' - av = -b$.',
      { vars: { a: [2, 6, 1], b: [3, 7, 1] } }),

    C('n2-con-coef-x-fi', 'n2', 2,
      'En el problema $y\' + \\dfrac{y}{x} = x\\,y^2$ (para $x > 0$), el cambio $v = \\dfrac{1}{y}$ produce la lineal $v\' - \\dfrac{v}{x} = -x$. ¿Cuál es el factor integrante correcto para integrar esta ecuación en $v$?',
      '$\\mu(x) = e^{-\\ln x} = \\dfrac{1}{x}$, porque en la ecuación para $v$ el coeficiente es $-\\dfrac{1}{x}$', [
        ['$\\mu(x) = e^{\\ln x} = x$, usando el signo $+1/x$ de la ecuación original en $y$', 'Casi: el factor integrante se calcula con el coeficiente de $v$, que ya tiene el signo cambiado por $(1 - n) = -1$.'],
        ['$\\mu(x) = -\\ln x$, sin tomar la exponencial', 'Casi: $-\\ln x$ es la integral $\\int (-1/x)\\,dx$; el factor integrante es la exponencial $e^{-\\ln x} = 1/x$.'],
        ['$\\mu(x) = -x$, bajando el signo menos afuera de la exponencial', 'Casi: $e^{-\\ln x} = (e^{\\ln x})^{-1} = x^{-1} = 1/x$, no $-x$.']],
      'Por propiedades de logaritmos, $e^{\\int (-1/x)\\,dx} = e^{-\\ln x} = e^{\\ln(x^{-1})} = \\frac{1}{x}$.'),

    C('n2-explosion-denominador', 'n2', 3,
      'La solución del PVI $y\' + \\dfrac{y}{x} = x\\,y^2$ con $y(1) = 1$ es $y(x) = \\dfrac{1}{2x - x^2}$. Aunque $P(x) = 1/x$ y $Q(x) = x$ son continuas en todo $(0, \\infty)$, ¿por qué el intervalo máximo de validez es solo $(0, 2)$?',
      'Porque en $x = 2$ la solución lineal $v(x) = 2x - x^2$ se anula y su recíproco $y = 1/v$ tiene una asíntota vertical', [
        ['Porque el cambio $v = 1/y$ deja de ser derivable cuando $x > 2$', 'Casi: $v(x) = 2x - x^2$ es un polinomio suave en todo $\\mathbb{R}$; el problema es que vale $0$ en $x = 2$ y $y = 1/v$ divide entre cero.'],
        ['Porque en $x = 2$ se anula el coeficiente $Q(x) = x$', 'Casi: en $x = 2$ se tiene $Q(2) = 2 \\neq 0$; lo que se anula en $x = 2$ es el denominador $2x - x^2$.'],
        ['Porque las ecuaciones de Bernoulli nunca tienen soluciones definidas más allá de $x = 2$', 'Casi: el punto donde explota depende de la condición inicial $y(1)$, que fija dónde se anula $v(x)$.']],
      'En las ecuaciones no lineales, $v(x)$ existe en $(0, \\infty)$, pero $y(x) = 1/v(x)$ explota en cuanto $v(x)$ cruza por cero.'),

    E('n2-e-regreso-directo', 'n2', 1, { a: [2, 5, 1], b: [1, 4, 1], k: [2, 4, 1] },
      function (v) { return 'Al resolver cierta ecuación de Bernoulli con $n = 2$ mediante $v = y^{-1}$, obtienes $v(x) = ' + v.a + 'x + ' + v.b + 'e^{' + v.k + 'x}$. Escribe la solución explícita $y(x)$ de la ecuación original.'; },
      function (v) { return '1/(' + v.a + '*x + ' + v.b + '*e^(' + v.k + '*x))'; },
      'Como $v = y^{-1} = 1/y$, al despejar $y$ simplemente se toma el recíproco $y(x) = 1/v(x)$.',
      { domain: [0.2, 1.5],
        mistakes: { keptV: function (v) { return v.a + '*x + ' + v.b + '*e^(' + v.k + '*x)'; }, invEachTerm: function (v) { return '1/(' + v.a + '*x) + 1/(' + v.b + '*e^(' + v.k + '*x))'; } },
        feedback: [
          { when: 'keptV', say: 'Casi: esa es $v(x)$; falta regresar a la variable original con $y = 1/v$.' },
          { when: 'invEachTerm', say: 'Casi: el recíproco de una suma es $\\frac{1}{A + B}$, no $\\frac{1}{A} + \\frac{1}{B}$.' }
        ] }),

    E('n2-e-const-coefs', 'n2', 2, { a: [1, 3, 1], m: [2, 4, 1], c: [1, 3, 1] },
      function (v) { return 'Resuelve el PVI $y\' + ' + v.a + 'y = ' + (v.m * v.a) + 'y^2$ con condición inicial $y(0) = \\dfrac{1}{' + (v.m + v.c) + '}$. Escribe la función $y(x)$.'; },
      function (v) { return '1/(' + v.m + ' + ' + v.c + '*e^(' + v.a + '*x))'; },
      'Con $v = 1/y$ queda $v\' - av = -ma$, cuya solución es $v = m + Ce^{ax}$. Como $v(0) = m + c$, resulta $C = c$ y $y = 1/v$.',
      { domain: [0, 1.5],
        mistakes: { stayV: function (v) { return v.m + ' + ' + v.c + '*e^(' + v.a + '*x)'; }, negExp: function (v) { return '1/(' + v.m + ' + ' + v.c + '*e^(-' + v.a + '*x))'; } },
        feedback: [
          { when: 'stayV', say: 'Casi: encontraste $v(x)$, pero debes escribir $y(x) = 1/v(x)$.' },
          { when: 'negExp', say: 'Casi: en $v\' - av = -ma$ el factor integrante es $e^{-ax}$, así que al despejar $v$ la exponencial queda $e^{ax}$.' }
        ] }),

    E('n2-e-signo-menos-P', 'n2', 2, { a: [2, 4, 1], k: [2, 5, 1] },
      function (v) { return 'Resuelve el PVI $y\' - ' + v.a + 'y = -' + v.a + 'y^2$ con condición inicial $y(0) = \\dfrac{1}{' + (1 + v.k) + '}$. Escribe $y(x)$.'; },
      function (v) { return '1/(1 + ' + v.k + '*e^(-' + v.a + '*x))'; },
      'Con $v = 1/y$: $v\' + av = a \\Rightarrow v = 1 + Ce^{-ax}$. De $v(0) = 1 + k$ sale $C = k$ y $y = \\frac{1}{1 + ke^{-ax}}$.',
      { domain: [0, 1.5],
        mistakes: { posExp: function (v) { return '1/(1 + ' + v.k + '*e^(' + v.a + '*x))'; }, stayV: function (v) { return '1 + ' + v.k + '*e^(-' + v.a + '*x)'; } },
        feedback: [
          { when: 'posExp', say: 'Casi: como la ecuación original tiene $-ay$, al multiplicar por $1 - n = -1$ queda $v\' + av = a$, cuya solución lleva $e^{-ax}$.' },
          { when: 'stayV', say: 'Casi: te quedaste en $v(x)$; regresa a $y(x) = 1/v(x)$.' }
        ] }),

    E('n2-e-coef-uno-sobre-x', 'n2', 2, { k: [1, 3, 1], c: [3, 6, 1] },
      function (v) { return 'Para $x > 0$, resuelve el PVI $y\' + \\dfrac{y}{x} = ' + v.k + 'x\\,y^2$ con condición inicial $y(1) = \\dfrac{1}{' + v.c + '}$. Escribe $y(x)$.'; },
      function (v) { return '1/(' + (v.c + v.k) + '*x - ' + v.k + '*x^2)'; },
      'Con $v = 1/y$: $v\' - v/x = -kx \\Rightarrow (v/x)\' = -k \\Rightarrow v = Cx - kx^2$. De $v(1) = c$ sale $C = c + k$.',
      { domain: [0.3, 1.0],
        mistakes: { plusX2: function (v) { return '1/(' + (v.c - v.k) + '*x + ' + v.k + '*x^2)'; }, cIsJustC: function (v) { return '1/(' + v.c + '*x - ' + v.k + '*x^2)'; } },
        feedback: [
          { when: 'plusX2', say: 'Casi: el lado derecho de la lineal en $v$ es $-kx$, así que al integrar aparece $-kx^2$ con signo menos.' },
          { when: 'cIsJustC', say: function (v) { return 'Casi: al evaluar $v(1) = C - ' + v.k + ' = ' + v.c + '$ se despeja $C = ' + (v.c + v.k) + '$.'; } }
        ] }),

    E('n2-e-rhs-exponencial', 'n2', 3, { a: [1, 2, 1], b: [3, 5, 1] },
      function (v) { return 'Resuelve el PVI $y\' + ' + v.a + 'y = ' + v.a + 'e^{' + v.a + 'x}y^2$ con condición inicial $y(0) = \\dfrac{1}{' + v.b + '}$. Escribe la función $y(x)$.'; },
      function (v) { return 'e^(-' + v.a + '*x)/(' + v.b + ' - ' + v.a + '*x)'; },
      'Con $v = 1/y$: $v\' - av = -ae^{ax} \\Rightarrow (e^{-ax}v)\' = -a \\Rightarrow v = (b - ax)e^{ax}$, y al invertir queda $y = \\frac{e^{-ax}}{b - ax}$.',
      { domain: [0.1, 0.8],
        mistakes: { plusAx: function (v) { return 'e^(-' + v.a + '*x)/(' + v.b + ' + ' + v.a + '*x)'; }, posExpNum: function (v) { return 'e^(' + v.a + '*x)/(' + v.b + ' - ' + v.a + '*x)'; } },
        feedback: [
          { when: 'plusAx', say: 'Casi: en $(e^{-ax}v)\' = -a$ el lado derecho tiene signo menos, así que al integrar sale $b - ax$.' },
          { when: 'posExpNum', say: 'Casi: como $v = (b - ax)e^{ax}$, al tomar el recíproco $y = 1/v$ la exponencial pasa a $e^{-ax}$.' }
        ] }),

    N('n2-n-hallar-C-en-v', 'n2', 1, { a: [1, 3, 1], y0: [3, 7, 1] },
      function (v) { return 'Al resolver $y\' + ' + v.a + 'y = ' + v.a + 'y^2$ con $v = y^{-1}$, la solución general para $v$ es $v(x) = 1 + Ce^{' + v.a + 'x}$. Si $y(0) = \\dfrac{1}{' + v.y0 + '}$, ¿cuánto vale la constante $C$?'; },
      function (v) { return v.y0 - 1; },
      'En $x = 0$ se tiene $v(0) = 1/y(0) = y_0$, así que $1 + C = y_0 \\Rightarrow C = y_0 - 1$.',
      { mistakes: { rawFrac: function (v) { return 1 / v.y0 - 1; }, forgotOne: function (v) { return v.y0; } },
        feedback: [
          { when: 'rawFrac', say: function (v) { return 'Casi: usaste $y(0) = 1/' + v.y0 + '$ sin invertir; recuerda que $v(0) = 1/y(0) = ' + v.y0 + '$.'; } },
          { when: 'forgotOne', say: 'Casi: ese es el valor de $v(0) = 1 + C$; falta restar $1$ para despejar $C$.' }
        ] }),

    N('n2-n-eval-simple', 'n2', 1, { a: [1, 2, 1], b: [3, 6, 1], x1: [1, 2, 1] },
      function (v) { return 'Resuelve el PVI $y\' - ' + v.a + 'y = -' + v.a + 'y^2$ con condición inicial $y(0) = \\dfrac{1}{' + v.b + '}$ y calcula el valor numérico de $y(' + v.x1 + ')$.'; },
      function (v) { return 1 / (1 + (v.b - 1) * Math.exp(-v.a * v.x1)); },
      'Con $v = 1/y$ queda $v\' + av = a \\Rightarrow v(x) = 1 + (b - 1)e^{-ax}$, y por tanto $y(x_1) = 1/v(x_1)$.',
      { mistakes: { stayV: function (v) { return 1 + (v.b - 1) * Math.exp(-v.a * v.x1); }, posExp: function (v) { return 1 / (1 + (v.b - 1) * Math.exp(v.a * v.x1)); } },
        feedback: [
          { when: 'stayV', say: 'Casi: ese es el valor de $v(x_1)$; falta tomar el recíproco $y(x_1) = 1/v(x_1)$.' },
          { when: 'posExp', say: 'Casi: para $y\' - ay = -ay^2$ la lineal es $v\' + av = a$, que lleva exponencial negativa $e^{-ax}$.' }
        ] }),

    N('n2-n-eval-const-distintos', 'n2', 2, { a: [1, 2, 1], k: [2, 4, 1], y0: [1, 3, 1] },
      function (v) { return 'Calcula el valor en $x = 1$ de la solución del PVI $y\' - ' + v.a + 'y = -' + (v.k * v.a) + 'y^2$ con condición inicial $y(0) = ' + v.y0 + '$.'; },
      function (v) { return 1 / (v.k + (1 / v.y0 - v.k) * Math.exp(-v.a)); },
      'La lineal $v\' + av = ka$ tiene solución $v(x) = k + (1/y_0 - k)e^{-ax}$, y en $x = 1$ vale $y(1) = 1/v(1)$.',
      { mistakes: { stayV: function (v) { return v.k + (1 / v.y0 - v.k) * Math.exp(-v.a); }, noInvY0: function (v) { return 1 / (v.k + (v.y0 - v.k) * Math.exp(-v.a)); } },
        feedback: [
          { when: 'stayV', say: 'Casi: calculaste $v(1)$; recuerda regresar a $y(1) = 1/v(1)$.' },
          { when: 'noInvY0', say: function (v) { return 'Casi: en $v(0) = 1/y(0)$ debes usar $1/' + v.y0 + '$, no $' + v.y0 + '$.'; } }
        ] }),

    N('n2-n-eval-coef-x', 'n2', 2, { c: [3, 6, 1] },
      function (v) { return 'Para $x > 0$, sea $y(x)$ la solución del PVI $y\' + \\dfrac{y}{x} = x\\,y^2$ con condición inicial $y(1) = \\dfrac{1}{' + v.c + '}$. ¿Cuánto vale $y(2)$?'; },
      function (v) { return 1 / (2 * v.c - 2); },
      'De $(v/x)\' = -1$ y $v(1) = c$ sale $v(x) = (c + 1)x - x^2$, que en $x = 2$ vale $v(2) = 2c - 2$, así que $y(2) = \\frac{1}{2c - 2}$.',
      { mistakes: { stayV: function (v) { return 2 * v.c - 2; }, cNotShifted: function (v) { return 1 / (2 * v.c - 4); } },
        feedback: [
          { when: 'stayV', say: 'Casi: ese es $v(2)$; para obtener $y(2)$ toma el recíproco $1/v(2)$.' },
          { when: 'cNotShifted', say: function (v) { return 'Casi: en $x = 1$, $v(1) = C - 1 = ' + v.c + '$, así que $C = ' + (v.c + 1) + '$, no $' + v.c + '$.'; } }
        ] }),

    N('n2-n-eval-lineal-x', 'n2', 2, { b: [2, 5, 1] },
      function (v) { return 'Resuelve el PVI $y\' - 2x\\,y = -2x\\,y^2$ con condición inicial $y(0) = \\dfrac{1}{' + (1 + v.b) + '}$ y evalúa la solución en $x = 1$.'; },
      function (v) { return 1 / (1 + v.b * Math.exp(-1)); },
      'Con $v = 1/y$: $v\' + 2xv = 2x \\Rightarrow v(x) = 1 + Ce^{-x^2}$. Con $v(0) = 1 + b$ queda $C = b$ y $y(1) = \\frac{1}{1 + be^{-1}}$.',
      { mistakes: { stayV: function (v) { return 1 + v.b * Math.exp(-1); }, posExp: function (v) { return 1 / (1 + v.b * Math.exp(1)); } },
        feedback: [
          { when: 'stayV', say: 'Casi: calculaste $v(1) = 1 + be^{-1}$; falta invertir para dar $y(1) = 1/v(1)$.' },
          { when: 'posExp', say: 'Casi: el factor integrante de $v\' + 2xv = 2x$ es $e^{x^2}$, así que al despejar $v$ queda $e^{-x^2}$.' }
        ] }),

    N('n2-n-asintota-vertical', 'n2', 2, { k: [1, 3, 1], c: [2, 6, 1] },
      function (v) { return 'El PVI $y\' + \\dfrac{y}{x} = ' + (v.k === 1 ? '' : v.k) + 'x\\,y^2$ con $y(1) = \\dfrac{1}{' + v.c + '}$ tiene solución $y(x) = \\dfrac{1}{(' + (v.c + v.k) + ')x - ' + v.k + 'x^2}$ para $x > 0$. ¿En qué valor positivo de $x$ explota la solución?'; },
      function (v) { return (v.c + v.k) / v.k; },
      'Para $x > 0$, el denominador $x(c + k - kx)$ se anula cuando $c + k - kx = 0 \\Rightarrow x = (c + k)/k$.',
      { mistakes: { forgotPlusK: function (v) { return v.c / v.k; }, multInstead: function (v) { return (v.c + v.k) * v.k; } },
        feedback: [
          { when: 'forgotPlusK', say: function (v) { return 'Casi: el coeficiente de $x$ en el denominador es $' + (v.c + v.k) + '$, no $' + v.c + '$.'; } },
          { when: 'multInstead', say: function (v) { return 'Casi: de $(' + (v.c + v.k) + ') - ' + v.k + 'x = 0$ se despeja dividiendo entre $' + v.k + '$.'; } }
        ] }),

    N('n2-n-rhs-x-partes', 'n2', 3, { c: [2, 5, 1], x1: [1, 2, 1] },
      function (v) { return 'Resuelve el PVI $y\' - y = -x\\,y^2$ con condición inicial $y(0) = \\dfrac{1}{' + v.c + '}$ y calcula el valor numérico de $y(' + v.x1 + ')$.'; },
      function (v) { return 1 / (v.x1 - 1 + (v.c + 1) * Math.exp(-v.x1)); },
      'Con $v = 1/y$ queda $v\' + v = x$, cuya solución general es $v = x - 1 + Ce^{-x}$. De $v(0) = c = -1 + C$ sale $C = c + 1$.',
      { mistakes: { cIsJustC: function (v) { return 1 / (v.x1 - 1 + v.c * Math.exp(-v.x1)); }, forgotMinus1: function (v) { return 1 / (v.x1 + v.c * Math.exp(-v.x1)); } },
        feedback: [
          { when: 'cIsJustC', say: function (v) { return 'Casi: en $x = 0$, $v(0) = -1 + C = ' + v.c + '$, por lo que $C = ' + (v.c + 1) + '$, no $' + v.c + '$.'; } },
          { when: 'forgotMinus1', say: 'Casi: al integrar $xe^x$ por partes sale $(x - 1)e^x$, así que la solución particular de $v\' + v = x$ es $x - 1$.' }
        ] }),

    N('n2-n-hallar-parametro-k', 'n2', 3, { k: [2, 5, 1], b: [3, 6, 1] },
      function (v) { return 'La solución del PVI $y\' - y = -k\\,y^2$ con condición inicial $y(0) = \\dfrac{1}{' + v.b + '}$ cumple que en $x = \\ln 2$ vale $y(\\ln 2) = \\dfrac{2}{' + (v.k + v.b) + '}$. ¿Cuánto vale la constante $k$?'; },
      function (v) { return v.k; },
      'Como $v(x) = k + (b - k)e^{-x}$, en $x = \\ln 2$ queda $v(\\ln 2) = k + \\frac{b - k}{2} = \\frac{k + b}{2}$, de donde se identifica $k$.',
      { where: function (v) { return v.k !== v.b; },
        mistakes: { sumKB: function (v) { return v.k + v.b; }, halfSum: function (v) { return (v.k + v.b) / 2; } },
        feedback: [
          { when: 'sumKB', say: function (v) { return 'Casi: ese número es la suma $k + ' + v.b + '$; debes restarle $b = ' + v.b + '$.'; } },
          { when: 'halfSum', say: 'Casi: ese es el valor de $v(\\ln 2) = (k + b)/2$, no la constante $k$.' }
        ] }),

    /* ======================= 4. Otras potencias (n = 3, 1/2, −1) y regreso a y (16) ======================= */
    C('po-regreso-raiz-n3', 'potencias', 1,
      'En una ecuación de Bernoulli con $n = 3$, el cambio de variable es $v = y^{-2}$. Una vez que encuentras $v(x)$, ¿cómo despejas $y(x)$?',
      '$y(x) = \\pm\\dfrac{1}{\\sqrt{v(x)}}$, eligiendo el signo $+$ o $-$ según el signo de la condición inicial $y(x_0)$', [
        ['$y(x) = \\dfrac{1}{v(x)^2}$, elevando al cuadrado el denominador', 'Casi: si $v = 1/y^2$, entonces $y^2 = 1/v$ y al despejar $y$ hay que sacar raíz cuadrada, no elevar al cuadrado.'],
        ['$y(x) = \\sqrt{v(x)}$, sin invertir la fracción', 'Casi: como el exponente de $v = y^{-2}$ es negativo, la raíz cuadrada queda en el denominador: $1/\\sqrt{v}$.'],
        ['$y(x) = -\\dfrac{1}{2v(x)}$, bajando el exponente como coeficiente', 'Casi: despejar una potencia requiere aplicar la potencia recíproca $v^{-1/2}$, no multiplicar por $-1/2$.']],
      'De $v = y^{-2} = 1/y^2$ se despeja $y^2 = 1/v$, por lo que $y = \\pm 1/\\sqrt{v}$ con el signo dado por $y(x_0)$.'),

    C('po-regreso-cuadrado-nmedio', 'potencias', 2,
      'Para resolver $y\' + y = e^x\\sqrt{y}$ con $y(0) = 1$, se usa $n = \\tfrac{1}{2}$ y el cambio $v = \\sqrt{y}$, obteniendo $v(x) = \\tfrac{1}{3}e^x + \\tfrac{2}{3}e^{-x/2}$. ¿Cómo se obtiene la solución $y(x)$?',
      'Elevando $v(x)$ al cuadrado: $y(x) = \\left(\\tfrac{1}{3}e^x + \\tfrac{2}{3}e^{-x/2}\\right)^2$', [
        ['Sacando raíz cuadrada: $y(x) = \\sqrt{\\tfrac{1}{3}e^x + \\tfrac{2}{3}e^{-x/2}}$', 'Casi: $v$ ya es $\\sqrt{y}$, así que la operación inversa para despejar $y$ es elevar al cuadrado: $y = v^2$.'],
        ['Elevando cada término al cuadrado por separado: $y(x) = \\tfrac{1}{9}e^{2x} + \\tfrac{4}{9}e^{-x}$', 'Casi: $(A + B)^2 = A^2 + 2AB + B^2$; no puedes omitir el doble producto al elevar la suma al cuadrado.'],
        ['Tomando el recíproco: $y(x) = \\dfrac{1}{\\tfrac{1}{3}e^x + \\tfrac{2}{3}e^{-x/2}}$', 'Casi: el recíproco $y = 1/v$ es para $n = 2$, pero aquí $n = 1/2$ y $v = y^{1/2}$.']],
      'Como $v = y^{1-1/2} = y^{1/2} = \\sqrt{y}$, al regresar a la variable original se eleva toda la expresión al cuadrado: $y = v^2$.'),

    C('po-lineal-cuando-n-medio', 'potencias', 2,
      function (v) { return 'Al aplicar el cambio $v = y^{1/2}$ a la ecuación $y\' + ' + v.a + 'y = ' + v.b + 'e^x\\sqrt{y}$, ¿qué ecuación lineal resulta para $v(x)$?'; },
      function (v) { return '$v\' + ' + (v.a / 2) + 'v = ' + (v.b / 2) + 'e^x$'; }, [
        [function (v) { return '$v\' + ' + v.a + 'v = ' + v.b + 'e^x$'; }, 'Casi: olvidaste multiplicar los coeficientes por $(1 - n) = 1 - \\tfrac{1}{2} = \\tfrac{1}{2}$.'],
        [function (v) { return '$v\' - ' + (v.a / 2) + 'v = -' + (v.b / 2) + 'e^x$'; }, 'Casi: cuando $n = 1/2$, el factor $1 - n = +1/2$ es positivo, así que no cambia los signos.'],
        [function (v) { return '$v\' + ' + (2 * v.a) + 'v = ' + (2 * v.b) + 'e^x$'; }, 'Casi: multiplicaste por $2$ en lugar de multiplicar por $1 - n = 1/2$.']],
      'Con $n = 1/2$ el factor es $1 - n = 1/2$, que divide entre $2$ tanto a $P(x)$ como a $Q(x)$.',
      { vars: { a: [2, 8, 2], b: [2, 8, 2] } }),

    C('po-caso-n-menos-1', 'potencias', 2,
      function (v) { return 'La ecuación $y\' + ' + v.a + 'y = \\dfrac{e^x}{y}$ es de Bernoulli con $n = -1$. ¿Qué cambio de variable la linealiza y qué ecuación queda?'; },
      function (v) { return '$v = y^2$, multiplicando por $(1 - n) = 2$: $v\' + ' + (2 * v.a) + 'v = 2e^x$'; }, [
        [function (v) { return '$v = y^{-2}$, quedando $v\' - ' + (2 * v.a) + 'v = -2e^x$'; }, 'Casi: como $n = -1$, el exponente es $1 - (-1) = +2$, positivo.'],
        [function (v) { return '$v = y^2$, quedando $v\' + ' + v.a + 'v = e^x$'; }, 'Casi: como $v\' = 2y\\,y\'$, falta multiplicar por $(1 - n) = 2$ tanto el término con $v$ como el lado derecho.'],
        [function (v) { return '$v = y^{-1}$, quedando $v\' - ' + v.a + 'v = -e^x$'; }, 'Casi: $v = y^{-1}$ es para $n = 2$ ($y^2$ en el numerador), pero aquí $y$ está en el denominador ($n = -1$).']],
      'Al multiplicar $y\' + ay = e^x/y$ por $2y$ se obtiene directamente $2y\\,y\' + 2ay^2 = 2e^x$, es decir, $v\' + 2av = 2e^x$ con $v = y^2$.',
      { vars: { a: [2, 5, 1] } }),

    C('po-eleccion-signo-negativo', 'potencias', 3,
      function (v) { return 'Resuelves $y\' - y = -y^3$ con condición inicial negativa $y(0) = -\\dfrac{1}{' + v.c + '}$. Con $v = y^{-2}$ obtienes $v(x) = 1 + ' + (v.c * v.c - 1) + 'e^{-2x}$. ¿Cuál es la solución correcta $y(x)$ del PVI?'; },
      function (v) { return '$y(x) = -\\dfrac{1}{\\sqrt{1 + ' + (v.c * v.c - 1) + 'e^{-2x}}}$, eligiendo la rama negativa para cumplir $y(0) = -\\tfrac{1}{' + v.c + '}$'; }, [
        [function (v) { return '$y(x) = +\\dfrac{1}{\\sqrt{1 + ' + (v.c * v.c - 1) + 'e^{-2x}}}$, porque una raíz cuadrada siempre es positiva'; }, 'Casi: el símbolo $\\sqrt{\\cdot}$ sí es positivo, por eso hay que anteponer el signo $-$ afuera para que $y(0)$ sea negativo.'],
        ['No tiene solución real, porque $y(0) < 0$ daría raíz de un número negativo', 'Casi: como $v(0) = (y(0))^{-2} = c^2 > 0$, dentro de la raíz siempre hay una cantidad positiva; el signo negativo va afuera.'],
        [function (v) { return '$y(x) = \\dfrac{1}{\\sqrt{1 - ' + (v.c * v.c + 1) + 'e^{-2x}}}$, cambiando el signo de $C$ dentro de la raíz'; }, 'Casi: $v(0) = (-1/c)^{-2} = +c^2$ es positivo, así que $C = c^2 - 1 > 0$; el signo de $y(0)$ se ajusta afuera al despejar $y = -1/\\sqrt{v}$.']],
      'Como $v = y^{-2}$ no distingue el signo de $y$, al despejar $y = \\pm 1/\\sqrt{v}$ la condición inicial $y(0) < 0$ selecciona la raíz con signo menos.',
      { vars: { c: [2, 6, 1] } }),

    E('po-e-n3-pvi', 'potencias', 2, { a: [1, 3, 1], y0: [2, 4, 1] },
      function (v) { return 'Resuelve el PVI $y\' + ' + v.a + 'y = ' + v.a + 'y^3$ con condición inicial $y(0) = \\dfrac{1}{' + v.y0 + '}$. Escribe la función $y(x)$ (usa <code>sqrt(...)</code>).'; },
      function (v) { return '1/sqrt(1 + ' + (v.y0 * v.y0 - 1) + '*e^(' + (2 * v.a) + '*x))'; },
      'Con $n = 3$ y $v = y^{-2}$: $v\' - 2av = -2a \\Rightarrow v = 1 + Ce^{2ax}$. De $v(0) = y_0^2$ sale $C = y_0^2 - 1$ y $y = 1/\\sqrt{v}$.',
      { domain: [-0.5, 1],
        mistakes: { noSqrt: function (v) { return '1/(1 + ' + (v.y0 * v.y0 - 1) + '*e^(' + (2 * v.a) + '*x))'; }, forgotSquareIC: function (v) { return '1/sqrt(1 + ' + (v.y0 - 1) + '*e^(' + (2 * v.a) + '*x))'; } },
        feedback: [
          { when: 'noSqrt', say: 'Casi: como $v = y^{-2}$, al regresar a $y$ debes sacar raíz cuadrada: $y = 1/\\sqrt{v}$.' },
          { when: 'forgotSquareIC', say: function (v) { return 'Casi: en $v = y^{-2}$, la condición inicial es $v(0) = ' + (v.y0 * v.y0) + '$, no $' + v.y0 + '$.'; } }
        ] }),

    E('po-e-nmenos1-pvi', 'potencias', 2, { a: [1, 2, 1], k: [2, 3, 1], y0: [2, 4, 1] },
      function (v) { return 'Resuelve para $y > 0$ el PVI $y\' + ' + v.a + 'y = \\dfrac{' + (v.k * v.a) + '}{y}$ con condición inicial $y(0) = ' + v.y0 + '$. Escribe $y(x)$.'; },
      function (v) { return 'sqrt(' + v.k + ' + ' + (v.y0 * v.y0 - v.k) + '*e^(-' + (2 * v.a) + '*x))'; },
      'Con $n = -1$ y $v = y^2$: $v\' + 2av = 2ka \\Rightarrow v = k + (y_0^2 - k)e^{-2ax}$, y como $y(0) > 0$, $y = \\sqrt{v}$.',
      { domain: [0, 1.5],
        where: function (v) { return v.y0 * v.y0 !== v.k; },
        mistakes: { noSqrt: function (v) { return v.k + ' + ' + (v.y0 * v.y0 - v.k) + '*e^(-' + (2 * v.a) + '*x)'; }, noSquareIC: function (v) { return 'sqrt(' + v.k + ' + ' + (v.y0 - v.k) + '*e^(-' + (2 * v.a) + '*x))'; } },
        feedback: [
          { when: 'noSqrt', say: 'Casi: esa es $v(x) = y^2$; falta sacar raíz cuadrada para obtener $y(x) = \\sqrt{v(x)}$.' },
          { when: 'noSquareIC', say: function (v) { return 'Casi: como $v = y^2$, en $x = 0$ tienes $v(0) = y(0)^2 = ' + (v.y0 * v.y0) + '$.'; } }
        ] }),

    E('po-e-nmedio-pvi', 'potencias', 3, { a: [2, 6, 2], k: [1, 3, 1], b: [2, 4, 1] },
      function (v) {
        var y0 = (v.k + v.b) * (v.k + v.b);
        return 'Resuelve el PVI $y\' + ' + v.a + 'y = ' + (v.k * v.a) + '\\sqrt{y}$ con condición inicial $y(0) = ' + y0 + '$. Escribe la función $y(x)$.';
      },
      function (v) { return '(' + v.k + ' + ' + v.b + '*e^(-' + (v.a / 2) + '*x))^2'; },
      'Con $v = \\sqrt{y}$: $v\' + (a/2)v = ka/2 \\Rightarrow v = k + Ce^{-(a/2)x}$. Como $v(0) = \\sqrt{y(0)} = k + b$, queda $C = b$ y $y = v^2$.',
      { domain: [0, 1.5],
        mistakes: { noSquare: function (v) { return v.k + ' + ' + v.b + '*e^(-' + (v.a / 2) + '*x)'; }, noHalfExp: function (v) { return '(' + v.k + ' + ' + v.b + '*e^(-' + v.a + '*x))^2'; } },
        feedback: [
          { when: 'noSquare', say: 'Casi: esa expresión es $v(x) = \\sqrt{y}$; te faltó elevarla al cuadrado para regresar a $y = v^2$.' },
          { when: 'noHalfExp', say: function (v) { return 'Casi: al multiplicar $P = ' + v.a + '$ por $1 - n = 1/2$, el exponente de la lineal es $-' + (v.a / 2) + 'x$.'; } }
        ] }),

    E('po-e-n3-coef-x', 'potencias', 3, { c: [3, 5, 1], k: [1, 3, 1] },
      function (v) { return 'Para $x > 0$, resuelve el PVI $y\' + \\dfrac{y}{x} = ' + v.k + 'y^3$ con condición inicial $y(1) = \\dfrac{1}{' + v.c + '}$. Escribe $y(x)$.'; },
      function (v) { return '1/sqrt(' + (2 * v.k) + '*x + ' + (v.c * v.c - 2 * v.k) + '*x^2)'; },
      'Con $v = y^{-2}$: $v\' - \\frac{2}{x}v = -2k \\Rightarrow (x^{-2}v)\' = -2kx^{-2} \\Rightarrow v = 2kx + Cx^2$. Con $v(1) = c^2$ resulta $C = c^2 - 2k$.',
      { domain: [0.4, 1.5],
        mistakes: { noSqrt: function (v) { return '1/(' + (2 * v.k) + '*x + ' + (v.c * v.c - 2 * v.k) + '*x^2)'; }, stayV: function (v) { return (2 * v.k) + '*x + ' + (v.c * v.c - 2 * v.k) + '*x^2'; } },
        feedback: [
          { when: 'noSqrt', say: 'Casi: olvidaste la raíz cuadrada al despejar $y = 1/\\sqrt{v}$ de $v = y^{-2}$.' },
          { when: 'stayV', say: 'Casi: esa es $v(x)$; regresa a la variable original con $y = 1/\\sqrt{v}$.' }
        ] }),

    N('po-n-regreso-valor-n3', 'potencias', 1, { v1: [4, 25, 1], k: [2, 5, 1] },
      function (v) { return 'Al resolver una ecuación de Bernoulli con $n = 3$ y condición inicial $y(0) > 0$, usas $v = y^{-2}$. Si en $x = ' + v.k + '$ obtienes $v(' + v.k + ') = ' + v.v1 + '$, ¿cuánto vale $y(' + v.k + ')$?'; },
      function (v) { return 1 / Math.sqrt(v.v1); },
      'Como $v = y^{-2}$ y $y > 0$, al despejar resulta $y = 1/\\sqrt{v}$.',
      { mistakes: { justInv: function (v) { return 1 / v.v1; }, sqrtVal: function (v) { return Math.sqrt(v.v1); }, negRoot: function (v) { return -1 / Math.sqrt(v.v1); } },
        feedback: [
          { when: 'justInv', say: 'Casi: $1/v$ sería para $n = 2$; con $n = 3$ ($v = y^{-2}$) debes tomar $1/\\sqrt{v}$.' },
          { when: 'sqrtVal', say: 'Casi: como el exponente de $v = y^{-2}$ es negativo, la raíz va en el denominador: $1/\\sqrt{v}$.' },
          { when: 'negRoot', say: 'Casi: la condición inicial $y(0) > 0$ indica que debes tomar la raíz positiva.' }
        ] }),

    N('po-n-regreso-valor-nmedio', 'potencias', 1, { a: [2, 6, 1], b: [1, 3, 2] },
      function (v) {
        var val = v.a + v.b / 2;
        return 'En una ecuación de Bernoulli con $n = \\tfrac{1}{2}$, hiciste el cambio $v = \\sqrt{y}$ y encontraste que en $x = 1$ vale $v(1) = ' + val + '$. ¿Cuánto vale la solución $y(1)$?';
      },
      function (v) { return Math.pow(v.a + v.b / 2, 2); },
      'Si $v = \\sqrt{y}$, entonces $y(1) = (v(1))^2$.',
      { mistakes: { sqrtAgain: function (v) { return Math.sqrt(v.a + v.b / 2); }, keptV: function (v) { return v.a + v.b / 2; }, invV: function (v) { return 1 / (v.a + v.b / 2); } },
        feedback: [
          { when: 'sqrtAgain', say: 'Casi: sacaste raíz cuadrada otra vez; para despejar $y$ de $v = \\sqrt{y}$ hay que elevar al cuadrado.' },
          { when: 'keptV', say: 'Casi: ese es el valor de $v(1)$; debes elevarlo al cuadrado para obtener $y(1)$.' },
          { when: 'invV', say: 'Casi: con $n = 1/2$ el cambio es $v = \\sqrt{y}$, así que $y = v^2$, no $1/v$.' }
        ] }),

    N('po-n-cond-inicial-nmedio', 'potencias', 1, { m: [2, 6, 1], a: [2, 8, 2] },
      function (v) {
        var y0 = v.m * v.m;
        return 'Para el PVI $y\' + ' + v.a + 'y = ' + v.a + '\\sqrt{y}$ con $y(0) = ' + y0 + '$, el cambio $v = \\sqrt{y}$ da la solución general $v(x) = 1 + Ce^{-' + (v.a / 2) + 'x}$. ¿Cuánto vale la constante $C$?';
      },
      function (v) { return v.m - 1; },
      'En $x = 0$ se tiene $v(0) = \\sqrt{y(0)} = m$, por lo que $1 + C = m \\Rightarrow C = m - 1$.',
      { mistakes: { noSqrtY0: function (v) { return v.m * v.m - 1; }, forgotMinus1: function (v) { return v.m; } },
        feedback: [
          { when: 'noSqrtY0', say: function (v) { return 'Casi: usaste $y(0) = ' + (v.m * v.m) + '$ directamente en lugar de convertir a $v(0) = \\sqrt{y(0)} = ' + v.m + '$.'; } },
          { when: 'forgotMinus1', say: 'Casi: ese es el valor de $v(0) = 1 + C$; falta restar $1$ para despejar $C$.' }
        ] }),

    N('po-n-eval-n3', 'potencias', 2, { a: [1, 2, 1], k: [2, 5, 1], y0: [1, 3, 1] },
      function (v) { return 'Resuelve el PVI $y\' - ' + v.a + 'y = -' + (v.k * v.a) + 'y^3$ con condición inicial $y(0) = ' + v.y0 + '$ y calcula el valor numérico de $y(1)$.'; },
      function (v) { return 1 / Math.sqrt(v.k + (1 / (v.y0 * v.y0) - v.k) * Math.exp(-2 * v.a)); },
      'Con $v = y^{-2}$ queda $v\' + 2av = 2ka \\Rightarrow v(x) = k + (y_0^{-2} - k)e^{-2ax}$, y en $x = 1$ es $y(1) = 1/\\sqrt{v(1)}$.',
      { mistakes: { noSqrt: function (v) { return 1 / (v.k + (1 / (v.y0 * v.y0) - v.k) * Math.exp(-2 * v.a)); }, stayV: function (v) { return v.k + (1 / (v.y0 * v.y0) - v.k) * Math.exp(-2 * v.a); } },
        feedback: [
          { when: 'noSqrt', say: 'Casi: tomaste $1/v(1)$ sin la raíz cuadrada; recuerda que con $n = 3$ es $y = 1/\\sqrt{v}$.' },
          { when: 'stayV', say: 'Casi: ese es el valor de $v(1)$; regresa a $y(1) = 1/\\sqrt{v(1)}$.' }
        ] }),

    N('po-n-eval-nmedio', 'potencias', 2, { a: [2, 4, 2], k: [2, 4, 1], m: [1, 3, 1] },
      function (v) {
        var y0 = v.m * v.m;
        return 'Sea $y(x)$ la solución del PVI $y\' + ' + v.a + 'y = ' + (v.k * v.a) + '\\sqrt{y}$ con condición inicial $y(0) = ' + y0 + '$. ¿Cuánto vale $y(1)$?';
      },
      function (v) {
        var v1 = v.k + (v.m - v.k) * Math.exp(-v.a / 2);
        return v1 * v1;
      },
      'Con $v = \\sqrt{y}$ resulta $v(x) = k + (m - k)e^{-(a/2)x}$, y al regresar se eleva al cuadrado: $y(1) = (v(1))^2$.',
      { where: function (v) { return v.m !== v.k; },
        mistakes: {
          stayV: function (v) { return v.k + (v.m - v.k) * Math.exp(-v.a / 2); },
          noHalfExp: function (v) { var v1 = v.k + (v.m - v.k) * Math.exp(-v.a); return v1 * v1; }
        },
        feedback: [
          { when: 'stayV', say: 'Casi: ese es $v(1) = \\sqrt{y(1)}$; te faltó elevarlo al cuadrado.' },
          { when: 'noHalfExp', say: function (v) { return 'Casi: en la ecuación lineal para $v = \\sqrt{y}$ el exponente se multiplica por $1 - n = 1/2$, dando $e^{-' + (v.a / 2) + 'x}$.'; } }
        ] }),

    N('po-n-eval-nmenos1', 'potencias', 2, { a: [1, 2, 1], k: [3, 8, 1], y0: [2, 4, 1] },
      function (v) { return 'Resuelve el PVI $y\' + ' + v.a + 'y = \\dfrac{' + (v.k * v.a) + '}{y}$ con $y(0) = ' + v.y0 + '$ y calcula el valor de $y(1)$.'; },
      function (v) { return Math.sqrt(v.k + (v.y0 * v.y0 - v.k) * Math.exp(-2 * v.a)); },
      'Con $n = -1$ y $v = y^2$ queda $v\' + 2av = 2ka \\Rightarrow v(1) = k + (y_0^2 - k)e^{-2a}$, y $y(1) = \\sqrt{v(1)}$.',
      { where: function (v) { return v.y0 * v.y0 !== v.k; },
        mistakes: { stayV: function (v) { return v.k + (v.y0 * v.y0 - v.k) * Math.exp(-2 * v.a); }, noFactor2: function (v) { return Math.sqrt(v.k + (v.y0 * v.y0 - v.k) * Math.exp(-v.a)); } },
        feedback: [
          { when: 'stayV', say: 'Casi: ese es $v(1) = y(1)^2$; falta sacar la raíz cuadrada.' },
          { when: 'noFactor2', say: 'Casi: como $1 - n = 2$, el exponente de la lineal en $v$ lleva el factor $2$: $e^{-2a}$.' }
        ] }),

    N('po-n-eval-n4-cubica', 'potencias', 3, { k: [2, 5, 1], y0: [1, 2, 1] },
      function (v) { return 'Resuelve el PVI $y\' - y = -' + v.k + 'y^4$ con condición inicial $y(0) = ' + v.y0 + '$ y evalúa $y(1)$.'; },
      function (v) {
        var v1 = v.k + (Math.pow(v.y0, -3) - v.k) * Math.exp(-3);
        return Math.pow(v1, -1 / 3);
      },
      'Con $n = 4$ y $v = y^{-3}$ queda $v\' + 3v = 3k \\Rightarrow v(1) = k + (y_0^{-3} - k)e^{-3}$, de donde $y(1) = (v(1))^{-1/3}$.',
      { mistakes: {
          justInv: function (v) { return 1 / (v.k + (Math.pow(v.y0, -3) - v.k) * Math.exp(-3)); },
          posThird: function (v) { return Math.pow(v.k + (Math.pow(v.y0, -3) - v.k) * Math.exp(-3), 1 / 3); }
        },
        feedback: [
          { when: 'justInv', say: 'Casi: ese es $1/v(1) = y(1)^3$; falta sacar la raíz cúbica.' },
          { when: 'posThird', say: 'Casi: como $v = y^{-3}$, al despejar $y$ el exponente es $-1/3$ (en el denominador), no $+1/3$.' }
        ] }),

    /* ======================= 5. Ecuación logística y aplicaciones (18) ======================= */
    C('lo-significado-K', 'logistica', 1,
      'En la ecuación logística $\\dfrac{dP}{dt} = r\\,P\\left(1 - \\dfrac{P}{K}\\right)$ que modela una población, ¿qué representa la constante positiva $K$?',
      'La capacidad de carga: la población máxima sostenible hacia la que tienden las soluciones con $P(0) > 0$', [
        ['La población inicial en el instante $t = 0$', 'Casi: la población inicial se denota por $P_0 = P(0)$, mientras que $K$ es el límite ambiental a largo plazo.'],
        ['La tasa relativa de natalidad cuando hay pocos individuos', 'Casi: esa tasa inicial es el parámetro $r$; la letra $K$ mide cuántos individuos admite el ambiente.'],
        ['El tiempo que tarda la población en duplicarse', 'Casi: $K$ tiene unidades de población (individuos), no unidades de tiempo.']],
      'Cuando $P$ se acerca a $K$, el factor $(1 - P/K)$ se acerca a $0$ y frena el crecimiento; $K$ es la capacidad de carga.'),

    C('lo-como-bernoulli', 'logistica', 1,
      'Al desarrollar la ecuación logística $P\' = r\\,P\\left(1 - \\dfrac{P}{K}\\right)$ para resolverla como ecuación de Bernoulli, ¿cómo queda escrita en la forma estándar?',
      '$P\' - r\\,P = -\\dfrac{r}{K}P^2$, que es de Bernoulli con $n = 2$', [
        ['$P\' + r\\,P = \\dfrac{r}{K}P^2$, con ambos signos positivos', 'Casi: al pasar $rP$ al lado izquierdo queda $-rP$, y en el lado derecho queda $-\\frac{r}{K}P^2$.'],
        ['$P\' - \\dfrac{r}{K}P = -r\\,P^2$, intercambiando los coeficientes', 'Casi: al multiplicar $rP(1 - P/K)$ el término lineal es $rP$ y el cuadrático es $-\\frac{r}{K}P^2$.'],
        ['$P\' - r\\,P = -\\dfrac{1}{K}P^2$, sin multiplicar el segundo término por $r$', 'Casi: el factor $rP$ fuera del paréntesis multiplica tanto a $1$ como a $-P/K$.']],
      'Expandiendo $rP(1 - P/K) = rP - \\frac{r}{K}P^2$ y pasando $rP$ restando se obtiene $P\' - rP = -\\frac{r}{K}P^2$.'),

    C('lo-dos-metodos', 'logistica', 2,
      'En la lección se explica que la ecuación logística $P\' = r\\,P\\left(1 - \\dfrac{P}{K}\\right)$ se puede resolver de dos maneras clásicas de primer orden y ambas dan la misma fórmula. ¿Cuáles son?',
      'Como ecuación de Bernoulli con $v = 1/P$ o como ecuación separable usando fracciones parciales', [
        ['Como ecuación lineal directa o por integración directa sin separar variables', 'Casi: no es lineal en $P$ (por el $P^2$) ni depende solo de $t$, así que requiere Bernoulli o separación de variables.'],
        ['Con el cambio homogéneo $v = P/t$ o por variación de parámetros de segundo orden', 'Casi: no es una función homogénea de $P/t$ ni es una ecuación de segundo orden.'],
        ['Solo como Bernoulli, porque al separar variables la integral no tiene primitiva elemental', 'Casi: al separar variables queda $\\int \\frac{K\\,dP}{P(K - P)}$, que sí se integra con fracciones parciales simples.']],
      'Bernoulli evita las fracciones parciales usando $v = 1/P$, mientras que la separación evita el cambio de variable; las dos llevan al mismo resultado.'),

    C('lo-error-constante-A', 'logistica', 2,
      function (v) { return 'En la fórmula logística $P(t) = \\dfrac{K}{1 + A\\,e^{-rt}}$ con $K = ' + v.K + '$ y $P(0) = ' + v.P0 + '$, un estudiante escribe $A = K - P_0 = ' + (v.K - v.P0) + '$. ¿Por qué está mal y cuánto vale $A$ en realidad?'; },
      function (v) { return 'Porque al evaluar en $t = 0$ debe cumplirse $\\dfrac{K}{1 + A} = P_0$, de donde se despeja $A = \\dfrac{K}{P_0} - 1 = ' + (v.K / v.P0 - 1) + '$'; }, [
        [function (v) { return 'Porque en realidad $A = \\dfrac{K}{P_0} = ' + (v.K / v.P0) + '$ sin restar $1$'; }, 'Casi: si $A$ fuera $K/P_0$, en $t = 0$ tendrías $\\frac{K}{1 + K/P_0} \\neq P_0$; hace falta el $-1$.'],
        [function (v) { return 'Porque $A$ siempre es igual a la población inicial $P_0 = ' + v.P0 + '$'; }, 'Casi: si $A = P_0$, en $t = 0$ daría $K/(1 + P_0)$ en lugar de $P_0$.'],
        ['Porque en $t = 0$ la exponencial $e^{-rt}$ vale $0$ y desaparece $A$', 'Casi: $e^0 = 1$, no $0$, así que en $t = 0$ queda $P(0) = K/(1 + A)$.']],
      'En $t = 0$ se tiene $P(0) = \\frac{K}{1 + A} = P_0 \\Rightarrow 1 + A = \\frac{K}{P_0} \\Rightarrow A = \\frac{K}{P_0} - 1$.',
      { vars: { K: [500, 1500, 500], P0: [50, 100, 50] } }),

    C('lo-punto-inflexion', 'logistica', 2,
      'Si una población empieza con pocos individuos ($0 < P_0 < K/2$), su gráfica $P(t)$ tiene forma de S. ¿En qué valor de la población $P$ ocurre el punto de inflexión donde la rapidez de crecimiento $dP/dt$ es máxima?',
      'En $P = \\dfrac{K}{2}$, justo a la mitad de la capacidad de carga', [
        ['Al principio, en $P = P_0$, cuando hay más recursos disponibles por individuo', 'Casi: al principio la tasa por individuo es alta, pero hay pocos individuos; la rapidez total $dP/dt$ es máxima en $P = K/2$.'],
        ['Cuando $P = K$, al llenarse por completo el ambiente', 'Casi: cuando $P = K$ el factor $(1 - P/K)$ vale $0$, así que el crecimiento se detiene ($dP/dt = 0$).'],
        ['En $P = \\dfrac{K}{e}$, donde la exponencial decae un factor $1/e$', 'Casi: la parábola $rP(1 - P/K)$ tiene su vértice exactamente a la mitad entre $0$ y $K$, es decir, en $P = K/2$.']],
      'La función cuadrática $f(P) = rP(1 - P/K)$ se anula en $P = 0$ y $P = K$, por lo que alcanza su máximo en el punto medio $P = K/2$.'),

    C('lo-empezar-arriba-de-K', 'logistica', 3,
      '¿Qué le ocurre a la solución de la ecuación logística $P\' = r\\,P\\left(1 - \\dfrac{P}{K}\\right)$ si la población inicial supera la capacidad de carga, es decir, $P(0) = P_0 > K$?',
      'Como $1 - P/K < 0$, la derivada $P\'$ es negativa y la población disminuye monótonamente acercándose a $K$ desde arriba', [
        ['La población crece hacia infinito porque ya rebasó la barrera $K$', 'Casi: en la logística el signo de $1 - P/K$ para $P > K$ es negativo, así que frena y hace bajar a $P$ hacia $K$.'],
        ['Cae rápidamente pasando por debajo de $K$ y luego oscila alrededor de $K$', 'Casi: una EDO autónoma de primer orden no puede oscilar ni cruzar la solución constante $P = K$.'],
        ['Se desploma hasta extinguirse en $P = 0$', 'Casi: al bajar y acercarse a $K$, la derivada $P\'$ se hace casi cero y la curva se estabiliza en $K$, no en $0$.']],
      'Cuando $P > K$ el factor $(1 - P/K)$ es negativo, así que $P\' < 0$ y la curva desciende asintóticamente hacia el equilibrio estable $P = K$.'),

    E('lo-e-formula-t', 'logistica', 2, { K: [200, 600, 200], m: [4, 10, 2], r: [2, 5, 1] },
      function (v) {
        var P0 = v.K / v.m;
        return 'Una población cumple la ecuación logística $P\' = ' + v.r + 'P\\left(1 - \\dfrac{P}{' + v.K + '}\\right)$ con población inicial $P(0) = ' + P0 + '$. Escribe la función explícita $P(t)$.';
      },
      function (v) { return v.K + '/(1 + ' + (v.m - 1) + '*e^(-' + v.r + '*t))'; },
      'Aquí $K/P_0 - 1 = m - 1$, por lo que $P(t) = \\frac{K}{1 + (m - 1)e^{-rt}}$.',
      { exprVars: ['t'], domain: [0.1, 1.5],
        mistakes: { noMinusOne: function (v) { return v.K + '/(1 + ' + v.m + '*e^(-' + v.r + '*t))'; }, posExp: function (v) { return v.K + '/(1 + ' + (v.m - 1) + '*e^(' + v.r + '*t))'; } },
        feedback: [
          { when: 'noMinusOne', say: function (v) { return 'Casi: la constante que multiplica a $e^{-rt}$ es $K/P_0 - 1 = ' + (v.m - 1) + '$, no $K/P_0 = ' + v.m + '$.'; } },
          { when: 'posExp', say: 'Casi: en la solución logística el exponente lleva signo negativo, $e^{-rt}$, para que $P(t) \\to K$ cuando $t \\to \\infty$.' }
        ] }),

    E('lo-e-en-variable-v', 'logistica', 2, { K: [100, 400, 100], m: [5, 10, 5], r: [2, 4, 1] },
      function (v) {
        var P0 = v.K / v.m;
        return 'Al aplicar el cambio de Bernoulli $v = 1/P$ al PVI logístico $P\' = ' + v.r + 'P\\left(1 - \\dfrac{P}{' + v.K + '}\\right)$ con $P(0) = ' + P0 + '$, escribe la solución $v(t)$ en función de $t$.';
      },
      function (v) { return '(1 + ' + (v.m - 1) + '*e^(-' + v.r + '*t))/' + v.K; },
      'En la variable $v = 1/P$, la ecuación lineal $v\' + rv = r/K$ tiene solución $v(t) = \\frac{1 + (m - 1)e^{-rt}}{K}$.',
      { exprVars: ['t'], domain: [0.1, 1.5],
        mistakes: { invertedP: function (v) { return v.K + '/(1 + ' + (v.m - 1) + '*e^(-' + v.r + '*t))'; }, noMinusOne: function (v) { return '(1 + ' + v.m + '*e^(-' + v.r + '*t))/' + v.K; } },
        feedback: [
          { when: 'invertedP', say: 'Casi: esa es $P(t)$; la pregunta pide la función $v(t) = 1/P(t)$ antes de invertir.' },
          { when: 'noMinusOne', say: function (v) { return 'Casi: en $t = 0$ debe cumplirse $v(0) = 1/P_0 = ' + v.m + '/' + v.K + '$, así que el coeficiente es $' + (v.m - 1) + '$.'; } }
        ] }),

    N('lo-n-constante-A', 'logistica', 1, { K: [300, 1200, 300], P0: [15, 60, 15] },
      function (v) { return 'En la solución logística $P(t) = \\dfrac{K}{1 + A\\,e^{-rt}}$, calcula el valor de la constante adimensional $A = \\dfrac{K}{P_0} - 1$ si la capacidad de carga es $K = ' + v.K + '$ y la población inicial es $P_0 = ' + v.P0 + '$.'; },
      function (v) { return v.K / v.P0 - 1; },
      'Evaluando $\\frac{K}{P_0} - 1$ directamente se obtiene el valor de $A$.',
      { mistakes: { noMinus1: function (v) { return v.K / v.P0; }, diffKP0: function (v) { return v.K - v.P0; } },
        feedback: [
          { when: 'noMinus1', say: 'Casi: te faltó restar $1$ al cociente $K/P_0$.' },
          { when: 'diffKP0', say: 'Casi: la constante es $\\frac{K}{P_0} - 1$ (cociente menos uno), no la resta $K - P_0$.' }
        ] }),

    N('lo-n-tasa-instantanea', 'logistica', 1, { r: [2, 6, 1], K: [100, 200, 50], P: [20, 80, 20] },
      function (v) {
        var rr = v.r / 10;
        return 'Una población sigue el modelo logístico $\\dfrac{dP}{dt} = ' + rr + 'P\\left(1 - \\dfrac{P}{' + v.K + '}\\right)$ (en individuos por año). ¿Cuál es la razón de cambio instantánea $dP/dt$ cuando hay $P = ' + v.P + '$ individuos?';
      },
      function (v) { return (v.r / 10) * v.P * (1 - v.P / v.K); },
      'Basta evaluar el lado derecho $rP(1 - P/K)$ en el valor dado de $P$.',
      { mistakes: { expGrowth: function (v) { return (v.r / 10) * v.P; }, noFactorP: function (v) { return (v.r / 10) * (1 - v.P / v.K); } },
        feedback: [
          { when: 'expGrowth', say: 'Casi: calculaste solo $rP$, olvidando multiplicar por el factor de freno $(1 - P/K)$.' },
          { when: 'noFactorP', say: 'Casi: olvidaste multiplicar por $P$ fuera del paréntesis.' }
        ] }),

    N('lo-n-tasa-maxima', 'logistica', 1, { r: [2, 8, 2], K: [200, 800, 200] },
      function (v) {
        var rr = v.r / 10;
        return 'Para una población que cumple $\\dfrac{dP}{dt} = ' + rr + 'P\\left(1 - \\dfrac{P}{' + v.K + '}\\right)$, ¿cuánto vale la rapidez máxima de crecimiento $\\left(\\dfrac{dP}{dt}\\right)_{\\text{máx}}$ (que se alcanza cuando $P = K/2$)?';
      },
      function (v) { return (v.r / 10) * (v.K / 4); },
      'En $P = K/2$, la derivada vale $r(K/2)(1 - 1/2) = \\frac{rK}{4}$.',
      { mistakes: { halfK: function (v) { return v.K / 2; }, forgotHalfFactor: function (v) { return (v.r / 10) * (v.K / 2); } },
        feedback: [
          { when: 'halfK', say: 'Casi: $K/2$ es el tamaño de la población donde ocurre el máximo, pero te piden la derivada máxima $dP/dt = rK/4$.' },
          { when: 'forgotHalfFactor', say: 'Casi: en $P = K/2$ el paréntesis $(1 - P/K)$ también aporta un factor $1/2$, dando $rK/4$.' }
        ] }),

    N('lo-n-poblacion-en-t', 'logistica', 2, { K: [400, 1200, 200], P0: [20, 80, 20], r: [2, 6, 1], t: [3, 8, 1] },
      function (v) {
        var rr = v.r / 10;
        return 'En un cultivo de levadura con capacidad límite $K = ' + v.K + '$ células y tasa $r = ' + rr + '\\text{ h}^{-1}$, se inicia con $P(0) = ' + v.P0 + '$ células. Según el modelo logístico, ¿qué cantidad $P(' + v.t + ')$ habrá al cabo de $' + v.t + '$ horas?';
      },
      function (v) { return v.K / (1 + (v.K / v.P0 - 1) * Math.exp(-(v.r / 10) * v.t)); },
      'Evalúa la fórmula logística $P(t) = \\frac{K}{1 + (K/P_0 - 1)e^{-rt}}$.',
      { mistakes: {
          expOnly: function (v) { return v.P0 * Math.exp((v.r / 10) * v.t); },
          noMinusOne: function (v) { return v.K / (1 + (v.K / v.P0) * Math.exp(-(v.r / 10) * v.t)); },
          wrongA: function (v) { return v.K / (1 + (v.K - v.P0) * Math.exp(-(v.r / 10) * v.t)); }
        },
        feedback: [
          { when: 'expOnly', say: 'Casi: usaste crecimiento exponencial $P_0 e^{rt}$ sin el límite de capacidad $K$.' },
          { when: 'noMinusOne', say: 'Casi: recuerda que la constante en el denominador es $K/P_0 - 1$, con el $-1$.' },
          { when: 'wrongA', say: 'Casi: escribiste $K - P_0$ en lugar de $K/P_0 - 1$.' }
        ] }),

    N('lo-n-tiempo-inflexion', 'logistica', 2, { K: [300, 900, 300], P0: [10, 30, 10], r: [2, 6, 2] },
      function (v) {
        var rr = v.r / 10;
        return 'Un rumor se difunde en una comunidad de $K = ' + v.K + '$ personas según $P\' = ' + rr + 'P(1 - P/' + v.K + ')$, comenzando con $P(0) = ' + v.P0 + '$ personas enteradas. ¿A las cuántas horas $t$ llega el rumor a la mitad de la comunidad ($P = ' + (v.K / 2) + '$)?';
      },
      function (v) { return Math.log(v.K / v.P0 - 1) / (v.r / 10); },
      'Para $P(t) = K/2$ se requiere $(K/P_0 - 1)e^{-rt} = 1 \\Rightarrow t = \\frac{1}{r}\\ln(K/P_0 - 1)$.',
      { mistakes: { noMinusOne: function (v) { return Math.log(v.K / v.P0) / (v.r / 10); }, multByR: function (v) { return Math.log(v.K / v.P0 - 1) * (v.r / 10); } },
        feedback: [
          { when: 'noMinusOne', say: 'Casi: olvidaste restar $1$ dentro del logaritmo: es $\\ln(K/P_0 - 1)/r$.' },
          { when: 'multByR', say: 'Casi: al despejar $t$ de $rt = \\ln(K/P_0 - 1)$ hay que dividir entre $r$, no multiplicar.' }
        ] }),

    N('lo-n-tiempo-fraccion-K', 'logistica', 2, { K: [200, 600, 200], P0: [20, 40, 10], m: [4, 5, 1], r: [2, 5, 1] },
      function (v) {
        var rr = v.r / 10, target = ((v.m - 1) * v.K) / v.m;
        return 'Una especie protegida sigue $P\' = ' + rr + 'P(1 - P/' + v.K + ')$ con población inicial $P(0) = ' + v.P0 + '$. ¿En qué tiempo $t$ alcanza la población el valor $P = ' + target + '$?';
      },
      function (v) { return Math.log((v.m - 1) * (v.K / v.P0 - 1)) / (v.r / 10); },
      'Igualando $\\frac{K}{1 + Ae^{-rt}} = \\frac{m-1}{m}K$ queda $Ae^{-rt} = \\frac{1}{m-1} \\Rightarrow t = \\frac{1}{r}\\ln((m - 1)A)$ con $A = K/P_0 - 1$.',
      { mistakes: {
          halfTime: function (v) { return Math.log(v.K / v.P0 - 1) / (v.r / 10); },
          divByM1: function (v) { return Math.log((v.K / v.P0 - 1) / (v.m - 1)) / (v.r / 10); }
        },
        feedback: [
          { when: 'halfTime', say: 'Casi: ese es el tiempo para llegar a $K/2$; aquí buscas llegar a una fracción mayor de $K$.' },
          { when: 'divByM1', say: function (v) { return 'Casi: de $Ae^{-rt} = 1/' + (v.m - 1) + '$ sale $e^{rt} = ' + (v.m - 1) + 'A$, multiplicando por $' + (v.m - 1) + '$.'; } }
        ] }),

    N('lo-n-desde-arriba-de-K', 'logistica', 2, { K: [200, 500, 100], d: [100, 300, 100], r: [2, 5, 1], t: [2, 5, 1] },
      function (v) {
        var P0 = v.K + v.d, rr = v.r / 10;
        return 'Un estanque tiene capacidad de carga $K = ' + v.K + '$ peces, pero inicialmente se introducen $P(0) = ' + P0 + '$ peces (por encima de $K$). Si $P\' = ' + rr + 'P(1 - P/' + v.K + ')$, ¿cuántos peces hay en $t = ' + v.t + '$ años?';
      },
      function (v) { return v.K / (1 + (v.K / (v.K + v.d) - 1) * Math.exp(-(v.r / 10) * v.t)); },
      'La misma fórmula logística funciona con $P_0 > K$: aquí $A = K/P_0 - 1 < 0$ y $P(t)$ baja hacia $K$.',
      { mistakes: {
          absA: function (v) { return v.K / (1 + Math.abs(v.K / (v.K + v.d) - 1) * Math.exp(-(v.r / 10) * v.t)); },
          posExp: function (v) { return v.K / (1 + (v.K / (v.K + v.d) - 1) * Math.exp((v.r / 10) * v.t)); }
        },
        feedback: [
          { when: 'absA', say: 'Casi: cuando $P_0 > K$, la constante $A = K/P_0 - 1$ es negativa, lo que hace que el denominador sea menor que $1$ y $P(t) > K$.' },
          { when: 'posExp', say: 'Casi: el exponente en la fórmula sigue siendo $-rt$ con signo negativo.' }
        ] }),

    N('lo-n-hallar-K-de-bernoulli', 'logistica', 3, { a: [2, 6, 1], b: [1, 5, 1] },
      function (v) {
        var bb = v.b / 100;
        return 'Una ecuación logística escrita en forma expandida de Bernoulli es $P\' - ' + v.a + 'P = -' + bb + 'P^2$. ¿Cuál es la capacidad de carga $K = \\lim_{t \\to \\infty} P(t)$ para cualquier $P(0) > 0$?';
      },
      function (v) { return v.a / (v.b / 100); },
      'Factorizando $P\' = aP\\left(1 - \\frac{b}{a}P\\right) = aP\\left(1 - \\frac{P}{a/b}\\right)$, se identifica $K = a/b$.',
      { mistakes: { invRatio: function (v) { return (v.b / 100) / v.a; }, justInvB: function (v) { return 100 / v.b; } },
        feedback: [
          { when: 'invRatio', say: 'Casi: al igualar $aP - bP^2 = 0$ para el equilibrio no nulo sale $P = a/b$, no $b/a$.' },
          { when: 'justInvB', say: function (v) { return 'Casi: como el término lineal tiene coeficiente $r = ' + v.a + '$, el coeficiente cuadrático es $r/K = ' + (v.b / 100) + '$, así que $K = ' + v.a + '/(' + (v.b / 100) + ')$.'; } }
        ] }),

    N('lo-n-hallar-r-dado-tHalf', 'logistica', 3, { K: [400, 1000, 200], P0: [20, 50, 10], t1: [4, 8, 2] },
      function (v) { return 'Una población logística con capacidad de carga $K = ' + v.K + '$ empieza con $P(0) = ' + v.P0 + '$ y tarda exactamente $t = ' + v.t1 + '$ años en llegar a la mitad de su capacidad ($P = ' + (v.K / 2) + '$). ¿Cuánto vale la tasa intrínseca $r$ (en $\\text{año}^{-1}$)?'; },
      function (v) { return Math.log(v.K / v.P0 - 1) / v.t1; },
      'En $t_1$ se cumple $(K/P_0 - 1)e^{-rt_1} = 1 \\Rightarrow r = \\frac{1}{t_1}\\ln(K/P_0 - 1)$.',
      { mistakes: { noMinusOne: function (v) { return Math.log(v.K / v.P0) / v.t1; }, multT1: function (v) { return Math.log(v.K / v.P0 - 1) * v.t1; } },
        feedback: [
          { when: 'noMinusOne', say: 'Casi: dentro del logaritmo va $K/P_0 - 1$, no $K/P_0$.' },
          { when: 'multT1', say: 'Casi: de $rt_1 = \\ln(K/P_0 - 1)$ se despeja $r$ dividiendo entre $t_1$.' }
        ] }),

    N('lo-n-hallar-P0-dado-tHalf', 'logistica', 3, { K: [500, 1500, 500], r: [2, 5, 1], t1: [3, 6, 1] },
      function (v) {
        var rr = v.r / 10;
        return 'En un modelo logístico con $K = ' + v.K + '$ y $r = ' + rr + '\\text{ días}^{-1}$, la población alcanza el punto de inflexión $P = ' + (v.K / 2) + '$ en $t = ' + v.t1 + '$ días. ¿Cuál fue la población inicial $P(0)$?';
      },
      function (v) { return v.K / (1 + Math.exp((v.r / 10) * v.t1)); },
      'De $P(t_1) = K/2$ sale $K/P_0 - 1 = e^{rt_1} \\Rightarrow P_0 = \\frac{K}{1 + e^{rt_1}}$.',
      { mistakes: {
          noPlusOne: function (v) { return v.K * Math.exp(-(v.r / 10) * v.t1); },
          halfExp: function (v) { return (v.K / 2) * Math.exp(-(v.r / 10) * v.t1); }
        },
        feedback: [
          { when: 'noPlusOne', say: 'Casi: como $K/P_0 - 1 = e^{rt_1}$, al despejar queda $K/P_0 = 1 + e^{rt_1}$, con el $+1$ en el denominador.' },
          { when: 'halfExp', say: 'Casi: usaste despeje exponencial simple desde $K/2$ en lugar de la fórmula logística.' }
        ] }),

    /* ======================= 6. Soluciones perdidas, signo y análisis cualitativo (14) ======================= */
    C('eq-solucion-perdida-cero', 'equilibrios', 1,
      'Al dividir la ecuación de Bernoulli $y\' + P(x)\\,y = Q(x)\\,y^n$ (con $n > 0$) entre $y^n$, ¿qué solución constante se pierde en la división y debe revisarse aparte?',
      'La solución trivial $y(x) = 0$', [
        ['La solución constante $y(x) = 1$', 'Casi: en $y = 1$ no se divide entre cero ($1^n = 1 \\neq 0$), así que sí queda incluida en la familia para $v$.'],
        ['No se pierde ninguna solución porque $v = y^{1-n}$ es equivalente en todo $\\mathbb{R}$', 'Casi: cuando $n > 1$, $v = y^{1-n}$ tiene a $y$ en el denominador y no está definida en $y = 0$.'],
        ['Se pierden todas las soluciones negativas', 'Casi: las soluciones negativas no se pierden; solo hay que cuidar el signo al despejar $y$ de $v$.']],
      'Si $n > 0$, sustituir $y(x) = 0$ da $0 + 0 = 0$, pero al dividir entre $y^n$ se asume $y \\neq 0$ y se pierde esa solución.'),

    C('eq-pvi-en-cero', 'equilibrios', 1,
      function (v) { return '¿Cuál es la solución del PVI $y\' + ' + v.a + 'x\\,y = e^x y^{' + v.n + '}$ con condición inicial $y(0) = 0$?'; },
      '$y(x) = 0$ para todo $x$, que es la solución constante que se perdería al dividir entre $y^n$', [
        ['No existe solución porque $v(0) = 0^{1-n}$ divide entre cero', 'Casi: que el cambio $v = y^{1-n}$ no sirva en $y = 0$ no significa que el PVI no tenga solución; $y(x) = 0$ cumple la EDO y la condición inicial.'],
        [function (v) { return '$y(x) = e^{-' + (v.a / 2) + 'x^2}$'; }, 'Casi: esa función vale $1$ en $x = 0$, por lo que no cumple la condición inicial $y(0) = 0$.'],
        ['$y(x) = x$, porque pasa por el origen', 'Casi: si $y = x$, en $x = 0$ su derivada es $y\'(0) = 1 \\neq 0$, así que no satisface la ecuación diferencial.']],
      'Antes de hacer el cambio $v = y^{1-n}$, si $n > 0$ y $y(x_0) = 0$, la solución es directamente la función constante $y(x) = 0$.',
      { vars: { a: [2, 6, 2], n: [2, 4, 1] } }),

    C('eq-dos-equilibrios-logistica', 'equilibrios', 2,
      '¿Cuáles son las dos soluciones constantes (de equilibrio) de la ecuación logística $P\' = r\\,P\\left(1 - \\dfrac{P}{K}\\right)$ (con $r, K > 0$) y cuál es su comportamiento?',
      '$P = 0$ (inestable: una población pequeña crece y se aleja de $0$) y $P = K$ (estable: las soluciones con $P_0 > 0$ tienden a $K$)', [
        ['$P = 0$ (estable) y $P = K$ (inestable)', 'Casi: para $0 < P < K$ se tiene $P\' > 0$, así que las soluciones se alejan de $0$ y se acercan a $K$.'],
        ['Solo $P = K$, porque $P = 0$ no es una función', 'Casi: la función constante $P(t) = 0$ tiene derivada $0$ y anula el lado derecho, así que también es solución de equilibrio.'],
        ['$P = K/2$ y $P = K$', 'Casi: en $P = K/2$ la derivada no es cero sino máxima; los equilibrios están donde $P\' = 0$.']],
      'Los equilibrios anulan $rP(1 - P/K) = 0$: son $P = 0$ (repulsor para $P > 0$) y $P = K$ (atractor para $P > 0$).'),

    C('eq-unicidad-no-cruza-K', 'equilibrios', 2,
      '¿Por qué una solución de la ecuación logística que empieza con $0 < P(0) < K$ se acerca a $K$ pero nunca puede cruzar ni tocar la recta horizontal $P = K$ en ningún tiempo finito?',
      'Porque $P(t) = K$ es una solución exacta de la EDO y, por el teorema de existencia y unicidad, dos trayectorias solución no pueden cruzarse', [
        ['Porque la función $f(P) = rP(1 - P/K)$ es discontinua en $P = K$', 'Casi: $f(P)$ es un polinomio en $P$, suave en todo $\\mathbb{R}$; justamente por ser suave vale el teorema de unicidad.'],
        ['Sí la cruza en un tiempo finito y después regresa hacia $K$', 'Casi: en $P(t) = \\frac{K}{1 + Ae^{-rt}}$ con $A > 0$, el denominador es siempre mayor que $1$, así que $P(t) < K$ para todo $t$.'],
        ['Porque cuando $P$ se acerca a $K$ la pendiente $P\'$ se vuelve infinita', 'Casi: al revés, cuando $P \\to K$ la pendiente $P\'$ tiende a $0$.']],
      'Como $f(P)$ y $f\'(P)$ son continuas en todas partes, ninguna solución con $P(0) \\neq K$ puede tocar a la solución constante $P(t) = K$.'),

    C('eq-cuando-cero-no-es-solucion', 'equilibrios', 2,
      'En una ecuación de Bernoulli con exponente negativo, como $y\' + 2y = \\dfrac{x}{y}$ ($n = -1$), ¿es $y(x) = 0$ una solución de la ecuación?',
      'No, porque con $n < 0$ la incógnita $y$ aparece dividiendo en el lado derecho y la ecuación no está definida en $y = 0$', [
        ['Sí, $y(x) = 0$ siempre es solución de cualquier ecuación de Bernoulli', 'Casi: $y = 0$ solo es solución cuando $n > 0$ (o cuando $Q(x) = 0$); si $n < 0$, sustituir $y = 0$ divide entre cero.'],
        ['Sí, porque al hacer $v = y^2$ se obtiene una ecuación lineal bien definida en $v = 0$', 'Casi: aunque la ecuación para $v = y^2$ admita $v(x_0) = 0$, en la ecuación original el término $x/y$ se indefine en $y = 0$.'],
        ['Solo es solución en el punto $x = 0$', 'Casi: una solución debe estar definida en todo un intervalo abierto, y $x/0$ sigue siendo una indeterminación.']],
      'La regla de revisar $y = 0$ como solución perdida al dividir entre $y^n$ aplica únicamente cuando $n > 0$.'),

    C('eq-unicidad-falla-n-frac', 'equilibrios', 3,
      'Para el PVI de Bernoulli $y\' + y = \\sqrt{y}$ con condición inicial $y(0) = 0$ (donde $n = \\tfrac{1}{2}$), además de $y(x) = 0$ existe la solución $y(x) = \\left(1 - e^{-x/2}\\right)^2$ para $x \\ge 0$. ¿Por qué esto no contradice el teorema de existencia y unicidad?',
      'Porque la derivada parcial $\\dfrac{\\partial f}{\\partial y} = -1 + \\dfrac{1}{2\\sqrt{y}}$ explota en $y = 0$, así que no se cumple la hipótesis de unicidad en $(0, 0)$', [
        ['Porque las ecuaciones de Bernoulli nunca cumplen el teorema de existencia y unicidad', 'Casi: en cualquier punto con $y_0 > 0$, $\\partial f/\\partial y$ es continua y el PVI sí tiene solución única.'],
        ['Porque $\\left(1 - e^{-x/2}\\right)^2$ no vale $0$ en $x = 0$', 'Casi: en $x = 0$ se tiene $(1 - e^0)^2 = (1 - 1)^2 = 0$, así que sí cumple $y(0) = 0$.'],
        ['Porque $f(x, y) = \\sqrt{y} - y$ es discontinua en $y = 0$', 'Casi: $f$ sí es continua en $y = 0$; lo que falla en $y = 0$ es la continuidad de la derivada parcial $\\partial f/\\partial y$.']],
      'Cuando $0 < n < 1$, la potencia $y^n$ tiene derivada $n\\,y^{n-1}$ que se va a infinito en $y = 0$, permitiendo que otra solución despegue de $y = 0$.'),

    N('eq-n-equilibrio-no-trivial-n2', 'equilibrios', 1, { a: [3, 9, 1], b: [2, 5, 1] },
      function (v) { return 'Encuentra el valor de la solución de equilibrio positiva $y^*$ (es decir, la constante $y^* > 0$ donde $y\' = 0$) de la ecuación de Bernoulli $y\' - ' + v.a + 'y = -' + v.b + 'y^2$.'; },
      function (v) { return v.a / v.b; },
      'Una solución constante tiene $y\' = 0$, así que $-ay^* = -b(y^*)^2 \\Rightarrow y^* = a/b$.',
      { where: function (v) { return v.a !== v.b; },
        mistakes: { invRatio: function (v) { return v.b / v.a; }, negVal: function (v) { return -v.a / v.b; } },
        feedback: [
          { when: 'invRatio', say: 'Casi: de $ay = by^2$ con $y \\neq 0$ se despeja $y = a/b$, dividiendo entre el coeficiente de $y^2$.' },
          { when: 'negVal', say: 'Casi: como ambos lados tienen signo negativo ($-ay = -by^2$), el equilibrio no nulo es positivo.' }
        ] }),

    N('eq-n-equilibrio-positivo-n3', 'equilibrios', 1, { a: [2, 5, 1], m: [2, 6, 1] },
      function (v) {
        var rhs = v.a * v.m * v.m;
        return 'La ecuación autónoma de Bernoulli $y\' - ' + rhs + 'y = -' + v.a + 'y^3$ tiene tres equilibrios: $y = 0$, $y = y^*$ y $y = -y^*$. ¿Cuánto vale el equilibrio positivo $y^*$?';
      },
      function (v) { return v.m; },
      'Con $y\' = 0$ y $y > 0$ queda $am^2 y = ay^3 \\Rightarrow y^2 = m^2 \\Rightarrow y^* = m$.',
      { mistakes: { mSquared: function (v) { return v.m * v.m; }, multA: function (v) { return v.a * v.m; } },
        feedback: [
          { when: 'mSquared', say: 'Casi: ese es el valor de $(y^*)^2$; falta sacar la raíz cuadrada.' },
          { when: 'multA', say: function (v) { return 'Casi: el factor $' + v.a + '$ se cancela al dividir ambos lados entre $' + v.a + '$.'; } }
        ] }),

    N('eq-n-pendiente-bernoulli', 'equilibrios', 2, { a: [2, 4, 1], b: [1, 3, 1], x0: [1, 3, 1], y0: [2, 3, 1] },
      function (v) { return 'Sin resolver la ecuación $y\' + ' + v.a + 'x\\,y = ' + v.b + 'y^2$, calcula la pendiente $y\'$ de la curva solución en el instante en que pasa por el punto $(' + v.x0 + ', ' + v.y0 + ')$.'; },
      function (v) { return v.b * v.y0 * v.y0 - v.a * v.x0 * v.y0; },
      'Despejando $y\' = by^2 - axy$ y evaluando en $(x_0, y_0)$ se obtiene directamente la pendiente.',
      { where: function (v) { return v.b * v.y0 !== v.a * v.x0; },
        mistakes: { plusTerm: function (v) { return v.b * v.y0 * v.y0 + v.a * v.x0 * v.y0; }, noSquare: function (v) { return v.b * v.y0 - v.a * v.x0 * v.y0; } },
        feedback: [
          { when: 'plusTerm', say: 'Casi: al despejar $y\'$, el término $ax\\,y$ pasa restando al lado derecho.' },
          { when: 'noSquare', say: 'Casi: olvidaste elevar al cuadrado la coordenada $y_0$ en el término $by^2$.' }
        ] }),

    N('eq-n-inflexion-y-bernoulli', 'equilibrios', 2, { a: [3, 9, 2], b: [1, 3, 1] },
      function (v) { return 'Para la ecuación autónoma de Bernoulli $y\' = ' + v.a + 'y - ' + v.b + 'y^2$, ¿a qué altura $y > 0$ alcanzan las soluciones crecientes su pendiente máxima (punto de inflexión)?'; },
      function (v) { return v.a / (2 * v.b); },
      'La función $f(y) = ay - by^2$ tiene su máximo donde $f\'(y) = a - 2by = 0 \\Rightarrow y = \\frac{a}{2b}$.',
      { mistakes: { eqVal: function (v) { return v.a / v.b; }, mult2: function (v) { return (2 * v.a) / v.b; } },
        feedback: [
          { when: 'eqVal', say: 'Casi: $a/b$ es el equilibrio donde $y\' = 0$; la pendiente máxima ocurre a la mitad, en $a/(2b)$.' },
          { when: 'mult2', say: 'Casi: al despejar $y$ de $a - 2by = 0$, el $2$ queda dividiendo en el denominador: $a/(2b)$.' }
        ] }),

    N('eq-n-inflexion-n3', 'equilibrios', 2, { k: [2, 6, 1], b: [1, 3, 1] },
      function (v) {
        var a = 3 * v.b * v.k * v.k;
        return 'En la ecuación de Bernoulli $y\' = ' + a + 'y - ' + v.b + 'y^3$, ¿para qué valor positivo de $y$ la rapidez de crecimiento $y\'$ es máxima (es decir, $\\dfrac{d}{dy}(' + a + 'y - ' + v.b + 'y^3) = 0$)?';
      },
      function (v) { return v.k; },
      'Derivando el lado derecho respecto a $y$: $3bk^2 - 3by^2 = 0 \\Rightarrow y^2 = k^2 \\Rightarrow y = k$.',
      { mistakes: { kSquared: function (v) { return v.k * v.k; }, eqPoint: function (v) { return Math.sqrt(3) * v.k; } },
        feedback: [
          { when: 'kSquared', say: 'Casi: ese es el valor de $y^2$; falta sacar la raíz cuadrada.' },
          { when: 'eqPoint', say: 'Casi: ese es el punto de equilibrio donde $y\' = 0$, no donde $y\'$ es máxima.' }
        ] }),

    N('eq-n-limite-infinito-n2', 'equilibrios', 2, { a: [2, 5, 1], b: [3, 9, 2], y0: [1, 4, 1] },
      function (v) { return 'Sea $y(x)$ la solución del PVI $y\' - ' + v.a + 'y = -' + v.b + 'y^2$ con condición inicial positiva $y(0) = ' + v.y0 + '$. ¿A qué valor límite tiende $y(x)$ cuando $x \\to \\infty$?'; },
      function (v) { return v.a / v.b; },
      'Con $v = 1/y$ se tiene $v(x) = \\frac{b}{a} + (y_0^{-1} - \\frac{b}{a})e^{-ax} \\to \\frac{b}{a}$ cuando $x \\to \\infty$, por lo que $y(x) \\to \\frac{a}{b}$.',
      { where: function (v) { return v.a / v.b !== v.y0; },
        mistakes: { limitV: function (v) { return v.b / v.a; }, keptY0: function (v) { return v.y0; } },
        feedback: [
          { when: 'limitV', say: 'Casi: ese es el límite de $v(x) = 1/y(x)$; para $y(x)$ debes invertir la fracción: $a/b$.' },
          { when: 'keptY0', say: 'Casi: ese es el valor inicial $y(0)$; cuando $x \\to \\infty$ la solución tiende al equilibrio estable $a/b$.' }
        ] }),

    N('eq-n-concavidad-en-punto', 'equilibrios', 2, { a: [4, 7, 1], y0: [1, 3, 1] },
      function (v) { return 'Si $y(x)$ resuelve la ecuación de Bernoulli $y\' = ' + v.a + 'y - y^2$ y en cierto instante vale $y(x_0) = ' + v.y0 + '$, calcula el valor de la segunda derivada $y\'\'(x_0)$.'; },
      function (v) { return (v.a - 2 * v.y0) * (v.a * v.y0 - v.y0 * v.y0); },
      'Derivando ambos lados respecto a $x$: $y\'\' = (a - 2y)y\' = (a - 2y)(ay - y^2)$.',
      { where: function (v) { return v.a !== 2 * v.y0; },
        mistakes: { forgotYPrime: function (v) { return v.a - 2 * v.y0; }, justYPrime: function (v) { return v.a * v.y0 - v.y0 * v.y0; } },
        feedback: [
          { when: 'forgotYPrime', say: 'Casi: derivaste $ay - y^2$ respecto a $y$, pero por la regla de la cadena debes multiplicar por $y\'(x_0)$.' },
          { when: 'justYPrime', say: 'Casi: ese es el valor de la primera derivada $y\'(x_0)$, no de la segunda derivada $y\'\'(x_0)$.' }
        ] }),

    N('eq-n-intervalo-validez-explosion', 'equilibrios', 3, { a: [2, 3, 1], y0: [2, 4, 1] },
      function (v) { return 'La solución del PVI $y\' + ' + v.a + 'y = ' + v.a + 'y^2$ con $y(0) = ' + v.y0 + ' > 1$ es $y(x) = \\dfrac{1}{1 - \\frac{' + (v.y0 - 1) + '}{' + v.y0 + '}e^{' + v.a + 'x}}$. ¿En qué valor positivo $x^*$ se anula el denominador y explota la solución?'; },
      function (v) { return Math.log(v.y0 / (v.y0 - 1)) / v.a; },
      'El denominador vale $0$ cuando $e^{ax^*} = \\frac{y_0}{y_0 - 1} \\Rightarrow x^* = \\frac{1}{a}\\ln\\left(\\frac{y_0}{y_0 - 1}\\right)$.',
      { mistakes: { noDivA: function (v) { return Math.log(v.y0 / (v.y0 - 1)); }, invRatio: function (v) { return Math.log((v.y0 - 1) / v.y0) / v.a; } },
        feedback: [
          { when: 'noDivA', say: function (v) { return 'Casi: te faltó dividir entre el coeficiente $' + v.a + '$ del exponente $e^{' + v.a + 'x}$.'; } },
          { when: 'invRatio', say: 'Casi: al despejar $e^{ax^*}$ la fracción se invierte a $\\frac{y_0}{y_0 - 1} > 1$, por lo que $x^* > 0$.' }
        ] })
  ];

  K.register(SUBTEMAS, Q);
})();
