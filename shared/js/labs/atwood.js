/* =====================================================================
   Lab atwood (§8.3): sistemas con cuerda y polea ideales.
     Máquina de Atwood: dos masas colgando de una polea.
       a = (m2 − m1) g / (m1 + m2)      T = 2 m1 m2 g / (m1 + m2)
     Mesa con polea: m1 sobre una mesa (fricción μ) y m2 colgando.
       a = (m2 − μ m1) g / (m1 + m2)    T = m1 (a + μ g)      (si m2 > μ m1)
   El alumno da a y T; errores típicos: T = m2 g (la tensión no es el peso)
   y dividir solo entre una masa.
   ===================================================================== */
(function () {
  var G = 9.81;

  /* ------------------------- Matemática pura ------------------------- */
  // a > 0 cuando m2 baja.
  function atwood(m1, m2, g) {
    g = g || G;
    return { a: (m2 - m1) * g / (m1 + m2), T: 2 * m1 * m2 * g / (m1 + m2) };
  }
  // Mesa con polea (fricción cinética μ si se mueve; si no alcanza, queda en reposo).
  function table(m1, m2, mu, g) {
    g = g || G; mu = mu || 0;
    if (m2 <= mu * m1) return { a: 0, T: m2 * g, moves: false };
    var a = (m2 - mu * m1) * g / (m1 + m2);
    return { a: a, T: m1 * (a + mu * g), moves: true };
  }
  // Bloques en fila jalados por F sobre piso liso: tensión en la cuerda entre ellos.
  function train(masses, F) {
    var M = masses.reduce(function (s, m) { return s + m; }, 0), a = F / M;
    return { a: a, T: masses.slice(1).reduce(function (s, m) { return s + m; }, 0) * a };
  }
  function solve(mode, p) { return mode === 'table' ? table(p.m1, p.m2, p.mu) : atwood(p.m1, p.m2); }
  function close(a, b, tol) { return Math.abs(a - b) <= (tol || 0.01) * Math.max(Math.abs(b), 0.05); }
  function mistakes(mode, p) {
    var s = solve(mode, p), M = p.m1 + p.m2;
    return {
      a: { oneMass: s.a * M / p.m2, noFriction: mode === 'table' ? p.m2 * G / M : NaN },
      T: { weight: p.m2 * G, other: p.m1 * G }
    };
  }
  function diagnose(mode, p, sa, sT) {
    var s = solve(mode, p), m = mistakes(mode, p), out = { a: 'bad', T: 'bad' };
    if (isFinite(sa)) {
      if (close(Math.abs(sa), Math.abs(s.a))) out.a = 'ok';
      else Object.keys(m.a).some(function (k) { if (isFinite(m.a[k]) && close(Math.abs(sa), Math.abs(m.a[k])) && !close(m.a[k], s.a)) { out.a = k; return true; } return false; });
    }
    if (isFinite(sT)) {
      if (close(sT, s.T)) out.T = 'ok';
      else Object.keys(m.T).some(function (k) { if (close(sT, m.T[k]) && !close(m.T[k], s.T)) { out.T = k; return true; } return false; });
    }
    return out;
  }
  window.LabMath.atwood = { G: G, atwood: atwood, table: table, train: train, solve: solve, diagnose: diagnose };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG_A = {
    ok: 'Tu aceleración coincide.',
    oneMass: 'Dividiste la fuerza neta solo entre una masa; las dos se mueven juntas: divide entre m₁ + m₂.',
    noFriction: 'Te faltó la fricción sobre la mesa: la fuerza neta es m₂g − μm₁g.',
    bad: 'Tu aceleración no coincide: escribe ΣF = ma para cada masa y súmalas para eliminar T.'
  };
  var MSG_T = {
    ok: 'Tu tensión coincide.',
    weight: 'Usaste T = m₂g. Si m₂ acelera hacia abajo, la cuerda la sostiene menos que su peso: T = m₂(g − a).',
    other: 'Usaste el peso de la otra masa; la tensión sale de ΣF = ma de cualquiera de las dos.',
    bad: 'Tu tensión no coincide: sustituye tu a en la ecuación de una de las masas.'
  };

  window.Labs['atwood'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var s = cfg.start || { mode: 'atwood', m1: 3, m2: 5, mu: 0.2 };
    var mode = UI.select({ label: 'Sistema', options: ['Máquina de Atwood (dos masas colgando)', 'Bloque en una mesa y masa colgando'] });
    var m1 = UI.slider({ label: 'Masa m₁', min: 0.5, max: 10, step: 0.5, value: s.m1, unit: 'kg' }, refresh);
    var m2 = UI.slider({ label: 'Masa m₂', min: 0.5, max: 10, step: 0.5, value: s.m2, unit: 'kg' }, refresh);
    var mu = UI.slider({ label: 'Fricción de la mesa μₖ', min: 0, max: 0.8, step: 0.05, value: s.mu, fmt: function (v) { return v.toFixed(2); } }, refresh);
    var aIn = UI.input({ label: 'Tu |a| (m/s²)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var tIn = UI.input({ label: 'Tu T (N)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var run = UI.button('Comprobar', 'primary', check);
    var go = UI.button('Soltar', 'ghost', release);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(640, 420, 'Sistema de masas unidas por una cuerda que pasa por una polea, con sus fuerzas');
    var anim = null, shift = 0, checked = false;

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        mode.node, m1.node, m2.node, mu.node, h('div', { class: 'lab-row' }, [aIn.node, tIn.node]),
        h('div', { class: 'lab-buttons' }, [run, go]), note, verdict, facts
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['La misma cuerda, la misma aceleración']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'tensión']),
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'peso']),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'fricción']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'aceleración'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    mode.input.value = s.mode === 'table' ? '1' : '0';
    mode.input.addEventListener('change', function () { shift = 0; syncMode(); refresh(); });
    function syncMode() { mu.node.hidden = mode.input.value !== '1'; }
    function key() { return mode.input.value === '1' ? 'table' : 'atwood'; }
    function params() { return { m1: m1.get(), m2: m2.get(), mu: mu.get() }; }
    function refresh() { if (anim) { anim.pause(); anim = null; } shift = 0; if (checked) check(); else draw(); }

    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }
    function vec(g, x, y, dx, dy, cls, label) {
      var L = Math.hypot(dx, dy); if (L < 3) return;
      var ux = dx / L, uy = dy / L, ex = x + dx, ey = y + dy, k = 10;
      el('path', { d: 'M' + x + ' ' + y + 'L' + ex + ' ' + ey + 'M' + (ex - k * ux - k * 0.55 * uy) + ' ' + (ey - k * uy + k * 0.55 * ux) + 'L' + ex + ' ' + ey + 'L' + (ex - k * ux + k * 0.55 * uy) + ' ' + (ey - k * uy - k * 0.55 * ux), 'class': cls, fill: 'none', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
      if (label) el('text', { x: ex + 6 + (dx < 0 ? -40 : 0), y: ey + (dy > 0 ? 16 : -4), 'class': 'ann', 'font-size': 15 }, g).textContent = label;
    }

    function draw() {
      var p = params(), k = key(), sol = solve(k, p), big = Math.max(p.m1, p.m2) * G, F = 70 / big;
      svg.innerHTML = '';
      var g = el('g', { 'class': 'sketch' }), d = Math.max(-60, Math.min(60, shift));
      if (k === 'atwood') {
        var px = 320, py = 70, R = 40;
        el('path', { d: 'M' + (px - 60) + ' 20H' + (px + 60) + 'M' + px + ' 20V' + py, 'class': 'axis', 'stroke-width': 2, fill: 'none' }, g);
        el('circle', { cx: px, cy: py, r: R, 'class': 'ref', fill: 'none', 'stroke-width': 2.5 }, g);
        var y1 = 220 - d, y2 = 220 + d, s1 = 28 + 4 * p.m1, s2 = 28 + 4 * p.m2;
        el('path', { d: 'M' + (px - R) + ' ' + py + 'V' + (y1 - s1 / 2) + 'M' + (px + R) + ' ' + py + 'V' + (y2 - s2 / 2), 'class': 'axis', 'stroke-width': 1.8, fill: 'none' }, g);
        el('rect', { x: px - R - s1 / 2, y: y1 - s1 / 2, width: s1, height: s1, rx: 4, 'class': 'box-aux' }, g);
        el('rect', { x: px + R - s2 / 2, y: y2 - s2 / 2, width: s2, height: s2, rx: 4, 'class': 'box-ref' }, g);
        el('text', { x: px - R, y: y1 + 5, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 15 }, g).textContent = 'm₁';
        el('text', { x: px + R, y: y2 + 5, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 15 }, g).textContent = 'm₂';
        vec(g, px - R - s1 / 2 - 18, y1, 0, -sol.T * F, 'ref', 'T');
        vec(g, px - R - s1 / 2 - 18, y1, 0, p.m1 * G * F, 'error', 'm₁g');
        vec(g, px + R + s2 / 2 + 18, y2, 0, -sol.T * F, 'ref', 'T');
        vec(g, px + R + s2 / 2 + 18, y2, 0, p.m2 * G * F, 'error', 'm₂g');
        if (Math.abs(sol.a) > 0.01) { vec(g, 120, 220, 0, -Math.sign(sol.a) * 50, 'aux', 'a'); vec(g, 520, 220, 0, Math.sign(sol.a) * 50, 'aux', 'a'); }
      } else {
        var ty = 200, ex = 470;
        el('path', { d: 'M60 ' + ty + 'H' + ex + 'V380', 'class': 'axis', 'stroke-width': 2.5, fill: 'none' }, g);
        el('circle', { cx: ex + 18, cy: ty - 18 + 18, r: 18, 'class': 'ref', fill: 'none', 'stroke-width': 2.5 }, g);
        var b1 = 30 + 4 * p.m1, x1 = 260 + d, b2 = 26 + 4 * p.m2, y2b = 290 + d;
        el('rect', { x: x1 - b1 / 2, y: ty - b1, width: b1, height: b1, rx: 4, 'class': 'box-aux' }, g);
        el('path', { d: 'M' + (x1 + b1 / 2) + ' ' + (ty - b1 / 2) + 'H' + (ex + 18) + 'M' + (ex + 36) + ' ' + ty + 'V' + (y2b - b2 / 2), 'class': 'axis', 'stroke-width': 1.8, fill: 'none' }, g);
        el('rect', { x: ex + 36 - b2 / 2, y: y2b - b2 / 2, width: b2, height: b2, rx: 4, 'class': 'box-ref' }, g);
        el('text', { x: x1, y: ty - b1 / 2 + 5, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 15 }, g).textContent = 'm₁';
        el('text', { x: ex + 36, y: y2b + 5, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 15 }, g).textContent = 'm₂';
        vec(g, x1 + b1 / 2, ty - b1 / 2 - 14, sol.T * F, 0, 'ref', 'T');
        if (p.mu > 0) vec(g, x1 - b1 / 2, ty - b1 / 2, -(sol.moves ? p.mu * p.m1 * G : sol.T) * F, 0, 'trace', 'f');
        vec(g, ex + 36 + b2 / 2 + 16, y2b, 0, -sol.T * F, 'ref', 'T');
        vec(g, ex + 36 + b2 / 2 + 16, y2b, 0, p.m2 * G * F, 'error', 'm₂g');
        if (sol.a > 0.01) vec(g, x1 - 30, ty - b1 - 30, 60, 0, 'aux', 'a');
      }
      facts.innerHTML = '';
      [['aceleración real', UI.fmt(Math.abs(sol.a), 4) + ' m/s²' + (k === 'atwood' ? (sol.a > 0 ? ' (m₂ baja)' : sol.a < 0 ? ' (m₁ baja)' : '') : sol.moves ? '' : ' (no se mueve)')],
        ['tensión real', UI.fmt(sol.T, 4) + ' N'], ['peso de m₂', UI.fmt(p.m2 * G, 4) + ' N']]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    // Anima 1.2 s de movimiento con la aceleración real (desde el reposo).
    function release() {
      if (anim) { anim.pause(); anim = null; }
      var sol = solve(key(), params()), sign = key() === 'atwood' ? Math.sign(sol.a) : 1;
      if (!(window.CBAnim && window.CBAnim.canAnimate() && window.anime) || Math.abs(sol.a) < 0.01) { shift = 60 * sign * (Math.abs(sol.a) > 0.01 ? 1 : 0); draw(); return; }
      var o = { t: 0 };
      anim = window.anime({ targets: o, t: 1.2, duration: 1200, easing: 'linear', update: function () { shift = sign * Math.min(60, 0.5 * Math.abs(sol.a) * o.t * o.t * 40); draw(); }, complete: function () { anim = null; } });
    }

    function check() {
      var p = params(), k = key(), sa = parseFloat(aIn.input.value), sT = parseFloat(tIn.input.value), r = diagnose(k, p, sa, sT);
      var kind = r.a === 'ok' && r.T === 'ok' ? 'ok' : (r.a !== 'bad' || r.T !== 'bad') ? 'warn' : 'bad';
      UI.verdict(verdict, kind, kind === 'ok' ? 'Tu a y tu T coinciden' : kind === 'warn' ? 'Vas cerca' : 'No coinciden', MSG_A[r.a] + ' ' + MSG_T[r.T]);
      checked = true;
      draw();
    }

    // Ejemplo cargado: un compañero usó T = m₂g.
    syncMode();
    (function () { var sol = solve(key(), params()); aIn.input.value = UI.fmt(Math.abs(sol.a), 4); tIn.input.value = UI.fmt(params().m2 * G, 4); })();
    note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error en la tensión? Cambia las masas y escribe tus valores.';
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
