import React, { useState } from 'react';
import '../App.css';
import { Modal, Card, CardContent, Typography, Avatar, Box, Button, TextField, useTheme, useMediaQuery } from '@mui/material';
import ControlsDashboard from '../components/ControlsDashboard';

function WorkerNodeDashboardPage() {
  return (
    <div style={{
        height: '100vh',
        width: '100%',
        overflow: 'auto',  // Allow overflow while hiding scrollbars
        '::WebkitScrollbar': { display: 'none' },
        msOverflowStyle: 'none',  // for Internet Explorer and Edge
        scrollbarWidth: 'none',  // for Firefox
    }}>
      <h1>Work Node Dashboard Page</h1>
      <ControlsDashboard />
    </div>
  );
}

export default WorkerNodeDashboardPage;
