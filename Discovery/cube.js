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
let mvTransform, pTransform;

// let mouseDownPoint = {X: 0, Y: 0}
// let clicking = false

// const BLACK  = [0.0, 0.0, 0.0];
// const GREEN  = [0.0, 0.6, 0.3];
// const RED    = [0.8, 0.0, 0.0];
// const BLUE   = [0.1, 0.4, 0.8];
// const ORANGE = [0.9, 0.5, 0.0];
// const WHITE  = [0.9, 0.9, 0.9];
// const YELLOW = [1.0, 0.8, 0.0];

// speed should be a factor of 90
// (or have an integer multiple equal to 90)
// let speed = 5

setup("cube.vert", "cube.frag").then(main);

let cv = document.querySelector("#canvas");

function main() {
  gl.clearColor(1, 1, 1, 1);
  gl.enable(gl.DEPTH_TEST);

  const uniforms = {
    pTransform: gl.getUniformLocation(shaderProgram, "pTransform"),
    mvTransform: gl.getUniformLocation(shaderProgram, "mvTransform"),
    colorUniform: gl.getUniformLocation(shaderProgram, "color"),
    normalMatrix: gl.getUniformLocation(shaderProgram, "normalMatrix"),
  }
  // transformUniform = gl.getUniformLocation(shaderProgram, "transform");
  // colorUniform = gl.getUniformLocation(shaderProgram, "color");
  // normalMatrix = gl.getUniformLocation(shaderProgram, "normalMatrix");

  let vertexData = [ -0.5,  0.5, 0,     0, 0, 1, 
                     -0.5, -0.5, 0,     0, 0, 1, 
                      0.5, -0.5, 0,     0, 0, 1, 
                      0.5,  0.5, 0,     0, 0, 1, ];

  let normalData = [
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1
  ]

  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

  const vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "position");
  gl.enableVertexAttribArray(vertexPositionAttribute);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 24, 0);

  const normalAttribute = gl.getAttribLocation(shaderProgram, "normal");
  gl.enableVertexAttribArray(normalAttribute);
  // gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.vertexAttribPointer(normalAttribute, 3, gl.FLOAT, false, 24, 12);

  pTransform = new Transform();
  pTransform.frustum(1, 0.75, 4, 24);
  gl.uniformMatrix4fv(uniforms.pTransform, false, pTransform.matrix)

  mvTransform = new Transform()
  mvTransform.translate(0, 0, -14);
  mvTransform.scale(3, 3, 3)
  mvTransform.rotate(20, "X").rotate(-30, "Y");



      
  function drawCube() {

    function drawSquare() {
      mvTransform.push()

      mvTransform.translate(0, 0, 0.5)

      let normalMatrix = Transform.invert(mvTransform.matrix)
      normalMatrix = Transform.transpose(normalMatrix)

      // let normalMatrix = mvTransform.normalMatrix()

      console.log()
      gl.uniformMatrix4fv(uniforms.mvTransform, false, new Float32Array(mvTransform.matrix));
      gl.uniformMatrix4fv(uniforms.normalMatrix, false, normalMatrix)
      gl.uniform3f(uniforms.colorUniform, 0.0, 0.0, 0.0)
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

      mvTransform.pop()
    }

    mvTransform.push()
    drawSquare()
    mvTransform.rotate(90, "Y")
    drawSquare()
    mvTransform.rotate(90, "Y")
    drawSquare()
    mvTransform.rotate(90, "Y")
    drawSquare()
    mvTransform.rotate(90, "X")
    drawSquare()
    mvTransform.rotate(180, "X")
    drawSquare()

    mvTransform.pop()

    mvTransform.push()
    mvTransform.translate(0, 0, 0.5)

    let normalMatrix = Transform.invert(mvTransform.matrix)
    normalMatrix = Transform.transpose(normalMatrix)
    console.log([
      normalMatrix[0],
      normalMatrix[1],
      normalMatrix[2],

      normalMatrix[4],
      normalMatrix[5],
      normalMatrix[6],

      normalMatrix[10],
      normalMatrix[11],
      normalMatrix[12],

    ])

    console.log(mvTransform.normalMatrix())
    mvTransform.pop()


  }

  mvTransform.rotate(180, "Y")

  function animate() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mvTransform.rotate(1, 'Y')

    requestAnimationFrame(animate)
    drawCube()

  }

  requestAnimationFrame(animate)
}