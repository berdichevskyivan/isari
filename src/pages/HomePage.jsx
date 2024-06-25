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

      <div className="homepage-main-container">
        <div className="homepage-info-container">

          <h1 style={{ margin: 0 }}>Why we exist</h1>
          <p style={{ fontFamily: 'Roboto' }}>
           To leverage the power of AI to address economic challenges and foster collaboration, overcoming the impacts of conflict and self-interest.
           We propose using open-source models to solve current problems collaboratively, bringing together humans and AI agents transparently.
          </p>

          <h1 style={{ margin: 0 }}>What are you looking at</h1>
          <p style={{ fontFamily: 'Roboto' }}>
          We propose an architecture where a centralized database acts as the gateway for the inputs and outputs of the workers' open-source models,
           which are run and trained in a decentralized manner, along with the possibility of using hyperparameters outputted by the central database.
           The 3D animation you see is a visual representation of this architecture. While it's not an exact depiction, it serves as a way to exemplify the concept.
          </p>

          <h1 style={{ margin: 0 }}>What do we offer</h1>
          <p style={{ fontFamily: 'Roboto' }}>
          We offer a collaborative environment where you can access learning resources, ranging from the basics of AI to the most advanced concepts.
           The database information will be available for download, and the workers who are part of the platform's network will be visible, allowing them to make their services public. The workers contribute to the central database by running models on their local computers and sharing the output.
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
