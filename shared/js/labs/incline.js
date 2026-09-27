/* =====================================================================
   Lab incline (§8.3): planos inclinados y dinámica circular.
   Plano: el peso se descompone en mg sin θ (a lo largo) y mg cos θ
   (perpendicular). Con una fuerza F paralela al plano o horizontal:
     N = mg cos θ + F sin θ (solo si F es horizontal)
     a lo largo (+ plano arriba): F∥ − mg sin θ ∓ μN
   Curva: peralte θ, radio r y fricción μ; velocidad máxima segura
     v_máx = √( r g (sin θ + μ cos θ) / (cos θ − μ sin θ) ).
   Errores típicos: intercambiar sin y cos, olvidar la fricción o ponerla
   del lado equivocado, e ignorar el peralte.
   ===================================================================== */
(function () {
  var G = 9.81, RAD = Math.PI / 180, DEG = 180 / Math.PI;

  /* ------------------------- Matemática pura ------------------------- */
  // p: { m, th, mus, muk, motion: 'rest'|'up'|'down', F, Fmode: 'parallel'|'horizontal' }
  // a > 0 plano arriba. motion 'rest': parte del reposo; 'up'/'down': ya se mueve en ese sentido.
  function slope(p) {
    var th = p.th * RAD, F = p.F || 0, horiz = p.Fmode === 'horizontal';
    var N = p.m * G * Math.cos(th) + (horiz ? F * Math.sin(th) : 0);
    var D = (horiz ? F * Math.cos(th) : F) - p.m * G * Math.sin(th);   // fuerza neta sin fricción, plano arriba
    var fk = p.muk * N, r = { N: N, D: D };
    if (p.motion === 'up') { r.a = (D - fk) / p.m; r.dir = 'up'; r.f = -fk; }
    else if (p.motion === 'down') { r.a = (D + fk) / p.m; r.dir = 'down'; r.f = fk; }
    else if (Math.abs(D) <= p.mus * N) { r.a = 0; r.dir = 'rest'; r.f = -D; }
    else if (D > 0) { r.a = (D - fk) / p.m; r.dir = 'up'; r.f = -fk; }
    else { r.a = (D + fk) / p.m; r.dir = 'down'; r.f = fk; }
    return r;
  }
  function critical(mus) { return Math.atan(mus) * DEG; }
  // m1 sobre el plano, m2 colgando de una polea en lo alto. a > 0 cuando m2 baja.
  function twoBlocks(m1, m2, th, mu) {
    var s = Math.sin(th * RAD), c = Math.cos(th * RAD), drive = (m2 - m1 * s) * G, fr = mu * m1 * G * c, M = m1 + m2, a;
    if (drive > fr) a = (drive - fr) / M;
    else if (drive < -fr) a = (drive + fr) / M;
    else a = 0;
    return { a: a, T: m2 * (G - a) };
  }
  function flatCurve(r, mu) { return Math.sqrt(mu * G * r); }
  function banked(r, th, mu) {
    var s = Math.sin(th * RAD), c = Math.cos(th * RAD);
    return {
      ideal: Math.sqrt(r * G * Math.tan(th * RAD)),
      max: c - mu * s > 0 ? Math.sqrt(r * G * (s + mu * c) / (c - mu * s)) : Infinity,
      min: Math.sqrt(Math.max(0, r * G * (s - mu * c) / (c + mu * s)))
    };
  }
  function close(a, b, tol) { return Math.abs(a - b) <= (tol || 0.01) * Math.max(Math.abs(b), 0.05); }
  // Compara |a| del alumno; errores típicos sobre una copia de p.
  function diagnoseA(p, s) {
    if (!isFinite(s)) return 'bad';
    var real = Math.abs(slope(p).a);
    if (close(Math.abs(s), real) || (real < 1e-9 && Math.abs(s) < 0.01)) return 'ok';
    var sl = slope(p), alt = {
      swapped: Math.abs(slope(Object.assign({}, p, { th: 90 - p.th })).a),
      noFriction: Math.abs(slope(Object.assign({}, p, { mus: 0, muk: 0 })).a),
      frictionWrongSide: sl.dir === 'rest' ? NaN : Math.abs((sl.D + (sl.dir === 'up' ? 1 : -1) * p.muk * sl.N) / p.m)
    };
    var hit = 'bad';
    Object.keys(alt).some(function (k) { if (isFinite(alt[k]) && close(Math.abs(s), alt[k]) && !close(alt[k], real)) { hit = k; return true; } return false; });
    return hit;
  }
  function diagnoseV(r, th, mu, s) {
    if (!isFinite(s)) return 'bad';
    var b = banked(r, th, mu);
    if (close(s, b.max)) return 'ok';
    if (close(s, b.ideal) && !close(b.ideal, b.max)) return 'ideal';
    if (close(s, flatCurve(r, mu)) && !close(flatCurve(r, mu), b.max)) return 'flat';
    return 'bad';
  }
  window.LabMath.incline = { G: G, slope: slope, critical: critical, twoBlocks: twoBlocks, flatCurve: flatCurve, banked: banked, diagnoseA: diagnoseA, diagnoseV: diagnoseV };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var MSG_A = {
    ok: ['Tu aceleración coincide', ''],
    swapped: ['Intercambiaste seno y coseno', 'A lo largo del plano va mg sin θ; contra el plano, mg cos θ. Revisa con θ = 0: sin 0 = 0 y el bloque no resbala.'],
    noFriction: ['Te faltó la fricción', 'La fricción cinética μₖN actúa contra el movimiento, con N = mg cos θ (más F sin θ si F es horizontal).'],
    frictionWrongSide: ['La fricción va del otro lado', 'La fricción se opone al movimiento: si el bloque sube, apunta plano abajo; si baja, plano arriba.'],
    bad: ['Tu aceleración no coincide', 'Descompón el peso, escribe ΣF a lo largo del plano y divide entre m.']
  };
  var MSG_V = {
    ok: ['Tu velocidad máxima coincide', ''],
    ideal: ['Esa es la velocidad sin fricción', 'Con fricción el auto puede ir más rápido: la fricción apunta hacia abajo del peralte y ayuda a girar.'],
    flat: ['Ignoraste el peralte', 'En una curva peraltada la normal también empuja hacia el centro: usa la fórmula con sin θ y cos θ.'],
    bad: ['Tu velocidad no coincide', 'Plantea ΣF hacia el centro = mv²/r y ΣF vertical = 0 con N y la fricción.']
  };

  window.Labs['incline'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var s = cfg.start || { mode: 'plane', th: 30, m: 5, mus: 0.4, muk: 0.3, motion: 'rest', F: 0, Fmode: 'parallel', r: 60, bank: 15, mu: 0.3 };
    var mode = UI.select({ label: 'Situación', options: ['Bloque en un plano inclinado', 'Auto en una curva peraltada'] });
    var th = UI.slider({ label: 'Inclinación θ', min: 0, max: 60, step: 1, value: s.th, unit: '°' }, refresh);
    var m = UI.slider({ label: 'Masa m', min: 1, max: 20, step: 1, value: s.m, unit: 'kg' }, refresh);
    var mus = UI.slider({ label: 'Fricción estática μₛ', min: 0, max: 1, step: 0.05, value: s.mus, fmt: function (v) { return v.toFixed(2); } }, refresh);
    var muk = UI.slider({ label: 'Fricción cinética μₖ', min: 0, max: 1, step: 0.05, value: s.muk, fmt: function (v) { return v.toFixed(2); } }, refresh);
    var motion = UI.select({ label: 'Movimiento', options: ['Se suelta desde el reposo', 'Va subiendo (lo lanzaste plano arriba)'] });
    var F = UI.slider({ label: 'Fuerza aplicada F', min: 0, max: 150, step: 5, value: s.F, unit: 'N' }, refresh);
    var Fm = UI.select({ label: 'Dirección de F', options: ['Paralela al plano, hacia arriba', 'Horizontal, hacia el plano'] });
    var r = UI.slider({ label: 'Radio de la curva r', min: 10, max: 200, step: 5, value: s.r, unit: 'm' }, refresh);
    var bank = UI.slider({ label: 'Peralte θ', min: 0, max: 40, step: 1, value: s.bank, unit: '°' }, refresh);
    var mu = UI.slider({ label: 'Fricción llanta-camino μₛ', min: 0, max: 1, step: 0.05, value: s.mu, fmt: function (v) { return v.toFixed(2); } }, refresh);
    var ans = UI.input({ label: 'Tu |a| (m/s²)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(640, 400, 'Bloque en un plano inclinado con el peso descompuesto, o corte de una curva peraltada');
    var checked = false, planeNodes = [th.node, m.node, mus.node, muk.node, motion.node, F.node, Fm.node], curveNodes = [r.node, bank.node, mu.node];

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [mode.node].concat(planeNodes, curveNodes, [ans.node, h('div', { class: 'lab-buttons' }, [run]), note, verdict, facts])),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Descompón el peso']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'peso y sus componentes']), h('li', {}, [h('i', { class: 'sw sw--aux' }), 'normal']),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'fricción']), h('li', {}, [h('i', { class: 'sw sw--ref' }), 'F o aceleración'])
        ])
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    mode.input.value = s.mode === 'curve' ? '1' : '0';
    motion.input.value = s.motion === 'up' ? '1' : '0';
    Fm.input.value = s.Fmode === 'horizontal' ? '1' : '0';
    [mode, motion, Fm].forEach(function (x) { x.input.addEventListener('change', function () { sync(); refresh(); }); });
    function isCurve() { return mode.input.value === '1'; }
    function sync() {
      planeNodes.forEach(function (n) { n.hidden = isCurve(); });
      curveNodes.forEach(function (n) { n.hidden = !isCurve(); });
      ans.node.querySelector('label').textContent = isCurve() ? 'Tu velocidad máxima (m/s)' : 'Tu |a| (m/s²)';
    }
    function pp() { return { m: m.get(), th: th.get(), mus: mus.get(), muk: Math.min(muk.get(), mus.get()), motion: motion.input.value === '1' ? 'up' : 'rest', F: F.get(), Fmode: Fm.input.value === '1' ? 'horizontal' : 'parallel' }; }
    function refresh() { if (checked) check(); else draw(); }

    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }
    function vec(g, x, y, ang, len, cls, label, dash) {
      if (len < 4) return;
      var a = ang * RAD, ux = Math.cos(a), uy = -Math.sin(a), ex = x + len * ux, ey = y + len * uy, k = 11;
      el('path', { d: 'M' + x + ' ' + y + 'L' + ex + ' ' + ey + 'M' + (ex - k * ux - k * 0.55 * uy) + ' ' + (ey - k * uy + k * 0.55 * ux) + 'L' + ex + ' ' + ey + 'L' + (ex - k * ux + k * 0.55 * uy) + ' ' + (ey - k * uy - k * 0.55 * ux), 'class': cls, fill: 'none', 'stroke-width': dash ? 2 : 3.2, 'stroke-linecap': 'round', 'stroke-dasharray': dash || null }, g);
      if (label) el('text', { x: ex + 18 * ux, y: ey + 18 * uy + 5, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 15 }, g).textContent = label;
    }

    function drawPlane() {
      var p = pp(), res = slope(p), t = p.th, a = t * RAD, mg = p.m * G, K = 110 / Math.max(mg, p.F, res.N, 1);
      var g = el('g', { 'class': 'sketch' }), x0 = 80, y0 = 360, L = 480;
      el('path', { d: 'M' + x0 + ' ' + y0 + 'L' + (x0 + L * Math.cos(a)) + ' ' + y0 + 'L' + (x0 + L * Math.cos(a)) + ' ' + (y0 - L * Math.sin(a)) + 'Z', 'class': 'axis', 'stroke-width': 2, fill: 'none' }, g);
      // El bloque, a 55 % de la rampa; su centro se separa de la superficie.
      var bx = x0 + 0.55 * L * Math.cos(a), by = y0 - 0.55 * L * Math.sin(a), cx = bx - 30 * Math.sin(a), cy = by - 30 * Math.cos(a);
      el('rect', { x: cx - 30, y: cy - 30, width: 60, height: 60, rx: 5, 'class': 'box-aux', transform: 'rotate(' + (-t) + ' ' + cx + ' ' + cy + ')' }, g);
      vec(g, cx, cy, 270, mg * K, 'error', 'mg');
      vec(g, cx, cy, 180 + t, mg * Math.sin(a) * K, 'error', 'mg sin θ', '6 5');
      vec(g, cx, cy, 270 + t, mg * Math.cos(a) * K, 'error', 'mg cos θ', '6 5');
      vec(g, cx, cy, 90 + t, res.N * K, 'aux', 'N');
      if (Math.abs(res.f) > 0.01) vec(g, cx, cy, res.f > 0 ? t : 180 + t, Math.abs(res.f) * K, 'trace', 'f');
      if (p.F > 0) vec(g, cx, cy, p.Fmode === 'horizontal' ? 0 : t, p.F * K, 'ref', 'F');
      el('text', { x: x0 + 70, y: y0 - 10, 'class': 'ann', 'font-size': 18 }, g).textContent = 'θ';
      el('text', { x: 600, y: 40, 'class': 'ann', 'text-anchor': 'end', 'font-size': 17 }, g).textContent =
        res.dir === 'rest' ? 'se queda en reposo' : (res.a > 0 ? 'a plano arriba: ' : 'a plano abajo: ') + UI.fmt(Math.abs(res.a), 3) + ' m/s²';
      facts.innerHTML = '';
      [['mg sin θ', UI.fmt(mg * Math.sin(a), 4) + ' N'], ['mg cos θ', UI.fmt(mg * Math.cos(a), 4) + ' N'], ['normal N', UI.fmt(res.N, 4) + ' N'],
        ['ángulo crítico arctan μₛ', UI.fmt(critical(p.mus), 4) + '°'], ['|a|', UI.fmt(Math.abs(res.a), 4) + ' m/s²']]
        .forEach(function (x) { facts.appendChild(h('dt', {}, [x[0]])); facts.appendChild(h('dd', {}, [x[1]])); });
    }

    function drawCurve() {
      var R = r.get(), t = bank.get(), MU = mu.get(), b = banked(R, t, MU), a = t * RAD;
      var g = el('g', { 'class': 'sketch' }), cx = 300, cy = 250;   // (cx, cy): punto de apoyo del auto en el camino
      var ux = Math.cos(a), uy = -Math.sin(a);                           // dirección del camino hacia arriba del peralte
      el('path', { d: 'M' + (cx - 230 * ux) + ' ' + (cy - 230 * uy) + 'L' + (cx + 230 * ux) + ' ' + (cy + 230 * uy), 'class': 'axis', 'stroke-width': 3, fill: 'none' }, g);
      el('rect', { x: cx - 45, y: cy - 50, width: 90, height: 50, rx: 8, 'class': 'box-aux', transform: 'rotate(' + (-t) + ' ' + cx + ' ' + cy + ')' }, g);
      var gx = cx - 25 * Math.sin(a), gy = cy - 25 * Math.cos(a);        // centro del auto
      vec(g, gx, gy, 270, 80, 'error', null);
      el('text', { x: gx + 12, y: gy + 80, 'class': 'ann', 'font-size': 16 }, g).textContent = 'mg';
      vec(g, gx, gy, 90 + t, 100, 'aux', null);
      el('text', { x: gx - 100 * Math.sin(a) + 12, y: gy - 100 * Math.cos(a) - 4, 'class': 'ann', 'font-size': 16 }, g).textContent = 'N';
      if (MU > 0) {
        var fx0 = cx - 50 * ux, fy0 = cy - 50 * uy;
        vec(g, fx0, fy0, 180 + t, 60, 'trace', null);
        el('text', { x: fx0 - 40 * ux, y: fy0 - 40 * uy + 26, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 15 }, g).textContent = 'f (a v máx)';
      }
      vec(g, 200, 60, 180, 120, 'ref', null);
      el('text', { x: 140, y: 44, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 16 }, g).textContent = 'hacia el centro de la curva';
      el('text', { x: 600, y: 44, 'class': 'ann', 'text-anchor': 'end', 'font-size': 16 }, g).textContent = 'peralte ' + t + '°';
      facts.innerHTML = '';
      [['v sin fricción √(rg tan θ)', UI.fmt(b.ideal, 4) + ' m/s'], ['v máxima', isFinite(b.max) ? UI.fmt(b.max, 4) + ' m/s' : 'sin límite'], ['v mínima', UI.fmt(b.min, 4) + ' m/s'],
        ['v máx. en curva plana √(μgr)', UI.fmt(flatCurve(R, MU), 4) + ' m/s']]
        .forEach(function (x) { facts.appendChild(h('dt', {}, [x[0]])); facts.appendChild(h('dd', {}, [x[1]])); });
    }
    function draw() { svg.innerHTML = ''; if (isCurve()) drawCurve(); else drawPlane(); }

    function check() {
      var v = parseFloat(ans.input.value), k, msg;
      if (isCurve()) { k = diagnoseV(r.get(), bank.get(), mu.get(), v); msg = MSG_V[k]; }
      else { k = diagnoseA(pp(), v); msg = MSG_A[k]; }
      UI.verdict(verdict, k === 'ok' ? 'ok' : k === 'bad' ? 'bad' : 'warn', msg[0], msg[1]);
      checked = true;
      draw();
    }

    // Ejemplo cargado: un compañero intercambió seno y coseno.
    sync();
    ans.input.value = UI.fmt(Math.abs(slope(Object.assign(pp(), { th: 90 - pp().th })).a), 4);
    note.textContent = 'Ejemplo cargado: así respondió un compañero. ¿Ves el error? Cambia θ, la fricción o pasa a la curva peraltada.';
    check();
    document.addEventListener('cb:themechange', draw);
    return Promise.resolve();
  };
})();
