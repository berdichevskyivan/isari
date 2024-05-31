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
    height: '100px', 
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
      const response = await axios.post('http://localhost:3001/runInference', { input_text }, {
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
                    <p>Lorenz is an LLM model built specifically to solve the most pressing issues of humanity using science and a special approach to learning that involves Chaos
                    Control and quantum physics principles. Below, you will be able to watch a 3D animation based on the dynamics that are present during the inference and training of the model.
                    On this specific demonstration, we will visualize the inference process.</p>
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
                    background: 'linear-gradient(90deg, var(--magic-rainbow-color-0), var(--magic-rainbow-color-1), var(--magic-rainbow-color-2)) !important', // Linear gradient background
                    animation: 'shift 1s infinite linear' // Optional animation property
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