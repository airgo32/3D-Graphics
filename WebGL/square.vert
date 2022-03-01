// "attribute" means a different (set of) value(s) for each vertex
// shader instance; "vec3" means 3 (floating-point) values per
// instance.  "position" is name JavaScript code will use to
// connect to this variable (and the name of the variable in the
// shader code below).
attribute vec3 position;

// uniform comes in from javascript code, should be same among all points
// attribute is unique to each vector in shader
uniform mat4 transform;

void main(void) {
  // Basic task of vertex shader is to determine position of the
  // vertex.  (There will be a vertex shader instance for each
  // "vertex worth" of data coming from the JavaScript code.)
  // The way to set the position of the vertex is to assign it
  // to the special variable gl_Position.  Because "position"
  // has three values, and gl_Position wants four (homogeneous
  // coordinates), we're adding a fourth here.
  gl_Position = vec4(position, 1.0) * transform;
}
