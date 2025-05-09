let font;
let points = [];
let inputText = "ABCDEFGHIJKLMN";
let currentLayer = 0;
let input;

let slider_layers, slider_r, slider_threshold;
let labelLayers, labelR, labelThreshold;
let valLayers, valR, valThreshold;

let totalHeight = 800;

function preload() {
  font = loadFont("fonts/Roboto-Regular.ttf");
}

function setup() {
  let canvas = createCanvas(3000, totalHeight);
  canvas.parent("canvas-container");

  stroke(color(0, 15, 255));
  noFill();

  input = createElement("textarea", inputText);
  input.position(20, 20);
  input.size(300, 100); //input
  input.input(updateText);

  labelLayers = createP("Layers:");
  labelLayers.position(20, 130);
  slider_layers = createSlider(1, 50, 2, 1);
  slider_layers.position(180, 145);
  slider_layers.input(() => {
    valLayers.html(slider_layers.value());
    triggerRegenerate();
  });
  valLayers = createSpan(slider_layers.value());
  valLayers.position(350, 145);

  labelR = createP("Jitter Radius:");
  labelR.position(20, 160);
  slider_r = createSlider(1, 20, 1, 1);
  slider_r.position(180, 175);
  slider_r.input(() => {
    valR.html(slider_r.value());
    triggerRegenerate();
  });
  valR = createSpan(slider_r.value());
  valR.position(350, 175);

  labelThreshold = createP("Simplify Threshold:");
  labelThreshold.position(20, 190);
  slider_threshold = createSlider(0, 1.5, 1, 0.1);
  slider_threshold.position(180, 205);
  slider_threshold.input(() => {
    valThreshold.html(slider_threshold.value());
    triggerRegenerate();
  });
  valThreshold = createSpan(slider_threshold.value());
  valThreshold.position(350, 205);

  generatePoints();
}

function draw() {
  let layers = slider_layers.value();
  if (currentLayer < layers) {
    for (let letterPoints of points) {
      beginShape();
      for (let pt of letterPoints) {
        let angle =
          noise(pt.x * 0.01 + currentLayer, pt.y * 0.01 + currentLayer) *
          TWO_PI *
          2;
        let r = random(1, slider_r.value());
        let x = pt.x + cos(angle) * r;
        let y = pt.y + sin(angle) * r;
        curveVertex(x, y);
      }
      endShape();
    }
    currentLayer++;
  } else {
    noLoop();
  }
}

function updateText() {
  inputText = input.value();
  generatePoints();
  redraw();
}

function triggerRegenerate() {
  generatePoints();
  redraw();
}

function generatePoints() {
  background(255);
  currentLayer = 0;
  points = [];

  let lines = inputText.split("\n");
  let lineSpacing = 220;
  let fontSize = 160;

  // 初始高度
  totalHeight = 200 + lines.length * lineSpacing;

  //calculate the width automaticlly
  let maxLineWidth = 0;
  for (let line of lines) {
    let x = 50;
    for (let i = 0; i < line.length; i++) {
      const letter = line[i];
      const bounds = font.textBounds(letter, x, 0, fontSize);
      x += bounds.w + 20;
    }
    if (x > maxLineWidth) maxLineWidth = x;
  }

  resizeCanvas(maxLineWidth + 100, totalHeight);

  for (let j = 0; j < lines.length; j++) {
    let x = 50;
    let y = 400 + j * lineSpacing;
    for (let i = 0; i < lines[j].length; i++) {
      const letter = lines[j][i];
      const pts = font.textToPoints(letter, x, y, fontSize, {
        sampleFactor: 0.25,
        simplifyThreshold: slider_threshold.value(),
      });
      points.push(pts);
      const bounds = font.textBounds(letter, x, y, fontSize);
      x += bounds.w + 20;
    }
  }

  loop();
}

window.onload = () => {
  document
    .getElementById("download-btn")
    .addEventListener("click", async () => {
      const canvas = document.querySelector("canvas");
      const canvasImg = canvas.toDataURL("image/png");

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(canvasImg, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("poster.pdf");
    });
};
