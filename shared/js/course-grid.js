/* =====================================================================
   Biblioteca del hub: pinta window.COURSES (data/courses.js).
   - Una sección por materia, con icono de trazo y tarjetas por nivel.
   - 'live' -> <a> a la portada del curso (misma pestaña).
   - 'soon' -> <div aria-disabled> sin foco de teclado.
   - Al final, la tarjeta genérica "Próximo tema".
   ===================================================================== */
(function () {
  var ICONS = {
    mat:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 20h18M4 21V3"/><path d="M5 17c3-1 4-9 7-9s3 6 7 4"/><path d="M8 7l9 3" stroke-dasharray="2 2.5"/></svg>',
    fis:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 20c2.5-9 5-13 8-13s5.5 4 7 9" stroke-dasharray="2 2.5"/><circle cx="11" cy="7" r="1.6"/><path d="M11 7h6M15 5l2 2-2 2"/><path d="M3 21h18"/></svg>',
    plus:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    arrow:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function levelCard(lv, subject) {
    var head =
      '<span class="level-card__level">' + esc(lv.level) + '</span>' +
      '<h4 class="level-card__title">' + esc(lv.title) + '</h4>' +
      (lv.blurb ? '<p class="level-card__blurb">' + esc(lv.blurb) + '</p>' : '');

    if (lv.status === 'live') {
      return '<a class="level-card level-card--live tone-' + esc(lv.tone) + '" href="' + esc(lv.url) + '">' + head +
        '<span class="level-card__meta"><span>' + (lv.sessions || '') + ' sesiones</span>' +
        '<span class="level-card__go">Abrir curso ' + ICONS.arrow + '</span></span></a>';
    }
    return '<div class="level-card level-card--soon tone-' + esc(lv.tone) + '" aria-disabled="true">' + head +
      '<span class="level-card__meta"><span>En preparación</span><span class="level-card__go">Próximamente</span></span></div>';
  }

  function subjectSection(cat) {
    var live = cat.levels.filter(function (l) { return l.status === 'live'; }).length;
    return '<section class="subject subject--' + esc(cat.subject) + ' reveal" aria-labelledby="subject-' + esc(cat.subject) + '">' +
      '<div class="subject__head">' +
        '<span class="subject__icon">' + (ICONS[cat.subject] || ICONS.plus) + '</span>' +
        '<div><h3 class="subject__title" id="subject-' + esc(cat.subject) + '">' + esc(cat.label) + '</h3>' +
        (cat.blurb ? '<p class="subject__blurb">' + esc(cat.blurb) + '</p>' : '') + '</div>' +
        '<span class="subject__count">' + live + ' de ' + cat.levels.length + ' disponibles</span>' +
      '</div>' +
      '<div class="levels">' + cat.levels.map(function (l) { return levelCard(l, cat.subject); }).join('') + '</div>' +
    '</section>';
  }

  function futureCard() {
    return '<section class="subject reveal"><div class="levels"><div class="level-card level-card--future" aria-disabled="true">' +
      '<span class="level-card__plus">' + ICONS.plus + '</span>' +
      '<h4 class="level-card__title">Próximo tema</h4>' +
      '<p class="level-card__blurb">El cuaderno sigue creciendo: química, programación y más.</p>' +
    '</div></div></section>';
  }

  function render(root, courses) {
    courses = courses || window.COURSES;
    if (!root || !courses) return;
    root.innerHTML = courses.map(subjectSection).join('') + futureCard();
    if (window.CBAnim) window.CBAnim.revealNew(root);
  }

  window.CourseGrid = { render: render, icons: ICONS };
})();
