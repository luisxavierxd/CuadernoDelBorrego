/* =====================================================================
   Banco · Cálculo 3 · S07 · Reducibles a exactas: factores integrantes
   μ(x) y μ(y).
   100 preguntas propias (source: 'propia').
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c3', '07');

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
    o = o || {};
    return K.E(id, sub, d, vars, prompt, answer, why, o);
  }

  var SUBTEMAS = {
    'c3.S07.condicion': 'Condición y necesidad de factor integrante',
    'c3.S07.mux': 'Factor integrante en x, μ(x)',
    'c3.S07.muy': 'Factor integrante en y, μ(y)',
    'c3.S07.potencial': 'Función potencial y solución general',
    'c3.S07.pvi': 'Problemas de valor inicial y evaluación',
    'c3.S07.lineales': 'Conexión con lineales y casos especiales'
  };

  var Q = [
    /* ======================= 1. Condición y necesidad de factor integrante (16) ======================= */
    C('con-c-que-es-mu', 'condicion', 1,
      '¿Qué es un factor integrante $\\mu(x, y)$ para una ecuación diferencial de primer orden $M(x, y)\\,dx + N(x, y)\\,dy = 0$ que no es exacta?',
      'Una función no nula tal que la ecuación multiplicada $(\\mu M)\\,dx + (\\mu N)\\,dy = 0$ resulta exacta', [
        ['La suma algebraica $M(x, y) + N(x, y)$ igualada a cero', 'Casi: el factor integrante multiplica a los coeficientes de la ecuación, no se suma a ellos.'],
        ['La solución general $y(x)$ de la ecuación diferencial', 'Casi: $\\mu$ es una herramienta auxiliar para volver exacta la ecuación, no la solución $y(x)$.'],
        ['Una constante que anula las derivadas parciales de $M$ y $N$', 'Casi: en general $\\mu$ depende de las variables y busca igualar las derivadas cruzadas, no anularlas.']],
      'Un factor integrante es una función que, al multiplicar a ambos lados de la ecuación, hace que se cumpla la condición de exactitud $\\partial_y(\\mu M) = \\partial_x(\\mu N)$.'),

    C('con-c-condicion-derivadas', 'condicion', 1,
      'Para que la forma multiplicada $(\\mu M)\\,dx + (\\mu N)\\,dy = 0$ sea exacta, ¿qué igualdad de derivadas parciales debe cumplirse?',
      '$\\dfrac{\\partial}{\\partial y}(\\mu M) = \\dfrac{\\partial}{\\partial x}(\\mu N)$', [
        ['$\\dfrac{\\partial}{\\partial x}(\\mu M) = \\dfrac{\\partial}{\\partial y}(\\mu N)$', 'Casi: la derivada con respecto a $x$ va con el coeficiente de $dy$, y la derivada con respecto a $y$ va con el coeficiente de $dx$.'],
        ['$\\dfrac{\\partial M}{\\partial y} + \\dfrac{\\partial N}{\\partial x} = \\mu$', 'Casi: la condición de exactitud iguala las derivadas cruzadas del campo multiplicado, no su suma.'],
        ['$\\mu\\left(\\dfrac{\\partial M}{\\partial x} - \\dfrac{\\partial N}{\\partial y}\\right) = 0$', 'Casi: las derivadas cruzadas son $\\partial_y M$ y $\\partial_x N$, no $\\partial_x M$ y $\\partial_y N$.']],
      'Por el teorema de Clairaut-Schwarz, una forma diferencial es exacta cuando la derivada respecto a $y$ del término en $dx$ coincide con la derivada respecto a $x$ del término en $dy$.'),

    C('con-c-por-que-no-cambia-sol', 'condicion', 1,
      '¿Por qué multiplicar una ecuación $M\\,dx + N\\,dy = 0$ por un factor integrante $\\mu(x, y) \\neq 0$ no altera sus curvas solución?',
      'Porque en los puntos donde $\\mu \\neq 0$, la igualdad $M + N\\,y\' = 0$ es equivalente a $\\mu(M + N\\,y\') = 0$', [
        ['Porque $\\mu$ es siempre una constante numérica independiente de las variables', 'Casi: $\\mu$ usualmente depende de $x$ o de $y$; la equivalencia proviene de multiplicar una igualdad por un factor no nulo.'],
        ['Porque el factor integrante cancela todas las constantes de integración', 'Casi: el factor integrante no cancela constantes; permite encontrar la función potencial $F(x,y)=C$.'],
        ['Porque convierte la ecuación diferencial en una identidad puramente algebraica', 'Casi: la ecuación sigue siendo una ecuación diferencial, solo que ahora es exacta.']],
      'Multiplicar ambos lados de una ecuación por una función que no se anula preserva el conjunto de soluciones; solo hay que revisar posibles soluciones en los cortes donde $\\mu = 0$.'),

    C('con-c-edo-parciales-mu', 'condicion', 1,
      'Al desarrollar $\\partial_y(\\mu M) = \\partial_x(\\mu N)$ con la regla del producto, ¿qué tipo de ecuación surge en general para $\\mu(x, y)$?',
      'Una ecuación en derivadas parciales $M\\,\\dfrac{\\partial \\mu}{\\partial y} - N\\,\\dfrac{\\partial \\mu}{\\partial x} = \\mu(N_x - M_y)$', [
        ['Una ecuación algebraica de segundo grado para $\\mu$', 'Casi: intervienen las derivadas parciales de $\\mu$, por lo que es una ecuación diferencial en derivadas parciales.'],
        ['Una ecuación diferencial ordinaria de segundo orden en $x$', 'Casi: como $\\mu$ puede depender de $x$ y de $y$, intervienen derivadas parciales respecto a ambas variables.'],
        ['Una integral definida que siempre evalúa a una constante', 'Casi: hallar $\\mu$ en el caso general involucra resolver una EDP de primer orden.']],
      'La regla del producto produce $M\\,\\mu_y + \\mu M_y = N\\,\\mu_x + \\mu N_x$, que es una EDP de primer orden en las variables independientes $x$ y $y$.'),

    C('con-c-cuando-buscar-mu', 'condicion', 1,
      '¿En qué situación metodológica tiene sentido buscar un factor integrante $\\mu(x)$ o $\\mu(y)$?',
      'Cuando la ecuación $M\\,dx + N\\,dy = 0$ no es exacta ($M_y \\neq N_x$) y no se resuelve más fácil por separación directa', [
        ['Únicamente cuando la ecuación ya es exacta con $M_y = N_x$', 'Casi: si ya es exacta, no hace falta ningún factor integrante nuevo (o equivale a $\\mu = 1$).'],
        ['Solo si la ecuación es lineal con coeficientes estrictamente constantes', 'Casi: el método de factores integrantes aplica a muchas familias no lineales escritas en forma diferencial.'],
        ['Siempre que queramos eliminar el término $dy$ de la ecuación diferencial', 'Casi: el factor integrante no elimina ningún término diferencial, solo ajusta los coeficientes.']],
      'El factor integrante se busca cuando $M_y \\neq N_x$ para transformar la ecuación en una exacta sin alterar las trayectorias de sus soluciones.'),

    C('con-c-analogia-mapa', 'condicion', 1,
      'En la lección se usa la analogía de un mapa en una hoja de hule estirada de forma dispareja. ¿Qué representa el factor integrante en esa analogía?',
      '«Desestirar» la hoja para que las curvas de nivel recuperen alturas y pendientes de una verdadera función potencial', [
        ['Dibujar curvas de nivel completamente nuevas que no existían en el mapa original', 'Casi: las curvas solución nunca cambian; solo se recupera la función potencial $F$ correcta.'],
        ['Borrar las zonas del mapa donde la pendiente del terreno es negativa', 'Casi: no se borra ninguna zona; el factor integrante opera en todo el dominio de interés.'],
        ['Cambiar las coordenadas rectangulares a coordenadas polares en el plano', 'Casi: no es una transformación de coordenadas del plano, sino un escalamiento de la forma diferencial.']],
      'Multiplicar por $\\mu$ no cambia las trayectorias de las soluciones en el plano; solo acomoda la forma diferencial para que sea el gradiente de una función potencial $F$.'),

    C('con-c-constante-en-mu', 'condicion', 1,
      '¿Por qué no es necesario añadir una constante arbitraria $+ C$ al exponente cuando calculamos $\\mu = e^{\\int \\dots}$?',
      'Porque cualquier múltiplo constante $c\\,\\mu$ (con $c \\neq 0$) también es un factor integrante, y basta tomar $c = 1$', [
        ['Porque el valor de la integral siempre resulta ser estrictamente entero', 'Casi: la integral puede ser cualquier función; no tiene que arrojar enteros.'],
        ['Porque la constante $+ C$ provocaría que la ecuación multiplicada dejara de ser exacta', 'Casi: multiplicar una ecuación exacta por una constante no nula produce otra ecuación exacta.'],
        ['Porque la derivada de cualquier función cancela automáticamente las constantes', 'Casi: la derivada de una constante es cero, pero aquí elegimos la función más simple fijando la constante de integración en cero.']],
      'Si $\\mu$ vuelve exacta a la ecuación, $k\\mu$ también lo hace para cualquier constante $k \\neq 0$; por comodidad se toma la constante en cero ($k = 1$).'),

    C('con-c-signo-y-abs', 'condicion', 1,
      'Al integrar $\\int \\frac{1}{x}\\,dx = \\ln|x|$, ¿por qué suele omitirse el valor absoluto y tomarse simplemente $\\mu(x) = x$?',
      'Porque en un intervalo con $x > 0$ es $x$, y en $x < 0$ el signo global $-1$ multiplica toda la ecuación y se absorbe en el cero', [
        ['Porque la función logaritmo natural solo está definida para números reales positivos', 'Casi: $\\ln|x|$ está definida tanto para $x > 0$ como para $x < 0$.'],
        ['Porque el valor absoluto de una función siempre es idénticamente igual a $1$', 'Casi: $|x|$ no es $1$, es $x$ para $x > 0$ y $-x$ para $x < 0$.'],
        ['Porque las ecuaciones diferenciales solo tienen sentido físico cuando $x = 0$', 'Casi: en $x = 0$ suele haber singularidades; la ecuación se estudia en intervalos abiertos.']],
      'En un intervalo conexo donde $x$ no cruza el cero, elegir $\\mu = x$ o $\\mu = -x$ produce exactamente la misma ecuación igualada a cero.'),

    C('con-c-soluciones-singulares-mu', 'condicion', 1,
      'Si un factor integrante es $\\mu(x) = x$, ¿qué precaución teórica debe tenerse respecto a los puntos donde $x = 0$?',
      'Revisar por separado si $x = 0$ es una solución adicional o una frontera donde la ecuación original se indefine', [
        ['Ninguna, porque una función polinomial nunca se anula en los números reales', 'Casi: $x = 0$ claramente anula a $\\mu(x) = x$.'],
        ['La ecuación deja de tener soluciones válidas en cualquier otro cuadrante del plano', 'Casi: las soluciones fuera de $x = 0$ siguen siendo completamente válidas.'],
        ['Debe descartarse el método y utilizarse exclusivamente series de potencias', 'Casi: el método es válido en cualquier intervalo que no contenga el corte o singularidad.']],
      'Al multiplicar por $\\mu$, los lugares donde $\\mu = 0$ o donde $\\mu$ no está definido requieren inspección independiente para no introducir ni perder soluciones.'),

    C('con-c-orden-resta-mn', 'condicion', 1,
      'Al probar si existe un factor integrante de una sola variable, ¿cuál es la regla mnemotécnica para el orden de la resta y el divisor?',
      'Para $\\mu(x)$ es $\\dfrac{M_y - N_x}{N}$; para $\\mu(y)$ es $\\dfrac{N_x - M_y}{M}$ (se invierte el orden y se divide entre el otro término)', [
        ['Para $\\mu(x)$ es $\\dfrac{N_x - M_y}{N}$ y para $\\mu(y)$ es $\\dfrac{M_y - N_x}{M}$', 'Casi: los signos están invertidos; para $\\mu(x)$ la derivada $M_y$ va primero.'],
        ['En ambos casos se divide siempre entre la suma $M + N$ con signo positivo', 'Casi: para $\\mu(x)$ se divide entre $N$ y para $\\mu(y)$ entre $M$.'],
        ['Para $\\mu(x)$ se divide entre $M$, y para $\\mu(y)$ se divide entre $N$', 'Casi: es al revés; el divisor es el coeficiente de la otra variable en la forma diferencial.']],
      'Derivando $\\mu(x)N$ respecto a $x$ surge $\\mu\' N$, por lo que se divide entre $N$. Con $\\mu(y)M$ respecto a $y$ surge $\\mu\' M$, por lo que se divide entre $M$.'),

    C('con-c-simplificar-antes', 'condicion', 2,
      'Un estudiante calcula el cociente $\\dfrac{M_y - N_x}{N} = \\dfrac{2x + 2y}{x^2 + xy}$. ¿Depende esta expresión solo de $x$?',
      'Sí, porque al factorizar $x(x + y)$ en el denominador se cancela $(x + y)$ y queda $\\dfrac{2}{x}$', [
        ['No, porque tanto en el numerador como en el denominador aparece explícitamente la variable $y$', 'Casi: hay que simplificar primero; tras la cancelación el término con $y$ desaparece por completo.'],
        ['No, porque para depender solo de $x$ el numerador debe ser una constante numérica pura', 'Casi: puede ser cualquier función de $x$; en este caso queda $2/x$.'],
        ['Sí, pero únicamente sobre la recta particular donde $y = 0$', 'Casi: la simplificación algebraica es válida en todo punto donde $x + y \\neq 0$.']],
      'Siempre simplifica antes de decidir: $\\frac{2(x+y)}{x(x+y)} = \\frac{2}{x}$, que depende exclusivamente de la variable $x$.'),

    C('con-c-si-ninguna-sirve', 'condicion', 2,
      'Si ni $\\dfrac{M_y - N_x}{N}$ depende solo de $x$, ni $\\dfrac{N_x - M_y}{M}$ depende solo de $y$, ¿qué se puede afirmar sobre la ecuación?',
      'No admite un factor integrante que dependa exclusivamente de una sola variable ($x$ o $y$ por separado)', [
        ['La ecuación diferencial carece de soluciones matemáticas en cualquier intervalo', 'Casi: la ecuación puede tener soluciones; simplemente no admite un factor de una sola variable.'],
        ['La ecuación es automáticamente lineal de coeficientes variables', 'Casi: puede no ser lineal en absoluto.'],
        ['Basta multiplicar por $\\mu = 1$ para que las derivadas parciales cruzadas coincidan', 'Casi: $\\mu = 1$ no altera nada; si $M_y \\neq N_x$, multiplicar por $1$ la deja no exacta.']],
      'Podría existir un factor de la forma $\\mu(x,y) = x^a y^b$ o depender de una combinación como $x+y$, o resolverse por otro método (sustitución, Bernoulli, etc.).'),

    N('con-n-discrepancia-lineal', 'condicion', 2, { a: [2, 6, 1], b: [2, 5, 1], x0: [1, 3, 1], y0: [1, 3, 1] },
      function (v) { return 'Para la forma diferencial $(' + v.a + 'x\\,y + y^2)\\,dx + (' + v.b + 'x^2)\\,dy = 0$, calcula la diferencia de derivadas parciales $M_y(x_0, y_0) - N_x(x_0, y_0)$ en el punto $(x_0, y_0) = (' + v.x0 + ', ' + v.y0 + ')$.'; },
      function (v) { return (v.a - 2 * v.b) * v.x0 + 2 * v.y0; },
      '$M_y = ax + 2y$ y $N_x = 2bx$. La diferencia evaluada en $(x_0, y_0)$ es $(a - 2b)x_0 + 2y_0$.',
      { where: function (v) { return ((v.a - 2 * v.b) * v.x0 + 2 * v.y0) !== 0; },
        mistakes: {
          swapped: function (v) { return 2 * v.b * v.x0 - (v.a * v.x0 + 2 * v.y0); },
          forgot2Y: function (v) { return (v.a - 2 * v.b) * v.x0 + v.y0; },
          forgot2B: function (v) { return (v.a - v.b) * v.x0 + 2 * v.y0; }
        },
        feedback: [
          { when: 'swapped', say: 'Casi: calculaste $N_x - M_y$ en vez de $M_y - N_x$; el signo queda invertido.' },
          { when: 'forgot2Y', say: 'Casi: la derivada de $y^2$ respecto a $y$ es $2y$, no $y$.' },
          { when: 'forgot2B', say: 'Casi: la derivada de $bx^2$ respecto a $x$ es $2bx$, no $bx$.' }
        ] }),

    N('con-n-derivada-my-cubica', 'condicion', 2, { a: [2, 5, 1], b: [2, 6, 1], x0: [1, 3, 1], y0: [1, 2, 1] },
      function (v) { return 'Dada la ecuación $(' + v.a + 'x^2 y^3 + ' + v.b + 'x)\\,dx + (x^3 y^2)\\,dy = 0$, evalúa la derivada parcial $M_y$ en el punto $(' + v.x0 + ', ' + v.y0 + ')$.'; },
      function (v) { return 3 * v.a * v.x0 * v.x0 * v.y0 * v.y0; },
      '$M_y = \\partial_y(ax^2 y^3 + bx) = 3ax^2 y^2$, pues el término $bx$ no depende de $y$.',
      { mistakes: {
          withBx: function (v) { return 3 * v.a * v.x0 * v.x0 * v.y0 * v.y0 + v.b; },
          derivX: function (v) { return 2 * v.a * v.x0 * Math.pow(v.y0, 3) + v.b; },
          forgot3: function (v) { return v.a * v.x0 * v.x0 * v.y0 * v.y0; }
        },
        feedback: [
          { when: 'withBx', say: function (v) { return 'Casi: la derivada de $' + v.b + 'x$ respecto a $y$ es cero porque $x$ se considera constante.'; } },
          { when: 'derivX', say: 'Casi: derivaste respecto a $x$; te piden la derivada parcial respecto a $y$, $M_y$.' },
          { when: 'forgot3', say: 'Casi: al derivar $y^3$ baja un factor $3$: $3ay^2$.' }
        ] }),

    N('con-n-derivada-nx-trig', 'condicion', 2, { c: [2, 6, 1], x0: [1, 4, 1], y0: [2, 5, 1] },
      function (v) { return 'Para la ecuación $(e^x + y)\\,dx + (' + v.c + 'x\\,y^2 + y)\\,dy = 0$, halla el valor de la derivada parcial $N_x$ evaluada en $(' + v.x0 + ', ' + v.y0 + ')$.'; },
      function (v) { return v.c * v.y0 * v.y0; },
      '$N_x = \\partial_x(cxy^2 + y) = cy^2$, pues $y$ se mantiene constante al derivar respecto a $x$.',
      { mistakes: {
          withY: function (v) { return v.c * v.y0 * v.y0 + 1; },
          derivY: function (v) { return 2 * v.c * v.x0 * v.y0 + 1; },
          timesX: function (v) { return v.c * v.x0 * v.y0 * v.y0; }
        },
        feedback: [
          { when: 'withY', say: 'Casi: al derivar respecto a $x$, la variable $y$ se trata como constante, así que $\\partial_x(y) = 0$.' },
          { when: 'derivY', say: 'Casi: calculaste la derivada respecto a $y$, $N_y$, pero la condición requiere $N_x$.' },
          { when: 'timesX', say: 'Casi: la derivada de $x$ respecto a $x$ es $1$, no queda la variable $x$.' }
        ] }),

    N('con-n-cociente-eval-xy', 'condicion', 2, { k: [2, 5, 1], x0: [2, 4, 1] },
      function (v) { return 'En cierta ecuación diferencial se obtiene la diferencia $M_y - N_x = ' + v.k + 'y$ y el coeficiente de $dy$ es $N = x\\,y$. ¿Cuánto vale el cociente $\\dfrac{M_y - N_x}{N}$ evaluado en $x = ' + v.x0 + '$?'; },
      function (v) { return v.k / v.x0; },
      'La variable $y$ se cancela: $\\frac{ky}{xy} = \\frac{k}{x}$. Al evaluar en $x = x_0$ resulta $k/x_0$.',
      { mistakes: {
          timesX: function (v) { return v.k * v.x0; },
          inverse: function (v) { return v.x0 / v.k; },
          negVal: function (v) { return -v.k / v.x0; }
        },
        feedback: [
          { when: 'timesX', say: function (v) { return 'Casi: la variable $x$ queda en el denominador, así que divides entre $' + v.x0 + '$, no multiplicas.'; } },
          { when: 'inverse', say: function (v) { return 'Casi: la constante $' + v.k + '$ está en el numerador: $' + v.k + '/' + v.x0 + '$.'; } },
          { when: 'negVal', say: 'Casi: el cociente tiene signo positivo, no negativo.' }
        ] }),

    /* ======================= 2. Factor integrante en x, μ(x) (18) ======================= */
    C('mux-c-formula-general', 'mux', 1,
      'Si la expresión $\\dfrac{M_y - N_x}{N} = f(x)$ depende únicamente de $x$, ¿cuál es la fórmula para el factor integrante $\\mu(x)$?',
      '$\\mu(x) = e^{\\int f(x)\\,dx}$', [
        ['$\\mu(x) = e^{-\\int f(x)\\,dx}$', 'Casi: el signo en el exponente es positivo $+ \\int f(x)\\,dx$, sin signo menos.'],
        ['$\\mu(x) = \\int f(x)\\,dx$', 'Casi: el factor integrante es la exponencial de la integral, no la integral sola.'],
        ['$\\mu(x) = e^{\\int \\frac{N_x - M_y}{N}\\,dx}$', 'Casi: el numerador es $M_y - N_x$, no $N_x - M_y$.']],
      'De $\\mu\'/\\mu = (M_y - N_x)/N = f(x)$ se integra respecto a $x$ para obtener $\\ln\\mu = \\int f(x)\\,dx \\Rightarrow \\mu = e^{\\int f(x)\\,dx}$.'),

    C('mux-c-caso-k-sobre-x', 'mux', 1,
      'Si al simplificar $\\dfrac{M_y - N_x}{N}$ resulta $\\dfrac{k}{x}$ con $k$ constante, ¿cuál es el factor integrante $\\mu(x)$ para $x > 0$?',
      '$\\mu(x) = x^k$', [
        ['$\\mu(x) = e^{kx}$', 'Casi: $\\int \\frac{k}{x}\\,dx = k\\ln x$, y $e^{k\\ln x} = x^k$, no $e^{kx}$.'],
        ['$\\mu(x) = x^{-k}$', 'Casi: el exponente conserva el signo de $k$; no cambia de signo al subir.'],
        ['$\\mu(x) = k\\ln x$', 'Casi: olvidaste exponenciar el resultado de la antiderivada.']],
      '$\\mu(x) = e^{\\int (k/x)\\,dx} = e^{k\\ln x} = e^{\\ln(x^k)} = x^k$.'),

    C('mux-c-caso-constante', 'mux', 1,
      'Si el cociente $\\dfrac{M_y - N_x}{N}$ resulta ser una constante $c$, ¿cuál es el factor integrante $\\mu(x)$?',
      '$\\mu(x) = e^{cx}$', [
        ['$\\mu(x) = cx$', 'Casi: la integral es $cx$, pero $\\mu$ es la función exponencial $e^{cx}$.'],
        ['$\\mu(x) = x^c$', 'Casi: $x^c$ proviene de integrar $c/x$, no de una constante $c$.'],
        ['$\\mu(x) = e^{-cx}$', 'Casi: el exponente es $+cx$, sin signo negativo.']],
      'La integral de una constante $c$ respecto a $x$ es $cx$, por lo que $\\mu(x) = e^{cx}$.'),

    C('mux-c-verificar-exactitud', 'mux', 1,
      'Una vez calculado $\\mu(x)$, ¿cómo se comprueba de forma rigurosa que efectivamente es el factor integrante correcto?',
      'Multiplicando toda la ecuación por $\\mu(x)$ y comprobando que $\\partial_y(\\mu M) = \\partial_x(\\mu N)$', [
        ['Sustituyendo $\\mu(x)$ en la función $M$ únicamente y evaluando en cero', 'Casi: $\\mu$ debe multiplicar a ambos coeficientes, $M$ y $N$, de toda la ecuación.'],
        ['Derivando $\\mu(x)$ dos veces y verificando que dé cero', 'Casi: la segunda derivada de $\\mu$ no tiene por qué anularse.'],
        ['Comprobando que $\\mu(x)$ sea idénticamente igual a $N/M$', 'Casi: $\\mu(x)$ no es el cociente de los coeficientes, sino el factor que satisface la igualdad de derivadas cruzadas.']],
      'La prueba definitiva consiste en verificar que el nuevo campo $(\\mu M, \\mu N)$ cumple la condición de exactitud de Clairaut.'),

    C('mux-c-ejemplo-clasico', 'mux', 2,
      'Para la ecuación $(3xy + y^2)\\,dx + (x^2 + xy)\\,dy = 0$, ¿qué factor integrante $\\mu(x)$ se obtiene?',
      '$\\mu(x) = x$', [
        ['$\\mu(x) = x^2$', 'Casi: el cociente da $\\frac{x+y}{x(x+y)} = \\frac{1}{x}$, cuya integral es $\\ln x$, dando $x$ y no $x^2$.'],
        ['$\\mu(x) = \\dfrac{1}{x}$', 'Casi: el signo de la integral es positivo, por lo que resulta $x^1$, no $x^{-1}$.'],
        ['$\\mu(x) = e^x$', 'Casi: el cociente es $1/x$, que integra a $\\ln x$, no a $x$.']],
      '$M_y - N_x = (3x + 2y) - (2x + y) = x + y$. Al dividir entre $N = x(x+y)$ queda $1/x$, por lo que $\\mu = e^{\\ln x} = x$.'),

    C('mux-c-cociente-con-signo-menos', 'mux', 2,
      'Si al calcular $\\dfrac{M_y - N_x}{N}$ obtienes $-\\dfrac{3}{x}$, ¿cuál es el factor integrante $\\mu(x)$ para $x > 0$?',
      '$\\mu(x) = \\dfrac{1}{x^3}$', [
        ['$\\mu(x) = x^3$', 'Casi: el signo menos en $-3/x$ produce un exponente negativo $e^{-3\\ln x} = x^{-3} = 1/x^3$.'],
        ['$\\mu(x) = -3\\ln x$', 'Casi: ese es el exponente de $\\mu$; falta calcular $e^{-3\\ln x}$.'],
        ['$\\mu(x) = e^{-3x}$', 'Casi: la integral de $1/x$ es $\\ln x$, produciendo una potencia de $x$, no $e^{-3x}$.']],
      '$\\mu(x) = e^{\\int (-3/x)\\,dx} = e^{-3\\ln x} = (e^{\\ln x})^{-3} = x^{-3} = 1/x^3$.'),

    N('mux-n-exponente-potencia', 'mux', 2, { b: [2, 6, 1], a: [1, 5, 1] },
      function (v) { return 'Para la ecuación $(' + v.b + 'y^2 + ' + v.a + 'x)\\,dx + 2xy\\,dy = 0$, el factor integrante es de la forma $\\mu(x) = x^m$. ¿Cuánto vale el exponente $m$?'; },
      function (v) { return v.b - 1; },
      '$M_y = 2by$, $N_x = 2y$, así que $(M_y - N_x)/N = (2b - 2)y / (2xy) = (b - 1)/x$, y $\\mu(x) = x^{b-1}$.',
      { mistakes: {
          bRaw: function (v) { return v.b; },
          twoB: function (v) { return 2 * v.b - 1; },
          negExp: function (v) { return 1 - v.b; }
        },
        feedback: [
          { when: 'bRaw', say: function (v) { return 'Casi: al restar $N_x = 2y$ queda $(2b - 2)y$, que al dividir entre $2xy$ da $(' + (v.b - 1) + ')/x$.'; } },
          { when: 'twoB', say: 'Casi: olvidaste dividir el coeficiente entre el $2$ que divide en $N = 2xy$.' },
          { when: 'negExp', say: 'Casi: el orden de la resta es $M_y - N_x$, lo que produce exponente positivo.' }
        ] }),

    N('mux-n-eval-mu-potencia', 'mux', 2, { k: [1, 4, 1], x0: [2, 3, 1] },
      function (v) { return 'Calcula el valor del factor integrante $\\mu(' + v.x0 + ')$ para la ecuación $(' + (v.k + 1) + 'y + x^2)\\,dx + x\\,dy = 0$, sabiendo que $\\mu(1) = 1$.'; },
      function (v) { return Math.pow(v.x0, v.k); },
      '$M_y = k+1$ y $N_x = 1$, así que $(M_y - N_x)/N = k/x \\Rightarrow \\mu(x) = x^k$. Evaluado en $x_0$ da $x_0^k$.',
      { mistakes: {
          plusOne: function (v) { return Math.pow(v.x0, v.k + 1); },
          linear: function (v) { return v.k * v.x0; },
          inverse: function (v) { return Math.pow(v.x0, -v.k); }
        },
        feedback: [
          { when: 'plusOne', say: function (v) { return 'Casi: restaste $N_x = 1$ de $M_y = ' + (v.k + 1) + '$, dando exponente $' + v.k + '$, no $' + (v.k + 1) + '$.'; } },
          { when: 'linear', say: 'Casi: $\\mu = x^k$, no $k\\cdot x$.' },
          { when: 'inverse', say: function (v) { return 'Casi: el exponente es positivo $' + v.k + '$, no negativo.'; } }
        ] }),

    N('mux-n-constante-exponencial', 'mux', 2, { a: [2, 5, 1], x0: [1, 2, 1] },
      function (v) { return 'Para la ecuación $(' + v.a + 'y + 4x^3)\\,dx + dy = 0$, halla el valor del factor integrante $\\mu(x)$ evaluado en $x = ' + v.x0 + '$ (con $\\mu(0) = 1$).'; },
      function (v) { return Math.exp(v.a * v.x0); },
      '$M_y = a$, $N_x = 0$, por lo que $(M_y - N_x)/N = a$ y $\\mu(x) = e^{ax}$.',
      { mistakes: {
          negExp: function (v) { return Math.exp(-v.a * v.x0); },
          linExp: function (v) { return v.a * v.x0; },
          sqrExp: function (v) { return Math.exp(v.a * v.x0 * v.x0); }
        },
        feedback: [
          { when: 'negExp', say: function (v) { return 'Casi: $M_y = ' + v.a + '$ y $N_x = 0$, así que $(M_y - N_x)/N = +' + v.a + '$; el signo es positivo.'; } },
          { when: 'linExp', say: function (v) { return 'Casi: ese es el exponente $' + v.a + 'x$; falta calcular la función exponencial $e^{' + v.a + 'x}$.'; } },
          { when: 'sqrExp', say: function (v) { return 'Casi: la integral de la constante $' + v.a + '$ es $' + v.a + 'x$, no cuadrática.'; } }
        ] }),

    N('mux-n-coeficiente-lineal-en-exponente', 'mux', 2, { a: [1, 4, 1], x0: [1, 2, 1] },
      function (v) { return 'Determina el factor integrante $\\mu(x)$ con $\\mu(0) = 1$ para la ecuación $((' + (2 * v.a) + 'x^2 + 1)y)\\,dx + x\\,dy = 0$ y evalúalo en $x = ' + v.x0 + '$.'; },
      function (v) { return Math.exp(v.a * v.x0 * v.x0); },
      '$M_y = 2ax^2 + 1$, $N_x = 1$, luego $(M_y - N_x)/N = 2ax$ y $\\mu(x) = e^{\\int 2ax\\,dx} = e^{ax^2}$.',
      { mistakes: {
          forgotHalf: function (v) { return Math.exp(2 * v.a * v.x0 * v.x0); },
          negExp: function (v) { return Math.exp(-v.a * v.x0 * v.x0); },
          justExp: function (v) { return Math.exp(v.a * v.x0); }
        },
        feedback: [
          { when: 'forgotHalf', say: function (v) { return 'Casi: al integrar $' + (2 * v.a) + 'x$ se divide entre $2$, quedando $' + v.a + 'x^2$ en el exponente.'; } },
          { when: 'negExp', say: 'Casi: el exponente lleva signo positivo $+ax^2$.' },
          { when: 'justExp', say: 'Casi: la integral de $x$ es $x^2/2$, por lo que el exponente lleva $x^2$.' }
        ] }),

    N('mux-n-hallar-parametro-k', 'mux', 2, { k: [2, 4, 2], m: [1, 4, 1] },
      function (v) { return 'Considera la ecuación diferencial $(c\\,y^2 + 5x)\\,dx + ' + v.k + 'xy\\,dy = 0$. ¿Qué valor debe tener la constante positiva $c$ para que el factor integrante sea $\\mu(x) = x^{' + v.m + '}$?'; },
      function (v) { return v.k * (v.m + 1) / 2; },
      '$M_y = 2cy$, $N_x = ky$, por lo que $(M_y - N_x)/N = (2c - k)/(kx) = m/x \\Rightarrow 2c = k(m+1)$.',
      { mistakes: {
          forgot2: function (v) { return v.k * (v.m + 1); },
          forgotPlus1: function (v) { return v.k * v.m / 2; },
          wrongSign: function (v) { return v.k * (v.m - 1) / 2; }
        },
        feedback: [
          { when: 'forgot2', say: 'Casi: al derivar $cy^2$ respecto a $y$ baja un $2$, así que $2c - k = km \\Rightarrow 2c = k(m+1)$.' },
          { when: 'forgotPlus1', say: 'Casi: de $\\frac{2c - k}{k} = m$ se obtiene $2c - k = km \\Rightarrow 2c = k(m + 1)$, no $km$.' },
          { when: 'wrongSign', say: 'Casi: al despejar $2c = k + km = k(m+1)$, el signo es una suma.' }
        ] }),

    N('mux-n-evaluar-mu-fraccion', 'mux', 2, { a: [1, 3, 1], x0: [2, 5, 1] },
      function (v) { return 'Para la ecuación $(y + ' + v.a + 'x)\\,dx + 2x\\,dy = 0$, calcula el valor del factor integrante $\\mu(x) = x^m$ en $x = ' + v.x0 + '$.'; },
      function (v) { return 1 / Math.sqrt(v.x0); },
      '$M_y = 1, N_x = 2 \\Rightarrow (M_y - N_x)/N = -1/(2x)$, de modo que $\\mu(x) = x^{-1/2} = 1/\\sqrt{x}$.',
      { mistakes: {
          posHalf: function (v) { return Math.sqrt(v.x0); },
          noHalf: function (v) { return 1 / v.x0; },
          sqrVal: function (v) { return 1 / (v.x0 * v.x0); }
        },
        feedback: [
          { when: 'posHalf', say: 'Casi: $M_y - N_x = 1 - 2 = -1$, por lo que el exponente es $-1/2$, no $+1/2$.' },
          { when: 'noHalf', say: 'Casi: el denominador de $N$ tiene un factor $2$, dando exponente $-1/2$, no $-1$.' },
          { when: 'sqrVal', say: 'Casi: la integral da $-\\frac{1}{2}\\ln x$, que corresponde a $x^{-1/2} = 1/\\sqrt{x}$.' }
        ] }),

    E('mux-e-formula-potencia', 'mux', 2, { k: [2, 5, 1] },
      function (v) { return 'Encuentra el factor integrante $\\mu(x)$ con $\\mu(1) = 1$ para la ecuación $(' + (v.k + 1) + 'xy)\\,dx + (x^2)\\,dy = 0$ con $x > 0$. Escribe la expresión en términos de $x$.'; },
      function (v) { return 'x^' + (v.k - 1); },
      '$M_y - N_x = (k-1)x$, que al dividir entre $N = x^2$ da $(k-1)/x$, produciendo $\\mu(x) = x^{k-1}$.',
      { domain: [0.5, 3],
        mistakes: {
          kPlusOne: function (v) { return 'x^' + (v.k + 1); },
          invExp: function (v) { return 'x^(-' + (v.k - 1) + ')'; },
          expForm: function (v) { return 'e^(' + (v.k - 1) + '*x)'; }
        },
        feedback: [
          { when: 'kPlusOne', say: 'Casi: $M_y - N_x = (k+1)x - 2x = (k-1)x$; el exponente es $k-1$.' },
          { when: 'invExp', say: 'Casi: el exponente es positivo $k-1$, no negativo.' },
          { when: 'expForm', say: 'Casi: $\\int \\frac{k-1}{x}dx = (k-1)\\ln x$, lo que da una potencia $x^{k-1}$, no $e^{(k-1)x}$.' }
        ] }),

    E('mux-e-exponencial-simple', 'mux', 2, { a: [2, 5, 1] },
      function (v) { return 'Determina el factor integrante $\\mu(x)$ con $\\mu(0) = 1$ para la forma diferencial $(' + v.a + 'y + x)\\,dx + dy = 0$. Escribe la función de $x$.'; },
      function (v) { return 'e^(' + v.a + '*x)'; },
      '$(M_y - N_x)/N = a \\Rightarrow \\mu(x) = e^{\\int a\\,dx} = e^{ax}$.',
      { domain: [0.2, 2.5],
        mistakes: {
          negA: function (v) { return 'e^(-' + v.a + '*x)'; },
          powX: function (v) { return 'x^' + v.a; },
          linear: function (v) { return v.a + '*x'; }
        },
        feedback: [
          { when: 'negA', say: function (v) { return 'Casi: $M_y = +' + v.a + '$, por lo que el exponente tiene signo positivo: $' + v.a + 'x$.'; } },
          { when: 'powX', say: function (v) { return 'Casi: el cociente es la constante $' + v.a + '$, cuya integral es $' + v.a + 'x$, no $' + v.a + '\\ln x$.'; } },
          { when: 'linear', say: function (v) { return 'Casi: el factor integrante es la exponencial $e^{' + v.a + 'x}$, no $' + v.a + 'x$.'; } }
        ] }),

    N('mux-n-dos-terminos-x', 'mux', 3, { a: [2, 4, 1], x0: [1, 2, 1] },
      function (v) { return 'Para la ecuación $((' + v.a + 'x + 1)y)\\,dx + x\\,dy = 0$, halla el valor del factor integrante $\\mu(x)$ en $x = ' + v.x0 + '$, tomando $\\mu(1) = e^{' + v.a + '}$.'; },
      function (v) { return Math.exp(v.a * v.x0); },
      '$M_y - N_x = ax$, que dividido entre $N = x$ da la constante $a$, por lo que $\\mu(x) = e^{ax}$.',
      { mistakes: {
          forgotExp: function (v) { return v.a * v.x0; },
          negExp: function (v) { return Math.exp(-v.a * v.x0); },
          sqrExp: function (v) { return Math.exp(v.a * v.x0 * v.x0); }
        },
        feedback: [
          { when: 'forgotExp', say: function (v) { return 'Casi: falta aplicar la exponencial $e^{' + v.a + 'x}$.'; } },
          { when: 'negExp', say: 'Casi: el signo de la integral es positivo $+ax$.' },
          { when: 'sqrExp', say: function (v) { return 'Casi: la integral de la constante $' + v.a + '$ es lineal en $x$, no cuadrática.'; } }
        ] }),

    N('mux-n-polinomio-grado2', 'mux', 3, { b: [1, 3, 1], x0: [1, 2, 1] },
      function (v) { return 'Considera la ecuación diferencial $((' + (3 * v.b) + 'x^2 + 2)y)\\,dx + 2x\\,dy = 0$. Si el factor integrante satisface $\\mu(0) = 1$, calcula $\\mu(' + v.x0 + ')$.'; },
      function (v) { return Math.exp(0.75 * v.b * v.x0 * v.x0); },
      '$(M_y - N_x)/N = \\frac{3b}{2}x \\Rightarrow \\mu(x) = e^{\\frac{3b}{4}x^2}$.',
      { mistakes: {
          forgotDiv4: function (v) { return Math.exp(1.5 * v.b * v.x0 * v.x0); },
          forgotSquare: function (v) { return Math.exp(0.75 * v.b * v.x0); },
          negExp: function (v) { return Math.exp(-0.75 * v.b * v.x0 * v.x0); }
        },
        feedback: [
          { when: 'forgotDiv4', say: 'Casi: al integrar $x$ sale un factor $1/2$, resultando $\\frac{3b}{4}x^2$ en el exponente.' },
          { when: 'forgotSquare', say: 'Casi: la integral de $x$ es $x^2/2$, por lo que $x$ queda al cuadrado.' },
          { when: 'negExp', say: 'Casi: el exponente es positivo $+ \\frac{3b}{4}x^2$.' }
        ] }),

    N('mux-n-racional-simplificada', 'mux', 3, { k: [2, 4, 1], x0: [2, 3, 1] },
      function (v) { return 'En la ecuación $((' + (2 * v.k + 1) + ')xy + ' + v.k + 'y^2)\\,dx + (x^2 + xy)\\,dy = 0$, halla el valor de $\\mu(' + v.x0 + ')$ sabiendo que $\\mu(1) = 1$.'; },
      function (v) { return Math.pow(v.x0, 2 * v.k - 1); },
      '$M_y - N_x = (2k - 1)(x + y)$ y $N = x(x + y)$, de modo que $(M_y - N_x)/N = (2k - 1)/x$ y $\\mu(x) = x^{2k-1}$.',
      { mistakes: {
          twoK: function (v) { return Math.pow(v.x0, 2 * v.k); },
          minusTwo: function (v) { return Math.pow(v.x0, 2 * v.k - 2); },
          inverse: function (v) { return Math.pow(v.x0, 1 - 2 * v.k); }
        },
        feedback: [
          { when: 'twoK', say: 'Casi: $M_y - N_x = (2k - 1)(x + y)$, por lo que el exponente es $2k - 1$, no $2k$.' },
          { when: 'minusTwo', say: 'Casi: al simplificar $(x+y)$ queda $\\frac{2k-1}{x}$, dando potencia $x^{2k-1}$.' },
          { when: 'inverse', say: 'Casi: el exponente es positivo $2k - 1$, no negativo.' }
        ] }),

    N('mux-n-lineal-inversa-cuadrado', 'mux', 3, { m: [2, 4, 1], x0: [2, 3, 1] },
      function (v) { return 'Para la ecuación diferencial $(y + x^3)\\,dx - ' + v.m + 'x\\,dy = 0$ con $x > 0$, calcula el valor del factor integrante $\\mu(' + v.x0 + ')$ tal que $\\mu(1) = 1$.'; },
      function (v) { return Math.pow(v.x0, -(v.m + 1) / v.m); },
      '$M_y = 1$, $N_x = -m$, luego $(M_y - N_x)/N = -\\frac{m+1}{mx} \\Rightarrow \\mu(x) = x^{-(m+1)/m}$.',
      { mistakes: {
          posExp: function (v) { return Math.pow(v.x0, (v.m + 1) / v.m); },
          forgotM: function (v) { return Math.pow(v.x0, -(v.m + 1)); },
          justMinusOne: function (v) { return 1 / v.x0; }
        },
        feedback: [
          { when: 'posExp', say: function (v) { return 'Casi: el denominador $N = -' + v.m + 'x$ aporta un signo negativo, por lo que el exponente es negativo.'; } },
          { when: 'forgotM', say: function (v) { return 'Casi: olvidaste dividir entre $' + v.m + '$ en el exponente: $-(m+1)/m$.'; } },
          { when: 'justMinusOne', say: function (v) { return 'Casi: el exponente exacto es $-\\frac{' + (v.m + 1) + '}{' + v.m + '}$.'; } }
        ] }),

    /* ======================= 3. Factor integrante en y, μ(y) (18) ======================= */
    C('muy-c-formula-general', 'muy', 1,
      'Si la expresión $\\dfrac{N_x - M_y}{M} = g(y)$ depende únicamente de $y$, ¿cuál es la fórmula para el factor integrante $\\mu(y)$?',
      '$\\mu(y) = e^{\\int g(y)\\,dy}$', [
        ['$\\mu(y) = e^{-\\int g(y)\\,dy}$', 'Casi: con la resta en el orden $N_x - M_y$ dividida entre $M$, el signo del exponente es positivo.'],
        ['$\\mu(y) = \\int g(y)\\,dy$', 'Casi: el factor integrante es la exponencial de la antiderivada, no la antiderivada sola.'],
        ['$\\mu(y) = e^{\\int \\frac{M_y - N_x}{M}\\,dy}$', 'Casi: para $\\mu(y)$ el numerador debe ser $N_x - M_y$, no $M_y - N_x$.']],
      'De $\\mu\'/\\mu = (N_x - M_y)/M = g(y)$ se integra respecto a $y$ y se obtiene $\\mu(y) = e^{\\int g(y)\\,dy}$.'),

    C('muy-c-orden-resta-justificacion', 'muy', 1,
      '¿Por qué en la fórmula de $\\mu(y)$ aparece $N_x - M_y$ en el numerador en lugar de $M_y - N_x$?',
      'Porque al aplicar la regla del producto a $\\partial_y(\\mu(y) M)$ surge $\\mu\' M + \\mu M_y$, y al despejar $\\mu\' M$ queda $\\mu(N_x - M_y)$', [
        ['Porque las derivadas respecto a $y$ siempre son negativas en el cálculo multivariable', 'Casi: no hay ninguna regla que haga negativas a las derivadas respecto a $y$.'],
        ['Porque el diferencial $dy$ tiene mayor jerarquía que el diferencial $dx$', 'Casi: los diferenciales no tienen jerarquías; es una consecuencia algebraica directa de la regla del producto.'],
        ['Es una convención arbitraria que no afecta el resultado final', 'Casi: el signo es fundamental; cambiar el orden invertiría el factor integrante $\\mu$ a $1/\\mu$.']],
      'De $\\mu\' M + \\mu M_y = \\mu N_x$ se despeja $\\mu\' M = \\mu(N_x - M_y)$, de donde $\\mu\'/\\mu = (N_x - M_y)/M$.'),

    C('muy-c-caso-k-sobre-y', 'muy', 1,
      'Si al simplificar $\\dfrac{N_x - M_y}{M}$ resulta $\\dfrac{p}{y}$ con $p$ constante, ¿cuál es el factor integrante $\\mu(y)$ para $y > 0$?',
      '$\\mu(y) = y^p$', [
        ['$\\mu(y) = e^{py}$', 'Casi: $\\int \\frac{p}{y}\\,dy = p\\ln y$, y $e^{p\\ln y} = y^p$, no $e^{py}$.'],
        ['$\\mu(y) = y^{-p}$', 'Casi: el exponente conserva el signo positivo $+p$.'],
        ['$\\mu(y) = p\\ln y$', 'Casi: falta exponenciar la antiderivada.']],
      '$\\mu(y) = e^{\\int (p/y)\\,dy} = e^{p\\ln y} = y^p$.'),

    C('muy-c-divisor-es-M', 'muy', 1,
      '¿Cuál es el denominador correcto al calcular el cociente para buscar un factor integrante $\\mu(y)$?',
      'El coeficiente $M$ de $dx$', [
        ['El coeficiente $N$ de $dy$', 'Casi: entre $N$ se divide al buscar $\\mu(x)$, pero para $\\mu(y)$ se divide entre $M$.'],
        ['La suma $M + N$', 'Casi: el divisor es simplemente el término $M$.'],
        ['El producto $M \\cdot N$', 'Casi: el divisor es únicamente el coeficiente $M$.']],
      'Para $\\mu(y)$ se divide entre $M$: $\\frac{N_x - M_y}{M}$.'),

    C('muy-c-ejemplo-sesion', 'muy', 2,
      'En el ejemplo de la lección $y\\,dx + (2x - y e^y)\\,dy = 0$, ¿por qué falla la prueba para $\\mu(x)$?',
      'Porque $\\dfrac{M_y - N_x}{N} = \\dfrac{1 - 2}{2x - y e^y} = \\dfrac{-1}{2x - y e^y}$ contiene a $y$ de forma inseparable', [
        ['Porque $M_y = N_x$ y la ecuación ya era exacta', 'Casi: $M_y = 1$ y $N_x = 2$, por lo que no es exacta.'],
        ['Porque el coeficiente $M = y$ no se puede derivar respecto a $y$', 'Casi: $\\partial_y(y) = 1$, perfectamente derivable.'],
        ['Porque toda ecuación con exponenciales carece de factor integrante', 'Casi: sí tiene factor integrante, solo que depende de $y$ (resulta $\\mu(y) = y$).']],
      'Como el cociente con $N$ contiene $y$, no sirve para $\\mu(x)$. Al probar con $M$ queda $(2 - 1)/y = 1/y$, dando $\\mu(y) = y$.'),

    C('muy-c-signo-inverso', 'muy', 2,
      'Si un estudiante calcula por error $\\dfrac{M_y - N_x}{M} = -\\dfrac{3}{y}$ y concluye $\\mu = y^{-3}$, ¿cuál fue su error conceptual?',
      'Usó el orden de resta de $\\mu(x)$ ($M_y - N_x$) dividiendo entre $M$, cuando para $\\mu(y)$ debía ser $N_x - M_y$', [
        ['Integró mal $-3/y$, pues la integral debió ser $e^{-3y}$', 'Casi: la integral de $1/y$ sí es logaritmo; el error estuvo en el orden de la resta en el numerador.'],
        ['Dividió entre $M$ cuando debió dividir entre $N$', 'Casi: para $\\mu(y)$ sí se divide entre $M$, pero el numerador debe ser $N_x - M_y$.'],
        ['Olvidó multiplicar por la derivada $y\'$', 'Casi: el método de factores integrantes no requiere introducir $y\'$ en el cociente.']],
      'Para $\\mu(y)$ la fórmula es $(N_x - M_y)/M$. Si usas $M_y - N_x$, te queda el signo cambiado y el factor integrante invertido.'),

    N('muy-n-exponente-potencia-simple', 'muy', 2, { c: [2, 6, 1] },
      function (v) { return 'Para la ecuación diferencial $y\\,dx + (' + v.c + 'x - y^4)\\,dy = 0$, el factor integrante es $\\mu(y) = y^m$. ¿Cuánto vale el exponente $m$?'; },
      function (v) { return v.c - 1; },
      '$N_x = c$ y $M_y = 1$, así que $(N_x - M_y)/M = (c - 1)/y \\Rightarrow \\mu(y) = y^{c-1}$.',
      { mistakes: {
          cRaw: function (v) { return v.c; },
          negSign: function (v) { return 1 - v.c; },
          plusOne: function (v) { return v.c + 1; }
        },
        feedback: [
          { when: 'cRaw', say: function (v) { return 'Casi: olvidaste restar $M_y = 1$: $N_x - M_y = ' + v.c + ' - 1$.'; } },
          { when: 'negSign', say: function (v) { return 'Casi: el orden de la resta para $\\mu(y)$ es $N_x - M_y = ' + v.c + ' - 1 > 0$.'; } },
          { when: 'plusOne', say: 'Casi: es una resta $c - 1$, no una suma.' }
        ] }),

    N('muy-n-evaluar-mu-potencia', 'muy', 2, { k: [1, 3, 1], y0: [2, 4, 1] },
      function (v) { return 'Dada la ecuación $(2y)\\,dx + (' + (2 * v.k + 2) + 'x + y^2)\\,dy = 0$, halla el valor del factor integrante $\\mu(y)$ evaluado en $y = ' + v.y0 + '$ (con $\\mu(1) = 1$).'; },
      function (v) { return Math.pow(v.y0, v.k); },
      '$N_x - M_y = 2k$, que dividido entre $M = 2y$ da $k/y$, produciendo $\\mu(y) = y^k$.',
      { mistakes: {
          twoK: function (v) { return Math.pow(v.y0, 2 * v.k); },
          inverse: function (v) { return Math.pow(v.y0, -v.k); },
          linear: function (v) { return v.k * v.y0; }
        },
        feedback: [
          { when: 'twoK', say: 'Casi: olvidaste dividir entre el factor $2$ de $M = 2y$, con lo que el exponente es $k$, no $2k$.' },
          { when: 'inverse', say: 'Casi: $N_x - M_y > 0$, el exponente es positivo $+k$.' },
          { when: 'linear', say: 'Casi: $\\mu = y^k$, no $k\\cdot y$.' }
        ] }),

    N('muy-n-constante-exponencial', 'muy', 2, { b: [2, 5, 1], y0: [1, 2, 1] },
      function (v) { return 'Para la ecuación diferencial $dx + (' + v.b + 'x - y^2)\\,dy = 0$, determina el valor del factor integrante $\\mu(y)$ en $y = ' + v.y0 + '$ sabiendo que $\\mu(0) = 1$.'; },
      function (v) { return Math.exp(v.b * v.y0); },
      '$(N_x - M_y)/M = b \\Rightarrow \\mu(y) = e^{by}$.',
      { mistakes: {
          negExp: function (v) { return Math.exp(-v.b * v.y0); },
          linExp: function (v) { return v.b * v.y0; },
          powY: function (v) { return Math.pow(v.y0, v.b); }
        },
        feedback: [
          { when: 'negExp', say: function (v) { return 'Casi: $N_x - M_y = +' + v.b + '$, así que el signo en el exponente es positivo.'; } },
          { when: 'linExp', say: function (v) { return 'Casi: falta la función exponencial $e^{' + v.b + 'y}$.'; } },
          { when: 'powY', say: function (v) { return 'Casi: el cociente es una constante $' + v.b + '$, que integra a $' + v.b + 'y$, no a $' + v.b + '\\ln y$.'; } }
        ] }),

    N('muy-n-coeficiente-cuadratico-exp', 'muy', 2, { a: [1, 3, 1], y0: [1, 2, 1] },
      function (v) { return 'Considera la forma diferencial $y\\,dx + ((' + (2 * v.a) + 'y^2 + 1)x)\\,dy = 0$. Halla el valor de $\\mu(' + v.y0 + ')$ para el factor integrante $\\mu(y)$ con $\\mu(0) = 1$.'; },
      function (v) { return Math.exp(v.a * v.y0 * v.y0); },
      '$(N_x - M_y)/M = 2ay \\Rightarrow \\mu(y) = e^{ay^2}$.',
      { mistakes: {
          forgotHalf: function (v) { return Math.exp(2 * v.a * v.y0 * v.y0); },
          negExp: function (v) { return Math.exp(-v.a * v.y0 * v.y0); },
          linY: function (v) { return Math.exp(v.a * v.y0); }
        },
        feedback: [
          { when: 'forgotHalf', say: function (v) { return 'Casi: la integral de $' + (2 * v.a) + 'y$ es $' + v.a + 'y^2$, dividiendo entre $2$.'; } },
          { when: 'negExp', say: 'Casi: el exponente es positivo $+ay^2$.' },
          { when: 'linY', say: 'Casi: la integral de $y$ es cuadrática, $y^2/2$.' }
        ] }),

    N('muy-n-despejar-parametro-b', 'muy', 2, { m: [2, 5, 1], a: [1, 3, 1] },
      function (v) { return '¿Qué valor debe tener la constante positiva $b$ en la ecuación diferencial $(' + v.a + 'y)\\,dx + (b\\,x - y^3)\\,dy = 0$ para que el factor integrante sea $\\mu(y) = y^{' + v.m + '}$?'; },
      function (v) { return v.a * (v.m + 1); },
      '$N_x = b, M_y = a \\Rightarrow (b - a)/a = m \\Rightarrow b = a(m + 1)$.',
      { mistakes: {
          minusOne: function (v) { return v.a * (v.m - 1); },
          forgotA: function (v) { return v.m + 1; },
          justAM: function (v) { return v.a * v.m; }
        },
        feedback: [
          { when: 'minusOne', say: 'Casi: de $\\frac{b - a}{a} = m$ se despeja $b = a(m + 1)$, con signo de suma.' },
          { when: 'forgotA', say: function (v) { return 'Casi: olvidaste multiplicar por $a = ' + v.a + '$, que divide en el denominador $M = ay$.'; } },
          { when: 'justAM', say: function (v) { return 'Casi: $b - a = am \\Rightarrow b = am + a = a(m+1)$, no solo $am$.'; } }
        ] }),

    N('muy-n-exponente-negativo-frac', 'muy', 2, { y0: [2, 5, 1] },
      function (v) { return 'Para la ecuación $(2y)\\,dx + (x + y^2)\\,dy = 0$, halla el valor de $\\mu(' + v.y0 + ')$ sabiendo que $\\mu(1) = 1$.'; },
      function (v) { return 1 / Math.sqrt(v.y0); },
      '$(N_x - M_y)/M = -1/(2y) \\Rightarrow \\mu(y) = y^{-1/2} = 1/\\sqrt{y}$.',
      { mistakes: {
          posHalf: function (v) { return Math.sqrt(v.y0); },
          noSqrt: function (v) { return 1 / v.y0; },
          sqrVal: function (v) { return 1 / (v.y0 * v.y0); }
        },
        feedback: [
          { when: 'posHalf', say: 'Casi: $N_x - M_y = 1 - 2 = -1 < 0$, por lo que el exponente es negativo: $-1/2$.' },
          { when: 'noSqrt', say: 'Casi: el coeficiente $2$ en $M = 2y$ produce una potencia $-1/2$, que corresponde a $1/\\sqrt{y}$.' },
          { when: 'sqrVal', say: 'Casi: la integral es $-\\frac{1}{2}\\ln y$, no $-2\\ln y$.' }
        ] }),

    E('muy-e-potencia-y', 'muy', 2, { k: [2, 5, 1] },
      function (v) { return 'Halla el factor integrante $\\mu(y)$ con $\\mu(1) = 1$ para la ecuación $y\\,dx + (' + (v.k + 1) + 'x)\\,dy = 0$ con $y > 0$. Escribe la expresión en términos de $y$.'; },
      function (v) { return 'y^' + v.k; },
      '$N_x = k+1, M_y = 1 \\Rightarrow (N_x - M_y)/M = k/y \\Rightarrow \\mu(y) = y^k$.',
      { exprVars: ['y'], domain: [0.5, 3],
        mistakes: {
          kPlusOne: function (v) { return 'y^' + (v.k + 1); },
          negK: function (v) { return 'y^(-' + v.k + ')'; },
          expForm: function (v) { return 'e^(' + v.k + '*y)'; }
        },
        feedback: [
          { when: 'kPlusOne', say: function (v) { return 'Casi: $N_x - M_y = (k+1) - 1 = ' + v.k + '$; el exponente es $' + v.k + '$.'; } },
          { when: 'negK', say: 'Casi: $N_x - M_y > 0$, el exponente es positivo $+k$.' },
          { when: 'expForm', say: 'Casi: la integral de $k/y$ es $k\\ln y$, lo que genera una potencia $y^k$, no una exponencial.' }
        ] }),

    E('muy-e-exponencial-y', 'muy', 2, { b: [2, 5, 1] },
      function (v) { return 'Calcula el factor integrante $\\mu(y)$ con $\\mu(0) = 1$ para la forma diferencial $dx + (' + v.b + 'x + y)\\,dy = 0$. Escribe la función de $y$.'; },
      function (v) { return 'e^(' + v.b + '*y)'; },
      '$(N_x - M_y)/M = b \\Rightarrow \\mu(y) = e^{by}$.',
      { exprVars: ['y'], domain: [0.2, 2.5],
        mistakes: {
          negB: function (v) { return 'e^(-' + v.b + '*y)'; },
          powY: function (v) { return 'y^' + v.b; },
          linY: function (v) { return v.b + '*y'; }
        },
        feedback: [
          { when: 'negB', say: function (v) { return 'Casi: $N_x - M_y = +' + v.b + '$, el exponente tiene signo positivo.'; } },
          { when: 'powY', say: 'Casi: el cociente es constante, por lo que la integral es lineal en $y$ y $\\mu$ es exponencial.' },
          { when: 'linY', say: function (v) { return 'Casi: el factor integrante es la exponencial $e^{' + v.b + 'y}$, no $' + v.b + 'y$.'; } }
        ] }),

    N('muy-n-trinomio-simplificado', 'muy', 3, { k: [2, 4, 1], y0: [2, 3, 1] },
      function (v) { return 'En la ecuación $(xy + y^2)\\,dx + (' + v.k + 'x^2 + ' + (2 * v.k + 1) + 'xy)\\,dy = 0$, halla el valor de $\\mu(' + v.y0 + ')$ sabiendo que $\\mu(1) = 1$.'; },
      function (v) { return Math.pow(v.y0, 2 * v.k - 1); },
      '$N_x - M_y = (2k-1)(x+y)$ y $M = y(x+y)$, por lo que $(N_x - M_y)/M = (2k-1)/y \\Rightarrow \\mu(y) = y^{2k-1}$.',
      { mistakes: {
          twoK: function (v) { return Math.pow(v.y0, 2 * v.k); },
          minusTwo: function (v) { return Math.pow(v.y0, 2 * v.k - 2); },
          inverse: function (v) { return Math.pow(v.y0, 1 - 2 * v.k); }
        },
        feedback: [
          { when: 'twoK', say: 'Casi: $N_x - M_y = (2k - 1)(x + y)$, dando exponente $2k - 1$, no $2k$.' },
          { when: 'minusTwo', say: 'Casi: al simplificar $(x+y)$ queda $(2k-1)/y$, dando $y^{2k-1}$.' },
          { when: 'inverse', say: 'Casi: el exponente es positivo $2k - 1$, no negativo.' }
        ] }),

    N('muy-n-exponencial-con-y-lineal', 'muy', 3, { a: [2, 4, 1], y0: [1, 2, 1] },
      function (v) { return 'Para la forma diferencial $y\\,dx + ((' + v.a + 'y + 1)x)\\,dy = 0$, calcula el valor del factor integrante $\\mu(' + v.y0 + ')$ sabiendo que $\\mu(0) = 1$.'; },
      function (v) { return Math.exp(v.a * v.y0); },
      '$N_x - M_y = ay$, que al dividir entre $M = y$ da $a$, de modo que $\\mu(y) = e^{ay}$.',
      { mistakes: {
          negExp: function (v) { return Math.exp(-v.a * v.y0); },
          sqrExp: function (v) { return Math.exp(v.a * v.y0 * v.y0); },
          linVal: function (v) { return v.a * v.y0; }
        },
        feedback: [
          { when: 'negExp', say: function (v) { return 'Casi: $N_x - M_y = +' + v.a + 'y$, por lo que el exponente es positivo $+ay$.'; } },
          { when: 'sqrExp', say: function (v) { return 'Casi: el cociente es la constante $' + v.a + '$, cuya integral es lineal en $y$, no cuadrática.'; } },
          { when: 'linVal', say: function (v) { return 'Casi: falta la exponencial $e^{' + v.a + 'y}$.'; } }
        ] }),

    N('muy-n-polinomio-grado2-y', 'muy', 3, { c: [1, 3, 1], y0: [1, 2, 1] },
      function (v) { return 'Considera la ecuación diferencial $2y\\,dx + ((' + (3 * v.c) + 'y^2 + 2)x)\\,dy = 0$. Si $\\mu(0) = 1$, calcula el valor de $\\mu(' + v.y0 + ')$.'; },
      function (v) { return Math.exp(0.75 * v.c * v.y0 * v.y0); },
      '$(N_x - M_y)/M = \\frac{3c}{2}y \\Rightarrow \\mu(y) = e^{\\frac{3c}{4}y^2}$.',
      { mistakes: {
          forgotDiv4: function (v) { return Math.exp(1.5 * v.c * v.y0 * v.y0); },
          forgotSquare: function (v) { return Math.exp(0.75 * v.c * v.y0); },
          negExp: function (v) { return Math.exp(-0.75 * v.c * v.y0 * v.y0); }
        },
        feedback: [
          { when: 'forgotDiv4', say: 'Casi: al integrar $y$ se divide entre $2$, quedando $\\frac{3c}{4}y^2$ en el exponente.' },
          { when: 'forgotSquare', say: 'Casi: la integral de $y$ es $y^2/2$, con $y$ al cuadrado.' },
          { when: 'negExp', say: 'Casi: el exponente es positivo $+ \\frac{3c}{4}y^2$.' }
        ] }),

    N('muy-n-caso-y-inversa-lineal', 'muy', 3, { p: [2, 4, 1], y0: [2, 3, 1] },
      function (v) { return 'Para la ecuación diferencial $-' + v.p + 'y\\,dx + (x + y^4)\\,dy = 0$ con $y > 0$, calcula el valor del factor integrante $\\mu(' + v.y0 + ')$ tal que $\\mu(1) = 1$.'; },
      function (v) { return Math.pow(v.y0, -(v.p + 1) / v.p); },
      '$N_x = 1, M_y = -p \\Rightarrow (N_x - M_y)/M = -\\frac{p+1}{py} \\Rightarrow \\mu(y) = y^{-(p+1)/p}$.',
      { mistakes: {
          posExp: function (v) { return Math.pow(v.y0, (v.p + 1) / v.p); },
          forgotP: function (v) { return Math.pow(v.y0, -(v.p + 1)); },
          justMinusOne: function (v) { return 1 / v.y0; }
        },
        feedback: [
          { when: 'posExp', say: function (v) { return 'Casi: el denominador $M = -' + v.p + 'y$ introduce signo negativo, exponente $-(p+1)/p$.'; } },
          { when: 'forgotP', say: function (v) { return 'Casi: olvidaste dividir entre $' + v.p + '$ en el exponente: $-(p+1)/p$.'; } },
          { when: 'justMinusOne', say: function (v) { return 'Casi: el exponente exacto es $-\\frac{' + (v.p + 1) + '}{' + v.p + '}$.'; } }
        ] }),

    /* ======================= 4. Función potencial y solución general (16) ======================= */
    C('pot-c-definicion-potencial', 'potencial', 1,
      'Una vez multiplicado el sistema por el factor integrante $\\mu$, ¿qué propiedad define a la función potencial $F(x, y)$?',
      '$\\dfrac{\\partial F}{\\partial x} = \\mu M \\quad \\text{y} \\quad \\dfrac{\\partial F}{\\partial y} = \\mu N$', [
        ['$\\dfrac{\\partial F}{\\partial x} = M \\quad \\text{y} \\quad \\dfrac{\\partial F}{\\partial y} = N$', 'Casi: la ecuación original no era exacta; las derivadas de $F$ deben ser los coeficientes multiplicados por $\\mu$.'],
        ['$F(x, y) = \\mu \\cdot (M + N)$', 'Casi: $F$ no es una multiplicación algebraica, sino una antiderivada que cumple $\\nabla F = (\\mu M, \\mu N)$.'],
        ['$\\dfrac{\\partial^2 F}{\\partial x^2} = \\mu M \\quad \\text{y} \\quad \\dfrac{\\partial^2 F}{\\partial y^2} = \\mu N$', 'Casi: se trata de las primeras derivadas parciales de $F$, no de las segundas.']],
      'La ecuación multiplicada $(\\mu M)\\,dx + (\\mu N)\\,dy = 0$ es el diferencial total $dF = 0$, donde $F_x = \\mu M$ y $F_y = \\mu N$.'),

    C('pot-c-receta-integracion', 'potencial', 1,
      'Para hallar la función potencial $F(x, y)$ a partir de $F_x = \\mu M$, ¿cuál es el procedimiento estándar de la sesión 6?',
      'Integrar $\\mu M$ respecto a $x$ añadiendo una función $h(y)$, y determinar $h\'(y)$ igualando $\\partial_y F = \\mu N$', [
        ['Integrar $\\mu M$ respecto a $x$ y sumarle la integral de $\\mu N$ respecto a $y$ directamente', 'Casi: los términos mixtos que dependen de $x$ y $y$ quedarían contados dos veces si solo sumas ambas integrales.'],
        ['Derivar $\\mu M$ respecto a $x$ y evaluar en $y = 0$', 'Casi: para recuperar $F$ hay que integrar, no volver a derivar.'],
        ['Igualar $\\mu M = \\mu N$ y despejar $y$ en términos de $x$', 'Casi: los dos coeficientes no tienen por qué ser iguales punto a punto.']],
      '$F(x,y) = \\int \\mu M\\,dx + h(y)$. Al derivar respecto a $y$ se despeja $h\'(y) = \\mu N - \\partial_y \\int \\mu M\\,dx$.'),

    C('pot-c-solucion-implicita-C', 'potencial', 1,
      'Una vez obtenida la función potencial $F(x, y)$, ¿cómo se expresa la solución general de la ecuación diferencial?',
      '$F(x, y) = C$, donde $C$ es una constante arbitraria', [
        ['$F(x, y) = 0$, sin ninguna constante libre', 'Casi: las soluciones son toda la familia de curvas de nivel $F(x, y) = C$, no solo la curva cero.'],
        ['$y(x) = F(x, C)$, sustituyendo $y$ por la constante', 'Casi: la constante iguala a la función potencial completa $F(x, y) = C$.'],
        ['$F(x, y) = \\mu(x) + C$', 'Casi: $\\mu$ ya fue utilizado para construir $F$; no vuelve a sumarse al final.']],
      'Como $dF = 0$, al integrar ambos lados resulta que $F(x, y)$ se mantiene constante a lo largo de cada curva solución: $F(x, y) = C$.'),

    C('pot-c-h-prima-solo-y', 'potencial', 1,
      'Al calcular $h\'(y) = \\mu N - \\dfrac{\\partial}{\\partial y}\\left(\\int \\mu M\\,dx\\right)$, ¿qué debe ocurrir obligatoriamente si los cálculos fueron correctos?',
      'Todos los términos que contienen a la variable $x$ deben cancelarse por completo', [
        ['Deben desaparecer todos los términos con $y$, quedando únicamente una función de $x$', 'Casi: $h(y)$ es función de $y$, por lo que $h\'(y)$ solo puede depender de $y$ (o ser constante).'],
        ['El resultado debe ser siempre idénticamente igual a $1$', 'Casi: $h\'(y)$ puede ser cualquier función de $y$, como $y^2$, $-e^y$, o $0$.'],
        ['Debe coincidir exactamente con el factor integrante $\\mu(x)$', 'Casi: $h\'(y)$ proviene de los términos que solo dependían de $y$ en $\\mu N$.']],
      'Como $\\partial_y(\\mu M) = \\partial_x(\\mu N)$, la derivada de esa diferencia respecto a $x$ es cero, garantizando que depende exclusivamente de $y$.'),

    C('pot-c-ejemplo-f-mux', 'potencial', 2,
      'En el ejemplo con $\\mu = x$: $x(3xy + y^2)\\,dx + x(x^2 + xy)\\,dy = 0$, ¿cuál es la función potencial $F(x, y)$?',
      '$F(x, y) = x^3 y + \\dfrac{1}{2}x^2 y^2$', [
        ['$F(x, y) = 3x^2 y + xy^2$', 'Casi: esos son los coeficientes $\\mu M$, no la antiderivada $F$.'],
        ['$F(x, y) = x^3 y + x^2 y^2$', 'Casi: al integrar $xy^2$ respecto a $x$ se divide entre $2$: $\\frac{1}{2}x^2 y^2$.'],
        ['$F(x, y) = x^2 y + \\dfrac{1}{2}x y^2$', 'Casi: olvidaste multiplicar por el factor integrante $\\mu = x$ antes de integrar.']],
      '$\\int (3x^2 y + xy^2)\\,dx = x^3 y + \\frac{1}{2}x^2 y^2 + h(y)$. Derivando respecto a $y$ da $x^3 + x^2 y$, que coincide con $\\mu N$, por lo que $h\'(y) = 0$.'),

    C('pot-c-ejemplo-f-muy', 'potencial', 2,
      'Para la ecuación con $\\mu = y$: $y^2\\,dx + (2xy - y^2 e^y)\\,dy = 0$, ¿qué función $h(y)$ resulta al integrar $F = x y^2 + h(y)$?',
      '$h(y) = -(y^2 - 2y + 2)e^y$', [
        ['$h(y) = -y^2 e^y$', 'Casi: esa es la derivada $h\'(y)$; falta integrarla dos veces por partes respecto a $y$.'],
        ['$h(y) = (y^2 + 2y + 2)e^y$', 'Casi: el término original tiene signo negativo $-y^2 e^y$, por lo que $h(y)$ lleva signo negativo global.'],
        ['$h(y) = -\\dfrac{y^3}{3}e^y$', 'Casi: no puedes integrar $y^2$ y $e^y$ por separado; requiere integración por partes.']],
      '$h\'(y) = -y^2 e^y$. Integrando por partes: $\\int -y^2 e^y\\,dy = -(y^2 - 2y + 2)e^y$.'),

    N('pot-n-evaluar-f-x2y', 'potencial', 2, { b: [1, 4, 1], x0: [1, 2, 1], y0: [1, 3, 1] },
      function (v) { return 'Tras multiplicar por $\\mu(x) = x$, la ecuación $(2y + ' + (3 * v.b) + 'x)\\,dx + x\\,dy = 0$ tiene función potencial $F(x, y) = x^2 y + ' + v.b + 'x^3$. Calcula $F(' + v.x0 + ', ' + v.y0 + ')$.'; },
      function (v) { return v.x0 * v.x0 * v.y0 + v.b * Math.pow(v.x0, 3); },
      'Integrando $\\mu M = 2xy + 3bx^2$ respecto a $x$ resulta $F(x, y) = x^2 y + bx^3$.',
      { mistakes: {
          noMu: function (v) { return 2 * v.x0 * v.y0 + 1.5 * v.b * v.x0 * v.x0; },
          forgotB: function (v) { return v.x0 * v.x0 * v.y0 + Math.pow(v.x0, 3); },
          forgotSqr: function (v) { return v.x0 * v.y0 + v.b * Math.pow(v.x0, 3); }
        },
        feedback: [
          { when: 'noMu', say: 'Casi: integraste los coeficientes sin multiplicar por el factor integrante $\\mu = x$.' },
          { when: 'forgotB', say: function (v) { return 'Casi: el término cúbico lleva el coeficiente $' + v.b + 'x^3$.'; } },
          { when: 'forgotSqr', say: 'Casi: el primer término es $x^2 y$, con $x$ al cuadrado.' }
        ] }),

    N('pot-n-evaluar-f-muy-potencia', 'potencial', 2, { a: [1, 4, 1], x0: [1, 3, 1], y0: [1, 3, 1] },
      function (v) { return 'Al multiplicar $y\\,dx + (2x + ' + (3 * v.a) + 'y)\\,dy = 0$ por $\\mu(y) = y$, la ecuación exacta resultante tiene función potencial $F(x, y) = x y^2 + ' + v.a + 'y^3$. Evalúa $F(' + v.x0 + ', ' + v.y0 + ')$.'; },
      function (v) { return v.x0 * v.y0 * v.y0 + v.a * Math.pow(v.y0, 3); },
      'Con $\\mu = y$: $\\mu M = y^2$ y $\\mu N = 2xy + 3ay^2$, por lo que $F(x, y) = xy^2 + ay^3$.',
      { mistakes: {
          forgotA: function (v) { return v.x0 * v.y0 * v.y0 + Math.pow(v.y0, 3); },
          noMu: function (v) { return v.x0 * v.y0 + 1.5 * v.a * v.y0 * v.y0; },
          sqrY: function (v) { return v.x0 * v.y0 * v.y0 + v.a * v.y0 * v.y0; }
        },
        feedback: [
          { when: 'forgotA', say: function (v) { return 'Casi: el término cúbico tiene coeficiente $' + v.a + ': ' + v.a + 'y^3$.'; } },
          { when: 'noMu', say: 'Casi: integraste sin multiplicar previamente por $\\mu(y) = y$.' },
          { when: 'sqrY', say: 'Casi: el segundo término es $y^3$, no $y^2$.' }
        ] }),

    N('pot-n-hprima-coeficiente', 'potencial', 2, { a: [2, 5, 1], y0: [1, 3, 1] },
      function (v) { return 'Para la ecuación exacta multiplicada $(2x y^2)\\,dx + (2x^2 y + ' + (4 * v.a) + 'y^3)\\,dy = 0$, se integra respecto a $x$ obteniendo $F = x^2 y^2 + h(y)$. ¿Cuánto vale $h\'(' + v.y0 + ')$?'; },
      function (v) { return 4 * v.a * Math.pow(v.y0, 3); },
      '$h\'(y) = \\mu N - \\partial_y(x^2 y^2) = (2x^2 y + 4ay^3) - 2x^2 y = 4ay^3$.',
      { mistakes: {
          integrated: function (v) { return v.a * Math.pow(v.y0, 4); },
          forgot4: function (v) { return v.a * Math.pow(v.y0, 3); },
          sqrY: function (v) { return 4 * v.a * v.y0 * v.y0; }
        },
        feedback: [
          { when: 'integrated', say: function (v) { return 'Casi: ese es el valor de $h(y) = ay^4$; te piden la derivada $h\'(y) = ' + (4 * v.a) + 'y^3$.'; } },
          { when: 'forgot4', say: function (v) { return 'Casi: el coeficiente de $y^3$ en $\\mu N$ es $' + (4 * v.a) + '$, no $' + v.a + '$.'; } },
          { when: 'sqrY', say: 'Casi: la potencia de $y$ es $y^3$, no $y^2$.' }
        ] }),

    N('pot-n-constante-c-eval', 'potencial', 2, { a: [1, 4, 1], x0: [1, 3, 1], y0: [1, 2, 1] },
      function (v) { return 'La función potencial de una EDO exacta es $F(x, y) = x^3 y + ' + v.a + 'x\\,y^2$. Si la curva solución pasa por el punto $(' + v.x0 + ', ' + v.y0 + ')$, calcula el valor de la constante $C$ en $F(x, y) = C$.'; },
      function (v) { return Math.pow(v.x0, 3) * v.y0 + v.a * v.x0 * v.y0 * v.y0; },
      'Sustituyendo el punto $(x_0, y_0)$ en la función potencial se obtiene $C = x_0^3 y_0 + a x_0 y_0^2$.',
      { mistakes: {
          forgotSqr: function (v) { return Math.pow(v.x0, 3) * v.y0 + v.a * v.x0 * v.y0; },
          forgotA: function (v) { return Math.pow(v.x0, 3) * v.y0 + v.x0 * v.y0 * v.y0; },
          swappedXY: function (v) { return v.x0 * Math.pow(v.y0, 3) + v.a * v.x0 * v.x0 * v.y0; }
        },
        feedback: [
          { when: 'forgotSqr', say: function (v) { return 'Casi: en el segundo término la variable $y$ está al cuadrado: $' + v.a + 'xy^2$.'; } },
          { when: 'forgotA', say: function (v) { return 'Casi: el segundo término lleva el factor $' + v.a + '$.'; } },
          { when: 'swappedXY', say: 'Casi: confundiste los valores de $x$ y $y$ al sustituir.' }
        ] }),

    E('pot-e-potencial-mux-simple', 'potencial', 2, { a: [2, 5, 1] },
      function (v) { return 'Halla la función potencial $F(x, y)$ con $F(0, 0) = 0$ para la ecuación exacta multiplicada $(' + (3 * v.a) + 'x^2 y)\\,dx + (' + v.a + 'x^3)\\,dy = 0$. Escribe la expresión en términos de $x$ y $y$.'; },
      function (v) { return v.a + '*x^3*y'; },
      'Integrando $\\mu M = 3ax^2 y$ respecto a $x$ se obtiene $F(x, y) = ax^3 y$.',
      { exprVars: ['x', 'y'], domain: [0.5, 2],
        mistakes: {
          threeA: function (v) { return (3 * v.a) + '*x^3*y'; },
          sqrX: function (v) { return v.a + '*x^2*y'; },
          sqrY: function (v) { return v.a + '*x^3*y^2'; }
        },
        feedback: [
          { when: 'threeA', say: function (v) { return 'Casi: al integrar $' + (3 * v.a) + 'x^2$ respecto a $x$ se divide entre $3$, quedando $' + v.a + 'x^3 y$.'; } },
          { when: 'sqrX', say: 'Casi: la integral de $x^2$ es $x^3/3$, con $x$ al cubo.' },
          { when: 'sqrY', say: 'Casi: la variable $y$ está a la primera potencia, no al cuadrado.' }
        ] }),

    E('pot-e-potencial-muy-simple', 'potencial', 2, { b: [2, 5, 1] },
      function (v) { return 'Determina la función potencial $F(x, y)$ con $F(0, 0) = 0$ de la forma exacta $(x + ' + (2 * v.b) + 'y)\\,dx + (' + (2 * v.b) + 'x + y)\\,dy = 0$. Escribe la expresión en $x$ y $y$.'; },
      function (v) { return '0.5*x^2 + ' + (2 * v.b) + '*x*y + 0.5*y^2'; },
      function (v) { return 'Integrando respecto a $x$ y completando con $h(y)$ se obtiene $F(x, y) = \\frac{1}{2}x^2 + ' + (2 * v.b) + 'xy + \\frac{1}{2}y^2$.'; },
      { exprVars: ['x', 'y'], domain: [0.5, 2.5],
        mistakes: {
          noHalves: function (v) { return 'x^2 + ' + (2 * v.b) + '*x*y + y^2'; },
          forgotMixed: function () { return '0.5*x^2 + 0.5*y^2'; },
          halfMixed: function (v) { return '0.5*x^2 + ' + v.b + '*x*y + 0.5*y^2'; }
        },
        feedback: [
          { when: 'noHalves', say: 'Casi: las integrales de $x$ y de $y$ llevan el factor $1/2$: $\\frac{1}{2}x^2$ y $\\frac{1}{2}y^2$.' },
          { when: 'forgotMixed', say: function (v) { return 'Casi: olvidaste el término mixto $' + (2 * v.b) + 'xy$.'; } },
          { when: 'halfMixed', say: function (v) { return 'Casi: al integrar $' + (2 * v.b) + 'y$ respecto a $x$ queda $' + (2 * v.b) + 'xy$, sin dividir entre $2$.'; } }
        ] }),

    N('pot-n-despejar-y-cuadratica', 'potencial', 3, { a: [1, 3, 1], c: [10, 20, 2], x0: [1, 2, 1] },
      function (v) { return 'Una ecuación reducida a exacta tiene solución $x^2 y^2 + ' + v.a + 'x^3 = ' + v.c + '$. Si $y > 0$, calcula el valor de $y(' + v.x0 + ')$.'; },
      function (v) { return Math.sqrt(v.c - v.a * Math.pow(v.x0, 3)) / v.x0; },
      '$x^2 y^2 = C - ax^3 \\Rightarrow y = \\frac{\\sqrt{C - ax^3}}{x}$.',
      { where: function (v) { return v.c - v.a * Math.pow(v.x0, 3) > 1; },
        mistakes: {
          forgotSqrt: function (v) { return (v.c - v.a * Math.pow(v.x0, 3)) / (v.x0 * v.x0); },
          noDivX: function (v) { return Math.sqrt(v.c - v.a * Math.pow(v.x0, 3)); },
          plusSign: function (v) { return Math.sqrt(v.c + v.a * Math.pow(v.x0, 3)) / v.x0; }
        },
        feedback: [
          { when: 'forgotSqrt', say: 'Casi: ese es el valor de $y^2$; falta sacar la raíz cuadrada.' },
          { when: 'noDivX', say: function (v) { return 'Casi: olvidaste dividir entre $x = ' + v.x0 + '$ al despejar $y$.'; } },
          { when: 'plusSign', say: function (v) { return 'Casi: al pasar $' + v.a + 'x^3$ al lado derecho pasa restando: $C - ax^3$.'; } }
        ] }),

    N('pot-n-despejar-x-de-f', 'potencial', 3, { b: [1, 3, 1], c: [12, 24, 2], y0: [1, 2, 1] },
      function (v) { return 'La solución general es $x\\,y^3 + ' + v.b + 'y^2 = ' + v.c + '$. Calcula el valor de $x$ correspondiente a $y = ' + v.y0 + '$.'; },
      function (v) { return (v.c - v.b * v.y0 * v.y0) / Math.pow(v.y0, 3); },
      'Despejando $x$: $x = \\frac{C - by^2}{y^3}$.',
      { mistakes: {
          plusB: function (v) { return (v.c + v.b * v.y0 * v.y0) / Math.pow(v.y0, 3); },
          divY: function (v) { return (v.c - v.b * v.y0 * v.y0) / v.y0; },
          forgotB: function (v) { return v.c / Math.pow(v.y0, 3); }
        },
        feedback: [
          { when: 'plusB', say: function (v) { return 'Casi: el término $' + v.b + 'y^2$ pasa restando al lado derecho: $C - by^2$.'; } },
          { when: 'divY', say: function (v) { return 'Casi: el coeficiente de $x$ es $y^3$, por lo que debes dividir entre $y^3$, no entre $y$.'; } },
          { when: 'forgotB', say: function (v) { return 'Casi: olvidaste restar el término $' + v.b + 'y^2$ antes de despejar $x$.'; } }
        ] }),

    E('pot-e-potencial-completa-mux', 'potencial', 3, { a: [1, 3, 1] },
      function (v) { return 'Para la ecuación $(2x y + ' + (3 * v.a) + 'x^2)\\,dx + (x^2)\\,dy = 0$, que ya es exacta (con $\\mu = 1$), escribe la función potencial $F(x, y)$ que cumple $F(0, 0) = 0$.'; },
      function (v) { return 'x^2*y + ' + v.a + '*x^3'; },
      'Integrando respecto a $x$: $F(x, y) = x^2 y + ax^3$.',
      { exprVars: ['x', 'y'], domain: [0.5, 2],
        mistakes: {
          threeA: function (v) { return 'x^2*y + ' + (3 * v.a) + '*x^3'; },
          forgotY: function (v) { return 'x^2 + ' + v.a + '*x^3'; },
          sqrY: function (v) { return 'x^2*y^2 + ' + v.a + '*x^3'; }
        },
        feedback: [
          { when: 'threeA', say: function (v) { return 'Casi: al integrar $' + (3 * v.a) + 'x^2$ respecto a $x$ se divide entre $3$, quedando $' + v.a + 'x^3$.'; } },
          { when: 'forgotY', say: 'Casi: el primer término es $x^2 y$, no $x^2$.' },
          { when: 'sqrY', say: 'Casi: la integral de $2y$ respecto a $x$ es $2xy$, que al integrar da $x^2 y$, no con $y^2$.' }
        ] }),

    E('pot-e-potencial-completa-muy', 'potencial', 3, { b: [1, 3, 1] },
      function (v) { return 'Halla la función potencial $F(x, y)$ con $F(0, 0) = 0$ de la forma exacta $(y^2)\\,dx + (2xy + ' + (4 * v.b) + 'y^3)\\,dy = 0$. Escribe la expresión en $x$ y $y$.'; },
      function (v) { return 'x*y^2 + ' + v.b + '*y^4'; },
      'Integrando $F_x = y^2$ da $xy^2 + h(y)$, y con $h\'(y) = 4by^3$ resulta $h(y) = by^4$.',
      { exprVars: ['x', 'y'], domain: [0.5, 2],
        mistakes: {
          fourB: function (v) { return 'x*y^2 + ' + (4 * v.b) + '*y^4'; },
          sqrX: function (v) { return 'x^2*y^2 + ' + v.b + '*y^4'; },
          cubeY: function (v) { return 'x*y^2 + ' + v.b + '*y^3'; }
        },
        feedback: [
          { when: 'fourB', say: function (v) { return 'Casi: al integrar $' + (4 * v.b) + 'y^3$ respecto a $y$ se divide entre $4$, quedando $' + v.b + 'y^4$.'; } },
          { when: 'sqrX', say: 'Casi: la integral de $y^2$ respecto a $x$ es $x y^2$, no $x^2 y^2$.' },
          { when: 'cubeY', say: 'Casi: la integral de $y^3$ es $y^4/4$, con exponente $4$.' }
        ] }),

    /* ======================= 5. Problemas de valor inicial y evaluación (18) ======================= */
    C('pvi-c-proposito-condicion-inicial', 'pvi', 1,
      'En un problema de valor inicial con ecuación reducible a exacta, ¿para qué se utiliza la condición $y(x_0) = y_0$?',
      'Para fijar la constante arbitraria $C$ evaluando la función potencial: $C = F(x_0, y_0)$', [
        ['Para determinar el factor integrante $\\mu(x)$ antes de integrar', 'Casi: el factor integrante $\\mu$ surge de la estructura algebraica de la ecuación, no del punto inicial.'],
        ['Para cancelar las derivadas parciales en el punto $(x_0, y_0)$', 'Casi: la condición inicial no anula derivadas, solo selecciona una curva de nivel específica de la familia.'],
        ['Para comprobar si la ecuación es separable o lineal', 'Casi: la clasificación del tipo de EDO es independiente de las condiciones iniciales.']],
      'La condición inicial $(x_0, y_0)$ permite calcular el valor numérico exacto de $C = F(x_0, y_0)$, determinando la única curva solución del PVI.'),

    C('pvi-c-unicidad-y-singularidad', 'pvi', 1,
      'Si el factor integrante es $\\mu(x) = \\dfrac{1}{x}$, ¿en qué región está garantizada la solución única para un PVI con $x_0 = 1$?',
      'En el semiplano $x > 0$, donde $\\mu(x)$ y los coeficientes son continuos y no se indefinen', [
        ['En toda la recta real $-\\infty < x < \\infty$ sin ninguna excepción', 'Casi: en $x = 0$ el factor integrante $\\mu = 1/x$ se indefine, dividiendo el dominio en dos regiones disjuntas.'],
        ['Exclusivamente en el punto aislado $x = 1$', 'Casi: el teorema de existencia y unicidad garantiza la solución en un intervalo abierto alrededor de $x_0$.'],
        ['En el semiplano negativo $x < 0$', 'Casi: la condición inicial está en $x_0 = 1 > 0$, por lo que el intervalo de validez contiene a $x_0$ y se restringe a $x > 0$.']],
      'La solución vive en el intervalo continuo que contiene al punto inicial $x_0$ y no cruza las singularidades de la ecuación o de $\\mu$.'),

    C('pvi-c-eleccion-signo-raiz', 'pvi', 2,
      'Al despejar $y(x)$ de una relación cuadrática $y^2 = g(x)$, ¿cómo se decide entre el signo positivo o negativo de la raíz cuadrada?',
      'Eligiendo el signo que coincide con el valor inicial $y(x_0) = y_0$', [
        ['Eligiendo siempre el signo positivo por convención matemática universal', 'Casi: si la condición inicial es negativa ($y(x_0) < 0$), debe elegirse la raíz negativa $-\\sqrt{g(x)}$.'],
        ['Promediando ambas raíces para obtener una función continua', 'Casi: la solución es una función, no la suma de dos ramas; se toma la rama que pasa por $(x_0, y_0)$.'],
        ['Eligiendo el signo que haga decreciente a la derivada $y\'$', 'Casi: el signo lo determina el valor de $y(x_0)$, no la monotonía de la derivada.']],
      'Para que la función solución cumpla $y(x_0) = y_0$, el signo de la raíz debe concordar con el signo de la condición inicial $y_0$.'),

    C('pvi-c-verificacion-solucion-pvi', 'pvi', 2,
      '¿Cuál es la forma más directa de verificar numéricamente que una función $y(x)$ obtenida es la solución correcta del PVI?',
      'Verificar que $y(x_0) = y_0$ y que al sustituir $y(x)$ y $y\'(x)$ en la EDO original se cumple la igualdad', [
        ['Comprobar únicamente que $y(x_0) = y_0$, pues eso garantiza que cumple la EDO', 'Casi: infinitas funciones pasan por el punto inicial; además debe satisfacer la ecuación diferencial.'],
        ['Calcular la integral definida de $y(x)$ entre $0$ y $1$', 'Casi: el área bajo la curva no es la definición de solución de una EDO.'],
        ['Multiplicar $y(x)$ por el factor integrante y comprobar que dé cero', 'Casi: la solución $y(x)$ no tiene por qué anularse al multiplicarla por $\\mu$.']],
      'Una solución de un PVI debe satisfacer tanto la condición inicial como la ecuación diferencial en todo su intervalo de definición.'),

    N('pvi-n-calcular-c-mux', 'pvi', 2, { a: [1, 4, 1], b: [1, 3, 1] },
      function (v) { return 'Considera la ecuación $(2y^2 + ' + (3 * v.a) + 'x)\\,dx + 2xy\\,dy = 0$, cuyo factor integrante es $\\mu = x$ y su función potencial es $F(x, y) = x^2 y^2 + ' + v.a + 'x^3$. Si se tiene la condición $y(1) = ' + v.b + '$, calcula el valor de la constante $C = F(1, ' + v.b + ')$.'; },
      function (v) { return v.b * v.b + v.a; },
      '$C = F(1, b) = 1^2 \\cdot b^2 + a \\cdot 1^3 = b^2 + a$.',
      { mistakes: {
          forgotSquare: function (v) { return v.b + v.a; },
          noA: function (v) { return v.b * v.b; },
          noMu: function (v) { return 2 * v.b * v.b + 1.5 * v.a; }
        },
        feedback: [
          { when: 'forgotSquare', say: function (v) { return 'Casi: en $F$ el término es $y^2$, por lo que debes elevar $' + v.b + '$ al cuadrado.'; } },
          { when: 'noA', say: function (v) { return 'Casi: olvidaste sumar $' + v.a + 'x^3 = ' + v.a + '$.'; } },
          { when: 'noMu', say: 'Casi: la función potencial correcta tras multiplicar por $\\mu = x$ es $x^2 y^2 + ax^3$.' }
        ] }),

    N('pvi-n-evaluar-y-en-x1', 'pvi', 2, { a: [1, 3, 1], b: [1, 3, 1], x1: [2, 3, 1] },
      function (v) { return 'Un PVI tiene como solución implícita $x^2 y^2 + ' + v.a + 'x^3 = ' + (v.b * v.b + 35 * v.a) + '$ con $y > 0$. Calcula el valor de $y(' + v.x1 + ')$.'; },
      function (v) { return Math.sqrt(v.b * v.b + v.a * (35 - Math.pow(v.x1, 3))) / v.x1; },
      '$x^2 y^2 = C - ax^3 \\Rightarrow y = \\frac{\\sqrt{C - ax^3}}{x}$.',
      { mistakes: {
          forgotSqrt: function (v) { return (v.b * v.b + v.a * (35 - Math.pow(v.x1, 3))) / (v.x1 * v.x1); },
          noDivX: function (v) { return Math.sqrt(v.b * v.b + v.a * (35 - Math.pow(v.x1, 3))); },
          plusA: function (v) { return Math.sqrt(v.b * v.b + v.a * (35 + Math.pow(v.x1, 3))) / v.x1; }
        },
        feedback: [
          { when: 'forgotSqrt', say: 'Casi: ese es el valor de $y^2$; saca raíz cuadrada.' },
          { when: 'noDivX', say: function (v) { return 'Casi: falta dividir entre $x = ' + v.x1 + '$.'; } },
          { when: 'plusA', say: function (v) { return 'Casi: el término $' + v.a + 'x^3$ pasa restando a la constante.'; } }
        ] }),

    N('pvi-n-calcular-c-muy', 'pvi', 2, { a: [1, 4, 1], y0: [1, 3, 1] },
      function (v) { return 'La ecuación $y\\,dx + (2x + ' + (3 * v.a) + 'y)\\,dy = 0$ con factor integrante $\\mu = y$ tiene potencial $F(x, y) = x y^2 + ' + v.a + 'y^3$. Para la condición inicial $y(2) = ' + v.y0 + '$, calcula el valor de la constante $C$.'; },
      function (v) { return 2 * v.y0 * v.y0 + v.a * Math.pow(v.y0, 3); },
      '$C = F(2, y_0) = 2y_0^2 + ay_0^3$.',
      { mistakes: {
          forgotA: function (v) { return 2 * v.y0 * v.y0 + Math.pow(v.y0, 3); },
          forgot2: function (v) { return v.y0 * v.y0 + v.a * Math.pow(v.y0, 3); },
          forgotCube: function (v) { return 2 * v.y0 * v.y0 + v.a * v.y0 * v.y0; }
        },
        feedback: [
          { when: 'forgotA', say: function (v) { return 'Casi: el segundo término lleva el factor $' + v.a + '$.'; } },
          { when: 'forgot2', say: function (v) { return 'Casi: en el punto $(x_0, y_0)$ se tiene $x_0 = 2$, por lo que el primer término es $2y_0^2$.'; } },
          { when: 'forgotCube', say: 'Casi: el término con $a$ lleva $y_0^3$, no $y_0^2$.' }
        ] }),

    N('pvi-n-evaluar-x-dado-y', 'pvi', 2, { a: [1, 3, 1], y0: [2, 3, 1] },
      function (v) { return 'Para la curva $x y^2 + ' + v.a + 'y^3 = ' + (10 + 8 * v.a) + '$, halla el valor de la coordenada $x$ cuando $y = ' + v.y0 + '$.'; },
      function (v) { return (10 + 8 * v.a - v.a * Math.pow(v.y0, 3)) / (v.y0 * v.y0); },
      'Despejando $x$: $x = \\frac{C - ay^3}{y^2}$.',
      { mistakes: {
          divY: function (v) { return (10 + 8 * v.a - v.a * Math.pow(v.y0, 3)) / v.y0; },
          plusA: function (v) { return (10 + 8 * v.a + v.a * Math.pow(v.y0, 3)) / (v.y0 * v.y0); },
          forgotA: function (v) { return (10 + 8 * v.a - Math.pow(v.y0, 3)) / (v.y0 * v.y0); }
        },
        feedback: [
          { when: 'divY', say: function (v) { return 'Casi: debes dividir entre $y^2 = ' + (v.y0 * v.y0) + '$, no entre $y$.'; } },
          { when: 'plusA', say: function (v) { return 'Casi: al pasar $' + v.a + 'y^3$ al lado derecho cambia a signo negativo.'; } },
          { when: 'forgotA', say: function (v) { return 'Casi: el término cúbico tiene coeficiente $' + v.a + '$.'; } }
        ] }),

    N('pvi-n-pendiente-en-condicion-inicial', 'pvi', 2, { a: [2, 5, 1], b: [2, 4, 1] },
      function (v) { return 'Dada la ecuación $(' + v.a + 'y^2 + x)\\,dx + (' + v.b + 'xy)\\,dy = 0$, calcula el valor de la pendiente $y\'(1)$ para la solución que cumple $y(1) = 2$.'; },
      function (v) { return -(4 * v.a + 1) / (2 * v.b); },
      '$y\'(1) = -M(1, 2)/N(1, 2) = -(4a + 1)/(2b)$.',
      { mistakes: {
          posSign: function (v) { return (4 * v.a + 1) / (2 * v.b); },
          inverse: function (v) { return -(2 * v.b) / (4 * v.a + 1); },
          forgotOne: function (v) { return -(4 * v.a) / (2 * v.b); }
        },
        feedback: [
          { when: 'posSign', say: 'Casi: de $M\\,dx + N\\,dy = 0$ se despeja $y\' = -M/N$, con signo negativo.' },
          { when: 'inverse', say: 'Casi: la derivada es $dy/dx = -M/N$, no $-N/M$.' },
          { when: 'forgotOne', say: 'Casi: en $M = ay^2 + x$ con $x = 1$ debes sumar $+1$.' }
        ] }),

    N('pvi-n-concavidad-en-x0', 'pvi', 2, { a: [2, 4, 1] },
      function (v) { return 'Si $y\' = -\\dfrac{y + ' + v.a + 'x}{x}$ y la solución cumple $y(1) = 1$, calcula la segunda derivada $y\'\'(1)$.'; },
      function (v) { return v.a + 2; },
      '$y\'\' = \\frac{y - x y\'}{x^2}$. Sustituyendo $y(1)=1$ y $y\'(1)=-(a+1)$ resulta $y\'\'(1) = 1 + (a+1) = a+2$.',
      { mistakes: {
          negVal: function (v) { return -(v.a + 2); },
          forgot2: function (v) { return v.a + 1; },
          justA: function (v) { return v.a; }
        },
        feedback: [
          { when: 'negVal', say: function (v) { return 'Casi: $y - x y\' = 1 - (-(a+1)) = ' + (v.a + 2) + ' > 0$, con signo positivo.'; } },
          { when: 'forgot2', say: function (v) { return 'Casi: $1 - (-' + v.a + ' - 1) = ' + (v.a + 2) + '$, no $' + (v.a + 1) + '$.'; } },
          { when: 'justA', say: function (v) { return 'Casi: el término constante es $+2$, dando $' + (v.a + 2) + '$.'; } }
        ] }),

    E('pvi-e-solucion-explicita-mux', 'pvi', 2, { a: [2, 5, 1] },
      function (v) { return 'Resuelve el PVI $(2y + ' + (3 * v.a) + 'x)\\,dx + x\\,dy = 0$ con $y(1) = 0$ para $x > 0$. Escribe la solución explícita $y(x)$.'; },
      function (v) { return v.a + '/x^2 - ' + v.a + '*x'; },
      '$F(x, y) = x^2 y + ax^3 = a \\Rightarrow y(x) = \\frac{a - ax^3}{x^2} = \\frac{a}{x^2} - ax$.',
      { domain: [0.5, 2],
        mistakes: {
          posAx: function (v) { return v.a + '/x^2 + ' + v.a + '*x'; },
          noDivX2: function (v) { return v.a + ' - ' + v.a + '*x^3'; },
          linear: function (v) { return v.a + ' - ' + v.a + '*x'; }
        },
        feedback: [
          { when: 'posAx', say: function (v) { return 'Casi: al despejar $x^2 y = a - ax^3$ el término con $x$ tiene signo negativo $-' + v.a + 'x$.'; } },
          { when: 'noDivX2', say: 'Casi: falta dividir entre $x^2$ para despejar $y$.' },
          { when: 'linear', say: 'Casi: la solución decae como $1/x^2$, no lineal.' }
        ] }),

    E('pvi-e-solucion-explicita-muy', 'pvi', 2, { k: [1, 4, 1] },
      function (v) { return 'Resuelve el PVI de variables separadas por factor integrante $(y)\\,dx + (x + ' + (2 * v.k) + 'y)\\,dy = 0$ con $y(0) = 1$. Escribe $y(x)$ con $y > 0$.'; },
      function (v) { return '(-x + sqrt(x^2 + ' + (4 * v.k * v.k) + ')) / (' + (2 * v.k) + ')'; },
      '$F(x, y) = xy + ky^2 = k$. Despejando $y$ con la fórmula general sale $y(x) = \\frac{-x + \\sqrt{x^2 + 4k^2}}{2k}$.',
      { domain: [0.1, 3],
        mistakes: {
          minusSqrt: function (v) { return '(-x - sqrt(x^2 + ' + (4 * v.k * v.k) + ')) / (' + (2 * v.k) + ')'; },
          noDiv2k: function (v) { return '-x + sqrt(x^2 + ' + (4 * v.k * v.k) + ')'; },
          forgot4: function (v) { return '(-x + sqrt(x^2 + ' + (v.k * v.k) + ')) / (' + (2 * v.k) + ')'; }
        },
        feedback: [
          { when: 'minusSqrt', say: 'Casi: como $y(0) = 1 > 0$, la raíz debe llevar signo positivo $+$.' },
          { when: 'noDiv2k', say: function (v) { return 'Casi: en la fórmula cuadrática se divide entre $2k = ' + (2 * v.k) + '$.'; } },
          { when: 'forgot4', say: 'Casi: el discriminante es $b^2 - 4ac = x^2 - 4(k)(-k) = x^2 + 4k^2$.' }
        ] }),

    N('pvi-n-valor-al-cuadrado-pvi', 'pvi', 3, { y0: [1, 4, 1] },
      function (v) { return 'Para el PVI $(2y^2 + 3x)\\,dx + 2xy\\,dy = 0$ con condición inicial $y(1) = ' + v.y0 + '$, calcula el valor exacto de $y(0.5)^2$.'; },
      function (v) { return 4 * v.y0 * v.y0 + 3.5; },
      '$x^2 y^2 + x^3 = y_0^2 + 1$. En $x = 0.5$: $0.25 y^2 + 0.125 = y_0^2 + 1 \\Rightarrow y^2 = 4y_0^2 + 3.5$.',
      { mistakes: {
          noDiv025: function (v) { return v.y0 * v.y0 + 0.875; },
          forgotX3: function (v) { return 4 * v.y0 * v.y0; },
          noMu: function (v) { return v.y0 * v.y0 + 1.125; }
        },
        feedback: [
          { when: 'noDiv025', say: 'Casi: olvidaste dividir entre $x^2 = 0.25$ para despejar $y^2$.' },
          { when: 'forgotX3', say: 'Casi: olvidaste el término $x^3 = 0.125$ al despejar.' },
          { when: 'noMu', say: 'Casi: integraste sin el factor integrante $\\mu = x$.' }
        ] }),

    N('pvi-n-valor-y-en-punto-raiz', 'pvi', 3, { y0: [1, 4, 1] },
      function (v) { return 'Resuelve $(2y^2 + 3x)\\,dx + 2xy\\,dy = 0$ con $y(1) = ' + v.y0 + '$ y calcula el valor de $y(0.5)$ (con $y > 0$).'; },
      function (v) { return Math.sqrt(4 * v.y0 * v.y0 + 3.5); },
      '$y(0.5) = \\frac{\\sqrt{y_0^2 + 1 - 0.125}}{0.5} = \\sqrt{4y_0^2 + 3.5}$.',
      { mistakes: {
          forgotRoot: function (v) { return 4 * v.y0 * v.y0 + 3.5; },
          noDiv05: function (v) { return Math.sqrt(v.y0 * v.y0 + 0.875); },
          forgot35: function (v) { return 2 * v.y0; }
        },
        feedback: [
          { when: 'forgotRoot', say: 'Casi: ese es $y(0.5)^2$; saca la raíz cuadrada positiva.' },
          { when: 'noDiv05', say: 'Casi: falta dividir entre $x = 0.5$.' },
          { when: 'forgot35', say: 'Casi: olvidaste el término $+3.5$ dentro del radicando.' }
        ] }),

    N('pvi-n-tiempo-o-posicion-critica', 'pvi', 3, { a: [2, 5, 1], y0: [2, 4, 1] },
      function (v) { return 'La solución del PVI $x\\,y\' + ' + v.a + 'y = 0$ con $y(1) = ' + v.y0 + '$ es $y(x) = \\dfrac{' + v.y0 + '}{x^{' + v.a + '}}$. ¿Para qué valor de $x > 0$ se cumple $y(x) = 1$?'; },
      function (v) { return Math.pow(v.y0, 1 / v.a); },
      '$y_0 / x^a = 1 \\Rightarrow x^a = y_0 \\Rightarrow x = y_0^{1/a}$.',
      { mistakes: {
          powA: function (v) { return Math.pow(v.y0, v.a); },
          divA: function (v) { return v.y0 / v.a; },
          multA: function (v) { return v.y0 * v.a; }
        },
        feedback: [
          { when: 'powA', say: function (v) { return 'Casi: de $x^' + v.a + ' = y_0$ se despeja con raíz: $y_0^{1/' + v.a + '}$, no $y_0^' + v.a + '$.'; } },
          { when: 'divA', say: function (v) { return 'Casi: la relación es potencial, no lineal: $x = y_0^{1/' + v.a + '}$.'; } },
          { when: 'multA', say: function (v) { return 'Casi: debes sacar la raíz $' + v.a + '$-ésima de $y_0$.'; } }
        ] }),

    N('pvi-n-corte-eje-x', 'pvi', 3, { a: [1, 4, 1], c: [2, 6, 1] },
      function (v) { return 'La curva solución de una EDO exacta es $x^2 y + ' + v.a + 'x^2 = ' + (v.a * v.c * v.c) + '$. ¿En qué valor positivo de $x$ la curva corta al eje horizontal (donde $y = 0$)?'; },
      function (v) { return v.c; },
      'Con $y = 0$ queda $ax^2 = ac^2 \\Rightarrow x^2 = c^2 \\Rightarrow x = c$.',
      { mistakes: {
          cSquared: function (v) { return v.c * v.c; },
          timesA: function (v) { return v.a * v.c; },
          halfC: function (v) { return v.c / 2; }
        },
        feedback: [
          { when: 'cSquared', say: function (v) { return 'Casi: ese es el valor de $x^2$; saca raíz cuadrada para obtener $x = ' + v.c + '$.'; } },
          { when: 'timesA', say: function (v) { return 'Casi: el coeficiente $' + v.a + '$ se cancela de ambos lados.'; } },
          { when: 'halfC', say: function (v) { return 'Casi: la raíz de $' + (v.c * v.c) + '$ es $' + v.c + '$.'; } }
        ] }),

    E('pvi-e-solucion-exponencial-pvi', 'pvi', 3, { a: [2, 4, 1] },
      function (v) { return 'Resuelve el PVI $(' + v.a + 'y - e^{-x})\\,dx + dy = 0$ con $y(0) = 0$. Escribe la solución $y(x)$.'; },
      function (v) { return '(e^(-x) - e^(-' + v.a + '*x)) / ' + (v.a - 1); },
      'Con $\\mu = e^{ax}$ se obtiene la solución estándar $y(x) = \\frac{e^{-x} - e^{-ax}}{a-1}$.',
      { domain: [0.2, 2],
        mistakes: {
          posExp: function (v) { return '(e^x - e^(' + v.a + '*x)) / ' + (v.a - 1); },
          forgotDenom: function (v) { return 'e^(-x) - e^(-' + v.a + '*x)'; },
          swapped: function (v) { return '(e^(-' + v.a + '*x) - e^(-x)) / ' + (v.a - 1); }
        },
        feedback: [
          { when: 'posExp', say: 'Casi: los exponentes deben ser negativos para que decaigan hacia cero.' },
          { when: 'forgotDenom', say: function (v) { return 'Casi: olvidaste dividir entre $' + (v.a - 1) + '$ que sale de integrar $e^{' + (v.a - 1) + 'x}$.'; } },
          { when: 'swapped', say: function (v) { return 'Casi: el orden de la resta es $e^{-x} - e^{-' + v.a + 'x}$.'; } }
        ] }),

    E('pvi-e-solucion-pvi-potencia-pura', 'pvi', 3, { k: [2, 4, 1] },
      function (v) { return 'Resuelve el PVI $((' + (v.k + 1) + ')y)\\,dx + x\\,dy = 0$ con condición inicial $y(1) = 1$ para $x > 0$. Escribe $y(x)$.'; },
      function (v) { return 'x^(-' + (v.k + 1) + ')'; },
      '$F(x, y) = x^{k+1}y = 1 \\Rightarrow y(x) = x^{-(k+1)}$.',
      { domain: [0.5, 3],
        mistakes: {
          posExp: function (v) { return 'x^' + (v.k + 1); },
          kOnly: function (v) { return 'x^(-' + v.k + ')'; },
          linear: function (v) { return '1 / (' + (v.k + 1) + '*x)'; }
        },
        feedback: [
          { when: 'posExp', say: function (v) { return 'Casi: de $x^{' + (v.k + 1) + '}y = 1$ al despejar $y$ el exponente es negativo: $x^{-' + (v.k + 1) + '}$.'; } },
          { when: 'kOnly', say: function (v) { return 'Casi: el exponente total es $k + 1 = ' + (v.k + 1) + '$, no $k$.'; } },
          { when: 'linear', say: function (v) { return 'Casi: la solución es una potencia $x^{-' + (v.k + 1) + '}$, no lineal.'; } }
        ] }),

    /* ======================= 6. Conexión con lineales y casos especiales (14) ======================= */
    C('lin-c-forma-diferencial-lineal', 'lineales', 1,
      '¿Cómo se escribe la ecuación diferencial lineal estándar $y\' + P(x)\\,y = Q(x)$ en forma diferencial $M\\,dx + N\\,dy = 0$?',
      '$(P(x)\\,y - Q(x))\\,dx + dy = 0$', [
        ['$(Q(x)\\,y - P(x))\\,dx + dy = 0$', 'Casi: el término que multiplica a $y$ es $P(x)$, no $Q(x)$.'],
        ['$P(x)\\,dx + (y - Q(x))\\,dy = 0$', 'Casi: el término $dy$ va solo con coeficiente $1$, y todo lo demás acompaña a $dx$.'],
        ['$(P(x)\\,y + Q(x))\\,dx - dy = 0$', 'Casi: $y\' = dy/dx$, al multiplicar por $dx$ queda $dy + (Py - Q)dx = 0$.']],
      'Multiplicando $y\' + Py - Q = 0$ por $dx$ resulta $(P(x)y - Q(x))\\,dx + dy = 0$.'),

    C('lin-c-coeficientes-M-N', 'lineales', 1,
      'Al identificar $(P(x)\\,y - Q(x))\\,dx + dy = 0$ con $M\\,dx + N\\,dy = 0$, ¿cuánto valen $M_y$ y $N_x$?',
      '$M_y = P(x) \\quad \\text{y} \\quad N_x = 0$', [
        ['$M_y = 1 \\quad \\text{y} \\quad N_x = P(x)$', 'Casi: $M$ es el coeficiente de $dx$, cuya derivada respecto a $y$ es $P(x)$; y $N = 1$ es constante.'],
        ['$M_y = P(x) - Q\'(x) \\quad \\text{y} \\quad N_x = 1$', 'Casi: $Q(x)$ no depende de $y$, por lo que su derivada parcial respecto a $y$ es cero.'],
        ['$M_y = 0 \\quad \\text{y} \\quad N_x = 0$', 'Casi: el término $P(x)y$ sí depende de $y$, con derivada $P(x)$.']],
      '$M = Py - Q \\Rightarrow M_y = P(x)$. Como $N = 1$, $N_x = 0$.'),

    C('lin-c-recuperacion-factor-s04', 'lineales', 1,
      'Al calcular $\\dfrac{M_y - N_x}{N}$ para la ecuación lineal $(P\\,y - Q)\\,dx + dy = 0$, ¿qué expresión se obtiene?',
      '$\\dfrac{P(x) - 0}{1} = P(x)$, recuperando $\\mu(x) = e^{\\int P(x)\\,dx}$ de la sesión 4', [
        ['$\\dfrac{0 - P(x)}{1} = -P(x)$, dando el factor inverso $e^{-\\int P\\,dx}$', 'Casi: el orden de la resta es $M_y - N_x = P(x) - 0 = +P(x)$.'],
        ['$\\dfrac{P(x)}{Q(x)}$, dependiendo de ambos lados de la ecuación', 'Casi: $N = 1$, por lo que se divide entre $1$, no entre $Q$.'],
        ['$P(x)\\,y$, dependiendo tanto de $x$ como de $y$', 'Casi: al derivar $P(x)y$ respecto a $y$ la variable $y$ desaparece, quedando solo $P(x)$.']],
      'La fórmula general de exactitud da directamente $\\mu = e^{\\int P\\,dx}$, demostrando que el método de la sesión 4 es un caso particular.'),

    C('lin-c-por-que-lineal-siempre-admite-mux', 'lineales', 1,
      '¿Por qué toda ecuación lineal de primer orden $y\' + P(x)\\,y = Q(x)$ admite siempre un factor integrante que depende solo de $x$?',
      'Porque al escribirla como $(Py - Q)\\,dx + dy = 0$, el divisor es $N = 1$ y $M_y - N_x = P(x)$ nunca contiene a $y$', [
        ['Porque la función $Q(x)$ siempre es una constante o un polinomio', 'Casi: $Q(x)$ puede ser cualquier función continua; la propiedad proviene de que $y$ aparece solo a la primera potencia en $M$.'],
        ['Porque el coeficiente $P(x)$ siempre es positivo', 'Casi: $P(x)$ puede tener cualquier signo.'],
        ['Porque las derivadas parciales de orden superior siempre son nulas', 'Casi: no interviene el orden superior; basta que $M_y - N_x = P(x)$ dependa solo de $x$.']],
      'Al ser lineal en $y$, $M_y = P(x)$ es independiente de $y$, y como $N = 1$, el cociente $(M_y - N_x)/N = P(x)$ depende exclusivamente de $x$.'),

    C('lin-c-caso-homogeneo-separable', 'lineales', 1,
      'Si en la ecuación lineal $Q(x) = 0$ (ecuación homogénea $y\' + P(x)\\,y = 0$), ¿qué otra propiedad tiene además de ser reducible a exacta?',
      'Es directamente separable: $\\dfrac{dy}{y} = -P(x)\\,dx$', [
        ['Se vuelve una ecuación exacta con $\\mu = 1$ sin necesidad de factor integrante', 'Casi: $M_y = P(x)$ y $N_x = 0$; a menos que $P(x) = 0$, sigue requiriendo $\\mu = e^{\\int P}$.'],
        ['Deja de tener soluciones distintas de la solución trivial $y = 0$', 'Casi: tiene toda la familia de soluciones exponenciales $y = C e^{-\\int P\\,dx}$.'],
        ['Pasa a ser una ecuación de Bernoulli con exponente $n = 2$', 'Casi: con $Q(x) = 0$ es lineal homogénea (o Bernoulli con lado derecho nulo).']],
      'Una lineal homogénea de primer orden siempre se puede resolver tanto por separación de variables como por factor integrante.'),

    C('lin-c-bernoulli-vs-exactas', 'lineales', 1,
      'En la ecuación de Bernoulli $y\' + P(x)\\,y = Q(x)\\,y^n$ con $n \\neq 0, 1$, ¿por qué la prueba de factor integrante $\\mu(x)$ falla directamente?',
      'Porque $M_y = P(x) - n Q(x)\\,y^{n-1}$ contiene potencias de $y$, por lo que $(M_y - N_x)/N$ no depende solo de $x$', [
        ['Porque $N = 0$ y la división entre $N$ produce una indeterminación', 'Casi: $N = 1$, por lo que la división sí está bien definida.'],
        ['Porque Bernoulli exige siempre que los coeficientes sean funciones trigonométricas', 'Casi: Bernoulli aplica a cualquier función $P(x)$ y $Q(x)$.'],
        ['Porque la derivada de $y^n$ respecto a $x$ siempre se anula', 'Casi: al derivar $M$ respecto a $y$ baja el término con $y^{n-1}$.']],
      'La presencia de $y^n$ hace que $M_y$ dependa de $y$; por eso Bernoulli se resuelve con el cambio $v = y^{1-n}$ en vez de un factor $\\mu(x)$.'),

    C('lin-c-factor-xayb', 'lineales', 2,
      'Algunas ecuaciones que no admiten $\\mu(x)$ ni $\\mu(y)$ admiten un factor de la forma $\\mu(x, y) = x^a y^b$. ¿Cómo se determinan los exponentes $a$ y $b$?',
      'Sustituyendo $\\mu = x^a y^b$ en $\\partial_y(\\mu M) = \\partial_x(\\mu N)$ e igualando coeficientes de términos semejantes', [
        ['Sumando los grados de $M$ y $N$ para obtener $a + b = 1$', 'Casi: no hay ninguna regla que fije la suma en $1$; surge de un sistema algebraico 2x2.'],
        ['Derivando la ecuación respecto al tiempo $t$', 'Casi: no interviene ninguna variable temporal externa.'],
        ['Haciendo $a = 0$ y $b = 0$ simultáneamente', 'Casi: si $a = b = 0$, $\\mu = 1$, lo que solo serviría si la ecuación ya fuera exacta.']],
      'La condición de exactitud produce un sistema de ecuaciones algebraicas lineales para las constantes $a$ y $b$.'),

    C('lin-c-singularidades-factor-lineal', 'lineales', 2,
      'Para la ecuación $x\\,y\' + 2y = 4x^2$, el factor integrante es $\\mu(x) = x^2$. ¿Qué ocurre con la solución general $y(x) = x^2 + \\dfrac{C}{x^2}$ en $x = 0$?',
      'Si $C \\neq 0$, la solución tiene una asíntota vertical en $x = 0$ y no puede extenderse de forma continua a toda la recta', [
        ['La solución es perfectamente suave en toda la recta real para cualquier valor de $C$', 'Casi: el término $C/x^2$ diverge cuando $x \\to 0$ a menos que $C = 0$.'],
        ['La ecuación diferencial deja de tener validez en cualquier punto $x > 0$', 'Casi: para $x > 0$ la solución es completamente válida.'],
        ['El factor integrante $\\mu = x^2$ se vuelve imaginario puro', 'Casi: $x^2$ es estrictamente real y no negativo en todos los reales.']],
      'El coeficiente de $y\'$ se anula en $x = 0$, creando una frontera natural para los intervalos de validez de las soluciones.'),

    N('lin-n-evaluar-mu-lineal-coef-constante', 'lineales', 2, { a: [6, 8, 1], x0: [1, 2, 1] },
      function (v) { return 'Considera la ecuación lineal $y\' + ' + v.a + 'y = e^{-x}$ escrita como $(' + v.a + 'y - e^{-x})\\,dx + dy = 0$. ¿Cuánto vale su factor integrante $\\mu(x)$ evaluado en $x = ' + v.x0 + '$ (con $\\mu(0) = 1$)?'; },
      function (v) { return Math.exp(v.a * v.x0); },
      '$P(x) = a \\Rightarrow \\mu(x) = e^{\\int a\\,dx} = e^{ax}$.',
      { mistakes: {
          negExp: function (v) { return Math.exp(-v.a * v.x0); },
          linVal: function (v) { return v.a * v.x0; },
          sqrExp: function (v) { return Math.exp(v.a * v.x0 * v.x0); }
        },
        feedback: [
          { when: 'negExp', say: function (v) { return 'Casi: $P(x) = +' + v.a + '$, por lo que el exponente lleva signo positivo $+ax$.'; } },
          { when: 'linVal', say: function (v) { return 'Casi: ese es el exponente; falta la función exponencial $e^{' + v.a + 'x}$.'; } },
          { when: 'sqrExp', say: function (v) { return 'Casi: la integral de la constante $' + v.a + '$ es lineal en $x$.'; } }
        ] }),

    N('lin-n-evaluar-mu-lineal-coef-variable', 'lineales', 2, { k: [2, 5, 1], x0: [2, 3, 1] },
      function (v) { return 'Para la ecuación lineal $x\\,y\' + ' + v.k + 'y = x^3$, al escribirla como forma diferencial normalizada $\\left(\\dfrac{' + v.k + '}{x}y - x^2\\right)dx + dy = 0$, calcula $\\mu(' + v.x0 + ')$ sabiendo que $\\mu(1) = 1$.'; },
      function (v) { return Math.pow(v.x0, v.k); },
      '$P(x) = k/x \\Rightarrow \\mu(x) = x^k$.',
      { mistakes: {
          invExp: function (v) { return Math.pow(v.x0, -v.k); },
          linVal: function (v) { return v.k * v.x0; },
          expVal: function (v) { return Math.exp(v.k * v.x0); }
        },
        feedback: [
          { when: 'invExp', say: function (v) { return 'Casi: $P(x) = +' + v.k + '/x$, por lo que el exponente es positivo $+k$.'; } },
          { when: 'linVal', say: 'Casi: el factor integrante es $x^k$, no $k\\cdot x$.' },
          { when: 'expVal', say: function (v) { return 'Casi: $\\int (' + v.k + '/x)dx = ' + v.k + '\\ln x$, que da la potencia $x^' + v.k + '$, no $e^{' + v.k + 'x}$.'; } }
        ] }),

    N('lin-n-integral-f-lineal-eval', 'lineales', 2, { a: [1, 4, 1], x0: [1, 2, 1], y0: [1, 3, 1] },
      function (v) { return 'Para la forma diferencial exacta $(e^x y - ' + v.a + ')\\,dx + e^x\\,dy = 0$, halla el valor de la función potencial $F(x_0, y_0) = e^{x_0} y_0 - ' + v.a + 'x_0$ en el punto $(' + v.x0 + ', ' + v.y0 + ')$.'; },
      function (v) { return Math.exp(v.x0) * v.y0 - v.a * v.x0; },
      '$F(x, y) = \\int e^x y\\,dx - ax = e^x y - ax$.',
      { mistakes: {
          plusA: function (v) { return Math.exp(v.x0) * v.y0 + v.a * v.x0; },
          forgotA: function (v) { return Math.exp(v.x0) * v.y0 - v.x0; },
          forgotExp: function (v) { return v.x0 * v.y0 - v.a * v.x0; }
        },
        feedback: [
          { when: 'plusA', say: function (v) { return 'Casi: al integrar $-' + v.a + '\\,dx$ queda $-' + v.a + 'x$, con signo negativo.'; } },
          { when: 'forgotA', say: function (v) { return 'Casi: el coeficiente de $x$ es $' + v.a + '$.'; } },
          { when: 'forgotExp', say: 'Casi: el primer término lleva la exponencial $e^x y$.' }
        ] }),

    N('lin-n-asintota-solucion-lineal', 'lineales', 2, { a: [2, 5, 1], b: [2, 4, 1] },
      function (v) { return 'La solución general de la EDO lineal $y\' + ' + v.a + 'y = ' + (v.a * v.b) + '$ es $y(x) = ' + v.b + ' + C e^{-' + v.a + 'x}$. ¿A qué valor límite tiende $y(x)$ cuando $x \\to \\infty$?'; },
      function (v) { return v.b; },
      'Cuando $x \\to \\infty$, el término exponencial transitorio se desvanece y la solución tiende al estado estacionario $y = b$.',
      { mistakes: {
          zero: function () { return 0; },
          timesA: function (v) { return v.a * v.b; },
          aOnly: function (v) { return v.a; }
        },
        feedback: [
          { when: 'zero', say: function (v) { return 'Casi: el término transitorio $C e^{-' + v.a + 'x} \\to 0$, pero sobrevive el estado estacionario $' + v.b + '$.'; } },
          { when: 'timesA', say: function (v) { return 'Casi: el estado estacionario es $Q/P = ' + (v.a * v.b) + '/' + v.a + ' = ' + v.b + '$.'; } },
          { when: 'aOnly', say: function (v) { return 'Casi: $' + v.a + '$ es la constante de decaimiento en el exponente.'; } }
        ] }),

    N('lin-n-circuito-rl-tau', 'lineales', 3, { r: [2, 8, 2], l: [1, 4, 1] },
      function (v) { return 'La corriente en un circuito RL cumple $L\\,i\' + R\\,i = V$, cuya forma normalizada tiene $P(t) = R/L$. Para $R = ' + v.r + '\\,\\Omega$ y $L = ' + v.l + '\\text{ H}$, calcula la constante de tiempo $\\tau = L/R$ en segundos.'; },
      function (v) { return v.l / v.r; },
      'La constante de tiempo de un circuito RL es $\\tau = L/R$.',
      { mistakes: {
          inverse: function (v) { return v.r / v.l; },
          times: function (v) { return v.r * v.l; },
          minus: function (v) { return v.r - v.l; }
        },
        feedback: [
          { when: 'inverse', say: 'Casi: la constante de tiempo es $\\tau = L/R$, no $R/L$.' },
          { when: 'times', say: 'Casi: $\\tau$ es el cociente $L/R$, no el producto.' },
          { when: 'minus', say: 'Casi: $\\tau$ se calcula dividiendo inductancia entre resistencia.' }
        ] }),

    N('lin-n-tanque-factor-volumen-variable', 'lineales', 3, { a: [1, 4, 1], t0: [1, 3, 1] },
      function (v) { return 'En un tanque con volumen variable $V(t) = 10 + t$, la ecuación para la cantidad de sal $y(t)$ es $y\' + \\dfrac{' + v.a + '}{10 + t}y = 2$. ¿Cuánto vale el factor integrante $\\mu(t)$ evaluado en $t = ' + v.t0 + '$ tomando $\\mu(0) = 1$?' },
      function (v) { return Math.pow((10 + v.t0) / 10, v.a); },
      '$\\mu(t) = e^{\\int \\frac{a}{10+t}dt} = (10+t)^a$. Normalizado para $\\mu(0)=1$ resulta $((10+t)/10)^a$.',
      { mistakes: {
          noDiv10: function (v) { return Math.pow(10 + v.t0, v.a); },
          linVal: function (v) { return 1 + v.a * v.t0 / 10; },
          expVal: function (v) { return Math.exp(v.a * v.t0 / 10); }
        },
        feedback: [
          { when: 'noDiv10', say: function (v) { return 'Casi: para que $\\mu(0) = 1$, debes dividir entre $V(0) = 10$, dando $((10+t)/10)^' + v.a + '$.'; } },
          { when: 'linVal', say: function (v) { return 'Casi: el factor integrante es una potencia con exponente $' + v.a + '$, no una aproximación lineal.'; } },
          { when: 'expVal', say: 'Casi: la integral es logarítmica, dando una función potencia, no una exponencial.' }
        ] })
  ];

  K.register(SUBTEMAS, Q);
})();
