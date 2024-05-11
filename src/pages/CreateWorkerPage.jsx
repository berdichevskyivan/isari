import React, { useState } from 'react';
import '../App.css';
import { Modal, Card, CardContent, Typography, Avatar, Box, Grid, Button, IconButton, TextField } from '@mui/material';
import ControlsDashboard from '../components/ControlsDashboard';

function CreateWorkerPage() {
  return (
    <div style={{
        height: '100vh',
        width: '100%',
        overflow: 'auto',  // Allow overflow while hiding scrollbars
        '::WebkitScrollbar': { display: 'none' },
        msOverflowStyle: 'none',  // for Internet Explorer and Edge
        scrollbarWidth: 'none',  // for Firefox
    }}>
      <h1>Create Worker Page</h1>
      <ControlsDashboard />
    </div>
  );
}

export default CreateWorkerPage;
