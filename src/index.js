import canvg from 'canvg';
import SVG from './test.svg';
import {captureContext, determineShapes, makeGUI} from "./make_gui";


// TODO capture only the position of the points relative to the previous fixed points
// TODO figure out why the SVGs are inverted (LR and UD)

// ------------ create GUI -------------------

captureContext();

const canvas = document.getElementById("tester");


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
determineShapes();
