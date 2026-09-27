/* =====================================================================
   Física 1 · S01 · Modelación, unidades y análisis dimensional (bloque A).
   Fuente: OpenStax, University Physics Volume 1, §1.2–1.4 y §1.7 (CC BY-NC-SA 4.0).
   Sin lab: explicaciones gráficas. Las conversiones y dimensiones se comprueban
   contra LabMath.units (shared/js/labs/units.js) en scripts/examples.test.js.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number(v.toFixed(d == null ? 2 : d)).toString(); }

  // La respuesta y cada error típico deben diferir al menos 3 % entre sí.
  function distinct(ex) {
    return function (v) {
      var vals = [ex.answer(v)].concat(Object.keys(ex.mistakes).map(function (k) { return ex.mistakes[k](v); }));
      for (var i = 0; i < vals.length; i++) for (var j = i + 1; j < vals.length; j++) {
        if (Math.abs(vals[i] - vals[j]) <= 0.03 * Math.max(Math.abs(vals[i]), Math.abs(vals[j]))) return false;
      }
      return true;
    };
  }

  var data = window.SESSION_DATA = {
    slug: 'sesion-01', number: '01', group: 'A · Herramientas',
    title: 'Modelación, unidades y análisis dimensional', temario: [],
    minutes: 120,
    quote: 'Antes de resolver, decide qué ignorar: un buen modelo deja fuera lo que no cambia la respuesta.',
    badges: [
      'Modelar una situación: qué se simplifica y por qué.',
      'Convertir unidades con factores que valen 1.',
      'Usar prefijos del SI y notación científica.',
      'Revisar una fórmula con sus dimensiones.'
    ],

    lesson: [
      {
        type: 'concept', heading: 'Modelar es decidir qué ignorar', short: 'Modelación',
        body: [
          'La física no resuelve el mundo real completo: resuelve un <strong>modelo</strong> de él. Un carro que avanza por una carretera tiene ruedas, motor y aire que lo frena, pero para saber cuánto tarda en llegar basta tratarlo como un <strong>punto</strong> que se mueve.',
          'Las simplificaciones que vas a usar en todo el curso son: el objeto es una partícula (su tamaño no importa), no hay resistencia del aire y $g = 9.81\\ \\text{m/s}^2$ es constante cerca de la superficie de la Tierra.',
          'Un modelo es bueno si lo que ignora no cambia la respuesta de forma apreciable. Si el objeto gira o el aire importa (un paracaídas), hace falta un modelo más completo.'
        ],
        diagram: 'model-particle',
        caption: 'El mismo carro, real y como modelo: para la cinemática basta un punto con su velocidad.'
      },
      {
        type: 'concept', heading: 'El Sistema Internacional', short: 'Unidades SI',
        body: [
          'Toda cantidad física es un número <strong>con unidad</strong>: "5" no dice nada; "5 m" sí. En este curso se usa el Sistema Internacional (SI), cuyas unidades base para mecánica son el <strong>metro</strong> (m), el <strong>kilogramo</strong> (kg) y el <strong>segundo</strong> (s).',
          'Las demás se construyen con ellas: la velocidad en m/s, la aceleración en m/s², la fuerza en newtons, $1\\ \\text{N} = 1\\ \\text{kg·m/s}^2$, la energía en joules, $1\\ \\text{J} = 1\\ \\text{N·m}$, y la potencia en watts, $1\\ \\text{W} = 1\\ \\text{J/s}$.',
          'Los prefijos multiplican la unidad por una potencia de 10: kilo (k) $= 10^3$, mega (M) $= 10^6$, centi (c) $= 10^{-2}$, mili (m) $= 10^{-3}$, micro (μ) $= 10^{-6}$ y nano (n) $= 10^{-9}$.'
        ]
      },
      {
        type: 'explainer', heading: 'Convertir con factores que valen 1', short: 'Factores de conversión',
        title: 'De km/h a m/s',
        intro: 'Multiplicar por 1 no cambia una cantidad. Si el 1 está escrito como $\\frac{1000\\ \\text{m}}{1\\ \\text{km}}$, cambia la unidad sin cambiar el valor.',
        diagram: 'units-chain',
        steps: [
          { text: 'Escribe el dato como fracción con sus unidades: $72\\ \\text{km/h} = \\frac{72\\ \\text{km}}{1\\ \\text{h}}$.', state: { step: 0 } },
          { text: 'Multiplica por $\\frac{1000\\ \\text{m}}{1\\ \\text{km}}$, que vale 1. Los km de arriba y de abajo se cancelan.', state: { step: 1 } },
          { text: 'Multiplica por $\\frac{1\\ \\text{h}}{3600\\ \\text{s}}$, que también vale 1. Ahora se cancelan las horas.', state: { step: 2 } },
          { text: 'Solo quedan m/s: $\\frac{72 \\cdot 1000}{3600} = 20\\ \\text{m/s}$. Atajo: de km/h a m/s se divide entre 3.6.', state: { step: 3 } }
        ]
      },
      {
        type: 'example', heading: 'De km/h a m/s',
        problem: '<p>En la ciudad el límite de velocidad es de $90\\ \\text{km/h}$. ¿Cuánto es en m/s?</p>',
        steps: [
          { text: 'Multiplica por factores que valen 1 hasta que solo queden m/s.', math: '90\\ \\frac{\\text{km}}{\\text{h}} \\cdot \\frac{1000\\ \\text{m}}{1\\ \\text{km}} \\cdot \\frac{1\\ \\text{h}}{3600\\ \\text{s}}' },
          { text: 'Haz las cuentas.', math: '\\frac{90 \\cdot 1000}{3600}\\ \\frac{\\text{m}}{\\text{s}} = 25\\ \\text{m/s}' }
        ],
        answer: '$90\\ \\text{km/h} = 25\\ \\text{m/s}$.',
        verify: { lab: 'call', mod: 'units', fn: 'convert', args: [90, 'km/h', 'm/s'], value: 25 }
      },
      {
        type: 'example', heading: 'Unidades al cuadrado',
        problem: '<p>Una placa de un robot mide $2.5\\ \\text{m}^2$. ¿Cuántos $\\text{cm}^2$ son?</p>',
        steps: [
          { text: 'Un metro son 100 cm, pero aquí el metro está al cuadrado: el factor también va al cuadrado.', math: '2.5\\ \\text{m}^2 \\cdot \\left(\\frac{100\\ \\text{cm}}{1\\ \\text{m}}\\right)^2 = 2.5 \\cdot 10^4\\ \\text{cm}^2' },
          { text: 'Es decir, 25 000 cm². Si solo multiplicas por 100 obtienes 250, que es 100 veces menos.' }
        ],
        answer: '$2.5\\ \\text{m}^2 = 25\\,000\\ \\text{cm}^2$.',
        verify: { lab: 'call', mod: 'units', fn: 'convert', args: [2.5, 'm^2', 'cm^2'], value: 25000 }
      },
      {
        type: 'concept', heading: 'Dimensiones: longitud, masa y tiempo', short: 'Análisis dimensional',
        body: [
          'La <strong>dimensión</strong> de una cantidad dice de qué tipo es, sin importar la unidad: una distancia tiene dimensión de longitud $[L]$ lo mismo en metros que en millas. En mecánica todo se arma con $[L]$, $[M]$ y $[T]$.',
          'Ejemplos: velocidad $[L/T]$, aceleración $[L/T^2]$, fuerza $[M\\,L/T^2]$, energía $[M\\,L^2/T^2]$.',
          'La regla: <strong>solo se suman o igualan cantidades de la misma dimensión</strong>. No puedes sumar metros con segundos. Además, lo que va dentro de un seno, un logaritmo o una exponencial no tiene dimensión.'
        ]
      },
      {
        type: 'explainer', heading: 'Revisar una fórmula por sus dimensiones', short: 'Revisar fórmulas',
        title: '¿Está bien escrita?',
        intro: 'Antes de usar una fórmula que no recuerdas bien, revisa que cada término tenga la misma dimensión.',
        diagram: 'dim-check',
        steps: [
          { text: 'Toma la ecuación de posición del MRUA: $x = x_0 + v_0 t + \\tfrac{1}{2}at^2$.', state: { step: 0 } },
          { text: 'Escribe la dimensión de cada término. El $\\tfrac{1}{2}$ no tiene dimensión.', state: { step: 1 } },
          { text: 'Todos dan $[L]$: la fórmula es dimensionalmente correcta. (Eso no garantiza el $\\tfrac{1}{2}$, pero descarta muchos errores).', state: { step: 2 } },
          { text: 'En cambio, $x = v_0 t^2$ da $[L/T]\\cdot[T^2] = [L\\,T]$, que no es una longitud: está mal.', state: { step: 3 } }
        ]
      },
      {
        type: 'example', heading: 'Encontrar una fórmula con dimensiones',
        problem: '<p>El periodo $T$ de un péndulo (el tiempo de una oscilación) solo puede depender de su longitud $L$ y de $g$. Si $T = C\\,L^a g^b$ con $C$ un número sin unidades, ¿cuánto valen $a$ y $b$?</p>',
        steps: [
          { text: 'Escribe las dimensiones de cada lado.', math: '[T] = [L]^a \\left[\\frac{L}{T^2}\\right]^b = [L]^{a+b}\\,[T]^{-2b}' },
          { text: 'Iguala exponentes: de $[T]$, $-2b = 1$; de $[L]$, $a + b = 0$.', math: 'b = -\\tfrac{1}{2} \\qquad a = \\tfrac{1}{2}' },
          { text: 'Así que $T = C\\sqrt{L/g}$. El análisis dimensional no da $C$ (resulta ser $2\\pi$), pero sí la forma de la fórmula.' }
        ],
        answer: '$a = \\tfrac{1}{2}$ y $b = -\\tfrac{1}{2}$: $T = C\\sqrt{L/g}$.',
        verify: { lab: 'call', mod: 'units', fn: 'product', args: [[['m', 0.5], ['m/s^2', -0.5]]], value: { M: 0, L: 0, T: 1 } }
      },
      {
        type: 'callout', heading: 'Notación científica y cifras',
        body: [
          'Escribe los números muy grandes o muy chicos como $a \\times 10^n$: la rapidez de la luz es $3.00 \\times 10^8\\ \\text{m/s}$ y el grosor de un cabello, unos $8 \\times 10^{-5}\\ \\text{m}$.',
          'Da tus resultados con unas 3 cifras significativas: si los datos traen 2 o 3 cifras, escribir 8 decimales no agrega precisión.'
        ]
      }
    ],

    lab: null,

    formulas: [
      { label: 'Rapidez', tex: '1\\ \\text{m/s} = 3.6\\ \\text{km/h}' },
      { label: 'Área y volumen', tex: '1\\ \\text{m}^2 = 10^4\\ \\text{cm}^2,\\ \\ 1\\ \\text{m}^3 = 10^6\\ \\text{cm}^3' },
      { label: 'Litro', tex: '1\\ \\text{L} = 10^{-3}\\ \\text{m}^3 = 1000\\ \\text{cm}^3' },
      { label: 'Tiempo', tex: '1\\ \\text{h} = 3600\\ \\text{s},\\ \\ 1\\ \\text{día} = 86\\,400\\ \\text{s}' },
      { label: 'Fuerza, energía, potencia', tex: '\\text{N} = \\text{kg·m/s}^2,\\ \\text{J} = \\text{N·m},\\ \\text{W} = \\text{J/s}' },
      { label: 'Dimensiones', tex: '[v] = L/T,\\ \\ [a] = L/T^2,\\ \\ [F] = ML/T^2' }
    ],

    exercises: [
      {
        id: 'f1-s01-kmh', title: 'De km/h a m/s',
        vars: { v: [20, 150, 5] },
        prompt: function (v) { return '<p>Un tren viaja a $' + v.v + '\\ \\text{km/h}$. ¿Cuál es su rapidez en m/s?</p>'; },
        check: 'numeric', unit: 'm/s',
        answer: function (v) { return v.v * 1000 / 3600; },
        mistakes: {
          multiplied: function (v) { return v.v * 3.6; },
          usedMinutes: function (v) { return v.v * 1000 / 60; }
        },
        feedback: [
          { when: 'multiplied', say: 'Multiplicaste por 3.6; de km/h a m/s se divide. Revisa qué unidad se cancela con cada factor.' },
          { when: 'usedMinutes', say: 'Una hora tiene 3600 s, no 60: usaste los minutos.' }
        ],
        oracle: { lab: 'call', mod: 'units', fn: 'convert', args: function (v) { return [v.v, 'km/h', 'm/s']; } },
        hint: 'Multiplica por $\\frac{1000\\ \\text{m}}{1\\ \\text{km}}$ y por $\\frac{1\\ \\text{h}}{3600\\ \\text{s}}$.',
        solution: function (v) { return '$$' + v.v + '\\ \\frac{\\text{km}}{\\text{h}} \\cdot \\frac{1000\\ \\text{m}}{1\\ \\text{km}} \\cdot \\frac{1\\ \\text{h}}{3600\\ \\text{s}} = ' + fx(v.v / 3.6) + '\\ \\text{m/s}$$'; }
      },
      {
        id: 'f1-s01-area', title: 'Área en m²',
        vars: { A: [50, 950, 25] },
        prompt: function (v) { return '<p>Un sensor tiene una cara de $' + v.A + '\\ \\text{cm}^2$. ¿Cuánto es en $\\text{m}^2$?</p>'; },
        check: 'numeric', unit: 'm²',
        answer: function (v) { return v.A / 1e4; },
        mistakes: { linear: function (v) { return v.A / 100; } },
        feedback: [{ when: 'linear', say: 'Dividiste entre 100, pero los cm están al cuadrado: $(1\\ \\text{m}/100\\ \\text{cm})^2 = 1/10^4$.' }],
        oracle: { lab: 'call', mod: 'units', fn: 'convert', args: function (v) { return [v.A, 'cm^2', 'm^2']; } },
        hint: 'El factor $\\frac{1\\ \\text{m}}{100\\ \\text{cm}}$ va al cuadrado.',
        solution: function (v) { return '$$' + v.A + '\\ \\text{cm}^2 \\cdot \\left(\\frac{1\\ \\text{m}}{100\\ \\text{cm}}\\right)^2 = \\frac{' + v.A + '}{10^4}\\ \\text{m}^2 = ' + fx(v.A / 1e4, 4) + '\\ \\text{m}^2$$'; }
      },
      {
        id: 'f1-s01-densidad', title: 'Densidad en el SI',
        vars: { rho: [0.5, 11.5, 0.1] },
        prompt: function (v) { return '<p>Un material tiene una densidad de $' + v.rho + '\\ \\text{g/cm}^3$. ¿Cuánto es en $\\text{kg/m}^3$?</p>'; },
        check: 'numeric', unit: 'kg/m³',
        answer: function (v) { return v.rho * 1000; },
        mistakes: {
          divided: function (v) { return v.rho / 1000; },
          noCube: function (v) { return v.rho * 0.1; }
        },
        feedback: [
          { when: 'divided', say: 'Dividiste entre 1000. Un $\\text{m}^3$ tiene $10^6\\ \\text{cm}^3$: la densidad en kg/m³ es un número mayor.' },
          { when: 'noCube', say: 'El factor de cm a m va al cubo: $(100\\ \\text{cm}/1\\ \\text{m})^3 = 10^6$.' }
        ],
        oracle: { lab: 'call', mod: 'units', fn: 'convert', args: function (v) { return [v.rho, 'g/cm^3', 'kg/m^3']; } },
        hint: 'Cambia los gramos a kg (÷ 1000) y los cm³ a m³ (× 10⁶ en el denominador).',
        solution: function (v) { return '$$' + v.rho + '\\ \\frac{\\text{g}}{\\text{cm}^3} \\cdot \\frac{1\\ \\text{kg}}{1000\\ \\text{g}} \\cdot \\left(\\frac{100\\ \\text{cm}}{1\\ \\text{m}}\\right)^3 = ' + fx(v.rho * 1000) + '\\ \\text{kg/m}^3$$'; }
      },
      {
        id: 'f1-s01-dias', title: 'Segundos en varios días',
        vars: { d: [2, 30, 1] },
        prompt: function (v) { return '<p>Una batería dura $' + v.d + '$ días. ¿Cuántos segundos son? (Escribe el número completo o en notación como <code>1.2e6</code>).</p>'; },
        check: 'numeric', unit: 's',
        answer: function (v) { return v.d * 86400; },
        mistakes: { minutes: function (v) { return v.d * 1440; } },
        feedback: [{ when: 'minutes', say: 'Esos son minutos: falta multiplicar por 60 s/min.' }],
        oracle: { lab: 'call', mod: 'units', fn: 'convert', args: function (v) { return [v.d, 'd', 's']; } },
        hint: '1 día = 24 h, 1 h = 60 min y 1 min = 60 s.',
        solution: function (v) { return '$$' + v.d + '\\ \\text{días} \\cdot 24 \\cdot 60 \\cdot 60 = ' + (v.d * 86400) + '\\ \\text{s} \\approx ' + fx(v.d * 86400 / 1e6, 3) + ' \\times 10^6\\ \\text{s}$$'; }
      },
      {
        id: 'f1-s01-ecuacion', title: 'Concepto: ¿qué ecuación puede ser correcta?',
        vars: {},
        prompt: function () { return '<p>$x$ es una posición, $v$ y $v_0$ son velocidades, $a$ es una aceleración y $t$ un tiempo. ¿Cuál ecuación es dimensionalmente correcta?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: '$v^2 = v_0^2 + 2ax$', correct: true },
            { text: '$x = v\\,t^2$', say: '$[L/T]\\cdot[T^2] = [L\\,T]$, que no es una longitud.' },
            { text: '$v = a\\,t^2$', say: '$[L/T^2]\\cdot[T^2] = [L]$, que no es una velocidad.' },
            { text: '$x = v + a\\,t$', say: 'Suma una velocidad con una velocidad, pero el resultado debería ser una longitud.' }
          ];
        },
        answer: function () { return '$v^2 = v_0^2 + 2ax$'; },
        hint: 'Escribe la dimensión de cada término y compárala con la del lado izquierdo.',
        solution: function () { return 'En $v^2 = v_0^2 + 2ax$ los tres términos son $[L^2/T^2]$: el $2ax$ da $[L/T^2]\\cdot[L]$.'; }
      },
      {
        id: 'f1-s01-exponente', title: 'Concepto: el exponente que falta',
        vars: {},
        prompt: function () { return '<p>La rapidez de las olas en aguas profundas solo depende de $g$ y de la longitud de onda $\\lambda$ (una longitud): $v = C\\,g^a\\lambda^b$. ¿Cuánto vale $a$?</p>'; },
        check: 'choice',
        options: function () {
          return [
            { text: '$a = \\tfrac{1}{2}$', correct: true },
            { text: '$a = 1$', say: 'Con $a = 1$ quedaría $[L/T^2]$ en el tiempo: el exponente de $[T]$ no daría $-1$.' },
            { text: '$a = -\\tfrac{1}{2}$', say: 'Así $[T]$ quedaría con exponente $+1$, no $-1$.' },
            { text: '$a = 2$', say: 'Con $a = 2$ el tiempo quedaría como $[T^{-4}]$.' }
          ];
        },
        answer: function () { return '$a = \\tfrac{1}{2}$'; },
        hint: 'Iguala el exponente de $[T]$: $[L/T] = [L/T^2]^a [L]^b$.',
        solution: function () { return 'De $[T]$: $-1 = -2a$, así que $a = \\tfrac{1}{2}$; de $[L]$: $1 = a + b$, así que $b = \\tfrac{1}{2}$. Queda $v = C\\sqrt{g\\lambda}$.'; }
      }
    ],

    quiz: { tags: ['f1.S01'], count: 8 },

    errors: [
      'Multiplicar por 3.6 al pasar de km/h a m/s: se divide.',
      'Convertir áreas o volúmenes con el factor lineal: los cm² necesitan $(100)^2$ y los cm³, $(100)^3$.',
      'Dejar resultados sin unidades o mezclar unidades (km con m) dentro de una misma cuenta.',
      'Sumar cantidades de distinta dimensión, como una velocidad con una distancia.',
      'Escribir muchos decimales que los datos no justifican.'
    ],

    teacher: {
      plan: [
        'Abre con el carro real contra el punto: ¿qué perdemos y qué ganamos al modelar?',
        'Explainer de factores de conversión en el pizarrón, cancelando unidades a mano.',
        'Revisión dimensional de fórmulas que ellos propongan (bien y mal escritas).'
      ],
      check: [
        'Que escriban las unidades en cada paso de una conversión.',
        'Que revisen dimensiones antes de sustituir números.'
      ],
      note: 'Esta sesión no tiene lab: los ejercicios y el quiz practican las conversiones. Los prefijos y la notación científica se usan en todo el curso.'
    },

    bibliography: [
      'OpenStax. <em>University Physics Volume 1</em>, §1.2 “Units and Standards”. <a href="https://openstax.org/books/university-physics-volume-1/pages/1-2-units-and-standards">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §1.3 “Unit Conversion”. <a href="https://openstax.org/books/university-physics-volume-1/pages/1-3-unit-conversion">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §1.4 “Dimensional Analysis”. <a href="https://openstax.org/books/university-physics-volume-1/pages/1-4-dimensional-analysis">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>University Physics Volume 1</em>, §1.7 “Solving Problems in Physics”. <a href="https://openstax.org/books/university-physics-volume-1/pages/1-7-solving-problems-in-physics">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: null,
    next: 'sesion-02'
  };
  data.exercises.forEach(function (ex) { if (ex.check === 'numeric' && ex.mistakes) ex.where = distinct(ex); });
})();
