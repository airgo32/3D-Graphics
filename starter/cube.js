"use strict";

import { gl, shaderProgram, setup, Transform } from "./cis487.js";
let transformUniform, colorUniform, overallTransform;

let mouseDownPoint = {X: 0, Y: 0}
let clicking = false

const BLACK  = [0.0, 0.0, 0.0];
const GREEN  = [0.0, 0.6, 0.3];
const RED    = [0.8, 0.0, 0.0];
const BLUE   = [0.1, 0.4, 0.8];
const ORANGE = [0.9, 0.5, 0.0];
const WHITE  = [0.9, 0.9, 0.9];
const YELLOW = [1.0, 0.8, 0.0];

// SPEED should be a factor of 90
// (or have an integer multiple equal to 90)
const SPEED = 2

setup("cube.vert", "cube.frag").then(main);

class SubCube {
  constructor(x, y, z) {
    this.x = this.x0 = x;
    this.y = this.y0 = y;
    this.z = this.z0 = z;
    this.transform = (new Transform()).translate(x, y, z);
  }

  drawSquare([r, g, b], outside = true) {
    overallTransform.push();
    overallTransform.translate(0, 0, 0.5);
    gl.uniformMatrix4fv(transformUniform, false,
      overallTransform.matrix);
    gl.uniform3f(colorUniform, ...BLACK);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    if (outside) {
      overallTransform.translate(0, 0, 0.001).scale(0.9, 0.9, 1);
      gl.uniformMatrix4fv(transformUniform, false,
        overallTransform.matrix);
      gl.uniform3f(colorUniform, r, g, b);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    overallTransform.pop();
  }

  draw() {
    overallTransform.push();
    overallTransform.multiplyBy(this.transform);
    this.drawSquare(GREEN,  this.z0 ==  1);  // +z
    overallTransform.rotate(90, "Y");
    this.drawSquare(RED,    this.x0 ==  1);  // +x
    overallTransform.rotate(90, "Y"); 
    this.drawSquare(BLUE,   this.z0 == -1);  // -z
    overallTransform.rotate(90, "Y");
    this.drawSquare(ORANGE, this.x0 == -1);  // -x
    overallTransform.rotate(90, "X");
    this.drawSquare(WHITE,  this.y0 == -1);  // -y
    overallTransform.rotate(180, "X");
    this.drawSquare(YELLOW, this.y0 ==  1);  // +y
    overallTransform.pop();
  }

  rotateXYZ(ccw, axis) {

    if (axis == "X") {
      let y = ccw ? -this.z : this.z;
      this.z = ccw ? this.y : -this.y;
      this.y = y;

    } else if (axis == "Y") {
      let x = ccw ? this.z : -this.z;
      this.z = ccw ? -this.x : this.x;
      this.x = x;
    
    } else { // Z
      let x = ccw ? -this.y : this.y;
      this.y = ccw ? this.x : -this.x;
      this.x = x;
    }
  }
}

let cv = document.querySelector("#canvas");



function main() {
  gl.clearColor(1, 1, 1, 1);
  gl.enable(gl.DEPTH_TEST);

  const vertexPositionAttribute = gl.getAttribLocation(
    shaderProgram, "position");
  gl.enableVertexAttribArray(vertexPositionAttribute);
  transformUniform = gl.getUniformLocation(
    shaderProgram, "transform");
  colorUniform = gl.getUniformLocation(
    shaderProgram, "color");

  let vertexData = [ -0.5,  0.5, 0,
                     -0.5, -0.5, 0,
                      0.5, -0.5, 0,
                      0.5,  0.5, 0 ];
  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData),
      gl.STATIC_DRAW);
  gl.vertexAttribPointer(vertexPositionAttribute,
      3, gl.FLOAT, false, 12, 0);

  overallTransform = new Transform();
  overallTransform.frustum(1, 0.75, 5, 35);
  overallTransform.translate(0, 0, -20);
  overallTransform.rotate(20, "X").rotate(-30, "Y");

  const subCubes = [ [ [],[],[] ],
                     [ [],[],[] ],
                     [ [],[],[] ] ];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        subCubes[i][j].push(new SubCube(i - 1, j - 1, k - 1));
        subCubes[i][j][k].draw();
      }
    }
  }

  function mousedownHandler(event) {
    // console.log(`down: ${event.pageX - cv.offsetLeft}, ${event.pageY - cv.offsetTop}`);
    clicking = true
    mouseDownPoint.X = event.pageX - cv.offsetLeft
    mouseDownPoint.Y = event.pageY - cv.offsetTop
    console.log("X: " + mouseDownPoint.X + "\nY: " + mouseDownPoint.Y)
  
    // console.log(mouseDownPoint)
  }
  
  function mouseupHandler(event) {
    // console.log(`up: ${event.pageX - cv.offsetLeft}, ${event.pageY - cv.offsetTop}`);
    if (clicking) {
      console.log("X distance: " + (event.pageX - cv.offsetLeft - mouseDownPoint.X)
       + "\nY distance: " + (event.pageY - cv.offsetTop - mouseDownPoint.Y))
      clicking = false


      let inverseTransform = Transform.invert(overallTransform)

      const cvvCoord = getCVVCoords(event)

      let negZCoord = [cvvCoord.X, cvvCoord.Y, -1, 0]
      let posZCoord = [cvvCoord.X, cvvCoord.Y, 1, 0]

      let negZTransformed = inverseTransform.transformVector(negZCoord)
      let posZTransformed = inverseTransform.transformVector(posZCoord)

      // console.log(negZTransformed)
      // console.log(posZTransformed)
      let xEquation = {
        intercept: negZTransformed[0],
        slope: posZTransformed[0] - negZTransformed[0]
      }
      let yEquation = {
        intercept: negZTransformed[1],
        slope: posZTransformed[1] - negZTransformed[1]
      }
      let zEquation = {
        intercept: negZTransformed[2],
        slope: posZTransformed[2] - negZTransformed[2]
      }

      let plane = determinePlane(xEquation, yEquation, zEquation)
      


  
      // new rotation
      const axes = ["X", "Y", "Z"]
      let randomAxis = Math.floor(Math.random() * 3)
      let randomGroup = 1 - Math.floor(Math.random() * 3)
      let randomCcw = Math.floor(Math.random() * 2)
      rotateGroup(axes[randomAxis], randomGroup, randomCcw == 1 ? true : false)
    }
    
  }
  
  cv.addEventListener("mousedown", mousedownHandler);
  window.addEventListener("mouseup", mouseupHandler);

  function getCVVCoords(event) {

    let coords = {
      X: ((event.pageX - cv.offsetLeft) / cv.width) * 2 - 1,
      Y: ((event.pageY - cv.offsetTop) / cv.height) * -2 + 1
    }

    return coords
  }

  function determinePlane(x, y, z) {

    // start with x
    let t = (1.5 - x.intercept) / x.slope

    let posY = y.slope * t + y.intercept
    let posZ = z.slope * t + z.intercept

    if (Math.abs(posY < 1.5) && Math.abs(posZ < 1.5)) return 'X'
  }

  function rotateGroup(axis, group, ccw) {
    cv.removeEventListener("mousedown", mousedownHandler);
    window.removeEventListener("mouseup", mouseupHandler);


    let inRotGroup;

    if      (axis == "X") inRotGroup = sc => sc.x == group;
    else if (axis == "Y") inRotGroup = sc => sc.y == group;
    else    /* Z */       inRotGroup = sc => sc.z == group;

    let f = 0;

    function animate() {
      let factor = (-Math.cos(f * SPEED * Math.PI / (45))+1) * SPEED

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          for (let k = 0; k < 3; k++) {
            let sc = subCubes[i][j][k];

            if (inRotGroup(sc)) {
              sc.transform.preRotate(ccw ? 1 * factor : -1 * factor, axis);
              if ((f + 1) % (90 / SPEED) == 0) sc.rotateXYZ(ccw, axis);
            }

            sc.draw();
          }
        }
      }
      
      if ((f + 1) % (90 / SPEED) == 0) {
        cv.addEventListener("mousedown", mousedownHandler);
        window.addEventListener("mouseup", mouseupHandler);
      }
      if (++f < 90 / SPEED) requestAnimationFrame(animate);
    }

    animate();
  }

  rotateGroup("Y", -1, true);
}