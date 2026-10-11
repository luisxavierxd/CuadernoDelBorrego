/* =====================================================================
   Lab induction (Física 2 · S01): inducción y polarización.
   Una esfera (metálica o de plástico) y una barra cargada que se acerca y se
   retira; la esfera se puede conectar a tierra. El alumno predice el signo final
   y cuántos electrones le sobran o le faltan (n = |Q|/e) para una secuencia, y el
   lab la reproduce paso a paso y da el «casi» con los errores típicos.
   Modelo: la barra actúa como carga puntual q a una distancia d del centro de una
   esfera de radio a; conectada a tierra, la esfera queda con Q = −q·a/d (carga
   imagen: potencial cero en toda su superficie).
   ===================================================================== */
(function () {
  var E = 1.60e-19, ME = 9.11e-31;

  /* ------------------------- Matemática pura ------------------------- */
  // Número de electrones que forman una carga Q (en coulombs): n = |Q|/e.
  function count(Q) { return Math.abs(Q) / E; }
  // Carga de n electrones de más (sign = −1) o de menos (sign = +1).
  function charge(n, sign) { return (sign == null ? 1 : sign) * n * E; }
  // ¿Q es un múltiplo entero de e? Con n enorme la diferencia ya no se puede medir.
  function isMultiple(Q, tol) {
    var n = Q / E;
    return Math.abs(n - Math.round(n)) <= (tol || 1e-6) * Math.max(1, Math.abs(n));
  }
  // Frotar: n electrones pasan de un material a otro. La carga total no cambia.
  function rub(n) {
    var gainer = -n * E, loser = n * E;
    return { gainer: gainer, loser: loser, total: gainer + loser, mass: n * ME };
  }
  function massGain(n) { return n * ME; }
  // Dos esferas conductoras idénticas que se tocan se reparten la carga total.
  function contact(q1, q2) { return (q1 + q2) / 2; }
  // Secuencia de contactos: pairs = [[i, j], …] sobre las cargas qs. Devuelve las cargas finales.
  function contactSeq(qs, pairs) {
    var q = qs.slice();
    (pairs || []).forEach(function (p) { var m = contact(q[p[0]], q[p[1]]); q[p[0]] = m; q[p[1]] = m; });
    return q;
  }
  // Varias esferas idénticas que se tocan a la vez.
  function contactAll(qs) {
    var t = qs.reduce(function (s, x) { return s + x; }, 0);
    return qs.map(function () { return t / qs.length; });
  }
  // Carga de la esfera conectada a tierra con la barra (carga qRod) a distancia d del centro.
  function induced(qRod, a, d) { return -qRod * a / d; }

  // Secuencia de inducción. o = { q0, qRod, a, d, steps: ['near' | 'ground' | 'unground' | 'remove'] }.
  // Devuelve la carga final Q, cuánta pasó por la tierra en total (neta) y n = |Q|/e.
  function sequence(o) {
    var near = false, grounded = false, Q = o.q0 || 0, everGrounded = false, q0 = o.q0 || 0;
    var ind = induced(o.qRod, o.a, o.d);
    (o.steps || []).forEach(function (s) {
      if (s === 'near') { near = true; if (grounded) Q = ind; }
      else if (s === 'remove') { near = false; if (grounded) Q = 0; }
      else if (s === 'ground') { grounded = true; everGrounded = true; Q = near ? ind : 0; }
      else if (s === 'unground') grounded = false;
    });
    return { Q: Q, n: count(Q), sign: sgn(Q), moved: count(Q - q0), near: near, grounded: grounded, everGrounded: everGrounded };
  }
  function sgn(Q) { return Math.abs(Q) < 1e-30 ? 0 : Q > 0 ? 1 : -1; }
  function close(a, b, tol) { return Math.abs(a - b) <= (tol || 0.01) * Math.max(Math.abs(b), 1e-30); }

  // Diagnóstico de la predicción del alumno. res = sequence(…); guess = { sign: 1 | −1 | 0, n }.
  function diagnose(res, guess) {
    var s = sgn(res.Q), n = count(res.Q), gn = guess.n;
    if (s === 0) {
      if (guess.sign !== 0) return res.everGrounded ? 'groundReturned' : 'noGround';
      return (gn == null || !isFinite(gn) || Math.abs(gn) < 0.5) ? 'ok' : 'neutralCount';
    }
    if (guess.sign === 0) return 'forgotGround';
    if (guess.sign !== s) return 'signFlip';
    if (!isFinite(gn)) return 'countOff';
    gn = Math.abs(gn);
    if (close(gn, n)) return 'ok';
    var Qa = Math.abs(res.Q);
    if (close(gn, Qa) || close(gn, Qa * 1e9)) return 'chargeNotCount';
    if (close(gn, Qa * E)) return 'timesE';
    if (close(gn, n * 1e9) || close(gn, n * 1e-9)) return 'prefix';
    return 'countOff';
  }

  window.LabMath.induction = {
    E: E, ME: ME, count: count, charge: charge, isMultiple: isMultiple, rub: rub, massGain: massGain,
    contact: contact, contactSeq: contactSeq, contactAll: contactAll, induced: induced, sequence: sequence, diagnose: diagnose
  };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var A = 6;                                   // radio de la esfera (cm)
  var CX = 430, CY = 175, RP = 66;             // esfera en el lienzo (px)
  var PX = 10;                                  // px por cm
  var STEP_TXT = { near: 'Acercas la barra a la esfera.', ground: 'Conectas la esfera a tierra.', unground: 'Desconectas la tierra.', remove: 'Retiras la barra.' };
  var VARIANTS = [
    ['near', 'ground', 'unground', 'remove'], ['near', 'ground', 'unground', 'remove'],
    ['ground', 'near', 'unground', 'remove'], ['near', 'ground', 'remove', 'unground'],
    ['near', 'ground', 'unground'], ['near', 'remove']
  ];
  var QG = [1.6, 2.4, 3.2, 4.0, 4.8];          // |Q| con tierra (nC); con q = 8 nC y a = 6 cm, d = 48/|Q| cm
  var MSG = {
    ok: ['Tu predicción coincide', ''],
    signFlip: ['Signo invertido', 'La carga que se queda es la que la barra atrajo: opuesta a la de la barra. Con barra positiva, la tierra manda electrones y la esfera termina negativa; con barra negativa, la tierra se los lleva y termina positiva.'],
    forgotGround: ['La tierra sí cambió la carga', 'Con la barra cerca y la tierra conectada entraron (o salieron) electrones. Al desconectar la tierra antes de retirar la barra, ya no pueden regresar: la esfera no termina neutra.'],
    groundReturned: ['Los electrones regresaron', 'Retiraste la barra con la tierra todavía conectada: sin la barra nada retiene esa carga y la tierra la devuelve. La esfera termina neutra (n = 0).'],
    noGround: ['Sin tierra no entra ni sale carga', 'Solo hubo polarización: los electrones se acomodaron dentro de la esfera, pero el total no cambió. Termina neutra (n = 0).'],
    neutralCount: ['El signo está bien, pero…', 'Si la esfera termina neutra no le sobran ni le faltan electrones: n = 0.'],
    chargeNotCount: ['Escribiste la carga, no el número de electrones', 'Confundiste e con 1: el número de electrones es n = |Q|/e, con Q en coulombs y e = 1.60 × 10⁻¹⁹ C.'],
    timesE: ['Multiplicaste por e', 'Para pasar de carga a número de electrones se divide: n = |Q|/e.'],
    prefix: ['Revisa el prefijo', 'Te sobra o te falta un factor de 10⁹: 1 nC = 10⁻⁹ C.'],
    countOff: ['El signo está bien; el número de electrones no', 'Usa n = |Q|/e con Q en coulombs (1 nC = 10⁻⁹ C) y e = 1.60 × 10⁻¹⁹ C.'],
    bad: ['Revisa tu predicción', 'Escribe el signo y el número de electrones.']
  };
  var KIND = { ok: 'ok', signFlip: 'warn', chargeNotCount: 'warn', timesE: 'warn', prefix: 'warn', neutralCount: 'warn' };
  var SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
  function sci(n) {
    if (!isFinite(n)) return '—';
    if (Math.abs(n) < 0.5) return '0';
    var ex = Math.floor(Math.log10(Math.abs(n))), m = n / Math.pow(10, ex);
    if (Math.abs(m) >= 9.995) { m /= 10; ex += 1; }
    return m.toFixed(2) + ' × 10' + String(ex).split('').map(function (c) { return SUP[c] || c; }).join('');
  }
  function nc(Q) { var v = Q * 1e9; return (Math.abs(v) < 0.005 ? '0' : (v > 0 ? '+' : '−') + Math.abs(v).toFixed(2)) + ' nC'; }
  function parseN(s) {
    if (window.CBExercises && window.CBExercises.parseNumber) return window.CBExercises.parseNumber(s);
    return parseFloat(String(s).replace(/\s+/g, '').replace(/[×x]10\^?\(?(−|-)?(\d+)\)?/, function (m, sg, d) { return 'e' + (sg ? '-' : '') + d; }));
  }

  window.Labs.induction = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var start = cfg.start || {};
    var st = { mode: 'conductor', sign: 1, near: true, grounded: false, Q: 0, flow: 0 };
    var playing = false, timers = [];

    var material = UI.select({ label: 'Material de la esfera', options: ['Conductor (metal)', 'Aislante (plástico)'] });
    var signSel = UI.select({ label: 'Signo de la barra', options: ['Positiva (+)', 'Negativa (−)'] });
    var qS = UI.slider({ label: 'Carga de la barra', min: 4, max: 12, step: 2, value: start.q || 8, unit: 'nC' }, onChange);
    var dS = UI.slider({ label: 'Distancia al centro', min: 9, max: 30, step: 1, value: start.d || 15, unit: 'cm' }, onChange);
    var bGround = UI.button('Conectar a tierra', 'primary', function () { if (!playing) { act('ground-toggle'); } });
    var bRod = UI.button('Retirar barra', 'ghost', function () { if (!playing) { act('rod-toggle'); } });
    var bReset = UI.button('Reiniciar', 'ghost', function () { if (!playing) { reset(); draw(); } });
    var note = h('p', { class: 'lab-note', role: 'status' });

    // Reto
    var chal = null;
    var chalText = h('p', { class: 'lab-note' });
    var chalList = h('ol', { class: 'lab-list' });
    var guessSign = UI.select({ label: 'Tu signo final', options: ['Positiva', 'Negativa', 'Neutra'] });
    var guessN = UI.input({ label: 'Electrones de más o de menos al final (n)', type: 'text', inputmode: 'decimal', hint: 'Notación científica: <code>1.5e10</code> o <code>1.5×10^10</code>. Si queda neutra, escribe 0.' });
    var bCheck = UI.button('Comprobar', 'primary', check);
    var bNew = UI.button('Otro reto', 'ghost', function () { if (!playing) { newChallenge(); } });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });

    var facts = h('dl', { class: 'lab-facts' });
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 30 640 318');
    svg.setAttribute('class', 'lab-stage lab-plot');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Una barra cargada frente a una esfera; se ven las cargas que se acomodan en la superficie y el cable a tierra.');
    var legend = h('ul', { class: 'lab-legend' }, [
      h('li', {}, [h('i', { class: 'sw sw--error' }), 'carga +']),
      h('li', {}, [h('i', { class: 'sw sw--aux' }), 'carga − (electrones)']),
      h('li', {}, [h('i', { class: 'sw sw--trace' }), 'fuerza sobre la esfera'])
    ]);

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        material.node, signSel.node, qS.node, dS.node,
        h('div', { class: 'lab-buttons' }, [bGround, bRod, bReset]), note,
        h('p', { class: 'lab-field__label' }, ['Reto: predice el final']), chalText, chalList,
        guessSign.node, guessN.node,
        h('div', { class: 'lab-buttons' }, [bCheck, bNew]), verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['La esfera y la barra']),
        svg, legend, facts
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    material.input.addEventListener('change', function () { if (!playing) { st.mode = material.input.value === '1' ? 'insulator' : 'conductor'; st.Q = 0; st.flow = 0; draw(); say(st.mode === 'insulator' ? 'Esfera nueva, neutra. En un aislante los electrones no viajan por el material: cada molécula solo se estira y gira (se polariza).' : 'Esfera nueva, neutra. En el metal los electrones viajan libres por toda la esfera.'); } });
    signSel.input.addEventListener('change', function () { st.sign = signSel.input.value === '1' ? -1 : 1; onChange(); });
    guessN.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });

    function qRod() { return st.sign * qS.get() * 1e-9; }
    function ind() { return induced(qRod(), A, dS.get()); }
    function say(t) { note.textContent = t; }
    function flowText(dq) {
      if (Math.abs(dq) < 1e-15) return '';
      return (dq < 0 ? 'Subieron ' : 'Bajaron ') + sci(count(dq)) + ' electrones por el cable a tierra.';
    }
    // Lleva la esfera al valor que impone la tierra (solo en metal) y anota cuánto pasó por el cable.
    function settle() {
      if (st.mode !== 'conductor' || !st.grounded) { st.flow = 0; return ''; }
      var target = st.near ? ind() : 0, dq = target - st.Q;
      st.flow = dq; st.Q = target;
      return flowText(dq);
    }
    function act(what) {
      var msg = '';
      if (what === 'ground-toggle' || what === 'ground' || what === 'unground') {
        st.grounded = what === 'ground' ? true : what === 'unground' ? false : !st.grounded;
        if (st.grounded) msg = st.mode === 'conductor' ? (settle() || 'Conectada a tierra: no pasó carga (no hay nada que atraiga o repela electrones).') : 'En el plástico los electrones no pueden viajar hasta el cable: la tierra no cambia nada.';
        else { st.flow = 0; msg = 'Tierra desconectada: la carga de la esfera ya no puede cambiar.'; }
      } else if (what === 'rod-toggle' || what === 'near' || what === 'remove') {
        st.near = what === 'near' ? true : what === 'remove' ? false : !st.near;
        msg = settle() || (st.near ? 'Barra cerca: la esfera se polariza.' : 'Barra retirada.');
      }
      draw(); say(msg);
    }
    function onChange() {
      if (playing) return;
      var m = settle();
      draw(); if (m) say(m);
    }
    function reset() { st.near = true; st.grounded = false; st.Q = 0; st.flow = 0; say('Esfera neutra y barra cerca.'); }

    /* ---------- Dibujo ---------- */
    function el(name, attrs, parent, txt) {
      if (!UI.svgOk(attrs)) return document.createElementNS(NS, name);
      var n = document.createElementNS(NS, name);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      if (txt != null) n.textContent = txt;
      (parent || svg).appendChild(n);
      return n;
    }
    function chg(g, x, y, s, r) {
      el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: r, 'class': s > 0 ? 'box-err' : 'box-aux' }, g);
      el('text', { x: x.toFixed(1), y: (y + r * 0.45).toFixed(1), 'class': 'ann', 'text-anchor': 'middle', 'font-size': Math.floor(r * 1.4) }, g, s > 0 ? '+' : '−');
    }
    // k cargas de signo s repartidas en un arco centrado en el ángulo c (grados, 0 = derecha), con paso fijo.
    function arcCharges(g, k, s, c) {
      if (k <= 0) return;
      var stepA = 28, r = RP - 16;
      for (var i = 0; i < k; i++) {
        var a = (c + (i - (k - 1) / 2) * stepA) * Math.PI / 180;
        chg(g, CX + r * Math.cos(a), CY - r * Math.sin(a), s, 11);
      }
    }
    function draw() {
      svg.innerHTML = '';
      var g = el('g', { 'class': 'sketch' });
      var d = dS.get(), tip = CX - d * PX, rodSign = st.sign, u = qS.get() * 1e-9 / 12;
      // Barra
      if (st.near) {
        var x0 = Math.max(16, tip - 190);
        el('rect', { x: x0, y: CY - 15, width: tip - x0, height: 30, rx: 6, 'class': rodSign > 0 ? 'box-err' : 'box-aux' }, g);
        var nb = Math.max(1, Math.floor((tip - x0 - 10) / 26));
        for (var i = 0; i < nb; i++) el('text', { x: (tip - 14 - i * 26).toFixed(1), y: CY + 7, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 20 }, g, rodSign > 0 ? '+' : '−');
        el('text', { x: ((x0 + tip) / 2).toFixed(1), y: CY + 44, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 21 }, g, 'barra ' + (rodSign > 0 ? '+' : '−') + qS.get() + ' nC');
        // Cota de d (de la punta de la barra al centro)
        el('path', { d: 'M' + tip.toFixed(1) + ' 84V100M' + CX + ' 84V100M' + tip.toFixed(1) + ' 92H' + CX, 'class': 'axis', 'stroke-width': 1.3, fill: 'none' }, g);
        el('text', { x: ((tip + CX) / 2).toFixed(1), y: 78, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 21 }, g, 'd = ' + d + ' cm');
      } else {
        el('text', { x: 130, y: CY + 6, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 21 }, g, '(barra retirada)');
      }
      // Cable y tierra
      var wy0 = CY + RP, gy = 318;
      if (st.grounded) el('path', { d: 'M' + CX + ' ' + wy0 + 'V' + gy, 'class': 'ref', 'stroke-width': 2.5, fill: 'none' }, g);
      else el('path', { d: 'M' + CX + ' ' + wy0 + 'V' + (wy0 + 22) + 'M' + CX + ' ' + (gy - 22) + 'V' + gy + 'M' + CX + ' ' + (gy - 22) + 'L' + (CX + 16) + ' ' + (gy - 40), 'class': 'ref', 'stroke-width': 2.5, fill: 'none' }, g);
      el('path', { d: 'M' + (CX - 22) + ' ' + gy + 'H' + (CX + 22) + 'M' + (CX - 14) + ' ' + (gy + 8) + 'H' + (CX + 14) + 'M' + (CX - 6) + ' ' + (gy + 16) + 'H' + (CX + 6), 'class': 'axis', 'stroke-width': 2.5, fill: 'none' }, g);
      el('text', { x: CX - 34, y: gy + 12, 'class': 'ann', 'text-anchor': 'end', 'font-size': 21 }, g, st.grounded ? 'tierra (conectada)' : 'tierra (desconectada)');
      if (st.grounded && Math.abs(st.flow) > 1e-15) {
        var up = st.flow < 0, ax = CX + 22;
        el('path', { d: up ? 'M' + ax + ' 294V256M' + (ax - 6) + ' 266L' + ax + ' 256L' + (ax + 6) + ' 266' : 'M' + ax + ' 256V294M' + (ax - 6) + ' 284L' + ax + ' 294L' + (ax + 6) + ' 284', 'class': 'aux', 'stroke-width': 2.5, fill: 'none', 'stroke-linecap': 'round' }, g);
        el('text', { x: ax + 12, y: 281, 'class': 'ann', 'font-size': 21 }, g, up ? 'e⁻ suben' : 'e⁻ bajan');
      }
      // Esfera
      el('circle', { cx: CX, cy: CY, r: RP, 'class': st.mode === 'conductor' ? 'ref' : 'axis', 'stroke-width': 3, fill: 'none' }, g);
      var p = st.near ? Math.min(1, 2.2 * A / d) : 0;   // qué tanto se polariza
      if (st.mode === 'conductor') {
        var m = st.near ? Math.round(12 * A / d) : 0, e = Math.round(st.Q / u);
        var nearSign = -rodSign, nearK = m, farK = m;
        if (e !== 0) {
          if (Math.sign(e) === nearSign) { farK -= Math.abs(e); if (farK < 0) { nearK += -farK; farK = 0; } }
          else { nearK -= Math.abs(e); if (nearK < 0) { farK += -nearK; nearK = 0; } }
        }
        if (st.near) {
          arcCharges(g, Math.min(nearK, 6), nearSign, 180);
          arcCharges(g, Math.min(farK, 6), -nearSign, 0);
        } else if (e !== 0) {
          var k = Math.min(Math.abs(e), 10), r = RP - 16;
          for (var j = 0; j < k; j++) { var a = (90 + j * 360 / k) * Math.PI / 180; chg(g, CX + r * Math.cos(a), CY - r * Math.sin(a), Math.sign(e), 11); }
        } else {
          el('text', { x: CX, y: CY + 6, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 21 }, g, 'neutra');
        }
      } else {
        // Moléculas del plástico: dipolos que giran hacia la barra.
        var spots = [[-30, -26, 40], [8, -34, 130], [36, -6, 250], [-38, 10, 300], [-4, 2, 70], [26, 30, 200], [-14, 36, 160]];
        spots.forEach(function (s) {
          var x = CX + s[0], y = CY + s[1], want = rodSign > 0 ? 180 : 0;   // el extremo − mira a la barra +
          var dA = ((want - s[2] + 540) % 360) - 180, ang = (s[2] + p * dA) * Math.PI / 180;
          var L = 9 + 3 * p, ux = Math.cos(ang), uy = -Math.sin(ang);
          el('ellipse', { cx: x.toFixed(1), cy: y.toFixed(1), rx: (L + 5).toFixed(1), ry: 6, transform: 'rotate(' + (-ang * 180 / Math.PI).toFixed(1) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')', 'class': 'axis', 'stroke-width': 1.3, fill: 'none' }, g);
          el('circle', { cx: (x + ux * L).toFixed(1), cy: (y + uy * L).toFixed(1), r: 3.6, 'class': 'dot-aux' }, g);
          el('circle', { cx: (x - ux * L).toFixed(1), cy: (y - uy * L).toFixed(1), r: 3.6, 'class': 'dot-error' }, g);
        });
      }
      // Atracción: la esfera polarizada (o cargada con signo opuesto) se jala hacia la barra.
      if (st.near) {
        var net = st.mode === 'conductor' ? st.Q : 0;
        var pull = p * 50 - Math.sign(net) * rodSign * Math.min(30, Math.abs(net / u) * 4);
        if (pull < -4) {
          var L0 = -pull + 10, xe = CX + 34;
          el('path', { d: 'M' + (xe - L0).toFixed(1) + ' 54H' + xe + 'M' + (xe - 10) + ' 47L' + xe + ' 54L' + (xe - 10) + ' 61', 'class': 'trace', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
          el('text', { x: CX + 44, y: 60, 'class': 'ann', 'font-size': 21 }, g, 'repulsión');
        } else if (pull > 4) {
          el('path', { d: 'M' + (CX + 34) + ' 54H' + (CX + 34 - pull - 10).toFixed(1) + 'M' + (CX + 34 - pull).toFixed(1) + ' 47L' + (CX + 34 - pull - 10).toFixed(1) + ' 54L' + (CX + 34 - pull).toFixed(1) + ' 61', 'class': 'trace', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
          el('text', { x: CX + 44, y: 60, 'class': 'ann', 'font-size': 21 }, g, 'atracción');
        }
      }
      // Lecturas
      facts.innerHTML = '';
      var n = count(st.Q);
      [['carga neta de la esfera', st.mode === 'conductor' ? nc(st.Q) : '0 nC (solo se polariza)'],
       ['electrones', st.mode === 'conductor' && n > 0.5 ? sci(n) + (st.Q < 0 ? ' de más' : ' de menos') : 'ni de más ni de menos'],
       ['estado', (st.near ? 'barra cerca' : 'barra retirada') + ' · ' + (st.grounded ? 'con tierra' : 'sin tierra')]]
        .forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
      bGround.textContent = st.grounded ? 'Desconectar tierra' : 'Conectar a tierra';
      bRod.textContent = st.near ? 'Retirar barra' : 'Acercar barra';
    }

    /* ---------- Reto ---------- */
    function newChallenge(fixed) {
      var c = fixed || {
        sign: Math.random() < 0.5 ? 1 : -1,
        Qg: QG[Math.floor(Math.random() * QG.length)],
        steps: VARIANTS[Math.floor(Math.random() * VARIANTS.length)]
      };
      chal = c;
      chalText.textContent = 'Esfera de metal neutra y barra ' + (c.sign > 0 ? 'positiva' : 'negativa') + ' de 8 nC. Dato: con la barra cerca y la tierra conectada, la esfera llega a |Q| = ' + c.Qg.toFixed(1) + ' nC. Con e = 1.60 × 10⁻¹⁹ C, ¿cómo termina después de esta secuencia?';
      chalList.innerHTML = '';
      c.steps.forEach(function (s) { chalList.appendChild(h('li', {}, [STEP_TXT[s]])); });
      verdict.hidden = true;
      guessN.input.value = '';
    }
    function chalParams() { return { q0: 0, qRod: chal.sign * 8e-9, a: A, d: 48 / chal.Qg, steps: chal.steps }; }
    function check() {
      if (playing || !chal) return;
      var gi = guessSign.input.value, gs = gi === '0' ? 1 : gi === '1' ? -1 : 0;
      var raw = guessN.input.value.trim(), gn = raw === '' ? (gs === 0 ? 0 : NaN) : parseN(raw);
      var res = sequence(chalParams());
      var key = diagnose(res, { sign: gs, n: gn });
      // Reproduce la secuencia en el dibujo.
      st.mode = 'conductor'; material.input.value = '0';
      st.sign = chal.sign; signSel.input.value = chal.sign > 0 ? '0' : '1';
      qS.set(8); dS.set(48 / chal.Qg);
      st.near = false; st.grounded = false; st.Q = 0; st.flow = 0;
      var items = chalList.children;
      function mark(i) { Array.prototype.forEach.call(items, function (li, j) { if (j === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); li.style.fontWeight = j === i ? '600' : ''; }); }
      function finish() {
        playing = false; mark(-1);
        var msg = MSG[key] || MSG.bad, kind = KIND[key] || 'bad';
        var real = res.sign === 0 ? 'Termina neutra: n = 0.' : 'Termina ' + (res.sign > 0 ? 'positiva' : 'negativa') + ' con ' + sci(res.n) + ' electrones ' + (res.sign < 0 ? 'de más' : 'de menos') + ' (Q = ' + nc(res.Q) + ').';
        UI.verdict(verdict, kind, msg[0], (msg[1] ? msg[1] + ' ' : '') + real);
      }
      var anim = window.CBAnim && window.CBAnim.canAnimate();
      if (!anim) { chal.steps.forEach(function (s) { act(s); }); finish(); return; }
      playing = true; draw(); say('Reproduciendo la secuencia…');
      chal.steps.forEach(function (s, i) {
        timers.push(setTimeout(function () { mark(i); act(s); }, 700 * (i + 1)));
      });
      timers.push(setTimeout(finish, 700 * (chal.steps.length + 1)));
    }

    // Ejemplo cargado: la respuesta de un compañero con el signo invertido.
    newChallenge({ sign: 1, Qg: 3.2, steps: VARIANTS[0] });
    guessSign.input.value = '0';
    guessN.input.value = '2e10';
    reset();
    say('Ejemplo cargado: así respondió un compañero el reto. ¿Ves su error? Presiona Comprobar para ver la secuencia, o mueve la barra y conecta la tierra tú mismo.');
    draw();
    return Promise.resolve();
  };
})();
