/* =====================================================================
   Banco · Cálculo 3 · S13 · Coeficientes indeterminados: duplicación (× xˢ)
   y orden superior.
   100 preguntas propias (source: 'propia').
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c3', '13');

  // Como K.C, pero la explicación de un distractor también puede depender de los valores (say(v)).
  function C(id, sub, d, prompt, correct, wrongs, why, o) {
    var q = K.C(id, sub, d, prompt, correct, wrongs, why, o);
    var opts = q.options;
    q.options = function (v) {
      return opts(v).map(function (item) {
        return typeof item.say === 'function' ? Object.assign({}, item, { say: item.say(v) }) : item;
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

  var SUBTEMAS = {
    'c3.S13.regla': 'Regla de duplicación y multiplicidad s',
    'c3.S13.simple': 'Raíz simple exponencial y trigonométrica',
    'c3.S13.doble': 'Raíz doble y multiplicidad s = 2',
    'c3.S13.resonancia': 'Resonancia pura en osciladores',
    'c3.S13.cero': 'Raíz cero y términos polinomiales',
    'c3.S13.superior': 'Ecuaciones de orden superior (n ≥ 3)'
  };

  var Q = [
    /* ======================= 1. Regla de duplicación y multiplicidad s (16) ======================= */
    C('reg-01', 'regla', 1,
      'Al resolver una ecuación lineal con coeficientes constantes $L(y) = g(x)$, ¿cuándo se dice que la propuesta inicial de $y_p$ «choca» o tiene duplicación con la homogénea?',
      'Cuando al menos un término de la propuesta ya es solución de la ecuación homogénea $L(y) = 0$', [
        ['Cuando el grado del polinomio en $g(x)$ supera el orden de la ecuación diferencial', 'Casi: el grado de $g(x)$ puede ser arbitrario sin que haya choque; la duplicación ocurre solo si el término ya resuelve la homogénea.'],
        ['Cuando las raíces de la ecuación característica son números complejos conjugados', 'Casi: las raíces complejas dan senos y cosenos en $y_h$, pero solo chocan si $g(x)$ tiene exactamente esa misma frecuencia.'],
        ['Cuando el coeficiente principal $a_n$ de la ecuación diferencial es negativo', 'Casi: el signo del coeficiente principal no determina si hay choque; lo relevante es si la propuesta anula el operador lineal $L$.']],
      'Si un término de $y_p$ satisface $L(y) = 0$, al sustituirlo en $L(y)$ da $0$ y nunca podrá igualar al término fuente no nulo $g(x)$.'),

    C('reg-02', 'regla', 1,
      'Si un término de la propuesta de coeficientes indeterminados ya pertenece a la solución homogénea $y_h$, ¿qué ocurre si intentas sustituirlo directamente en la ecuación $L(y) = g(x)$?',
      'El lado izquierdo se anula por completo ($L(y_p) = 0$), produciendo una igualdad imposible $0 = g(x)$', [
        ['Se obtiene una ecuación cuadrática para el coeficiente que no tiene soluciones reales', 'Casi: el operador $L$ es lineal, por lo que no genera potencias cuadráticas de los coeficientes indeterminados.'],
        ['El coeficiente indeterminado queda indeterminado con infinitos valores posibles', 'Casi: no quedan infinitos valores, sino que el término se cancela y desaparece el coeficiente, dejando $0 = g(x)$.'],
        ['Aparecen derivadas de orden superior al orden original de la ecuación', 'Casi: al derivar la propuesta solo se evalúan las derivadas hasta el orden de la ecuación original.']],
      'Por definición de solución homogénea, $L(y_h) = 0$; si propones algo en el núcleo de $L$, su imagen es cero y no puede dar $g(x) \\neq 0$.'),

    C('reg-03', 'regla', 1,
      'De acuerdo con la regla de duplicación, si el término fuente $g(x)$ contiene $e^{kx}$ y el número $k$ es raíz del polinomio característico con multiplicidad $s$, ¿por qué factor debe multiplicarse la propuesta ordinaria?',
      'Por $x^s$, donde $s$ es la multiplicidad de la raíz $k$', [
        ['Por $e^{sx}$, sumando $s$ al exponente de la función exponencial', 'Casi: no se modifica el argumento de la exponencial; se multiplica toda la propuesta por una potencia de la variable independiente $x^s$.'],
        ['Por $s\\,x$, multiplicando el coeficiente por la multiplicidad', 'Casi: el factor es la potencia $x^s$; si la raíz es doble ($s=2$), se multiplica por $x^2$, no por $2x$.'],
        ['Por $\\frac{1}{x^s}$, dividiendo entre la potencia de $x$', 'Casi: se multiplica por potencias positivas de $x$ para elevar el orden de derivación respecto al núcleo.']],
      'Al multiplicar por $x^s$, las primeras $s-1$ derivadas siguen cayendo en el núcleo, pero la $s$-ésima derivada produce el término no nulo necesario para igualar a $g(x)$.'),

    C('reg-04', 'regla', 1,
      'Si la propuesta ordinaria para $g(x) = (2x + 1)e^{3x}$ es $(Ax + B)e^{3x}$, y sabemos que $r = 3$ es raíz simple ($s = 1$) del característico, ¿cuál es la forma correcta corregida de $y_p$?',
      '$(Ax^2 + Bx)e^{3x}$', [
        ['$(Ax + Bx)e^{3x}$', 'Casi: $Ax + Bx$ se reduce a una sola constante $(A+B)x$; se debe multiplicar todo el polinomio por $x$, obteniendo $Ax^2 + Bx$.'],
        ['$(Ax + B)xe^{3x} + C$', 'Casi: no se agrega una constante $+C$ suelta a la propuesta de la solución particular.'],
        ['$Ax^2e^{3x} + B$', 'Casi: la potencia de $x$ y la exponencial deben multiplicar a todo el polinomio de coeficientes indeterminados.']],
      'La regla de duplicación exige multiplicar todo el polinomio de la propuesta por $x^s$: $x(Ax + B)e^{3x} = (Ax^2 + Bx)e^{3x}$.'),

    C('reg-05', 'regla', 1,
      'Un estudiante se pregunta: si solo el término $B\\,e^{kx}$ de la propuesta $(Ax + B)e^{kx}$ choca con la homogénea, ¿es correcto multiplicar por $x$ únicamente a la constante $B$?',
      'No; se debe multiplicar toda la propuesta $(Ax + B)$ por $x$, resultando en $(Ax^2 + Bx)e^{kx}$', [
        ['Sí; únicamente el término que produce cero al sustituir debe modificarse para no alterar los demás', 'Casi: si solo multiplicas $B$ por $x$, obtienes $(Ax + Bx)e^{kx} = Cxe^{kx}$, perdiendo un grado de libertad indispensable.'],
        ['No; se debe descartar el método de coeficientes indeterminados y usar variación de parámetros', 'Casi: coeficientes indeterminados sigue siendo plenamente aplicable multiplicando todo el bloque por $x$.'],
        ['Sí; pero cambiando el signo de la constante multiplicada', 'Casi: los signos de las constantes se determinan al igualar coeficientes, no fijándolos de antemano.']],
      'Al derivar un producto con polinomio, los términos de menor grado se mezclan con los de mayor grado; si no multiplicas el bloque entero, faltan coeficientes para cancelar los residuos.'),

    C('reg-06', 'regla', 1,
      'Para la ecuación $y\'\' - 4y\' + 4y = e^{2x}$, el característico es $(r - 2)^2 = 0$. ¿Cuáles son las funciones que forman la base de la solución homogénea $y_h$?',
      '$e^{2x}$ y $x\\,e^{2x}$', [
        ['$e^{2x}$ y $e^{-2x}$', 'Casi: la raíz $r = 2$ es doble; no hay raíz en $-2$.'],
        ['$e^{2x}$ y $x^2e^{2x}$', 'Casi: la base de la homogénea para raíz doble tiene potencias $x^0$ y $x^1$; el término $x^2e^{2x}$ corresponderá a la solución particular $y_p$.'],
        ['$\\cos 2x$ y $\\sin 2x$', 'Casi: las funciones trigonométricas provienen de raíces imaginarias puras $\\pm 2i$, no de la raíz real $r = 2$.']],
      'Para una raíz real repetida $r$ de multiplicidad 2, las dos soluciones linealmente independientes de la homogénea son $e^{rx}$ y $xe^{rx}$.'),

    C('reg-07', 'regla', 1,
      'En la ecuación $y\'\' - 4y\' + 4y = 5e^{2x}$, ¿por qué la propuesta $y_p = Ax\\,e^{2x}$ tampoco funciona?',
      'Porque $x\\,e^{2x}$ también está en $y_h$ al ser $r = 2$ raíz doble', [
        ['Porque el factor $x$ solo se usa si $g(x)$ tiene polinomios', 'Casi: el factor $x^s$ surge de la multiplicidad de la raíz.'],
        ['Porque la constante 5 exige una potencia cúbica', 'Casi: la potencia depende de la multiplicidad $s = 2$.'],
        ['Porque la derivada de $Axe^{2x}$ diverge en el infinito', 'Casi: el motivo es algebraico: $L(Axe^{2x}) = 0$.']],
      'Con raíz doble, tanto $e^{2x}$ como $xe^{2x}$ anulan a $L$; se requiere $Ax^2e^{2x}$.'),

    C('reg-08', 'regla', 1,
      'Cuando el término fuente es una suma como $g(x) = e^{x} + \\cos 2x$, ¿cómo se aplica la duplicación?',
      'Se analiza cada término por separado: si uno choca se multiplica por su propio $x^s$', [
        ['Se multiplica toda la suma completa por la misma potencia de $x$', 'Casi: cada sumando responde a raíces distintas.'],
        ['El método de coeficientes indeterminados queda invalidado', 'Casi: por superposición lineal se suman las propuestas particulares.'],
        ['Se descarta el término que choca de la solución final', 'Casi: no se puede descartar ningún término de $g(x)$.']],
      'Por superposición, cada parte se multiplica solo por el $x^s$ que le corresponde.'),

    C('reg-09', 'regla', 1,
      '¿Qué ocurre si multiplicas una propuesta por $x$ cuando el término fuente NO choca con $y_h$?',
      'Aparecen términos residuales en $x$ que hacen imposible igualar coeficientes', [
        ['Se obtiene una solución con una constante arbitraria válida', 'Casi: una solución particular no lleva constantes libres.'],
        ['La solución sigue siendo correcta pero de grado mayor', 'Casi: los coeficientes se ven forzados a cero.'],
        ['La ecuación se vuelve no lineal', 'Casi: la linealidad de la EDO no cambia.']],
      'Si $s = 0$, multiplicar por $x$ crea potencias que no se cancelan y el sistema no tiene solución.'),

    C('reg-10', 'regla', 1,
      'En $y\'\' + 9y = 4\\cos 3x$, el característico es $r^2 + 9 = 0$. ¿Cuál es la multiplicidad $s$ asociada a $+3i$?',
      '$s = 1$, porque $+3i$ es raíz simple del polinomio $r^2 + 9 = (r - 3i)(r + 3i)$', [
        ['$s = 2$, porque el par conjugado $\\pm 3i$ aporta dos raíces', 'Casi: cada raíz individual tiene multiplicidad algebraica 1.'],
        ['$s = 0$, porque la frecuencia no es un número real', 'Casi: las raíces complejas también entran en la regla.'],
        ['$s = 3$, por la frecuencia angular del coseno', 'Casi: 3 es la frecuencia, no la multiplicidad.']],
      'La raíz $3i$ es simple en $r^2 + 9 = 0$; por ello la propuesta se multiplica por $x^1 = x$.'),

    N('reg-11', 'regla', 2, { k: [2, 6, 1], c: [2, 8, 2] },
      function (v) { return 'Para la ecuación diferencial $y\'\' - ' + (2 * v.k) + 'y\' + ' + (v.k * v.k) + 'y = ' + v.c + 'e^{' + v.k + 'x}$, la propuesta ordinaria $Ae^{' + v.k + 'x}$ debe multiplicarse por $x^s$. ¿Cuánto vale el exponente entero $s$?'; },
      function (v) { return 2; },
      'El característico es $(r - k)^2 = 0$, con raíz $r = k$ de multiplicidad 2; se multiplica por $x^2$, luego $s = 2$.',
      { mistakes: {
          simple: function (v) { return 1; },
          none: function (v) { return 0; }
        },
        feedback: [
          { when: 'simple', say: 'Casi: $r = k$ es raíz doble de $(r - k)^2 = 0$, por lo que $s = 2$.' },
          { when: 'none', say: 'Casi: la exponencial $e^{kx}$ ya está en $y_h$; hay duplicación.' }
        ] }),

    N('reg-12', 'regla', 2, { a: [1, 4, 1], b: [5, 8, 1], c: [2, 6, 1] },
      function (v) { return 'En la ecuación diferencial $y\'\' - ' + (v.a + v.b) + 'y\' + ' + (v.a * v.b) + 'y = ' + v.c + 'e^{' + v.a + 'x}$, determina el exponente entero $s$ en el factor $x^s$ necesario para proponer $y_p$.'; },
      function (v) { return 1; },
      'Como $a \\neq b$, $r = a$ es raíz simple de $(r - a)(r - b) = 0$, de modo que $s = 1$.',
      { mistakes: {
          double: function (v) { return 2; },
          none: function (v) { return 0; }
        },
        feedback: [
          { when: 'double', say: 'Casi: las raíces son distintas ($a \\neq b$), así que $s = 1$.' },
          { when: 'none', say: 'Casi: $r = a$ es raíz del característico; hay duplicación.' }
        ] }),

    N('reg-13', 'regla', 2, { w: [2, 7, 1], c: [3, 9, 3] },
      function (v) { return 'Para el oscilador armónico sin fricción $y\'\' + ' + (v.w * v.w) + 'y = ' + v.c + '\\sin(' + v.w + 'x)$, ¿cuál es el valor del exponente $s$ en el factor corrector $x^s$?'; },
      function (v) { return 1; },
      'Las raíces de $r^2 + \\omega^2 = 0$ son $\\pm i\\omega$, ambas simples; por tanto $s = 1$.',
      { mistakes: {
          double: function (v) { return 2; },
          none: function (v) { return 0; }
        },
        feedback: [
          { when: 'double', say: 'Casi: las raíces $\\pm i\\omega$ son simples, no repetidas.' },
          { when: 'none', say: 'Casi: $\\sin(\\omega x)$ ya está en $y_h$, por lo que $s > 0$.' }
        ] }),

    N('reg-14', 'regla', 2, { k: [4, 7, 1], c: [2, 8, 2] },
      function (v) { return 'Considera la ecuación diferencial $y\'\' - 5y\' + 6y = ' + v.c + 'e^{' + v.k + 'x}$. Si la forma de la solución particular se escribe como $x^s(A e^{' + v.k + 'x})$, ¿cuál es el valor de $s$?'; },
      function (v) { return 0; },
      'Las raíces de $r^2 - 5r + 6 = 0$ son 2 y 3. Como $k \\ge 4$, $k$ no es raíz y no hay choque: $s = 0$.',
      { mistakes: {
          one: function (v) { return 1; },
          two: function (v) { return 2; }
        },
        feedback: [
          { when: 'one', say: 'Casi: las raíces son 2 y 3; $k$ no es raíz, por lo que $s = 0$.' },
          { when: 'two', say: 'Casi: no hay duplicación con la homogénea.' }
        ] }),

    N('reg-15', 'regla', 2, { c: [2, 10, 2] },
      function (v) { return 'Para la ecuación diferencial de tercer orden $y\'\'\' - 3y\'\' + 3y\' - y = ' + v.c + 'e^{x}$, la propuesta $Ae^{x}$ debe multiplicarse por $x^s$. ¿Cuánto vale $s$?'; },
      function (v) { return 3; },
      'El polinomio característico es $(r - 1)^3 = 0$, cuya raíz $r = 1$ tiene multiplicidad 3; así $s = 3$.',
      { mistakes: {
          one: function (v) { return 1; },
          two: function (v) { return 2; }
        },
        feedback: [
          { when: 'one', say: 'Casi: $r = 1$ tiene multiplicidad 3 en $(r - 1)^3 = 0$.' },
          { when: 'two', say: 'Casi: la factorización es cúbica $(r - 1)^3$, luego $s = 3$.' }
        ] }),

    N('reg-16', 'regla', 3, { c: [3, 9, 3] },
      function (v) { return 'En la ecuación de cuarto orden $y^{(4)} - 2y\'\' + y = ' + v.c + 'e^{x}$, ¿cuál es el exponente $s$ del factor corrector $x^s$ para $y_p = A x^s e^{x}$?'; },
      function (v) { return 2; },
      'La factorización es $(r^2 - 1)^2 = (r - 1)^2(r + 1)^2 = 0$. La raíz $r = 1$ es doble ($s = 2$).',
      { mistakes: {
          one: function (v) { return 1; },
          four: function (v) { return 4; }
        },
        feedback: [
          { when: 'one', say: 'Casi: en $(r^2 - 1)^2 = 0$ la raíz $r = 1$ tiene multiplicidad 2.' },
          { when: 'four', say: 'Casi: 4 es el orden de la ecuación, pero la raíz $r = 1$ es doble.' }
        ] }),

    /* ======================= 2. Raíz simple exponencial y trigonométrica (20) ======================= */
    C('smp-01', 'simple', 1,
      'Para la ecuación $y\'\' - 3y\' + 2y = 4e^{x}$, cuyas raíces homogéneas son $r_1 = 1$ y $r_2 = 2$, ¿cuál es la forma correcta de $y_p$?',
      '$y_p = A\\,x\\,e^{x}$', [
        ['$y_p = A\\,e^{x}$', 'Casi: $e^x$ está en $y_h$, daría 0 al sustituir.'],
        ['$y_p = A\\,x^2e^{x}$', 'Casi: $r = 1$ es raíz simple, no doble.'],
        ['$y_p = (Ax + B)e^{2x}$', 'Casi: el término fuente lleva $e^x$, no $e^{2x}$.']],
      'Como $k = 1$ es raíz simple de $(r - 1)(r - 2) = 0$, la propuesta $Ae^x$ se multiplica por $x^1$.'),

    C('smp-02', 'simple', 1,
      'Al derivar $y_p = A\\,x\\,e^{kx}$, ¿cuál es la expresión correcta para su primera derivada $y_p\'$?',
      '$y_p\' = A(1 + kx)e^{kx}$', [
        ['$y_p\' = A\\,k\\,e^{kx}$', 'Casi: por la regla del producto la derivada de $x$ es 1.'],
        ['$y_p\' = A(x + k)e^{kx}$', 'Casi: la derivada es $(x)\'e^{kx} + x(e^{kx})\' = (1 + kx)e^{kx}$.'],
        ['$y_p\' = A\\,k\\,x\\,e^{kx}$', 'Casi: olvidaste sumar la derivada de $x$.']],
      'Aplicando la regla del producto resulta $y_p\' = A(e^{kx} + kxe^{kx}) = A(1 + kx)e^{kx}$.'),

    C('smp-03', 'simple', 1,
      'Al sustituir $y_p = A\\,x\\,e^{r_1 x}$ en $y\'\' - (r_1 + r_2)y\' + r_1 r_2 y = c\\,e^{r_1 x}$ con $r_1 \\neq r_2$, ¿qué ocurre con los términos en $x$?',
      'Se cancelan mutuamente debido a que $r_1$ es raíz del polinomio característico', [
        ['Permanecen sin cancelarse, obligando a igualar $x = 0$', 'Casi: la igualdad debe cumplirse para todo $x$.'],
        ['Se suman para formar un término con $x^2$', 'Casi: el operador lineal no eleva el grado en $x$.'],
        ['Se convierten en senos y cosenos', 'Casi: las raíces son reales, no surgen términos trigonométricos.']],
      'El coeficiente de $x e^{r_1 x}$ es $P(r_1) = 0$, por lo que se anula algebraicamente.'),

    C('smp-04', 'simple', 1,
      'En una ecuación de segundo orden con raíces $r_1 \\neq r_2$, la fórmula directa para el coeficiente $A$ en $y_p = A\\,x\\,e^{r_1 x}$ al resolver $y\'\' - (r_1+r_2)y\' + r_1 r_2 y = c\\,e^{r_1 x}$ es:',
      '$A = \\dfrac{c}{r_1 - r_2}$', [
        ['$A = \\dfrac{c}{r_1 + r_2}$', 'Casi: en el divisor va la diferencia $P\'(r_1) = r_1 - r_2$, no la suma.'],
        ['$A = \\dfrac{c}{2r_1}$', 'Casi: la derivada de $(r - r_1)(r - r_2)$ en $r_1$ es $r_1 - r_2$.'],
        ['$A = \\dfrac{c}{r_1 r_2}$', 'Casi: el producto de las raíces es el término independiente.']],
      'Como $L(x e^{r_1 x}) = P\'(r_1) e^{r_1 x} = (r_1 - r_2) e^{r_1 x}$, al igualar a $c e^{r_1 x}$ da $A = c/(r_1 - r_2)$.'),

    C('smp-05', 'simple', 1,
      'Para la ecuación $y\'\' - y = 6e^{-x}$, las raíces del característico son $1$ y $-1$. ¿Cuál es el coeficiente $A$ en $y_p = Ax\\,e^{-x}$?',
      '$A = -3$', [
        ['$A = 3$', 'Casi: con $r_1 = -1$ y $r_2 = 1$, $r_1 - r_2 = -2$, dando $6/(-2) = -3$.'],
        ['$A = -6$', 'Casi: al derivar queda un factor de $-2$, luego $A = 6/(-2) = -3$.'],
        ['$A = 6$', 'Casi: olvidaste el signo menos en el denominador.']],
      'Aquí $r_1 = -1$ y $r_2 = 1$. Por ende $A = 6 / (-1 - 1) = 6 / (-2) = -3$.'),

    N('smp-06', 'simple', 2, { a: [2, 5, 1], b: [-4, -1, 1], c: [6, 18, 2] },
      function (v) { return 'Calcula el coeficiente $A$ de la solución particular $y_p = Ax\\,e^{' + v.a + 'x}$ para la ecuación diferencial $y\'\'' + (-(v.a + v.b) === 0 ? '' : (-(v.a + v.b) < 0 ? ' - ' + (v.a + v.b) : ' + ' + (-(v.a + v.b))) + 'y\'') + (v.a * v.b < 0 ? ' - ' + (-v.a * v.b) : ' + ' + (v.a * v.b)) + 'y = ' + v.c + 'e^{' + v.a + 'x}$.'; },
      function (v) { return v.c / (v.a - v.b); },
      'Al sustituir queda $A(a - b)e^{ax} = c e^{ax}$, de donde $A = c / (a - b)$.',
      { mistakes: {
          sign: function (v) { return v.c / (v.b - v.a); },
          sum: function (v) { return v.c / (v.a + v.b + 0.1); }
        },
        feedback: [
          { when: 'sign', say: 'Casi: el denominador es $a - b$, que es positivo pues $a > b$.' },
          { when: 'sum', say: 'Casi: se divide entre la diferencia $a - b$, no entre la suma.' }
        ] }),

    N('smp-07', 'simple', 2, { k: [2, 6, 1], c: [8, 24, 4] },
      function (v) { return 'Para la ecuación diferencial hiperbólica $y\'\' - ' + (v.k * v.k) + 'y = ' + v.c + 'e^{' + v.k + 'x}$, halla el coeficiente $A$ de la solución particular $y_p(x) = A\\,x\\,e^{' + v.k + 'x}$.'; },
      function (v) { return v.c / (2 * v.k); },
      'Las raíces son $\\pm k$. Como $k - (-k) = 2k$, $2k A = c \\implies A = c / (2k)$.',
      { mistakes: {
          noTwo: function (v) { return v.c / v.k; },
          sign: function (v) { return -v.c / (2 * v.k); }
        },
        feedback: [
          { when: 'noTwo', say: 'Casi: la derivada de $r^2 - k^2$ en $r = k$ es $2k$; olvidaste el factor 2.' },
          { when: 'sign', say: 'Casi: $r_1 - r_2 = k - (-k) = +2k > 0$.' }
        ] }),

    N('smp-08', 'simple', 2, { a: [4, 7, 1], b: [1, 3, 1], c: [6, 18, 3] },
      function (v) { return 'Determina el valor numérico del coeficiente $A$ para la solución particular $y_p = Ax\\,e^{' + v.b + 'x}$ de la ecuación $y\'\' - ' + (v.a + v.b) + 'y\' + ' + (v.a * v.b) + 'y = ' + v.c + 'e^{' + v.b + 'x}$.'; },
      function (v) { return v.c / (v.b - v.a); },
      'La raíz coincidente es $b$ y la otra es $a$. El coeficiente es $A = c / (b - a)$.',
      { mistakes: {
          sign: function (v) { return v.c / (v.a - v.b); },
          product: function (v) { return v.c / (v.a * v.b); }
        },
        feedback: [
          { when: 'sign', say: 'Casi: como $b < a$, el denominador $b - a$ es negativo.' },
          { when: 'product', say: 'Casi: se divide entre $P\'(b) = b - a$, no entre el producto $ab$.' }
        ] }),

    N('smp-09', 'simple', 2, { c: [2, 6, 1] },
      function (v) { return 'Dada la ecuación $y\'\' - 3y\' + 2y = ' + v.c + 'e^{x}$, encuentra la solución particular $y_p(x)$ y calcula su valor numérico evaluado en $x = 1$.'; },
      function (v) { return -v.c * Math.E; },
      'Las raíces son 1 y 2, por lo que $A = c/(1 - 2) = -c$. Así $y_p(1) = -c e$.',
      { mistakes: {
          sign: function (v) { return v.c * Math.E; },
          noE: function (v) { return -v.c; }
        },
        feedback: [
          { when: 'sign', say: 'Casi: como $A = c/(1 - 2) = -c$, la solución particular lleva signo negativo.' },
          { when: 'noE', say: 'Casi: olvidaste multiplicar por la exponencial $e^1 \\approx 2.718$.' }
        ] }),

    N('smp-10', 'simple', 2, { k: [2, 4, 1], c: [3, 9, 3] },
      function (v) { return 'Para la ecuación diferencial $y\'\' - ' + (v.k + 1) + 'y\' + ' + v.k + 'y = ' + v.c + 'e^{' + v.k + 'x}$, calcula la derivada de la solución particular evaluada en $x = 1$, es decir $y_p\'(1)$.'; },
      function (v) { var A = v.c / (v.k - 1); return A * (1 + v.k) * Math.exp(v.k); },
      'Como $A = c/(k-1)$ y $y_p\'(x) = A(1 + kx)e^{kx}$, evaluando en $x=1$ queda $A(1 + k)e^k$.',
      { mistakes: {
          noProd: function (v) { var A = v.c / (v.k - 1); return A * v.k * Math.exp(v.k); },
          sign: function (v) { var A = -v.c / (v.k - 1); return A * (1 + v.k) * Math.exp(v.k); }
        },
        feedback: [
          { when: 'noProd', say: 'Casi: al derivar $xe^{kx}$ por regla del producto queda $(1 + kx)e^{kx}$.' },
          { when: 'sign', say: 'Casi: el coeficiente $A = c/(k - 1)$ es positivo para $k > 1$.' }
        ] }),

    N('smp-11', 'simple', 2, { c: [4, 16, 2] },
      function (v) { return 'Encuentra el coeficiente $A$ de la propuesta $y_p = Ax\\,e^{-x}$ para la ecuación diferencial $y\'\' + 4y\' + 3y = ' + v.c + 'e^{-x}$.'; },
      function (v) { return v.c / 2; },
      'Evaluando $P\'(-1) = 2(-1) + 4 = 2$, se obtiene $2A = c \\implies A = c/2$.',
      { mistakes: {
          neg: function (v) { return -v.c / 2; },
          div4: function (v) { return v.c / 4; }
        },
        feedback: [
          { when: 'neg', say: 'Casi: $r_1 - r_2 = -1 - (-3) = +2$, por lo que $A > 0$.' },
          { when: 'div4', say: 'Casi: el divisor es $P\'(-1) = 2$, no el coeficiente 4.' }
        ] }),

    N('smp-12', 'simple', 2, { c: [8, 28, 4] },
      function (v) { return 'Para la ecuación diferencial $y\'\' - 4y = ' + v.c + 'e^{2x}$, ¿cuánto vale la constante $A$ en la solución particular $y_p = Ax\\,e^{2x}$?'; },
      function (v) { return v.c / 4; },
      'Sustituyendo $y_p\'\' - 4y_p = 4Ae^{2x} = c e^{2x}$, se despeja $A = c/4$.',
      { mistakes: {
          div2: function (v) { return v.c / 2; },
          sign: function (v) { return -v.c / 4; }
        },
        feedback: [
          { when: 'div2', say: 'Casi: al sustituir queda $4Ae^{2x}$, así que se divide entre 4.' },
          { when: 'sign', say: 'Casi: la derivada del característico $2r$ en $r=2$ es $+4$.' }
        ] }),

    N('smp-13', 'simple', 2, { c: [6, 36, 6] },
      function (v) { return 'Determina el valor de $A$ en la solución particular $y_p(x) = Ax\\,e^{-3x}$ correspondiente a la ecuación $y\'\' - 9y = ' + v.c + 'e^{-3x}$.'; },
      function (v) { return -v.c / 6; },
      'Como $P(r) = r^2 - 9$, tenemos $P\'(-3) = -6$. Por tanto $-6A = c \\implies A = -c/6$.',
      { mistakes: {
          pos: function (v) { return v.c / 6; },
          div9: function (v) { return -v.c / 9; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: en $r = -3$, la derivada del característico es $-6$, dando signo negativo.' },
          { when: 'div9', say: 'Casi: el factor que divide a $c$ es $P\'(-3) = -6$, no el término 9.' }
        ] }),

    N('smp-14', 'simple', 2, { c: [9, 27, 3] },
      function (v) { return 'Para la ecuación $y\'\' - 5y\' + 4y = ' + v.c + 'e^{4x}$, calcula el coeficiente $A$ de la propuesta particular $y_p = Ax\\,e^{4x}$.'; },
      function (v) { return v.c / 3; },
      'Las raíces son 1 y 4. Al sustituir, $P\'(4) = 2(4) - 5 = 3$, por lo que $A = c/3$.',
      { mistakes: {
          div5: function (v) { return v.c / 5; },
          sign: function (v) { return -v.c / 3; }
        },
        feedback: [
          { when: 'div5', say: 'Casi: el divisor es $P\'(4) = 3$, no el coeficiente 5.' },
          { when: 'sign', say: 'Casi: $2(4) - 5 = +3 > 0$, el resultado es positivo.' }
        ] }),

    N('smp-15', 'simple', 2, { c: [7, 35, 7] },
      function (v) { return 'Halla el valor del coeficiente $A$ para la solución particular $y_p = Ax\\,e^{5x}$ de la ecuación $y\'\' - 3y\' - 10y = ' + v.c + 'e^{5x}$.'; },
      function (v) { return v.c / 7; },
      'Las raíces son $-2$ y $5$. Como $r_1 - r_2 = 5 - (-2) = 7$, se tiene $A = c/7$.',
      { mistakes: {
          div10: function (v) { return v.c / 10; },
          sign: function (v) { return -v.c / 7; }
        },
        feedback: [
          { when: 'div10', say: 'Casi: se divide entre $P\'(5) = 7$, no entre 10.' },
          { when: 'sign', say: 'Casi: $P\'(5) = 7$ es positivo.' }
        ] }),

    N('smp-16', 'simple', 2, { c: [4, 20, 2] },
      function (v) { return 'Encuentra el coeficiente $A$ de $y_p = Ax\\,e^{-2x}$ para la ecuación $y\'\' + 6y\' + 8y = ' + v.c + 'e^{-2x}$.'; },
      function (v) { return v.c / 2; },
      'La otra raíz es $-4$. Así $r_1 - r_2 = -2 - (-4) = 2$, dando $A = c/2$.',
      { mistakes: {
          div6: function (v) { return v.c / 6; },
          sign: function (v) { return -v.c / 2; }
        },
        feedback: [
          { when: 'div6', say: 'Casi: el factor es $P\'(-2) = 2(-2) + 6 = 2$, no 6.' },
          { when: 'sign', say: 'Casi: $2(-2) + 6 = +2$, por lo que $A > 0$.' }
        ] }),

    N('smp-17', 'simple', 3, { y0: [1, 3, 1], yp0: [1, 5, 1] },
      function (v) { return 'La solución general del PVI $y\'\' - 3y\' + 2y = 4e^{x}$ con $y(0) = ' + v.y0 + '$, $y\'(0) = ' + v.yp0 + '$ es $y(x) = c_1 e^x + c_2 e^{2x} - 4x\\,e^x$. ¿Cuánto vale $c_2$?'; },
      function (v) { return v.yp0 + 4 - v.y0; },
      'De $y(0) = c_1 + c_2 = y_0$ y $y\'(0) = c_1 + 2c_2 - 4 = y\'_0$, restando queda $c_2 = y\'_0 + 4 - y_0$.',
      { mistakes: {
          noShift: function (v) { return v.yp0 - v.y0; },
          signShift: function (v) { return v.yp0 - 4 - v.y0; }
        },
        feedback: [
          { when: 'noShift', say: 'Casi: $y_p\'(0) = -4$, lo que altera el sistema de condiciones iniciales.' },
          { when: 'signShift', say: 'Casi: como $y_p\'(0) = -4$, al pasar sumando da $c_1 + 2c_2 = y\'(0) + 4$.' }
        ] }),

    N('smp-18', 'simple', 3, { y0: [5, 8, 1], yp0: [1, 4, 1] },
      function (v) { return 'Para el mismo problema $y\'\' - 3y\' + 2y = 4e^{x}$ con $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + v.yp0 + '$, calcula la constante $c_1$ en $y(x) = c_1 e^x + c_2 e^{2x} - 4x\\,e^x$.'; },
      function (v) { return 2 * v.y0 - v.yp0 - 4; },
      'Sustituyendo $c_2 = y\'_0 + 4 - y_0$ en $c_1 = y_0 - c_2$ se obtiene $c_1 = 2y_0 - y\'_0 - 4$.',
      { mistakes: {
          noFour: function (v) { return 2 * v.y0 - v.yp0; },
          sign: function (v) { return 2 * v.y0 - v.yp0 + 4; }
        },
        feedback: [
          { when: 'noFour', say: 'Casi: incorpora la contribución $y_p\'(0) = -4$ al despejar $c_1$.' },
          { when: 'sign', say: 'Casi: revisa los signos al sustituir $c_2$ en $c_1 = y_0 - c_2$.' }
        ] }),

    N('smp-19', 'simple', 3, { c: [8, 24, 4] },
      function (v) { return 'Para la ecuación $y\'\' - 4y\' + 3y = ' + v.c + 'x\\,e^{3x}$, donde $r = 3$ es raíz simple, la propuesta es $y_p = (Ax^2 + Bx)e^{3x}$. Calcula el coeficiente principal $A$.'; },
      function (v) { return v.c / 4; },
      'Al sustituir, $L((Ax^2+Bx)e^{3x}) = [2(3 - 1)Ax + \\dots]e^{3x} = 4Ax e^{3x}$. Así $A = c/4$.',
      { mistakes: {
          noTwo: function (v) { return v.c / 2; },
          raw: function (v) { return v.c; }
        },
        feedback: [
          { when: 'noTwo', say: 'Casi: al derivar $x^2$ aparece un factor 2, dando $2(a - b)A = 4A = c$.' },
          { when: 'raw', say: 'Casi: debes dividir entre 4.' }
        ] }),

    N('smp-20', 'simple', 3, { c: [9, 36, 9] },
      function (v) { return 'Para la ecuación $y\'\' - 5y\' + 4y = ' + v.c + 'x\\,e^{4x}$, cuya solución es $y_p = (Ax^2 + Bx)e^{4x}$, calcula el coeficiente lineal $B$.'; },
      function (v) { return -v.c / 9; },
      'Como $L(u e^{4x}) = [6Ax + (2A + 3B)]e^{4x}$, igualando el término constante da $B = -2A/3 = -c/9$.',
      { mistakes: {
          pos: function (v) { return v.c / 9; },
          div6: function (v) { return -v.c / 6; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: $2A + 3B = 0$ obliga a que $B$ tenga signo opuesto a $A$.' },
          { when: 'div6', say: 'Casi: $B = -2A/3 = -2(c/6)/3 = -c/9$, no $-c/6$.' }
        ] }),

    /* ======================= 3. Raíz doble y multiplicidad s = 2 (16) ======================= */
    C('dob-01', 'doble', 1,
      'En la ecuación $y\'\' - 6y\' + 9y = 4e^{3x}$, el característico es $(r - 3)^2 = 0$. ¿Por qué la propuesta para $y_p$ lleva $x^2$ y no solo $x$?',
      'Porque tanto $e^{3x}$ como $x\\,e^{3x}$ ya son soluciones de la ecuación homogénea', [
        ['Porque el coeficiente 9 es el cuadrado de 3', 'Casi: el factor $x^2$ proviene de que $r = 3$ es raíz doble ($s = 2$).'],
        ['Porque al haber una sola raíz real la solución debe ser cuadrática', 'Casi: si la raíz fuera simple bastaría $x^1$; se debe a la multiplicidad 2.'],
        ['Porque toda ecuación de segundo orden exige $x^2$', 'Casi: solo se usa $x^2$ cuando la raíz del término fuente es doble.']],
      'La base homogénea para raíz doble es $\\{e^{rx}, xe^{rx}\\}$. Ambas anulan a $L$, por lo que se requiere $x^2$.'),

    C('dob-02', 'doble', 1,
      'Para el operador $L = (D - r)^2$, ¿cuál es la identidad que simplifica el cálculo de $L(u(x)\\,e^{rx})$ cuando $r$ es raíz doble?',
      '$L(u(x)\\,e^{rx}) = u\'\'(x)\\,e^{rx}$', [
        ['$L(u(x)\\,e^{rx}) = 2u\'(x)\\,e^{rx}$', 'Casi: con raíz doble el término con $u\'$ se anula; sobrevive solo $u\'\'$.'],
        ['$L(u(x)\\,e^{rx}) = (u\'\'(x) + r^2 u(x))\\,e^{rx}$', 'Casi: por desplazamiento $(D - r)^2(u e^{rx}) = u\'\' e^{rx}$.'],
        ['$L(u(x)\\,e^{rx}) = r^2 u\'\'(x)\\,e^{rx}$', 'Casi: el coeficiente de $u\'\'$ es exactamente 1.']],
      'Por la regla de desplazamiento exponencial, $(D - r)^2(u e^{rx}) = e^{rx} D^2(u) = u\'\' e^{rx}$.'),

    C('dob-03', 'doble', 1,
      'Al sustituir $y_p = A\\,x^2\\,e^{rx}$ en la ecuación con raíz doble $y\'\' - 2ry\' + r^2y = c\\,e^{rx}$, ¿a qué igualdad se reduce el cálculo?',
      '$2A = c$, de donde $A = \\dfrac{c}{2}$', [
        ['$A = c$, porque los términos se cancelan directamente', 'Casi: la segunda derivada de $x^2$ es 2, luego $2A = c$.'],
        ['$r^2 A = c$, dividiendo entre el término constante', 'Casi: el término $r^2$ se cancela con las derivadas.'],
        ['$4A = c$, multiplicando la multiplicidad por el orden', 'Casi: la derivada segunda de $x^2$ es 2, no 4.']],
      'Con $u = A x^2$, $u\'\' = 2A$. Como $L(u e^{rx}) = u\'\' e^{rx}$, queda $2A e^{rx} = c e^{rx} \\implies A = c/2$.'),

    C('dob-04', 'doble', 1,
      'Si la ecuación es $y\'\' + 2y\' + y = 3e^{-x}$, el característico es $(r + 1)^2 = 0$. ¿Cuál es la solución particular $y_p(x)$?',
      '$y_p(x) = \\dfrac{3}{2}x^2e^{-x}$', [
        ['$y_p(x) = 3x^2e^{-x}$', 'Casi: olvidaste dividir entre 2 proveniente de la segunda derivada de $x^2$.'],
        ['$y_p(x) = \\dfrac{3}{2}xe^{-x}$', 'Casi: $xe^{-x}$ está en $y_h$; para raíz doble va $x^2$.'],
        ['$y_p(x) = -\\dfrac{3}{2}x^2e^{-x}$', 'Casi: el factor $u\'\' = 2A$ es positivo; no hay cambio de signo.']],
      'La raíz $r = -1$ es doble ($s = 2$). Proponiendo $A x^2 e^{-x}$ da $2A = 3 \\implies A = 3/2$.'),

    N('dob-05', 'doble', 2, { r: [2, 5, 1], c: [4, 16, 2] },
      function (v) { return 'Para la ecuación diferencial con raíz doble $y\'\' - ' + (2 * v.r) + 'y\' + ' + (v.r * v.r) + 'y = ' + v.c + 'e^{' + v.r + 'x}$, calcula el coeficiente $A$ en $y_p = A x^2 e^{' + v.r + 'x}$.'; },
      function (v) { return v.c / 2; },
      'Como $L(A x^2 e^{rx}) = 2A e^{rx}$, igualando a $c e^{rx}$ da siempre $A = c/2$.',
      { mistakes: {
          raw: function (v) { return v.c; },
          div4: function (v) { return v.c / 4; }
        },
        feedback: [
          { when: 'raw', say: 'Casi: al sustituir queda $2A e^{rx} = c e^{rx}$, luego $A = c/2$.' },
          { when: 'div4', say: 'Casi: la segunda derivada de $x^2$ es 2, no 4.' }
        ] }),

    N('dob-06', 'doble', 2, { k: [2, 5, 1], c: [6, 18, 2] },
      function (v) { return 'En la ecuación $y\'\' + ' + (2 * v.k) + 'y\' + ' + (v.k * v.k) + 'y = ' + v.c + 'e^{-' + v.k + 'x}$, halla el coeficiente $A$ de $y_p = A x^2 e^{-' + v.k + 'x}$.'; },
      function (v) { return v.c / 2; },
      'El característico es $(r + k)^2 = 0$. La identidad $L(Ax^2 e^{-kx}) = 2A e^{-kx}$ da $A = c/2$.',
      { mistakes: {
          neg: function (v) { return -v.c / 2; },
          raw: function (v) { return v.c; }
        },
        feedback: [
          { when: 'neg', say: 'Casi: $(Ax^2)\'\' = 2A > 0$; el signo de la raíz no cambia $2A = c$.' },
          { when: 'raw', say: 'Casi: debes dividir entre 2.' }
        ] }),

    N('dob-07', 'doble', 2, { c: [2, 10, 2] },
      function (v) { return 'Dada la ecuación $y\'\' - 2y\' + y = ' + v.c + 'e^{x}$, determina el valor de la solución particular evaluada en $x = 1$, esto es $y_p(1)$.'; },
      function (v) { return (v.c / 2) * Math.E; },
      'Como $y_p(x) = (c/2) x^2 e^x$, evaluando en $x=1$ se obtiene $(c/2) e$.',
      { mistakes: {
          noE: function (v) { return v.c / 2; },
          double: function (v) { return v.c * Math.E; }
        },
        feedback: [
          { when: 'noE', say: 'Casi: olvidaste multiplicar por $e^1 \\approx 2.718$.' },
          { when: 'double', say: 'Casi: recuerda que $A = c/2$, no $c$.' }
        ] }),

    N('dob-08', 'doble', 2, { c: [2, 8, 2] },
      function (v) { return 'Para la ecuación $y\'\' - 2y\' + y = ' + v.c + 'e^{x}$, calcula la segunda derivada de la solución particular evaluada en $x = 1$, es decir $y_p\'\'(1)$.'; },
      function (v) { return (7 * v.c / 2) * Math.E; },
      'Derivando $y_p = A x^2 e^x$ dos veces se tiene $y_p\'\'(1) = A(2 + 4(1) + 1^2)e = 7Ae = (7c/2)e$.',
      { mistakes: {
          noSeven: function (v) { return (v.c / 2) * Math.E; },
          twoA: function (v) { return v.c * Math.E; }
        },
        feedback: [
          { when: 'noSeven', say: 'Casi: al derivar $x^2 e^x$ dos veces y evaluar en $x=1$ queda $(2 + 4 + 1)e = 7e$.' },
          { when: 'twoA', say: 'Casi: en $x=1$ los términos con $x$ y $x^2$ no se anulan.' }
        ] }),

    N('dob-09', 'doble', 2, { c: [1, 5, 1] },
      function (v) { return 'Para la ecuación diferencial $y\'\' - 4y\' + 4y = ' + v.c + 'e^{2x}$, calcula el valor numérico de la solución particular evaluada en $x = 2$.'; },
      function (v) { return 2 * v.c * Math.exp(4); },
      'Como $y_p(x) = (c/2) x^2 e^{2x}$, en $x=2$ se obtiene $(c/2)(4)e^4 = 2c e^4$.',
      { mistakes: {
          noFour: function (v) { return (v.c / 2) * Math.exp(4); },
          half: function (v) { return v.c * Math.exp(4); }
        },
        feedback: [
          { when: 'noFour', say: 'Casi: en $x=2$, el factor $x^2$ vale $2^2 = 4$, luego $(c/2)(4) = 2c$.' },
          { when: 'half', say: 'Casi: $(c/2) \\cdot 4 = 2c$, no $c$.' }
        ] }),

    N('dob-10', 'doble', 2, { c: [4, 16, 2] },
      function (v) { return 'Para la ecuación $y\'\' + 2y\' + y = ' + v.c + 'e^{-x}$, calcula el valor de la solución particular en $x = 1$.'; },
      function (v) { return (v.c / 2) * Math.exp(-1); },
      'La solución particular es $y_p(x) = (c/2) x^2 e^{-x}$. En $x=1$ vale $(c/2)e^{-1}$.',
      { mistakes: {
          posExp: function (v) { return (v.c / 2) * Math.exp(1); },
          raw: function (v) { return v.c * Math.exp(-1); }
        },
        feedback: [
          { when: 'posExp', say: 'Casi: la exponencial es $e^{-x}$, así que en $x=1$ es $e^{-1} = 1/e$.' },
          { when: 'raw', say: 'Casi: recuerda que el coeficiente es $A = c/2$.' }
        ] }),

    N('dob-11', 'doble', 2, { c: [2, 8, 2] },
      function (v) { return 'Para la ecuación $y\'\' - 6y\' + 9y = ' + v.c + 'e^{3x}$, determina el valor de la primera derivada de la solución particular evaluada en $x = 1$, es decir $y_p\'(1)$.'; },
      function (v) { return (5 * v.c / 2) * Math.exp(3); },
      'Derivando $y_p(x) = (c/2)x^2 e^{3x}$ resulta $y_p\'(1) = (c/2)(2 + 3)e^3 = (5c/2)e^3$.',
      { mistakes: {
          noFive: function (v) { return (v.c / 2) * Math.exp(3); },
          noHalf: function (v) { return 5 * v.c * Math.exp(3); }
        },
        feedback: [
          { when: 'noFive', say: 'Casi: la derivada de $x^2 e^{3x}$ en $x=1$ es $(2 + 3)e^3 = 5e^3$.' },
          { when: 'noHalf', say: 'Casi: el coeficiente de la propuesta es $A = c/2$.' }
        ] }),

    N('dob-12', 'doble', 2, { c: [10, 30, 2] },
      function (v) { return 'Calcula el coeficiente $A$ de la propuesta $y_p = Ax^2e^{4x}$ para la ecuación diferencial $y\'\' - 8y\' + 16y = ' + v.c + 'e^{4x}$.'; },
      function (v) { return v.c / 2; },
      'La raíz $r = 4$ es doble. Al sustituir, $(Ax^2)\'\' = 2A = c \\implies A = c/2$.',
      { mistakes: {
          raw: function (v) { return v.c; },
          div4: function (v) { return v.c / 4; }
        },
        feedback: [
          { when: 'raw', say: 'Casi: al sustituir queda $2A = c$, por lo que $A = c/2$.' },
          { when: 'div4', say: 'Casi: se divide entre 2, que es la segunda derivada de $x^2$.' }
        ] }),

    N('dob-13', 'doble', 2, { c: [8, 24, 4] },
      function (v) { return 'Para la ecuación diferencial $y\'\' + 6y\' + 9y = ' + v.c + 'e^{-3x}$, determina el coeficiente $A$ de la solución particular $y_p = Ax^2e^{-3x}$.'; },
      function (v) { return v.c / 2; },
      'Como $(r + 3)^2 = 0$, $L(Ax^2 e^{-3x}) = 2A e^{-3x} = c e^{-3x}$, luego $A = c/2$.',
      { mistakes: {
          raw: function (v) { return v.c; },
          neg: function (v) { return -v.c / 2; }
        },
        feedback: [
          { when: 'raw', say: 'Casi: el factor 2 pasa dividiendo: $A = c/2$.' },
          { when: 'neg', say: 'Casi: la segunda derivada de $x^2$ es $+2$, no hay cambio de signo.' }
        ] }),

    N('dob-14', 'doble', 3, { y0: [1, 4, 1], yp0: [10, 18, 2] },
      function (v) { return 'Resuelve el PVI $y\'\' - 4y\' + 4y = 6e^{2x}$ con $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + v.yp0 + '$. En la solución $y(x) = (c_1 + c_2 x + 3x^2)e^{2x}$, ¿cuánto vale $c_2$?'; },
      function (v) { return v.yp0 - 2 * v.y0; },
      'Como $y_p(0) = y_p\'(0) = 0$, se tiene $c_1 = y_0$ y $y\'(0) = c_2 + 2c_1$, de donde $c_2 = y\'_0 - 2y_0$.',
      { mistakes: {
          noTwo: function (v) { return v.yp0 - v.y0; },
          plusTwo: function (v) { return v.yp0 + 2 * v.y0; }
        },
        feedback: [
          { when: 'noTwo', say: 'Casi: al derivar $(c_1 + c_2 x)e^{2x}$ queda $c_2 + 2c_1 = y\'(0)$.' },
          { when: 'plusTwo', say: 'Casi: al despejar $c_2$ de $c_2 + 2c_1 = y\'(0)$ se resta $2c_1$.' }
        ] }),

    N('dob-15', 'doble', 3, { y0: [2, 5, 1], yp0: [1, 6, 1] },
      function (v) { return 'Para el problema de valor inicial $y\'\' - 2y\' + y = 2e^{x}$ con $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + v.yp0 + '$, calcula el valor exacto de la solución evaluada en $x = 1$.'; },
      function (v) { return (v.yp0 + 1) * Math.E; },
      'La solución es $y(x) = (c_1 + c_2 x + x^2)e^x$ con $c_1 = y_0$ y $c_2 = y\'_0 - y_0$. En $x=1$ vale $(y\'_0 + 1)e$.',
      { mistakes: {
          noOne: function (v) { return v.yp0 * Math.E; },
          withY0: function (v) { return (v.y0 + v.yp0) * Math.E; }
        },
        feedback: [
          { when: 'noOne', say: 'Casi: olvidaste la solución particular $y_p(1) = 1^2 e^1 = e$.' },
          { when: 'withY0', say: 'Casi: en $x=1$ se suman $c_1 + c_2 = y\'_0$.' }
        ] }),

    N('dob-16', 'doble', 3, { c: [6, 36, 6] },
      function (v) { return 'Para la ecuación diferencial $y\'\' - 4y\' + 4y = ' + v.c + 'x\\,e^{2x}$, donde $r = 2$ es raíz doble, la solución particular es $y_p = A x^3 e^{2x}$. Calcula el coeficiente $A$.'; },
      function (v) { return v.c / 6; },
      'Usando $L(u e^{2x}) = u\'\' e^{2x}$ con $u = A x^3$, se tiene $u\'\' = 6Ax$. Igualando a $c x$ da $A = c/6$.',
      { mistakes: {
          div2: function (v) { return v.c / 2; },
          raw: function (v) { return v.c; }
        },
        feedback: [
          { when: 'div2', say: 'Casi: la segunda derivada de $x^3$ es $6x$, no $2x$, luego $6A = c$.' },
          { when: 'raw', say: 'Casi: se debe dividir entre 6.' }
        ] }),

    /* ======================= 4. Resonancia pura en osciladores (18) ======================= */
    C('res-01', 'resonancia', 1,
      'En física e ingeniería, ¿qué fenómeno ocurre cuando un oscilador sin fricción $y\'\' + \\omega^2 y = 0$ es excitado con frecuencia natural $\\omega$?',
      'Resonancia pura: la amplitud de oscilación crece linealmente con el tiempo sin límite', [
        ['Batimiento o pulsación: la amplitud sube y baja periódicamente permaneciendo acotada', 'Casi: el batimiento ocurre cuando la frecuencia externa está cerca de $\\omega$, pero no es igual.'],
        ['Amortiguamiento crítico: el sistema deja de oscilar y regresa lentamente al equilibrio', 'Casi: el amortiguamiento requiere una fuerza disipativa en $y\'$.'],
        ['Caos determinista: el movimiento se vuelve aperiódico e impredecible', 'Casi: la ecuación es lineal con coeficientes constantes.']],
      'Al forzar en la frecuencia $\\omega$, cada ciclo inyecta energía en fase, provocando crecimiento lineal.'),

    C('res-02', 'resonancia', 1,
      'Para la ecuación del oscilador armónico $y\'\' + \\omega^2 y = F_0\\cos(\\omega t)$, ¿por qué la respuesta particular contiene $t\\sin(\\omega t)$ y no $t\\cos(\\omega t)$?',
      'Porque al derivar $t\\sin(\\omega t)$ dos veces, el término $2\\omega\\cos(\\omega t)$ empareja en fase con el lado derecho $F_0\\cos(\\omega t)$', [
        ['Porque las funciones coseno nunca pueden aparecer en soluciones particulares', 'Casi: para fuerza seno la solución particular lleva precisamente $-t\\cos(\\omega t)$.'],
        ['Porque el coseno es función par y el seno es impar', 'Casi: es la derivada cruzada del producto la que cambia seno a coseno.'],
        ['Porque la frecuencia natural se anula en el origen', 'Casi: la frecuencia natural $\\omega > 0$ es constante.']],
      'Como $(t\\sin\\omega t)\'\' + \\omega^2(t\\sin\\omega t) = 2\\omega\\cos\\omega t$, se iguala directamente con $F_0\\cos\\omega t$.'),

    C('res-03', 'resonancia', 1,
      '¿Cuál es la fórmula para la amplitud envolvente $A(t)$ de la solución en resonancia $y_p(t) = \\dfrac{F_0}{2\\omega}\\,t\\sin(\\omega t)$?',
      '$A(t) = \\dfrac{F_0}{2\\omega}\\,t$', [
        ['$A(t) = \\dfrac{F_0}{\\omega^2}\\,t$', 'Casi: el divisor tiene $2\\omega$ proveniente de la regla del producto, no $\\omega^2$.'],
        ['$A(t) = \\dfrac{F_0}{2\\omega}\\,t^2$', 'Casi: la amplitud crece linealmente con $t$, no de forma cuadrática.'],
        ['$A(t) = F_0\\omega\\,t$', 'Casi: a mayor frecuencia la amplitud es menor; $\\omega$ va en el denominador.']],
      'La envolvente moduladora de $t\\sin(\\omega t)$ es la recta que pasa por el origen con pendiente $F_0 / (2\\omega)$.'),

    C('res-04', 'resonancia', 1,
      'Si la fuerza externa es de tipo seno, $y\'\' + \\omega^2 y = F_0\\sin(\\omega t)$, ¿cuál es la solución particular $y_p(t)$ en resonancia?',
      '$y_p(t) = -\\dfrac{F_0}{2\\omega}\\,t\\cos(\\omega t)$', [
        ['$y_p(t) = \\dfrac{F_0}{2\\omega}\\,t\\sin(\\omega t)$', 'Casi: esa es la solución para fuerza coseno $F_0\\cos(\\omega t)$.'],
        ['$y_p(t) = \\dfrac{F_0}{2\\omega}\\,t\\cos(\\omega t)$', 'Casi: al derivar $t\\cos(\\omega t)$ queda $-2\\omega\\sin(\\omega t)$, requiere signo menos.'],
        ['$y_p(t) = -\\dfrac{F_0}{\\omega}\\,t^2\\cos(\\omega t)$', 'Casi: la potencia de $t$ es 1 porque la raíz $\\pm i\\omega$ es simple.']],
      'Derivando $(t\\cos\\omega t)\'\' + \\omega^2(t\\cos\\omega t) = -2\\omega\\sin\\omega t$, luego $y_p = -\\frac{F_0}{2\\omega}t\\cos\\omega t$.'),

    C('res-05', 'resonancia', 1,
      '¿Por qué en los sistemas mecánicos reales la resonancia nunca hace que la amplitud crezca literalmente hasta el infinito?',
      'Porque siempre existe cierta fricción o amortiguamiento que limita la amplitud, o el sistema se rompe al superar su límite elástico', [
        ['Porque la rigidez del resorte se vuelve infinita al aumentar la oscilación', 'Casi: la rigidez es finita y suele decrecer antes de la fractura.'],
        ['Porque las ecuaciones diferenciales lineales dejan de ser válidas transcurridos diez segundos', 'Casi: la validez depende del rango de pequeñas deformaciones, no de un tiempo fijo.'],
        ['Porque la frecuencia de excitación disminuye automáticamente', 'Casi: la fuente externa mantiene su frecuencia.']],
      'El amortiguamiento disipa energía estableciendo un techo finito, y amplitudes extremas causan falla estructural.'),

    C('res-06', 'resonancia', 2,
      'Al resolver $y\'\' + 16y = 8\\cos(4t)$ con reposo inicial $y(0) = 0$ y $y\'(0) = 0$, ¿cuál es la solución completa $y(t)$?',
      '$y(t) = t\\sin(4t)$', [
        ['$y(t) = \\sin(4t) + t\\sin(4t)$', 'Casi: para cumplir $y\'(0) = 0$, la parte homogénea es cero porque $y_p\'(0) = 0$.'],
        ['$y(t) = t\\cos(4t)$', 'Casi: para fuerza coseno la solución lleva $\\sin(4t)$, no $\\cos(4t)$.'],
        ['$y(t) = 8t\\sin(4t)$', 'Casi: el coeficiente es $F_0/(2\\omega) = 8/(2 \\cdot 4) = 1$.']],
      'Como $\\omega = 4$ y $F_0 = 8$, $y_p(t) = \\frac{8}{2(4)}t\\sin(4t) = t\\sin(4t)$, que satisface las condiciones iniciales.'),

    N('res-07', 'resonancia', 2, { w: [2, 6, 1], F0: [4, 24, 4] },
      function (v) { return 'Para el oscilador forzado en resonancia $y\'\' + ' + (v.w * v.w) + 'y = ' + v.F0 + '\\cos(' + v.w + 't)$, la solución particular es $y_p(t) = B\\,t\\sin(' + v.w + 't)$. Calcula el coeficiente de amplitud $B$.'; },
      function (v) { return v.F0 / (2 * v.w); },
      'La sustitución directa en resonancia da $2\\omega B = F_0$, por lo que $B = F_0 / (2\\omega)$.',
      { mistakes: {
          noTwo: function (v) { return v.F0 / v.w; },
          square: function (v) { return v.F0 / (2 * v.w * v.w); }
        },
        feedback: [
          { when: 'noTwo', say: 'Casi: al derivar $t\\sin(\\omega t)$ dos veces queda $2\\omega B$, por lo que divides entre $2\\omega$.' },
          { when: 'square', say: 'Casi: en el divisor va $2\\omega$, no $2\\omega^2$.' }
        ] }),

    N('res-08', 'resonancia', 2, { w: [2, 5, 1], F0: [6, 20, 2] },
      function (v) { return 'Para la ecuación $y\'\' + ' + (v.w * v.w) + 'y = ' + v.F0 + '\\sin(' + v.w + 't)$, la solución particular tiene la forma $y_p(t) = A\\,t\\cos(' + v.w + 't)$. Determina el valor numérico del coeficiente $A$.'; },
      function (v) { return -v.F0 / (2 * v.w); },
      'Al derivar, $-2\\omega A = F_0 \\implies A = -F_0 / (2\\omega)$.',
      { mistakes: {
          pos: function (v) { return v.F0 / (2 * v.w); },
          noTwo: function (v) { return -v.F0 / v.w; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: como $(t\\cos\\omega t)\'\' + \\omega^2(t\\cos\\omega t) = -2\\omega\\sin\\omega t$, se requiere signo negativo.' },
          { when: 'noTwo', say: 'Casi: el divisor es $2\\omega$, no $\\omega$.' }
        ] }),

    N('res-09', 'resonancia', 2, { w: [2, 4, 1], F0: [4, 12, 2], t1: [5, 15, 5] },
      function (v) { return 'Un sistema masa-resorte sin amortiguamiento cumple $y\'\' + ' + (v.w * v.w) + 'y = ' + v.F0 + '\\cos(' + v.w + 't)$ con reposo inicial. ¿Cuál es la amplitud envolvente de la oscilación en el instante $t = ' + v.t1 + '\\ \\text{s}$?'; },
      function (v) { return (v.F0 / (2 * v.w)) * v.t1; },
      'La envolvente de la amplitud es $A(t) = \\frac{F_0}{2\\omega}t$. Evaluando en $t = t_1$ da $\\frac{F_0 t_1}{2\\omega}$.',
      { mistakes: {
          noTwo: function (v) { return (v.F0 / v.w) * v.t1; },
          noTime: function (v) { return v.F0 / (2 * v.w); }
        },
        feedback: [
          { when: 'noTwo', say: 'Casi: la pendiente de la amplitud es $F_0/(2\\omega)$, no $F_0/\\omega$.' },
          { when: 'noTime', say: function (v) { return 'Casi: debes multiplicar por el instante $t = ' + v.t1 + '\\ \\text{s}$.'; } }
        ] }),

    N('res-10', 'resonancia', 2, { w: [2, 5, 1], F0: [4, 8, 2], Amax: [10, 30, 5] },
      function (v) { return 'Un puente modelado sin fricción satisface $y\'\' + ' + (v.w * v.w) + 'y = ' + v.F0 + '\\cos(' + v.w + 't)$. Si parte del reposo, ¿cuántos segundos tarda la amplitud de oscilación en alcanzar $' + v.Amax + '\\ \\text{m}$?'; },
      function (v) { return (2 * v.w * v.Amax) / v.F0; },
      'Igualando $\\frac{F_0}{2\\omega}t = A_{max}$ y despejando $t$, se obtiene $t = \\frac{2\\omega A_{max}}{F_0}$.',
      { mistakes: {
          half: function (v) { return (v.w * v.Amax) / v.F0; },
          inverted: function (v) { return v.F0 / (2 * v.w * v.Amax); }
        },
        feedback: [
          { when: 'half', say: 'Casi: de $A(t) = \\frac{F_0}{2\\omega}t$ se despeja $t = \\frac{2\\omega A_{max}}{F_0}$; faltó el factor 2.' },
          { when: 'inverted', say: 'Casi: el tiempo es proporcional a la amplitud deseada y a $\\omega$.' }
        ] }),

    N('res-11', 'resonancia', 2, { m: [2, 4, 1], w: [2, 5, 1], F0: [12, 36, 6] },
      function (v) { return 'Para la ecuación diferencial no estándar $' + v.m + 'y\'\' + ' + (v.m * v.w * v.w) + 'y = ' + v.F0 + '\\cos(' + v.w + 't)$, halla el coeficiente $B$ de la solución particular $y_p(t) = B\\,t\\sin(' + v.w + 't)$.'; },
      function (v) { return v.F0 / (2 * v.m * v.w); },
      'En forma estándar $y\'\' + \\omega^2 y = \\frac{F_0}{m}\\cos(\\omega t)$, por lo que $B = \\frac{F_0}{2m\\omega}$.',
      { mistakes: {
          noM: function (v) { return v.F0 / (2 * v.w); },
          noTwo: function (v) { return v.F0 / (v.m * v.w); }
        },
        feedback: [
          { when: 'noM', say: function (v) { return 'Casi: divide primero entre la masa $m = ' + v.m + '$ para poner la EDO en forma estándar.'; } },
          { when: 'noTwo', say: 'Casi: recuerda dividir entre $2\\omega$.' }
        ] }),

    N('res-12', 'resonancia', 2, { c: [2, 8, 2] },
      function (v) { return 'Para la ecuación en resonancia $y\'\' + y = ' + v.c + '\\cos t$, determina el valor numérico de la velocidad $y_p\'(\\pi)$ de la solución particular.'; },
      function (v) { return -(v.c * Math.PI) / 2; },
      'Derivando $y_p(t) = (c/2)t\\sin t$ queda $y_p\'(t) = (c/2)(\\sin t + t\\cos t)$. En $t=\\pi$ vale $-(c\\pi)/2$.',
      { mistakes: {
          pos: function (v) { return (v.c * Math.PI) / 2; },
          noPi: function (v) { return -v.c / 2; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: como $\\cos(\\pi) = -1$, la velocidad en $t = \\pi$ tiene signo negativo.' },
          { when: 'noPi', say: 'Casi: sobrevive el término $t\\cos t$, que en $t = \\pi$ aporta un factor $\\pi$.' }
        ] }),

    N('res-13', 'resonancia', 2, { w: [3, 7, 1], F0: [12, 28, 4] },
      function (v) { return 'En un circuito LC sin resistencia gobernado por $q\'\' + ' + (v.w * v.w) + 'q = ' + v.F0 + '\\sin(' + v.w + 't)$, la amplitud de la carga oscilante crece a una tasa constante $dA/dt$ (en C/s). ¿Cuál es dicha tasa?'; },
      function (v) { return v.F0 / (2 * v.w); },
      'La envolvente de la amplitud es $A(t) = \\frac{F_0}{2\\omega}t$, cuya tasa de cambio constante es $F_0 / (2\\omega)$.',
      { mistakes: {
          noTwo: function (v) { return v.F0 / v.w; },
          square: function (v) { return v.F0 / (2 * v.w * v.w); }
        },
        feedback: [
          { when: 'noTwo', say: 'Casi: la pendiente de la envolvente es $F_0/(2\\omega)$, no $F_0/\\omega$.' },
          { when: 'square', say: 'Casi: en el divisor va $2\\omega$, no $2\\omega^2$.' }
        ] }),

    N('res-14', 'resonancia', 2, { w: [1, 3, 1], F0: [4, 12, 4] },
      function (v) { return 'Para el oscilador en resonancia $y\'\' + ' + (v.w * v.w) + 'y = ' + v.F0 + '\\cos(' + v.w + 't)$, calcula el valor de $y_p$ en el primer instante donde $\\sin(' + v.w + 't) = 1$, es decir en $t = \\frac{\\pi}{' + (2 * v.w) + '}$.'; },
      function (v) { return (v.F0 * Math.PI) / (4 * v.w * v.w); },
      'Sustituyendo $t = \\pi / (2\\omega)$ en $y_p(t) = \\frac{F_0}{2\\omega}t$ se obtiene $\\frac{F_0 \\pi}{4\\omega^2}$.',
      { mistakes: {
          noFour: function (v) { return (v.F0 * Math.PI) / (2 * v.w * v.w); },
          noPi: function (v) { return v.F0 / (4 * v.w * v.w); }
        },
        feedback: [
          { when: 'noFour', say: 'Casi: en el denominador multiplicas $2\\omega \\cdot 2\\omega = 4\\omega^2$.' },
          { when: 'noPi', say: 'Casi: el tiempo contiene $\\pi$, por lo que el valor resultante lleva $\\pi$.' }
        ] }),

    N('res-15', 'resonancia', 3, { y0: [2, 6, 1], yp0: [2, 8, 2] },
      function (v) { return 'Resuelve el PVI de resonancia $y\'\' + 4y = 8\\cos(2t)$ con $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + v.yp0 + '$. Evalúa la solución en el instante $t = \\frac{\\pi}{4}$.'; },
      function (v) { return v.yp0 / 2 + Math.PI / 2; },
      'Con $c_2 = y\'(0)/2$ y $y_p(\\pi/4) = \\pi/2$, en $t = \\pi/4$ se tiene $y = c_2 \\sin(\\pi/2) + y_p(\\pi/4) = y\'_0/2 + \\pi/2$.',
      { mistakes: {
          withY0: function (v) { return v.y0 + v.yp0 / 2 + Math.PI / 2; },
          noPi: function (v) { return v.yp0 / 2; }
        },
        feedback: [
          { when: 'withY0', say: 'Casi: en $t = \\pi/4$, $\\cos(2t) = \\cos(\\pi/2) = 0$, el término con $c_1 = y(0)$ se anula.' },
          { when: 'noPi', say: 'Casi: la solución particular en $t = \\pi/4$ aporta $\\pi/2$.' }
        ] }),

    N('res-16', 'resonancia', 3, { k: [2, 6, 2], w: [1, 5, 1] },
      function (v) { return 'Para la ecuación $y\'\' + ' + (v.w * v.w) + 'y = ' + (3 * v.k) + '\\cos(' + v.w + 't) + ' + (4 * v.k) + '\\sin(' + v.w + 't)$, calcula la tasa de crecimiento de la amplitud envolvente resultante $dR/dt$.'; },
      function (v) { return (5 * v.k) / (2 * v.w); },
      'Las soluciones están en cuadratura; la amplitud combinada es $\\frac{\\sqrt{F_1^2 + F_2^2}}{2\\omega}t = \\frac{5k}{2\\omega}t$, con pendiente $5k/(2\\omega)$.',
      { mistakes: {
          noHypot: function (v) { return (7 * v.k) / (2 * v.w); },
          noTwo: function (v) { return (5 * v.k) / v.w; }
        },
        feedback: [
          { when: 'noHypot', say: 'Casi: las componentes están en cuadratura, se combinan como $\\sqrt{F_1^2 + F_2^2} = 5k$.' },
          { when: 'noTwo', say: 'Casi: el divisor en resonancia es $2\\omega$.' }
        ] }),

    N('res-17', 'resonancia', 3, { c: [10, 16, 1] },
      function (v) { return 'Un bloque de masa $m = 2\\ \\text{kg}$ unido a un resorte de constante $k = 32\\ \\text{N/m}$ cumple $2y\'\' + 32y = ' + (16 * v.c) + '\\cos(4t)$. Calcula la velocidad $y_p\'(\\pi/8)$ de la respuesta particular en m/s.'; },
      function (v) { return v.c; },
      'En forma estándar $y\'\' + 16y = 8c\\cos(4t)$. La solución es $y_p = ct\\sin(4t)$. Su derivada en $t = \\pi/8$ es $c\\sin(\\pi/2) = c$.',
      { mistakes: {
          divTwo: function (v) { return v.c / 2; },
          double: function (v) { return 2 * v.c; }
        },
        feedback: [
          { when: 'divTwo', say: 'Casi: en forma estándar el término fuente es $(16c)/2 = 8c$, y la amplitud es $8c/(2 \\cdot 4) = c$.' },
          { when: 'double', say: 'Casi: recuerda dividir la fuerza entre la masa $m = 2\\ \\text{kg}$.' }
        ] }),

    N('res-18', 'resonancia', 3, { F0: [2, 6, 2], t0: [2, 8, 2] },
      function (v) { return 'La potencia promedio en un ciclo transferida por la fuerza $F(t) = ' + v.F0 + '\\cos(\\omega t)$ al oscilador unitario $y\'\' + \\omega^2 y = ' + v.F0 + '\\cos(\\omega t)$ crece como $\\bar{P}(t) = \\frac{F_0^2}{4}t$. ¿Cuántos watts transfiere en promedio en $t = ' + v.t0 + '\\ \\text{s}$?'; },
      function (v) { return (v.F0 * v.F0 * v.t0) / 4; },
      'Como $P = F \\cdot v$, el promedio en fase es $\\frac{F_0^2}{2}t \\langle \\cos^2(\\omega t) \\rangle = \\frac{F_0^2}{4}t$.',
      { mistakes: {
          divTwo: function (v) { return (v.F0 * v.F0 * v.t0) / 2; },
          noSquare: function (v) { return (v.F0 * v.t0) / 4; }
        },
        feedback: [
          { when: 'divTwo', say: 'Casi: el promedio de $\\cos^2(\\omega t)$ en un periodo es $1/2$, lo que introduce un divisor 4.' },
          { when: 'noSquare', say: 'Casi: la potencia es proporcional al cuadrado de la fuerza $F_0^2$.' }
        ] }),

    /* ======================= 5. Raíz cero y términos polinomiales (15) ======================= */
    C('cer-01', 'cero', 1,
      'En una ecuación diferencial donde no aparece $y$, como $y\'\' + 3y\' = 5$, ¿por qué la propuesta constante ordinaria $y_p = A$ no funciona?',
      'Porque $r = 0$ es raíz del característico, lo que hace que toda constante sea solución de la homogénea ($y_h$ contiene $c_1$)', [
        ['Porque una constante solo puede igualar a una función exponencial', 'Casi: las constantes se igualan con polinomios de grado 0, pero aquí choca con $y_h$.'],
        ['Porque las derivadas de una constante son infinitas', 'Casi: las derivadas de una constante son exactamente cero.'],
        ['Porque la ecuación es de primer orden disfrazada', 'Casi: la razón matemática es que $L(A) = 0 + 3(0) = 0 \\neq 5$.']],
      'El característico $r(r + 3) = 0$ tiene raíz $r = 0$. Como $e^{0x} = 1$, las constantes están en $y_h$ y se propone $y_p = Ax$.'),

    C('cer-02', 'cero', 1,
      'Para la ecuación $y\'\' + 5y\' = 10$, al corregir la propuesta a $y_p = Ax$, ¿cuál es el valor de la constante $A$?',
      '$A = 2$', [
        ['$A = 10$', 'Casi: al sustituir $y_p\' = A$ y $y_p\'\' = 0$ queda $5A = 10 \\implies A = 2$.'],
        ['$A = 50$', 'Casi: se divide entre 5: $5A = 10 \\implies A = 2$.'],
        ['$A = 0$', 'Casi: si $A = 0$ la solución particular no igualaría a 10.']],
      'Derivando $y_p = Ax$ da $y_p\' = A$ y $y_p\'\' = 0$. Sustituyendo resulta $5A = 10 \\implies A = 2$.'),

    C('cer-03', 'cero', 1,
      'En la ecuación $y\'\' - y\' = 4x$, la propuesta ordinaria para $4x$ era $Ax + B$. Dado que $r = 0$ es raíz simple, ¿cuál es la forma corregida?',
      '$y_p = Ax^2 + Bx$', [
        ['$y_p = Ax^2 + B$', 'Casi: se multiplica toda la propuesta $(Ax + B)$ por $x$, dando $Ax^2 + Bx$.'],
        ['$y_p = Ax^2$', 'Casi: no puedes omitir el término lineal $Bx$.'],
        ['$y_p = Ax^3 + Bx^2$', 'Casi: la raíz $r = 0$ es simple ($s=1$), solo se multiplica por $x^1$.']],
      'Al multiplicar toda la propuesta $(Ax + B)$ por $x^s$ con $s = 1$, se obtiene $x(Ax + B) = Ax^2 + Bx$.'),

    C('cer-04', 'cero', 2,
      'Considera la ecuación $y\'\' + 4y = 8$. ¿Tiene la raíz $r = 0$ en su característico y requiere duplicación para la constante $8$?',
      'No, porque el característico $r^2 + 4 = 0$ tiene raíces $\\pm 2i$; $r = 0$ no es raíz y basta proponer la constante $y_p = A$', [
        ['Sí, porque el lado derecho es constante y toda constante siempre choca con la homogénea', 'Casi: una constante solo choca si la ecuación no tiene término en $y$.'],
        ['Sí, pero solo si la constante es un número par', 'Casi: la regla depende de las raíces del característico, no de la paridad.'],
        ['No, porque las ecuaciones trigonométricas no admiten soluciones constantes', 'Casi: $y_p = A$ da $0 + 4A = 8 \\implies y_p = 2$, válida.']],
      'Como $y$ está presente, $r^2 + 4 = 0$ no tiene raíz cero. La propuesta $y_p = A$ funciona directamente dando $4A = 8 \\implies A = 2$.'),

    C('cer-05', 'cero', 2,
      'Para la ecuación $y\'\'\' - y\'\' = 6$, donde la menor derivada es de orden 2, ¿cuál es la multiplicidad de $r = 0$ y qué propuesta corresponde a la constante $6$?',
      'La multiplicidad es $s = 2$ (porque $r^3 - r^2 = r^2(r - 1) = 0$), por lo que se propone $y_p = A x^2$', [
        ['La multiplicidad es $s = 1$, proponiendo $y_p = Ax$', 'Casi: como $r^2$ factoriza en el característico, $1$ y $x$ están en $y_h$.'],
        ['La multiplicidad es $s = 3$, proponiendo $y_p = Ax^3$', 'Casi: el factor es $r^2$, por lo que la multiplicidad es 2.'],
        ['No hay duplicación porque el lado derecho no depende de $x$', 'Casi: el término constante es $e^{0x}$, que choca doblemente con $y_h$.']],
      'Como $y_h = c_1 + c_2 x + c_3 e^x$, tanto constantes como términos lineales están en $y_h$; se requiere $y_p = Ax^2$.'),

    N('cer-06', 'cero', 2, { b: [2, 6, 1], c: [6, 24, 2] },
      function (v) { return 'Para la ecuación diferencial $y\'\' + ' + v.b + 'y\' = ' + v.c + '$, calcula el coeficiente $A$ en la solución particular $y_p(x) = Ax$.'; },
      function (v) { return v.c / v.b; },
      'Como $y_p\'\' = 0$, la ecuación se reduce a $b y_p\' = b A = c$, de donde $A = c/b$.',
      { mistakes: {
          mult: function (v) { return v.c * v.b; },
          sign: function (v) { return -v.c / v.b; }
        },
        feedback: [
          { when: 'mult', say: function (v) { return 'Casi: al sustituir queda $' + v.b + 'A = ' + v.c + '$, de modo que divides entre ' + v.b + '.'; } },
          { when: 'sign', say: 'Casi: el coeficiente de $y\'$ es positivo, por lo que $A > 0$.' }
        ] }),

    N('cer-07', 'cero', 2, { b: [2, 5, 1], c: [6, 20, 2] },
      function (v) { return 'Determina el coeficiente $A$ en la solución $y_p = Ax$ para la ecuación $y\'\' - ' + v.b + 'y\' = ' + v.c + '$.'; },
      function (v) { return -v.c / v.b; },
      'Sustituyendo $y_p = Ax$ queda $-b A = c$, lo que da $A = -c/b$.',
      { mistakes: {
          pos: function (v) { return v.c / v.b; },
          mult: function (v) { return -v.c * v.b; }
        },
        feedback: [
          { when: 'pos', say: function (v) { return 'Casi: el término es $-' + v.b + 'y\'$, luego $-' + v.b + 'A = ' + v.c + ' \\implies A < 0$.'; } },
          { when: 'mult', say: function (v) { return 'Casi: debes dividir entre $-' + v.b + '$.'; } }
        ] }),

    N('cer-08', 'cero', 2, { k: [2, 5, 1], c: [8, 24, 4] },
      function (v) { return 'En la ecuación de tercer orden $y\'\'\' - ' + v.k + 'y\'\' = ' + v.c + '$, la solución particular para la constante es $y_p = Ax^2$. Calcula el valor de $A$.'; },
      function (v) { return -v.c / (2 * v.k); },
      'Como $y_p\'\' = 2A$ y $y_p\'\'\' = 0$, la ecuación queda $-2k A = c \\implies A = -c / (2k)$.',
      { mistakes: {
          pos: function (v) { return v.c / (2 * v.k); },
          noTwo: function (v) { return -v.c / v.k; }
        },
        feedback: [
          { when: 'pos', say: function (v) { return 'Casi: el término $-' + v.k + 'y\'\'$ aporta un signo negativo.'; } },
          { when: 'noTwo', say: 'Casi: la segunda derivada de $x^2$ es 2, produciendo un factor 2 en el divisor.' }
        ] }),

    N('cer-09', 'cero', 2, { c: [36, 52, 4] },
      function (v) { return 'Para la ecuación $y\'\' + 2y\' = ' + v.c + 'x$, la propuesta corregida es $y_p = Ax^2 + Bx$. Calcula el coeficiente cuadrático $A$.'; },
      function (v) { return v.c / 4; },
      'Igualando coeficientes de $x$: $2(2A) = 4A = c \\implies A = c/4$.',
      { mistakes: {
          div2: function (v) { return v.c / 2; },
          raw: function (v) { return v.c; }
        },
        feedback: [
          { when: 'div2', say: 'Casi: al derivar $Ax^2$ queda $2Ax$, multiplicado por 2 da $4Ax = cx$, luego $A = c/4$.' },
          { when: 'raw', say: 'Casi: se debe dividir entre 4.' }
        ] }),

    N('cer-10', 'cero', 2, { c: [4, 20, 4] },
      function (v) { return 'Para la misma ecuación $y\'\' + 2y\' = ' + v.c + 'x$ con $y_p = Ax^2 + Bx$, determina el coeficiente lineal $B$.'; },
      function (v) { return -v.c / 4; },
      'El término constante de la sustitución es $2A + 2B = 0 \\implies B = -A = -c/4$.',
      { mistakes: {
          pos: function (v) { return v.c / 4; },
          zero: function (v) { return 0; }
        },
        feedback: [
          { when: 'pos', say: function (v) { return 'Casi: de $2A + 2B = 0$ se obtiene $B = -A = -' + (v.c / 4) + '$.'; } },
          { when: 'zero', say: 'Casi: para anular el residuo $2A$ se requiere $B \\neq 0$.' }
        ] }),

    N('cer-11', 'cero', 2, { c: [8, 32, 8] },
      function (v) { return 'Para la ecuación diferencial $y\'\' - 4y\' = ' + v.c + 'x$, halla la solución particular $y_p(x)$ que cumple $y_p(0)=0$ y evalúala en $x = 2$.'; },
      function (v) { return (-5 * v.c) / 8; },
      'Como $y_p(x) = -(c/8)x^2 - (c/16)x$, evaluando en $x=2$ se obtiene $-(c/8)(4) - (c/16)(2) = -5c/8$.',
      { mistakes: {
          pos: function (v) { return (5 * v.c) / 8; },
          noLinear: function (v) { return -v.c / 2; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: el coeficiente de $y\'$ es $-4$, lo que hace negativos a $A$ y $B$.' },
          { when: 'noLinear', say: 'Casi: te faltó incluir la contribución del término lineal $Bx$.' }
        ] }),

    N('cer-12', 'cero', 3, { y0: [2, 6, 1], k: [1, 4, 1] },
      function (v) { return 'Resuelve el PVI $y\'\' + 3y\' = 6$ con $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + (2 - 3 * v.k) + '$. En la solución $y(x) = c_1 + c_2 e^{-3x} + 2x$, ¿cuánto vale $c_2$?'; },
      function (v) { return v.k; },
      'De $y\'(0) = -3c_2 + 2 = 2 - 3k$ se deduce inmediatamente $-3c_2 = -3k \\implies c_2 = k$.',
      { mistakes: {
          noTwo: function (v) { return -(2 - 3 * v.k) / 3; },
          sign: function (v) { return -v.k; }
        },
        feedback: [
          { when: 'noTwo', say: 'Casi: la derivada de $y_p = 2x$ aporta $+2$, por lo que $-3c_2 + 2 = y\'(0)$.' },
          { when: 'sign', say: 'Casi: revisa el despeje: $-3c_2 = y\'(0) - 2$, por lo que $c_2 = (2 - y\'(0))/3$.' }
        ] }),

    N('cer-13', 'cero', 3, { y0: [6, 10, 1], k: [1, 4, 1] },
      function (v) { return 'Para el mismo PVI $y\'\' + 3y\' = 6$ con $y(0) = ' + v.y0 + '$ y $y\'(0) = ' + (2 - 3 * v.k) + '$, halla el valor de la constante $c_1$ en $y(x) = c_1 + c_2 e^{-3x} + 2x$.'; },
      function (v) { return v.y0 - v.k; },
      'Dado que $y(0) = c_1 + c_2 = y_0$ y ya se conoce $c_2 = k$, se tiene $c_1 = y_0 - k$.',
      { mistakes: {
          add: function (v) { return v.y0 + v.k; },
          raw: function (v) { return v.y0; }
        },
        feedback: [
          { when: 'add', say: 'Casi: como $c_1 + c_2 = y(0)$, se resta $c_1 = y(0) - c_2$.' },
          { when: 'raw', say: 'Casi: $c_1$ no es solo $y(0)$, pues en $x=0$ el término $c_2 e^0 = c_2$ también contribuye.' }
        ] }),

    N('cer-14', 'cero', 3, { c: [6, 36, 6] },
      function (v) { return 'Para la ecuación diferencial de tercer orden $y\'\'\' - y\'\' = ' + v.c + 'x$, donde $r = 0$ es raíz doble, la propuesta es $y_p = Ax^3 + Bx^2$. Calcula el valor del coeficiente $B$.'; },
      function (v) { return -v.c / 2; },
      'Al sustituir e igualar los términos constantes $6A - 2B = 0$, se obtiene $B = 3A = 3(-c/6) = -c/2$.',
      { mistakes: {
          pos: function (v) { return v.c / 2; },
          div6: function (v) { return -v.c / 6; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: de $6A - 2B = 0$ se tiene $B = 3A$; como $A = -c/6 < 0$, $B$ también es negativo.' },
          { when: 'div6', say: 'Casi: $-c/6$ es el valor de $A$; para $B$ se multiplica por 3: $B = 3(-c/6) = -c/2$.' }
        ] }),

    N('cer-15', 'cero', 3, { m: [1, 4, 1], gam: [2, 8, 2], F0: [10, 40, 10] },
      function (v) { return 'Un proyectil en un medio viscoso cumple $' + v.m + 'y\'\' + ' + v.gam + 'y\' = ' + v.F0 + '$. La solución particular lineal $y_p(t) = v_{ter}\\,t$ representa el movimiento a velocidad terminal. ¿Cuánto vale $v_{ter}$ en m/s?'; },
      function (v) { return v.F0 / v.gam; },
      'Como $y_p\'\' = 0$, la ecuación da directamente $\\gamma v_{ter} = F_0 \\implies v_{ter} = F_0 / \\gamma$.',
      { mistakes: {
          mult: function (v) { return v.F0 * v.gam; },
          divM: function (v) { return v.F0 / (v.m * v.gam); }
        },
        feedback: [
          { when: 'mult', say: function (v) { return 'Casi: al sustituir queda $' + v.gam + 'v_{ter} = ' + v.F0 + '$, luego divides entre ' + v.gam + '.'; } },
          { when: 'divM', say: 'Casi: a velocidad constante la aceleración $y\'\'$ se anula; la masa no divide.' }
        ] }),

    /* ======================= 6. Ecuaciones de orden superior (n ≥ 3) (15) ======================= */
    C('sup-01', 'superior', 1,
      'Para la ecuación de tercer orden $y\'\'\' - y\' = e^{x}$, las raíces del característico $r^3 - r = r(r - 1)(r + 1) = 0$ son $0, 1$ y $-1$. ¿Cuál es la forma de $y_p$?',
      '$y_p = Ax\\,e^{x}$', [
        ['$y_p = Ae^{x}$', 'Casi: $r = 1$ es raíz del característico, por lo que choca con $y_h$.'],
        ['$y_p = Ax^3e^{x}$', 'Casi: el orden es 3, pero la multiplicidad de $r = 1$ es 1; se multiplica por $x^1$.'],
        ['$y_p = (Ax^2 + Bx)e^{x}$', 'Casi: el término fuente no lleva un polinomio en $x$.']],
      'Como $r = 1$ es una raíz simple (multiplicidad $s = 1$), la propuesta $A e^x$ se multiplica por $x^1$.'),

    C('sup-02', 'superior', 1,
      'En la ecuación de cuarto orden $y^{(4)} - y = 8\\cos x$, el característico es $r^4 - 1 = (r - 1)(r + 1)(r^2 + 1) = 0$. ¿Choca el término $\\cos x$ con la homogénea?',
      'Sí, porque $r = \\pm i$ son raíces de $r^2 + 1 = 0$, por lo que $\\cos x$ está en $y_h$ y se debe proponer $x(A\\cos x + B\\sin x)$', [
        ['No, porque las funciones trigonométricas solo chocan en segundo orden', 'Casi: la regla de duplicación se aplica idénticamente en cualquier orden $n$.'],
        ['No, porque las raíces de cuarto orden son todas reales', 'Casi: $r^4 = 1$ tiene dos raíces reales y dos imaginarias $\\pm i$.'],
        ['Sí, pero al ser de orden 4 se debe multiplicar por $x^4$', 'Casi: la potencia de $x$ es la multiplicidad de la raíz $\\pm i$, que es 1.']],
      'Las raíces de $r^4 - 1 = 0$ incluyen $\\pm i$ con multiplicidad 1. Por ello $\\cos x$ choca y se multiplica por $x$.'),

    C('sup-03', 'superior', 1,
      'Para una ecuación lineal con término $g(x) = 3e^{x} + 5e^{2x}$, supón que $r = 1$ es raíz simple del característico pero $r = 2$ no es raíz. ¿Cuál es la estructura de $y_p$?',
      '$y_p = Ax\\,e^{x} + B\\,e^{2x}$', [
        ['$y_p = x(A\\,e^{x} + B\\,e^{2x})$', 'Casi: solo el término que choca ($e^x$) debe multiplicarse por $x$.'],
        ['$y_p = A\\,e^{x} + B\\,e^{2x}$', 'Casi: $e^x$ choca con la homogénea; si no lo multiplicas por $x$, daría cero.'],
        ['$y_p = Ax^2e^{x} + Be^{2x}$', 'Casi: la raíz $r = 1$ es simple ($s=1$), por lo que solo se multiplica por $x^1$.']],
      'Por el principio de superposición, cada sumando de $g(x)$ se trata con su propia multiplicidad: $s = 1$ para $e^x$ y $s = 0$ para $e^{2x}$.'),

    C('sup-04', 'superior', 2,
      'Para la ecuación $y\'\'\' - 3y\'\' + 3y\' - y = c\\,e^{x}$, el característico es $(r - 1)^3 = 0$. ¿Cuál es el operador reducido que resulta al sustituir $y_p = u(x)\\,e^{x}$?',
      '$u\'\'\'(x)\\,e^{x} = c\\,e^{x}$, de modo que $u\'\'\'(x) = c$', [
        ['$u\'(x)\\,e^{x} = c\\,e^{x}$', 'Casi: al tener multiplicidad 3, la primera y segunda derivada se anulan; sobrevive $u\'\'\'$.'],
        ['$3u\'\'(x)\\,e^{x} = c\\,e^{x}$', 'Casi: por desplazamiento $(D - 1)^3(u e^x) = u\'\'\' e^x$.'],
        ['$u(x)\\,e^{x} = c\\,e^{x}$', 'Casi: las tres primeras potencias anulan a $u, u\', u\'\'$.']],
      'Por la fórmula de desplazamiento $(D - 1)^3(u e^x) = u\'\'\' e^x$. Con $u = A x^3$, $u\'\'\' = 6A$, dando $6A = c$.'),

    N('sup-05', 'superior', 2, { c: [54, 84, 6] },
      function (v) { return 'En la ecuación diferencial de tercer orden $y\'\'\' - 3y\'\' + 3y\' - y = ' + v.c + 'e^{x}$, calcula el coeficiente $A$ en la solución particular $y_p = A x^3 e^{x}$.'; },
      function (v) { return v.c / 6; },
      'Como $(r - 1)^3 = 0$, $L(Ax^3 e^x) = (Ax^3)\'\'\' e^x = 6A e^x$. Igualando a $c e^x$ da $A = c/6$.',
      { mistakes: {
          div3: function (v) { return v.c / 3; },
          raw: function (v) { return v.c; }
        },
        feedback: [
          { when: 'div3', say: 'Casi: la tercera derivada de $x^3$ es $3! = 6$, no 3; por tanto $6A = c \\implies A = c/6$.' },
          { when: 'raw', say: 'Casi: debes dividir entre 6.' }
        ] }),

    N('sup-06', 'superior', 2, { c: [6, 22, 2] },
      function (v) { return 'Para la ecuación diferencial $y\'\'\' - y\' = ' + v.c + 'e^{x}$, determina el coeficiente $A$ de la solución particular $y_p = Ax\\,e^{x}$.'; },
      function (v) { return v.c / 2; },
      'Evaluando $P\'(1)$ para $P(r) = r^3 - r$ se obtiene $P\'(1) = 2$. Así $2A = c \\implies A = c/2$.',
      { mistakes: {
          raw: function (v) { return v.c; },
          div3: function (v) { return v.c / 3; }
        },
        feedback: [
          { when: 'raw', say: 'Casi: al sustituir $Ax e^x$ en $y\'\'\' - y\'$ queda $2A e^x$, por lo que $A = c/2$.' },
          { when: 'div3', say: 'Casi: el residuo es $P\'(1) = 3(1)^2 - 1 = 2$, no 3.' }
        ] }),

    N('sup-07', 'superior', 2, { c: [6, 24, 2] },
      function (v) { return 'Para la ecuación $y\'\'\' - y\' = ' + v.c + 'e^{-x}$, calcula el coeficiente $A$ de la propuesta $y_p = Ax\\,e^{-x}$.'; },
      function (v) { return v.c / 2; },
      'Como $P\'(r) = 3r^2 - 1$, en $r = -1$ vale $3(-1)^2 - 1 = 2$. Por ello $2A = c \\implies A = c/2$.',
      { mistakes: {
          neg: function (v) { return -v.c / 2; },
          raw: function (v) { return v.c; }
        },
        feedback: [
          { when: 'neg', say: 'Casi: $P\'(-1) = 3(-1)^2 - 1 = +2$, por lo que $A > 0$.' },
          { when: 'raw', say: 'Casi: debes dividir entre 2.' }
        ] }),

    N('sup-08', 'superior', 2, { c: [42, 66, 4] },
      function (v) { return 'Para la ecuación de cuarto orden $y^{(4)} - y = ' + v.c + 'e^{x}$, halla el coeficiente $A$ en la solución particular $y_p = Ax\\,e^{x}$.'; },
      function (v) { return v.c / 4; },
      'Como $P(r) = r^4 - 1$, $P\'(1) = 4(1)^3 = 4$. Entonces $4A = c \\implies A = c/4$.',
      { mistakes: {
          div2: function (v) { return v.c / 2; },
          raw: function (v) { return v.c; }
        },
        feedback: [
          { when: 'div2', say: 'Casi: la derivada del característico es $4r^3$, que en $r=1$ vale 4, no 2.' },
          { when: 'raw', say: 'Casi: se divide entre 4.' }
        ] }),

    N('sup-09', 'superior', 2, { c: [8, 32, 4] },
      function (v) { return 'Calcula el coeficiente $A$ de $y_p = Ax\\,e^{-x}$ para la ecuación $y^{(4)} - y = ' + v.c + 'e^{-x}$.'; },
      function (v) { return -v.c / 4; },
      'Evaluando $P\'(-1) = 4(-1)^3 = -4$, se deduce $-4A = c \\implies A = -c/4$.',
      { mistakes: {
          pos: function (v) { return v.c / 4; },
          div2: function (v) { return -v.c / 2; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: $P\'(-1) = 4(-1)^3 = -4$, por lo que $A = c/(-4) = -c/4$.' },
          { when: 'div2', say: 'Casi: el divisor es 4.' }
        ] }),

    N('sup-10', 'superior', 2, { c: [1, 5, 1] },
      function (v) { return 'Para la ecuación $y\'\' - y = 4e^{x} + ' + v.c + '$, encuentra la solución particular combinada $y_p(x)$ y calcula su valor numérico en $x = 1$.'; },
      function (v) { return 2 * Math.E - v.c; },
      'Para $4e^x$, $y_{p1} = 2xe^x$; para la constante, $-y = c \\implies y_{p2} = -c$. En $x=1$, $y_p(1) = 2e - c$.',
      { mistakes: {
          posC: function (v) { return 2 * Math.E + v.c; },
          noTwo: function (v) { return Math.E - v.c; }
        },
        feedback: [
          { when: 'posC', say: function (v) { return 'Casi: al sustituir la constante $B$ en $-y$ queda $-B = ' + v.c + ' \\implies B = -' + v.c + '$.'; } },
          { when: 'noTwo', say: 'Casi: el coeficiente de la parte exponencial es $A = 4/2 = 2$.' }
        ] }),

    N('sup-11', 'superior', 2, { c: [6, 18, 2] },
      function (v) { return 'Para la ecuación de tercer orden $y\'\'\' + y\' = ' + v.c + '\\cos x$, la solución particular tiene la forma $y_p = A x\\cos x$. Calcula el valor de $A$.'; },
      function (v) { return -v.c / 2; },
      'Como $(x u)\'\'\' + (x u)\' = -2u = -2A\\cos x = c\\cos x$, se tiene $-2A = c \\implies A = -c/2$.',
      { mistakes: {
          pos: function (v) { return v.c / 2; },
          div3: function (v) { return -v.c / 3; }
        },
        feedback: [
          { when: 'pos', say: function (v) { return 'Casi: al sustituir se obtiene $-2A = ' + v.c + '$, por lo que $A = -' + v.c + '/2$.'; } },
          { when: 'div3', say: 'Casi: la primera derivada compensa parcialmente a la tercera, dejando $-2$, no $-3$.' }
        ] }),

    N('sup-12', 'superior', 3, { c: [8, 20, 4] },
      function (v) { return 'Para la ecuación $y\'\'\' + y\' = ' + v.c + '\\sin x$, encuentra la solución particular $y_p(x)$ y calcula su valor exacto evaluado en $x = \\frac{\\pi}{2}$.'; },
      function (v) { return -(v.c * Math.PI) / 4; },
      'Con $y_p = -(c/2)x\\sin x$, evaluando en $x = \\pi/2$ se obtiene $-(c/2)(\\pi/2) = -c\\pi / 4$.',
      { mistakes: {
          pos: function (v) { return (v.c * Math.PI) / 4; },
          noPi: function (v) { return -v.c / 4; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: el coeficiente de la propuesta es $B = -c/2 < 0$, dando un resultado negativo.' },
          { when: 'noPi', say: 'Casi: en $x = \\pi/2$ el factor $x$ introduce un término proporcional a $\\pi$.' }
        ] }),

    N('sup-13', 'superior', 3, { c: [12, 24, 4] },
      function (v) { return 'Para la ecuación diferencial $y\'\' - 4y = 4e^{2x} + ' + v.c + 'e^{-2x}$, calcula el valor de la derivada de la solución particular en el origen, $y_p\'(0)$.'; },
      function (v) { return 1 - v.c / 4; },
      'Como $y_p(x) = x e^{2x} - (c/4)x e^{-2x}$, derivando y evaluando en $x=0$ queda $1 - c/4$.',
      { mistakes: {
          add: function (v) { return 1 + v.c / 4; },
          raw: function (v) { return 4 - v.c; }
        },
        feedback: [
          { when: 'add', say: function (v) { return 'Casi: la raíz $-2$ produce un denominador $-4$, por lo que el segundo término resta: $1 - ' + (v.c / 4) + '$.'; } },
          { when: 'raw', say: 'Casi: ambos coeficientes deben dividirse entre 4.' }
        ] }),

    N('sup-14', 'superior', 3, { c: [32, 128, 32] },
      function (v) { return 'Para la ecuación diferencial de cuarto orden $y^{(4)} - 16y = ' + v.c + 'e^{2x}$, calcula el coeficiente $A$ en la solución particular $y_p = Ax\\,e^{2x}$.'; },
      function (v) { return v.c / 32; },
      'Con $P(r) = r^4 - 16$, la derivada en la raíz simple $r=2$ es $P\'(2) = 4(2)^3 = 32$. Por ello $32A = c \\implies A = c/32$.',
      { mistakes: {
          div16: function (v) { return v.c / 16; },
          div8: function (v) { return v.c / 8; }
        },
        feedback: [
          { when: 'div16', say: 'Casi: el divisor es $P\'(2) = 4(2)^3 = 32$, no el término constante 16.' },
          { when: 'div8', say: 'Casi: $4 \\times 2^3 = 32$, no 8.' }
        ] }),

    N('sup-15', 'superior', 3, { y0: [2, 6, 1], k: [1, 5, 1] },
      function (v) { return 'Para el problema de tercer orden $y\'\'\' - y\' = 2e^{x}$ con $y(0) = ' + v.y0 + '$, $y\'(0) = 3$ y $y\'\'(0) = ' + (2 * v.k) + '$, calcula la constante $c_2$ en la solución $y(x) = c_1 + c_2 e^x + c_3 e^{-x} + x\\,e^x$.'; },
      function (v) { return v.k; },
      'De $c_2 - c_3 = 3 - 1 = 2$ y $c_2 + c_3 = 2k - 2$, sumando ambas ecuaciones se obtiene $2c_2 = 2k \\implies c_2 = k$.',
      { mistakes: {
          noShift: function (v) { return (3 + 2 * v.k) / 2; },
          sign: function (v) { return -v.k; }
        },
        feedback: [
          { when: 'noShift', say: 'Casi: resta las derivadas de $y_p = x e^x$ en el origen: $y_p\'(0) = 1$ y $y_p\'\'(0) = 2$.' },
          { when: 'sign', say: 'Casi: la suma da $2c_2 = 2k \\implies c_2 = k > 0$.' }
        ] })
  ];

  K.register(SUBTEMAS, Q);
})();
