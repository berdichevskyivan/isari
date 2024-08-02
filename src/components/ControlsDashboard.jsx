import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import '../App.css';
import { Modal, Typography, IconButton, Button, Collapse, List, ListItem, ListItemText } from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Link } from 'react-router-dom';
import FilterModal from './modals/FilterModal';
import LoginModal from './modals/LoginModal';
import { useGlitch } from 'react-powerglitch';
import { useLocation } from 'react-router-dom';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EngineeringIcon from '@mui/icons-material/Engineering';
import MenuIcon from '@mui/icons-material/Menu';
import './ControlsDashboard.css';

function ControlsDashboard({ workerOptions, setWorkers, workers }) {

  const { isLoggedIn, loggedInUser, login, logout } = useContext(AuthContext);

  const [collapseOpen, setCollapseOpen] = useState(false);

  const toggleCollapse = () => {
    setCollapseOpen(!collapseOpen);
  };

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
        glitchMode: 'always'
      });
  
  const [showFilters, setShowFilters] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const toggleFilters = () => setShowFilters(!showFilters);
  const toggleLoginModal = () => setShowLogin(!showLogin);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1412);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1412);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  let propertiesRegistered = false;

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
        propertiesRegistered = true;
      } catch (e) {
        console.warn('CSS property already registered:', e.message);
      }
    }
  }, []);

  return (
    <>
        <div className="stickyBar topBar column-on-small" style={{ 
                padding: '10px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(0, 0, 0, 0.9)',
                flexFlow: 'row',
            }}>
            <div style={{ display: 'flex', flexFlow: 'row' }} className="hide-on-big">
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                  <img src="/isari-logo.png" alt="Isari AI Logo" style={{ width: 40, height: 40, marginRight: '.5rem' }} />
                  <span className="dashboard-text button-text-on-small">Isari AI</span>
              </Link>
              <IconButton onClick={toggleCollapse}>
                <MenuIcon sx={{ color: 'turquoise' }}/>
              </IconButton>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }} className="wrap-on-small hide-on-small">
                <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                    <img src="/isari-logo.png" alt="Isari AI Logo" style={{ width: 40, height: 40, marginRight: '.5rem' }} />
                    <span className="dashboard-text button-text-on-small">Isari AI</span>
                </Link>

                {isLoggedIn && (
                  <>
                    <Button variant="contained" href="/worker-dashboard" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue'}}>
                      <DashboardIcon sx={{ marginRight: '0.5rem' }} /> <span className="button-text-on-small">Dashboard</span>
                    </Button>
                    <Button variant="contained" href="/workers" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }}>
                      <EngineeringIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} /> <span className="button-text-on-small">Workers</span>
                    </Button>
                    <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }} onClick={logout}>
                      <LogoutIcon sx={{ marginRight: '0.5rem' }} /> <span className="button-text-on-small">Logout</span>
                    </Button>
                  </>
                )}
                {!isLoggedIn && (
                  <>
                    <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }} onClick={toggleLoginModal}>
                      <LoginIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} /> <span className="button-text-on-small">Login</span>
                    </Button>
                    <Button variant="contained" href="/create-worker" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }}>
                      <AccountCircleIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} /> <span className="button-text-on-small">Create Account</span>
                    </Button>
                    <Button variant="contained" href="/workers" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }}>
                      <EngineeringIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} /> <span className="button-text-on-small">Workers</span>
                    </Button>
                  </>
                )}
                {isWorkersPage && (
                  <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }} onClick={toggleFilters}>
                    <FilterAltIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} /> <span className="button-text-on-small">Filters</span>
                  </Button>
                )}
            </div>

            <div className="community-icons-controls">
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', marginRight: '.5rem' }} className="hide-on-small">
                  <span className="dashboard-text-jp" ref={glitch.ref}>イサリ</span>
              </Link>

              <a href="https://discord.gg/5fgJkHVR4A" target="_blank" rel="noopener noreferrer">
                <img src="/discord-logo.svg" alt="Isari AI Logo" className="dashboard-icon" />
              </a>
              <a href="mailto:isari.project@gmail.com" target="_blank" rel="noopener noreferrer">
                <img src="/gmail-logo.svg" alt="Isari AI Logo" className="dashboard-icon" />
              </a>
              <a href="https://github.com/isari-ai" target="_blank" rel="noopener noreferrer">
                <img src="/github-logo.svg" alt="Isari AI Logo" className="dashboard-icon" />
              </a>
            </div>
        </div>
        <div className="collapse-container hide-on-big">
          <Collapse in={collapseOpen}>
            <List>
              {isLoggedIn && (
                <>
                  <ListItem>
                    <Button variant="contained" href="/worker-dashboard" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue', width: '100%'}}>
                      <DashboardIcon sx={{ marginRight: '0.5rem' }} />Dashboard
                    </Button>
                  </ListItem>
                  <ListItem>
                    <Button variant="contained" href="/workers" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue', width: '100%' }}>
                      <EngineeringIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} />Workers
                    </Button>
                  </ListItem>
                  <ListItem>
                    <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue', width: '100%' }} onClick={logout}>
                      <LogoutIcon sx={{ marginRight: '0.5rem' }} />Logout
                    </Button>
                  </ListItem>
                </>
              )}
              {!isLoggedIn && (
                <>
                  <ListItem>
                    <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue', width: '100%' }} onClick={toggleLoginModal}>
                      <LoginIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} />Login
                    </Button>
                  </ListItem>
                  <ListItem>
                    <Button variant="contained" href="/create-worker" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue', width: '100%' }}>
                      <AccountCircleIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} />Create Account
                    </Button>
                  </ListItem>
                  <ListItem>
                    <Button variant="contained" href="/workers" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue', width: '100%' }}>
                      <EngineeringIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} />Workers
                    </Button>
                  </ListItem>
                </>
              )}
              {isWorkersPage && (
                <ListItem>
                  <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue', width: '100%' }} onClick={toggleFilters}>
                    <FilterAltIcon sx={{ marginRight: isMobile ? '0' : '0.5rem' }} />Filters
                  </Button>
                </ListItem>
              )}
            </List>
          </Collapse>
        </div>
        {isWorkersPage && (
          <FilterModal open={showFilters} onClose={toggleFilters} workerOptions={workerOptions} setWorkers={setWorkers} workers={workers} />
        )}
        <LoginModal open={showLogin} onClose={toggleLoginModal} login={login}/>
    </>
  );
}

export default ControlsDashboard;
