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
    this.history.pop(this.matrix)
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

    this.matrix = Transform.mult(translate, this.matrix)

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

    this.matrix = mult(scale, this.matrix)

    return this;
  }
  
  rotate(angle, axis) {
    // Multiply current transformation matrix by matrix
    // representing coordinate axis rotation (axis argument
    // should be "X", "Y" or "Z") by given angle (in degrees).
    // (Overwrite current transformation matrix with the result.)
  }
  
  frustum(right, top, near, far) {
    // Multiply current transformation matrix by matrix
    // representing perspective normalization transformation using
    // parameters right, top, near and far.  (Overwrite current
    // transformation matrix with the result.)
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
  gl.clearColor(0, 0, 0, 1);

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

  gl.clear(gl.COLOR_BUFFER_BIT);

  const transformData = [
    0.75, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1 ];

  let tr = new Transform();
  tr.scale(0.75, 1, 1).translate(0,0,0)
  console.log(tr.matrix);

  gl.uniformMatrix4fv(transformUniform, false,
    new Float32Array(tr.matrix));
  
  gl.uniform3f(colorUniform, 1, 0.6, 0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}