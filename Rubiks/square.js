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
  tr.scale(0.3, 0.3, 0.3)
  // tr.rotate(10, 'X')
  gl.uniformMatrix4fv(transformUniform, false, new Float32Array(tr.matrix));

  class SubCube {

    constructor(x, y, z) {
      this.x = x;  // x = -1, 0, or 1; this is the initial x
                   // position relative to the overall cube.
      this.y = y;
      this.z = z;
      this.rot = new Transform();  // This is a transform to track
                                   // how this subcube is rotated
                                   // as the overall cube is
                                   // scrambled.
    }
    
    drawSquare(color, outside=true) {
      // Save (via push) a copy of the overall transform.
      tr.push()
  
      gl.uniformMatrix4fv(transformUniform, false, new Float32Array(tr.matrix));
      gl.uniform3f(colorUniform, 0.0, 0.0, 0.0)
      gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
      
      if (outside) {
        tr.translate(0, 0, 0.001).scale(0.9, 0.9, 1)
        gl.uniformMatrix4fv(transformUniform, false, new Float32Array(tr.matrix));
        gl.uniform3f(colorUniform, color[0], color[1], color[2])
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
      }
      // Restore (via pop) overall transform.
      tr.pop()
    }
    
    draw() {
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
  
      // colors for each face
      const colorData = [
        [1.0, 0.0, 0.0], // Red
        [0.0, 0.1, 1.0], // Blue
        [1.0, 1.0, 1.0], // White
        [0.0, 0.8, 0.0], // Green
        [1.0, 1.0, 0.0], // Yellow
        [1.0, 0.6, 0.0], // Orange
      ]
  
      // booleans to track if a subcube face is an 'outside' face
      const outsides = [
        this.z == 1,
        this.x == 1,
        this.y == 1,
        this.x == -1,
        this.y == -1,
        this.z == -1
      ]
  
      // Save (via push) copy of overall transform.
      tr.push()
      
      // Multiply overall transform by the transform used to track
      // this subcube's rotations relative to the overall cube.
      tr.matrix = Transform.mult(tr.matrix, this.rot.matrix)
      
      // Translate overall transform based on this subcube's
      // x, y, and z values ... so that it's pushed out from the
      // center of the overall cube.
      tr.translate(this.x, this.y, this.z)
      
      // Use drawSquare method to draw the six faces of the cube.
      // Each face should have a different color.  The second
      // argument to drawSquare (to determine whether the face is
      // colored or left black) should be set based on this
      // subcube's x, y and z values.
      for (let i = 0; i < translations.length; i++ ) {
        tr.push()
        tr.translate(...translations[i]).rotate(...rotations[i])
        this.drawSquare(colorData[i], outsides[i])
        tr.pop()
      }
      // Restore (via pop) overall transform.  
      tr.pop()
    }
  }

  let frameCount = 0;

  let subCubes = [];

  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      for (let k = -1; k < 2; k++) {

        if (!(i == 0 && j == 0 && k == 0)) {
          let cube = new SubCube(i, j, k)
          // console.log(cube.x, cube.y, cube.z)
          subCubes.push(cube)
        }
      }
    }
  }

  // let testCube = new SubCube(1, 1, 1)

  function animate() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let factor = (Math.sin(frameCount * Math.PI / 90) + 1.3) * 2
    let bounce = Math.cos(frameCount * Math.PI / 180) * 0.002

    tr.translate(0, bounce, 0)

    // rotate subcubes
    for (let i = 0; i < subCubes.length; i++) {
      if (subCubes[i].x == 1) {
        subCubes[i].rot.rotate(.75, 'X')
      }
    }


    for (let i = 0; i < subCubes.length; i++) {
      subCubes[i].draw()
    }

    frameCount++
    frameCount %= 360
    requestAnimationFrame(animate);

  }
  requestAnimationFrame(animate);

  // drawCube({r: 1.0, g: 0.6, b: 0.0})

  // tr.translate(2, 0, 0)
  
  // drawCube({r: 1.0, g: 0.0, b: 0.0})


  // gl.uniform3f(colorUniform, 1, 0.6, 0);
  // gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}