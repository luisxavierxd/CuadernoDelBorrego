/* =====================================================================
   Arranque del hub: tema, biblioteca, hero, atajos de práctica y reveal.
   ===================================================================== */
(function () {
  function renderPresets() {
    var list = document.getElementById('presets');
    var note = document.getElementById('presets-note');
    var data = window.QUIZ_PRESETS;
    if (!list || !data) return;
    note.textContent = 'Atajos · ' + data.note;
    list.innerHTML = data.presets.map(function (p) {
      var first = p.sessions[0], last = p.sessions[p.sessions.length - 1];
      var range = 'S' + String(first).padStart(2, '0') + '–S' + String(last).padStart(2, '0');
      var href = 'quiz/?preset=' + encodeURIComponent(p.id) + (p.kind === 'exam' ? '&modo=simulacro' : '');
      return '<li><a class="preset preset--' + p.kind + '" href="' + href + '">' +
        '<span class="preset__label">' + p.label + '</span>' +
        '<span class="preset__meta">' + range + ' · semana ' + p.week + '</span></a></li>';
    }).join('');
  }

  window.CBTheme.init();
  window.CourseGrid.render(document.getElementById('course-grid'));
  renderPresets();
  window.HubHero.init();
  window.CBAnim.init({ noticeWhat: 'el camino del inicio se muestra' });
})();
