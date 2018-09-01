import canvg from 'canvg';
import SVG from './test.svg';

function makeCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = "tester";
    canvas.width = 500;
    canvas.height = 500;
    return canvas;
}

const canvas = document.body.appendChild(makeCanvas());
canvg(canvas, SVG);
