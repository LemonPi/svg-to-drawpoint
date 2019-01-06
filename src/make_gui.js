import * as dat from "dat.gui";
import capture from "call-capture";
import {changeInteractiveModalText, makeFileUpload, makeInteractiveModal} from "./make_dom";
import {extractDrawpoints} from "./extract_drawpoint";
import {generateText} from "./generate_text";
import {Matrix} from "transformation-matrix-js";

// captured drawing context
// each canvas can only have 1 active drawing context, so it's safe to assume there'll only be 1
let ctx;

function clearCapture() {
    ctx.clearQueue();
}

/**
 * Replace drawing context factory with one for a captured version to track actions
 */
export function captureContext() {
    const oldGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function () {
        // forward the canvas 'this' object to the old get context
        ctx = capture(oldGetContext.apply(this, arguments));
        return ctx;
    };
}

/**
 * Update the constraint on the order of the drawppoint
 * @param numDrawpoints total number of drawpoints for all shapes
 */
function generateFixedPointGUI(numDrawpoints) {
    if (fixedPointFolder) {
        gui.removeFolder(fixedPointFolder);
    }

    fixedPointFolder = gui.addFolder("add fixed point");
    // constrain order when we know how many drawpoints exist
    fixedPointOrder =
        fixedPointFolder.add(fixedPointInteraction, "order").min(0).max(numDrawpoints - 1).step(1);
    fixedPointFolder.add(fixedPointInteraction, "name");
    fixedPointFolder.add(fixedPointInteraction, "add");
    fixedPointFolder.add(fixedPointInteraction, "remove");
}

// TODO consider the other drawing methods like arc
const toCaptureNames = ["moveTo", "lineTo", "quadraticCurveTo", "bezierCurveTo"];
// stroke or fill commands terminate a shape
const terminateNames = ["stroke"];  // shape terminates with a stroke command
const styleNames = ["strokeStyle", "fillStyle"];

let shapes = [];
let finalTerminateCmds = [];

class Shape {
    constructor() {
        this.drawpoints = [];
        this.fixedPts = [];
        this.drawCmds = [];
        this.preambleCmds = [];
        this.postCmds = [];
        // only the last one matters so we can use an object keyed on name
        this.styleCmds = {};
        this.ptIndexOffset = 0;
        this.tsf = new Matrix();
        this._startedDrawing = false;
    }

    /**
     * Process a draw command
     * @param cmd
     * @returns {boolean} Whether this shape's been completed
     */
    handleCommand(cmd) {
        // actual drawing commands are in between pre and post commands
        if (toCaptureNames.includes(cmd.name)) {
            this._startedDrawing = true;
            this.drawCmds.push(cmd);
            this.drawpoints.push(...extractDrawpoints(cmd));
        } else if (this._startedDrawing === false) {
            this.preambleCmds.push(cmd);
            if (cmd.name === "scale") {
                this.tsf.scale(...cmd.args);
            } else if (cmd.name === "translate") {
                this.tsf.translate(...cmd.args);
            } else if (styleNames.includes(cmd.name)) {
                this.styleCmds[cmd.name] = cmd;
            }
        } else {
            this.postCmds.push(cmd);
            if (terminateNames.includes(cmd.name)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Adjust its drawpoints by applying the captured transform
     * so that the resulting drawpoints don't have to transformed again at draw time
     */
    applyTransform() {
        // TODO allow user specification of transformation matrix to adjust again while preserving what the output is
        this.tsf.flipX();
        this.tsf.flipY();

        for (let pt of this.drawpoints) {
            if (pt.cp1) {
                pt.cp1 = this.tsf.applyToPoint(pt.cp1.x, pt.cp1.y);
            }
            if (pt.cp2) {
                pt.cp2 = this.tsf.applyToPoint(pt.cp2.x, pt.cp2.y);
            }
            const newPt = this.tsf.applyToPoint(pt.x, pt.y);
            pt.x = newPt.x;
            pt.y = newPt.y;
        }
    }
}

/**
 * GUI elements for interaction on the side
 */
const interactiveConversion = {
    scale: 1,
    /**
     * Do most of the main action such as drawing all that needs to be drawn and generating text
     */
    draw() {
        console.log(ctx.queue);
        for (let cmd of ctx.queue) {
            cmd.execute();
        }

        // now we have information on what to draw we can add GUI for drawing
        let totalNumDrawpoints = 0;
        for (let shape of shapes) {
            totalNumDrawpoints += shape.drawpoints.length;
        }
        // assumes each draw command results in one draw point
        generateFixedPointGUI(totalNumDrawpoints);

        drawFixedPoints();
        displayInteractiveModal();
        this.updateText();
    },
    clear() {
        ctx.pauseCapture();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.resumeCapture();
    },
    upload() {
        fileUpload.click();
    },
    updateText() {
        changeInteractiveModalText(generateText(shapes, this.scale));
    }
};

function drawFixedPoints() {
    ctx.pauseCapture();
    console.log(`${shapes.length} shapes`);
    for (let s of shapes) {
        console.log("preamble commands");
        console.log(s.preambleCmds);
        for (let cmd of s.preambleCmds) {
            cmd.execute();
        }

        ctx.fillStyle = "red";
        ctx.font = "8px consolas";

        s.fixedPts.forEach((name, index) => {
            if (!name) {
                return;
            }
            const fp = s.tsf.inverse().applyToPoint(s.drawpoints[index].x, s.drawpoints[index].y);
            const x = fp.x;
            const y = fp.y;
            const l = 1;
            ctx.fillRect(x - l / 2, y - l / 2, l, l);
            ctx.fillText(name, x + 2 * l, y);
        });

        console.log("postamble commands");
        console.log(s.postCmds);
        for (let cmd of s.postCmds) {
            cmd.execute();
        }
    }
    console.log("final terminate commands");
    console.log(finalTerminateCmds);
    for (let cmd of finalTerminateCmds) {
        cmd.execute();
    }
    ctx.resumeCapture();
}

/**
 * Find shape corresponding to (containing)  a global point index
 * @param i
 * @returns {(Shape|null)}
 */
function findCorrespondingShapeToIndex(i) {
    for (let shape of shapes) {
        if (i < shape.ptIndexOffset + shape.drawpoints.length) {
            return shape;
        }
    }
    return null;
}

const fixedPointInteraction = {
    order: 0,
    name : "p1",
    add() {
        const s = findCorrespondingShapeToIndex(this.order);
        s.fixedPts[this.order - s.ptIndexOffset] = this.name;
        // label on canvas
        interactiveConversion.clear();
        interactiveConversion.draw();
    },
    remove() {
        const s = findCorrespondingShapeToIndex(this.order);
        s.fixedPts[this.order - s.ptIndexOffset] = undefined;
        interactiveConversion.clear();
        interactiveConversion.draw();
    }
};

function displayInteractiveModal(element = gui.domElement, relative = "left") {
    if (relative.indexOf("right") > -1) {
        interactiveModal.style.left = element.offsetLeft + element.offsetWidth + 10 + "px";
    } else if (relative.indexOf("left") > -1) {
        interactiveModal.style.right = document.body.offsetWidth - element.offsetLeft + 20 + "px";
    } else {
        interactiveModal.style.left = element.offsetLeft - 10 + "px";
    }

    interactiveModal.style.visibility = "visible";
    interactiveModal.value = "";

    interactiveModal.focus();
}

let gui;
let interactiveModal;
let fileUpload;
let fixedPointFolder;
let fixedPointOrder;

function generateGUI(gui) {
    if (gui) {
        gui.destroy();
    }
    gui = new dat.GUI();
    gui.add(interactiveConversion, "upload").name("upload SVG");
    gui.add(interactiveConversion, "draw");
    gui.add(interactiveConversion, "clear");
    gui.add(interactiveConversion, "scale").min(0).max(3).onChange(function () {
        interactiveConversion.updateText();
    });

    return gui;
}

export function determineShapes() {
    // generate the draw points from the created image
    shapes = [];
    let shape = new Shape();

    console.log(ctx.queue);
    for (let cmd of ctx.queue) {
        cmd.execute();
        if (shape.handleCommand(cmd)) {
            shapes.push(shape);
            console.log(`Finished shape ${shapes.length}`);
            console.log(shape.drawCmds);
            console.log(shape.drawpoints);

            shape = new Shape();
        }
    }
    // the last shape hasn't been pushed because we've only encountered its preamble
    finalTerminateCmds = shape.preambleCmds;

    // now we have information on what to draw we can add GUI for drawing
    let totalNumDrawpoints = 0;
    for (shape of shapes) {
        shape.ptIndexOffset = totalNumDrawpoints;
        totalNumDrawpoints += shape.drawpoints.length;
        shape.applyTransform();
    }
}

/**
 * Create DAT.GUI interface
 * @param svgToCanvas function for drawing and rendering a SVG url
 */
export function makeGUI(svgToCanvas) {

    gui = generateGUI(gui);
    interactiveModal = makeInteractiveModal();
    fileUpload = makeFileUpload();
    document.body.appendChild(interactiveModal);

    fileUpload.onchange = handleSVGUpload;


    function handleSVGUpload() {
        console.log("file uploaded");
        const file = this.files[0];

        if (!file.type.match(/svg/g)) {
            alert("Only SVGs allowed");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            const url = event.target.result;
            clearCapture();
            svgToCanvas(url);
            determineShapes();
            interactiveConversion.draw();
        };

        reader.readAsDataURL(file);
    }
}