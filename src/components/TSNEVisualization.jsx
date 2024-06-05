import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import * as THREE from 'three';

function Sphere({ position }) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      ref.current.position.set(position[0], position[1], position[2]);
    }
  }, [position]);

  return (
    <mesh
      ref={ref}
      geometry={new THREE.SphereGeometry(0.785398)}
    >
      <meshBasicMaterial color={'lime'} wireframe />
    </mesh>
  );
}

function Trail({ positions }) {
  const lineRef = useRef();

  useEffect(() => {
    if (lineRef.current) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(positions.map(p => new THREE.Vector3(...p)));
      lineRef.current.geometry = lineGeometry;
    }
  }, [positions]);

  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color={'lime'} />
    </line>
  );
}

function TSNEVisualization({ TSNEData }) {
  const parentRef = useRef(null);
  const [currentPosition, setCurrentPosition] = useState([0, 0, 0]);
  const [trail, setTrail] = useState([[0, 0, 0]]);
  const [allData, setAllData] = useState([]);
  const animationRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (parentRef.current) {
      console.log('Parent element:', parentRef.current);
    }
  }, []);

  useEffect(() => {
    const scaledTSNEData = TSNEData.map(point => ({
      x: point.x / 20,
      y: point.y / 20,
      z: point.z / 20
    }));
    
    setAllData(prevData => [...prevData, ...scaledTSNEData]);

    if(TSNEData.length === 0){
        setCurrentPosition([0,0,0])
        setTrail([[0,0,0]])
    }

  }, [TSNEData]);

  useEffect(() => {
    if (allData.length > 0) {
      const animate = () => {
        if (indexRef.current < allData.length) {
          const { x, y, z } = allData[indexRef.current];
          setCurrentPosition([x, y, z]);
          setTrail(prevTrail => [...prevTrail, [x, y, z]]);
          indexRef.current += 1;
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      animate();
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [allData]);

  return (
    <div ref={parentRef} className="lorenz-visualization" style={{ position: 'relative' }}>
      <Canvas camera={{ position: [1, 2, 3] }}>
        <Sphere position={currentPosition} />
        <Trail positions={trail} />
        <OrbitControls />
        <axesHelper args={[5]} />
        <gridHelper />
        <Stats className='customStats' parent={parentRef} />
      </Canvas>
    </div>
  );
}

export default TSNEVisualization;
