/* =====================================================================
   Física 2 · N2 — metadatos del curso (brief N2 §3).
   Lo leen la portada (course-home.js) y la plantilla de sesión.
   ready: true cuando la sesión ya tiene su data/fisica-2/sesion-NN.js;
   bank: true cuando tiene banco de quiz en data/fisica-2/bank/sesion-NN.js.
   ===================================================================== */
window.COURSE_META = {
  slug: 'fisica-2',
  name: 'Física 2',
  fullName: 'Física 2: sistemas eléctricos',
  code: 'f2',
  subject: 'fis',
  level: 'N2',
  sessions: 15,
  lead: 'Quince sesiones de electricidad: carga y campo eléctrico, potencial, ley de Gauss, capacitores, ley de Ohm, Kirchhoff y circuitos RC. Cada una trae explicación gráfica paso a paso, derivaciones completas, ejemplos resueltos, un lab que compara tu respuesta contra la simulación y un quiz.',
  next: { title: 'Física 3: electromagnetismo', blurb: 'Campo magnético, inducción y ondas electromagnéticas.' },
  temario: [],
  groups: [
    {
      id: 'A', label: 'Electrostática',
      sessions: [
        { n: 1,  tag: 'Carga eléctrica', title: 'Carga eléctrica: cuantización, conservación, conductores, aislantes e inducción', short: 'Carga eléctrica', lab: 'induction', ready: false, bank: false },
        { n: 2,  tag: 'Ley de Coulomb', title: 'Ley de Coulomb y superposición de fuerzas', short: 'Ley de Coulomb', lab: 'coulomb-check', ready: false, bank: false },
        { n: 3,  tag: 'Campo eléctrico', title: 'Campo eléctrico de cargas puntuales, líneas de campo y carga en un campo uniforme', short: 'Campo eléctrico', lab: 'field-lines', ready: false, bank: false },
        { n: 4,  tag: 'Distribuciones continuas', title: 'Campo eléctrico de distribuciones continuas de carga', short: 'Distribuciones continuas', lab: 'charge-integral', ready: false, bank: false },
        { n: 5,  tag: 'Potencial eléctrico', title: 'Energía potencial eléctrica y potencial de cargas puntuales', short: 'Potencial eléctrico', lab: 'potential-work', ready: false, bank: false }
      ]
    },
    {
      id: 'B', label: 'Gauss y capacitores',
      sessions: [
        { n: 6,  tag: 'Equipotenciales', title: 'Potencial de distribuciones continuas, equipotenciales y E = −∇V', short: 'Potencial y equipotenciales', lab: 'equipotentials', ready: false, bank: false },
        { n: 7,  tag: 'Flujo eléctrico', title: 'Flujo eléctrico', lab: 'flux-surface', ready: false, bank: false },
        { n: 8,  tag: 'Ley de Gauss', title: 'Ley de Gauss y sus aplicaciones', short: 'Ley de Gauss', lab: 'gauss-surface', ready: false, bank: false },
        { n: 9,  tag: 'Capacitancia', title: 'Capacitancia: placas paralelas, cilíndrico y esférico', short: 'Capacitancia', lab: 'capacitor-plates', ready: false, bank: false },
        { n: 10, tag: 'Redes de capacitores', title: 'Capacitores en serie y en paralelo y energía almacenada', short: 'Redes de capacitores', lab: 'capacitor-network', ready: false, bank: false }
      ]
    },
    {
      id: 'C', label: 'Circuitos',
      sessions: [
        { n: 11, tag: 'Ley de Ohm', title: 'Corriente, resistividad, ley de Ohm y potencia', short: 'Corriente y ley de Ohm', lab: 'iv-curve', ready: false, bank: false },
        { n: 12, tag: 'Redes de resistores', title: 'Resistores en serie y en paralelo, fem y resistencia interna', short: 'Redes de resistores', lab: 'resistor-network', ready: false, bank: false },
        { n: 13, tag: 'Kirchhoff I', title: 'Leyes de Kirchhoff I: nodos, mallas y convención de signos', short: 'Kirchhoff: nodos y mallas', lab: 'kirchhoff-signs', ready: false, bank: false },
        { n: 14, tag: 'Kirchhoff II', title: 'Leyes de Kirchhoff II: varias mallas como sistema de ecuaciones', short: 'Kirchhoff: varias mallas', lab: 'kirchhoff-solve', ready: false, bank: false },
        { n: 15, tag: 'Circuito RC', title: 'Circuito RC: carga y descarga, constante de tiempo y energía', short: 'Circuito RC', lab: 'rc-circuit', ready: false, bank: false }
      ]
    }
  ]
};

// Registro por código: el lanzador de quizzes carga las metas de todos los cursos.
(window.CB_METAS = window.CB_METAS || {})[window.COURSE_META.code] = window.COURSE_META;
