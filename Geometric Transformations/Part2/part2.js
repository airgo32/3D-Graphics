"use strict";

function main() {
  /**
   * Converts a matrix into a string for use with MathJax
   * (Does not include $$ before and after)
   * @param matrix - the matrix to be transformed into a string
   * @param height - the height of the matrix to be transformed
   * @param width - the width of the matrix to be transformed
   * @returns the translated matrix as a string
   */
  const matrixToString = (matrix, height, width) => {
    let result = "\\begin{bmatrix}";

    // loop through each column
    for (let j = 0; j < height; j++) {
      // start new row
      for (let i = 0; i < width; i++) {
        // do each entry in the column
        let elem = Math.round(matrix[i + j * width] * 100) / 100;
        result += "" + elem;
        result += i + 1 == width ? (j + 1 == height ? "" : "\\\\") : "&";
      }
    }
    result += "\\end{bmatrix}";
    return result;
  };

  let Q = 100; // Coordinate system quadrant size in pixels.

  // 2D transformation matrix.
  let m = [1, 0, 0, 1, 0, 0];
  let mDiv = document.querySelector("#matrix2D");
  mDiv.innerHTML = "$$" + matrixToString(m, 3, 2) + "$$";
  mDiv.style.display = "inline-block";

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
  square2D.style.transform = `scaleY(-1) matrix(${m})`;

  let frameCount = 0;

  function animate() {
    let angle1 = Math.sin((Math.min(frameCount, 180) * Math.PI) / 360);
    let angle2 = Math.cos((Math.min(frameCount, 180) * Math.PI) / 360);

    m = [angle2, angle1 * -1, angle1, angle2, 0, 0];
    if (frameCount % 10 == 0) {
      mDiv.innerHTML = "$$" + matrixToString(m, 3, 2) + "$$";
    //   MathJax.typeset();
    }

    square2D.style.transform = `matrix(${m})`;

    frameCount++;

    frameCount %= 360;

    // MathJax.typesetClear()

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

window.onload = main;
