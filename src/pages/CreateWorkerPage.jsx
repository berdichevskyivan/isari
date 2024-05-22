import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Avatar, Chip, Grid, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import ControlsDashboard from '../components/ControlsDashboard';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Loading from '../components/Loading';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

function getInitials(name) {
  return name.split(' ').map(word => word[0]).join('').toUpperCase();
}

const colors = {
  background: '#000000',
  turquoise: '#00B2AA',
  purple: '#7D26CD',
  vividBlue: '#007FFF',
  yellow: '#FFD700',
  green: '#00CC00'
};

const theme = createTheme({
  typography: {
    fontFamily: 'Orbitron, sans-serif',
  },
});

// Styled components for visual cues
const StyledChip = styled(Chip)(({ selected, shadowcolor }) => ({
  margin: '4px',
  boxShadow: selected ? `0 0 10px ${shadowcolor}` : 'none',
  borderColor: selected ? shadowcolor : '#ccc',
  borderRadius: '50%',
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
  width: '250px', 
  margin: '10px auto', 
  '& input': {
    color: colors.turquoise,
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '12px',
    height: '30px',
    padding: '0 14px', 
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center', 
    '&::placeholder': {
      color: colors.turquoise,
      fontSize: '12px',
    },
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: colors.turquoise,
    },
    '&:hover fieldset': {
      borderColor: colors.turquoise,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.turquoise,
    },
    height: '40px', 
    display: 'flex',
    alignItems: 'center', 
  },
  '.MuiFormLabel-root': {
    display: 'none',
  },
});

const StyledButton = styled(Button)({
  backgroundColor: colors.background,
  borderColor: colors.turquoise,
  color: colors.turquoise,
  fontFamily: 'Orbitron, sans-serif',
  '&:hover': {
    backgroundColor: colors.turquoise,
    color: colors.background,
  },
});

function CreateWorkerPage({ workerOptions }) {
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedApps, setSelectedApps] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(URL.createObjectURL(file));
    setProfilePicFile(file);
  };

  const handleSelect = (item, setSelected, selected) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else if (selected.length < 4) {
      setSelected([...selected, item]);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('programmingLanguagesIds', JSON.stringify(selectedLangs));
      formData.append('generalizedAiBranches', JSON.stringify(selectedBranches));
      formData.append('specializedAiApplicationsIds', JSON.stringify(selectedApps));
      formData.append('aiToolsIds', JSON.stringify(selectedTools));
  
      if (profilePicFile) {
        formData.append('profilePic', profilePicFile);
      }
  
      // Log each entry in the FormData
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
  
      // Send data to Python backend for analysis
      const analysisResponse = await axios.post('http://localhost:3001/analyzeWorkerData', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('analysisResponse', analysisResponse);
  
      // Evaluate the response from the Python backend
      if (analysisResponse.data.success) {
        // If analysis is successful, submit the form data to createWorker
        const createWorkerResponse = await axios.post('http://localhost:3000/createWorker', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Worker created successfully!');
      } else {
        // Handle failure in analysis
        alert('Worker analysis failed. Please check your data.');
      }
    } catch (error) {
      console.error('Error processing worker data:', error);
      alert('Failed to process worker data.');
    }
  };

  if (!workerOptions) {
    return <Loading />;
  }

  return (
    <ThemeProvider theme={theme}>
      <div style={{ backgroundColor: colors.background, color: 'white', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <ControlsDashboard />
        <Box sx={{ width: '90%', maxWidth: '90%', textAlign: 'center', marginTop: 2 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="profile-pic-upload"
            type="file"
            onChange={handleProfilePicChange}
          />
          <label htmlFor="profile-pic-upload">
            <Avatar 
              src={profilePic || '/path/to/default/avatar.svg'} 
              sx={{ width: 100, height: 100, margin: '10px auto', cursor: 'pointer', boxShadow: `0 0 10px ${colors.turquoise}`, borderRadius: '50%' }}
            />
          </label>
          <StyledTextField
            placeholder="Full Name"
            variant="outlined"
            fullWidth
            sx={{ marginBottom: 2, backgroundColor: 'black', maxWidth: '50%', margin: '10px auto' }}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Grid container spacing={1} justifyContent="center">
            {workerOptions.programming_languages.map(lang => (
              <Grid item key={lang.id}>
                <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>{lang.name.charAt(0).toUpperCase() + lang.name.slice(1)}</span>}>
                  <StyledChip
                    label={<img src={lang.icon_url} alt={lang.name} style={{ width: 24, height: 24 }} />}
                    variant="outlined"
                    clickable
                    selected={selectedLangs.includes(lang.id)}
                    onClick={() => handleSelect(lang.id, setSelectedLangs, selectedLangs)}
                    shadowcolor={colors.green}
                    sx={{ borderColor: colors.green, height: 50, width: 50 }}
                  />
                </Tippy>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={1} justifyContent="center" sx={{ marginTop: 2 }}>
            {workerOptions.generalized_ai_branches.map(branch => (
              <Grid item key={branch.id}>
                <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>{branch.name}</span>}>
                  <StyledChip
                    label={<Avatar sx={{ bgcolor: 'blue', height: 30, width: 30 }}><span style={{ fontFamily: 'Orbitron', fontSize: '12px'}}>{getInitials(branch.name)}</span></Avatar>}
                    variant="outlined"
                    clickable
                    selected={selectedBranches.includes(branch.id)}
                    onClick={() => handleSelect(branch.id, setSelectedBranches, selectedBranches)}
                    shadowcolor={colors.vividBlue}
                    sx={{ borderColor: colors.vividBlue, height: 50, width: 50 }}
                  />
                </Tippy>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={1} justifyContent="center" sx={{ marginTop: 2 }}>
            {workerOptions.specialized_ai_applications.map(app => (
              <Grid item key={app.id}>
                <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>{app.name}</span>}>
                  <StyledChip
                    label={<img src={app.icon_url} alt={app.name} style={{ width: 24, height: 24 }} />}
                    variant="outlined"
                    clickable
                    selected={selectedApps.includes(app.id)}
                    onClick={() => handleSelect(app.id, setSelectedApps, selectedApps)}
                    shadowcolor={colors.purple}
                    sx={{ borderColor: colors.purple, height: 50, width: 50, pr: 0, pl: 0 }}
                  />
                </Tippy>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={1} justifyContent="center" sx={{ marginTop: 2 }}>
            {workerOptions.ai_tools.map(tool => (
              <Grid item key={tool.id}>
                <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>{tool.name}</span>}>
                  <StyledChip
                    label={<img src={tool.icon_url} alt={tool.name} style={{ width: 24, height: 24 }} />}
                    variant="outlined"
                    clickable
                    selected={selectedTools.includes(tool.id)}
                    onClick={() => handleSelect(tool.id, setSelectedTools, selectedTools)}
                    shadowcolor={colors.yellow}
                    sx={{ borderColor: colors.yellow, height: 50, width: 50 }}
                  />
                </Tippy>
              </Grid>
            ))}
          </Grid>
          <StyledButton variant="outlined" sx={{ marginTop: 4 }} onClick={handleSubmit}>Submit</StyledButton>
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default CreateWorkerPage;
