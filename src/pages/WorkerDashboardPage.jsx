import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { Card, CardContent, Typography, Avatar, Box, Button, Grid, TextField, FormControlLabel, Checkbox } from '@mui/material';
import ControlsDashboard from '../components/ControlsDashboard';
import StarrySky from '../components/StarrySky';
import Loading from '../components/Loading';
import DataArrayIcon from '@mui/icons-material/DataArray';
import HubIcon from '@mui/icons-material/Hub';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import ArchitectureIcon from '@mui/icons-material/Architecture';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { styled } from '@mui/system';
import Chip from '@mui/material/Chip';
import axios from 'axios';
import DeleteConfirmModal from '../components/modals/DeleteConfirmModal'; // Import the modal component
import { useNotification } from '../context/NotificationContext';

const isProduction = import.meta.env.MODE === 'production';

const StyledChip = styled(Chip)(({ selected, shadowcolor }) => ({
  margin: '4px',
  boxShadow: selected ? `0 0 15px ${shadowcolor}` : 'none',
  borderColor: selected ? shadowcolor : '#ccc',
  borderRadius: '50%',
  borderWidth: '2px',
  width: 60,
  height: 60,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  '.MuiChip-label': {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));

const StyledTextField = styled(TextField)({
  width: '80%',
  maxWidth: '100% !important',
  '& input': {
    color: 'white',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '12px',
    height: '30px',
    padding: '0 8px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    '&::placeholder': {
      fontFamily: 'Orbitron, sans-serif',
      color: 'white',
      fontSize: '12px',
    },
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'turquoise',
    },
    '&:hover fieldset': {
      borderColor: 'turquoise',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'turquoise',
    },
    fontFamily: 'Roboto, sans-serif',
    fontSize: '12px',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    '& textarea': {
      '&::placeholder': {
        fontFamily: 'Orbitron, sans-serif',
      },
    },
  },
  '.MuiFormLabel-root': {
    display: 'none',
  },
});

function getInitials(input) {
  return input.split(' ').map(word => word[0]).join('');
}

function CustomCard({ worker, workerOptions, workerEmail, workerGithubUrl, anonymize, setWorkerEmail, setWorkerGithubUrl, setAnonymize }) {
  return (
    <>
      <Card sx={{ width: 250, height: 'fit-available', m: 0, mr: '1rem', ml: '-0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.5)', overflow: 'hidden' }} className="worker-card">
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
          <Avatar src={`${isProduction ? '' : 'http://localhost'}/uploads/${worker.profile_picture_url}`} alt={worker.name} sx={{ width: 40, height: 40 }} />
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

          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, ml: '.5rem', alignItems: 'center' }}>
            <EmailIcon sx={{ height: 30, width: 30, color: 'white' }} />
            <StyledTextField
              placeholder="Email Address"
              variant="outlined"
              fullWidth
              sx={{ backgroundColor: 'black', maxWidth: '50%', marginBottom: '.1rem !important', marginLeft: '.2rem' }}
              inputProps={{ maxLength: 40 }}
              value={workerEmail}
              autoComplete='off'
              onChange={(e) => setWorkerEmail(e.target.value)}
            />
          </Box>

          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, ml: '.5rem', alignItems: 'center' }}>
            <GitHubIcon sx={{ height: 30, width: 30, color: 'white' }} />
            <StyledTextField
              placeholder="Github Url"
              variant="outlined"
              fullWidth
              sx={{ backgroundColor: 'black', maxWidth: '50%', marginBottom: '.1rem !important', marginLeft: '.2rem' }}
              inputProps={{ maxLength: 40 }}
              value={workerGithubUrl}
              autoComplete='off'
              onChange={(e) => setWorkerGithubUrl(e.target.value)}
            />
          </Box>

          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-start', pt: 2, alignItems: 'center' }}>
            <FormControlLabel
              sx={{ color: 'white', marginLeft: '0.1rem' }}
              control={
                <Checkbox
                  checked={anonymize}
                  sx={{ color: 'turquoise', '&.Mui-checked': { color: 'turquoise' } }}
                  onChange={(e) => setAnonymize(e.target.checked)}
                />
              }
              label="Anonymize"
            />
            <Tippy content={
              <span style={{ fontFamily: 'Roboto', textAlign: 'left' }}>
                <p style={{ margin: 0, textAlign: 'center' }}>Toggle this on to hide your name and contact information to the public</p>
              </span>}
            >
              <InfoIcon sx={{ color: 'white', marginLeft: '-5px' }}/>
            </Tippy>
          </Box>

        </CardContent>
      </Card>
    </>
  );
}

function WorkerDashboardPage({ workerOptions }) {
  const { loggedInUser, setLoggedInUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { openSnackbar } = useNotification();
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedApps, setSelectedApps] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [workerEmail, setWorkerEmail] = useState('');
  const [workerGithubUrl, setWorkerGithubUrl] = useState('');
  const [anonymize, setAnonymize] = useState(false); 
  const [workerUsageKeys, setWorkerUsageKeys] = useState([]);

  useEffect(() => {
    if (loggedInUser) {
      setSelectedLangs(loggedInUser.programming_languages || []);
      setSelectedBranches(loggedInUser.generalized_ai_branches || []);
      setSelectedApps(loggedInUser.specialized_ai_applications || []);
      setSelectedTools(loggedInUser.ai_tools || []);
      setWorkerEmail(loggedInUser.email || '');
      setWorkerGithubUrl(loggedInUser.github_url || '');
      setAnonymize(loggedInUser.anonymize || false)
      setWorkerUsageKeys(loggedInUser.usage_keys || []);
    }
  }, [loggedInUser]);

  if (!workerOptions) {
    return <Loading />;
  }

  const handleSelect = (item, setSelected, selected) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else if (selected.length < 4) {
      setSelected([...selected, item]);
    }
  };

  const handleUpdate = async () => {
    // Check if at least one item is selected in each category
    if (selectedLangs.length === 0) {
      openSnackbar('Please select at least one programming language.', 'error');
      return;
    }

    if (selectedBranches.length === 0) {
      openSnackbar('Please select at least one AI branch.', 'error');
      return;
    }

    if (selectedApps.length === 0) {
      openSnackbar('Please select at least one AI specialty.', 'error');
      return;
    }

    if (selectedTools.length === 0) {
      openSnackbar('Please select at least one AI tool.', 'error');
      return;
    }

    if (workerEmail.length === 0 || (workerEmail.length > 0 && !workerEmail.includes('@'))) {
      openSnackbar('Your Email Address is Invalid', 'error');
      return;
    }

    if (workerGithubUrl.length > 0 && !workerGithubUrl.includes('github')) {
      openSnackbar('Your Github URL is Invalid', 'error');
      return;
    }

    const cleansedGithubUrl = workerGithubUrl.length === 0 ? '' : 'github' + workerGithubUrl.split('github')[1];

    try {
      const formData = new FormData();
      formData.append('workerId', loggedInUser.id);
      formData.append('programmingLanguagesIds', JSON.stringify(selectedLangs));
      formData.append('generalizedAiBranches', JSON.stringify(selectedBranches));
      formData.append('specializedAiApplicationsIds', JSON.stringify(selectedApps));
      formData.append('aiToolsIds', JSON.stringify(selectedTools));
      formData.append('workerEmail', workerEmail);
      formData.append('workerGithubUrl', cleansedGithubUrl);
      formData.append('anonymize', anonymize);

      // Log each entry in the FormData
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Send data to the backend for updating the worker profile
      const updateResponse = await axios.post(`${isProduction ? '' : 'http://localhost'}/updateWorker`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      if (updateResponse.data.success) {
          openSnackbar('Worker profile updated successfully!', 'success');
          setLoggedInUser(updateResponse.data.updatedUser);
      } else {
          openSnackbar('Worker profile update failed. Please check your data.', 'error');
      }
    } catch (error) {
      console.error('Error updating worker profile:', error);
      openSnackbar('Failed to update worker profile.', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`${isProduction ? '' : 'http://localhost'}/deleteWorker/${loggedInUser.id}`, {
        data: { name: loggedInUser.name },
        withCredentials: true
      });
      if (response.data.success) {
        openSnackbar('Account deleted successfully!', 'success');
        // Handle user logout or redirection after deletion
        setTimeout(()=>{ 
          logout();
          navigate('/');
        },1000);
      } else {
        openSnackbar('Failed to delete account.', 'error');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      openSnackbar('Failed to delete account.', 'error');
    }
  };

  return (
    <div className="worker-dashboard-container">
      <StarrySky />

      <div className="dashboard-page-in-progress-container">
        <div className="worker-dashboard-header">
          {loggedInUser && (
            <CustomCard
              worker={loggedInUser}
              workerOptions={workerOptions}
              workerEmail={workerEmail}
              workerGithubUrl={workerGithubUrl}
              anonymize={anonymize}
              setWorkerEmail={setWorkerEmail}
              setWorkerGithubUrl={setWorkerGithubUrl}
              setAnonymize={setAnonymize}
            />
          )}

          <div className="worker-feed">
            <Grid container spacing={0} justifyContent="center" sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', columnGap: '5px', rowGap: '5px' }}>
              {workerOptions.programming_languages.map(lang => (
                <Grid item key={lang.id}>
                  <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>{lang.name.charAt(0).toUpperCase() + lang.name.slice(1)}</span>}>
                    <StyledChip
                      label={<img src={lang.icon_url} alt={lang.name} style={{ width: 24, height: 24 }} />}
                      variant="outlined"
                      clickable
                      selected={selectedLangs.includes(lang.id)}
                      onClick={() => handleSelect(lang.id, setSelectedLangs, selectedLangs)}
                      shadowcolor="#00ff00"
                      sx={{ borderColor: '#00ff00', height: 50, width: 50 }}
                    />
                  </Tippy>
                </Grid>
              ))}
            </Grid>
            <Grid container spacing={0} justifyContent="center" sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', columnGap: '5px', rowGap: '5px', marginTop: 1 }}>
              {workerOptions.generalized_ai_branches.map(branch => (
                <Grid item key={branch.id}>
                  <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>{branch.name}</span>}>
                    <StyledChip
                      label={<Avatar sx={{ bgcolor: 'blue', height: 30, width: 30 }}><span style={{ fontFamily: 'Orbitron', fontSize: '12px'}}>{getInitials(branch.name)}</span></Avatar>}
                      variant="outlined"
                      clickable
                      selected={selectedBranches.includes(branch.id)}
                      onClick={() => handleSelect(branch.id, setSelectedBranches, selectedBranches)}
                      shadowcolor="#007bff"
                      sx={{ borderColor: '#007bff', height: 50, width: 50 }}
                    />
                  </Tippy>
                </Grid>
              ))}
            </Grid>
            <Grid container spacing={0} justifyContent="center" sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', columnGap: '5px', rowGap: '5px', marginTop: 1 }}>
              {workerOptions.specialized_ai_applications.map(app => (
                <Grid item key={app.id}>
                  <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>{app.name}</span>}>
                    <StyledChip
                      label={<img src={app.icon_url} alt={app.name} style={{ width: 30, height: 30 }} />}
                      variant="outlined"
                      clickable
                      selected={selectedApps.includes(app.id)}
                      onClick={() => handleSelect(app.id, setSelectedApps, selectedApps)}
                      shadowcolor="#8e44ad"
                      sx={{ borderColor: '#8e44ad', height: 50, width: 50, pr: 0, pl: 0 }}
                    />
                  </Tippy>
                </Grid>
              ))}
            </Grid>
            <Grid container spacing={0} justifyContent="center" sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', columnGap: '5px', rowGap: '5px', marginTop: 1 }}>
              {workerOptions.ai_tools.map(tool => (
                <Grid item key={tool.id}>
                  <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>{tool.name}</span>}>
                    <StyledChip
                      label={<img src={tool.icon_url} alt={tool.name} style={{ width: 24, height: 24 }} />}
                      variant="outlined"
                      clickable
                      selected={selectedTools.includes(tool.id)}
                      onClick={() => handleSelect(tool.id, setSelectedTools, selectedTools)}
                      shadowcolor="#f39c12"
                      sx={{ borderColor: '#f39c12', height: 50, width: 50 }}
                    />
                  </Tippy>
                </Grid>
              ))}
            </Grid>
          </div>
        </div>

        <div style={{ display: 'flex', flexFlow: 'row', marginTop: '1.5rem', justifyContent: 'space-between', width: '100%' }}>
          <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', color: 'white', border: '1px solid blue', marginRight: '1.5rem' }} onClick={handleUpdate}>
            Update
          </Button>
          <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'red', color: 'white' }} onClick={() => setIsDeleteModalOpen(true)}>
            Delete Account
          </Button>
        </div>
        <div style={{ display: 'flex', flexFlow: 'column', marginTop: '1.5rem', justifyContent: 'center', width: '100%' }}>
        <Typography sx={{textAlign: 'center', fontFamily: 'Orbitron, Roboton, sans-serif', color: 'turquoise', fontWeight: 'bold'}}>Usage Keys</Typography>
              <div className="usage-keys-container no-scrollbar">
                { workerUsageKeys.length > 0 && (
                  <>
                    { workerUsageKeys.map((usageKey) => (
                      <p key={usageKey.key}>{usageKey.key}</p>
                    )) }
                  </>
                ) }
              </div>
        </div>
      </div>

      <ControlsDashboard />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default WorkerDashboardPage;
