/* =====================================================================
   Hero del hub (§6.1): "apuntes de alguien que ya pasó por el camino".
   Un camino punteado empieza como una curva con su tangente deslizándose y
   termina como la parábola de un proyectil que cae junto a los botones.
   Huellas de pezuña a lo largo del camino y notas a mano en los márgenes.
   Un solo ciclo al cargar; con reduced-motion todo queda estático.
   ===================================================================== */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var MOBILE = '(max-width: 760px)';
  var VIEW_DESKTOP = '0 0 1200 640';
  var VIEW_MOBILE = '515 30 700 600';

  // Glifo de pezuña hendida (dos lóbulos), apuntando hacia -y.
  var HOOF =
    'M-1.4 -9 C-6.2 -9 -7.8 -2 -7.2 3.4 C-6.6 7.8 -3.8 9.8 -1.6 8.8 C-0.8 4.4 -0.6 -3.4 -1.4 -9 Z ' +
    'M1.4 -9 C6.2 -9 7.8 -2 7.2 3.4 C6.6 7.8 3.8 9.8 1.6 8.8 C0.8 4.4 0.6 -3.4 1.4 -9 Z';

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  function dirAt(path, s) {
    var L = path.getTotalLength();
    var a = path.getPointAtLength(Math.max(0, s - 1.5));
    var b = path.getPointAtLength(Math.min(L, s + 1.5));
    var dx = b.x - a.x, dy = b.y - a.y, m = Math.hypot(dx, dy) || 1;
    return { x: dx / m, y: dy / m };
  }

  // Busca sobre la curva el punto con tangente horizontal más cercano a 'from'.
  function flatPoint(path, from, to) {
    var best = from, bestY = 1;
    for (var s = from; s <= to; s += 1) {
      var d = dirAt(path, s);
      if (Math.abs(d.y) < bestY) { bestY = Math.abs(d.y); best = s; }
    }
    return best;
  }

  function init() {
    var svg = document.getElementById('hub-hero-art');
    if (!svg) return;
    var road = svg.querySelector('.road');
    var roadMask = svg.querySelector('.road-mask');
    var fnPart = svg.querySelector('.road-fn');
    var tangent = svg.querySelector('.tangent');
    var hoofLayer = svg.querySelector('.hoofs');
    var notes = Array.prototype.slice.call(svg.querySelectorAll('.note'));

    // Encuadre móvil: el dibujo va entre el subtítulo y los botones.
    var mq = window.matchMedia(MOBILE);
    var frame = function () { svg.setAttribute('viewBox', mq.matches ? VIEW_MOBILE : VIEW_DESKTOP); };
    frame();
    if (mq.addEventListener) mq.addEventListener('change', frame);

    var L = road.getTotalLength();
    var L1 = fnPart.getTotalLength();
    var rest = flatPoint(fnPart, L1 * 0.55, L1 * 0.98);   // el valle: f′(x) = 0

    // Huellas: alternan a la izquierda y a la derecha del camino.
    var hoofs = [];
    var steps = 13;
    for (var i = 1; i <= steps; i++) {
      var s = L * (i / (steps + 0.6));
      var p = road.getPointAtLength(s), d = dirAt(road, s);
      var side = i % 2 ? 1 : -1;
      var x = p.x - d.y * 13 * side, y = p.y + d.x * 13 * side;
      var ang = Math.atan2(d.y, d.x) * 180 / Math.PI + 90;
      var g = el('path', { d: HOOF, transform: 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + ang.toFixed(1) + ') scale(1.35)' }, hoofLayer);
      g.dataset.at = (s / L).toFixed(3);
      hoofs.push(g);
    }

    function placeTangent(s) {
      var p = fnPart.getPointAtLength(s), d = dirAt(fnPart, s), h = 105;
      var line = tangent.querySelector('line'), dot = tangent.querySelector('circle');
      line.setAttribute('x1', (p.x - d.x * h).toFixed(1));
      line.setAttribute('y1', (p.y - d.y * h).toFixed(1));
      line.setAttribute('x2', (p.x + d.x * h).toFixed(1));
      line.setAttribute('y2', (p.y + d.y * h).toFixed(1));
      dot.setAttribute('cx', p.x.toFixed(1));
      dot.setAttribute('cy', p.y.toFixed(1));
    }

    function showStatic() {
      roadMask.style.strokeDasharray = 'none';
      roadMask.style.strokeDashoffset = 0;
      hoofs.forEach(function (h) { h.style.opacity = 1; });
      placeTangent(rest);
      tangent.style.opacity = 1;
      notes.forEach(function (n) { n.style.opacity = 1; n.removeAttribute('clip-path'); });
    }

    if (!window.CBAnim || !window.CBAnim.canAnimate()) { showStatic(); return; }

    // Estado inicial
    roadMask.style.strokeDasharray = L + ' ' + L;
    roadMask.style.strokeDashoffset = L;
    hoofs.forEach(function (h) { h.style.opacity = 0; });
    tangent.style.opacity = 0;
    notes.forEach(function (n) { n.style.opacity = 0; });

    var DRAW = 3000;
    var head = { s: 0 };
    anime({
      targets: head, s: L, duration: DRAW, delay: 350, easing: 'easeInOutSine',
      begin: function () { tangent.style.opacity = 1; },
      update: function () {
        roadMask.style.strokeDashoffset = L - head.s;
        placeTangent(Math.max(1, Math.min(head.s, L1 - 1)));
      },
      complete: function () {
        var t = { s: L1 - 1 };
        anime({ targets: t, s: rest, duration: 900, easing: 'easeOutCubic', update: function () { placeTangent(t.s); } });
      }
    });
    hoofs.forEach(function (h) {
      // Solo opacidad: la posición vive en el atributo transform de la huella.
      anime({ targets: h, opacity: [0, 1], duration: 380, easing: 'easeOutQuad',
        delay: 350 + DRAW * parseFloat(h.dataset.at) * 0.92 });
    });

    // Notas "escritas": un rectángulo de recorte que crece de izquierda a derecha.
    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(function () {
      notes.forEach(function (n, i) {
        var box = n.getBBox();
        var clip = svg.querySelector('#' + n.getAttribute('data-clip') + ' rect');
        clip.setAttribute('x', box.x - 6); clip.setAttribute('y', box.y - 6);
        clip.setAttribute('height', box.height + 12); clip.setAttribute('width', 0);
        n.style.opacity = 1;
        anime({ targets: clip, width: [0, box.width + 12], duration: 900, easing: 'easeInOutQuad',
          delay: 1500 + i * 520,
          complete: function () { n.removeAttribute('clip-path'); } });
      });
    });
  }

  window.HubHero = { init: init };
})();
