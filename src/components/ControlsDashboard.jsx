import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import '../App.css';
import { Modal, Typography, Box, Button, IconButton, TextField } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Link } from 'react-router-dom';
import FeedbackModal from './modals/FeedbackModal';
import FilterModal from './modals/FilterModal';
import { useGlitch } from 'react-powerglitch';
import { useLocation } from 'react-router-dom';

function ControlsDashboard() {

  const { isLoggedIn, login, logout } = useContext(AuthContext);

  const location = useLocation();
  const isHomepage = location.pathname === '/';

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

  let propertiesRegistered = false; // Global flag to check if properties are registered

  useEffect(() => {
    if (!propertiesRegistered && typeof CSS !== 'undefined' && CSS.registerProperty) {
      try {
        CSS.registerProperty({
          name: '--magic-rainbow-color-0',
          syntax: '<color>',
          inherits: false,
          initialValue: 'hsl(0deg, 100%, 50%)'
        });
        CSS.registerProperty({
          name: '--magic-rainbow-color-1',
          syntax: '<color>',
          inherits: false,
          initialValue: 'hsl(120deg, 100%, 50%)'
        });
        CSS.registerProperty({
          name: '--magic-rainbow-color-2',
          syntax: '<color>',
          inherits: false,
          initialValue: 'hsl(240deg, 100%, 50%)'
        });
        propertiesRegistered = true; // Set the flag to true after registering properties
      } catch (e) {
        console.warn('CSS property already registered:', e.message);
      }
    }
  }, []);

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

                <Link to="/lorenz" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                    <img src="/lorenz-logo.png" alt="Lorenz Logo" style={{ width: 40, height: 40, marginRight: '.5rem' }} />
                    <span className="dashboard-text" >Lorenz</span>
                </Link>
                {isLoggedIn && (
                  <Button variant="contained" href="/worker-dashboard" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue'}}>Dashboard</Button>
                )}
                <Button variant="contained" href="/create-worker" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue'}}>Create Account</Button>
                <Button variant="contained" href="/work" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue'}}>Work</Button>
                <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue'}} onClick={toggleFeedbackModal}>Feedback</Button>
                {isHomepage && (
                  <IconButton onClick={toggleFilters} style={{ margin: '0 auto' }}>  {/* This will auto-center the button */}
                      <FilterAltIcon className="icon-large" sx={{ color: '#00B2AA' }} />
                  </IconButton>
                )}
            </div>

            <div className="community-icons-controls">
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', marginRight: '.5rem' }}>
                  <span className="dashboard-text-jp" ref={glitch.ref}>イサリ</span>
              </Link>

              <a href="https://discord.gg/TyMNmCGb" target="_blank" rel="noopener noreferrer">
                <img src="/discord-logo.svg" alt="Isari AI Logo" style={{ width: 40, height: 40, marginLeft: '.5rem', marginRight: '1rem', paddingTop: '.3rem' }} />
              </a>
              <a href="mailto:isari.project@gmail.com" target="_blank" rel="noopener noreferrer">
                <img src="/gmail-logo.svg" alt="Isari AI Logo" style={{ width: 40, height: 40, marginLeft: '.5rem', marginRight: '1rem', paddingTop: '.3rem' }} />
              </a>
              <a href="https://github.com/isari-ai" target="_blank" rel="noopener noreferrer">
                <img src="/github-logo.svg" alt="Isari AI Logo" style={{ width: 40, height: 40, marginLeft: '.5rem', marginRight: '1rem', paddingTop: '.3rem' }} />
              </a>
            </div>
        </div>
        <FilterModal open={showFilters} onClose={toggleFilters} />
        <FeedbackModal open={showFeedback} onClose={toggleFeedbackModal} />
    </>
  );
}

export default ControlsDashboard;
