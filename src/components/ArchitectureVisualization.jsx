import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Stats, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import vertexShader from './shaders/vertexShader.glsl?raw';
import fragmentShader from './shaders/fragmentShader.glsl?raw';

const SurroundingSpheres = () => {
  const positions = [
    [0, 30, 0],  // Top
    [0, -30, 0], // Bottom
    [-30, 0, 0], // Left
    [30, 0, 0],  // Right
    [0, 0, 30],  // Front
    [0, 0, -30]  // Back
  ];

  return (
    <>
      {positions.map((pos, index) => (
        <mesh key={index} position={pos}>
          <sphereGeometry args={[5, 64, 64]} />
          <meshPhysicalMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.3} 
              roughness={1} 
              metalness={0.1} 
              clearcoat={1} 
              clearcoatRoughness={0} 
              envMap={null}
          />
        </mesh>
      ))}
    </>
  );
};

// Define a basic custom shader material
const GradientMaterial = shaderMaterial(
  { u_time: 0 },
  vertexShader,
  fragmentShader
);

extend({ GradientMaterial });

const Cube = React.forwardRef(({ position, rotation }, ref) => {
  useEffect(() => {
    if (ref.current) {
      ref.current.position.set(...position);
      ref.current.rotation.set(...rotation);
    }
  }, [position, rotation]);

  // Create a reference for the material to update time uniform
  const materialRef = useRef();
  const time = useRef(0);

  useFrame(() => {
    if (materialRef.current) {
      time.current += 0.01; // Adjust the increment value as needed
      materialRef.current.uniforms.u_time.value = time.current;
    }
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      <meshStandardMaterial color="#000000" />
      <lineSegments>
        <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(0.9, 0.9, 0.9)]} />
        <gradientMaterial ref={materialRef} attach="material" />
      </lineSegments>
    </mesh>
  );
});

const CubeGrid = () => {
    const size = 9;
    const center = (size - 1) / 2;
    const spacing = 1.2; // Adjust this value to increase/decrease spacing between cubes

    const [active, setActive] = useState(true);
    const [sliceIndex, setSliceIndex] = useState(Math.floor(Math.random() * 9)); // Initial random value between 0 and 8
    const [mainAxis, setMainAxis] = useState(['x', 'y', 'z'][Math.floor(Math.random() * 3)]); // Initial random value among x, y, z
  
    const cubesRef = useRef(
      Array.from({ length: size * size * size }, (_, i) => {
        const x = ((i % size) - center) * spacing;
        const y = (Math.floor(i / size) % size - center) * spacing;
        const z = (Math.floor(i / (size * size)) - center) * spacing;
    
        return {
          id: i,
          position: [x, y, z],
          rotation: [0, 0, 0],
          ref: React.createRef(),
        };
      })
    );
  
    useFrame(({ clock }) => {
      if (!active) return;
      const elapsedTime = clock.getElapsedTime();
      const speed = 2; // Seconds per full rotation
      const angle = (elapsedTime / speed) * 2 * Math.PI; // Ensure it completes a full rotation in 'speed' seconds
  
      cubesRef.current.forEach((cube) => {
        const { position, rotation, ref } = cube;
        const cubePosition = new THREE.Vector3(...position);
  
        let isCenterSlice = false;
        let rotationAxis = new THREE.Vector3(0, 0, 1); // Default to z-axis
        let newRotation = [rotation[0], rotation[1], rotation[2] + angle]; // Default to z-axis rotation
  
        if (mainAxis === 'x') {
          isCenterSlice = Math.round(cubePosition.x / spacing) === sliceIndex - center;
          rotationAxis = new THREE.Vector3(1, 0, 0);
          newRotation = [rotation[0] + angle, rotation[1], rotation[2]];
        } else if (mainAxis === 'y') {
          isCenterSlice = Math.round(cubePosition.y / spacing) === sliceIndex - center;
          rotationAxis = new THREE.Vector3(0, 1, 0);
          newRotation = [rotation[0], rotation[1] + angle, rotation[2]];
        } else if (mainAxis === 'z') {
          isCenterSlice = Math.round(cubePosition.z / spacing) === sliceIndex - center;
          rotationAxis = new THREE.Vector3(0, 0, 1);
          newRotation = [rotation[0], rotation[1], rotation[2] + angle];
        }
  
        if (isCenterSlice) {
          const rotatedPosition = cubePosition.applyAxisAngle(rotationAxis, angle);
          if (ref.current) {
            ref.current.position.set(rotatedPosition.x, rotatedPosition.y, rotatedPosition.z);
            ref.current.rotation.set(...newRotation);
          }
        }
      });
  
      if (elapsedTime > speed) {
        // Set a new random sliceIndex and mainAxis
        let newSliceIndex = Math.floor(Math.random() * 9);
        while (newSliceIndex === sliceIndex) {
          newSliceIndex = Math.floor(Math.random() * 9); // Ensure it's different from the previous one
        }
  
        let newMainAxis = ['x', 'y', 'z'][Math.floor(Math.random() * 3)];
        while (newMainAxis === mainAxis) {
          newMainAxis = ['x', 'y', 'z'][Math.floor(Math.random() * 3)]; // Ensure it's different from the previous one
        }
  
        setSliceIndex(newSliceIndex);
        setMainAxis(newMainAxis);
        clock.start(); // Reset the clock for the next rotation
      }
    });
  
    return (
      <>
        {cubesRef.current.map((cube) => (
          <Cube key={cube.id} position={cube.position} rotation={cube.rotation} ref={cube.ref} />
        ))}
      </>
    );
  };

const ArchitectureVisualization = () => {
  return (
    <Canvas camera={{ position: [15, 15, 15], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[20, 20, 20]} intensity={0.5} />
      <mesh>
        <sphereGeometry args={[15, 64, 64]} />
        <meshPhysicalMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.3} 
            roughness={1} 
            metalness={0.1} 
            clearcoat={1} 
            clearcoatRoughness={0} 
            envMap={null} // Ensure environment mapping is disabled
        />
        <CubeGrid />
      </mesh>

      <SurroundingSpheres />
      
      <OrbitControls />
      {/* <axesHelper args={[15]} />
      <gridHelper /> */}
      <Stats />
    </Canvas>
  );
};

export default ArchitectureVisualization;
