import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { styled } from '@mui/system';
import { Button, TextField, CircularProgress, Typography } from '@mui/material';
import { useNotification } from '../context/NotificationContext';
import StarrySky from '../components/StarrySky';
import ControlsDashboard from '../components/ControlsDashboard';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CycloneIcon from '@mui/icons-material/Cyclone';
import axios from 'axios';
import '../App.css';
import './SubmitIssuePage.css';

const isProduction = import.meta.env.MODE === 'production';

const colors = {
  background: '#000000',
  turquoise: '#00B2AA',
  purple: '#7D26CD',
  vividBlue: '#007FFF',
  yellow: '#FFD700',
  green: '#00CC00'
};

const StyledTextField = styled(TextField)({
  width: '100%',
  maxWidth: '100% !important',
  margin: '10px auto',
  '& input': {
    color: 'white',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '12px',
    height: '30px',
    padding: '0 14px',
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
      borderColor: colors.turquoise,
    },
    '&:hover fieldset': {
      borderColor: colors.turquoise,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.turquoise,
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

const StyledButton = styled(Button)({
  width: '100px',
  marginBottom: '1.5rem',
  backgroundColor: colors.background,
  borderColor: colors.turquoise,
  color: colors.turquoise,
  fontFamily: 'Orbitron, sans-serif',
  '&:hover': {
    backgroundColor: colors.turquoise,
    color: colors.background,
  },
});

function isValidTitle(title) {
  return title.length > 0;
}

function isValidContext(context) {
  return context.length > 0;
}

function isValidUsageKey(key) {
  return key.length > 0;
}

function SubmitIssuePage({ workers, workerOptions, setWorkers }) {
  const { loggedInUser } = useContext(AuthContext);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueContext, setIssueContext] = useState('');
  const [usageKey, setUsageKey] = useState('');
  const [issueTitleError, setIssueTitleError] = useState('');
  const [issueContextError, setIssueContextError] = useState('');
  const [usageKeyError, setUsageKeyError] = useState('');
  const [loading, setLoading] = useState(false);

  const { openSnackbar } = useNotification();

  const handleIssueTitleChange = (event) => {
    const title = event.target.value;
    setIssueTitle(title);
    if (!isValidTitle(title)) {
      setIssueTitleError('Please enter a valid issue title.');
    } else {
      setIssueTitleError('');
    }
  };

  const handleIssueContextChange = (event) => {
    const context = event.target.value;
    setIssueContext(context);
    if (!isValidContext(context)) {
      setIssueContextError('Please enter a valid issue context.');
    } else {
      setIssueContextError('');
    }
  };

  const handleUsageKeyChange = (event) => {
    const key = event.target.value;
    setUsageKey(key);
    if (!isValidUsageKey(key)) {
      setUsageKeyError('Please enter a valid usage key.');
    } else {
      setUsageKeyError('');
    }
  };

  const handleSubmit = async () => {
    // Reset errors
    setIssueTitleError('');
    setIssueContextError('');
    setUsageKeyError('');

    // Validate inputs
    if (!isValidTitle(issueTitle)) {
      setIssueTitleError('Please enter a valid issue title.');
      return;
    }
    if (!isValidContext(issueContext)) {
      setIssueContextError('Please enter a valid issue context.');
      return;
    }
    if (!isValidUsageKey(usageKey)) {
      setUsageKeyError('Please enter a valid usage key.');
      return;
    }

    try {
      setLoading(true);

      const data = {
        issueTitle,
        issueContext,
        usageKey,
        workerId: loggedInUser ? loggedInUser.id : null,
      }

      const response = await axios.post(`${isProduction ? '' : 'http://localhost'}/submitIssue`, data, { withCredentials: true });

      if (response.data.success) {
        console.log('Issue submitted successfully:', response.data);
        openSnackbar(response.data.message, 'success');
        // Handle successful submission (e.g., show success message, clear form)
      } else {
        console.error('Issue submission failed:', response.data.message);
        openSnackbar(response.data.message, 'error');
        // Handle submission failure (e.g., show error message)
      }
    } catch (error) {
      console.error('Error submitting issue:', error);
      openSnackbar('Error submitting issue', 'error');
      // Handle error in submission (e.g., show error message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100%',
      overflow: 'auto',
      '::WebkitScrollbar': { display: 'none' },
      msOverflowStyle: 'none',
      scrollbarWidth: 'none',
      background: 'black'
    }}>
      <StarrySky />
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        zIndex: 2,
      }}>
        <div className="submit-issue-container">
          <StyledTextField
            placeholder="Issue Title"
            variant="outlined"
            fullWidth
            sx={{ backgroundColor: 'black', maxWidth: '50%', margin: '10px auto', marginBottom: '.1rem !important' }}
            value={issueTitle}
            onChange={handleIssueTitleChange}
            error={!!issueTitleError}
            helperText={issueTitleError}
          />
          <StyledTextField
            placeholder="Issue Context"
            variant="outlined"
            fullWidth
            multiline
            rows={8}
            sx={{ backgroundColor: 'black', maxWidth: '50%', margin: '10px auto', marginBottom: '.1rem !important' }}
            value={issueContext}
            onChange={handleIssueContextChange}
            error={!!issueContextError}
            helperText={issueContextError}
          />
          <StyledTextField
            placeholder="Usage Key"
            variant="outlined"
            fullWidth
            sx={{ backgroundColor: 'black', maxWidth: '50%', margin: '10px auto', marginBottom: '.1rem !important' }}
            value={usageKey}
            onChange={handleUsageKeyChange}
            error={!!usageKeyError}
            helperText={usageKeyError}
          />
          <StyledButton variant="outlined" sx={{ marginTop: 4 }} onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </StyledButton>
          <div style={{ display: 'flex', flexFlow: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <Button variant="contained" href="/task-viewer" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue', marginRight: '0.5rem' }}>
              <PendingActionsIcon sx={{ marginRight: '0.5rem' }} />Task Viewer
            </Button>
            <Button variant="contained" href="/issue-viewer" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue', marginRight: '0.5rem' }}>
              <CycloneIcon sx={{ marginRight: '0.5rem' }} />Issue Viewer
            </Button>
          </div>
        </div>
      </div>
      <ControlsDashboard workerOptions={workerOptions} setWorkers={setWorkers} workers={workers} />
    </div>
  );
}

export default SubmitIssuePage;
