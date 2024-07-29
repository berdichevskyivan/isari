import React, { useState, useEffect } from 'react';
import '../App.css';
import ControlsDashboard from '../components/ControlsDashboard';
import StarrySky from '../components/StarrySky';
import ArchitectureVisualization from '../components/ArchitectureVisualization';
import { Typography, Box, Button } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const isProduction = import.meta.env.MODE === 'production';

function HomePage({ workers, workerOptions, setWorkers }) {

  // Add later but on another condition
  // if (!workerOptions) {
  //   return <Loading />;
  // }

  useEffect(()=>{
    if(localStorage.getItem('tabs')){
      localStorage.removeItem('tabs');
    }
  },[]);

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
      <ControlsDashboard workerOptions={workerOptions} setWorkers={setWorkers} workers={workers}/>
      <div className="homepage-main-container">
        <div className="homepage-info-container">
          <h1 style={{ margin: 0 }}>Create your own agentic workflows and run them locally</h1>
          <p style={{ fontFamily: 'Roboto' }}>
            After <a href="https://isari.ai/create-worker" target="_blank" style={{color:'magenta', textDecoration: 'none'}}>creating an account</a>, you can create
            Datasets and Workflows. Workflows are collections of tasks, to be executed sequentially by your client. Each task carries specific information and instructions that you will
            be able to see logged out as you run them.
          </p>
          <p style={{ fontFamily: 'Roboto' }}>
            To start retrieving tasks from your workflows, you can run the <a href="https://github.com/berdichevskyivan/isari-client" target="_blank" style={{color:'magenta', textDecoration: 'none'}}>client script</a>. 
            You have to add the variable WORKER_KEY in an .env file. This WORKER_KEY is automatically generated when you create an account, you can retrieve it from your Dashboard.
          </p>
          <p style={{ fontFamily: 'Roboto', marginBottom: '1rem' }}>
            Here's a video demonstration of how it works:
          </p>
          <iframe
            width="560"
            height="315" 
            src="https://www.youtube.com/embed/Tclg76UU9VU?si=53LpU9mpaemujvRZ"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin"
            allowfullscreen></iframe>
          <div style={{ display: 'flex', flexFlow: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center', marginTop: '1.5rem', width: '100%' }}>
            <Button variant="contained" href="/create-worker" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }}>
              <AccountCircleIcon sx={{ marginRight: '0.5rem' }} /> <span>Create Account</span>
            </Button>
          </div>
        </div>
        <div className="homepage-visualization-container">
          <ArchitectureVisualization />
        </div>
      </div>

      
    </div>
  );
}

export default HomePage;
