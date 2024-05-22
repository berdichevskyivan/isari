import React, { useState } from 'react';
import '../App.css';
import { Modal, Typography, Box, Button, IconButton, TextField } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Link } from 'react-router-dom';
import FeedbackModal from './modals/FeedbackModal';
import FilterModal from './modals/FilterModal';
import { useGlitch } from 'react-powerglitch';

function ControlsDashboard() {

    const glitch = useGlitch({
        glitchTimeSpan: {
          start: 0.1,
          end: 0.3
        },
        slice: {
          count: 6,
          velocity: 15,
          hueRotate: false,
        },
        shake: {
          velocity: 15,
          amplitudeX: 0.2,
          amplitudeY: 0
        },
        timing: {
          duration: 3000
        },
        glitchMode: 'always' // or 'hover' or 'click'
      });
  
  const [showFilters, setShowFilters] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleFeedbackModal = () => setShowFeedback(!showFeedback);

  return (
    <>
        <div className="stickyBar bottomBar" style={{ 
                padding: '10px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.9)',
            }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                    <img src="/isari-logo.png" alt="Isari AI Logo" style={{ width: 40, height: 40, marginRight: '.5rem' }} />
                    <span className="dashboard-text">Isari AI</span>
                </Link>
                <Button variant="contained" href="/create-worker" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue'}}>Create Worker</Button>
                <Button variant="contained" href="/work" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue'}}>Work Page</Button>
            </div>

            <IconButton onClick={toggleFilters} style={{ margin: '0 auto' }}>  {/* This will auto-center the button */}
                <FilterAltIcon className="icon-large" sx={{color: '#00B2AA'}} />
            </IconButton>

            <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="contained" href="/worker-dashboard" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue'}}>Worker Dashboard</Button>
                <Button variant="contained" href="/worker-dashboard" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue'}} onClick={toggleFeedbackModal}>Feedback</Button>
            </div>

            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <span className="dashboard-text-jp" ref={glitch.ref}>イサリ</span>
            </Link>
        </div>
        <FilterModal open={showFilters} onClose={toggleFilters} />
        <FeedbackModal open={showFeedback} onClose={toggleFeedbackModal} />
    </>
  );
}

export default ControlsDashboard;
