import "./style.css";

// Sticker interface
interface StickerDisplay extends Display {
  emoji: string;
}

// Sticker object
function Sticker(x: number, y: number, emoji: string): StickerDisplay {
  let position = { x, y };
  return {
    thickness: 1,
    emoji,
    drag(newX, newY) {
      position = { x: newX, y: newY };
    },
    display(ctx) {
      ctx.font = "32px serif";
      ctx.fillText(emoji, position.x - 16, position.y + 16);
    },
    getPoints() {
      return [position];
    },
  };
}

// Sticker preview
function StickerPreview(x: number, y: number, emoji: string): ToolPreview {
  return {
    display(ctx) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.font = "32px serif";
      ctx.fillText(emoji, x - 16, y + 16);
      ctx.restore();
    },
  };
}

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

// Tool preview
interface ToolPreview {
  display(ctx: CanvasRenderingContext2D): void;
}

// Track current sticker
let current_sticker: string | null = null;

function MarkerPreview(x: number, y: number, thickness: number): ToolPreview {
  return {
    display(ctx) {
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "gray";
      ctx.arc(x, y, thickness / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
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

// Tool preview
let current_tool_preview: ToolPreview | null = null;

//Redraw lines
function redraw() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const line of lines) {
      line.display(ctx);
    }
  }
  // Draw tool preview only if not drawing
  if (!drawing && current_tool_preview) {
    if (ctx) {
      current_tool_preview.display(ctx);
    }
  }
}

// Observer for "drawing-changed"
canvas.addEventListener("drawing-changed", () => {
  redraw();
});

// Observer for "tool-moved"
canvas.addEventListener("tool-moved", () => {
  redraw();
});

// Mouse clicked = draw
canvas.addEventListener("mousedown", (event: MouseEvent) => {
  if (current_sticker) {
    const sticker = Sticker(event.offsetX, event.offsetY, current_sticker);
    lines.push(sticker);
    current_tool_preview = null;
    canvas.dispatchEvent(new Event("drawing-changed"));
  } else {
    drawing = true;
    current_line = MarkerLine(event.offsetX, event.offsetY, current_thickness);
    lines.push(current_line);
    current_tool_preview = null;
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

// Mouse move = draw line at mouse postion
canvas.addEventListener("mousemove", (event: MouseEvent) => {
  if (drawing && current_line) {
    current_line.drag(event.offsetX, event.offsetY);
    canvas.dispatchEvent(new Event("drawing-changed"));
  } else if (current_sticker) {
    current_tool_preview = StickerPreview(
      event.offsetX,
      event.offsetY,
      current_sticker,
    );
    canvas.dispatchEvent(new Event("tool-moved"));
  } else {
    current_tool_preview = MarkerPreview(
      event.offsetX,
      event.offsetY,
      current_thickness,
    );
    canvas.dispatchEvent(new Event("tool-moved"));
  }
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
  current_tool_preview = null;
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
  current_sticker = null;
  current_tool_preview = null;
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

// Add sticker buttons
const stickerContainer = document.createElement("div");
stickerContainer.className = "sticker-container";
document.body.appendChild(stickerContainer);

const stickers = ["🌼", "🌸", "🌺"];
stickers.forEach((emoji) => {
  const btn = document.createElement("button");
  btn.textContent = emoji;
  btn.classList.add("stickerButton");
  stickerContainer.appendChild(btn);

  btn.addEventListener("click", () => {
    current_sticker = emoji;
    current_tool_preview = null;
    canvas.dispatchEvent(new Event("tool-moved"));
  });
});
