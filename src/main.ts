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
thinButton.addEventListener("click", () => setTool("thin"));
thinButton.classList.add("selectedTool");

const thickButton = document.createElement("button");
thickButton.innerHTML = "Thick Marker";
thickButton.addEventListener("click", () => setTool("thick"));

buttonContainer.append(clearButton, undoButton, redoButton, thinButton, thickButton)
app.append(header, canvas,buttonContainer);

////**** Tool Selection Logic ****////
const tools = { thin: 2, thick: 5 };
let currentTool = tools.thin;

function setTool(tool: keyof typeof tools) {
    currentTool = tools[tool];

    //Keeping track of the buttons like this should help us scale up in the future if asked to add more tools
    //It might be better to automatically populate this later if it gets more complex
    const toolButtons = {thin :thinButton, thick: thickButton};

    Object.keys(toolButtons).forEach(key => toolButtons[key as keyof typeof toolButtons].classList.remove("selectedTool"));
    toolButtons[tool].classList.add("selectedTool");

    //Update the preview tool size
    toolPreview!.setToolSize(currentTool);
}

////**** Drawing with Mouse ****////
let isDrawing = false;
const strokes: Stroke[] = [];

let toolPreview = new ToolPreview(-1, -1, currentTool);

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    strokes.push(new Stroke(e.offsetX, e.offsetY, currentTool));
});

canvas.addEventListener("mousemove", (e) => {
    if(isDrawing) {
        strokes[strokes.length - 1].drag(e.offsetX, e.offsetY);
        canvas.dispatchEvent(new CustomEvent("drawing-changed"));
    }else {
        toolPreview!.movePreview(e.offsetX, e.offsetY);
        canvas.dispatchEvent(new CustomEvent("tool-moved"));
    }
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;

    //I want the preview to appear immediately after drawing
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
    toolPreview!.display(canvasRenderer);
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