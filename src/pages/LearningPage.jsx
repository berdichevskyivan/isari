import React, { useState, useEffect } from 'react';
import '../App.css';
import ControlsDashboard from '../components/ControlsDashboard';
import StarrySky from '../components/StarrySky';
import Loading from '../components/Loading';

const isProduction = import.meta.env.MODE === 'production';

function LearningPage({ workers, workerOptions, setWorkers }) {

  // Add later but on another condition
  // if (!workerOptions) {
  //   return <Loading />;
  // }

  return (
    <div style={{
        height: '100vh',
        width: '100%',
        overflow: 'auto',  // Allow overflow while hiding scrollbars
        '::WebkitScrollbar': { display: 'none' },
        msOverflowStyle: 'none',  // for Internet Explorer and Edge
        scrollbarWidth: 'none',  // for Firefox
        background: 'black'
    }}>
      <StarrySky />
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        zIndex: 2,
      }}>
        <h1 style={{ fontFamily: 'Orbitron', color: 'turquoise', zIndex: 2, padding: '1rem', border: '2px solid turquoise', borderRadius: '14px' }}>In construction</h1>
      </div>
      <ControlsDashboard workerOptions={workerOptions} setWorkers={setWorkers} workers={workers}/>
    </div>
  );
}

export default LearningPage;
