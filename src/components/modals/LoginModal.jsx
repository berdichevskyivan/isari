import React, { useState, useContext } from 'react';
import '../../App.css';
import { styled } from '@mui/material/styles';
import AuthContext from '../../context/AuthContext';
import { Modal, Typography, Box, Button, TextField } from '@mui/material';

const StyledTextField = styled(TextField)({
  width: '320px',
  margin: '10px auto',
  border: 'none !important',
  '& .MuiOutlinedInput-input': {
    color: '#00e6da',
    fontFamily: 'Orbitron',
  },
  '& .MuiOutlinedInput-root': {
    border: 'none',
    marginBottom: '.5rem',
    '& fieldset': {
      borderColor: 'turquoise', // default border color
      borderRadius: '5px'
    },
    '&:hover fieldset': {
      borderColor: 'turquoise', // border color on hover
    },
    '&.Mui-focused fieldset': {
      borderColor: 'turquoise', // border color on focus
    },
  },
  '.MuiFormLabel-root': {
    display: 'none',
  },
});

function LoginModal({ open, onClose }) {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleInputChange = (setter, errorSetter) => (e) => {
    const value = e.target.value;
    setter(value);
    if (value.trim() === '') {
      errorSetter('This field is required');
    } else {
      errorSetter('');
    }
  };

  const handleLogin = () => {
    if (email.trim() === '' || password.trim() === '') {
      if (email.trim() === '') setEmailError('This field is required');
      if (password.trim() === '') setPasswordError('This field is required');
      return;
    }
    login(email, password);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="login-modal-container">
        <Typography variant="h6" component="h2" sx={{ marginBottom: 1, fontFamily: 'Orbitron' }}>
          Login
        </Typography>
        <StyledTextField
          fullWidth
          variant="outlined"
          placeholder="Email"
          value={email}
          onChange={handleInputChange(setEmail, setEmailError)}
          sx={{ marginBottom: 0, border: '1px solid turquoise' }}
          error={Boolean(emailError)}
          helperText={emailError}
        />
        <StyledTextField
          fullWidth
          variant="outlined"
          type="password"
          placeholder="Password"
          value={password}
          onChange={handleInputChange(setPassword, setPasswordError)}
          sx={{ marginBottom: 2, border: '1px solid turquoise' }}
          error={Boolean(passwordError)}
          helperText={passwordError}
          InputProps={{
            inputProps: {
              style: {
                fontFamily: password === '' ? 'Orbitron' : 'monospace',
                WebkitTextSecurity: 'disc !important',
              },
            },
          }}
        />
        <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }} onClick={handleLogin}>
          Login
        </Button>
      </Box>
    </Modal>
  );
}

export default LoginModal;
