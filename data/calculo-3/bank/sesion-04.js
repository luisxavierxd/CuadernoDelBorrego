/* =====================================================================
   Banco · Cálculo 3 · S04 · Lineales de primer orden: factor integrante,
   forma estándar, PVI, tanques de mezclas, circuitos RC y estado
   estacionario más transitorio.
   100 preguntas propias (source: 'propia').
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c3', '04');
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
    'c3.S04.estandar': 'Forma estándar y factor integrante',
    'c3.S04.constantes': 'Coeficientes constantes',
    'c3.S04.variables': 'Coeficientes variables',
    'c3.S04.pvi': 'Problema de valor inicial',
    'c3.S04.tanques': 'Tanques de mezclas',
    'c3.S04.estacionario': 'Circuitos RC y estado estacionario'
  };

  var Q = [
    /* ======================= 1. Forma estándar y factor integrante (17) ======================= */
    C('es-forma-def', 'estandar', 1,
      'Para aplicar el método del factor integrante a una ecuación lineal de primer orden, ¿cómo debe escribirse primero en forma estándar?',
      '$y\' + P(x)\\,y = Q(x)$, con coeficiente $1$ en $y\'$', [
        ['$a(x)\\,y\' + b(x)\\,y = 0$, igualada siempre a cero', 'Casi: el lado derecho $Q(x)$ no tiene por qué ser cero; lo indispensable es que el coeficiente de $y\'$ sea $1$.'],
        ['$y\' = P(x)\\,Q(y)$, separando las variables $x$ y $y$', 'Casi: eso es para ecuaciones separables; una lineal con $Q(x) \\neq 0$ en general no es separable.'],
        ['$P(x)\\,y\' + y = Q(x)$, con coeficiente $1$ en $y$', 'Casi: el coeficiente que debe quedar igual a $1$ es el de la derivada $y\'$, no el de $y$.']],
      'La fórmula del factor integrante $\\mu = e^{\\int P(x)\\,dx}$ parte de que el coeficiente de $y\'$ ya es $1$.'),

    C('es-error-no-dividir', 'estandar', 1,
      function (v) { return 'En la ecuación $x\\,y\' + ' + v.k + 'y = x^4$ (para $x > 0$), un estudiante lee directamente $P(x) = ' + v.k + '$ y calcula $\\mu = e^{' + v.k + 'x}$. ¿Qué paso olvidó?'; },
      function (v) { return 'Dividir toda la ecuación entre $x$ antes de leer $P(x) = ' + v.k + '/x$'; }, [
        ['Cambiar el signo de $P(x)$ antes de integrar', 'Casi: el signo de $P(x)$ se conserva tal cual; el error fue no dividir entre el coeficiente $x$ de $y\'$.'],
        ['Multiplicar $P(x)$ por el lado derecho $x^4$', 'Casi: $P(x)$ es solo el coeficiente de $y$ en la forma estándar, sin incluir $Q(x)$.'],
        ['Agregar $+C$ en el exponente del factor integrante', 'Casi: en el factor integrante no hace falta sumar constante; faltó dividir entre $x$.']],
      'Al dividir entre $x$ queda $y\' + \\frac{k}{x}y = x^3$, por lo que $P(x) = \\frac{k}{x}$ y $\\mu = x^k$.',
      { vars: { k: [2, 6, 1] } }),

    C('es-regla-producto', 'estandar', 1,
      'Al multiplicar la ecuación en forma estándar $y\' + P(x)\\,y = Q(x)$ por el factor integrante $\\mu(x) = e^{\\int P(x)\\,dx}$, ¿en qué se convierte el lado izquierdo $\\mu\\,y\' + \\mu P\\,y$?',
      'En la derivada del producto $(\\mu(x)\\,y)\'$', [
        ['En el producto de las derivadas $\\mu\'(x)\\,y\'$', 'Casi: por la regla del producto leída al revés, $\\mu y\' + \\mu\' y$ es $(\\mu y)\'$, no $\\mu\' y\'$.'],
        ['En $\\mu(x)\\,y\'$ únicamente, porque el término con $y$ se cancela', 'Casi: el término $\\mu P\\,y$ no se cancela; es justamente $\\mu\' y$, la otra mitad de la regla del producto.'],
        ['En la derivada del cociente $(y/\\mu(x))\'$', 'Casi: como $\\mu\' = \\mu P$ tiene signo positivo, se agrupa como la derivada del producto $(\\mu y)\'$.']],
      'Como $\\mu\' = \\mu P$, la suma $\\mu y\' + \\mu P\\,y = \\mu y\' + \\mu\' y$ es exactamente $(\\mu y)\'$ por la regla del producto.'),

    C('es-sin-constante-mu', 'estandar', 2,
      '¿Por qué al calcular el factor integrante $\\mu(x) = e^{\\int P(x)\\,dx}$ no es necesario escribir una constante de integración $+C_1$ en el exponente?',
      'Porque sumar $+C_1$ en el exponente solo multiplica a $\\mu(x)$ por una constante no nula $K = e^{C_1}$ que se cancela en toda la ecuación', [
        ['Porque la integral de $P(x)$ es una integral definida que vale cero en el extremo inferior', 'Casi: cualquier antiderivada sirve porque el factor constante $e^{C_1}$ multiplica ambos lados y se simplifica.'],
        ['Porque si agregas $+C_1$ la función $\\mu(x)$ deja de cumplir $\\mu\' = P(x)\\,\\mu$', 'Casi: cualquier múltiplo $K e^{\\int P\\,dx}$ sigue cumpliendo $\\mu\' = P\\,\\mu$; elegimos $K = 1$ por simplicidad.'],
        ['Porque la constante de integración de toda la EDO desaparece cuando es lineal', 'Casi: la constante $C$ de la solución general sí debe ponerse al integrar $(\\mu y)\' = \\mu Q$.']],
      'Un exponente $\\int P\\,dx + C_1$ produce $e^{C_1}e^{\\int P\\,dx}$, y el factor constante $e^{C_1} \\neq 0$ se divide en ambos lados.'),

    C('es-mu-potencia-neg', 'estandar', 2,
      function (v) { return 'Para la ecuación $x\\,y\' - ' + v.k + 'y = x^2$ en el intervalo $x > 0$, ¿cuál es el factor integrante $\\mu(x)$ simplificado?'; },
      function (v) { return '$\\mu(x) = x^{-' + v.k + '}$'; }, [
        [function (v) { return '$\\mu(x) = x^{' + v.k + '}$'; }, 'Casi: olvidaste el signo menos de $P(x) = -k/x$; como $e^{-k\\ln x} = (e^{\\ln x})^{-k}$, el exponente es negativo.'],
        [function (v) { return '$\\mu(x) = -' + v.k + '\\ln x$'; }, 'Casi: esa es la integral $\\int P(x)\\,dx$; falta elevar $e$ a ese resultado.'],
        [function (v) { return '$\\mu(x) = e^{-' + v.k + 'x}$'; }, 'Casi: primero debes dividir entre $x$ para obtener $P(x) = -k/x$, no $P(x) = -k$.']],
      'En forma estándar $y\' - \\frac{k}{x}y = x$, así que $\\int P\\,dx = -k\\ln x = \\ln(x^{-k})$ y $\\mu(x) = x^{-k}$.',
      { vars: { k: [2, 6, 1] } }),

    C('es-error-c-sin-dividir', 'estandar', 2,
      'Al llegar al paso $\\mu(x)\\,y = \\int \\mu(x)\\,Q(x)\\,dx + C$, ¿qué ocurre con la constante $C$ cuando despejas $y(x)$?',
      'También queda dividida entre $\\mu(x)$, dando el término $+\\dfrac{C}{\\mu(x)}$', [
        ['Se queda sumando sola como $+C$ al final, porque una constante entre $\\mu(x)$ sigue siendo constante', 'Casi: como $\\mu(x)$ depende de $x$, el cociente $C/\\mu(x)$ es una función de $x$, no una constante.'],
        ['Se multiplica por $\\mu(x)$, dando $+C\\,\\mu(x)$', 'Casi: para despejar $y$ de $\\mu(x)\\,y = \\dots$ debes dividir entre $\\mu(x)$, no multiplicar.'],
        ['Se cancela con el factor integrante y desaparece de la solución general', 'Casi: $C$ no se cancela; el término $C/\\mu(x)$ es la solución de la ecuación homogénea asociada.']],
      'Al dividir ambos lados de $\\mu(x)y = F(x) + C$ entre $\\mu(x)$, todos los términos del lado derecho se dividen entre $\\mu(x)$.'),

    C('es-deduccion-edo-mu', 'estandar', 3,
      'Al buscar una función $\\mu(x) > 0$ tal que $\\mu(x)\\,y\' + \\mu(x)\\,P(x)\\,y$ coincida con $(\\mu(x)\\,y)\' = \\mu(x)\\,y\' + \\mu\'(x)\\,y$, ¿qué ecuación diferencial debe cumplir $\\mu(x)$?',
      '$\\mu\'(x) = P(x)\\,\\mu(x)$', [
        ['$\\mu\'(x) = P(x)$', 'Casi: en $\\mu y\' + \\mu P y$ el término con $y$ lleva multiplicado $\\mu(x)$, así que se iguala $\\mu\'(x) = P(x)\\,\\mu(x)$.'],
        ['$\\mu\'(x) = -P(x)\\,\\mu(x)$', 'Casi: ambos lados tienen signo más frente al segundo término, por lo que no aparece signo negativo.'],
        ['$\\mu\'(x) = Q(x)\\,\\mu(x)$', 'Casi: el factor integrante solo depende del coeficiente $P(x)$ del lado izquierdo, no de $Q(x)$.']],
      'Igualando los coeficientes de $y$ en $\\mu y\' + \\mu P y$ y en $\\mu y\' + \\mu\' y$ se obtiene $\\mu\' = P\\,\\mu$, cuya solución es $e^{\\int P\\,dx}$.'),

    E('es-e-mu-lin', 'estandar', 1, { a: [2, 6, 2], b: [1, 5, 1] },
      function (v) { return 'Calcula el factor integrante $\\mu(x) = e^{\\int P(x)\\,dx}$ (con constante de integración nula en el exponente) para la ecuación $y\' + (' + v.a + 'x + ' + v.b + ')y = 0$. Escribe la función de $x$.'; },
      function (v) { return 'e^(' + (v.a / 2) + '*x^2 + ' + v.b + '*x)'; },
      'Como $P(x) = ax + b$, su antiderivada sin constante es $\\frac{a}{2}x^2 + bx$, por lo que $\\mu(x) = e^{(a/2)x^2 + bx}$.',
      { domain: [-1, 1],
        mistakes: {
          noExp: function (v) { return (v.a / 2) + '*x^2 + ' + v.b + '*x'; },
          noDiv2: function (v) { return 'e^(' + v.a + '*x^2 + ' + v.b + '*x)'; }
        },
        feedback: [
          { when: 'noExp', say: 'Casi: esa es solo la integral $\\int P(x)\\,dx$; el factor integrante es la exponencial $e^{\\int P(x)\\,dx}$.' },
          { when: 'noDiv2', say: 'Casi: al integrar $ax$ aparece un divisor $2$: $\\frac{a}{2}x^2$.' }
        ] }),

    E('es-e-mu-pot', 'estandar', 2, { k: [2, 5, 1], a: [1, 4, 1] },
      function (v) { return 'Escribe en su forma simplificada (para $x > 0$) el factor integrante $\\mu(x)$ de la ecuación $(x + ' + v.a + ')\\,y\' + ' + v.k + 'y = (x + ' + v.a + ')^4$ que vale $1$ cuando $x + ' + v.a + ' = 1$.'; },
      function (v) { return '(x + ' + v.a + ')^' + v.k; },
      'Al dividir entre $x + a$ queda $P(x) = \\frac{k}{x + a}$, cuya integral es $k\\ln(x + a) = \\ln((x + a)^k)$, dando $\\mu(x) = (x + a)^k$.',
      { domain: [0.5, 2.5],
        mistakes: {
          negExp: function (v) { return '(x + ' + v.a + ')^(-' + v.k + ')'; },
          noShift: function (v) { return 'x^' + v.k; }
        },
        feedback: [
          { when: 'negExp', say: 'Casi: el coeficiente $P(x) = k/(x + a)$ es positivo, así que el exponente es $+k$, no $-k$.' },
          { when: 'noShift', say: function (v) { return 'Casi: el coeficiente de $y\'$ es $x + ' + v.a + '$, así que la base de la potencia es $x + ' + v.a + '$.'; } }
        ] }),

    E('es-e-rhs-mult', 'estandar', 2, { k: [2, 4, 1], m: [2, 5, 1] },
      function (v) { return 'Al pasar $x\\,y\' + ' + v.k + 'y = ' + v.m + 'x^2$ (con $x > 0$) a forma estándar y multiplicar por su factor integrante $\\mu(x) = x^{' + v.k + '}$, la ecuación se escribe como $(x^{' + v.k + '}y)\' = R(x)$. Escribe la expresión de $R(x)$.'; },
      function (v) { return v.m + '*x^' + (v.k + 1); },
      'Primero divides entre $x$ para obtener $Q(x) = mx$, y luego multiplicas por $\\mu(x) = x^k$: $R(x) = \\mu(x)Q(x) = mx^{k+1}$.',
      { domain: [0.5, 2.5],
        mistakes: {
          noDivX: function (v) { return v.m + '*x^' + (v.k + 2); },
          forgotMu: function (v) { return v.m + '*x'; }
        },
        feedback: [
          { when: 'noDivX', say: 'Casi: olvidaste dividir el lado derecho entre $x$ al pasar a la forma estándar antes de multiplicar por $\\mu(x)$.' },
          { when: 'forgotMu', say: function (v) { return 'Casi: ese es $Q(x)$ en forma estándar; falta multiplicarlo por el factor integrante $x^{' + v.k + '}$.'; } }
        ] }),

    N('es-n-eval-P', 'estandar', 1, { a: [2, 5, 1], b: [3, 9, 2], x0: [2, 4, 1] },
      function (v) { return 'Al escribir la ecuación $' + v.a + 'x\\,y\' + ' + v.b + 'y = x^2$ en la forma estándar $y\' + P(x)\\,y = Q(x)$, ¿cuánto vale $P(' + v.x0 + ')$?'; },
      function (v) { return v.b / (v.a * v.x0); },
      'Dividiendo toda la ecuación entre $ax$ resulta $P(x) = \\frac{b}{ax}$, y luego se evalúa en $x = x_0$.',
      { mistakes: {
          noDivX: function (v) { return v.b / v.a; },
          justB: function (v) { return v.b; },
          negVal: function (v) { return -v.b / (v.a * v.x0); }
        },
        feedback: [
          { when: 'noDivX', say: function (v) { return 'Casi: dividiste entre $' + v.a + '$, pero el coeficiente de $y\'$ es $' + v.a + 'x$; falta dividir entre $x_0 = ' + v.x0 + '$.'; } },
          { when: 'justB', say: 'Casi: debes dividir el coeficiente de $y$ entre el coeficiente de $y\'$ antes de leer $P(x)$.' },
          { when: 'negVal', say: 'Casi: el término $+by$ ya está en el lado izquierdo con signo positivo.' }
        ] }),

    N('es-n-eval-Q', 'estandar', 1, { a: [2, 4, 1], c: [3, 8, 1], x0: [2, 3, 1] },
      function (v) { return 'Si reescribes la ecuación $x^2 y\' - ' + v.a + 'x\\,y = ' + v.c + 'x^3$ en la forma estándar $y\' + P(x)\\,y = Q(x)$, ¿cuánto vale el lado derecho $Q(' + v.x0 + ')$?'; },
      function (v) { return v.c * v.x0; },
      'Al dividir ambos lados entre $x^2$, el lado derecho se simplifica a $Q(x) = \\frac{cx^3}{x^2} = cx$.',
      { mistakes: {
          noDiv: function (v) { return v.c * Math.pow(v.x0, 3); },
          divOneX: function (v) { return v.c * v.x0 * v.x0; }
        },
        feedback: [
          { when: 'noDiv', say: 'Casi: olvidaste dividir también el lado derecho entre el coeficiente $x^2$ de $y\'$.' },
          { when: 'divOneX', say: 'Casi: dividiste entre $x$ en vez de dividir entre $x^2$.' }
        ] }),

    N('es-n-mu-const-eval', 'estandar', 1, { k: [2, 5, 1], x0: [1, 2, 1] },
      function (v) { return 'Sea $\\mu(x) = e^{\\int P(x)\\,dx}$ el factor integrante con $\\mu(0) = 1$ de la ecuación $y\' + ' + v.k + 'y = x$. ¿Cuánto vale $\\mu(' + v.x0 + ')$?'; },
      function (v) { return Math.exp(v.k * v.x0); },
      'Como $P(x) = k$, el factor integrante es $\\mu(x) = e^{kx}$ y basta evaluarlo en $x = x_0$.',
      { mistakes: {
          negExp: function (v) { return Math.exp(-v.k * v.x0); },
          linVal: function (v) { return v.k * v.x0; }
        },
        feedback: [
          { when: 'negExp', say: 'Casi: el exponente del factor integrante lleva el mismo signo que $P(x) = +k$, no signo menos.' },
          { when: 'linVal', say: 'Casi: ese es el valor de la integral $\\int P\\,dx = kx$; falta calcular la exponencial $e^{kx}$.' }
        ] }),

    N('es-n-mu-x-eval', 'estandar', 2, { k: [2, 4, 1], x0: [2, 4, 1] },
      function (v) { return 'Para la ecuación diferencial $x\\,y\' + ' + v.k + 'y = \\sin x$ (con $x > 0$), toma el factor integrante $\\mu(x)$ tal que $\\mu(1) = 1$. ¿Cuánto vale $\\mu(' + v.x0 + ')$?'; },
      function (v) { return Math.pow(v.x0, v.k); },
      'Dividiendo entre $x$ queda $P(x) = k/x$, así que $\\mu(x) = e^{k\\ln x} = x^k$.',
      { mistakes: {
          invPow: function (v) { return Math.pow(v.x0, -v.k); },
          expKx: function (v) { return Math.exp(v.k * v.x0); }
        },
        feedback: [
          { when: 'invPow', say: 'Casi: como $P(x) = +k/x$, el factor integrante es $x^k$, no $x^{-k}$.' },
          { when: 'expKx', say: 'Casi: antes de integrar debes dividir entre $x$, con lo que $P(x) = k/x$ y no $k$.' }
        ] }),

    N('es-n-P-reordenar', 'estandar', 2, { a: [2, 5, 1], b: [3, 8, 1], x0: [1, 3, 1] },
      function (v) { return 'Pasa la ecuación $y\' + ' + v.a + 'x = ' + v.b + 'x\\,y$ a la forma estándar $y\' + P(x)\\,y = Q(x)$ y evalúa $P(' + v.x0 + ')$.'; },
      function (v) { return -v.b * v.x0; },
      'Al pasar $bx\\,y$ al lado izquierdo y $ax$ al derecho queda $y\' - bx\\,y = -ax$, de donde $P(x) = -bx$.',
      { where: function (v) { return v.a !== v.b; },
        mistakes: {
          posSign: function (v) { return v.b * v.x0; },
          tookQ: function (v) { return -v.a * v.x0; }
        },
        feedback: [
          { when: 'posSign', say: 'Casi: al pasar el término con $y$ del lado derecho al izquierdo, cambia a signo negativo.' },
          { when: 'tookQ', say: 'Casi: ese es el término independiente $Q(x) = -ax$; $P(x)$ es el coeficiente que multiplica a $y$.' }
        ] }),

    N('es-n-mu-2x-eval', 'estandar', 3, { a: [1, 3, 1], x0: [1, 2, 1] },
      function (v) { return 'Considera la ecuación $y\' + ' + (2 * v.a) + 'x\\,y = x$. Si eliges el factor integrante $\\mu(x)$ con $\\mu(0) = 1$, ¿cuánto vale $\\mu(' + v.x0 + ')$?'; },
      function (v) { return Math.exp(v.a * v.x0 * v.x0); },
      'Como $P(x) = 2ax$, su integral desde $0$ es $ax^2$, por lo que $\\mu(x) = e^{ax^2}$.',
      { mistakes: {
          forgotDiv2: function (v) { return Math.exp(2 * v.a * v.x0 * v.x0); },
          negExp: function (v) { return Math.exp(-v.a * v.x0 * v.x0); }
        },
        feedback: [
          { when: 'forgotDiv2', say: function (v) { return 'Casi: al integrar $' + (2 * v.a) + 'x$ se divide entre $2$, quedando $' + v.a + 'x^2$ en el exponente.'; } },
          { when: 'negExp', say: 'Casi: el coeficiente de $y$ es positivo, así que el exponente de $\\mu(x)$ lleva signo más.' }
        ] }),

    N('es-n-hallar-k-mu', 'estandar', 3, { k: [2, 6, 1], x0: [2, 5, 1] },
      function (v) { return 'Si se sabe que $\\mu(x) = x^{' + v.k + '}$ es un factor integrante de la ecuación $' + v.x0 + 'x\\,y\' + b\\,y = x^5$ para $x > 0$, ¿cuánto debe valer la constante $b$?'; },
      function (v) { return v.k * v.x0; },
      'Al dividir entre $x_0 x$ queda $P(x) = \\frac{b}{x_0 x}$. Para que $\\mu(x) = x^k$, se requiere $\\frac{b}{x_0} = k \\Rightarrow b = k\\,x_0$.',
      { mistakes: {
          forgotCoef: function (v) { return v.k; },
          divInstead: function (v) { return v.k / v.x0; }
        },
        feedback: [
          { when: 'forgotCoef', say: function (v) { return 'Casi: el coeficiente de $y\'$ es $' + v.x0 + 'x$, no solo $x$, así que $b/' + v.x0 + ' = ' + v.k + '$.'; } },
          { when: 'divInstead', say: function (v) { return 'Casi: de $b/' + v.x0 + ' = ' + v.k + '$ se despeja multiplicando $' + v.k + ' \\cdot ' + v.x0 + '$, no dividiendo.'; } }
        ] }),

    /* ======================= 2. Coeficientes constantes (16) ======================= */
    C('co-forma-general-const', 'constantes', 1,
      function (v) { return '¿Cuál es la solución general de la ecuación lineal con coeficientes constantes $y\' + ' + v.a + 'y = ' + (v.a * v.b) + '$?'; },
      function (v) { return '$y = ' + v.b + ' + Ce^{-' + v.a + 'x}$'; }, [
        [function (v) { return '$y = ' + v.b + ' + Ce^{' + v.a + 'x}$'; }, 'Casi: al dividir entre el factor integrante $\\mu = e^{ax}$, el término con $C$ queda multiplicado por $e^{-ax}$.'],
        [function (v) { return '$y = ' + (v.a * v.b) + ' + Ce^{-' + v.a + 'x}$'; }, function (v) { return 'Casi: al integrar $' + (v.a * v.b) + 'e^{' + v.a + 'x}$ se divide entre $' + v.a + '$, quedando el término constante $' + v.b + '$.'; }],
        [function (v) { return '$y = (' + v.b + ' + C)e^{-' + v.a + 'x}$'; }, 'Casi: el primer término tenía un factor $e^{ax}$ que se canceló al dividir entre $\\mu = e^{ax}$.']],
      'Multiplicando por $e^{ax}$: $(e^{ax}y)\' = abe^{ax} \\Rightarrow e^{ax}y = be^{ax} + C \\Rightarrow y = b + Ce^{-ax}$.',
      { vars: { a: [2, 5, 1], b: [3, 7, 2] } }),

    C('co-ambos-metodos', 'constantes', 1,
      'La ecuación $y\' + 3y = 12$ tiene coeficientes constantes. ¿Con qué métodos del bloque de primer orden se puede resolver?',
      'Tanto por factor integrante como por separación de variables, y ambos dan $y = 4 + Ce^{-3x}$', [
        ['Únicamente por factor integrante, porque no está igualada a cero', 'Casi: si la escribes como $y\' = 12 - 3y = -3(y - 4)$, también se pueden separar las variables $dy/(y - 4) = -3\\,dx$.'],
        ['Únicamente por separación de variables, porque $P(x)$ no tiene $x$', 'Casi: una constante $P(x) = 3$ sigue siendo una función válida para el factor integrante $\\mu = e^{3x}$.'],
        ['Con ninguno de los dos, porque requiere variación de parámetros de segundo orden', 'Casi: es una EDO de primer orden; sale directamente con $\\mu = e^{3x}$ o separando variables.']],
      'Cuando $P$ y $Q$ son constantes, la ecuación es a la vez lineal y autónoma (separable).'),

    C('co-forzamiento-exp', 'constantes', 2,
      function (v) { return 'Al multiplicar la ecuación $y\' + ' + v.a + 'y = e^{x}$ por su factor integrante $\\mu(x) = e^{' + v.a + 'x}$, ¿qué queda en el lado derecho antes de integrar?'; },
      function (v) { return '$e^{' + (v.a + 1) + 'x}$'; }, [
        [function (v) { return '$e^{' + v.a + 'x^2}$'; }, 'Casi: al multiplicar exponenciales de la misma base se suman los exponentes ($ax + x$), no se multiplican.'],
        [function (v) { return '$e^{' + (v.a - 1) + 'x}$'; }, 'Casi: el lado derecho es $e^{+x}$, así que al multiplicar por $e^{ax}$ los exponentes se suman: $(a + 1)x$.'],
        ['$e^{x}$, porque el factor integrante solo multiplica al lado izquierdo', 'Casi: para no alterar la ecuación debes multiplicar ambos lados por el factor integrante $\\mu(x)$.']],
      'Por leyes de los exponentes, $\\mu(x)\\,Q(x) = e^{ax}\\cdot e^{x} = e^{(a + 1)x}$.',
      { vars: { a: [2, 5, 1] } }),

    C('co-resonancia-exp', 'constantes', 2,
      function (v) { return '¿Qué ocurre al multiplicar la ecuación $y\' + ' + v.a + 'y = e^{-' + v.a + 'x}$ por el factor integrante $\\mu(x) = e^{' + v.a + 'x}$?'; },
      function (v) { return 'El lado derecho se simplifica a $e^{0} = 1$, por lo que al integrar aparece un término con $x$: $y = (x + C)e^{-' + v.a + 'x}$'; }, [
        [function (v) { return 'El lado derecho se hace $0$ y la solución es $y = Ce^{-' + v.a + 'x}$'; }, 'Casi: $e^{ax}\\cdot e^{-ax} = e^0 = 1$, no $0$; al integrar $1$ respecto a $x$ sale $x + C$.'],
        ['No se puede usar factor integrante porque se divide entre cero al integrar', 'Casi: no hay ninguna división entre cero; simplemente integras la constante $1$ y obtienes $x + C$.'],
        [function (v) { return 'El lado derecho queda $e^{-' + (2 * v.a) + 'x}$'; }, 'Casi: al multiplicar $e^{ax}$ por $e^{-ax}$ los exponentes se suman: $ax - ax = 0$.']],
      'Como $e^{ax}e^{-ax} = 1$, queda $(e^{ax}y)\' = 1 \\Rightarrow e^{ax}y = x + C \\Rightarrow y = (x + C)e^{-ax}$.',
      { vars: { a: [2, 6, 1] } }),

    C('co-por-partes-pol', 'constantes', 2,
      'Al resolver $y\' + 2y = x$ con $\\mu = e^{2x}$ llegas a $(e^{2x}y)\' = x\\,e^{2x}$. ¿Qué técnica de integración necesitas para el lado derecho $\\int x\\,e^{2x}\\,dx$?',
      'Integración por partes, tomando $u = x$ y $dv = e^{2x}\\,dx$', [
        ['Sacar la $x$ fuera de la integral como si fuera constante: $x\\int e^{2x}\\,dx$', 'Casi: la integral es respecto a $x$, así que $x$ es la variable de integración y no puede salir del signo integral.'],
        ['Sustitución simple $u = 2x^2$', 'Casi: el exponente es lineal ($2x$), no cuadrático; con $x$ multiplicando afuera se integra por partes.'],
        ['Fracciones parciales sobre $x\\,e^{2x}$', 'Casi: las fracciones parciales son para cocientes de polinomios, no para productos con exponenciales.']],
      'El producto de un polinomio por una exponencial se integra por partes derivando el polinomio.'),

    C('co-comportamiento-signo-a', 'constantes', 3,
      'Compara las soluciones de $y\' + 3y = 6$ y de $y\' - 3y = -6$. Ambas tienen la solución constante $y = 2$, pero ¿qué pasa con las demás soluciones cuando $x \\to \\infty$?',
      'En $y\' + 3y = 6$ todas se acercan a $y = 2$ (porque $Ce^{-3x} \\to 0$), mientras que en $y\' - 3y = -6$ se alejan (porque $Ce^{3x}$ crece)', [
        ['En ambas ecuaciones todas las soluciones convergen a $y = 2$ cuando $x \\to \\infty$', 'Casi: en $y\' - 3y = -6$ el factor integrante es $e^{-3x}$ y al despejar queda $y = 2 + Ce^{3x}$, que diverge si $C \\neq 0$.'],
        ['En ambas ecuaciones las soluciones oscilan alrededor de $y = 2$', 'Casi: las exponenciales reales $e^{-3x}$ y $e^{3x}$ son monótonas, no oscilan.'],
        ['Depende únicamente del signo del lado derecho, no del signo que acompaña a $y$', 'Casi: el signo del exponente en $Ce^{-ax}$ lo determina el coeficiente $a$ de $y$, no el lado derecho.']],
      'El término homogéneo es $Ce^{-ax}$: decae hacia cero si $a > 0$ y explota si $a < 0$.'),

    E('co-e-exp-rhs', 'constantes', 2, { a: [2, 4, 1], r: [1, 3, 1] },
      function (v) { var k = v.a + v.r; return 'Encuentra la solución particular de $y\' + ' + v.a + 'y = ' + k + 'e^{' + v.r + 'x}$ cuya constante de integración es $C = 0$. Escribe la función de $x$.'; },
      function (v) { return 'e^(' + v.r + '*x)'; },
      'Multiplicando por $e^{ax}$: $(e^{ax}y)\' = (a + r)e^{(a+r)x}$. Al integrar con $C = 0$ queda $e^{ax}y = e^{(a+r)x} \\Rightarrow y = e^{rx}$.',
      { domain: [0, 1.2],
        mistakes: {
          noDiv: function (v) { return (v.a + v.r) + '*e^(' + v.r + '*x)'; },
          keptMu: function (v) { return 'e^(' + (v.a + v.r) + '*x)'; }
        },
        feedback: [
          { when: 'noDiv', say: function (v) { return 'Casi: al integrar $e^{' + (v.a + v.r) + 'x}$ se divide entre $' + (v.a + v.r) + '$, cancelando el coeficiente.'; } },
          { when: 'keptMu', say: function (v) { return 'Casi: esa es $e^{' + v.a + 'x}y$; falta dividir entre el factor integrante $e^{' + v.a + 'x}$.'; } }
        ] }),

    E('co-e-resonancia-pvi', 'constantes', 2, { a: [2, 5, 1], k: [2, 6, 1], y0: [1, 5, 1] },
      function (v) { return 'Resuelve el PVI $y\' + ' + v.a + 'y = ' + v.k + 'e^{-' + v.a + 'x}$ con condición inicial $y(0) = ' + v.y0 + '$. Escribe la función $y(x)$.'; },
      function (v) { return '(' + v.k + '*x + ' + v.y0 + ')*e^(-' + v.a + '*x)'; },
      'Con $\\mu = e^{ax}$ queda $(e^{ax}y)\' = k \\Rightarrow e^{ax}y = kx + C$. Como $y(0) = C = y_0$, resulta $y = (kx + y_0)e^{-ax}$.',
      { domain: [0, 1.5],
        mistakes: {
          noX: function (v) { return (v.k + v.y0) + '*e^(-' + v.a + '*x)'; },
          cNotMult: function (v) { return v.k + '*x*e^(-' + v.a + '*x) + ' + v.y0; }
        },
        feedback: [
          { when: 'noX', say: function (v) { return 'Casi: al integrar la constante $' + v.k + '$ respecto a $x$ sale $' + v.k + 'x$, con factor $x$.'; } },
          { when: 'cNotMult', say: function (v) { return 'Casi: la constante $C = ' + v.y0 + '$ también va dividida entre el factor integrante $e^{' + v.a + 'x}$.'; } }
        ] }),

    E('co-e-recta-part', 'constantes', 3, { a: [2, 4, 1], m: [1, 3, 1] },
      function (v) { var rhsM = v.a * v.a * v.m; return 'Resuelve $y\' + ' + v.a + 'y = ' + rhsM + 'x$ con la condición inicial $y(0) = -' + v.m + '$ (nota que el término exponencial se anula para este valor inicial). Escribe $y(x)$.'; },
      function (v) { return (v.a * v.m) + '*x - ' + v.m; },
      'Integrando por partes $(e^{ax}y)\' = a^2 m x e^{ax}$ sale $y = amx - m + Ce^{-ax}$; con $y(0) = -m$ queda $C = 0$.',
      { domain: [-1, 2],
        mistakes: {
          plusM: function (v) { return (v.a * v.m) + '*x + ' + v.m; },
          noConstTerm: function (v) { return (v.a * v.m) + '*x'; }
        },
        feedback: [
          { when: 'plusM', say: 'Casi: al integrar por partes $\\int x e^{ax}\\,dx = \\frac{x}{a}e^{ax} - \\frac{1}{a^2}e^{ax}$, el segundo término lleva signo menos.' },
          { when: 'noConstTerm', say: 'Casi: te faltó el término constante que sale de la integración por partes.' }
        ] }),

    N('co-n-homog-eval', 'constantes', 1, { a: [2, 4, 1], y0: [3, 8, 1] },
      function (v) { return 'Resuelve la ecuación lineal homogénea $y\' + ' + v.a + 'y = 0$ con $y(0) = ' + v.y0 + '$ y calcula el valor de $y(0.5)$.'; },
      function (v) { return v.y0 * Math.exp(-0.5 * v.a); },
      'Con $\\mu = e^{ax}$ se obtiene $(e^{ax}y)\' = 0 \\Rightarrow y = y_0 e^{-ax}$, y en $x = 0.5$ vale $y_0 e^{-0.5a}$.',
      { mistakes: {
          posExp: function (v) { return v.y0 * Math.exp(0.5 * v.a); },
          noHalf: function (v) { return v.y0 * Math.exp(-v.a); }
        },
        feedback: [
          { when: 'posExp', say: 'Casi: al despejar $y$ dividiendo entre $\\mu = e^{ax}$, el exponente queda negativo: $e^{-ax}$.' },
          { when: 'noHalf', say: 'Casi: te piden evaluar en $x = 0.5$, no en $x = 1$.' }
        ] }),

    N('co-n-const-rhs-est', 'constantes', 1, { a: [2, 6, 1], b: [5, 19, 2] },
      function (v) { return 'En la solución general $y(x) = y_p + Ce^{-' + v.a + 'x}$ de la ecuación $y\' + ' + v.a + 'y = ' + v.b + '$, ¿cuánto vale el término constante $y_p$?'; },
      function (v) { return v.b / v.a; },
      'Al integrar $(e^{ax}y)\' = be^{ax}$ queda $e^{ax}y = \\frac{b}{a}e^{ax} + C$, así que el término constante es $y_p = b/a$.',
      { mistakes: {
          multAB: function (v) { return v.b * v.a; },
          justB: function (v) { return v.b; },
          negBA: function (v) { return -v.b / v.a; }
        },
        feedback: [
          { when: 'multAB', say: function (v) { return 'Casi: al integrar $e^{' + v.a + 'x}$ se divide entre $' + v.a + '$, no se multiplica.'; } },
          { when: 'justB', say: function (v) { return 'Casi: olvidaste dividir $' + v.b + '$ entre el coeficiente $' + v.a + '$ al integrar $e^{' + v.a + 'x}$.'; } },
          { when: 'negBA', say: 'Casi: tanto $a$ como $b$ son positivos, así que el término constante $b/a$ es positivo.' }
        ] }),

    N('co-n-const-pvi-eval', 'constantes', 1, { a: [1, 2, 1], s: [2, 5, 1], d: [2, 6, 1] },
      function (v) { var b = v.a * v.s, y0 = v.s + v.d; return 'Sea el PVI $y\' + ' + v.a + 'y = ' + b + '$ con $y(0) = ' + y0 + '$. ¿Cuánto vale la solución $y(1)$?'; },
      function (v) { return v.s + v.d * Math.exp(-v.a); },
      'La solución general es $y = s + Ce^{-ax}$; con $y(0) = s + C = s + d$ sale $C = d$, así que $y(1) = s + de^{-a}$.',
      { mistakes: {
          keptY0: function (v) { return v.s + (v.s + v.d) * Math.exp(-v.a); },
          onlyTrans: function (v) { return (v.s + v.d) * Math.exp(-v.a); }
        },
        feedback: [
          { when: 'keptY0', say: function (v) { return 'Casi: tomaste $C = y(0)$, pero en $x = 0$ tienes $' + v.s + ' + C = ' + (v.s + v.d) + '$, así que $C = ' + v.d + '$.'; } },
          { when: 'onlyTrans', say: function (v) { return 'Casi: olvidaste el término constante $b/a = ' + v.s + '$ de la solución.'; } }
        ] }),

    N('co-n-exp-rhs-eval', 'constantes', 2, { a: [1, 2, 1], r: [1, 2, 1], c: [2, 5, 1] },
      function (v) { var k = (v.a + v.r) * v.c; return 'Resuelve $y\' + ' + v.a + 'y = ' + k + 'e^{' + v.r + 'x}$ con condición inicial $y(0) = 0$ y evalúa la solución en $x = 0.5$.'; },
      function (v) { return v.c * (Math.exp(0.5 * v.r) - Math.exp(-0.5 * v.a)); },
      'Con $\\mu = e^{ax}$: $y = ce^{rx} + Ce^{-ax}$. De $y(0) = c + C = 0$ sale $C = -c$, así que $y(0.5) = c(e^{0.5r} - e^{-0.5a})$.',
      { mistakes: {
          noHomog: function (v) { return v.c * Math.exp(0.5 * v.r); },
          plusHomog: function (v) { return v.c * (Math.exp(0.5 * v.r) + Math.exp(-0.5 * v.a)); }
        },
        feedback: [
          { when: 'noHomog', say: function (v) { return 'Casi: como en $x = 0$ el término particular vale $' + v.c + ' \\neq 0$, necesitas restar $' + v.c + 'e^{-' + v.a + 'x}$ para cumplir $y(0) = 0$.'; } },
          { when: 'plusHomog', say: 'Casi: de $c + C = 0$ se despeja $C = -c$, con signo menos.' }
        ] }),

    N('co-n-resonancia-eval', 'constantes', 2, { a: [1, 2, 1], k: [2, 5, 1], y0: [2, 5, 1] },
      function (v) { return 'Calcula el valor en $x = 1$ de la solución del PVI $y\' + ' + v.a + 'y = ' + v.k + 'e^{-' + v.a + 'x}$ con $y(0) = ' + v.y0 + '$.'; },
      function (v) { return (v.k + v.y0) * Math.exp(-v.a); },
      'Como $(e^{ax}y)\' = k$, se tiene $y(x) = (kx + y_0)e^{-ax}$, que en $x = 1$ vale $(k + y_0)e^{-a}$.',
      { mistakes: {
          cNotDiv: function (v) { return v.k * Math.exp(-v.a) + v.y0; },
          onlyY0: function (v) { return v.y0 * Math.exp(-v.a); }
        },
        feedback: [
          { when: 'cNotDiv', say: function (v) { return 'Casi: la constante $C = ' + v.y0 + '$ también queda multiplicada por $e^{-' + v.a + 'x}$ al despejar $y$.'; } },
          { when: 'onlyY0', say: 'Casi: olvidaste el término $kx e^{-ax}$ que proviene del lado derecho.' }
        ] }),

    N('co-n-recta-rhs-eval', 'constantes', 2, { a: [1, 2, 1], m: [2, 5, 1], y0: [2, 5, 1] },
      function (v) { var rhs = v.a * v.a * v.m; return 'Encuentra el valor en $x = 1$ de la solución de $y\' + ' + v.a + 'y = ' + rhs + 'x$ que cumple $y(0) = ' + v.y0 + '$.'; },
      function (v) { return v.a * v.m - v.m + (v.y0 + v.m) * Math.exp(-v.a); },
      'Integrando por partes $(e^{ax}y)\' = a^2 m x e^{ax}$ resulta $y = amx - m + Ce^{-ax}$; con $y(0) = -m + C = y_0$ sale $C = y_0 + m$.',
      { mistakes: {
          cIsY0: function (v) { return v.a * v.m - v.m + v.y0 * Math.exp(-v.a); },
          forgotMinusM: function (v) { return v.a * v.m + v.y0 * Math.exp(-v.a); }
        },
        feedback: [
          { when: 'cIsY0', say: function (v) { return 'Casi: en $x = 0$ la parte particular vale $-' + v.m + '$, así que $-' + v.m + ' + C = ' + v.y0 + ' \\Rightarrow C = ' + (v.y0 + v.m) + '$.'; } },
          { when: 'forgotMinusM', say: 'Casi: al integrar por partes $\\int x e^{ax}\\,dx$ aparece un segundo término constante $-m$.' }
        ] }),

    N('co-n-trig-rhs-eval', 'constantes', 3, { a: [2, 4, 1], w: [3, 5, 1], k: [2, 5, 1] },
      function (v) { var amp = (v.a * v.a + v.w * v.w) * v.k; return 'La ecuación $y\' + ' + v.a + 'y = ' + amp + '\\cos(' + v.w + 'x)$ tiene una solución particular de la forma $y_p(x) = A\\cos(' + v.w + 'x) + B\\sin(' + v.w + 'x)$. ¿Cuánto vale el coeficiente $A$?'; },
      function (v) { return v.a * v.k; },
      'Al integrar $(e^{ax}y)\' = (a^2+w^2)k e^{ax}\\cos(wx)$ (o igualando coeficientes en $y\' + ay$), resulta $A = ak$ y $B = wk$.',
      { where: function (v) { return v.a !== v.w; },
        mistakes: {
          tookB: function (v) { return v.w * v.k; },
          noFactorA: function (v) { return v.k; }
        },
        feedback: [
          { when: 'tookB', say: function (v) { return 'Casi: ese es el coeficiente $B = ' + (v.w * v.k) + '$ que multiplica a $\\sin(' + v.w + 'x)$; el de $\\cos(' + v.w + 'x)$ es $A = ' + (v.a * v.k) + '$.'; } },
          { when: 'noFactorA', say: function (v) { return 'Casi: al integrar $e^{' + v.a + 'x}\\cos(' + v.w + 'x)$ el término con coseno queda multiplicado por $' + v.a + '$.'; } }
        ] }),

    /* ======================= 3. Coeficientes variables (17) ======================= */
    C('va-mu-uno-entre-x', 'variables', 1,
      'Para la ecuación $y\' + \\dfrac{1}{x}y = x^2$ en el intervalo $x > 0$, ¿cuál es el factor integrante $\\mu(x)$ y cómo queda el lado izquierdo al multiplicar por él?',
      '$\\mu(x) = x$, y el lado izquierdo queda $(x\\,y)\'$', [
        ['$\\mu(x) = \\ln x$, y el lado izquierdo queda $((\\ln x)\\,y)\'$', 'Casi: $\\ln x$ es la integral $\\int \\frac{1}{x}\\,dx$, pero el factor integrante es $\\mu = e^{\\ln x} = x$.'],
        ['$\\mu(x) = \\dfrac{1}{x}$, y el lado izquierdo queda $(y/x)\'$', 'Casi: como $P(x) = +1/x$, el factor integrante es $e^{+\\ln x} = x$, no $1/x$.'],
        ['$\\mu(x) = e^{x}$, y el lado izquierdo queda $(e^{x}y)\'$', 'Casi: $e^x$ sería el factor integrante si $P(x) = 1$, pero aquí $P(x) = 1/x$.']],
      'Como $\\int \\frac{1}{x}\\,dx = \\ln x$ para $x > 0$, el factor integrante es $\\mu = e^{\\ln x} = x$ y agrupa $x y\' + y = (xy)\'$.'),

    C('va-valor-absoluto-ln', 'variables', 1,
      'Al integrar $P(x) = \\dfrac{1}{x}$ para $x \\neq 0$ aparece $\\ln|x|$ y por tanto $e^{\\ln|x|} = |x|$. ¿Por qué en un problema concreto podemos usar simplemente $\\mu(x) = x$?',
      'Porque la solución se busca en un intervalo donde $x > 0$ o donde $x < 0$, y en $x < 0$ el signo menos de $|x| = -x$ es un factor constante que se cancela en toda la ecuación', [
        ['Porque el valor absoluto siempre es igual a $x$ para cualquier número real', 'Casi: para $x < 0$ se tiene $|x| = -x$; la razón real es que multiplicar ambos lados por $-1$ no altera el factor integrante.'],
        ['Porque las ecuaciones diferenciales nunca tienen solución cuando $x < 0$', 'Casi: sí tienen solución en intervalos con $x < 0$; ahí $\\mu = x$ funciona igual porque difiere de $|x|$ solo en un signo.'],
        ['Porque $e^{\\ln|x|}$ es siempre igual a $x$ aunque $x$ sea negativo', 'Casi: una exponencial real siempre es positiva ($e^{\\ln|x|} = |x|$), pero su múltiplo $-|x| = x$ también sirve como factor integrante.']],
      'En $x > 0$, $|x| = x$; en $x < 0$, $|x| = -x$, y como cualquier múltiplo constante no nulo de $\\mu$ sirve, $\\mu = x$ funciona en ambos casos.'),

    C('va-familia-potencia-c', 'variables', 2,
      function (v) { return 'Después de multiplicar $y\' + \\dfrac{' + v.k + '}{x}y = ' + (v.k + 1) + '$ por $\\mu(x) = x^{' + v.k + '}$ e integrar, se llega a $x^{' + v.k + '}y = x^{' + (v.k + 1) + '} + C$. ¿Cuál es la solución general $y(x)$?'; },
      function (v) { return '$y = x + C\\,x^{-' + v.k + '}$'; }, [
        ['$y = x + C$', function (v) { return 'Casi: olvidaste dividir la constante $C$ entre el factor integrante $x^{' + v.k + '}$.'; }],
        [function (v) { return '$y = x^{' + (v.k + 1) + '} + C\\,x^{-' + v.k + '}$'; }, function (v) { return 'Casi: te faltó dividir el primer término $x^{' + (v.k + 1) + '}$ entre $x^{' + v.k + '}$.'; }],
        [function (v) { return '$y = x + C\\,x^{' + v.k + '}$'; }, function (v) { return 'Casi: al despejar $y$ divides entre $x^{' + v.k + '}$, lo que deja $C\\,x^{-' + v.k + '}$ y no $C\\,x^{' + v.k + '}$.'; }]],
      'Al dividir ambos términos de $x^k y = x^{k+1} + C$ entre $x^k$ resulta $y = x + Cx^{-k}$.',
      { vars: { k: [2, 5, 1] } }),

    C('va-mu-tan', 'variables', 2,
      'Para la ecuación $y\' + (\\tan x)\\,y = \\cos^2 x$ en el intervalo $(-\\pi/2, \\pi/2)$, ¿cuál es el factor integrante $\\mu(x)$?',
      '$\\mu(x) = \\sec x$', [
        ['$\\mu(x) = \\cos x$', 'Casi: la integral de $\\tan x = \\frac{\\sin x}{\\cos x}$ es $-\\ln(\\cos x) = \\ln(\\sec x)$, por lo que $\\mu = \\sec x = 1/\\cos x$.'],
        ['$\\mu(x) = \\sec^2 x$', 'Casi: $\\sec^2 x$ es la derivada de $\\tan x$, no $e^{\\int \\tan x\\,dx}$.'],
        ['$\\mu(x) = e^{\\sec^2 x}$', 'Casi: en el exponente de $\\mu$ va la integral de $\\tan x$, no su derivada.']],
      'Como $\\int \\tan x\\,dx = -\\ln(\\cos x) = \\ln(\\sec x)$ en $(-\\pi/2, \\pi/2)$, se tiene $\\mu(x) = e^{\\ln(\\sec x)} = \\sec x$.'),

    C('va-singularidad-intervalo', 'variables', 2,
      function (v) { return 'Al resolver $(x - ' + v.a + ')\\,y\' + y = x^2$ con condición inicial en $x_0 = ' + (v.a + 2) + '$, ¿cuál es el intervalo máximo de validez donde la solución está garantizada?'; },
      function (v) { return '$(' + v.a + ', \\infty)$, porque en $x = ' + v.a + '$ se anula el coeficiente de $y\'$ y $P(x) = 1/(x - ' + v.a + ')$ deja de ser continua'; }, [
        ['$(-\\infty, \\infty)$, porque el lado derecho $x^2$ es continuo en toda la recta real', 'Casi: al pasar a la forma estándar divides entre $x - a$, creando una discontinuidad en $x = a$.'],
        [function (v) { return '$(-\\infty, ' + v.a + ')$, porque está a la izquierda de la asíntota'; }, function (v) { return 'Casi: debes elegir el intervalo abierto que contiene al punto inicial $x_0 = ' + (v.a + 2) + ' > ' + v.a + '$.'; }],
        [function (v) { return '$(' + (v.a + 2) + ', \\infty)$, empezando en la condición inicial'; }, 'Casi: el intervalo de validez se extiende también hacia la izquierda de $x_0$ hasta topar con la singularidad en $x = a$.']],
      'En forma estándar, $P(x)$ y $Q(x)$ son continuas en $(a, \\infty)$, que es el mayor intervalo abierto sin singularidades que contiene a $x_0$.',
      { vars: { a: [2, 6, 1] } }),

    C('va-sustitucion-en-int', 'variables', 3,
      'Al resolver $y\' + 2x\\,y = x^3$ multiplicas por $\\mu(x) = e^{x^2}$ y obtienes $(e^{x^2}y)\' = x^3 e^{x^2}$. ¿Cómo se calcula la integral $\\int x^3 e^{x^2}\\,dx$?',
      'Separando $x^3 = x^2 \\cdot x$, haciendo el cambio $u = x^2$ ($du = 2x\\,dx$) para llegar a $\\frac{1}{2}\\int u\\,e^u\\,du$ e integrando por partes', [
        ['No tiene antiderivada elemental, igual que $\\int e^{x^2}\\,dx$', 'Casi: $\\int e^{x^2}\\,dx$ no es elemental, pero aquí el factor $x^3 = x^2\\cdot x$ aporta el diferencial $x\\,dx$ necesario para sustituir $u = x^2$.'],
        ['Directamente como $\\dfrac{x^4}{4}e^{x^2} + C$, integrando cada factor por separado', 'Casi: la integral de un producto no es el producto de las integrales.'],
        ['Dividiendo entre la derivada del exponente: $\\dfrac{x^3}{2x}e^{x^2} = \\dfrac{x^2}{2}e^{x^2} + C$', 'Casi: si derivas $\\frac{1}{2}x^2 e^{x^2}$ sale $(x + x^3)e^{x^2}$; sobra el término $xe^{x^2}$ que quita la integración por partes.']],
      'Con $u = x^2$ queda $\\frac{1}{2}\\int u e^u\\,du = \\frac{1}{2}(u - 1)e^u + C = \\frac{1}{2}(x^2 - 1)e^{x^2} + C$.'),

    E('va-e-p-uno-x', 'variables', 1, { m: [2, 5, 1] },
      function (v) { return 'Encuentra la solución particular de $x\\,y\' + y = ' + v.m + 'x^{' + (v.m - 1) + '}$ (para $x > 0$) cuya constante de integración es $C = 0$. Escribe la función $y(x)$.'; },
      function (v) { return 'x^' + (v.m - 1); },
      'El lado izquierdo ya es $(xy)\' = mx^{m-1}$. Integrando con $C = 0$ resulta $xy = x^m \\Rightarrow y = x^{m-1}$.',
      { domain: [0.5, 2.5],
        mistakes: {
          noDivX: function (v) { return 'x^' + v.m; },
          keptM: function (v) { return v.m + '*x^' + (v.m - 1); }
        },
        feedback: [
          { when: 'noDivX', say: 'Casi: esa es $x\\,y = x^m$; te faltó dividir entre $\\mu(x) = x$ para despejar $y$.' },
          { when: 'keptM', say: function (v) { return 'Casi: al integrar $' + v.m + 'x^{' + (v.m - 1) + '}$ se divide entre $' + v.m + '$ y el coeficiente se cancela.'; } }
        ] }),

    E('va-e-p-neg-k-x', 'variables', 2, { k: [2, 4, 1], a: [2, 5, 1] },
      function (v) { return 'Resuelve $x\\,y\' - ' + v.k + 'y = ' + v.a + 'x^{' + v.k + '}$ para $x > 0$ con condición $y(1) = ' + v.a + '$. Escribe la función $y(x)$.'; },
      function (v) { return v.a + '*x^' + v.k + '*log(x) + ' + v.a + '*x^' + v.k; },
      'Dividiendo entre $x$ queda $y\' - \\frac{k}{x}y = ax^{k-1}$, con $\\mu = x^{-k}$: $(x^{-k}y)\' = \\frac{a}{x} \\Rightarrow x^{-k}y = a\\ln x + C$. Con $y(1) = a$ sale $C = a$.',
      { domain: [0.5, 2.5],
        mistakes: {
          noC: function (v) { return v.a + '*x^' + v.k + '*log(x)'; },
          wrongMu: function (v) { return v.a + '*x^(-' + v.k + ')*log(x) + ' + v.a + '*x^(-' + v.k + ')'; }
        },
        feedback: [
          { when: 'noC', say: function (v) { return 'Casi: en $x = 1$ se tiene $\\ln(1) = 0$, así que necesitas $+C\\,x^{' + v.k + '}$ con $C = ' + v.a + '$ para cumplir $y(1) = ' + v.a + '$.'; } },
          { when: 'wrongMu', say: function (v) { return 'Casi: como $\\mu = x^{-' + v.k + '}$, al despejar $y$ multiplicas por $x^{' + v.k + '}$, con exponente positivo.'; } }
        ] }),

    E('va-e-gauss', 'variables', 2, { a: [1, 3, 1], k: [2, 5, 1] },
      function (v) { return 'Resuelve el PVI $y\' + ' + (2 * v.a) + 'x\\,y = ' + (2 * v.k) + 'x\\,e^{-' + v.a + 'x^2}$ con condición inicial $y(0) = 0$. Escribe la función $y(x)$.'; },
      function (v) { return v.k + '*x^2*e^(-' + v.a + '*x^2)'; },
      'Con $\\mu = e^{ax^2}$ queda $(e^{ax^2}y)\' = 2kx \\Rightarrow e^{ax^2}y = kx^2 + C$. Como $y(0) = 0$, $C = 0$ y $y = kx^2 e^{-ax^2}$.',
      { domain: [0.2, 1.5],
        mistakes: {
          noDivMu: function (v) { return v.k + '*x^2'; },
          posExp: function (v) { return v.k + '*x^2*e^(' + v.a + '*x^2)'; }
        },
        feedback: [
          { when: 'noDivMu', say: function (v) { return 'Casi: esa es $e^{' + v.a + 'x^2}y$; falta dividir entre el factor integrante $e^{' + v.a + 'x^2}$.'; } },
          { when: 'posExp', say: 'Casi: al dividir entre $e^{ax^2}$ el exponente pasa con signo negativo: $e^{-ax^2}$.' }
        ] }),

    E('va-e-tan-sec', 'variables', 3, { a: [2, 6, 1] },
      function (v) { return 'Resuelve en $(-\\pi/2, \\pi/2)$ el PVI $y\' + (\\tan x)\\,y = ' + v.a + '\\cos x$ con $y(0) = 0$. Escribe la función $y(x)$.'; },
      function (v) { return v.a + '*x*cos(x)'; },
      'El factor integrante es $\\mu = \\sec x$. Al multiplicar: $((\\sec x)\\,y)\' = a\\sec x\\cos x = a \\Rightarrow (\\sec x)\\,y = ax + C$. Con $y(0) = 0$ sale $C = 0$ y $y = ax\\cos x$.',
      { domain: [0.1, 1.3],
        mistakes: {
          divCos: function (v) { return v.a + '*x/cos(x)'; },
          sinInstead: function (v) { return v.a + '*sin(x)*cos(x)'; }
        },
        feedback: [
          { when: 'divCos', say: 'Casi: de $(\\sec x)\\,y = ax$, al despejar $y$ divides entre $\\sec x$, que equivale a multiplicar por $\\cos x$.' },
          { when: 'sinInstead', say: 'Casi: al multiplicar $a\\cos x$ por $\\mu = \\sec x$ los factores trigonométricos se cancelan y queda la constante $a$, cuya integral es $ax$.' }
        ] }),

    N('va-n-xy-simple', 'variables', 1, { m: [2, 4, 1], x1: [2, 4, 1] },
      function (v) { return 'Resuelve $x\\,y\' + y = ' + v.m + 'x^{' + (v.m - 1) + '}$ con la condición $y(1) = 1$ y calcula el valor de $y(' + v.x1 + ')$.'; },
      function (v) { return Math.pow(v.x1, v.m - 1); },
      'Como $(xy)\' = mx^{m-1}$, integrando da $xy = x^m + C$. Con $y(1) = 1$ resulta $C = 0$, así que $y(x) = x^{m-1}$.',
      { where: function (v) { return v.x1 !== v.m; },
        mistakes: {
          noDivX: function (v) { return Math.pow(v.x1, v.m); },
          keptM: function (v) { return v.m * Math.pow(v.x1, v.m - 1); }
        },
        feedback: [
          { when: 'noDivX', say: function (v) { return 'Casi: olvidaste dividir $x\\,y = x^{' + v.m + '}$ entre $x$ para despejar $y$.'; } },
          { when: 'keptM', say: function (v) { return 'Casi: la integral de $' + v.m + 'x^{' + (v.m - 1) + '}$ es $x^{' + v.m + '}$, sin el factor $' + v.m + '$.'; } }
        ] }),

    N('va-n-xy-homog', 'variables', 1, { k: [2, 3, 1], y1: [4, 10, 2], x1: [2, 3, 1] },
      function (v) { return 'Para la ecuación $x\\,y\' + ' + v.k + 'y = 0$ (con $x > 0$) y condición $y(1) = ' + v.y1 + '$, ¿cuánto vale $y(' + v.x1 + ')$?'; },
      function (v) { return v.y1 * Math.pow(v.x1, -v.k); },
      'Al multiplicar por $x^{k-1}$ queda $(x^k y)\' = 0 \\Rightarrow y = C x^{-k}$, con $C = y(1) = y_1$.',
      { mistakes: {
          posPow: function (v) { return v.y1 * Math.pow(v.x1, v.k); },
          invOnly1: function (v) { return v.y1 / v.x1; }
        },
        feedback: [
          { when: 'posPow', say: function (v) { return 'Casi: de $x^{' + v.k + '}y = C$ al despejar $y$ se divide entre $x^{' + v.k + '}$, no se multiplica.'; } },
          { when: 'invOnly1', say: function (v) { return 'Casi: el factor integrante es $x^{' + v.k + '}$, así que se divide entre $x_1^{' + v.k + '}$, no solo entre $x_1$.'; } }
        ] }),

    N('va-n-xy-nohomog', 'variables', 2, { k: [2, 3, 1], a: [2, 4, 1], x1: [2, 3, 1] },
      function (v) { var m = v.k + 2; return 'Considera la ecuación $x\\,y\' + ' + v.k + 'y = ' + (m * v.a) + 'x^2$ para $x > 0$. Si la constante de integración es $C = 0$, ¿cuánto vale la solución en $x = ' + v.x1 + '$?'; },
      function (v) { return v.a * v.x1 * v.x1; },
      'En forma estándar $y\' + \\frac{k}{x}y = (k+2)ax$, con $\\mu = x^k$: $(x^k y)\' = (k+2)ax^{k+1} \\Rightarrow x^k y = ax^{k+2} \\Rightarrow y = ax^2$.',
      { mistakes: {
          noDivXStd: function (v) { return (v.k + 2) * v.a * Math.pow(v.x1, 3) / (v.k + 3); },
          keptMu: function (v) { return v.a * Math.pow(v.x1, v.k + 2); }
        },
        feedback: [
          { when: 'noDivXStd', say: 'Casi: olvidaste dividir el lado derecho entre $x$ al pasar a la forma estándar antes de multiplicar por $\\mu = x^k$.' },
          { when: 'keptMu', say: function (v) { return 'Casi: ese es el valor de $x^{' + v.k + '}y$; falta dividir entre $x^{' + v.k + '}$.'; } }
        ] }),

    N('va-n-desplazado', 'variables', 2, { a: [1, 3, 1], c: [2, 5, 1], x1: [2, 4, 1] },
      function (v) { return 'Resuelve $(x + ' + v.a + ')\\,y\' + y = ' + (2 * v.c) + '(x + ' + v.a + ')$ con la condición $y(0) = ' + (v.c * v.a) + '$ y evalúa $y(' + v.x1 + ')$.'; },
      function (v) { return v.c * (v.x1 + v.a); },
      'El lado izquierdo es $((x + a)y)\' = 2c(x + a) \\Rightarrow (x + a)y = c(x + a)^2 + K$. Con $y(0) = ca$ resulta $K = 0$ y $y = c(x + a)$.',
      { mistakes: {
          noShift: function (v) { return v.c * v.x1; },
          squaredTerm: function (v) { return v.c * Math.pow(v.x1 + v.a, 2); }
        },
        feedback: [
          { when: 'noShift', say: function (v) { return 'Casi: el factor es $x + ' + v.a + '$, así que en $x = ' + v.x1 + '$ vale $' + v.c + '(' + v.x1 + ' + ' + v.a + ')$.'; } },
          { when: 'squaredTerm', say: function (v) { return 'Casi: olvidaste dividir $(x + ' + v.a + ')y = ' + v.c + '(x + ' + v.a + ')^2$ entre $x + ' + v.a + '$.'; } }
        ] }),

    N('va-n-gauss-eval', 'variables', 2, { a: [1, 2, 1], b: [2, 5, 1], c: [2, 6, 1] },
      function (v) { return 'Encuentra el valor en $x = 1$ de la solución de $y\' + ' + (2 * v.a) + 'x\\,y = ' + (2 * v.a * v.b) + 'x$ con condición inicial $y(0) = ' + (v.b + v.c) + '$.'; },
      function (v) { return v.b + v.c * Math.exp(-v.a); },
      'Con $\\mu = e^{ax^2}$ queda $(e^{ax^2}y)\' = 2abx e^{ax^2} \\Rightarrow e^{ax^2}y = b e^{ax^2} + C \\Rightarrow y = b + Ce^{-ax^2}$, donde $C = y(0) - b = c$.',
      { mistakes: {
          cIsY0: function (v) { return v.b + (v.b + v.c) * Math.exp(-v.a); },
          onlyHomog: function (v) { return (v.b + v.c) * Math.exp(-v.a); }
        },
        feedback: [
          { when: 'cIsY0', say: function (v) { return 'Casi: en $x = 0$ tienes $' + v.b + ' + C = ' + (v.b + v.c) + '$, por lo que $C = ' + v.c + '$, no $' + (v.b + v.c) + '$.'; } },
          { when: 'onlyHomog', say: function (v) { return 'Casi: olvidaste el término particular constante $y_p = ' + v.b + '$.'; } }
        ] }),

    N('va-n-cociente-x2', 'variables', 3, { a: [2, 5, 1], b: [2, 5, 1], x1: [1, 2, 1] },
      function (v) { return 'Resuelve $(x^2 + 1)\\,y\' + 2x\\,y = ' + (2 * v.a) + 'x$ con $y(0) = ' + v.b + '$ y calcula el valor de $y(' + v.x1 + ')$.'; },
      function (v) { return (v.a * v.x1 * v.x1 + v.b) / (v.x1 * v.x1 + 1); },
      'Observa que el lado izquierdo ya es $((x^2 + 1)y)\' = 2ax$. Integrando: $(x^2 + 1)y = ax^2 + C$ con $C = y(0) = b$.',
      { mistakes: {
          cNotDiv: function (v) { return (v.a * v.x1 * v.x1) / (v.x1 * v.x1 + 1) + v.b; },
          noDivAtAll: function (v) { return v.a * v.x1 * v.x1 + v.b; }
        },
        feedback: [
          { when: 'cNotDiv', say: 'Casi: al despejar $y$ de $(x^2 + 1)y = ax^2 + C$, la constante $C$ también se divide entre $x^2 + 1$.' },
          { when: 'noDivAtAll', say: 'Casi: ese es el valor de $(x^2 + 1)y$; te faltó dividir entre $x^2 + 1$.' }
        ] }),

    N('va-n-potencia-neg-eval', 'variables', 3, { k: [2, 3, 1], a: [2, 5, 1], c: [1, 4, 1] },
      function (v) { return 'Para $x > 0$, resuelve $x\\,y\' - ' + v.k + 'y = ' + v.a + 'x^{' + (v.k + 1) + '}$ con $y(1) = ' + (v.a + v.c) + '$ y evalúa la solución en $x = 2$.'; },
      function (v) { return v.a * Math.pow(2, v.k + 1) + v.c * Math.pow(2, v.k); },
      'En forma estándar $y\' - \\frac{k}{x}y = ax^{k}$, con $\\mu = x^{-k}$: $(x^{-k}y)\' = a \\Rightarrow x^{-k}y = ax + C$. De $y(1) = a + C = a + c$ sale $C = c$ y $y = ax^{k+1} + cx^k$.',
      { mistakes: {
          cIsY1: function (v) { return v.a * Math.pow(2, v.k + 1) + (v.a + v.c) * Math.pow(2, v.k); },
          cNotMult: function (v) { return v.a * Math.pow(2, v.k + 1) + v.c; }
        },
        feedback: [
          { when: 'cIsY1', say: function (v) { return 'Casi: en $x = 1$ tienes $' + v.a + ' + C = ' + (v.a + v.c) + '$, así que $C = ' + v.c + '$.'; } },
          { when: 'cNotMult', say: function (v) { return 'Casi: al despejar $y$ de $x^{-' + v.k + '}y = ax + C$, la constante $C$ queda multiplicada por $x^{' + v.k + '}$.'; } }
        ] }),

    /* ======================= 4. Problema de valor inicial (18) ======================= */
    C('pv-momento-poner-c', 'pvi', 1,
      'Al resolver un PVI lineal por factor integrante, ¿en qué momento de la receta debes escribir la constante $+C$?',
      'Justo al integrar $(\\mu(x)\\,y)\' = \\mu(x)\\,Q(x)$, antes de dividir entre $\\mu(x)$', [
        ['Hasta el final, después de haber despejado $y(x)$ dividiendo entre $\\mu(x)$', 'Casi: si la sumas después de despejar, escribirías $+C$ en lugar de $+C/\\mu(x)$ y la función ya no cumpliría la EDO.'],
        ['En el exponente del factor integrante $\\mu(x) = e^{\\int P\\,dx + C}$', 'Casi: en el exponente de $\\mu(x)$ solo produciría un factor que se cancela; la $+C$ va al integrar $(\\mu y)\' = \\mu Q$.'],
        ['En un PVI nunca se escribe $C$ en ningún paso porque se pide una sola solución', 'Casi: si omites la $C$, te quedas solo con una antiderivada particular y en general no cumplirá la condición inicial $y(x_0) = y_0$.']],
      'La constante nace en la integración $\\mu(x)y = \\int \\mu(x)Q(x)\\,dx + C$, por lo que queda dividida entre $\\mu(x)$ al despejar.'),

    C('pv-error-c-igual-y0', 'pvi', 1,
      function (v) { return 'En la solución general $y(x) = ' + v.s + ' + Ce^{-2x}$, la condición inicial es $y(0) = ' + v.y0 + '$. ¿Cuánto vale $C$ y por qué no es simplemente $' + v.y0 + '$?'; },
      function (v) { return 'Vale $C = ' + (v.y0 - v.s) + '$, porque en $x = 0$ también está presente el término constante $' + v.s + '$: $' + v.s + ' + C = ' + v.y0 + '$'; }, [
        [function (v) { return 'Vale $C = ' + v.y0 + '$, porque en $x = 0$ el término $' + v.s + '$ se multiplica por $0$'; }, function (v) { return 'Casi: el término $' + v.s + '$ no está multiplicado por $x$; sigue valiendo $' + v.s + '$ cuando $x = 0$.'; }],
        [function (v) { return 'Vale $C = ' + (v.y0 + v.s) + '$, porque el término $' + v.s + '$ pasa sumando al otro lado'; }, function (v) { return 'Casi: de $' + v.s + ' + C = ' + v.y0 + '$ se despeja restando: $C = ' + v.y0 + ' - ' + v.s + ' = ' + (v.y0 - v.s) + '$.'; }],
        ['Vale $C = 0$, porque $e^0 = 0$', 'Casi: recuerda que $e^0 = 1$, no $0$.']],
      'Al evaluar en $x = 0$ queda $y(0) = s + Ce^0 = s + C = y_0$, de donde $C = y_0 - s$.',
      { vars: { s: [3, 8, 1], y0: [10, 18, 2] } }),

    C('pv-condicion-en-x1', 'pvi', 2,
      function (v) { return 'Al resolver $y\' + \\dfrac{y}{x} = x^2$ llegas a $y = \\dfrac{x^3}{4} + \\dfrac{C}{x}$. Si la condición inicial es $y(1) = ' + v.b + '$, ¿qué ecuación determina a $C$?'; },
      function (v) { return '$\\dfrac{1}{4} + C = ' + v.b + '$, de donde $C = ' + v.b + ' - \\dfrac{1}{4}$'; }, [
        [function (v) { return '$0 + C = ' + v.b + '$, de donde $C = ' + v.b + '$'; }, 'Casi: la condición se da en $x = 1$ (no en $x = 0$), y en $x = 1$ el término $x^3/4$ vale $1/4$, no $0$.'],
        [function (v) { return '$\\dfrac{1}{4} + \\dfrac{C}{0} = ' + v.b + '$, por lo que no existe solución'; }, 'Casi: estás evaluando en $x = 1$, así que el denominador de $C/x$ vale $1$, no $0$.'],
        [function (v) { return '$\\dfrac{3}{4} + C = ' + v.b + '$, derivando antes de evaluar'; }, 'Casi: la condición inicial es sobre $y(1)$, no sobre la derivada $y\'(1)$.']],
      'Sustituyendo $x = 1$ en $y(x) = \\frac{x^3}{4} + \\frac{C}{x}$ se obtiene $\\frac{1^3}{4} + \\frac{C}{1} = b$.',
      { vars: { b: [2, 7, 1] } }),

    C('pv-condicion-en-pi', 'pvi', 2,
      'Para el PVI $x\\,y\' + 2y = \\dfrac{\\cos x}{x}$ con $y(\\pi) = 0$, la familia general es $y = \\dfrac{\\sin x + C}{x^2}$. ¿Qué valor toma $C$ al imponer $y(\\pi) = 0$?',
      '$C = 0$, porque $\\sin\\pi = 0$ y por tanto $\\dfrac{0 + C}{\\pi^2} = 0$', [
        ['$C = -1$, porque $\\sin\\pi = 1$', 'Casi: $\\sin\\pi = 0$ (es $\\cos\\pi$ el que vale $-1$).'],
        ['$C = \\pi^2$, al pasar el denominador al otro lado', 'Casi: al multiplicar ambos lados por $\\pi^2$, el lado derecho sigue siendo $0\\cdot \\pi^2 = 0$.'],
        ['No se puede despejar $C$ porque en $x = \\pi$ el denominador se anula', 'Casi: el denominador es $x^2 = \\pi^2 \\neq 0$, perfectamente definido.']],
      'En $x = \\pi$, $y(\\pi) = \\frac{\\sin\\pi + C}{\\pi^2} = \\frac{C}{\\pi^2} = 0$, lo que implica $C = 0$.'),

    C('pv-integral-definida-pvi', 'pvi', 2,
      'Si para el PVI $y\' + P(x)\\,y = Q(x)$ con $y(x_0) = y_0$ eliges el factor integrante normalizado en $x_0$, $\\mu(x) = e^{\\int_{x_0}^x P(s)\\,ds}$ (de modo que $\\mu(x_0) = 1$), ¿cómo se escribe directamente la solución sin despejar $C$ aparte?',
      '$y(x) = \\dfrac{1}{\\mu(x)}\\left(y_0 + \\displaystyle\\int_{x_0}^{x} \\mu(s)\\,Q(s)\\,ds\\right)$', [
        ['$y(x) = y_0 + \\dfrac{1}{\\mu(x)}\\displaystyle\\int_{x_0}^{x} \\mu(s)\\,Q(s)\\,ds$', 'Casi: al integrar $(\\mu y)\' = \\mu Q$ entre $x_0$ y $x$ queda $\\mu(x)y(x) - \\mu(x_0)y_0$, así que $y_0$ también se divide entre $\\mu(x)$.'],
        ['$y(x) = \\mu(x)\\left(y_0 + \\displaystyle\\int_{x_0}^{x} Q(s)\\,ds\\right)$', 'Casi: hay que dividir entre $\\mu(x)$ afuera y multiplicar a $Q(s)$ por $\\mu(s)$ dentro de la integral.'],
        ['$y(x) = \\dfrac{y_0}{\\mu(x)}$ únicamente, porque la integral definida se anula', 'Casi: la integral definida solo vale $0$ en el punto inicial $x = x_0$, no para todo $x$.']],
      'Por el teorema fundamental del cálculo, $\\mu(x)y(x) - \\mu(x_0)y(x_0) = \\int_{x_0}^x \\mu(s)Q(s)\\,ds$, con $\\mu(x_0) = 1$.'),

    C('pv-unicidad-lineal-teorema', 'pvi', 3,
      '¿Por qué toda ecuación lineal en forma estándar $y\' + P(x)\\,y = Q(x)$ con $P$ y $Q$ continuas en un intervalo abierto $I$ tiene solución única para <em>cualquier</em> condición inicial $y(x_0) = y_0$ con $x_0 \\in I$, y además esa solución nunca explota dentro de $I$?',
      'Porque la fórmula explícita $y = \\frac{1}{\\mu}\\left(\\int \\mu Q\\,dx + C\\right)$ solo involucra funciones continuas en $I$ y un denominador $\\mu(x) = e^{\\int P\\,dx}$ que nunca se anula', [
        ['Porque las soluciones de una ecuación lineal son siempre polinomios de primer grado', 'Casi: las soluciones pueden tener exponenciales, logaritmos o funciones trigonométricas, no solo polinomios.'],
        ['Porque $P(x)$ y $Q(x)$ son constantes en todo intervalo abierto $I$', 'Casi: $P(x)$ y $Q(x)$ pueden variar con $x$; basta que sean continuas en $I$.'],
        ['En realidad sí puede explotar dentro de $I$ si el valor inicial $y_0$ es muy grande', 'Casi: eso ocurre en ecuaciones no lineales como $y\' = y^2$, pero en las lineales el intervalo de validez depende solo de dónde sean continuas $P$ y $Q$, no de $y_0$.']],
      'A diferencia de las no lineales, la fórmula del factor integrante construye explícitamente la solución en todo el intervalo $I$ donde $P$ y $Q$ son continuas.'),

    E('pv-e-const-exp', 'pvi', 1, { a: [2, 4, 1], c: [1, 4, 1] },
      function (v) { return 'Resuelve el PVI $y\' + ' + v.a + 'y = ' + (v.a - 1) + 'e^{-x}$ con condición inicial $y(0) = ' + (1 + v.c) + '$. Escribe la función $y(x)$.'; },
      function (v) { return 'e^(-x) + ' + v.c + '*e^(-' + v.a + '*x)'; },
      'Con $\\mu = e^{ax}$: $(e^{ax}y)\' = (a - 1)e^{(a-1)x} \\Rightarrow e^{ax}y = e^{(a-1)x} + C \\Rightarrow y = e^{-x} + Ce^{-ax}$. De $y(0) = 1 + C = 1 + c$ sale $C = c$.',
      { domain: [0, 1.5],
        mistakes: {
          cIsY0: function (v) { return 'e^(-x) + ' + (1 + v.c) + '*e^(-' + v.a + '*x)'; },
          posMuExp: function (v) { return 'e^(-x) + ' + v.c + '*e^(' + v.a + '*x)'; }
        },
        feedback: [
          { when: 'cIsY0', say: function (v) { return 'Casi: en $x = 0$ el término $e^{-x}$ vale $1$, así que $1 + C = ' + (1 + v.c) + ' \\Rightarrow C = ' + v.c + '$.'; } },
          { when: 'posMuExp', say: function (v) { return 'Casi: al dividir entre $\\mu = e^{' + v.a + 'x}$ el exponente del término con $C$ es $-' + v.a + 'x$.'; } }
        ] }),

    E('pv-e-p-uno-x-pvi', 'pvi', 2, { n: [1, 3, 1], c: [1, 4, 1] },
      function (v) { var m = v.n + 2; return 'Resuelve para $x > 0$ el PVI $y\' + \\dfrac{y}{x} = ' + m + 'x^{' + v.n + '}$ con condición inicial $y(1) = ' + (1 + v.c) + '$. Escribe la función $y(x)$.'; },
      function (v) { return 'x^' + (v.n + 1) + ' + ' + v.c + '/x'; },
      'Multiplicando por $\\mu = x$: $(xy)\' = (n+2)x^{n+1} \\Rightarrow xy = x^{n+2} + C \\Rightarrow y = x^{n+1} + C/x$. Con $y(1) = 1 + C = 1 + c$ resulta $C = c$.',
      { domain: [0.5, 2.5],
        mistakes: {
          noDivC: function (v) { return 'x^' + (v.n + 1) + ' + ' + v.c; },
          cIsY1: function (v) { return 'x^' + (v.n + 1) + ' + ' + (1 + v.c) + '/x'; }
        },
        feedback: [
          { when: 'noDivC', say: 'Casi: la constante $C$ también se divide entre el factor integrante $\\mu = x$, quedando $C/x$.' },
          { when: 'cIsY1', say: function (v) { return 'Casi: en $x = 1$ tienes $1 + C = ' + (1 + v.c) + '$, así que $C = ' + v.c + '$, no $' + (1 + v.c) + '$.'; } }
        ] }),

    E('pv-e-p-dos-x-pvi', 'pvi', 2, { a: [2, 5, 1], c: [1, 4, 1] },
      function (v) { return 'Resuelve para $x > 0$ el PVI $x\\,y\' + 2y = ' + (4 * v.a) + 'x^2$ con $y(1) = ' + (v.a + v.c) + '$. Escribe la función $y(x)$.'; },
      function (v) { return v.a + '*x^2 + ' + v.c + '/x^2'; },
      'En forma estándar $y\' + \\frac{2}{x}y = 4ax$, con $\\mu = x^2$: $(x^2 y)\' = 4ax^3 \\Rightarrow x^2 y = ax^4 + C \\Rightarrow y = ax^2 + C/x^2$, donde $C = c$.',
      { domain: [0.5, 2.5],
        mistakes: {
          divOnlyOneX: function (v) { return v.a + '*x^2 + ' + v.c + '/x'; },
          noDivC: function (v) { return v.a + '*x^2 + ' + v.c; }
        },
        feedback: [
          { when: 'divOnlyOneX', say: 'Casi: el factor integrante es $\\mu = x^2$, así que la constante queda dividida entre $x^2$, no entre $x$.' },
          { when: 'noDivC', say: 'Casi: olvidaste dividir la constante $C$ entre $\\mu = x^2$.' }
        ] }),

    E('pv-e-sin-pi', 'pvi', 3, { a: [2, 6, 1], k: [1, 3, 1] },
      function (v) { return 'Resuelve para $x > 0$ el PVI $x\\,y\' + ' + v.k + 'y = ' + v.a + 'x^{' + (1 - v.k) + '}\\cos x$ con condición inicial $y(\\pi) = 0$. Escribe la función $y(x)$.'; },
      function (v) { return v.a + '*sin(x)/x^' + v.k; },
      'Dividiendo entre $x$ queda $P = k/x$ y $\\mu = x^k$, con lo que $(x^k y)\' = a\\cos x \\Rightarrow x^k y = a\\sin x + C$. En $x = \\pi$, $\\sin\\pi = 0 \\Rightarrow C = 0$.',
      { domain: [0.5, 3],
        mistakes: {
          cosInstead: function (v) { return v.a + '*cos(x)/x^' + v.k; },
          wrongPow: function (v) { return v.a + '*sin(x)/x^' + (v.k - 1); }
        },
        feedback: [
          { when: 'cosInstead', say: 'Casi: la antiderivada de $\\cos x$ es $\\sin x$.' },
          { when: 'wrongPow', say: function (v) { return 'Casi: al pasar a forma estándar divides entre $x$, así que el factor integrante es $x^{' + v.k + '}$ y divides entre $x^{' + v.k + '}$.'; } }
        ] }),

    N('pv-n-hallar-c-const', 'pvi', 1, { a: [2, 4, 1], s: [3, 6, 1], y0: [9, 15, 2] },
      function (v) { var b = v.a * v.s; return 'Al resolver $y\' + ' + v.a + 'y = ' + b + '$ se obtiene la familia $y(x) = ' + v.s + ' + Ce^{-' + v.a + 'x}$. ¿Cuánto vale la constante $C$ si la condición inicial es $y(0) = ' + v.y0 + '$?'; },
      function (v) { return v.y0 - v.s; },
      'Evaluando en $x = 0$: $y(0) = s + Ce^0 = s + C = y_0 \\Rightarrow C = y_0 - s$.',
      { mistakes: {
          justY0: function (v) { return v.y0; },
          plusS: function (v) { return v.y0 + v.s; },
          negDiff: function (v) { return v.s - v.y0; }
        },
        feedback: [
          { when: 'justY0', say: function (v) { return 'Casi: olvidaste restar el término estacionario $' + v.s + '$ al despejar $C$ de $' + v.s + ' + C = ' + v.y0 + '$.'; } },
          { when: 'plusS', say: function (v) { return 'Casi: el término $' + v.s + '$ pasa restando al otro lado, no sumando.'; } },
          { when: 'negDiff', say: 'Casi: el signo está invertido; es $C = y(0) - s$.' }
        ] }),

    N('pv-n-hallar-c-x', 'pvi', 1, { a: [1, 4, 1], y1: [6, 11, 1] },
      function (v) { return 'La solución general de $x\\,y\' + y = ' + (2 * v.a) + 'x$ es $y(x) = ' + v.a + 'x + \\dfrac{C}{x}$. ¿Cuánto vale la constante $C$ cuando $y(1) = ' + v.y1 + '$?'; },
      function (v) { return v.y1 - v.a; },
      'Sustituyendo $x = 1$: $y(1) = a(1) + C/1 = a + C = y_1 \\Rightarrow C = y_1 - a$.',
      { mistakes: {
          justY1: function (v) { return v.y1; },
          plusA: function (v) { return v.y1 + v.a; }
        },
        feedback: [
          { when: 'justY1', say: function (v) { return 'Casi: en $x = 1$ el primer término $' + v.a + 'x$ vale $' + v.a + '$, así que $C = ' + v.y1 + ' - ' + v.a + '$.'; } },
          { when: 'plusA', say: function (v) { return 'Casi: de $' + v.a + ' + C = ' + v.y1 + '$ se despeja restando $' + v.a + '$.'; } }
        ] }),

    N('pv-n-eval-exp-x0', 'pvi', 1, { a: [2, 3, 1], c: [2, 5, 1] },
      function (v) { return 'La solución del PVI $y\' + ' + v.a + 'y = ' + (v.a - 1) + 'e^{-x}$ con $y(0) = ' + (1 + v.c) + '$ es $y(x) = e^{-x} + ' + v.c + 'e^{-' + v.a + 'x}$. ¿Cuánto vale $y(1)$?'; },
      function (v) { return Math.exp(-1) + v.c * Math.exp(-v.a); },
      'Basta evaluar $e^{-1} + ce^{-a}$ en $x = 1$.',
      { mistakes: {
          posExp: function (v) { return Math.exp(1) + v.c * Math.exp(v.a); },
          cIsY0: function (v) { return Math.exp(-1) + (1 + v.c) * Math.exp(-v.a); }
        },
        feedback: [
          { when: 'posExp', say: 'Casi: ambos exponentes llevan signo negativo en $x = 1$: $e^{-1} + ce^{-a}$.' },
          { when: 'cIsY0', say: function (v) { return 'Casi: el coeficiente del segundo término ya es $C = ' + v.c + '$, no $y(0) = ' + (1 + v.c) + '$.'; } }
        ] }),

    N('pv-n-p-uno-x-eval', 'pvi', 2, { a: [1, 2, 1], y1: [5, 9, 1] },
      function (v) { return 'Resuelve el PVI $y\' + \\dfrac{y}{x} = ' + (3 * v.a) + 'x$ con condición inicial $y(1) = ' + v.y1 + '$ y calcula el valor de $y(2)$.'; },
      function (v) { return 4 * v.a + (v.y1 - v.a) / 2; },
      'Con $\\mu = x$: $(xy)\' = 3ax^2 \\Rightarrow xy = ax^3 + C \\Rightarrow y = ax^2 + C/x$. De $y(1) = a + C = y_1$ sale $C = y_1 - a$.',
      { mistakes: {
          noDivC: function (v) { return 4 * v.a + (v.y1 - v.a); },
          cIsY1: function (v) { return 4 * v.a + v.y1 / 2; }
        },
        feedback: [
          { when: 'noDivC', say: function (v) { return 'Casi: olvidaste dividir la constante $C = ' + (v.y1 - v.a) + '$ entre $x = 2$.'; } },
          { when: 'cIsY1', say: function (v) { return 'Casi: en $x = 1$ tienes $' + v.a + ' + C = ' + v.y1 + '$, por lo que $C = ' + (v.y1 - v.a) + '$ y no $' + v.y1 + '$.'; } }
        ] }),

    N('pv-n-p-dos-x-eval', 'pvi', 2, { a: [1, 3, 1], y1: [6, 10, 1] },
      function (v) { return 'Sea el PVI $x\\,y\' + 2y = ' + (3 * v.a) + 'x$ con $y(1) = ' + v.y1 + '$. ¿Cuánto vale la solución en $x = 2$?'; },
      function (v) { return 2 * v.a + (v.y1 - v.a) / 4; },
      'Dividiendo entre $x$ queda $y\' + \\frac{2}{x}y = 3a$, con $\\mu = x^2$: $(x^2 y)\' = 3ax^2 \\Rightarrow y = ax + C/x^2$, donde $C = y_1 - a$.',
      { mistakes: {
          divOneX: function (v) { return 2 * v.a + (v.y1 - v.a) / 2; },
          noDivC: function (v) { return 2 * v.a + (v.y1 - v.a); }
        },
        feedback: [
          { when: 'divOneX', say: 'Casi: el factor integrante es $\\mu = x^2$, así que el segundo término es $C/x^2$, no $C/x$.' },
          { when: 'noDivC', say: 'Casi: la constante $C$ debe dividirse entre $\\mu(2) = 4$.' }
        ] }),

    N('pv-n-x0-no-cero-const', 'pvi', 2, { x0: [1, 3, 1], s: [2, 4, 1], d: [3, 6, 1] },
      function (v) { var y0 = v.s + v.d; return 'Resuelve $y\' + y = ' + v.s + '$ con la condición inicial dada en $x_0 = ' + v.x0 + '$: $y(' + v.x0 + ') = ' + y0 + '$. ¿Cuánto vale $y(' + (v.x0 + 1) + ')$?'; },
      function (v) { return v.s + v.d * Math.exp(-1); },
      'Escribiendo la familia centrada en $x_0$ como $y = s + K e^{-(x - x_0)}$, de $y(x_0) = s + K = s + d$ sale $K = d$, y en $x_0 + 1$ vale $s + d e^{-1}$.',
      { mistakes: {
          asIfX0Zero: function (v) { return v.s + v.d * Math.exp(-(v.x0 + 1)); },
          keptY0: function (v) { return v.s + (v.s + v.d) * Math.exp(-1); }
        },
        feedback: [
          { when: 'asIfX0Zero', say: function (v) { return 'Casi: la condición inicial se dio en $x_0 = ' + v.x0 + '$, no en $0$; de $x = ' + v.x0 + '$ a $x = ' + (v.x0 + 1) + '$ solo avanza $\\Delta x = 1$.'; } },
          { when: 'keptY0', say: function (v) { return 'Casi: debes restar el estado estacionario $' + v.s + '$ al valor inicial $y(' + v.x0 + ') = ' + (v.s + v.d) + '$.'; } }
        ] }),

    N('pv-n-ln-rhs-pvi', 'pvi', 3, { a: [2, 4, 1], y1: [4, 7, 1] },
      function (v) { return 'Resuelve para $x > 0$ el PVI $x\\,y\' + 2y = \\dfrac{' + v.a + '}{x^2}$ con $y(1) = ' + v.y1 + '$ y calcula el valor de $y(2)$.'; },
      function (v) { return (v.a * Math.log(2) + v.y1) / 4; },
      'En forma estándar $y\' + \\frac{2}{x}y = \\frac{a}{x^3}$, con $\\mu = x^2$: $(x^2 y)\' = \\frac{a}{x} \\Rightarrow x^2 y = a\\ln x + C$. Con $y(1) = y_1$ sale $C = y_1$.',
      { mistakes: {
          noDiv4: function (v) { return v.a * Math.log(2) + v.y1; },
          divBy2: function (v) { return (v.a * Math.log(2) + v.y1) / 2; },
          ln1Is1: function (v) { return (v.a * Math.log(2) + v.y1 - v.a) / 4; }
        },
        feedback: [
          { when: 'noDiv4', say: 'Casi: ese es el valor de $x^2 y(2)$; falta dividir entre $2^2 = 4$.' },
          { when: 'divBy2', say: 'Casi: el factor integrante es $\\mu = x^2$, por lo que en $x = 2$ se divide entre $4$, no entre $2$.' },
          { when: 'ln1Is1', say: 'Casi: recuerda que $\\ln(1) = 0$, así que en $x = 1$ se tiene $C = y(1)$.' }
        ] }),

    N('pv-n-bernoulli-puente', 'pvi', 3, { a: [1, 2, 1], c: [3, 6, 1], x1: [1, 2, 1] },
      function (v) { return 'Resuelve el PVI $(x + 1)\\,y\' + 2y = ' + (3 * v.a) + '(x + 1)$ con condición inicial $y(0) = ' + (v.a + v.c) + '$ y evalúa $y(' + v.x1 + ')$.'; },
      function (v) { var u = v.x1 + 1; return v.a * u + v.c / (u * u); },
      'Dividiendo entre $x + 1$ queda $P(x) = \\frac{2}{x+1}$ y $\\mu = (x + 1)^2$: $((x+1)^2 y)\' = 3a(x+1)^2 \\Rightarrow (x+1)^2 y = a(x+1)^3 + C$. En $x = 0$: $y(0) = a + C \\Rightarrow C = c$.',
      { mistakes: {
          noDivC: function (v) { var u = v.x1 + 1; return v.a * u + v.c; },
          divOneU: function (v) { var u = v.x1 + 1; return v.a * u + v.c / u; }
        },
        feedback: [
          { when: 'noDivC', say: 'Casi: olvidaste dividir la constante $C$ entre el factor integrante $(x + 1)^2$.' },
          { when: 'divOneU', say: 'Casi: el factor integrante es $(x + 1)^2$, así que $C$ se divide entre $(x + 1)^2$, no entre $x + 1$.' }
        ] }),

    /* ======================= 5. Tanques de mezclas (16) ======================= */
    C('ta-balance-sal', 'tanques', 1,
      'En un tanque con volumen constante $V$ y $A(t)$ gramos de sal bien mezclada, entra salmuera de concentración $c_{in}$ a razón $r$ (en L/min) y sale mezcla a la misma razón $r$. ¿Cuál es la ecuación diferencial para $A(t)$?',
      '$\\dfrac{dA}{dt} = r\\,c_{in} - r\\,\\dfrac{A}{V}$', [
        ['$\\dfrac{dA}{dt} = r\\,c_{in} - r\\,A$', 'Casi: lo que sale por litro es la concentración actual en el tanque, $A/V$ (en g/L), no la masa total $A$.'],
        ['$\\dfrac{dA}{dt} = c_{in} - \\dfrac{A}{V}$', 'Casi: esa es la diferencia de concentraciones (en g/L); falta multiplicar ambos términos por el flujo volumétrico $r$ (en L/min) para obtener g/min.'],
        ['$\\dfrac{dA}{dt} = \\dfrac{r\\,c_{in}}{V} - r\\,A$', 'Casi: el flujo de sal que entra es $r\\,c_{in}$ y el que sale es $r(A/V)$; pusiste el volumen $V$ en el término equivocado.']],
      'La razón de cambio de sal (g/min) es la razón a la que entra ($r\\,c_{in}$) menos la razón a la que sale ($r \\cdot A/V$).'),

    C('ta-concentracion-salida', 'tanques', 1,
      'En el modelo de un tanque perfectamente agitado con $V$ litros de mezcla y $A(t)$ gramos de sal en el instante $t$, ¿qué concentración (en g/L) tiene el líquido que sale por el desagüe en ese instante?',
      '$\\dfrac{A(t)}{V}$, igual a la concentración uniforme dentro del tanque', [
        ['$c_{in}$, igual a la concentración de la salmuera que está entrando', 'Casi: la salmuera que entra se mezcla de inmediato con todo el tanque, así que lo que sale lleva la concentración del tanque $A(t)/V$.'],
        ['$\\dfrac{A_0}{V}$, constante e igual a la concentración inicial', 'Casi: conforme entra y sale líquido, la cantidad de sal $A(t)$ cambia con el tiempo y con ella la concentración de salida.'],
        ['$A(t)\\cdot V$, el producto de la sal por el volumen', 'Casi: la concentración es masa entre volumen (g/L), es decir, $A(t)/V$.']],
      '«Bien revuelto» o «mezcla uniforme» significa que en todo punto del tanque, incluida la salida, la concentración es $A(t)/V$.'),

    C('ta-independencia-r-inf', 'tanques', 2,
      'Un tanque de $200\\ \\text{L}$ recibe salmuera con $0.5\\ \\text{g/L}$ a razón $r$ y drena a la misma razón $r$. Si duplicas la rapidez de bombeo $r$, ¿qué cambia en el comportamiento del tanque?',
      'Alcanza el equilibrio en la mitad de tiempo, pero la cantidad final de sal cuando $t \\to \\infty$ sigue siendo $V c_{in} = 100\\ \\text{g}$', [
        ['La cantidad final de sal cuando $t \\to \\infty$ se duplica a $200\\ \\text{g}$', 'Casi: al duplicar $r$ se duplican tanto la entrada como la salida; a la larga la concentración del tanque solo iguala a $c_{in} = 0.5\\ \\text{g/L}$.'],
        ['Tarda el doble de tiempo en acercarse al equilibrio', 'Casi: el exponente es $-rt/V$, así que aumentar $r$ acelera la mezcla y acorta el tiempo característico $V/r$.'],
        ['No cambia ni la rapidez del proceso ni la cantidad final de sal', 'Casi: la cantidad final no cambia, pero el ritmo de acercamiento $e^{-rt/V}$ sí se vuelve dos veces más rápido.']],
      'En $A(t) = Vc_{in} + (A_0 - Vc_{in})e^{-rt/V}$, el valor asintótico $Vc_{in}$ no depende de $r$, mientras que la tasa $r/V$ es proporcional a $r$.'),

    C('ta-agua-pura', 'tanques', 2,
      'Un tanque con volumen constante $V$ tiene inicialmente $A_0 > 0$ gramos de sal. Si a partir de $t = 0$ le entra <strong>agua pura</strong> ($c_{in} = 0$) a razón $r$ y sale mezcla a razón $r$, ¿cómo queda la EDO y cuál es su solución?',
      '$A\' + \\dfrac{r}{V}A = 0$, cuya solución es $A(t) = A_0\\,e^{-rt/V}$', [
        ['$A\' = -r$, cuya solución es $A(t) = A_0 - rt$', 'Casi: la sal no sale a ritmo constante, sino proporcional a la concentración restante $A(t)/V$, por lo que decae exponencialmente.'],
        ['$A\' = 0$, por lo que la cantidad de sal permanece constante en $A_0$', 'Casi: aunque no entra sal, sí está saliendo sal por el desagüe a razón $r\\,A/V$.'],
        ['$A\' - \\dfrac{r}{V}A = 0$, cuya solución es $A(t) = A_0\\,e^{+rt/V}$', 'Casi: como la sal sale del tanque, $dA/dt = -(r/V)A$ lleva signo negativo en el lado derecho y $+(r/V)A$ al pasar al izquierdo.']],
      'Con $c_{in} = 0$ el término de entrada es cero y queda la ecuación homogénea $A\' + (r/V)A = 0$, un decaimiento exponencial hacia $0$.'),

    C('ta-a0-mayor-que-eq', 'tanques', 2,
      'Si un tanque empieza con más sal que su valor de equilibrio ($A_0 > V c_{in}$), ¿cómo se comporta la función $A(t) = V c_{in} + (A_0 - V c_{in})e^{-rt/V}$ para $t > 0$?',
      'Es estrictamente decreciente y se aproxima desde arriba hacia $V c_{in}$ conforme $t \\to \\infty$', [
        ['Sigue subiendo porque continúa entrando salmuera con $c_{in} > 0$', 'Casi: aunque entra sal, al inicio la mezcla del tanque está más concentrada que la que entra, así que sale más sal de la que entra ($A\' < 0$).'],
        ['Baja hasta llegar a $0\\ \\text{g}$ y luego vuelve a subir hasta $V c_{in}$', 'Casi: una solución de una EDO autónoma de primer orden no puede cruzar el equilibrio $A = Vc_{in}$; se acerca a él sin rebasarlo.'],
        ['Permanece constante en $A_0$ porque el tanque ya está saturado', 'Casi: si $A > Vc_{in}$, entonces $r c_{in} - r A/V < 0$, por lo que la cantidad de sal disminuye.']],
      'Como $A_0 - Vc_{in} > 0$, el término transitorio es positivo y decae hacia cero, haciendo que $A(t)$ baje monótonamente hacia $Vc_{in}$.'),

    C('ta-volumen-variable', 'tanques', 3,
      'En un tanque que empieza con $V_0 = 100\\ \\text{L}$, entra salmuera a $r_1 = 5\\ \\text{L/min}$ con concentración $c_{in}$ y sale mezcla a $r_2 = 3\\ \\text{L/min}$. ¿Cómo queda la ecuación diferencial en forma estándar mientras el tanque no se desborde?',
      '$A\' + \\dfrac{3}{100 + 2t}\\,A = 5\\,c_{in}$', [
        ['$A\' + \\dfrac{5}{100 + 2t}\\,A = 5\\,c_{in}$', 'Casi: el término que sale depende del flujo de salida $r_2 = 3\\ \\text{L/min}$, no del flujo de entrada $r_1 = 5\\ \\text{L/min}$.'],
        ['$A\' + \\dfrac{3}{100}\\,A = 5\\,c_{in}$', 'Casi: como entran $5\\ \\text{L/min}$ y salen $3\\ \\text{L/min}$, el volumen no se queda en $100\\ \\text{L}$, sino que crece como $V(t) = 100 + 2t$.'],
        ['$A\' + \\dfrac{2}{100 + 2t}\\,A = 2\\,c_{in}$', 'Casi: el cambio neto de volumen es $5 - 3 = 2\\ \\text{L/min}$, pero la sal entra con los $5\\ \\text{L/min}$ y sale con los $3\\ \\text{L/min}$.']],
      'El volumen en el instante $t$ es $V(t) = 100 + (5 - 3)t = 100 + 2t$, y la razón de salida de sal es $r_2 \\frac{A}{V(t)} = \\frac{3A}{100 + 2t}$.'),

    E('ta-e-tanque-cero', 'tanques', 2, { V: [100, 300, 100], r: [2, 6, 2], c: [1, 3, 1] },
      function (v) { return 'Un tanque de $' + v.V + '\\ \\text{L}$ contiene inicialmente agua pura ($A(0) = 0$). En $t = 0$ empieza a entrar salmuera con $' + v.c + '\\ \\text{g/L}$ a razón de $' + v.r + '\\ \\text{L/min}$ y sale la mezcla a la misma razón. Escribe la función $A(t)$ (en gramos, usando la variable <code>t</code>).'; },
      function (v) { var S = v.V * v.c; return S + '*(1 - e^(-' + v.r + '*t/' + v.V + '))'; },
      'La solución general es $A(t) = Vc + Ce^{-rt/V}$, y como $A(0) = 0$ se tiene $C = -Vc$, dando $A(t) = Vc(1 - e^{-rt/V})$.',
      { exprVars: ['t'], domain: [1, 40],
        mistakes: {
          onlyExp: function (v) { var S = v.V * v.c; return S + '*e^(-' + v.r + '*t/' + v.V + ')'; },
          noVInExp: function (v) { var S = v.V * v.c; return S + '*(1 - e^(-' + v.r + '*t))'; }
        },
        feedback: [
          { when: 'onlyExp', say: 'Casi: esa expresión vale $Vc$ en $t = 0$ y decae a $0$; aquí empieza en $A(0) = 0$ y sube como $Vc(1 - e^{-rt/V})$.' },
          { when: 'noVInExp', say: 'Casi: olvidaste dividir entre el volumen $V$ en el exponente $-rt/V$.' }
        ] }),

    E('ta-e-lavado', 'tanques', 2, { V: [100, 400, 100], A0: [40, 120, 20], r: [5, 15, 5] },
      function (v) { return 'Un tanque de $' + v.V + '\\ \\text{L}$ tiene inicialmente $' + v.A0 + '\\ \\text{g}$ de sal disuelta. Para lavarlo, se le inyecta agua pura a $' + v.r + '\\ \\text{L/min}$ y la mezcla drena a la misma razón. Escribe la función $A(t)$ de gramos de sal en el minuto $t$.'; },
      function (v) { return v.A0 + '*e^(-' + v.r + '*t/' + v.V + ')'; },
      'Como entra agua pura ($c_{in} = 0$), la ecuación es $A\' + \\frac{r}{V}A = 0$ con $A(0) = A_0$, cuya solución es $A(t) = A_0 e^{-rt/V}$.',
      { exprVars: ['t'], domain: [1, 30],
        mistakes: {
          posExp: function (v) { return v.A0 + '*e^(' + v.r + '*t/' + v.V + ')'; },
          risingForm: function (v) { return v.A0 + '*(1 - e^(-' + v.r + '*t/' + v.V + '))'; }
        },
        feedback: [
          { when: 'posExp', say: 'Casi: como la sal está saliendo del tanque, el exponente debe ser negativo: $-rt/V$.' },
          { when: 'risingForm', say: 'Casi: esa función empieza en $0$; aquí empieza en $A(0) = A_0$ y decae hacia $0$.' }
        ] }),

    N('ta-n-flujo-entrada', 'tanques', 1, { r: [3, 9, 1], c: [0.4, 1.6, 0.2], V: [100, 300, 50] },
      function (v) { return 'A un tanque de $' + v.V + '\\ \\text{L}$ entra salmuera con concentración de $' + v.c + '\\ \\text{g/L}$ a razón de $' + v.r + '\\ \\text{L/min}$ y sale mezcla a la misma razón. Al plantear $A\' + P\\,A = Q$, ¿cuánto vale el término de entrada $Q$ (en g/min)?'; },
      function (v) { return v.r * v.c; },
      'La razón a la que entra sal al tanque es el flujo volumétrico por la concentración de entrada: $Q = r\\,c_{in}$ (en g/min).',
      { unit: 'g/min',
        mistakes: {
          multV: function (v) { return v.V * v.c; },
          divV: function (v) { return v.r * v.c / v.V; }
        },
        feedback: [
          { when: 'multV', say: 'Casi: $V\\,c_{in}$ es la cantidad final de sal en gramos, pero $Q$ es la rapidez de entrada $r\\,c_{in}$ en g/min.' },
          { when: 'divV', say: 'Casi: el término de entrada no se divide entre el volumen $V$; es simplemente $r\\,c_{in}$.' }
        ] }),

    N('ta-n-sal-largo-plazo', 'tanques', 1, { V: [100, 250, 50], c: [0.4, 1.2, 0.2], r: [3, 8, 1], A0: [30, 60, 10] },
      function (v) { return 'Un tanque de $' + v.V + '\\ \\text{L}$ contiene inicialmente $' + v.A0 + '\\ \\text{g}$ de sal. Recibe salmuera con $' + v.c + '\\ \\text{g/L}$ a $' + v.r + '\\ \\text{L/min}$ y drena a $' + v.r + '\\ \\text{L/min}$. ¿A cuántos gramos de sal se aproxima el tanque cuando $t \\to \\infty$?'; },
      function (v) { return v.V * v.c; },
      'En el estado estacionario $A\' = 0$, lo que entra iguala a lo que sale: $r c_{in} = r A/V \\Rightarrow A = V c_{in}$, sin importar $A_0$ ni $r$.',
      { unit: 'g',
        mistakes: {
          plusA0: function (v) { return v.V * v.c + v.A0; },
          rateIn: function (v) { return v.r * v.c; }
        },
        feedback: [
          { when: 'plusA0', say: 'Casi: la sal inicial $A_0$ forma parte del transitorio que se apaga; a la larga toda el agua original fue reemplazada y queda $V\\,c_{in}$.' },
          { when: 'rateIn', say: 'Casi: $r\\,c_{in}$ es la sal que entra por minuto; la cantidad estacionaria en el tanque es $V\\,c_{in}$.' }
        ] }),

    N('ta-n-razon-inicial', 'tanques', 1, { V: [100, 200, 50], A0: [20, 40, 10], c: [0.8, 1.6, 0.2], r: [4, 10, 2] },
      function (v) { return 'Un tanque de $' + v.V + '\\ \\text{L}$ tiene $' + v.A0 + '\\ \\text{g}$ de sal en $t = 0$. Entra salmuera de $' + v.c + '\\ \\text{g/L}$ a $' + v.r + '\\ \\text{L/min}$ y sale mezcla a $' + v.r + '\\ \\text{L/min}$. ¿Cuánto vale la derivada $A\'(0)$ (en g/min) en el instante inicial?'; },
      function (v) { return v.r * v.c - v.r * v.A0 / v.V; },
      'Basta evaluar la propia EDO en $t = 0$: $A\'(0) = r\\,c_{in} - r\\,\\frac{A(0)}{V}$.',
      { unit: 'g/min',
        mistakes: {
          onlyIn: function (v) { return v.r * v.c; },
          plusOut: function (v) { return v.r * v.c + v.r * v.A0 / v.V; }
        },
        feedback: [
          { when: 'onlyIn', say: 'Casi: esa es solo la sal que entra en $t = 0$; falta restar la que sale inicialmente, $r\\,A_0/V$.' },
          { when: 'plusOut', say: 'Casi: la sal que sale del tanque se resta de la que entra, no se suma.' }
        ] }),

    N('ta-n-sal-en-t', 'tanques', 2, { V: [100, 200, 50], A0: [20, 50, 10], c: [0.8, 1.6, 0.4], r: [4, 8, 2], t: [15, 30, 15] },
      function (v) { return 'Un tanque de $' + v.V + '\\ \\text{L}$ empieza con $' + v.A0 + '\\ \\text{g}$ de sal. Entra salmuera con $' + v.c + '\\ \\text{g/L}$ a $' + v.r + '\\ \\text{L/min}$ y sale la mezcla a la misma razón. ¿Cuántos gramos de sal hay en el tanque a los $' + v.t + '$ minutos?'; },
      function (v) { var S = v.V * v.c; return S + (v.A0 - S) * Math.exp(-v.r * v.t / v.V); },
      'Resolviendo $A\' + \\frac{r}{V}A = r c_{in}$ con $A(0) = A_0$ se obtiene $A(t) = Vc_{in} + (A_0 - Vc_{in})e^{-rt/V}$.',
      { unit: 'g',
        mistakes: {
          keptA0: function (v) { var S = v.V * v.c; return S + v.A0 * Math.exp(-v.r * v.t / v.V); },
          onlyLavado: function (v) { return v.A0 * Math.exp(-v.r * v.t / v.V); }
        },
        feedback: [
          { when: 'keptA0', say: 'Casi: la constante que multiplica a la exponencial es $A_0 - Vc_{in}$, no $A_0$.' },
          { when: 'onlyLavado', say: 'Casi: olvidaste sumar el aporte de la sal que entra; eso solo describe la sal inicial que va saliendo.' }
        ] }),

    N('ta-n-concentracion-en-t', 'tanques', 2, { V: [100, 200, 100], c: [0.6, 1.8, 0.3], r: [8, 12, 4], t: [20, 30, 10] },
      function (v) { return 'Un tanque de $' + v.V + '\\ \\text{L}$ contiene inicialmente agua pura. Entra salmuera de $' + v.c + '\\ \\text{g/L}$ a $' + v.r + '\\ \\text{L/min}$ y sale mezcla a $' + v.r + '\\ \\text{L/min}$. ¿Cuál es la <strong>concentración</strong> de sal (en g/L) dentro del tanque a los $' + v.t + '$ minutos?'; },
      function (v) { return v.c * (1 - Math.exp(-v.r * v.t / v.V)); },
      'Como $A(t) = V c_{in}(1 - e^{-rt/V})$, al dividir entre el volumen $V$ la concentración es $C(t) = A(t)/V = c_{in}(1 - e^{-rt/V})$.',
      { unit: 'g/L',
        mistakes: {
          massNotConc: function (v) { return v.V * v.c * (1 - Math.exp(-v.r * v.t / v.V)); },
          decayForm: function (v) { return v.c * Math.exp(-v.r * v.t / v.V); }
        },
        feedback: [
          { when: 'massNotConc', say: 'Casi: calculaste los gramos totales de sal $A(t)$; para obtener la concentración en g/L debes dividir entre el volumen $V$.' },
          { when: 'decayForm', say: 'Casi: como empieza con agua pura, la concentración parte de $0$ y sube según $c_{in}(1 - e^{-rt/V})$.' }
        ] }),

    N('ta-n-lavado-eval', 'tanques', 2, { V: [200, 300, 100], A0: [60, 140, 20], r: [4, 6, 2], t: [10, 20, 10] },
      function (v) { return 'Un tanque de $' + v.V + '\\ \\text{L}$ tiene $' + v.A0 + '\\ \\text{g}$ de sal. Se inyecta agua pura ($c_{in} = 0$) a $' + v.r + '\\ \\text{L/min}$ y sale la mezcla a la misma razón. ¿Cuántos gramos de sal quedan a los $' + v.t + '$ minutos?'; },
      function (v) { return v.A0 * Math.exp(-v.r * v.t / v.V); },
      'Con $c_{in} = 0$, la solución de $A\' + \\frac{r}{V}A = 0$ es $A(t) = A_0 e^{-rt/V}$.',
      { unit: 'g',
        mistakes: {
          rising: function (v) { return v.A0 * (1 - Math.exp(-v.r * v.t / v.V)); },
          divR: function (v) { return v.A0 * Math.exp(-v.t / (v.r * v.V)); }
        },
        feedback: [
          { when: 'rising', say: 'Casi: $A_0(1 - e^{-rt/V})$ es cuánta sal ya salió del tanque; la que queda adentro es $A_0 e^{-rt/V}$.' },
          { when: 'divR', say: 'Casi: en el exponente el flujo $r$ multiplica a $t$: es $-rt/V$, no $-t/(rV)$.' }
        ] }),

    N('ta-n-tiempo-mitad-lavado', 'tanques', 3, { V: [120, 360, 60], r: [3, 9, 3], A0: [40, 100, 20] },
      function (v) { return 'Un tanque de $' + v.V + '\\ \\text{L}$ con $' + v.A0 + '\\ \\text{g}$ de sal se limpia inyectando agua pura a $' + v.r + '\\ \\text{L/min}$ y drenando a la misma razón. ¿Cuántos minutos tardará en reducirse la sal a la mitad ($' + (v.A0 / 2) + '\\ \\text{g}$)?'; },
      function (v) { return (v.V / v.r) * Math.log(2); },
      'De $A_0 e^{-rt/V} = \\frac{1}{2}A_0$ se obtiene $e^{-rt/V} = \\frac{1}{2} \\Rightarrow t = \\frac{V}{r}\\ln 2$.',
      { unit: 'min',
        mistakes: {
          halfTau: function (v) { return 0.5 * (v.V / v.r); },
          noLn2: function (v) { return v.V / v.r; },
          invRatio: function (v) { return (v.r / v.V) * Math.log(2); }
        },
        feedback: [
          { when: 'halfTau', say: 'Casi: el decaimiento es exponencial, no lineal; para que $e^{-rt/V} = 0.5$ debes multiplicar $V/r$ por $\\ln 2 \\approx 0.693$, no por $0.5$.' },
          { when: 'noLn2', say: 'Casi: en $t = V/r$ queda la fracción $e^{-1} \\approx 36.8\\,\\%$; para llegar al $50\\,\\%$ falta multiplicar por $\\ln 2$.' },
          { when: 'invRatio', say: 'Casi: al despejar $t$ de $rt/V = \\ln 2$ queda $t = (V/r)\\ln 2$, con $V$ arriba y $r$ abajo.' }
        ] }),

    N('ta-n-volumen-variable-eval', 'tanques', 3, { V0: [100, 200, 50], c: [1, 3, 1], t: [25, 50, 25] },
      function (v) { return 'Un tanque tiene inicialmente $' + v.V0 + '\\ \\text{L}$ de agua pura ($A(0) = 0$). Entra salmuera con $' + v.c + '\\ \\text{g/L}$ a $2\\ \\text{L/min}$ y sale mezcla a $1\\ \\text{L/min}$, de modo que $V(t) = ' + v.V0 + ' + t$ y $A\' + \\dfrac{1}{' + v.V0 + ' + t}A = ' + (2 * v.c) + '$. ¿Cuántos gramos de sal hay en $t = ' + v.t + '$ min?'; },
      function (v) { var V = v.V0 + v.t; return v.c * (V - v.V0 * v.V0 / V); },
      'El factor integrante es $\\mu(t) = V_0 + t$. Así, $((V_0 + t)A)\' = 2c(V_0 + t) \\Rightarrow (V_0 + t)A = c(V_0 + t)^2 + K$. Con $A(0) = 0$ sale $K = -cV_0^2$.',
      { unit: 'g',
        mistakes: {
          noDivK: function (v) { return v.c * v.t; },
          noK: function (v) { return v.c * (v.V0 + v.t); }
        },
        feedback: [
          { when: 'noDivK', say: 'Casi: al dividir entre el factor integrante $\\mu(t) = V_0 + t$, la constante $K$ también queda dividida entre $V_0 + t$.' },
          { when: 'noK', say: 'Casi: olvidaste la constante de integración $K = -c V_0^2$ necesaria para que $A(0) = 0$.' }
        ] }),

    /* ======================= 6. Circuitos RC y estado estacionario (16) ======================= */
    C('rc-que-es-estacionario', 'estacionario', 1,
      'En la solución $y(t) = y_{est} + C\\,e^{-kt}$ (con $k > 0$) de una ecuación lineal con coeficientes constantes, ¿qué representan las dos partes de la suma?',
      '$y_{est}$ es el estado estacionario al que tiende el sistema cuando $t \\to \\infty$, y $C\\,e^{-kt}$ es el término transitorio que se apaga con el tiempo', [
        ['$y_{est}$ es el valor inicial $y(0)$ y $C\\,e^{-kt}$ es lo que se agrega después', 'Casi: el valor inicial es la suma completa $y(0) = y_{est} + C$; $y_{est}$ es el valor final cuando $t \\to \\infty$.'],
        ['$C\\,e^{-kt}$ es el estado estacionario y $y_{est}$ es el término transitorio', 'Casi: es al revés; «transitorio» significa pasajero, y es el término exponencial $Ce^{-kt}$ el que desaparece cuando $t \\to \\infty$.'],
        ['Ambos términos dependen de la condición inicial $y(0)$', 'Casi: el estado estacionario $y_{est}$ solo depende de la ecuación diferencial; la condición inicial únicamente fija la constante $C$ del transitorio.']],
      'Cuando $t \\to \\infty$, $e^{-kt} \\to 0$ (transitorio se apaga) y la solución se estabiliza en la constante $y_{est}$ (estado estacionario).'),

    C('rc-hallar-sin-integrar', 'estacionario', 1,
      '¿Cómo puedes encontrar rápidamente el estado estacionario constante $y_{est}$ de una ecuación como $y\' + k\\,y = Q_0$ (con $k > 0$ y $Q_0$ constante) sin necesidad de integrar?',
      'Haciendo $y\' = 0$ en la ecuación diferencial y despejando $y_{est} = Q_0 / k$', [
        ['Sustituyendo $t = 0$ en la condición inicial', 'Casi: en $t = 0$ el sistema apenas arranca; el estado estacionario se alcanza cuando ya dejó de cambiar, es decir, cuando $y\' = 0$.'],
        ['Haciendo $y = 0$ y leyendo el valor de $y\'$', 'Casi: hacer $y = 0$ solo da la pendiente al cruzar el eje horizontal, no el valor de equilibrio donde $y$ permanece constante.'],
        ['Multiplicando $k$ por $Q_0$', 'Casi: si $y$ es constante entonces $y\' = 0$, así que de $0 + k\\,y_{est} = Q_0$ se despeja dividiendo: $y_{est} = Q_0 / k$.']],
      'Un estado estacionario constante no cambia con el tiempo, por lo que su derivada es $y\' = 0$ y cumple $k\\,y_{est} = Q_0$.'),

    C('rc-ecuacion-estandar', 'estacionario', 2,
      'Por ley de mallas, la carga $q(t)$ de un circuito RC en serie con una batería $\\varepsilon$ cumple $R\\,\\dfrac{dq}{dt} + \\dfrac{q}{C} = \\varepsilon$. Al pasarla a forma estándar, ¿cuáles son $P(t)$ y el factor integrante $\\mu(t)$?',
      '$P(t) = \\dfrac{1}{RC}$ y $\\mu(t) = e^{t/(RC)}$', [
        ['$P(t) = \\dfrac{1}{C}$ y $\\mu(t) = e^{t/C}$', 'Casi: olvidaste dividir toda la ecuación entre la resistencia $R$ que multiplica a $dq/dt$.'],
        ['$P(t) = RC$ y $\\mu(t) = e^{RC\\,t}$', 'Casi: al dividir $\\frac{1}{C}q$ entre $R$ tanto $R$ como $C$ quedan en el denominador: $P = \\frac{1}{RC}$.'],
        ['$P(t) = -\\dfrac{1}{RC}$ y $\\mu(t) = e^{-t/(RC)}$', 'Casi: en forma estándar $q\' + \\frac{1}{RC}q = \\frac{\\varepsilon}{R}$ el coeficiente de $q$ es positivo; el signo menos aparece hasta despejar $q$.']],
      'Dividiendo entre $R$ queda $q\' + \\frac{1}{RC}q = \\frac{\\varepsilon}{R}$, por lo que $P = \\frac{1}{RC}$ y $\\mu(t) = e^{t/(RC)}$.'),

    C('rc-efecto-condicion-inicial', 'estacionario', 2,
      'Dos capacitores idénticos se conectan a través de resistencias iguales $R$ a baterías iguales $\\varepsilon$, pero el primero empieza descargado ($q(0) = 0$) y el segundo ya tenía carga inicial $q(0) = q_0$. ¿En qué coinciden sus soluciones $q(t)$?',
      'Tienen exactamente el mismo estado estacionario $C\\varepsilon$ y la misma constante de tiempo $\\tau = RC$; solo cambia el coeficiente del transitorio', [
        ['El segundo capacitor llega a una carga final estacionaria igual a $C\\varepsilon + q_0$', 'Casi: la carga inicial no se suma al estado estacionario; cuando $t \\to \\infty$ ambos capacitores terminan con la misma carga $C\\varepsilon$.'],
        ['El segundo capacitor tiene una constante de tiempo $\\tau$ más corta', 'Casi: la constante de tiempo $\\tau = RC$ solo depende de la resistencia y la capacitancia del circuito, no de $q(0)$.'],
        ['Sus soluciones no coinciden en nada porque parten de puntos iniciales distintos', 'Casi: ambas satisfacen la misma EDO, así que comparten tanto $\\tau = RC$ como el equilibrio $q_{est} = C\\varepsilon$.']],
      'En $q(t) = C\\varepsilon + (q_0 - C\\varepsilon)e^{-t/RC}$, la condición inicial $q_0$ solo modifica la amplitud del término transitorio.'),

    C('rc-unidades-kom-uf', 'estacionario', 2,
      'En la ecuación del circuito RC, si la resistencia $R$ está en $\\text{k}\\Omega$ ($10^3\\ \\Omega$), la capacitancia $C$ en $\\mu\\text{F}$ ($10^{-6}\\ \\text{F}$) y la fem $\\varepsilon$ en $\\text{V}$, ¿en qué unidades salen directamente $\\tau = RC$ y la carga final $q_{est} = C\\varepsilon$?',
      '$\\tau$ sale en milisegundos ($\\text{ms}$) y $q_{est}$ en microcoulombs ($\\mu\\text{C}$)', [
        ['$\\tau$ sale en segundos ($\\text{s}$) y $q_{est}$ en coulombs ($\\text{C}$)', 'Casi: $10^3\\ \\Omega \\times 10^{-6}\\ \\text{F} = 10^{-3}\\ \\text{s} = 1\\ \\text{ms}$, y $10^{-6}\\ \\text{F} \\times 1\\ \\text{V} = 10^{-6}\\ \\text{C} = 1\\ \\mu\\text{C}$.'],
        ['$\\tau$ sale en microsegundos ($\\mu\\text{s}$) y $q_{est}$ en milicoulombs ($\\text{mC}$)', 'Casi: el prefijo kilo ($10^3$) de $R$ cancela tres potencias del micro ($10^{-6}$) de $C$, dejando $10^{-3}\\ \\text{s} = \\text{ms}$ para $\\tau$.'],
        ['No son compatibles; siempre es obligatorio convertir primero a $\\Omega$ y $\\text{F}$', 'Casi: sí son compatibles entre sí siempre que midas el tiempo $t$ en $\\text{ms}$ y la carga $q$ en $\\mu\\text{C}$.']],
      'Como $1\\ \\text{k}\\Omega \\cdot 1\\ \\mu\\text{F} = 10^3 \\cdot 10^{-6}\\ \\text{s} = 1\\ \\text{ms}$ y $1\\ \\mu\\text{F}\\cdot 1\\ \\text{V} = 1\\ \\mu\\text{C}$, las unidades $(\\text{k}\\Omega, \\mu\\text{F}, \\text{V}, \\text{ms}, \\mu\\text{C})$ forman un sistema consistente.'),

    C('rc-corriente-derivada', 'estacionario', 3,
      'Para un capacitor que se carga desde $q(0) = 0$ según $q(t) = C\\varepsilon\\left(1 - e^{-t/(RC)}\\right)$, ¿cómo se comporta la corriente $i(t) = q\'(t)$?',
      'Vale $i(t) = \\dfrac{\\varepsilon}{R}\\,e^{-t/(RC)}$: es puramente transitoria, arranca en $\\varepsilon/R$ y decae a $0$ cuando el capacitor se llena', [
        ['Vale $i(t) = \\dfrac{\\varepsilon}{R}\\left(1 - e^{-t/(RC)}\\right)$, subiendo desde $0$ hasta $\\varepsilon/R$', 'Casi: esa es la forma de la carga $q(t)$ (o de la corriente en un inductor RL); en el capacitor RC la corriente es máxima al inicio y termina en $0$.'],
        ['Vale $i(t) = C\\varepsilon\\,e^{-t/(RC)}$, porque la derivada de $e^{-t/(RC)}$ no saca ningún factor', 'Casi: olvidaste la regla de la cadena; al derivar respecto a $t$ sale un factor $1/(RC)$ que cancela la $C$ y deja $\\varepsilon/R$.'],
        ['Es constante e igual a $\\varepsilon/R$ durante todo el proceso de carga', 'Casi: conforme el capacitor acumula carga se opone al paso de corriente, así que $i(t)$ disminuye exponencialmente.']],
      'Derivando $q(t)$ respecto a $t$ por la regla de la cadena resulta $q\'(t) = C\\varepsilon \\cdot \\frac{1}{RC}e^{-t/(RC)} = \\frac{\\varepsilon}{R}e^{-t/(RC)}$.'),

    E('rc-e-carga-cero', 'estacionario', 2, { R: [2, 5, 1], Cap: [2, 4, 1], E: [6, 18, 6] },
      function (v) { return 'Un circuito RC en serie tiene $R = ' + v.R + '\\ \\text{k}\\Omega$, $C = ' + v.Cap + '\\ \\mu\\text{F}$ y una batería de $\\varepsilon = ' + v.E + '\\ \\text{V}$. Si el capacitor empieza descargado ($q(0) = 0$), escribe la función $q(t)$ (en $\\mu\\text{C}$, con $t$ en $\\text{ms}$).'; },
      function (v) { var qf = v.Cap * v.E, tau = v.R * v.Cap; return qf + '*(1 - e^(-t/' + tau + '))'; },
      'De $q\' + \\frac{1}{RC}q = \\frac{\\varepsilon}{R}$ con $q(0) = 0$ se obtiene $q(t) = C\\varepsilon(1 - e^{-t/(RC)})$.',
      { exprVars: ['t'], domain: [1, 25],
        mistakes: {
          decayForm: function (v) { var qf = v.Cap * v.E, tau = v.R * v.Cap; return qf + '*e^(-t/' + tau + ')'; },
          multTau: function (v) { var qf = v.Cap * v.E, tau = v.R * v.Cap; return qf + '*(1 - e^(-' + tau + '*t))'; }
        },
        feedback: [
          { when: 'decayForm', say: 'Casi: esa es la descarga; cuando empieza en $q(0) = 0$ la carga sube según $C\\varepsilon(1 - e^{-t/RC})$.' },
          { when: 'multTau', say: function (v) { return 'Casi: en el exponente el tiempo $t$ se divide entre la constante de tiempo $\\tau = RC = ' + (v.R * v.Cap) + '$, no se multiplica.'; } }
        ] }),

    E('rc-e-carga-con-q0', 'estacionario', 2, { R: [2, 4, 1], Cap: [2, 5, 1], E: [10, 20, 5], q0: [5, 15, 5] },
      function (v) { return 'En un circuito RC con $R = ' + v.R + '\\ \\text{k}\\Omega$, $C = ' + v.Cap + '\\ \\mu\\text{F}$ y $\\varepsilon = ' + v.E + '\\ \\text{V}$, el capacitor tiene una carga inicial $q(0) = ' + v.q0 + '\\ \\mu\\text{C}$. Escribe la función $q(t)$ (en $\\mu\\text{C}$, con $t$ en $\\text{ms}$).'; },
      function (v) { var qf = v.Cap * v.E, tau = v.R * v.Cap; return qf + ' + (' + v.q0 + ' - ' + qf + ')*e^(-t/' + tau + ')'; },
      'La solución general es $q(t) = C\\varepsilon + K e^{-t/(RC)}$, y con $q(0) = q_0$ la amplitud del transitorio es $K = q_0 - C\\varepsilon$.',
      { exprVars: ['t'], domain: [1, 25],
        mistakes: {
          keptQ0: function (v) { var qf = v.Cap * v.E, tau = v.R * v.Cap; return qf + ' + ' + v.q0 + '*e^(-t/' + tau + ')'; },
          noSteady: function (v) { var tau = v.R * v.Cap; return v.q0 + '*e^(-t/' + tau + ')'; }
        },
        feedback: [
          { when: 'keptQ0', say: function (v) { return 'Casi: en $t = 0$ tienes $C\\varepsilon + K = ' + v.q0 + '$, así que $K = ' + (v.q0 - v.Cap * v.E) + '$, no $' + v.q0 + '$.'; } },
          { when: 'noSteady', say: 'Casi: olvidaste el estado estacionario $C\\varepsilon$ que aporta la batería.' }
        ] }),

    N('rc-n-carga-max', 'estacionario', 1, { R: [2, 6, 1], Cap: [3, 8, 1], E: [6, 18, 6] },
      function (v) { return 'Un circuito RC tiene $R = ' + v.R + '\\ \\text{k}\\Omega$, $C = ' + v.Cap + '\\ \\mu\\text{F}$ y una fem constante $\\varepsilon = ' + v.E + '\\ \\text{V}$. ¿Cuál es la carga estacionaria (en $\\mu\\text{C}$) a la que tiende el capacitor cuando $t \\to \\infty$?'; },
      function (v) { return v.Cap * v.E; },
      'En el estado estacionario $q\' = 0$, la ecuación $Rq\' + q/C = \\varepsilon$ da directamente $q_{est} = C\\varepsilon$.',
      { unit: 'μC',
        where: function (v) { return v.Cap !== v.R; },
        mistakes: {
          divR: function (v) { return v.E / v.R; },
          multAll: function (v) { return v.R * v.Cap * v.E; }
        },
        feedback: [
          { when: 'divR', say: 'Casi: $\\varepsilon/R$ es la corriente inicial, no la carga final $C\\varepsilon$.' },
          { when: 'multAll', say: 'Casi: la carga final es $C\\varepsilon$; no lleva multiplicada la resistencia $R$.' }
        ] }),

    N('rc-n-tau', 'estacionario', 1, { R: [2, 7, 1], Cap: [3, 8, 1], E: [6, 18, 6] },
      function (v) { return 'Para la ecuación diferencial $' + v.R + '\\,q\' + \\dfrac{q}{' + v.Cap + '} = ' + v.E + '$ de un circuito RC (con $R$ en $\\text{k}\\Omega$, $C$ en $\\mu\\text{F}$ y $t$ en $\\text{ms}$), ¿cuánto vale la constante de tiempo $\\tau = RC$ (en $\\text{ms}$)?'; },
      function (v) { return v.R * v.Cap; },
      'Al pasar a forma estándar $q\' + \\frac{1}{RC}q = \\frac{\\varepsilon}{R}$, el exponente es $-t/\\tau$ con constante de tiempo $\\tau = RC$.',
      { unit: 'ms',
        mistakes: {
          invTau: function (v) { return 1 / (v.R * v.Cap); },
          ratioRC: function (v) { return v.R / v.Cap; }
        },
        feedback: [
          { when: 'invTau', say: 'Casi: $1/(RC)$ es el coeficiente $P$ de $q$ en la forma estándar; la constante de tiempo es su recíproco $\\tau = RC$.' },
          { when: 'ratioRC', say: 'Casi: en un circuito RC la constante de tiempo es el producto $R\\cdot C$, no el cociente.' }
        ] }),

    N('rc-n-carga-en-t', 'estacionario', 2, { R: [2, 3, 1], Cap: [2, 3, 1], E: [6, 18, 6], t: [8, 12, 2] },
      function (v) { return 'Un circuito RC tiene $R = ' + v.R + '\\ \\text{k}\\Omega$, $C = ' + v.Cap + '\\ \\mu\\text{F}$ y una fem de $' + v.E + '\\ \\text{V}$. Si el capacitor inicia descargado, ¿qué carga (en $\\mu\\text{C}$) almacena a los $' + v.t + '\\ \\text{ms}$?'; },
      function (v) { return v.Cap * v.E * (1 - Math.exp(-v.t / (v.R * v.Cap))); },
      'Evaluando la solución $q(t) = C\\varepsilon(1 - e^{-t/(RC)})$ en $t$ milisegundos se obtiene la carga en $\\mu\\text{C}$.',
      { unit: 'μC',
        where: function (v) { return v.t > v.R * v.Cap; },
        mistakes: {
          discharge: function (v) { return v.Cap * v.E * Math.exp(-v.t / (v.R * v.Cap)); },
          plusExp: function (v) { return v.Cap * v.E * (1 + Math.exp(-v.t / (v.R * v.Cap))); }
        },
        feedback: [
          { when: 'discharge', say: 'Casi: usaste $C\\varepsilon e^{-t/RC}$ (descarga) en lugar de $C\\varepsilon(1 - e^{-t/RC})$.' },
          { when: 'plusExp', say: 'Casi: como empieza en $q(0) = 0$, el transitorio resta al estado estacionario: $C\\varepsilon(1 - e^{-t/RC})$.' }
        ] }),

    N('rc-n-transitorio-en-t', 'estacionario', 2, { k: [2, 4, 1], s: [15, 30, 5], y0: [45, 75, 10] },
      function (v) { var kk = v.k / 10, b = +(kk * v.s).toFixed(2); return 'Descompón la solución del PVI $y\' + ' + kk + 'y = ' + b + '$ con $y(0) = ' + v.y0 + '$ en estado estacionario más transitorio: $y(t) = y_{est} + y_{tr}(t)$. ¿Cuánto vale únicamente la parte <strong>transitoria</strong> $y_{tr}(5)$ en $t = 5$?'; },
      function (v) { return (v.y0 - v.s) * Math.exp(-0.5 * v.k); },
      'El estado estacionario es $y_{est} = b/k = s$ y el transitorio es $y_{tr}(t) = (y_0 - s)e^{-kt}$, que se evalúa en $t = 5$.',
      { mistakes: {
          fullSol: function (v) { return v.s + (v.y0 - v.s) * Math.exp(-0.5 * v.k); },
          cIsY0: function (v) { return v.y0 * Math.exp(-0.5 * v.k); }
        },
        feedback: [
          { when: 'fullSol', say: function (v) { return 'Casi: esa es la solución completa $y(5)$; te piden únicamente la parte transitoria $y_{tr}(5)$ sin sumar $y_{est} = ' + v.s + '$.'; } },
          { when: 'cIsY0', say: function (v) { return 'Casi: el coeficiente del transitorio es $y(0) - y_{est} = ' + (v.y0 - v.s) + '$, no $y(0) = ' + v.y0 + '$.'; } }
        ] }),

    N('rc-n-carga-con-q0-eval', 'estacionario', 2, { R: [2, 3, 1], Cap: [3, 4, 1], E: [10, 15, 5], q0: [8, 16, 4], t: [6, 9, 3] },
      function (v) { return 'En un circuito RC con $R = ' + v.R + '\\ \\text{k}\\Omega$, $C = ' + v.Cap + '\\ \\mu\\text{F}$ y $\\varepsilon = ' + v.E + '\\ \\text{V}$, el capacitor ya tiene $q(0) = ' + v.q0 + '\\ \\mu\\text{C}$ al cerrar el interruptor. ¿Qué carga (en $\\mu\\text{C}$) tiene en $t = ' + v.t + '\\ \\text{ms}$?'; },
      function (v) { var qf = v.Cap * v.E; return qf + (v.q0 - qf) * Math.exp(-v.t / (v.R * v.Cap)); },
      'La solución es $q(t) = C\\varepsilon + (q_0 - C\\varepsilon)e^{-t/(RC)}$, sumando el estado estacionario y el transitorio.',
      { unit: 'μC',
        mistakes: {
          asIfZero: function (v) { var qf = v.Cap * v.E; return qf * (1 - Math.exp(-v.t / (v.R * v.Cap))); },
          keptQ0: function (v) { var qf = v.Cap * v.E; return qf + v.q0 * Math.exp(-v.t / (v.R * v.Cap)); }
        },
        feedback: [
          { when: 'asIfZero', say: function (v) { return 'Casi: usaste la fórmula para $q(0) = 0$, ignorando la carga inicial de $' + v.q0 + '\\ \\mu\\text{C}$.'; } },
          { when: 'keptQ0', say: function (v) { return 'Casi: la constante que multiplica a la exponencial es $q_0 - C\\varepsilon = ' + (v.q0 - v.Cap * v.E) + '$, no $q_0$.'; } }
        ] }),

    N('rc-n-enfriamiento-est', 'estacionario', 2, { Ta: [20, 26, 2], T0: [70, 90, 10], k: [1, 2, 1] },
      function (v) { var kk = v.k / 10, rhs = +(kk * v.Ta).toFixed(2); return 'La temperatura $T(t)$ (en °C, con $t$ en min) de una pieza cumple la ecuación lineal $T\' + ' + kk + 'T = ' + rhs + '$ con $T(0) = ' + v.T0 + '$ °C. ¿Cuánto vale la temperatura en $t = 10\\ \\text{min}$?'; },
      function (v) { return v.Ta + (v.T0 - v.Ta) * Math.exp(-v.k); },
      'El estado estacionario es $T_{est} = (k T_a)/k = T_a$ y la solución es $T(t) = T_a + (T_0 - T_a)e^{-kt}$; en $t = 10$ el exponente es $-10(k/10) = -k$.',
      { unit: '°C',
        mistakes: {
          cIsT0: function (v) { return v.Ta + v.T0 * Math.exp(-v.k); },
          noSteady: function (v) { return v.T0 * Math.exp(-v.k); }
        },
        feedback: [
          { when: 'cIsT0', say: function (v) { return 'Casi: la amplitud del transitorio es $T_0 - T_{est} = ' + (v.T0 - v.Ta) + '$, no $T_0 = ' + v.T0 + '$.'; } },
          { when: 'noSteady', say: function (v) { return 'Casi: la pieza no se enfría hacia $0$ °C, sino hacia la temperatura estacionaria $' + v.Ta + '$ °C.'; } }
        ] }),

    N('rc-n-tiempo-fraccion', 'estacionario', 3, { R: [2, 5, 1], Cap: [2, 5, 1], p: [60, 80, 10], E: [10, 20, 5] },
      function (v) { return 'Un capacitor inicialmente descargado se conecta en serie con $R = ' + v.R + '\\ \\text{k}\\Omega$, $C = ' + v.Cap + '\\ \\mu\\text{F}$ y una batería de $' + v.E + '\\ \\text{V}$. ¿En cuántos milisegundos alcanza el $' + v.p + '\\,\\%$ de su carga máxima $C\\varepsilon$?'; },
      function (v) { return -v.R * v.Cap * Math.log(1 - v.p / 100); },
      'De $1 - e^{-t/(RC)} = p/100$ se despeja $e^{-t/(RC)} = 1 - p/100 \\Rightarrow t = -RC\\,\\ln(1 - p/100)$.',
      { unit: 'ms',
        mistakes: {
          lnP: function (v) { return -v.R * v.Cap * Math.log(v.p / 100); },
          linearTime: function (v) { return v.R * v.Cap * (v.p / 100); }
        },
        feedback: [
          { when: 'lnP', say: function (v) { return 'Casi: en el logaritmo va la fracción que falta por cargar, $1 - ' + (v.p / 100) + ' = ' + ((100 - v.p) / 100) + '$, no $' + (v.p / 100) + '$.'; } },
          { when: 'linearTime', say: 'Casi: la carga no sube linealmente con el tiempo; hay que despejar $t$ de la exponencial usando logaritmo natural.' }
        ] }),

    N('rc-n-caida-velocidad-terminal', 'estacionario', 3, { m: [2, 4, 1], b: [6, 10, 2], t: [1, 2, 1] },
      function (v) { return 'Un objeto de masa $m = ' + v.m + '\\ \\text{kg}$ cae desde el reposo ($v(0) = 0$) bajo la gravedad ($g = 9.81\\ \\text{m/s}^2$) y una resistencia del aire proporcional a la velocidad, cumpliendo $' + v.m + '\\,v\' + ' + v.b + '\\,v = ' + (v.m * 9.81).toFixed(2) + '$. ¿Qué rapidez (en m/s) tiene a los $' + v.t + '\\ \\text{s}$?'; },
      function (v) { var vt = v.m * 9.81 / v.b; return vt * (1 - Math.exp(-v.b * v.t / v.m)); },
      'En forma estándar $v\' + \\frac{b}{m}v = g$, con estado estacionario (velocidad terminal) $v_{est} = \\frac{mg}{b}$ y solución $v(t) = \\frac{mg}{b}(1 - e^{-bt/m})$.',
      { unit: 'm/s',
        mistakes: {
          noDivM: function (v) { var vt = 9.81 / v.b; return vt * (1 - Math.exp(-v.b * v.t)); },
          freeFall: function (v) { return 9.81 * v.t; }
        },
        feedback: [
          { when: 'noDivM', say: function (v) { return 'Casi: olvidaste dividir entre la masa $m = ' + v.m + '\\ \\text{kg}$ al pasar a la forma estándar $v\' + (b/m)v = g$.'; } },
          { when: 'freeFall', say: 'Casi: $g\\,t$ es caída libre sin rozamiento; aquí el término $+bv$ frena al objeto hacia su velocidad terminal $mg/b$.' }
        ] })
  ];

  K.register(SUBTEMAS, Q);
})();
