import React from 'react';
import { Card, CardContent, Typography, Avatar, Box, FormControlLabel, Checkbox, TextField } from '@mui/material';
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

const isProduction = import.meta.env.MODE === 'production';

function CustomCard({ worker, workerOptions, workerEmail, workerGithubUrl, anonymize, setWorkerEmail, setWorkerGithubUrl, setAnonymize }) {

    return (
      <>
        <Card sx={{ width: 250, height: 'fit-available', m: 0, mr: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.5)', overflow: 'hidden' }} className="worker-card">
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

export default CustomCard;