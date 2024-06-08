import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { OrbitControls, Stats, Html } from '@react-three/drei';
import * as THREE from 'three';

extend({ NeonGlowMaterial: THREE.ShaderMaterial });

// Cubic spline interpolation function
function cubicSplineInterpolation(points) {
  const n = points.length - 1;
  const a = points.map(p => p[1]);
  const b = new Array(n).fill(0);
  const d = new Array(n).fill(0);
  const h = points.slice(1).map((p, i) => p[0] - points[i][0]);

  const alpha = new Array(n).fill(0).map((_, i) =>
    i === 0 ? 0 : (3 / h[i] * (a[i + 1] - a[i])) - (3 / h[i - 1] * (a[i] - a[i - 1]))
  );

  const l = new Array(n + 1).fill(1);
  const mu = new Array(n).fill(0);
  const z = new Array(n + 1).fill(0);

  for (let i = 1; i < n; i++) {
    l[i] = 2 * (points[i + 1][0] - points[i - 1][0]) - h[i - 1] * mu[i - 1];
    mu[i] = h[i] / l[i];
    z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];
  }

  const c = new Array(n + 1).fill(0);
  const bCoeff = new Array(n).fill(0);
  const dCoeff = new Array(n).fill(0);

  for (let j = n - 1; j >= 0; j--) {
    c[j] = z[j] - mu[j] * c[j + 1];
    bCoeff[j] = (a[j + 1] - a[j]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
    dCoeff[j] = (c[j + 1] - c[j]) / (3 * h[j]);
  }

  const splines = [];
  for (let i = 0; i < n; i++) {
    splines.push({
      a: a[i],
      b: bCoeff[i],
      c: c[i],
      d: dCoeff[i],
      x: points[i][0]
    });
  }

  return splines;
}

function getSplinePoints(splines, steps = 100) {
  const points = [];
  for (let i = 0; i < splines.length; i++) {
    const spline = splines[i];
    for (let j = 0; j <= steps; j++) {
      const t = j / steps;
      const x = spline.x + t * (splines[i + 1]?.x - spline.x);
      const y = spline.a + spline.b * t + spline.c * t ** 2 + spline.d * t ** 3;
      points.push([x, y]);
    }
  }
  return points;
}

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform float time;
  uniform vec3 color;
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    float wave = sin(vPosition.x * 10.0 + time * 5.0) * 0.25 + 0.75;
    gl_FragColor = vec4(color * wave, 1.0);
  }
`;

function Trail({ positions }) {
  const lineRef = useRef();

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0x00B3AA) } // Single color (Turquoise)
    },
    vertexShader,
    fragmentShader,
    depthTest: true,
    transparent: true
  }), []);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(
      positions.map(p => new THREE.Vector3(...p))
    );
    return geometry;
  }, [positions]);

  useFrame(({ clock }) => {
    if (material) {
      material.uniforms.time.value = clock.getElapsedTime();
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry attach="geometry" {...lineGeometry} />
      <shaderMaterial attach="material" {...material} />
    </line>
  );
}

function TSNEPoints({ positions, predictedTokens }) {
  return (
    <>
      {positions.map((p, i) => (
        <mesh key={i} position={new THREE.Vector3(...p)}>
          <sphereGeometry args={[0.2, 32, 32]} />
          <meshBasicMaterial color='#e100ff'/>
          <Html distanceFactor={10}>
            <div style={{ color: 'white', fontSize: '12px', whiteSpace: 'nowrap', fontFamily: 'Orbitron' }}>
              {predictedTokens[i]}
            </div>
          </Html>
        </mesh>
      ))}
    </>
  );
}

function TSNEVisualization({ TSNEData, predictedTokens }) {
  const parentRef = useRef(null);
  const [trail, setTrail] = useState([[0, 0, 0]]);
  const [allData, setAllData] = useState([]);
  const [accumulatedPoints, setAccumulatedPoints] = useState([]);

  useEffect(() => {
    const scaledTSNEData = TSNEData.map(point => [
      point.x / 20,
      point.y / 20,
      point.z / 20
    ]);

    setAllData(prevData => [...prevData, ...scaledTSNEData]);
    setAccumulatedPoints(prevPoints => [...prevPoints, ...scaledTSNEData]);

    if (TSNEData.length === 0) {
      setTrail([[0, 0, 0]]);
      setAllData([]);
      setAccumulatedPoints([]);
    }
  }, [TSNEData]);

  useEffect(() => {
    if (allData.length > 1) {
      const xPoints = allData.map((point, index) => [index, point[0]]);
      const yPoints = allData.map((point, index) => [index, point[1]]);
      const zPoints = allData.map((point, index) => [index, point[2]]);
      
      const xSplines = cubicSplineInterpolation(xPoints);
      const ySplines = cubicSplineInterpolation(yPoints);
      const zSplines = cubicSplineInterpolation(zPoints);

      const xInterp = getSplinePoints(xSplines);
      const yInterp = getSplinePoints(ySplines);
      const zInterp = getSplinePoints(zSplines);

      const interpolatedPoints = xInterp.map((_, i) => [xInterp[i][1], yInterp[i][1], zInterp[i][1]]);

      setTrail(interpolatedPoints);
    }
  }, [allData]);

  return (
    <div ref={parentRef} className="lorenz-visualization" style={{ position: 'relative' }}>
      <Canvas camera={{ position: [1, 2, 3] }}>
        <Trail positions={trail} />
        <TSNEPoints positions={accumulatedPoints} predictedTokens={predictedTokens} />
        <OrbitControls />
        <axesHelper args={[5]} />
        <gridHelper />
        <Stats className='customStats' parent={parentRef} />
      </Canvas>
    </div>
  );
}

export default TSNEVisualization;
