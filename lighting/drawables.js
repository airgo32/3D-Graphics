"use strict";
const {mat2, mat3, mat4, vec2, vec3, vec4} = glMatrix;

const rad = (deg) => {return deg * Math.PI / 180}

export function generateFloor(plotSize) {
    return {
        vertices: [
            2 * plotSize, 0,  2 * plotSize,
            -2 * plotSize, 0,  2 * plotSize,
            -2 * plotSize, 0, -2 * plotSize,
            2 * plotSize, 0,  2 * plotSize,
            -2 * plotSize, 0, -2 * plotSize,
            2 * plotSize, 0, -2 * plotSize,
        ], 
        normals: [
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
        ]
    }
}

// export function generateColumn() {
//     return {
//         vertices: [
//             // first side
//             1.0,   -2.5, 0.0,
//             0.707, -2.5, 0.707,
//             0.707,  2.5, 0.707,
//             1.0,   -2.5, 0.0,
//             0.707,  2.5, 0.707,
//             1.0,    2.5, 0.0,

//             // second side
//             0.0,   -2.5, 1.0,
//             0.707, -2.5, 0.707,
//             0.707,  2.5, 0.707,
//             0.0,   -2.5, 1.0,
//             0.707,  2.5, 0.707,
//             0.0,    2.5, 1.0,

//             // third side
//             0.0,   -2.5, 1.0,
//             -0.707, -2.5, 0.707,
//             -0.707,  2.5, 0.707,
//             0.0,   -2.5, 1.0,
//             -0.707,  2.5, 0.707,
//             0.0,    2.5, 1.0,

//             // fourth side
//             -1.0,   -2.5, 0.0,
//             -0.707, -2.5, 0.707,
//             -0.707,  2.5, 0.707,
//             -1.0,   -2.5, 0.0,
//             -0.707,  2.5, 0.707,
//             -1.0,    2.5, 0.0,

//             // fifth side
//             -1.0,   -2.5,  0.0,
//             -0.707, -2.5, -0.707,
//             -0.707,  2.5, -0.707,
//             -1.0,   -2.5,  0.0,
//             -0.707,  2.5, -0.707,
//             -1.0,    2.5,  0.0,
            
//             // sixth side
//             0.0,   -2.5, -1.0,
//             -0.707, -2.5, -0.707,
//             -0.707,  2.5, -0.707,
//             0.0,   -2.5, -1.0,
//             -0.707,  2.5, -0.707,
//             0.0,    2.5, -1.0,

//             // seventh side
//             0.0,   -2.5, -1.0,
//             0.707, -2.5, -0.707,
//             0.707,  2.5, -0.707,
//             0.0,   -2.5, -1.0,
//             0.707,  2.5, -0.707,
//             0.0,    2.5, -1.0,

//             // eighth side
//             1.0,   -2.5, 0.0,
//             0.707, -2.5, -0.707,
//             0.707,  2.5, -0.707,
//             1.0,   -2.5, 0.0,
//             0.707,  2.5, -0.707,
//             1.0,    2.5, 0.0,

//             // top octagon
//             1.0,    2.5, 0.0,
//             0.707,  2.5, 0.707,
//             0.0,    2.5, 1.0,
//             1.0,   2.5, 0.0,
//             0.0,   2.5, 1.0,
//             -0.707, 2.5, 0.707,
//             1.0,   2.5, 0.0,
//             -0.707, 2.5, 0.707,
//             -1.0,   2.5, 0.0,
//             1.0,    2.5, 0.0,
//             -1.0,   2.5, 0.0,
//             -0.707, 2.5, -0.707,
//             1.0,    2.5, 0.0,
//             -0.707, 2.5, -0.707,
//             0.0,    2.5, -1.0,
//             1.0,    2.5, 0.0,
//             0.0,    2.5, -1.0,
//             0.707,  2.5, -0.707,

//             // bottom octagon
//             1.0,    -2.5, 0.0,
//             0.707,  -2.5, 0.707,
//             0.0,    -2.5, 1.0,
//             1.0,   -2.5, 0.0,
//             0.0,   -2.5, 1.0,
//             -0.707, -2.5, 0.707,
//             1.0,   -2.5, 0.0,
//             -0.707, -2.5, 0.707,
//             -1.0,   -2.5, 0.0,
//             1.0,    -2.5, 0.0,
//             -1.0,   -2.5, 0.0,
//             -0.707, -2.5, -0.707,
//             1.0,    -2.5, 0.0,
//             -0.707, -2.5, -0.707,
//             0.0,    -2.5, -1.0,
//             1.0,    -2.5, 0.0,
//             0.0,    -2.5, -1.0,
//             0.707,  -2.5, -0.707,
//         ],
//         normals: [
//                 // first side
//                 0.924, 0.0, 0.383,
//                 0.924, 0.0, 0.383,
//                 0.924, 0.0, 0.383,
//                 0.924, 0.0, 0.383,
//                 0.924, 0.0, 0.383,
//                 0.924, 0.0, 0.383,
                
//                 // second side
//                 0.383, 0.0, 0.924,
//                 0.383, 0.0, 0.924,
//                 0.383, 0.0, 0.924,
//                 0.383, 0.0, 0.924,
//                 0.383, 0.0, 0.924,
//                 0.383, 0.0, 0.924,        
                
//                 // third side
//                 -0.383, 0.0, 0.924,
//                 -0.383, 0.0, 0.924,
//                 -0.383, 0.0, 0.924,
//                 -0.383, 0.0, 0.924,
//                 -0.383, 0.0, 0.924,
//                 -0.383, 0.0, 0.924,

//                 // fourth side
//                 -0.924, 0.0, 0.383,
//                 -0.924, 0.0, 0.383,
//                 -0.924, 0.0, 0.383,
//                 -0.924, 0.0, 0.383,
//                 -0.924, 0.0, 0.383,
//                 -0.924, 0.0, 0.383,

//                 // fifth side
//                 -0.924, 0.0, -0.383,
//                 -0.924, 0.0, -0.383,
//                 -0.924, 0.0, -0.383,
//                 -0.924, 0.0, -0.383,
//                 -0.924, 0.0, -0.383,
//                 -0.924, 0.0, -0.383,

//                 // sixth side
//                 -0.383, 0.0, -0.924,
//                 -0.383, 0.0, -0.924,
//                 -0.383, 0.0, -0.924,
//                 -0.383, 0.0, -0.924,
//                 -0.383, 0.0, -0.924,
//                 -0.383, 0.0, -0.924,

//                 // seventh side
//                 0.383, 0.0, -0.924,
//                 0.383, 0.0, -0.924,
//                 0.383, 0.0, -0.924,
//                 0.383, 0.0, -0.924,
//                 0.383, 0.0, -0.924,
//                 0.383, 0.0, -0.924,

//                 // eigth side        
//                 0.924, 0.0, -0.383,
//                 0.924, 0.0, -0.383,
//                 0.924, 0.0, -0.383,
//                 0.924, 0.0, -0.383,
//                 0.924, 0.0, -0.383,
//                 0.924, 0.0, -0.383,

//                 // top octagon
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
//                 0.0, 1.0, 0.0,
                
//                 // bottom octagon
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//                 0.0, -1.0, 0.0,
//         ]
//     }
// }

export function generateColumn(precision, radius, height, centerHeight = false) {

    let data = {
        vertices: [],
        normals: []
    }
    let b0 = vec3.fromValues(radius, 0 - (centerHeight * height / 2), 0)
    let t0 = vec3.fromValues(radius, height  - (centerHeight * height / 2), 0)

    let rot = mat4.create()
    mat4.rotateY(rot, rot, Math.PI * 2 / precision)

    let b = [], t = []

    // generate all necessary vertices
    for (let i = 0; i < precision; i++) {
        b.push(vec3.clone(b0))
        t.push(vec3.clone(t0))

        vec3.transformMat4(b0, b0, rot)
        vec3.transformMat4(t0, t0, rot)
    }

    // sides of the column
    for (let i = 0; i < precision; i++) {
        let j = (i + 1) % precision
        data.vertices.push(...b[i], ...b[j], ...t[i], ...t[i], ...b[j], ...t[j])

        let v1 = vec3.create()
        let v2 = vec3.create()
        let cross = vec3.create()

        vec3.subtract(v1, b[j], b[i])
        vec3.subtract(v2, t[i], b[i])
        vec3.cross(cross, v1, v2)
        vec3.normalize(cross, cross)

        data.normals.push(...cross, ...cross, ...cross, ...cross, ...cross, ...cross)
    }

    // top and bottom of the column
    let upN = vec3.fromValues(0, 1, 0)
    let downN = vec3.fromValues(0, -1, 0)
    for (let i = 0; i < precision - 2; i++) {

        data.vertices.push(...b[0], ...b[i+1], ...b[i+2])
        data.vertices.push(...t[0], ...t[i+1], ...t[i+2])
        data.normals.push(...downN, ...downN, ...downN)
        data.normals.push(...upN, ...upN, ...upN)
    }


    return data;

}

export function generateSphere(precision, radius) {

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

            if (i == 0) {
                data.vertices.push( ...v01, ...v10, ...v11)
            } else if (i + 1 == precision) {
                data.vertices.push(...v00, ...v01, ...v10)
            } else {
                data.vertices.push(...v00, ...v01, ...v10, ...v01, ...v10, ...v11)
            }

            // calculate the normal vectors
            let vx = vec3.create()
            let vy = vec3.create()
            let cross = vec3.create()

            if (i+1 == precision) {
                vec3.subtract(vx, v10, v00)
            } else {
                vec3.subtract(vx, v11, v01)
            }
            vec3.subtract(vy, v00, v01)

            vec3.cross(cross, vx, vy)
            vec3.normalize(cross, cross)

            if (i == 0) {
                data.normals.push(...cross, ...cross, ...cross)
            } else if (i + 1 == precision) {
                data.normals.push(...cross, ...cross, ...cross)
            } else {
                data.normals.push(...cross, ...cross, ...cross, ...cross, ...cross, ...cross)
            }

            // rotate the vectors
            vec3.transformMat4(v00, v00, yRot)
            vec3.transformMat4(v01, v01, yRot)
            vec3.transformMat4(v10, v10, yRot)
            vec3.transformMat4(v11, v11, yRot)
        }

        // rotate the starting vector to generate new layer
        vec3.transformMat4(top, top, xRot)
    }

    return data;
}

export function generateGrass(plotSize) {

    let data = {
        vertices: [],
        normals: [],
        colors: [],
        rotationOffsets: [],
    }

    function generateBlade(spawnX, spawnZ) {
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

    for (let i = 0; i < 300; i++) {
        let blade = generateBlade((4 * Math.random()) - 2, (4 * Math.random()) - 2)

        data.vertices.push(...blade.triangle)
        data.colors.push(...blade.color)
        data.normals.push(...blade.normals)
    }

    for (let i = 0; i < plotSize * plotSize; i++) {
        data.rotationOffsets.push(Math.floor(Math.random() * 4))
    }

    return data;
}

export function generateFire(radius) {

    let data = {
        vertices: [],
        normals: [],
        colors: [],
    }

    function generateFlame(radius, dist, theta) {
        let x1, x2, x3, z1, z2, z3, y3, r, g, b        


        x1 = radius * dist * Math.cos(rad(theta + 15))
        z1 = radius * dist * Math.sin(rad(theta + 15))

        x2 = radius * dist * Math.cos(rad(theta - 15))
        z2 = radius * dist * Math.sin(rad(theta - 15))
    

        x3 = ((x1 + x2) / 2) * dist
        y3 = 3 - 2 * dist
        z3 = ((z1 + z2) / 2) * dist

        // r = 0.2 + (Math.random() * 0.03)
        // g = 0.4 + (Math.random() * 0.2)
        // b = 0.1 + (Math.random() * 0.2)
        r = 1.0 - (Math.random() * 0.2)
        

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
            // color: [
            //     r, r, r,
            //     r, r, r,
            //     r, r, r,
            // ],        
        }
    }


    for (let i = 0; i < 50; i++) {
        let theta = Math.floor(Math.random() * 360)
        let dist = Math.random()

        let flame = generateFlame(radius, dist, theta)

        data.vertices.push(...flame.triangle)
        data.normals.push(...flame.normals)
    }

    return data;
}