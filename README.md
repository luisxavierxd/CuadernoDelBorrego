# Cuaderno del Borrego

Cursos autogestionados de **Cálculo 1** y **Física 1** para alumnos de nuevo ingreso, cada uno de 15 sesiones,
con explicaciones gráficas, labs que comparan tu respuesta contra la real y simulacros de examen.
Sitio estático para GitHub Pages. **Proyecto de alumnos, no oficial.**

HTML/CSS/JS vanilla, **sin build step ni framework**. Librerías por CDN con versión fija
(anime.js 3.2.1; en fases siguientes KaTeX 0.16, math.js 15.2.0 y manim-web 0.3.24).

## Estructura

```
index.html                    Hub: hero, cómo funciona, biblioteca y atajos de práctica
calculo-1/ · fisica-1/        Portadas de curso (y, desde F1, sesiones/sesion-NN/)
quiz/ · formularios/ · creditos/
shared/css/tokens.css         ÚNICO archivo con colores (cuaderno claro y pizarrón oscuro)
shared/css/*.css              base, theme (fondos y paneles), home, course
shared/js/theme.js            Tema claro/oscuro, clave 'cb-theme', evento 'cb:themechange'
shared/js/*.js                animaciones, filtros de trazo, biblioteca, hero del hub, portada de curso
data/courses.js               Fuente única de cursos del hub
data/quiz-presets.js          Atajos del ritmo sugerido (quiz y parciales)
data/<curso>/course-meta.js   Bloques y sesiones del curso
reference/lab-antiderivada.html  Demo aprobada que se porta al registro de labs
scripts/                      Validación en Node
```

## Previsualizar y validar

```bash
python -m http.server 8000      # y abre http://localhost:8000
npm install                     # solo instala Playwright (para QA en navegador)
npm run check                   # esquemas, links internos y externos, colores fuera de tokens, pie de página
npm run contrast                # WCAG AA de los tokens en ambos temas
```

`node scripts/check.js --offline` omite la revisión de links externos.

## Reglas

- Todo color sale de `shared/css/tokens.css`; ningún componente nombra la materia (`data-subject` en `<body>` elige el acento).
- Toda animación respeta `prefers-reduced-motion`.
- Todo concepto sale de una fuente verificable (OpenStax, CC BY 4.0) y va en la bibliografía de la sesión.

Código bajo licencia MIT.
