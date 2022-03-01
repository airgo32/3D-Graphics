"use strict";

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
    let f = n => formatNum(n, 6, 2);

    // For 6-value array, representing 2D transformation matrix.
    // (Full matrix would have 9 values, but only the 6 values
    // needed for scale, rotation and translation are used.)
    if (a.length == 6) {
      return "<pre>\n" +
        nw + "                " + ne + "\n" +
        vt + ` ${f(a[0])}  ${f(a[1])} ` + vt + "\n" +
        vt + ` ${f(a[2])}  ${f(a[3])} ` + vt + "\n" +
        vt + ` ${f(a[4])}  ${f(a[5])} ` + vt + "\n" +
        sw + "                " + se + "\n" +
        "</pre>";
        
    // For 16-value array, representing 3D transformation matrix.
    } else {
      return "<pre>\n" +
        nw + "                                " + ne + "\n" +
        vt + ` ${f(a[ 0])}  ${f(a[ 1])}  ${f(a[ 2])}  ${f(a[ 3])} ` + vt + "\n" +
        vt + ` ${f(a[ 4])}  ${f(a[ 5])}  ${f(a[ 6])}  ${f(a[ 7])} ` + vt + "\n" +
        vt + ` ${f(a[ 8])}  ${f(a[ 9])}  ${f(a[10])}  ${f(a[11])} ` + vt + "\n" +
        vt + ` ${f(a[12])}  ${f(a[13])}  ${f(a[14])}  ${f(a[15])} ` + vt + "\n" +
        sw + "                                " + se + "\n" +
        "</pre>";
    }
  }

  let Q = 100; // Coordinate system quadrant size in pixels.

  // 2D transformation matrix.
  let matrix2D = [
    1, 0, 
    0, 1, 
    0, 0];
  let mDiv2D = document.querySelector("#matrix2D");
  mDiv2D.innerHTML = matrixHTML(matrix2D);
  // mDiv.style.display = "inline-block";

  // xy is container for 2D coordinate system.
  let xy = document.querySelector("#xy");
  xy.style.position = "relative";
  xy.style.width = xy.style.height = `${Q * 2}px`;

  // Upper right quadrant (transparent blue).
  let d = document.createElement("div");
  xy.appendChild(d);
  d.style.width = d.style.height = `${Q}px`;
  d.style.position = "absolute";
  d.style.left = `${Q}px`;
  d.style.backgroundColor = "rgba(0, 100, 255, 0.1)";
  d.style.borderLeft = d.style.borderBottom = "1px solid black";

  // Lower left quadrant.
  d = document.createElement("div");
  xy.appendChild(d);
  d.style.width = d.style.height = `${Q}px`;
  d.style.position = "absolute";
  d.style.top = `${Q}px`;
  d.style.borderRight = d.style.borderTop = "1px solid black";

  // A yellow square to move around.
  let square2D = document.createElement("div");
  xy.appendChild(square2D);
  square2D.style.width = square2D.style.height = `${Q * 0.5}px`; // Size of square.
  square2D.style.position = "absolute";
  square2D.style.left = square2D.style.top = `${Q * 0.75}px`; // Offset from coordinate system top
  // left corner.
  square2D.style.backgroundColor = "rgba(255, 220, 0, 0.8)";
  square2D.style.border = "1px solid black";
  square2D.style.borderRight = "2px solid red";

  // Apply 2D transformation represented by values in matrix m
  // to the yellow square (after flipping Y-axis to point upward).
  square2D.style.transform = `scaleY(-1) matrix(${matrix2D})`;

  // 3D BEGINS HERE

  // 3D transformation matrix.
  let matrix3D = [ 
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1 ];

let mDiv3D = document.querySelector("#matrix3D");
mDiv3D.innerHTML = matrixHTML(matrix3D);

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
let square3D = document.createElement("div");
xyz.appendChild(square3D);
square3D.style.width = square3D.style.height = `${Q * 0.5}px`; // Size of square.
square3D.style.position = "absolute";
square3D.style.left = square3D.style.top =
  `${Q * 0.75}px`;  // Offset in xy-plane from coordinate
                    // system top left corner.
square3D.style.backgroundColor = "rgba(255, 220, 0, 0.8)";
square3D.style.border = "1px solid black";
square3D.style.borderRight = "2px solid red"

// Apply 3D transformation represented by values in matrix m
// to the yellow square (after flipping Y-axis to point upward
// and bringing square slightly forward, so that when it's in
// the xy-plane it appears slightly in front of the axes).
square3D.style.transform = `scaleY(-1) translateZ(2px) matrix3d(${matrix3D})`;

  let frameCount = 0;

  function animate() {
    let angle1 = Math.sin((Math.min(frameCount, 180) * Math.PI) / 360);
    let angle2 = Math.cos((Math.min(frameCount, 180) * Math.PI) / 360);

    matrix2D = [angle2, angle1 * -1, angle1, angle2, 0, 0];
    matrix3D =[
            angle2, angle1, 0, 0,
         angle1*-1, angle2, 0, 0,
                 0,      0, 1, 0,
                 0,      0, 0, 1,
    ]

    if (frameCount % 10 == 0) {
      mDiv2D.innerHTML = matrixHTML(matrix2D);
      mDiv3D.innerHTML = matrixHTML(matrix3D);
    }

    square2D.style.transform = `matrix(${matrix2D})`;
    square3D.style.transform = `matrix3d(${matrix3D})`;

    frameCount++;
    frameCount %= 360;

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

window.onload = main;
