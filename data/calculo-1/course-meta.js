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
        { n: 1,  title: 'Razón de cambio y la derivada', temario: ['1.1', '1.2'], lab: 'secant-tangent', ready: true, bank: true },
        { n: 2,  title: 'Fórmulas directas: potencia, polinomios, exponencial, logaritmo, trigonométricas y trigonométricas inversas', short: 'Fórmulas directas de derivación', temario: ['1.3', '1.4', '1.5', '2.1', '2.2', '3.4', '3.6', '3.7'], lab: 'derivative-check', ready: true, bank: true },
        { n: 3,  title: 'Regla del producto', temario: ['3.2'], lab: 'derivative-check', ready: true, bank: true },
        { n: 4,  title: 'Regla del cociente', temario: ['3.3'], lab: 'derivative-check', ready: true, bank: true },
        { n: 5,  title: 'Regla de la cadena', temario: ['3.1'], lab: 'chain-composition', ready: true, bank: true },
        { n: 6,  title: 'Derivación implícita', temario: ['3.5'], lab: 'implicit-tangent', ready: true, bank: true }
      ]
    },
    {
      id: 'B', label: 'Optimización',
      sessions: [
        { n: 7,  title: 'Extremos relativos', temario: ['4.1'], lab: 'f-fprime-fsecond' },
        { n: 8,  title: 'Problemas de optimización', temario: ['4.2'], lab: 'optimize-slider' }
      ]
    },
    {
      id: 'C', label: 'Integral',
      sessions: [
        { n: 9,  title: 'La integral y el Teorema Fundamental del Cálculo', temario: ['5.1', '5.2'], lab: 'riemann' },
        { n: 10, title: 'Integrales directas y cambio de variable', temario: [], lab: 'antiderivative-check', ready: true, bank: true },
        { n: 11, title: 'Integración por partes', temario: ['5.6'], lab: 'antiderivative-check' },
        { n: 12, title: 'Sustitución trigonométrica', temario: ['5.6'], lab: 'antiderivative-check' },
        { n: 13, title: 'Fracciones parciales', temario: ['5.6'], lab: 'antiderivative-check' },
        { n: 14, title: 'Longitud de arco y áreas', temario: ['5.3', '5.4'], lab: 'area-between' },
        { n: 15, title: 'Sólidos de revolución', temario: ['5.5'], lab: 'solid-revolution' }
      ]
    }
  ]
};

// Registro por código: el lanzador de quizzes carga las metas de ambos cursos.
(window.CB_METAS = window.CB_METAS || {})[window.COURSE_META.code] = window.COURSE_META;
