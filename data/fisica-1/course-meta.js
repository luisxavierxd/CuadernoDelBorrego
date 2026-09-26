/* =====================================================================
   Física 1 · N1 — metadatos del curso (§3, §7.4; temario aprobado 2026-09-26).
   Lo leen la portada (course-home.js) y la plantilla de sesión.
   ready: true cuando la sesión ya tiene su data/fisica-1/sesion-NN.js.
   ===================================================================== */
window.COURSE_META = {
  slug: 'fisica-1',
  name: 'Física 1',
  fullName: 'Física 1: cinemática, dinámica, energía y estática',
  code: 'f1',
  subject: 'fis',
  level: 'N1',
  sessions: 15,
  lead: 'Quince sesiones de vectores, movimiento, fuerzas, energía y equilibrio. Cada una trae explicación gráfica paso a paso, ejemplos resueltos, un lab que compara tu respuesta contra la simulación y un quiz.',
  next: { title: 'Física 2: electricidad', blurb: 'Carga, corriente, circuitos y leyes de Kirchhoff.' },
  groups: [
    {
      id: 'A', label: 'Herramientas',
      sessions: [
        { n: 1,  title: 'Modelación, unidades y análisis dimensional', lab: null },
        { n: 2,  title: 'Vectores: componentes y suma', lab: 'vector-sum' },
        { n: 3,  title: 'Operaciones vectoriales: vector unitario, producto escalar y producto vectorial', short: 'Operaciones vectoriales', lab: 'dot-cross' }
      ]
    },
    {
      id: 'B', label: 'Cinemática',
      sessions: [
        { n: 4,  title: 'Posición, velocidad y aceleración como derivadas · MRU', lab: 'motion-graphs' },
        { n: 5,  title: 'MRUA · caída libre y tiro vertical', lab: 'kinematics-check' },
        { n: 6,  title: 'Tiro parabólico', lab: 'projectile-check', ready: true },
        { n: 7,  title: 'Movimiento circular y relativo', lab: 'circular-vectors' }
      ]
    },
    {
      id: 'C', label: 'Dinámica',
      sessions: [
        { n: 8,  title: 'Leyes de Newton y diagrama de cuerpo libre', lab: 'fbd-builder' },
        { n: 9,  title: 'Tensiones y poleas', lab: 'atwood' },
        { n: 10, title: 'Resortes (ley de Hooke) y fricción', lab: 'spring-friction' },
        { n: 11, title: 'Planos inclinados y dinámica circular', lab: 'incline' }
      ]
    },
    {
      id: 'D', label: 'Trabajo y energía',
      sessions: [
        { n: 12, title: 'Trabajo, energía cinética y teorema trabajo-energía', lab: 'work-area' },
        { n: 13, title: 'Energía potencial (gravitacional y elástica) y conservación de la energía, con y sin fricción', short: 'Energía potencial y conservación', lab: 'energy-bars' }
      ]
    },
    {
      id: 'E', label: 'Estática',
      sessions: [
        { n: 14, title: 'Equilibrio de la partícula: fuerzas, tensiones en cables y resortes', short: 'Equilibrio de la partícula', lab: 'particle-equilibrium' },
        { n: 15, title: 'Torque y equilibrio del cuerpo rígido: vigas y reacciones en apoyos', short: 'Torque y equilibrio del cuerpo rígido', lab: 'beam-equilibrium' }
      ]
    }
  ]
};
