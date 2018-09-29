import * as dat from "dat.gui";
import capture from "call-capture";
import {makeFileUpload, makeInteractiveModal} from "./make_dom";

const capturedCtx = [];

function clearCapture() {
    for (let ctx of capturedCtx) {
        ctx.clearQueue();
    }
    capturedCtx.length = 0;
}

export function captureContext() {
    const oldGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function () {
        const ctx = capture(oldGetContext.apply(this, arguments));
        capturedCtx.push(ctx);
        return ctx;
    };
}


const toCaptureNames = ["moveTo", "lineTo", "quadraticCurveTo", "bezierCurveTo"];
const interactiveConversion = {
    draw() {
        console.log(`${capturedCtx.length} contexts captured`);
        for (let ctx of capturedCtx) {
            const drawCommands = [];

            console.log(ctx.queue);
            for (let cmd of ctx.queue) {
                cmd.execute();
                if (toCaptureNames.includes(cmd.name)) {
                    // TODO label the drawpoints numerically in the image
                    drawCommands.push(cmd);
                }
            }

            console.log(drawCommands);
        }

        displayInteractiveModal();

    },
    clear() {
        for (let ctx of capturedCtx) {
            const q = ctx.queue;
            ctx.queue = [];
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.executeAll();
            ctx.queue = q;
        }
    },
    upload() {
        fileUpload.click();
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

function generateGUI(gui) {
    if (gui) {
        gui.destroy();
    }
    gui = new dat.GUI();
    gui.add(interactiveConversion, "upload").name("upload SVG");
    gui.add(interactiveConversion, "draw");
    gui.add(interactiveConversion, "clear");

    return gui;
}

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