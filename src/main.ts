import "./style.css";
import { Stroke } from "./Stroke.ts";
import { ToolPreview } from "./ToolPreview";

const APP_NAME = "Drawing App";
const CANVAS_SIZE = 256;
const app = document.querySelector<HTMLDivElement>("#app")!;

////**** Page Content ****////
document.title = APP_NAME;

const header = document.createElement("h1");
header.innerHTML = APP_NAME;

const canvas = document.createElement("canvas");
canvas.width = canvas.height = CANVAS_SIZE;

const clearButton = document.createElement("button");
clearButton.innerHTML = "Clear Canvas...";
clearButton.addEventListener("click", () => {
    const confirmClear = confirm("Are you sure you want to clear your drawing?");
    if (confirmClear){
        strokes.length = 0;
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    }
});

const utilityButtonContainer = document.createElement("div");

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
undoButton.addEventListener("click", undoStroke);

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
redoButton.addEventListener("click", redoStroke);

const colorPickerButton = document.createElement("input");
colorPickerButton.type = "color";
colorPickerButton.value = "#000000"; // Default color is black
colorPickerButton.addEventListener("input", (e) => {
    selectedColor = (e.target as HTMLInputElement).value;
    toolPreview.setColor(selectedColor);
});

const exportButton = document.createElement("button");
exportButton.innerHTML = "Export";
exportButton.addEventListener("click", exportCanvas);

const drawingToolsContainer = document.createElement("div");

const thinButton = document.createElement("button");
thinButton.innerHTML = "Thin Marker";
thinButton.addEventListener("click", () => setTool(2));
thinButton.classList.add("selectedTool");

const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick Marker";
thickButton.addEventListener("click", () => setTool(5));


const stickerDiv = document.createElement("div");

const stickerButtons: string[] = ["🐢", "🎃", "🔥"];
const stickerElements: HTMLButtonElement[] = [];

const customStickerButton = document.createElement("button");
customStickerButton.innerHTML = "Custom Sticker";
customStickerButton.addEventListener("click", () => {
    const customSticker = prompt("Custom sticker text:", "💚");
    if (customSticker) {
        stickerButtons.lastIndexOf(customSticker) === -1 ? stickerButtons.push(customSticker) : null;
        refreshStickerButtons();
        setSticker(customSticker);
    }
});

refreshStickerButtons() // Initialize sticker buttons

drawingToolsContainer.append(thinButton, thickButton, colorPickerButton);
utilityButtonContainer.append(clearButton, undoButton, redoButton, exportButton);
app.append(header, canvas, stickerDiv, drawingToolsContainer, utilityButtonContainer);

////**** Tool Selection Logic ****////
let currentTool: number | null = 2; //defaults to thin marker
let selectedSticker: string | null = null;

function setTool(toolSize: number) {
    currentTool = toolSize;
    selectedSticker = null;

    clearButtonSelection();

    toolSize === 2 ? thinButton.classList.add("selectedTool") : thickButton.classList.add("selectedTool");

    toolPreview!.setToolSize(toolSize);
}

function setSticker(sticker: string) {
    currentTool = null;
    selectedSticker = sticker;
    clearButtonSelection();
    stickerElements.forEach(button => {
        if (button.innerHTML === sticker) button.classList.add("selectedTool");
    });

    toolPreview.setSticker(sticker);
}

////**** Drawing with Mouse ****////
let isDrawing = false;
let currentStroke: Stroke | null = null;
let selectedColor = "#000000";

const strokes: Stroke[] = [];

let toolPreview = new ToolPreview();
let hidePreview : boolean = false;

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    hidePreview = true;
    if (selectedSticker) {
        currentStroke = new Stroke(e.offsetX, e.offsetY, null, selectedSticker);
        strokes.push(currentStroke);
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    } else if (currentTool !== null) {
        currentStroke = new Stroke(e.offsetX, e.offsetY, currentTool, null, selectedColor);
        strokes.push(currentStroke);
    }
});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && currentStroke) {
        currentStroke.drag(e.offsetX, e.offsetY);
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    } else {
        hidePreview = false;
        toolPreview.movePreview(e.offsetX, e.offsetY);
        canvas.dispatchEvent(new CustomEvent("tool-moved"));
    }
});

canvas.addEventListener("mouseup", () => {
    currentStroke = null;
    canvas.dispatchEvent(new CustomEvent("tool-moved"));
});

canvas.addEventListener("mouseout", () => {
    hidePreview = true
    canvas.dispatchEvent(new CustomEvent("tool-moved"));
});

canvas.addEventListener("drawing-changed", () => {
    const canvasRenderer = canvas.getContext("2d")!;
    canvasRenderer.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    strokes.forEach(stroke => stroke.display(canvasRenderer));
});

canvas.addEventListener("tool-moved", () => {
    const canvasRenderer = canvas.getContext("2d")!;
    canvasRenderer.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    strokes.forEach(stroke => stroke.display(canvasRenderer));
    if (!hidePreview) {
        toolPreview.display(canvasRenderer);
    }
});

////**** Redo/Undo ****////
const undoStack: Stroke[] = [];

function undoStroke() {
    if (strokes.length) {
        undoStack.push(strokes.pop()!);
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    }
}

function redoStroke() {
    if (undoStack.length) {
        strokes.push(undoStack.pop()!);
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    }
}

////**** Helper Functions ****////
function clearButtonSelection() {
    thinButton.classList.remove("selectedTool");
    thickButton.classList.remove("selectedTool");
    stickerElements.forEach(button => button.classList.remove("selectedTool"));
}

function refreshStickerButtons() {
    stickerElements.length = 0;
    stickerDiv.innerHTML = '';

    stickerButtons.forEach(sticker => {
        const stickerButton = document.createElement("button");
        stickerButton.innerHTML = sticker;
        stickerButton.addEventListener("click", () => setSticker(sticker));
        stickerElements.push(stickerButton);
        stickerDiv.append(stickerButton);
    });

    stickerDiv.append(customStickerButton);
}

function exportCanvas() {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = exportCanvas.height = 1024;

    const exportContext = exportCanvas.getContext("2d")!;
    exportContext.scale(4, 4);
    strokes.forEach(stroke => stroke.display(exportContext));

    const link = document.createElement("a");
    link.href = exportCanvas.toDataURL( "image/png");
    link.download = "drawing.png";
    link.click();
}