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
let transformUniform, normalUniform, colorUniform, overallTransform;

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

  const vertexPositionAttribute = gl.getAttribLocation(
    shaderProgram, "position");
    gl.enableVertexAttribArray(vertexPositionAttribute);


  const normalVectorAttribute = gl.getAttribLocation(shaderProgram, "normal")
  gl.enableVertexAttribArray(normalVectorAttribute)


  transformUniform = gl.getUniformLocation(
    shaderProgram, "transform");
  colorUniform = gl.getUniformLocation(
    shaderProgram, "color");
  normalUniform = gl.getUniformLocation(
    shaderProgram, "normal")

  let vertexData = [ -0.5,  0.5, 0,
                     -0.5, -0.5, 0,
                      0.5, -0.5, 0,
                      0.5,  0.5, 0 ];

  const vertexNormal = [
    0.0, 0.0, 1.0,

  ]
  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData),
      gl.STATIC_DRAW);
  gl.vertexAttribPointer(vertexPositionAttribute,
      3, gl.FLOAT, false, 12, 0);

  const normalBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormal), gl.STATIC_DRAW)
  gl.vertexAttribPointer(normalVectorAttribute, 3, gl.FLOAT, false, 0, 0)

  overallTransform = new Transform();
  overallTransform.frustum(1, 0.75, 5, 35);
  overallTransform.translate(0, 0, -20);
  overallTransform.scale(3, 3, 3)
  overallTransform.rotate(25, "X").rotate(-45, "Y");


   
      
  function drawCube() {

    const translations = [
      [0.0, 0.0, 0.5], // Front
      [0.0, 0.0, -0.5], // Back
      [0.0, 0.5, 0.0], // Top
      [0.0, -0.5, 0.0], // Down
      [0.5, 0.0, 0.0], // Right
      [-0.5, 0.0, 0.0], // Left
      
    ]

    const rotations = [
      [0, 'Y'], // Front
      [180, 'X'], // Back
      [-90, 'X'], // Top
      [90, 'X'], // Down
      [-90, 'Y'], // Right
      [90, 'Y'], // Left
    ]


    function drawSquare(translate, rotate) {
      overallTransform.push()

      const inverseTransform = Transform.invert(overallTransform)




      overallTransform.translate(...translate)
      .rotate(...rotate)
      gl.uniformMatrix4fv(transformUniform, false, new Float32Array(overallTransform.matrix));
      gl.uniformMatrix4fv(normalUniform, false, new Float32Array(inverseTransform.uniform) )
      gl.uniform3f(colorUniform, 0.0, 0.0, 0.0)
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

      overallTransform.pop()
    }

    for (let i = 0; i < translations.length; i++) {
      drawSquare(translations[i], rotations[i])
    }
    // drawSquare()

  }

  drawCube()
}