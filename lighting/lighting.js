"use strict";

import {gl, shaderProgram, setup } from "./setup.js";
const {mat2, mat3, mat4, vec2, vec3, vec4} = glMatrix;

setup("lighting.vert", "lighting.frag").then(main);

function main() {
    let mvTransform, pTransform, nTransform, lightTransform
    let mvHistory = []

    const BLUE = [0.1, 0.4, 0.8];
    const RED = [0.9, 0.1, 0.1];
    const GREEN = [0.1, 0.8, 0.2];




    function drawCube() {

        function drawSquare() {

            mvHistory.push(mat4.clone(mvTransform));
            // magic goes here
            mat4.translate(mvTransform, mvTransform, [0, 0, 0.5]);

            mat4.invert(nTransform, mvTransform)
            mat4.transpose(nTransform, nTransform)

            gl.uniform3f(uniforms.uColor, ...RED);
            gl.uniformMatrix4fv(uniforms.mvTransform, false, mvTransform);
            gl.uniformMatrix4fv(uniforms.nTransform, false, nTransform);
            gl.uniformMatrix4fv(uniforms.lightTransform, false, lightTransform);
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4)

            mvTransform = mvHistory.pop()

        }

        mvHistory.push(mat4.clone(mvTransform));

        drawSquare()
        mat4.rotateY(mvTransform, mvTransform, Math.PI / 2)
        drawSquare()
        mat4.rotateY(mvTransform, mvTransform, Math.PI / 2)
        drawSquare()
        mat4.rotateY(mvTransform, mvTransform, Math.PI / 2)
        drawSquare()
        mat4.rotateX(mvTransform, mvTransform, Math.PI / 2)
        drawSquare()
        mat4.rotateX(mvTransform, mvTransform, Math.PI)
        drawSquare()

        mvTransform = mvHistory.pop()

    }

    gl.clearColor(1, 1, 1, 1);
    gl.enable(gl.DEPTH_TEST);

    const uniforms = {
        pTransform: gl.getUniformLocation(shaderProgram, "pTransform"),
        mvTransform: gl.getUniformLocation(shaderProgram, "mvTransform"),
        nTransform: gl.getUniformLocation(shaderProgram, "nTransform"),
        uColor: gl.getUniformLocation(shaderProgram, "uColor"),
        lightTransform: gl.getUniformLocation(shaderProgram, "lightTransform"),
    }

    const attributes = {
        position: gl.getAttribLocation(shaderProgram, "position"),
        normalVector: gl.getAttribLocation(shaderProgram, "normalVector"),
    }

    gl.enableVertexAttribArray(attributes.position)
    gl.enableVertexAttribArray(attributes.normalVector)

    let vertexData = [
         0.5,  0.5, 0,
         0.5, -0.5, 0,
        -0.5, -0.5, 0,
        -0.5,  0.5, 0,
    ]

    let normalData = [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
    ]

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW)
    gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0)

    // put a normal buffer here when we're ready for it
    let normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW)
    gl.vertexAttribPointer(attributes.normalVector, 3, gl.FLOAT, false, 0, 0)

    // transforms go here
    pTransform = mat4.create();
    mvTransform = mat4.create();
    nTransform = mat4.create();
    lightTransform = mat4.create();

    // mat4.frustum(pTransform, -1, 1, -0.75, 0.75, 5, 35)
    gl.uniformMatrix4fv(uniforms.pTransform, false, pTransform)

    // mat4.translate(mvTransform, mvTransform, [0, 0, -20])
    // mat4.scale(mvTransform, mvTransform, [3, 3, 3])
    mat4.rotateX(mvTransform, mvTransform, Math.PI * -20 / 180)
    mat4.rotateY(mvTransform, mvTransform, Math.PI * -30 / 180)

    lightTransform = mat4.clone(mvTransform)

    function animate() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.rotateY(lightTransform, lightTransform, Math.PI / 180)
        drawCube()

        requestAnimationFrame(animate)
    }

    animate()
}