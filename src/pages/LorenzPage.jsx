import React, { useState, useEffect } from 'react';
import './LorenzPage.css';
import { Modal, Card, CardContent, Typography, Avatar, Box, Grid, Button, IconButton, TextField, useTheme, useMediaQuery } from '@mui/material';
import ControlsDashboard from '../components/ControlsDashboard';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import StarrySky from '../components/StarrySky';  // Ensure the correct path
import axios from 'axios';
import { useGlitch } from 'react-powerglitch';

const StyledTextField = styled(TextField)({
  margin: '10px auto', 
  '& input': {
    color: 'rgba(3, 77, 161, 0.8)',
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '12px',
    height: '30px',
    padding: '0 14px', 
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    '&::placeholder': {
      color: 'rgba(3, 77, 161, 0.8)',
      fontSize: '12px',
    },
  },
  '& .MuiInputBase-inputMultiline': {
    overflow: 'scroll',  // Enable scrolling
    '&::-webkit-scrollbar': {
      display: 'none',  // Hide the scrollbar
    },
    '-ms-overflow-style': 'none',  // Internet Explorer 10+
    'scrollbar-width': 'none',  // Firefox
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(3, 77, 161, 0.8)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(3, 77, 161, 0.8)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(3, 77, 161, 0.8)',
    },
    height: '130px', 
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'flex-start', 
    color: 'white',
  },
  '.MuiFormLabel-root': {
    display: 'none',
  },
});

function LorenzPage() {

  const [inferenceStatus, setInferenceStatus] = useState(false);
  const [inferenceInput, setInferenceInput] = useState('')
  const [inferenceOutput, setInferenceOutput] = useState('');

  const buttonGlitch = useGlitch({
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
      duration: 500
    },
    glitchMode: 'none'
  });

  useEffect(() => {
    if (inferenceStatus) {
      buttonGlitch.startGlitch();
    } else {
      buttonGlitch.stopGlitch();
    }
  }, [inferenceStatus]);

  const handleInference = async () => {
    try {
      setInferenceStatus(true);
      const input_text = inferenceInput;
  
      // Send input data to the backend for inference
      const response = await axios.post('http://localhost:3001/runInferenceWithPhi3Mini', { input_text }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      // Log the response
      console.log('Inference Response:', response);
  
      if (response.data.success) {
        // Update inference output
        setInferenceOutput(response.data.output);
      } else {
        // Handle failure in inference
        alert('Inference failed. Please check your input data.');
      }
    } catch (error) {
      console.error('Error during inference:', error);
      alert('Failed to process inference.');
    } finally {
      setInferenceStatus(false);
    }
  };

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
        <div className="lorenz-container">
            <div className="lorenz-header">
                <div className="lorenz-logo-container">
                    <img src="/lorenz-logo.png" alt="Lorenz Logo" style={{ width: 40, height: 40, marginRight: '.5rem' }} />
                    <h1>Lorenz</h1>
                </div>
                <div className="lorenz-description-container">
                    <p>
                        Lorenz is envisioned as an advanced LLM (Large Language Model) designed to tackle humanity's most pressing issues 
                        using the latest on AI research and tools, as well as being built, in part, by our platform's workers. While Lorenz is still under development, 
                        we are utilizing the small but powerful <b>Phi 3 Mini 4K Instruct</b> model, which offers impressive capabilities and serves as a stepping 
                        stone toward our ultimate goal.
                    <br />
                        Below, you can experience a 3D animation showcasing the dynamics present during the inference process. 
                        This demonstration uses tSNE and react-three-fiber to visualize the intricacies of the model's behavior in real-time. 
                        As we continue to develop Lorenz, this visualization will provide valuable insights into its learning and inference mechanisms.
                    </p>
                </div>
            </div>

            <div className="lorenz-visualization">

            </div>

            <div className="lorenz-footer">
                <StyledTextField
                    fullWidth
                    multiline
                    maxRows={4}
                    variant="outlined"
                    placeholder="Inference input"
                    value={inferenceInput}
                    onChange={e => setInferenceInput(e.target.value)}
                    sx={{ marginBottom: 2 }}
                />
                <Button
                 variant="contained"
                 color="primary"
                 sx={{
                  marginRight: '1rem',
                  marginLeft: '1rem',
                  width: '200px',
                  fontFamily: 'Roboto',
                  background: 'blue',
                  '&.Mui-disabled': {
                    color: 'white', // Customize the text color when disabled
                    background: 'blue', // Linear gradient background
                  }
                 }}
                 onClick={() => { handleInference() }}
                 disabled={inferenceStatus}
                 ref={inferenceStatus ? buttonGlitch.ref : null}
                 >
                    Inference
                </Button>
                <StyledTextField
                    fullWidth
                    multiline
                    maxRows={4}
                    variant="outlined"
                    placeholder="Inference output"
                    value={inferenceOutput}
                    sx={{ marginBottom: 2 }}
                    InputProps={{
                      readOnly: true,
                    }}
                />
            </div>
        </div>

        <ControlsDashboard />
    </div>
  );
}

export default LorenzPage;