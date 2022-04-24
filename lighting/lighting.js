"use strict";

import {gl, shaderProgram, setup } from "./setup.js";
const {mat2, mat3, mat4, vec2, vec3, vec4} = glMatrix;

setup("lighting.vert", "lighting.frag").then(main);
let mvTransform, pTransform, nTransform, lightTransform

function main() {
    let lightPositions = [
        0.0, 0.5, 0.0,
        -2.0, 4.0, -2.0,
    ]
    let lightColors = [
        0.7, 0.27, 0.0,
        // 0.0, 0.9, 0.6,
        // 0.0, 0.0, 0.2
    ]
    let lightStrengths = [
        0,
        10
    ]

    let mvHistory = []

    class Drawable {
        constructor(vertices, normals, color, b_colorAttribute = false, b_lightBothSides = false) {
            this.vertexBuffer = gl.createBuffer()
            this.normalBuffer = gl.createBuffer()
            if (b_colorAttribute) {
                this.colorBuffer = gl.createBuffer()
            }
            this.vertices = vertices
            this.normals = normals
            this.b_colorAttribute = b_colorAttribute
            this.b_lightBothSides = b_lightBothSides
            this.color = color

            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW)

            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW)

            if (b_colorAttribute) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.color), gl.STATIC_DRAW)
            }
        }

        preDraw() {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
            gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0)

            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
            gl.vertexAttribPointer(attributes.normalVector, 3, gl.FLOAT, false, 0, 0)

            if (this.b_colorAttribute) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
                gl.vertexAttribPointer(attributes.color, 3, gl.FLOAT, false, 0, 0)
            }
        }

        draw() {

            mvHistory.push(mat4.clone(mvTransform));

            // create the normal matrix
            let invTrans = mat4.create()
            mat4.invert(invTrans, mvTransform)
            mat4.transpose(invTrans, invTrans)

            gl.uniform1i(uniforms.b_colorAttribute, this.b_colorAttribute)
            gl.uniform1i(uniforms.b_lightBothSides, this.b_lightBothSides)
            // set color
            if (!this.b_colorAttribute) {
                gl.uniform3f(uniforms.uColor, ...this.color);
            }

            // set transformation matrix uniforms
            gl.uniformMatrix4fv(uniforms.mvTransform, false, mvTransform);
            gl.uniformMatrix4fv(uniforms.nTransform, false, invTrans);
            gl.uniformMatrix4fv(uniforms.lightTransform, false, lightTransform);

            // lighting data
            gl.uniform3fv(uniforms.lightPositions, lightPositions);
            gl.uniform3fv(uniforms.lightColors, lightColors);
            gl.uniform1fv(uniforms.lightStrengths, lightStrengths);

            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3)

            mvTransform = mvHistory.pop()
        }
    }

    const BLUE = [0.1, 0.4, 0.8];
    const RED = [0.9, 0.1, 0.1];
    const GREEN = [0.1, 0.8, 0.2];
    const WHITE = [1.0, 1.0, 1.0];
    const BLACK = [0.05, 0.05, 0.05];
    const BROWN = [0.259, 0.157, 0.055];
    const GRAY = [0.412, 0.412, 0.412];

    const FLOOR = [0.2, 0.3, 0.1];

    const CLEAR_COLOR = BLACK;

    function generateGrass(spawnX, spawnZ) {
        let x1, z1, x2, z2, x3, y3, z3, r, g, b

        x1 = spawnX + (Math.random() * 0.3) - 0.15
        z1 = spawnZ + (Math.random() * 0.3) - 0.15

        x2 = spawnX + (Math.random() * 0.3) - 0.15
        z2 = spawnZ + (Math.random() * 0.3) - 0.15

        x3 = spawnX + ((x1 - x2) / 2) * Math.random() * 0.5
        y3 = 0.6 + (Math.random() * 0.3)
        z3 = spawnZ + ((z1 - z2) / 2) * Math.random() * 0.5

        r = 0.2 + (Math.random() * 0.03)
        g = 0.4 + (Math.random() * 0.2)
        b = 0.1 + (Math.random() * 0.2)

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
        }
    }

    function generateSphere(precision, radius) {

        let data = {
            vertices: [],
            normals: [],
        }

        let top = vec4.fromValues(0.0, radius, 0.0, 1.0)

        let xRot = mat4.create()
        mat4.rotateX(xRot, xRot, Math.PI / precision)
        let yRot = mat4.create()
        mat4.rotateY(yRot, yRot, Math.PI / precision)
        
        for (let i = 0; i < precision; i++) {

            // create the box for this segment of the sphere
            let v00 = vec3.create()
            let v01 = vec3.create()
            let v10 = vec3.create()
            let v11 = vec3.create()
            
            v00 = vec3.clone(top)
            vec3.transformMat4(v01, v00, xRot)
            vec3.transformMat4(v10, v00, yRot)
            vec3.transformMat4(v11, v01, yRot)


            for (let j = 0; j < precision * 2; j++) {
                // copy the vertices of the box into triangles

                data.vertices.push(...v00, ...v01, ...v10, ...v01, ...v10, ...v11)

                // calculate the normal vectors
                let vx = vec3.create()
                let vy = vec3.create()
                let cross = vec3.create()

                vec3.subtract(vx, v11, v01)
                vec3.subtract(vy, v00, v01)
                vec3.cross(cross, vx, vy)
                vec3.normalize(cross, cross)
                data.normals.push(...cross, ...cross, ...cross, ...cross, ...cross, ...cross)

                // rotate the vectors
                vec3.transformMat4(v00, v00, yRot)
                vec3.transformMat4(v01, v01, yRot)
                vec3.transformMat4(v10, v10, yRot)
                vec3.transformMat4(v11, v11, yRot)
            }

            // rotate the vectors to return to start
            vec3.transformMat4(top, top, xRot)
        }

        return data;
    }

    gl.clearColor(...CLEAR_COLOR, 1);
    gl.enable(gl.DEPTH_TEST);

    const uniforms = {
        pTransform: gl.getUniformLocation(shaderProgram, "pTransform"),
        mvTransform: gl.getUniformLocation(shaderProgram, "mvTransform"),
        nTransform: gl.getUniformLocation(shaderProgram, "nTransform"),
        lightTransform: gl.getUniformLocation(shaderProgram, "lightTransform"),

        b_colorAttribute: gl.getUniformLocation(shaderProgram, "b_colorAttribute"),
        b_lightBothSides: gl.getUniformLocation(shaderProgram, "b_lightBothSides"),
        uColor: gl.getUniformLocation(shaderProgram, "uColor"),

        lightPositions: gl.getUniformLocation(shaderProgram, "lightPositions"),
        lightColors: gl.getUniformLocation(shaderProgram, "lightColors"),
        lightStrengths: gl.getUniformLocation(shaderProgram, "lightStrengths"),
    }

    const attributes = {
        position: gl.getAttribLocation(shaderProgram, "position"),
        normalVector: gl.getAttribLocation(shaderProgram, "normalVector"),
        color: gl.getAttribLocation(shaderProgram, "color"),
    }

    gl.enableVertexAttribArray(attributes.position)
    gl.enableVertexAttribArray(attributes.normalVector)
    gl.enableVertexAttribArray(attributes.color)

    let floorVertexData = [
         10, 0,  10,
        -10, 0, 10,
        -10, 0, -10,
        10, 0,  10,
        -10, 0, -10,
        10, 0,  -10,
    ]

    let floorNormalData = [
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
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

    // generate grass
    for (let i = 0; i < 25; i++) {
        let blade = generateGrass((4 * Math.random()) - 2, (4 * Math.random()) - 2)

        grassVertexData.push(...blade.triangle)
        grassColors.push(...blade.color)
        grassNormalData.push(...blade.normals)

    }
    // plotSize = n --> an n*n field of grasses
    let plotSize = 5;

    for (let i = 0; i < plotSize * plotSize; i++) {

        grassRotationOffsets.push(Math.floor(Math.random() * 4))

    }

    let frameCount = 0;
    let turnRate = 1;

    let sphereData = generateSphere(4, 2)
    // console.log(sphereData)

    let grass = new Drawable(grassVertexData, grassNormalData, grassColors, true, true)

    let column = new Drawable(columnVertexData, columnNormalData, BROWN)

    let floor = new Drawable(floorVertexData, floorNormalData, FLOOR)

    let sphere = new Drawable(sphereData.vertices, sphereData.normals, GRAY)

    mat4.rotateY(mvTransform, mvTransform, 20 * Math.PI / 180)

    function animate() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.rotateY(mvTransform, mvTransform, Math.PI / 900)
        // mat4.rotateY(lightTransform, lightTransform, Math.PI / 900)
        // lightTransform = mat4.clone(mvTransform)


        floor.preDraw()
        floor.draw()

        grass.preDraw()

        mvHistory.push(mat4.clone(mvTransform))

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
                    grass.draw()
                    mat4.rotateY(mvTransform, mvTransform,Math.PI / -2 * grassRotationOffsets[(i * 5) + j])
                }
                
                mat4.translate(mvTransform, mvTransform, [4, 0, 0])
            }
            mat4.translate(mvTransform, mvTransform, [-4 * plotSize, 0, 4])
        }
        mat4.translate(mvTransform, mvTransform, [2 * ( plotSize - 1), 0, -2 * (plotSize + 1)])

        mvTransform = mvHistory.pop()

        mvHistory.push(mat4.clone(mvTransform))
        column.preDraw()

        // mat4.translate(mvTransform, mvTransform, [-3, 2.5, -3])
        // mat4.rotateY(mvTransform, mvTransform, Math.PI / 8)
        // column.draw()

        mvTransform = mvHistory.pop()
        mvHistory.push(mat4.clone(mvTransform))

        mat4.translate(mvTransform, mvTransform, [4, 0.5, -3])
        mat4.rotateX(mvTransform, mvTransform, Math.PI / 2)
        mat4.rotateZ(mvTransform, mvTransform, -60 * Math.PI / 180)
        column.draw()

        mvTransform = mvHistory.pop()
        mvHistory.push(mat4.clone(mvTransform))

        mat4.translate(mvTransform, mvTransform, [-6, 0.25, 0])
        mat4.rotateX(mvTransform, mvTransform, Math.PI / 2)
        mat4.rotateZ(mvTransform, mvTransform, -10 * Math.PI / 180)
        mat4.rotateY(mvTransform, mvTransform, Math.PI / 8)

        column.draw()

        let funcA = (Math.sin(frameCount * Math.PI / 180) + 1)
        let funcB = (Math.sin(2 * frameCount * Math.PI / 180) + 1)
        let funcC = (Math.sin(4 * frameCount * Math.PI / 180) + 1)
        lightStrengths[0] = 20 + funcB + (Math.cos(frameCount * Math.PI / 18) * funcA * funcB * funcC)

        mvTransform = mvHistory.pop()
        mvHistory.push(mat4.clone(mvTransform))

        mat4.translate(mvTransform, mvTransform, [-4.0, -0.4, -6.0])

        mat4.rotateX(mvTransform, mvTransform, -20 * Math.PI / 180)
        mat4.rotateZ(mvTransform, mvTransform, -120 * Math.PI / 180)

        // mat4.rotateY(mvTransform, mvTransform, frameCount * Math.PI / 180 / 2)
        // mat4.rotateX(mvTransform, mvTransform, frameCount * Math.PI / 180 / 4)
        // mat4.rotateZ(mvTransform, mvTransform, frameCount * Math.PI / 180 / -4)


        sphere.preDraw()
        sphere.draw()

        mvTransform = mvHistory.pop()

        frameCount++;
        requestAnimationFrame(animate)
    }

    animate()
}