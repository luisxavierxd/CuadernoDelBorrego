/* =====================================================================
   Cálculo 3 · S08 · Modelado con primer orden: circuitos RC y RL, mezclas
   y poblaciones (bloque B · Primer orden II y orden n).
   Fuente: OpenStax, Calculus Volume 2, §4.1, §4.4 y §4.5 (aplicaciones), CC BY-NC-SA 4.0;
   OpenStax, University Physics Volume 2, §10.5 (RC) y §14.4 (RL), CC BY-NC-SA 4.0.
   Ejemplos y ejercicios propios. Se comprueban con LabMath.ode (lab ode-compare); los
   numéricos usan RK4 como oráculo.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  var G = 9.81;

  function distinct(ex) {
    return function (v) {
      if (ex.baseWhere && !ex.baseWhere(v)) return false;
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]), 0.5)) return false;
      }
      return true;
    };
  }
  function rk(P, x) { return window.LabMath.ode.solveAt(window.math, P, x); }

  var METHODS = ['Separable', 'Lineal (factor integrante)', 'Bernoulli', 'Exacta'];

  // Ejemplo RL: L = 0.5 H, R = 10 Ω, ε = 12 V. Corriente a los 0.05 s.
  var rl = { L: 0.5, R: 10, E: 12 };
  rl.i = rl.E / rl.R * (1 - Math.exp(-rl.R / rl.L * 0.05));
  // Tanque que se llena: 100 L de agua pura; entra 3 L/min con 2 g/L, sale 2 L/min. Sal a los 50 min.
  var tankV = function (t) { return 2 * (100 + t) - 2e6 / Math.pow(100 + t, 2); };
  // Paracaidista con resistencia cuadrática: k/m = 0.04 1/m.
  var vt = Math.sqrt(G / 0.04);

  var P_RL = {
    name: 'Circuito RL', tex: "L\\,i' + R\\,i = \\varepsilon,\\qquad i(0) = 0", iv: 't', dv: 'i', order: 1,
    rhs: 'E/L - R*y/L', alias: { epsilon: 'E' },
    params: {
      L: { value: 0.5, min: 0.1, max: 1, step: 0.05, label: 'Inductancia L', unit: 'H' },
      R: { value: 10, min: 5, max: 20, step: 1, label: 'Resistencia R', unit: 'Ω' },
      E: { value: 12, min: 3, max: 24, step: 1, label: 'fem ε', unit: 'V' }
    },
    x0: 0, ics: [0], domain: [0, 0.5], yRange: [0, 5],
    solution: 'E/R*(1 - e^(-R*t/L))', solutionTex: '\\frac{\\varepsilon}{R}\\left(1 - e^{-Rt/L}\\right)',
    methods: METHODS, method: [0, 1], methodWhy: 'Con $L$, $R$ y $\\varepsilon$ constantes se puede separar, y también es lineal en $i$.',
    hint: 'Es la misma ecuación del RC: estado estacionario $\\varepsilon/R$ y constante de tiempo $L/R$. Usa las letras $L$, $R$ y $\\varepsilon$.',
    wrong: [
      { src: 'E/R*e^(-R*t/L)', tex: '\\frac{\\varepsilon}{R}e^{-\\frac{Rt}{L}}', key: 'residual' },
      { src: 'E/L*(1 - e^(-R*t/L))', tex: '\\frac{\\varepsilon}{L}\\left(1-e^{-\\frac{Rt}{L}}\\right)', key: 'residual' },
      { src: 'E/R*(1 - e^(-L*t/R))', tex: '\\frac{\\varepsilon}{R}\\left(1-e^{-\\frac{Lt}{R}}\\right)', key: 'residual' }
    ]
  };
  var P_TANK = {
    name: 'Tanque que se va llenando', tex: "A' = 3(2) - 2\\,\\frac{A}{100 + t},\\qquad A(0) = 0", iv: 't', dv: 'A', order: 1,
    rhs: '6 - 2y/(100 + t)', x0: 0, ics: [0], domain: [0, 100], yRange: [0, 450],
    solution: '2(100 + t) - 2*10^6/(100 + t)^2', solutionTex: '2(100 + t) - \\dfrac{2\\times 10^{6}}{(100 + t)^2}',
    methods: METHODS, method: [1], methodWhy: 'El coeficiente $\\frac{2}{100 + t}$ depende de $t$ y hay un término que entra: es lineal, no separable.',
    hint: 'En forma estándar $A\' + \\frac{2}{100 + t}A = 6$; el factor integrante es $(100 + t)^2$.',
    wrong: [
      { src: '2(100 + t)', tex: '2\\left(100+t\\right)', key: 'ic' },
      { src: '2(100 + t) - 2*10^6/(100 + t)', tex: '2\\left(100+t\\right)-\\frac{2\\cdot10^6}{100+t}', key: 'residual' },
      { src: '200(1 - e^(-t/50))', tex: '200\\left(1-e^{-\\frac{t}{50}}\\right)', key: 'residual' }
    ]
  };
  var P_HOUSE = {
    name: 'Casa que sigue la temperatura del día', tex: "T' = -(T - 20 - 5\\sin t),\\qquad T(0) = 40", iv: 't', dv: 'T', order: 1,
    rhs: '-(y - 20 - 5*sin(t))', x0: 0, ics: [40], domain: [0, 12], yRange: [10, 42],
    solution: '20 + 2.5(sin(t) - cos(t)) + 22.5e^(-t)', solutionTex: '20 + \\tfrac{5}{2}(\\sin t - \\cos t) + \\tfrac{45}{2}e^{-t}',
    methods: METHODS, method: [1], methodWhy: 'El ambiente $20 + 5\\sin t$ depende de $t$: ya no se separa, pero es lineal. Factor integrante $e^{t}$.',
    hint: '$(e^tT)\' = e^t(20 + 5\\sin t)$; usa $\\int e^t\\sin t\\,dt = \\frac{e^t}{2}(\\sin t - \\cos t)$.',
    wrong: [
      { src: '20 + 20e^(-t)', tex: '20+20e^{-t}', key: 'residual' },
      { src: '20 + 2.5(sin(t) - cos(t)) + 20e^(-t)', tex: '20+2.5\\left(\\sin\\left(t\\right)-\\cos\\left(t\\right)\\right)+20e^{-t}', key: 'ic' },
      { src: '20 + 5sin(t) + 15e^(-t)', tex: '20+5\\sin\\left(t\\right)+15e^{-t}', key: 'residual' }
    ]
  };
  var P_DRAG = {
    name: 'Paracaidista: resistencia cuadrática', tex: "v' = 9.81 - 0.04\\,v^2,\\qquad v(0) = 0", iv: 't', dv: 'v', order: 1,
    rhs: '9.81 - 0.04y^2', x0: 0, ics: [0], domain: [0, 6], yRange: [0, 18], field: true,
    solution: 'sqrt(9.81/0.04)*tanh(sqrt(9.81*0.04)*t)', solutionTex: 'v_t\\tanh\\!\\left(\\frac{g\\,t}{v_t}\\right),\\quad v_t = \\sqrt{9.81/0.04}',
    methods: METHODS, method: [0], methodWhy: 'No depende de $t$ explícitamente: se separa en $\\frac{dv}{g - kv^2} = dt$ (con fracciones parciales). No es lineal por el $v^2$, y tampoco Bernoulli por el término $g$.',
    hint: 'Escribe $v_t = \\sqrt{g/k}$: la solución es $v_t\\tanh(gt/v_t)$. En el campo escribe <code>tanh</code>.',
    wrong: [
      { src: 'sqrt(9.81/0.04)*(1 - e^(-9.81*t/sqrt(9.81/0.04)))', tex: 'v_t(1-e^{-gt/v_t})', key: 'residual' },
      { src: '9.81t', tex: '9.81t', key: 'residual' },
      { src: 'sqrt(9.81/0.04)*tanh(t)', tex: '15.66\\tanh(t)', key: 'residual' }
    ]
  };
  // El tex del ejemplo cargado lleva v_t, que el lab no conoce: se carga la versión con números.
  P_DRAG.wrong[0].tex = '15.66\\left(1-e^{-0.6264t}\\right)'; P_DRAG.wrong[0].src = '15.66*(1 - e^(-0.6264*t))';
  var P_FISH = {
    name: 'Crecimiento de un pez (von Bertalanffy)', tex: "W' = 3W^{2/3} - W,\\qquad W(0) = 1", iv: 't', dv: 'W', order: 1,
    rhs: '3*y^(2/3) - y', x0: 0, ics: [1], domain: [0, 15], yRange: [0, 30], field: true,
    solution: '(3 - 2e^(-t/3))^3', solutionTex: '\\left(3 - 2e^{-t/3}\\right)^3',
    methods: METHODS, method: [0, 2], methodWhy: 'Es Bernoulli con $n = \\tfrac{2}{3}$ ($v = W^{1/3}$ la vuelve lineal); como no tiene $t$ suelta, también se puede separar.',
    hint: 'Con $v = W^{1/3}$: $v\' + \\frac{1}{3}v = 1$. Al final eleva al cubo.',
    wrong: [
      { src: '27(1 - e^(-t/3))', tex: '27\\left(1-e^{-\\frac{t}{3}}\\right)', key: 'residual' },
      { src: '(3 - 2e^(-t))^3', tex: '\\left(3-2e^{-t}\\right)^3', key: 'residual' },
      { src: '(3 - e^(-t/3))^3', tex: '\\left(3-e^{-\\frac{t}{3}}\\right)^3', key: 'ic' }
    ]
  };

  var data = window.SESSION_DATA = {
    slug: 'sesion-08', number: '08', group: 'B · Primer orden II y orden n',
    title: 'Modelado con primer orden: circuitos RC y RL, mezclas y poblaciones', temario: [],
    minutes: 150,
    quote: 'Modelar es traducir una frase («entra tanto, sale tanto») a una ecuación. Resolver ya lo sabes; lo difícil es plantear.',
    badges: [
      'Plantear una EDO a partir de un balance (lo que entra menos lo que sale) o de una ley física.',
      'Elegir el método: separable, lineal, Bernoulli o exacta.',
      'Resolver circuitos RC y RL, tanques con volumen variable y modelos de población.',
      'Interpretar el resultado: estado estacionario, constante de tiempo y velocidad terminal.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Casi todo modelo de primer orden sale de una frase: <strong>la razón de cambio = lo que entra − lo que sale</strong>, o de una ley física (Kirchhoff, Newton). Después, eliges el método que ya conoces.',
        recall: [
          '<a href="../sesion-02/">Separables</a> (S02), <a href="../sesion-04/">lineales</a> (S04), <a href="../sesion-05/">Bernoulli</a> (S05) y <a href="../sesion-06/">exactas</a> (S06).',
          'El <a href="../../../fisica-2/sesiones/sesion-15/">circuito RC</a> (Física 2, S15) y el <a href="../../../fisica-3/sesiones/sesion-14/">circuito RL</a> (Física 3, S14).',
          'La segunda ley de Newton $F = ma$ con $a = v\'$.'
        ],
        why: 'Es la sesión que conecta todo lo anterior con problemas de verdad: cuánta sal hay en un tanque, cuánto tarda en cargarse un capacitor, a qué velocidad cae un paracaidista.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Tu cuenta de banco: cada mes entra tu sueldo y sale lo que gastas. Si además el banco te cobra una comisión proporcional a tu saldo, «lo que sale» depende de cuánto tienes. Escribir eso es una ecuación diferencial: $S\' = \\text{sueldo} - \\text{gastos} - k\\,S$.',
          'Todos los modelos de esta sesión tienen esa estructura. Lo que cambia es qué es «lo que entra» y «lo que sale»: sal en un tanque, carga en un capacitor, corriente en una bobina, individuos en una población o velocidad de un cuerpo que cae.'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: plantear un modelo', short: 'Plantear',
        steps: [
          { text: 'Define la variable que cambia y sus unidades: $A(t)$ en gramos, $i(t)$ en amperes, $P(t)$ en individuos.' },
          { text: 'Escribe la razón de cambio como balance: $\\frac{dA}{dt} = (\\text{entra}) - (\\text{sale})$, o usa la ley física (Kirchhoff: suma de voltajes = 0; Newton: $mv\' = \\sum F$).', tip: 'Revisa unidades: cada término debe tener las de $dA/dt$ (por ejemplo, g/min).' },
          { text: 'Agrega la condición inicial con la información del problema.' },
          { text: 'Reconoce el tipo: si se factoriza en $g(t)h(y)$, separable; si es $y\' + P(t)y = Q(t)$, lineal; si tiene $y^n$, Bernoulli.', tip: 'Una ecuación puede ser de dos tipos a la vez; elige el método más corto.' },
          { text: 'Resuelve, contesta la pregunta con unidades e interpreta: ¿a qué tiende?, ¿qué tan rápido?' }
        ]
      },
      {
        type: 'concept', heading: 'Circuitos RC y RL', short: 'RC y RL',
        body: [
          'En un <strong>RC</strong> en serie con fem $\\varepsilon$, la ley de mallas da $\\varepsilon - Ri - \\frac{q}{C} = 0$ con $i = q\'$: $$Rq\' + \\frac{q}{C} = \\varepsilon \\;\\Longrightarrow\\; q = C\\varepsilon\\left(1 - e^{-t/RC}\\right),\\quad \\tau = RC$$',
          'En un <strong>RL</strong>, la bobina aporta $-L\\,i\'$: $\\varepsilon - Ri - Li\' = 0$, es decir $$Li\' + Ri = \\varepsilon \\;\\Longrightarrow\\; i = \\frac{\\varepsilon}{R}\\left(1 - e^{-Rt/L}\\right),\\quad \\tau = \\frac{L}{R}$$',
          'Las dos son lineales con coeficientes constantes: estado estacionario más transitorio. Al quitar la fuente ($\\varepsilon = 0$), descargan: $q = q_0e^{-t/RC}$, $i = i_0e^{-Rt/L}$.'
        ]
      },
      {
        type: 'example', heading: 'Corriente en un RL',
        diagram: 'c3s08-rl',
        problem: '<p>Un circuito RL tiene $L = 0.5$ H, $R = 10$ Ω y una batería de 12 V. Se cierra el interruptor en $t = 0$. ¿Cuánta corriente hay a los 0.05 s?</p>',
        steps: [
          { text: 'Plantea con Kirchhoff y escribe la forma estándar.', math: "0.5\\,i' + 10\\,i = 12 \\;\\Rightarrow\\; i' + 20\\,i = 24, \\qquad i(0) = 0" },
          { text: 'Estado estacionario $\\varepsilon/R = 1.2$ A, constante de tiempo $L/R = 0.05$ s.', math: 'i = 1.2\\left(1 - e^{-20t}\\right)' },
          { text: 'En $t = 0.05$ s ($t = \\tau$):', math: 'i(0.05) = 1.2\\left(1 - e^{-1}\\right) \\approx ' + fx(rl.i, 3) + '\\ \\text{A}' }
        ],
        answer: 'Unos ' + fx(rl.i, 3) + ' A: en una constante de tiempo llega al 63 % del máximo, como el capacitor.',
        verify: { lab: 'call', mod: 'ode', fn: 'solveAt', math: true, args: [P_RL, 0.05], value: rl.i }
      },
      {
        type: 'concept', heading: 'Mezclas con volumen variable', short: 'Volumen variable',
        body: [
          'Si entra a $r_{in}$ L/min y sale a $r_{out}$ L/min, el volumen cambia: $V(t) = V_0 + (r_{in} - r_{out})\\,t$. Lo que sale lleva la concentración del tanque en ese momento, $A/V(t)$: $$\\frac{dA}{dt} = r_{in}\\,c_{in} - r_{out}\\,\\frac{A}{V_0 + (r_{in} - r_{out})t}$$',
          'Sigue siendo lineal, pero ahora $P(t)$ no es constante y el factor integrante es una potencia de $V(t)$. Ojo: el modelo solo vale mientras el tanque no se derrame ni se vacíe.'
        ],
        diagram: 'c3s04-tank',
        caption: 'Ahora $r_{in} \\neq r_{out}$: el nivel sube (o baja) y la concentración de salida es $A/V(t)$.'
      },
      {
        type: 'example', heading: 'Un tanque que se llena',
        diagram: 'c3s08-volume',
        problem: '<p>Un tanque tiene 100 L de agua pura. Entra salmuera con 2 g/L a 3 L/min y sale la mezcla a 2 L/min. ¿Cuánta sal hay a los 50 minutos?</p>',
        steps: [
          { text: 'El volumen es $V = 100 + t$. El balance:', math: "A' = 3(2) - 2\\,\\frac{A}{100 + t} \\;\\Rightarrow\\; A' + \\frac{2}{100 + t}A = 6" },
          { text: 'Factor integrante $e^{\\int \\frac{2}{100 + t}dt} = (100 + t)^2$.', math: "\\left((100 + t)^2A\\right)' = 6(100 + t)^2 \\;\\Rightarrow\\; (100 + t)^2A = 2(100 + t)^3 + C" },
          { text: 'Con $A(0) = 0$: $C = -2(100)^3 = -2\\times 10^6$. Evalúa en 50.', math: 'A(50) = 2(150) - \\frac{2\\times 10^6}{150^2} \\approx ' + fx(tankV(50)) + '\\ \\text{g}' }
        ],
        answer: 'Unos ' + fx(tankV(50)) + ' g. Con el volumen fijo habrías usado el modelo de S04, que aquí da otra respuesta: el lab lo marca.',
        verify: { lab: 'call', mod: 'ode', fn: 'solveAt', math: true, args: [P_TANK, 50], value: tankV(50) }
      },
      {
        type: 'concept', heading: 'Poblaciones', short: 'Poblaciones',
        body: [
          '<strong>Malthus</strong>: $P\' = kP$, crecimiento exponencial sin límite (S02). Sirve al principio, cuando hay recursos de sobra.',
          '<strong>Logística</strong>: $P\' = rP\\left(1 - \\frac{P}{K}\\right)$, con capacidad de carga $K$ (S05).',
          '<strong>Con cosecha o migración</strong>: $P\' = kP - h$ (lineal) o $P\' = rP(1 - P/K) - h$ (separable). Si se cosecha demasiado ($h$ grande), la población se extingue: las soluciones de equilibrio desaparecen.'
        ]
      },
      {
        type: 'explainer', heading: 'Velocidad terminal', short: 'Caída con resistencia',
        title: 'Un cuerpo que cae con resistencia del aire',
        intro: 'Newton: $mv\' = mg - (\\text{resistencia})$. Cuando la resistencia iguala al peso, la velocidad deja de cambiar.',
        diagram: 'c3s08-drag',
        steps: [
          { text: 'Con resistencia lineal, $v\' = g - cv$: es lineal (y separable). La velocidad tiende a $g/c$ como un capacitor que se carga.', state: { quad: 0 } },
          { text: 'Con resistencia cuadrática (más realista a alta velocidad), $v\' = g - kv^2$: no es lineal, pero sí separable. Tiende a $v_t = \\sqrt{g/k}$ y la solución es $v = v_t\\tanh(gt/v_t)$. Las dos empiezan como caída libre ($v \\approx gt$).', state: { quad: 1 } }
        ]
      },
      {
        type: 'callout', heading: '¿Qué método elijo?',
        body: [
          '<strong>Separable</strong> si no aparece $t$ suelta (ecuación autónoma $y\' = f(y)$) o si se factoriza $g(t)h(y)$. <strong>Lineal</strong> si $y$ y $y\'$ aparecen a la primera potencia, aunque los coeficientes dependan de $t$. <strong>Bernoulli</strong> si es lineal salvo un $y^n$. <strong>Exacta</strong> si la escribiste como $M\\,dx + N\\,dy = 0$ y $M_y = N_x$. Muchas veces dos métodos sirven: elige el que menos cuentas te deje.'
        ]
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Por qué lo que sale lleva $A/V$ y no $A$?', a: 'Porque sale líquido, no sal: cada litro que sale lleva la concentración del tanque, $A/V$ gramos por litro. Por $r_{out}$ litros por minuto salen $r_{out}A/V$ gramos por minuto.' },
          { q: '¿Cuándo deja de valer el modelo del tanque?', a: 'Cuando el volumen llega a la capacidad del tanque (se derrama) o a cero (se vacía). Revisa siempre el intervalo de tiempo.' },
          { q: '¿El RL y el RC son la misma ecuación?', a: 'Tienen la misma forma (lineal con coeficientes constantes), pero en el RC la incógnita es la carga y $\\tau = RC$; en el RL es la corriente y $\\tau = L/R$.' },
          { q: '¿Qué significa la velocidad terminal?', a: 'Es el estado estacionario: el valor donde $v\' = 0$ porque la resistencia ya iguala al peso. Se encuentra sin resolver nada, igualando el lado derecho a cero.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Plantear: razón de cambio = entra − sale, o la ley física; con unidades y condición inicial.',
          'RC: $\\tau = RC$; RL: $\\tau = L/R$. Las dos son estado estacionario + transitorio.',
          'Tanque con volumen variable: lineal con $P(t) = r_{out}/V(t)$.',
          'El estado estacionario (velocidad terminal, carga máxima) sale de igualar el lado derecho a cero.'
        ]
      }
    ],

    lab: {
      type: 'ode-compare', title: 'Elige el método y comprueba',
      intro: 'Para cada modelo, elige primero qué método usarías y luego escribe tu solución. El lab te dice si el método sirve y compara tu fórmula con la numérica. En el RL, mueve $L$, $R$ y $\\varepsilon$.',
      cfg: { start: 0, problems: [P_RL, P_TANK, P_HOUSE, P_DRAG, P_FISH] }
    },

    formulas: [
      { label: 'Balance', tex: '\\frac{dA}{dt} = (\\text{entra}) - (\\text{sale})' },
      { label: 'RC', tex: 'Rq\' + \\tfrac{q}{C} = \\varepsilon,\\quad \\tau = RC' },
      { label: 'RL', tex: "Li' + Ri = \\varepsilon,\\quad \\tau = \\tfrac{L}{R}" },
      { label: 'Tanque con volumen variable', tex: "A' = r_{in}c_{in} - r_{out}\\frac{A}{V_0 + (r_{in} - r_{out})t}" },
      { label: 'Velocidad terminal', tex: "v' = g - kv^2 \\Rightarrow v_t = \\sqrt{g/k}" }
    ],

    exercises: [
      {
        id: 'c3-s08-rl', title: 'Corriente en un RL',
        vars: { L: [0.1, 1, 0.1], R: [2, 20, 2], E: [6, 24, 6], t: [0.02, 0.2, 0.02] },
        prompt: function (v) { return '<p>Un circuito RL tiene $L = ' + v.L + '$ H, $R = ' + v.R + '$ Ω y una fem de ' + v.E + ' V. Si la corriente empieza en cero, ¿cuánta corriente hay a los ' + v.t + ' s?</p>'; },
        check: 'numeric', unit: 'A',
        answer: function (v) { return v.E / v.R * (1 - Math.exp(-v.R * v.t / v.L)); },
        mistakes: {
          tauInv: function (v) { return v.E / v.R * (1 - Math.exp(-v.L * v.t / v.R)); },
          decay: function (v) { return v.E / v.R * Math.exp(-v.R * v.t / v.L); },
          overL: function (v) { return v.E / v.L * (1 - Math.exp(-v.R * v.t / v.L)); }
        },
        feedback: [
          { when: 'tauInv', say: 'La constante de tiempo de un RL es $L/R$: el exponente es $-Rt/L$.' },
          { when: 'decay', say: 'Esa es la corriente cuando se quita la fuente. Con la fuente conectada, $i$ crece desde 0.' },
          { when: 'overL', say: 'El máximo es $\\varepsilon/R$ (ley de Ohm cuando la bobina ya no estorba).' }
        ],
        where: function (v) { return v.R * v.t / v.L < 6; },
        oracle: { lab: 'value', value: function (v) { return rk({ iv: 't', order: 1, rhs: 'E/L - R*y/L', params: { E: v.E, L: v.L, R: v.R }, x0: 0, ics: [0], domain: [0, 1] }, v.t); } },
        hint: '$i = \\frac{\\varepsilon}{R}\\left(1 - e^{-Rt/L}\\right)$.',
        solution: function (v) { var i = v.E / v.R * (1 - Math.exp(-v.R * v.t / v.L)); return '$$i = \\frac{' + v.E + '}{' + v.R + '}\\left(1 - e^{-' + v.R + '(' + v.t + ')/' + v.L + '}\\right) \\approx ' + fx(i, 3) + '\\ \\text{A}$$'; }
      },
      {
        id: 'c3-s08-tanque', title: 'Tanque con volumen variable',
        vars: { V0: [50, 200, 50], c: [1, 3, 1], t: [10, 60, 10] },
        prompt: function (v) { return '<p>Un tanque tiene ' + v.V0 + ' L de agua pura. Entra salmuera con ' + v.c + ' g/L a 3 L/min y sale la mezcla a 2 L/min. ¿Cuánta sal hay a los ' + v.t + ' minutos?</p>'; },
        check: 'numeric', unit: 'g',
        answer: function (v) { var V = v.V0 + v.t; return v.c * V - v.c * Math.pow(v.V0, 3) / (V * V); },
        mistakes: {
          fixedV: function (v) { return v.V0 * v.c * 1.5 * (1 - Math.exp(-2 * v.t / v.V0)); },
          noTransient: function (v) { return v.c * (v.V0 + v.t); }
        },
        feedback: [
          { when: 'fixedV', say: 'El volumen no es fijo: $V = V_0 + t$ porque entra más de lo que sale.' },
          { when: 'noTransient', say: 'Falta la parte que depende de la condición inicial: $A(0) = 0$ fija la constante.' }
        ],
        oracle: { lab: 'value', value: function (v) { return rk({ iv: 't', order: 1, rhs: '3*c - 2y/(V0 + t)', params: { c: v.c, V0: v.V0 }, x0: 0, ics: [0], domain: [0, 60] }, v.t); } },
        hint: '$A\' + \\frac{2}{V_0 + t}A = 3c$, con factor integrante $(V_0 + t)^2$.',
        solution: function (v) { var V = v.V0 + v.t, A = v.c * V - v.c * Math.pow(v.V0, 3) / (V * V); return '$$(V_0 + t)^2A = c(V_0 + t)^3 - cV_0^3 \\;\\Rightarrow\\; A(' + v.t + ') = ' + v.c + '(' + V + ') - \\frac{' + v.c + '(' + v.V0 + ')^3}{' + V + '^2} \\approx ' + fx(A) + '\\ \\text{g}$$'; }
      },
      {
        id: 'c3-s08-terminal', title: 'Velocidad terminal',
        vars: { m: [50, 100, 10], k: [0.1, 0.5, 0.05] },
        prompt: function (v) { return '<p>Un paracaidista de ' + v.m + ' kg cae con resistencia del aire $k\\,v^2$, con $k = ' + v.k + '$ kg/m. ¿Cuál es su velocidad terminal?</p>'; },
        check: 'numeric', unit: 'm/s',
        answer: function (v) { return Math.sqrt(v.m * G / v.k); },
        mistakes: {
          linear: function (v) { return v.m * G / v.k; },
          noMass: function (v) { return Math.sqrt(G / v.k); }
        },
        feedback: [
          { when: 'linear', say: 'Ese sería con resistencia lineal. Con $kv^2$ queda $v_t^2 = mg/k$: saca raíz.' },
          { when: 'noMass', say: 'La ecuación es $mv\' = mg - kv^2$: la masa no se cancela con $k$.' }
        ],
        oracle: { lab: 'value', value: function (v) { return rk({ iv: 't', order: 1, rhs: '9.81 - k*y^2/m', params: { k: v.k, m: v.m }, x0: 0, ics: [0], domain: [0, 1] }, 200); } },
        hint: 'En la velocidad terminal $v\' = 0$: el peso iguala a la resistencia.',
        solution: function (v) { return '$$mg = kv_t^2 \\;\\Rightarrow\\; v_t = \\sqrt{\\frac{' + v.m + '(9.81)}{' + v.k + '}} \\approx ' + fx(Math.sqrt(v.m * G / v.k)) + '\\ \\text{m/s}$$'; }
      },
      {
        id: 'c3-s08-descarga', title: 'Capacitor que se descarga',
        vars: { R: [1, 10, 1], C: [1, 10, 1], p: [10, 50, 10] },
        prompt: function (v) { return '<p>Un capacitor de $' + v.C + '$ μF cargado se descarga a través de una resistencia de $' + v.R + '$ kΩ. ¿En cuántos milisegundos le queda el ' + v.p + ' % de su carga?</p>'; },
        check: 'numeric', unit: 'ms',
        answer: function (v) { return v.R * v.C * Math.log(100 / v.p); },
        mistakes: {
          noLog: function (v) { return v.R * v.C * (1 - v.p / 100); },
          inverse: function (v) { return v.R * v.C / Math.log(100 / v.p); }
        },
        feedback: [
          { when: 'noLog', say: 'La descarga es exponencial: $q = q_0e^{-t/RC}$, así que $t = RC\\ln(q_0/q)$.' },
          { when: 'inverse', say: 'Despeja multiplicando por $RC$: $t = RC\\ln(100/p)$.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          var P = { iv: 't', order: 1, rhs: '-y/tau', params: { tau: v.R * v.C }, x0: 0, ics: [100], domain: [0, 1] }, a = 0, b = 10 * v.R * v.C;
          for (var i = 0; i < 60; i++) { var m = (a + b) / 2; if (rk(P, m) > v.p) a = m; else b = m; }
          return (a + b) / 2;
        } },
        hint: '$q = q_0e^{-t/RC}$ y $RC$ en ms con kΩ y μF.',
        solution: function (v) { return '$$\\frac{' + v.p + '}{100} = e^{-t/RC} \\;\\Rightarrow\\; t = ' + (v.R * v.C) + '\\ln\\frac{100}{' + v.p + '} \\approx ' + fx(v.R * v.C * Math.log(100 / v.p)) + '\\ \\text{ms}$$'; }
      },
      {
        id: 'c3-s08-metodo', title: '¿Qué método conviene?',
        vars: { k: [0, 3, 1] },
        prompt: function (v) {
          var eqs = ["T' = -0.2\\,(T - 15 - 3\\cos t)", "v' = 9.81 - 0.3\\,v^2", "P' = 0.1P - 0.002P^2", "A' = 5 - \\frac{3A}{200 - t}"];
          return '<p>¿Qué método es el más directo para resolver $' + eqs[v.k] + '$?</p>';
        },
        check: 'choice',
        options: function (v) {
          var right = ['lin', 'sep', 'ber', 'lin'][v.k];
          var all = [
            ['sep', 'Separable', ['El ambiente depende de $t$: no se separa.', '', '', 'El coeficiente depende de $t$ y hay término independiente: no se separa.'][v.k]],
            ['lin', 'Lineal (factor integrante)', ['', 'Tiene $v^2$: no es lineal.', 'Tiene $P^2$: no es lineal.', ''][v.k]],
            ['ber', 'Bernoulli', ['No hay potencia $T^n$.', 'El término 9.81 no deja que sea Bernoulli.', '', 'No hay potencia $A^n$.'][v.k]]
          ];
          return all.map(function (o) { return o[0] === right ? { text: o[1], correct: true } : { text: o[1], say: o[2] || 'Hay un camino más corto.' }; });
        },
        answer: function (v) { return { lin: 'Lineal (factor integrante)', sep: 'Separable', ber: 'Bernoulli' }[['lin', 'sep', 'ber', 'lin'][v.k]]; },
        hint: 'Busca $y^n$, coeficientes que dependan de $t$ y si se puede factorizar.',
        solution: function (v) { return ['Lineal: $T\' + 0.2T = 0.2(15 + 3\\cos t)$.', 'Separable: $\\frac{dv}{9.81 - 0.3v^2} = dt$.', 'Bernoulli con $n = 2$ (la logística); también separable.', 'Lineal con $P = \\frac{3}{200 - t}$.'][v.k]; }
      }
    ],

    quiz: { tags: ['c3.S08'], count: 8 },

    errors: [
      'Usar $A$ en lugar de la concentración $A/V$ en lo que sale.',
      'Dejar el volumen fijo cuando las razones de entrada y salida son distintas.',
      'Confundir la constante de tiempo del RL ($L/R$) con la del RC ($RC$).',
      'Escribir la resistencia del aire con signo a favor del movimiento.',
      'Mezclar unidades (minutos con horas, mA con A) al plantear.',
      'Resolver sin revisar si la respuesta tiene sentido (sal negativa, velocidad mayor que la terminal).'
    ],

    teacher: {
      plan: [
        'La cuenta de banco como modelo de balance; luego la receta de plantear.',
        'RC y RL juntos: misma forma, distinta constante de tiempo (enlazar con Física 2 y Física 3).',
        'Tanque con volumen variable en el pizarrón, con el factor $(100 + t)^2$.',
        'Lab: que elijan el método antes de escribir; discutir los casos con dos métodos válidos.'
      ],
      check: [
        'Que escriban las unidades de cada término al plantear.',
        'Que encuentren el estado estacionario sin resolver.'
      ],
      note: 'El RLC (segundo orden) y la masa–resorte van en la sesión 15. Los métodos numéricos quedan para el curso de modelación computacional.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 2</em>, §4.5 “First-order Linear Equations” (aplicaciones). <a href="https://openstax.org/books/calculus-volume-2/pages/4-5-first-order-linear-equations">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 2</em>, §10.5 “RC Circuits” y §14.4 “RL Circuits”. <a href="https://openstax.org/books/university-physics-volume-2/pages/14-4-rl-circuits">openstax.org</a> (CC BY-NC-SA 4.0).',
      'MIT OpenCourseWare. <em>18.03SC Differential Equations</em> (Fall 2011), Unit I, “Models and Applications”. <a href="https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/">ocw.mit.edu</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-07',
    next: 'sesion-09'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
