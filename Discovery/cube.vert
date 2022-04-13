const vec3 lightDirection = normalize(vec3(0.0, 2.0, 1.0));

attribute vec3 position;
attribute vec3 normal;

uniform mat4 pTransform;
uniform mat4 mvTransform;
uniform mat4 normalMatrix;

varying vec3 vColor;

void main(void) {

  vec3 color = vec3(1, 1, 1);

  // worldNormal stores the direction that the normal vector is currently facing
  vec3 worldNormal = normalize(normalMatrix * vec4(normal, 1.0)).xyz;

  // dot product of worldNormal and lightDirection returns the angle between
  // the two vectors (assuming they are both normalized)
  float nDotL = max(0.0, dot(worldNormal, lightDirection));

  vec3 ambient = 0.0 * color;
  vec3 diffuse = 1.0 * color * nDotL;
  
  vColor = ambient + diffuse;
  gl_Position = vec4(position, 1.0) * mvTransform * pTransform;
}