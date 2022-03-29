"use strict";
/**
 * Robbie Dorsey
 * Rubik's Cube Part 2
 * 
 * Extra features:
 * - Cube scrambles when page is first loaded
 * - Arrow keys rotate the whole cube at once, around either the X or Y axis
 */
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

// speed should be a factor of 90
// (or have an integer multiple equal to 90)
let speed = 5

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
  overallTransform.rotate(25, "X").rotate(-45, "Y");

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
    clicking = true
    speed = 5
    mouseDownPoint.X = event.pageX
    mouseDownPoint.Y = event.pageY
  }
  
  function mouseupHandler(event) {

    const mouseUpPoint = {
      X: event.pageX,
      Y: event.pageY,
    }
    
    if (clicking) {
      clicking = false

      let inverseTransform = Transform.invert(overallTransform)

      const downCoord = getCVVCoords(mouseDownPoint)
      const upCoord = getCVVCoords(mouseUpPoint)

      // get the inverted coordinates for the line through the CVV from the mouse press
      let downNegZCoord = [downCoord.X, downCoord.Y, -1, 1]
      let downPosZCoord = [downCoord.X, downCoord.Y, 1, 1]
      let downNegZTransformed = inverseTransform.transformVector(downNegZCoord)
      let downPosZTransformed = inverseTransform.transformVector(downPosZCoord)

      // get the inverted coordinates for the line through the CVV from the mouse release
      let upNegZCoord = [upCoord.X, upCoord.Y, -1, 1]
      let upPosZCoord = [upCoord.X, upCoord.Y, 1, 1]
      let upNegZTransformed = inverseTransform.transformVector(upNegZCoord)
      let upPosZTransformed = inverseTransform.transformVector(upPosZCoord)

      // get the plane that was initially clicked
      let plane = determinePlane(downPosZTransformed, downNegZTransformed)

      // get the coordinates relative to the clicked on plane ( (X, Y), (X, Z) or (Y, Z) )
      let downPlaneCoords = getPlaneCoords(plane, downPosZTransformed, downNegZTransformed)
      let upPlaneCoords = getPlaneCoords(plane, upPosZTransformed, upNegZTransformed)

      // axis closest matching the drag, as well as the distance dragged
      let dir = dragDirection(downPlaneCoords, upPlaneCoords)

      // get the subcube coordinates of the plane clicked (either -1, 0, or 1)
      let downSubCoords = convertToSubCubeCoords(downPlaneCoords)

      if (dir.distance) { // if the user clicks but doesn't drag, don't do a rotation

        if (plane == "X") {
          if (dir.direction == "Y") {
            rotateGroup("Z", downSubCoords.Z, dir.distance > 0)

          } else {
            rotateGroup("Y", downSubCoords.Y, dir.distance < 0)
          }
        }

        if (plane == "Y") {
          if (dir.direction == "X") {
            rotateGroup("Z", downSubCoords.Z, dir.distance < 0)

          } else {
            rotateGroup("X", downSubCoords.X, dir.distance > 0)
          }
        }

        if (plane == "Z") {
          if (dir.direction == "X") {
            rotateGroup("Y", downSubCoords.Y, dir.distance > 0)

          } else {
            rotateGroup("X", downSubCoords.X, dir.distance < 0)
          }
        }
      }
    }
  }

  function keyDownHandler(event) {
    speed = 5
    switch (event.code) {
      case "ArrowLeft":
        rotateGroup("Y", 2, false)
        break;

      case "ArrowRight":
        rotateGroup("Y", 2, true)
        break;

      case "ArrowUp":
        rotateGroup("X", 2, false)
        break;

      case "ArrowDown":
        rotateGroup("X", 2, true)
        break;
    }
  }
  
  cv.addEventListener("mousedown", mousedownHandler);
  window.addEventListener("mouseup", mouseupHandler);
  window.addEventListener("keydown",  keyDownHandler);

   

  function getCVVCoords(rawCoords) {

    let coords = {
      X: ((rawCoords.X - cv.offsetLeft) / cv.width) * 2 - 1,
      Y: ((rawCoords.Y - cv.offsetTop) / cv.height) * -2 + 1
    }

    return coords
  }

  function determinePlane(posCoord, negCoord) {

    let t, posX, posY, posZ

    const xEqu = {
      intercept: negCoord[0],
      change: posCoord[0] - negCoord[0]
    }
    const yEqu = {
      intercept: negCoord[1],
      change: posCoord[1] - negCoord[1]
    }
    const zEqu = {
      intercept: negCoord[2],
      change: posCoord[2] - negCoord[2]
    }

    // start with x
    t = (1.5 - xEqu.intercept) / xEqu.change

    posY = yEqu.change * t + yEqu.intercept
    posZ = zEqu.change * t + zEqu.intercept

    if (Math.abs(posY) < 1.5 && Math.abs(posZ) < 1.5) return 'X'

    // then y

    t = (1.5 - yEqu.intercept) / yEqu.change

    posX = xEqu.change * t + xEqu.intercept
    posZ = zEqu.change * t + zEqu.intercept

    if (Math.abs(posX) < 1.5 && Math.abs(posZ) < 1.5) return 'Y'

    // then z

    t = (1.5 - zEqu.intercept) / zEqu.change

    posX = xEqu.change * t + xEqu.intercept
    posY = yEqu.change * t + yEqu.intercept

    if (Math.abs(posX) < 1.5 && Math.abs(posY) < 1.5) return 'Z'

    // If we don't hit the cube, return false
    return false;
  }

  function getPlaneCoords(plane, posCoord, negCoord) {

    let t, result = {}

    const xEqu = {
      intercept: negCoord[0],
      change: posCoord[0] - negCoord[0]
    }
    const yEqu = {
      intercept: negCoord[1],
      change: posCoord[1] - negCoord[1]
    }
    const zEqu = {
      intercept: negCoord[2],
      change: posCoord[2] - negCoord[2]
    }

    switch (plane) {
      case "X":
        t = (1.5 - xEqu.intercept) / xEqu.change
        result.Y = yEqu.change * t + yEqu.intercept
        result.Z = zEqu.change * t + zEqu.intercept
      break;

      case "Y":
        t = (1.5 - yEqu.intercept) / yEqu.change
        result.X = xEqu.change * t + xEqu.intercept
        result.Z = zEqu.change * t + zEqu.intercept
      break;

      case "Z":
        t = (1.5 - zEqu.intercept) / zEqu.change
        result.X = xEqu.change * t + xEqu.intercept
        result.Y = yEqu.change * t + yEqu.intercept
      break;
    }
    return result
  }

  function convertToSubCubeCoords(coords) {
    let result = {}

    if (coords.X) result.X = Math.floor(coords.X + 0.5)
    if (coords.Y) result.Y = Math.floor(coords.Y + 0.5)
    if (coords.Z) result.Z = Math.floor(coords.Z + 0.5)

    return result;
  }

  function dragDirection(start, end) {
    let xDistance, yDistance, zDistance

    if (!start.X) { // on the X axis
      yDistance = end.Y - start.Y
      zDistance = end.Z - start.Z

      if (Math.abs(yDistance) > Math.abs(zDistance)) {
        return {direction: "Y", distance: yDistance}
      } else {
        return {direction: "Z", distance: zDistance}
      }
    }

    if (!start.Y) { // on the Y axis
      xDistance = end.X - start.X
      zDistance = end.Z - start.Z

      if (Math.abs(xDistance) > Math.abs(zDistance)) {
        return {direction: "X", distance: xDistance}
      } else {
        return {direction: "Z", distance: zDistance}
      }
    }

    if (!start.Z) { // on the Z axis
      xDistance = end.X - start.X
      yDistance = end.Y - start.Y

      if (Math.abs(xDistance) > Math.abs(yDistance)) {
        return {direction: "X", distance: xDistance}
      } else {
        return {direction: "Y", distance: yDistance}
      }
    }
  }

  function rotateGroup(axis, group, ccw, count = 1) {

    cv.removeEventListener("mousedown", mousedownHandler);
    window.removeEventListener("mouseup", mouseupHandler);
    window.removeEventListener("keydown", keyDownHandler)

    let inRotGroup;

    const axes = ["X", "Y", "Z"]

    // I added a second condition for when rotating the entire cube at once
    if      (axis == "X") inRotGroup = sc => sc.x == group || group == 2;
    else if (axis == "Y") inRotGroup = sc => sc.y == group || group == 2;
    else    /* Z */       inRotGroup = sc => sc.z == group || group == 2;

    let f = 0;

    function animate() {
      let factor = (-Math.cos(f * speed * Math.PI / (45))+1) * speed

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          for (let k = 0; k < 3; k++) {
            let sc = subCubes[i][j][k];

            if (inRotGroup(sc)) {
              sc.transform.preRotate(ccw ? 1 * factor : -1 * factor, axis);
              if ((f + 1) % (90 / speed) == 0) sc.rotateXYZ(ccw, axis);
            }

            sc.draw();
          }
        }
      }
      
      if ((f + 1) % (90 / speed) == 0) {

        if (count - 1 > 0) { // if there's more scrambles left
          let randomAxis = axes[Math.floor(Math.random() * 3)]
          let randomGroup = Math.floor(Math.random() * 3) - 1
          let randomDirection = Math.floor(Math.random() + 0.5)
          rotateGroup(randomAxis, randomGroup, randomDirection, count - 1)

        } else {
          cv.addEventListener("mousedown", mousedownHandler);
          window.addEventListener("mouseup", mouseupHandler);
          window.addEventListener("keydown", keyDownHandler)
        }
        
      }
      if (++f < 90 / speed) requestAnimationFrame(animate);
    }

    animate();
  }

    // scrambles the cube
    speed = 15
    rotateGroup("Z", 1, false, 45)
}