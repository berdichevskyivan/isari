import React, { useState } from 'react';
import { Button, TextField, Avatar, Chip, Grid, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import ControlsDashboard from '../components/ControlsDashboard';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

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
const StyledChip = styled(Chip)(({ selected, shadowColor }) => ({
  margin: '4px',
  boxShadow: selected ? `0 0 10px ${shadowColor}` : 'none',
  borderColor: selected ? shadowColor : '#ccc',
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
  width: '250px', // Set to a smaller width (you can adjust this value)
  margin: '10px auto', // Add margin to center and space out the text field
  '& input': {
    color: colors.turquoise,
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '12px',
    height: '30px', // Set the height (adjust as needed)
    padding: '0 14px', // Adjust padding to vertically center text
    boxSizing: 'border-box', // Ensure padding is included in the height calculation
    display: 'flex',
    alignItems: 'center', // Vertically center the text
    '&::placeholder': {
      color: colors.turquoise, // Set the color of the placeholder text
      fontSize: '12px', // Set the size of the placeholder text
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
    height: '40px', // Ensure the outer container matches the input height
    display: 'flex',
    alignItems: 'center', // Vertically center the text within the input field
  },
  '.MuiFormLabel-root': {
    display: 'none', // Remove the label
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

const icons = {
  python: '/src/assets/icons/python.svg',
  javascript: '/src/assets/icons/javascript.svg',
  r: '/src/assets/icons/r.svg',
  java: '/src/assets/icons/java.svg',
  cplusplus: '/src/assets/icons/cplusplus.svg',
  typescript: '/src/assets/icons/typescript.svg',
  kotlin: '/src/assets/icons/kotlin.svg',
  swift: '/src/assets/icons/swift.svg',
  scala: '/src/assets/icons/scala.svg',
  julia: '/src/assets/icons/julia.svg',
  ml: 'ML',
  dl: 'DL',
  nlp: 'NLP',
  cv: 'CV',
  robotics: 'R',
  ds: 'DS',
  healthcare: '/src/assets/icons/healthcare.png',
  gaming: '/src/assets/icons/gaming.png',
  finance: '/src/assets/icons/finance.png',
  av: '/src/assets/icons/autonomous-vehicles.png',
  quantum: '/src/assets/icons/quantum-ai.png',
  security: '/src/assets/icons/security.png',
  edge: '/src/assets/icons/edge-ai.png',
  gpt: '/src/assets/icons/gpt.svg',
  llama: '/src/assets/icons/mistral.svg',
  pytorch: '/src/assets/icons/pytorch.svg',
  tensorflow: '/src/assets/icons/tensorflow.svg',
  gemini: '/src/assets/icons/gemini.svg',
  mistral: '/src/assets/icons/mistral.svg',
  'github-copilot': '/src/assets/icons/github-copilot.svg',
  opencv: '/src/assets/icons/opencv.svg',
  'apache-kafka': '/src/assets/icons/apachekafka.svg'
};

function CreateWorkerPage() {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState('');
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedApps, setSelectedApps] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);

  const handleProfilePicChange = (e) => {
    setProfilePic(URL.createObjectURL(e.target.files[0]));
  };

  const handleSelect = (item, setSelected, selected) => {
    if (selected.includes(item)) {
      setSelected(selected.filter(i => i !== item));
    } else if (selected.length < 4) {
      setSelected([...selected, item]);
    }
  };

  const programmingLanguages = ['python', 'javascript', 'r', 'java', 'cplusplus', 'typescript', 'kotlin', 'swift', 'scala', 'julia'];
  const generalizedAI = ['ml', 'dl', 'nlp', 'cv', 'r', 'ds'];
  const specializedAI = ['healthcare', 'gaming', 'finance', 'av', 'quantum', 'security', 'edge'];
  const aiTools = ['gpt', 'llama', 'pytorch', 'tensorflow', 'gemini', 'mistral', 'github-copilot', 'opencv', 'apache-kafka'];

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
            {programmingLanguages.map(lang => (
              <Grid item key={lang}>
                <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</span>}>
                  <StyledChip
                    label={<img src={icons[lang]} alt={lang} style={{ width: 24, height: 24 }} />}
                    variant="outlined"
                    clickable
                    selected={selectedLangs.includes(lang)}
                    onClick={() => handleSelect(lang, setSelectedLangs, selectedLangs)}
                    shadowColor={colors.green}
                    sx={{ borderColor: colors.green, height: 50, width: 50 }}
                  />
                </Tippy>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={1} justifyContent="center" sx={{ marginTop: 2 }}>
            {generalizedAI.map(branch => (
              <Grid item key={branch}>
                <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>{branch === 'ml' ? 'Machine Learning' : branch === 'dl' ? 'Deep Learning' : branch === 'nlp' ? 'Natural Language Processing' : branch === 'cv' ? 'Computer Vision' : branch === 'r' ? 'Robotics' : 'Data Science'}</span>}>
                  <StyledChip
                    label={<Avatar sx={{ bgcolor: 'blue', height: 30, width: 30 }}><span style={{ fontFamily: 'Orbitron', fontSize: '12px'}}>{branch.toUpperCase()}</span></Avatar>}
                    variant="outlined"
                    clickable
                    selected={selectedBranches.includes(branch)}
                    onClick={() => handleSelect(branch, setSelectedBranches, selectedBranches)}
                    shadowColor={colors.vividBlue}
                    sx={{ borderColor: colors.vividBlue, height: 50, width: 50 }}
                  />
                </Tippy>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={1} justifyContent="center" sx={{ marginTop: 2 }}>
            {specializedAI.map(app => (
              <Grid item key={app}>
                <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>{app !== 'av' ? app.charAt(0).toUpperCase() + app.slice(1) : "Autonomous Vehicles"}</span>}>
                  <StyledChip
                    label={<img src={icons[app]} alt={app} style={{ width: 24, height: 24 }} />}
                    variant="outlined"
                    clickable
                    selected={selectedApps.includes(app)}
                    onClick={() => handleSelect(app, setSelectedApps, selectedApps)}
                    shadowColor={colors.purple}
                    sx={{ borderColor: colors.purple, height: 50, width: 50, pr: 0, pl: 0 }}
                  />
                </Tippy>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={1} justifyContent="center" sx={{ marginTop: 2 }}>
            {aiTools.map(tool => (
              <Grid item key={tool}>
                <Tippy content={<span style={{ fontFamily: 'Orbitron' }}>{tool.charAt(0).toUpperCase() + tool.slice(1).replace('-', ' ')}</span>}>
                  <StyledChip
                    label={<img src={icons[tool]} alt={tool} style={{ width: 24, height: 24 }} />}
                    variant="outlined"
                    clickable
                    selected={selectedTools.includes(tool)}
                    onClick={() => handleSelect(tool, setSelectedTools, selectedTools)}
                    shadowColor={colors.yellow}
                    sx={{ borderColor: colors.yellow, height: 50, width: 50 }}
                  />
                </Tippy>
              </Grid>
            ))}
          </Grid>
          <StyledButton variant="outlined" sx={{ marginTop: 4 }}>Submit</StyledButton>
        </Box>
      </div>
    </ThemeProvider>
  );
}

export default CreateWorkerPage;
