precision mediump float;

// const vec3 lightDirection = normalize(vec3(0.0, 1.0, 0.0));

attribute vec3 position;
attribute vec3 normalVector;

uniform mat4 pTransform;
uniform mat4 mvTransform;
uniform mat4 nTransform;
uniform mat4 lightTransform;
uniform vec3 uColor;

varying float vLighting;
varying vec3 vPosition;
varying vec3 vLightPos;
varying vec3 vNormal;

void main(void) {

    vec3 lightPos = vec3(-3.0, 0.0, 2.0);

    lightPos = (lightTransform * vec4(lightPos, 1.0)).xyz;
    // lightPos += vec3(20.0, 0.0, 0.0);

    vec3 pos = (mvTransform  * vec4(position, 1.0)).xyz;

    vec3 lightDirection = lightPos - pos;

    vec3 normal = (nTransform * vec4(normalVector, 1.0)).xyz;

    // float dp = max(0.0, dot(normalize(normal), normalize(lightDirection)));

    vPosition = pos;
    vLightPos = lightPos;
    vNormal = normal;

    gl_Position = pTransform * mvTransform  * vec4(position, 1.0);
}