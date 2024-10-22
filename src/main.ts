import "./style.css";
import { Stroke } from "./Stroke.ts";

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

const undoButton = document.createElement("button");
undoButton.innerHTML = "Undo";
undoButton.addEventListener("click", undoStroke);

const redoButton = document.createElement("button");
redoButton.innerHTML = "Redo";
redoButton.addEventListener("click", redoStroke);

app.append(header, canvas, clearButton, undoButton, redoButton);

////**** Drawing with Mouse ****////
let isDrawing = false;

interface Point { x: number, y: number }
const strokes: Stroke[] = [];

canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    strokes.push(new Stroke(e.offsetX, e.offsetY));
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;

    strokes[strokes.length - 1].drag(e.offsetX, e.offsetY);
    canvas.dispatchEvent(new CustomEvent("drawing-changed"));
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
});

canvas.addEventListener("drawing-changed", () => {
    const canvasRenderer = canvas.getContext("2d")!;
    canvasRenderer.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    strokes.forEach(stroke => stroke.display(canvasRenderer));
    console.log(strokes);
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