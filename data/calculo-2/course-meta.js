/* =====================================================================
   Cálculo 2 · N2 — metadatos del curso (brief N2 §2).
   Lo leen la portada (course-home.js) y la plantilla de sesión.
   ready: true cuando la sesión ya tiene su data/calculo-2/sesion-NN.js;
   bank: true cuando tiene banco de quiz en data/calculo-2/bank/sesion-NN.js.
   ===================================================================== */
window.COURSE_META = {
  slug: 'calculo-2',
  name: 'Cálculo 2',
  fullName: 'Cálculo 2: multivariable',
  code: 'c2',
  subject: 'mat',
  level: 'N2',
  sessions: 15,
  lead: 'Quince sesiones de funciones de varias variables: el espacio en 3D, derivadas parciales, gradiente, optimización con restricciones e integrales dobles y triples. Cada una trae explicación gráfica paso a paso, ejemplos resueltos, un lab que compara tu respuesta contra la real y un quiz.',
  next: { title: 'Cálculo 3: ecuaciones diferenciales', blurb: 'Ecuaciones de primer orden, lineales de orden superior, transformada de Laplace, sistemas y series.' },
  temario: [],
  groups: [
    {
      id: 'A', label: 'Espacio y derivada parcial',
      sessions: [
        { n: 1,  tag: 'Espacio 3D', title: 'Rectangulares en 3D: puntos, distancia, planos, cuádricas y curvas de nivel', short: 'Espacio 3D y curvas de nivel', lab: 'surface-contour', ready: false, bank: false },
        { n: 2,  tag: 'Coordenadas polares', title: 'Coordenadas polares: conversión y curvas polares', short: 'Coordenadas polares', lab: 'polar-check', ready: false, bank: false },
        { n: 3,  tag: 'Cilíndricas y esféricas', title: 'Coordenadas cilíndricas y esféricas: conversión entre los cuatro sistemas y superficies típicas', short: 'Cilíndricas y esféricas', lab: 'coord-convert', ready: false, bank: false },
        { n: 4,  tag: 'Derivada parcial', title: 'Derivadas parciales, incluidas las de orden superior', short: 'Derivadas parciales', lab: 'partial-slice', ready: false, bank: false },
        { n: 5,  tag: 'Diferencial total', title: 'Diferencial total: plano tangente, aproximación lineal y propagación de error', short: 'Diferencial total', lab: 'tangent-plane', ready: false, bank: false }
      ]
    },
    {
      id: 'B', label: 'Gradiente y optimización',
      sessions: [
        { n: 6,  tag: 'Regla de la cadena', title: 'Regla de la cadena: árbol de dependencias y derivación implícita', short: 'Regla de la cadena', lab: 'chain-tree', ready: false, bank: false },
        { n: 7,  tag: 'Derivada direccional', title: 'Derivada direccional', lab: 'directional-derivative', ready: false, bank: false },
        { n: 8,  tag: 'Gradiente', title: 'Gradiente: dirección de máximo crecimiento y normal a curvas y superficies de nivel', short: 'Gradiente', lab: 'gradient-field', ready: false, bank: false },
        { n: 9,  tag: 'Lagrange', title: 'Multiplicadores de Lagrange con una restricción', short: 'Lagrange con una restricción', lab: 'lagrange-one', ready: false, bank: false },
        { n: 10, tag: 'Varias restricciones', title: 'Multiplicadores de Lagrange con dos o más restricciones', short: 'Lagrange con varias restricciones', lab: 'lagrange-two', ready: false, bank: false }
      ]
    },
    {
      id: 'C', label: 'Integral múltiple',
      sessions: [
        { n: 11, tag: 'Integral doble', title: 'Integral doble como suma de diferenciales: sumas de Riemann en 2D y teorema de Fubini', short: 'Integral doble y Fubini', lab: 'double-riemann', ready: false, bank: false },
        { n: 12, tag: 'Regiones generales', title: 'Integral doble en regiones generales: orden de integración, área y masa', short: 'Regiones generales', lab: 'region-order', ready: false, bank: false },
        { n: 13, tag: 'Doble en polares', title: 'Integral doble en coordenadas polares', short: 'Doble en polares', lab: 'polar-element', ready: false, bank: false },
        { n: 14, tag: 'Integral triple', title: 'Integral triple en rectangulares: volumen, masa y centro de masa', short: 'Integral triple', lab: 'triple-cubes', ready: false, bank: false },
        { n: 15, tag: 'Triple curvilínea', title: 'Integral triple en cilíndricas y esféricas: el Jacobiano', short: 'Triple en cilíndricas y esféricas', lab: 'spherical-element', ready: false, bank: false }
      ]
    }
  ]
};

// Registro por código: el lanzador de quizzes carga las metas de todos los cursos.
(window.CB_METAS = window.CB_METAS || {})[window.COURSE_META.code] = window.COURSE_META;
