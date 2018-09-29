import canvg from 'canvg';
import SVG from './test.svg';
import {makeCanvas, makeMainContainer} from "./make_dom";
import {captureContext, makeGUI} from "./make_gui";


// TODO take in scale
// TODO take in coordinate of first point
// TODO capture only the position of the points relative to the first point
// TODO print results in textArea
// TODO consider using dat.GUI for this GUI

// ------------ create GUI -------------------

captureContext();

const container = document.body.appendChild(makeMainContainer());
const canvas = container.appendChild(makeCanvas());
makeGUI();

canvg(canvas,
    SVG,
    {
        log            : true,
        ignoreMouse    : true,
        ignoreAnimation: true,
        ignoreClear    : true,
        // ignoreDimensions: true,
    });
