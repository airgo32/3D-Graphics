precision mediump float;

const float bands = 10.0;
const int numLights = 2;

const vec3 directionLightVec = normalize(vec3(5.0, 12.0, 5.0));
// (1.0, 0.4, 0.1)
// (0.1, 0.1, 0.4)
const vec3 directionLightCol = (vec3(1.0, 1.0, 1.0));

uniform bool b_lightBothSides;
uniform float lightStrengths[numLights];
uniform vec3 lightPositions[numLights];
uniform vec3 lightColors[numLights];
uniform mat4 lightTransform;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vBaseColor;

vec3 complement(vec3 c) {
    return vec3(1.0 - c.x, 1.0 - c.y, 1.0 - c.z);
}

void main(void) {
    vec3 brightness;

    for (int i = 0; i < numLights; i++) {

        vec3 lightPos = (lightTransform * vec4(lightPositions[i], 1.0)).xyz;

        float dist = distance(vPosition, lightPos);
        dist = lightStrengths[i] / dist;
        dist = max(lightStrengths[i] / 4.0, dist) - lightStrengths[i] / 4.0;

        vec3 lightDirection = lightPos - vPosition;
        float dp;

        if (b_lightBothSides) {
            dp = abs(dot(normalize(lightDirection), normalize(vNormal)));
        } else {
            dp = max(0.0, dot(normalize(lightDirection), normalize(vNormal)));
        }


        // vec3 finalColor = max(vec3(0.0, 0.0, 0.0), normalize(lightColors[i]) - (complement(vBaseColor)));
        vec3 finalColor = lightColors[i];
        finalColor *= dist * dp * 0.6;

        // runescape light banding effect
        // finalColor = floor(finalColor * bands) / bands;

        brightness += finalColor;
    }

    // directional light
    bool directionOn = false;
    if (directionOn) {
        float dp = max(0.0, dot(directionLightVec, normalize(vNormal)));
        vec3 finalColor = directionLightCol;
        finalColor *= dp;
        brightness += finalColor;

    }

    brightness = vBaseColor * brightness;
    vec3 ambient = vBaseColor * 0.1;

    vec3 color = brightness + ambient;

    gl_FragColor = vec4(color, 1.0);
}