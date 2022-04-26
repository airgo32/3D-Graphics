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

export function setDimensions(widescreen) {
  let content = document.querySelector("#content")
  let canvas = document.querySelector("#canvas")

  let winHeight = window.innerHeight
  let winWidth = window.innerWidth

  let ratio = winHeight / winWidth
  let width = 0.95, height = 0.95

  if (ratio < (widescreen ? 0.5625 : 0.75)) { // screen is longer than it is wider
    height *= winHeight
    width *= winHeight / (widescreen ? 0.5625 : 0.75)

  } else { // screen is taller than it is wider
    width *= winWidth
    height *= winWidth * (widescreen ? 0.5625 : 0.75)
  }

  content.style.width = `${width}px`
  canvas.width = width;
  canvas.height = height;

  return ratio;
}