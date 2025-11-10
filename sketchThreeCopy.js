//"type-logo-u3uywzkpvvc"
//"layout-layout-layout-zyyvhgi8num"
const CHANNEL = "layout-layout-layout-zyyvhgi8num";
const API_URL = `https://api.are.na/v2/channels/${CHANNEL}?per=200`;

let blocks = [];
let loaded = false;
let showImage = true;
let toggleBtn;
let blockSlider, blockLabel;
let pixelSlider, pixelLabel;
let visibleCount = 200;
let pixelSize = 4; ///////////size
let textGraphic;
let pixelPoints = [];
let maskImg;

function preload() {
  maskImg = loadImage("are.na-logo.png"); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();

  ///////////////// TOGGLE BUTTON
  if (!toggleBtn) {
    toggleBtn = createButton("Toggle Filter");
    toggleBtn.position(width - 140, 20);
    toggleBtn.style("background", "black");
    toggleBtn.style("color", "white");
    toggleBtn.style("padding", "10px 16px");
    toggleBtn.style("border", "none");
    toggleBtn.style("border-radius", "6px");
    toggleBtn.style("font-family", "Helvetica, Arial, sans-serif");
    toggleBtn.style("cursor", "pointer");
    toggleBtn.mousePressed(() => {
      showImage = !showImage;
      redraw();
    });
  }

  //////////////////// BLOCK COUNT SLIDER
  // if (!blockSlider) {
  //   blockLabel = createDiv("Blocks shown: " + visibleCount);
  //   blockLabel.position(20, 20);
  //   blockLabel.style("font-family", "Helvetica, Arial, sans-serif");
  //   blockLabel.style("font-size", "14px");

  //   blockSlider = createSlider(1, 110, visibleCount, 1);
  //   blockSlider.position(20, 50);
  //   blockSlider.style("width", "200px");

  //   blockSlider.input(() => {
  //     visibleCount = blockSlider.value();
  //     blockLabel.html("Blocks shown: " + visibleCount);
  //     redraw();
  //   });
  // }

  ///////////////////// PIXEL SIZE SLIDER 
  // if (!pixelSlider) {
  //   pixelLabel = createDiv("Pixel size: " + pixelSize);
  //   pixelLabel.position(20, 85);
  //   pixelLabel.style("font-family", "Helvetica, Arial, sans-serif");
  //   pixelLabel.style("font-size", "14px");

  //   pixelSlider = createSlider(4, 40, pixelSize, 1);
  //   pixelSlider.position(20, 110);
  //   pixelSlider.style("width", "200px");

  //   pixelSlider.input(() => {
  //     pixelSize = pixelSlider.value();
  //     pixelLabel.html("Pixel size: " + pixelSize);
  //     drawTextBitmap();
  //     redraw();
  //   });
  // }


  textGraphic = createGraphics(width, height);
  textGraphic.pixelDensity(1);
  drawTextBitmap();

  loadArenaBlocks();
}

///////are.na text 
function drawTextBitmap() {
  textGraphic.background(255);
  textGraphic.textAlign(CENTER, CENTER);
  textGraphic.textSize(width / 5);
  textGraphic.fill(0);
  textGraphic.textFont("Helvetica");
  textGraphic.text("Are.na", width / 2, height / 2);

  /////////creating pixels
  textGraphic.loadPixels();
  pixelPoints = [];
  for (let y = 0; y < textGraphic.height; y += pixelSize) {
    for (let x = 0; x < textGraphic.width; x += pixelSize) {
      const i = 4 * (x + y * textGraphic.width);
      const brightness = textGraphic.pixels[i];
      if (brightness < 40) {
        pixelPoints.push({ x, y });
      }
    }
  }
}


/////////loading are.na blocks function
async function loadArenaBlocks() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    blocks = data.contents.filter(b => b.image && b.image.display && b.image.display.url);

    if (blocks.length > 0) {
      let loadedCount = 0;
      for (let b of blocks) {
        loadImage(b.image.display.url, img => {
          b.p5image = img;
          loadedCount++;
          if (loadedCount === blocks.length) {
            loaded = true;
            redraw();
          }
        });
      }
    } else {
      console.warn("No image blocks found in channel.");
    }
  } catch (e) {
    console.error("Error fetching Are.na:", e);
  }
}

function draw() {
  background(255);
  if (!loaded || blocks.length === 0) {
    fill(100);
    textAlign(CENTER, CENTER);
    text("Loading Are.na blocks...", width / 2, height / 2);
    return;
  }

  const n = min(visibleCount, blocks.length);
  imageMode(CENTER);
  rectMode(CENTER);
  noStroke();

 
  // if (n === 1) {
  //   const b = blocks[0];
  //   const size = min(width, height) * 0.6;
  //   if (showImage && b.p5image) {
  //     image(b.p5image, width / 2, height / 2, size, size);
  //   } else {
  //     fill(0);
  //     rect(width / 2, height / 2, size, size);
  //   }
  //   return;
  // }

  
  const positions = shuffle(pixelPoints).slice(0, n);

  /////
  const densityFactor = map(pixelSize, 4, 40, 0.1, 0.2, true);
  const sizeFactor = map(n, 1, 150, 0.4, 0.02, true);
  const baseSize = min(width, height) * sizeFactor * densityFactor * 2;


  for (let i = 0; i < positions.length; i++) {
    const { x, y } = positions[i];
    const b = blocks[i % blocks.length];
    if (showImage && b.p5image) {
      image(b.p5image, x, y, baseSize, baseSize);
    } else {
      fill(0);
      rect(x, y, baseSize, baseSize);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  textGraphic.resizeCanvas(width, height);
  drawTextBitmap();
  redraw();
}
