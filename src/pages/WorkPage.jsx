import React, { useState } from 'react';
import '../App.css';
import { Modal, Card, CardContent, Typography, Avatar, Box, Grid, Button, IconButton, TextField, useTheme, useMediaQuery } from '@mui/material';
import ControlsDashboard from '../components/ControlsDashboard';
import StarrySky from '../components/StarrySky';

function WorkPage() {
  return (
    <div style={{
        height: '100vh',
        width: '100%',
        overflow: 'auto',  // Allow overflow while hiding scrollbars
        '::WebkitScrollbar': { display: 'none' },
        msOverflowStyle: 'none',  // for Internet Explorer and Edge
        scrollbarWidth: 'none',  // for Firefox
        display: 'flex',
        flexFlow: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,  // Ensure the grid is above the StarrySky
    }} className="work-page-container">
      <StarrySky />

      <div className="work-page-in-progress-container">
        <img src="/isari-logo.png" alt="Isari AI Logo" style={{ width: 170, height: 170 }} />
        <p className="in-progress-text">
          On this page we will have two types of work. One type of work is related to the training, fine-tuning, and upkeep of our models.
          The other one is related to software engineering projects we connect to through the Github API. The idea is to leverage the usage
          of our distributed resources to achieve completion on these tasks.
          <br /><br />
          Estimated Timeline:
        </p>
        <ul className="timeline-list">
          <li><strong>Phase 1:</strong> Initial Setup and Infrastructure - <em>Complete</em></li>
          <li><strong>Phase 2:</strong> Basic Functionality and Integration - <em>Expected by end of June 2024</em></li>
          <li><strong>Phase 3:</strong> Advanced Features and Testing - <em>Expected by end of August 2024</em></li>
          <li><strong>Phase 4:</strong> Full Launch - <em>Expected by end of October 2024</em></li>
        </ul>
        <p className="in-progress-text">
          Join our community for the latest updates:
        </p>
        <ul className="community-icons">
          <li><a href="https://discord.gg/TyMNmCGb" target="_blank" rel="noopener noreferrer"><img src="/discord-logo.svg" alt="Isari AI Logo" style={{ width: 50, height: 50 }} /></a></li>
        </ul>
      </div>

      <ControlsDashboard />
    </div>
  );
}

export default WorkPage;
