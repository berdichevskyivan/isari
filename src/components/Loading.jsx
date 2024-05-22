import React from 'react';
import { useGlitch } from 'react-powerglitch';

const Loading = () => {
  const glitch = useGlitch({
    createContainers: true,
    playMode: 'always', // 'always', 'hover', or 'click'
    hideOverflow: true,
    timing: {
      duration: 2000,
      iterations: Infinity,
    },
    glitchTimeSpan: {
      start: 0.1,
      end: 0.3
    },
    shake: {
      velocity: 15,
      amplitudeX: 0.2,
      amplitudeY: 0
    },
    slice: {
      count: 6,
      velocity: 15,
      minHeight: 0.02,
      maxHeight: 0.15,
      hueRotate: false // Set to false to keep the same colors
    },
    pulse: false
  });

  return (
    <div style={{ 
        backgroundColor: 'black',
        flexFlow: 'column',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexFlow: 'column',
      }} ref={glitch.ref}>
        <img src="/isari-logo.png" alt="Isari AI Logo" style={{ width: 300, height: 300, marginRight: '.5rem' }}  />
        <h1 style={{ color: '#00B2AA', fontFamily: 'Orbitron' }}>Loading...</h1>
      </div>
    </div>
  );
}

export default Loading;
