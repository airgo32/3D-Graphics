"use strict";

let gl, shaderProgram;

class Transform {

  constructor() {
    // Create array instance variable representing 4x4
    // transformation matrix.  Start with identity matrix.
    this.matrix = [
      1, 0, 0, 0, 
      0, 1, 0, 0, 
      0, 0, 1, 0, 
      0, 0, 0, 1, 
    ];
    // Create array instance variable for stack, for
    // push and pop methods.  Start with empty array.
    this.history = []
  }
  
  push() {
    // Push copy of current transformation matrix.
    this.history.push(this.matrix)
  }
  
  pop() {
    // Pop transformation matrix from stack, overwrite
    // current transformation matrix with the one that
    // was popped.
    this.matrix = this.history.pop()
  }

  // Multiplies two 4x4 matrices together
  static mult(A, B) {
    let result = []

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {

        result[4*i+j] = (A[4*i]*B[j]) + (A[4*i+1]*B[4+j]) + (A[4*i+2]*B[8+j]) + (A[4*i+3]*B[12+j])
      }
    }

    return result;
  }
  
  translate(tx, ty, tz) {
    // Multiply current transformation matrix by matrix
    // representing translation by tx, ty, tz.  (Overwrite
    // current transformation matrix with the result.)
    let translate = [
      1, 0, 0, tx,
      0, 1, 0, ty,
      0, 0, 1, tz,
      0, 0, 0, 1,
    ]

    this.matrix = Transform.mult(this.matrix, translate)

    return this;
  }
  
  scale(sx, sy, sz) {
    // Multiply current transformation matrix by matrix
    // representing scale by sx, sy, sz.  (Overwrite current
    // transformation matrix with the result.)
    let scale = [
      sx,  0,  0, 0,
       0, sy,  0, 0,
       0,  0, sz, 0,
       0,  0,  0, 1,
    ]

    this.matrix = Transform.mult(this.matrix, scale)

    return this;
  }
  
  rotate(angle, axis) {
    // Multiply current transformation matrix by matrix
    // representing coordinate axis rotation (axis argument
    // should be "X", "Y" or "Z") by given angle (in degrees).
    // (Overwrite current transformation matrix with the result.)

    let rad = angle * Math.PI / 180
    let rotate = []

    switch(axis) {
      case "X":
        rotate = [
          1, 0,             0,                    0,
          0, Math.cos(rad), Math.sin(rad) * (-1), 0,
          0, Math.sin(rad), Math.cos(rad),        0,
          0, 0,             0,                    1
        ]

      break;
      case "Y":
        rotate = [
          Math.cos(rad), 0, Math.sin(rad) * (-1), 0,
          0,             1, 0,                    0,
          Math.sin(rad), 0, Math.cos(rad),        0,
          0,             0, 0,                    1
        ]
      break;

      case "Z":
        rotate = [
          Math.cos(rad), Math.sin(rad) * (-1), 0, 0,
          Math.sin(rad), Math.cos(rad),        0, 0,
          0,             0,                    1, 0,
          0,             0,                    0, 1,
        ]
      break;
    }

    this.matrix = Transform.mult(this.matrix, rotate)

    return this;
  }
  
  frustum(right, top, near, far) {
    // Multiply current transformation matrix by matrix
    // representing perspective normalization transformation using
    // parameters right, top, near and far.  (Overwrite current
    // transformation matrix with the result.)

    const a = (near + far)/(near - far)
    const B = (2 * near * far)/(near - far)

    let frustum = [
      (near / right), 0,            0, 0,
      0,              (near / top), 0, 0,
      0,              0,            a, B,
      0,              0,           -1, 0,
    ]

    this.matrix = Transform.mult(this.matrix, frustum)

    return this;
  }
}

function setup(vertexShaderFileName, fragmentShaderFileName) {
  let vertexShader, fragmentShader;

  let wp = new Promise(resolve => { window.onload = resolve; });
  wp = wp.then(
    () => gl = document.querySelector("#canvas").getContext("webgl"));

  let vp = fetch(vertexShaderFileName);
  vp = vp.then(response => response.text());
  vp = Promise.all([vp, wp]);

  let fp = fetch(fragmentShaderFileName);
  fp = fp.then(response => response.text());
  fp = Promise.all([fp, wp]);

  function compileShader(shader, source, fileName) {
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      let g = gl.getShaderInfoLog(shader);
      console.error(`Unable to compile ${fileName}...\n${g}`);
    }
  }

  vp = vp.then(
    function([vpResponseText, _]) {
      vertexShader = gl.createShader(gl.VERTEX_SHADER);
      compileShader(vertexShader, vpResponseText,
        vertexShaderFileName);
    }
  );

  fp = fp.then(
    function([fpResponseText, _]) {
      fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      compileShader(fragmentShader, fpResponseText,
        fragmentShaderFileName);
    }
  );

  let sp = Promise.all([vp, fp]);
  sp = sp.then(
    function() {
      shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);
      gl.useProgram(shaderProgram);
    }
  );

  return sp;
}

const sp = setup("square.vert", "square.frag");
sp.then(main);

function main() {

  gl.clearColor(1, 1, 1, 1);
  gl.enable(gl.DEPTH_TEST)

  const vertexPositionAttribute = gl.getAttribLocation(
    shaderProgram, "position");
  gl.enableVertexAttribArray(vertexPositionAttribute);

  const transformUniform = gl.getUniformLocation(
    shaderProgram, "transform");

  const colorUniform = gl.getUniformLocation(
    shaderProgram, "color");

  const vertexData = [
    -0.5,  0.5, 0,
    -0.5, -0.5, 0,
     0.5, -0.5, 0,
     0.5,  0.5, 0 ];
  const vertexBuffer = gl.createBuffer();
  
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData),
    gl.STATIC_DRAW);
  gl.vertexAttribPointer(vertexPositionAttribute,
    3, gl.FLOAT, false, 12, 0);

    // clears background
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let tr = new Transform();
  
  tr.frustum(1, 0.75, 5, 15);
  tr.translate(0,0, -10).rotate(15, 'X').rotate(30, 'Y');
  // tr.rotate(0, 'X')
  gl.uniformMatrix4fv(transformUniform, false, new Float32Array(tr.matrix));


  function drawSquare(color) {

    // Push copy of transform.
    tr.push()
    
    // Send transform matrix data to vertex shader.
    gl.uniformMatrix4fv(transformUniform, false, new Float32Array(tr.matrix));

    // Send RGB values for black to fragment shader.
    gl.uniform3f(colorUniform, 0.0, 0.0, 0.0)

    // Draw square.
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Translate forward a little bit, scale a little bit smaller.
    tr.translate(0, 0, 0.001).scale(0.9, 0.9, 1)

    // Send transform matrix data to vertex shader.
    gl.uniformMatrix4fv(transformUniform, false, new Float32Array(tr.matrix));
    
    // Send RGB values for color (i.e., color[0], color[1], color[2])
    // to fragment shader.
    gl.uniform3f(colorUniform, color.r, color.g, color.b)
    
    // Draw square again.
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    
    // Restore transform (via pop) to what it was when this function
    // was called.
    tr.pop()
  }

  // drawSquare({r: 1.0, g: 0.6, b: 0.0})

  /**
   * Draws a cube of a specified color
   * @param {Object} color - An object with properties r, g, and b from 0 to 1
   */
  function drawCube(color) {
    // faces are drawn in the order of:
    // Front, Right, Top, Left, Bottom, Back

    // various translations to get the cube faces into the right position
    const translations = [
      [0.0, 0.0, 0.5],
      [0.5, 0.0, 0.0],
      [0.0, 0.5, 0.0],
      [-0.5, 0.0, 0.0],
      [0.0, -0.5, 0.0],
      [0.0, 0.0, -0.5]
    ]
    
    // various rotations to get the cube faces facing the right directions
    const rotations = [
      [0, 'Y'],
      [-90, 'Y'],
      [-90, 'X'],
      [90, 'Y'],
      [90, 'X'],
      [180, 'Y'],
    ]
    for (let i = 0; i < translations.length; i++) {

      tr.push()
      tr.translate(...translations[i]).rotate(...rotations[i])
      drawSquare(color)
      tr.pop()

    }
  }

  drawCube({r: 1.0, g: 0.6, b: 0.0})
  

  // gl.uniform3f(colorUniform, 1, 0.6, 0);
  // gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}