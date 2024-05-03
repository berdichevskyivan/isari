import React, { useState } from 'react';
import '../App.css';
import { Modal, Typography, Box, Button, IconButton, TextField } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub'; // Assuming GitHub OAuth
import EmailIcon from '@mui/icons-material/Email'; // For local sign-in
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Link } from 'react-router-dom';
import FeedbackModal from './modals/FeedbackModal';
import FilterModal from './modals/FilterModal';

function ControlsDashboard() {

  const [showFilters, setShowFilters] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleFeedbackModal = () => setShowFeedback(!showFeedback);

  return (
    <>
        <div className="stickyBar bottomBar" style={{ padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                    <img src="/isari-logo.png" alt="Isari AI Logo" style={{ width: 40, height: 40, marginRight: '.5rem' }} />
                    <span className="dashboard-text">Isari AI</span>
                </Link>
                <Button startIcon={<EmailIcon />} variant="contained" href="/create-worker-node">Create Worker Node</Button>
                <Button variant="contained" href="/work">Work Page</Button>
            </div>

            <IconButton onClick={toggleFilters} style={{ margin: '0 auto' }}>  {/* This will auto-center the button */}
                <FilterAltIcon className="icon-large" />
            </IconButton>

            <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="contained" href="/worker-node-dashboard">Worker Node Dashboard</Button>
                <Button startIcon={<GitHubIcon />} variant="contained" href="/">GitHub Login</Button>
                <Button onClick={toggleFeedbackModal}>Feedback</Button>
            </div>
        </div>
        <FilterModal open={showFilters} onClose={toggleFilters} />
        <FeedbackModal open={showFeedback} onClose={toggleFeedbackModal} />
    </>
  );
}

export default ControlsDashboard;
