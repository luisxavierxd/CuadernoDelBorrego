/* =====================================================================
   Física 3 · N3 — metadatos del curso (notes/Fisica3_brief.md).
   Lo leen la portada (course-home.js) y la plantilla de sesión.
   ready: true cuando la sesión ya tiene su data/fisica-3/sesion-NN.js;
   bank: true cuando tiene banco de quiz en data/fisica-3/bank/sesion-NN.js.
   ===================================================================== */
window.COURSE_META = {
  slug: 'fisica-3',
  name: 'Física 3',
  fullName: 'Física 3: sistemas electromagnéticos',
  code: 'f3',
  subject: 'fis',
  level: 'N3',
  sessions: 15,
  lead: 'Quince sesiones de magnetismo: fuerza magnética, fuentes de campo (Biot–Savart y Ampère), solenoides, ley de Faraday, ley de Lenz, inductancia y circuitos RL. Cada una trae explicación gráfica paso a paso, derivaciones completas, ejemplos resueltos, un lab que compara tu respuesta contra la simulación y un quiz.',
  temario: [],
  groups: [
    {
      id: 'A', label: 'Fuerza magnética',
      sessions: [
        { n: 1,  tag: 'Campo magnético', title: 'Imanes, campo magnético y líneas de campo', short: 'Campo magnético', lab: 'magnetic-field-map', ready: true, bank: true },
        { n: 2,  tag: 'Fuerza de Lorentz', title: 'Fuerza sobre una carga en movimiento: F = qv×B', short: 'Fuerza de Lorentz', lab: 'lorentz-force', ready: true, bank: true },
        { n: 3,  tag: 'Movimiento circular en B', title: 'Movimiento circular en un campo magnético: selector de velocidad, espectrómetro y ciclotrón', short: 'Movimiento circular en B', lab: 'cyclotron-orbit', ready: true, bank: true },
        { n: 4,  tag: 'Fuerza sobre un conductor', title: 'Fuerza magnética sobre un conductor con corriente y efecto Hall', short: 'Fuerza sobre un conductor', lab: 'wire-force', ready: true, bank: true },
        { n: 5,  tag: 'Torque en una espira', title: 'Torque en una espira, dipolo magnético y motor', short: 'Torque en una espira', lab: 'loop-torque', ready: true, bank: true }
      ]
    },
    {
      id: 'B', label: 'Fuentes de campo',
      sessions: [
        { n: 6,  tag: 'Biot–Savart', title: 'Ley de Biot–Savart: alambre recto, arco y espira', short: 'Biot–Savart', lab: 'biot-savart', ready: true, bank: true },
        { n: 7,  tag: 'Conductores paralelos', title: 'Superposición de campos y fuerza entre conductores paralelos', short: 'Conductores paralelos', lab: 'parallel-wires', ready: true, bank: true },
        { n: 8,  tag: 'Ley de Ampère', title: 'Ley de Ampère', short: 'Ley de Ampère', lab: 'ampere-loop', ready: true, bank: true },
        { n: 9,  tag: 'Solenoides y toroides', title: 'Solenoides y toroides', short: 'Solenoides y toroides', lab: 'solenoid-toroid', ready: true, bank: true },
        { n: 10, tag: 'Flujo magnético', title: 'Flujo magnético, ley de Gauss del magnetismo y materia', short: 'Flujo magnético', lab: 'magnetic-flux', ready: true, bank: true }
      ]
    },
    {
      id: 'C', label: 'Inducción',
      sessions: [
        { n: 11, tag: 'Ley de Faraday', title: 'Ley de Faraday y fem de movimiento', short: 'Ley de Faraday', lab: 'faraday-emf', ready: true, bank: true },
        { n: 12, tag: 'Ley de Lenz', title: 'Ley de Lenz, forma general de la ley de Faraday y generadores', short: 'Ley de Lenz', lab: 'lenz-direction', ready: true, bank: true },
        { n: 13, tag: 'Inductancia', title: 'Autoinducción e inductancia, con inductancia mutua', short: 'Inductancia', lab: 'inductance-solenoid', ready: true, bank: true },
        { n: 14, tag: 'Circuito RL', title: 'Circuito RL: crecimiento y decaimiento de la corriente', short: 'Circuito RL', lab: 'rl-circuit', ready: true, bank: true },
        { n: 15, tag: 'Energía magnética', title: 'Energía en el campo magnético y circuito LC', short: 'Energía magnética', lab: 'magnetic-energy', ready: true, bank: true }
      ]
    }
  ]
};

// Registro por código: el lanzador de quizzes carga las metas de todos los cursos.
(window.CB_METAS = window.CB_METAS || {})[window.COURSE_META.code] = window.COURSE_META;
