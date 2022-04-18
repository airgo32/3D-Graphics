precision mediump float;

const float bands = 8.0;
const int numLights = 1;

uniform vec3 uColor;
uniform vec3 lightPositions[numLights];
uniform vec3 lightColors[numLights];
uniform mat4 lightTransform;

varying vec3 vPosition;
varying vec3 vLightPos;
varying vec3 vNormal;

vec3 maxLight(vec3 a, vec3 b) {
    float x = max(a.x, b.x);
    float y = max(a.y, b.y);
    float z = max(a.z, b.z);
    return vec3(x,y,z);
}

vec3 complement(vec3 c) {
    return vec3(1.0 - c.x, 1.0 - c.y, 1.0 - c.z);
}

void main(void) {
    vec3 brightness;

    for (int i = 0; i < numLights; i++) {

        vec3 lightPos = (lightTransform * vec4(lightPositions[i], 1.0)).xyz;

        float dist = distance(vPosition, lightPos);
        dist = 8.0 / dist;
        dist = max(2.0, dist) - 2.0;

        vec3 lightDirection = lightPos - vPosition;
        float dp = max(0.0, dot(normalize(lightDirection), normalize(vNormal)));

        vec3 finalColor = max(vec3(0.0, 0.0, 0.0), normalize(lightColors[i]) - complement(uColor));
        finalColor *= dp * dist * 0.6;
        // runescape light banding effect
        // finalColor = floor(finalColor * bands) / bands;


        // brightness = maxLight(brightness, final);
        brightness += finalColor;
    }
    // brightness += uColor;
    vec3 ambient = uColor * 0.2;
    vec3 color = brightness + ambient;

    gl_FragColor = vec4(color, 1.0);
}