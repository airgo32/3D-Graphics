attribute vec3 position;
attribute vec3 normalVector;

uniform mat4 transform;
uniform mat4 normalMatrix;

varying highp vec3 vLighting;

void main(void) {

  gl_Position = vec4(position, 1.0) * transform;

  highp vec3 ambientLight = vec3(0.3, 0.3, 0.5);
  highp vec3 directionalLightColor = vec3(1, 1, 1);
  highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

  highp vec4 transformedNormal = normalMatrix * vec4(normalVector, 0);

  highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
  vLighting = ambientLight + (directionalLightColor * directional);

}