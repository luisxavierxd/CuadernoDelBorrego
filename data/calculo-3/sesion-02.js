/* =====================================================================
   Cálculo 3 · S02 · Ecuaciones de variables separables
   (bloque A · Primer orden I).
   Fuente: OpenStax, Calculus Volume 2, §4.3 “Separable Equations”, CC BY-NC-SA 4.0.
   Los ejemplos se comprueban con LabMath.ode (lab ode-compare): la solución se
   sustituye en la ecuación y se revisan las condiciones iniciales; los ejercicios
   numéricos usan la integral numérica (RK4) o una búsqueda aparte como oráculo.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  function sgn(n) { return n < 0 ? ' - ' + (-n) : ' + ' + n; }

  // La respuesta y cada error típico difieren al menos 3 % entre sí (mensajes "casi" sin ambigüedad).
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
  // Ejemplo de datación: carbono 14, vida media 5730 años; queda 30 %.
  var c14 = { T: 5730 };
  c14.k = Math.log(2) / c14.T;
  c14.age = Math.log(1 / 0.3) / c14.k;
  // Ejemplo del café: 90 °C en un cuarto a 22 °C; a los 5 min está en 70 °C. ¿Cuándo llega a 40 °C?
  var cafe = { T0: 90, Ta: 22, T5: 70 };
  cafe.k = Math.log((cafe.T0 - cafe.Ta) / (cafe.T5 - cafe.Ta)) / 5;
  cafe.t40 = Math.log((cafe.T0 - cafe.Ta) / (40 - cafe.Ta)) / cafe.k;

  // Problemas del lab (también los usan los ejemplos).
  var P_DECAY = {
    name: 'Decaimiento: N′ = −kN', tex: "N' = -k\\,N,\\qquad N(0) = N_0", iv: 't', dv: 'N', order: 1,
    rhs: '-k*y', params: { k: { value: 0.3, min: 0.05, max: 1.2, step: 0.01, label: 'Constante de decaimiento k', unit: '1/año' }, N0: { value: 100 } },
    x0: 0, ics: ['N0'], domain: [0, 12], yRange: [0, 110],
    solution: 'N0*e^(-k*t)', solutionTex: 'N_0\\,e^{-kt} \\;(\\text{aquí } N_0 = 100)',
    hint: 'Separa: $\\dfrac{dN}{N} = -k\\,dt$. Puedes escribir $k$ con su letra o con su valor: si mueves el deslizador, la letra se actualiza sola.',
    wrong: [
      { src: '100e^(k*t)', tex: '100e^{kt}', key: 'residual' },
      { src: 'e^(-k*t)', tex: 'e^{-kt}', key: 'ic' },
      { src: '100e^(-t/k)', tex: '100e^{-t/k}', key: 'residual' },
      { src: '100 - k*t', tex: '100-kt', key: 'residual' }
    ]
  };
  var P_COOL = {
    name: 'Enfriamiento de Newton', tex: "T' = -k\\,(T - T_a),\\qquad T(0) = T_0", iv: 't', dv: 'T', order: 1,
    rhs: '-k*(y - Ta)',
    params: {
      k: { value: 0.1, min: 0.02, max: 0.5, step: 0.01, label: 'Constante k', unit: '1/min' },
      Ta: { value: 22, min: 0, max: 40, step: 1, label: 'Temperatura del cuarto Tₐ', unit: '°C' },
      T0: { value: 90, min: 0, max: 100, step: 1, label: 'Temperatura inicial T₀', unit: '°C' }
    },
    x0: 0, ics: ['T0'], domain: [0, 40], yRange: [0, 100], field: true,
    solution: 'Ta + (T0 - Ta)*e^(-k*t)', solutionTex: 'T_a + (T_0 - T_a)\\,e^{-kt}',
    hint: 'Separa con $\\dfrac{dT}{T - T_a} = -k\\,dt$. Escribe tu respuesta con las letras $k$, $T_a$ y $T_0$ para que siga valiendo al mover los deslizadores.',
    wrong: [
      { src: 'Ta + T0*e^(-k*t)', tex: 'T_a+T_0e^{-kt}', key: 'ic' },
      { src: 'T0*e^(-k*t)', tex: 'T_0e^{-kt}', key: 'residual' },
      { src: 'Ta + (T0 - Ta)*e^(k*t)', tex: 'T_a+\\left(T_0-T_a\\right)e^{kt}', key: 'residual' },
      { src: 'Ta - (T0 - Ta)*e^(-k*t)', tex: 'T_a-\\left(T_0-T_a\\right)e^{-kt}', key: 'ic' }
    ]
  };
  var P_GAUSS = {
    name: 'y′ = 2xy con y(0) = 3', tex: "y' = 2xy,\\qquad y(0) = 3", iv: 'x', dv: 'y', order: 1,
    rhs: '2x*y', x0: 0, ics: [3], domain: [-1.3, 1.3], yRange: [0, 18], field: true,
    solution: '3e^(x^2)', solutionTex: '3e^{x^2}',
    hint: 'Separa: $\\dfrac{dy}{y} = 2x\\,dx$, integra y despeja $y$ con la exponencial.',
    wrong: [
      { src: 'e^(x^2) + 2', tex: 'e^{x^2}+2', key: 'residual' },
      { src: '3e^(x^2/2)', tex: '3e^{\\frac{x^2}{2}}', key: 'residual' },
      { src: 'e^(x^2)', tex: 'e^{x^2}', key: 'ic' },
      { src: '3e^(2x)', tex: '3e^{2x}', key: 'residual' }
    ]
  };
  var P_ROOT = {
    name: 'y′ = x/y con y(0) = 2', tex: "y' = \\frac{x}{y},\\qquad y(0) = 2", iv: 'x', dv: 'y', order: 1,
    rhs: 'x/y', x0: 0, ics: [2], domain: [-3, 3], yRange: [-4, 4], field: true,
    solution: 'sqrt(x^2 + 4)', solutionTex: '\\sqrt{x^2 + 4}',
    hint: 'Separa: $y\\,dy = x\\,dx$. Al despejar $y$ de $y^2$, elige el signo de la raíz con la condición inicial.',
    wrong: [
      { src: 'sqrt(x^2) + 2', tex: '\\sqrt{x^2}+2', key: 'residual' },
      { src: 'sqrt(x^2 + 2)', tex: '\\sqrt{x^2+2}', key: 'ic' },
      { src: '-sqrt(x^2 + 4)', tex: '-\\sqrt{x^2+4}', key: 'ic' },
      { src: 'x^2/2 + 2', tex: '\\frac{x^2}{2}+2', key: 'residual' }
    ]
  };
  var P_TAN = {
    name: 'y′ = (1 + y²) cos x con y(0) = 0', tex: "y' = (1 + y^2)\\cos x,\\qquad y(0) = 0", iv: 'x', dv: 'y', order: 1,
    rhs: '(1 + y^2)*cos(x)', x0: 0, ics: [0], domain: [-6, 6], yRange: [-2.5, 2.5], field: true,
    solution: 'tan(sin(x))', solutionTex: '\\tan(\\sin x)',
    hint: '$\\displaystyle\\int \\frac{dy}{1 + y^2} = \\arctan y$.',
    wrong: [
      { src: 'sin(x)', tex: '\\sin\\left(x\\right)', key: 'residual' },
      { src: 'tan(x)', tex: '\\tan\\left(x\\right)', key: 'residual' },
      { src: 'tan(sin(x)) + 1', tex: '\\tan\\left(\\sin\\left(x\\right)\\right)+1', key: 'residual' },
      { src: 'arctan(sin(x))', tex: '\\arctan\\left(\\sin\\left(x\\right)\\right)', key: 'residual' }
    ]
  };

  var data = window.SESSION_DATA = {
    slug: 'sesion-02', number: '02', group: 'A · Primer orden I',
    title: 'Ecuaciones de variables separables', temario: [],
    minutes: 150,
    quote: 'Separar variables es poner cada cosa en su lado de la balanza: todo lo de y con dy, todo lo de x con dx. Lo demás es integrar.',
    badges: [
      'Reconocer una ecuación separable $\\dfrac{dy}{dx} = g(x)\\,h(y)$.',
      'Separar, integrar los dos lados y despejar $y$ con una sola constante.',
      'No perder las soluciones de equilibrio al dividir entre $h(y)$.',
      'Resolver problemas de decaimiento y de enfriamiento de Newton.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Si la ecuación se puede escribir como $\\dfrac{dy}{dx} = g(x)\\,h(y)$, pasa todo lo de $y$ a un lado y todo lo de $x$ al otro, e integra cada lado por separado.',
        recall: [
          'Qué es una solución y un PVI (<a href="../sesion-01/">S01 de este curso</a>).',
          'Integrales directas y <a href="../../../calculo-1/sesiones/sesion-10/">cambio de variable</a> (Cálculo 1, S10); a veces, <a href="../../../calculo-1/sesiones/sesion-13/">fracciones parciales</a> (Cálculo 1, S13).',
          'Logaritmo y exponencial: $\\ln|y| = u \\iff |y| = e^{u}$, y $e^{a + b} = e^a e^b$.'
        ],
        why: 'Es el método más usado de todo el curso. Con él salen la desintegración radiactiva (datación con carbono 14), el enfriamiento de un café, el interés compuesto continuo y la descarga de un capacitor.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Piensa en lavar ropa: antes de meterla a la lavadora la separas en blancos y de color, porque cada montón se lava distinto. Con una ecuación separable haces lo mismo: un montón con todo lo que tiene $y$ (junto con $dy$) y otro con todo lo que tiene $x$ (junto con $dx$). Cada montón se integra por su lado.',
          'Por ejemplo, el ritmo al que se desintegra un material radiactivo es proporcional a la cantidad que queda: $N\' = -kN$. Si tienes el doble de átomos, se desintegran el doble por segundo. Esa ecuación se separa en $\\dfrac{dN}{N} = -k\\,dt$, y de ahí sale que $N$ decae como una exponencial.'
        ]
      },
      {
        type: 'concept', heading: 'Cuándo una ecuación es separable', short: 'Forma separable',
        body: [
          'Una EDO de primer orden es <strong>separable</strong> si el lado derecho se factoriza en un producto de una función solo de $x$ por una función solo de $y$: $$\\frac{dy}{dx} = g(x)\\,h(y)$$',
          'Entonces se puede escribir como $\\dfrac{dy}{h(y)} = g(x)\\,dx$ (siempre que $h(y) \\neq 0$), y cada lado se integra respecto a su propia variable.'
        ],
        list: [
          '$y\' = x^2y$: separable, $g = x^2$, $h = y$.',
          '$y\' = e^{x + y}$: separable, porque $e^{x + y} = e^x e^y$.',
          '$y\' = \\dfrac{x}{y}$: separable, $g = x$, $h = 1/y$.',
          '$y\' = x + y$: <strong>no</strong> es separable; una suma no se factoriza así (la resolverás en la sesión 4).'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: variables separables', short: 'Receta',
        steps: [
          { text: 'Escribe $y\'$ como $\\dfrac{dy}{dx}$ y factoriza el lado derecho como $g(x)\\,h(y)$.' },
          { text: 'Antes de dividir, busca las raíces de $h(y) = 0$: cada $y = c$ con $h(c) = 0$ es una <strong>solución de equilibrio</strong> (constante).', tip: 'Si divides entre $y$ sin avisar, pierdes la solución $y = 0$.' },
          { text: 'Separa: $\\dfrac{dy}{h(y)} = g(x)\\,dx$, e integra cada lado.', tip: 'Pon <strong>una sola</strong> constante, del lado de $x$. Dos constantes ($C_1$ y $C_2$) se juntan en una.' },
          { text: 'Despeja $y$ si se puede. Si queda $\\ln|y| = u + C$, entonces $y = Ae^{u}$ con $A = \\pm e^{C}$ (y $A = 0$ recupera la de equilibrio).' },
          { text: 'Usa la condición inicial para la constante y comprueba: deriva tu $y$ y sustitúyela en la ecuación.' }
        ]
      },
      {
        type: 'example', heading: 'Separar, integrar y despejar',
        diagram: 'c3s02-gauss',
        problem: '<p>Resuelve $\\dfrac{dy}{dx} = 2xy$ con $y(0) = 3$.</p>',
        steps: [
          { text: 'Es separable con $g = 2x$ y $h = y$. La solución de equilibrio es $y = 0$ (no cumple $y(0) = 3$). Separa:', math: '\\frac{dy}{y} = 2x\\,dx' },
          { text: 'Integra cada lado, con una sola constante.', math: '\\ln|y| = x^2 + C' },
          { text: 'Despeja con la exponencial: $|y| = e^{C}e^{x^2}$, es decir $y = Ae^{x^2}$.', math: 'y = A\\,e^{x^2}' },
          { text: 'Con $y(0) = 3$: $A\\,e^{0} = 3$.', math: 'y = 3e^{x^2}' }
        ],
        answer: '$y = 3e^{x^2}$. Comprueba: $y\' = 3e^{x^2}\\cdot 2x = 2x\\,y$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_GAUSS, '3e^(x^2)'], value: 1 }
      },
      {
        type: 'example', heading: 'Cuando sale una raíz: elige el signo',
        diagram: 'c3s02-branch',
        problem: '<p>Resuelve $\\dfrac{dy}{dx} = \\dfrac{x}{y}$ con $y(0) = 2$.</p>',
        steps: [
          { text: 'Separa multiplicando por $y$ y por $dx$.', math: 'y\\,dy = x\\,dx' },
          { text: 'Integra.', math: '\\frac{y^2}{2} = \\frac{x^2}{2} + C \\quad\\Longrightarrow\\quad y^2 = x^2 + K' },
          { text: 'La condición inicial da $4 = 0 + K$, así que $y^2 = x^2 + 4$: la solución viene implícita. Al despejar hay dos signos.', math: 'y = \\pm\\sqrt{x^2 + 4}' },
          { text: 'Como $y(0) = 2 > 0$, se queda el signo positivo.' }
        ],
        answer: '$y = \\sqrt{x^2 + 4}$. Con $y(0) = -2$ sería $y = -\\sqrt{x^2 + 4}$: el lab te avisa si eliges la rama equivocada.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_ROOT, 'sqrt(x^2 + 4)'], value: 1 }
      },
      {
        type: 'example', heading: 'Con arcotangente',
        problem: '<p>Resuelve $y\' = (1 + y^2)\\cos x$ con $y(0) = 0$.</p>',
        steps: [
          { text: '$h(y) = 1 + y^2$ nunca es 0: no hay soluciones de equilibrio. Separa.', math: '\\frac{dy}{1 + y^2} = \\cos x\\,dx' },
          { text: 'Integra: la de la izquierda es la arcotangente.', math: '\\arctan y = \\sin x + C' },
          { text: 'Con $y(0) = 0$: $\\arctan 0 = 0 = 0 + C$, así que $C = 0$. Despeja con la tangente.', math: 'y = \\tan(\\sin x)' }
        ],
        answer: '$y = \\tan(\\sin x)$, definida para todo $x$ porque $\\sin x$ nunca llega a $\\pm\\pi/2$.',
        verify: { lab: 'call', mod: 'ode', fn: 'isSolution', math: true, args: [P_TAN, 'tan(sin(x))'], value: 1 }
      },
      {
        type: 'callout', heading: 'No pierdas las soluciones de equilibrio',
        diagram: 'c3s02-equilibrium', caption: 'Las curvas 1/(C − x) nunca tocan y = 0, pero y = 0 también sigue el campo.',
        body: [
          'Al dividir entre $h(y)$ supones que no es cero. Las raíces de $h(y) = 0$ dan soluciones constantes que la fórmula a veces no incluye. En $y\' = y^2$ la familia es $y = \\dfrac{1}{C - x}$, y ningún valor de $C$ da la solución $y = 0$, que también cumple la ecuación. Si el PVI pide $y(x_0) = 0$, la respuesta es justo esa: $y = 0$.'
        ]
      },
      {
        type: 'concept', heading: 'Crecimiento y decaimiento exponencial', short: 'Decaimiento',
        body: [
          'Cuando una cantidad cambia a un ritmo proporcional a sí misma, $N\' = kN$. Separando: $\\dfrac{dN}{N} = k\\,dt$, $\\ln|N| = kt + C$, y con $N(0) = N_0$: $$N(t) = N_0\\,e^{kt}$$',
          'Con $k > 0$ crece (bacterias, interés continuo); con $k < 0$ decae (radiactividad, medicamento en la sangre). En el decaimiento se suele escribir $N\' = -kN$ con $k > 0$, y la <strong>vida media</strong> es el tiempo en que queda la mitad: $$N_0 e^{-kT} = \\tfrac{1}{2}N_0 \\;\\Longrightarrow\\; T = \\frac{\\ln 2}{k}$$'
        ]
      },
      {
        type: 'explainer', heading: 'La vida media no depende de cuánto tengas', short: 'Vida media',
        title: 'Decaimiento $N = N_0e^{-kt}$ con distintas $k$',
        intro: 'Mueve la constante de decaimiento y fíjate en la marca de la vida media.',
        diagram: 'c3s02-decay',
        steps: [
          { text: 'Con $k = 0.35$ por año la cantidad baja a la mitad en $T = \\ln 2/0.35 \\approx 1.98$ años, y a la cuarta parte en otros $1.98$.', state: { k: 0.35 } },
          { text: 'Con $k$ más chica decae más lento: la vida media crece en proporción inversa a $k$.', state: { k: 0.18 } },
          { text: 'Con $k$ grande la caída es rápida. Siempre, cada vida media se pierde la <strong>mitad de lo que queda</strong>, no una cantidad fija.', state: { k: 0.7 } }
        ]
      },
      {
        type: 'example', heading: 'Datación con carbono 14',
        problem: '<p>El carbono 14 tiene vida media de 5730 años. Un hueso conserva 30 % del C-14 que tenía al morir el animal. ¿Hace cuánto murió?</p>',
        steps: [
          { text: 'De la vida media sale $k$.', math: 'k = \\frac{\\ln 2}{5730} \\approx ' + c14.k.toExponential(3).replace('e-', '\\times 10^{-') + '}\\ \\text{1/año}' },
          { text: 'Plantea $N = 0.30\\,N_0$ y cancela $N_0$.', math: '0.30 = e^{-kt} \\;\\Longrightarrow\\; t = \\frac{\\ln(1/0.30)}{k}' },
          { text: 'Sustituye.', math: 't = \\frac{\\ln(3.33)\\cdot 5730}{\\ln 2} \\approx ' + fx(c14.age, 0) + '\\ \\text{años}' }
        ],
        answer: 'Unos ' + fx(c14.age, 0) + ' años. No hace falta saber cuánto carbono había: solo la fracción que queda.',
        verify: { lab: 'call', mod: 'ode', fn: 'solveAt', math: true, args: [{ iv: 't', order: 1, rhs: '-k*y', params: { k: c14.k }, x0: 0, ics: [1], domain: [0, 12000] }, c14.age], value: 0.3 }
      },
      {
        type: 'concept', heading: 'La ley de enfriamiento de Newton', short: 'Enfriamiento',
        body: [
          'Un objeto a temperatura $T$ en un cuarto a $T_a$ se enfría (o se calienta) a un ritmo proporcional a la diferencia: $$\\frac{dT}{dt} = -k\\,(T - T_a), \\qquad k > 0$$',
          'Es separable: $\\dfrac{dT}{T - T_a} = -k\\,dt$, así que $\\ln|T - T_a| = -kt + C$ y $$T(t) = T_a + (T_0 - T_a)\\,e^{-kt}$$ La diferencia con el cuarto decae exponencialmente: el café nunca queda <em>más frío</em> que el cuarto y el refresco nunca queda más caliente.'
        ],
        diagram: 'c3s02-cooling',
        caption: 'Las dos curvas se acercan a la temperatura del cuarto; ninguna la cruza.'
      },
      {
        type: 'example', heading: '¿Cuándo se puede tomar el café?',
        problem: '<p>Un café sale a 90 °C en un cuarto a 22 °C. A los 5 minutos está a 70 °C. ¿En cuánto tiempo llega a 40 °C?</p>',
        steps: [
          { text: 'La solución es $T = 22 + 68e^{-kt}$. Con el dato de los 5 minutos sale $k$.', math: '70 = 22 + 68e^{-5k} \\;\\Rightarrow\\; e^{-5k} = \\frac{48}{68} \\;\\Rightarrow\\; k = \\frac{1}{5}\\ln\\frac{68}{48} \\approx ' + fx(cafe.k, 4) + '\\ \\text{1/min}' },
          { text: 'Ahora pide $T = 40$.', math: '40 = 22 + 68e^{-kt} \\;\\Rightarrow\\; t = \\frac{1}{k}\\ln\\frac{68}{18} \\approx ' + fx(cafe.t40, 1) + '\\ \\text{min}' }
        ],
        answer: 'Unos ' + fx(cafe.t40, 1) + ' minutos. Fíjate que primero se usa un dato para encontrar $k$ y luego se responde la pregunta.',
        verify: { lab: 'call', mod: 'ode', fn: 'solveAt', math: true, args: [{ iv: 't', order: 1, rhs: '-k*(y - 22)', params: { k: cafe.k }, x0: 0, ics: [90], domain: [0, 40] }, cafe.t40], value: 40 }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: '¿Se vale «multiplicar por $dx$»?', a: 'Es una forma corta de escribir la regla de la cadena. Si $\\int \\frac{1}{h(y)}\\frac{dy}{dx}\\,dx = \\int g(x)\\,dx$, el cambio de variable convierte la izquierda en $\\int \\frac{dy}{h(y)}$. Por eso funciona.' },
          { q: '¿Por qué una sola constante y no una en cada lado?', a: 'Porque $C_1$ y $C_2$ se juntan: $F(y) + C_1 = G(x) + C_2$ es lo mismo que $F(y) = G(x) + C$ con $C = C_2 - C_1$.' },
          { q: '¿Qué pasa con el valor absoluto de $\\ln|y|$?', a: 'Al despejar sale $y = \\pm e^{C}e^{G(x)}$. El $\\pm e^{C}$ es una constante cualquiera distinta de cero; llámala $A$. Si además $y = 0$ es solución de equilibrio, $A = 0$ también vale. Así queda $y = Ae^{G(x)}$ con cualquier $A$.' },
          { q: '¿Siempre se puede despejar $y$?', a: 'No. A veces la solución queda implícita, como $y^3 + y = x^2 + C$. Sigue siendo una respuesta válida. En el lab necesitas una $y(x)$ explícita, así que sus problemas sí se despejan.' },
          { q: '¿El $k$ del enfriamiento lleva unidades?', a: 'Sí: 1/tiempo. Si $t$ está en minutos, $k$ está en 1/min. Para que $kt$ no tenga unidades (está dentro de una exponencial), las unidades de $k$ y $t$ deben ir de acuerdo.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          'Separable: $y\' = g(x)\\,h(y)$. Separa $\\frac{dy}{h(y)} = g(x)\\,dx$ e integra cada lado con una sola constante.',
          'Antes de dividir, anota las soluciones de equilibrio $h(y) = 0$.',
          '$N\' = kN$ da $N = N_0e^{kt}$; la vida media es $T = \\ln 2/k$.',
          'Enfriamiento de Newton: $T = T_a + (T_0 - T_a)e^{-kt}$.'
        ]
      }
    ],

    lab: {
      type: 'ode-compare', title: 'Separa y comprueba',
      intro: 'Escribe tu solución del PVI y el lab la sustituye en la ecuación. En el decaimiento y el enfriamiento, mueve los deslizadores: si escribiste tu respuesta con las letras ($k$, $T_a$, $T_0$), sigue coincidiendo con la numérica; si pusiste números fijos, se separa. El lab detecta la constante mal despejada y la rama equivocada de la raíz.',
      cfg: { start: 1, problems: [P_DECAY, P_COOL, P_GAUSS, P_ROOT, P_TAN] }
    },

    formulas: [
      { label: 'Separable', tex: '\\frac{dy}{dx} = g(x)\\,h(y) \\;\\Rightarrow\\; \\int \\frac{dy}{h(y)} = \\int g(x)\\,dx' },
      { label: 'Crecimiento o decaimiento', tex: "N' = kN \\;\\Rightarrow\\; N = N_0e^{kt}" },
      { label: 'Vida media', tex: 'T_{1/2} = \\frac{\\ln 2}{k}' },
      { label: 'Enfriamiento de Newton', tex: 'T = T_a + (T_0 - T_a)\\,e^{-kt}' }
    ],

    exercises: [
      {
        id: 'c3-s02-separable', title: '¿Es separable?',
        vars: { k: [0, 4, 1] },
        prompt: function (v) {
          var eqs = ["y' = x^2 y^3", "y' = e^{2x - y}", "y' = x + y", "y' = \\sin(xy)", "y' = \\dfrac{x^2 + 1}{y}"];
          return '<p>¿La ecuación $' + eqs[v.k] + '$ es de variables separables?</p>';
        },
        check: 'choice',
        options: function (v) {
          var sep = v.k === 0 || v.k === 1 || v.k === 4;
          var why = ['', '', 'Una suma $x + y$ no se escribe como $g(x)\\,h(y)$.', '$\\sin(xy)$ no se separa en un producto de una función de $x$ por una de $y$.', ''][v.k];
          return [
            { text: 'Sí', correct: sep, say: sep ? null : why },
            { text: 'No', correct: !sep, say: sep ? (v.k === 1 ? 'Sí se separa: $e^{2x - y} = e^{2x}e^{-y}$.' : 'Sí se separa: el lado derecho ya es un producto de algo de $x$ por algo de $y$.') : null }
          ];
        },
        answer: function (v) { return v.k === 0 || v.k === 1 || v.k === 4 ? 'Sí' : 'No'; },
        hint: '¿Puedes escribir el lado derecho como (algo solo de $x$) × (algo solo de $y$)?',
        solution: function (v) { return ['Sí: $g = x^2$, $h = y^3$.', 'Sí: $e^{2x - y} = e^{2x}\\,e^{-y}$.', 'No: $x + y$ es una suma.', 'No: $\\sin(xy)$ no se factoriza así.', 'Sí: $g = x^2 + 1$, $h = 1/y$.'][v.k]; }
      },
      {
        id: 'c3-s02-gauss', title: 'PVI separable',
        vars: { a: [1, 6, 1], b: [-5, 5, 1] },
        where: function (v) { return v.b !== 0 && v.b !== 1 && v.a !== 2; },
        prompt: function (v) { return '<p>Resuelve el PVI $y\' = ' + v.a + 'x\\,y$, con $y(0) = ' + v.b + '$. Escribe $y(x)$.</p>'; },
        check: 'expr', domain: [-1, 1],
        answer: function (v) { return v.b + '*e^(' + (v.a / 2) + '*x^2)'; },
        mistakes: {
          noHalf: function (v) { return v.b + '*e^(' + v.a + '*x^2)'; },
          plusC: function (v) { return 'e^(' + (v.a / 2) + '*x^2) + ' + (v.b - 1); },
          noSquare: function (v) { return v.b + '*e^(' + v.a + '*x)'; }
        },
        feedback: [
          { when: 'noHalf', say: function (v) { return '$\\int ' + v.a + 'x\\,dx = \\tfrac{' + v.a + '}{2}x^2$: falta dividir entre 2.'; } },
          { when: 'plusC', say: 'La constante no se suma afuera: de $\\ln|y| = G(x) + C$ sale $y = Ae^{G(x)}$, que multiplica.' },
          { when: 'noSquare', say: 'Integraste $x$ como si fuera 1: $\\int x\\,dx = x^2/2$.' }
        ],
        hint: 'Separa $\\frac{dy}{y} = ax\\,dx$, integra y despeja con la exponencial.',
        solution: function (v) {
          var h = v.a % 2 === 0 ? String(v.a / 2) : '\\tfrac{' + v.a + '}{2}';
          return '$$\\frac{dy}{y} = ' + v.a + 'x\\,dx \\;\\Rightarrow\\; \\ln|y| = ' + h + 'x^2 + C \\;\\Rightarrow\\; y = Ae^{' + h + 'x^2}$$ Con $y(0) = A = ' + v.b + '$: $$y = ' + v.b + 'e^{' + h + 'x^2}$$';
        }
      },
      {
        id: 'c3-s02-raiz', title: 'Solución con raíz',
        vars: { c: [1, 6, 1], s: [0, 1, 1] },
        prompt: function (v) { var y0 = v.s ? -v.c : v.c; return '<p>Resuelve $y\' = \\dfrac{x}{y}$ con $y(0) = ' + y0 + '$. Escribe $y(x)$ explícita.</p>'; },
        check: 'expr', domain: [-2, 2],
        answer: function (v) { return (v.s ? '-' : '') + 'sqrt(x^2 + ' + (v.c * v.c) + ')'; },
        mistakes: {
          branch: function (v) { return (v.s ? '' : '-') + 'sqrt(x^2 + ' + (v.c * v.c) + ')'; },
          noSquare: function (v) { return (v.s ? '-' : '') + 'sqrt(x^2 + ' + (v.c + 3) + ')'; },
          split: function (v) { return (v.s ? '-' : '') + '(sqrt(x^2) + ' + v.c + ')'; }
        },
        where: function (v) { return v.c * v.c !== v.c + 3; },
        feedback: [
          { when: 'branch', say: 'Elegiste el signo equivocado de la raíz: la condición inicial dice si $y$ es positiva o negativa.' },
          { when: 'noSquare', say: function (v) { return 'La constante sale de $y^2 = x^2 + K$ con $K = y(0)^2 = ' + (v.c * v.c) + '$.'; } },
          { when: 'split', say: 'La raíz de una suma no es la suma de las raíces: $\\sqrt{x^2 + K} \\neq |x| + \\sqrt{K}$.' }
        ],
        hint: 'Separa $y\\,dy = x\\,dx$, integra y usa la condición para la constante antes de sacar raíz.',
        solution: function (v) { return '$$y\\,dy = x\\,dx \\;\\Rightarrow\\; y^2 = x^2 + K, \\quad K = ' + (v.c * v.c) + '$$ Como $y(0) ' + (v.s ? '< 0' : '> 0') + '$: $$y = ' + (v.s ? '-' : '') + '\\sqrt{x^2 + ' + (v.c * v.c) + '}$$'; }
      },
      {
        id: 'c3-s02-vida', title: 'Vida media',
        vars: { T: [2, 40, 1], p: [10, 80, 5] },
        prompt: function (v) { return '<p>Un isótopo tiene vida media de ' + v.T + ' días. ¿Cuántos días pasan hasta que queda el ' + v.p + ' % de la muestra original?</p>'; },
        check: 'numeric', unit: 'días',
        answer: function (v) { return v.T * Math.log(100 / v.p) / Math.log(2); },
        mistakes: {
          linear: function (v) { return v.T * (100 - v.p) / 50; },
          log10: function (v) { return v.T * Math.log10(100 / v.p) / Math.log(2); },
          inverse: function (v) { return v.T * Math.log(2) / Math.log(100 / v.p); }
        },
        where: function (v) { return v.p !== 50; },
        feedback: [
          { when: 'linear', say: 'El decaimiento no es lineal: no se pierde la misma cantidad cada día, sino la misma fracción.' },
          { when: 'log10', say: 'Usa logaritmo natural en los dos lados: $k = \\ln 2/T$ y $t = \\ln(N_0/N)/k$.' },
          { when: 'inverse', say: 'Volteaste el cociente: $t = T\\,\\dfrac{\\ln(N_0/N)}{\\ln 2}$.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          // Bisección sobre N(t) = 100·(1/2)^(t/T), sin despejar con logaritmos.
          var a = 0, b = 10 * v.T;
          for (var i = 0; i < 80; i++) { var m = (a + b) / 2; if (100 * Math.pow(0.5, m / v.T) > v.p) a = m; else b = m; }
          return (a + b) / 2;
        } },
        hint: 'Primero $k = \\ln 2/T$. Luego resuelve $\\frac{p}{100} = e^{-kt}$ para $t$.',
        solution: function (v) { var t = v.T * Math.log(100 / v.p) / Math.log(2); return '$$k = \\frac{\\ln 2}{' + v.T + '}, \\qquad t = \\frac{\\ln(100/' + v.p + ')}{k} = ' + v.T + '\\,\\frac{\\ln(' + fx(100 / v.p, 3) + ')}{\\ln 2} \\approx ' + fx(t) + '\\ \\text{días}$$'; }
      },
      {
        id: 'c3-s02-newton', title: 'Enfriamiento: ¿cuánto tarda?',
        vars: { T0: [70, 95, 5], Ta: [15, 25, 1], d: [6, 20, 2], m: [3, 8, 1], Tf: [30, 45, 5] },
        where: function (v) { return v.T0 - v.d > v.Tf + 5 && v.Tf > v.Ta + 3; },
        prompt: function (v) { return '<p>Una sopa sale a ' + v.T0 + ' °C en un cuarto a ' + v.Ta + ' °C. A los ' + v.m + ' minutos está a ' + (v.T0 - v.d) + ' °C. Con la ley de enfriamiento de Newton, ¿en cuántos minutos (desde que salió) llega a ' + v.Tf + ' °C?</p>'; },
        check: 'numeric', unit: 'min',
        answer: function (v) { var k = Math.log((v.T0 - v.Ta) / (v.T0 - v.d - v.Ta)) / v.m; return Math.log((v.T0 - v.Ta) / (v.Tf - v.Ta)) / k; },
        mistakes: {
          noAmbient: function (v) { var k = Math.log(v.T0 / (v.T0 - v.d)) / v.m; return Math.log(v.T0 / v.Tf) / k; },
          linear: function (v) { return v.m * (v.T0 - v.Tf) / v.d; }
        },
        feedback: [
          { when: 'noAmbient', say: 'Olvidaste restar la temperatura del cuarto: lo que decae es $T - T_a$, no $T$.' },
          { when: 'linear', say: 'No baja a ritmo constante: se enfría más lento conforme se acerca a la temperatura del cuarto.' }
        ],
        oracle: { lab: 'value', value: function (v) {
          // Bisección sobre T(t) con la fracción que queda en m minutos: (T − Ta) se multiplica por q cada m minutos.
          var q = (v.T0 - v.d - v.Ta) / (v.T0 - v.Ta), a = 0, b = 400;
          for (var i = 0; i < 80; i++) { var mm = (a + b) / 2; if (v.Ta + (v.T0 - v.Ta) * Math.pow(q, mm / v.m) > v.Tf) a = mm; else b = mm; }
          return (a + b) / 2;
        } },
        hint: 'Usa $T = T_a + (T_0 - T_a)e^{-kt}$. El primer dato da $k$; luego despeja $t$.',
        solution: function (v) {
          var k = Math.log((v.T0 - v.Ta) / (v.T0 - v.d - v.Ta)) / v.m, t = Math.log((v.T0 - v.Ta) / (v.Tf - v.Ta)) / k;
          return '$$k = \\frac{1}{' + v.m + '}\\ln\\frac{' + (v.T0 - v.Ta) + '}{' + (v.T0 - v.d - v.Ta) + '} \\approx ' + fx(k, 4) + ', \\qquad t = \\frac{1}{k}\\ln\\frac{' + (v.T0 - v.Ta) + '}{' + (v.Tf - v.Ta) + '} \\approx ' + fx(t) + '\\ \\text{min}$$';
        }
      },
      {
        id: 'c3-s02-equilibrio', title: 'La solución que se pierde',
        vars: { c: [1, 5, 1] },
        prompt: function (v) { return '<p>Al resolver $y\' = x\\,(y - ' + v.c + ')^2$ dividiendo entre $(y - ' + v.c + ')^2$ sale la familia $y = ' + v.c + ' - \\dfrac{2}{x^2 + C}$. ¿Qué solución del PVI con $y(1) = ' + v.c + '$ es la correcta?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: '$y = ' + v.c + '$ (constante)', correct: true },
            { text: 'No tiene solución', say: 'Sí tiene: $y = ' + v.c + '$ cumple la ecuación ($y\' = 0$ y el lado derecho también es 0) y la condición inicial.' },
            { text: '$y = ' + v.c + ' - \\dfrac{2}{x^2 - 1}$', say: 'Esa no está definida en $x = 1$, y ninguna $C$ de la familia da $y(1) = ' + v.c + '$.' },
            { text: '$y = ' + v.c + ' - \\dfrac{2}{x^2}$', say: 'En $x = 1$ vale $' + (v.c - 2) + '$, no $' + v.c + '$.' }
          ];
        },
        answer: function (v) { return '$y = ' + v.c + '$ (constante)'; },
        hint: 'Mira qué pasa con el lado derecho cuando $y = c$.',
        solution: function (v) { return 'Al dividir entre $(y - ' + v.c + ')^2$ se pierde la solución de equilibrio $y = ' + v.c + '$, que es justo la que cumple $y(1) = ' + v.c + '$.'; }
      }
    ],

    quiz: { tags: ['c3.S02'], count: 8 },

    errors: [
      'Poner una constante en cada lado o sumarla después de despejar: de $\\ln|y| = G + C$ sale $y = Ae^{G}$, no $e^{G} + C$.',
      'Dividir entre $h(y)$ y perder las soluciones de equilibrio.',
      'Olvidar el $\\pm$ al sacar raíz y quedarse con la rama que no cumple la condición inicial.',
      'Separar una suma: $y\' = x + y$ no es separable.',
      'En enfriamiento, aplicar el decaimiento a $T$ en lugar de a $T - T_a$.',
      'Tratar el decaimiento como lineal (la misma cantidad por unidad de tiempo).'
    ],

    teacher: {
      plan: [
        'Arranca con la ropa separada por colores y la receta en el pizarrón.',
        'Ejemplos 1 y 2 a mano; en el 2, que alguien proponga la rama negativa y la descarten con la condición inicial.',
        'Callout de soluciones de equilibrio con $y\' = y^2$.',
        'Lab: enfriamiento con los deslizadores. Que primero escriban la respuesta con números y luego con letras, y vean la diferencia.'
      ],
      check: [
        'Que escriban las soluciones de equilibrio antes de dividir.',
        'Que comprueben derivando su respuesta.'
      ],
      note: 'El crecimiento logístico se resuelve aquí con fracciones parciales en un ejemplo del banco y con Bernoulli en la sesión 5. La mezcla en tanques queda para la sesión 4 (lineales).'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 2</em>, §4.3 “Separable Equations”. <a href="https://openstax.org/books/calculus-volume-2/pages/4-3-separable-equations">openstax.org</a> (CC BY-NC-SA 4.0).',
      'MIT OpenCourseWare. <em>18.03SC Differential Equations</em> (Fall 2011), Unit I, “Separable Equations” y “Exponential Growth and Decay”. <a href="https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/">ocw.mit.edu</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-01',
    next: 'sesion-03'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
