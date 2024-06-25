uniform float u_time;
uniform float u_speed;
uniform vec3 u_color;
varying vec2 vUv;

void main() {
  float flow = mod(vUv.y - u_time * u_speed, 1.0); // Cycle through the flow values
  float smoothFlow = smoothstep(0.0, 1.0, flow); // Smooth interpolation
  vec3 color = mix(vec3(0.0), u_color, smoothFlow); // Smoothly interpolate between black and u_color
  gl_FragColor = vec4(color, 1.0);
}
