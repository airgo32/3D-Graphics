attribute vec3 position;
attribute vec3 normalVector;

uniform mat4 transform;
uniform mat4 normal;

void main(void) {
  gl_Position = vec4(position, 1.0) * transform;
}