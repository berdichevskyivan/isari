import React, { useState } from 'react';
import '../../App.css';
import { styled } from '@mui/material/styles';
import { Modal, Typography, Box, Button, IconButton, TextField } from '@mui/material';

const StyledTextField = styled(TextField)({
    width: '250px', 
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

function FeedbackModal({ open, onClose }) {
    const [feedback, setFeedback] = useState("");

    return (
        <Modal open={open} onClose={onClose}>
            <Box className="feedback-modal-container">
                <Typography variant="h6" component="h2" sx={{ marginBottom: 1, fontFamily: 'Orbitron' }}>
                    Feedback
                </Typography>
                <StyledTextField
                    fullWidth
                    multiline
                    variant="outlined"
                    placeholder="Your feedback..."
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    sx={{ marginBottom: 2, border: '1px solid turquoise' }}
                />
                <Button variant="contained" sx={{ fontFamily: 'Orbitron', background: 'black', border: '1px solid blue'}} onClick={() => submitFeedback(feedback)}>
                    Submit
                </Button>
            </Box>
        </Modal>
    );
}

export default FeedbackModal;