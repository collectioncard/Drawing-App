import "./style.css";

const APP_NAME = "Drawing App";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

const header = document.createElement("h1");
header.innerHTML = APP_NAME;
app.append(header);

const canvas = document.createElement("canvas");
canvas.width = canvas.height = 256;
app.appendChild(canvas);