import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import '../App.css';
import { Modal, Card, CardContent, Typography, Avatar, Box, Button, TextField, Grid } from '@mui/material';
import ControlsDashboard from '../components/ControlsDashboard';
import StarrySky from '../components/StarrySky';
import Loading from '../components/Loading';
import DataArrayIcon from '@mui/icons-material/DataArray';
import HubIcon from '@mui/icons-material/Hub';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

function getInitials(input) {
  return input.split(' ').map(word => word[0]).join('');
}

function CustomCard({ worker, workerOptions }) {
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleEditClick = () => {
    setEditModalOpen(true);
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
  };

  return (
    <>
      <Card sx={{ width: 250, height: 'fit-available', m: 0, mr: '1rem', ml: '-0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.5)', overflow: 'hidden' }} className="worker-card">
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
          <Avatar src={`http://localhost:3000/uploads/${worker.profile_picture_url}`} alt={worker.name} sx={{ width: 40, height: 40 }} />
          <Typography variant="h5" component="div" gutterBottom align="center" sx={{ marginBottom: 0, marginLeft: '.5rem', fontSize: '16px', fontFamily: 'Orbitron, sans-serif', alignSelf: 'center', color: '#00B2AA' }}>
            {worker.name}
          </Typography>
        </Box>
        <CardContent sx={{ flexGrow: 1, width: '100%', pt: 0 }}>
          {/* Programming Languages */}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', mt: 2, ml: '.5rem' }}>
            <DataArrayIcon sx={{ height: 30, width: 30, color: '#00CC00' }} />
            {worker.programming_languages?.length > 0 && worker.programming_languages.map(pl => (
              <Tippy key={`programming_language_${pl}`} content={<span style={{ fontFamily: 'Orbitron' }}>{workerOptions.programming_languages.find(pl2 => pl2.id === pl).name}</span>}>
                <img key={`programming_language_${pl}`} src={workerOptions.programming_languages.find(pl2 => pl2.id === pl).icon_url} alt="programming-language-logo" width={30} height={30} className="category-icon" />
              </Tippy>
            ))}
          </Box>

          {/* Generalized AI Branches */}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, ml: '.5rem' }}>
            <HubIcon sx={{ height: 30, width: 30, color: '#007FFF' }} />
            {worker.generalized_ai_branches?.length > 0 && worker.generalized_ai_branches.map(branch => (
              <Tippy key={`generalized_ai_branch_${branch}`} content={<span style={{ fontFamily: 'Orbitron' }}>{workerOptions.generalized_ai_branches.find(branch2 => branch2.id === branch).name}</span>}>
                <Avatar sx={{ bgcolor: 'blue', height: 30, width: 30 }} className="category-icon"><span style={{ fontFamily: 'Orbitron', fontSize: '12px' }}>{getInitials(workerOptions.generalized_ai_branches.find(branch2 => branch2.id === branch).name)}</span></Avatar>
              </Tippy>
            ))}
          </Box>

          {/* Specialized AI Applications */}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, ml: '.5rem' }}>
            <CenterFocusStrongIcon sx={{ height: 30, width: 30, color: '#7D26CD' }} />
            {worker.specialized_ai_applications?.length > 0 && worker.specialized_ai_applications.map(application => (
              <Tippy key={`specialized_ai_application_${application}`} content={<span style={{ fontFamily: 'Orbitron' }}>{workerOptions.specialized_ai_applications.find(application2 => application2.id === application).name}</span>}>
                <img key={`specialized_ai_application_${application}`} src={workerOptions.specialized_ai_applications.find(application2 => application2.id === application).icon_url} alt="specialized-ai-application-logo" width={30} height={30} className="category-icon" />
              </Tippy>
            ))}
          </Box>

          {/* AI Tools */}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, ml: '.5rem' }}>
            <ArchitectureIcon sx={{ height: 30, width: 30, color: '#FFD700' }} />
            {worker.ai_tools?.length > 0 && worker.ai_tools.map(tool => (
              <Tippy key={`ai_tool_${tool}`} content={<span style={{ fontFamily: 'Orbitron' }}>{workerOptions.ai_tools.find(tool2 => tool2.id === tool).name}</span>}>
                <img key={`ai_tool_${tool}`} src={workerOptions.ai_tools.find(tool2 => tool2.id === tool).icon_url} alt="ai-tool-logo" width={30} height={30} className="category-icon" />
              </Tippy>
            ))}
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

function WorkerDashboardPage({ workerOptions }) {
  const { loggedInUser } = useContext(AuthContext);

  if (!workerOptions) {
    return <Loading />;
  }

  return (
    <div className="worker-dashboard-container">
      <StarrySky />

      <div className="dashboard-page-in-progress-container">
        <div className="worker-dashboard-header">
          { loggedInUser && (
          <CustomCard
            worker={loggedInUser}
            workerOptions={workerOptions}
          />
          ) }

          <div className="worker-feed">

          </div>
        </div>

        <div style={{ display: 'flex', flexFlow: 'row', marginTop: '1.5rem', justifyContent: 'space-between', width: '100%' }}>
          <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', color: 'white', border: '1px solid blue', marginRight: '1.5rem' }} onClick={() => console.log('Update account clicked')}>
            Update
          </Button>
          <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'red', color: 'white' }} onClick={() => console.log('Delete account clicked')}>
            Delete Account
          </Button>
        </div>
      </div>

      <ControlsDashboard />
    </div>
  );
}

export default WorkerDashboardPage;
