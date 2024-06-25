import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Stats, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import vertexShader from './shaders/vertexShader.glsl?raw';
import fragmentShader from './shaders/fragmentShader.glsl?raw';
import tubeVertexShader from './shaders/tubeVertexShader.glsl?raw';
import tubeFragmentShader from './shaders/tubeFragmentShader.glsl?raw';
import octaVertexShader from './shaders/octaVertexShader.glsl?raw';
import octaFragmentShader from './shaders/octaFragmentShader.glsl?raw';

const distance = 25;
const sin45 = Math.sin(Math.PI / 4);

const positions = [
  [-distance * sin45, 0, distance * sin45], // Left-Front
  [distance * sin45, 0, distance * sin45],  // Right-Front
  [-distance * sin45, 0, -distance * sin45], // Left-Back
  [distance * sin45, 0, -distance * sin45],  // Right-Back
  [-distance, 0, 0],       // Left
  [distance, 0, 0],        // Right
  [0, 0, distance],        // Front
  [0, 0, -distance],       // Back
];

const mainSphereRadius = 11;
const satelliteSphereRadius = 4;
const octaHedronSize = 2.5;

const FlowShaderMaterial = shaderMaterial(
  { u_time: 0, u_color: new THREE.Color(0x00ffff), u_speed: 0.1 },
  tubeVertexShader,
  tubeFragmentShader
);

extend({ FlowShaderMaterial });

const OctaShaderMaterial = shaderMaterial(
  { u_time: 0 },
  octaVertexShader,
  octaFragmentShader,
  (material) => {
    material.lights = false;
  }
);

extend({ OctaShaderMaterial });

const CustomOctahedron = ({ position }) => {
  const materialRef = useRef();
  const groupRef = useRef();
  const time = useRef(0);

  useFrame((state, delta) => {
    if (materialRef.current) {
      time.current += 0.01; // Adjust the speed as necessary
      materialRef.current.uniforms.u_time.value = time.current;
    }
    if (groupRef.current) {
      // Rotate the group around the Y axis
      groupRef.current.rotation.y += delta * 3; // Adjust the 0.5 to change rotation speed
    }
  });

  const geometry = new THREE.OctahedronGeometry(octaHedronSize, 0);
  const vertices = geometry.attributes.position.array;
  const edges = new THREE.EdgesGeometry(geometry);

  const vertexToAlign = new THREE.Vector3(vertices[0], vertices[1], vertices[2]);
  const target = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(vertexToAlign.clone().normalize(), target);

  return (
    <group ref={groupRef} position={position} quaternion={quaternion}>
      <mesh>
        <octahedronGeometry args={[octaHedronSize, 0]} />
        <octaShaderMaterial ref={materialRef} lights={false}/>
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="black" />
      </lineSegments>
    </group>
  );
};

const SurroundingSpheres = () => {
  // Create a quaternion to align with the global Y-axis
  const alignQuaternion = new THREE.Quaternion();
  alignQuaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0);

  return (
    <>
      {positions.map((pos, index) => (
        <mesh key={index} position={pos} quaternion={alignQuaternion}>
          <sphereGeometry args={[satelliteSphereRadius, 64, 64]} />
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
          <CustomOctahedron />
        </mesh>
      ))}
    </>
  );
};

const ConnectingTubes = ({ speed = 0.5 }) => {

  return (
    <>
      {positions.map((pos, index) => {
        // Create a separate shader reference for each tube
        const shaderRef1 = useRef();
        const shaderRef2 = useRef();
        const time1 = useRef(0);
        const time2 = useRef(0);

        useFrame(() => {
          if (shaderRef1.current) {
            time1.current += 0.01; // Adjust the speed as necessary
            shaderRef1.current.uniforms.u_time.value = time1.current;
          }
          if (shaderRef2.current) {
            time2.current += 0.01; // Adjust the speed as necessary
            shaderRef2.current.uniforms.u_time.value = time2.current;
          }
        });

        // Calculate the vector from the main sphere to the satellite sphere
        const mainSphereCenter = new THREE.Vector3(0, 0, 0);
        const satelliteSphereCenter = new THREE.Vector3(...pos);
        const direction = new THREE.Vector3().subVectors(satelliteSphereCenter, mainSphereCenter);
        const totalLength = direction.length();
        const visibleLength = totalLength - (mainSphereRadius + satelliteSphereRadius);

        // Calculate the midpoint for the position of the cylinder
        const midpoint = new THREE.Vector3().addVectors(mainSphereCenter, direction.normalize().multiplyScalar(mainSphereRadius + visibleLength / 2));

        // Calculate the rotation for the cylinder to align with the direction
        const rotation = new THREE.Euler().setFromQuaternion(
          new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.normalize()
          )
        );

        const reverseDirection = direction.clone().negate();
        const reverseRotation = new THREE.Euler().setFromQuaternion(
          new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            reverseDirection.normalize()
          )
        );               
      
        let perpendicular;
        if (Math.abs(direction.y) > 0.9) {
          // For top and bottom, use the x-axis for perpendicular calculation
          perpendicular = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(1, 0, 0)).normalize().multiplyScalar(0.2);
        } else {
          // For other directions, use the y-axis
          perpendicular = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(0.2);
        }

        return (
          <>
            <mesh key={`${index}-1`} position={midpoint.clone().add(perpendicular)} rotation={rotation}>
              <cylinderGeometry args={[0.1, 0.1, visibleLength, 64]} />
              <flowShaderMaterial ref={shaderRef1} u_color={new THREE.Color(0.0, 1.0, 1.0)} u_speed={speed} />
            </mesh>
            <mesh key={`${index}-2`} position={midpoint.clone().sub(perpendicular)} rotation={reverseRotation}>
              <cylinderGeometry args={[0.1, 0.1, visibleLength, 64]} />
              <flowShaderMaterial ref={shaderRef2} u_color={new THREE.Color(1.0, 0.0, 1.0)} u_speed={speed} />
            </mesh>
          </>
        );
      })}
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
    const spacing = useRef(1.2); // Adjust this value to increase/decrease spacing between cubes
    const stepsTaken = useRef(0);
    const axes = ['x', 'y', 'z']
    const [active, setActive] = useState(true);
    const [sliceIndex, setSliceIndex] = useState(Math.floor(Math.random() * 9)); // Initial random value between 0 and 8
    const [mainAxis, setMainAxis] = useState(['x', 'y', 'z'][Math.floor(Math.random() * 3)]); // Initial random value among x, y, z
  
    const cubesRef = useRef(
      Array.from({ length: size * size * size }, (_, i) => {
        const x = ((i % size) - center) * spacing.current;
        const y = (Math.floor(i / size) % size - center) * spacing.current;
        const z = (Math.floor(i / (size * size)) - center) * spacing.current;
        const randomAxis = axes[Math.floor(Math.random() * axes.length)];
    
        return {
          id: i,
          position: [x, y, z],
          rotation: [0, 0, 0],
          ref: React.createRef(),
          randomAxis: randomAxis,
        };
      })
    );

    const speed = 2;
    const seconds = 4;
    const expansionFactor = 1.1;
  
    useFrame(({ clock }) => {
      if (!active) return;

      const elapsedTime = clock.getElapsedTime();

      if (stepsTaken.current === 4) {
        // First second of animation: Increase spacing
        if (elapsedTime <= 1) {
          cubesRef.current.forEach(cube => {
            const progress = elapsedTime; // Progress from 0 to 1
            const initialX = ((cube.id % size) - center) * spacing.current;
            const initialY = (Math.floor(cube.id / size) % size - center) * spacing.current;
            const initialZ = (Math.floor(cube.id / (size * size)) - center) * spacing.current;
            const x = initialX * (1 + progress * (expansionFactor - 1));
            const y = initialY * (1 + progress * (expansionFactor - 1));
            const z = initialZ * (1 + progress * (expansionFactor - 1));
            cube.position = [x, y, z];
            if (cube.ref.current) {
              cube.ref.current.position.set(x, y, z);
            }
          });
        }
      
        // Second and third seconds of animation: Rotate the cubes individually around z-axis
        if (elapsedTime > 1 && elapsedTime <= 3) {
          const angle = (elapsedTime - 1) * Math.PI; // Rotate over 2 seconds
          cubesRef.current.forEach(cube => {
            if (cube.ref.current) {
              if (cube.randomAxis === 'x') {
                cube.ref.current.rotation.set(angle, 0, 0);
              } else if (cube.randomAxis === 'y') {
                cube.ref.current.rotation.set(0, angle, 0);
              } else if (cube.randomAxis === 'z') {
                cube.ref.current.rotation.set(0, 0, angle);
              }
            }
          });
        }
      
        // Fourth second of animation: Return to original positions smoothly
        if (elapsedTime > 3 && elapsedTime <= 4) {
          const progress = (4 - elapsedTime); // Progress from 1 to 0
          cubesRef.current.forEach(cube => {
            const initialX = ((cube.id % size) - center) * spacing.current;
            const initialY = (Math.floor(cube.id / size) % size - center) * spacing.current;
            const initialZ = (Math.floor(cube.id / (size * size)) - center) * spacing.current;
            const x = initialX * (1 + progress * (expansionFactor - 1));
            const y = initialY * (1 + progress * (expansionFactor - 1));
            const z = initialZ * (1 + progress * (expansionFactor - 1));
            cube.position = [x, y, z];
            if (cube.ref.current) {
              cube.ref.current.position.set(x, y, z);
            }
          });
        }
      
        if (elapsedTime > seconds) {
          clock.start(); // Reset the clock for the next rotation
          stepsTaken.current = 0; // Steps are reset
        }
      } else {
        const angle = (elapsedTime / speed) * 2 * Math.PI; // Ensure it completes a full rotation in 'speed' seconds
    
        cubesRef.current.forEach((cube) => {
          const { position, rotation, ref } = cube;
          const cubePosition = new THREE.Vector3(...position);
    
          let isCenterSlice = false;
          let rotationAxis = new THREE.Vector3(0, 0, 1); // Default to z-axis
          let newRotation = [rotation[0], rotation[1], rotation[2] + angle]; // Default to z-axis rotation
    
          if (mainAxis === 'x') {
            isCenterSlice = Math.round(cubePosition.x / spacing.current) === sliceIndex - center;
            rotationAxis = new THREE.Vector3(1, 0, 0);
            newRotation = [rotation[0] + angle, rotation[1], rotation[2]];
          } else if (mainAxis === 'y') {
            isCenterSlice = Math.round(cubePosition.y / spacing.current) === sliceIndex - center;
            rotationAxis = new THREE.Vector3(0, 1, 0);
            newRotation = [rotation[0], rotation[1] + angle, rotation[2]];
          } else if (mainAxis === 'z') {
            isCenterSlice = Math.round(cubePosition.z / spacing.current) === sliceIndex - center;
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
  
          // A step was taken
          stepsTaken.current += 1;
        }
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

  const [cameraPosition, setCameraPosition] = useState([50, 50, 50]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
  
      if (width < 1415) {
        setCameraPosition([30, 30, 45]);
      } else {
        setCameraPosition([40, 40, 40]);
      }
    };
  
    handleResize();
  }, []);

  return (
    <Canvas camera={{ position: cameraPosition, fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[20, 20, 20]} intensity={0.5} />
      <mesh>
        <sphereGeometry args={[mainSphereRadius, 64, 64]} />
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
        <CubeGrid />
      </mesh>

      <SurroundingSpheres />
      <ConnectingTubes />
      
      <OrbitControls />
      {/* <axesHelper args={[15]} /> */}
      {/* <gridHelper /> */}
      {/* <Stats /> */}
    </Canvas>
  );
};

export default ArchitectureVisualization;
