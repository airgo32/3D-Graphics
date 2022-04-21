"use strict";

import {gl, shaderProgram, setup } from "./setup.js";
const {mat2, mat3, mat4, vec2, vec3, vec4} = glMatrix;

setup("lighting.vert", "lighting.frag").then(main);

function main() {
    let mvTransform, pTransform, nTransform, lightTransform
    let lightPositions = [
        0.0, 0.0, 0.0,
        // 0.0, 4.0, 0.0,
    ]
    let lightColors = [
        0.9, 0.2, 0.0,
        // 1.0, 1.0, 1.0,
    ]
    let lightStrengths = [
        25,
    ]

    let mvHistory = []

    // const BLUE = [0.1, 0.4, 0.8];
    const BLUE = [0.0, 0.0, 1.0];

    const RED = [0.9, 0.1, 0.1];
    const GREEN = [0.1, 0.8, 0.2];
    const WHITE = [1.0, 1.0, 1.0];
    const BLACK = [0.0, 0.0, 0.0];

    const CLEAR_COLOR = BLACK;

    function drawFromTris(color) {
        mvHistory.push(mat4.clone(mvTransform));
        // magic goes here

        mat4.invert(nTransform, mvTransform)
        mat4.transpose(nTransform, nTransform)

        gl.uniform3f(uniforms.uColor, ...color);
        gl.uniformMatrix4fv(uniforms.mvTransform, false, mvTransform);
        gl.uniformMatrix4fv(uniforms.nTransform, false, nTransform);
        gl.uniformMatrix4fv(uniforms.lightTransform, false, lightTransform);

        // CHANGE TO 4V LATER
        gl.uniform3fv(uniforms.lightPositions, lightPositions);
        gl.uniform3fv(uniforms.lightColors, lightColors);
        gl.uniform1fv(uniforms.lightStrengths, lightStrengths);

        gl.drawArrays(gl.TRIANGLES, 0, columnVertexData.length / 3)

        mvTransform = mvHistory.pop()
    }

    function generateGrass(spawnX, spawnZ) {
        let x1, z1, x2, z2, x3, y3, z3, r, g, b

        x1 = spawnX + (Math.random() * 0.3) - 0.15
        z1 = spawnZ + (Math.random() * 0.3) - 0.15

        x2 = spawnX + (Math.random() * 0.3) - 0.15
        z2 = spawnZ + (Math.random() * 0.3) - 0.15

        x3 = spawnX + ((x1 - x2) / 2) * Math.random() * 0.5
        y3 = 0.6 + (Math.random() * 0.3)
        z3 = spawnZ + ((z1 - z2) / 2) * Math.random() * 0.5

        r = (Math.random() * 0.2)
        g = 0.2 + (Math.random() * 0.1)
        b = 0.0 + (Math.random() * 0.1)

        let v1 = vec3.fromValues(x2 - x1, 0.0, z2 - z1)
        let v2 = vec3.fromValues(x3 - x2, y3, z3 - z2)

        let cross = vec3.create()
        vec3.cross(cross, v1, v2)
        vec3.normalize(cross, cross)

        return {
            triangle: [
                x1, 0.0, z1,
                x2, 0.0, z2,
                x3, y3,  z3,
            ],
            normals: [
                cross[0], cross[1], cross[2],
                cross[0], cross[1], cross[2],
                cross[0], cross[1], cross[2],
            ],
            color: [
                r, g, b,
                r, g, b,
                r, g, b,
            ],
            rotationOffset: Math.floor(Math.random() * 4)

        }
    }

    gl.clearColor(...CLEAR_COLOR, 1);
    gl.enable(gl.DEPTH_TEST);

    const uniforms = {
        pTransform: gl.getUniformLocation(shaderProgram, "pTransform"),
        mvTransform: gl.getUniformLocation(shaderProgram, "mvTransform"),
        nTransform: gl.getUniformLocation(shaderProgram, "nTransform"),
        uColor: gl.getUniformLocation(shaderProgram, "uColor"),
        lightTransform: gl.getUniformLocation(shaderProgram, "lightTransform"),

        lightPositions: gl.getUniformLocation(shaderProgram, "lightPositions"),
        lightColors: gl.getUniformLocation(shaderProgram, "lightColors"),
        lightStrengths: gl.getUniformLocation(shaderProgram, "lightStrengths"),
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

    let grassVertexData = [

    ]

    let grassColors = [

    ]

    let grassNormalData = [

    ]

    let grassRotationOffsets = [
        
    ]

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(columnVertexData), gl.STATIC_DRAW)
    gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0)

    // put a normal buffer here when we're ready for it
    let normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(columnNormalData), gl.STATIC_DRAW)
    gl.vertexAttribPointer(attributes.normalVector, 3, gl.FLOAT, false, 0, 0)

    // transforms go here
    pTransform = mat4.create();
    mvTransform = mat4.create();
    nTransform = mat4.create();
    lightTransform = mat4.create();

    mat4.frustum(pTransform, -1, 1, -0.75, 0.75, 5, 35)
    gl.uniformMatrix4fv(uniforms.pTransform, false, pTransform)

    mat4.translate(mvTransform, mvTransform, [0, 0, -20])
    mat4.scale(mvTransform, mvTransform, [0.5, 0.5, 0.5])
    mat4.rotateX(mvTransform, mvTransform, Math.PI * 20 / 180)
    mat4.rotateY(mvTransform, mvTransform, Math.PI * -30 / 180)
    mat4.translate(mvTransform, mvTransform, [0, -2, 0])

    lightTransform = mat4.clone(mvTransform)

    for (let i = 0; i < 25; i++) {
        let blade = generateGrass((4 * Math.random()) - 2, (4 * Math.random()) - 2)

        grassVertexData.push(...blade.triangle)
        grassColors.push(...blade.color)
        grassNormalData.push(...blade.normals)
        grassRotationOffsets.push(blade.rotationOffset)
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(grassVertexData), gl.STATIC_DRAW)

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(grassNormalData), gl.STATIC_DRAW)

    let frameCount = 0;
    let turnRate = 1;


    function animate() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


        if (frameCount % turnRate == 0) {
            // mat4.rotateY(lightTransform, lightTransform, Math.PI * turnRate / 90)
            // mat4.rotateY(mvTransform, mvTransform, Math.PI * turnRate / 900);
            // mat4.translate(lightTransform, lightTransform, [0, Math.sin(Math.PI * frameCount / 180), 0])

        }
        // mat4.translate(lightTransform, lightTransform, [0, Math.sin(frameCount / 28) / 45, 0])
        // mat4.translate(mvTransform, mvTransform, [0, Math.sin(frameCount / 28) / 28, 0])

        // mat4.rotateZ(mvTransform, mvTransform, Math.PI / 900)
        // mat4.rotateX(mvTransform, mvTransform, Math.PI / 900)

        mvHistory.push(mat4.clone(mvTransform))
        let plotSize = 5;

        mat4.translate(mvTransform, mvTransform, [-2 * (plotSize - 1), 0, -2 * (plotSize - 1)])
        for (let i = 0; i < plotSize; i++) {
            for (let j = 0; j < plotSize; j++) {
                if (!(
                    i == 0 & j == 0 ||
                    i == 0 & j == 4 ||
                    i == 4 & j == 0 ||
                    i == 4 & j == 4
                )) {
                    mat4.rotateY(mvTransform, mvTransform,Math.PI / 2 * grassRotationOffsets[(i * 5) + j])
                    drawFromTris(GREEN)
                    mat4.rotateY(mvTransform, mvTransform,Math.PI / -2 * grassRotationOffsets[(i * 5) + j])
                }
                
                mat4.translate(mvTransform, mvTransform, [4, 0, 0])
            }
            mat4.translate(mvTransform, mvTransform, [-4 * plotSize, 0, 4])
        }

        let funcA = (Math.sin(frameCount * Math.PI / 180) + 1)
        let funcB = (Math.sin(2 * frameCount * Math.PI / 180) + 1)
        let funcC = (Math.sin(4 * frameCount * Math.PI / 180) + 1)
        lightStrengths[0] = 10 + funcB + (Math.cos(frameCount * Math.PI / 18) * funcA * funcB * funcC)


        mvTransform = mvHistory.pop()

    
        frameCount++;
        // frameCount %= turnRate;
        requestAnimationFrame(animate)
    }

    animate()
}