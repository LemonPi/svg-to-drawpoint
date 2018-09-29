import * as dat from "dat.gui";
import capture from "call-capture";
import {makeInteractiveModal} from "./make_dom";

const capturedCtx = [];

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
        for (let ctx of capturedCtx) {
            const drawCommands = [];

            console.log(ctx.queue);
            for (let cmd of ctx.queue) {
                if (toCaptureNames.includes(cmd.name)) {
                    drawCommands.push(cmd);
                }
            }

            console.log(drawCommands);

            ctx.clearQueue();

            for (let cmd of drawCommands) {
                cmd.execute();
            }
            ctx.stroke();
            ctx.executeAll();
            ctx.clearQueue();
        }

        displayInteractiveModal();

    },
    clear() {
        for (let ctx of capturedCtx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.executeAll();
            ctx.clearQueue();
        }
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

function generateGUI(gui) {
    if (gui) {
        gui.destroy();
    }
    gui = new dat.GUI();
    gui.add(interactiveConversion, "draw");
    gui.add(interactiveConversion, "clear");
    return gui;
}

export function makeGUI() {
    gui = generateGUI(gui);
    interactiveModal = makeInteractiveModal();
    document.body.appendChild(interactiveModal);
}