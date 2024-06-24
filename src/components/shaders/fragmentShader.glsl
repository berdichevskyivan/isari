uniform float u_time;
varying vec2 vUv;

// Function to convert HSL to RGB
vec3 hslToRgb(float h) {
  float r = abs(h * 6.0 - 3.0) - 1.0;
  float g = 2.0 - abs(h * 6.0 - 2.0);
  float b = 2.0 - abs(h * 6.0 - 4.0);
  return clamp(vec3(r, g, b), 0.0, 1.0);
}

void main() {
  float hue = mod(u_time * 0.1 + vUv.x + vUv.y, 1.0); // Cycle through hue values
  vec3 color = hslToRgb(hue); // Convert hue to RGB

  gl_FragColor = vec4(color, 1.0);
}
