// import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../App.css';
import { Card, CardContent, Typography, Avatar, Box, Grid, Button, IconButton, TextField, SvgIcon, useTheme, useMediaQuery } from '@mui/material';
import ControlsDashboard from '../components/ControlsDashboard';
import DataArrayIcon from '@mui/icons-material/DataArray';
import HubIcon from '@mui/icons-material/Hub';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import StarrySky from '../components/StarrySky';
import Loading from '../components/Loading';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const isProduction = import.meta.env.MODE === 'production';

function getInitials(input) {
  return input.split(' ').map(word => word[0]).join('');
}

function CustomCard({ worker, workerOptions }) {
  return (
    <Card sx={{ width: 250, height: 'fit-content', m: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.5)', overflow: 'hidden' }} className="worker-card">
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
        <Avatar src={`${isProduction ? '' : 'http://localhost'}/uploads/${worker.profile_picture_url}`} alt={worker.name} sx={{ width: 40, height: 40 }} />
        <Typography variant="h5" component="div" gutterBottom align="center" sx={{ marginBottom: 0, marginLeft: '.5rem', fontSize: '16px', fontFamily: 'Orbitron, sans-serif', alignSelf: 'center', color: '#00B2AA' }}>
          { worker.name }
        </Typography>
      </Box>
      <CardContent sx={{ flexGrow: 1, width: '100%', pt: 0 }}>
        {/* Programming Languages */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mt: 2, ml: '.5rem' }}>
          <DataArrayIcon sx={{ height: 30, width: 30, color: '#00CC00'}} />
          { worker.programming_languages?.length > 0 && worker.programming_languages.map(pl => (
            <Tippy key={`programming_language_${pl}`} content={<span style={{ fontFamily: 'Orbitron' }}>{ workerOptions.programming_languages.find(pl2 => pl2.id === pl).name }</span>}>
              <img key={`programming_language_${pl}`} src={workerOptions.programming_languages.find(pl2 => pl2.id === pl).icon_url} alt="programming-language-logo" width={30} height={30} className="category-icon"/>
            </Tippy>
          )) }
        </Box>
        
        {/* Generalized AI Branches */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, ml: '.5rem' }}>
          <HubIcon sx={{ height: 30, width: 30, color: '#007FFF'}} />
          { worker.generalized_ai_branches?.length > 0 && worker.generalized_ai_branches.map(branch => (
            <Tippy key={`generalized_ai_branch_${branch}`} content={<span style={{ fontFamily: 'Orbitron' }}>{ workerOptions.generalized_ai_branches.find(branch2 => branch2.id === branch).name }</span>}>
              <Avatar sx={{ bgcolor: 'blue', height: 30, width: 30 }} className="category-icon"><span style={{ fontFamily: 'Orbitron', fontSize: '12px' }}>{ getInitials(workerOptions.generalized_ai_branches.find(branch2 => branch2.id === branch).name) }</span></Avatar>
            </Tippy>
          )) }
        </Box>

        {/* Specialized AI Applications */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, ml: '.5rem' }}>
          <CenterFocusStrongIcon sx={{ height: 30, width: 30, color: '#7D26CD'}} />
          { worker.specialized_ai_applications?.length > 0 && worker.specialized_ai_applications.map(application => (
            <Tippy key={`specialized_ai_application_${application}`} content={<span style={{ fontFamily: 'Orbitron' }}>{ workerOptions.specialized_ai_applications.find(application2 => application2.id === application).name }</span>}>
              <img key={`specialized_ai_application_${application}`} src={workerOptions.specialized_ai_applications.find(application2 => application2.id === application).icon_url} alt="specialized-ai-application-logo" width={30} height={30} className="category-icon"/>
            </Tippy>
          )) }
        </Box>

        {/* AI Tools */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, ml: '.5rem' }}>
          <ArchitectureIcon sx={{ height: 30, width: 30, color: '#FFD700'}} />
          { worker.ai_tools?.length > 0 && worker.ai_tools.map(tool => (
            <Tippy key={`ai_tool_${tool}`} content={<span style={{ fontFamily: 'Orbitron' }}>{ workerOptions.ai_tools.find(tool2 => tool2.id === tool).name }</span>}>
              <img key={`ai_tool_${tool}`} src={workerOptions.ai_tools.find(tool2 => tool2.id === tool).icon_url} alt="ai-tool-logo" width={30} height={30} className="category-icon"/>
            </Tippy>
          )) }
        </Box>
      </CardContent>
    </Card>
  );
}

function WorkersPage({ workers, workerOptions, setWorkers }) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));

  const gridColumns = matches ? 'repeat(auto-fill, minmax(250px, 1fr))' : '1fr';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!workerOptions) {
    return <Loading />;
  }

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
      <Grid container sx={{
        position: 'relative',
        zIndex: 1,  // Ensure the grid is above the StarrySky
        display: 'grid',
        gridTemplateColumns: gridColumns,
        justifyContent: 'center',  // center the items when fewer
        padding: 2,
        gap: '16px',  // Use gap for both row and column gaps
        marginBottom: '80px'  // This extra margin accounts for the height of the dashboard
      }}>
        {workers.length === 0 && 
          <h1>There are no workers</h1>
        }
        {workers.length > 0 && workers.map((worker) => (
          <Grid item key={worker.id} sx={{ justifySelf: 'center' }}>
            <CustomCard
              worker={worker}
              workerOptions={workerOptions}
            />
          </Grid>
        ))}
      </Grid>
      <ControlsDashboard workerOptions={workerOptions} setWorkers={setWorkers} workers={workers}/>
    </div>
  );
}

export default WorkersPage;
