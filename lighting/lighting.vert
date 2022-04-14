precision mediump float;

const vec3 lightDirection = normalize(vec3(0.0, 2.0, 2.0));

attribute vec3 position;
attribute vec3 normalVector;

uniform mat4 pTransform;
uniform mat4 mvTransform;
uniform mat4 nTransform;
uniform vec3 uColor;

varying vec3 vColor;

void main(void) {

    vec3 normal = normalize((nTransform * vec4(normalVector, 1.0)).xyz);

    float dp = max(0.0, dot(normal, lightDirection));

    vec3 diffuse = uColor * dp;
    vColor = diffuse;

    gl_Position = pTransform * mvTransform  * vec4(position, 1.0);
}