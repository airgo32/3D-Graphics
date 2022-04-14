precision mediump float;

// const vec3 lightDirection = normalize(vec3(0.0, 1.0, 0.0));

attribute vec3 position;
attribute vec3 normalVector;

uniform mat4 pTransform;
uniform mat4 mvTransform;
uniform mat4 nTransform;
uniform mat4 lightTransform;
uniform vec3 uColor;

varying vec3 vColor;

void main(void) {

    vec3 lightPos = vec3(-10.0, 0.0, 0.0);

    lightPos = (lightTransform *  vec4(lightPos, 1.0)).xyz;
    // lightPos += vec3(0.0, 0.0, -20);




    vec3 pos = (mvTransform  * vec4(position, 1.0)).xyz;

    vec3 lightDirection = normalize(lightPos - pos);

    vec3 normal = normalize((nTransform * vec4(normalVector, 1.0)).xyz);

    float dp = max(0.0, dot(normal, lightDirection));

    vec3 diffuse = uColor * dp * 0.6;
    vec3 ambient = uColor * 0.4;
    vColor = ambient + diffuse;

    gl_Position = pTransform * mvTransform  * vec4(position, 1.0);
}