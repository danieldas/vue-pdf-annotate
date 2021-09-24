import setAttributes from '../utils/setAttributes';

const SIZE = 45;
const D = 'M 500, 100\n' +
  '        m -75, 0\n' +
  '        a 125,125 0 1,0 150,0\n' +
  '        a 95,95 0 1,0 -150,0';

/**
 * Create SVGElement from an annotation definition.
 * This is used for anntations of type `comment`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGElement} A svg to be rendered
 */
export default function renderPoint(a) {
  let outerSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  let innerSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  setAttributes(outerSVG, {
    width: SIZE,
    height: SIZE,
    x: a.x,
    y: a.y
  });

  setAttributes(innerSVG, {
    width: SIZE,
    height: SIZE,
    x: 0,
    y: (SIZE * 0.05) * -1,
    viewBox: '0 0 1000 1000'
  });

  setAttributes(rect, {
    width: SIZE,
    height: SIZE,
    stroke: '#000',
    // fill: '#000'
    fill: '#ff0',
    text: 'hola'
  });

  setAttributes(path, {
    d: D,
    strokeWidth: 10,
    stroke: '#000',
    fill: 'red',


  });

  innerSVG.appendChild(path);
  outerSVG.appendChild(rect);
  outerSVG.appendChild(innerSVG);

  return outerSVG;
}
