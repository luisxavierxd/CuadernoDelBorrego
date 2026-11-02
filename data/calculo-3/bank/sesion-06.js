/* =====================================================================
   Banco · Cálculo 3 · S06 · Ecuaciones exactas: ∂M/∂y = ∂N/∂x y función potencial.
   100 preguntas propias (source: 'propia').
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c3', '06');

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
    'c3.S06.exactitud': 'Forma diferencial y prueba de exactitud',
    'c3.S06.potencial': 'Cálculo de la función potencial y h(y)',
    'c3.S06.pvi': 'Solución general F = C y fijar la constante',
    'c3.S06.curvas': 'Curvas de nivel y geometría del gradiente',
    'c3.S06.explicita': 'Despeje explícito y evaluación de la solución',
    'c3.S06.parametro': 'Ecuaciones con parámetro k y no exactas'
  };

  var Q = [
    /* ======================= 1. Forma diferencial y prueba de exactitud (18) ======================= */
    C('ex-definicion-forma', 'exactitud', 1,
      '¿Cómo se llama la expresión matemática $M(x, y)\\,dx + N(x, y)\\,dy = 0$ asociada a una ecuación diferencial de primer orden?',
      'Forma diferencial de la ecuación', [
        ['Forma estándar lineal', 'Casi: la forma estándar lineal es $y\' + P(x)y = Q(x)$.'],
        ['Ecuación en variables separadas', 'Casi: eso solo ocurre si $M$ depende solo de $x$ y $N$ solo de $y$.'],
        ['Forma canónica de Bernoulli', 'Casi: Bernoulli tiene la forma $y\' + Py = Qy^n$.']],
      'Toda EDO de primer orden $y\' = -M/N$ puede escribirse en forma diferencial $M\\,dx + N\\,dy = 0$.'),

    C('ex-condicion-clairaut', 'exactitud', 1,
      'Para que la ecuación $M(x, y)\\,dx + N(x, y)\\,dy = 0$ con derivadas continuas sea exacta en una región rectangular, ¿qué igualdad debe cumplirse?',
      '$\\dfrac{\\partial M}{\\partial y} = \\dfrac{\\partial N}{\\partial x}$', [
        ['$\\dfrac{\\partial M}{\\partial x} = \\dfrac{\\partial N}{\\partial y}$', 'Casi: invertiste las variables de derivación; $M$ se deriva respecto a $y$ y $N$ respecto a $x$.'],
        ['$\\dfrac{\\partial M}{\\partial y} = -\\dfrac{\\partial N}{\\partial x}$', 'Casi: las parciales deben ser iguales, no de signo contrario.'],
        ['$M(x, y) = N(x, y)$', 'Casi: las funciones no tienen que ser iguales, solo sus derivadas cruzadas.']],
      'Por el teorema de Clairaut, si $M = F_x$ y $N = F_y$, entonces $M_y = F_{xy} = F_{yx} = N_x$.'),

    C('ex-identificar-m-n', 'exactitud', 1,
      'Al reescribir la ecuación $\\dfrac{dy}{dx} = -\\dfrac{3x^2 + 2y}{2x + 4y}$ como $M\\,dx + N\\,dy = 0$, ¿quiénes son $M$ y $N$?',
      '$M(x, y) = 3x^2 + 2y$ y $N(x, y) = 2x + 4y$', [
        ['$M(x, y) = 2x + 4y$ y $N(x, y) = 3x^2 + 2y$', 'Casi: $M$ acompaña a $dx$ (proviene del numerador) y $N$ a $dy$ (del denominador).'],
        ['$M(x, y) = -(3x^2 + 2y)$ y $N(x, y) = -(2x + 4y)$', 'Casi: al multiplicar por el denominador y pasar sumando, ambos coeficientes quedan positivos.'],
        ['$M(x, y) = 3x^2$ y $N(x, y) = 4y$', 'Casi: los términos mixtos $2y$ y $2x$ forman parte de $M$ y $N$.']],
      'Multiplicando por $(2x + 4y)\\,dx$ queda $(2x + 4y)\\,dy = -(3x^2 + 2y)\\,dx$, es decir, $(3x^2 + 2y)\\,dx + (2x + 4y)\\,dy = 0$.'),

    C('ex-parcial-y-de-m', 'exactitud', 1,
      'Si $M(x, y) = 4x^3 y^2 + 5x$, ¿cuál es su derivada parcial $\\dfrac{\\partial M}{\\partial y}$ considerando a $x$ constante?',
      '$8x^3 y$', [
        ['$12x^2 y^2 + 5$', 'Casi: derivaste respecto a $x$ en lugar de respecto a $y$.'],
        ['$8x^3 y + 5$', 'Casi: el término $5x$ no tiene $y$, por lo que su derivada respecto a $y$ es $0$.'],
        ['$4x^3 y$', 'Casi: bajando el exponente $2$ de $y^2$ queda $4 \\cdot 2 x^3 y = 8x^3 y$.']],
      'Al derivar respecto a $y$, $x$ se comporta como constante: $\\partial(4x^3 y^2)/\\partial y = 8x^3 y$ y $\\partial(5x)/\\partial y = 0$.'),

    C('ex-parcial-x-de-n', 'exactitud', 1,
      'Para $N(x, y) = x^2 e^{3y} - \\cos(y)$, ¿cuánto vale la derivada parcial $\\dfrac{\\partial N}{\\partial x}$ considerando a $y$ constante?',
      '$2x e^{3y}$', [
        ['$3x^2 e^{3y} + \\sin(y)$', 'Casi: derivaste respecto a $y$; para $N_x$ se deriva respecto a $x$ manteniendo fija a $y$.'],
        ['$2x e^{3y} - \\cos(y)$', 'Casi: el término $-\\cos(y)$ solo depende de $y$, así que su derivada respecto a $x$ es $0$.'],
        ['$x^2 e^{3y}$', 'Casi: la derivada de $x^2$ respecto a $x$ es $2x$, no $x^2$.']],
      'Tratando a $y$ como constante: $\\partial(x^2 e^{3y})/\\partial x = 2x e^{3y}$ y $\\partial(\\cos y)/\\partial x = 0$.'),

    C('ex-origen-nombre-exacta', 'exactitud', 1,
      '¿Por qué se llama «exacta» a una ecuación diferencial de la forma $M\\,dx + N\\,dy = 0$?',
      'Porque el lado izquierdo es exactamente el diferencial total $dF$ de alguna función potencial $F(x, y)$', [
        ['Porque su solución no tiene errores de redondeo numérico', 'Casi: exactitud no se refiere a la aritmética computacional, sino a ser un diferencial exacto.'],
        ['Porque solo tiene soluciones que son polinomios exactos', 'Casi: una ecuación exacta puede involucrar funciones trigonométricas, logaritmos o exponenciales.'],
        ['Porque la constante de integración siempre vale exactamente cero', 'Casi: la constante $C$ toma cualquier valor real según la condición inicial.']],
      'La expresión $M\\,dx + N\\,dy$ es exacta porque coincide con el diferencial total $dF = F_x\\,dx + F_y\\,dy$.'),

    N('ex-evaluar-my-lineal', 'exactitud', 2,
      { a: [2, 6, 1], b: [2, 5, 1], x0: [1, 3, 1] },
      function (v) { return 'Para la ecuación $(' + v.a + 'xy + ' + v.b + 'x^2)\\,dx + (' + (v.a * 0.5) + 'x^2 + 4y)\\,dy = 0$, calcula el valor de la derivada cruzada $\\dfrac{\\partial M}{\\partial y}$ evaluada en $x = ' + v.x0 + '$.'; },
      function (v) { return v.a * v.x0; },
      'Al derivar $M = a xy + b x^2$ respecto a $y$ resulta $a x$. Evaluando en $x_0$ se obtiene la respuesta.',
      {
        where: function (v) { return v.a !== v.b; },
        mistakes: {
          swapped: function (v) { return v.b * v.x0; },
          derivX: function (v) { return v.a + 2 * v.b * v.x0; },
          half: function (v) { return 0.5 * v.a * v.x0; }
        },
        feedback: [
          { when: 'swapped', say: 'Casi: el término que tiene $y$ en $M$ tiene coeficiente $a$, no $b$.' },
          { when: 'derivX', say: 'Casi: derivaste respecto a $x$; para $M_y$ se deriva respecto a $y$.' },
          { when: 'half', say: 'Casi: no dividas entre 2; la derivada de $a xy$ respecto a $y$ es $a x$.' }
        ]
      }),

    N('ex-evaluar-nx-trig', 'exactitud', 2,
      { a: [2, 5, 1], b: [2, 6, 1], x0: [1, 3, 1] },
      function (v) { return 'Dada la ecuación $(e^{' + v.b + 'y} + ' + (2 * v.a) + 'x)\\,dx + (' + v.b + 'x e^{' + v.b + 'y} + ' + (3 * v.a) + 'y^2)\\,dy = 0$, calcula $\\dfrac{\\partial N}{\\partial x}$ cuando $y = 0$ y $x = ' + v.x0 + '$.'; },
      function (v) { return v.b; },
      '$\\partial N/\\partial x = b e^{b y}$. En $y = 0$, $e^0 = 1$, por lo que $N_x = b$ independiente de $x$.',
      {
        where: function (v) { return v.b !== 2 * v.a; },
        mistakes: {
          zero: function () { return 0; },
          wrongTerm: function (v) { return 2 * v.a; },
          withE: function (v) { return v.b * Math.E; }
        },
        feedback: [
          { when: 'zero', say: 'Casi: el término $b x e^{b y}$ tiene derivada no nula respecto a $x$: es $b e^{b y}$.' },
          { when: 'wrongTerm', say: 'Casi: ese valor corresponde a derivar $M$ respecto a $x$.' },
          { when: 'withE', say: 'Casi: en $y = 0$, $e^{b(0)} = e^0 = 1$.' }
        ]
      }),

    N('ex-diferencia-cruzadas', 'exactitud', 2,
      { a: [3, 7, 1], b: [1, 4, 1] },
      function (v) { return 'En la ecuación $(' + v.a + 'xy^2 + 1)\\,dx + (' + v.b + 'x^2 y - 3)\\,dy = 0$, calcula la diferencia $M_y - N_x$ evaluada en el punto $(x, y) = (1, 1)$.'; },
      function (v) { return 2 * (v.a - v.b); },
      '$M_y = 2a x y$ y $N_x = 2b x y$. En $(1, 1)$, $M_y - N_x = 2(a - b)$.',
      {
        where: function (v) { return v.a !== v.b; },
        mistakes: {
          noTwo: function (v) { return v.a - v.b; },
          invSign: function (v) { return 2 * (v.b - v.a); },
          added: function (v) { return 2 * (v.a + v.b); }
        },
        feedback: [
          { when: 'noTwo', say: 'Casi: al derivar $y^2$ baja un 2, y al derivar $x^2$ también baja un 2.' },
          { when: 'invSign', say: 'Casi: se pide $M_y - N_x$, no $N_x - M_y$.' },
          { when: 'added', say: 'Casi: la diferencia es una resta, no una suma.' }
        ]
      }),

    C('ex-signo-al-despejar', 'exactitud', 2,
      'Si una ecuación viene escrita como $(x^2 - y)\\,dx = (x + y^2)\\,dy$, ¿cuál es la forma $M\\,dx + N\\,dy = 0$ correcta y cuánto valen $M_y$ y $N_x$?',
      '$(x^2 - y)\\,dx - (x + y^2)\\,dy = 0$, con $M_y = -1$ y $N_x = -1$ (es exacta)', [
        ['$(x^2 - y)\\,dx + (x + y^2)\\,dy = 0$, con $M_y = -1$ y $N_x = 1$ (no es exacta)', 'Casi: al pasar el término del lado derecho restando, el signo frente al paréntesis debe ser negativo.'],
        ['$(x^2 - y)\\,dx - (x + y^2)\\,dy = 0$, con $M_y = 1$ y $N_x = 1$', 'Casi: $\\partial(-y)/\\partial y = -1$ y $\\partial(-x)/\\partial x = -1$, ambos son negativos.'],
        ['$(x + y^2)\\,dx - (x^2 - y)\\,dy = 0$, intercambiando $dx$ y $dy$', 'Casi: no puedes intercambiar los diferenciales arbitrariamente.']],
      'Restando el lado derecho queda $(x^2 - y)\\,dx - (x + y^2)\\,dy = 0$, de donde $M = x^2 - y \\implies M_y = -1$, y $N = -(x + y^2) \\implies N_x = -1$.'),

    C('ex-verificar-tres-terminos', 'exactitud', 2,
      '¿Es exacta la ecuación diferencial $(2xy + \\cos y)\\,dx + (x^2 - x\\sin y)\\,dy = 0$?',
      'Sí, porque $M_y = 2x - \\sin y$ y $N_x = 2x - \\sin y$', [
        ['No, porque $M_y = 2x + \\sin y$ tiene signo positivo', 'Casi: la derivada de $\\cos y$ respecto a $y$ es $-\\sin y$, no $+\\sin y$.'],
        ['No, porque la presencia de funciones trigonométricas impide que una ecuación sea exacta', 'Casi: cualquier función diferenciable puede formar una ecuación exacta si se cumple $M_y = N_x$.'],
        ['Sí, pero únicamente sobre la recta $y = 0$', 'Casi: la igualdad $M_y = N_x$ se cumple en todo el plano $\\mathbb{R}^2$.']],
      'Calculando ambas parciales: $M_y = 2x - \\sin y$ y $N_x = 2x - \\sin y$. Al coincidir en todo el plano, la ecuación es exacta.'),

    N('ex-coeficiente-cruzado-potencia', 'exactitud', 2,
      { m: [2, 5, 1], n: [2, 4, 1] },
      function (v) { return 'En la ecuación exacta $(' + v.m + 'x^{' + (v.m - 1) + '}y^{' + v.n + '} + 2x)\\,dx + (' + v.n + 'x^{' + v.m + '}y^{' + (v.n - 1) + '} + 3y^2)\\,dy = 0$, ¿cuál es el coeficiente numérico común de $x^{' + (v.m - 1) + '}y^{' + (v.n - 1) + '}$ en las derivadas cruzadas $M_y$ y $N_x$?'; },
      function (v) { return v.m * v.n; },
      'Al derivar $M$ respecto a $y$ baja el exponente $n$: $m \\cdot n$. Al derivar $N$ respecto a $x$ baja $m$: $n \\cdot m$. El coeficiente común es $m n$.',
      {
        where: function (v) { return !(v.m === 2 && v.n === 2); },
        mistakes: {
          added: function (v) { return v.m + v.n; },
          power: function (v) { return Math.pow(v.m, v.n); },
          minus: function (v) { return v.m * (v.n - 1); }
        },
        feedback: [
          { when: 'added', say: 'Casi: los exponentes se multiplican por la regla de potencias, no se suman.' },
          { when: 'power', say: 'Casi: se multiplica el coeficiente por el exponente que baja.' },
          { when: 'minus', say: 'Casi: el coeficiente completo es $m \\cdot n$.' }
        ]
      }),

    C('ex-no-depende-de-dx', 'exactitud', 2,
      'Un compañero afirma: «$(3x^2 y)\\,dx + (x^3 + 2y)\\,dy = 0$ no es exacta porque $M$ depende de $y$ y $N$ depende de $x$». ¿Qué le respondes?',
      'Que su afirmación es falsa: para ser exacta $M$ y $N$ suelen depender de ambas variables y aquí $M_y = 3x^2 = N_x$', [
        ['Que tiene razón: para ser exacta $M$ solo debe depender de $x$ y $N$ solo de $y$', 'Casi: si $M(x)$ y $N(y)$, la ecuación sería separable, lo cual es solo un caso trivial de exacta.'],
        ['Que no es exacta porque $N_x = 3x^2 + 2$', 'Casi: el término $2y$ en $N$ tiene derivada $0$ respecto a $x$.'],
        ['Que la ecuación no tiene solución en los números reales', 'Casi: la ecuación tiene infinitas soluciones dadas por curvas de nivel.']],
      'La condición de exactitud es $M_y = N_x$, y aquí $M_y = 3x^2$ coincide con $N_x = 3x^2$.'),

    N('ex-evaluar-nx-racional', 'exactitud', 2,
      { a: [2, 6, 2], b: [2, 5, 1] },
      function (v) { return 'Para la ecuación $(\\dfrac{' + v.a + 'y}{x} + ' + v.b + 'x)\\,dx + (' + v.a + '\\ln x + 2y)\\,dy = 0$ (con $x > 0$), calcula el valor de $N_x$ en $x = 2$.'; },
      function (v) { return v.a / 2; },
      '$N_x = \\partial(a\\ln x + 2y)/\\partial x = a/x$. En $x = 2$, $N_x = a/2$.',
      {
        mistakes: {
          timesTwo: function (v) { return v.a * 2; },
          noDiv: function (v) { return v.a; },
          withLn: function (v) { return v.a * Math.log(2); }
        },
        feedback: [
          { when: 'timesTwo', say: 'Casi: la derivada de $\\ln x$ es $1/x$, por lo que se divide entre $x$, no se multiplica.' },
          { when: 'noDiv', say: 'Casi: falta evaluar en $x = 2$ dividiendo $a$ entre $2$.' },
          { when: 'withLn', say: 'Casi: derivaste $\\ln x$; no queda $\\ln(2)$, sino $1/2$.' }
        ]
      }),

    C('ex-rectangulo-simplemente-conexo', 'exactitud', 2,
      '¿Por qué el teorema de existencia de la función potencial exige que el dominio sea un rectángulo o un conjunto simplemente conexo sin agujeros?',
      'Porque en dominios con agujeros pueden existir formas cerradas que no son diferenciales de una función univaluada', [
        ['Porque la regla de la cadena solo es válida dentro de cuadrados y rectángulos', 'Casi: la regla de la cadena vale en cualquier conjunto abierto.'],
        ['Porque las derivadas parciales cruzadas solo existen en figuras geométricas con cuatro lados', 'Casi: la derivabilidad es una propiedad local.'],
        ['Porque las curvas de nivel no pueden dibujarse en regiones circulares', 'Casi: las curvas de nivel existen en cualquier tipo de región.']],
      'En regiones simplemente conexas, $M_y = N_x$ garantiza que la integral de línea no dependa de la trayectoria y exista un potencial univaluado.'),

    N('ex-segunda-derivada-cruzada', 'exactitud', 3,
      { a: [2, 5, 1], b: [1, 4, 1] },
      function (v) { return 'Para la ecuación exacta $(3x^2 y^2 + ' + v.a + 'x)\\,dx + (2x^3 y + ' + v.b + 'e^y)\\,dy = 0$, calcula el valor de la derivada de orden superior $\\dfrac{\\partial^2 M}{\\partial x\\partial y}$ evaluada en $(x, y) = (1, 1)$.'; },
      function (v) { return 12; },
      '$M_y = 6x^2 y$. Derivando respecto a $x$: $\\partial(6x^2 y)/\\partial x = 12x y$. En $(1, 1)$, vale 12.',
      {
        mistakes: {
          six: function () { return 6; },
          eighteen: function () { return 18; },
          addedA: function (v) { return 12 + v.a; }
        },
        feedback: [
          { when: 'six', say: 'Casi: derivaste solo respecto a $y$; falta derivar ese resultado respecto a $x$.' },
          { when: 'eighteen', say: 'Casi: la derivada de $6x^2$ respecto a $x$ es $12x$, no $18x$.' },
          { when: 'addedA', say: 'Casi: el término $ax$ se anula al derivar respecto a $y$.' }
        ]
      }),

    C('ex-vortice-clasico', 'exactitud', 3,
      'La forma diferencial $\\omega = -\\dfrac{y}{x^2 + y^2}\\,dx + \\dfrac{x}{x^2 + y^2}\\,dy$ cumple $M_y = N_x$ en todo $\\mathbb{R}^2 \\setminus \\{(0, 0)\\}$. Sin embargo, ¿por qué no proviene de una función potencial continua y de un solo valor en todo ese dominio?',
      'Porque el dominio tiene un agujero en el origen y la integral a lo largo del círculo unitario da $2\\pi \\neq 0$ (la función potencial es el ángulo $\\theta = \\arctan(y/x)$)', [
        ['Porque $M$ y $N$ no son funciones derivables en ningún punto del plano', 'Casi: $M$ y $N$ son infinitamente derivables fuera del origen $(0, 0)$.'],
        ['Porque las derivadas cruzadas son positivas en un cuadrante y negativas en otro', 'Casi: $M_y = N_x = \\frac{y^2 - x^2}{(x^2 + y^2)^2}$ en todas partes excepto el origen.'],
        ['Porque ninguna ecuación con denominadores puede ser exacta', 'Casi: muchas ecuaciones con denominadores son exactas en regiones donde no se anulan.']],
      'El ángulo $\\theta$ aumenta en $2\\pi$ tras dar una vuelta completa al origen, impidiendo definir un potencial univaluado en el plano perforado.'),

    C('ex-cadena-forma-diferencial', 'exactitud', 3,
      'Si $y(x)$ es una solución de la ecuación exacta $M\\,dx + N\\,dy = 0$, ¿qué resultado se obtiene al calcular la derivada total $\\dfrac{d}{dx}[F(x, y(x))]$ mediante la regla de la cadena?',
      '$\\dfrac{\\partial F}{\\partial x} + \\dfrac{\\partial F}{\\partial y}\\dfrac{dy}{dx} = M + N\\left(-\\dfrac{M}{N}\\right) = 0$, demostrando que $F$ es constante', [
        ['$\\dfrac{\\partial F}{\\partial x}\\dfrac{\\partial F}{\\partial y} = M\\,N$, que siempre es positivo', 'Casi: la regla de la cadena para una función de dos variables suma los productos, no multiplica las parciales.'],
        ['$\\dfrac{dF}{dx} = M_y + N_x = 2M_y$', 'Casi: no se derivan $M$ y $N$; se usan las parciales $F_x$ y $F_y$ multiplicadas por $dx/dx$ y $dy/dx$.'],
        ['$\\dfrac{dF}{dx} = \\dfrac{M}{N}$', 'Casi: la derivada total respecto a $x$ se anula idénticamente porque nos movemos sobre una curva solución.']],
      'Por la regla de la cadena, $dF/dx = F_x + F_y y\' = M + N(-M/N) = 0$, lo que confirma que $F(x, y(x))$ es constante a lo largo de la solución.'),

    /* ======================= 2. Cálculo de la función potencial y h(y) (18) ======================= */
    C('po-por-que-h-de-y', 'potencial', 1,
      'Al integrar $M(x, y)$ respecto a $x$ con $y$ fija para obtener $F(x, y) = \\int M(x, y)\\,dx + h(y)$, ¿por qué la constante de integración se escribe como una función arbitraria $h(y)$?',
      'Porque cualquier función que dependa solo de $y$ actúa como una constante respecto a $x$ ya que $\\dfrac{\\partial}{\\partial x}[h(y)] = 0$', [
        ['Porque la constante de integración numérica no existe en las ecuaciones diferenciales', 'Casi: la constante numérica se fijará al final; respecto a $x$, toda función $h(y)$ tiene derivada parcial cero.'],
        ['Porque $M(x, y)$ siempre es un polinomio en la variable $y$', 'Casi: el método funciona con cualquier función continua, no solo con polinomios.'],
        ['Porque al derivar respecto a $y$ la función $h(y)$ se elimina por completo', 'Casi: al derivar respecto a $y$, $h(y)$ pasa a ser $h\'(y)$, que es precisamente lo que se iguala con $N$.']],
      'Cualquier término que solo dependa de $y$ tiene derivada parcial cero respecto a $x$, por lo que debe incluirse como $h(y)$ al integrar.'),

    C('po-como-se-halla-h-prima', 'potencial', 1,
      'Una vez que tienes $F(x, y) = \\int M\\,dx + h(y)$, ¿cuál es el paso de la receta para determinar la derivada $h\'(y)$?',
      'Derivar la expresión respecto a $y$ e igualarla con $N(x, y)$', [
        ['Derivar la expresión respecto a $x$ e igualarla a cero', 'Casi: derivar respecto a $x$ simplemente te regresa a $M(x, y)$ sin darte información sobre $h(y)$.'],
        ['Sustituir $x = 0$ y $y = 0$ inmediatamente', 'Casi: antes de evaluar números debes encontrar la forma funcional de $h(y)$ comparando con $N$.'],
        ['Integrar $M$ por segunda vez respecto a la variable $y$', 'Casi: el segundo paso compara la derivada parcial en $y$ con el coeficiente $N$.']],
      'Se exige $\\partial F/\\partial y = N$, lo que produce $\\partial(\\int M\\,dx)/\\partial y + h\'(y) = N$, de donde se despeja $h\'(y)$.'),

    C('po-error-sumar-ambas', 'potencial', 1,
      'Un estudiante calcula $I_1 = \\int M\\,dx$ y $I_2 = \\int N\\,dy$, y escribe como potencial la suma $F = I_1 + I_2$. ¿Cuál es el error conceptual de este atajo?',
      'Los términos mixtos que dependen de $x$ y $y$ se cuentan dos veces', [
        ['Que las integrales indefinidas no se pueden sumar en cálculo multivariable', 'Casi: las integrales sí se pueden sumar, pero aquí duplicas los términos que ya salieron en la primera integral.'],
        ['Que el resultado final siempre da cero', 'Casi: el resultado no da cero, sino una función incorrecta con coeficientes duplicados.'],
        ['Que se invierte el signo de la solución general', 'Casi: el problema es de conteo duplicado de términos mixtos, no de cambio de signo.']],
      'Si $F$ tiene un término como $x^2 y$, este aparece tanto en $\\int M\\,dx$ como en $\\int N\\,dy$; sumarlos directamente produce $2x^2 y$.'),

    C('po-empezar-por-n', 'potencial', 1,
      'Si en la ecuación exacta $M\\,dx + N\\,dy = 0$ la integral $\\int M\\,dx$ es muy complicada pero $\\int N\\,dy$ es inmediata, ¿cómo se plantea el método alternativo?',
      'Se integra $N$ respecto a $y$ sumando $g(x)$: $F(x, y) = \\int N\\,dy + g(x)$, y luego se deriva respecto a $x$ para igualar con $M$', [
        ['Se intercambian los nombres de $x$ y $y$ sin cambiar nada más', 'Casi: debes mantener la relación geométrica entre las variables; lo correcto es integrar $N$ respecto a $y$ y añadir $g(x)$.'],
        ['Se concluye que la ecuación no se puede resolver', 'Casi: el método es completamente simétrico respecto a empezar con $M$ o con $N$.'],
        ['Se divide toda la ecuación entre $dx$ y se resuelve por variables separables', 'Casi: la ecuación no es necesariamente separable.']],
      'Por simetría, $F(x, y) = \\int N\\,dy + g(x)$; al derivar respecto a $x$, $F_x = \\partial(\\int N\\,dy)/\\partial x + g\'(x) = M$ permite hallar $g(x)$.'),

    C('po-h-prima-no-tiene-x', 'potencial', 1,
      'Si al calcular $h\'(y) = N - \\dfrac{\\partial}{\\partial y}\\int M\\,dx$ en una ecuación supuestamente exacta te queda un término con $x$, ¿qué conclusión es segura?',
      'Hubo un error de cálculo o la ecuación diferencial original no era exacta', [
        ['Es normal: solo debes tratar a $x$ como una constante arbitraria e integrar respecto a $y$', 'Casi: $h(y)$ solo puede depender de $y$; si queda $x$, la igualdad $M_y = N_x$ no se cumple.'],
        ['Significa que la función potencial debe ser igual a cero', 'Casi: significa que no existe tal función potencial para esa ecuación.'],
        ['Indica que la constante $C$ de la solución general depende de $x$', 'Casi: la constante $C$ es un número real, no una función.']],
      'Si $M_y = N_x$, la derivada respecto a $x$ de esa diferencia es $N_x - M_y = 0$, por lo que $x$ nunca puede sobrevivir en $h\'(y)$.'),

    N('po-hallar-h-prima-polinomio', 'potencial', 2,
      { a: [2, 5, 1], c: [2, 5, 1], y0: [1, 2, 1] },
      function (v) { return 'En la ecuación exacta $(' + (2 * v.a) + 'xy + 3)\\,dx + (' + v.a + 'x^2 + ' + (3 * v.c) + 'y^2)\\,dy = 0$, se integra $M$ dando $F = ' + v.a + 'x^2 y + 3x + h(y)$. ¿Cuánto vale $h\'(y)$ evaluada en $y = ' + v.y0 + '$?'; },
      function (v) { return 3 * v.c * v.y0 * v.y0; },
      '$F_y = a x^2 + h\'(y) = a x^2 + 3c y^2$, de donde $h\'(y) = 3c y^2$. Evaluando se obtiene la respuesta.',
      {
        mistakes: {
          noFactor: function (v) { return v.c * v.y0 * v.y0; },
          half: function (v) { return 1.5 * v.c * v.y0 * v.y0; },
          quad: function (v) { return 6 * v.c * v.y0 * v.y0; }
        },
        feedback: [
          { when: 'noFactor', say: 'Casi: el coeficiente de $y^2$ en $N$ es $3c$, no $c$.' },
          { when: 'half', say: 'Casi: no dividas entre 2; $h\'(y) = 3c y^2$.' },
          { when: 'quad', say: 'Casi: no dupliques el coeficiente $3c$.' }
        ]
      }),

    N('po-coeficiente-h-cubico', 'potencial', 2,
      { a: [2, 6, 1], k: [2, 5, 1] },
      function (v) { return 'Para la ecuación exacta $(' + (3 * v.a) + 'x^2 y + 2x)\\,dx + (' + v.a + 'x^3 + ' + (4 * v.k) + 'y^3)\\,dy = 0$, se integra $M$ para hallar el potencial $F(x, y) = ' + v.a + 'x^3 y + x^2 + h(y)$. Si se elige $h(0) = 0$, ¿cuál es el coeficiente numérico de $y^4$ en la función $h(y)$?'; },
      function (v) { return v.k; },
      '$h\'(y) = 4k y^3$. Integrando respecto a $y$, $h(y) = k y^4$, por lo que el coeficiente es $k$.',
      {
        mistakes: {
          fourK: function (v) { return 4 * v.k; },
          twelveK: function (v) { return 12 * v.k; },
          halfK: function (v) { return v.k / 2; }
        },
        feedback: [
          { when: 'fourK', say: 'Casi: olvidaste dividir entre 4 al integrar $4k y^3$ respecto a $y$.' },
          { when: 'twelveK', say: 'Casi: derivaste $4k y^3$ en lugar de integrarla.' },
          { when: 'halfK', say: 'Casi: la integral de $y^3$ es $y^4/4$, así que $4k(y^4/4) = k y^4$.' }
        ]
      }),

    N('po-evaluar-potencial-origen', 'potencial', 2,
      { a: [1, 4, 1], b: [2, 5, 1], c: [1, 3, 1] },
      function (v) { return 'Encuentra la función potencial $F(x, y)$ de $(' + (2 * v.a) + 'xy + ' + (3 * v.b) + 'x^2)\\,dx + (' + v.a + 'x^2 + ' + (2 * v.c) + 'y)\\,dy = 0$ con $F(0, 0) = 0$, y calcula su valor en el punto $(1, 2)$.'; },
      function (v) { return 2 * v.a + v.b + 4 * v.c; },
      '$F(x, y) = a x^2 y + b x^3 + c y^2$. Evaluando en $(1, 2)$ resulta $2a + b + 4c$.',
      {
        mistakes: {
          missingH: function (v) { return 2 * v.a + v.b; },
          noSquareY: function (v) { return 2 * v.a + v.b + 2 * v.c; },
          doubled: function (v) { return 4 * v.a + v.b + 4 * v.c; }
        },
        feedback: [
          { when: 'missingH', say: 'Casi: olvidaste sumar el término $h(y) = c y^2$ al evaluar el potencial.' },
          { when: 'noSquareY', say: 'Casi: la integral de $2cy$ es $c y^2$, así que $y$ va al cuadrado.' },
          { when: 'doubled', say: 'Casi: el término cruzado es $a x^2 y$, no $2a x^2 y$.' }
        ]
      }),

    E('po-expr-potencial-sencillo', 'potencial', 2,
      { a: [2, 5, 1], b: [1, 4, 1] },
      function (v) { return 'Encuentra la función potencial $F(x, y)$ con $F(0, 0) = 0$ para la ecuación exacta $(' + (2 * v.a) + 'x + y)\\,dx + (x + ' + (2 * v.b) + 'y)\\,dy = 0$. Escribe tu respuesta en términos de $x$ e $y$.'; },
      function (v) { return v.a + '*x^2 + x*y + ' + v.b + '*y^2'; },
      'Integrando $M$: $a x^2 + xy + h(y)$. Derivando en $y$: $x + h\'(y) = x + 2by \\implies h(y) = b y^2$. El potencial es $a x^2 + xy + b y^2$.',
      {
        exprVars: ['x', 'y'],
        domain: { x: [-2, 2], y: [-2, 2] },
        mistakes: {
          missingH: function (v) { return v.a + '*x^2 + x*y'; },
          noCross: function (v) { return v.a + '*x^2 + ' + v.b + '*y^2'; }
        },
        feedback: [
          { when: 'missingH', say: 'Casi: te faltó el término $b y^2$ que proviene de $h(y)$.' },
          { when: 'noCross', say: 'Casi: olvidaste el término cruzado $x y$ que une a ambas variables.' }
        ]
      }),

    E('po-expr-potencial-exp', 'potencial', 2,
      { a: [2, 4, 1] },
      function (v) { return 'Calcula la función potencial $F(x, y)$ con $F(0, 0) = 0$ para la ecuación exacta $(e^y + ' + (2 * v.a) + 'x)\\,dx + (x e^y + 3y^2)\\,dy = 0$.'; },
      function (v) { return 'x*exp(y) + ' + v.a + '*x^2 + y^3'; },
      '$\\int (e^y + 2ax)\\,dx = x e^y + ax^2 + h(y)$. Derivando respecto a $y$: $x e^y + h\'(y) = x e^y + 3y^2 \\implies h(y) = y^3$.',
      {
        exprVars: ['x', 'y'],
        domain: { x: [-1.5, 1.5], y: [-1, 1] },
        mistakes: {
          missingH: function (v) { return 'x*exp(y) + ' + v.a + '*x^2'; },
          noExp: function (v) { return 'x*y + ' + v.a + '*x^2 + y^3'; }
        },
        feedback: [
          { when: 'missingH', say: 'Casi: falta la parte de $y$: $h(y) = y^3$.' },
          { when: 'noExp', say: 'Casi: la exponencial $e^y$ no se convierte en $y$; se conserva $x e^y$.' }
        ]
      }),

    N('po-empezar-por-n-log', 'potencial', 2,
      { a: [2, 5, 1], x0: [3, 5, 1] },
      function (v) { return 'En la ecuación exacta $(\\dfrac{y}{x} + ' + (2 * v.a) + 'x)\\,dx + (\\ln x + 4y)\\,dy = 0$ para $x > 0$, conviene integrar primero $N$ respecto a $y$: $F = y\\ln x + 2y^2 + g(x)$. ¿Cuánto vale la derivada $g\'(x)$ evaluada en $x = ' + v.x0 + '$?'; },
      function (v) { return 2 * v.a * v.x0; },
      '$F_x = y/x + g\'(x) = y/x + 2ax \\implies g\'(x) = 2ax$. Evaluando en $x_0$ se obtiene el resultado.',
      {
        mistakes: {
          half: function (v) { return v.a * v.x0; },
          derivX: function (v) { return 2 * v.a; },
          quad: function (v) { return 4 * v.a * v.x0; }
        },
        feedback: [
          { when: 'half', say: 'Casi: falta el factor 2: el término en $M$ tiene coeficiente $2a$.' },
          { when: 'derivX', say: 'Casi: volviste a derivar respecto a $x$ en lugar de evaluar en el punto dado.' },
          { when: 'quad', say: 'Casi: no dupliques el valor; $g\'(x) = 2ax$.' }
        ]
      }),

    N('po-valor-h-cero-trig', 'potencial', 2,
      { a: [2, 6, 1], b: [2, 5, 1] },
      function (v) { return 'Para la ecuación exacta $(' + v.a + '\\cos x + 2xy)\\,dx + (x^2 + ' + (3 * v.b) + 'y^2)\\,dy = 0$, se integra $M$ respecto a $x$ dando $F = ' + v.a + '\\sin x + x^2 y + h(y)$. Si fijamos $h(0) = 0$, ¿cuánto vale $h(1)$?'; },
      function (v) { return v.b; },
      '$F_y = x^2 + h\'(y) = x^2 + 3b y^2 \\implies h\'(y) = 3b y^2 \\implies h(y) = b y^3$. Por lo tanto, $h(1) = b$.',
      {
        mistakes: {
          threeB: function (v) { return 3 * v.b; },
          halfB: function (v) { return v.b / 2; },
          negB: function (v) { return -v.b; }
        },
        feedback: [
          { when: 'threeB', say: 'Casi: esa es la derivada $h\'(1) = 3b$; al integrar $3by^2$ queda $b y^3$.' },
          { when: 'halfB', say: 'Casi: revisa la integración de $3b y^2$.' },
          { when: 'negB', say: 'Casi: el término tiene signo positivo.' }
        ]
      }),

    C('po-termino-independiente', 'potencial', 2,
      '¿Qué papel juega la constante numérica $+C_0$ que aparece al integrar $h\'(y)$ para encontrar $h(y)$?',
      'Se puede elegir $C_0 = 0$ sin pérdida de generalidad, porque la solución general de la EDO ya absorberá cualquier constante en $F(x, y) = C$', [
        ['Es un error grave omitirla porque la ecuación se vuelve incompleta', 'Casi: como la solución es $F(x, y) = C$, cualquier constante aditiva en $F$ se resta con $C$ y se agrupa.'],
        ['Debe calcularse siempre evaluando en el origen $(0, 0)$ obligatoriamente', 'Casi: no es obligatorio que pase por el origen; la constante se ajusta con la condición inicial.'],
        ['Convierte a la ecuación diferencial en una de segundo orden', 'Casi: la ecuación sigue siendo de primer orden.']],
      'Si tomas $F(x, y) + C_0 = C_1$, simplemente defines $C = C_1 - C_0$, por lo que tomar $C_0 = 0$ es la convención estándar.'),

    N('po-comparar-potencial-dos-puntos', 'potencial', 2,
      { a: [2, 5, 1] },
      function (v) { return 'La función potencial de $(2xy + ' + v.a + ')\\,dx + (x^2 + 2y)\\,dy = 0$ con $F(0, 0) = 0$ es $F(x, y) = x^2 y + ' + v.a + 'x + y^2$. ¿Cuánto vale la diferencia $F(2, 1) - F(1, 1)$?'; },
      function (v) { return 3 + v.a; },
      '$F(2, 1) = 5 + 2a$ y $F(1, 1) = 2 + a$. La diferencia es $(5 - 2) + (2a - a) = 3 + a$.',
      {
        mistakes: {
          noA: function () { return 3; },
          onlyF21: function (v) { return 5 + 2 * v.a; },
          added: function (v) { return 7 + 3 * v.a; }
        },
        feedback: [
          { when: 'noA', say: 'Casi: olvidaste incluir la diferencia de los términos lineales: $2a - a = a$.' },
          { when: 'onlyF21', say: 'Casi: falta restar el valor de $F(1, 1)$.' },
          { when: 'added', say: 'Casi: se pide la resta $F(2, 1) - F(1, 1)$, no la suma.' }
        ]
      }),

    E('po-expr-potencial-tres-terminos', 'potencial', 3,
      { a: [2, 4, 1] },
      function (v) { return 'Halla la función potencial $F(x, y)$ con $F(0, 0) = 0$ para la ecuación exacta $(3x^2 y^2 + 2x)\\,dx + (2x^3 y + ' + (4 * v.a) + 'y^3)\\,dy = 0$.'; },
      function (v) { return 'x^3*y^2 + x^2 + ' + v.a + '*y^4'; },
      '$\\int (3x^2 y^2 + 2x)\\,dx = x^3 y^2 + x^2 + h(y)$. Derivando en $y$: $2x^3 y + h\'(y) = 2x^3 y + 4a y^3 \\implies h(y) = a y^4$.',
      {
        exprVars: ['x', 'y'],
        domain: { x: [-1.5, 1.5], y: [-1.5, 1.5] },
        mistakes: {
          missingH: function () { return 'x^3*y^2 + x^2'; },
          noPowerY: function (v) { return 'x^3*y^2 + x^2 + ' + (4 * v.a) + '*y^3'; }
        },
        feedback: [
          { when: 'missingH', say: 'Casi: te faltó el término $h(y) = a y^4$ al integrar respecto a $y$.' },
          { when: 'noPowerY', say: 'Casi: la integral de $4a y^3$ es $a y^4$, no $4a y^3$.' }
        ]
      }),

    E('po-expr-potencial-racional', 'potencial', 3,
      { a: [2, 5, 1] },
      function (v) { return 'Encuentra la función potencial $F(x, y)$ con $F(1, 1) = 0$ para la ecuación exacta $(\\dfrac{' + v.a + '}{x} + \\dfrac{' + v.a + 'y}{x^2})\\,dx - \\dfrac{' + v.a + '}{x}\\,dy = 0$ en el semiplano $x > 0$.'; },
      function (v) { return v.a + '*log(x) - (' + v.a + '*y)/x + ' + v.a; },
      '$F(x, y) = a\\ln x - ay/x + C$. Con $F(1, 1) = 0$ resulta $C = a$.',
      {
        exprVars: ['x', 'y'],
        domain: { x: [0.5, 3], y: [0.5, 3] },
        mistakes: {
          noC: function (v) { return v.a + '*log(x) - (' + v.a + '*y)/x'; },
          invSign: function (v) { return v.a + '*log(x) + (' + v.a + '*y)/x - ' + v.a; }
        },
        feedback: [
          { when: 'noC', say: 'Casi: falta la constante $+a$ para que $F(1, 1) = 0$.' },
          { when: 'invSign', say: 'Casi: revisa el signo del término con $y/x$; $N$ es negativo.' }
        ]
      }),

    C('po-metodo-agrupamiento', 'potencial', 3,
      'El método de inspección (o agrupamiento de diferenciales) reconoce que $(2x y\\,dx + x^2\\,dy) + (3x^2\\,dx) = 0$ se escribe como $d(x^2 y) + d(x^3) = 0$. ¿Cuál es la principal ventaja de este enfoque?',
      'Permite escribir la función potencial $F(x, y) = x^2 y + x^3$ directamente sin resolver integrales iteradas', [
        ['Funciona incluso si la ecuación no es exacta', 'Casi: solo funciona si los grupos forman diferenciales exactos, lo que equivale a la exactitud.'],
        ['Elimina la necesidad de usar una constante de integración', 'Casi: la solución general sigue siendo $F(x, y) = C$.'],
        ['Permite despejar $y(x)$ de forma lineal siempre', 'Casi: la función resultante puede ser no lineal en $y$.']],
      'Reconocer derivadas de productos como $d(x^2 y) = 2xy\\,dx + x^2\\,dy$ produce el potencial $F = x^2 y + x^3$ por simple inspección.'),

    N('po-h-con-trig-evaluada', 'potencial', 3,
      { a: [2, 4, 1], b: [2, 4, 1] },
      function (v) { return 'Para la ecuación exacta $(y\\cos(xy) + ' + v.a + 'x)\\,dx + (x\\cos(xy) + ' + v.b + 'e^{' + v.b + 'y})\\,dy = 0$, se obtiene el potencial $F(x, y) = \\sin(xy) + \\dfrac{' + v.a + '}{2}x^2 + h(y)$ con $h(0) = 0$. ¿Cuánto vale $h(1)$?'; },
      function (v) { return Math.exp(v.b) - 1; },
      '$h\'(y) = b e^{b y} \\implies h(y) = e^{b y} - 1$ para que $h(0) = 0$. Evaluando en $1$ queda $e^b - 1$.',
      {
        mistakes: {
          noMinusOne: function (v) { return Math.exp(v.b); },
          timesB: function (v) { return v.b * Math.exp(v.b); },
          halfExp: function (v) { return 0.5 * (Math.exp(v.b) - 1); }
        },
        feedback: [
          { when: 'noMinusOne', say: 'Casi: falta restar 1 para que se cumpla la condición $h(0) = 0$.' },
          { when: 'timesB', say: 'Casi: esa es la derivada $h\'(1) = b e^b$, no la función $h(1)$.' },
          { when: 'halfExp', say: 'Casi: al integrar $b e^{b y}$ el factor $b$ se cancela con la regla de la cadena.' }
        ]
      }),

    /* ======================= 3. Solución general F = C y fijar la constante (18) ======================= */
    C('pv-solucion-implicita-concepto', 'pvi', 1,
      'Cuando resolvemos una ecuación exacta y obtenemos $F(x, y) = C$, ¿por qué decimos que la solución está dada en forma implícita?',
      'Porque la variable dependiente $y$ no está despejada en términos de $x$, sino relacionada a través de la ecuación $F(x, y) = C$', [
        ['Porque la constante $C$ no se puede calcular bajo ninguna condición', 'Casi: la constante $C$ se fija inmediatamente con un punto inicial $(x_0, y_0)$.'],
        ['Porque la solución solo es válida para valores imaginarios de $x$', 'Casi: las soluciones son curvas en el plano real $\\mathbb{R}^2$.'],
        ['Porque es una solución aproximada calculada numéricamente', 'Casi: $F(x, y) = C$ es una solución analítica exacta de la EDO.']],
      'Una relación implícita define a $y$ como función de $x$ sin requerir aislarla algebraicamente del lado izquierdo.'),

    C('pv-como-se-halla-c', 'pvi', 1,
      'Si la solución general de una ecuación exacta es $F(x, y) = C$ y se tiene la condición inicial $y(x_0) = y_0$, ¿cómo se determina el valor numérico de la constante $C$?',
      'Evaluando la función potencial en el punto inicial: $C = F(x_0, y_0)$', [
        ['Derivando $F$ respecto a $x$ y sustituyendo $x_0$', 'Casi: al derivar obtendrías $M(x_0, y_0)$, no el valor de la constante.'],
        ['Igualando $F(x_0, y_0) = 0$ y despejando $x_0$', 'Casi: $F(x_0, y_0)$ da directamente el valor de la constante $C$, que no necesariamente es cero.'],
        ['Integrando $F$ en el intervalo $[0, x_0]$', 'Casi: no se integra; simplemente se evalúa la función potencial en las coordenadas $(x_0, y_0)$.']],
      'La curva solución que pasa por $(x_0, y_0)$ satisface la ecuación de nivel, por lo que $C = F(x_0, y_0)$.'),

    C('pv-curva-unica-unicidad', 'pvi', 1,
      'Bajo las hipótesis del teorema de existencia y unicidad con $M_y = N_x$ continuas y $N(x_0, y_0) \\neq 0$, ¿cuántas curvas de nivel de la familia $F(x, y) = C$ pasan por el punto dado $(x_0, y_0)$?',
      'Exactamente una curva de nivel, la correspondiente a $C = F(x_0, y_0)$', [
        ['Infinitas curvas de nivel que se cruzan en ese punto', 'Casi: dos curvas de nivel distintas $C_1 \\neq C_2$ de la misma función univaluada nunca se intersecan.'],
        ['Ninguna, porque las curvas de nivel solo pasan por el origen', 'Casi: las curvas de nivel cubren todo el dominio del plano.'],
        ['Dos curvas de nivel simétricas', 'Casi: cada punto tiene un único valor de altura $F(x_0, y_0) = C$.']],
      'Como $F$ es una función univaluada, en cada punto $(x_0, y_0)$ toma un único valor $C$, definiendo una sola curva de nivel.'),

    C('pv-error-olvidar-c', 'pvi', 1,
      'Un alumno escribe en su examen que la solución de la ecuación exacta es simplemente $x^2 y + 3x + 2y^2$, sin igualar a nada. ¿Qué le faltó para que sea una solución de la EDO?',
      'Igualarla a una constante: $x^2 y + 3x + 2y^2 = C$, pues las soluciones son curvas del plano y no una función suelta', [
        ['Derivar la expresión respecto a $x$', 'Casi: la derivada solo comprobaría que es un potencial, no daría la solución.'],
        ['Sumarle $+dx$ al final', 'Casi: la solución de una EDO es una relación entre variables, no una forma diferencial.'],
        ['Dividir la expresión entre $y$', 'Casi: no se divide; la ecuación de las soluciones es $F(x, y) = C$.']],
      'La función potencial $F$ no es la solución; las soluciones son las curvas de nivel $F(x, y) = C$ sobre las cuales $dF = 0$.'),

    C('pv-cambio-signo-c', 'pvi', 1,
      'Si dos estudiantes resuelven la misma ecuación exacta y uno llega a $x^2 + y^2 = C$ mientras que el otro escribe $-x^2 - y^2 = K$, ¿representan ambas la misma familia geométrica de soluciones?',
      'Sí, representan exactamente las mismas curvas cambiando la etiqueta de la constante con $K = -C$', [
        ['No, una representa circunferencias y la otra hipérbolas', 'Casi: $-x^2 - y^2 = K$ es lo mismo que $x^2 + y^2 = -K$, que también son circunferencias si $-K > 0$.'],
        ['No, porque el signo negativo invalida la existencia de la solución', 'Casi: multiplicar ambos lados de una igualdad por $-1$ genera una ecuación equivalente.'],
        ['Solo si la constante vale cero en ambos casos', 'Casi: son equivalentes para cualquier valor de la constante.']],
      'Multiplicar la ecuación implícita por $-1$ no altera el conjunto geométrico de puntos $(x, y)$ que la satisfacen.'),

    N('pv-constante-polinomica-simple', 'pvi', 2,
      { a: [2, 5, 1], p: [2, 4, 1], q: [2, 4, 1] },
      function (v) { return 'La solución general de $(' + (2 * v.a) + 'x + 2y)\\,dx + (2x + 2y)\\,dy = 0$ es $' + v.a + 'x^2 + 2xy + y^2 = C$. ¿Cuánto vale $C$ para la curva que pasa por el punto $(' + v.p + ', ' + v.q + ')$?'; },
      function (v) { return v.a * v.p * v.p + 2 * v.p * v.q + v.q * v.q; },
      'Sustituyendo $x = p$ y $y = q$ en la función potencial: $C = a p^2 + 2pq + q^2$.',
      {
        where: function (v) { return v.p !== v.q; },
        mistakes: {
          noCross: function (v) { return v.a * v.p * v.p + v.q * v.q; },
          swapped: function (v) { return v.a * v.q * v.q + 2 * v.p * v.q + v.p * v.p; },
          noSquare: function (v) { return v.a * v.p + 2 * v.p * v.q + v.q; }
        },
        feedback: [
          { when: 'noCross', say: 'Casi: olvidaste el término cruzado $2xy = 2pq$ al sustituir el punto.' },
          { when: 'swapped', say: 'Casi: intercambiaste las coordenadas: $x = p$ y $y = q$.' },
          { when: 'noSquare', say: 'Casi: $x$ y $y$ están al cuadrado en los términos extremos.' }
        ]
      }),

    N('pv-constante-cubica', 'pvi', 2,
      { b: [2, 4, 1], p: [2, 4, 1], q: [2, 4, 1] },
      function (v) { return 'Para la ecuación exacta $(3x^2 + ' + v.b + 'y)\\,dx + (' + v.b + 'x + 3y^2)\\,dy = 0$, cuya solución general es $x^3 + ' + v.b + 'xy + y^3 = C$, determina el valor de $C$ con la condición inicial $y(' + v.p + ') = ' + v.q + '$.'; },
      function (v) { return Math.pow(v.p, 3) + v.b * v.p * v.q + Math.pow(v.q, 3); },
      '$C = p^3 + b p q + q^3$. Evaluando las coordenadas del punto inicial.',
      {
        where: function (v) { return v.p !== v.q; },
        mistakes: {
          squared: function (v) { return v.p * v.p + v.b * v.p * v.q + v.q * v.q; },
          noCross: function (v) { return Math.pow(v.p, 3) + Math.pow(v.q, 3); },
          doubleCross: function (v) { return Math.pow(v.p, 3) + 2 * v.b * v.p * v.q + Math.pow(v.q, 3); }
        },
        feedback: [
          { when: 'squared', say: 'Casi: los términos son cúbicos ($x^3$ y $y^3$), no cuadráticos.' },
          { when: 'noCross', say: 'Casi: te faltó sumar el término $b xy = b p q$.' },
          { when: 'doubleCross', say: 'Casi: el coeficiente de $xy$ es $b$, no $2b$.' }
        ]
      }),

    N('pv-constante-trig-cero', 'pvi', 2,
      { a: [2, 6, 1], b: [2, 5, 1] },
      function (v) { return 'La ecuación exacta $(' + v.a + 'e^x\\sin y)\\,dx + (' + v.a + 'e^x\\cos y + ' + (2 * v.b) + 'y)\\,dy = 0$ tiene solución general $' + v.a + 'e^x\\sin y + ' + v.b + 'y^2 = C$. ¿Cuánto vale $C$ para la solución que cumple $y(0) = 2$?'; },
      function (v) { return v.a * Math.sin(2) + 4 * v.b; },
      '$x = 0 \\implies e^0 = 1$. Entonces $C = a(1)\\sin(2) + b(2^2) = a\\sin(2) + 4b$.',
      {
        mistakes: {
          sinZero: function (v) { return 4 * v.b; },
          noSquare: function (v) { return v.a * Math.sin(2) + 2 * v.b; },
          minusSin: function (v) { return -v.a * Math.sin(2) + 4 * v.b; }
        },
        feedback: [
          { when: 'sinZero', say: 'Casi: en $y = 2$, $\\sin(2) \\neq 0$; no confundas con evaluar en $y = 0$.' },
          { when: 'noSquare', say: 'Casi: en el término $b y^2$, el $2$ va al cuadrado: $2^2 = 4$.' },
          { when: 'minusSin', say: 'Casi: el término con seno tiene signo positivo.' }
        ]
      }),

    N('pv-constante-log-punto', 'pvi', 2,
      { a: [2, 6, 2], p: [2, 5, 1] },
      function (v) { return 'La ecuación $(y/x + ' + v.a + 'x)\\,dx + (\\ln x - 3)\\,dy = 0$ para $x > 0$ tiene solución general $y\\ln x + \\dfrac{' + v.a + '}{2}x^2 - 3y = C$. Calcula $C$ para la condición inicial $y(1) = ' + v.p + '$.'; },
      function (v) { return 0.5 * v.a - 3 * v.p; },
      'En $x = 1$, $\\ln(1) = 0$, así que el término $y\\ln x$ se anula. Queda $C = \\frac{a}{2}(1)^2 - 3p = 0.5a - 3p$.',
      {
        mistakes: {
          noHalf: function (v) { return v.a - 3 * v.p; },
          posThree: function (v) { return 0.5 * v.a + 3 * v.p; },
          forgotLn1: function (v) { return v.p + 0.5 * v.a - 3 * v.p; }
        },
        feedback: [
          { when: 'noHalf', say: 'Casi: la integral de $ax$ es $\\frac{a}{2}x^2$, lleva el factor $1/2$.' },
          { when: 'posThree', say: 'Casi: el término $-3y$ tiene signo negativo.' },
          { when: 'forgotLn1', say: 'Casi: recuerda que $\\ln(1) = 0$, por lo que $y\\ln(1) = 0$.' }
        ]
      }),

    N('pv-constante-negativa', 'pvi', 2,
      { a: [2, 5, 1], b: [2, 6, 1] },
      function (v) { return 'Dada la solución general $x^2 y - ' + v.a + 'x + ' + v.b + 'y = C$, determina el valor de la constante $C$ que satisface la condición inicial $y(2) = -1$.'; },
      function (v) { return -4 - 2 * v.a - v.b; },
      'Sustituyendo $x = 2$ y $y = -1$: $C = (2)^2(-1) - a(2) + b(-1) = -4 - 2a - b$.',
      {
        mistakes: {
          posOne: function (v) { return 4 - 2 * v.a + v.b; },
          noSquareX: function (v) { return -2 - 2 * v.a - v.b; },
          invSign: function (v) { return 4 + 2 * v.a + v.b; }
        },
        feedback: [
          { when: 'posOne', say: 'Casi: la condición inicial tiene $y = -1$, ten cuidado con los signos negativos.' },
          { when: 'noSquareX', say: 'Casi: en el término $x^2 y$, $x$ está al cuadrado: $2^2 = 4$.' },
          { when: 'invSign', say: 'Casi: el resultado tiene signo contrario.' }
        ]
      }),

    N('pv-constante-origen', 'pvi', 2,
      { a: [2, 6, 2], b: [2, 6, 2] },
      function (v) { return 'Para la ecuación exacta $(3x^2 y + ' + v.a + 'x)\\,dx + (x^3 + ' + v.b + 'y)\\,dy = 0$, cuya solución general es $x^3 y + \\dfrac{' + v.a + '}{2}x^2 + \\dfrac{' + v.b + '}{2}y^2 = C$, ¿cuánto vale $C$ para la curva solución que pasa por el punto $(2, 2)$?'; },
      function (v) { return 16 + 2 * v.a + 2 * v.b; },
      '$C = (2)^3(2) + \\frac{a}{2}(4) + \\frac{b}{2}(4) = 16 + 2a + 2b$.',
      {
        mistakes: {
          noHalves: function (v) { return 16 + 4 * v.a + 4 * v.b; },
          noProduct: function (v) { return 2 * v.a + 2 * v.b; },
          half: function (v) { return 8 + v.a + v.b; }
        },
        feedback: [
          { when: 'noHalves', say: 'Casi: olvidaste dividir entre 2 al sustituir en $\\frac{a}{2}x^2$ y $\\frac{b}{2}y^2$.' },
          { when: 'noProduct', say: 'Casi: te faltó el término cúbico mixto $x^3 y = 2^3 \\cdot 2 = 16$.' },
          { when: 'half', say: 'Casi: no dividas toda la expresión entre 2.' }
        ]
      }),

    N('pv-constante-inversa', 'pvi', 2,
      { a: [2, 5, 1], p: [2, 4, 1] },
      function (v) { return 'La ecuación $(2xy - ' + v.a + ')\\,dx + (x^2 + 1)\\,dy = 0$ tiene por solución implícita $x^2 y + y - ' + v.a + 'x = C$. Si la curva pasa por $(' + v.p + ', 3)$, calcula el valor numérico de $C$.'; },
      function (v) { return (v.p * v.p + 1) * 3 - v.a * v.p; },
      '$C = p^2(3) + 3 - a(p) = 3(p^2 + 1) - a p$.',
      {
        mistakes: {
          forgotY: function (v) { return v.p * v.p * 3 - v.a * v.p; },
          plusA: function (v) { return (v.p * v.p + 1) * 3 + v.a * v.p; },
          noSquare: function (v) { return (v.p + 1) * 3 - v.a * v.p; }
        },
        feedback: [
          { when: 'forgotY', say: 'Casi: olvidaste el término $+y = 3$ de la función potencial.' },
          { when: 'plusA', say: 'Casi: el término $-ax$ tiene signo negativo.' },
          { when: 'noSquare', say: 'Casi: $x$ está al cuadrado en el primer término.' }
        ]
      }),

    N('pv-constante-fraccionaria', 'pvi', 2,
      { a: [2, 6, 1], b: [2, 5, 1] },
      function (v) { return 'La ecuación exacta $(2x y^3 + ' + v.a + ')\\,dx + (3x^2 y^2 + ' + v.b + ')\\,dy = 0$ tiene solución $x^2 y^3 + ' + v.a + 'x + ' + v.b + 'y = C$. ¿Cuánto vale $C$ para la curva con $y(1) = 1$?'; },
      function (v) { return 1 + v.a + v.b; },
      '$C = (1)^2(1)^3 + a(1) + b(1) = 1 + a + b$.',
      {
        mistakes: {
          noProduct: function (v) { return v.a + v.b; },
          plusFive: function (v) { return 5 + v.a + v.b; },
          timesTwo: function (v) { return 2 * (1 + v.a + v.b); }
        },
        feedback: [
          { when: 'noProduct', say: 'Casi: te faltó el término inicial $x^2 y^3 = 1$.' },
          { when: 'plusFive', say: 'Casi: el término $1^2 \\cdot 1^3$ vale $1$, no $5$.' },
          { when: 'timesTwo', say: 'Casi: no hay que multiplicar toda la suma por 2.' }
        ]
      }),

    N('pv-constante-desplazamiento', 'pvi', 2,
      { a: [2, 4, 1], b: [2, 4, 1] },
      function (v) { return 'Dos soluciones de $(4x + 2y)\\,dx + (2x + 6y)\\,dy = 0$ con potencial $F(x, y) = 2x^2 + 2xy + 3y^2 = C$ pasan por $(1, ' + v.a + ')$ y $(1, ' + (v.a + v.b) + ')$ respectivamente. ¿Cuánto vale la diferencia $C_2 - C_1$ entre sus constantes?'; },
      function (v) { return 2 * v.b + 6 * v.a * v.b + 3 * v.b * v.b; },
      'Restando $F(1, a+b) - F(1, a)$: el término $2(1)^2$ se cancela y queda $2b + 6ab + 3b^2$.',
      {
        mistakes: {
          linearOnly: function (v) { return 2 * v.b + 3 * v.b; },
          noCross: function (v) { return 3 * (Math.pow(v.a + v.b, 2) - v.a * v.a); },
          doubled: function (v) { return 2 * (2 * v.b + 6 * v.a * v.b + 3 * v.b * v.b); }
        },
        feedback: [
          { when: 'linearOnly', say: 'Casi: los términos en $y$ tienen parte cuadrática $3y^2$ que no es lineal.' },
          { when: 'noCross', say: 'Casi: falta considerar el término mixto $2xy$ que cambia de $2a$ a $2(a+b)$.' },
          { when: 'doubled', say: 'Casi: no dupliques la diferencia.' }
        ]
      }),

    N('pv-interseccion-ejes', 'pvi', 3,
      { a: [2, 5, 1], c: [25, 64, 4] },
      function (v) { return 'La curva solución de $(2x + ' + v.a + 'y)\\,dx + (' + v.a + 'x + 2y)\\,dy = 0$ con $C = ' + v.c + '$ tiene por ecuación $x^2 + ' + v.a + 'xy + y^2 = ' + v.c + '$. ¿A qué distancia positiva del origen corta esta curva al eje $x$ (es decir, cuando $y = 0$)?'; },
      function (v) { return Math.sqrt(v.c); },
      'Haciendo $y = 0$ en la ecuación: $x^2 = c \\implies x = \\sqrt{c}$ (para el corte positivo).',
      {
        where: function (v) { return [25, 36, 49, 64].indexOf(v.c) >= 0; },
        mistakes: {
          noRoot: function (v) { return v.c; },
          half: function (v) { return Math.sqrt(v.c) / 2; },
          plusOne: function (v) { return Math.sqrt(v.c) + 2; }
        },
        feedback: [
          { when: 'noRoot', say: 'Casi: $x^2 = c$, por lo que debes sacar la raíz cuadrada para obtener $x$.' },
          { when: 'half', say: 'Casi: no dividas entre 2; la ecuación es directamente $x^2 = c$.' },
          { when: 'plusOne', say: 'Casi: el corte es exactamente $\\sqrt{c}$.' }
        ]
      }),

    N('pv-evaluar-c-cuadratica-trig', 'pvi', 3,
      { a: [2, 5, 1], b: [1, 4, 1], p: [2, 4, 1] },
      function (v) { return 'La ecuación exacta $(2x\\cos y + ' + v.a + ')\\,dx + (' + (2 * v.b) + 'y - x^2\\sin y)\\,dy = 0$ tiene solución $x^2\\cos y + ' + v.a + 'x + ' + v.b + 'y^2 = C$. Calcula el valor de $C$ para la curva que cumple la condición inicial $y(' + v.p + ') = 0$.'; },
      function (v) { return v.p * v.p + v.a * v.p; },
      'Como $y = 0$, $\\cos(0) = 1$ y $y^2 = 0$. Entonces $C = p^2(1) + a p = p^2 + a p$.',
      {
        mistakes: {
          noP: function (v) { return v.p * v.p + v.a; },
          doubled: function (v) { return 2 * (v.p * v.p + v.a * v.p); },
          forgotSquare: function (v) { return v.p + v.a * v.p; }
        },
        feedback: [
          { when: 'noP', say: 'Casi: en el término $ax$ debes sustituir $x = p$.' },
          { when: 'doubled', say: 'Casi: no hay ningún factor 2 multiplicando a toda la expresión.' },
          { when: 'forgotSquare', say: 'Casi: $x$ está al cuadrado en $x^2\\cos y$.' }
        ]
      }),

    N('pv-pvi-tanque-conservativo', 'pvi', 3,
      { a: [2, 4, 1], b: [2, 5, 1], p: [2, 4, 1] },
      function (v) { return 'En un modelo físico con ecuación exacta $(3x^2 + ' + (2 * v.a) + 'x y)\\,dx + (' + v.a + 'x^2 + ' + (3 * v.b) + 'y^2)\\,dy = 0$, el potencial total es $F(x, y) = x^3 + ' + v.a + 'x^2 y + ' + v.b + 'y^3 = C$. Si el sistema parte de $(' + v.p + ', 1)$, ¿cuál es el valor de la energía constante $C$?'; },
      function (v) { return Math.pow(v.p, 3) + v.a * v.p * v.p + v.b; },
      'Sustituyendo $(p, 1)$ en el potencial: $C = p^3 + a p^2(1) + b(1)^3 = p^3 + a p^2 + b$.',
      {
        mistakes: {
          noCubeP: function (v) { return v.p * v.p + v.a * v.p * v.p + v.b; },
          noSquareP: function (v) { return Math.pow(v.p, 3) + v.a * v.p + v.b; },
          doubled: function (v) { return 2 * (Math.pow(v.p, 3) + v.a * v.p * v.p + v.b); }
        },
        feedback: [
          { when: 'noCubeP', say: 'Casi: el primer término es $x^3$, así que $p$ debe ir al cubo.' },
          { when: 'noSquareP', say: 'Casi: en el término $ax^2y$, $x$ va al cuadrado.' },
          { when: 'doubled', say: 'Casi: no dupliques el valor del potencial.' }
        ]
      }),

    C('pv-dominio-definicion-solucion', 'pvi', 3,
      'Dada la solución implícita $x^2 + y^2 = C$ con $C > 0$ proveniente de la ecuación exacta $2x\\,dx + 2y\\,dy = 0$, ¿por qué la solución como función diferenciable $y(x)$ no puede extenderse más allá del intervalo $[-\\sqrt{C}, \\sqrt{C}]$?',
      'Porque fuera de ese intervalo la cantidad $C - x^2$ es negativa y en los extremos $x = \\pm\\sqrt{C}$ la tangente es vertical ($N = 2y = 0$, $dy/dx \\to \\infty$)', [
        ['Porque la función potencial deja de existir fuera del intervalo', 'Casi: el polinomio $F(x, y) = x^2 + y^2$ está definido en todo el plano $\\mathbb{R}^2$.'],
        ['Porque la constante $C$ cambia de valor cuando $x$ crece', 'Casi: la constante $C$ es fija para cada trayectoria.'],
        ['Porque la derivada cruzada $M_y$ se vuelve discontinua', 'Casi: las derivadas cruzadas valen $0$ en todas partes.']],
      'En $y = 0$ la curva tiene recta tangente vertical y el teorema de la función implícita deja de cumplirse al anularse $N = F_y = 0$.'),

    /* ======================= 4. Curvas de nivel y geometría del gradiente (15) ======================= */
    C('cu-analogia-topografica', 'curvas', 1,
      'En la analogía del cerro topográfico presentada en la sesión, ¿qué representa físicamente caminar a lo largo de una curva solución de una ecuación exacta?',
      'Caminar por un sendero a altura constante sobre el cerro, de modo que el cambio vertical total sea $dF = 0$', [
        ['Subir en línea recta hacia la cima por la pendiente más empinada', 'Casi: subir por la pendiente más empinada corresponde a seguir las líneas del gradiente $\\nabla F$, no las curvas de nivel.'],
        ['Bajar hacia el fondo del valle a velocidad constante', 'Casi: eso cambiaría la altura $F$; sobre una solución la altura permanece constante.'],
        ['Dar vueltas alrededor de un punto silla donde no hay pendiente', 'Casi: las curvas de nivel existen en toda la superficie, no solo en puntos silla.']],
      'La ecuación exacta dice $dF = F_x\\,dx + F_y\\,dy = 0$: el cambio de altura al dar un paso $(dx, dy)$ es nulo.'),

    C('cu-gradiente-perpendicular', 'curvas', 1,
      '¿Cuál es la relación geométrica entre el vector gradiente $\\nabla F = (M, N)$ y el vector tangente $(dx, dy)$ a la curva solución en cada punto?',
      'Son perpendiculares (ortogonales), por lo que su producto punto es $\\nabla F \\cdot (dx, dy) = M\\,dx + N\\,dy = 0$', [
        ['Son paralelos y apuntan exactamente en la misma dirección', 'Casi: si fueran paralelos el producto punto sería máximo, no cero.'],
        ['Forman un ángulo de $45^\\circ$ en todos los cuadrantes', 'Casi: el ángulo entre el gradiente y la curva de nivel es siempre de $90^\\circ$.'],
        ['No tienen ninguna relación geométrica definida', 'Casi: el gradiente siempre es normal a las curvas de nivel de cualquier función diferenciable.']],
      'Como $M\\,dx + N\\,dy = (M, N) \\cdot (dx, dy) = 0$, el vector tangente $(dx, dy)$ es perpendicular a $\\nabla F$.'),

    C('cu-pendiente-dy-dx', 'curvas', 1,
      'A partir de la forma diferencial exacta $M\\,dx + N\\,dy = 0$, ¿cómo se expresa la pendiente de la recta tangente $y\' = \\dfrac{dy}{dx}$ en cualquier punto donde $N \\neq 0$?',
      '$\\dfrac{dy}{dx} = -\\dfrac{M(x, y)}{N(x, y)}$', [
        ['$\\dfrac{dy}{dx} = \\dfrac{M(x, y)}{N(x, y)}$', 'Casi: al despejar $dy/dx$ pasando $M\\,dx$ al lado derecho aparece un signo menos: $N\\,dy = -M\\,dx$.'],
        ['$\\dfrac{dy}{dx} = -\\dfrac{N(x, y)}{M(x, y)}$', 'Casi: invertiste la fracción; $dy$ divide a $dx$, por lo que $M$ queda en el numerador.'],
        ['$\\dfrac{dy}{dx} = M(x, y)\\,N(x, y)$', 'Casi: la razón de diferenciales es un cociente, no una multiplicación.']],
      'Despejando: $N\\,dy = -M\\,dx \\implies dy/dx = -M/N$.'),

    C('cu-tangente-vertical-n-cero', 'curvas', 1,
      '¿Qué ocurre geométricamente con la curva solución en los puntos donde $N(x, y) = 0$ y $M(x, y) \\neq 0$?',
      'La recta tangente es vertical y la derivada $\\dfrac{dy}{dx}$ no está definida (se indetermina por división entre cero)', [
        ['La recta tangente es horizontal con pendiente cero', 'Casi: la pendiente es horizontal cuando el numerador se anula ($M = 0$), no el denominador.'],
        ['La curva se detiene y no puede continuar', 'Casi: la curva geométrica continúa de forma suave; solo que $y$ no se puede expresar como función de $x$ ahí.'],
        ['La función potencial $F(x, y)$ se vuelve infinita', 'Casi: la función potencial $F$ puede ser un polinomio perfectamente finito en esos puntos.']],
      'Como $dy/dx = -M/N$, si $N = 0$ y $M \\neq 0$ la pendiente se vuelve infinita, lo que corresponde a una tangente vertical.'),

    C('cu-campo-fuerzas-potencial', 'curvas', 1,
      'En física clásica, si una fuerza bidimensional $\\vec{F} = (F_1, F_2)$ es conservativa con energía potencial $U(x, y)$ tal que $F_1 = -\\dfrac{\\partial U}{\\partial x}$ y $F_2 = -\\dfrac{\\partial U}{\\partial y}$, ¿qué representan las soluciones de $F_1\\,dx + F_2\\,dy = 0$?',
      'Las líneas equipotenciales (curvas donde la energía potencial $U$ es constante)', [
        ['Las trayectorias de aceleración máxima', 'Casi: la aceleración sigue la dirección de la fuerza, ortogonal a las equipotenciales.'],
        ['Los puntos donde la masa de la partícula se anula', 'Casi: la masa no depende de las coordenadas espaciales.'],
        ['Las ondas electromagnéticas generadas por la partícula', 'Casi: estamos tratando con campos estáticos conservativos.']],
      'Como $\\vec{F} = -\\nabla U$, $F_1\\,dx + F_2\\,dy = -dU = 0 \\implies U(x, y) = C$: son las curvas equipotenciales.'),

    C('cu-trayectorias-ortogonales', 'curvas', 1,
      '¿Cuál es la ecuación diferencial que describe a las trayectorias ortogonales (las líneas que cortan perpendicularmente a las curvas de nivel $F = C$)?',
      '$\\dfrac{dy}{dx} = \\dfrac{N(x, y)}{M(x, y)}$ (el recíproco negativo de $-M/N$)', [
        ['$\\dfrac{dy}{dx} = -\\dfrac{M(x, y)}{N(x, y)}$', 'Casi: esa es la pendiente de las propias curvas de nivel, no de sus trayectorias ortogonales.'],
        ['$\\dfrac{dy}{dx} = -\\dfrac{N(x, y)}{M(x, y)}$', 'Casi: el recíproco negativo de $-M/N$ es $+N/M$, sin signo menos.'],
        ['$\\dfrac{dy}{dx} = M(x, y) + N(x, y)$', 'Casi: dos curvas son perpendiculares cuando el producto de sus pendientes es $-1$.']],
      'Si la pendiente original es $m_1 = -M/N$, la pendiente perpendicular es $m_2 = -1/m_1 = N/M$.'),

    N('cu-calcular-pendiente-punto', 'curvas', 2,
      { a: [2, 5, 1], b: [1, 4, 1] },
      function (v) { return 'Para la ecuación exacta $(' + (2 * v.a) + 'x + ' + v.b + 'y)\\,dx + (' + v.b + 'x + 4y)\\,dy = 0$, calcula la pendiente de la recta tangente $\\dfrac{dy}{dx}$ a la solución en el punto $(1, 1)$.'; },
      function (v) { return -(2 * v.a + v.b) / (v.b + 4); },
      '$dy/dx = -M(1, 1)/N(1, 1) = -(2a + b)/(b + 4)$.',
      {
        mistakes: {
          posSlope: function (v) { return (2 * v.a + v.b) / (v.b + 4); },
          inverted: function (v) { return -(v.b + 4) / (2 * v.a + v.b); },
          half: function (v) { return -0.5 * (2 * v.a + v.b) / (v.b + 4); }
        },
        feedback: [
          { when: 'posSlope', say: 'Casi: olvidaste el signo menos en la fórmula $dy/dx = -M/N$.' },
          { when: 'inverted', say: 'Casi: invertiste la fracción; $M$ va en el numerador y $N$ en el denominador.' },
          { when: 'half', say: 'Casi: no dividas entre 2 la pendiente.' }
        ]
      }),

    N('cu-magnitud-gradiente', 'curvas', 2,
      { a: [2, 4, 1], b: [2, 4, 1] },
      function (v) { return 'En la ecuación exacta con potencial $F(x, y) = ' + v.a + 'x^2 + ' + v.b + 'y^2$, el gradiente es $\\nabla F = (' + (2 * v.a) + 'x, ' + (2 * v.b) + 'y)$. Calcula la magnitud al cuadrado $\\|\\nabla F\\|^2$ en el punto $(2, 1)$.'; },
      function (v) { return 16 * v.a * v.a + 4 * v.b * v.b; },
      'En $(2, 1)$, $\\nabla F = (4a, 2b)$. La magnitud al cuadrado es $(4a)^2 + (2b)^2 = 16a^2 + 4b^2$.',
      {
        mistakes: {
          notSquared: function (v) { return 4 * v.a + 2 * v.b; },
          noFour: function (v) { return 4 * v.a * v.a + v.b * v.b; },
          half: function (v) { return 8 * v.a * v.a + 2 * v.b * v.b; }
        },
        feedback: [
          { when: 'notSquared', say: 'Casi: la norma al cuadrado suma los cuadrados de las componentes.' },
          { when: 'noFour', say: 'Casi: al sustituir $x = 2$ en $2ax$ resulta $4a$, y al elevar al cuadrado da $16a^2$.' },
          { when: 'half', say: 'Casi: no dividas entre 2 la suma de cuadrados.' }
        ]
      }),

    N('cu-tangente-horizontal', 'curvas', 2,
      { a: [2, 8, 2], b: [2, 5, 1] },
      function (v) { return 'La curva solución de $(2x - ' + v.a + ')\\,dx + (' + v.b + 'y + 1)\\,dy = 0$ tiene una recta tangente horizontal cuando $\\dfrac{dy}{dx} = 0$. ¿En qué valor de $x$ ocurre esto?'; },
      function (v) { return v.a / 2; },
      'La tangente es horizontal cuando el numerador se anula: $M = 2x - a = 0 \\implies x = a/2$.',
      {
        mistakes: {
          negA: function (v) { return -v.a / 2; },
          double: function (v) { return v.a; },
          quad: function (v) { return 2 * v.a; }
        },
        feedback: [
          { when: 'negA', say: 'Casi: al despejar $2x - a = 0$ resulta $x = +a/2$.' },
          { when: 'double', say: 'Casi: olvidaste dividir entre el coeficiente 2 de $x$.' },
          { when: 'quad', say: 'Casi: se divide entre 2, no se multiplica por 2.' }
        ]
      }),

    N('cu-tangente-vertical-punto', 'curvas', 2,
      { a: [1, 4, 1], b: [4, 12, 4] },
      function (v) { return 'Para la ecuación $(' + (2 * v.a) + 'x + 3)\\,dx + (4y - ' + v.b + ')\\,dy = 0$, la curva solución tiene tangente vertical donde $N = 0$. ¿Cuánto vale la coordenada $y$ en esos puntos?'; },
      function (v) { return v.b / 4; },
      'La tangente es vertical cuando $N = 4y - b = 0 \\implies y = b/4$.',
      {
        mistakes: {
          negB: function (v) { return -v.b / 4; },
          timesFour: function (v) { return v.b; },
          half: function (v) { return v.b / 2; }
        },
        feedback: [
          { when: 'negB', say: 'Casi: al despejar $4y - b = 0$ pasa sumando: $y = +b/4$.' },
          { when: 'timesFour', say: 'Casi: debes dividir entre el coeficiente 4 de $y$.' },
          { when: 'half', say: 'Casi: debes dividir entre 4, no entre 2.' }
        ]
      }),

    N('cu-angulo-pendiente-uno', 'curvas', 2,
      { a: [4, 7, 1], b: [2, 3, 1] },
      function (v) { return 'En la ecuación $(' + v.a + 'x + y)\\,dx + (x + ' + v.b + 'y)\\,dy = 0$, ¿qué valor debe tener la razón $y/x$ en los puntos donde la pendiente de la curva solución es exactamente $\\dfrac{dy}{dx} = -1$?'; },
      function (v) { return (v.a - 1) / (v.b - 1); },
      '$dy/dx = -(ax + y)/(x + by) = -1 \\implies ax + y = x + by \\implies (b-1)y = (a-1)x \\implies y/x = (a-1)/(b-1)$.',
      {
        where: function (v) { return (v.a - 1) !== (v.b - 1) && (v.a - 1) / (v.b - 1) !== 2; },
        mistakes: {
          inverted: function (v) { return (v.b - 1) / (v.a - 1); },
          noMinus: function (v) { return v.a / v.b; },
          added: function (v) { return (v.a + 1) / (v.b + 1); }
        },
        feedback: [
          { when: 'inverted', say: 'Casi: invertiste la razón; se pide $y/x$, que es $(a-1)/(b-1)$.' },
          { when: 'noMinus', say: 'Casi: olvidaste restar los términos unitarios al despejar.' },
          { when: 'added', say: 'Casi: al pasar restando $x$ y $y$ quedan signos negativos: $a-1$ y $b-1$.' }
        ]
      }),

    N('cu-curvatura-circunferencia', 'curvas', 2,
      { r: [2, 6, 1] },
      function (v) { return 'Las soluciones de $2x\\,dx + 2y\\,dy = 0$ son circunferencias concéntricas $x^2 + y^2 = r^2$. Para la circunferencia con radio $r = ' + v.r + '$, ¿cuánto vale su curvatura constante $\\kappa = 1/r$?'; },
      function (v) { return 1 / v.r; },
      'La curvatura geométrica de una circunferencia de radio $r$ es exactamente $\\kappa = 1/r$.',
      {
        mistakes: {
          radius: function (v) { return v.r; },
          square: function (v) { return 1 / (v.r * v.r); },
          half: function (v) { return 1 / (2 * v.r); }
        },
        feedback: [
          { when: 'radius', say: 'Casi: la curvatura es el recíproco del radio, $\\kappa = 1/r$, no el radio mismo.' },
          { when: 'square', say: 'Casi: la curvatura es $1/r$, no $1/r^2$.' },
          { when: 'half', say: 'Casi: no multipliques el denominador por 2.' }
        ]
      }),

    C('cu-curvas-elipses-forma', 'curvas', 2,
      'Para la ecuación exacta $(2x + y)\\,dx + (x + 2y)\\,dy = 0$ con potencial $F(x, y) = x^2 + xy + y^2$, ¿qué tipo de curvas geométricas son las soluciones $F(x, y) = C$ con $C > 0$?',
      'Elipses rotadas a $45^\\circ$ con centro en el origen', [
        ['Hipérbolas con asíntotas diagonales', 'Casi: el discriminante $B^2 - 4AC = 1^2 - 4(1)(1) = -3 < 0$, lo que corresponde a una elipse, no a una hipérbola.'],
        ['Parábolas paralelas al eje $x$', 'Casi: una parábola requiere que el discriminante sea cero.'],
        ['Familias de rectas paralelas', 'Casi: la ecuación es cuadrática, por lo que las soluciones son curvas cerradas (elipses).']],
      'Como $B^2 - 4AC = 1 - 4 = -3 < 0$ y los coeficientes son positivos, las curvas de nivel son elipses.'),

    N('cu-semi-ejes-elipse', 'curvas', 3,
      { c: [12, 48, 12] },
      function (v) { return 'La elipse $x^2 + y^2 + xy = ' + v.c + '$ corta a la recta diagonal $y = x$ en dos vértices simétricos. ¿Cuál es el valor positivo de la coordenada $x$ en ese vértice?'; },
      function (v) { return Math.sqrt(v.c / 3); },
      'Sustituyendo $y = x$ en la ecuación: $x^2 + x^2 + x^2 = 3x^2 = c \\implies x = \\sqrt{c/3}$.',
      {
        mistakes: {
          noThree: function (v) { return Math.sqrt(v.c); },
          noRoot: function (v) { return v.c / 3; },
          half: function (v) { return 0.5 * Math.sqrt(v.c / 3); }
        },
        feedback: [
          { when: 'noThree', say: 'Casi: al sustituir $y = x$ se suman tres términos: $x^2 + x^2 + x^2 = 3x^2$.' },
          { when: 'noRoot', say: 'Casi: debes sacar la raíz cuadrada para obtener la coordenada $x$.' },
          { when: 'half', say: 'Casi: no dividas entre 2 el resultado de la raíz.' }
        ]
      }),

    C('cu-puntos-criticos-potencial', 'curvas', 3,
      'Si en un punto $(x_0, y_0)$ se tiene que $M(x_0, y_0) = 0$ y $N(x_0, y_0) = 0$ al mismo tiempo, ¿qué representa este punto en la geometría del potencial $F(x, y)$?',
      'Un punto crítico de $F(x, y)$ (donde $\\nabla F = \\vec{0}$), y un punto de equilibrio para la EDO', [
        ['Un punto donde la función potencial deja de ser diferenciable', 'Casi: $F$ puede ser perfectamente suave; que sus derivadas se anulen define un punto crítico estándar.'],
        ['El único punto del plano por donde no pasa ninguna curva de nivel', 'Casi: sí pasa una curva de nivel, la correspondiente al valor crítico $C = F(x_0, y_0)$.'],
        ['Un punto donde la pendiente $dy/dx$ vale exactamente $1$', 'Casi: en ese punto $dy/dx = -0/0$ es una indeterminación y varias curvas pueden intersectarse.']],
      'Si $M = F_x = 0$ y $N = F_y = 0$, el gradiente se anula: es un punto crítico de la superficie $z = F(x, y)$.'),

    /* ======================= 5. Despeje explícito y evaluación de la solución (15) ======================= */
    C('ep-cuando-se-puede-despejar', 'explicita', 1,
      '¿En cuál de las siguientes soluciones implícitas $F(x, y) = C$ es siempre posible despejar $y(x)$ de forma explícita mediante la fórmula general cuadrática?',
      'Cuando $F(x, y)$ es un polinomio de grado a lo sumo 2 en la variable $y$, como $A(x)y^2 + B(x)y + C(x) = 0$', [
        ['Cuando $F(x, y)$ contiene términos trascendentes como $y\\sin y + e^y$', 'Casi: las ecuaciones trascendentes en $y$ en general no admiten despeje elemental explícito.'],
        ['Únicamente cuando la ecuación diferencial original es separable', 'Casi: muchas ecuaciones exactas no separables son cuadráticas en $y$ y se pueden despejar.'],
        ['En cualquier solución implícita sin excepción', 'Casi: polinomios de grado 5 o superior en $y$, o expresiones como $y + \\ln y$, no se despejan con fórmulas elementales.']],
      'Si la ecuación es de segundo grado en $y$, la fórmula general $y = (-B \\pm \\sqrt{B^2 - 4AC})/(2A)$ proporciona el despeje explícito.'),

    C('ep-eleccion-signo-raiz', 'explicita', 1,
      'Al despejar $y(x) = \\dfrac{-x \\pm \\sqrt{12 - 3x^2}}{2}$ para la condición inicial $y(1) = 1$, ¿cómo se determina cuál de los dos signos $(\\pm)$ de la raíz es el correcto?',
      'Evaluando en $x = 1$: con el signo $+$ da $(-1 + 3)/2 = 1$ (correcto), mientras que con el signo $-$ daría $(-1 - 3)/2 = -2$', [
        ['Se elige siempre el signo positivo por convención matemática universal', 'Casi: si la condición inicial hubiera pedido $y(1) = -2$, el signo correcto habría sido el negativo.'],
        ['Se eligen ambos signos a la vez porque la solución es una función multivaluada', 'Casi: una función $y(x)$ en el sentido de una EDO debe asignar un único valor real a cada $x$.'],
        ['Se elige el signo que haga que la derivada sea siempre positiva', 'Casi: la derivada puede ser positiva o negativa a lo largo de la trayectoria.']],
      'La solución del PVI debe pasar exactamente por $(1, 1)$, lo cual selecciona de manera unívoca el signo $+$.'),

    C('ep-intervalo-validez-raiz', 'explicita', 1,
      'Para la solución explícita $y(x) = \\sqrt{C - x^2}$ con $C > 0$, ¿cuál es el intervalo máximo de validez donde la solución es real y diferenciable?',
      'El intervalo abierto $(-\\sqrt{C}, \\sqrt{C})$', [
        ['Todos los números reales $(-\\infty, \\infty)$', 'Casi: si $|x| > \\sqrt{C}$, el radicando $C - x^2$ es negativo y no produce valores reales.'],
        ['El intervalo cerrado $[-\\sqrt{C}, \\sqrt{C}]$', 'Casi: en los extremos $\\pm\\sqrt{C}$ la derivada tiene división entre cero ($y\' = -x/\\sqrt{C-x^2}$), por lo que no es diferenciable ahí.'],
        ['Solo los números positivos $(0, \\sqrt{C})$', 'Casi: para valores negativos de $x$ con $x^2 < C$ la función está perfectamente definida.']],
      'En los extremos la derivada se indetermina por tangente vertical, por lo que el intervalo máximo de solución de la EDO es el abierto $(-\\sqrt{C}, \\sqrt{C})$.'),

    N('ep-evaluar-y0-elipse', 'explicita', 2,
      { p: [2, 4, 1], q: [2, 4, 1] },
      function (v) { return 'La ecuación exacta $(2x + y)\\,dx + (x + 2y)\\,dy = 0$ con $y(' + v.p + ') = ' + v.q + '$ tiene potencial $x^2 + xy + y^2 = C$. Calcula el valor positivo de $y(0)$.'; },
      function (v) { return Math.sqrt(v.p * v.p + v.p * v.q + v.q * v.q); },
      '$C = p^2 + pq + q^2$. En $x = 0$, $y^2 = C \\implies y(0) = \\sqrt{C}$.',
      {
        mistakes: {
          noRoot: function (v) { return v.p * v.p + v.p * v.q + v.q * v.q; },
          noCross: function (v) { return Math.sqrt(v.p * v.p + v.q * v.q); },
          linear: function (v) { return v.p + v.q; }
        },
        feedback: [
          { when: 'noRoot', say: 'Casi: ese valor es $C = y(0)^2$; debes sacar la raíz cuadrada para hallar $y(0)$.' },
          { when: 'noCross', say: 'Casi: el potencial contiene el término cruzado $xy = pq$.' },
          { when: 'linear', say: 'Casi: las variables están elevadas al cuadrado.' }
        ]
      }),

    N('ep-evaluar-despeje-cuadratico', 'explicita', 2,
      { a: [2, 5, 1], c0: [5, 15, 1] },
      function (v) { return 'Dada la solución implícita $y^2 + ' + (2 * v.a) + 'x y + x^2 = ' + (v.c0 * v.c0) + '$ con la condición de que $y(0) > 0$, calcula el valor numérico de $y(0)$.'; },
      function (v) { return v.c0; },
      'Sustituyendo $x = 0$ en la ecuación: $y^2 = c_0^2 \\implies y = c_0$ (tomando la raíz positiva porque $y(0) > 0$).',
      {
        mistakes: {
          squared: function (v) { return v.c0 * v.c0; },
          half: function (v) { return v.c0 / 2; },
          minus: function (v) { return -v.c0; }
        },
        feedback: [
          { when: 'squared', say: 'Casi: falta sacar la raíz cuadrada de $c_0^2$.' },
          { when: 'half', say: 'Casi: no dividas entre 2; la ecuación es directamente $y^2 = c_0^2$.' },
          { when: 'minus', say: 'Casi: se especificó la raíz positiva $y(0) > 0$.' }
        ]
      }),

    N('ep-evaluar-lineal-en-y', 'explicita', 2,
      { a: [2, 5, 1], p: [2, 4, 1] },
      function (v) { return 'La ecuación exacta $(2xy + ' + v.a + ')\\,dx + (x^2 + 1)\\,dy = 0$ con $y(0) = 1$ tiene solución $x^2 y + y + ' + v.a + 'x = 1$. Despeja $y(x)$ y calcula su valor en $x = ' + v.p + '$.'; },
      function (v) { return (1 - v.a * v.p) / (v.p * v.p + 1); },
      'Factorizando: $y(x^2 + 1) = 1 - ax \\implies y(x) = (1 - ax)/(x^2 + 1)$. Evaluando en $p$ se obtiene el resultado.',
      {
        mistakes: {
          posA: function (v) { return (1 + v.a * v.p) / (v.p * v.p + 1); },
          inverted: function (v) { return (v.p * v.p + 1) / (1 - v.a * v.p); },
          half: function (v) { return 0.5 * (1 - v.a * v.p) / (v.p * v.p + 1); }
        },
        feedback: [
          { when: 'posA', say: 'Casi: al pasar $ax$ al lado derecho cambia de signo a negativo.' },
          { when: 'inverted', say: 'Casi: despejaste al revés; el factor $x^2 + 1$ pasa dividiendo al denominador.' },
          { when: 'half', say: 'Casi: no dividas entre 2 el resultado.' }
        ]
      }),

    N('ep-evaluar-y-en-uno', 'explicita', 2,
      { b: [3, 7, 1] },
      function (v) { return 'La ecuación $(3x^2 + 2y)\\,dx + (2x + 2y)\\,dy = 0$ con $y(0) = ' + v.b + '$ tiene solución $x^3 + 2xy + y^2 = ' + (v.b * v.b) + '$. Para $x = 1$, calcula el valor positivo de $y(1)$.'; },
      function (v) { return v.b - 1; },
      'En $x = 1$: $y^2 + 2y + 1 = (y + 1)^2 = b^2$. Tomando la raíz positiva: $y + 1 = b \\implies y = b - 1$.',
      {
        mistakes: {
          plusOne: function (v) { return v.b + 1; },
          onlyB: function (v) { return v.b; },
          half: function (v) { return (v.b - 1) / 2; }
        },
        feedback: [
          { when: 'plusOne', say: 'Casi: $(y + 1)^2 = b^2$ da $y = b - 1$, no $b + 1$.' },
          { when: 'onlyB', say: 'Casi: en $x = 1$ el valor cambia respecto a $y(0) = b$.' },
          { when: 'half', say: 'Casi: no dividas entre 2.' }
        ]
      }),

    E('ep-expr-despeje-circulo', 'explicita', 2,
      { r: [2, 6, 1] },
      function (v) { return 'Resuelve el PVI $(2x)\\,dx + (2y)\\,dy = 0$ con $y(0) = ' + v.r + '$. Despeja la solución explícita $y(x)$ en términos de $x$.'; },
      function (v) { return 'sqrt(' + (v.r * v.r) + ' - x^2)'; },
      'La solución general es $x^2 + y^2 = C$. Con $y(0) = r$, $C = r^2$. Como $y(0) > 0$, elegimos la raíz positiva: $y(x) = \\sqrt{r^2 - x^2}$.',
      {
        exprVars: ['x'],
        domain: [-1.2, 1.2],
        mistakes: {
          noRoot: function (v) { return (v.r * v.r) + ' - x^2'; },
          linear: function (v) { return v.r + ' - x'; }
        },
        feedback: [
          { when: 'noRoot', say: 'Casi: ese es $y^2$; debes sacar raíz cuadrada para obtener $y(x)$.' },
          { when: 'linear', say: 'Casi: la relación es cuadrática: $\\sqrt{r^2 - x^2}$ no es $r - x$.' }
        ]
      }),

    E('ep-expr-despeje-lineal', 'explicita', 2,
      { a: [2, 5, 1], c: [2, 6, 1] },
      function (v) { return 'La ecuación exacta $(2xy + ' + v.a + ')\\,dx + x^2\\,dy = 0$ con $y(1) = ' + (v.c - v.a) + '$ tiene potencial $x^2 y + ' + v.a + 'x = ' + v.c + '$. Despeja explícitamente $y(x)$ para $x > 0$.'; },
      function (v) { return '(' + v.c + ' - ' + v.a + '*x) / x^2'; },
      'Despejando: $x^2 y = c - ax \\implies y(x) = (c - ax)/x^2$.',
      {
        exprVars: ['x'],
        domain: [0.5, 2],
        mistakes: {
          inverted: function (v) { return 'x^2 / (' + v.c + ' - ' + v.a + '*x)'; },
          noDiv: function (v) { return v.c + ' - ' + v.a + '*x'; }
        },
        feedback: [
          { when: 'inverted', say: 'Casi: $x^2$ pasa al denominador dividiendo.' },
          { when: 'noDiv', say: 'Casi: te faltó dividir entre el coeficiente $x^2$ de $y$.' }
        ]
      }),

    E('ep-expr-despeje-raiz-cubica', 'explicita', 2,
      { a: [1, 3, 1], c: [2, 6, 1] },
      function (v) { return 'Dada la solución implícita $y^3 - ' + (3 * v.a) + 'x = ' + v.c + '$ para una ecuación exacta, despeja la solución explícita $y(x)$.'; },
      function (v) { return '(' + (3 * v.a) + '*x + ' + v.c + ')^(1/3)'; },
      '$y^3 = 3ax + c \\implies y(x) = (3ax + c)^{1/3}$.',
      {
        exprVars: ['x'],
        domain: [0.5, 3],
        mistakes: {
          noRoot: function (v) { return (3 * v.a) + '*x + ' + v.c; },
          squareRoot: function (v) { return 'sqrt(' + (3 * v.a) + '*x + ' + v.c + ')'; }
        },
        feedback: [
          { when: 'noRoot', say: 'Casi: $y$ está al cubo; debes sacar raíz cúbica elevando a la $1/3$.' },
          { when: 'squareRoot', say: 'Casi: la potencia de $y$ es 3, por lo que se requiere raíz cúbica, no cuadrada.' }
        ]
      }),

    N('ep-evaluar-tangente-vertical-x', 'explicita', 2,
      { a: [2, 5, 1], c: [16, 48, 4] },
      function (v) { return 'La curva $x^2 + ' + v.a + 'y^2 = ' + v.c + '$ define implícitamente a $y(x)$. ¿En qué valor positivo de $x$ la curva alcanza su extremo donde la tangente es vertical ($y = 0$)?'; },
      function (v) { return Math.sqrt(v.c); },
      'Haciendo $y = 0$: $x^2 = c \\implies x = \\sqrt{c}$.',
      {
        where: function (v) { return [16, 25, 36, 49, 64].indexOf(v.c) >= 0; },
        mistakes: {
          noRoot: function (v) { return v.c; },
          dividedA: function (v) { return Math.sqrt(v.c / v.a); },
          half: function (v) { return Math.sqrt(v.c) / 2; }
        },
        feedback: [
          { when: 'noRoot', say: 'Casi: $x^2 = c$, por lo que debes sacar la raíz cuadrada.' },
          { when: 'dividedA', say: 'Casi: cuando $y = 0$ el término con $a$ desaparece.' },
          { when: 'half', say: 'Casi: no dividas entre 2; la ecuación da directamente $x^2 = c$.' }
        ]
      }),

    E('ep-expr-despeje-cuadratica-completa', 'explicita', 3,
      { b: [2, 5, 1] },
      function (v) { return 'La solución implícita $y^2 + 2x y - ' + (v.b * v.b) + ' = 0$ cumple la condición inicial $y(0) = ' + v.b + ' > 0$. Despeja la solución explícita $y(x)$.'; },
      function (v) { return '-x + sqrt(x^2 + ' + (v.b * v.b) + ')'; },
      'Por la fórmula cuadrática: $y = (-2x \\pm \\sqrt{4x^2 + 4b^2})/2 = -x \\pm \\sqrt{x^2 + b^2}$. En $x = 0$ se requiere $y(0) = b > 0$, eligiendo el signo $+$, dando $-x + \\sqrt{x^2 + b^2}$.',
      {
        exprVars: ['x'],
        domain: [-2, 2],
        mistakes: {
          minusSign: function (v) { return '-x - sqrt(x^2 + ' + (v.b * v.b) + ')'; },
          noCross: function (v) { return 'sqrt(' + (v.b * v.b) + ' - x^2)'; }
        },
        feedback: [
          { when: 'minusSign', say: 'Casi: con el signo negativo $y(0) = -b < 0$, violando la condición inicial $y(0) > 0$.' },
          { when: 'noCross', say: 'Casi: el discriminante es $x^2 + b^2$, no $b^2 - x^2$.' }
        ]
      }),

    E('ep-expr-despeje-racional', 'explicita', 3,
      { a: [1, 4, 1], c: [2, 5, 1] },
      function (v) { return 'Dada la relación $x\\,e^y - ' + v.a + 'x = ' + v.c + '$ con $x > 0$, despeja la función $y(x)$ en términos de la función logaritmo natural.'; },
      function (v) { return 'log((' + v.a + '*x + ' + v.c + ') / x)'; },
      '$x e^y = ax + c \\implies e^y = (ax + c)/x \\implies y(x) = \\ln((ax + c)/x)$.',
      {
        exprVars: ['x'],
        domain: [0.5, 3],
        mistakes: {
          noDiv: function (v) { return 'log(' + v.a + '*x + ' + v.c + ')'; },
          noLog: function (v) { return '(' + v.a + '*x + ' + v.c + ') / x'; }
        },
        feedback: [
          { when: 'noDiv', say: 'Casi: primero debes dividir entre $x$ antes de aplicar logaritmo.' },
          { when: 'noLog', say: 'Casi: para despejar $y$ de $e^y$ se aplica logaritmo natural $\\ln$.' }
        ]
      }),

    E('ep-expr-despeje-raiz-desplazada', 'explicita', 3,
      { a: [2, 5, 1] },
      function (v) { return 'Resuelve explícitamente para $y(x)$ la relación $(y - ' + v.a + ')^2 = x + 1$ para $x > -1$, sabiendo que $y(0) = ' + (v.a + 1) + '$.'; },
      function (v) { return v.a + ' + sqrt(x + 1)'; },
      '$y - a = \\pm\\sqrt{x + 1} \\implies y = a \\pm \\sqrt{x + 1}$. En $x = 0$, $y(0) = a + 1$, por lo que se elige el signo $+$, dando $a + \\sqrt{x + 1}$.',
      {
        exprVars: ['x'],
        domain: [0, 3],
        mistakes: {
          minus: function (v) { return v.a + ' - sqrt(x + 1)'; },
          noA: function () { return 'sqrt(x + 1)'; }
        },
        feedback: [
          { when: 'minus', say: 'Casi: con el signo menos $y(0) = a - 1$, pero la condición pide $a + 1$.' },
          { when: 'noA', say: 'Casi: te faltó sumar la constante $a$ al despejar $y$.' }
        ]
      }),

    N('ep-evaluar-discriminante-cero', 'explicita', 3,
      { c: [12, 48, 12] },
      function (v) { return 'En la familia de elipses $x^2 + xy + y^2 = ' + v.c + '$, la solución explícita $y(x) = \\dfrac{-x \\pm \\sqrt{4(' + v.c + ') - 3x^2}}{2}$ deja de ser real cuando el discriminante se anula: $4(' + v.c + ') - 3x^2 = 0$. ¿Cuál es el valor positivo de $x$ donde esto ocurre?'; },
      function (v) { return Math.sqrt(4 * v.c / 3); },
      '$3x^2 = 4c \\implies x^2 = 4c/3 \\implies x = \\sqrt{4c/3}$.',
      {
        mistakes: {
          noFour: function (v) { return Math.sqrt(v.c / 3); },
          noThree: function (v) { return Math.sqrt(4 * v.c); }
        },
        feedback: [
          { when: 'noFour', say: 'Casi: el discriminante es $4c - 3x^2$, lleva el factor 4.' },
          { when: 'noThree', say: 'Casi: el coeficiente de $x^2$ es 3, se divide entre 3.' }
        ]
      }),

    /* ======================= 6. Ecuaciones con parámetro k y no exactas (16) ======================= */
    C('pa-concepto-parametro-k', 'parametro', 1,
      'En problemas del tipo «halla $k$ para que $(k x y + 1)\\,dx + (x^2 + 2y)\\,dy = 0$ sea exacta», ¿cuál es el procedimiento general?',
      'Calcular $M_y$ y $N_x$ en términos de $k$, igualarlas $M_y = N_x$ y despejar el valor numérico de $k$', [
        ['Sustituir $k = 0$ inmediatamente y verificar si la ecuación es lineal', 'Casi: $k$ no siempre es cero; se debe igualar la condición de exactitud $M_y = N_x$.'],
        ['Integrar $M$ respecto a $x$ e igualar el resultado a cero', 'Casi: no se iguala a cero; la exactitud se define por la igualdad de las derivadas cruzadas.'],
        ['Hacer el cambio de variable $y = kx$', 'Casi: eso es para ecuaciones homogéneas, no para probar exactitud.']],
      'Una ecuación es exacta si y solo si $M_y = N_x$. Al igualar estas derivadas parciales se obtiene una ecuación algebraica para despejar $k$.'),

    C('pa-que-falla-si-no-es-exacta', 'parametro', 1,
      'Si intentas aplicar la receta de integración a una ecuación donde $M_y \\neq N_x$, ¿en qué paso preciso se rompe el método?',
      'Al calcular $h\'(y) = N - \\dfrac{\\partial}{\\partial y}\\int M\\,dx$, la expresión resultante depende de $x$, haciendo imposible hallar una función que solo dependa de $y$', [
        ['En el primer paso, porque $M(x, y)$ no se puede integrar respecto a $x$', 'Casi: $M$ casi siempre se puede integrar; el problema surge al intentar cancelar $x$ en $h\'(y)$.'],
        ['Al evaluar la condición inicial, porque la constante $C$ se vuelve imaginaria', 'Casi: el método falla antes, al intentar construir el potencial.'],
        ['En ningún paso: cualquier ecuación produce un potencial válido', 'Casi: si no es exacta, no existe ninguna función $F$ con $F_x = M$ y $F_y = N$.']],
      'La dependencia de $x$ en la supuesta $h\'(y)$ es la manifestación directa de que $M_y \\neq N_x$ y no existe función potencial.'),

    C('pa-diferencia-con-lineales', 'parametro', 1,
      '¿Una ecuación diferencial puede ser lineal y exacta al mismo tiempo?',
      'Sí, por ejemplo $(2x + y)\\,dx + x\\,dy = 0$ se escribe como $y\' + \\dfrac{1}{x}y = -2$, que es lineal y además cumple $M_y = 1 = N_x$', [
        ['No, las ecuaciones exactas y las lineales son dos categorías mutuamente excluyentes', 'Casi: una ecuación puede pertenecer a más de una clasificación a la vez.'],
        ['Solo si todas las derivadas son constantes iguales a cero', 'Casi: muchas ecuaciones lineales no triviales son exactas.'],
        ['Solo cuando la variable $x$ no aparece en la ecuación', 'Casi: $x$ puede aparecer en ambas funciones $M$ y $N$.']],
      'Las clasificaciones no son excluyentes: si una ecuación lineal cumple $M_y = N_x$, es exacta y puede resolverse por ambos métodos.'),

    C('pa-adelanto-factor-integrante', 'parametro', 1,
      'Si una ecuación $M\\,dx + N\\,dy = 0$ no es exacta ($M_y \\neq N_x$), ¿qué técnica matemática (que se estudiará en la sesión 7) permite a veces convertirla en exacta?',
      'Multiplicar toda la ecuación por una función $\\mu(x, y)$ llamada factor integrante', [
        ['Elevar toda la ecuación al cuadrado', 'Casi: elevar al cuadrado alteraría el grado y orden de la ecuación y no resuelve la exactitud.'],
        ['Cambiar todas las derivadas por integrales', 'Casi: eso no tiene sentido operacional en ecuaciones diferenciales.'],
        ['Restar $M_y - N_x$ a ambos lados', 'Casi: se multiplica por un factor integrante $\\mu$, no se resta.']],
      'Un factor integrante $\\mu(x, y)$ convierte $(\\mu M)\\,dx + (\\mu N)\\,dy = 0$ en una ecuación exacta donde $(\\mu M)_y = (\\mu N)_x$.'),

    C('pa-exacta-separable', 'parametro', 1,
      'Toda ecuación de variables separables $f(x)\\,dx + g(y)\\,dy = 0$ con funciones continuas, ¿es también una ecuación exacta?',
      'Sí, siempre es exacta porque $M_y = \\dfrac{\\partial}{\\partial y}[f(x)] = 0$ y $N_x = \\dfrac{\\partial}{\\partial x}[g(y)] = 0$', [
        ['No, las separables nunca son exactas porque les faltan términos mixtos', 'Casi: que $M_y = N_x = 0$ cumple perfectamente la condición de exactitud.'],
        ['Solo si $f(x)$ y $g(y)$ son polinomios de grado 1', 'Casi: vale para cualesquiera funciones continuas $f$ y $g$.'],
        ['Solo cuando $f(x) = g(y)$', 'Casi: las funciones no tienen por qué ser iguales para que sus derivadas cruzadas sean $0$.']],
      'Como $M$ solo depende de $x$ y $N$ solo de $y$, ambas derivadas cruzadas son idénticamente cero: $0 = 0$.'),

    N('pa-hallar-k-lineal', 'parametro', 2,
      { a: [2, 7, 1] },
      function (v) { return '¿Para qué valor numérico de la constante $k$ es exacta la ecuación $(k\\,xy + 3)\\,dx + (' + v.a + 'x^2 + 4y)\\,dy = 0$?'; },
      function (v) { return 2 * v.a; },
      '$M_y = k x$ y $N_x = 2a x$. Para que sea exacta: $k x = 2a x \\implies k = 2a$.',
      {
        mistakes: {
          half: function (v) { return v.a; },
          quad: function (v) { return 4 * v.a; },
          neg: function (v) { return -2 * v.a; }
        },
        feedback: [
          { when: 'half', say: 'Casi: al derivar $a x^2$ respecto a $x$ baja un 2, dando $2ax$.' },
          { when: 'quad', say: 'Casi: multiplicaste por 4 en lugar de 2.' },
          { when: 'neg', say: 'Casi: el signo es positivo.' }
        ]
      }),

    N('pa-hallar-k-cubico', 'parametro', 2,
      { a: [2, 6, 1], b: [2, 5, 1] },
      function (v) { return '¿Para qué valor de $k$ es exacta la ecuación $(k\\,x^2 y + e^y)\\,dx + (' + v.a + 'x^3 + x e^y + ' + v.b + ')\\,dy = 0$?'; },
      function (v) { return 3 * v.a; },
      '$M_y = k x^2 + e^y$ y $N_x = 3a x^2 + e^y$. Igualando: $k = 3a$.',
      {
        mistakes: {
          noThree: function (v) { return v.a; },
          sixA: function (v) { return 6 * v.a; },
          withB: function (v) { return 3 * v.a + v.b; }
        },
        feedback: [
          { when: 'noThree', say: 'Casi: la derivada de $a x^3$ respecto a $x$ es $3a x^2$.' },
          { when: 'sixA', say: 'Casi: derivaste dos veces $x^3$; la primera derivada es $3a x^2$.' },
          { when: 'withB', say: 'Casi: la constante $b$ se anula al derivar respecto a $x$.' }
        ]
      }),

    N('pa-hallar-k-trig', 'parametro', 2,
      { a: [2, 6, 1] },
      function (v) { return 'Calcula el valor de $k$ que hace exacta a la ecuación $(k\\,y\\cos x + 2x)\\,dx + (' + v.a + '\\sin x + 3y^2)\\,dy = 0$.'; },
      function (v) { return v.a; },
      '$M_y = k\\cos x$ y $N_x = a\\cos x$. Igualando coeficientes se obtiene $k = a$.',
      {
        mistakes: {
          twoA: function (v) { return 2 * v.a; },
          negA: function (v) { return -v.a; },
          half: function (v) { return v.a / 2; }
        },
        feedback: [
          { when: 'twoA', say: 'Casi: las derivadas son $k\\cos x$ y $a\\cos x$, por lo que $k = a$.' },
          { when: 'negA', say: 'Casi: la derivada de $\\sin x$ respecto a $x$ es $+\\cos x$, el signo es positivo.' },
          { when: 'half', say: 'Casi: no hay que dividir entre 2.' }
        ]
      }),

    N('pa-hallar-k-potencia-y', 'parametro', 2,
      { n: [2, 5, 1], c: [2, 6, 1] },
      function (v) { return 'Encuentra el valor de $k$ para que la ecuación $(k\\,x y^{' + v.n + '} + 5)\\,dx + (' + (v.c * v.n) + 'x^2 y^{' + (v.n - 1) + '} + 2y)\\,dy = 0$ sea exacta.'; },
      function (v) { return 2 * v.c; },
      '$M_y = k n x y^{n-1}$ y $N_x = 2 c n x y^{n-1}$. Cancelando $n x y^{n-1}$ resulta $k = 2c$.',
      {
        mistakes: {
          onlyC: function (v) { return v.c; },
          withN: function (v) { return 2 * v.c * v.n; },
          quad: function (v) { return 4 * v.c; }
        },
        feedback: [
          { when: 'onlyC', say: 'Casi: al derivar $x^2$ baja un factor 2, así que $k = 2c$.' },
          { when: 'withN', say: 'Casi: el exponente $n$ aparece en ambos lados y se cancela.' },
          { when: 'quad', say: 'Casi: la relación es $k = 2c$, no $4c$.' }
        ]
      }),

    N('pa-hallar-k-exponencial', 'parametro', 2,
      { b: [2, 5, 1], a: [2, 5, 1] },
      function (v) { return '¿Para qué valor de $k$ es exacta la ecuación $(e^{' + v.b + 'x} + k\\,y)\\,dx + (' + (2 * v.a) + 'x + 3y^2)\\,dy = 0$?'; },
      function (v) { return 2 * v.a; },
      '$M_y = k$ y $N_x = 2a$. Por tanto, $k = 2a$.',
      {
        mistakes: {
          half: function (v) { return v.a; },
          threeA: function (v) { return 3 * v.a; },
          quad: function (v) { return 4 * v.a; }
        },
        feedback: [
          { when: 'half', say: 'Casi: la derivada de $2ax$ respecto a $x$ es $2a$, no $a$.' },
          { when: 'threeA', say: 'Casi: la igualdad directa da $k = 2a$.' },
          { when: 'quad', say: 'Casi: el coeficiente de $x$ en $N$ es $2a$.' }
        ]
      }),

    N('pa-hallar-k-fraccion', 'parametro', 2,
      { a: [7, 11, 1] },
      function (v) { return 'Para la ecuación $(\\dfrac{k}{y} + 2x)\\,dx - \\dfrac{' + v.a + 'x}{y^2}\\,dy = 0$, determina el valor de $k$ que la vuelve exacta.'; },
      function (v) { return v.a; },
      '$M_y = -k/y^2$ y $N_x = -a/y^2$. Igualando: $-k/y^2 = -a/y^2 \\implies k = a$.',
      {
        mistakes: {
          negA: function (v) { return -v.a; },
          twoA: function (v) { return 2 * v.a; },
          half: function (v) { return v.a / 2; }
        },
        feedback: [
          { when: 'negA', say: 'Casi: ambos lados tienen signo negativo, por lo que $k = +a$.' },
          { when: 'twoA', say: 'Casi: las derivadas coinciden directamente con coeficiente $a$.' },
          { when: 'half', say: 'Casi: no dividas entre 2.' }
        ]
      }),

    N('pa-valor-m-substituido', 'parametro', 2,
      { a: [2, 5, 1], val: [3, 9, 1] },
      function (v) { return 'En la ecuación $(' + (2 * v.a) + 'xy + k)\\,dx + (' + v.a + 'x^2 + 4y)\\,dy = 0$, cualquier constante $k$ la hace exacta. Si se sabe que su potencial con $F(0, 0) = 0$ satisface $F(1, 0) = ' + v.val + '$, ¿cuánto vale $k$?'; },
      function (v) { return v.val; },
      function (v) { return '$F(x, y) = a x^2 y + k x + 2y^2$. Evaluando en $(1, 0)$: $F(1, 0) = k$, por lo que $k = ' + v.val + '$.'; },
      {
        mistakes: {
          twoVal: function (v) { return 2 * v.val; },
          halfVal: function (v) { return v.val / 2; },
          negVal: function (v) { return -v.val; }
        },
        feedback: [
          { when: 'twoVal', say: 'Casi: $x = 1$, así que $k(1) = k$, sin multiplicar por 2.' },
          { when: 'halfVal', say: 'Casi: no dividas entre 2.' },
          { when: 'negVal', say: 'Casi: el valor de $k$ es positivo.' }
        ]
      }),

    C('pa-dos-parametros-condicion', 'parametro', 2,
      'Para que la ecuación $(a\\,x^2 y + y^2)\\,dx + (x^3 + b\\,xy)\\,dy = 0$ sea exacta, ¿qué relación deben cumplir las constantes $a$ y $b$?',
      '$a = 3$ y $b = 2$', [
        ['$a = 1$ y $b = 1$', 'Casi: $M_y = a x^2 + 2y$ y $N_x = 3x^2 + b y$, así que $a$ debe igualar a $3$ y $b$ a $2$.'],
        ['$a = 2$ y $b = 3$', 'Casi: invertiste los valores; $a$ acompaña a $x^2$ y debe ser $3$.'],
        ['$a + b = 5$, admitiendo infinitas combinaciones', 'Casi: como los monomios $x^2$ y $y$ son linealmente independientes, cada coeficiente debe igualarse por separado.']],
      '$M_y = a x^2 + 2y$ y $N_x = 3x^2 + b y$. Igualando término a término: $a = 3$ y $b = 2$.'),

    N('pa-k-con-producto-cruzado', 'parametro', 3,
      { a: [2, 6, 1], b: [2, 4, 1] },
      function (v) { return '¿Para qué valor de $k$ es exacta la ecuación $(' + (3 * v.a) + 'x^2 y^2 + ' + v.b + 'x)\\,dx + (k\\,x^3 y + 4y^3)\\,dy = 0$?'; },
      function (v) { return 2 * v.a; },
      '$M_y = 6a x^2 y$ y $N_x = 3k x^2 y$. Igualando: $6a = 3k \\implies k = 2a$.',
      {
        mistakes: {
          threeA: function (v) { return 3 * v.a; },
          sixA: function (v) { return 6 * v.a; },
          halfA: function (v) { return v.a; }
        },
        feedback: [
          { when: 'threeA', say: 'Casi: $3k = 6a$, por lo que debes dividir $6a$ entre 3 para despejar $k$.' },
          { when: 'sixA', say: 'Casi: olvidaste dividir entre 3 al despejar $k$.' },
          { when: 'halfA', say: 'Casi: $6a / 3 = 2a$, no $a$.' }
        ]
      }),

    N('pa-residuo-no-exacta', 'parametro', 3,
      { a: [4, 8, 2], b: [1, 1, 1] },
      function (v) { return 'En una ecuación no exacta $(' + v.a + 'xy)\\,dx + (' + v.b + 'x^2 + y)\\,dy = 0$, al intentar calcular $h\'(y) = N - \\dfrac{\\partial}{\\partial y}\\int M\\,dx$ queda una expresión de la forma $C_r\\,x^2 + y$. ¿Cuánto vale la constante $C_r$?'; },
      function (v) { return v.b - v.a / 2; },
      '$\\int M\\,dx = \\frac{a}{2}x^2 y$. Derivando en $y$: $\\frac{a}{2}x^2$. Restando de $N$: $(b - a/2)x^2 + y$. Por tanto, $C_r = b - a/2$.',
      {
        mistakes: {
          pos: function (v) { return v.b + v.a / 2; },
          noDiv: function (v) { return v.b - v.a; },
          inv: function (v) { return v.a / 2 - v.b; }
        },
        feedback: [
          { when: 'pos', say: 'Casi: se resta la derivada parcial de la integral, así que lleva signo menos.' },
          { when: 'noDiv', say: 'Casi: la integral de $ax$ respecto a $x$ es $\\frac{a}{2}x^2$.' },
          { when: 'inv', say: 'Casi: se calcula $N - \\partial F_0/\\partial y$, no al revés.' }
        ]
      }),

    C('pa-teorema-condicion-necesaria-suficiente', 'parametro', 3,
      'Si $M(x, y)$ y $N(x, y)$ tienen derivadas parciales continuas de primer orden en un disco abierto $D$, ¿cuál es el estado lógico exacto de la condición $\\dfrac{\\partial M}{\\partial y} = \\dfrac{\\partial N}{\\partial x}$ para la existencia de una función potencial $F$?',
      'Es una condición necesaria y suficiente en ese disco', [
        ['Es suficiente pero no necesaria', 'Casi: por Clairaut es estrictamente necesaria en cualquier punto donde exista $F$.'],
        ['Es necesaria pero no suficiente en un disco abierto', 'Casi: en regiones simplemente conexas como un disco abierto siempre es suficiente por el teorema de Poincaré.'],
        ['No es ni necesaria ni suficiente', 'Casi: es el criterio fundamental y completo de exactitud en dominios sin agujeros.']],
      'En dominios simplemente conexos (como un disco o rectángulo), $M_y = N_x$ es a la vez necesaria (Clairaut) y suficiente (Poincaré) para la existencia de $F$.')
  ];

  K.register(SUBTEMAS, Q);
})();
