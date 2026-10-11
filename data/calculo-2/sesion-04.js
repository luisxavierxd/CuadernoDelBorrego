/* =====================================================================
   Cálculo 2 · S04 · Derivadas parciales, incluidas las de orden superior
   (bloque A · Espacio y derivada parcial).
   Fuente: OpenStax, Calculus Volume 3, §4.3 (y la idea de límite de §4.2), CC BY-NC-SA 4.0.
   Las cuentas se hacen aquí a mano (fórmulas propias) y scripts/examples.test.js las
   compara contra LabMath.partial (lab partial-slice), que deriva con math.js; los
   ejercicios numéricos usan diferencias finitas como oráculo.
   ===================================================================== */
(function () {
  function fx(v, d) { return Number((+v).toFixed(d == null ? 2 : d)).toString(); }
  // Término c·x^p·y^q en LaTeX (c entero distinto de 0) y en texto para math.js.
  function pw(name, p) { return p === 0 ? '' : p === 1 ? name : name + '^{' + p + '}'; }
  function tex(c, p, q) {
    var body = pw('x', p) + pw('y', q);
    if (!body) return String(c);
    return (c === 1 ? '' : c === -1 ? '-' : String(c)) + body;
  }
  function src(c, p, q) { return c + (p ? '*x^' + p : '') + (q ? '*y^' + q : ''); }
  // Une términos de LaTeX con sus signos: ['3x', '-2y', '5'] → 3x - 2y + 5
  function sum(terms) {
    return terms.filter(function (t) { return t && t !== '0'; }).map(function (t, i) {
      t = String(t);
      if (i === 0) return t;
      return t.charAt(0) === '-' ? ' - ' + t.slice(1) : ' + ' + t;
    }).join('') || '0';
  }

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

  // Ejemplo 4: gas ideal
  var gas = { n: 2, R: 8.31, T: 300, V: 0.05 };
  gas.P = gas.n * gas.R * gas.T / gas.V;
  gas.PT = gas.n * gas.R / gas.V;
  gas.PV = -gas.n * gas.R * gas.T / (gas.V * gas.V);
  // Ejemplo 5: Clairaut con f = x³y² + x·e^y en (2, 1)
  var cl = 6 * 4 * 1 + Math.E;

  var data = window.SESSION_DATA = {
    slug: 'sesion-04', number: '04', group: 'A · Espacio y derivada parcial',
    title: 'Derivadas parciales, incluidas las de orden superior', temario: [],
    minutes: 150,
    quote: 'Una derivada parcial es la derivada de siempre, pero caminando en una sola dirección: todo lo demás se queda quieto.',
    badges: [
      'Ver $\\partial f/\\partial x$ como la pendiente de la curva que deja un corte $y = b$ en la superficie.',
      'Calcular parciales tratando las demás variables como constantes, también con tres variables.',
      'Interpretar una parcial como razón de cambio, con sus unidades.',
      'Calcular $f_{xx}$, $f_{yy}$, $f_{xy}$ y $f_{yx}$, y usar el teorema de Clairaut.'
    ],

    lesson: [
      {
        type: 'warmup', heading: 'Antes de empezar', short: 'Antes de empezar',
        idea: 'Para derivar $f(x, y)$ respecto a $x$, <strong>congela $y$</strong>: trátala como un número fijo y deriva con las reglas de Cálculo 1.',
        recall: [
          'Las <a href="../../../calculo-1/sesiones/sesion-02/">fórmulas directas de derivación</a> (Cálculo 1, S02): potencia, exponencial, logaritmo y trigonométricas.',
          'La <a href="../../../calculo-1/sesiones/sesion-03/">regla del producto</a> (Cálculo 1, S03) y la <a href="../../../calculo-1/sesiones/sesion-05/">regla de la cadena</a> (Cálculo 1, S05).',
          'Superficies $z = f(x, y)$ y sus cortes (S01 de este curso).'
        ],
        why: 'Casi todo depende de varias cosas a la vez: la temperatura de una placa depende de dónde estés, la presión de un gas de su temperatura y su volumen. La parcial responde «¿qué pasa si muevo solo una?», que es justo lo que se mide en un laboratorio.'
      },
      {
        type: 'concept', heading: 'Imagínalo así', short: 'Imagínalo así',
        body: [
          'Estás parado en la ladera de un cerro. Si caminas hacia el este, tal vez subes; si caminas hacia el norte, tal vez bajas. La «inclinación» del cerro depende de <strong>hacia dónde</strong> camines. Con una sola variable solo había una dirección; aquí hay muchas.',
          'La derivada parcial respecto a $x$ es la inclinación cuando caminas <em>solo</em> hacia el este (la $x$ cambia y la $y$ se queda igual). La parcial respecto a $y$ es la inclinación cuando caminas <em>solo</em> hacia el norte.',
          'Lo mismo en una regadera: la temperatura del agua depende de cuánto abres la llave caliente y cuánto la fría. Si giras solo la caliente, ¿qué tan rápido cambia la temperatura? Eso es una derivada parcial: mueves una perilla y dejas la otra quieta.'
        ]
      },
      {
        type: 'concept', heading: 'Cortar la superficie', short: 'Cortar la superficie',
        body: [
          'La gráfica de $z = f(x, y)$ es una superficie. Si la cortas con el plano vertical $y = b$, el corte es una curva: la <strong>traza</strong> $z = f(x, b)$. Esa curva ya depende de una sola variable, $x$, así que tiene pendiente como en Cálculo 1.',
          'Esa pendiente, en $x = a$, es la <strong>derivada parcial de $f$ respecto a $x$</strong> en $(a, b)$. Si en lugar de eso cortas con $x = a$, la traza es $z = f(a, y)$ y su pendiente en $y = b$ es la parcial respecto a $y$.',
          'Mira el corte paso a paso abajo. En el lab puedes mover el punto y cambiar la dirección del corte.'
        ]
      },
      {
        type: 'explainer', heading: 'Del corte a la pendiente', short: 'Del corte a la pendiente',
        title: 'Una colina $z = f(x, y)$ cortada por un plano',
        intro: 'Cada paso agrega una pieza: el plano de corte, la curva que deja y su recta tangente.',
        diagram: 'c2s04-slice',
        steps: [
          { text: 'La superficie $z = f(x, y)$ y el punto $(a, b)$ en el piso. Justo arriba está el punto de la superficie, a la altura $f(a, b)$.', state: { dir: 'x', plane: 0, trace: 0, tan: 0 } },
          { text: 'Corta con el plano vertical $y = b$: son todos los puntos donde $y$ vale $b$. La $y$ queda <strong>congelada</strong>.', state: { dir: 'x', plane: 1, trace: 0, tan: 0 } },
          { text: 'El corte deja una curva, la traza $z = f(x, b)$. Ya es una función de una sola variable: $x$.', state: { dir: 'x', plane: 1, trace: 1, tan: 0 } },
          { text: 'Su recta tangente en $x = a$ tiene pendiente $\\dfrac{\\partial f}{\\partial x}(a, b)$: cuánto sube $z$ por cada unidad que avanzas en $x$.', state: { dir: 'x', plane: 1, trace: 1, tan: 1 } },
          { text: 'Si cortas con $x = a$, la traza es $z = f(a, y)$ y la pendiente de su tangente es $\\dfrac{\\partial f}{\\partial y}(a, b)$. Mismo punto, otra dirección, otra pendiente.', state: { dir: 'y', plane: 1, trace: 1, tan: 1 } }
        ]
      },
      {
        type: 'concept', heading: 'La definición y las notaciones', short: 'Definición y notaciones',
        body: [
          'La pendiente de la traza se define igual que en Cálculo 1, con un límite. Solo se mueve la variable de la parcial: $$f_x(a, b) = \\lim_{h \\to 0} \\frac{f(a + h,\\, b) - f(a, b)}{h} \\qquad f_y(a, b) = \\lim_{h \\to 0} \\frac{f(a,\\, b + h) - f(a, b)}{h}$$',
          'Fíjate que en el primer límite la $b$ nunca cambia. Por eso la regla práctica es <strong>tratar a $y$ como constante</strong> y derivar respecto a $x$ con las reglas de siempre.',
          'Se escribe con una $\\partial$ («d curva» o «parcial») en lugar de $d$, para recordar que hay más variables que se quedaron fijas. Todas estas notaciones dicen lo mismo:'
        ],
        list: [
          '$\\dfrac{\\partial f}{\\partial x}$, $\\;f_x$, $\\;\\dfrac{\\partial z}{\\partial x}$, $\\;z_x$: derivada respecto a $x$ con $y$ fija.',
          '$\\dfrac{\\partial f}{\\partial y}$, $\\;f_y$, $\\;\\dfrac{\\partial z}{\\partial y}$, $\\;z_y$: derivada respecto a $y$ con $x$ fija.',
          '$f_x(a, b)$ es un <strong>número</strong> (la pendiente en un punto); $f_x(x, y)$ es una <strong>función</strong> (la pendiente en cualquier punto).'
        ]
      },
      {
        type: 'callout', heading: 'Las demás letras son números',
        body: [
          'Al derivar respecto a $x$, la $y$ se comporta como un $5$ o un $\\pi$: si suma, su derivada es 0; si multiplica, sale como constante. Por ejemplo, $\\dfrac{\\partial}{\\partial x}\\big(x^2y\\big) = 2x\\cdot y$, igual que $\\dfrac{d}{dx}\\big(5x^2\\big) = 10x$. <strong>No</strong> lleva regla del producto: solo uno de los factores cambia.',
          'Las reglas son las mismas de Cálculo 1. Si necesitas repasarlas: <a href="../../../calculo-1/sesiones/sesion-02/">fórmulas directas</a>, <a href="../../../calculo-1/sesiones/sesion-03/">regla del producto</a> (cuando los dos factores tienen la variable) y <a href="../../../calculo-1/sesiones/sesion-05/">regla de la cadena</a> (cuando la variable está dentro de otra función, como en $\\sin(x^2y)$).'
        ]
      },
      {
        type: 'recipe', heading: 'Receta: derivada parcial', short: 'Receta',
        steps: [
          { text: 'Identifica respecto a qué variable derivas. Las demás, enciérralas mentalmente: son constantes.' },
          { text: 'Términos que no tienen esa variable: su derivada es 0.', tip: 'En $\\partial/\\partial x$ de $x^3 + 4y^2$, el $4y^2$ desaparece completo: no es $8y$.' },
          { text: 'Términos donde la variable va multiplicada por algo constante ($5x^2y^3$): saca la constante y deriva solo la parte con la variable: $10x\\,y^3$.', tip: 'No uses regla del producto si uno de los factores no tiene la variable. $\\partial_x(x^2y)$ es $2xy$, no $2xy + x^2$.' },
          { text: 'Si la variable está dentro de otra función ($e^{xy}$, $\\sin(x^2y)$), usa la regla de la cadena: multiplica por la parcial de lo de adentro.', tip: '$\\partial_x\\, e^{xy} = e^{xy}\\cdot y$. El factor $y$ es la derivada de $xy$ respecto a $x$; es el que más se olvida.' },
          { text: 'Si te dan un punto, sustitúyelo <strong>al final</strong>, ya derivado.' }
        ]
      },
      {
        type: 'example', heading: 'Un polinomio en x y y',
        problem: '<p>Si $f(x, y) = x^3y^2 + 4xy - 5y$, encuentra $f_x$ y $f_y$, y evalúalas en $(1, 2)$.</p>',
        steps: [
          { text: 'Para $f_x$, la $y$ es constante: $y^2$ y $4y$ salen como coeficientes y $-5y$ no tiene $x$.', math: 'f_x = 3x^2y^2 + 4y' },
          { text: 'Para $f_y$, la $x$ es constante: $x^3$ y $4x$ salen como coeficientes.', math: 'f_y = 2x^3y + 4x - 5' },
          { text: 'Evalúa en $(1, 2)$.', math: 'f_x(1, 2) = 3(1)(4) + 4(2) = 20 \\qquad f_y(1, 2) = 2(1)(2) + 4(1) - 5 = 3' }
        ],
        answer: '$f_x = 3x^2y^2 + 4y$ y $f_y = 2x^3y + 4x - 5$; en $(1, 2)$ valen $20$ y $3$. Hacia $+x$ la superficie sube mucho más rápido que hacia $+y$.',
        verify: { lab: 'call', mod: 'partial', fn: 'partials', math: true, args: ['x^3*y^2 + 4x*y - 5y', { x: 1, y: 2 }], values: { x: 20, y: 3 } }
      },
      {
        type: 'example', heading: 'Con regla de la cadena',
        problem: '<p>Si $f(x, y) = \\sin(x^2y)$, encuentra $f_x$ y $f_y$ en $(1, \\pi)$.</p>',
        steps: [
          { text: 'Afuera está el seno; adentro, $u = x^2y$. La derivada del seno es el coseno, por la derivada de adentro.', math: 'f_x = \\cos(x^2y)\\cdot\\frac{\\partial}{\\partial x}(x^2y) = 2xy\\cos(x^2y)' },
          { text: 'Respecto a $y$, lo de adentro deriva a $x^2$.', math: 'f_y = \\cos(x^2y)\\cdot x^2 = x^2\\cos(x^2y)' },
          { text: 'En $(1, \\pi)$: $x^2y = \\pi$ y $\\cos\\pi = -1$.', math: 'f_x(1, \\pi) = 2\\pi(-1) = -2\\pi \\approx ' + fx(-2 * Math.PI) + ' \\qquad f_y(1, \\pi) = (1)(-1) = -1' }
        ],
        answer: '$f_x(1, \\pi) = -2\\pi \\approx ' + fx(-2 * Math.PI) + '$ y $f_y(1, \\pi) = -1$. Si olvidas la derivada de adentro, te sale $\\cos(x^2y) = -1$ en las dos: el lab te avisa.',
        verify: { lab: 'call', mod: 'partial', fn: 'partials', math: true, args: ['sin(x^2*y)', { x: 1, y: Math.PI }], values: { x: -2 * Math.PI, y: -1 } }
      },
      {
        type: 'concept', heading: 'Tres variables o más', short: 'Tres variables',
        body: [
          'Con $w = f(x, y, z)$ no hay una superficie que dibujar, pero la idea no cambia: para $\\partial f/\\partial z$ se congelan $x$ y $y$, y solo cambia $z$. Hay una parcial por cada variable.',
          'Por ejemplo, la temperatura dentro de un cuarto depende de las tres coordenadas: $\\partial T/\\partial z$ dice qué tan rápido cambia al subir, sin moverte de lado.'
        ]
      },
      {
        type: 'example', heading: 'Una función de tres variables',
        problem: '<p>Si $f(x, y, z) = x^2yz^3 + 2xz - y$, encuentra $f_x$, $f_y$ y $f_z$ en $(2, 1, 1)$.</p>',
        steps: [
          { text: 'Respecto a $x$: $y$ y $z$ son constantes.', math: 'f_x = 2xyz^3 + 2z \\;\\Rightarrow\\; f_x(2, 1, 1) = 4 + 2 = 6' },
          { text: 'Respecto a $y$: el primer término es $(x^2z^3)\\,y$; el segundo no tiene $y$.', math: 'f_y = x^2z^3 - 1 \\;\\Rightarrow\\; f_y(2, 1, 1) = 4 - 1 = 3' },
          { text: 'Respecto a $z$: $x^2y$ y $2x$ salen como coeficientes.', math: 'f_z = 3x^2yz^2 + 2x \\;\\Rightarrow\\; f_z(2, 1, 1) = 12 + 4 = 16' }
        ],
        answer: '$f_x = 6$, $f_y = 3$ y $f_z = 16$ en $(2, 1, 1)$.',
        verify: { lab: 'call', mod: 'partial', fn: 'partials', math: true, args: ['x^2*y*z^3 + 2x*z - y', { x: 2, y: 1, z: 1 }], values: { x: 6, y: 3, z: 16 } }
      },
      {
        type: 'concept', heading: 'Razón de cambio, con unidades', short: 'Razón de cambio',
        body: [
          'Una parcial es una razón de cambio: cuánto cambia $f$ por cada unidad de una variable, con las demás fijas. Sus unidades son <strong>unidades de $f$ entre unidades de la variable</strong>.',
          'En la placa de la figura, $T(x, y) = 80 - x^2 - 3y^2$ en °C, con $x$ y $y$ en cm. En $P(2, 1)$: $T_x = -2x = -4$ °C/cm y $T_y = -6y = -6$ °C/cm. Si te mueves 1 mm hacia $+x$, la temperatura baja cerca de $0.4$ °C; hacia $+y$, cerca de $0.6$ °C.',
          'El signo dice si $f$ sube (positivo) o baja (negativo) al aumentar esa variable.'
        ],
        diagram: 'c2s04-plate',
        caption: 'Las isotermas (curvas de igual temperatura) son elipses. En $P$ la placa se enfría hacia $+x$ y más rápido hacia $+y$.'
      },
      {
        type: 'example', heading: 'Presión de un gas ideal',
        problem: '<p>Un gas ideal cumple $P = \\dfrac{nRT}{V}$. Con $n = 2$ mol, $R = 8.31$ J/(mol·K), $T = 300$ K y $V = 0.05$ m³, calcula $\\partial P/\\partial T$ y $\\partial P/\\partial V$ e interprétalas.</p>',
        steps: [
          { text: 'Con $V$ fijo, $P$ es una recta en $T$: la pendiente es $nR/V$.', math: '\\frac{\\partial P}{\\partial T} = \\frac{nR}{V} = \\frac{2(8.31)}{0.05} = ' + fx(gas.PT, 1) + '\\ \\text{Pa/K}' },
          { text: 'Con $T$ fija, $P = nRT\\cdot V^{-1}$: la potencia baja y aparece un signo menos.', math: '\\frac{\\partial P}{\\partial V} = -\\frac{nRT}{V^2} = -\\frac{2(8.31)(300)}{0.05^2} = ' + fx(gas.PV, 0) + '\\ \\text{Pa/m}^3' },
          { text: 'Interpreta: calentar 1 K a volumen fijo sube la presión unos $332$ Pa. Agrandar el recipiente 1 litro ($0.001$ m³) a temperatura fija la baja unos $' + fx(-gas.PV * 0.001, 0) + '$ Pa, casi $2$ kPa.' }
        ],
        answer: '$\\partial P/\\partial T = ' + fx(gas.PT, 1) + '$ Pa/K y $\\partial P/\\partial V \\approx ' + fx(gas.PV / 1e6, 2) + '\\times 10^{6}$ Pa/m³ (unos $-2$ kPa por litro).',
        verify: { lab: 'call', mod: 'partial', fn: 'partials', math: true, args: ['n*R*T/V', { n: gas.n, R: gas.R, T: gas.T, V: gas.V }], values: { T: gas.PT, V: gas.PV } }
      },
      {
        type: 'concept', heading: 'Derivadas de orden superior', short: 'Orden superior',
        body: [
          'Las parciales $f_x$ y $f_y$ también son funciones de $x$ y $y$, así que se pueden volver a derivar. Salen cuatro segundas derivadas:',
          '$$f_{xx} = \\frac{\\partial^2 f}{\\partial x^2} \\qquad f_{yy} = \\frac{\\partial^2 f}{\\partial y^2} \\qquad f_{xy} = (f_x)_y = \\frac{\\partial^2 f}{\\partial y\\,\\partial x} \\qquad f_{yx} = (f_y)_x = \\frac{\\partial^2 f}{\\partial x\\,\\partial y}$$',
          'Ojo con el orden: en $f_{xy}$ se deriva <strong>primero respecto a $x$</strong> (se lee de izquierda a derecha); en $\\frac{\\partial^2 f}{\\partial y\\,\\partial x}$ se lee de derecha a izquierda. Es la convención de OpenStax.',
          '<strong>Teorema de Clairaut:</strong> si $f_{xy}$ y $f_{yx}$ son continuas cerca del punto, son iguales: $f_{xy}(a, b) = f_{yx}(a, b)$. Con las funciones de este curso (polinomios, exponenciales, senos…) casi siempre se cumple, y sirve para revisar tus cuentas.'
        ],
        diagram: 'c2s04-tree',
        state: { hl: 1 },
        caption: 'Cada flecha es una derivada más. Las dos mixtas llegan por caminos distintos, pero dan lo mismo.'
      },
      {
        type: 'example', heading: 'Comprobar Clairaut',
        problem: '<p>Si $f(x, y) = x^3y^2 + x\\,e^{y}$, calcula $f_{xy}$ y $f_{yx}$ y evalúalas en $(2, 1)$.</p>',
        steps: [
          { text: 'Primero respecto a $x$, luego respecto a $y$.', math: 'f_x = 3x^2y^2 + e^{y} \\;\\Rightarrow\\; f_{xy} = 6x^2y + e^{y}' },
          { text: 'Ahora al revés: primero $y$, luego $x$.', math: 'f_y = 2x^3y + x\\,e^{y} \\;\\Rightarrow\\; f_{yx} = 6x^2y + e^{y}' },
          { text: 'Salen iguales, como dice Clairaut. En $(2, 1)$:', math: 'f_{xy}(2, 1) = 6(4)(1) + e = 24 + e \\approx ' + fx(cl) }
        ],
        answer: '$f_{xy} = f_{yx} = 6x^2y + e^{y}$; en $(2, 1)$ valen $24 + e \\approx ' + fx(cl) + '$.',
        verify: { lab: 'call', mod: 'partial', fn: 'mixed', math: true, args: ['x^3*y^2 + x*e^y', { x: 2, y: 1 }], values: { xy: cl, yx: cl } }
      },
      {
        type: 'faq', heading: 'Dudas comunes', short: 'Dudas comunes',
        items: [
          { q: 'Si $y$ es constante, ¿por qué aparece en mi $f_x$?', a: 'Porque es una constante <em>que no conoces todavía</em>. En $\\partial_x(x^2y) = 2xy$, la $y$ se queda como el 5 se quedaría en $\\frac{d}{dx}(5x^2) = 10x$. Cuando te den el punto, la sustituyes.' },
          { q: '¿Cuándo sí uso la regla del producto?', a: 'Cuando <strong>los dos</strong> factores tienen la variable respecto a la que derivas. En $\\partial_x\\big(x\\,e^{xy}\\big)$ sí: $e^{xy} + x\\cdot y\\,e^{xy}$. En $\\partial_x\\big(x^2y\\big)$ no: $y$ es constante.' },
          { q: '¿Puedo sustituir $y = b$ antes de derivar respecto a $x$?', a: 'Sí: eso es exactamente la traza $f(x, b)$. Para $f_x(a, b)$ puedes sustituir $y = b$, derivar respecto a $x$ y evaluar en $a$. Lo que no puedes es sustituir $x = a$ antes de derivar respecto a $x$: la constante deriva a 0.' },
          { q: '¿$f_{xy}$ es «primero $x$» o «primero $y$»?', a: 'En subíndices, primero $x$: $f_{xy} = (f_x)_y$. Con Clairaut casi nunca importa, porque dan lo mismo; pero si un problema da $f_{xy} \\neq f_{yx}$, es que alguna no es continua en ese punto.' },
          { q: '¿Qué significa una parcial negativa?', a: 'Que $f$ baja cuando esa variable aumenta y las demás se quedan fijas. $\\partial P/\\partial V < 0$: si agrandas el recipiente a temperatura fija, la presión baja.' }
        ]
      },
      {
        type: 'recap', heading: 'Lo que te llevas', short: 'Resumen',
        points: [
          '$f_x(a, b)$ es la pendiente de la traza que deja el corte $y = b$; $f_y(a, b)$, la del corte $x = a$.',
          'Para derivar respecto a una variable, las demás son constantes: lo que no la tiene deriva a 0.',
          'La parcial es una razón de cambio: unidades de $f$ entre unidades de la variable.',
          'Las segundas parciales son cuatro; las mixtas $f_{xy}$ y $f_{yx}$ son iguales si son continuas (Clairaut).'
        ]
      }
    ],

    lab: {
      type: 'partial-slice', title: 'Corta la superficie',
      intro: 'Elige una superficie, el punto $(a, b)$ y la dirección del corte. Mira la traza y su tangente, y escribe tu $\\partial f/\\partial x$ (o $\\partial f/\\partial y$), o su valor en el punto. El lab detecta si derivaste respecto a la otra variable, si usaste regla del producto donde no va o si olvidaste la derivada de adentro.',
      cfg: { start: 2, dir: 'x' }
    },

    formulas: [
      { label: 'Definición', tex: 'f_x(a, b) = \\lim_{h \\to 0} \\frac{f(a + h, b) - f(a, b)}{h}' },
      { label: 'Regla práctica', tex: '\\frac{\\partial f}{\\partial x}:\\ y\\ \\text{constante}' },
      { label: 'Notaciones', tex: '\\frac{\\partial f}{\\partial x} = f_x = \\frac{\\partial z}{\\partial x} = z_x' },
      { label: 'Cadena (ejemplo)', tex: '\\frac{\\partial}{\\partial x}\\,e^{xy} = y\\,e^{xy}' },
      { label: 'Mixtas', tex: 'f_{xy} = (f_x)_y = \\frac{\\partial^2 f}{\\partial y\\,\\partial x}' },
      { label: 'Clairaut', tex: 'f_{xy} = f_{yx}\\ \\text{(si son continuas)}' }
    ],

    exercises: [
      {
        id: 'c2-s04-polinomio', title: 'Parcial de un polinomio',
        vars: { a: [2, 6, 1], m: [2, 4, 1], n: [2, 4, 1], b: [2, 9, 1], c: [2, 9, 1], k: [2, 4, 1] },
        prompt: function (v) { return '<p>Si $f(x, y) = ' + sum([tex(v.a, v.m, v.n), tex(v.b, 1, 1), tex(-v.c, 0, v.k)]) + '$, encuentra $\\dfrac{\\partial f}{\\partial x}$.</p>'; },
        check: 'expr', exprVars: ['x', 'y'], domain: { x: [0.3, 2], y: [0.3, 2] },
        partialOf: function (v) { return { f: src(v.a, v.m, v.n) + ' + ' + v.b + '*x*y - ' + src(v.c, 0, v.k), wrt: 'x' }; },
        answer: function (v) { return src(v.a * v.m, v.m - 1, v.n) + ' + ' + v.b + '*y'; },
        mistakes: {
          otherVar: function (v) { return src(v.a * v.n, v.m, v.n - 1) + ' + ' + v.b + '*x - ' + src(v.c * v.k, 0, v.k - 1); },
          product: function (v) { return src(v.a * v.m, v.m - 1, v.n) + ' + ' + v.b + '*y + ' + src(v.a * v.n, v.m, v.n - 1) + ' + ' + v.b + '*x - ' + src(v.c * v.k, 0, v.k - 1); },
          keptConst: function (v) { return src(v.a * v.m, v.m - 1, v.n) + ' + ' + v.b + '*y - ' + src(v.c, 0, v.k); }
        },
        feedback: [
          { when: 'otherVar', say: 'Derivaste respecto a $y$. Para $\\partial f/\\partial x$, la que se queda fija es $y$.' },
          { when: 'product', say: 'Te sobran términos: trataste a $y$ como si cambiara con $x$ (regla del producto). Con $y$ constante, $\\partial_x(x^my^n) = m\\,x^{m-1}y^n$.' },
          { when: 'keptConst', say: 'El término que solo tiene $y$ es constante respecto a $x$: su derivada es 0, no se queda.' }
        ],
        hint: 'Trata a $y$ como un número. Cada término: baja el exponente de $x$; lo que no tiene $x$ se va.',
        solution: function (v) {
          return '$$\\frac{\\partial f}{\\partial x} = ' + sum([tex(v.a * v.m, v.m - 1, v.n), tex(v.b, 0, 1)]) + '$$ El término $' + tex(-v.c, 0, v.k) + '$ no tiene $x$: deriva a 0.';
        }
      },
      {
        id: 'c2-s04-exp-trig', title: 'Parcial con exponencial y seno',
        vars: { a: [2, 5, 1], b: [2, 6, 1] },
        prompt: function (v) { return '<p>Si $f(x, y) = e^{' + v.a + 'x}\\sin(' + v.b + 'y)$, encuentra $\\dfrac{\\partial f}{\\partial y}$.</p>'; },
        check: 'expr', exprVars: ['x', 'y'], domain: { x: [-0.6, 0.6], y: [-1, 1] },
        partialOf: function (v) { return { f: 'e^(' + v.a + 'x)*sin(' + v.b + 'y)', wrt: 'y' }; },
        answer: function (v) { return v.b + '*e^(' + v.a + 'x)*cos(' + v.b + 'y)'; },
        mistakes: {
          noChain: function (v) { return 'e^(' + v.a + 'x)*cos(' + v.b + 'y)'; },
          otherVar: function (v) { return v.a + '*e^(' + v.a + 'x)*sin(' + v.b + 'y)'; },
          product: function (v) { return v.b + '*e^(' + v.a + 'x)*cos(' + v.b + 'y) + ' + v.a + '*e^(' + v.a + 'x)*sin(' + v.b + 'y)'; }
        },
        feedback: [
          { when: 'noChain', say: function (v) { return 'Te faltó la derivada de adentro: $\\frac{d}{dy}(' + v.b + 'y) = ' + v.b + '$ multiplica al coseno.'; } },
          { when: 'otherVar', say: 'Derivaste la exponencial: eso es $\\partial f/\\partial x$. Respecto a $y$, el factor $e^{ax}$ es constante.' },
          { when: 'product', say: 'Usaste regla del producto, pero $e^{ax}$ no depende de $y$: es una constante que multiplica.' }
        ],
        hint: '$e^{ax}$ no tiene $y$: sale como constante. Deriva el seno con la regla de la cadena.',
        solution: function (v) { return '$$\\frac{\\partial f}{\\partial y} = e^{' + v.a + 'x}\\cdot\\cos(' + v.b + 'y)\\cdot ' + v.b + ' = ' + v.b + 'e^{' + v.a + 'x}\\cos(' + v.b + 'y)$$'; }
      },
      {
        id: 'c2-s04-valor', title: 'Valor de la parcial en un punto',
        vars: { a: [1, 5, 1], b: [2, 9, 1], p: [-2, 3, 1], q: [1, 3, 1] },
        prompt: function (v) { return '<p>Si $f(x, y) = ' + sum([tex(v.a, 2, 1), tex(1, 1, 3), tex(-v.b, 0, 1)]) + '$, ¿cuánto vale $f_x(' + v.p + ', ' + v.q + ')$?</p>'; },
        check: 'numeric',
        answer: function (v) { return 2 * v.a * v.p * v.q + Math.pow(v.q, 3); },
        mistakes: {
          otherVar: function (v) { return v.a * v.p * v.p + 3 * v.p * v.q * v.q - v.b; },
          product: function (v) { return 2 * v.a * v.p * v.q + Math.pow(v.q, 3) + v.a * v.p * v.p + 3 * v.p * v.q * v.q - v.b; },
          valueF: function (v) { return v.a * v.p * v.p * v.q + v.p * Math.pow(v.q, 3) - v.b * v.q; }
        },
        feedback: [
          { when: 'otherVar', say: 'Ese es $f_y$ en el punto. Para $f_x$, deja fija la $y$.' },
          { when: 'product', say: 'Te sobra el término de $f_y$: trataste a $y$ como si cambiara con $x$.' },
          { when: 'valueF', say: 'Ese es $f$ en el punto, no su pendiente. Primero deriva y luego sustituye.' }
        ],
        // Oráculo independiente: diferencias centradas sobre f (sin derivar a mano).
        oracle: { lab: 'value', value: function (v) {
          var f = function (x, y) { return v.a * x * x * y + x * y * y * y - v.b * y; }, h = 1e-3;
          return (f(v.p + h, v.q) - f(v.p - h, v.q)) / (2 * h);
        } },
        hint: 'Deriva respecto a $x$ con $y$ constante y luego sustituye el punto.',
        solution: function (v) {
          return '$$f_x = ' + sum([tex(2 * v.a, 1, 1), tex(1, 0, 3)]) + '\\;\\Rightarrow\\; f_x(' + v.p + ', ' + v.q + ') = ' + (2 * v.a) + '(' + v.p + ')(' + v.q + ') + ' + v.q + '^3 = ' + (2 * v.a * v.p * v.q + Math.pow(v.q, 3)) + '$$';
        }
      },
      {
        id: 'c2-s04-mixta', title: 'Derivada mixta',
        vars: { a: [2, 5, 1], b: [2, 3, 1] },
        prompt: function (v) { return '<p>Si $f(x, y) = x^3y^2 + ' + v.a + 'x\\,e^{' + v.b + 'y}$, encuentra $f_{xy} = \\dfrac{\\partial}{\\partial y}\\left(\\dfrac{\\partial f}{\\partial x}\\right)$.</p>'; },
        check: 'expr', exprVars: ['x', 'y'], domain: { x: [-1, 1.5], y: [-1, 1] },
        // La referencia deriva f_y respecto a x (el otro orden): por Clairaut debe dar lo mismo que answer.
        partialOf: function (v) { return { f: '2x^3*y + ' + (v.a * v.b) + '*x*e^(' + v.b + 'y)', wrt: 'x' }; },
        answer: function (v) { return '6x^2*y + ' + (v.a * v.b) + '*e^(' + v.b + 'y)'; },
        mistakes: {
          onlyFirst: function (v) { return '3x^2*y^2 + ' + v.a + '*e^(' + v.b + 'y)'; },
          fxx: function () { return '6x*y^2'; },
          fyy: function (v) { return '2x^3 + ' + (v.a * v.b * v.b) + '*x*e^(' + v.b + 'y)'; }
        },
        feedback: [
          { when: 'onlyFirst', say: 'Esa es $f_x$; falta derivarla ahora respecto a $y$.' },
          { when: 'fxx', say: 'Derivaste dos veces respecto a $x$ ($f_{xx}$). La segunda derivada es respecto a $y$.' },
          { when: 'fyy', say: 'Esa es $f_{yy}$. En $f_{xy}$ se deriva una vez respecto a $x$ y otra respecto a $y$.' }
        ],
        hint: 'Primero $f_x$ (con $y$ constante); luego deriva ese resultado respecto a $y$. Puedes comprobar con el otro orden.',
        solution: function (v) {
          return '$$f_x = 3x^2y^2 + ' + v.a + 'e^{' + v.b + 'y} \\;\\Rightarrow\\; f_{xy} = 6x^2y + ' + (v.a * v.b) + 'e^{' + v.b + 'y}$$ Al revés da lo mismo: $f_y = 2x^3y + ' + (v.a * v.b) + 'x\\,e^{' + v.b + 'y}$ y $f_{yx} = 6x^2y + ' + (v.a * v.b) + 'e^{' + v.b + 'y}$.';
        }
      },
      {
        id: 'c2-s04-gas', title: 'Gas ideal: cambio de presión',
        vars: { n: [1, 3, 1], T: [280, 360, 10], V: [10, 30, 2] },
        prompt: function (v) { return '<p>Un gas ideal cumple $P = \\dfrac{nRT}{V}$, con $R = 8.31$ J/(mol·K). Si $V$ está en litros, $P$ sale en kPa. Con $n = ' + v.n + '$ mol y $T = ' + v.T + '$ K fija, ¿cuánto vale $\\dfrac{\\partial P}{\\partial V}$ cuando $V = ' + v.V + '$ L?</p>'; },
        check: 'numeric', unit: 'kPa/L',
        answer: function (v) { return -v.n * 8.31 * v.T / (v.V * v.V); },
        mistakes: {
          noSign: function (v) { return v.n * 8.31 * v.T / (v.V * v.V); },
          noSquare: function (v) { return -v.n * 8.31 * v.T / v.V; },
          otherVar: function (v) { return v.n * 8.31 / v.V; }
        },
        feedback: [
          { when: 'noSign', say: 'Falta el signo: $\\frac{d}{dV}V^{-1} = -V^{-2}$. Al agrandar el volumen, la presión baja.' },
          { when: 'noSquare', say: 'Esa es la presión misma (con signo menos). La derivada de $1/V$ es $-1/V^2$: falta otro $V$ abajo.' },
          { when: 'otherVar', say: 'Ese es $\\partial P/\\partial T = nR/V$. Aquí la que cambia es $V$; $T$ está fija.' }
        ],
        // Oráculo independiente: diferencias centradas sobre P(V).
        oracle: { lab: 'value', value: function (v) {
          var P = function (V) { return v.n * 8.31 * v.T / V; }, h = 1e-4;
          return (P(v.V + h) - P(v.V - h)) / (2 * h);
        } },
        hint: 'Con $n$, $R$ y $T$ fijas, $P = (nRT)\\,V^{-1}$. Deriva la potencia.',
        solution: function (v) { return '$$\\frac{\\partial P}{\\partial V} = -\\frac{nRT}{V^2} = -\\frac{' + v.n + '(8.31)(' + v.T + ')}{' + v.V + '^2} = ' + fx(-v.n * 8.31 * v.T / (v.V * v.V)) + '\\ \\text{kPa/L}$$ Cada litro de más baja la presión unos ' + fx(v.n * 8.31 * v.T / (v.V * v.V)) + ' kPa.'; }
      },
      {
        id: 'c2-s04-tres', title: 'Tres variables',
        vars: { a: [2, 9, 1], b: [2, 9, 1] },
        prompt: function (v) { return '<p>Si $f(x, y, z) = x^2yz^3 + ' + v.a + 'xz - ' + v.b + 'y$, encuentra $\\dfrac{\\partial f}{\\partial z}$.</p>'; },
        check: 'expr', exprVars: ['x', 'y', 'z'], domain: [0.3, 2],
        partialOf: function (v) { return { f: 'x^2*y*z^3 + ' + v.a + 'x*z - ' + v.b + 'y', wrt: 'z' }; },
        answer: function (v) { return '3x^2*y*z^2 + ' + v.a + 'x'; },
        mistakes: {
          otherVar: function (v) { return '2x*y*z^3 + ' + v.a + 'z'; },
          keptConst: function (v) { return '3x^2*y*z^2 + ' + v.a + 'x - ' + v.b + 'y'; }
        },
        feedback: [
          { when: 'otherVar', say: 'Derivaste respecto a $x$. Para $\\partial f/\\partial z$, $x$ y $y$ son constantes.' },
          { when: 'keptConst', say: 'El término con solo $y$ no tiene $z$: deriva a 0.' }
        ],
        hint: '$x$ y $y$ son constantes; deriva cada término respecto a $z$.',
        solution: function (v) { return '$$\\frac{\\partial f}{\\partial z} = 3x^2yz^2 + ' + v.a + 'x$$ El término $-' + v.b + 'y$ no tiene $z$.'; }
      },
      {
        id: 'c2-s04-clairaut', title: 'Concepto: Clairaut',
        vars: { c: [2, 9, 1], p: [1, 3, 1], q: [1, 3, 1] },
        prompt: function (v) { return '<p>Una función $f(x, y)$ tiene segundas parciales continuas en todo el plano y $f_{xy}(' + v.p + ', ' + v.q + ') = ' + v.c + '$. ¿Cuánto vale $f_{yx}(' + v.p + ', ' + v.q + ')$?</p>'; },
        check: 'choice',
        options: function (v) {
          return [
            { text: '$' + v.c + '$', correct: true },
            { text: '$-' + v.c + '$', say: 'Cambiar el orden no cambia el signo: con mixtas continuas, Clairaut dice que son iguales.' },
            { text: '$0$', say: 'No hay razón para que se anule; es la misma derivada por otro camino.' },
            { text: 'No se puede saber sin conocer $f$', say: 'Sí se puede: como las mixtas son continuas, el teorema de Clairaut garantiza $f_{yx} = f_{xy}$.' }
          ];
        },
        answer: function (v) { return '$' + v.c + '$'; },
        hint: 'Piensa en el teorema de Clairaut.',
        solution: function (v) { return 'Con segundas parciales continuas, $f_{yx} = f_{xy}$, así que $f_{yx}(' + v.p + ', ' + v.q + ') = ' + v.c + '$.'; }
      }
    ],

    quiz: { tags: ['c2.S04'], count: 8 },

    errors: [
      'Usar regla del producto con un factor que no tiene la variable: $\\partial_x(x^2y)$ es $2xy$, no $2xy + x^2$.',
      'Dejar los términos que no tienen la variable: en $\\partial_x(x^3 + 4y^2)$ el $4y^2$ deriva a 0.',
      'Derivar respecto a la otra variable (confundir $f_x$ con $f_y$).',
      'Olvidar la derivada de adentro: $\\partial_x\\, e^{xy} = y\\,e^{xy}$, no $e^{xy}$.',
      'Sustituir el punto antes de derivar respecto a esa misma variable.',
      'Leer $\\frac{\\partial^2 f}{\\partial y\\,\\partial x}$ de izquierda a derecha: se deriva primero respecto a $x$, igual que en $f_{xy}$.'
    ],

    teacher: {
      plan: [
        'Empieza con el explainer del corte: que vean que la traza es una curva de Cálculo 1.',
        'Ejemplos 1 y 2 en el pizarrón, encerrando en un círculo la variable que se queda fija.',
        'Lab: carguen $x^2y$ y escriban $2xy + x^2$ a propósito para ver el aviso de la regla del producto.',
        'Cierra con la interpretación (placa y gas) y con Clairaut como herramienta para revisar.'
      ],
      check: [
        'Que digan en voz alta qué letra es constante antes de derivar.',
        'Que escriban unidades en toda razón de cambio.'
      ],
      note: 'Las parciales de orden superior se usan otra vez en optimización (S09). La continuidad en varias variables (§4.2 de OpenStax) se menciona solo como idea.'
    },

    bibliography: [
      'OpenStax. <em>Calculus Volume 3</em>, §4.3 “Partial Derivatives”. <a href="https://openstax.org/books/calculus-volume-3/pages/4-3-partial-derivatives">openstax.org</a> (CC BY-NC-SA 4.0).',
      'OpenStax. <em>Calculus Volume 3</em>, §4.2 “Limits and Continuity”. <a href="https://openstax.org/books/calculus-volume-3/pages/4-2-limits-and-continuity">openstax.org</a> (CC BY-NC-SA 4.0).'
    ],

    prev: 'sesion-03',
    next: 'sesion-05'
  };
  data.exercises.forEach(function (ex) {
    if (ex.check === 'numeric' && ex.mistakes) { ex.baseWhere = ex.where; ex.where = distinct(ex); }
  });
})();
