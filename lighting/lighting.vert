precision mediump float;

attribute vec3 position;

uniform mat4 pTransform;
uniform mat4 mvTransform;
uniform mat4 nTransform;

void main(void) {

    gl_Position = pTransform * mvTransform  * vec4(position, 1.0);
    // multiply by pTransform once it's ready
}