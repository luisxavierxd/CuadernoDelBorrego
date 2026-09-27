#!/usr/bin/env node
// Flujo de la página del examen (quiz/examen/): lanzador → intento → entregar → revisión
// desde el historial. También revisa que los calificadores (LM.derivative, LM.implicit,
// LM.antiderivative) estén cargados y que recargar a media prueba cancele el intento.
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');
const cdn = require('./lib/cdn-cache');

const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
function serve() {
  const server = http.createServer((req, res) => {
    let file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

let fails = 0;
function ok(cond, msg) { if (cond) console.log('  ✓ ' + msg); else { fails++; console.log('  ✗ ' + msg); } }

(async () => {
  const server = await serve();
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch();
  const errors = [];
  try {
    for (const width of [1280, 390]) {
      console.log('Ancho ' + width + ' px');
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      await cdn.attach(ctx);
      const page = await ctx.newPage();
      await page.clock.install();
      // Chromium de Playwright aborta la transición entre documentos (@view-transition) en
      // cualquier clic que navega y lo reporta como error de página; no viene del sitio.
      page.on('pageerror', (e) => { if (!/ViewTransition opt-in disabled/.test(e.message)) errors.push(width + ' ' + e.message + ' @ ' + page.url()); });
      page.on('console', (m) => { if (m.type() === 'error') errors.push(width + ' consola: ' + m.text() + ' @ ' + page.url()); });

      // 1. Lanzador: personalizado con revisión inmediata, S05 (regla de la cadena) y S07.
      await page.goto(base + '/quiz/?curso=c1&modo=personalizado&tags=c1.S05,c1.S07');
      await page.waitForSelector('.launcher');
      const fields = page.locator('.launcher__options input[type=number]');
      await fields.nth(0).fill('6');
      await fields.nth(1).fill('1');
      await fields.nth(2).fill('10');
      await page.locator('.launcher__options select').selectOption('1');
      await page.getByRole('button', { name: 'Empezar' }).click();
      await page.waitForURL(/\/quiz\/examen\/$/);
      await page.waitForSelector('.qcard', { timeout: 30000 });
      ok(await page.locator('.exam__topics-box .exam__topics li').count() === 2, 'el temario lista los 2 temas');
      ok(await page.locator('.exam__side > .clock').evaluate((n) => n === n.parentNode.firstElementChild), 'el reloj va hasta arriba de su caja');
      ok(await page.locator('.qcard').count() === 6, '6 preguntas cortas');
      ok(await page.locator('.problem').count() === 1, '1 problema');

      // 2. Los calificadores están cargados (antes: "LM.derivative is undefined").
      const graders = await page.evaluate(() => {
        const LM = window.LabMath || {};
        const out = { derivative: !!LM.derivative, implicit: !!LM.implicit, antiderivative: !!LM.antiderivative, bad: [] };
        ['S02', 'S05', 'S06', 'S11'].forEach((s) => {
          const bank = (window.CB_BANK.c1 || {})[s];
          (bank ? bank.questions || bank : []).forEach((q) => {
            if (q.type !== 'expr' && q.type !== 'math') return;
            const v = window.CBExercises.instance(q);
            const r = window.CBQuiz.grade(q, v, 'x^2+1', { math: window.math });
            if (r.say && /undefined|can't access|is not/.test(r.say)) out.bad.push(q.id + ': ' + r.say);
          });
        });
        return out;
      });
      ok(graders.derivative && graders.implicit && graders.antiderivative, 'LM.derivative, LM.implicit y LM.antiderivative cargados');
      ok(!graders.bad.length, 'ninguna pregunta de expresión falla por un calificador ausente' + (graders.bad.length ? ': ' + graders.bad.slice(0, 3).join(' | ') : ''));

      // 3. Revisión inmediata: contestar la primera de opción múltiple y revisarla.
      const choice = page.locator('.qcard:has(.exercise__options)').first();
      let answered = false;
      if (await choice.count()) {
        answered = true;
        await choice.locator('.exercise__option label').first().click();
        await choice.getByRole('button', { name: 'Revisar' }).click();
        ok(await choice.locator('.verdict:not([hidden])').count() === 1, 'revisar al contestar muestra el veredicto');
        const bad = await choice.evaluate((n) => n.classList.contains('is-bad') || n.classList.contains('is-partial'));
        if (bad) ok(await choice.locator('.qcard__right:not([hidden])').count() === 1, 'si falla, muestra la respuesta correcta');
      }

      // 3b. Avisos del reloj (10 min): a los 5 minutos restantes y a un cuarto (2.5 min).
      await page.clock.runFor(5 * 60 * 1000);
      ok(/Quedan 5 minutos/.test(await page.locator('.time-toast').textContent().catch(() => '')), 'aviso arriba: quedan 5 minutos');
      await page.clock.runFor(150 * 1000);
      ok(/un cuarto/.test(await page.locator('.time-toast').textContent().catch(() => '')), 'aviso arriba: queda un cuarto del tiempo');
      await page.locator('.time-toast__close').click();
      ok(await page.locator('.time-toast').count() === 0, 'el aviso se cierra');
      // Apagar el reloj pide confirmación.
      await page.locator('.clock').getByRole('button', { name: 'Apagar reloj' }).click();
      ok(await page.locator('.clock .confirm').count() === 1, 'apagar el reloj pide confirmación');
      await page.locator('.clock .confirm').getByRole('button', { name: 'Cancelar', exact: true }).click();
      ok(!(await page.locator('.clock').evaluate((n) => n.classList.contains('is-off'))), 'cancelar deja el reloj encendido');

      // 4. Salir pide confirmación; Cancelar mantiene el intento.
      await page.locator('.exam__actions').getByRole('button', { name: 'Salir' }).click();
      ok(await page.locator('.exam__actions .confirm').count() === 1, 'Salir pide confirmación');
      await page.locator('.exam__actions .confirm').getByRole('button', { name: 'Cancelar', exact: true }).click();

      // 5. Entregar (con preguntas sin contestar) → resultados arriba, semáforo y correctas.
      await page.locator('.exam__end').getByRole('button', { name: 'Entregar examen' }).click();
      await page.locator('.exam__end .confirm').getByRole('button', { name: 'Entregar', exact: true }).click();
      await page.waitForSelector('.exam__results:not([hidden])');
      ok(await page.locator('.exam__score strong').count() === 1, 'resultado arriba');
      ok(await page.locator('.exam__topics-box .semaforo li').count() >= 1, 'el semáforo reemplaza al temario');
      ok(await page.locator('.exam__topics-box .exam__topics').count() === 0, 'ya no está el temario');
      const marks = await page.locator('.qcard').evaluateAll((ns) => ns.map((n) => ({
        marked: /is-(ok|partial|bad)/.test(n.className), right: !!n.querySelector('.qcard__right:not([hidden])'), ok: n.classList.contains('is-ok')
      })));
      ok(marks.every((m) => m.marked), 'cada pregunta quedó marcada');
      ok(marks.every((m) => m.ok || m.right), 'cada pregunta fallada muestra la respuesta correcta');
      ok(await page.locator('.problem .verdict:not([hidden])').count() >= 1, 'el problema muestra veredicto por inciso');
      const scrollX = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(scrollX <= 1, 'sin scroll horizontal');

      // 6. Recargar la página del examen no reabre el intento.
      await page.reload();
      await page.waitForSelector('.exam-empty');
      ok(true, 'recargar no reabre el intento (ya se consumió el plan)');

      // 7. El historial reabre el intento en modo revisión.
      await page.goto(base + '/quiz/');
      await page.waitForSelector('.history');
      const link = page.locator('a.history__link').first();
      ok(await link.count() === 1, 'el historial enlaza al intento');
      await link.click();
      await page.waitForURL(/\/quiz\/examen\/\?intento=/);
      await page.waitForSelector('.exam__results:not([hidden])');
      await page.waitForSelector('.exam__main .qcard', { timeout: 30000 });
      ok(await page.locator('.exam__main .qcard').count() === 6, 'la revisión reconstruye las 6 preguntas con su formato');
      ok(await page.locator('.exam__main .problem').count() === 1, 'la revisión reconstruye el problema (con su figura si tiene)');
      const rmarks = await page.locator('.exam__main .qcard').evaluateAll((ns) => ns.map((n) => /is-(ok|partial|bad)/.test(n.className) && (n.classList.contains('is-ok') || !!n.querySelector('.qcard__right:not([hidden])'))));
      ok(rmarks.every(Boolean), 'en la revisión cada pregunta está marcada con la respuesta correcta');
      if (answered) ok(await page.locator('.exam__main .exercise__options input:checked').count() >= 1, 'la revisión muestra la opción que eligió');
      ok(await page.locator('.exam__topics-box .semaforo li').count() >= 1, 'la revisión muestra el semáforo');

      await page.evaluate(() => localStorage.clear());
      await ctx.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
  errors.forEach((e) => { fails++; console.log('  ✗ ' + e); });
  console.log(fails ? '\nexam-page: ' + fails + ' fallas' : '\nexam-page: todo bien');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
