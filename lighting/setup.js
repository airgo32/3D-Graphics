export let gl, shaderProgram;

export function setup(vertexShaderFileName, fragmentShaderFileName) {
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