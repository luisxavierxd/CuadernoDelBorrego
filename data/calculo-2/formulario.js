/* =====================================================================
   Formulario de Cálculo 2. Cada sección enlaza a la sesión donde se explica.
   Algunas fórmulas llevan una comprobación numérica que corre en
   scripts/formulario.test.js (la variable es x; lo demás, valores fijos):
     { d: [f, f′] }        derivada: f′ = d/dx f
     { i: [f, F] }         integral: F′ = f
     { eq: [izq, der] }    identidad: izq = der en varios puntos
   a y b: intervalo donde se comprueba (por defecto [0.2, 2.2]).
   ===================================================================== */
(function () {
  window.FORMULARIO = {
    code: 'c2', course: 'calculo-2', title: 'Formulario de Cálculo 2',
    sections: [
      {
        title: 'Espacio 3D y cuádricas', sessions: [1], items: [
          { label: 'Distancia y punto medio', tex: 'd = \\sqrt{\\Delta x^2 + \\Delta y^2 + \\Delta z^2},\\quad \\Delta x = x_2 - x_1,\\ \\text{etc.}', s: 1 },
          { label: 'Punto medio', tex: 'M = \\left(\\dfrac{x_1+x_2}{2},\\dfrac{y_1+y_2}{2},\\dfrac{z_1+z_2}{2}\\right)', s: 1 },
          { label: 'Esfera', tex: '(x-h)^2 + (y-k)^2 + (z-l)^2 = R^2', s: 1 },
          { label: 'Plano', tex: 'ax + by + cz = d,\\quad \\vec n = \\langle a,b,c\\rangle,\\quad \\vec n\\cdot(\\vec r - \\vec r_0) = 0', s: 1 },
          { label: 'Elipsoide', tex: '\\dfrac{x^2}{a^2}+\\dfrac{y^2}{b^2}+\\dfrac{z^2}{c^2}=1', s: 1 },
          { label: 'Hiperboloides', tex: '\\dfrac{x^2}{a^2}+\\dfrac{y^2}{b^2}-\\dfrac{z^2}{c^2}=1\\ (\\text{1 hoja}),\\quad -\\dfrac{x^2}{a^2}-\\dfrac{y^2}{b^2}+\\dfrac{z^2}{c^2}=1\\ (\\text{2 hojas})', s: 1 },
          { label: 'Paraboloides y cono', tex: 'z = \\dfrac{x^2}{a^2}+\\dfrac{y^2}{b^2},\\quad z = \\dfrac{x^2}{a^2}-\\dfrac{y^2}{b^2}\\ (\\text{silla})', s: 1 },
          { tex: 'z^2 = \\dfrac{x^2}{a^2}+\\dfrac{y^2}{b^2}', s: 1 },
          { label: 'Curvas de nivel', tex: 'f(x,y) = k,\\quad \\text{traza en } z = k', s: 1 }
        ]
      },
      {
        title: 'Polares, cilíndricas y esféricas', sessions: [2, 3], items: [
          { label: 'Polares → rectangulares', tex: 'x = r\\cos\\theta,\\quad y = r\\sin\\theta', s: 2, check: { eq: ['(2cos(x))^2 + (2sin(x))^2', '4'] } },
          { label: 'Rectangulares → polares', tex: 'r^2 = x^2 + y^2,\\quad \\tan\\theta = \\dfrac{y}{x}\\ (\\text{cuida el cuadrante})', s: 2, check: { eq: ['tan(atan(x/1.5))', 'x/1.5'] } },
          { label: 'Curvas polares', tex: 'r = a\\ (\\text{círculo}),\\quad r = 2a\\cos\\theta,\\ \\ r = 2a\\sin\\theta', s: 2 },
          { tex: 'r = a(1 \\pm \\cos\\theta)\\ (\\text{cardioide}),\\quad r = a\\cos n\\theta\\ (\\text{rosa})', s: 2 },
          { label: 'Cilíndricas', tex: 'x = r\\cos\\theta,\\ y = r\\sin\\theta,\\ z = z,\\quad r^2 = x^2 + y^2', s: 3 },
          { label: 'Esféricas → rectangulares', tex: 'x = \\rho\\sin\\varphi\\cos\\theta,\\quad y = \\rho\\sin\\varphi\\sin\\theta,\\quad z = \\rho\\cos\\varphi', s: 3, check: { eq: ['(3sin(x)cos(0.7))^2 + (3sin(x)sin(0.7))^2 + (3cos(x))^2', '9'] } },
          { label: 'Rectangulares → esféricas', tex: '\\rho^2 = x^2+y^2+z^2,\\quad \\cos\\varphi = \\dfrac{z}{\\rho},\\quad 0\\le\\varphi\\le\\pi', s: 3 },
          { label: 'Entre cilíndricas y esféricas', tex: 'r = \\rho\\sin\\varphi,\\quad z = \\rho\\cos\\varphi', s: 3, check: { eq: ['(2sin(x))^2 + (2cos(x))^2', '2^2'] } },
          { label: 'Superficies típicas', tex: '\\rho = R\\ (\\text{esfera}),\\quad r = R\\ (\\text{cilindro}),\\quad \\varphi = \\varphi_0\\ (\\text{cono}),\\quad \\theta = \\theta_0\\ (\\text{semiplano})', s: 3 }
        ]
      },
      {
        title: 'Derivadas parciales y diferencial total', sessions: [4, 5], items: [
          { label: 'Definición', tex: 'f_x = \\lim_{h\\to 0}\\dfrac{f(x+h,y) - f(x,y)}{h},\\quad f_y\\ \\text{igual, moviendo } y', s: 4 },
          { label: 'Regla práctica', tex: 'f_x:\\ y\\ \\text{es constante},\\quad f_y:\\ x\\ \\text{es constante}', s: 4, check: { d: ['x^3*4', '3*x^2*4'] } },
          { label: 'Orden superior', tex: 'f_{xx},\\ f_{yy},\\ f_{xy} = (f_x)_y,\\quad f_{xy} = f_{yx}\\ (\\text{si son continuas})', s: 4 },
          { label: 'Plano tangente', tex: 'z - z_0 = f_x\\,(x - x_0) + f_y\\,(y - y_0),\\quad f_x, f_y\\ \\text{en } (x_0,y_0)', s: 5 },
          { label: 'Diferencial total', tex: 'dz = f_x\\,dx + f_y\\,dy,\\quad \\Delta f \\approx dz', s: 5 },
          { label: 'Aproximación lineal', tex: 'f(x,y) \\approx f(x_0,y_0) + f_x\\,\\Delta x + f_y\\,\\Delta y', s: 5, check: { d: ['sqrt(x)', '1/(2*sqrt(x))'] } },
          { label: 'Propagación de error', tex: '|\\Delta f| \\approx |f_x||\\Delta x| + |f_y||\\Delta y|,\\quad \\text{error relativo} = \\dfrac{|\\Delta f|}{|f|}', s: 5 }
        ]
      },
      {
        title: 'Regla de la cadena', sessions: [6], items: [
          { label: 'Una variable libre', tex: 'z = f(x,y),\\ x(t),\\ y(t):\\quad \\dfrac{dz}{dt} = \\dfrac{\\partial f}{\\partial x}\\dfrac{dx}{dt} + \\dfrac{\\partial f}{\\partial y}\\dfrac{dy}{dt}', s: 6, check: { d: ['cos(x)^2*sin(x)', '-2*cos(x)*sin(x)*sin(x) + cos(x)^2*cos(x)'] } },
          { label: 'Dos variables libres', tex: 'z = f(x,y),\\ x(s,t),\\ y(s,t):\\quad \\dfrac{\\partial z}{\\partial s} = f_x\\,x_s + f_y\\,y_s', s: 6, check: { d: ['(x^2)*(2 + x)', '2*x*(2 + x) + x^2'] } },
          { label: 'Derivación implícita', tex: 'F(x,y) = 0:\\ \\dfrac{dy}{dx} = -\\dfrac{F_x}{F_y}', s: 6, check: { eq: ['-(2x)/(2*3)', '-x/3'] } },
          { tex: 'F(x,y,z) = 0:\\ \\dfrac{\\partial z}{\\partial x} = -\\dfrac{F_x}{F_z},\\quad \\dfrac{\\partial z}{\\partial y} = -\\dfrac{F_y}{F_z}', s: 6 }
        ]
      },
      {
        title: 'Derivada direccional y gradiente', sessions: [7, 8], items: [
          { label: 'Gradiente', tex: '\\nabla f = \\langle f_x, f_y, f_z\\rangle', s: 8 },
          { label: 'Derivada direccional', tex: 'D_{\\vec u}f = \\nabla f\\cdot\\vec u = f_x u_1 + f_y u_2,\\quad \\vec u = \\dfrac{\\vec v}{|\\vec v|}\\ (\\text{unitario})', s: 7, check: { d: ['(1 + 0.6x)^2 + (2 + 0.8x)^2', '2*(1 + 0.6x)*0.6 + 2*(2 + 0.8x)*0.8'] } },
          { label: 'Con el ángulo', tex: 'D_{\\vec u}f = |\\nabla f|\\cos\\theta', s: 7 },
          { label: 'Máximo crecimiento', tex: '\\text{máx: } \\vec u = \\dfrac{\\nabla f}{|\\nabla f|},\\ D_{\\vec u}f = |\\nabla f|;\\quad \\text{mín: } -|\\nabla f|;\\quad 0:\\ \\perp\\nabla f', s: 8 },
          { label: 'Normal a una curva de nivel', tex: '\\nabla f(x_0,y_0)\\ \\perp\\ \\text{curva } f = k', s: 8 },
          { label: 'Plano tangente a una superficie de nivel', tex: 'F(x,y,z) = k:\\quad F_x\\,\\Delta x + F_y\\,\\Delta y + F_z\\,\\Delta z = 0', s: 8 }
        ]
      },
      {
        title: 'Extremos y multiplicadores de Lagrange', sessions: [9, 10], items: [
          { label: 'Puntos críticos', tex: 'f_x = 0,\\ f_y = 0\\ (\\text{o no existen})', s: 9 },
          { label: 'Criterio de la segunda derivada', tex: 'D = f_{xx}f_{yy} - f_{xy}^2', s: 9 },
          { tex: 'D>0,\\ f_{xx}>0:\\ \\text{mín};\\quad D>0,\\ f_{xx}<0:\\ \\text{máx};\\quad D<0:\\ \\text{silla}', s: 9 },
          { label: 'Una restricción', tex: '\\nabla f = \\lambda\\,\\nabla g,\\quad g(x,y,z) = k', s: 9 },
          { label: 'Cuántas ecuaciones', tex: 'x,y,z,\\lambda:\\ 4\\ \\text{ecuaciones}', s: 9 },
          { label: 'Dos restricciones', tex: '\\nabla f = \\lambda\\,\\nabla g + \\mu\\,\\nabla h,\\quad g = k_1,\\ h = k_2', s: 10 },
          { label: 'Extremos absolutos', tex: 'f_{\\text{máx}},\\ f_{\\text{mín}}:\\ \\text{críticos y frontera}', s: 10 }
        ]
      },
      {
        title: 'Integrales dobles', sessions: [11, 12, 13], items: [
          { label: 'Suma de Riemann', tex: '\\iint_R f\\,dA = \\lim \\sum f(x_i^*,y_j^*)\\,\\Delta A', s: 11 },
          { label: 'Fubini (rectángulo)', tex: '\\iint_R f\\,dA = \\int_a^b\\!\\int_c^d f\\,dy\\,dx,\\quad = \\int_c^d\\!\\int_a^b f\\,dx\\,dy', s: 11, check: { i: ['x*0.5', 'x^2/4'] } },
          { label: 'Región tipo I', tex: 'a\\le x\\le b,\\ g_1(x)\\le y\\le g_2(x):\\quad \\int_a^b\\!\\int_{g_1(x)}^{g_2(x)} f\\,dy\\,dx', s: 12 },
          { label: 'Región tipo II', tex: 'c\\le y\\le d,\\ h_1(y)\\le x\\le h_2(y):\\quad \\int_c^d\\!\\int_{h_1(y)}^{h_2(y)} f\\,dx\\,dy', s: 12 },
          { label: 'Área, masa y promedio', tex: 'A = \\iint_R dA,\\quad m = \\iint_R \\delta\\,dA,\\quad f_{\\text{prom}} = \\dfrac{1}{A}\\iint_R f\\,dA', s: 12, check: { i: ['x', 'x^2/2'] } },
          { label: 'Centro de masa', tex: '\\bar x = \\dfrac{1}{m}\\iint_R x\\,\\delta\\,dA,\\quad \\bar y = \\dfrac{1}{m}\\iint_R y\\,\\delta\\,dA', s: 12 },
          { label: 'Cambio a polares', tex: 'dA = r\\,dr\\,d\\theta,\\quad \\iint_R f\\,dA = \\int_\\alpha^\\beta\\!\\int_{r_1}^{r_2} f\\,r\\,dr\\,d\\theta', s: 13, check: { i: ['x', 'x^2/2'] } },
          { label: 'Gaussiana en polares', tex: '\\int_0^R e^{-r^2} r\\,dr = \\tfrac{1}{2}\\left(1 - e^{-R^2}\\right)', s: 13, check: { i: ['x*exp(-x^2)', '-exp(-x^2)/2'] } },
          { tex: '\\iint_{\\mathbb R^2} e^{-(x^2+y^2)}\\,dA = \\pi', s: 13 },
          { label: 'Área en polares', tex: 'A = \\int_\\alpha^\\beta \\tfrac{1}{2}r^2\\,d\\theta,\\quad \\text{círculo: } \\int_0^{2\\pi}\\!\\!\\int_0^R r\\,dr\\,d\\theta = \\pi R^2', s: 13, check: { i: ['x^2/2', 'x^3/6'] } }
        ]
      },
      {
        title: 'Integrales triples', sessions: [14], items: [
          { label: 'Definición y Fubini', tex: '\\iiint_E f\\,dV = \\int\\!\\!\\int\\!\\!\\int f\\,dz\\,dy\\,dx,\\quad dV = dx\\,dy\\,dz\\ (\\text{6 órdenes})', s: 14 },
          { label: 'Sólido entre superficies', tex: 'E:\\ (x,y)\\in D,\\ u_1\\le z\\le u_2,\\quad \\iiint_E f\\,dV = \\iint_D\\!\\int_{u_1}^{u_2} f\\,dz\\,dA', s: 14 },
          { label: 'Volumen, masa y promedio', tex: 'V = \\iiint_E dV,\\quad m = \\iiint_E \\delta\\,dV,\\quad f_{\\text{prom}} = \\dfrac{1}{V}\\iiint_E f\\,dV', s: 14, check: { i: ['x^2', 'x^3/3'] } },
          { label: 'Centro de masa', tex: '\\bar x = \\dfrac{1}{m}\\iiint_E x\\,\\delta\\,dV,\\quad \\bar y\\ \\text{y}\\ \\bar z\\ \\text{igual}', s: 14 }
        ]
      },
      {
        title: 'Triples curvilíneas y Jacobiano', sessions: [15], items: [
          { label: 'Cilíndricas', tex: 'dV = r\\,dz\\,dr\\,d\\theta,\\quad \\iiint_E f\\,dV = \\iiint f\\,r\\,dz\\,dr\\,d\\theta', s: 15 },
          { label: 'Esféricas', tex: 'dV = \\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta', s: 15 },
          { label: 'Jacobiano', tex: 'J = \\dfrac{\\partial(x,y)}{\\partial(u,v)} = \\begin{vmatrix} x_u & x_v \\\\ y_u & y_v \\end{vmatrix},\\quad dA = |J|\\,du\\,dv', s: 15 },
          { label: 'Jacobiano en 3D', tex: 'J = \\dfrac{\\partial(x,y,z)}{\\partial(u,v,w)},\\quad dV = |J|\\,du\\,dv\\,dw', s: 15 },
          { tex: 'J_{\\text{cil}} = r,\\quad J_{\\text{esf}} = \\rho^2\\sin\\varphi', s: 15 },
          { label: 'Volumen de la esfera', tex: 'V = \\int_0^{2\\pi}\\!\\!\\int_0^\\pi\\!\\!\\int_0^R \\rho^2\\sin\\varphi\\,d\\rho\\,d\\varphi\\,d\\theta,\\quad V = \\dfrac{4}{3}\\pi R^3', s: 15, check: { i: ['4*pi*x^2', '4*pi*x^3/3'] } },
          { label: 'Volumen del cilindro', tex: 'V = \\int_0^{2\\pi}\\!\\!\\int_0^R\\!\\int_0^h r\\,dz\\,dr\\,d\\theta = \\pi R^2 h', s: 15, check: { i: ['2*pi*x*3', 'pi*x^2*3'] } },
          { label: 'Cuándo usar cuál', tex: '\\text{eje de simetría: cilíndricas};\\quad \\text{centro de simetría: esféricas}', s: 15 }
        ]
      }
    ]
  };
})();
