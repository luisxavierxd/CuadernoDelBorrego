#!/usr/bin/env node
// Convertidor LaTeX (MathLive) → sintaxis de math.js (shared/js/latex-to-math.js).
// Cada caso se compara por valor contra la expresión esperada en varios puntos.
'use strict';
const path = require('path');
const { loadData } = require('./lib/load');
const { loadMathjs } = require('./lib/vendor');

const ROOT = path.join(__dirname, '..');
let pass = 0, fail = 0;

(async () => {
  const math = await loadMathjs();
  const W = loadData(path.join(ROOT, 'shared/js/latex-to-math.js'), {});
  const L = W.CBLatex;
  if (!L) { console.log('✗ window.CBLatex no existe'); process.exit(1); }

  // [LaTeX tal como lo escribe MathLive, expresión math.js equivalente]
  const CASES = [
    [String.raw`\frac{x^3}{3}+C`, 'x^3/3'],
    [String.raw`\sqrt{x}`, 'sqrt(x)'],
    [String.raw`\sin x`, 'sin(x)'],
    [String.raw`\sin(2x)`, 'sin(2*x)'],
    [String.raw`\sin 2x`, 'sin(2*x)'],
    [String.raw`\cos^2x`, 'cos(x)^2'],
    [String.raw`\cos^{2}x`, 'cos(x)^2'],
    [String.raw`e^{2x}`, 'e^(2*x)'],
    [String.raw`\ln x`, 'log(x)'],
    [String.raw`\ln(x^2+1)`, 'log(x^2+1)'],
    [String.raw`\ln\left(x^2+1\right)`, 'log(x^2+1)'],
    [String.raw`2x\cdot\cos(x^2)`, '2*x*cos(x^2)'],
    [String.raw`\frac{1}{2}\sin(x^2)`, 'sin(x^2)/2'],
    [String.raw`\arctan x`, 'atan(x)'],
    [String.raw`\tan\left(x\right)`, 'tan(x)'],
    [String.raw`x\sin x+\cos x`, 'x*sin(x)+cos(x)'],
    [String.raw`-\frac{3}{x}`, '-3/x'],
    [String.raw`\sqrt[3]{x}`, 'x^(1/3)'],
    [String.raw`\left|x\right|`, 'abs(x)'],
    [String.raw`\ln\left|x\right|`, 'log(abs(x))'],
    [String.raw`\pi x`, 'pi*x'],
    [String.raw`\sec^2x`, 'sec(x)^2'],
    [String.raw`\frac{e^{3x}}{3}`, 'e^(3*x)/3'],
    [String.raw`\sin^{-1}x`, 'asin(x)'],
    [String.raw`\tan^{-1}\left(x\right)`, 'atan(x)'],
    [String.raw`x^{\frac{3}{2}}`, 'x^(3/2)'],
    [String.raw`2\sqrt{x+1}`, '2*sqrt(x+1)'],
    [String.raw`\frac{(x^2+1)^5}{10}`, '(x^2+1)^5/10'],
    [String.raw`\sin x\cos x`, 'sin(x)*cos(x)'],
    [String.raw`\sin x\cdot\cos x`, 'sin(x)*cos(x)'],
    [String.raw`x^2\cdot e^{x}`, 'x^2*e^x'],
    [String.raw`\frac{x}{2}-\frac{\sin(2x)}{4}`, 'x/2-sin(2*x)/4'],
    [String.raw`3x^2-4x+1`, '3*x^2-4*x+1'],
    [String.raw`\left(x+1\right)^3`, '(x+1)^3'],
    [String.raw`x\ln x-x`, 'x*log(x)-x'],
    [String.raw`\log x`, 'log10(x)'],
    [String.raw`\exp(x^2)`, 'exp(x^2)'],
    [String.raw`\mathrm{e}^{x}`, 'e^x'],
    [String.raw`\frac{1}{\sqrt{1-x^2}}`, '1/sqrt(1-x^2)'],
    [String.raw`2^{x}`, '2^x'],
    [String.raw`x^{-2}`, 'x^(-2)'],
    [String.raw`-\cos\left(x\right)+C`, '-cos(x)'],
    [String.raw`\frac{1}{3}\left(x^2+1\right)^{\frac{3}{2}}`, '(x^2+1)^(3/2)/3'],
    [String.raw`0.5x`, '0.5*x'],
    [String.raw`3~{ x}^{2}-4~ x+1`, '3*x^2-4*x+1'],
    [String.raw`{ x}^{3}-2~{ x}^{2}+ x`, 'x^3-2*x^2+x'],
    [String.raw`12.5`, '12.5'],
    [String.raw`x\times 3`, 'x*3'],
    [String.raw`\sin\left(x\right)^2`, 'sin(x)^2'],
    [String.raw`\cos x^2`, 'cos(x^2)'],
    [String.raw`x\tan(35^{\circ})`, 'x*tan(35*pi/180)'],
    [String.raw`\cos^2(40^\circ)x`, 'cos(40*pi/180)^2*x'],
    [String.raw`x\tan\left(35^{\circ}\right)-\frac{9.81x^2}{2\cdot18^2\cos^2\left(35^{\circ}\right)}`, 'x*tan(35*pi/180)-9.81*x^2/(2*18^2*cos(35*pi/180)^2)'],
    [String.raw`\frac{d}{2}`, null],                 // variable desconocida: debe fallar al evaluar, no al convertir
    [String.raw`\theta`, null]
  ];
  const xs = [0.3, 0.7, 1.1, 1.9];
  for (const [tex, want] of CASES) {
    let got;
    try { got = L.toMath(tex); } catch (e) { fail++; console.log(`✗ ${tex}: lanzó ${e.message}`); continue; }
    if (want === null) { pass++; continue; }
    const prep = (s) => s.replace(/\+\s*C\b/g, '');
    let ok = true, detail = '';
    try {
      const a = math.parse(prep(got)).compile(), b = math.parse(want).compile();
      for (const x of xs) {
        const va = a.evaluate({ x }), vb = b.evaluate({ x });
        // Fuera del dominio real pueden salir complejos: se comparan igual.
        const diff = math.abs(math.subtract(va, vb)), size = math.abs(vb);
        if (!(diff <= 1e-9 * (1 + size))) { ok = false; detail = `en x=${x}: ${va} ≠ ${vb}`; break; }
      }
    } catch (e) { ok = false; detail = e.message; }
    if (ok) { pass++; } else { fail++; console.log(`✗ ${tex} → "${got}" (esperaba ≈ ${want}) ${detail}`); }
  }
  // Errores claros para entradas incompletas
  for (const bad of [String.raw`\frac{x}{}`, String.raw`\sqrt{}`, String.raw`x^{}`, '']) {
    try { L.toMath(bad); fail++; console.log(`✗ "${bad}" debería marcar que falta algo`); }
    catch (e) { pass++; }
  }

  // Limpieza de fórmulas al dibujar (math-render.js · CBMath.tidy): coeficientes 1, signos dobles y términos 0.
  const R = loadData(path.join(ROOT, 'shared/js/math-render.js'), {}).CBMath;
  const TIDY = [
    ['h(t) = 1t^2 + 3t', 'h(t) = t^2 + 3t'], ['f(x) = x^3 - 1x', 'f(x) = x^3 - x'], ['r(t) = 1t(4 - t)', 'r(t) = t(4 - t)'],
    ['s(t) = 1t^2 + 0t', 's(t) = t^2'], [String.raw`\dfrac{1x + 1}{x + 2}`, String.raw`\dfrac{x + 1}{x + 2}`], ['f(x) = -1x + 1', 'f(x) = -x + 1'],
    ['x^2 + -1x + 1', 'x^2 - x + 1'], [String.raw`x\,(5 + 1\ln x)`, String.raw`x\,(5 + \ln x)`], ['1x^2 + -6x', 'x^2 - 6x'], ['3 - -2', '3 + 2'],
    ['x^{1}', 'x'], [String.raw`\sin(1x)`, String.raw`\sin(x)`],
    // lo que NO debe cambiar
    [String.raw`\dfrac{1}{x}`, String.raw`\dfrac{1}{x}`], ['10x + 1', '10x + 1'], ['x_1 + 1', 'x_1 + 1'], ['f(1) = 1', 'f(1) = 1'],
    [String.raw`\int_1^{e} \ln x`, String.raw`\int_1^{e} \ln x`], ['0.1x', '0.1x'], ['x^{1/3}', 'x^{1/3}'], ['1.5x', '1.5x'],
    [String.raw`\int 1\,dx`, String.raw`\int 1\,dx`], ['(1)(2)', '(1)(2)'], ['y = 0.5x + 0', 'y = 0.5x + 0'], ['a_{1}x', 'a_{1}x'],
    // límites superiores iguales a 1: no son exponentes
    [String.raw`\displaystyle\int_0^1 \frac{x + 1}{x^2 + 1}\,dx`, String.raw`\displaystyle\int_0^1 \frac{x + 1}{x^2 + 1}\,dx`],
    [String.raw`\int_{0}^{1} x\,dx`, String.raw`\int_{0}^{1} x\,dx`], [String.raw`\int_a^1 f`, String.raw`\int_a^1 f`],
    [String.raw`\sum_{i=1}^{1} i`, String.raw`\sum_{i=1}^{1} i`], [String.raw`\int^1 f`, String.raw`\int^1 f`],
    [String.raw`\Big|_0^1`, String.raw`\Big|_0^1`], ['x^1 + y^{1}', 'x + y']
  ];
  for (const [src, want] of TIDY) {
    const got = R.tidy(src);
    if (got === want) pass++;
    else { fail++; console.log(`✗ tidy ${JSON.stringify(src)} → ${JSON.stringify(got)} (esperaba ${JSON.stringify(want)})`); }
  }
  console.log(`\nlatex.test.js: ${pass} ok, ${fail} fallan.`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
