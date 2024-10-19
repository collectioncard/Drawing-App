import "./style.css";

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
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
});

app.append(header, canvas, clearButton);

////**** Drawing with Mouse ****////
let isDrawing = false;
let cursorX = 0;
let cursorY = 0;

const canvasRenderer = canvas.getContext("2d")!;

canvas.addEventListener("mousedown", (e) => {
    cursorX = e.offsetX;
    cursorY = e.offsetY;
    isDrawing = true;
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;

    canvasRenderer.beginPath();
    canvasRenderer.moveTo(cursorX, cursorY);
    cursorX = e.offsetX;
    cursorY = e.offsetY;
    canvasRenderer.lineTo(cursorX, cursorY);
    canvasRenderer.stroke();
});

canvas.addEventListener("mouseup", () => {
    isDrawing = false;
});