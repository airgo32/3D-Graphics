precision mediump float;

const float bands = 4.0;
const int numLights = 2;

const vec3 directionLightVec = normalize(vec3(5.0, 12.0, 5.0));

// 0 - Nighttime
// 1 - Early Morning
// 2 - Midday
// 3 - Evening

uniform bool options[4];
uniform float lightStrengths[numLights];
uniform vec3 lightPositions[numLights];
uniform vec3 lightColors[numLights];
uniform mat4 lightTransform;

uniform int startTime;
uniform float lerp;
uniform vec3 dirLightCols[4];
uniform vec3 ambientCols[4];
uniform vec3 ambientStrs[4];

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vBaseColor;

vec3 complement(vec3 c) {
    return vec3(1.0 - c.x, 1.0 - c.y, 1.0 - c.z);
}

void main(void) {

    // determine light colors for different times of day
    vec3 dirLightCols[4];
    dirLightCols[0] = vec3(0.1, 0.1, 0.3);
    dirLightCols[1] = vec3(0.5, 0.3, 0.0);
    dirLightCols[2] = vec3(1.0, 0.9, 0.9);
    dirLightCols[3] = vec3(0.7, 0.5, 0.3);
    vec3 ambientCols[4];
    ambientCols[0] = vec3(0.0, 0.2, 0.5);
    ambientCols[1] = vec3(0.5, 0.2, 0.2);
    ambientCols[2] = vec3(0.9, 0.8, 0.8);
    ambientCols[3] = vec3(0.7, 0.4, 0.7);
    float ambientStrs[4];
    ambientStrs[0] = 0.3;
    ambientStrs[1] = 0.4;
    ambientStrs[2] = 0.6;
    ambientStrs[3] = 0.4;

    vec3 directionLightCol;
    vec3 ambientCol;
    float ambientStrength;

    if (startTime == 0) {
        directionLightCol = mix(dirLightCols[0], dirLightCols[1], lerp);
        ambientCol = mix(ambientCols[0], ambientCols[1], lerp);
        ambientStrength = mix(ambientStrs[0], ambientStrs[1], lerp);

    } else if (startTime == 1) {
        directionLightCol = mix(dirLightCols[1], dirLightCols[2], lerp);
        ambientCol = mix(ambientCols[1], ambientCols[2], lerp);
        ambientStrength = mix(ambientStrs[1], ambientStrs[2], lerp);

    } else if (startTime == 2) {
        directionLightCol = mix(dirLightCols[2], dirLightCols[3], lerp);
        ambientCol = mix(ambientCols[2], ambientCols[3], lerp);
        ambientStrength = mix(ambientStrs[2], ambientStrs[3], lerp);

    } else if (startTime == 3) {
        directionLightCol = mix(dirLightCols[3], dirLightCols[0], lerp);
        ambientCol = mix(ambientCols[3], ambientCols[0], lerp);
        ambientStrength = mix(ambientStrs[3], ambientStrs[0], lerp);
    }



    vec3 brightness;

    for (int i = 0; i < numLights; i++) {

        vec3 lightPos = (lightTransform * vec4(lightPositions[i], 1.0)).xyz;

        float dist = distance(vPosition, lightPos);
        dist = lightStrengths[i] / dist;
        dist = max(lightStrengths[i] / 4.0, dist) - lightStrengths[i] / 4.0;

        vec3 lightDirection = lightPos - vPosition;
        float dp;

        if (options[1]) {
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
    float dp = max(0.0, dot(directionLightVec, normalize(vNormal)));
    vec3 finalColor = directionLightCol;
    finalColor *= dp;
    brightness += finalColor;

    brightness = vBaseColor * brightness;
    vec3 ambient = vBaseColor * ambientCol * ambientStrength;

    vec3 color = brightness + ambient;

    gl_FragColor = vec4(color, 1.0);
}