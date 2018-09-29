import "../css/main.css";

export function makeCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = "tester";
    canvas.width = 500;
    canvas.height = 500;
    return canvas;
}

export function makeInteractiveModal() {
    const modal = document.createElement('div');
    modal.id = "interactive_modal";
    const closeModal = document.createElement('span');
    closeModal.id = "interactive_modal_top_bar";
    closeModal.innerText = "Close";

    closeModal.onclick = function() {
        modal.style.visibility = "hidden";
    };

    const textArea = document.createElement('textarea');
    textArea.spellcheck = false;
    textArea.value = "drawpoint code will be printed here when you execute";

    modal.appendChild(closeModal);
    modal.appendChild(textArea);
    return modal;
}

export function makeMainContainer() {
    const div = document.createElement('div');
    div.style.display = "flex";
    div.style.flexDirection = "row";
    return div;
}