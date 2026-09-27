/* =====================================================================
   Cálculo 1 · N1 — metadatos del curso (§3, §7.4).
   Lo leen la portada (course-home.js) y la plantilla de sesión.
   ready: true cuando la sesión ya tiene su data/calculo-1/sesion-NN.js;
   bank: true cuando tiene banco de quiz en data/calculo-1/bank/sesion-NN.js.
   ===================================================================== */
window.COURSE_META = {
  slug: 'calculo-1',
  name: 'Cálculo 1',
  fullName: 'Cálculo 1: diferencial e integral',
  code: 'c1',
  subject: 'mat',
  level: 'N1',
  sessions: 15,
  lead: 'Quince sesiones para pasar de la razón de cambio a los sólidos de revolución. Cada una trae explicación gráfica paso a paso, ejemplos resueltos, un lab para comprobar tu respuesta y un quiz.',
  next: { title: 'Cálculo 2: multivariable', blurb: 'Funciones de varias variables, integrales dobles y triples.' },
  groups: [
    {
      id: 'A', label: 'Derivada',
      sessions: [
        { n: 1,  tag: 'Razón de cambio', title: 'Razón de cambio y la derivada', temario: ['1.1', '1.2'], lab: 'secant-tangent', ready: true, bank: true },
        { n: 2,  tag: 'Fórmulas directas', title: 'Fórmulas directas: potencia, polinomios, exponencial, logaritmo, trigonométricas y trigonométricas inversas', short: 'Fórmulas directas de derivación', temario: ['1.3', '1.4', '1.5', '2.1', '2.2', '3.4', '3.6', '3.7'], lab: 'derivative-check', ready: true, bank: true },
        { n: 3,  tag: 'Regla del producto', title: 'Regla del producto', temario: ['3.2'], lab: 'derivative-check', ready: true, bank: true },
        { n: 4,  tag: 'Regla del cociente', title: 'Regla del cociente', temario: ['3.3'], lab: 'derivative-check', ready: true, bank: true },
        { n: 5,  tag: 'Regla de la cadena', title: 'Regla de la cadena', temario: ['3.1'], lab: 'chain-composition', ready: true, bank: true },
        { n: 6,  tag: 'Derivación implícita', title: 'Derivación implícita', temario: ['3.5'], lab: 'implicit-tangent', ready: true, bank: true }
      ]
    },
    {
      id: 'B', label: 'Optimización',
      sessions: [
        { n: 7,  tag: 'Extremos relativos', title: 'Extremos relativos', temario: ['4.1'], lab: 'f-fprime-fsecond', ready: true, bank: true },
        { n: 8,  tag: 'Optimización', title: 'Problemas de optimización', temario: ['4.2'], lab: 'optimize-slider', ready: true, bank: true }
      ]
    },
    {
      id: 'C', label: 'Integral',
      sessions: [
        { n: 9,  tag: 'Integral definida', title: 'La integral y el Teorema Fundamental del Cálculo', short: 'La integral y el TFC', temario: ['5.1', '5.2'], lab: 'riemann', ready: true, bank: true },
        { n: 10, tag: 'Cambio de variable', title: 'Integrales directas y cambio de variable', temario: [], lab: 'antiderivative-check', ready: true, bank: true },
        { n: 11, tag: 'Por partes', title: 'Integración por partes', temario: ['5.6'], lab: 'antiderivative-check', ready: true, bank: true },
        { n: 12, tag: 'Sustitución trigonométrica', title: 'Sustitución trigonométrica', temario: ['5.6'], lab: 'antiderivative-check', ready: true, bank: true },
        { n: 13, tag: 'Fracciones parciales', title: 'Fracciones parciales', temario: ['5.6'], lab: 'antiderivative-check', ready: true, bank: true },
        { n: 14, tag: 'Áreas y arcos', title: 'Longitud de arco y áreas', temario: ['5.3', '5.4'], lab: 'area-between', ready: true, bank: true },
        { n: 15, tag: 'Sólidos de revolución', title: 'Sólidos de revolución', temario: ['5.5'], lab: 'solid-revolution', ready: true, bank: true }
      ]
    }
  ]
};

// Registro por código: el lanzador de quizzes carga las metas de ambos cursos.
(window.CB_METAS = window.CB_METAS || {})[window.COURSE_META.code] = window.COURSE_META;
