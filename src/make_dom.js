import "../css/main.css";

let generatedText;
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
    generatedText = document.createElement('textarea');
    generatedText.spellcheck = false;
    generatedText.value = "drawpoint code will be printed here when you execute";
    generatedText.style.height = "10em";
    generatedText.style.font = "0.7em consolas";

    // button to copy content
    const copy = document.createElement('button');
    copy.textContent = "Copy to Clipboard";
    copy.id = "copy_button";
    copy.onclick = function() {
        generatedText.select();
        document.execCommand("copy");
        changeExecutedText();
    };

    modal.appendChild(closeModal);
    modal.appendChild(generatedText);
    modal.appendChild(copy);
    return modal;
}

export function changeInteractiveModalText(textValue) {
    generatedText.value = textValue;
}

const executedText = document.getElementById("execute_text");
const pointDefText = document.getElementById("fixedpoint_text");
export function changeExecutedText() {
    executedText.value = [pointDefText.value, generatedText.value].join("\n");
}

export function makeFileUpload() {
    const input = document.createElement('input');
    input.style.visibility = "hidden";
    input.type = "file";
    input.id = "file-upload";
    input.accept = ".svg";
    return input;
}