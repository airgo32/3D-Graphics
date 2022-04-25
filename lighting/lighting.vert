precision mediump float;

// const vec3 lightDirection = normalize(vec3(0.0, 1.0, 0.0));

attribute vec3 position;
attribute vec3 normalVector;
attribute vec3 color;

uniform mat4 pTransform;
uniform mat4 mvTransform;
uniform mat4 nTransform;
uniform mat4 lightTransform;
uniform vec3 uColor;

uniform bool b_colorAttribute;

uniform float yOffset;

varying float vLighting;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vBaseColor;

void main(void) {

    vec3 lightPos = vec3(-3.0, 0.0, 2.0);

    lightPos = (lightTransform * vec4(lightPos, 1.0)).xyz;

    vec3 pos = (mvTransform * vec4(position, 1.0)).xyz;

    if (b_colorAttribute) { // only used for grass model

        pos.x += position.y * sin(pos.x + yOffset / 40.0) / 10.0;
        pos.z += position.y * sin(pos.z + yOffset / 10.0) / 10.0;

    }

    vec3 normal = (nTransform * vec4(normalVector, 1.0)).xyz;

    vPosition = (1.0 * vec4(pos, 1.0)).xyz;
    vNormal = normal;

    if (b_colorAttribute) {
        vBaseColor = color;
    } else {
        vBaseColor = uColor;
    }

    gl_Position = pTransform * 1.0 * vec4(pos, 1.0);
}