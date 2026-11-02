/* =====================================================================
   Banco · Cálculo 3 · S08 · Modelado con primer orden: circuitos RC y RL,
   mezclas y poblaciones.
   100 preguntas propias (source: 'propia').
   ===================================================================== */
(function () {
  var K = window.CBBankKit('c3', '08');

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
    'c3.S08.balance': 'Balance, leyes físicas y elección de método',
    'c3.S08.circuitos': 'Circuitos RC y RL',
    'c3.S08.mezclas': 'Tanques de mezclas con volumen variable',
    'c3.S08.poblaciones': 'Crecimiento poblacional, logística y cosecha',
    'c3.S08.resistencia': 'Caída con resistencia del aire y velocidad terminal',
    'c3.S08.temperatura': 'Temperatura variable y crecimiento alométrico'
  };

  var Q = [
    /* ======================= 1. Balance, leyes físicas y elección de método (16) ======================= */
    C('ba-c-principio', 'balance', 1,
      '¿Qué principio general de conservación rige el planteamiento de modelos de acumulación donde una cantidad $y(t)$ varía en el tiempo?',
      'La razón de cambio neta es igual a la tasa de entrada menos la tasa de salida ($y\' = \\text{entra} - \\text{sale}$)', [
        ['La derivada siempre es igual al producto de lo que entra por lo que sale', 'Casi: el balance se plantea mediante una resta neta (entrada menos salida), no como una multiplicación.'],
        ['La cantidad presente en el sistema debe mantenerse estrictamente constante en todo instante', 'Casi: eso solo ocurre en un estado de equilibrio estático donde la derivada es cero.'],
        ['La tasa de cambio depende exclusivamente de la segunda derivada del sistema', 'Casi: en modelos de acumulación de primer orden interviene directamente la primera derivada $y\'$.' ]],
      'Todo modelo de acumulación parte del balance fundamental: razón de cambio instantánea = tasa de entrada − tasa de salida.'),

    C('ba-c-unidades-balance', 'balance', 1,
      'Si $Q(t)$ representa la masa de un contaminante en kilogramos y $t$ se mide en horas, ¿qué unidades debe tener cada término en la ecuación diferencial de balance $Q\' = R_{\\text{in}} - R_{\\text{out}}$?',
      '$\\text{kg/h}$', [
        ['$\\text{kg}$', 'Casi: kilogramos es la unidad de la masa acumulada $Q$, pero $Q\'$ es una razón de cambio temporal y debe dividirse entre horas.'],
        ['$\\text{kg}\\cdot\\text{h}$', 'Casi: las unidades de la derivada respecto al tiempo llevan el tiempo en el denominador, no multiplicado.'],
        ['$\\text{h/kg}$', 'Casi: las unidades de $dQ/dt$ son masa sobre tiempo, no tiempo sobre masa.']],
      'Por consistencia dimensional, cada término de la ecuación debe tener las mismas unidades que la derivada $dQ/dt$, es decir, kg/h.'),

    C('ba-c-metodo-autonomo', 'balance', 1,
      'Una ecuación diferencial de la forma $y\' = f(y)$, donde la razón de cambio no depende explícitamente del tiempo $t$, se denomina autónoma. ¿Qué método permite resolverla siempre de manera directa?',
      'Separación de variables, escribiendo $\\frac{dy}{f(y)} = dt$', [
        ['Factor integrante con $\\mu(t) = e^{\\int f(y)\\,dt}$', 'Casi: no puedes integrar respecto a $t$ una función que contiene la variable desconocida $y$ en el exponente.'],
        ['Sustitución de Bernoulli obligatoria', 'Casi: solo es Bernoulli si $f(y)$ tiene la forma específica $P y + Q y^n$; en general una autónoma se separa directamente.'],
        ['Transformación a segundo orden', 'Casi: la ecuación ya es de primer orden y se resuelve separando $dy/f(y) = dt$.']],
      'Al no aparecer la variable independiente $t$, la ecuación $y\' = f(y)$ se separa inmediatamente como $\\frac{dy}{f(y)} = dt$.'),

    C('ba-c-metodo-clima-variable', 'balance', 2,
      'En el modelo térmico de un edificio $T\' = -k(T - T_{\\text{amb}}(t))$, la temperatura exterior varía con el tiempo como $T_{\\text{amb}}(t) = 22 + 6\\sin(\\omega t)$. ¿Qué método analítico es el adecuado para resolver esta EDO?',
      'Lineal de primer orden, reescribiendo como $T\' + kT = k(22 + 6\\sin(\\omega t))$ con factor integrante $\\mu(t) = e^{kt}$', [
        ['Variables separables, factorizando $T$ y $t$', 'Casi: la presencia de la suma $T - 22 - 6\\sin(\\omega t)$ impide factorizar la expresión en un producto $g(t)h(T)$.'],
        ['Ecuación de Bernoulli con $n = 2$', 'Casi: la incógnita $T$ aparece únicamente a la primera potencia; no hay potencias no lineales $T^n$.'],
        ['Integración directa de ambos lados respecto a $t$', 'Casi: no puedes integrar directamente porque el lado derecho contiene la función incógnita $T(t)$.']],
      'Al desarrollar queda $T\' + kT = kT_{\\text{amb}}(t)$, que es una ecuación lineal no homogénea de primer orden con factor integrante $e^{kt}$.'),

    C('ba-c-metodo-bernoulli', 'balance', 2,
      'Un modelo biológico de crecimiento celular establece que el volumen $V(t)$ de un tejido cumple $V\' = a V - b V^{4/3}$, con $a, b > 0$. ¿Qué tipo de ecuación diferencial es y qué sustitución la linealiza?',
      'Es una ecuación de Bernoulli con $n = 4/3$, que se linealiza mediante $u = V^{1 - 4/3} = V^{-1/3}$', [
        ['Es una ecuación lineal homogénea que no requiere ningún cambio de variable', 'Casi: el término $V^{4/3}$ no es lineal y rompe la linealidad de primer orden.'],
        ['Es una ecuación exacta que se resuelve con $u = V^{4/3}$', 'Casi: el cambio estándar de Bernoulli $y\' + Py = Qy^n$ es $u = y^{1-n}$.'],
        ['Es una ecuación de Riccati que requiere conocer una solución particular previa', 'Casi: como no tiene término independiente suelto de $V$, es exactamente una Bernoulli.']],
      'Tiene la forma $V\' - aV = -b V^n$ con $n = 4/3$. El cambio $u = V^{1-n} = V^{-1/3}$ produce una ecuación lineal en $u$.'),

    C('ba-c-estacionario-concepto', 'balance', 1,
      'Para encontrar el estado estacionario (o solución de equilibrio) de un sistema modelado por $y\' = F(y)$, ¿cuál es el procedimiento analítico directo?',
      'Hacer $y\' = 0$, resolver la ecuación algebraica $F(y) = 0$ y evaluar las raíces', [
        ['Calcular la segunda derivada e igualarla a cero ($y\'\' = 0$)', 'Casi: la segunda derivada nula corresponde a puntos de inflexión, no a estados estacionarios de la variable.'],
        ['Integrar la función $F(y)$ respecto a $y$ e igualar a una constante', 'Casi: para el estado estacionario no se integra; se busca el valor donde la rapidez de cambio se anula.'],
        ['Hacer el tiempo $t = 0$ en la ecuación diferencial', 'Casi: evaluar en $t = 0$ da la tasa inicial, mientras que el equilibrio es la condición donde $y$ no cambia.']],
      'En un estado estacionario la cantidad deja de cambiar en el tiempo ($y\' = 0$), lo que reduce la EDO a la ecuación algebraica $F(y) = 0$.'),

    C('ba-c-conservacion-newton', 'balance', 2,
      'Al aplicar la segunda ley de Newton $\\sum F = m\\,a$ a un objeto de masa $m$ que cae verticalmente con rapidez $v(t)$, ¿cómo se formula la ley como ecuación diferencial de primer orden?',
      '$m\\,v\' = m\\,g - F_{\\text{res}}(v)$, donde $a = v\'$', [
        ['$m\\,v = m\\,g\\,t - F_{\\text{res}}(v)$', 'Casi: la ley de Newton relaciona la fuerza con la aceleración $v\'$, no directamente con la velocidad $v$.'],
        ['$v\'\' = g - F_{\\text{res}}(v)$', 'Casi: si la variable dependiente es la velocidad $v$, la aceleración es su primera derivada $v\'$, no $v\'\'$.'],
        ['$m\\,v\' = m\\,g + F_{\\text{res}}(v)$ siempre con signo positivo', 'Casi: la fuerza de resistencia se opone al movimiento, por lo que lleva signo contrario a la velocidad.']],
      'La aceleración es la primera derivada de la velocidad ($a = v\'$); el balance de fuerzas da $m v\' = mg - F_{\\text{res}}$.'),

    C('ba-c-kirchhoff-mallas', 'balance', 2,
      'En un circuito cerrado con una fuente de fem $\\varepsilon(t)$, una resistencia $R$ y un inductor de inductancia $L$, ¿cómo se expresa la ley de voltajes de Kirchhoff en términos de la corriente $i(t)$?',
      '$L\\,i\' + R\\,i = \\varepsilon(t)$', [
        ['$R\\,i\' + L\\,i = \\varepsilon(t)$', 'Casi: el término de la inductancia lleva la derivada ($V_L = L i\'$), mientras que la resistencia multiplica a la corriente ($V_R = Ri$).'],
        ['$L\\,i\'\' + R\\,i = \\varepsilon(t)$', 'Casi: la caída en el inductor depende de la primera derivada de la corriente, no de la segunda.'],
        ['$L\\,i + R\\,i = \\varepsilon\'(t)$', 'Casi: la ley de mallas suma voltajes directamente, no derivadas de la fem.']],
      'La caída en el resistor es $Ri$ y en la bobina es $Li\'$; por Kirchhoff, $Li\' + Ri = \\varepsilon(t)$.'),

    N('ba-n-tasa-neta', 'balance', 1, { rin: [30, 80, 10], rout: [10, 25, 5] },
      function (v) { return 'Un embalse recibe agua a un caudal de entrada de $' + v.rin + '\\ \\text{m}^3\\text{/s}$ y desagua a través de compuertas a $' + v.rout + '\\ \\text{m}^3\\text{/s}$. ¿Cuál es la tasa de cambio neta del volumen de agua almacenada (en $\\text{m}^3\\text{/s}$)?'; },
      function (v) { return v.rin - v.rout; },
      'El balance de volumen establece que la tasa neta es el caudal de entrada menos el de salida: $V\' = r_{\\text{in}} - r_{\\text{out}}$.',
      { unit: 'm^3/s',
        mistakes: {
          sum: function (v) { return v.rin + v.rout; },
          ratio: function (v) { return v.rin / v.rout; }
        },
        feedback: [
          { when: 'sum', say: 'Casi: el agua que sale reduce el volumen, por lo que debe restarse, no sumarse.' },
          { when: 'ratio', say: 'Casi: la tasa neta es una diferencia de caudales, no un cociente.' }
        ] }),

    N('ba-n-equilibrio-quimico', 'balance', 2, { k1: [12, 36, 4], k2: [2, 6, 1] },
      function (v) { return 'Un reactor químico produce un reactivo a tasa constante de $' + v.k1 + '\\ \\text{mol/s}$ y lo consume por degradación a una tasa de $' + v.k2 + '\\,A\\ \\text{mol/s}$, cumpliendo $A\' = ' + v.k1 + ' - ' + v.k2 + '\\,A$. ¿Cuál es la cantidad de reactivo en el estado de equilibrio (en moles)?'; },
      function (v) { return v.k1 / v.k2; },
      'En el equilibrio la tasa neta se anula: $k_1 - k_2 A = 0 \\Rightarrow A = k_1 / k_2$.',
      { unit: 'mol',
        mistakes: {
          prod: function (v) { return v.k1 * v.k2; },
          diff: function (v) { return v.k1 - v.k2; }
        },
        feedback: [
          { when: 'prod', say: 'Casi: al despejar de $k_1 - k_2 A = 0$ se divide $k_1$ entre $k_2$, no se multiplican.' },
          { when: 'diff', say: 'Casi: no puedes restar $k_1 - k_2$ directamente porque $k_2$ multiplica a la concentración $A$.' }
        ] }),

    N('ba-n-estacionario-depredador', 'balance', 2, { a: [15, 45, 5], b: [3, 9, 3] },
      function (v) { return 'La biomasa $P(t)$ (en toneladas) de una población de peces en un criadero cumple la ecuación autónoma $P\' = ' + v.a + '\\,P - ' + v.b + '\\,P^2$. Determina la biomasa de equilibrio no nula (en toneladas).'; },
      function (v) { return v.a / v.b; },
      'Factorizando $P(a - bP) = 0$, la solución no trivial de equilibrio es $P = a / b$.',
      { unit: 'toneladas',
        mistakes: {
          prod: function (v) { return v.a * v.b; },
          half: function (v) { return v.a / (2 * v.b); }
        },
        feedback: [
          { when: 'prod', say: 'Casi: al igualar $aP - bP^2 = 0$ con $P \\neq 0$, se obtiene $P = a/b$, no $a\\cdot b$.' },
          { when: 'half', say: 'Casi: $a/(2b)$ es el punto de máxima tasa de crecimiento, no la biomasa de equilibrio final.' }
        ] }),

    N('ba-n-tiempo-duplicacion-malthus', 'balance', 2, { r: [0.2, 0.8, 0.1] },
      function (v) { return 'Un cultivo bacteriano en fase exponencial crece a una tasa relativa de $' + v.r + '\\ \\text{h}^{-1}$, cumpliendo $N\' = ' + v.r + '\\,N$. ¿Cuántas horas tarda la población en duplicar su tamaño inicial?'; },
      function (v) { return Math.log(2) / v.r; },
      'De $N(t) = N_0 e^{rt} = 2N_0$ se obtiene $e^{rt} = 2$, por lo que $t = \\ln(2)/r$.',
      { unit: 'h',
        mistakes: {
          twoOverR: function (v) { return 2 / v.r; },
          invLog: function (v) { return v.r / Math.log(2); }
        },
        feedback: [
          { when: 'twoOverR', say: 'Casi: el crecimiento es exponencial, por lo que el factor de duplicación requiere $\\ln 2$, no el número 2.' },
          { when: 'invLog', say: 'Casi: al despejar $t$ de $rt = \\ln 2$ se divide $\\ln 2$ entre $r$.' }
        ] }),

    N('ba-n-calor-perdido', 'balance', 3, { Q: [200, 600, 50], k: [10, 25, 5] },
      function (v) { return 'Un tanque térmico recibe calor de una resistencia a razón constante de $' + v.Q + '\\ \\text{W}$ y disipa calor hacia un entorno a $20\\,^\\circ\\text{C}$ según la ley ' + v.k + '(T - 20)\\ \\text{W}, con $k = ' + v.k + '\\ \\text{W/}^\\circ\\text{C}$. ¿Cuál es la temperatura máxima estacionaria $T_{\\text{est}}$ (en $^\\circ\\text{C}$) que alcanza el tanque?'; },
      function (v) { return 20 + v.Q / v.k; },
      'En el estado estacionario la ganancia iguala a la disipación: $Q = k(T - 20) \\Rightarrow T = 20 + Q/k$.',
      { unit: '°C',
        mistakes: {
          noAmb: function (v) { return v.Q / v.k; },
          subAmb: function (v) { return v.Q / v.k - 20; }
        },
        feedback: [
          { when: 'noAmb', say: 'Casi: $Q/k$ es la elevación de temperatura sobre el ambiente; debes sumarle los $20\\,^\\circ\\text{C}$ del entorno.' },
          { when: 'subAmb', say: 'Casi: la temperatura del tanque es superior a la del ambiente, por lo que se suma $20$, no se resta.' }
        ] }),

    N('ba-n-tiempo-alcanzar-fraccion', 'balance', 3, { k: [0.1, 0.5, 0.1], p: [10, 40, 10] },
      function (v) { return 'Un medicamento se elimina del torrente sanguíneo a una tasa proporcional a la concentración presente: $C\' = -' + v.k + '\\,C$, donde $k = ' + v.k + '\\ \\text{h}^{-1}$. ¿En cuántas horas la concentración se reduce al $' + v.p + '\\,\\%$ de la dosis inicial?'; },
      function (v) { return Math.log(100 / v.p) / v.k; },
      'De $C(t) = C_0 e^{-kt} = (p/100)C_0$ se tiene $e^{kt} = 100/p$, de modo que $t = \\ln(100/p)/k$.',
      { unit: 'h',
        mistakes: {
          linFrac: function (v) { return (1 - v.p / 100) / v.k; },
          invK: function (v) { return v.k * Math.log(100 / v.p); }
        },
        feedback: [
          { when: 'linFrac', say: 'Casi: la eliminación es exponencial, por lo que se despeja mediante logaritmo natural, no como una fracción lineal.' },
          { when: 'invK', say: 'Casi: al despejar $t$ de $e^{-kt} = p/100$ se divide entre $k$, no se multiplica.' }
        ] }),

    E('ba-e-solucion-malthus', 'balance', 1, { k: [2, 5, 1], y0: [3, 9, 2] },
      function (v) { return 'Resuelve el problema de valor inicial de balance elemental $\\dfrac{dy}{dt} = ' + v.k + '\\,y$, con condición inicial $y(0) = ' + v.y0 + '$. Escribe la solución explícita $y(t)$.'; },
      function (v) { return v.y0 + '*e^(' + v.k + '*t)'; },
      'Separando variables $\\frac{dy}{y} = k\\,dt$ e integrando resulta $\\ln y = kt + C$, de donde $y(t) = y(0)e^{kt}$.',
      { exprVars: ['t'], domain: [0.1, 1.5],
        mistakes: {
          noConst: function (v) { return 'e^(' + v.k + '*t)'; },
          addConst: function (v) { return 'e^(' + v.k + '*t) + ' + (v.y0 - 1); }
        },
        feedback: [
          { when: 'noConst', say: function (v) { return 'Casi: olvidaste multiplicar por la condición inicial $y(0) = ' + v.y0 + '$.'; } },
          { when: 'addConst', say: 'Casi: la condición inicial multiplica a la exponencial, no se suma afuera.' }
        ] }),

    E('ba-e-balance-lineal', 'balance', 3, { a: [2, 6, 2], b: [8, 24, 4] },
      function (v) { return 'Resuelve el problema de valor inicial de balance con entrada constante y salida proporcional: $y\' + ' + v.a + '\\,y = ' + v.b + '$, con $y(0) = 0$. Escribe la solución explícita $y(t)$.'; },
      function (v) { return (v.b / v.a) + '*(1 - e^(-' + v.a + '*t))'; },
      'El factor integrante es $e^{at}$, lo que da $(e^{at}y)\' = b e^{at} \\Rightarrow y(t) = \\frac{b}{a}(1 - e^{-at})$.',
      { exprVars: ['t'], domain: [0.1, 2],
        mistakes: {
          noSteady: function (v) { return '1 - e^(-' + v.a + '*t)'; },
          wrongSign: function (v) { return (v.b / v.a) + '*(1 + e^(-' + v.a + '*t))'; }
        },
        feedback: [
          { when: 'noSteady', say: function (v) { return 'Casi: te faltó multiplicar por el estado estacionario $\\frac{b}{a} = ' + (v.b / v.a) + '$.'; } },
          { when: 'wrongSign', say: 'Casi: con signo más la solución en $t=0$ no cumple la condición inicial $y(0) = 0$.' }
        ] }),

    /* ======================= 2. Circuitos RC y RL (20) ======================= */
    C('ci-c-tau-comparacion', 'circuitos', 1,
      '¿Cuáles son las constantes de tiempo $\\tau$ para un circuito RC serie y un circuito RL serie, respectivamente?',
      '$\\tau_{\\text{RC}} = RC$ y $\\tau_{\\text{RL}} = \\frac{L}{R}$', [
        ['$\\tau_{\\text{RC}} = \\frac{R}{C}$ y $\\tau_{\\text{RL}} = LR$', 'Casi: en el circuito RC se multiplican ($RC$) y en el RL se divide la inductancia entre la resistencia ($L/R$).'],
        ['$\\tau_{\\text{RC}} = RC$ y $\\tau_{\\text{RL}} = \\frac{R}{L}$', 'Casi: en el circuito RL la constante de tiempo es $L/R$, no $R/L$.'],
        ['$\\tau_{\\text{RC}} = \\frac{1}{RC}$ y $\\tau_{\\text{RL}} = \\frac{1}{LR}$', 'Casi: esas expresiones corresponden a las frecuencias o inversos de las constantes de tiempo.']],
      'En el circuito RC la constante de tiempo es $\\tau = RC$, mientras que en el circuito RL es $\\tau = L/R$.'),

    C('ci-c-inductor-t0', 'circuitos', 1,
      'En un circuito RL en serie inicialmente sin corriente ($i(0) = 0$), se conecta de golpe una batería de fem constante $\\varepsilon$. Justo en el instante inicial $t = 0^+$, ¿cuál es el voltaje en el inductor $V_L$?',
      '$V_L(0^+) = \\varepsilon$, porque la corriente aún es cero y toda la caída ocurre en el inductor', [
        ['$V_L(0^+) = 0$, porque la bobina actúa como un alambre conductor ideal', 'Casi: la bobina actúa como alambre conductor cuando $t \\to \\infty$, pero en $t = 0^+$ se opone por completo al paso de corriente.'],
        ['$V_L(0^+) = \\frac{\\varepsilon}{2}$, dividiéndose equitativamente con la resistencia', 'Casi: como $i(0) = 0$, la caída en el resistor es $R\\cdot 0 = 0$, por lo que todo el voltaje cae en $L$.'],
        ['$V_L(0^+) = -\\varepsilon$', 'Casi: la caída de tensión en el inductor iguala a la fem de la fuente $\\varepsilon$ para equilibrar la malla.']],
      'En $t = 0^+$, la corriente es $i = 0$, de modo que $V_R = R i = 0$. Por la ley de mallas, $V_L = \\varepsilon - V_R = \\varepsilon$.'),

    C('ci-c-capacitor-infinito', 'circuitos', 1,
      'En un circuito RC serie conectado a una batería de fem constante $\\varepsilon$, ¿cuál es el estado del circuito tras transcurrir un tiempo muy prolongado ($t \\to \\infty$)?',
      'El capacitor se carga a $q_{\\text{est}} = C\\varepsilon$ y la corriente en el circuito se anula ($i = 0$)', [
        ['La corriente alcanza su valor máximo $\\varepsilon/R$ y el capacitor queda descargado', 'Casi: eso describe el comportamiento de una bobina en un RL, no de un capacitor en un RC.'],
        ['El voltaje en el capacitor se hace cero y toda la caída ocurre en el resistor', 'Casi: al cargarse por completo, el voltaje en el capacitor iguala al de la batería y la corriente cesa.'],
        ['La carga oscila indefinidamente entre $+C\\varepsilon$ y $-C\\varepsilon$', 'Casi: un circuito RC de primer orden tiene respuesta exponencial amortiguada sin oscilaciones.']],
      'A régimen permanente un capacitor cargado actúa como un circuito abierto ($i = 0$) con carga máxima $q = C\\varepsilon$.'),

    C('ci-c-tau-porcentaje-carga', 'circuitos', 1,
      'Cuando un inductor inicialmente descargado ($i(0)=0$) se conecta a una fem constante $\\varepsilon$, ¿qué porcentaje aproximado de su corriente máxima estacionaria $\\varepsilon/R$ circula en $t = \\tau$?',
      'Aproximadamente el $63.2\\,\\%$ ($1 - e^{-1}$)', [
        ['Exactamente el $50\\,\\%$', 'Casi: el 50 % se alcanza en el tiempo de vida media $t = \\tau \\ln 2 \\approx 0.693\\tau$.'],
        ['Aproximadamente el $36.8\\,\\%$', 'Casi: el 36.8 % ($e^{-1}$) es la fracción residual que queda al descargarse o decaer, no al cargarse.'],
        ['El $99\\,\\%$', 'Casi: para llegar al 99 % se requieren aproximadamente $5\\tau$.']],
      'En $t = \\tau$, el factor transitorio vale $1 - e^{-1} \\approx 1 - 0.3679 = 0.6321$, es decir, el 63.2 %.'),

    C('ci-c-efecto-aumentar-r-rl', 'circuitos', 2,
      'Si en un circuito RL serie se duplica la resistencia $R$ manteniendo fija la inductancia $L$, ¿qué sucede con la constante de tiempo $\\tau$ y con la corriente final $I_{\\text{max}}$?',
      '$\\tau$ se reduce a la mitad y la corriente final también se reduce a la mitad', [
        ['$\\tau$ se duplica y la corriente final se reduce a la mitad', 'Casi: en el circuito RL la constante es $\\tau = L/R$, por lo que al duplicar $R$ el cociente se reduce a la mitad.'],
        ['$\\tau$ no cambia pero la corriente final se duplica', 'Casi: $\\tau$ depende directamente de $R$, e $I_{\\text{max}} = \\varepsilon/R$ disminuye con mayor resistencia.'],
        ['$\\tau$ se reduce a la mitad pero la corriente final no cambia', 'Casi: por la ley de Ohm en régimen permanente, la corriente máxima es $\\varepsilon/R$, que también depende de $R$.']],
      'Como $\\tau = L/R$ e $I_{\\text{max}} = \\varepsilon/R$, duplicar la resistencia reduce ambas magnitudes a la mitad.'),

    C('ci-c-voltaje-inductor-formula', 'circuitos', 2,
      'En un circuito RL con fem constante $\\varepsilon$ y corriente inicial cero ($i(0)=0$), ¿cómo varía la caída de potencial en el inductor $V_L(t) = L\\,i\'(t)$ a lo largo del tiempo?',
      '$V_L(t) = \\varepsilon e^{-Rt/L}$, disminuyendo exponencialmente desde $\\varepsilon$ hasta cero', [
        ['$V_L(t) = \\varepsilon(1 - e^{-Rt/L})$, aumentando exponencialmente desde cero hasta $\\varepsilon$', 'Casi: esa fórmula describe el voltaje en el resistor $V_R(t)$, no en el inductor.'],
        ['$V_L(t) = \\frac{\\varepsilon}{R}e^{-Rt/L}$, con unidades de amperes', 'Casi: el voltaje tiene unidades de volts y su valor inicial es $\\varepsilon$, no $\\varepsilon/R$.'],
        ['$V_L(t) = \\varepsilon$ constante en todo instante', 'Casi: al aumentar la corriente, la derivada $i\'(t)$ disminuye y el voltaje en el inductor decae.']],
      'Derivando $i(t) = \\frac{\\varepsilon}{R}(1 - e^{-Rt/L})$ resulta $i\'(t) = \\frac{\\varepsilon}{L}e^{-Rt/L}$, por lo que $V_L = L i\' = \\varepsilon e^{-Rt/L}$.'),

    C('ci-c-rc-fuente-seno', 'circuitos', 2,
      'Si un circuito RC en serie se conecta a una fuente de corriente alterna $\\varepsilon(t) = V_0 \\cos(\\omega t)$, ¿qué estructura matemática adopta la EDO para la carga $q(t)$?',
      'Lineal de primer orden no homogénea $R q\' + \\frac{1}{C}q = V_0 \\cos(\\omega t)$, con factor integrante $\\mu(t) = e^{t/(RC)}$', [
        ['Ecuación de segundo orden con coeficientes constantes', 'Casi: un circuito RC sin inductor es estrictamente de primer orden en la carga $q$.'],
        ['Ecuación autónoma separable de primer orden', 'Casi: el término de excitación exterior $V_0 \\cos(\\omega t)$ depende de $t$, por lo que no es autónoma ni separable.'],
        ['Ecuación de Bernoulli con potencia $n = -1$', 'Casi: la carga $q$ aparece a la primera potencia en todos los términos; es completamente lineal.']],
      'La ecuación de Kirchhoff $Rq\' + \\frac{q}{C} = \\varepsilon(t)$ es lineal de primer orden, resoluble mediante el factor integrante $e^{t/(RC)}$.'),

    N('ci-n-tau-rl', 'circuitos', 1, { L: [2, 10, 2], R: [4, 20, 4] },
      function (v) { return 'Un circuito RL en serie cuenta con un inductor de $L = ' + v.L + '\\ \\text{H}$ y un resistor de $R = ' + v.R + '\\ \\Omega$. ¿Cuánto vale su constante de tiempo $\\tau$ (en segundos)?'; },
      function (v) { return v.L / v.R; },
      'La constante de tiempo de un circuito RL es el cociente de la inductancia entre la resistencia: $\\tau = L/R$.',
      { unit: 's', where: function (v) { return v.L !== v.R; },
        mistakes: {
          inv: function (v) { return v.R / v.L; },
          prod: function (v) { return v.L * v.R; }
        },
        feedback: [
          { when: 'inv', say: 'Casi: la constante de tiempo es $L/R$, no $R/L$.' },
          { when: 'prod', say: 'Casi: en el circuito RL se divide $L$ entre $R$, no se multiplican.' }
        ] }),

    N('ci-n-corriente-estacionaria-rl', 'circuitos', 1, { E: [12, 48, 6], R: [3, 12, 3], L: [1, 4, 1] },
      function (v) { return 'Se conecta una fem de $' + v.E + '\\ \\text{V}$ a un circuito RL con $R = ' + v.R + '\\ \\Omega$ y $L = ' + v.L + '\\ \\text{H}$. ¿Cuál es la corriente estacionaria máxima $I_{\\text{max}}$ (en amperes) cuando $t \\to \\infty$?'; },
      function (v) { return v.E / v.R; },
      'A largo plazo la inductancia no ofrece oposición a la corriente continua ($di/dt = 0$), por lo que $I = \\varepsilon / R$ por la ley de Ohm.',
      { unit: 'A', where: function (v) { return v.R !== v.L; },
        mistakes: {
          overL: function (v) { return v.E / v.L; },
          prod: function (v) { return v.E * v.R; }
        },
        feedback: [
          { when: 'overL', say: 'Casi: en el estado estacionario la corriente depende de la resistencia $R$, no de la inductancia $L$.' },
          { when: 'prod', say: 'Casi: por la ley de Ohm la corriente es voltaje entre resistencia ($I = \\varepsilon/R$).' }
        ] }),

    N('ci-n-corriente-tiempo-rl', 'circuitos', 2, { L: [1, 3, 1], R: [2, 6, 2], E: [12, 24, 6], t: [0.5, 1.5, 0.5] },
      function (v) { return 'Un circuito RL tiene $L = ' + v.L + '\\ \\text{H}$, $R = ' + v.R + '\\ \\Omega$ y se conecta a una batería de $' + v.E + '\\ \\text{V}$ en $t = 0$ con $i(0) = 0$. ¿Cuánta corriente (en amperes) circula a los $t = ' + v.t + '\\ \\text{s}$?'; },
      function (v) { return (v.E / v.R) * (1 - Math.exp(-v.R * v.t / v.L)); },
      'La corriente instantánea sigue la curva de carga $i(t) = (\\varepsilon/R)(1 - e^{-Rt/L})$.',
      { unit: 'A', where: function (v) { return v.L !== v.R && Math.abs(v.R * v.t / v.L - Math.log(2)) > 0.08; },
        mistakes: {
          decay: function (v) { return (v.E / v.R) * Math.exp(-v.R * v.t / v.L); },
          invTau: function (v) { return (v.E / v.R) * (1 - Math.exp(-v.L * v.t / v.R)); }
        },
        feedback: [
          { when: 'decay', say: 'Casi: esa sería la corriente de descarga sin fuente; al conectarse a la batería la corriente crece desde cero.' },
          { when: 'invTau', say: 'Casi: en el exponente la constante de tiempo es $\\tau = L/R$, por lo que va $-Rt/L$.' }
        ] }),

    N('ci-n-carga-descarga-rc', 'circuitos', 2, { q0: [60, 160, 20], R: [2, 5, 1], C: [2, 5, 1], t: [4, 12, 2] },
      function (v) { return 'Un capacitor cargado con $q_0 = ' + v.q0 + '\\ \\mu\\text{C}$ se descarga a través de un resistor de $R = ' + v.R + '\\ \\text{k}\\Omega$. Si la capacitancia es $C = ' + v.C + '\\ \\mu\\text{F}$, ¿cuánta carga (en $\\mu\\text{C}$) le queda tras $t = ' + v.t + '\\ \\text{ms}$?'; },
      function (v) { return v.q0 * Math.exp(-v.t / (v.R * v.C)); },
      'La constante $RC$ en milisegundos es $R(\\text{k}\\Omega) \\times C(\\mu\\text{F})$. La carga decae como $q(t) = q_0 e^{-t/(RC)}$.',
      { unit: 'μC', where: function (v) { return Math.abs(v.t - v.R * v.C * Math.log(2)) > 0.8; },
        mistakes: {
          linear: function (v) { return v.q0 * (1 - v.t / (v.R * v.C)); },
          charge: function (v) { return v.q0 * (1 - Math.exp(-v.t / (v.R * v.C))); }
        },
        feedback: [
          { when: 'linear', say: 'Casi: la descarga es exponencial $q_0 e^{-t/RC}$, no una disminución lineal.' },
          { when: 'charge', say: 'Casi: la fórmula con $(1 - e^{-t/RC})$ corresponde al proceso de carga, no de descarga.' }
        ] }),

    N('ci-n-tiempo-mitad-carga-rc', 'circuitos', 3, { R: [3, 8, 1], C: [2, 6, 2] },
      function (v) { return 'Un capacitor en un circuito RC serie con $R = ' + v.R + '\\ \\text{k}\\Omega$ y $C = ' + v.C + '\\ \\mu\\text{F}$ se carga desde cero con una batería. ¿En cuántos milisegundos alcanza exactamente el $50\\,\\%$ de su carga máxima?'; },
      function (v) { return v.R * v.C * Math.log(2); },
      'De $1 - e^{-t/(RC)} = 0.5$ se tiene $e^{-t/(RC)} = 0.5$, de donde $t = RC \\ln 2$.',
      { unit: 'ms',
        mistakes: {
          halfTau: function (v) { return 0.5 * v.R * v.C; },
          justTau: function (v) { return v.R * v.C; }
        },
        feedback: [
          { when: 'halfTau', say: 'Casi: a $t = 0.5\\tau$ solo se alcanza el $1 - e^{-0.5} \\approx 39.3\\,\\%$; para el $50\\,\\%$ se requiere multiplicar por $\\ln 2$.' },
          { when: 'justTau', say: 'Casi: en una constante de tiempo $\\tau = RC$ se alcanza el $63.2\\,\\%$, no el $50\\,\\%$.' }
        ] }),

    N('ci-n-tiempo-corriente-rl', 'circuitos', 3, { L: [2, 6, 2], R: [4, 10, 2], p: [60, 80, 10], E: [12, 24, 6] },
      function (v) { return 'En un circuito RL con inductancia $L = ' + v.L + '\\ \\text{H}$ y resistencia $R = ' + v.R + '\\ \\Omega$ alimentado por $\\varepsilon = ' + v.E + '\\ \\text{V}$ con $i(0) = 0$, ¿cuántos segundos tarda la corriente en llegar al $' + v.p + '\\,\\%$ de su valor máximo?'; },
      function (v) { return (v.L / v.R) * Math.log(100 / (100 - v.p)); },
      'De $1 - e^{-Rt/L} = p/100$ se despeja $e^{-Rt/L} = (100-p)/100 \\Rightarrow t = (L/R)\\ln(100/(100-p))$.',
      { unit: 's',
        mistakes: {
          logP: function (v) { return (v.L / v.R) * Math.log(100 / v.p); },
          linTime: function (v) { return (v.L / v.R) * (v.p / 100); }
        },
        feedback: [
          { when: 'logP', say: 'Casi: en el logaritmo interviene la fracción restante por alcanzar, $100 - p$, no directamente $p$.' },
          { when: 'linTime', say: 'Casi: la corriente crece exponencialmente; despejar el tiempo exige tomar logaritmo natural.' }
        ] }),

    N('ci-n-voltaje-resistor-rl', 'circuitos', 2, { E: [20, 50, 10], R: [5, 15, 5], L: [2, 6, 2], t: [0.2, 0.6, 0.2] },
      function (v) { return 'Un circuito RL serie con $R = ' + v.R + '\\ \\Omega$, $L = ' + v.L + '\\ \\text{H}$ y fem $\\varepsilon = ' + v.E + '\\ \\text{V}$ se energiza en $t = 0$. ¿Cuál es el voltaje en el resistor $V_R$ (en volts) en el instante $t = ' + v.t + '\\ \\text{s}$?'; },
      function (v) { return v.E * (1 - Math.exp(-v.R * v.t / v.L)); },
      'Como $V_R(t) = R i(t) = \\varepsilon(1 - e^{-Rt/L})$, la caída de potencial en el resistor sigue la misma curva de crecimiento que la corriente.',
      { unit: 'V', where: function (v) { return Math.abs(v.R * v.t / v.L - Math.log(2)) > 0.08; },
        mistakes: {
          expDecay: function (v) { return v.E * Math.exp(-v.R * v.t / v.L); },
          noExp: function (v) { return v.E * (v.R * v.t / v.L); }
        },
        feedback: [
          { when: 'expDecay', say: 'Casi: esa es la caída en el inductor $V_L$; el voltaje en el resistor comienza en cero y asciende.' },
          { when: 'noExp', say: 'Casi: el aumento de voltaje no es lineal; está regido por el factor $(1 - e^{-Rt/L})$.' }
        ] }),

    N('ci-n-voltaje-inductor-valor', 'circuitos', 2, { E: [15, 45, 10], R: [2, 6, 2], L: [2, 4, 1], t: [0.5, 1.5, 0.5] },
      function (v) { return 'Para un circuito RL serie conectado a una batería de $\\varepsilon = ' + v.E + '\\ \\text{V}$ con $R = ' + v.R + '\\ \\Omega$ y $L = ' + v.L + '\\ \\text{H}$, ¿cuál es la fuerza contraelectromotriz instantánea en la bobina $V_L = L\\,i\'$ (en volts) en $t = ' + v.t + '\\ \\text{s}$?'; },
      function (v) { return v.E * Math.exp(-v.R * v.t / v.L); },
      'La caída de tensión en el inductor decae exponencialmente según $V_L(t) = \\varepsilon e^{-Rt/L}$.',
      { unit: 'V', where: function (v) { return Math.abs(v.R * v.t / v.L - Math.log(2)) > 0.08; },
        mistakes: {
          oneMinus: function (v) { return v.E * (1 - Math.exp(-v.R * v.t / v.L)); },
          divL: function (v) { return (v.E / v.L) * Math.exp(-v.R * v.t / v.L); }
        },
        feedback: [
          { when: 'oneMinus', say: 'Casi: ese es el voltaje en el resistor $V_R$; en el inductor el voltaje decae desde $\\varepsilon$ hacia cero.' },
          { when: 'divL', say: 'Casi: la caída de tensión tiene unidades de volts y en $t=0$ vale $\\varepsilon$, no $\\varepsilon/L$.' }
        ] }),

    N('ci-n-corriente-desconexion-rl', 'circuitos', 2, { I0: [4, 12, 2], R: [5, 15, 5], L: [2, 6, 2], t: [0.2, 0.6, 0.2] },
      function (v) { return 'Un circuito RL por el que circulaba una corriente constante de $I_0 = ' + v.I0 + '\\ \\text{A}$ se desconecta de su fuente y se cortocircuita en $t = 0$. Con $L = ' + v.L + '\\ \\text{H}$ y $R = ' + v.R + '\\ \\Omega$, ¿cuánta corriente (en amperes) queda en $t = ' + v.t + '\\ \\text{s}$?'; },
      function (v) { return v.I0 * Math.exp(-v.R * v.t / v.L); },
      'Sin fuente externa la ecuación es $L i\' + R i = 0$, cuya solución es la descarga exponencial $i(t) = I_0 e^{-Rt/L}$.',
      { unit: 'A', where: function (v) { return v.L !== v.R && Math.abs(v.R * v.t / v.L - Math.log(2)) > 0.08; },
        mistakes: {
          oneMinus: function (v) { return v.I0 * (1 - Math.exp(-v.R * v.t / v.L)); },
          invTau: function (v) { return v.I0 * Math.exp(-v.L * v.t / v.R); }
        },
        feedback: [
          { when: 'oneMinus', say: 'Casi: al desconectarse la fuente la corriente no crece, sino que decae hacia cero.' },
          { when: 'invTau', say: 'Casi: la constante de tiempo es $L/R$, por lo que el exponente debe ser $-Rt/L$.' }
        ] }),

    N('ci-n-energia-bobina-estacionaria', 'circuitos', 3, { L: [2, 8, 2], R: [4, 10, 2], E: [12, 24, 6] },
      function (v) { return 'La energía magnética almacenada en un inductor es $U = \\frac{1}{2}L\\,i^2$. En un circuito RL con $L = ' + v.L + '\\ \\text{H}$, $R = ' + v.R + '\\ \\Omega$ y fem $\\varepsilon = ' + v.E + '\\ \\text{V}$, ¿cuánta energía (en joules) se almacena en el estado estacionario final?'; },
      function (v) { return 0.5 * v.L * Math.pow(v.E / v.R, 2); },
      'En régimen permanente $i = \\varepsilon/R$; por tanto $U = \\frac{1}{2} L (\\varepsilon/R)^2$.',
      { unit: 'J',
        mistakes: {
          noHalf: function (v) { return v.L * Math.pow(v.E / v.R, 2); },
          noSquare: function (v) { return 0.5 * v.L * (v.E / v.R); }
        },
        feedback: [
          { when: 'noHalf', say: 'Casi: la energía magnética lleva el factor $1/2$, es decir, $U = \\frac{1}{2}Li^2$.' },
          { when: 'noSquare', say: 'Casi: en la fórmula de la energía la corriente está elevada al cuadrado ($i^2$).' }
        ] }),

    E('ci-e-solucion-corriente-rl', 'circuitos', 2, { L: [1, 2, 1], R: [2, 4, 2], E: [8, 16, 4] },
      function (v) { return 'Resuelve el problema de valor inicial para la corriente en un circuito RL: $' + v.L + '\\,i\' + ' + v.R + '\\,i = ' + v.E + '$, con $i(0) = 0$. Escribe la solución explícita $i(t)$.'; },
      function (v) { return (v.E / v.R) + '*(1 - e^(-' + (v.R / v.L) + '*t))'; },
      'En forma estándar $i\' + \\frac{R}{L}i = \\frac{\\varepsilon}{L}$; con factor integrante $e^{(R/L)t}$ se obtiene $i(t) = \\frac{\\varepsilon}{R}(1 - e^{-Rt/L})$.',
      { exprVars: ['t'], domain: [0.1, 2],
        mistakes: {
          decay: function (v) { return (v.E / v.R) + '*e^(-' + (v.R / v.L) + '*t)'; },
          overL: function (v) { return (v.E / v.L) + '*(1 - e^(-' + (v.R / v.L) + '*t))'; }
        },
        feedback: [
          { when: 'decay', say: 'Casi: esa solución no cumple la condición inicial $i(0) = 0$; debe ser $(1 - e^{-Rt/L})$.' },
          { when: 'overL', say: 'Casi: la amplitud estacionaria es $\\varepsilon/R$, no $\\varepsilon/L$.' }
        ] }),

    E('ci-e-solucion-descarga-rc', 'circuitos', 2, { a: [2, 5, 1], q0: [4, 10, 2] },
      function (v) { return 'Resuelve la ecuación de descarga de un capacitor en un circuito RC: $q\' + ' + v.a + '\\,q = 0$, con carga inicial $q(0) = ' + v.q0 + '$. Escribe la solución explícita $q(t)$.'; },
      function (v) { return v.q0 + '*e^(-' + v.a + '*t)'; },
      'La ecuación lineal homogénea tiene factor integrante $e^{at}$ y su solución es el decaimiento directo $q(t) = q_0 e^{-at}$.',
      { exprVars: ['t'], domain: [0.1, 2],
        mistakes: {
          posExp: function (v) { return v.q0 + '*e^(' + v.a + '*t)'; },
          noConst: function (v) { return 'e^(-' + v.a + '*t)'; }
        },
        feedback: [
          { when: 'posExp', say: 'Casi: el exponente debe ser negativo para que represente una descarga amortiguada.' },
          { when: 'noConst', say: function (v) { return 'Casi: te faltó multiplicar por la carga inicial $q(0) = ' + v.q0 + '$.'; } }
        ] }),

    E('ci-e-solucion-carga-rc', 'circuitos', 3, { R: [2, 4, 2], k: [4, 8, 4], E: [12, 24, 6] },
      function (v) { return 'Resuelve el problema de valor inicial para la carga en un circuito RC: $' + v.R + '\\,q\' + ' + v.k + '\\,q = ' + v.E + '$, con condición inicial $q(0) = 0$. Escribe la solución explícita $q(t)$.'; },
      function (v) { return (v.E / v.k) + '*(1 - e^(-' + (v.k / v.R) + '*t))'; },
      'En forma estándar $q\' + \\frac{k}{R}q = \\frac{\\varepsilon}{R}$, cuya solución con reposo inicial es $q(t) = \\frac{\\varepsilon}{k}(1 - e^{-(k/R)t})$.',
      { exprVars: ['t'], domain: [0.1, 2],
        mistakes: {
          overR: function (v) { return (v.E / v.R) + '*(1 - e^(-' + (v.k / v.R) + '*t))'; },
          decay: function (v) { return (v.E / v.k) + '*e^(-' + (v.k / v.R) + '*t)'; }
        },
        feedback: [
          { when: 'overR', say: 'Casi: la carga máxima es $\\varepsilon/k = C\\varepsilon$, no $\\varepsilon/R$.' },
          { when: 'decay', say: 'Casi: al cargarse desde cero la dependencia temporal es $(1 - e^{-(k/R)t})$.' }
        ] }),

    /* ======================= 3. Tanques de mezclas con volumen variable (18) ======================= */
    C('me-c-volumen-variable-form', 'mezclas', 1,
      'En un tanque donde entra líquido a un gasto constante de $r_{\\text{in}}$ L/min y sale a $r_{\\text{out}}$ L/min, partiendo de un volumen inicial $V_0$, ¿cuál es la expresión para el volumen de líquido $V(t)$ en cualquier tiempo?',
      '$V(t) = V_0 + (r_{\\text{in}} - r_{\\text{out}})\\,t$', [
        ['$V(t) = V_0 + \\frac{r_{\\text{in}}}{r_{\\text{out}}}\\,t$', 'Casi: la tasa de cambio neta de volumen es la resta $r_{\\text{in}} - r_{\\text{out}}$, no su cociente.'],
        ['$V(t) = V_0 e^{(r_{\\text{in}} - r_{\\text{out}})t}$', 'Casi: como los caudales son constantes, el volumen cambia linealmente con el tiempo, no de forma exponencial.'],
        ['$V(t) = (r_{\\text{in}} - r_{\\text{out}})\\,t$', 'Casi: olvidaste sumar el volumen inicial $V_0$ presente en el tanque en $t = 0$.']],
      'La ecuación de balance de volumen es $V\' = r_{\\text{in}} - r_{\\text{out}}$, cuya integral inmediata es $V(t) = V_0 + (r_{\\text{in}} - r_{\\text{out}})t$.'),

    C('me-c-concentracion-salida', 'mezclas', 1,
      '¿Por qué en un tanque de mezclado bien agitado la tasa de salida de soluto se modela como $r_{\\text{out}}\\dfrac{A(t)}{V(t)}$ y no como $r_{\\text{out}}A(t)$?',
      'Porque del tanque sale volumen de mezcla, de modo que cada litro extraído porta la concentración instantánea $A(t)/V(t)$', [
        ['Porque la cantidad total $A(t)$ no se puede medir directamente en el laboratorio', 'Casi: la razón es física y dimensional; el líquido que sale tiene una concentración homogénea $A/V$.'],
        ['Porque la densidad del soluto disminuye cuadráticamente con el tiempo', 'Casi: se asume densidad uniforme y mezcla perfecta; el soluto extraído depende de su concentración por litro.'],
        ['Porque al evaporarse líquido el volumen $V(t)$ debe dividirse por convención', 'Casi: la mezcla sale por una tubería a caudal $r_{\\text{out}}$ portando la concentración del tanque.']],
      'Al multiplicar el caudal de salida (L/min) por la concentración en el tanque (g/L), se obtiene la tasa de soluto que sale (g/min).'),

    C('me-c-tipo-edo-mezclas-var', 'mezclas', 1,
      'Cuando las tasas de entrada y salida son distintas ($r_{\\text{in}} \\neq r_{\\text{out}}$), ¿cómo se clasifica matemáticamente la ecuación $A\' = r_{\\text{in}}c_{\\text{in}} - r_{\\text{out}}\\dfrac{A}{V_0 + (r_{\\text{in}} - r_{\\text{out}})t}$ con $c_{\\text{in}} > 0$?',
      'Ecuación diferencial lineal de primer orden no autónoma (con coeficientes dependientes de $t$)', [
        ['Ecuación diferencial de variables separables', 'Casi: como el denominador depende de $t$ y hay un término independiente $r_{\\text{in}}c_{\\text{in}}$, no se puede separar.'],
        ['Ecuación de Bernoulli con $n = -1$', 'Casi: la variable incógnita $A$ aparece a la primera potencia en el numerador; es puramente lineal en $A$.'],
        ['Ecuación diferencial exacta homogénea', 'Casi: el método estándar y directo para esta ecuación es el factor integrante de primer orden.']],
      'Al reescribirla en la forma estándar $A\' + P(t)A = Q$, con $P(t) = \\frac{r_{\\text{out}}}{V_0 + \\Delta r\\,t}$, es lineal con coeficiente variable.'),

    C('me-c-factor-integrante-tanque', 'mezclas', 2,
      'En un tanque donde el volumen varía como $V(t) = 100 + t$ y la salida es de $2\\ \\text{L/min}$, la ecuación en forma estándar es $A\' + \\dfrac{2}{100 + t}\\,A = 6$. ¿Cuál es el factor integrante $\\mu(t)$?',
      '$\\mu(t) = (100 + t)^2$', [
        ['$\\mu(t) = e^{2(100 + t)}$', 'Casi: la integral de $\\frac{2}{100 + t}\\,dt$ es $2\\ln(100 + t) = \\ln((100 + t)^2)$; al aplicar la exponencial queda $(100 + t)^2$.'],
        ['$\\mu(t) = 2\\ln(100 + t)$', 'Casi: esa es la integral $\\int P(t)\\,dt$; falta exponenciarla para obtener el factor integrante.'],
        ['$\\mu(t) = \\frac{1}{(100 + t)^2}$', 'Casi: el signo de $P(t)$ es positivo, por lo que la potencia resultante es $+2$, no $-2$.']],
      'Se calcula $\\mu(t) = e^{\\int \\frac{2}{100 + t}\\,dt} = e^{2\\ln(100 + t)} = (100 + t)^2$.'),

    C('me-c-validez-tanque', 'mezclas', 2,
      'Un tanque cuya capacidad máxima es de $500\\ \\text{L}$ contiene inicialmente $200\\ \\text{L}$. Si entra solución a $8\\ \\text{L/min}$ y sale a $3\\ \\text{L/min}$, ¿en qué intervalo de tiempo $t$ es válido el modelo diferencial de mezclado?',
      '$0 \\le t \\le 60\\ \\text{min}$, momento en el que el tanque alcanza los $500\\ \\text{L}$ y se derrama', [
        ['$0 \\le t \\le 100\\ \\text{min}$', 'Casi: a los 100 min el volumen sería $200 + 5(100) = 700\\ \\text{L}$, lo que excede por mucho la capacidad máxima.'],
        ['Para todo $t \\ge 0$ de forma indefinida', 'Casi: el modelo físico pierde validez en cuanto el líquido se derrama fuera de los bordes del recipiente.'],
        ['$0 \\le t \\le 40\\ \\text{min}$', 'Casi: en 40 min el volumen es $200 + 5(40) = 400\\ \\text{L}$; aún le falta para llenarse.']],
      'El volumen es $V(t) = 200 + 5t$. Igualando a la capacidad máxima $500 = 200 + 5t$, se obtiene $t = 60$ min.'),

    C('me-c-tiempo-vaciado-tanque', 'mezclas', 2,
      'Un depósito contiene $300\\ \\text{L}$ de salmuera. Entra agua pura a $2\\ \\text{L/min}$ pero se extrae mezcla a $5\\ \\text{L/min}$. ¿En qué instante $t$ se vacía el depósito y deja de tener sentido el modelo?',
      'A los $100\\ \\text{min}$, cuando el volumen llega a cero ($V(t) = 0$)', [
        ['A los $60\\ \\text{min}$', 'Casi: a los 60 min el volumen es $300 - 3(60) = 120\\ \\text{L}$; el tanque todavía contiene líquido.'],
        ['A los $150\\ \\text{min}$', 'Casi: la tasa neta de pérdida es $5 - 2 = 3\\ \\text{L/min}$, no $2\\ \\text{L/min}$.'],
        ['Nunca, porque la concentración decae exponencialmente hacia cero', 'Casi: la concentración decae pero el volumen físico disminuye linealmente hasta vaciarse por completo.']],
      'El volumen decrece según $V(t) = 300 - 3t$. Al hacer $V(t) = 0$, se obtiene $t = 300/3 = 100$ min.'),

    N('me-n-volumen-en-tiempo', 'mezclas', 1, { V0: [100, 300, 50], rin: [5, 8, 1], rout: [2, 4, 1], t: [10, 30, 5] },
      function (v) { return 'Un tanque contiene inicialmente $V_0 = ' + v.V0 + '\\ \\text{L}$ de solución. Entra líquido a razón de $' + v.rin + '\\ \\text{L/min}$ y se extrae mezcla a $' + v.rout + '\\ \\text{L/min}$. ¿Cuál es el volumen total de líquido (en litros) tras $' + v.t + '\\ \\text{minutos}$?'; },
      function (v) { return v.V0 + (v.rin - v.rout) * v.t; },
      'El volumen varía linealmente: $V(t) = V_0 + (r_{\\text{in}} - r_{\\text{out}})t$.',
      { unit: 'L',
        mistakes: {
          diffOnly: function (v) { return (v.rin - v.rout) * v.t; },
          addRates: function (v) { return v.V0 + (v.rin + v.rout) * v.t; }
        },
        feedback: [
          { when: 'diffOnly', say: 'Casi: ese es el volumen neto que entró; debes sumarle el volumen inicial $V_0$.' },
          { when: 'addRates', say: 'Casi: el caudal de salida se resta del de entrada, no se suma.' }
        ] }),

    N('me-n-tiempo-desborde', 'mezclas', 1, { Vmax: [400, 600, 50], V0: [100, 200, 50], rin: [6, 10, 2], rout: [2, 4, 1] },
      function (v) { return 'Un contenedor con capacidad máxima de $' + v.Vmax + '\\ \\text{L}$ contiene $' + v.V0 + '\\ \\text{L}$ de líquido. Se alimenta a $' + v.rin + '\\ \\text{L/min}$ y se bombea hacia afuera a $' + v.rout + '\\ \\text{L/min}$. ¿En cuántos minutos se derramará el contenedor?'; },
      function (v) { return (v.Vmax - v.V0) / (v.rin - v.rout); },
      'El tiempo de llenado sale de resolver $V_0 + (r_{\\text{in}} - r_{\\text{out}})t = V_{\\text{max}}$.',
      { unit: 'min',
        mistakes: {
          overTotal: function (v) { return v.Vmax / (v.rin - v.rout); },
          overRin: function (v) { return (v.Vmax - v.V0) / v.rin; }
        },
        feedback: [
          { when: 'overTotal', say: 'Casi: el tanque no empieza vacío; solo necesita llenarse un volumen $V_{\\text{max}} - V_0$.' },
          { when: 'overRin', say: 'Casi: debes considerar la tasa neta de acumulación $r_{\\text{in}} - r_{\\text{out}}$, no solo lo que entra.' }
        ] }),

    N('me-n-sal-tanque-volumen-cte', 'mezclas', 2, { V: [100, 200, 50], c: [2, 5, 1], r: [2, 5, 1], t: [20, 50, 10] },
      function (v) { return 'Un tanque contiene $' + v.V + '\\ \\text{L}$ de agua pura ($A(0) = 0$). Entra salmuera con $' + v.c + '\\ \\text{g/L}$ a razón de $' + v.r + '\\ \\text{L/min}$ y sale mezcla a la misma tasa de $' + v.r + '\\ \\text{L/min}$. ¿Cuántos gramos de sal hay en el tanque a los $' + v.t + '\\ \\text{minutos}$?'; },
      function (v) { return v.c * v.V * (1 - Math.exp(-v.r * v.t / v.V)); },
      'Con volumen constante, $A(t) = c_{\\text{in}} V (1 - e^{-rt/V})$.',
      { unit: 'g',
        mistakes: {
          steadyOnly: function (v) { return v.c * v.V; },
          noV: function (v) { return v.c * (1 - Math.exp(-v.r * v.t / v.V)); }
        },
        feedback: [
          { when: 'steadyOnly', say: 'Casi: esa es la cantidad final en estado estacionario; debes multiplicar por el factor transitorio $(1 - e^{-rt/V})$.' },
          { when: 'noV', say: 'Casi: la cantidad máxima de sal en el tanque es $c\\cdot V$, no solo la concentración $c$.' }
        ] }),

    N('me-n-tanque-se-llena-sal', 'mezclas', 2, { V0: [50, 150, 25], c: [1, 4, 1], t: [20, 50, 10] },
      function (v) { return 'Un tanque contiene inicialmente $' + v.V0 + '\\ \\text{L}$ de agua pura ($A(0)=0$). Entra salmuera a $3\\ \\text{L/min}$ con concentración de $' + v.c + '\\ \\text{g/L}$ y se extrae mezcla bien agitada a $2\\ \\text{L/min}$. ¿Cuántos gramos de sal contiene el tanque en $t = ' + v.t + '\\ \\text{min}$?'; },
      function (v) { return v.c * (v.V0 + v.t) - v.c * Math.pow(v.V0, 3) / Math.pow(v.V0 + v.t, 2); },
      'Con $V(t) = V_0 + t$ y factor $(V_0 + t)^2$, la solución es $A(t) = c(V_0 + t) - c V_0^3 / (V_0 + t)^2$.',
      { unit: 'g',
        mistakes: {
          fixedV: function (v) { return v.c * (v.V0 + v.t); },
          noSquare: function (v) { return v.c * (v.V0 + v.t) - v.c * Math.pow(v.V0, 2) / (v.V0 + v.t); }
        },
        feedback: [
          { when: 'fixedV', say: 'Casi: falta el término transitorio originado por la condición inicial $A(0) = 0$.' },
          { when: 'noSquare', say: 'Casi: el factor integrante es $(V_0 + t)^2$, por lo que el denominador lleva exponente 2.' }
        ] }),

    N('me-n-concentracion-tanque-llena', 'mezclas', 2, { V0: [50, 100, 25], c: [2, 6, 2], t: [20, 40, 10] },
      function (v) { return 'En el tanque en llenado anterior ($V_0 = ' + v.V0 + '\\ \\text{L}$ de agua pura, entrada a $3\\ \\text{L/min}$ con $' + v.c + '\\ \\text{g/L}$, salida a $2\\ \\text{L/min}$), ¿cuál es la concentración instantánea $C = A(t)/V(t)$ (en $\\text{g/L}$) a los $t = ' + v.t + '\\ \\text{min}$?'; },
      function (v) { return v.c - v.c * Math.pow(v.V0, 3) / Math.pow(v.V0 + v.t, 3); },
      'Dividiendo $A(t)$ entre $V(t) = V_0 + t$ se obtiene $C(t) = c_{\\text{in}}(1 - V_0^3 / (V_0 + t)^3)$.',
      { unit: 'g/L', where: function (v) { return v.V0 / (v.V0 + v.t) <= 0.85 && v.V0 / (v.V0 + v.t) >= 0.45; },
        mistakes: {
          justCin: function (v) { return v.c; },
          amountOnly: function (v) { return v.c * (v.V0 + v.t) - v.c * Math.pow(v.V0, 3) / Math.pow(v.V0 + v.t, 2); }
        },
        feedback: [
          { when: 'justCin', say: 'Casi: esa es la concentración del líquido que entra; en el tanque la concentración aún no llega a ese valor.' },
          { when: 'amountOnly', say: 'Casi: esa es la masa total de sal $A(t)$ en gramos; debes dividirla entre el volumen $V(t)$ para dar la concentración.' }
        ] }),

    N('me-n-tanque-vaciando-tiempo', 'mezclas', 2, { V0: [120, 240, 30], rin: [2, 4, 1], rout: [5, 8, 1] },
      function (v) { return 'Un depósito almacena inicialmente $' + v.V0 + '\\ \\text{L}$ de líquido. Se alimenta a $' + v.rin + '\\ \\text{L/min}$ y se drena a razón de $' + v.rout + '\\ \\text{L/min}$ ($r_{\\text{out}} > r_{\\text{in}}$). ¿En cuántos minutos el depósito quedará completamente vacío?'; },
      function (v) { return v.V0 / (v.rout - v.rin); },
      'El volumen decrece a tasa constante $r_{\\text{out}} - r_{\\text{in}}$. El tiempo de vaciado es $V_0 / (r_{\\text{out}} - r_{\\text{in}})$.',
      { unit: 'min',
        mistakes: {
          overRout: function (v) { return v.V0 / v.rout; },
          addRates: function (v) { return v.V0 / (v.rout + v.rin); }
        },
        feedback: [
          { when: 'overRout', say: 'Casi: olvidaste que entra líquido a razón de $r_{\\text{in}}$, lo que retarda el vaciado.' },
          { when: 'addRates', say: 'Casi: la tasa neta de vaciado es la diferencia $r_{\\text{out}} - r_{\\text{in}}$, no la suma.' }
        ] }),

    N('me-n-agua-pura-lavado-cte', 'mezclas', 2, { V: [100, 200, 50], A0: [10, 30, 5], r: [2, 5, 1], t: [20, 40, 10] },
      function (v) { return 'Un depósito con un volumen fijo de $' + v.V + '\\ \\text{L}$ contiene $' + v.A0 + '\\ \\text{kg}$ de salmuera. Se lava inyectando agua pura a $' + v.r + '\\ \\text{L/min}$ y extrayendo mezcla a $' + v.r + '\\ \\text{L/min}$. ¿Cuántos kilogramos de sal permanecen en el tanque tras $t = ' + v.t + '\\ \\text{min}$?'; },
      function (v) { return v.A0 * Math.exp(-v.r * v.t / v.V); },
      'Al entrar agua pura $c_{\\text{in}} = 0$, la sal remanente decae exponencialmente según $A(t) = A_0 e^{-rt/V}$.',
      { unit: 'kg', where: function (v) { return Math.abs(v.r * v.t / v.V - Math.log(2)) > 0.08; },
        mistakes: {
          oneMinus: function (v) { return v.A0 * (1 - Math.exp(-v.r * v.t / v.V)); },
          invExp: function (v) { return v.A0 * Math.exp(v.r * v.t / v.V); }
        },
        feedback: [
          { when: 'oneMinus', say: 'Casi: esa es la cantidad de sal que ya salió del tanque; la sal que permanece decae como $A_0 e^{-rt/V}$.' },
          { when: 'invExp', say: 'Casi: la sal se extrae del tanque, por lo que debe decaer exponencialmente ($e^{-rt/V}$), no crecer.' }
        ] }),

    N('me-n-tanque-doble-entrada', 'mezclas', 3, { V: [100, 200, 50], c1: [1, 4, 1], c2: [2, 6, 1] },
      function (v) { return 'A un tanque de mezclado con volumen constante de $' + v.V + '\\ \\text{L}$ ingresan dos tuberías: la primera aporta $2\\ \\text{L/min}$ con $' + v.c1 + '\\ \\text{g/L}$ y la segunda $3\\ \\text{L/min}$ con $' + v.c2 + '\\ \\text{g/L}$. La mezcla sale a $5\\ \\text{L/min}$. ¿Cuántos gramos de sal contendrá el tanque en el estado estacionario final?'; },
      function (v) { return (2 * v.c1 + 3 * v.c2) * v.V / 5; },
      'En estado estacionario la tasa de entrada de sal ($2 c_1 + 3 c_2$) iguala a la de salida ($5 A / V$), de modo que $A_{\\text{est}} = (2 c_1 + 3 c_2) V / 5$.',
      { unit: 'g', where: function (v) { return v.c1 !== v.c2; },
        mistakes: {
          noVol: function (v) { return (2 * v.c1 + 3 * v.c2) / 5; },
          averageC: function (v) { return 0.5 * (v.c1 + v.c2) * v.V; }
        },
        feedback: [
          { when: 'noVol', say: 'Casi: esa es la concentración media que entra; para la masa total de sal debes multiplicarla por el volumen $V$.' },
          { when: 'averageC', say: 'Casi: los caudales de las tuberías son distintos ($2$ y $3\\ \\text{L/min}$), por lo que se requiere un promedio ponderado por gasto.' }
        ] }),

    N('me-n-sal-tanque-exponente-uno', 'mezclas', 3, { V0: [50, 150, 25], c: [2, 5, 1], t: [10, 30, 10] },
      function (v) { return 'Un tanque con $V_0 = ' + v.V0 + '\\ \\text{L}$ de agua pura ($A(0)=0$) recibe salmuera a $4\\ \\text{L/min}$ con $' + v.c + '\\ \\text{g/L}$ y sale mezcla a $2\\ \\text{L/min}$ ($V(t) = ' + v.V0 + ' + 2t$). La EDO es $A\' + \\frac{2}{' + v.V0 + ' + 2t}A = ' + (4 * v.c) + '$. ¿Cuántos gramos de sal hay a los $t = ' + v.t + '\\ \\text{min}$?'; },
      function (v) { return v.c * (v.V0 + 2 * v.t) - v.c * Math.pow(v.V0, 2) / (v.V0 + 2 * v.t); },
      'El factor integrante es $(V_0 + 2t)$. Al integrar $((V_0 + 2t)A)\' = 4c(V_0 + 2t)$ con $A(0) = 0$ se obtiene $A(t) = c(V_0 + 2t) - c V_0^2 / (V_0 + 2t)$.',
      { unit: 'g',
        mistakes: {
          steadyOnly: function (v) { return v.c * (v.V0 + 2 * v.t); },
          squareDenom: function (v) { return v.c * (v.V0 + 2 * v.t) - v.c * Math.pow(v.V0, 3) / Math.pow(v.V0 + 2 * v.t, 2); }
        },
        feedback: [
          { when: 'steadyOnly', say: 'Casi: olvidaste el término transitorio con signo negativo proveniente de la condición inicial $A(0) = 0$.' },
          { when: 'squareDenom', say: 'Casi: el factor integrante aquí es lineal $(V_0 + 2t)^1$, no cuadrático.' }
        ] }),

    E('me-e-tanque-cte-sol', 'mezclas', 2, { V: [50, 100, 50], c: [2, 4, 1], r: [2, 4, 2] },
      function (v) { return 'Resuelve el problema de valor inicial para la sal en un tanque con volumen fijo $V = ' + v.V + '\\ \\text{L}$ donde entra salmuera a $' + v.r + '\\ \\text{L/min}$ con $' + v.c + '\\ \\text{g/L}$ y sale al mismo caudal, con $A(0) = 0$. Escribe la solución explícita $A(t)$.'; },
      function (v) { return (v.c * v.V) + '*(1 - e^(-' + (v.r / v.V) + '*t))'; },
      'En forma estándar $A\' + \\frac{r}{V}A = r c$. La solución con reposo inicial es $A(t) = c V(1 - e^{-rt/V})$.',
      { exprVars: ['t'], domain: [0.5, 10],
        mistakes: {
          noVol: function (v) { return v.c + '*(1 - e^(-' + (v.r / v.V) + '*t))'; },
          decay: function (v) { return (v.c * v.V) + '*e^(-' + (v.r / v.V) + '*t)'; }
        },
        feedback: [
          { when: 'noVol', say: 'Casi: la masa total de sal en el equilibrio es $c\\cdot V$, no solo la concentración $c$.' },
          { when: 'decay', say: 'Casi: como parte de agua pura, la cantidad asciende con el factor $(1 - e^{-rt/V})$.' }
        ] }),

    E('me-e-tanque-vaciando-sol', 'mezclas', 3, { A0: [10, 40, 10] },
      function (v) { return 'Un tanque tiene $100\\ \\text{L}$ de salmuera con $' + v.A0 + '\\ \\text{kg}$ de sal. Entra agua pura a $1\\ \\text{L/min}$ y sale mezcla a $2\\ \\text{L/min}$ ($V(t) = 100 - t$). La EDO es $A\' + \\frac{2}{100 - t}A = 0$ con $A(0) = ' + v.A0 + '$. Escribe la solución explícita $A(t)$.'; },
      function (v) { return (v.A0 / 10000) + '*(100 - t)^2'; },
      'Separando $\\frac{dA}{A} = \\frac{-2}{100 - t}\\,dt$ se integra como $\\ln A = 2\\ln(100 - t) + C = \\ln((100 - t)^2) + C$. Con $A(0) = A_0$ queda $A(t) = \\frac{A_0}{10000}(100 - t)^2$.',
      { exprVars: ['t'], domain: [1, 50],
        mistakes: {
          negSquare: function (v) { return v.A0 + '*(100 - t)^(-2)'; },
          linear: function (v) { return (v.A0 / 100) + '*(100 - t)'; }
        },
        feedback: [
          { when: 'negSquare', say: 'Casi: al integrar $\\frac{-2}{100 - t}\\,dt$, la derivada de $100 - t$ aporta un signo menos, dando $+2\\ln(100 - t)$.' },
          { when: 'linear', say: 'Casi: la potencia de $100 - t$ es cuadrática porque el coeficiente de salida es 2.' }
        ] }),

    E('me-e-tanque-llenando-sol', 'mezclas', 3, { m: [1, 4, 1] },
      function (v) { return 'Resuelve el problema de valor inicial para un tanque que se llena: $A\' + \\frac{2}{100 + t}\\,A = ' + (3 * v.m) + '$, con condición inicial $A(0) = 0$. Escribe la solución explícita $A(t)$.'; },
      function (v) { return v.m + '*(100 + t) - ' + (v.m * 1000000) + '/(100 + t)^2'; },
      'Multiplicando por $(100 + t)^2$: $((100 + t)^2 A)\' = 3m(100 + t)^2 \\Rightarrow (100 + t)^2 A = m(100 + t)^3 - m(100)^3$. Al dividir entre $(100 + t)^2$ queda la solución.',
      { exprVars: ['t'], domain: [1, 50],
        mistakes: {
          noConst: function (v) { return v.m + '*(100 + t)'; },
          linearDenom: function (v) { return v.m + '*(100 + t) - ' + (v.m * 10000) + '/(100 + t)'; }
        },
        feedback: [
          { when: 'noConst', say: 'Casi: falta restar el término transitorio $\\frac{m\\cdot 10^6}{(100 + t)^2}$ fijado por $A(0) = 0$.' },
          { when: 'linearDenom', say: 'Casi: al dividir la constante entre el factor $(100 + t)^2$, el denominador queda al cuadrado.' }
        ] }),

    /* ======================= 4. Crecimiento poblacional, logística y cosecha (16) ======================= */
    C('po-c-malthus-vs-logistica', 'poblaciones', 1,
      '¿Cuál es la diferencia conceptual fundamental entre el modelo poblacional de Malthus ($P\' = rP$) y el modelo logístico de Verhulst ($P\' = rP(1 - P/K)$)?',
      'El modelo logístico introduce una autorregulación por competencia ambiental $(1 - P/K)$ que frena el crecimiento conforme $P$ se aproxima a la capacidad de carga $K$', [
        ['El modelo logístico predice que la población crece de manera ilimitada y exponencial para todo tiempo', 'Casi: ese es precisamente el comportamiento del modelo malthusiano, no del logístico.'],
        ['El modelo malthusiano considera recursos finitos mientras que el logístico asume espacio infinito', 'Casi: es exactamente al revés; el modelo logístico modela recursos finitos con capacidad $K$.'],
        ['El modelo logístico es de segundo orden mientras que el malthusiano es de primer orden', 'Casi: ambos modelos son ecuaciones diferenciales de primer orden en la variable $P(t)$.']],
      'El factor $(1 - P/K)$ representa la resistencia del medio y limita el crecimiento hacia la capacidad de carga $K$.'),

    C('po-c-inflexion-logistica', 'poblaciones', 1,
      'Para una población que evoluciona siguiendo el modelo logístico sin cosecha $P\' = rP(1 - P/K)$, ¿en qué tamaño poblacional $P$ ocurre la máxima rapidez absoluta de crecimiento $P\'$?',
      'En la mitad de la capacidad de carga, $P = K/2$', [
        ['En la capacidad de carga completa, $P = K$', 'Casi: cuando $P = K$ la rapidez de crecimiento es cero ($P\' = 0$), pues se ha alcanzado el equilibrio.'],
        ['Cerca de $P = 0$', 'Casi: cerca de cero hay muy pocos individuos para reproducirse, por lo que la rapidez absoluta es muy pequeña.'],
        ['En $P = 3K/4$', 'Casi: derivando $f(P) = rP - \\frac{r}{K}P^2$ respecto a $P$ e igualando a cero se obtiene exactamente $P = K/2$.']],
      'La tasa $f(P) = rP(1 - P/K)$ es una parábola con vértice en su punto medio $P = K/2$, que corresponde al punto de inflexión de la curva sigmoide.'),

    C('po-c-cosecha-msy', 'poblaciones', 2,
      'Si una especie que sigue la ecuación logística $P\' = rP(1 - P/K)$ se somete a una captura constante $h$ ($P\' = rP(1 - P/K) - h$), ¿cuál es el rendimiento máximo sostenible $h_{\\text{max}}$ (MSY)?',
      '$h_{\\text{max}} = \\frac{rK}{4}$, que coincide con el valor máximo de la parábola logística en $P = K/2$', [
        ['$h_{\\text{max}} = rK$', 'Casi: $rK$ superaría por mucho la capacidad reproductiva máxima de la población, causando su extinción.'],
        ['$h_{\\text{max}} = \\frac{rK}{2}$', 'Casi: el valor de la población donde ocurre el máximo es $K/2$, pero la tasa de crecimiento allí vale $r(K/2)(1 - 1/2) = rK/4$.'],
        ['$h_{\\text{max}} = \\frac{r}{4K}$', 'Casi: dimensionalmente la tasa de cosecha debe ser proporcional a $rK$, no a $r/K$.']],
      'El máximo de $f(P) = rP(1 - P/K)$ se alcanza en $P = K/2$ y vale $f(K/2) = r(K/2)(1/2) = rK/4$.'),

    C('po-c-extincion-sobrepesca', 'poblaciones', 2,
      'En el modelo logístico con cosecha constante $P\' = rP(1 - P/K) - h$, ¿qué ocurre si la tasa de captura supera el valor crítico ($h > rK/4$)?',
      'No existen puntos de equilibrio reales y la población decrece inevitablemente ($P\' < 0$) hasta extinguirse en tiempo finito', [
        ['La población se estabiliza en un nuevo equilibrio por encima de $K$', 'Casi: con $h > rK/4$ el discriminante es negativo y no existe ningún equilibrio real.'],
        ['La población oscila periódicamente alrededor de $K/2$', 'Casi: en una ecuación de primer orden autónoma escalar no puede haber oscilaciones periódicas.'],
        ['La población continúa creciendo de forma exponencial', 'Casi: como la extracción supera la tasa máxima de natalidad, la derivada es siempre negativa y la especie se extingue.']],
      'Al ser $h > rK/4$, el lado derecho $rP(1 - P/K) - h$ es estrictamente negativo para todo $P$, llevando a la extinción.'),

    C('po-c-equilibrios-cosecha', 'poblaciones', 2,
      'Cuando la tasa de cosecha es moderada ($0 < h < rK/4$), la ecuación de equilibrio $rP(1 - P/K) - h = 0$ tiene dos soluciones reales $P_1 < P_2$. ¿Cuál es la estabilidad de estos equilibrios?',
      '$P_2$ (el mayor) es un equilibrio estable (atractor) y $P_1$ (el menor) es inestable (umbral crítico de supervivencia)', [
        ['Ambos equilibrios son estables', 'Casi: en una EDO escalar de primer orden dos equilibrios consecutivos alternan necesariamente su estabilidad.'],
        ['$P_1$ es estable y $P_2$ es inestable', 'Casi: a la derecha de $P_2$ la derivada es negativa y a la izquierda es positiva, lo que hace estable a $P_2$.'],
        ['Ambos equilibrios son inestables', 'Casi: la raíz mayor $P_2$ actúa como la capacidad de carga modificada y es estable.']],
      'La raíz superior $P_2$ tiene $f\'(P_2) < 0$ (estable), mientras que la raíz inferior $P_1$ tiene $f\'(P_1) > 0$ (inestable; si $P < P_1$ colapsa a 0).'),

    C('po-c-allee-umbral', 'poblaciones', 1,
      'En un modelo poblacional con efecto Allee $P\' = rP(1 - P/K)(P/T - 1)$, con $0 < T < K$, ¿qué ocurre si el número inicial de individuos $P(0)$ cae por debajo del umbral $T$?',
      'La derivada se vuelve negativa ($P\' < 0$) y la población declina hasta extinguirse ($P \\to 0$)', [
        ['La población crece rápidamente hacia la capacidad de carga $K$', 'Casi: cuando $P < T$ el factor $(P/T - 1)$ es negativo, por lo que la población decae hacia cero.'],
        ['La población permanece constante en su valor inicial', 'Casi: $T$ es un equilibrio inestable; cualquier perturbación por debajo de $T$ provoca declive continuo.'],
        ['La población supera la capacidad de carga $K$', 'Casi: por debajo del umbral mínimo de densidad $T$ los individuos no logran reproducirse eficazmente.']],
      'El efecto Allee modela especies gregarias donde si la población cae por debajo del umbral crítico $T$, la tasa neta es negativa y se extingue.'),

    N('po-n-capacidad-carga', 'poblaciones', 1, { a: [120, 360, 40], b: [2, 6, 1] },
      function (v) { return 'Una población de truchas en una reserva crece según la ecuación $P\' = ' + v.a + '\\,P - ' + v.b + '\\,P^2$, donde $P$ está en miles de peces. ¿Cuál es la capacidad de carga ambiental $K$ (en miles de peces)?'; },
      function (v) { return v.a / v.b; },
      'Escribiendo $P\' = a P (1 - (b/a) P) = r P (1 - P/K)$, la capacidad de carga es $K = a / b$.',
      { unit: 'miles de peces',
        mistakes: {
          half: function (v) { return v.a / (2 * v.b); },
          prod: function (v) { return v.a * v.b; }
        },
        feedback: [
          { when: 'half', say: 'Casi: $a/(2b)$ es el punto de máxima velocidad de crecimiento, no la capacidad de carga final.' },
          { when: 'prod', say: 'Casi: al igualar $aP - bP^2 = 0$ con $P \\neq 0$, se despeja $P = a/b$.' }
        ] }),

    N('po-n-duplicacion-malthus', 'poblaciones', 1, { r: [0.2, 0.6, 0.1] },
      function (v) { return 'Una cepa de levadura prolifera a una tasa malthusiana de crecimiento de $r = ' + v.r + '\\ \\text{día}^{-1}$. ¿Cuántos días tarda en triplicar su población inicial?'; },
      function (v) { return Math.log(3) / v.r; },
      'De $P(t) = P_0 e^{rt} = 3P_0$ se tiene $e^{rt} = 3 \\Rightarrow t = \\ln(3)/r$.',
      { unit: 'días',
        mistakes: {
          logTwo: function (v) { return Math.log(2) / v.r; },
          threeOverR: function (v) { return 3 / v.r; }
        },
        feedback: [
          { when: 'logTwo', say: 'Casi: $\\ln(2)/r$ es el tiempo de duplicación; para triplicar se utiliza $\\ln(3)$.' },
          { when: 'threeOverR', say: 'Casi: el crecimiento es exponencial, por lo que se requiere el logaritmo $\\ln 3$, no el número 3.' }
        ] }),

    N('po-n-maxima-tasa-cosecha', 'poblaciones', 2, { r: [0.2, 0.8, 0.2], K: [1000, 4000, 1000] },
      function (v) { return 'Una manada de bisontes se modela mediante la logística $P\' = ' + v.r + '\\,P\\left(1 - \\dfrac{P}{' + v.K + '}\\right)$. ¿Cuál es la máxima tasa de extracción sostenible anual $h_{\\text{max}} = \\frac{rK}{4}$ (en individuos por año)?'; },
      function (v) { return v.r * v.K / 4; },
      'El rendimiento máximo sostenible ocurre en $P = K/2$ y vale $h_{\\text{max}} = rK/4$.',
      { unit: 'individuos/año',
        mistakes: {
          half: function (v) { return v.r * v.K / 2; },
          full: function (v) { return v.r * v.K; }
        },
        feedback: [
          { when: 'half', say: 'Casi: la población óptima es $K/2$, pero la tasa máxima de captura es $r(K/2)(1 - 1/2) = rK/4$.' },
          { when: 'full', say: 'Casi: $rK$ causaría el colapso inmediato de la población; el valor máximo sostenible es $rK/4$.' }
        ] }),

    N('po-n-poblacion-inflexion', 'poblaciones', 2, { a: [40, 120, 20], b: [2, 6, 2] },
      function (v) { return 'Para una especie marina que sigue la ecuación logística $P\' = ' + v.a + '\\,P - ' + v.b + '\\,P^2$, ¿a qué tamaño poblacional $P$ la tasa neta de incremento por unidad de tiempo es máxima?'; },
      function (v) { return v.a / (2 * v.b); },
      'La tasa de cambio es máxima en el punto de inflexión, que se ubica en la mitad de la capacidad de carga: $P = K/2 = a / (2b)$.',
      { unit: 'individuos',
        mistakes: {
          carrying: function (v) { return v.a / v.b; },
          prod: function (v) { return v.a * v.b; }
        },
        feedback: [
          { when: 'carrying', say: 'Casi: $a/b$ es la capacidad de carga final donde el crecimiento se frena a cero ($P\' = 0$).' },
          { when: 'prod', say: 'Casi: el vértice de la parábola $aP - bP^2$ se localiza en $-a/(2(-b)) = a/(2b)$.' }
        ] }),

    N('po-n-poblacion-logistica-tiempo', 'poblaciones', 2, { K: [600, 1200, 200], r: [0.2, 0.5, 0.1], P0: [100, 200, 50], t: [2, 4, 1] },
      function (v) { return 'Una reserva de ciervos tiene $K = ' + v.K + '$, tasa intrínseca $r = ' + v.r + '\\ \\text{año}^{-1}$ y población inicial $P_0 = ' + v.P0 + '$. Usando la solución logística $P(t) = \\frac{K}{1 + ((K - P_0)/P_0)e^{-rt}}$, calcula el número de ciervos tras $t = ' + v.t + '\\ \\text{años}$.'; },
      function (v) { return v.K / (1 + ((v.K - v.P0) / v.P0) * Math.exp(-v.r * v.t)); },
      'Se sustituye directamente $t$ en la solución analítica de la ecuación logística de Verhulst.',
      { unit: 'ciervos',
        mistakes: {
          linear: function (v) { return v.P0 * Math.exp(v.r * v.t); },
          noConst: function (v) { return v.K / (1 + Math.exp(-v.r * v.t)); }
        },
        feedback: [
          { when: 'linear', say: 'Casi: esa es la solución de Malthus sin considerar la capacidad de carga limitante $K$.' },
          { when: 'noConst', say: 'Casi: te faltó incluir el factor $(K - P_0)/P_0$ que ajusta la condición inicial.' }
        ] }),

    N('po-n-equilibrio-alto-cosecha', 'poblaciones', 2, { r: [0.5, 1.0, 0.5], K: [200, 400, 100], h: [20, 40, 10] },
      function (v) { return 'Una población con $r = ' + v.r + '$, $K = ' + v.K + '$ y extracción constante de $h = ' + v.h + '\\ \\text{año}^{-1}$ cumple $P^2 - ' + v.K + '\\,P + ' + (v.K * v.h / v.r) + ' = 0$. Calcula el equilibrio poblacional estable (la raíz mayor de la cuadrática).'; },
      function (v) { return (v.K + Math.sqrt(v.K * v.K - 4 * v.K * v.h / v.r)) / 2; },
      'La ecuación cuadrática $rP(1 - P/K) - h = 0$ tiene como raíz superior $P_2 = (K + \\sqrt{K^2 - 4Kh/r})/2$, que representa el equilibrio estable.',
      { unit: 'individuos',
        mistakes: {
          lowerRoot: function (v) { return (v.K - Math.sqrt(v.K * v.K - 4 * v.K * v.h / v.r)) / 2; },
          noHarvest: function (v) { return v.K; }
        },
        feedback: [
          { when: 'lowerRoot', say: 'Casi: esa es la raíz menor, que corresponde al umbral inestable de extinción.' },
          { when: 'noHarvest', say: 'Casi: la presencia de cosecha constante $h > 0$ reduce el nivel de equilibrio por debajo de $K$.' }
        ] }),

    N('po-n-malthus-inmigracion', 'poblaciones', 3, { r: [0.1, 0.3, 0.1], I: [10, 30, 10], P0: [50, 150, 50], t: [2, 4, 1] },
      function (v) { return 'Una colonia crece según $P\' = ' + v.r + '\\,P + ' + v.I + '$, donde entran $' + v.I + '\\ \\text{individuos/año}$ de forma constante por inmigración. Si la población inicial es $P(0) = ' + v.P0 + '$, ¿cuántos individuos habrá al cabo de $t = ' + v.t + '\\ \\text{años}$?'; },
      function (v) { return (v.P0 + v.I / v.r) * Math.exp(v.r * v.t) - v.I / v.r; },
      'Resolviendo la ecuación lineal de primer orden $P\' - rP = I$ con factor integrante $e^{-rt}$ se obtiene $P(t) = (P_0 + I/r)e^{rt} - I/r$.',
      { unit: 'individuos',
        mistakes: {
          justMalthus: function (v) { return v.P0 * Math.exp(v.r * v.t) + v.I * v.t; },
          noMinus: function (v) { return (v.P0 + v.I / v.r) * Math.exp(v.r * v.t); }
        },
        feedback: [
          { when: 'justMalthus', say: 'Casi: los inmigrantes que ingresan también se reproducen con tasa $r$, por lo que no se pueden sumar como $I\\cdot t$.' },
          { when: 'noMinus', say: 'Casi: falta restar la componente particular $I/r$ para satisfacer la condición inicial.' }
        ] }),

    N('po-n-tiempo-logistica-porcentaje', 'poblaciones', 3, { r: [0.2, 0.5, 0.1], K: [500, 1000, 250], P0: [50, 100, 50] },
      function (v) { return 'Una especie sigue el modelo logístico $P\' = ' + v.r + '\\,P(1 - P/' + v.K + ')$ con $P_0 = ' + v.P0 + '$. ¿En cuántos años alcanzará el $80\\,\\%$ de su capacidad de carga ($P = ' + (0.8 * v.K) + '$)?'; },
      function (v) { return (1 / v.r) * Math.log(4 * (v.K - v.P0) / v.P0); },
      'De $P(t) = K / (1 + C e^{-rt}) = 0.8 K$ con $C = (K - P_0)/P_0$ se tiene $1 + C e^{-rt} = 1.25 \\Rightarrow e^{rt} = 4C \\Rightarrow t = \\ln(4C)/r$.',
      { unit: 'años',
        mistakes: {
          noCoeff: function (v) { return (1 / v.r) * Math.log((v.K - v.P0) / v.P0); },
          invR: function (v) { return v.r * Math.log(4 * (v.K - v.P0) / v.P0); }
        },
        feedback: [
          { when: 'noCoeff', say: 'Casi: ese sería el tiempo para alcanzar el 50 % de la capacidad de carga ($K/2$), no el 80 %.' },
          { when: 'invR', say: 'Casi: al despejar el tiempo se divide entre la tasa $r$, no se multiplica por ella.' }
        ] }),

    E('po-e-solucion-malthus-cosecha', 'poblaciones', 2, { h: [4, 12, 4], P0: [10, 20, 5] },
      function (v) { return 'Resuelve el problema de valor inicial para una población con tasa neta $r = 2$ y caza constante: $P\' = 2\\,P - ' + v.h + '$, con $P(0) = ' + v.P0 + '$. Escribe la solución explícita $P(t)$.'; },
      function (v) { return (v.h / 2) + ' + ' + (v.P0 - v.h / 2) + '*e^(2*t)'; },
      'En forma estándar $P\' - 2P = -h$. La solución general es $P(t) = \\frac{h}{2} + C e^{2t}$; con $P(0) = P_0$ queda $P(t) = \\frac{h}{2} + (P_0 - \\frac{h}{2})e^{2t}$.',
      { exprVars: ['t'], domain: [0.1, 1.5],
        mistakes: {
          noSteady: function (v) { return v.P0 + '*e^(2*t) - ' + v.h + '*t'; },
          wrongSign: function (v) { return (v.h / 2) + ' - ' + (v.P0 - v.h / 2) + '*e^(2*t)'; }
        },
        feedback: [
          { when: 'noSteady', say: 'Casi: la extracción continua produce una traslación del equilibrio $h/2$, no un término $-ht$.' },
          { when: 'wrongSign', say: function (v) { return 'Casi: con signo menos en la exponencial la solución en $t=0$ no cumple la condición inicial $P(0) = ' + v.P0 + '$.'; } }
        ] }),

    E('po-e-solucion-logistica-formula', 'poblaciones', 3, { K: [3, 8, 1] },
      function (v) { return 'Resuelve el problema de valor inicial logístico $P\' = P\\left(1 - \\dfrac{P}{' + v.K + '}\\right)$, con población inicial normalizada $P(0) = 1$. Escribe la solución explícita $P(t)$.'; },
      function (v) { return v.K + '/(1 + ' + (v.K - 1) + '*e^(-t))'; },
      'Separando variables por fracciones parciales e imponiendo $P(0) = 1$ resulta $C = \\frac{K - 1}{1} = K - 1$, dando $P(t) = \\frac{K}{1 + (K - 1)e^{-t}}$.',
      { exprVars: ['t'], domain: [0.1, 3],
        mistakes: {
          malthus: function () { return 'e^t'; },
          noMinus: function (v) { return v.K + '/(1 + ' + (v.K - 1) + '*e^t)'; }
        },
        feedback: [
          { when: 'malthus', say: function (v) { return 'Casi: esa es la solución exponencial sin cota; la ecuación logística tiene capacidad de carga limitante $' + v.K + '$.'; } },
          { when: 'noMinus', say: function (v) { return 'Casi: el exponente debe ser $-t$ para que la población crezca asintóticamente hacia $' + v.K + '$.'; } }
        ] }),

    /* ======================= 5. Caída con resistencia del aire y velocidad terminal (16) ======================= */
    C('re-c-velocidad-terminal-concepto', 'resistencia', 1,
      '¿Qué ocurre desde el punto de vista del equilibrio de fuerzas cuando un objeto en caída vertical alcanza su velocidad terminal $v_t$?',
      'La fuerza de resistencia del fluido iguala exactamente al peso del cuerpo, de modo que la aceleración se anula ($v\' = 0$)', [
        ['La fuerza de resistencia del aire desaparece por completo', 'Casi: al contrario, la resistencia alcanza su valor máximo equilibrando al peso.'],
        ['El objeto deja de caer y permanece suspendido en el aire', 'Casi: la aceleración es cero, lo que significa que la velocidad es constante, no que sea cero.'],
        ['La gravedad deja de actuar sobre la masa del objeto', 'Casi: la fuerza de gravedad $mg$ sigue actuando con la misma magnitud; la resistencia la contrarresta.']],
      'En la velocidad terminal la fuerza neta es nula ($mg - F_{\\text{res}} = 0$), lo que implica que la aceleración $v\'$ se hace cero.'),

    C('re-c-lineal-vs-cuadratica', 'resistencia', 1,
      '¿En qué régimen de movimiento es más adecuado utilizar una fuerza de resistencia lineal ($F \\propto v$) en lugar de una cuadrática ($F \\propto v^2$)?',
      'Para objetos muy pequeños, velocidades bajas o en fluidos de alta viscosidad (números de Reynolds bajos, ley de Stokes)', [
        ['Para paracaidistas y proyectiles balísticos a alta velocidad en el aire', 'Casi: a altas rapideces el régimen es turbulento y la resistencia depende del cuadrado de la rapidez $v^2$.'],
        ['En el vacío absoluto donde no hay medio resistente', 'Casi: en el vacío no hay ninguna resistencia ($F = 0$) y la caída es puramente libre.'],
        ['Únicamente cuando el objeto cae con aceleración constante superior a $g$', 'Casi: la aceleración en caída con resistencia nunca supera a la gravedad $g$.']],
      'A bajas rapideces o en fluidos muy viscosos predomina el arrastre laminar de Stokes ($F = bv$), mientras que a altas rapideces domina el arrastre cuadrático turbulento.'),

    C('re-c-vt-lineal-formula', 'resistencia', 1,
      'Para una partícula de masa $m$ que cae verticalmente con resistencia del medio proporcional a la velocidad ($F_{\\text{res}} = b\\,v$), ¿cuál es la fórmula de su velocidad terminal?',
      '$v_t = \\frac{m\\,g}{b}$', [
        ['$v_t = \\sqrt{\\frac{m\\,g}{b}}$', 'Casi: la raíz cuadrada corresponde al modelo de resistencia cuadrática $k v^2$, no al lineal $bv$.'],
        ['$v_t = \\frac{b}{m\\,g}$', 'Casi: al despejar de $mg - bv_t = 0$ se obtiene $v_t = mg/b$, no el inverso.'],
        ['$v_t = m\\,g\\,b$', 'Casi: dimensionalmente $mg/b$ tiene unidades de velocidad (m/s), mientras que el producto no.']],
      'Haciendo la aceleración cero en $mg - bv = 0$ se despeja inmediatamente $v_t = mg/b$.'),

    C('re-c-vt-cuadratica-formula', 'resistencia', 2,
      'Para un paracaidista de masa $m$ que desciende con resistencia del aire cuadrática $F_{\\text{res}} = k\\,v^2$, ¿cuál es la expresión para su velocidad terminal?',
      '$v_t = \\sqrt{\\frac{m\\,g}{k}}$', [
        ['$v_t = \\frac{m\\,g}{k}$', 'Casi: esa fórmula corresponde al modelo de resistencia lineal; con $k v^2$ se debe extraer raíz cuadrada.'],
        ['$v_t = \\frac{k}{m\\,g}$', 'Casi: al igualar $mg - kv_t^2 = 0$ resulta $v_t^2 = mg/k$.'],
        ['$v_t = \\sqrt{\\frac{k\\,g}{m}}$', 'Casi: la masa $m$ va en el numerador multiplicando a $g$.']],
      'De la condición de equilibrio $mg - kv_t^2 = 0$ se despeja $v_t^2 = mg/k$, por lo que $v_t = \\sqrt{mg/k}$.'),

    C('re-c-tanh-solucion', 'resistencia', 2,
      'Al resolver la ecuación separable de caída libre con resistencia cuadrática $v\' = g - \\frac{k}{m}v^2$ con reposo inicial $v(0)=0$ y velocidad terminal $v_t = \\sqrt{mg/k}$, ¿qué función describe la velocidad $v(t)$?',
      'La tangente hiperbólica: $v(t) = v_t\\tanh\\left(\\frac{g\\,t}{v_t}\\right)$', [
        ['La exponencial decreciente: $v(t) = v_t e^{-gt/v_t}$', 'Casi: la velocidad debe aumentar desde cero hacia la velocidad terminal, no decrecer a cero.'],
        ['La función seno trigonométrico: $v(t) = v_t\\sin\\left(\\frac{g\\,t}{v_t}\\right)$', 'Casi: el movimiento de caída no es oscilatorio; la integral de $\\frac{dv}{v_t^2 - v^2}$ genera la tangente hiperbólica.'],
        ['Una función cuadrática simple: $v(t) = v_t\\left(\\frac{g\\,t}{v_t}\\right)^2$', 'Casi: al integrar fracciones parciales de $\\frac{1}{v_t^2 - v^2}$ surgen logaritmos que se invierten como $\\tanh$.']],
      'Separando $\\frac{dv}{v_t^2 - v^2} = \\frac{k}{m}dt$ e integrando resulta $\\text{arctanh}(v/v_t) = \\frac{gt}{v_t}$, de donde $v(t) = v_t\\tanh(gt/v_t)$.'),

    C('re-c-comportamiento-inicial', 'resistencia', 2,
      'Al soltar un cuerpo pesado desde el reposo en el aire ($v(0) = 0$), ¿cómo es su comportamiento cinemático en los primeros instantes ($t \\to 0^+$)?',
      'Se comporta prácticamente como en caída libre ideal ($v(t) \\approx gt$), porque a velocidades pequeñas la resistencia es casi nula', [
        ['Alcanza instantáneamente su velocidad terminal', 'Casi: por inercia el cuerpo parte con $v = 0$ y necesita tiempo para acelerar hacia $v_t$.'],
        ['Cae a velocidad constante desde el primer milisegundo', 'Casi: al inicio la aceleración es $g$; solo tras ganar rapidez suficiente la aceleración empieza a decaer.'],
        ['La aceleración inicial es cero y va aumentando con el tiempo', 'Casi: la aceleración inicial es máxima e igual a $g$; conforme la velocidad sube, la resistencia frena la aceleración.']],
      'En $t=0$, $v=0$ y la fuerza resistente es nula, por lo que la aceleración inicial es exactamente $g$ y $v(t) \\approx gt$.'),

    N('re-n-vt-lineal-calc', 'resistencia', 1, { m: [2, 10, 2], b: [5, 25, 5] },
      function (v) { return 'Un balín de masa $m = ' + v.m + '\\ \\text{kg}$ cae en un tubo con aceite bajo una resistencia lineal con $b = ' + v.b + '\\ \\text{N}\\cdot\\text{s/m}$. Con $g = 9.81\\ \\text{m/s}^2$, ¿cuál es su velocidad terminal (en m/s)?'; },
      function (v) { return v.m * 9.81 / v.b; },
      'La velocidad terminal con resistencia lineal es $v_t = mg/b$.',
      { unit: 'm/s', where: function (v) { return Math.abs(v.m * 9.81 - v.b) > 4; },
        mistakes: {
          inv: function (v) { return v.b / (v.m * 9.81); },
          noG: function (v) { return v.m / v.b; }
        },
        feedback: [
          { when: 'inv', say: 'Casi: es $mg/b$, no $b/(mg)$.' },
          { when: 'noG', say: 'Casi: olvidaste multiplicar por la aceleración de la gravedad $g = 9.81\\ \\text{m/s}^2$.' }
        ] }),

    N('re-n-vt-cuadratica-calc', 'resistencia', 1, { m: [60, 90, 10], k: [0.2, 0.4, 0.05] },
      function (v) { return 'Un paracaidista con equipo tiene una masa total de $' + v.m + '\\ \\text{kg}$ y cae bajo resistencia del aire cuadrática con $k = ' + v.k + '\\ \\text{kg/m}$. Con $g = 9.81\\ \\text{m/s}^2$, ¿cuál es su rapidez terminal $v_t = \\sqrt{mg/k}$ (en m/s)?'; },
      function (v) { return Math.sqrt(v.m * 9.81 / v.k); },
      'Igualando $mg = k v_t^2$ se despeja $v_t = \\sqrt{mg/k}$.',
      { unit: 'm/s',
        mistakes: {
          noSqrt: function (v) { return v.m * 9.81 / v.k; },
          noG: function (v) { return Math.sqrt(v.m / v.k); }
        },
        feedback: [
          { when: 'noSqrt', say: 'Casi: ese valor corresponde a $v_t^2$; debes extraer la raíz cuadrada para obtener la rapidez terminal.' },
          { when: 'noG', say: 'Casi: te faltó multiplicar la masa por la aceleración de la gravedad $g = 9.81\\ \\text{m/s}^2$.' }
        ] }),

    N('re-n-rapidez-lineal-tiempo', 'resistencia', 2, { m: [5, 15, 5], b: [2, 6, 2], t: [1, 3, 1] },
      function (v) { return 'Un cuerpo de masa $m = ' + v.m + '\\ \\text{kg}$ cae desde el reposo ($v(0) = 0$) bajo gravedad ($g = 9.81\\ \\text{m/s}^2$) y resistencia lineal con $b = ' + v.b + '\\ \\text{N}\\cdot\\text{s/m}$. ¿Qué rapidez (en m/s) lleva a los $t = ' + v.t + '\\ \\text{s}$?'; },
      function (v) { return (v.m * 9.81 / v.b) * (1 - Math.exp(-v.b * v.t / v.m)); },
      'La rapidez en función del tiempo para resistencia lineal es $v(t) = (mg/b)(1 - e^{-bt/m})$.',
      { unit: 'm/s', where: function (v) { return v.b * v.t / v.m >= 0.25; },
        mistakes: {
          freeFall: function (v) { return 9.81 * v.t; },
          terminal: function (v) { return v.m * 9.81 / v.b; }
        },
        feedback: [
          { when: 'freeFall', say: 'Casi: $g\\cdot t$ es la rapidez en caída libre sin considerar el frenado del aire.' },
          { when: 'terminal', say: function (v) { return 'Casi: esa es la velocidad terminal límite ($t \\to \\infty$); a los ' + v.t + ' s aún no la alcanza.'; } }
        ] }),

    N('re-n-aceleracion-tiempo', 'resistencia', 2, { m: [4, 12, 4], b: [2, 6, 2], t: [1, 2, 1] },
      function (v) { return 'Para el cuerpo anterior ($m = ' + v.m + '\\ \\text{kg}$, $b = ' + v.b + '\\ \\text{N}\\cdot\\text{s/m}$, $g = 9.81\\ \\text{m/s}^2$), ¿cuánto vale su aceleración instantánea $a(t) = g\\,e^{-bt/m}$ (en $\\text{m/s}^2$) en $t = ' + v.t + '\\ \\text{s}$?'; },
      function (v) { return 9.81 * Math.exp(-v.b * v.t / v.m); },
      'Derivando la velocidad respecto al tiempo se obtiene $a(t) = v\'(t) = g e^{-bt/m}$.',
      { unit: 'm/s^2', where: function (v) { return Math.abs(v.b * v.t / v.m - Math.log(2)) > 0.08; },
        mistakes: {
          constantG: function () { return 9.81; },
          oneMinus: function (v) { return 9.81 * (1 - Math.exp(-v.b * v.t / v.m)); }
        },
        feedback: [
          { when: 'constantG', say: 'Casi: la aceleración solo vale $g$ en el instante inicial $t=0$; al acelerar, la resistencia reduce la aceleración neta.' },
          { when: 'oneMinus', say: 'Casi: la aceleración decrece hacia cero con $e^{-bt/m}$, no con $(1 - e^{-bt/m})$.' }
        ] }),

    N('re-n-tiempo-fraccion-vt-lineal', 'resistencia', 3, { tau: [2, 6, 1], p: [60, 80, 10] },
      function (v) { return 'Un cuerpo que desciende con resistencia lineal tiene una constante de tiempo $\\tau = m/b = ' + v.tau + '\\ \\text{s}$. ¿Cuántos segundos tarda en alcanzar el $' + v.p + '\\,\\%$ de su velocidad terminal?'; },
      function (v) { return v.tau * Math.log(100 / (100 - v.p)); },
      'De $1 - e^{-t/\\tau} = p/100$ se despeja $t = \\tau \\ln(100/(100-p))$.',
      { unit: 's',
        mistakes: {
          logP: function (v) { return v.tau * Math.log(100 / v.p); },
          linearTime: function (v) { return v.tau * (v.p / 100); }
        },
        feedback: [
          { when: 'logP', say: 'Casi: en el logaritmo se coloca la fracción que falta por acelerar, $100 - p$, no $p$.' },
          { when: 'linearTime', say: 'Casi: la aceleración no es constante; el tiempo debe despejarse con la función logaritmo.' }
        ] }),

    N('re-n-rapidez-cuadratica-tiempo', 'resistencia', 2, { vt: [30, 60, 10], t: [1, 3, 1] },
      function (v) { return 'Un paracaidista cae con aceleración de la gravedad $g = 9.81\\ \\text{m/s}^2$ y resistencia cuadrática tal que su velocidad terminal es $v_t = ' + v.vt + '\\ \\text{m/s}$. Si parte del reposo, ¿qué rapidez (en m/s) lleva a los $t = ' + v.t + '\\ \\text{s}$?'; },
      function (v) { return v.vt * Math.tanh(9.81 * v.t / v.vt); },
      'La solución analítica exacta para resistencia cuadrática es $v(t) = v_t \\tanh(gt/v_t)$.',
      { unit: 'm/s', where: function (v) { return 9.81 * v.t / v.vt >= 0.25; },
        mistakes: {
          linearExp: function (v) { return v.vt * (1 - Math.exp(-9.81 * v.t / v.vt)); },
          freeFall: function (v) { return 9.81 * v.t; }
        },
        feedback: [
          { when: 'linearExp', say: 'Casi: esa curva exponencial corresponde a resistencia lineal; con resistencia cuadrática interviene $\\tanh$.' },
          { when: 'freeFall', say: 'Casi: $g\\cdot t$ no toma en cuenta el frenado aerodinámico del aire.' }
        ] }),

    N('re-n-fuerza-resistencia-lineal', 'resistencia', 2, { m: [5, 20, 5], b: [3, 9, 3], v: [4, 12, 2] },
      function (v) { return 'Un cuerpo de masa $' + v.m + '\\ \\text{kg}$ se mueve a través de un medio viscoso con coeficiente de arrastre lineal $b = ' + v.b + '\\ \\text{N}\\cdot\\text{s/m}$. Cuando su rapidez es de $' + v.v + '\\ \\text{m/s}$, ¿cuál es la magnitud de la fuerza de fricción $F_{\\text{res}} = b\\,v$ (en newtons)?'; },
      function (v) { return v.b * v.v; },
      'En el modelo lineal la fuerza de resistencia es directamente proporcional a la rapidez: $F_{\\text{res}} = b v$.',
      { unit: 'N',
        mistakes: {
          withMass: function (v) { return v.m * v.b * v.v; },
          squaredV: function (v) { return v.b * v.v * v.v; }
        },
        feedback: [
          { when: 'withMass', say: 'Casi: la fuerza de arrastre lineal es simplemente $b\\cdot v$, sin multiplicar por la masa.' },
          { when: 'squaredV', say: 'Casi: en el modelo lineal la velocidad va a la primera potencia, no al cuadrado.' }
        ] }),

    N('re-n-distancia-caida-lineal', 'resistencia', 3, { vt: [20, 40, 10], tau: [2, 4, 1], t: [2, 5, 1] },
      function (v) { return 'Integrando la velocidad $v(t) = v_t(1 - e^{-t/\\tau})$ desde el reposo, la distancia descendida es $y(t) = v_t\\,t - v_t\\,\\tau(1 - e^{-t/\\tau})$. Si $v_t = ' + v.vt + '\\ \\text{m/s}$ y $\\tau = ' + v.tau + '\\ \\text{s}$, ¿cuántos metros ha caído el objeto en $t = ' + v.t + '\\ \\text{s}$?'; },
      function (v) { return v.vt * v.t - v.vt * v.tau * (1 - Math.exp(-v.t / v.tau)); },
      'La posición $y(t)$ se obtiene integrando la velocidad respecto al tiempo con $y(0) = 0$.',
      { unit: 'm', where: function (v) { return Math.abs(v.vt * v.t - v.vt * v.tau * (1 - Math.exp(-v.t / v.tau)) - 0.5 * 9.81 * v.t * v.t) > 3; },
        mistakes: {
          noTransient: function (v) { return v.vt * v.t; },
          freeFallDist: function (v) { return 0.5 * 9.81 * v.t * v.t; }
        },
        feedback: [
          { when: 'noTransient', say: 'Casi: $v_t t$ asume que cayó a velocidad terminal todo el tiempo; debes restar el retraso inicial $v_t\\tau(1 - e^{-t/\\tau})$.' },
          { when: 'freeFallDist', say: 'Casi: $\\frac{1}{2}gt^2$ corresponde a caída libre en el vacío sin resistencia del aire.' }
        ] }),

    E('re-e-solucion-v-lineal', 'resistencia', 2, { a: [1, 3, 1] },
      function (v) { return 'Resuelve el problema de valor inicial para la rapidez en caída con resistencia lineal: $v\' + ' + v.a + '\\,v = 9.81$, con reposo inicial $v(0) = 0$. Escribe la solución explícita $v(t)$.'; },
      function (v) { return '(' + (9.81 / v.a) + ')*(1 - e^(-' + v.a + '*t))'; },
      'En forma estándar lineal con factor integrante $e^{at}$, la solución con $v(0) = 0$ es $v(t) = \\frac{9.81}{a}(1 - e^{-at})$.',
      { exprVars: ['t'], domain: [0.2, 2],
        mistakes: {
          noCoeff: function (v) { return '1 - e^(-' + v.a + '*t)'; },
          freeFall: function () { return '9.81*t'; }
        },
        feedback: [
          { when: 'noCoeff', say: function (v) { return 'Casi: te faltó multiplicar por la velocidad terminal $\\frac{9.81}{' + v.a + '}$.'; } },
          { when: 'freeFall', say: 'Casi: esa es la aproximación sin fricción; la solución real contiene la exponencial amortiguada.' }
        ] }),

    E('re-e-solucion-v-cuadratica', 'resistencia', 3, {},
      function () { return 'Resuelve el problema de valor inicial para la rapidez en caída con resistencia cuadrática normalizada: $v\' = 16 - v^2$, con $v(0) = 0$. Escribe la solución analítica $v(t)$ usando la función tanh.'; },
      function () { return '4*tanh(4*t)'; },
      'Separando $\\frac{dv}{16 - v^2} = dt$ e integrando: $\\frac{1}{4}\\text{arctanh}\\left(\\frac{v}{4}\\right) = t$, de donde $v(t) = 4\\tanh(4t)$.',
      { exprVars: ['t'], domain: [0.1, 1],
        mistakes: {
          noFourInside: function () { return '4*tanh(t)'; },
          linearExp: function () { return '4*(1 - e^(-4*t))'; }
        },
        feedback: [
          { when: 'noFourInside', say: 'Casi: en el argumento de la tangente hiperbólica debe ir $4t$, no solo $t$.' },
          { when: 'linearExp', say: 'Casi: la solución de la ecuación cuadrática $v\' = 16 - v^2$ involucra $\\tanh$, no la exponencial.' }
        ] }),

    /* ======================= 6. Temperatura variable y crecimiento alométrico (14) ======================= */
    C('te-c-ambiente-variable-metodo', 'temperatura', 1,
      'Si la temperatura exterior oscila a lo largo del día según $T_{\\text{amb}}(t) = 20 + 5\\sin(\\omega t)$, ¿por qué la ley de Newton $T\' = -k(T - T_{\\text{amb}}(t))$ ya no se puede resolver separando variables?',
      'Porque la variable dependiente $T$ y la independiente $t$ aparecen sumadas dentro del paréntesis, impidiendo factorizar la expresión como $g(t)\\,h(T)$', [
        ['Porque la ley de Newton solo es válida cuando la temperatura del medio circundante es constante', 'Casi: la ley física sigue siendo perfectamente válida con medio variable, pero cambia el método matemático.'],
        ['Porque la función seno hace que la ecuación diferencial se vuelva de segundo orden', 'Casi: la derivada más alta sigue siendo la primera derivada $T\'$; no cambia el orden.'],
        ['Porque la temperatura no puede ser negativa en ningún instante', 'Casi: el impedimento es estrictamente algebraico: la suma no se puede separar en un producto $g(t)h(T)$.']],
      'Al tener $T - 20 - 5\\sin(\\omega t)$, no es posible factorizar la expresión como producto de una función solo de $t$ por una solo de $T$.'),

    C('te-c-factor-integrante-newton', 'temperatura', 1,
      'Al escribir la ley de enfriamiento de Newton con temperatura exterior variable en forma estándar como $T\' + k\\,T = k\\,T_{\\text{amb}}(t)$ con $k > 0$ constante, ¿cuál es el factor integrante $\\mu(t)$?',
      '$\\mu(t) = e^{kt}$', [
        ['$\\mu(t) = e^{-kt}$', 'Casi: en la forma estándar el coeficiente de $T$ es $+k$, por lo que la integral es $+kt$ y el factor integrante es $e^{kt}$.'],
        ['$\\mu(t) = kt$', 'Casi: el factor integrante es la exponencial elevada a la integral, es decir, $e^{\\int k\\,dt} = e^{kt}$.'],
        ['$\\mu(t) = e^{k T_{\\text{amb}}(t)}$', 'Casi: en el factor integrante solo interviene el coeficiente de $T$, sin incluir el término independiente de la derecha.']],
      'En la forma estándar $T\' + kT = Q(t)$, el coeficiente de la función incógnita es $P(t) = k$, dando $\\mu(t) = e^{\\int k\\,dt} = e^{kt}$.'),

    C('te-c-bertalanffy-tipo', 'temperatura', 1,
      'La ecuación de crecimiento biológico de von Bertalanffy $W\' = a\\,W^{2/3} - b\\,W$ (donde $W$ es la masa del organismo) se clasifica como:',
      'Ecuación de Bernoulli con potencia $n = 2/3$', [
        ['Ecuación lineal homogénea de primer orden', 'Casi: el término $W^{2/3}$ es una potencia no lineal que impide que sea lineal en $W$.'],
        ['Ecuación exacta de segundo orden', 'Casi: solo contiene la primera derivada $W\'$, por lo que es estrictamente de primer orden.'],
        ['Ecuación de Euler-Cauchy', 'Casi: Euler-Cauchy tiene coeficientes de potencias de $t$, mientras que aquí la no linealidad está en la variable $W$.']],
      'Tiene la estructura $W\' + bW = a W^n$ con exponente constante $n = 2/3$, que define a una ecuación de Bernoulli.'),

    C('te-c-bertalanffy-cambio', 'temperatura', 2,
      'Para transformar la ecuación de von Bertalanffy $W\' + b\\,W = a\\,W^{2/3}$ en una ecuación diferencial lineal en la nueva variable $u$, ¿qué cambio de variable se debe realizar?',
      '$u = W^{1 - 2/3} = W^{1/3}$', [
        ['$u = W^{2/3}$', 'Casi: el cambio de variable estándar de Bernoulli es $u = y^{1-n}$; para $n = 2/3$ queda $1 - 2/3 = 1/3$.'],
        ['$u = W^{-1/3}$', 'Casi: el exponente es positivo: $1 - n = 1 - 2/3 = +1/3$.'],
        ['$u = \\ln W$', 'Casi: la sustitución logarítmica no linealiza una ecuación con potencias de Bernoulli.']],
      'Con $u = W^{1/3}$, derivando se tiene $u\' = \\frac{1}{3}W^{-2/3}W\'$. Al sustituir en la EDO se obtiene la ecuación lineal $u\' + \\frac{b}{3}u = \\frac{a}{3}$.'),

    C('te-c-desfase-termico', 'temperatura', 2,
      'Cuando la temperatura ambiental exterior oscila senoidalmente con el día y la noche, la temperatura interior de una casa bien aislada térmicamente:',
      'Oscila con la misma frecuencia diaria pero con menor amplitud y con un retraso (desfase temporal) respecto al exterior', [
        ['Permanece completamente constante sin percibir ningún cambio térmico', 'Casi: a menos que el aislamiento fuera infinito ($k=0$), el calor penetra lentamente provocando oscilaciones.'],
        ['Oscila con una frecuencia dos veces más rápida y con mayor amplitud', 'Casi: la respuesta de un sistema lineal conserva la misma frecuencia y la amplitud se amortigua.'],
        ['Alcanza su pico de calor antes de que la temperatura exterior llegue a su máximo', 'Casi: la inercia térmica genera un retraso (lag), de modo que el pico interior ocurre después del exterior.']],
      'Por la inercia térmica, la amplitud de la oscilación interior se reduce por el factor $\\frac{1}{\\sqrt{1 + (\\omega/k)^2}}$ y experimenta un retraso temporal.'),

    N('te-n-temperatura-constante-tiempo', 'temperatura', 2, { T0: [70, 90, 10], Ta: [4, 10, 2], k: [0.05, 0.15, 0.05], t: [8, 20, 4] },
      function (v) { return 'Un lingote a $T_0 = ' + v.T0 + '\\,^\\circ\\text{C}$ se introduce en un baño a temperatura constante $T_a = ' + v.Ta + '\\,^\\circ\\text{C}$. Con constante de enfriamiento $k = ' + v.k + '\\ \\text{min}^{-1}$, ¿cuál es la temperatura del lingote (en $^\\circ\\text{C}$) a los $t = ' + v.t + '\\ \\text{min}$?'; },
      function (v) { return v.Ta + (v.T0 - v.Ta) * Math.exp(-v.k * v.t); },
      'Por la ley de enfriamiento de Newton, $T(t) = T_a + (T_0 - T_a)e^{-kt}$.',
      { unit: '°C', where: function (v) { return v.k * v.t <= 2.0; },
        mistakes: {
          noAmb: function (v) { return v.T0 * Math.exp(-v.k * v.t); },
          cIsT0: function (v) { return v.Ta + v.T0 * Math.exp(-v.k * v.t); }
        },
        feedback: [
          { when: 'noAmb', say: function (v) { return 'Casi: el cuerpo se enfría hacia la temperatura del baño $' + v.Ta + '\\,^\\circ\\text{C}$, no hacia cero absoluto.'; } },
          { when: 'cIsT0', say: 'Casi: la amplitud del decaimiento térmico es $T_0 - T_a$, no $T_0$.' }
        ] }),

    N('te-n-tiempo-enfriamiento-deseado', 'temperatura', 2, { T0: [80, 95, 5], Ta: [20, 25, 5], k: [0.04, 0.08, 0.02], T: [40, 60, 10] },
      function (v) { return 'Una taza de café a $T_0 = ' + v.T0 + '\\,^\\circ\\text{C}$ se enfría en una sala a $T_a = ' + v.Ta + '\\,^\\circ\\text{C}$ con $k = ' + v.k + '\\ \\text{min}^{-1}$. ¿En cuántos minutos alcanzará una temperatura de $' + v.T + '\\,^\\circ\\text{C}$?'; },
      function (v) { return (1 / v.k) * Math.log((v.T0 - v.Ta) / (v.T - v.Ta)); },
      'De $T - T_a = (T_0 - T_a) e^{-kt}$ se despeja $e^{kt} = (T_0 - T_a)/(T - T_a) \\Rightarrow t = \\ln((T_0 - T_a)/(T - T_a))/k$.',
      { unit: 'min',
        mistakes: {
          noAmb: function (v) { return (1 / v.k) * Math.log(v.T0 / v.T); },
          linearTime: function (v) { return (v.T0 - v.T) / (v.k * (v.T0 - v.Ta)); }
        },
        feedback: [
          { when: 'noAmb', say: 'Casi: las temperaturas deben medirse respecto al medio ambiente $T_a$, restando $T_a$ en numerador y denominador.' },
          { when: 'linearTime', say: 'Casi: la tasa de enfriamiento disminuye conforme el café se enfría; se debe usar logaritmo natural.' }
        ] }),

    N('te-n-peso-maximo-bertalanffy', 'temperatura', 2, { a: [6, 12, 2], b: [2, 4, 1] },
      function (v) { return 'La masa corporal de un pez cumple la ecuación alométrica de von Bertalanffy $W\' = ' + v.a + '\\,W^{2/3} - ' + v.b + '\\,W$. ¿Cuál es la masa asintótica máxima $W_{\\text{max}} = (a/b)^3$ (en kg) que puede alcanzar el pez?'; },
      function (v) { return Math.pow(v.a / v.b, 3); },
      'En el estado límite $W\' = 0$: $a W^{2/3} = b W \\Rightarrow W^{1/3} = a/b \\Rightarrow W_{\\text{max}} = (a/b)^3$.',
      { unit: 'kg', where: function (v) { return v.a % v.b === 0 && v.a / v.b >= 2; },
        mistakes: {
          noCube: function (v) { return v.a / v.b; },
          square: function (v) { return Math.pow(v.a / v.b, 2); }
        },
        feedback: [
          { when: 'noCube', say: 'Casi: $a/b$ es la longitud característica o $W^{1/3}$; para obtener la masa $W$ debes elevar al cubo.' },
          { when: 'square', say: 'Casi: la relación alométrica de masa respecto a superficie lleva potencia 3, no 2.' }
        ] }),

    N('te-n-bertalanffy-peso-tiempo', 'temperatura', 2, { t: [1, 6, 1] },
      function (v) { return 'El crecimiento de un organismo marino parte con $W(0) = 1\\ \\text{kg}$ y sigue la solución $W(t) = \\left(3 - 2\\,e^{-t/3}\\right)^3$. ¿Cuánto pesará el organismo (en kg) a los $t = ' + v.t + '\\ \\text{años}$?'; },
      function (v) { return Math.pow(3 - 2 * Math.exp(-v.t / 3), 3); },
      'Se evalúa directamente el tiempo dado en la solución analítica de von Bertalanffy.',
      { unit: 'kg',
        mistakes: {
          linearInside: function (v) { return Math.pow(3 - 2 * (1 - v.t / 3), 3); },
          noCube: function (v) { return 3 - 2 * Math.exp(-v.t / 3); }
        },
        feedback: [
          { when: 'linearInside', say: 'Casi: el término transitorio es exponencial $e^{-t/3}$, no una aproximación lineal.' },
          { when: 'noCube', say: 'Casi: te faltó elevar el resultado total al cubo para obtener la masa $W(t)$.' }
        ] }),

    N('te-n-temperatura-media-diurna', 'temperatura', 2, { Tmed: [18, 26, 2], A: [4, 8, 2] },
      function (v) { return 'Una vivienda con intercambio térmico $T\' = -k(T - T_{\\text{amb}}(t))$ está sujeta a una temperatura ambiental $T_{\\text{amb}}(t) = ' + v.Tmed + ' + ' + v.A + '\\sin(\\omega t)\\ ^\\circ\\text{C}$. ¿Cuál es la temperatura media a largo plazo (en $^\\circ\\text{C}$) alrededor de la cual oscila la vivienda?'; },
      function (v) { return v.Tmed; },
      'Al integrar a largo plazo, la componente senoidal tiene promedio temporal cero, por lo que la temperatura interior media iguala a la media exterior $T_{\\text{med}}$.',
      { unit: '°C',
        mistakes: {
          plusAmp: function (v) { return v.Tmed + v.A; },
          minusAmp: function (v) { return v.Tmed - v.A; }
        },
        feedback: [
          { when: 'plusAmp', say: 'Casi: ese sería el valor máximo alcanzado por el ambiente exterior, no la temperatura media.' },
          { when: 'minusAmp', say: 'Casi: ese corresponde al mínimo nocturno exterior, no al valor promedio.' }
        ] }),

    N('te-n-amplitud-oscilacion-casa', 'temperatura', 3, { A: [6, 12, 2], k: [0.3, 0.6, 0.1], w: [0.2, 0.5, 0.1] },
      function (v) { return 'En la ecuación térmica periódica $T\' + k\\,T = k(T_0 + A\\sin(\\omega t))$, la amplitud de oscilación interior amortiguada es $A_{\\text{in}} = \\frac{k\\,A}{\\sqrt{k^2 + \\omega^2}}$. Con $A = ' + v.A + '\\,^\\circ\\text{C}$, $k = ' + v.k + '\\ \\text{h}^{-1}$ y $\\omega = ' + v.w + '\\ \\text{h}^{-1}$, calcula $A_{\\text{in}}$ (en $^\\circ\\text{C}$).'; },
      function (v) { return v.k * v.A / Math.sqrt(v.k * v.k + v.w * v.w); },
      'La amplitud de la solución periódica se reduce por el factor de atenuación $k/\\sqrt{k^2 + \\omega^2}$.',
      { unit: '°C',
        mistakes: {
          noSqrt: function (v) { return v.k * v.A / (v.k + v.w); },
          fullAmp: function (v) { return v.A; }
        },
        feedback: [
          { when: 'noSqrt', say: 'Casi: en el denominador los términos se combinan vectorialmente bajo raíz cuadrada $\\sqrt{k^2 + \\omega^2}$.' },
          { when: 'fullAmp', say: 'Casi: el aislamiento de la pared amortigua la oscilación; la amplitud interior es siempre menor que $A$.' }
        ] }),

    N('te-n-bertalanffy-tiempo-fraccion', 'temperatura', 3, { tau: [2, 6, 1] },
      function (v) { return 'Un pez con masa $W(t) = \\left(3 - 2\\,e^{-t/' + v.tau + '}\\right)^3\\ \\text{kg}$ tiene una masa máxima de $27\\ \\text{kg}$. ¿A qué tiempo $t$ (en años) alcanzará exactamente $8\\ \\text{kg}$ de masa?'; },
      function (v) { return v.tau * Math.log(2); },
      'De $(3 - 2 e^{-t/\\tau})^3 = 8$ se extrae raíz cúbica: $3 - 2 e^{-t/\\tau} = 2 \\Rightarrow 2 e^{-t/\\tau} = 1 \\Rightarrow e^{t/\\tau} = 2 \\Rightarrow t = \\tau \\ln 2$.',
      { unit: 'años',
        mistakes: {
          halfTau: function (v) { return 0.5 * v.tau; },
          justTau: function (v) { return v.tau; }
        },
        feedback: [
          { when: 'halfTau', say: 'Casi: de la ecuación exponencial $e^{t/\\tau} = 2$ se deduce $t = \\tau\\ln 2$, no $0.5\\tau$.' },
          { when: 'justTau', say: 'Casi: a $t = \\tau$ la masa es $(3 - 2e^{-1})^3 \\approx 12.7\\ \\text{kg}$, que supera los $8\\ \\text{kg}$.' }
        ] }),

    E('te-e-solucion-newton-simple', 'temperatura', 2, { k: [1, 3, 1], Ta: [10, 25, 5], T0: [60, 90, 10] },
      function (v) { return 'Resuelve el problema de valor inicial para el enfriamiento de un cuerpo en un ambiente a $' + v.Ta + '\\,^\\circ\\text{C}$: $T\' + ' + v.k + '\\,T = ' + (v.k * v.Ta) + '$, con temperatura inicial $T(0) = ' + v.T0 + '\\,^\\circ\\text{C}$. Escribe la solución explícita $T(t)$.'; },
      function (v) { return v.Ta + ' + ' + (v.T0 - v.Ta) + '*e^(-' + v.k + '*t)'; },
      'En forma estándar $T\' + kT = k T_a$; integrando con $e^{kt}$ resulta $T(t) = T_a + (T_0 - T_a)e^{-kt}$.',
      { exprVars: ['t'], domain: [0.1, 2],
        mistakes: {
          noAmb: function (v) { return v.T0 + '*e^(-' + v.k + '*t)'; },
          wrongAmp: function (v) { return v.Ta + ' + ' + v.T0 + '*e^(-' + v.k + '*t)'; }
        },
        feedback: [
          { when: 'noAmb', say: function (v) { return 'Casi: el cuerpo se enfría hacia la temperatura ambiente $' + v.Ta + '$, no hacia cero.'; } },
          { when: 'wrongAmp', say: function (v) { return 'Casi: la amplitud del transitorio térmico es $T_0 - T_a = ' + (v.T0 - v.Ta) + '$, no $T_0$.'; } }
        ] }),

    E('te-e-solucion-bertalanffy', 'temperatura', 3, {},
      function () { return 'Resuelve el problema de valor inicial de crecimiento alométrico de von Bertalanffy: $W\' = 3\\,W^{2/3} - W$, con condición inicial $W(0) = 1$. Escribe la solución analítica $W(t)$.'; },
      function () { return '(3 - 2*e^(-t/3))^3'; },
      'Con $u = W^{1/3}$ la EDO se reduce a $u\' + \\frac{1}{3}u = 1$, cuya solución con $u(0) = 1$ es $u(t) = 3 - 2e^{-t/3}$. Elevando al cubo se obtiene $W(t)$.',
      { exprVars: ['t'], domain: [0.1, 5],
        mistakes: {
          noCube: function () { return '3 - 2*e^(-t/3)'; },
          noThird: function () { return '(3 - 2*e^(-t))^3'; }
        },
        feedback: [
          { when: 'noCube', say: 'Casi: esa es la variable linealizada $u = W^{1/3}$; debes elevar al cubo para obtener la masa $W(t)$.' },
          { when: 'noThird', say: 'Casi: al hacer el cambio $u = W^{1/3}$ el coeficiente lineal se divide entre 3, por lo que el exponente es $-t/3$.' }
        ] })
  ];

  K.register(SUBTEMAS, Q);
})();
