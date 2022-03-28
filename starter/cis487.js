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

export class Transform {

  constructor(matrix) {
    if (matrix) this.matrix = matrix.slice(0);  // make a copy
    else this.matrix = [1,0,0,0,  0,1,0,0,  0,0,1,0,  0,0,0,1];
    
    this.history = [];
  }
  
  push() { this.history.push(this.matrix); }
  pop() { this.matrix = this.history.pop(); }
  
  static multiply(a, b) {
    let c = [0,0,0,0,  0,0,0,0,  0,0,0,0,  0,0,0,0];

    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++)
        for (let k = 0; k < 4; k++)
          c[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
    
    return c;
  }

  multiplyBy(that) {
    this.matrix = Transform.multiply(this.matrix, that.matrix);
  }

  translate(tx, ty, tz) {
    this.matrix = Transform.multiply(this.matrix,
        [1,0,0,tx,  0,1,0,ty,  0,0,1,tz, 0,0,0,1]);
    return this;
  }
  
  scale(sx, sy, sz) {
    this.matrix = Transform.multiply(this.matrix,
        [sx,0,0,0,  0,sy,0,0,  0,0,sz,0,  0,0,0,1]);
    return this;
  }
 
  rotate(a, xyz, pre) {
    a *= Math.PI / 180;
    let c = Math.cos(a), s = Math.sin(a);
    let m;
    
    if (xyz == "X") {
      m = [1,0,0,0,  0,c,-s,0,  0,s,c,0,  0,0,0,1];
    } else if (xyz == "Y") {
      m = [c,0,s,0,  0,1,0,0,  -s,0,c,0,  0,0,0,1];
    } else { // Z by default
      m = [c,-s,0,0,  s,c,0,0,  0,0,1,0,  0,0,0,1];
    }
    
    if (pre) {
      this.matrix = Transform.multiply(m, this.matrix);
    } else {
      this.matrix = Transform.multiply(this.matrix, m);
    }

    return this;
  }

  preRotate(a, xyz) {
    this.rotate(a, xyz, true);
  }

  frustum(r, t, n, f) {
    let a = (n + f) / (n - f);
    let b = 2 * n * f / (n - f);
    this.matrix = Transform.multiply(this.matrix,
        [n/r,0,0,0,  0,n/t,0,0,  0,0,a,b,  0,0,-1,0]);
    return this;
  }

  transformVector(v) {
    let result = []

    result[0] = v[0] * this.matrix[0] + v[1] * this.matrix[4] + v[2] * this.matrix[8] + v[3] * this.matrix[12];
    result[1] = v[0] * this.matrix[1] + v[1] * this.matrix[5] + v[2] * this.matrix[9] + v[3] * this.matrix[13];
    result[2] = v[0] * this.matrix[2] + v[1] * this.matrix[6] + v[2] * this.matrix[10] + v[3] * this.matrix[14];
    result[3] = v[0] * this.matrix[3] + v[1] * this.matrix[7] + v[2] * this.matrix[11] + v[3] * this.matrix[15];

    return result
  }

  // Adapted from gluInvertMatrixd function, in Mesa 9.0.0, which
  // credits David Moore.
  // ftp://ftp.freedesktop.org/pub/mesa/glu/glu-9.0.0.tar.gz
  // (glu-9.0.0/src/libutil/project.c)
  static invert(transform) {
    let [m00, m01, m02, m03,
        m10, m11, m12, m13,
        m20, m21, m22, m23,
        m30, m31, m32, m33] = transform.matrix;
    
    let i00 =  m11 * m22 * m33  -  m11 * m23 * m32 -
              m21 * m12 * m33  +  m21 * m13 * m32 +
              m31 * m12 * m23  -  m31 * m13 * m22;
    
    let i10 = -m10 * m22 * m33  +  m10 * m23 * m32 +
              m20 * m12 * m33  -  m20 * m13 * m32 -
              m30 * m12 * m23  +  m30 * m13 * m22;
    
    let i20 =  m10 * m21 * m33  -  m10 * m23 * m31 -
              m20 * m11 * m33  +  m20 * m13 * m31 +
              m30 * m11 * m23  -  m30 * m13 * m21;
    
    let i30 = -m10 * m21 * m32  +  m10 * m22 * m31 +
              m20 * m11 * m32  -  m20 * m12 * m31 -
              m30 * m11 * m22  +  m30 * m12 * m21;
    
    let det = m00 * i00 + m01 * i10 + m02 * i20 + m03 * i30;
    
    // Assume det != 0 (i.e., matrix has an inverse).
      
    i00 = i00 / det;
    i10 = i10 / det;
    i20 = i20 / det;
    i30 = i30 / det;
    
    let i01 = (-m01 * m22 * m33  +  m01 * m23 * m32 +
                m21 * m02 * m33  -  m21 * m03 * m32 -
                m31 * m02 * m23  +  m31 * m03 * m22) / det;
    
    let i11 = ( m00 * m22 * m33  -  m00 * m23 * m32 -
                m20 * m02 * m33  +  m20 * m03 * m32 +
                m30 * m02 * m23  -  m30 * m03 * m22) / det;
    
    let i21 = (-m00 * m21 * m33  +  m00 * m23 * m31 +
                m20 * m01 * m33  -  m20 * m03 * m31 -
                m30 * m01 * m23  +  m30 * m03 * m21) / det;
    
    let i31 = ( m00 * m21 * m32  -  m00 * m22 * m31 -
                m20 * m01 * m32  +  m20 * m02 * m31 +
                m30 * m01 * m22  -  m30 * m02 * m21) / det;
    
    let i02 = ( m01 * m12 * m33  -  m01 * m13 * m32 -
                m11 * m02 * m33  +  m11 * m03 * m32 +
                m31 * m02 * m13  -  m31 * m03 * m12) / det;
    
    let i12 = (-m00 * m12 * m33  +  m00 * m13 * m32 +
                m10 * m02 * m33  -  m10 * m03 * m32 -
                m30 * m02 * m13  +  m30 * m03 * m12) / det;
    
    let i22 = ( m00 * m11 * m33  -  m00 * m13 * m31 -
                m10 * m01 * m33  +  m10 * m03 * m31 +
                m30 * m01 * m13  -  m30 * m03 * m11) / det;
    
    let i32 = (-m00 * m11 * m32  +  m00 * m12 * m31 +
                m10 * m01 * m32  -  m10 * m02 * m31 -
                m30 * m01 * m12  +  m30 * m02 * m11) / det;
    
    let i03 = (-m01 * m12 * m23  +  m01 * m13 * m22 +
                m11 * m02 * m23  -  m11 * m03 * m22 -
                m21 * m02 * m13  +  m21 * m03 * m12) / det;
    
    let i13 = ( m00 * m12 * m23  -  m00 * m13 * m22 -
                m10 * m02 * m23  +  m10 * m03 * m22 +
                m20 * m02 * m13  -  m20 * m03 * m12) / det;
    
    let i23 = (-m00 * m11 * m23  +  m00 * m13 * m21 +
                m10 * m01 * m23  -  m10 * m03 * m21 -
                m20 * m01 * m13  +  m20 * m03 * m11) / det;
    
    let i33 = ( m00 * m11 * m22  -  m00 * m12 * m21 -
                m10 * m01 * m22  +  m10 * m02 * m21 +
                m20 * m01 * m12  -  m20 * m02 * m11) / det;
    
    return new Transform([i00, i01, i02, i03,
                          i10, i11, i12, i13,
                          i20, i21, i22, i23,
                          i30, i31, i32, i33]);
  }
}