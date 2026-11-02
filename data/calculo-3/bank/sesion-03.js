/* =====================================================================
   Banco · Cálculo 3 · S03 · Reducibles a separables: homogéneas (y = ux)
   y la sustitución u = ax + by + c. 100 preguntas propias.
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c3', '03'), C = K.C;

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
    'c3.S03.homogeneas': 'Reconocimiento de homogéneas e isoclinas radiales',
    'c3.S03.cambio-ux': 'Sustitución y = ux y reducción a separable',
    'c3.S03.pvi-homogeneo': 'PVI en ecuaciones homogéneas',
    'c3.S03.sustitucion-lineal': 'Cambio u = ax + by + c y reducción autónoma',
    'c3.S03.pvi-lineal': 'PVI con u = ax + by + c',
    'c3.S03.errores-metodo': 'Condición inicial, regreso a y y elección de método'
  };

  var Q = [
    /* ======================= 1. Reconocimiento de homogéneas e isoclinas radiales (17) ======================= */
    C('ho-def-cociente', 'homogeneas', 1,
      '¿Cuándo se dice que una EDO de primer orden $y\' = f(x, y)$ es <strong>homogénea</strong> (por cambio de variable)?',
      'Cuando el lado derecho depende únicamente del cociente $y/x$, es decir, $y\' = F(y/x)$', [
        ['Cuando la ecuación está igualada a cero sin término independiente', 'Casi: eso define una ecuación lineal homogénea, que es otro concepto.'],
        ['Cuando $f(x, y)$ se factoriza como un producto $g(x)\\,h(y)$', 'Casi: esa es la condición para que sea directamente separable.'],
        ['Cuando todos los coeficientes de $x$ y $y$ son constantes', 'Casi: $(x^2 + y^2)/(xy)$ no tiene coeficientes constantes y sí es homogénea.']],
      'En primer orden, homogénea significa que $f(x, y)$ se expresa solo con la razón $y/x$: $y\' = F(y/x)$.'),

    C('ho-prueba-escalamiento', 'homogeneas', 1,
      'Si aplicas la prueba de escalamiento cambiando $(x, y)$ por $(tx, ty)$ con $t > 0$ en $y\' = f(x, y)$, ¿qué debe ocurrir para que sea homogénea?',
      'El factor $t$ debe cancelarse por completo, cumpliéndose $f(tx, ty) = f(x, y)$', [
        ['Debe quedar $f(tx, ty) = t\\,f(x, y)$ con potencia uno', 'Casi: para depender solo de $y/x$, el grado total de $f$ debe ser cero, sin factor $t$ sobrante.'],
        ['Debe anularse la expresión, dando $f(tx, ty) = 0$', 'Casi: escalar las variables deja la expresión idéntica a la original, no cero.'],
        ['Debe invertirse la fracción, dando $f(tx, ty) = 1/f(x, y)$', 'Casi: como $(ty)/(tx) = y/x$, el valor de $f$ queda igual.']],
      'Como $(ty)/(tx) = y/x$, toda función del cociente $y/x$ cumple $f(tx, ty) = f(x, y)$.'),

    C('ho-no-homogenea-constante', 'homogeneas', 1,
      function (v) { return '¿Por qué la ecuación diferencial $y\' = \\dfrac{x + y + ' + v.c + '}{x}$ <strong>no</strong> es homogénea?'; },
      function (v) { return 'Porque al dividir entre $x$ queda $1 + \\dfrac{y}{x} + \\dfrac{' + v.c + '}{x}$, y el término $\\dfrac{' + v.c + '}{x}$ no depende de $y/x$'; }, [
        [function (v) { return 'Porque aparece la suma $x + y$ junto a $' + v.c + '$'; }, 'Casi: $(x + y)/x = 1 + y/x$ sí depende de $y/x$; lo que falla es la constante suelta.'],
        ['Porque el denominador solo contiene a $x$', 'Casi: $(x + y)/x$ solo tiene $x$ abajo y sí es homogénea; el problema es el término de grado cero.'],
        ['Sí es homogénea, porque ningún exponente pasa de $1$', 'Casi: todos los términos deben tener exactamente el mismo grado, y la constante tiene grado $0$.']],
      'La constante tiene grado $0$ mientras que $x$ y $y$ tienen grado $1$, así que $f(tx, ty)$ no cancela la $t$.',
      { vars: { c: [2, 7, 1] } }),

    C('ho-isoclinas-rayos', 'homogeneas', 1,
      'En el campo de pendientes de una EDO homogénea $y\' = F(y/x)$, ¿cómo son las rayitas de pendiente sobre una misma recta $y = mx$ que sale del origen?',
      'Son paralelas entre sí, porque sobre la recta $y = mx$ el cociente $y/x = m$ es constante', [
        ['Son perpendiculares a la recta $y = mx$ en cada punto', 'Casi: la pendiente vale $F(m)$, no necesariamente $-1/m$; lo que cumplen es ser paralelas entre sí.'],
        ['Aumentan de inclinación al alejarse del origen sobre el rayo', 'Casi: sobre $y = mx$ el cociente $y/x = m$ no cambia al alejarse del origen.'],
        ['Son todas horizontales sobre cualquier rayo', 'Casi: solo son horizontales si la pendiente $m$ del rayo cumple $F(m) = 0$.']],
      'Sobre cada rayo $y = mx$ el cociente $y/x$ vale $m$, por lo que la pendiente $F(m)$ es constante a lo largo del rayo.'),

    N('ho-n-evaluar-Fu-frac', 'homogeneas', 1, { a: [2, 5, 1], b: [1, 4, 1], u0: [2, 4, 1] },
      function (v) { return 'Al reescribir la ecuación homogénea $y\' = \\dfrac{' + v.a + 'x^2 + ' + v.b + 'y^2}{x y}$ en la forma $y\' = F(u)$ con $u = y/x$, ¿cuánto vale $F(' + v.u0 + ')$?'; },
      function (v) { return (v.a + v.b * v.u0 * v.u0) / v.u0; },
      'Dividiendo numerador y denominador entre $x^2$ queda $F(u) = (a + bu^2)/u$.',
      { where: function (v) { return v.a !== v.b; },
        mistakes: { noDivU: function (v) { return v.a + v.b * v.u0 * v.u0; }, swappedAB: function (v) { return (v.a * v.u0 * v.u0 + v.b) / v.u0; } },
        feedback: [
          { when: 'noDivU', say: 'Casi: al dividir el denominador $xy$ entre $x^2$ queda $u$ dividiendo.' },
          { when: 'swappedAB', say: 'Casi: el coeficiente que multiplica a $u^2$ es el de $y^2$, no el de $x^2$.' }
        ] }),

    N('ho-n-pendiente-en-rayo', 'homogeneas', 1, { k: [2, 6, 1], m: [2, 4, 1], x0: [5, 8, 1] },
      function (v) { return 'Para la ecuación homogénea $y\' = ' + v.k + '\\,\\dfrac{y}{x} + \\left(\\dfrac{y}{x}\\right)^2$, ¿cuánto vale la pendiente $y\'$ en el punto $(' + v.x0 + ', ' + (v.m * v.x0) + ')$ sobre la recta $y = ' + v.m + 'x$?'; },
      function (v) { return v.k * v.m + v.m * v.m; },
      'En $(x_0, mx_0)$ el cociente $y/x$ vale $m$, por lo que $y\' = km + m^2$.',
      { mistakes: { usedX0: function (v) { return v.k * v.x0 + v.x0 * v.x0; }, forgotSq: function (v) { return (v.k + 1) * v.m; } },
        feedback: [
          { when: 'usedX0', say: 'Casi: sustituiste $x_0$ en lugar del cociente $y_0/x_0 = m$.' },
          { when: 'forgotSq', say: 'Casi: el segundo término eleva al cuadrado el cociente $y/x = m$.' }
        ] }),

    C('ho-homogenea-vs-lineal', 'homogeneas', 2,
      '¿Cuál es la diferencia entre decir que $y\' = \\dfrac{x^2 + y^2}{xy}$ es homogénea y decir que $y\'\' + 3y\' + 2y = 0$ es lineal homogénea?',
      'En primer orden por sustitución significa que $y\' = F(y/x)$, mientras que en una EDO lineal significa que el término independiente de $y$ es cero', [
        ['Significan exactamente lo mismo: que todas las soluciones pasan por $(0, 0)$', 'Casi: son dos definiciones distintas que comparten nombre por razones históricas.'],
        ['La primera exige que no aparezca $x$ y la segunda que los coeficientes sean constantes', 'Casi: en $(x^2 + y^2)/(xy)$ sí aparece $x$, y una lineal homogénea puede tener coeficientes variables.'],
        ['La primera pide estar igualada a cero y la segunda depender de $y/x$', 'Casi: es al revés; $y\' = F(y/x)$ es la homogénea por sustitución.']],
      'Son dos usos distintos del término: $y\' = F(y/x)$ frente a una lineal con lado derecho $g(x) = 0$.'),

    C('ho-cual-es-homogenea-lista', 'homogeneas', 2,
      function () { return '¿Cuál de las siguientes ecuaciones diferenciales de primer orden sí es homogénea (de la forma $y\' = F(y/x)$)?'; },
      function (v) { return '$y\' = \\dfrac{x^{' + v.n + '} + y^{' + v.n + '}}{x^{' + (v.n - 1) + '}y}$'; }, [
        [function (v) { return '$y\' = \\dfrac{x^{' + v.n + '} + y^{' + v.n + '}}{x^{' + (v.n - 1) + '} + y}$'; }, 'Casi: en el denominador se suman términos de grados distintos ($n - 1$ y $1$).'],
        [function (v) { return '$y\' = x^{' + v.n + '} + y^{' + v.n + '}$'; }, 'Casi: al escalar $(tx, ty)$ queda un factor $t^n$ que no se cancela.'],
        [function (v) { return '$y\' = \\dfrac{x^{' + v.n + '} + y}{x^{' + v.n + '}}$'; }, 'Casi: en el numerador $x^n$ tiene grado $n$ pero $y$ tiene grado $1$.']],
      'En $\\frac{x^n + y^n}{x^{n-1}y}$ todos los términos son de grado $n$; dividiendo entre $x^n$ queda $\\frac{1 + u^n}{u}$.',
      { vars: { n: [3, 6, 1] } }),

    C('ho-reescribir-dividiendo-x2', 'homogeneas', 2,
      function (v) { return 'Si divides numerador y denominador entre $x^2$ en $y\' = \\dfrac{' + v.a + 'x^2 - ' + v.b + 'xy}{x^2 + y^2}$ y llamas $u = y/x$, ¿qué función $F(u)$ obtienes?'; },
      function (v) { return '$F(u) = \\dfrac{' + v.a + ' - ' + v.b + 'u}{1 + u^2}$'; }, [
        [function (v) { return '$F(u) = \\dfrac{' + v.a + 'u^2 - ' + v.b + 'u}{1 + u^2}$'; }, 'Casi: al dividir $ax^2$ entre $x^2$ queda la constante $a$, no $au^2$.'],
        [function (v) { return '$F(u) = \\dfrac{' + v.a + ' - ' + v.b + 'u^2}{1 + u}$'; }, 'Casi: $xy/x^2 = u$ tiene exponente $1$ y $y^2/x^2 = u^2$ tiene exponente $2$.'],
        [function (v) { return '$F(u) = \\dfrac{' + v.a + ' + ' + v.b + 'u}{1 - u^2}$'; }, 'Casi: al dividir entre $x^2$ los signos no se invierten.']],
      'Como $x^2/x^2 = 1$, $xy/x^2 = u$ y $y^2/x^2 = u^2$, resulta $F(u) = \\frac{a - bu}{1 + u^2}$.',
      { vars: { a: [2, 6, 1], b: [3, 7, 1] } }),

    N('ho-n-exponente-grado-hom', 'homogeneas', 2, { p: [3, 6, 1], q: [1, 2, 1] },
      function (v) { return '¿Qué valor debe tener el exponente $m$ para que todos los términos de $(x^{' + (v.p + v.q) + '} + x^{' + v.p + '} y^{' + v.q + '})\\,dx - x^{' + v.q + '} y^m\\,dy = 0$ tengan el mismo grado total y la EDO sea homogénea?'; },
      function (v) { return v.p; },
      'El grado total de cada término es $p + q$, así que $q + m = p + q \\Rightarrow m = p$.',
      { mistakes: { sumPQ: function (v) { return v.p + v.q; }, valQ: function (v) { return v.q; } },
        feedback: [
          { when: 'sumPQ', say: 'Casi: ese es el grado total $p + q$; debes restar el exponente $q$ de $x^q$.' },
          { when: 'valQ', say: 'Casi: para que $q + m = p + q$, el exponente $m$ debe ser $p$.' }
        ] }),

    N('ho-n-evaluar-Fu-cubica', 'homogeneas', 2, { a: [2, 5, 1], b: [1, 4, 1], u0: [2, 3, 1] },
      function (v) { return 'La ecuación $x^2 y\\,y\' = ' + v.a + 'x^3 + ' + v.b + 'y^3$ es homogénea. Si despejas $y\' = F(u)$ con $u = y/x$, ¿cuánto vale $F(' + v.u0 + ')$?'; },
      function (v) { return (v.a + v.b * Math.pow(v.u0, 3)) / v.u0; },
      'Despejando $y\' = \\frac{ax^3 + by^3}{x^2 y}$ y dividiendo entre $x^3$ resulta $F(u) = \\frac{a + bu^3}{u}$.',
      { mistakes: { noDivU: function (v) { return v.a + v.b * Math.pow(v.u0, 3); }, divU2: function (v) { return (v.a + v.b * Math.pow(v.u0, 3)) / (v.u0 * v.u0); } },
        feedback: [
          { when: 'noDivU', say: 'Casi: al dividir el denominador $x^2 y$ entre $x^3$ queda $u$ dividiendo.' },
          { when: 'divU2', say: 'Casi: abajo hay $x^2 y$ (una sola $y$), así que se divide entre $u$, no entre $u^2$.' }
        ] }),

    N('ho-n-evaluar-Fu-exp', 'homogeneas', 2, { a: [1, 3, 1], x0: [2, 4, 1], k: [1, 2, 1] },
      function (v) { return 'Sea la ecuación homogénea $x\\,y\' = y + ' + v.a + 'x\\,e^{y/x}$. Evalúa la derivada $y\'$ en el punto $(' + v.x0 + ', ' + (v.k * v.x0) + ')$.'; },
      function (v) { return v.k + v.a * Math.exp(v.k); },
      'Dividiendo entre $x$ queda $y\' = y/x + ae^{y/x}$, y en $(x_0, kx_0)$ se tiene $y/x = k$.',
      { mistakes: { noDivX: function (v) { return v.x0 * (v.k + v.a * Math.exp(v.k)); }, expY0: function (v) { return v.k + v.a * Math.exp(v.k * v.x0); } },
        feedback: [
          { when: 'noDivX', say: 'Casi: ese es el valor de $x\\,y\'$; falta dividir entre $x_0$.' },
          { when: 'expY0', say: 'Casi: en el exponente va el cociente $y/x = k$, no $y_0 = kx_0$.' }
        ] }),

    N('ho-n-anular-termino-no-hom', 'homogeneas', 2, { a: [2, 4, 1], c: [5, 11, 2], m: [2, 5, 1] },
      function (v) { return '¿Para qué valor de la constante $k$ la ecuación $y\' = \\dfrac{x^2 + ' + v.m + 'xy + (' + v.a + 'k - ' + v.c + ')x}{y^2}$ se convierte en homogénea?'; },
      function (v) { return v.c / v.a; },
      'El término $(ak - c)x$ es de grado $1$ frente al grado $2$ de los demás; se anula cuando $ak - c = 0 \\Rightarrow k = c/a$.',
      { mistakes: { noDivA: function (v) { return v.c; }, negVal: function (v) { return -v.c / v.a; } },
        feedback: [
          { when: 'noDivA', say: 'Casi: de $ak - c = 0$ falta dividir entre el coeficiente $a$.' },
          { when: 'negVal', say: 'Casi: al despejar $k$ de $ak - c = 0$ el resultado es positivo.' }
        ] }),

    N('ho-n-escalamiento-razon', 'homogeneas', 2, { a: [2, 5, 1], b: [2, 4, 1], m: [2, 4, 1], t: [3, 6, 1] },
      function (v) { return 'Si evalúas el lado derecho de $y\' = \\dfrac{' + v.a + 'x^2 + ' + v.b + 'y^2}{xy}$ en $(1, ' + v.m + ')$ y en el punto escalado $(' + v.t + ', ' + (v.m * v.t) + ')$, ambos dan el mismo valor por homogeneidad. ¿Cuál es ese valor común?'; },
      function (v) { return (v.a + v.b * v.m * v.m) / v.m; },
      'El factor de escala $t$ se cancela y en ambos puntos la pendiente vale $(a + bm^2)/m$.',
      { mistakes: { multByT: function (v) { return v.t * (v.a + v.b * v.m * v.m) / v.m; }, divByT: function (v) { return (v.a + v.b * v.m * v.m) / (v.m * v.t); } },
        feedback: [
          { when: 'multByT', say: 'Casi: en una homogénea $f(tx, ty) = f(x, y)$; el factor $t$ se cancela.' },
          { when: 'divByT', say: 'Casi: tanto numerador como denominador tienen factor $t^2$, que se simplifica.' }
        ] }),

    C('ho-raiz-signo-x-negativo', 'homogeneas', 3,
      'Al reescribir $y\' = \\dfrac{\\sqrt{x^2 + y^2}}{x}$ en términos de $u = y/x$, sacas $x^2$ de la raíz. ¿Qué detalle algebraico ocurre en el semiplano $x < 0$?',
      'Como $\\sqrt{x^2} = |x| = -x$ para $x < 0$, al dividir entre $x$ sale un signo menos: $y\' = -\\sqrt{1 + u^2}$', [
        ['Queda $y\' = +\\sqrt{1 + u^2}$ igual que para $x > 0$, porque $x^2 > 0$', 'Casi: $\\sqrt{x^2} = |x|$ es positivo, y al dividirlo entre $x < 0$ el cociente $|x|/x$ vale $-1$.'],
        ['Dentro de la raíz queda $\\sqrt{1 - u^2}$ por el signo de $x$', 'Casi: dentro de la raíz divides entre $x^2 > 0$; el signo menos sale fuera del radical.'],
        ['La ecuación deja de depender de $y/x$ cuando $x < 0$', 'Casi: en el semiplano $x < 0$ sigue siendo función de $u = y/x$, dada por $-\\sqrt{1 + u^2}$.']],
      'Para $x < 0$, $\\sqrt{x^2 + y^2} = |x|\\sqrt{1 + u^2} = -x\\sqrt{1 + u^2}$, que dividida entre $x$ da $-\\sqrt{1 + u^2}$.'),

    N('ho-n-evaluar-semiplano-neg', 'homogeneas', 3, { a: [3, 6, 1], u0: [2, 4, 1] },
      function (v) { return 'Considera $y\' = \\dfrac{' + v.a + 'y + \\sqrt{x^2 + y^2}}{x}$ en la región $x < 0$. Si escribes el lado derecho como $F(u)$ con $u = y/x$, ¿cuánto vale $F(' + v.u0 + ')$?'; },
      function (v) { return v.a * v.u0 - Math.sqrt(1 + v.u0 * v.u0); },
      'Para $x < 0$, $\\sqrt{x^2 + y^2}/x = -\\sqrt{1 + u^2}$, por lo que $F(u) = au - \\sqrt{1 + u^2}$.',
      { mistakes: { plusRoot: function (v) { return v.a * v.u0 + Math.sqrt(1 + v.u0 * v.u0); }, noRoot: function (v) { return v.a * v.u0 - (1 + v.u0); } },
        feedback: [
          { when: 'plusRoot', say: 'Casi: como $x < 0$, se cumple $\\sqrt{x^2}/x = -1$, por lo que la raíz se resta.' },
          { when: 'noRoot', say: 'Casi: $\\sqrt{1 + u^2}$ no es igual a $1 + u$.' }
        ] }),

    N('ho-n-sistema-exponentes-hom', 'homogeneas', 3, { k: [3, 6, 1], r: [1, 3, 1] },
      function (v) { return 'La ecuación $(x^{' + (2 * v.k) + '} + x^p y^{' + v.r + '})\\,dx + x^q y^{' + (2 * v.k - 1) + '}\\,dy = 0$ es homogénea porque todos sus términos tienen grado $' + (2 * v.k) + '$. Calcula $p + q$.'; },
      function (v) { return 2 * v.k - v.r + 1; },
      'De $p + r = 2k$ sale $p = 2k - r$, y de $q + 2k - 1 = 2k$ sale $q = 1$, así que $p + q = 2k - r + 1$.',
      { mistakes: { forgotQ: function (v) { return 2 * v.k - v.r; }, addedR: function (v) { return 2 * v.k + v.r + 1; } },
        feedback: [
          { when: 'forgotQ', say: 'Casi: ese es solo $p$; falta sumar $q = 1$.' },
          { when: 'addedR', say: 'Casi: de $p + r = 2k$ se despeja $p = 2k - r$ restando $r$.' }
        ] }),

    /* ======================= 2. Sustitución y = ux y reducción a separable (17) ======================= */
    C('ux-regla-producto', 'cambio-ux', 1,
      'Al aplicar el cambio de variable $y = u\\,x$ (con $u$ función de $x$) en una EDO homogénea, ¿cómo se transforma la derivada $y\'$?',
      '$y\' = u + x\\,u\'$ por la regla del producto', [
        ['$y\' = u\'$, porque la derivada de $x$ es $1$', 'Casi: como $u(x)$ y $x$ dependen de $x$, debes usar la regla del producto $(ux)\' = u\'x + u\\cdot 1$.'],
        ['$y\' = x\\,u\'$, tratando a $x$ como factor constante', 'Casi: derivas respecto a $x$, así que falta el término $u\\cdot(x)\' = u$.'],
        ['$y\' = u - x\\,u\'$, con signo menos', 'Casi: la regla del producto suma ambos términos: $u + x\\,u\'$.']],
      'Como $y = u(x)\\cdot x$ es un producto de funciones de $x$, su derivada es $y\' = u + x\\,u\'$.'),

    C('ux-forma-separada-general', 'cambio-ux', 1,
      'Si sustituyes $y = ux$ y $y\' = u + x\\,u\'$ en la ecuación homogénea $y\' = F(y/x)$, ¿qué ecuación separable se obtiene?',
      '$\\dfrac{du}{F(u) - u} = \\dfrac{dx}{x}$', [
        ['$\\dfrac{du}{F(u)} = \\dfrac{dx}{x}$', 'Casi: olvidaste pasar restando la $u$ que sale de $y\' = u + x\\,u\'$.'],
        ['$\\dfrac{du}{F(u) + u} = \\dfrac{dx}{x}$', 'Casi: al despejar $x\\,u\'$ de $u + x\\,u\' = F(u)$, el término $u$ pasa restando.'],
        ['$\\dfrac{du}{F(u) - u} = x\\,dx$', 'Casi: como $x$ multiplica a $du/dx$, pasa al lado derecho dividiendo como $dx/x$.']],
      'De $u + x\\,u\' = F(u)$ se despeja $x\\,\\frac{du}{dx} = F(u) - u$, que se separa como $\\frac{du}{F(u) - u} = \\frac{dx}{x}$.'),

    C('ux-cancelacion-termino-u', 'cambio-ux', 1,
      function (v) { return 'En la ecuación $y\' = \\dfrac{y}{x} + \\dfrac{' + v.k + 'x}{y}$, ¿qué ocurre inmediatamente al sustituir $y = ux$ y $y\' = u + x\\,u\'$?'; },
      function (v) { return 'El término $u$ se cancela en ambos lados y queda directamente $x\\,u\' = \\dfrac{' + v.k + '}{u}$'; }, [
        [function (v) { return 'Se suman las dos $u$ y queda $x\\,u\' = 2u + \\dfrac{' + v.k + '}{u}$'; }, 'Casi: al pasar la $u$ de la izquierda al lado derecho se resta ($u - u = 0$).'],
        ['Se cancela $x/y$ y queda $x\\,u\' = u$', 'Casi: lo que vale $u$ es $y/x$, que se cancela con la $u$ de $y\' = u + x\\,u\'$.'],
        [function (v) { return 'Queda $u\' = \\dfrac{' + v.k + '}{u}$ sin el factor $x$'; }, 'Casi: en $y\' = u + x\\,u\'$, la derivada $u\'$ sigue multiplicada por $x$.']],
      'Como $y\' = u + x\\,u\'$ y el lado derecho es $u + k/u$, se cancela $u$ y resulta $x\\,u\' = k/u$.',
      { vars: { k: [2, 6, 1] } }),

    N('ux-n-evaluar-xu-prima', 'cambio-ux', 1, { a: [2, 6, 1], u0: [2, 4, 1] },
      function (v) { return 'Al sustituir $y = ux$ en la ecuación homogénea $y\' = ' + v.a + '\\left(\\dfrac{y}{x}\\right)^2 + \\dfrac{y}{x}$, obtienes $x\\,u\' = g(u)$. ¿Cuánto vale $g(' + v.u0 + ')$?'; },
      function (v) { return v.a * v.u0 * v.u0; },
      'Como $F(u) = au^2 + u$, al restar $u$ queda $g(u) = F(u) - u = au^2$.',
      { mistakes: { keptU: function (v) { return v.a * v.u0 * v.u0 + v.u0; }, subTwoU: function (v) { return v.a * v.u0 * v.u0 - v.u0; } },
        feedback: [
          { when: 'keptU', say: 'Casi: olvidaste restar $u$ al pasar de $u + x\\,u\' = au^2 + u$ a $x\\,u\' = au^2$.' },
          { when: 'subTwoU', say: 'Casi: el $+u$ del lado derecho se cancela con el $+u$ de $u + x\\,u\'$.' }
        ] }),

    N('ux-n-valor-u-inicial', 'cambio-ux', 1, { x0: [2, 5, 1], k: [2, 6, 1] },
      function (v) { return 'Si resuelves una EDO homogénea mediante $y = ux$ y la condición inicial es $y(' + v.x0 + ') = ' + (v.x0 * v.k + 1) + '$, ¿cuánto vale $u(' + v.x0 + ')$?'; },
      function (v) { return (v.x0 * v.k + 1) / v.x0; },
      'Como $u = y/x$, en $x = x_0$ se tiene $u(x_0) = y(x_0)/x_0$.',
      { mistakes: { justY0: function (v) { return v.x0 * v.k + 1; }, multX0: function (v) { return (v.x0 * v.k + 1) * v.x0; } },
        feedback: [
          { when: 'justY0', say: 'Casi: ese es $y(x_0)$; debes dividirlo entre $x_0$ para obtener $u(x_0)$.' },
          { when: 'multX0', say: 'Casi: de $y = ux$ se despeja $u = y/x$ dividiendo entre $x_0$.' }
        ] }),

    C('ux-reduccion-fraccion-cuad', 'cambio-ux', 2,
      function (v) { return 'Al aplicar $y = ux$ a $y\' = \\dfrac{x^2 + ' + v.a + 'y^2}{2xy}$, ¿qué expresión queda para $x\\,u\'$ tras restar $u$ y poner denominador común?'; },
      function (v) { return '$x\\,u\' = \\dfrac{1 + (' + v.a + ' - 2)u^2}{2u}$'; }, [
        [function (v) { return '$x\\,u\' = \\dfrac{1 + ' + v.a + 'u^2}{2u}$'; }, 'Casi: esa es $F(u)$; falta restar $u = 2u^2/(2u)$ porque $y\' = u + x\\,u\'$.'],
        [function (v) { return '$x\\,u\' = \\dfrac{1 + (' + v.a + ' - 1)u^2}{2u}$'; }, 'Casi: con denominador común $2u$, el término $-u$ es $-2u^2/(2u)$, restando $2$ al coeficiente de $u^2$.'],
        [function (v) { return '$x\\,u\' = \\dfrac{1 + (' + v.a + ' + 2)u^2}{2u}$'; }, 'Casi: al despejar $x\\,u\' = F(u) - u$, el término $u$ se resta, no se suma.']],
      'De $F(u) - u = \\frac{1 + au^2}{2u} - \\frac{2u^2}{2u}$ resulta $\\frac{1 + (a - 2)u^2}{2u}$.',
      { vars: { a: [3, 6, 1] } }),

    C('ux-solucion-recta-invariante', 'cambio-ux', 2,
      'Al separar $\\dfrac{du}{F(u) - u} = \\dfrac{dx}{x}$ se divide entre $F(u) - u$. Si existe $m$ tal que $F(m) = m$, ¿qué representa $u = m$ en la EDO original?',
      'Una solución particular que es la recta $y = mx$ pasando por el origen', [
        ['Una recta donde las soluciones tienen tangente vertical', 'Casi: cuando $F(m) = m$, la pendiente del campo coincide con la del rayo $y = mx$, dando una solución recta.'],
        ['Una solución constante horizontal $y(x) = m$', 'Casi: $u = m$ es constante, pero como $u = y/x$, equivale a la recta inclinada $y = mx$.'],
        ['Un valor prohibido que nunca puede ser solución', 'Casi: antes de dividir, $u(x) = m$ cumple $x\\,u\' = 0 = F(m) - m$.']],
      'Si $F(m) = m$, entonces $u(x) = m$ resuelve $x\\,u\' = F(u) - u$, lo que da la recta solución $y = mx$.'),

    C('ux-integral-u-sobre-1-menos-u2', 'cambio-ux', 2,
      'Tras sustituir $y = ux$ en $y\' = \\dfrac{x^2 + y^2}{2xy}$ llegas a $\\dfrac{2u\\,du}{1 - u^2} = \\dfrac{dx}{x}$. ¿Cuál es la antiderivada del lado izquierdo?',
      '$-\\ln|1 - u^2|$', [
        ['$+\\ln|1 - u^2|$', 'Casi: la derivada de $1 - u^2$ es $-2u$, por lo que lleva signo menos delante del logaritmo.'],
        ['$2\\arctan u$', 'Casi: $\\arctan u$ integra a $1/(1 + u^2)$; con $2u$ arriba se usa el cambio $w = 1 - u^2$.'],
        ['$-\\dfrac{1}{(1 - u^2)^2}$', 'Casi: el denominador tiene potencia $1$, así que su integral con $dw = -2u\\,du$ es un logaritmo.']],
      'Con $w = 1 - u^2$ se tiene $dw = -2u\\,du$, por lo que $\\int \\frac{2u\\,du}{1 - u^2} = -\\ln|1 - u^2|$.'),

    N('ux-n-evaluar-Fu-menos-u', 'cambio-ux', 2, { a: [3, 7, 1], b: [2, 5, 1], u0: [2, 4, 1] },
      function (v) { return 'Para la ecuación homogénea $y\' = \\dfrac{' + v.a + 'x + ' + v.b + 'y}{x}$, al sustituir $y = ux$ queda $x\\,u\' = F(u) - u$. Evalúa $F(' + v.u0 + ') - ' + v.u0 + '$.'; },
      function (v) { return v.a + (v.b - 1) * v.u0; },
      'Como $F(u) = a + bu$, al restar $u$ queda $F(u) - u = a + (b - 1)u$.',
      { mistakes: { forgotMinusU: function (v) { return v.a + v.b * v.u0; }, plusU: function (v) { return v.a + (v.b + 1) * v.u0; } },
        feedback: [
          { when: 'forgotMinusU', say: 'Casi: ese es $F(u_0)$; falta restar $u_0$ porque $y\' = u + x\\,u\'$.' },
          { when: 'plusU', say: 'Casi: al despejar $x\\,u\'$, el término $u$ pasa restando.' }
        ] }),

    N('ux-n-factor-integrando-u', 'cambio-ux', 2, { a: [2, 5, 1], u0: [2, 3, 1] },
      function (v) { return 'Al separar la ecuación homogénea $y\' = \\dfrac{y^2 + ' + v.a + 'xy}{x^2}$ con $y = ux$ en la forma $h(u)\\,du = \\dfrac{dx}{x}$, ¿cuánto vale $h(' + v.u0 + ')$?'; },
      function (v) { return 1 / (v.u0 * v.u0 + (v.a - 1) * v.u0); },
      'De $x\\,u\' = u^2 + (a - 1)u$ resulta $h(u) = \\frac{1}{u^2 + (a - 1)u}$.',
      { mistakes: { forgotSubU: function (v) { return 1 / (v.u0 * v.u0 + v.a * v.u0); }, notInverted: function (v) { return v.u0 * v.u0 + (v.a - 1) * v.u0; } },
        feedback: [
          { when: 'forgotSubU', say: 'Casi: olvidaste restar $u$ a $F(u) = u^2 + au$ antes de dividir.' },
          { when: 'notInverted', say: 'Casi: ese es $F(u_0) - u_0$, que al pasar con $du$ va en el denominador.' }
        ] }),

    N('ux-n-pendiente-recta-solucion', 'cambio-ux', 2, { a: [2, 5, 1], b: [6, 12, 2] },
      function (v) { return 'La ecuación homogénea $y\' = \\dfrac{' + (v.a + 1) + 'y - ' + v.b + 'x}{x}$ admite una solución particular que es una recta $y = mx$. ¿Cuánto vale la pendiente $m$?'; },
      function (v) { return v.b / v.a; },
      'Igualando $F(m) - m = (a + 1)m - b - m = am - b = 0$ se obtiene $m = b/a$.',
      { mistakes: { usedAplus1: function (v) { return v.b / (v.a + 1); }, negSlope: function (v) { return -v.b / v.a; } },
        feedback: [
          { when: 'usedAplus1', say: 'Casi: resolviste $F(m) = 0$ en vez de $F(m) = m$.' },
          { when: 'negSlope', say: 'Casi: de $am - b = 0$ la pendiente $m = b/a$ es positiva.' }
        ] }),

    N('ux-n-integral-lado-u-cubo', 'cambio-ux', 2, { k: [2, 5, 1], u1: [2, 3, 1] },
      function (v) { return 'En $x\\,y\' = y + \\dfrac{x^3}{' + v.k + 'y^2}$, al sustituir $y = ux$ y separar queda $M(u)\\,du = \\dfrac{dx}{x}$. Si $H(u) = \\displaystyle\\int M(u)\\,du$ con $H(0) = 0$, calcula $H(' + v.u1 + ')$.'; },
      function (v) { return (v.k / 3) * Math.pow(v.u1, 3); },
      'De $x\\,u\' = \\frac{1}{ku^2}$ sale $ku^2\\,du = \\frac{dx}{x}$, cuya antiderivada es $H(u) = \\frac{k}{3}u^3$.',
      { mistakes: { noDiv3: function (v) { return v.k * Math.pow(v.u1, 3); }, divByK: function (v) { return Math.pow(v.u1, 3) / (3 * v.k); } },
        feedback: [
          { when: 'noDiv3', say: 'Casi: al integrar $u^2\\,du$ debes dividir entre $3$.' },
          { when: 'divByK', say: 'Casi: como $ku^2$ está dividiendo a la derecha, pasa multiplicando a $du$.' }
        ] }),

    N('ux-n-integral-lado-u-exp', 'cambio-ux', 2, { a: [2, 4, 1], u1: [1, 2, 1] },
      function (v) { return 'Al aplicar $y = ux$ a $x\\,y\' = y + x\\,e^{-' + v.a + 'y/x}$ y separar como $M(u)\\,du = \\dfrac{dx}{x}$, se integra $H(u) = \\displaystyle\\int M(u)\\,du$ (sin constante). ¿Cuánto vale $H(' + v.u1 + ')$?'; },
      function (v) { return Math.exp(v.a * v.u1) / v.a; },
      'Como $x\\,u\' = e^{-au}$, al separar queda $e^{au}\\,du = \\frac{dx}{x}$, cuya integral es $H(u) = \\frac{1}{a}e^{au}$.',
      { mistakes: { noDivA: function (v) { return Math.exp(v.a * v.u1); }, negExp: function (v) { return Math.exp(-v.a * v.u1) / v.a; } },
        feedback: [
          { when: 'noDivA', say: 'Casi: al integrar $e^{au}\\,du$ falta dividir entre $a$.' },
          { when: 'negExp', say: 'Casi: al pasar $e^{-au}$ dividiendo al lado izquierdo se vuelve $e^{+au}$.' }
        ] }),

    N('ux-n-constante-en-u', 'cambio-ux', 2, { x0: [2, 3, 1], y0: [6, 12, 2] },
      function (v) { return 'Tras sustituir $y = ux$ e integrar una EDO homogénea llegas a $\\dfrac{1}{2}u^2 = \\ln x + C$. Si $y(' + v.x0 + ') = ' + v.y0 + '$, ¿cuánto vale la constante $C$?'; },
      function (v) { return 0.5 * Math.pow(v.y0 / v.x0, 2) - Math.log(v.x0); },
      'En $x = x_0$ se tiene $u(x_0) = y_0/x_0$, por lo que $C = \\frac{1}{2}(y_0/x_0)^2 - \\ln x_0$.',
      { mistakes: { usedY0: function (v) { return 0.5 * v.y0 * v.y0 - Math.log(v.x0); }, noHalf: function (v) { return Math.pow(v.y0 / v.x0, 2) - Math.log(v.x0); } },
        feedback: [
          { when: 'usedY0', say: 'Casi: sustituiste $y_0$ en lugar de $u_0 = y_0/x_0$.' },
          { when: 'noHalf', say: 'Casi: olvidaste multiplicar $u_0^2$ por $1/2$ al despejar $C$.' }
        ] }),

    C('ux-cambio-inverso-x-vy', 'cambio-ux', 3,
      'Algunas ecuaciones escritas como $\\dfrac{dx}{dy} = \\widetilde{F}(x/y)$ se integran más fácil con el cambio simétrico $x = v(y)\\,y$. ¿Cómo se transforma $\\dfrac{dx}{dy}$ con esa sustitución?',
      '$\\dfrac{dx}{dy} = v + y\\,\\dfrac{dv}{dy}$, de modo que $y\\,\\dfrac{dv}{dy} = \\widetilde{F}(v) - v$', [
        ['$\\dfrac{dx}{dy} = v + x\\,\\dfrac{dv}{dy}$, multiplicando por $x$', 'Casi: al derivar $x = v(y)\\,y$ respecto a $y$, la regla del producto multiplica $dv/dy$ por $y$.'],
        ['$\\dfrac{dx}{dy} = \\dfrac{1}{v + y\\,dv/dy}$', 'Casi: derivas $x = vy$ directamente respecto a $y$, sin invertir.'],
        ['$\\dfrac{dx}{dy} = y\\,\\dfrac{dv}{dy}$', 'Casi: por la regla del producto falta sumar el término $v\\cdot(dy/dy) = v$.']],
      'Intercambiando los papeles de $x$ y $y$: si $x = v(y)\\,y$, la regla del producto respecto a $y$ da $\\frac{dx}{dy} = v + y\\,\\frac{dv}{dy}$.'),

    N('ux-n-recta-invariante-mayor', 'cambio-ux', 3, { r1: [1, 3, 1], r2: [4, 7, 1] },
      function (v) {
        var s = v.r1 + v.r2 - 1, p = v.r1 * v.r2;
        return 'La ecuación homogénea $y\' = \\dfrac{y^2 - ' + s + 'xy + ' + p + 'x^2}{x^2}$ tiene dos soluciones particulares de la forma $y = mx$. ¿Cuál es el <strong>mayor</strong> valor de $m$?';
      },
      function (v) { return v.r2; },
      'Igualando $F(m) - m = m^2 - (r_1 + r_2)m + r_1 r_2 = (m - r_1)(m - r_2) = 0$, la raíz mayor es $r_2$.',
      { mistakes: { smallerRoot: function (v) { return v.r1; }, sumRoots: function (v) { return v.r1 + v.r2 - 1; } },
        feedback: [
          { when: 'smallerRoot', say: 'Casi: esa es la raíz menor; se pide el mayor valor de $m$.' },
          { when: 'sumRoots', say: 'Casi: debes resolver la cuadrática $F(m) - m = 0$.' }
        ] }),

    N('ux-n-fracciones-parciales-u', 'cambio-ux', 3, { a: [2, 5, 1] },
      function (v) { return 'En $y\' = \\dfrac{y^2 + ' + (v.a + 1) + 'xy}{x^2}$, al separar con $y = ux$ queda $\\dfrac{du}{u(u + ' + v.a + ')} = \\dfrac{dx}{x}$. Si descompones $\\dfrac{1}{u(u + ' + v.a + ')} = A\\left(\\dfrac{1}{u} - \\dfrac{1}{u + ' + v.a + '}\\right)$, ¿cuánto vale $A$?'; },
      function (v) { return 1 / v.a; },
      'Como $\\frac{1}{u} - \\frac{1}{u + a} = \\frac{a}{u(u + a)}$, hace falta multiplicar por $A = 1/a$.',
      { mistakes: { justA: function (v) { return v.a; }, usedAplus1: function (v) { return 1 / (v.a + 1); } },
        feedback: [
          { when: 'justA', say: 'Casi: al restar las fracciones queda $a$ en el numerador, así que debes dividir entre $a$.' },
          { when: 'usedAplus1', say: 'Casi: tras restar $u$ de $(a + 1)u$ queda $u + a$, por lo que $A = 1/a$.' }
        ] }),

    /* ======================= 3. PVI en ecuaciones homogéneas (17) ======================= */
    C('ph-pasos-orden-correcto', 'pvi-homogeneo', 1,
      '¿Cuál es la secuencia completa para resolver un PVI homogéneo $y\' = F(y/x)$ con $y(x_0) = y_0$?',
      'Sustituir $y = ux$ y $y\' = u + xu\'$, separar e integrar en $u$ y $x$, regresar a $y = ux$ y hallar la constante con $y(x_0) = y_0$', [
        ['Separar directamente $x$ y $y$ sin cambio de variable e integrar', 'Casi: una homogénea como $(x^2 + y^2)/(2xy)$ no es separable en $(x, y)$ hasta usar $y = ux$.'],
        ['Sustituir $y = ux$ con $y\' = u\'$, integrar y dejar la respuesta en términos de $u$', 'Casi: $y\'$ es $u + xu\'$ y siempre debes regresar a la variable original $y$.'],
        ['Integrar $F(y/x)$ respecto a $x$ tratando a $y$ como constante', 'Casi: $y$ es función de $x$, así que no puede integrarse como constante.']],
      'El cambio $y = ux$ vuelve separable la EDO; tras integrar se regresa a $y = ux$ y se evalúa la condición inicial.'),

    C('ph-eleccion-signo-raiz', 'pvi-homogeneo', 1,
      'Al resolver $y\' = \\dfrac{x^2 + y^2}{2xy}$ llegas a $y^2 = x^2 + Cx$. Si la condición inicial es $y(1) = -2$, ¿qué rama explícita debes elegir?',
      'La raíz negativa $y(x) = -\\sqrt{x^2 + 3x}$, porque en $x = 1$ el valor inicial de $y$ es negativo', [
        ['La raíz positiva $y(x) = \\sqrt{x^2 + 3x}$', 'Casi: con la raíz positiva tendrías $y(1) = +2$, contradiciendo $y(1) = -2$.'],
        ['$y(x) = \\sqrt{x^2 - 5x}$, cambiando el signo de $C$', 'Casi: en $x = 1$, $(-2)^2 = 1 + C \\Rightarrow C = 3$; el signo menos va delante de la raíz.'],
        ['Ambas ramas $\\pm\\sqrt{x^2 + 3x}$ simultáneamente', 'Casi: la solución de un PVI es una sola función que pasa por $(1, -2)$.']],
      'Con $y(1) = -2$ sale $(-2)^2 = 1 + C \\Rightarrow C = 3$, y el signo $y(1) < 0$ fija la rama negativa.'),

    E('ph-e-log-raiz', 'pvi-homogeneo', 1, { c: [2, 5, 1] },
      function (v) { return 'Resuelve el PVI homogéneo $y\' = \\dfrac{y}{x} + \\dfrac{x}{y}$ (para $x > 0$) con condición inicial $y(1) = ' + v.c + '$. Escribe la solución explícita $y(x)$.'; },
      function (v) { return 'x*sqrt(2*log(x) + ' + (v.c * v.c) + ')'; },
      'Con $y = ux$ queda $x\\,u\' = 1/u \\Rightarrow u^2 = 2\\ln x + c^2$, de donde $y = x\\sqrt{2\\ln x + c^2}$.',
      { domain: [1, 3],
        mistakes: { noX: function (v) { return 'sqrt(2*log(x) + ' + (v.c * v.c) + ')'; }, noSq: function (v) { return 'x*sqrt(2*log(x) + ' + v.c + ')'; } },
        feedback: [
          { when: 'noX', say: 'Casi: esa expresión es $u(x) = y/x$; falta multiplicar por $x$.' },
          { when: 'noSq', say: 'Casi: en $x = 1$ la constante vale $u(1)^2 = c^2$, no $c$.' }
        ] }),

    N('ph-n-lineal-homogenea-eval', 'pvi-homogeneo', 1, { k: [2, 5, 1], y1: [2, 4, 1], x1: [2, 3, 1] },
      function (v) { return 'Resuelve la ecuación homogénea $y\' = \\dfrac{y}{x} + ' + v.k + '$ con condición inicial $y(1) = ' + v.y1 + '$ y calcula el valor de $y(' + v.x1 + ')$.'; },
      function (v) { return v.x1 * (v.k * Math.log(v.x1) + v.y1); },
      'Con $y = ux$ queda $x\\,u\' = k \\Rightarrow u = k\\ln x + y_1$, por lo que $y(x) = x(k\\ln x + y_1)$.',
      { mistakes: { noMultX: function (v) { return v.k * Math.log(v.x1) + v.y1; }, addedY1Outside: function (v) { return v.x1 * v.k * Math.log(v.x1) + v.y1; } },
        feedback: [
          { when: 'noMultX', say: 'Casi: ese es $u(x_1)$; falta multiplicarlo por $x_1$.' },
          { when: 'addedY1Outside', say: 'Casi: al regresar con $y = ux$, el factor $x$ multiplica a todo $(k\\ln x + y_1)$.' }
        ] }),

    C('ph-dominio-validez-log', 'pvi-homogeneo', 2,
      'La solución de $y\' = \\dfrac{y^2 + xy}{x^2}$ con $y(1) = 1$ es $y(x) = \\dfrac{x}{1 - \\ln x}$. ¿Cuál es el intervalo máximo de validez que contiene a $x_0 = 1$?',
      '$(0, e)$, porque $\\ln x$ exige $x > 0$ y el denominador se anula en $x = e$', [
        ['$(0, \\infty)$, porque $\\ln x$ está definido para todo $x > 0$', 'Casi: en $x = e$ se tiene $\\ln e = 1$ y el denominador $1 - \\ln x$ se anula.'],
        ['$(-\\infty, e)$, quitando solo la asíntota en $x = e$', 'Casi: el logaritmo natural exige $x > 0$.'],
        ['$(1, e)$, empezando en el punto inicial $x_0 = 1$', 'Casi: la solución también es válida a la izquierda de $1$, en todo $(0, 1]$.']],
      'El dominio exige $x > 0$ y $1 - \\ln x \\neq 0 \\Rightarrow x \\neq e$; el intervalo que contiene a $1$ es $(0, e)$.'),

    C('ph-dominio-validez-raiz-log', 'pvi-homogeneo', 2,
      'Para el PVI $y\' = \\dfrac{y}{x} + \\dfrac{x}{y}$ con $y(1) = 1$, la solución es $y(x) = x\\sqrt{2\\ln x + 1}$. ¿Por qué deja de ser válida como solución al llegar a $x = e^{-1/2}$?',
      'Porque en $x = e^{-1/2}$ se anula la raíz ($y = 0$) y el término $x/y$ de la EDO divide entre cero', [
        ['Porque en $x = e^{-1/2}$ la coordenada $x$ vale cero', 'Casi: $e^{-1/2} > 0$; lo que se hace cero ahí es $y$.'],
        ['Porque $y(x)$ tiende a infinito en $x = e^{-1/2}$', 'Casi: $y$ tiende a $0$, pero su pendiente $y\'$ se vuelve vertical por el término $x/y$.'],
        ['Porque $\\ln x$ no existe en $x = e^{-1/2}$', 'Casi: $\\ln(e^{-1/2}) = -1/2$ sí existe; lo que se anula es el radicando $2\\ln x + 1$.']],
      'En $x = e^{-1/2}$ se tiene $y = 0$, anulando el denominador de $x/y$ en la ecuación diferencial.'),

    E('ph-e-riccati-hom', 'pvi-homogeneo', 2, { b: [2, 5, 1] },
      function (v) { return 'Resuelve la ecuación homogénea $y\' = \\dfrac{y^2 + xy}{x^2}$ (para $x > 0$) con condición inicial $y(1) = \\dfrac{1}{' + v.b + '}$. Escribe la función explícita $y(x)$.'; },
      function (v) { return 'x / (' + v.b + ' - log(x))'; },
      'Con $y = ux$ queda $x\\,u\' = u^2 \\Rightarrow -1/u = \\ln x - b$, de donde $y = x/(b - \\ln x)$.',
      { domain: [0.5, 2],
        mistakes: { noX: function (v) { return '1 / (' + v.b + ' - log(x))'; }, plusLog: function (v) { return 'x / (' + v.b + ' + log(x))'; } },
        feedback: [
          { when: 'noX', say: 'Casi: esa es $u(x)$; recuerda regresar a $y = x\\,u(x)$.' },
          { when: 'plusLog', say: 'Casi: $\\int du/u^2 = -1/u$ lleva signo menos, dejando $b - \\ln x$ abajo.' }
        ] }),

    E('ph-e-clasica-raiz', 'pvi-homogeneo', 2, { y1: [2, 5, 1] },
      function (v) { return 'Resuelve el PVI homogéneo $y\' = \\dfrac{x^2 + y^2}{2xy}$ con condición inicial $y(1) = ' + v.y1 + '$. Escribe la solución explícita $y(x)$.'; },
      function (v) { return 'sqrt(x^2 + ' + (v.y1 * v.y1 - 1) + '*x)'; },
      'De $y^2 = x^2 + Cx$ con $y(1) = y_1 > 0$ sale $C = y_1^2 - 1$ y $y = \\sqrt{x^2 + (y_1^2 - 1)x}$.',
      { domain: [0.5, 3],
        mistakes: { noMultX: function (v) { return 'sqrt(x^2 + ' + (v.y1 * v.y1 - 1) + ')'; }, usedY1NotSq: function (v) { return 'sqrt(x^2 + ' + (v.y1 - 1) + '*x)'; } },
        feedback: [
          { when: 'noMultX', say: 'Casi: al multiplicar $u^2 = 1 + C/x$ por $x^2$, la constante $C$ queda multiplicada por $x$.' },
          { when: 'usedY1NotSq', say: 'Casi: en $y^2 = x^2 + Cx$, al evaluar en $x = 1$ entra $y_1^2$, no $y_1$.' }
        ] }),

    E('ph-e-exp-cociente', 'pvi-homogeneo', 2, { k: [2, 5, 1] },
      function (v) { return 'Resuelve la ecuación homogénea $x\\,y\' = y + ' + v.k + 'x\\,e^{-y/x}$ (para $x > 0$) con condición inicial $y(1) = 0$. Escribe la solución explícita $y(x)$ (usa <code>ln(...)</code>).'; },
      function (v) { return 'x * log(1 + ' + v.k + '*log(x))'; },
      'Con $y = ux$ queda $e^u = k\\ln x + C$. En $x = 1$, $u(1) = 0 \\Rightarrow C = e^0 = 1$ y $y = x\\ln(1 + k\\ln x)$.',
      { domain: [1, 2.5],
        mistakes: { noX: function (v) { return 'log(1 + ' + v.k + '*log(x))'; }, forgotOne: function (v) { return 'x * log(' + v.k + '*log(x))'; } },
        feedback: [
          { when: 'noX', say: 'Casi: esa es $u(x)$; debes multiplicarla por $x$ para obtener $y(x)$.' },
          { when: 'forgotOne', say: 'Casi: en $x = 1$ se tiene $e^{u(1)} = e^0 = 1$, así que la constante vale $1$.' }
        ] }),

    N('ph-n-clasica-raiz-eval', 'pvi-homogeneo', 2, { y1: [2, 5, 1], x1: [2, 4, 1] },
      function (v) { return 'Encuentra la solución del PVI homogéneo $y\' = \\dfrac{x^2 + y^2}{2xy}$ con $y(1) = ' + v.y1 + '$ y evalúala en $x = ' + v.x1 + '$.'; },
      function (v) { return Math.sqrt(v.x1 * v.x1 + (v.y1 * v.y1 - 1) * v.x1); },
      'La familia es $y^2 = x^2 + (y_1^2 - 1)x$, por lo que $y(x_1) = \\sqrt{x_1^2 + (y_1^2 - 1)x_1}$.',
      { mistakes: { noXonC: function (v) { return Math.sqrt(v.x1 * v.x1 + (v.y1 * v.y1 - 1)); }, justU: function (v) { return Math.sqrt(1 + (v.y1 * v.y1 - 1) / v.x1); } },
        feedback: [
          { when: 'noXonC', say: 'Casi: en $y^2 = x^2 + Cx$ la constante $C$ va multiplicada por $x_1$.' },
          { when: 'justU', say: 'Casi: calculaste $u(x_1)$; falta multiplicar por $x_1$.' }
        ] }),

    N('ph-n-cubica-hom-eval', 'pvi-homogeneo', 2, { k: [3, 9, 3], c: [1, 3, 1], x1: [2, 4, 1] },
      function (v) { return 'Resuelve la ecuación homogénea $x\\,y\' = y + ' + v.k + '\\,\\dfrac{x^3}{y^2}$ con condición inicial $y(1) = ' + v.c + '$ y calcula $y(' + v.x1 + ')$.'; },
      function (v) { return v.x1 * Math.pow(3 * v.k * Math.log(v.x1) + Math.pow(v.c, 3), 1 / 3); },
      'Con $y = ux$ queda $u^2\\,du = (k/x)\\,dx \\Rightarrow u^3 = 3k\\ln x + c^3$ y $y = x(3k\\ln x + c^3)^{1/3}$.',
      { mistakes: { noX: function (v) { return Math.pow(3 * v.k * Math.log(v.x1) + Math.pow(v.c, 3), 1 / 3); }, noThree: function (v) { return v.x1 * Math.pow(v.k * Math.log(v.x1) + Math.pow(v.c, 3), 1 / 3); } },
        feedback: [
          { when: 'noX', say: 'Casi: ese es $u(x_1)$; falta multiplicar por $x_1$.' },
          { when: 'noThree', say: 'Casi: de $u^3/3 = k\\ln x + C$ al despejar $u^3$ sale un factor $3$ en $3k\\ln x$.' }
        ] }),

    N('ph-n-cos-cociente-eval', 'pvi-homogeneo', 2, { k: [2, 4, 1], x1: [2, 4, 1] },
      function (v) { return 'Resuelve el PVI homogéneo $x\\,y\' = y + ' + v.k + 'x\\cos^2\\!\\left(\\dfrac{y}{x}\\right)$ con condición inicial $y(1) = 0$, y calcula $y(' + v.x1 + ')$ (en radianes).'; },
      function (v) { return v.x1 * Math.atan(v.k * Math.log(v.x1)); },
      'Con $y = ux$ queda $\\sec^2 u\\,du = (k/x)\\,dx \\Rightarrow \\tan u = k\\ln x$, así que $y(x) = x\\arctan(k\\ln x)$.',
      { mistakes: { noX: function (v) { return Math.atan(v.k * Math.log(v.x1)); }, forgotAtan: function (v) { return v.x1 * v.k * Math.log(v.x1); } },
        feedback: [
          { when: 'noX', say: 'Casi: calculaste $u(x_1)$; falta multiplicar por $x_1$.' },
          { when: 'forgotAtan', say: 'Casi: $k\\ln x_1$ es $\\tan u$; falta aplicar $\\arctan$ antes de multiplicar por $x_1$.' }
        ] }),

    N('ph-n-potencia-diferencia-eval', 'pvi-homogeneo', 2, { a: [2, 4, 1], y1: [2, 5, 1], x1: [2, 3, 1] },
      function (v) { return 'Resuelve la ecuación homogénea $x\\,y\' = ' + v.a + 'y - ' + (v.a - 1) + 'x$ con condición inicial $y(1) = ' + v.y1 + '$, y evalúa $y(' + v.x1 + ')$.'; },
      function (v) { return v.x1 + (v.y1 - 1) * Math.pow(v.x1, v.a); },
      'Con $y = ux$ queda $x\\,u\' = (a - 1)(u - 1) \\Rightarrow u - 1 = (y_1 - 1)x^{a-1}$, y $y = x + (y_1 - 1)x^a$.',
      { mistakes: { noBackX: function (v) { return 1 + (v.y1 - 1) * Math.pow(v.x1, v.a - 1); }, usedY1Coef: function (v) { return v.x1 + v.y1 * Math.pow(v.x1, v.a); } },
        feedback: [
          { when: 'noBackX', say: 'Casi: ese es $u(x_1)$; falta multiplicarlo por $x_1$ para regresar a $y$.' },
          { when: 'usedY1Coef', say: 'Casi: en $x = 1$ tienes $1 + C = y_1$, así que $C = y_1 - 1$.' }
        ] }),

    E('ph-e-sin-cociente', 'pvi-homogeneo', 3, { a: [2, 5, 1] },
      function (v) { return 'Resuelve la ecuación homogénea $x\\,y\' = y + \\dfrac{' + v.a + 'x}{\\sin(y/x)}$ (para $x > 0$ y $0 < y/x < \\pi$) con condición inicial $y(1) = \\dfrac{\\pi}{2}$. Escribe $y(x)$ (usa <code>acos(...)</code> y <code>ln(...)</code>).'; },
      function (v) { return 'x * acos(-' + v.a + '*log(x))'; },
      'Con $y = ux$: $\\sin u\\,du = (a/x)\\,dx \\Rightarrow -\\cos u = a\\ln x$, de donde $y = x\\arccos(-a\\ln x)$.',
      { domain: [0.85, 0.98],
        mistakes: { posLog: function (v) { return 'x * acos(' + v.a + '*log(x))'; }, noX: function (v) { return 'acos(-' + v.a + '*log(x))'; } },
        feedback: [
          { when: 'posLog', say: 'Casi: la integral de $\\sin u\\,du$ es $-\\cos u$, con signo negativo.' },
          { when: 'noX', say: 'Casi: esa expresión es $u(x)$; falta multiplicar por $x$.' }
        ] }),

    N('ph-n-condicion-en-x0-distinto-1', 'pvi-homogeneo', 3, { x0: [2, 3, 1], u0: [2, 4, 1], k: [2, 3, 1] },
      function (v) { return 'Resuelve el PVI homogéneo $y\' = \\dfrac{y}{x} + \\dfrac{x}{y}$ con condición inicial $y(' + v.x0 + ') = ' + (v.x0 * v.u0) + '$, y calcula el valor de $y(' + (v.k * v.x0) + ')$.'; },
      function (v) { return v.k * v.x0 * Math.sqrt(2 * Math.log(v.k) + v.u0 * v.u0); },
      'De $u^2 = 2\\ln(x/x_0) + u_0^2$ con $u_0 = y_0/x_0$, en $x = kx_0$ resulta $y = kx_0\\sqrt{2\\ln k + u_0^2}$.',
      { mistakes: { usedY0InsteadOfU0: function (v) { return v.k * v.x0 * Math.sqrt(2 * Math.log(v.k) + Math.pow(v.x0 * v.u0, 2)); }, noX: function (v) { return Math.sqrt(2 * Math.log(v.k) + v.u0 * v.u0); } },
        feedback: [
          { when: 'usedY0InsteadOfU0', say: 'Casi: en $x = x_0$ debes usar $u(x_0) = y(x_0)/x_0$, no $y(x_0)$.' },
          { when: 'noX', say: 'Casi: ese es $u(kx_0)$; falta multiplicarlo por $x = kx_0$.' }
        ] }),

    N('ph-n-polo-ubicacion', 'pvi-homogeneo', 3, { x0: [2, 4, 1], b: [2, 4, 1] },
      function (v) { return 'La solución del PVI homogéneo $y\' = \\dfrac{y^2 + xy}{x^2}$ con $y(' + v.x0 + ') = \\dfrac{' + v.x0 + '}{' + v.b + '}$ tiene una asíntota vertical cuando el denominador se anula en $x = x^* > ' + v.x0 + '$. ¿Cuánto vale $x^*$?'; },
      function (v) { return v.x0 * Math.exp(v.b); },
      'Como $u(x_0) = 1/b$, queda $u(x) = \\frac{1}{b - \\ln(x/x_0)}$, cuyo denominador se anula cuando $\\ln(x^*/x_0) = b \\Rightarrow x^* = x_0 e^b$.',
      { mistakes: { forgotX0: function (v) { return Math.exp(v.b); }, usedY0: function (v) { return v.x0 * Math.exp(v.b / v.x0); } },
        feedback: [
          { when: 'forgotX0', say: 'Casi: la condición está en $x = x_0$, por lo que $\\ln(x^*/x_0) = b \\Rightarrow x^* = x_0 e^b$.' },
          { when: 'usedY0', say: 'Casi: la constante sale de $1/u(x_0) = b$, no de $1/y(x_0)$.' }
        ] }),

    N('ph-n-fracciones-parciales-pvi', 'pvi-homogeneo', 3, { a: [1, 2, 1], u0: [2, 5, 1], x1: [2, 3, 1] },
      function (v) { return 'Resuelve por fracciones parciales el PVI homogéneo $y\' = \\dfrac{' + (1 - v.a) + 'xy - y^2}{x^2}$ con $y(1) = ' + v.u0 + '$ y calcula $y(' + v.x1 + ')$.'; },
      function (v) { return (v.a * v.u0 * v.x1) / ((v.u0 + v.a) * Math.pow(v.x1, v.a) - v.u0); },
      'Con $y = ux$ queda $x\\,u\' = -u(u + a) \\Rightarrow \\frac{u}{u + a} = \\frac{u_0}{u_0 + a}x^{-a}$, de donde se despeja $y(x_1) = x_1 u(x_1)$.',
      { mistakes: { noX: function (v) { return (v.a * v.u0) / ((v.u0 + v.a) * Math.pow(v.x1, v.a) - v.u0); }, plusU0: function (v) { return (v.a * v.u0 * v.x1) / ((v.u0 + v.a) * Math.pow(v.x1, v.a) + v.u0); } },
        feedback: [
          { when: 'noX', say: 'Casi: ese es $u(x_1)$; falta multiplicarlo por $x_1$.' },
          { when: 'plusU0', say: 'Casi: al despejar $u$ de $\\frac{u}{u + a} = Cx^{-a}$ queda una resta en el denominador.' }
        ] }),

    /* ======================= 4. Cambio u = ax + by + c y reducción autónoma (17) ======================= */
    C('sl-cuando-usar-lineal', 'sustitucion-lineal', 1,
      '¿Cuándo conviene aplicar la sustitución $u = ax + by + c$ en una EDO de primer orden?',
      'Cuando la ecuación tiene la forma $y\' = G(ax + by + c)$, es decir, $x$ y $y$ solo aparecen dentro de esa combinación lineal', [
        ['Cuando el lado derecho es un cociente de polinomios del mismo grado', 'Casi: cuando los grados son iguales depende de $y/x$ y se usa $y = ux$.'],
        ['Siempre que la EDO sea lineal de primer orden', 'Casi: si $x$ y $y$ no están agrupadas en $ax + by + c$, al cambiar a $u$ seguirán apareciendo dos variables.'],
        ['Solo cuando la constante $c$ vale cero', 'Casi: $c$ puede ser cualquier constante porque su derivada es cero.']],
      'Si $x$ y $y$ solo entran mediante $ax + by + c$, definir $u = ax + by + c$ reduce la ecuación a una separable.'),

    C('sl-derivada-cambio-lineal', 'sustitucion-lineal', 1,
      'Si defines la variable $u(x) = ax + by + c$ (con $a, b, c$ constantes), ¿cuánto vale la derivada $u\'$ respecto a $x$?',
      '$u\' = a + b\\,y\'$', [
        ['$u\' = b\\,y\'$, porque $ax + c$ no contiene a $y$', 'Casi: derivas respecto a $x$, y la derivada de $ax$ respecto a $x$ es $a$.'],
        ['$u\' = a + b\\,y\' + c$', 'Casi: la derivada de la constante $c$ es $0$.'],
        ['$u\' = a\\,x + b\\,y\'$', 'Casi: al derivar $ax$ respecto a $x$ queda la constante $a$, sin $x$.']],
      'Derivando respecto a $x$: $(ax)\' = a$, $(by)\' = b\\,y\'$ y $(c)\' = 0$, así que $u\' = a + b\\,y\'$.'),

    C('sl-identificar-u-raiz', 'sustitucion-lineal', 1,
      function (v) { return 'Para transformar $y\' = \\sqrt{' + v.a + 'x + y - ' + v.b + '}$ en una ecuación separable, ¿qué cambio de variable $u$ es el más directo?'; },
      function (v) { return '$u = ' + v.a + 'x + y - ' + v.b + '$'; }, [
        ['$y = ux$', 'Casi: el lado derecho no depende de $y/x$, sino de la combinación lineal dentro de la raíz.'],
        [function (v) { return '$u = ' + v.a + 'x - ' + v.b + '$'; }, 'Casi: si no incluyes $+y$ en $u$, seguirán quedando dos variables dentro de la raíz.'],
        ['$u = y^2$', 'Casi: debes tomar todo el argumento lineal de la raíz como $u$.']],
      'Con $u = ax + y - b$ queda $u\' = a + y\' = a + \\sqrt{u}$, que ya es de variables separables.',
      { vars: { a: [2, 6, 1], b: [3, 8, 1] } }),

    C('sl-autonoma-resultante', 'sustitucion-lineal', 1,
      'Al aplicar $u = ax + by + c$ a $y\' = G(ax + by + c)$, se obtiene $u\' = a + b\\,G(u)$. ¿Por qué esta ecuación siempre es separable?',
      'Porque su lado derecho depende únicamente de $u$ (es autónoma), separándose como $\\dfrac{du}{a + b\\,G(u)} = dx$', [
        ['Porque el lado derecho queda como un cociente $u/x$', 'Casi: en $u\' = a + b\\,G(u)$ ya no aparece $x$ en el lado derecho.'],
        ['Porque $G(u)$ siempre se vuelve un polinomio de primer grado', 'Casi: $G(u)$ puede ser cualquier función; es separable porque no contiene a $x$.'],
        ['Porque la constante $a$ siempre se cancela con $b\\,G(u)$', 'Casi: no hace falta que se cancele; todo $a + b\\,G(u)$ pasa dividiendo con $du$.']],
      'Como $a + b\\,G(u)$ depende solo de $u$, se separa directamente como $\\frac{du}{a + b\\,G(u)} = dx$.'),

    N('sl-n-evaluar-u-prima', 'sustitucion-lineal', 1, { a: [2, 5, 1], b: [2, 4, 1], u0: [2, 4, 1] },
      function (v) { return 'En $y\' = (' + v.a + 'x + ' + v.b + 'y)^2$, al definir $u = ' + v.a + 'x + ' + v.b + 'y$ y derivar obtienes $u\' = h(u)$. ¿Cuánto vale $h(' + v.u0 + ')$?'; },
      function (v) { return v.a + v.b * v.u0 * v.u0; },
      'Como $u\' = a + b\\,y\'$ y $y\' = u^2$, resulta $h(u) = a + bu^2$.',
      { mistakes: { forgotA: function (v) { return v.b * v.u0 * v.u0; }, forgotB: function (v) { return v.a + v.u0 * v.u0; } },
        feedback: [
          { when: 'forgotA', say: 'Casi: olvidaste sumar $a$, que viene de derivar $ax$.' },
          { when: 'forgotB', say: 'Casi: en $u = ax + by$, la derivada $y\'$ va multiplicada por $b$.' }
        ] }),

    N('sl-n-valor-u0-lineal', 'sustitucion-lineal', 1, { a: [2, 5, 1], b: [2, 4, 1], c: [1, 5, 1], x0: [1, 3, 1], y0: [2, 4, 1] },
      function (v) { return 'Si usas el cambio $u = ' + v.a + 'x + ' + v.b + 'y + ' + v.c + '$ con condición inicial $y(' + v.x0 + ') = ' + v.y0 + '$, ¿cuánto vale la condición inicial $u(' + v.x0 + ')$?'; },
      function (v) { return v.a * v.x0 + v.b * v.y0 + v.c; },
      'Evaluando la combinación en $(x_0, y_0)$: $u(x_0) = ax_0 + by_0 + c$.',
      { mistakes: { justY0: function (v) { return v.y0; }, forgotC: function (v) { return v.a * v.x0 + v.b * v.y0; } },
        feedback: [
          { when: 'justY0', say: 'Casi: ese es $y(x_0)$; debes evaluar $ax_0 + by_0 + c$.' },
          { when: 'forgotC', say: 'Casi: olvidaste sumar la constante $+c$.' }
        ] }),

    C('sl-reduccion-resta-cuad', 'sustitucion-lineal', 2,
      function (v) { return 'Si aplicas $u = ' + v.a + 'x - y$ a la ecuación $y\' = (' + v.a + 'x - y)^2 + ' + v.a + '$, ¿qué EDO resulta para $u(x)$?'; },
      '$u\' = -u^2$, porque $u\' = a - y\' = a - (u^2 + a)$', [
        ['$u\' = +u^2$, porque el cuadrado siempre es positivo', 'Casi: como $u = ax - y$ lleva $-y$, se tiene $u\' = a - y\'$, cambiando el signo de $u^2$.'],
        [function (v) { return '$u\' = ' + (2 * v.a) + ' - u^2$'; }, 'Casi: en $a - (u^2 + a)$ las constantes $a$ se cancelan.'],
        [function (v) { return '$u\' = u^2 + ' + v.a + '$'; }, 'Casi: $u\'$ no es igual a $y\'$, sino a $a - y\'$.']],
      'Derivando $u = ax - y$ se tiene $u\' = a - y\' = a - (u^2 + a) = -u^2$.',
      { vars: { a: [2, 6, 1] } }),

    C('sl-despejar-y-prima', 'sustitucion-lineal', 2,
      function (v) { return 'Si defines el cambio de variable $u = ' + v.a + 'x - ' + v.b + 'y + 4$, ¿cuál es el despeje correcto de $y\'$ en términos de $u\'$?'; },
      function (v) { return '$y\' = \\dfrac{' + v.a + ' - u\'}{' + v.b + '}$'; }, [
        [function (v) { return '$y\' = \\dfrac{u\' - ' + v.a + '}{' + v.b + '}$'; }, 'Casi: como el término con $y$ es $-by$, de $u\' = a - by\'$ se despeja $y\' = (a - u\')/b$.'],
        [function (v) { return '$y\' = \\dfrac{' + v.a + ' - u\' + 4}{' + v.b + '}$'; }, 'Casi: la constante $+4$ tiene derivada cero.'],
        [function (v) { return '$y\' = ' + v.a + ' - ' + v.b + 'u\'$'; }, 'Casi: el coeficiente $b$ pasa dividiendo al despejar $y\'$.']],
      'De $u\' = a - b\\,y\'$ se obtiene $b\\,y\' = a - u\' \\Rightarrow y\' = (a - u\')/b$.',
      { vars: { a: [2, 5, 1], b: [2, 5, 1] } }),

    C('sl-equilibrio-en-u', 'sustitucion-lineal', 2,
      'Al transformar $y\' = G(ax + by + c)$ en $u\' = a + b\\,G(u)$, supón que $a + b\\,G(u^*) = 0$. ¿Qué solución especial de la EDO original produce el equilibrio $u(x) = u^*$?',
      'La recta $ax + by + c = u^*$, sobre la cual la pendiente de la recta coincide con la del campo', [
        ['La recta horizontal $y(x) = u^*$', 'Casi: lo que vale $u^*$ es la combinación $ax + by + c$, que define una recta inclinada.'],
        ['Una recta que siempre pasa por el origen $(0, 0)$', 'Casi: la recta $ax + by + c = u^*$ solo pasa por el origen si $u^* = c$.'],
        ['Ninguna solución, porque $a + b\\,G(u)$ no puede valer cero', 'Casi: antes de dividir, $u(x) = u^*$ cumple $0 = 0$ en $u\' = a + b\\,G(u)$.']],
      'Si $u(x) = u^*$ es constante, $ax + by + c = u^*$ es una recta solución de pendiente $-a/b$.'),

    N('sl-n-coef-equilibrio-recta', 'sustitucion-lineal', 2, { a: [2, 5, 1], b: [2, 4, 1], k: [7, 15, 2] },
      function (v) { return 'En $y\' = (' + v.a + 'x + ' + v.b + 'y - ' + v.k + ')^2 - \\dfrac{' + v.a + '}{' + v.b + '}$ con $u = ' + v.a + 'x + ' + v.b + 'y - ' + v.k + '$, se tiene $u\' = 0$ cuando $u = 0$. Al evaluar esa recta solución en $x = 1$, ¿cuánto vale $y(1)$?'; },
      function (v) { return (v.k - v.a) / v.b; },
      'De $ax + by - k = 0$ en $x = 1$ sale $y(1) = (k - a)/b$.',
      { mistakes: { noSubA: function (v) { return v.k / v.b; }, noDivB: function (v) { return v.k - v.a; } },
        feedback: [
          { when: 'noSubA', say: 'Casi: ese es el valor en $x = 0$; en $x = 1$ debes restar $a$.' },
          { when: 'noDivB', say: 'Casi: falta dividir entre el coeficiente $b$ de $y$.' }
        ] }),

    N('sl-n-integrando-separado', 'sustitucion-lineal', 2, { a: [2, 5, 1], b: [2, 4, 1], u0: [1, 3, 1] },
      function (v) { return 'Al aplicar $u = ' + v.a + 'x + ' + v.b + 'y$ a $y\' = (' + v.a + 'x + ' + v.b + 'y)^2 + 1$ y separar como $h(u)\\,du = dx$, ¿cuánto vale $h(' + v.u0 + ')$?'; },
      function (v) { return 1 / (v.a + v.b * (v.u0 * v.u0 + 1)); },
      'Como $u\' = a + b(u^2 + 1)$, al separar resulta $h(u) = 1/(a + b(u^2 + 1))$.',
      { mistakes: { forgotA: function (v) { return 1 / (v.b * (v.u0 * v.u0 + 1)); }, notInverted: function (v) { return v.a + v.b * (v.u0 * v.u0 + 1); } },
        feedback: [
          { when: 'forgotA', say: 'Casi: olvidaste sumar $a$ en $u\' = a + b\\,y\'$.' },
          { when: 'notInverted', say: 'Casi: ese es $u\'$, que al separar pasa dividiendo junto a $du$.' }
        ] }),

    N('sl-n-integral-racional-u', 'sustitucion-lineal', 2, { a: [2, 6, 1], u1: [2, 4, 1] },
      function (v) { return 'En $y\' = \\dfrac{' + v.a + '}{x + y} - 1$, con $u = x + y$ se llega a $M(u)\\,du = dx$. Si $H(u) = \\displaystyle\\int M(u)\\,du$ con $H(0) = 0$, calcula $H(' + v.u1 + ')$.'; },
      function (v) { return (v.u1 * v.u1) / (2 * v.a); },
      'Como $u\' = 1 + y\' = a/u$, queda $(u/a)\\,du = dx$, cuya integral es $H(u) = u^2/(2a)$.',
      { mistakes: { multA: function (v) { return (v.a * v.u1 * v.u1) / 2; }, noHalf: function (v) { return (v.u1 * v.u1) / v.a; } },
        feedback: [
          { when: 'multA', say: 'Casi: como $a$ está en el numerador a la derecha, pasa dividiendo al lado de $du$.' },
          { when: 'noHalf', say: 'Casi: al integrar $u\\,du$ sale $u^2/2$, con factor $2$ en el denominador.' }
        ] }),

    N('sl-n-integral-exp-u', 'sustitucion-lineal', 2, { k: [2, 4, 1], u1: [1, 2, 1] },
      function (v) { return 'Si sustituyes $u = x + y$ en $y\' = e^{-' + v.k + '(x + y)} - 1$, al separar como $M(u)\\,du = dx$ e integrar el lado izquierdo obtienes $H(u)$ (sin constante). Evalúa $H(' + v.u1 + ')$.'; },
      function (v) { return Math.exp(v.k * v.u1) / v.k; },
      'De $u\' = 1 + y\' = e^{-ku}$ sale $e^{ku}\\,du = dx$, cuya antiderivada es $H(u) = e^{ku}/k$.',
      { mistakes: { noDivK: function (v) { return Math.exp(v.k * v.u1); }, negExp: function (v) { return Math.exp(-v.k * v.u1) / v.k; } },
        feedback: [
          { when: 'noDivK', say: 'Casi: al integrar $e^{ku}\\,du$ debes dividir entre $k$.' },
          { when: 'negExp', say: 'Casi: al pasar $e^{-ku}$ al lado izquierdo, el exponente cambia a $+ku$.' }
        ] }),

    N('sl-n-regreso-despeje-y', 'sustitucion-lineal', 2, { a: [2, 4, 1], b: [2, 4, 1], c: [1, 4, 1], x1: [2, 3, 1], u1: [20, 30, 5] },
      function (v) { return 'Resuelves una EDO mediante $u = ' + v.a + 'x + ' + v.b + 'y - ' + v.c + '$ y hallas que en $x = ' + v.x1 + '$ la variable auxiliar vale $u(' + v.x1 + ') = ' + v.u1 + '$. ¿Cuánto vale $y(' + v.x1 + ')$?'; },
      function (v) { return (v.u1 - v.a * v.x1 + v.c) / v.b; },
      'Despejando $y$ de $u = ax + by - c$ resulta $y = (u - ax + c)/b$.',
      { mistakes: { noDivB: function (v) { return v.u1 - v.a * v.x1 + v.c; }, wrongSignAx: function (v) { return (v.u1 + v.a * v.x1 + v.c) / v.b; } },
        feedback: [
          { when: 'noDivB', say: 'Casi: ese es $by(x_1)$; falta dividir entre $b$.' },
          { when: 'wrongSignAx', say: 'Casi: al despejar $by$, el término $ax$ pasa restando.' }
        ] }),

    C('sl-fraccion-combinaciones-proporcionales', 'sustitucion-lineal', 3,
      'La ecuación $y\' = \\dfrac{2x + 4y + 3}{x + 2y - 1}$ tiene dos expresiones lineales en el numerador y el denominador. ¿Por qué se reduce a separable con una sola sustitución $u = x + 2y$?',
      'Porque $2x + 4y = 2(x + 2y) = 2u$, así que toda la fracción queda como $\\dfrac{2u + 3}{u - 1}$', [
        ['Porque cualquier cociente lineal siempre es homogéneo con $y = ux$', 'Casi: las constantes $+3$ y $-1$ rompen la homogeneidad; funciona porque $(2, 4)$ es múltiplo de $(1, 2)$.'],
        ['Porque las constantes $+3$ y $-1$ se borran al derivar', 'Casi: $+3$ y $-1$ están en la fracción algebraica, no derivándose.'],
        ['No se puede usar $u = x + 2y$; hacen falta dos variables auxiliares', 'Casi: como $2x + 4y = 2u$, una sola variable $u = x + 2y$ elimina a $x$ y a $y$.']],
      'Al ser proporcionales los coeficientes de $x$ y $y$, ambos dependen de la misma combinación $u = x + 2y$.'),

    N('sl-n-coef-proporcionalidad', 'sustitucion-lineal', 3, { a: [2, 5, 1], b: [2, 5, 1], m: [2, 4, 1] },
      function (v) { return '¿Qué valor debe tener $k$ para que $y\' = \\dfrac{' + (v.m * v.a) + 'x + k\\,y + 5}{' + v.a + 'x + ' + v.b + 'y - 2}$ dependa únicamente de la combinación $u = ' + v.a + 'x + ' + v.b + 'y$?'; },
      function (v) { return v.m * v.b; },
      'Para que el numerador sea $m(ax + by) + 5 = mu + 5$, el coeficiente de $y$ debe ser $k = mb$.',
      { where: function (v) { return v.a !== v.b; },
        mistakes: { justB: function (v) { return v.b; }, multA: function (v) { return v.m * v.a; } },
        feedback: [
          { when: 'justB', say: 'Casi: como $a$ está multiplicado por $m$ arriba, también debes multiplicar $b$ por $m$.' },
          { when: 'multA', say: 'Casi: debes mantener la proporción con el coeficiente $b$ de $y$, no con $a$.' }
        ] }),

    N('sl-n-equilibrio-positivo-u', 'sustitucion-lineal', 3, { a: [3, 6, 1], b: [2, 4, 1], k: [2, 5, 1] },
      function (v) { return 'Al aplicar $u = ' + v.a + 'x + y$ en $y\' = ' + v.b + 'u^2 - ' + (v.b * v.k * v.k + v.a) + '$, se obtiene una ecuación autónoma para $u$. ¿Para qué valor positivo $u^* > 0$ se cumple $u\' = 0$?'; },
      function (v) { return v.k; },
      'Como $u\' = a + y\' = b(u^2 - k^2)$, se anula en $u^* = k > 0$.',
      { mistakes: { forgotA: function (v) { return Math.sqrt(v.k * v.k + v.a / v.b); }, sqVal: function (v) { return v.k * v.k; } },
        feedback: [
          { when: 'forgotA', say: 'Casi: resolviste $y\' = 0$ en lugar de $u\' = a + y\' = 0$.' },
          { when: 'sqVal', say: 'Casi: ese es $(u^*)^2$; falta sacar la raíz cuadrada.' }
        ] }),

    /* ======================= 5. PVI con u = ax + by + c (16) ======================= */
    C('pl-olvidar-restar-x', 'pvi-lineal', 1,
      'Al resolver $y\' = (x + y)^2$ con $y(0) = 0$ mediante $u = x + y$, integras $\\dfrac{du}{1 + u^2} = dx$ y obtienes $u(x) = \\tan x$. ¿Cuál es el último paso para dar la solución del PVI?',
      'Despejar $y$ de $u = x + y$, escribiendo $y(x) = \\tan x - x$', [
        ['Dejar $y(x) = \\tan x$, porque ya cumple $\\tan(0) = 0$', 'Casi: la derivada de $\\tan x$ es $1 + \\tan^2 x$; hay que restar $x$ para regresar a $y = u - x$.'],
        ['Dividir entre $x$ y escribir $y(x) = \\dfrac{\\tan x}{x}$', 'Casi: el cambio fue la suma $u = x + y$, no el producto $ux$.'],
        ['Sumar $x$ y escribir $y(x) = \\tan x + x$', 'Casi: de $u = x + y$ se despeja $y = u - x$ restando $x$.']],
      'Como $u = x + y$, al regresar a la variable original queda $y(x) = u(x) - x = \\tan x - x$.'),

    E('pl-e-tan-lineal', 'pvi-lineal', 1, { a: [2, 5, 1] },
      function (v) { return 'Resuelve el PVI $y\' = (x + y)^2 + ' + (v.a * v.a - 1) + '$ con condición inicial $y(0) = 0$. Escribe la solución explícita $y(x)$.'; },
      function (v) { return v.a + '*tan(' + v.a + '*x) - x'; },
      'Con $u = x + y$: $u\' = u^2 + a^2 \\Rightarrow u = a\\tan(ax)$, por lo que $y = a\\tan(ax) - x$.',
      { domain: [0.05, 0.25],
        mistakes: { noBack: function (v) { return v.a + '*tan(' + v.a + '*x)'; }, noCoefA: function (v) { return 'tan(' + v.a + '*x) - x'; } },
        feedback: [
          { when: 'noBack', say: 'Casi: esa es $u(x) = x + y$; falta restar $x$ para regresar a $y(x)$.' },
          { when: 'noCoefA', say: 'Casi: de $\\frac{1}{a}\\arctan(u/a) = x$ al despejar $u$ queda multiplicado por $a$.' }
        ] }),

    N('pl-n-exponencial-lineal-eval', 'pvi-lineal', 1, { a: [2, 4, 1], u0: [2, 5, 1] },
      function (v) { return 'Resuelve el PVI $y\' = ' + v.a + '(x + y) - 1$ con condición inicial $y(0) = ' + v.u0 + '$ usando $u = x + y$, y calcula el valor de $y(1)$.'; },
      function (v) { return v.u0 * Math.exp(v.a) - 1; },
      'Con $u = x + y$ queda $u\' = au \\Rightarrow u(x) = u_0 e^{ax}$, así que $y(1) = u_0 e^a - 1$.',
      { mistakes: { noSubX: function (v) { return v.u0 * Math.exp(v.a); }, plusX: function (v) { return v.u0 * Math.exp(v.a) + 1; } },
        feedback: [
          { when: 'noSubX', say: 'Casi: ese es $u(1)$; recuerda restar $x = 1$ para obtener $y(1) = u(1) - 1$.' },
          { when: 'plusX', say: 'Casi: de $u = x + y$ se despeja $y = u - x$, restando $1$ en $x = 1$.' }
        ] }),

    N('pl-n-raiz-suma-eval', 'pvi-lineal', 1, { c: [2, 4, 1], x1: [2, 4, 1] },
      function (v) { return 'Resuelve el PVI $y\' = 2\\sqrt{x + y} - 1$ con condición inicial $y(0) = ' + (v.c * v.c) + '$ mediante $u = x + y$, y calcula $y(' + v.x1 + ')$.'; },
      function (v) { return Math.pow(v.x1 + v.c, 2) - v.x1; },
      'De $u\' = 2\\sqrt{u}$ sale $\\sqrt{u} = x + c \\Rightarrow u(x) = (x + c)^2$, y $y(x_1) = (x_1 + c)^2 - x_1$.',
      { mistakes: { noSubX: function (v) { return Math.pow(v.x1 + v.c, 2); }, usedC2: function (v) { return Math.pow(v.x1 + v.c * v.c, 2) - v.x1; } },
        feedback: [
          { when: 'noSubX', say: 'Casi: calculaste $u(x_1)$; falta restar $x_1$.' },
          { when: 'usedC2', say: 'Casi: en $\\sqrt{u} = x + C$, al evaluar en $x = 0$ la constante es $\\sqrt{u(0)} = c$, no $c^2$.' }
        ] }),

    C('pl-asintota-reciproco-lineal', 'pvi-lineal', 2,
      'Al resolver $y\' = (x + y)^2 - 1$ con $y(0) = 2$ mediante $u = x + y$, se obtiene $u\' = u^2$ y $y(x) = \\dfrac{2}{1 - 2x} - x$. ¿En qué punto $x > 0$ deja de existir esta solución?',
      'En $x = 1/2$, porque ahí el denominador $1 - 2x$ se anula y la solución tiene una asíntota vertical', [
        ['Es válida para todo $x \\in (-\\infty, \\infty)$', 'Casi: el denominador $1 - 2x$ se anula en $x = 1/2$, provocando una asíntota vertical.'],
        ['En $x = 2$, por el valor inicial $y(0) = 2$', 'Casi: de $1 - 2x = 0$ se despeja $x = 1/2$, no $x = 2$.'],
        ['En $x = 0$, porque ahí empieza el intervalo', 'Casi: en $x = 0$ el denominador vale $1 - 0 = 1 \\neq 0$.']],
      'De $1 - 2x = 0$ resulta $x = 1/2$, donde la solución explota hacia infinito.'),

    E('pl-e-resta-reciproco', 'pvi-lineal', 2, { a: [2, 5, 1], b: [2, 4, 1] },
      function (v) { return 'Resuelve el PVI $y\' = (' + v.a + 'x - y)^2 + ' + v.a + '$ con condición inicial $y(0) = -' + v.b + '$. Escribe la solución explícita $y(x)$.'; },
      function (v) { return v.a + '*x - ' + v.b + '/(' + v.b + '*x + 1)'; },
      'Con $u = ax - y$: $u\' = -u^2 \\Rightarrow 1/u = x + 1/b$, de donde $y = ax - u = ax - b/(bx + 1)$.',
      { domain: [0, 2],
        mistakes: { noBack: function (v) { return v.b + '/(' + v.b + '*x + 1)'; }, plusU: function (v) { return v.a + '*x + ' + v.b + '/(' + v.b + '*x + 1)'; } },
        feedback: [
          { when: 'noBack', say: 'Casi: esa es $u(x)$; como $u = ax - y$, debes despejar $y = ax - u(x)$.' },
          { when: 'plusU', say: 'Casi: de $u = ax - y$ se despeja $y = ax - u$, con signo menos.' }
        ] }),

    E('pl-e-exp-negativa', 'pvi-lineal', 2, { a: [2, 5, 1], c: [2, 6, 1] },
      function (v) { return 'Resuelve el PVI $y\' = e^{-(' + v.a + 'x + y)} - ' + v.a + '$ con condición inicial $y(0) = \\ln(' + v.c + ')$. Escribe la función explícita $y(x)$ (usa <code>ln(...)</code>).'; },
      function (v) { return 'log(x + ' + v.c + ') - ' + v.a + '*x'; },
      'Con $u = ax + y$: $u\' = e^{-u} \\Rightarrow e^u = x + c$, de donde $y = \\ln(x + c) - ax$.',
      { domain: [0, 3],
        mistakes: { noSubAx: function (v) { return 'log(x + ' + v.c + ')'; }, plusAx: function (v) { return 'log(x + ' + v.c + ') + ' + v.a + '*x'; } },
        feedback: [
          { when: 'noSubAx', say: 'Casi: esa es $u(x)$; falta restar $ax$ para regresar a $y(x)$.' },
          { when: 'plusAx', say: 'Casi: de $u = ax + y$ el término $ax$ pasa restando.' }
        ] }),

    E('pl-e-fraccion-inversa', 'pvi-lineal', 2, { k: [2, 5, 1], c: [2, 4, 1] },
      function (v) { return 'Resuelve el PVI $y\' = \\dfrac{' + v.k + '}{x + y} - 1$ (para $x + y > 0$) con condición inicial $y(0) = ' + v.c + '$. Escribe la solución explícita $y(x)$.'; },
      function (v) { return 'sqrt(' + (2 * v.k) + '*x + ' + (v.c * v.c) + ') - x'; },
      'Con $u = x + y$: $u\' = k/u \\Rightarrow u^2 = 2kx + c^2$, por lo que $y(x) = \\sqrt{2kx + c^2} - x$.',
      { domain: [0, 3],
        mistakes: { noSubX: function (v) { return 'sqrt(' + (2 * v.k) + '*x + ' + (v.c * v.c) + ')'; }, noTwo: function (v) { return 'sqrt(' + v.k + '*x + ' + (v.c * v.c) + ') - x'; } },
        feedback: [
          { when: 'noSubX', say: 'Casi: esa es $u(x) = x + y$; recuerda restar $x$ al final.' },
          { when: 'noTwo', say: 'Casi: como $\\int u\\,du = u^2/2$, al despejar $u^2$ el $2$ multiplica a $kx$.' }
        ] }),

    N('pl-n-resta-reciproco-eval', 'pvi-lineal', 2, { a: [2, 5, 1], b: [1, 3, 1], x1: [2, 4, 1] },
      function (v) { return 'Resuelve el PVI $y\' = (' + v.a + 'x - y)^2 + ' + v.a + '$ con condición inicial $y(0) = -' + v.b + '$ y calcula el valor de $y(' + v.x1 + ')$.'; },
      function (v) { return v.a * v.x1 - 1 / (v.x1 + 1 / v.b); },
      'Con $u = ax - y$ queda $u(x) = 1/(x + 1/b)$ y $y(x_1) = ax_1 - 1/(x_1 + 1/b)$.',
      { mistakes: { plusU: function (v) { return v.a * v.x1 + 1 / (v.x1 + 1 / v.b); }, onlyU: function (v) { return 1 / (v.x1 + 1 / v.b); } },
        feedback: [
          { when: 'plusU', say: 'Casi: de $u = ax - y$ se despeja $y = ax - u$, restando $u(x_1)$.' },
          { when: 'onlyU', say: 'Casi: ese es $u(x_1)$; falta hacer $y(x_1) = ax_1 - u(x_1)$.' }
        ] }),

    N('pl-n-racional-raiz-eval', 'pvi-lineal', 2, { k: [5, 9, 1], c: [3, 5, 1], x1: [2, 3, 1] },
      function (v) { return 'Encuentra la solución del PVI $y\' = \\dfrac{' + v.k + '}{x + y + 1} - 1$ con $y(0) = ' + (v.c - 1) + '$ y evalúala en $x = ' + v.x1 + '$.'; },
      function (v) { return Math.sqrt(2 * v.k * v.x1 + v.c * v.c) - v.x1 - 1; },
      'Con $u = x + y + 1$ se tiene $u(0) = c$ y $u(x_1) = \\sqrt{2kx_1 + c^2}$, de donde $y(x_1) = u(x_1) - x_1 - 1$.',
      { mistakes: { forgotSubX1: function (v) { return Math.sqrt(2 * v.k * v.x1 + v.c * v.c); }, noTwo: function (v) { return Math.sqrt(v.k * v.x1 + v.c * v.c) - v.x1 - 1; } },
        feedback: [
          { when: 'forgotSubX1', say: 'Casi: ese es $u(x_1)$; falta restar $x_1 + 1$ para despejar $y(x_1)$.' },
          { when: 'noTwo', say: 'Casi: de $u^2/2 = kx + C$ al despejar $u^2$ aparece $2kx$.' }
        ] }),

    N('pl-n-exp-lineal-eval', 'pvi-lineal', 2, { a: [2, 4, 1], c: [2, 6, 1], x1: [1, 3, 1] },
      function (v) { return 'Resuelve el PVI $y\' = e^{' + v.a + 'x - y} + ' + v.a + '$ con condición inicial $y(0) = \\ln(' + v.c + ')$ y calcula $y(' + v.x1 + ')$.'; },
      function (v) { return v.a * v.x1 + Math.log(v.x1 + v.c); },
      'Con $u = y - ax$: $u\' = e^{-u} \\Rightarrow e^u = x + c$, así que $y(x_1) = ax_1 + \\ln(x_1 + c)$.',
      { mistakes: { noAx: function (v) { return Math.log(v.x1 + v.c); }, minusAx: function (v) { return Math.log(v.x1 + v.c) - v.a * v.x1; } },
        feedback: [
          { when: 'noAx', say: 'Casi: calculaste $u(x_1) = y - ax_1$; falta sumar $ax_1$.' },
          { when: 'minusAx', say: 'Casi: de $u = y - ax$ se despeja $y = u + ax$ sumando $ax_1$.' }
        ] }),

    N('pl-n-decaimiento-desplazado', 'pvi-lineal', 2, { a: [2, 4, 1], b: [1, 2, 1], d: [3, 6, 1] },
      function (v) { return 'Resuelve el PVI $y\' = -' + v.b + '(y - ' + v.a + 'x) + ' + v.a + '$ con condición inicial $y(0) = ' + v.d + '$ y calcula el valor de $y(1)$.'; },
      function (v) { return v.a + v.d * Math.exp(-v.b); },
      'Con $u = y - ax$ queda $u\' = -bu \\Rightarrow u(x) = de^{-bx}$, por lo que $y(1) = a + de^{-b}$.',
      { mistakes: { noA: function (v) { return v.d * Math.exp(-v.b); }, posExp: function (v) { return v.a + v.d * Math.exp(v.b); } },
        feedback: [
          { when: 'noA', say: 'Casi: ese es $u(1)$; falta sumar $ax = a$ para regresar a $y(1)$.' },
          { when: 'posExp', say: 'Casi: como $u\' = -bu$ lleva signo menos, el exponente es $-b$.' }
        ] }),

    E('pl-e-coef-en-y', 'pvi-lineal', 3, { a: [2, 4, 1], b: [2, 3, 1], d: [2, 5, 1] },
      function (v) { return 'Resuelve el PVI $y\' = y + ' + v.a + 'x + ' + v.b + '$ con $y(0) = ' + v.d + '$ mediante la sustitución $u = ' + v.a + 'x + y + ' + (v.b + v.a) + '$. Escribe la solución explícita $y(x)$.'; },
      function (v) { return '(' + (v.d + v.b + v.a) + ')*e^x - ' + v.a + '*x - ' + (v.b + v.a); },
      'Con $u = ax + y + b + a$ queda $u\' = u \\Rightarrow u(x) = (d + b + a)e^x$, y $y = (d + b + a)e^x - ax - (b + a)$.',
      { domain: [0.2, 1.5],
        mistakes: { usedDOnly: function (v) { return v.d + '*e^x - ' + v.a + '*x - ' + (v.b + v.a); }, forgotAInU: function (v) { return '(' + (v.d + v.b) + ')*e^x - ' + v.a + '*x - ' + v.b; } },
        feedback: [
          { when: 'usedDOnly', say: 'Casi: en $x = 0$, $u(0) = d + b + a$, no solo $d$.' },
          { when: 'forgotAInU', say: 'Casi: al derivar $ax + y$ sale un $+a$ adicional en $u\' = a + y\'$.' }
        ] }),

    N('pl-n-tiempo-asintota-lineal', 'pvi-lineal', 3, { a: [2, 4, 1], k: [6, 12, 2], y0: [2, 5, 1] },
      function (v) { return 'Al resolver el PVI $y\' = \\dfrac{(' + v.a + 'x + y)^2}{' + v.k + '} - ' + v.a + '$ con $y(0) = ' + v.y0 + '$ mediante $u = ' + v.a + 'x + y$, la solución explota cuando el denominador se anula en $x = x^* > 0$. ¿Cuánto vale $x^*$?'; },
      function (v) { return v.k / v.y0; },
      'De $u\' = u^2/k$ con $u(0) = y_0$ sale $-1/u = x/k - 1/y_0$, cuyo polo está en $x^* = k/y_0$.',
      { mistakes: { invRatio: function (v) { return v.y0 / v.k; }, multVal: function (v) { return v.k * v.y0; } },
        feedback: [
          { when: 'invRatio', say: 'Casi: invertiste el cociente; de $x^*/k = 1/y_0$ sale $x^* = k/y_0$.' },
          { when: 'multVal', say: 'Casi: como entra $1/y_0$, debes dividir $k$ entre $y_0$.' }
        ] }),

    N('pl-n-rectas-paralelas-pvi', 'pvi-lineal', 3, { k: [3, 6, 1], c: [2, 4, 1], x1: [1, 3, 1] },
      function (v) { return 'Resuelve la ecuación $y\' = \\dfrac{' + v.k + ' - (x + y)}{x + y}$ con condición inicial $y(0) = ' + v.c + '$ mediante $u = x + y$, y calcula $y(' + v.x1 + ')$.'; },
      function (v) { return Math.sqrt(2 * v.k * v.x1 + v.c * v.c) - v.x1; },
      'Con $u = x + y$: $u\' = 1 + (k - u)/u = k/u \\Rightarrow u^2 = 2kx + c^2$, de donde $y(x_1) = \\sqrt{2kx_1 + c^2} - x_1$.',
      { mistakes: { noSubX1: function (v) { return Math.sqrt(2 * v.k * v.x1 + v.c * v.c); }, forgotPlus1InU: function (v) { return Math.sqrt(2 * (v.k - 1) * v.x1 + v.c * v.c) - v.x1; } },
        feedback: [
          { when: 'noSubX1', say: 'Casi: ese es $u(x_1)$; falta restar $x_1$ para regresar a $y(x_1)$.' },
          { when: 'forgotPlus1InU', say: 'Casi: al sumar $1 + (k - u)/u$ se cancela $-u/u = -1$ con $+1$ y queda $k/u$.' }
        ] }),

    N('pl-n-tan-con-coef-b', 'pvi-lineal', 3, { a: [2, 4, 1], b: [2, 3, 1] },
      function (v) { return 'Resuelve el PVI $' + v.b + '\\,y\' = ' + v.a + ' + (' + v.b + 'y - ' + v.a + 'x)^2 + ' + (v.b * v.b) + '$ con condición inicial $y(0) = 0$ mediante $u = ' + v.b + 'y - ' + v.a + 'x$, y calcula $y(0.4)$ (en radianes).'; },
      function (v) { return Math.tan(0.4 * v.b) + 0.4 * (v.a / v.b); },
      'Con $u = by - ax$ queda $u\' = u^2 + b^2 \\Rightarrow u(x) = b\\tan(bx)$, y al despejar $y$ resulta $y(x) = \\tan(bx) + (a/b)x$.',
      { mistakes: { noDivB: function (v) { return v.b * Math.tan(0.4 * v.b) + 0.4 * v.a; }, onlyTan: function (v) { return Math.tan(0.4 * v.b); } },
        feedback: [
          { when: 'noDivB', say: 'Casi: ese es el valor de $b\\,y(0.4)$; falta dividir entre $b$.' },
          { when: 'onlyTan', say: 'Casi: olvidaste sumar el término $(a/b)x$ al despejar $y$ de $u = by - ax$.' }
        ] }),

    /* ======================= 6. Condición inicial, regreso a y y elección de método (16) ======================= */
    C('em-eleccion-tres-metodos', 'errores-metodo', 1,
      '¿Cómo distingues rápidamente si una EDO de primer orden se resuelve con $y = ux$ o con $u = ax + by + c$?',
      'Si todo depende del cociente $y/x$ (grados iguales), se usa $y = ux$; si $x$ y $y$ solo aparecen en una misma combinación lineal, se usa $u = ax + by + c$', [
        ['Siempre se intenta primero $u = x + y$, y si falla se prueba $y = ux$', 'Casi: no hace falta adivinar; la estructura algebraica ($F(y/x)$ frente a $G(ax + by + c)$) indica cuál aplica.'],
        ['$y = ux$ sirve cuando hay sumas y $u = ax + by + c$ cuando hay productos', 'Casi: en $(x^2 + y^2)/(2xy)$ hay sumas y se usa $y = ux$ porque todos los términos tienen el mismo grado.'],
        ['Son equivalentes y cualquiera de las dos resuelve ambas familias', 'Casi: aplicar $y = ux$ a $(x + y)^2$ no separa las variables, ni $u = x + y$ separa una homogénea general.']],
      'Grados iguales en todos los términos indica $F(y/x) \\to y = ux$; una combinación lineal repetida indica $G(ax + by + c) \\to u = ax + by + c$.'),

    C('em-error-no-regresar-y', 'errores-metodo', 1,
      'Un estudiante resuelve una EDO homogénea con $y = ux$, integra bien y entrega como respuesta final $\\sqrt{2\\ln x + 1}$. ¿Qué paso olvidó?',
      'Regresar a la variable original multiplicando por $x$, pues $y(x) = x\\,u(x) = x\\sqrt{2\\ln x + 1}$', [
        ['Dividir entre $x$, pues $y(x) = u(x)/x$', 'Casi: como $u = y/x$, al despejar $y$ se multiplica por $x$, no se divide.'],
        ['Restar $x$, escribiendo $y(x) = \\sqrt{2\\ln x + 1} - x$', 'Casi: restar $x$ es para $u = x + y$; en homogéneas el cambio es $y = ux$.'],
        ['Derivar la raíz cuadrada antes de entregar', 'Casi: al integrar ya obtuviste $u(x)$; solo falta multiplicar por $x$.']],
      'La incógnita de la EDO es $y(x)$, así que tras hallar $u(x)$ siempre hay que sustituir $y(x) = x\\,u(x)$.'),

    C('em-error-condicion-inicial-ux', 'errores-metodo', 1,
      function (v) { return 'En un PVI homogéneo con condición inicial $y(' + v.x0 + ') = ' + v.y0 + '$, ¿por qué es incorrecto sustituir $u = ' + v.y0 + '$ cuando $x = ' + v.x0 + '$ para hallar $C$?'; },
      function (v) { return 'Porque $u = y/x$, así que en $x = ' + v.x0 + '$ el valor correcto es $u(' + v.x0 + ') = ' + v.y0 + '/' + v.x0 + ' = ' + (v.y0 / v.x0) + '$, no $' + v.y0 + '$'; }, [
        [function (v) { return 'Porque en realidad se debe sustituir $u = ' + (v.x0 * v.y0) + '$' }, 'Casi: como $y = ux$, se despeja $u = y/x$ dividiendo entre $x_0$, no multiplicando.'],
        ['Porque la condición inicial solo se puede evaluar en $x = 0$', 'Casi: en una homogénea $x_0$ ni siquiera suele ser $0$; se evalúa en el $x_0$ dado convirtiendo $u_0 = y_0/x_0$.'],
        ['Sí es correcto, porque en las condiciones iniciales $u$ y $y$ valen lo mismo', 'Casi: $u$ y $y$ solo coinciden cuando $x_0 = 1$; si $x_0 \\neq 1$, $u(x_0) = y_0/x_0 \\neq y_0$.']],
      'Si aplicas la condición inicial antes de regresar a $y$, debes convertirla usando $u(x_0) = y_0/x_0$.',
      { vars: { x0: [2, 5, 1], y0: [10, 20, 10] } }),

    C('em-error-olvidar-a-derivada', 'errores-metodo', 1,
      function (v) { return 'Al usar el cambio $u = ' + v.a + 'x + y$ en $y\' = (' + v.a + 'x + y)^2$, alguien escribe $u\' = y\' = u^2$. ¿Cuál fue el error cometido?'; },
      function (v) { return 'Olvidar que la derivada de $' + v.a + 'x$ respecto a $x$ es $' + v.a + '$, por lo que $u\' = ' + v.a + ' + y\' = ' + v.a + ' + u^2$'; }, [
        ['Olvidar la regla del producto, pues debía escribir $u\' = u + x\\,y\'$', 'Casi: $ax + y$ es una suma, no un producto; su derivada es simplemente $a + y\'$.'],
        [function (v) { return 'Escribir $+u^2$ en vez de $-u^2$' }, 'Casi: el signo de $u^2$ es correcto; lo que falta es sumar la derivada $a$ de $ax$.'],
        ['No dividir entre $x$ el lado derecho', 'Casi: en la sustitución lineal no se divide entre $x$.']],
      'Al derivar $u = ax + y$ respecto a $x$, el término $ax$ aporta su derivada constante $a$: $u\' = a + y\'$.',
      { vars: { a: [2, 6, 1] } }),

    N('em-n-error-no-multiplicar-x', 'errores-metodo', 1, { x1: [2, 5, 1], u1: [3, 7, 1] },
      function (v) { return 'Al resolver una EDO homogénea mediante $y = ux$, obtienes que en $x = ' + v.x1 + '$ la variable auxiliar vale $u(' + v.x1 + ') = ' + v.u1 + '$. ¿Cuánto vale la solución $y(' + v.x1 + ')$?'; },
      function (v) { return v.x1 * v.u1; },
      'Por definición del cambio $y = ux$, en $x = x_1$ se tiene $y(x_1) = x_1 u(x_1)$.',
      { mistakes: { justU1: function (v) { return v.u1; }, divInstead: function (v) { return v.u1 / v.x1; } },
        feedback: [
          { when: 'justU1', say: 'Casi: dejaste el valor de $u(x_1)$ sin multiplicar por $x_1$.' },
          { when: 'divInstead', say: 'Casi: como $u = y/x$, para regresar a $y$ debes multiplicar por $x_1$, no dividir.' }
        ] }),

    C('em-cual-metodo-coseno', 'errores-metodo', 2,
      function (v) { return '¿Qué cambio de variable permite reducir directamente la ecuación $y\' = \\tan^2(' + v.a + 'x - ' + v.b + 'y + 1)$ a una de variables separables?'; },
      function (v) { return 'La sustitución lineal $u = ' + v.a + 'x - ' + v.b + 'y + 1$'; }, [
        ['La sustitución homogénea $y = ux$', 'Casi: el argumento de la tangente no es el cociente $y/x$, sino una combinación lineal con término constante.'],
        ['Ninguno, porque ya es directamente separable', 'Casi: $\\tan^2(ax - by + 1)$ no se puede factorizar como $g(x)\\,h(y)$.'],
        [function (v) { return 'El cambio $u = \\tan(' + v.b + 'y)$' }, 'Casi: debes tomar todo el argumento lineal $ax - by + 1$ como $u$ para que desaparezca la $x$.']],
      'Como $x$ y $y$ solo entran en la combinación $ax - by + 1$, el cambio $u = ax - by + 1$ da $u\' = a - b\\tan^2 u$.',
      { vars: { a: [2, 5, 1], b: [3, 7, 1] } }),

    C('em-cual-metodo-cociente-exp', 'errores-metodo', 2,
      function (v) { return '¿Qué método es el adecuado para resolver la ecuación diferencial $x\\,y\' = y + ' + v.k + '\\sqrt{x^2 + y^2}$ (con $x > 0$)?'; },
      function (v) { return 'Es homogénea y se reduce a separable con $y = ux$, pues al dividir entre $x$ queda $y\' = u + ' + v.k + '\\sqrt{1 + u^2}$'; }, [
        ['Usar la sustitución lineal $u = x + y$', 'Casi: bajo la raíz hay $x^2 + y^2$, no $(x + y)^2$; lo que tiene es grado uniforme $1$.'],
        ['Usar $u = x^2 + y^2$, porque aparece dentro de la raíz', 'Casi: al derivar $x^2 + y^2$ sale $2x + 2y\\,y\'$, que no coincide con $x\\,y\' - y$.'],
        ['Separar directamente las variables pasando $y$ a la izquierda', 'Casi: la suma dentro de $\\sqrt{x^2 + y^2}$ impide separar $x$ y $y$ sin cambiar de variable.']],
      'Todos los términos tienen grado $1$; dividiendo entre $x > 0$ queda $y\' = u + k\\sqrt{1 + u^2}$, que con $y = ux$ da $x\\,u\' = k\\sqrt{1 + u^2}$.',
      { vars: { k: [2, 6, 1] } }),

    C('em-ninguno-de-los-dos', 'errores-metodo', 2,
      '¿Cuál de las siguientes ecuaciones diferenciales <strong>no</strong> es directamente separable, ni homogénea ($F(y/x)$), ni de la forma $G(ax + by + c)$?',
      '$y\' = x^2 + y$', [
        ['$y\' = (2x + y - 3)^2$', 'Casi: esta sí tiene la forma $G(2x + y - 3)$ y se resuelve con $u = 2x + y - 3$.'],
        ['$y\' = \\dfrac{x^2 + y^2}{xy}$', 'Casi: esta sí es homogénea de la forma $F(y/x)$ y se resuelve con $y = ux$.'],
        ['$y\' = x^2\\,y$', 'Casi: esta ya es directamente de variables separables ($g(x)\\,h(y)$).']],
      'En $y\' = x^2 + y$ los términos tienen grados distintos ($2$ y $1$) y no forman una combinación lineal $ax + by + c$.'),

    N('em-n-diferencia-error-ic-hom', 'errores-metodo', 2, { x0: [2, 4, 1], u0: [2, 4, 1] },
      function (v) { return 'Al integrar una EDO homogénea con $y = ux$ llegas a $u^2 = 2\\ln(x/' + v.x0 + ') + C$, con condición inicial $y(' + v.x0 + ') = ' + (v.x0 * v.u0) + '$. Si alguien usa por error $u(' + v.x0 + ') = y(' + v.x0 + ')$ en vez de $y(' + v.x0 + ')/' + v.x0 + '$, obtiene una constante falsa. ¿Cuánto vale la constante <strong>correcta</strong> $C$?'; },
      function (v) { return v.u0 * v.u0; },
      'En $x = x_0$, $\\ln(x_0/x_0) = 0$ y $u(x_0) = y_0/x_0 = u_0$, así que $C = u_0^2$.',
      { mistakes: { usedY0Sq: function (v) { return Math.pow(v.x0 * v.u0, 2); }, noSq: function (v) { return v.u0; } },
        feedback: [
          { when: 'usedY0Sq', say: 'Casi: elevaste al cuadrado $y(x_0)$ sin dividirlo antes entre $x_0$.' },
          { when: 'noSq', say: 'Casi: ese es $u(x_0)$; en la ecuación aparece $u^2$, así que $C = u(x_0)^2$.' }
        ] }),

    N('em-n-residuo-sin-regresar-lineal', 'errores-metodo', 2, { x0: [1, 3, 1], a: [2, 4, 1] },
      function (v) { return 'Para $y\' = (' + v.a + 'x + y)^2 - ' + v.a + '$, con $u = ' + v.a + 'x + y$ una solución para $u$ es $u(x) = -1/x$. ¿Cuánto vale la solución <strong>correcta</strong> $y(x) = u(x) - ' + v.a + 'x$ evaluada en $x = -' + v.x0 + '$?'; },
      function (v) { return 1 / v.x0 + v.a * v.x0; },
      'En $x = -x_0$ se tiene $u(-x_0) = 1/x_0$ y $-a(-x_0) = +ax_0$, por lo que $y(-x_0) = 1/x_0 + ax_0$.',
      { mistakes: { forgotAx: function (v) { return 1 / v.x0; }, wrongSignAx: function (v) { return 1 / v.x0 - v.a * v.x0; } },
        feedback: [
          { when: 'forgotAx', say: 'Casi: ese es $u(-x_0)$; olvidaste restar $ax = -ax_0$.' },
          { when: 'wrongSignAx', say: 'Casi: como evalúas en $x = -x_0 < 0$, el término $-ax$ se vuelve $+ax_0$.' }
        ] }),

    N('em-n-convertir-ic-lineal-en-x0', 'errores-metodo', 2, { a: [3, 5, 1], b: [1, 2, 1], c: [2, 4, 1], x0: [2, 3, 1], y0: [1, 2, 1] },
      function (v) { return 'Resuelves una EDO con el cambio $u = ' + v.a + 'x - ' + v.b + 'y + ' + v.c + '$ y llegas a $\\dfrac{1}{2}u^2 = x + C$. Si la condición inicial es $y(' + v.x0 + ') = ' + v.y0 + '$, ¿cuánto vale la constante $C$?'; },
      function (v) { return 0.5 * Math.pow(v.a * v.x0 - v.b * v.y0 + v.c, 2) - v.x0; },
      'Calculando $u_0 = ax_0 - by_0 + c$, se despeja $C = \\frac{1}{2}u_0^2 - x_0$.',
      { mistakes: { usedY0AsU0: function (v) { return 0.5 * v.y0 * v.y0 - v.x0; }, forgotSubX0: function (v) { return 0.5 * Math.pow(v.a * v.x0 - v.b * v.y0 + v.c, 2); } },
        feedback: [
          { when: 'usedY0AsU0', say: 'Casi: sustituiste $y_0$ en lugar de $u_0 = ax_0 - by_0 + c$.' },
          { when: 'forgotSubX0', say: 'Casi: olvidaste restar $x_0$ al despejar $C = \\frac{1}{2}u_0^2 - x_0$.' }
        ] }),

    N('em-n-regreso-parabola-hom', 'errores-metodo', 2, { k: [2, 4, 1], y1: [5, 9, 1], x1: [2, 3, 1] },
      function (v) { return 'Al resolver una ecuación con $y = ux$ se obtiene $u(x) = ' + v.k + 'x + C$. Si la condición inicial es $y(1) = ' + v.y1 + '$, ¿cuánto vale la solución <strong>correcta</strong> $y(x) = x\\,u(x)$ evaluada en $x = ' + v.x1 + '$?'; },
      function (v) { return v.x1 * (v.k * v.x1 + v.y1 - v.k); },
      'En $x = 1$, $u(1) = y_1 = k + C \\Rightarrow C = y_1 - k$, y al multiplicar por $x_1$ resulta $y(x_1) = x_1(kx_1 + y_1 - k)$.',
      { mistakes: { forgotMultX: function (v) { return v.k * v.x1 + v.y1 - v.k; }, usedY1AsC: function (v) { return v.x1 * (v.k * v.x1 + v.y1); } },
        feedback: [
          { when: 'forgotMultX', say: 'Casi: ese es el valor de $u(x_1)$; falta multiplicarlo por $x_1$.' },
          { when: 'usedY1AsC', say: 'Casi: en $x = 1$ tienes $k(1) + C = y_1$, así que $C = y_1 - k$, no $y_1$.' }
        ] }),

    N('em-n-pendiente-campo-comprobar', 'errores-metodo', 2, { a: [1, 3, 1], b: [3, 6, 1], c: [2, 5, 1], x0: [2, 4, 1] },
      function (v) { return 'De una EDO resuelta con el cambio $u = ' + v.a + 'x + y$ se obtiene $u(x) = ' + v.b + 'x^2 + ' + v.c + '$. Al regresar a $y(x) = u(x) - ' + v.a + 'x$, ¿cuánto vale la derivada $y\'(' + v.x0 + ')$?'; },
      function (v) { return 2 * v.b * v.x0 - v.a; },
      'Como $y(x) = bx^2 + c - ax$, su derivada es $y\'(x) = 2bx - a$.',
      { mistakes: { forgotMinusA: function (v) { return 2 * v.b * v.x0; }, plusA: function (v) { return 2 * v.b * v.x0 + v.a; } },
        feedback: [
          { when: 'forgotMinusA', say: 'Casi: esa es $u\'(x_0)$; recuerda que $y\' = u\' - a$.' },
          { when: 'plusA', say: 'Casi: de $y = u - ax$ al derivar queda $-a$, no $+a$.' }
        ] }),

    C('em-ambas-homogenea-y-lineal', 'errores-metodo', 3,
      'La ecuación diferencial $y\' = \\dfrac{x + y}{x}$ (para $x > 0$) contiene la suma $x + y$ en el numerador y puede escribirse como $y\' = 1 + \\dfrac{y}{x}$. ¿Con cuál de los dos cambios de esta sesión se reduce directamente a separable?',
      'Solo con $y = ux$, porque es homogénea de la forma $F(y/x)$ y la $x$ suelta en el denominador impide que dependa solo de $x + y$', [
        ['Solo con $u = x + y$, porque aparece $x + y$ en el numerador', 'Casi: si haces $u = x + y$, queda $u\' - 1 = u/x$, donde aún aparecen $u$ y $x$ mezcladas en una suma.'],
        ['Con cualquiera de los dos cambios queda inmediatamente separable', 'Casi: con $u = x + y$ resulta $u\' = 1 + u/x$, que no es separable en $(u, x)$ sino otra vez homogénea.'],
        ['Con ninguno de los dos, porque ya es directamente de variables separables', 'Casi: $1 + y/x$ es una suma, no un producto $g(x)\\,h(y)$.']],
      'Al dividir el denominador $x$ solo depende de $y/x$; con $y = ux$ queda $u + x\\,u\' = 1 + u \\Rightarrow x\\,u\' = 1$, inmediatamente separable.'),

    N('em-n-error-omitir-u-en-derivada', 'errores-metodo', 3, { k: [2, 5, 1], x1: [2, 3, 1], y1: [2, 4, 1] },
      function (v) { return 'En el PVI homogéneo $x\\,y\' = y + ' + v.k + 'x$ con $y(1) = ' + v.y1 + '$, al usar correctamente $y\' = u + x\\,u\'$ se cancela $u$ y queda $x\\,u\' = ' + v.k + '$, mientras que si alguien escribe por error $y\' = x\\,u\'$ obtiene otra función distinta. Calcula la diferencia $y_{\\text{correcta}}(' + v.x1 + ') - u_{\\text{correcta}}(' + v.x1 + ')$.'; },
      function (v) { return (v.x1 - 1) * (v.k * Math.log(v.x1) + v.y1); },
      'Como $u(x) = k\\ln x + y_1$ y $y(x) = x\\,u(x)$, la diferencia es $y(x_1) - u(x_1) = (x_1 - 1)(k\\ln x_1 + y_1)$.',
      { mistakes: { onlyY: function (v) { return v.x1 * (v.k * Math.log(v.x1) + v.y1); }, onlyU: function (v) { return v.k * Math.log(v.x1) + v.y1; } },
        feedback: [
          { when: 'onlyY', say: 'Casi: ese es $y(x_1)$; la pregunta pide la resta $y(x_1) - u(x_1)$.' },
          { when: 'onlyU', say: 'Casi: ese es $u(x_1)$; falta multiplicarlo por $(x_1 - 1)$.' }
        ] }),

    N('em-n-comparar-dos-sustituciones-constante', 'errores-metodo', 3, { a: [2, 4, 1], b: [2, 3, 1], x0: [1, 2, 1], y0: [2, 4, 1] },
      function (v) { return 'En $y\' = (' + v.a + 'x + ' + v.b + 'y)^2$, un estudiante usa $u = ' + v.a + 'x + ' + v.b + 'y$ y otro usa $w = ' + v.a + 'x + ' + v.b + 'y + 5$. Si la condición inicial es $y(' + v.x0 + ') = ' + v.y0 + '$, ¿cuánto vale la suma $u(' + v.x0 + ') + w(' + v.x0 + ')$ de sus dos condiciones iniciales transformadas?'; },
      function (v) { return 2 * (v.a * v.x0 + v.b * v.y0) + 5; },
      'Como $u(x_0) = ax_0 + by_0$ y $w(x_0) = ax_0 + by_0 + 5$, su suma es $2(ax_0 + by_0) + 5$.',
      { mistakes: { forgotFive: function (v) { return 2 * (v.a * v.x0 + v.b * v.y0); }, usedY0: function (v) { return 2 * v.y0 + 5; } },
        feedback: [
          { when: 'forgotFive', say: 'Casi: olvidaste sumar el $+5$ que incluye la variable $w$.' },
          { when: 'usedY0', say: 'Casi: evaluaste $y_0$ en lugar de la combinación $ax_0 + by_0$.' }
        ] })
  ];

  K.register(SUBTEMAS, Q);
})();
