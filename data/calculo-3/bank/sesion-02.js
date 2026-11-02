/* =====================================================================
   Banco · Cálculo 3 · S02 · Ecuaciones de variables separables:
   reconocimiento, separación, PVI, soluciones implícitas y raíces,
   soluciones de equilibrio, decaimiento/vida media y enfriamiento.
   100 preguntas propias (source: 'propia').
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c3', '02'), C = K.C;

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
    'c3.S02.separabilidad': 'Reconocimiento y separación de variables',
    'c3.S02.pvi-explicito': 'Integración y despeje en PVI separables',
    'c3.S02.raices-implicita': 'Soluciones implícitas, raíces y signo',
    'c3.S02.equilibrio': 'Soluciones de equilibrio y pérdida al dividir',
    'c3.S02.decaimiento': 'Crecimiento, decaimiento y vida media',
    'c3.S02.enfriamiento': 'Ley de enfriamiento de Newton'
  };

  var Q = [
    /* ======================= 1. Reconocimiento y separación de variables (17) ======================= */
    C('se-forma-def', 'separabilidad', 1,
      '¿Cuándo se dice que una ecuación diferencial de primer orden $\\dfrac{dy}{dx} = f(x, y)$ es de <strong>variables separables</strong>?',
      'Cuando $f(x, y)$ se puede factorizar como un producto $g(x)\\,h(y)$ de una función solo de $x$ por una solo de $y$', [
        ['Cuando $f(x, y)$ se puede escribir como una suma $g(x) + h(y)$', 'Casi: una suma $g(x) + h(y)$ no permite dejar todas las $y$ con $dy$ y todas las $x$ con $dx$; debe ser un producto.'],
        ['Cuando la variable $y$ no aparece en el lado derecho de la ecuación', 'Casi: si no aparece $y$ es integración directa, pero en general sí puede aparecer multiplicando como $h(y)$.'],
        ['Cuando la ecuación tiene coeficientes constantes en todos sus términos', 'Casi: una ecuación separable puede tener cualquier función $g(x)$ y $h(y)$, no necesita coeficientes constantes.']],
      'Una EDO de primer orden es separable si el lado derecho se factoriza como $g(x)\\,h(y)$, permitiendo escribir $\\frac{dy}{h(y)} = g(x)\\,dx$.'),

    C('se-suma-no-sep', 'separabilidad', 1,
      '¿Cuál de las siguientes ecuaciones diferenciales de primer orden <strong>no</strong> es de variables separables?',
      '$y\' = x + y$', [
        ['$y\' = x\\,y$', 'Casi: aquí el lado derecho ya es el producto de $g(x) = x$ por $h(y) = y$, así que sí es separable.'],
        ['$y\' = \\dfrac{x^2}{y}$', 'Casi: se factoriza como $g(x) = x^2$ por $h(y) = 1/y$, por lo que sí es separable.'],
        ['$y\' = (x + 1)(y - 1)$', 'Casi: ya está factorizada en un factor solo de $x$ por otro solo de $y$.']],
      'La suma $x + y$ no se puede factorizar en una función solo de $x$ multiplicada por una función solo de $y$.'),

    C('se-una-constante', 'separabilidad', 1,
      'Al integrar ambos lados de $\\dfrac{dy}{h(y)} = g(x)\\,dx$, ¿por qué basta escribir una sola constante $+C$ del lado de $x$ en vez de una en cada lado?',
      'Porque dos constantes arbitrarias $C_1$ y $C_2$ se agrupan en una sola constante $C = C_2 - C_1$', [
        ['Porque la integral respecto a $y$ es definida y nunca lleva constante', 'Casi: ambas son integrales indefinidas, pero sus dos constantes se restan y forman una sola constante arbitraria.'],
        ['Porque si pones dos constantes la ecuación sube a segundo orden', 'Casi: el orden lo da la derivada más alta; $C_2 - C_1$ sigue siendo un solo parámetro libre.'],
        ['Porque del lado izquierdo la constante siempre vale cero por la regla de la cadena', 'Casi: no vale cero, sino que pasa restando al lado derecho y se absorbe en $C$.']],
      'De $F(y) + C_1 = G(x) + C_2$ se pasa a $F(y) = G(x) + C$ definiendo $C = C_2 - C_1$.'),

    C('se-paso-separar', 'separabilidad', 1,
      function (v) { return 'Si tienes la ecuación diferencial $\\dfrac{dy}{dx} = \\dfrac{x^{' + v.m + '}}{y^2}$ (con $y \\neq 0$), ¿cómo queda tras separar las variables antes de integrar?'; },
      function (v) { return '$y^2\\,dy = x^{' + v.m + '}\\,dx$'; }, [
        [function (v) { return '$\\dfrac{dy}{y^2} = x^{' + v.m + '}\\,dx$'; }, 'Casi: como $y^2$ está dividiendo en el lado derecho, pasa multiplicando a $dy$, no dividiendo.'],
        [function (v) { return '$y^2\\,dx = x^{' + v.m + '}\\,dy$'; }, 'Casi: cada variable debe quedar con su propio diferencial: las $y$ con $dy$ y las $x$ con $dx$.'],
        [function (v) { return '$dy = x^{' + v.m + '} y^2\\,dx$'; }, 'Casi: ahí dejaste $y^2$ del lado de $dx$; hay que pasar las $y$ al lado de $dy$.']],
      'Multiplicando ambos lados por $y^2$ y por $dx$ queda $y^2\\,dy = x^m\\,dx$.',
      { vars: { m: [2, 6, 1] } }),

    N('se-n-eval-g', 'separabilidad', 1, { a: [2, 5, 1], b: [1, 4, 1], x0: [2, 4, 1] },
      function (v) { return 'Si factorizas la ecuación $y\' = (' + v.a + 'x + ' + v.b + ')y^3$ como $y\' = g(x)\\,h(y)$ con $h(y) = y^3$, ¿cuánto vale $g(' + v.x0 + ')$?'; },
      function (v) { return v.a * v.x0 + v.b; },
      'El factor que depende solo de $x$ es $g(x) = ax + b$; basta evaluarlo en $x = x_0$.',
      { mistakes: { multCube: function (v) { return (v.a * v.x0 + v.b) * Math.pow(v.x0, 3); }, subB: function (v) { return v.a * v.x0 - v.b; } },
        feedback: [
          { when: 'multCube', say: 'Casi: el factor $y^3$ pertenece a $h(y)$, no a $g(x)$.' },
          { when: 'subB', say: 'Casi: en $g(x) = ax + b$ el término constante se suma, no se resta.' }
        ] }),

    N('se-n-eval-h', 'separabilidad', 1, { k: [2, 5, 1], c: [1, 3, 1], y0: [2, 4, 1] },
      function (v) { return 'Al escribir $y\' = \\dfrac{x^2}{' + v.k + 'y + ' + v.c + '}$ en la forma $y\' = g(x)\\,h(y)$ con $g(x) = x^2$, ¿cuánto vale el factor $\\dfrac{1}{h(' + v.y0 + ')}$ que multiplica a $dy$ al separar?'; },
      function (v) { return v.k * v.y0 + v.c; },
      'Como $h(y) = \\frac{1}{ky + c}$, su recíproco al separar $\\frac{dy}{h(y)} = x^2\\,dx$ es directamente $ky + c$.',
      { mistakes: { invVal: function (v) { return 1 / (v.k * v.y0 + v.c); }, noC: function (v) { return v.k * v.y0; } },
        feedback: [
          { when: 'invVal', say: 'Casi: ese es $h(y_0)$, pero al pasar al lado de $dy$ queda su recíproco $1/h(y_0) = ky_0 + c$.' },
          { when: 'noC', say: 'Casi: olvidaste sumar la constante del denominador.' }
        ] }),

    C('se-exp-suma', 'separabilidad', 2,
      function (v) { return '¿Por qué la ecuación $\\dfrac{dy}{dx} = e^{' + v.a + 'x - ' + v.b + 'y}$ sí es de variables separables, y cómo queda al separarla?'; },
      function (v) { return 'Porque $e^{' + v.a + 'x - ' + v.b + 'y} = e^{' + v.a + 'x}e^{-' + v.b + 'y}$, y al pasar $e^{-' + v.b + 'y}$ dividiendo queda $e^{' + v.b + 'y}\\,dy = e^{' + v.a + 'x}\\,dx$'; }, [
        [function (v) { return 'Porque $e^{' + v.a + 'x - ' + v.b + 'y} = e^{' + v.a + 'x} - e^{' + v.b + 'y}$, quedando $e^{' + v.b + 'y}\\,dy = e^{' + v.a + 'x}\\,dx$'; }, 'Casi: la exponencial de una resta no es la resta de exponenciales, sino el producto $e^{ax}e^{-by}$.'],
        [function (v) { return 'Porque al dividir queda $e^{-' + v.b + 'y}\\,dy = e^{' + v.a + 'x}\\,dx$'; }, 'Casi: al pasar $e^{-by}$ dividiendo al lado izquierdo, el signo de su exponente cambia a positivo: $1/e^{-by} = e^{by}$.'],
        ['No es separable, porque $x$ y $y$ están restándose dentro del exponente', 'Casi: por leyes de los exponentes, una suma o resta en el exponente se convierte en un producto de exponenciales.']],
      'Usando $e^{ax - by} = e^{ax}e^{-by}$ y dividiendo entre $e^{-by}$ resulta $e^{by}\\,dy = e^{ax}\\,dx$.',
      { vars: { a: [2, 5, 1], b: [2, 5, 1] } }),

    C('se-despeje-ln-abs', 'separabilidad', 2,
      'Tras separar e integrar una EDO obtienes $\\ln|y| = x^3 + C$. ¿Cuál es la forma correcta de despejar $y(x)$?',
      '$y = A\\,e^{x^3}$, donde $A = \\pm e^C$ absorbe la constante y el signo', [
        ['$y = e^{x^3} + C$, porque la constante siempre queda sumando al final', 'Casi: como $C$ está dentro del exponente en $e^{x^3 + C} = e^C e^{x^3}$, la constante queda multiplicando a la exponencial.'],
        ['$y = x^3 + e^C$, aplicando la exponencial solo a la constante', 'Casi: al tomar exponencial en ambos lados de $\\ln|y| = x^3 + C$, todo el lado derecho sube al exponente: $e^{x^3 + C}$.'],
        ['$y = \\ln(x^3) + C$, pasando el logaritmo al otro lado', 'Casi: la función inversa del logaritmo natural es la exponencial $e^{(\\cdot)}$, no otro logaritmo.']],
      'De $\\ln|y| = x^3 + C$ sale $|y| = e^{x^3 + C} = e^C e^{x^3}$, así que $y = Ae^{x^3}$ con $A = \\pm e^C$.'),

    C('se-justificacion-dx', 'separabilidad', 2,
      'Desde el punto de vista del cálculo, ¿qué regla justifica que $\\displaystyle\\int \\frac{1}{h(y)}\\,\\frac{dy}{dx}\\,dx$ sea igual a $\\displaystyle\\int \\frac{dy}{h(y)}$?',
      'La regla de la cadena (o cambio de variable $y = y(x)$, donde $dy = y\'(x)\\,dx$)', [
        ['La fórmula de integración por partes $\\int u\\,dv = uv - \\int v\\,du$', 'Casi: no se están multiplicando dos funciones para integrar por partes, sino haciendo la sustitución $y = y(x)$.'],
        ['El teorema del valor medio para derivadas', 'Casi: lo que transforma una integral respecto a $x$ en una integral respecto a $y$ es el cambio de variable (regla de la cadena).'],
        ['Que $dy/dx$ es un cociente de polinomios constantes que siempre se cancelan', 'Casi: $dy/dx$ es una derivada; el paso formal viene del teorema de cambio de variable en la integral.']],
      'Si $F\'(y) = 1/h(y)$, por la regla de la cadena $\\frac{d}{dx}[F(y(x))] = \\frac{1}{h(y)}\\frac{dy}{dx}$, lo que valida separar los diferenciales.'),

    N('se-n-factor-comun', 'separabilidad', 2, { a: [2, 5, 1], b: [1, 4, 1], x0: [1, 3, 1] },
      function (v) { return 'Factoriza por agrupación el lado derecho de $y\' = ' + v.a + 'xy + ' + v.a + 'x + ' + v.b + 'y + ' + v.b + '$ en la forma $g(x)(y + 1)$. ¿Cuánto vale $g(' + v.x0 + ')$?'; },
      function (v) { return v.a * v.x0 + v.b; },
      'Agrupando: $ax(y + 1) + b(y + 1) = (ax + b)(y + 1)$, por lo que $g(x) = ax + b$.',
      { where: function (v) { return v.a * v.x0 + v.b !== v.a * v.x0 * v.b; },
        mistakes: { multB: function (v) { return v.a * v.x0 * v.b; }, onlyAx: function (v) { return v.a * v.x0; } },
        feedback: [
          { when: 'multB', say: 'Casi: al sacar factor común $(y + 1)$ queda la suma $ax + b$, no el producto.' },
          { when: 'onlyAx', say: 'Casi: te faltó sumar el término independiente al factorizar $(ax + b)(y + 1)$.' }
        ] }),

    N('se-n-int-lado-x', 'separabilidad', 2, { a: [3, 9, 3], b: [2, 6, 2], x1: [2, 3, 1] },
      function (v) { return 'Al separar $\\dfrac{dy}{dx} = (' + v.a + 'x^2 + ' + v.b + 'x)\\,y^2$ queda $\\dfrac{dy}{y^2} = (' + v.a + 'x^2 + ' + v.b + 'x)\\,dx$. Si $G(x)$ es la antiderivada del lado derecho con $G(0) = 0$, ¿cuánto vale $G(' + v.x1 + ')$?'; },
      function (v) { return (v.a / 3) * Math.pow(v.x1, 3) + (v.b / 2) * v.x1 * v.x1; },
      'Integrando respecto a $x$: $G(x) = \\frac{a}{3}x^3 + \\frac{b}{2}x^2$.',
      { mistakes: { noDiv: function (v) { return v.a * Math.pow(v.x1, 3) + v.b * v.x1 * v.x1; }, derivInstead: function (v) { return 2 * v.a * v.x1 + v.b; } },
        feedback: [
          { when: 'noDiv', say: 'Casi: al integrar $x^2$ y $x$ debes dividir entre los nuevos exponentes $3$ y $2$.' },
          { when: 'derivInstead', say: 'Casi: derivaste el polinomio en lugar de integrarlo respecto a $x$.' }
        ] }),

    N('se-n-int-lado-y', 'separabilidad', 2, { a: [2, 4, 1], y1: [1, 3, 1] },
      function (v) { return 'En la ecuación separable $\\dfrac{dy}{dx} = \\dfrac{e^x}{' + (3 * v.a) + 'y^2 + 2y}$, al pasar el denominador con $dy$ e integrar respecto a $y$ se obtiene $H(y)$ (con $H(0) = 0$). Calcula $H(' + v.y1 + ')$.'; },
      function (v) { return v.a * Math.pow(v.y1, 3) + v.y1 * v.y1; },
      'Al separar queda $(3ay^2 + 2y)\\,dy = e^x\\,dx$, cuya integral izquierda es $H(y) = ay^3 + y^2$.',
      { mistakes: { noDiv: function (v) { return 3 * v.a * Math.pow(v.y1, 3) + 2 * v.y1 * v.y1; }, onlyCube: function (v) { return v.a * Math.pow(v.y1, 3); } },
        feedback: [
          { when: 'noDiv', say: 'Casi: olvidaste dividir entre $3$ y entre $2$ al integrar $y^2$ y $y$.' },
          { when: 'onlyCube', say: 'Casi: te faltó integrar y sumar el segundo término $+2y$, que da $+y^2$.' }
        ] }),

    N('se-n-exp-separar-eval', 'separabilidad', 2, { a: [2, 4, 1], b: [2, 4, 1], y0: [1, 2, 1] },
      function (v) { return 'Al separar $\\dfrac{dy}{dx} = e^{' + v.a + 'x - ' + v.b + 'y}$ en la forma $M(y)\\,dy = e^{' + v.a + 'x}\\,dx$, obtienes la antiderivada $F(y) = \\displaystyle\\int M(y)\\,dy$ (con constante cero). ¿Cuánto vale $F(' + v.y0 + ')$?'; },
      function (v) { return Math.exp(v.b * v.y0) / v.b; },
      'Como $M(y) = e^{by}$, su antiderivada es $F(y) = \\frac{1}{b}e^{by}$.',
      { mistakes: { noDivB: function (v) { return Math.exp(v.b * v.y0); }, negExp: function (v) { return Math.exp(-v.b * v.y0) / v.b; } },
        feedback: [
          { when: 'noDivB', say: 'Casi: al integrar $e^{by}$ respecto a $y$ hay que dividir entre $b$.' },
          { when: 'negExp', say: 'Casi: al pasar $e^{-by}$ al lado izquierdo queda con exponente positivo $e^{by}$.' }
        ] }),

    N('se-n-constante-A', 'separabilidad', 2, { c: [1, 3, 1], k: [2, 4, 1] },
      function (v) { return 'Si después de integrar llegas a $\\ln|y| = ' + v.k + 'x + ' + v.c + '$ y sabes que $y > 0$, al escribir la solución como $y = A\\,e^{' + v.k + 'x}$, ¿cuánto vale numéricamente la constante $A$?'; },
      function (v) { return Math.exp(v.c); },
      'Al despejar con la exponencial: $y = e^{kx + c} = e^c e^{kx}$, por lo que $A = e^c$.',
      { mistakes: { justC: function (v) { return v.c; }, multK: function (v) { return v.k * v.c; } },
        feedback: [
          { when: 'justC', say: 'Casi: el número constante está en el exponente, así que $A = e^c$, no $c$.' },
          { when: 'multK', say: 'Casi: por leyes de los exponentes $e^{kx + c} = e^c\\,e^{kx}$, por lo que $A = e^c$.' }
        ] }),

    C('se-factorizacion-escondida', 'separabilidad', 3,
      'A primera vista $y\' = xy + 2x - 3y - 6$ parece una suma de cuatro términos. ¿Es de variables separables?',
      'Sí, porque al factorizar por agrupación queda $y\' = (x - 3)(y + 2)$, que ya es de la forma $g(x)\\,h(y)$', [
        ['No, porque tiene términos sumados y restados con $x$ y $y$', 'Casi: aunque esté desarrollada como suma, si se puede factorizar en $(x - 3)(y + 2)$ sí es separable.'],
        ['Sí, pero se separa como $(y + 3y)\\,dy = (2x - 6)\\,dx$', 'Casi: no puedes separar el término $xy$ sumando; primero debes factorizar todo el lado derecho como producto.'],
        ['Solo es separable cuando $x = 3$ o $y = -2$', 'Casi: la factorización $xy + 2x - 3y - 6 = (x - 3)(y + 2)$ es válida para todo $(x, y)$.']],
      'Sacando factor común por grupos: $x(y + 2) - 3(y + 2) = (x - 3)(y + 2)$, que es el producto $g(x)\\,h(y)$.'),

    N('se-n-condicion-factorizable', 'separabilidad', 3, { a: [2, 5, 1], b: [2, 5, 1], c: [3, 7, 1] },
      function (v) { return '¿Qué valor debe tener la constante $k$ para que la ecuación $y\' = ' + v.a + 'xy + ' + (v.a * v.b) + 'x + ' + v.c + 'y + k$ se pueda factorizar como un producto $(' + v.a + 'x + ' + v.c + ')(y + ' + v.b + ')$ y sea de variables separables?'; },
      function (v) { return v.b * v.c; },
      'Al desarrollar $(ax + c)(y + b) = axy + abx + cy + bc$, el término independiente debe ser $k = bc$.',
      { where: function (v) { return v.a !== v.c && v.b * v.c !== v.b + v.c; },
        mistakes: { sumBC: function (v) { return v.b + v.c; }, prodAB: function (v) { return v.a * v.b; } },
        feedback: [
          { when: 'sumBC', say: 'Casi: al multiplicar $(ax + c)(y + b)$, el término constante es el producto $b\\cdot c$, no la suma.' },
          { when: 'prodAB', say: 'Casi: $ab$ es el coeficiente de $x$; el término independiente sale de multiplicar $c$ por $b$.' }
        ] }),

    N('se-n-fracciones-parciales-coef', 'separabilidad', 3, { K: [4, 10, 2] },
      function (v) { return 'Para separar la ecuación logística $y\' = y(' + v.K + ' - y)$, se descompone $\\dfrac{1}{y(' + v.K + ' - y)} = A\\left(\\dfrac{1}{y} + \\dfrac{1}{' + v.K + ' - y}\\right)$ en fracciones parciales. ¿Cuánto vale la constante $A$?'; },
      function (v) { return 1 / v.K; },
      'Como $\\frac{1}{y} + \\frac{1}{K - y} = \\frac{K}{y(K - y)}$, hace falta multiplicar por $A = \\frac{1}{K}$ para obtener un $1$ en el numerador.',
      { mistakes: { justK: function (v) { return v.K; }, twoOverK: function (v) { return 2 / v.K; } },
        feedback: [
          { when: 'justK', say: 'Casi: al sumar las dos fracciones queda $K$ en el numerador, así que debes dividir entre $K$.' },
          { when: 'twoOverK', say: 'Casi: al sumar $(K - y) + y$ en el numerador se cancelan las $y$ y queda $K$, no $K/2$.' }
        ] }),

    /* ======================= 2. Integración y despeje en PVI separables (18) ======================= */
    C('pe-gauss-exponente', 'pvi-explicito', 1,
      function (v) { return 'Al resolver $\\dfrac{dy}{dx} = ' + v.a + 'x\\,y$ con $y(0) = 5$, ¿qué función aparece en el exponente de la solución $y(x) = 5e^{u(x)}$?'; },
      function (v) { return '$u(x) = ' + (v.a / 2) + 'x^2$, porque $\\int ' + v.a + 'x\\,dx = ' + (v.a / 2) + 'x^2$'; }, [
        [function (v) { return '$u(x) = ' + v.a + 'x^2$, porque el coeficiente pasa directo'; }, 'Casi: al integrar $x\\,dx$ sale $x^2/2$; te faltó dividir el coeficiente entre 2.'],
        [function (v) { return '$u(x) = ' + v.a + 'x$, igual que en el decaimiento simple'; }, 'Casi: el lado derecho tiene un factor $x$, cuya antiderivada es $x^2/2$, no $x$.'],
        ['$u(x) = \\ln x$, por integrar respecto a $x$', 'Casi: el logaritmo sale del lado izquierdo $\\int dy/y = \\ln|y|$; del lado derecho integras un polinomio.']],
      'Separando $\\frac{dy}{y} = ax\\,dx$ e integrando queda $\\ln|y| = \\frac{a}{2}x^2 + C$, de donde $y = 5e^{(a/2)x^2}$.',
      { vars: { a: [4, 8, 2] } }),

    C('pe-arctan-integral', 'pvi-explicito', 1,
      'Para resolver la ecuación separable $\\dfrac{dy}{dx} = (1 + y^2)\\cos x$, al separar queda $\\dfrac{dy}{1 + y^2} = \\cos x\\,dx$. ¿Cuál es la antiderivada del lado izquierdo?',
      '$\\arctan y$', [
        ['$\\ln(1 + y^2)$', 'Casi: la derivada de $\\ln(1 + y^2)$ es $\\frac{2y}{1 + y^2}$; cuando arriba hay un $1$ la antiderivada es $\\arctan y$.'],
        ['$\\dfrac{1}{2y}\\ln(1 + y^2)$', 'Casi: no puedes sacar $2y$ como si fuera constante; $\\int \\frac{dy}{1 + y^2}$ es directamente $\\arctan y$.'],
        ['$y + \\dfrac{y^3}{3}$', 'Casi: integraste $(1 + y^2)$ como si estuviera en el numerador, pero al separar pasa dividiendo.']],
      'La integral inmediata de $\\frac{1}{1 + y^2}\\,dy$ es $\\arctan y$, que luego se invierte con $\\tan(\\cdot)$.'),

    E('pe-e-gauss', 'pvi-explicito', 1, { a: [2, 8, 2], y0: [2, 7, 1] },
      function (v) { return 'Resuelve el PVI $\\dfrac{dy}{dx} = ' + v.a + 'x\\,y$ con condición inicial $y(0) = ' + v.y0 + '$. Escribe la solución explícita $y(x)$.'; },
      function (v) { return v.y0 + '*e^(' + (v.a / 2) + '*x^2)'; },
      'De $\\frac{dy}{y} = ax\\,dx$ sale $\\ln|y| = \\frac{a}{2}x^2 + C$, y con $y(0) = y_0$ queda $y = y_0 e^{(a/2)x^2}$.',
      { domain: [-1.2, 1.2],
        mistakes: {
          noHalf: function (v) { return v.y0 + '*e^(' + v.a + '*x^2)'; },
          plusC: function (v) { return 'e^(' + (v.a / 2) + '*x^2) + ' + (v.y0 - 1); },
          linearExp: function (v) { return v.y0 + '*e^(' + v.a + '*x)'; }
        },
        feedback: [
          { when: 'noHalf', say: 'Casi: al integrar $ax\\,dx$ sale $(a/2)x^2$; olvidaste dividir entre 2.' },
          { when: 'plusC', say: 'Casi: al despejar de $\\ln|y| = G(x) + C$, la constante multiplica a la exponencial, no se suma afuera.' },
          { when: 'linearExp', say: 'Casi: integraste $ax$ como $ax$ en lugar de $(a/2)x^2$.' }
        ] }),

    N('pe-n-potencia-xy', 'pvi-explicito', 1, { m: [2, 4, 1], y1: [2, 5, 1], x1: [2, 3, 1] },
      function (v) { return 'Resuelve por separación de variables $x\\,\\dfrac{dy}{dx} = ' + v.m + 'y$ (para $x > 0$) con $y(1) = ' + v.y1 + '$, y calcula el valor de $y(' + v.x1 + ')$.'; },
      function (v) { return v.y1 * Math.pow(v.x1, v.m); },
      'Separando $\\frac{dy}{y} = \\frac{m}{x}\\,dx$ queda $\\ln|y| = m\\ln x + C \\Rightarrow y = y(1)x^m$.',
      { mistakes: { linearVal: function (v) { return v.y1 * v.x1 * v.m; }, addedC: function (v) { return Math.pow(v.x1, v.m) + v.y1 - 1; } },
        feedback: [
          { when: 'linearVal', say: 'Casi: de $\\ln y = m\\ln x + C$ sale la potencia $x^m$, no un múltiplo lineal.' },
          { when: 'addedC', say: 'Casi: la constante que sale del logaritmo multiplica a $x^m$, no se suma.' }
        ] }),

    N('pe-n-exp-simple-eval', 'pvi-explicito', 1, { a: [2, 4, 1], y0: [3, 7, 1] },
      function (v) { return 'Encuentra la solución del PVI $\\dfrac{dy}{dx} = ' + (2 * v.a) + 'x\\,y$ con $y(0) = ' + v.y0 + '$ y evalúala en $x = 1$.'; },
      function (v) { return v.y0 * Math.exp(v.a); },
      'Integrando $\\frac{dy}{y} = 2ax\\,dx$ resulta $y(x) = y_0 e^{ax^2}$, que en $x = 1$ vale $y_0 e^a$.',
      { mistakes: { noHalf: function (v) { return v.y0 * Math.exp(2 * v.a); }, addedY0: function (v) { return Math.exp(v.a) + v.y0 - 1; } },
        feedback: [
          { when: 'noHalf', say: 'Casi: la integral de $2ax\\,dx$ es $ax^2$, dividiendo entre 2.' },
          { when: 'addedY0', say: 'Casi: la condición inicial $y(0) = y_0$ fija el coeficiente que multiplica a la exponencial.' }
        ] }),

    C('pe-despeje-reciproco', 'pvi-explicito', 2,
      'Al resolver $\\dfrac{dy}{dx} = y^2\\,g(x)$, del lado izquierdo integras $\\displaystyle\\int y^{-2}\\,dy$. ¿Qué error es muy común cometer en esa integral?',
      'Escribir $\\ln(y^2)$ o $+\\dfrac{1}{y}$ en lugar de $-\\dfrac{1}{y}$, olvidando que $\\int y^{-2}\\,dy = -y^{-1}$', [
        ['Escribir $-\\dfrac{1}{y}$, cuando la antiderivada correcta de $1/y^2$ es $\\ln|y^2|$', 'Casi: el logaritmo solo sale con potencia $-1$ ($\\int y^{-1}dy = \\ln|y|$); para $y^{-2}$ se usa la regla de la potencia y da $-1/y$.'],
        ['Sacar $y^{-2}$ fuera de la integral como si fuera constante', 'Casi: estás integrando respecto a $y$, así que $y^{-2}$ es el integrando y su antiderivada es $-1/y$.'],
        ['Elevar al cubo y escribir $\\dfrac{y^3}{3}$', 'Casi: como $y^2$ pasó dividiendo al lado izquierdo, el exponente es $-2$, no $+2$.']],
      'Por la regla de la potencia con $n = -2$: $\\int y^{-2}\\,dy = \\frac{y^{-1}}{-1} = -\\frac{1}{y}$.'),

    C('pe-cuidado-reciproco-suma', 'pvi-explicito', 2,
      'Si después de integrar llegas a $-\\dfrac{1}{y} = x^2 - C$, ¿cuál es el despeje algebraico correcto de $y(x)$?',
      '$y(x) = \\dfrac{1}{C - x^2}$', [
        ['$y(x) = \\dfrac{1}{C} - \\dfrac{1}{x^2}$', 'Casi: el recíproco de una resta no es la resta de los recíprocos; debes invertir toda la expresión junta.'],
        ['$y(x) = \\dfrac{1}{x^2 - C}$', 'Casi: olvidaste el signo menos del lado izquierdo $-1/y$; al multiplicar por $-1$ se invierte la resta a $C - x^2$.'],
        ['$y(x) = C - x^2$', 'Casi: en la izquierda tienes $-1/y$, así que para despejar $y$ falta tomar el recíproco.']],
      'Multiplicando ambos lados por $-1$ queda $\\frac{1}{y} = C - x^2$, y al invertir toda la expresión resulta $y = \\frac{1}{C - x^2}$.'),

    E('pe-e-arctan-pvi', 'pvi-explicito', 2, { a: [2, 5, 1] },
      function (v) { return 'Resuelve el PVI $\\dfrac{dy}{dx} = ' + v.a + 'x^{' + (v.a - 1) + '}(1 + y^2)$ con condición inicial $y(0) = 0$. Escribe la solución explícita $y(x)$.'; },
      function (v) { return 'tan(x^' + v.a + ')'; },
      'Separando $\\frac{dy}{1 + y^2} = ax^{a-1}\\,dx$ e integrando queda $\\arctan y = x^a + C$. Con $y(0) = 0$ sale $C = 0$ y $y = \\tan(x^a)$.',
      { domain: [0.1, 0.9],
        mistakes: { atanInstead: function (v) { return 'atan(x^' + v.a + ')'; }, noCancelA: function (v) { return 'tan(' + v.a + '*x^' + v.a + ')'; } },
        feedback: [
          { when: 'atanInstead', say: 'Casi: $\\arctan y = x^a$, así que al despejar $y$ aplicas la función inversa $\\tan(x^a)$.' },
          { when: 'noCancelA', say: 'Casi: al integrar $ax^{a-1}$ el coeficiente $a$ se cancela al dividir entre el nuevo exponente.' }
        ] }),

    E('pe-e-reciproco-pvi', 'pvi-explicito', 2, { a: [1, 3, 1], c0: [4, 7, 1] },
      function (v) { return 'Resuelve por variables separables $\\dfrac{dy}{dx} = ' + (2 * v.a) + 'x\\,y^2$ con $y(0) = \\dfrac{1}{' + v.c0 + '}$. Escribe la función $y(x)$.'; },
      function (v) { return '1 / (' + v.c0 + ' - ' + v.a + '*x^2)'; },
      'De $\\frac{dy}{y^2} = 2ax\\,dx$ se obtiene $-\\frac{1}{y} = ax^2 - C$, es decir $y = \\frac{1}{C - ax^2}$ con $C = c_0$.',
      { domain: [-1, 1],
        mistakes: { plusSign: function (v) { return '1 / (' + v.c0 + ' + ' + v.a + '*x^2)'; }, noHalf: function (v) { return '1 / (' + v.c0 + ' - ' + (2 * v.a) + '*x^2)'; } },
        feedback: [
          { when: 'plusSign', say: 'Casi: como $\\int y^{-2}dy = -1/y$ lleva signo menos, en el denominador queda una resta $c_0 - ax^2$.' },
          { when: 'noHalf', say: 'Casi: al integrar $2ax\\,dx$ queda $ax^2$, dividiendo entre 2.' }
        ] }),

    E('pe-e-desplazada-lin', 'pvi-explicito', 2, { k: [2, 5, 1], b: [2, 6, 1], d: [2, 6, 1] },
      function (v) { return 'Resuelve separando variables la ecuación $\\dfrac{dy}{dx} = ' + v.k + '(y - ' + v.b + ')$ con condición inicial $y(0) = ' + (v.b + v.d) + '$. Escribe $y(x)$.'; },
      function (v) { return v.b + ' + ' + v.d + '*e^(' + v.k + '*x)'; },
      'Separando $\\frac{dy}{y - b} = k\\,dx$ sale $y - b = Ae^{kx}$. Con $y(0) = b + d$ resulta $A = d$.',
      { domain: [0, 1],
        mistakes: { usedY0: function (v) { return v.b + ' + ' + (v.b + v.d) + '*e^(' + v.k + '*x)'; }, noB: function (v) { return v.d + '*e^(' + v.k + '*x)'; } },
        feedback: [
          { when: 'usedY0', say: 'Casi: en $x = 0$ tienes $b + A = y(0)$, así que $A = y(0) - b$, no $y(0)$.' },
          { when: 'noB', say: 'Casi: al despejar $y$ de $y - b = de^{kx}$ falta sumar $+b$.' }
        ] }),

    N('pe-n-arctan-eval', 'pvi-explicito', 2, { a: [3, 5, 1], b: [2, 5, 1] },
      function (v) { return 'Resuelve el PVI $\\dfrac{dy}{dx} = \\dfrac{1 + y^2}{' + v.a + '}$ con condición inicial $y(0) = 0$, y calcula el valor de $y(' + v.b + ')$ (con el argumento en radianes).'; },
      function (v) { return Math.tan(v.b / v.a); },
      'Integrando $\\frac{dy}{1 + y^2} = \\frac{1}{a}\\,dx$ con $y(0) = 0$ queda $\\arctan y = \\frac{x}{a} \\Rightarrow y(b) = \\tan(b/a)$.',
      { where: function (v) { var u = v.b / v.a; return u >= 0.6 && u <= 1.2; },
        mistakes: { atanVal: function (v) { return Math.atan(v.b / v.a); }, linearVal: function (v) { return v.b / v.a; } },
        feedback: [
          { when: 'atanVal', say: 'Casi: la integral izquierda ya es $\\arctan y$, así que al despejar $y$ aplicas $\\tan(b/a)$, no $\\arctan(b/a)$.' },
          { when: 'linearVal', say: 'Casi: ese es el valor de $\\arctan y$; falta aplicar la función tangente para despejar $y$.' }
        ] }),

    N('pe-n-exp-y-log', 'pvi-explicito', 2, { a: [2, 5, 1], y0: [1, 3, 1], x1: [1, 3, 1] },
      function (v) { return 'Resuelve la ecuación separable $e^y\\,\\dfrac{dy}{dx} = ' + (2 * v.a) + 'x$ con condición inicial $y(0) = ' + v.y0 + '$ y calcula $y(' + v.x1 + ')$.'; },
      function (v) { return Math.log(v.a * v.x1 * v.x1 + Math.exp(v.y0)); },
      'Al integrar queda $e^y = ax^2 + C$. En $x = 0$, $C = e^{y_0}$, así que $y(x_1) = \\ln(ax_1^2 + e^{y_0})$.',
      { mistakes: { cIsY0: function (v) { return Math.log(v.a * v.x1 * v.x1 + v.y0); }, addedOutside: function (v) { return Math.log(v.a * v.x1 * v.x1) + v.y0; } },
        feedback: [
          { when: 'cIsY0', say: 'Casi: en $x = 0$ el lado izquierdo es $e^{y(0)}$, no $y(0)$.' },
          { when: 'addedOutside', say: 'Casi: la constante $C = e^{y_0}$ se suma a $ax^2$ antes de tomar el logaritmo natural.' }
        ] }),

    N('pe-n-reciproco-eval', 'pvi-explicito', 2, { a: [1, 3, 1], y0: [2, 5, 1] },
      function (v) { return 'Sea el PVI $\\dfrac{dy}{dx} = -' + (2 * v.a) + 'x\\,y^2$ con condición inicial $y(0) = ' + v.y0 + '$. Calcula el valor de $y(1)$.'; },
      function (v) { return 1 / ((1 / v.y0) + v.a); },
      'De $-\\frac{1}{y} = -ax^2 - C$ sale $\\frac{1}{y} = ax^2 + \\frac{1}{y_0}$, por lo que en $x = 1$ se tiene $y(1) = \\frac{1}{a + 1/y_0}$.',
      { mistakes: { noHalf: function (v) { return 1 / ((1 / v.y0) + 2 * v.a); }, usedY0NotInv: function (v) { return 1 / (v.y0 + v.a); } },
        feedback: [
          { when: 'noHalf', say: 'Casi: al integrar $2ax\\,dx$ queda $ax^2$, dividiendo entre 2.' },
          { when: 'usedY0NotInv', say: 'Casi: en $x = 0$ tienes $1/y(0)$, no $y(0)$.' }
        ] }),

    N('pe-n-cos-exp-eval', 'pvi-explicito', 2, { a: [2, 5, 1], y0: [2, 6, 1] },
      function (v) { return 'Resuelve el PVI $\\dfrac{dy}{dx} = ' + v.a + 'y\\cos x$ con condición inicial $y(0) = ' + v.y0 + '$, y calcula el valor de $y(\\pi/2)$.'; },
      function (v) { return v.y0 * Math.exp(v.a); },
      'Separando $\\frac{dy}{y} = a\\cos x\\,dx$ e integrando con $y(0) = y_0$ queda $y(x) = y_0 e^{a\\sin x}$, que en $x = \\pi/2$ vale $y_0 e^a$.',
      { mistakes: { usedCos: function (v) { return v.y0; }, linearVal: function (v) { return v.y0 + v.a; } },
        feedback: [
          { when: 'usedCos', say: 'Casi: la integral de $\\cos x$ es $\\sin x$, y en $x = \\pi/2$ se tiene $\\sin(\\pi/2) = 1$.' },
          { when: 'linearVal', say: 'Casi: al despejar $\\ln|y| = a\\sin x + C$ aparece una exponencial $y_0 e^{a\\sin x}$, no una suma.' }
        ] }),

    C('pe-logistica-pasos', 'pvi-explicito', 3,
      'Al resolver la ecuación logística $\\dfrac{dy}{dt} = k\\,y(M - y)$ por separación de variables, ¿qué técnica de integración permite calcular $\\displaystyle\\int \\frac{dy}{y(M - y)}$?',
      'Descomposición en fracciones parciales: $\\dfrac{1}{y(M - y)} = \\dfrac{1}{M}\\left(\\dfrac{1}{y} + \\dfrac{1}{M - y}\\right)$', [
        ['Cambio de variable $u = y(M - y)$, porque su derivada $M - 2y$ se cancela sola', 'Casi: en el numerador no aparece $M - 2y$, así que el cambio $u = y(M - y)$ no simplifica la integral.'],
        ['Integrar cada factor por separado como $(\\ln|y|)\\cdot(-\\ln|M - y|)$', 'Casi: la integral de un producto o cociente nunca es el producto de las integrales de cada factor.'],
        ['Integración por partes tomando $u = 1/y$ y $dv = dy/(M - y)$', 'Casi: por partes vuelve a aparecer una integral con el mismo producto en el denominador; lo directo es fracciones parciales.']],
      'Al separar $\\frac{1}{y(M - y)}$ en suma de fracciones simples se obtienen dos logaritmos inmediatos.'),

    E('pe-e-potencia-desp', 'pvi-explicito', 3, { a: [2, 4, 1], b: [2, 5, 1] },
      function (v) { return 'Resuelve para $x > -1$ el PVI $(x + 1)\\,\\dfrac{dy}{dx} = ' + v.a + 'y$ con condición inicial $y(0) = ' + v.b + '$. Escribe la solución $y(x)$.'; },
      function (v) { return v.b + '*(x + 1)^' + v.a; },
      'Separando $\\frac{dy}{y} = \\frac{a}{x + 1}\\,dx$ queda $\\ln|y| = a\\ln(x + 1) + C = \\ln(A(x + 1)^a)$, y con $y(0) = b$ resulta $A = b$.',
      { domain: [0.2, 2.5],
        mistakes: { expForm: function (v) { return v.b + '*e^(' + v.a + '*(x + 1))'; }, addedB: function (v) { return '(x + 1)^' + v.a + ' + ' + (v.b - 1); } },
        feedback: [
          { when: 'expForm', say: 'Casi: del lado derecho integras $a/(x + 1)$, que da $a\\ln(x + 1)$, así que al tomar exponencial queda $(x + 1)^a$.' },
          { when: 'addedB', say: 'Casi: la constante que sale del logaritmo multiplica a $(x + 1)^a$, no se suma afuera.' }
        ] }),

    E('pe-e-ln-sol', 'pvi-explicito', 3, { a: [2, 5, 1], b: [2, 6, 1] },
      function (v) { return 'Resuelve el PVI $e^{y}\\,\\dfrac{dy}{dx} = ' + (2 * v.a) + 'x$ con condición inicial $y(0) = \\ln(' + v.b + ')$. Escribe la función explícita $y(x)$ (usa <code>ln(...)</code>).'; },
      function (v) { return 'log(' + v.a + '*x^2 + ' + v.b + ')'; },
      'Integrando $e^y\\,dy = 2ax\\,dx$ queda $e^y = ax^2 + C$. En $x = 0$, $e^{\\ln b} = b = C$, por lo que $y(x) = \\ln(ax^2 + b)$.',
      { domain: [-2, 2],
        mistakes: { splitLn: function (v) { return 'log(' + v.a + '*x^2 + 1) + log(' + v.b + ')'; }, noHalf: function (v) { return 'log(' + (2 * v.a) + '*x^2 + ' + v.b + ')'; } },
        feedback: [
          { when: 'splitLn', say: 'Casi: la constante $b$ se suma a $ax^2$ dentro del mismo logaritmo: $\\ln(ax^2 + b)$.' },
          { when: 'noHalf', say: 'Casi: al integrar $2ax\\,dx$ debes dividir entre 2, quedando $ax^2$.' }
        ] }),

    N('pe-n-logistica-eval', 'pvi-explicito', 3, { M: [10, 20, 5], y0: [2, 4, 2], k: [1, 2, 1] },
      function (v) { return 'La solución del PVI logístico $\\dfrac{dy}{dt} = ' + (v.k / 10) + '\\,y(' + v.M + ' - y)$ con $y(0) = ' + v.y0 + '$ se obtiene por fracciones parciales como $y(t) = \\dfrac{' + v.M + '}{1 + A\\,e^{-' + (v.M * v.k / 10) + 't}}$, donde $A = \\dfrac{' + v.M + ' - y(0)}{y(0)}$. Calcula $y(1)$.'; },
      function (v) {
        var A = (v.M - v.y0) / v.y0;
        var r = v.M * v.k / 10;
        return v.M / (1 + A * Math.exp(-r));
      },
      'Con $A = (M - y_0)/y_0$, basta evaluar $M / (1 + A e^{-Mk/10})$ en $t = 1$.',
      { mistakes: {
          invA: function (v) { var A = v.y0 / (v.M - v.y0); var r = v.M * v.k / 10; return v.M / (1 + A * Math.exp(-r)); },
          onlyA: function (v) { return (v.M - v.y0) / v.y0; }
        },
        feedback: [
          { when: 'invA', say: 'Casi: invertiste la fracción de $A$; debe ser $A = (M - y_0)/y_0$.' },
          { when: 'onlyA', say: 'Casi: ese es el valor de la constante $A$; falta sustituirla en la fórmula de $y(1)$.' }
        ] }),

    /* ======================= 3. Soluciones implícitas, raíces y signo (16) ======================= */
    C('ri-eleccion-rama-neg', 'raices-implicita', 1,
      function (v) { return 'Al resolver $\\dfrac{dy}{dx} = \\dfrac{x}{y}$ llegas a $y^2 = x^2 + K$. Si la condición inicial es $y(0) = -' + v.c + '$, ¿cuál es la solución explícita correcta?'; },
      function (v) { return '$y(x) = -\\sqrt{x^2 + ' + (v.c * v.c) + '}$'; }, [
        [function (v) { return '$y(x) = \\sqrt{x^2 + ' + (v.c * v.c) + '}$'; }, 'Casi: la raíz cuadrada principal siempre es positiva y daría $y(0) > 0$, contradiciendo la condición inicial negativa.'],
        [function (v) { return '$y(x) = \\pm\\sqrt{x^2 + ' + (v.c * v.c) + '}$'; }, 'Casi: con $\\pm$ no defines una función única; la condición inicial negativa selecciona únicamente la rama con signo menos.'],
        [function (v) { return '$y(x) = -\\sqrt{x^2 - ' + (v.c * v.c) + '}$'; }, 'Casi: al elevar $y(0) = -c$ al cuadrado da $K = (-c)^2 = +c^2$ positivo.']],
      'De $y(0)^2 = K$ sale $K = c^2$, y como $y(0) = -c < 0$ se debe elegir la rama negativa de la raíz.',
      { vars: { c: [2, 7, 1] } }),

    C('ri-error-raiz-suma', 'raices-implicita', 1,
      'Un estudiante obtiene $y = \\sqrt{x^2 + 9}$ como solución de $y\' = x/y$ con $y(0) = 3$, y la «simplifica» a $y = x + 3$. ¿Por qué es incorrecto ese paso?',
      'Porque la raíz cuadrada no se distribuye en una suma: $\\sqrt{x^2 + 9} \\neq \\sqrt{x^2} + \\sqrt{9}$', [
        ['Porque al sacar raíz de $x^2 + 9$ debía quedar $y = x + 9$', 'Casi: tampoco es $x + 9$; la expresión $\\sqrt{x^2 + 9}$ no se puede separar como suma.'],
        ['Porque la recta $y = x + 3$ no cumple la condición inicial $y(0) = 3$', 'Casi: $y = x + 3$ sí vale $3$ en $x = 0$, pero su derivada es $y\' = 1 \\neq x/(x + 3)$, así que no resuelve la EDO.'],
        ['Porque siempre hay que dejar el signo negativo $-\\sqrt{x^2 + 9}$', 'Casi: con $y(0) = 3 > 0$ el signo positivo es correcto; el error fue partir la raíz de la suma.']],
      'La raíz de una suma no es la suma de las raíces; $\\sqrt{x^2 + 9}$ ya está en su forma más simple.'),

    C('ri-que-es-implicita', 'raices-implicita', 1,
      'Al integrar $(3y^2 + 1)\\,dy = 2x\\,dx$ se obtiene $y^3 + y = x^2 + C$. ¿Por qué se deja la respuesta en esa forma?',
      'Porque no es sencillo despejar $y$ explícitamente, y la relación $y^3 + y = x^2 + C$ ya define válidamente la solución en forma implícita', [
        ['Porque la ecuación diferencial original no era de variables separables', 'Casi: sí era separable; separar e integrar siempre da una relación $F(y) = G(x) + C$, solo que a veces $F(y)$ no se invierte fácil.'],
        ['Porque en las ecuaciones con $y^3$ no se pueden aplicar condiciones iniciales', 'Casi: sí puedes usar una condición inicial $y(x_0) = y_0$ sustituyendo ambos valores directamente en $y^3 + y = x^2 + C$.'],
        ['Porque falta derivar otra vez para encontrar $C$', 'Casi: la constante $C$ se halla evaluando en el punto inicial $(x_0, y_0)$, no volviendo a derivar.']],
      'Cuando $F(y) = G(x) + C$ no permite despejar $y(x)$ con operaciones elementales, la ecuación implícita es la respuesta completa.'),

    N('ri-n-constante-K-cuad', 'raices-implicita', 1, { x0: [1, 3, 1], y0: [4, 7, 1] },
      function (v) { return 'Al resolver $y\\,\\dfrac{dy}{dx} = x$ se obtiene la familia implícita $y^2 - x^2 = K$. Si la condición inicial es $y(' + v.x0 + ') = -' + v.y0 + '$, ¿cuánto vale la constante $K$?'; },
      function (v) { return v.y0 * v.y0 - v.x0 * v.x0; },
      'Sustituyendo $x = x_0$ y $y = -y_0$: $K = (-y_0)^2 - x_0^2 = y_0^2 - x_0^2$.',
      { mistakes: { negY0Sq: function (v) { return -v.y0 * v.y0 - v.x0 * v.x0; }, noSquare: function (v) { return -v.y0 - v.x0; } },
        feedback: [
          { when: 'negY0Sq', say: 'Casi: al elevar un número negativo al cuadrado el resultado es positivo: $(-y_0)^2 = +y_0^2$.' },
          { when: 'noSquare', say: 'Casi: en la relación implícita aparecen $y^2$ y $x^2$ elevados al cuadrado.' }
        ] }),

    N('ri-n-constante-implicita-cub', 'raices-implicita', 1, { x0: [1, 3, 1], y0: [2, 4, 1] },
      function (v) { return 'La solución general implícita de $(3y^2 + 2)\\,y\' = 2x$ es $y^3 + 2y = x^2 + C$. ¿Cuánto vale $C$ si la solución pasa por $(' + v.x0 + ', ' + v.y0 + ')$?'; },
      function (v) { return Math.pow(v.y0, 3) + 2 * v.y0 - v.x0 * v.x0; },
      'Despejando $C$ en el punto inicial: $C = y_0^3 + 2y_0 - x_0^2$.',
      { where: function (v) { return v.x0 !== v.y0; },
        mistakes: { plusX0Sq: function (v) { return Math.pow(v.y0, 3) + 2 * v.y0 + v.x0 * v.x0; }, swappedXY: function (v) { return Math.pow(v.x0, 3) + 2 * v.x0 - v.y0 * v.y0; } },
        feedback: [
          { when: 'plusX0Sq', say: 'Casi: de $y_0^3 + 2y_0 = x_0^2 + C$ el término $x_0^2$ pasa restando.' },
          { when: 'swappedXY', say: 'Casi: intercambiaste las coordenadas $x_0$ y $y_0$ al evaluar.' }
        ] }),

    C('ri-circulo-dominio', 'raices-implicita', 2,
      function (v) { return 'Al resolver $\\dfrac{dy}{dx} = -\\dfrac{x}{y}$ con $y(0) = ' + v.r + '$ se llega a $x^2 + y^2 = ' + (v.r * v.r) + '$ y al despejar queda $y(x) = \\sqrt{' + (v.r * v.r) + ' - x^2}$. ¿Por qué esta solución no es diferenciable en $x = \\pm ' + v.r + '$?'; },
      function (v) { return 'Porque en $x = \\pm ' + v.r + '$ se tiene $y = 0$, lo que divide entre cero en $y\' = -x/y$ (tangente vertical en la circunferencia)'; }, [
        [function (v) { return 'Porque en $x = \\pm ' + v.r + '$ la cantidad dentro de la raíz se vuelve estrictamente negativa'; }, 'Casi: justo en $x = \\pm r$ el radicando vale $0$; el problema es que la derivada $y\' = -x/y$ tiene a $y = 0$ en el denominador.'],
        [function (v) { return 'Porque $x^2 + y^2 = ' + (v.r * v.r) + '$ solo se cumple en $x = 0$'; }, 'Casi: la igualdad se cumple en todo el intervalo abierto $(-r, r)$, no solo en $x = 0$.'],
        [function (v) { return 'Porque para $x \\neq 0$ habría que cambiar al signo negativo $-\\sqrt{' + (v.r * v.r) + ' - x^2}$'; }, 'Casi: mientras $x \\in (-r, r)$, la solución permanece continua y positiva en la semicircunferencia superior.']],
      'En los extremos $x = \\pm r$ la altura es $y = 0$ y la pendiente $y\' = -x/y$ explota, así que el intervalo de validez es $(-r, r)$.',
      { vars: { r: [3, 7, 1] } }),

    C('ri-despeje-con-desplazamiento', 'raices-implicita', 2,
      'Al integrar $(y - 2)\\,dy = x\\,dx$ queda $\\dfrac{(y - 2)^2}{2} = \\dfrac{x^2}{2} + C$. Si $y(0) = 5$, ¿cuál es el despeje explícito correcto de $y(x)$?',
      '$y(x) = 2 + \\sqrt{x^2 + 9}$, porque $(5 - 2)^2 = 9$ y $y(0) - 2 = 3 > 0$', [
        ['$y(x) = 2 - \\sqrt{x^2 + 9}$', 'Casi: con el signo menos tendrías $y(0) = 2 - 3 = -1$, que no cumple $y(0) = 5$.'],
        ['$y(x) = 2 + \\sqrt{x^2 + 25}$', 'Casi: en $x = 0$ lo que se eleva al cuadrado es $(y(0) - 2)^2 = (5 - 2)^2 = 9$, no $y(0)^2 = 25$.'],
        ['$y(x) = \\sqrt{x^2 + 9} - 2$', 'Casi: al despejar $y$ de $y - 2 = \\sqrt{x^2 + 9}$, el $2$ pasa sumando, no restando.']],
      'De $(y - 2)^2 = x^2 + K$ en $x = 0$ sale $K = (5 - 2)^2 = 9$, y como $y(0) - 2 > 0$ se toma la raíz positiva: $y = 2 + \\sqrt{x^2 + 9}$.'),

    E('ri-e-rama-pos', 'raices-implicita', 2, { a: [1, 3, 1], c: [2, 5, 1] },
      function (v) { return 'Resuelve $\\dfrac{dy}{dx} = \\dfrac{' + v.a + 'x}{y}$ con condición inicial $y(0) = ' + v.c + '$. Escribe la solución explícita $y(x)$.'; },
      function (v) { return 'sqrt(' + v.a + '*x^2 + ' + (v.c * v.c) + ')'; },
      'Separando $y\\,dy = ax\\,dx$ e integrando queda $y^2 = ax^2 + c^2$. Como $y(0) = c > 0$, se elige la raíz positiva.',
      { domain: [-2, 2],
        mistakes: { negBranch: function (v) { return '-sqrt(' + v.a + '*x^2 + ' + (v.c * v.c) + ')'; }, noSquareC: function (v) { return 'sqrt(' + v.a + '*x^2 + ' + v.c + ')'; } },
        feedback: [
          { when: 'negBranch', say: 'Casi: como $y(0) > 0$, debes elegir la rama positiva de la raíz cuadrada.' },
          { when: 'noSquareC', say: 'Casi: en $y^2 = ax^2 + K$, al evaluar en $x = 0$ queda $K = y(0)^2$.' }
        ] }),

    E('ri-e-rama-neg', 'raices-implicita', 2, { a: [1, 3, 1], c: [2, 5, 1] },
      function (v) { return 'Encuentra la solución explícita del PVI $y\\,\\dfrac{dy}{dx} = ' + v.a + 'x$ que cumple $y(0) = -' + v.c + '$. Escribe $y(x)$.'; },
      function (v) { return '-sqrt(' + v.a + '*x^2 + ' + (v.c * v.c) + ')'; },
      'De $y^2 = ax^2 + K$ con $y(0) = -c$ sale $K = c^2$, y el signo negativo de $y(0)$ obliga a tomar $y = -\\sqrt{ax^2 + c^2}$.',
      { domain: [-2, 2],
        mistakes: { posBranch: function (v) { return 'sqrt(' + v.a + '*x^2 + ' + (v.c * v.c) + ')'; }, noSquareC: function (v) { return '-sqrt(' + v.a + '*x^2 + ' + v.c + ')'; } },
        feedback: [
          { when: 'posBranch', say: 'Casi: la condición inicial es negativa ($y(0) < 0$), así que corresponde la rama $-\\sqrt{\\cdots}$.' },
          { when: 'noSquareC', say: 'Casi: la constante dentro de la raíz es $K = (-c)^2 = c^2$.' }
        ] }),

    N('ri-n-eval-rama-neg', 'raices-implicita', 2, { a: [1, 3, 1], y0: [2, 5, 1], x1: [2, 4, 1] },
      function (v) { return 'Resuelve el PVI $\\dfrac{dy}{dx} = \\dfrac{' + v.a + 'x}{y}$ con condición inicial $y(0) = -' + v.y0 + '$ y calcula el valor de $y(' + v.x1 + ')$.'; },
      function (v) { return -Math.sqrt(v.a * v.x1 * v.x1 + v.y0 * v.y0); },
      'La rama negativa es $y(x) = -\\sqrt{ax^2 + y_0^2}$; basta evaluarla en $x = x_1$.',
      { mistakes: { posBranch: function (v) { return Math.sqrt(v.a * v.x1 * v.x1 + v.y0 * v.y0); }, noSquareY0: function (v) { return -Math.sqrt(v.a * v.x1 * v.x1 + v.y0); } },
        feedback: [
          { when: 'posBranch', say: 'Casi: olvidaste el signo menos de la rama negativa dada por $y(0) < 0$.' },
          { when: 'noSquareY0', say: 'Casi: dentro de la raíz va $y(0)^2$, no $|y(0)|$.' }
        ] }),

    N('ri-n-eval-circulo', 'raices-implicita', 2, { r: [5, 9, 1], x1: [2, 4, 1] },
      function (v) { return 'Para el PVI $\\dfrac{dy}{dx} = -\\dfrac{x}{y}$ con $y(0) = ' + v.r + '$, ¿cuánto vale la solución $y(' + v.x1 + ')$?'; },
      function (v) { return Math.sqrt(v.r * v.r - v.x1 * v.x1); },
      'De $y\\,dy = -x\\,dx$ resulta $x^2 + y^2 = r^2$, y con $y(0) = r > 0$ queda $y(x_1) = \\sqrt{r^2 - x_1^2}$.',
      { mistakes: { plusSign: function (v) { return Math.sqrt(v.r * v.r + v.x1 * v.x1); }, noRoot: function (v) { return v.r * v.r - v.x1 * v.x1; } },
        feedback: [
          { when: 'plusSign', say: 'Casi: en la ecuación hay un signo menos ($y\' = -x/y$), por lo que queda $r^2 - x^2$ dentro de la raíz.' },
          { when: 'noRoot', say: 'Casi: ese es el valor de $y^2$; falta sacar la raíz cuadrada.' }
        ] }),

    N('ri-n-eval-raiz-desp', 'raices-implicita', 2, { b: [2, 4, 1], d: [2, 4, 1], x1: [2, 4, 1] },
      function (v) { return 'Resuelve $(y - ' + v.b + ')\\,\\dfrac{dy}{dx} = x$ con condición inicial $y(0) = ' + (v.b + v.d) + '$ y evalúa $y(' + v.x1 + ')$.'; },
      function (v) { return v.b + Math.sqrt(v.x1 * v.x1 + v.d * v.d); },
      'Integrando: $(y - b)^2 = x^2 + d^2 \\Rightarrow y(x) = b + \\sqrt{x^2 + d^2}$.',
      { mistakes: { noB: function (v) { return Math.sqrt(v.x1 * v.x1 + v.d * v.d); }, squaredY0: function (v) { return v.b + Math.sqrt(v.x1 * v.x1 + (v.b + v.d) * (v.b + v.d)); } },
        feedback: [
          { when: 'noB', say: 'Casi: ese es el valor de $y - b$; falta sumar $+b$.' },
          { when: 'squaredY0', say: 'Casi: en $x = 0$ se eleva al cuadrado $(y(0) - b)^2$, no $y(0)^2$.' }
        ] }),

    N('ri-n-eval-cubica', 'raices-implicita', 2, { a: [1, 3, 1], y0: [2, 4, 1], x1: [2, 3, 1] },
      function (v) { return 'Resuelve el PVI $y^2\\,\\dfrac{dy}{dx} = ' + v.a + 'x^2$ con $y(0) = ' + v.y0 + '$ y calcula el valor de $y(' + v.x1 + ')$.'; },
      function (v) { return Math.cbrt(v.a * Math.pow(v.x1, 3) + Math.pow(v.y0, 3)); },
      'De $\\frac{y^3}{3} = \\frac{ax^3}{3} + C$ sale $y^3 = ax^3 + y_0^3$, así que $y(x_1) = \\sqrt[3]{ax_1^3 + y_0^3}$.',
      { mistakes: { forgotCubeY0: function (v) { return Math.cbrt(v.a * Math.pow(v.x1, 3) + v.y0); }, noCbrt: function (v) { return v.a * Math.pow(v.x1, 3) + Math.pow(v.y0, 3); } },
        feedback: [
          { when: 'forgotCubeY0', say: 'Casi: en $x = 0$ tienes $y(0)^3$, no $y(0)$.' },
          { when: 'noCbrt', say: 'Casi: ese es el valor de $y^3$; falta sacar la raíz cúbica.' }
        ] }),

    C('ri-unicidad-y-cero', 'raices-implicita', 3,
      'En la ecuación $y\\,y\' = x$, las curvas integrales forman hipérbolas $y^2 - x^2 = K$. ¿Por qué ninguna solución diferenciable $y(x)$ puede cruzar el eje $x$ (donde $y = 0$)?',
      'Porque al escribir $y\' = x/y$, la derivada se indefine cuando $y = 0$ y la curva tendría tangente vertical', [
        ['Porque $y^2 - x^2 = K$ nunca tiene puntos con $y = 0$ para ningún valor de $K$', 'Casi: cuando $K < 0$ la curva $y^2 - x^2 = K$ sí corta el eje $x$, pero ahí la tangente es vertical y se parte en dos ramas.'],
        ['Porque $y(x) = 0$ es una solución de equilibrio que bloquea el paso por unicidad', 'Casi: $y = 0$ no es solución de $y\\,y\' = x$, pues al sustituir daría $0 = x$.'],
        ['Porque al integrar $y\\,dy$ aparece $\\ln|y|$, que explota en $y = 0$', 'Casi: la integral de $y\\,dy$ es $y^2/2$, no $\\ln|y|$.']],
      'Cuando una curva integral corta $y = 0$ (con $x \\neq 0$), la pendiente $y\' = x/y$ tiende a $\\pm\\infty$, rompiendo la diferenciabilidad de $y(x)$.'),

    E('ri-e-desp-neg', 'raices-implicita', 3, { b: [3, 6, 1], d: [1, 2, 1] },
      function (v) { return 'Resuelve $(y - ' + v.b + ')\\,\\dfrac{dy}{dx} = x$ con condición inicial $y(0) = ' + (v.b - v.d) + '$. Escribe la solución explícita $y(x)$.'; },
      function (v) { return v.b + ' - sqrt(x^2 + ' + (v.d * v.d) + ')'; },
      'De $(y - b)^2 = x^2 + K$ en $x = 0$ sale $K = (-d)^2 = d^2$. Como $y(0) - b = -d < 0$, toca la rama con signo menos: $y = b - \\sqrt{x^2 + d^2}$.',
      { domain: [-2, 2],
        mistakes: { posBranch: function (v) { return v.b + ' + sqrt(x^2 + ' + (v.d * v.d) + ')'; }, wrongK: function (v) { return v.b + ' - sqrt(x^2 + ' + ((v.b - v.d) * (v.b - v.d)) + ')'; } },
        feedback: [
          { when: 'posBranch', say: 'Casi: como $y(0) < b$, la diferencia $y - b$ es negativa y lleva $-\\sqrt{\\cdots}$.' },
          { when: 'wrongK', say: 'Casi: la constante dentro de la raíz es $(y(0) - b)^2$, no $y(0)^2$.' }
        ] }),

    N('ri-n-implicita-recta-x', 'raices-implicita', 3, { a: [1, 3, 1], b: [2, 5, 1], y0: [1, 2, 1], y1: [3, 4, 1] },
      function (v) { return 'La solución del PVI $(' + (3 * v.a) + 'y^2 + ' + v.b + ')\\,\\dfrac{dy}{dx} = 1$ con $y(0) = ' + v.y0 + '$ queda definida implícitamente. ¿En qué valor de $x$ alcanza la solución la altura $y(x) = ' + v.y1 + '$?'; },
      function (v) { return v.a * (Math.pow(v.y1, 3) - Math.pow(v.y0, 3)) + v.b * (v.y1 - v.y0); },
      'Integrando $(3ay^2 + b)\\,dy = dx$ entre $x = 0$ ($y = y_0$) y $x$ ($y = y_1$) resulta $x = a(y_1^3 - y_0^3) + b(y_1 - y_0)$.',
      { mistakes: { forgotY0: function (v) { return v.a * Math.pow(v.y1, 3) + v.b * v.y1; }, noDiv3: function (v) { return 3 * v.a * (Math.pow(v.y1, 3) - Math.pow(v.y0, 3)) + v.b * (v.y1 - v.y0); } },
        feedback: [
          { when: 'forgotY0', say: 'Casi: en $x = 0$ se tiene $y(0) = y_0 \\neq 0$, así que hay que restar el valor en $y_0$.' },
          { when: 'noDiv3', say: 'Casi: al integrar $3ay^2\\,dy$ se divide entre 3, quedando $ay^3$.' }
        ] }),

    /* ======================= 4. Soluciones de equilibrio y pérdida al dividir (16) ======================= */
    C('eq-como-hallar', 'equilibrio', 1,
      'En una ecuación separable $\\dfrac{dy}{dx} = g(x)\\,h(y)$, ¿cómo encuentras las soluciones de equilibrio (constantes) antes de dividir entre $h(y)$?',
      'Buscando las raíces constantes $y = c$ donde $h(c) = 0$', [
        ['Buscando los valores de $x$ donde $g(x) = 0$', 'Casi: donde $g(x) = 0$ las curvas solución tienen tangente horizontal en ese $x$, pero no son funciones constantes $y(x) = c$.'],
        ['Evaluando $h(0)$ y $g(0)$ en el origen', 'Casi: un equilibrio es una recta horizontal $y = c$ que anula $h(c) = 0$ para todo $x$, no evaluar en cero.'],
        ['Integrando $h(y)$ e igualando la integral a cero', 'Casi: no hay que integrar; como $y = c$ tiene derivada $y\' = 0$, basta resolver algebraicamente $h(c) = 0$.']],
      'Si $h(c) = 0$, la función constante $y(x) = c$ tiene derivada $0$ y anula el lado derecho $g(x)h(c) = 0$ para todo $x$.'),

    C('eq-por-que-se-pierde', 'equilibrio', 1,
      'Al pasar de $\\dfrac{dy}{dx} = g(x)\\,h(y)$ a $\\dfrac{dy}{h(y)} = g(x)\\,dx$, ¿por qué se pueden perder las soluciones de equilibrio?',
      'Porque al dividir entre $h(y)$ estás suponiendo implícitamente que $h(y) \\neq 0$', [
        ['Porque la integral de una función constante siempre diverge', 'Casi: el problema no es integrar una constante, sino haber dividido entre cero cuando $h(y) = 0$.'],
        ['Porque al integrar se borra la variable $x$ del lado derecho', 'Casi: $x$ sí se integra; lo que se excluye al dividir entre $h(y)$ son los valores donde $h(y) = 0$.'],
        ['Porque las funciones constantes no tienen derivada', 'Casi: toda función constante sí es derivable y su derivada vale idénticamente $0$.']],
      'Dividir entre $h(y)$ solo es válido cuando $h(y) \\neq 0$, por lo que las rectas $y = c$ con $h(c) = 0$ deben revisarse aparte.'),

    C('eq-sin-equilibrios', 'equilibrio', 1,
      '¿Cuál de las siguientes ecuaciones separables <strong>no</strong> tiene ninguna solución de equilibrio real?',
      '$y\' = (1 + y^2)\\,e^x$, porque $1 + y^2 \\ge 1 > 0$ nunca se anula en $\\mathbb{R}$', [
        ['$y\' = y^2\\,\\cos x$', 'Casi: aquí $h(y) = y^2$ se anula en $y = 0$, así que $y(x) = 0$ sí es solución de equilibrio.'],
        ['$y\' = x(y - 4)$', 'Casi: cuando $y = 4$ el factor $y - 4$ vale $0$, por lo que $y(x) = 4$ es solución de equilibrio.'],
        ['$y\' = (y^2 - 1)\\,x^2$', 'Casi: $y^2 - 1 = 0$ tiene dos raíces reales, dando los equilibrios $y = 1$ y $y = -1$.']],
      'Como $h(y) = 1 + y^2$ no tiene raíces reales, ninguna función constante $y(x) = c$ anula el lado derecho.'),

    N('eq-n-raiz-lineal', 'equilibrio', 1, { a: [2, 5, 1], b: [3, 13, 2] },
      function (v) { return '¿Cuál es el valor de la constante $c$ tal que $y(x) = c$ es la solución de equilibrio de $\\dfrac{dy}{dx} = (x^2 + 1)(' + v.a + 'y - ' + v.b + ')$?'; },
      function (v) { return v.b / v.a; },
      'El factor en $y$ se anula cuando $ay - b = 0 \\Rightarrow y = b/a$.',
      { mistakes: { negVal: function (v) { return -v.b / v.a; }, invVal: function (v) { return v.a / v.b; } },
        feedback: [
          { when: 'negVal', say: 'Casi: al despejar $y$ de $ay - b = 0$, el término $b$ pasa con signo positivo.' },
          { when: 'invVal', say: 'Casi: debes dividir $b$ entre el coeficiente $a$ de $y$, no al revés.' }
        ] }),

    N('eq-n-pvi-en-equilibrio', 'equilibrio', 1, { c: [2, 8, 1], x0: [1, 4, 1], x1: [5, 9, 1] },
      function (v) { return 'Sea el PVI $\\dfrac{dy}{dx} = x^3(y - ' + v.c + ')^2$ con condición inicial $y(' + v.x0 + ') = ' + v.c + '$. ¿Cuánto vale la solución $y(' + v.x1 + ')$?'; },
      function (v) { return v.c; },
      'Como $y(x_0) = c$ coincide con el equilibrio donde $(y - c)^2 = 0$, la solución única es la función constante $y(x) = c$ para todo $x$.',
      { where: function (v) { return v.c !== v.x0; },
        mistakes: { evalX1: function (v) { return v.c + v.x1; }, tookX0: function (v) { return v.x0; } },
        feedback: [
          { when: 'evalX1', say: 'Casi: la solución de equilibrio $y(x) = c$ permanece constante en todo $x$.' },
          { when: 'tookX0', say: 'Casi: ese es el punto inicial $x_0$; la altura constante de la solución es $y = c$.' }
        ] }),

    C('eq-recupera-con-A0', 'equilibrio', 2,
      'En $\\dfrac{dy}{dx} = 2xy$, al dividir entre $y$ excluyes $y = 0$ y llegas a $|y| = e^C e^{x^2}$. ¿Cómo se recupera la solución de equilibrio $y = 0$ dentro de la familia $y = A\\,e^{x^2}$?',
      'Permitiendo que la constante arbitraria $A$ tome cualquier valor real, incluido $A = 0$', [
        ['Tomando $C = 0$, porque $e^0 = 0$', 'Casi: recuerda que $e^0 = 1$, no $0$; con $C = 0$ obtienes $y = \\pm e^{x^2}$, no $y = 0$.'],
        ['Evaluando la familia en $x = 0$, donde $e^{x^2}$ se anula', 'Casi: la exponencial $e^{x^2}$ nunca se anula para ningún $x$ real.'],
        ['No se puede incluir en $y = Ae^{x^2}$ ni siquiera permitiendo $A = 0$', 'Casi: si defines $A \\in \\mathbb{R}$, el caso $A = 0$ da exactamente la función constante $y(x) = 0$.']],
      'Aunque $A = \\pm e^C$ es inicialmente distinto de cero, autorizar $A = 0$ incorpora la solución de equilibrio $y = 0$ en la misma fórmula $y = Ae^{x^2}$.'),

    C('eq-no-recupera-reciproco', 'equilibrio', 2,
      function (v) { return 'Para $\\dfrac{dy}{dx} = (y - ' + v.c + ')^2$, la integración da la familia $y(x) = ' + v.c + ' - \\dfrac{1}{x + C}$. ¿Qué valor finito de $C$ produce la solución de equilibrio $y(x) = ' + v.c + '$?'; },
      function (v) { return 'Ningún valor real de $C$, porque $\\dfrac{1}{x + C}$ nunca es cero; $y = ' + v.c + '$ se perdió al dividir'; }, [
        ['El valor $C = 0$, que anula la fracción', 'Casi: con $C = 0$ queda $y = c - 1/x$, que no es la constante $c$.'],
        [function (v) { return 'El valor $C = ' + v.c + '$'; }, 'Casi: con $C = c$ queda $y = c - 1/(x + c)$, donde la fracción sigue siendo distinta de cero.'],
        ['El valor $C = -x$', 'Casi: $C$ debe ser una constante independiente de $x$, y además $x + C = 0$ indefiniría la división.']],
      'Como $1/(x + C) \\neq 0$ para todo $C \\in \\mathbb{R}$, la solución constante $y = c$ no pertenece a esa familia para ningún $C$ finito.',
      { vars: { c: [2, 6, 1] } }),

    E('eq-e-constante', 'equilibrio', 2, { c: [2, 7, 1], a: [2, 5, 1] },
      function (v) { return 'Resuelve el PVI $\\dfrac{dy}{dx} = \\cos(' + v.a + 'x)\\,(y - ' + v.c + ')^3$ con condición inicial $y(0) = ' + v.c + '$. Escribe la función solución $y(x)$.'; },
      function (v) { return String(v.c); },
      'En $y = c$ se anula $(y - c)^3 = 0$ y la derivada de la constante $c$ también es $0$, por lo que $y(x) = c$ resuelve el PVI.',
      { domain: [-2, 2],
        mistakes: { withSin: function (v) { return v.c + ' + sin(' + v.a + '*x)'; }, withX: function (v) { return v.c + '*x'; } },
        feedback: [
          { when: 'withSin', say: 'Casi: como $y(0) = c$ es raíz de $(y - c)^3 = 0$, la solución se queda constante en $y(x) = c$.' },
          { when: 'withX', say: 'Casi: una solución de equilibrio es la función constante $y(x) = c$, sin multiplicar por $x$.' }
        ] }),

    N('eq-n-suma-equilibrios', 'equilibrio', 2, { r1: [1, 4, 1], r2: [5, 8, 1] },
      function (v) { return 'Considera la ecuación separable $\\dfrac{dy}{dx} = e^{-x}(y - ' + v.r1 + ')(y - ' + v.r2 + ')$. Calcula la suma de los valores de sus dos soluciones de equilibrio.'; },
      function (v) { return v.r1 + v.r2; },
      'Los equilibrios son las raíces de $(y - r_1)(y - r_2) = 0$, es decir $y = r_1$ y $y = r_2$, cuya suma es $r_1 + r_2$.',
      { mistakes: { prodRoots: function (v) { return v.r1 * v.r2; }, diffRoots: function (v) { return v.r2 - v.r1; } },
        feedback: [
          { when: 'prodRoots', say: 'Casi: multiplicaste las dos raíces en lugar de sumarlas.' },
          { when: 'diffRoots', say: 'Casi: ambas raíces $r_1$ y $r_2$ son positivas, así que se suman.' }
        ] }),

    N('eq-n-producto-equilibrios', 'equilibrio', 2, { a: [2, 4, 1], b: [3, 6, 1] },
      function (v) { return 'La ecuación $\\dfrac{dy}{dx} = (x^2 + 4)(y + ' + v.a + ')(y - ' + v.b + ')$ tiene dos soluciones constantes $y = c_1$ y $y = c_2$. ¿Cuánto vale el producto $c_1\\cdot c_2$?'; },
      function (v) { return -v.a * v.b; },
      'Las raíces de $(y + a)(y - b) = 0$ son $c_1 = -a$ y $c_2 = b$, cuyo producto es $-ab$.',
      { mistakes: { posProd: function (v) { return v.a * v.b; }, sumRoots: function (v) { return v.b - v.a; } },
        feedback: [
          { when: 'posProd', say: 'Casi: del factor $(y + a) = 0$ sale la raíz negativa $c_1 = -a$, así que el producto es negativo.' },
          { when: 'sumRoots', say: 'Casi: esa es la suma de las raíces; te piden su producto $c_1\\cdot c_2$.' }
        ] }),

    N('eq-n-limite-asintotico', 'equilibrio', 2, { k: [2, 5, 1], c: [3, 8, 1], y0: [10, 15, 1] },
      function (v) { return 'Para la ecuación $\\dfrac{dy}{dt} = -' + v.k + '(y - ' + v.c + ')$ con condición inicial $y(0) = ' + v.y0 + '$, ¿a qué valor límite tiende $y(t)$ cuando $t \\to \\infty$?'; },
      function (v) { return v.c; },
      'La solución es $y(t) = c + (y_0 - c)e^{-kt}$; cuando $t \\to \\infty$, el término exponencial se anula y $y(t) \\to c$.',
      { mistakes: { toY0: function (v) { return v.y0; }, diffY0C: function (v) { return v.y0 - v.c; } },
        feedback: [
          { when: 'toY0', say: 'Casi: ese es el valor inicial $y(0)$; cuando $t \\to \\infty$ la solución se acerca al equilibrio $y = c$.' },
          { when: 'diffY0C', say: 'Casi: esa es la amplitud inicial $y_0 - c$, que decae a cero; el valor final es $c$.' }
        ] }),

    N('eq-n-logistica-equil-pos', 'equilibrio', 2, { r: [2, 5, 1], K: [12, 30, 6] },
      function (v) { return 'En el modelo logístico $\\dfrac{dy}{dt} = ' + v.r + 'y\\left(1 - \\dfrac{y}{' + v.K + '}\\right)$, existen dos soluciones de equilibrio: $y = 0$ y una capacidad de carga positiva $y = M$. ¿Cuánto vale $M$?'; },
      function (v) { return v.K; },
      'El segundo factor se anula cuando $1 - y/K = 0 \\Rightarrow y = K$.',
      { mistakes: { divR: function (v) { return v.K / v.r; }, multR: function (v) { return v.K * v.r; } },
        feedback: [
          { when: 'divR', say: 'Casi: el factor constante $r$ afuera del paréntesis no cambia la raíz de $1 - y/K = 0$.' },
          { when: 'multR', say: 'Casi: para anular $1 - y/K = 0$ solo necesitas $y = K$.' }
        ] }),

    N('eq-n-pvi-cerca-equil', 'equilibrio', 2, { c: [2, 5, 1], x1: [1, 3, 1] },
      function (v) { return 'Al resolver $\\dfrac{dy}{dx} = (y - ' + v.c + ')^2$ con $y(0) = ' + (v.c - 1) + '$ (fuera del equilibrio), se obtiene $y(x) = ' + v.c + ' - \\dfrac{1}{x + 1}$. Calcula $y(' + v.x1 + ')$.'; },
      function (v) { return v.c - 1 / (v.x1 + 1); },
      'Basta evaluar $c - \\frac{1}{x_1 + 1}$; se acerca al equilibrio $c$ sin alcanzarlo.',
      { mistakes: { justEquil: function (v) { return v.c; }, plusFrac: function (v) { return v.c + 1 / (v.x1 + 1); } },
        feedback: [
          { when: 'justEquil', say: 'Casi: como $y(0) \\neq c$, la solución no es igual a $c$ en ningún $x$ finito.' },
          { when: 'plusFrac', say: 'Casi: en la solución la fracción se resta de $c$, no se suma.' }
        ] }),

    C('eq-unicidad-barrera', 'equilibrio', 3,
      function (v) { return 'La ecuación $\\dfrac{dy}{dt} = (y - ' + v.a + ')(' + v.b + ' - y)$ tiene soluciones de equilibrio en $y = ' + v.a + '$ y $y = ' + v.b + '$. Si una solución empieza con $y(0) = ' + (v.a + 1) + '$, ¿por qué queda atrapada entre $' + v.a + '$ y $' + v.b + '$ para todo $t$?'; },
      function (v) { return 'Porque las rectas $y = ' + v.a + '$ y $y = ' + v.b + '$ son soluciones exactas y, por unicidad, ninguna otra curva solución puede cruzarlas'; }, [
        [function (v) { return 'Porque la derivada $y\'$ se indefine cuando $y = ' + v.a + '$ o $y = ' + v.b + '$'; }, 'Casi: el polinomio $(y - a)(b - y)$ está bien definido en todo $\\mathbb{R}$; no cruza porque esas rectas ya son soluciones.'],
        [function (v) { return 'Porque entre $y = ' + v.a + '$ y $y = ' + v.b + '$ la derivada vale siempre cero'; }, 'Casi: entre $a$ y $b$ ambos factores son positivos, así que $y\' > 0$ y la solución crece acercándose a $b$ sin alcanzarlo.'],
        [function (v) { return 'Solo queda atrapada para $t < 1$, pero después cruza la recta $y = ' + v.b + '$'; }, 'Casi: el teorema de existencia y unicidad prohíbe que dos soluciones se toquen en cualquier instante finito $t$.']],
      'Por el teorema de unicidad, una trayectoria no puede cortar a las soluciones constantes $y = a$ ni $y = b$.',
      { vars: { a: [2, 4, 1], b: [6, 9, 1] } }),

    N('eq-n-explosion-arriba-equil', 'equilibrio', 3, { c: [2, 5, 1], d: [2, 4, 1] },
      function (v) { return 'Para $\\dfrac{dy}{dx} = (y - ' + v.c + ')^2$, si $y(0) = ' + (v.c + v.d) + ' > ' + v.c + '$, la solución es $y(x) = ' + v.c + ' + \\dfrac{1}{\\frac{1}{' + v.d + '} - x}$, que se aleja del equilibrio y explota en un valor finito $x^*$. ¿Cuánto vale $x^*$?'; },
      function (v) { return 1 / v.d; },
      'El denominador se anula cuando $\\frac{1}{d} - x^* = 0 \\Rightarrow x^* = \\frac{1}{d}$.',
      { mistakes: { justD: function (v) { return v.d; }, invSum: function (v) { return 1 / (v.c + v.d); } },
        feedback: [
          { when: 'justD', say: 'Casi: dentro del denominador aparece el recíproco $1/d$, así que explota en $x^* = 1/d$.' },
          { when: 'invSum', say: 'Casi: lo que interviene en la fracción es el exceso inicial $d = y(0) - c$, no $y(0)$.' }
        ] }),

    N('eq-n-pendiente-max-logistica', 'equilibrio', 3, { r: [3, 5, 1], K: [8, 16, 4] },
      function (v) { return 'Una solución de la ecuación logística $\\dfrac{dy}{dt} = ' + v.r + 'y\\left(1 - \\dfrac{y}{' + v.K + '}\\right)$ que empieza en $y(0) = 1$ crece entre los equilibrios $0$ y $' + v.K + '$. ¿Cuánto vale la razón de cambio máxima $y\'_{\\text{máx}}$ que alcanza al pasar por el punto medio $y = ' + (v.K / 2) + '$?'; },
      function (v) { return v.r * (v.K / 4); },
      'Evaluando el lado derecho en $y = K/2$: $y\' = r(K/2)(1 - 1/2) = rK/4$.',
      { mistakes: { halfInsteadQuarter: function (v) { return v.r * (v.K / 2); }, justMidpoint: function (v) { return v.K / 2; } },
        feedback: [
          { when: 'halfInsteadQuarter', say: 'Casi: olvidaste multiplicar por el factor $(1 - y/K) = 1/2$ en el punto medio.' },
          { when: 'justMidpoint', say: 'Casi: esa es la altura $y = K/2$; te piden la derivada $y\'$ evaluada en esa altura.' }
        ] }),

    /* ======================= 5. Crecimiento, decaimiento y vida media (17) ======================= */
    C('de-vida-media-indep', 'decaimiento', 1,
      'En el decaimiento radiactivo $N(t) = N_0 e^{-kt}$, si tienes dos muestras del mismo isótopo, una de $10\\text{ g}$ y otra de $100\\text{ g}$, ¿cómo se comparan sus vidas medias?',
      'Son exactamente iguales, porque $T_{1/2} = \\dfrac{\\ln 2}{k}$ no depende de la masa inicial $N_0$', [
        ['La de $100\\text{ g}$ tiene una vida media $10$ veces mayor porque tiene $10$ veces más átomos', 'Casi: aunque tiene $10$ veces más átomos, también se desintegran $10$ veces más rápido, así que tarda lo mismo en bajar a la mitad.'],
        ['La de $10\\text{ g}$ tiene una vida media mayor porque decae más despacio al principio', 'Casi: la fracción que se pierde por unidad de tiempo depende solo de $k$, no de $N_0$.'],
        ['La de $100\\text{ g}$ tarda el doble de tiempo en reducirse a la mitad', 'Casi: al plantear $N_0 e^{-kT} = \\frac{1}{2}N_0$, el factor $N_0$ se cancela de ambos lados.']],
      'Al resolver $\\frac{1}{2}N_0 = N_0 e^{-kT}$ se cancela $N_0$ y queda $T = \\frac{\\ln 2}{k}$, independiente de la cantidad inicial.'),

    C('de-no-es-lineal', 'decaimiento', 1,
      'Una sustancia radiactiva tiene una vida media de $5$ días. Si en los primeros $5$ días se desintegra el $50\\,\\%$, ¿por qué en los siguientes $5$ días <strong>no</strong> desaparece el $50\\,\\%$ restante para llegar a cero?',
      'Porque en cada vida media se desintegra la mitad de lo que queda en ese momento (pasando del $50\\,\\%$ al $25\\,\\%$), no una cantidad fija', [
        ['Porque la constante $k$ disminuye a la mitad después de los primeros $5$ días', 'Casi: la constante de decaimiento $k$ del isótopo no cambia con el tiempo; lo que disminuye es la cantidad $N(t)$.'],
        ['Porque a partir del día $5$ la ecuación diferencial cambia de exponencial a lineal', 'Casi: la ecuación $N\' = -kN$ es la misma en todo momento y su solución $N_0 e^{-kt}$ nunca llega exactamente a cero.'],
        ['Sí llega a cero a los $10$ días, porque $50\\,\\% + 50\\,\\% = 100\\,\\%$', 'Casi: ese sería un decaimiento lineal; en el exponencial pierdes la mitad de la mitad, quedando $25\\,\\%$.']],
      'Cada periodo $T_{1/2}$ multiplica la cantidad restante por $1/2$: $100\\,\\% \\to 50\\,\\% \\to 25\\,\\% \\to 12.5\\,\\%$.'),

    C('de-unidades-k', 'decaimiento', 1,
      'En la ley $N(t) = N_0 e^{-kt}$, si el tiempo $t$ se mide en años y la cantidad $N$ en gramos, ¿qué unidades tiene la constante $k$?',
      '$1/\\text{año}$ (o $\\text{año}^{-1}$), para que el exponente $kt$ sea adimensional', [
        ['$\\text{gramos}/\\text{año}$, porque mide cuántos gramos se pierden por año', 'Casi: quien tiene unidades de $\\text{gramos}/\\text{año}$ es la derivada $dN/dt = -kN$; como $N$ ya está en gramos, $k$ está en $1/\\text{año}$.'],
        ['$\\text{años}$, igual que la vida media $T_{1/2}$', 'Casi: la vida media $T_{1/2} = \\ln(2)/k$ está en años, por lo que $k$ tiene la unidad recíproca $1/\\text{año}$.'],
        ['No tiene unidades, porque todas las constantes de una EDO son adimensionales', 'Casi: el producto $kt$ es adimensional, así que si $t$ tiene unidades de tiempo, $k$ debe tener unidades de $1/\\text{tiempo}$.']],
      'El argumento de una exponencial no puede tener unidades, por lo que $[k]\\cdot[t] = 1 \\Rightarrow [k] = 1/\\text{año}$.'),

    N('de-n-k-desde-vida', 'decaimiento', 1, { T: [2, 7, 1] },
      function (v) { return 'Un isótopo radiactivo tiene una vida media de $' + v.T + '$ horas. Calcula su constante de decaimiento $k$ (en $1/\\text{h}$).'; },
      function (v) { return Math.log(2) / v.T; },
      'De $T_{1/2} = \\frac{\\ln 2}{k}$ se despeja $k = \\frac{\\ln 2}{T_{1/2}}$.',
      { unit: '1/h',
        mistakes: { invFormula: function (v) { return v.T / Math.log(2); }, usedHalf: function (v) { return 0.5 / v.T; } },
        feedback: [
          { when: 'invFormula', say: 'Casi: invertiste el cociente; es $k = (\\ln 2)/T$, no $T/(\\ln 2)$.' },
          { when: 'usedHalf', say: 'Casi: en el numerador va $\\ln 2 \\approx 0.693$, no $0.5$.' }
        ] }),

    N('de-n-vida-desde-k', 'decaimiento', 1, { k: [1, 5, 1] },
      function (v) { return 'Un fármaco en el torrente sanguíneo obedece $C\'(t) = -0.' + v.k + '\\,C(t)$, con $t$ en horas. ¿Cuál es la vida media del fármaco (en horas)?'; },
      function (v) { return Math.log(2) / (0.1 * v.k); },
      'La vida media es $T_{1/2} = \\frac{\\ln 2}{k}$.',
      { unit: 'h',
        mistakes: { justRecip: function (v) { return 1 / (0.1 * v.k); }, halfOverK: function (v) { return 0.5 / (0.1 * v.k); } },
        feedback: [
          { when: 'justRecip', say: 'Casi: $1/k$ es el tiempo en que cae a $1/e$; para la mitad se multiplica por $\\ln 2$.' },
          { when: 'halfOverK', say: 'Casi: al despejar de $e^{-kT} = 1/2$ sale $\\ln 2$ en el numerador, no $0.5$.' }
        ] }),

    C('de-carbono14-sin-N0', 'decaimiento', 2,
      'Al datar un fósil con carbono 14 sabes que conserva el $30\\,\\%$ del C-14 original, pero no sabes cuántos gramos de C-14 tenía el organismo al morir. ¿Por qué sí puedes calcular la antigüedad $t$?',
      'Porque en la ecuación $0.30\\,N_0 = N_0 e^{-kt}$ la cantidad inicial $N_0$ se cancela al dividir ambos lados entre $N_0$', [
        ['Porque para todos los seres vivos la masa inicial $N_0$ vale exactamente $1\\text{ g}$', 'Casi: $N_0$ depende del tamaño del organismo, pero se cancela porque solo importa el cociente $N(t)/N_0 = 0.30$.'],
        ['Porque la vida media del carbono 14 cambia según la masa del fósil', 'Casi: la vida media del C-14 es fija ($5730$ años) para cualquier muestra.'],
        ['Porque en realidad se despeja $t$ de la resta $N_0 - N(t) = 0.30$', 'Casi: el $30\\,\\%$ es una proporción $N(t)/N_0 = 0.30$, no una resta.']],
      'El tiempo depende únicamente de la fracción restante $N(t)/N_0 = e^{-kt}$, no del valor absoluto de $N_0$.'),

    C('de-crecimiento-vs-decaimiento', 'decaimiento', 2,
      'Un cultivo de bacterias crece según $P\'(t) = k\\,P(t)$ con $k > 0$. Si en $3$ horas la población pasa de $P_0$ a $2P_0$, ¿cuánto valdrá la población a las $9$ horas?',
      '$8P_0$, porque en $9$ horas transcurren tres periodos de duplicación ($2^3 = 8$)', [
        ['$6P_0$, porque si en $3$ horas se multiplica por $2$, en $9$ horas se multiplica por $3\\times 2 = 6$', 'Casi: cada $3$ horas se duplica la población acumulada: $P_0 \\to 2P_0 \\to 4P_0 \\to 8P_0$.'],
        ['$4P_0$, porque aumenta en $P_0$ cada $3$ horas', 'Casi: aumentar una cantidad fija $P_0$ cada $3$ horas sería crecimiento lineal, no exponencial.'],
        ['$9P_0$, multiplicando por el número de horas', 'Casi: la ley es $P(t) = P_0\\cdot 2^{t/3}$, que en $t = 9$ da $2^3 P_0 = 8P_0$.']],
      'Cada $3$ horas la población se multiplica por $2$, así que en $9 = 3\\times 3$ horas se multiplica por $2^3 = 8$.'),

    E('de-e-crecimiento', 'decaimiento', 2, { P0: [20, 80, 20], k: [2, 5, 1] },
      function (v) { return 'Una población de bacterias cumple $\\dfrac{dP}{dt} = 0.' + v.k + '\\,P$ (con $t$ en horas) y empieza con $P(0) = ' + v.P0 + '$ miles. Escribe la función $P(t)$ en términos de $t$.'; },
      function (v) { return v.P0 + '*e^(0.' + v.k + '*t)'; },
      'De $P\' = kP$ con $P(0) = P_0$ se obtiene directamente $P(t) = P_0 e^{kt}$.',
      { exprVars: ['t'], domain: [0, 3],
        mistakes: { decaySign: function (v) { return v.P0 + '*e^(-0.' + v.k + '*t)'; }, linearModel: function (v) { return v.P0 + ' + 0.' + v.k + '*t'; } },
        feedback: [
          { when: 'decaySign', say: 'Casi: aquí la tasa es positiva ($P\' = +kP$), por lo que el exponente es positivo.' },
          { when: 'linearModel', say: 'Casi: cuando el ritmo es proporcional a $P$, el crecimiento es exponencial, no lineal.' }
        ] }),

    N('de-n-tiempo-fraccion', 'decaimiento', 2, { T: [4, 12, 2], p: [15, 40, 5] },
      function (v) { return 'Un isótopo tiene vida media de $' + v.T + '$ días. ¿Cuántos días deben pasar para que quede el $' + v.p + '\\,\\%$ de la muestra inicial?'; },
      function (v) { return v.T * Math.log(100 / v.p) / Math.log(2); },
      'Con $k = \\frac{\\ln 2}{T}$ y $\\frac{p}{100} = e^{-kt}$, se despeja $t = T\\,\\frac{\\ln(100/p)}{\\ln 2}$.',
      { unit: 'días',
        mistakes: { linearRule: function (v) { return v.T * (100 - v.p) / 50; }, usedDropped: function (v) { return v.T * Math.log(100 / (100 - v.p)) / Math.log(2); } },
        feedback: [
          { when: 'linearRule', say: 'Casi: el decaimiento es exponencial, no lineal; usa logaritmos.' },
          { when: 'usedDropped', say: function (v) { return 'Casi: el $' + v.p + '\\,\\%$ ya es la fracción que queda, no la que se perdió.'; } }
        ] }),

    N('de-n-cantidad-restante', 'decaimiento', 2, { N0: [80, 200, 40], T: [3, 6, 1], t1: [4, 10, 2] },
      function (v) { return 'Una muestra radiactiva de $' + v.N0 + '$ mg tiene una vida media de $' + v.T + '$ horas. ¿Cuántos miligramos quedan después de $' + v.t1 + '$ horas?'; },
      function (v) { return v.N0 * Math.pow(0.5, v.t1 / v.T); },
      'En $t_1$ horas transcurren $t_1/T$ vidas medias, así que $N(t_1) = N_0(1/2)^{t_1/T} = N_0 e^{-(\\ln 2)t_1/T}$.',
      { unit: 'mg',
        where: function (v) { return v.t1 !== v.T; },
        mistakes: { forgotLn2: function (v) { return v.N0 * Math.exp(-v.t1 / v.T); }, ratioInstead: function (v) { return v.N0 * 0.5 * (v.T / v.t1); } },
        feedback: [
          { when: 'forgotLn2', say: 'Casi: la constante es $k = (\\ln 2)/T$, no $1/T$; te faltó el factor $\\ln 2$ en el exponente.' },
          { when: 'ratioInstead', say: 'Casi: el cociente $t_1/T$ va en el exponente de $(1/2)^{t_1/T}$, no dividiendo.' }
        ] }),

    N('de-n-carbono14-edad', 'decaimiento', 2, { p: [20, 75, 5] },
      function (v) { return 'El carbono 14 tiene una vida media de $5730$ años. Si una pieza de madera arqueológica conserva el $' + v.p + '\\,\\%$ de su carbono 14 original, ¿cuántos años de antigüedad tiene?'; },
      function (v) { return 5730 * Math.log(100 / v.p) / Math.log(2); },
      'De $N/N_0 = p/100 = e^{-kt}$ con $k = \\frac{\\ln 2}{5730}$ resulta $t = 5730\\,\\frac{\\ln(100/p)}{\\ln 2}$.',
      { unit: 'años',
        where: function (v) { return v.p !== 50; },
        mistakes: { noLn2: function (v) { return 5730 * Math.log(100 / v.p); }, linearAge: function (v) { return 5730 * (100 - v.p) / 50; } },
        feedback: [
          { when: 'noLn2', say: 'Casi: olvidaste dividir entre $\\ln 2$, pues $k = (\\ln 2)/5730$.' },
          { when: 'linearAge', say: 'Casi: el carbono 14 decae exponencialmente, no a un porcentaje fijo por año.' }
        ] }),

    N('de-n-bacterias-duplicacion', 'decaimiento', 2, { P0: [100, 300, 50], P1: [500, 900, 100], t1: [2, 5, 1] },
      function (v) { return 'Un cultivo bacteriano con crecimiento exponencial $P\' = kP$ pasa de $' + v.P0 + '$ a $' + v.P1 + '$ bacterias en $' + v.t1 + '$ horas. ¿Cuál es su tiempo de duplicación $T_2$ (en horas)?'; },
      function (v) { return v.t1 * Math.log(2) / Math.log(v.P1 / v.P0); },
      'Primero $k = \\frac{1}{t_1}\\ln(P_1/P_0)$, y luego el tiempo de duplicación es $T_2 = \\frac{\\ln 2}{k}$.',
      { unit: 'h',
        where: function (v) { return v.P1 !== 2 * v.P0; },
        mistakes: { justK: function (v) { return Math.log(v.P1 / v.P0) / v.t1; }, invertedLogs: function (v) { return v.t1 * Math.log(v.P1 / v.P0) / Math.log(2); } },
        feedback: [
          { when: 'justK', say: 'Casi: ese es el valor de la constante $k$; falta calcular $T_2 = (\\ln 2)/k$.' },
          { when: 'invertedLogs', say: 'Casi: invertiste la fracción de logaritmos; es $T_2 = t_1(\\ln 2)/\\ln(P_1/P_0)$.' }
        ] }),

    N('de-n-interes-continuo', 'decaimiento', 2, { C0: [1000, 5000, 1000], r: [8, 14, 2], t: [5, 10, 1] },
      function (v) {
        var rStr = v.r < 10 ? '0.0' + v.r : '0.' + v.r;
        return 'Una cuenta con interés compuesto continuo cumple $\\dfrac{dS}{dt} = ' + rStr + '\\,S$, con $t$ en años. Si depositas $' + v.C0 + '$ pesos en $t = 0$, ¿cuántos pesos tendrás a los $' + v.t + '$ años?';
      },
      function (v) { return v.C0 * Math.exp(0.01 * v.r * v.t); },
      'La solución de $S\' = rS$ es $S(t) = C_0 e^{rt}$.',
      { unit: 'pesos',
        mistakes: { simpleInterest: function (v) { return v.C0 * (1 + 0.01 * v.r * v.t); }, forgotT: function (v) { return v.C0 * Math.exp(0.01 * v.r); } },
        feedback: [
          { when: 'simpleInterest', say: 'Casi: usaste interés simple lineal $C_0(1 + rt)$ en vez de compuesto continuo $C_0 e^{rt}$.' },
          { when: 'forgotT', say: 'Casi: te faltó multiplicar la tasa por el número de años $t$ en el exponente.' }
        ] }),

    N('de-n-descarga-rc', 'decaimiento', 2, { V0: [10, 24, 2], tau: [2, 5, 1], t1: [3, 7, 2] },
      function (v) { return 'Al descargarse un capacitor a través de una resistencia, su voltaje cumple $\\dfrac{dV}{dt} = -\\dfrac{V}{' + v.tau + '}$ (con $t$ en segundos). Si $V(0) = ' + v.V0 + '$ V, ¿qué voltaje queda en $t = ' + v.t1 + '$ s?'; },
      function (v) { return v.V0 * Math.exp(-v.t1 / v.tau); },
      'Separando $\\frac{dV}{V} = -\\frac{1}{\\tau}\\,dt$ queda $V(t) = V_0 e^{-t/\\tau}$.',
      { unit: 'V',
        mistakes: { multTau: function (v) { return v.V0 * Math.exp(-v.t1 * v.tau); }, usedHalf: function (v) { return v.V0 * Math.pow(0.5, v.t1 / v.tau); } },
        feedback: [
          { when: 'multTau', say: 'Casi: en la EDO se divide entre $\\tau$, así que el exponente es $-t/\\tau$, no $-t\\tau$.' },
          { when: 'usedHalf', say: 'Casi: $\\tau$ es la constante de tiempo ($k = 1/\\tau$), no la vida media; la base es $e$, no $1/2$.' }
        ] }),

    C('de-dos-mediciones-sin-N0', 'decaimiento', 3,
      'De una muestra radiactiva que sigue $N(t) = N_0 e^{-kt}$ no conoces $N_0$, pero mides $N(t_1) = A$ y más tarde $N(t_2) = B$. ¿Cómo se relaciona el cociente $A/B$ con el tiempo transcurrido $\\Delta t = t_2 - t_1$?',
      '$\\dfrac{A}{B} = e^{k(t_2 - t_1)}$, de modo que $k = \\dfrac{\\ln(A/B)}{t_2 - t_1}$', [
        ['$\\dfrac{A}{B} = e^{k(t_2 / t_1)}$, dividiendo los tiempos', 'Casi: al dividir dos exponenciales $e^{-kt_1} / e^{-kt_2}$, los exponentes se restan ($t_2 - t_1$), no se dividen.'],
        ['$A - B = e^{-k(t_2 - t_1)}$, restando las cantidades medidas', 'Casi: para cancelar la constante desconocida $N_0$ debes dividir $N(t_1)/N(t_2)$, no restar.'],
        ['No se puede hallar $k$ sin conocer primero la masa en $t = 0$', 'Casi: por la propiedad exponencial, cualquier instante $t_1$ puede actuar como nuevo instante inicial.']],
      'Al dividir $N(t_1)/N(t_2) = (N_0 e^{-kt_1})/(N_0 e^{-kt_2}) = e^{k(t_2 - t_1)}$ se cancela $N_0$.'),

    N('de-n-hallar-N0-dos-datos', 'decaimiento', 3, { t1: [2, 4, 1], N1: [60, 90, 10], N2: [20, 40, 10] },
      function (v) { return 'Una sustancia decae exponencialmente según $N(t) = N_0 e^{-kt}$. En $t = ' + v.t1 + '$ h quedan $' + v.N1 + '$ g y en $t = ' + (2 * v.t1) + '$ h quedan $' + v.N2 + '$ g. ¿Cuántos gramos había inicialmente en $t = 0$?'; },
      function (v) { return (v.N1 * v.N1) / v.N2; },
      'En intervalos iguales de duración $t_1$ la masa se multiplica por el mismo factor: $N_1/N_0 = N_2/N_1 \\Rightarrow N_0 = N_1^2/N_2$.',
      { unit: 'g',
        mistakes: { linearBack: function (v) { return 2 * v.N1 - v.N2; }, sumDiff: function (v) { return v.N1 + v.N2; } },
        feedback: [
          { when: 'linearBack', say: 'Casi: extrapolaste restando una diferencia constante, pero la razón $N_1/N_0 = N_2/N_1$ es geométrica.' },
          { when: 'sumDiff', say: 'Casi: iguala los cocientes $N(t_1)/N(0) = N(2t_1)/N(t_1)$ para despejar $N_0 = N_1^2/N_2$.' }
        ] }),

    N('de-n-tiempo-perdida-pct', 'decaimiento', 3, { T: [5, 15, 5], lost: [65, 85, 5] },
      function (v) { return 'Un isótopo tiene vida media de $' + v.T + '$ años. ¿Cuántos años tardará en <strong>desintegrarse</strong> el $' + v.lost + '\\,\\%$ de la muestra inicial (es decir, hasta que solo quede el $' + (100 - v.lost) + '\\,\\%$)?'; },
      function (v) { return v.T * Math.log(100 / (100 - v.lost)) / Math.log(2); },
      'Si se desintegra el $p\\,\\%$, la fracción que queda viva es $(100 - p)/100 = e^{-kt}$.',
      { unit: 'años',
        mistakes: { usedLostDirectly: function (v) { return v.T * Math.log(100 / v.lost) / Math.log(2); }, linearRule: function (v) { return v.T * (v.lost / 50); } },
        feedback: [
          { when: 'usedLostDirectly', say: 'Casi: en $N(t)/N_0 = e^{-kt}$ se pone el porcentaje que queda ($100 - p$), no el que ya se desintegró.' },
          { when: 'linearRule', say: 'Casi: el decaimiento no es lineal; debes despejar $t$ con logaritmos usando la fracción restante.' }
        ] }),

    /* ======================= 6. Ley de enfriamiento de Newton (16) ======================= */
    C('en-que-decae', 'enfriamiento', 1,
      'En la ley de enfriamiento de Newton, $T(t) = T_a + (T_0 - T_a)e^{-kt}$, ¿qué cantidad es la que decae exponencialmente hacia cero conforme pasa el tiempo?',
      'La diferencia de temperatura $T(t) - T_a$ entre el objeto y el ambiente', [
        ['La temperatura del objeto $T(t)$ directamente hacia $0\\ ^\\circ\\text{C}$', 'Casi: el objeto no tiende a $0\\ ^\\circ\\text{C}$, sino a la temperatura del cuarto $T_a$; lo que tiende a cero es la resta $T(t) - T_a$.'],
        ['La temperatura del cuarto $T_a$', 'Casi: en el modelo de Newton la temperatura ambiente $T_a$ se considera constante.'],
        ['La constante de transferencia $k$', 'Casi: $k$ es una constante fija que depende del recipiente y del medio, no del tiempo.']],
      'Al pasar $T_a$ restando queda $T(t) - T_a = (T_0 - T_a)e^{-kt}$, así que es el exceso sobre el ambiente lo que decae exponencialmente.'),

    C('en-calentamiento-signo', 'enfriamiento', 1,
      'Sacas un refresco a $4\\ ^\\circ\\text{C}$ a una habitación que está a $26\\ ^\\circ\\text{C}$. En la ecuación $\\dfrac{dT}{dt} = -k(T - 26)$ con $k > 0$, ¿qué signo tiene la derivada $\\dfrac{dT}{dt}$ mientras el refresco se calienta?',
      'Positivo, porque $T - 26 < 0$ y al multiplicar por $-k < 0$ resulta $dT/dt > 0$', [
        ['Negativo, por el signo menos que aparece delante de $k$ en la fórmula', 'Casi: aunque hay un $-k$, el factor $(T - 26)$ también es negativo ($4 - 26 = -22$), y menos por menos da más.'],
        ['Cero, porque la ley de Newton solo sirve para objetos calientes que se enfrían', 'Casi: la misma ecuación modela tanto el enfriamiento ($T > T_a$) como el calentamiento ($T < T_a$).'],
        ['Hay que cambiar la ecuación a $+k(T - 26)$ cuando el objeto está más frío que el cuarto', 'Casi: si pusieras $+k(T - 26)$ con $T < 26$, daría $dT/dt < 0$ y el refresco se enfriaría aún más en un cuarto caliente.']],
      'Cuando $T < T_a$, la diferencia $T - T_a$ es negativa y $-k(T - T_a) > 0$, por lo que la temperatura sube hacia $T_a$.'),

    N('en-n-coeficiente-inicial', 'enfriamiento', 1, { Ta: [18, 25, 1], T0: [75, 95, 5] },
      function (v) { return 'Un té sale a $T(0) = ' + v.T0 + '\\ ^\\circ\\text{C}$ en una cocina a $T_a = ' + v.Ta + '\\ ^\\circ\\text{C}$. Al escribir la solución de la ley de Newton como $T(t) = ' + v.Ta + ' + C\\,e^{-kt}$, ¿cuánto vale la constante $C$?'; },
      function (v) { return v.T0 - v.Ta; },
      'En $t = 0$: $T(0) = T_a + C = T_0 \\Rightarrow C = T_0 - T_a$.',
      { unit: '°C',
        mistakes: { justT0: function (v) { return v.T0; }, sumTemps: function (v) { return v.T0 + v.Ta; } },
        feedback: [
          { when: 'justT0', say: 'Casi: olvidaste restar la temperatura ambiente $T_a$ al despejar $C = T_0 - T_a$.' },
          { when: 'sumTemps', say: 'Casi: de $T_a + C = T_0$ el término $T_a$ pasa restando, no sumando.' }
        ] }),

    N('en-n-rapidez-instantanea', 'enfriamiento', 1, { k: [1, 4, 1], Ta: [20, 24, 2], T1: [50, 80, 10] },
      function (v) { return 'Un objeto se enfría según $\\dfrac{dT}{dt} = -0.' + v.k + '(T - ' + v.Ta + ')$ (en °C/min). ¿Con qué razón de cambio $\\dfrac{dT}{dt}$ varía su temperatura en el instante en que $T = ' + v.T1 + '\\ ^\\circ\\text{C}$?'; },
      function (v) { return -0.1 * v.k * (v.T1 - v.Ta); },
      'Sustituyendo directamente $T = T_1$ en la ecuación diferencial resulta $dT/dt = -k(T_1 - T_a)$.',
      { unit: '°C/min',
        mistakes: { posRate: function (v) { return 0.1 * v.k * (v.T1 - v.Ta); }, forgotTa: function (v) { return -0.1 * v.k * v.T1; } },
        feedback: [
          { when: 'posRate', say: 'Casi: como el objeto se está enfriando ($T > T_a$), la derivada $dT/dt$ es negativa.' },
          { when: 'forgotTa', say: 'Casi: el ritmo es proporcional a la resta $T - T_a$, no a $T$.' }
        ] }),

    C('en-no-cruza-ambiente', 'enfriamiento', 2,
      'Según el modelo $\\dfrac{dT}{dt} = -k(T - T_a)$, ¿puede una taza de café inicialmente a $85\\ ^\\circ\\text{C}$ en un cuarto a $20\\ ^\\circ\\text{C}$ enfriarse hasta $18\\ ^\\circ\\text{C}$?',
      'No: como $(85 - 20)e^{-kt} > 0$ para todo $t$, la temperatura se acerca a $20\\ ^\\circ\\text{C}$ por arriba y nunca la cruza', [
        ['Sí, si se deja suficiente tiempo porque la exponencial acaba siendo negativa', 'Casi: la función exponencial $e^{-kt}$ es estrictamente positiva para cualquier tiempo real $t$.'],
        ['Sí, porque $T(t) = T_a$ es solo una isoclina que las soluciones cruzan con pendiente cero', 'Casi: $T(t) = T_a$ es una solución constante de equilibrio; por unicidad ninguna otra solución la cruza.'],
        ['Solo si la constante $k$ es mayor que $1$', 'Casi: una $k$ grande hace que se acerque más rápido a $20\\ ^\\circ\\text{C}$, pero tampoco permite bajar de $20\\ ^\\circ\\text{C}$.']],
      'La solución $T(t) = 20 + 65e^{-kt}$ siempre es mayor que $20\\ ^\\circ\\text{C}$ porque $65e^{-kt} > 0$.'),

    C('en-comparacion-ritmos', 'enfriamiento', 2,
      'Un café a $90\\ ^\\circ\\text{C}$ se deja en un cuarto a $20\\ ^\\circ\\text{C}$. ¿Qué tarda más tiempo: bajar los primeros $20\\ ^\\circ\\text{C}$ (de $90\\ ^\\circ\\text{C}$ a $70\\ ^\\circ\\text{C}$) o bajar los siguientes $20\\ ^\\circ\\text{C}$ (de $70\\ ^\\circ\\text{C}$ a $50\\ ^\\circ\\text{C}$)?',
      'Tarda más de $70\\ ^\\circ\\text{C}$ a $50\\ ^\\circ\\text{C}$, porque al estar más cerca de $20\\ ^\\circ\\text{C}$ la diferencia $T - 20$ es menor y se enfría más lento', [
        ['Tardan exactamente lo mismo, porque en ambos casos baja $20\\ ^\\circ\\text{C}$', 'Casi: el ritmo de enfriamiento no es constante; es proporcional a $T - 20$, que va disminuyendo.'],
        ['Tarda más de $90\\ ^\\circ\\text{C}$ a $70\\ ^\\circ\\text{C}$, porque al principio está muy caliente', 'Casi: al estar más caliente, la diferencia $T - 20$ es máxima y por eso al principio pierde calor con mayor rapidez.'],
        ['Depende del valor numérico de $k$: con $k$ chica tarda más el primero y con $k$ grande el segundo', 'Casi: para cualquier $k > 0$, el segundo tramo siempre tarda más porque $\\ln(50/30) > \\ln(70/50)$.']],
      'Conforme $T$ se acerca a $T_a = 20\\ ^\\circ\\text{C}$, la pendiente $|dT/dt| = k(T - 20)$ disminuye y cada grado adicional cuesta más tiempo.'),

    E('en-e-solucion-t', 'enfriamiento', 2, { Ta: [18, 24, 2], T0: [70, 90, 10], k: [1, 3, 1] },
      function (v) { return 'Un objeto con temperatura inicial $T(0) = ' + v.T0 + '\\ ^\\circ\\text{C}$ se coloca en un ambiente a $' + v.Ta + '\\ ^\\circ\\text{C}$ y sigue $\\dfrac{dT}{dt} = -0.' + v.k + '(T - ' + v.Ta + ')$. Escribe la función $T(t)$.'; },
      function (v) { return v.Ta + ' + ' + (v.T0 - v.Ta) + '*e^(-0.' + v.k + '*t)'; },
      'Separando $\\frac{dT}{T - T_a} = -k\\,dt$ e imponiendo $T(0) = T_0$ resulta $T(t) = T_a + (T_0 - T_a)e^{-kt}$.',
      { exprVars: ['t'], domain: [0, 5],
        mistakes: { usedT0Coef: function (v) { return v.Ta + ' + ' + v.T0 + '*e^(-0.' + v.k + '*t)'; }, noTa: function (v) { return (v.T0 - v.Ta) + '*e^(-0.' + v.k + '*t)'; } },
        feedback: [
          { when: 'usedT0Coef', say: 'Casi: el coeficiente de la exponencial es la diferencia inicial $T_0 - T_a$, no $T_0$.' },
          { when: 'noTa', say: 'Casi: olvidaste sumar la temperatura ambiente $T_a$ al despejar $T(t)$.' }
        ] }),

    N('en-n-hallar-k', 'enfriamiento', 2, { Ta: [20, 25, 5], T0: [85, 95, 5], T1: [45, 55, 5], t1: [2, 4, 1] },
      function (v) { return 'Un líquido sale a $' + v.T0 + '\\ ^\\circ\\text{C}$ en un cuarto a $' + v.Ta + '\\ ^\\circ\\text{C}$ y a los $' + v.t1 + '$ minutos está a $' + v.T1 + '\\ ^\\circ\\text{C}$. Calcula la constante $k$ (en $1/\\text{min}$) de la ley de enfriamiento de Newton.'; },
      function (v) { return Math.log((v.T0 - v.Ta) / (v.T1 - v.Ta)) / v.t1; },
      'De $T_1 - T_a = (T_0 - T_a)e^{-kt_1}$ se despeja $k = \\frac{1}{t_1}\\ln\\left(\\frac{T_0 - T_a}{T_1 - T_a}\\right)$.',
      { unit: '1/min',
        mistakes: { noTa: function (v) { return Math.log(v.T0 / v.T1) / v.t1; }, noDivT1: function (v) { return Math.log((v.T0 - v.Ta) / (v.T1 - v.Ta)); } },
        feedback: [
          { when: 'noTa', say: 'Casi: olvidaste restar la temperatura ambiente $T_a$ tanto a $T_0$ como a $T_1$.' },
          { when: 'noDivT1', say: 'Casi: ese es el valor de $k\\,t_1$; falta dividir entre el tiempo $t_1$.' }
        ] }),

    N('en-n-calentamiento-eval', 'enfriamiento', 2, { Ta: [24, 30, 2], T0: [2, 8, 2], k: [1, 3, 1], t1: [4, 8, 2] },
      function (v) { return 'Una lata fría sale del refrigerador a $' + v.T0 + '\\ ^\\circ\\text{C}$ en una terraza a $' + v.Ta + '\\ ^\\circ\\text{C}$. Si su temperatura sigue $T\' = -0.' + v.k + '(T - ' + v.Ta + ')$ con $t$ en minutos, ¿qué temperatura tiene a los $' + v.t1 + '$ minutos?'; },
      function (v) { return v.Ta + (v.T0 - v.Ta) * Math.exp(-0.1 * v.k * v.t1); },
      'La misma fórmula $T(t) = T_a + (T_0 - T_a)e^{-kt}$ se aplica cuando $T_0 < T_a$ (con $T_0 - T_a < 0$).',
      { unit: '°C',
        mistakes: { wrongSignDiff: function (v) { return v.Ta + (v.Ta - v.T0) * Math.exp(-0.1 * v.k * v.t1); }, justDecay: function (v) { return v.T0 * Math.exp(0.1 * v.k * v.t1); } },
        feedback: [
          { when: 'wrongSignDiff', say: 'Casi: como la lata empieza más fría que el ambiente, el término $(T_0 - T_a)e^{-kt}$ se resta de $T_a$, no se suma.' },
          { when: 'justDecay', say: 'Casi: el calentamiento se rige por $T_a + (T_0 - T_a)e^{-kt}$, acercándose a $T_a$.' }
        ] }),

    N('en-n-tiempo-llegar', 'enfriamiento', 2, { Ta: [18, 22, 2], T0: [80, 95, 5], T1: [60, 68, 4], m: [4, 6, 1], Tf: [34, 42, 4] },
      function (v) { return 'Un caldo sale a $' + v.T0 + '\\ ^\\circ\\text{C}$ en un comedor a $' + v.Ta + '\\ ^\\circ\\text{C}$. Si en $' + v.m + '$ minutos baja a $' + v.T1 + '\\ ^\\circ\\text{C}$, ¿cuántos minutos en total (desde $t = 0$) tarda en llegar a $' + v.Tf + '\\ ^\\circ\\text{C}$?'; },
      function (v) {
        var k = Math.log((v.T0 - v.Ta) / (v.T1 - v.Ta)) / v.m;
        return Math.log((v.T0 - v.Ta) / (v.Tf - v.Ta)) / k;
      },
      'Con $k = \\frac{1}{m}\\ln\\frac{T_0 - T_a}{T_1 - T_a}$, el tiempo buscado es $t = \\frac{1}{k}\\ln\\frac{T_0 - T_a}{T_f - T_a}$.',
      { unit: 'min',
        mistakes: {
          noAmbient: function (v) { var k = Math.log(v.T0 / v.T1) / v.m; return Math.log(v.T0 / v.Tf) / k; },
          linearTime: function (v) { return v.m * (v.T0 - v.Tf) / (v.T0 - v.T1); }
        },
        feedback: [
          { when: 'noAmbient', say: 'Casi: olvidaste restar la temperatura del comedor $T_a$ en las diferencias de temperatura.' },
          { when: 'linearTime', say: 'Casi: el enfriamiento no avanza a razón constante de grados por minuto.' }
        ] }),

    N('en-n-temp-doble-tiempo', 'enfriamiento', 2, { Ta: [20, 24, 2], T0: [80, 96, 8], T1: [56, 68, 6], m: [3, 6, 1] },
      function (v) { return 'Una pieza metálica a $' + v.T0 + '\\ ^\\circ\\text{C}$ se deja en un taller a $' + v.Ta + '\\ ^\\circ\\text{C}$. A los $' + v.m + '$ minutos su temperatura es de $' + v.T1 + '\\ ^\\circ\\text{C}$. ¿Qué temperatura tendrá a los $' + (2 * v.m) + '$ minutos?'; },
      function (v) { return v.Ta + Math.pow(v.T1 - v.Ta, 2) / (v.T0 - v.Ta); },
      'En cada lapso de $m$ minutos la diferencia $T - T_a$ se multiplica por $q = \\frac{T_1 - T_a}{T_0 - T_a}$, así que en $2m$ vale $T_a + (T_0 - T_a)q^2$.',
      { unit: '°C',
        mistakes: { linearDrop: function (v) { return v.T0 - 2 * (v.T0 - v.T1); }, noTaRatio: function (v) { return Math.pow(v.T1, 2) / v.T0; } },
        feedback: [
          { when: 'linearDrop', say: 'Casi: en el segundo intervalo de $m$ minutos no pierde la misma cantidad de grados, sino la misma fracción de $T - T_a$.' },
          { when: 'noTaRatio', say: 'Casi: la proporción geométrica se aplica al exceso $T - T_a$, y al final se vuelve a sumar $T_a$.' }
        ] }),

    N('en-n-hallar-Ta-desde-edo', 'enfriamiento', 2, { k: [2, 5, 1], Ta: [18, 26, 2] },
      function (v) { return 'Al desarrollar la ecuación de enfriamiento de un objeto se obtiene $\\dfrac{dT}{dt} = -0.' + v.k + 'T + ' + Number((0.1 * v.k * v.Ta).toFixed(2)) + '$. ¿Cuál es la temperatura ambiente $T_a$ del cuarto?'; },
      function (v) { return v.Ta; },
      'Factorizando $-k$ en el lado derecho: $-kT + kT_a = -k(T - T_a)$, así que $T_a$ se obtiene dividiendo el término constante entre $k$.',
      { unit: '°C',
        mistakes: { tookB: function (v) { return 0.1 * v.k * v.Ta; }, multInstead: function (v) { return 0.1 * v.k * 0.1 * v.k * v.Ta; } },
        feedback: [
          { when: 'tookB', say: 'Casi: ese número es el producto $k\\,T_a$; falta dividirlo entre $k$ para obtener $T_a$.' },
          { when: 'multInstead', say: 'Casi: para despejar $T_a$ de $k\\,T_a$ debes dividir entre $k$, no multiplicar.' }
        ] }),

    C('en-dos-intervalos-iguales', 'enfriamiento', 3,
      'Un cuerpo se enfría en un cuarto a $20\\ ^\\circ\\text{C}$. En $t = 0$ su exceso de temperatura sobre el cuarto es $\\Delta T(0) = 60\\ ^\\circ\\text{C}$, y en $t = 10\\text{ min}$ el exceso es $\\Delta T(10) = 30\\ ^\\circ\\text{C}$. ¿Cuánto valdrá la temperatura $T(30)$ a los $30\\text{ min}$?',
      '$27.5\\ ^\\circ\\text{C}$, porque cada $10\\text{ min}$ el exceso $\\Delta T$ se reduce a la mitad ($60 \\to 30 \\to 15 \\to 7.5$) y se suma a $20\\ ^\\circ\\text{C}$', [
        ['$7.5\\ ^\\circ\\text{C}$, porque después de tres vidas medias del exceso queda $60 / 8 = 7.5\\ ^\\circ\\text{C}$', 'Casi: $7.5\\ ^\\circ\\text{C}$ es el exceso $T(30) - 20$; falta sumar la temperatura del cuarto ($20 + 7.5 = 27.5\\ ^\\circ\\text{C}$).'],
        ['$10\\ ^\\circ\\text{C}$, dividiendo la temperatura inicial $80\\ ^\\circ\\text{C}$ entre $8$', 'Casi: lo que se divide a la mitad cada $10\\text{ min}$ es la diferencia $T - 20$, no la temperatura $T$.'],
        ['$-10\\ ^\\circ\\text{C}$, restando $30\\ ^\\circ\\text{C}$ cada $10\\text{ min}$', 'Casi: el enfriamiento es exponencial respecto a $T - 20$, no lineal.']],
      'A los $30\\text{ min}$ han pasado tres periodos de $10\\text{ min}$, así que $\\Delta T(30) = 60/2^3 = 7.5\\ ^\\circ\\text{C}$ y $T(30) = 20 + 7.5 = 27.5\\ ^\\circ\\text{C}$.'),

    N('en-n-hallar-T0-pasado', 'enfriamiento', 3, { Ta: [18, 22, 2], T1: [60, 72, 4], T2: [42, 50, 4], dt: [5, 10, 5] },
      function (v) { return 'Un horno apagado se enfría en un taller a $' + v.Ta + '\\ ^\\circ\\text{C}$. A los $' + v.dt + '$ min de haberse apagado estaba a $' + v.T1 + '\\ ^\\circ\\text{C}$ y a los $' + (2 * v.dt) + '$ min estaba a $' + v.T2 + '\\ ^\\circ\\text{C}$. ¿A qué temperatura $T(0)$ estaba cuando se apagó?'; },
      function (v) { return v.Ta + Math.pow(v.T1 - v.Ta, 2) / (v.T2 - v.Ta); },
      'En intervalos iguales $\\Delta t$, los excesos cumplen $\\frac{T_0 - T_a}{T_1 - T_a} = \\frac{T_1 - T_a}{T_2 - T_a} \\Rightarrow T_0 = T_a + \\frac{(T_1 - T_a)^2}{T_2 - T_a}$.',
      { unit: '°C',
        mistakes: { linearBack: function (v) { return 2 * v.T1 - v.T2; }, forgotTa: function (v) { return Math.pow(v.T1, 2) / v.T2; } },
        feedback: [
          { when: 'linearBack', say: 'Casi: al principio estaba más caliente y se enfriaba más rápido, así que bajó más grados en los primeros minutos que en los segundos.' },
          { when: 'forgotTa', say: 'Casi: la proporción geométrica se cumple para las diferencias $T - T_a$, no para $T$ directamente.' }
        ] }),

    N('en-n-hallar-Ta-tres-tiempos', 'enfriamiento', 3, { Ta: [18, 26, 2], d0: [36, 72, 9] },
      function (v) {
        var T0 = v.Ta + v.d0, T5 = v.Ta + (2 / 3) * v.d0, T10 = v.Ta + (4 / 9) * v.d0;
        return 'Un objeto se enfría según la ley de Newton en un cuarto a temperatura constante $T_a$ desconocida. Si $T(0) = ' + T0 + '\\ ^\\circ\\text{C}$, $T(5) = ' + T5 + '\\ ^\\circ\\text{C}$ y $T(10) = ' + T10 + '\\ ^\\circ\\text{C}$, ¿cuánto vale $T_a$?';
      },
      function (v) { return v.Ta; },
      'Como los lapsos son iguales ($5\\text{ min}$), $\\frac{T(0) - T_a}{T(5) - T_a} = \\frac{T(5) - T_a}{T(10) - T_a}$, de donde se despeja $T_a$.',
      { unit: '°C',
        mistakes: {
          tookT10: function (v) { return v.Ta + (4 / 9) * v.d0; },
          subLastDiff: function (v) { return v.Ta + (2 / 9) * v.d0; }
        },
        feedback: [
          { when: 'tookT10', say: 'Casi: esa es la temperatura a los $10\\text{ min}$, pero el objeto sigue enfriándose hacia $T_a$.' },
          { when: 'subLastDiff', say: 'Casi: restaste la caída del segundo tramo; debes igualar la razón de excesos $(T_0 - T_a)/(T_5 - T_a) = (T_5 - T_a)/(T_{10} - T_a)$.' }
        ] }),

    N('en-n-tiempo-desde-t1-t2', 'enfriamiento', 3, { Ta: [20, 22, 2], T1: [70, 82, 4], T2: [50, 58, 4], t1: [4, 6, 2], t2: [10, 14, 2], Tf: [30, 36, 2] },
      function (v) { return 'Un cuerpo en un cuarto a $' + v.Ta + '\\ ^\\circ\\text{C}$ está a $' + v.T1 + '\\ ^\\circ\\text{C}$ en $t = ' + v.t1 + '$ min y a $' + v.T2 + '\\ ^\\circ\\text{C}$ en $t = ' + v.t2 + '$ min. ¿En qué instante $t$ (medido desde $t = 0$) alcanzará los $' + v.Tf + '\\ ^\\circ\\text{C}$?'; },
      function (v) {
        var k = Math.log((v.T1 - v.Ta) / (v.T2 - v.Ta)) / (v.t2 - v.t1);
        return v.t1 + Math.log((v.T1 - v.Ta) / (v.Tf - v.Ta)) / k;
      },
      'Entre $t_1$ y $t_2$ sale $k = \\frac{1}{t_2 - t_1}\\ln\\frac{T_1 - T_a}{T_2 - T_a}$, y desde $t_1$ hasta $t$ transcurre $\\Delta t = \\frac{1}{k}\\ln\\frac{T_1 - T_a}{T_f - T_a}$.',
      { unit: 'min',
        mistakes: {
          forgotAddT1: function (v) {
            var k = Math.log((v.T1 - v.Ta) / (v.T2 - v.Ta)) / (v.t2 - v.t1);
            return Math.log((v.T1 - v.Ta) / (v.Tf - v.Ta)) / k;
          },
          usedT2NotDiff: function (v) {
            var k = Math.log((v.T1 - v.Ta) / (v.T2 - v.Ta)) / v.t2;
            return v.t1 + Math.log((v.T1 - v.Ta) / (v.Tf - v.Ta)) / k;
          }
        },
        feedback: [
          { when: 'forgotAddT1', say: 'Casi: ese es el tiempo transcurrido desde $t_1$; falta sumarle $t_1$ para obtener el instante medido desde $t = 0$.' },
          { when: 'usedT2NotDiff', say: 'Casi: entre las dos mediciones transcurrieron $t_2 - t_1$ minutos, no $t_2$ minutos.' }
        ] })
  ];

  K.register(SUBTEMAS, Q);
})();
