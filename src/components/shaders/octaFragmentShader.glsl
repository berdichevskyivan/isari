uniform float u_time;
varying vec3 vNormal;

void main() {
  // Use a smoothstep function for even distribution and smooth transition
  float t = smoothstep(-1.0, 1.0, sin(u_time * 0.50));
  
  // Define turquoise and bright neon purple colors
  vec3 turquoise = vec3(0.0, 1.0, 1.0);
  vec3 purple = vec3(0.8, 0.0, 1.0);  // Brighter, more neon-like purple
  
  // Interpolate between turquoise and purple
  vec3 color = mix(turquoise, purple, t);
  
  // Add a base glow to ensure no parts are completely dark
  float baseGlow = 0.6;
  
  // Calculate face lighting, but don't let it go below the base glow
  float faceLighting = max(dot(vNormal, vec3(0.0, 0.0, 1.0)), baseGlow);
  
  // Apply the face lighting to the color
  color *= faceLighting;
  
  // Add an overall emission to make it glow
  color += 0.3 * mix(turquoise, purple, t);  // Increased emission for more glow
  
  gl_FragColor = vec4(color, 1.0);
}