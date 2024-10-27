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
clearButton.innerHTML = "Clear Canvas";
clearButton.addEventListener("click", () => {
    strokes.length = 0;
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

const buttonContainer = document.createElement("div");

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
undoButton.addEventListener("click", undoStroke);

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
redoButton.addEventListener("click", redoStroke);

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

stickerButtons.forEach(sticker => {
    const stickerButton = document.createElement("button");
    stickerButton.innerHTML = sticker;
    stickerButton.addEventListener("click", () => setSticker(sticker));
    stickerElements.push(stickerButton);
    stickerDiv.append(stickerButton);
});

buttonContainer.append(clearButton, undoButton, redoButton, thinButton, thickButton);
app.append(header, canvas, stickerDiv, buttonContainer);

////**** Tool Selection Logic ****////
let currentTool: number | null = 2; //defaults to thin marker
let selectedSticker: string | null = null;

function setTool(toolSize: number) {
    currentTool = toolSize;
    selectedSticker = null;

    clearButtonSelection();

    if (toolSize === 2) {
        thinButton.classList.add("selectedTool");
    } else if (toolSize === 5) {
        thickButton.classList.add("selectedTool");
    }

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
const strokes: Stroke[] = [];

let toolPreview = new ToolPreview();

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    if (selectedSticker) {
        currentStroke = new Stroke(e.offsetX, e.offsetY, null, selectedSticker);
        strokes.push(currentStroke);
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    } else if (currentTool !== null) {
        currentStroke = new Stroke(e.offsetX, e.offsetY, currentTool);
        strokes.push(currentStroke);
    }

    //Move the preview away from the screen. It looks wacky when you start drawing
    toolPreview.movePreview(-100, -100);

});

canvas.addEventListener("mousemove", (e) => {
    if (isDrawing && currentStroke) {
        currentStroke.drag(e.offsetX, e.offsetY);
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    } else {
        toolPreview.movePreview(e.offsetX, e.offsetY);
        canvas.dispatchEvent(new CustomEvent("tool-moved"));
    }
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    currentStroke = null;
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
    toolPreview.display(canvasRenderer);
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