import React from 'react';
import { Modal, Typography, Box, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledBox = styled(Box)({
  backgroundColor: '#000',
  color: '#00e6da',
  border: '1px solid turquoise',
  borderRadius: '10px',
  padding: '20px',
  width: '400px',
  margin: 'auto',
  fontFamily: 'Roboto',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  flexFlow: 'column',
  textAlign: 'center',
  '& p': {
    fontFamily: 'Roboto',
  },
  '& h2': {
    fontFamily: 'Roboto',
  }
});

function DonateModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose}>
    <StyledBox>
        <Typography variant="h6" component="h2" sx={{ marginBottom: 2, textAlign: 'center' }}>
        Your support is vital for the success of this initiative ❤️
        </Typography>
        <Typography sx={{ marginBottom: 2 }}>
        If you would like to contribute, please contact me via email at isari.project@gmail.com
        to discuss the details of how to make a donation. This approach ensures that we handle your contributions securely and directly.
        </Typography>
        <Typography sx={{ marginBottom: 2 }}>
        I sincerely appreciate your support. 🙏
        </Typography>
        <Typography sx={{ fontSize: '12px' }}>
        (As other methods of funding become available, I'll update it here)
        </Typography>
        <Button variant="contained" sx={{ marginTop: 2, fontFamily: 'Orbitron', background: 'black', border: '1px solid blue' }} onClick={onClose}>
        Close
        </Button>
    </StyledBox>
    </Modal>
  );
}

export default DonateModal;
