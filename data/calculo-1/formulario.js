/* =====================================================================
   Formulario de Cálculo 1. Cada fórmula lleva la sesión donde se explica
   y, cuando se puede, una comprobación numérica que corre en
   scripts/formulario.test.js:
     { d: [f, f′] }        derivada: f′ = d/dx f
     { i: [f, F] }         integral: F′ = f (antiderivada)
     { eq: [izq, der] }    identidad: izq = der en varios puntos
   a y b: intervalo donde se comprueba (por defecto [0.2, 2.2]).
   ===================================================================== */
(function () {
  window.FORMULARIO = {
    code: 'c1', course: 'calculo-1', title: 'Formulario de Cálculo 1',
    sections: [
      {
        title: 'Álgebra y trigonometría', items: [
          { tex: '\\sin^2 x + \\cos^2 x = 1', check: { eq: ['sin(x)^2 + cos(x)^2', '1'] } },
          { tex: '1 + \\tan^2 x = \\sec^2 x', check: { eq: ['1 + tan(x)^2', 'sec(x)^2'], a: -1, b: 1 } },
          { tex: '1 + \\cot^2 x = \\csc^2 x', check: { eq: ['1 + cot(x)^2', 'csc(x)^2'] } },
          { tex: '\\sin 2x = 2\\sin x\\cos x', check: { eq: ['sin(2x)', '2*sin(x)*cos(x)'] } },
          { tex: '\\cos 2x = \\cos^2 x - \\sin^2 x,\\quad \\cos 2x = 1 - 2\\sin^2 x', check: { eq: ['cos(2x)', '1 - 2*sin(x)^2'] } },
          { tex: '\\sin^2 x = \\dfrac{1 - \\cos 2x}{2}', check: { eq: ['sin(x)^2', '(1 - cos(2x))/2'] } },
          { tex: '\\cos^2 x = \\dfrac{1 + \\cos 2x}{2}', check: { eq: ['cos(x)^2', '(1 + cos(2x))/2'] } },
          { tex: '\\ln(ab) = \\ln a + \\ln b', check: { eq: ['ln(3x)', 'ln(3) + ln(x)'] } },
          { tex: '\\ln\\dfrac{a}{b} = \\ln a - \\ln b', check: { eq: ['ln(x/3)', 'ln(x) - ln(3)'] } },
          { tex: '\\ln a^n = n\\ln a', check: { eq: ['ln(x^5)', '5*ln(x)'] } },
          { tex: 'e^{\\ln x} = x,\\quad \\ln e^x = x', check: { eq: ['e^(ln(x))', 'x'] } }
        ]
      },
      {
        title: 'Límite y derivada', sessions: [1], items: [
          { label: 'Razón de cambio promedio', tex: '\\dfrac{f(b) - f(a)}{b - a}' },
          { label: 'Derivada (definición)', tex: "f'(a) = \\displaystyle\\lim_{h \\to 0}\\dfrac{f(a + h) - f(a)}{h}" },
          { label: 'Recta tangente', tex: "y = f(a) + f'(a)(x - a)" }
        ]
      },
      {
        title: 'Reglas de derivación', sessions: [2, 3, 4, 5, 6], items: [
          { tex: "(cf)' = c\\,f',\\qquad (f \\pm g)' = f' \\pm g'", s: 2 },
          { label: 'Producto', tex: "(fg)' = f'g + fg'", s: 3, check: { d: ['x^2*sin(x)', '2x*sin(x) + x^2*cos(x)'] } },
          { label: 'Cociente', tex: "\\left(\\dfrac{f}{g}\\right)' = \\dfrac{f'g - fg'}{g^2}", s: 4, check: { d: ['sin(x)/x', '(x*cos(x) - sin(x))/x^2'] } },
          { label: 'Cadena', tex: "\\big(f(g(x))\\big)' = f'(g(x))\\,g'(x)", s: 5, check: { d: ['sin(x^2)', '2x*cos(x^2)'] } },
          { tex: "\\big(u^n\\big)' = n\\,u^{n-1}u'", s: 5, check: { d: ['(x^2 + 1)^4', '8x*(x^2 + 1)^3'] } },
          { label: 'Derivación implícita', tex: "F(x, y) = 0 \\Rightarrow \\dfrac{dy}{dx} = -\\dfrac{F_x}{F_y}", s: 6 }
        ]
      },
      {
        title: 'Derivadas básicas', sessions: [2], items: [
          { tex: "\\dfrac{d}{dx}x^n = n x^{n-1}", check: { d: ['x^5', '5x^4'] } },
          { tex: "\\dfrac{d}{dx}e^x = e^x", check: { d: ['e^x', 'e^x'] } },
          { tex: "\\dfrac{d}{dx}a^x = a^x\\ln a", check: { d: ['3^x', '3^x*ln(3)'] } },
          { tex: "\\dfrac{d}{dx}\\ln x = \\dfrac{1}{x}", check: { d: ['ln(x)', '1/x'] } },
          { tex: "\\dfrac{d}{dx}\\log_a x = \\dfrac{1}{x\\ln a}", check: { d: ['log(x, 10)', '1/(x*ln(10))'] } },
          { tex: "\\dfrac{d}{dx}\\sin x = \\cos x", check: { d: ['sin(x)', 'cos(x)'] } },
          { tex: "\\dfrac{d}{dx}\\cos x = -\\sin x", check: { d: ['cos(x)', '-sin(x)'] } },
          { tex: "\\dfrac{d}{dx}\\tan x = \\sec^2 x", check: { d: ['tan(x)', 'sec(x)^2'], a: -1, b: 1 } },
          { tex: "\\dfrac{d}{dx}\\cot x = -\\csc^2 x", check: { d: ['cot(x)', '-csc(x)^2'], a: 0.3, b: 2.8 } },
          { tex: "\\dfrac{d}{dx}\\sec x = \\sec x\\tan x", check: { d: ['sec(x)', 'sec(x)*tan(x)'], a: -1, b: 1 } },
          { tex: "\\dfrac{d}{dx}\\csc x = -\\csc x\\cot x", check: { d: ['csc(x)', '-csc(x)*cot(x)'], a: 0.3, b: 2.8 } },
          { tex: "\\dfrac{d}{dx}\\arcsin x = \\dfrac{1}{\\sqrt{1 - x^2}}", check: { d: ['asin(x)', '1/sqrt(1 - x^2)'], a: -0.9, b: 0.9 } },
          { tex: "\\dfrac{d}{dx}\\arccos x = -\\dfrac{1}{\\sqrt{1 - x^2}}", check: { d: ['acos(x)', '-1/sqrt(1 - x^2)'], a: -0.9, b: 0.9 } },
          { tex: "\\dfrac{d}{dx}\\arctan x = \\dfrac{1}{1 + x^2}", check: { d: ['atan(x)', '1/(1 + x^2)'], a: -3, b: 3 } }
        ]
      },
      {
        title: 'Extremos y optimización', sessions: [7, 8], items: [
          { label: 'Punto crítico', tex: "f'(c) = 0 \\text{ o } f'(c) \\text{ no existe}", s: 7 },
          { label: 'Criterio de la primera derivada', tex: "f'\\!: + \\to - \\Rightarrow \\text{máx},\\qquad f'\\!: - \\to + \\Rightarrow \\text{mín}", s: 7 },
          { label: 'Criterio de la segunda derivada', tex: "f'(c) = 0:\\ \\ f''(c) < 0 \\Rightarrow \\text{máx},\\ \\ f''(c) > 0 \\Rightarrow \\text{mín}", s: 7 },
          { label: 'Concavidad', tex: "f'' > 0: \\cup\\qquad f'' < 0: \\cap", s: 7 },
          { label: 'Inflexión', tex: "f'' \\text{ cambia de signo}", s: 7 },
          { label: 'Óptimo en [a, b]', tex: "\\text{compara } f \\text{ en los críticos, en } a \\text{ y en } b", s: 8 }
        ]
      },
      {
        title: 'La integral', sessions: [9], items: [
          { label: 'Suma de Riemann', tex: '\\displaystyle\\int_a^b f(x)\\,dx = \\lim_{n \\to \\infty}\\sum_{i=1}^{n} f(x_i^*)\\,\\Delta x,\\ \\ \\Delta x = \\dfrac{b - a}{n}' },
          { label: 'TFC, parte 1', tex: '\\dfrac{d}{dx}\\displaystyle\\int_a^x f(t)\\,dt = f(x)' },
          { tex: "\\dfrac{d}{dx}\\displaystyle\\int_a^{g(x)} f(t)\\,dt = f(g(x))\\,g'(x)" },
          { label: 'TFC, parte 2', tex: '\\displaystyle\\int_a^b f(x)\\,dx = F(b) - F(a),\\quad F\' = f' },
          { label: 'Propiedades', tex: '\\displaystyle\\int_b^a f = -\\int_a^b f' },
          { tex: '\\displaystyle\\int_a^b f = \\int_a^c f + \\int_c^b f' },
          { label: 'Valor promedio', tex: '\\dfrac{1}{b - a}\\displaystyle\\int_a^b f(x)\\,dx' }
        ]
      },
      {
        title: 'Integrales básicas', sessions: [10], items: [
          { tex: '\\displaystyle\\int x^n\\,dx = \\dfrac{x^{n+1}}{n + 1} + C,\\ n \\neq -1', check: { i: ['x^4', 'x^5/5'] } },
          { tex: '\\displaystyle\\int \\dfrac{dx}{x} = \\ln|x| + C', check: { i: ['1/x', 'ln(x)'] } },
          { tex: '\\displaystyle\\int e^x\\,dx = e^x + C', check: { i: ['e^x', 'e^x'] } },
          { tex: '\\displaystyle\\int a^x\\,dx = \\dfrac{a^x}{\\ln a} + C', check: { i: ['2^x', '2^x/ln(2)'] } },
          { tex: '\\displaystyle\\int \\sin x\\,dx = -\\cos x + C', check: { i: ['sin(x)', '-cos(x)'] } },
          { tex: '\\displaystyle\\int \\cos x\\,dx = \\sin x + C', check: { i: ['cos(x)', 'sin(x)'] } },
          { tex: '\\displaystyle\\int \\sec^2 x\\,dx = \\tan x + C', check: { i: ['sec(x)^2', 'tan(x)'], a: -1, b: 1 } },
          { tex: '\\displaystyle\\int \\csc^2 x\\,dx = -\\cot x + C', check: { i: ['csc(x)^2', '-cot(x)'], a: 0.3, b: 2.8 } },
          { tex: '\\displaystyle\\int \\sec x\\tan x\\,dx = \\sec x + C', check: { i: ['sec(x)*tan(x)', 'sec(x)'], a: -1, b: 1 } },
          { tex: '\\displaystyle\\int \\tan x\\,dx = -\\ln|\\cos x| + C', check: { i: ['tan(x)', '-ln(cos(x))'], a: -1, b: 1 } },
          { tex: '\\displaystyle\\int \\sec x\\,dx = \\ln|\\sec x + \\tan x| + C', check: { i: ['sec(x)', 'ln(sec(x) + tan(x))'], a: -1, b: 1 } },
          { tex: '\\displaystyle\\int \\dfrac{dx}{a^2 + x^2} = \\dfrac{1}{a}\\arctan\\dfrac{x}{a} + C', check: { i: ['1/(4 + x^2)', 'atan(x/2)/2'], a: -3, b: 3 } },
          { tex: '\\displaystyle\\int \\dfrac{dx}{\\sqrt{a^2 - x^2}} = \\arcsin\\dfrac{x}{a} + C', check: { i: ['1/sqrt(9 - x^2)', 'asin(x/3)'], a: -2.5, b: 2.5 } }
        ]
      },
      {
        title: 'Técnicas de integración', sessions: [10, 11, 12, 13], items: [
          { label: 'Cambio de variable', tex: "\\displaystyle\\int f(g(x))\\,g'(x)\\,dx = \\int f(u)\\,du", s: 10, check: { i: ['2x*cos(x^2)', 'sin(x^2)'] } },
          { label: 'Por partes (LIATE)', tex: '\\displaystyle\\int u\\,dv = uv - \\int v\\,du', s: 11, check: { i: ['x*e^x', '(x - 1)*e^x'] } },
          { label: 'Sustitución trigonométrica', tex: '\\sqrt{a^2 - x^2}:\\ \\ x = a\\sin\\theta', s: 12 },
          { tex: '\\sqrt{a^2 + x^2}:\\ \\ x = a\\tan\\theta', s: 12 },
          { tex: '\\sqrt{x^2 - a^2}:\\ \\ x = a\\sec\\theta', s: 12 },
          { label: 'Fracciones parciales', tex: '\\dfrac{P(x)}{(x - r)(x - s)} = \\dfrac{A}{x - r} + \\dfrac{B}{x - s}', s: 13, check: { i: ['1/(x*(x + 1))', 'ln(x) - ln(x + 1)'] } },
          { tex: '(x - r)^2:\\ \\ \\dfrac{A}{x - r} + \\dfrac{B}{(x - r)^2}', s: 13 },
          { tex: 'x^2 + c \\text{ sin raíces}:\\ \\ \\dfrac{Ax + B}{x^2 + c}', s: 13 },
          { tex: '\\text{grado de arriba} \\geq \\text{abajo}:\\quad \\text{divide primero}', s: 13 }
        ]
      },
      {
        title: 'Aplicaciones de la integral', sessions: [14, 15], items: [
          { label: 'Área entre curvas (f arriba de g)', tex: 'A = \\displaystyle\\int_a^b \\big(f(x) - g(x)\\big)\\,dx', s: 14 },
          { label: 'Longitud de arco', tex: "L = \\displaystyle\\int_a^b \\sqrt{1 + \\big(f'(x)\\big)^2}\\,dx", s: 14 },
          { label: 'Discos (eje x)', tex: 'V = \\pi\\displaystyle\\int_a^b f(x)^2\\,dx', s: 15 },
          { label: 'Arandelas', tex: 'V = \\pi\\displaystyle\\int_a^b \\big(f(x)^2 - g(x)^2\\big)\\,dx', s: 15 },
          { label: 'Capas (eje y)', tex: 'V = 2\\pi\\displaystyle\\int_a^b x\\,f(x)\\,dx', s: 15 }
        ]
      }
    ]
  };
})();
