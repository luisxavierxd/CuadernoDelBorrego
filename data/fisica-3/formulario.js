/* =====================================================================
   Formulario de Física 3. Cada sección enlaza a la sesión donde se explica.
   Algunas fórmulas llevan una comprobación numérica que corre en
   scripts/formulario.test.js (la variable es x; lo demás, valores fijos):
     { d: [f, f′] }        derivada: f′ = d/dx f
     { i: [f, F] }         integral: F′ = f
     { eq: [izq, der] }    identidad: izq = der en varios puntos
   a y b: intervalo donde se comprueba (por defecto [0.2, 2.2]).
   Tiene que caber en una hoja carta por ambos lados (formulario-print.test.js).
   ===================================================================== */
(function () {
  var sections = [];

  /* ══════════════════════ Bloque A ══════════════════════ */
  sections.push({
    title: 'Constantes, campo y fuerza de Lorentz', sessions: [1, 2], items: [
      { label: 'Constante magnética', tex: '\\mu_0 = 4\\pi\\times 10^{-7}\\ \\text{T·m/A},\\quad \\text{desde 2019 se mide:}\\ \\ 1.25663706212\\times 10^{-6}\\ \\(\\text{CODATA 2018})' },
      { tex: 'e = 1.60\\times 10^{-19}\\ \\text{C},\\quad m_e = 9.11\\times 10^{-31}\\ \\text{kg},\\quad m_p = 1.67\\times 10^{-27}\\ \\text{kg},\\quad u = 1.66\\times 10^{-27}\\ \\text{kg}' },
      { label: 'Unidades', tex: '1\\ \\text{T} = 1\\ \\tfrac{\\text{N}}{\\text{A·m}} = 10^{4}\\ \\text{G},\\quad B_{\\text{Tierra}} \\approx 50\\ \\mu\\text{T}', s: 1 },
      { label: 'Suma de campos', tex: '\\vec B = \\vec B_1 + \\vec B_2 + \\cdots,\\quad \\text{por componentes}', s: 1 },
      { label: 'Fuerza magnética', tex: '\\vec F = q\\,\\vec v \\times \\vec B,\\quad F = |q|vB\\sin\\theta,\\quad \\vec F\\cdot\\vec v = 0', s: 2 },
      { label: 'Fuerza de Lorentz', tex: '\\vec F = q\\left(\\vec E + \\vec v \\times \\vec B\\right)', s: 2 }
    ]
  });
  sections.push({
    title: 'Cargas en un campo uniforme', sessions: [3], items: [
      { label: 'Órbita', tex: 'r = \\dfrac{mv}{|q|B},\\quad T = \\dfrac{2\\pi m}{|q|B},\\quad f = \\dfrac{|q|B}{2\\pi m}\\ \\ (\\text{no depende de } v)', s: 3, check: { eq: ['2*pi*x/(3*1.2) ', '2*pi*(x*5/(3*1.2))/5'] } },
      { label: 'Hélice', tex: 'r = \\dfrac{mv_\\perp}{|q|B},\\quad p = v_\\parallel T', s: 3 },
      { label: 'Selector y espectrómetro', tex: 'v = \\dfrac{E}{B},\\quad qV = \\tfrac{1}{2}mv^2,\\quad m = \\dfrac{qB^2r^2}{2V},\\quad d = 2r', s: 3, check: { eq: ['x^2*(sqrt(2*3*1.5)/x)^2/(2*1.5)', '3'] } },
      { label: 'Ciclotrón', tex: 'K_{\\text{máx}} = \\dfrac{q^2B^2R^2}{2m}', s: 3, check: { eq: ['0.5*2*(1.5*x*0.7/2)^2', '(1.5*x*0.7)^2/(2*2)'] } }
    ]
  });
  sections.push({
    title: 'Conductores y espiras', sessions: [4, 5], items: [
      { label: 'Conductor', tex: '\\vec F = I\\vec L \\times \\vec B,\\quad F = ILB\\sin\\theta,\\quad \\vec F = \\textstyle\\int I\\,d\\vec l \\times \\vec B', s: 4 },
      { label: 'Campo uniforme', tex: '\\vec F = I\\,\\vec L_{\\text{extremos}} \\times \\vec B,\\quad \\text{espira cerrada: } \\vec F = 0;\\quad \\text{arco: } 2IRB\\sin\\tfrac{\\varphi}{2}', s: 4, check: { eq: ['2*1.5*0.2*0.8*sin(x/2)', '1.5*0.8*sqrt((0.2 - 0.2*cos(x))^2 + (0.2*sin(x))^2)'] , a: 0.2, b: 3 } },
      { label: 'Detalle: Hall', tex: 'V_H = \\dfrac{IB}{nqt}', s: 4 },
      { label: 'Torque y dipolo', tex: '\\tau = NIAB\\sin\\theta,\\quad \\vec\\mu = NIA\\,\\hat n,\\quad \\vec\\tau = \\vec\\mu \\times \\vec B', s: 5 },
      { label: 'Energía', tex: 'U = -\\vec\\mu\\cdot\\vec B = -\\mu B\\cos\\theta,\\quad \\tau = -\\dfrac{dU}{d\\theta}', s: 5, check: { d: ['-0.6*cos(x)', '0.6*sin(x)'] } },
      { label: 'Motor (promedio)', tex: '\\bar\\tau = \\tfrac{2}{\\pi}NIAB', s: 5 }
    ]
  });

  /* ══════════════════════ fin Bloque A ══════════════════════ */

  /* ══════════════════════ Bloque B ══════════════════════ */
  sections.push({
    title: 'Biot–Savart', sessions: [6], items: [
      { label: 'Ley de Biot–Savart', tex: 'd\\vec B = \\dfrac{\\mu_0}{4\\pi}\\,\\dfrac{I\\,d\\vec l \\times \\hat r}{r^2},\\quad \\dfrac{\\mu_0}{4\\pi} = 10^{-7}\\ \\text{T·m/A}', s: 6 },
      { label: 'Tramo recto', tex: 'B = \\dfrac{\\mu_0 I}{4\\pi a}\\left(\\sin\\theta_2 - \\sin\\theta_1\\right),\\quad \\sin\\theta = \\dfrac{x}{\\sqrt{x^2 + a^2}}', s: 6, check: { d: ['x/sqrt(x^2 + 0.36)', '0.36/(x^2 + 0.36)^(3/2)'] } },
      { label: 'Alambre largo', tex: 'B = \\dfrac{\\mu_0 I}{2\\pi a}\\ \\ (\\text{círculos, mano derecha})', s: 6 },
      { label: 'Arco y espira, en el centro', tex: 'B = \\dfrac{\\mu_0 I\\varphi}{4\\pi R}\\ (\\varphi\\ \\text{en rad}),\\quad B = \\dfrac{N\\mu_0 I}{2R}', s: 6 },
      { label: 'Espira, en su eje', tex: 'B = \\dfrac{\\mu_0 I R^2}{2\\left(z^2 + R^2\\right)^{3/2}},\\quad z \\gg R:\\ B \\approx \\dfrac{\\mu_0 I R^2}{2z^3}', s: 6, check: { i: ['0.25/(x^2 + 0.25)^(3/2)', 'x/sqrt(x^2 + 0.25)'] } }
    ]
  });
  sections.push({
    title: 'Conductores paralelos y ley de Ampère', sessions: [7, 8], items: [
      { label: 'Fuerza entre paralelos', tex: '\\dfrac{F}{L} = \\dfrac{\\mu_0 I_1 I_2}{2\\pi d},\\quad \\text{iguales se atraen},\\quad \\text{opuestas se repelen}', s: 7 },
      { label: 'Ley de Ampère', tex: '\\oint \\vec B\\cdot d\\vec l = \\mu_0 I_{\\text{enc}},\\quad \\text{signo con la mano derecha},\\quad B\\cdot 2\\pi r = \\mu_0 I_{\\text{enc}}', s: 8 },
      { label: 'Alambre grueso', tex: 'B = \\dfrac{\\mu_0 I r}{2\\pi R^2}\\ (r < R),\\quad B = \\dfrac{\\mu_0 I}{2\\pi r}\\ (r \\ge R)', s: 8, check: { eq: ['x*(x/1.5)^2/x', 'x^2/1.5^2'] } },
      { label: 'Coaxial y tubo', tex: 'I_{\\text{enc}} = I\\dfrac{r^2}{a^2},\\ \\ I\\dfrac{r^2 - a^2}{b^2 - a^2};\\quad \\text{coaxial afuera: } B = 0', s: 8 }
    ]
  });
  sections.push({
    title: 'Solenoides, flujo y materia', sessions: [9, 10], items: [
      { label: 'Solenoide', tex: 'B = \\mu_0 n I,\\ \\ n = \\dfrac{N}{L};\\quad \\text{extremo} \\approx \\tfrac{1}{2}\\mu_0 n I;\\quad \\text{centro (corto)}: \\mu_0 n I\\dfrac{L}{\\sqrt{L^2 + 4R^2}}', s: 9 },
      { label: 'Toroide', tex: 'B = \\dfrac{\\mu_0 N I}{2\\pi r}\\ (a < r < b),\\quad B = 0\\ \\text{fuera}', s: 9 },
      { label: 'Flujo magnético', tex: '\\Phi_B = BA\\cos\\theta = \\textstyle\\int \\vec B\\cdot d\\vec A,\\quad 1\\ \\text{Wb} = 1\\ \\text{T·m}^2', s: 10 },
      { label: 'Espira junto a un alambre', tex: '\\Phi_B = \\dfrac{\\mu_0 I h}{2\\pi}\\ln\\dfrac{b}{a}', s: 10, check: { i: ['1/x', 'log(x)'] } },
      { label: 'Gauss del magnetismo', tex: '\\oint \\vec B\\cdot d\\vec A = 0\\ \\ (\\text{no hay monopolos})', s: 10 },
      { label: 'Materia', tex: 'B = K_m B_0,\\quad \\mu = K_m\\mu_0 = (1 + \\chi)\\mu_0;\\quad \\chi > 0\\ \\text{para},\\quad \\chi < 0\\ \\text{dia},\\quad K_m \\gg 1\\ \\text{ferro}', s: 10 }
    ]
  });

  /* ══════════════════════ fin Bloque B ══════════════════════ */

  /* ══════════════════════ Bloque C ══════════════════════ */
  sections.push({
    title: 'Ley de Faraday y ley de Lenz', sessions: [11, 12], items: [
      { label: 'Faraday', tex: '\\Phi_B = BA\\cos\\theta = \\textstyle\\int \\vec B\\cdot d\\vec A,\\quad \\varepsilon = -N\\,\\dfrac{d\\Phi_B}{dt}', s: 11 },
      { label: 'Fem de movimiento', tex: '\\varepsilon = BLv,\\quad I = \\dfrac{BLv}{R},\\quad F = \\dfrac{B^2L^2v}{R},\\quad P = Fv = I^2R', s: 11, check: { eq: ['(0.5*x*2/1.5)^2*1.5', '0.5^2*x^2*2/1.5*2'] } },
      { label: 'Lenz', tex: '\\text{el campo inducido se opone a } \\Delta\\Phi_B', s: 12 },
      { label: 'Forma general', tex: '\\oint \\vec E\\cdot d\\vec l = -\\dfrac{d\\Phi_B}{dt};\\quad E = \\dfrac{r}{2}\\left|\\dfrac{dB}{dt}\\right|\\ (r < R),\\quad E = \\dfrac{R^2}{2r}\\left|\\dfrac{dB}{dt}\\right|\\ (r > R)', s: 12, check: { eq: ['(0.5^2/(2*x))*3*2*pi*x', 'pi*0.5^2*3'], a: 0.6, b: 3 } },
      { label: 'Generador', tex: '\\varepsilon = NBA\\omega\\sin\\omega t,\\quad \\omega = 2\\pi f = \\dfrac{2\\pi\\,(\\text{rpm})}{60}', s: 12, check: { d: ['-(20*0.3*0.01*cos(5*x))', '20*0.3*0.01*5*sin(5*x)'] } }
    ]
  });
  sections.push({
    title: 'Inductancia y circuito RL', sessions: [13, 14], items: [
      { label: 'Inductancia', tex: 'L = \\dfrac{N\\Phi}{I},\\quad \\varepsilon = -L\\,\\dfrac{dI}{dt},\\quad 1\\ \\text{H} = 1\\ \\text{V·s/A}', s: 13 },
      { label: 'Solenoide', tex: 'L = K_m\\,\\dfrac{\\mu_0N^2A}{\\ell}', s: 13 },
      { label: 'Detalle: mutua', tex: '\\varepsilon_2 = -M\\,\\dfrac{dI_1}{dt},\\quad M = \\dfrac{N_2\\Phi_{21}}{I_1}', s: 13 },
      { label: 'Ecuación', tex: 'L\\,\\dfrac{dI}{dt} + IR = \\varepsilon,\\quad \\tau = \\dfrac{L}{R}\\ \\ (\\text{mH}/\\Omega = \\text{ms})', s: 14 },
      { label: 'Crece y decae', tex: 'I = \\dfrac{\\varepsilon}{R}\\left(1 - e^{-t/\\tau}\\right),\\quad V_L = \\varepsilon\\,e^{-t/\\tau};\\quad I = I_0\\,e^{-t/\\tau}', s: 14, check: { d: ['(12/50)*(1 - exp(-x/0.8))', '(12/40)*exp(-x/0.8)'] } },
      { label: 'Tiempos', tex: 't = -\\tau\\ln\\left(1 - \\dfrac{I}{I_f}\\right),\\quad t = \\tau\\ln\\dfrac{I_0}{I}', s: 14, check: { eq: ['-0.8*log(1 - (1 - exp(-x/0.8)))', 'x'] } }
    ]
  });
  sections.push({
    title: 'Energía magnética', sessions: [15], items: [
      { label: 'Inductor y campo', tex: 'U = \\tfrac{1}{2}LI^2,\\quad u_B = \\dfrac{B^2}{2\\mu_0},\\quad U = \\textstyle\\int u_B\\,dV', s: 15, check: { i: ['0.3*x', '0.15*x^2'] } },
      { label: 'Toroide', tex: 'U = \\dfrac{\\mu_0N^2I^2h}{4\\pi}\\ln\\dfrac{b}{a},\\quad L = \\dfrac{\\mu_0N^2h}{2\\pi}\\ln\\dfrac{b}{a}', s: 15, check: { i: ['3/x', '3*log(x)'] } },
      { label: 'Balance en el RL', tex: '\\varepsilon I = I^2R + \\dfrac{d}{dt}\\left(\\tfrac{1}{2}LI^2\\right);\\quad \\text{detalle LC: } \\omega = \\dfrac{1}{\\sqrt{LC}}', s: 15 }
    ]
  });

  /* ══════════════════════ fin Bloque C ══════════════════════ */

  window.FORMULARIO = {
    code: 'f3', course: 'fisica-3', title: 'Formulario de Física 3',
    sections: sections
  };
})();
