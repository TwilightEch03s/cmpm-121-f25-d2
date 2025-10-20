import "./style.css";

// Display Interface
interface Display {
  drag(x: number, y: number): void;
  display(ctx: CanvasRenderingContext2D): void;
  getPoints(): { x: number; y: number }[];
  thickness: number;
}

//Make a marker line
function MarkerLine(x: number, y: number, thickness: number): Display {
  const points = [{ x, y }];

  return {
    thickness,
    drag(newX, newY) {
      points.push({ x: newX, y: newY });
    },
    display(ctx) {
      if (points.length == 0) {
        return;
      }
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.lineWidth = thickness;
      ctx.stroke();
    },
    getPoints() {
      return points;
    },
  };
}

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

ctx.lineCap = "round";
ctx.strokeStyle = "black";

// Set drawing handler
let drawing = false;
let current_thickness = 2;

// Set up line objects
const lines: Display[] = [];
let current_line: Display | null = null;
const redo_lines: Display[] = [];

//Redraw lines
function redraw() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const line of lines) {
      line.display(ctx);
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
  current_line = MarkerLine(event.offsetX, event.offsetY, current_thickness);
  lines.push(current_line);
  canvas.dispatchEvent(new Event("drawing-changed"));
});

// Mouse move = draw line at mouse postion
canvas.addEventListener("mousemove", (event: MouseEvent) => {
  if (!drawing || !current_line) {
    return;
  }
  current_line.drag(event.offsetX, event.offsetY);
  canvas.dispatchEvent(new Event("drawing-changed"));
});

// If mouse is released, stop drawing
canvas.addEventListener("mouseup", () => {
  drawing = false;
  current_line = null;
});

// If mouse exits canvas, stop drawing
canvas.addEventListener("mouseleave", () => {
  drawing = false;
  current_line = null;
});

// Make buttons appear below canvas
const buttonContainer = document.createElement("div");
buttonContainer.className = "button-container";
document.body.appendChild(buttonContainer);

// Clear button
const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
document.body.appendChild(clearButton);

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines.length = 0;
  redo_lines.length = 0;
  canvas.dispatchEvent(new Event("drawing-changed"));
});

// Undo button
const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
document.body.appendChild(undoButton);

undoButton.addEventListener("click", () => {
  if (lines.length > 0) {
    redo_lines.push(lines.pop()!);
    redraw();
  }
});

// Redo button
const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
document.body.appendChild(redoButton);

redoButton.addEventListener("click", () => {
  if (redo_lines.length > 0) {
    lines.push(redo_lines.pop()!);
    redraw();
  }
});

// Tool selection buttons
const toolsContainer = document.createElement("div");
toolsContainer.className = "tools-container";
document.body.appendChild(toolsContainer);

const thinButton = document.createElement("button");
thinButton.textContent = "Thin";
thinButton.classList.add("selectedTool");
toolsContainer.appendChild(thinButton);

const thickButton = document.createElement("button");
thickButton.textContent = "Thick";
toolsContainer.appendChild(thickButton);

// Tool switching
function selectTool(thickness: number, selectedButton: HTMLButtonElement) {
  current_thickness = thickness;
  [thinButton, thickButton].forEach((btn) =>
    btn.classList.remove("selectedTool")
  );
  selectedButton.classList.add("selectedTool");
}

thinButton.addEventListener("click", () => {
  selectTool(2, thinButton);
});

thickButton.addEventListener("click", () => {
  selectTool(6, thickButton);
});
