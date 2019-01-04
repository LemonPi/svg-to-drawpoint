import canvg from 'canvg';
import SVG from './test.svg';
import {captureContext, determineShapes, makeGUI} from "./make_gui";


// TODO use scale input to scale output text
// TODO capture only the position of the points relative to the previous fixed points
// TODO print results in textArea

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
