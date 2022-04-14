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

    function drawFromTris() {
        mvHistory.push(mat4.clone(mvTransform));
        // magic goes here
        mat4.translate(mvTransform, mvTransform, [0, 0, 0.5]);

        mat4.invert(nTransform, mvTransform)
        mat4.transpose(nTransform, nTransform)

        gl.uniform3f(uniforms.uColor, ...RED);
        gl.uniformMatrix4fv(uniforms.mvTransform, false, mvTransform);
        gl.uniformMatrix4fv(uniforms.nTransform, false, nTransform);
        gl.uniformMatrix4fv(uniforms.lightTransform, false, lightTransform);
        gl.drawArrays(gl.TRIANGLES, 0, columnVertexData.length / 3)

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

    let columnVertexData = [
        // first side
        1.0,   -2.5, 0.0,
        0.707, -2.5, 0.707,
        0.707,  2.5, 0.707,
        1.0,   -2.5, 0.0,
        0.707,  2.5, 0.707,
        1.0,    2.5, 0.0,

        // second side
        0.0,   -2.5, 1.0,
        0.707, -2.5, 0.707,
        0.707,  2.5, 0.707,
        0.0,   -2.5, 1.0,
        0.707,  2.5, 0.707,
        0.0,    2.5, 1.0,

        // third side
        0.0,   -2.5, 1.0,
        -0.707, -2.5, 0.707,
        -0.707,  2.5, 0.707,
        0.0,   -2.5, 1.0,
        -0.707,  2.5, 0.707,
        0.0,    2.5, 1.0,

        // fourth side
        -1.0,   -2.5, 0.0,
        -0.707, -2.5, 0.707,
        -0.707,  2.5, 0.707,
        -1.0,   -2.5, 0.0,
        -0.707,  2.5, 0.707,
        -1.0,    2.5, 0.0,

        // fifth side
        -1.0,   -2.5,  0.0,
        -0.707, -2.5, -0.707,
        -0.707,  2.5, -0.707,
        -1.0,   -2.5,  0.0,
        -0.707,  2.5, -0.707,
        -1.0,    2.5,  0.0,
        
        // sixth side
        0.0,   -2.5, -1.0,
        -0.707, -2.5, -0.707,
        -0.707,  2.5, -0.707,
        0.0,   -2.5, -1.0,
        -0.707,  2.5, -0.707,
        0.0,    2.5, -1.0,

        // seventh side
        0.0,   -2.5, -1.0,
        0.707, -2.5, -0.707,
        0.707,  2.5, -0.707,
        0.0,   -2.5, -1.0,
        0.707,  2.5, -0.707,
        0.0,    2.5, -1.0,

        // eighth side
        1.0,   -2.5, 0.0,
        0.707, -2.5, -0.707,
        0.707,  2.5, -0.707,
        1.0,   -2.5, 0.0,
        0.707,  2.5, -0.707,
        1.0,    2.5, 0.0,

        // top octagon
        1.0,    2.5, 0.0,
        0.707,  2.5, 0.707,
        0.0,    2.5, 1.0,
         1.0,   2.5, 0.0,
         0.0,   2.5, 1.0,
        -0.707, 2.5, 0.707,
         1.0,   2.5, 0.0,
        -0.707, 2.5, 0.707,
        -1.0,   2.5, 0.0,
        1.0,    2.5, 0.0,
        -1.0,   2.5, 0.0,
        -0.707, 2.5, -0.707,
        1.0,    2.5, 0.0,
        -0.707, 2.5, -0.707,
        0.0,    2.5, -1.0,
        1.0,    2.5, 0.0,
        0.0,    2.5, -1.0,
        0.707,  2.5, -0.707,

        // bottom octagon
        1.0,    -2.5, 0.0,
        0.707,  -2.5, 0.707,
        0.0,    -2.5, 1.0,
         1.0,   -2.5, 0.0,
         0.0,   -2.5, 1.0,
        -0.707, -2.5, 0.707,
         1.0,   -2.5, 0.0,
        -0.707, -2.5, 0.707,
        -1.0,   -2.5, 0.0,
        1.0,    -2.5, 0.0,
        -1.0,   -2.5, 0.0,
        -0.707, -2.5, -0.707,
        1.0,    -2.5, 0.0,
        -0.707, -2.5, -0.707,
        0.0,    -2.5, -1.0,
        1.0,    -2.5, 0.0,
        0.0,    -2.5, -1.0,
        0.707,  -2.5, -0.707,
    ]

    let columnNormalData = [
        // first side
        0.924, 0.0, 0.383,
        0.924, 0.0, 0.383,
        0.924, 0.0, 0.383,
        0.924, 0.0, 0.383,
        0.924, 0.0, 0.383,
        0.924, 0.0, 0.383,
        
        // second side
        0.383, 0.0, 0.924,
        0.383, 0.0, 0.924,
        0.383, 0.0, 0.924,
        0.383, 0.0, 0.924,
        0.383, 0.0, 0.924,
        0.383, 0.0, 0.924,        
        
        // third side
        -0.383, 0.0, 0.924,
        -0.383, 0.0, 0.924,
        -0.383, 0.0, 0.924,
        -0.383, 0.0, 0.924,
        -0.383, 0.0, 0.924,
        -0.383, 0.0, 0.924,

        // fourth side
        -0.924, 0.0, 0.383,
        -0.924, 0.0, 0.383,
        -0.924, 0.0, 0.383,
        -0.924, 0.0, 0.383,
        -0.924, 0.0, 0.383,
        -0.924, 0.0, 0.383,

        // fifth side
        -0.924, 0.0, -0.383,
        -0.924, 0.0, -0.383,
        -0.924, 0.0, -0.383,
        -0.924, 0.0, -0.383,
        -0.924, 0.0, -0.383,
        -0.924, 0.0, -0.383,

        // sixth side
        -0.383, 0.0, -0.924,
        -0.383, 0.0, -0.924,
        -0.383, 0.0, -0.924,
        -0.383, 0.0, -0.924,
        -0.383, 0.0, -0.924,
        -0.383, 0.0, -0.924,

        // seventh side
        0.383, 0.0, -0.924,
        0.383, 0.0, -0.924,
        0.383, 0.0, -0.924,
        0.383, 0.0, -0.924,
        0.383, 0.0, -0.924,
        0.383, 0.0, -0.924,

        // eigth side        
        0.924, 0.0, -0.383,
        0.924, 0.0, -0.383,
        0.924, 0.0, -0.383,
        0.924, 0.0, -0.383,
        0.924, 0.0, -0.383,
        0.924, 0.0, -0.383,

        // top octagon
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        
        // bottom octagon
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
    ]

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(columnVertexData), gl.STATIC_DRAW)
    gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0)

    // put a normal buffer here when we're ready for it
    let normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(columnNormalData), gl.STATIC_DRAW)
    gl.vertexAttribPointer(attributes.normalVector, 3, gl.FLOAT, false, 0, 0)

    // transforms go here
    pTransform = mat4.create();
    mvTransform = mat4.create();
    nTransform = mat4.create();
    lightTransform = mat4.create();

    mat4.frustum(pTransform, -1, 1, -0.75, 0.75, 5, 35)
    gl.uniformMatrix4fv(uniforms.pTransform, false, pTransform)

    mat4.translate(mvTransform, mvTransform, [0, 0, -20])
    // mat4.scale(mvTransform, mvTransform, [3, 3, 3])
    mat4.rotateX(mvTransform, mvTransform, Math.PI * 20 / 180)
    mat4.rotateY(mvTransform, mvTransform, Math.PI * -30 / 180)

    // mat4.rotateX(mvTransform, mvTransform, Math.PI/2)

    lightTransform = mat4.clone(mvTransform)



    // let v1 = vec3.fromValues(0, 5, 0)
    // let v2 = vec3.fromValues((Math.SQRT2 / 2) - 1, 0, (Math.SQRT2 / 2))

    // let v = vec3.create();
    // vec3.cross(v, v1, v2)
    // vec3.normalize(v, v)
    // console.log(v)

    function animate() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.rotateY(lightTransform, lightTransform, Math.PI / 30)
        // mat4.rotateY(mvTransform, mvTransform, Math.PI / 900)
        // drawCube()
        drawFromTris()

        requestAnimationFrame(animate)
    }

    animate()
}