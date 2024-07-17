import React, { useState, useEffect } from 'react';
import '../App.css';
import ControlsDashboard from '../components/ControlsDashboard';
import StarrySky from '../components/StarrySky';
import ArchitectureVisualization from '../components/ArchitectureVisualization';
import { Typography, Box, Button } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CycloneIcon from '@mui/icons-material/Cyclone';
import BackupIcon from '@mui/icons-material/Backup';
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
          <h1 style={{ margin: 0 }}>Centralized Task Management and Distributed Processing</h1>
          <p style={{ fontFamily: 'Roboto' }}>
            In the architecture we propose, tasks are generated and managed by the central gateway node. Client nodes running open-source AI models connect to the gateway and request a task. 
            They then process it and produce an output based on the specific instructions and context attached to the task, and return the output to the central gateway for validation, storage
            and other important data operations. This output is also used to provide further context to the client nodes.
          </p>
          <p style={{ fontFamily: 'Roboto' }}>
            The architecture is scalable and modular, allowing for the addition of more client nodes as needed, and the upgrade of their capabilities with each new model version,
            as well as allowing for multimodality.
            The centralized approach ensures that all tasks are uniformly managed and validated and by distributing the processing load across multiple 
            client nodes, the system can handle a large volume of tasks in parallel, improving overall efficiency and fostering collaboration.
          </p>
          <p style={{ fontFamily: 'Roboto' }}>
            In this current iteration, we use the architecture to generate proposals based on issues. An issue is generated from the users inputs, which consist of two parts: The issue's title, and the issue's context. 
            Once this has been submitted to the system, it will start generating tasks of various types that you can watch live in the Task Viewer. You can submit your issue and watch the generated data in the Issue Viewer.
          </p>
          <p style={{ fontFamily: 'Roboto' }}>
            To submit an issue, you will need to request a single-use key through our communication channels. In order to collaborate with the project, you can run the <a href="https://github.com/berdichevskyivan/isari-client" target="_blank" style={{color:'magenta', textDecoration: 'none'}}>client script</a>, 
            provided you have the appropiate credentials in a local .env file.
          </p>
          <div style={{ display: 'flex', flexFlow: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginTop: '1.5rem', width: '100%' }}>
            <Button variant="contained" href="/task-viewer" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue', marginRight: '0.5rem' }}>
              <PendingActionsIcon sx={{ marginRight: '0.5rem' }} />Task Viewer
            </Button>
            <Button variant="contained" href="/issue-viewer" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue', marginRight: '0.5rem' }}>
              <CycloneIcon sx={{ marginRight: '0.5rem' }} />Issue Viewer
            </Button>
            <Button variant="contained" href="/submit-issue" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue', marginRight: '0.5rem' }}>
              <BackupIcon sx={{ marginRight: '0.5rem' }} />Submit Issue
            </Button>
          </div>
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
