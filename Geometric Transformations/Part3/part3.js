function main() {
  // Format numbers to be (at least) <spaces> characters wide,
  // with <places> digits after the decimal point.
  function formatNum(num, spaces, places) {
    let s = num.toFixed(places);
    while (s.length < spaces) s = " " + s;

    return s;
  }

  // Create HTML string to display JavaScript array as a matrix.
  function matrixHTML(a) {
    // Unicode symbols needed to make big square brackets.
    let vt = "&#9474";
    let nw = "&#9484";
    let ne = "&#9488";
    let sw = "&#9492";
    let se = "&#9496";

    // Format numbers to be (at least) 6 characters wide, with 2
    // digits after the decimal point.
    let f = (n) => formatNum(n, 6, 2);

    // For 6-value array, representing 2D transformation matrix.
    // (Full matrix would have 9 values, but only the 6 values
    // needed for scale, rotation and translation are used.)
    if (a.length == 6) {
      return (
        "<pre>\n" +
        nw + "                " + ne + "\n" +
        vt + ` ${f(a[0])}  ${f(a[1])} ` + vt + "\n" +
        vt + ` ${f(a[2])}  ${f(a[3])} ` + vt + "\n" +
        vt + ` ${f(a[4])}  ${f(a[5])} ` + vt + "\n" +
        sw + "                " + se + "\n" +
        "</pre>"
      );

      // For 16-value array, representing 3D transformation matrix.
    } else {
      return (
        "<pre>\n" +
        nw + "                                " + ne + "\n" +
        vt + ` ${f(a[0])}  ${f(a[1])}  ${f(a[2])}  ${f(a[3])} ` + vt + "\n" +
        vt + ` ${f(a[4])}  ${f(a[5])}  ${f(a[6])}  ${f(a[7])} ` + vt +  "\n" +
        vt + ` ${f(a[8])}  ${f(a[9])}  ${f(a[10])}  ${f(a[11])} ` + vt + "\n" +
        vt + ` ${f(a[12])}  ${f(a[13])}  ${f(a[14])}  ${f(a[15])} ` + vt + "\n" +
        sw + "                                " + se + "\n" +
        "</pre>"
      );
    }
  }

  function multiply4x4(a, b) {
      let result = [];

      for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
              result.push(a[4*i]*b[j] + a[(4*i)+1]*b[4+j] + a[(4*i)+2]*b[8+j] + a[(4*i)+3]*b[12+j])
          }
      }

      return result;
  }

  /**
   * Performs a linear interpolation between numbers a and b
   * @param a - The first number
   * @param b - The second number
   * @param n - The percent to interpolate between a and b (should be between 0 and 1)
   */
  function lerp(a, b, n) {

    return ((b-a) * n) + a

  }

  let Q = 100; // Coordinate system quadrant size in pixels.

  // 3D transformation matrices
  let start = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
  ]
  let scale_2x = [
      2, 0, 0, 0,
      0, 2, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
  ]
  let translate = [
      1,  0,  0, 0,
      0,  1,  0, 0,
      0,  0,  1, 0,
      50, 50, 0, 1
  ]
  let translate2 = [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      -50, 0, 0, 1,
  ]
  let scale_half = [
      0.5, 0,   0, 0,
      0,   0.5, 0, 0,
      0,   0,   1, 0,
      0,   0,   0, 1
  ]

  let matrix3D_1 = [...start];
  let matrix3D_2 = [...start];

  let mDiv3D_1 = document.querySelector("#matrix3D_1");
  mDiv3D_1.innerHTML = matrixHTML(matrix3D_1);

  let mDiv3D_2 = document.querySelector("#matrix3D_2");
  mDiv3D_2.innerHTML = matrixHTML(matrix3D_2);

  // xyz is container for 3D coordinate system.
  let xyz = document.querySelector("#xyz");
  xyz.style.position = "relative";
  xyz.style.width = xyz.style.height = `${Q * 2}px`;
  xyz.style.perspective = "350px";

  // Adjust orientation of coordinate system container, and
  // everything in it, so that view won't just be straight down
  // the Z-axis.
  xyz.style.transformStyle = "preserve-3d";
  xyz.style.transform = "rotateX(-15deg) rotateY(20deg)";

  // +x +y quadrant (transparent blue).
  d = document.createElement("div");
  xyz.appendChild(d);
  d.style.width = d.style.height = `${Q}px`;
  d.style.position = "absolute";
  d.style.left = `${Q}px`;
  d.style.backgroundColor = "rgba(0, 100, 255, 0.1)";
  d.style.borderLeft = d.style.borderBottom = "1px solid black";

  // -x -y quadrant.
  d = document.createElement("div");
  xyz.appendChild(d);
  d.style.width = d.style.height = `${Q}px`;
  d.style.position = "absolute";
  d.style.top = `${Q}px`;
  d.style.borderRight = d.style.borderTop = "1px solid black";

  // +x -z quadrant (transparent blue).  -z is "into the screen."
  d = document.createElement("div");
  xyz.appendChild(d);
  d.style.width = d.style.height = `${Q}px`;
  d.style.position = "absolute";
  d.style.left = `${Q}px`;
  d.style.backgroundColor = "rgba(0, 100, 255, 0.1)";
  d.style.borderLeft = d.style.borderBottom = "1px solid black";
  d.style.transformOrigin = `0px ${Q}px 0px`;
  d.style.transform = "rotateX(90deg)";

  // -x +z quadrant.  +z is "out of the screen," towards the viewer.
  d = document.createElement("div");
  xyz.appendChild(d);
  d.style.width = d.style.height = `${Q}px`;
  d.style.position = "absolute";
  d.style.top = `${Q}px`;
  d.style.borderRight = d.style.borderTop = "1px solid black";
  d.style.transformOrigin = "100px 0px 0px";
  d.style.transform = "rotateX(90deg)";

  // A yellow square to move around.
  let Square3D_1 = document.createElement("div");
  xyz.appendChild(Square3D_1);
  Square3D_1.style.width = Square3D_1.style.height = `${Q * 0.5}px`; // Size of square.
  Square3D_1.style.position = "absolute";
  Square3D_1.style.left = Square3D_1.style.top = `${Q * 0.75}px`; // Offset in xy-plane from coordinate
  // system top left corner.
  Square3D_1.style.backgroundColor = "rgba(255, 220, 0, 0.8)";
  Square3D_1.style.border = "1px solid black";

  // A yellow square to move around.
  let Square3D_2 = document.createElement("div");
  xyz.appendChild(Square3D_2);
  Square3D_2.style.width = Square3D_2.style.height = `${Q * 0.5}px`; // Size of square.
  Square3D_2.style.position = "absolute";
  Square3D_2.style.left = Square3D_2.style.top = `${Q * 0.75}px`; // Offset in xy-plane from coordinate
  // system top left corner.
  Square3D_2.style.backgroundColor = "rgba(255, 20, 0, 0.8)";
  Square3D_2.style.border = "1px solid black";
  
  // Apply 3D transformation represented by values in matrix m
  // to the yellow square (after flipping Y-axis to point upward
  // and bringing square slightly forward, so that when it's in
  // the xy-plane it appears slightly in front of the axes).
  Square3D_1.style.transform = `scaleY(-1) translateZ(2px) matrix3d(${matrix3D_1})`;
  Square3D_2.style.transform = `scaleY(-1) translateZ(2px) matrix3d(${matrix3D_1})`;

  let frameCount = 0;

  let transform1_1 = multiply4x4(translate, start)
  let transform2_1 = multiply4x4(translate2, transform1_1)
  let transform3_1 = multiply4x4(scale_half, transform2_1)

  let transform1_2 = multiply4x4(translate2, start)
  let transform2_2 = multiply4x4(scale_half, transform1_2)
  let transform3_2 = multiply4x4(translate, transform2_2)

  function animate() {
    Square3D_1.style.transform = `matrix3d(${matrix3D_1})`;
    Square3D_2.style.transform = `matrix3d(${matrix3D_2})`;

    if (frameCount < 50) {

        for (let i = 0; i < 16; i++) {
            matrix3D_1[i] = (lerp(start[i], transform1_1[i], (Math.min(frameCount, 30) / 30)))
            matrix3D_2[i] = (lerp(start[i], transform1_2[i], (Math.min(frameCount, 30) / 30)))
        }

    } else if (frameCount < 100) {
      
        for (let i = 0; i < 16; i++) {
            matrix3D_1[i] = (lerp(transform1_1[i], transform2_1[i], (Math.min(frameCount - 50, 30) / 30)))
            matrix3D_2[i] = (lerp(transform1_2[i], transform2_2[i], (Math.min(frameCount - 50, 30) / 30)))
        }

    } else if (frameCount < 150) {

        for (let i = 0; i < 16; i++) {
            matrix3D_1[i] = (lerp(transform2_1[i], transform3_1[i], (Math.min(frameCount - 100, 30) / 30)))
            matrix3D_2[i] = (lerp(transform2_2[i], transform3_2[i], (Math.min(frameCount - 100, 30) / 30)))
        }

    } else if (frameCount > 200) {

        frameCount = 0;
    }

    mDiv3D_1.innerHTML = matrixHTML(matrix3D_1);
    mDiv3D_2.innerHTML = matrixHTML(matrix3D_2);

    frameCount++;
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

window.onload = main;