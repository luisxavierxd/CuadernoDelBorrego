/* =====================================================================
   Lab fbd-builder (§8.3): el alumno arma el diagrama de cuerpo libre.
   Para cada situación elige qué fuerzas actúan sobre el cuerpo y hacia dónde
   apuntan; el lab dice qué fuerzas faltan, cuáles sobran y cuáles tienen la
   dirección equivocada. Además compara la normal (o la tensión) y la
   aceleración del alumno contra la solución con ΣF = ma.
   Errores típicos: la "fuerza del movimiento", olvidar la fricción y usar
   N = mg cuando hay una fuerza inclinada o el elevador acelera.
   ===================================================================== */
(function () {
  var G = 9.81, RAD = Math.PI / 180;

  /* ------------------------- Matemática pura ------------------------- */
  var FORCES = {
    peso: 'Peso', normal: 'Normal', friccion: 'Fricción', tension: 'Tensión',
    aplicada: 'Fuerza aplicada', movimiento: 'Fuerza del movimiento'
  };
  var DIRS = {
    up: '↑ arriba', down: '↓ abajo', right: '→ derecha', left: '← izquierda',
    angUp: '↗ θ sobre la horizontal', angDown: '↘ θ bajo la horizontal',
    perp: '⟂ a la superficie, hacia afuera', alongUp: '∥ a la rampa, hacia arriba', alongDown: '∥ a la rampa, hacia abajo'
  };
  // Ángulo (grados, desde +x antihorario) de cada dirección en una situación.
  function dirAngle(key, p) {
    var th = p.th || 0, inc = p.inc || 0;
    return { up: 90, down: 270, right: 0, left: 180, angUp: th, angDown: 360 - th, perp: 90 + inc, alongUp: inc, alongDown: 180 + inc }[key];
  }
  function same(a, b) { var d = Math.abs(((a - b) % 360 + 360) % 360); return Math.min(d, 360 - d) < 1; }

  // Situaciones: fuerzas reales (clave, dirección, magnitud) y los valores que se piden.
  var SCENES = {
    empuje: {
      name: 'Caja empujada sobre un piso liso', ask: 'N', params: { m: 8, F: 30 },
      build: function (p) {
        var N = p.m * G;
        return { forces: [['peso', 'down', p.m * G], ['normal', 'up', N], ['aplicada', 'right', p.F]], N: N, a: p.F / p.m };
      }
    },
    jalon: {
      name: 'Caja jalada con una cuerda inclinada, con fricción', ask: 'N', params: { m: 10, F: 50, th: 30, mu: 0.3 },
      build: function (p) {
        var N = p.m * G - p.F * Math.sin(p.th * RAD), f = p.mu * N;
        return { forces: [['peso', 'down', p.m * G], ['normal', 'up', N], ['tension', 'angUp', p.F], ['friccion', 'left', f]], N: N, a: (p.F * Math.cos(p.th * RAD) - f) / p.m };
      }
    },
    empujeAbajo: {
      name: 'Caja empujada con un ángulo hacia abajo, con fricción', ask: 'N', params: { m: 10, F: 60, th: 30, mu: 0.25 },
      build: function (p) {
        var N = p.m * G + p.F * Math.sin(p.th * RAD), f = p.mu * N;
        return { forces: [['peso', 'down', p.m * G], ['normal', 'up', N], ['aplicada', 'angDown', p.F], ['friccion', 'left', f]], N: N, a: (p.F * Math.cos(p.th * RAD) - f) / p.m };
      }
    },
    elevador: {
      name: 'Persona en un elevador que acelera', ask: 'N', params: { m: 60, acc: 2 },
      build: function (p) {
        var N = p.m * (G + p.acc);
        return { forces: [['peso', 'down', p.m * G], ['normal', 'up', N]], N: N, a: p.acc };
      }
    },
    lampara: {
      name: 'Lámpara colgada de un cable', ask: 'T', params: { m: 4 },
      build: function (p) { return { forces: [['peso', 'down', p.m * G], ['tension', 'up', p.m * G]], N: p.m * G, a: 0 }; }
    },
    rampa: {
      name: 'Bloque en reposo sobre una rampa con fricción', ask: 'N', params: { m: 5, inc: 25 },
      build: function (p) {
        var N = p.m * G * Math.cos(p.inc * RAD);
        return { forces: [['peso', 'down', p.m * G], ['normal', 'perp', N], ['friccion', 'alongUp', p.m * G * Math.sin(p.inc * RAD)]], N: N, a: 0 };
      }
    }
  };

  function scene(id, p) { var s = SCENES[id]; return s.build(Object.assign({}, s.params, p || {})); }
  // Suma de las fuerzas reales por componentes.
  function net(id, p) {
    var q = Object.assign({}, SCENES[id].params, p || {}), sc = SCENES[id].build(q), x = 0, y = 0;
    sc.forces.forEach(function (f) { var a = dirAngle(f[1], q) * RAD; x += f[2] * Math.cos(a); y += f[2] * Math.sin(a); });
    return { x: x, y: y, mag: Math.hypot(x, y) };
  }
  // chosen: { clave: dirección } del alumno → qué falta, qué sobra y qué apunta mal.
  function checkFBD(id, p, chosen) {
    var q = Object.assign({}, SCENES[id].params, p || {}), sc = SCENES[id].build(q);
    var truth = {}, out = { missing: [], extra: [], wrongDir: [] };
    sc.forces.forEach(function (f) { truth[f[0]] = f[1]; });
    Object.keys(truth).forEach(function (k) {
      if (!(k in chosen)) out.missing.push(k);
      else if (!same(dirAngle(chosen[k], q), dirAngle(truth[k], q))) out.wrongDir.push(k);
    });
    Object.keys(chosen).forEach(function (k) { if (!(k in truth)) out.extra.push(k); });
    out.ok = !out.missing.length && !out.extra.length && !out.wrongDir.length;
    return out;
  }
  function close(a, b, tol) { return Math.abs(a - b) <= (tol || 0.01) * Math.max(Math.abs(b), 1e-9); }
  // La normal (o tensión) del alumno: correcta, mg cuando no toca, o con el signo de F sin θ al revés.
  function diagnoseN(id, p, s) {
    var q = Object.assign({}, SCENES[id].params, p || {}), sc = SCENES[id].build(q), mg = q.m * G;
    if (!isFinite(s)) return 'bad';
    if (close(s, sc.N)) return 'ok';
    if (close(s, mg) && !close(mg, sc.N)) return 'usedMg';
    if (q.F && q.th && close(s, 2 * mg - sc.N) && !close(2 * mg - sc.N, sc.N)) return 'wrongSign';
    return 'bad';
  }

  window.LabMath.forces = { G: G, FORCES: FORCES, DIRS: DIRS, SCENES: SCENES, dirAngle: dirAngle, scene: scene, net: net, checkFBD: checkFBD, diagnoseN: diagnoseN };

  /* ------------------------------ UI ------------------------------ */
  var NS = 'http://www.w3.org/2000/svg';
  var SLIDERS = {
    m: { label: 'Masa m', min: 1, max: 80, step: 1, unit: 'kg' },
    F: { label: 'Fuerza aplicada F', min: 5, max: 150, step: 5, unit: 'N' },
    th: { label: 'Ángulo θ de la fuerza', min: 10, max: 60, step: 5, unit: '°' },
    mu: { label: 'Coeficiente de fricción cinética μₖ', min: 0.1, max: 0.6, step: 0.05, unit: '' },
    acc: { label: 'Aceleración del elevador (+ hacia arriba)', min: -4, max: 4, step: 0.5, unit: 'm/s²' },
    inc: { label: 'Inclinación de la rampa', min: 10, max: 35, step: 5, unit: '°' }
  };
  var CLASS = { peso: 'error', normal: 'aux', friccion: 'trace', tension: 'ref', aplicada: 'ref', movimiento: 'student' };

  window.Labs['fbd-builder'] = function (mount, cfg) {
    var UI = window.LabUI, h = UI.h;
    var ids = Object.keys(SCENES), start = cfg.start || { scene: 'jalon' };
    var sel = UI.select({ label: 'Situación', options: ids.map(function (k) { return SCENES[k].name; }) });
    var sliderBox = h('div', {});
    var rows = {}, rowBox = h('fieldset', { class: 'fbd-forces' }, [h('legend', { class: 'lab-field__label' }, ['Fuerzas sobre el cuerpo y su dirección'])]);
    Object.keys(FORCES).forEach(function (k) {
      var cbId = UI.id('fz'), cb = h('input', { type: 'checkbox', id: cbId });
      var dir = h('select', { class: 'lab-input', 'aria-label': 'Dirección de ' + FORCES[k] }, Object.keys(DIRS).map(function (d) { return h('option', { value: d }, [DIRS[d]]); }));
      cb.addEventListener('change', function () { dir.disabled = !cb.checked; draw(null); });
      dir.addEventListener('change', function () { draw(null); });
      rows[k] = { cb: cb, dir: dir };
      rowBox.appendChild(h('div', { class: 'fbd-row' }, [h('label', { for: cbId, class: 'fbd-row__name' }, [cb, ' ' + FORCES[k]]), dir]));
    });
    var nIn = UI.input({ label: 'Tu N (N)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var aIn = UI.input({ label: 'Tu aceleración (m/s²)', type: 'number', step: 'any', inputmode: 'decimal', mono: false });
    var run = UI.button('Comprobar', 'primary', check);
    var note = h('p', { class: 'lab-note' });
    var verdict = h('div', { class: 'verdict', hidden: true, role: 'status' });
    var facts = h('dl', { class: 'lab-facts' });
    var svg = UI.svg(640, 400, 'Diagrama de cuerpo libre: tus fuerzas y, al comprobar, las que faltan');
    var sliders = {}, current = null, lastCheck = null;

    mount.appendChild(h('div', { class: 'lab-grid' }, [
      h('form', { class: 'lab-controls', novalidate: true }, [
        sel.node, sliderBox, rowBox, h('div', { class: 'lab-row' }, [nIn.node, aIn.node]),
        h('div', { class: 'lab-buttons' }, [run]), note, verdict
      ]),
      h('figure', { class: 'lab-board' }, [
        h('figcaption', { class: 'lab-board__title sheet__title' }, ['Tu diagrama de cuerpo libre']),
        svg,
        h('ul', { class: 'lab-legend' }, [
          h('li', {}, [h('i', { class: 'sw sw--error' }), 'peso']),
          h('li', {}, [h('i', { class: 'sw sw--aux' }), 'normal']),
          h('li', {}, [h('i', { class: 'sw sw--trace' }), 'fricción']),
          h('li', {}, [h('i', { class: 'sw sw--ref' }), 'tensión o aplicada']),
          h('li', {}, [h('i', { class: 'sw sw--student' }), 'falta o apunta mal'])
        ]),
        facts
      ])
    ]));
    mount.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); check(); });
    sel.input.addEventListener('change', function () { setScene(ids[+sel.input.value], true); });

    function params() { var p = {}; Object.keys(sliders).forEach(function (k) { p[k] = sliders[k].get(); }); return p; }
    function setScene(id, clear) {
      current = id; lastCheck = null; verdict.hidden = true;
      sel.input.value = String(ids.indexOf(id));
      sliderBox.innerHTML = ''; sliders = {};
      Object.keys(SCENES[id].params).forEach(function (k) {
        var o = SLIDERS[k];
        sliders[k] = UI.slider({ label: o.label, min: o.min, max: o.max, step: o.step, value: SCENES[id].params[k], unit: o.unit }, function () { if (lastCheck) check(); else draw(null); });
        sliderBox.appendChild(sliders[k].node);
      });
      nIn.node.querySelector('label').textContent = SCENES[id].ask === 'T' ? 'Tu T (N)' : 'Tu N (N)';
      if (clear) {
        Object.keys(rows).forEach(function (k) { rows[k].cb.checked = false; rows[k].dir.disabled = true; });
        nIn.input.value = ''; aIn.input.value = '';
        note.textContent = 'Marca las fuerzas que actúan sobre el cuerpo, elige su dirección y comprueba.';
      }
      draw(null);
    }
    function chosen() { var c = {}; Object.keys(rows).forEach(function (k) { if (rows[k].cb.checked) c[k] = rows[k].dir.value; }); return c; }

    function el(name, attrs, parent) {
      var n = document.createElementNS(NS, name);
      if (!UI.svgOk(attrs)) return n;
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(n);
      return n;
    }
    function arrow(g, x, y, ang, len, cls, label, dash) {
      var a = ang * RAD, ex = x + len * Math.cos(a), ey = y - len * Math.sin(a), hh = 12;
      var ux = Math.cos(a), uy = -Math.sin(a);
      el('path', { d: 'M' + x + ' ' + y + 'L' + ex + ' ' + ey + 'M' + (ex - hh * ux - hh * 0.55 * uy) + ' ' + (ey - hh * uy + hh * 0.55 * ux) + 'L' + ex + ' ' + ey + 'L' + (ex - hh * ux + hh * 0.55 * uy) + ' ' + (ey - hh * uy - hh * 0.55 * ux),
        'class': cls, fill: 'none', 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': dash || null }, g);
      if (label) el('text', { x: ex + 22 * ux, y: ey + 22 * uy + 5, 'class': 'ann', 'text-anchor': 'middle', 'font-size': 17 }, g).textContent = label;
    }

    // res: resultado de checkFBD (para marcar lo que falta o apunta mal) o null.
    function draw(res) {
      var p = Object.assign({}, SCENES[current].params, params()), sc = SCENES[current].build(p), inc = current === 'rampa' ? p.inc : 0;
      svg.innerHTML = '';
      var g = el('g', { 'class': 'sketch' }), cx = 320, cy = 210;
      if (current === 'lampara') {
        el('path', { d: 'M200 30H440M320 30V' + (cy - 40), 'class': 'axis', 'stroke-width': 2, fill: 'none' }, g);
      } else if (current === 'elevador') {
        el('rect', { x: 220, y: 60, width: 200, height: 250, 'class': 'axis', fill: 'none', 'stroke-width': 2 }, g);
      } else {
        var s = Math.tan(inc * RAD);
        el('path', { d: 'M40 ' + (cy + 40 + 280 * s) + 'L600 ' + (cy + 40 - 280 * s), 'class': 'axis', 'stroke-width': 2, fill: 'none' }, g);
      }
      el('rect', { x: cx - 40, y: cy - 40, width: 80, height: 80, rx: 6, 'class': 'box-aux', transform: 'rotate(' + (-inc) + ' ' + cx + ' ' + cy + ')' }, g);
      el('circle', { cx: cx, cy: cy, r: 4, 'class': 'dot-ref' }, g);

      var big = Math.max.apply(null, sc.forces.map(function (f) { return f[2]; })), c = chosen(), truth = {};
      sc.forces.forEach(function (f) { truth[f[0]] = f; });
      var len = function (k) { return truth[k] ? 75 + 80 * truth[k][2] / big : 95; };
      Object.keys(c).forEach(function (k) {
        var bad = res && (res.wrongDir.indexOf(k) >= 0 || res.extra.indexOf(k) >= 0);
        arrow(g, cx, cy, dirAngle(c[k], p), len(k), bad ? 'student' : CLASS[k], FORCES[k]);
      });
      if (res) {
        res.missing.concat(res.wrongDir).forEach(function (k) {
          arrow(g, cx, cy, dirAngle(truth[k][1], p), len(k), CLASS[k], (res.missing.indexOf(k) >= 0 ? 'falta: ' : 'va así: ') + FORCES[k], '8 7');
        });
      }
      facts.innerHTML = '';
      var rows2 = [['masa', p.m + ' kg'], ['peso mg', UI.fmt(p.m * G, 4) + ' N']];
      if (res) rows2.push([SCENES[current].ask === 'T' ? 'tensión real' : 'normal real', UI.fmt(sc.N, 4) + ' N'], ['aceleración real', UI.fmt(sc.a, 4) + ' m/s²']);
      rows2.forEach(function (r) { facts.appendChild(h('dt', {}, [r[0]])); facts.appendChild(h('dd', {}, [r[1]])); });
    }

    function names(list) { return list.map(function (k) { return FORCES[k].toLowerCase(); }).join(', '); }
    function check() {
      var p = Object.assign({}, SCENES[current].params, params()), sc = SCENES[current].build(p);
      var r = checkFBD(current, p, chosen()), parts = [];
      if (r.extra.length) parts.push('Sobra: ' + names(r.extra) + (r.extra.indexOf('movimiento') >= 0 ? ' (el movimiento no es una fuerza: toda fuerza la ejerce algo que toca o la gravedad).' : '.'));
      if (r.missing.length) parts.push('Falta: ' + names(r.missing) + '.');
      if (r.wrongDir.length) parts.push('Dirección equivocada: ' + names(r.wrongDir) + '.');
      var sN = parseFloat(nIn.input.value), sa = parseFloat(aIn.input.value), kN = diagnoseN(current, p, sN);
      var MSGN = {
        ok: 'Tu ' + SCENES[current].ask + ' está bien.',
        usedMg: 'Usaste N = mg, pero aquí la normal cambia: suma las fuerzas verticales (la componente vertical de la fuerza inclinada o la aceleración del elevador).',
        wrongSign: 'El término F sin θ va con el signo contrario: si la fuerza empuja hacia abajo, la normal aumenta; si jala hacia arriba, disminuye.',
        bad: 'Tu ' + SCENES[current].ask + ' no coincide: escribe ΣF_y = m a_y con tus fuerzas.'
      };
      parts.push(isFinite(sN) ? MSGN[kN] : 'Escribe tu ' + SCENES[current].ask + ' para compararla.');
      var aOk = isFinite(sa) && close(sa, sc.a, 0.01) || (isFinite(sa) && Math.abs(sc.a) < 1e-9 && Math.abs(sa) < 0.01);
      if (isFinite(sa)) parts.push(aOk ? 'Tu aceleración está bien.' : 'Tu aceleración no coincide: a = ΣF_x / m (o ΣF_y / m).');
      var all = r.ok && kN === 'ok' && aOk;
      var kind = all ? 'ok' : (r.ok || kN === 'ok') ? 'warn' : 'bad';
      UI.verdict(verdict, kind, all ? 'Tu diagrama y tus números coinciden' : r.ok ? 'Tu diagrama está completo' : 'Revisa tu diagrama', parts.join(' '));
      lastCheck = r;
      draw(r);
    }

    // Ejemplo cargado: un compañero agregó la "fuerza del movimiento", olvidó la fricción y usó N = mg.
    setScene(start.scene || 'jalon', true);
    if ((start.scene || 'jalon') === 'jalon') {
      [['peso', 'down'], ['normal', 'up'], ['tension', 'angUp'], ['movimiento', 'right']].forEach(function (x) { rows[x[0]].cb.checked = true; rows[x[0]].dir.disabled = false; rows[x[0]].dir.value = x[1]; });
      nIn.input.value = UI.fmt(params().m * G, 4);
      note.textContent = 'Ejemplo cargado: así armó su diagrama un compañero. ¿Qué le falta y qué le sobra? Luego prueba las otras situaciones.';
      check();
    }
    document.addEventListener('cb:themechange', function () { draw(lastCheck); });
    return Promise.resolve();
  };
})();
