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

function BankInfoModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose}>
    <StyledBox>
        <Typography variant="h6" component="h2" sx={{ marginBottom: 2, textAlign: 'center' }}>
        Support Our Project ❤️
        </Typography>
        <Typography sx={{ marginBottom: 2 }}>
        Hello, my name is <b>Ivan Berdichevsky</b>, and I am the founder of <b>Isari</b>, a collaborative platform dedicated to developing AI solutions to tackle humanity's most pressing challenges.
        </Typography>
        <Typography sx={{ marginBottom: 2 }}>
        The funds raised will be used primarily for two purposes: the platform's infrastructure and my personal sustenance. I am a family man, a father, a husband, and a cat's best friend (not owner).
        Both infrastructure's expenditure and personal expenses are to be made <b>COMPLETELY</b> transparent. Every cent spent will be communicated to the broader community, without <b>EVER</b> mentioning private details, by default.
        </Typography>
        <Typography sx={{ marginBottom: 2 }}>
        As a disclaimer, I will <b>NEVER</b> ask for <b>ANY</b> personal information regarding this account via email or any other medium, to protect against scammers. Additionally, I will <b>NEVER</b> disclose any personal information.
        </Typography>
        <Typography sx={{ marginBottom: 2 }}>
        Below is my Bank account information, in order to receive wire transfers, for now, it's the most efficient way I have to receive the funds since I'm from <b>Paraguay 🇵🇾</b>
        </Typography>
        <Typography sx={{ marginBottom: 2 }}>
        <strong>Bank Name:</strong> <br />Banco GNB
        </Typography>
        <Typography sx={{ marginBottom: 2 }}>
        <strong>Account Number:</strong><br /> 13026832002
        </Typography>
        <Typography sx={{ marginBottom: 2 }}>
        <strong>SWIFT Code:</strong><br /> BGNBPYPX
        </Typography>
        <Typography sx={{ marginBottom: 2 }}>
        <strong>Bank Address:</strong><br /> Avenida Mariscal Lopez y Torreani, Viera
        </Typography>
        <Typography sx={{ marginBottom: 2 }}>
        No fees will be charged to you. I will cover any transfer fees.
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

export default BankInfoModal;
