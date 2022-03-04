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
    // should be "x", "y" or "z") by given angle (in degrees).
    // (Overwrite current transformation matrix with the result.)

    let rad = angle * Math.PI / 180
    let rotate = []

    switch(axis) {
      case "x":
        // console.log("x")
        rotate = [
          1, 0,             0,                    0,
          0, Math.cos(rad), Math.sin(rad) * (-1), 0,
          0, Math.sin(rad), Math.cos(rad),        0,
          0, 0,             0,                    1
        ]

      break;
      case "y":
        // console.log("y")

        rotate = [
          Math.cos(rad), 0, Math.sin(rad) * (-1), 0,
          0,             1, 0,                    0,
          Math.sin(rad), 0, Math.cos(rad),        0,
          0,             0, 0,                    1
        ]
      break;

      case "z":
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

  preRotate(angle, axis) {
    // boy oh boy this sure does something
    // I don't entirely understand why this will work (or won't work), but here we go

    let rad = angle * Math.PI / 180
    let rotate = []

    switch(axis) {
      case "x":
        // console.log("x")
        rotate = [
          1, 0,             0,                    0,
          0, Math.cos(rad), Math.sin(rad) * (-1), 0,
          0, Math.sin(rad), Math.cos(rad),        0,
          0, 0,             0,                    1
        ]

      break;
      case "y":
        // console.log("y")

        rotate = [
          Math.cos(rad), 0, Math.sin(rad) * (-1), 0,
          0,             1, 0,                    0,
          Math.sin(rad), 0, Math.cos(rad),        0,
          0,             0, 0,                    1
        ]
      break;

      case "z":
        rotate = [
          Math.cos(rad), Math.sin(rad) * (-1), 0, 0,
          Math.sin(rad), Math.cos(rad),        0, 0,
          0,             0,                    1, 0,
          0,             0,                    0, 1,
        ]
      break;
    }

    this.matrix = Transform.mult(rotate, this.matrix)

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
  tr.translate(0,0, -10).rotate(15, 'x').rotate(30, 'y');
  tr.scale(0.3, 0.3, 0.3)
  // tr.rotate(10, 'x')
  gl.uniformMatrix4fv(transformUniform, false, new Float32Array(tr.matrix));

  class SubCube {

    constructor(x, y, z) {
      this.x = x;  // x = -1, 0, or 1; this is the initial x
                   // position relative to the overall cube.
      this.y = y;
      this.z = z;

      this.x0 = x;
      this.y0 = y;
      this.z0 = z;
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
        [0, 'y'],
        [-90, 'y'],
        [-90, 'x'],
        [90, 'y'],
        [90, 'x'],
        [180, 'x'],
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
        this.z0 == 1,
        this.x0 == 1,
        this.y0 == 1,
        this.x0 == -1,
        this.y0 == -1,
        this.z0 == -1
      ]
  
      // Save (via push) copy of overall transform.
      tr.push()
      
      // Multiply overall transform by the transform used to track
      // this subcube's rotations relative to the overall cube.
      tr.matrix = Transform.mult(tr.matrix, this.rot.matrix)
      
      // Translate overall transform based on this subcube's
      // x, y, and z values ... so that it's pushed out from the
      // center of the overall cube.
      tr.translate(this.x0, this.y0, this.z0)
      
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

    rotateSubcube(axis, direction) {
      // const distance = direction * 90

      const v = [this.x, this.y, this.z, 1]
      let t = []

      switch (axis) {
        case 'x':
          t = [
            1, 0, 0, 0,
            0, 0, direction * (1), 0,
            0, direction * (-1), 0, 0,
            0, 0, 0, 1,
          ]
        break;

        case 'y':
          t = [
            0, 0, direction * (1), 0,
            0, 1, 0, 0,
            direction * (-1), 0, 0, 0,
            0, 0, 0, 1,
          ]
        break;

        case 'z':
          t = [
            0, direction * (1), 0, 0,
            direction * (-1), 0, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
          ]
        break;
      }

      // code copied from my geometric transforms assignment
      this.x = v[0] * t[0] + v[1] * t[4] + v[2] * t[8] + v[3] * t[12];
      this.y = v[0] * t[1] + v[1] * t[5] + v[2] * t[9] + v[3] * t[13];
      this.z = v[0] * t[2] + v[1] * t[6] + v[2] * t[10] + v[3] * t[14];
    }
  }

  let frameCount = 0;

  let rotations = [
    // denoted by axis, level (position in overall cube), and direction
    ['x', -1, -1],
    ['x', -1, 1],
    ['x', 0, -1],
    ['x', 0, 1],
    ['x', 1, -1],
    ['x', 1, 1],
    ['y', -1, -1],
    ['y', -1, 1],
    ['y', 0, -1],
    ['y', 0, 1],
    ['y', 1, -1],
    ['y', 1, 1],
    ['z', -1, -1],
    ['z', -1, 1],
    ['z', 0, -1],
    ['z', 0, 1],
    ['z', 1, -1],
    ['z', 1, 1],
    
  ]

  let subCubes = [];

  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      for (let k = -1; k < 2; k++) {

        if (!(i == 0 && j == 0 && k == 0)) {
          let cube = new SubCube(i, j, k)
          subCubes.push(cube)
        }
      }
    }
  }

  // let testCube = new SubCube(1, 1, 1)
  // let turn = Math.floor(Math.random() * 18)
  let turn = Math.floor(Math.random() * 18)

  function animate() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // speed MUST be a factor of 90
    const speed = 2;

    let factor = (-Math.cos(frameCount * speed * Math.PI / (45))+1) * speed
    let bounce = Math.cos(frameCount * Math.PI / 180) * 0.003


    tr.rotate(.1, 'x').rotate(.2, 'y').rotate(.1, 'z')
    // tr.translate(0, bounce, 0)

    // rotate subcubes
    for (let i = 0; i < subCubes.length; i++) {

      // if (subCubes[i].x == 1) {
      //   subCubes[i].rot.rotate(1, 'x')
      // }

      // console.log(subCubes[i][rotations[turn][0]] == rotations[turn][1])

      if (subCubes[i][rotations[turn][0]] == rotations[turn][1]) {
        subCubes[i].rot.preRotate(rotations[turn][2] * factor, rotations[turn][0])
      }
    }


    for (let i = 0; i < subCubes.length; i++) {
      subCubes[i].draw()
    }

    frameCount++
    if (frameCount % (90 / speed) == 0) {
      for (let i = 0; i < subCubes.length; i++) {
        if (subCubes[i][rotations[turn][0]] == rotations[turn][1]) {
          subCubes[i].rotateSubcube(rotations[turn][0], rotations[turn][2])

        }
      }
      // generate a new semi-random rotation (avoids repeating and undoing)
      // let oldTurn = turn;
      // while(oldTurn == turn || (oldTurn-rotations[turn][2])%18 == turn) {
          turn = Math.floor(Math.random() * 18)
      //   console.log("rerolling!")
      // }
      // console.log("-----")
    }
    requestAnimationFrame(animate);

  }
  requestAnimationFrame(animate);

  // drawCube({r: 1.0, g: 0.6, b: 0.0})

  // tr.translate(2, 0, 0)
  
  // drawCube({r: 1.0, g: 0.0, b: 0.0})


  // gl.uniform3f(colorUniform, 1, 0.6, 0);
  // gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}




