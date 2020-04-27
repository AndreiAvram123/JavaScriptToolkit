/*!
 * UX Heatmap 🔥
 *
 * Author: Adam Jones
 * Version: 3
 *
 * Notes:
 * Opening DevTools in Chrome will effect how the heatmap is drawn.
 * More info here: https://stackoverflow.com/questions/27367448/why-do-i-get-better-performance-in-chrome-when-dev-console-is-up
 * 
*/


"use strict";

let recordedPoints = [];
let boundaries = {};
const heatmap = {};


heatmap.recordedPoints = [];
// Initialises the heatmap
heatmap.init = () => {
    // Create the heatmap canvas and append to document body
    const $canvas = document.createElement("canvas");
    $canvas.width = document.body.clientWidth;
    $canvas.height = document.body.clientHeight;
    $canvas.style.position = "absolute";
    $canvas.style.top = "0";
    $canvas.style.left = "0";
    $canvas.style.pointerEvents = "none";
    $canvas.style.opacity = "0";
    document.body.appendChild($canvas);

    heatmap.canvas = $canvas;
    heatmap.ctx = $canvas.getContext("2d");
    heatmap.width = $canvas.width;
    heatmap.height = $canvas.height;

    // Change these values to fine-tune the effect
    heatmap.radius = 20;
    heatmap.blur = 15;
    heatmap.max = 10;
    heatmap.minOpacity = 0.05;

    // Change these values for different colour schemes
    heatmap.gradientScale = {
        1.0: "#9F0040",
        0.9: "#F57545",
        0.7: "#F1F9A8",
        0.5: "#5FBDA9",
        0.3: "#3088BE",
    };

    heatmap.data = [];
    heatmap.frame = null;
    heatmap.gradient = null;
    heatmap.shape = null;
    heatmap.shapeSize = null;

    window.addEventListener("mousemove", e => {
        heatmap.data.push([e.layerX, e.layerY, 1]);
        let point = {}
        point.x = e.layerX;
        point.y = e.layerY;
        recordedPoints.push(point);
        heatmap.frame = heatmap.frame || window.requestAnimationFrame(heatmap.drawFrame);
    });


    heatmap.createGradient();
    heatmap.createShape();
};

// Creates a black+white blurry circle to use as the "brush"
heatmap.createShape = () => {
    heatmap.shape = document.createElement("canvas");
    heatmap.shapeSize = heatmap.radius + heatmap.blur;
    heatmap.shape.width = heatmap.shape.height = heatmap.shapeSize * 2;

    const ctx = heatmap.shape.getContext("2d");

    ctx.shadowOffsetX = ctx.shadowOffsetY = heatmap.shapeSize * 2;
    ctx.shadowBlur = heatmap.blur;
    ctx.shadowColor = "black";

    ctx.beginPath();
    ctx.arc(-heatmap.shapeSize, -heatmap.shapeSize, heatmap.radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
};

//draw lines to visually represent the 6 areas
heatmap.drawAreaLines = () => {
    let ctx = heatmap.ctx;
    ctx.beginPath();
    ctx.moveTo(0, boundaries.topLeft.y + window.innerHeight/2);
    ctx.lineTo(window.innerWidth, window.innerHeight/2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(window.innerWidth/3, 0);
    ctx.lineTo(window.innerWidth / 3,window.innerHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo((window.innerWidth / 3) * 2, 0);
    ctx.lineTo((window.innerWidth / 3) * 2, window.innerHeight);
    ctx.stroke();


}

// Creates a 256x1 line of colour gradient
heatmap.createGradient = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);

    canvas.width = 1;
    canvas.height = 256;

    for (const i in heatmap.gradientScale) {
        gradient.addColorStop(i, heatmap.gradientScale[i]);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1, 256);
    heatmap.gradient = ctx.getImageData(0, 0, 1, 256).data;


};

// Draws the heatmap to canvas
heatmap.draw = () => {
    const ctx = heatmap.ctx;
    ctx.clearRect(0, 0, heatmap.width, heatmap.height);

    for (let i = 0; i < heatmap.data.length; i++) {
        const point = heatmap.data[i];
        ctx.globalAlpha = Math.min(Math.max(point[2] / heatmap.max, heatmap.minOpacity), 1);
        ctx.drawImage(heatmap.shape, point[0] - heatmap.shapeSize, point[1] - heatmap.shapeSize);
    }

    const canvasImage = ctx.getImageData(0, 0, heatmap.width, heatmap.height);
    heatmap.colourise(canvasImage.data);
    heatmap.ctx.putImageData(canvasImage, 0, 0);
    heatmap.drawAreaLines();
};

// Draws and resets the frame
heatmap.drawFrame = () => {
    heatmap.draw();
    heatmap.frame = null;
};

// Colourises pixels based on their opacity using the gradient line
heatmap.colourise = pixels => {
    for (let i = 0, j; i < pixels.length; i += 4) {
        j = pixels[i + 3] * 4;

        if (j) {
            pixels[i] = heatmap.gradient[j];
            pixels[i + 1] = heatmap.gradient[j + 1];
            pixels[i + 2] = heatmap.gradient[j + 2];
        }
    }
};


// Export the heatmap
heatmap.export = () => {
    const img = heatmap.canvas.toDataURL("image/png");
    const w = window.open("about:blank", "image from canvas");
    w.document.write("<img src='" + img + "' alt='from canvas'/>");
    w.document.close();
};

function startHeatmap() {
    heatmap.init();

    let topLeft = {}
    topLeft.x = 0;
    topLeft.y = 0;
    let topCenter = {}
    topCenter.x = topLeft.x + window.innerWidth / 3;
    topCenter.y = 0;
    let topRight = {};
    topRight.x = topCenter.x + window.innerWidth / 3;
    topRight.y = 0;
    let bottomLeft = {};
    bottomLeft.x = 0;
    bottomLeft.y = window.innerHeight / 2;
    let bottomCenter = {};
    bottomCenter.x = bottomLeft.x + window.innerWidth / 3
    bottomCenter.y = window.innerHeight / 2;
    let bottomRight = {};
    bottomRight.x = bottomCenter.x + window.innerWidth / 3;
    bottomRight.y = window.innerHeight / 2;

    boundaries.topLeft = topLeft;
    boundaries.topCenter = topCenter;
    boundaries.topRight = topRight;
    boundaries.bottomLeft = bottomLeft;
    boundaries.bottomCenter = bottomCenter;
    boundaries.bottomRight = bottomRight;
}

function getAverageAreaData() {
    let dataObject = {};
    dataObject.topLeft = getAverageTimeArea(boundaries.topLeft);
    dataObject.topCenter = getAverageTimeArea(boundaries.topCenter)
    dataObject.topRight = getAverageTimeArea(boundaries.topRight);
    dataObject.bottomLeft = getAverageTimeArea(boundaries.bottomLeft);
    dataObject.bottomCenter = getAverageTimeArea(boundaries.bottomCenter);
    dataObject.bottomRight = getAverageTimeArea(boundaries.bottomRight);

    function getAverageTimeArea(boundary) {
        let numberOfElementsInArea = 0;
        recordedPoints.forEach(element => {
            if (element.x >= boundary.x && element.x <= boundary.x + document.body.clientWidth / 3
                && element.y >= boundary.y && element.y <= boundary.y + document.body.clientHeight / 2) {
                numberOfElementsInArea++;
            }
        })
        if (numberOfElementsInArea > 0) {
            let roundedNumber = Math.round((100 * numberOfElementsInArea) / recordedPoints.length);
            return roundedNumber;
        } else {
            return 0;
        }
    }

    return dataObject;
}


