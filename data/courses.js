/* =====================================================================
   Cuaderno del Borrego · fuente única de cursos (§4).
   Agregar un curso o nivel = editar este arreglo; course-grid.js lo pinta.

   Por materia:
     subject: 'mat' | 'fis'   (define el acento de la tarjeta)
     label, blurb
     levels[]:
       level:  'N1' | 'N2' | 'N3'
       tone:   token de acento de la tarjeta ('mat-accent', 'mat-n2', 'fis-n2'…)
       title, blurb
       status: 'live' -> tarjeta con enlace a url (misma pestaña)
               'soon' -> tarjeta "Próximamente", sin foco
       url:    solo para 'live' (relativa a la raíz del sitio)
       sessions: número de sesiones (informativo)
   ===================================================================== */
window.COURSES = [
  {
    subject: 'mat',
    label: 'Matemáticas',
    blurb: 'De la razón de cambio a los sólidos de revolución, con gráficas que se mueven contigo.',
    levels: [
      {
        level: 'N1', tone: 'mat-accent', status: 'live', url: 'calculo-1/', sessions: 15,
        title: 'Cálculo 1: diferencial e integral',
        blurb: 'Derivadas, optimización, técnicas de integración y sus aplicaciones.'
      },
      {
        level: 'N2', tone: 'mat-n2', status: 'soon',
        title: 'Cálculo 2: multivariable',
        blurb: 'Funciones de varias variables, integrales dobles y triples.'
      }
    ]
  },
  {
    subject: 'fis',
    label: 'Física',
    blurb: 'Vectores, movimiento y fuerzas, con labs que comparan tu respuesta contra la simulación.',
    levels: [
      {
        level: 'N1', tone: 'fis-accent', status: 'live', url: 'fisica-1/', sessions: 15,
        title: 'Física 1: cinemática, dinámica, energía y estática',
        blurb: 'Vectores, tiro parabólico, leyes de Newton, trabajo y energía, y equilibrio.'
      },
      {
        level: 'N2', tone: 'fis-n2', status: 'soon',
        title: 'Física 2: electricidad',
        blurb: 'Carga, corriente, circuitos y leyes de Kirchhoff.'
      },
      {
        level: 'N3', tone: 'fis-n3', status: 'soon',
        title: 'Física 3: electromagnetismo',
        blurb: 'Campos eléctrico y magnético, inducción y ondas.'
      }
    ]
  }
];
