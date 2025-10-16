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

// Mouse clicked = draw
canvas.addEventListener("mousedown", (event: MouseEvent) => {
  drawing = true;
  ctx.beginPath();
  ctx.moveTo(event.offsetX, event.offsetY);
});

// Mouse move = draw line at mouse postion
canvas.addEventListener("mousemove", (event: MouseEvent) => {
  if (!drawing) {
    return;
  }
  ctx.lineTo(event.offsetX, event.offsetY);
  ctx.stroke();
});

// If mouse is released, stop drawing
canvas.addEventListener("mouseup", () => {
  drawing = false;
});

// If mouse exits canvas, stop drawing
canvas.addEventListener("mouseleave", () => {
  drawing = false;
});
