"use strict";

import {gl, shaderProgram, setup, setDimensions } from "./setup.js";
import { generateSphere, generateFloor, generateColumn, generateGrass, generateFire } from "./drawables.js";

const {mat2, mat3, mat4, vec2, vec3, vec4} = glMatrix;

const WIDESCREEN = false;
const ZOOM = 1;

setDimensions(WIDESCREEN)
setup("lighting.vert", "lighting.frag").then(main);
let mvTransform, pTransform, nTransform, lightTransform

function main() {
    let lightPositions = [
        0.0, 2.0, 0.0,
        // -5.0, 4.0, -5.0,
    ]
    let lightColors = [
        0.7, 0.27, 0.0,
        // 0.0, 0.9, 0.6,
        // 0.0, 0.0, 0.2
    ]
    let lightStrengths = [
        0,
        // 10
    ]
    let mvHistory = []
    const reset = () => {
        mvTransform = mvHistory.pop()
        mvHistory.push(mat4.clone(mvTransform))
    }
    const rad = (deg) => {return deg * Math.PI / 180}
    let frameCount = 0;
    // plotSize = n --> an n*n field of grasses
    let plotSize = 9;

    class Drawable {
        constructor(vertices, normals, color, options = {}) {
            this.vertexBuffer = gl.createBuffer()
            this.normalBuffer = gl.createBuffer()
            if (options.colorIsAttribute) {
                this.colorBuffer = gl.createBuffer()
            }
            this.vertices = vertices
            this.normals = normals
            this.options = [
                options.colorIsAttribute || false,
                options.lightBothSides || false,
                options.animateHeight || false,
                options.animateWind || false,
            ]
            this.color = color

            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW)

            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW)

            if (options.colorIsAttribute) {
                gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.color), gl.STATIC_DRAW)
            }
        }

        preDraw() {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
            gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0)

            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer)
            gl.vertexAttribPointer(attributes.normalVector, 3, gl.FLOAT, false, 0, 0)

            if (this.options[0]) {
                gl.enableVertexAttribArray(attributes.color)
                gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
                gl.vertexAttribPointer(attributes.color, 3, gl.FLOAT, false, 0, 0)
            }
            else {
                gl.disableVertexAttribArray(attributes.color)
            }
        }

        draw() {

            mvHistory.push(mat4.clone(mvTransform));

            // create the normal matrix
            let invTrans = mat4.create()
            mat4.invert(invTrans, mvTransform)
            mat4.transpose(invTrans, invTrans)

            gl.uniform1iv(uniforms.options, this.options)
            // set color
            if (!this.options[0]) {
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

            //vertical offset data
            gl.uniform1f(uniforms.yOffset, frameCount)

            gl.drawArrays(gl.TRIANGLES, 0, this.vertices.length / 3)

            mvTransform = mvHistory.pop()
        }
    }

    const BLUE = [0.1, 0.4, 0.8];
    const RED = [0.9, 0.1, 0.1];
    const GREEN = [0.1, 0.8, 0.2];
    const WHITE = [1.0, 1.0, 1.0];
    const BLACK = [0.0, 0.0, 0.0];
    const BROWN = [0.259, 0.157, 0.055];
    const GRAY = [0.412, 0.412, 0.412];
    const AMBIENT = [0.0, 0.018, 0.015];
    const ORANGE = [1.0, 0.447, 0.0];
    const FLOOR = [0.2, 0.3, 0.1];

    const CLEAR_COLOR = AMBIENT;

    function drawCampfire(log, rock, fire) {
        const logCount = 5;
        const rockCount = 12;

        mvHistory.push(mat4.clone(mvTransform))

        log.preDraw()
        for(let i = 0; i < logCount; i++) {
            mat4.rotateY(mvTransform, mvTransform, rad(i * 360 / logCount))
            mat4.scale(mvTransform, mvTransform, [0.4, 0.4, 0.4])
            mat4.translate(mvTransform, mvTransform, [0, 0.5, 3])
            mat4.rotateX(mvTransform, mvTransform, rad(130))
            mat4.rotateY(mvTransform, mvTransform, rad(i * 23))
            log.draw()
            reset()
        }

        rock.preDraw()
        for(let i = 0; i < rockCount; i++) {
            mat4.rotateY(mvTransform, mvTransform, rad(i * 360 / rockCount) + rad(180 / rockCount))
            mat4.scale(mvTransform, mvTransform, [0.25, 0.25, 0.25])
            mat4.translate(mvTransform, mvTransform, [0, 0, 7])
            mat4.rotateX(mvTransform, mvTransform, rad(i * 17))
            mat4.rotateY(mvTransform, mvTransform, rad(i * 37))
            mat4.rotateZ(mvTransform, mvTransform, rad (i * 79))
            rock.draw()
            reset()
        }

        fire.preDraw()
        fire.draw()
        mvTransform = mvHistory.pop()

    }

    gl.clearColor(...CLEAR_COLOR, 1);
    gl.enable(gl.DEPTH_TEST);

    const uniforms = {
        pTransform: gl.getUniformLocation(shaderProgram, "pTransform"),
        mvTransform: gl.getUniformLocation(shaderProgram, "mvTransform"),
        nTransform: gl.getUniformLocation(shaderProgram, "nTransform"),
        lightTransform: gl.getUniformLocation(shaderProgram, "lightTransform"),

        options: gl.getUniformLocation(shaderProgram, "options"),
        uColor: gl.getUniformLocation(shaderProgram, "uColor"),

        lightPositions: gl.getUniformLocation(shaderProgram, "lightPositions"),
        lightColors: gl.getUniformLocation(shaderProgram, "lightColors"),
        lightStrengths: gl.getUniformLocation(shaderProgram, "lightStrengths"),

        yOffset: gl.getUniformLocation(shaderProgram, "yOffset")
    }

    const attributes = {
        position: gl.getAttribLocation(shaderProgram, "position"),
        normalVector: gl.getAttribLocation(shaderProgram, "normalVector"),
        color: gl.getAttribLocation(shaderProgram, "color"),
    }

    gl.enableVertexAttribArray(attributes.position)
    gl.enableVertexAttribArray(attributes.normalVector)

    // transforms go here
    pTransform = mat4.create();
    mvTransform = mat4.create();
    nTransform = mat4.create();
    lightTransform = mat4.create();

    mat4.frustum(pTransform,
        WIDESCREEN ? -1.333 / ZOOM : -1 / ZOOM,
        WIDESCREEN ? 1.333 / ZOOM : 1 / ZOOM,
        -.75 / ZOOM, .75 / ZOOM, 5, 35)
    gl.uniformMatrix4fv(uniforms.pTransform, false, pTransform)

    mat4.translate(mvTransform, mvTransform, [0, 0, -20])
    mat4.scale(mvTransform, mvTransform, [0.5, 0.5, 0.5])
    mat4.rotateX(mvTransform, mvTransform, Math.PI * 20 / 180)
    mat4.rotateY(mvTransform, mvTransform, Math.PI * -10 / 180)
    mat4.translate(mvTransform, mvTransform, [0, -2, 0])

    lightTransform = mat4.clone(mvTransform)

    let grassData = generateGrass(plotSize)
    let logData = generateColumn(10, 1, 5, true)
    let floorData = generateFloor(plotSize)
    let rockData = generateSphere(4, 2)
    let fireData = generateFire(1.5);
    let testLightData = generateSphere(10, 0.25)

    let grass = new Drawable(grassData.vertices, grassData.normals, grassData.colors,
        {
            colorIsAttribute: true,
            lightBothSides: true,
            animateWind: true,
        })
    let log = new Drawable(logData.vertices, logData.normals, BROWN)
    let floor = new Drawable(floorData.vertices, floorData.normals, FLOOR)
    let rock = new Drawable(rockData.vertices, rockData.normals, GRAY)
    let fire = new Drawable(fireData.vertices, fireData.normals, ORANGE, {lightBothSides: true, animateHeight: true})
    let testLight = new Drawable(testLightData.vertices, testLightData.normals, WHITE,
        {
            lightBothSides: true
        })
    let marshmallow = new Drawable(logData.vertices, logData.normals, WHITE)
    
    function animate() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // mat4.rotateY(mvTransform, mvTransform, Math.PI / 9000)
        // mat4.rotateY(lightTransform, lightTransform, Math.PI / 1800)
        mvHistory.push(mat4.clone(mvTransform))

        floor.preDraw()
        floor.draw()

        grass.preDraw()
        mat4.translate(mvTransform, mvTransform, [-2 * (plotSize - 1), 0, -2 * (plotSize - 1)])
        for (let i = 0; i < plotSize; i++) {
            for (let j = 0; j < plotSize; j++) {

                if (!(i == (plotSize - 1)/2 && j == (plotSize - 1)/2)) {
                    mat4.rotateY(mvTransform, mvTransform,Math.PI / 2 * grassData.rotationOffsets[(i * plotSize) + j])
                    grass.draw()
                    mat4.rotateY(mvTransform, mvTransform,Math.PI / -2 * grassData.rotationOffsets[(i * plotSize) + j])
                }
                
                
                mat4.translate(mvTransform, mvTransform, [4, 0, 0])
            }
            mat4.translate(mvTransform, mvTransform, [-4 * plotSize, 0, 4])
        }

        reset()

        mat4.translate(mvTransform, mvTransform, [0, 0, 0])
        drawCampfire(log, rock, fire)

        reset()

        log.preDraw()
        mat4.translate(mvTransform, mvTransform, [4, 0.5, -3])
        mat4.rotateX(mvTransform, mvTransform, Math.PI / 2)
        mat4.rotateZ(mvTransform, mvTransform, -60 * Math.PI / 180)
        log.draw()

        reset()

        mat4.translate(mvTransform, mvTransform, [-6, 0.25, 0])
        mat4.rotateX(mvTransform, mvTransform, Math.PI / 2)
        mat4.rotateZ(mvTransform, mvTransform, -10 * Math.PI / 180)
        mat4.rotateY(mvTransform, mvTransform, Math.PI / 8)
        log.draw()

        reset()

        let funcA = (Math.sin(frameCount * Math.PI / 180) + 1)
        let funcB = (Math.sin(2 * frameCount * Math.PI / 180) + 1)
        let funcC = (Math.sin(4 * frameCount * Math.PI / 180) + 1)
        lightStrengths[0] = 20 + funcB + (Math.cos(frameCount * Math.PI / 18) * funcA * funcB * funcC)

        mat4.translate(mvTransform, mvTransform, [-4.0, -0.4, -6.0])
        mat4.rotateX(mvTransform, mvTransform, -20 * Math.PI / 180)
        mat4.rotateZ(mvTransform, mvTransform, -120 * Math.PI / 180)

        rock.preDraw()
        rock.draw()
        reset()

        // // draw test lights
        // testLight.preDraw()
        // for (let i = 0; i < lightPositions.length; i = i + 3) {
        //     mat4.translate(mvTransform, mvTransform,
        //         [lightPositions[i], lightPositions[i+1], lightPositions[i+2]]
        //         )
        //     testLight.draw()
        //     reset()
        // }
        mat4.translate(mvTransform, mvTransform, [-1, 1, -1])
        mat4.rotateX(mvTransform, mvTransform, Math.PI / 3)
        mat4.rotateZ(mvTransform, mvTransform, Math.PI / -4)

        mat4.scale(mvTransform, mvTransform, [0.16, 0.075, 0.16])

        marshmallow.preDraw()
        marshmallow.draw()
        mat4.scale(mvTransform, mvTransform, [0.4, 5, 0.4])
        mat4.translate(mvTransform, mvTransform, [0, -2.5, 0])

        log.preDraw()
        log.draw()

        mvTransform = mvHistory.pop()



        frameCount++;
        requestAnimationFrame(animate)
    }

    animate()
}