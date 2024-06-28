import React, { useState, useEffect } from 'react';
import '../App.css';
import ControlsDashboard from '../components/ControlsDashboard';
import StarrySky from '../components/StarrySky';
import ArchitectureVisualization from '../components/ArchitectureVisualization';
import Loading from '../components/Loading';

const isProduction = import.meta.env.MODE === 'production';

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

      <div className="homepage-main-container">
        <div className="homepage-info-container">

          <h1 style={{ margin: 0 }}>Why we exist</h1>
          <p style={{ fontFamily: 'Roboto' }}>
            To solve problems with AI.
          </p>

          <h1 style={{ margin: 0 }}>What are you looking at</h1>
          <p style={{ fontFamily: 'Roboto' }}>
            A visual representation of the models receiving their inputs and sending their outputs to a central database.
          </p>

          <h1 style={{ margin: 0 }}>What do we offer</h1>
          <p style={{ fontFamily: 'Roboto' }}>
            The gathered and refined data from the database, a learning space for everybody on the platform, and visibility for the users (workers), every which of whom has embraced the power of AI and its impact on society.
          </p>
        </div>
        <div className="homepage-visualization-container">
          <ArchitectureVisualization />
        </div>
      </div>

      <ControlsDashboard workerOptions={workerOptions} setWorkers={setWorkers} workers={workers}/>
    </div>
  );
}

export default HomePage;
