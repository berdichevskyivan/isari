import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import '../App.css';
import { Modal, Typography, Box, Button, IconButton, TextField } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Link } from 'react-router-dom';
import FeedbackModal from './modals/FeedbackModal';
import FilterModal from './modals/FilterModal';
import DonateModal from './modals/DonateModal';
import LoginModal from './modals/LoginModal';
import { useGlitch } from 'react-powerglitch';
import { useLocation } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ConstructionIcon from '@mui/icons-material/Construction';
import BackupIcon from '@mui/icons-material/Backup';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import EngineeringIcon from '@mui/icons-material/Engineering';

function ControlsDashboard({ workerOptions, setWorkers, workers }) {

  const { isLoggedIn, loggedInUser, login, logout } = useContext(AuthContext);

  const location = useLocation();
  const isWorkersPage = location.pathname === '/workers';

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
  const [showDonation, setShowDonation] = useState(false);
  const [showLogin, setShowLogin] = useState(false);  // Add state for the login modal

  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleFeedbackModal = () => setShowFeedback(!showFeedback);
  const toggleDonationModal = () => setShowDonation(!showDonation);
  const toggleLoginModal = () => setShowLogin(!showLogin);  // Handler to toggle the modal

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1412);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1412);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        <div className="stickyBar bottomBar column-on-small" style={{ 
                padding: '10px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.9)',
            }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }} className="wrap-on-small">
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                    <img src="/isari-logo.png" alt="Isari AI Logo" style={{ width: 40, height: 40, marginRight: '.5rem' }} />
                    <span className="dashboard-text hide-on-small">Isari AI</span>
                </Link>

                {isLoggedIn && (
                  <>
                    {/* <Link to="/lorenz" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                      <img src="/lorenz-logo.png" alt="Lorenz Logo" style={{ width: 40, height: 40, marginRight: '.5rem' }} />
                      <span className="dashboard-text hide-on-small" >Lorenz</span>
                    </Link> */}
                    <Button variant="contained" href="/worker-dashboard" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue'}}>
                      <DashboardIcon sx={{ marginRight: '0.5rem' }} /> <span className="hide-on-small">Dashboard</span>
                    </Button>
                    <Button variant="contained" href="/learning" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }}>
                      <LocalLibraryIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} /> <span className="hide-on-small">Learning</span>
                    </Button>
                    <Button variant="contained" href="/workers" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }}>
                      <EngineeringIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} /> <span className="hide-on-small">Workers</span>
                    </Button>
                    <Button variant="contained" href="/work" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }}>
                      <ConstructionIcon sx={{ marginRight: '0.5rem' }} /> <span className="hide-on-small">Work</span>
                    </Button>
                    <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }} onClick={toggleDonationModal}>
                      <FavoriteIcon sx={{ marginRight: '0.5rem' }} /> <span className="hide-on-small">Donate</span>
                    </Button>
                    <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }} onClick={logout}>
                      <LogoutIcon sx={{ marginRight: '0.5rem' }} /> <span className="hide-on-small">Logout</span>
                    </Button>
                    <Button variant="contained" href="/submit-issue" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }}>
                      <BackupIcon sx={{ marginRight: '0.5rem' }} /><span className="hide-on-small">Submit Issue</span>
                    </Button>
                  </>
                )}
                {!isLoggedIn && (
                  <>
                    <Button variant="contained" href="/create-worker" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }}>
                      <AccountCircleIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} /> <span className="hide-on-small">Create Account</span>
                    </Button>
                    <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }} onClick={toggleLoginModal}>
                      <LoginIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} /> <span className="hide-on-small">Login</span>
                    </Button>
                    <Button variant="contained" href="/learning" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }}>
                      <LocalLibraryIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} /> <span className="hide-on-small">Learning</span>
                    </Button>
                    <Button variant="contained" href="/workers" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }}>
                      <EngineeringIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} /> <span className="hide-on-small">Workers</span>
                    </Button>
                  </>
                )}
                {isWorkersPage && (
                  <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }} onClick={toggleFilters}>
                    <FilterAltIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} /> <span className="hide-on-small">Filters</span>
                  </Button>
                )}
            </div>

            <div className="community-icons-controls">
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', marginRight: '.5rem' }}>
                  <span className="dashboard-text-jp" ref={glitch.ref}>イサリ</span>
              </Link>

              <a href="https://discord.gg/5fgJkHVR4A" target="_blank" rel="noopener noreferrer">
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
        {isWorkersPage && (
          <FilterModal open={showFilters} onClose={toggleFilters} workerOptions={workerOptions} setWorkers={setWorkers} workers={workers} />
        )}
        <FeedbackModal open={showFeedback} onClose={toggleFeedbackModal} />
        <DonateModal open={showDonation} onClose={toggleDonationModal} />
        <LoginModal open={showLogin} onClose={toggleLoginModal} login={login}/>
    </>
  );
}

export default ControlsDashboard;
