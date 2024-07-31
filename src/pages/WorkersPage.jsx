// import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import '../App.css';
import { Card, CardContent, Typography, Avatar, Box, Grid, Button, IconButton, TextField, SvgIcon, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import ControlsDashboard from '../components/ControlsDashboard';
import DataArrayIcon from '@mui/icons-material/DataArray';
import HubIcon from '@mui/icons-material/Hub';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import StarrySky from '../components/StarrySky';
import Loading from '../components/Loading';
import Tippy from '@tippyjs/react';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';
import 'tippy.js/dist/tippy.css';

const StyledAvatar = styled(Avatar)({
  '& img': {
    objectFit: 'fill',
  },
});

const sortSpecializedAiApplications = (applications, options) => {
  return applications.sort((a, b) => {
    const appA = options.find(app => app.id === a);
    const appB = options.find(app => app.id === b);

    if (appA && appA.name === 'Artificial Intelligence') return -1;
    if (appB && appB.name === 'Artificial Intelligence') return 1;
    return 0;
  });
};

const isProduction = import.meta.env.MODE === 'production';

function getInitials(input) {
  return input.split(' ').map(word => word[0]).join('');
}

function CustomCard({ worker, workerOptions }) {
  return (
    <Card sx={{ width: 250, height: 'fit-content', m: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.5)', overflow: 'hidden' }} className="worker-card">
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
        { worker.anonymize && (
          <>
            <StyledAvatar src='/isari-logo.png' alt={worker.name} sx={{ width: 40, height: 40 }} />
            <Typography variant="h5" component="div" gutterBottom align="center" sx={{ marginBottom: 0, marginLeft: '.5rem', fontSize: '16px', fontFamily: 'Orbitron, sans-serif', alignSelf: 'center', color: '#00B2AA' }}>
              { worker.name }
            </Typography>
          </>
        ) }
        { !worker.anonymize && (
          <>
            <Avatar src={`${isProduction ? '' : 'http://localhost'}/uploads/${worker.profile_picture_url}`} alt={worker.name} sx={{ width: 40, height: 40 }} />
            <Typography variant="h5" component="div" gutterBottom align="center" sx={{ marginBottom: 0, marginLeft: '.5rem', fontSize: '16px', fontFamily: 'Orbitron, sans-serif', alignSelf: 'center', color: '#00B2AA' }}>
              { worker.name }
            </Typography>
          </>
        ) }

      </Box>
      <CardContent sx={{ flexGrow: 1, width: '100%', pt: 0, paddingBottom: '10px !important' }}>
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
          { worker.specialized_ai_applications?.length > 0 && sortSpecializedAiApplications(worker.specialized_ai_applications, workerOptions.specialized_ai_applications).map(application => (
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
        
        {/* Contact Information */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', pt: 2, ml: '.6rem' }}>
          <div style={{ marginRight: '1rem' }}>
            { worker.anonymize && (
              <Tippy content={
                <span style={{ fontFamily: 'Roboto', textAlign: 'left' }}>
                  <p style={{ margin: 0, textAlign: 'center' }}>This worker has chosen to anonymize his personal and contact information</p>
                </span>}
              >
                <InfoIcon sx={{ height: 30, width: 30, color: 'white'}} />
              </Tippy>
            ) }
            { !worker.anonymize && (
              <>
                { worker.email && (
                  <Tippy content={
                    <span style={{ fontFamily: 'Roboto', textAlign: 'left' }}>
                      <p style={{ margin: 0, textAlign: 'center' }}>{ worker.email }</p>
                    </span>}
                  >
                    <EmailIcon sx={{ height: 30, width: 30, color: 'white', marginRight: '.5rem'}} />
                  </Tippy>
                ) }
                { worker.github_url && (
                  <Tippy content={
                    <span style={{ fontFamily: 'Roboto', textAlign: 'left' }}>
                      <p style={{ margin: 0, textAlign: 'center' }}>{ worker.github_url }</p>
                    </span>}
                  >
                    <GitHubIcon sx={{ height: 30, width: 30, color: 'white', marginRight: '.5rem'}} />
                  </Tippy>
                ) }
              </>
            ) }
          </div>
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
      <ControlsDashboard workerOptions={workerOptions} setWorkers={setWorkers} workers={workers}/>
      <Grid container sx={{
        position: 'relative',
        zIndex: 1,  // Ensure the grid is above the StarrySky
        display: 'grid',
        gridTemplateColumns: gridColumns,
        justifyContent: 'center',  // center the items when fewer
        padding: 2,
        gap: '16px',  // Use gap for both row and column gaps
        marginTop: '70px'  // This extra margin accounts for the height of the dashboard
      }}>
        {workers.length === 0 && 
          <h1>There are no workers</h1>
        }
        {workers.length > 0 && workers.map((worker) => (
          <Grid item xs={12} key={worker.id} sx={{ justifySelf: 'center' }}>
            <CustomCard
              worker={worker}
              workerOptions={workerOptions}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default WorkersPage;
