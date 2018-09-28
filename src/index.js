import canvg from 'canvg';
import SVG from './test.svg';
import capture from 'call-capture';

function makeCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = "tester";
    canvas.width = 500;
    canvas.height = 500;
    return canvas;
}


const capturedCtx = [];
let textArea = null;

function captureContext() {
    const oldGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function () {
        const ctx = capture(oldGetContext.apply(this, arguments));
        capturedCtx.push(ctx);
        return ctx;
    };
}

const toCaptureNames = ["moveTo", "lineTo", "quadraticCurveTo", "bezierCurveTo"];

function makeDrawButton() {
    const btn = document.createElement('button');
    btn.textContent = "draw queued commands";
    btn.onclick = function () {
        console.log("Button clicked");

        for (let ctx of capturedCtx) {
            const drawCommands = [];

            console.log(ctx.queue);
            for (let cmd of ctx.queue) {
                if (toCaptureNames.includes(cmd.name)) {
                    drawCommands.push(cmd);
                }
            }

            console.log(drawCommands);

            // ctx.executeAll();
            ctx.clearQueue();

            for (let cmd of drawCommands) {
                cmd.execute();
            }
            ctx.stroke();
            ctx.executeAll();
            ctx.clearQueue();
        }

    };
    return btn;
}

function makeTextArea() {
    textArea = document.createElement('textarea');
    textArea.spellcheck = false;
    textArea.rows = 40;
    textArea.cols = 60;
    textArea.value = "drawpoint code will be printed here when you execute";
    return textArea;
}

function makeClearButton() {
    const btn = document.createElement('button');
    btn.textContent = "clear canvas";
    btn.onclick = function () {
        for (let ctx of capturedCtx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.executeAll();
            ctx.clearQueue();
        }

    };
    return btn;
}

function makeMainContainer() {
    const div = document.createElement('div');
    div.style.display = "flex";
    div.style.flexDirection = "row";
    return div;
}

function makeButtonContainer() {
    const div = document.createElement('div');
    div.style.display = "flex";
    div.style.flexDirection = "column";
    return div;
}

captureContext();


const container = document.body.appendChild(makeMainContainer());
const canvas = container.appendChild(makeCanvas());
const buttonContainer = container.appendChild(makeButtonContainer());
buttonContainer.appendChild(makeDrawButton());
buttonContainer.appendChild(makeClearButton());
buttonContainer.appendChild(makeTextArea());

canvg(canvas,
    SVG,
    {
        log            : true,
        ignoreMouse    : true,
        ignoreAnimation: true,
        ignoreClear    : true,
        // ignoreDimensions: true,
    });
