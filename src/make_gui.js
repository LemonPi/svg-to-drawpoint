import * as dat from "dat.gui";
import capture from "call-capture";
import {makeFileUpload, makeInteractiveModal} from "./make_dom";
import {extractDrawpoint} from "./extract_drawpoint";

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
 * @param numberDrawpoints
 */
function generateFixedPointGUI(numDrawpoints) {
    if (fixedPointFolder) {
        gui.removeFolder(fixedPointFolder);
    }

    fixedPointFolder = gui.addFolder("add fixed point");
    // constrain order when we know how many drawpoints exist
    fixedPointOrder = fixedPointFolder.add(fixedPointInteraction, "order").min(0).max(numDrawpoints - 1).step(1);
    fixedPointFolder.add(fixedPointInteraction, "name");
    fixedPointFolder.add(fixedPointInteraction, "add");
    fixedPointFolder.add(fixedPointInteraction, "remove");
}

// TODO consider the other drawing methods like arc
const toCaptureNames = ["moveTo", "lineTo", "quadraticCurveTo", "bezierCurveTo"];
let drawCommands = [];
let preambleCommands = [];
let postCommands = [];
let drawpoints = [];
/**
 * GUI elements for interaction on the side
 */
const interactiveConversion = {
    scale: 1,
    draw() {
        drawCommands = [];
        preambleCommands = [];
        postCommands = [];
        drawpoints = [];

        let startedDrawing = false;

        console.log(ctx.queue);
        for (let cmd of ctx.queue) {
            cmd.execute();
            // actual drawing commands are in between pre and post commands
            if (toCaptureNames.includes(cmd.name)) {
                startedDrawing = true;
                drawCommands.push(cmd);
                drawpoints.push(extractDrawpoint(cmd));
            } else if (startedDrawing === false) {
                preambleCommands.push(cmd);
            } else {
                postCommands.push(cmd);
            }
        }

        console.log(drawCommands);
        console.log(drawpoints);
        // now we have information on what to draw we can add GUI for drawing
        generateFixedPointGUI(drawCommands.length);

        drawFixedPoints();
        displayInteractiveModal();

    },
    clear() {
        const q = ctx.queue;
        ctx.queue = [];
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.executeAll();
        ctx.queue = q;
    },
    upload() {
        fileUpload.click();
    },
};

function drawFixedPoints() {
    ctx.pauseCapture();
    for (let cmd of preambleCommands) {
        cmd.execute();
    }
    ctx.fillStyle = "red";
    ctx.font = "8px consolas";

    fixedPts.forEach((name, index) => {
        if (!name) {
            return;
        }
        const x = drawpoints[index].x;
        const y = drawpoints[index].y;
        const s = 1;
        ctx.fillRect(x-s/2, y-s/2, s, s);
        ctx.fillText(name, x+2*s, y);
    });
    for (let cmd of postCommands) {
        cmd.execute();
    }
    ctx.resumeCapture();
}

// assume fixed points are given to us (including control points)
const fixedPts = [];
const fixedPointInteraction = {
    order: 0,
    name: "p1",
    add() {
        fixedPts[this.order] = this.name;
        // label on canvas
        drawFixedPoints();
    },
    remove() {
        fixedPts[this.order] = undefined;
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
    gui.add(interactiveConversion, "scale").min(0).max(3);

    return gui;
}


/**
 * Create DAT.GUI interface
 * @param drawer function for drawing and rendering a SVG url
 */
export function makeGUI(drawer) {

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
            drawer(url);
        };

        reader.readAsDataURL(file);
    }
}