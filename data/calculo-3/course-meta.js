/* =====================================================================
   Cálculo 3 · N3 — metadatos del curso (brief de Cálculo 3).
   Lo leen la portada (course-home.js) y la plantilla de sesión.
   ready: true cuando la sesión ya tiene su data/calculo-3/sesion-NN.js;
   bank: true cuando tiene banco de quiz en data/calculo-3/bank/sesion-NN.js.
   Todas las sesiones usan el mismo lab, ode-compare, con sus propios problemas.
   ===================================================================== */
window.COURSE_META = {
  slug: 'calculo-3',
  name: 'Cálculo 3',
  fullName: 'Cálculo 3: ecuaciones diferenciales',
  code: 'c3',
  subject: 'mat',
  level: 'N3',
  sessions: 15,
  lead: 'Quince sesiones de ecuaciones diferenciales ordinarias: de primer orden (separables, lineales, Bernoulli y exactas), lineales de orden superior con coeficientes constantes, coeficientes indeterminados, variación de parámetros y sus aplicaciones a resortes y circuitos. Cada una trae explicación gráfica paso a paso, ejemplos resueltos, un lab que sustituye tu solución en la ecuación y la compara contra la numérica, y un quiz.',
  temario: [],
  groups: [
    {
      id: 'A', label: 'Primer orden I',
      sessions: [
        { n: 1,  tag: 'Qué es una EDO', labMode: 'campo', title: 'Qué es una ecuación diferencial: orden, linealidad, solución, PVI, existencia y unicidad', short: 'Qué es una EDO', lab: 'ode-compare', ready: true, bank: true },
        { n: 2,  tag: 'Variables separables', labMode: 'separables', title: 'Ecuaciones de variables separables', short: 'Variables separables', lab: 'ode-compare', ready: true, bank: true },
        { n: 3,  tag: 'Cambio de variable', labMode: 'cambio', title: 'Reducibles a separables: homogéneas (y = ux) y sustitución u = ax + by + c', short: 'Reducibles a separables', lab: 'ode-compare', ready: true, bank: true },
        { n: 4,  tag: 'Lineales de primer orden', labMode: 'tanque', title: 'Lineales de primer orden: factor integrante', short: 'Lineales y factor integrante', lab: 'ode-compare', ready: true, bank: true },
        { n: 5,  tag: 'Ecuación de Bernoulli', labMode: 'bernoulli', title: 'Reducibles a lineales: ecuación de Bernoulli', short: 'Bernoulli', lab: 'ode-compare', ready: true, bank: true }
      ]
    },
    {
      id: 'B', label: 'Primer orden II y orden n',
      sessions: [
        { n: 6,  tag: 'Ecuaciones exactas', labMode: 'exactas', title: 'Ecuaciones exactas: ∂M/∂y = ∂N/∂x y función potencial', short: 'Exactas', lab: 'ode-compare', ready: true, bank: true },
        { n: 7,  tag: 'Reducibles a exactas', labMode: 'mu', title: 'Reducibles a exactas: factores integrantes μ(x) y μ(y)', short: 'Reducibles a exactas', lab: 'ode-compare', ready: true, bank: true },
        { n: 8,  tag: 'Modelado con EDO', labMode: 'metodo', title: 'Modelado con primer orden: circuitos RC y RL, mezclas y poblaciones', short: 'Modelado con primer orden', lab: 'ode-compare', ready: true, bank: true },
        { n: 9,  tag: 'Teoría lineal', labMode: 'wronskiano', title: 'Teoría lineal de orden n: superposición, Wronskiano, conjunto fundamental y reducción de orden', short: 'Teoría lineal de orden n', lab: 'ode-compare', ready: true, bank: true },
        { n: 10, tag: 'Coeficientes constantes', labMode: 'raices', title: 'Homogéneas de segundo orden con coeficientes constantes: los tres casos de raíces', short: 'Segundo orden homogéneas', lab: 'ode-compare', ready: true, bank: true }
      ]
    },
    {
      id: 'C', label: 'No homogéneas y orden superior',
      sessions: [
        { n: 11, tag: 'Homogéneas de orden n', labMode: 'orden-n', title: 'Homogéneas de orden n: polinomio característico, raíces repetidas y complejas', short: 'Homogéneas de orden n', lab: 'ode-compare', ready: true, bank: true },
        { n: 12, tag: 'Coeficientes indeterminados', labMode: 'yp', title: 'Coeficientes indeterminados: la forma de y_p según g(x)', short: 'Coeficientes indeterminados', lab: 'ode-compare', ready: true, bank: true },
        { n: 13, tag: 'Duplicación', labMode: 'duplicacion', title: 'Coeficientes indeterminados: duplicación (× xˢ) y orden superior', short: 'Duplicación', lab: 'ode-compare', ready: true, bank: true },
        { n: 14, tag: 'Variación de parámetros', labMode: 'variacion', title: 'Variación de parámetros (segundo orden)', short: 'Variación de parámetros', lab: 'ode-compare', ready: true, bank: true },
        { n: 15, tag: 'Resortes y RLC', labMode: 'regimen', title: 'Aplicaciones: masa–resorte–amortiguador y circuito RLC (libre, amortiguado, forzado y resonancia)', short: 'Resortes y circuitos RLC', lab: 'ode-compare', ready: true, bank: true }
      ]
    }
  ]
};

// Registro por código: el lanzador de quizzes carga las metas de todos los cursos.
(window.CB_METAS = window.CB_METAS || {})[window.COURSE_META.code] = window.COURSE_META;
