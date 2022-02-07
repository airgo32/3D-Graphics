"use strict";

function main() {

    // let square = document.getElementById(square)
    // let square = document.querySelector("#square");
    let square = document.createElement("div");
    document.querySelector("body").appendChild(square);
    square.innerHTML = "Hello, World!"

    square.style.width = square.style.height = "150px"
    square.style.padding = "10px"
    square.style.textAlign = "center"
    square.style.backgroundColor = "rgb(250, 200, 100)"

    square.style.transformOrigin = "center center 0";

    let frameCount = 0;

    function animate() {

        let angle1 = 1 * Math.sin(frameCount / 120);
        let negAngle = angle1 * -1
        let angle2 = 1 * Math.cos(frameCount / 120)
        // square.style.transform = `rotate(${angle}deg)`;

        square.style.transform = `matrix(${angle1}, ${angle2 * (-1)}, ${angle2}, ${angle1}, 0,0)`
        frameCount++;

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

window.onload = main;