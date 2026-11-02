/* =====================================================================
   Banco · Cálculo 3 · S15 · Aplicaciones: masa–resorte–amortiguador y
   circuito RLC (libre, amortiguado, forzado y resonancia), con una guía
   corta de la transformada de Laplace y los sistemas de EDO.
   100 preguntas propias (source: 'propia').
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c3', '15');

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

  var SUBTEMAS = {
    'c3.S15.modelo': 'Planteamiento y analogía mecánica–eléctrica',
    'c3.S15.libre': 'Movimiento armónico simple sin amortiguamiento',
    'c3.S15.amortiguado': 'Movimiento libre amortiguado y regímenes',
    'c3.S15.forzado': 'Oscilaciones forzadas y estado estacionario',
    'c3.S15.resonancia': 'Resonancia y curvas de amplitud',
    'c3.S15.rlc': 'Circuitos RLC en serie',
    'c3.S15.guia': 'Guía: transformada de Laplace y sistemas de EDO'
  };

  var Q = [
    /* =====================================================================
       1. Planteamiento y analogía mecánica–eléctrica (13 preguntas: 5 D1, 6 D2, 2 D3)
       ===================================================================== */
    C('mo-c-ec-newton', 'modelo', 1,
      'Al aplicar la segunda ley de Newton $\\sum F = m a$ a una masa con resorte, amortiguador viscoso y fuerza externa, ¿cuál es la EDO resultante con $x(t)$ desde el equilibrio?',
      '$m\\,x\'\' + c\\,x\' + k\\,x = F(t)$',
      [['$m\\,x\'\' - c\\,x\' - k\\,x = F(t)$', 'Casi: $-kx$ y $-cx\'$ se oponen al movimiento y pasan sumando al lado de la aceleración.'],
       ['$m\\,x\' + c\\,x + k = F(t)$', 'Casi: la aceleración es $x\'\'$ y la velocidad es $x\'$; no reduzcas el orden de las derivadas.'],
       ['$x\'\' + c\\,x\' + k\\,x = m\\,F(t)$', 'Casi: la masa multiplica a $x\'\'$, no a la fuerza exterior $F(t)$.']],
      'Newton da $m x\'\' = -k x - c x\' + F(t)$, que al reordenar produce $m x\'\' + c x\' + k x = F(t)$.'),

    C('mo-c-analogo-kirchhoff', 'modelo', 1,
      'En un circuito RLC en serie con fuente $E(t)$, la ley de voltajes de Kirchhoff en términos de la carga $q(t)$ del capacitor produce…',
      '$L\\,q\'\' + R\\,q\' + \\frac{1}{C}\\,q = E(t)$',
      [['$L\\,q\'\' + R\\,q\' + C\\,q = E(t)$', 'Casi: el voltaje en el capacitor es $q/C$, por lo que el coeficiente de $q$ es $1/C$, no $C$.'],
       ['$L\\,q\' + R\\,q + \\frac{1}{C}\\int q\\,dt = E(t)$', 'Casi: como $i = q\'$, la caída en el inductor $L\\,di/dt$ es $L q\'\'$.'],
       ['$C\\,q\'\' + R\\,q\' + L\\,q = E(t)$', 'Casi: la inductancia $L$ acompaña a $q\'\'$ y la capacitancia entra como $1/C$.']],
      'Las caídas son $L q\'\'$, $R q\'$ y $q/C$, cuya suma equilibra la fuerza electromotriz $E(t)$.'),

    C('mo-c-tabla-correspondencia', 'modelo', 1,
      'En la analogía directa entre el oscilador mecánico y el circuito RLC serie, ¿qué parámetro del circuito corresponde a la rigidez $k$ del resorte?',
      'El inverso de la capacitancia, $1/C$',
      [['La capacitancia $C$ directamente', 'Casi: en el resorte $k$ multiplica a $x$, mientras que en el circuito el término es $(1/C)q$, luego $k \\leftrightarrow 1/C$.'],
       ['La inductancia $L$', 'Casi: la inductancia representa la inercia, análoga a la masa mecánica $m$.'],
       ['La resistencia eléctrica $R$', 'Casi: la resistencia eléctrica disipa calor, análoga al amortiguador viscoso $c$.']],
      'Comparando $m x\'\' + c x\' + k x$ con $L q\'\' + R q\' + (1/C) q$, se concluye que $k \\leftrightarrow 1/C$.'),

    C('mo-c-inercia-bobina', 'modelo', 1,
      '¿Por qué la inductancia $L$ de un circuito RLC cumple el mismo papel físico y matemático que la masa $m$ en el sistema mecánico?',
      'Porque la bobina se opone a cambios bruscos de corriente ($v_L = L\\,di/dt$), igual que la masa se opone a cambios de velocidad',
      [['Porque la bobina disipa calor proporcionalmente al cuadrado de la corriente', 'Casi: la disipación térmica ocurre en el resistor $R$; la bobina almacena energía magnética.'],
       ['Porque ambas magnitudes dependen de la gravedad del lugar', 'Casi: ni la inductancia ni la masa inercial dependen de la aceleración gravitatoria.'],
       ['Porque el valor numérico de $L$ siempre debe coincidir con el de la masa $m$', 'Casi: la analogía es matemática y estructural en las ecuaciones, no exige igualdad de valores.']],
      'La inductancia $L$ mide la inercia eléctrica: se opone al cambio de corriente $q\'$ tal como la masa resiste al cambio de rapidez $x\'$.'),

    C('mo-c-disipacion-energia', 'modelo', 2,
      '¿Qué término en la ecuación del oscilador libre $m\\,x\'\' + c\\,x\' + k\\,x = 0$ es el causante de la pérdida irreversible de energía mecánica?',
      'El término viscoso $c\\,x\'$, pues ejerce una fuerza de fricción que disipa energía en forma de calor',
      [['El término elástico $k\\,x$, porque la fuerza restauradora destruye la energía cinética', 'Casi: el resorte almacena energía potencial conservativa sin disipación térmica.'],
       ['El término inercial $m\\,x\'\'$, porque frena a la masa en los puntos de retorno', 'Casi: la masa conserva energía cinética $\\frac{1}{2}m(x\')^2$; no es un elemento disipativo.'],
       ['Ninguno, pues en cualquier oscilación libre la energía mecánica se conserva constante', 'Casi: si $c > 0$ la derivada de la energía es $dE/dt = -c(x\')^2 \\le 0$, por lo que la energía disminuye.']],
      'La potencia disipada por la fricción viscosa es $F_{\\text{amort}} v = -c(x\')^2 \\le 0$, transfiriendo energía mecánica al medio.'),

    C('mo-c-dimensiones-c', 'modelo', 2,
      'En el Sistema Internacional de Unidades, ¿en qué unidades se expresa el coeficiente de amortiguamiento viscoso $c$ en $m\\,x\'\' + c\\,x\' + k\\,x = 0$?',
      '$\\text{kg}/\\text{s}$, equivalente a $\\text{N}\\cdot\\text{s}/\\text{m}$',
      [['$\\text{N}/\\text{m}$, iguales a las unidades de la constante del resorte', 'Casi: la fuerza viscosa es proporcional a la velocidad: $F = c v$, por lo que $[c] = \\text{N}/(\\text{m}/\\text{s}) = \\text{N}\\cdot\\text{s}/\\text{m}$.'],
       ['$\\text{kg}\\cdot\\text{m}/\\text{s}$, unidades de momento lineal', 'Casi: al despejar $c = F/v$ queda $\\text{N}\\cdot\\text{s}/\\text{m} = \\text{kg}/\\text{s}$, sin metros en el numerador.'],
       ['$\\text{J}/\\text{s}$ o watts, unidades de potencia disipada', 'Casi: el watt mide la potencia $F\\cdot v$, no la constante de proporcionalidad $c$.']],
      'De $F = c\\,x\'$, tenemos $[c] = [F]/[v] = \\text{N}/(\\text{m}/\\text{s}) = \\text{kg}/\\text{s}$.'),

    N('mo-n-hooke-elongacion', 'modelo', 1, { m: [1, 5, 1], s: [2, 10, 2] },
      function (v) { return 'Una masa de $' + v.m + '$ kg alarga verticalmente un resorte $' + v.s + '$ cm hasta el equilibrio. Con $g = 9.81\\ \\text{m}/\\text{s}^2$, calcula la rigidez $k$ en N/m.'; },
      function (v) { return (v.m * 9.81) / (v.s / 100); },
      'En el equilibrio estático $m g = k s_0$, de donde $k = m g / s_0$ convirtiendo los centímetros a metros.',
      { unit: 'N/m',
        mistakes: {
          cmDirect: function (v) { return (v.m * 9.81) / v.s; },
          multCm: function (v) { return (v.m * 9.81) * (v.s / 100); }
        },
        feedback: [
          { when: 'cmDirect', say: 'Casi: no convertiste la elongación de centímetros a metros ($1\\ \\text{m} = 100\\ \\text{cm}$).' },
          { when: 'multCm', say: 'Casi: la ley de Hooke es $k = F/s_0$; dividiste al revés o multiplicaste por la elongación.' }
        ] }),

    N('mo-n-coef-c-fuerza', 'modelo', 2, { F: [6, 24, 2], v: [2, 5, 1] },
      function (v) { return 'Un amortiguador viscoso ejerce una resistencia de $' + v.F + '$ N cuando el pistón avanza con rapidez de $' + v.v + '$ m/s. ¿Cuánto vale su constante $c$ en kg/s?'; },
      function (v) { return v.F / v.v; },
      'La magnitud de la fuerza de amortiguamiento viscoso es $F = c v$, por lo que $c = F / v$.',
      { unit: 'kg/s',
        where: function (v) { return v.F % v.v !== 0 || v.F / v.v !== v.v; },
        mistakes: {
          mult: function (v) { return v.F * v.v; },
          inv: function (v) { return v.v / v.F; }
        },
        feedback: [
          { when: 'mult', say: 'Casi: multiplicaste fuerza por velocidad; la constante es el cociente $c = F/v$.' },
          { when: 'inv', say: 'Casi: invertiste el cociente; es fuerza entre velocidad, no velocidad entre fuerza.' }
        ] }),

    N('mo-n-energia-inicial', 'modelo', 2, { k: [40, 100, 20], x0: [10, 25, 5] },
      function (v) { return 'Un resorte con constante $k = ' + v.k + '$ N/m se comprime $' + v.x0 + '$ cm desde el equilibrio y se suelta en reposo. ¿Cuánta energía elástica en joules se almacena al inicio?'; },
      function (v) { var x = v.x0 / 100; return 0.5 * v.k * x * x; },
      'La energía elástica inicial es $U = \\frac{1}{2}k x_0^2$, transformando $x_0$ a metros.',
      { unit: 'J',
        mistakes: {
          noHalf: function (v) { var x = v.x0 / 100; return v.k * x * x; },
          noConvert: function (v) { return 0.5 * v.k * v.x0 * v.x0; }
        },
        feedback: [
          { when: 'noHalf', say: 'Casi: la energía potencial elástica lleva un factor $1/2$: $U = \\frac{1}{2}kx^2$.' },
          { when: 'noConvert', say: 'Casi: olvidaste convertir la deformación de centímetros a metros antes de elevar al cuadrado.' }
        ] }),

    N('mo-n-potencia-amort', 'modelo', 2, { c: [4, 16, 2], vel: [1.5, 3.5, 0.5] },
      function (v) { return 'En cierto instante, la masa de un oscilador tiene rapidez $v = ' + v.vel + '$ m/s. Si $c = ' + v.c + '$ kg/s, ¿a qué tasa instantánea en watts se disipa calor ($P = c\\,v^2$)?'; },
      function (v) { return v.c * v.vel * v.vel; },
      'La potencia disipada por la amortiguación viscosa es $P = F_{\\text{fric}} v = (c v) v = c v^2$.',
      { unit: 'W',
        mistakes: {
          noSquare: function (v) { return v.c * v.vel; },
          half: function (v) { return 0.5 * v.c * v.vel * v.vel; }
        },
        feedback: [
          { when: 'noSquare', say: 'Casi: la potencia disipada es $P = F v = c v^2$; te faltó elevar la rapidez al cuadrado.' },
          { when: 'half', say: 'Casi: la potencia instantánea es directamente $c v^2$, sin el factor $1/2$.' }
        ] }),

    N('mo-n-resorte-serie', 'modelo', 2, { k1: [20, 60, 10], k2: [30, 90, 10] },
      function (v) { return 'Dos resortes de rigideces $k_1 = ' + v.k1 + '$ N/m y $k_2 = ' + v.k2 + '$ N/m se unen uno tras otro en serie sosteniendo una carga. Calcula la rigidez equivalente $k_{\\text{eq}}$ en N/m.'; },
      function (v) { return (v.k1 * v.k2) / (v.k1 + v.k2); },
      'Para resortes en serie las flexibilidades se suman: $1/k_{\\text{eq}} = 1/k_1 + 1/k_2$, por lo que $k_{\\text{eq}} = k_1 k_2 / (k_1 + k_2)$.',
      { unit: 'N/m',
        where: function (v) { return v.k1 !== v.k2; },
        mistakes: {
          paralelo: function (v) { return v.k1 + v.k2; },
          promedio: function (v) { return (v.k1 + v.k2) / 2; }
        },
        feedback: [
          { when: 'paralelo', say: 'Casi: esa es la regla para resortes en paralelo; en serie las compliancias se suman recíprocamente.' },
          { when: 'promedio', say: 'Casi: la rigidez equivalente en serie no es el promedio aritmético, sino el producto sobre la suma.' }
        ] }),

    N('mo-n-resorte-paralelo', 'modelo', 3, { k1: [15, 45, 5], k2: [20, 60, 5] },
      function (v) { return 'Una base móvil se sostiene mediante dos resortes montados en paralelo con constantes $k_1 = ' + v.k1 + '$ N/m y $k_2 = ' + v.k2 + '$ N/m. Determina la rigidez elástica total en N/m.'; },
      function (v) { return v.k1 + v.k2; },
      'Al estar en paralelo ambos resortes sufren la misma deformación, por lo que las fuerzas se suman: $k_{\\text{eq}} = k_1 + k_2$.',
      { unit: 'N/m',
        where: function (v) { return v.k1 !== v.k2; },
        mistakes: {
          serie: function (v) { return (v.k1 * v.k2) / (v.k1 + v.k2); },
          resta: function (v) { return Math.abs(v.k2 - v.k1); }
        },
        feedback: [
          { when: 'serie', say: 'Casi: aplicaste la fórmula de resortes en serie; en paralelo las constantes se suman directamente.' },
          { when: 'resta', say: 'Casi: los resortes tiran conjuntamente en la misma dirección, sus rigideces no se restan.' }
        ] }),

    N('mo-n-gravedad-efectiva', 'modelo', 3, { m: [2, 6, 1], k: [40, 120, 10], theta: [30, 60, 15] },
      function (v) { return 'Un bloque de $' + v.m + '$ kg descansa sin fricción sobre una rampa inclinada $' + v.theta + '^\\circ$, sujeto a un resorte con $k = ' + v.k + '$ N/m. Con $g = 9.81\\ \\text{m}/\\text{s}^2$, ¿cuántos centímetros se alarga en equilibrio?'; },
      function (v) { var rad = v.theta * Math.PI / 180; return (v.m * 9.81 * Math.sin(rad) / v.k) * 100; },
      'La componente del peso a lo largo de la rampa es $m g \\sin\\theta$. En equilibrio $k s_0 = m g \\sin\\theta$, convirtiendo el alargamiento a cm.',
      { unit: 'cm',
        mistakes: {
          cosComp: function (v) { var rad = v.theta * Math.PI / 180; return (v.m * 9.81 * Math.cos(rad) / v.k) * 100; },
          noIncline: function (v) { return (v.m * 9.81 / v.k) * 100; }
        },
        feedback: [
          { when: 'cosComp', say: 'Casi: la componente de la gravedad en la dirección de deslizamiento de la rampa usa el seno del ángulo, no el coseno.' },
          { when: 'noIncline', say: 'Casi: la rampa está inclinada; únicamente la componente paralela $m g\\sin\\theta$ estira el resorte.' }
        ] }),

    /* =====================================================================
       2. Movimiento armónico simple sin amortiguamiento (14 preguntas: 4 D1, 7 D2, 3 D3)
       ===================================================================== */
    C('li-c-frec-def', 'libre', 1,
      'Para un oscilador lineal libre sin amortiguamiento $m\\,x\'\' + k\\,x = 0$, la frecuencia angular natural $\\omega_0$ es…',
      '$\\omega_0 = \\sqrt{k/m}$',
      [['$\\omega_0 = \\sqrt{m/k}$', 'Casi: la rigidez $k$ va en el numerador: a mayor rigidez, el sistema oscila más rápido.'],
       ['$\\omega_0 = k/m$', 'Casi: la raíz cuadrada proviene del característico $m r^2 + k = 0 \\implies r = \\pm i\\sqrt{k/m}$.'],
       ['$\\omega_0 = 2\\pi\\sqrt{k/m}$', 'Casi: $\\omega_0$ es la frecuencia angular en rad/s; el factor $2\\pi$ relaciona el periodo $T = 2\\pi/\\omega_0$.']],
      'De $m r^2 + k = 0$ las raíces son puramente imaginarias $r = \\pm i\\sqrt{k/m}$, definiendo $\\omega_0 = \\sqrt{k/m}$.'),

    C('li-c-cambio-masa-periodo', 'libre', 1,
      'Si se cuadruplica la masa suspendida de un resorte ideal ($m \\to 4m$) manteniendo constante la rigidez $k$, ¿qué le ocurre al periodo de oscilación $T$?',
      'Se duplica ($T \\to 2T$)',
      [['Se cuadruplica ($T \\to 4T$)', 'Casi: el periodo depende de la raíz cuadrada de la masa: $T = 2\\pi\\sqrt{m/k}$.'],
       ['Se reduce a la mitad ($T \\to T/2$)', 'Casi: mayor masa implica mayor inercia y movimiento más lento, por lo que el periodo aumenta.'],
       ['Permanece constante', 'Casi: la masa inercial influye directamente en el periodo de vibración.']],
      'Como $T = 2\\pi\\sqrt{m/k}$, al sustituir $4m$ el periodo queda multiplicado por $\\sqrt{4} = 2$.'),

    C('li-c-amplitud-fase', 'libre', 2,
      'Al expresar la solución general $x(t) = c_1\\cos\\omega_0 t + c_2\\sin\\omega_0 t$ en la forma canónica $x(t) = A\\cos(\\omega_0 t - \\delta)$, ¿cómo se calcula la amplitud $A$?',
      '$A = \\sqrt{c_1^2 + c_2^2}$',
      [['$A = c_1 + c_2$', 'Casi: los términos en seno y coseno están desfasados $90^\\circ$; la amplitud es su composición pitagórica.'],
       ['$A = |c_1 - c_2|$', 'Casi: las constantes en cuadratura se suman mediante la raíz de la suma de sus cuadrados.'],
       ['$A = \\frac{1}{2}(c_1^2 + c_2^2)$', 'Casi: la amplitud total es la raíz cuadrada: $A = \\sqrt{c_1^2 + c_2^2}$.']],
      'Por la identidad $\\cos(\\alpha - \\delta) = \\cos\\alpha\\cos\\delta + \\sin\\alpha\\sin\\delta$, identificamos $c_1 = A\\cos\\delta$ y $c_2 = A\\sin\\delta$, dando $A = \\sqrt{c_1^2 + c_2^2}$.'),

    C('li-c-conservacion-energia', 'libre', 2,
      'En un oscilador armónico simple sin rozamiento, cuando la masa cruza exactamente por la posición de equilibrio $x = 0$, ¿qué sucede con sus energías?',
      'La energía potencial elástica es nula y la energía cinética alcanza su valor máximo',
      [['La energía cinética y la potencial alcanzan su máximo simultáneamente', 'Casi: la energía mecánica total es constante; cuando la potencial cae a cero, la cinética absorbe toda la energía.'],
       ['La energía cinética se anula porque la aceleración instantánea es cero', 'Casi: en el equilibrio la aceleración es cero pero la rapidez de la masa es máxima.'],
       ['La energía mecánica total se divide a la mitad de forma momentánea', 'Casi: la energía total se mantiene invariante en todo punto de la trayectoria.']],
      'En $x = 0$, $U = \\frac{1}{2}kx^2 = 0$, de forma que toda la energía mecánica está en energía cinética: $E = \\frac{1}{2}m v_{\\max}^2$.'),

    C('li-c-fase-signo', 'libre', 2,
      'Si una partícula parte del reposo ($x\'(0) = 0$) desde una elongación positiva inicial $x(0) = x_0 > 0$, ¿cuál es la solución del movimiento armónico simple?',
      '$x(t) = x_0\\cos\\omega_0 t$',
      [['$x(t) = x_0\\sin\\omega_0 t$', 'Casi: con la función seno $x(0) = 0$, lo que violaría la posición inicial dada.'],
       ['$x(t) = \\frac{x_0}{\\omega_0}\\sin\\omega_0 t$', 'Casi: esa expresión corresponde a partir del origen con velocidad inicial $x\'(0) = x_0$.'],
       ['$x(t) = x_0(\\cos\\omega_0 t + \\sin\\omega_0 t)$', 'Casi: el término con seno produciría una velocidad inicial no nula $x\'(0) = x_0\\omega_0$.']],
      'Con $x(0) = c_1 = x_0$ y $x\'(0) = c_2\\omega_0 = 0$, se tiene $c_2 = 0$, quedando $x(t) = x_0\\cos\\omega_0 t$.'),

    N('li-n-omega0-calculo', 'libre', 1, { m: [1, 4, 1], k: [9, 36, 9] },
      function (v) { return 'Determina la frecuencia angular natural $\\omega_0$ (en rad/s) para una masa $m = ' + v.m + '$ kg acoplada a un resorte con $k = ' + v.k + '$ N/m.'; },
      function (v) { return Math.sqrt(v.k / v.m); },
      'La pulsación o frecuencia angular natural es $\\omega_0 = \\sqrt{k/m}$.',
      { unit: 'rad/s',
        where: function (v) { return v.k % v.m === 0; },
        mistakes: {
          inv: function (v) { return Math.sqrt(v.m / v.k); },
          noSqrt: function (v) { return v.k / v.m; }
        },
        feedback: [
          { when: 'inv', say: 'Casi: invertiste los términos dentro de la raíz; la fórmula es $\\sqrt{k/m}$.' },
          { when: 'noSqrt', say: 'Casi: ese valor es $\\omega_0^2$; te faltó sacar la raíz cuadrada.' }
        ] }),

    N('li-n-periodo-calculo', 'libre', 1, { m: [1, 3, 1], k: [16, 64, 16] },
      function (v) { return 'Calcula el periodo de oscilación $T$ (en segundos) de un cuerpo de $' + v.m + '$ kg sujeto a un resorte de rigidez $k = ' + v.k + '$ N/m.'; },
      function (v) { return 2 * Math.PI * Math.sqrt(v.m / v.k); },
      'El periodo de oscilación está dado por $T = 2\\pi / \\omega_0 = 2\\pi\\sqrt{m/k}$.',
      { unit: 's',
        mistakes: {
          inv: function (v) { return 2 * Math.PI * Math.sqrt(v.k / v.m); },
          noDosPi: function (v) { return Math.sqrt(v.m / v.k); }
        },
        feedback: [
          { when: 'inv', say: 'Casi: en el periodo la masa va arriba: $T = 2\\pi\\sqrt{m/k}$.' },
          { when: 'noDosPi', say: 'Casi: te faltó multiplicar por $2\\pi$ en la relación $T = 2\\pi/\\omega_0$.' }
        ] }),

    N('li-n-frec-herzios', 'libre', 2, { k: [100, 400, 100], m: [1, 4, 1] },
      function (v) { return 'Un bloque de $' + v.m + '$ kg oscila unido a un resorte con $k = ' + v.k + '$ N/m. ¿Cuál es la frecuencia ordinaria $f$ en hertz (ciclos por segundo)?'; },
      function (v) { return Math.sqrt(v.k / v.m) / (2 * Math.PI); },
      'La frecuencia cíclica en Hz es $f = \\omega_0 / (2\\pi) = \\frac{1}{2\\pi}\\sqrt{k/m}$.',
      { unit: 'Hz',
        where: function (v) { return v.k / v.m >= 25; },
        mistakes: {
          multDosPi: function (v) { return Math.sqrt(v.k / v.m) * (2 * Math.PI); },
          angular: function (v) { return Math.sqrt(v.k / v.m); }
        },
        feedback: [
          { when: 'multDosPi', say: 'Casi: para convertir de rad/s a hertz se divide entre $2\\pi$, no se multiplica.' },
          { when: 'angular', say: 'Casi: esa es la frecuencia angular $\\omega_0$ en rad/s; divide entre $2\\pi$ para obtener hertz.' }
        ] }),

    N('li-n-amplitud-pvi', 'libre', 2, { x0: [3, 8, 1], v0: [12, 32, 4], w: [3, 5, 1] },
      function (v) { return 'Un oscilador con $\\omega_0 = ' + v.w + '$ rad/s inicia con $x(0) = ' + v.x0 + '$ cm y $x\'(0) = ' + v.v0 + '$ cm/s. Calcula la amplitud total $A$ en cm.'; },
      function (v) { var c2 = v.v0 / v.w; return Math.sqrt(v.x0 * v.x0 + c2 * c2); },
      'La solución es $x(t) = x_0\\cos\\omega_0 t + (v_0/\\omega_0)\\sin\\omega_0 t$, cuya amplitud es $A = \\sqrt{x_0^2 + (v_0/\\omega_0)^2}$.',
      { unit: 'cm',
        where: function (v) { return v.v0 % v.w === 0; },
        mistakes: {
          directo: function (v) { return Math.sqrt(v.x0 * v.x0 + v.v0 * v.v0); },
          lineal: function (v) { return v.x0 + v.v0 / v.w; }
        },
        feedback: [
          { when: 'directo', say: 'Casi: el coeficiente de la función seno es $v_0/\\omega_0$, debes dividir la velocidad entre $\\omega_0$.' },
          { when: 'lineal', say: 'Casi: la amplitud no es la suma directa; se calcula con Pitágoras $A = \\sqrt{c_1^2 + c_2^2}$.' }
        ] }),

    N('li-n-rapidez-maxima', 'libre', 2, { A: [4, 12, 2], m: [1, 2, 1], k: [25, 100, 25] },
      function (v) { return 'Una masa de $' + v.m + '$ kg vibra con amplitud $A = ' + v.A + '$ cm en un resorte con rigidez $k = ' + v.k + '$ N/m. ¿Cuál es la rapidez máxima que alcanza, en m/s?'; },
      function (v) { var w = Math.sqrt(v.k / v.m); return (v.A / 100) * w; },
      'La rapidez máxima se alcanza en el equilibrio: $v_{\\max} = A\\,\\omega_0 = A\\sqrt{k/m}$, pasando $A$ a metros.',
      { unit: 'm/s',
        mistakes: {
          noMts: function (v) { var w = Math.sqrt(v.k / v.m); return v.A * w; },
          divW: function (v) { var w = Math.sqrt(v.k / v.m); return (v.A / 100) / w; }
        },
        feedback: [
          { when: 'noMts', say: 'Casi: olvidaste convertir la amplitud de centímetros a metros.' },
          { when: 'divW', say: 'Casi: al derivar $x(t) = A\\cos\\omega_0 t$ la velocidad máxima es el producto $A\\omega_0$.' }
        ] }),

    N('li-n-aceleracion-maxima', 'libre', 2, { A: [2, 6, 1], w: [4, 10, 2] },
      function (v) { return 'Una partícula oscila armónicamente con amplitud $A = ' + v.A + '$ cm y frecuencia $\\omega_0 = ' + v.w + '$ rad/s. Calcula la aceleración máxima en $\\text{m}/\\text{s}^2$.'; },
      function (v) { return (v.A / 100) * v.w * v.w; },
      'La aceleración máxima en los extremos de retorno es $a_{\\max} = \\omega_0^2 A$, convirtiendo $A$ a metros.',
      { unit: 'm/s²',
        mistakes: {
          noCuad: function (v) { return (v.A / 100) * v.w; },
          noConv: function (v) { return v.A * v.w * v.w; }
        },
        feedback: [
          { when: 'noCuad', say: 'Casi: la aceleración depende de la frecuencia angular al cuadrado: $a_{\\max} = \\omega_0^2 A$.' },
          { when: 'noConv', say: 'Casi: no convertiste la amplitud de centímetros a metros.' }
        ] }),

    N('li-n-fase-angulo', 'libre', 3, { c1: [3, 8, 1], c2: [3, 8, 1] },
      function (v) { return 'Si la posición es $x(t) = ' + v.c1 + '\\cos(2t) + ' + v.c2 + '\\sin(2t)$, determina el ángulo de fase $\\delta \\in [0, \\pi/2]$ en radianes al escribirla como $x(t) = A\\cos(2t - \\delta)$.'; },
      function (v) { return Math.atan2(v.c2, v.c1); },
      'Comparando con $A\\cos(2t - \\delta) = A\\cos\\delta\\cos 2t + A\\sin\\delta\\sin 2t$, se obtiene $\\tan\\delta = c_2 / c_1$.',
      { unit: 'rad',
        where: function (v) { return v.c1 !== v.c2; },
        mistakes: {
          inv: function (v) { return Math.atan2(v.c1, v.c2); },
          grados: function (v) { return Math.atan2(v.c2, v.c1) * 180 / Math.PI; }
        },
        feedback: [
          { when: 'inv', say: 'Casi: la tangente del ángulo de fase es $c_2/c_1$ (coeficiente del seno entre coeficiente del coseno).' },
          { when: 'grados', say: 'Casi: se pide el ángulo en radianes, no en grados sexagesimales.' }
        ] }),

    N('li-n-energia-mecanica-total', 'libre', 3, { m: [2, 5, 1], k: [50, 200, 25], v0: [1.2, 2.4, 0.4] },
      function (v) { return 'Una masa de $' + v.m + '$ kg acoplada a un resorte con $k = ' + v.k + '$ N/m se dispara desde el equilibrio ($x=0$) con rapidez $v_0 = ' + v.v0 + '$ m/s. ¿Cuántos joules vale la energía mecánica total?'; },
      function (v) { return 0.5 * v.m * v.v0 * v.v0; },
      'En la posición de equilibrio la energía elástica es cero; la energía mecánica total es puramente cinética: $E = \\frac{1}{2}m v_0^2$.',
      { unit: 'J',
        mistakes: {
          noMitad: function (v) { return v.m * v.v0 * v.v0; },
          extraK: function (v) { return 0.5 * v.m * v.v0 * v.v0 + 0.5 * v.k; }
        },
        feedback: [
          { when: 'noMitad', say: 'Casi: la energía cinética lleva factor $1/2$: $E = \\frac{1}{2}m v_0^2$.' },
          { when: 'extraK', say: 'Casi: en el equilibrio $x = 0$ la deformación es nula y no hay energía elástica inicial.' }
        ] }),

    N('li-n-tiempo-primer-cero', 'libre', 3, { w: [2, 6, 1] },
      function (v) { return 'Una masa inicia desde el reposo en $x(0) = 5$ cm según $x\'\' + ' + (v.w * v.w) + 'x = 0$. ¿Cuántos segundos tarda en cruzar por primera vez la posición de equilibrio ($x = 0$)?'; },
      function (v) { return Math.PI / (2 * v.w); },
      'La posición es $x(t) = 5\\cos(\\omega t)$. El primer paso por cero ocurre en $\\omega t_1 = \\pi/2$, es decir, $t_1 = \\pi / (2\\omega)$ (un cuarto de periodo).',
      { unit: 's',
        mistakes: {
          periodoComp: function (v) { return (2 * Math.PI) / v.w; },
          medioPer: function (v) { return Math.PI / v.w; }
        },
        feedback: [
          { when: 'periodoComp', say: 'Casi: ese es el periodo completo $T$; el primer cruce desde el extremo ocurre en un cuarto de periodo $T/4$.' },
          { when: 'medioPer', say: 'Casi: en medio periodo la masa alcanza el extremo opuesto; el cruce por cero ocurre en $T/4 = \\pi/(2\\omega)$.' }
        ] }),

    /* =====================================================================
       3. Movimiento libre amortiguado y regímenes (18 preguntas: 6 D1, 9 D2, 3 D3)
       ===================================================================== */
    C('am-c-tres-regimenes-disc', 'amortiguado', 1,
      'Para el oscilador libre amortiguado $m\\,x\'\' + c\\,x\' + k\\,x = 0$, ¿qué condición sobre sus parámetros define al régimen subamortiguado?',
      '$c^2 - 4mk < 0$, produciendo raíces complejas conjugadas con parte real negativa',
      [['$c^2 - 4mk > 0$, produciendo dos raíces reales distintas', 'Casi: esa condición corresponde al régimen sobreamortiguado, sin oscilaciones.'],
       ['$c^2 - 4mk = 0$, produciendo una raíz real doble', 'Casi: esa es la condición exacta del amortiguamiento crítico.'],
       ['$c = 0$, eliminando la fricción', 'Casi: con $c = 0$ no hay amortiguamiento; el subamortiguado sí tiene fricción ($c > 0$) y oscila disipando energía.']],
      'El discriminante de $m r^2 + c r + k = 0$ es $c^2 - 4mk$. Si es negativo, las raíces complejas generan oscilaciones senoidales moduladas por una exponencial.'),

    C('am-c-def-critico', 'amortiguado', 1,
      '¿Qué rasgo distintivo caracteriza al amortiguamiento crítico ($c = 2\\sqrt{mk}$) frente a los demás movimientos libres?',
      'Regresa al equilibrio en el menor tiempo posible sin llegar a oscilar',
      [['Oscila con amplitud constante durante un tiempo prolongado', 'Casi: con amortiguamiento crítico la solución no tiene factores trigonométricos; decae a cero sin oscilar.'],
       ['Tarda más tiempo en retornar al reposo que cualquier oscilador sobreamortiguado', 'Casi: al revés; cualquier aumento en $c$ sobreamortigua el sistema y demora el retorno.'],
       ['Se detiene bruscamente antes de tocar el punto de equilibrio', 'Casi: el retorno es asintótico ($x \\to 0$ conforme $t \\to \\infty$).']],
      'El caso crítico es el punto óptimo de diseño: suprime las oscilaciones y minimiza el tiempo de asentamiento.'),

    C('am-c-cruces-por-cero', 'amortiguado', 2,
      'En un oscilador libre críticamente amortiguado o sobreamortiguado, ¿cuántas veces a lo sumo puede cruzar la masa por el equilibrio $x = 0$ para $t > 0$?',
      'A lo más una sola vez, dependiendo de las condiciones iniciales',
      [['Infinitas veces, con intervalos de tiempo cada vez más grandes', 'Casi: la solución no posee senos ni cosenos; una combinación de exponenciales reales no puede anularse periódicamente.'],
       ['Exactamente dos veces siempre', 'Casi: las funciones $(c_1 + c_2 t)e^{-r t}$ o $c_1 e^{r_1 t} + c_2 e^{r_2 t}$ tienen a lo sumo una raíz real para $t > 0$.'],
       ['Nunca puede cruzar el punto de equilibrio', 'Casi: si la velocidad inicial apunta hacia el origen con magnitud suficiente, cruzará una vez antes de retornar asintóticamente.']],
      'La ecuación $(c_1 + c_2 t) = 0$ o $c_1 + c_2 e^{\\Delta r t} = 0$ admite como máximo una única solución en $t > 0$.'),

    C('am-c-cuasifrecuencia', 'amortiguado', 2,
      'En el régimen subamortiguado, la cuasi-frecuencia angular $\\beta$ comparada con la frecuencia natural no amortiguada $\\omega_0 = \\sqrt{k/m}$ es…',
      'Estrictamente menor: $\\beta = \\sqrt{k/m - c^2/(4m^2)} < \\omega_0$',
      [['Estrictamente mayor, porque el amortiguador apresura el movimiento', 'Casi: la fuerza disipativa retarda las oscilaciones, reduciendo la frecuencia observada.'],
       ['Exactamente idéntica a $\\omega_0$, pues el amortiguamiento no afecta a la frecuencia', 'Casi: la presencia de fricción reduce la frecuencia de oscilación a $\\beta = \\sqrt{\\omega_0^2 - (c/2m)^2}$.'],
       ['Cero, porque las vibraciones dejan de ser periódicas', 'Casi: aunque la amplitud decrece, la oscilación persiste con frecuencia angular fija $\\beta > 0$.']],
      'Las raíces son $-c/(2m) \\pm i\\beta$, donde la parte imaginaria $\\beta = \\sqrt{\\omega_0^2 - (c/2m)^2}$ es menor que $\\omega_0$.'),

    C('am-c-decrecimiento-log', 'amortiguado', 2,
      'El decremento logarítmico $\\delta = \\ln(x_n / x_{n+1})$ entre dos crestas consecutivas en un oscilador subamortiguado cuantifica…',
      'La tasa a la que se reduce la amplitud de vibración tras completar cada ciclo',
      [['La cantidad de energía mecánica que ingresa al sistema por periodo', 'Casi: el sistema no recibe energía externa; la amplitud decae debido a la disipación interna.'],
       ['La diferencia de frecuencias entre la fuerza exterior y el resorte', 'Casi: este parámetro corresponde a la vibración libre disipativa, sin fuerzas motrices externas.'],
       ['La variación de la rigidez $k$ por calentamiento del resorte', 'Casi: los coeficientes del modelo se consideran ideales y constantes.']],
      'Como la amplitud decae según $e^{-\\gamma t}$, el cociente entre picos distanciados por un cuasi-periodo $T_{\\text{d}}$ es $e^{\\gamma T_{\\text{d}}}$, cuyo logaritmo es $\\delta$.'),

    C('am-c-envolvente-amplitud', 'amortiguado', 1,
      '¿Qué curvas limitan superior e inferiormente a la posición de un oscilador en movimiento subamortiguado?',
      'Curvas exponenciales de decaimiento $\\pm A e^{-\\frac{c}{2m}t}$',
      [['Rectas diagonales convergentes que tocan el eje en un instante finito', 'Casi: la amortiguación viscosa produce decaimiento asintótico exponencial, no lineal.'],
       ['Parábolas invertidas simétricas', 'Casi: la envolvente proviene del factor exponencial $e^{-(c/2m)t}$.'],
       ['Líneas horizontales constantes $\\pm A$', 'Casi: esas son las envolventes del oscilador armónico simple ideal sin fricción ($c = 0$).']],
      'Al estar acotado el factor trigonométrico $|\\cos(\\beta t - \\phi)| \\le 1$, la curva queda confinada entre $\\pm A e^{-ct/2m}$.'),

    C('am-c-sobreamort-raices', 'amortiguado', 2,
      'En el régimen sobreamortiguado ($c^2 > 4mk$), ambas raíces características de $m r^2 + c r + k = 0$ son…',
      'Reales, distintas y estrictamente negativas',
      [['Reales, distintas y ambas estrictamente positivas', 'Casi: como los coeficientes $m, c, k$ son positivos, las dos raíces reales son forzosamente negativas.'],
       ['Una positiva y una negativa, provocando inestabilidad', 'Casi: como $\\sqrt{c^2 - 4mk} < c$, el numerador $-c + \\sqrt{c^2 - 4mk}$ sigue siendo estrictamente negativo.'],
       ['Complejas conjugadas puras sin parte real', 'Casi: con discriminante positivo no hay componentes imaginarias.']],
      'Como $c > \\sqrt{c^2 - 4mk} > 0$, las dos raíces $-c \\pm \\sqrt{c^2 - 4mk}$ son estrictamente negativas, garantizando decaimiento a cero.'),

    N('am-n-ccrit-calculo', 'amortiguado', 1, { m: [1, 4, 1], k: [9, 36, 9] },
      function (v) { return 'Para una masa $m = ' + v.m + '$ kg y resorte $k = ' + v.k + '$ N/m, determina el coeficiente de amortiguamiento crítico $c_{\\text{crit}}$ en kg/s.'; },
      function (v) { return 2 * Math.sqrt(v.m * v.k); },
      'El caso crítico ocurre cuando el discriminante se anula: $c^2 - 4mk = 0 \\implies c_{\\text{crit}} = 2\\sqrt{mk}$.',
      { unit: 'kg/s',
        mistakes: {
          noDos: function (v) { return Math.sqrt(v.m * v.k); },
          cuadrado: function (v) { return 4 * v.m * v.k; }
        },
        feedback: [
          { when: 'noDos', say: 'Casi: de $c^2 = 4mk$ se obtiene $c = 2\\sqrt{mk}$; te faltó el factor 2.' },
          { when: 'cuadrado', say: 'Casi: ese valor es $c^2 = 4mk$; falta sacar la raíz cuadrada.' }
        ] }),

    N('am-n-discriminante-signo', 'amortiguado', 1, { m: [1, 3, 1], c: [4, 10, 2], k: [5, 20, 5] },
      function (v) { return 'Calcula el discriminante $\\Delta = c^2 - 4mk$ en $\\text{kg}^2/\\text{s}^2$ para $m = ' + v.m + '$ kg, $c = ' + v.c + '$ kg/s y $k = ' + v.k + '$ N/m.'; },
      function (v) { return v.c * v.c - 4 * v.m * v.k; },
      'El discriminante de la ecuación característica $m r^2 + c r + k = 0$ es $\\Delta = c^2 - 4mk$.',
      { unit: 'kg²/s²',
        where: function (v) { return Math.abs(v.c * v.c - 4 * v.m * v.k) >= 4; },
        mistakes: {
          sinCuatro: function (v) { return v.c * v.c - v.m * v.k; },
          suma: function (v) { return v.c * v.c + 4 * v.m * v.k; }
        },
        feedback: [
          { when: 'sinCuatro', say: 'Casi: la fórmula del discriminante cuadrático es $b^2 - 4ac$, falta el factor 4.' },
          { when: 'suma', say: 'Casi: la fórmula lleva signo de resta en el producto: $c^2 - 4mk$.' }
        ] }),

    N('am-n-cuasifrec-beta', 'amortiguado', 2, { m: [1, 2, 1], k: [25, 50, 25], c: [2, 6, 2] },
      function (v) { return 'Un oscilador subamortiguado tiene $m = ' + v.m + '$ kg, $c = ' + v.c + '$ kg/s y $k = ' + v.k + '$ N/m. Calcula su cuasi-frecuencia $\\beta$ en rad/s.'; },
      function (v) { var w02 = v.k / v.m, gamma = v.c / (2 * v.m); return Math.sqrt(w02 - gamma * gamma); },
      'La cuasi-frecuencia es la parte imaginaria de las raíces: $\\beta = \\sqrt{k/m - (c/2m)^2}$.',
      { unit: 'rad/s',
        where: function (v) { return v.k / v.m > Math.pow(v.c / (2 * v.m), 2) + 1; },
        mistakes: {
          w0Solo: function (v) { return Math.sqrt(v.k / v.m); },
          noDosM: function (v) { var w02 = v.k / v.m, gamma = v.c / v.m; return Math.sqrt(w02 - gamma * gamma); }
        },
        feedback: [
          { when: 'w0Solo', say: 'Casi: esa es la frecuencia natural $\\omega_0$; con amortiguamiento la cuasi-frecuencia es $\\beta = \\sqrt{\\omega_0^2 - (c/2m)^2}$.' },
          { when: 'noDosM', say: 'Casi: la tasa de atenuación es $\\gamma = c/(2m)$; te faltó el factor 2 en el denominador.' }
        ] }),

    N('am-n-cuasiperiodo', 'amortiguado', 2, { beta: [2, 5, 1] },
      function (v) { return 'Si un oscilador amortiguado vibra con cuasi-frecuencia $\\beta = ' + v.beta + '$ rad/s, ¿cuánto vale su cuasi-periodo $T_{\\text{d}}$ en segundos?'; },
      function (v) { return 2 * Math.PI / v.beta; },
      'El intervalo temporal entre dos cruces sucesivos en igual sentido es $T_{\\text{d}} = 2\\pi / \\beta$.',
      { unit: 's',
        mistakes: {
          medio: function (v) { return Math.PI / v.beta; },
          inv: function (v) { return v.beta / (2 * Math.PI); }
        },
        feedback: [
          { when: 'medio', say: 'Casi: en medio periodo cruza en dirección contraria; el periodo completo es $2\\pi/\\beta$.' },
          { when: 'inv', say: 'Casi: invertiste el cociente; el periodo es $2\\pi/\\beta$, no $\\beta/(2\\pi)$.' }
        ] }),

    N('am-n-tasa-decaimiento', 'amortiguado', 1, { c: [4, 16, 4], m: [1, 2, 1] },
      function (v) { return 'Determina el factor de atenuación exponencial $\\gamma = c/(2m)$ (en $\\text{s}^{-1}$) para una masa $m = ' + v.m + '$ kg y amortiguador $c = ' + v.c + '$ kg/s.'; },
      function (v) { return v.c / (2 * v.m); },
      'La amplitud de oscilación decae gobernada por la envolvente $e^{-\\gamma t}$, donde $\\gamma = c / (2m)$.',
      { unit: 's⁻¹',
        where: function (v) { return v.c % (2 * v.m) === 0; },
        mistakes: {
          noDos: function (v) { return v.c / v.m; },
          multDos: function (v) { return (2 * v.c) / v.m; }
        },
        feedback: [
          { when: 'noDos', say: 'Casi: la parte real de la raíz es $-c/(2m)$; te faltó dividir entre 2.' },
          { when: 'multDos', say: 'Casi: el factor 2 divide a la constante $c$, no la multiplica.' }
        ] }),

    N('am-n-vida-media-amplitud', 'amortiguado', 2, { gamma: [0.5, 2, 0.5] },
      function (v) { return 'Si la envolvente de vibración decae según $e^{-' + v.gamma + 't}$, ¿en cuántos segundos se reduce la amplitud a la mitad de su valor inicial?'; },
      function (v) { return Math.log(2) / v.gamma; },
      'De $e^{-\\gamma t_{1/2}} = 1/2$, se obtiene $t_{1/2} = (\\ln 2) / \\gamma$.',
      { unit: 's',
        mistakes: {
          inv: function (v) { return 1 / v.gamma; },
          lineal: function (v) { return 0.5 / v.gamma; }
        },
        feedback: [
          { when: 'inv', say: 'Casi: $1/\\gamma$ es el tiempo característico donde la amplitud cae a $1/e \\approx 37\\%$; para la mitad usa $\\ln 2 / \\gamma$.' },
          { when: 'lineal', say: 'Casi: el decaimiento es exponencial, requiriendo el logaritmo $\\ln 2 \\approx 0.693$, no el valor $0.5$.' }
        ] }),

    N('am-n-pos-critico-pvi', 'amortiguado', 2, { x0: [1, 4, 1], r: [2, 4, 1], t: [0.5, 1.5, 0.5] },
      function (v) { return 'Un sistema crítico con raíz $r = -' + v.r + '$ y reposo inicial cumple $x(t) = ' + v.x0 + '(1 + ' + v.r + 't)e^{-' + v.r + 't}$. Calcula $x(' + v.t + ')$ en metros.'; },
      function (v) { return v.x0 * (1 + v.r * v.t) * Math.exp(-v.r * v.t); },
      'Evaluando la función analítica de desplazamiento crítico $x(t) = x_0(1 + r t)e^{-r t}$ en el tiempo indicado.',
      { unit: 'm',
        mistakes: {
          sinT: function (v) { return v.x0 * Math.exp(-v.r * v.t); },
          posExp: function (v) { return v.x0 * (1 + v.r * v.t) * Math.exp(v.r * v.t); }
        },
        feedback: [
          { when: 'sinT', say: 'Casi: con raíz doble y reposo inicial la constante que acompaña a $t$ no es cero: incluye $(1+rt)$.' },
          { when: 'posExp', say: 'Casi: el sistema es disipativo y estable; el exponente debe ser negativo $-rt$.' }
        ] }),

    N('am-n-raiz-sobreamort', 'amortiguado', 2, { m: [1, 2, 1], c: [10, 16, 2], k: [9, 21, 3] },
      function (v) { return 'Para el oscilador sobreamortiguado $' + v.m + "x'' + " + v.c + "x' + " + v.k + 'x = 0$, calcula la raíz característica de menor magnitud absoluta.'; },
      function (v) { var d = Math.sqrt(v.c * v.c - 4 * v.m * v.k); return (-v.c + d) / (2 * v.m); },
      'Las dos raíces reales negativas son $(-c \\pm \\sqrt{c^2 - 4mk})/(2m)$. La de menor magnitud es la que suma la raíz.',
      { where: function (v) { return v.c * v.c - 4 * v.m * v.k > 0 && Math.sqrt(v.c * v.c - 4 * v.m * v.k) % 1 === 0; },
        mistakes: {
          otraRaiz: function (v) { var d = Math.sqrt(v.c * v.c - 4 * v.m * v.k); return (-v.c - d) / (2 * v.m); },
          sinDosA: function (v) { var d = Math.sqrt(v.c * v.c - 4 * v.m * v.k); return -v.c + d; }
        },
        feedback: [
          { when: 'otraRaiz', say: 'Casi: esa es la raíz más negativa (el decaimiento más rápido); se pidió la raíz de menor magnitud.' },
          { when: 'sinDosA', say: 'Casi: olvidaste dividir entre el denominador $2m$.' }
        ] }),

    N('am-n-decrem-log-val', 'amortiguado', 3, { gamma: [0.4, 1.2, 0.4], beta: [2, 4, 1] },
      function (v) { return 'Un oscilador subamortiguado tiene factor de decaimiento $\\gamma = ' + v.gamma + '\\ \\text{s}^{-1}$ y cuasi-frecuencia $\\beta = ' + v.beta + '$ rad/s. Calcula su decremento logarítmico $\\delta = 2\\pi\\gamma / \\beta$.'; },
      function (v) { return (2 * Math.PI * v.gamma) / v.beta; },
      'El decremento logarítmico adimensional es $\\delta = \\ln(x(t)/x(t + T_{\\text{d}})) = \\gamma T_{\\text{d}} = 2\\pi\\gamma / \\beta$.',
      { mistakes: {
          sinDosPi: function (v) { return v.gamma / v.beta; },
          inv: function (v) { return (2 * Math.PI * v.beta) / v.gamma; }
        },
        feedback: [
          { when: 'sinDosPi', say: 'Casi: el periodo es $T_{\\text{d}} = 2\\pi/\\beta$; te faltó el factor $2\\pi$.' },
          { when: 'inv', say: 'Casi: el cociente es $\\gamma / \\beta$, no $\\beta / \\gamma$.' }
        ] }),

    N('am-n-cruce-cero-sobre', 'amortiguado', 3, { r1: [1, 2, 1], r2: [3, 5, 1], v0: [4, 10, 2] },
      function (v) { return 'La solución sobreamortiguada con $x(0) = 1$ y $x\'(0) = -' + v.v0 + '$ es $x(t) = c_1 e^{-' + v.r1 + 't} + c_2 e^{-' + v.r2 + 't}$, con $c_1 = (' + v.r2 + ' - ' + v.v0 + ')/(' + (v.r2 - v.r1) + ')$ y $c_2 = (' + v.v0 + ' - ' + v.r1 + ')/(' + (v.r2 - v.r1) + ')$. ¿En qué tiempo $t > 0$ cruza por $x = 0$?'; },
      function (v) { var c1 = (v.r2 - v.v0) / (v.r2 - v.r1), c2 = (v.v0 - v.r1) / (v.r2 - v.r1); return Math.log(-c1 / c2) / (v.r1 - v.r2); },
      'De $c_1 e^{-r_1 t} + c_2 e^{-r_2 t} = 0$, se obtiene $e^{(r_2 - r_1)t} = -c_2/c_1$, por lo que $t = \\ln(-c_1/c_2)/(r_1 - r_2)$.',
      { unit: 's',
        where: function (v) { return v.v0 > v.r2 && v.r2 > v.r1; },
        mistakes: {
          linealT: function (v) { var c1 = (v.r2 - v.v0) / (v.r2 - v.r1), c2 = (v.v0 - v.r1) / (v.r2 - v.r1); return -c1 / (c2 * (v.r2 - v.r1)); },
          invDiff: function (v) { return 1 / (v.r2 - v.r1); }
        },
        feedback: [
          { when: 'linealT', say: 'Casi: para despejar el tiempo aplica logaritmo natural al cociente de coeficientes.' },
          { when: 'invDiff', say: 'Casi: falta el logaritmo del cociente de amplitudes de los dos modos exponenciales.' }
        ] }),

    N('am-n-maximo-tiempo-crit', 'amortiguado', 3, { r: [2, 5, 1], v0: [4, 12, 2] },
      function (v) { return 'Un resorte críticamente amortiguado con raíz doble $r = -' + v.r + '$ parte de $x(0) = 0$ con impulso $x\'(0) = ' + v.v0 + '$ m/s. ¿En qué tiempo $t_{\\max}$ (en segundos) alcanza su máximo desplazamiento?'; },
      function (v) { return 1 / v.r; },
      'La posición es $x(t) = v_0 t e^{-r t}$. Su derivada $x\'(t) = v_0(1 - r t)e^{-r t} = 0$ ocurre exactamente en $t = 1/r$.',
      { unit: 's',
        mistakes: {
          multR: function (v) { return v.r; },
          divV0: function (v) { return v.v0 / v.r; }
        },
        feedback: [
          { when: 'multR', say: 'Casi: el tiempo crítico se obtiene derivando: $t_{\\max} = 1/r$, es el recíproco.' },
          { when: 'divV0', say: 'Casi: la velocidad inicial amplifica la altura del pico pero no altera el instante $t_{\\max}$.' }
        ] }),

    /* =====================================================================
       4. Oscilaciones forzadas y estado estacionario (15 preguntas: 3 D1, 9 D2, 3 D3)
       ===================================================================== */
    C('fo-c-transitorio-vs-estac', 'forzado', 1,
      'En la respuesta total $x(t) = x_h(t) + x_p(t)$ de un oscilador amortiguado ($c > 0$) con fuerza $F_0\\cos\\omega t$, ¿qué ocurre con la solución homogénea $x_h(t)$ para tiempos grandes?',
      'Se extingue exponencialmente a cero (respuesta transitoria), perdurando únicamente el estado estacionario $x_p(t)$',
      [['Crece linealmente en el tiempo sin límite', 'Casi: al haber fricción ($c > 0$), las raíces del característico tienen parte real negativa, forzando $x_h \\to 0$.'],
       ['Permanece constante e igual a su valor inicial para siempre', 'Casi: el factor $e^{-ct/2m}$ la amortigua asintóticamente a cero.'],
       ['Reemplaza a la frecuencia de la fuerza externa por la natural', 'Casi: lo que sobrevive es el estado estacionario, que oscila a la frecuencia exterior $\\omega$.']],
      'Con fricción positiva, toda la solución homogénea decae asintóticamente a cero, dejando solo el estado estacionario $x_p(t)$.'),

    C('fo-c-frecuencia-estacionaria', 'forzado', 1,
      '¿Con qué frecuencia angular vibra la masa en el régimen estacionario bajo una excitación periódica $F(t) = F_0\\cos\\omega t$ (con $c > 0$)?',
      'Únicamente con la frecuencia $\\omega$ de la fuerza motriz aplicada',
      [['Con la frecuencia natural no amortiguada $\\omega_0 = \\sqrt{k/m}$', 'Casi: la frecuencia natural rige el transitorio libre, pero este se apaga por la fricción.'],
       ['Con la cuasi-frecuencia amortiguada $\\beta = \\sqrt{\\omega_0^2 - (c/2m)^2}$', 'Casi: esa es la frecuencia del transitorio disipativo, no la del estado permanente.'],
       ['Con el promedio $(\\omega + \\omega_0)/2$', 'Casi: en el régimen permanente el oscilador adopta estrictamente el ritmo de la fuerza externa.']],
      'La solución particular propuesta $x_p(t) = A\\cos\\omega t + B\\sin\\omega t$ oscila exactamente con la pulsación $\\omega$ de la excitación.'),

    C('fo-c-desfase-fisico', 'forzado', 2,
      'En un oscilador forzado amortiguado $m\\,x\'\' + c\\,x\' + k\\,x = F_0\\cos\\omega t$, la posición permanente $x_p(t) = X\\cos(\\omega t - \\phi)$ tiene $\\phi > 0$. ¿Qué significa esto?',
      'El pico de desplazamiento ocurre después del pico de la fuerza motriz (el oscilador va retrasado respecto a la fuerza)',
      [['El desplazamiento se adelanta en el tiempo a la fuerza aplicada', 'Casi: el signo negativo en el argumento $\\omega t - \\phi$ representa un atraso temporal $\\Delta t = \\phi / \\omega$.'],
       ['El sistema oscila en sentido opuesto a la aceleración gravitatoria', 'Casi: el desfase describe el sincronismo temporal relativo entre dos ondas senoidales.'],
       ['La fuerza disipa el doble de energía que en resonancia', 'Casi: $\\phi$ describe la sincronización angular, no la potencia absoluta disipada.']],
      'El máximo de la fuerza ocurre en $\\omega t = 0$, mientras que el del oscilador ocurre más tarde en $\\omega t = \\phi$, indicando retraso.'),

    C('fo-c-independencia-ci', 'forzado', 2,
      '¿De qué dependen la amplitud y el ángulo de desfase del estado estacionario $x_p(t)$ en un sistema amortiguado forzado?',
      'De los parámetros mecánicos ($m, c, k$) y de la fuerza ($F_0, \\omega$), siendo independientes de las condiciones iniciales',
      [['Exclusivamente de la posición y velocidad iniciales $x(0)$ y $x\'(0)$', 'Casi: las condiciones iniciales determinan las constantes de la homogénea transitoria, no la solución particular.'],
       ['De las condiciones iniciales y de la frecuencia natural, pero no de $c$', 'Casi: la amplitud estacionaria depende de forma crucial del amortiguamiento $c$.'],
       ['De la gravedad $g$ y de la masa únicamente', 'Casi: intervienen la masa, la elasticidad, el amortiguamiento y la fuerza exterior.']],
      'La solución particular se determina por coeficientes indeterminados en la EDO; las condiciones iniciales solo fijan $c_1$ y $c_2$ en el transitorio.'),

    C('fo-c-desfase-baja-frec', 'forzado', 2,
      'Cuando la frecuencia de la fuerza externa es muy pequeña en comparación con la frecuencia natural ($\\omega \\ll \\omega_0$), ¿a qué valor se aproxima el desfase $\\phi$?',
      'Tiende a $0^\\circ$ (el desplazamiento se mueve casi en fase con la fuerza impulsora)',
      [['Tiende a $90^\\circ$ (en cuadratura)', 'Casi: el desfase de $90^\\circ$ se alcanza cuando la frecuencia excitadora iguala a la natural $\\omega = \\omega_0$.'],
       ['Tiende a $180^\\circ$ (en oposición de fase completa)', 'Casi: el desfase de $180^\\circ$ ocurre a frecuencias muy elevadas $\\omega \\gg \\omega_0$, dominadas por la inercia.'],
       ['Tiende a $-90^\\circ$', 'Casi: el desfase es positivo y varía dentro del intervalo $[0, \\pi]$.']],
      'De $\\tan\\phi = c\\omega / (k - m\\omega^2)$, cuando $\\omega \\to 0$ el numerador se anula con denominador $k > 0$, de donde $\\phi \\to 0$.'),

    N('fo-n-amplitud-estacionaria', 'forzado', 2, { F0: [10, 40, 10], k: [25, 45, 5], m: [1, 2, 1], w: [2, 3, 1], c: [2, 4, 1] },
      function (v) { return 'Calcula la amplitud estacionaria $X$ (en metros) para masa $m = ' + v.m + '$ kg, constante $k = ' + v.k + '$ N/m, fricción $c = ' + v.c + '$ kg/s y fuerza $F(t) = ' + v.F0 + '\\cos(' + v.w + 't)$ N.'; },
      function (v) { var t1 = v.k - v.m * v.w * v.w, t2 = v.c * v.w; return v.F0 / Math.sqrt(t1 * t1 + t2 * t2); },
      'La amplitud del régimen permanente es $X = F_0 / \\sqrt{(k - m\\omega^2)^2 + (c\\omega)^2}$.',
      { unit: 'm',
        where: function (v) { return Math.abs(v.k - v.m * v.w * v.w) >= 3; },
        mistakes: {
          sinFric: function (v) { return v.F0 / Math.abs(v.k - v.m * v.w * v.w); },
          sinM: function (v) { var t1 = v.k - v.w * v.w, t2 = v.c * v.w; return v.F0 / Math.sqrt(t1 * t1 + t2 * t2); }
        },
        feedback: [
          { when: 'sinFric', say: 'Casi: omitiste el término de disipación $(c\\omega)^2$ en el denominador.' },
          { when: 'sinM', say: 'Casi: la masa multiplica a la frecuencia cuadrática: $(k - m\\omega^2)$.' }
        ] }),

    N('fo-n-fuerza-estatica-k', 'forzado', 1, { F0: [12, 60, 6], k: [20, 50, 5] },
      function (v) { return 'Para una fuerza constante de magnitud $F_0 = ' + v.F0 + '$ N aplicada sobre un resorte con $k = ' + v.k + '$ N/m, ¿cuánto vale la elongación estática $x_{\\text{est}} = F_0 / k$ en metros?'; },
      function (v) { return v.F0 / v.k; },
      'A frecuencia nula $\\omega = 0$, la respuesta estacionaria es puramente elástica: $x_p = F_0 / k$.',
      { unit: 'm',
        where: function (v) { return v.F0 % v.k !== 0; },
        mistakes: {
          mult: function (v) { return v.F0 * v.k; },
          inv: function (v) { return v.k / v.F0; }
        },
        feedback: [
          { when: 'mult', say: 'Casi: la deformación elástica es $F_0 / k$, no el producto de ambas.' },
          { when: 'inv', say: 'Casi: dividiste al revés; es fuerza dividida entre constante de elasticidad.' }
        ] }),

    N('fo-n-desfase-radianes', 'forzado', 2, { k: [20, 50, 10], m: [1, 2, 1], w: [2, 3, 1], c: [2, 6, 2] },
      function (v) { return 'Determina el ángulo de retraso $\\phi \\in [0, \\pi]$ en radianes para $m = ' + v.m + '$ kg, $k = ' + v.k + '$ N/m, $c = ' + v.c + '$ kg/s y fuerza a frecuencia $\\omega = ' + v.w + '$ rad/s.'; },
      function (v) { return Math.atan2(v.c * v.w, v.k - v.m * v.w * v.w); },
      'El desfase cumple $\\tan\\phi = (c\\omega) / (k - m\\omega^2)$, empleando la función arcotangente adecuada.',
      { unit: 'rad',
        where: function (v) { return Math.abs(v.k - v.m * v.w * v.w) >= 3; },
        mistakes: {
          grados: function (v) { return Math.atan2(v.c * v.w, v.k - v.m * v.w * v.w) * 180 / Math.PI; },
          inv: function (v) { return Math.atan2(v.k - v.m * v.w * v.w, v.c * v.w); }
        },
        feedback: [
          { when: 'grados', say: 'Casi: el resultado se pide expresado en radianes, no en grados.' },
          { when: 'inv', say: 'Casi: $\\tan\\phi = c\\omega / (k - m\\omega^2)$; invertiste numerador y denominador.' }
        ] }),

    N('fo-n-coef-a-coseno', 'forzado', 2, { F0: [20, 60, 10], k: [16, 36, 4], m: [1, 2, 1], w: [2, 3, 1], c: [2, 4, 1] },
      function (v) { return 'En la forma $x_p(t) = A\\cos(\\omega t) + B\\sin(\\omega t)$, halla el coeficiente $A$ (en metros) para $m = ' + v.m + '$, $c = ' + v.c + '$, $k = ' + v.k + '$, $F(t) = ' + v.F0 + '\\cos(' + v.w + 't)$.'; },
      function (v) { var a = v.k - v.m * v.w * v.w, b = v.c * v.w; return (v.F0 * a) / (a * a + b * b); },
      'Al sustituir en la EDO se deduce $A = F_0(k - m\\omega^2) / [(k - m\\omega^2)^2 + (c\\omega)^2]$.',
      { unit: 'm',
        where: function (v) { var a = v.k - v.m * v.w * v.w, b = v.c * v.w; return Math.abs(a) >= 4 && Math.abs((v.F0 * a) / (a * a + b * b)) >= 0.15; },
        mistakes: {
          senoCoef: function (v) { var a = v.k - v.m * v.w * v.w, b = v.c * v.w; return (v.F0 * b) / (a * a + b * b); },
          ampTotal: function (v) { var a = v.k - v.m * v.w * v.w, b = v.c * v.w; return v.F0 / Math.sqrt(a * a + b * b); }
        },
        feedback: [
          { when: 'senoCoef', say: 'Casi: ese es el coeficiente $B$ del seno; para el coseno se usa $(k - m\\omega^2)$ en el numerador.' },
          { when: 'ampTotal', say: 'Casi: esa es la amplitud total $X = \\sqrt{A^2 + B^2}$, no el coeficiente individual $A$.' }
        ] }),

    N('fo-n-coef-b-seno', 'forzado', 2, { F0: [15, 45, 10], k: [18, 38, 4], m: [1, 2, 1], w: [2, 4, 1], c: [2, 5, 1] },
      function (v) { return 'Para el mismo oscilador con $m = ' + v.m + '$, $c = ' + v.c + '$, $k = ' + v.k + '$, calcula el coeficiente $B$ de $\\sin(\\omega t)$ (en metros) con $F(t) = ' + v.F0 + '\\cos(' + v.w + 't)$.'; },
      function (v) { var a = v.k - v.m * v.w * v.w, b = v.c * v.w; return (v.F0 * b) / (a * a + b * b); },
      'El término en seno del estado estacionario es $B = F_0(c\\omega) / [(k - m\\omega^2)^2 + (c\\omega)^2]$.',
      { unit: 'm',
        where: function (v) { var a = v.k - v.m * v.w * v.w, b = v.c * v.w; return Math.abs(a) >= 4 && Math.abs((v.F0 * b) / (a * a + b * b)) >= 0.15; },
        mistakes: {
          cosCoef: function (v) { var a = v.k - v.m * v.w * v.w, b = v.c * v.w; return (v.F0 * a) / (a * a + b * b); },
          sinCuad: function (v) { return (v.F0 * v.c * v.w) / (v.k - v.m * v.w * v.w); }
        },
        feedback: [
          { when: 'cosCoef', say: 'Casi: ese es el coeficiente $A$ del coseno; para el seno el numerador lleva $c\\omega$.' },
          { when: 'sinCuad', say: 'Casi: el denominador común completo es $[(k - m\\omega^2)^2 + (c\\omega)^2]$.' }
        ] }),

    N('fo-n-desfase-resonancia-w0', 'forzado', 2, { k: [16, 64, 16], m: [1, 4, 1], c: [2, 6, 2] },
      function (v) { return 'Cuando la frecuencia de la fuerza coincide exactamente con la natural $\\omega = \\omega_0 = \\sqrt{k/m}$ ($k = ' + v.k + '$, $m = ' + v.m + '$), ¿cuántos radianes vale el desfase $\\phi$?'; },
      function (v) { return Math.PI / 2; },
      'En $\\omega = \\omega_0$, $k - m\\omega_0^2 = 0$. Luego $\\tan\\phi = c\\omega / 0 = +\\infty$, de modo que $\\phi = \\pi / 2$ rad.',
      { unit: 'rad',
        mistakes: {
          cero: function (v) { return 0; },
          piVal: function (v) { return Math.PI; }
        },
        feedback: [
          { when: 'cero', say: 'Casi: en $\\omega = \\omega_0$ el denominador de $\\tan\\phi$ se hace cero; la tangente diverge, dando $\\phi = \\pi/2$.' },
          { when: 'piVal', say: 'Casi: $\\pi$ radianes ocurre a frecuencias muy altas $\\omega \\gg \\omega_0$; en resonancia natural es $\\pi/2$.' }
        ] }),

    N('fo-n-potencia-media-disipada', 'forzado', 3, { c: [2, 6, 1], X: [0.4, 0.8, 0.2], w: [3, 6, 1] },
      function (v) { return 'La potencia disipada media en régimen estacionario es $P_{\\text{med}} = \\frac{1}{2}c\\,\\omega^2 X^2$. Con $c = ' + v.c + '$ kg/s, $X = ' + v.X + '$ m y $\\omega = ' + v.w + '$ rad/s, calcula $P_{\\text{med}}$ en watts.'; },
      function (v) { return 0.5 * v.c * v.w * v.w * v.X * v.X; },
      'Promediando $c(x\')^2 = c\\omega^2 X^2 \\sin^2(\\omega t - \\phi)$ a lo largo de un ciclo completo se obtiene $\\frac{1}{2}c\\omega^2 X^2$.',
      { unit: 'W',
        mistakes: {
          sinMedio: function (v) { return v.c * v.w * v.w * v.X * v.X; },
          sinCuadW: function (v) { return 0.5 * v.c * v.w * v.X * v.X; }
        },
        feedback: [
          { when: 'sinMedio', say: 'Casi: el promedio de $\\sin^2$ en un periodo completo es $1/2$; falta el factor $1/2$.' },
          { when: 'sinCuadW', say: 'Casi: la velocidad es proporcional a $\\omega$, por lo que la potencia depende de $\\omega^2$.' }
        ] }),

    N('fo-n-factor-amplificacion', 'forzado', 3, { k: [25, 45, 5], m: [1, 2, 1], w: [2, 4, 1], c: [2, 4, 1] },
      function (v) { return 'El factor dinámico de amplificación es $M = k / \\sqrt{(k - m\\omega^2)^2 + (c\\omega)^2}$. Calcúlalo para $k = ' + v.k + '$ N/m, $m = ' + v.m + '$ kg, $c = ' + v.c + '$ kg/s y $\\omega = ' + v.w + '$ rad/s.'; },
      function (v) { var t1 = v.k - v.m * v.w * v.w, t2 = v.c * v.w; return v.k / Math.sqrt(t1 * t1 + t2 * t2); },
      'El factor $M = X / x_{\\text{est}}$ expresa la amplificación de la respuesta dinámica frente a la deformación estática.',
      { where: function (v) { return Math.abs(v.k - v.m * v.w * v.w) >= 4; },
        mistakes: {
          sinK: function (v) { var t1 = v.k - v.m * v.w * v.w, t2 = v.c * v.w; return 1 / Math.sqrt(t1 * t1 + t2 * t2); },
          sinFric: function (v) { return v.k / Math.abs(v.k - v.m * v.w * v.w); }
        },
        feedback: [
          { when: 'sinK', say: 'Casi: $M$ es adimensional y compara con $x_{\\text{est}} = F_0/k$, llevando $k$ en el numerador.' },
          { when: 'sinFric', say: 'Casi: debes considerar la fricción $(c\\omega)^2$ dentro de la raíz del denominador.' }
        ] }),

    N('fo-n-transitorio-tiempo-99', 'forzado', 3, { gamma: [0.5, 2, 0.5] },
      function (v) { return 'El transitorio decae según la envolvente $e^{-' + v.gamma + 't}$. ¿Cuántos segundos tarda en atenuarse al 1 % de su valor inicial ($e^{-\\gamma t} = 0.01$)?'; },
      function (v) { return Math.log(100) / v.gamma; },
      'De $e^{-\\gamma t} = 0.01$, se obtiene $-\\gamma t = -\\ln(100) \\implies t = \\ln(100) / \\gamma$.',
      { unit: 's',
        mistakes: {
          logDiez: function (v) { return Math.log(10) / v.gamma; },
          tau: function (v) { return 1 / v.gamma; }
        },
        feedback: [
          { when: 'logDiez', say: 'Casi: para el 1 % se requiere un factor de $1/100$, correspondiente a $\\ln(100) \\approx 4.605$.' },
          { when: 'tau', say: 'Casi: $1/\\gamma$ reduce la función solo al $37\\%$; para alcanzar el $1\\%$ toma unos $4.6/\\gamma$.' }
        ] }),

    N('fo-n-amplitud-sin-friccion', 'forzado', 2, { F0: [8, 32, 8], m: [1, 2, 1], k: [50, 100, 25], w: [3, 5, 1] },
      function (v) { return 'Para un resorte sin fricción ($c = 0$) excitado con $m = ' + v.m + '$ kg, $k = ' + v.k + '$ N/m, $\\omega = ' + v.w + '$ rad/s y $F_0 = ' + v.F0 + '$ N, calcula la amplitud del estado estacionario en metros.'; },
      function (v) { return v.F0 / Math.abs(v.k - v.m * v.w * v.w); },
      'Con $c = 0$ la amplitud particular estacionaria es $X = F_0 / |k - m\\omega^2|$.',
      { unit: 'm',
        where: function (v) { return Math.abs(v.k - v.m * v.w * v.w) >= 5; } }),

    /* =====================================================================
       5. Resonancia y curvas de amplitud (14 preguntas: 4 D1, 7 D2, 3 D3)
       ===================================================================== */
    C('re-c-def-resonancia-pura', 'resonancia', 1,
      '¿Qué ocurre en un oscilador sin amortiguamiento ($c = 0$) cuando la frecuencia externa coincide con la frecuencia natural ($\\omega = \\omega_0$)?',
      'Ocurre resonancia pura: la amplitud crece linealmente con el tiempo ($x_p \\propto t\\sin\\omega_0 t$) sin cota teórica',
      [['La masa se inmoviliza porque la fuerza externa y el resorte se anulan', 'Casi: la fuerza alimenta energía en sincronía exacta en cada ciclo, incrementando la amplitud.'],
       ['La vibración se extingue abruptamente por conservación del momento', 'Casi: al no haber disipación, la energía transferida se acumula sin disiparse.'],
       ['La solución estacionaria se mantiene acotada con amplitud finita $F_0 / (2k)$', 'Casi: el denominador $(k - m\\omega^2)$ se anula, destruyendo la solución periódica acotada.']],
      'Al coincidir $\\omega$ con la frecuencia natural, el método de coeficientes indeterminados produce la respuesta no acotada $(F_0 t / 2m\\omega_0)\\sin\\omega_0 t$.'),

    C('re-c-frec-pico-amort', 'resonancia', 1,
      'En presencia de amortiguamiento viscoso ($c > 0$), ¿dónde se localiza la frecuencia $\\omega_{\\text{res}}$ que maximiza la amplitud estacionaria?',
      'En una frecuencia menor que la natural: $\\omega_{\\text{res}} = \\sqrt{\\omega_0^2 - c^2/(2m^2)}$',
      [['Exactamente en la frecuencia natural $\\omega_0 = \\sqrt{k/m}$ siempre', 'Casi: el término de amortiguamiento en el denominador desplaza el pico hacia una frecuencia menor.'],
       ['En una frecuencia estrictamente mayor que $\\omega_0$', 'Casi: el mínimo del radicando $(k - m\\omega^2)^2 + (c\\omega)^2$ se sitúa por debajo de $\\omega_0$.'],
       ['En el doble de la frecuencia natural $2\\omega_0$', 'Casi: la frecuencia resonante está siempre cercana y por debajo de $\\omega_0$.']],
      'Derivando el denominador de la amplitud respecto a $\\omega^2$, el mínimo ocurre en $\\omega_{\\text{res}}^2 = k/m - c^2/(2m^2)$.'),

    C('re-c-condicion-existencia-pico', 'resonancia', 2,
      '¿Bajo qué condición sobre los parámetros mecánicos existe un pico de resonancia en amplitud a frecuencia no nula en el sistema amortiguado?',
      'Solo si el amortiguamiento es moderado: $c^2 < 2mk$',
      [['Para cualquier valor de $c$ siempre existe un pico definido', 'Casi: si $c^2 \\ge 2mk$ la amplitud decrece monótonamente para todo $\\omega > 0$.'],
       ['Solo si el sistema está sobreamortiguado ($c^2 > 4mk$)', 'Casi: en el sobreamortiguamiento no existe resonancia alguna; la amplitud cae continuamente desde $\\omega = 0$.'],
       ['Únicamente si no hay rozamiento alguno ($c = 0$)', 'Casi: con $0 < c^2 < 2mk$ sí existe un pico bien definido de amplitud finita.']],
      'Para que $\\omega_{\\text{res}}^2 = k/m - c^2/(2m^2) > 0$, se requiere $c^2 < 2mk$. Si $c^2 \\ge 2mk$, el valor máximo se ubica en $\\omega = 0$.'),

    C('re-c-ancho-banda-q', 'resonancia', 2,
      '¿Cómo incide una reducción en el coeficiente de amortiguamiento $c$ sobre la curva de resonancia (amplitud vs $\\omega$)?',
      'El pico se vuelve más alto y angosto (mayor agudeza y selectividad)',
      [['El pico se aplana y se ensancha horizontalmente', 'Casi: el aplanamiento ocurre al aumentar $c$; con menor fricción el pico es mucho más agudo.'],
       ['El pico se desplaza indefinidamente hacia frecuencias infinitas', 'Casi: cuando $c \\to 0$, la frecuencia de resonancia converge a $\\omega_0$.'],
       ['La altura del pico permanece fija pero el ancho cambia', 'Casi: en resonancia la amplitud es $F_0 / (c\\beta)$, tendiendo a infinito al anularse $c$.']],
      'Con menor fricción, se reduce la energía disipada y se eleva la ganancia en el pico, aumentando el factor de calidad $Q = m\\omega_0 / c$.'),

    C('re-c-peligro-ingenieria', 'resonancia', 1,
      'En estructuras de ingeniería civil o mecánica (puentes, alas o edificios), ¿por qué es crucial prevenir la resonancia?',
      'Porque excitaciones periódicas pequeñas pueden amplificarse drásticamente, provocando deformaciones destructivas',
      [['Porque la resonancia hace que la masa del sistema crezca sin control', 'Casi: la masa permanece invariante; lo que se amplifica con violencia es la amplitud y aceleración.'],
       ['Porque la resonancia destruye la rigidez del material volviéndolo líquido', 'Casi: las fuerzas internas superan el límite de fluencia y rotura por sobretensión.'],
       ['Porque el periodo de vibración colapsa a cero de inmediato', 'Casi: el periodo se mantiene fijo al de la excitación; el riesgo radica en la amplitud.']],
      'Cerca de $\\omega_0$, la amplificación dinámica induce esfuerzos mecánicos que pueden sobrepasar los límites de diseño estructural.'),

    C('re-c-diferencia-beta-wres', 'resonancia', 2,
      'En un oscilador subamortiguado, ¿cuál es el orden correcto entre la frecuencia de resonancia $\\omega_{\\text{res}}$, la cuasi-frecuencia libre $\\beta$ y la natural $\\omega_0$?',
      '$\\omega_{\\text{res}} < \\beta < \\omega_0$',
      [['$\\omega_0 < \\beta < \\omega_{\\text{res}}$', 'Casi: $\\omega_0$ es la mayor; la amortiguación reduce tanto la frecuencia libre como la resonante.'],
       ['$\\beta < \\omega_{\\text{res}} < \\omega_0$', 'Casi: $\\beta^2 = \\omega_0^2 - c^2/(4m^2)$ mientras $\\omega_{\\text{res}}^2 = \\omega_0^2 - c^2/(2m^2)$; al restar el doble, $\\omega_{\\text{res}} < \\beta$.'],
       ['Las tres frecuencias son numéricamente iguales siempre', 'Casi: solo coinciden si $c = 0$; con $c > 0$ se separan según los coeficientes $1/4$ y $1/2$.']],
      'Como $\\omega_0^2$ no resta nada, $\\beta^2$ resta $\\frac{c^2}{4m^2}$ y $\\omega_{\\text{res}}^2$ resta $\\frac{c^2}{2m^2}$, se tiene $\\omega_{\\text{res}} < \\beta < \\omega_0$.'),

    N('re-n-wres-calculo', 'resonancia', 2, { m: [1, 2, 1], k: [50, 100, 25], c: [2, 6, 2] },
      function (v) { return 'Calcula la frecuencia de resonancia en amplitud $\\omega_{\\text{res}} = \\sqrt{k/m - c^2/(2m^2)}$ en rad/s para $m = ' + v.m + '$ kg, $k = ' + v.k + '$ N/m y $c = ' + v.c + '$ kg/s.'; },
      function (v) { var w02 = v.k / v.m, red = (v.c * v.c) / (2 * v.m * v.m); return Math.sqrt(w02 - red); },
      'La frecuencia donde la amplitud del oscilador forzado es máxima es $\\omega_{\\text{res}} = \\sqrt{\\omega_0^2 - c^2/(2m^2)}$.',
      { unit: 'rad/s',
        where: function (v) { return v.k / v.m > (v.c * v.c) / (2 * v.m * v.m) + 2; },
        mistakes: {
          w0: function (v) { return Math.sqrt(v.k / v.m); },
          betaVal: function (v) { var w02 = v.k / v.m, red = (v.c * v.c) / (4 * v.m * v.m); return Math.sqrt(w02 - red); }
        },
        feedback: [
          { when: 'w0', say: 'Casi: esa es la frecuencia natural $\\omega_0$; con fricción el pico ocurre en $\\sqrt{\\omega_0^2 - c^2/(2m^2)}$.' },
          { when: 'betaVal', say: 'Casi: esa es la cuasi-frecuencia $\\beta$ (que resta $c^2/4m^2$); la frecuencia de pico resta $c^2/2m^2$.' }
        ] }),

    N('re-n-amplitud-pico-max', 'resonancia', 2, { F0: [10, 40, 10], m: [1, 2, 1], k: [32, 72, 8], c: [2, 4, 1] },
      function (v) { return 'La amplitud de pico es $X_{\\max} = \\frac{F_0}{c\\sqrt{k/m - c^2/(4m^2)}}$. Calcúlala en metros para $F_0 = ' + v.F0 + '$ N, $m = ' + v.m + '$ kg, $k = ' + v.k + '$ N/m y $c = ' + v.c + '$ kg/s.'; },
      function (v) { var beta = Math.sqrt(v.k / v.m - (v.c * v.c) / (4 * v.m * v.m)); return v.F0 / (v.c * beta); },
      'Evaluando la amplitud en $\\omega_{\\text{res}}$, el valor pico máximo alcanzable es exactamente $F_0 / (c\\beta)$.',
      { unit: 'm',
        where: function (v) { return v.k / v.m > (v.c * v.c) / (4 * v.m * v.m) + 2; },
        mistakes: {
          aprox: function (v) { return v.F0 / (v.c * Math.sqrt(v.k / v.m)); },
          sinC: function (v) { var beta = Math.sqrt(v.k / v.m - (v.c * v.c) / (4 * v.m * v.m)); return v.F0 / beta; }
        },
        feedback: [
          { when: 'aprox', say: 'Casi: esa es la aproximación para amortiguamiento casi nulo $F_0 / (c\\omega_0)$; la fórmula exacta usa $\\beta$.' },
          { when: 'sinC', say: 'Casi: el denominador debe incluir la constante de amortiguamiento $c$.' }
        ] }),

    N('re-n-cmax-para-pico', 'resonancia', 1, { m: [1, 3, 1], k: [18, 50, 4] },
      function (v) { return '¿Cuál es el valor límite superior de $c$ (en kg/s) para que aún exista pico de resonancia a frecuencia no nula ($c_{\\text{pico}} = \\sqrt{2mk}$)? Usa $m = ' + v.m + '$ kg y $k = ' + v.k + '$ N/m.'; },
      function (v) { return Math.sqrt(2 * v.m * v.k); },
      'El pico existe si $\\omega_{\\text{res}}^2 = k/m - c^2/(2m^2) > 0$, lo que exige $c < \\sqrt{2mk}$.',
      { unit: 'kg/s',
        mistakes: {
          ccrit: function (v) { return 2 * Math.sqrt(v.m * v.k); },
          sinDos: function (v) { return Math.sqrt(v.m * v.k); }
        },
        feedback: [
          { when: 'ccrit', say: 'Casi: ese es el amortiguamiento crítico $2\\sqrt{mk}$; el límite para pico de resonancia es $\\sqrt{2mk}$.' },
          { when: 'sinDos', say: 'Casi: la condición cuadrática es $c^2 < 2mk$, llevando factor 2 dentro de la raíz.' }
        ] }),

    N('re-n-factor-q-calidad', 'resonancia', 2, { m: [1, 2, 1], k: [40, 160, 40], c: [2, 4, 1] },
      function (v) { return 'El factor de calidad de un oscilador es $Q = \\sqrt{mk}/c$. Determina el valor adimensional de $Q$ para $m = ' + v.m + '$ kg, $k = ' + v.k + '$ N/m y $c = ' + v.c + '$ kg/s.'; },
      function (v) { return Math.sqrt(v.m * v.k) / v.c; },
      'El factor de calidad $Q = m\\omega_0 / c = \\sqrt{mk} / c$ mide la agudeza de la curva de resonancia.',
      { mistakes: {
          multC: function (v) { return Math.sqrt(v.m * v.k) * v.c; },
          cuad: function (v) { return (v.m * v.k) / (v.c * v.c); }
        },
        feedback: [
          { when: 'multC', say: 'Casi: a mayor amortiguamiento la calidad decae; $c$ divide: $\\sqrt{mk}/c$.' },
          { when: 'cuad', say: 'Casi: ese valor es $Q^2$; te faltó sacar la raíz cuadrada.' }
        ] }),

    N('re-n-pico-resonancia-pura-t', 'resonancia', 2, { F0: [4, 16, 4], m: [1, 2, 1], w0: [2, 5, 1], t: [5, 15, 5] },
      function (v) { return 'En resonancia pura sin fricción $x\'\' + ' + (v.w0 * v.w0) + 'x = \\frac{' + v.F0 + '}{' + v.m + '}\\cos(' + v.w0 + 't)$, la envolvente crece como $A(t) = \\frac{F_0}{2m\\omega_0} t$. Calcula $A(' + v.t + ')$ en metros.'; },
      function (v) { return (v.F0 * v.t) / (2 * v.m * v.w0); },
      'La solución particular es $x_p(t) = \\frac{F_0 t}{2m\\omega_0}\\sin\\omega_0 t$, cuya amplitud instantánea crece como $\\frac{F_0 t}{2m\\omega_0}$.',
      { unit: 'm',
        mistakes: {
          sinDos: function (v) { return (v.F0 * v.t) / (v.m * v.w0); },
          multW0: function (v) { return (v.F0 * v.w0 * v.t) / (2 * v.m); }
        },
        feedback: [
          { when: 'sinDos', say: 'Casi: la derivada del producto aporta un factor 2 en los coeficientes: $A(t) = F_0 t / (2m\\omega_0)$.' },
          { when: 'multW0', say: 'Casi: la frecuencia $\\omega_0$ divide en el denominador.' }
        ] }),

    N('re-n-frec-mitad-potencia', 'resonancia', 3, { w0: [10, 30, 5], gamma: [1, 3, 1] },
      function (v) { return 'Para un oscilador con $\\omega_0 = ' + v.w0 + '$ rad/s y atenuación $\\gamma = ' + v.gamma + '\\ \\text{s}^{-1}$, el ancho de banda a mitad de potencia es $\\Delta\\omega \\approx 2\\gamma$. Calcula $\\Delta\\omega$ en rad/s.'; },
      function (v) { return 2 * v.gamma; },
      'El ancho de banda entre los dos puntos donde la potencia media cae a la mitad es $\\Delta\\omega = 2\\gamma = c/m$.',
      { unit: 'rad/s',
        mistakes: {
          unGamma: function (v) { return v.gamma; },
          cuatroG: function (v) { return 4 * v.gamma; }
        },
        feedback: [
          { when: 'unGamma', say: 'Casi: el ancho de banda completo entre ambos puntos de media potencia es $2\\gamma$, no $\\gamma$.' },
          { when: 'cuatroG', say: 'Casi: el ancho de banda estándar es $2\\gamma = c/m$.' }
        ] }),

    N('re-n-amp-resonancia-w0', 'resonancia', 3, { F0: [12, 36, 6], c: [2, 6, 1], m: [1, 3, 1], k: [16, 48, 16] },
      function (v) { return 'Calcula la amplitud estacionaria $X$ (en metros) cuando se excita a la frecuencia natural $\\omega = \\sqrt{k/m}$ ($k = ' + v.k + '$ N/m, $m = ' + v.m + '$ kg, $c = ' + v.c + '$ kg/s, $F_0 = ' + v.F0 + '$ N).'; },
      function (v) { var w0 = Math.sqrt(v.k / v.m); return v.F0 / (v.c * w0); },
      'En $\\omega = \\omega_0$, $k - m\\omega_0^2 = 0$, resultando $X = F_0 / (c\\omega_0)$.',
      { unit: 'm',
        mistakes: {
          sinW0: function (v) { return v.F0 / v.c; },
          multW0: function (v) { var w0 = Math.sqrt(v.k / v.m); return (v.F0 * w0) / v.c; }
        },
        feedback: [
          { when: 'sinW0', say: 'Casi: en el denominador la fuerza viscosa depende de la rapidez: $c\\omega_0$.' },
          { when: 'multW0', say: 'Casi: $\\omega_0$ divide en la expresión de amplitud: $F_0 / (c\\omega_0)$.' }
        ] }),

    N('re-n-desfase-muy-alta-frec', 'resonancia', 3, { w: [50, 100, 10], w0: [4, 8, 2], c: [1, 3, 1], m: [1, 2, 1] },
      function (v) { return 'Calcula el ángulo de desfase $\\phi$ (en radianes) para alta frecuencia $\\omega = ' + v.w + '$ rad/s con $m = ' + v.m + '$ kg, $k = ' + (v.m * v.w0 * v.w0) + '$ N/m y $c = ' + v.c + '$ kg/s.'; },
      function (v) { var k = v.m * v.w0 * v.w0; return Math.atan2(v.c * v.w, k - v.m * v.w * v.w); },
      'Con $\\omega \\gg \\omega_0$, $k - m\\omega^2 < 0$. El desfase se encuentra en el segundo cuadrante, aproximándose asintóticamente a $\\pi$.',
      { unit: 'rad' }),

    /* =====================================================================
       6. Circuitos RLC en serie (15 preguntas: 5 D1, 7 D2, 3 D3)
       ===================================================================== */
    C('rl-c-analogia-variable', 'rlc', 1,
      'En la correspondencia formal entre el oscilador mecánico y el circuito RLC serie, ¿qué magnitud eléctrica representa a la velocidad mecánica $v(t) = x\'(t)$?',
      'La corriente eléctrica $i(t) = q\'(t)$ que circula por la malla',
      [['La carga eléctrica $q(t)$ acumulada en el capacitor', 'Casi: la carga $q(t)$ es la posición eléctrica, análoga al desplazamiento $x(t)$.'],
       ['El potencial $E(t)$ suministrado por la fuente', 'Casi: la fuerza electromotriz $E(t)$ equivale a la fuerza mecánica motriz $F(t)$.'],
       ['La resistencia eléctrica $R$', 'Casi: la resistencia eléctrica disipa calor, siendo el análogo del amortiguador viscoso $c$.']],
      'La corriente eléctrica es la tasa de flujo de carga: $i = dq/dt$, análoga directa de la velocidad $v = dx/dt$.'),

    C('rl-c-regimen-critico-cond', 'rlc', 1,
      'Para un circuito RLC en serie con inductancia $L$ y capacitancia $C$, ¿cuál es la resistencia crítica $R_{\\text{crit}}$ que divide el régimen oscilatorio del no oscilatorio?',
      '$R_{\\text{crit}} = 2\\sqrt{L/C}$',
      [['$R_{\\text{crit}} = \\sqrt{L/C}$', 'Casi: de $L r^2 + R r + 1/C = 0$ el discriminante es $R^2 - 4L/C = 0$, dando $R = 2\\sqrt{L/C}$.'],
       ['$R_{\\text{crit}} = \\frac{1}{2}\\sqrt{L/C}$', 'Casi: el factor 2 multiplica a la raíz, no va en el denominador.'],
       ['$R_{\\text{crit}} = 2\\sqrt{LC}$', 'Casi: en el circuito la rigidez elástica es $1/C$, dando $2\\sqrt{L(1/C)} = 2\\sqrt{L/C}$.']],
      'Sustituyendo $m \\leftrightarrow L$ y $k \\leftrightarrow 1/C$ en $c_{\\text{crit}} = 2\\sqrt{mk}$ se deduce $R_{\\text{crit}} = 2\\sqrt{L/C}$.'),

    C('rl-c-carga-estacionaria-dc', 'rlc', 1,
      'Si se conecta un circuito RLC en serie a una batería de corriente directa con voltaje constante $\\mathcal{E}$, ¿cuál es la carga final en el capacitor en estado estacionario?',
      '$q_p = C\\mathcal{E}$',
      [['$q_p = \\mathcal{E} / R$', 'Casi: $\\mathcal{E}/R$ es una corriente; en régimen permanente continuo el capacitor cargado actúa como circuito abierto ($i = 0$).'],
       ['$q_p = \\mathcal{E} / (L C)$', 'Casi: en corriente continua la caída inductiva es nula ($L di/dt = 0$), toda la fem recae en el capacitor: $q/C = \\mathcal{E}$.'],
       ['$q_p = 0$, porque la resistencia consume la carga', 'Casi: la batería mantiene cargado permanentemente al capacitor con voltaje $v_C = \\mathcal{E}$.']],
      'En estado estacionario continuo $i = q\' = 0$ y $q\'\' = 0$, dejando $q/C = \\mathcal{E} \\implies q_p = C\\mathcal{E}$.'),

    C('rl-c-sobreimpulso-rlc', 'rlc', 2,
      '¿Por qué en un circuito RLC subamortiguado que se conecta a una batería la carga puede superar transitoriamente el valor final $C\\mathcal{E}$ (sobreimpulso)?',
      'Porque la bobina tiene inercia eléctrica (mantiene la corriente fluyendo aún después de que el capacitor alcanza $C\\mathcal{E}$)',
      [['Porque el capacitor crea carga adicional por efecto capacitivo anómalo', 'Casi: no hay creación de carga; la inductancia almacena energía magnética que continúa inyectando carga.'],
       ['Porque la resistencia invierte su polaridad temporalmente', 'Casi: la resistencia siempre es un componente pasivo y disipativo.'],
       ['Porque la ley de Kirchhoff deja de cumplirse en el transitorio', 'Casi: la ley de Kirchhoff se cumple rigurosamente en todo instante de tiempo.']],
      'La energía almacenada en el campo magnético del inductor $\\frac{1}{2}L i^2$ continúa empujando corriente hacia el capacitor tras igualar la fem.'),

    C('rl-c-impedancia-ac', 'rlc', 2,
      'En un circuito RLC serie excitado con voltaje alterno $E(t) = E_0\\cos\\omega t$, la oposición total a la corriente (impedancia $Z$) se minimiza cuando…',
      'La frecuencia es $\\omega = 1/\\sqrt{LC}$, anulándose mutuamente las reactancias del inductor y del capacitor',
      [['La frecuencia tiende a cero (corriente continua)', 'Casi: a frecuencia cero el capacitor tiene reactancia infinita ($X_C \\to \\infty$), bloqueando la corriente.'],
       ['La frecuencia tiende a infinito', 'Casi: a frecuencia infinita la reactancia inductiva se hace infinita ($X_L = \\omega L \\to \\infty$).'],
       ['La resistencia supera a la inductancia crítica', 'Casi: el mínimo de impedancia ocurre en resonancia independientemente del valor de $R$, donde $Z = R$.']],
      'La impedancia es $Z = \\sqrt{R^2 + (\\omega L - 1/(\\omega C))^2}$, cuyo mínimo absoluto es $Z_{\\min} = R$ cuando $\\omega = 1/\\sqrt{LC}$.'),

    N('rl-n-w0-circuito', 'rlc', 1, { L: [1, 4, 1], C_uF: [25, 100, 25] },
      function (v) { return 'Determina la frecuencia angular natural $\\omega_0$ (en rad/s) de un circuito LC sin resistencia con $L = ' + v.L + '$ H y $C = ' + v.C_uF + '\\ \\mu\\text{F}$ ($' + v.C_uF + '\\times 10^{-6}\\ \\text{F}$).'; },
      function (v) { var C = v.C_uF * 1e-6; return 1 / Math.sqrt(v.L * C); },
      'La frecuencia angular de resonancia natural del circuito LC es $\\omega_0 = 1 / \\sqrt{LC}$.',
      { unit: 'rad/s',
        mistakes: {
          noMicro: function (v) { return 1 / Math.sqrt(v.L * v.C_uF); },
          multSqrt: function (v) { var C = v.C_uF * 1e-6; return Math.sqrt(v.L * C); }
        },
        feedback: [
          { when: 'noMicro', say: 'Casi: olvidaste convertir microfaradios a faradios ($1\\ \\mu\\text{F} = 10^{-6}\\ \\text{F}$).' },
          { when: 'multSqrt', say: 'Casi: la frecuencia angular natural es el recíproco de la raíz: $\\omega_0 = 1/\\sqrt{LC}$.' }
        ] }),

    N('rl-n-rcrit-calculo', 'rlc', 1, { L: [1, 4, 1], C_mF: [1, 4, 1] },
      function (v) { return 'Para un circuito RLC con $L = ' + v.L + '$ H y $C = ' + v.C_mF + '\\ \\text{mF}$ ($' + v.C_mF + '\\times 10^{-3}\\ \\text{F}$), calcula la resistencia crítica $R_{\\text{crit}} = 2\\sqrt{L/C}$ en ohms.'; },
      function (v) { var C = v.C_mF * 1e-3; return 2 * Math.sqrt(v.L / C); },
      'La resistencia crítica que separa el comportamiento oscilatorio del aperiódico es $R_{\\text{crit}} = 2\\sqrt{L/C}$.',
      { unit: 'Ω',
        mistakes: {
          sinDos: function (v) { var C = v.C_mF * 1e-3; return Math.sqrt(v.L / C); },
          noMilli: function (v) { return 2 * Math.sqrt(v.L / v.C_mF); }
        },
        feedback: [
          { when: 'sinDos', say: 'Casi: te faltó el factor 2 en la expresión crítica: $R_{\\text{crit}} = 2\\sqrt{L/C}$.' },
          { when: 'noMilli', say: 'Casi: convierte milifaradios a faradios ($10^{-3}\\ \\text{F}$).' }
        ] }),

    N('rl-n-cuasifrec-beta-rlc', 'rlc', 2, { L: [1, 2, 1], R: [10, 40, 10], C_uF: [50, 100, 50] },
      function (v) { return 'Un RLC serie tiene $L = ' + v.L + '$ H, $R = ' + v.R + '\\ \\Omega$ y $C = ' + v.C_uF + '\\ \\mu\\text{F}$. Calcula la frecuencia amortiguada de oscilación de la carga $\\beta = \\sqrt{1/(LC) - R^2/(4L^2)}$ en rad/s.'; },
      function (v) { var C = v.C_uF * 1e-6, w02 = 1 / (v.L * C), gamma = v.R / (2 * v.L); return Math.sqrt(w02 - gamma * gamma); },
      'La frecuencia angular amortiguada de oscilación es $\\beta = \\sqrt{1/(LC) - (R/2L)^2}$.',
      { unit: 'rad/s',
        where: function (v) { var C = v.C_uF * 1e-6; return 1 / (v.L * C) > Math.pow(v.R / (2 * v.L), 2) * 1.5; } }),

    N('rl-n-carga-final-dc', 'rlc', 2, { E0: [12, 48, 12], C_uF: [20, 100, 20] },
      function (v) { return 'Una fuente directa de $' + v.E0 + '$ V se conecta a un RLC serie con $C = ' + v.C_uF + '\\ \\mu\\text{F}$. ¿Cuántos microcoulombs ($\\\\mu\\text{C}$) de carga almacena en estado estacionario?'; },
      function (v) { return v.C_uF * v.E0; },
      'En estado estacionario con corriente continua $q = C\\mathcal{E}$; en microfaradios por voltios resulta directamente en microcoulombs.',
      { unit: 'µC',
        mistakes: {
          div: function (v) { return v.E0 / v.C_uF; },
          medio: function (v) { return 0.5 * v.C_uF * v.E0; }
        },
        feedback: [
          { when: 'div', say: 'Casi: la relación de carga en el capacitor es $q = C V$, no $V/C$.' },
          { when: 'medio', say: 'Casi: no lleva factor $1/2$; la carga final en corriente directa es directamente $C\\mathcal{E}$.' }
        ] }),

    N('rl-n-atenuacion-rlc-gamma', 'rlc', 2, { R: [20, 80, 20], L: [1, 4, 1] },
      function (v) { return 'Calcula el coeficiente de decaimiento exponencial $\\gamma = R/(2L)$ en $\\text{s}^{-1}$ para las corrientes transitorias con $R = ' + v.R + '\\ \\Omega$ y $L = ' + v.L + '$ H.'; },
      function (v) { return v.R / (2 * v.L); },
      'Las oscilaciones transitorias decaen con la envolvente $e^{-\\gamma t}$, donde $\\gamma = R / (2L)$.',
      { unit: 's⁻¹',
        where: function (v) { return v.R % (2 * v.L) === 0; },
        mistakes: {
          sinDos: function (v) { return v.R / v.L; },
          multDos: function (v) { return (2 * v.R) / v.L; }
        },
        feedback: [
          { when: 'sinDos', say: 'Casi: en la ecuación característica el término lineal es $R/L$, por lo que la raíz lleva $-R/(2L)$; divide entre 2.' },
          { when: 'multDos', say: 'Casi: el factor 2 va en el denominador: $\\gamma = R/(2L)$.' }
        ] }),

    N('rl-n-impedancia-calculo', 'rlc', 2, { R: [30, 80, 10], wL: [40, 100, 20], wC_inv: [10, 40, 10] },
      function (v) { return 'En un RLC serie a cierta frecuencia, $R = ' + v.R + '\\ \\Omega$, la reactancia inductiva es $X_L = ' + v.wL + '\\ \\Omega$ y la capacitiva es $X_C = ' + v.wC_inv + '\\ \\Omega$. Calcula la impedancia $Z = \\sqrt{R^2 + (X_L - X_C)^2}$ en ohms.'; },
      function (v) { var X = v.wL - v.wC_inv; return Math.sqrt(v.R * v.R + X * X); },
      'La impedancia de la malla serie es la suma fasorial $Z = \\sqrt{R^2 + (X_L - X_C)^2}$.',
      { unit: 'Ω',
        where: function (v) { return v.wL !== v.wC_inv; },
        mistakes: {
          sumaX: function (v) { var X = v.wL + v.wC_inv; return Math.sqrt(v.R * v.R + X * X); },
          lineal: function (v) { return v.R + Math.abs(v.wL - v.wC_inv); }
        },
        feedback: [
          { when: 'sumaX', say: 'Casi: las reactancias de bobina y capacitor están en oposición de fase y se restan: $(X_L - X_C)$.' },
          { when: 'lineal', say: 'Casi: la impedancia se calcula con Pitágoras por el desfase de $90^\\circ$ entre resistencia y reactancia.' }
        ] }),

    N('rl-n-corriente-amplitud-ac', 'rlc', 2, { E0: [60, 180, 20], R: [30, 60, 10], X: [40, 80, 10] },
      function (v) { return 'Una fuente $E(t) = ' + v.E0 + '\\cos\\omega t$ V se aplica a un RLC serie con impedancia $Z = \\sqrt{' + v.R + '^2 + ' + v.X + '^2}\\ \\Omega$. Calcula la amplitud de la corriente estacionaria $I_0 = E_0 / Z$ en amperes.'; },
      function (v) { var Z = Math.sqrt(v.R * v.R + v.X * v.X); return v.E0 / Z; },
      'Por la ley de Ohm en corriente alterna, la corriente pico es $I_0 = E_0 / Z$.',
      { unit: 'A',
        mistakes: {
          soloR: function (v) { return v.E0 / v.R; },
          multZ: function (v) { var Z = Math.sqrt(v.R * v.R + v.X * v.X); return v.E0 * Z; }
        },
        feedback: [
          { when: 'soloR', say: 'Casi: esa sería la corriente en resonancia exacta; fuera de ella la oposición total es la impedancia $Z$.' },
          { when: 'multZ', say: 'Casi: la corriente es voltaje sobre impedancia: $I_0 = E_0 / Z$.' }
        ] }),

    N('rl-n-energia-bobina-corriente', 'rlc', 3, { L: [2, 8, 1], I: [1.5, 4.5, 0.5] },
      function (v) { return 'Cuando la corriente en un RLC alcanza un valor instantáneo de $' + v.I + '$ A, ¿cuántos joules de energía magnética almacena la inductancia $L = ' + v.L + '$ H ($U_L = \\frac{1}{2}L i^2$)?'; },
      function (v) { return 0.5 * v.L * v.I * v.I; },
      'La energía en el campo magnético del inductor es $U_L = \\frac{1}{2}L i^2$.',
      { unit: 'J',
        mistakes: {
          sinMedio: function (v) { return v.L * v.I * v.I; },
          sinCuad: function (v) { return 0.5 * v.L * v.I; }
        },
        feedback: [
          { when: 'sinMedio', say: 'Casi: la energía magnética de un inductor lleva el factor $1/2$: $U_L = \\frac{1}{2}L i^2$.' },
          { when: 'sinCuad', say: 'Casi: la corriente debe estar elevada al cuadrado.' }
        ] }),

    N('rl-n-energia-capacitor-carga', 'rlc', 3, { C_uF: [10, 40, 10], q_mC: [2, 6, 1] },
      function (v) { return 'Un capacitor de $' + v.C_uF + '\\ \\mu\\text{F}$ en un RLC tiene una carga instantánea de $' + v.q_mC + '$ mC ($' + v.q_mC + '\\times 10^{-3}\\ \\text{C}$). Calcula la energía electrostática $U_C = \\frac{q^2}{2C}$ en joules.'; },
      function (v) { var q = v.q_mC * 1e-3, C = v.C_uF * 1e-6; return (q * q) / (2 * C); },
      'La energía electrostática almacenada en el campo eléctrico del capacitor es $U_C = q^2 / (2C)$.',
      { unit: 'J',
        mistakes: {
          sinMedio: function (v) { var q = v.q_mC * 1e-3, C = v.C_uF * 1e-6; return (q * q) / C; },
          noMicro: function (v) { var q = v.q_mC * 1e-3; return (q * q) / (2 * v.C_uF); }
        },
        feedback: [
          { when: 'sinMedio', say: 'Casi: la energía potencial electrostática lleva factor 2 en el denominador: $q^2/(2C)$.' },
          { when: 'noMicro', say: 'Casi: debes convertir los microfaradios a faradios ($10^{-6}\\ \\text{F}$).' }
        ] }),

    N('rl-n-sobretiro-carga-max', 'rlc', 3, { E0: [10, 30, 10], C_uF: [10, 50, 10], gamma: [2, 6, 2], beta: [10, 20, 5] },
      function (v) { return 'Al cargar un RLC subamortiguado en reposo, el primer pico máximo de carga ocurre en $t = \\pi/\\beta$ y vale $q_{\\max} = C\\mathcal{E}(1 + e^{-\\gamma\\pi/\\beta})$. Con $\\mathcal{E} = ' + v.E0 + '$ V, $C = ' + v.C_uF + '\\ \\mu\\text{F}$, $\\gamma = ' + v.gamma + '$ y $\\beta = ' + v.beta + '$, calcula $q_{\\max}$ en $\\mu\\text{C}$.'; },
      function (v) { return (v.C_uF * v.E0) * (1 + Math.exp(-v.gamma * Math.PI / v.beta)); },
      'Sustituyendo el primer tiempo de máximo $t_1 = \\pi/\\beta$ en la solución analítica de carga.',
      { unit: 'µC',
        mistakes: {
          soloFinal: function (v) { return v.C_uF * v.E0; },
          restaExp: function (v) { return (v.C_uF * v.E0) * (1 - Math.exp(-v.gamma * Math.PI / v.beta)); }
        },
        feedback: [
          { when: 'soloFinal', say: 'Casi: ese es el valor asintótico final $C\\mathcal{E}$; por la inercia del inductor el primer pico lo supera.' },
          { when: 'restaExp', say: 'Casi: en el primer pico $\\cos\\pi = -1$, lo que convierte el factor en $(1 + e^{-\\gamma\\pi/\\beta})$.' }
        ] }),

    /* =====================================================================
       7. Guía: transformada de Laplace y sistemas de EDO (11 preguntas: 3 D1, 5 D2, 3 D3)
       ===================================================================== */
    C('gu-c-laplace-definicion', 'guia', 1,
      'La transformada de Laplace $\\mathcal{L}\\{f(t)\\}(s)$ de una función $f(t)$ definida para $t \\ge 0$ se define mediante la integral impropia…',
      '$\\displaystyle\\int_0^\\infty e^{-st} f(t)\\,dt$',
      [['$\\displaystyle\\int_{-\\infty}^\\infty e^{-st} f(t)\\,dt$', 'Casi: esa es la transformada bilateral; la unilateral estándar para problemas con valor inicial integra en $[0, \\infty)$.'],
       ['$\\displaystyle\\int_0^\\infty e^{st} f(t)\\,dt$', 'Casi: el núcleo lleva signo negativo en el exponente $e^{-st}$ para asegurar convergencia cuando $s > 0$.'],
       ['$\\displaystyle\\int_0^s e^{-st} f(t)\\,dt$', 'Casi: el límite superior de integración es el infinito $\\infty$, transformando la variable $t$ en la variable algebraica $s$.']],
      'La definición formal es $F(s) = \\mathcal{L}\\{f(t)\\} = \\int_0^\\infty e^{-st}f(t)\\,dt$, que mapea el dominio del tiempo al plano $s$.'),

    C('gu-c-laplace-derivadas', 'guia', 1,
      '¿Por qué la transformada de Laplace simplifica notablemente la resolución de problemas de valor inicial lineales con coeficientes constantes?',
      'Porque convierte derivadas en multiplicaciones algebraicas por $s$ e incorpora automáticamente las condiciones iniciales',
      [['Porque elimina la necesidad de usar fracciones parciales en la solución', 'Casi: al contrario, tras despejar $Y(s)$ suelen usarse fracciones parciales para regresar al tiempo con tablas.'],
       ['Porque solo puede aplicarse a ecuaciones diferenciales de primer orden', 'Casi: se aplica de manera directa a ecuaciones de cualquier orden superior.'],
       ['Porque sustituye las funciones analíticas por aproximaciones numéricas discretas', 'Casi: es una herramienta analítica exacta, no un método numérico aproximado.']],
      'Al cumplirse $\\mathcal{L}\\{y\'\\} = sY - y(0)$ y $\\mathcal{L}\\{y\'\'\\} = s^2Y - sy(0) - y\'(0)$, la EDO se vuelve una ecuación puramente algebraica.'),

    C('gu-c-sistemas-reduccion', 'guia', 2,
      'Cualquier EDO de segundo orden $x\'\' = f(t, x, x\')$ se reduce a un sistema equivalente de dos ecuaciones de primer orden introduciendo las variables…',
      '$x_1 = x$ y $x_2 = x\'$, resultando $x_1\' = x_2$ y $x_2\' = f(t, x_1, x_2)$',
      [['$x_1 = x$ y $x_2 = x^2$, resultando $x_1\' = x_2$ y $x_2\' = 2x x\'$', 'Casi: la reducción canónica asigna las nuevas variables a las derivadas sucesivas: posición y velocidad.'],
       ['$x_1 = x\'$ y $x_2 = x\'\'$, descartando a la posición $x$', 'Casi: se debe mantener a la función original $x$ para describir completamente el estado.'],
       ['$x_1 = x + t$ y $x_2 = x - t$', 'Casi: las variables de estado físicas estándar son la posición y la velocidad ($x$ y $x\'$).']],
      'El vector de estado $\\mathbf{x} = [x, x\']^T$ reduce una EDO escalar de orden 2 a un sistema matricial de orden 1: $\\mathbf{x}\' = A\\mathbf{x}$.'),

    C('gu-c-valores-propios-raices', 'guia', 2,
      'Al escribir la ecuación libre $m\\,x\'\' + c\\,x\' + k\\,x = 0$ como sistema lineal de primer orden $\\mathbf{x}\' = A\\mathbf{x}$, ¿qué representan los valores propios de $A$?',
      'Coinciden exactamente con las raíces de la ecuación característica $m r^2 + c r + k = 0$',
      [['Son los inversos aditivos de las condiciones iniciales del sistema', 'Casi: los valores propios son intrínsecos a la matriz $A$, no dependen de los valores iniciales.'],
       ['Son siempre números reales positivos que indican la masa del sistema', 'Casi: pueden ser reales o complejos con parte real negativa, igual que las raíces características.'],
       ['No guardan relación alguna con el polinomio característico original', 'Casi: la ecuación secular $\\det(A - \\lambda I) = 0$ reproduce exactamente el polinomio característico de la EDO.']],
      'La matriz del sistema tiene polinomio característico $\\det(A - r I) = r^2 + (c/m)r + k/m = 0$, idéntico al de la EDO dividida entre $m$.'),

    N('gu-n-laplace-constante', 'guia', 1, { k: [3, 9, 1], s: [2, 5, 1] },
      function (v) { return 'La transformada de Laplace de una función constante $f(t) = ' + v.k + '$ es $F(s) = \\frac{' + v.k + '}{s}$. Evalúa $F(' + v.s + ')$.'; },
      function (v) { return v.k / v.s; },
      'Por linealidad, $\\mathcal{L}\\{k\\} = k\\mathcal{L}\\{1\\} = k/s$. Evaluando en el valor dado de $s$ se obtiene $k/s$.',
      { where: function (v) { return v.k % v.s !== 0; },
        mistakes: {
          mult: function (v) { return v.k * v.s; },
          inv: function (v) { return v.s / v.k; }
        },
        feedback: [
          { when: 'mult', say: 'Casi: la transformada de una constante divide entre $s$: $k/s$, no multiplica.' },
          { when: 'inv', say: 'Casi: la constante $k$ se mantiene en el numerador: $k/s$.' }
        ] }),

    N('gu-n-laplace-exponencial', 'guia', 2, { a: [2, 6, 1], s: [7, 10, 1] },
      function (v) { return 'La transformada de $f(t) = e^{' + v.a + 't}$ es $F(s) = \\frac{1}{s - ' + v.a + '}$ para $s > ' + v.a + '$. Evalúa $F(' + v.s + ')$.'; },
      function (v) { return 1 / (v.s - v.a); },
      'Por tabla básica de Laplace, $\\mathcal{L}\\{e^{at}\\} = \\frac{1}{s - a}$. Sustituyendo los valores resulta $1/(s - a)$.',
      { mistakes: {
          signoMas: function (v) { return 1 / (v.s + v.a); },
          sinFrac: function (v) { return v.s - v.a; }
        },
        feedback: [
          { when: 'signoMas', say: 'Casi: para $e^{at}$ el denominador lleva signo de resta: $s - a$.' },
          { when: 'sinFrac', say: 'Casi: la transformada es el inverso multiplicativo $1/(s - a)$.' }
        ] }),

    N('gu-n-laplace-pvi-despeje', 'guia', 2, { w: [1, 3, 1], x0: [3, 8, 1] },
      function (v) { return 'Para el PVI $x\'\' + ' + (v.w * v.w) + 'x = 0$ con $x(0) = ' + v.x0 + '$ y $x\'(0) = 0$, la transformada da $(s^2 + ' + (v.w * v.w) + ')X(s) = ' + v.x0 + 's$. ¿Cuánto vale $X(1)$?'; },
      function (v) { return (v.x0 * 1) / (1 + v.w * v.w); },
      'Despejando $X(s) = \\frac{x_0 s}{s^2 + \\omega^2}$. Evaluando en $s = 1$ queda $x_0 / (1 + \\omega^2)$.',
      { 
         }),

    N('gu-n-traza-matriz-amort', 'guia', 2, { m: [1, 2, 1], c: [2, 6, 2], k: [4, 12, 2] },
      function (v) { return 'La matriz de estados para $' + v.m + "x'' + " + v.c + "x' + " + v.k + 'x = 0$ es $A = \\begin{pmatrix} 0 & 1 \\\\ -k/m & -c/m \\end{pmatrix}$. Calcula la traza de la matriz $A$ ($\\\\text{tr}(A) = 0 - c/m$).'; },
      function (v) { return -v.c / v.m; },
      'La traza es la suma de los elementos sobre la diagonal principal: $0 + (-c/m) = -c/m$.',
      { mistakes: {
          posTraza: function (v) { return v.c / v.m; },
          detA: function (v) { return v.k / v.m; }
        },
        feedback: [
          { when: 'posTraza', say: 'Casi: el término diagonal es $-c/m$, por lo que la traza resultante es negativa.' },
          { when: 'detA', say: 'Casi: ese valor $k/m$ corresponde al determinante de la matriz, no a su traza.' }
        ] }),

    N('gu-n-determinante-matriz', 'guia', 3, { m: [1, 3, 1], k: [6, 24, 3] },
      function (v) { return 'Para la matriz de estados $A = \\begin{pmatrix} 0 & 1 \\\\ -' + v.k + '/' + v.m + ' & -2 \\end{pmatrix}$, calcula su determinante $\\det(A) = 0\\cdot(-2) - 1\\cdot(-k/m) = k/m$.'; },
      function (v) { return v.k / v.m; },
      'El determinante es $0 - (-k/m) = k/m$, que representa el producto de los valores propios de la matriz.',
      { where: function (v) { return v.k % v.m === 0; },
        mistakes: {
          negDet: function (v) { return -v.k / v.m; },
          diagSolamente: function (v) { return -2; }
        },
        feedback: [
          { when: 'negDet', say: 'Casi: el producto de la diagonal secundaria resta $-(-k/m) = +k/m$.' },
          { when: 'diagSolamente', say: 'Casi: el determinante de una matriz $2\\times 2$ es $a_{11}a_{22} - a_{12}a_{21}$.' }
        ] }),

    N('gu-n-semieje-elipse-fase', 'guia', 3, { w: [2, 5, 1], x0: [2, 6, 1] },
      function (v) { return 'En el plano fase $(x, x\')$ de $x\'\' + ' + (v.w * v.w) + 'x = 0$ con $x(0) = ' + v.x0 + '$ y $x\'(0) = 0$, la trayectoria es una elipse $x^2 + (x\'/\\omega)^2 = x_0^2$. ¿Cuánto mide el semieje vertical (la velocidad máxima en m/s)?'; },
      function (v) { return v.x0 * v.w; },
      'La elipse de fase tiene semieje horizontal de posición $x_0$ y semieje vertical de velocidad $v_{\\max} = \\omega x_0$.',
      { unit: 'm/s',
        mistakes: {
          divW: function (v) { return v.x0 / v.w; },
          soloX0: function (v) { return v.x0; }
        },
        feedback: [
          { when: 'divW', say: 'Casi: la velocidad máxima es el producto $\\omega x_0$, no el cociente.' },
          { when: 'soloX0', say: 'Casi: ese es el semieje horizontal de elongación; en el eje vertical $x\'$ se multiplica por $\\omega$.' }
        ] }),

    N('gu-n-laplace-seno-traslacion', 'guia', 3, { a: [1, 2, 1], b: [3, 5, 1], s: [1, 2, 1] },
      function (v) { return 'Por el primer teorema de traslación, $\\mathcal{L}\\{e^{-' + v.a + 't}\\sin(' + v.b + 't)\\} = \\frac{' + v.b + '}{(s + ' + v.a + ')^2 + ' + (v.b * v.b) + '}$. Evalúa esta función en $s = ' + v.s + '$.'; },
      function (v) { var sh = v.s + v.a; return v.b / (sh * sh + v.b * v.b); },
      'El primer teorema de traslación sustituye $s$ por $s + a$ en la transformada del seno: $F(s) = b / [(s + a)^2 + b^2]$.',
      { mistakes: {
          menosA: function (v) { var sh = v.s - v.a; return v.b / (sh * sh + v.b * v.b); },
          sArriba: function (v) { var sh = v.s + v.a; return sh / (sh * sh + v.b * v.b); }
        },
        feedback: [
          { when: 'menosA', say: 'Casi: como la función tiene $e^{-at}$, la traslación en $s$ es $s - (-a) = s + a$.' },
          { when: 'sArriba', say: 'Casi: la función seno lleva la constante $b$ en el numerador; el término $(s+a)$ en el numerador corresponde al coseno.' }
        ] })
  ];

  K.register(SUBTEMAS, Q);
})();
