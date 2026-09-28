/* =====================================================================
   Portada de formularios: materia → nivel, desde data/courses.js.
   Un nivel con formulario: true enlaza a formularios/<url>; los demás
   quedan como "Llega con el curso".
   ===================================================================== */
(function () {
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function card(l) {
    var name = esc(l.title.split(':')[0]);
    return l.formulario
      ? '<a class="form-card" href="' + l.url + '"><strong>' + name + '</strong><span>' + esc(l.blurb) + '</span><span class="mono">Ver formulario →</span></a>'
      : '<div class="form-card is-soon" aria-disabled="true"><strong>' + name + '</strong><span>' + esc(l.blurb) + '</span><span class="mono">Llega con el curso</span></div>';
  }
  function render(root) {
    root.innerHTML = (window.COURSES || []).map(function (sub) {
      return '<section class="form-subject" data-subject="' + sub.subject + '"><h2>' + esc(sub.label) + '</h2>' +
        '<div class="form-courses">' + sub.levels.map(card).join('') + '</div></section>';
    }).join('');
  }
  window.CBFormIndex = { render: render };
})();
