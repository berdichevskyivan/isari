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
import MessageIcon from '@mui/icons-material/Message';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

const testNotifications = [
  { id: 1, message: 'Someone sent you a message!', icon: <MessageIcon sx={{ height: 30, width: 30, color: '#00B2AA', cursor: 'pointer'}} /> },
  { id: 2, message: 'You\'ve received a donation of 200 Shinrai!', icon: <AccountBalanceWalletIcon sx={{ height: 30, width: 30, color: '#00B2AA', cursor: 'pointer'}} /> },
];

const testMessages = [
  {
    id: 1,
    sender: 'John Doe',
    sender_icon: 'http://localhost:3000/uploads/26-yuei-huang.jpg',
    last_message: 'Hey, how are you?',
    conversation: [
      { sender: 'John Doe', message: 'Hey, how are you?' },
      { sender: 'Ivan Berdichevsky', message: 'I\'m good, thanks!' },
    ],
  },
  {
    id: 2,
    sender: 'Jane Smith',
    sender_icon: 'http://localhost:3000/uploads/27-veronika-seltzmann.jpg',
    last_message: 'Are you available for a meeting?',
    conversation: [
      { sender: 'Jane Smith', message: 'Are you available for a meeting?' },
      { sender: 'Ivan Berdichevsky', message: 'Sure, what time?' },
    ],
  },
];

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
      <Card sx={{ width: 250, height: 'fill-available', m: 0, mr: '1rem', ml: '-0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.5)', overflow: 'hidden' }} className="worker-card">
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
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
            <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }} onClick={handleEditClick}>Edit</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal
        open={editModalOpen}
        onClose={handleModalClose}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}>
          {/* Modal Content */}
          <Typography id="edit-modal-title" variant="h6" component="h2" sx={{ fontFamily: 'Orbitron' }}>
            Edit Worker Details
          </Typography>
          {/* Content similar to CreateWorkerPage */}
          {/* Here you can add similar components and logic as in the CreateWorkerPage for editing */}
          {/* ... */}
        </Box>
      </Modal>
    </>
  );
}

function WorkerDashboardPage({ workerOptions }) {
  const { loggedInUser } = useContext(AuthContext);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
  };

  const handleCloseMessageModal = () => {
    setSelectedMessage(null);
  };

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
      display: 'flex',
      flexFlow: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,  // Ensure the grid is above the StarrySky
    }}>
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
            {testNotifications.map(notification => (
              <Box key={notification.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                { notification.icon }
                <Typography sx={{ fontFamily: 'Orbitron', color: '#00e6da', marginLeft: '.5rem' }}>{notification.message}</Typography>
              </Box>
            ))}
          </div>
        </div>

        <div className="worker-dashboard-footer">
          {testMessages.map(message => (
            <Box key={message.id} sx={{ display: 'flex', alignItems: 'center', mb: 2, cursor: 'pointer' }} onClick={() => handleSelectMessage(message)}>
              <img src={message.sender_icon} alt="sender-icon" style={{ width: 30, height: 30, marginRight: '0.5rem', borderRadius: '100%' }} />
              <Typography sx={{ fontFamily: 'Orbitron', color: '#00e6da' }}>{message.last_message}</Typography>
            </Box>
          ))}
        </div>

        <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'red', color: 'white' }} onClick={() => console.log('Delete account clicked')}>
          Delete Account
        </Button>
      </div>

      <ControlsDashboard />

      {/* Message Modal */}
      {selectedMessage && (
        <Modal
          open={true}
          onClose={handleCloseMessageModal}
          aria-labelledby="message-modal-title"
          aria-describedby="message-modal-description"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
          }}>
            <Typography id="message-modal-title" variant="h6" component="h2" sx={{ fontFamily: 'Orbitron' }}>
              Conversation with {selectedMessage.sender}
            </Typography>
            <Box id="message-modal-description" sx={{ mt: 2 }}>
              {selectedMessage.conversation.map((msg, index) => (
                <Typography key={index} sx={{ fontFamily: 'Orbitron' }}>
                  <strong>{msg.sender}:</strong> {msg.message}
                </Typography>
              ))}
            </Box>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              sx={{ mt: 2, mb: 2 }}
            />
            <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'blue', color: 'white' }} onClick={() => console.log('Send message clicked')}>
              Send
            </Button>
          </Box>
        </Modal>
      )}
    </div>
  );
}

export default WorkerDashboardPage;
