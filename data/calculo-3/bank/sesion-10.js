/* =====================================================================
   Banco · Cálculo 3 · S10 · Homogéneas de segundo orden con coeficientes
   constantes: los tres casos de raíces (reales distintas, raíz doble,
   complejas conjugadas) y PVI.
   100 preguntas propias (source: 'propia').
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c3', '10');

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
    'c3.S10.caracteristica': 'Ecuación característica y discriminante',
    'c3.S10.reales': 'Raíces reales distintas',
    'c3.S10.doble': 'Raíz real doble y reducción de orden',
    'c3.S10.complejas': 'Raíces complejas y oscilaciones',
    'c3.S10.pvi': 'Problemas de valor inicial y unicidad',
    'c3.S10.comportamiento': 'Plano complejo, estabilidad y parámetros'
  };

  var Q = [
    /* ======================= 1. Ecuación característica y discriminante (17) ======================= */
    C('ca-c-origen-exp', 'caracteristica', 1,
      '¿Por qué al buscar soluciones de la ecuación lineal homogénea con coeficientes constantes $a\\,y\'\' + b\\,y\' + c\\,y = 0$ se propone la forma $y = e^{rx}$?',
      'Porque sus derivadas son múltiplos de sí misma ($y\' = r\\,e^{rx}$, $y\'\' = r^2 e^{rx}$), lo que permite factorizar y cancelar $e^{rx} \\neq 0$', [
        ['Porque la función exponencial es la única función diferenciable en todos los números reales', 'Casi: polinomios y funciones trigonométricas también son derivables en todo $\\mathbb{R}$; la clave es que la derivada es proporcional a la función.'],
        ['Porque toda ecuación diferencial ordinaria tiene únicamente soluciones de tipo exponencial', 'Casi: hay muchas EDO con soluciones algebraicas, trigonométricas o especiales.'],
        ['Porque al sustituir $y = e^{rx}$ la ecuación diferencial se transforma en una integral indefinida', 'Casi: se transforma en una ecuación algebraica de segundo grado, no en una integral.']],
      'Al sustituir $y = e^{rx}$, cada derivada aporta una potencia de $r$ y el factor común $e^{rx}$ nunca se anula, dejando el polinomio $ar^2 + br + c = 0$.'),

    C('ca-c-termino-indep', 'caracteristica', 1,
      'Al construir la ecuación característica de $y\'\' + 16y = 0$, un estudiante escribe $r^2 + 16r = 0$. ¿Cuál es el error conceptual en este paso?',
      'Sustituyó $y$ por $r$ en lugar de $1$; la función $y = e^{rx}$ tiene derivada de orden cero correspondiente a $r^0 = 1$', [
        ['Olvidó cambiar el signo del término independiente al pasar de la derivada a la raíz', 'Casi: el signo se conserva tal cual; el error fue poner $r$ donde solo va la función $y$.'],
        ['Debió elevar el $16$ al cuadrado porque la ecuación es de segundo orden', 'Casi: los coeficientes no se elevan; se conservan exactamente iguales.'],
        ['Confundió una ecuación no homogénea con una homogénea', 'Casi: la ecuación está igualada a cero, por lo que es homogénea; el error fue el grado en $r$.']],
      'En $a\\,y\'\' + b\\,y\' + c\\,y = 0$, $y\'\' \\to r^2$, $y\' \\to r$ y $y \\to 1$. Para $y\'\' + 16y = 0$ la característica es $r^2 + 16 = 0$.'),

    C('ca-c-discriminante-casos', 'caracteristica', 1,
      'Para la ecuación diferencial $a\\,y\'\' + b\\,y\' + c\\,y = 0$ con $a \\neq 0$, ¿qué condición sobre los coeficientes garantiza que las soluciones contengan senos y cosenos?',
      'Que el discriminante sea estrictamente negativo: $b^2 - 4ac < 0$', [
        ['Que el coeficiente $b$ sea estrictamente negativo: $b < 0$', 'Casi: el signo de $b$ determina si la oscilación crece o decae, pero la presencia de oscilación depende de $b^2 - 4ac < 0$.'],
        ['Que el discriminante sea estrictamente positivo: $b^2 - 4ac > 0$', 'Casi: discriminante positivo produce dos raíces reales distintas y exponenciales puras, sin senos ni cosenos.'],
        ['Que los coeficientes $a$ y $c$ tengan signos opuestos', 'Casi: si $a$ y $c$ tienen signos opuestos, $-4ac > 0$, lo que haría $b^2 - 4ac > 0$, dando raíces reales.']],
      'Las funciones trigonométricas provienen de raíces complejas conjugadas, las cuales ocurren si y solo si $b^2 - 4ac < 0$.'),

    C('ca-c-orden-grado', 'caracteristica', 1,
      '¿Qué relación existe entre el orden de una EDO lineal homogénea con coeficientes constantes y el grado de su ecuación característica?',
      'El orden de la EDO coincide exactamente con el grado del polinomio característico', [
        ['El grado del polinomio característico es siempre uno menos que el orden de la EDO', 'Casi: la derivada de orden $n$ genera el término $r^n$, por lo que ambos números coinciden.'],
        ['El polinomio característico siempre es de segundo grado sin importar el orden de la EDO', 'Casi: si la EDO es de orden 3, el polinomio es de grado 3; en esta sesión vemos las de segundo orden.'],
        ['El grado del polinomio es el doble del orden de la EDO por haber dos soluciones independientes', 'Casi: el número de raíces es $n$, que coincide con el orden de la EDO.']],
      'La derivada $n$-ésima $y^{(n)}$ produce $r^n e^{rx}$, de modo que una EDO de orden $n$ produce un polinomio de grado $n$.'),

    C('ca-c-raiz-cero', 'caracteristica', 1,
      'Si la ecuación característica $a\\,r^2 + b\\,r = 0$ tiene una raíz $r = 0$, ¿qué función elemental forma parte de su conjunto fundamental de soluciones?',
      'La función constante $y_1(x) = 1$, porque $e^{0\\cdot x} = 1$', [
        ['La función nula $y_1(x) = 0$, por lo que se pierde una solución del conjunto fundamental', 'Casi: la solución $e^{0x} = 1$ no es nula; es una función constante no nula.'],
        ['La función lineal $y_1(x) = x$, porque el cero se sustituye por la variable independiente', 'Casi: $x$ aparece cuando hay una raíz doble, no por el simple hecho de que una raíz valga cero.'],
        ['Una asíntota vertical, porque la raíz cero provoca una indeterminación', 'Casi: $e^{0x} = 1$ es perfectamente regular y bien definida en todo $\\mathbb{R}$.']],
      'Cualquier raíz $r$ genera la solución $e^{rx}$. Con $r = 0$, $e^{0x} = 1$, lo que refleja que cualquier función constante satisface $y\'\' + b\\,y\' = 0$.'),

    C('ca-c-clasif-discriminante', 'caracteristica', 1,
      function (v) { return 'En la ecuación $y\'\' + ' + (2 * v.k) + "y' + " + (v.k * v.k) + 'y = 0$, ¿cuál es la naturaleza de las raíces de la ecuación característica?'; },
      'Una raíz real doble, porque el discriminante es exactamente cero', [
        ['Dos raíces reales distintas, porque todos los coeficientes son positivos', 'Casi: calcula el discriminante: $(2k)^2 - 4(1)(k^2) = 4k^2 - 4k^2 = 0$, lo que corresponde a raíz doble.'],
        ['Dos raíces imaginarias puras, porque no hay amortiguamiento', 'Casi: el término con $y\'$ está presente y el discriminante es exactamente cero.'],
        ['Raíces complejas con parte real positiva, porque los coeficientes son mayores que cero', 'Casi: con discriminante nulo no hay parte imaginaria.']],
      'El discriminante es $b^2 - 4ac = (2k)^2 - 4(k^2) = 0$, lo que produce una raíz real repetida $r = -k$.',
      { vars: { k: [2, 5, 1] } }),

    C('ca-c-forma-estandar-coef', 'caracteristica', 2,
      'Al resolver $3\\,y\'\' - 6\\,y\' + 30\\,y = 0$, un alumno divide primero toda la ecuación entre 3. ¿Afecta esta simplificación a las raíces características?',
      'No las altera, pues dividir entre una constante no nula no cambia las soluciones de la ecuación algebraica', [
        ['Sí las altera, porque las raíces quedan divididas entre 3', 'Casi: si $3(r^2 - 2r + 10) = 0$, las raíces de $r^2 - 2r + 10 = 0$ son exactamente las mismas.'],
        ['Sí las altera, porque la parte imaginaria cambia de escala', 'Casi: las raíces complejas de $a r^2 + b r + c = 0$ dependen de las razones $b/a$ y $c/a$.'],
        ['Solo altera a las soluciones reales, pero no a las complejas', 'Casi: no altera ninguna raíz, ni real ni compleja.']],
      'Las raíces de $a r^2 + b r + c = 0$ son idénticas a las de $r^2 + (b/a)r + (c/a) = 0$ puesto que $a \\neq 0$.'),

    C('ca-c-signo-ac-negativo', 'caracteristica', 2,
      'Si en la ecuación $a\\,y\'\' + b\\,y\' + c\\,y = 0$ los coeficientes $a$ y $c$ tienen signos contrarios (es decir, $a\\cdot c < 0$), ¿qué tipo de raíces se obtienen siempre?',
      'Dos raíces reales distintas de signos contrarios, sin importar el valor de $b$', [
        ['Dos raíces complejas conjugadas, porque los signos son opuestos', 'Casi: como $ac < 0$, el término $-4ac > 0$, haciendo $b^2 - 4ac > b^2 \\ge 0$, siempre positivo.'],
        ['Una raíz real doble negativa', 'Casi: el discriminante es estrictamente mayor que $b^2 \\ge 0$, por lo que nunca puede ser cero.'],
        ['Dos raíces imaginarias puras', 'Casi: para tener raíces imaginarias puras se requiere $b = 0$ y $ac > 0$.']],
      'Con $ac < 0$, el discriminante $b^2 - 4ac > 0$ siempre, y el producto de las raíces es $c/a < 0$, lo que garantiza signos opuestos.'),

    N('ca-n-discrim-valor', 'caracteristica', 1, { b: [3, 7, 1], c: [1, 5, 1] },
      function (v) { return 'Calcula el discriminante $\\Delta = b^2 - 4ac$ de la ecuación característica correspondiente a $y\'\' + ' + v.b + "y' + " + v.c + 'y = 0$.'; },
      function (v) { return v.b * v.b - 4 * v.c; },
      'Para $y\'\' + b\\,y\' + c\\,y = 0$, $a = 1$, de modo que $\\Delta = b^2 - 4(1)(c) = b^2 - 4c$.',
      { where: function (v) { return Math.abs(v.b * v.b - 4 * v.c) >= 3; },
        mistakes: { forgot4: function (v) { return v.b * v.b - v.c; }, plus4: function (v) { return v.b * v.b + 4 * v.c; } },
        feedback: [
          { when: 'forgot4', say: 'Casi: olvidaste el factor 4 en la fórmula del discriminante: es $b^2 - 4ac$, no $b^2 - ac$.' },
          { when: 'plus4', say: 'Casi: el término es $-4ac$, no $+4ac$.' }
        ] }),

    N('ca-n-coef-b-doble', 'caracteristica', 1, { r: [2, 6, 1] },
      function (v) { return '¿Qué valor positivo debe tener el coeficiente $b$ en $y\'\' + b\\,y\' + ' + (v.r * v.r) + 'y = 0$ para que la ecuación tenga una raíz característica real repetida?'; },
      function (v) { return 2 * v.r; },
      'Para raíz repetida se necesita $b^2 - 4ac = 0$. Con $a = 1$ y $c = r^2$, $b = 2r$.',
      { mistakes: { half: function (v) { return v.r; }, squared: function (v) { return 4 * v.r * v.r; } },
        feedback: [
          { when: 'half', say: 'Casi: $b^2 = 4c = 4r^2$, por lo que $b = \\sqrt{4r^2} = 2r$, no $r$.' },
          { when: 'squared', say: 'Casi: ese valor es $b^2$; saca la raíz cuadrada para obtener $b$.' }
        ] }),

    N('ca-n-suma-raices', 'caracteristica', 2, { p: [2, 5, 1], q: [1, 4, 1] },
      function (v) { return 'Sin resolver la ecuación, calcula la suma de las dos raíces $r_1 + r_2$ de la ecuación característica de $2\\,y\'\' - ' + (2 * v.p) + "y' + " + v.q + 'y = 0$.'; },
      function (v) { return v.p; },
      'Por las relaciones de Cardano-Vieta, la suma de las raíces de $a r^2 + b r + c = 0$ es $-b/a = -(-2p)/2 = p$.',
      { mistakes: { opposite: function (v) { return -v.p; }, noDivA: function (v) { return 2 * v.p; } },
        feedback: [
          { when: 'opposite', say: 'Casi: la suma de las raíces es $-b/a$. Como $b = -2p$, $-b/a = +p$.' },
          { when: 'noDivA', say: 'Casi: olvidaste dividir entre el coeficiente $a = 2$.' }
        ] }),

    N('ca-n-prod-raices', 'caracteristica', 2, { a: [2, 4, 1], c: [6, 18, 2] },
      function (v) { return 'Calcula el producto de las dos raíces $r_1 \\cdot r_2$ de la ecuación característica de $' + v.a + "y'' + 5y' + " + v.c + 'y = 0$.'; },
      function (v) { return v.c / v.a; },
      'El producto de las raíces de un polinomio de segundo grado $a r^2 + b r + c = 0$ es $c/a$.',
      { where: function (v) { return v.c % v.a !== 0 || v.c / v.a !== v.a; },
        mistakes: { opposite: function (v) { return -v.c / v.a; }, justC: function (v) { return v.c; } },
        feedback: [
          { when: 'opposite', say: 'Casi: el producto de las raíces es $+c/a$, no $-c/a$.' },
          { when: 'justC', say: 'Casi: debes dividir entre el coeficiente principal $a$.' }
        ] }),

    N('ca-n-b-critico-frontera', 'caracteristica', 2, { m: [2, 5, 1], k: [8, 32, 2] },
      function (v) { return 'Para la ecuación $' + v.m + "y'' + b\\,y' + " + v.k + 'y = 0$, ¿cuál es el valor positivo de $b$ en la frontera entre tener soluciones oscilatorias y soluciones no oscilatorias?'; },
      function (v) { return 2 * Math.sqrt(v.m * v.k); },
      'La frontera ocurre con raíz doble cuando $\\Delta = b^2 - 4mk = 0$, es decir, $b = 2\\sqrt{mk}$.',
      { mistakes: { noTwo: function (v) { return Math.sqrt(v.m * v.k); }, squared: function (v) { return 4 * v.m * v.k; } },
        feedback: [
          { when: 'noTwo', say: 'Casi: $b = \\sqrt{4mk} = 2\\sqrt{mk}$; te faltó el factor 2.' },
          { when: 'squared', say: 'Casi: ese valor es $b^2$; extrae la raíz cuadrada.' }
        ] }),

    N('ca-n-c-max-complejas', 'caracteristica', 2, { b: [6, 12, 2] },
      function (v) { return 'En $y\'\' + ' + v.b + "y' + c\\,y = 0$, ¿qué valor entero mínimo debe tener $c$ para que las raíces sean números complejos conjugados?"; },
      function (v) { return (v.b * v.b / 4) + 1; },
      'Para raíces complejas se requiere $b^2 - 4c < 0 \\implies c > b^2/4$. El siguiente entero es $b^2/4 + 1$.',
      { mistakes: { double: function (v) { return v.b * v.b / 4; }, half: function (v) { return v.b; } },
        feedback: [
          { when: 'double', say: 'Casi: con $c = b^2/4$ el discriminante es 0 (raíz doble). Para que sean complejas debe ser estrictamente menor que 0.' },
          { when: 'half', say: 'Casi: la condición es $c > b^2/4$.' }
        ] }),

    N('ca-n-raiz-mayor-dif3', 'caracteristica', 3, { a: [2, 4, 1], b: [7, 13, 2], c: [-6, -2, 1] },
      function (v) { return 'Determina numéricamente la raíz característica de mayor valor de la ecuación $' + v.a + "y'' - " + v.b + "y' " + v.c + 'y = 0$.'; },
      function (v) { return (v.b + Math.sqrt(v.b * v.b - 4 * v.a * v.c)) / (2 * v.a); },
      'La ecuación es $a r^2 - b r + c = 0$. Las raíces son $(b \\pm \\sqrt{b^2 - 4ac})/(2a)$; la mayor toma el signo positivo.',
      { where: function (v) { return v.b * v.b - 4 * v.a * v.c > 0; },
        mistakes: { minor: function (v) { return (v.b - Math.sqrt(v.b * v.b - 4 * v.a * v.c)) / (2 * v.a); }, wrongSignB: function (v) { return (-v.b + Math.sqrt(v.b * v.b - 4 * v.a * v.c)) / (2 * v.a); } },
        feedback: [
          { when: 'minor', say: 'Casi: calculaste la raíz menor en vez de la mayor.' },
          { when: 'wrongSignB', say: 'Casi: en $a r^2 - b r + c = 0$, el término $-(-b) = +b$.' }
        ] }),

    N('ca-n-distancia-raices', 'caracteristica', 3, { a: [2, 4, 1], b: [6, 10, 1], c: [1, 2, 1] },
      function (v) { return 'Calcula la distancia $|r_1 - r_2|$ entre las dos raíces de la ecuación característica de $' + v.a + "y'' + " + v.b + "y' + " + v.c + 'y = 0$.'; },
      function (v) { return Math.sqrt(v.b * v.b - 4 * v.a * v.c) / v.a; },
      'La diferencia entre las raíces es $|r_1 - r_2| = \\frac{\\sqrt{\\Delta}}{a}$.',
      { where: function (v) { return v.b * v.b - 4 * v.a * v.c > 0; },
        mistakes: { over2a: function (v) { return Math.sqrt(v.b * v.b - 4 * v.a * v.c) / (2 * v.a); }, justDelta: function (v) { return Math.sqrt(v.b * v.b - 4 * v.a * v.c); } },
        feedback: [
          { when: 'over2a', say: 'Casi: la diferencia es $\\frac{2\\sqrt{\\Delta}}{2a} = \\frac{\\sqrt{\\Delta}}{a}$; dividiste de más entre 2.' },
          { when: 'justDelta', say: 'Casi: debes dividir entre el coeficiente $a$.' }
        ] }),

    N('ca-n-parte-imaginaria-dif3', 'caracteristica', 3, { a: [2, 4, 1], b: [2, 4, 2], c: [10, 25, 5] },
      function (v) { return 'Para la ecuación diferencial $' + v.a + "y'' + " + v.b + "y' + " + v.c + 'y = 0$, calcula el valor positivo de la parte imaginaria $\\beta$ de sus raíces características.'; },
      function (v) { return Math.sqrt(4 * v.a * v.c - v.b * v.b) / (2 * v.a); },
      'Las raíces son $\\alpha \\pm \\beta i$ con $\\beta = \\frac{\\sqrt{4ac - b^2}}{2a}$.',
      { mistakes: { noDiv2a: function (v) { return Math.sqrt(4 * v.a * v.c - v.b * v.b); }, realPart: function (v) { return v.b / (2 * v.a); } },
        feedback: [
          { when: 'noDiv2a', say: 'Casi: olvidaste dividir la raíz entre $2a$.' },
          { when: 'realPart', say: 'Casi: calculaste la parte real $|\\alpha| = b/(2a)$ en lugar de la parte imaginaria $\\beta$.' }
        ] }),

    /* ======================= 2. Raíces reales distintas (18) ======================= */
    C('re-c-forma-general', 'reales', 1,
      'Si la ecuación característica de $a\\,y\'\' + b\\,y\' + c\\,y = 0$ tiene dos raíces reales distintas $r_1$ y $r_2$, ¿cuál es la estructura de su solución general?',
      '$y(x) = c_1\\,e^{r_1 x} + c_2\\,e^{r_2 x}$, donde $c_1$ y $c_2$ son constantes arbitrarias', [
        ['$y(x) = (c_1 + c_2 x)\\,e^{r_1 x}$, sumando un factor lineal para asegurar la independencia', 'Casi: esa estructura corresponde al caso de raíz real doble ($r_1 = r_2$).'],
        ['$y(x) = c_1\\,\\cos(r_1 x) + c_2\\,\\sin(r_2 x)$, porque son dos frecuencias distintas', 'Casi: las funciones trigonométricas solo aparecen cuando las raíces son complejas conjugadas.'],
        ['$y(x) = c_1\\,e^{r_1 x} \\cdot c_2\\,e^{r_2 x}$, multiplicando las soluciones fundamentales', 'Casi: por el principio de superposición las soluciones se suman linealmente, no se multiplican.']],
      'Al tener dos raíces reales distintas, $e^{r_1 x}$ y $e^{r_2 x}$ son linealmente independientes y su combinación lineal genera la solución general.'),

    C('re-c-wronskiano-reales', 'reales', 1,
      '¿Cuánto vale el Wronskiano $W(e^{r_1 x}, e^{r_2 x})$ de las dos soluciones exponenciales cuando $r_1 \\neq r_2$?',
      '$W(x) = (r_2 - r_1)\\,e^{(r_1 + r_2)x}$, el cual nunca se anula para ningún $x \\in \\mathbb{R}$', [
        ['$W(x) = 0$, porque ambas provienen de la misma ecuación diferencial', 'Casi: si el Wronskiano fuera cero las funciones serían linealmente dependientes.'],
        ['$W(x) = (r_1 + r_2)\\,e^{(r_1 - r_2)x}$', 'Casi: el determinante es $e^{r_1 x}(r_2 e^{r_2 x}) - (r_1 e^{r_1 x})e^{r_2 x} = (r_2 - r_1)e^{(r_1+r_2)x}$.'],
        ['$W(x) = e^{(r_1 + r_2)x}$, sin ningún factor constante enfrente', 'Casi: al calcular el determinante $2 \\times 2$ aparece la diferencia de las derivadas $(r_2 - r_1)$.']],
      '$W = y_1 y_2\' - y_1\' y_2 = e^{r_1 x}(r_2 e^{r_2 x}) - (r_1 e^{r_1 x})e^{r_2 x} = (r_2 - r_1)e^{(r_1+r_2)x} \\neq 0$ pues $r_1 \\neq r_2$.'),

    C('re-c-comportamiento-ambas-neg', 'reales', 1,
      'Si ambas raíces características son reales y estrictamente negativas ($r_2 < r_1 < 0$), ¿qué le ocurre a toda solución $y(x)$ cuando $x \\to \\infty$?',
      'Tiende asintóticamente a $0$ sin oscilar', [
        ['Crece sin límite hacia $+\\infty$', 'Casi: al ser los exponentes negativos, $e^{r_1 x} \\to 0$ y $e^{r_2 x} \\to 0$ cuando $x \\to \\infty$.'],
        ['Oscila con amplitud decreciente alrededor del eje horizontal', 'Casi: sin parte imaginaria en las raíces no hay oscilaciones.'],
        ['Permanece constante en el valor $c_1 + c_2$', 'Casi: $c_1 + c_2$ es el valor en $x = 0$, pero al crecer $x$ decae a 0.']],
      'Ambos términos exponenciales tienen exponentes negativos, por lo que decaen monotónicamente a cero cuando $x \\to \\infty$.'),

    C('re-c-ceros-maximos-reales', 'reales', 2,
      '¿Cuántas veces puede cruzar por cero (raíces de $y(x) = 0$) una solución no trivial de $y\'\' + a\\,y\' + b\\,y = 0$ en el caso de raíces reales distintas?',
      'A lo más una vez en todo el eje real', [
        ['Infinitas veces, de forma periódica', 'Casi: la solución no es periódica; no oscila porque no hay funciones trigonométricas.'],
        ['Exactamente dos veces, una por cada raíz característica', 'Casi: la ecuación $c_1 e^{r_1 x} + c_2 e^{r_2 x} = 0$ equivale a $e^{(r_1 - r_2)x} = -c_2/c_1$, que tiene a lo más una solución.'],
        ['Nunca puede cruzar por cero', 'Casi: si $c_1$ y $c_2$ tienen signos contrarios, sí cruza por cero en un único punto.']],
      'Al resolver $c_1 e^{r_1 x} + c_2 e^{r_2 x} = 0$ se obtiene $e^{(r_1 - r_2)x} = -c_2/c_1$. La función exponencial es estrictamente monótona, por lo que tiene a lo más un cruce.'),

    C('re-c-termino-dominante', 'reales', 2,
      'Dada la solución $y(x) = 3e^{-2x} + 5e^{-7x}$, ¿cuál término domina el decaimiento cuando $x$ es muy grande y positivo?',
      'El término $3e^{-2x}$, porque decae mucho más lentamente que $5e^{-7x}$', [
        ['El término $5e^{-7x}$, porque su coeficiente inicial $5$ es mayor que $3$', 'Casi: para $x$ grande el factor exponencial supera por completo a los coeficientes.'],
        ['El término $5e^{-7x}$, porque su exponente $-7$ tiene mayor magnitud', 'Casi: decaer más rápido significa hacerse insignificante antes; el que domina es el que decae más lento.'],
        ['Ambos términos contribuyen exactamente por igual en el infinito', 'Casi: el cociente $(5e^{-7x})/(3e^{-2x}) = \\frac{5}{3}e^{-5x} \\to 0$, por lo que $e^{-7x}$ se vuelve despreciable.']],
      'La raíz con menor magnitud negativa ($r = -2$) decae más lento y por tanto domina la cola asintótica hacia el infinito.'),

    C('re-c-solucion-acotada', 'reales', 2,
      'La ecuación $y\'\' - y\' - 6y = 0$ tiene raíces $r_1 = 3$ y $r_2 = -2$. ¿Bajo qué condición sobre las constantes $c_1$ y $c_2$ la solución permanece acotada para todo $x \\ge 0$?',
      'Se requiere obligatoriamente que $c_1 = 0$, para eliminar la exponencial creciente $e^{3x}$', [
        ['Se requiere que $c_1 + c_2 = 0$', 'Casi: eso solo garantiza $y(0) = 0$, pero $e^{3x}$ seguiría creciendo hacia el infinito.'],
        ['Se requiere que $c_2 = 0$, para conservar únicamente la raíz positiva', 'Casi: la raíz positiva $e^{3x}$ no está acotada en $[0, \\infty)$.'],
        ['Cualquier par de constantes produce una solución acotada', 'Casi: si $c_1 \\neq 0$, el término $c_1 e^{3x}$ tiende a $\\pm\\infty$.']],
      'Como $e^{3x} \\to \\infty$ cuando $x \\to \\infty$, la única manera de que la solución no diverja es anulando su coeficiente: $c_1 = 0$.'),

    N('re-n-raiz-positiva', 'reales', 1, { r1: [3, 6, 1], r2: [1, 2, 1] },
      function (v) { var s = v.r1 + v.r2, p = v.r1 * v.r2; return 'Encuentra la raíz característica mayor de la ecuación $y\'\' - ' + s + "y' + " + p + 'y = 0$.'; },
      function (v) { return Math.max(v.r1, v.r2); },
      'La ecuación característica $(r - r_1)(r - r_2) = 0$ tiene raíces $r_1$ y $r_2$; la mayor es el máximo de ambas.',
      { mistakes: { minor: function (v) { return Math.min(v.r1, v.r2); }, sum: function (v) { return v.r1 + v.r2; } },
        feedback: [
          { when: 'minor', say: 'Casi: diste la raíz menor en lugar de la mayor.' },
          { when: 'sum', say: 'Casi: esa es la suma de las raíces, no el valor de la raíz mayor.' }
        ] }),

    N('re-n-eval-sol-particular', 'reales', 1, { r1: [1, 3, 1], c1: [2, 4, 1] },
      function (v) { return 'Si la solución general de una EDO es $y(x) = ' + v.c1 + 'e^{' + v.r1 + 'x} + e^{-' + v.r1 + 'x}$, calcula el valor de $y(0)$.'; },
      function (v) { return v.c1 + 1; },
      'Evaluando en $x = 0$: $y(0) = c_1 e^0 + e^0 = c_1 + 1$.',
      { mistakes: { justC1: function (v) { return v.c1; }, zero: function () { return 0.5; } },
        feedback: [
          { when: 'justC1', say: 'Casi: olvidaste sumar el segundo término $e^0 = 1$.' },
          { when: 'zero', say: 'Casi: $e^0 = 1$, no cero.' }
        ] }),

    N('re-n-wronskiano-en-cero', 'reales', 2, { r1: [3, 6, 1], r2: [1, 2, 1] },
      function (v) { return 'Calcula el valor del Wronskiano $W(e^{' + v.r1 + 'x}, e^{' + v.r2 + 'x})$ evaluado en $x = 0$.'; },
      function (v) { return v.r2 - v.r1; },
      '$W(0) = y_1(0)y_2\'(0) - y_1\'(0)y_2(0) = (1)(r_2) - (r_1)(1) = r_2 - r_1$.',
      { mistakes: { opposite: function (v) { return v.r1 - v.r2; }, sum: function (v) { return v.r1 + v.r2; } },
        feedback: [
          { when: 'opposite', say: 'Casi: el orden del determinante da $y_1 y_2\' - y_1\' y_2 = r_2 - r_1$, con signo contrario.' },
          { when: 'sum', say: 'Casi: el Wronskiano involucra la resta de productos cruzados, no la suma.' }
        ] }),

    N('re-n-cruce-cero-x', 'reales', 2, { r1: [1, 2, 1], r2: [3, 4, 1], k: [2, 5, 1] },
      function (v) { return 'La solución $y(x) = e^{' + v.r1 + 'x} - ' + v.k + 'e^{' + v.r2 + 'x}$ cruza el eje horizontal en un punto $x^*$. Calcula el valor de $x^*$.'; },
      function (v) { return -Math.log(v.k) / (v.r2 - v.r1); },
      '$e^{r_1 x} = k e^{r_2 x} \\implies e^{(r_1 - r_2)x} = k \\implies (r_1 - r_2)x = \\ln k \\implies x = \\frac{\\ln k}{r_1 - r_2}$.',
      { mistakes: { posSign: function (v) { return Math.log(v.k) / (v.r2 - v.r1); }, noLog: function (v) { return -v.k / (v.r2 - v.r1); } },
        feedback: [
          { when: 'posSign', say: 'Casi: como $r_1 < r_2$, el denominador $r_1 - r_2 < 0$, dando $x^* < 0$.' },
          { when: 'noLog', say: 'Casi: para despejar el exponente debes aplicar logaritmo natural $\\ln(k)$.' }
        ] }),

    N('re-n-pendiente-en-cero', 'reales', 2, { r1: [2, 4, 1], r2: [-4, -2, 1], c1: [2, 4, 1], c2: [1, 3, 1] },
      function (v) { return 'Si $y(x) = ' + v.c1 + 'e^{' + v.r1 + 'x} + ' + v.c2 + 'e^{' + v.r2 + 'x}$, calcula el valor de la pendiente $y\'(0)$.'; },
      function (v) { return v.c1 * v.r1 + v.c2 * v.r2; },
      'La derivada es $y\'(x) = c_1 r_1 e^{r_1 x} + c_2 r_2 e^{r_2 x}$, por lo que $y\'(0) = c_1 r_1 + c_2 r_2$.',
      { where: function (v) { var a = v.c1 * v.r1 + v.c2 * v.r2; return Math.abs(a) >= 2 && Math.abs(a - (v.r1 + v.r2)) >= 2 && Math.abs(a - (v.c1 + v.c2)) >= 2; },
        mistakes: { noCoeff: function (v) { return v.r1 + v.r2; }, justSumC: function (v) { return v.c1 + v.c2; } },
        feedback: [
          { when: 'noCoeff', say: 'Casi: olvidaste multiplicar cada raíz por su respectiva constante $c_1$ y $c_2$.' },
          { when: 'justSumC', say: 'Casi: ese valor es $y(0)$; para la pendiente debes derivar.' }
        ] }),

    N('re-n-punto-critico-x', 'reales', 2, { r1: [1, 2, 1], r2: [3, 4, 1], c1: [3, 6, 1], c2: [-2, -1, 1] },
      function (v) { return 'Encuentra la coordenada $x$ del punto crítico (donde $y\'(x) = 0$) de la curva $y(x) = ' + v.c1 + 'e^{' + v.r1 + 'x} ' + v.c2 + 'e^{' + v.r2 + 'x}$.'; },
      function (v) { return Math.log((-v.c1 * v.r1) / (v.c2 * v.r2)) / (v.r2 - v.r1); },
      '$y\'(x) = c_1 r_1 e^{r_1 x} + c_2 r_2 e^{r_2 x} = 0 \\implies e^{(r_2 - r_1)x} = \\frac{-c_1 r_1}{c_2 r_2}$.',
      { where: function (v) { return (-v.c1 * v.r1) / (v.c2 * v.r2) >= 1.5 && -v.c1 / v.c2 >= 1.5; },
        mistakes: { noRoots: function (v) { return Math.log(-v.c1 / v.c2) / (v.r2 - v.r1); }, invDiff: function (v) { return -Math.log((-v.c1 * v.r1) / (v.c2 * v.r2)) / (v.r2 - v.r1); } },
        feedback: [
          { when: 'noRoots', say: 'Casi: al derivar bajan las raíces $r_1$ y $r_2$ como factores multiplicando a $c_1$ y $c_2$.' },
          { when: 'invDiff', say: 'Casi: el exponente es $(r_2 - r_1)x$; revisa los signos al despejar.' }
        ] }),

    N('re-n-razon-asintotica', 'reales', 2, { r1: [-1, -1, 1], r2: [-3, -2, 1], c1: [2, 5, 1] },
      function (v) { return 'Dada la función $y(x) = ' + v.c1 + 'e^{' + v.r1 + 'x} + 4e^{' + v.r2 + 'x}$, calcula el límite $\\lim_{x \\to \\infty} \\dfrac{y(x)}{e^{' + v.r1 + 'x}}$.'; },
      function (v) { return v.c1; },
      'Dividiendo entre $e^{r_1 x}$: $y(x)/e^{r_1 x} = c_1 + 4e^{(r_2 - r_1)x} \\to c_1$ puesto que $r_2 - r_1 < 0$.',
      { mistakes: { plus4: function (v) { return v.c1 + 4; }, zero: function () { return 0.2; } },
        feedback: [
          { when: 'plus4', say: 'Casi: el segundo término $e^{(r_2 - r_1)x}$ tiende a $0$ en el infinito, no a $1$.' },
          { when: 'zero', say: function (v) { return 'Casi: la razón tiende al coeficiente de la exponencial dominante, que es $' + v.c1 + '$.'; } }
        ] }),

    N('re-n-segunda-derivada-cero', 'reales', 3, { r1: [2, 4, 1], r2: [-3, -1, 1], c1: [1, 3, 1], c2: [2, 4, 1] },
      function (v) { return 'Para la función $y(x) = ' + v.c1 + 'e^{' + v.r1 + 'x} + ' + v.c2 + 'e^{' + v.r2 + 'x}$, calcula el valor de su segunda derivada en el origen, $y\'\'(0)$.'; },
      function (v) { return v.c1 * v.r1 * v.r1 + v.c2 * v.r2 * v.r2; },
      '$y\'\'(x) = c_1 r_1^2 e^{r_1 x} + c_2 r_2^2 e^{r_2 x}$, de modo que $y\'\'(0) = c_1 r_1^2 + c_2 r_2^2$.',
      { mistakes: { firstDeriv: function (v) { return v.c1 * v.r1 + v.c2 * v.r2; }, noSquare: function (v) { return (v.c1 + v.c2) * (v.r1 + v.r2); } },
        feedback: [
          { when: 'firstDeriv', say: 'Casi: ese valor corresponde a la primera derivada $y\'(0)$, no a la segunda.' },
          { when: 'noSquare', say: 'Casi: cada raíz debe elevarse al cuadrado por derivar dos veces.' }
        ] }),

    N('re-n-inflexion-x', 'reales', 3, { r1: [1, 2, 1], r2: [3, 4, 1], c1: [8, 12, 1], c2: [-2, -1, 1] },
      function (v) { return 'Calcula la coordenada $x$ del punto de inflexión (donde $y\'\'(x) = 0$) de $y(x) = ' + v.c1 + 'e^{' + v.r1 + 'x} ' + v.c2 + 'e^{' + v.r2 + 'x}$.'; },
      function (v) { return Math.log((-v.c1 * v.r1 * v.r1) / (v.c2 * v.r2 * v.r2)) / (v.r2 - v.r1); },
      '$y\'\'(x) = c_1 r_1^2 e^{r_1 x} + c_2 r_2^2 e^{r_2 x} = 0 \\implies e^{(r_2 - r_1)x} = \\frac{-c_1 r_1^2}{c_2 r_2^2}$.',
      { where: function (v) { return (-v.c1 * v.r1 * v.r1) / (v.c2 * v.r2 * v.r2) >= 1.5; },
        mistakes: { critPoint: function (v) { return Math.log((-v.c1 * v.r1) / (v.c2 * v.r2)) / (v.r2 - v.r1); }, invRatio: function (v) { return -Math.log((-v.c1 * v.r1 * v.r1) / (v.c2 * v.r2 * v.r2)) / (v.r2 - v.r1); } },
        feedback: [
          { when: 'critPoint', say: 'Casi: calculaste el punto crítico ($y\' = 0$) en vez del punto de inflexión ($y\'\' = 0$).' },
          { when: 'invRatio', say: 'Casi: la fracción dentro del logaritmo quedó invertida.' }
        ] }),

    E('re-e-pvi-general', 'reales', 2, { r1: [1, 3, 1], r2: [-3, -1, 1], y0: [1, 3, 1] },
      function (v) { var s = v.r1 + v.r2, p = v.r1 * v.r2; return 'Encuentra la solución explícita $y(x)$ de $y\'\'' + (s ? ' - ' + s + "y'" : '') + (p < 0 ? ' - ' + (-p) : ' + ' + p) + 'y = 0$ sujeta a $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + (v.r1 * v.y0) + '$.'; },
      function (v) { return v.y0 + '*e^(' + v.r1 + '*x)'; },
      'Con $c_1 + c_2 = y_0$ y $r_1 c_1 + r_2 c_2 = r_1 y_0$, se obtiene $c_1 = y_0$ y $c_2 = 0$, resultando $y = y_0 e^{r_1 x}$.',
      { domain: [-1, 1], where: function (v) { return v.r1 !== -v.r2; },
        mistakes: { bothRoots: function (v) { return (v.y0 / 2) + '*e^(' + v.r1 + '*x) + ' + (v.y0 / 2) + '*e^(' + v.r2 + '*x)'; } },
        feedback: [{ when: 'bothRoots', say: 'Casi: las condiciones iniciales determinan que $c_2 = 0$, por lo que solo queda una exponencial.' }] }),

    E('re-e-pvi-origen-nulo', 'reales', 2, { r1: [2, 4, 1], r2: [1, 1, 1] },
      function (v) { var s = v.r1 + v.r2, p = v.r1 * v.r2; return 'Halla la solución $y(x)$ que satisface $y\'\' - ' + s + "y' + " + p + 'y = 0$ partiendo de reposo en el origen con $y(0) = 0$ y $y\'(0) = ' + (v.r1 - v.r2) + '$.'; },
      function (v) { return 'e^(' + v.r1 + '*x) - e^(' + v.r2 + '*x)'; },
      '$c_1 + c_2 = 0 \\implies c_2 = -c_1$. $r_1 c_1 + r_2 c_2 = c_1(r_1 - r_2) = r_1 - r_2 \\implies c_1 = 1, c_2 = -1$.',
      { domain: [0, 1],
        mistakes: { plusSign: function (v) { return 'e^(' + v.r1 + '*x) + e^(' + v.r2 + '*x)'; } },
        feedback: [{ when: 'plusSign', say: 'Casi: para cumplir $y(0) = 0$ las exponenciales deben restarse, no sumarse.' }] }),

    E('re-e-pvi-simetrico', 'reales', 3, { a: [1, 3, 1], k: [2, 4, 1] },
      function (v) { return 'Determina la solución simétrica de la ecuación diferencial $y\'\' - ' + (v.k * v.k) + 'y = 0$ con $y(0) = ' + (2 * v.a) + '$ y $y\'(0) = 0$.'; },
      function (v) { return v.a + '*e^(' + v.k + '*x) + ' + v.a + '*e^(-' + v.k + '*x)'; },
      '$r = \\pm k$. $c_1 + c_2 = 2a$ y $k(c_1 - c_2) = 0 \\implies c_1 = c_2 = a$.',
      { domain: [-1, 1],
        mistakes: { cosForm: function (v) { return (2 * v.a) + '*cos(' + v.k + '*x)'; } },
        feedback: [{ when: 'cosForm', say: 'Casi: la ecuación es $y\'\' - k^2 y = 0$ (raíces reales $\\pm k$), no $y\'\' + k^2 y = 0$ (complejas).' }] }),

    /* ======================= 3. Raíz real doble y reducción de orden (17) ======================= */
    C('do-c-segunda-sol', 'doble', 1,
      'Cuando la ecuación característica tiene una raíz real repetida $r$, ¿por qué la segunda solución linealmente independiente contiene un factor $x$, es decir, $y_2 = x\\,e^{rx}$?',
      'Porque $e^{rx}$ y $e^{rx}$ son linealmente dependientes; la reducción de orden produce naturalmente el factor $x$', [
        ['Porque al derivar una raíz repetida se debe integrar un polinomio de grado cero', 'Casi: la justificación formal proviene del método de reducción de orden de d\'Alembert (S09).'],
        ['Porque toda ecuación diferencial de segundo orden debe incluir una función polinomial pura', 'Casi: la solución no es un polinomio puro, sino un polinomio multiplicado por la exponencial.'],
        ['Porque la constante de integración se multiplica por la variable $x$ en la primera derivada', 'Casi: el factor $x$ forma parte de la función fundamental $y_2$, no de la constante.']],
      'Dos soluciones fundamentales deben ser independientes ($W \\neq 0$). Al proponer $y_2 = u(x)e^{rx}$ en la EDO, la reducción de orden da $u\'\'(x) = 0 \\implies u(x) = x$.'),

    C('do-c-wronskiano-doble', 'doble', 1,
      '¿Cuál es el valor del Wronskiano $W(e^{rx}, x\\,e^{rx})$ para el conjunto fundamental en el caso de raíz doble?',
      '$W(x) = e^{2rx}$', [
        ['$W(x) = 0$, porque ambas soluciones comparten el mismo exponente $r$', 'Casi: si fuera 0 serían linealmente dependientes; el Wronskiano nunca se anula.'],
        ['$W(x) = x\\,e^{2rx}$', 'Casi: al calcular $(e^{rx})(e^{rx} + rxe^{rx}) - (re^{rx})(xe^{rx})$ el término con $x$ se cancela exactamente.'],
        ['$W(x) = 2r\\,e^{2rx}$', 'Casi: el coeficiente de $e^{2rx}$ es 1.']],
      '$W = y_1 y_2\' - y_1\' y_2 = e^{rx}(e^{rx} + rxe^{rx}) - re^{rx}(xe^{rx}) = e^{2rx} \\neq 0$ para todo $x$.'),

    C('do-c-error-c2', 'doble', 1,
      'En el PVI $y\'\' + 2\\,y\' + y = 0$ con $y(0) = 1$ y $y\'(0) = 0$, la raíz es $r = -1$. ¿Por qué es un error común suponer que $c_2 = y\'(0) = 0$?',
      'Porque la derivada del producto $(c_1 + c_2 x)e^{rx}$ evaluada en cero es $y\'(0) = r\\,c_1 + c_2$, no simplemente $c_2$', [
        ['Porque $c_1$ siempre debe ser igual a cero en cualquier problema de valor inicial', 'Casi: $c_1 = y(0) = 1$ en este caso, por lo que no es nulo.'],
        ['Porque la raíz doble obliga a que $c_2$ sea igual a $c_1$', 'Casi: $c_1$ y $c_2$ se calculan resolviendo el sistema lineal con las dos condiciones iniciales.'],
        ['Porque la constante $c_2$ solo aparece si la ecuación es de tercer orden', 'Casi: toda EDO de segundo orden tiene dos constantes arbitrarias $c_1$ y $c_2$.']],
      'Por la regla del producto, $y\'(0) = c_2 e^0 + r(c_1 + 0)e^0 = c_2 + r c_1$. Despejando: $c_2 = y\'(0) - r c_1$.'),

    C('do-c-oscilacion-nula', 'doble', 2,
      '¿Puede una solución no nula del caso de raíz real doble oscilar periódicamente cambiando de signo infinitas veces?',
      'No, porque $y(x) = (c_1 + c_2 x)e^{rx}$ solo puede anularse en a lo más un único punto $x = -c_1/c_2$', [
        ['Sí, porque la exponencial amortigua pero no elimina la oscilación', 'Casi: no hay funciones seno o coseno; una recta $(c_1 + c_2 x)$ cruza el eje a lo más una vez.'],
        ['Sí, si la constante $c_2$ es estrictamente negativa', 'Casi: el signo de $c_2$ cambia la orientación, pero sigue habiendo a lo más una sola raíz.'],
        ['Solo si la raíz doble es exactamente $r = 0$', 'Casi: con $r = 0$ la solución es una recta $y = c_1 + c_2 x$, que tampoco oscila.']],
      'El término exponencial nunca es cero; por tanto, $y(x) = 0 \\iff c_1 + c_2 x = 0$, lo que tiene una única solución si $c_2 \\neq 0$.'),

    C('do-c-puerta-hidraulica', 'doble', 2,
      'En la metáfora de la puerta con amortiguador hidráulico de la sesión, ¿a qué comportamiento físico corresponde exactamente el caso de raíz doble?',
      'Amortiguamiento crítico: la puerta se cierra en el menor tiempo posible sin rebotar ni oscilar', [
        ['Subamortiguado: la puerta rebota varias veces antes de detenerse', 'Casi: ese es el caso de raíces complejas conjugadas.'],
        ['Sobreamortiguado: el amortiguador es demasiado duro y la puerta se cierra con extrema lentitud', 'Casi: ese corresponde a dos raíces reales distintas.'],
        ['Sin amortiguamiento: la puerta oscila de un lado a otro eternamente', 'Casi: ese caso corresponde a raíces imaginarias puras ($b = 0$).']],
      'La raíz doble marca el límite exacto entre el comportamiento aperiódico lento y las oscilaciones: es el amortiguamiento crítico.'),

    C('do-c-maximo-absoluto', 'doble', 2,
      'Para $y(x) = (c_1 + c_2 x)e^{rx}$ con $r < 0$ y $c_2 > 0$, ¿qué condición asegura que la solución tenga un extremo local (máximo o mínimo) en $x > 0$?',
      'Que la derivada en el origen cumpla $y\'(0) = r\\,c_1 + c_2 > 0$ si $y(0) > 0$', [
        ['Que el coeficiente $c_1$ sea negativo y $c_2$ positivo', 'Casi: si $c_1 < 0$ la curva parte debajo de cero y puede no tener un máximo positivo.'],
        ['Que la raíz $r$ sea un número impar', 'Casi: la paridad de $r$ no tiene sentido matemático en el exponente.'],
        ['Que la ecuación diferencial tenga coeficientes fraccionarios', 'Casi: los coeficientes pueden ser enteros cualesquiera.']],
      'Si $y(0) > 0$ y la pendiente inicial es positiva ($y\'(0) > 0$), la función primero sube y luego decae a 0 por el factor $e^{rx}$ ($r < 0$), alcanzando un máximo.'),

    N('do-n-raiz-valor', 'doble', 1, { k: [2, 6, 1] },
      function (v) { return 'Calcula el valor de la raíz característica repetida $r$ de la ecuación diferencial $y\'\' + ' + (2 * v.k) + "y' + " + (v.k * v.k) + 'y = 0$.'; },
      function (v) { return -v.k; },
      'El polinomio es $(r + k)^2 = 0$, por lo que la raíz repetida es $r = -k$.',
      { mistakes: { posSign: function (v) { return v.k; }, twoK: function (v) { return -2 * v.k; } },
        feedback: [
          { when: 'posSign', say: 'Casi: en $(r + k)^2 = 0$, la raíz es $r = -k$, con signo negativo.' },
          { when: 'twoK', say: 'Casi: la raíz es $-b/(2a)$, no $-b$.' }
        ] }),

    N('do-n-c2-despeje', 'doble', 1, { r: [-4, -2, 1], y0: [2, 5, 1], yp: [1, 4, 1] },
      function (v) { return 'Para la solución $y(x) = (c_1 + c_2 x)e^{' + v.r + 'x}$, si $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + v.yp + '$, calcula el valor de la constante $c_2$.'; },
      function (v) { return v.yp - v.r * v.y0; },
      'Como $y(0) = c_1$, la derivada en cero es $y\'(0) = r c_1 + c_2 \\implies c_2 = y\'(0) - r y(0)$.',
      { mistakes: { forgotR: function (v) { return v.yp; }, wrongSign: function (v) { return v.yp + v.r * v.y0; } },
        feedback: [
          { when: 'forgotR', say: 'Casi: $y\'(0) = r c_1 + c_2$, así que $c_2 = y\'(0) - r c_1$, no solo $y\'(0)$.' },
          { when: 'wrongSign', say: 'Casi: al despejar $c_2$ el término $r c_1$ pasa restando: $c_2 = y\'(0) - r c_1$.' }
        ] }),

    N('do-n-eval-en-uno', 'doble', 2, { r: [-2, -1, 1], c1: [2, 4, 1], c2: [1, 3, 1] },
      function (v) { return 'Dada la solución de raíz doble $y(x) = (' + v.c1 + ' + ' + v.c2 + 'x)e^{' + v.r + 'x}$, calcula el valor numérico de $y(1)$.'; },
      function (v) { return (v.c1 + v.c2) * Math.exp(v.r); },
      'Sustituyendo $x = 1$: $y(1) = (c_1 + c_2)e^r$.',
      { mistakes: { noC2: function (v) { return v.c1 * Math.exp(v.r); }, posExp: function (v) { return (v.c1 + v.c2) * Math.exp(-v.r); } },
        feedback: [
          { when: 'noC2', say: 'Casi: olvidaste sumar el término con $c_2$ evaluado en $x = 1$.' },
          { when: 'posExp', say: 'Casi: el exponente es negativo, no positivo.' }
        ] }),

    N('do-n-punto-critico', 'doble', 2, { r: [-3, -1, 1], c1: [1, 3, 1], c2: [4, 8, 1] },
      function (v) { return 'Calcula la coordenada $x^*$ del punto crítico (donde $y\'(x) = 0$) de la función $y(x) = (' + v.c1 + ' + ' + v.c2 + 'x)e^{' + v.r + 'x}$.'; },
      function (v) { return -(v.r * v.c1 + v.c2) / (v.r * v.c2); },
      '$y\'(x) = [r(c_1 + c_2 x) + c_2]e^{rx} = 0 \\implies r c_1 + c_2 + r c_2 x = 0 \\implies x^* = -\\frac{r c_1 + c_2}{r c_2}$.',
      { where: function (v) { return -(v.r * v.c1 + v.c2) / (v.r * v.c2) >= 0.2 && Math.abs(v.c2 + 2 * v.r * v.c1) >= 2; },
        mistakes: { noC2InDeriv: function (v) { return -v.c1 / v.c2; }, wrongSign: function (v) { return (v.r * v.c1 + v.c2) / (v.r * v.c2); } },
        feedback: [
          { when: 'noC2InDeriv', say: 'Casi: la derivada del producto aporta un término adicional $+c_2$; no es solo $-c_1/c_2$.' },
          { when: 'wrongSign', say: 'Casi: revisa el despeje del signo al pasar al otro lado de la igualdad.' }
        ] }),

    N('do-n-valor-maximo', 'doble', 2, { k: [2, 4, 1] },
      function (v) { return 'La solución del PVI $y\'\' + ' + (2 * v.k) + "y' + " + (v.k * v.k) + 'y = 0$ con $y(0) = 0$ y $y\'(0) = 1$ es $y(x) = x\\,e^{-' + v.k + 'x}$. Calcula el valor máximo que alcanza la función $y(x)$.'; },
      function (v) { return (1 / v.k) * Math.exp(-1); },
      '$y\'(x) = (1 - kx)e^{-kx} = 0 \\implies x^* = 1/k$. El valor máximo es $y(1/k) = \\frac{1}{k}e^{-1}$.',
      { mistakes: { atOne: function (v) { return Math.exp(-v.k); }, noExp: function (v) { return 1 / v.k; } },
        feedback: [
          { when: 'atOne', say: 'Casi: evaluaste en $x = 1$, pero el máximo ocurre en $x = 1/k$.' },
          { when: 'noExp', say: 'Casi: esa es la posición $x^* = 1/k$; falta multiplicarla por $e^{-1}$.' }
        ] }),

    N('do-n-punto-inflexion', 'doble', 3, { r: [-2, -1, 1], c1: [1, 2, 1], c2: [3, 6, 1] },
      function (v) { return 'Calcula el punto de inflexión $x$ donde la segunda derivada se anula para $y(x) = (' + v.c1 + ' + ' + v.c2 + 'x)e^{' + v.r + 'x}$.'; },
      function (v) { return -(v.r * v.c1 + 2 * v.c2) / (v.r * v.c2); },
      '$y\'\'(x) = [r^2(c_1 + c_2 x) + 2r c_2]e^{rx} = 0 \\implies r^2 c_1 + 2r c_2 + r^2 c_2 x = 0 \\implies x = -\\frac{r c_1 + 2c_2}{r c_2}$.',
      { where: function (v) { return -(v.r * v.c1 + 2 * v.c2) / (v.r * v.c2) >= 0.2; },
        mistakes: { critPoint: function (v) { return -(v.r * v.c1 + v.c2) / (v.r * v.c2); }, wrongSign: function (v) { return (v.r * v.c1 + 2 * v.c2) / (v.r * v.c2); } },
        feedback: [
          { when: 'critPoint', say: 'Casi: ese es el punto crítico ($y\' = 0$), no el punto de inflexión ($y\'\' = 0$).' },
          { when: 'wrongSign', say: 'Casi: al despejar se tiene un signo negativo enfrente.' }
        ] }),

    N('do-n-cruce-cero', 'doble', 3, { r: [-3, -1, 1], c1: [-6, -2, 1], c2: [2, 5, 1] },
      function (v) { return 'Encuentra el valor de $x$ donde la curva $y(x) = (' + v.c1 + ' + ' + v.c2 + 'x)e^{' + v.r + 'x}$ cruza el eje de las abscisas.'; },
      function (v) { return -v.c1 / v.c2; },
      'Como $e^{rx} \\neq 0$, $y(x) = 0 \\iff c_1 + c_2 x = 0 \\implies x = -c_1/c_2$.',
      { where: function (v) { return Math.abs(-v.c1 / v.c2 - 1) >= 0.25; },
        mistakes: { wrongSign: function (v) { return v.c1 / v.c2; }, inverted: function (v) { return -v.c2 / v.c1; } },
        feedback: [
          { when: 'wrongSign', say: 'Casi: al despejar $c_1 + c_2 x = 0$ resulta $x = -c_1/c_2$.' },
          { when: 'inverted', say: 'Casi: la fracción es $c_1/c_2$, no $c_2/c_1$.' }
        ] }),

    E('do-e-sol-general-pvi', 'doble', 2, { k: [1, 3, 1], A: [1, 4, 1] },
      function (v) { return 'Halla la función $y(x)$ que resuelve el PVI $y\'\' + ' + (2 * v.k) + "y' + " + (v.k * v.k) + 'y = 0$ satisfaciendo las condiciones $y(0) = ' + v.A + '$ y $y\'(0) = ' + (-v.k * v.A) + '$.'; },
      function (v) { return v.A + '*e^(-' + v.k + '*x)'; },
      '$c_1 = A$. $y\'(0) = -k c_1 + c_2 = -k A + c_2 = -k A \\implies c_2 = 0$. Por lo tanto, $y = A e^{-kx}$.',
      { domain: [0, 2],
        mistakes: { withX: function (v) { return '(' + v.A + ' + x)*e^(-' + v.k + '*x)'; } },
        feedback: [{ when: 'withX', say: 'Casi: para estas condiciones iniciales la constante $c_2$ es exactamente cero.' }] }),

    E('do-e-sol-con-x', 'doble', 2, { k: [2, 4, 1], B: [2, 5, 1] },
      function (v) { return 'Determina la trayectoria $y(x)$ del PVI $y\'\' + ' + (2 * v.k) + "y' + " + (v.k * v.k) + 'y = 0$ sujeta a $y(0) = 0$ y $y\'(0) = ' + v.B + '$.'; },
      function (v) { return v.B + '*x*e^(-' + v.k + '*x)'; },
      '$y(0) = c_1 = 0$. $y\'(0) = -k c_1 + c_2 = c_2 = B$. Así, $y = B x e^{-kx}$.',
      { domain: [0, 2],
        mistakes: { noX: function (v) { return v.B + '*e^(-' + v.k + '*x)'; } },
        feedback: [{ when: 'noX', say: 'Casi: como $y(0) = 0$, $c_1 = 0$ y la solución proporcional a la velocidad es $c_2 x e^{rx}$.' }] }),

    E('do-e-ambas-constantes', 'doble', 2, { k: [1, 2, 1], c1: [1, 3, 1] },
      function (v) { return 'Calcula la solución particular del PVI $y\'\' + ' + (2 * v.k) + "y' + " + (v.k * v.k) + 'y = 0$ dado que $y(0) = ' + v.c1 + '$ y $y\'(0) = ' + (1 - v.k * v.c1) + '$.'; },
      function (v) { return '(' + v.c1 + ' + x)*e^(-' + v.k + '*x)'; },
      '$c_1 = y(0)$, y $y\'(0) = -k c_1 + c_2 = 1 - k c_1 \\implies c_2 = 1$. Así, $y = (c_1 + x)e^{-kx}$.',
      { domain: [0, 2],
        mistakes: { noExp: function (v) { return v.c1 + ' + x'; } },
        feedback: [{ when: 'noExp', say: 'Casi: falta el factor exponencial $e^{-kx}$.' }] }),

    E('do-e-desplazado-dif3', 'doble', 3, { k: [1, 2, 1], c2: [2, 3, 1] },
      function (v) { return 'Obtén la solución analítica de $y\'\' - ' + (2 * v.k) + "y' + " + (v.k * v.k) + 'y = 0$ sujeta a $y(0) = 1$ y $y\'(0) = ' + (v.k + v.c2) + '$.'; },
      function (v) { return '(1 + ' + v.c2 + '*x)*e^(' + v.k + '*x)'; },
      'La raíz es $+k$. $c_1 = 1$, $y\'(0) = k c_1 + c_2 = k + c_2 \\implies c_2$. Por lo tanto, $y = (1 + c_2 x)e^{kx}$.',
      { domain: [0, 2],
        mistakes: { negRoot: function (v) { return '(1 + ' + v.c2 + '*x)*e^(-' + v.k + '*x)'; } },
        feedback: [{ when: 'negRoot', say: 'Casi: la característica es $(r - k)^2 = 0$, por lo que la raíz es $+k$, no $-k$.' }] }),

    /* ======================= 4. Raíces complejas y oscilaciones (18) ======================= */
    C('co-c-euler-origen', 'complejas', 1,
      '¿Cómo se obtienen las dos soluciones reales $e^{\\alpha x}\\cos\\beta x$ y $e^{\\alpha x}\\sin\\beta x$ a partir de las raíces complejas $r = \\alpha \\pm \\beta i$?',
      'Aplicando la fórmula de Euler $e^{i\\theta} = \\cos\\theta + i\\sin\\theta$ y tomando combinaciones lineales de las soluciones complejas conjugadas', [
        ['Descartando la parte imaginaria $i\\beta$ y conservando solo la exponencial real', 'Casi: si descartas la parte imaginaria pierdes la oscilación y la segunda solución independiente.'],
        ['Integrando dos veces la función exponencial compleja en el plano de Gauss', 'Casi: no se integra; se suman y restan las soluciones $e^{(\\alpha + i\\beta)x}$ y $e^{(\\alpha - i\\beta)x}$.'],
        ['Aproximando las funciones trigonométricas por sus polinomios de Taylor', 'Casi: la equivalencia es exacta por la fórmula de Euler, no una aproximación.']],
      'La superposición $(y_1 + y_2)/2$ da $e^{\\alpha x}\\cos\\beta x$ y $(y_1 - y_2)/(2i)$ da $e^{\\alpha x}\\sin\\beta x$.'),

    C('co-c-signo-beta', 'complejas', 1,
      'Al escribir la solución general $y = e^{\\alpha x}(c_1\\cos\\beta x + c_2\\sin\\beta x)$, ¿por qué se toma siempre $\\beta > 0$?',
      'Porque $\\cos(-\\beta x) = \\cos\\beta x$ y el signo menos en $\\sin(-\\beta x) = -\\sin\\beta x$ puede ser absorbido por la constante arbitraria $c_2$', [
        ['Porque una frecuencia negativa provocaría que la función no fuera derivable en el origen', 'Casi: $\\sin(-\\beta x)$ es perfectamente derivable; simplemente no aporta soluciones nuevas.'],
        ['Porque el discriminante $b^2 - 4ac$ siempre es un número imaginario puro', 'Casi: el discriminante es un número real negativo.'],
        ['Porque los números negativos no tienen representación geométrica en el plano complejo', 'Casi: los números complejos tienen partes reales e imaginarias de cualquier signo.']],
      'Como el coseno es par y el seno es impar, usar $-\\beta$ no genera funciones linealmente independientes nuevas; por convención se toma $\\beta > 0$.'),

    C('co-c-periodo-vs-frec', 'complejas', 2,
      'En una solución oscilatoria de la forma $y(x) = e^{\\alpha x}\\cos(\\beta x)$, ¿cuál es la distancia temporal o espacial entre dos crestas sucesivas (el periodo cuasiperiódico $T$)?',
      '$T = \\dfrac{2\\pi}{\\beta}$', [
        ['$T = \\dfrac{\\beta}{2\\pi}$', 'Casi: esa es la frecuencia cíclica $f = 1/T$, no el periodo.'],
        ['$T = 2\\pi\\,\\beta$', 'Casi: el periodo es inversamente proporcional a la frecuencia angular $\\beta$.'],
        ['$T = \\dfrac{\\pi}{\\beta}$', 'Casi: $\\pi/\\beta$ es la distancia entre ceros consecutivos, no entre dos crestas (periodo completo $2\\pi/\\beta$).']],
      'El periodo fundamental de las funciones seno y coseno es $2\\pi$; por tanto, $\\beta T = 2\\pi \\implies T = 2\\pi/\\beta$.'),

    C('co-c-puro-sin-friccion', 'complejas', 2,
      '¿Qué forma tiene la solución general de $y\'\' + \\omega^2 y = 0$ (con $\\omega > 0$), correspondiente a raíces imaginarias puras $r = \\pm \\omega i$?',
      '$y(x) = c_1\\cos(\\omega x) + c_2\\sin(\\omega x)$, oscilando eternamente con amplitud constante', [
        ['$y(x) = c_1 e^{\\omega x} + c_2 e^{-\\omega x}$, oscilando sin freno', 'Casi: con raíces imaginarias puras no hay exponenciales reales.'],
        ['$y(x) = (c_1 + c_2 x)\\cos(\\omega x)$, creciendo linealmente la amplitud', 'Casi: esa resonancia ocurre cuando hay una fuerza externa forzada, no en la ecuación homogénea.'],
        ['$y(x) = c_1 e^{-\\omega x}\\cos(\\omega x)$, decayendo exponencialmente', 'Casi: la parte real $\\alpha = 0$, por lo que $e^{0x} = 1$; la amplitud no decae.']],
      'Al no haber término en $y\'$, la parte real es $\\alpha = 0$, por lo que no hay decaimiento exponencial ($e^0 = 1$) y la oscilación es armónica simple.'),

    C('co-c-envolvente-amplitud', 'complejas', 2,
      'Para la solución $y(x) = e^{\\alpha x}(c_1\\cos\\beta x + c_2\\sin\\beta x)$ con $\\alpha < 0$, ¿entre qué curvas límites queda atrapada la oscilación (las curvas envolventes)?',
      'Entre las curvas $y = \\pm A\\,e^{\\alpha x}$, donde $A = \\sqrt{c_1^2 + c_2^2}$', [
        ['Entre las rectas horizontales $y = \\pm A$', 'Casi: como $\\alpha < 0$, la amplitud se reduce exponencialmente con el tiempo, no es constante.'],
        ['Entre las asíntotas $y = \\pm \\frac{A}{x}$', 'Casi: la envolvente es de decaimiento exponencial $e^{\\alpha x}$, no hiperbólico $1/x$.'],
        ['Entre las parábolas $y = \\pm A(1 - \\alpha x^2)$', 'Casi: la envolvente proviene directamente de la exponencial $e^{\\alpha x}$.']],
      'Escribiendo $c_1\\cos\\beta x + c_2\\sin\\beta x = A\\cos(\\beta x - \\phi)$, como $|\\cos| \\le 1$, la gráfica está acotada por $\\pm A e^{\\alpha x}$.'),

    C('co-c-wronskiano-complejas', 'complejas', 3,
      '¿Cuánto vale el Wronskiano $W\\big(e^{\\alpha x}\\cos\\beta x,\\; e^{\\alpha x}\\sin\\beta x\\big)$ del conjunto fundamental de soluciones en el caso complejo?',
      '$W(x) = \\beta\\,e^{2\\alpha x}$', [
        ['$W(x) = e^{2\\alpha x}$, sin depender de la frecuencia $\\beta$', 'Casi: al derivar las funciones trigonométricas sale un factor $\\beta$ que multiplica al resultado.'],
        ['$W(x) = \\beta\\,(\\cos^2\\beta x - \\sin^2\\beta x)e^{2\\alpha x}$', 'Casi: por la identidad pitagórica fundamental $\\cos^2\\theta + \\sin^2\\theta = 1$, los términos trigonométricos se simplifican a 1.'],
        ['$W(x) = 0$', 'Casi: las dos soluciones son linealmente independientes, por lo que su Wronskiano es estrictamente positivo.']],
      'Al evaluar el determinante y aplicar $\\cos^2\\beta x + \\sin^2\\beta x = 1$, queda exactamente $\\beta e^{2\\alpha x} > 0$.'),

    N('co-n-periodo-numerico', 'complejas', 1, { b: [2, 6, 2] },
      function (v) { return 'Calcula el periodo $T$ de las oscilaciones de la ecuación diferencial $y\'\' + ' + (v.b * v.b) + 'y = 0$.'; },
      function (v) { return 2 * Math.PI / v.b; },
      'Las raíces son $\\pm bi$, de modo que la frecuencia angular es $\\beta = b$. El periodo es $T = 2\\pi/b$.',
      { mistakes: { halfPeriod: function (v) { return Math.PI / v.b; }, freq: function (v) { return v.b / (2 * Math.PI); } },
        feedback: [
          { when: 'halfPeriod', say: 'Casi: el periodo completo es $2\\pi/\\beta$, no $\\pi/\\beta$.' },
          { when: 'freq', say: 'Casi: calculaste la frecuencia $f = \\beta/(2\\pi)$ en lugar del periodo $T = 2\\pi/\\beta$.' }
        ] }),

    N('co-n-beta-valor', 'complejas', 1, { al: [1, 3, 1], be: [2, 5, 1] },
      function (v) { var b = 2 * v.al, c = v.al * v.al + v.be * v.be; return 'Calcula la frecuencia angular $\\beta$ (parte imaginaria de las raíces) para la ecuación $y\'\' + ' + b + "y' + " + c + 'y = 0$.'; },
      function (v) { return v.be; },
      'Las raíces son $-\\alpha \\pm \\beta i$, donde $\\beta = \\sqrt{4c - b^2}/2$.',
      { mistakes: { alpha: function (v) { return v.al; }, squared: function (v) { return v.be * v.be; } },
        feedback: [
          { when: 'alpha', say: 'Casi: diste la parte real $\\alpha$ en vez de la parte imaginaria $\\beta$.' },
          { when: 'squared', say: 'Casi: ese valor es $\\beta^2$; saca la raíz cuadrada.' }
        ] }),

    N('co-n-alpha-valor', 'complejas', 2, { b: [4, 12, 2], c: [40, 60, 5] },
      function (v) { return 'Determina el coeficiente de atenuación exponencial $\\alpha$ (parte real de las raíces) de la ecuación $y\'\' + ' + v.b + "y' + " + v.c + 'y = 0$.'; },
      function (v) { return -v.b / 2; },
      'La parte real de las raíces de $r^2 + b r + c = 0$ es $\\alpha = -b/2$.',
      { mistakes: { positive: function (v) { return v.b / 2; }, notHalf: function (v) { return -v.b; } },
        feedback: [
          { when: 'positive', say: 'Casi: la parte real lleva signo negativo: $\\alpha = -b/2$.' },
          { when: 'notHalf', say: 'Casi: olvidaste dividir entre 2: la parte real es $-b/(2a)$.' }
        ] }),

    N('co-n-c2-despeje', 'complejas', 2, { al: [-2, -1, 1], be: [2, 4, 1], y0: [1, 3, 1], yp: [1, 5, 1] },
      function (v) { return 'Para $y(x) = e^{' + v.al + 'x}(c_1\\cos(' + v.be + 'x) + c_2\\sin(' + v.be + 'x))$, si $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + v.yp + '$, calcula el valor de $c_2$.'; },
      function (v) { return (v.yp - v.al * v.y0) / v.be; },
      '$y(0) = c_1$. Por la regla del producto, $y\'(0) = \\alpha c_1 + \\beta c_2 \\implies c_2 = \\frac{y\'(0) - \\alpha y(0)}{\\beta}$.',
      { mistakes: { forgotAlpha: function (v) { return v.yp / v.be; }, forgotBeta: function (v) { return v.yp - v.al * v.y0; } },
        feedback: [
          { when: 'forgotAlpha', say: 'Casi: al derivar $e^{\\alpha x}\\cos(\\beta x)$ con la regla del producto aparece el término $\\alpha c_1$; no lo omitas.' },
          { when: 'forgotBeta', say: 'Casi: la derivada de $\\sin(\\beta x)$ aporta un factor $\\beta$; debes dividir entre $\\beta$.' }
        ] }),

    N('co-n-primer-cero-positivo', 'complejas', 2, { be: [2, 5, 1] },
      function (v) { return 'La solución $y(x) = e^{-x}\\cos(' + v.be + 'x)$ oscila y se amortigua. ¿En qué valor positivo más chico $x^*$ cruza por primera vez por cero?'; },
      function (v) { return Math.PI / (2 * v.be); },
      'Como $e^{-x} > 0$, el primer cero ocurre cuando $\\cos(\\beta x) = 0 \\implies \\beta x = \\pi/2 \\implies x = \\pi/(2\\beta)$.',
      { mistakes: { piOverBeta: function (v) { return Math.PI / v.be; }, twoPi: function (v) { return 2 * Math.PI / v.be; } },
        feedback: [
          { when: 'piOverBeta', say: 'Casi: $\\cos(\\theta) = 0$ ocurre en $\\theta = \\pi/2$, no en $\\pi$.' },
          { when: 'twoPi', say: 'Casi: ese es el periodo completo $2\\pi/\\beta$; el primer cero ocurre en un cuarto de periodo.' }
        ] }),

    N('co-n-amplitud-oscilacion', 'complejas', 3, { c1: [3, 6, 1], c2: [4, 8, 1] },
      function (v) { return 'Calcula la amplitud inicial $A = \\sqrt{c_1^2 + c_2^2}$ del movimiento descrito por $y(x) = e^{-2x}(' + v.c1 + '\\cos(3x) + ' + v.c2 + '\\sin(3x))$.'; },
      function (v) { return Math.sqrt(v.c1 * v.c1 + v.c2 * v.c2); },
      'La amplitud de $c_1\\cos(\\omega t) + c_2\\sin(\\omega t)$ es $\\sqrt{c_1^2 + c_2^2}$.',
      { where: function (v) { return v.c1 !== v.c2; },
        mistakes: { sumDirect: function (v) { return v.c1 + v.c2; }, squared: function (v) { return v.c1 * v.c1 + v.c2 * v.c2; } },
        feedback: [
          { when: 'sumDirect', say: 'Casi: la amplitud se suma en cuadratura: $\\sqrt{c_1^2 + c_2^2}$, no sumando linealmente.' },
          { when: 'squared', say: 'Casi: ese valor es $A^2$; saca la raíz cuadrada.' }
        ] }),

    N('co-n-tiempo-decaimiento-mitad', 'complejas', 3, { al: [2, 5, 1] },
      function (v) { return 'Si la amplitud de oscilación decae según la envolvente $A(t) = A_0\\,e^{-' + v.al + 't}$, ¿cuánto tiempo tarda la envolvente en reducirse a la mitad de su valor inicial?'; },
      function (v) { return Math.LN2 / v.al; },
      '$e^{-\\alpha t_{1/2}} = 1/2 \\implies -\\alpha t_{1/2} = -\\ln 2 \\implies t_{1/2} = \\frac{\\ln 2}{\\alpha}$.',
      { mistakes: { timesLn2: function (v) { return v.al * Math.LN2; }, inverse: function (v) { return 1 / v.al; } },
        feedback: [
          { when: 'timesLn2', say: 'Casi: debes dividir $\\ln 2$ entre $\\alpha$, no multiplicarlo.' },
          { when: 'inverse', say: 'Casi: $1/\\alpha$ es el tiempo para decaer a $1/e$; para la mitad es $(\\ln 2)/\\alpha$.' }
        ] }),

    E('co-e-pura-coseno', 'complejas', 2, { w: [2, 5, 1], y0: [2, 4, 1] },
      function (v) { return 'Determina la ley de movimiento del oscilador armónico simple $y\'\' + ' + (v.w * v.w) + 'y = 0$ con $y(0) = ' + v.y0 + '$ y $y\'(0) = 0$.'; },
      function (v) { return v.y0 + '*cos(' + v.w + '*x)'; },
      'Raíces $\\pm wi$. $c_1 = y(0) = y_0$, y $y\'(0) = w c_2 = 0 \\implies c_2 = 0$. Por tanto, $y = y_0\\cos(wx)$.',
      { domain: [0, 3],
        mistakes: { sinForm: function (v) { return v.y0 + '*sin(' + v.w + '*x)'; } },
        feedback: [{ when: 'sinForm', say: 'Casi: con $y(0) = y_0 \\neq 0$ y $y\'(0) = 0$ la solución es un coseno, no un seno.' }] }),

    E('co-e-pura-seno', 'complejas', 2, { w: [2, 4, 1], v0: [3, 6, 1] },
      function (v) { return 'Encuentra la posición $y(x)$ para el oscilador sin fricción $y\'\' + ' + (v.w * v.w) + 'y = 0$ sujeta a $y(0) = 0$ y $y\'(0) = ' + (v.w * v.v0) + '$.'; },
      function (v) { return v.v0 + '*sin(' + v.w + '*x)'; },
      '$c_1 = y(0) = 0$, $y\'(0) = w c_2 = w v_0 \\implies c_2 = v_0$. Por tanto, $y = v_0\\sin(wx)$.',
      { domain: [0, 3],
        mistakes: { cosForm: function (v) { return v.v0 + '*cos(' + v.w + '*x)'; } },
        feedback: [{ when: 'cosForm', say: 'Casi: como $y(0) = 0$, el término con coseno se anula.' }] }),

    E('co-e-amortiguada-seno', 'complejas', 2, { al: [1, 2, 1], be: [2, 3, 1] },
      function (v) { var b = 2 * v.al, c = v.al * v.al + v.be * v.be; return 'Halla la respuesta transitoria $y(x)$ de la ecuación $y\'\' + ' + b + "y' + " + c + 'y = 0$ sujeta a $y(0) = 0$ y $y\'(0) = ' + v.be + '$.'; },
      function (v) { return 'e^(-' + v.al + '*x)*sin(' + v.be + '*x)'; },
      'Como $y(0) = 0$, $c_1 = 0$. $y\'(0) = \\beta c_2 = \\beta \\implies c_2 = 1$. La solución es $e^{-\\alpha x}\\sin(\\beta x)$.',
      { domain: [0, 2],
        mistakes: { noExp: function (v) { return 'sin(' + v.be + '*x)'; }, cosForm: function (v) { return 'e^(-' + v.al + '*x)*cos(' + v.be + '*x)'; } },
        feedback: [
          { when: 'noExp', say: 'Casi: el término $y\'$ introduce amortiguamiento con el factor exponencial $e^{-\\alpha x}$.' },
          { when: 'cosForm', say: 'Casi: con $y(0) = 0$ la solución lleva seno, no coseno.' }
        ] }),

    E('co-e-amortiguada-coseno', 'complejas', 3, { al: [1, 2, 1], be: [2, 3, 1] },
      function (v) { var b = 2 * v.al, c = v.al * v.al + v.be * v.be; return 'Calcula la función de oscilación amortiguada $y(x)$ para $y\'\' + ' + b + "y' + " + c + 'y = 0$ que satisface $y(0) = 1$ y $y\'(0) = -' + v.al + '$.'; },
      function (v) { return 'e^(-' + v.al + '*x)*cos(' + v.be + '*x)'; },
      '$c_1 = 1$. $y\'(0) = -\\alpha c_1 + \\beta c_2 = -\\alpha + \\beta c_2 = -\\alpha \\implies c_2 = 0$. Así, $y = e^{-\\alpha x}\\cos(\\beta x)$.',
      { domain: [0, 2], where: function (v) { return v.al !== v.be; },
        mistakes: { withSin: function (v) { return 'e^(-' + v.al + '*x)*(cos(' + v.be + '*x) + sin(' + v.be + '*x))'; } },
        feedback: [{ when: 'withSin', say: 'Casi: la condición $y\'(0) = -\\alpha$ hace que $c_2 = 0$, eliminando el término en seno.' }] }),

    E('co-e-mixta-completa', 'complejas', 3, { al: [1, 2, 1], be: [1, 2, 1] },
      function (v) { var b = 2 * v.al, c = v.al * v.al + v.be * v.be; return 'Resuelve el problema de Cauchy de segundo orden $y\'\' + ' + b + "y' + " + c + 'y = 0$ con $y(0) = 1$ y $y\'(0) = ' + (v.be - v.al) + '$.'; },
      function (v) { return 'e^(-' + v.al + '*x)*(cos(' + v.be + '*x) + sin(' + v.be + '*x))'; },
      '$c_1 = 1$. $y\'(0) = -\\alpha(1) + \\beta c_2 = \\beta - \\alpha \\implies \\beta c_2 = \\beta \\implies c_2 = 1$.',
      { domain: [0, 2],
        mistakes: { minusSin: function (v) { return 'e^(-' + v.al + '*x)*(cos(' + v.be + '*x) - sin(' + v.be + '*x))'; } },
        feedback: [{ when: 'minusSin', say: 'Casi: el despeje de $c_2$ da $+1$, no $-1$.' }] }),

    /* ======================= 5. Problemas de valor inicial y unicidad (15) ======================= */
    C('pv-c-condiciones-necesarias', 'pvi', 1,
      '¿Por qué un problema de valor inicial para una EDO de segundo orden requiere exactamente dos condiciones iniciales (como $y(x_0)$ y $y\'(x_0)$)?',
      'Porque la solución general contiene dos constantes arbitrarias independientes que deben determinarse de forma única', [
        ['Porque una condición fija el signo positivo y la otra el signo negativo de la raíz', 'Casi: las constantes $c_1$ y $c_2$ son escalares arbitrarios que se fijan mediante un sistema $2 \\times 2$.'],
        ['Porque una condición se evalúa en el eje $x$ y la otra en el eje $y$', 'Casi: ambas condiciones se evalúan en el mismo punto inicial $x_0$.'],
        ['Porque la ecuación característica es de segundo grado y tiene dos raíces', 'Casi: aunque el grado sea 2, lo fundamental es que el espacio de soluciones tiene dimensión dos.']],
      'El espacio de soluciones de una EDO lineal homogénea de orden 2 tiene dimensión 2; para elegir una solución particular se necesitan 2 ecuaciones linealmente independientes.'),

    C('pv-c-teorema-existencia', 'pvi', 1,
      'Para la ecuación $a\\,y\'\' + b\\,y\' + c\\,y = 0$ con coeficientes constantes y $a \\neq 0$, ¿en qué intervalo garantiza el teorema de existencia y unicidad que la solución del PVI existe y es única?',
      'En toda la recta real $(-\\infty, \\infty)$', [
        ['Solo en el semieje positivo $[0, \\infty)$', 'Casi: la solución está definida y es única para todo $x \\in \\mathbb{R}$, incluyendo valores negativos.'],
        ['Únicamente en el intervalo cerrado $[-1, 1]$', 'Casi: como los coeficientes son constantes, no hay puntos singulares ni divisiones entre cero en ningún punto.'],
        ['Solo hasta el primer punto donde la solución cruza por cero', 'Casi: la solución continúa indefinidamente más allá de sus ceros.']],
      'Como las funciones de los coeficientes $P(x) = b/a$ y $Q(x) = c/a$ son continuas en todo $\\mathbb{R}$, la solución existe y es única en $(-\\infty, \\infty)$.'),

    C('pv-c-sol-trivial', 'pvi', 1,
      'Si en el PVI $a\\,y\'\' + b\\,y\' + c\\,y = 0$ las condiciones iniciales son $y(0) = 0$ y $y\'(0) = 0$, ¿cuál es la solución?',
      'La solución trivial $y(x) = 0$ para todo $x$, por el teorema de unicidad', [
        ['Cualquier función de la forma $y = c_1 e^{r_1 x}$ con $c_1$ arbitrario', 'Casi: para cumplir $y(0) = 0$ y $y\'(0) = 0$ obligatoriamente $c_1 = 0$ y $c_2 = 0$.'],
        ['No existe ninguna solución porque las condiciones se anulan', 'Casi: la función constante cero $y(x) \\equiv 0$ siempre es solución.'],
        ['Una oscilación de amplitud infinitesimal', 'Casi: la solución es idénticamente cero en todo su dominio.']],
      'La función idénticamente nula $y(x) = 0$ satisface la EDO homogénea y ambas condiciones iniciales. Por el teorema de unicidad, es la única solución.'),

    C('pv-c-determinante-sistema', 'pvi', 2,
      'Al aplicar las condiciones $y(x_0) = y_0$ y $y\'(x_0) = y\'_0$ a $y = c_1 y_1 + c_2 y_2$, se forma un sistema algebraico para $c_1$ y $c_2$. ¿Qué determinante garantiza que siempre tenga solución única?',
      'El determinante de la matriz del sistema es el Wronskiano $W(y_1, y_2)(x_0)$, que nunca es cero', [
        ['El discriminante de la ecuación característica $b^2 - 4ac$', 'Casi: el discriminante puede ser cero (raíz doble) y el sistema para $c_1, c_2$ aún tiene solución única.'],
        ['La suma de las constantes iniciales $y_0 + y\'_0$', 'Casi: la solvencia del sistema depende de los coeficientes de $c_1$ y $c_2$, es decir, de $y_1, y_2$ y sus derivadas.'],
        ['El determinante hessiano de la función de dos variables', 'Casi: se trata del Wronskiano, que es el determinante del sistema lineal de condiciones iniciales.']],
      'La matriz es $\\begin{pmatrix} y_1(x_0) & y_2(x_0) \\\\ y_1\'(x_0) & y_2\'(x_0) \\end{pmatrix}$, cuyo determinante es por definición el Wronskiano $W(x_0) \\neq 0$.'),

    C('pv-c-pvi-vs-pvf', 'pvi', 2,
      '¿Cuál es la diferencia fundamental entre un problema de valor inicial (PVI) y un problema de valores en la frontera (PVF) para una ecuación de segundo orden?',
      'En el PVI todas las condiciones se fijan en el mismo punto $x_0$; en el PVF se fijan en dos puntos distintos $x_1 \\neq x_2$', [
        ['En el PVI la ecuación es homogénea y en el PVF es no homogénea', 'Casi: ambos problemas pueden plantearse para ecuaciones homogéneas o no homogéneas.'],
        ['En el PVI la solución siempre oscila y en el PVF siempre decae', 'Casi: la forma de la solución depende de las raíces características, no del tipo de condiciones.'],
        ['En el PVF se fija la aceleración $y\'\'(x_0)$ en lugar de la posición', 'Casi: en el PVF se suelen fijar valores de la función en los extremos, como $y(0)$ y $y(L)$.']],
      'Un PVI especifica el estado completo en un solo instante $x_0$; un PVF especifica información en extremos separados del dominio.'),

    C('pv-c-curvas-no-cruzan', 'pvi', 3,
      '¿Pueden las gráficas de dos soluciones distintas de la misma EDO $y\'\' + a\\,y\' + b\\,y = 0$ cruzarse tangencialmente en un punto (mismo valor y misma pendiente)?',
      'No, porque violaría el teorema de unicidad: en ese punto tendrían el mismo PVI y deberían ser idénticas', [
        ['Sí, si la ecuación tiene raíces complejas conjugadas', 'Casi: el teorema de unicidad aplica a todos los casos sin excepción.'],
        ['Sí, siempre que el punto de cruce ocurra en el semieje negativo', 'Casi: la unicidad es válida en todo $\\mathbb{R}$.'],
        ['Solo si el discriminante es estrictamente positivo', 'Casi: dos soluciones distintas nunca pueden compartir posición y tangente en ningún punto.']],
      'Si compartieran $y(x_0)$ y $y\'(x_0)$, por el teorema de existencia y unicidad serían exactamente la misma solución para todo $x$.'),

    N('pv-n-sol-evaluada-reales', 'pvi', 1, { r1: [2, 4, 1], r2: [-2, -1, 1], y0: [2, 5, 1] },
      function (v) { var s = v.r1 + v.r2, p = v.r1 * v.r2; return 'Dada la solución del problema inicial $y\'\'' + (s ? ' - ' + s + "y'" : '') + (p < 0 ? ' - ' + (-p) : ' + ' + p) + 'y = 0$ con $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + (v.r1 * v.y0) + '$, indica directamente el valor numérico de $y(0)$.'; },
      function (v) { return v.y0; },
      'Por la primera condición inicial dada en el enunciado, $y(0) = y_0$.',
      { mistakes: { derivVal: function (v) { return v.r1 * v.y0; }, zero: function () { return 0.5; } },
        feedback: [
          { when: 'derivVal', say: 'Casi: ese es el valor de la derivada $y\'(0)$, no de la función $y(0)$.' },
          { when: 'zero', say: function (v) { return 'Casi: la condición inicial especifica directamente $y(0) = ' + v.y0 + '$.'; } }
        ] }),

    N('pv-n-c1-mas-c2', 'pvi', 2, { y0: [3, 8, 1], yp: [-4, 4, 1] },
      function (v) { return 'En cualquier solución general $y(x) = c_1 e^{r_1 x} + c_2 e^{r_2 x}$ de una EDO homogénea con $y(0) = ' + v.y0 + '$, ¿cuánto vale la suma de las constantes $c_1 + c_2$?'; },
      function (v) { return v.y0; },
      'Evaluando en $x = 0$: $y(0) = c_1 e^0 + c_2 e^0 = c_1 + c_2 = y_0$.',
      { where: function (v) { return Math.abs(v.yp - v.y0) > 1 && v.y0 / 2 !== v.yp; },
        mistakes: { deriv: function (v) { return v.yp; }, half: function (v) { return v.y0 / 2; } },
        feedback: [
          { when: 'deriv', say: 'Casi: $c_1 + c_2$ proviene de $y(0)$, no de $y\'(0)$.' },
          { when: 'half', say: function (v) { return 'Casi: la suma directa de ambas constantes es exactamente $y(0) = ' + v.y0 + '$.'; } }
        ] }),

    N('pv-n-eval-punto-no-cero', 'pvi', 2, { r: [2, 4, 1], y1: [3, 6, 1] },
      function (v) { return 'La solución del PVI $y\'\' - ' + (v.r * v.r) + 'y = 0$ con $y(1) = ' + v.y1 + '$ y $y\'(1) = ' + (v.r * v.y1) + '$ tiene la forma $y(x) = c\\,e^{' + v.r + 'x}$. ¿Cuánto vale $y(1)$?'; },
      function (v) { return v.y1; },
      'La condición inicial dada en el enunciado impone directamente que $y(1) = y_1$.',
      { mistakes: { derivVal: function (v) { return v.r * v.y1; }, cVal: function (v) { return v.y1 * Math.exp(-v.r); } },
        feedback: [
          { when: 'derivVal', say: 'Casi: ese es el valor de la derivada en $1$, no de la función.' },
          { when: 'cVal', say: function (v) { return 'Casi: ese sería el coeficiente $c$; el valor de $y(1)$ es directamente $' + v.y1 + '$.'; } }
        ] }),

    N('pv-n-segunda-deriv-inicial', 'pvi', 2, { a: [2, 4, 1], b: [3, 5, 1], y0: [1, 3, 1], yp: [2, 4, 1] },
      function (v) { return 'Si $y(x)$ resuelve $y\'\' + ' + v.a + "y' + " + v.b + 'y = 0$ con $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + v.yp + '$, calcula el valor de $y\'\'(0)$ despejándolo de la EDO.'; },
      function (v) { return -v.a * v.yp - v.b * v.y0; },
      'De la propia ecuación diferencial: $y\'\'(0) = -a y\'(0) - b y(0)$.',
      { mistakes: { posSign: function (v) { return v.a * v.yp + v.b * v.y0; }, forgotYP: function (v) { return -v.b * v.y0; } },
        feedback: [
          { when: 'posSign', say: 'Casi: al despejar $y\'\'(0)$ los términos pasan al lado derecho con signo negativo.' },
          { when: 'forgotYP', say: 'Casi: olvidaste incluir el término $-a y\'(0)$.' }
        ] }),

    N('pv-n-tercera-deriv-inicial', 'pvi', 3, { b: [2, 3, 1], c: [2, 4, 1], y0: [1, 2, 1], yp: [1, 2, 1] },
      function (v) { return 'Para la ecuación $y\'\' + ' + v.b + "y' + " + v.c + 'y = 0$ con $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + v.yp + '$, calcula el valor de la tercera derivada en el origen, $y\'\'\'(0)$.'; },
      function (v) { var ypp = -v.b * v.yp - v.c * v.y0; return -v.b * ypp - v.c * v.yp; },
      'Derivando la EDO: $y\'\'\' = -b y\'\' - c y\'$. Evaluando en 0 con $y\'\'(0) = -b y\'(0) - c y(0)$.',
      { mistakes: { justYPP: function (v) { return -v.b * v.yp - v.c * v.y0; }, wrongSign: function (v) { var ypp = -v.b * v.yp - v.c * v.y0; return v.b * ypp + v.c * v.yp; } },
        feedback: [
          { when: 'justYPP', say: 'Casi: ese valor es la segunda derivada $y\'\'(0)$, no la tercera.' },
          { when: 'wrongSign', say: 'Casi: revisa los signos al despejar $y\'\'\'(0) = -b y\'\'(0) - c y\'(0)$.' }
        ] }),

    E('pv-e-desplazado-en-uno', 'pvi', 2, { r1: [1, 2, 1], r2: [3, 4, 1] },
      function (v) { var s = v.r1 + v.r2, p = v.r1 * v.r2; return 'Resuelve la EDO $y\'\' - ' + s + "y' + " + p + 'y = 0$ sujeta a las condiciones en $x = 1$: $y(1) = e^{' + v.r1 + '}$ y $y\'(1) = ' + v.r1 + 'e^{' + v.r1 + '}$.'; },
      function (v) { return 'e^(' + v.r1 + '*x)'; },
      'La solución general es $c_1 e^{r_1 x} + c_2 e^{r_2 x}$. Las condiciones en $x = 1$ dan $c_1 = 1$ y $c_2 = 0$, resultando $y = e^{r_1 x}$.',
      { domain: [0.5, 2], where: function (v) { return v.r1 !== v.r2; },
        mistakes: { otherRoot: function (v) { return 'e^(' + v.r2 + '*x)'; } },
        feedback: [{ when: 'otherRoot', say: 'Casi: las condiciones coinciden exactamente con la primera raíz $r_1$, no con $r_2$.' }] }),

    E('pv-e-condicion-frontera-dos-puntos', 'pvi', 2, { k: [1, 3, 1] },
      function (v) { return 'Resuelve el problema de dos puntos $y\'\' - ' + (v.k * v.k) + 'y = 0$ con $y(0) = 0$ y $y(1) = e^{' + v.k + '} - e^{-' + v.k + '}$.'; },
      function (v) { return 'e^(' + v.k + '*x) - e^(-' + v.k + '*x)'; },
      '$y(0) = c_1 + c_2 = 0 \\implies c_2 = -c_1$. $y(1) = c_1(e^k - e^{-k}) = e^k - e^{-k} \\implies c_1 = 1, c_2 = -1$.',
      { domain: [0, 1],
        mistakes: { plusSign: function (v) { return 'e^(' + v.k + '*x) + e^(-' + v.k + '*x)'; } },
        feedback: [{ when: 'plusSign', say: 'Casi: para cumplir $y(0) = 0$ los términos deben restarse.' }] }),

    E('pv-e-condicion-mezclada', 'pvi', 3, { w: [1, 2, 1] },
      function (v) { return 'Resuelve el problema de frontera $y\'\' + ' + (v.w * v.w) + 'y = 0$ con $y\'(0) = 0$ y $y(0) = 3$.'; },
      function (v) { return '3*cos(' + v.w + '*x)'; },
      '$y = c_1\\cos(wx) + c_2\\sin(wx)$. $y\'(0) = w c_2 = 0 \\implies c_2 = 0$. $y(0) = c_1 = 3$.',
      { domain: [0, 2],
        mistakes: { sinForm: function (v) { return '3*sin(' + v.w + '*x)'; } },
        feedback: [{ when: 'sinForm', say: 'Casi: como $y\'(0) = 0$, el coeficiente del seno es cero y queda el coseno.' }] }),

    E('pv-e-segundo-orden-integral', 'pvi', 3, { a: [1, 2, 1] },
      function (v) { return 'Encuentra la solución del PVI $y\'\' - ' + v.a + "y' = 0$ sujeta a $y(0) = 1$ y $y'(0) = " + v.a + "$."; },
      function (v) { return 'e^(' + v.a + '*x)'; },
      'Raíces $r = 0$ y $r = a$. $y = c_1 + c_2 e^{ax}$. $y(0) = c_1 + c_2 = 1$; $y\'(0) = a c_2 = a \\implies c_2 = 1, c_1 = 0$. Solución: $y = e^{ax}$.',
      { domain: [0, 2],
        mistakes: { withConst: function (v) { return '1 + e^(' + v.a + '*x)'; } },
        feedback: [{ when: 'withConst', say: 'Casi: como $c_1 + c_2 = 1$ y $c_2 = 1$, la constante $c_1$ es exactamente cero.' }] }),

    /* ======================= 6. Plano complejo, estabilidad y parámetros (15) ======================= */
    C('cp-c-eje-imaginario-estabilidad', 'comportamiento', 1,
      'En el plano complejo, ¿qué significado cualitativo tiene que las raíces características se ubiquen estrictamente a la izquierda del eje imaginario (es decir, $\\text{Re}(r) < 0$)?',
      'Garantiza que todas las soluciones decaen a cero cuando $x \\to \\infty$, haciendo el sistema asintóticamente estable', [
        ['Indica que las soluciones oscilan con amplitud infinita', 'Casi: para amplitudes crecientes la parte real debe ser estrictamente positiva.'],
        ['Significa que la ecuación no tiene soluciones reales', 'Casi: las soluciones $y(x)$ son siempre funciones reales.'],
        ['Asegura que la solución permanece constante en el tiempo', 'Casi: decae hacia el equilibrio $y = 0$, no permanece estática.']],
      'El factor exponencial $e^{\\alpha x}$ con $\\alpha < 0$ tiende a cero conforme $x \\to \\infty$, lo que define la estabilidad asintótica.'),

    C('cp-c-plano-oscilacion', 'comportamiento', 1,
      '¿Cómo se reconoce visualmente en el plano complejo si las soluciones de una EDO homogénea van a presentar oscilaciones?',
      'Las raíces se encuentran fuera del eje real (tienen parte imaginaria distinta de cero)', [
        ['Las raíces están sobre el eje real negativo', 'Casi: las raíces sobre el eje real producen decaimiento exponencial puro sin oscilaciones.'],
        ['Las raíces están ubicadas exactamente en el origen $r = 0$', 'Casi: en el origen producen constantes o rectas, no oscilaciones.'],
        ['El círculo de radio unitario contiene a ambas raíces', 'Casi: la distancia al origen da la frecuencia natural, pero la presencia de oscilación la determina tener parte imaginaria.']],
      'La parte imaginaria $\\beta$ es la frecuencia angular de las oscilaciones; si $\\beta = 0$ las raíces son reales y no hay oscilación.'),

    C('cp-c-aumentar-amortiguador', 'comportamiento', 1,
      'En el laboratorio interactivo de la sesión, si mantienes fijos $m=1$ y $k=9$ y aumentas el amortiguamiento $b$ desde $0$ hasta un valor muy grande, ¿qué trayectoria siguen las raíces en el plano complejo?',
      'Inician en $\\pm 3i$, bajan hacia el eje real donde colisionan en $-3$, y luego se separan a lo largo del eje real', [
        ['Se alejan verticalmente hacia el infinito sin tocar nunca el eje real', 'Casi: al aumentar $b$ el discriminante pasa de negativo a cero y luego a positivo, llegando al eje real.'],
        ['Giran en círculos concéntricos alrededor del origen', 'Casi: la parte real $\\alpha = -b/2$ se desplaza hacia la izquierda a medida que $b$ crece.'],
        ['Permanecen fijas porque la rigidez $k$ no cambia', 'Casi: el amortiguamiento $b$ cambia tanto la parte real como el discriminante.']],
      'Con $\\Delta = b^2 - 36$, para $b < 6$ son complejas conjugadas con $\\alpha = -b/2$; en $b = 6$ colisionan en $r = -3$ y para $b > 6$ se separan como reales distintas.'),

    C('cp-c-inestabilidad-creciente', 'comportamiento', 2,
      'Si en $y\'\' - 2\\,y\' + 5y = 0$ las raíces son $r = 1 \\pm 2i$, ¿cuál es el comportamiento cualitativo de la solución para tiempos largos?',
      'Oscila con frecuencia $2$, pero su amplitud explota creciendo exponencialmente como $e^x$', [
        ['Oscila manteniéndose perfectamente acotada entre $-1$ y $1$', 'Casi: la parte real es $+1 > 0$, lo que genera un crecimiento descontrolado de la amplitud.'],
        ['Decae monótonamente a cero sin oscilar', 'Casi: la parte imaginaria $\\beta = 2$ produce oscilación y la parte real positiva produce crecimiento, no decaimiento.'],
        ['Se colapsa a cero instantáneamente', 'Casi: al revés, la solución diverge hacia $\\pm\\infty$ conforme $x \\to \\infty$.']],
      'La parte real $\\alpha = +1 > 0$ genera el factor envolvente $e^{+x}$, provocando oscilaciones de amplitud exponencialmente creciente (sistema inestable).'),

    C('cp-c-frecuencia-vs-distancia-eje', 'comportamiento', 2,
      'Entre más lejos se encuentren las raíces complejas del eje real (mayor valor de $|\\text{Im}(r)|$), ¿qué ocurre con las oscilaciones de la solución?',
      'Oscilan más rápidamente, es decir, tienen mayor frecuencia y menor periodo', [
        ['Oscilan más lentamente, tardando más tiempo en completar cada ciclo', 'Casi: mayor parte imaginaria $\\beta$ implica mayor frecuencia angular y periodo más corto $T = 2\\pi/\\beta$.'],
        ['Se amortiguan más rápido hacia el origen', 'Casi: la rapidez de amortiguamiento depende de la parte real $\\alpha$, no de la parte imaginaria $\\beta$.'],
        ['Dejan de oscilar y se convierten en exponenciales puras', 'Casi: alejarse del eje real aumenta el carácter oscilatorio.']],
      'La parte imaginaria es la frecuencia angular $\\beta$. A mayor $\\beta$, la frecuencia es mayor y el periodo $T = 2\\pi/\\beta$ es menor.'),

    C('cp-c-analogia-rlc', 'comportamiento', 2,
      'En la ecuación del circuito RLC libre $L\\,q\'\' + R\\,q\' + \\dfrac{1}{C}\\,q = 0$, ¿qué condición entre los parámetros eléctricos corresponde a la frontera de oscilación (amortiguamiento crítico)?',
      '$R = 2\\sqrt{\\dfrac{L}{C}}$', [
        ['$R = \\dfrac{L}{C}$', 'Casi: las unidades no coinciden y falta el factor 2 de la raíz del discriminante.'],
        ['$R = 0$', 'Casi: $R = 0$ es el caso sin amortiguamiento (imaginarias puras), no el amortiguamiento crítico.'],
        ['$R = \\sqrt{LC}$', 'Casi: la condición de discriminante cero $b^2 - 4ac = 0$ da $R^2 - 4L/C = 0 \\implies R = 2\\sqrt{L/C}$.']],
      'El discriminante es $R^2 - 4L(1/C) = 0 \\implies R^2 = 4L/C \\implies R = 2\\sqrt{L/C}$.'),

    N('cp-n-frecuencia-natural', 'comportamiento', 1, { k: [4, 25, 1], m: [1, 1, 1] },
      function (v) { return 'Calcula la frecuencia angular no amortiguada $\\omega_0 = \\sqrt{k/m}$ de un sistema masa-resorte gobernado por $y\'\' + ' + v.k + 'y = 0$.'; },
      function (v) { return Math.sqrt(v.k); },
      'Para $y\'\' + k\\,y = 0$, la frecuencia angular natural es $\\omega_0 = \\sqrt{k}$.',
      { where: function (v) { return Math.sqrt(v.k) % 1 === 0; },
        mistakes: { squared: function (v) { return v.k; }, period: function (v) { return 2 * Math.PI / Math.sqrt(v.k); } },
        feedback: [
          { when: 'squared', say: 'Casi: ese valor es $\\omega_0^2$; saca la raíz cuadrada.' },
          { when: 'period', say: 'Casi: calculaste el periodo $T$ en lugar de la frecuencia angular $\\omega_0$.' }
        ] }),

    N('cp-n-resistencia-critica', 'comportamiento', 2, { L: [1, 4, 1], Cinv: [4, 16, 4] },
      function (v) { return 'Para un circuito RLC con inductancia $L = ' + v.L + '$ H y capacitancia inversa $1/C = ' + v.Cinv + '$ F$^{-1}$, ¿cuál es el valor de la resistencia crítica $R_{\\text{crit}} = 2\\sqrt{L/C}$ en ohms?'; },
      function (v) { return 2 * Math.sqrt(v.L * v.Cinv); },
      'La resistencia crítica para discriminante nulo es $R = 2\\sqrt{L/C} = 2\\sqrt{L \\cdot (1/C)}$.',
      { mistakes: { noTwo: function (v) { return Math.sqrt(v.L * v.Cinv); }, squared: function (v) { return 4 * v.L * v.Cinv; } },
        feedback: [
          { when: 'noTwo', say: 'Casi: te faltó multiplicar por el factor 2: $R_{\\text{crit}} = 2\\sqrt{L/C}$.' },
          { when: 'squared', say: 'Casi: ese valor es $R^2$; extrae la raíz cuadrada.' }
        ] }),

    N('cp-n-tasa-decaimiento-relativa', 'comportamiento', 2, { b: [4, 12, 2], m: [2, 4, 1] },
      function (v) { return 'En $' + v.m + "y'' + " + v.b + "y' + 20y = 0$, ¿con qué tasa exponencial $\\alpha = -b/(2m)$ decae la envolvente de la solución? Da el valor absoluto $|\\alpha|$."; },
      function (v) { return v.b / (2 * v.m); },
      'La tasa de decaimiento es la magnitud de la parte real: $|\\alpha| = b/(2m)$.',
      { where: function (v) { return v.b / (2 * v.m) >= 0.5 && v.m >= 2; },
        mistakes: { notHalf: function (v) { return v.b / v.m; }, justB: function (v) { return v.b; } },
        feedback: [
          { when: 'notHalf', say: 'Casi: la parte real lleva un factor $2m$ en el denominador, no solo $m$.' },
          { when: 'justB', say: 'Casi: debes dividir entre $2m$.' }
        ] }),

    N('cp-n-cuasifrecuencia-amortiguada', 'comportamiento', 2, { w0: [5, 8, 1], al: [2, 4, 1] },
      function (v) { return 'Un oscilador tiene frecuencia natural $\\omega_0 = ' + v.w0 + '$ rad/s y atenuación $\\alpha = ' + v.al + '$ s$^{-1}$. Calcula su cuasifrecuencia amortiguada $\\beta = \\sqrt{\\omega_0^2 - \\alpha^2}$.'; },
      function (v) { return Math.sqrt(v.w0 * v.w0 - v.al * v.al); },
      'La frecuencia de oscilación amortiguada se reduce por la fricción: $\\beta = \\sqrt{\\omega_0^2 - \\alpha^2}$.',
      { where: function (v) { return v.w0 * v.w0 - v.al * v.al >= 9 && Math.abs(Math.sqrt(v.w0 * v.w0 - v.al * v.al) - (v.w0 - v.al)) >= 0.5; },
        mistakes: { diffDirect: function (v) { return v.w0 - v.al; }, plus: function (v) { return Math.sqrt(v.w0 * v.w0 + v.al * v.al); } },
        feedback: [
          { when: 'diffDirect', say: 'Casi: se restan los cuadrados bajo la raíz: $\\sqrt{\\omega_0^2 - \\alpha^2}$, no $\\omega_0 - \\alpha$.' },
          { when: 'plus', say: 'Casi: la amortiguación reduce la frecuencia, por lo que se resta $\\alpha^2$, no se suma.' }
        ] }),

    N('cp-n-tiempo-reduccion-90', 'comportamiento', 2, { al: [2, 5, 1] },
      function (v) { return 'La envolvente de un oscilador decae como $e^{-' + v.al + 't}$. ¿En cuántos segundos se reduce la amplitud al 10 % de su valor inicial (es decir, cuando $e^{-' + v.al + 't} = 0.1$)?'; },
      function (v) { return Math.log(10) / v.al; },
      '$e^{-\\alpha t} = 0.1 \\implies -\\alpha t = -\\ln(10) \\implies t = \\frac{\\ln(10)}{\\alpha}$.',
      { mistakes: { ln2: function (v) { return Math.LN2 / v.al; }, timesLn: function (v) { return v.al * Math.log(10); } },
        feedback: [
          { when: 'ln2', say: 'Casi: calculaste el tiempo para reducirse al 50 % (usando $\\ln 2$), pero se pidió al 10 % (usa $\\ln 10$).' },
          { when: 'timesLn', say: 'Casi: debes dividir entre $\\alpha$, no multiplicar.' }
        ] }),

    N('cp-n-razon-decremento', 'comportamiento', 2, { al: [1, 2, 1], be: [2, 4, 1] },
      function (v) { return 'Para una oscilación amortiguada con tasa $\\alpha = ' + v.al + '$ y cuasifrecuencia $\\beta = ' + v.be + '$ rad/s (con periodo $T = 2\\pi/' + v.be + '$), calcula el decremento logarítmico $\\delta = \\alpha\\,T$.'; },
      function (v) { return v.al * (2 * Math.PI / v.be); },
      'El decremento logarítmico mide la atenuación por ciclo: $\\delta = \\alpha T = \\frac{2\\pi\\alpha}{\\beta}$.',
      { mistakes: { divT: function (v) { return v.al / (2 * Math.PI / v.be); }, justAlpha: function (v) { return v.al; } },
        feedback: [
          { when: 'divT', say: 'Casi: el decremento logarítmico es el producto $\\delta = \\alpha T$, no la división.' },
          { when: 'justAlpha', say: 'Casi: debes multiplicar la tasa $\\alpha$ por el periodo $T$.' }
        ] }),

    N('cp-n-ciclos-hasta-parar', 'comportamiento', 2, { be: [3, 6, 1] },
      function (v) { return 'Si el periodo de oscilación es $T = \\frac{2\\pi}{' + v.be + '}$ y la constante de atenuación es $\\alpha = 1$, ¿cuál es el factor de reducción de amplitud en exactamente un periodo completo, $e^{-\\alpha T}$?'; },
      function (v) { return Math.exp(-2 * Math.PI / v.be); },
      'En cada periodo la amplitud se multiplica por $e^{-\\alpha T} = e^{-2\\pi/\\beta}$.',
      { mistakes: { posExp: function (v) { return Math.exp(2 * Math.PI / v.be); }, linear: function (v) { return 1 - 2 * Math.PI / v.be; } },
        feedback: [
          { when: 'posExp', say: 'Casi: al decaer la amplitud, el factor es menor a 1, con exponente negativo.' },
          { when: 'linear', say: 'Casi: la reducción es exponencial $e^{-\\alpha T}$, no lineal.' }
        ] }),

    N('cp-n-modulo-raiz-compleja', 'comportamiento', 3, { al: [3, 4, 1], be: [4, 5, 1] },
      function (v) { return 'Calcula la distancia al origen (módulo $|r| = \\sqrt{\\alpha^2 + \\beta^2}$) de las raíces complejas de la ecuación $y\'\' + ' + (2 * v.al) + "y' + " + (v.al * v.al + v.be * v.be) + 'y = 0$.'; },
      function (v) { return Math.sqrt(v.al * v.al + v.be * v.be); },
      'El módulo de $r = -\\alpha \\pm \\beta i$ es $|r| = \\sqrt{\\alpha^2 + \\beta^2} = \\sqrt{c/a}$.',
      { where: function (v) { return v.al !== v.be; },
        mistakes: { squared: function (v) { return v.al * v.al + v.be * v.be; }, sumDirect: function (v) { return v.al + v.be; } },
        feedback: [
          { when: 'squared', say: 'Casi: ese valor es $|r|^2$; extrae la raíz cuadrada.' },
          { when: 'sumDirect', say: 'Casi: el módulo es la hipotenusa $\\sqrt{\\alpha^2 + \\beta^2}$, no la suma directa.' }
        ] }),

    N('cp-n-angulo-fase-raiz', 'comportamiento', 3, { al: [1, 3, 1], be: [1, 3, 1] },
      function (v) { return 'Para la raíz $r = -' + v.al + ' + ' + v.be + 'i$ en el segundo cuadrante del plano complejo, calcula su argumento principal en radianes $\\theta \\in [0, \\pi]$.'; },
      function (v) { return Math.atan2(v.be, -v.al); },
      'En el segundo cuadrante con parte real negativa e imaginaria positiva, $\\theta = \\pi - \\arctan(\\beta/\\alpha) = 3\\pi/4 \\approx 2.36$ rad.',
      { where: function (v) { return v.al === v.be; },
        mistakes: { firstQuad: function (v) { return Math.atan2(v.be, v.al); }, deg: function (v) { return Math.atan2(v.be, -v.al) * 180 / Math.PI; } },
        feedback: [
          { when: 'firstQuad', say: 'Casi: la parte real es negativa (segundo cuadrante); tu ángulo está en el primer cuadrante.' },
          { when: 'deg', say: 'Casi: el ángulo se pide en radianes, no en grados sexagesimales.' }
        ] })
  ];

  K.register(SUBTEMAS, Q);
})();
