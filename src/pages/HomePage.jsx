import React, { useState, useEffect } from 'react';
import '../App.css';
import ControlsDashboard from '../components/ControlsDashboard';
import StarrySky from '../components/StarrySky';
import ArchitectureVisualization from '../components/ArchitectureVisualization';
import Loading from '../components/Loading';

const isProduction = import.meta.env.NODE_ENV === 'production';

function HomePage({ workers, workerOptions, setWorkers }) {

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

      <ArchitectureVisualization />

      <ControlsDashboard workerOptions={workerOptions} setWorkers={setWorkers} workers={workers}/>
    </div>
  );
}

export default HomePage;
