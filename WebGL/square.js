let gl, shaderProgram;

// Everything that needs to happen before we can run main ...
function setup(vertexShaderFileName, fragmentShaderFileName) {
  let vertexShader, fragmentShader;

  // To learn about Promises:
  // https://eloquentjavascript.net/11_async.html#h_sdRy5CTAP
  // To learn about fetch:
  // https://eloquentjavascript.net/18_http.html#h_1Iqv5okrKE

  // When page is loaded, get WebGL context from canvas element
  // and assign it to gl.
  let wp = new Promise(resolve => { window.onload = resolve; });
  wp = wp.then(
    () => gl = document.querySelector("#canvas").getContext("webgl"));

  // At this point, wp is Promise representing completion of
  // asynchronous "initialize gl" task.

  let vp = fetch(vertexShaderFileName);
  vp = vp.then(response => response.text());
  vp = Promise.all([vp, wp]);

  // At this point, vp is Promise representing completion of
  // both wp and asynchronous "load vertex shader source code" task.

  let fp = fetch(fragmentShaderFileName);
  fp = fp.then(response => response.text());
  fp = Promise.all([fp, wp]);

  // At this point, fp is Promise representing completion of
  // both wp and asynchronous "load fragment shader source code" task.

  function compileShader(shader, source, fileName) {
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      let g = gl.getShaderInfoLog(shader);
      console.error(`Unable to compile ${fileName}...\n${g}`);
    }
  }

  // When vp (gl initialized, vertex shader source loaded) completes,
  // compile vertex shader source code.
  vp = vp.then(
    function([vpResponseText, _]) {
      vertexShader = gl.createShader(gl.VERTEX_SHADER);
      compileShader(vertexShader, vpResponseText,
        vertexShaderFileName);
    }
  );

  // At this point, vp is Promise representing completion of
  // asynchronous "compile vertex shader source code" task.

  // When fp (gl initialized, fragment shader source loaded) completes,
  // compile fragment shader source code.
  fp = fp.then(
    function([fpResponseText, _]) {
      fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      compileShader(fragmentShader, fpResponseText,
        fragmentShaderFileName);
    }
  );

  // At this point, fp is Promise representing completion of
  // asynchronous "compile fragment shader source code" task.

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

  // At this point sp represents completion of full shader setup
  // (load page, initialize gl, load vertex shader source,
  // compile vertex shader source, load fragment shader source,
  // compile fragement shader source, link compiled shader sources,
  // elect to use resulting shader program).

  return sp;
}

// When shader setup is completed (safe to assume gl initialized,
// shader program ready to go), run main.
const sp = setup("square.vert", "square.frag");
sp.then(main);

function main() {
  // Clear background (to opaque black).
  gl.clearColor( 0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Look for variable in shader source code called "position."
  // Set up access to it via vertexPositionAttribute variable.
  // We'll have an array with vertex position data:  3 values in
  // our array for each vertex, i.e., 3 values for each running
  // instance of the vertex shader code.
  const vertexPositionAttribute = gl.getAttribLocation(
    shaderProgram, "position");
  gl.enableVertexAttribArray(vertexPositionAttribute);

  const transformUniform = gl.getUniformLocation(shaderProgram,
     "transform")

  // Look for a variable in shader source code called "color."
  // Set up access to it via colorUniform varable.
  // This is a "uniform" (rather than "attribute") variable in
  // the shader source, so the same value will be shared by all
  // shader code instances.  (The same 3 values, that is,
  // representing a single color.)
  const colorUniform = gl.getUniformLocation(
    shaderProgram, "color");
  
  // Send color (3 float values, representing red, green and blue)
  // to shader instances.
  gl.uniform3f(colorUniform, 1.0, 0.0, 0.0);

  // Initialize data for 4 points, representing a square.
  // Copy that data to buffer where shaders will have access to
  // it.  gl.vertexAttribPointer indicates how data in the buffer
  // should be interpreted by the shaders:
  //   - 3 values per vertex
  //   - values are floats (32-bit floating-point numbers)
  //   - data in range [-1, 1] (not [0, 1])
  //   - distance in bytes from one value to the next is 12
  //     (i.e., 32 bits)
  //   - distance in bytes from beginning of buffer to first
  //     value is 0.
  const vertexData = [
    -0.414,    1, 0,
      -1,  0.414, 0,
      -1, -0.414, 0,
    -0.414,   -1, 0,
     0.414,   -1, 0,
       1, -0.414, 0,
       1,  0.414, 0,
     0.414,    1, 0,  ];
     const transformData = [
       0.75,0,0,0,
          0,1,0,0,
          0,0,1,0,
          0,0,0,2,
     ];
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData),
    gl.STATIC_DRAW);
  gl.vertexAttribPointer(vertexPositionAttribute,
    3, gl.FLOAT, false, 12, 0);

  gl.uniformMatrix4fv(transformUniform, false, new Float32Array(transformData));

  // Draw a square!  (Use "triangle fan" scheme for generating
  // triangles from sequence of vertices; draw 4 vertices worth
  // of triangles.)
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 8);

  gl.uniform3f(colorUniform, 1, 1, 1)
  gl.drawArrays(gl.LINE_LOOP, 0, 8)
}