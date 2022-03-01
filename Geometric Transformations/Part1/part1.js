"use strict";

function main() {
  const vector2D = [2, 3, 1];
  const transform2D = [3, 0, 0, 1, 1, 2];

  const vector3D = [2, 3, 0, 1];
  const transform3D = [2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 3, 0, 1];

  const testString = "$$\\frac{1}{\\sqrt{x^2 + 1}}$$";
  /**
   * Multiples a 2D point in space by a transform
   * @param {*} v - the point to be transformed
   * @param {*} t - the transform to apply to the point
   * @returns the transformed point
   */
  const multiply2D = (v, t) => {
    let result = [0, 0];
    result[0] = v[0] * t[0] + v[1] * t[2] + v[2] * t[4];
    result[1] = v[0] * t[1] + v[1] * t[3] + v[2] * t[5];
    return result;
  };

  /**
   * Multiplies a 3D point in space by a transform
   * @param v - the point to be transformed
   * @param t - the transform to apply on the point
   * @returns the transformed point
   */
  const multiply3D = (v, t) => {
    let result = [];
    result[0] = v[0] * t[0] + v[1] * t[4] + v[2] * t[8] + v[3] * t[12];
    result[1] = v[0] * t[1] + v[1] * t[5] + v[2] * t[9] + v[3] * t[13];
    result[2] = v[0] * t[2] + v[1] * t[6] + v[2] * t[10] + v[3] * t[14];
    result[3] = v[0] * t[3] + v[1] * t[7] + v[2] * t[11] + v[3] * t[15];

    return result;
  };

  /**
   * Converts a matrix into a string for use with MathJax
   * (Does not include $$ before and after)
   * @param matrix - the matrix to be transformed into a string
   * @param height - the height of the matrix to be transformed
   * @param width - the width of the matrix to be transformed
   * @returns the translated matrix as a string
   */
  const matrixToString = (matrix, height, width) => {
    // put beginning of MathJax string here
    let result = "\\begin{bmatrix}";

    // loop through each column
    for (let j = 0; j < height; j++) {
      // start new row
      for (let i = 0; i < width; i++) {
        // do each entry in the column
        result += "" + matrix[i + j * width];

        // formatting stuff
        result += i + 1 == width ? (j + 1 == height ? "" : "\\\\") : "&";
      }
      // end the column and start another
    }

    // put any ending stuff for MathJax string
    result += "\\end{bmatrix}";

    return result;
  };

  let vec2D = matrixToString(vector2D, 1, 3);
  let trans2D = matrixToString(transform2D, 3, 2);
  let fin2D = matrixToString(multiply2D(vector2D, transform2D), 1, 2);

  let eqn2D = document.querySelector("#equation2D")
  eqn2D.innerHTML = "$$" + vec2D + "\\times" + trans2D + "=" + fin2D + "$$"

  let vec3D = matrixToString(vector3D, 1, 4);
  let trans3D = matrixToString(transform3D, 4, 4);
  let fin3D = matrixToString(multiply3D(vector3D, transform3D), 1, 4);

  let eqn3D = document.querySelector("#equation3D")
  eqn3D.innerHTML = "$$" + vec3D + "\\times" + trans3D + "=" + fin3D + "$$"

  MathJax.typeset();
}

window.onload = main;