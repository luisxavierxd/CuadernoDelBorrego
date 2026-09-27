# Cuaderno del Borrego

Clases universitarias de cálculo y física, autogestionadas. Empieza con **Cálculo 1** y **Física 1** (15 sesiones cada uno);
Cálculo 2 y 3 (ecuaciones diferenciales) y Física 2 y 3 están en el plan. Cada curso trae
con explicaciones gráficas, labs que comparan tu respuesta contra la real y simulacros de examen.
Sitio estático para GitHub Pages. **Proyecto de alumnos, no oficial.**

HTML/CSS/JS vanilla, **sin build step ni framework**. Librerías por CDN con versión fija
(anime.js 3.2.1; en fases siguientes KaTeX 0.16, math.js 15.2.0 y manim-web 0.3.24).

## Estructura

```
index.html                         Hub: hero, cómo funciona, biblioteca y atajos de práctica
calculo-1/ · fisica-1/             Portadas de curso
  sesiones/sesion-NN/index.html    Shell mínimo de cada sesión (lo crea scripts/make-shell.js)
quiz/ · formularios/ · creditos/
shared/css/tokens.css              ÚNICO archivo con colores (cuaderno claro y pizarrón oscuro)
shared/css/*.css                   base, theme, home, course, sesion, labs
shared/js/theme.js                 Tema claro/oscuro, clave 'cb-theme', evento 'cb:themechange'
shared/js/session-template.js      CBTemplate.render(SESSION_DATA)
shared/js/labs/registry.js         window.Labs · window.LabMath · window.LabUI
shared/js/labs/<tipo>.js           Un archivo por lab (antiderivative-check, projectile-check…)
shared/js/diagrams/<curso>.js      Diagramas SVG: Diagrams[id](state)
shared/js/exercises.js             Ejercicios parametrizados y su calificación
shared/js/math-input.js            Editor de fórmulas estilo WebAssign (MathLive + paleta de símbolos)
shared/js/latex-to-math.js         LaTeX del editor → sintaxis de math.js
shared/js/quiz/engine.js           Selección, calificación, semáforo, arrastre de error, simulacro
shared/js/quiz/ui.js               Tarjetas, semáforo, quiz de práctica, simulacro y lanzador (/quiz/)
data/courses.js                    Fuente única de cursos del hub
data/quiz-presets.js               Atajos del ritmo sugerido (quiz y parciales)
data/<curso>/course-meta.js        Bloques y sesiones (ready: true = sesión publicada)
data/<curso>/sesion-NN.js          Contenido de cada sesión (window.SESSION_DATA)
data/<curso>/bank/sesion-NN.js     Banco de preguntas de la sesión (bank: true en course-meta)
data/<curso>/exam-problems.js      Problemas de examen con incisos encadenados
reference/lab-antiderivada.html    Demo aprobada que se portó a antiderivative-check
scripts/                           Validación en Node
```

## Previsualizar y validar

```bash
python -m http.server 8000      # y abre http://localhost:8000
npm install                     # solo instala Playwright (QA en navegador)
npm run validate                # todo lo de abajo, en orden
npm run check                   # esquemas, links internos y externos, colores fuera de tokens, pie de página
npm run contrast                # WCAG AA de los tokens en ambos temas
npm run test:labs               # LabMath (math.js 15.2.0 se descarga una vez a scripts/.cache)
npm run test:examples           # ejemplos y ejercicios contra LabMath, en cientos de instancias
npm run test:quiz               # motor de quizzes, bancos (≥ 100 por sesión) y problemas de examen
npm run qa                      # Playwright: 360/1024/1440 px, ambos temas, reduced-motion, labs montados
```

`node scripts/check.js --offline` omite la revisión de links externos.
Para publicar una sesión nueva: escribe `data/<curso>/sesion-NN.js`, marca `ready: true` en su
`course-meta.js` y corre `node scripts/make-shell.js <curso> NN`.

## Reglas

- Todo color sale de `shared/css/tokens.css`; ningún componente nombra la materia (`data-subject` en `<body>` elige el acento).
- Toda animación respeta `prefers-reduced-motion`.
- Todo concepto sale de una fuente verificable (OpenStax, CC BY 4.0) y va en la bibliografía de la sesión.

Código bajo licencia MIT.
