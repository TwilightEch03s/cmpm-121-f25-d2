import "./style.css";

// Create title
const title = document.createElement("h1");
title.textContent = "Sticker Sketchpad";
document.body.appendChild(title);

// Create canvas
const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;
canvas.className = "app-canvas";
document.body.appendChild(canvas);

// Setup drawing context
const ctx = canvas.getContext("2d");

//Check if ctx exists
if (!ctx) {
  throw new Error("Unable to get 2D context");
}

ctx.lineWidth = 2;
ctx.lineCap = "round";
ctx.strokeStyle = "black";

// Set drawing handler
let drawing = false;

// Set up points
const points: { x: number; y: number }[][] = [];
let current_point: { x: number; y: number }[] = [];

//Redraw lines
function redraw() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const line of points) {
      if (line.length == 0) {
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(line[0].x, line[0].y);
      for (let i = 1; i < line.length; i++) {
        ctx.lineTo(line[i].x, line[i].y);
        ctx.stroke();
      }
    }
  }
}

// Observer for "drawing-changed"
canvas.addEventListener("drawing-changed", () => {
  redraw();
});

// Mouse clicked = draw
canvas.addEventListener("mousedown", (event: MouseEvent) => {
  drawing = true;
  current_point = [{ x: event.offsetX, y: event.offsetY }];
  points.push(current_point);
  canvas.dispatchEvent(new Event("drawing-changed"));
});

// Mouse move = draw line at mouse postion
canvas.addEventListener("mousemove", (event: MouseEvent) => {
  if (!drawing) {
    return;
  }
  current_point.push({ x: event.offsetX, y: event.offsetY });
  canvas.dispatchEvent(new Event("drawing-changed"));
});

// If mouse is released, stop drawing
canvas.addEventListener("mouseup", () => {
  drawing = false;
});

// If mouse exits canvas, stop drawing
canvas.addEventListener("mouseleave", () => {
  drawing = false;
});
