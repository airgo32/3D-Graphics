// "uniform" means one (set of) value(s) shared by all fragment
// shader instances; "lowp vec3" means 3 low precision floating-point
// values.  "color" is the name JavaScript code will use to connect
// to this variable (and the name of the variable in the shader
// code below).
uniform lowp vec3 color;

void main(void) {
  // Basic task of fragment shader is to determine the color of the
  // fragment.  The way to set the color is to assign it to the
  // special variable gl_FragColor.  Because "color" has three
  // values, and gl_FragColor has four (last is for transparency),
  // we're adding a fourth here.
  gl_FragColor = vec4(color, 1.0);
}