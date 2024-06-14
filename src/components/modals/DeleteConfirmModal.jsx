// src/modals/DeleteConfirmModal.jsx
import React from 'react';
import { Modal, Box, Button, Typography } from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'rgba(0, 0, 0, 0.8)', // Background color similar to the Feedback modal
  border: '2px solid #00B2AA', // Border color from the Feedback modal
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: '8px', // Rounded corners
};

const buttonStyle = {
  margin: '0 10px',
  fontFamily: 'Orbitron, sans-serif',
  fontSize: '14px',
  padding: '10px 20px',
  borderRadius: '4px',
  width: '80px'
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ color: '#00B2AA', fontFamily: 'Orbitron', textAlign: 'center' }}>
          Confirm Delete
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2, color: '#FFFFFF', fontFamily: 'Orbitron', textAlign: 'center' }}>
          Are you sure you want to delete your account?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" color="error" sx={{ ...buttonStyle, backgroundColor: 'red', border: '1px solid #FF0000' }} onClick={onConfirm}>Yes</Button>
          <Button variant="contained" color="primary" sx={{ ...buttonStyle, backgroundColor: 'blue', border: '1px solid #0000FF' }} onClick={onClose}>No</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteConfirmModal;
