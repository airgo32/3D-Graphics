attribute vec3 position;
uniform mat4 transform;

void main(void) {
  gl_Position = vec4(position, 1.0) * transform;
}