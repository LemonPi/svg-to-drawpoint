import canvg from 'canvg';
import SVG from './test.svg';
import {makeCanvas, makeMainContainer} from "./make_dom";
import {captureContext, makeGUI} from "./make_gui";


// TODO take in scale
// TODO take in coordinate of n "fixed" points
// TODO capture only the position of the points relative to the previous fixed points
// TODO print results in textArea
// TODO describe how to create compatible SVGs (inkscape?)

// ------------ create GUI -------------------

captureContext();

const container = document.body.appendChild(makeMainContainer());
const canvas = container.appendChild(makeCanvas());

function drawSVG(svg) {
    canvg(canvas,
        svg,
        {
            log            : true,
            ignoreMouse    : true,
            ignoreAnimation: true,
            ignoreClear    : true,
            // ignoreDimensions: true,
        });
}

makeGUI(drawSVG);
drawSVG(SVG);
