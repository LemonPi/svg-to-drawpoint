import "../css/main.css";

export function makeCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = "tester";
    canvas.width = 500;
    canvas.height = 500;
    canvas.style.border = "1px solid black";
    return canvas;
}

let textArea;
export function makeInteractiveModal() {
    const modal = document.createElement('div');
    modal.id = "interactive_modal";
    const closeModal = document.createElement('span');
    closeModal.id = "interactive_modal_top_bar";
    closeModal.innerText = "Close";

    closeModal.onclick = function() {
        modal.style.visibility = "hidden";
    };

    // TODO make textarea actually a pre.code div to allow code highlighting (highlight.js ?)
    textArea = document.createElement('textarea');
    textArea.spellcheck = false;
    textArea.value = "drawpoint code will be printed here when you execute";
    textArea.style.height = "10em";
    textArea.style.font = "0.7em consolas";

    // button to copy content
    const copy = document.createElement('button');
    copy.textContent = "Copy to Clipboard";
    copy.id = "copy_button";
    copy.onclick = function() {
        textArea.select();
        document.execCommand("copy");
    };

    modal.appendChild(closeModal);
    modal.appendChild(textArea);
    modal.appendChild(copy);
    return modal;
}

export function changeInteractiveModalText(textValue) {
    textArea.value = textValue;
}

export function makeMainContainer() {
    const div = document.createElement('div');
    div.style.display = "flex";
    div.style.flexDirection = "row";
    return div;
}

export function makeFileUpload() {
    const input = document.createElement('input');
    input.style.visibility = "hidden";
    input.type = "file";
    input.id = "file-upload";
    input.accept = ".svg";
    return input;
}