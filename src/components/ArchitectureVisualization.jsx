import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import * as THREE from 'three';

const colors = ['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF'];

const Cube = React.forwardRef(({ position, rotation }, ref) => {
  useEffect(() => {
    console.log(' here!!!');
    if (ref.current) {
      ref.current.position.set(...position);
      ref.current.rotation.set(...rotation);
    }
  }, [position, rotation]);

  return (
    <mesh ref={ref}>
      <boxGeometry args={[0.9, 0.9, 0.9]} />
      {colors.map((color, index) => (
        <meshBasicMaterial key={index} attach={`material-${index}`} color={color} />
      ))}
    </mesh>
  );
});

const CubeGrid = () => {
    const size = 9;
    const center = (size - 1) / 2;
  
    const [active, setActive] = useState(true);
    const [sliceIndex, setSliceIndex] = useState(Math.floor(Math.random() * 9)); // Initial random value between 0 and 8
    const [mainAxis, setMainAxis] = useState(['x', 'y', 'z'][Math.floor(Math.random() * 3)]); // Initial random value among x, y, z
  
    const cubesRef = useRef(
      Array.from({ length: size * size * size }, (_, i) => {
        const x = (i % size) - center;
        const y = Math.floor(i / size) % size - center;
        const z = Math.floor(i / (size * size)) - center;
    
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
      const speed = 5; // Seconds per full rotation
      const angle = (elapsedTime / speed) * 2 * Math.PI; // Ensure it completes a full rotation in 'speed' seconds
  
      cubesRef.current.forEach((cube) => {
        const { position, rotation, ref } = cube;
        const cubePosition = new THREE.Vector3(...position);
  
        let isCenterSlice = false;
        let rotationAxis = new THREE.Vector3(0, 0, 1); // Default to z-axis
        let newRotation = [rotation[0], rotation[1], rotation[2] + angle]; // Default to z-axis rotation
  
        if (mainAxis === 'x') {
          isCenterSlice = Math.round(cubePosition.x) === sliceIndex - center;
          rotationAxis = new THREE.Vector3(1, 0, 0);
          newRotation = [rotation[0] + angle, rotation[1], rotation[2]];
        } else if (mainAxis === 'y') {
          isCenterSlice = Math.round(cubePosition.y) === sliceIndex - center;
          rotationAxis = new THREE.Vector3(0, 1, 0);
          newRotation = [rotation[0], rotation[1] + angle, rotation[2]];
        } else if (mainAxis === 'z') {
          isCenterSlice = Math.round(cubePosition.z) === sliceIndex - center;
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
      <pointLight position={[10, 10, 10]} />
      <CubeGrid />
      <OrbitControls />
      <axesHelper args={[15]} />
      <gridHelper />
      <Stats />
    </Canvas>
  );
};

export default ArchitectureVisualization;
