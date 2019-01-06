import canvg from 'canvg';
import SVG from './test.svg';
import {captureContext, determineShapes, makeGUI} from "./make_gui";
import {changeExecutedText} from "./make_dom";


// TODO capture only the position of the points relative to the previous fixed points
// TODO figure out why the SVGs are inverted (LR and UD)

// ------------ create GUI -------------------

captureContext();

const canvas = document.getElementById("tester");
const fixedPtDef = document.getElementById("fixedpoint_text");
fixedPtDef.oninput = function() {
    changeExecutedText();
};


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

