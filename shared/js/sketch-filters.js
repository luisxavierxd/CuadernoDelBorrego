/* =====================================================================
   Filtros de trazo (§5.4), definidos una sola vez por página.
   - #f-pen:   desplazamiento de baja frecuencia (pluma), escala ≈ 2.6.
   - #f-chalk: turbulencia fina + desplazamiento (≈ 2.2) + máscara de grano (gis).
   El CSS elige cuál aplicar según data-theme (clase .sketch).
   ===================================================================== */
(function () {
  if (document.getElementById('cb-sketch-filters')) return;
  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('id', 'cb-sketch-filters');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.innerHTML =
    '<defs>' +
      '<filter id="f-pen" x="-5%" y="-5%" width="110%" height="110%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="t"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="t" scale="2.6" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>' +
      '<filter id="f-chalk" x="-5%" y="-5%" width="110%" height="110%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="t"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="t" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
        '<feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="11" result="g"/>' +
        '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.9" result="grain"/>' +
        '<feComposite in="d" in2="grain" operator="in"/>' +
      '</filter>' +
    '</defs>';
  (document.body || document.documentElement).appendChild(svg);
})();
